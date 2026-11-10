// The sandcastle at Ao Hin Khok (plan: planning/around-the-world/thailand/samet-trip.md, greybox 4), on the island's
// real beach (island/layout.ts FRAMES.hinkhok), close and steep over the sand with the sea at the top of the screen.
//
// The toy (core verb): dig the sand with her finger. Drag through it and a trench opens under her finger, the sand
// piling up wet and dark beside it (sand.ts); start on a pile and dragging pats it up into a wall. Kaylee sits by the
// finger and digs along, sand flying. The verb deepens three times (`round`), moving on by itself:
//   dig     dig holes and moats, pile walls and hills. A ghost crab pops up out of a deep hole and scuttles off sideways.
//   towers  the moulds arrive (her pink bucket, a square one, a unicorn): drag one onto the sand (or leave it where it
//           is) and tap it: it flips, slams down and lifts off to leave a tower. Shells and coral bits to push into the
//           walls and the towers. Dig under a tower and it slumps into a heap.
//   tide    the tide comes in: the sea creeps up the beach, wave after wave. Dig a channel from the moat to the sea and
//           the water rushes along it and fills the moat (the best moment): sparkles, Daddy cheers, and a hermit crab
//           walks up out of the sea and moves into a tower's door. One big wave washes the tower nearest the sea half
//           away (build it again!).
// The side verb, any time: bury Daddy. He lies beside the castle; rub sand over him and it heaps up, shins to chest,
// until only his head and toes stick out. Tap his toes: they wiggle. Tap his head: he sneezes and the sand flies off.
//
// Talk (lines.ts L.samet.sandcastle): Daddy's "Let's build a sandcastle!", Sparkle's one line as each round begins,
// Daddy's and Mommy's reactions, Sparkle's tide fact once the moat fills; after a while with nothing done the finger
// shows and Sparkle says what to do (spendHint). Every number that decides the feel is a knob (?feel=1), with a graph
// of her finger against the sand.
import { Fog, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, RingGeometry, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, spendHint, type Line } from '../../../../../../sdk'
import { knobs, watch } from '../../../../../kit/knobs'
import { noise as hiss, sfx, tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { blobShadow } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { L as LINES } from '../../../lines'
import { hermitModel, type Model } from '../book/models'
import { groundColor } from '../island/ground'
import { FRAMES } from '../island/layout'
import { buildIsland, DAY, type Island, type TimeOfDay } from '../island/scenery'
import { beachBall, blanket, ghostCrab, longtail, MOULDS, mouldModel, SHELLS, shellModel, towerModel, umbrella, type MouldKind, type TowerModel } from './props'
import { CUT_V, DIGGABLE, PATCH, Sand, sinkGround, type SandFeel } from './sand'

const FILE = 'src/world/places/thailand/activities/samet-trip/sandcastle/sandcastle.ts'
/** Her finger in the sand. */
const DIG = knobs('sandDig', 'Digging the sand', FILE, {
  radius: { value: 0.3, min: 0.12, max: 0.7, step: 0.01, label: 'Finger is this wide', unit: 'm', note: 'the radius of sand her finger moves' },
  rate: { value: 1.5, min: 0.2, max: 5, step: 0.05, label: 'Digs down at', unit: 'm/s', note: 'how fast the sand goes down under her finger' },
  swipe: { value: 0.035, min: 0, max: 0.15, step: 0.005, label: 'A swipe digs', unit: 's', note: 'a quick swipe still digs each spot this long (higher = deeper trenches from fast fingers)' },
  deep: { value: 0.45, min: 0.1, max: 0.8, step: 0.01, label: 'Holes go down to', unit: 'm', note: 'the deepest a hole can get' },
  spread: { value: 1.55, min: 0.8, max: 3, step: 0.05, label: 'Dug sand lands', unit: '× wide', note: 'how far beside the trench the sand piles up' },
  keep: { value: 0.6, min: 0.2, max: 1.2, step: 0.05, label: 'Sand that piles up', unit: '×', note: 'how much of the dug sand makes the wall (the rest flies off)' },
  pat: { value: 0.7, min: 0.1, max: 3, step: 0.05, label: 'Patting a wall up', unit: 'm/s', note: 'dragging along a pile raises it this fast' },
  tall: { value: 0.42, min: 0.15, max: 1.2, step: 0.01, label: 'Walls up to', unit: 'm', note: 'the tallest a pile can get' },
  patFrom: { value: 0.07, min: 0.02, max: 0.3, step: 0.01, label: 'Pats from', unit: 'm', note: 'a finger starting on sand this much above the beach pats instead of digging' },
  dry: { value: 0.8, min: 0.2, max: 3, step: 0.05, label: 'Dry sand stands', unit: 'rise/run', note: 'the steepest dry sand stays (lower = it runs flatter)' },
  wet: { value: 2.6, min: 0.5, max: 6, step: 0.05, label: 'Wet sand stands', unit: 'rise/run', note: 'the steepest wet sand stays (dug sand is wet)' },
  kaylee: { value: 0.85, min: 0.3, max: 2, step: 0.05, label: 'Kaylee sits from her finger', unit: 'm' },
})
/** The water and the tide. */
const TIDE = knobs('sandTide', 'The tide and the water', FILE, {
  high: { value: 0.2, min: 0.05, max: 0.4, step: 0.01, label: 'High tide', unit: 'm', note: 'how far the sea rises in the tide round' },
  time: { value: 30, min: 5, max: 120, step: 1, label: 'Tide comes in over', unit: 's' },
  surge: { value: 0.035, min: 0, max: 0.15, step: 0.005, label: 'Each wave lifts it', unit: 'm', note: 'the sea surges up the beach and back every few seconds' },
  every: { value: 5.5, min: 2, max: 14, step: 0.5, label: 'A wave every', unit: 's' },
  big: { value: 0.09, min: 0, max: 0.25, step: 0.01, label: 'The big wave', unit: 'm', note: 'the one wave that washes the nearest tower half away' },
  flow: { value: 4, min: 1, max: 12, step: 1, label: 'Water runs', unit: 'steps', note: 'flow steps a frame: more = the water rushes down the channel faster' },
  seep: { value: 0.003, min: 0, max: 0.05, step: 0.001, label: 'Sand soaks up', unit: 'm/s', note: 'how fast a pool cut off from the sea drains away' },
  filled: { value: 0.3, min: 0.05, max: 2, step: 0.05, label: 'Moat counts as filled at', unit: 'm²', note: 'water this big standing in the deep part of her moat = the moat filled' },
  help: { value: 1.1, min: 0, max: 3, step: 0.05, label: 'A channel this close breaks through', unit: 'm', note: 'when the water stops this short of the moat, the sand between gives way by itself (0 = never)' },
  helpAfter: { value: 1.2, min: 0, max: 8, step: 0.1, label: '…after her finger is up for', unit: 's' },
})
/** How the rounds move on, the towers, burying Daddy. */
const PLAY = knobs('sandPlay', 'Rounds, towers and Daddy', FILE, {
  dig: { value: 30, min: 5, max: 120, step: 1, label: 'Digging before the moulds', unit: 's', note: 'seconds of digging, then the moulds arrive (a moat dug all round is sooner)' },
  ring: { value: 0.85, min: 0.3, max: 1, step: 0.05, label: 'A moat is done at', unit: '× round', note: 'how much of the way round the castle she must dig for the moat to count' },
  towers: { value: 6, min: 1, max: 12, step: 1, label: 'Towers before the tide', note: 'the tide comes in after this many towers' },
  towersFor: { value: 150, min: 20, max: 300, step: 5, label: '…or after', unit: 's' },
  fill: { value: 0.03, min: 0.005, max: 0.3, step: 0.005, label: 'Sand to fill the first bucket', unit: 'm³', note: 'the sand she digs beside a mould flies into it; full, a tap flips it' },
  fillMore: { value: 0.45, min: 0, max: 2, step: 0.05, label: '…more each tower', unit: '×', note: 'each next tower this round needs this much more sand (it gets harder)' },
  fillNear: { value: 1.9, min: 0.5, max: 4, step: 0.1, label: 'Digging this near a mould fills it', unit: 'm' },
  sink: { value: 0.12, min: 0.04, max: 0.4, step: 0.01, label: 'A tower slumps when dug under', unit: 'm' },
  bury: { value: 2.6, min: 0.3, max: 8, step: 0.1, label: 'Burying Daddy', unit: '/s', note: 'how fast rubbing over him heaps the sand (1 = one part covered)' },
  wiggleOut: { value: 3.2, min: 0.5, max: 15, step: 0.1, label: 'Buried Daddy sneezes himself out after', unit: 's' },
  crab: { value: 0.32, min: 0.1, max: 0.6, step: 0.01, label: 'A crab pops out at', unit: 'm deep' },
  pitch: { value: 44, min: 25, max: 75, step: 1, label: 'Camera looks down', unit: '°', note: 'steeper shows more sand, lower shows more of Kaylee and the sea' },
  tallPitch: { value: 12, min: 0, max: 30, step: 1, label: '…more on a tall screen', unit: '°' },
})

export type SandRound = 'dig' | 'towers' | 'tide'
export const SAND_ROUND_IDS: SandRound[] = ['dig', 'towers', 'tide']
export interface SandStart {
  round: SandRound
  time?: TimeOfDay
}
export interface SandEvents {
  /** A new round began (the address bar follows). */
  round(r: SandRound): void
  /** The moat filled from the sea (the stop's flag). */
  filled(): void
  /** Someone says a line (lines.ts L.samet.sandcastle; `mute`: a hint's first time, only its bubble shows). */
  say(l: Line, mute?: boolean): void
}

const S = LINES.samet.sandcastle

/** Where the moulds wait (bottom left, by the castle) and the shells lie (washed up along the water's edge). */
const MOULD_HOMES = [
  { a: -3.7, v: -6.7 },
  { a: -2.6, v: -7.0 },
  { a: -1.5, v: -7.2 },
]
const SHELL_HOMES = [
  { a: -3.6, v: -1.3 },
  { a: -2.3, v: -0.7 },
  { a: -3.9, v: -2.7 },
  { a: 2.2, v: -0.9 },
  { a: 3.5, v: -1.6 },
  { a: 1.0, v: -0.5 },
]
const DEG = 180 / Math.PI
const HINT_S = 8
const MAX_TOWERS = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const span = (k: number, a: number, b: number) => clamp((k - a) / (b - a), 0, 1)
const bellK = (k: number) => Math.sin(Math.PI * clamp(k, 0, 1))

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const scrape = (k: number) => hiss(0.09, 0.05 + k * 0.05, 'bandpass', 700 + k * 900, 500 + k * 500, 0, 1.4)
const patSnd = () => hiss(0.06, 0.12, 'lowpass', 600, 300)
const rush = () => {
  hiss(1.6, 0.14, 'lowpass', 500, 1600)
  hiss(1.2, 0.05, 'highpass', 2400, 1200, 0.2)
}
const twinkle = () => [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => tone(1000 * (1 + i * 0.25), 1150 * (1 + i * 0.25), 0.14, 0.045, 'sine', d))
const fanfare = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 0.07, 'triangle', i * 0.13))
const sadSlide = () => tone(700, 300, 0.7, 0.05, 'triangle')
const sneeze = () => {
  tone(500, 900, 0.35, 0.05, 'triangle')
  hiss(0.3, 0.25, 'bandpass', 1800, 900, 0.38, 0.8)
}
const giggle = () => [0, 0.1, 0.2].forEach((d, i) => tone(700 + i * 90, 900 + i * 90, 0.08, 0.05, 'triangle', d))
const toot = () => [0, 0.2].forEach((d) => tone(330, 340, 0.16, 0.07, 'square', d))

export const SAND_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'toes', label: "Daddy's toes", kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'umbrella', label: 'The umbrella', kind: 'thing' },
  { id: 'ball', label: 'The beach ball', kind: 'thing' },
  { id: 'crab', label: 'A ghost crab', kind: 'thing' },
  { id: 'hermit', label: 'A hermit crab', kind: 'thing' },
  { id: 'boat', label: 'A longtail boat', kind: 'thing' },
  ...MOULDS.map((m, i) => ({ id: `mould:${i}`, label: m === 'round' ? 'The pink bucket' : m === 'square' ? 'The square mould' : 'The unicorn mould', kind: 'thing' as const })),
  ...SHELLS.map((s, i) => ({ id: `shell:${i}`, label: s === 'coral' ? 'A bit of coral' : s === 'star' ? 'A starfish' : 'A shell', kind: 'thing' as const })),
  ...Array.from({ length: MAX_TOWERS }, (_, i) => ({ id: `tower:${i}`, label: 'A sand tower', kind: 'thing' as const })),
]

interface Tower {
  m: TowerModel
  kind: MouldKind
  a: number
  v: number
  y: number
  /** Growing in (0..1), slumping (−1 = not), wobble. */
  grow: number
  slump: number
  wob: number
  half: boolean
  hermit: boolean
}
interface Mould {
  kind: MouldKind
  root: Group
  body: Group
  sand: Group
  heap: Group
  /** How full of sand (0..1: full, a tap flips it), and a wobble when it's poked empty. */
  fill: number
  wob: number
  home: { a: number; v: number }
  a: number
  v: number
  lift: number
  state: 'away' | 'arrive' | 'home' | 'held' | 'placed' | 'flip' | 'back'
  t: number
  from: { a: number; v: number }
}
interface Shell {
  g: Group
  a: number
  v: number
  home: { a: number; v: number }
  held: boolean
  on: Tower | null
  wob: number
}
interface Crab {
  m: ReturnType<typeof ghostCrab>
  a: number
  v: number
  dir: number
  state: 'gone' | 'up' | 'run' | 'wave' | 'down'
  t: number
}

export class Sandcastle implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private sand: Sand
  private feel: SandFeel
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), -0.3)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private round: SandRound
  private roundT = 0
  private digT = 0
  /** The dig round: which sixteenths of the way round the castle she has dug (the moat), and when it closed. */
  private ring = new Array<boolean>(16).fill(false)
  private ringT = 0
  private closedAt = -1
  private towersThisRound = 0
  private tideK = 0
  private sea = 0
  private bigT = -1
  private bigDone = false
  private filledAt = -1
  private checkT = 0
  /** Her moat (the biggest hollow she dug), looked at a few times a second. */
  private moat: ReturnType<Sand['hollow']> = { cells: [], core: [], deep: 0 }
  /** The sand giving way between a channel's water and the moat it nearly reached (rule 3: help, #357). */
  private breach: { from: { a: number; v: number }; to: { a: number; v: number }; t: number } | null = null
  /** Where the castle goes (the middle of the screen). */
  private C = { a: -0.6, v: -4.9 }
  private seaYaw: number

  // ---- Characters.
  private kaylee: Avatar
  private kHold = new Group()
  private kShadow: Mesh
  private sitting = false
  private kGoal: { a: number; v: number } | null = null
  private nick: Member
  private ji: Member
  private dad: { a: number; feet: number; len: number; width: number; buried: number[]; sneezeT: number; toesT: number; outT: number; root: Group; mounds: Group[]; at: number[]; toes: Group }

  // ---- Her finger.
  private finger: { x: number; y: number; mode: 'none' | 'dig' | 'pat' | 'bury' | 'grab'; id?: string; moved: boolean; a: number; v: number; pa: number; pv: number; t: number; sa: number; sv: number; trav: number } | null = null
  private grab: { kind: 'mould' | 'shell'; i: number } | null = null
  private marker: Mesh
  private lastTouch = 0
  private scrapeT = 0
  private fingerSpeed = 0
  private lastDug = 0

  // ---- Things.
  private towers: Tower[] = []
  private moulds: Mould[] = []
  private shells: Shell[] = []
  private crab: Crab
  private crabsPopped = 0
  private hermit: Model
  private hermitState: { state: 'gone' | 'walk' | 'home' | 'swim'; t: number; from: { a: number; v: number }; to: { a: number; v: number }; tower: Tower | null } = { state: 'gone', t: 0, from: { a: 0, v: 0 }, to: { a: 0, v: 0 }, tower: null }
  private boat: ReturnType<typeof longtail>
  private boatS = -30
  private boatBob = 0
  private ball: ReturnType<typeof beachBall>
  private ballT = -1
  private ballAt = { a: 5.0, v: -1.4 }
  private umb: ReturnType<typeof umbrella>
  private umbSpin = 0

  private puffs: Particles
  private spray: Particles
  private sparkle: Particles
  private splash: Particles
  // ---- Talk: when each key last talked, lists said in turn, lines said once, a line waiting a moment.
  private talkAt = new Map<string, number>()
  private turn = new Map<string, number>()
  private told = new Set<string>()
  private later: { at: number; fn: () => void }[] = []
  private hinted = false

  private counts = { strokes: 0, taps: 0, pokes: 0, dug: 0, pats: 0, flips: 0, towers: 0, slumps: 0, shells: 0, crabs: 0, helped: 0, buried: 0, wiggledOut: 0, sneezes: 0, toes: 0, filled: 0, washed: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: SandStart,
    private events: SandEvents,
  ) {
    const { scene, bag } = this
    const time = start.time ?? 'noon'
    scene.fog = new Fog(DAY[time].haze, 170, 950)
    applyBands()
    this.rig.fov = 42
    this.rig.lag = 0.35
    this.rig.camera.far = 3200
    this.round = start.round

    // ---- The island, Hin Khok's beach, and the sand patch laid over it.
    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.isl.setTime(time)
    const f = FRAMES.hinkhok
    this.seaYaw = Math.atan2(f.n.x, f.n.z)
    this.sand = new Sand(f, (x, z) => this.isl.ground.heightAt(x, z), (x, z) => { const g = this.isl.ground; const hh = g.heightAt(x, z); return groundColor(x, z, hh, g.shoreAt(x, z), 0) }, bag)
    scene.add(this.sand.mesh, this.sand.water)
    sinkGround(this.isl.fine, this.sand)
    const ax = this.sand.axes.a
    const mid = this.sand.world(0, (PATCH.v0 + CUT_V) / 2)
    this.isl.lagoon.setCut({ x: mid.x, z: mid.z, ax: ax.x, az: ax.z, along: (PATCH.a1 - PATCH.a0) / 2 - 0.05, across: (CUT_V - PATCH.v0) / 2 })
    this.isl.lagoon.tide.reach = 10
    this.isl.lagoon.waves.height = 0
    this.isl.lagoon.waves.chop = 0.6
    this.feel = { radius: 0, rate: 0, swipe: 0, deep: 0, spread: 0, keep: 0, pat: 0, tall: 0, dry: 0, wet: 0, flow: 0, seep: 0 }
    this.readFeel()

    // ---- Kaylee (in a holder that rides the sand's height), Daddy lying beside the castle, Mommy under her umbrella.
    this.kaylee = new Avatar(bag)
    this.kHold.add(this.kaylee.root)
    scene.add(this.kHold)
    this.kShadow = blobShadow(0.42, bag)
    scene.add(this.kShadow)
    const k0 = this.sand.world(0.6, -2.9)
    this.kaylee.place(k0.x, 0, k0.z, (this.seaYaw + Math.PI) * DEG)
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.nick = fam('nick')
    this.ji = fam('ji')
    scene.add(this.nick.root, this.ji.root)
    const len = this.nick.height
    // (Close enough to the castle that a phone held upright still shows all of him, #357.)
    const dA = 2.45
    const feet = -7.45 + len * 0.98
    const fp = this.sand.world(dA, feet)
    this.nick.place(fp.x, this.sand.heightAt(dA, feet), fp.z, this.seaYaw * DEG, 'lie')
    const width = this.nick.rig.radius * 1.55
    const bl = blanket(bag, len, width)
    bl.root.position.set(fp.x, this.sand.heightAt(dA, feet) + this.nick.rig.radius * 0.95, fp.z)
    bl.root.rotation.y = this.seaYaw
    scene.add(bl.root)
    const toes = new Group()
    toes.position.set(fp.x, 0, fp.z)
    scene.add(toes)
    this.dad = { a: dA, feet, len, width, buried: [0, 0, 0, 0], sneezeT: -1, toesT: -1, outT: -1, root: bl.root, mounds: bl.mounds, at: bl.at, toes }

    this.umb = umbrella(bag)
    const up = this.sand.world(-6.0, -3.2)
    this.umb.root.position.set(up.x, this.sand.heightAt(-6.0, -3.2) - 0.05, up.z)
    scene.add(this.umb.root)
    const mp = this.sand.world(-5.3, -4.7)
    const toC = this.sand.world(this.C.a, this.C.v)
    this.ji.place(mp.x, this.sand.heightAt(-5.3, -4.7), mp.z, Math.atan2(toC.x - mp.x, toC.z - mp.z) * DEG, 'sit')

    // ---- The moulds, the shells, the crabs, the ball, the boat.
    MOULDS.forEach((kind, i) => {
      const m = mouldModel(bag, kind)
      const home = MOULD_HOMES[i]
      m.root.rotation.y = this.seaYaw + Math.PI
      scene.add(m.root)
      this.moulds.push({ kind, root: m.root, body: m.body, sand: m.sand, heap: m.heap, fill: 0, wob: 0, home, a: home.a, v: home.v, lift: 0, state: this.round === 'dig' ? 'away' : 'home', t: 0, from: home })
    })
    SHELLS.forEach((kind, i) => {
      const g = shellModel(bag, kind, i)
      const home = SHELL_HOMES[i]
      g.scale.setScalar(2.2)
      g.rotation.y = i * 1.3
      scene.add(g)
      this.shells.push({ g, a: home.a, v: home.v, home, held: false, on: null, wob: 0 })
    })
    this.crab = { m: ghostCrab(bag), a: 0, v: 0, dir: 1, state: 'gone', t: 0 }
    this.crab.m.root.visible = false
    scene.add(this.crab.m.root)
    this.hermit = hermitModel(bag)
    this.hermit.root.visible = false
    scene.add(this.hermit.root)
    this.ball = beachBall(bag)
    scene.add(this.ball.root)
    this.boat = longtail(bag)
    scene.add(this.boat.root)

    this.marker = new Mesh(bag.add(new RingGeometry(0.34, 0.44, 28)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.7, depthWrite: false })))
    this.marker.rotation.x = -Math.PI / 2
    this.marker.renderOrder = 4
    this.marker.visible = false
    scene.add(this.marker)

    this.puffs = new Particles({ kind: 'spray', count: 320, colors: ['#FFF4DE', '#EBD5AA', '#E2C597'], gravity: 9 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 200, colors: ['#FFFFFF', '#EAFBFF', '#C9F6EC'], gravity: 9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 220, colors: ['#FFFFFF', '#FFF6B8', '#C9F4FF', PAL.gold, PAL.pink], gravity: -0.6 }, bag)
    this.splash = new Particles({ kind: 'foam', count: 160, opacity: 0.9 }, bag)
    scene.add(this.puffs.mesh, this.spray.mesh, this.sparkle.mesh, this.splash.mesh)

    // ---- Where the link starts: as if she had played to here.
    if (this.round !== 'dig') this.digMoat()
    if (this.round === 'tide') {
      this.addTower('round', this.C.a - 0.35, this.C.v - 0.15, true)
      this.addTower('square', this.C.a + 0.4, this.C.v - 0.2, true)
      this.addTower('unicorn', this.C.a, this.C.v + 0.35, true)
      this.addTower('round', this.C.a + 1.1, this.C.v + 2.2, true)
    }
    this.placeThings(0)

    ;(window as unknown as Record<string, unknown>).__sandProbe = (a: number, v: number) => {
      const s = this.toScreen(this.at(a, v))
      return { x: Math.round(s.x), y: Math.round(s.y), h: +this.sand.heightAt(a, v).toFixed(3), r: +this.sand.restAt(a, v).toFixed(3), w: +this.sand.depthAt(a, v).toFixed(3), sea: +this.sea.toFixed(3) }
    }
    ;(window as unknown as Record<string, unknown>).__sandInv = (x: number, y: number) => this.groundPoint(x, y)
    this.unwatch = watch('sandcastle', () => ({
      'her finger moves (m/s)': [this.fingerSpeed, 4],
      'dug under it (m)': [this.lastDug, 0.5],
      'the sea (m)': [this.sea, 0.4],
      'water in the moat (m²)': [this.sand.pooled(), 2],
    }))
  }

  private readFeel() {
    const f = this.feel
    f.radius = DIG.radius
    f.rate = DIG.rate
    f.swipe = DIG.swipe
    f.deep = DIG.deep
    f.spread = DIG.spread
    f.keep = DIG.keep
    f.pat = DIG.pat
    f.tall = DIG.tall
    f.dry = DIG.dry
    f.wet = DIG.wet
    f.flow = TIDE.flow
    f.seep = TIDE.seep
  }

  /** The moat a towers or tide link starts with: a ring dug round the castle's middle (and its walls). */
  private digMoat() {
    const { C } = this
    for (let pass = 0; pass < 3; pass++)
      for (let i = 0; i <= 48; i++) {
        const t = (i / 48) * Math.PI * 2
        const a = C.a + Math.cos(t) * 1.25
        const v = C.v + Math.sin(t) * 1.05
        this.sand.dig(a, v, -Math.sin(t), Math.cos(t), 0.08, this.feel)
      }
    for (let i = 0; i < 40; i++) this.sand.settle(0.05, this.feel)
  }

  /** Where a frame point is in the world, at the sand's height (+ `up`). */
  private at(a: number, v: number, up = 0, out = new Vector3()) {
    const p = this.sand.world(a, v)
    const y = this.sand.inside(a, v) ? this.sand.heightAt(a, v) : Math.max(0, this.isl.ground.heightAt(p.x, p.z))
    return out.set(p.x, y + up, p.z)
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

  /** Says `l` (a list: the next one in turn), unless this key talked less than `cool` seconds ago. */
  private talk(key: string, l: Line | readonly Line[], cool = 4) {
    const last = this.talkAt.get(key)
    if (last !== undefined && this.time - last < cool) return
    this.talkAt.set(key, this.time)
    if (Array.isArray(l)) {
      const n = this.turn.get(key) ?? 0
      this.turn.set(key, n + 1)
      this.events.say(l[n % l.length])
    } else this.events.say(l as Line)
  }
  /** Once per visit to the sandcastle. */
  private once(key: string, l: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.events.say(l)
  }

  setRound(r: SandRound) {
    if (r === this.round) return
    const was = this.round
    this.round = r
    this.roundT = 0
    this.towersThisRound = 0
    this.events.round(r)
    if (r !== 'dig') this.events.say(S[r])
    if (r !== 'dig' && was === 'dig') {
      // The moulds bounce in from the side.
      this.moulds.forEach((m, i) => {
        if (m.state !== 'away') return
        m.state = 'arrive'
        m.t = -i * 0.25
        m.from = { a: m.home.a - 3, v: m.home.v }
      })
      tone(880, 1320, 0.25, 0.06, 'triangle')
    }
    if (r === 'dig') {
      this.tideK = 0
      this.bigDone = false
    }
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.readFeel()
    if (this.later.length) {
      const due = this.later.filter((l) => l.at <= t)
      this.later = this.later.filter((l) => l.at > t)
      for (const l of due) l.fn()
    }
    // The opening, a beat after it appears: Daddy, then Sparkle (she waits her turn) with the round's line.
    if (t - dt < 0.6 && t >= 0.6) {
      if (this.round === 'dig') this.events.say(S.hi)
      this.events.say(S[this.round])
    }
    this.roundT += dt
    this.progress(dt)
    this.tide(dt, t)
    this.fingerStep(dt)
    this.sand.settle(dt, this.feel)
    this.sand.flow(dt, this.feel)
    this.sand.soak(dt)
    this.sand.draw(t)
    this.life(dt, t)
    this.placeThings(dt)
    for (const p of [this.puffs, this.spray, this.sparkle, this.splash]) p.update(dt)

    const c = this.at(this.C.a, this.C.v)
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- the rounds

  /** How far the dig round has got (0..1): the moat dug round the castle, or the time spent digging. */
  private digK() {
    const ring = this.ring.filter(Boolean).length / this.ring.length
    return clamp(Math.max(ring / PLAY.ring, this.digT / PLAY.dig), 0, 1)
  }
  private progress(dt: number) {
    if (this.round === 'dig') this.digProgress(dt)
    if (this.round === 'dig' && this.digT >= PLAY.dig) this.setRound('towers')
    else if (this.round === 'towers' && (this.towersThisRound >= PLAY.towers || this.roundT > PLAY.towersFor)) this.setRound('tide')
    // The moat filled (from the sea, through her channel, or the big wave over the top): water standing in the deep
    // part of her moat, not just in the channel or on the beach the tide has crept over.
    if ((this.checkT -= dt) <= 0) {
      this.checkT = 0.4
      this.moat = this.sand.hollow()
      if (this.filledAt < 0 && this.moat.core.length && this.sand.wetArea(this.moat.core) >= Math.min(TIDE.filled, this.moat.core.length * PATCH.cell * PATCH.cell * 0.5)) this.fill()
      else if (this.filledAt < 0) this.helpCheck()
    }
    this.breaching(dt)
  }

  /** The dig round shows how far she has got: each bit of the moat dug round the castle twinkles (a note higher each
   *  time), the moulds bounce in one by one, and a moat dug all the way round gets a cheer and brings the towers. */
  private digProgress(dt: number) {
    if ((this.ringT -= dt) > 0) return
    this.ringT = 0.25
    const { C } = this
    const n = this.ring.length
    for (let s = 0; s < n; s++) {
      if (this.ring[s]) continue
      const t = (s / n) * Math.PI * 2
      for (let r = 0.55; r <= 2.0; r += 0.15) {
        const a = C.a + Math.cos(t) * r
        const v = C.v + Math.sin(t) * r * 0.85
        if (this.sand.restAt(a, v) - this.sand.heightAt(a, v) < 0.1) continue
        this.ring[s] = true
        const got = this.ring.filter(Boolean).length
        const f = 523 * 2 ** (got / n)
        tone(f, f * 1.25, 0.12, 0.045, 'sine')
        const p = this.at(a, v, 0.1)
        for (let i = 0; i < 6; i++) this.sparkle.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 0.6, 0.8 + Math.random(), (Math.random() - 0.5) * 0.6, 0.9, 0.06)
        break
      }
    }
    const k = this.digK()
    // The moulds bounce in from the side as she goes: the pink bucket first.
    this.moulds.forEach((m, i) => {
      if (m.state !== 'away' || k < (i + 1) / 4) return
      m.state = 'arrive'
      m.t = 0
      m.from = { a: m.home.a - 3, v: m.home.v }
      tone(880, 1320, 0.25, 0.06, 'triangle')
    })
    // The moat dug all the way round: a cheer, then the towers.
    if (this.closedAt < 0 && this.ring.filter(Boolean).length / n >= PLAY.ring) {
      this.closedAt = this.time
      fanfare()
      for (let s = 0; s < 40; s++) {
        const t = (s / 40) * Math.PI * 2
        const p = this.at(C.a + Math.cos(t) * 1.25, C.v + Math.sin(t) * 1.05, 0.1)
        this.sparkle.emit(p.x, p.y, p.z, 0, 1 + Math.random() * 1.2, 0, 1.3, 0.07)
      }
      this.kaylee.react('hop')
      if (this.dad.buried.every((b) => b < 0.5)) this.nick.react('wiggle')
      this.ji.react('wave')
      this.events.say(S.dad[1])
      this.later.push({ at: this.time + 1.8, fn: () => this.round === 'dig' && this.setRound('towers') })
    }
  }

  /** Her channel's water stops just short of the moat (a dam of sand left between): once her finger is up a moment,
   *  the sand there glints and gives way, and the water runs through. */
  private helpCheck() {
    if (this.round !== 'tide' || this.breach || this.finger || TIDE.help <= 0 || this.moat.core.length < 6) return
    if (this.time - this.lastTouch < TIDE.helpAfter) return
    // (From water in something she dug: the tide creeping up the bare beach near the moat doesn't count.)
    const g = this.sand.gap(this.moat.core, TIDE.help, 0.01, (dug) => dug > 0.06)
    if (!g || g.d <= 0) return
    this.breach = { from: g.from, to: g.to, t: 0 }
    this.counts.helped++
    twinkle()
  }
  private breaching(dt: number) {
    const b = this.breach
    if (!b) return
    const was = b.t
    b.t += dt
    const da = b.to.a - b.from.a
    const dv = b.to.v - b.from.v
    const l = Math.hypot(da, dv) || 1
    // Glints along the gap first (0-0.7 s), then the sand crumbles away from the water to the moat (0.7-1.4 s).
    if (b.t < 0.7) {
      if (Math.random() < dt * 30) {
        const k = Math.random()
        const p = this.at(b.from.a + da * k, b.from.v + dv * k, 0.08)
        this.sparkle.emit(p.x, p.y, p.z, 0, 0.6 + Math.random() * 0.6, 0, 0.8, 0.07)
      }
      return
    }
    if (was < 0.7) hiss(0.7, 0.12, 'lowpass', 420, 900)
    const k0 = span(was, 0.7, 1.4)
    const k1 = span(b.t, 0.7, 1.4)
    const floor = Math.min(this.sea, TIDE.high * this.tideK) - 0.1
    // (From a little inside the water to a little inside the moat.)
    for (let k = k0; k <= k1 + 1e-6; k += 0.04) {
      const s = -0.2 / l + k * (1 + 0.45 / l)
      const a = b.from.a + da * s
      const v = b.from.v + dv * s
      this.sand.carve(a, v, 0.3, floor)
      if (Math.random() < 0.5) {
        const p = this.at(a, v, 0.05)
        this.puffs.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 1.2, 1 + Math.random(), (Math.random() - 0.5) * 1.2, 0.6, 0.05)
        this.spray.emit(p.x, p.y + 0.05, p.z, (Math.random() - 0.5) * 0.8, 0.8 + Math.random(), (Math.random() - 0.5) * 0.8, 0.6, 0.05)
      }
    }
    if (b.t >= 1.4) this.breach = null
  }

  private tide(dt: number, t: number) {
    if (this.round === 'tide') this.tideK = Math.min(1, this.tideK + dt / TIDE.time)
    const base = TIDE.high * (this.tideK * this.tideK * (3 - 2 * this.tideK))
    // Each wave: a quick surge up the beach and a slower slide back.
    const ph = (t / TIDE.every) % 1
    const surge = TIDE.surge * (1 + this.tideK * 0.4) * (ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI * 0.5) : Math.cos(((ph - 0.3) / 0.7) * Math.PI * 0.5) ** 2)
    // The big wave, once, when the tide is well in.
    if (this.round === 'tide' && !this.bigDone && this.tideK > 0.65 && ph < 0.05) {
      this.bigDone = true
      this.bigT = 0
    }
    let big = 0
    if (this.bigT >= 0) {
      this.bigT += dt
      big = TIDE.big * bellK(this.bigT / 3)
      if (this.bigT > 1.3 && this.bigT - dt <= 1.3) this.washTower()
      if (this.bigT > 3) this.bigT = -1
    }
    this.sea = base + surge + big
    this.sand.sea = this.sea
    this.isl.lagoon.tide.level = this.sea
    // Foam where the swash turns (a little white along the water's edge each wave).
    if (ph > 0.28 && ph < 0.34 && Math.random() < dt * 30) {
      const a = (Math.random() - 0.5) * 10
      const v = this.edgeV(a)
      const p = this.at(a, v, 0.03)
      this.splash.emit(p.x, p.y, p.z, 0, 0, 0, 1.0, 0.12 + Math.random() * 0.12)
    }
  }
  /** The point of her moat nearest the sea (frame coordinates), if she has one. */
  private moatSea() {
    let best = -1
    let bv = -Infinity
    for (const k of this.moat.core) {
      const v = PATCH.v0 + Math.floor(k / this.sand.nx) * PATCH.cell
      if (v > bv) {
        bv = v
        best = k
      }
    }
    if (best < 0) return null
    return { a: PATCH.a0 + (best % this.sand.nx) * PATCH.cell, v: bv }
  }
  /** Where the sea meets the sand along a line out to sea. */
  private edgeV(a: number) {
    for (let v = PATCH.v1; v > PATCH.v0; v -= 0.125) if (this.sand.heightAt(a, v) > this.sea) return v
    return PATCH.v0
  }

  private fill() {
    this.filledAt = this.time
    this.counts.filled++
    rush()
    window.setTimeout(fanfare, 900)
    // Sparkles over the water standing in the moat.
    const d = this.sand.deepest()
    for (let i = 0; i < 40; i++) {
      const p = this.at(d.a + (Math.random() - 0.5) * 2.4, d.v + (Math.random() - 0.5) * 2.2, 0.1)
      this.sparkle.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 0.6, 1 + Math.random() * 1.4, (Math.random() - 0.5) * 0.6, 1.4, 0.07)
    }
    // Daddy cheers (if he isn't buried) and Mommy waves; a hermit crab walks up out of the sea to move in.
    if (this.dad.buried.every((b) => b < 0.5)) this.nick.react('wiggle')
    this.ji.react('wave')
    this.kaylee.react('hop')
    this.sendHermit()
    this.events.filled()
    this.events.say(S.filled)
    this.later.push({ at: this.time + 2.6, fn: () => this.once('tideFact', S.tideFact) })
  }

  private sendHermit() {
    const free = this.towers.filter((tw) => tw.slump < 0 && !tw.half && !tw.hermit)
    // The tower nearest the moat's water, else into the water itself.
    const d = this.sand.deepest()
    const tower = free.sort((p, q) => Math.hypot(p.a - d.a, p.v - d.v) - Math.hypot(q.a - d.a, q.v - d.v))[0] ?? null
    const to = tower ? { a: tower.a, v: tower.v + 0.42 } : { a: d.a, v: d.v }
    const from = { a: to.a + 0.6, v: Math.min(PATCH.v1 - 0.4, this.edgeV(to.a + 0.6) + 0.3) }
    this.hermitState = { state: 'walk', t: 0, from, to, tower }
    this.hermit.root.visible = true
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** Where her finger is on the sand (frame coordinates), or null off it. */
  private groundPoint(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const ray = this.raycaster.ray
    let hy = 0.3
    let p: Vector3 | null = null
    for (let i = 0; i < 4; i++) {
      this.plane.constant = -hy
      p = ray.intersectPlane(this.plane, tmp2)
      if (!p) return null
      const l = this.sand.local(p.x, p.z)
      hy = this.sand.inside(l.a, l.v) ? this.sand.heightAt(l.a, l.v) : Math.max(0, this.isl.ground.heightAt(p.x, p.z))
    }
    if (!p) return null
    return { ...this.sand.local(p.x, p.z), x: p.x, z: p.z }
  }
  /** Is this point on Daddy (the part of him that can be buried: below his head)? Which mound. */
  private onDad(a: number, v: number) {
    const d = this.dad
    const along = (d.feet - v) / d.len
    if (Math.abs(a - d.a) > d.width * 1.5 || along < -0.12 || along > 0.8) return -1
    let best = 0
    for (let i = 1; i < d.at.length; i++) if (Math.abs(d.at[i] - along) < Math.abs(d.at[best] - along)) best = i
    return best
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    const g = this.groundPoint(x, y)
    const f = (this.finger = { x, y, mode: 'none' as const, id, moved: false, a: g?.a ?? 0, v: g?.v ?? 0, pa: g?.a ?? 0, pv: g?.v ?? 0, t: this.time, sa: 0, sv: 0, trav: 0 }) as NonNullable<Sandcastle['finger']>
    if (id?.startsWith('mould:') || id?.startsWith('shell:')) {
      // Held: a drag carries it (a tap flips the mould / wobbles the shell).
      const i = +id.split(':')[1]
      const kind = id.startsWith('mould:') ? 'mould' : 'shell'
      if (kind === 'mould' && !['home', 'placed'].includes(this.moulds[i].state)) return
      this.grab = { kind, i }
      f.mode = 'grab'
      return
    }
    if (id && id !== 'family:nick' && id !== 'toes') return
    if (g) this.startStroke(f, g.a, g.v)
  }
  private startStroke(f: NonNullable<Sandcastle['finger']>, a: number, v: number) {
    if (this.onDad(a, v) >= 0) f.mode = 'bury'
    else if (!this.sand.diggable(a, v)) f.mode = 'none'
    else f.mode = this.sand.heightAt(a, v) - this.sand.restAt(a, v) > DIG.patFrom ? 'pat' : 'dig'
    f.a = f.pa = f.sa = a
    f.v = f.pv = f.sv = v
    f.trav = 0
    if (f.mode !== 'none') this.counts.strokes++
    if (f.mode === 'dig' || f.mode === 'pat' || f.mode === 'bury') this.goDig(a, v)
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (!f.moved && Math.hypot(x - downX, y - downY) > 12) {
      f.moved = true
      // Dragged off a poke's tap target (not a thing she carries): it's a stroke in the sand after all.
      if (f.mode === 'none' && f.id && !this.grab) {
        const g = this.groundPoint(x, y)
        if (g) this.startStroke(f, g.a, g.v)
      }
    }
  }
  pointerUp() {
    const f = this.finger
    if (this.grab && f?.moved) this.drop()
    this.grab = null
    this.finger = null
    this.marker.visible = false
  }

  /** Each frame her finger is down: dig, pat, bury or carry. */
  private fingerStep(dt: number) {
    const f = this.finger
    this.fingerSpeed *= 1 - ease(dt, 6)
    if (!f) return
    const g = this.groundPoint(f.x, f.y)
    if (!g) return
    const da = g.a - f.a
    const dv = g.v - f.v
    const moved = Math.hypot(da, dv)
    this.fingerSpeed = moved / Math.max(dt, 1e-3)
    f.trav += moved
    f.pa = f.a
    f.pv = f.v
    f.a = g.a
    f.v = g.v
    if (f.mode === 'grab' && this.grab) {
      const it = this.grab.kind === 'mould' ? this.moulds[this.grab.i] : this.shells[this.grab.i]
      if (!f.moved) return
      if (this.grab.kind === 'mould') (it as Mould).state = 'held'
      else if (!(it as Shell).held) this.liftShell(it as Shell)
      it.a = clamp(g.a, PATCH.a0 + 0.4, PATCH.a1 - 0.4)
      it.v = clamp(g.v, PATCH.v0 + 0.4, 0.6)
      return
    }
    if (f.mode === 'none') return
    this.marker.visible = true
    this.at(g.a, g.v, 0.04, this.marker.position)
    if (f.mode === 'bury') {
      const i = this.onDad(g.a, g.v)
      if (i >= 0 && this.dad.sneezeT < 0) this.buryAt(g.v, dt * PLAY.bury * (0.5 + Math.min(1.6, this.fingerSpeed)))
      else if (i < 0 && this.sand.diggable(g.a, g.v)) f.mode = 'dig'
      this.goDig(g.a, g.v)
      return
    }
    if (!this.sand.diggable(g.a, g.v)) return
    if (this.onDad(g.a, g.v) >= 0) {
      f.mode = 'bury'
      return
    }
    let took = 0
    if (f.mode === 'pat' && this.sand.heightAt(g.a, g.v) - this.sand.restAt(g.a, g.v) < DIG.patFrom * 0.5) {
      // Off the pile already: the stroke went across a wall (a channel out of the moat), not along it, so it digs,
      // and cuts the wall it crossed from where it began (#357: a channel started on the moat's rim left a dam).
      // (Only a straight stroke away from a hole just behind where it began: patting along a wall and slipping
      // off it keeps the wall.)
      f.mode = 'dig'
      const l = Math.hypot(g.a - f.sa, g.v - f.sv)
      const ba = f.sa - ((g.a - f.sa) / (l || 1)) * 0.45
      const bv = f.sv - ((g.v - f.sv) / (l || 1)) * 0.45
      if (f.trav < 1.4 && l > 0.7 * f.trav && this.sand.heightAt(ba, bv) < this.sand.restAt(ba, bv) - 0.1) {
        const n = Math.max(1, Math.ceil((l + 0.3) / (DIG.radius * 0.35)))
        const sa = f.sa - ((g.a - f.sa) / (l || 1)) * 0.3
        const sv = f.sv - ((g.v - f.sv) / (l || 1)) * 0.3
        took += this.sand.dig(g.a, g.v, g.a - sa, g.v - sv, n * 0.3, this.feel)
      }
    }
    if (f.mode === 'pat') {
      this.sand.pat(g.a, g.v, dt * (0.5 + Math.min(1.5, this.fingerSpeed)), this.feel)
      if ((this.scrapeT -= dt) <= 0) {
        this.scrapeT = 0.16
        patSnd()
        this.counts.pats++
      }
    } else {
      took += this.sand.dig(g.a, g.v, da, dv, dt, this.feel)
      this.lastDug = this.sand.restAt(g.a, g.v) - this.sand.heightAt(g.a, g.v)
      if (took > 0) {
        this.digT += dt
        this.counts.dug += took
        this.fillMoulds(g.a, g.v, took)
        if ((this.scrapeT -= dt) <= 0) {
          this.scrapeT = 0.11
          scrape(clamp(this.lastDug / DIG.deep, 0, 1))
        }
        // Sand flies off the finger, back toward Kaylee.
        if (Math.random() < dt * 40) {
          const p = this.at(g.a, g.v, 0.05)
          const s = this.sand.axes
          const side = Math.random() < 0.5 ? 1 : -1
          const px = -dv * side
          const pz = da * side
          const l = Math.hypot(px, pz) || 1
          const vx = (s.a.x * px + s.v.x * pz) / l
          const vz = (s.a.z * px + s.v.z * pz) / l
          this.puffs.emit(p.x, p.y, p.z, vx * 1.4 + (Math.random() - 0.5), 1.6 + Math.random() * 1.2, vz * 1.4 + (Math.random() - 0.5), 0.6, 0.05 + Math.random() * 0.04)
        }
        // Deep enough: a ghost crab may pop up out of the hole.
        if (this.lastDug > PLAY.crab && this.crab.state === 'gone' && this.crabsPopped < 3 && this.roundT > 3) this.popCrab(g.a, g.v)
      }
    }
    this.goDig(g.a, g.v)
  }

  /** Sand she digs beside a mould flies into it (the nearest one in reach that isn't full yet). */
  private fillMoulds(a: number, v: number, took: number) {
    let best: Mould | null = null
    let bd = PLAY.fillNear
    for (const m of this.moulds) {
      if ((m.state !== 'home' && m.state !== 'placed') || m.fill >= 1) continue
      const d = Math.hypot(m.a - a, m.v - v)
      if (d < bd) {
        bd = d
        best = m
      }
    }
    if (!best) return
    best.fill = Math.min(1, best.fill + took / this.fillNeed())
    // Scoops of sand arc from her finger into it.
    if (Math.random() < 0.7) {
      const p = this.at(a, v, 0.08)
      const q = this.at(best.a, best.v, 0.55)
      const T = 0.45
      this.puffs.emit(p.x, p.y, p.z, (q.x - p.x) / T, (q.y - p.y) / T + 4.5 * T, (q.z - p.z) / T, T, 0.07 + Math.random() * 0.03)
    }
    if (best.fill >= 1) {
      // Full: a pop, a twinkle and a bounce; now a tap flips it.
      best.wob = 1
      sfx.pop()
      twinkle()
      const p = this.at(best.a, best.v, 0.6)
      for (let i = 0; i < 10; i++) this.sparkle.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 0.8, 0.8 + Math.random(), (Math.random() - 0.5) * 0.8, 0.9, 0.06)
    }
  }
  /** Sand a mould needs to fill (m³): a little for the first tower of the round, more for each one after. */
  private fillNeed() {
    return PLAY.fill * (1 + PLAY.fillMore * (this.round === 'towers' ? this.towersThisRound : 1))
  }

  /** Kaylee comes and sits by her finger. */
  private goDig(a: number, v: number) {
    const goal = { a: clamp(a + 0.3, DIGGABLE.a0 - 0.4, DIGGABLE.a1 + 0.4), v: clamp(v + DIG.kaylee, DIGGABLE.v0 + 0.5, -0.2) }
    // (Not on top of Daddy: the other side of her finger.)
    if (Math.abs(goal.a - this.dad.a) < this.dad.width * 1.4 && goal.v < this.dad.feet + 0.3) goal.v = this.dad.feet + 0.6
    const k = this.kaylee.root.position
    const here = this.sand.local(k.x, k.z)
    const far = Math.hypot(goal.a - here.a, goal.v - here.v)
    const moved = this.kGoal ? Math.hypot(goal.a - this.kGoal.a, goal.v - this.kGoal.v) : 99
    if (far > 0.7 && moved > 0.6) {
      this.kGoal = goal
      this.sitting = false
      const p = this.sand.world(goal.a, goal.v)
      this.kaylee.walk([[p.x, p.z]], () => {
        if (this.finger) {
          this.sitting = true
          this.kaylee.setPose('sit')
        }
      })
    } else if (!this.kaylee.walking && this.finger && !this.sitting) {
      this.sitting = true
      this.kaylee.setPose('sit')
    }
    const p = this.sand.world(a, v)
    if (!this.kaylee.walking) this.kaylee.faceToward(p.x, p.z)
  }

  /** Sand heaped over Daddy where her finger rubs: most on the part under it, some on the parts either side. */
  private buryAt(v: number, k: number) {
    const d = this.dad
    const along = (d.feet - v) / d.len
    if ((this.scrapeT -= 1 / 60) <= 0) {
      this.scrapeT = 0.14
      hiss(0.12, 0.08, 'lowpass', 900, 500)
    }
    for (let i = 0; i < d.at.length; i++) {
      const w = clamp(1 - (Math.abs(along - d.at[i]) * d.len) / 0.6, 0, 1)
      if (w > 0 && d.buried[i] < 1) this.bury(i, k * w)
    }
  }
  private bury(i: number, k: number) {
    const d = this.dad
    const was = d.buried[i]
    d.buried[i] = Math.min(1, was + k)
    const m = d.mounds[i]
    m.visible = true
    // Sand pouring down onto him.
    const p = m.getWorldPosition(tmp)
    if (Math.random() < 0.5) this.puffs.emit(p.x + (Math.random() - 0.5) * 0.4, p.y + 0.5, p.z + (Math.random() - 0.5) * 0.4, 0, -0.5, 0, 0.5, 0.06)
    if (was < 1 && d.buried[i] >= 1) {
      tone(600 + i * 120, 650 + i * 120, 0.12, 0.05, 'triangle')
      if (d.buried.every((b) => b >= 1)) {
        this.counts.buried++
        // Then, a moment later, he wiggles his toes and sneezes himself out (unless she taps him first).
        d.outT = 0
        giggle()
        this.talk('buried', S.buried, 20)
        twinkle()
        const h = this.nick.root.position
        for (let j = 0; j < 14; j++) this.sparkle.emit(h.x + (Math.random() - 0.5) * 1.2, h.y + 0.5, h.z + (Math.random() - 0.5) * 1.2, 0, 1 + Math.random(), 0, 1.1, 0.06)
      }
    }
  }

  private liftShell(s: Shell) {
    s.held = true
    if (s.on) {
      this.scene.attach(s.g)
      s.on = null
    }
    sfx.pop()
  }

  /** Let go of what she carried. */
  private drop() {
    const g = this.grab
    if (!g) return
    if (g.kind === 'mould') {
      const m = this.moulds[g.i]
      m.state = 'placed'
      m.t = 0
      sfx.thump()
      const p = this.at(m.a, m.v)
      this.puffs.burst(p.x, p.y + 0.05, p.z, 6, 0.8, 0.8, 0.05)
    } else {
      const s = this.shells[g.i]
      s.held = false
      // Pushed into a tower's side if it's dropped on one, else into the sand.
      const tw = this.towers.find((t) => t.slump < 0 && Math.hypot(t.a - s.a, t.v - s.v) < 0.5)
      this.counts.shells++
      if (tw) {
        const dir = this.sand.axes
        let ca = s.a - tw.a
        let cv = s.v - tw.v
        const l = Math.hypot(ca, cv)
        if (l < 0.05) {
          ca = 0
          cv = -1
        } else {
          ca /= l
          cv /= l
        }
        // Mostly toward the camera, so she sees it.
        cv = Math.min(cv, -0.3)
        const n = Math.hypot(ca, cv)
        const ox = (dir.a.x * ca + dir.v.x * cv) / n
        const oz = (dir.a.z * ca + dir.v.z * cv) / n
        const r = tw.kind === 'square' ? 0.23 : 0.27
        tw.m.body.attach(s.g)
        const wp = tmp.set(tw.m.root.position.x + ox * r, tw.y + 0.12 + Math.random() * 0.2, tw.m.root.position.z + oz * r)
        tw.m.body.worldToLocal(wp)
        s.g.position.copy(wp)
        s.g.rotation.set(-1.2, Math.atan2(ox, oz), 0)
        s.on = tw
        tw.wob = 1
      } else {
        s.g.rotation.set(0, s.g.rotation.y, 0)
      }
      patSnd()
    }
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) this.counts.pokes++
    const pop = (p: Vector3, n = 10) => {
      for (let i = 0; i < n; i++) this.sparkle.emit(p.x + (Math.random() - 0.5) * 0.4, p.y + 0.3, p.z + (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.8, 1 + Math.random(), (Math.random() - 0.5) * 0.8, 0.9, 0.06)
    }
    if (id?.startsWith('mould:')) return this.flip(+id.slice(6))
    if (id?.startsWith('shell:')) {
      const s = this.shells[+id.slice(6)]
      s.wob = 1
      tone(1400, 1800, 0.1, 0.05, 'sine')
      return pop(s.g.getWorldPosition(tmp), 5)
    }
    if (id?.startsWith('tower:')) {
      const tw = this.towers[+id.slice(6)]
      if (!tw) return
      tw.wob = 1
      if (tw.hermit) {
        // The hermit crab pops its eyes out of the door.
        tw.m.peek.scale.setScalar(1.6)
        sfx.chirp()
      } else {
        tw.m.flag.visible = !tw.m.flag.visible
        tone(900, 1300, 0.12, 0.05, 'triangle')
      }
      return pop(tw.m.root.position.clone().setY(tw.y + 0.4), 6)
    }
    switch (id) {
      case 'kaylee':
        this.kaylee.react('hop')
        return sfx.boing()
      case 'family:nick': {
        const d = this.dad
        if (d.buried.some((b) => b > 0.3)) return this.sneeze()
        this.nick.react('wiggle')
        this.talk('dad', S.dad, 3)
        return giggle()
      }
      case 'toes':
        this.dad.toesT = 0
        this.counts.toes++
        this.nick.react('wiggle')
        this.talk('toes', S.toes, 3)
        return giggle()
      case 'family:ji':
        this.ji.react('wave')
        this.talk('mommy', S.mommy, 3)
        return tone(880, 1100, 0.15, 0.05, 'triangle')
      case 'umbrella':
        this.umbSpin += 9
        return sfx.fwip()
      case 'ball':
        this.ballT = 0
        return sfx.boing()
      case 'crab':
        if (this.crab.state === 'run' || this.crab.state === 'up') {
          this.crab.state = 'wave'
          this.crab.t = 0
          sfx.chirp()
        }
        return
      case 'hermit':
        this.hermit.parts.legs.scale.setScalar(0.3)
        return sfx.chirp()
      case 'boat':
        this.boatBob = 1
        return toot()
    }
    // On the sand: a pat (the dig itself already happened on the finger's way down); on the sea: a splash.
    const g = this.groundPoint(x, y)
    if (g && !this.sand.diggable(g.a, g.v) && this.sand.surfaceAt(g.a, g.v) <= this.sea + 0.01) {
      const p = this.at(g.a, g.v)
      this.spray.burst(p.x, this.sea + 0.05, p.z, 14, 1.2, 2, 0.06)
      sfx.splash()
    }
  }

  private sneeze() {
    const d = this.dad
    d.sneezeT = 0
    d.outT = -1
    this.counts.sneezes++
    sneeze()
    this.talk('sneeze', S.sneeze, 4)
    // Kaylee laughs as the sand flies.
    this.later.push({
      at: this.time + 0.9,
      fn: () => {
        this.kaylee.react('hop')
        giggle()
      },
    })
  }

  // ---------------------------------------------------------------- the moulds and the towers

  private flip(i: number) {
    const m = this.moulds[i]
    if (m.state !== 'home' && m.state !== 'placed') return
    // Poked before the round of towers: she found the moulds, so it begins.
    if (this.round === 'dig') this.setRound('towers')
    if (m.fill < 1) {
      // Not full yet: it wobbles (rattle rattle) and Sparkle says to dig sand into it.
      m.wob = 1
      sfx.boing()
      this.talk('fill', S.hint.fill, 6)
      return
    }
    // Tapped where it waits (or over Daddy, or the sea): it hops onto the castle first, to a free spot.
    if (m.state === 'home' || this.onDad(m.a, m.v) >= 0 || m.v > 0) {
      const spot = this.freeSpot()
      m.from = { a: m.a, v: m.v }
      m.a = spot.a
      m.v = spot.v
      m.state = 'flip'
      m.t = -0.45
      this.counts.flips++
      return sfx.boing()
    }
    m.state = 'flip'
    m.t = 0
    this.counts.flips++
    sfx.fwip()
  }

  /** A spot on the castle with no tower on it and no hole under it (round the middle, further out each ring). */
  private freeSpot() {
    const { C } = this
    for (let ring = 0; ring < 6; ring++)
      for (let i = 0; i < (ring === 0 ? 1 : 8); i++) {
        const t = i * 0.785 + ring * 0.4
        const r = ring * 0.45
        const a = C.a + Math.cos(t) * r
        const v = C.v + Math.sin(t) * r * 0.8
        if (!this.sand.diggable(a, v) || this.onDad(a, v) >= 0) continue
        if (this.sand.heightAt(a, v) < this.sand.restAt(a, v) - 0.08) continue
        if (this.towers.some((tw) => tw.slump < 0 && Math.hypot(tw.a - a, tw.v - v) < 0.6)) continue
        return { a, v }
      }
    return { a: C.a + 1.8, v: C.v - 1.4 }
  }

  private addTower(kind: MouldKind, a: number, v: number, now = false) {
    // Slumped towers leave the list (their slot, and its tap target, goes to the next one); past MAX_TOWERS the
    // oldest standing one slumps and goes at once.
    const gone = (tw: Tower) => {
      this.scene.remove(tw.m.root)
      if (this.hermitState.tower === tw) this.hermitState.tower = null
    }
    this.towers = this.towers.filter((tw) => (tw.slump < 0 ? true : (gone(tw), false)))
    if (this.towers.length >= MAX_TOWERS) {
      const old = this.towers[0]
      this.slump(old)
      gone(old)
      this.towers.shift()
    }
    const m = towerModel(this.bag, kind)
    const y = this.sand.heightAt(a, v)
    const p = this.sand.world(a, v)
    m.root.position.set(p.x, y - 0.02, p.z)
    m.root.rotation.y = this.seaYaw + Math.PI
    this.scene.add(m.root)
    const tw: Tower = { m, kind, a, v, y, grow: now ? 1 : 0, slump: -1, wob: 0, half: false, hermit: false }
    // (The sand under a tower is packed flat.)
    this.towers.push(tw)
    this.counts.towers++
    if (this.round === 'towers') this.towersThisRound++
    return tw
  }

  /** A tower slumps into a heap of sand (dug under, or too many). */
  private slump(tw: Tower, half = false) {
    if (tw.slump >= 0) return
    for (const s of this.shells)
      if (s.on === tw) {
        this.scene.attach(s.g)
        s.on = null
        s.v -= 0.3
        s.g.rotation.set(0, s.g.rotation.y, 0)
      }
    if (half) {
      tw.half = true
      tw.wob = 1.4
      this.sand.add(tw.a, tw.v + 0.35, 0.35, 0.025)
    } else {
      tw.slump = 0
      this.counts.slumps++
      this.sand.add(tw.a, tw.v, 0.42, 0.045)
    }
    sfx.thump()
    const p = tw.m.root.position
    this.puffs.burst(p.x, tw.y + 0.2, p.z, 14, 1.2, 1.4, 0.07)
  }

  private washTower() {
    // The tower nearest the sea (if any stand) loses its front to the big wave.
    const tw = this.towers.filter((x) => x.slump < 0 && !x.half).sort((p, q) => q.v - p.v)[0]
    if (!tw) return
    this.counts.washed++
    this.slump(tw, true)
    // (Not once the moat has filled: that's the payoff, and Daddy's cheer shouldn't turn into an oh no.)
    if (!this.counts.filled) this.talk('washed', S.washed, 10)
    sadSlide()
    const p = tw.m.root.position
    this.spray.burst(p.x, tw.y + 0.2, p.z, 24, 1.6, 2.2, 0.07)
  }

  private popCrab(a: number, v: number) {
    const c = this.crab
    c.a = a
    c.v = v
    c.state = 'up'
    c.t = 0
    // It runs sideways to whichever edge is nearer.
    c.dir = a > 0 ? 1 : -1
    c.m.root.visible = true
    this.crabsPopped++
    this.counts.crabs++
    sfx.chirp()
    this.once('crab', S.crab)
  }

  // ---------------------------------------------------------------- everyone's life

  private life(dt: number, t: number) {
    // Kaylee: rides the sand's height; digs along while she sits by the finger.
    const k = this.kaylee.root.position
    const kl = this.sand.local(k.x, k.z)
    const ky = this.sand.inside(kl.a, kl.v) ? Math.max(this.sand.heightAt(kl.a, kl.v), this.sand.surfaceAt(kl.a, kl.v) - 0.25) : Math.max(0, this.isl.ground.heightAt(k.x, k.z))
    this.kHold.position.y += (ky - this.kHold.position.y) * ease(dt, 14)
    if (!this.finger && this.sitting && this.time - this.lastTouch > 2.5) {
      this.sitting = false
      this.kaylee.setPose('stand')
    }
    this.kaylee.update(dt, t)
    if (this.sitting && this.finger && this.finger.mode !== 'none' && this.finger.mode !== 'grab') this.kaylee.rig.body.rotation.x += 0.16 * Math.sin(t * 15)
    this.kShadow.position.set(k.x, this.kHold.position.y + 0.02, k.z)
    // Everyone glances at her finger, or at her.
    const look = this.finger ? this.at(this.finger.a, this.finger.v) : this.kaylee.root.getWorldPosition(tmp2).setY(this.kHold.position.y + 0.6)
    this.ji.lookAt(look.x, look.y, look.z)
    this.nick.lookAt(look.x, look.y + 1, look.z)
    this.nick.update(dt, t)
    this.ji.update(dt, t)

    // Daddy's blanket of sand: each mound eases to how buried that part is; a sneeze blows them all off. All buried,
    // he lies still a moment, wiggles his toes, then sneezes himself out (and she can bury him again).
    const d = this.dad
    if (d.outT >= 0 && d.sneezeT < 0) {
      const was = d.outT
      d.outT += dt
      const at = PLAY.wiggleOut
      if (was < at - 1.1 && d.outT >= at - 1.1) {
        d.toesT = 0
        giggle()
      }
      if (d.outT >= at) {
        this.counts.wiggledOut++
        this.sneeze()
      }
    }
    if (d.sneezeT >= 0) {
      d.sneezeT += dt
      const p = this.nick.root.position
      this.nick.rig.head.rotation.x = -0.5 * bellK(d.sneezeT / 0.5) + 0.7 * span(d.sneezeT, 0.45, 0.55) * (1 - span(d.sneezeT, 0.55, 0.9))
      if (d.sneezeT > 0.45 && d.sneezeT - dt <= 0.45) {
        for (let i = 0; i < d.mounds.length; i++) {
          if (d.buried[i] <= 0) continue
          const m = d.mounds[i].getWorldPosition(tmp)
          this.puffs.burst(m.x, m.y + 0.2, m.z, 26, 2.6, 3, 0.08)
          d.buried[i] = 0
        }
        this.nick.react('hop')
        void p
      }
      if (d.sneezeT > 1.2) d.sneezeT = -1
    }
    d.mounds.forEach((m, i) => {
      const goal = d.buried[i]
      const s = m.scale.x + (Math.max(0.001, goal) - m.scale.x) * ease(dt, d.sneezeT >= 0 ? 30 : 8)
      m.scale.setScalar(s)
      m.visible = s > 0.02
    })
    // His toes: they wiggle when tapped (the foot mound jiggles with them).
    if (d.toesT >= 0) {
      d.toesT += dt
      const w = Math.sin(d.toesT * 30) * (1 - span(d.toesT, 0, 1.2))
      d.mounds[0].rotation.z = w * 0.12
      if (d.toesT > 1.2) d.toesT = -1
    }

    // The moulds: arrive, wait, get carried, flip and leave a tower, hop home.
    for (const m of this.moulds) {
      m.t += dt
      let lift = 0
      let flipR = 0
      if (m.state === 'away') {
        m.root.visible = false
        continue
      }
      m.root.visible = true
      if (m.state === 'arrive') {
        const kk = span(m.t, 0, 0.6)
        m.a = m.from.a + (m.home.a - m.from.a) * kk
        m.v = m.home.v
        lift = bellK(kk) * 0.8
        if (m.t > 0.6) {
          m.state = 'home'
          sfx.thump()
        }
      } else if (m.state === 'held') lift = 0.3
      else if (m.state === 'flip' && m.t < 0) {
        // Hopping over to the castle first.
        const kk = span(m.t, -0.45, 0)
        const a = m.from.a + (m.a - m.from.a) * kk
        const v = m.from.v + (m.v - m.from.v) * kk
        this.at(a, v, bellK(kk) * 0.7, m.root.position)
        m.lift = 0
        m.body.rotation.x = 0
        m.body.position.y = 0
        continue
      } else if (m.state === 'flip') {
        // Up and over (0-0.3), slam (0.3-0.42), pat pat (0.42-0.75), lift off the tower (0.75-1.05), then home.
        const tt = m.t
        lift = tt < 0.3 ? bellK(tt / 0.6) * 0.5 : tt < 0.42 ? 0.5 * (1 - span(tt, 0.3, 0.42)) : tt < 0.75 ? 0 : span(tt, 0.75, 1.05) * 0.55
        flipR = tt < 0.75 ? span(tt, 0, 0.32) * Math.PI : Math.PI * (1 - span(tt, 0.85, 1.05))
        if (tt > 0.42 && tt - dt <= 0.42) {
          // (The sand stays behind as the tower.)
          m.fill = 0
          sfx.thump()
          const p = this.at(m.a, m.v)
          this.puffs.burst(p.x, p.y + 0.05, p.z, 12, 1.1, 1.0, 0.06)
        }
        if ((tt > 0.55 && tt - dt <= 0.55) || (tt > 0.68 && tt - dt <= 0.68)) patSnd()
        if (tt > 0.75 && tt - dt <= 0.75) {
          // The tower is there under it now.
          const tw = this.addTower(m.kind, m.a, m.v)
          tw.grow = 0.98
          twinkle()
          const p = this.at(m.a, m.v, 0.5)
          for (let i = 0; i < 12; i++) this.sparkle.emit(p.x, p.y, p.z, (Math.random() - 0.5) * 1.2, 0.6 + Math.random(), (Math.random() - 0.5) * 1.2, 1, 0.06)
        }
        if (tt > 1.1) {
          m.state = 'back'
          m.t = 0
          m.from = { a: m.a, v: m.v }
        }
      } else if (m.state === 'back') {
        const kk = span(m.t, 0, 0.55)
        m.a = m.from.a + (m.home.a - m.from.a) * kk
        m.v = m.from.v + (m.home.v - m.from.v) * kk
        lift = bellK(kk) * 0.7
        if (kk >= 1) m.state = 'home'
      }
      // A full one hops now and then (tap me!).
      if (m.fill >= 1 && (m.state === 'home' || m.state === 'placed')) {
        const ph = (t * 0.75 + this.moulds.indexOf(m) * 0.31) % 1
        lift = Math.max(lift, ph < 0.22 ? bellK(ph / 0.22) * 0.18 : 0)
      }
      m.lift += (lift - m.lift) * (m.state === 'flip' || m.state === 'arrive' || m.state === 'back' ? 1 : ease(dt, 12))
      this.at(m.a, m.v, m.lift, m.root.position)
      m.body.rotation.x = flipR
      m.body.position.y = flipR > 0.01 ? Math.sin(flipR) * 0.25 + (1 - Math.cos(flipR)) * 0.23 : 0
      m.wob = Math.max(0, m.wob - dt * 2.5)
      m.body.rotation.z = Math.sin(t * 30) * m.wob * 0.18
      m.sand.visible = m.fill > 0.01
      m.sand.scale.y = Math.max(0.001, Math.min(1, m.fill))
      m.heap.visible = m.fill >= 1
    }

    // The towers: grow in, wobble, slump when the sand under them goes.
    for (const tw of this.towers) {
      if (tw.slump >= 0) {
        tw.slump += dt
        const kk = span(tw.slump, 0, 0.4)
        tw.m.body.scale.set(1 + kk * 0.5, Math.max(0.001, 1 - kk), 1 + kk * 0.5)
        if (kk >= 1) tw.m.root.visible = false
        continue
      }
      tw.grow = Math.min(1, tw.grow + dt * 6)
      tw.wob = Math.max(0, tw.wob - dt * 2)
      const under = this.sand.heightAt(tw.a, tw.v)
      if (under < tw.y - PLAY.sink) {
        this.slump(tw)
        continue
      }
      const sq = tw.half ? 0.55 : 1
      tw.m.body.scale.set(1 + Math.sin(t * 22) * tw.wob * 0.05, sq * (0.4 + 0.6 * tw.grow) * (1 + Math.sin(t * 22 + 1) * tw.wob * 0.06), 1)
      tw.m.body.rotation.z = tw.half ? 0.12 : 0
      tw.m.peek.scale.setScalar(Math.max(1, tw.m.peek.scale.x - dt * 2))
      tw.m.peek.visible = tw.hermit && Math.sin(t * 0.7 + tw.a) > -0.3
    }

    // The shells wobble when poked; carried ones float under her finger.
    for (const s of this.shells) {
      s.wob = Math.max(0, s.wob - dt * 2.5)
      if (!s.on) this.at(s.a, s.v, s.held ? 0.25 : 0.0, s.g.position)
      if (s.held) s.g.rotation.y += dt * 2
      s.g.scale.setScalar(1 + Math.sin(t * 24) * s.wob * 0.15)
      s.g.visible = this.round !== 'dig' || s.on !== null || s.held
    }

    // The ghost crab: up out of the hole, a sideways scuttle to the edge, down a hole there.
    const c = this.crab
    if (c.state !== 'gone') {
      c.t += dt
      let up = 1
      if (c.state === 'up') {
        up = span(c.t, 0, 0.5)
        if (c.t > 0.7) {
          c.state = 'run'
          c.t = 0
        }
      } else if (c.state === 'run') {
        c.a += c.dir * 2.2 * dt
        c.v += Math.sin(c.t * 3) * 0.3 * dt
        if (Math.abs(c.a) > PATCH.a1 - 0.6) {
          c.state = 'down'
          c.t = 0
        }
      } else if (c.state === 'wave') {
        if (c.t > 1) {
          c.state = 'run'
          c.t = 0
        }
      } else if (c.state === 'down') {
        up = 1 - span(c.t, 0, 0.4)
        if (c.t > 0.4) {
          c.state = 'gone'
          c.m.root.visible = false
        }
      }
      this.at(c.a, c.v, -0.2 * (1 - up), c.m.root.position)
      c.m.root.rotation.y = this.seaYaw + Math.PI
      c.m.body.position.y = c.state === 'run' ? Math.abs(Math.sin(c.t * 26)) * 0.03 : 0
      const wave = c.state === 'wave' ? 1 : 0
      c.m.claws.forEach((cl, i) => (cl.rotation.x = -wave * (1.2 + Math.sin(c.t * 14 + i * 2) * 0.4)))
    }

    // The hermit crab: up out of the sea to its tower's door (or a paddle round the moat).
    const hs = this.hermitState
    if (hs.state !== 'gone') {
      hs.t += dt
      const leg = this.hermit.parts.legs
      leg.scale.setScalar(Math.min(1, leg.scale.x + dt * 2))
      if (hs.state === 'walk') {
        const kk = span(hs.t, 0, 7)
        const a = hs.from.a + (hs.to.a - hs.from.a) * kk
        const v = hs.from.v + (hs.to.v - hs.from.v) * kk
        this.at(a, v, Math.abs(Math.sin(hs.t * 8)) * 0.02, this.hermit.root.position)
        const to = this.sand.world(hs.to.a, hs.to.v)
        const here = this.hermit.root.position
        this.hermit.root.rotation.y = Math.atan2(to.x - here.x, to.z - here.z)
        if (kk >= 1) {
          if (hs.tower && hs.tower.slump < 0) {
            hs.state = 'home'
            hs.tower.hermit = true
            this.hermit.root.visible = false
            sfx.pop()
            twinkle()
            this.once('hermit', S.hermit)
          } else hs.state = 'swim'
          hs.t = 0
        }
      } else if (hs.state === 'swim') {
        const a = hs.to.a + Math.cos(hs.t * 0.6) * 0.6
        const v = hs.to.v + Math.sin(hs.t * 0.6) * 0.4
        this.at(a, v, 0, this.hermit.root.position)
        this.hermit.root.position.y = Math.max(this.hermit.root.position.y, this.sand.surfaceAt(a, v) - 0.12)
        this.hermit.root.rotation.y = this.seaYaw + hs.t * 0.6
      }
    }

    // The longtail goes by out on the bay; the ball bounces; the umbrella spins.
    this.boatS += dt * 2.4
    if (this.boatS > 45) this.boatS = -45
    this.boatBob = Math.max(0, this.boatBob - dt * 1.5)
    const bp = this.sand.world(this.boatS, 22)
    this.boat.root.position.set(bp.x, this.sea + Math.sin(t * 1.4) * 0.08 + Math.sin(this.boatBob * 12) * this.boatBob * 0.25, bp.z)
    const ax = this.sand.axes.a
    this.boat.root.rotation.y = Math.atan2(ax.x, ax.z)
    this.boat.body.rotation.z = Math.sin(t * 1.1) * 0.04
    if (this.ballT >= 0) {
      this.ballT += dt
      const kk = this.ballT / 0.9
      this.ball.ball.position.y = 0.26 + bellK(kk) * 1.3 + (kk > 1 ? bellK((kk - 1) / 0.4) * 0.3 : 0)
      this.ball.ball.rotation.x += dt * 8
      if (kk > 1 && kk - dt / 0.9 <= 1) sfx.boing()
      if (kk > 1.4) this.ballT = -1
    }
    this.at(this.ballAt.a, this.ballAt.v, 0, this.ball.root.position)
    this.umbSpin = Math.max(0, this.umbSpin - dt * 6)
    this.umb.can.rotation.y += this.umbSpin * dt
  }

  private placeThings(_dt: number) {
    // (Daddy and the blanket ride the sand, which never moves under him.)
    void _dt
    const d = this.dad
    const fp = this.sand.world(d.a, d.feet + 0.08)
    d.toes.position.set(fp.x, this.sand.heightAt(d.a, d.feet) + this.nick.rig.radius, fp.z)
  }

  // ---------------------------------------------------------------- camera

  private shot(): Shot {
    const { C } = this
    // Looking out to sea from up the beach, steeply down over the sand: the castle in the middle, the sea at the top.
    const center = this.at(C.a + 0.2, C.v + (this.tall ? 0.55 : 1.15), 0.1)
    const yaw = (this.seaYaw + Math.PI) * DEG
    // (Tall screens look down more steeply, so the sand fills the height instead of the sky and the sea.)
    const half = this.tall ? new Vector3(4.0, 0.5, 3.9) : new Vector3(5.6, 0.5, 4.2)
    return { center, half, yaw, pitch: PLAY.pitch + (this.tall ? PLAY.tallPitch : 0), follow: true, minDist: 5, maxDist: 40 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: { a: number; v: number } | null = null
    let hintLine: Line = S.hint[this.round]
    const idle = !this.finger && t - this.lastTouch > HINT_S
    if (idle) {
      if (this.round === 'dig') at = { a: this.C.a + Math.cos(t * 1.6) * 1.1, v: this.C.v + Math.sin(t * 1.6) * 0.9 }
      else if (this.round === 'towers') {
        // A full mould: tap it. Else digging beside the fullest one.
        const ready = this.moulds.filter((x) => x.state === 'home' || x.state === 'placed')
        const full = ready.find((x) => x.fill >= 1)
        const m = full ?? ready.sort((p, q) => q.fill - p.fill)[0]
        if (full) at = { a: full.a, v: full.v }
        else if (m) at = { a: m.a + 0.9 + Math.cos(t * 2.4) * 0.35, v: m.v + 0.55 + Math.sin(t * 2.4) * 0.25 }
        hintLine = full ? S.hint.towers : S.hint.fill
      } else if (this.round === 'tide' && this.filledAt < 0 && this.tideK > 0.5 && !this.breach) {
        // Along the way a channel would go: from the moat's side nearest the sea, straight down to the water.
        const from = this.moatSea() ?? this.C
        const k = (t * 0.6) % 1
        at = { a: from.a, v: from.v + (this.edgeV(from.a) + 0.3 - from.v) * k }
      }
    }
    // Once each time she goes quiet: Sparkle's hint (only shown the first time, then said at most twice a visit).
    if (at && !this.hinted) {
      this.hinted = true
      this.events.say(hintLine, !spendHint(hintLine))
    } else if (!idle) this.hinted = false
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    const s = this.toScreen(this.at(at.a, at.v, 0.05))
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | Vector3 | null, height: number, scale = 1.6, lift = 0) => {
      let spot: { x: number; y: number; size: number } | null = null
      const vis = who && (who instanceof Vector3 || who.visible !== false)
      if (who && vis) {
        const base = who instanceof Vector3 ? who.clone() : who.getWorldPosition(new Vector3())
        const c = this.toScreen(tmp.copy(base).setY(base.y + lift + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + lift + height))
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
    const d = this.dad
    for (const [id, el] of this.anchorEls) {
      if (id === 'kaylee') place(el, this.kaylee.root, this.kaylee.height, 0.8)
      else if (id === 'family:nick') place(el, this.at(d.a, d.feet - d.len * 0.86, 0.2), 0.5, 1.2)
      else if (id === 'toes') place(el, d.toes, 0.2, 1.5)
      else if (id === 'family:ji') place(el, this.ji.root, this.ji.height * 0.8, 1)
      else if (id === 'umbrella') place(el, this.umb.can, 0.5, 1.6, -0.2)
      else if (id === 'ball') place(el, this.ball.ball, 0.5, 1.6, -0.25)
      else if (id === 'crab') place(el, this.crab.state === 'gone' ? null : this.crab.m.root, 0.25, 2)
      else if (id === 'hermit') place(el, this.hermitState.state === 'walk' || this.hermitState.state === 'swim' ? this.hermit.root : null, 0.35, 2)
      else if (id === 'boat') place(el, this.boat.root, 1.6, 1.2)
      else if (id.startsWith('mould:')) {
        const m = this.moulds[+id.slice(6)]
        place(el, m.state === 'home' || m.state === 'placed' ? m.root : null, 0.5, 1.6)
      } else if (id.startsWith('shell:')) {
        const s = this.shells[+id.slice(6)]
        place(el, s.g.visible && !s.held ? s.g : null, 0.15, 2.4)
      } else if (id.startsWith('tower:')) {
        const tw = this.towers[+id.slice(6)]
        place(el, tw && tw.slump < 0 ? tw.m.root : null, 0.5, 1.2)
      }
      el.style.zIndex = id.startsWith('mould:') || id.startsWith('shell:') ? '3' : id === 'toes' || id === 'family:nick' ? '2' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const d = this.dad
    return {
      section: 'sandcastle',
      phase: this.round,
      round: this.round,
      tide: +this.tideK.toFixed(2),
      sea: +this.sea.toFixed(3),
      pooled: +this.sand.pooled().toFixed(2),
      moatFilled: this.filledAt >= 0,
      sand: this.sand.summary(),
      towersStanding: this.towers.filter((tw) => tw.slump < 0).length,
      dadBuried: d.buried.map((b) => +b.toFixed(2)),
      castle: sc(this.at(this.C.a, this.C.v)),
      sea0: sc(this.at(this.C.a, 0.4)),
      dad: sc(this.at(d.a, d.feet - d.len * 0.4, 0.3)),
      kaylee: sc(this.kaylee.root.getWorldPosition(new Vector3()).setY(this.kHold.position.y + 0.4)),
      moulds: this.moulds.map((m) => ({ state: m.state, ...sc(this.at(m.a, m.v, 0.25)) })),
      hermit: this.hermitState.state,
      ...this.counts,
      dug: +this.counts.dug.toFixed(3),
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
