// Kaylee's little rice farm at Sapan, under Stop Time Cafe (plan: planning/around-the-world/thailand/nan-rice.md),
// in shapes and sounds, with voices. Two places in one world: the farm on the valley floor (the camera looks
// down on it from high in front) and the café's deck up on the hill behind, where the camera glides at the end.
//
// The toy, one verb all the way through: lead Kaylee with a finger. Held anywhere on the farm, her finger is where she
// trots to (she follows it as long as it's held; a tap walks her there), splashing through the paddies, hopping up and
// down the step. Whatever she walks through changes behind her, like a lawnmower's stripe:
//   plant:   she carries a bundle of seedlings, and where she wades they plip into the mud in neat rows. Paddy A is
//            flooded; the other three are dry, and seedlings planted there come up droopy and yellow until she opens
//            the paddy's gate (a tap, or walking into it): the channel's water rushes in and they spring up green. A
//            paddy 70% planted plants the rest itself. All planted and flooded: a run of bells.
//   grow:    the rice grows by itself, young green to tall to golden, while little birds fly down to peck at it. She
//            walks Kaylee at them and they flap off to the scarecrow's arms (they aren't scared of it), the hut's roof
//            or the rack. More birds as it grows; one left pecking gets round. Halfway, a little cloud rains on the farm.
//            All golden: the water drains away.
//   harvest: she holds a sickle, and the rice she walks through is cut into her arms; every armful is tied into a
//            bundle that pops onto the bank. One paddy grew extra tall: only her horn and ears show above it, and two
//            birds burst out when she wades in. All cut: the bundles hop onto the drying rack.
//   thresh:  the side verb. The camera comes close on the threshing corner; each tap and Kaylee takes the next bundle
//            off the rack (if her hands are empty), swings it up over her head and bangs it down on the board: THWACK,
//            the grains spray into the big basket and its heap rises. Two bangs empty a bundle and she tosses the straw
//            onto the pile (it grows). Five bundles heap the basket: it shakes, the chaff blows away, the grains turn
//            white, and a steaming kratip of sticky rice pops up out of it. Then the deck.
//   deck:    #168's: Kaylee and Daddy on the tall stools, her pink milk (tap to sip), the kratip (tap: she eats a ball of
//            sticky rice, a grain stuck on her cheek), Mommy's photo, then the video and the end card (Rice.tsx).
// Lung Kham, the farmer (an old monkey in his ngob, on the boardwalk's right end), needs a helper: he says what each
// round is for, hops when a paddy's done, counts the bundles in Thai as she threshes, and gives her the sticky rice.
// Silly instead of wrong: wade into Daddy and he shakes like a dog (in the harvest she drops straw on his head); walk
// into the buffalo's wallow and you both get muddy (the water washes it off); flop into the straw pile; round birds.
// Things to poke: the gates, the scarecrow (it spins, its hat flies), the buffalo, the ducks, the frog, the nursery bed,
// the straw pile, the hut's chime, the banana plant, the bamboo, the café up the hill, Daddy, Lung.
// Talk (lines.ts L.nan.rice): Lung says what the round is for, then Sparkle (queued behind him) what to do, and after
// ~8 s with nothing done she says it again (stuckLine); Lung and Daddy react on the farm and Mommy on the deck, each
// thing once; a first tap on the buffalo, a duck, the view or the kratip tells a fact. Now and then, when nobody's
// talking, far-off farm life: a frog, a bird, a duck, a chime, the buffalo.
import { Color, Group, IcosahedronGeometry, Matrix4, MeshBasicMaterial, OctahedronGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, speakingVoice, spendHint, type Line } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { Member } from '../../../characters/member'
import { L } from '../../../lines'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { photoCamera, snapPhoto } from '../../../../../engine3d/photo'
import { PAL } from '../../../../../engine3d/toon'
import { THAI_TUNE } from '../../../tune'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import { Birds, type BirdHost } from './birds'
import { buildDeck, buildKratip, type Deck, type Kratip } from './deck'
import { buildFarm, buildKayleeKit, LUNG, lungNgob, sheaf, STRAW, type Farm } from './farm'
import { bladesGeometry, headsGeometry, hillMatrix, Instanced, stubbleGeometry } from './hills'
import { FarmLife } from './life'
import {
  BANGS_PER,
  BASKET,
  BIRDS,
  BLOCKERS,
  BOARDWALK,
  BRIDGES,
  BRUSH,
  BUNDLES,
  CUT_AT,
  DECK,
  GROW_S,
  HILLS,
  inChannel,
  KAYLEE_AT,
  LEAN_R,
  levelAt,
  LUNG_AT,
  MOMMY_AT,
  MUD_DOWN,
  NICK_AT,
  NURSERY,
  PADDIES,
  paddyAt,
  PER_PADDY,
  PHOTO_FROM,
  PLANTED_AT,
  RACK,
  RISE,
  RISER_Z,
  SCARECROW,
  SHOO_BOOST,
  SIPS,
  SPEED_BANK,
  SPEED_WADE,
  STAIRS,
  STOOLS,
  STRAW_PILE,
  THRESHED,
  WADE_DOWN,
  WALK,
  WALLOW,
  WATER_DOWN,
  WAVES,
  type Paddy,
  type Round,
  type V3,
} from './layout'
import { riceSfx as sfx } from './sounds'
import { FarmWater } from './water'

export interface RiceEvents extends LegEvents {
  /** A new round began (the address bar follows). */
  round(r: Round): void
  /** Mommy took the photo on the deck. */
  photo(src: string): void
  /** The photo's taken: the end card. */
  allDone(): void
}

export const RICE_ANCHORS: AnchorInfo[] = [
  ...PADDIES.map((p): AnchorInfo => ({ id: `gate:${p.i}`, label: `Gate of paddy ${p.name}`, kind: 'thing' })),
  { id: 'scarecrow', label: 'Scarecrow', kind: 'thing' },
  { id: 'buffalo', label: 'Water buffalo', kind: 'thing' },
  { id: 'duck:0', label: 'Duck', kind: 'thing' },
  { id: 'duck:1', label: 'Duck', kind: 'thing' },
  { id: 'frog', label: 'Frog', kind: 'thing' },
  { id: 'nursery', label: 'Rice seedlings', kind: 'thing' },
  { id: 'straw', label: 'Straw pile', kind: 'thing' },
  { id: 'hut', label: 'Farm hut', kind: 'thing' },
  { id: 'banana', label: 'Banana plant', kind: 'thing' },
  { id: 'bamboo', label: 'Bamboo', kind: 'thing' },
  { id: 'cafe', label: 'Stop Time Cafe', kind: 'thing' },
  { id: 'basket', label: 'Threshing basket', kind: 'thing' },
  { id: 'rack', label: 'Rice bundles', kind: 'thing' },
  { id: 'kratip', label: 'Sticky rice', kind: 'thing' },
  { id: 'glass', label: 'Pink milk', kind: 'thing' },
  { id: 'cup', label: "Daddy's coffee", kind: 'thing' },
  { id: 'chime', label: 'Wind chime', kind: 'thing' },
  { id: 'view', label: 'The rice farm', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:lung', label: 'Lung Kham, the farmer', kind: 'family' },
]

type Phase = 'farm' | 'thresh' | 'deck'
type Ground = 'wood' | 'bank' | 'wade' | 'mud' | 'channel'

interface Hill {
  i: number
  x: number
  z: number
  floor: number
  paddy: number
  planted: boolean
  /** Popping in (0..1), after `wait` seconds. */
  pop: number
  wait: number
  /** 0 droopy and yellow (planted dry), 1 standing up green; `spring` runs the jump up when the water comes. */
  wet: number
  spring: number
  /** Leaning away from Kaylee as she wades (a spring), and a peck's twitch. */
  lx: number
  lz: number
  vx: number
  vz: number
  twitch: number
  cut: boolean
  cutK: number
  phase: number
  turn: number
  shade: number
  droop: number
}

interface PaddyState {
  p: Paddy
  /** The water: 0 at the mud, 1 full. */
  lvl: number
  lvlGoal: number
  open: boolean
  /** The gate's board, lifting (0..1), and its wiggle when she plants dry. */
  gateK: number
  wiggle: number
  planted: number
  done: boolean
  cut: number
  cutDone: boolean
  /** The extra-tall one grows this much taller. */
  tall: number
  entered: boolean
}

interface Sheaf {
  root: Group
  from: Vector3
  to: Vector3
  t: number
  /** Sitting on the bank, and hopping onto the rack. */
  on: boolean
  toRack: boolean
}

const STUCK_S = 5
/** Nothing done for this long: Sparkle says what to do (again after SAY_EVERY, at most SAY_MAX times a round). */
const SAY_S = 8
const SAY_EVERY = 20
const SAY_MAX = 3
const R = L.nan.rice
const tmp = new Vector3()
const tmp2 = new Vector3()
const m4 = new Matrix4()
const col = new Color()
const c2 = new Color()
const SEEDLING = new Color('#8EDC6A')
const DRY = new Color('#D8D27A')
const GROWN = new Color('#4FAE5E')
const LEAF_GOLD = new Color('#DCC566')
const HEAD_GREEN = new Color('#B9D879')
const GOLD = new Color('#FAD65A')
const STUBBLE = new Color('#C9A35A')
const MUD_DAMP = '#8E7458'
const SKY = '#CFE8F7'
/** Rice clump heights by growth (meters, before a paddy's extra tallness). */
const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a), 0, 1)
  return k * k * (3 - 2 * k)
}
const riceH = (g: number) => 0.26 + 0.38 * smooth(0, 0.5, g) + 0.14 * smooth(0.45, 0.85, g)
/** Each hill stands in the mud, this much of it under the water. */
const SUNK = MUD_DOWN - WATER_DOWN
const riceW = (g: number) => 0.9 + 0.45 * smooth(0, 0.6, g)
const PER_BUNDLE = Math.floor((PER_PADDY * PADDIES.length) / BUNDLES)
const THRESH_AT = new Vector3(BASKET[0] - 0.75, 0, BASKET[2] - 0.1)
const BANGS = THRESHED * BANGS_PER
/** Balls of sticky rice in the kratip on the deck. */
const BALLS = 4
/** The bundle's swing (radians up from level, in the plane she faces): resting, over her head, down on the board. */
const SWING_REST = 0.35
const SWING_UP = 1.95
const SWING_DOWN = -0.1
/** One bang, seconds: up (anticipation), the fast down, the settle. The board is hit at HIT_AT. */
const SWING_S = 0.62
const HIT_AT = 0.58

export class RiceFarm extends Stage {
  private farm: Farm
  private deck: Deck
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  /** Lung Kham, the farmer. */
  private lung: Member
  /** Kaylee rides on this: it lifts her onto the banks, down into the water, up the step. */
  private carrier = new Group()
  private kit: ReturnType<typeof buildKayleeKit>
  private phase: Phase
  private round: Round
  private hills: Hill[]
  private paddies: PaddyState[]
  private blades: Instanced
  private heads: Instanced
  private stubble: Instanced
  private birds: Birds
  private growth = 0
  private waves = 0
  private shoos = 0
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  // ---- Leading Kaylee ----
  private finger = { held: false, target: null as Vector3 | null, fresh: false }
  private lift = { y: 0, hop: -1, from: 0, to: 0 }
  private ground: Ground = 'wood'
  private stepDist = 0
  private still = 0
  private lastPos = new Vector3()
  private stuckT = 0
  private busyUntil = -1
  private wetUntil = -1
  private muddy = 0
  private mud: Group
  private goFlop = false
  // ---- Planting, cutting ----
  private plips = 0
  private plipT = 0
  private swishT = 0
  private springT = 0
  private cutTotal = 0
  private tied = 0
  private sheaves: Sheaf[] = []
  private racked = 0
  // ---- Threshing: the bundle in her hands, its swing, the straw tossed onto the pile, the kratip ----
  private banged = 0
  private threshed = 0
  private hits = 0
  private holding = false
  private held: { root: Group; pitch: Group; heads: Group }
  /** The bundle flying from the rack into her hands (0..1), and the straw flying onto the pile. */
  private take = 1
  private takeFrom = new Vector3()
  private swing = -1
  private queued = false
  private straw: { root: Group; from: Vector3; t: number }
  private strawSize = 1
  private basketShake = 1
  private whiteHeap: Group
  private kratip: Kratip
  private kratipK = -1
  private steam: Floaters
  private steamT = 0
  private grains: Floaters
  // ---- Effects ----
  private splash: Floaters
  private sparkles: Floaters
  private bits: Floaters
  private feathers: Floaters
  private mudBits: Floaters
  private rain: Floaters
  private cloud: Group
  private cloudT = -1
  private life: FarmLife
  private rainT = 0
  // ---- Pokes ----
  private scareSpin = 1
  private hatFlip = 1
  private buffaloRoll = 1
  private buffaloLook = 1
  private bananaWob = 1
  private bambooWob = 1
  private nurseryWob = 1
  private chimeSwing = 1
  private strawPuff = 1
  private nickShake = 1
  private nickHat: Group
  private nickHatUntil = -1
  private duckAt = [{ z: 1.8, dir: 1, dash: 0 }, { z: -2.4, dir: -1, dash: 0 }]
  private frog = { spot: 0, from: new Vector3(), hop: 1, croak: 1 }
  // ---- The deck ----
  private sips = 0
  private milk = 1
  private milkShown = 1
  private eaten = 0
  private riceLeft = 1
  private riceShown = 1
  private ball: Group
  private ballK = 1
  private cheekGrain: Group
  private cheekUntil = -1
  private photos = 0
  private snapAt = -1
  private photoWanted = false
  private phone: Group
  private doneSaid = false
  // ---- Talk: lines said once, Sparkle's hints this round, Daddy's tap lines in turn ----
  private told = new Set<string>()
  private lastSay = -99
  /** Sparkle's hints count quiet time from here (a round's start and its line), not from her last touch. */
  private quietFrom = 0
  private sayN = 0
  private nickTap = 0
  private lungTap = 0
  /** Seconds to the next far-off farm sound. */
  private farT = 6
  private hintNow: { at: Vector3; id?: string } | null = null

  constructor(renderer: WebGLRenderer, private ev: RiceEvents, start: { round: Round }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color(SKY)
    this.rig.fov = 28
    this.rig.lag = 0.5
    this.farm = buildFarm(bag)
    scene.add(this.farm.root)
    this.deck = buildDeck(bag)
    this.deck.kratip.root.visible = false // until she's threshed it
    scene.add(this.deck.root)
    // ---- The family: Kaylee and Daddy on the boardwalk, Mommy waiting up on the café's deck ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    scene.add(this.carrier, this.nick.root)
    this.carrier.add(kaylee.root)
    this.deck.root.add(this.ji.root)
    this.put(this.ji, 0.9, 0, -1.0, 'stand', 180)
    this.nick.root.userData.pick = 'family:nick'
    this.ji.root.userData.pick = 'family:ji'
    this.phone = solid(merge([P.rbox(0.09, 0.15, 0.015, 0.012, PAL.hotpink, {}), P.box(0.075, 0.12, 0.004, '#3A3350', { at: [0, 0, -0.009] })]), bag, 1)
    this.phone.position.set(0.1, this.ji.height * 0.66, 0.3)
    this.phone.visible = false
    this.ji.root.add(this.phone)
    // ---- Kaylee's things: her ngob, the seedlings (left hand), the sickle (right) and the armful of cut rice ----
    this.kit = buildKayleeKit(bag)
    const R = 0.24
    // Pushed back on her head, so her horn and fringe show in front of it.
    this.kit.ngob.position.set(0, 0.2 + 0.62 * R, -0.13)
    this.kit.ngob.rotation.x = -0.5
    // A costume (looks.ts SPOTS_OF: her head): it goes on instead of her own hat, which waits in her pocket.
    kaylee.attach('ngob', [[this.kit.ngob, kaylee.rig.head]])
    // In her hooves: `at` is from the code-built arm's pivot; a rig with its own hands (the vinyl toy) holds them there,
    // `held` from the hoof.
    const hold = (g: Group, s: -1 | 1, at: V3, held: V3) => {
      const hand = kaylee.rig.hands?.[s < 0 ? 0 : 1]
      g.position.set(...(hand ? held : at))
      ;(hand ?? (s < 0 ? kaylee.rig.armL : kaylee.rig.armR)).add(g)
    }
    hold(this.kit.seedlings, -1, [-0.06, -0.17, 0.05], [0, 0.01, 0.05])
    this.kit.sickle.rotation.set(1.2, 0, 0)
    hold(this.kit.sickle, 1, [0.06, -0.17, 0.04], [0, 0.01, 0.04])
    this.kit.armful.rotation.set(0, Math.PI / 2 + 0.3, 0.3)
    hold(this.kit.armful, -1, [-0.04, -0.12, 0.14], [0.03, 0.05, 0.12])
    // Mud spots for the wallow (stuck on her front when her body isn't the code-built one).
    const front = kaylee.rig.front
    const spots: V3[] = front
      ? [[0.08, 0.3], [-0.1, 0.23], [0.02, 0.21], [0.06, 0.41], [-0.06, 0.38]].map(([x, y]) => [x, y, front(x, y)])
      : [[0.12, 0.3, 0.17], [-0.15, 0.22, 0.12], [0.02, 0.15, 0.2], [0.17, 0.42, 0.05], [-0.1, 0.4, 0.15]]
    this.mud = solid(merge(spots.map(([x, y, z], k) => P.sphere(0.04 + (k % 2) * 0.015, '#8A6A4F', { at: [x, y, z], scale: [1, 0.8, 0.5] }, 8))), bag, 0)
    this.mud.visible = false
    kaylee.rig.body.add(this.mud)
    // Straw on Daddy's head (the harvest's silly moment).
    this.nickHat = solid(merge([P.sphere(0.2, STRAW, { scale: [1.2, 0.45, 1.1] }, 12), ...Array.from({ length: 8 }, (_, k) => P.cone(0.025, 0.24, k % 2 ? '#D9AE52' : STRAW, { at: [Math.cos(k) * 0.16, 0.02, Math.sin(k) * 0.14], rot: [Math.sin(k * 1.7) * 1.2, 0, Math.cos(k * 1.7) * 1.2] }, 4))]), bag, 1.5)
    const crown = this.nick.rig.spots?.crown
    if (crown) this.nickHat.position.set(crown[0], crown[1] - 0.04, crown[2])
    else this.nickHat.position.set(0, this.nick.rig.face.headY + this.nick.rig.face.R * 0.95, 0)
    this.nickHat.visible = false
    this.nick.rig.head.add(this.nickHat)
    // Lung Kham, in his own ngob.
    this.lung = new Member({ id: 'lung', name: 'Lung Kham', who: 'The rice farmer', height: LUNG.height, spot: null, pitch: 180 }, bag, LUNG, 'lung')
    const ngob = lungNgob(bag)
    ngob.position.set(0, this.lung.rig.face.headY + this.lung.rig.face.R * 0.82, -0.02)
    ngob.rotation.x = -0.12
    this.lung.rig.head.add(ngob)
    scene.add(this.lung.root)
    this.put(this.lung, ...LUNG_AT, 'stand', 25)

    // ---- The rice: every hill, and the three instanced shapes ----
    this.hills = HILLS.map((h, i) => ({ i, ...h, planted: false, pop: 0, wait: 0, wet: 1, spring: 1, lx: 0, lz: 0, vx: 0, vz: 0, twitch: 1, cut: false, cutK: 1, phase: Math.random() * 6, turn: Math.random() * 6, shade: Math.random() * 2 - 1, droop: Math.random() * Math.PI * 2 }))
    this.blades = new Instanced(bladesGeometry(), this.hills.length, 1, bag)
    this.heads = new Instanced(headsGeometry(), this.hills.length, 0.8, bag)
    this.stubble = new Instanced(stubbleGeometry(), this.hills.length, 1, bag)
    for (const x of [this.blades, this.heads, this.stubble]) scene.add(x.mesh, x.hull)
    this.paddies = PADDIES.map((p) => ({ p, lvl: 0, lvlGoal: 0, open: false, gateK: 0, wiggle: 1, planted: 0, done: false, cut: 0, cutDone: false, tall: 1, entered: false }))
    // One of the back three grows extra tall (never A: she starts there).
    this.paddies[1 + Math.floor(Math.random() * 3)].tall = 1.45

    // ---- Birds, sheaves, the little rain cloud, the effects ----
    this.birds = new Birds(bag, BIRDS)
    scene.add(this.birds.root)
    for (let k = 0; k < BUNDLES; k++) {
      const root = sheaf(bag)
      root.visible = false
      scene.add(root)
      this.sheaves.push({ root, from: new Vector3(), to: new Vector3(), t: 1, on: false, toRack: false })
    }
    // The rain cloud: a plump little cloud with a grey-lavender belly and a sleepy, happy face.
    this.cloud = solid(merge([P.sphere(0.6, '#FFFFFF', { scale: [1.6, 0.7, 1] }), P.sphere(0.45, '#FFFFFF', { at: [0.55, 0.22, 0.05] }), P.sphere(0.42, '#F4F2FA', { at: [-0.55, 0.12, 0] }), P.sphere(0.55, '#D9D3EA', { at: [0, -0.2, 0], scale: [1.75, 0.42, 0.95] }), ...[-1, 1].map((s) => P.sphere(0.055, PAL.ink, { at: [s * 0.22, 0.08, 0.6], scale: [1, 1.2, 0.5] }, 8)), ...[-1, 1].map((s) => P.sphere(0.07, '#FFB3CF', { at: [s * 0.4, -0.04, 0.55], scale: [1, 0.6, 0.4] }, 8)), P.torus(0.07, 0.016, PAL.ink, { at: [0, -0.04, 0.6], rot: [0, 0, Math.PI] }, Math.PI)]), bag, 2)
    this.cloud.visible = false
    scene.add(this.cloud)
    this.splash = new Floaters(new IcosahedronGeometry(0.5, 0), ['#CDEBFA', '#FFFFFF', '#A9D8F2'], 160, bag, 7, 0.4)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 160, bag, 1.0, 1.2)
    this.bits = new Floaters(new OctahedronGeometry(0.5), [STRAW, '#F5C84A', '#D9AE52'], 160, bag, 5, 0.8)
    this.feathers = new Floaters(new IcosahedronGeometry(0.5, 0), ['#9A6340', '#FFF6EC', '#7E4E32'], 60, bag, 0.6, 2.2)
    this.mudBits = new Floaters(new IcosahedronGeometry(0.5, 0), ['#8A6A4F', '#A8876A'], 60, bag, 7, 0.4)
    this.rain = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A9D8F2', '#CDEBFA'], 200, bag, 0, 0)
    this.grains = new Floaters(new IcosahedronGeometry(0.5, 0), ['#F5C84A', '#FAD65A', '#E8B23C'], 160, bag, 6, 0.6)
    this.steam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#F4F2FA'], 60, bag, -0.3, 1.2, 0.65, 1.8)
    for (const f of [this.splash, this.sparkles, this.bits, this.feathers, this.mudBits, this.rain, this.grains, this.steam]) scene.add(f.mesh)
    this.life = new FarmLife(bag)
    scene.add(this.life.root)

    // ---- The threshing: the bundle she swings (its stalks at her hands, the heads at the far end), the straw she
    // tosses, the heap turned white, and the kratip that pops out of the basket ----
    const pitch = new Group()
    const heads = solid(merge([P.sphere(0.12, '#F5C84A', { at: [0.5, -0.02, 0], scale: [1, 0.8, 1.1] }, 10)]), bag, 2)
    pitch.add(solid(merge([P.cyl(0.07, 0.1, 0.5, STRAW, { at: [0.25, 0, 0], rot: [0, 0, Math.PI / 2] }, 10), P.torus(0.078, 0.018, '#B5823F', { at: [0.2, 0, 0], rot: [0, Math.PI / 2, 0] })]), bag, 2), heads)
    const heldRoot = new Group()
    heldRoot.add(pitch)
    heldRoot.visible = false
    scene.add(heldRoot)
    this.held = { root: heldRoot, pitch, heads }
    const tossed = solid(merge([P.cyl(0.07, 0.1, 0.5, STRAW, { rot: [0, 0, Math.PI / 2] }, 10), ...Array.from({ length: 6 }, (_, k) => P.cone(0.02, 0.2, k % 2 ? '#D9AE52' : STRAW, { at: [0.25, Math.sin(k) * 0.05, Math.cos(k) * 0.05], rot: [0, 0, -Math.PI / 2 + Math.sin(k * 2) * 0.5] }, 4))]), bag, 2)
    tossed.visible = false
    scene.add(tossed)
    this.straw = { root: tossed, from: new Vector3(), t: 1 }
    this.whiteHeap = solid(merge([P.sphere(0.45, '#FFFCF2', { scale: [1, 0.55, 1] }, 20), ...Array.from({ length: 7 }, (_, k) => P.sphere(0.03, '#FFFFFF', { at: [Math.cos(k * 0.9) * 0.28, 0.2, Math.sin(k * 0.9) * 0.28] }, 6))]), bag, 0)
    this.whiteHeap.position.y = 0.33
    this.whiteHeap.visible = false
    this.farm.basket.root.add(this.whiteHeap)
    this.kratip = buildKratip(bag, 1.7, true)
    this.kratip.root.position.set(0, 0.4, 0)
    this.kratip.root.visible = false
    this.farm.basket.root.add(this.kratip.root)
    // ---- On the deck: a ball of sticky rice on its way to her mouth, and the grain stuck on her cheek ----
    this.ball = solid(merge([P.sphere(0.035, '#FFFCF2', {}, 10)]), bag, 1)
    this.ball.visible = false
    scene.add(this.ball)
    const fr = kaylee.rig.face
    this.cheekGrain = solid(merge([P.sphere(0.018, '#FFFFFF', { scale: [1.3, 0.8, 0.8] }, 8)]), bag, 1)
    this.cheekGrain.position.set(fr.R * 0.5, fr.headY - fr.R * 0.22, fr.R * 0.86)
    this.cheekGrain.visible = false
    kaylee.rig.head.add(this.cheekGrain)

    // ---- Where the link starts ----
    this.round = start.round
    const r = start.round
    this.phase = r === 'thresh' ? 'thresh' : r === 'deck' ? 'deck' : 'farm'
    if (r === 'plant') this.flood(this.paddies[0], true)
    else for (const s of this.paddies) this.flood(s, true)
    if (r !== 'plant') for (const s of this.paddies) this.plantAll(s, true)
    if (r === 'harvest' || r === 'thresh' || r === 'deck') {
      this.growth = 1
      for (const s of this.paddies) this.drain(s, true)
    }
    if (r === 'thresh' || r === 'deck') {
      for (const h of this.hills) h.cut = true
      for (const s of this.paddies) {
        s.cut = PER_PADDY
        s.cutDone = true
      }
      this.cutTotal = this.hills.length
      this.tied = this.racked = BUNDLES
      for (const b of this.farm.rack.bundles) b.visible = true
    }
    this.put(kaylee, ...KAYLEE_AT, 'stand', 15)
    this.lift.y = BOARDWALK.y
    this.kaylee.root.position.y = 0
    this.carrier.position.y = this.lift.y
    this.put(this.nick, ...NICK_AT, 'stand', -25)
    this.kitFor(r)
    if (r === 'thresh') this.atThresh(true)
    if (r === 'deck') this.seatOnDeck(true)
    this.placeCritters(0)
    this.after(r === 'plant' ? 0.4 : 0.8, () => this.roundLine(r))
    // Sparkle's hints count quiet time from after the opening (Lung's line and hers), so she doesn't say it twice.
    this.quietFrom = 6
  }

  /** A round begins: Lung says what it's for, then Sparkle what to do (Mommy's hello on the deck). */
  private roundLine(r: Round) {
    if (r === 'deck') return this.after(0.6, () => this.once('hi', R.hi))
    if (r === 'harvest') return this.once(r, R[r]) // (Lung said it's golden as it ripened.)
    // (Into the growing, after his thank-you for the planting.) Sparkle waits her turn behind him (TripGuide queues her).
    this.after(r === 'grow' ? 1.0 : 0, () => {
      this.once(`ask-${r}`, R.ask[r])
      this.lung.react('wave')
      this.once(r, R[r])
    })
  }
  /** Says it the first time only. A family reaction (`now`) is dropped while Sparkle talks, rather than heard late. */
  private once(key: string, l: Line, now = false) {
    if (this.told.has(key)) return
    if (now && speakingVoice() === 'sparkle') return
    this.told.add(key)
    this.ev.say(l)
  }

  // ---------------------------------------------------------------- rounds

  /** What she holds in each round. */
  private kitFor(r: Round) {
    this.kit.seedlings.visible = r === 'plant'
    this.kit.sickle.visible = r === 'harvest'
    this.kit.armful.visible = false
    this.kaylee.wear(r !== 'deck' ? ['ngob'] : [])
  }

  private setRound(r: Round) {
    this.round = r
    this.kitFor(r)
    this.ev.round(r)
    this.sayN = 0
    this.lastSay = -99
    this.quietFrom = this.time + 3
    this.roundLine(r)
  }

  private checkPlanted() {
    if (this.round !== 'plant') return
    if (this.paddies.some((s) => !s.done || !s.open)) return
    this.round = 'grow'
    this.after(0.6, () => {
      sfx.allDone()
      this.cheer()
      this.once('thanks', R.thanks)
      for (const s of this.paddies) this.sparkles.burst(tmp.set(...s.p.mid).setY(s.p.mid[1] + 0.3), 8, 1, 1.2, 0.9, 0.07)
    })
    // A short beat (the sun comes over the hill), then the rice starts to grow.
    this.after(2.2, () => this.setRound('grow'))
  }

  private ripe() {
    this.round = 'harvest'
    this.birds.away()
    sfx.allDone()
    this.cheer()
    this.after(0.3, () => this.once('ripe', R.ripe))
    for (const s of this.paddies) this.after(0.2 + Math.random() * 0.6, () => this.sparkles.burst(tmp.set(...s.p.mid).setY(s.p.mid[1] + 0.8), 10, 1.2, 1.2, 1, 0.08, 0))
    // The water is let out before the cutting.
    this.after(1.4, () => {
      sfx.drain()
      for (const s of this.paddies) this.drain(s, false)
    })
    this.after(3.6, () => this.setRound('harvest'))
  }

  private allCut() {
    this.round = 'thresh'
    this.kit.armful.visible = false
    this.after(0.6, () => {
      sfx.allDone()
      this.cheer()
      this.once('lots', R.lots)
    })
    // The bundles hop off the banks onto the drying rack, one by one.
    this.sheaves.forEach((s, k) =>
      this.after(1.2 + k * 0.28, () => {
        if (!s.on) return
        s.toRack = true
        s.from.copy(s.root.position)
        this.farm.rack.bundles[k].getWorldPosition(s.to)
        s.t = 0
        sfx.boing()
      }),
    )
    this.after(1.2 + BUNDLES * 0.28 + 1.2, () => this.toThresh())
  }

  private toThresh() {
    this.phase = 'thresh'
    this.setRound('thresh')
    this.atThresh(false)
  }

  /** The threshing corner: Kaylee beside the basket, facing it, the rack of bundles behind her. */
  private atThresh(now: boolean) {
    this.finger.target = null
    this.kaylee.stop()
    this.kitFor('thresh')
    const to = THRESH_AT.clone()
    if (now) {
      this.lift.y = 0
      this.carrier.position.y = 0
      this.put(this.kaylee, to.x, 0, to.z, 'stand', 90)
    } else {
      this.carrier.position.y = this.lift.y = 0
      this.hop(this.kaylee, this.carrier, to, { face: 90, dur: 0.6, arc: 0.5 })
    }
    // Daddy watches from the far side of the basket (not between her and the camera).
    this.nick.root.position.set(BASKET[0] + 1.35, 0, BASKET[2] + 0.15)
    this.nick.root.rotation.y = Math.atan2(to.x - BASKET[0] - 1.35, to.z - BASKET[2] - 0.15)
    // Lung steps onto the bank at her left, to count (on the boardwalk he'd stand between her and the camera).
    this.lung.root.position.set(THRESH_AT.x - 1.45, 0, THRESH_AT.z - 0.4)
    this.lung.root.rotation.y = 0.7 // (half toward her, half toward the camera: his head turns to watch her)
  }

  /** A tap while threshing: take the next bundle if her hands are empty, then swing it and bang it on the board. */
  private thresh() {
    if (this.phase !== 'thresh' || this.threshed >= THRESHED || this.hopping) return
    // Mid-swing (or the bundle still flying to her): the tap waits for the next swing, so quick taps all count.
    if (this.swing >= 0 || this.take < 1) return void (this.queued = true)
    if (!this.holding) {
      const b = this.farm.rack.bundles[BUNDLES - 1 - this.threshed]
      b.visible = false
      b.getWorldPosition(this.takeFrom)
      this.holding = true
      this.hits = 0
      this.take = 0
      this.held.root.visible = true
      this.held.heads.scale.setScalar(1)
      this.queued = true // she swings it as soon as it's in her hands
      return sfx.boing()
    }
    this.swing = 0
    sfx.swingUp()
  }

  /** Her hands, where the bundle's stalks are held (higher as she lifts it). */
  private handsAt(raise: number, out: Vector3) {
    const k = this.kaylee.root.getWorldPosition(out)
    const yaw = this.kaylee.root.rotation.y
    return k.set(k.x + Math.sin(yaw) * 0.18, k.y + 0.36 + raise * 0.32, k.z + Math.cos(yaw) * 0.18)
  }

  /** The bundle hits the board: THWACK, the grains spray into the basket, the heap rises. */
  private hit() {
    this.hits++
    this.banged++
    sfx.thwack(this.banged)
    const at = this.held.heads.getWorldPosition(new Vector3())
    const mid = new Vector3(BASKET[0], 0.5, BASKET[2])
    for (let i = 0; i < 30; i++) this.grains.emit(at, tmp.subVectors(mid, at).multiplyScalar(1.6 + Math.random()).add(tmp2.set((Math.random() - 0.5) * 1.6, 1 + Math.random() * 1.4, (Math.random() - 0.5) * 1.6)), 0.7 + Math.random() * 0.4, 0.03 + Math.random() * 0.02)
    this.bits.burst(at, 5, 0.8, 1, 0.5, 0.03)
    this.farm.basket.board.rotation.z = -0.3
    this.basketShake = 0.6
    if (this.banged === 3) this.nick.react('hop')
    this.held.heads.scale.setScalar(Math.max(0.01, 1 - this.hits / BANGS_PER))
    this.kaylee.react('wiggle')
  }

  /** Empty: she tosses the straw onto the pile. */
  private tossStraw() {
    this.holding = false
    this.held.root.visible = false
    this.held.pitch.getWorldPosition(this.straw.from)
    this.straw.root.position.copy(this.straw.from)
    this.straw.root.visible = true
    this.straw.t = 0
    this.threshed++
    sfx.toss()
    // Lung counts the bundles in Thai (behind Sparkle, if she's talking).
    this.ev.say(R.count[this.threshed - 1])
    this.lung.react('hop')
    if (this.threshed >= THRESHED) this.after(0.8, () => this.heaped())
  }

  /** The basket's heaped: it shakes, the chaff blows away, the grains turn white, and out pops the kratip. */
  private heaped() {
    this.queued = false
    sfx.allDone()
    this.cheer()
    const mid = new Vector3(BASKET[0], 0.6, BASKET[2])
    this.sparkles.burst(mid, 12, 1, 1.4, 1, 0.06)
    // Lung's "one to five" (2.5 s) right after his "Hah!", then his sticky rice line once it's done (two of his lines
    // would cut each other off), then the deck once that's done too.
    this.after(0.5, () => this.once('counted', R.counted))
    this.after(1.0, () => {
      this.basketShake = -1.2
      sfx.blow()
      for (let i = 0; i < 24; i++) this.bits.emit(mid, tmp.set(1.2 + Math.random() * 1.6, 0.8 + Math.random() * 1.2, (Math.random() - 0.5) * 1.2), 1.1, 0.025)
    })
    this.after(2.2, () => {
      this.farm.basket.heap.visible = false
      this.whiteHeap.visible = true
      this.sparkles.burst(mid, 14, 1.2, 1.2, 0.9, 0.05)
      sfx.chime()
    })
    this.after(3.0, () => {
      this.kratipK = 0
      this.kratip.root.visible = true
      sfx.boing()
      sfx.steam()
    })
    this.after(3.4, () => {
      this.once('helper', R.helper)
      this.lung.react('wave')
    })
    this.after(6.0, () => this.toDeck())
  }

  private stepThresh(dt: number) {
    const f = this.farm
    f.basket.board.rotation.z += (-0.55 - f.basket.board.rotation.z) * Math.min(1, dt * 6)
    f.basket.heap.scale.y += (Math.max(0.001, this.banged / BANGS) - f.basket.heap.scale.y) * Math.min(1, dt * 4)
    // A bump on each bang; a long shake (the winnowing) when it's heaped.
    if (this.basketShake < 1) {
      this.basketShake = Math.min(1, this.basketShake + dt / (this.basketShake < 0 ? 1 : 0.25))
      const k = this.basketShake < 0 ? 1 : 1 - this.basketShake
      f.basket.root.rotation.z = Math.sin(this.time * (this.basketShake < 0 ? 22 : 40)) * 0.05 * k
    } else f.basket.root.rotation.z = 0
    if (this.queued && this.swing < 0 && this.take >= 1 && !this.hopping) {
      this.queued = false
      this.thresh()
    }
    // ---- The bundle: flying into her hands, then the swing ----
    let a = SWING_REST
    let raise = 0.3
    if (this.take < 1) {
      this.take = Math.min(1, this.take + dt / 0.35)
      a = SWING_REST * this.take
    } else if (this.swing >= 0) {
      const before = this.swing
      this.swing += dt / SWING_S
      const t = this.swing
      if (t < 0.45) {
        const e = smooth(0, 0.45, t)
        a = SWING_REST + (SWING_UP - SWING_REST) * e
        raise = 0.3 + 0.7 * e
      } else if (t < HIT_AT) {
        const e = ((t - 0.45) / (HIT_AT - 0.45)) ** 2
        a = SWING_UP + (SWING_DOWN - SWING_UP) * e
        raise = 1 - 0.45 * e
      } else {
        const e = smooth(HIT_AT, 1, t)
        a = SWING_DOWN + (SWING_REST - SWING_DOWN) * e
        raise = 0.55 - 0.25 * e
      }
      if (before < HIT_AT && t >= HIT_AT) this.hit()
      if (t >= 1) {
        this.swing = -1
        if (this.hits >= BANGS_PER) this.tossStraw()
      }
    }
    const h = this.held
    if (h.root.visible) {
      const hands = this.handsAt(raise, tmp)
      if (this.take < 1) h.root.position.lerpVectors(this.takeFrom, hands, smooth(0, 1, this.take)).y += bell(this.take) * 0.6
      else h.root.position.copy(hands)
      h.root.rotation.y = this.kaylee.root.rotation.y - Math.PI / 2
      h.pitch.rotation.z = a
    }
    // ---- The straw flying onto the pile, which grows ----
    const st = this.straw
    if (st.t < 1) {
      st.t = Math.min(1, st.t + dt / 0.55)
      st.root.position.lerpVectors(st.from, tmp2.set(STRAW_PILE[0], 0.45 * this.strawSize, STRAW_PILE[2]), st.t).y += bell(st.t) * 0.9
      st.root.rotation.z = st.t * 5
      if (st.t >= 1) {
        st.root.visible = false
        this.strawSize += 0.09
        this.strawPuff = 0
        sfx.rustle()
        this.bits.burst(tmp2, 10, 0.9, 1.2, 0.6, 0.04)
      }
    }
    // ---- The kratip popping out of the basket, steaming ----
    if (this.kratipK >= 0 && this.kratipK < 1) {
      this.kratipK = Math.min(1, this.kratipK + dt / 0.5)
      const k = this.kratipK
      this.kratip.root.scale.setScalar(Math.max(0.01, k < 0.7 ? (k / 0.7) * 1.2 : 1.2 - ((k - 0.7) / 0.3) * 0.2))
      this.kratip.root.position.y = 0.3 + 0.2 * smooth(0, 0.7, k) + bell(k) * 0.25
    }
  }

  /** Her arms follow the bundle (forward and up), over whatever the pose did this frame. */
  private threshArms() {
    const r = this.kaylee.rig
    if (!this.held.root.visible || this.phase !== 'thresh') return
    const up = 1.2 + (this.held.pitch.rotation.z - SWING_DOWN) * 0.75
    r.armL.rotation.set(-up, 0, 0.35)
    r.armR.rotation.set(-up, 0, -0.35)
  }

  // ---------------------------------------------------------------- the water

  private flood(s: PaddyState, now: boolean) {
    if (s.open) return
    s.open = true
    s.lvlGoal = 1
    if (now) {
      s.lvl = 1
      s.gateK = 1
      for (const h of this.hills) if (h.paddy === s.p.i) h.wet = 1
      return
    }
    sfx.gate()
    this.after(0.25, () => sfx.gush())
    this.talkTo('kaylee-cheer', () => this.kaylee.react('hop'), 2)
    this.after(1.0, () => this.once('water', R.water, true))
  }

  private drain(s: PaddyState, now: boolean) {
    s.lvlGoal = 0.12
    if (now) s.lvl = 0.12
    FarmWater.setMud(this.farm.paddyWater[s.p.i], MUD_DAMP)
  }

  // ---------------------------------------------------------------- planting

  private plantHill(h: Hill, wait = 0) {
    if (h.planted) return
    const s = this.paddies[h.paddy]
    h.planted = true
    h.pop = 0
    h.wait = wait
    h.wet = s.lvl > 0.5 ? 1 : 0
    h.spring = 1
    s.planted++
  }

  private plantAll(s: PaddyState, now: boolean) {
    s.done = true
    const k = this.kaylee.root.position
    for (const h of this.hills) {
      if (h.paddy !== s.p.i || h.planted) continue
      this.plantHill(h, now ? 0 : 0.1 + Math.hypot(h.x - k.x, h.z - k.z) * 0.12)
      if (now) h.pop = 1
    }
  }

  /** The brush: what Kaylee does to the rice she walks through (this round's). */
  private brush() {
    const k = this.kaylee.root.position
    const here = paddyAt(k.x, k.z, 0.12)
    if (!here || this.hopping) return
    const s = this.paddies[here.i]
    if (this.round === 'plant' && !s.done) {
      let n = 0
      for (const h of this.hills) {
        if (h.paddy !== here.i || h.planted || Math.hypot(h.x - k.x, h.z - k.z) > BRUSH) continue
        this.plantHill(h, 0.04 * n++)
      }
      if (n && !s.open) {
        // Planted dry: droopy and yellow. The gate wiggles: open me!
        s.wiggle = 0
        this.talkTo(`dry${s.p.i}`, () => sfx.gate(), 3)
        this.after(0.5, () => !s.open && this.once('dry', R.dry))
      }
      if (s.planted >= PER_PADDY * PLANTED_AT && !s.done) {
        // Over 70%: the rest plip in by themselves, rippling out from her.
        this.plantAll(s, false)
        this.after(1.0, () => {
          sfx.planted()
          this.sparkles.burst(tmp.set(...s.p.mid).setY(s.p.mid[1] + 0.3), 12, 1.2, 1.2, 0.9, 0.07, 3)
          this.talkTo('kaylee-cheer', () => this.kaylee.react('hop'), 2)
          this.nick.react('hop')
          this.lung.react('hop')
          if (this.paddies.some((x) => !x.done)) this.once('planted', R.planted, true)
          this.checkPlanted()
        })
      }
    }
    if (this.round === 'harvest') {
      if (!s.entered) {
        s.entered = true
        // The extra-tall paddy: two birds hiding in it burst out.
        if (s.tall > 1) {
          this.birds.burst(tmp.set(k.x, s.p.top, k.z), 2, this.birdHost)
          this.after(0.8, () => this.once('where', R.where, true))
        }
      }
      for (const h of this.hills) {
        if (h.paddy !== here.i || !h.planted || h.cut || Math.hypot(h.x - k.x, h.z - k.z) > BRUSH) continue
        this.cutHill(h, true)
      }
    }
  }

  // ---------------------------------------------------------------- cutting

  private cutHill(h: Hill, byHer: boolean) {
    if (h.cut) return
    const s = this.paddies[h.paddy]
    h.cut = true
    h.cutK = 0
    s.cut++
    this.cutTotal++
    this.bits.burst(tmp.set(h.x, h.floor + 0.35, h.z), byHer ? 5 : 3, 0.9, 1.4, 0.6, 0.035)
    if (this.swishT <= 0) {
      this.swishT = 0.08
      sfx.swish()
    }
    if (byHer) {
      this.kit.armful.visible = true
      const over = (this.cutTotal - this.tied * PER_BUNDLE) / PER_BUNDLE
      this.kit.armful.scale.setScalar(0.5 + 0.6 * clamp(over, 0, 1))
    }
    while (this.tied < BUNDLES && this.cutTotal >= (this.tied + 1) * PER_BUNDLE) this.tie()
    if (s.cut >= PER_PADDY * CUT_AT && !s.cutDone) {
      s.cutDone = true
      const k = this.kaylee.root.position
      let n = 0
      for (const x of this.hills) {
        if (x.paddy !== s.p.i || x.cut) continue
        this.after(0.15 + Math.hypot(x.x - k.x, x.z - k.z) * 0.1 + n++ * 0.01, () => this.cutHill(x, false))
      }
      this.after(0.3, () => sfx.planted())
    }
    if (this.cutTotal >= this.hills.length && this.round === 'harvest') {
      while (this.tied < BUNDLES) this.tie()
      this.allCut()
    }
  }

  /** An armful tied into a bundle: it pops out of her arms onto the nearest bank. */
  private tie() {
    const sh = this.sheaves[this.tied++]
    const k = this.kaylee.root.position
    const p = paddyAt(k.x, k.z, 0.3) ?? PADDIES[0]
    // The nearest edge of her paddy, and onto its bank.
    const gaps = [k.x - p.x0, p.x1 - k.x, k.z - p.z0, p.z1 - k.z]
    const e = gaps.indexOf(Math.min(...gaps))
    const x = e === 0 ? p.x0 - 0.2 : e === 1 ? p.x1 + 0.2 : clamp(k.x, p.x0 + 0.3, p.x1 - 0.3)
    const z = e === 2 ? p.z0 - 0.2 : e === 3 ? p.z1 + 0.2 : clamp(k.z, p.z0 + 0.3, p.z1 - 0.3)
    sh.from.set(k.x, this.carrier.position.y + 0.55, k.z)
    sh.to.set(x, p.top + 0.02, z)
    sh.root.rotation.y = e < 2 ? Math.PI / 2 + (Math.random() - 0.5) * 0.5 : (Math.random() - 0.5) * 0.5
    sh.root.visible = true
    sh.on = true
    sh.t = 0
    sfx.tie()
    this.kaylee.react('wiggle')
    this.kit.armful.scale.setScalar(0.5)
    this.kit.armful.visible = this.tied < BUNDLES
  }

  // ---------------------------------------------------------------- the birds

  private birdHost: BirdHost = {
    pickHill: (avoid) => {
      const free = this.hills.filter((h) => h.planted && !h.cut && Math.hypot(h.x - avoid.x, h.z - avoid.z) > 2.2)
      const pool = free.length ? free : this.hills.filter((h) => h.planted && !h.cut)
      return pool.length ? pool[Math.floor(Math.random() * pool.length)].i : -1
    },
    hillTop: (i, out) => {
      const h = this.hills[i]
      return out.set(h.x, h.floor + this.hillHeight(h) * 0.9, h.z)
    },
    peck: (i) => {
      this.hills[i].twitch = 0
      if (Math.random() < 0.3) sfx.cheep()
    },
    perches: [],
    shooed: (at, fat) => {
      this.shoos++
      this.feathers.burst(at.clone().add(new Vector3(0, 0.15, 0)), 3, 0.5, 0.6, 1.6, 0.05)
      sfx.flutter()
      this.after(0.12, () => sfx.cheep())
      if (fat) {
        sfx.waddle()
        this.after(0.4, () => this.once('fat', R.fat, true))
      }
      if (this.round === 'grow') this.growth = Math.min(1, this.growth + SHOO_BOOST)
      this.talkTo('shoo', () => this.kaylee.react('wave'), 1.6)
    },
  }

  private setPerches() {
    const f = this.farm
    const w = (o: Object3D, p: V3) => o.localToWorld(new Vector3(...p))
    f.root.updateMatrixWorld(true)
    this.birdHost.perches = [...f.scarecrow.perches.map((p) => w(f.scarecrow.root, p)), w(f.hut.root, f.hut.perch).add(new Vector3(-0.5, 0, 0)), w(f.hut.root, f.hut.perch).add(new Vector3(0.45, 0, 0)), w(f.rack.root, f.rack.perch).add(new Vector3(-0.85, 0, 0)), w(f.rack.root, f.rack.perch).add(new Vector3(0.85, 0, 0))]
  }

  // ---------------------------------------------------------------- the deck (#168's)

  private toDeck() {
    this.phase = 'deck'
    this.rig.lag = 0.9
    this.after(0.7, () => this.seatOnDeck(false))
    this.after(2.2, () => (this.rig.lag = 0.5))
    this.setRound('deck')
  }

  /** Kaylee and Daddy on the tall stools at the railing, Mommy across the deck with her phone. */
  private seatOnDeck(now: boolean) {
    const d = this.deck.root
    d.add(this.kaylee.root)
    d.add(this.nick.root)
    this.kitFor('deck')
    this.mud.visible = false
    this.deck.kratip.root.visible = true
    this.put(this.kaylee, STOOLS.kaylee[0], STOOLS.kaylee[1], STOOLS.kaylee[2], 'sit', 0)
    this.put(this.nick, STOOLS.nick[0], STOOLS.nick[1], STOOLS.nick[2], 'sit', 0)
    const face = (Math.atan2(-MOMMY_AT[0], -0.95 - MOMMY_AT[2]) * 180) / Math.PI
    this.put(this.ji, MOMMY_AT[0], MOMMY_AT[1], MOMMY_AT[2], 'stand', face)
    if (!now) {
      sfx.thump()
      this.kaylee.react('wiggle')
    }
  }

  private sip() {
    if (this.milk <= 0.01) {
      // Empty: tap again and the glass fills up.
      this.milk = 1
      sfx.pourMilk()
      this.sparkles.burst(this.deck.glass.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.25, 0)), 6, 0.5, 0.8, 0.6, 0.03, 1)
      return
    }
    this.sips++
    this.milk = Math.max(0, this.milk - 1 / SIPS)
    this.kaylee.react('wiggle')
    sfx.slurp()
    if (this.milk <= 0.01)
      this.after(0.6, () => {
        sfx.hiccup()
        this.kaylee.react('hop')
      })
  }

  /** A ball of sticky rice from the kratip, with her fingers: nom. (Empty: tap again and Mommy fills it up.) */
  private eat() {
    if (this.ballK < 1) return
    const kr = this.deck.kratip
    if (this.riceLeft <= 0.01) {
      this.riceLeft = 1
      sfx.steam()
      this.ji.react('hop')
      return this.sparkles.burst(kr.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.2, 0)), 6, 0.5, 0.8, 0.6, 0.03, 1)
    }
    this.eaten++
    this.riceLeft = Math.max(0, this.riceLeft - 1 / BALLS)
    this.ballK = 0
    this.ball.visible = true
    sfx.pop()
    this.after(0.4, () => {
      sfx.nom()
      this.kaylee.react('wiggle')
      this.cheekGrain.visible = true
      this.cheekUntil = this.time + 1.8
    })
    if (this.eaten === 1) this.after(0.7, () => this.once('aroi', R.aroi))
    if (this.eaten === 2) this.after(0.9, () => this.once('sticky', R.sticky))
  }

  /** The kratips' steam, the ball on its way to her mouth, the rice going down as she eats. */
  private stepSticky(dt: number) {
    const kr = this.deck.kratip
    this.riceShown += (this.riceLeft - this.riceShown) * Math.min(1, dt * 5)
    kr.rice.scale.set(0.5 + 0.5 * this.riceShown, Math.max(0.01, this.riceShown), 0.5 + 0.5 * this.riceShown)
    this.steamT -= dt
    if (this.steamT <= 0) {
      this.steamT = 0.14
      const src = this.phase === 'deck' ? (this.riceLeft > 0.01 ? kr.rice : null) : this.kratipK >= 0 ? this.kratip.rice : null
      if (src) {
        const at = src.getWorldPosition(tmp).add(tmp2.set((Math.random() - 0.5) * 0.08, 0.04, (Math.random() - 0.5) * 0.08))
        const big = this.phase === 'deck' ? 0.6 : 1
        this.steam.emit(at, tmp2.set((Math.random() - 0.5) * 0.1, 0.25 * big, (Math.random() - 0.5) * 0.1), 1.4, 0.05 * big)
      }
    }
    if (this.ballK < 1) {
      this.ballK = Math.min(1, this.ballK + dt / 0.4)
      const r = this.kaylee.rig
      const from = kr.rice.getWorldPosition(tmp)
      const mouth = r.head.localToWorld(tmp2.set(...r.face.mouth))
      this.ball.position.lerpVectors(from, mouth, smooth(0, 1, this.ballK)).y += bell(this.ballK) * 0.12
      if (this.ballK >= 1) this.ball.visible = false
    }
    if (this.cheekGrain.visible && this.time > this.cheekUntil) this.cheekGrain.visible = false
  }

  private smile() {
    if (this.snapAt > 0) return
    this.ev.say(R.smile)
    this.snapAt = this.time + 1.4
    this.phone.visible = true
    sfx.countdown()
    this.ji.react('wiggle')
    this.after(0.55, () => {
      this.kaylee.react('wave')
      this.nick.react('wave')
    })
  }

  private takePhoto() {
    const d = this.deck.root
    d.updateMatrixWorld(true)
    const from = d.localToWorld(new Vector3(...PHOTO_FROM))
    const at = d.localToWorld(new Vector3(0, 0.95, -0.95))
    const cam = photoCamera(44, from.x, from.y, from.z, at.x, at.y, at.z)
    this.ji.root.visible = false
    const src = snapPhoto(this.renderer, this.scene, cam)
    this.ji.root.visible = true
    this.photos++
    sfx.shutter()
    this.ev.photo(src)
    this.after(0.4, () => this.cheer())
    if (!this.doneSaid) {
      this.doneSaid = true
      this.after(1.6, () => this.ev.allDone())
    }
  }

  render() {
    if (this.photoWanted) {
      this.photoWanted = false
      this.takePhoto()
    }
    super.render()
  }

  // ---------------------------------------------------------------- leading Kaylee

  /** Where a finger on the screen is on the farm (on the step's level under it), kept where she can walk. */
  private onFarm(x: number, y: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const from = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(from).normalize()
    if (dir.y > -1e-3) return null
    const hit = (level: number) => from.clone().addScaledVector(dir, (level - from.y) / dir.y)
    let p = hit(RISE - WATER_DOWN)
    if (p.z > RISER_Z) p = hit(-WATER_DOWN)
    p.x = clamp(p.x, WALK.x0, WALK.x1)
    p.z = clamp(p.z, WALK.z0, WALK.z1)
    // Not inside something solid: just outside it.
    for (const [bx, bz, r] of BLOCKERS) {
      const d = Math.hypot(p.x - bx, p.z - bz)
      if (d < r + 0.2) {
        const k = (r + 0.2) / Math.max(d, 1e-3)
        p.x = bx + (p.x - bx) * k
        p.z = bz + (p.z - bz) * k
      }
    }
    return p
  }

  private aim(x: number, y: number) {
    const p = this.onFarm(x, y)
    if (!p) return
    this.finger.target = p
    this.finger.fresh = true
  }

  /** What's underfoot at a point: its height, and whether it splashes. */
  private groundAt(x: number, z: number): { y: number; kind: Ground; paddy: number } {
    const bw = BOARDWALK
    if (z > bw.z0 - 0.05 && z < bw.z1 + 0.05 && x > bw.x0 && x < bw.x1) return { y: bw.y, kind: 'wood', paddy: -1 }
    const [pz0, pz1] = BRIDGES[0]
    if (Math.abs(x) < 0.42 && z > pz0 && z < pz1) return { y: 0.06, kind: 'wood', paddy: -1 }
    const top = levelAt(z)
    const p = paddyAt(x, z)
    if (p) {
      const s = this.paddies[p.i]
      return s.lvl > 0.4 ? { y: top - WADE_DOWN, kind: 'wade', paddy: p.i } : { y: top - MUD_DOWN + 0.025, kind: 'mud', paddy: p.i }
    }
    if (inChannel(x, z)) return { y: top - 0.17, kind: 'channel', paddy: -1 }
    // Up the stairs (a ramp underfoot, so she climbs them).
    for (const sx of STAIRS) if (Math.abs(x - sx) < 0.42 && z > RISER_Z - 0.05 && z < RISER_Z + 0.6) return { y: RISE * clamp((RISER_Z + 0.6 - z) / 0.6, 0, 1), kind: 'wood', paddy: -1 }
    return { y: top, kind: 'bank', paddy: -1 }
  }

  /** Kaylee's frame on the farm: following the finger, the ground under her, splashes and steps, what she bumps. */
  private stepKaylee(dt: number) {
    const k = this.kaylee.root.position
    const busy = this.time < this.busyUntil || this.hopping
    const tgt = this.finger.target
    if (tgt && !busy) {
      const d = Math.hypot(tgt.x - k.x, tgt.z - k.z)
      if (d > 0.1 && (this.finger.fresh || !this.kaylee.walking)) this.kaylee.walk([[tgt.x, tgt.z]])
      this.finger.fresh = false
      if (d <= 0.1 && !this.finger.held) this.finger.target = null
    }
    this.kaylee.pace = (this.ground === 'wade' || this.ground === 'channel' ? SPEED_WADE : SPEED_BANK) / THAI_TUNE.walkSpeed
    // ---- Kept on the farm, sliding round the scarecrow, the hut, the rack... ----
    k.x = clamp(k.x, WALK.x0, WALK.x1)
    k.z = clamp(k.z, WALK.z0, WALK.z1)
    for (const [bx, bz, r] of BLOCKERS) {
      const d = Math.hypot(k.x - bx, k.z - bz)
      if (d < r && d > 1e-4) {
        k.x = bx + ((k.x - bx) * r) / d
        k.z = bz + ((k.z - bz) * r) / d
      }
    }
    // Stuck against something: stop trying.
    const moved = Math.hypot(k.x - this.lastPos.x, k.z - this.lastPos.z)
    this.stuckT = this.kaylee.walking && moved < dt * 0.25 ? this.stuckT + dt : 0
    if (this.stuckT > 0.5) {
      this.kaylee.stop()
      this.finger.target = null
      this.stuckT = 0
    }
    this.lastPos.copy(k)
    // ---- The ground: down into the water, up onto the banks, a hop up or down the step ----
    const g = this.groundAt(k.x, k.z)
    const before = this.ground
    this.ground = g.kind
    const L = this.lift
    if (L.hop < 0 && Math.abs(g.y - L.y) > 0.22) {
      L.hop = 0
      L.from = L.y
      sfx.boing()
    }
    if (L.hop >= 0) {
      L.hop = Math.min(1, L.hop + dt / 0.32)
      L.y = L.from + (g.y - L.from) * L.hop
      this.carrier.position.y = L.y + bell(L.hop) * 0.3
      if (L.hop >= 1) {
        L.hop = -1
        this.kaylee.react('wiggle')
      }
    } else {
      L.y += (g.y - L.y) * Math.min(1, dt * 16)
      this.carrier.position.y = L.y
    }
    const wet = g.kind === 'wade' || g.kind === 'channel'
    if (wet && before !== 'wade' && before !== 'channel') {
      // In she goes: a big splash.
      sfx.splash()
      this.splash.burst(tmp.set(k.x, L.y + WADE_DOWN - WATER_DOWN + 0.03, k.z), 14, 1.4, 2.2, 0.6, 0.06)
      this.farm.water.ripple(k.x, k.z, 1)
      if (this.muddy > 0) this.washOff()
    }
    if (wet) this.wetUntil = this.time + 5
    // A step: a sploosh and a ripple ring in the water, a squelch in the mud, a thud on the bank, a knock on wood.
    this.stepDist += moved
    if (this.stepDist > 0.3) {
      this.stepDist = 0
      if (wet) {
        sfx.sploosh()
        this.farm.water.ripple(k.x, k.z, 0.9)
        this.splash.burst(tmp.set(k.x, L.y + WADE_DOWN - WATER_DOWN + 0.02, k.z), 5, 0.9, 1.6, 0.45, 0.04)
      } else if (g.kind === 'mud') {
        sfx.squelch()
        this.mudBits.burst(tmp.set(k.x, L.y + 0.03, k.z), 3, 0.5, 1.0, 0.4, 0.03)
      } else sfx.step(g.kind === 'wood')
    }
    if (wet && moved < dt * 0.05) {
      this.still += dt
      if (this.still > 1.3) {
        this.still = 0
        this.farm.water.ripple(k.x, k.z, 0.5)
      }
    }
    // ---- What she bumps into ----
    if (this.phase !== 'farm') return
    for (const s of this.paddies) {
      const [gx, , gz] = s.p.gate
      if (this.round === 'plant' && !s.open && Math.hypot(k.x - gx, k.z - gz) < 0.5) this.flood(s, false)
    }
    const n = this.nick.root.position
    if (Math.hypot(k.x - n.x, k.z - n.z) < 0.62) this.bumpNick()
    if (Math.hypot((k.x - WALLOW.x) / 1.2, (k.z - WALLOW.z) / 0.85) < WALLOW.r) this.inWallow()
    if (Math.hypot(k.x - STRAW_PILE[0], k.z - STRAW_PILE[2]) < 0.75 || (this.goFlop && Math.hypot(k.x - STRAW_PILE[0], k.z - STRAW_PILE[2]) < 0.95)) this.flop()
    if (Math.hypot(k.x - SCARECROW[0], k.z - SCARECROW[2]) < 0.45) this.talkTo('scare-bump', () => (this.scareSpin = 0.5), 2)
    const [dx0, dz0] = [NURSERY.x, NURSERY.z]
    if (this.round === 'plant' && Math.abs(k.x - dx0) < NURSERY.w / 2 + 0.2 && Math.abs(k.z - dz0) < NURSERY.d / 2 + 0.2)
      this.talkTo('nursery', () => {
        this.nurseryWob = 0
        this.sparkles.burst(tmp.set(k.x, 0.7, k.z), 6, 0.6, 1, 0.6, 0.04, 3)
        sfx.pop()
      }, 3)
  }

  private bumpNick() {
    this.talkTo('nick-bump', () => {
      if (this.round === 'harvest' && this.kit.armful.visible) {
        // Her armful of straw lands on his head: a straw hat.
        this.nickHat.visible = true
        this.nickHatUntil = this.time + 4
        sfx.rustle()
        this.after(0.3, () => sfx.haha())
        this.after(0.8, () => this.once('hat', R.hat, true))
        this.bits.burst(this.nick.rig.head.getWorldPosition(new Vector3()).add(new Vector3(0, 0.4, 0)), 10, 0.8, 1.2, 0.7, 0.04)
      } else if (this.time < this.wetUntil) {
        // Dripping wet unicorn: splash! Daddy shakes like a dog.
        this.nickShake = 0
        sfx.wet()
        this.splash.burst(this.nick.root.position.clone().add(new Vector3(0, 0.7, 0)), 14, 1.2, 1.6, 0.6, 0.05)
        this.after(0.35, () => sfx.haha())
        this.after(0.9, () => this.once('wet', R.wet, true))
      } else {
        this.nick.react('hop')
        sfx.haha()
      }
      this.kaylee.react('wiggle')
      sfx.giggle()
    }, 3)
  }

  private inWallow() {
    this.talkTo('wallow', () => {
      this.muddy = 1
      this.mud.visible = true
      this.buffaloRoll = 0
      sfx.splat()
      this.after(0.3, () => sfx.moo())
      this.mudBits.burst(tmp.set(WALLOW.x, RISE + 0.1, WALLOW.z), 18, 1.4, 2, 0.6, 0.05)
      this.kaylee.react('wiggle')
      this.after(0.5, () => sfx.giggle())
      this.after(1.0, () => this.once('muddy', R.muddy, true))
    }, 4)
  }

  private washOff() {
    this.muddy = 0
    this.mud.visible = false
    const k = this.kaylee.root.position
    this.sparkles.burst(tmp.set(k.x, this.carrier.position.y + 0.5, k.z), 10, 0.8, 1.2, 0.7, 0.04, 2)
  }

  private flop() {
    this.goFlop = false
    this.talkTo('flop', () => {
      this.kaylee.stop()
      this.finger.target = null
      this.kaylee.setPose('lie')
      this.busyUntil = this.time + 1.1
      this.strawPuff = 0
      sfx.flop()
      sfx.rustle()
      this.bits.burst(tmp.set(STRAW_PILE[0], 0.5, STRAW_PILE[2]), 24, 1.4, 2.2, 0.9, 0.05)
      this.after(1.1, () => {
        this.kaylee.setPose('stand')
        sfx.giggle()
        this.once('flop', R.flop, true)
      })
    }, 4)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    if (this.phase === 'deck') return [this.kaylee.root, this.nick.root, this.ji.root, this.deck.glass.root, this.deck.cup, this.deck.kratip.root, this.deck.chime]
    return []
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined || id || this.phase !== 'farm') return
    this.finger.held = true
    this.aim(x, y)
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld || !this.finger.held || this.phase !== 'farm') return
    this.lastTouch = this.time
    this.aim(x, y)
  }

  pointerUp() {
    // (She keeps going to where the finger was: a tap walks her there.)
    this.finger.held = false
  }

  protected onTap(id: string | null) {
    if (this.phase === 'deck') return this.tapDeck(id)
    if (this.phase === 'thresh') return this.thresh()
    if (!id) return
    if (id.startsWith('gate:')) {
      const s = this.paddies[Number(id.slice(5))]
      if (this.round === 'plant' && !s.open) return this.flood(s, false)
      s.wiggle = 0
      return sfx.gate()
    }
    if (id.startsWith('duck:')) {
      const d = this.duckAt[Number(id.slice(5))]
      d.dash = 1
      d.dir = -d.dir
      sfx.quack()
      this.after(0.6, () => this.once('duck', R.duck))
      return this.splash.burst(this.farm.ducks[Number(id.slice(5))].position, 6, 0.7, 1.2, 0.4, 0.035)
    }
    switch (id) {
      case 'scarecrow':
        this.scareSpin = 0
        this.hatFlip = 0
        this.after(0.4, () => this.once('scarecrow', R.scarecrow, true))
        return sfx.spin()
      case 'buffalo':
        this.buffaloLook = 0
        this.buffaloRoll = Math.min(this.buffaloRoll, 0.3)
        this.after(1.0, () => this.once('buffalo', R.buffalo))
        return this.talkTo('moo', () => sfx.moo(), 1.2)
      case 'frog':
        this.frog.croak = 0
        return this.frogHop()
      case 'nursery':
        this.nurseryWob = 0
        return sfx.rustle()
      case 'straw': {
        // She trots over and flops in.
        this.goFlop = true
        const p = new Vector3(STRAW_PILE[0] - 0.6, 0, STRAW_PILE[2] + 0.2)
        this.finger.target = p
        this.finger.fresh = true
        return
      }
      case 'hut':
        this.chimeSwing = 0
        return sfx.windChime()
      case 'banana':
        this.bananaWob = 0
        return sfx.rustle()
      case 'bamboo':
        this.bambooWob = 0
        return [0, 0.12, 0.3].forEach((d) => this.after(d, () => sfx.plop()))
      case 'cafe':
        return sfx.windChime()
      case 'family:nick':
        this.nick.react(this.round === 'harvest' ? 'wave' : 'hop')
        sfx.haha()
        // (Not while Sparkle talks: it would come late.)
        if (speakingVoice() === 'sparkle') return
        return this.talkTo('nick-tap', () => this.ev.say(R.tap[this.nickTap++ % R.tap.length]), 3)
      case 'family:lung':
        this.lung.react('hop')
        if (speakingVoice() === 'sparkle') return sfx.chuckle()
        return this.talkTo('lung-tap', () => this.ev.say(R.lungTap[this.lungTap++ % R.lungTap.length]), 3)
    }
  }

  private tapDeck(id: string | null) {
    switch (id) {
      case 'glass':
      case 'family:kaylee':
        return this.sip()
      case 'kratip':
        return this.eat()
      case 'cup':
        this.nick.react('wiggle')
        sfx.slurp()
        this.after(0.45, () => sfx.ahh())
        return this.after(1.0, () => this.once('coffee', R.coffee, true))
      case 'family:nick':
        this.nick.react('hop')
        return sfx.haha()
      case 'family:ji':
        return this.smile()
      case 'chime':
        this.deckChime = 0
        return sfx.windChime()
      case 'view':
        sfx.chime()
        this.talkTo('steps', () => this.ev.say(R.steps), 5)
        return this.sparkles.burst(new Vector3(0, 1.2, 0), 16, 1.6, 1.2, 1.1, 0.12)
    }
  }

  // ---------------------------------------------------------------- critters

  private frogSpots = [new Vector3(-4.42, 0, 1.2), new Vector3(-0.42, 0, 2.6), new Vector3(4.42, RISE, -2.0), new Vector3(0.42, RISE, -1.6), new Vector3(-2.4, 0, 0.3), new Vector3(2.8, RISE, -0.72)]

  private frogHop() {
    const f = this.frog
    f.from.copy(this.farm.frog.root.position)
    f.spot = (f.spot + 1 + Math.floor(Math.random() * (this.frogSpots.length - 1))) % this.frogSpots.length
    f.hop = 0
    sfx.croak()
  }

  private placeCritters(t: number) {
    const f = this.farm
    const fr = this.frogSpots[this.frog.spot]
    if (this.frog.hop >= 1) f.frog.root.position.copy(fr)
    f.frog.root.rotation.y = Math.sin(t * 0.4) * 0.5 + (fr.x < 0 ? 0.8 : -0.8)
    this.duckAt.forEach((d, i) => {
      const back = i === 1
      const z0 = back ? -3.9 : 0.75
      const z1 = back ? -0.9 : 3.2
      const duck = f.ducks[i]
      duck.position.set(Math.sin(t * 0.7 + i) * 0.06, (back ? RISE : 0) - 0.11 + Math.sin(t * 3 + i) * 0.008, clamp(d.z, z0, z1))
      duck.rotation.y = d.dir > 0 ? 0 : Math.PI
      duck.rotation.z = Math.sin(t * 4 + i) * 0.06
    })
  }

  private stepCritters(dt: number, t: number) {
    const f = this.farm
    const k = this.kaylee.root.position
    // ---- Ducks: paddling up and down the channel, dashing off when she splashes near ----
    this.duckAt.forEach((d, i) => {
      const back = i === 1
      const z0 = back ? -3.9 : 0.75
      const z1 = back ? -0.9 : 3.2
      const pos = f.ducks[i].position
      if (Math.hypot(k.x - pos.x, k.z - pos.z) < 0.8 && d.dash < 0.2) {
        d.dash = 1
        d.dir = k.z < pos.z ? 1 : -1
        this.talkTo(`quack${i}`, () => sfx.quack(), 2)
      }
      d.z += d.dir * (0.18 + d.dash * 1.2) * dt
      d.dash = Math.max(0, d.dash - dt * 0.7)
      if (d.z > z1) d.dir = -1
      if (d.z < z0) d.dir = 1
    })
    // ---- The frog: sits on a bank, puffs its throat, hops on when she comes near ----
    const fr = this.frog
    if (fr.hop < 1) {
      fr.hop = Math.min(1, fr.hop + dt / 0.55)
      const to = this.frogSpots[fr.spot]
      f.frog.root.position.lerpVectors(fr.from, to, fr.hop).y += bell(fr.hop) * 0.6
      if (fr.hop >= 1) this.splash.burst(to, 4, 0.5, 1, 0.4, 0.03)
    } else if (Math.hypot(k.x - f.frog.root.position.x, k.z - f.frog.root.position.z) < 0.7) this.frogHop()
    fr.croak = Math.min(1, fr.croak + dt / 0.5)
    const puff = Math.max(bell(fr.croak), Math.sin(t * 1.7) > 0.97 ? 0.6 : 0)
    f.frog.throat.scale.set(1 + puff * 0.8, 0.6 + puff * 0.8, 0.6 + puff * 0.8)
    this.placeCritters(t)
    // ---- The buffalo: chewing, head up when poked, rolling happily in the mud ----
    const bf = f.buffalo
    const body = bf.root.userData.body as Group
    this.buffaloLook = Math.min(1, this.buffaloLook + dt / 1.4)
    this.buffaloRoll = Math.min(1, this.buffaloRoll + dt / 1.6)
    bf.head.rotation.x = 0.35 + Math.sin(t * 1.1) * 0.1 - bell(this.buffaloLook) * 0.6
    bf.tail.rotation.z = Math.sin(t * (this.buffaloRoll < 1 ? 14 : 2.2)) * (this.buffaloRoll < 1 ? 0.7 : 0.3)
    body.rotation.z = Math.sin(this.buffaloRoll * Math.PI * 2) * 0.35 * bell(this.buffaloRoll)
    body.position.y = -bell(this.buffaloRoll) * 0.12
    // ---- The scarecrow spins, its hat flies up and lands back; the hut's chime; banana, bamboo, nursery wobble ----
    this.scareSpin = Math.min(1, this.scareSpin + dt / 0.9)
    f.scarecrow.root.rotation.y = this.scareSpin < 1 ? (1 - (1 - this.scareSpin) ** 2) * Math.PI * 2 : Math.sin(t * 0.8) * 0.04
    this.hatFlip = Math.min(1, this.hatFlip + dt / 1.0)
    f.scarecrow.hat.position.y = 1.56 + bell(this.hatFlip) * 0.75
    f.scarecrow.hat.rotation.x = this.hatFlip < 1 ? this.hatFlip * Math.PI * 2 : 0
    if (this.hatFlip < 1 && this.hatFlip + dt / 1.0 >= 1) sfx.thump()
    this.chimeSwing = Math.min(1, this.chimeSwing + dt / 2.4)
    f.hut.chime.rotation.z = Math.sin(t * 6) * 0.35 * (1 - this.chimeSwing) + Math.sin(t * 1.3) * 0.05
    this.bananaWob = Math.min(1, this.bananaWob + dt / 1.2)
    f.banana.rotation.z = Math.sin(t * 9) * 0.08 * (1 - this.bananaWob) + Math.sin(t * 0.9) * 0.012
    this.bambooWob = Math.min(1, this.bambooWob + dt / 1.6)
    f.bamboo.rotation.z = Math.sin(t * 5) * 0.07 * (1 - this.bambooWob) + Math.sin(t * 0.6 + 1) * 0.015
    this.nurseryWob = Math.min(1, this.nurseryWob + dt / 0.8)
    f.nursery.scale.set(1, 1 + Math.sin(this.nurseryWob * Math.PI * 4) * 0.12 * (1 - this.nurseryWob), 1)
    this.strawPuff = Math.min(1, this.strawPuff + dt / 0.7)
    f.straw.scale.set(1 + bell(this.strawPuff) * 0.15, 1 - bell(this.strawPuff) * 0.25, 1 + bell(this.strawPuff) * 0.15).multiplyScalar(this.strawSize)
    // ---- Daddy: a shake like a dog; the straw on his head comes off after a while ----
    this.nickShake = Math.min(1, this.nickShake + dt / 0.8)
    this.nick.root.rotation.z = Math.sin(t * 30) * 0.08 * bell(this.nickShake)
    if (this.nickHat.visible && this.time > this.nickHatUntil) {
      this.nickHat.visible = false
      this.nickShake = 0
      this.bits.burst(this.nick.rig.head.getWorldPosition(new Vector3()).add(new Vector3(0, 0.3, 0)), 12, 1, 1.2, 0.7, 0.04)
    }
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    if (!this.birdHost.perches.length) this.setPerches()
    this.plipT -= dt
    this.swishT -= dt
    this.springT -= dt
    if (this.phase === 'farm') {
      this.stepKaylee(dt)
      this.brush()
    } else if (this.phase === 'thresh') this.stepThresh(dt)
    // ---- The growing round: the rice grows, the birds come, a little rain ----
    if (this.round === 'grow') {
      const rate = Math.max(0.55, 1 - 0.1 * this.birds.pecking) / GROW_S
      this.growth = Math.min(1, this.growth + rate * dt)
      while (this.waves < WAVES.length && this.growth >= WAVES[this.waves].at) {
        const w = WAVES[this.waves++]
        this.birds.call(w.n, w.sides, this.birdHost, this.kaylee.root.position)
        sfx.cheep()
      }
      if (this.growth >= 0.48 && this.cloudT < 0) this.cloudT = 0
      if (this.growth >= 0.78) this.once('tall', R.tall, true)
      if (this.growth >= 1) this.ripe()
    }
    this.birds.update(dt, t, this.birdHost, this.kaylee.root.position, this.round === 'grow')
    this.stepCloud(dt)
    // ---- The paddies: water rising (or draining), gates lifting, droopy seedlings springing up as the water reaches ----
    for (const s of this.paddies) {
      const p = s.p
      s.lvl += clamp(s.lvlGoal - s.lvl, -dt / 2, dt / 1.5)
      const w = this.farm.paddyWater[p.i]
      const floor = p.top - MUD_DOWN
      w.visible = s.lvl > 0.003
      w.position.y = floor - 0.012 + (p.top - WATER_DOWN - floor + 0.012) * s.lvl
      FarmWater.setShine(w, s.lvlGoal < 0.5 ? 0 : smooth(0.25, 0.85, s.lvl))
      s.gateK += ((s.open ? 1 : 0) - s.gateK) * Math.min(1, dt * 5)
      s.wiggle = Math.min(1, s.wiggle + dt / 0.6)
      const gate = this.farm.gates[p.i]
      gate.board.position.y = p.top + s.gateK * 0.26 + bell(s.wiggle) * 0.04
      gate.board.rotation.x = Math.sin(s.wiggle * Math.PI * 6) * 0.08 * (1 - s.wiggle)
      gate.flow.visible = s.gateK > 0.5 && s.lvlGoal > 0.5
      if (s.open && s.lvl < 0.98 && s.lvlGoal > 0.5) {
        // The channel's water gushing in through the gate.
        const [gx, gy, gz] = p.gate
        for (let i = 0; i < 2; i++) this.splash.emit(tmp.set(gx, gy + 0.02, gz + (Math.random() - 0.5) * 0.3), tmp2.set(p.side * (1.2 + Math.random()), 1.2 + Math.random(), (Math.random() - 0.5) * 0.6), 0.4, 0.05)
        // The water reaches the seedlings nearest the gate first.
        const reach = s.lvl * 4.6
        for (const h of this.hills) {
          if (h.paddy !== p.i || !h.planted || h.wet >= 1 || h.spring < 1) continue
          if (Math.hypot(h.x - gx, h.z - gz) < reach) {
            h.spring = 0
            this.sparkles.emit(tmp.set(h.x, h.floor + 0.3, h.z), tmp2.set(0, 1, 0), 0.6, 0.05)
            if (this.springT <= 0) {
              this.springT = 0.09
              sfx.springUp()
            }
          }
        }
      }
      if (s.open && s.lvl >= 0.98) for (const h of this.hills) if (h.paddy === p.i && h.planted && h.wet < 1 && h.spring >= 1) h.spring = 0
    }
    if (this.round === 'plant') for (const s of this.paddies) if (s.done && s.open && s.lvl >= 0.99) this.checkPlanted()
    // ---- Sheaves popping onto the banks, and later hopping onto the rack ----
    for (const [k, s] of this.sheaves.entries()) {
      if (s.t >= 1 || !s.root.visible) continue
      s.t = Math.min(1, s.t + dt / 0.5)
      s.root.position.lerpVectors(s.from, s.to, s.t).y += bell(s.t) * 0.7
      if (s.t >= 1) {
        if (s.toRack) {
          s.root.visible = s.on = false
          this.farm.rack.bundles[k].visible = true
          this.racked++
          sfx.thunk()
        } else sfx.thump()
      }
    }
    this.stepHills(dt, t)
    this.stepCritters(dt, t)
    // ---- The family ----
    if (this.phase === 'deck') {
      const ph = this.phone.visible ? this.phone.getWorldPosition(new Vector3()) : this.deckAt(MOMMY_AT[0], 1.2, MOMMY_AT[2])
      this.kaylee.lookAt(ph.x, ph.y, ph.z)
      this.nick.lookAt(ph.x, ph.y, ph.z)
      const k = this.deckAt(0, 1.0, -0.95)
      this.ji.lookAt(k.x, k.y, k.z)
      this.lung.lookAt(k.x, k.y, k.z)
    } else {
      const k = this.kaylee.root.position
      const bird = this.birds.longest()
      const look = this.finger.target ?? bird
      if (look) this.kaylee.lookAt(look.x, 0.4, look.z)
      else this.kaylee.lookAway()
      this.nick.lookAt(k.x, this.carrier.position.y + 0.8, k.z)
      this.lung.lookAt(k.x, this.carrier.position.y + 0.8, k.z)
    }
    // ---- Milk, the photo ----
    this.milkShown += (this.milk - this.milkShown) * Math.min(1, dt * 5)
    this.deck.glass.milk.scale.y = Math.max(0.001, 0.17 * this.milkShown)
    if (this.snapAt > 0 && this.time >= this.snapAt) {
      this.snapAt = -1
      this.photoWanted = true
      this.after(0.6, () => (this.phone.visible = false))
    }
    this.chimeDeck(dt, t)
    for (const c of [this.kaylee, this.nick, this.ji, this.lung]) c.update(dt, t)
    // ---- Far-off farm life, now and then, when nobody's talking ----
    this.farT -= dt
    if (this.farT <= 0) {
      this.farT = 5 + Math.random() * 5
      if (!speakingVoice()) sfx.far[Math.floor(Math.random() * sfx.far.length)]()
    }
    this.threshArms()
    this.stepSticky(dt)
    for (const f of [this.splash, this.sparkles, this.bits, this.feathers, this.mudBits, this.rain, this.grains, this.steam]) f.update(dt)
    this.farm.water.update(t)
    this.life.update(dt, t, this.kaylee.root.getWorldPosition(tmp))
    // The low clouds drift slowly along the valley and back.
    for (const [i, m] of this.farm.mist.entries()) m.position.x = (m.userData.home as number) + Math.sin(t * 0.05 + i * 1.7) * 2.5
    this.hintNow = this.time - this.lastTouch > STUCK_S - 0.1 ? this.hint() : null
    this.stuck()
    const map = (this.farm.fall.material as MeshBasicMaterial).map
    if (map) map.offset.y = t * 1.6
  }

  /** After a while with nothing done, Sparkle says what to do (a few times a round at most). */
  private stuck() {
    if (this.finger.held || this.hopping || this.kaylee.walking || this.snapAt > 0) return
    if (this.time - Math.max(this.lastTouch, this.quietFrom) < SAY_S || this.time - this.lastSay < SAY_EVERY || this.sayN >= SAY_MAX) return
    const l = this.stuckLine()
    if (!l) return
    this.lastSay = this.time
    this.sayN++
    if (spendHint(l)) this.ev.say(l)
  }
  private stuckLine(): Line | null {
    if (this.phase === 'deck') return this.photos ? null : !this.eaten && !this.sips ? R.hint.eat : R.hint.photo
    if (this.phase === 'thresh') return this.threshed < THRESHED ? R.hint.thresh : null
    switch (this.round) {
      case 'plant':
        return this.paddies.some((s) => !s.open && (s.planted > 0 || this.paddies.every((x) => x.done || !x.open))) ? R.hint.gate : R.hint.plant
      case 'grow':
        return this.birds.pecking ? R.hint.grow : null
      case 'harvest':
        return R.hint.harvest
    }
    return null
  }

  private deckChime = 1
  private chimeDeck(dt: number, t: number) {
    this.deckChime = Math.min(1, this.deckChime + dt / 2.4)
    this.deck.chime.rotation.z = Math.sin(t * 6) * 0.35 * (1 - this.deckChime) + Math.sin(t * 1.3) * 0.04
  }

  /** The little cloud halfway through the growing: it drifts over and rains on the farm, then Kaylee shakes off. */
  private stepCloud(dt: number) {
    if (this.cloudT < 0 || this.cloudT >= 1) {
      this.cloud.visible = false
      return
    }
    this.cloudT = Math.min(1, this.cloudT + dt / 7)
    this.cloud.visible = true
    const x = -9 + this.cloudT * 18
    this.cloud.position.set(x, 3.4, -0.6)
    this.cloud.scale.setScalar(1 + Math.sin(this.time * 2) * 0.03)
    if (Math.abs(x) < 5.5) {
      this.once('rain', R.rain, true)
      for (let k = 0; k < 4; k++) this.rain.emit(tmp.set(x + (Math.random() - 0.5) * 1.8, 3.0, -0.6 + (Math.random() - 0.5) * 1.0), tmp2.set(0, -7, 0), 0.46, 0.035)
      this.rainT -= dt
      if (this.rainT <= 0) {
        this.rainT = 0.24
        sfx.rain()
      }
      // Rain makes the rice grow a little faster.
      if (this.round === 'grow') this.growth = Math.min(1, this.growth + dt * 0.01)
    }
    if (this.cloudT >= 1) {
      this.kaylee.react('wiggle')
      this.splash.burst(this.kaylee.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.6, 0)), 10, 1, 1, 0.5, 0.04)
    }
  }

  /** Height of a hill's rice now (meters). */
  private hillHeight(h: Hill) {
    return SUNK + riceH(this.growth) * (1 + (this.paddies[h.paddy].tall - 1) * smooth(0.2, 1, this.growth))
  }

  /** Every hill's look this frame: popping in, droopy or straight, growing, leaning away from Kaylee, cut to stubble. */
  private stepHills(dt: number, t: number) {
    const k = this.kaylee.root.position
    const inFarm = this.phase === 'farm'
    const g = this.growth
    const green = smooth(0, 0.45, g)
    const gold = smooth(0.72, 1, g)
    const hk = smooth(0.42, 0.72, g)
    const sway = 0.04 + 0.08 * g
    for (const h of this.hills) {
      // ---- Popping in, springing up, a peck's twitch ----
      if (h.planted && h.pop < 1) {
        if (h.wait > 0) h.wait -= dt
        else {
          if (h.pop === 0 && this.plipT <= 0) {
            this.plipT = 0.05
            sfx.plip(this.plips++ % 8 + h.paddy)
            if (h.wet > 0.5) this.splash.burst(tmp.set(h.x, h.floor + 0.12, h.z), 2, 0.5, 1.2, 0.3, 0.03)
          }
          h.pop = Math.min(1, h.pop + dt / 0.25)
        }
      }
      if (h.spring < 1) {
        h.spring = Math.min(1, h.spring + dt / 0.35)
        h.wet = h.spring
      }
      h.twitch = Math.min(1, h.twitch + dt / 0.25)
      // ---- Leaning away from her as she wades past, springing back after ----
      let fx = 0
      let fz = 0
      if (inFarm) {
        const dx = h.x - k.x
        const dz = h.z - k.z
        const d = Math.hypot(dx, dz)
        if (d < LEAN_R && d > 1e-3) {
          const f = (1 - d / LEAN_R) * 0.6
          fx = (dx / d) * f
          fz = (dz / d) * f
        }
      }
      h.vx += ((fx - h.lx) * 90 - h.vx * 9) * dt
      h.vz += ((fz - h.lz) * 90 - h.vz * 9) * dt
      h.lx += h.vx * dt
      h.lz += h.vz * dt
      // ---- The matrices ----
      if (!h.planted) {
        this.blades.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, 0, 0, 0, 0, 0))
        this.heads.set(h.i, m4)
        this.stubble.set(h.i, m4)
        continue
      }
      if (h.cut) {
        h.cutK = Math.min(1, h.cutK + dt / 0.2)
        const s = 1 + 0.4 * bell(h.cutK)
        this.blades.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, 0, 0, 0, 0, 0))
        this.heads.set(h.i, m4)
        this.stubble.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, 1.1 * s, SUNK * 0.9 + 0.1 * s, h.lx * 0.3, h.lz * 0.3, h.turn), col.copy(STUBBLE).offsetHSL(0, 0, h.shade * 0.03))
        continue
      }
      this.stubble.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, 0, 0, 0, 0, 0))
      const pop = h.wait > 0 ? 0 : h.pop < 1 ? h.pop * (1 + 0.35 * bell(h.pop)) : 1
      const height = SUNK + (this.hillHeight(h) - SUNK) * pop * (1 - 0.35 * (1 - h.wet)) * (1 + 0.12 * bell(h.spring))
      const width = riceW(g) * pop * (1 + 0.25 * (1 - h.wet))
      // Dry seedlings flop over; the wind sways them all; a peck twitches one.
      const droop = (1 - h.wet) * 0.75
      const w = Math.sin(t * 1.6 + h.phase + h.x * 0.4) * sway + Math.sin(this.twitchOf(h)) * 0.25 * (1 - h.twitch)
      const lx = h.lx + Math.cos(h.droop) * droop + w * 0.7
      const lz = h.lz + Math.sin(h.droop) * droop + w * 0.3
      col.copy(SEEDLING).lerp(DRY, 1 - h.wet).lerp(GROWN, green).lerp(LEAF_GOLD, gold).offsetHSL(0, 0, h.shade * 0.035)
      this.blades.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, width, height, lx, lz, h.turn), col)
      c2.copy(HEAD_GREEN).lerp(GOLD, smooth(0.62, 0.95, g))
      this.heads.set(h.i, hillMatrix(m4, h.x, h.floor, h.z, width * hk, height * (0.94 + 0.06 * hk), lx, lz, h.turn), c2)
    }
    this.blades.done()
    this.heads.done()
    this.stubble.done()
  }
  private twitchOf(h: Hill) {
    return h.twitch * Math.PI * 4
  }

  // ---------------------------------------------------------------- helpers

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Once every few seconds at most (a quick run of the same thing gets one answer). */
  private talkTo(key: string, f: () => void, every = 2.5) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  private cheer() {
    for (const [k, c] of [this.kaylee, this.nick, this.ji, this.lung].entries()) this.after(k * 0.12, () => c.react('hop'))
    sfx.cheer()
  }
  private screen(world: Vector3) {
    const c = world.clone().project(this.rig.camera)
    if (c.z > 1) return null
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }
  private deckAt(x: number, y: number, z: number) {
    this.deck.root.updateMatrixWorld()
    return this.deck.root.localToWorld(new Vector3(x, y, z))
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    const tall = this.w < this.h
    if (this.phase === 'farm') {
      // High and in front, the four paddies square; drifting a little toward Kaylee so it feels alive.
      const k = this.kaylee.root.position
      const center = new Vector3(0, 0.15, 0.3)
      center.x += (k.x - center.x) * (tall ? 0.2 : 0.1)
      center.z += (k.z - center.z) * 0.08
      if (tall) return { center, half: new Vector3(5.5, 0.6, 4.4), yaw: 0, pitch: 58, minDist: 8 }
      // Wide: low and close, looking across the paddies (Dad's camera-lab framing on iPhone landscape).
      return { center, half: new Vector3(4.48, 0.5, 3.53), yaw: 0, pitch: 17, minDist: 6.64 }
    }
    if (this.phase === 'thresh') {
      const center = new Vector3(BASKET[0] - 0.2, 0.7, BASKET[2] - 1.0)
      if (tall) return { center, half: new Vector3(1.5, 0.9, 1.9), yaw: -18, pitch: 26, minDist: 3 }
      return { center, half: new Vector3(2.0, 0.9, 1.6), yaw: -18, pitch: 24, minDist: 3 }
    }
    const c = this.deckAt(0.45, 0.95, -0.8)
    const yaw = (DECK.yaw * 180) / Math.PI
    if (tall) return { center: c, half: new Vector3(1.45, 1.05, 0.8), yaw, pitch: 12, minDist: 2.2, follow: true }
    return { center: c, half: new Vector3(2.3, 0.95, 0.8), yaw, pitch: 10, minDist: 2.2, follow: true }
  }

  /** What the hint finger points at now (a place, or a tap target's id). */
  private hint(): { at: Vector3; id?: string } | null {
    const k = this.kaylee.root.position
    if (this.phase === 'farm') {
      if (this.finger.held || this.hopping) return null
      if (this.round === 'plant') {
        const wet = this.hills.filter((h) => !h.planted && this.paddies[h.paddy].open && !this.paddies[h.paddy].done)
        if (wet.length) {
          const h = wet.sort((a, b) => Math.hypot(a.x - k.x, a.z - k.z) - Math.hypot(b.x - k.x, b.z - k.z))[0]
          return { at: new Vector3(h.x, h.floor + 0.1, h.z) }
        }
        const dry = this.paddies.find((s) => !s.open)
        if (dry && (dry.planted > 0 || this.paddies.every((s) => s.done || !s.open))) return { at: new Vector3(...dry.p.gate).add(new Vector3(0, 0.25, 0)), id: `gate:${dry.p.i}` }
        const left = this.hills.filter((h) => !h.planted && !this.paddies[h.paddy].done)
        const h = left.sort((a, b) => Math.hypot(a.x - k.x, a.z - k.z) - Math.hypot(b.x - k.x, b.z - k.z))[0]
        return h ? { at: new Vector3(h.x, h.floor + 0.1, h.z) } : null
      }
      if (this.round === 'grow') {
        const b = this.birds.longest()
        return b ? { at: b } : null
      }
      if (this.round === 'harvest') {
        const left = this.hills.filter((h) => !h.cut)
        const h = left.sort((a, b) => Math.hypot(a.x - k.x, a.z - k.z) - Math.hypot(b.x - k.x, b.z - k.z))[0]
        return h ? { at: new Vector3(h.x, h.floor + 0.4, h.z) } : null
      }
      return null
    }
    if (this.phase === 'thresh') {
      if (this.threshed >= THRESHED) return null
      if (this.holding) return { at: new Vector3(BASKET[0], 0.6, BASKET[2]), id: 'basket' }
      return { at: this.farm.rack.bundles[BUNDLES - 1 - this.threshed].getWorldPosition(new Vector3()), id: 'rack' }
    }
    if (this.snapAt > 0) return null
    if (!this.eaten && !this.sips) return { at: this.deck.kratip.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), id: 'kratip' }
    return this.photos ? null : { at: this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0)), id: 'family:ji' }
  }

  protected hintAt() {
    return this.hintNow?.at ?? null
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const idle = this.time - this.lastTouch > STUCK_S
    const hinted = idle && this.hintNow?.id === id
    const f = this.farm
    if (id === 'family:lung') {
      if (this.phase !== 'farm') return null
      const r = this.lung.rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.2, prio: 1, max: 120 }
    }
    if (id.startsWith('family:')) {
      const e = id.slice(7)
      if (e === 'ji' && this.phase !== 'deck') return null
      if (e === 'kaylee' && this.phase !== 'deck') return null
      const c = e === 'kaylee' ? this.kaylee : e === 'ji' ? this.ji : this.nick
      const r = c.rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: e === 'ji' ? 2 : 0, max: 120, glow: e === 'ji' && (hinted || (this.sips + this.eaten > 0 && !this.photos && this.snapAt < 0)) }
    }
    if (this.phase === 'deck') {
      switch (id) {
        case 'glass':
          return { at: this.deck.glass.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), r: 0.1, prio: 3, max: 110, glow: hinted }
        case 'kratip':
          return { at: this.deck.kratip.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.1, 0)), r: 0.1, prio: 3, max: 110, glow: hinted }
        case 'cup':
          return { at: this.deck.cup.getWorldPosition(new Vector3()).add(new Vector3(0, 0.05, 0)), r: 0.08, prio: 3, max: 100 }
        case 'chime':
          return { at: this.deckAt(-1.5, 2.5, -1.2), r: 0.15, prio: 1, max: 100 }
        case 'view':
          return { at: new Vector3(0, 0.6, 0.5), r: 1.5, prio: 0, max: 160 }
      }
      return null
    }
    if (this.phase === 'thresh') {
      const left = this.threshed < THRESHED
      if (id === 'basket') return { at: new Vector3(BASKET[0], 0.45, BASKET[2]), r: 0.55, prio: 3, max: 220, glow: left && this.holding && hinted }
      if (id === 'rack') return { at: new Vector3(RACK.x, RACK.y - 0.2, RACK.z), r: 0.8, prio: 2, max: 200, glow: left && !this.holding && (hinted || this.banged === 0) }
      return null
    }
    if (id.startsWith('gate:')) {
      const s = this.paddies[Number(id.slice(5))]
      const dry = this.round === 'plant' && !s.open && s.planted > 0
      return { at: new Vector3(...s.p.gate).add(new Vector3(0, 0.22 + s.gateK * 0.26, 0)), r: 0.3, prio: 3, max: 100, glow: hinted || dry }
    }
    if (id.startsWith('duck:')) return { at: f.ducks[Number(id.slice(5))].position.clone().add(new Vector3(0, 0.15, 0)), r: 0.2, prio: 3, max: 90 }
    switch (id) {
      case 'scarecrow':
        return { at: f.scarecrow.root.position.clone().add(new Vector3(0, 1.3, 0)), r: 0.4, prio: 2, max: 110 }
      case 'buffalo':
        return { at: f.buffalo.root.position.clone().add(new Vector3(0, 0.9, 0)), r: 0.7, prio: 1, max: 140 }
      case 'frog':
        return { at: f.frog.root.position.clone().add(new Vector3(0, 0.12, 0)), r: 0.16, prio: 3, max: 90 }
      case 'nursery':
        return { at: new Vector3(NURSERY.x, 0.25, NURSERY.z), r: 0.55, prio: 1, max: 130 }
      case 'straw':
        return { at: new Vector3(STRAW_PILE[0], 0.35, STRAW_PILE[2]), r: 0.5, prio: 1, max: 120 }
      case 'hut':
        return { at: f.hut.root.position.clone().add(new Vector3(0, 1.4, 0)), r: 0.8, prio: 0, max: 140 }
      case 'banana':
        return { at: f.banana.position.clone().add(new Vector3(0, 1.3, 0)), r: 0.6, prio: 0, max: 120 }
      case 'bamboo':
        return { at: f.bamboo.position.clone().add(new Vector3(0, 2.2, 0)), r: 0.6, prio: 0, max: 120 }
      case 'cafe':
        return { at: new Vector3(...f.cafeAt), r: 1.4, prio: 0, max: 130 }
    }
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const k = this.kaylee.root.getWorldPosition(new Vector3())
    return {
      game: 'rice',
      phase: this.phase,
      round: this.round,
      planted: this.paddies.map((s) => s.planted),
      flooded: this.paddies.map((s) => Math.round(s.lvl * 100) / 100),
      growth: Math.round(this.growth * 100) / 100,
      birds: { flying: this.birds.active, pecking: this.birds.pecking, fat: this.birds.fats, shooed: this.shoos, at: this.birds.peckingAt().map(pt) },
      cut: this.paddies.map((s) => s.cut),
      bundles: this.tied,
      racked: this.racked,
      banged: this.banged,
      threshed: this.threshed,
      holding: this.holding,
      heaped: this.kratipK >= 0,
      eaten: this.eaten,
      tall: this.paddies.findIndex((s) => s.tall > 1),
      kaylee: { at: [Math.round(k.x * 100) / 100, Math.round(k.z * 100) / 100], screen: pt(k), ground: this.ground, muddy: this.muddy > 0 },
      // Screen rectangles of each paddy's water (x0, y0, x1, y1), so a robot can drag zigzags across them.
      paddies: PADDIES.map((p) => {
        const c = [[p.x0, p.z0], [p.x1, p.z0], [p.x1, p.z1], [p.x0, p.z1]].map(([x, z]) => this.screen(new Vector3(x, p.top - WATER_DOWN, z)))
        if (c.some((s) => !s)) return null
        const xs = c.map((s) => s!.x)
        const ys = c.map((s) => s!.y)
        return [Math.round(Math.min(...xs)), Math.round(Math.min(...ys)), Math.round(Math.max(...xs)), Math.round(Math.max(...ys))]
      }),
      gates: PADDIES.map((p) => pt(new Vector3(...p.gate).add(new Vector3(0, 0.2, 0)))),
      sips: this.sips,
      photos: this.photos,
      people: [this.kaylee, this.nick, this.ji].map((c) => [c.pose, pt(c.rig.head.getWorldPosition(new Vector3()))]),
      touches: this.touches,
      points: {
        nick: pt(this.nick.rig.head.getWorldPosition(new Vector3())),
        basket: pt(new Vector3(BASKET[0], 0.45, BASKET[2])),
        rack: pt(new Vector3(RACK.x, RACK.y, RACK.z)),
        glass: this.phase === 'deck' ? pt(this.deck.glass.root.getWorldPosition(new Vector3())) : null,
        kratip: this.phase === 'deck' ? pt(this.deck.kratip.root.getWorldPosition(new Vector3())) : null,
        mommy: this.phase === 'deck' ? pt(this.ji.rig.head.localToWorld(new Vector3(0, this.ji.rig.face.headY, 0))) : null,
      },
    }
  }

  dispose() {
    for (const x of [this.blades, this.heads, this.stubble]) x.dispose()
    super.dispose()
  }
}

