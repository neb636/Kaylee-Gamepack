// The sunset at the driftwood tree on Ao Prao (plan: planning/around-the-world/thailand/samet-trip.md, step 9, the
// finale's first beat), on the island's real sunset beach (island/layout.ts FRAMES.prao) after all four pink flags.
//
// Kaylee, Mommy and Daddy stand by the big driftwood tree watching the sun go down over the sea. Two things to do, in
// any order (and everything pokes):
//   - the sun: she grabs it and pulls it down to the sea. The sky goes gold, then pink, then purple as it sinks; when
//     it touches the water it plops in with a glint, the night falls by itself, the stars come out and the lanterns
//     light up. Then Daddy calls everyone to the fire show (the 🔥 button).
//   - Mommy's photo: tap Mommy and the three of them turn round, squeeze together and smile for her phone, the sunset
//     behind them (the photo for Agong's wall; if she never takes it, Mommy snaps one as the sun touches the sea).
// After dark, a tap on the sky makes a star twinkle (now and then a shooting star).
//
// Talk (lines.ts L.samet.finale.sunset): Daddy as it opens, then Sparkle's one instruction; the fact the first time she
// taps the sun; Mommy's photo; after a while with nothing done Sparkle says what to do (spendHint). The screen's
// TripGuide speaks them and shows the words for Dad. The feel numbers are knobs (?feel=1).
import { CircleGeometry, Color, Euler, Fog, Group, Mesh, MeshBasicMaterial, Quaternion, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, spendHint, type Line } from '../../../../../../sdk'
import { knobs } from '../../../../../kit/knobs'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { L as LINES } from '../../../lines'
import { beachBed, sunsetSfx as sfx } from './sounds'
import { phoneCamera, snap } from '../book/photo'
import { at as atFrame, FRAMES, STOPS, type StopId } from '../island/layout'
import { buildProps, type Props } from '../island/props'
import { buildIsland, DAY, glowMaterial, type Island } from '../island/scenery'
import { makeSeeThrough, SEE } from '../island/seethrough'

const FILE = 'src/world/places/thailand/activities/samet-trip/finale/sunset.ts'
const S = LINES.samet.finale.sunset
const SUN = knobs('sunsetSun', 'Pulling the sun down', FILE, {
  start: { value: 9, min: 4, max: 25, step: 0.5, label: 'It starts this high', unit: '°' },
  grab: { value: 150, min: 60, max: 300, step: 10, label: 'Grab it within', unit: 'px', note: 'her finger this close to the sun picks it up' },
  follow: { value: 10, min: 2, max: 30, step: 0.5, label: 'It follows her finger', unit: '/s' },
  alone: { value: 22, min: 8, max: 90, step: 1, label: 'Left alone it sets in', unit: 's', note: 'it sinks by itself while she doesn’t hold it, so an idle sunset never drags on (QA 2026-11-08: 75 s)' },
  hint: { value: 2.5, min: 0, max: 10, step: 0.5, label: 'The finger shows the pull after', unit: 's', note: 'until she has grabbed it once; then after 6 s with nothing done' },
  dusk: { value: 3, min: 1, max: 8, step: 0.25, label: 'Night falls in', unit: 's', note: 'after it touches the sea' },
  size: { value: 9, min: 4, max: 20, step: 0.5, label: 'Sun size', unit: 'm', note: 'its radius, 260 m out to sea' },
})
const CAM = knobs('sunsetCam', 'The sunset camera', FILE, {
  pitch: { value: 9, min: 0, max: 40, step: 1, label: 'Looks down', unit: '°' },
  box: { value: 4.2, min: 2, max: 12, step: 0.1, label: 'Shows across', unit: 'm' },
  tallBox: { value: 3.4, min: 2, max: 10, step: 0.1, label: '…on a tall screen', unit: 'm' },
})

export interface SunsetStart {
  flags: StopId[]
}
export interface SunsetEvents {
  /** The shutter clicked (the screen flashes); `src` is Mommy's photo of the three of them. */
  photo(src: string): void
  /** The night has fallen: the way to the fire show. */
  night(): void
  /** Someone says a line (the screen's TripGuide speaks it). */
  say?(l: Line): void
}
type Phase = 'day' | 'sinking' | 'dusk' | 'night'

const DEG = 180 / Math.PI
const tmpQ = new Quaternion()
const phoneQ = new Quaternion()
const phoneE = new Euler()
const HINT_S = 6
/** Sparkle says what to do after this long with nothing done (and no sooner again). */
const SAY_S = 8
const SUN_DIST = 260
const SUN_GOLD = new Color('#FFD27A')
const SUN_PINK = new Color('#FF7A8C')
const HALO_GOLD = new Color('#FFB07A')
const HALO_PINK = new Color('#FF5F9E')
const tmp = new Vector3()
const tmp2 = new Vector3()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

/** The driftwood tree in Ao Prao's frame (u along the beach, v out to sea). */
const F = FRAMES.prao
const TREE = (() => {
  const a = STOPS.hideseek.at
  return { u: (a.x - F.x) * F.t.x + (a.z - F.z) * F.t.z, v: (a.x - F.x) * F.n.x + (a.z - F.z) * F.n.z }
})()
/** The three of them beside it, toward the sea (Kaylee in the middle, Mommy with her phone, Daddy). */
const SPOTS = { kaylee: { u: TREE.u + 2.6, v: TREE.v + 5.2 }, ji: { u: TREE.u + 1.4, v: TREE.v + 4.9 }, nick: { u: TREE.u + 3.9, v: TREE.v + 4.8 } }

export const SUNSET_ANCHORS: AnchorInfo[] = [
  { id: 'sun', label: 'The sun', kind: 'thing' },
  { id: 'kaylee', label: 'You', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'tree', label: 'The driftwood tree', kind: 'thing' },
]

export class Sunset implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private props: Props
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private phase: Phase = 'day'
  private phaseT = 0
  private seaYaw: number
  private sea: Vector3

  private kaylee: Avatar
  private ji: Member
  private nick: Member
  /** Mommy's phone, in her right hand: down at her side while they watch, up at arm's length for the selfie. */
  private phone: Group
  /** Turned round for the photo (0 = watching the sunset, 1 = facing the phone). */
  private turn = 0
  private posing = -1
  private photoPending = false
  private photos = 0
  private treeShake = 0

  // ---- The sun.
  private sun: Mesh
  private halo: Mesh
  private elev: number
  private goal: number
  private grabbing = false
  private finger: { x: number; y: number } | null = null
  private dark = 0
  private lastTouch = 0
  private sparkle: Particles
  private glint: Particles
  /** The last line said (for QA), and when. */
  private said: { text: string; at: number } | null = null
  private lastSay = 0
  private greeted = false
  private facts = 0
  private nickTap = 0
  private counts = { taps: 0, pokes: 0, grabs: 0, photos: 0, stars: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: SunsetStart,
    private events: SunsetEvents,
  ) {
    const { scene, bag } = this
    scene.fog = new Fog(DAY.golden.haze, 170, 950)
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.4
    this.rig.camera.far = 3200
    this.seaYaw = Math.atan2(F.n.x, F.n.z)
    this.sea = new Vector3(F.n.x, 0, F.n.z).normalize()
    // The beach's waves and breeze, until she leaves.
    bag.add({ dispose: beachBed() })

    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.isl.setTime('golden')
    this.isl.lagoon.waves.height = 0.14
    this.props = buildProps(bag, this.isl.root, this.isl.ground, this.isl.blockers, this.isl.cullable)
    // The resort deck's posts and roof stand between the camera and the three of them on some screens: like the
    // island, whatever is in the way melts into a see-through dither (QA 2026-11-05: the sun was behind a post).
    makeSeeThrough(this.isl.root, bag, new Set([...this.isl.fine.meshes, ...this.isl.coarse.meshes]))
    for (const id of Object.keys(this.props.flags) as StopId[]) this.props.flags[id].visible = start.flags.includes(id)

    // ---- The three of them, watching the sea.
    this.kaylee = new Avatar(bag)
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.ji = fam('ji')
    this.nick = fam('nick')
    const k = this.L(SPOTS.kaylee.u, SPOTS.kaylee.v)
    this.kaylee.place(k.x, k.y, k.z, this.seaYaw * DEG)
    const j = this.L(SPOTS.ji.u, SPOTS.ji.v)
    this.ji.place(j.x, j.y, j.z, this.seaYaw * DEG)
    const n = this.L(SPOTS.nick.u, SPOTS.nick.v)
    this.nick.place(n.x, n.y, n.z, this.seaYaw * DEG)
    scene.add(this.kaylee.root, this.ji.root, this.nick.root)
    // Mommy's phone in her hand (a lavender case, the camera on the back, the screen toward her).
    const H = this.ji.height
    this.phone = solid(
      merge([
        P.rbox(0.13, 0.22, 0.024, 0.02, '#9C82DC', {}),
        P.rbox(0.112, 0.196, 0.006, 0.016, '#2B2330', { at: [0, 0, 0.013] }),
        P.rbox(0.05, 0.05, 0.008, 0.012, '#3A3048', { at: [-0.03, 0.07, -0.014] }),
        P.cyl(0.013, 0.013, 0.01, '#FFFFFF', { at: [-0.03, 0.078, -0.018], rot: [Math.PI / 2, 0, 0] }, 10),
      ]),
      bag,
      1.2,
    )
    this.phone.position.set(0.05 * H, -0.2 * H, 0.04 * H)
    this.ji.rig.armR.add(this.phone)
    for (const [p, r] of [
      [k, 0.42],
      [j, 0.5],
      [n, 0.5],
    ] as const) {
      const s = blobShadow(r, bag)
      s.position.set(p.x, p.y + 0.02, p.z)
      scene.add(s)
    }

    // ---- The sun, low over the sea.
    const disc = bag.add(new CircleGeometry(1, 40))
    this.sun = new Mesh(disc, bag.add(new MeshBasicMaterial({ color: '#FFD27A', fog: false })))
    this.halo = new Mesh(disc, glowMaterial(bag, '#FFB07A'))
    ;(this.halo.material as MeshBasicMaterial).opacity = 0.45
    this.halo.scale.setScalar(1.9)
    this.halo.position.z = -0.5
    this.sun.add(this.halo)
    scene.add(this.sun)
    this.elev = this.goal = SUN.start / DEG

    this.sparkle = new Particles({ kind: 'spray', count: 200, colors: ['#FFFFFF', '#FFF6B8', PAL.gold, PAL.pink], gravity: -0.4 }, bag)
    this.glint = new Particles({ kind: 'spray', count: 120, colors: ['#FFE08A', '#FFB07A', '#FFFFFF'], gravity: 4 }, bag)
    scene.add(this.sparkle.mesh, this.glint.mesh)
  }

  private L(u: number, v: number, out = new Vector3()) {
    const p = atFrame(F, u, v)
    return out.set(p.x, Math.max(0, this.isl.ground.heightAt(p.x, p.z)), p.z)
  }
  /** Where the sun sits now: out to sea, `elev` above the horizon, seen from the camera. */
  private sunAt(elev: number, out = new Vector3()) {
    const c = this.rig.camera.position
    return out.set(c.x + this.sea.x * SUN_DIST * Math.cos(elev), SUN_DIST * Math.sin(elev), c.z + this.sea.z * SUN_DIST * Math.cos(elev))
  }

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
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  get calm() {
    return false
  }
  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt

    // ---- The sun: on her finger while she holds it, sinking slowly by itself otherwise.
    if (this.phase === 'day' || this.phase === 'sinking') {
      if (this.grabbing && this.finger) {
        this.raycaster.setFromCamera(new Vector2((this.finger.x / this.w) * 2 - 1, -(this.finger.y / this.h) * 2 + 1), this.rig.camera)
        const d = this.raycaster.ray.direction
        // (She can only pull it down, or back up a little to where it was.)
        this.goal = clamp(Math.asin(clamp(d.y, -1, 1)), -0.06, SUN.start / DEG)
      } else this.goal = Math.max(-0.06, this.goal - (SUN.start / DEG / SUN.alone) * dt)
      this.elev += (this.goal - this.elev) * ease(dt, SUN.follow)
      if (this.elev < SUN.start / DEG - 0.01 && this.phase === 'day') this.setPhase('sinking')
      if (this.elev < 0) this.sunSet()
    } else {
      // Gone: it slides on down behind the sea.
      this.elev = Math.max(-0.2, this.elev - dt * 0.02)
    }
    const up = clamp((SUN.start / DEG - this.elev) / (SUN.start / DEG), 0, 1)
    if (this.phase === 'dusk') {
      this.dark = Math.min(1, 0.7 + (this.phaseT / SUN.dusk) * 0.3)
      if (this.phaseT > SUN.dusk) this.toNight()
    } else if (this.phase !== 'night') this.dark = up * 0.7
    this.isl.setTime({ from: 'golden', to: 'night', k: this.dark })
    ;(this.sun.material as MeshBasicMaterial).color.set(SUN_GOLD).lerp(SUN_PINK, up)
    ;(this.halo.material as MeshBasicMaterial).color.set(HALO_GOLD).lerp(HALO_PINK, up)

    // ---- The photo pose: turned round to Mommy's phone for a moment, then back to the sunset.
    if (this.posing >= 0) {
      this.posing += dt
      const p = this.posing
      if (p > 0.9 && p - dt <= 0.9) sfx.countdown()
      if (p > 2.1 && p - dt <= 2.1) this.photoPending = true
      if (p > 3.4) this.posing = -1
    }
    const want = this.posing >= 0 && this.posing < 3.2 ? 1 : 0
    this.turn += (want - this.turn) * ease(dt, 5)
    const face = (this.seaYaw + Math.PI * this.turn) * DEG
    this.kaylee.face(face / DEG)
    this.kaylee.update(dt, t)
    const sun = this.sunAt(this.elev, tmp2)
    this.kaylee.lookAt(sun.x, sun.y, sun.z)
    for (const [m, s] of [
      [this.ji, SPOTS.ji],
      [this.nick, SPOTS.nick],
    ] as const) {
      const p = this.L(s.u, s.v)
      // (Squeezed in toward Kaylee for the photo.)
      const k = this.L(SPOTS.kaylee.u, SPOTS.kaylee.v)
      p.lerp(k, 0.28 * this.turn)
      m.root.position.copy(p)
      m.root.rotation.y = face / DEG
      m.lookAt(sun.x, sun.y, sun.z)
      m.update(dt, t)
    }
    if (this.turn > 0.05) {
      // Mommy's phone up at arm's length; everyone smiles at it.
      const r = this.ji.rig
      // Out to the side and up, at arm's length, so the phone clears her (and their heads fit in its picture).
      r.armR.rotation.set(-1.75 * this.turn, 0, 0.85 * this.turn)
      // The phone turns upright, its screen to the three of them (the game's camera sees its back): its turn in the
      // world, undone by the arm's.
      r.armR.updateWorldMatrix(true, false)
      r.armR.getWorldQuaternion(tmpQ).invert()
      phoneQ.setFromEuler(phoneE.set(-0.2 * this.turn, this.ji.root.rotation.y + Math.PI * this.turn, 0))
      this.phone.quaternion.copy(tmpQ).multiply(phoneQ)
      const ph = this.ji.root.position
      const cam = this.rig.camera.position
      this.ji.lookAt(cam.x, ph.y + 1.5, cam.z)
      this.nick.lookAt(cam.x, ph.y + 1.5, cam.z)
      this.kaylee.lookAt(cam.x, ph.y + 1.2, cam.z)
      this.kaylee.rig.armL.rotation.set(-0.3 * this.turn, 0, -2.1 * this.turn)
    }
    if (this.treeShake > 0) {
      this.treeShake = Math.max(0, this.treeShake - dt * 1.5)
      this.props.stops.hideseek.rotation.z = Math.sin(t * 30) * 0.03 * this.treeShake
    }

    for (const p of [this.sparkle, this.glint]) p.update(dt)
    const c = this.camCenter()
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    this.isl.cull(c.x, c.z, 90)
    this.props.setLamps(this.isl.lamps, t)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    SEE.uEye.value.copy(this.rig.camera.position)
    // (The see-through hole is round the three of them, not the middle of the frame: what's beyond them stays whole.)
    SEE.uFocus.value.copy(this.kaylee.root.position).add(this.ji.root.position).add(this.nick.root.position).divideScalar(3)
    SEE.uFocus.value.y += 0.9
    // The sun faces the camera.
    this.sunAt(this.elev, this.sun.position)
    this.sun.lookAt(this.rig.camera.position)
    this.sun.scale.setScalar(SUN.size)
    if (!this.greeted && t > 0.6) {
      // Daddy, then Sparkle's one instruction (she waits her turn behind him).
      this.greeted = true
      this.say(S.look)
      this.say(S.pull)
    }
    this.stuck()
    this.drawHint(t)
  }

  private sunSet() {
    // It touches the sea: a plop, a glint on the water, and the night falls by itself.
    this.setPhase('dusk')
    this.grabbing = false
    sfx.plop()
    sfx.chime()
    const s = this.sunAt(0, tmp)
    const near = this.rig.camera.position.clone().lerp(s, 0.25)
    this.glint.burst(near.x, 0.2, near.z, 40, 6, 5, 0.6)
    this.kaylee.react('hop')
    // No photo yet: Mommy snaps one as the sun touches the sea.
    if (!this.photos) {
      this.photoPending = true
      this.say(S.photo)
    } else this.say(S.plop)
  }
  private toNight() {
    this.setPhase('night')
    this.dark = 1
    sfx.chime()
    this.nick.react('wave')
    this.lastTouch = this.time
    this.say(S.night)
    this.events.night()
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private nearSun(x: number, y: number) {
    const s = this.toScreen(this.sun.position)
    return s.z < 1 && Math.hypot(s.x - x, s.y - y) < SUN.grab
  }
  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { x, y }
    if ((id === 'sun' || (!id && this.nearSun(x, y))) && (this.phase === 'day' || this.phase === 'sinking')) {
      this.grabbing = true
      this.counts.grabs++
      sfx.boop()
    }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held || !this.finger) return
    this.lastTouch = this.time
    // Pulling the sun: a warm hum while it moves.
    if (this.grabbing && Math.hypot(x - this.finger.x, y - this.finger.y) > 1) sfx.pull()
    this.finger.x = x
    this.finger.y = y
    // (A drag that starts off the sun picks it up when it passes over it.)
    if (!this.grabbing && (this.phase === 'day' || this.phase === 'sinking') && this.nearSun(x, y)) {
      this.grabbing = true
      this.counts.grabs++
      sfx.boop()
    }
  }
  pointerUp() {
    this.finger = null
    this.grabbing = false
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) return this.poke(id)
    if (this.nearSun(x, y) && this.phase !== 'night' && this.phase !== 'dusk') return this.poke('sun')
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const d = this.raycaster.ray.direction
    if (d.y > 0.02) {
      // The sky: after dark a star twinkles where she taps (sometimes a shooting star); by day a little sparkle.
      const p = this.raycaster.ray.at(this.phase === 'night' ? 120 : 60, tmp)
      this.sparkle.burst(p.x, p.y, p.z, this.phase === 'night' ? 14 : 6, 2.5, 0.5, this.phase === 'night' ? 0.9 : 0.5)
      sfx.chime()
      this.counts.stars++
      if (this.phase === 'night' && this.counts.stars % 4 === 0) {
        for (let i = 0; i < 12; i++) this.sparkle.emit(p.x + i * 2.5, p.y - i * 0.9, p.z, 0, 0, 0, 0.6 + i * 0.05, 0.6)
        sfx.whoosh(0.6)
      }
    } else {
      // The sea or the sand: a splash or a puff.
      const p = this.raycaster.ray.at(Math.max(4, (this.rig.camera.position.y - 0) / Math.max(0.05, -d.y)), tmp)
      this.glint.burst(p.x, 0.15, p.z, 10, 1.4, 2.2, 0.14)
      sfx.splash()
    }
  }

  private poke(id: string) {
    this.counts.pokes++
    if (id === 'sun') {
      sfx.boop()
      const s = this.sun.position
      this.sparkle.burst(s.x, s.y, s.z, 20, 10, 2, 2.5)
      // The first time she pokes it: a tap-to-hear fact.
      if (!this.facts++) this.say(S.west)
    } else if (id === 'family:ji') this.takePhoto()
    else if (id === 'kaylee') {
      this.kaylee.react('hop')
      sfx.boing()
    } else if (id === 'family:nick') {
      this.nick.react('hop')
      sfx.haha()
      this.say(S.tap[this.nickTap++ % S.tap.length])
    } else if (id === 'tree') {
      this.treeShake = 1
      sfx.creak()
    }
  }
  private takePhoto() {
    if (this.posing >= 0) return
    this.posing = 0
    this.ji.react('wave')
    sfx.giggle()
    this.say(S.photo)
  }

  private say(l: Line) {
    this.said = { text: typeof l === 'string' ? l : l.text, at: this.time }
    this.events.say?.(l)
  }
  /** After a while with nothing done, Sparkle says what to do (spendHint: shown first, said at most twice a visit). */
  private stuck() {
    if (this.finger || this.posing >= 0 || this.phase === 'dusk') return
    if (this.time - this.lastTouch < SAY_S || this.time - this.lastSay < SAY_S) return
    this.lastSay = this.time
    const l = this.phase === 'night' ? S.hint.fire : S.hint.pull
    if (spendHint(l)) this.say(l)
  }

  // ---------------------------------------------------------------- camera

  private camCenter() {
    // The three of them and the tree, from up the beach, the sea and the sun beyond.
    const c = this.L(SPOTS.kaylee.u - 0.4, SPOTS.kaylee.v - 0.6)
    c.y += 1.4
    return c
  }
  private shot(): Shot {
    const b = this.tall ? CAM.tallBox : CAM.box
    const half = this.tall ? new Vector3(b, 2.2, 1.5) : new Vector3(b, 1.6, 1.5)
    return { center: this.camCenter(), half, yaw: (this.seaYaw + Math.PI) * DEG, pitch: CAM.pitch, follow: true, minDist: 5, maxDist: 40 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
    if (this.photoPending) {
      this.photoPending = false
      this.photos++
      this.counts.photos++
      sfx.shutter()
      this.scene.updateMatrixWorld()
      const src = snap(this.renderer, this.scene, phoneCamera(this.rig.camera, null, 0, 1.05))
      this.events.photo(src)
    }
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: { x: number; y: number } | null = null
    // (Until she has picked the sun up once the finger shows her how almost at once; then when she's idle a while.)
    const idle = !this.finger && (t - this.lastTouch > HINT_S || (!this.counts.grabs && t > SUN.hint))
    if (idle && (this.phase === 'day' || this.phase === 'sinking')) {
      // On the sun, pressing and sliding down toward the sea.
      const s = this.toScreen(this.sun.position)
      const k = (t * 0.7) % 1
      at = { x: s.x, y: s.y + k * Math.max(40, this.h * 0.18) }
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    el.style.transform = `translate3d(${at.x.toFixed(1)}px, ${at.y.toFixed(1)}px, 0)`
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, base: Vector3 | null, height: number, scale = 1.2) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (base) {
        const c = this.toScreen(tmp.copy(base).setY(base.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.22, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const v = new Vector3()
    for (const [id, el] of this.anchorEls) {
      if (id === 'sun') {
        const s = this.toScreen(this.sun.position)
        const up = this.phase === 'day' || this.phase === 'sinking'
        const size = Math.max(min, SUN.grab * 1.2)
        if (up && s.z < 1) {
          el.style.transform = `translate3d(${(s.x - size / 2).toFixed(1)}px, ${(s.y - size / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${size.toFixed(0)}px`
        }
        const want = up && s.z < 1 ? '' : 'none'
        if (el.style.display !== want) el.style.display = want
      } else if (id === 'kaylee') place(el, this.kaylee.root.getWorldPosition(v), this.kaylee.height * 0.8, 0.8)
      else if (id === 'family:ji') place(el, this.ji.root.getWorldPosition(v), this.ji.height * 0.9, 0.8)
      else if (id === 'family:nick') place(el, this.nick.root.getWorldPosition(v), this.nick.height * 0.9, 0.8)
      else if (id === 'tree') place(el, this.props.stops.hideseek.getWorldPosition(v), 2.6, 0.7)
      el.style.zIndex = id === 'sun' ? '2' : id === 'tree' ? '0' : '1'
    }
  }

  qa() {
    const sc = (p: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(p))
    return {
      section: 'sunset',
      phase: this.phase,
      // Seconds since it opened (the scene's own clock, for timing the sunset when nobody touches it).
      time: +this.time.toFixed(1),
      sunElev: +(this.elev * DEG).toFixed(1),
      dark: +this.dark.toFixed(2),
      sun: sc(this.sun.position),
      horizon: sc(this.sunAt(0)),
      posing: this.posing >= 0,
      bubble: this.said && this.time - this.said.at < 3 ? this.said.text : null,
      kaylee: sc(this.kaylee.root.position.clone().setY(this.kaylee.root.position.y + 0.6)),
      mommy: sc(this.ji.root.position.clone().setY(this.ji.root.position.y + 1)),
      phone: sc(this.phone.getWorldPosition(new Vector3())),
      turn: +this.turn.toFixed(2),
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }
}
