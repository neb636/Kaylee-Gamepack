// Koh Samet, the island between the stops (notes: planning/around-the-world/thailand/samet-story.md): the north half
// of the island at 1:10 (layout.ts, from OpenStreetMap). It was built as one open world to roam; now it is where the
// story happens between the stops, and she never has to cross it on foot.
//
// The story (story.ts, "The Lost Fireflies"): a new trip opens with the way-in film at Na Dan pier, then the pictures
// of the four beaches come up (the screen's Board). She taps one and is put on that beach a few steps from its stop
// (travel(), under the screen's taxi ride card). The fireflies she has found circle her horn; each one still to find
// waits at its beach; back from a stop its firefly swoops in to join the others and the pictures come up again; with
// all four a short film sends her to the driftwood tree for the sunset.
//
// The toy (core verb) is still leading her with a finger: hold a finger anywhere and she trots after it; hold it far
// ahead and she gallops; tap a spot and she walks there. Walk into the sea and she's swimming in her pink floatie,
// bobbing over the waves (a big one spins her round). A finger held on something (an umbrella, a palm) leads her like
// a finger on the sand; a quick tap pokes it. Walking into a stop's pink ring opens it, the same as tapping its thing.
// With Zoom found the jet ski is hers: one waits on every beach, and she steers it round the coast (engine3d/drive.ts)
// and hops off on any beach. Neighbouring beaches are still a short walk apart; it's just never needed.
//
// Mom and Dad follow at a little distance, stop at the water's edge when she swims, and do their own thing when she
// stops (Dad lies down on the sand: tap him and he jumps up). The stops (any order) are the jet ski at Sai Kaew, the
// sandcastle at Ao Hin Khok, the snorkel boat at Ao Wong Duan and the driftwood tree at Ao Prao (hide and seek; the
// deck's table is lunch). Each stop's pink flag (`flags`) stands on its beach once its firefly is found, and the day
// moves on with them: morning, noon, afternoon, golden (and `time=night` for the fire show's night). Things to poke
// everywhere (props.ts): palms drop coconuts (on Dad's head, if he's under one), samet bark peels, umbrellas spin
// (three pokes and one takes off like a kite with her holding on), chairs fold, the beach ball rolls where she kicks
// it, crabs pop out of their holes, the ice cream cart dings, the bead tray jingles, the hammock swings, boats bob and
// toot, the mermaid's tail splashes. The island's animals (../book/creatures.ts: wander, flee, perch, swim) react to a
// tap. The beach clean (../book/clean.ts) is the side verb: lift the rubbish on the wet sand (an animal pops out where
// it was), carry it to the green bin, plonk.
//
// The green taxi (taxi.ts) waits by the road nearest her; a tap on it honks and brings the pictures up. Tofu the beach
// puppy (puppy.ts) trots along with her; when a stop still to do is on the beach she's on he runs ahead to its ring,
// looks back and waits, comes to fetch her when she stands still, and his thought bubble is a picture of it.
// Quiet hub: no idle lines (after a while with nothing to do on a beach, the top-right button glows). Talk: Sparkle
// only when something is new (a firefly near, a firefly found, a fact the first time she pokes the mermaid or a samet
// tree), the family, the geckos and the taxi driver react to her taps in their own voices. Its feel numbers are knobs
// (?feel=1).
import { Color, DynamicDrawUsage, Fog, Frustum, Object3D, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PerspectiveCamera, Quaternion, Raycaster, RingGeometry, Scene, CircleGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, firstTime, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { knobs, watch } from '../../../../../kit/knobs'
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
import { ANIMALS } from '../book/animals'
import { BeachClean, BIN_IDS, JUNK_IDS } from '../book/clean'
import { WILD, Wildlife, type PalmInfo, type WildCtx } from '../book/creatures'
import { PHOTO_SIZE, snap } from '../book/photo'
import { buildSki, type Ski } from '../jetski/ski'
import { at as atFrame, bay, DECK, FRAMES, LANDMARKS, PARKED, POKES, RING, SLIDE, spotStart, STOP_IDS, STOPS, SWIMMERS, WAVE_DIR, WAYS, type SpotId, type StopId, type XZ } from './layout'
import { FINE } from './scenery'
import { BEATS, Puppy, type Trick } from './puppy'
import { Planner, pointAt, project, type Route } from './route'
import { Letterbox } from '../../../../../engine3d/cinema'
import { FilmPlayer, type Film, type FilmState } from '../../../../../engine3d/film'
import type { FireflyId } from '../story/firefly'
import { IslandStory } from './story'
import { buildProps, type PokeThing, type Props } from './props'
import { buildIsland, DAY, TIMES, type Island, type TimeOfDay } from './scenery'
import type { Surface } from './ground'
import { makeSeeThrough, SEE } from './seethrough'
import { SwimRope } from './swimrope'
import { Taxi } from './taxi'
import { FireDancers } from './dancers'
import { beachBed, islandSfx as sfx } from './sounds'
import { cleanSfx } from '../book/sounds'

const FILE = 'src/world/places/thailand/activities/samet-trip/island/island.ts'
/** Leading Kaylee (and the floatie). */
const WALK = knobs('sametWalk', 'Leading your unicorn round the island', FILE, {
  trot: { value: 2.3, min: 0.8, max: 5, step: 0.1, label: 'Trot', unit: 'm/s', note: 'her speed with the finger a little way ahead' },
  gallop: { value: 4.6, min: 2, max: 9, step: 0.1, label: 'Gallop', unit: 'm/s', note: 'her speed with the finger far ahead' },
  gallopFrom: { value: 5.5, min: 2, max: 14, step: 0.25, label: 'Gallop from', unit: 'm', note: 'her finger this far ahead of her = full gallop' },
  stopNear: { value: 0.45, min: 0.1, max: 2, step: 0.05, label: 'Stop this close', unit: 'm', note: 'she stops when the finger is this close' },
  giveUp: { value: 1.5, min: 0.5, max: 5, step: 0.1, label: 'Gives up on a tap after', unit: 's', note: 'walking to a tapped spot and getting no closer for this long, she stops (no pacing back and forth by a rail)' },
  swim: { value: 1.5, min: 0.5, max: 4, step: 0.1, label: 'Swim', unit: 'm/s', note: 'paddling in the floatie (slower than walking)' },
  deep: { value: 0.5, min: 0.2, max: 1.2, step: 0.05, label: 'Swims from', unit: 'm deep', note: 'shallower than this she wades' },
  far: { value: 26, min: 8, max: 60, step: 1, label: 'Swim out to', unit: 'm', note: 'how far from the shore she can paddle' },
  wave: { value: 0.42, min: 0, max: 1.2, step: 0.02, label: 'Wave height', unit: 'm', note: 'the swell rolling in to the beach she is near' },
  spin: { value: 0.78, min: 0.3, max: 1, step: 0.02, label: 'A wave spins her from', note: 'how high on a crest (0..1) before the floatie spins round' },
  holdLeads: { value: 0.22, min: 0.08, max: 0.6, step: 0.02, label: 'A held finger leads after', unit: 's', note: 'a finger held on an umbrella, a chair, a palm... starts leading her after this long' },
  tapUpTo: { value: 0.5, min: 0.2, max: 0.9, step: 0.02, label: 'Still a tap up to', unit: 's', note: 'let go sooner than this and the thing under her finger gets its poke' },
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
const RIDE = knobs('sametRide', 'The green taxi and the jet ski', FILE, {
  taxi: { value: 6, min: 2, max: 14, step: 0.25, label: 'Taxi speed', unit: 'm/s' },
  near: { value: 7, min: 3, max: 15, step: 0.5, label: 'Hop on from', unit: 'm', note: 'she can hop on the taxi or a jet ski this close to it' },
  top: { value: 9.5, min: 4, max: 18, step: 0.25, label: 'Jet ski top speed', unit: 'm/s' },
  accel: { value: 7, min: 1, max: 16, step: 0.25, label: 'Jet ski speeding up', unit: 'm/s²' },
  turnRate: { value: 2, min: 0.5, max: 4, step: 0.05, label: 'Jet ski turn rate', unit: 'rad/s' },
  grip: { value: 2, min: 0.4, max: 10, step: 0.1, label: 'Jet ski grip' },
  dock: { value: 4.5, min: 1, max: 10, step: 0.25, label: 'Lands on a beach below', unit: 'm/s', note: 'slower than this onto a beach and she hops off; faster and it bounces off' },
})

/** The beach puppy who shows her the way (#357 way-finding, card B). */
const PUP = knobs('sametPuppy', 'The beach puppy', FILE, {
  lead: { value: 4.5, min: 1.5, max: 10, step: 0.25, label: 'Runs on when she is this close', unit: 'm', note: 'she catches up to within this of him and he runs on ahead' },
  wait: { value: 8, min: 3, max: 16, step: 0.25, label: 'Waits this far ahead', unit: 'm', note: 'he runs this far ahead of her (less if that would be off her screen), then sits, looks back and waits' },
  speed: { value: 5.2, min: 2, max: 9, step: 0.1, label: 'His run', unit: 'm/s' },
  idle: { value: 8, min: 3, max: 20, step: 0.5, label: 'Comes to fetch her after', unit: 's', note: 'with nothing touched this long, he runs back to her, barks and tugs her on' },
  again: { value: 1.6, min: 1, max: 3, step: 0.1, label: 'Each fetch waits longer', unit: '×', note: 'the next fetch waits this many times longer (help, not nagging)' },
  reach: { value: 45, min: 15, max: 120, step: 5, label: 'Leads her up to', unit: 'm', note: 'he runs ahead to a stop only when it is this close (on the beach she is on); the pictures take her to the others' },
  slide: { value: 2.4, min: 1, max: 5, step: 0.1, label: 'The sand slide takes', unit: 's' },
  frame: { value: 11, min: 4, max: 20, step: 0.5, label: 'Taxi in the picture within', unit: 'm', note: 'she is this close to the waiting taxi: the camera takes it in too' },
})

export type IslandFlag = StopId
export interface IslandStart {
  at: SpotId
  flags: StopId[]
  time: TimeOfDay | null
  /** What she packed for the trip (her sun hat and sunglasses go on). */
  packed?: string[]
  /** A film to open with (story.ts): the way in at Na Dan pier, or all four fireflies found. */
  story?: 'intro' | 'all' | null
  /** The firefly she has just come back with (one of `flags`): it flies in to join the others. */
  found?: StopId | null
  /** The pictures of the beaches up from the start. */
  board?: boolean
}
export interface IslandEvents {
  /** She opened a stop (tapped its thing up close), or sat down for lunch at the deck's table, or (all four flags up)
   *  the driftwood tree: the finale's sunset. */
  open(stop: StopId | 'lunch' | 'sunset'): void
  /** She reached a new beach (the address bar follows `at`). */
  at(spot: SpotId): void
  /** The speedboat at Na Dan pier, before the whole island is done: the home picture comes up (on) or goes (off). */
  leaveAsk?(on: boolean): void
  /** The beach pictures for the puppy's thought bubble (rendered from the island once it's drawn). */
  pictures?(p: Partial<Record<SpotId, string>>): void
  /** Something went in a bin (the beach clean's count). */
  cleaned?(n: number): void
  /** All four pink flags up and she tapped the speedboat at Na Dan pier: Mom's photo of the island (for Agong's
   *  wall), and home. */
  home?(photo: string): void
  /** Someone says something (lines.ts L.samet.island): the screen's TripGuide speaks it. */
  say?(line: Line): void
  /** A film is on (which beat, memory or not), or off; and the words being said in it (FilmOverlay shows them). */
  film?(s: FilmState | null): void
  filmLine?(l: Line | null): void
  /** The pictures of the beaches should come up (after a film, a firefly flying in, a tap on the taxi) or go. */
  board?(on: boolean): void
  /** Nothing touched for a while with a firefly still to find: the top-right button glows (or stops). */
  nudge?(on: boolean): void
}

const I = L.samet.island
const PL = L.samet.puppy
const lookV = new Vector3()
const herV = new Vector3()

const DEG = 180 / Math.PI
/** The table on the resort deck where the family has lunch (resortDeck's first table). */
const LUNCH_TABLE = atFrame(DECK, -2.5, 0.8)
/** How much the beach camera looks inland (vs along the sand): 0.6 ≈ 35° off the sand's line. */
const SIDE = 0.32
const tmp = new Vector3()
const tmp2 = new Vector3()
const leashV = new Vector3()
/** The speedboat at Na Dan pier (layout.ts POKES): once all four flags are up, it takes them to the sunset (the finale). */
const HOME_BOAT = 'speedboat:0'
/** Where she stands on the pier for Mom's photo before they go (beside the speedboat). */
const HOME_PIER = atFrame(FRAMES.nadan, -4, 22)
/** Between the two fire dancers on Sai Kaew (dancers.ts SPOTS), for their poi's whoom. */
const FIRE_AT = bay(-6, -2)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

// ---- Sounds: sounds.ts (recorded, with the synth ones as fallbacks).

/** Mom, Dad, whoever follows her: their own walk (the code-built toys have no legs: they hop along). */
interface Follower {
  m: Member
  /** Meters behind her along her trail, and to the side. */
  back: number
  side: number
  phase: number
  speed: number
  shadow: Mesh
  lie: number
  /** The deck (or pier, or jetty) under them, -1 if none. */
  on: number
  /** How much of the way to their footstep they keep (1: all of it; less to stay on her screen). */
  reach: number
  /** How long the sea has been in their way. */
  blocked: number
  /** Until the next wave from the water's edge. */
  waveT: number
}

/** How close the family comes: to Kaylee, and to each other (m). */
const FAMILY_GAP = 1.25
/** How far from the middle of the screen they stay while they follow her (-1..1 across and up the screen; a little
 *  less at the bottom, where the buttons are). */
const FAMILY_FRAME = { x: 0.8, top: 0.72, bottom: -0.6 }

type Mode = 'walk' | 'ski' | 'kite' | 'slide'

const LABELS: Record<string, string> = { palm: 'A coconut palm', samet: 'A samet tree', umbrella: 'A beach umbrella', chair: 'A beach chair', ball: 'The beach ball', icecream: 'The ice cream cart', beads: "The bead seller's tray", crab: 'A crab hole', bush: 'Pink flowers', longtail: 'A longtail boat', speedboat: 'The speedboat', hammock: 'The hammock', telescope: 'The telescope', tamarind: 'The tamarind tree', deckbrella: 'An umbrella on the deck', lantern: 'A lantern', lifeguard: 'The lifeguard tower', stall: 'The coconut stall', rocks: 'The balancing rocks' }

export const ISLAND_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'You', kind: 'thing' },
  { id: 'family:nick', label: 'Dad', kind: 'family' },
  { id: 'family:ji', label: 'Mom', kind: 'family' },
  { id: 'taxi', label: 'The green taxi', kind: 'thing' },
  { id: 'puppy', label: 'Tofu the beach puppy', kind: 'thing' },
  { id: 'tuk', label: 'Tuk the fire dancer', kind: 'thing' },
  { id: 'kae', label: 'Kae the fire dancer', kind: 'thing' },
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
  private bubbleEl: HTMLElement | null = null
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

  // ---- Kaylee, Mom, Dad.
  private kaylee: Avatar
  private kShadow: Mesh
  private ring: Group
  /** The rope of floats at the edge of the swim area, and when she last bumped it. */
  private swimRope: SwimRope
  private ropeAt = -9
  private ringK = 0
  private nick: Follower
  private ji: Follower
  private trail: XZ[] = []
  /** The last dry place she stood: where Mom and Dad wait when she swims or rides out to sea. */
  private edge: XZ = { x: 0, z: 0 }
  /** The family's first moment on the island: they start in their places, not walking there. */
  private familySettling = true
  private surface: Surface = 'sand'
  private swimming = false
  private deckOn = -1
  /** Her steps (a hoof sound every other print). */
  private stepN = 0
  private y = 0
  private spinT = -1
  private spinCool = 0
  private stepDist = 0
  private lastPos = new Vector3()
  private stuckT = 0
  /** Walking to a tapped spot: the closest she has got to it, and how long since she last got closer. */
  private gain = { x: 0, z: 0, best: Infinity, t: 0 }

  // ---- Her finger.
  private finger: { x: number; y: number; id?: string; leading: boolean; moved: boolean; at: number } | null = null
  /** The finger that just lifted led her (a drag, or held long enough): the thing under it gets no poke. */
  private ledOff = false
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
  /** Walking into a stop's ring opens it, once she has been outside it (never where she lands, or where a toy put her back). */
  private ringArmed = {} as Record<StopId, boolean>
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
  // ---- The animals and the beach clean.
  private wild: Wildlife
  private clean: BeachClean
  private fish: Fish
  private bubbles: Particles
  /** Off to the finale by speedboat: null before all four flags are up (or with no way on), false waiting, true on the way. */
  private goingHome: boolean | null = null
  private bumpV = { x: 0, z: 0, t: 0 }
  private wctx!: WildCtx
  private counts = { cleaned: 0, lifted: 0, boings: 0, taps: 0, pokes: 0, swims: 0, spins: 0, taxiRides: 0, skiRides: 0, kites: 0, coconuts: 0, bonks: 0, kicks: 0, gallops: 0, beaches: 0, ropes: 0, fetches: 0, named: 0, slides: 0, pupPokes: 0, leaveAsks: 0 }
  private seen = new Set<SpotId>()
  private greeted = false

  // ---- The beach puppy (#357 way-finding).
  private pup: Puppy
  private planner: Planner
  /** Where he's taking her: a stop still to do (on its beach), or the driftwood tree for the sunset. Null: all done,
   *  he trots along beside her. */
  private pupGoal: { stop: StopId; beach: SpotId; at: XZ } | null = null
  /** His route there (planned from where she was), and how far along it he is. */
  private pupRoute: Route | null = null
  private pupS = 0
  /** lead: ahead of her (sitting to wait when she falls behind); fetch: running back for her; here: at the stop;
   *  free: nowhere to go on this beach, beside her. */
  private pupState: 'lead' | 'fetch' | 'here' | 'free' = 'lead'
  private pupWaiting = false
  private pupPlanAt = -99
  private pupPokes = 0
  /** The next fetch, in seconds of nothing touched (it waits longer each time), and the touch it counts from. */
  private fetchWait: number = PUP.idle
  private fetchFrom = 0
  private pics: Partial<Record<SpotId, string>> = {}
  private bubbleK = 0
  private bubbleSpot: SpotId | null = null
  /** When Sparkle last said each beach's name (not over and over going back and forth). */
  private namedAt = new Map<SpotId, number>()
  /** The sand slide: how far down (-1: not sliding). */
  private slideT = -1
  /** Asked at the speedboat whether to go home (the home picture is up). */
  private leaving = false
  /** The camera taking in the waiting taxi beside her (0..1). */
  private taxiFrameK = 0
  // ---- The story (story.ts): its films, the fireflies, the geckos by their lantern.
  private films: FilmPlayer
  private bars = new Letterbox()
  private story: IslandStory
  /** What this visit opens with (a film, a firefly flying in, the pictures), until it has. */
  private opening: { story: 'intro' | 'all' | null; found: StopId | null; board: boolean } | null
  /** Busy with the opening (a firefly flying in before the pictures): no nudges, no greeting yet. */
  private welcoming = false
  private nudged = false
  private frames = 0
  private reachMemo: Record<string, number | null> | null = null
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
    // The waves all round (the forest's insects and birds come in on the roads inland: ambience(), below).
    bag.add({ dispose: beachBed() })

    // ---- Kaylee and her floatie (a pink and white ring round her middle, only in the sea).
    this.kaylee = new Avatar(bag)
    if (start.packed?.length) this.kaylee.wear(wearing(start.packed).filter((w) => w !== 'floaties'))
    scene.add(this.kaylee.root)
    this.kShadow = blobShadow(0.45, bag)
    scene.add(this.kShadow)
    this.swimRope = new SwimRope(bag, scene)
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
      return { m, back, side, phase: Math.random() * 3, speed: 0, shadow, lie: 0, on: -1, reach: 1, blocked: 0, waveT: 2 + Math.random() * 2 }
    }
    this.nick = fam('nick', 2.6, 0.9)
    this.ji = fam('ji', 3.8, -0.9)

    // ---- Where the link starts.
    const s = spotStart(start.at)
    this.y = this.heightAt(s.x, s.z)
    this.kaylee.place(s.x, this.y, s.z, s.face * DEG)
    this.edge = { x: s.x, z: s.z }
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

    // ---- The beach puppy: a step in front of her, ready to run (he picks where to on the first frame).
    this.pup = new Puppy(bag)
    scene.add(this.pup.root, this.pup.shadow)
    this.pup.place(s.x + Math.sin(s.face) * 1.6, s.z + Math.cos(s.face) * 1.6, s.face + Math.PI)
    this.planner = new Planner(this.pupCost, FINE)
    // The sand slide at the end of his shortcut: a smooth pale chute down the dune, pink rims, two pink posts at its top.
    {
      const parts: ReturnType<typeof P.box>[] = []
      const ux = SLIDE.foot.x - SLIDE.top.x
      const uz = SLIDE.foot.z - SLIDE.top.z
      const len = Math.hypot(ux, uz)
      const yaw = Math.atan2(ux, uz)
      const N = 12
      for (let i = 0; i < N; i++) {
        const a0 = i / N
        const a1 = (i + 1) / N
        const x0 = SLIDE.top.x + ux * a0
        const z0 = SLIDE.top.z + uz * a0
        const x1 = SLIDE.top.x + ux * a1
        const z1 = SLIDE.top.z + uz * a1
        const y0 = Math.max(0.05, this.isl.ground.heightAt(x0, z0))
        const y1 = Math.max(0.05, this.isl.ground.heightAt(x1, z1))
        const seg = Math.hypot(len / N, y1 - y0)
        const pitch = Math.atan2(y0 - y1, len / N)
        const at: [number, number, number] = [(x0 + x1) / 2, (y0 + y1) / 2 + 0.06, (z0 + z1) / 2]
        parts.push(P.box(SLIDE.w, 0.08, seg + 0.05, '#FFF8EC', { at, rot: [pitch, yaw, 0] }))
        for (const sd of [-1, 1]) parts.push(P.box(0.16, 0.2, seg + 0.05, i % 2 ? PAL.pink : '#FFFFFF', { at: [at[0] + Math.cos(yaw) * sd * (SLIDE.w / 2 + 0.06), at[1] + 0.08, at[2] - Math.sin(yaw) * sd * (SLIDE.w / 2 + 0.06)], rot: [pitch, yaw, 0] }))
      }
      const ty = Math.max(0.05, this.isl.ground.heightAt(SLIDE.top.x, SLIDE.top.z))
      for (const sd of [-1, 1]) {
        const px = SLIDE.top.x + Math.cos(yaw) * sd * (SLIDE.w / 2 + 0.3)
        const pz = SLIDE.top.z - Math.sin(yaw) * sd * (SLIDE.w / 2 + 0.3)
        parts.push(P.cyl(0.07, 0.08, 1.3, '#FFFFFF', { at: [px, ty + 0.65, pz] }, 8), P.sphere(0.16, PAL.hotpink, { at: [px, ty + 1.38, pz] }, 10))
      }
      scene.add(solid(merge(parts), bag, 2))
    }
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
      const R = STOPS[id].ring ?? RING
      const r = new Mesh(bag.add(new RingGeometry(R - 0.4, R, 48)), glowMat())
      r.rotation.x = -Math.PI / 2
      r.renderOrder = 3
      const at = STOPS[id].at
      this.ringArmed[id] = Math.hypot(at.x - s.x, at.z - s.z) > R
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
    // (No photo book any more: nothing sparkles to be snapped.)
    this.wild.found = new Set(Object.keys(ANIMALS) as (keyof typeof ANIMALS)[])
    scene.add(this.wild.root)
    this.clean = new BeachClean(bag, this.isl.ground, (x, z, r) => this.isl.blockers.add(x, z, r))
    scene.add(this.clean.root)
    this.fish = new Fish(bag, 6)
    scene.add(this.fish.root)

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
    // ---- The story: the films' player, and what the story adds to the island.
    this.films = new FilmPlayer({ line: (l) => this.events.filmLine?.(l), state: (st) => this.events.film?.(st) })
    this.story = new IslandStory({
      scene,
      bag,
      kaylee: this.kaylee,
      nick: this.nick.m,
      ji: this.ji.m,
      pup: this.pup,
      stars: this.stars,
      petals: this.petals,
      heightAt: (x, z) => this.heightAt(x, z),
      say: (l) => this.events.say?.(l),
      stand: (k, n, j) => this.stand(k, n, j),
      night: (on) => this.setLight(on ? 'night' : this.timeKey),
      gather: (on) => this.dancers.gather(on ? 0.42 : 1),
      flags: this.flags as Set<FireflyId>,
      board: () => this.events.board?.(true),
      play: (f, then) => this.play(f, then),
    })
    this.opening = { story: start.story ?? null, found: start.found && this.flags.has(start.found) ? start.found : null, board: !!start.board }
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
    this.setLight(k)
  }
  /** The light alone (a film's memory is at night; the day itself, `timeKey`, stays what the fireflies made it). */
  private setLight(k: TimeOfDay) {
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
      if (Math.abs(u) <= d.hw + 0.05 && Math.abs(v) <= d.hd) return d.y
      if (Math.abs(u) <= (d.rw ?? d.hw) + 0.05 && v < -d.hd && v > -d.hd - d.ramp) {
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
      if (Math.abs(u) <= d.hw && Math.abs(v) <= d.hd) return i
      if (Math.abs(u) <= (d.rw ?? d.hw) && v < -d.hd && v >= -d.hd - d.ramp) return i
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
  /** The decks' rules for a step to (x, z) by someone on deck `on` (-1: on the ground): along the deck they're on,
   *  off it only down its steps, onto one only up its steps, never under or beside one's top. */
  private deckOk(x: number, z: number, on: number) {
    const di = this.deckAt(x, z)
    if (on >= 0) {
      if (di === on) return true
      if (di >= 0) return false
      // Off a deck only down its steps (past its land end), then the ground's own rules apply.
      const d = this.props.decks[on]
      const v = (x - d.x) * d.n.x + (z - d.z) * d.n.z
      if (v > -d.hd - d.ramp + 0.05) return false
    }
    if (di < 0) for (let i = 0; i < this.props.decks.length; i++) if (i !== on && this.inDeckTop(i, x, z)) return false
    if (di >= 0) {
      // Onto a deck only up its steps (its land end), and not over their side high up (the resort deck's are tall).
      const d = this.props.decks[di]
      const v = (x - d.x) * d.n.x + (z - d.z) * d.n.z
      if (v > -d.hd) return false
      if (this.heightAt(x, z) - Math.max(0, this.isl.ground.heightAt(x, z)) > 1) return false
    }
    return true
  }
  /** Can she stand (or paddle) here? */
  private free = (x: number, z: number) => {
    if (!this.deckOk(x, z, this.deckOn)) return false
    if (this.deckOn >= 0 && this.deckAt(x, z) === this.deckOn) return true
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
  /** The puppy's thought bubble (a picture of where he's going), placed over his head each frame. */
  setBubbleElement(el: HTMLElement | null) {
    this.bubbleEl = el
  }
  get calm() {
    return false
  }

  update(dt: number) {
    const t = (this.time += dt)
    // The story's film takes the camera (null: none on). While one is on the island takes no taps, nobody follows
    // anybody, and the film moves who it needs.
    const cine = this.films.update(dt, this.w / this.h)
    const film = this.films.on
    if (this.opening && t > 0.35) this.open()
    if (!film && !this.welcoming && !this.greeted && t > 0.8) this.greet()
    this.rig.lag = CAM.lag
    this.feel.top = RIDE.top
    this.feel.accel = RIDE.accel
    this.feel.turn = RIDE.turnRate
    this.feel.grip = RIDE.grip
    const k = this.kaylee.root.position
    // A finger held still is still playing (no hint while she holds it down).
    if (this.finger || film) this.lastTouch = t
    // A finger held on something leads her like a finger held on the sand (a quick tap still pokes it).
    if (this.finger && !this.finger.leading && t - this.finger.at > WALK.holdLeads) {
      this.finger.leading = true
      this.target = null
      this.walkTo = null
    }
    if (film) this.kaylee.steer(0, 0, 0, this.free)
    else if (this.mode === 'walk') this.lead(dt)
    else if (this.mode === 'ski') this.rideSki(dt)
    else if (this.mode === 'kite') this.flyKite(dt)
    else if (this.mode === 'slide') this.slideStep(dt)
    this.kaylee.update(dt, t)
    if (this.mode === 'walk' || this.mode === 'kite' || this.mode === 'slide') this.underfoot(dt)
    if (this.mode === 'walk' && !film) this.intoSlide()
    {
      // The swim area's edge comes up round her as she paddles near it.
      const gr = this.isl.ground
      const near = this.mode === 'walk' && this.swimming && gr.shoreAt(k.x, k.z) > WALK.far - 9
      this.swimRope.update(dt, t, k.x, k.z, near, WALK.far + 0.5, gr.shoreAt, (x, z) => this.isl.lagoon.heightAt(x, z, t, gr.shoreAt(x, z)))
    }
    this.taxiStep(dt)
    if (film) {
      // Mom and Dad stand where the film put them.
      for (const f of [this.nick, this.ji]) {
        const r = f.m.root.position
        f.m.update(dt, t)
        f.shadow.visible = true
        f.shadow.position.set(r.x, r.y + 0.03, r.z)
      }
    } else {
      this.walkIntoStops()
      this.follow(dt, t)
      this.puppyStep(dt, t)
    }
    this.life(dt, t)
    this.animals(dt, t)
    if (!film) this.whereAmI()
    // The swell: rolling in toward the beach she's nearest, a little bigger at Sai Kaew.
    const lag = this.isl.lagoon
    const f = this.nearestFrame(k.x, k.z)
    const goal = { x: -f.n.x, z: -f.n.z }
    lag.waves.dir = { x: lag.waves.dir.x + (goal.x - lag.waves.dir.x) * ease(dt, 0.2), z: lag.waves.dir.z + (goal.z - lag.waves.dir.z) * ease(dt, 0.2) }
    lag.waves.height += (WALK.wave - lag.waves.height) * ease(dt, 0.5)
    lag.waves.length = 15
    lag.waves.speed = 3.4
    // (In a film the sea, the light and the plants follow what the camera looks at: a memory can be a beach away.)
    const cx = cine ? cine.look.x : this.mode === 'ski' ? this.d.x : k.x
    const cz = cine ? cine.look.z : this.mode === 'ski' ? this.d.z : k.z
    lag.update(t, cx, cz)
    this.lights.follow(cx, 0, cz)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.props.setLamps(this.isl.lamps, t)
    this.dancers.update(dt, t, this.isl.lamps)
    // The fireflies, the geckos, Tofu in a film: round her horn (or the jet ski she rides).
    if (this.mode === 'ski') herV.set(this.d.x, 1.7, this.d.z)
    else herV.set(k.x, k.y + this.kaylee.height * 1.12, k.z)
    this.story.update(dt, t, herV, this.spot, film, this.mode === 'walk' && !this.welcoming)
    this.ambience()
    for (const p of [this.spray, this.puffs, this.petals, this.stars, this.bubbles]) p.update(dt)
    this.camera(dt)
    this.rig.setCine(cine)
    this.rig.update(dt)
    this.bars.update(dt, film)
    if ((this.cullT -= dt) <= 0 || (film && this.filmBeat !== this.films.now?.beat)) {
      // (A film's cut can jump a beach away: the plants there come back at once.)
      this.filmBeat = this.films.now?.beat ?? null
      this.cullT = 0.25
      const c = this.rig.camera.position
      this.isl.cull(c.x, c.z, CAM.far)
    }
    // See through whatever stands between the camera and her (or her ride, or what a film looks at).
    SEE.uEye.value.copy(this.rig.camera.position)
    if (cine) SEE.uFocus.value.copy(cine.look)
    else if (this.mode === 'ski') SEE.uFocus.value.set(this.d.x, 0.8, this.d.z)
    else SEE.uFocus.value.set(k.x, k.y + 0.7, k.z)
    this.drawBubble(dt)
    this.leaveStep()
    // Nothing touched for a while with a firefly still to find and none on this beach: the top-right button glows.
    const idle = !film && !this.welcoming && this.mode === 'walk' && t - this.lastTouch > 9 && this.flags.size < STOP_IDS.length && this.pupState === 'free'
    if (idle !== this.nudged) {
      this.nudged = idle
      this.events.nudge?.(idle)
    }
  }
  private filmBeat: string | null = null

  // ---------------------------------------------------------------- the story on the island

  /** What this visit opens with: the way-in film, a firefly flying in from its stop (then the pictures, or all four's
   *  film), or the pictures straight away. */
  private open() {
    const o = this.opening
    this.opening = null
    if (!o) return
    if (o.found) {
      this.welcoming = true
      this.story.welcome(o.found, () => {
        this.welcoming = false
        if (this.flags.size === STOP_IDS.length) this.playAll()
        else this.events.board?.(true)
      })
    } else if (o.story === 'intro') this.play(this.story.intro(), () => this.afterIntro())
    else if (o.story === 'all') this.playAll()
    else if (o.board) this.events.board?.(true)
  }
  private play(f: Film, then?: () => void) {
    this.finger = null
    this.target = null
    this.walkTo = null
    this.events.board?.(false)
    this.films.play(f, then)
  }
  private afterIntro() {
    this.landed('nadan')
    this.greeted = true
    this.events.say?.(L.samet.story.intro.go)
    this.story.after(0.6, () => this.events.board?.(true))
  }
  /** All four found: the fireflies swirl, Dad calls the sunset, and the pictures show the way to it. */
  private playAll() {
    const k = this.kaylee.root.position
    const f = this.nearestFrame(k.x, k.z)
    this.greeted = true
    firstTime('samet-sunset-call')
    this.play(this.story.all(f, { x: k.x, z: k.z }), () => {
      this.pupPlanAt = -99
      this.events.say?.(L.samet.story.all.go)
      this.story.after(0.6, () => this.events.board?.(true))
    })
  }
  skipFilm() {
    this.films.skip()
  }
  /** Something on the screen was touched (the pictures' button): not idle. */
  touched() {
    this.lastTouch = this.time
  }

  /** Stands her, Dad and Mom somewhere (faces in degrees): the island forgets where she was going, and they stay put
   *  until she moves. */
  private stand(kp: XZ & { face: number }, np: XZ & { face: number }, jp: XZ & { face: number }) {
    if (this.mode === 'ski') this.leaveSki(0, 1)
    this.mode = 'walk'
    this.kite = null
    this.slideT = -1
    this.finger = null
    this.target = null
    this.walkTo = null
    this.swimming = false
    this.y = this.heightAt(kp.x, kp.z)
    this.kaylee.place(kp.x, this.y, kp.z, kp.face)
    this.kaylee.setPose('stand')
    this.deckOn = this.deckAt(kp.x, kp.z)
    this.edge = { x: kp.x, z: kp.z }
    const yaw = kp.face / DEG
    this.trail = []
    for (let i = 0; i < 30; i++) this.trail.push({ x: kp.x - Math.sin(yaw) * i * 0.3, z: kp.z - Math.cos(yaw) * i * 0.3 })
    this.lastPos.copy(this.kaylee.root.position)
    this.lastSpeed = 0
    for (const [f, q] of [[this.nick, np], [this.ji, jp]] as const) {
      const y = this.heightAt(q.x, q.z)
      if (f.m.root.parent !== this.scene) this.scene.attach(f.m.root)
      f.m.root.rotation.set(0, 0, 0)
      f.lie = 0
      f.m.place(q.x, y, q.z, q.face, 'stand')
      f.on = this.deckAt(q.x, q.z)
      f.blocked = 0
      f.speed = 0
      f.shadow.position.set(q.x, y + 0.03, q.z)
    }
  }

  /** She is on beach `to` now (she rode there, or a film left her there): the address bar, the camera, the taxi
   *  parked by its road, Tofu ready to run, the stops' rings armed. Its name isn't said again by walking. */
  private landed(to: SpotId) {
    const k = this.kaylee.root.position
    if (this.spot !== to) {
      this.spot = to
      this.events.at(to)
    }
    if (!this.seen.has(to)) {
      this.seen.add(to)
      this.counts.beaches++
    }
    firstTime(`samet-beach-${to}`)
    this.namedAt.set(to, this.time)
    this.camYaw = this.camGoal = this.spotYaw(to) ?? this.camYaw
    this.moveRef.copy(k)
    this.inland = 0
    let ti = 0
    let td = Infinity
    for (let i = 0; i < 4; i++) {
      const p = Taxi.stopAt(i).at
      const d = Math.hypot(p.x - k.x, p.z - k.z)
      if (d < td) {
        td = d
        ti = i
      }
    }
    this.taxi.park(ti, (x, z) => Math.max(0, this.isl.ground.heightAt(x, z)))
    for (const id of STOP_IDS) this.ringArmed[id] = Math.hypot(STOPS[id].at.x - k.x, STOPS[id].at.z - k.z) > (STOPS[id].ring ?? RING)
    this.pupState = 'lead'
    this.pupPlanAt = -99
    this.pupGoal = null
    this.pupRoute = null
    this.fetchWait = PUP.idle
    this.lastTouch = this.time
    this.cullT = 0
    this.leaving = false
    this.events.leaveAsk?.(false)
  }

  /** The pictures: she picked beach `to`. The taxi's ride card is over the screen; she, Mom, Dad and Tofu are put
   *  there, a few steps from its stop. */
  travel(to: SpotId, stop?: StopId) {
    if (this.films.on) return
    let s = spotStart(to)
    if (stop) {
      // A few steps from the stop she came for, facing it: it's on the screen as she lands.
      const a = STOPS[stop].at
      const l = Math.hypot(s.x - a.x, s.z - a.z) || 1
      const d = (STOPS[stop].ring ?? RING) + 2.3
      const p = { x: a.x + ((s.x - a.x) / l) * d, z: a.z + ((s.z - a.z) / l) * d }
      if (this.standable(p.x, p.z)) s = { ...p, face: Math.atan2(a.x - p.x, a.z - p.z) }
    }
    const face = s.face * DEG
    // Mom and Dad a step behind her, side by side.
    const back = (b: number, side: number) => ({ x: s.x - Math.sin(s.face) * b + Math.cos(s.face) * side, z: s.z - Math.cos(s.face) * b - Math.sin(s.face) * side, face })
    this.stand({ x: s.x, z: s.z, face }, back(this.nick.back, this.nick.side), back(this.ji.back, this.ji.side))
    this.pup.place(s.x + Math.sin(s.face) * 1.6 + Math.cos(s.face) * 0.8, s.z + Math.cos(s.face) * 1.6 - Math.sin(s.face) * 0.8, s.face + Math.PI)
    this.counts.taxiRides++
    if (stop) this.story.arrivedFor(stop)
    this.landed(to)
    this.rig.setShot(this.shot(), true)
    this.familySettling = true
  }
  /** The ride card has gone: a hop, a wave, Tofu barks the beach's name (a woof a beat). */
  arrived() {
    this.kaylee.react('hop')
    this.ji.m.react('wave')
    this.pup.bark(BEATS[this.spot] ?? 2, 0.24)
    this.pup.hop(3)
    this.lastTouch = this.time
  }
  /** The picture of the beach she's already on: Tofu runs to its stop and barks, the ring flashes. */
  showStop(id: StopId) {
    this.lastTouch = this.time
    this.pupPlanAt = -99
    this.pup.bark(2)
    const at = STOPS[id].at
    for (let i = 0; i < 16; i++) this.stars.emit(at.x + (Math.random() - 0.5) * 2, Math.max(0, this.heightAt(at.x, at.z)) + 0.4, at.z + (Math.random() - 0.5) * 2, 0, 1 + Math.random(), 0, 1, 0.1)
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
    // Paddling out against the swim area's rope: it boings her back, softly (the floats dip and bob, a little splash).
    if (goal && this.swimming && this.time - this.ropeAt > 1.4) {
      const gr = this.isl.ground
      if (gr.shoreAt(k.x, k.z) > WALK.far - 1.4 && gr.shoreAt(goal.x, goal.z) > WALK.far) {
        this.ropeAt = this.time
        this.counts.ropes++
        sfx.boing()
        this.swimRope.bump(k.x, k.z)
        this.spray.burst(k.x, this.isl.lagoon.heightAt(k.x, k.z, this.time, gr.shoreAt(k.x, k.z)), k.z, 8, 1.2, 1.6, 0.1)
      }
    }
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
          // (Straight at a pier's or a jetty's rail, with no side to prefer: along it, toward the land.)
          let side = this.lastTurn
          if (!side && this.deckOn >= 0) {
            const n = this.props.decks[this.deckOn].n
            side = uz * n.x - ux * n.z > 0 ? -1 : 1
          }
          side ||= 1
          for (const a of [0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, Math.PI / 2, -Math.PI / 2]) {
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
    // Walking to a tapped spot she can't reach (the sea beside the pier, round a rail): sliding along the rail and
    // back again is still moving, so `stuckT` never fires. Getting no closer for a while gives up just the same.
    let noCloser = false
    if (goal && !this.finger && this.target) {
      const g = this.gain
      if (Math.hypot(g.x - goal.x, g.z - goal.z) > 0.3) Object.assign(g, { x: goal.x, z: goal.z, best: Infinity, t: 0 })
      if (this.aimDist < g.best - 0.25) {
        g.best = this.aimDist
        g.t = 0
      } else g.t += dt
      noCloser = g.t > WALK.giveUp
    } else this.gain.best = Infinity
    if ((this.stuckT > 0.7 || noCloser) && !this.finger) {
      this.target = null
      this.walkTo = null
      this.kaylee.steer(0, 0, 0, this.free)
      this.stuckT = 0
      this.gain.best = Infinity
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

  /** Once a visit, when she lands with no film to say it: Dad calling everyone to the driftwood tree (all four found). */
  private greet() {
    this.greeted = true
    // (The beach she lands on counts as seen: its line would only repeat what she knows.)
    firstTime(`samet-beach-${this.spot}`)
    if (this.flags.size === STOP_IDS.length && firstTime('samet-sunset-call')) this.events.say?.(I.sunset)
  }

  /** Walking into a stop's pink ring opens it, if the stop is still to do (or it's the driftwood tree with all four
   *  flags up: the finale). Not with rubbish in her arms: she's on her way to the bin. */
  private walkIntoStops() {
    if (this.mode !== 'walk') return
    const k = this.kaylee.root.position
    for (const id of STOP_IDS) {
      const at = STOPS[id].at
      const R = STOPS[id].ring ?? RING
      const d = Math.hypot(k.x - at.x, k.z - at.z)
      if (d > R) this.ringArmed[id] = true
      else if (d < R - 0.3 && this.ringArmed[id]) {
        this.ringArmed[id] = false
        const todo = !this.flags.has(id) || (id === 'hideseek' && this.flags.size === STOP_IDS.length)
        if (!todo || this.clean.carrying) continue
        this.target = null
        this.walkTo = null
        this.useStop(id)
        return
      }
    }
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
    if (this.mode !== 'slide') this.kaylee.setPose(deep ? 'sit' : this.kaylee.pose === 'sit' ? 'stand' : this.kaylee.pose)
    // A big wave lifts her and spins the floatie round.
    this.spinCool -= dt
    if (deep && this.spinT < 0 && this.spinCool <= 0) {
      const c = this.isl.lagoon.crestAt(k.x, k.z, this.time, this.isl.ground.shoreAt(k.x, k.z))
      if (c > WALK.spin && this.isl.lagoon.waves.height > 0.25) {
        this.spinT = 0
        this.spinCool = 5
        this.counts.spins++
        sfx.whee()
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
      if (Math.random() < 0.3) sfx.paddle()
    }
    if (!deep && this.stepDist > 0.42) {
      this.stepDist = 0
      if (this.mode === 'walk' && (this.stepN++ & 1) === 0) sfx.step(this.deckOn >= 0)
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

  // ---------------------------------------------------------------- Mom and Dad

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

  /** Somewhere Mom and Dad can wait for her: a deck's top or steps, or dry ground they could walk to. */
  private standable(x: number, z: number) {
    if (this.deckAt(x, z) >= 0) return true
    for (let i = 0; i < this.props.decks.length; i++) if (this.inDeckTop(i, x, z)) return false
    return this.isl.ground.heightAt(x, z) > -0.15 && this.isl.ground.surfaceAt(x, z) !== 'forest'
  }
  /** A point of her trail to follow from (x, z): a little nearer her than the footstep they're on, or the nearest
   *  footstep `can` step toward (her own footsteps never cut through a deck's side). Null if none. */
  private trailToward(x: number, z: number, can: (p: XZ) => boolean): XZ | null {
    const tr = this.trail
    const order = tr.map((p, i) => ({ i, d: Math.hypot(p.x - x, p.z - z) })).sort((a, b) => a.d - b.d)
    // (Already on it: the next footstep toward her.)
    if (order.length && order[0].d < 0.35) {
      const p = tr[Math.max(0, order[0].i - 2)]
      if (can(p)) return p
    }
    for (const o of order) if (o.d >= 0.25 && can(tr[o.i])) return tr[o.i]
    return null
  }

  /** Is this point where she (and the buttons) leave room for them on screen? */
  private inFamilyFrame(x: number, z: number) {
    const s = leashV.set(x, Math.max(0, this.heightAt(x, z)) + 0.7, z).project(this.rig.camera)
    return s.z < 1 && Math.abs(s.x) < FAMILY_FRAME.x && s.y < FAMILY_FRAME.top && s.y > FAMILY_FRAME.bottom
  }
  /** Can a parent step from where they are to (x, z)? Solid, standable and allowed by the decks. */
  private familyCanStand(from: Vector3, x: number, z: number) {
    return this.standable(x, z) && this.deckOk(x, z, this.deckAt(from.x, from.z))
  }
  /** How far along the line from her to their footstep a parent should be to stay on her screen (eased, no snapping);
   *  on a deck or jetty the footstep decides, so nobody gets pulled off the side. */
  private familyGoal(f: Follower, k: Vector3, goal: XZ, dt: number): XZ {
    const dx = goal.x - k.x
    const dz = goal.z - k.z
    const dist = Math.hypot(dx, dz)
    let want = 1
    if (this.mode === 'walk' && !this.swimming && dist > FAMILY_GAP && this.deckOn < 0 && !this.inFamilyFrame(goal.x, goal.z) && this.inFamilyFrame(k.x, k.z)) {
      let lo = FAMILY_GAP / dist
      let hi = 1
      for (let i = 0; i < 6; i++) {
        const m = (lo + hi) / 2
        if (this.inFamilyFrame(k.x + dx * m, k.z + dz * m)) lo = m
        else hi = m
      }
      want = lo
      // Even a step away would be off the edge (she's near the side of the screen, with the trail behind her going
      // off it): while she's not running, they come round to a side of her that's in the picture.
      if (this.lastSpeed < 1.5 && !this.inFamilyFrame(k.x + dx * lo, k.z + dz * lo)) {
        const base = Math.atan2(dx, dz)
        const turn = f === this.nick ? 1 : -1
        for (const a of [0.8, 1.6, 2.4, -0.8, -1.6, -2.4, 3.14]) {
          const x = k.x + Math.sin(base + a * turn) * (FAMILY_GAP + 0.25)
          const z = k.z + Math.cos(base + a * turn) * (FAMILY_GAP + 0.25)
          if (this.inFamilyFrame(x, z) && this.standable(x, z)) return { x, z }
        }
      }
    }
    f.reach += (want - f.reach) * (this.familySettling ? 1 : ease(dt, 4))
    const x = k.x + dx * f.reach
    const z = k.z + dz * f.reach
    return this.standable(x, z) ? { x, z } : goal
  }

  private follow(dt: number, t: number) {
    const k = this.kaylee.root.position
    const idle = this.time - this.lastTouch > 7 && this.lastSpeed < 0.1 && this.mode === 'walk' && !this.swimming
    if (this.mode === 'walk' && this.standable(k.x, k.z) && this.isl.ground.heightAt(k.x, k.z) > 0.02) {
      this.edge.x = k.x
      this.edge.z = k.z
    }
    // Side by side, the way the camera looks at them (at the water's edge they wait together).
    const rx = -Math.cos(this.camYaw)
    const rz = Math.sin(this.camYaw)
    let placed: XZ | null = null
    for (const f of [this.nick, this.ji]) {
      const m = f.m
      const r = m.root
      if (this.mode === 'ski' && f === this.nick) {
        m.update(dt, t)
        f.shadow.visible = false
        continue
      }
      f.shadow.visible = true
      f.on = this.deckAt(r.position.x, r.position.z)
      // Beside her, a step behind; single file on and by a deck (its side would be in the sea, or the other side of
      // the jetty's rail), or where beside her is no place to stand.
      const mid = this.trailPoint(f.back, 0)
      let goal = this.trailPoint(f.back, f.side)
      if (this.deckAt(goal.x, goal.z) !== this.deckAt(mid.x, mid.z) || !this.standable(goal.x, goal.z)) goal = mid
      // She's out in the sea: they wait at the water's edge where she went in, and wave.
      const waiting = !this.standable(goal.x, goal.z)
      if (waiting) {
        const a = f === this.nick ? 0.8 : -0.8
        const q = { x: this.edge.x + rx * a, z: this.edge.z + rz * a }
        goal = this.standable(q.x, q.z) ? q : this.edge
      } else goal = this.familyGoal(f, k, goal, dt)
      // Never on top of her, or of each other.
      const away = (o: XZ, gap: number) => {
        const ax = goal.x - o.x
        const az = goal.z - o.z
        const l = Math.hypot(ax, az)
        if (l >= gap) return
        const ux = l > 0.05 ? ax / l : f === this.nick ? rx : -rx
        const uz = l > 0.05 ? az / l : f === this.nick ? rz : -rz
        const q = { x: o.x + ux * gap, z: o.z + uz * gap }
        if (this.standable(q.x, q.z)) goal = q
      }
      if (!waiting) away(k, FAMILY_GAP)
      if (placed) away(placed, FAMILY_GAP)
      // Standing still, one right behind the other from the camera: Mom would be hidden behind Dad. She takes a
      // place beside him, or on her other side.
      if (placed && !waiting && this.lastSpeed < 1.5 && this.deckOn < 0) {
        const p = placed as XZ
        const across = (goal.x - p.x) * rx + (goal.z - p.z) * rz
        const along = (goal.x - p.x) * -rz + (goal.z - p.z) * rx
        if (Math.abs(across) < 1 && Math.abs(along) < 2.6) {
          for (const q of [{ x: p.x + rx * 1.35, z: p.z + rz * 1.35 }, { x: p.x - rx * 1.35, z: p.z - rz * 1.35 }, { x: 2 * k.x - p.x, z: 2 * k.z - p.z }]) {
            if (Math.hypot(q.x - k.x, q.z - k.z) >= FAMILY_GAP && this.standable(q.x, q.z) && this.inFamilyFrame(q.x, q.z)) {
              goal = q
              break
            }
          }
        }
      }
      placed = goal
      let dx = goal.x - r.position.x
      let dz = goal.z - r.position.z
      let d = Math.hypot(dx, dz)
      // Coming in (the link's first moment), or left far behind off screen (a ride, a long swim, a bay in the way):
      // they catch up where she can't see it.
      if (this.familySettling || (!this.onScreen(r.position) && (d > 30 || f.blocked > 1.5))) {
        const y = this.heightAt(goal.x, goal.z)
        r.position.set(goal.x, y, goal.z)
        m.setGround(y)
        f.blocked = 0
        f.shadow.position.set(goal.x, y + 0.03, goal.z)
        m.update(dt, t)
        continue
      }
      // A straight line that would cut through a deck's side or off it halfway down: along her footsteps instead.
      // (Somewhere it says they can't be already, a deep link or a catch-up: any way out is fine.)
      const ok = (ax: number, az: number, l: number) => l < 0.05 || !this.deckOk(r.position.x, r.position.z, f.on) || this.deckOk(r.position.x + (ax / l) * 0.3, r.position.z + (az / l) * 0.3, f.on)
      if (!ok(dx, dz, d)) {
        // The nearest of her footsteps they can step toward (back to the foot of the steps, if that's what it takes).
        const p = this.trailToward(r.position.x, r.position.z, (q) => ok(q.x - r.position.x, q.z - r.position.z, Math.hypot(q.x - r.position.x, q.z - r.position.z)))
        dx = p ? p.x - r.position.x : 0
        dz = p ? p.z - r.position.z : 0
        d = Math.hypot(dx, dz)
      }
      // Quick enough to keep up with her gallop without falling out of the picture.
      const want = d < 0.25 ? 0 : clamp(d * 3, 0, Math.max(WALK.gallop * 1.15, this.lastSpeed + 0.8))
      f.speed += clamp(want - f.speed, -8 * dt, 8 * dt)
      if (d > 0.01 && f.speed > 0.01) {
        const step = Math.min(d, f.speed * dt)
        const nx = r.position.x + (dx / d) * step
        const nz = r.position.z + (dz / d) * step
        // The sea in the way (she went round a bay): they stop at the edge instead of wading out.
        const wet = (x: number, z: number) => this.deckAt(x, z) < 0 && this.isl.ground.heightAt(x, z) < -0.18
        if (wet(nx, nz) && !wet(r.position.x, r.position.z)) {
          f.speed = 0
          f.blocked += dt
        } else {
          f.blocked = 0
          r.position.x = nx
          r.position.z = nz
          r.rotation.y += wrap(Math.atan2(dx, dz) - r.rotation.y) * ease(dt, 8)
          f.phase += dt * (5 + f.speed * 2.2)
        }
      }
      // She walked right up to them, or they bunched up: a step aside.
      const other = f === this.nick ? this.ji : this.nick
      const others: [XZ, number][] = waiting ? [[other.m.root.position, 1.1]] : [[k, 1.05], [other.m.root.position, 1.1]]
      for (const [o, gap] of others) {
        const ax = r.position.x - o.x
        const az = r.position.z - o.z
        const l = Math.hypot(ax, az)
        if (l >= gap) continue
        const push = Math.min(gap - l, dt * 6)
        const base = l > 0.05 ? Math.atan2(ax, az) : Math.atan2(f === this.nick ? rx : -rx, f === this.nick ? rz : -rz)
        for (const a of [0, 0.9, -0.9, 1.6, -1.6]) {
          const nx = r.position.x + Math.sin(base + a) * push
          const nz = r.position.z + Math.cos(base + a) * push
          if (this.familyCanStand(r.position, nx, nz)) {
            r.position.x = nx
            r.position.z = nz
            break
          }
        }
      }
      // Their walk: a hop-along waddle (the toys have no legs).
      const g = this.heightAt(r.position.x, r.position.z)
      const hop = f.speed > 0.2 ? Math.abs(Math.sin(f.phase)) * 0.07 * Math.min(1, f.speed / 2) * m.height : 0
      m.setGround(g + hop)
      r.rotation.z = f.speed > 0.2 ? Math.sin(f.phase) * 0.06 : r.rotation.z * 0.9
      f.shadow.position.set(r.position.x, g + 0.03, r.position.z)
      // When she stops for a while on a beach: Dad lies down on the sand, Mom watches her.
      const beach = this.surface === 'sand' || this.surface === 'wet'
      f.lie += ((f === this.nick && idle && beach && d < 1 ? 1 : 0) - f.lie) * ease(dt, 1.5)
      if (f === this.nick) {
        if (f.lie > 0.6 && m.pose !== 'lie') m.setPose('lie')
        if (f.lie < 0.4 && m.pose === 'lie') {
          m.setPose('stand')
          m.react('hop')
        }
      }
      // A wave to her from the sand, every so often.
      if (waiting && d < 1 && m.pose !== 'lie' && (f.waveT -= dt) <= 0) {
        f.waveT = 4 + Math.random() * 3
        m.react('wave')
      }
      if (m.pose !== 'lie') m.lookAt(k.x, k.y + 0.8, k.z)
      m.update(dt, t)
    }
    // (Once the camera has found her: its first moments aren't where it will stay.)
    this.familySettling = this.time < 1
  }

  private onScreen(p: Vector3) {
    const s = tmp2.copy(p).project(this.rig.camera)
    return s.z < 1 && Math.abs(s.x) < 1.15 && Math.abs(s.y) < 1.15
  }

  // ---------------------------------------------------------------- the green taxi

  /** The green taxi waits by the road nearest the beach she's on. It doesn't drive her round any more: the pictures
   *  are how it takes her anywhere (travel(), under the screen's ride card), and a tap on it brings them up. */
  private taxiStep(dt: number) {
    const tx = this.taxi
    const k = this.kaylee.root.position
    const tp = tx.root.position
    const near = this.mode === 'walk' && Math.hypot(k.x - tp.x, k.z - tp.z) < RIDE.near + 2
    tx.hold = true
    tx.update(dt, (x, z) => Math.max(0, this.isl.ground.heightAt(x, z)), RIDE.taxi)
    const gm = this.taxiGlow.material as MeshBasicMaterial
    const glow = near && !this.films.on ? 0.55 + 0.3 * Math.sin(this.time * 5) : 0
    gm.opacity += (glow - gm.opacity) * ease(dt, 6)
    this.taxiGlow.position.set(tp.x, tp.y + 0.06, tp.z)
    this.taxiGlow.visible = gm.opacity > 0.02
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
        sfx.bonk()
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
    sfx.skiEngine(clamp(sp / RIDE.top, 0, 1), dt)
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
        const first = !!line && this.greeted && firstTime(`samet-beach-${best}`)
        if (first) this.events.say?.(line)
        // The puppy brought her (he's right there): he barks the beach's name, a woof a beat, and Sparkle says it
        // (not each time she runs back and forth).
        if (this.greeted && Math.hypot(this.pup.x - k.x, this.pup.z - k.z) < 16) {
          this.pup.bark(BEATS[best] ?? 2, 0.24)
          this.counts.named++
          if (!first && this.time - (this.namedAt.get(best) ?? -99) > 45) this.events.say?.(PL.name[best])
          this.namedAt.set(best, this.time)
        }
        // (A new beach: he plans again from here.)
        this.pupPlanAt = -99
      }
      this.camGoal = this.spotYaw(best)!
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
  private camera(dt: number) {
    const s = this.surface
    const wantIn = this.mode === 'walk' && !this.swimming && this.deckOn < 0 && (s === 'road' || s === 'path' || s === 'grass' || s === 'rock') && this.isl.ground.shoreAt(this.kaylee.root.position.x, this.kaylee.root.position.z) < -12 ? 1 : 0
    this.inland += (wantIn - this.inland) * ease(dt, 1.2)
    if (this.mode === 'ski') this.camGoal = this.d.heading
    this.camYaw += wrap(this.camGoal - this.camYaw) * ease(dt, this.mode === 'ski' ? 2 : CAM.turn)
    this.rig.setShot(this.shot())
  }

  private shot(): Shot {
    const tall = this.tall
    const yaw = (this.camYaw + Math.PI) * DEG
    if (this.mode === 'ski') {
      const d = this.d
      const ahead = 2 + clamp(Math.abs(d.speed) / RIDE.top, 0, 1.3) * 4
      return { center: new Vector3(d.x + Math.sin(d.heading) * ahead, 0.9, d.z + Math.cos(d.heading) * ahead), half: tall ? new Vector3(4.4, 2, 7.6) : new Vector3(8, 2, 5.2), yaw: yaw + 18, pitch: 38, follow: true, minDist: 7, maxDist: 90 }
    }
    const k = this.kaylee.root.position
    const run = clamp(this.lastSpeed / Math.max(0.1, WALK.gallop), 0, 1)
    const hx = Math.sin(this.kaylee.root.rotation.y)
    const hz = Math.cos(this.kaylee.root.rotation.y)
    const b = CAM.box
    // On a beach the frame slides a little out to sea, so the water's edge and what's on it show beside her.
    const f = this.nearestFrame(k.x, k.z)
    const sea = (1 - this.inland) * (this.swimming ? 0 : 2.2)
    this.seaShift.x += (f.n.x * sea - this.seaShift.x) * 0.05
    this.seaShift.z += (f.n.z * sea - this.seaShift.z) * 0.05
    // Beside the waiting taxi: the camera takes it in too, so it's never off the screen right next to her.
    const tp = this.taxi.root.position
    const td = Math.hypot(tp.x - k.x, tp.z - k.z)
    this.taxiFrameK += ((this.mode === 'walk' && this.taxi.state === 'wait' && td < PUP.frame && td > 1.5 ? 1 : 0) - this.taxiFrameK) * 0.05
    const fk = this.taxiFrameK
    const grow = td * 0.3 * fk
    return {
      // (Flying under the umbrella, the camera stays down: she rises up the screen.)
      center: new Vector3(k.x + hx * CAM.ahead * run + this.seaShift.x + (tp.x - k.x) * 0.45 * fk, Math.max(this.kite ? this.kite.from.y : k.y, 0) + 0.7, k.z + hz * CAM.ahead * run + this.seaShift.z + (tp.z - k.z) * 0.45 * fk),
      half: tall ? new Vector3(b * 0.62 + grow, 2, b * 0.9 + grow) : new Vector3(b + grow, 2, b * 0.62 + grow),
      yaw,
      pitch: CAM.pitch + (tall ? 4 : 0) + (CAM.forest - CAM.pitch) * this.inland,
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
    // Coconuts falling, bouncing (on Dad's head, if he's under it), rolling.
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
        sfx.bonk()
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
      case 'lifeguard':
        p.g.rotation.z = s * 0.08
        // The flag flutters in the breeze, and flaps hard after a tap.
        if (p.part) p.part.rotation.y = Math.sin(t * 5 + p.at.x) * 0.25 + Math.sin(t * 17) * Math.min(1, (this.spin.get(id) ?? 0) / 10) * 0.6
        this.spin.set(id, (this.spin.get(id) ?? 0) * Math.exp(-dt * 0.9))
        break
      case 'stall':
        p.g.scale.set(1 - s * 0.1, 1 + s * 0.15, 1 - s * 0.1)
        break
      case 'rocks':
        // The top rock wobbles on the stack, the middle one a little.
        if (p.part) {
          p.part.rotation.z = s * 0.35
          p.part.position.x = s * 0.25
        }
        p.g.rotation.z = s * 0.04
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
    if (this.films.on) return
    this.lastTouch = this.time
    this.finger = { x, y, id, leading: !id, moved: false, at: this.time }
    this.ledOff = false
    if (!id) {
      this.target = null
      this.walkTo = null
    }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (Math.hypot(x - downX, y - downY) > 12) f.moved = true
    if (!f.leading && f.moved) {
      f.leading = true
      this.target = null
      this.walkTo = null
    }
  }
  pointerUp() {
    if (this.mode === 'ski') this.d.release()
    const f = this.finger
    this.ledOff = !!f?.id && f.leading && (f.moved || this.time - f.at >= WALK.tapUpTo)
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    if (this.films.on) return
    this.lastTouch = this.time
    const led = this.ledOff
    this.ledOff = false
    if (led && id) return
    this.counts.taps++
    if (id) {
      this.counts.pokes++
      this.poke(id)
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
      // The whole island done: the speedboat at Na Dan pier takes them round to Ao Prao for the sunset (the finale),
      // never straight home: the fire show's 🏠 at the end of the finale is the way home. She walks to the end of the
      // pier, Dad calls the sunset, and off they go.
      if (this.goingHome || this.mode !== 'walk') return
      if (!near(HOME_PIER.x, HOME_PIER.z, 2.5)) return this.goTo(id, HOME_PIER.x, HOME_PIER.z, 1)
      this.goingHome = true
      this.kaylee.faceToward(HOME_PIER.x - FRAMES.nadan.t.x * 3, HOME_PIER.z - FRAMES.nadan.t.z * 3)
      this.kaylee.react('wave')
      this.nick.m.react('wave')
      this.events.say?.(I.sunset)
      sfx.toot()
      window.setTimeout(() => this.events.open('sunset'), 1600)
      return
    }
    if (id === 'puppy') {
      // A silly trick in turn (chase his tail, roll over, a big hop) and a happy woof; Sparkle says who he is, once.
      const tricks: Trick[] = ['spin', 'roll', 'hop']
      this.pup.play(tricks[this.pupPokes++ % tricks.length])
      this.pup.bark(2)
      this.counts.pupPokes++
      if (firstTime('samet-tofu')) this.events.say?.(L.samet.story.island.tofu)
      return
    }
    if (id === 'tuk' || id === 'kae') return this.story.poke(id)
    if (id === HOME_BOAT && this.goingHome === null && this.events.leaveAsk) {
      // Before the whole island is done, the speedboat is the way home: she walks to the end of the pier, Mom asks
      // and the home picture comes up (a tap on it and off they go). Nothing else leaves Koh Samet.
      this.kick(id, 3)
      sfx.toot()
      if (this.mode !== 'walk' || this.leaving) return
      if (!near(HOME_PIER.x, HOME_PIER.z, 2.5)) return this.goTo(id, HOME_PIER.x, HOME_PIER.z, 1)
      this.leaving = true
      this.counts.leaveAsks++
      this.events.leaveAsk(true)
      this.events.say?.(I.leave)
      return
    }
    if (id === 'kaylee') {
      // A hop and her toot; her fireflies twinkle.
      this.kaylee.react('hop')
      sfx.herToot()
      this.story.twinkle()
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
      // Beep beep: the pictures of the beaches come up (pick one and off they go).
      sfx.honk()
      this.taxi.honk()
      this.taxi.waveHello()
      if (this.mode === 'walk') this.events.board?.(true)
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
      sfx.flute()
      this.tailT = 0
      if (firstTime('samet-fact-mermaid')) this.events.say?.(L.samet.trip.facts.mermaid)
      const m = this.props.saikaew.mermaid.position
      this.spray.burst(m.x + 1.4, 0.4, m.z + 1.5, 16, 1.6, 2.6, 0.15)
      return
    }
    if (id === 'bell') {
      this.bellSwing = 0.6
      sfx.ding()
      return
    }
    if (id === 'banana') {
      this.banana.tip()
      sfx.banana()
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
      sfx.tern()
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
      cleanSfx.lid()
      return
    }
    const p = this.props.pokes.get(id)
    if (p) this.pokeThing(p)
  }

  // ---------------------------------------------------------------- the animals and the beach clean

  /** Each frame: the animals live, the beach clean, the urchins' boing. */
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
    this.wild.update(dt, c, 70)
    this.fish.update(dt, c.water)
    for (const pl of this.fish.plips) this.spray.burst(pl.x, c.water(pl.x, pl.z), pl.z, 6, 1, 1.6, 0.09)
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
      sfx.toot()
      this.spray.burst(g.position.x, 0.3, g.position.z, 20, 2, 2.4, 0.16)
    } else if (id === 'hideseek' && this.flags.size === STOP_IDS.length) {
      // All four flags up: the driftwood tree is where they watch the sunset (the finale).
      this.kick('stop:hideseek', 5)
      sfx.treeSunset()
      return this.events.open('sunset')
    } else if (id === 'hideseek') {
      // The driftwood tree rustles, and Dad pops out from behind it.
      this.kick('stop:hideseek', 5)
      const n = this.nick.m
      const p = g.position
      n.root.position.set(p.x + 1.6, this.heightAt(p.x + 1.6, p.z - 1.2), p.z - 1.2)
      n.react('hop')
      sfx.treePeek()
    }
    this.events.open(id)
  }
  private grow: { g: Group; t: number }[] = []

  private pokeThing(p: PokeThing) {
    const k = this.kaylee.root.position
    switch (p.kind) {
      case 'palm': {
        this.kick(p.id, 6)
        sfx.palm()
        if (p.top && this.coconuts.length < 8) {
          const g = this.coconutGeo.clone()
          g.position.copy(p.top).add(tmp.set((Math.random() - 0.5) * 0.4, -0.3, (Math.random() - 0.5) * 0.4))
          // If Dad's near the palm, the coconut finds his head (the silly one).
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
        sfx.samet()
        if (firstTime('samet-fact-samet')) this.events.say?.(L.samet.trip.facts.samet)
        for (let i = 0; i < 12; i++) this.petals.emit(p.at.x + (Math.random() - 0.5) * 0.4, p.y + 0.8 + Math.random() * 1.5, p.at.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 1.5, 0.6 + Math.random(), (Math.random() - 0.5) * 1.5, 2.6, 0.1, 3)
        break
      }
      case 'tamarind':
        this.kick(p.id, 4)
        sfx.tamarind()
        for (let i = 0; i < 8; i++) this.petals.emit(p.at.x + (Math.random() - 0.5) * 3, p.y + 4, p.at.z + (Math.random() - 0.5) * 3, 0, -0.2, 0, 2.5, 0.12, 2)
        break
      case 'bush':
        this.kick(p.id, 5)
        sfx.pop()
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
          sfx.whee()
          this.events.say?.(I.kite)
        }
        break
      }
      case 'chair':
        if (this.folded.has(p.id)) this.folded.delete(p.id)
        else this.folded.add(p.id)
        sfx.clack()
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
        sfx.ding()
        if (Math.hypot(k.x - p.at.x, k.z - p.at.z) < 6 && this.coneT < 0) {
          this.coneT = 0
          this.kaylee.react('hop')
        }
        break
      case 'beads':
        this.kick(p.id, 4)
        sfx.jingle()
        for (let i = 0; i < 10; i++) this.stars.emit(p.at.x, p.y + 1.1, p.at.z, (Math.random() - 0.5) * 1.2, 0.8 + Math.random(), (Math.random() - 0.5) * 1.2, 0.9, 0.07)
        break
      case 'crab':
        if ((this.crabs.get(p.id) ?? -1) < 0) this.crabs.set(p.id, 0)
        sfx.crab()
        break
      case 'longtail':
      case 'speedboat':
        this.kick(p.id, 3)
        sfx.toot()
        break
      case 'hammock':
        this.swing.set(p.id, 0.5)
        sfx.hammock()
        break
      case 'telescope':
        this.kick(p.id, 2)
        sfx.telescope()
        break
      case 'deckbrella':
        this.kick(p.id, 5)
        sfx.fwip()
        break
      case 'lifeguard':
        this.kick(p.id, 3)
        if (p.part) this.spin.set(p.id, 10)
        sfx.lifeguard()
        break
      case 'stall': {
        this.kick(p.id, 4)
        sfx.ding()
        // A green coconut rolls off the stand.
        if (this.coconuts.length < 8) {
          const c = this.coconutGeo.clone()
          c.position.set(p.at.x + (Math.random() - 0.5) * 1.2, p.y + 1.2, p.at.z + 0.3)
          this.scene.add(c)
          this.coconuts.push({ g: c, vy: 1.5, y: 0, vx: (k.x - p.at.x) * 0.3, vz: (k.z - p.at.z) * 0.3, t: 0, bonked: false })
        }
        break
      }
      case 'rocks':
        this.kick(p.id, 7)
        sfx.rocks()
        break
      default:
        break
    }
  }

  // ---------------------------------------------------------------- the beach puppy (#357 way-finding)

  /** The island's ambience each frame: the forest's insects and birds on the roads inland, the fire poi after dark. */
  private ambience() {
    const h = this.herXZ()
    const inland = smooth(10, 32, -this.isl.ground.shoreAt(h.x, h.z))
    if (inland > 0.02) sfx.forest(inland)
    const lit = this.dancers.level
    if (lit > 0.02) {
      const v = lit * 0.6 * clamp(1 - Math.hypot(h.x - FIRE_AT.x, h.z - FIRE_AT.z) / 30, 0, 1)
      if (v > 0.02) sfx.fire(v)
    }
  }

  /** Where she is in the world (on the jet ski: the jet ski). */
  private herXZ(): XZ {
    if (this.mode === 'ski') return { x: this.d.x, z: this.d.z }
    return { x: this.kaylee.root.position.x, z: this.kaylee.root.position.z }
  }
  /** What a meter costs the puppy's planner (and her, following him): roads and paths cheapest, the sand, the rocks,
   *  the shallows dear; never the forest, the deep sea, a deck's side or a palm's trunk. */
  private pupCost = (x: number, z: number) => {
    if (this.deckAt(x, z) >= 0) return 1
    for (let i = 0; i < this.props.decks.length; i++) if (this.inDeckTop(i, x, z)) return Infinity
    const s = this.isl.ground.surfaceAt(x, z)
    if (s === 'forest') return Infinity
    if (s === 'water') return this.isl.ground.heightAt(x, z) > -0.45 ? 4 : Infinity
    for (const [bx, bz, r] of this.isl.blockers.near(x, z)) if (Math.hypot(x - bx, z - bz) < r + 0.25) return 8
    return s === 'road' || s === 'path' ? 1 : s === 'sand' || s === 'grass' ? 1.15 : s === 'wet' ? 1.3 : 1.8
  }
  /** Where he sits to show her a stop: beside its pink ring, on the side she comes from. */
  private goalPoint(id: StopId): XZ {
    const a = STOPS[id].at
    const R = STOPS[id].ring ?? RING
    const sp = spotStart(STOPS[id].place as SpotId)
    const dx = sp.x - a.x
    const dz = sp.z - a.z
    const l = Math.hypot(dx, dz) || 1
    return { x: a.x + (dx / l) * (R + 1.2), z: a.z + (dz / l) * (R + 1.2) }
  }
  /** Picks where Tofu takes her: a stop still to do on the beach she's on (the pictures take her to the others), by
   *  the shortest walk. None here: he trots along beside her. */
  private planPuppy() {
    this.pupPlanAt = this.time
    const her = this.mode === 'walk' && this.swimming ? this.edge : this.herXZ()
    const todo = STOP_IDS.filter((id) => !this.flags.has(id))
    // (All four done: the driftwood tree, for the sunset.)
    const cands: StopId[] = todo.length ? todo : this.goingHome === false ? ['hideseek'] : []
    let best: { id: StopId; route: Route } | null = null
    for (const id of cands) {
      const at = this.goalPoint(id)
      if (Math.hypot(at.x - her.x, at.z - her.z) > PUP.reach) continue
      const walk = this.planner.plan(her, at)
      if (walk && walk.len < PUP.reach * 1.8 && (!best || walk.len < best.route.len)) best = { id, route: walk }
    }
    if (!best) {
      this.pupGoal = null
      this.pupRoute = null
      this.pupState = 'free'
      return
    }
    this.pupGoal = { stop: best.id, beach: STOPS[best.id].place as SpotId, at: this.goalPoint(best.id) }
    this.pupRoute = best.route
    this.pupS = project(best.route, this.pup.x, this.pup.z).s
    this.pupWaiting = false
    if (this.pupState !== 'fetch') this.pupState = 'lead'
  }

  private puppyStep(dt: number, t: number) {
    const P = this.pup
    P.shadow.visible = true
    if (this.pupPlanAt < -50) this.planPuppy()
    const herAt = this.herXZ()
    // (She swims: he waits at the water's edge, where she went in.)
    const her = this.swimming ? this.edge : herAt
    const dHer = Math.hypot(P.x - her.x, P.z - her.z)
    const look = (p: XZ) => lookV.set(p.x, 0, p.z)
    // She rode, slid or swam off: once he's out of sight and far behind, he comes running from just behind her.
    if (this.mode === 'walk' && dHer > 28 && !this.onScreen(tmp.set(P.x, P.y + 0.4, P.z))) {
      const b = this.trailPoint(8, 0)
      P.place(b.x, b.z)
      this.pupState = 'fetch'
    }
    P.wag = clamp(1.2 - dHer / 10, 0.25, 1)
    const g = this.pupGoal
    const busy = this.mode !== 'walk'
    switch (busy ? 'busy' : this.pupState) {
      case 'busy':
        // On the jet ski, flying under an umbrella, down the slide: he sits and watches (and catches up after).
        P.stay(dt, herAt)
        P.look = look(herAt)
        break
      case 'free':
        // Nowhere to go: he trots along at her side.
        if (dHer > 3.2) P.moveToward(her, PUP.speed, dt, 2.2)
        else P.stay(dt, her)
        P.look = dHer < 6 ? look(her) : null
        break
      case 'fetch': {
        // Back to her at a run; there, a hop and two woofs, then off he goes again (looking back).
        const left = P.moveToward(her, PUP.speed * 1.15, dt, 1.3)
        P.look = null
        if (left < 0.1) {
          P.bark(2)
          P.play('hop')
          this.pupState = 'lead'
          this.planPuppy()
        }
        break
      }
      case 'here': {
        if (!g) {
          this.pupState = 'free'
          break
        }
        // At the stop: he sits beside its ring, wagging hard, looking at her.
        if (P.moveToward(g.at, PUP.speed, dt, 0.3) < 0.1) P.stay(dt, her)
        P.look = look(her)
        P.wag = 1
        if (Math.hypot(herAt.x - g.at.x, herAt.z - g.at.z) > 14) this.planPuppy()
        break
      }
      case 'lead': {
        const r = this.pupRoute
        if (!r) {
          this.pupState = 'free'
          break
        }
        const h = project(r, her.x, her.z)
        const ahead = this.pupS - h.s
        const end = this.pupS >= r.len - 0.4
        if (g && Math.hypot(herAt.x - g.at.x, herAt.z - g.at.z) < (STOPS[g.stop].ring ?? RING) + 3.5) {
          this.pupState = 'here'
          P.bark(2)
          P.hop()
          break
        }
        if (h.off > 12) {
          // She's gone her own way: he watches her, comes along if she goes far, and plans again from where she is.
          if (dHer > 14) P.moveToward(her, PUP.speed, dt, 4)
          else P.stay(dt, her)
          P.look = look(her)
          this.pupS = project(r, P.x, P.z).s
          if (this.time - this.pupPlanAt > 4) this.planPuppy()
          break
        }
        // He runs on to `wait` meters ahead of her, or less where that would be off her screen.
        let want = Math.min(r.len, h.s + PUP.wait)
        for (let d = PUP.wait; d > PUP.lead + 1; d -= 0.5) {
          const p = pointAt(r, Math.min(r.len, h.s + d))
          want = Math.min(r.len, h.s + d)
          if (this.inFamilyFrame(p.x, p.z)) break
        }
        if (!this.pupWaiting && (this.pupS >= want - 0.3 || end)) this.pupWaiting = true
        if (this.pupWaiting && ahead < PUP.lead && !end) this.pupWaiting = false
        if (this.pupWaiting) {
          // Waiting for her: he sits, looks back at her, wags.
          const on = pointAt(r, this.pupS)
          if (Math.hypot(P.x - on.x, P.z - on.z) > 0.6) this.pupS = P.alongRoute(r, this.pupS, this.pupS, PUP.speed, dt)
          else P.stay(dt, her)
          P.look = look(her)
        } else {
          this.pupS = P.alongRoute(r, this.pupS, want, PUP.speed, dt)
          // (A glance back now and then as he runs.)
          P.look = ahead > PUP.lead + 1 && Math.sin(t * 1.7) > 0.6 ? look(her) : null
        }
        break
      }
    }
    // Nothing touched for a while, and she's not with him: he comes to fetch her (each time a little later: help, not
    // nagging). The first time, Sparkle says why.
    if (this.lastTouch !== this.fetchFrom) {
      this.fetchFrom = this.lastTouch
      this.fetchWait = PUP.idle
    }
    const idle = t - this.lastTouch
    if (this.mode === 'walk' && !this.swimming && this.pupState === 'lead' && idle > this.fetchWait && dHer > 2.6) {
      this.fetchWait = idle + PUP.idle * PUP.again
      this.pupState = 'fetch'
      this.counts.fetches++
      P.bark(1)
      if (firstTime('samet-puppy-fetch')) this.events.say?.(PL.come)
    }
    P.update(dt, t, Math.max(this.heightAt(P.x, P.z), -0.35))
  }

  /** The thought bubble over his head: a picture of the beach he's taking her to (never words). */
  private drawBubble(dt: number) {
    const el = this.bubbleEl
    if (!el) return
    const P = this.pup
    const spot = this.pupGoal?.beach ?? null
    const src = spot ? this.pics[spot] : undefined
    const wp = P.root.getWorldPosition(tmp2)
    const sc = this.toScreen(tmp.set(wp.x, wp.y + P.height * 1.2, wp.z))
    const show = !!src && !this.films.on && this.mode === 'walk' && (this.pupState === 'lead' || this.pupState === 'fetch') && sc.z < 1 && sc.x > -30 && sc.x < this.w + 30 && sc.y > 0 && sc.y < this.h
    this.bubbleK += ((show ? 1 : 0) - this.bubbleK) * ease(dt, 8)
    if (src && spot !== this.bubbleSpot) {
      this.bubbleSpot = spot
      const img = el.querySelector('img')
      if (img) img.src = src
    }
    const vis = this.bubbleK > 0.03
    const want = vis ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!vis) return
    const size = Math.min(this.w, this.h) < 500 ? 76 : 104
    // Above his head and a little to the side, kept on screen and clear of the top bar.
    const x = clamp(sc.x + size * 0.45, size / 2 + 8, this.w - size / 2 - 8)
    const y = clamp(sc.y - size * 0.7, size / 2 + 84, this.h - size / 2 - 8)
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${this.bubbleK.toFixed(3)})`
    el.style.setProperty('--size', `${size}px`)
    el.style.setProperty('--tx', `${clamp(sc.x - x, -size, size).toFixed(0)}px`)
    el.style.setProperty('--ty', `${clamp(sc.y - y, 0, size * 1.4).toFixed(0)}px`)
  }

  /** The pictures for his bubble: each beach's landmark, drawn from the island itself (once, when it's first drawn).
   *  One a frame: all of them in one frame (a full render, a read back from the GPU and a JPEG each) was a hitch. */
  private picsLeft: (keyof typeof LANDMARKS)[] | null = null
  private picCam: PerspectiveCamera | null = null
  private renderPic() {
    const id = this.picsLeft?.shift()
    if (!id) return
    const cam = (this.picCam ??= new PerspectiveCamera(42, PHOTO_SIZE.w / PHOTO_SIZE.h, 0.3, 500))
    const m = LANDMARKS[id]
    const y = Math.max(0, this.heightAt(m.at.x, m.at.z)) + m.y
    cam.position.set(m.at.x + m.from.x * m.dist, y + m.dist * 0.42, m.at.z + m.from.z * m.dist)
    cam.lookAt(m.at.x, y, m.at.z)
    cam.updateMatrixWorld()
    // (The frame's own sun, see-through and culling go back after the picture.)
    const sun = this.lights.sun.target.position
    const [sx, sy, sz] = [sun.x, sun.y, sun.z]
    const eye = SEE.uEye.value.clone()
    const focus = SEE.uFocus.value.clone()
    this.isl.cull(cam.position.x, cam.position.z, CAM.far)
    this.lights.follow(m.at.x, 0, m.at.z)
    SEE.uEye.value.copy(cam.position)
    SEE.uFocus.value.set(m.at.x, y - 3, m.at.z)
    this.pics[id] = snap(this.renderer, this.scene, cam)
    if (id === 'prao') this.pics.deck = this.pics.prao
    this.lights.follow(sx, sy, sz)
    SEE.uEye.value.copy(eye)
    SEE.uFocus.value.copy(focus)
    const c = this.rig.camera.position
    this.isl.cull(c.x, c.z, CAM.far)
    if (!this.picsLeft?.length) {
      this.picsLeft = null
      this.events.pictures?.(this.pics)
    }
  }

  // ---------------------------------------------------------------- the sand slide and the way home

  /** Onto the sand slide's top, heading down it: she sits and whooshes down. */
  private intoSlide() {
    if (this.swimming) return
    const k = this.kaylee.root.position
    if (Math.hypot(k.x - SLIDE.top.x, k.z - SLIDE.top.z) > 1.2 || this.lastSpeed < 0.4) return
    const ux = SLIDE.foot.x - SLIDE.top.x
    const uz = SLIDE.foot.z - SLIDE.top.z
    const l = Math.hypot(ux, uz)
    const yaw = this.kaylee.root.rotation.y
    if ((Math.sin(yaw) * ux + Math.cos(yaw) * uz) / l < 0.45) return
    this.mode = 'slide'
    this.slideT = 0
    this.target = null
    this.walkTo = null
    this.kaylee.steer(0, 0, 0, this.free)
    this.kaylee.faceToward(SLIDE.foot.x, SLIDE.foot.z)
    this.kaylee.setPose('sit')
    this.counts.slides++
    sfx.whee()
    if (firstTime('samet-slide')) this.events.say?.(I.slide)
  }
  private slideStep(dt: number) {
    const k = this.kaylee.root.position
    this.slideT = Math.min(1, this.slideT + dt / PUP.slide)
    // Slow off the top, quick at the bottom.
    const e = this.slideT ** 1.6
    k.x = SLIDE.top.x + (SLIDE.foot.x - SLIDE.top.x) * e
    k.z = SLIDE.top.z + (SLIDE.foot.z - SLIDE.top.z) * e
    if (Math.random() < dt * 14) this.puffs.burst(k.x, this.y + 0.05, k.z, 2, 1.2, 1.4, 0.1)
    if (this.slideT < 1) sfx.slide(e)
    const last = this.trail[0]
    if (!last || Math.hypot(k.x - last.x, k.z - last.z) > 0.3) {
      this.trail.unshift({ x: k.x, z: k.z })
      if (this.trail.length > 80) this.trail.pop()
    }
    if (this.slideT >= 1) {
      this.mode = 'walk'
      this.slideT = -1
      this.kaylee.setPose('stand')
      this.kaylee.react('hop')
      this.puffs.burst(k.x, this.y + 0.05, k.z, 14, 1.6, 1.4, 0.12)
      sfx.thump()
      this.lastPos.copy(k)
    }
  }
  /** Walked away from the end of the pier: the home picture goes. */
  private leaveStep() {
    if (!this.leaving) return
    const k = this.kaylee.root.position
    if (this.mode !== 'walk' || Math.hypot(k.x - HOME_PIER.x, k.z - HOME_PIER.z) > 6) {
      this.leaving = false
      this.events.leaveAsk?.(false)
    }
  }

  // ---------------------------------------------------------------- tap targets

  render() {
    // The puppy's pictures of each beach, once the island has drawn a few times (its shaders warm).
    if (++this.frames === 4) this.picsLeft = Object.keys(LANDMARKS) as (keyof typeof LANDMARKS)[]
    this.renderPic()
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
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const k = this.kaylee.root.position
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.4, whole = false) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp.set(at.x, at.y + height * 0.5, at.z))
        const top = this.toScreen(tmp2.set(at.x, at.y + height, at.z))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.28, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      // (A stop's target stays all on screen, half off the edge or not, clear of Sparkle's and the book's corners.)
      if (show && spot && whole) {
        const s = spot.size / 2
        spot.x = clamp(spot.x, s, this.w - s)
        spot.y = clamp(spot.y, s, this.h - Math.min(150, this.h * 0.2) - s)
      }
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
    // (A film is on: nothing takes a tap.)
    if (this.films.on) {
      for (const el of this.anchorEls.values()) if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    for (const [id, el] of this.anchorEls) {
      let z = '2'
      if (id === 'kaylee') {
        place(el, this.mode === 'walk' ? this.kaylee.root.getWorldPosition(v) : null, this.kaylee.height, 0.8)
        z = '4'
      } else if (id === 'family:nick' || id === 'family:ji') {
        const m = id === 'family:nick' ? this.nick.m : this.ji.m
        place(el, riding ? null : m.root.getWorldPosition(v), m.height * (m.pose === 'lie' ? 0.5 : 1), 0.9)
        z = '3'
      } else if (id === 'taxi') {
        const p = this.taxi.root.position
        place(el, this.mode === 'ski' ? null : within(p.x, p.y, p.z, 40), 2.6, 0.9)
      } else if (id === 'puppy') {
        const p = this.pup.root.getWorldPosition(v)
        place(el, this.mode === 'ski' || this.mode === 'slide' ? null : within(p.x, p.y, p.z, 40), this.pup.height, 1.4)
        z = '4'
      } else if (id === 'tuk' || id === 'kae') {
        const g = id === 'tuk' ? this.story.tuk : this.story.kae
        place(el, riding || !g.root.visible ? null : within(g.pos.x, g.pos.y, g.pos.z), g.m.height, 0.9)
        z = '3'
      } else if (id === 'mermaid') {
        const p = this.props.saikaew.mermaid.position
        place(el, riding ? null : within(p.x, p.y, p.z), 3.6, 0.8)
      } else if (id === 'bell') {
        const p = this.props.saikaew.bell.getWorldPosition(v)
        place(el, riding ? null : within(p.x, p.y - 0.6, p.z, 20), 0.8, 2)
      } else if (id === 'banana') {
        const p = this.banana.banana.getWorldPosition(v)
        place(el, within(p.x, p.y, p.z, 60), 1.2, 1.8)
      } else if (id.startsWith('swimmer:')) {
        const p = this.swimmers[+id.slice(8)].root.position
        place(el, within(p.x, p.y, p.z, 30), 0.8, 2)
      } else if (id.startsWith('tern:')) {
        const p = this.terns[+id.slice(5)].root.getWorldPosition(v)
        place(el, within(p.x, p.y, p.z, 40), 0.4, 3)
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
        place(el, riding || (sid === 'jetski' && this.flags.has('jetski')) ? null : at, sid === 'hideseek' ? 3.4 : 1.6, 1, true)
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
        place(el, !c || !f || c.hidden || !c.root.visible ? null : within(f.x, f.y - c.size * 0.5, f.z, 30), c ? Math.max(0.5, c.size) : 1, c?.kind === 'damselfish' ? 0.9 : 1.6)
        z = '3'
      } else if (id.startsWith('junk:')) {
        const j = this.clean.get(id)
        place(el, !j || riding || !j.g.visible ? null : within(j.spot.x, j.g.position.y, j.spot.z), 0.4, 3)
        z = '3'
      } else if (id.startsWith('bin:')) {
        const b = this.clean.bins[+id.slice(4)]
        place(el, riding ? null : within(b.at.x, b.g.position.y, b.at.z), 1, 1.4)
        // (With rubbish in her arms the bin is what she came for: over the driftwood tree's ring, Kaylee, everything.)
        if (this.clean.carrying) z = '5'
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
      // The swim area's rope: floats drawn round her, and meters to the shore where she is (the rope is at far + 0.5).
      rope: { floats: this.swimRope.shown, bumps: this.counts.ropes, shore: +this.isl.ground.shoreAt(this.kaylee.root.position.x, this.kaylee.root.position.z).toFixed(1), far: WALK.far },
      deck: this.deckOn,
      time: this.timeKey,
      flags: [...this.flags],
      goingHome: this.goingHome,
      taxi: { stop: this.taxi.stopId, onScreen: this.onScreen(this.taxi.root.position.clone().setY(this.taxi.root.position.y + 1.2)), ...sc(this.taxi.root.position.clone().setY(this.taxi.root.position.y + 1.2)), d: +Math.hypot(this.taxi.root.position.x - k.x, this.taxi.root.position.z - k.z).toFixed(1) },
      // The story: the film and beat on screen, the films played or skipped, the fireflies found and waiting.
      film: this.films.now,
      films: { done: this.films.done, skipped: this.films.skipped },
      story: this.story.qa(),
      welcoming: this.welcoming,
      nudged: this.nudged,
      leaving: this.leaving,
      riding: this.riding >= 0 ? this.skis[this.riding].id : null,
      skis: Object.fromEntries(this.skis.map((s) => [s.id, sc(new Vector3(s.x, s.ski.root.position.y + 0.6, s.z))])),
      stops: Object.fromEntries(STOP_IDS.map((id) => [id, sc(new Vector3(STOPS[id].at.x, this.heightAt(STOPS[id].at.x, STOPS[id].at.z) + 0.8, STOPS[id].at.z))])),
      rings: Object.fromEntries(STOP_IDS.map((id) => [id, { x: +STOPS[id].at.x.toFixed(2), z: +STOPS[id].at.z.toFixed(2), r: STOPS[id].ring ?? RING, ring: sc(new Vector3(STOPS[id].at.x, Math.max(0, this.heightAt(STOPS[id].at.x, STOPS[id].at.z)) + 0.1, STOPS[id].at.z)) }])),
      boat: sc(this.props.stops.snorkel.position.clone()),
      // On a pier or jetty: the screen points 3 m to either side of her, square across it (a finger straight at the rail).
      rails: this.deckOn >= 0 ? (({ t, y }) => [1, -1].map((s) => sc(new Vector3(k.x + t.x * s * 3, y, k.z + t.z * s * 3))))(this.props.decks[this.deckOn]) : null,
      kaylee: sc(k.clone().setY(k.y + 0.6)),
      // Mom (ji) and Dad (nick): where they are, how high (and the ground there), the deck under them (-1: none) and
      // where they are on screen.
      family: Object.fromEntries((['nick', 'ji'] as const).map((id) => [id, (({ x, y, z }) => ({ x: +x.toFixed(2), z: +z.toFixed(2), y: +y.toFixed(2), ground: +this.heightAt(x, z).toFixed(2), deck: this.deckAt(x, z), screen: sc(new Vector3(x, y + 0.7, z)) }))(this[id].m.root.position)])),
      speed: +this.lastSpeed.toFixed(2),
      // The scene's own clock (s): timings from it don't depend on how fast a headless browser draws.
      clock: +this.time.toFixed(2),
      // The beach puppy (#357 way-finding): what he's doing, where he's taking her (the stop, its beach, by taxi from
      // and to which taxi stop), where he is and on screen, how far from her, his route's length and how far ahead of
      // her along it he is, and the times he fetched her, barked a beach's name, came when called, was poked.
      puppy: (() => {
        const P = this.pup
        const wp = P.root.getWorldPosition(new Vector3())
        const her = this.herXZ()
        const r = this.pupRoute
        return {
          state: this.pupState,
          waiting: this.pupWaiting,
          goal: this.pupGoal?.stop ?? null,
          beach: this.pupGoal?.beach ?? null,
          x: +wp.x.toFixed(2),
          z: +wp.z.toFixed(2),
          d: +Math.hypot(wp.x - her.x, wp.z - her.z).toFixed(1),
          screen: sc(wp.clone().setY(wp.y + 0.4)),
          onScreen: this.onScreen(wp.clone().setY(wp.y + 0.4)),
          route: r ? +r.len.toFixed(1) : null,
          ahead: r ? +(this.pupS - project(r, her.x, her.z).s).toFixed(1) : null,
          bubble: this.bubbleK > 0.5 ? this.bubbleSpot : null,
          pictures: Object.keys(this.pics).length,
          fetches: this.counts.fetches,
          named: this.counts.named,
          pokes: this.counts.pupPokes,
        }
      })(),
      // Every beach on foot from Na Dan pier (meters along the puppy's best walk; null: no way there).
      reach: (this.reachMemo ??= Object.fromEntries((Object.keys(FRAMES) as (keyof typeof FRAMES)[]).map((id) => [id, ((r) => (r ? Math.round(r.len) : null))(this.planner.plan(spotStart('nadan'), spotStart(id)))]))),
      cameraYaw: Math.round(wrap(this.camYaw) * DEG),
      fps: this.stats.fps,
      calls: this.stats.calls,
      tris: this.stats.tris,
      seen: [...this.seen],
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

