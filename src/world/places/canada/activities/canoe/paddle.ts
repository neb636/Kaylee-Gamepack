// Red Canoe (greybox 5, plan: planning/around-the-world/canada.html): a glacier lake in Banff, bright turquoise among
// the snowy peaks. Maple wants to know why the lake is such a magic blue; Kaylee paddles the red canoe across it to the
// glacier to find out.
//
// The toy (core verb): paddle the canoe. Two ways to try side by side (`?paddle=`):
//   stroke  her finger is the paddle's blade (Maple holds the shaft in the stern). Put it in the water beside the canoe
//           and drag it back: the canoe glides forward and turns away from that side (a stroke on the left turns it
//           right). Long strokes glide far; quick ones splash. Strokes far out from the hull turn more, close to it go
//           straighter; holding the blade still in the water slows the canoe and turns it toward that side.
//   pull    the fallback: her finger holds a spot on the water and the canoe is pulled toward it (Maple paddles by
//           herself); a tap gives a little pull.
// Either way the canoe glides on after she lets go and slowly comes to a stop. The verb deepens three ways (lake.ts has
// where everything is): glide (calm water, mountains all round, the duck family, nothing to reach), where the blue comes
// from (the glacier stream's milky rock flour in the north-west corner: paddle into it, tap it, and the lake glows
// bluer), then follow the loon (she dives and pops up somewhere else, laughing; bubbles show where; the last time she
// has her chick on her back, right by the glacier, and the whole lake glows turquoise).
//
// The lake is the shared engine3d/water.ts, see-through, over a mirror image of the shore and the mountains: that's the
// reflection, and the canoe's wake ripples over it. Built for engine3d/View3D.tsx; nothing here comes from Thailand.
// Stroke power, turn and drag are feel-lab knobs (?feel=1), with a graph of her stroke against what the canoe does.
import { Color, Fog, Group, Mesh, Plane, Raycaster, RingGeometry, MeshBasicMaterial, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import { Moose } from '../bike/critters'
import { Canoe, CANOE_LEN, SEAT_Z } from './boat'
import { Beaver, Duck, Loon, Pika, Squirrel, Trout } from './critters'
import { DUCKS, FAMILY, FLOUR, GLACIER, GLIDE_M, inward, keepOn, landY, LODGE, MOOSE, PADDLE_K, PIKA, shoreK, SQUIRREL, STARTS } from './lake'
import type { CanoeSection, PaddleMode } from './sections'
import { buildShore, mirror, SKY, type Shore } from './shore'

const FILE = 'src/world/places/canada/activities/canoe/paddle.ts'
/** The stroke (?paddle=stroke): how her finger's paddle moves the canoe. */
const STROKE = knobs('canoeStroke', 'Paddle stroke', FILE, {
  power: { value: 0.3, min: 0.05, max: 1.5, step: 0.01, label: 'Stroke power', unit: 'm/s per m', note: 'how much speed each meter of stroke gives (a long finger stroke beside the canoe is about 4 m of water)' },
  quick: { value: 12, min: 3, max: 30, step: 0.5, label: 'Splashes above', unit: 'm/s', note: 'a stroke faster than this only splashes: quick strokes push no harder than this' },
  turn: { value: 0.16, min: 0, max: 1, step: 0.01, label: 'Turn', unit: 'rad/s per m', note: 'how much a stroke turns the canoe away from its side' },
  sweep: { value: 1.2, min: 0, max: 4, step: 0.1, label: 'Wide strokes turn more', unit: '×', note: 'extra turn for a stroke far out from the hull (0 = the same wherever she strokes)' },
  rudder: { value: 0.35, min: 0, max: 1.5, step: 0.05, label: 'Held still: brake and turn', note: 'the blade held still in the water slows the canoe and turns it toward that side' },
  reach: { value: 1.5, min: 0.7, max: 3, step: 0.05, label: 'Reach', unit: 'm', note: 'how far out from the hull the blade goes under her finger' },
  lift: { value: 0.25, min: 0, max: 1.5, step: 0.05, label: 'Lifts out at', unit: 'm/s', note: 'moving forward faster than this, the blade comes out of the water (no brake)' },
})
/** The fallback (?paddle=pull): her finger pulls the canoe along. */
const PULL = knobs('canoePull', 'Finger pull', FILE, {
  pull: { value: 1.5, min: 0.3, max: 5, step: 0.1, label: 'Pull', unit: 'm/s²', note: 'how hard her finger pulls the canoe when it is far' },
  far: { value: 9, min: 2, max: 30, step: 0.5, label: 'Full pull from', unit: 'm', note: 'her finger this far ahead pulls at full strength (closer pulls gentler)' },
  near: { value: 2.5, min: 0, max: 8, step: 0.25, label: 'Stops pulling at', unit: 'm', note: 'the canoe stops being pulled this close to her finger' },
  turn: { value: 1.2, min: 0.2, max: 3, step: 0.05, label: 'Turns toward it', unit: 'rad/s', note: 'how fast the canoe swings round to face her finger' },
  tap: { value: 0.7, min: 0, max: 2, step: 0.05, label: 'A tap pulls for', unit: 's', note: 'a quick tap on the water pulls this long' },
})
/** The canoe on the water (both ways). */
const BOAT = knobs('canoe', 'The canoe', FILE, {
  drag: { value: 0.28, min: 0.02, max: 1.5, step: 0.01, label: 'Drag', unit: '/s', note: 'how fast it slows down when nobody paddles (lower = glides further)' },
  top: { value: 4.2, min: 1.5, max: 9, step: 0.1, label: 'Top speed', unit: 'm/s', note: 'faster than this the water holds it back hard' },
  keel: { value: 3, min: 0.3, max: 10, step: 0.1, label: 'Keel', unit: '/s', note: 'how quickly a sideways slide dies out (low = it skids round turns)' },
  spin: { value: 1.6, min: 0.2, max: 6, step: 0.1, label: 'Turn slows', unit: '/s', note: 'how quickly a turn dies out after the stroke (low = it keeps spinning)' },
  dizzy: { value: 1.6, min: 0.6, max: 4, step: 0.05, label: 'Dizzy at', unit: 'rad/s', note: 'spinning faster than this for a second makes Maple dizzy' },
  camera: { value: 0.45, min: 0, max: 1, step: 0.05, label: 'Camera turns with it', note: '0 = slow and steady, 1 = right behind the canoe all the time' },
})

export interface CanoeStart {
  section: CanoeSection
  paddle: PaddleMode
}
export interface CanoeEvents {
  /** She reached the next part (the address bar follows). */
  section(s: CanoeSection): void
  /** She found the rock flour (the line at the bottom says why the lake is blue). */
  found(): void
  /** The loon family by the glacier. */
  done(): void
}

export const CANOE_ANCHORS: AnchorInfo[] = [
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'loon', label: 'The loon', kind: 'thing' },
  { id: 'ducks', label: 'The ducks', kind: 'thing' },
  { id: 'lodge', label: 'The beaver lodge', kind: 'thing' },
  { id: 'moose', label: 'The moose', kind: 'thing' },
  { id: 'pika', label: 'The pika', kind: 'thing' },
  { id: 'squirrel', label: 'The ground squirrel', kind: 'thing' },
  { id: 'trout', label: 'The trout', kind: 'thing' },
  { id: 'glacier', label: 'The glacier', kind: 'thing' },
]

const ORDER: CanoeSection[] = ['glide', 'stream', 'loon', 'glacier']
const DEG = 180 / Math.PI
const HINT_S = 8
/** A blade moving back slower than this (m/s) is held still: the brake, not a stroke. */
const HELD = 0.3
/** The lake's colors: before she finds the rock flour, and glowing turquoise at the end. */
const DULL = { deep: new Color('#3B97B0'), shallow: new Color('#57B2C4') }
const GLOW = { deep: new Color('#16C2CB'), shallow: new Color('#6BE6DE') }
/** The loon: how close counts as finding her, and how that grows when it's taking a while. */
const LOON_NEAR = 6
const LOON_NEAR_MAX = 11
const LOON_FINDS = 3

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const swish = () => noise(0.32, 0.07, 'bandpass', 900, 320, 0, 1.4)
const drip = () => tone(1900, 1300, 0.05, 0.025, 'sine', 0.05 + Math.random() * 0.1)
const quack = () => [0, 0.16].forEach((d) => tone(560, 430, 0.11, 0.05, 'square', d))
const peep = () => tone(2300, 2700, 0.06, 0.03, 'sine')
const eep = () => [0, 0.12].forEach((d) => tone(2700, 3400, 0.08, 0.06, 'sine', d))
const moo = () => {
  tone(118, 96, 0.8, 0.14, 'sawtooth')
  tone(236, 190, 0.8, 0.03, 'triangle')
}
const slap = () => {
  noise(0.09, 0.4, 'lowpass', 1500, 400)
  sfx.splash()
}
const crack = () => {
  noise(0.14, 0.25, 'highpass', 2400, 900)
  tone(80, 45, 0.9, 0.16, 'sine', 0.05)
}
const rumble = () => noise(1.4, 0.07, 'lowpass', 320, 110, 0, 0.7)
const crunch = () => noise(0.12, 0.12, 'bandpass', 600, 300, 0, 1.5)
const wheee = () => {
  tone(520, 1250, 0.45, 0.05, 'triangle')
  tone(1250, 480, 0.6, 0.05, 'triangle', 0.45)
}
/** The loon's call: a laughing tremolo (her "laugh"), sometimes with the long wail first. */
function loonLaugh(wail = false) {
  const d = wail ? 0.95 : 0
  if (wail) {
    tone(520, 880, 0.45, 0.05, 'sine')
    tone(880, 760, 0.5, 0.05, 'sine', 0.45)
  }
  for (let i = 0; i < 9; i++) tone(i % 2 ? 1080 : 940, i % 2 ? 1000 : 1020, 0.075, 0.045, 'sine', d + i * 0.09)
}

interface Chunk {
  g: Group
  /** Seconds since it fell (-1: unused). */
  t: number
  x: number
  z: number
  vy: number
  y: number
  in: boolean
}
interface Ducky {
  d: Duck
  x: number
  z: number
  h: number
}

type LoonPhase = 'wait' | 'bubbles' | 'float' | 'found' | 'family'

export class RedCanoe implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private shore: Shore
  private reflection: Group
  private water: Water
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: CanoeSection
  private mode: PaddleMode

  // ---- The canoe.
  private canoe: Canoe
  private shadow: Mesh
  private x: number
  private z: number
  private head: number
  private vx = 0
  private vz = 0
  private spin = 0
  private camYaw = 0
  private travel = 0
  private dizzyFor = 0
  private bumpCool = 0

  // ---- Her finger.
  private finger: { x: number; y: number } | null = null
  private lastFinger = { x: 0, y: 0 }
  private pending: { x: number; y: number; id?: string; t: number } | null = null
  private stroking = false
  private side = 0
  private bladeV = 0
  private bladeIn = false
  private strokeLen = 0
  private thrust = 0
  private splashCool = 0
  private target = new Vector3()
  private pullFor = 0
  private marker: Mesh
  private autoPhase = 0
  private bladeLocal = new Vector3()

  // ---- The lake's story.
  private glow = 0
  private glowGoal = 0
  private flourT = 0
  private found = false
  private foundT = -1
  private streamT = 0
  private loon: Loon
  private mama: Loon
  private loonPhase: LoonPhase = 'wait'
  private loonT = 0
  private loonAt = new Vector3()
  private loonFinds = 0
  private callT = 2
  private doneT = -1

  // ---- Everyone else.
  private ducks: Ducky[] = []
  private parade = 0
  private beaver: Beaver
  private beaverCool = 4
  private moose: Moose
  private pika: Pika
  private squirrel: Squirrel
  private trout: Trout
  private troutT = 7
  private chunks: Chunk[] = []
  private snowT = 18

  private foam: Particles
  private glowFoam: Particles
  private spray: Particles
  private sparkle: Particles
  private snow: Particles
  private bubbles: Particles

  private lastTouch = 0
  private counts = { strokes: 0, strokeM: 0, splashes: 0, sides: 0, pulls: 0, bumps: 0, dizzy: 0, parades: 0, taps: 0, pokes: 0, snow: 0, chunks: 0, jumps: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: CanoeStart,
    private events: CanoeEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 140, 760)
    applyBands()
    this.rig.fov = 48
    this.rig.lag = 0.35
    this.rig.camera.far = 1500
    this.section = start.section
    this.mode = start.paddle

    // ---- The shore, its reflection under the see-through water, the water.
    this.shore = buildShore(bag)
    scene.add(this.shore.land, this.shore.shallows, this.shore.flour)
    this.reflection = mirror(this.shore.land)
    scene.add(this.reflection)
    this.water = new Water({ size: 1600, deep: DULL.deep, shallow: DULL.shallow, haze: SKY, hazeNear: 120, hazeFar: 700, opacity: 0.68 }, bag)
    scene.add(this.water.mesh)

    // ---- The canoe and Maple.
    this.canoe = new Canoe(bag)
    scene.add(this.canoe.root)
    this.shadow = blobShadow(0.9, bag)
    this.shadow.scale.set(0.75, 1, 2.6)
    this.shadow.position.y = 0.015
    scene.add(this.shadow)
    const s0 = STARTS[start.section]
    this.x = s0.x
    this.z = s0.z
    this.head = s0.h
    this.camYaw = s0.h

    // Where her finger pulls (pull mode): a pink ring on the water.
    this.marker = new Mesh(bag.add(new RingGeometry(0.95, 1.35, 32)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.85, depthWrite: false })))
    this.marker.rotation.x = -Math.PI / 2
    this.marker.position.y = 0.05
    this.marker.renderOrder = 3
    this.marker.visible = false
    scene.add(this.marker)

    // ---- The animals.
    this.loon = new Loon(bag)
    this.mama = new Loon(bag, true)
    // (Toy-sized: bigger than a real loon, so she can spot one across the lake.)
    this.loon.root.scale.setScalar(1.6)
    this.mama.root.scale.setScalar(1.6)
    this.loon.root.visible = false
    this.mama.root.visible = false
    scene.add(this.loon.root, this.mama.root)
    for (let i = 0; i < 5; i++) {
      const d = new Duck(bag, i > 0)
      const a = i * 0.5
      const dk = { d, x: DUCKS.x + Math.cos(a) * 3, z: DUCKS.z + Math.sin(a) * 3, h: a }
      scene.add(d.root)
      this.ducks.push(dk)
    }
    this.beaver = new Beaver(bag)
    const lodgeIn = inward(LODGE.x, LODGE.z)
    this.beaver.root.position.set(LODGE.x + lodgeIn.x * 3.6, 0, LODGE.z + lodgeIn.z * 3.6 + 1)
    this.beaver.root.rotation.y = Math.atan2(lodgeIn.x, lodgeIn.z)
    scene.add(this.beaver.root)
    this.moose = new Moose(bag)
    this.moose.root.position.set(MOOSE.x, -0.75, MOOSE.z)
    this.moose.root.rotation.y = MOOSE.h
    scene.add(this.moose.root)
    this.pika = new Pika(bag)
    this.pika.root.position.set(PIKA.x - 0.3, landY(PIKA.x, PIKA.z) + 1.45, PIKA.z + 0.4)
    this.pika.root.rotation.y = Math.atan2(-PIKA.x, -PIKA.z)
    scene.add(this.pika.root)
    this.squirrel = new Squirrel(bag)
    this.squirrel.root.position.set(SQUIRREL.x, landY(SQUIRREL.x, SQUIRREL.z) + 0.95, SQUIRREL.z)
    this.squirrel.root.rotation.y = Math.atan2(-SQUIRREL.x, -SQUIRREL.z)
    scene.add(this.squirrel.root)
    this.trout = new Trout(bag)
    scene.add(this.trout.root)
    // Ice chunks that fall off the glacier when she taps it.
    for (let i = 0; i < 5; i++) {
      const g = solid(merge([P.rbox(0.9, 0.7, 0.8, 0.18, '#E6F6FD'), P.rbox(0.5, 0.3, 0.5, 0.1, '#BFE6F6', { at: [0.15, 0.3, 0.1] })]), bag, 1.8)
      g.visible = false
      scene.add(g)
      this.chunks.push({ g, t: -1, x: 0, z: 0, vy: 0, y: 0, in: false })
    }

    // ---- Splashes, wake, sparkles, snow, bubbles.
    this.foam = new Particles({ kind: 'foam', count: 140, opacity: 0.8 }, bag)
    this.glowFoam = new Particles({ kind: 'foam', count: 90, colors: ['#7FF2EA', '#A8FBF3', '#5FE6E0'], opacity: 0.85 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 200, color: '#EAF8FF', gravity: 11 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 160, colors: ['#FFFFFF', '#C9FFF8', '#FFF6B8', '#9EF0FF'], gravity: -0.4 }, bag)
    this.snow = new Particles({ kind: 'spray', count: 140, color: '#FFFFFF', gravity: 1.6 }, bag)
    this.bubbles = new Particles({ kind: 'spray', count: 80, color: '#F2FFFF', gravity: -1.2 }, bag)
    scene.add(this.foam.mesh, this.glowFoam.mesh, this.spray.mesh, this.sparkle.mesh, this.snow.mesh, this.bubbles.mesh)

    // ---- Where the link starts.
    if (start.section === 'loon' || start.section === 'glacier') {
      this.found = true
      this.glow = this.glowGoal = 0.6
    }
    if (start.section === 'loon') this.startLoon()
    if (start.section === 'glacier') this.reachFamily()
    this.setGlow()
    this.placeCanoe(0)

    this.unwatch = watch('canoe', () => ({
      'her stroke (m/s)': [this.mode === 'stroke' ? -this.bladeV : this.thrust, 16],
      'blade in water': [this.bladeIn ? 1 : 0, 1.2],
      'side (left - / right +)': [this.side, 1.2],
      'speed (m/s)': [this.speed, 5],
      'turning (rad/s)': [this.spin, 2.5],
      'sliding sideways (m/s)': [this.slide, 2],
    }))
  }

  // ---------------------------------------------------------------- the canoe's frame

  private get fwd() {
    return { x: Math.sin(this.head), z: Math.cos(this.head) }
  }
  /** The canoe's right-hand side (facing forward). */
  private get right() {
    return { x: -Math.cos(this.head), z: Math.sin(this.head) }
  }
  private get speed() {
    const f = this.fwd
    return this.vx * f.x + this.vz * f.z
  }
  private get slide() {
    const r = this.right
    return this.vx * r.x + this.vz * r.z
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
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  get calm() {
    return false
  }

  private enter(s: CanoeSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.water.update(t)
    this.shore.stream.update(t)
    this.splashCool -= dt
    this.bumpCool -= dt

    // Pulling, a finger held still on something (the glacier, the loon) pulls the canoe there too.
    if (this.pending && this.mode === 'pull' && t - this.pending.t > 0.3) {
      this.finger = { x: this.pending.x, y: this.pending.y }
      this.pending = null
      this.counts.pulls++
    }
    if (this.mode === 'stroke') this.strokeInput(dt)
    else this.pullInput(dt)
    this.move(dt)
    this.story(dt, t)
    this.updateAnimals(dt, t)
    this.updateChunks(dt)
    this.placeCanoe(dt)
    for (const p of [this.foam, this.glowFoam, this.spray, this.sparkle, this.snow, this.bubbles]) p.update(dt)

    // The lake's color glows toward where the story is.
    if (Math.abs(this.glowGoal - this.glow) > 0.001) {
      this.glow += (this.glowGoal - this.glow) * ease(dt, 0.8)
      this.setGlow()
    }
    // The reflection shivers a little with the water.
    this.reflection.position.x = Math.sin(t * 0.8) * 0.06
    this.reflection.scale.x = 1 + Math.sin(t * 0.6) * 0.003
    // The milky patch turns slowly; while it's calling her it sparkles.
    this.shore.flour.children[0].rotation.z = t * 0.05
    this.shore.flour.children[1].rotation.z = -t * 0.08
    const calling = this.section === 'stream' && !this.found
    if (Math.random() < dt * (calling ? 14 : 2)) {
      const a = Math.random() * Math.PI * 2
      const r = Math.random() * FLOUR.r * 0.8
      this.sparkle.emit(FLOUR.x + Math.cos(a) * r, 0.1, FLOUR.z + Math.sin(a) * r, 0, 0.6 + Math.random() * 0.6, 0, 1.2, calling ? 0.2 : 0.12)
    }
    // Now and then a little snow slides off a peak, far away.
    if ((this.snowT -= dt) < 0) {
      this.snowT = 20 + Math.random() * 14
      this.snowPuff(this.shore.peaks[Math.floor(Math.random() * this.shore.peaks.length)].top, false)
    }

    this.lights.follow(this.x, 0, this.z)
    this.camYaw += wrap(this.head - this.camYaw) * ease(dt, 0.4 + BOAT.camera * 4)
    this.rig.lag = this.doneT >= 0 && this.doneT < 5 ? 0.9 : t < 2.2 && this.section === 'glide' ? 0.9 : 0.35
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  private setGlow() {
    const k = this.glow
    this.water.setColors(tmpColor(DULL.deep, GLOW.deep, k), tmpColor2(DULL.shallow, GLOW.shallow, k), SKY)
  }

  // ---------------------------------------------------------------- her finger: the stroke

  /** Her finger in the canoe's frame (meters forward of its middle, and to its right), from the screen. */
  private toCanoe(px: number, py: number, out: { along: number; across: number }) {
    const c = this.toScreen(tmp.set(this.x, 0.2, this.z))
    const f = this.fwd
    const r = this.right
    const a = this.toScreen(tmp.set(this.x + f.x, 0.2, this.z + f.z))
    const b = this.toScreen(tmp.set(this.x + r.x, 0.2, this.z + r.z))
    const fx = a.x - c.x
    const fy = a.y - c.y
    const rx = b.x - c.x
    const ry = b.y - c.y
    const det = fx * ry - fy * rx || 1e-6
    const dx = px - c.x
    const dy = py - c.y
    out.along = (dx * ry - dy * rx) / det
    out.across = (fx * dy - fy * dx) / det
    return out
  }
  /** A move of her finger on the screen as meters in the canoe's frame (only her finger: the canoe gliding past a
   *  still finger isn't a stroke). */
  private moveToCanoe(dx: number, dy: number, out: { along: number; across: number }) {
    const c = this.toScreen(tmp.set(this.x, 0.2, this.z))
    const f = this.fwd
    const r = this.right
    const a = this.toScreen(tmp.set(this.x + f.x, 0.2, this.z + f.z))
    const b = this.toScreen(tmp.set(this.x + r.x, 0.2, this.z + r.z))
    const fx = a.x - c.x
    const fy = a.y - c.y
    const rx = b.x - c.x
    const ry = b.y - c.y
    const det = fx * ry - fy * rx || 1e-6
    out.along = (dx * ry - dy * rx) / det
    out.across = (fx * dy - fy * dx) / det
    return out
  }

  private strokeInput(dt: number) {
    this.thrust = 0
    if (!this.stroking || !this.finger || (this.doneT >= 0 && this.doneT < 1)) {
      this.bladeIn = false
      this.bladeV *= 1 - ease(dt, 10)
      return
    }
    const at = this.toCanoe(this.finger.x, this.finger.y, { along: 0, across: 0 })
    const mv = this.moveToCanoe(this.finger.x - this.lastFinger.x, this.finger.y - this.lastFinger.y, { along: 0, across: 0 })
    this.lastFinger = { ...this.finger }
    // Which side: where she put it in; she can swap by moving well over to the other side.
    if (!this.side) this.side = at.across < 0 ? -1 : 1
    else if (at.across * this.side < -0.6) {
      this.side = -this.side
      this.counts.sides++
      this.endStroke()
      drip()
    }
    const v = dt > 0 ? mv.along / dt : 0
    this.bladeV += (v - this.bladeV) * ease(dt, 18)
    // Moving forward (recovering), the blade lifts out; back or held still, it's in the water.
    const wasIn = this.bladeIn
    this.bladeIn = this.bladeV < STROKE.lift
    if (this.bladeIn && !wasIn) {
      const p = this.canoe.bladeWorld(tmp)
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 0.9, 0.7)
      noise(0.08, 0.05, 'bandpass', 1400, 600, 0, 1.2)
    }
    if (!this.bladeIn && wasIn) {
      this.endStroke()
      drip()
    }
    // The blade under her finger (as far as the paddle reaches).
    const across = this.side * clamp(Math.abs(at.across), 0.62, STROKE.reach)
    this.bladeLocal.set(-across, this.bladeIn ? -0.16 : 0.32, clamp(at.along, SEAT_Z - 1.7, SEAT_Z + 1.5))
    if (!this.bladeIn) return

    const back = -this.bladeV
    // (The smoothed speed only fades toward zero once her finger stops, so below a slow drift the blade counts as held.)
    if (back > HELD) {
      // A stroke: forward, and turning away from its side (more when it's out wide).
      const eff = Math.min(back, STROKE.quick) * dt
      const wide = clamp((Math.abs(at.across) - 0.62) / Math.max(0.1, STROKE.reach - 0.62))
      const f = this.fwd
      this.vx += f.x * eff * STROKE.power
      this.vz += f.z * eff * STROKE.power
      this.spin += this.side * eff * STROKE.turn * (1 + STROKE.sweep * wide)
      this.canoe.rock(-this.side * eff * 1.4)
      this.strokeLen += eff
      this.counts.strokeM += eff
      this.thrust = eff / Math.max(dt, 1e-3)
      if (this.strokeLen > 0.25 && this.strokeLen - eff <= 0.25) swish()
      // Swirls behind the blade; quick strokes splash.
      const p = this.canoe.bladeWorld(tmp)
      if (Math.random() < dt * 20) (this.found ? this.glowFoam : this.foam).emit(p.x, 0.03, p.z, 0, 0, 0, 1.1, 0.45)
      if (back > STROKE.quick && this.splashCool <= 0) {
        this.splashCool = 0.18
        this.counts.splashes++
        this.spray.burst(p.x, 0.1, p.z, 10, 2.2, 3.2, 0.13)
        if (Math.random() < 0.5) sfx.splash()
      }
    } else {
      // Held still in the water: a brake that turns the canoe toward the blade's side.
      const s = this.speed
      const k = STROKE.rudder * dt
      this.vx -= this.vx * k * 1.2
      this.vz -= this.vz * k * 1.2
      this.spin -= this.side * s * k * 0.8
    }
  }

  private endStroke() {
    if (this.strokeLen > 0.4) this.counts.strokes++
    this.strokeLen = 0
  }

  // ---------------------------------------------------------------- her finger: the pull

  private pullInput(dt: number) {
    const held = !!this.finger
    if (held) {
      const p = this.waterPoint(this.finger!.x, this.finger!.y, tmp)
      if (p) {
        keepOn(p, 0.94)
        this.target.set(p.x, 0, p.z)
      }
    }
    this.pullFor -= dt
    const on = held || this.pullFor > 0
    this.marker.visible = on
    this.thrust = 0
    if (!on || (this.doneT >= 0 && this.doneT < 1)) {
      this.autoPhase = 0
      this.bladeIn = false
      return
    }
    const s = 0.9 + Math.sin(this.time * 6) * 0.12
    this.marker.position.set(this.target.x, 0.05, this.target.z)
    this.marker.scale.setScalar(s)
    const dx = this.target.x - this.x
    const dz = this.target.z - this.z
    const dist = Math.hypot(dx, dz)
    const diff = wrap(Math.atan2(dx, dz) - this.head)
    const want = clamp(diff * 2, -PULL.turn, PULL.turn) * clamp(dist / 1.5)
    this.spin += (want - this.spin) * ease(dt, 4)
    const k = clamp((dist - PULL.near) / Math.max(0.5, PULL.far - PULL.near)) * Math.max(0, Math.cos(diff))
    const f = this.fwd
    this.vx += f.x * PULL.pull * k * dt
    this.vz += f.z * PULL.pull * k * dt
    this.thrust = PULL.pull * k
    // Maple paddles by herself, side to side, quicker the harder it pulls.
    this.autoPhase += dt * (0.6 + k * 0.9)
    const q = this.autoPhase % 1
    const n = Math.floor(this.autoPhase)
    const side = n % 2 ? 1 : -1
    const inWater = q < 0.62
    const along = inWater ? SEAT_Z + 1.3 - (q / 0.62) * 2.4 : SEAT_Z - 1.1 + ((q - 0.62) / 0.38) * 2.4
    this.bladeLocal.set(-side * 0.8, inWater ? -0.16 : 0.32, along)
    if (inWater && !this.bladeIn && k > 0.05) swish()
    this.bladeIn = inWater && k > 0.05
    this.side = side
  }

  // ---------------------------------------------------------------- the canoe on the water

  private move(dt: number) {
    const f = this.fwd
    const r = this.right
    // Split the velocity along and across the canoe: the water drags it, the keel stops it sliding sideways.
    let u = this.vx * f.x + this.vz * f.z
    let w = this.vx * r.x + this.vz * r.z
    u -= u * BOAT.drag * dt
    if (u > BOAT.top) u -= (u - BOAT.top) * 3 * dt
    if (u < -1) u -= (u + 1) * 3 * dt
    w -= w * Math.min(1, BOAT.keel * dt)
    // The payoff: it eases to a stop by the glacier.
    if (this.doneT >= 0 && this.doneT < 3) u -= u * 1.5 * dt
    this.vx = f.x * u + r.x * w
    this.vz = f.z * u + r.z * w
    this.spin -= this.spin * Math.min(1, BOAT.spin * dt)
    this.spin = clamp(this.spin, -3, 3)
    // The stream's current helps her to the milky water if it's taking a while.
    if (this.section === 'stream' && !this.found && this.streamT > 18) {
      const dx = FLOUR.x - this.x
      const dz = FLOUR.z - this.z
      const d = Math.hypot(dx, dz) || 1
      this.vx += (dx / d) * 0.55 * dt
      this.vz += (dz / d) * 0.55 * dt
    }
    // Near the shore, the canoe turns gently back toward open water (it never gets stuck facing the beach).
    const k = shoreK(this.x, this.z)
    if (k > 0.78) {
      const n = inward(this.x, this.z)
      const facing = f.x * n.x + f.z * n.z
      if (facing < 0.3) this.spin += Math.sign(wrap(Math.atan2(n.x, n.z) - this.head) || 1) * (k - 0.78) * 6 * dt
    }
    this.head += this.spin * dt
    const p = { x: this.x + this.vx * dt, z: this.z + this.vz * dt }
    if (keepOn(p, PADDLE_K) > 0) {
      // Bump on the pebbles: it bounces softly back.
      const n = inward(p.x, p.z)
      const vn = this.vx * n.x + this.vz * n.z
      if (vn < 0) {
        this.vx -= 1.4 * vn * n.x
        this.vz -= 1.4 * vn * n.z
        if (vn < -0.6 && this.bumpCool <= 0) {
          this.bumpCool = 0.6
          this.counts.bumps++
          crunch()
          this.canoe.rock(0.4)
        }
      }
    }
    const moved = Math.hypot(p.x - this.x, p.z - this.z)
    this.travel += moved
    this.x = p.x
    this.z = p.z
    // Spinning round and round: Maple gets dizzy.
    if (Math.abs(this.spin) > BOAT.dizzy) this.dizzyFor += dt
    else this.dizzyFor = Math.max(0, this.dizzyFor - dt * 2)
    if (this.dizzyFor > 1 && !this.canoe.isDizzy) {
      this.canoe.dizzy()
      this.counts.dizzy++
      wheee()
    }
    // The wake: ripples off the bow and the stern (turquoise once she has found the rock flour).
    const sp = Math.hypot(this.vx, this.vz)
    if (sp > 0.4 && Math.random() < dt * (4 + sp * 6)) {
      const back = Math.random() < 0.5 ? -1 : 1
      const ox = f.x * back * CANOE_LEN * 0.45 + r.x * (Math.random() - 0.5) * 0.8
      const oz = f.z * back * CANOE_LEN * 0.45 + r.z * (Math.random() - 0.5) * 0.8
      ;(this.found && Math.random() < 0.7 ? this.glowFoam : this.foam).emit(this.x + ox, 0.02, this.z + oz, -this.vx * 0.1, 0, -this.vz * 0.1, 1.4 + sp * 0.3, 0.35 + sp * 0.08)
    }
  }

  private placeCanoe(dt: number) {
    const root = this.canoe.root
    root.position.set(this.x, swell(this.x, this.z, this.time) * 0.5, this.z)
    root.rotation.y = this.head
    this.shadow.position.set(this.x, 0.015, this.z)
    this.shadow.rotation.z = -this.head
    let look: Vector3 | null = null
    const near = (v: Vector3, d: number) => v.distanceTo(tmp3.set(this.x, v.y, this.z)) < d
    if (this.loon.root.visible && !this.loon.under) look = this.loon.root.position
    else if (this.mama.root.visible && !this.mama.under) look = this.mama.root.position
    else if (this.section === 'stream' && !this.found) look = tmp2.set(FLOUR.x, 0.3, FLOUR.z)
    else if (this.trout.flying) look = this.trout.root.position
    else if (this.beaver.busy) look = this.beaver.root.position
    else if (near(this.ducks[0].d.root.position, 9)) look = this.ducks[0].d.root.position
    else if (near(this.moose.root.position, 16)) look = tmp2.copy(this.moose.root.position).setY(1.5)
    const showBlade = this.mode === 'stroke' ? this.stroking && !!this.finger : this.bladeIn || this.autoPhase > 0
    this.canoe.update(dt, this.time, { speed: this.speed, spin: this.spin, blade: showBlade ? this.bladeLocal : null, look })
    if (this.canoe.slapped) {
      this.canoe.slapped = false
      const p = this.canoe.tailTip(tmp)
      this.spray.burst(p.x, 0.1, p.z, 14, 2, 3.5, 0.14)
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 1.2, 1.4)
      slap()
    }
  }

  // ---------------------------------------------------------------- the story: the rock flour, the loon, the family

  private story(dt: number, t: number) {
    const inFlour = Math.hypot(this.x - FLOUR.x, this.z - FLOUR.z) < FLOUR.r - 1.5
    if (this.section === 'glide' && (this.travel > GLIDE_M || inFlour)) this.enter('stream')
    if (this.section === 'stream' && !this.found) {
      this.streamT += dt
      this.flourT = inFlour ? this.flourT + dt : 0
      if (this.flourT > 1.2) this.findFlour()
    }
    // Milky water swirls round the canoe while it's in the flour.
    if (inFlour && Math.random() < dt * 12) {
      const f = this.fwd
      const s = (Math.random() - 0.5) * CANOE_LEN
      this.glowFoam.emit(this.x + f.x * s + (Math.random() - 0.5) * 2, 0.02, this.z + f.z * s + (Math.random() - 0.5) * 2, 0, 0, 0, 1.6, 0.5)
    }
    if (this.foundT >= 0) {
      this.foundT += dt
      if (this.foundT > 4.5 && this.section === 'stream') {
        this.enter('loon')
        this.startLoon()
      }
    }
    this.updateLoon(dt, t)
    if (this.doneT >= 0) {
      this.doneT += dt
      // The family swims round the canoe; the lake glows; Maple slaps her tail now and then.
      if (Math.random() < dt * 6) {
        const a = Math.random() * Math.PI * 2
        const r = 3 + Math.random() * 14
        this.sparkle.emit(this.x + Math.cos(a) * r, 0.1, this.z + Math.sin(a) * r, 0, 0.8, 0, 1.4, 0.18)
      }
      if (this.doneT > 2 && Math.random() < dt * 0.25) this.canoe.slap()
    }
  }

  private findFlour() {
    if (this.found) return
    this.found = true
    this.foundT = 0
    this.glowGoal = 0.6
    this.sparkle.burst(this.x, 0.3, this.z, 50, 3, 3, 0.2)
    for (let i = 0; i < 4; i++) this.glowFoam.emit(this.x, 0.03, this.z, 0, 0, 0, 2 + i * 0.4, 2.5 + i * 1.5)
    sounds.sparkle()
    this.canoe.cheer()
    this.events.found()
  }

  /** The loon's first dive: she pops up ahead, laughs and goes under. */
  private startLoon() {
    this.loonFinds = 0
    this.loonPhase = 'bubbles'
    this.loonT = 0
    this.pickLoonSpot(12, 16)
    this.mama.root.visible = false
  }

  /** Somewhere ahead of the canoe, on open water (on screen, so she can see the bubbles). */
  private pickLoonSpot(near: number, far: number) {
    for (let i = 0; i < 40; i++) {
      const a = this.head + (Math.random() - 0.5) * (i < 25 ? 0.9 : 3.4)
      const d = near + Math.random() * (far - near)
      const x = this.x + Math.sin(a) * d
      const z = this.z + Math.cos(a) * d
      if (shoreK(x, z) < 0.8 && Math.hypot(x - FLOUR.x, z - FLOUR.z) > 4 && Math.hypot(x - FAMILY.x, z - FAMILY.z) > 8) {
        this.loonAt.set(x, 0, z)
        return
      }
    }
    this.loonAt.set(this.x * 0.4, 0, this.z * 0.4 - 6)
  }

  private updateLoon(dt: number, t: number) {
    const L = this.loonPhase
    this.loonT += dt
    const final = this.loonFinds >= LOON_FINDS
    const who = final ? this.mama : this.loon
    const dist = Math.hypot(this.x - this.loonAt.x, this.z - this.loonAt.z)
    const reach = LOON_NEAR + (LOON_NEAR_MAX - LOON_NEAR) * clamp((this.loonT - 12) / 20)
    if (L === 'bubbles') {
      // Bubbles where she'll come up; she comes up after a moment (at once if the canoe is already there).
      if (Math.random() < dt * 14) this.bubbles.emit(this.loonAt.x + (Math.random() - 0.5) * 1.2, -0.3, this.loonAt.z + (Math.random() - 0.5) * 1.2, 0, 0.7, 0, 0.7, 0.1)
      if (Math.random() < dt * 3) this.foam.emit(this.loonAt.x, 0.02, this.loonAt.z, 0, 0, 0, 1.2, 0.8)
      if (this.loonT > 3.2 || dist < reach) {
        this.loonPhase = 'float'
        this.loonT = 0
        who.root.visible = true
        who.root.position.set(this.loonAt.x, 0, this.loonAt.z)
        who.surface()
        who.poke()
        this.foam.emit(this.loonAt.x, 0.02, this.loonAt.z, 0, 0, 0, 1.4, 1.6)
        this.spray.burst(this.loonAt.x, 0.1, this.loonAt.z, 10, 1.4, 2.5, 0.1)
        loonLaugh(this.loonFinds === 0 || final)
        this.callT = 4
      }
    } else if (L === 'float') {
      // She floats there, facing the canoe, laughing now and then, until the canoe comes close. Taking a long while,
      // she swims toward the canoe herself.
      const face = Math.atan2(this.x - who.root.position.x, this.z - who.root.position.z)
      who.root.rotation.y += wrap(face - who.root.rotation.y) * ease(dt, 2)
      if (this.loonT > 22 && dist > reach) {
        const d = Math.max(1, dist)
        const v = Math.min(1.6, (this.loonT - 22) * 0.3)
        this.loonAt.x += ((this.x - this.loonAt.x) / d) * v * dt
        this.loonAt.z += ((this.z - this.loonAt.z) / d) * v * dt
        if (Math.random() < dt * 4) this.foam.emit(this.loonAt.x, 0.02, this.loonAt.z, 0, 0, 0, 1, 0.4)
      }
      who.root.position.set(this.loonAt.x, 0, this.loonAt.z)
      if ((this.callT -= dt) < 0) {
        this.callT = 4 + Math.random() * 2
        who.poke()
        loonLaugh(false)
      }
      if (dist < reach) {
        this.loonPhase = 'found'
        this.loonT = 0
        who.poke()
        loonLaugh(false)
        sounds.pop()
        this.sparkle.burst(this.loonAt.x, 0.5, this.loonAt.z, 20, 2, 2.5, 0.16)
        if (final) this.reachFamily()
        else {
          this.loonFinds++
          this.canoe.wave()
        }
      }
    } else if (L === 'found') {
      // A moment to see her, then down she goes and the bubbles come up somewhere else.
      if (this.loonT > 1.3 && !this.loon.diving) {
        this.loon.dive()
        this.spray.burst(this.loonAt.x, 0.1, this.loonAt.z, 8, 1.2, 2, 0.1)
        sounds.whoosh()
      }
      if (this.loonT > 2.2) {
        this.loon.root.visible = false
        this.loonPhase = 'bubbles'
        this.loonT = 0
        if (this.loonFinds >= LOON_FINDS) this.loonAt.set(FAMILY.x, 0, FAMILY.z)
        else this.pickLoonSpot(11, 16)
      }
    } else if (L === 'family') {
      // The payoff: the mother (her chick on her back) and the father swim round and round the canoe.
      const r = 4.6
      const a = t * 0.45
      for (const [i, l] of [this.mama, this.loon].entries()) {
        const b = a + i * Math.PI
        l.root.position.set(this.x + Math.cos(b) * r, 0, this.z + Math.sin(b) * r)
        l.root.rotation.y = Math.atan2(-Math.sin(b), Math.cos(b))
      }
      if ((this.callT -= dt) < 0) {
        this.callT = 5 + Math.random() * 3
        ;(Math.random() < 0.5 ? this.mama : this.loon).poke()
        loonLaugh(Math.random() < 0.3)
      }
    }
    this.loon.update(dt, t)
    this.mama.update(dt, t)
  }

  /** The loon family by the glacier: the whole lake glows turquoise. */
  private reachFamily() {
    this.loonPhase = 'family'
    this.loonFinds = LOON_FINDS
    this.mama.root.visible = true
    this.mama.surface()
    this.loon.root.visible = true
    this.loon.surface()
    this.glowGoal = 1
    this.doneT = 0
    this.callT = 2.5
    this.enter('glacier')
    this.canoe.cheer()
    this.canoe.slap()
    sounds.fanfare()
    loonLaugh(true)
    this.sparkle.burst(this.x, 0.5, this.z, 60, 3.5, 3, 0.2)
    this.events.done()
  }

  // ---------------------------------------------------------------- everyone else

  private updateAnimals(dt: number, t: number) {
    // The ducks: they paddle in slow circles at home; the canoe gliding close, they line up behind it like a parade.
    const mom = this.ducks[0]
    const dMom = Math.hypot(mom.x - this.x, mom.z - this.z)
    if (this.parade <= 0 && dMom < 4.5 && this.doneT < 0) {
      this.parade = 25
      this.counts.parades++
      quack()
      mom.d.poke()
    }
    this.parade -= dt
    const f = this.fwd
    for (const [i, dk] of this.ducks.entries()) {
      let tx: number
      let tz: number
      if (this.parade > 0) {
        if (i === 0) {
          tx = this.x - f.x * (CANOE_LEN / 2 + 1.4)
          tz = this.z - f.z * (CANOE_LEN / 2 + 1.4)
        } else {
          const ahead = this.ducks[i - 1]
          const dx = ahead.x - dk.x
          const dz = ahead.z - dk.z
          const d = Math.hypot(dx, dz) || 1
          tx = ahead.x - (dx / d) * (i === 1 ? 1 : 0.7)
          tz = ahead.z - (dz / d) * (i === 1 ? 1 : 0.7)
        }
      } else {
        const a = t * 0.12 + i * 0.45
        tx = DUCKS.x + Math.cos(a) * 3.2
        tz = DUCKS.z + Math.sin(a) * 3.2
      }
      const dx = tx - dk.x
      const dz = tz - dk.z
      const d = Math.hypot(dx, dz)
      const v = Math.min(this.parade > 0 ? 4.6 : 0.7, d * 1.8)
      if (d > 0.05) {
        dk.x += (dx / d) * v * dt
        dk.z += (dz / d) * v * dt
        dk.h += wrap(Math.atan2(dx, dz) - dk.h) * ease(dt, 6)
      }
      dk.d.speed = v
      const p = { x: dk.x, z: dk.z }
      keepOn(p, 0.93)
      dk.x = p.x
      dk.z = p.z
      dk.d.root.position.set(dk.x, dk.d.root.position.y, dk.z)
      dk.d.root.rotation.y = dk.h
      dk.d.update(dt, t)
      if (i > 0 && this.parade > 0 && Math.random() < dt * 0.6) peep()
    }

    // The beaver pops up by his lodge when the canoe glides by (or she taps the lodge).
    this.beaverCool -= dt
    if (this.beaverCool < 0 && !this.beaver.busy && Math.hypot(this.x - LODGE.x, this.z - LODGE.z) < 16) {
      this.beaverCool = 30
      this.beaver.poke()
    }
    this.beaver.update(dt, t)
    if (this.beaver.slapped) {
      this.beaver.slapped = false
      const p = this.beaver.root.position
      this.spray.burst(p.x, 0.1, p.z, 16, 2.2, 4, 0.14)
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 1.4, 1.8)
      slap()
      // Maple slaps back.
      if (Math.hypot(this.x - p.x, this.z - p.z) < 30) setTimeout(() => this.canoe.slap(), 500)
    }
    this.moose.update(dt, t)
    if (this.moose.up > 0.5 && Math.random() < dt * 14) {
      const ch = this.moose.chin(tmp2)
      this.spray.emit(ch.x + (Math.random() - 0.5) * 0.3, ch.y, ch.z + (Math.random() - 0.5) * 0.3, 0, -0.5, 0, 0.6, 0.09)
    }
    this.pika.update(dt, t)
    this.squirrel.update(dt, t)

    // The trout jumps now and then, somewhere near the canoe.
    if ((this.troutT -= dt) < 0 && !this.trout.flying) {
      this.troutT = 9 + Math.random() * 7
      const a = this.head + (Math.random() - 0.5) * 2.4
      const d = 6 + Math.random() * 6
      this.jumpTrout(this.x + Math.sin(a) * d, this.z + Math.cos(a) * d)
    }
    const was = this.trout.flying
    this.trout.update(dt, t)
    if (was && !this.trout.flying) {
      const p = this.trout.root.localToWorld(tmp.set(0, 0, 0.8))
      this.foam.emit(p.x, 0.02, p.z, 0, 0, 0, 1, 0.9)
      this.spray.burst(p.x, 0.05, p.z, 6, 1, 1.8, 0.09)
      noise(0.12, 0.08, 'bandpass', 1800, 900)
    }
  }

  private jumpTrout(x: number, z: number) {
    const p = { x, z }
    keepOn(p, 0.85)
    this.trout.root.position.set(p.x, 0, p.z)
    this.trout.root.rotation.y = Math.random() * Math.PI * 2
    this.trout.jump(0.9 + Math.random() * 0.6)
    this.counts.jumps++
    this.foam.emit(p.x, 0.02, p.z, 0, 0, 0, 0.9, 0.7)
    sfx.splash()
  }

  private snowPuff(top: Vector3, tapped: boolean) {
    for (let i = 0; i < (tapped ? 40 : 26); i++) {
      const a = Math.random() * Math.PI * 2
      this.snow.emit(top.x + Math.cos(a) * 2, top.y - 3 - Math.random() * 4, top.z + Math.sin(a) * 2, Math.cos(a) * (2 + Math.random() * 3), 1 + Math.random() * 2, Math.sin(a) * (2 + Math.random() * 3), 2.6, 1.1 + Math.random() * 0.8)
    }
    if (tapped) {
      this.counts.snow++
      rumble()
    }
  }

  private dropChunk() {
    const c = this.chunks.find((k) => k.t < 0) ?? this.chunks.reduce((a, b) => (a.t > b.t ? a : b))
    c.t = 0
    c.x = GLACIER.x + (Math.random() - 0.5) * GLACIER.halfWidth * 1.4
    c.z = GLACIER.z + 2.2
    c.y = 2.8
    c.vy = 0
    c.in = false
    c.g.visible = true
    c.g.position.set(c.x, c.y, c.z)
    c.g.rotation.set(Math.random(), Math.random() * 3, 0)
    this.counts.chunks++
    crack()
  }

  private updateChunks(dt: number) {
    for (const c of this.chunks) {
      if (c.t < 0) continue
      c.t += dt
      if (!c.in) {
        c.vy -= 14 * dt
        c.y += c.vy * dt
        c.z += 1.2 * dt
        if (c.y < 0) {
          c.in = true
          this.spray.burst(c.x, 0.1, c.z, 22, 2.6, 4.5, 0.16)
          this.foam.emit(c.x, 0.03, c.z, 0, 0, 0, 1.6, 2.2)
          sfx.splash()
        }
      } else {
        // Bobbing, drifting slowly out onto the lake, then melting away.
        c.z += 0.25 * dt
        c.y = -0.25 + Math.sin(c.t * 2.2) * 0.06
        c.g.rotation.z = Math.sin(c.t * 1.7) * 0.12
        const s = clamp(1 - (c.t - 40) / 6, 0.01, 1)
        c.g.scale.setScalar(s)
        if (s <= 0.01) {
          c.t = -1
          c.g.visible = false
        }
      }
      c.g.position.set(c.x, c.y, c.z)
    }
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const tall = this.tall
    // The chase camera's yaw, kept continuous as the canoe turns round and round (camYaw is never wrapped: a yaw that
    // jumped from +180° to -180° would swing the rig a whole turn). Fixed shots pick their turn nearest to it.
    const chase = (this.camYaw - Math.PI) * DEG
    const near = (deg: number) => deg + 360 * Math.round((chase - deg) / 360)
    if (this.section === 'glide' && this.time < 2.2) {
      // The first look: the whole lake from behind the dock, the glacier at the far end.
      return { center: new Vector3(0, 6, -6), half: tall ? new Vector3(20, 10, 30) : new Vector3(30, 8, 26), yaw: near(0), pitch: 16, follow: false }
    }
    if (this.doneT >= 0 && this.doneT < 5) {
      // The family round the canoe, the glacier behind.
      return { center: new Vector3(this.x, 1.4, this.z - 2.5), half: tall ? new Vector3(5.5, 2.4, 6.5) : new Vector3(8.5, 2.4, 5.5), yaw: near(24), pitch: 20 }
    }
    const f = { x: Math.sin(this.camYaw), z: Math.cos(this.camYaw) }
    const ahead = 1.6 + Math.max(0, this.speed) * 0.35
    const pull = this.mode === 'pull'
    return {
      center: new Vector3(this.x + f.x * ahead, 0.6, this.z + f.z * ahead),
      half: tall ? new Vector3(pull ? 3.4 : 2.8, 1.2, pull ? 7 : 5.4) : new Vector3(pull ? 6.2 : 5, 1.2, pull ? 6 : 4.4),
      yaw: chase,
      pitch: pull ? 34 : 28,
      follow: true,
      minDist: 6,
    }
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
  private ray(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster
  }
  private waterPoint(x: number, y: number, out: Vector3) {
    return this.ray(x, y).ray.intersectPlane(this.plane, out)
  }

  private beginStroke(x: number, y: number) {
    this.stroking = true
    this.side = 0
    this.strokeLen = 0
    this.bladeV = 0
    this.finger = { x, y }
    this.lastFinger = { x, y }
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // On a tap target, wait: a tap pokes it, a drag paddles (strokes can start anywhere).
    if (id) {
      this.pending = { x, y, id, t: this.time }
      return
    }
    this.pending = null
    if (this.mode === 'stroke') this.beginStroke(x, y)
    else {
      this.finger = { x, y }
      this.counts.pulls++
    }
  }
  pointerMove(x: number, y: number, _downX: number, _downY: number, held: boolean) {
    if (!held) return
    this.lastTouch = this.time
    if (this.pending) {
      if (Math.hypot(x - this.pending.x, y - this.pending.y) < 12) return
      const p = this.pending
      this.pending = null
      if (this.mode === 'stroke') this.beginStroke(p.x, p.y)
      else this.counts.pulls++
    }
    this.finger = { x, y }
  }
  pointerUp() {
    if (this.stroking) this.endStroke()
    this.stroking = false
    this.finger = null
    this.pending = null
    if (this.mode === 'pull') this.pullFor = Math.max(this.pullFor, 0)
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) this.counts.pokes++
    if (id === 'maple') {
      this.canoe.wave()
      this.canoe.slap()
      sfx.chirp()
      return
    }
    if (id === 'loon') {
      const who = this.loon.root.visible && !this.loon.under ? this.loon : this.mama
      who.poke()
      loonLaugh(false)
      return
    }
    if (id === 'ducks') {
      for (const d of this.ducks) d.d.poke()
      quack()
      return
    }
    if (id === 'lodge') {
      if (!this.beaver.busy) this.beaver.poke()
      return
    }
    if (id === 'moose') {
      this.moose.poke()
      moo()
      return
    }
    if (id === 'pika') {
      this.pika.poke()
      eep()
      return
    }
    if (id === 'squirrel') {
      this.squirrel.poke()
      sfx.chirp()
      return
    }
    if (id === 'trout') {
      const p = this.trout.root.position
      this.jumpTrout(p.x + (Math.random() - 0.5) * 2, p.z + (Math.random() - 0.5) * 2)
      return
    }
    if (id === 'glacier') {
      this.dropChunk()
      return
    }
    // A peak: snow slides off it.
    const hit = this.ray(x, y).intersectObjects(this.shore.peaks.map((p) => p.mesh), true)[0]
    const water = this.waterPoint(x, y, tmp2)
    if (hit && (!water || hit.distance < water.distanceTo(this.rig.camera.position))) {
      const peak = this.shore.peaks.find((p) => isIn(hit.object, p.mesh))
      if (peak) {
        this.counts.pokes++
        this.snowPuff(peak.top, true)
        return
      }
    }
    if (!water || shoreK(water.x, water.z) > 1) return
    // The water: the rock flour sparkles (and that's finding it); anywhere else, a plop (and sometimes a trout).
    if (Math.hypot(water.x - FLOUR.x, water.z - FLOUR.z) < FLOUR.r) {
      this.sparkle.burst(water.x, 0.2, water.z, 26, 2.2, 2.6, 0.18)
      sounds.sparkle()
      this.counts.pokes++
      if (this.section !== 'glide' && Math.hypot(this.x - FLOUR.x, this.z - FLOUR.z) < FLOUR.r + 6) this.findFlour()
      return
    }
    if (this.mode === 'pull') {
      this.target.set(water.x, 0, water.z)
      keepOn(this.target, 0.94)
      this.pullFor = PULL.tap
    }
    this.foam.emit(water.x, 0.02, water.z, 0, 0, 0, 1, 0.9)
    this.spray.burst(water.x, 0.05, water.z, 6, 1, 1.8, 0.09)
    noise(0.1, 0.08, 'bandpass', 1600, 800)
    if (this.mode === 'stroke' && Math.random() < 0.25 && !this.trout.flying) this.jumpTrout(water.x, water.z)
  }

  // ---------------------------------------------------------------- the hint: how to paddle

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = t - this.lastTouch
    const show = this.doneT < 0 && !this.finger && !(this.section === 'glide' && t < 2.4) && ((this.counts.strokes + this.counts.pulls === 0 && idle > 2.4) || idle > HINT_S)
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    el.dataset.mode = this.mode
    if (!show) return
    const f = this.fwd
    const r = this.right
    const p =
      this.mode === 'stroke'
        ? this.toScreen(tmp.set(this.x - r.x * 1.3 + f.x * (SEAT_Z + 0.8), 0, this.z - r.z * 1.3 + f.z * (SEAT_Z + 0.8)))
        : this.toScreen(tmp.set(this.x + f.x * 9, 0, this.z + f.z * 9))
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | null, height: number, scale = 1.6, lift = 0) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (who && who.visible !== false) {
        const c = this.toScreen(who.localToWorld(tmp.set(0, lift + height * 0.5, 0)))
        const top = this.toScreen(who.localToWorld(tmp2.set(0, lift + height, 0)))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.3, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const cam = this.rig.camera.position
    const close = (o: Object3D, d: number) => (o.getWorldPosition(tmp3).distanceTo(cam) < d ? o : null)
    for (const [id, el] of this.anchorEls) {
      if (id === 'maple') place(el, this.canoe.maple, this.canoe.height, 1.1)
      else if (id === 'loon') {
        const who = this.loon.root.visible && !this.loon.under ? this.loon.root : this.mama.root.visible && !this.mama.under ? this.mama.root : null
        place(el, who, 1.3, 2)
      } else if (id === 'ducks') place(el, close(this.ducks[0].d.root, 45), 0.5, 2.6)
      else if (id === 'lodge') place(el, close(this.shore.lodge, 70), 2.4, 0.9)
      else if (id === 'moose') place(el, close(this.moose.root, 70), this.moose.height, 1)
      else if (id === 'pika') place(el, close(this.pika.root, 60), 0.4, 2.5)
      else if (id === 'squirrel') place(el, close(this.squirrel.root, 50), 0.5, 2.4)
      else if (id === 'trout') place(el, this.trout.flying ? this.trout.root : null, 1.2, 1.6)
      else if (id === 'glacier') place(el, close(this.shore.glacier, 90) ? this.glacierSpot() : null, 4, 0.9)
      el.style.zIndex = id === 'maple' ? '3' : id === 'loon' ? '2' : '1'
    }
  }

  private glacierAnchor = new Group()
  private glacierSpot() {
    if (!this.glacierAnchor.parent) {
      this.glacierAnchor.position.set(GLACIER.x, 0.5, GLACIER.z)
      this.scene.add(this.glacierAnchor)
    }
    return this.glacierAnchor
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const p = this.toScreen(tmp2.set(this.x, 0.5, this.z))
    return {
      section: this.section,
      paddle: this.mode,
      x: +this.x.toFixed(2),
      z: +this.z.toFixed(2),
      heading: Math.round(wrap(this.head) * DEG),
      speed: +this.speed.toFixed(2),
      spin: +this.spin.toFixed(2),
      travel: +this.travel.toFixed(1),
      stroking: this.stroking,
      side: this.side,
      bladeIn: this.bladeIn,
      found: this.found,
      glow: +this.glow.toFixed(2),
      loon: this.loonPhase,
      loonFinds: this.loonFinds,
      loonDist: +Math.hypot(this.x - this.loonAt.x, this.z - this.loonAt.z).toFixed(1),
      parade: this.parade > 0,
      dizzyNow: this.canoe.isDizzy,
      done: this.doneT >= 0,
      canoe: { x: Math.round(p.x), y: Math.round(p.y) },
      flourAt: (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(tmp2.set(FLOUR.x, 0, FLOUR.z))),
      loonAt: (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(tmp2.set(this.loonAt.x, 0, this.loonAt.z))),
      ...this.counts,
      strokeM: +this.counts.strokeM.toFixed(1),
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

const c1 = new Color()
const c2 = new Color()
const tmpColor = (a: Color, b: Color, k: number) => c1.copy(a).lerp(b, k)
const tmpColor2 = (a: Color, b: Color, k: number) => c2.copy(a).lerp(b, k)

function isIn(o: Object3D | null, g: Object3D) {
  for (let p = o; p; p = p.parent) if (p === g) return true
  return false
}
