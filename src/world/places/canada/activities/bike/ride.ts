// Mountain Bike (plan: planning/around-the-world/canada.html): Mont-Sainte-Anne in the fall. Maple wants to ride all the
// way down the mountain to the waterfall: she tells Kaylee in her gondola cabin at the bottom (the story), the gondola
// carries her and her bike up, then Kaylee steers the bike down the forest trail. Maple is the chibi rig on a pink
// kids' mountain bike (rider.ts); the moose in his pond is the rig too, and the chipmunk, woodpecker, porcupine, spring
// peeper, deer, black bear and snowshoe hare are toon critters (critters.ts). Poking each one the first time meets it
// for Maple's animal book. Sparkle says the one instruction, what's new (the two trails, the creek) and a hint when
// she's stuck; Maple whoops in her own voice at the silly moments (leaves, the bell, the splash, the jump).
//
// The toy (core verb): steer the bike. Her finger goes down anywhere and the shared finger wheel appears under it
// (engine3d/wheel.ts, the Nan drive's): pushing it left or right slides where she's steering across the trail for as
// long as she holds it, and the bike, driven by the shared drive control (engine3d/drive.ts, the Nan Pajero's), swoops
// that way, leaning in. Let go and it eases back to the middle of the trail (or of its way). The mountain does the
// going: steeper is faster. The verb deepens three ways down one course (trail.ts): the green trail (wide and gentle,
// leaf piles that burst, stumps that boing, a chipmunk running alongside), berms and bumps (two ways round an island
// of trees: the green way's gentle rollers or the blue way's steep berms, roots, rock hops and doubles), then the creek
// (the bridge on the left or a splash through on the right) and the jump (the kicker on the right, or round it). She
// rolls out in the meadow by the waterfall.
//
// The ground is a height field (Course.ride): on it the bike follows its height; where it drops away faster than it
// can fall (a roller's crest, a rock hop, the kicker), it flies. Built for engine3d/View3D.tsx; nothing here comes from
// Thailand. The steering, the lean and the bounce are feel-lab knobs (?feel=1).
import { Color, Fog, Group, Mesh, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, pick, sounds, spendHint, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { Driver, type Feel } from '../../../../engine3d/drive'
import { blobShadow, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { Water } from '../../../../engine3d/water'
import { FingerWheel } from '../../../../engine3d/wheel'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { Bear, Chipmunk, Deer, Hare, Moose, Peeper, Porcupine, Woodpecker } from './critters'
import { Rider } from './rider'
import { buildClouds, buildCreek, buildFallen, buildFalls, buildForest, buildHills, buildLand, buildProps, buildRainbow, buildSky, buildTrail, FALL, FlowMaterial, Gondola, HANG, onRun, roundWater, SKY } from './scenery'
import type { BikeSection } from './sections'
import { BERMS_END, BRIDGE_HALF, Course, CREEK, CREEK_END, curve, END, FALLS, GREEN_END, H0, half, inCreek, island, JUMP, lane, phi, POND, POOL, rattly, SHOULDER, SPLIT, START, way } from './trail'

const FILE = 'src/world/places/canada/activities/bike/ride.ts'
/** The finger wheel and the handlebars: Dad's numbers from the Nan drive's feel lab (2026-10-27) as the start. */
const STEER = knobs('bars', 'Steering', FILE, {
  slide: { value: 6.5, min: 1, max: 12, step: 0.1, label: 'Slide speed', unit: 'm/s', note: 'how fast a full push slides where she steers across the trail' },
  reach: { value: 1.2, min: 0.4, max: 2.5, step: 0.05, label: 'Wheel size', unit: '×', note: 'how far her finger moves for a full push (smaller = touchier)' },
  dead: { value: 0.15, min: 0, max: 0.4, step: 0.01, label: 'Dead middle', note: 'share of the wheel near the middle that counts as straight' },
  curve: { value: 1.3, min: 1, max: 3, step: 0.05, label: 'Gentle small pushes', note: '1 = even all the way; higher = a small push barely steers' },
  ease: { value: 0.08, min: 0, max: 0.6, step: 0.01, label: 'Smoothing', unit: 's', note: 'how long a quick flick takes to count in full (0 = none)' },
  aim: { value: 7, min: 3, max: 20, step: 0.5, label: 'Aim ahead', unit: 'm', note: 'the nearest point the bike steers toward: closer = sharper, but it wobbles' },
  pull: { value: 1.2, min: 0, max: 4, step: 0.1, label: 'Aim closer when far off', note: 'per meter it is from where she steers: a full push swerves more' },
  turn: { value: 2.4, min: 0.5, max: 5, step: 0.05, label: 'Turn rate', unit: 'rad/s', note: 'how fast the bike can swing its front wheel round' },
  grip: { value: 11, min: 1, max: 16, step: 0.5, label: 'Grip', note: 'how quickly a sideways skid dies out (low = drifty)' },
  back: { value: 1.2, min: 0.3, max: 4, step: 0.1, label: 'Back to the middle', unit: 's', note: 'how slowly it drifts back to the middle of the trail (or its way) after she lets go' },
  camera: { value: 0.35, min: 0, max: 1, step: 0.05, label: 'Camera follows the bike', note: '0 = the camera looks down the trail; 1 = it turns with the bike' },
})
/** The ride down the mountain. */
const RIDE = knobs('bike', 'The ride', FILE, {
  speed: { value: 8, min: 3, max: 16, step: 0.25, label: 'Speed', unit: 'm/s', note: 'how fast she rolls on the green trail' },
  steep: { value: 2.6, min: 0, max: 6, step: 0.1, label: 'Steeper is faster', note: 'how much the steep bits (the berms) speed her up' },
  accel: { value: 3, min: 0.5, max: 10, step: 0.25, label: 'Speeding up', unit: 'm/s²', note: 'how fast she gets rolling' },
  lean: { value: 0.5, min: 0, max: 1.2, step: 0.02, label: 'Lean', unit: 'rad', note: 'how far Maple and the bike lean into a turn at full speed' },
  bank: { value: 1, min: 0, max: 1.5, step: 0.05, label: 'Lean with the berm', note: 'how much she also tips with the banked turns (1 = square to the berm)' },
  pop: { value: 1.15, min: 0.5, max: 2.5, step: 0.05, label: 'Hops off the bumps', unit: '×', note: 'how high the rollers, rocks and the kicker throw her' },
  gravity: { value: 15, min: 6, max: 30, step: 0.5, label: 'Gravity in the air', unit: 'm/s²', note: 'lower = floatier hops and a longer jump' },
  bounce: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Bounce', unit: '×', note: 'how much the bike squashes and springs on bumps and landings' },
  spring: { value: 11, min: 4, max: 24, step: 0.5, label: 'Springiness', note: 'how quickly the squash springs back (lower = boingier, wobblier)' },
})

export interface BikeStart {
  section: BikeSection
  trail: 'green' | 'blue'
}
export interface BikeEvents {
  /** She reached the next stretch (the address bar follows). */
  section(s: BikeSection): void
  /** She picked a way round the island. */
  way(w: 'green' | 'blue'): void
  /** At the bottom by the waterfall. */
  done(): void
  /** Someone speaks: Sparkle (a plain string: an instruction, a hint) or a friend in their own voice. `chat` lines are
   *  Maple's whoops and the animals' words: they never cut anyone off. `voice` false: only show it (a hint the budget
   *  in sdk/hints.ts doesn't let her say). */
  say(line: Line, chat: boolean, voice?: boolean): void
  /** How far down she's got: one part per stretch (green, berms, creek, falls). */
  progress(done: number): void
}

const CABS = 12
export const BIKE_ANCHORS: AnchorInfo[] = [
  { id: 'bike', label: "Maple's bike", kind: 'thing' },
  { id: 'cabin', label: "Maple's gondola", kind: 'thing' },
  ...Array.from({ length: CABS }, (_, i) => ({ id: `car:${i}`, label: 'A gondola', kind: 'thing' as const })),
  { id: 'chipmunk', label: 'The chipmunk', kind: 'thing' },
  { id: 'moose', label: 'The moose', kind: 'thing' },
  { id: 'woodpecker', label: 'The woodpecker', kind: 'thing' },
  { id: 'porcupine', label: 'The porcupine', kind: 'thing' },
  { id: 'frog', label: 'The spring peeper', kind: 'thing' },
  { id: 'deer', label: 'The deer', kind: 'thing' },
  { id: 'bear', label: 'The black bear', kind: 'thing' },
  { id: 'hare', label: 'The snowshoe hare', kind: 'thing' },
]

type Mode = 'story' | 'gondola' | 'ride' | 'done'

const ORDER: BikeSection[] = ['story', 'gondola', 'green', 'berms', 'creek', 'falls']
/** The stretches she rides down (setProgress: one part each). */
const PARTS: BikeSection[] = ['green', 'berms', 'creek', 'falls']
/** Maple's whoops: at most one this often (s). */
const CHAT_S = 3.5
/** The deer among the trees, the black bear far off eating berries, the hare who hops across the trail (s, side). */
const DEER = { s: 468, side: 1, off: 7 }
const BEAR = { s: 236, side: -1, off: 8.5 }
const HARE = { s: 152, side: -1 }
/** No steering for this long: the 👆 shows how. */
const HINT_S = 8
const DEG = 180 / Math.PI
/** The gondola ride: how far up the line it starts (m below the top) and how long it takes (s). */
const GOND_FROM = 170
const GOND_S = 11
/** The story's camera, turned from the gondola's (rad): in front of Maple. */
const STORY_YAW = 1.25
/** Leaf piles (s, lat: + right of the trail, as a share of the edge so they sit right at it) and stumps on the shoulders. */
const PILES: [number, number][] = [
  [42, -0.8],
  [80, 0.85],
  [124, -0.9],
  [168, 0.75],
  [206, -0.7],
  [252, 0.8],
  [330, -0.7],
  [392, -0.75],
  [440, 0.9],
  [505, -0.75],
  [590, 0.8],
  [688, -0.85],
  [760, 0.8],
  [800, -0.75],
]
const STUMPS: [number, number][] = [
  [58, 1],
  [112, -1],
  [186, 1],
  [236, -1],
  [362, -1],
  [462, 1],
  [612, -1],
  [742, -1],
  [790, 1],
]
const WOODPECKER = { s: 66, side: -1 }
const PORCUPINE = { s: 352, side: -1 }

const tmp = new Vector3()
const tmp2 = new Vector3()
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

function bell() {
  tone(2400, 2380, 0.35, 0.07, 'sine')
  tone(3550, 3500, 0.25, 0.03, 'sine')
  tone(2400, 2380, 0.35, 0.07, 'sine', 0.16)
  tone(3550, 3500, 0.25, 0.03, 'sine', 0.16)
}
const knock = () => noise(0.035, 0.18, 'bandpass', 950, 700, 0, 3)
const plank = () => noise(0.03, 0.05, 'bandpass', 520, 420, 0, 2)
const moo = () => {
  tone(118, 96, 0.8, 0.14, 'sawtooth')
  tone(236, 190, 0.8, 0.03, 'triangle')
}
const ribbit = () => [0, 0.13].forEach((d) => tone(330, 230, 0.1, 0.08, 'square', d))
const creak = () => tone(520, 430, 0.35, 0.035, 'triangle')
/** A spring peeper's peep: a short rising whistle, twice. */
const peep = () => [0, 0.55].forEach((d) => tone(2600, 3200, 0.14, 0.035, 'sine', d))
/** A hare's thump of a back foot. */
const thump = () => noise(0.06, 0.12, 'lowpass', 300, 200, 0, 2)
/** A deer's snort and the leaves as she bounds. */
const snort = () => noise(0.25, 0.1, 'bandpass', 1200, 600, 0, 1.2)
/** A bear's soft happy grunt. */
const grunt = () => {
  tone(150, 110, 0.4, 0.1, 'sawtooth')
  tone(300, 220, 0.4, 0.02, 'triangle')
}

interface Pile {
  s: number
  lat: number
  g: Group
  /** Seconds since it burst (-1: there). */
  gone: number
}
interface Stump {
  s: number
  lat: number
  cool: number
}

export class MountainBike implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private course = new Course()
  private gondola: Gondola
  private ground: Mesh
  private ribbon: Mesh
  private forest: ReturnType<typeof buildForest>
  private water: Water
  private pond: Water
  private pool: Water
  private creekFlow: FlowMaterial
  private fallsFlow: FlowMaterial
  private topFlow: FlowMaterial
  private sky: Mesh
  private clouds: Group[]
  private rainbow: Group
  private wheel = new FingerWheel()
  private wheelEl: HTMLElement | null = null
  private hintEl: HTMLElement | null = null
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: BikeSection

  // ---- Maple and her bike.
  private rider: Rider
  private shadow: Mesh
  private d: Driver
  private mode: Mode = 'ride'
  private modeT = 0
  private s = 0
  private lat = 0
  private y = H0
  private vy = 0
  private air = false
  private airT = 0
  /** The ground's own up-and-down speed under her last step (NaN: just landed). */
  private gv = NaN
  private onBridge = false
  private wet = false
  /** Which way a berms link starts her toward (-1 green, 1 blue). */
  private prefer = 0
  private picked: 'green' | 'blue' | null = null
  private steerLat = 0
  private sq = 0
  private sqV = 0
  private pitch = 0
  private roll = 0
  private gondU = 0
  private trailT = 0
  private plankAt = 0
  private bonkCool = 0
  private doneT = -1
  private camYaw = 0

  // ---- Everyone else.
  private chip: Chipmunk
  private chipS = 0
  private moose: Moose
  private pecker: Woodpecker
  private peckSeen = 0
  private porky: Porcupine
  private frog: Peeper
  private frogHome = new Vector3()
  private peepSeen = 0
  private deer: Deer
  private deerHome = { x: 0, z: 0, nx: 0, nz: 0 }
  private bear: Bear
  private hare: Hare
  private hareK = 0
  private looked = new Set<string>()
  /** When someone last spoke (Maple's whoops wait their turn), what Sparkle said already. */
  private chatAt = -99
  private told = new Set<string>()
  private hintAt = -99
  private bridgeSaid = false
  private piles: Pile[] = []
  private stumps: Stump[] = []
  private leaves: Particles
  private drift: Particles
  private dust: Particles
  private spray: Particles
  private foam: Particles
  private driftT = 0

  private lastTouch = 0
  private lastSteer = -99
  private lastX = 0
  private counts = { steered: 0, hops: 0, bigAir: 0, landings: 0, piles: 0, stumps: 0, splashes: 0, bridge: 0, jumps: 0, bonks: 0, rocks: 0, swings: 0, taps: 0, pokes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: BikeStart,
    private events: BikeEvents,
  ) {
    const { scene, bag, course } = this
    const t = course.trail
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 170, 1500)
    applyBands()
    this.rig.fov = 50
    this.rig.lag = 0.3
    this.rig.camera.far = 3200

    // ---- The mountain: the land, the trail, the gondola, the forest ----
    this.gondola = new Gondola(course, bag)
    const g0 = this.gondola.bottom
    const g1 = this.gondola.top
    const gondolaNear = (x: number, z: number, pad: number) => {
      const dx = g1.x - g0.x
      const dz = g1.z - g0.z
      const k = clamp(((x - g0.x) * dx + (z - g0.z) * dz) / (dx * dx + dz * dz))
      return Math.hypot(x - g0.x - dx * k, z - g0.z - dz * k) < 8 + pad
    }
    this.ground = buildLand(course, gondolaNear, bag)
    scene.add(this.ground)
    this.ribbon = buildTrail(course, bag)
    scene.add(this.ribbon, buildFallen(course, bag))
    scene.add(this.gondola.group)
    const st = course.station
    const deerAt = t.spot(DEER.s, DEER.side * (half(DEER.s) + DEER.off))
    const bearAt = t.spot(BEAR.s, BEAR.side * (half(BEAR.s) + BEAR.off))
    const keepOut = (x: number, z: number) =>
      gondolaNear(x, z, 2) ||
      onRun(x, z, 2) ||
      Math.hypot(x - st.x, z - st.z) < 24 ||
      Math.hypot(x - course.pond.x, z - course.pond.z) < POND.r + 2.5 ||
      Math.hypot(x - course.pool.x, z - course.pool.z) < POOL.r + 7 ||
      Math.hypot(x - g0.x, z - g0.z) < 14 ||
      Math.hypot(x - deerAt.x, z - deerAt.z) < 4 ||
      Math.hypot(x - bearAt.x, z - bearAt.z) < 6 ||
      (course.gully(x, z).depth > 0.6 && Math.abs(course.gully(x, z).off) < 4)
    this.forest = buildForest(course, keepOut, bag)
    scene.add(this.forest.group)
    scene.add(buildProps(course, bag))

    // ---- Water: the river far below, the pond, the creek, the waterfall and its pool ----
    this.water = new Water({ size: 7000, deep: '#6FA9D9', shallow: '#86BDE6', haze: SKY, hazeNear: 200, hazeFar: 1700 }, bag)
    this.water.mesh.position.set(t.spot(END, 0).x, -0.5, course.riverZ)
    scene.add(this.water.mesh)
    this.pond = roundWater(POND.r, course.pondY, course.pond, bag)
    this.pool = roundWater(POOL.r + 0.4, course.poolY, course.pool, bag)
    scene.add(this.pond.mesh, this.pool.mesh)
    this.creekFlow = new FlowMaterial(bag, { deep: '#5FA6DE', light: '#86C4EC', speed: 2.2, rows: 5 })
    this.fallsFlow = new FlowMaterial(bag, { deep: '#7FBDEB', light: '#A9D8F6', speed: 7, rows: 14, along: 0.35 })
    this.topFlow = new FlowMaterial(bag, { deep: '#5FA6DE', light: '#86C4EC', speed: 2.6, rows: 6 })
    scene.add(buildCreek(course, this.creekFlow, bag))
    scene.add(buildFalls(course, this.fallsFlow, this.topFlow, bag))
    this.rainbow = buildRainbow(bag)
    const rb = t.spot(FALLS - 6, POOL.lat - 1)
    this.rainbow.position.set(rb.x, course.poolY - 1.5, rb.z)
    this.rainbow.rotation.y = -phi(FALLS)
    this.rainbow.visible = false
    scene.add(this.rainbow)

    // ---- The sky, the hills, the clouds ----
    this.sky = buildSky(bag)
    scene.add(this.sky)
    const mid = t.spot(500, 0)
    scene.add(buildHills({ x: mid.x, z: mid.z - 300 }, bag))
    this.clouds = buildClouds({ x: mid.x, z: mid.z - 200 }, bag)
    scene.add(...this.clouds)

    // ---- Leaf piles and stumps by the trail ----
    PILES.forEach(([s, k], i) => {
      const lat = k * (half(s) + 0.3)
      const parts = []
      for (let j = 0; j < 7; j++) {
        const a = j * 2.2 + i
        parts.push(P.sphere(0.42 - j * 0.02, [FALL.red, FALL.orange, FALL.gold, FALL.scarlet][(i + j) % 4], { at: [Math.sin(a) * 0.45, 0.18 + (j % 3) * 0.08, Math.cos(a) * 0.45], scale: [1.2, 0.55, 1.2] }, 8))
      }
      const g = solid(merge(parts), bag, 1.5)
      const p = t.spot(s, lat)
      g.position.set(p.x, course.ground(s, lat) - 0.05, p.z)
      scene.add(g)
      this.piles.push({ s, lat, g, gone: -1 })
    })
    const stumpParts = []
    for (const [s, side] of STUMPS) {
      const lat = side * (half(s) + 0.85)
      const p = t.spot(s, lat)
      const y = course.ground(s, lat)
      stumpParts.push(P.cyl(0.38, 0.46, 0.55, '#9A6B4F', { at: [p.x, y + 0.2, p.z] }, 10), P.cyl(0.34, 0.34, 0.04, '#F0CFA0', { at: [p.x, y + 0.48, p.z] }, 10), P.torus(0.18, 0.025, '#C89D6E', { at: [p.x, y + 0.5, p.z], rot: [Math.PI / 2, 0, 0] }))
      this.stumps.push({ s, lat, cool: 0 })
    }
    scene.add(solid(merge(stumpParts), bag, 1.8))

    // ---- The animals ----
    this.chip = new Chipmunk(bag)
    this.chip.root.visible = false
    scene.add(this.chip.root)
    this.moose = new Moose(bag)
    this.moose.root.position.set(course.pond.x + 0.6, course.pondY - 0.4, course.pond.z)
    const tp = t.spot(POND.s, 0)
    this.moose.root.rotation.y = Math.atan2(tp.x - course.pond.x, tp.z - course.pond.z) + 0.9
    scene.add(this.moose.root)
    // The woodpecker's birch and the porcupine's maple (with a branch to sit on).
    const wp = t.spot(WOODPECKER.s, WOODPECKER.side * (half(WOODPECKER.s) + 3))
    const wy = course.land(wp.x, wp.z)
    const pp = t.spot(PORCUPINE.s, PORCUPINE.side * (half(PORCUPINE.s) + 3.4))
    const py = course.land(pp.x, pp.z)
    scene.add(
      solid(
        merge([
          P.cyl(0.17, 0.2, 5.6, '#F7F3EE', { at: [wp.x, wy + 2.8, wp.z] }, 8),
          ...[1.1, 2.0, 3.3, 4.2].map((h, i) => P.box(0.3, 0.06, 0.06, '#4A4058', { at: [wp.x, wy + h, wp.z + 0.15], rot: [0, i, 0.1] })),
          P.sphere(1.4, FALL.yellow, { at: [wp.x, wy + 6, wp.z], scale: [0.9, 1.2, 0.9] }, 8),
          P.sphere(1, FALL.gold, { at: [wp.x + 0.8, wy + 5.3, wp.z + 0.3] }, 8),
          P.cyl(0.22, 0.28, 4.2, '#7E553E', { at: [pp.x, py + 2.1, pp.z] }, 8),
          P.cyl(0.1, 0.14, 2.2, '#7E553E', { at: [pp.x + 0.9, py + 3.1, pp.z], rot: [0, 0, -1.1] }, 6),
          P.sphere(1.8, FALL.red, { at: [pp.x, py + 5, pp.z] }, 8),
          P.sphere(1.3, FALL.orange, { at: [pp.x + 1.2, py + 5.4, pp.z - 0.5] }, 8),
        ]),
        bag,
        1.8,
      ),
    )
    this.pecker = new Woodpecker(bag)
    const toTrail = Math.atan2(-Math.cos(phi(WOODPECKER.s)) * WOODPECKER.side, -Math.sin(phi(WOODPECKER.s)) * WOODPECKER.side)
    this.pecker.root.position.set(wp.x + Math.sin(toTrail) * 0.2, wy + 2.6, wp.z + Math.cos(toTrail) * 0.2)
    this.pecker.root.rotation.y = toTrail + Math.PI
    scene.add(this.pecker.root)
    this.porky = new Porcupine(bag)
    this.porky.root.position.set(pp.x + 1.3, py + 3.45, pp.z)
    this.porky.root.rotation.y = Math.atan2(-Math.cos(phi(PORCUPINE.s)) * PORCUPINE.side, -Math.sin(phi(PORCUPINE.s)) * PORCUPINE.side)
    scene.add(this.porky.root)
    this.frog = new Peeper(bag)
    const fp = t.spot(CREEK.at - 2.9, half(CREEK.at) + 0.9)
    const fy = course.ground(CREEK.at - 2.9, half(CREEK.at) + 0.9)
    scene.add(solid(merge([P.sphere(0.55, '#A9A1BA', { at: [fp.x, fy, fp.z], scale: [1.3, 0.7, 1.1] }, 8)]), bag, 1.8))
    this.frogHome.set(fp.x, fy + 0.35, fp.z)
    this.frog.root.position.copy(this.frogHome)
    this.frog.root.rotation.y = phi(CREEK.at) + Math.PI / 2
    scene.add(this.frog.root)
    // The deer among the trees (grazing along the trail), the black bear far off by her blueberry bush, the hare at the
    // trail's edge.
    this.deer = new Deer(bag)
    {
      const a = phi(DEER.s)
      this.deerHome = { x: deerAt.x, z: deerAt.z, nx: Math.cos(a) * DEER.side, nz: Math.sin(a) * DEER.side }
      this.deer.root.position.set(deerAt.x, course.land(deerAt.x, deerAt.z), deerAt.z)
      this.deer.root.rotation.y = Math.PI - a + 0.5
      scene.add(this.deer.root)
    }
    this.bear = new Bear(bag)
    {
      const a = phi(BEAR.s)
      const by = course.land(bearAt.x, bearAt.z)
      this.bear.root.position.set(bearAt.x, by, bearAt.z)
      // She faces the trail, the bush between her and it.
      this.bear.root.rotation.y = Math.atan2(-Math.cos(a) * BEAR.side, -Math.sin(a) * BEAR.side)
      scene.add(this.bear.root)
      const bx = bearAt.x - Math.cos(a) * BEAR.side * 1.3
      const bz = bearAt.z - Math.sin(a) * BEAR.side * 1.3
      const bush = []
      for (let i = 0; i < 5; i++) bush.push(P.sphere(0.55 - i * 0.04, ['#4E9A5B', '#5FAE66', '#468F52'][i % 3], { at: [bx + Math.sin(i * 2.1) * 0.6, by + 0.4 + (i % 2) * 0.25, bz + Math.cos(i * 2.1) * 0.6] }, 10))
      const berries = []
      for (let i = 0; i < 26; i++) {
        const u = i * 2.39
        const r = 0.55 + (i % 3) * 0.12
        berries.push(P.sphere(0.07, i % 4 ? '#5A6FD6' : '#7E5BC9', { at: [bx + Math.sin(u) * r, by + 0.35 + ((i * 7) % 5) * 0.14, bz + Math.cos(u) * r] }, 6))
      }
      scene.add(solidMix(bush, berries, bag, 2))
    }
    this.hare = new Hare(bag)
    this.placeHare()
    scene.add(this.hare.root)

    // ---- Maple and the bike ----
    this.rider = new Rider(bag)
    scene.add(this.rider.root)
    this.shadow = blobShadow(0.75, bag)
    this.shadow.scale.set(0.7, 1, 1.4)
    scene.add(this.shadow)
    const LEAF = [FALL.red, FALL.orange, FALL.gold, FALL.scarlet, FALL.yellow]
    this.leaves = new Particles({ kind: 'spray', count: 260, colors: LEAF, gravity: 3.2 }, bag)
    this.drift = new Particles({ kind: 'spray', count: 90, colors: LEAF, gravity: 0.35 }, bag)
    this.dust = new Particles({ kind: 'spray', count: 160, colors: ['#D9B58C', '#C99A6E', '#E6CCAA'], gravity: 6 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 220, color: '#EAF6FF', gravity: 12 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 60, opacity: 0.85 }, bag)
    scene.add(this.leaves.mesh, this.drift.mesh, this.dust.mesh, this.spray.mesh, this.foam.mesh)

    const feel: Feel = { top: RIDE.speed, boost: 1.3, accel: RIDE.accel, coast: 0.4, turn: STEER.turn, grip: STEER.grip, near: 2, far: 7, dead: 0.02, lean: RIDE.lean }
    this.d = new Driver(feel)

    // ---- Where the link starts ----
    this.section = start.section
    if (start.section === 'gondola' || start.section === 'story') {
      // (The story: her cabin waits at the bottom of the shot while Maple tells Kaylee where she's going.)
      this.mode = start.section
      this.gondU = this.gondola.length - GOND_FROM
      this.gondola.hers.swing.add(this.rider.root)
      // On the cabin's floor, small enough to fit under the roof.
      this.rider.root.position.set(0, -HANG + 0.88, 0)
      this.rider.root.rotation.y = Math.PI / 2
      this.rider.root.scale.setScalar(0.64)
      this.shadow.visible = false
    } else {
      this.gondola.hers.root.visible = false
      const s = { green: START - 5, berms: GREEN_END - 6, creek: BERMS_END + 2, falls: CREEK_END + 6 }[start.section as 'green']
      this.prefer = start.section === 'berms' ? (start.trail === 'blue' ? 1 : -1) : 0
      this.lat = this.steerLat = this.prefer * 1.6
      this.place(s, this.lat, start.section === 'green' ? 0 : RIDE.speed * 0.9)
    }
    this.placeRider(0)

    this.unwatch = watch('bike', () => ({
      'her push': [this.wheel.push, 1],
      steer: [this.wheel.k, 1],
      'steering to (m)': [this.steerLat, 6],
      'across (m)': [this.lat, 6],
      'lean (rad)': [this.roll, 1],
      'bounce (m)': [this.sq, 0.3],
      'in the air (m)': [this.air ? this.y - this.course.ride(this.s, this.lat, this.onBridge) : 0, 3],
    }))
  }

  /** Puts the bike on the trail at s, lat, rolling at `v`. */
  private place(s: number, lat: number, v: number) {
    const t = this.course.trail
    const p = t.spot(s, lat)
    this.d.place(p.x, p.z, Math.PI - phi(s))
    this.d.vx = Math.sin(this.d.heading) * v
    this.d.vz = Math.cos(this.d.heading) * v
    this.s = s
    this.lat = lat
    this.y = this.course.ride(s, lat, false)
    this.vy = 0
    this.air = false
    this.gv = NaN
    this.mode = 'ride'
    this.modeT = 0
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.wheel.setSize(w, h)
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.camYaw = this.camWant()
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setWheelElement(el: HTMLElement | null) {
    this.wheelEl = el
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }

  /** In her gondola cabin (the story, and the ride up). */
  private get inCabin() {
    return this.mode === 'gondola' || this.mode === 'story'
  }

  get calm() {
    return false
  }

  private enter(s: BikeSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s)
    const part = PARTS.indexOf(s)
    if (part > 0) this.events.progress(part)
  }

  /** The story's over (or she tapped through it): up the mountain. */
  go() {
    if (this.mode !== 'story') return
    this.mode = 'gondola'
    this.modeT = 0
    this.enter('gondola')
  }

  /** Sparkle says something new, once a ride. */
  private tell(key: keyof typeof L.bike) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.chatAt = this.time + 1.5
    this.events.say(L.bike[key] as Line, false)
  }
  /** Maple (or an animal) pipes up, unless someone just spoke. */
  private chat(line: Line | readonly Line[], force = false) {
    if (!force && this.time - this.chatAt < CHAT_S) return
    this.chatAt = this.time
    this.events.say(Array.isArray(line) ? pick(line as Line[]) : (line as Line), true)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.modeT += dt
    this.bonkCool -= dt
    for (const f of [this.creekFlow, this.fallsFlow, this.topFlow]) f.update(t)
    this.water.update(t)
    this.pond.update(t)
    this.pool.update(t)
    const k = this.wheel.update(dt, t, STEER)
    if (this.mode === 'ride' && Math.abs(k) > 0.05) {
      this.counts.steered += dt
      this.lastSteer = t
    }

    const cam = this.rig.camera.position
    this.gondola.update(dt, t, cam)
    if (this.mode === 'story') {
      // Waiting at the bottom of the shot while Maple talks.
      const her = this.gondola.hers
      this.gondU = this.gondola.length - GOND_FROM
      this.gondola.at('up', this.gondU, her.root.position)
      her.root.rotation.y = this.gondola.yawAt(this.gondU)
      // She waves hello, then rings her bell when they're about to go.
      if (this.modeT > 0.9 && !this.told.has('hello')) {
        this.told.add('hello')
        this.rider.wave()
      }
      if (this.modeT > 4.2 && !this.told.has('ding')) {
        this.told.add('ding')
        this.rider.cheer()
      }
    } else if (this.mode === 'gondola') this.upTheGondola()
    else if (this.mode === 'ride') this.ride(dt, k)
    else this.d.stop()
    if (this.doneT >= 0) this.doneT += dt

    this.updateAnimals(dt, t)
    this.updatePiles(dt)
    this.placeRider(dt)
    this.rider.update(dt, t, {
      speed: this.inCabin ? 0 : Math.max(0, this.d.speed),
      pedal: this.mode === 'ride' && this.d.speed < this.d.feel.top * 0.8 ? 1 : 0.15,
      squash: this.sq,
      air: this.air ? Math.min(1, this.airT * 4) : 0,
      steer: clamp(this.d.yawRate / Math.max(0.1, STEER.turn), -1, 1),
    })
    for (const p of [this.leaves, this.drift, this.dust, this.spray, this.foam]) p.update(dt)
    // The rainbow fades in over the pool at the end.
    if (this.doneT >= 0) {
      this.rainbow.visible = true
      const a = clamp((this.doneT - 0.6) / 1.6) * 0.7
      for (const m of this.rainbow.children) ((m as Mesh).material as { opacity: number }).opacity = a
    }
    // The waterfall's mist.
    if (Math.random() < dt * 30 && Math.abs(this.s - FALLS) < 160) {
      const p = this.course.trail.spot(FALLS - 1.5, POOL.lat - 1 + (Math.random() - 0.5) * 6)
      this.spray.emit(p.x, this.course.poolY + 0.2, p.z, (Math.random() - 0.5) * 2, 2 + Math.random() * 3, (Math.random() - 0.5) * 2 + 1.5, 1.1, 0.5)
      if (Math.random() < 0.3) this.foam.emit(p.x, this.course.poolY + 0.03, p.z, (Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3, 2, 2.2)
    }
    // Leaves drifting down from the trees round the camera.
    if ((this.driftT -= dt) < 0) {
      this.driftT = 0.09
      const c = this.rig.camera
      const f = c.getWorldDirection(tmp)
      const ahead = 6 + Math.random() * 18
      this.drift.emit(c.position.x + f.x * ahead + (Math.random() - 0.5) * 16, c.position.y + 3 + Math.random() * 5, c.position.z + f.z * ahead + (Math.random() - 0.5) * 16, 0.6 + Math.random() * 0.4, -0.4, (Math.random() - 0.5) * 0.6, 5, 0.16 + Math.random() * 0.06)
    }
    for (const c of this.clouds) {
      c.position.x += c.userData.v * dt
      if (c.position.x > 900) c.position.x -= 1800
    }

    const p = this.bikePos(tmp)
    this.lights.follow(p.x, p.y, p.z)
    this.sky.position.copy(this.rig.camera.position)
    // The camera looks down the trail, turning a little with the bike.
    this.camYaw += wrap(this.camWant() - this.camYaw) * (1 - Math.exp(-dt * 4))
    // (Riding along with the moving cabin, the camera keeps up tightly or the cabin slides off a phone's screen.)
    this.rig.lag = this.inCabin ? 0.05 : 0.3
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.clearTerrain()
    this.wheel.draw(this.wheelEl, this.mode === 'ride', STEER.reach)
    const idle = t - Math.max(this.lastTouch, this.lastSteer)
    const steering = this.mode === 'ride' && this.s < END - 30
    const stuck = steering && !this.wheel.finger && ((this.counts.steered < 1 && t > 2.5 && idle > 2.5) || idle > HINT_S)
    this.wheel.hint(this.hintEl, stuck, t, STEER.reach)
    // Sparkle's one instruction as the bike rolls (a section link that starts on the trail hears it too); stuck for
    // a while, her hint (and the hand shows how).
    if (this.mode === 'ride' && this.modeT > 1.6) this.tell('steer')
    if (stuck && idle > HINT_S && t - this.hintAt > 25 && this.told.has('steer')) {
      this.hintAt = t
      this.chatAt = t
      this.events.say(L.bike.hint, false, spendHint(L.bike.hint))
    }
  }

  /** Where the bike is in the world. */
  private bikePos(out: Vector3) {
    if (this.inCabin) {
      this.gondola.at('up', this.gondU, out)
      out.y -= HANG
      return out
    }
    return out.set(this.d.x, this.y, this.d.z)
  }

  // ---------------------------------------------------------------- the gondola

  private upTheGondola() {
    const len = this.gondola.length
    const q = clamp(this.modeT / GOND_S)
    const e = q * q * (3 - 2 * q)
    this.gondU = len - GOND_FROM + (GOND_FROM - 3) * e
    if (this.modeT > 4.5 && !this.told.has('high')) {
      this.told.add('high')
      this.chat(this.counts.swings ? L.bike.rock : L.bike.high, true)
    }
    const her = this.gondola.hers
    this.gondola.at('up', this.gondU, her.root.position)
    her.root.rotation.y = this.gondola.yawAt(this.gondU)
    if (q >= 1) {
      // Into the station: out she rolls through the door, down the mountain.
      this.rider.root.removeFromParent()
      this.scene.add(this.rider.root)
      this.rider.root.scale.setScalar(1)
      this.gondola.hers.root.visible = false
      this.shadow.visible = true
      this.place(START - 5, 0, 0)
      this.enter('green')
      sounds.whoosh()
      bell()
      this.rider.ring()
      this.chat(L.bike.go, true)
    }
  }

  // ---------------------------------------------------------------- the ride

  private ride(dt: number, k: number) {
    const c = this.course
    const t = c.trail
    const d = this.d
    const s0 = this.s
    const lat0 = this.lat
    const hw = half(s0)
    const r = island(s0)
    // Where she's steering to: the wheel slides it; let go and it eases back to the middle (or her way's middle).
    const range = hw + SHOULDER + 0.5
    // (By the creek: the middle of the bridge, or of the splash.)
    const creek = s0 > CREEK.at - BRIDGE_HALF - 8 && s0 < CREEK.at + BRIDGE_HALF
    // (Before the jump: lined up with the kicker, unless she steers round it.)
    const kicker = s0 > JUMP.s - 48 && s0 < JUMP.s + JUMP.len
    const rest = this.prefer && s0 < SPLIT.from + 6 ? this.prefer * 1.8 : creek ? (this.onBridge || (lat0 < -0.2 && s0 < CREEK.at - BRIDGE_HALF) ? -1.5 : 1.5) : kicker ? 1.6 : lane(s0, lat0)
    if (this.wheel.steering) this.steerLat = clamp(this.steerLat + k * STEER.slide * dt, -range, range)
    else this.steerLat += (rest - this.steerLat) * (1 - Math.exp(-dt / STEER.back))
    // Round the island: she stays on her way. On the bridge, between the rails; in the creek, out of them.
    if (r > 0) {
      const side = Math.sign(lat0 || this.steerLat || 1)
      if (this.steerLat * side < r + 0.4) this.steerLat = side * (r + 0.4)
    }
    if (this.onBridge) this.steerLat = clamp(this.steerLat, -hw - 0.1, -0.6)
    else if (Math.abs(s0 - CREEK.at) < BRIDGE_HALF + 1 && s0 > CREEK.at - BRIDGE_HALF) this.steerLat = Math.max(this.steerLat, 0.6)

    // How fast: steeper is faster; a splash slows her; easing to a stop by the waterfall.
    const steep = (t.base(s0 - 3) - t.base(s0 + 3)) / 6
    let top = RIDE.speed * (0.72 + RIDE.steep * steep)
    if (r > 0 && lat0 < 0) top *= 0.94
    d.feel.top = top
    d.feel.accel = RIDE.accel
    d.feel.turn = this.air ? STEER.turn * 0.3 : STEER.turn
    d.feel.grip = this.air ? 2 : STEER.grip
    d.feel.lean = RIDE.lean
    let cap = this.wet ? 0.72 : 1
    if (s0 > END - 24) cap = Math.min(cap, clamp((END - s0) / 20, 0.16, 1))
    d.cap = cap
    const ds = Math.max(STEER.aim, 5 + Math.abs(d.speed) * 0.6 - Math.abs(this.steerLat - lat0) * STEER.pull)
    // Aiming at a point ahead cuts the inside of a bend (a chord), so through the berms it aims a little wide.
    const wide = curve(s0 + ds / 2) * ds * ds * 0.25
    const aim = t.spot(s0 + ds, s0 > END - 6 ? 0 : this.steerLat - wide)
    if (s0 > END - 1.5) d.stop()
    else d.hold(aim.x, aim.z)
    d.step(dt)

    // Back onto the trail: the edges are soft, the island and the bridge's rails bonk.
    let loc = t.locate(d.x, d.z, s0)
    const edge = half(loc.s) + SHOULDER
    const N = (s: number, side: number) => {
      const a = phi(s)
      return { x: Math.cos(a) * side, z: Math.sin(a) * side }
    }
    const pushTo = (lat: number, nSide: number, bonk: boolean) => {
      const p = t.spot(loc.s, lat)
      d.x = p.x
      d.z = p.z
      const n = N(loc.s, nSide)
      const hit = d.bounce(n.x, n.z, bonk ? 0.35 : 0.1)
      loc = { s: loc.s, lat }
      if (bonk && hit > 1.2 && this.bonkCool <= 0) {
        this.bonkCool = 0.6
        this.counts.bonks++
        sfx.thump()
        this.sqV += 0.6 * RIDE.bounce
        this.rider.wobble()
        this.chat(L.bike.bonk)
      }
    }
    if (Math.abs(loc.lat) > edge) pushTo(Math.sign(loc.lat) * edge, -Math.sign(loc.lat), false)
    const ri = island(loc.s)
    if (ri > 0 && Math.abs(loc.lat) < ri + 0.3) {
      const side = Math.sign(lat0 || 1)
      pushTo(side * (ri + 0.3), side, true)
    }
    // The bridge: she's on it if she came onto its span on the left.
    const span = loc.s > CREEK.at - BRIDGE_HALF && loc.s < CREEK.at + BRIDGE_HALF
    if (!span) this.onBridge = false
    else if (s0 <= CREEK.at - BRIDGE_HALF && loc.lat < -0.2) {
      this.onBridge = true
      this.counts.bridge++
    }
    if (span && this.onBridge) {
      if (loc.lat > -0.45) pushTo(-0.45, -1, true)
      if (loc.lat < -half(loc.s) - 0.2) pushTo(-half(loc.s) - 0.2, 1, true)
    } else if (span && loc.lat < 0.4) pushTo(0.4, 1, true)
    this.s = loc.s
    this.lat = loc.lat

    // Up and down: small steps along the way she went.
    const n = Math.max(1, Math.ceil(dt * 120))
    const v = Math.max(0, d.speed)
    for (let i = 1; i <= n; i++) this.vertical(s0 + ((this.s - s0) * i) / n, lat0 + ((this.lat - lat0) * i) / n, dt / n, v)
    // The suspension: a spring that the bumps and landings squash.
    this.sqV += (-RIDE.spring * RIDE.spring * this.sq - 2 * 0.45 * RIDE.spring * this.sqV) * dt
    this.sq = clamp(this.sq + this.sqV * dt, -0.12, 0.28)

    this.trailStuff(dt)
    // The stretches, and which way round the island she took.
    if (this.s >= GREEN_END - 4) this.enter('berms')
    const w = way(this.s, this.lat)
    if (w && this.s > SPLIT.from + 12 && this.picked !== w) {
      this.picked = w
      this.events.way(w)
      this.chat(w === 'blue' ? L.bike.blue : L.bike.green, true)
    }
    // Something new coming: Sparkle says what (once).
    if (this.s > SPLIT.from - 34 && this.s < SPLIT.from) this.tell('split')
    if (this.s > CREEK.at - BRIDGE_HALF - 30 && this.s < CREEK.at - BRIDGE_HALF) this.tell('creek')
    if (this.s >= BERMS_END) this.enter('creek')
    if (this.s >= CREEK_END) this.enter('falls')
    if (this.s > END - 3 && d.speed < 0.5 && this.doneT < 0) {
      this.doneT = 0
      this.mode = 'done'
      this.modeT = 0
      this.rider.cheer()
      this.rider.look(0.5)
      bell()
      sounds.fanfare()
      this.events.progress(PARTS.length)
      this.chat(L.bike.falls, true)
      this.events.done()
    }
  }

  /** One small step up or down: following the ground, or flying where it drops away faster than she can fall. */
  private vertical(s: number, lat: number, h: number, v: number) {
    const c = this.course
    const g = c.ride(s, lat, this.onBridge)
    // How fast the ground itself goes up or down under her (m/s).
    const fall = ((c.ride(s + 0.4, lat, this.onBridge) - c.ride(s - 0.4, lat, this.onBridge)) / 0.8) * v
    if (this.air) {
      this.vy -= RIDE.gravity * h
      this.y += this.vy * h
      this.airT += h
      if (this.y <= g) {
        const impact = fall - this.vy
        this.y = g
        this.vy = fall
        this.air = false
        this.gv = NaN
        if (this.airT > 0.25) this.counts.hops++
        if (this.airT > 0.6) {
          this.counts.bigAir++
          this.chat(L.bike.whee)
        }
        this.landed(impact)
      }
      return
    }
    const follow = (g - this.y) / h
    if (!Number.isNaN(this.gv) && follow < this.gv - RIDE.gravity * h * 1.5 && !rattly(s)) {
      // Off she flies (the pop knob makes the hops bigger or smaller).
      this.air = true
      this.airT = 0
      this.vy = Math.max(0, this.vy) * RIDE.pop + Math.min(0, this.vy)
      this.vy -= RIDE.gravity * h
      this.y += this.vy * h
      if (this.vy > 1.6) sfx.boing()
      if (Math.abs(s - JUMP.s - JUMP.len) < 1.5 && lat > 0) {
        this.counts.jumps++
        sounds.whoosh()
        this.chat(L.bike.jump, true)
      }
      if (this.vy > 1 && Math.abs(s - JUMP.s - JUMP.len) > 3) this.counts.rocks++
      return
    }
    // Riding over the bumps: a sudden change of up-speed squashes the springs.
    if (!Number.isNaN(this.gv)) this.sqV -= (follow - this.gv) * 0.05 * RIDE.bounce
    this.gv = follow
    this.vy = Math.min(follow, 9)
    this.y = g
  }

  private landed(impact: number) {
    this.sqV += Math.max(0, impact) * 0.11 * RIDE.bounce
    if (impact < 2.5) return
    this.counts.landings++
    const p = this.bikePos(tmp)
    this.dust.burst(p.x, p.y + 0.1, p.z, Math.round(clamp(impact * 3, 6, 26)), 2.4, 2.2, 0.16)
    sfx.thump()
  }

  /** Dirt and leaves off the back wheel, splashes, planks, piles, stumps. */
  private trailStuff(dt: number) {
    const c = this.course
    const p = this.bikePos(tmp)
    const v = Math.max(0, this.d.speed)
    // The creek: a splash going in, spray off the wheels while she's in it, and the frog jumps.
    const wet = !this.onBridge && inCreek(this.s) && this.lat > -0.2
    if (wet && !this.wet) {
      this.counts.splashes++
      sfx.splash()
      this.spray.burst(p.x, c.creekY + 0.1, p.z, 34, 3.2, 5.5, 0.26)
      for (let i = 0; i < 3; i++) this.foam.emit(p.x, c.creekY + 0.02, p.z, 0, 0, 0, 1.3 + i * 0.3, 2 + i)
      this.frog.poke()
      ribbit()
      this.sqV += 0.4 * RIDE.bounce
      this.rider.shake()
      this.chat(L.bike.splash, true)
    }
    this.wet = wet
    if ((this.trailT -= dt) < 0 && !this.air && v > 1) {
      this.trailT = 0.05
      const back = tmp2.set(-Math.sin(this.d.heading) * 0.6, 0, -Math.cos(this.d.heading) * 0.6)
      if (wet) this.spray.emit(p.x + back.x, c.creekY + 0.2, p.z + back.z, (Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.6, 0.14)
      else if (Math.random() < 0.55) this.dust.emit(p.x + back.x, p.y + 0.08, p.z + back.z, (Math.random() - 0.5) * 1.2 - this.d.vx * 0.05, 0.6 + Math.random() * 1.2 + v * 0.06, (Math.random() - 0.5) * 1.2 - this.d.vz * 0.05, 0.6, 0.14)
      // Leaves swirl up behind the wheels.
      if (!wet && Math.random() < 0.25 + v * 0.02) this.leaves.emit(p.x + back.x, p.y + 0.15, p.z + back.z, (Math.random() - 0.5) * 2, 1.5 + Math.random() * 2, (Math.random() - 0.5) * 2, 1.4, 0.13)
    }
    // Tock tock over the bridge's planks.
    if (this.onBridge && !this.bridgeSaid) {
      this.bridgeSaid = true
      this.chat(L.bike.bridge, true)
    }
    if (this.onBridge && !this.air) {
      this.plankAt += v * dt
      if (this.plankAt > 0.55) {
        this.plankAt = 0
        plank()
        this.sqV += 0.05 * RIDE.bounce
      }
    }
    // Leaf piles: right through them, and Maple comes out covered.
    for (const pile of this.piles) {
      if (pile.gone >= 0 || this.air) continue
      if (Math.abs(pile.s - this.s) < 1.1 && Math.abs(pile.lat - this.lat) < 1.1) this.burstPile(pile, true)
    }
    // Stumps: boing! up in the air, the bell rings.
    for (const st of this.stumps) {
      st.cool -= dt
      if (st.cool > 0 || this.air) continue
      if (Math.abs(st.s - this.s) < 0.7 && Math.abs(st.lat - this.lat) < 0.75) {
        st.cool = 2
        this.counts.stumps++
        this.air = true
        this.airT = 0
        this.vy = 5.2 * RIDE.pop
        this.y += 0.05
        sfx.boing()
        bell()
        this.rider.ring()
        this.chat(L.bike.bell)
      }
    }
  }

  private burstPile(pile: Pile, ridden: boolean) {
    pile.gone = 0
    pile.g.visible = false
    const p = pile.g.position
    this.leaves.burst(p.x, p.y + 0.3, p.z, 46, 3.5, 6, 0.22)
    sfx.fwip()
    noise(0.4, 0.12, 'bandpass', 2400, 900, 0, 0.8)
    if (ridden) {
      this.counts.piles++
      this.rider.leafy()
      this.chat(L.bike.leaves)
      this.sqV += 0.25 * RIDE.bounce
    }
  }

  private updatePiles(dt: number) {
    for (const pile of this.piles) {
      if (pile.gone < 0) continue
      pile.gone += dt
      // They pile up again after a while (for the next ride down).
      if (pile.gone > 12) {
        pile.g.visible = true
        const k = clamp((pile.gone - 12) / 0.8)
        pile.g.scale.setScalar(Math.max(0.01, k))
        if (k >= 1) pile.gone = -1
      }
    }
  }

  // ---------------------------------------------------------------- the animals

  private updateAnimals(dt: number, t: number) {
    const c = this.course
    const tr = c.trail
    // The chipmunk runs along beside her down the green trail (on her left), then sits and watches her go.
    const chipOn = this.mode === 'ride' && this.s > 20 && this.s < 232
    if (chipOn && !this.chip.root.visible) {
      this.chip.root.visible = true
      this.chipS = this.s - 4
    }
    if (this.chip.root.visible) {
      const want = chipOn ? this.s + 2 : this.chipS
      const run = chipOn ? clamp((want - this.chipS) * 2, 0, Math.max(3, this.d.speed * 1.15)) : 0
      this.chipS = Math.min(240, this.chipS + run * dt)
      const lat = -(half(this.chipS) + 1.9)
      const p = tr.spot(this.chipS, lat)
      this.chip.root.position.set(p.x, c.ground(this.chipS, lat), p.z)
      this.chip.root.rotation.y = run > 0.5 ? Math.PI - phi(this.chipS) : Math.PI - phi(this.chipS) + Math.PI * 0.8
      this.chip.run = clamp(run / 6)
      if (this.s - this.chipS > 60) this.chip.root.visible = false
    }
    this.chip.update(dt, t)
    this.moose.update(dt, t)
    if (this.moose.up > 0.5 && Math.random() < dt * 14) {
      const ch = this.moose.chin(tmp2)
      this.spray.emit(ch.x + (Math.random() - 0.5) * 0.3, ch.y, ch.z + (Math.random() - 0.5) * 0.3, 0, -0.5, 0, 0.6, 0.09)
    }
    this.pecker.update(dt, t)
    if (this.pecker.pecks !== this.peckSeen) {
      this.peckSeen = this.pecker.pecks
      if (Math.abs(this.s - WOODPECKER.s) < 45 || this.mode === 'gondola') knock()
    }
    this.porky.update(dt, t)
    this.frog.update(dt, t)
    if (this.frog.peeps !== this.peepSeen) {
      this.peepSeen = this.frog.peeps
      if (Math.abs(this.s - CREEK.at) < 40) peep()
    }
    // The moose looks at her when his head is up.
    const ml = this.moose.root.worldToLocal(this.bikePos(tmp2).clone())
    this.moose.look = clamp(Math.atan2(ml.x, ml.z), -0.9, 0.9)

    // The deer bounds off away from the trail, and wanders back facing home.
    const dh = this.deerHome
    const da = this.deer.away
    this.deer.root.position.set(dh.x + dh.nx * da, 0, dh.z + dh.nz * da)
    this.deer.root.position.y = c.land(this.deer.root.position.x, this.deer.root.position.z)
    const out = Math.atan2(dh.nx, dh.nz)
    const want = this.deer.busy ? out : this.deer.walkBack ? out + Math.PI : Math.PI - phi(DEER.s) + 0.5
    this.deer.root.rotation.y += wrap(want - this.deer.root.rotation.y) * Math.min(1, dt * 5)
    this.deer.update(dt, t)
    // (She bounds off by herself if Maple whooshes right past her.)
    if (this.mode === 'ride' && Math.abs(this.s - DEER.s) < 3 && this.lat * DEER.side > half(this.s) * 0.5 && !this.deer.busy && this.deer.away === 0) this.deer.poke()
    this.bear.update(dt, t)

    // The hare hops across the trail in front of her as she comes.
    if (this.mode === 'ride' && !this.hare.crossing && this.hareK === 0 && HARE.s - this.s < 15 && HARE.s - this.s > 4) this.hare.crossing = true
    if (this.hare.crossing) {
      this.hareK = Math.min(1, this.hareK + dt / 1.5)
      if (this.hareK >= 1) {
        this.hare.crossing = false
        thump()
      }
      this.placeHare()
    }
    this.hare.update(dt, t)

    // Maple looks at the animals as she rides past (once each).
    if (this.mode === 'ride')
      for (const [id, at, side] of [
        ['moose', POND.s, 1],
        ['bear', BEAR.s, BEAR.side],
        ['deer', DEER.s, DEER.side],
        ['porcupine', PORCUPINE.s, PORCUPINE.side],
      ] as const) {
        if (this.looked.has(id) || at - this.s > 12 || at - this.s < 2) continue
        this.looked.add(id)
        this.rider.look(-side * 0.9)
      }
  }

  /** The hare at the trail's edge, or partway across (hareK 0..1, left edge to right edge). */
  private placeHare() {
    const c = this.course
    const edge = half(HARE.s) + 1.3
    const lat = HARE.side * edge * (1 - 2 * this.hareK)
    const s = HARE.s + this.hareK * 1.5
    const p = c.trail.spot(s, lat)
    this.hare.root.position.set(p.x, c.ground(s, lat), p.z)
    // Facing across the trail while he hops, facing the trail when he sits.
    const a = phi(s)
    const across = Math.atan2(-Math.cos(a) * HARE.side, -Math.sin(a) * HARE.side)
    this.hare.root.rotation.y = this.hare.crossing ? across : this.hareK >= 1 ? across + Math.PI : across
  }

  // ---------------------------------------------------------------- Maple: where and how she rides

  private placeRider(dt: number) {
    const k = (rate: number) => (dt ? 1 - Math.exp(-dt * rate) : 1)
    const root = this.rider.root
    if (this.inCabin) {
      // Standing in her cabin, rocking with it.
      this.rider.lean.rotation.set(0, 0, 0)
      return
    }
    const c = this.course
    root.position.set(this.d.x, this.y, this.d.z)
    root.rotation.y = this.d.heading
    // Nose down the slope (or the way she's flying), and leaning into the turns and with the berms.
    const fwd = 0.6
    const ga = c.ride(this.s - fwd, this.lat, this.onBridge)
    const gb = c.ride(this.s + fwd, this.lat, this.onBridge)
    const pitch = this.air ? Math.atan2(-this.vy, Math.max(1, this.d.speed)) * 0.7 : Math.atan((ga - gb) / (2 * fwd))
    this.pitch += (clamp(pitch, -0.9, 0.9) - this.pitch) * k(10)
    const across = c.ground(this.s, this.lat + 0.4) - c.ground(this.s, this.lat - 0.4)
    const tilt = this.air ? 0 : Math.atan(across / 0.8) * RIDE.bank
    const roll = clamp(this.d.roll - tilt, -0.9, 0.9)
    this.roll += (roll - this.roll) * k(8)
    this.rider.lean.rotation.set(this.pitch, 0, this.roll)
    const g = c.ride(this.s, this.lat, this.onBridge)
    this.shadow.position.set(this.d.x, g + 0.03, this.d.z)
    this.shadow.rotation.z = -this.d.heading
    this.shadow.scale.set(0.7, 1, 1.4).multiplyScalar(clamp(1 - (this.y - g) * 0.18, 0.35, 1))
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const tall = this.tall
    const c = this.course
    const t = c.trail
    if (this.mode === 'story') {
      // Close on Maple in her cabin, from in front of her.
      const her = this.gondola.hers.root.position
      const yaw = this.gondola.yawAt(this.gondU) + STORY_YAW
      return { center: new Vector3(her.x, her.y - HANG + 1.35, her.z), half: tall ? new Vector3(0.9, 0.8, 0.9) : new Vector3(1.3, 0.8, 1.0), yaw: yaw * DEG, pitch: 12, minDist: 2.2 }
    }
    if (this.mode === 'gondola') {
      // Uphill of her cabin and off to the side, looking back down at it: the trail, the valley and the river behind.
      const her = this.gondola.hers.root.position
      const yaw = this.gondola.yawAt(this.gondU) + 1.25 - this.modeT * 0.03
      return { center: new Vector3(her.x, her.y - 2.4, her.z), half: tall ? new Vector3(2, 2.2, 2) : new Vector3(4.6, 2.4, 3.2), yaw: yaw * DEG, pitch: tall ? 20 : 12, minDist: 7 }
    }
    if (this.mode === 'done') {
      // Maple and the waterfall, the rainbow over the pool.
      const wide = this.doneT > 3
      const s = wide ? (END + FALLS) / 2 - 6 : END + 1
      const p = t.spot(s, wide ? POOL.lat * 0.6 : 0)
      return {
        center: new Vector3(p.x, c.meadowY + (wide ? 5 : 1.15), p.z),
        half: wide ? (tall ? new Vector3(7, 5.5, 5) : new Vector3(10.5, 5.5, 5)) : tall ? new Vector3(1.3, 1, 1.3) : new Vector3(1.9, 1, 1.4),
        yaw: -phi(s) * DEG + (wide ? 22 : 150),
        pitch: wide ? 10 : 12,
      }
    }
    // Low behind the bike, looking down the trail: further ahead the faster she goes, so what's coming shows.
    const v = Math.max(0, this.d.speed)
    const ahead = 3 + v * 0.3
    const s = this.s + ahead
    const p = t.spot(s, this.lat * 0.85)
    const g = c.ride(s, this.lat * 0.85, this.onBridge)
    const lift = this.air ? Math.max(0, this.y - c.ride(this.s, this.lat, this.onBridge)) * 0.45 : 0
    if (this.s < 3) {
      // Out of the station's door: from the side, the station and the gondola behind her.
      const q = t.spot(this.s + 2, 0)
      return { center: new Vector3(q.x, H0 + 1.4, q.z), half: tall ? new Vector3(3, 1.6, 4) : new Vector3(4.5, 1.6, 3.5), yaw: -this.camYaw * DEG + 125, pitch: 14, minDist: 6 }
    }
    return {
      center: new Vector3(p.x, Math.max(g, this.y - 1.2) + 0.85 + lift, p.z),
      half: tall ? new Vector3(2.4, 1.1, 5) : new Vector3(3.9, 1.1, 3.9),
      yaw: -this.camYaw * DEG,
      pitch: 12,
      minDist: 4.5,
    }
  }

  /** Which way the camera looks (like a heading: + = toward +x): along the trail from a little behind her to where it
   *  looks, so through a tight bend it stays over the trail instead of swinging out over the trees. */
  private camWant() {
    const t = this.course.trail
    const v = Math.max(0, this.d.speed)
    const a = t.spot(this.s - 4, this.lat * 0.9)
    const b = t.spot(this.s + 3 + v * 0.3, this.lat * 0.85)
    const chord = Math.atan2(b.x - a.x, -(b.z - a.z))
    return chord + wrap(Math.PI - this.d.heading - chord) * STEER.camera
  }

  /** Never inside the hillside: the camera rises over the ground (and over a bank between it and Maple). */
  private clearTerrain() {
    const cam = this.rig.camera
    const p = cam.position
    const target = this.bikePos(tmp2).clone()
    target.y += 1
    const c = this.course
    let lift = Math.max(0, c.land(p.x, p.z, this.inCabin ? undefined : this.s) + 1.6 - p.y)
    if (!this.inCabin)
      for (const k of [0.3, 0.6]) {
        const x = p.x + (target.x - p.x) * k
        const z = p.z + (target.z - p.z) * k
        const yy = p.y + lift + (target.y - p.y - lift) * k
        const g = c.land(x, z, this.s) + 0.5
        if (g > yy) lift += (g - yy) / (1 - k)
      }
    if (lift > 0) {
      p.y += lift
      cam.lookAt(this.rig.framed()?.center ?? target)
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

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.lastX = x
    if (this.mode === 'ride') {
      this.wheel.down(x, y, this.time, id)
      this.steerLat = this.lat
    }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    if (this.mode === 'ride') this.wheel.move(x, y, downX, downY, held)
    else if (this.mode === 'gondola' && held) {
      // Rocking her cabin with a finger.
      this.gondola.push(-1, 0, (x - this.lastX) * 0.004)
      this.lastX = x
    }
  }
  pointerUp() {
    this.wheel.up()
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id === 'bike') {
      this.counts.pokes++
      bell()
      this.rider.ring()
      this.rider.wave()
      this.chat(L.bike.bell)
      return
    }
    if (id === 'cabin') {
      this.counts.pokes++
      this.counts.swings++
      this.gondola.push(-1, 0.5, 0.25)
      this.rider.wave()
      creak()
      this.chat(this.counts.swings > 2 ? L.bike.rock : L.bike.high)
      return
    }
    if (id?.startsWith('car:')) {
      const cab = this.gondola.cabins[+id.slice(4)]
      if (!cab || cab.slot < 0) return
      this.counts.pokes++
      this.counts.swings++
      this.gondola.push(cab.slot, 0.6, 0.3)
      creak()
      return
    }
    if (id === 'chipmunk') {
      this.counts.pokes++
      this.chip.poke()
      sfx.chirp()
      sfx.munch()
      this.chat(L.bike.chipmunk, true)
      meet('chipmunk')
      return
    }
    if (id === 'moose') {
      this.counts.pokes++
      this.moose.poke()
      moo()
      this.chat(L.bike.moose[this.counts.pokes % 2], true)
      meet('moose')
      return
    }
    if (id === 'woodpecker') {
      this.counts.pokes++
      this.pecker.poke()
      meet('woodpecker')
      return
    }
    if (id === 'porcupine') {
      this.counts.pokes++
      this.porky.poke()
      sfx.pop()
      meet('porcupine')
      return
    }
    if (id === 'frog') {
      this.counts.pokes++
      this.frog.poke()
      peep()
      meet('peeper')
      return
    }
    if (id === 'deer') {
      this.counts.pokes++
      this.deer.poke()
      snort()
      meet('deer')
      return
    }
    if (id === 'bear') {
      this.counts.pokes++
      this.bear.poke()
      grunt()
      this.chat(L.bike.bear, true)
      meet('black-bear')
      return
    }
    if (id === 'hare') {
      this.counts.pokes++
      this.hare.poke()
      thump()
      meet('hare')
      return
    }
    // A leaf pile bursts; a tree rustles and drops leaves; water splashes; the ground puffs.
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const piles = this.piles.filter((p) => p.gone < 0).map((p) => p.g)
    const hit = this.raycaster.intersectObjects([...piles, ...this.forest.meshes, this.pond.mesh, this.pool.mesh, this.ribbon, this.ground], true)[0]
    if (!hit) return
    const pile = this.piles.find((p) => isIn(hit.object, p.g))
    if (pile) {
      this.counts.pokes++
      this.burstPile(pile, false)
      return
    }
    const pt = hit.point
    if (this.forest.meshes.some((m) => isIn(hit.object, m))) {
      this.counts.pokes++
      this.leaves.burst(pt.x, pt.y, pt.z, 22, 2, 1.5, 0.2)
      noise(0.35, 0.1, 'bandpass', 3000, 1500, 0, 0.7)
      return
    }
    if (hit.object === this.pond.mesh || hit.object === this.pool.mesh) {
      this.spray.burst(pt.x, pt.y + 0.05, pt.z, 14, 1.8, 3.5, 0.18)
      this.foam.emit(pt.x, pt.y + 0.02, pt.z, 0, 0, 0, 1.2, 1.6)
      sfx.splash()
      return
    }
    this.dust.burst(pt.x, pt.y + 0.1, pt.z, 10, 1.4, 2, 0.14)
    sfx.fwip()
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | null, height: number, scale = 1.6, lift = 0) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (who && who.visible !== false) {
        const c = this.toScreen(who.localToWorld(tmp.set(0, lift + height * 0.5, 0)))
        const top = this.toScreen(who.localToWorld(tmp2.set(0, lift + height, 0)))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.4, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const near = (s: number, from = -6, to = 70) => this.mode === 'ride' && s - this.s > from && s - this.s < to
    for (const [id, el] of this.anchorEls) {
      if (id === 'bike') place(el, !this.inCabin ? this.rider.root : null, this.rider.height, 1.1)
      else if (id === 'cabin') place(el, this.mode === 'gondola' ? this.gondola.hers.root : null, 2.6, 1.3, -HANG)
      else if (id.startsWith('car:')) {
        const cab = this.gondola.cabins[+id.slice(4)]
        const show = cab && cab.root.visible && cab.root.position.distanceTo(this.rig.camera.position) < 90
        place(el, show ? cab.root : null, 2.6, 1.2, -HANG)
      } else if (id === 'chipmunk') place(el, this.chip.root.visible && this.mode === 'ride' ? this.chip.root : null, this.chip.height, 2)
      else if (id === 'moose') place(el, near(POND.s, -4, 80) || this.mode === 'gondola' ? this.moose.root : null, this.moose.height, 1.1)
      else if (id === 'woodpecker') place(el, near(WOODPECKER.s, -2, 60) ? this.pecker.root : null, this.pecker.height, 1.8)
      else if (id === 'porcupine') place(el, near(PORCUPINE.s, -2, 60) ? this.porky.root : null, this.porky.height, 1.8)
      else if (id === 'frog') place(el, near(CREEK.at, -3, 50) ? this.frog.root : null, this.frog.height, 2)
      else if (id === 'deer') place(el, near(DEER.s, -4, 60) ? this.deer.root : null, this.deer.height, 1.2)
      else if (id === 'bear') place(el, near(BEAR.s, -6, 90) ? this.bear.root : null, this.bear.height, 1.3)
      else if (id === 'hare') place(el, near(HARE.s, -4, 50) ? this.hare.root : null, this.hare.height, 2)
      el.style.zIndex = id === 'bike' ? '3' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const p = this.toScreen(this.bikePos(tmp2).clone())
    return {
      section: this.section,
      mode: this.mode,
      s: +this.s.toFixed(1),
      lat: +this.lat.toFixed(2),
      y: +this.y.toFixed(2),
      air: this.air,
      speed: +this.d.speed.toFixed(1),
      steerLat: +this.steerLat.toFixed(2),
      push: +this.wheel.push.toFixed(2),
      way: way(this.s, this.lat) ?? this.picked,
      onBridge: this.onBridge,
      wet: this.wet,
      gondola: this.mode === 'gondola' ? +clamp(this.modeT / GOND_S).toFixed(2) : 1,
      done: this.doneT >= 0,
      arms: [+this.rider.rig.armL.rotation.z.toFixed(2), +this.rider.rig.armR.rotation.z.toFixed(2)],
      dir: Math.round(wrap(Math.PI - this.d.heading - phi(this.s)) * DEG),
      cam: Math.round(wrap(this.camYaw - phi(this.s)) * DEG),
      roll: +this.roll.toFixed(2),
      pitch: +this.pitch.toFixed(2),
      droll: +this.d.roll.toFixed(2),
      bike: { x: Math.round(p.x), y: Math.round(p.y) },
      ...this.counts,
      steered: +this.counts.steered.toFixed(1),
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

function isIn(o: Object3D | null, g: Object3D) {
  for (let p = o; p; p = p.parent) if (p === g) return true
  return false
}

