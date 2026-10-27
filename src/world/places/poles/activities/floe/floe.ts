// Ice Floe Hop (greybox 2, plan: planning/around-the-world/poles.html): the North Pole is frozen sea, and the ice
// floats. Pola the polar bear cub is far from Mama Bear across the floating sea ice; Kaylee flings him floe to floe.
//
// The toy (core verb): grab Pola, pull back and let go. He crouches deeper the further she pulls (a dotted arc and a
// ring show where he'll land), leaps, and lands with a thump: the floe dips under his weight, bobs and leans toward
// where he stands. A landing near a floe still lands on it (`magnet`). A miss is a happy belly-flop: he swims to the
// nearest floe (or the one she taps), climbs out and shakes the water off. The verb deepens three ways along one course
// (layout.ts): big steady floes, floes that drift and turn (and little tippy ones he slides off), then summer's small
// floes she can push together with her finger. Mama Bear waits on the big ice at the end; every landing leaves paw
// prints, so the path she made stays on the water.
//
// Built for engine3d/View3D.tsx; nothing here comes from Thailand. The fling and the floes are feel-lab knobs (?feel=1).
import { CircleGeometry, Color, ExtrudeGeometry, Fog, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, RingGeometry, Scene, Shape, SphereGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, smooth, sounds } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { sfx } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { bake, blobShadow, merge, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import { Bear } from './bear'
import { layout, type FloeSpec, type Stage } from './layout'
import type { FloeSection } from './sections'

const FILE = 'src/world/places/poles/activities/floe/floe.ts'
/** The fling: how her pull turns into a leap (live in the feel lab: ?feel=1 on any of the activity's links). */
const FLING = knobs('fling', 'Fling Pola', FILE, {
  pull: { value: 170, min: 60, max: 400, step: 5, label: 'Full pull', unit: 'px', note: 'how far back her finger goes for the longest fling (never more than 30% of a small screen)' },
  dead: { value: 22, min: 0, max: 80, step: 1, label: 'Dead zone', unit: 'px', note: 'a pull shorter than this is only a tap (he giggles)' },
  reach: { value: 6.5, min: 2, max: 14, step: 0.1, label: 'Power (reach)', unit: 'm', note: 'how far a full pull flings him' },
  curve: { value: 1.3, min: 0.5, max: 3, step: 0.05, label: 'Power curve', note: '1 = even; higher = small pulls make small hops and the long ones come at the end' },
  arc: { value: 0.4, min: 0.1, max: 1.2, step: 0.02, label: 'Arc height', unit: '× dist', note: 'how high he flies, as a share of how far' },
  minArc: { value: 0.8, min: 0.1, max: 3, step: 0.05, label: 'Lowest arc', unit: 'm', note: 'even a short hop goes at least this high' },
  hang: { value: 0.85, min: 0.3, max: 2, step: 0.05, label: 'Hang time', unit: 's', note: 'seconds in the air for a full-reach fling (shorter ones are quicker)' },
  magnet: { value: 0.8, min: 0, max: 2.5, step: 0.05, label: 'Landing help', unit: 'm', note: 'a landing this close to a floe gets pulled onto it (0 = none)' },
  crouch: { value: 1, min: 0, max: 2, step: 0.05, label: 'Crouch', unit: '×', note: 'how much he squashes down as she pulls' },
})
/** The floes and the sea. */
const FLOES = knobs('floes', 'Floes and water', FILE, {
  dip: { value: 0.12, min: 0, max: 0.4, step: 0.01, label: 'Dip', unit: 'm', note: 'how far a big floe sinks with Pola on it (little floes sink more)' },
  thump: { value: 1.1, min: 0, max: 4, step: 0.05, label: 'Landing thump', unit: 'm/s', note: 'how hard a landing pushes the floe down' },
  tip: { value: 8, min: 0, max: 25, step: 0.5, label: 'Tip', unit: '°', note: 'how far a floe leans with Pola at its edge' },
  bob: { value: 1.2, min: 0.4, max: 4, step: 0.05, label: 'Bob speed', unit: 'Hz', note: 'how quickly a floe bobs up and down' },
  damp: { value: 0.16, min: 0.02, max: 1, step: 0.01, label: 'Bob damping', note: 'how soon the bobbing dies away (1 = no bounce)' },
  tippy: { value: 0.55, min: 0.2, max: 1.2, step: 0.01, label: 'Tippy edge', note: 'on a little floe, landing further out than this share of its size slides him off (above 1: never)' },
  drift: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Drift', unit: '×', note: 'how far and fast the drifting floes go' },
  swim: { value: 1.8, min: 0.5, max: 4, step: 0.1, label: 'Swim speed', unit: 'm/s', note: 'how fast he paddles to a floe' },
  push: { value: 5, min: 1, max: 15, step: 0.5, label: 'Push grip', unit: '/s', note: 'how closely a floe she pushes follows her finger' },
})

export interface FloeStart {
  section: FloeSection
  layout: number
}
export interface FloeEvents {
  /** Pola reached the next stage (the address bar follows). */
  section(s: FloeSection): void
  /** He climbed out and shook: drops on the screen. */
  shake(): void
  /** Home with Mama. */
  home(): void
}

export const FLOE_ANCHORS: AnchorInfo[] = [
  { id: 'pola', label: 'Pola: pull him back and let go', kind: 'thing' },
  { id: 'mama', label: 'Mama Bear', kind: 'thing' },
]

/** Floes' top above the water at rest, and how thick they are. */
const TOP = 0.3
const THICK = 0.6
/** However hard he lands, a floe's top stays this far out of the water (it never goes under). */
const DRY = 0.14
/** Where Pola floats while he swims. */
const SWIM_Y = -0.42
const DEG = Math.PI / 180
/** No fling for this long: Pola glows and hops ("grab me"). */
const HINT_S = 8
const ORDER: FloeSection[] = ['story', 'steady', 'drift', 'melt', 'mama']
const STAGE_SECTION: Record<Stage, FloeSection> = { start: 'steady', steady: 'steady', drift: 'drift', melt: 'melt', mama: 'mama' }
const SKY = '#E6F3FD'
const ICE = '#D9E0EA'
const ICE_MAMA = '#E4EAF2'
const PRINT = '#97A3B8'

type Mode = 'stand' | 'aim' | 'fly' | 'flop' | 'swim' | 'climb' | 'slide' | 'walk'

interface Floe {
  spec: FloeSpec
  i: number
  group: Group
  spinner: Group
  pts: [number, number][]
  /** Mean and smallest radius. */
  r: number
  rMin: number
  x: number
  z: number
  vx: number
  vz: number
  yaw: number
  /** Heave (m) and its speed; lean about x and z (rad) and their speeds. */
  h: number
  hv: number
  tx: number
  txv: number
  tz: number
  tzv: number
  /** Leaning hard to slide him off (seconds left). */
  tipOff: number
  tipDir: Vector2
  prints: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const v2 = new Vector2()

/** Footprint coordinates of a world point on a floe (meters from its middle, before its turn). */
function toLocal(f: Floe, x: number, z: number) {
  const dx = x - f.x
  const dz = z - f.z
  const c = Math.cos(f.yaw)
  const s = Math.sin(f.yaw)
  return { x: dx * c - dz * s, z: dx * s + dz * c }
}
function toWorld(f: Floe, lx: number, lz: number) {
  const c = Math.cos(f.yaw)
  const s = Math.sin(f.yaw)
  return { x: f.x + lx * c + lz * s, z: f.z - lx * s + lz * c }
}
function inside(pts: [number, number][], x: number, z: number) {
  let c = false
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, zi] = pts[i]
    const [xj, zj] = pts[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}
/** The nearest point on the floe's edge (footprint coordinates) and how far it is. */
function nearestEdge(pts: [number, number][], x: number, z: number) {
  let best = { x: 0, z: 0, d: Infinity }
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [ax, az] = pts[j]
    const [bx, bz] = pts[i]
    const ex = bx - ax
    const ez = bz - az
    const k = clamp(((x - ax) * ex + (z - az) * ez) / (ex * ex + ez * ez))
    const px = ax + ex * k
    const pz = az + ez * k
    const d = Math.hypot(x - px, z - pz)
    if (d < best.d) best = { x: px, z: pz, d }
  }
  return best
}

export class FloeHop implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private water: Water
  private floes: Floe[] = []
  private mamaFloe: Floe
  private pola: Bear
  private mama: Bear
  private shadow: Mesh
  private foam: Particles
  private spray: Particles
  private dots: Mesh[] = []
  private ring: Mesh
  private ringMat: MeshBasicMaterial
  private printGeo: ReturnType<typeof merge>
  private printMat: MeshBasicMaterial
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private driftT = 0
  private section: FloeSection

  // ---- Pola.
  private mode: Mode = 'stand'
  private modeT = 0
  /** The floe he stands on (null: in the air or the sea), and where on it (footprint coordinates). */
  private on: Floe | null = null
  private at = { x: 0, z: 0 }
  /** Where he is in the world (kept every frame, whatever he's on). */
  private pos = new Vector3()
  private face = 0
  private faceGoal = 0
  private landT = -1
  // A fling: from, the raw spot she aimed at, the (helped) spot he's heading for, how long and how high.
  private from = new Vector3()
  private aimAt = new Vector3()
  private end = new Vector3()
  private dur = 1
  private apex = 1
  private swimTo: Floe | null = null
  private climbFrom = new Vector3()
  private climbTo = { f: null as Floe | null, x: 0, z: 0 }
  private homeT = -1

  // ---- Her finger.
  private grab: 'pola' | 'floe' | null = null
  private down = { x: 0, y: 0 }
  private downHit = new Vector3()
  private power = 0
  private pullPx = 0
  private aimDir = new Vector2(0, -1)
  private range = 0
  private held: Floe | null = null
  private heldOffset = new Vector2()
  private heldGoal = new Vector2()
  private lastTouch = 0
  private lastFling = 0

  // ---- Counts (QA and the pacing check).
  private counts = { flings: 0, landings: 0, flops: 0, slides: 0, swims: 0, pushes: 0, taps: 0, giggles: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: FloeStart,
    private events: FloeEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 60, 200)
    applyBands()
    this.rig.fov = 34
    this.rig.lag = 0.45

    this.water = new Water({ size: 600, deep: '#5FA6DE', shallow: '#78BCEA', haze: SKY, hazeNear: 55, hazeFar: 190 }, bag)
    scene.add(this.water.mesh)

    for (const spec of layout(start.layout)) this.floes.push(this.makeFloe(spec, this.floes.length))
    this.mamaFloe = this.floes.find((f) => f.spec.stage === 'mama')!

    this.pola = new Bear(bag, 1.15)
    this.mama = new Bear(bag, 1.7)
    this.shadow = blobShadow(0.45, bag)
    scene.add(this.shadow)
    // Mama on the far side of her ice, facing the way Pola comes.
    this.mamaFloe.spinner.add(this.mama.root)
    const m = toLocal(this.mamaFloe, this.mamaFloe.x, this.mamaFloe.z - 1.6)
    this.mama.root.position.set(m.x, TOP, m.z)
    // (Facing her, whichever way the ice is turned.)
    this.mama.root.rotation.y = -this.mamaFloe.yaw

    this.foam = new Particles({ kind: 'foam', count: 80, opacity: 0.85 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 160 }, bag)
    scene.add(this.foam.mesh, this.spray.mesh)

    // The aim: a dotted arc and a ring where he'll land.
    const dotGeo = bag.add(new SphereGeometry(0.08, 10, 8))
    const dotMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF' }))
    for (let i = 0; i < 12; i++) {
      const d = new Mesh(dotGeo, dotMat)
      d.visible = false
      this.dots.push(d)
      scene.add(d)
    }
    this.ringMat = bag.add(new MeshBasicMaterial({ color: '#FF4F9A', transparent: true, opacity: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6 }))
    this.ring = new Mesh(bag.add(new RingGeometry(0.34, 0.5, 32)), this.ringMat)
    this.ring.rotation.x = -Math.PI / 2
    this.ring.renderOrder = 2
    this.ring.visible = false
    scene.add(this.ring)

    // A paw print: a pad and three toes, flat on the ice.
    this.printGeo = merge(
      [bake(new CircleGeometry(0.1, 14), PRINT, { scale: [1, 1.15, 1] }), ...[-0.1, 0, 0.1].map((x) => bake(new CircleGeometry(0.04, 10), PRINT, { at: [x, 0.15 - Math.abs(x) * 0.4, 0] }))].map((g) => g.rotateX(-Math.PI / 2)),
    )
    bag.add(this.printGeo)
    this.printMat = bag.add(new MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -3, depthWrite: false }))

    // Where the link starts: the stage's first floe (Mama's ice for `mama`), with paw prints on the way there.
    this.section = start.section
    const first = start.section === 'drift' || start.section === 'melt' ? this.floes.find((f) => f.spec.stage === start.section && f.spec.rest)! : start.section === 'mama' ? this.mamaFloe : this.floes[0]
    for (const f of this.floes) {
      if (f.i >= first.i) break
      // One floe a row on the way (the first of each), as if she'd come that way.
      const prev = this.floes[f.i - 1]
      if (f.i === 0 || !prev || Math.abs(prev.spec.z - f.spec.z) > 1) this.addPrints(f, 0, 0)
    }
    const l = toLocal(first, first.x, first.z + (first === this.mamaFloe ? 2.4 : 0))
    this.attach(first, l.x, l.z)
    this.face = this.faceGoal = 0
    if (start.section === 'mama') this.goHome()
    if (start.section === 'story') this.mama.wave()

    this.unwatch = watch('fling', () => ({
      'pull (px)': [this.pullPx, FLING.pull * 1.5],
      'power': [this.power, 1],
      'height (m)': [this.mode === 'fly' ? this.pos.y : 0, 4],
      'floe dip (m)': [this.on ? -this.on.h : 0, 0.5],
    }))
  }

  // ---------------------------------------------------------------- building

  private makeFloe(spec: FloeSpec, i: number): Floe {
    // The outline drawn as a shape in x and -z, pushed down `THICK` with a soft rounded edge.
    const shape = new Shape(spec.pts.map(([x, z]) => new Vector2(x, -z)))
    const geo = new ExtrudeGeometry(shape, { depth: THICK - 0.12, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.08, bevelSegments: 2, curveSegments: 1 })
    geo.rotateX(-Math.PI / 2)
    // (The extrusion now runs up from y = 0: put its top at TOP.)
    geo.translate(0, TOP - (THICK - 0.12) - 0.06, 0)
    const body = solid(bake(geo, spec.stage === 'mama' ? ICE_MAMA : ICE), this.bag, 2.5)
    const group = new Group()
    const spinner = new Group()
    spinner.add(body)
    group.add(spinner)
    this.scene.add(group)
    const rs = spec.pts.map(([x, z]) => Math.hypot(x, z))
    const f: Floe = {
      spec,
      i,
      group,
      spinner,
      pts: spec.pts,
      r: rs.reduce((a, b) => a + b, 0) / rs.length,
      rMin: Math.min(...rs),
      x: spec.x,
      z: spec.z,
      vx: 0,
      vz: 0,
      yaw: spec.yaw,
      h: 0,
      hv: 0,
      tx: 0,
      txv: 0,
      tz: 0,
      tzv: 0,
      tipOff: 0,
      tipDir: new Vector2(),
      prints: 0,
    }
    this.placeFloe(f)
    return f
  }

  private addPrints(f: Floe, x: number, z: number) {
    const m = new Mesh(this.printGeo, this.printMat)
    m.position.set(x, TOP + 0.004, z)
    m.rotation.y = Math.random() * Math.PI * 2
    m.renderOrder = 1
    f.spinner.add(m)
    f.prints++
  }

  // ---------------------------------------------------------------- Pola on and off the floes

  /** Puts him on a floe at a spot in its footprint. */
  private attach(f: Floe, x: number, z: number) {
    this.on = f
    this.at = { x, z }
    f.spinner.add(this.pola.root)
    this.pola.root.position.set(x, TOP, z)
  }
  private detach() {
    if (!this.on) return
    this.pola.root.getWorldPosition(this.pos)
    this.scene.add(this.pola.root)
    this.pola.root.position.copy(this.pos)
    this.on = null
  }
  private setMode(m: Mode) {
    this.mode = m
    this.modeT = 0
  }

  /** The floe a world spot is on (the nearest-in-line one if several), or null. */
  private floeAt(x: number, z: number) {
    for (const f of this.floes) {
      const l = toLocal(f, x, z)
      if (Math.abs(l.x) < f.r * 1.3 && Math.abs(l.z) < f.r * 1.3 && inside(f.pts, l.x, l.z)) return f
    }
    return null
  }

  /** Where a fling aimed at (x, z) lands: on a floe, or helped onto one within `magnet` meters, or in the sea. */
  private landing(x: number, z: number) {
    const hit = this.floeAt(x, z)
    if (hit) return { f: hit, ...toLocal(hit, x, z) }
    let best: { f: Floe; x: number; z: number; d: number } | null = null
    for (const f of this.floes) {
      if (Math.hypot(f.x - x, f.z - z) > f.r * 1.3 + FLING.magnet) continue
      const l = toLocal(f, x, z)
      const e = nearestEdge(f.pts, l.x, l.z)
      if (e.d <= FLING.magnet && (!best || e.d < best.d)) {
        // A little way in from the edge, toward the middle.
        const k = Math.max(0, 1 - Math.min(0.45, f.rMin * 0.4) / Math.max(0.01, Math.hypot(e.x, e.z)))
        best = { f, x: e.x * k, z: e.z * k, d: e.d }
      }
    }
    return best ? { f: best.f, x: best.x, z: best.z } : null
  }

  private surfaceY(f: Floe | null) {
    return f ? f.group.position.y + TOP : 0
  }

  // ---------------------------------------------------------------- the fling

  /** Her pull (screen pixels from where she grabbed him) and its direction on the sea. */
  private aim(x: number, y: number) {
    this.pullPx = Math.hypot(x - this.down.x, y - this.down.y)
    const full = Math.min(FLING.pull, 0.3 * Math.min(this.w, this.h))
    this.power = clamp((this.pullPx - FLING.dead) / Math.max(1, full - FLING.dead))
    const hit = this.hitPlane(x, y, this.surfaceY(this.on))
    if (hit) {
      v2.set(this.downHit.x - hit.x, this.downHit.z - hit.z)
      if (v2.lengthSq() > 1e-4) this.aimDir.copy(v2.normalize())
    }
    this.range = FLING.reach * this.power ** FLING.curve
  }

  private launch() {
    const range = this.range
    const was = this.on!
    // He pushes off: his floe bobs and leans away.
    was.hv -= FLOES.thump * 0.4
    was.txv -= this.aimDir.y * 0.4
    was.tzv += this.aimDir.x * 0.4
    this.detach()
    this.from.copy(this.pos)
    this.end.set(this.aimAt.x, 0, this.aimAt.z)
    this.dur = Math.max(0.4, FLING.hang * Math.sqrt(range / Math.max(0.5, FLING.reach)))
    this.apex = Math.max(FLING.minArc, FLING.arc * range)
    this.faceGoal = Math.atan2(this.aimDir.x, this.aimDir.y)
    this.setMode('fly')
    this.counts.flings++
    this.lastFling = this.time
    sfx.boing()
  }

  private land() {
    const l = this.landing(this.end.x, this.end.z)
    if (!l) return this.flop()
    const f = l.f
    this.attach(f, l.x, l.z)
    this.setMode('stand')
    this.landT = 0
    this.counts.landings++
    this.addPrints(f, l.x, l.z)
    // The floe takes his weight: down it goes, leaning toward where he landed.
    const s = this.sizeK(f)
    f.hv -= FLOES.thump * s
    const wo = this.weightOffset(f)
    f.txv += (wo.z / f.r) * FLOES.thump * 1.2 * s
    f.tzv -= (wo.x / f.r) * FLOES.thump * 1.2 * s
    this.spray.burst(this.pos.x, this.surfaceY(f) + 0.05, this.pos.z, 8, 1.6, 2.2, 0.12)
    sfx.thump()
    // A little floe tips him off when he lands near its edge.
    if (f.spec.tippy && Math.hypot(l.x, l.z) / f.r > FLOES.tippy) {
      f.tipOff = 0.8
      const wl = this.weightOffset(f)
      f.tipDir.set(wl.x, wl.z).normalize()
      this.setMode('slide')
      this.counts.slides++
      sfx.fwip()
      return
    }
    this.faceGoal = 0
    const next = STAGE_SECTION[f.spec.stage]
    if (ORDER.indexOf(next) > ORDER.indexOf(this.section)) {
      this.section = next
      this.events.section(next)
      if (next === 'mama') this.goHome()
      else sounds.sparkle()
    }
  }

  /** A miss: a big happy belly-flop. */
  private flop() {
    this.on = null
    this.pos.set(this.end.x, SWIM_Y, this.end.z)
    this.pola.root.position.copy(this.pos)
    this.setMode('flop')
    this.counts.flops++
    this.splash(this.pos.x, this.pos.z, 1)
    this.swimTo = null
  }

  private splash(x: number, z: number, big: number) {
    sfx.splash()
    this.spray.burst(x, 0.1, z, Math.round(18 * big), 2.6 * big, 4.5 * big, 0.2)
    for (let i = 0; i < 3; i++) this.foam.emit(x, 0.02, z, 0, 0, 0, 1.2 + i * 0.3, (1.4 + i * 0.9) * big)
  }

  /** How much more a floe moves than a big one (little floes dip and tip more). */
  private sizeK(f: Floe) {
    return f.spec.stage === 'mama' ? 0.15 : clamp(1.6 / f.r, 0.6, 2)
  }

  /** Where his weight sits on his floe, in world directions (meters from its middle). */
  private weightOffset(f: Floe) {
    const c = Math.cos(f.yaw)
    const s = Math.sin(f.yaw)
    return { x: this.at.x * c + this.at.z * s, z: -this.at.x * s + this.at.z * c }
  }

  /** On Mama's ice: he scampers over to her (then `homeT` counts from the hug). */
  private goHome() {
    this.setMode('walk')
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    return this.mode === 'stand' && !this.held && !this.foam.busy && !this.spray.busy && !this.rig.moving && !this.pola.busy
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.driftT += dt * FLOES.drift
    this.modeT += dt
    if (this.homeT >= 0) this.homeT += dt
    this.water.update(t)
    this.updateFloes(dt, t)
    this.updatePola(dt, t)
    this.mama.update(dt, t)
    this.foam.update(dt)
    this.spray.update(dt)
    // The spot she's aiming at rides along with him (on a drifting floe).
    if (this.mode === 'aim') this.aimAt.set(this.pos.x + this.aimDir.x * this.range, 0, this.pos.z + this.aimDir.y * this.range)
    this.updateAim()

    // Stuck: no fling for a while, he hops to say "grab me" (and his tap target glows).
    if (this.mode === 'stand' && this.homeT < 0 && this.section !== 'story' && t - Math.max(this.lastTouch, this.lastFling) > HINT_S && Math.floor(t * 0.4) !== Math.floor((t - dt) * 0.4)) this.pola.hop()

    if (this.section === 'story' && t > 4.5) this.endStory()
    this.lights.follow(this.pos.x, 0, this.pos.z - 2)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  private endStory() {
    if (this.section !== 'story') return
    this.section = 'steady'
    this.events.section('steady')
    this.pola.wave()
  }

  private updateFloes(dt: number, t: number) {
    const w = FLOES.bob * Math.PI * 2
    const z = FLOES.damp
    for (const f of this.floes) {
      const d = f.spec.drift
      if (d && !f.spec.rest) {
        const amp = d.amp * Math.min(1, FLOES.drift)
        f.x = f.spec.x + amp * Math.sin((this.driftT * Math.PI * 2) / d.period + d.phase)
        f.yaw = f.spec.yaw + d.spin * this.driftT
      } else if (f.spec.push) {
        if (f === this.held) {
          const k = FLOES.push
          f.vx = clamp((this.heldGoal.x - f.x) * k, -5, 5)
          f.vz = clamp((this.heldGoal.y - f.z) * k, -5, 5)
        } else {
          const drag = Math.exp(-1.2 * dt)
          f.vx *= drag
          f.vz *= drag
        }
        f.x += f.vx * dt
        f.z += f.vz * dt
        f.yaw += f.vx * 0.05 * dt
      }
      // Heave and lean: springs toward his weight (when he's on it), with the swell on top (never under the water, DRY).
      const load = this.on === f && this.mode !== 'fly' ? 1 : 0
      const s = this.sizeK(f)
      const pressed = this.on === f && this.mode === 'aim' ? 1 + this.power * 0.8 : 1
      const hGoal = -load * FLOES.dip * s * pressed
      f.hv += (-w * w * (f.h - Math.max(hGoal, DRY - TOP)) - 2 * z * w * f.hv) * dt
      f.h += f.hv * dt
      if (f.h < DRY - TOP) {
        f.h = DRY - TOP
        f.hv = Math.max(0, f.hv)
      }
      let txGoal = 0
      let tzGoal = 0
      if (load) {
        const wo = this.weightOffset(f)
        const k = FLOES.tip * DEG * s
        txGoal = (wo.z / f.r) * k
        tzGoal = -(wo.x / f.r) * k
      }
      if (f.tipOff > 0) {
        f.tipOff -= dt
        txGoal = f.tipDir.y * 28 * DEG
        tzGoal = -f.tipDir.x * 28 * DEG
      }
      f.txv += (-w * w * (f.tx - txGoal) - 2 * z * w * f.txv) * dt
      f.tx += f.txv * dt
      f.tzv += (-w * w * (f.tz - tzGoal) - 2 * z * w * f.tzv) * dt
      f.tz += f.tzv * dt
      this.placeFloe(f, t)
    }
    // Pushed floes bump the others instead of going through them.
    for (const a of this.floes) {
      if (!a.spec.push) continue
      for (const b of this.floes) {
        if (a === b) continue
        const dx = a.x - b.x
        const dz = a.z - b.z
        const min = (a.rMin + b.rMin) * 0.95 + 0.1
        const d = Math.hypot(dx, dz)
        if (d >= min || d < 1e-4) continue
        const push = (min - d) / d
        if (b.spec.push && b !== this.held) {
          a.x += dx * push * 0.5
          a.z += dz * push * 0.5
          b.x -= dx * push * 0.5
          b.z -= dz * push * 0.5
        } else {
          a.x += dx * push
          a.z += dz * push
        }
      }
    }
  }

  private placeFloe(f: Floe, t = 0) {
    const sw = swell(f.x, f.z, t)
    f.group.position.set(f.x, f.h + sw * 0.8, f.z)
    f.group.rotation.set(f.tx + swell(f.x, f.z + 1, t) * 0.12, 0, f.tz + swell(f.x + 1, f.z, t) * 0.12)
    f.spinner.rotation.y = f.yaw
  }

  private updatePola(dt: number, t: number) {
    const p = this.pola
    const pose: { crouch?: number; lean?: number; stretch?: number; swim?: number; flail?: number } = {}
    switch (this.mode) {
      case 'stand':
      case 'aim':
        if (this.mode === 'aim') {
          pose.crouch = this.power * FLING.crouch
          // He looks at her finger, leaning back into the pull.
          this.faceGoal = Math.atan2(-this.aimDir.x, -this.aimDir.y)
        }
        if (this.landT >= 0) {
          this.landT += dt
          pose.stretch = -0.3 * Math.sin(Math.min(1, this.landT / 0.3) * Math.PI) * (1 - this.landT / 0.6)
          if (this.landT > 0.6) this.landT = -1
          if (this.landT > 0.35) this.faceGoal = 0
        }
        break
      case 'fly': {
        // He turns to where he's going, flies the arc and comes down onto the floe (or the sea) under it then.
        const k = clamp(this.modeT / this.dur)
        const l = this.landing(this.aimAt.x, this.aimAt.z)
        const goal = l ? toWorld(l.f, l.x, l.z) : { x: this.aimAt.x, z: this.aimAt.z }
        const gy = l ? this.surfaceY(l.f) : SWIM_Y
        const pull = 1 - Math.exp(-dt * 10)
        this.end.x += (goal.x - this.end.x) * pull
        this.end.z += (goal.z - this.end.z) * pull
        this.end.y += (gy - this.end.y) * pull
        this.pos.set(this.from.x + (this.end.x - this.from.x) * k, this.from.y + (this.end.y - this.from.y) * k + 4 * this.apex * k * (1 - k), this.from.z + (this.end.z - this.from.z) * k)
        p.root.position.copy(this.pos)
        pose.stretch = k < 0.25 ? 0.25 * (1 - k / 0.25) : k > 0.8 ? -0.1 : 0.05
        pose.lean = 0.35 * Math.sin(k * Math.PI)
        pose.flail = l ? 0.25 : smooth((k - 0.4) / 0.4)
        if (k >= 1) this.land()
        break
      }
      case 'flop': {
        // Belly first, splash, then he bobs up happy.
        const k = this.modeT / 0.8
        pose.lean = Math.PI * 0.45 * Math.sin(Math.min(1, k) * Math.PI)
        pose.flail = 1 - k
        this.pos.y = SWIM_Y - 0.25 * Math.sin(Math.min(1, k) * Math.PI)
        p.root.position.copy(this.pos)
        if (k >= 1) {
          this.setMode('swim')
          this.counts.swims++
        }
        break
      }
      case 'swim': {
        const f = this.swimTo ?? this.nearestFloe(this.pos.x, this.pos.z)
        const l = toLocal(f, this.pos.x, this.pos.z)
        const e = nearestEdge(f.pts, l.x, l.z)
        const ew = toWorld(f, e.x, e.z)
        const dx = ew.x - this.pos.x
        const dz = ew.z - this.pos.z
        const d = Math.hypot(dx, dz)
        if (d < 0.3 || inside(f.pts, l.x, l.z)) {
          // Climb out, a little way in from the edge.
          const k = Math.max(0, 1 - Math.min(0.5, f.rMin * 0.4) / Math.max(0.01, Math.hypot(e.x, e.z)))
          this.climbTo = { f, x: e.x * k, z: e.z * k }
          this.climbFrom.copy(this.pos)
          this.setMode('climb')
          sfx.boing()
          break
        }
        const step = Math.min(d, FLOES.swim * dt)
        this.pos.x += (dx / d) * step
        this.pos.z += (dz / d) * step
        this.pos.y = SWIM_Y + 0.05 * Math.sin(t * 6)
        p.root.position.copy(this.pos)
        this.faceGoal = Math.atan2(dx, dz)
        pose.swim = 1
        pose.lean = 0.5
        if (Math.floor(t * 3) !== Math.floor((t - dt) * 3)) this.foam.emit(this.pos.x, 0.02, this.pos.z, 0, 0, 0, 1, 0.9)
        break
      }
      case 'climb': {
        const c = this.climbTo
        const k = clamp(this.modeT / 0.5)
        const goal = toWorld(c.f!, c.x, c.z)
        const gy = this.surfaceY(c.f)
        this.pos.set(this.climbFrom.x + (goal.x - this.climbFrom.x) * k, this.climbFrom.y + (gy - this.climbFrom.y) * k + 0.7 * Math.sin(k * Math.PI), this.climbFrom.z + (goal.z - this.climbFrom.z) * k)
        p.root.position.copy(this.pos)
        pose.lean = 0.3
        if (k >= 1) {
          const f = c.f!
          this.attach(f, c.x, c.z)
          this.setMode('stand')
          this.landT = 0
          f.hv -= FLOES.thump * 0.6 * this.sizeK(f)
          this.addPrints(f, c.x, c.z)
          this.swimTo = null
          // Shake the water off (onto the screen).
          this.faceGoal = 0
          p.shake()
          this.spray.burst(this.pos.x, this.pos.y + 0.6, this.pos.z, 26, 2.4, 2.5, 0.14)
          sfx.splash()
          this.events.shake()
          const next = STAGE_SECTION[f.spec.stage]
          if (ORDER.indexOf(next) > ORDER.indexOf(this.section)) {
            this.section = next
            this.events.section(next)
            if (next === 'mama') this.goHome()
          }
        }
        break
      }
      case 'slide': {
        // Down the tipped floe like a slide, and splash.
        const f = this.on!
        const k = this.modeT
        const dir = Math.hypot(this.at.x, this.at.z) || 1
        const speed = 1.5 + k * 5
        this.at.x += (this.at.x / dir) * speed * dt
        this.at.z += (this.at.z / dir) * speed * dt
        p.root.position.set(this.at.x, TOP, this.at.z)
        pose.flail = 1
        pose.lean = -0.4
        if (!inside(f.pts, this.at.x * 0.92, this.at.z * 0.92)) {
          this.detach()
          this.end.copy(this.pos)
          this.flop()
        }
        break
      }
      case 'walk': {
        // Home: he scampers to Mama, and they both hop.
        const f = this.mamaFloe
        const mx = this.mama.root.position.x
        const mz = this.mama.root.position.z
        const dx = mx - this.at.x
        const dz = mz - this.at.z
        const d = Math.hypot(dx, dz)
        if (d > 1.05) {
          const step = Math.min(d - 1.05, 2.6 * dt)
          this.at.x += (dx / d) * step
          this.at.z += (dz / d) * step
          p.root.position.set(this.at.x, TOP + 0.08 * Math.abs(Math.sin(t * 12)), this.at.z)
          this.faceGoal = this.worldYaw(f, dx, dz)
        } else {
          p.root.position.set(this.at.x, TOP, this.at.z)
          this.setMode('stand')
          this.homeT = 0
          this.faceGoal = 0
          p.hop()
          this.mama.hop()
          this.mama.wave()
          sounds.fanfare()
          this.events.home()
        }
        break
      }
    }
    if (this.on && this.mode !== 'slide' && this.mode !== 'walk') p.root.position.set(this.at.x, TOP, this.at.z)
    if (this.on) p.root.getWorldPosition(this.pos)
    // Facing (in the world), whatever he's standing on.
    let d = this.faceGoal - this.face
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.face += d * (1 - Math.exp(-dt * (this.mode === 'fly' ? 14 : 7)))
    p.root.rotation.y = this.face - (this.on ? this.on.yaw : 0)
    p.update(dt, t, pose)

    // His shadow on whatever is under him.
    const under = this.mode === 'swim' || this.mode === 'flop' ? null : this.on ?? this.floeAt(this.pos.x, this.pos.z)
    this.shadow.visible = this.mode !== 'swim' && this.mode !== 'flop'
    const sy = under ? this.surfaceY(under) : 0
    this.shadow.position.set(this.pos.x, sy + 0.015, this.pos.z)
    this.shadow.scale.setScalar(clamp(1 - (this.pos.y - sy) * 0.15, 0.4, 1))
  }

  /** A direction on a floe (footprint) as a world facing. */
  private worldYaw(f: Floe, dx: number, dz: number) {
    const c = Math.cos(f.yaw)
    const s = Math.sin(f.yaw)
    return Math.atan2(dx * c + dz * s, -dx * s + dz * c)
  }

  private nearestFloe(x: number, z: number) {
    let best = this.floes[0]
    let bd = Infinity
    for (const f of this.floes) {
      const l = toLocal(f, x, z)
      const d = nearestEdge(f.pts, l.x, l.z).d
      if (d < bd) {
        bd = d
        best = f
      }
    }
    return best
  }

  /** The dotted arc and the landing ring while she pulls. */
  private updateAim() {
    const show = this.mode === 'aim' && this.power > 0
    this.ring.visible = show
    if (!show) {
      for (const d of this.dots) d.visible = false
      return
    }
    const l = this.landing(this.aimAt.x, this.aimAt.z)
    const goal = l ? toWorld(l.f, l.x, l.z) : { x: this.aimAt.x, z: this.aimAt.z }
    const gy = l ? this.surfaceY(l.f) : 0
    const apex = Math.max(FLING.minArc, FLING.arc * this.range)
    const y0 = this.pos.y + 0.5
    this.dots.forEach((d, i) => {
      const k = (i + 1) / (this.dots.length + 1)
      d.visible = k > 0.08
      d.position.set(this.pos.x + (goal.x - this.pos.x) * k, y0 + (gy - y0) * k + 4 * apex * k * (1 - k), this.pos.z + (goal.z - this.pos.z) * k)
      d.scale.setScalar(0.6 + 0.6 * this.power)
    })
    this.ring.position.set(goal.x, gy + 0.02, goal.z)
    this.ringMat.color.set(l ? '#FF4F9A' : '#FFFFFF')
    this.ring.scale.setScalar(1 + 0.08 * Math.sin(this.time * 10))
  }

  /** What the camera frames: Pola and the floes ahead of him (further ahead while she pulls). */
  private shot(): Shot {
    if (this.section === 'story' && this.time < 2.4) {
      const m = this.mamaFloe
      return { center: new Vector3(m.x, 0.6, m.z + 1), half: new Vector3(7, 1.2, 6), yaw: 0, pitch: 30 }
    }
    if (this.homeT >= 0 && this.homeT < 2.6) {
      // Home: close on the hug first...
      return { center: new Vector3(this.pos.x, 0.9, this.pos.z - 0.6), half: new Vector3(2, 1, 1.6), yaw: 0, pitch: 26 }
    }
    if (this.homeT >= 2.6 && this.homeT < 7) {
      // ...then a look back over the last of the way she brought him, paw prints and all.
      const z1 = this.mamaFloe.z
      return { center: new Vector3(this.mamaFloe.x * 0.5, 0, z1 + 9), half: new Vector3(5, 1, 12), yaw: 0, pitch: 55 }
    }
    // Pola stays a little below the middle (room to pull back under him); a pull widens the view instead of moving it,
    // so the ring where he'll land shows.
    const ahead = this.tall ? 2.4 : 1.6
    const c = new Vector3(this.pos.x * 0.7, 0.3, this.pos.z - ahead)
    const wider = this.mode === 'aim' ? 1 + 0.35 * this.power : 1
    return { center: c, half: (this.tall ? new Vector3(3, 0.8, 5) : new Vector3(4.3, 0.8, 3.7)).multiplyScalar(wider), yaw: 0, pitch: 44 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  private hitPlane(x: number, y: number, height: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    this.plane.constant = -height
    return this.raycaster.ray.intersectPlane(this.plane, new Vector3())
  }

  /** Pola's middle on screen and how big a finger target he needs. */
  private polaOnScreen() {
    const c = this.toScreen(this.pola.center(tmp))
    const top = this.toScreen(this.pola.root.localToWorld(tmp2.set(0, this.pola.height, 0)))
    return { x: c.x, y: c.y, r: Math.max(Math.min(this.w, this.h) < 500 ? 32 : 44, Math.abs(c.y - top.y) * 1.4) }
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (this.section === 'story') this.endStory()
    const pp = this.polaOnScreen()
    const onPola = id === 'pola' || (!id && Math.hypot(x - pp.x, y - pp.y) < pp.r)
    if (onPola && this.mode === 'stand' && this.on) {
      this.grab = 'pola'
      this.down = { x, y }
      this.downHit.copy(this.hitPlane(x, y, this.surfaceY(this.on)) ?? this.pos)
      this.power = this.pullPx = this.range = 0
      this.setMode('aim')
      sounds.pickup()
      return
    }
    this.grab = null
    if (id) return
    // A floe she can push (summer's little ones): it follows her finger across the water.
    const hit = this.hitPlane(x, y, TOP)
    const f = hit && this.floeAt(hit.x, hit.z)
    if (f && f.spec.push) {
      this.grab = 'floe'
      this.held = f
      this.heldOffset.set(hit.x - f.x, hit.z - f.z)
      this.heldGoal.set(f.x, f.z)
    }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held || !this.grab) return
    if (this.grab === 'pola' && this.mode === 'aim') this.aim(x, y)
    else if (this.grab === 'floe' && this.held) {
      const hit = this.hitPlane(x, y, TOP)
      if (hit) this.heldGoal.set(hit.x - this.heldOffset.x, hit.z - this.heldOffset.y)
    }
  }

  pointerUp() {
    const grab = this.grab
    this.grab = null
    if (grab === 'floe' && this.held) {
      if (Math.hypot(this.held.vx, this.held.vz) > 0.2) this.counts.pushes++
      this.held = null
      return
    }
    if (grab !== 'pola' || this.mode !== 'aim') return
    if (this.power > 0) this.launch()
    else this.setMode('stand')
    this.pullPx = this.range = this.power = 0
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    const pp = this.polaOnScreen()
    if (id === 'pola' || (!id && Math.hypot(x - pp.x, y - pp.y) < pp.r)) {
      // A giggle and a hop.
      if (this.mode === 'stand') {
        this.pola.hop()
        this.counts.giggles++
        sfx.chirp()
        if (this.on) this.on.hv -= FLOES.thump * 0.3
      } else if (this.mode === 'swim') this.splash(this.pos.x, this.pos.z, 0.4)
      return
    }
    if (id === 'mama') {
      this.mama.hop()
      this.mama.wave()
      sfx.boing()
      return
    }
    const hit = this.hitPlane(x, y, TOP)
    if (!hit) return
    const f = this.floeAt(hit.x, hit.z)
    if (f) {
      // A floe bobs where she pokes it; while Pola swims, he heads for it.
      f.hv -= FLOES.thump * 0.5 * this.sizeK(f)
      const l = toLocal(f, hit.x, hit.z)
      const c = Math.cos(f.yaw)
      const s = Math.sin(f.yaw)
      f.txv += ((-l.x * s + l.z * c) / f.r) * 0.6
      f.tzv -= ((l.x * c + l.z * s) / f.r) * 0.6
      sfx.thump()
      if (this.mode === 'swim') this.swimTo = f
    } else {
      this.splash(hit.x, hit.z, 0.45)
    }
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; glow?: boolean } | null = null
      if (id === 'pola') {
        const pp = this.polaOnScreen()
        const stuck = this.mode === 'stand' && this.homeT < 0 && this.section !== 'story' && this.time - Math.max(this.lastTouch, this.lastFling) > HINT_S
        spot = { x: pp.x, y: pp.y, size: Math.max(min, pp.r * 2), glow: stuck }
      } else if (id === 'mama') {
        const c = this.toScreen(this.mama.center(tmp))
        const top = this.toScreen(this.mama.root.localToWorld(tmp2.set(0, this.mama.height, 0)))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.abs(c.y - top.y) * 2.2) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        // Pola over Mama when they stand together.
        el.style.zIndex = id === 'pola' ? '2' : '1'
        const shadow = spot.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    return {
      section: this.section,
      mode: this.mode,
      floe: this.on?.i ?? null,
      stage: this.on?.spec.stage ?? null,
      floes: this.floes.length,
      power: +this.power.toFixed(2),
      home: this.homeT >= 0,
      ...this.counts,
      // The floes on screen (pixels), for QA's finger.
      onScreen: this.floes.flatMap((f) => {
        const p = this.toScreen(tmp.set(f.x, this.surfaceY(f), f.z))
        return p.z < 1 && p.x > 0 && p.x < this.w && p.y > 0 && p.y < this.h ? [{ i: f.i, x: Math.round(p.x), y: Math.round(p.y), stage: f.spec.stage, push: !!f.spec.push, tippy: !!f.spec.tippy }] : []
      }),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}
