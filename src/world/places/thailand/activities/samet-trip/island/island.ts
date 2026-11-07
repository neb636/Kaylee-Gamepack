// Koh Samet, the island to roam (plan: planning/around-the-world/thailand/samet-trip.md, greybox 2): the north half
// of the island at 1:10 (layout.ts, from OpenStreetMap), one open world she walks round by herself.
//
// The toy (core verb): lead Kaylee with her finger. Hold a finger anywhere and she trots after it; hold it far ahead
// and she gallops; tap a spot and she walks there. Walk into the sea and she's swimming in her pink floatie, bobbing
// over the waves (a big one spins her round). Walk up to the green taxi or a jet ski and it glows: tap to hop on.
// It opens up as she plays:
//   1. land and wander: Na Dan pier, the shops, the sand, the sea, the floatie;
//   2. further: the sandy paths over the rocks to Hin Khok, Phai and Wong Duan, and the green taxi (taxi.ts) round
//      the concrete road, over the spine to Ao Prao and back;
//   3. the jet ski is hers: with the jet ski's flag, a jet ski waits on every beach, and she steers it round the coast
//      (engine3d/drive.ts, the jet ski's feel) and hops off on any beach.
// Mommy and Daddy follow at a little distance, stop at the water's edge when she swims, and do their own thing when she
// stops (Daddy lies down on the sand: tap him and he jumps up). The stops (any order) are the jet ski at Sai Kaew
// (opens its section), the sandcastle at Ao Hin Khok, the snorkel boat at Ao Wong Duan and the driftwood tree at Ao
// Prao (each opens its own world: the driftwood tree opens hide and seek, the deck's table lunch). Each stop's pink flag (`flags`) stands on its
// beach, and the day moves on with them: morning, noon, afternoon, golden (and `time=night` for the fire show's
// night). Things to poke everywhere (props.ts): palms drop coconuts (on Daddy's head, if he's under one), samet bark
// peels, umbrellas spin (three pokes and one takes off like a kite with Kaylee holding on), chairs fold, the beach
// ball rolls where she kicks it, crabs pop out of their holes, the ice cream cart dings, the bead tray jingles, the
// hammock swings, boats bob and toot, the taxi honks, the mermaid's tail splashes.
// Mommy's phone and the animal book (greybox 3, ../book/): with the phone out the camera comes in closer and a tap is a
// photo. Tap an animal and it turns and does something cute for the camera (the photo is taken at its best moment);
// the phone turns a little toward it, the way a real one focuses, and an animal big in the middle of the frame earns a
// gold frame. The animals live on the island (../book/creatures.ts: wander, flee, perch, swim) and react to a tap
// without the phone too. The beach clean (../book/clean.ts) is the side verb: lift the rubbish on the wet sand (an
// animal pops out where it was), carry it to the green bin, plonk.
// Quiet hub: no idle lines. After ~8 s with nothing touched, a pink flag arrow points at the nearest stop without a
// flag. Talk (lines.ts L.samet.island): Sparkle only when something is new (her first landing this visit, each beach the
// first time, the jet ski becoming hers, a fact the first time she pokes the mermaid or a samet tree), the family and the
// taxi driver react to her taps in their own voices. Its feel numbers are knobs (?feel=1).
import { Color, DynamicDrawUsage, Fog, Frustum, Object3D, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Raycaster, RingGeometry, Scene, CircleGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, firstTime, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { knobs, watch } from '../../../../../kit/knobs'
import { noise as hiss, sfx, tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { Driver, type Feel } from '../../../../../engine3d/drive'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { wearing } from '../../../trip/packing'
import { BananaBoat, Fish, Swimmer, Tern } from '../jetski/critters'
import { ANIMALS, type AnimalId } from '../book/animals'
import { BeachClean, BIN_IDS, JUNK_IDS } from '../book/clean'
import { WILD, Wildlife, type Creature, type PalmInfo, type WildCtx } from '../book/creatures'
import { framing, phoneCamera, portraits, snap } from '../book/photo'
import { buildSki, type Ski } from '../jetski/ski'
import { at as atFrame, bay, DECK, FRAMES, PARKED, POKES, spotStart, STOP_IDS, STOPS, SWIMMERS, WAVE_DIR, WAYS, type SpotId, type StopId, type XZ } from './layout'
import { buildProps, type PokeThing, type Props } from './props'
import { buildIsland, DAY, TIMES, type Island, type TimeOfDay } from './scenery'
import type { Surface } from './ground'
import { makeSeeThrough, SEE } from './seethrough'
import { Taxi } from './taxi'
import { FireDancers } from './dancers'

const FILE = 'src/world/places/thailand/activities/samet-trip/island/island.ts'
/** Leading Kaylee (and the floatie). */
const WALK = knobs('sametWalk', 'Leading Kaylee round the island', FILE, {
  trot: { value: 2.3, min: 0.8, max: 5, step: 0.1, label: 'Trot', unit: 'm/s', note: 'her speed with the finger a little way ahead' },
  gallop: { value: 4.6, min: 2, max: 9, step: 0.1, label: 'Gallop', unit: 'm/s', note: 'her speed with the finger far ahead' },
  gallopFrom: { value: 5.5, min: 2, max: 14, step: 0.25, label: 'Gallop from', unit: 'm', note: 'her finger this far ahead of her = full gallop' },
  stopNear: { value: 0.45, min: 0.1, max: 2, step: 0.05, label: 'Stop this close', unit: 'm', note: 'she stops when the finger is this close' },
  swim: { value: 1.5, min: 0.5, max: 4, step: 0.1, label: 'Swim', unit: 'm/s', note: 'paddling in the floatie (slower than walking)' },
  deep: { value: 0.5, min: 0.2, max: 1.2, step: 0.05, label: 'Swims from', unit: 'm deep', note: 'shallower than this she wades' },
  far: { value: 26, min: 8, max: 60, step: 1, label: 'Swim out to', unit: 'm', note: 'how far from the shore she can paddle' },
  wave: { value: 0.42, min: 0, max: 1.2, step: 0.02, label: 'Wave height', unit: 'm', note: 'the swell rolling in to the beach she is near' },
  spin: { value: 0.78, min: 0.3, max: 1, step: 0.02, label: 'A wave spins her from', note: 'how high on a crest (0..1) before the floatie spins round' },
})
const CAM = knobs('sametCam', 'The island camera', FILE, {
  pitch: { value: 31, min: 15, max: 70, step: 1, label: 'Looks down', unit: '°' },
  box: { value: 5.2, min: 3, max: 16, step: 0.25, label: 'Shows round her', unit: 'm', note: 'half the width of ground that fits across the screen' },
  ahead: { value: 1.8, min: 0, max: 6, step: 0.1, label: 'Looks ahead', unit: 'm', note: 'how far ahead of her the camera looks when she runs' },
  turn: { value: 0.7, min: 0.1, max: 3, step: 0.05, label: 'Turns to a new beach', unit: '/s', note: 'how quickly the camera swings round to face the next beach or path' },
  lag: { value: 0.35, min: 0.05, max: 1.2, step: 0.05, label: 'Follows her', unit: 's' },
  far: { value: 95, min: 40, max: 400, step: 5, label: 'Draws plants out to', unit: 'm', note: 'further trees are left to the haze (fewer triangles on the iPad)' },
  forest: { value: 54, min: 25, max: 80, step: 1, label: 'Looks down in the forest', unit: '°', note: 'on the roads and paths through the trees the camera rises over them' },
})
const PHONE = knobs('sametPhone', "Mommy's phone", FILE, {
  zoom: { value: 0.72, min: 0.4, max: 1, step: 0.02, label: 'Camera comes in to', note: 'with the phone out, how much of the ground shows (× the walking view)' },
  focus: { value: 0.35, min: 0, max: 0.8, step: 0.05, label: 'Leans toward an animal', note: 'the view slides this much of the way toward the nearest animal' },
  aim: { value: 0.7, min: 0, max: 1, step: 0.05, label: 'The photo turns to it', note: 'how much of the way the photo turns toward the animal she tapped' },
  lens: { value: 1.25, min: 1, max: 2.5, step: 0.05, label: 'Photo zoom', unit: '×', note: 'the least it zooms (Kaylee far from the animal)' },
  close: { value: 8, min: 3, max: 20, step: 0.5, label: 'Zooms in from', unit: 'm', note: 'Kaylee closer than this to the animal: the photo zooms in more (up to 3.2×), so getting close makes it big' },
  gold: { value: 0.2, min: 0.05, max: 0.6, step: 0.01, label: 'Gold from', note: 'the animal this tall on the photo (of its height) earns a gold frame' },
  middle: { value: 0.45, min: 0.1, max: 1, step: 0.05, label: 'Near the middle', note: 'and its middle at most this far from the photo\'s middle (1 = the edge)' },
  reach: { value: 140, min: 60, max: 300, step: 10, label: 'Tap finds an animal within', unit: 'px' },
  cull: { value: 70, min: 30, max: 200, step: 5, label: 'Animals live out to', unit: 'm', note: 'further than this from the camera they rest (frame rate)' },
})
const RIDE = knobs('sametRide', 'The green taxi and the jet ski', FILE, {
  taxi: { value: 6, min: 2, max: 14, step: 0.25, label: 'Taxi speed', unit: 'm/s' },
  near: { value: 7, min: 3, max: 15, step: 0.5, label: 'Hop on from', unit: 'm', note: 'she can hop on the taxi or a jet ski this close to it' },
  top: { value: 9.5, min: 4, max: 18, step: 0.25, label: 'Jet ski top speed', unit: 'm/s' },
  accel: { value: 7, min: 1, max: 16, step: 0.25, label: 'Jet ski speeding up', unit: 'm/s²' },
  turnRate: { value: 2, min: 0.5, max: 4, step: 0.05, label: 'Jet ski turn rate', unit: 'rad/s' },
  grip: { value: 2, min: 0.4, max: 10, step: 0.1, label: 'Jet ski grip' },
  dock: { value: 4.5, min: 1, max: 10, step: 0.25, label: 'Lands on a beach below', unit: 'm/s', note: 'slower than this onto a beach and she hops off; faster and it bounces off' },
})

export type IslandFlag = StopId
export interface IslandStart {
  at: SpotId
  flags: StopId[]
  time: TimeOfDay | null
  /** The animals already in her book. */
  book?: AnimalId[]
  /** Mommy's phone out from the start. */
  phone?: boolean
  /** What she packed for the trip (her sun hat and sunglasses go on). */
  packed?: string[]
}
/** A photo from Mommy's phone. */
export interface Snap {
  /** The animal in it (null: a photo of the island). */
  animal: AnimalId | null
  src: string
  gold: boolean
}
export interface IslandEvents {
  /** She opened a stop (tapped its thing up close), or sat down for lunch at the deck's table, or (all four flags up)
   *  the driftwood tree: the finale's sunset. */
  open(stop: StopId | 'lunch' | 'sunset'): void
  /** She reached a new beach (the address bar follows `at`). */
  at(spot: SpotId): void
  /** The shutter clicked (the screen flashes); the photo itself follows in `snap`. */
  shutter?(): void
  snap?(s: Snap): void
  /** An animal she hasn't snapped is close by (the phone button glows). */
  near?(on: boolean): void
  /** Something went in a bin (the beach clean's count). */
  cleaned?(n: number): void
  /** All four pink flags up and she tapped the speedboat at Na Dan pier: Mommy's photo of the island (for Agong's
   *  wall), and home. */
  home?(photo: string): void
  /** Someone says something (lines.ts L.samet.island): the screen's TripGuide speaks it. */
  say?(line: Line): void
}

const I = L.samet.island

const DEG = 180 / Math.PI
const HINT_S = 8
/** The table on the resort deck where the family has lunch (resortDeck's first table). */
const LUNCH_TABLE = atFrame(DECK, -2.5, 0.8)
/** How much the beach camera looks inland (vs along the sand): 0.6 ≈ 35° off the sand's line. */
const SIDE = 0.32
const tmp = new Vector3()
const tmp2 = new Vector3()
/** The speedboat at Na Dan pier (layout.ts POKES): once all four flags are up, it takes them home. */
const HOME_BOAT = 'speedboat:0'
/** Where she stands on the pier for Mommy's photo before they go (beside the speedboat). */
const HOME_PIER = atFrame(FRAMES.nadan, -4, 22)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const honk = () => [0, 0.22].forEach((d) => tone(420, 400, 0.16, 0.08, 'square', d))
const tune = () => [0, 0.16, 0.32, 0.48, 0.7].forEach((d, i) => tone([523, 659, 784, 659, 1046][i], [523, 659, 784, 659, 1046][i], 0.18, 0.05, 'triangle', d))
const flute = () => [0, 0.25, 0.5, 0.75, 1.05].forEach((d, i) => tone([784, 880, 988, 1175, 988][i], [790, 885, 992, 1180, 990][i], 0.3, 0.05, 'sine', d))
const ding = () => [0, 0.3].forEach((d) => tone(1568, 1566, 0.6, 0.06, 'sine', d))
const jingle = () => [0, 0.06, 0.12, 0.18, 0.26].forEach((d, i) => tone(2000 + i * 260, 2100 + i * 260, 0.12, 0.03, 'sine', d))
const bonk = () => {
  tone(300, 150, 0.18, 0.1)
  tone(1200, 1190, 0.4, 0.03, 'sine', 0.03)
}
const whee = () => tone(500, 1100, 0.5, 0.05, 'triangle')
const toot = () => [0, 0.18].forEach((d) => tone(620, 640, 0.14, 0.06, 'square', d))
const engine = (k: number) => tone(95 + k * 120, 90 + k * 115, 0.07, 0.016 + k * 0.012, 'sawtooth')
const pop = () => tone(700, 1400, 0.08, 0.06, 'sine')
const clack = () => [0, 0.07].forEach((d) => hiss(0.05, 0.2, 'bandpass', 1800, 1500, d))

/** Mommy, Daddy, whoever follows her: their own walk (the code-built toys have no legs: they hop along). */
interface Follower {
  m: Member
  /** Meters behind her along her trail, and to the side. */
  back: number
  side: number
  phase: number
  speed: number
  shadow: Mesh
  lie: number
}

type Mode = 'walk' | 'taxi' | 'ski' | 'kite'

/** Something the phone can snap: one of the book's animals (a creature, a tern, a crab from its hole). */
interface SnapTarget {
  kind: AnimalId
  id: string
  focus: Vector3
  size: number
  /** Seconds after the tap the shutter clicks (at the best moment of its pose). */
  snapAt: number
  pose(): void
}

const LABELS: Record<string, string> = { palm: 'A coconut palm', samet: 'A samet tree', umbrella: 'A beach umbrella', chair: 'A beach chair', ball: 'The beach ball', icecream: 'The ice cream cart', beads: "The bead seller's tray", crab: 'A crab hole', bush: 'Pink flowers', longtail: 'A longtail boat', speedboat: 'The speedboat', hammock: 'The hammock', telescope: 'The telescope', tamarind: 'The tamarind tree', deckbrella: 'An umbrella on the deck', lantern: 'A lantern' }

export const ISLAND_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'taxi', label: 'The green taxi', kind: 'thing' },
  { id: 'mermaid', label: 'The mermaid statue', kind: 'thing' },
  { id: 'bell', label: 'The bell on the jet ski hut', kind: 'thing' },
  { id: 'banana', label: 'The banana boat', kind: 'thing' },
  ...SWIMMERS.map((_, i) => ({ id: `swimmer:${i}`, label: 'A swimmer', kind: 'thing' as const })),
  ...[0, 1, 2].map((i) => ({ id: `tern:${i}`, label: 'A tern', kind: 'thing' as const })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: `umbrella-sk:${i}`, label: 'A beach umbrella', kind: 'thing' as const })),
  ...STOP_IDS.map((id) => ({ id: `stop:${id}`, label: STOPS[id].name, kind: 'thing' as const })),
  { id: 'lunch', label: 'Lunch on the deck', kind: 'thing' },
  ...STOP_IDS.map((id) => ({ id: `flag:${id}`, label: 'A pink flag', kind: 'thing' as const })),
  ...PARKED.map((p) => ({ id: `ski:${p.id}`, label: 'A jet ski', kind: 'thing' as const })),
  ...POKES.map((p) => ({ id: p.id, label: LABELS[p.kind], kind: 'thing' as const })),
  ...WILD.map((w) => ({ id: `ani:${w.id}`, label: ANIMALS[w.kind].name.replace('!', ''), kind: 'thing' as const })),
  ...JUNK_IDS.map((id) => ({ id, label: 'A bit of rubbish', kind: 'thing' as const })),
  ...BIN_IDS.map((id) => ({ id, label: 'The beach bin', kind: 'thing' as const })),
]

export class SametIsland implements World3D {
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
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private mode: Mode = 'walk'
  private flags: Set<StopId>
  private timeKey: TimeOfDay
  /** The fire dancers on Sai Kaew, out after dark. */
  private dancers: FireDancers
  private spot: SpotId

  // ---- Kaylee, Mommy, Daddy.
  private kaylee: Avatar
  private kShadow: Mesh
  private ring: Group
  private ringK = 0
  private nick: Follower
  private ji: Follower
  private trail: XZ[] = []
  private surface: Surface = 'sand'
  private swimming = false
  private deckOn = -1
  private y = 0
  private spinT = -1
  private spinCool = 0
  private stepDist = 0
  private lastPos = new Vector3()
  private stuckT = 0

  // ---- Her finger.
  private finger: { x: number; y: number; id?: string; leading: boolean } | null = null
  private target: Vector3 | null = null
  /** What she walks to, to use when she gets there (the taxi, a jet ski, a far stop). */
  private walkTo: { id: string; x: number; z: number } | null = null
  private lastTouch = 0
  private aimDist = 0

  // ---- The camera.
  private camYaw = 0
  private camGoal = 0
  private moveRef = new Vector3()

  // ---- Rides.
  private taxi: Taxi
  private taxiGlow: Mesh
  private aboard = false
  private skis: { id: SpotId; ski: Ski; x: number; z: number; face: number }[] = []
  private riding = -1
  private d: Driver
  private feel: Feel
  private skiGlow: Mesh
  private skiPitch = 0
  private skiAt = -9

  // ---- Life.
  private swimmers: Swimmer[] = []
  private terns: Tern[] = []
  private banana: BananaBoat
  private bananaS = 0
  private spray: Particles
  private puffs: Particles
  private petals: Particles
  private stars: Particles
  private prints: InstancedMesh
  private printAt: { x: number; z: number; yaw: number; t: number; wet: boolean }[] = []
  private printNext = 0
  private printSide = 1
  private stopRings: Record<StopId, Mesh>
  private anim = new Map<string, { t: number; k: number; v: number }>()
  private coconuts: { g: Group; vy: number; y: number; vx: number; vz: number; t: number; bonked: boolean }[] = []
  private coconutGeo: Group
  private ball = { vx: 0, vz: 0, vy: 0, y: 0 }
  private umbrellaTaps = new Map<string, number[]>()
  private kite: { id: string; t: number; from: Vector3; to: Vector3 } | null = null
  private crabs = new Map<string, number>()
  private cone: Group
  private coneT = -1
  private bellSwing = 0
  private tailT = -1
  // ---- Mommy's phone, the animals and the beach clean.
  private wild: Wildlife
  private clean: BeachClean
  private fish: Fish
  private bubbles: Particles
  private phone = false
  private phoneProp: Group
  private found: Set<AnimalId>
  private pendingSnap: { c: SnapTarget | null; t: number } | null = null
  /** Going home: null before all four flags are up (or with no way home), false waiting, true on the way. */
  private goingHome: boolean | null = null
  private homeSnap = false
  private wantPortraits: ((p: Record<AnimalId, string>) => void) | null = null
  private nearAnimal = false
  private bumpV = { x: 0, z: 0, t: 0 }
  private wctx!: WildCtx
  private counts = { snaps: 0, animalSnaps: 0, golds: 0, cleaned: 0, lifted: 0, boings: 0, taps: 0, pokes: 0, swims: 0, spins: 0, taxiRides: 0, skiRides: 0, kites: 0, coconuts: 0, bonks: 0, kicks: 0, gallops: 0, beaches: 0 }
  private seen = new Set<SpotId>()
  private greeted = false
  private talk = { nick: 0, ji: 0, taxi: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: IslandStart,
    private events: IslandEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    this.rig.fov = 46
    this.rig.lag = CAM.lag
    this.rig.camera.far = 3200
    this.flags = new Set(start.flags)
    this.goingHome = this.flags.size === STOP_IDS.length && events.home ? false : null
    this.timeKey = start.time ?? TIMES[Math.min(3, this.flags.size === 4 ? 3 : this.flags.size === 3 ? 2 : this.flags.size)]
    this.spot = start.at

    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.props = buildProps(bag, this.isl.root, this.isl.ground, this.isl.blockers, this.isl.cullable)
    makeSeeThrough(this.isl.root, bag, new Set([...this.isl.fine.meshes, ...this.isl.coarse.meshes]))
    this.setTime(this.timeKey)
    this.dancers = new FireDancers(bag, scene, (x, z) => this.heightAt(x, z))

    // ---- Kaylee and her floatie (a pink and white ring round her middle, only in the sea).
    this.kaylee = new Avatar(bag)
    if (start.packed?.length) this.kaylee.wear(wearing(start.packed).filter((w) => w !== 'floaties'))
    scene.add(this.kaylee.root)
    this.kShadow = blobShadow(0.45, bag)
    scene.add(this.kShadow)
    this.ring = new Group()
    const H = this.kaylee.height
    this.ring.add(solid(merge([P.torus(H * 0.33, H * 0.11, PAL.hotpink, { rot: [Math.PI / 2, 0, 0] }), ...[0, 1, 2, 3].map((k) => P.torus(H * 0.33, H * 0.115, '#FFFFFF', { rot: [Math.PI / 2, 0, (k * Math.PI) / 2] }, 0.5))]), bag, 2))
    this.ring.position.y = H * 0.36
    this.ring.scale.setScalar(0.001)
    this.ring.visible = false
    this.kaylee.root.add(this.ring)
    // The coconut ice cream she holds for a bit.
    this.cone = new Group()
    this.cone.add(solid(merge([P.cone(0.09, 0.26, '#E7B477', { rot: [Math.PI, 0, 0] }, 10), P.sphere(0.1, '#FFF3E2', { at: [0, 0.16, 0] }, 10), P.sphere(0.05, '#8A6A3E', { at: [0.03, 0.25, 0] }, 6)]), bag, 2))
    this.cone.visible = false
    scene.add(this.cone)

    const fam = (id: string, back: number, side: number): Follower => {
      const m = new Member({ ...FAMILY.find((f) => f.id === id)!, spot: null }, bag)
      scene.add(m.root)
      const shadow = blobShadow(0.5, bag)
      scene.add(shadow)
      return { m, back, side, phase: Math.random() * 3, speed: 0, shadow, lie: 0 }
    }
    this.nick = fam('nick', 2.6, 0.9)
    this.ji = fam('ji', 3.8, -0.9)

    // ---- Where the link starts.
    const s = spotStart(start.at)
    this.y = this.heightAt(s.x, s.z)
    this.kaylee.place(s.x, this.y, s.z, s.face * DEG)
    for (let i = 0; i < 30; i++) this.trail.push({ x: s.x - Math.sin(s.face) * i * 0.3, z: s.z - Math.cos(s.face) * i * 0.3 })
    for (const f of [this.nick, this.ji]) {
      const p = this.trailPoint(f.back, f.side)
      f.m.place(p.x, this.heightAt(p.x, p.z), p.z, s.face * DEG, 'stand')
    }
    this.camYaw = this.camGoal = this.spotYaw(start.at) ?? s.face
    this.seen.add(start.at)
    this.lastPos.copy(this.kaylee.root.position)

    // ---- The green taxi: waiting at the stop nearest where she lands.
    let ti = 0
    let td = Infinity
    for (let i = 0; i < 4; i++) {
      const t = Taxi.stopAt(i).at
      const d = Math.hypot(t.x - s.x, t.z - s.z)
      if (d < td) {
        td = d
        ti = i
      }
    }
    this.taxi = new Taxi(bag, ti)
    this.taxi.waitT = 14
    scene.add(this.taxi.root)
    const glowMat = () => bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0, depthWrite: false }))
    this.taxiGlow = new Mesh(bag.add(new RingGeometry(3.4, 3.9, 40)), glowMat())
    this.taxiGlow.rotation.x = -Math.PI / 2
    this.taxiGlow.renderOrder = 3
    scene.add(this.taxiGlow)

    // ---- The jet skis (hers once the jet ski's flag is up): one waiting on every beach.
    this.feel = { top: RIDE.top, boost: 1.4, accel: RIDE.accel, coast: 0.55, turn: RIDE.turnRate, grip: RIDE.grip, near: 2.5, far: 18, dead: 0.12, lean: 0.34 }
    this.d = new Driver(this.feel)
    for (const p of PARKED) {
      const ski = buildSki(bag)
      ski.root.position.set(p.at.x, 0, p.at.z)
      ski.root.rotation.y = p.face
      ski.root.visible = this.flags.has('jetski') || p.id === 'saikaew'
      scene.add(ski.root)
      this.skis.push({ id: p.id, ski, x: p.at.x, z: p.at.z, face: p.face })
    }
    this.skiGlow = new Mesh(bag.add(new RingGeometry(2.4, 2.85, 36)), glowMat())
    this.skiGlow.rotation.x = -Math.PI / 2
    this.skiGlow.renderOrder = 3
    scene.add(this.skiGlow)

    // ---- The stops: a soft pink ring on the ground at each, and the pink flags already earned.
    this.stopRings = {} as Record<StopId, Mesh>
    for (const id of STOP_IDS) {
      const r = new Mesh(bag.add(new RingGeometry(2.2, 2.6, 40)), glowMat())
      r.rotation.x = -Math.PI / 2
      r.renderOrder = 3
      const at = STOPS[id].at
      r.position.set(at.x, Math.max(0.05, this.heightAt(at.x, at.z)) + 0.05, at.z)
      scene.add(r)
      this.stopRings[id] = r
      this.props.flags[id].visible = this.flags.has(id)
    }

    // ---- Sai Kaew's life (from the jet ski bay): swimmers, terns, the banana boat whooshing past.
    SWIMMERS.forEach((p, i) => {
      const sw = new Swimmer(bag, i)
      sw.root.position.set(p.x, 0, p.z)
      sw.root.rotation.y = Math.atan2(-WAVE_DIR.x, -WAVE_DIR.z) + Math.PI + (i - 1.5) * 0.4
      scene.add(sw.root)
      this.swimmers.push(sw)
    })
    const c1 = bay(-10, 30)
    const c2 = bay(22, 44)
    const wd = FRAMES.wongduan
    this.terns = [new Tern(bag, c1.x, c1.z, 14, 9, 5, 0), new Tern(bag, c2.x, c2.z, 18, 11, 6, 2), new Tern(bag, wd.x + wd.n.x * 25, wd.z + wd.n.z * 25, 16, 10, 5.5, 4)]
    for (const t of this.terns) scene.add(t.root)
    this.banana = new BananaBoat(bag)
    scene.add(this.banana.root)

    // ---- The animals for her book, and the beach clean.
    const palms = new Map<string, PalmInfo>()
    for (const [id, p] of this.props.pokes) if (p.kind === 'palm') palms.set(id, { at: p.at, y: p.y, top: p.top })
    this.wild = new Wildlife(bag, palms)
    this.found = new Set(start.book ?? [])
    this.wild.found = this.found
    scene.add(this.wild.root)
    this.clean = new BeachClean(bag, this.isl.ground, (x, z, r) => this.isl.blockers.add(x, z, r))
    scene.add(this.clean.root)
    this.fish = new Fish(bag, 6)
    scene.add(this.fish.root)
    // Mommy's phone in her hand: pink, with a little camera lens.
    this.phoneProp = solid(merge([P.rbox(0.2, 0.32, 0.035, 0.03, PAL.hotpink, {}), P.rbox(0.17, 0.27, 0.01, 0.02, '#2B2330', { at: [0, 0.01, 0.018] }), P.cyl(0.022, 0.022, 0.02, '#FFFFFF', { at: [0.05, 0.1, -0.025], rot: [Math.PI / 2, 0, 0] }, 8)]), bag, 1.5)
    this.phoneProp.visible = false
    scene.add(this.phoneProp)
    this.phone = !!start.phone

    // ---- Particles: spray, sand puffs, petals and bark flakes, dizzy stars; footprints in the sand.
    this.spray = new Particles({ kind: 'spray', count: 320, colors: ['#FFFFFF', '#EAFBFF', '#D6F6FF'], gravity: 13 }, bag)
    this.puffs = new Particles({ kind: 'spray', count: 160, colors: ['#FFF4DE', '#F1E3C4', '#EBD5AA'], gravity: 4 }, bag)
    this.petals = new Particles({ kind: 'spray', count: 160, colors: ['#FF5FA8', '#FF8FC6', '#FFFFFF', '#F7E3D8'], gravity: 1.2 }, bag)
    this.stars = new Particles({ kind: 'spray', count: 120, colors: [PAL.gold, '#FFFFFF', PAL.pink], gravity: 0 }, bag)
    this.bubbles = new Particles({ kind: 'spray', count: 90, colors: ['#FFFFFF', '#DFF8FF', '#BFEFFF'], gravity: -2.2 }, bag)
    scene.add(this.spray.mesh, this.puffs.mesh, this.petals.mesh, this.stars.mesh, this.bubbles.mesh)
    const printMat = bag.add(new MeshBasicMaterial({ color: '#C9B48E', transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }))
    this.prints = new InstancedMesh(bag.add(new CircleGeometry(0.075, 10)), printMat, 120)
    this.prints.instanceMatrix.setUsage(DynamicDrawUsage)
    this.prints.frustumCulled = false
    this.prints.renderOrder = 1
    this.prints.count = 0
    for (let i = 0; i < 120; i++) this.prints.setColorAt(i, new Color('#C9B48E'))
    scene.add(this.prints)

    // A coconut (copied for each one that drops).
    this.coconutGeo = solid(merge([P.sphere(0.2, '#8A6A3E', { scale: [1, 0.92, 1] }, 10), P.sphere(0.06, '#5C4428', { at: [0, 0.17, 0.05] }, 6)]), bag, 2)

    scene.fog = new Fog(DAY[this.timeKey].haze, 120, 700)
    this.wctx = {
      t: 0,
      ground: this.isl.ground,
      water: (x, z) => this.isl.lagoon.heightAt(x, z, this.time, this.isl.ground.shoreAt(x, z)),
      blocked: (x, z, r) => this.isl.blockers.near(x, z).some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br + r),
      her: new Vector3(),
      herSpeed: 0,
      swimming: false,
      daddy: new Vector3(),
      dusk: false,
      eye: new Vector3(),
      fx: {
        sparkle: (x, y, z) => this.stars.emit(x, y, z, (Math.random() - 0.5) * 0.3, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3, 0.9, 0.09, Math.random() < 0.6 ? 0 : 1),
        splash: (x, y, z, n) => this.spray.burst(x, y, z, n, 1.2, 1.8, 0.1),
        bubbles: (x, y, z, n) => {
          for (let i = 0; i < n; i++) this.bubbles.emit(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.2, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 0.2, 1.2, 0.07)
        },
        puff: (x, y, z, n) => this.puffs.burst(x, y, z, n, 1, 1.2, 0.1),
        daddy: (kind) => this.nick.m.react(kind),
      },
    }
    this.unwatch = watch('samet-island', () => ({
      'her finger ahead (m)': [this.aimDist, 20],
      'her speed (m/s)': [this.speedNow(), 8],
      'in the sea': [this.swimming ? 1 : 0, 1],
      'camera turning (°)': [Math.abs(wrap(this.camGoal - this.camYaw)) * DEG, 90],
    }))
    this.rig.setShot(this.shot(), true)
  }

  // ---------------------------------------------------------------- the day

  private setTime(k: TimeOfDay) {
    this.timeKey = k
    this.isl.setTime(k)
    if (this.scene.fog) (this.scene.fog as Fog).color.set(DAY[k].haze)
  }

  // ---------------------------------------------------------------- the ground under her

  /** Where she stands: the ground, a deck or the pier (their tops), never under the sea floor's own height. */
  private heightAt(x: number, z: number) {
    const g = this.isl.ground.heightAt(x, z)
    for (const d of this.props.decks) {
      const dx = x - d.x
      const dz = z - d.z
      const u = dx * d.t.x + dz * d.t.z
      const v = dx * d.n.x + dz * d.n.z
      if (Math.abs(u) > d.hw + 0.05) continue
      if (Math.abs(v) <= d.hd) return d.y
      if (v < -d.hd && v > -d.hd - d.ramp) {
        const k = (-d.hd - v) / d.ramp
        return d.y + (Math.max(g, 0) - d.y) * k
      }
    }
    return g
  }
  /** Which deck (or pier) a point is on (its top or its steps), -1 if none. */
  private deckAt(x: number, z: number) {
    const ds = this.props.decks
    for (let i = 0; i < ds.length; i++) {
      const d = ds[i]
      const dx = x - d.x
      const dz = z - d.z
      const u = dx * d.t.x + dz * d.t.z
      const v = dx * d.n.x + dz * d.n.z
      if (Math.abs(u) <= d.hw && v <= d.hd && v >= -d.hd - d.ramp) return i
    }
    return -1
  }
  private inDeckTop(i: number, x: number, z: number) {
    const d = this.props.decks[i]
    const dx = x - d.x
    const dz = z - d.z
    const u = dx * d.t.x + dz * d.t.z
    const v = dx * d.n.x + dz * d.n.z
    return Math.abs(u) <= d.hw + 0.6 && Math.abs(v) <= d.hd + 0.6
  }
  /** Can she stand (or paddle) here? */
  private free = (x: number, z: number) => {
    const on = this.deckOn
    const di = this.deckAt(x, z)
    if (on >= 0) return di === on
    if (di < 0) for (let i = 0; i < this.props.decks.length; i++) if (this.inDeckTop(i, x, z)) return false
    if (di >= 0) {
      // Onto a deck only up its steps (its land end).
      const d = this.props.decks[di]
      const v = (x - d.x) * d.n.x + (z - d.z) * d.n.z
      if (v > -d.hd) return false
    }
    const s = this.isl.ground.surfaceAt(x, z)
    if (s === 'forest') return false
    if (s === 'water' && this.isl.ground.shoreAt(x, z) > WALK.far) return false
    // (Inside something already, a deep link or a hop: any step that takes her further out is fine.)
    const k = this.kaylee?.root.position
    for (const [bx, bz, r] of this.isl.blockers.near(x, z)) {
      const d = Math.hypot(x - bx, z - bz)
      if (d < r + 0.22 && !(k && Math.hypot(k.x - bx, k.z - bz) < r + 0.22 && d > Math.hypot(k.x - bx, k.z - bz))) return false
    }
    return true
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

  update(dt: number) {
    if (!this.greeted && this.time > 0.8) this.greet()
    const t = (this.time += dt)
    this.rig.lag = CAM.lag
    this.feel.top = RIDE.top
    this.feel.accel = RIDE.accel
    this.feel.turn = RIDE.turnRate
    this.feel.grip = RIDE.grip
    const k = this.kaylee.root.position
    // A finger held still is still playing (no hint while she holds it down).
    if (this.finger) this.lastTouch = t
    if (this.mode === 'walk') this.lead(dt)
    else if (this.mode === 'ski') this.rideSki(dt)
    else if (this.mode === 'kite') this.flyKite(dt)
    this.kaylee.update(dt, t)
    if (this.mode === 'walk' || this.mode === 'kite') this.underfoot(dt)
    this.taxiStep(dt)
    this.follow(dt, t)
    this.life(dt, t)
    this.animals(dt, t)
    this.whereAmI()
    // The swell: rolling in toward the beach she's nearest, a little bigger at Sai Kaew.
    const lag = this.isl.lagoon
    const f = this.nearestFrame(k.x, k.z)
    const goal = { x: -f.n.x, z: -f.n.z }
    lag.waves.dir = { x: lag.waves.dir.x + (goal.x - lag.waves.dir.x) * ease(dt, 0.2), z: lag.waves.dir.z + (goal.z - lag.waves.dir.z) * ease(dt, 0.2) }
    lag.waves.height += (WALK.wave - lag.waves.height) * ease(dt, 0.5)
    lag.waves.length = 15
    lag.waves.speed = 3.4
    const cx = this.mode === 'ski' ? this.d.x : k.x
    const cz = this.mode === 'ski' ? this.d.z : k.z
    lag.update(t, cx, cz)
    this.lights.follow(cx, 0, cz)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.props.setLamps(this.isl.lamps, t)
    this.dancers.update(dt, t, this.isl.lamps)
    for (const p of [this.spray, this.puffs, this.petals, this.stars, this.bubbles]) p.update(dt)
    this.camera(dt)
    this.rig.update(dt)
    if ((this.cullT -= dt) <= 0) {
      this.cullT = 0.25
      const c = this.rig.camera.position
      this.isl.cull(c.x, c.z, CAM.far)
    }
    // See through whatever stands between the camera and her (or her ride).
    SEE.uEye.value.copy(this.rig.camera.position)
    if (this.mode === 'ski') SEE.uFocus.value.set(this.d.x, 0.8, this.d.z)
    else if (this.mode === 'taxi') SEE.uFocus.value.copy(this.taxi.root.position).setY(this.taxi.root.position.y + 1.4)
    else SEE.uFocus.value.set(k.x, k.y + 0.7, k.z)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- leading Kaylee

  /** The ground point under a screen point (the camera's ray marched down onto the island, the sea's surface at sea). */
  private pick(x: number, y: number, out: Vector3): Vector3 | null {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const r = this.raycaster.ray
    let prev = 0
    for (let s = 1; s < 260; s += s < 40 ? 0.75 : 2) {
      r.at(s, out)
      const g = Math.max(0, this.heightAt(out.x, out.z))
      if (out.y <= g) {
        // Back up between the last two steps.
        let a = prev
        let b = s
        for (let i = 0; i < 6; i++) {
          const m = (a + b) / 2
          r.at(m, tmp2)
          if (tmp2.y <= Math.max(0, this.heightAt(tmp2.x, tmp2.z))) b = m
          else a = m
        }
        r.at(b, out)
        return out
      }
      prev = s
    }
    return null
  }

  private speedNow() {
    const k = this.kaylee.root.position
    return this.lastSpeed ?? Math.hypot(k.x - this.lastPos.x, k.z - this.lastPos.z)
  }
  private lastSpeed = 0
  private lastTurn = 0

  private lead(dt: number) {
    const k = this.kaylee.root.position
    let goal: Vector3 | null = null
    if (this.finger?.leading) goal = this.pick(this.finger.x, this.finger.y, tmp)
    else if (this.target) goal = this.target
    this.aimDist = 0
    if (goal && !this.kaylee.walking) {
      const dx = goal.x - k.x
      const dz = goal.z - k.z
      const d = Math.hypot(dx, dz)
      this.aimDist = d
      if (d < WALK.stopNear) {
        this.kaylee.steer(0, 0, 0, this.free)
        if (!this.finger) {
          this.target = null
          this.arrive()
        }
      } else {
        const run = smooth(1.2, WALK.gallopFrom, d)
        const speed = this.swimming ? WALK.swim : WALK.trot + (WALK.gallop - WALK.trot) * run
        this.kaylee.pace = speed / 1.8
        // (The walk's own speed is 1.8 m/s × pace; ease off for the last bit so she doesn't overshoot.) Something in
        // the way (a lounger, a palm, the forest's edge): turn a little at a time until there's room, the side nearer
        // the way she wants first, so she slides round it instead of stopping.
        let ux = dx / d
        let uz = dz / d
        const probe = 0.55
        if (!this.free(k.x + ux * probe, k.z + uz * probe)) {
          const side = this.lastTurn || 1
          for (const a of [0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4]) {
            const r = a * side
            const rx = ux * Math.cos(r) + uz * Math.sin(r)
            const rz = -ux * Math.sin(r) + uz * Math.cos(r)
            if (this.free(k.x + rx * probe, k.z + rz * probe)) {
              ux = rx
              uz = rz
              this.lastTurn = Math.sign(r)
              break
            }
          }
        } else this.lastTurn = 0
        this.kaylee.steer(ux, uz, clamp(d / 0.9, 0.3, 1), this.free)
        if (run > 0.9 && !this.swimming && this.surface !== 'water' && Math.random() < dt * 6) this.puffs.burst(k.x, this.y + 0.05, k.z, 2, 1.0, 1.2, 0.09)
      }
    } else if (!goal) this.kaylee.steer(0, 0, 0, this.free)
    // Got stuck against something: stop trying (no running on the spot).
    const moved = Math.hypot(k.x - this.lastPos.x, k.z - this.lastPos.z)
    this.lastSpeed = dt > 0 ? moved / dt : 0
    this.stuckT = goal && moved < dt * 0.3 ? this.stuckT + dt : 0
    if (this.stuckT > 0.7 && !this.finger) {
      this.target = null
      this.walkTo = null
      this.kaylee.steer(0, 0, 0, this.free)
      this.stuckT = 0
    }
    if (moved > 0.01) {
      const last = this.trail[0]
      if (!last || Math.hypot(k.x - last.x, k.z - last.z) > 0.3) {
        this.trail.unshift({ x: k.x, z: k.z })
        if (this.trail.length > 80) this.trail.pop()
      }
    }
    this.lastPos.copy(k)
  }

  /** Once a visit: Sparkle's hello on the island, the jet ski hers (its flag up), Daddy calling everyone to the
   *  driftwood tree (all four flags). */
  private greet() {
    this.greeted = true
    const say = (l: Line) => this.events.say?.(l)
    if (firstTime('samet-island-hi')) say(I.hi)
    // (The beach she lands on counts as seen: its line would only repeat the hello.)
    firstTime(`samet-beach-${this.spot}`)
    if (this.flags.has('jetski') && firstTime('samet-ski-hers')) say(I.hers)
    if (this.flags.size === STOP_IDS.length && firstTime('samet-sunset-call')) say(I.sunset)
  }

  /** She got where a tap sent her: use what she walked to. */
  private arrive() {
    const w = this.walkTo
    this.walkTo = null
    if (!w) return
    this.use(w.id, true)
  }

  /** The ground, the sea, the decks under her: her height, the floatie, splashes, prints and puffs. */
  private underfoot(dt: number) {
    const k = this.kaylee.root.position
    this.deckOn = this.deckAt(k.x, k.z)
    const s: Surface = this.deckOn >= 0 ? 'road' : this.isl.ground.surfaceAt(k.x, k.z)
    const g = this.heightAt(k.x, k.z)
    const deep = this.deckOn < 0 && g < -WALK.deep
    const was = this.swimming
    this.swimming = deep
    this.surface = s
    const water = this.isl.lagoon.heightAt(k.x, k.z, this.time, this.isl.ground.shoreAt(k.x, k.z))
    const H = this.kaylee.height
    const want = deep ? water - H * 0.42 : g
    if (this.mode !== 'kite') {
      this.y += (want - this.y) * ease(dt, deep !== was ? 6 : 18)
      k.y = this.y
    }
    if (deep && !was) {
      // In she goes: a splash, the floatie pops on (and her arm floaties).
      sfx.splash()
      this.spray.burst(k.x, water, k.z, 22, 2.2, 3, 0.16)
      this.counts.swims++
      this.ring.visible = true
      if (!this.kaylee.wearing.includes('floaties')) this.kaylee.putOn(['floaties'])
    }
    if (!deep && was) sfx.boing()
    this.ringK += ((deep ? 1 : 0) - this.ringK) * ease(dt, 8)
    this.ring.scale.setScalar(Math.max(0.001, this.ringK))
    this.ring.visible = this.ringK > 0.02
    this.kaylee.setPose(deep ? 'sit' : this.kaylee.pose === 'sit' ? 'stand' : this.kaylee.pose)
    // A big wave lifts her and spins the floatie round.
    this.spinCool -= dt
    if (deep && this.spinT < 0 && this.spinCool <= 0) {
      const c = this.isl.lagoon.crestAt(k.x, k.z, this.time, this.isl.ground.shoreAt(k.x, k.z))
      if (c > WALK.spin && this.isl.lagoon.waves.height > 0.25) {
        this.spinT = 0
        this.spinCool = 5
        this.counts.spins++
        whee()
        this.spray.burst(k.x, water + 0.2, k.z, 12, 1.6, 2.2, 0.14)
      }
    }
    if (this.spinT >= 0) {
      this.spinT = Math.min(1, this.spinT + dt / 1.1)
      this.kaylee.root.rotation.y += dt * Math.PI * 2 * Math.sin(Math.PI * this.spinT) * 1.6
      if (this.spinT >= 1) this.spinT = -1
    }
    // Paddling: little ripples; on the sand: hoofprints (shiny ones on the wet sand), puffs when she gallops.
    const moved = this.lastSpeed * dt
    this.stepDist += moved
    if (deep && this.stepDist > 0.5) {
      this.stepDist = 0
      this.spray.burst(k.x, water, k.z, 3, 0.6, 0.8, 0.08)
      if (Math.random() < 0.3) sfx.splash()
    }
    if (!deep && this.stepDist > 0.42) {
      this.stepDist = 0
      if (s === 'sand' || s === 'wet') this.print(k.x, k.z, this.kaylee.root.rotation.y, s === 'wet')
      if (g < 0) this.spray.burst(k.x, Math.max(0, water), k.z, 4, 0.8, 1.4, 0.08)
    }
    this.kShadow.position.set(k.x, (deep ? water : g) + 0.03, k.z)
    this.kShadow.visible = !deep
  }

  private print(x: number, z: number, yaw: number, wet: boolean) {
    this.printSide = -this.printSide
    const i = this.printNext
    this.printNext = (this.printNext + 1) % 120
    const ox = Math.cos(yaw) * 0.12 * this.printSide
    const oz = -Math.sin(yaw) * 0.12 * this.printSide
    this.printAt[i] = { x: x + ox, z: z + oz, yaw, t: this.time, wet }
    this.prints.setColorAt(i, new Color(wet ? '#F4F7F8' : '#C9B48E'))
    if (this.prints.instanceColor) this.prints.instanceColor.needsUpdate = true
    this.prints.count = Math.max(this.prints.count, i + 1)
  }
  private placePrints() {
    const m = new Matrix4()
    const qq = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
    for (let i = 0; i < this.prints.count; i++) {
      const p = this.printAt[i]
      if (!p) continue
      const age = this.time - p.t
      // Wet prints: the swash wipes them in a few seconds; dry ones last a while.
      const life = p.wet ? 5 : 26
      const s = age > life ? 0.001 : 1 - Math.max(0, (age - life * 0.6) / (life * 0.4))
      m.compose(tmp.set(p.x, this.isl.ground.heightAt(p.x, p.z) + 0.02, p.z), qq, tmp2.set(s, s * 1.4, s))
      this.prints.setMatrixAt(i, m)
    }
    this.prints.instanceMatrix.needsUpdate = true
  }

  // ---------------------------------------------------------------- Mommy and Daddy

  private trailPoint(back: number, side: number): XZ {
    let left = back
    const tr = this.trail
    let p = tr[0]
    for (let i = 1; i < tr.length; i++) {
      const a = tr[i - 1]
      const b = tr[i]
      const l = Math.hypot(b.x - a.x, b.z - a.z)
      if (left <= l) {
        const k = left / (l || 1)
        p = { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k }
        const nx = -(b.z - a.z) / (l || 1)
        const nz = (b.x - a.x) / (l || 1)
        return { x: p.x + nx * side, z: p.z + nz * side }
      }
      left -= l
      p = b
    }
    return p
  }

  private follow(dt: number, t: number) {
    const k = this.kaylee.root.position
    const idle = this.time - this.lastTouch > 7 && this.lastSpeed < 0.1 && this.mode === 'walk' && !this.swimming
    for (const f of [this.nick, this.ji]) {
      const m = f.m
      const r = m.root
      if (this.aboard || (this.mode === 'ski' && f === this.nick)) {
        m.update(dt, t)
        f.shadow.visible = false
        continue
      }
      f.shadow.visible = true
      let goal = this.trailPoint(f.back, f.side)
      // They stop at the water's edge when she swims (and wave from the sand).
      if (this.isl.ground.heightAt(goal.x, goal.z) < -0.15 || !this.free(goal.x, goal.z)) {
        for (let i = 0; i < this.trail.length; i += 2) {
          const p = this.trail[i]
          if (this.isl.ground.heightAt(p.x, p.z) > -0.1 && this.free(p.x, p.z)) {
            goal = { x: p.x + (f === this.nick ? 0.6 : -0.6), z: p.z }
            break
          }
        }
      }
      const dx = goal.x - r.position.x
      const dz = goal.z - r.position.z
      const d = Math.hypot(dx, dz)
      // Left far behind (a ride, a long swim): they catch up off screen.
      if (d > 30 && !this.onScreen(r.position)) {
        r.position.set(goal.x, this.heightAt(goal.x, goal.z), goal.z)
        continue
      }
      const want = d < 0.25 ? 0 : clamp(d * 1.4, 0, Math.max(WALK.gallop * 1.05, this.lastSpeed + 0.5))
      f.speed += clamp(want - f.speed, -8 * dt, 6 * dt)
      if (d > 0.01 && f.speed > 0.01) {
        const step = Math.min(d, f.speed * dt)
        r.position.x += (dx / d) * step
        r.position.z += (dz / d) * step
        r.rotation.y += wrap(Math.atan2(dx, dz) - r.rotation.y) * ease(dt, 8)
        f.phase += dt * (5 + f.speed * 2.2)
      }
      // Their walk: a hop-along waddle (the toys have no legs).
      const g = this.heightAt(r.position.x, r.position.z)
      const hop = f.speed > 0.2 ? Math.abs(Math.sin(f.phase)) * 0.07 * Math.min(1, f.speed / 2) * m.height : 0
      r.position.y = g + hop
      r.rotation.z = f.speed > 0.2 ? Math.sin(f.phase) * 0.06 : r.rotation.z * 0.9
      f.shadow.position.set(r.position.x, g + 0.03, r.position.z)
      // When she stops for a while on a beach: Daddy lies down on the sand, Mommy watches her.
      const beach = this.surface === 'sand' || this.surface === 'wet'
      f.lie += ((f === this.nick && idle && beach && d < 1 ? 1 : 0) - f.lie) * ease(dt, 1.5)
      if (f === this.nick) {
        if (f.lie > 0.6 && m.pose !== 'lie') m.setPose('lie')
        if (f.lie < 0.4 && m.pose === 'lie') {
          m.setPose('stand')
          m.react('hop')
        }
      }
      if (m.pose !== 'lie') m.lookAt(k.x, k.y + 0.8, k.z)
      m.update(dt, t)
    }
  }

  private onScreen(p: Vector3) {
    const s = tmp2.copy(p).project(this.rig.camera)
    return s.z < 1 && Math.abs(s.x) < 1.15 && Math.abs(s.y) < 1.15
  }

  // ---------------------------------------------------------------- the green taxi

  private taxiStep(dt: number) {
    const tx = this.taxi
    const k = this.kaylee.root.position
    const near = this.mode === 'walk' && Math.hypot(k.x - tx.root.position.x, k.z - tx.root.position.z) < RIDE.near + 2
    // It waits while she's close by (and a moment after she climbs in), or while she rides and hasn't hopped off.
    tx.hold = near && tx.state === 'wait'
    tx.update(dt, (x, z) => Math.max(0, this.isl.ground.heightAt(x, z)), RIDE.taxi)
    if (this.aboard && tx.state === 'wait' && tx.waitT > 6.5 && !this.taxiArrived) {
      this.taxiArrived = true
      toot()
    }
    if (tx.state === 'drive') this.taxiArrived = false
    if (tx.laps !== this.taxiLaps) {
      this.taxiLaps = tx.laps
      if (this.aboard) tune()
    }
    const gm = this.taxiGlow.material as MeshBasicMaterial
    const glow = this.mode === 'walk' && tx.state === 'wait' && near ? 0.55 + 0.3 * Math.sin(this.time * 5) : 0
    gm.opacity += (glow - gm.opacity) * ease(dt, 6)
    this.taxiGlow.position.set(tx.root.position.x, tx.root.position.y + 0.06, tx.root.position.z)
    this.taxiGlow.visible = gm.opacity > 0.02
    if (this.aboard) {
      // Riding: they sit in the back, and their shadows ride along.
      this.kShadow.visible = false
      for (const f of [this.nick, this.ji]) f.shadow.visible = false
    }
  }
  private taxiArrived = false
  private taxiLaps = 0

  private boardTaxi() {
    const tx = this.taxi
    this.mode = 'taxi'
    this.aboard = true
    this.target = null
    this.counts.taxiRides++
    sfx.boing()
    this.events.say?.(firstTime('samet-taxi-hi') ? I.taxi.hi : I.taxi.ride[this.talk.taxi++ % I.taxi.ride.length])
    const seat = (c: Avatar | Member, g: Group) => {
      g.add(c.root)
      if (c instanceof Avatar) {
        c.place(0, 0, 0, 0)
        c.setPose('sit')
      } else c.place(0, -0.1 * c.height, 0, 0, 'sit')
    }
    seat(this.kaylee, tx.st.seats.kaylee)
    seat(this.nick.m, tx.st.seats.nick)
    seat(this.ji.m, tx.st.seats.ji)
    this.ring.visible = false
    tx.waitT = Math.min(tx.waitT, 1.2)
    tx.hold = false
  }
  private leaveTaxi() {
    const tx = this.taxi
    if (tx.state !== 'wait') return false
    this.mode = 'walk'
    this.aboard = false
    sfx.boing()
    // Off the back step, onto the road behind the taxi.
    const back = tx.heading + Math.PI
    for (const [c, off] of [[this.kaylee, 0], [this.nick.m, 1.2], [this.ji.m, -1.2]] as const) {
      this.scene.attach(c.root)
      const x = tx.root.position.x + Math.sin(back) * 3.4 + Math.cos(back) * off
      const z = tx.root.position.z + Math.cos(back) * 3.4 - Math.sin(back) * off
      const y = this.heightAt(x, z)
      c.root.rotation.set(0, 0, 0)
      if (c instanceof Avatar) c.place(x, y, z, back * DEG)
      else c.place(x, y, z, back * DEG, 'stand')
    }
    this.y = this.kaylee.root.position.y
    this.kaylee.setPose('stand')
    this.kaylee.react('hop')
    this.trail = [{ x: this.kaylee.root.position.x, z: this.kaylee.root.position.z }]
    for (let i = 1; i < 30; i++) this.trail.push({ x: this.trail[0].x - Math.sin(back) * i * 0.3, z: this.trail[0].z - Math.cos(back) * i * 0.3 })
    this.lastPos.copy(this.kaylee.root.position)
    // It waits a little so she can climb back in.
    tx.waitT = 8
    return true
  }

  // ---------------------------------------------------------------- her jet ski (once the jet ski is hers)

  private boardSki(i: number) {
    const s = this.skis[i]
    this.mode = 'ski'
    this.riding = i
    this.target = null
    this.counts.skiRides++
    this.d.place(s.x, s.z, s.face)
    this.skiAt = this.time
    sfx.boing()
    s.ski.front.add(this.kaylee.root)
    s.ski.back.add(this.nick.m.root)
    this.kaylee.place(0, 0, 0, 0)
    this.kaylee.setPose('sit')
    this.nick.m.place(0, -0.1 * this.nick.m.height, 0, 0, 'sit')
    this.ring.visible = false
    this.d.vroom(0.6)
    this.d.goto(s.x + Math.sin(s.face) * 8, s.z + Math.cos(s.face) * 8)
  }
  private leaveSki(nx: number, nz: number) {
    const s = this.skis[this.riding]
    this.mode = 'walk'
    // It stays on the beach where she left it, nose up the sand.
    s.x = this.d.x
    s.z = this.d.z
    s.face = this.d.heading
    this.riding = -1
    sfx.boing()
    for (const [c, off] of [[this.kaylee, 0], [this.nick.m, 1.0]] as const) {
      this.scene.attach(c.root)
      const x = s.x - nx * 2.4 + nz * off
      const z = s.z - nz * 2.4 - nx * off
      const y = this.heightAt(x, z)
      c.root.rotation.set(0, 0, 0)
      if (c instanceof Avatar) c.place(x, y, z, Math.atan2(-nx, -nz) * DEG)
      else c.place(x, y, z, Math.atan2(-nx, -nz) * DEG, 'stand')
    }
    this.y = this.kaylee.root.position.y
    this.kaylee.setPose('stand')
    this.kaylee.react('hop')
    this.trail = [{ x: this.kaylee.root.position.x, z: this.kaylee.root.position.z }]
    this.lastPos.copy(this.kaylee.root.position)
  }

  private rideSki(dt: number) {
    const d = this.d
    const f = this.finger
    if (f?.leading) {
      const p = this.pick(f.x, f.y, tmp)
      if (p) d.hold(p.x, p.z)
    } else d.release()
    const before = { x: d.x, z: d.z }
    d.step(dt)
    // The shore: onto a beach slowly and she hops off; onto the rocks (or a beach too fast) it bounces off.
    const sh = this.isl.ground.shoreAt(d.x, d.z)
    const gx = this.isl.ground.shoreAt(d.x + 1, d.z) - this.isl.ground.shoreAt(d.x - 1, d.z)
    const gz = this.isl.ground.shoreAt(d.x, d.z + 1) - this.isl.ground.shoreAt(d.x, d.z - 1)
    const l = Math.hypot(gx, gz) || 1
    if (sh < 1.0) {
      const s = this.isl.ground.surfaceAt(d.x - (gx / l) * 2, d.z - (gz / l) * 2)
      const beach = s === 'sand' || s === 'wet'
      // (Only nosing in toward the sand, and not in the first moments, while it backs off the beach she got on at.)
      const inward = -(d.vx * gx + d.vz * gz) / l > 0.3
      if (beach && inward && this.time - this.skiAt > 1.5 && Math.abs(d.speed) < RIDE.dock) {
        d.stop()
        d.x = before.x
        d.z = before.z
        this.leaveSki(gx / l, gz / l)
        return
      }
      d.x = before.x
      d.z = before.z
      if (d.bounce(gx / l, gz / l, 0.5) > 2) {
        bonk()
        this.spray.burst(d.x, 0.3, d.z, 14, 2, 2.5, 0.14)
      }
    }
    if (sh > 70) d.bounce(-gx / l, -gz / l, 0.4)
    // Where it is, on the waves; spray and the engine.
    const s = this.skis[this.riding]
    const w = (x: number, z: number) => this.isl.lagoon.heightAt(x, z, this.time, this.isl.ground.shoreAt(x, z))
    s.ski.root.position.set(d.x, w(d.x, d.z), d.z)
    s.ski.root.rotation.y = d.heading
    const hx = Math.sin(d.heading)
    const hz = Math.cos(d.heading)
    const pitchGoal = -Math.atan2(w(d.x + hx * 1.2, d.z + hz * 1.2) - w(d.x - hx * 1.2, d.z - hz * 1.2), 2.4) - clamp(d.speed / RIDE.top, 0, 1) * 0.04
    this.skiPitch += (pitchGoal - this.skiPitch) * ease(dt, 10)
    s.ski.tilt.rotation.set(this.skiPitch, 0, d.roll)
    const sp = Math.abs(d.speed)
    if (sp > 2) {
      const n = Math.min(4, Math.round(sp * dt * 30))
      for (let i = 0; i < n; i++) this.spray.emit(d.x - hx * 1.5, 0.3, d.z - hz * 1.5, -hx * sp * 0.4 + (Math.random() - 0.5) * 1.2, 1.5 + sp * 0.25 * Math.random(), -hz * sp * 0.4 + (Math.random() - 0.5) * 1.2, 0.7, 0.16)
    }
    if (Math.random() < dt * 8) engine(clamp(sp / RIDE.top, 0, 1))
    this.kShadow.visible = false
  }

  // ---------------------------------------------------------------- the umbrella kite

  private flyKite(dt: number) {
    const kt = this.kite!
    kt.t += dt / 3.2
    const k = this.kaylee.root.position
    const e = clamp(kt.t, 0, 1)
    k.lerpVectors(kt.from, kt.to, e)
    k.y = kt.from.y + (kt.to.y - kt.from.y) * e + Math.sin(Math.PI * e) * 3.4
    this.y = k.y
    const p = this.props.pokes.get(kt.id)
    if (p?.part) {
      p.part.parent?.worldToLocal(tmp.set(k.x, k.y + this.kaylee.height + 0.6, k.z))
      p.part.position.copy(tmp)
      p.part.rotation.y += dt * 4
    }
    this.kaylee.root.rotation.z = Math.sin(this.time * 3) * 0.12
    if (kt.t >= 1) {
      this.mode = 'walk'
      this.kaylee.root.rotation.z = 0
      this.kaylee.react('hop')
      this.puffs.burst(k.x, k.y + 0.05, k.z, 14, 1.6, 1.4, 0.12)
      sfx.thump()
      this.anim.set(`home:${kt.id}`, { t: 0, k: 0, v: 0 })
      this.kite = null
      this.trail.unshift({ x: k.x, z: k.z })
      this.lastPos.copy(k)
    }
  }

  // ---------------------------------------------------------------- where she is

  private nearestFrame(x: number, z: number) {
    let best = FRAMES.saikaew
    let bd = Infinity
    for (const f of Object.values(FRAMES)) {
      const d = Math.hypot(x - f.x, z - f.z)
      if (d < bd) {
        bd = d
        best = f
      }
    }
    return best
  }
  /** The camera on a beach: three-quarters along the sand from over the water's edge, so the sea runs down one side
   *  of the screen and the hill up the other (straight inland would put the sea behind the camera; straight out to sea,
   *  the hill's forest in front of it). Whichever way along the beach is nearer the camera's way now. */
  private spotYaw(id: SpotId): number | null {
    const f = id === 'deck' ? FRAMES.prao : FRAMES[id]
    const a = SIDE * 1
    const yaw = (s: number) => Math.atan2(-f.n.x * a + f.t.x * s * 0.84, -f.n.z * a + f.t.z * s * 0.84)
    const y1 = yaw(1)
    const y2 = yaw(-1)
    return Math.abs(wrap(y1 - this.camYaw)) <= Math.abs(wrap(y2 - this.camYaw)) ? y1 : y2
  }

  /** Which beach she's on (the address bar's `at`), and where the camera should face. */
  private whereAmI() {
    const k = this.mode === 'ski' ? { x: this.d.x, z: this.d.z } : this.kaylee.root.position
    let best: SpotId | null = null
    let bd = 34
    for (const id of Object.keys(FRAMES) as (keyof typeof FRAMES)[]) {
      const f = FRAMES[id]
      const d = Math.hypot(k.x - f.x, k.z - f.z)
      if (d < bd) {
        bd = d
        best = id
      }
    }
    const nearBeach = best && (this.surface === 'sand' || this.surface === 'wet' || this.surface === 'water' || this.surface === 'grass' || this.deckOn >= 0 || this.mode === 'ski')
    if (best && nearBeach) {
      if (best !== this.spot) {
        this.spot = best
        this.events.at(best)
        if (!this.seen.has(best)) {
          this.seen.add(best)
          this.counts.beaches++
        }
        // Sparkle, the first time she reaches each beach this visit.
        const line = (I.beach as Partial<Record<SpotId, string>>)[best]
        if (line && this.greeted && firstTime(`samet-beach-${best}`)) this.events.say?.(line)
      }
      if (this.mode !== 'taxi') this.camGoal = this.spotYaw(best)!
      return
    }
    // On a road or a path: look along it, the way she's going (once she's been going that way for a few meters).
    if (this.mode !== 'walk') return
    const p = this.kaylee.root.position
    const dx = p.x - this.moveRef.x
    const dz = p.z - this.moveRef.z
    if (Math.hypot(dx, dz) < 3) return
    this.moveRef.copy(p)
    let tx = 0
    let tz = 0
    let wd = 6
    for (const w of WAYS)
      for (let i = 0; i < w.pts.length - 1; i++) {
        const a = w.pts[i]
        const b = w.pts[i + 1]
        const d = Math.hypot((a.x + b.x) / 2 - p.x, (a.z + b.z) / 2 - p.z)
        if (d < wd) {
          wd = d
          tx = b.x - a.x
          tz = b.z - a.z
        }
      }
    if (wd >= 6) return
    const sgn = Math.sign(tx * dx + tz * dz) || 1
    this.camGoal = Math.atan2(tx * sgn, tz * sgn)
  }

  // ---------------------------------------------------------------- the camera

  /** 0 on a beach (the low view, the sea and the hills), 1 on a road or path through the forest (high, over the trees). */
  private inland = 0
  private cullT = 0
  private seaShift = { x: 0, z: 0 }
  private leanV = { x: 0, z: 0 }
  private camera(dt: number) {
    const s = this.surface
    const wantIn = this.mode === 'walk' && !this.swimming && this.deckOn < 0 && (s === 'road' || s === 'path' || s === 'grass' || s === 'rock') && this.isl.ground.shoreAt(this.kaylee.root.position.x, this.kaylee.root.position.z) < -12 ? 1 : 0
    this.inland += (wantIn - this.inland) * ease(dt, 1.2)
    if (this.mode === 'taxi') this.camGoal = this.taxi.heading - 0.9
    if (this.mode === 'ski') this.camGoal = this.d.heading
    this.camYaw += wrap(this.camGoal - this.camYaw) * ease(dt, this.mode === 'ski' ? 2 : CAM.turn)
    this.rig.setShot(this.shot())
  }

  private shot(): Shot {
    const tall = this.tall
    const yaw = (this.camYaw + Math.PI) * DEG
    if (this.mode === 'taxi') {
      // From high up (over the forest the road runs through), a little behind and to the side.
      const p = this.taxi.root.position
      return { center: new Vector3(p.x, p.y + 1.4, p.z), half: tall ? new Vector3(4.5, 2, 4.5) : new Vector3(7, 2, 4.5), yaw, pitch: 52, follow: true, minDist: 7, maxDist: 40 }
    }
    if (this.mode === 'ski') {
      const d = this.d
      const ahead = 2 + clamp(Math.abs(d.speed) / RIDE.top, 0, 1.3) * 4
      return { center: new Vector3(d.x + Math.sin(d.heading) * ahead, 0.9, d.z + Math.cos(d.heading) * ahead), half: tall ? new Vector3(4.4, 2, 7.6) : new Vector3(8, 2, 5.2), yaw: yaw + 18, pitch: 38, follow: true, minDist: 7, maxDist: 90 }
    }
    const k = this.kaylee.root.position
    const run = clamp(this.lastSpeed / Math.max(0.1, WALK.gallop), 0, 1)
    const hx = Math.sin(this.kaylee.root.rotation.y)
    const hz = Math.cos(this.kaylee.root.rotation.y)
    const b = CAM.box * (this.phone ? PHONE.zoom : 1)
    // With the phone out, the view leans toward the nearest animal (so it's easy to get it in the middle).
    const lean = this.phone && this.mode === 'walk' ? this.leanTo() : null
    this.leanV.x += ((lean ? (lean.x - k.x) * PHONE.focus : 0) - this.leanV.x) * 0.06
    this.leanV.z += ((lean ? (lean.z - k.z) * PHONE.focus : 0) - this.leanV.z) * 0.06
    // On a beach the frame slides a little out to sea, so the water's edge and what's on it show beside her.
    const f = this.nearestFrame(k.x, k.z)
    const sea = (1 - this.inland) * (this.swimming ? 0 : 2.2)
    this.seaShift.x += (f.n.x * sea - this.seaShift.x) * 0.05
    this.seaShift.z += (f.n.z * sea - this.seaShift.z) * 0.05
    return {
      // (Flying under the umbrella, the camera stays down: she rises up the screen.)
      center: new Vector3(k.x + hx * CAM.ahead * run + this.seaShift.x + this.leanV.x, Math.max(this.kite ? this.kite.from.y : k.y, 0) + 0.7, k.z + hz * CAM.ahead * run + this.seaShift.z + this.leanV.z),
      half: tall ? new Vector3(b * 0.62, 2, b * 0.9) : new Vector3(b, 2, b * 0.62),
      yaw,
      pitch: CAM.pitch + (tall ? 4 : 0) + (CAM.forest - CAM.pitch) * this.inland - (this.phone ? 3 : 0),
      follow: true,
      minDist: 6,
      maxDist: 60,
    }
  }

  // ---------------------------------------------------------------- life: pokes playing out, critters, stops

  private life(dt: number, t: number) {
    const k = this.kaylee.root.position
    const w = (x: number, z: number) => this.isl.lagoon.heightAt(x, z, t, this.isl.ground.shoreAt(x, z))
    this.swimmers.forEach((s, i) => {
      const p = s.root.position
      s.update(dt, t, w(p.x, p.z), i * 1.7)
    })
    for (const tn of this.terns) tn.update(dt, t)
    // The banana boat whooshes round a loop off Sai Kaew (past where she swims), full of squealing people.
    this.bananaS += (dt * 7.5) / (Math.PI * (48 + 14))
    const at = (s: number) => bay(Math.sin(s * Math.PI * 2) * 48, 46 + Math.cos(s * Math.PI * 2) * 14)
    const bpos = at(this.bananaS)
    const bn = at(this.bananaS + 0.004)
    const bb = at(this.bananaS - 0.035)
    const bb2 = at(this.bananaS - 0.03)
    const B = this.banana
    B.boat.position.set(bpos.x, w(bpos.x, bpos.z), bpos.z)
    B.boat.rotation.y = Math.atan2(bn.x - bpos.x, bn.z - bpos.z)
    B.banana.position.set(bb.x, w(bb.x, bb.z) + 0.15, bb.z)
    B.banana.rotation.y = Math.atan2(bb2.x - bb.x, bb2.z - bb.z) + Math.PI
    B.update(dt, t)
    for (const sp of B.splashes) this.spray.burst(sp.x, 0.2, sp.z, 14, 2.2, 3.5, 0.2)
    // The parked jet skis bob at the water's edge.
    this.skis.forEach((s, i) => {
      if (i === this.riding) return
      s.ski.root.position.set(s.x, Math.max(w(s.x, s.z), this.isl.ground.heightAt(s.x, s.z)), s.z)
      s.ski.root.rotation.y = s.face
      s.ski.tilt.rotation.set(Math.sin(t * 1.3 + i) * 0.03, 0, Math.sin(t * 1.1 + i * 2) * 0.03)
    })
    // A glow round the jet ski she can hop on.
    let near = -1
    if (this.mode === 'walk' && this.flags.has('jetski')) {
      let bd = RIDE.near
      this.skis.forEach((s, i) => {
        const d = Math.hypot(k.x - s.x, k.z - s.z)
        if (d < bd) {
          bd = d
          near = i
        }
      })
    }
    const sg = this.skiGlow.material as MeshBasicMaterial
    sg.opacity += ((near >= 0 ? 0.55 + 0.3 * Math.sin(t * 5) : 0) - sg.opacity) * ease(dt, 6)
    if (near >= 0) this.skiGlow.position.set(this.skis[near].x, Math.max(0.05, this.isl.ground.heightAt(this.skis[near].x, this.skis[near].z)) + 0.08, this.skis[near].z)
    this.skiGlow.visible = sg.opacity > 0.02
    // The stops glow softly (brighter up close), the flags flutter.
    for (const id of STOP_IDS) {
      const r = this.stopRings[id]
      const at = STOPS[id].at
      const d = Math.hypot(k.x - at.x, k.z - at.z)
      const m = r.material as MeshBasicMaterial
      const want = this.flags.has(id) ? 0.12 : d < 9 ? 0.6 + 0.3 * Math.sin(t * 4) : 0.25 + 0.1 * Math.sin(t * 2)
      m.opacity += (want - m.opacity) * ease(dt, 4)
      r.scale.setScalar(1 + 0.06 * Math.sin(t * 2.5))
      const fl = this.props.flags[id]
      if (fl.visible) (fl.userData.pennant as Group).rotation.y = Math.sin(t * 3 + at.x) * 0.25 + this.springOf(`flag:${id}`, dt) * 0.8
    }
    // The pokes playing out.
    for (const [id, p] of this.props.pokes) this.pokeStep(id, p, dt, t)
    // Coconuts falling, bouncing (on Daddy's head, if he's under it), rolling.
    for (let i = this.coconuts.length - 1; i >= 0; i--) {
      const c = this.coconuts[i]
      c.t += dt
      c.vy -= 16 * dt
      c.g.position.x += c.vx * dt
      c.g.position.z += c.vz * dt
      c.g.position.y += c.vy * dt
      const n = this.nick.m.root.position
      const head = n.y + this.nick.m.height
      if (!c.bonked && c.vy < 0 && Math.hypot(c.g.position.x - n.x, c.g.position.z - n.z) < 0.55 && c.g.position.y < head + 0.1 && c.g.position.y > head - 0.4) {
        c.bonked = true
        c.vy = 3.5
        c.vx = (Math.random() - 0.5) * 3
        c.vz = (Math.random() - 0.5) * 3
        bonk()
        this.counts.bonks++
        this.nick.m.react('wiggle')
        if (this.nick.m.pose === 'lie') this.nick.lie = 0
        this.events.say?.(I.bonk)
        for (let s = 0; s < 8; s++) this.stars.emit(n.x, head + 0.25, n.z, Math.cos(s) * 0.6, 0.4, Math.sin(s) * 0.6, 1.4, 0.1)
      }
      const g = Math.max(0, this.isl.ground.heightAt(c.g.position.x, c.g.position.z)) + 0.18
      if (c.g.position.y < g) {
        c.g.position.y = g
        if (Math.abs(c.vy) > 2) sfx.thump()
        c.vy = Math.abs(c.vy) * 0.35
        c.vx *= 0.7
        c.vz *= 0.7
      }
      c.g.rotation.x += c.vz * dt * 3
      c.g.rotation.z -= c.vx * dt * 3
      if (c.t > 9) {
        c.g.scale.multiplyScalar(0.9)
        if (c.t > 9.6) {
          this.scene.remove(c.g)
          this.coconuts.splice(i, 1)
        }
      }
    }
    // The beach ball: kicked when she runs into it, rolls, floats when it reaches the sea.
    const bp = this.props.pokes.get('ball:0')
    if (bp && this.mode === 'walk') {
      const g = bp.g.position
      const dx = g.x - k.x
      const dz = g.z - k.z
      const d = Math.hypot(dx, dz)
      if (d < 0.75 && this.lastSpeed > 0.4) {
        const sp = 2.5 + this.lastSpeed * 1.2
        this.ball.vx = (dx / (d || 1)) * sp
        this.ball.vz = (dz / (d || 1)) * sp
        this.ball.vy = 2.6
        this.counts.kicks++
        sfx.boing()
      }
      const B = this.ball
      if (Math.abs(B.vx) + Math.abs(B.vz) + Math.abs(B.vy) + B.y > 0.01) {
        const nx = g.x + B.vx * dt
        const nz = g.z + B.vz * dt
        if (this.isl.ground.surfaceAt(nx, nz) === 'forest' || this.isl.blockers.near(nx, nz).some(([x, z, r]) => Math.hypot(nx - x, nz - z) < r + 0.36)) {
          B.vx *= -0.5
          B.vz *= -0.5
        } else {
          g.x = nx
          g.z = nz
        }
        B.vy -= 14 * dt
        B.y += B.vy * dt
        const ground = this.isl.ground.heightAt(g.x, g.z)
        const sea = ground < -0.2
        const floor = sea ? w(g.x, g.z) - 0.18 : ground
        g.y = floor + Math.max(0, B.y)
        if (B.y < 0) {
          B.y = 0
          if (B.vy < -1.5) sfx.boing()
          B.vy = Math.abs(B.vy) * 0.45
          if (B.vy < 0.5) B.vy = 0
        }
        const drag = sea ? 0.6 : 1.4
        B.vx *= Math.exp(-drag * dt)
        B.vz *= Math.exp(-drag * dt)
        // Out in the sea, the waves bring it back to the beach in the end.
        if (sea) {
          const f = this.nearestFrame(g.x, g.z)
          B.vx -= f.n.x * 0.25 * dt
          B.vz -= f.n.z * 0.25 * dt
        }
        if (bp.part) {
          bp.part.rotation.x += B.vz * dt * 2.6
          bp.part.rotation.z -= B.vx * dt * 2.6
        }
      }
    }
    // Her ice cream, in her hand for a while.
    if (this.coneT >= 0) {
      this.coneT += dt
      const hand = this.kaylee.rig.hands?.[1] ?? this.kaylee.rig.armR
      hand.getWorldPosition(tmp)
      this.cone.position.set(tmp.x, tmp.y + 0.12, tmp.z)
      this.cone.visible = this.coneT < 12 && this.mode === 'walk'
      if (this.coneT > 12) this.coneT = -1
    }
    // The bell, the mermaid's tail, the telescope.
    this.bellSwing *= Math.exp(-dt * 1.6)
    this.props.saikaew.bell.rotation.z = Math.sin(t * 9) * this.bellSwing
    if (this.tailT >= 0) {
      this.tailT += dt
      this.props.saikaew.tail.rotation.x = Math.sin(this.tailT * 10) * 0.5 * Math.max(0, 1 - this.tailT / 1.6)
      if (this.tailT > 1.6) this.tailT = -1
    }
    this.placePrints()
  }

  /** A spring per thing: a tap kicks it, it wobbles back (0 at rest). */
  private springOf(id: string, dt: number) {
    const a = this.anim.get(id)
    if (!a) return 0
    a.v += (-a.k * 120 - a.v * 7) * dt
    a.k += a.v * dt
    a.t += dt
    if (a.t > 4 && Math.abs(a.k) < 0.002 && Math.abs(a.v) < 0.01) this.anim.delete(id)
    return a.k
  }
  private kick(id: string, v: number) {
    const a = this.anim.get(id) ?? { t: 0, k: 0, v: 0 }
    a.v += v
    a.t = 0
    this.anim.set(id, a)
  }

  private pokeStep(id: string, p: PokeThing, dt: number, t: number) {
    const s = this.springOf(id, dt)
    switch (p.kind) {
      case 'palm':
      case 'samet':
      case 'tamarind':
        p.g.rotation.z = s * 0.25
        p.g.rotation.x = s * 0.12
        break
      case 'bush':
        p.g.scale.set(1 + s * 0.4, 1 - s * 0.3, 1 + s * 0.4)
        break
      case 'umbrella':
        if (p.part && this.kite?.id !== id) {
          const home = this.anim.get(`home:${id}`)
          if (home) {
            home.t += dt
            p.part.position.lerp(tmp.set(0, 2.45, 0), ease(dt, 3))
            if (home.t > 2) {
              p.part.position.set(0, 2.45, 0)
              this.anim.delete(`home:${id}`)
            }
          }
          p.part.rotation.y += (this.spin.get(id) ?? 0) * dt
          this.spin.set(id, (this.spin.get(id) ?? 0) * Math.exp(-dt * 0.8))
          p.part.rotation.z = s * 0.2
        }
        break
      case 'deckbrella':
        if (p.part) p.part.scale.set(1 + s * 0.2, 1 - s * 0.25, 1 + s * 0.2)
        if (p.part) p.part.rotation.z = Math.sin(t * 2.2 + p.at.x) * 0.03
        break
      case 'chair':
        if (p.part) p.part.rotation.x += ((this.folded.has(id) ? -1.45 : -0.35) - p.part.rotation.x) * ease(dt, 10)
        break
      case 'icecream':
      case 'beads':
      case 'telescope':
        p.g.scale.set(1 - s * 0.15, 1 + s * 0.25, 1 - s * 0.15)
        if (p.kind === 'telescope' && p.part) p.part.rotation.y = Math.sin(t * 0.6) * 0.5 + s
        break
      case 'hammock':
        if (p.part) p.part.rotation.z = Math.sin(t * 1.6) * (0.06 + Math.abs(this.swing.get(id) ?? 0))
        this.swing.set(id, (this.swing.get(id) ?? 0) * Math.exp(-dt * 0.4))
        break
      case 'longtail':
      case 'speedboat': {
        const w = this.isl.lagoon.heightAt(p.at.x, p.at.z, t, this.isl.ground.shoreAt(p.at.x, p.at.z))
        p.g.position.y = w + s * 0.3
        p.g.rotation.x = Math.sin(t * 1.2 + p.at.x) * 0.03 + s * 0.1
        p.g.rotation.z = Math.sin(t * 0.9 + p.at.z) * 0.04
        break
      }
      case 'crab': {
        const c = p.part
        if (!c) break
        const out = this.crabs.get(id) ?? -1
        if (out >= 0) {
          const e = out + dt
          this.crabs.set(id, e)
          // Up out of the hole, a scuttle sideways and back, down again.
          c.position.y = e < 0.3 ? -0.2 + e : e > 2.6 ? Math.max(-0.2, 0.1 - (e - 2.6)) : 0.1
          c.position.x = e > 0.4 && e < 2.5 ? Math.sin((e - 0.4) * 3) * 0.9 : c.position.x * 0.8
          c.rotation.z = Math.sin(e * 30) * 0.08
          if (e > 3) this.crabs.set(id, -1)
        } else c.position.y = -0.2
        break
      }
      default:
        break
    }
  }
  private spin = new Map<string, number>()
  private swing = new Map<string, number>()
  private folded = new Set<string>()

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { x, y, id, leading: !id }
    if (!id) {
      this.target = null
      this.walkTo = null
      if (this.mode === 'taxi') this.leaveTaxi()
    }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (!f.leading && Math.hypot(x - downX, y - downY) > 12) {
      f.leading = true
      this.target = null
      this.walkTo = null
    }
  }
  pointerUp() {
    if (this.mode === 'ski') this.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    // With the phone out, every tap is a photo: of the animal she tapped (or the one nearest her finger), or of the
    // island. Other things still do their thing.
    if (this.phone && (this.mode === 'walk' || this.mode === 'taxi' || this.mode === 'ski')) {
      const target = (id && this.targetOf(id)) || this.targetNear(x, y)
      this.shoot(target)
      if (target || !id) return
    }
    if (id) {
      this.counts.pokes++
      this.poke(id)
      return
    }
    if (this.mode === 'taxi') {
      this.leaveTaxi()
      return
    }
    const p = this.pick(x, y, new Vector3())
    if (!p) return
    if (this.mode === 'ski') {
      this.d.goto(p.x, p.z)
      return
    }
    if (this.mode !== 'walk') return
    // The water's edge: a splash, the foam chases her.
    const sh = this.isl.ground.shoreAt(p.x, p.z)
    if (sh > -0.5 && sh < 2.5) this.spray.burst(p.x, 0.1, p.z, 10, 1.4, 2, 0.12)
    this.target = p
    this.walkTo = null
  }

  /** Something she tapped: most things react at once; the taxi, a jet ski and a stop need her close (she walks there). */
  private poke(id: string) {
    const k = this.kaylee.root.position
    const near = (x: number, z: number, r = RIDE.near) => Math.hypot(k.x - x, k.z - z) < r
    if (id === HOME_BOAT && this.goingHome !== null) {
      // The whole island done: the speedboat at Na Dan pier takes them home. She walks to the end of the pier, Mommy
      // takes their photo (for Agong's wall), and off they go.
      if (this.goingHome || this.mode !== 'walk') return
      if (!near(HOME_PIER.x, HOME_PIER.z, 2.5)) return this.goTo(id, HOME_PIER.x, HOME_PIER.z, 1)
      this.goingHome = true
      this.kaylee.faceToward(HOME_PIER.x - FRAMES.nadan.t.x * 3, HOME_PIER.z - FRAMES.nadan.t.z * 3)
      this.kaylee.react('wave')
      this.nick.m.react('wave')
      this.events.say?.(I.home)
      window.setTimeout(() => (this.homeSnap = true), 700)
      return
    }
    if (id === 'kaylee') {
      if (this.mode === 'taxi') return void this.leaveTaxi()
      this.kaylee.react('hop')
      toot()
      return
    }
    if (id === 'family:nick') {
      const n = this.nick
      const asleep = n.m.pose === 'lie'
      if (asleep) {
        n.lie = 0
        n.m.setPose('stand')
      }
      n.m.react('hop')
      sfx.boing()
      this.events.say?.(asleep ? I.wake : I.nick[this.talk.nick++ % I.nick.length])
      return
    }
    if (id === 'family:ji') {
      this.ji.m.react('wave')
      this.events.say?.(I.ji[this.talk.ji++ % I.ji.length])
      return
    }
    if (id === 'taxi') {
      const tp = this.taxi.root.position
      if (this.mode === 'taxi') return void this.leaveTaxi()
      if (this.mode === 'walk' && this.taxi.state === 'wait') {
        if (near(tp.x, tp.z)) return void this.boardTaxi()
        this.goTo(id, tp.x, tp.z)
      }
      honk()
      this.taxi.honk()
      return
    }
    if (id.startsWith('ski:')) {
      const i = this.skis.findIndex((s) => `ski:${s.id}` === id)
      const s = this.skis[i]
      if (!s || this.mode !== 'walk') return
      if (!this.flags.has('jetski')) {
        // Not hers yet: this one is the jet ski man's (the jet ski stop).
        if (near(s.x, s.z)) return void this.events.open('jetski')
        return this.goTo(id, s.x, s.z)
      }
      if (near(s.x, s.z)) return void this.boardSki(i)
      return this.goTo(id, s.x, s.z)
    }
    if (id.startsWith('stop:')) {
      const sid = id.slice(5) as StopId
      const at = STOPS[sid].at
      if (!near(at.x, at.z, 9)) return this.goTo(id, at.x, at.z)
      return this.useStop(sid)
    }
    if (id === 'lunch') {
      // The deck's table: walk up the steps to it, then sit down for lunch.
      const tb = LUNCH_TABLE
      if (!near(tb.x, tb.z, 2.5)) return this.goTo(id, tb.x, tb.z, 1)
      return void this.events.open('lunch')
    }
    if (id.startsWith('flag:')) {
      this.kick(id, 6)
      sfx.fwip()
      return
    }
    if (id === 'mermaid') {
      flute()
      this.tailT = 0
      if (firstTime('samet-fact-mermaid')) this.events.say?.(L.samet.trip.facts.mermaid)
      const m = this.props.saikaew.mermaid.position
      this.spray.burst(m.x + 1.4, 0.4, m.z + 1.5, 16, 1.6, 2.6, 0.15)
      return
    }
    if (id === 'bell') {
      this.bellSwing = 0.6
      ding()
      return
    }
    if (id === 'banana') {
      this.banana.tip()
      tone(900, 1500, 0.16, 0.05, 'triangle')
      return
    }
    if (id.startsWith('swimmer:')) {
      const s = this.swimmers[+id.slice(8)]
      s.hop()
      s.squeal()
      const p = s.root.position
      this.spray.burst(p.x, 0.3, p.z, 12, 1.6, 2.5, 0.16)
      return
    }
    if (id.startsWith('tern:')) {
      this.terns[+id.slice(5)].diveAt(k.x + 6, k.z + 6)
      tone(1800, 2400, 0.1, 0.04, 'triangle')
      return
    }
    if (id.startsWith('umbrella-sk:')) {
      const u = this.props.saikaew.umbrellas[+id.slice(12)]
      u.rotation.y += 0.01
      this.spin.set(id, 9)
      this.saikaewSpin.set(id, u)
      sfx.fwip()
      return
    }
    if (id.startsWith('ani:')) {
      const c = this.wild.byId.get(id.slice(4))
      c?.poke(this.wctx)
      return
    }
    if (id.startsWith('junk:')) {
      const j = this.clean.get(id)
      if (!j || this.clean.carrying || this.mode !== 'walk') return
      if (Math.hypot(k.x - j.spot.x, k.z - j.spot.z) < 1.5) return this.liftJunk(id)
      return this.goTo(id, j.spot.x, j.spot.z, 0.5)
    }
    if (id.startsWith('bin:')) {
      const i = +id.slice(4)
      const b = this.clean.bins[i]
      if (this.clean.carrying && this.mode === 'walk') {
        if (Math.hypot(k.x - b.at.x, k.z - b.at.z) < 2) return this.clean.drop(i)
        return this.goTo(id, b.at.x, b.at.z, 1.1)
      }
      b.flap = 0.6
      tone(300, 200, 0.1, 0.06, 'square')
      return
    }
    const p = this.props.pokes.get(id)
    if (p) this.pokeThing(p)
  }

  // ---------------------------------------------------------------- Mommy's phone

  /** Mommy's phone out (or away): the camera comes in closer and every tap is a photo. */
  setPhone(on: boolean) {
    this.phone = on
    this.lastTouch = this.time
    if (on) this.kaylee.react('hop')
  }
  /** The book's portraits (drawn once, on the next frame). */
  requestPortraits(cb: (p: Record<AnimalId, string>) => void) {
    this.wantPortraits = cb
  }

  /** The snap target for an anchor id: one of the animals, a tern, a crab hole's crab. */
  private targetOf(id: string): SnapTarget | null {
    if (id.startsWith('ani:')) {
      const c = this.wild.byId.get(id.slice(4))
      return c && !c.hidden ? this.creatureTarget(c) : null
    }
    if (id.startsWith('tern:')) {
      const tn = this.terns[+id.slice(5)]
      return { kind: 'tern', id, focus: tn.root.getWorldPosition(new Vector3()), size: 1.1, snapAt: 0.05, pose: () => {} }
    }
    if (id.startsWith('crab:')) {
      const p = this.props.pokes.get(id)
      if (!p?.part) return null
      const part = p.part
      return {
        kind: 'crab',
        id,
        focus: part.getWorldPosition(new Vector3()).setY(p.y + 0.15),
        size: 0.5,
        snapAt: 0.4,
        pose: () => {
          if ((this.crabs.get(id) ?? -1) < 0) this.crabs.set(id, 0)
        },
      }
    }
    return null
  }
  private creatureTarget(c: Creature): SnapTarget {
    return { kind: c.kind, id: `ani:${c.id}`, focus: c.focus, size: c.size, snapAt: c.snapAt, pose: () => c.pose() }
  }
  /** The animal nearest a screen point (within reach), for a tap that missed its tap target. */
  private targetNear(x: number, y: number): SnapTarget | null {
    let best: SnapTarget | null = null
    let bd = PHONE.reach
    const consider = (t: SnapTarget | null, p: Vector3) => {
      if (!t) return
      const sp = this.toScreen(p)
      if (sp.z >= 1) return
      const d = Math.hypot(sp.x - x, sp.y - y)
      if (d < bd) {
        bd = d
        best = t
      }
    }
    for (const c of this.wild.list) if (c.root.visible && !c.hidden) consider(this.creatureTarget(c), c.focus)
    this.terns.forEach((tn, i) => consider(this.targetOf(`tern:${i}`), tn.root.position))
    return best
  }
  /** Where the view leans with the phone out: the nearest animal she can see within 10 m. */
  private leanTo(): Vector3 | null {
    const k = this.kaylee.root.position
    let best: Vector3 | null = null
    let bd = 10
    for (const c of this.wild.list) {
      if (!c.root.visible || c.hidden) continue
      const d = Math.hypot(c.focus.x - k.x, c.focus.z - k.z)
      if (d < bd) {
        bd = d
        best = c.focus
      }
    }
    return best
  }
  /** Click: the animal poses, and the shutter goes at its best moment. */
  private shoot(target: SnapTarget | null) {
    if (this.pendingSnap) return
    target?.pose()
    this.pendingSnap = { c: target, t: target ? target.snapAt : 0 }
  }
  /** Takes the photo (from render(), before the frame draws over the canvas). */
  private takeSnap(target: SnapTarget | null) {
    // The closer Kaylee is to it, the more the phone zooms in (getting close is how she gets a gold one).
    const k = this.mode === 'ski' ? new Vector3(this.d.x, 0, this.d.z) : this.kaylee.root.position
    const dk = target ? Math.max(0.5, Math.hypot(target.focus.x - k.x, target.focus.z - k.z)) : 99
    const lens = clamp(PHONE.close / dk, PHONE.lens, 3.2)
    const aim = PHONE.aim + (1 - PHONE.aim) * clamp(lens - PHONE.lens, 0, 1)
    const cam = phoneCamera(this.rig.camera, target?.focus ?? null, aim, lens)
    let gold = false
    let animal: AnimalId | null = null
    if (target) {
      const f = framing(cam, target.focus, target.size)
      if (f.inFrame) {
        animal = target.kind
        gold = f.h >= PHONE.gold && f.off <= PHONE.middle
      }
    }
    this.scene.updateMatrixWorld()
    const src = snap(this.renderer, this.scene, cam)
    this.counts.snaps++
    if (animal) {
      this.counts.animalSnaps++
      if (gold) this.counts.golds++
      this.found.add(animal)
    }
    this.lastSnap = { animal, gold, h: target ? +framing(cam, target.focus, target.size).h.toFixed(2) : 0 }
    this.events.snap?.({ animal, src, gold })
  }
  private lastSnap: { animal: AnimalId | null; gold: boolean; h: number } | null = null

  /** Each frame: the animals live, the beach clean, the urchins' boing, the phone in her hand. */
  private animals(dt: number, t: number) {
    const k = this.kaylee.root.position
    const c = this.wctx
    c.t = t
    if (this.mode === 'ski') c.her.set(this.d.x, 0, this.d.z)
    else this.kaylee.root.getWorldPosition(c.her)
    c.herSpeed = this.mode === 'ski' ? Math.abs(this.d.speed) : this.lastSpeed
    c.swimming = this.swimming
    c.daddy.copy(this.nick.m.root.getWorldPosition(tmp))
    c.dusk = this.timeKey === 'golden' || this.timeKey === 'night'
    c.eye.copy(this.rig.camera.position)
    this.wild.update(dt, c, PHONE.cull)
    this.fish.update(dt, c.water)
    for (const pl of this.fish.plips) this.spray.burst(pl.x, c.water(pl.x, pl.z), pl.z, 6, 1, 1.6, 0.09)
    // The phone's shutter: at the animal's best moment.
    if (this.pendingSnap && this.pendingSnap.t > 0) this.pendingSnap.t -= dt
    // The beach clean: what she carries rides over her head; walk up to a bin and in it goes.
    const head = this.mode === 'ski' ? null : this.kaylee.root.getWorldPosition(tmp2).setY(tmp2.y + this.kaylee.height)
    if (this.clean.update(dt, t, head)) {
      this.counts.cleaned++
      this.events.cleaned?.(this.clean.cleaned)
      const b = this.clean.bins.reduce((a, q) => (Math.hypot(q.at.x - k.x, q.at.z - k.z) < Math.hypot(a.at.x - k.x, a.at.z - k.z) ? q : a))
      for (let i = 0; i < 14; i++) this.stars.emit(b.at.x, 1.1, b.at.z, (Math.random() - 0.5) * 2, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 2, 1.1, 0.1)
      this.kaylee.react('hop')
    }
    if (this.mode === 'walk' && this.clean.carrying) {
      const bi = this.clean.binNear(k.x, k.z, 1.7)
      if (bi >= 0) this.clean.drop(bi)
    }
    // Urchins are prickly: paddle (or wade) into one and she boings back off it, never hurt.
    if (this.mode === 'walk' && this.bumpV.t <= 0) {
      const u = this.wild.urchinNear(k.x, k.z)
      if (u.c && u.d < 0.85 && this.isl.ground.heightAt(k.x, k.z) < -0.15) {
        const p = u.c.root.position
        const l = Math.hypot(k.x - p.x, k.z - p.z) || 1
        this.bumpV = { x: ((k.x - p.x) / l) * 4, z: ((k.z - p.z) / l) * 4, t: 0.35 }
        this.counts.boings++
        sfx.boing()
        this.kaylee.react('hop')
        this.spray.burst(k.x, c.water(k.x, k.z), k.z, 10, 1.4, 2, 0.12)
        u.c.poke(c)
      }
    }
    if (this.bumpV.t > 0) {
      this.bumpV.t -= dt
      const nx = k.x + this.bumpV.x * dt
      const nz = k.z + this.bumpV.z * dt
      if (this.free(nx, nz)) {
        k.x = nx
        k.z = nz
      }
      this.target = null
    }
    // Mommy's phone in her hand (held up in front of her).
    this.phoneProp.visible = this.phone && (this.mode === 'walk' || this.mode === 'kite')
    if (this.phoneProp.visible) {
      const hand = this.kaylee.rig.hands?.[1] ?? this.kaylee.rig.armR
      hand.getWorldPosition(tmp)
      this.phoneProp.position.set(tmp.x, tmp.y + 0.12, tmp.z)
      this.phoneProp.rotation.set(0, this.kaylee.root.rotation.y, 0)
    }
    // A quiet nudge: an animal she hasn't snapped close by, the phone away: the phone button glows.
    let near = false
    if (!this.phone && this.mode === 'walk')
      for (const a of this.wild.list) {
        if (a.hidden || !a.root.visible || this.found.has(a.kind)) continue
        if (Math.hypot(a.focus.x - k.x, a.focus.z - k.z) < 8 && this.onScreen(a.focus)) {
          near = true
          break
        }
      }
    if (near !== this.nearAnimal) {
      this.nearAnimal = near
      this.events.near?.(near)
    }
  }

  /** She lifts the rubbish up over her head, and an animal pops out where it was. */
  private liftJunk(id: string) {
    const j = this.clean.get(id)
    if (!j) return
    const r = this.clean.pickUp(j)
    this.counts.lifted++
    this.kaylee.react('hop')
    this.puffs.burst(r.x, 0.1, r.z, 8, 1, 1.2, 0.1)
    if (r.kind === 'bag') {
      // A fish jumps where the bag was floating.
      const f = this.nearestFrame(r.x, r.z)
      this.fish.jump(r.x + f.n.x * 3, r.z + f.n.z * 3, Math.atan2(f.t.x, f.t.z), 1.4)
      for (let i = 0; i < 8; i++) this.stars.emit(r.x, 0.5, r.z, (Math.random() - 0.5) * 1.5, 1 + Math.random(), (Math.random() - 0.5) * 1.5, 0.9, 0.08)
    } else this.wild.hermitAt(r.x, r.z)
  }
  private saikaewSpin = new Map<string, Group>()

  private goTo(id: string, x: number, z: number, stand = RIDE.near * 0.6) {
    // Walk to it (to just this side of it), then use it.
    const k = this.kaylee.root.position
    const d = Math.hypot(x - k.x, z - k.z) || 1
    this.target = new Vector3(x - ((x - k.x) / d) * stand, 0, z - ((z - k.z) / d) * stand)
    this.walkTo = { id, x, z }
  }

  /** Something she walked to (she's there now). */
  private use(id: string, arrived: boolean) {
    if (!arrived) return
    this.poke(id)
  }

  private useStop(id: StopId) {
    const g = this.props.stops[id]
    if (id === 'jetski') return this.events.open('jetski')
    // A little show, then the stop opens (the jet ski and the sandcastle open at once).
    if (id === 'sandcastle') return this.events.open('sandcastle')
    if (id === 'snorkel') {
      toot()
      this.spray.burst(g.position.x, 0.3, g.position.z, 20, 2, 2.4, 0.16)
    } else if (id === 'hideseek' && this.flags.size === STOP_IDS.length) {
      // All four flags up: the driftwood tree is where they watch the sunset (the finale).
      this.kick('stop:hideseek', 5)
      tone(660, 990, 0.3, 0.05, 'triangle')
      return this.events.open('sunset')
    } else if (id === 'hideseek') {
      // The driftwood tree rustles, and Daddy pops out from behind it.
      this.kick('stop:hideseek', 5)
      const n = this.nick.m
      const p = g.position
      n.root.position.set(p.x + 1.6, this.heightAt(p.x + 1.6, p.z - 1.2), p.z - 1.2)
      n.react('hop')
      tone(700, 1200, 0.2, 0.06, 'triangle')
    }
    this.events.open(id)
  }
  private grow: { g: Group; t: number }[] = []

  private pokeThing(p: PokeThing) {
    const k = this.kaylee.root.position
    switch (p.kind) {
      case 'palm': {
        this.kick(p.id, 6)
        hiss(0.3, 0.06, 'bandpass', 900, 500)
        if (p.top && this.coconuts.length < 8) {
          const g = this.coconutGeo.clone()
          g.position.copy(p.top).add(tmp.set((Math.random() - 0.5) * 0.4, -0.3, (Math.random() - 0.5) * 0.4))
          // If Daddy's near the palm, the coconut finds his head (the silly one).
          const n = this.nick.m.root.position
          const dn = Math.hypot(n.x - p.at.x, n.z - p.at.z)
          const vx = dn < 2.6 ? (n.x - g.position.x) / 0.9 : (Math.random() - 0.5) * 1.5
          const vz = dn < 2.6 ? (n.z - g.position.z) / 0.9 : (Math.random() - 0.5) * 1.5
          this.scene.add(g)
          this.coconuts.push({ g, vy: 0, y: 0, vx, vz, t: 0, bonked: false })
          this.counts.coconuts++
        }
        break
      }
      case 'samet': {
        this.kick(p.id, 5)
        hiss(0.25, 0.05, 'highpass', 2200, 1200)
        if (firstTime('samet-fact-samet')) this.events.say?.(L.samet.trip.facts.samet)
        for (let i = 0; i < 12; i++) this.petals.emit(p.at.x + (Math.random() - 0.5) * 0.4, p.y + 0.8 + Math.random() * 1.5, p.at.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 1.5, 0.6 + Math.random(), (Math.random() - 0.5) * 1.5, 2.6, 0.1, 3)
        break
      }
      case 'tamarind':
        this.kick(p.id, 4)
        hiss(0.35, 0.05, 'bandpass', 800, 400)
        for (let i = 0; i < 8; i++) this.petals.emit(p.at.x + (Math.random() - 0.5) * 3, p.y + 4, p.at.z + (Math.random() - 0.5) * 3, 0, -0.2, 0, 2.5, 0.12, 2)
        break
      case 'bush':
        this.kick(p.id, 5)
        pop()
        for (let i = 0; i < 18; i++) this.petals.emit(p.at.x, p.y + 1, p.at.z, (Math.random() - 0.5) * 2.4, 1 + Math.random() * 1.5, (Math.random() - 0.5) * 2.4, 2.2, 0.1, Math.random() < 0.5 ? 0 : 1)
        break
      case 'umbrella': {
        const taps = (this.umbrellaTaps.get(p.id) ?? []).filter((x) => this.time - x < 4)
        taps.push(this.time)
        this.umbrellaTaps.set(p.id, taps)
        this.spin.set(p.id, (this.spin.get(p.id) ?? 0) + 9)
        sfx.fwip()
        // Three quick pokes with her right there: it takes off like a kite, with Kaylee holding on.
        if (taps.length >= 3 && this.mode === 'walk' && !this.swimming && Math.hypot(k.x - p.at.x, k.z - p.at.z) < 6) {
          this.umbrellaTaps.set(p.id, [])
          const f = this.nearestFrame(p.at.x, p.at.z)
          let to = new Vector3(p.at.x + f.t.x * 5 - f.n.x * 1, 0, p.at.z + f.t.z * 5 - f.n.z * 1)
          if (!this.free(to.x, to.z)) to = new Vector3(p.at.x - f.t.x * 5, 0, p.at.z - f.t.z * 5)
          if (!this.free(to.x, to.z)) to = k.clone()
          to.y = this.heightAt(to.x, to.z)
          this.kite = { id: p.id, t: 0, from: k.clone(), to }
          this.mode = 'kite'
          this.kaylee.steer(0, 0, 0, this.free)
          this.target = null
          this.counts.kites++
          whee()
          this.events.say?.(I.kite)
        }
        break
      }
      case 'chair':
        if (this.folded.has(p.id)) this.folded.delete(p.id)
        else this.folded.add(p.id)
        clack()
        break
      case 'ball': {
        const dx = p.g.position.x - k.x
        const dz = p.g.position.z - k.z
        const d = Math.hypot(dx, dz) || 1
        this.ball.vx = (dx / d) * 4.5
        this.ball.vz = (dz / d) * 4.5
        this.ball.vy = 4
        this.counts.kicks++
        sfx.boing()
        break
      }
      case 'icecream':
        this.kick(p.id, 4)
        ding()
        if (Math.hypot(k.x - p.at.x, k.z - p.at.z) < 6 && this.coneT < 0) {
          this.coneT = 0
          this.kaylee.react('hop')
        }
        break
      case 'beads':
        this.kick(p.id, 4)
        jingle()
        for (let i = 0; i < 10; i++) this.stars.emit(p.at.x, p.y + 1.1, p.at.z, (Math.random() - 0.5) * 1.2, 0.8 + Math.random(), (Math.random() - 0.5) * 1.2, 0.9, 0.07)
        break
      case 'crab':
        if ((this.crabs.get(p.id) ?? -1) < 0) this.crabs.set(p.id, 0)
        tone(1500, 1700, 0.06, 0.04, 'triangle')
        tone(1500, 1700, 0.06, 0.04, 'triangle', 0.1)
        break
      case 'longtail':
      case 'speedboat':
        this.kick(p.id, 3)
        toot()
        break
      case 'hammock':
        this.swing.set(p.id, 0.5)
        hiss(0.4, 0.04, 'bandpass', 600, 300)
        break
      case 'telescope':
        this.kick(p.id, 2)
        tone(880, 1320, 0.25, 0.05, 'sine')
        break
      case 'deckbrella':
        this.kick(p.id, 5)
        sfx.fwip()
        break
      default:
        break
    }
  }

  // ---------------------------------------------------------------- the hint

  /** After a while with nothing touched: a pink flag arrow pointing at the nearest stop without its flag. */
  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const k = this.kaylee.root.position
    let best: StopId | null = null
    let bd = Infinity
    for (const id of STOP_IDS) {
      if (this.flags.has(id)) continue
      const a = STOPS[id].at
      const d = Math.hypot(a.x - k.x, a.z - k.z)
      if (d < bd) {
        bd = d
        best = id
      }
    }
    // All four flags up: the way to the finale, the driftwood tree at Ao Prao (the sunset, then the fire show).
    const home = best === null && this.goingHome === false
    const END = STOPS.hideseek.at
    const hb = Math.hypot(END.x - k.x, END.z - k.z)
    const idle = !this.finger && !this.target && t - this.lastTouch > HINT_S && this.mode === 'walk' && (home ? hb > 6 : best !== null && bd > 6)
    const want = idle ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!idle || (!best && !home)) return
    const a = best ? STOPS[best].at : END
    const s = this.toScreen(tmp.set(a.x, this.heightAt(a.x, a.z) + 2.5, a.z))
    const m = 54
    const inside = s.z < 1 && s.x > m && s.x < this.w - m && s.y > m && s.y < this.h - m
    let x = s.x
    let y = s.y
    let rot = 0
    if (!inside) {
      // Off screen: on the edge, pointing that way.
      const c = this.toScreen(tmp2.set(k.x, k.y + 1, k.z))
      let dx = s.x - c.x
      let dy = s.y - c.y
      if (s.z >= 1) {
        dx = -dx
        dy = -dy
      }
      const l = Math.hypot(dx, dy) || 1
      const kx = (this.w / 2 - m) / Math.max(1e-3, Math.abs(dx / l))
      const ky = (this.h / 2 - m) / Math.max(1e-3, Math.abs(dy / l))
      const r = Math.min(kx, ky)
      x = this.w / 2 + (dx / l) * r
      y = this.h / 2 + (dy / l) * r
      rot = Math.atan2(dy, dx) * DEG
    }
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    el.dataset.dir = inside ? 'here' : 'edge'
    el.style.setProperty('--rot', `${rot.toFixed(0)}deg`)
  }

  // ---------------------------------------------------------------- tap targets

  render() {
    if (this.homeSnap) {
      // Mommy's photo of the island and the family on the pier, for Agong's wall.
      this.homeSnap = false
      this.events.shutter?.()
      this.scene.updateMatrixWorld()
      const src = snap(this.renderer, this.scene, phoneCamera(this.rig.camera, null, 0, 1.05))
      tone(500, 900, 0.3, 0.05, 'triangle')
      window.setTimeout(() => this.events.home?.(src), 1100)
    }
    if (this.wantPortraits) {
      const cb = this.wantPortraits
      this.wantPortraits = null
      cb(portraits(this.renderer, { w: this.w, h: this.h }))
    }
    if (this.pendingSnap && this.pendingSnap.t <= 0) {
      const s = this.pendingSnap
      this.pendingSnap = null
      this.events.shutter?.()
      this.takeSnap(s.c)
    }
    for (const gr of this.grow) {
      gr.t = Math.min(1, gr.t + 0.06)
      gr.g.scale.setScalar(Math.max(0.01, gr.t < 0.7 ? (gr.t / 0.7) * 1.15 : 1.15 - (gr.t - 0.7) * 0.5))
    }
    for (const [id, u] of this.saikaewSpin) {
      const v = this.spin.get(id) ?? 0
      u.rotation.y += v / 60
      this.spin.set(id, v * 0.985)
      if (v < 0.05) this.saikaewSpin.delete(id)
    }
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const k = this.kaylee.root.position
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.4) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp.set(at.x, at.y + height * 0.5, at.z))
        const top = this.toScreen(tmp2.set(at.x, at.y + height, at.z))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.28, Math.abs(c.y - top.y) * 2 * scale)) }
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
    const within = (x: number, y: number, z: number, r = 26) => (Math.hypot(x - k.x, z - k.z) < r ? v.set(x, y, z) : null)
    const riding = this.mode !== 'walk'
    for (const [id, el] of this.anchorEls) {
      let z = '2'
      if (id === 'kaylee') {
        place(el, this.mode === 'walk' || this.mode === 'taxi' ? this.kaylee.root.getWorldPosition(v) : null, this.kaylee.height, 0.8)
        z = '4'
      } else if (id === 'family:nick' || id === 'family:ji') {
        const m = id === 'family:nick' ? this.nick.m : this.ji.m
        place(el, riding && !this.aboard ? null : m.root.getWorldPosition(v), m.height * (m.pose === 'lie' ? 0.5 : 1), 0.9)
        z = '3'
      } else if (id === 'taxi') {
        const p = this.taxi.root.position
        place(el, this.mode === 'ski' ? null : within(p.x, p.y, p.z, 40), 2.6, 0.9)
        z = this.aboard ? '1' : '2'
      } else if (id === 'mermaid') {
        const p = this.props.saikaew.mermaid.position
        place(el, riding ? null : within(p.x, p.y, p.z), 3.6, 0.8)
      } else if (id === 'bell') {
        const p = this.props.saikaew.bell.getWorldPosition(v)
        place(el, riding ? null : within(p.x, p.y - 0.6, p.z, 20), 0.8, 2)
      } else if (id === 'banana') {
        const p = this.banana.banana.getWorldPosition(v)
        place(el, this.mode === 'taxi' ? null : within(p.x, p.y, p.z, 60), 1.2, 1.8)
      } else if (id.startsWith('swimmer:')) {
        const p = this.swimmers[+id.slice(8)].root.position
        place(el, this.mode === 'taxi' ? null : within(p.x, p.y, p.z, 30), 0.8, 2)
      } else if (id.startsWith('tern:')) {
        const p = this.terns[+id.slice(5)].root.getWorldPosition(v)
        place(el, this.mode === 'taxi' ? null : within(p.x, p.y, p.z, 40), 0.4, 3)
      } else if (id.startsWith('umbrella-sk:')) {
        const p = this.props.saikaew.umbrellas[+id.slice(12)].getWorldPosition(v)
        place(el, riding ? null : within(p.x, p.y - 2.45, p.z), 2.6, 0.7)
        z = '1'
      } else if (id.startsWith('stop:')) {
        const sid = id.slice(5) as StopId
        const a = STOPS[sid].at
        const g = this.props.stops[sid]
        const at = sid === 'jetski' ? within(this.skis[0].x, 0, this.skis[0].z) : sid === 'snorkel' ? within(g.position.x, 0, g.position.z, 30) : within(a.x, this.heightAt(a.x, a.z), a.z)
        // (The jet ski stop is the jet ski man's jet ski, until it's hers: then it's a jet ski like the others.)
        place(el, riding || (sid === 'jetski' && this.flags.has('jetski')) ? null : at, sid === 'hideseek' ? 3.4 : 1.6, 1)
        // (Over the pokes and bins round it: the stop is what she came for.)
        z = '3'
      } else if (id === 'lunch') {
        const d = this.props.decks.find((q) => Math.hypot(q.x - DECK.x, q.z - DECK.z) < 0.5)
        place(el, riding || !d ? null : within(LUNCH_TABLE.x, d.y, LUNCH_TABLE.z, 40), 1.1, 1.2)
        z = '3'
      } else if (id.startsWith('flag:')) {
        const g = this.props.flags[id.slice(5) as StopId]
        place(el, riding || !g.visible ? null : within(g.position.x, g.position.y, g.position.z), 4.4, 0.5)
        z = '1'
      } else if (id.startsWith('ski:')) {
        const s = this.skis.find((q) => `ski:${q.id}` === id)
        place(el, !s || riding || !s.ski.root.visible || (s.id === 'saikaew' && !this.flags.has('jetski')) ? null : within(s.x, s.ski.root.position.y, s.z), 1.4, 1.2)
      } else if (id.startsWith('ani:')) {
        const c = this.wild.byId.get(id.slice(4))
        const f = c?.focus
        place(el, !c || !f || c.hidden || !c.root.visible || this.mode === 'taxi' ? null : within(f.x, f.y - c.size * 0.5, f.z, 30), c ? Math.max(0.5, c.size) : 1, c?.kind === 'damselfish' ? 0.9 : 1.6)
        z = '3'
      } else if (id.startsWith('junk:')) {
        const j = this.clean.get(id)
        place(el, !j || riding || !j.g.visible ? null : within(j.spot.x, j.g.position.y, j.spot.z), 0.4, 3)
        z = '3'
      } else if (id.startsWith('bin:')) {
        const b = this.clean.bins[+id.slice(4)]
        place(el, riding ? null : within(b.at.x, b.g.position.y, b.at.z), 1, 1.4)
      } else {
        const p = this.props.pokes.get(id)
        place(el, !p || riding ? null : within(p.g.position.x, p.g.position.y, p.g.position.z), p ? Math.min(3, p.h) : 1, p?.kind === 'crab' ? 3 : 1)
        z = p?.kind === 'palm' || p?.kind === 'samet' || p?.kind === 'tamarind' ? '1' : '2'
      }
      el.style.zIndex = z
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const k = this.mode === 'ski' ? new Vector3(this.d.x, 0, this.d.z) : this.kaylee.root.getWorldPosition(new Vector3())
    const sc = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    return {
      section: 'island',
      phase: this.mode,
      at: this.spot,
      x: +k.x.toFixed(2),
      z: +k.z.toFixed(2),
      y: +k.y.toFixed(2),
      surface: this.surface,
      swimming: this.swimming,
      deck: this.deckOn,
      time: this.timeKey,
      flags: [...this.flags],
      goingHome: this.goingHome,
      taxi: { stop: this.taxi.stopId, state: this.taxi.state, aboard: this.aboard, ...sc(this.taxi.root.position.clone().setY(this.taxi.root.position.y + 1.5)) },
      riding: this.riding >= 0 ? this.skis[this.riding].id : null,
      skis: Object.fromEntries(this.skis.map((s) => [s.id, sc(new Vector3(s.x, s.ski.root.position.y + 0.6, s.z))])),
      stops: Object.fromEntries(STOP_IDS.map((id) => [id, sc(new Vector3(STOPS[id].at.x, this.heightAt(STOPS[id].at.x, STOPS[id].at.z) + 0.8, STOPS[id].at.z))])),
      kaylee: sc(k.clone().setY(k.y + 0.6)),
      speed: +this.lastSpeed.toFixed(2),
      cameraYaw: Math.round(wrap(this.camYaw) * DEG),
      fps: this.stats.fps,
      calls: this.stats.calls,
      tris: this.stats.tris,
      seen: [...this.seen],
      phone: this.phone,
      book: [...this.found],
      lastSnap: this.lastSnap,
      carrying: this.clean.carrying?.kind ?? null,
      junk: Object.fromEntries(this.clean.junk.filter((j) => j.out && j !== this.clean.carrying).map((j) => [j.id, sc(j.g.position.clone().setY(j.g.position.y + 0.2))])),
      animals: Object.fromEntries(this.wild.list.filter((a) => a.root.visible && !a.hidden && Math.hypot(a.focus.x - k.x, a.focus.z - k.z) < 30).map((a) => [a.id, { kind: a.kind, ...sc(a.focus), d: +Math.hypot(a.focus.x - k.x, a.focus.z - k.z).toFixed(1) }])),
      tri: this.triBreakdown(),
      ...this.counts,
    }
  }
  private triBreakdown() {
    const cam = this.rig.camera
    cam.updateMatrixWorld()
    const fr = new (this.raycaster.ray.constructor as never as { new (): never })()
    void fr
    const out: Record<string, number> = {}
    const F = new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse))
    this.scene.traverseVisible((o) => {
      if (!(o instanceof Mesh)) return
      const g = o.geometry
      const n = (g.index ? g.index.count : g.attributes.position.count) / 3
      if (o.frustumCulled) {
        if (!g.boundingSphere) g.computeBoundingSphere()
        const sp = g.boundingSphere!.clone().applyMatrix4(o.matrixWorld)
        if (!F.intersectsSphere(sp)) return
      }
      let key = 'other'
      for (let p: Object3D | null = o; p; p = p.parent) {
        if (this.isl.fine.meshes.includes(p as Mesh)) key = 'fine'
        else if (this.isl.coarse.meshes.includes(p as Mesh)) key = 'coarse'
        else if (p === this.isl.lagoon.near || p === this.isl.lagoon.far) key = 'lagoon'
        else if (p === this.kaylee.root) key = 'kaylee'
        else if (p === this.nick.m.root || p === this.ji.m.root) key = 'family'
        else if (p === this.taxi.root) key = 'taxi'
        else if (this.skis.some((q) => q.ski.root === p)) key = 'skis'
        else if (this.swimmers.some((q) => q.root === p) || this.terns.some((q) => q.root === p) || p === this.banana.root) key = 'critters'
        else if (p === this.isl.root && key === 'other') key = o.userData.hull ? 'island-hull' : 'island'
      }
      out[key] = Math.round((out[key] ?? 0) + n)
      out[`#${key}`] = (out[`#${key}`] ?? 0) + 1
    })
    return out
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

