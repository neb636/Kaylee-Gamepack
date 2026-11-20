// Red Canoe (planning/around-the-world/canada.md, "Maple's Team"): a glacier lake in Banff, bright turquoise among the
// snowy peaks. Lulu the loon, the best singer in Canada, lives on the far side by the glacier; Kaylee paddles Maple's red
// canoe across to find her (the films round the game ask her to sing at the big game).
//
// The toy (core verb): one finger on the water and the canoe goes there. Maple paddles by herself, stroke after stroke,
// on the side that turns it the right way (alternating when it goes straight); her finger further ahead and she
// paddles faster. A tap sends it a short way. It's the engine's one finger control (engine3d/drive.ts, the same as the
// Whale Watch boat), with the push coming in pulses, one per stroke, and a glide between them: that rhythm, the splash
// of each catch and the wake are the feel. It turns in smooth arcs (never on the spot), slides along a shore instead of
// sticking, and the next nudge always frees it. A mouse is the same: click and hold, or click.
//
// The verb deepens three ways (lake.ts has where everything is): glide (calm water, the duck family follows like a
// parade), where the blue comes from (the glacier stream's milky rock flour in the north-west corner: paddle into it and
// the lake glows bluer), then follow the bubbles to Lulu (she dives and pops up nearer the glacier each time, laughing;
// the last time her chick is on her back, right under the glacier, and the whole lake glows turquoise).
//
// The lake is the shared engine3d/water.ts, see-through, over a mirror image of the shore and the mountains: that's the
// reflection, and the canoe's wake ripples over it. Built for engine3d/View3D.tsx. The paddling's numbers are feel-lab
// knobs (?feel=1), with a graph of her finger against what the canoe does.
import { Color, Fog, Group, Mesh, Plane, Raycaster, RingGeometry, MeshBasicMaterial, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, say, sounds, spendHint, stopSpeaking, type Line, Timers } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Driver, type Feel } from '../../../../engine3d/drive'
import { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import type { AnimalId } from '../../book/animals'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { Canoe, CANOE_LEN, SEAT_Z } from './boat'
import { snd } from './sounds'
import { Beaver, Duck, Eagle, Goat, Loon, Marmot, Pika, Squirrel, Trout } from './critters'
import { DUCKS, EAGLE_Y, FAMILY, FLOUR, GLACIER, GLIDE_M, inward, keepOn, LAKE_DULL, LAKE_GLOW, landY, LODGE, MARMOT, MOOSE, PADDLE_K, PIKA, shoreK, SQUIRREL, STARTS } from './lake'
import { Moose } from './moose'
import type { CanoeSection } from './sections'
import { buildClouds, buildShore, buildSky, goatSpot, mirror, pileY, SKY, type Shore } from './shore'
import { TO_DEG, damp, wrapAngle } from '../../../../../sdk/math'

const FILE = 'src/world/places/canada/activities/canoe/paddle.ts'
/** Her finger on the water: where the canoe goes, and how fast (engine3d/drive.ts). */
const HELM = knobs('canoe', 'Paddling to her finger', FILE, {
  top: { value: 4.6, min: 1.5, max: 9, step: 0.1, label: 'Top speed', unit: 'm/s', note: 'cruising speed with her finger far ahead' },
  accel: { value: 2.6, min: 0.5, max: 8, step: 0.1, label: 'Push per stroke', unit: 'm/s²', note: 'how hard each stroke pushes while the blade is in the water (the average is about two thirds of this)' },
  glide: { value: 0.22, min: 0, max: 1.5, step: 0.01, label: 'Slows between strokes', unit: '/s', note: 'drag while the blade is out of the water: higher = a bigger surge and slow-down with each stroke' },
  coast: { value: 0.3, min: 0.05, max: 1.5, step: 0.01, label: 'Coasting drag', unit: '/s', note: 'how fast it slows down when she lets go (lower = glides further)' },
  turn: { value: 0.95, min: 0.3, max: 2.5, step: 0.05, label: 'Turn rate', unit: 'rad/s', note: 'how fast it swings round at cruising speed (stopped, half as fast: it never spins on the spot)' },
  grip: { value: 2.6, min: 0.5, max: 10, step: 0.1, label: 'Keel', unit: '/s', note: 'how quickly a sideways slide dies out (low = it skids round turns)' },
  near: { value: 2.6, min: 1, max: 8, step: 0.25, label: 'Crawl when this close', unit: 'm', note: 'her finger this close to the canoe = a slow paddle' },
  far: { value: 16, min: 6, max: 40, step: 0.5, label: 'Full speed from', unit: 'm', note: 'her finger this far ahead = full speed and quick strokes' },
  dead: { value: 0.14, min: 0, max: 0.5, step: 0.01, label: 'Straight-ahead zone', unit: 'rad', note: 'a finger this close to straight ahead goes straight' },
  tap: { value: 8, min: 2, max: 20, step: 0.5, label: 'A tap goes', unit: 'm', note: 'a tap on the water sends the canoe this far toward it (or to the spot, if nearer)' },
  camera: { value: 0.4, min: 0, max: 1, step: 0.05, label: 'Camera turns with it', note: '0 = slow and steady, 1 = right behind the canoe all the time' },
})
/** Maple's strokes: the rhythm. */
const STROKE = knobs('canoeStroke', 'Maple paddling', FILE, {
  slow: { value: 0.75, min: 0.3, max: 2, step: 0.05, label: 'Strokes a second, slow', note: 'her finger close to the canoe' },
  fast: { value: 1.45, min: 0.5, max: 3, step: 0.05, label: 'Strokes a second, fast', note: 'her finger far ahead' },
  catch: { value: 0.55, min: 0.3, max: 0.8, step: 0.01, label: 'Blade in the water', note: 'share of each stroke the blade pulls (the rest it swings forward through the air)' },
  side: { value: 0.22, min: 0, max: 1, step: 0.01, label: 'Paddles one side to turn at', unit: 'rad/s', note: 'turning faster than this, she paddles on the side that turns it; slower, she swaps sides every stroke' },
  dizzy: { value: 0.75, min: 0.3, max: 2.5, step: 0.05, label: 'Dizzy at', unit: 'rad/s', note: 'going round in circles faster than this for 4 s makes Maple dizzy (a silly reaction)' },
})

export interface CanoeStart {
  section: CanoeSection
}
export interface CanoeEvents {
  /** She reached the next part (the address bar follows). */
  section(s: CanoeSection): void
  /** She found the rock flour (the line at the bottom says why the lake is blue). */
  found(): void
  /** How far through the four parts she is (glide, the blue, the loon, the family). */
  progress(done: number): void
  /** The loon family by the glacier. */
  done(): void
}

/** The parts that fill the stars: glide, where the blue comes from, follow the loon, the loon family. */
export const CANOE_PARTS = 4

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
  { id: 'marmot', label: 'The marmot', kind: 'thing' },
  { id: 'eagle', label: 'The bald eagle', kind: 'thing' },
  { id: 'goat', label: 'The mountain goat', kind: 'thing' },
  { id: 'logs', label: 'The log jam', kind: 'thing' },
]

const ORDER: CanoeSection[] = ['story', 'glide', 'stream', 'loon', 'glacier']
/** The chase camera's tilt: high enough to see the water ahead, where her finger goes. */
const PITCH = 24
/** Seconds after the payoff starts that the stamp comes (the celebration plays first). */
export const DONE_S = 7
const HINT_S = 8
/** The lake's colors: before she finds the rock flour, and glowing turquoise at the end. */
const DULL = { deep: new Color(LAKE_DULL[0]), shallow: new Color(LAKE_DULL[1]) }
const GLOW = { deep: new Color(LAKE_GLOW[0]), shallow: new Color(LAKE_GLOW[1]) }
/** The loon: how close counts as finding her, and how that grows when it's taking a while. */
const LOON_NEAR = 6
const LOON_NEAR_MAX = 11
const LOON_FINDS = 3

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()

// ---- Sounds: the recorded ones are sounds.ts (snd); these little synth ones have no clip.
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
const rumble = () => noise(1.4, 0.07, 'lowpass', 320, 110, 0, 0.7)
/** The marmot's long whistle, the eagle's thin scream, the goat's bleat, a log knocking on a log. */
const whistle = () => tone(2500, 2900, 0.5, 0.05, 'sine')
const scream = () => [0, 0.14, 0.26].forEach((d, i) => tone(2100 - i * 150, 1500 - i * 100, 0.12, 0.035, 'sawtooth', d))
const bleat = () => {
  tone(420, 380, 0.42, 0.05, 'sawtooth')
  tone(840, 760, 0.42, 0.015, 'triangle')
}
const clonk = () => [0, 0.11].forEach((d, i) => tone(240 - i * 40, 150, 0.12, 0.12, 'triangle', d))
const wheee = () => {
  tone(520, 1250, 0.45, 0.05, 'triangle')
  tone(1250, 480, 0.6, 0.05, 'triangle', 0.45)
}
const loonLaugh = (wail = false) => snd.laugh(wail)

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
  /** Its delayed callbacks: cancelled when it's disposed. */
  readonly timers = new Timers()
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
  private stopBed: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: CanoeSection

  // ---- The canoe: the engine's one finger control drives it (engine3d/drive.ts); x, z, head, vx, vz and spin are
  // copied from it each frame for everything else that reads them.
  private canoe: Canoe
  private shadow: Mesh
  private feel: Feel
  private d: Driver
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
  /** Seconds the canoe has spent against a shore (QA). */
  private shoreS = 0

  // ---- Her finger, and Maple's strokes.
  private finger: { x: number; y: number } | null = null
  private pending: { x: number; y: number; id?: string; t: number } | null = null
  private target = new Vector3()
  private marker: Mesh
  /** Strokes so far (+ how far through this one, 0..1); which side the blade is on (right +1, left -1). */
  private strokeT = 0
  private paddling = false
  private side = 1
  private bladeIn = false
  /** How hard she's asking: her finger near the canoe 0 .. far ahead 1. */
  private urge = 0
  private splashCool = 0
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
  private marmot: Marmot
  private marmotT = 12
  private eagle: Eagle
  private eagleC = new Vector3()
  private eagleA = 0
  private eagleDip = 0
  private goat: Goat
  private logsBob = -1
  private clouds: Group
  private cloudsM: Group

  // ---- The story and Sparkle's help.
  private storyT = 0
  private storyLeft = false
  private idleSaid = -100
  private sectionT = 0
  private hintsSaid = 0
  private pokesOf = new Map<string, number>()
  private lastShore = -100
  private dead = false
  private parts = 0

  private foam: Particles
  private glowFoam: Particles
  private spray: Particles
  private sparkle: Particles
  private snow: Particles
  private bubbles: Particles

  private lastTouch = 0
  private counts = { strokes: 0, holds: 0, taps: 0, bumps: 0, dizzy: 0, parades: 0, pokes: 0, snow: 0, chunks: 0, jumps: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: CanoeStart,
    private events: CanoeEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 160, 820)
    applyBands()
    // (A wide lens, so the Ten Peaks stand over the lake behind the canoe.)
    this.rig.fov = 58
    this.rig.lag = 0.35
    this.rig.camera.far = 1500
    this.section = start.section

    // ---- The shore, its reflection under the see-through water, the water.
    this.shore = buildShore(bag)
    scene.add(buildSky(bag), this.shore.land, this.shore.shallows, this.shore.flour, this.shore.logs)
    this.reflection = mirror(this.shore.land)
    scene.add(this.reflection)
    // The clouds turn slowly round the sky, and so does their reflection.
    this.clouds = buildClouds(bag)
    this.cloudsM = mirror(this.clouds)
    scene.add(this.clouds, this.cloudsM)
    this.water = new Water({ size: 1600, deep: DULL.deep, shallow: DULL.shallow, haze: SKY, hazeNear: 130, hazeFar: 760, opacity: 0.62 }, bag)
    scene.add(this.water.mesh)
    this.stopBed = snd.lake()

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
    this.feel = { top: 0, boost: 1.4, accel: 0, coast: 0, turn: 0, grip: 0, near: 0, far: 0, dead: 0, lean: 0.08 }
    this.d = new Driver(this.feel)
    this.d.place(s0.x, s0.z, s0.h)

    // Where she's sending it: a pink ring on the water.
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
    this.moose = new Moose(bag, 3.2)
    this.moose.root.position.set(MOOSE.x, -0.95, MOOSE.z)
    this.moose.root.rotation.y = MOOSE.h
    scene.add(this.moose.root)
    // The pika among the rock pile's lower boulders, the marmot on top (toy-sized, so they read from the water).
    this.pika = new Pika(bag)
    this.pika.root.scale.setScalar(2)
    this.pika.root.position.set(PIKA.x, pileY(PIKA.x, PIKA.z) + 0.35, PIKA.z)
    this.pika.root.rotation.y = Math.atan2(-PIKA.x, -PIKA.z)
    scene.add(this.pika.root)
    this.marmot = new Marmot(bag)
    this.marmot.root.scale.setScalar(1.6)
    this.marmot.root.position.set(MARMOT.x, pileY(MARMOT.x, MARMOT.z) + 0.25, MARMOT.z)
    this.marmot.root.rotation.y = Math.atan2(-MARMOT.x, -MARMOT.z)
    scene.add(this.marmot.root)
    // The mountain goat on his ledge, and the bald eagle circling high over the lake.
    this.goat = new Goat(bag)
    const gs = goatSpot()
    this.goat.root.scale.setScalar(1.5)
    this.goat.root.position.set(gs.x, gs.y, gs.z)
    this.goat.root.rotation.y = gs.h
    scene.add(this.goat.root)
    this.eagle = new Eagle(bag)
    this.eagle.root.scale.setScalar(1.5)
    scene.add(this.eagle.root)
    this.squirrel = new Squirrel(bag)
    this.squirrel.root.scale.setScalar(1.5)
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
    const at = ORDER.indexOf(start.section)
    if (start.section === 'loon' || start.section === 'glacier') {
      this.found = true
      this.glow = this.glowGoal = 0.6
    }
    this.parts = Math.max(0, at - 1)
    this.events.progress(this.parts)
    if (start.section === 'loon') this.startLoon()
    if (start.section === 'glacier') this.reachFamily()
    // A section link starts playing at once; the bare link opens with Maple's hello (the story). (After the way-in film
    // the game starts at `glide`: RedCanoe.tsx.)
    else if (start.section !== 'story') this.timers.later(() => this.go(start.section), 400)
    this.setGlow()
    this.placeCanoe(0)
    this.eagleC.set(this.x, EAGLE_Y, this.z - 20)

    this.unwatch = watch('canoe', () => ({
      'her finger: near 0 .. far 1': [this.urge, 1.2],
      'blade in water': [this.bladeIn ? 1 : 0, 1.2],
      'side (left - / right +)': [this.side, 1.2],
      'speed (m/s)': [this.speed, 6],
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
    this.sectionT = 0
    this.hintsSaid = 0
    this.events.section(s)
    this.go(s)
  }

  /** Fills a star: one per part she finishes. */
  private progress(n: number) {
    if (n <= this.parts) return
    this.parts = n
    this.events.progress(n)
  }

  // ---------------------------------------------------------------- talk: Maple's story, Sparkle's help

  private saying: Promise<void> = Promise.resolve()
  /** Says a line now (interrupting), or after whatever is being said (`after`). */
  private talk(line: Line, after = false) {
    if (this.dead) return this.saying
    this.saying = after ? this.saying.then(() => (this.dead ? undefined : say(line, { interrupt: false }))) : say(line)
    return this.saying
  }

  /** Each part begins: Sparkle says what to do (one line), Maple sometimes adds hers. */
  private go(s: CanoeSection) {
    if (this.dead) return
    if (s === 'glide') this.talk(L.canoe.go)
    else if (s === 'stream') {
      this.progress(1)
      this.talk(L.canoe.stream)
      this.talk(L.canoe.streamMaple, true)
      this.canoe.wave()
    } else if (s === 'loon') {
      this.progress(2)
      // (After the rock flour's lines, if they're still going.)
      this.talk(L.canoe.loon, this.foundT >= 0)
    }
  }

  private stuckSaid = 0
  private loonHinted = false
  /** Help when she's stuck, never a "wrong": no paddling for 8 s, Sparkle says how (the hand shows it too); paddling
   *  round without finding the milky water or the loon, Sparkle points her there (the sparkles and the current help). */
  private helpIfStuck(t: number) {
    if (this.section === 'story' || this.doneT >= 0) return
    const idle = t - this.lastTouch
    if (idle > HINT_S && t - this.idleSaid > 16 && this.hintsSaid < 2) {
      this.idleSaid = t
      this.hintsSaid++
      if (spendHint(L.canoe.hint)) this.talk(L.canoe.hint)
      return
    }
    if (this.section !== 'stream') this.stuckSaid = 0
    if (this.section === 'stream' && !this.found && this.stuckSaid < 2 && this.sectionT > 14 + this.stuckSaid * 16 && t - this.idleSaid > 6) {
      this.stuckSaid++
      this.idleSaid = t
      if (spendHint(L.canoe.streamHint)) this.talk(L.canoe.streamHint)
      this.canoe.wave()
    }
    if (this.loonPhase !== 'float') this.loonHinted = false
    else if (!this.loonHinted && this.loonT > 10 && t - this.idleSaid > 6) {
      this.loonHinted = true
      this.idleSaid = t
      if (spendHint(L.canoe.loonHint)) this.talk(L.canoe.loonHint)
    }
  }

  /** The story ends (Maple has asked, or she tapped): off we go. */
  private endStory() {
    if (this.section !== 'story') return
    this.enter('glide')
  }

  /** She poked an animal: its card pops up in Maple's book the first time (Sparkle names it). Returns how many times. */
  private poked(id: string, animal?: AnimalId) {
    const n = (this.pokesOf.get(id) ?? 0) + 1
    this.pokesOf.set(id, n)
    if (animal) meet(animal)
    return n
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.water.update(t)
    this.shore.stream.update(t)
    this.splashCool -= dt
    this.bumpCool -= dt
    this.sectionT += dt
    // The story: Maple waves from the canoe at the dock and asks her question; then off we go (a tap skips it).
    if (this.section === 'story') {
      const was = this.storyT
      this.storyT += dt
      if (was < 0.6 && this.storyT >= 0.6) {
        this.canoe.wave()
        void this.talk(L.canoe.story).then(() => (this.storyLeft = true))
      }
      if ((this.storyLeft && this.storyT > 3.2) || this.storyT > 8) this.endStory()
    }
    this.helpIfStuck(t)

    // A finger held still on something (the glacier, Lulu) paddles the canoe there too.
    if (this.pending && t - this.pending.t > 0.3) {
      this.finger = { x: this.pending.x, y: this.pending.y }
      this.pending = null
      this.counts.holds++
    }
    this.steer()
    this.strokes(dt)
    this.move(dt)
    this.story(dt, t)
    this.updateAnimals(dt, t)
    this.updateChunks(dt)
    this.placeCanoe(dt)
    for (const p of [this.foam, this.glowFoam, this.spray, this.sparkle, this.snow, this.bubbles]) p.update(dt)

    // The lake's color glows toward where the story is.
    if (Math.abs(this.glowGoal - this.glow) > 0.001) {
      this.glow += (this.glowGoal - this.glow) * damp(dt, 0.8)
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

    // The clouds drift round the sky (their reflection with them).
    this.clouds.rotation.y = this.cloudsM.rotation.y = t * 0.004
    this.lights.follow(this.x, 0, this.z)
    this.camYaw += wrapAngle(this.head - this.camYaw) * damp(dt, 0.4 + HELM.camera * 4)
    this.rig.lag = this.doneT >= 0 && this.doneT < 5 ? 0.9 : this.section === 'story' || (this.section === 'glide' && this.sectionT < 1.5) ? 1.1 : 0.35
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  private setGlow() {
    const k = this.glow
    this.water.setColors(tmpColor(DULL.deep, GLOW.deep, k), tmpColor2(DULL.shallow, GLOW.shallow, k), SKY)
  }

  // ---------------------------------------------------------------- her finger: where the canoe goes

  /** Where her finger is on the water (or, up in the mountains or the sky, as far as the lake goes that way), kept a
   *  little way off the shore so the canoe can always get there. */
  private fingerWater(px: number, py: number, out: Vector3) {
    const ray = this.ray(px, py).ray
    if (!ray.intersectPlane(this.plane, out) || out.distanceTo(ray.origin) > 160) {
      const l = Math.hypot(ray.direction.x, ray.direction.z) || 1
      out.set(this.x + (ray.direction.x / l) * 60, 0, this.z + (ray.direction.z / l) * 60)
    }
    keepOn(out, 0.86)
    return out
  }

  private steer() {
    const d = this.d
    const locked = this.section === 'story' || (this.doneT >= 0 && this.doneT < 1.5)
    if (locked) {
      d.stop()
      this.marker.visible = false
      return
    }
    const f = this.finger
    if (f) {
      const p = this.fingerWater(f.x, f.y, tmp)
      d.hold(p.x, p.z)
      this.target.copy(p)
    } else d.release()
    const g = d.goal
    this.marker.visible = !!g
    if (g) {
      this.marker.position.set(g.x, 0.05, g.z)
      this.marker.scale.setScalar((f ? 0.9 : 0.7) + Math.sin(this.time * 6) * 0.1)
    }
    // How hard she's asking: her finger far ahead = quick strokes, near = slow ones.
    const dist = g ? Math.hypot(g.x - this.x, g.z - this.z) : 0
    this.urge = g ? clamp((dist - HELM.near) / Math.max(1, HELM.far - HELM.near)) : 0
  }

  /** A tap on the water: the canoe paddles a short way toward it (all the way, if it's near). */
  private sendTo(wx: number, wz: number) {
    const dx = wx - this.x
    const dz = wz - this.z
    const dist = Math.hypot(dx, dz) || 1
    const k = Math.min(1, HELM.tap / dist)
    const p = { x: this.x + dx * k, z: this.z + dz * k }
    keepOn(p, 0.86)
    // (A tap behind it: still a short happy arc round, never a spin on the spot.)
    this.d.goto(p.x, p.z)
  }

  // ---------------------------------------------------------------- Maple's strokes

  /** Maple paddles by herself while the canoe is going somewhere: a stroke a beat, quicker the further her finger is.
   *  Each stroke is a pulse of push (the blade in the water) and a glide (the blade swinging forward through the air),
   *  on the side that turns the canoe the way it's turning, or side to side going straight. */
  private strokes(dt: number) {
    const d = this.d
    const going = d.driven
    // A stroke under way finishes even after she lets go; a new one starts only while it's going somewhere.
    if (going || (this.paddling && this.strokeT % 1 > 0.02)) {
      const rate = STROKE.slow + (STROKE.fast - STROKE.slow) * this.urge
      const was = this.strokeT
      this.strokeT += dt * rate
      this.paddling = true
      if (Math.floor(this.strokeT) !== Math.floor(was)) {
        // The next stroke: which side?
        if (!going) {
          this.paddling = false
          this.strokeT = Math.floor(this.strokeT)
        } else {
          const turn = this.spin
          this.side = Math.abs(turn) > STROKE.side ? (turn > 0 ? 1 : -1) : -this.side
        }
      }
    } else this.paddling = false
    const q = this.strokeT % 1
    const inWater = this.paddling && q < STROKE.catch
    // The catch: the blade goes in with a splash and a swish.
    if (inWater && !this.bladeIn) {
      const p = this.canoe.bladeWorld(tmp)
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 0.9, 0.8)
      if (this.splashCool <= 0) {
        this.splashCool = 0.2
        this.spray.burst(p.x, 0.1, p.z, 5 + Math.round(this.urge * 6), 1.2, 1.8 + this.urge, 0.1)
      }
      ;(this.counts.strokes++ % 2 ? snd.stroke2 : snd.stroke)()
      this.canoe.rock(-this.side * 0.25)
    }
    if (!inWater && this.bladeIn) snd.drip()
    this.bladeIn = inWater
    // The push comes in pulses: strong while the blade pulls, nothing while it swings forward (and the canoe glides,
    // slowing a little). Between her finger's strokes the driver keeps steering, smoothly.
    const pull = inWater ? Math.sin((q / STROKE.catch) * Math.PI) * 1.6 : 0
    this.feel.accel = HELM.accel * pull
    if (inWater && Math.random() < dt * 20) {
      const p = this.canoe.bladeWorld(tmp)
      ;(this.found ? this.glowFoam : this.foam).emit(p.x, 0.03, p.z, 0, 0, 0, 1.1, 0.45)
    }
    // Where the blade is: back along the hull through the water, then up and forward through the air.
    const along = inWater ? SEAT_Z + 1.3 - (q / STROKE.catch) * 2.4 : SEAT_Z - 1.1 + ((q - STROKE.catch) / (1 - STROKE.catch)) * 2.4
    this.bladeLocal.set(-this.side * 0.82, inWater ? -0.16 : 0.32 + Math.sin(((q - STROKE.catch) / (1 - STROKE.catch)) * Math.PI) * 0.12, along)
  }

  // ---------------------------------------------------------------- the canoe on the water

  private move(dt: number) {
    const d = this.d
    const f = this.feel
    f.top = HELM.top
    f.coast = HELM.coast
    f.turn = HELM.turn
    f.grip = HELM.grip
    f.near = HELM.near
    f.far = HELM.far
    f.dead = HELM.dead
    if (!d.driven) f.accel = HELM.accel
    // Near the shore, the canoe turns gently back toward open water (it never gets stuck facing the beach).
    const k0 = shoreK(d.x, d.z)
    if (k0 > 0.8 && !d.driven) {
      const n = inward(d.x, d.z)
      const facing = Math.sin(d.heading) * n.x + Math.cos(d.heading) * n.z
      if (facing < 0.3) d.heading += wrapAngle(Math.atan2(n.x, n.z) - d.heading) * Math.min(1, dt * 0.6 * (k0 - 0.8) * 10)
    }
    const before = { x: d.x, z: d.z }
    d.step(dt)
    // Between strokes it glides and slows a little; the payoff eases it to a stop by the glacier.
    const slow = (this.paddling && !this.bladeIn ? HELM.glide : 0) + (this.doneT >= 0 && this.doneT < 3 ? 1.5 : 0)
    if (slow > 0) {
      const k = Math.exp(-slow * dt)
      d.vx *= k
      d.vz *= k
    }
    // The stream's current helps her to the milky water if it's taking a while.
    if (this.section === 'stream' && !this.found && this.streamT > 18) {
      const dx = FLOUR.x - d.x
      const dz = FLOUR.z - d.z
      const l = Math.hypot(dx, dz) || 1
      d.vx += (dx / l) * 0.55 * dt
      d.vz += (dz / l) * 0.55 * dt
    }
    // The shore: it slides along the pebbles (the driver turns its bow along them), a soft bump if it came in fast.
    const p = { x: d.x, z: d.z }
    if (keepOn(p, PADDLE_K) > 0) {
      d.x = p.x
      d.z = p.z
      const n = inward(p.x, p.z)
      const v = d.bounce(n.x, n.z, 0.25)
      this.shoreS += dt
      if (v > 0.9 && this.bumpCool <= 0) {
        this.bumpCool = 0.8
        this.counts.bumps++
        snd.bump()
        this.canoe.rock(0.35)
        // (A silly bump, not an "oops": Maple giggles, now and then.)
        if (this.time - this.lastShore > 14) {
          this.lastShore = this.time
          this.talk(L.canoe.bonk, true)
        }
      }
    }
    this.x = d.x
    this.z = d.z
    this.head = d.heading
    this.vx = d.vx
    this.vz = d.vz
    this.spin = d.yawRate
    this.travel += Math.hypot(d.x - before.x, d.z - before.z)
    // Round and round in circles (her finger held off to one side): Maple gets dizzy.
    if (Math.abs(this.spin) > STROKE.dizzy && Math.abs(this.speed) > 1) this.dizzyFor += dt
    else this.dizzyFor = Math.max(0, this.dizzyFor - dt * 2)
    if (this.dizzyFor > 4 && !this.canoe.isDizzy) {
      this.dizzyFor = 0
      this.canoe.dizzy()
      this.counts.dizzy++
      wheee()
      if (this.counts.dizzy < 4) this.talk(L.canoe.dizzy)
    }
    // The wake: ripples off the bow and the stern (turquoise once she has found the rock flour), and the glide's hiss.
    const fw = this.fwd
    const r = this.right
    const sp = Math.hypot(this.vx, this.vz)
    if (sp > 0.4 && Math.random() < dt * (4 + sp * 6)) {
      const back = Math.random() < 0.5 ? -1 : 1
      const ox = fw.x * back * CANOE_LEN * 0.45 + r.x * (Math.random() - 0.5) * 0.8
      const oz = fw.z * back * CANOE_LEN * 0.45 + r.z * (Math.random() - 0.5) * 0.8
      ;(this.found && Math.random() < 0.7 ? this.glowFoam : this.foam).emit(this.x + ox, 0.02, this.z + oz, -this.vx * 0.1, 0, -this.vz * 0.1, 1.4 + sp * 0.3, 0.35 + sp * 0.08)
    }
    if (sp > 1.6) snd.glide(sp)
  }

  private placeCanoe(dt: number) {
    const root = this.canoe.root
    root.position.set(this.x, swell(this.x, this.z, this.time) * 0.5, this.z)
    root.rotation.y = this.head
    this.shadow.position.set(this.x, 0.015, this.z)
    this.shadow.rotation.z = -this.head
    let look: Vector3 | null = null
    const near = (v: Vector3, d: number) => v.distanceTo(tmp3.set(this.x, v.y, this.z)) < d
    if (this.section === 'story' || (this.doneT > 3 && this.doneT < 6)) look = this.rig.camera.position
    else if (this.loon.root.visible && !this.loon.under) look = this.loon.root.position
    else if (this.mama.root.visible && !this.mama.under) look = this.mama.root.position
    else if (this.section === 'stream' && !this.found) look = tmp2.set(FLOUR.x, 0.3, FLOUR.z)
    else if (this.trout.flying) look = this.trout.root.position
    else if (this.beaver.busy) look = this.beaver.root.position
    else if (near(this.ducks[0].d.root.position, 9)) look = this.ducks[0].d.root.position
    else if (near(this.moose.root.position, 16)) look = tmp2.copy(this.moose.root.position).setY(1.5)
    const showBlade = this.paddling
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
      if (this.foundT > 5 && this.section === 'stream') {
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
    snd.stream()
    this.canoe.cheer()
    this.events.found()
    this.talk(L.canoe.foundMaple)
    this.talk(L.canoe.found, true)
  }

  /** The loon's first dive: she pops up ahead, laughs and goes under. */
  private startLoon() {
    this.loonFinds = 0
    this.loonPhase = 'bubbles'
    this.loonT = 0
    this.pickLoonSpot(12, 16)
    this.mama.root.visible = false
  }

  /** Somewhere between the canoe and the glacier, a little to one side, on open water: each time Lulu comes up she's
   *  nearer home, so following her takes the canoe across the lake. */
  private pickLoonSpot(near: number, far: number) {
    const home = Math.atan2(FAMILY.x - this.x, FAMILY.z - this.z)
    const left = Math.hypot(FAMILY.x - this.x, FAMILY.z - this.z)
    for (let i = 0; i < 40; i++) {
      const a = home + (Math.random() - 0.5) * (i < 25 ? 1 : 2.4)
      const d = Math.min(near + Math.random() * (far - near), Math.max(6, left - 8))
      const x = this.x + Math.sin(a) * d
      const z = this.z + Math.cos(a) * d
      if (shoreK(x, z) < 0.8 && Math.hypot(x - FLOUR.x, z - FLOUR.z) > 4 && Math.hypot(x - FAMILY.x, z - FAMILY.z) > 6) {
        this.loonAt.set(x, 0, z)
        return
      }
    }
    this.loonAt.set((this.x + FAMILY.x) / 2, 0, (this.z + FAMILY.z) / 2)
  }

  private updateLoon(dt: number, t: number) {
    const phase = this.loonPhase
    this.loonT += dt
    const final = this.loonFinds >= LOON_FINDS
    const who = final ? this.mama : this.loon
    const dist = Math.hypot(this.x - this.loonAt.x, this.z - this.loonAt.z)
    const reach = LOON_NEAR + (LOON_NEAR_MAX - LOON_NEAR) * clamp((this.loonT - 12) / 20)
    if (phase === 'bubbles') {
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
    } else if (phase === 'float') {
      // She floats there, facing the canoe, laughing now and then, until the canoe comes close. Taking a long while,
      // she swims toward the canoe herself.
      const face = Math.atan2(this.x - who.root.position.x, this.z - who.root.position.z)
      who.root.rotation.y += wrapAngle(face - who.root.rotation.y) * damp(dt, 2)
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
          who.flap()
          if (this.loonFinds === 1) meet('loon')
          if (this.loonFinds >= LOON_FINDS) this.progress(3)
          this.talk(L.canoe.loonFound[(this.loonFinds - 1) % L.canoe.loonFound.length], true)
        }
      }
    } else if (phase === 'found') {
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
    } else if (phase === 'family') {
      // The payoff: Lulu, her chick on her back, swims slowly round the canoe, laughing now and then; the chick squeaks.
      const r = 4.2
      const b = t * 0.32 + 0.6
      const l = this.mama
      l.root.position.set(this.x + Math.cos(b) * r, 0, this.z + Math.sin(b) * r)
      l.root.rotation.y = Math.atan2(-Math.sin(b), Math.cos(b))
      if ((this.callT -= dt) < 0) {
        this.callT = 5 + Math.random() * 3
        if (Math.random() < 0.6) {
          l.poke()
          loonLaugh(Math.random() < 0.3)
        } else {
          l.squeak()
          snd.chick()
        }
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
    this.loon.root.visible = false
    this.mama.flap()
    this.glowGoal = 1
    this.doneT = 0
    this.callT = 2.5
    this.enter('glacier')
    this.progress(CANOE_PARTS)
    this.canoe.cheer()
    this.canoe.slap()
    sounds.fanfare()
    loonLaugh(true)
    this.sparkle.burst(this.x, 0.5, this.z, 60, 3.5, 3, 0.2)
    meet('loon')
    this.timers.later(() => (this.mama.squeak(), snd.chick()), 1600)
    this.talk(L.canoe.chick)
    this.talk(L.canoe.family, true)
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
      snd.ducks()
      mom.d.poke()
      if (this.counts.parades < 3) {
        this.talk(L.canoe.parade, true)
        this.canoe.wave()
      }
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
        dk.h += wrapAngle(Math.atan2(dx, dz) - dk.h) * damp(dt, 6)
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
      if (Math.hypot(this.x - p.x, this.z - p.z) < 30) this.timers.later(() => this.canoe.slap(), 500)
    }
    // The moose: grazes on lake weeds; when the canoe glides close he watches it; water drips off his chin.
    const mooseNear = Math.hypot(this.x - MOOSE.x, this.z - MOOSE.z) < 20
    this.moose.watch(mooseNear ? this.canoe.root.position : null)
    this.moose.update(dt, t)
    if (this.moose.up > 0.5 && this.moose.up < 0.97 && Math.random() < dt * 18) {
      const ch = this.moose.chin(tmp2)
      this.spray.emit(ch.x + (Math.random() - 0.5) * 0.3, ch.y, ch.z + (Math.random() - 0.5) * 0.3, 0, -0.5, 0, 0.6, 0.09)
    }
    this.pika.update(dt, t)
    this.squirrel.update(dt, t)
    // The marmot whistles from the top of the rock pile now and then when the canoe is near.
    if ((this.marmotT -= dt) < 0) {
      this.marmotT = 14 + Math.random() * 10
      if (Math.hypot(this.x - MARMOT.x, this.z - MARMOT.z) < 30 && !this.marmot.busy) {
        this.marmot.poke()
        whistle()
      }
    }
    this.marmot.update(dt, t)
    this.goat.update(dt, t)
    // The bald eagle circles over the lake ahead of the canoe (its circle drifts along after it); poked, it dips.
    const f2 = this.fwd
    tmp.set(this.x + f2.x * 26, EAGLE_Y, this.z + f2.z * 26)
    this.eagleC.lerp(tmp, damp(dt, 0.08))
    this.eagleA += dt * 0.22
    this.eagleDip = Math.max(0, this.eagleDip - dt * 0.5)
    const er = 15
    const dip = Math.sin(Math.min(1, this.eagleDip) * Math.PI) * 5
    this.eagle.root.position.set(this.eagleC.x + Math.cos(this.eagleA) * er, EAGLE_Y + Math.sin(t * 0.3) * 1.5 - dip, this.eagleC.z + Math.sin(this.eagleA) * er)
    this.eagle.root.rotation.y = Math.atan2(-Math.sin(this.eagleA), Math.cos(this.eagleA))
    this.eagle.bank = -0.32
    this.eagle.update(dt, t)
    // The log jam bobs after a poke.
    if (this.logsBob >= 0) {
      this.logsBob += dt
      const k = Math.exp(-this.logsBob * 2.2)
      this.shore.logs.position.y = Math.sin(this.logsBob * 9) * 0.12 * k
      this.shore.logs.rotation.z = Math.sin(this.logsBob * 7) * 0.03 * k
      if (this.logsBob > 2.5) this.logsBob = -1
    }

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
      snd.plop()
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
    snd.trout()
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
    snd.ice()
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
    const chase = (this.camYaw - Math.PI) * TO_DEG
    const near = (deg: number) => deg + 360 * Math.round((chase - deg) / 360)
    if (this.section === 'story') {
      // Maple's question: from the bow, a three-quarter look at her face in the stern, the dock and the rock pile behind
      // her (a slow push in); then the camera swings round behind the canoe, to the lake and the Ten Peaks.
      const k = clamp(this.storyT / 5)
      const f = this.fwd
      const mz = this.z - f.z * -SEAT_Z
      const mx = this.x - f.x * -SEAT_Z
      const s = 1.25 - 0.25 * k
      return { center: new Vector3(mx, 1.0, mz), half: tall ? new Vector3(1.4 * s, 1.3 * s, 1.6 * s) : new Vector3(1.9 * s, 1.1 * s, 1.6 * s), yaw: near(145), pitch: 10, follow: false, minDist: 3 }
    }
    if (this.doneT >= 0 && this.doneT < 5) {
      // The family round the canoe, the glacier and the Ten Peaks behind.
      return { center: new Vector3(this.x, 1.3, this.z - 1.5), half: tall ? new Vector3(4.6, 2.2, 5.5) : new Vector3(6.5, 2.2, 4.5), yaw: near(24), pitch: 14 }
    }
    // Behind the canoe, a little above, with plenty of water ahead of it for her finger (the canoe low on the screen,
    // so her hand on the water never covers it).
    const f = { x: Math.sin(this.camYaw), z: Math.cos(this.camYaw) }
    const ahead = 3.2 + Math.max(0, this.speed) * 0.4
    return {
      center: new Vector3(this.x + f.x * ahead, 0.7, this.z + f.z * ahead),
      half: tall ? new Vector3(3.4, 1.3, 7.5) : new Vector3(6.2, 1.3, 6.4),
      yaw: chase,
      pitch: PITCH,
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

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // (A touch during Maple's hello skips it: off we go.)
    if (this.section === 'story') {
      this.endStory()
      return
    }
    // On a tap target, wait: a tap pokes it, a finger held or dragged paddles there.
    if (id) {
      this.pending = { x, y, id, t: this.time }
      return
    }
    this.pending = null
    this.finger = { x, y }
    this.counts.holds++
  }
  pointerMove(x: number, y: number, _downX: number, _downY: number, held: boolean) {
    if (!held) return
    this.lastTouch = this.time
    if (this.pending) {
      if (Math.hypot(x - this.pending.x, y - this.pending.y) < 12) return
      this.pending = null
      this.counts.holds++
    }
    this.finger = { x, y }
  }
  pointerUp() {
    this.finger = null
    this.pending = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (this.section === 'story') {
      this.endStory()
      return
    }
    this.counts.taps++
    if (id) this.counts.pokes++
    if (id === 'maple') {
      const n = this.poked('maple')
      this.canoe.wave()
      this.canoe.slap()
      sfx.chirp()
      if (n % 2 === 1) this.talk(n === 1 ? L.bonjour : L.canoe.pokeMaple[((n - 3) / 2) % L.canoe.pokeMaple.length])
      return
    }
    if (id === 'loon') {
      const who = this.loon.root.visible && !this.loon.under ? this.loon : this.mama
      const n = this.poked('loon', 'loon')
      who.poke()
      if (n % 3 === 0) who.flap()
      loonLaugh(false)
      // The second poke: the loonie (tap-to-hear).
      if (n === 2) this.talk(L.canoe.loonie, true)
      return
    }
    if (id === 'ducks') {
      for (const d of this.ducks) d.d.poke()
      snd.ducks()
      return
    }
    if (id === 'lodge') {
      const n = this.poked('lodge', 'beaver')
      if (!this.beaver.busy) this.beaver.poke()
      if (n === 2) this.talk(L.canoe.beaver, true)
      return
    }
    if (id === 'moose') {
      const n = this.poked('moose', 'moose')
      this.moose.poke()
      moo()
      if (n === 2) this.talk(L.canoe.moose, true)
      return
    }
    if (id === 'pika') {
      this.poked('pika', 'pika')
      this.pika.poke()
      eep()
      return
    }
    if (id === 'marmot') {
      this.poked('marmot', 'marmot')
      this.marmot.poke()
      whistle()
      return
    }
    if (id === 'eagle') {
      this.poked('eagle', 'bald-eagle')
      this.eagle.flap()
      if (this.eagleDip <= 0) this.eagleDip = 1
      scream()
      return
    }
    if (id === 'goat') {
      this.poked('goat', 'mountain-goat')
      this.goat.poke()
      bleat()
      // A little shower of pebbles off the ledge.
      const p = this.goat.root.position
      this.snow.burst(p.x, p.y, p.z, 10, 1.5, 1, 0.12)
      return
    }
    if (id === 'logs') {
      this.poked('logs')
      this.logsBob = 0
      clonk()
      const p = this.shore.logs.position
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 1.4, 2.4)
      return
    }
    if (id === 'squirrel') {
      this.poked('squirrel', 'ground-squirrel')
      this.squirrel.poke()
      sfx.chirp()
      return
    }
    if (id === 'trout') {
      this.poked('trout', 'trout')
      const p = this.trout.root.position
      this.jumpTrout(p.x + (Math.random() - 0.5) * 2, p.z + (Math.random() - 0.5) * 2)
      return
    }
    if (id === 'glacier') {
      const n = this.poked('glacier')
      this.dropChunk()
      if (n === 1) this.talk(L.canoe.glacier, true)
      return
    }
    // A peak: snow slides off it.
    const hit = this.ray(x, y).intersectObjects(this.shore.peaks.map((p) => p.mesh), true)[0]
    const water = this.waterPoint(x, y, tmp2)
    if (hit && (!water || hit.distance < water.distanceTo(this.rig.camera.position))) {
      const peak = this.shore.peaks.find((p) => isIn(hit.object, p.mesh))
      if (peak) {
        // (And the canoe paddles a short way toward it: every tap does something with the canoe too.)
        this.counts.pokes++
        this.snowPuff(peak.top, true)
        const w = this.fingerWater(x, y, tmp2)
        this.sendTo(w.x, w.z)
        return
      }
    }
    // Up on the shore or in the sky: the canoe paddles that way.
    if (!water || shoreK(water.x, water.z) > 1) {
      const w = this.fingerWater(x, y, tmp2)
      this.sendTo(w.x, w.z)
      return
    }
    if (Math.hypot(water.x - FLOUR.x, water.z - FLOUR.z) < FLOUR.r) {
      // The rock flour sparkles (and close by, that's finding it).
      this.sparkle.burst(water.x, 0.2, water.z, 26, 2.2, 2.6, 0.18)
      sounds.sparkle()
      this.counts.pokes++
      if (this.section !== 'glide' && Math.hypot(this.x - FLOUR.x, this.z - FLOUR.z) < FLOUR.r + 6) this.findFlour()
    } else {
      // Anywhere else on the water: a little plop where she tapped.
      this.foam.emit(water.x, 0.02, water.z, 0, 0, 0, 1, 0.9)
      this.spray.burst(water.x, 0.05, water.z, 6, 1, 1.8, 0.09)
      snd.plop()
    }
    // Either way the canoe paddles a short way toward it.
    this.sendTo(water.x, water.z)
  }

  // ---------------------------------------------------------------- the hint: how to paddle

  /** Where the story wants her to paddle now (the milky water, Lulu's bubbles), or null (anywhere: glide). */
  private goal(out: Vector3): Vector3 | null {
    if (this.doneT >= 0 || this.section === 'story') return null
    if (this.section === 'stream' && !this.found) return out.set(FLOUR.x, 0, FLOUR.z)
    if (this.loonPhase === 'bubbles' || this.loonPhase === 'float') return out.set(this.loonAt.x, 0, this.loonAt.z)
    return null
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = t - this.lastTouch
    const show = this.doneT < 0 && !this.finger && this.section !== 'story' && this.sectionT > 1.5 && ((this.counts.holds + this.counts.taps === 0 && idle > 2.4) || idle > HINT_S)
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!show) return
    // The hand presses the water ahead of the canoe, toward wherever she's going.
    const g = this.goal(tmp2)
    let dx = Math.sin(this.head)
    let dz = Math.cos(this.head)
    if (g) {
      const l = Math.hypot(g.x - this.x, g.z - this.z) || 1
      const gx = (g.x - this.x) / l
      const gz = (g.z - this.z) / l
      // (Not straight behind: the hand would be off the screen.)
      if (gx * dx + gz * dz > -0.2) {
        dx = gx
        dz = gz
      }
    }
    const p = this.toScreen(tmp.set(this.x + dx * 9, 0, this.z + dz * 9))
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
      else if (id === 'marmot') place(el, close(this.marmot.root, 60), 0.75, 2.2)
      else if (id === 'goat') place(el, close(this.goat.root, 75), 1.1, 1.8)
      else if (id === 'eagle') place(el, this.eagle.root, 0.7, 3)
      else if (id === 'logs') place(el, close(this.shore.logs, 55), 0.6, 1.2)
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
    const scr = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const g = this.goal(tmp3)
    return {
      section: this.section,
      x: +this.x.toFixed(2),
      z: +this.z.toFixed(2),
      heading: Math.round(wrapAngle(this.head) * TO_DEG),
      speed: +this.speed.toFixed(2),
      spin: +this.spin.toFixed(2),
      travel: +this.travel.toFixed(1),
      driven: this.d.driven,
      paddling: this.paddling,
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
      shoreS: +this.shoreS.toFixed(1),
      canoe: { x: Math.round(p.x), y: Math.round(p.y) },
      flourAt: scr(tmp2.set(FLOUR.x, 0, FLOUR.z)),
      loonAt: scr(tmp2.set(this.loonAt.x, 0, this.loonAt.z)),
      /** Where the story wants her to go, on the screen (null: anywhere); `behind` when it's behind the camera. */
      goalAt: g ? { ...scr(g), behind: g.clone().project(this.rig.camera).z > 1 } : null,
      ...this.counts,
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.timers.dispose()
    this.stopBed()
    this.dead = true
    stopSpeaking()
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
