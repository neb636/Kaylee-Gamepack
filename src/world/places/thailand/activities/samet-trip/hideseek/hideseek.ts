// Hide and seek at Ao Prao (notes: planning/around-the-world/thailand/samet-story.md; the first plan: samet-trip.md),
// on the island's real sunset beach (island/layout.ts FRAMES.prao) by the big driftwood tree from Dad's photo.
//
// Its firefly is Peekaboo, the green one, who loves to hide (story/firefly.ts, peekaboo.ts). She is in both films and
// in the play of every round:
//   story the way in (a film, about 15 s, hold ⏭ to skip): a green light peeks round the driftwood tree, giggles, ducks
//         behind it and peeks out the other side. Dad saw it, Mom knows the game, "Then let's play too!". Then round 1.
//   found she wins her turn to hide (a film, about 9 s): she pops out and Peekaboo pops out with her, lands on Dad's
//         nose (he goes cross-eyed), then flies to your unicorn's horn: found. Then back to the island with her.
//
// The toy (core verb): walk and look, the island's verb. Hold a finger and your unicorn trots after it (gallops when
// it's far ahead), tap a spot and she walks there; tap a hiding place and she walks up and peeks behind it. The verb
// deepens three times (`round`), moving on by itself:
//   1     easy hides. She covers her eyes by the driftwood tree (the photo) and counts, "one… two… three!" (tap to
//         peek through her hooves: Dad's still running, the green light trailing after him). Then she finds him:
//         behind the tree with his head poking out, crouched behind a pink umbrella tipped over like a shield (his feet
//         show), behind the stack of red chairs. Close by, his hiding place wiggles and giggles; tap it (or walk right
//         up): "Found you!", he jumps out and spins her round.
//   2     trickier hides: lying in the tangle of the tree's roots, under a beach towel (the lump breathes, his toes stick
//         out), in the sea with only his cap floating (bubbles), up in the pandanus tree.
//         The help, in both rounds, is one ladder: Peekaboo is tucked in beside Dad as a tiny glow and peeks out of his
//         hiding place now and then; stuck a while and he gives himself away (a giggle, a splash) while she comes out
//         and twinkles over him for good ("The green light knows where Dad is!"); later a sneeze, his place glows and
//         the finger points; then he jumps out and waves; then he runs over.
//   hide  her turn to hide. Dad covers his eyes at the tree and counts to five (tap him: he peeks). Every hiding
//         place glows: she leads your unicorn to one and she crouches in it, Peekaboo tucked in beside her, dimmed to a
//         tiny glow ("Shh! She is hiding with you!"). Dad searches all the wrong places first (behind Mom, the thin
//         palm, the chairs) while she watches and giggles, then gives up: she wins. In the open the first time he spots
//         her ("Found you!"), never twice in a row; wander out while he's close and he spots her too. Tap your unicorn
//         while he searches: "Boo!", he jumps, and she wins.
// Winning her turn is the end of the stop: the found film, then the island with Peekaboo (the screen's `island`). Once
// Peekaboo is found (`found` in the start: a later visit) there is no film: a win cheers, the way back shows, and she
// can hide again and again.
//
// Talk (lines.ts L.samet.hideseek, and L.samet.story.hideseek for Peekaboo): Dad plays it up in his own voice, Sparkle
// counts with her and says what to do once a round (and, through spendHint, when she's stuck); the screen's TripGuide
// plays each line and shows its words, and FilmOverlay the films' lines. Every number that decides the feel is a knob
// (?feel=1), with a graph of how far she is from Dad.
import { Fog, Group, Mesh, MeshBasicMaterial, Raycaster, RingGeometry, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, lineText, spendHint, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { knobs, watch } from '../../../../../kit/knobs'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { Letterbox } from '../../../../../engine3d/cinema'
import { FilmPlayer, type Film, type FilmState, type V3 as FV3 } from '../../../../../engine3d/film'
import { blobShadow, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { at as atFrame, FRAMES, STOPS, type XZ } from '../island/layout'
import { driftwoodGeo } from '../island/props'
import { buildIsland, DAY, type Island, type TimeOfDay } from '../island/scenery'
import { makeSeeThrough, SEE } from '../island/seethrough'
import { fireflySfx } from '../story/firefly'
import { crossEyes, Peekaboo } from './peekaboo'
import { beachBed, hideSfx as sfx } from './sounds'
import { beachChair, cap, chairStack, pandanus, shieldUmbrella, thinPalm, towel } from './props'

const FILE = 'src/world/places/thailand/activities/samet-trip/hideseek/hideseek.ts'
/** Leading Kaylee round the beach. */
const WALK = knobs('hideWalk', 'Leading your unicorn round Ao Prao', FILE, {
  trot: { value: 2.0, min: 0.8, max: 5, step: 0.1, label: 'Trot', unit: 'm/s', note: 'her finger a little way ahead' },
  gallop: { value: 4.0, min: 2, max: 9, step: 0.1, label: 'Gallop', unit: 'm/s', note: 'her finger far ahead' },
  gallopFrom: { value: 5, min: 2, max: 14, step: 0.25, label: 'Gallop from', unit: 'm', note: 'her finger this far ahead = full gallop' },
  stopNear: { value: 0.45, min: 0.1, max: 2, step: 0.05, label: 'Stop this close', unit: 'm' },
})
/** Finding Dad (rounds 1 and 2). */
const SEEK = knobs('hideSeek', 'Finding Dad', FILE, {
  count: { value: 3, min: 1, max: 10, step: 1, label: 'She counts to' },
  gap: { value: 0.85, min: 0.3, max: 2, step: 0.05, label: '…a number every', unit: 's' },
  near: { value: 3.4, min: 1, max: 8, step: 0.1, label: 'His place wiggles within', unit: 'm', note: 'your unicorn this close to where Dad hides: it wiggles and giggles' },
  wiggle: { value: 1.5, min: 0.4, max: 5, step: 0.1, label: '…every', unit: 's' },
  find: { value: 1.25, min: 0.5, max: 3, step: 0.05, label: 'Walking up finds him at', unit: 'm', note: 'she finds him by walking this close, without a tap' },
  giveaway: { value: 8, min: 3, max: 30, step: 0.5, label: 'Help 1: he peeks out after', unit: 's', note: 'stuck this long: a rustle, he pops his head up (a giggle, a splash), then a little rustle now and then' },
  glow: { value: 16, min: 5, max: 60, step: 1, label: 'Help 2: his place glows after', unit: 's', note: 'a big sneeze, and the finger points at it' },
  popOut: { value: 26, min: 8, max: 90, step: 1, label: 'Help 3: he pops out after', unit: 's', note: 'he jumps out and waves ("Here I am!"): a tap on him finds him' },
  runOver: { value: 6, min: 2, max: 30, step: 0.5, label: '…then runs to her after', unit: 's', note: 'still not found: he runs over ("Peekaboo!") and it counts' },
  busyHelp: { value: 0.5, min: 0, max: 1, step: 0.05, label: 'Help clock while she wanders', unit: '×', note: 'the help clock runs this fast while she leads your unicorn about (1 when she stops)' },
  hop: { value: 0.55, min: 0.2, max: 1.5, step: 0.05, label: 'He jumps out in', unit: 's' },
})
/** Her turn to hide (round hide). */
const DAD = knobs('hideDad', "your unicorn hides, Dad seeks", FILE, {
  count: { value: 5, min: 2, max: 12, step: 1, label: 'Dad counts to' },
  gap: { value: 1.0, min: 0.4, max: 2, step: 0.05, label: '…a number every', unit: 's' },
  hideR: { value: 1.4, min: 0.6, max: 3, step: 0.05, label: 'A hiding place counts within', unit: 'm' },
  walk: { value: 2.8, min: 0.6, max: 5, step: 0.1, label: 'He searches at', unit: 'm/s' },
  looks: { value: 3, min: 1, max: 6, step: 1, label: 'Wrong places before he gives up' },
  look: { value: 1.4, min: 0.6, max: 4, step: 0.1, label: '…looking at each for', unit: 's' },
  sees: { value: 2.6, min: 0.5, max: 6, step: 0.1, label: 'He spots her out of hiding within', unit: 'm', note: 'only while he searches, and never twice in a row' },
})
const CAM = knobs('hideCam', 'The beach camera', FILE, {
  pitch: { value: 36, min: 15, max: 70, step: 1, label: 'Looks down', unit: '°' },
  box: { value: 6.2, min: 3, max: 14, step: 0.1, label: 'Shows round her', unit: 'm', note: 'half the width of beach across the screen' },
  tallBox: { value: 4.4, min: 2, max: 12, step: 0.1, label: '…on a tall screen', unit: 'm' },
  pull: { value: 0.35, min: 0, max: 1, step: 0.05, label: 'Leans to the beach’s middle', note: '0 = right on her, 1 = the middle of the beach' },
  margin: { value: 1.5, min: 0, max: 5, step: 0.1, label: 'While she seeks, room round the hiding places', unit: 'm', note: 'the camera keeps her and every hiding place of the round on screen' },
})

/** Peekaboo, the green firefly, in play. */
const PEEKA = knobs('hidePeekaboo', 'Peekaboo, the green firefly', FILE, {
  size: { value: 2.6, min: 0.8, max: 5, step: 0.1, label: 'Her size in play', unit: '×', note: '1 = a 30 cm glow; the beach camera is a long way off' },
  tiny: { value: 0.16, min: 0.04, max: 0.6, step: 0.01, label: 'Her tiny glow in a hiding place', note: '1 = as bright as out in the open' },
  first: { value: 3.5, min: 0.5, max: 15, step: 0.5, label: 'She first peeks out of Dad’s place after', unit: 's' },
  every: { value: 4.5, min: 1.5, max: 15, step: 0.5, label: '…then every', unit: 's' },
  out: { value: 1.3, min: 0.4, max: 4, step: 0.1, label: '…staying out for', unit: 's', note: 'from help 1 on she stays out, twinkling over him' },
})

/** The rounds she plays. */
export type HidePlayRound = '1' | '2' | 'hide'
/** …and the two films beside them: `story` (the way in, then round 1) and `found` (Peekaboo found, then the island). */
export type HideRound = HidePlayRound | 'story' | 'found'
export const HIDE_ROUND_IDS: HidePlayRound[] = ['1', '2', 'hide']
export interface HideStart {
  round: HideRound
  time?: TimeOfDay
  /** Peekaboo is found already (a later visit): she still plays along, but a win is just a win (no found film). */
  found?: boolean
}
export interface HideEvents {
  /** A new round began (the address bar follows). */
  round(r: HideRound): void
  /** She's counting with her eyes shut: the number (0 = eyes open again). */
  count(n: number): void
  /** She peeked through her hooves while counting. */
  peek(): void
  /** Mom took a photo (the screen flashes). */
  photo(): void
  /** She won her turn to hide (`first`: the first time this visit; `badge`: the way back shows, no film takes her). */
  won(first: boolean, badge: boolean): void
  /** Someone talks (`mute`: a stuck hint shown without its voice). */
  say(line: Line, mute?: boolean): void
  /** A film is on (its beat), or over (null); and the line being said in it. */
  film(s: FilmState | null): void
  filmLine(l: Line | null): void
  /** The found film is over: back to the island with Peekaboo. */
  island(): void
}

const H = L.samet.hideseek
const S = L.samet.story.hideseek
/** Peekaboo in the films' shots, whose cameras come much closer than the beach camera: her size, how bright her halo
 *  is, and how strong the green cloud behind her. */
const FILM = { size: 1.1, glow: 0.85, cloud: 0.55 }

type SpotId = 'tree' | 'umbrella' | 'chairs' | 'roots' | 'towel' | 'sea' | 'pandanus' | 'mommy' | 'palmL' | 'palmR'
type DadPose = 'stand' | 'sit' | 'lie'
interface SpotDef {
  id: SpotId
  label: string
  /** Where it is on Ao Prao (u along the beach, v toward the sea). */
  u: number
  v: number
  /** Dad hiding there (offset from the thing, his pose, height, hidden under it). */
  dad: { du: number; dv: number; pose: DadPose; y?: number; hidden?: boolean }
  /** Where Kaylee crouches when she hides there. */
  kay: { du: number; dv: number }
  /** Dad can hide here in round 1 or 2. */
  round?: '1' | '2'
}
/** The driftwood tree, where the island has it (island/props.ts), in Ao Prao's frame. */
const TREE = (() => {
  const f = FRAMES.prao
  const a = STOPS.hideseek.at
  return { u: (a.x - f.x) * f.t.x + (a.z - f.z) * f.t.z, v: (a.x - f.x) * f.n.x + (a.z - f.z) * f.n.z }
})()
const SPOTS: SpotDef[] = [
  { id: 'tree', label: 'The driftwood tree', u: TREE.u, v: TREE.v, dad: { du: 1.2, dv: 1.1, pose: 'stand' }, kay: { du: -0.5, dv: 1.35 }, round: '1' },
  { id: 'umbrella', label: 'The pink umbrella', u: -5, v: -5.5, dad: { du: 0, dv: 0.85, pose: 'sit' }, kay: { du: 0.1, dv: 0.8 }, round: '1' },
  { id: 'chairs', label: 'The stack of red chairs', u: -1.2, v: -9, dad: { du: 0.4, dv: 0.75, pose: 'stand' }, kay: { du: 0, dv: 0.7 }, round: '1' },
  { id: 'roots', label: 'The tangle of roots', u: TREE.u + 2.3, v: TREE.v - 0.6, dad: { du: 0, dv: 0, pose: 'lie' }, kay: { du: 0.2, dv: 0.2 }, round: '2' },
  { id: 'towel', label: 'A beach towel', u: -5.5, v: -1.8, dad: { du: 0, dv: 0, pose: 'lie', hidden: true }, kay: { du: 0, dv: 0 }, round: '2' },
  { id: 'sea', label: 'The sea', u: 1.5, v: 5, dad: { du: 0, dv: 0, pose: 'stand', hidden: true }, kay: { du: 0, dv: -2.2 }, round: '2' },
  { id: 'pandanus', label: 'The pandanus tree', u: -6.5, v: -9, dad: { du: 0.3, dv: 0.05, pose: 'sit', y: 1.75 }, kay: { du: 0, dv: 0.95 }, round: '2' },
  { id: 'mommy', label: 'Mom', u: 8.5, v: -4, dad: { du: 0, dv: 0.9, pose: 'sit' }, kay: { du: 0, dv: 0.85 } },
  { id: 'palmL', label: 'A thin palm', u: -2.5, v: -1.6, dad: { du: 0, dv: 0.5, pose: 'stand' }, kay: { du: 0, dv: 0.45 } },
  { id: 'palmR', label: 'A thin palm', u: 10.5, v: -1.8, dad: { du: 0, dv: 0.5, pose: 'stand' }, kay: { du: 0, dv: 0.45 } },
]
/** How high over Dad's hiding place Peekaboo twinkles when she peeks out of it (meters over the ground, the sea). */
const TWINKLE_Y: Record<SpotId, number> = { tree: 3.0, umbrella: 1.5, chairs: 2.25, roots: 1.15, towel: 0.95, sea: 0.75, pandanus: 3.2, mommy: 1.6, palmL: 2, palmR: 2 }
/** Mom faces along the beach toward the tree (side-on to the camera, watching the game). */
const MOMMY_FACE = Math.atan2(-FRAMES.prao.t.x, -FRAMES.prao.t.z) + 0.35
const BYID = Object.fromEntries(SPOTS.map((s) => [s.id, s])) as Record<SpotId, SpotDef>
const ROUND_HIDES: Record<'1' | '2', SpotId[]> = { '1': ['tree', 'umbrella', 'chairs'], '2': ['roots', 'towel', 'sea', 'pandanus'] }
/** The beach she may walk on (u, v). */
const BOUNDS = { u0: -15, u1: 15, v0: -13, v1: 4.4 }

const DEG = 180 / Math.PI
const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const smoothK = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a), 0, 1)
  return k * k * (3 - 2 * k)
}
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

// ---- Sounds: sounds.ts (recorded, with the synth fallbacks; the voices are lines.ts's).

export const HIDE_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'You', kind: 'thing' },
  { id: 'family:nick', label: 'Dad', kind: 'family' },
  { id: 'family:ji', label: 'Mom', kind: 'family' },
  ...SPOTS.filter((s) => s.id !== 'mommy').map((s) => ({ id: `hide:${s.id}`, label: s.label, kind: 'thing' as const })),
]

interface Thing {
  def: SpotDef
  root: Group
  /** The part a wiggle shakes. */
  shake: Object3D
  wob: number
  big: number
  glow: Mesh
  x: number
  z: number
  y: number
  /** Blocker radius (she walks round it). */
  r: number
}
type Phase = 'film' | 'intro' | 'count' | 'seek' | 'found' | 'dadcount' | 'search' | 'giveup' | 'win' | 'caught'
interface Look {
  x: number
  z: number
  /** The hiding place he peeks at (for the wiggle), or null: her (he found her). */
  at: SpotId | null
  /** He looks the wrong way here. */
  wrongWay?: boolean
}

export class HideSeek implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private cullT = 0
  private seaYaw: number
  private round: HideRound
  private phase: Phase = 'intro'
  private phaseT = 0
  private lastNum = 0

  // ---- Kaylee.
  private kaylee: Avatar
  private kShadow: Mesh
  private kY = 0
  private cover = 0
  private peekT = -1
  private finger: { x: number; y: number; id?: string; moved: boolean; lead: boolean } | null = null
  private target: Vector3 | null = null
  private walkTo: string | null = null
  private lastTouch = 0
  private lastTurn = 0
  private lastPos = new Vector3()
  private speed = 0
  private hiddenAt: SpotId | null = null
  private stuckT = 0

  // ---- Dad and Mom.
  private nick: Member
  private nShadow: Mesh
  private ji: Member
  private dad = { x: 0, z: 0, y: 0, yaw: 0, pose: 'stand' as DadPose, path: [] as XZ[], speed: 2, hidden: false, hop: null as null | { from: Vector3; to: Vector3; t: number; dur: number }, cover: 0, peekT: -1, bob: 0 }
  private onArrive: (() => void) | null = null
  private cap: Group
  private hideIdx = 0
  private hide: SpotId = 'tree'
  private wiggleT = 0
  /** The help clock while she seeks (full speed when she's stopped, slower while she wanders), its level (0 none, 1
   *  he peeked, 2 his place glows, 3 he popped out), and the little rustles between. */
  private helpT = 0
  private helpLvl = 0
  private rustleT = 0
  private poppedT = -1
  private glowing = false
  private looks: Look[] = []
  private lookT = 0
  private kWhere: SpotId | 'open' = 'open'
  private openFinds = 0
  private wins = 0

  // ---- Things.
  private things = new Map<SpotId, Thing>()
  private towelParts: ReturnType<typeof towel>
  private towelLift = -1
  private tree: Group
  private puffs: Particles
  private sparkle: Particles
  private spray: Particles
  private bubbles: Particles
  /** The last line said (for QA), until it's had its moment. */
  private bubble: { text: string; until: number } | null = null
  private turn = { found: 0, look: 0, spotted: 0, notHere: 0, silly: 0 }
  /** She ducks down in the sea (her turn, hiding there): only her head shows; up in the pandanus it's negative. */
  private duck = 0
  private notHereAt = -99
  private hintOn = false
  private counts = { leads: 0, taps: 0, pokes: 0, peeks: 0, wrong: 0, finds: 0, giveaways: 0, popOuts: 0, cameOver: 0, hides: 0, sillyHides: 0, wins: 0, caught: 0, boos: 0, photos: 0 }

  // ---- Peekaboo and the films.
  private films: FilmPlayer
  private bars = new Letterbox()
  private peeka: Peekaboo
  private cross: ReturnType<typeof crossEyes>
  /** Peekaboo is found already (a later visit): no found film. */
  private had: boolean
  /** Peekaboo in play: seconds until she next peeks out of Dad's hiding place and seconds she stays out; tucked in
   *  beside your unicorn; what Sparkle has said about her; twinkles and tucks counted (QA). */
  private pk = { nextT: 0, outT: 0, tucked: false, knew: false, shushed: false, twinkles: 0, tucks: 0 }
  /** A film's own looks and moves, every frame it's on. */
  private filmPose: (() => void) | null = null
  /** Dad's arm up, pointing at the tree (0..1), and where it's going. */
  private point = 0
  private pointGoal = 0
  /** Things to do in a moment (world seconds, so they wait while the beach is paused). */
  private later: { at: number; f: () => void }[] = []

  constructor(
    private renderer: WebGLRenderer,
    start: HideStart,
    private events: HideEvents,
  ) {
    const { scene, bag } = this
    const time = start.time ?? 'afternoon'
    scene.fog = new Fog(DAY[time].haze, 170, 950)
    // The sunset beach's waves and breeze, until she leaves.
    bag.add({ dispose: beachBed() })
    applyBands()
    this.rig.fov = 44
    this.rig.lag = 0.35
    this.rig.camera.far = 3200
    this.round = start.round
    const f = FRAMES.prao
    this.seaYaw = Math.atan2(f.n.x, f.n.z)

    // ---- The island and Ao Prao's things.
    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.isl.setTime(time)
    this.isl.lagoon.waves.height = 0.18
    // (The island's palms melt away where they'd stand between the camera and her, or right in front of the lens.)
    makeSeeThrough(this.isl.root, bag, new Set([...this.isl.fine.meshes, ...this.isl.coarse.meshes]))
    this.tree = new Group()
    this.tree.add(solid(driftwoodGeo(), bag, 2))
    this.tree.position.copy(this.L(TREE.u, TREE.v))
    scene.add(this.tree)
    const towelParts = (this.towelParts = towel(bag))
    for (const def of SPOTS) {
      const p = this.L(def.u, def.v)
      let root: Group
      let shake: Object3D
      let r = 0
      if (def.id === 'tree' || def.id === 'roots') {
        root = this.tree
        shake = this.tree
        r = def.id === 'tree' ? 1.3 : 0
      } else if (def.id === 'umbrella') {
        const u = shieldUmbrella(bag)
        root = u.root
        shake = u.can
        r = 0.55
      } else if (def.id === 'chairs') {
        const c = chairStack(bag)
        root = c.root
        shake = c.pile
        r = 0.5
      } else if (def.id === 'towel') {
        root = towelParts.root
        shake = towelParts.lump
      } else if (def.id === 'sea') {
        root = new Group()
        shake = root
      } else if (def.id === 'pandanus') {
        const pd = pandanus(bag, 5)
        root = pd.root
        shake = pd.crown
        r = 0.55
      } else if (def.id === 'mommy') {
        root = beachChair(bag).root
        shake = root
        r = 0.45
      } else {
        root = thinPalm(bag, def.id === 'palmL' ? 11 : 12).root
        shake = root
        r = 0.25
      }
      if (root !== this.tree) {
        root.position.copy(p)
        root.rotation.y = def.id === 'mommy' ? MOMMY_FACE : this.seaYaw
        scene.add(root)
      }
      const glow = new Mesh(bag.add(new RingGeometry(0.9, 1.15, 32)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0, depthWrite: false })))
      glow.rotation.x = -Math.PI / 2
      const k = this.kayPoint(def)
      glow.position.set(k.x, Math.max(0.03, this.groundY(k.x, k.z)) + 0.05, k.z)
      glow.renderOrder = 4
      glow.visible = false
      scene.add(glow)
      this.things.set(def.id, { def, root, shake, wob: 0, big: 0, glow, x: p.x, z: p.z, y: p.y, r })
    }
    towelParts.lump.visible = false
    towelParts.toes.visible = false
    this.cap = cap(bag).root
    this.cap.visible = false
    scene.add(this.cap)

    // ---- Kaylee, Dad and Mom.
    this.kaylee = new Avatar(bag)
    scene.add(this.kaylee.root)
    this.kShadow = blobShadow(0.42, bag)
    scene.add(this.kShadow)
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.nick = fam('nick')
    this.ji = fam('ji')
    this.nShadow = blobShadow(0.5, bag)
    scene.add(this.nick.root, this.ji.root, this.nShadow)
    const mc = this.things.get('mommy')!
    this.ji.place(mc.x, mc.y + 0.36 - 0.1 * this.ji.height, mc.z, MOMMY_FACE * DEG, 'sit')

    this.puffs = new Particles({ kind: 'spray', count: 200, colors: ['#FFF4DE', '#EBD5AA', '#E2C597'], gravity: 9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#FFF6B8', PAL.gold, PAL.pink, PAL.hotpink], gravity: -0.6 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 160, colors: ['#FFFFFF', '#EAFBFF', '#C9F6EC'], gravity: 9 }, bag)
    this.bubbles = new Particles({ kind: 'spray', count: 80, colors: ['#FFFFFF', '#DDF6FF'], gravity: -2 }, bag)
    scene.add(this.puffs.mesh, this.sparkle.mesh, this.spray.mesh, this.bubbles.mesh)

    // ---- Peekaboo and the films.
    this.films = new FilmPlayer({ line: (l) => this.events.filmLine(l), state: (st) => this.events.film(st) })
    this.peeka = new Peekaboo(bag, scene)
    this.cross = crossEyes(this.nick.rig, bag)
    this.had = !!start.found

    // ---- Where the link starts: at the tree (the photo: your unicorn covering her eyes in front, Dad leaning on it).
    const r = start.round
    const k0 = r === 'hide' ? this.L(TREE.u - 2.4, TREE.v - 3.2) : this.kStart()
    this.kaylee.place(k0.x, k0.y, k0.z, (this.seaYaw + Math.PI) * DEG)
    this.kY = k0.y
    this.lastPos.copy(k0)
    const d0 = this.dStart()
    this.setDad(d0.x, d0.z, this.seaYaw + Math.PI, 'stand')
    // (Peekaboo waits where the way-in film leaves her: peeking round the trunk, over their heads.)
    this.peeka.place(this.trunkSide(-1, 1, 1.9))
    this.peeka.snap(PEEKA.size)
    if (r === 'story') this.stageStory()
    else if (r === 'found') this.stageFound()
    else this.startRound(r, true)

    this.unwatch = watch('hideseek', () => ({
      'your unicorn to Dad (m)': [this.dadDist(), 12],
      'her speed (m/s)': [this.speed, 5],
    }))
  }

  // ---------------------------------------------------------------- places

  /** A point on Ao Prao (u along the beach, v toward the sea) at the ground's height. */
  private L(u: number, v: number, out = new Vector3()) {
    const p = atFrame(FRAMES.prao, u, v)
    return out.set(p.x, this.groundY(p.x, p.z), p.z)
  }
  private local(x: number, z: number) {
    const f = FRAMES.prao
    const dx = x - f.x
    const dz = z - f.z
    return { u: dx * f.t.x + dz * f.t.z, v: dx * f.n.x + dz * f.n.z }
  }
  private groundY(x: number, z: number) {
    return this.isl.ground.heightAt(x, z)
  }
  private water(x: number, z: number) {
    return this.isl.lagoon.heightAt(x, z, this.time, this.isl.ground.shoreAt(x, z))
  }
  private kayPoint(def: SpotDef) {
    return this.L(def.u + def.kay.du, def.v + def.kay.dv)
  }
  private dadPoint(def: SpotDef) {
    return this.L(def.u + def.dad.du, def.v + def.dad.dv)
  }
  /** Where to stand to peek behind a place (just up the beach of it). */
  private lookPoint(def: SpotDef) {
    if (def.id === 'sea') return this.L(def.u, 2.6)
    const t = this.things.get(def.id)!
    return this.L(def.u + (def.id === 'roots' ? 0.4 : 0), def.v - (t.r + 0.75))
  }
  private dadDist() {
    const k = this.kaylee.root.position
    return Math.hypot(this.dad.x - k.x, this.dad.z - k.z)
  }
  /** Where round 1 starts (the photo): your unicorn in front of the driftwood tree, Dad by it behind her. */
  private kStart() {
    return this.L(TREE.u - 0.6, TREE.v - 2.1)
  }
  private dStart() {
    return this.L(TREE.u + 0.9, TREE.v - 1.4)
  }
  /** A point by the driftwood tree's trunk, `y` meters up it: out to one side (`s` -1 or 1 along the beach, `out` 1),
   *  or tucked behind it on the sea side (`out` 0), where the trunk hides her from the beach. */
  private trunkSide(s: number, out: number, y = 2.05, to = new Vector3()) {
    const f = FRAMES.prao
    const tr = this.tree.position
    // (The trunk leans: island/props.ts driftwoodGeo.)
    const cx = tr.x + 0.25 * (y - 0.2)
    const cz = tr.z + 0.125 * (y - 0.2)
    const a = 0.98 * s * out
    const b = 0.85 * (1 - out)
    return to.set(cx + f.t.x * a + f.n.x * b, tr.y + y, cz + f.t.z * a + f.n.z * b)
  }
  /** The middle of someone's head (world). */
  private headOf(who: Avatar | Member, to = new Vector3()) {
    const rig = who.rig
    return rig.head.localToWorld(to.set(0, rig.face.headY, 0))
  }
  /** The tip of Dad's nose (world). */
  private dadNose(to = new Vector3()) {
    const { head, face } = this.nick.rig
    return head.localToWorld(to.set(0, face.headY - face.R * 0.12, face.R * 1.12))
  }
  /** Just over the tip of your unicorn's horn (world). */
  private horn(to = new Vector3()) {
    const rig = this.kaylee.rig
    return rig.head.localToWorld(to.set(0, rig.face.headY + rig.face.R * 1.55, rig.face.R * 0.2))
  }
  private after(s: number, f: () => void) {
    this.later.push({ at: this.time + s, f })
  }

  /** Can she stand here? (On the beach, out of the things, into the shallows.) */
  private free = (x: number, z: number) => {
    const { u, v } = this.local(x, z)
    if (u < BOUNDS.u0 || u > BOUNDS.u1 || v < BOUNDS.v0 || v > BOUNDS.v1) return false
    const k = this.kaylee?.root.position
    for (const t of this.things.values()) {
      if (t.r <= 0) continue
      const d = Math.hypot(x - t.x, z - t.z)
      // (Inside one already, a hop or a deep link: any step that takes her further out is fine.)
      if (d < t.r + 0.22 && !(k && Math.hypot(k.x - t.x, k.z - t.z) < t.r + 0.22 && d > Math.hypot(k.x - t.x, k.z - t.z))) return false
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

  /** The round chips (?feel=1) and the rounds moving on by themselves. */
  setRound(r: HidePlayRound) {
    if (r === this.round || this.films.on) return
    this.startRound(r)
  }
  /** `photo`: the round opens on the photo for a moment (her eyes covered in front of the tree) before the count. */
  private startRound(r: HidePlayRound, first = false, photo = first) {
    const was = this.round
    this.round = r
    this.hideIdx = 0
    if (!first || was !== r) this.events.round(r)
    if (r === 'hide') {
      this.say(H.myTurn)
      this.say(H.hide)
      this.toDadCount()
    } else {
      this.say(H.close)
      this.hide = ROUND_HIDES[r][0]
      if (photo) this.setPhase('intro')
      else this.toCount()
    }
  }
  /** Skips the film that's on (the screen's hold-to-skip ⏭). */
  skipFilm() {
    this.films.skip()
  }
  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
    this.lastNum = 0
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    const cine = this.films.update(dt, this.w / this.h)
    if (this.films.on) this.lastTouch = t
    for (let i = this.later.length - 1; i >= 0; i--) if (this.later[i].at <= t) this.later.splice(i, 1)[0].f()
    this.play(dt, t)
    this.lead(dt)
    this.underfoot(dt)
    this.moveDad(dt, t)
    this.life(dt, t)
    for (const p of [this.puffs, this.sparkle, this.spray, this.bubbles]) p.update(dt)

    const c = this.camCenter()
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    if ((this.cullT -= dt) <= 0) {
      this.cullT = 0.5
      this.isl.cull(c.x, c.z, 95)
    }
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.rig.setCine(cine)
    this.bars.update(dt, this.films.on)
    SEE.uEye.value.copy(this.rig.camera.position)
    SEE.uFocus.value.copy(c)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- the game

  private play(dt: number, t: number) {
    const k = this.kaylee.root.position
    switch (this.phase) {
      case 'film':
        // (A film has the beach: its beats move everyone.)
        break
      case 'intro':
        // The photo for a moment: Kaylee covering her eyes in front of the tree, Dad leaning on it behind her.
        if (this.phaseT > 1.4) this.toCount()
        break
      case 'count': {
        // Eyes shut, counting; Dad runs off to hide (she can peek through her hooves).
        const n = Math.floor((this.phaseT - 0.3) / SEEK.gap) + 1
        if (n > this.lastNum && n <= SEEK.count) {
          this.lastNum = n
          sfx.countNote(n)
          this.events.count(n)
          this.say(H.count[Math.min(n, H.count.length) - 1])
        }
        if (this.phaseT > 0.3 + SEEK.count * SEEK.gap + 0.2) {
          sfx.ready()
          this.events.count(0)
          this.placeDadHidden()
          if (this.hideIdx === 0) this.say(this.round === '2' ? H.tricky : H.find)
          this.setPhase('seek')
          this.wiggleT = 0
          this.helpT = 0
          this.helpLvl = 0
          this.rustleT = 0
          this.poppedT = -1
          this.glowing = false
          this.pk.nextT = PEEKA.first
          this.pk.outT = 0
        }
        break
      }
      case 'seek': {
        const def = BYID[this.hide]
        const popped = this.poppedT >= 0
        const dp = popped ? tmp2.set(this.dad.x, 0, this.dad.z) : this.dadPoint(def)
        const d = Math.hypot(dp.x - k.x, dp.z - k.z)
        if (d < SEEK.find + (def.id === 'sea' && !popped ? 1.6 : 0)) return void this.found()
        if (d < SEEK.near && (this.wiggleT += dt) > SEEK.wiggle) {
          this.wiggleT = 0
          this.shake(this.hide, 0.6)
          sfx.giggle()
          this.twinkle()
        }
        // The help rises while she's stuck (rule 3): he peeks out, his place glows, he pops out, he runs over. The clock
        // runs slower while she's busy leading Kaylee about (she may be looking), never stops.
        const busy = !!this.finger || this.speed > 0.4
        this.helpT += busy ? dt * SEEK.busyHelp : dt
        if (this.helpLvl < 1 && this.helpT > SEEK.giveaway) this.help(1)
        else if (this.helpLvl < 2 && this.helpT > SEEK.glow) this.help(2)
        else if (this.helpLvl < 3 && this.helpT > SEEK.popOut) this.help(3)
        else if (this.helpLvl >= 1 && this.helpLvl < 3 && (this.rustleT += dt) > SEEK.giveaway * 0.6) {
          // (Between the big helps: a little rustle and a giggle, no words.)
          this.rustleT = 0
          this.shake(this.hide, 0.9)
          sfx.giggle()
          this.peeka.wiggle()
        }
        if (popped && !this.dad.hop && (this.poppedT += dt) > SEEK.runOver && !busy) {
          // Still not found: he runs over to her, and that counts.
          this.poppedT = -2
          const kk = this.local(k.x, k.z)
          const to = this.L(kk.u + (kk.u > def.u ? -0.9 : 0.9), kk.v - 0.3)
          this.dadWalk([{ x: to.x, z: to.z }], 4.2, () => {
            if (this.phase === 'seek') this.found(true)
          })
        }
        break
      }
      case 'found':
        if (this.phaseT > 2.6) {
          const list = ROUND_HIDES[this.round === '2' ? '2' : '1']
          this.hideIdx++
          if (this.hideIdx >= list.length) return this.startRound(this.round === '1' ? '2' : 'hide')
          this.hide = list[this.hideIdx]
          this.toCount()
        }
        break
      case 'dadcount': {
        // Dad at the tree, eyes covered, counting; she runs off and hides.
        const atTree = !this.dad.path.length && !this.dad.hop
        if (!atTree) {
          this.phaseT = 0
          break
        }
        if (this.dad.peekT >= 0) {
          // (He's peeking: the count waits.)
          this.phaseT -= dt
          break
        }
        const n = Math.floor((this.phaseT - 0.4) / DAD.gap) + 1
        if (n > this.lastNum && n <= DAD.count) {
          this.lastNum = n
          sfx.countNote(n)
          this.say(H.dadCount[Math.min(n, H.dadCount.length) - 1])
        }
        this.settleHiding()
        if (this.phaseT > 0.4 + DAD.count * DAD.gap + 0.2) {
          sfx.ready()
          this.say(H.ready)
          this.startSearch()
        }
        break
      }
      case 'search': {
        this.settleHiding()
        // Wander out of hiding while he's close (and he hasn't spotted her in the open just now): he sees her.
        const left = this.kWhere === 'open' ? false : !this.inHiding(this.kWhere)
        if (left && this.openFinds === 0 && this.dadDist() < DAD.sees) return void this.caught()
        if (this.dad.path.length || this.dad.hop) break
        this.lookT += dt
        const look = this.looks[0]
        if (!look) {
          this.setPhase('giveup')
          this.dad.pose = 'stand'
          this.nick.react('wiggle')
          this.say(H.giveUp)
          sfx.hmm()
          break
        }
        if (look.at === null) return void this.caught()
        if (this.lookT > DAD.look) {
          this.looks.shift()
          this.lookT = 0
          this.nextLook()
        }
        break
      }
      case 'giveup':
        if (this.phaseT > 1.8) this.win()
        break
      case 'win':
        if (this.phaseT > 4.2) this.toDadCount()
        break
      case 'caught':
        if (this.phaseT > 3) this.toDadCount()
        break
    }
    // Eyes: hers covered while she counts, his while he counts at the tree (a peek opens them for a moment).
    const counting = this.phase === 'intro' || this.phase === 'count'
    if (this.peekT >= 0) this.peekT -= dt
    this.cover += ((counting && this.peekT < 0 ? 1 : 0) - this.cover) * ease(dt, 10)
    if (this.dad.peekT >= 0) this.dad.peekT -= dt
    const dadCounting = this.phase === 'dadcount' && !this.dad.path.length && this.dad.peekT < 0
    this.dad.cover += ((dadCounting ? 1 : 0) - this.dad.cover) * ease(dt, 8)
    this.point += (this.pointGoal - this.point) * ease(dt, 9)
    void t
  }

  private toCount() {
    this.setPhase('count')
    this.target = null
    this.walkTo = null
    this.kaylee.steer(0, 0, 0, this.free)
    this.glowing = false
    // Dad runs off to his hiding place while she counts.
    const def = BYID[this.hide]
    const to = this.dadPoint(def)
    this.dad.hidden = false
    this.dad.pose = 'stand'
    this.dadWalk([this.approach(def), { x: to.x, z: to.z }], 4.2)
  }
  /** The way to a hiding place from up the beach (so he goes round the front of it, not through it). */
  private approach(def: SpotDef): XZ {
    const p = this.lookPoint(def)
    return { x: p.x, z: p.z }
  }

  /** Dad in his hiding place, posed (the count is over: wherever he got to, he's there now). */
  private placeDadHidden() {
    const def = BYID[this.hide]
    const p = this.dadPoint(def)
    this.dad.path = []
    this.dad.hop = null
    this.dad.x = p.x
    this.dad.z = p.z
    this.dad.pose = def.dad.pose
    this.dad.hidden = !!def.dad.hidden
    // Facing up the beach (peeking out at her), except lying in the roots (along the beach).
    this.dad.yaw = def.id === 'roots' ? this.seaYaw + Math.PI / 2 : this.seaYaw + Math.PI
    this.towelParts.lump.visible = def.id === 'towel'
    this.towelParts.lump.scale.setScalar(1)
    this.towelParts.toes.visible = def.id === 'towel'
    this.cap.visible = def.id === 'sea'
  }

  private found(came = false) {
    const def = BYID[this.hide]
    this.counts.finds++
    if (came) this.counts.cameOver++

    const k = this.kaylee.root.position
    // He jumps out (the towel flies off, the sea splashes, the pandanus shakes) and lands beside her.
    if (def.id === 'towel' && this.poppedT === -1) this.towelLift = 0
    if (def.id === 'sea' && this.poppedT === -1) {
      sfx.splash()
      this.spray.burst(this.dad.x, 0.1, this.dad.z, 26, 2.4, 3.4, 0.16)
    }
    this.shake(def.id, 1)
    const from = new Vector3(this.dad.x, this.dadY(), this.dad.z)
    this.cap.visible = false
    this.dad.hidden = false
    const side = this.local(k.x, k.z)
    const to = this.L(side.u + (side.u > def.u ? -0.95 : 0.95), side.v + 0.35)
    this.dad.pose = 'stand'
    this.dad.hop = { from, to, t: 0, dur: SEEK.hop }
    this.setPhase('found')
    this.glowing = false
    this.say(came ? H.peekaboo : H.found[this.turn.found++ % H.found.length])
    sfx.found()
    // (Peekaboo, who knew all along: a flash and a giggle.)
    this.peeka.flash()
    this.peeka.sparkle(18)
    this.peeka.wiggle()
    fireflySfx.giggle('hideseek')
    window.setTimeout(() => sfx.fanfare(), 350)
    this.kaylee.faceToward(to.x, to.z)
    window.setTimeout(() => {
      if (this.phase !== 'found') return
      this.kaylee.twirl()
      this.nick.react('hop')
      this.sparkle.burst(k.x, k.y + 0.8, k.z, 36, 2.2, 2.2, 0.12)
    }, (SEEK.hop + 0.1) * 1000)
  }

  /** Stuck for a while, the help rises a level: 1 he peeks out (a rustle, his head pops up, a giggle or a splash), 2 a
   *  big sneeze and his place glows (the finger points at it), 3 he jumps out and waves: "Here I am!". */
  private help(lvl: number) {
    this.counts.giveaways++
    this.helpLvl = lvl
    this.rustleT = 0
    const id = this.hide
    const p = this.dadPoint(BYID[id])
    if (lvl === 3) return this.popOut()
    this.shake(id, lvl === 1 ? 1.2 : 1.8)
    sfx.rustle()
    this.puffs.burst(p.x, p.y + 0.4, p.z, lvl === 1 ? 6 : 12, 0.8, 1, 0.08)
    if (lvl === 1) {
      // A peek: he pops up for a moment (the cap bobs up out of the sea, the towel lump sits up).
      this.dad.peekT = 0.9
      this.nick.react('hop')
      if (id === 'sea') {
        this.bubbles.burst(this.dad.x, 0.05, this.dad.z, 16, 0.6, 1.4, 0.1)
        sfx.splash()
      } else sfx.giggle()
      this.say(H.hehe)
      // Peekaboo comes out of his hiding place and stays out, twinkling over him: the hint she can see from anywhere
      // on the beach. Sparkle says what it means the first time.
      this.peeka.flash()
      this.peeka.sparkle(22)
      fireflySfx.chime('hideseek')
      if (!this.pk.knew) {
        this.pk.knew = true
        this.say(S.knows)
      }
    } else {
      this.glowing = true
      this.say(H.achoo)
      this.peeka.flash()
      this.peeka.sparkle(22)
      this.peeka.wiggle(0.9)
      fireflySfx.chime('hideseek')
    }
  }
  /** Help 3: he jumps out of his hiding place, in front of it, and waves (a tap on him finds him at once). */
  private popOut() {
    const def = BYID[this.hide]
    this.counts.popOuts++
    this.glowing = true
    if (def.id === 'towel') this.towelLift = 0
    if (def.id === 'sea') {
      sfx.splash()
      this.spray.burst(this.dad.x, 0.1, this.dad.z, 20, 2.2, 3, 0.15)
    }
    this.shake(def.id, 1.6)
    const from = new Vector3(this.dad.x, this.dadY(), this.dad.z)
    this.cap.visible = false
    this.dad.hidden = false
    this.poppedT = 0
    const to = def.id === 'sea' ? this.L(def.u, 3.2) : this.L(def.u + def.dad.du * 0.5, def.v - (this.things.get(def.id)!.r + 0.9))
    this.dad.pose = 'stand'
    this.dad.yaw = this.seaYaw + Math.PI
    this.dad.hop = { from, to, t: 0, dur: SEEK.hop }
    this.say(H.here)
    sfx.here()
    window.setTimeout(() => {
      if (this.phase === 'seek' && this.poppedT >= 0) this.nick.react('wave')
    }, (SEEK.hop + 0.1) * 1000)
  }

  /** She peeked behind the wrong place: a silly little something there, and Dad giggles from his real one. */
  private wrongPeek(id: SpotId) {
    this.counts.wrong++
    const t = this.things.get(id)!
    this.kaylee.showOff('peek')
    this.shake(id, 0.9)
    if (id === 'chairs') sfx.clatter()
    else if (id === 'pandanus' || id === 'tree' || id === 'roots') sfx.rustle()
    else if (id === 'sea') {
      sfx.splash()
      this.spray.burst(t.x, 0.1, t.z, 16, 1.8, 2.6, 0.14)
    } else if (id === 'towel') {
      sfx.fwip()
      this.towelParts.flat.rotation.z = 0.3
    } else sfx.boing()
    // (Sparkle says so now and then, not at every peek.)
    if (this.time - this.notHereAt > 6) {
      this.notHereAt = this.time
      this.say(H.notHere[this.turn.notHere++ % H.notHere.length])
    }
    // A giggle from where he really is: a clue.
    window.setTimeout(() => {
      if (this.phase !== 'seek') return
      this.shake(this.hide, 0.7)
      sfx.giggle()
      this.twinkle()
    }, 900)
  }

  // ---- Her turn to hide.

  private toDadCount() {
    this.setPhase('dadcount')
    this.looks = []
    this.pk.tucked = false
    this.hiddenAt = null
    this.kWhere = 'open'
    this.towelParts.lump.visible = false
    this.towelParts.toes.visible = false
    this.kaylee.root.visible = true
    this.cap.visible = false
    this.dad.hidden = false
    this.dad.pose = 'stand'
    // Back to the tree to count, facing it.
    const p = this.L(TREE.u + 0.15, TREE.v - 1.5)
    this.dadWalk([{ x: p.x, z: p.z }], 2.6, () => {
      this.dad.yaw = this.seaYaw
    })
  }

  /** Is Kaylee in this hiding place (close to where she'd crouch)? */
  private inHiding(id: SpotId) {
    const k = this.kaylee.root.position
    if (id === 'sea') return this.local(k.x, k.z).v > 1.4
    const p = this.kayPoint(BYID[id])
    return Math.hypot(p.x - k.x, p.z - k.z) < DAD.hideR
  }
  private whereIsShe(): SpotId | 'open' {
    let best: SpotId | 'open' = 'open'
    let bd = Infinity
    const k = this.kaylee.root.position
    for (const def of SPOTS) {
      // (Her turn: the roots are the tree's, she hides behind its trunk.)
      if (def.id === 'roots') continue
      if (!this.inHiding(def.id)) continue
      const p = def.id === 'sea' ? k : this.kayPoint(def)
      const d = Math.hypot(p.x - k.x, p.z - k.z)
      if (d < bd) {
        bd = d
        best = def.id
      }
    }
    return best
  }
  /** While Dad counts or searches: standing still in a hiding place, she crouches in it. */
  private settleHiding() {
    const where = this.whereIsShe()
    if (this.hiddenAt && where !== this.hiddenAt) {
      // She came out.
      this.hiddenAt = null
      this.towelParts.lump.visible = false
      this.kaylee.root.visible = true
    }
    if (where === 'open' || this.finger || this.target || this.kaylee.walking || this.hiddenAt === where) return
    this.hiddenAt = where
    this.counts.hides++
    sfx.giggle()
    if (where === 'sea' || where === 'palmL' || where === 'palmR') {
      // A silly place (a palm thinner than her, the open sea): Mom giggles, and Dad still won't find her (he looks
      // the wrong way right beside her).
      this.counts.sillyHides++
      this.ji.react('wave')
      sfx.giggle(0.25)
      this.say(H.silly[this.turn.silly++ % H.silly.length])
    }
    if (where === 'sea') return
    const p = this.kayPoint(BYID[where])
    this.kaylee.walk([[p.x, p.z]], () => {
      if (this.hiddenAt !== where) return
      this.kaylee.face(this.seaYaw + Math.PI)
      this.kaylee.setPose('sit')
      if (where === 'pandanus') {
        // Up into its leaves (where Dad hid): underfoot() lifts her.
        const d = this.dadPoint(BYID.pandanus)
        this.kaylee.root.position.x = d.x
        this.kaylee.root.position.z = d.z
        sfx.rustle()
      }
      if (where === 'towel') {
        // Under the towel: a little lump (her horn's just a bump).
        this.towelParts.lump.visible = true
        this.towelParts.lump.scale.set(0.7, 0.75, 0.6)
        this.kaylee.root.visible = false
      }
    })
  }

  private startSearch() {
    this.setPhase('search')
    this.kWhere = this.whereIsShe()
    this.lookT = 0
    const k = this.kaylee.root.position
    if (this.kWhere === 'open' && this.openFinds === 0) {
      // Right there in the open: he spins round and sees her (only ever once in a row).
      this.looks = [{ x: k.x, z: k.z, at: null }]
    } else {
      // The wrong places first: the ones furthest from her, then one right next to her (looking the wrong way).
      const mine = this.kWhere
      const near = (id: SpotId) => {
        const p = this.kayPoint(BYID[id])
        return Math.hypot(p.x - k.x, p.z - k.z)
      }
      const others = SPOTS.map((s) => s.id).filter((id) => id !== mine && !(mine === 'tree' && id === 'roots') && !(mine === 'roots' && id === 'tree') && id !== 'sea')
      others.sort((a, b) => near(b) - near(a))
      const n = Math.max(1, Math.round(DAD.looks))
      const pick = others.slice(0, n - 1).concat(others[others.length - 1])
      // Walk them in an order that doesn't zig-zag: furthest first, the one beside her last.
      this.looks = pick.map((id, i) => {
        const p = this.lookPoint(BYID[id])
        return { x: p.x, z: p.z, at: id, wrongWay: i === pick.length - 1 }
      })
    }
    this.nextLook()
  }
  private nextLook() {
    const look = this.looks[0]
    if (!look) return
    if (look.at === null) {
      const k = this.kaylee.root.position
      this.dadWalk([{ x: k.x + (this.dad.x - k.x) * 0.25, z: k.z + (this.dad.z - k.z) * 0.25 }], DAD.walk * 1.5)
      return
    }
    const at = look.at
    this.dadWalk([{ x: look.x, z: look.z }], DAD.walk, () => {
      if (this.phase !== 'search') return
      const t = this.things.get(at)!
      // Peek: he leans in and looks round (the wrong way, next to her).
      this.nick.react('wiggle')
      this.shake(at, 0.6)
      sfx.hmm()
      this.dad.yaw = look.wrongWay ? this.seaYaw + Math.PI : Math.atan2(t.x - this.dad.x, t.z - this.dad.z)
      this.say(look.wrongWay ? H.wrongWay : at === 'mommy' ? H.mommy : H.look[this.turn.look++ % H.look.length])
      if (at === 'chairs') sfx.clatter()
    })
  }

  private caught() {
    this.counts.caught++
    // (Any catch, in the open or wandering out of hiding, counts: he never finds her twice in a row.)
    this.openFinds++
    this.setPhase('caught')
    this.looks = []
    this.hiddenAt = null
    this.towelParts.lump.visible = false
    this.kaylee.root.visible = true
    const k = this.kaylee.root.position
    this.dad.path = []
    this.dad.yaw = Math.atan2(k.x - this.dad.x, k.z - this.dad.z)
    this.nick.react('hop')
    this.say(H.spotted[this.turn.spotted++ % H.spotted.length])
    sfx.found()
    this.kaylee.twirl()
    sfx.giggle(0.2)
    this.sparkle.burst(k.x, k.y + 0.8, k.z, 20, 1.6, 1.8, 0.1)
  }

  private win() {
    this.wins++
    this.counts.wins++
    this.openFinds = 0
    // The end of the stop: Peekaboo is found (a film), then the island. Once she's found, a win is just a win.
    if (!this.had) return this.playFound()
    this.setPhase('win')
    this.looks = []
    this.peeka.flash()
    fireflySfx.giggle('hideseek')
    const k = this.kaylee.root.position
    // She pops out: the towel flies, she hops and twirls, everyone cheers.
    if (this.hiddenAt === 'towel') this.towelLift = 0
    this.hiddenAt = null
    this.kaylee.root.visible = true
    this.kaylee.setPose('stand')
    this.kaylee.twirl()
    this.say(H.win)
    // (Sparkle's cheer only for the first win of a visit.)
    if (this.wins === 1) this.say(H.first)
    sfx.fanfare()
    this.sparkle.burst(k.x, k.y + 0.9, k.z, 60, 2.8, 2.8, 0.14)
    this.dad.yaw = Math.atan2(k.x - this.dad.x, k.z - this.dad.z)
    this.nick.react('wave')
    this.ji.react('wave')
    this.events.won(this.wins === 1, true)
  }

  private boo() {
    this.counts.boos++
    sfx.boo()
    this.say(H.boo)
    this.nick.react('hop')
    this.puffs.burst(this.dad.x, this.dadY() + 0.2, this.dad.z, 10, 1.4, 1.6, 0.1)
    window.setTimeout(() => {
      if (this.phase === 'search' || this.phase === 'giveup') this.win()
    }, 500)
  }

  // ---------------------------------------------------------------- Peekaboo in play

  /** Peekaboo pops out of Dad's hiding place for a moment: a twinkle she can spot from across the beach. */
  private twinkle() {
    if (this.pk.outT <= 0) this.pk.twinkles++
    this.pk.outT = PEEKA.out
    this.pk.nextT = PEEKA.every
    this.peeka.flash()
    this.peeka.sparkle()
  }

  /** Every frame of play: where Peekaboo is and how bright. Rounds 1 and 2: she trails Dad as he runs off, tucks in
   *  beside him as a tiny glow and peeks out of his hiding place now and then; from help 1 on she stays out, twinkling
   *  over him. Her turn: she keeps by your unicorn's shoulder, and tucks in beside her in a hiding place. */
  private peekabooPlay(dt: number) {
    const pk = this.pk
    const p = this.peeka
    const k = this.kaylee.root.position
    const f = FRAMES.prao
    const size = PEEKA.size
    const overDad = () => tmp.set(this.dad.x, Math.max(this.dadY(), this.groundY(this.dad.x, this.dad.z) - 0.4) + this.nick.height + 0.95, this.dad.z)
    switch (this.phase) {
      case 'intro':
        // (Where the way-in film leaves her: peeking round the trunk.)
        p.go(this.trunkSide(-1, 1, 1.9, tmp), 4)
        p.show(size)
        break
      case 'count':
      case 'found':
        p.go(overDad(), this.phase === 'found' ? 6 : 3.5)
        p.show(size)
        break
      case 'seek': {
        if (this.poppedT !== -1) {
          // He's out and waving: she's over his head.
          p.go(overDad(), 6)
          p.show(size)
          break
        }
        const def = BYID[this.hide]
        const at = this.dadPoint(def)
        const top = (def.id === 'sea' ? this.water(at.x, at.z) : at.y) + TWINKLE_Y[def.id]
        const stay = this.helpLvl >= 1
        if (!stay) {
          pk.outT -= dt
          if ((pk.nextT -= dt) <= 0) this.twinkle()
        }
        const out = stay || pk.outT > 0
        // Out: over his hiding place (a slow circle once she's out for good). In: down beside him, a tiny glow.
        const a = this.time * 2.2
        if (out) tmp.set(at.x + (stay ? Math.sin(a) * 0.3 : 0), top + (stay ? Math.sin(a * 2) * 0.1 : 0), at.z + (stay ? Math.cos(a) * 0.3 : 0))
        else tmp.set(at.x + f.n.x * 0.15, top - 0.7, at.z + f.n.z * 0.15)
        p.go(tmp, out ? 7 : 5)
        if (stay && Math.random() < dt * 1.6) p.sparkle(3)
        p.show(out ? size : size * 0.55, out ? 1 : PEEKA.tiny)
        break
      }
      default: {
        // Her turn: by your unicorn's shoulder; tucked in beside her (a tiny glow) once she's in a hiding place.
        const hid = !!this.hiddenAt && this.phase !== 'win' && this.phase !== 'caught'
        if (hid && !pk.tucked) {
          pk.tucks++
          fireflySfx.chime('hideseek', 0.025)
          if (!pk.shushed) {
            pk.shushed = true
            this.say(S.shh)
          }
        }
        pk.tucked = hid
        if (hid) tmp.set(k.x + f.t.x * 0.5, k.y + (this.hiddenAt === 'sea' ? 0.95 : 0.38), k.z + f.t.z * 0.5)
        else tmp.set(k.x + f.t.x * 0.42, k.y + this.kaylee.height + 0.5, k.z + f.t.z * 0.42)
        p.go(tmp, hid ? 6 : 4)
        p.show(hid ? size * 0.55 : size, hid ? PEEKA.tiny : 1)
      }
    }
  }

  // ---------------------------------------------------------------- the films (docs/films.md)

  /** A point `back` meters up the beach from `p` (the films' cameras look out to sea, like the game's), `up` meters
   *  higher and `along` meters along the beach. */
  private upBeach(p: Vector3, back: number, up = 0, along = 0): FV3 {
    const f = FRAMES.prao
    return [p.x - f.n.x * back + f.t.x * along, p.y + up, p.z - f.n.z * back + f.t.z * along]
  }
  /** The way to face the films' camera, turned a little toward someone else (cheated to the camera: a chibi head in
   *  profile reads as the back of a head). */
  private cheat(from: Vector3, other: Vector3) {
    const f = FRAMES.prao
    const s = Math.sign((other.x - from.x) * f.t.x + (other.z - from.z) * f.t.z)
    return Math.atan2(-f.n.x * 3 + f.t.x * s * 0.95, -f.n.z * 3 + f.t.z * s * 0.95)
  }

  /** `round=story`: the way in. They're watching the driftwood tree (their backs to the beach) when the light shows. */
  private stageStory() {
    this.hide = 'tree'
    this.setPhase('film')
    const k = this.kStart()
    const d = this.dStart()
    this.kaylee.place(k.x, k.y, k.z, this.seaYaw * DEG)
    this.setDad(d.x, d.z, this.seaYaw, 'stand')
    this.peeka.place(this.trunkSide(1, 0))
    this.peeka.snap(FILM.size, FILM.glow, FILM.cloud)
    this.after(0.3, () => this.films.play(this.storyFilm(), () => this.startRound('1', false, true)))
  }

  /** The way-in film: a green light peeks round the trunk, giggles, ducks behind it and peeks out the other side (a
   *  close shot, no words); Dad saw it, Mom knows the game, "Then let's play too!". It leaves the beach as round 1
   *  starts: the photo (your unicorn in front of the tree, Dad by it), Peekaboo peeking over their heads. */
  private storyFilm(): Film {
    const p = this.peeka
    const k0 = this.kStart()
    const d0 = this.dStart()
    const mid = k0.clone().lerp(d0, 0.5)
    const A = this.trunkSide(1, 0.84)
    const hidA = this.trunkSide(1, 0)
    const B = this.trunkSide(-1, 0.84)
    const hidB = this.trunkSide(-1, 0)
    const low = this.trunkSide(-1, 0.86, 1.9)
    const hidLow = this.trunkSide(-1, 0, 1.9)
    const wide = this.trunkSide(1, 0.4, 1.45)
    // (The two-shots sit a little along the beach, so the root in front of Dad is out of his way.)
    const twoEye = this.upBeach(mid, 4.7, 1.3, 1.1)
    const twoLook: FV3 = [mid.x, mid.y + 1.05, mid.z]
    const mom = this.ji.root.position
    const momEye: FV3 = [mom.x + Math.sin(MOMMY_FACE - 0.3) * 3.7, mom.y + 1.3, mom.z + Math.cos(MOMMY_FACE - 0.3) * 3.7]
    const watchHer = () => {
      const q = p.pos
      this.kaylee.lookAt(q.x, q.y, q.z)
      this.nick.lookAt(q.x, q.y, q.z)
      this.ji.lookAt(q.x, q.y, q.z)
    }
    // Talking out front: Dad to a point just in front of your unicorn, she to the camera, Mom to hers.
    const talk = () => {
      this.kaylee.lookAt(...twoEye)
      this.nick.lookAt(k0.x - FRAMES.prao.n.x * 2.2, k0.y + 1, k0.z - FRAMES.prao.n.z * 2.2)
      this.ji.lookAt(...momEye)
    }
    return {
      id: 'story',
      beats: [
        {
          id: 'peek',
          dur: 3.0,
          // The two of them at the tree, from behind and a little along the beach (so Dad isn't between the camera and
          // the light): something green at the trunk.
          shot: { eye: this.upBeach(wide, 8.4, 1.9, 3.0), look: [wide.x, wide.y + 0.1, wide.z], fov: 32, to: { eye: this.upBeach(wide, 7.6, 1.8, 2.8) }, ease: 'out' },
          start: () => {
            p.place(hidA)
            p.snap(FILM.size * 1.5, 1, 0.8)
            this.filmPose = watchHer
          },
          cues: [
            [0.55, () => (p.go(A, 7), p.flash(), p.sparkle(), fireflySfx.chime('hideseek'))],
            [1.25, () => (p.wiggle(), fireflySfx.giggle('hideseek'))],
            [2.2, () => p.go(hidA, 8)],
          ],
        },
        {
          // The other side, close: her face and her glow.
          id: 'other',
          dur: 3.3,
          shot: { eye: this.upBeach(B, 2.5, 0.1, -0.22), look: [B.x, B.y, B.z], fov: 30, to: { eye: this.upBeach(B, 2.1, 0.08, -0.22) }, ease: 'out' },
          start: () => {
            p.place(hidB)
            p.snap(FILM.size * 1.15, FILM.glow, FILM.cloud)
          },
          cues: [
            [0.5, () => (p.go(B, 6), p.sparkle(10))],
            [1.3, () => (p.wiggle(0.7), fireflySfx.giggle('hideseek'))],
            [2.5, () => p.wiggle(0.4)],
          ],
        },
        {
          id: 'saw',
          say: S.saw,
          sayAt: 0.55,
          shot: { eye: twoEye, look: twoLook, fov: 32 },
          start: () => {
            // (Under the cut they've turned round to the beach; Peekaboo peeks over their heads.)
            this.kaylee.place(k0.x, k0.y, k0.z, this.cheat(k0, d0) * DEG)
            this.setDad(d0.x, d0.z, this.cheat(d0, k0), 'stand')
            p.place(hidLow)
            p.snap(FILM.size, FILM.glow, FILM.cloud)
            p.go(low, 5)
            this.pointGoal = 1
            this.nick.react('hop')
            this.filmPose = talk
          },
          cues: [[1.7, () => this.kaylee.react('hop')]],
        },
        {
          id: 'playing',
          say: S.playing,
          sayAt: 0.4,
          shot: { eye: momEye, look: () => this.headOf(this.ji, tmp), fov: 28, sway: 0.015 },
          start: () => {
            this.pointGoal = 0
            this.ji.react('wave')
          },
        },
        {
          id: 'too',
          say: S.too,
          sayAt: 0.35,
          hold: 0.75,
          shot: { eye: this.upBeach(mid, 4.1, 1.25, 1.0), look: twoLook, fov: 32 },
          start: () => this.nick.react('hop'),
          cues: [
            [0.9, () => this.kaylee.showOff('cheer')],
            [1.3, () => (p.wiggle(), p.sparkle(), fireflySfx.giggle('hideseek'))],
          ],
        },
      ],
      finish: () => {
        const inl = this.seaYaw + Math.PI
        this.filmPose = null
        this.pointGoal = 0
        // (She never leaves her mark in this film: she only turns back to the beach, the way the photo has her.)
        this.kaylee.face(inl)
        this.dad.path = []
        this.dad.hop = null
        this.onArrive = null
        this.setDad(d0.x, d0.z, inl, 'stand')
        p.go(low, 5)
        p.show(PEEKA.size)
      },
    }
  }

  /** `round=found`: where the stop ends. She's crouched behind the driftwood tree with Peekaboo; Dad has given up. */
  private stageFound() {
    this.setPhase('film')
    this.hiddenAt = 'tree'
    const kp = this.kayPoint(BYID.tree)
    this.kaylee.place(kp.x, kp.y, kp.z, (this.seaYaw + Math.PI) * DEG)
    this.kaylee.setPose('sit')
    this.kY = kp.y
    this.lastPos.copy(kp)
    const d = this.L(TREE.u - 3.6, TREE.v - 3)
    this.setDad(d.x, d.z, this.seaYaw + Math.PI, 'stand')
    this.pk.tucked = true
    this.peeka.place(tmp.set(kp.x + FRAMES.prao.t.x * 0.5, kp.y + 0.38, kp.z + FRAMES.prao.t.z * 0.5))
    this.peeka.snap(PEEKA.size * 0.55, PEEKA.tiny)
    this.after(0.4, () => this.playFound())
  }

  /** She has won her turn to hide: the found film, then the island with Peekaboo. */
  private playFound() {
    if (this.round !== 'found') {
      this.round = 'found'
      this.events.round('found')
    }
    this.setPhase('film')
    this.finger = null
    this.target = null
    this.walkTo = null
    this.kaylee.steer(0, 0, 0, this.free)
    this.looks = []
    this.dad.path = []
    this.onArrive = null
    this.films.play(this.foundFilm(), () => this.events.island(), this.rig.camera)
  }

  /** Where the found film plays: your unicorn's mark, just out of wherever she hid (in front of it, up the beach; beside
   *  it for the places at the back of the beach, so the camera stays on the sand), and Dad's beside her on the side
   *  with room (`s`: which way along the beach). */
  private foundMarks() {
    const k = this.kaylee.root.position
    const me = this.local(k.x, k.z)
    let u = me.u
    let v = Math.min(me.v, 0.4)
    const hid = this.hiddenAt
    if (hid && hid !== 'sea') {
      const def = BYID[hid]
      const r = this.things.get(hid)!.r
      if (hid === 'tree') {
        // (Round the trunk, not through it.)
        u = def.u - 1.9
        v = def.v - 2.3
      } else if (def.v < -8) {
        u = def.u + (def.u < 2 ? 1 : -1) * (r + 1.15)
        v = def.v + 0.35
      } else {
        u = def.u + def.kay.du
        v = def.v - (r + 1.05) - (hid === 'towel' ? 0.55 : 0)
      }
    }
    u = clamp(u, BOUNDS.u0 + 2.5, BOUNDS.u1 - 2.5)
    v = clamp(v, BOUNDS.v0 + 1, 0.4)
    const clear = (uu: number, vv: number) => {
      const q = atFrame(FRAMES.prao, uu, vv)
      for (const t of this.things.values()) if (t.r > 0 && Math.hypot(q.x - t.x, q.z - t.z) < t.r + 0.6) return false
      return true
    }
    // (Toward the middle of the beach first.)
    const first = u < 2 ? 1 : -1
    const s = clear(u + first * 1.35, v + 0.1) ? first : clear(u - first * 1.35, v + 0.1) ? -first : first
    return { k: this.L(u, v), d: this.L(u + s * 1.35, v + 0.1), s }
  }

  /** She pops out of wherever she hid (the towel flies off) and leaps to her mark, turning to the beach. */
  private leapOut(to: Vector3, yaw: number) {
    if (this.hiddenAt === 'towel') this.towelLift = 0
    this.hiddenAt = null
    this.kWhere = 'open'
    this.pk.tucked = false
    this.kaylee.stop()
    this.kaylee.root.visible = true
    this.kaylee.setPose('stand')
    this.kaylee.hopTo(to, 0.6, 1.2, () => {
      this.kaylee.face(yaw)
      this.kaylee.twirl()
    })
    this.kaylee.face(yaw)
  }

  /** The found film: she pops out and Peekaboo pops out with her ("You win!"), Peekaboo lands on Dad's nose and he goes
   *  cross-eyed (a close shot), then she flies to your unicorn's horn: found. It leaves them side by side on the sand,
   *  Peekaboo out and bright; then the island (`events.island`). */
  private foundFilm(): Film {
    const f = FRAMES.prao
    const p = this.peeka
    const m = this.foundMarks()
    const yawK = this.cheat(m.k, m.d)
    const yawD = this.cheat(m.d, m.k)
    const mid = m.k.clone().lerp(m.d, 0.5)
    const front = this.upBeach(mid, 4, 1.3)
    // Dad's face on his mark (he stands still there once he's hopped over): his head and the tip of his nose.
    const headH = this.headOf(this.nick).y - this.nick.root.position.y
    const R = this.nick.rig.face.R
    const head = new Vector3(m.d.x, m.d.y + headH, m.d.z)
    const nose: FV3 = [head.x + Math.sin(yawD) * R, head.y - R * 0.1, head.z + Math.cos(yawD) * R]
    const noseEye = this.upBeach(head, 2.9, 0.06, -m.s * 0.2)
    const lookOut = () => {
      const k = this.kaylee.root.position
      this.kaylee.lookAt(...front)
      this.nick.lookAt(...front)
      this.ji.lookAt(k.x, k.y + 0.6, k.z)
    }
    return {
      id: 'found',
      beats: [
        {
          id: 'pop',
          say: H.win,
          sayAt: 0.75,
          dur: 2.7,
          shot: { eye: this.upBeach(m.k, 5.0, 1.9, m.s * 0.8), look: [m.k.x + f.t.x * m.s * 0.6, m.k.y + 0.85, m.k.z + f.t.z * m.s * 0.6], fov: 36, blend: 0.7, to: { eye: this.upBeach(m.k, 4.2, 1.6, m.s * 0.8) } },
          start: () => {
            this.leapOut(m.k, yawK)
            // Dad jumps over to her in surprise.
            const from = new Vector3(this.dad.x, this.dadY(), this.dad.z)
            this.dad.pose = 'stand'
            this.dad.hidden = false
            this.dad.yaw = yawD
            this.dad.hop = { from, to: m.d.clone(), t: 0, dur: 0.6 }
            // Peekaboo pops out with her, on her far side from Dad.
            this.filmPose = () => {
              const k = this.kaylee.root.position
              lookOut()
              p.go(tmp.set(k.x - f.t.x * m.s * 0.5, k.y + this.kaylee.height + 0.35, k.z - f.t.z * m.s * 0.5), 8)
            }
            p.show(FILM.size, FILM.glow, FILM.cloud)
            p.sparkle(16)
            fireflySfx.giggle('hideseek')
            sfx.fanfare()
            this.ji.react('wave')
          },
          cues: [
            [
              0.65,
              () => {
                this.sparkle.burst(m.k.x, m.k.y + 0.9, m.k.z, 50, 2.6, 2.6, 0.13)
                this.nick.react('hop')
              },
            ],
          ],
        },
        {
          // Close on Dad: she lands on his nose and he goes cross-eyed.
          id: 'nose',
          say: S.nose,
          sayAt: 1.0,
          dur: 3.3,
          shot: { eye: noseEye, look: [nose[0], nose[1] + R * 0.12, nose[2]], fov: 28, to: { eye: this.upBeach(head, 2.55, 0.05, -m.s * 0.2) }, sway: 0.012 },
          start: () => {
            // (On his nose she's small and her glow nearly out, so his face and his crossed eyes show.)
            p.show(0.72, 0.1, 0.2)
            this.filmPose = () => {
              this.nick.lookAt(...noseEye)
              this.kaylee.lookAt(...nose)
              p.go(this.dadNose(tmp), 9)
            }
          },
          cues: [
            [0.5, () => (this.cross.on(true), p.sparkle(8), fireflySfx.chime('hideseek'), this.nick.react('wiggle'), sfx.boing())],
            [2.3, () => (this.nick.react('wiggle'), p.wiggle(0.5))],
          ],
        },
        {
          // Off his nose and over to your unicorn's horn: found.
          id: 'found',
          say: S.found,
          sayAt: 0.85,
          hold: 0.8,
          dur: 3.2,
          shot: { eye: this.upBeach(mid, 4.5, 1.35), look: [mid.x, mid.y + 0.95, mid.z], fov: 32, to: { eye: this.upBeach(mid, 3.9, 1.3) } },
          start: () => {
            p.show(FILM.size * 0.95, FILM.glow, FILM.cloud)
            // (She circles over the tip of the horn, clear of your unicorn's face.)
            this.filmPose = () => {
              const h = this.horn(tmp2)
              const a = this.time * 3.2
              lookOut()
              p.go(tmp.set(h.x + Math.sin(a) * 0.3, h.y + 0.22 + Math.sin(a * 2) * 0.05, h.z + Math.cos(a) * 0.3), 6)
            }
          },
          cues: [
            [0.45, () => this.cross.on(false)],
            [0.7, () => (p.sparkle(20), fireflySfx.found('hideseek'))],
            [
              1.0,
              () => {
                const k = this.kaylee.root.position
                this.sparkle.burst(k.x, k.y + 1, k.z, 60, 2.8, 2.8, 0.14)
                this.kaylee.showOff('cheer')
                this.nick.react('wave')
                this.ji.react('wave')
                this.events.won(true, false)
              },
            ],
          ],
        },
      ],
      finish: () => {
        this.filmPose = null
        this.cross.on(false)
        this.hiddenAt = null
        this.kWhere = 'open'
        this.pk.tucked = false
        this.kaylee.root.visible = true
        this.kaylee.setPose('stand')
        this.kaylee.place(m.k.x, m.k.y, m.k.z, yawK * DEG)
        this.kY = m.k.y
        this.lastPos.copy(m.k)
        this.dad.path = []
        this.dad.hop = null
        this.onArrive = null
        this.setDad(m.d.x, m.d.z, yawD, 'stand')
        p.show(PEEKA.size)
        // (If nothing takes her to the island, her turn goes on: Dad counts again in a moment.)
        this.round = 'hide'
        this.setPhase('win')
      },
    }
  }

  // ---------------------------------------------------------------- Dad moving

  private setDad(x: number, z: number, yaw: number, pose: DadPose) {
    this.dad.x = x
    this.dad.z = z
    this.dad.yaw = yaw
    this.dad.pose = pose
  }
  private dadWalk(path: XZ[], speed: number, done?: () => void) {
    this.dad.path = path.slice()
    this.dad.speed = speed
    this.dad.pose = 'stand'
    this.dad.hidden = false
    this.onArrive = done ?? null
  }
  private dadY() {
    const def = BYID[this.hide]
    const hiding = this.phase === 'seek' && !this.dad.path.length && !this.dad.hop && this.poppedT === -1
    const g = this.groundY(this.dad.x, this.dad.z)
    if (hiding && def.id === 'sea') return this.water(this.dad.x, this.dad.z) - this.nick.height * 0.97
    if (hiding && def.dad.y) return g + def.dad.y + this.peekLift()
    if (this.dad.pose === 'sit') return g + 0.02 + (hiding ? this.peekLift() : 0)
    return Math.max(g, -0.35) + (hiding ? this.peekLift() : 0)
  }
  /** Help 1, his peek: up out of his hiding place for a moment, and back down. */
  private peekLift() {
    return this.phase === 'seek' && this.dad.peekT > 0 ? Math.sin(Math.PI * clamp(this.dad.peekT / 0.9, 0, 1)) * 0.35 : 0
  }
  private moveDad(dt: number, t: number) {
    const d = this.dad
    let moving = false
    if (d.hop) {
      d.hop.t += dt / d.hop.dur
      const k = Math.min(1, d.hop.t)
      d.x = d.hop.from.x + (d.hop.to.x - d.hop.from.x) * k
      d.z = d.hop.from.z + (d.hop.to.z - d.hop.from.z) * k
      const y = d.hop.from.y + (d.hop.to.y - d.hop.from.y) * k + Math.sin(Math.PI * k) * 0.7
      if (k >= 1) d.hop = null
      this.nick.place(d.x, y, d.z, d.yaw * DEG, 'stand')
      this.nick.root.visible = true
      this.shadowAt(this.nShadow, d.x, d.z, 1 - Math.sin(Math.PI * k) * 0.4)
      return
    }
    if (d.path.length) {
      const p = d.path[0]
      const dx = p.x - d.x
      const dz = p.z - d.z
      const l = Math.hypot(dx, dz)
      const step = d.speed * dt
      if (l <= step) {
        d.x = p.x
        d.z = p.z
        d.path.shift()
        if (!d.path.length) {
          const cb = this.onArrive
          this.onArrive = null
          cb?.()
        }
      } else {
        d.x += (dx / l) * step
        d.z += (dz / l) * step
        const want = Math.atan2(dx, dz)
        d.yaw += angleTo(d.yaw, want) * ease(dt, 10)
        moving = true
      }
    }
    d.bob = moving ? Math.abs(Math.sin(t * 11)) * 0.07 : 0
    this.nick.place(d.x, this.dadY() + d.bob, d.z, d.yaw * DEG, d.path.length ? 'stand' : d.pose)
    this.nick.root.visible = !(d.hidden && !d.path.length)
    const y = this.dadY()
    this.shadowAt(this.nShadow, d.x, d.z, this.nick.root.visible && y > this.groundY(d.x, d.z) - 0.2 && y < this.groundY(d.x, d.z) + 0.6 ? 1 : 0)
    // The cap floating over him in the sea, bobbing.
    if (this.cap.visible) {
      const w = this.water(d.x, d.z)
      this.cap.position.set(d.x, w + 0.06 + Math.sin(t * 2.2) * 0.03 + this.peekLift(), d.z)
      this.cap.rotation.set(Math.sin(t * 1.7) * 0.12, t * 0.3, Math.cos(t * 1.3) * 0.1)
      if (Math.random() < dt * 0.8) this.bubbles.burst(d.x + 0.2, w, d.z, 2, 0.2, 0.6, 0.06)
    }
  }
  private shadowAt(s: Mesh, x: number, z: number, k: number) {
    s.position.set(x, Math.max(0, this.groundY(x, z)) + 0.02, z)
    s.visible = k > 0.05
    s.scale.setScalar(Math.max(0.05, k))
  }

  // ---------------------------------------------------------------- Kaylee

  private frozen() {
    return this.phase === 'film' || this.phase === 'intro' || this.phase === 'count'
  }
  private lead(dt: number) {
    const k = this.kaylee.root.position
    let goal: Vector3 | null = null
    if (!this.frozen()) {
      if (this.finger?.lead) goal = this.pick(this.finger.x, this.finger.y, tmp)
      else if (this.target) goal = this.target
    }
    if (goal && !this.kaylee.walking) {
      const dx = goal.x - k.x
      const dz = goal.z - k.z
      const d = Math.hypot(dx, dz)
      if (d < WALK.stopNear) {
        this.kaylee.steer(0, 0, 0, this.free)
        if (!this.finger?.lead) {
          this.target = null
          this.arrive()
        }
      } else {
        const run = smoothK(1.2, WALK.gallopFrom, d)
        const speed = WALK.trot + (WALK.gallop - WALK.trot) * run
        this.kaylee.pace = speed / 1.8
        // Something in the way: turn a little at a time until there's room, so she slides round it.
        let ux = dx / d
        let uz = dz / d
        const probe = 0.55
        if (!this.free(k.x + ux * probe, k.z + uz * probe)) {
          const side = this.lastTurn || 1
          for (const a of [0.35, -0.35, 0.7, -0.7, 1.05, -1.05, 1.4, -1.4, 1.75, -1.75]) {
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
        if (run > 0.9 && Math.random() < dt * 6) this.puffs.burst(k.x, this.kY + 0.05, k.z, 2, 1.0, 1.2, 0.09)
      }
    } else if (!goal && this.kaylee.steering) this.kaylee.steer(0, 0, 0, this.free)
    const moved = Math.hypot(k.x - this.lastPos.x, k.z - this.lastPos.z)
    this.speed = dt > 0 ? moved / dt : 0
    this.stuckT = this.target && !this.finger && moved < dt * 0.3 && !this.kaylee.walking ? this.stuckT + dt : 0
    if (this.stuckT > 0.6) {
      // Stuck against something on the way: she's as close as she gets.
      this.stuckT = 0
      this.target = null
      this.kaylee.steer(0, 0, 0, this.free)
      this.arrive()
    }
    this.lastPos.copy(k)
  }

  /** She got where a tap sent her: peek behind what she walked to. */
  private arrive() {
    const id = this.walkTo
    this.walkTo = null
    if (!id) return
    this.look(id)
  }
  private look(id: string) {
    if (id === 'family:nick') {
      if (this.phase === 'seek') return this.found()
      return
    }
    if (!id.startsWith('hide:')) return
    const sid = id.slice(5) as SpotId
    if (this.phase === 'seek') {
      if (sid === this.hide || (sid === 'tree' && this.hide === 'roots') || (sid === 'roots' && this.hide === 'tree')) return this.found()
      return this.wrongPeek(sid)
    }
    this.shake(sid, 0.7)
  }

  private underfoot(dt: number) {
    const k = this.kaylee.root.position
    const g = this.groundY(k.x, k.z)
    const wet = g < 0
    this.kY += (g - this.kY) * ease(dt, 16)
    // (Hiding: down in the sea to her head, or up in the pandanus's leaves like Dad.)
    const duck = this.hiddenAt === 'sea' ? 0.5 : this.hiddenAt === 'pandanus' && !this.kaylee.walking ? -1.55 : 0
    this.duck += (duck - this.duck) * ease(dt, 6)
    k.y = this.kY - this.duck
    this.shadowAt(this.kShadow, k.x, k.z, this.kaylee.root.visible ? 1 : 0)
    // Her hooves: in the sand, or splashing through the shallows (silent hidden, or sitting in a hiding place).
    if (this.speed > 0.5 && this.kaylee.root.visible && !this.hiddenAt) (wet ? sfx.wade : sfx.steps)(this.speed)
    if (wet && this.speed > 0.5 && Math.random() < dt * 8) this.spray.burst(k.x, Math.max(g, this.water(k.x, k.z)), k.z, 3, 1.2, 1.6, 0.08)
  }

  /** Hooves over the eyes: hers while she counts (the photo), his at the tree (after their own update each frame). */
  private poseCover() {
    const k = this.kaylee.rig
    const c = this.cover
    if (c > 0.001) {
      k.armL.rotation.x = 0.35 * c
      k.armL.rotation.z = -2.55 * c
      k.armR.rotation.x = 0.35 * c
      k.armR.rotation.z = 2.55 * c
      k.head.rotation.x += 0.2 * c
    } else if (this.cover !== 0) {
      this.cover = 0
      k.armL.rotation.set(0, 0, 0)
      k.armR.rotation.set(0, 0, 0)
    }
    const n = this.nick.rig
    const d = this.dad.cover
    if (d > 0.001) {
      n.armL.rotation.set(-2.5 * d, 0, 0.55 * d)
      n.armR.rotation.set(-2.5 * d, 0, -0.55 * d)
      n.head.rotation.x = 0.25 * d
    } else if (this.dad.cover !== 0) {
      this.dad.cover = 0
      n.armL.rotation.set(0, 0, 0)
      n.armR.rotation.set(0, 0, 0)
      n.head.rotation.x = 0
    }
    // Dad pointing back at the tree (the way-in film): one arm up and out at it, the other thrown up too.
    const p = this.point
    if (p > 0.001) {
      n.armR.rotation.set(0, 0, 2.15 * p)
      n.armL.rotation.set(0, 0, -1.7 * p)
    } else if (p !== 0) {
      this.point = 0
      n.armR.rotation.set(0, 0, 0)
      n.armL.rotation.set(0, 0, 0)
    }
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** The ground point under a screen point (the ray marched down onto the beach; the sea's top at sea). */
  private pick(x: number, y: number, out: Vector3): Vector3 | null {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const r = this.raycaster.ray
    let prev = 0
    for (let s = 1; s < 200; s += s < 40 ? 0.5 : 2) {
      r.at(s, out)
      if (out.y <= Math.max(0, this.groundY(out.x, out.z))) {
        let a = prev
        let b = s
        for (let i = 0; i < 6; i++) {
          const m = (a + b) / 2
          r.at(m, tmp2)
          if (tmp2.y <= Math.max(0, this.groundY(tmp2.x, tmp2.z))) b = m
          else a = m
        }
        r.at(b, out)
        return out
      }
      prev = s
    }
    return null
  }

  pointerDown(x: number, y: number, id?: string) {
    // (A film is on: the beach takes no taps; the screen's FilmOverlay sparkles where she touched.)
    if (this.phase === 'film') return
    this.lastTouch = this.time
    this.finger = { x, y, id, moved: false, lead: !id }
    if (!id) this.counts.leads++
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
    if (!f.moved && Math.hypot(x - downX, y - downY) > 12) {
      f.moved = true
      if (!f.lead) {
        f.lead = true
        this.counts.leads++
        this.target = null
        this.walkTo = null
      }
    }
  }
  pointerUp() {
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    if (this.phase === 'film') return
    this.lastTouch = this.time
    this.counts.taps++
    if (this.frozen()) return this.peek()
    if (id) return this.poke(id)
    // A tap on the sand: she walks there.
    const g = this.pick(x, y, new Vector3())
    if (!g) return
    const l = this.local(g.x, g.z)
    if (l.v > BOUNDS.v1 + 1) {
      // Out at sea: a splash where she tapped.
      sfx.splash()
      this.spray.burst(g.x, 0.1, g.z, 12, 1.6, 2.4, 0.13)
      return
    }
    this.target = g
    this.walkTo = null
  }

  /** While she counts: a peek through her hooves (Dad's still running). */
  private peek() {
    this.counts.peeks++
    this.peekT = 0.75
    sfx.giggle()
    this.events.peek()
  }

  private poke(id: string) {
    this.counts.pokes++
    const k = this.kaylee.root.position
    if (id === 'kaylee') {
      if (this.phase === 'search' && this.hiddenAt) return this.boo()
      this.kaylee.react('hop')
      sfx.giggle()
      return
    }
    if (id === 'family:nick') {
      if (this.phase === 'dadcount' && !this.dad.path.length) {
        // He peeks! Then back to counting.
        this.dad.peekT = 0.9
        this.dad.yaw = Math.atan2(k.x - this.dad.x, k.z - this.dad.z)
        this.say(H.peek)
        sfx.giggle()
        window.setTimeout(() => {
          if (this.phase === 'dadcount') this.dad.yaw = this.seaYaw
        }, 900)
        return
      }
      if (this.phase === 'seek' && this.poppedT !== -1) return this.found()
      if (this.phase === 'seek') return this.goLook('family:nick')
      this.nick.react('hop')
      sfx.boing()
      return
    }
    if (id === 'family:ji') {
      if (this.phase === 'dadcount' || (this.phase === 'search' && !this.hiddenAt)) {
        // Off to hide behind Mom.
        this.target = this.kayPoint(BYID.mommy)
        this.walkTo = null
        this.ji.react('wave')
        return
      }
      this.ji.react('wave')
      sfx.shutter()
      this.counts.photos++
      this.events.photo()
      return
    }
    if (id.startsWith('hide:')) {
      const sid = id.slice(5) as SpotId
      if (this.phase === 'seek') return this.goLook(id)
      if (this.phase === 'dadcount' || this.phase === 'search') {
        // Off to hide there (the roots: behind the tree's trunk).
        const p = sid === 'sea' ? this.L(BYID.sea.u, 2.4) : this.kayPoint(BYID[sid === 'roots' ? 'tree' : sid])
        this.target = p
        this.walkTo = null
        this.shake(sid, 0.4)
        return
      }
      this.shake(sid, 0.8)
      if (sid === 'chairs') sfx.clatter()
      else if (sid === 'pandanus' || sid === 'tree' || sid === 'roots') sfx.rustle()
      else if (sid === 'sea') sfx.splash()
      else sfx.boing()
    }
  }
  /** Walk up to a place and peek behind it (at once if she's there already). */
  private goLook(id: string) {
    const k = this.kaylee.root.position
    let p: Vector3
    if (id === 'family:nick') p = new Vector3(this.dad.x, 0, this.dad.z)
    else p = this.lookPoint(BYID[id.slice(5) as SpotId])
    const d = Math.hypot(p.x - k.x, p.z - k.z)
    if (d < 1.1) return this.look(id)
    this.target = p
    this.walkTo = id
  }

  // ---------------------------------------------------------------- life

  private shake(id: SpotId, k: number) {
    const t = this.things.get(id)
    if (!t) return
    t.wob = 0
    t.big = Math.max(t.big, k)
  }
  private say(line: Line, mute = false) {
    this.bubble = { text: lineText(line), until: this.time + 1.5 + lineText(line).length * 0.06 }
    this.events.say(line, mute)
  }
  /** The finger has just come up (she's stuck): the hint, spoken only if the budget allows (spendHint). */
  private stuck() {
    const l = this.phase === 'seek' ? H.hint.seek : this.phase === 'dadcount' ? H.hint.hide : null
    if (l) this.say(l, !spendHint(l))
  }

  private life(dt: number, t: number) {
    // The hiding places wiggle (a tap, a giggle, a give-away): a shake that dies down.
    for (const th of this.things.values()) {
      if (th.big <= 0) continue
      th.wob += dt
      const k = th.big * Math.exp(-th.wob * 3.2)
      const s = th.shake
      s.rotation.z = Math.sin(th.wob * 26) * 0.07 * k
      if (th.def.id === 'towel' || th.def.id === 'mommy') s.position.y = Math.abs(Math.sin(th.wob * 20)) * 0.06 * k
      if (k < 0.01) {
        th.big = 0
        s.rotation.z = 0
      }
    }
    // The towel lump breathes; the towel flies off when he's found (or she pops out).
    const lump = this.towelParts.lump
    if (lump.visible && this.towelLift < 0) {
      const br = 1 + Math.sin(t * 2.4) * 0.05 + this.peekLift() * 1.2
      lump.scale.y = (this.hiddenAt === 'towel' ? 0.75 : 1) * br
    }
    if (this.towelLift >= 0) {
      this.towelLift += dt / 0.8
      const k = Math.min(1, this.towelLift)
      lump.position.y = 0.05 + Math.sin(Math.PI * k) * 1.4
      lump.rotation.x = k * 3
      if (k >= 1) {
        this.towelLift = -1
        lump.visible = false
        this.towelParts.toes.visible = false
        lump.position.y = 0.05
        lump.rotation.x = 0
      }
    }
    this.towelParts.flat.rotation.z *= 1 - ease(dt, 4)
    // The glow rings: Dad's place once she's been stuck a long time; every hiding place while he counts.
    const hideRound = this.phase === 'dadcount' || (this.phase === 'search' && !this.hiddenAt)
    for (const th of this.things.values()) {
      const on = (this.glowing && this.phase === 'seek' && th.def.id === this.hide) || (hideRound && th.def.id !== 'roots' && th.def.id !== 'sea')
      th.glow.visible = on
      if (on) {
        const mat = th.glow.material as MeshBasicMaterial
        mat.opacity = (hideRound ? (this.openFinds > 0 ? 0.6 : 0.35) : 0.7) * (0.6 + 0.4 * Math.sin(t * 4 + th.x))
        th.glow.scale.setScalar(1 + 0.08 * Math.sin(t * 4))
      }
    }
    // Mom watches; Dad looks at your unicorn when he isn't hiding or counting. (A film sets its own looks.)
    const k = this.kaylee.root.position
    if (this.phase === 'film') this.filmPose?.()
    else {
      this.ji.lookAt(k.x, k.y + 0.6, k.z)
      if (this.phase !== 'dadcount' && this.phase !== 'search') this.nick.lookAt(k.x, k.y + 0.6, k.z)
      else this.nick.lookAway()
      this.kaylee.lookAt(this.dad.x, this.dadY() + 0.8, this.dad.z)
      this.peekabooPlay(dt)
    }
    this.kaylee.update(dt, t)
    this.nick.update(dt, t)
    this.ji.update(dt, t)
    this.peeka.update(dt, t, this.rig.camera)
    this.poseCover()
    if (this.bubble && this.time > this.bubble.until) this.bubble = null
  }

  // ---------------------------------------------------------------- camera

  /** While she counts and seeks (rounds 1 and 2): the box round her and Dad's hiding place (and Dad, out of it), in
   *  Ao Prao's u (across the screen) and v (into it), so wherever he hides it's on screen, on every screen shape. */
  private seekBox() {
    if (!(this.phase === 'intro' || this.phase === 'count' || this.phase === 'seek' || this.phase === 'found')) return null
    const k = this.kaylee.root.position
    const me = this.local(k.x, k.z)
    let u0 = me.u
    let u1 = me.u
    let v0 = me.v
    let v1 = me.v
    const d = BYID[this.hide]
    for (const { u, v } of [{ u: d.u + d.dad.du, v: d.v + d.dad.dv }, this.local(this.dad.x, this.dad.z)]) {
      u0 = Math.min(u0, u)
      u1 = Math.max(u1, u)
      v0 = Math.min(v0, v)
      v1 = Math.max(v1, v)
    }
    const m = CAM.margin
    return { u: (u0 + u1) / 2, v: (v0 + v1) / 2, hu: (u1 - u0) / 2 + m, hv: (v1 - v0) / 2 + m }
  }
  private camCenter() {
    const box = this.seekBox()
    if (box) {
      const c = this.L(box.u, box.v)
      c.y = Math.max(0, c.y) + 0.9
      return c
    }
    const k = this.kaylee.root.position
    const mid = this.L(0, -5)
    const c = new Vector3(k.x + (mid.x - k.x) * CAM.pull, 0, k.z + (mid.z - k.z) * CAM.pull)
    if (this.phase === 'search' || this.phase === 'giveup' || this.phase === 'caught') {
      // Watch him search: halfway between them.
      c.x = (c.x + this.dad.x) / 2
      c.z = (c.z + this.dad.z) / 2
    }
    c.y = Math.max(0, this.groundY(c.x, c.z)) + 0.4
    return c
  }
  private shot(): Shot {
    const center = this.camCenter()
    let b = this.tall ? CAM.tallBox : CAM.box
    if (this.phase === 'search' || this.phase === 'giveup' || this.phase === 'caught') b = Math.max(b, this.dadDist() / 2 + 2)
    const half = this.tall ? new Vector3(b, 0.6, b * 1.15) : new Vector3(b, 0.6, b * 0.6)
    const box = this.seekBox()
    if (box) half.set(Math.max(half.x, box.hu), 1.1, Math.max(half.z * 0.6, box.hv))
    return { center, half, yaw: (this.seaYaw + Math.PI) * DEG, pitch: CAM.pitch, follow: true, minDist: 6, maxDist: 60 }
  }

  render() {
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    const idle = !this.finger && t - this.lastTouch > HINT_S
    if (this.phase === 'film') at = null
    else if (this.phase === 'seek' && this.glowing) at = this.dadPoint(BYID[this.hide])
    else if (this.phase === 'dadcount' && idle && !this.hiddenAt) {
      // The nearest hiding place.
      const k = this.kaylee.root.position
      let best: SpotDef | null = null
      let bd = Infinity
      for (const def of SPOTS) {
        if (def.id === 'roots' || def.id === 'sea') continue
        const p = this.kayPoint(def)
        const d = Math.hypot(p.x - k.x, p.z - k.z)
        if (d < bd) {
          bd = d
          best = def
        }
      }
      if (best) at = this.kayPoint(best)
    }
    if (!!at !== this.hintOn) {
      this.hintOn = !!at
      if (at) this.stuck()
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    const s = this.toScreen(at.setY(at.y + 0.2))
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, base: Vector3 | null, height: number, scale = 1.4) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (base) {
        const c = this.toScreen(tmp.copy(base).setY(base.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + height))
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
    const hidingNow = this.phase === 'seek'
    for (const [id, el] of this.anchorEls) {
      // (A film is on: nothing to tap.)
      if (this.phase === 'film') place(el, null, 0)
      else if (id === 'kaylee') place(el, this.kaylee.root.visible ? this.kaylee.root.getWorldPosition(v) : null, this.kaylee.height, 0.8)
      else if (id === 'family:nick') place(el, this.nick.root.visible && this.nick.root.position.y > -0.6 ? this.nick.root.getWorldPosition(v) : null, this.nick.height * (this.dad.pose === 'lie' ? 0.5 : 0.9), 0.8)
      else if (id === 'family:ji') place(el, this.ji.root.getWorldPosition(v), this.ji.height * 0.8, 0.9)
      else if (id.startsWith('hide:')) {
        const sid = id.slice(5) as SpotId
        const th = this.things.get(sid)!
        const p = sid === 'roots' ? this.L(th.def.u, th.def.v) : sid === 'sea' ? this.L(th.def.u, th.def.v).setY(0) : sid === 'towel' ? this.L(th.def.u, th.def.v) : v.set(th.x, th.y, th.z)
        const hh = sid === 'tree' ? 2.6 : sid === 'pandanus' ? 3 : sid === 'palmL' || sid === 'palmR' ? 2.4 : sid === 'roots' || sid === 'towel' || sid === 'sea' ? 0.5 : 1.3
        place(el, p, hh, sid === 'tree' ? 0.7 : 1.1)
      }
      el.style.zIndex = id === 'family:nick' && hidingNow ? '4' : id === 'kaylee' ? '3' : id === 'hide:roots' || id === 'hide:towel' ? '2' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (p: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(p))
    const k = this.kaylee.root.position
    return {
      section: 'hideseek',
      round: this.round,
      phase: this.phase,
      hide: this.round === '1' || this.round === '2' ? this.hide : null,
      film: this.films.now,
      films: { done: this.films.done, skipped: this.films.skipped },
      peekaboo: { ...sc(this.peeka.pos), glow: +this.peeka.glow.toFixed(2), tucked: this.pk.tucked, twinkles: this.pk.twinkles, tucks: this.pk.tucks, knew: this.pk.knew, shushed: this.pk.shushed, crossEyed: this.cross.crossed },
      tree: { u: +TREE.u.toFixed(2), v: +TREE.v.toFixed(2) },
      helpLvl: this.helpLvl,
      helpT: +this.helpT.toFixed(1),
      popped: this.poppedT !== -1,
      poppedT: +this.poppedT.toFixed(1),
      speed: +this.speed.toFixed(2),
      dadPath: this.dad.path.length,
      onScreen: this.round !== '1' && this.round !== '2' ? null : ROUND_HIDES[this.round].map((id) => (({ x, y }) => x >= 0 && x <= this.w && y >= 0 && y <= this.h)(this.toScreen(this.dadPoint(BYID[id]).setY(this.dadPoint(BYID[id]).y + 0.5)))).every(Boolean),
      hidingIn: this.hiddenAt,
      openFinds: this.openFinds,
      looksLeft: this.looks.length,
      dadAt: [+this.dad.x.toFixed(1), +this.dad.z.toFixed(1)],
      lookT: +this.lookT.toFixed(1),
      bubble: this.bubble?.text ?? null,
      kaylee: sc(k.clone().setY(k.y + 0.5)),
      daddy: sc(new Vector3(this.dad.x, this.dadY() + 0.6, this.dad.z)),
      spots: Object.fromEntries(SPOTS.map((s) => [s.id, sc(this.kayPoint(s))])),
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.later = []
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}
