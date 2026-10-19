// The airport, one moment worth having (plan: thailand/boat-trip.md, "Airport"): no check-in, no gate. Her suitcase goes
// on the belt (tap it, or drag it there) and slides into the x-ray, and the screen beside it shows what's inside as
// glowing blue outlines: everything she packed, even Gan asleep or the spinning fan. The officer laughs and stamps her
// boarding pass. The glass doors slide open onto the plane; tap its door and the family hop up the stairs.
import { CanvasTexture, Color, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, wobble } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../characters/animal'
import type { Look } from '../../characters/looks'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import { merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'
import { sfx } from '../../sfx'
import { drawXray } from '../drawings'
import { buildSuitcase, type Suitcase } from '../props'
import { TALK } from '../talk'
import { buildPlaneOutside, type PlaneOutside } from '../vehicles/plane'
import { Stage, type AnchorSpot, type LegEvents, type Rider } from './stage'

export const AIRPORT_ANCHORS: AnchorInfo[] = [
  { id: 'suitcase', label: 'Suitcase', kind: 'thing' },
  { id: 'screen', label: 'X-ray screen', kind: 'thing' },
  { id: 'officer', label: 'Officer', kind: 'thing' },
  { id: 'belt', label: 'Belt', kind: 'thing' },
  { id: 'plane-door', label: 'Plane door', kind: 'thing' },
  { id: 'plane', label: 'Plane', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
]

/** A friendly officer (a background figure: sounds and animation, no voice): a lavender elephant in a navy shirt. */
const OFFICER: Look = { species: 'elephant', height: 1.45, fur: '#C2BCE0', light: '#E8E4F6', dark: '#A39CCB', ear: '#FFB8CC', outfit: { kind: 'shirt', color: '#4A5A9C' }, extras: ['cap'] }

// The hall (meters): the belt runs along +x into the x-ray; the glass wall with its sliding doors at GLASS_X; the plane
// outside on the apron.
const BELT = { x0: -3.4, x1: 2.1, y: 0.62, z: 0 }
const XRAY = { x0: -0.9, x1: 0.7 }
const GLASS_X = 3.6
const PLANE_AT = new Vector3(11.5, 0, -2.6)
const START = { kaylee: [-3.0, 1.15], ji: [-4.3, 0.45], nick: [-4.0, 1.65], suitcase: [-2.45, 0.9] }

type Phase = 'belt' | 'scan' | 'out' | 'doors' | 'board' | 'gone'

const tmp = new Vector3()

export class Airport extends Stage {
  private suitcase: Suitcase
  private plane: PlaneOutside
  private officer: Rig
  private officerHop = 1
  private screen: { canvas: HTMLCanvasElement; tex: CanvasTexture; mesh: Mesh; wiggle: number }
  private riders: Record<'kaylee' | 'ji' | 'nick', Rider>
  private dashes = new Group()
  private doorsL: Group
  private doorsR: Group
  private phase: Phase = 'belt'
  private phaseT = 0
  private slide = 0
  private shown = 0
  private laughed = false
  private stamped = false
  private doorK = 0
  private planeBounce = 1
  private drag: { x: number; y: number; on: boolean } | null = null

  constructor(renderer: WebGLRenderer, events: LegEvents, private packed: string[]) {
    super(renderer, events)
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    this.rig.fov = 34
    // ---- The hall: floor, back wall, the belt and the x-ray, the screen on its stand ----
    scene.add(
      solid(merge([P.box(10.5, 0.1, 14, '#F4EEFF', { at: [-1.6, -0.05, 3.5] }), ...Array.from({ length: 10 }, (_, i) => P.box(0.03, 0.005, 13.9, '#E2DAF6', { at: [-6.6 + i * 1.05, 0.002, 3.5] }))]), bag, 0),
      solid(merge([P.box(10.5, 3.4, 0.2, '#FFF7F0', { at: [-1.6, 1.7, -3.45] }), P.box(10.5, 0.3, 0.22, PAL.lavender, { at: [-1.6, 3.2, -3.44] }), P.rbox(2.2, 0.6, 0.08, 0.06, PAL.sky, { at: [-3.6, 2.5, -3.34] }), P.rbox(2.2, 0.6, 0.08, 0.06, PAL.mint, { at: [0.8, 2.5, -3.34] })]), bag, 2),
      // The apron outside: a lavender-grey tarmac with yellow lines.
      solid(merge([P.box(30, 0.1, 22, '#C9C4DE', { at: [GLASS_X + 15, -0.06, 1] }), ...Array.from({ length: 6 }, (_, i) => P.box(1.6, 0.01, 0.16, PAL.butter, { at: [GLASS_X + 2 + i * 3, 0.002, 2.4] }))]), bag, 0),
    )
    scene.add(
      solid(
        merge([
          P.box(BELT.x1 - BELT.x0, BELT.y - 0.06, 0.95, '#B9B2CC', { at: [(BELT.x0 + BELT.x1) / 2, (BELT.y - 0.06) / 2, BELT.z] }),
          P.box(BELT.x1 - BELT.x0, 0.06, 0.8, '#4A4458', { at: [(BELT.x0 + BELT.x1) / 2, BELT.y - 0.03, BELT.z] }),
          // The x-ray tunnel, with flaps at both ends.
          P.rbox(XRAY.x1 - XRAY.x0, 1.1, 1.25, 0.1, PAL.lavenderDark, { at: [(XRAY.x0 + XRAY.x1) / 2, BELT.y + 0.55, BELT.z], scale: [1, 1, 1] }),
          ...[XRAY.x0 - 0.01, XRAY.x1 + 0.01].flatMap((x) => Array.from({ length: 5 }, (_, i) => P.box(0.02, 0.62, 0.15, '#5A6FB0', { at: [x, BELT.y + 0.32, -0.36 + i * 0.18] }))),
          // The screen's stand.
          P.cyl(0.06, 0.08, 1.4, '#D8D2E6', { at: [-0.1, 0.7, -1.25] }),
          P.cyl(0.35, 0.4, 0.08, '#D8D2E6', { at: [-0.1, 0.04, -1.25] }),
          P.rbox(1.42, 0.98, 0.1, 0.05, PAL.ink, { at: [-0.1, 1.85, -1.27] }),
        ]),
        bag,
        2,
      ),
    )
    // The belt's moving stripes.
    for (let x = BELT.x0; x < BELT.x1; x += 0.3) this.dashes.add(new Mesh(bag.add(P.box(0.06, 0.005, 0.76, '#7E7894', { at: [x, BELT.y + 0.003, BELT.z] })), bag.add(new MeshBasicMaterial({ color: '#7E7894' }))))
    scene.add(this.dashes)
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 256
    const tex = bag.add(new CanvasTexture(canvas))
    tex.colorSpace = SRGBColorSpace
    const mesh = new Mesh(bag.add(new PlaneGeometry(1.3, 0.86)), bag.add(new MeshBasicMaterial({ map: tex })))
    mesh.position.set(-0.1, 1.85, -1.21)
    mesh.userData.pick = 'screen'
    scene.add(mesh)
    this.screen = { canvas, tex, mesh, wiggle: 1 }
    drawXray(canvas, this.packed, 0, 0)
    tex.needsUpdate = true
    // ---- The glass wall and its sliding doors ----
    const glass = bag.add(new MeshBasicMaterial({ color: '#CFEFFF', transparent: true, opacity: 0.3, depthWrite: false }))
    scene.add(solid(merge([P.box(0.12, 3.4, 0.12, '#D8D2E6', { at: [GLASS_X, 1.7, -3.4] }), P.box(0.12, 0.12, 6.4, '#D8D2E6', { at: [GLASS_X, 3.35, -0.2] }), ...[-1.4, 2.2].map((z) => P.box(0.12, 3.4, 0.12, '#D8D2E6', { at: [GLASS_X, 1.7, z] }))]), bag, 1.5))
    scene.add(new Mesh(bag.add(P.box(0.03, 3.2, 1.9, '#FFFFFF', { at: [GLASS_X, 1.6, -2.4] })), glass))
    const door = (z: number) => {
      const g = new Group()
      g.position.set(GLASS_X, 0, z)
      g.add(new Mesh(bag.add(P.box(0.04, 2.6, 1.75, '#FFFFFF', { at: [0, 1.3, 0] })), glass))
      g.add(solid(merge([P.box(0.06, 2.6, 0.06, '#D8D2E6', { at: [0, 1.3, z < 0.4 ? -0.88 : 0.88] }), P.box(0.06, 0.06, 1.75, '#D8D2E6', { at: [0, 2.6, 0] })]), bag, 1.5))
      scene.add(g)
      return g
    }
    this.doorsL = door(-0.45)
    this.doorsR = door(1.3)
    // ---- The plane outside ----
    this.plane = buildPlaneOutside(bag)
    this.plane.root.position.copy(PLANE_AT)
    this.plane.root.userData.pick = 'plane'
    scene.add(this.plane.root)
    // ---- The officer, the suitcase and the family ----
    this.officer = buildAnimal(OFFICER, bag)
    this.officer.root.position.set(1.35, 0, -1.0)
    this.officer.root.rotation.y = -0.35
    this.officer.root.userData.pick = 'officer'
    scene.add(this.officer.root)
    this.suitcase = buildSuitcase(bag)
    this.suitcase.root.position.set(START.suitcase[0], 0, START.suitcase[1])
    this.suitcase.root.rotation.y = -Math.PI / 2
    this.suitcase.root.scale.setScalar(0.8)
    this.suitcase.root.userData.pick = 'suitcase'
    scene.add(this.suitcase.root)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const c = this.riders[id]
      scene.add(c.root)
      const [x, z] = START[id]
      this.put(c, x, 0, z, 'stand', 35)
    }
    setTimeout(() => this.phase === 'belt' && this.events.say(TALK.airport.start), 500)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.suitcase.root, this.screen.mesh, this.officer.root, this.plane.root, ...Object.values(this.riders).map((r) => r.root)]
  }

  pointerDown(x?: number, y?: number) {
    super.pointerDown()
    if (this.phase === 'belt' && x !== undefined && y !== undefined && this.pick(x, y) === 'suitcase') this.drag = { x, y, on: false }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    const d = this.drag
    if (!held || !d || this.phase !== 'belt') return
    if (!d.on && Math.hypot(x - d.x, y - d.y) > 12) d.on = true
    if (!d.on) return
    const p = this.floorAt(x, y, 0.35)
    if (p) this.suitcase.root.position.set(clamp(p.x, -5, 2), 0.35, clamp(p.z, -1.2, 2))
  }
  pointerUp() {
    const d = this.drag
    this.drag = null
    if (!d?.on) return
    const p = this.suitcase.root.position
    if (Math.abs(p.z - BELT.z) < 1.3 && p.x < XRAY.x0) this.onBelt()
    else this.suitcase.root.position.set(START.suitcase[0], 0, START.suitcase[1])
  }

  /** The point on a level plane at height `y` under the finger. */
  private floorAt(x: number, y: number, h: number) {
    const r = this.rig.camera
    const ndc = this.ndc(x, y)
    const near = new Vector3(ndc.x, ndc.y, -1).unproject(r)
    const far = new Vector3(ndc.x, ndc.y, 1).unproject(r)
    const dir = far.sub(near)
    if (Math.abs(dir.y) < 1e-6) return null
    const k = (h - near.y) / dir.y
    return k > 0 ? near.addScaledVector(dir, k) : null
  }

  protected onTap(id: string | null) {
    switch (id) {
      case 'suitcase':
        if (this.phase === 'belt') this.onBelt()
        else {
          sfx.boing()
          this.suitcase.body.scale.y = 0.85
        }
        return
      case 'belt':
        sfx.pop()
        this.slide += 0.05
        return
      case 'screen':
        this.screen.wiggle = 0
        sfx.boop()
        return
      case 'officer':
        this.officerHop = 0
        sfx.haha()
        return
      case 'plane-door':
        if (this.phase === 'doors') this.board()
        else this.bouncePlane()
        return
      case 'plane':
        if (this.phase === 'doors') this.board()
        else this.bouncePlane()
        return
      case 'family:ji':
      case 'family:nick':
      case 'family:kaylee':
        this.riders[id.slice(7) as 'ji'].react('hop')
        sfx.boing()
        return
    }
  }

  private bouncePlane() {
    this.planeBounce = 0
    sfx.boop()
  }

  /** On the belt, and into the x-ray. */
  private onBelt() {
    if (this.phase !== 'belt') return
    this.phase = 'scan'
    this.phaseT = 0
    const s = this.suitcase.root
    s.position.set(BELT.x0 + 0.5, BELT.y, BELT.z)
    s.rotation.y = 0
    sfx.thump()
    sfx.whir()
    this.riders.kaylee.react('hop')
  }

  /** Up the stairs: walk to the foot, hop up, into the plane. */
  private board() {
    this.phase = 'board'
    this.phaseT = 0
    const steps = this.plane.steps.map((p) => this.plane.root.localToWorld(new Vector3(...p)))
    const foot = steps[0].clone().setY(0).add(new Vector3(0, 0, 0.7))
    const top = steps[steps.length - 1]
    const order: ('kaylee' | 'ji' | 'nick')[] = ['kaylee', 'ji', 'nick']
    order.forEach((id, i) => {
      const c = this.riders[id]
      const door = this.plane.root.localToWorld(new Vector3(...this.plane.doorAt)).setY(top.y + 0.1)
      const mid = steps[Math.floor(steps.length / 2)]
      // Hop, hop, hop: to the foot of the stairs, halfway up, the top, and in.
      this.hop(c, this.scene, foot.clone().add(new Vector3(0, 0, i * 0.5)), { delay: i * 0.45, dur: 0.6, arc: 0.5, face: 180, done: () =>
        this.hop(c, this.scene, mid, { dur: 0.45, arc: 0.4, face: 180, done: () =>
          this.hop(c, this.scene, top, { dur: 0.45, arc: 0.4, face: 180, done: () =>
            this.hop(c, this.scene, door.clone().add(new Vector3(0, 0, -0.6)), { dur: 0.4, arc: 0.3, face: 180, done: () => {
              c.root.visible = false
              if (id === 'nick') {
                this.phase = 'gone'
                setTimeout(() => this.events.done('takeoff'), 600)
              }
            } }) }) }) })
    })
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    this.phaseT += dt
    const s = this.suitcase.root
    const ph = this.phase
    // The belt runs while the suitcase is on it.
    const running = ph === 'scan' || ph === 'out'
    if (running) this.slide += dt * 0.6
    for (const d of this.dashes.children) d.position.x = ((this.slide % 0.3) + 0.3) % 0.3
    if (ph === 'scan') {
      // In it goes; inside, the screen shows her things one by one; the officer laughs and stamps her pass.
      s.position.x = Math.min(0.0, BELT.x0 + 0.5 + this.phaseT * 1.3)
      s.visible = s.position.x < XRAY.x0 + 0.35
      const inside = Math.max(0, this.phaseT - 2.2)
      const n = Math.min(this.packed.length, Math.floor(inside / 0.4))
      if (n > this.shown) {
        this.shown = n
        sfx.boop()
      }
      if (this.shown >= this.packed.length && !this.laughed && inside > this.packed.length * 0.4 + 0.6) {
        this.laughed = true
        this.officerHop = 0
        sfx.haha()
        this.events.say(this.packed.includes('gan') ? TALK.airport.gan : TALK.airport.laugh)
      }
      if (this.laughed && !this.stamped && inside > this.packed.length * 0.4 + 2.0) {
        this.stamped = true
        this.officerHop = 0
        sfx.stamp()
        this.phase = 'out'
        this.phaseT = 0
      }
    } else if (ph === 'out') {
      s.visible = true
      s.position.x = Math.min(BELT.x1 - 0.4, XRAY.x1 + 0.3 + this.phaseT * 1.2)
      if (this.phaseT > 1.6) {
        this.phase = 'doors'
        this.phaseT = 0
        sfx.fwip()
        this.events.say(TALK.airport.plane)
        // Daddy takes the suitcase.
        s.visible = false
        this.riders.nick.react('wave')
      }
    }
    // The glass doors slide open.
    this.doorK = clamp(this.doorK + (ph === 'doors' || ph === 'board' || ph === 'gone' ? dt / 0.9 : 0))
    this.doorsL.position.z = -0.45 - 1.6 * this.doorK
    this.doorsR.position.z = 1.3 + 1.4 * this.doorK
    // The plane's door swings open once the glass doors are.
    this.plane.door.rotation.y = -1.6 * this.doorK
    this.planeBounce = Math.min(1, this.planeBounce + dt / 0.6)
    this.plane.root.position.y = bell(this.planeBounce) * 0.25
    // The screen (redrawn while something moves on it).
    const scr = this.screen
    scr.wiggle = Math.min(1, scr.wiggle + dt / 0.5)
    if (this.shown > 0) {
      drawXray(scr.canvas, this.packed, this.shown, t + wobble(scr.wiggle, 3) * 0.3)
      scr.tex.needsUpdate = true
    }
    scr.mesh.scale.setScalar(1 + wobble(scr.wiggle, 3) * 0.04)
    // The officer breathes, leans in to look, hops when he laughs.
    this.officerHop = Math.min(1, this.officerHop + dt / 0.55)
    const o = this.officer
    const b = 1 + Math.sin(t * 2.6) * 0.018
    o.body.scale.set(1 / Math.sqrt(b), b, 1 / Math.sqrt(b))
    o.root.position.y = bell(this.officerHop) * 0.22
    o.armR.rotation.x = -bell(this.officerHop) * 1.6
    o.head.rotation.x = ph === 'scan' ? 0.25 : 0
    for (const c of Object.values(this.riders)) {
      if (c.root.visible) c.lookAt(s.position.x, 0.8, s.position.z)
      c.update(dt, t)
    }
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const tall = this.w < this.h
    const out = this.phase === 'doors' || this.phase === 'board' || this.phase === 'gone'
    if (out) return { center: new Vector3(6.6, 1.5, -0.2), half: tall ? new Vector3(3.6, 1.8, 2.6) : new Vector3(5.6, 1.6, 2.4), yaw: 6, pitch: 15, minDist: 6 }
    // At the belt with the family, then along with the suitcase to the x-ray, the screen and the officer.
    const scan = this.phase !== 'belt'
    if (tall) return { center: new Vector3(scan ? -0.3 : -2.6, 1.1, -0.1), half: new Vector3(2.3, 1.15, 1.7), yaw: 6, pitch: 22, minDist: 5 }
    return { center: new Vector3(scan ? -1.0 : -1.9, 1.1, -0.1), half: new Vector3(3.6, 1.1, 1.6), yaw: 6, pitch: 22, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const ph = this.phase
    switch (id) {
      case 'suitcase':
        return this.suitcase.root.visible && ph !== 'gone' ? { at: this.suitcase.root.getWorldPosition(new Vector3()).setY(this.suitcase.root.position.y + 0.25), r: 0.4, glow: ph === 'belt', prio: 3 } : null
      case 'screen':
        return { at: this.screen.mesh.getWorldPosition(new Vector3()), r: 0.55 }
      case 'officer':
        return { at: this.officer.root.getWorldPosition(new Vector3()).setY(0.85), r: 0.38 }
      case 'belt':
        return { at: new Vector3(BELT.x0 + 0.5, BELT.y, BELT.z + 0.3), r: 0.3 }
      case 'plane-door':
        return ph === 'doors' || ph === 'board' ? { at: this.plane.root.localToWorld(new Vector3(...this.plane.doorAt)), r: 0.6, glow: ph === 'doors', prio: 3 } : null
      case 'plane':
        return { at: this.plane.root.localToWorld(new Vector3(1.5, 2.6, 1.3)), r: 1.5 }
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as 'ji']
      if (!c || !c.root.visible || ph === 'board' || ph === 'gone') return null
      return { at: c.root.getWorldPosition(tmp).clone().setY(c.height * 0.55), r: c.height * 0.3, max: 120 }
    }
    return null
  }

  protected hintAt() {
    if (this.phase === 'belt') return this.suitcase.root.getWorldPosition(new Vector3()).setY(0.4)
    if (this.phase === 'doors') return this.plane.root.localToWorld(new Vector3(...this.plane.doorAt))
    return null
  }

  qa() {
    return { leg: 'airport', phase: this.phase, shown: this.shown, packed: [...this.packed], stamped: this.stamped, touches: this.touches }
  }
}
