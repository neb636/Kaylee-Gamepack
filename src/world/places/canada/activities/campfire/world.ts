// Campfire Night, in 3D: Flashlight Statues (planning/around-the-world/canada-round-2.md, part 2). Somebody is taking
// Maple's marshmallows in the dark. Her finger is the flashlight: where it goes, the light goes, and whatever it lands
// on does its bit at once. Everything in the dark is a dark shape with two shining eyes (shade.ts).
//
// The toy (core verb): shine the light. It grows three times, the same verb each time:
//   eyes      who's out there? The owl's head goes all the way round, the porcupine puffs into a ball, the deer freezes
//             with a mouthful of leaves, the frog's throat balloons, the bat yawns upside down, Monty squints ("Whoa!
//             Too bright!") and puts on sunglasses, Maple makes shadow bunnies. Any order, no count. After three or
//             four of them, giggling starts in the dark.
//   peek      peek-a-boo: Roxy's three kits peek out from behind the tent, the old snag and the fallen log, and duck
//             when the light comes their way. Caught in the beam, a kit freezes in a pose, then tumbles out giggling
//             and runs to the fire. Each peek lasts longer than the one before; stuck for 8 s, a kit's tail sticks out
//             and wiggles.
//   statues   Roxy sneaks toward the marshmallow bag whenever the light is off her, and freezes whenever it's on her,
//             in a new ridiculous pose each time, with its props (characters/statues.ts: leafy twigs held up for the
//             tree, a boulder on her back for the rock, music notes for the whistle, a tutu for the stretch). The first
//             time, the camera goes close on her silly face and her whole pose (`statueShot`). Hold the light on her and she wobbles, then falls over laughing;
//             three of those and she gives up. Left alone she reaches the bag ("Yoink!") and scampers back to try
//             again, a little slower each time.
// The side verb is the roast (roast.ts, orders.ts): the flashlight is put away and the camera comes down close to the
// fire. Everyone round it wants a marshmallow and shows which kind in a wish bubble (squishy, golden, burnt, Monty's
// giant one); she toasts it until it's that kind (their bubble glows) and hands it over: a gold star. The wrong kind
// they eat anyway, and their bubble stays (easier each time). And the end: the flashlight comes back; tap it to turn
// it off; the stars come out, then the northern lights (sky.ts).
//
// The clearing is the films' campsite (story/sets/campfire.ts) with the game's own things round it (clearing.ts). The
// feel is knobs (?feel=1): the light's size and swing, Roxy's speed, how long the kits peek. QA: `?statue=tree` stands
// Roxy in a pose under the close-up's camera; `?look=owl&yaw=90` looks close at one thing from any side, all lit.
import { Color, Euler, Fog, Group, Mesh, MeshBasicMaterial, Plane, Quaternion, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { say, sounds, spendHint, stopSpeaking, Timers, type Line } from '../../../../../sdk'
import { clamp, damp, lerp, wrapAngle } from '../../../../../sdk/math'
import { IS_MOUSE } from '../../../../../sdk/device'
import { knobs, watch } from '../../../../kit/knobs'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { flag } from '../../../../engine3d/flags'
import type { FilmActor } from '../../../../engine3d/characters/actor'
import { Letterbox, type CineFrame } from '../../../../engine3d/cinema'
import { Bag } from '../../../../engine3d/dispose'
import { FilmPlayer, lineSeconds, type FilmShot, type FilmState } from '../../../../engine3d/film'
import { blobShadow, merge, P } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import type { AnimalId } from '../../book/animals'
import { meet } from '../../book/met'
import { sillyFilm } from '../../characters/closeup'
import { Bat, Deer, Owl, Peeper, Porcupine } from '../../characters/critters'
import { nextStatue, releaseStatue, STATUES, statueOf, statueWobble, strikeStatue, type StatueId } from '../../characters/statues'
import { L } from '../../lines'
import { Cast, type Friend } from '../../story/cast'
import { buildCamp, CAMP, updateCamp, type CampSet } from '../../story/sets/campfire'
import { buildClearing, CLEARING, FALLEN, kitTail } from './clearing'
import { Flashlight } from './light'
import { OrderBubble } from './orders'
import { Stick, type Want } from './roast'
import { NightShade, RIM_FIRE, RIM_MOON } from './shade'
import { NightSky } from './sky'
import { camp } from './sounds'
import type { CampSection } from './sections'

const FILE = 'src/world/places/canada/activities/campfire/world.ts'
const T = L.campfire

/** Her flashlight, and the games played with it. */
const TORCH = knobs('torch', 'The flashlight', FILE, {
  radius: { value: 0.6, min: 0.3, max: 2, step: 0.05, label: 'Light size', unit: 'm', note: 'the disc of light’s radius in the middle of the clearing (smaller far off, bigger near)', main: true },
  follow: { value: 16, min: 2, max: 60, step: 1, label: 'Follows her finger', unit: '/s', note: 'how tightly the light keeps up (lower = it swings behind like a heavy flashlight)', main: true },
  lift: { value: 34, min: 0, max: 120, step: 2, label: 'Light above finger', unit: 'px', note: 'on a touch screen, how far above her fingertip the light lands, so her finger doesn’t cover what she finds (a mouse: none)', main: true },
  speed: { value: 0.45, min: 0.15, max: 1.5, step: 0.05, label: 'Roxy sneaks', unit: 'm/s', note: 'how fast Roxy creeps toward the bag while the light is off her', main: true },
  slow: { value: 0.78, min: 0.4, max: 1, step: 0.02, label: 'Roxy slows after a grab', note: 'her speed is multiplied by this every time she gets a marshmallow (1 = never slows)' },
  fall: { value: 2.6, min: 0.6, max: 6, step: 0.1, label: 'Hold to topple', unit: 's', note: 'how long the light holds Roxy before she wobbles over laughing', main: true },
  peek: { value: 1.8, min: 0.6, max: 6, step: 0.1, label: 'A kit peeks for', unit: 's', note: 'how long the first kit stays out before ducking', main: true },
  grow: { value: 0.8, min: 0, max: 3, step: 0.1, label: 'Each peek longer by', unit: 's' },
  react: { value: 0.55, min: 0.1, max: 2, step: 0.05, label: 'Kit ducks after', unit: 's', note: 'how long the light can hover beside a peeking kit before it ducks (a little longer each time)' },
}, { sections: ['eyes', 'peek', 'statues'] })
/** The roast. */
const ROAST = knobs('campRoast', 'Roast a marshmallow', FILE, {
  heat: { value: 0.6, min: 0.2, max: 2, step: 0.05, label: 'Heat reaches', unit: 'm', note: 'how far to the side of the flames (or above them) it still toasts', main: true },
  golden: { value: 3.2, min: 0.5, max: 12, step: 0.25, label: 'Golden in', unit: 's', note: 'held right over the flames', main: true },
  burn: { value: 2.5, min: 0.5, max: 10, step: 0.25, label: 'Catches fire after golden', unit: 's', main: true },
  out: { value: 4, min: 1, max: 12, step: 0.5, label: 'Goes out by itself', unit: 's' },
  grab: { value: 90, min: 40, max: 200, step: 5, label: 'Grab reach', unit: 'px', note: 'how near the marshmallow her finger has to land to pick the stick up', main: true },
  squishy: { value: 0.2, min: 0, max: 0.7, step: 0.05, label: 'Squishy after', note: 'how warm a squishy one has to be (of the way to golden); it stops being squishy at 0.8' },
  giant: { value: 1.5, min: 1, max: 3, step: 0.1, label: 'Giant one slower', unit: '×', note: 'Monty’s giant marshmallow toasts this many times slower' },
  give: { value: 0.45, min: 0.2, max: 1, step: 0.05, label: 'Hand-over reach', note: 'how near somebody the marshmallow has to be to give it (of their height, round their whole body)', main: true },
}, { sections: ['roast'] })

export interface CampStart {
  section: CampSection
  /** Peek: kits already at the fire. Statues: times Roxy has fallen over laughing. Roast: which round of orders. */
  kits: number
  laughs: number
  order: number
  /** Maple says goodnight at the end (not when the film out follows). */
  goodnight: boolean
}
export interface CampEvents {
  /** A new part begins (the address bar follows, with its state). */
  section(s: CampSection, state: Record<string, string>): void
  /** What the line at the bottom shows (Sparkle's last instruction or hint). */
  line(l: Line): void
  /** How far through the five parts she is. */
  progress(done: number): void
  /** The silly close-up: its words and its state, for the film overlay. */
  filmLine(l: Line | null): void
  film(s: FilmState | null): void
  /** The roast's stars: orders given right so far, of how many (null: not in the roast). */
  stars(s: { done: number; of: number } | null): void
  /** The northern lights have danced: the stamp. */
  done(): void
}

export const CAMP_PARTS = 5
const ORDER: CampSection[] = ['story', 'eyes', 'peek', 'statues', 'roast', 'sky']

export const CAMP_ANCHORS: AnchorInfo[] = [
  { id: 'flashlight', label: 'The flashlight', kind: 'thing' },
  { id: 'stick', label: 'The marshmallow on a stick', kind: 'thing' },
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'monty', label: 'Monty the moose', kind: 'thing' },
  { id: 'roxy', label: 'Roxy the raccoon', kind: 'thing' },
  { id: 'kit0', label: 'A little raccoon', kind: 'thing' },
  { id: 'kit1', label: 'A little raccoon', kind: 'thing' },
  { id: 'kit2', label: 'A little raccoon', kind: 'thing' },
  { id: 'owl', label: 'The owl', kind: 'thing' },
  { id: 'bat', label: 'The bat', kind: 'thing' },
  { id: 'deer', label: 'The deer', kind: 'thing' },
  { id: 'porcupine', label: 'The porcupine', kind: 'thing' },
  { id: 'frog', label: 'The frog', kind: 'thing' },
  { id: 'fire', label: 'The campfire', kind: 'thing' },
  { id: 'tent', label: 'The tent', kind: 'thing' },
]

/** Sparkle's hint after this long with nothing new. */
const HINT_S = 8
/** Friends don't talk again sooner than this (s). */
const FRIEND_GAP = 3.2
/** Statue lines: one per catch, but not sooner than this. */
const STATUE_GAP = 2.6
/** Met this many night animals: the giggling starts. */
const GIGGLE_AFTER = 4
/** At least this long with the night animals before the giggles start (s). */
const EYES_MIN_S = 22
const KITS = 3
const LAUGHS = 3
/** The roast's rounds of orders, easiest first: who wants which kind. (Two at once in the fourth: she picks who
 *  gets which.) Monty's giant one is last. */
const ORDERS: { who: string; want: Want }[][] = [
  [{ who: 'maple', want: 'golden' }],
  [{ who: 'kit1', want: 'squishy' }],
  [{ who: 'roxy', want: 'burnt' }],
  [
    { who: 'kit0', want: 'golden' },
    { who: 'kit2', want: 'burnt' },
  ],
  [{ who: 'monty', want: 'giant' }],
]
/** In the roast, everybody round the fire where the close camera sees them all ([x, z, facing degrees]): Maple stays
 *  on her log (left), Roxy beside the fire, Monty at the back, a kit in front of the log and two on the right. */
const ROAST_SEATS: Record<string, [number, number, number]> = {
  roxy: [0.72, -0.62, -15],
  monty: [0.45, -2.5, -5],
  kit0: [-0.42, 0.85, 22],
  kit1: [1.5, 0.3, -45],
  kit2: [1.45, -0.95, -30],
}
/** The kits a little bigger than in the films: they peek out from far across the clearing. */
const KIT_SCALE = 1.5
/** Her statue lines, by pose. */
const STATUE_LINE: Record<StatueId, Line> = { tree: T.statues[0], rock: T.statues[1], whistling: T.statues[2], ballerina: T.statues[3], flamingo: T.statues[3] }
/** Roxy's poses: the four she has lines for (the kits do the flamingo too). */
const ROXY_POSES: StatueId[] = ['tree', 'rock', 'whistling', 'ballerina']
/** Which way a statue faces (radians): to us, a little to our right, where the close-up's camera stands. */
const STATUE_YAW = 0.28

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()

/** Something the light can land on. */
interface Spot {
  id: string
  /** Its middle (world), and how big it is round that (m). */
  at: (out: Vector3) => Vector3
  r: number
  shade: NightShade | null
  /** It's lit now, since when (s), and when it last did its bit. */
  lit: boolean
  litT: number
  cool: number
  /** It comes to color at least this much without the light (by the fire). */
  floor: number
  /** Can it be lit at all just now (a hidden kit can't). */
  live: () => boolean
  /** The light landed on it. */
  on?: () => void
  /** The light has stayed on it (every frame, with seconds). */
  hold?: (s: number) => void
  off?: () => void
}

type RoxyState = 'away' | 'sneak' | 'statue' | 'fall' | 'home' | 'yoink' | 'sorry' | 'fire'
type KitState = 'hidden' | 'out' | 'ducking' | 'caught' | 'running' | 'fire'

interface Kit {
  a: Friend
  hide: (typeof CLEARING.hides)[number]
  state: KitState
  /** 0 hidden .. 1 peeking out. */
  out: number
  t: number
  /** How long the light has hovered beside it (it ducks). */
  near: number
  seat: number
}

export class FlashlightStatues implements World3D {
  /** Its delayed callbacks: cancelled when it's disposed. */
  readonly timers = new Timers()
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private set: CampSet
  private cast: Cast
  private sky: NightSky
  private light: Flashlight
  private films: FilmPlayer
  private bars = new Letterbox()
  private sparks: Particles
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 0, 1), 0)
  private unwatch: () => void
  private stopBed: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: CampSection
  private sectionT = 0
  private dead = false
  private parts = 0

  // ---- Everybody.
  private maple: Friend
  private monty: Friend
  private roxy: Friend
  private kits: Kit[] = []
  private owl = new Owl(this.bag)
  private bat = new Bat(this.bag)
  private deer = new Deer(this.bag)
  private porky = new Porcupine(this.bag)
  private frog = new Peeper(this.bag)
  private spots: Spot[] = []
  private spotOf = new Map<string, Spot>()
  private shades: NightShade[] = []
  private met = new Set<string>()
  private tail: Group
  private bunny: Mesh
  private bunnyT = -1
  private shades3d: Group | null = null
  private montyT = -1
  private montyCool = false
  private denEyes: Group

  // ---- Her finger.
  private finger: { x: number; y: number } | null = null
  private lastTouch = 0
  private lastNew = 0

  // ---- Peek-a-boo.
  private kitsHome = 0
  private peekN = 0
  private peekAt = -1
  private peekKit: Kit | null = null
  private lastPeek: Kit | null = null
  private stuck: Kit | null = null
  private lastCatch = 0

  // ---- Statues.
  private roxyState: RoxyState = 'away'
  private roxyT = 0
  private roxyS = 0
  private roxyHold = 0
  private roxySpeed = 1
  private roxyPose: StatueId | null = null
  private roxyUnlit = 0
  private roxyAfter: 'sneak' | 'home' = 'sneak'
  private laughs = 0
  private yoinks = 0
  private closeup = false
  private carry: Group
  private wobbleCool = 0

  // ---- The roast.
  private stick: Stick
  private held = false
  private stickTip = new Vector3()
  private stickBack = 1
  private roasted = 0
  private step = 0
  private orders: { who: string; want: Want; bubble: OrderBubble; done: boolean; miss: number; step: number }[] = []
  private readyWas = false
  private toastedSaid = false
  private eaten: string | null = null
  private sizzleAt = 0

  // ---- The end.
  private skyT = -1
  private goodnight: boolean

  // ---- Talk.
  private busyUntil = 0
  private friendAt = -10
  private statueAt = -10
  private hintAt = -100
  private hintsSaid = 0
  private fireSaidAt = -100

  private counts = { holds: 0, taps: 0, moves: 0, shone: 0, caughtKits: 0, statues: 0, yoinks: 0, laughs: 0, roasted: 0, blownOut: 0, fireLine: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: CampStart,
    private events: CampEvents,
  ) {
    const { scene, bag } = this
    applyBands()
    scene.background = new Color('#141238')
    scene.fog = new Fog('#1B1946', 11, 42)
    this.rig.fov = 34
    this.rig.lag = 0.6
    this.rig.camera.near = 0.05
    this.rig.camera.far = 900
    this.section = start.section
    this.goodnight = start.goodnight

    // ---- The clearing: the films' campsite, the game's own things round it, the sky.
    const root = new Group()
    scene.add(root)
    this.set = buildCamp(bag, root, { nearTrees: false })
    buildClearing(bag, root)
    this.sky = new NightSky(bag, scene)
    this.sparks = new Particles({ kind: 'spray', count: 160, colors: ['#FFD86B', '#FF9A3C', '#FFFFFF', '#FF8FB8', '#B9A2F0'], gravity: 1.5 }, bag)
    scene.add(this.sparks.mesh)
    this.stopBed = camp.fireBed(0.3)

    // ---- Maple on her log by the bag; Monty at the back; Roxy in her den; the kits hidden.
    this.cast = new Cast(bag, scene)
    this.maple = this.cast.maple
    this.monty = this.cast.monty
    this.roxy = this.cast.roxy
    this.maple.place(CAMP.maple[0], CAMP.maple[1], CAMP.maple[2], 22)
    this.monty.place(CLEARING.monty[0], 0, CLEARING.monty[1], CLEARING.monty[2])
    this.roxy.hide()
    // (The kits a little bigger than in the films: they peek out from far across the clearing.)
    this.cast.kits.forEach((a, i) => {
      a.root.scale.setScalar(KIT_SCALE)
      this.kits.push({ a, hide: CLEARING.hides[i], state: 'hidden', out: 0, t: 0, near: 0, seat: i })
    })
    // (Maple stands on her log: no shadow on the ground under her.)
    for (const o of [this.monty, this.roxy, ...this.cast.kits]) shadowUnder(o, bag)

    // ---- The animals in the dark, each where it lives.
    this.owl.root.position.set(...CLEARING.owl)
    this.owl.root.rotation.y = 0.35
    this.owl.root.scale.setScalar(1.5)
    this.bat.root.position.set(...CLEARING.bat)
    this.bat.root.rotation.y = -0.3
    this.bat.root.scale.setScalar(2.1)
    const [dx, dz, df] = CLEARING.deer
    this.deer.root.position.set(dx, 0, dz)
    this.deer.root.rotation.y = (df * Math.PI) / 180
    this.deer.root.scale.setScalar(1.12)
    this.porky.root.position.set(...CLEARING.porcupine)
    this.porky.root.rotation.y = -0.5
    this.porky.root.scale.setScalar(0.95)
    this.frog.root.position.set(...CLEARING.frog)
    this.frog.root.rotation.y = 0.4
    this.frog.root.scale.setScalar(1.45)
    scene.add(this.owl.root, this.bat.root, this.deer.root, this.porky.root, this.frog.root, blobShadow(0.9, bag).translateX(dx).translateZ(dz))

    // Maple's shadow bunny on the bush behind her (her paws in the light), a stuck kit's tail, Roxy's eyes in her den,
    // the marshmallow she carries off.
    this.bunny = shadowBunny(bag)
    this.bunny.position.set(-0.36, 0.46, -0.5)
    this.bunny.scale.setScalar(1.25)
    scene.add(this.bunny)
    this.tail = kitTail(bag)
    // (Big enough to spot from across the clearing: it's the help.)
    this.tail.scale.setScalar(1.7)
    scene.add(this.tail)
    this.denEyes = denEyes(bag)
    this.denEyes.position.set(...CLEARING.denEyes)
    scene.add(this.denEyes)
    this.carry = new Group()
    this.carry.add(new Mesh(bag.add(P.cyl(0.045, 0.045, 0.07, '#FFF7F0', {}, 12)), bag.add(new MeshBasicMaterial({ color: '#FFF7F0' }))))
    this.carry.visible = false
    this.roxy.rig.armR.add(this.carry)
    this.carry.position.set(0.05 * this.roxy.height, -0.17 * this.roxy.height, 0.04 * this.roxy.height)

    // ---- The stick, her flashlight.
    this.stick = new Stick(bag)
    scene.add(this.stick.root)
    this.stick.fresh()
    this.stick.visible = false
    this.light = new Flashlight(scene, bag, TORCH)

    // ---- Who the light can land on (their dark shapes and shining eyes).
    this.makeSpots()

    this.films = new FilmPlayer({ line: (l) => this.events.filmLine(l), state: (st) => this.events.film(st) })

    // ---- Where the link starts.
    const at = ORDER.indexOf(start.section)
    if (at >= ORDER.indexOf('peek')) for (const id of ['owl', 'porcupine', 'deer', 'frog']) this.met.add(id)
    this.kitsHome = start.section === 'peek' ? start.kits : at > ORDER.indexOf('peek') ? KITS : 0
    this.kits.forEach((k, i) => {
      if (i < this.kitsHome) this.seatKit(k, true)
      else this.placeKit(k)
    })
    if (at > ORDER.indexOf('statues')) this.roxyGaveUp(true)
    if (start.section === 'statues') this.laughs = start.laughs
    if (start.section === 'roast') this.step = clamp(Math.round(start.order), 0, ORDERS.length - 1)
    ORDERS.forEach((round, i) =>
      round.forEach((o) => {
        const bubble = new OrderBubble(bag, o.want)
        scene.add(bubble.root)
        this.orders.push({ ...o, bubble, done: i < this.step, miss: 0, step: i })
      }),
    )
    if (at >= ORDER.indexOf('roast')) {
      this.monty.place(CLEARING.montyFire[0], 0, CLEARING.montyFire[1], CLEARING.montyFire[2])
      this.wearShades(true)
    }
    this.parts = Math.max(0, at - 1)
    this.events.progress(this.parts)
    // (QA: ?statue=tree stands Roxy in that pose in the middle of the clearing, the light on her, to look at it.)
    const pose = flag('statue') as StatueId | null
    if (pose && STATUES.includes(pose)) {
      this.roxy.place(0.35, 0, -1.0, (STATUE_YAW * 180) / Math.PI)
      this.roxyPose = pose
      this.timers.later(() => {
        this.strike(this.roxy, pose)
        this.spotOf.get('roxy')!.floor = 1
      }, 600)
      this.roxyState = 'fire'
      this.closeup = true
    }
    if (start.section === 'story') this.timers.later(() => this.storyHello(), 500)
    else this.timers.later(() => this.go(start.section), 350)
    this.lastTouch = this.lastNew = 0

    this.unwatch = watch('torch', () => ({
      'light: how fast it moves (px/s)': [Math.min(3000, this.lightSpeed), 3000],
      'something lit': [this.spots.some((s) => s.lit) ? 1 : 0, 1.2],
      'Roxy sneaking': [this.roxyState === 'sneak' ? 1 : 0, 1.2],
      'Roxy held (s)': [this.roxyHold, Math.max(1, TORCH.fall)],
    }))
  }
  private lightSpeed = 0
  /** 0..1: the roast's warmer, brighter fireside light (the flashlight put away). */
  private roastLit = 0
  private aimed = false
  private lastAt = { x: 0, y: 0 }

  // ---------------------------------------------------------------- who the light lands on

  private makeSpots() {
    const bag = this.bag
    const shadeRig = (a: FilmActor, glow: string) => new NightShade(a.root, bag, { rig: a.rig }, { glow })
    const add = (s: Omit<Spot, 'lit' | 'litT' | 'cool' | 'floor'> & { floor?: number }) => {
      const spot: Spot = { lit: false, litT: 0, cool: 0, floor: 0, ...s }
      this.spots.push(spot)
      this.spotOf.set(spot.id, spot)
      if (spot.shade) this.shades.push(spot.shade)
      return spot
    }
    const mid = (o: Object3D, y: number) => (out: Vector3) => o.localToWorld(out.set(0, y, 0))
    // The night animals.
    add({ id: 'owl', at: mid(this.owl.root, 0.3), r: 0.45, shade: new NightShade(this.owl.root, bag, this.owl.shine, { glow: '#FFC24A', blink: () => this.owl.blink }), live: () => true, on: () => this.critter('owl', 'barred-owl', () => this.owl.spin(), () => camp.hoot(0, 0.2), T.owl) })
    add({ id: 'bat', at: mid(this.bat.root, -0.22), r: 0.45, shade: new NightShade(this.bat.root, bag, this.bat.shine, { glow: '#FF9FC0', blink: () => this.bat.blink }), live: () => true, on: () => this.critter('bat', 'bat', () => this.bat.yawn(), () => camp.squeak()) })
    add({ id: 'deer', at: mid(this.deer.root, 1.0), r: 0.7, shade: new NightShade(this.deer.root, bag, this.deer.shine, { glow: '#D9F7B0' }), live: () => true, on: () => this.critter('deer', 'deer', () => this.deer.freeze(), () => camp.leaves()) })
    add({ id: 'porcupine', at: mid(this.porky.root, 0.3), r: 0.4, shade: new NightShade(this.porky.root, bag, this.porky.shine, { glow: '#FFD27A' }), live: () => true, on: () => this.critter('porcupine', 'porcupine', () => this.porky.poke(), () => camp.quills(), T.porcupine) })
    add({ id: 'frog', at: mid(this.frog.root, 0.15), r: 0.3, shade: new NightShade(this.frog.root, bag, this.frog.shine, { glow: '#FFE27A' }), live: () => true, on: () => this.critter('frog', 'peeper', () => this.frog.balloon(), () => camp.peep()) })
    // Monty: too bright! Then his sunglasses.
    add({ id: 'monty', at: (o) => this.monty.at(0.6, o), r: 0.8, shade: shadeRig(this.monty, '#C8F0A0'), live: () => true, on: () => this.montyLit() })
    // Maple by the fire (the fire lights her a little): shadow bunnies.
    add({ id: 'maple', at: (o) => this.maple.at(0.55, o), r: 0.4, floor: 0.82, shade: shadeRig(this.maple, '#FFE9A0'), live: () => true, on: () => this.mapleLit() })
    // Roxy, and her kits.
    add({ id: 'roxy', at: (o) => this.roxy.at(0.5, o), r: 0.38, shade: shadeRig(this.roxy, '#E8F06A'), live: () => this.roxy.root.visible, on: () => this.roxyLit() })
    this.kits.forEach((k, i) =>
      add({
        id: `kit${i}`,
        at: (o) => k.a.at(0.62, o),
        r: 0.26,
        shade: shadeRig(k.a, '#E8F06A'),
        live: () => k.state === 'out' || k.state === 'fire' || k.state === 'running' || k.state === 'caught',
        on: () => this.kitLit(k),
      }),
    )
    // The stuck kit's tail (it catches the kit).
    add({ id: 'tail', at: (o) => this.tail.localToWorld(o.set(0.22, 0, 0)), r: 0.45, shade: null, live: () => this.tail.visible, on: () => this.stuck && this.catchKit(this.stuck) })
    // Things that aren't animals.
    add({ id: 'fire', at: (o) => o.set(CAMP.fire[0], 0.4, CAMP.fire[2]), r: 0.4, shade: null, live: () => true, hold: (s) => this.fireHeldFor(s) })
    add({ id: 'tent', at: (o) => o.set(CAMP.tent[0], 0.6, CAMP.tent[2]), r: 0.7, shade: null, live: () => true, on: () => this.tentLit() })
    add({ id: 'bush', at: (o) => o.set(CAMP.bush[0], 0.5, CAMP.bush[2]), r: 0.6, shade: null, live: () => true, on: () => camp.rustle(0) })
    add({ id: 'den', at: (o) => this.denEyes.getWorldPosition(o), r: 0.35, shade: null, live: () => this.denEyes.visible, on: () => this.denLit() })
  }

  /** A night animal does its bit (and the first time, Maple's book names it and maybe someone says something). */
  private critter(id: string, book: AnimalId, act: () => void, sound: () => void, line?: Line) {
    act()
    sound()
    if (this.section === 'story') this.enter('eyes')
    const first = !this.met.has(id)
    if (first) {
      this.met.add(id)
      this.lastNew = this.time
      meet(book)
      this.metOne()
    }
    if (line && first) this.friend(line)
  }
  private metOne() {
    // (Not before she's had a little while to play with the light: the giggles come after the fourth, or a bit later.)
    if (this.section === 'eyes' && this.met.size >= GIGGLE_AFTER && this.giggleAt < 0) this.giggleAt = Math.max(this.time + 2.2, this.time - this.sectionT + EYES_MIN_S)
  }
  private giggleAt = -1

  private montyLit() {
    this.monty.lean = -0.08
    if (this.shades3d?.visible) {
      // (Cool as anything in his sunglasses: a slow nod.)
      this.monty.nod()
      this.monty.pull('happy')
      return
    }
    if (this.section === 'story') this.enter('eyes')
    this.montyT = 0
    const first = !this.met.has('monty')
    if (first) {
      this.met.add('monty')
      this.lastNew = this.time
      meet('moose')
      this.metOne()
    }
    this.friend(T.mooseBright, true)
  }
  private wearShades(on: boolean) {
    if (!this.shades3d) {
      this.shades3d = sunglasses(this.monty, this.bag)
      this.spotOf.get('monty')?.shade?.refresh()
    }
    this.shades3d.visible = on
    // (No shining eyes through his sunglasses.)
    const sh = this.spotOf.get('monty')?.shade
    if (sh) sh.eyesOff = on
  }

  private mapleLit() {
    if (this.section === 'story') this.enter('eyes')
    this.bunnyT = 0
    this.maple.armsUp = 0.62
    camp.giggle()
    const first = !this.met.has('maple')
    if (first) {
      this.met.add('maple')
      this.lastNew = this.time
      this.metOne()
      this.friend(T.mapleHi)
    }
  }

  private tentLit() {
    camp.zip(0)
    this.set.tent.scale.set(1.03, 0.97, 1.03)
    this.timers.later(() => this.set.tent.scale.set(1, 1, 1), 160)
  }
  private denLit() {
    camp.chitter(0)
    camp.rustle(0)
    this.denEyes.visible = false
    this.timers.later(() => (this.denEyes.visible = this.section === 'eyes' || this.section === 'peek' || this.section === 'story'), 4500)
  }
  private fireHeldFor(s: number) {
    // Held on the fire a while: nothing happens. "It's already bright!"
    if (s > 1.8 && this.time - this.fireSaidAt > 25 && !this.held) {
      this.fireSaidAt = this.time
      this.set.flare = 0.6
      camp.sparks(0.1)
      this.counts.fireLine++
      this.friend(T.fireBright, true)
    }
  }

  // ---------------------------------------------------------------- the story and the parts

  private storyHello() {
    if (this.section !== 'story' || this.dead) return
    this.maple.pull('wow')
    void this.talk(T.story).then(() => this.section === 'story' && this.enter('eyes'))
  }

  private enter(s: CampSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.sectionT = 0
    this.hintsSaid = 0
    this.lastNew = this.time
    this.events.section(s, this.state(s))
    this.go(s)
  }
  private state(s: CampSection): Record<string, string> {
    if (s === 'peek') return { kits: String(Math.min(2, this.kitsHome)) }
    if (s === 'statues') return { laughs: String(Math.min(2, this.laughs)) }
    if (s === 'roast') return { order: String(Math.min(ORDERS.length - 1, this.step)) }
    return {}
  }
  private progress(n: number) {
    if (n <= this.parts) return
    this.parts = n
    this.events.progress(n)
  }

  /** A part begins: Sparkle says what to do (one line), the clearing gets ready. */
  private go(s: CampSection) {
    if (this.dead) return
    if (s === 'eyes') {
      this.sparkle(T.eyes, false, true)
    } else if (s === 'peek') {
      this.progress(1)
      camp.giggle()
      this.sparkle(T.giggle)
      this.peekAt = this.time + 1.2
      this.lastCatch = this.time
    } else if (s === 'statues') {
      this.progress(2)
      this.denEyes.visible = false
      this.roxyOut()
      this.sparkle(T.sneak, true)
    } else if (s === 'roast') {
      this.progress(3)
      // The flashlight is put away: the fire lights everyone, and the camera comes down close (shot()).
      this.light.set(false)
      this.light.toy.visible = false
      this.toRoastSeats()
      this.stick.fresh(this.giantNext() ? 2 : 1)
      this.stick.visible = true
      this.stickBack = 1
      this.friend(T.roast, true)
      this.sparkle(T.marshmallow, true)
      this.timers.later(() => this.openStep(), 900)
    } else if (s === 'sky') {
      this.progress(4)
      this.stick.visible = false
      for (const o of this.orders) if (o.bubble.showing) o.bubble.starred()
      this.events.stars(null)
      this.light.toy.visible = true
      camp.click()
      this.light.set(true)
      this.sparkle(T.off, true)
    }
  }

  // ---------------------------------------------------------------- talk

  /** Says a line now (interrupting), or after whatever is being said (`after`). */
  private talk(line: Line, after = false) {
    if (this.dead) return Promise.resolve()
    const start = Math.max(this.time, after ? this.busyUntil : this.time)
    this.busyUntil = start + lineSeconds(line)
    return say(line, { interrupt: !after })
  }
  private get talking() {
    return this.time < this.busyUntil
  }
  /** Sparkle: shows on the line at the bottom, and says it. */
  private sparkle(line: Line, after = false, show = true) {
    if (show) this.events.line(line)
    void this.talk(line, after)
  }
  /** A friend's reaction: never on top of someone else, never too often. */
  private friend(line: Line, queue = false) {
    if (this.time - this.friendAt < FRIEND_GAP || (this.talking && !queue)) return false
    this.friendAt = this.time
    void this.talk(line, queue)
    return true
  }
  /** Stuck for a while: Sparkle helps (shown always, said only as spendHint allows). */
  private hint(line: Line) {
    if (this.time - this.hintAt < 14 || this.hintsSaid >= 3 || this.talking || this.films.on) return
    this.hintAt = this.time
    this.hintsSaid++
    this.events.line(line)
    if (spendHint(line)) void this.talk(line)
  }

  // ---------------------------------------------------------------- eyes

  private updateEyes() {
    if (this.giggleAt >= 0 && this.time > this.giggleAt) {
      this.giggleAt = -1
      this.enter('peek')
      return
    }
    // (A long while in the dark: on to the giggles anyway, so nothing can be missed.)
    if (this.sectionT > 45 && this.giggleAt < 0) this.giggleAt = this.time + 0.5
    if (this.time - this.lastNew > HINT_S && this.time - this.lastTouch > 2) this.hint(T.eyesHint)
  }

  // ---------------------------------------------------------------- peek-a-boo

  private placeKit(k: Kit) {
    const [x, y, z] = k.hide.hide
    k.a.place(x, y, z, k.hide.face)
    k.state = 'hidden'
    k.out = 0
  }
  private seatKit(k: Kit, snap = false) {
    const [x, z, f] = CAMP.ring.kits[k.seat]
    k.state = 'fire'
    if (snap) k.a.place(x, 0, z, f)
    else k.a.walkTo(x, z, Math.max(0.6, k.a.pos.distanceTo(tmp.set(x, 0, z)) / 1.5), f)
  }

  private updatePeek(dt: number) {
    // The next kit peeks out (one at a time, never the same twice running).
    if (!this.peekKit && !this.stuck && this.peekAt >= 0 && this.time > this.peekAt && this.kitsHome < KITS) {
      const free = this.kits.filter((k) => k.state === 'hidden')
      const from = free.length > 1 ? free.filter((k) => k !== this.lastPeek) : free
      // (Mostly from the hiding place furthest from the light: she swings the light across the clearing to find it.)
      const far = (h: Kit) => -Math.hypot(h.hide.peek[0] - this.light.target.x, h.hide.peek[2] - this.light.target.z)
      const sorted = [...from].sort((p, q) => far(p) - far(q))
      const k = sorted.length > 1 && Math.random() < 0.3 ? sorted[1] : sorted[0]
      if (k) {
        // Stuck a while (8 s since the last catch): this one's tail sticks out and wiggles instead, until she finds it.
        if (this.time - this.lastCatch > HINT_S - 1) {
          this.stuck = k
          const [tx, ty, tz] = k.hide.tail
          this.tail.position.set(tx, ty, tz)
          this.tail.rotation.set(0, k.hide.tailDir > 0 ? 0 : Math.PI, 0)
          this.tail.visible = true
          camp.giggle()
          this.hint(T.kitHint)
        } else {
          this.peekKit = k
          k.state = 'out'
          k.t = 0
          k.near = 0
          this.lastPeek = k
          camp.giggle()
        }
      }
    }
    for (const k of this.kits) {
      if (k.state === 'out' || k.state === 'ducking') {
        k.t += dt
        const stay = TORCH.peek + this.peekN * TORCH.grow
        if (k.state === 'out') {
          k.out = Math.min(1, k.out + dt / 0.28)
          // (Out into the light that was already there: caught all the same.)
          if (k.out > 0.5 && this.spotOf.get(`kit${k.seat}`)!.lit) {
            this.catchKit(k)
            continue
          }
          // The light hovering beside it (not on it): it ducks, after a moment (a little longer each time).
          const n = this.light.near(this.rig.camera, k.a.at(0.62, tmp))
          k.near = n < 1 ? k.near + dt : Math.max(0, k.near - dt)
          if (k.t > stay || k.near > TORCH.react + this.peekN * 0.2) {
            k.state = 'ducking'
            k.t = 0
            camp.giggle()
          }
        } else {
          k.out = Math.max(0, k.out - dt / 0.22)
          if (k.out <= 0) {
            k.state = 'hidden'
            this.peekN++
            if (this.peekKit === k) this.peekKit = null
            this.peekAt = this.time + 0.7 + Math.random() * 0.6
            // (Not caught for a while: the next peek is the wiggly tail.)
            if (this.time - this.lastCatch > HINT_S - 2) this.peekAt = this.time + 0.4
          }
        }
        this.poseKit(k)
      }
    }
    if (this.tail.visible && this.stuck && this.spotOf.get('tail')!.lit) this.catchKit(this.stuck)
    if (this.tail.visible) {
      // The tail wiggles (and so does the bush of it).
      this.tail.rotation.z = Math.sin(this.time * 9) * 0.35
      this.tail.rotation.x = Math.sin(this.time * 6) * 0.2
    }
    if (this.time - this.lastCatch > HINT_S + 9 && this.stuck) this.hint(T.kitHint)
  }
  /** Peeking: slides from behind its cover to where its head shows, leaning out. */
  private poseKit(k: Kit) {
    const e = k.out * k.out * (3 - 2 * k.out)
    const [hx, hy, hz] = k.hide.hide
    const [px, py, pz] = k.hide.peek
    k.a.pos.set(lerp(hx, px, e), lerp(hy, py, e), lerp(hz, pz, e))
    k.a.lean = 0.12 * e
    k.a.headTurn = Math.sin(this.time * 3 + k.seat) * 0.25 * e
    k.a.armsUp = 0.12 * e
  }
  private kitLit(k: Kit) {
    if (k.state === 'out' || k.state === 'ducking') this.catchKit(k)
    else if (k.state === 'fire') {
      // At the fire: a hop and a squeak.
      k.a.hop()
      camp.kits(0)
    }
  }
  private catchKit(k: Kit) {
    if (k.state === 'caught' || k.state === 'running' || k.state === 'fire') return
    if (this.section !== 'peek') return
    this.counts.caughtKits++
    if (this.stuck === k) {
      this.stuck = null
      this.tail.visible = false
    }
    if (this.peekKit === k) this.peekKit = null
    k.state = 'caught'
    k.out = 1
    this.poseKit(k)
    k.a.lean = 0
    // Caught! A freeze, a pose, a giggle...
    this.strike(k.a, nextStatue(null, ['tree', 'flamingo', 'ballerina', 'rock']))
    camp.freeze()
    this.burst(k.a.at(0.7, tmp), 10)
    this.lastCatch = this.time
    this.lastNew = this.time
    this.timers.later(() => {
      if (this.dead) return
      // ...then it tumbles out giggling and runs to the fire.
      releaseStatue(k.a)
      camp.giggle()
      k.a.hop()
      k.state = 'running'
      this.timers.later(() => {
        if (this.dead) return
        this.seatKit(k)
        this.kitsHome++
        this.events.section('peek', this.state('peek'))
        if (this.kitsHome >= KITS) this.timers.later(() => this.allKits(), 1400)
        else this.peekAt = this.time + 1
      }, 500)
    }, 950)
  }
  private allKits() {
    if (this.section !== 'peek' || this.dead) return
    for (const k of this.kits) k.a.wave()
    camp.kits(0)
    void this.talk(T.kits, true).then(() => this.timers.later(() => this.enter('statues'), 400))
  }

  // ---------------------------------------------------------------- statues

  private pathPoint(s: number, out: Vector3) {
    const P0 = CLEARING.path
    let left = s
    for (let i = 0; i < P0.length - 1; i++) {
      const [ax, az] = P0[i]
      const [bx, bz] = P0[i + 1]
      const l = Math.hypot(bx - ax, bz - az)
      if (left <= l || i === P0.length - 2) {
        const k = clamp(left / l)
        return out.set(lerp(ax, bx, k), 0, lerp(az, bz, k))
      }
      left -= l
    }
    return out.set(P0[0][0], 0, P0[0][1])
  }
  private get pathLen() {
    let n = 0
    const P0 = CLEARING.path
    for (let i = 0; i < P0.length - 1; i++) n += Math.hypot(P0[i + 1][0] - P0[i][0], P0[i + 1][1] - P0[i][1])
    return n
  }
  /** Out of her den she comes, on tiptoe. */
  private roxyOut() {
    const [x, z] = CLEARING.path[0]
    this.roxy.place(x, 0, z, 40)
    this.roxy.hop()
    camp.rustle(0)
    this.roxyS = 0
    this.roxyState = 'sneak'
    this.roxyT = 0
    this.roxyUnlit = 0
  }
  private roxyLit() {
    if (this.roxyState === 'sneak' || this.roxyState === 'home') this.freezeRoxy()
    else if (this.roxyState === 'fire') {
      // At the fire with her kits: a wave.
      this.roxy.wave()
      camp.chitter(0)
    }
  }
  private freezeRoxy() {
    // (Caught on her way home: she stops dead where she is, and goes on home after.)
    this.roxyAfter = this.roxyState === 'home' ? 'home' : 'sneak'
    if (this.roxy.busy) {
      const p = this.roxy.pos
      this.roxy.place(p.x, 0, p.z, (this.roxy.root.rotation.y * 180) / Math.PI)
    }
    this.roxyState = 'statue'
    this.roxyHold = 0
    this.roxyUnlit = 0
    this.roxy.waddle = 0
    this.roxy.lean = 0
    // (The first one is the tree: arms up, eyes huge, face to the camera, for the close-up.)
    const pose = this.closeup ? nextStatue(this.roxyPose, ROXY_POSES) : 'tree'
    this.roxyPose = pose
    this.strike(this.roxy, pose)
    camp.freeze()
    this.counts.statues++
    this.lastNew = this.time
    this.burst(this.roxy.at(0.8, tmp), 8)
    // The first time: the camera goes close on her silly face.
    if (!this.closeup) {
      this.closeup = true
      this.statueAt = this.time
      // (Turned to us for it: a statue that faces the flashlight.)
      this.roxy.root.rotation.y = STATUE_YAW
      const film = sillyFilm(this.roxy, faceOf(pose), {
        id: 'roxy-statue',
        say: STATUE_LINE[pose],
        sound: () => camp.freeze(),
        done: () => {
          // (The close-up takes its face back off: she's still a statue.)
          if (this.roxyState === 'statue' && this.roxyPose) this.strike(this.roxy, this.roxyPose)
        },
      })
      // Her whole pose in the frame (the tree's arms up to the sky), her face big in it.
      film.beats[0] = { ...film.beats[0], shot: statueShot(this.roxy, pose) }
      this.films.play(film, undefined, this.rig.camera)
      return
    }
    if (this.time - this.statueAt > STATUE_GAP && !this.talking) {
      this.statueAt = this.time
      void this.talk(STATUE_LINE[pose])
    }
  }
  /** The light holds her (seconds so far): she wobbles, then topples over laughing. */
  private roxyHeld(s: number) {
    const w = clamp((s - 0.6) / Math.max(0.2, TORCH.fall - 0.6))
    statueWobble(this.roxy, w)
    if (w > 0.25 && (this.wobbleCool -= 1 / 60) < 0) {
      this.wobbleCool = 0.9
      camp.wobble()
    }
    if (s > TORCH.fall) this.topple()
  }
  /** She wobbles over, laughing. */
  private topple() {
    this.roxyState = 'fall'
    this.roxyT = 0
    releaseStatue(this.roxy)
    this.roxy.lean = -1.35
    this.roxy.silly('dizzy', 1.8)
    this.spotOf.get('roxy')?.shade?.refresh()
    camp.tumble()
    this.timers.later(() => camp.chitter(0), 250)
    this.timers.later(() => camp.chitter(0), 900)
    this.laughs++
    this.counts.laughs++
    this.lastNew = this.time
    this.burst(this.roxy.at(0.3, tmp), 14)
    for (const k of this.kits) if (k.state === 'fire') k.a.hop()
    this.events.section('statues', this.state('statues'))
  }
  private roxyGaveUp(snap = false) {
    const [x, z, f] = CLEARING.roxyFire
    this.roxyState = 'fire'
    this.roxy.waddle = 0
    this.roxy.lean = 0
    releaseStatue(this.roxy)
    if (snap) this.roxy.place(x, 0, z, f)
    else this.roxy.walkTo(x, z, 1.4, f)
  }

  private updateRoxy(dt: number) {
    const r = this.roxy
    this.roxyT += dt
    // (The light on her freezes her whenever it's on her, not only the moment it lands: she may walk into it.)
    const lit = this.spotOf.get('roxy')!.lit
    if (lit && !this.films.on && (this.roxyState === 'sneak' || this.roxyState === 'home')) this.freezeRoxy()
    if (this.roxyState === 'sneak') {
      // Tiptoe: on her toes, leaning in, paws up in front, glancing at the light.
      const speed = TORCH.speed * this.roxySpeed
      this.roxyS += speed * dt
      const p = this.pathPoint(this.roxyS, tmp)
      const ahead = this.pathPoint(this.roxyS + 0.2, tmp2)
      r.pos.set(p.x, 0, p.z)
      r.root.rotation.y = Math.atan2(ahead.x - p.x, ahead.z - p.z) * 0.6 + 0.35
      r.waddle = 0.75
      r.lean = 0.22
      r.armsUp = 0.18
      r.headTurn = 0.4 + Math.sin(this.time * 2.5) * 0.2
      if (this.roxyS >= this.pathLen) this.yoink()
      // Not caught for a while: Sparkle says how again.
      if (this.time - this.lastNew > HINT_S + 2) this.hint(T.sneak)
    } else if (this.roxyState === 'statue') {
      if (lit && !this.films.on) {
        this.roxyHold += dt
        this.roxyHeld(this.roxyHold)
      }
      if (!lit && !this.films.on) {
        // (A flicker of the light off her doesn't count: a moment's grace, then she sneaks on.)
        this.roxyUnlit += dt
        if (this.roxyUnlit > 0.35) {
          releaseStatue(r)
          camp.rustle(0)
          if (this.roxyAfter === 'home') this.goHome()
          else this.roxyState = 'sneak'
        }
      } else this.roxyUnlit = 0
    } else if (this.roxyState === 'fall') {
      // On her back, kicking her feet, laughing.
      r.armsUp = 0.5 + 0.5 * Math.sin(this.time * 14)
      if (this.roxyT > 1.7) {
        r.lean = 0
        r.armsUp = 0
        if (this.laughs >= LAUGHS) {
          this.roxyState = 'sorry'
          r.cheer()
          r.pull('happy')
          this.timers.later(() => {
            if (this.dead) return
            this.roxyGaveUp()
            void this.talk(T.sorry, true).then(() => this.timers.later(() => this.enter('roast'), 600))
          }, 300)
        } else this.goHome()
      }
    } else if (this.roxyState === 'home') {
      // Scampering home (quick), then out she comes again.
      if (!r.busy && this.roxyT > 0.3) {
        if (this.roxyT > 1.6) {
          this.carry.visible = false
          this.roxyS = 0
          this.roxyState = 'sneak'
          camp.rustle(0)
        }
      }
    }
  }
  private goHome() {
    const [x, z] = CLEARING.path[0]
    this.roxyState = 'home'
    this.roxyT = 0
    this.roxy.waddle = 0
    this.roxy.lean = 0
    this.roxy.walkTo(x, z, Math.max(0.8, this.roxy.pos.distanceTo(tmp.set(x, 0, z)) / 2.4), 40)
  }
  /** She reached the bag: one marshmallow, yoink! Back she goes to try again (a little slower). */
  private yoink() {
    this.roxyState = 'yoink'
    this.roxy.waddle = 0
    this.roxy.lean = 0.3
    this.roxy.armsUp = 0.5
    this.roxy.turnTo(CAMP.bag[0], CAMP.bag[2])
    camp.yoink()
    this.yoinks++
    this.counts.yoinks++
    this.roxySpeed = Math.max(0.35, this.roxySpeed * TORCH.slow)
    const left = this.set.mallows.filter((m) => m.visible)
    if (left.length <= 1) this.set.mallows.forEach((m) => (m.visible = true))
    const m = this.set.mallows.find((x) => x.visible)
    if (m) m.visible = false
    this.carry.visible = true
    if (this.time - this.statueAt > 1) this.friend(T.yoink)
    for (const k of this.kits) if (k.state === 'fire') k.a.hop()
    camp.kits(0)
    this.timers.later(() => !this.dead && this.roxyState === 'yoink' && this.goHome(), 700)
  }

  // ---------------------------------------------------------------- the roast

  private stickRest() {
    const { tip, end } = CLEARING.stickRest
    return { tip: tmp2.set(...tip), end: tmp3.set(...end) }
  }
  /** Everybody comes round the fire where the close camera sees them (Maple stays on her log). */
  private toRoastSeats(snap = false) {
    const go = (a: FilmActor, [x, z, f]: [number, number, number]) => (snap ? a.place(x, 0, z, f) : a.walkTo(x, z, Math.max(0.6, a.pos.distanceTo(tmp.set(x, 0, z)) / 1.6), f))
    go(this.roxy, ROAST_SEATS.roxy)
    go(this.monty, ROAST_SEATS.monty)
    this.kits.forEach((k, i) => go(k.a, ROAST_SEATS[`kit${i}`]))
  }
  /** The orders out now (this round's, not yet given right). */
  private active() {
    return this.orders.filter((o) => o.step === this.step && !o.done)
  }
  /** Is the next marshmallow Monty's giant one? */
  private giantNext() {
    return ORDERS[this.step]?.some((o) => o.want === 'giant') ?? false
  }
  /** A round of orders: their wish bubbles pop up. */
  private openStep() {
    if (this.dead || this.section !== 'roast') return
    const now = this.active()
    now.forEach((o, i) =>
      this.timers.later(() => {
        if (this.dead || this.section !== 'roast') return
        o.bubble.show()
        camp.wish()
        this.receivers()
          .find(([id]) => id === o.who)?.[1]
          .hop()
      }, i * 450),
    )
    this.lastNew = this.time
    // (The line at the bottom goes back to what to do: not "It's on fire!" from the last one.)
    this.events.line(T.marshmallow)
    this.events.stars({ done: this.starCount(), of: this.orders.length })
  }
  private starCount() {
    return this.orders.filter((o) => o.done).length
  }

  private updateStick(dt: number) {
    if (!this.stick.root.visible) return
    const rest = this.stickRest()
    if (this.held && this.finger) {
      // Her finger is the marshmallow, in the upright plane through the fire (so over the flames on the screen is over
      // the flames); the stick comes back toward her from it.
      const p = this.fingerAt(this.finger.x, this.finger.y, tmp)
      if (p) {
        p.set(clamp(p.x, -2.6, 2.6), clamp(p.y, 0.22, 2.4), 0)
        this.stickTip.lerp(p, damp(dt, 22))
      }
      this.stickBack = Math.max(0, this.stickBack - dt * 6)
    } else this.stickBack = Math.min(1, this.stickBack + dt * 4)
    const tip = this.stickBack > 0 ? tmp.copy(this.stickTip).lerp(rest.tip, this.stickBack * this.stickBack * (3 - 2 * this.stickBack)) : tmp.copy(this.stickTip)
    if (!this.held) this.stickTip.copy(tip)
    // The other end: toward her (the camera) and down, so it reads as held from her side.
    const cam = this.rig.camera.position
    const toCam = tmp2.copy(cam).sub(tip).setY(0).normalize()
    const held = tmp3.copy(tip).addScaledVector(toCam, 0.95).setY(tip.y - 0.25)
    const end = this.stickBack > 0.001 ? held.lerp(rest.end, this.stickBack) : held
    this.stick.lay(end, tip)
    // Heat: in the flames or just over them is hottest (the column of hot air over the fire).
    const d = Math.hypot(tip.x - CAMP.fire[0], Math.max(0, tip.y - 1.0) * 0.7 + Math.max(0, 0.3 - tip.y) * 2, (tip.z - CAMP.fire[2]) * 0.6)
    const heat = this.held ? Math.pow(clamp(1 - d / ROAST.heat), 1.2) : 0
    const ev = this.stick.update(dt, this.time, heat, ROAST)
    if (heat > 0.08 && this.time - this.sizzleAt > (camp.synthCrackle ? 0.15 : 1.3) / (0.4 + heat)) {
      this.sizzleAt = this.time
      camp.sizzle(0.02 + 0.03 * heat)
    }
    if (ev === 'golden') {
      sounds.sparkle()
      this.burst(this.stick.tip, 8)
    } else if (ev === 'fire') {
      camp.sparks(0.12)
      this.sparkle(T.onFire)
    } else if (ev === 'out') {
      camp.blow()
      this.counts.blownOut++
    }
    if (this.stick.fire && Math.random() < dt * 10) this.sparks.emit(this.stick.tip.x, this.stick.tip.y + 0.1, this.stick.tip.z, (Math.random() - 0.5) * 0.3, 0.8, (Math.random() - 0.5) * 0.3, 0.6, 0.05, 0)
    // Mouths open as it comes near.
    if (this.held) {
      const who = this.receiverNear()
      for (const [id, a] of this.receivers()) {
        if (id === who) {
          // (A look toward it, not a turn: their faces stay to us.)
          a.headTurn = clamp(wrapAngle(Math.atan2(this.stick.tip.x - a.pos.x, this.stick.tip.z - a.pos.z) - a.root.rotation.y), -0.6, 0.6)
          a.pull('wow', true)
          a.lean = 0.15
        } else if (this.mouthOpen.has(id)) {
          a.cheer()
          a.lean = 0
          a.headTurn = 0
        }
      }
      this.mouthOpen = new Set(who ? [who] : [])
    }
    if (this.stick.done && !this.held && !this.toastedSaid && this.time - this.lastTouch > 5) {
      this.toastedSaid = true
      this.hint(T.marshmallowHint)
    }
    if (!this.held && this.time - this.lastTouch > HINT_S && this.sectionT > 6) this.hint(T.marshmallow)
  }
  private mouthOpen = new Set<string>()
  /** The wish bubbles: over their heads, glowing while the marshmallow she holds is the kind they want (a chime the
   *  moment it is); a star floating up from one just given right. */
  private updateBubbles(dt: number) {
    let ready = false
    const roast = this.section === 'roast' && this.stick.root.visible && this.held
    for (const o of this.orders) {
      const a = this.receivers().find(([id]) => id === o.who)?.[1]
      if (!a) continue
      const r = roast && o.bubble.showing && this.stick.matches(o.want, ROAST, o.miss) && (this.stick.toast > 0.02 || this.stick.charred || o.miss >= 2)
      ready ||= r
      const head = a.at(1, tmp2)
      head.y += 0.3
      o.bubble.update(dt, this.time, this.rig.camera, head, r)
    }
    if (ready && !this.readyWas) camp.ready()
    this.readyWas = ready
  }
  /** Who can be handed a marshmallow. */
  private receivers(): [string, FilmActor][] {
    const list: [string, FilmActor][] = [
      ['maple', this.maple],
      ['roxy', this.roxy],
      ['monty', this.monty],
    ]
    this.kits.forEach((k, i) => k.state === 'fire' && list.push([`kit${i}`, k.a]))
    return list
  }
  /** Who the marshmallow is near on the screen: anywhere on them, feet to the top of the head (somebody with an order
   *  out first, then the nearest). */
  private receiverNear(): string | null {
    let best: string | null = null
    let bd = Infinity
    // (Down in the flames it's toasting: letting go there isn't giving it to Monty behind them. Higher up, over the
    // fire, it's on Monty.)
    const t = this.stick.tip
    if (Math.hypot(t.x - CAMP.fire[0], Math.max(0, t.y - 0.35), t.z - CAMP.fire[2]) < 0.5) return null
    const tip = this.toScreen(this.stick.tip)
    const want = new Set(this.active().map((o) => o.who))
    for (const [id, a] of this.receivers()) {
      const lo = this.toScreen(a.at(0.15, tmp))
      const loX = lo.x
      const loY = lo.y
      const hi = this.toScreen(a.at(1, tmp))
      const ux = hi.x - loX
      const uy = hi.y - loY
      const k = clamp(((tip.x - loX) * ux + (tip.y - loY) * uy) / Math.max(1, ux * ux + uy * uy))
      const d = Math.hypot(tip.x - (loX + ux * k), tip.y - (loY + uy * k)) - (want.has(id) ? 30 : 0)
      const reach = clamp(Math.hypot(ux, uy) * ROAST.give, 48, 110)
      if (d < reach && d < bd) {
        bd = d
        best = id
      }
    }
    return best
  }
  /** She lets go of the stick: near somebody, they eat it. The kind they ordered: a gold star (the round's last one:
   *  the next round's bubbles). Another kind: they eat it anyway, with a silly face, and their order stays (wider each
   *  time). Somebody with no order out: a happy munch. Anywhere else, it goes back by the fire. */
  private give() {
    const who = this.receiverNear()
    for (const id of this.mouthOpen) this.receivers().find(([r]) => r === id)?.[1].cheer()
    this.mouthOpen.clear()
    if (!who) {
      sounds.place()
      return
    }
    const s = this.stick
    const a = this.receivers().find(([r]) => r === who)![1]
    a.cheer()
    a.lean = 0
    a.headTurn = 0
    a.hop()
    camp.munch(0)
    this.burst(a.head(tmp), 10)
    const kit = who.startsWith('kit')
    const order = this.active().find((o) => o.who === who)
    if (order && s.matches(order.want, ROAST, order.miss)) {
      // Just what they wanted: a gold star.
      order.done = true
      order.bubble.starred()
      camp.star()
      this.burst(a.at(1, tmp), 22)
      a.wave()
      const line = order.want === 'golden' ? (who === 'maple' ? T.golden : null) : order.want === 'squishy' ? T.kitSquishy : order.want === 'burnt' ? T.burntYum : T.montyStick
      if (line) this.friend(line, true)
      if (kit || who === 'roxy') {
        camp.kits(0)
        for (const k of this.kits) if (k.a !== a) k.a.hop()
      }
      if (who === 'monty') this.monty.nod()
      this.events.stars({ done: this.starCount(), of: this.orders.length })
    } else if (order) {
      // Not that kind: they eat it anyway (a funny shiver), and still want theirs.
      order.miss++
      this.timers.later(() => a.shake(), 350)
      if (who === 'maple') this.friend(s.charred ? T.tooCrunchy : T.squishy, true)
      else if (who === 'roxy') this.friend(T.moreCrunchy, true)
      else if (kit) camp.kits(0)
      else this.monty.nod()
    } else if (who === 'maple') this.friend(s.charred ? T.tooCrunchy : s.toast >= 0.75 ? T.golden : T.squishy, true)
    else if (kit || who === 'roxy') {
      this.friend(s.charred ? T.burntYum : T.munch, true)
      camp.kits(0)
    } else {
      this.friend(T.montyStick, true)
      this.monty.nod()
    }
    this.eaten = who
    this.roasted++
    this.counts.roasted++
    this.lastNew = this.time
    this.toastedSaid = false
    // The round is done: the next one's bubbles (or, all done, everybody cheers and on to the sky).
    const roundDone = this.active().length === 0
    if (roundDone) this.step++
    const allDone = this.step >= ORDERS.length
    if (roundDone) this.events.section('roast', this.state('roast'))
    // A fresh marshmallow on a stick, back by the fire (Monty's stick is gone: a new one).
    s.visible = false
    this.held = false
    this.stickBack = 1
    this.timers.later(() => {
      if (this.dead || this.section !== 'roast') return
      if (allDone) return this.allServed()
      s.fresh(this.giantNext() ? 2 : 1)
      s.visible = true
      camp.pop()
      if (roundDone) this.openStep()
    }, who === 'monty' ? 1100 : roundDone ? 1300 : 700)
  }
  /** Every order given: everybody cheers, Maple says so, and on to the sky. */
  private allServed() {
    camp.kits(0)
    for (const [, a] of this.receivers()) {
      a.hop()
      a.cheer()
    }
    this.maple.wave()
    this.burst(tmp.set(CAMP.fire[0], 1.2, CAMP.fire[2]), 30)
    void this.talk(T.best, true).then(() => this.timers.later(() => this.enter('sky'), 700))
  }

  // ---------------------------------------------------------------- the end: lights off

  private lightsOff() {
    if (this.skyT >= 0) return
    this.skyT = 0
    camp.click()
    this.light.set(false)
    this.lastNew = this.time
    this.progress(5)
    this.timers.later(() => {
      this.sky.setFull(true)
      for (let i = 0; i < 8; i++) this.timers.later(() => camp.twinkle(), 300 + i * 260)
    }, 500)
    this.timers.later(() => {
      if (this.dead) return
      this.events.line(T.fullSky)
      void this.talk(T.fullSky)
    }, 2200)
    this.timers.later(() => {
      if (this.dead) return
      this.sky.setLights(true)
      camp.shimmer()
      this.sparkle(T.lights, true)
    }, 6200)
    this.timers.later(() => {
      if (this.dead) return
      if (this.goodnight) void this.talk(T.goodnight, true)
      for (const k of this.kits) k.a.wave()
      this.maple.wave()
    }, 10500)
    this.timers.later(() => !this.dead && this.events.done(), this.goodnight ? 14000 : 12500)
  }

  // ---------------------------------------------------------------- the frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
    this.light.corner = this.tall ? { x: 0.56, y: -0.76, d: 2.3 } : { x: 0.7, y: -0.64, d: 1.75 }
    if (!this.finger) {
      // Where the light starts: on the empty ground in front of the fire.
      const p = this.toScreen(tmp.set(1.7, 0, 2.3))
      this.light.point(p.x, p.y, false)
      this.light.snap()
    }
  }
  private shot(): Shot {
    // The roast: down close to the fire, everybody round it in the frame (and their wish bubbles over them).
    if (this.section === 'roast' && !this.lookId) {
      return {
        center: new Vector3(0.15, 1.05, -0.55),
        half: this.tall ? new Vector3(2.05, 1.35, 1.2) : new Vector3(2.15, 1.25, 1.2),
        yaw: 0,
        pitch: this.tall ? 16 : 10,
        objectFit: 'contain',
      }
    }
    return {
      center: new Vector3(0.45, 0.95, -1.55),
      half: this.tall ? new Vector3(3.3, 1.3, 2.4) : new Vector3(4.1, 1.25, 2.5),
      yaw: 0,
      pitch: this.tall ? 23 : 14,
      objectFit: 'contain',
    }
  }
  /** The close-up's ⏭ (held). */
  skipFilm() {
    this.films.skip()
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
    const t = (this.time += dt)
    this.sectionT += dt
    const cine = this.films.update(dt, this.w / this.h)
    if (this.films.on) this.lastTouch = t

    // ---- The light: where it's pointing, and who it lands on.
    this.lightSpeed = Math.hypot(this.light.at.x - this.lastAt.x, this.light.at.y - this.lastAt.y) / Math.max(dt, 1e-3)
    this.lastAt.x = this.light.at.x
    this.lastAt.y = this.light.at.y
    // (Not before the light has been aimed once: until then it points at the middle of the world.)
    if (!this.films.on && this.aimed && (!this.lookId || this.lookId === 'statue')) this.lightSpots(dt)
    // (QA's close look: everyone in full color, nobody doing their bit.)
    else if (this.lookId && this.lookId !== 'statue') for (const s of this.shades) s.goal = 1

    // ---- The parts.
    if (this.section === 'eyes' || this.section === 'story') this.updateEyes()
    if (this.section === 'peek') this.updatePeek(dt)
    if (this.section === 'statues' || this.roxyState === 'fall' || this.roxyState === 'sorry') this.updateRoxy(dt)
    if (this.section === 'roast') this.updateStick(dt)
    if (this.section === 'sky' && this.skyT < 0 && this.sectionT > HINT_S && t - this.lastTouch > HINT_S) this.hint(T.off)
    if (this.skyT >= 0) this.skyT += dt

    // ---- Everybody's own life.
    this.updateFolks(dt, t)
    this.cast.update(dt, t)
    this.afterCast(dt, t)
    for (const c of [this.owl, this.bat, this.deer, this.porky, this.frog]) c.update(dt, t)
    for (const s of this.shades) s.update(dt)
    updateCamp(this.set, dt, t, this.rig.camera.position, (x, y, z, n) => this.burst(tmp.set(x, y, z), n, true))
    if (camp.synthCrackle && Math.random() < dt * 5) camp.crackle(0.03)
    this.sparks.update(dt)

    // ---- The night: blue moonlight, the fire's warm light; darker still with the flashlight off.
    const off = this.skyT >= 0 ? clamp(this.skyT / 2) : 0
    this.lights.follow(0.5, 0.6, -1.5)
    this.lights.ambient.color.set('#7480E0')
    this.roastLit += ((this.section === 'roast' ? 1 : 0) - this.roastLit) * damp(dt, 2)
    this.lights.ambient.intensity *= 0.64 - 0.2 * off + 0.14 * this.roastLit
    this.lights.sun.color.set('#A9B4FF')
    this.lights.sun.intensity *= 0.66 - 0.2 * off
    this.lights.sun.position.set(-5.5, 9, 1.5)
    this.sky.update(dt, t, this.rig.camera.position, this.h)

    // ---- The camera: the clearing, or (lights off) up at the sky.
    this.rig.setShot(this.shot())
    this.rig.setCine(cine ?? this.skyFrame() ?? this.lookFrame())
    this.rig.update(dt)
    this.updateBubbles(dt)
    this.light.update(dt, this.rig.camera, this.w, this.h)
    this.aimed = true
    // (At the end the flashlight itself is what to tap: it bounces gently, asking.)
    this.light.toy.scale.setScalar(this.section === 'sky' && this.skyT < 0 ? 1 + 0.1 * Math.abs(Math.sin(t * 3.5)) : 1)
    this.bars.update(dt, this.films.on)
    this.drawHint()
  }

  /** Lights off: the camera tilts slowly up from the clearing to the sky over the trees. */
  private skyFrame(): CineFrame | null {
    if (this.skyT < 0) return null
    const k = clamp((this.skyT - 0.8) / 4.5)
    const e = k * k * (3 - 2 * k)
    const cam = this.skyCam
    if (!this.skyFrom) {
      this.skyFrom = { eye: this.rig.camera.position.clone(), look: this.rig.camera.getWorldDirection(new Vector3()).multiplyScalar(8).add(this.rig.camera.position) }
    }
    cam.eye.copy(this.skyFrom.eye).lerp(tmp.set(this.skyFrom.eye.x, this.skyFrom.eye.y - 0.6, this.skyFrom.eye.z + 0.6), e)
    cam.look.copy(this.skyFrom.look).lerp(tmp.set(0.4, 9, -20), e)
    cam.fov = lerp(this.rig.camera.fov, this.tall ? 58 : 48, e)
    return cam
  }
  private skyCam: CineFrame = { eye: new Vector3(), look: new Vector3(), fov: 40, roll: 0 }

  /** QA: `?look=owl&yaw=90` holds a close camera on one thing (from `yaw` degrees round it, 0 from the front, `tilt`
   *  degrees up), everything lit, to see it from every side; `?statue=` holds the statue close-up's own camera. */
  private lookFrame(): CineFrame | null {
    const id = this.lookId
    if (!id) return null
    const f = this.lookCam
    if (id === 'statue') {
      const s = statueShotAt(this.roxy, this.roxyPose ?? 'tree', this.tall)
      f.eye.copy(s.eye)
      f.look.copy(s.look)
      f.fov = s.fov
      return f
    }
    const at: Record<string, [Object3D | Vector3, number, number]> = {
      owl: [this.owl.root, 0.5, 2.6],
      bat: [this.bat.root, -0.45, 2.6],
      deer: [this.deer.root, 0.9, 5],
      porcupine: [this.porky.root, 0.3, 2.4],
      frog: [this.frog.root, 0.25, 1.9],
      roxy: [this.roxy.root, 0.45, 3],
      maple: [this.maple.root, 0.5, 3],
      monty: [this.monty.root, 1.1, 6],
      kit: [this.kits[0].a.root, 0.35, 2.4],
      tent: [new Vector3(CAMP.tent[0], 0.6, CAMP.tent[2]), 0, 5.5],
      fire: [new Vector3(CAMP.fire[0], 0.35, CAMP.fire[2]), 0, 3.4],
      log: [new Vector3(FALLEN.x, 0.3, FALLEN.z), 0, 3.6],
      den: [new Vector3(CLEARING.den[0], 0.4, CLEARING.den[1]), 0, 4],
      stick: [this.stick.tip, 0, 2.2],
    }
    const a = at[id]
    if (!a) return null
    const [o, up, d] = a
    const c = o instanceof Vector3 ? tmp.copy(o) : o.getWorldPosition(tmp)
    c.y += up
    const yaw = (this.lookYaw * Math.PI) / 180
    const tilt = (this.lookTilt * Math.PI) / 180
    const ang = (o instanceof Vector3 ? 0 : new Euler().setFromQuaternion(o.getWorldQuaternion(new Quaternion()), 'YXZ').y) + yaw
    f.look.copy(c)
    f.eye.set(c.x + Math.sin(ang) * Math.cos(tilt) * d, c.y + Math.sin(tilt) * d, c.z + Math.cos(ang) * Math.cos(tilt) * d)
    f.fov = 34
    return f
  }
  private lookId = flag('look') ?? (flag('statue') ? 'statue' : null)
  // (Read once: the address bar loses them when the section's state is written into it.)
  private lookYaw = Number(flag('yaw')) || 0
  private lookTilt = Number(flag('tilt') ?? 15) || 0
  private lookCam: CineFrame = { eye: new Vector3(), look: new Vector3(), fov: 34, roll: 0 }
  private skyFrom: { eye: Vector3; look: Vector3 } | null = null

  /** Who's in the light now: they come to color and do their bit the moment it lands. */
  private lightSpots(dt: number) {
    const cam = this.rig.camera
    for (const s of this.spots) {
      const live = s.live()
      const on = live && this.light.covers(cam, s.at(tmp), s.r)
      s.cool -= dt
      if (on && !s.lit) {
        s.lit = true
        s.litT = 0
        this.counts.shone++
        if (s.cool <= 0) {
          s.cool = 2.2
          s.on?.()
        }
      } else if (!on && s.lit) {
        s.lit = false
        s.off?.()
      }
      if (s.lit) {
        s.litT += dt
        s.hold?.(s.litT)
      }
      if (s.shade) {
        s.shade.goal = Math.max(this.floorOf(s), s.lit ? 1 : 0)
        // By the fire, the dark side glows warm.
        const p = s.at(tmp)
        s.shade.setRim(Math.hypot(p.x - CAMP.fire[0], p.z - CAMP.fire[2]) < 1.9 ? RIM_FIRE : RIM_MOON)
      }
    }
    // Sparkle's hint makes the nearest animal she hasn't met shine brighter.
    const want = this.section === 'eyes' && this.time - this.lastNew > HINT_S
    for (const id of ['owl', 'bat', 'deer', 'porcupine', 'frog', 'monty']) {
      const sh = this.spotOf.get(id)?.shade
      if (sh) sh.hint += ((want && !this.met.has(id) ? 1 : 0) - sh.hint) * damp(dt, 3)
    }
  }

  /** How lit someone is without the flashlight: those sitting round the fire are in its light. */
  private floorOf(s: Spot) {
    if (s.id === 'roxy') return s.floor || (this.roxyState === 'fire' || this.roxyState === 'sorry' ? 0.8 : 0)
    if (s.id.startsWith('kit')) return this.kits[Number(s.id[3])].state === 'fire' ? 0.8 : 0
    if (s.id === 'monty') return this.section === 'roast' || this.section === 'sky' ? 0.7 : 0
    return s.floor
  }

  /** What the cast do before their own update (where they stand, which way they look). */
  private updateFolks(dt: number, t: number) {
    // Maple watches the light; her shadow bunny lasts a couple of seconds.
    const m = this.maple
    if (this.bunnyT >= 0) {
      this.bunnyT += dt
      if (this.bunnyT > 2.4) {
        this.bunnyT = -1
        m.armsUp = 0
      }
    }
    if (this.section !== 'roast') {
      const tgt = this.light.target
      const want = clamp(Math.atan2(tgt.x - m.pos.x, tgt.z - m.pos.z) - m.root.rotation.y, -0.7, 0.7)
      m.headTurn += (want - m.headTurn) * damp(dt, 4)
    }
    // Monty: chewing; squinting, then his sunglasses.
    if (this.montyT >= 0) {
      this.montyT += dt
      if (this.montyT > 1.5 && !this.montyCool) {
        this.montyCool = true
        this.monty.armsUp = 0.55
        this.timers.later(() => {
          this.wearShades(true)
          camp.shades()
          this.monty.armsUp = 0
          this.monty.pull('happy')
          this.friend(T.mooseShades, true)
        }, 450)
      }
      if (this.montyT > 2.4) {
        this.montyT = -1
        this.monty.lean = 0
      }
    }
    // The kits at the fire bob and look at the fire.
    for (const k of this.kits) if (k.state === 'fire' && !k.a.busy) k.a.headTurn = Math.sin(t * 1.2 + k.seat * 2) * 0.25
  }
  /** What has to be laid over the cast's own pose (after their update). */
  private afterCast(_dt: number, t: number) {
    // Monty's squint: his eyes screwed up tight.
    if (this.montyT >= 0 && this.montyT < 1.95 && !this.shades3d?.visible) this.monty.rig.eyes.scale.y = 0.18
    // Maple's paws up in front of her face, wiggling, and the bunny on the bush behind her.
    const b = this.bunnyT
    this.bunny.visible = b >= 0
    if (b >= 0) {
      const k = Math.min(1, b / 0.3) * (b > 2 ? 1 - (b - 2) / 0.4 : 1)
      ;(this.bunny.material as MeshBasicMaterial).opacity = 0.72 * k
      this.bunny.position.y = 0.46 + Math.abs(Math.sin(b * 6)) * 0.06
      this.bunny.scale.set(1.25, 1.25 * (1 + Math.sin(b * 12) * 0.06), 1.25)
      this.maple.rig.armR.rotation.x = -0.9 + Math.sin(t * 12) * 0.12
      this.maple.rig.armL.rotation.x = -0.9 - Math.sin(t * 12) * 0.12
    }
    // Roxy holds her marshmallow up as she runs.
    if (this.carry.visible) this.roxy.rig.armR.rotation.z = 1.2
  }

  /** Strike a statue (and the night shading takes over the silly face it builds). */
  private strike(a: FilmActor, pose: StatueId) {
    strikeStatue(a, pose, { props: this.bag })
    for (const s of this.spots) if (s.id === 'roxy' || s.id.startsWith('kit')) s.shade?.refresh()
  }

  private burst(p: Vector3, n: number, fire = false) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = fire ? 0.25 : 1.1 * (0.4 + Math.random() * 0.6)
      this.sparks.emit(p.x, p.y, p.z, Math.cos(a) * v, (fire ? 1.1 : 1.6) * (0.5 + Math.random() * 0.7), Math.sin(a) * v, fire ? 0.9 : 0.8, fire ? 0.05 : 0.08, fire ? Math.floor(Math.random() * 2) : 2 + (i % 3))
    }
  }

  render() {
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = tmp3.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** Pixels a meter is, at this point. */
  private pxPerM(v: Vector3) {
    const d = this.rig.camera.position.distanceTo(v)
    return this.h / (2 * d * Math.tan((this.rig.camera.fov * Math.PI) / 360))
  }
  /** Her finger in the upright plane through the fire (where the marshmallow goes). */
  private fingerAt(x: number, y: number, out: Vector3) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.plane, out)
  }

  pointerDown(x: number, y: number, id?: string) {
    if (this.films.on) return
    this.lastTouch = this.time
    this.counts.holds++
    this.finger = { x, y }
    if (id === 'flashlight') return
    // The marshmallow: pick it up (on fire: puff, out it goes).
    if (this.section === 'roast' && this.stick.root.visible) {
      const m = this.toScreen(this.stick.tip)
      if (id === 'stick' || Math.hypot(m.x - x, m.y - y) < ROAST.grab) {
        if (this.stick.fire && this.stick.blowOut()) {
          camp.blow()
          this.counts.blownOut++
          this.burst(this.stick.tip, 8)
        }
        this.held = true
        this.stickTip.copy(this.stick.tip)
        this.stickBack = 0
        return
      }
    }
    // (In the roast, a poke at somebody or the fire: they do a little something.)
    if (this.section === 'roast') return this.poke(x, y, id)
    if (this.section === 'story') this.enter('eyes')
    this.light.point(x, y, !IS_MOUSE)
  }
  /** The roast: a poke at somebody round the fire (a hop and a giggle), or at the fire (sparks). */
  private poke(x: number, y: number, id?: string) {
    let who: string | null = id && this.receivers().some(([r]) => r === id) ? id : null
    if (!who) {
      let bd = Infinity
      for (const [r, a] of this.receivers()) {
        const m = this.toScreen(a.at(0.6, tmp))
        const d = Math.hypot(m.x - x, m.y - y)
        if (d < Math.max(60, this.pxPerM(a.at(0.6, tmp)) * a.height * 0.45) && d < bd) {
          bd = d
          who = r
        }
      }
    }
    if (who) {
      const a = this.receivers().find(([r]) => r === who)![1]
      a.hop()
      a.pull('happy')
      if (who === 'maple') camp.giggle()
      else if (who === 'monty') this.monty.nod()
      else camp.chitter(0)
      return
    }
    const f = this.toScreen(tmp.set(CAMP.fire[0], 0.35, CAMP.fire[2]))
    if (id === 'fire' || Math.hypot(f.x - x, f.y - y) < Math.max(70, this.pxPerM(tmp) * 0.5)) {
      this.set.flare = 0.6
      camp.sparks(0.1)
      for (let i = 0; i < 14; i++) this.sparks.emit(CAMP.fire[0], 0.5, CAMP.fire[2], (Math.random() - 0.5) * 0.6, 1.2 + Math.random(), (Math.random() - 0.5) * 0.6, 0.9, 0.05, 0)
    }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    // (A mouse moving with no button down leaves the light where it is: click and hold, then move.)
    if (!held || this.films.on) return
    this.lastTouch = this.time
    this.counts.moves++
    this.finger = { x, y }
    // (In the roast the flashlight is put away: her finger is only the marshmallow.)
    if (this.held || this.section === 'roast') return
    this.light.point(x, y, !IS_MOUSE)
  }
  pointerUp() {
    if (this.held) this.give()
    this.held = false
    this.finger = null
  }
  tap(x: number, y: number, id?: string) {
    if (this.films.on) return
    this.lastTouch = this.time
    this.counts.taps++
    // The flashlight itself: off at the end; any other time, a click off and on (a blink).
    if (id === 'flashlight') {
      if (this.section === 'roast') return
      if (this.section === 'sky') this.lightsOff()
      else {
        camp.click()
        this.light.set(false)
        this.timers.later(() => {
          camp.click()
          this.light.set(true)
        }, 280)
      }
      return
    }
    // (A keyboard press on a tap target: the light goes to it.)
    if (id && x === 0 && y === 0) {
      const el = this.anchorEls.get(id)
      if (el) {
        const r = el.getBoundingClientRect()
        const p = el.parentElement?.getBoundingClientRect()
        this.light.point(r.left - (p?.left ?? 0) + r.width / 2, r.top - (p?.top ?? 0) + r.height / 2, false)
      }
    }
  }

  // ---------------------------------------------------------------- the hint's hand and the tap targets

  private drawHint() {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    if (this.section === 'sky' && this.skyT < 0 && this.sectionT > 5) at = this.light.toy.position
    else if (this.section === 'peek' && this.stuck) at = this.tail.getWorldPosition(tmp)
    else if (this.section === 'roast' && !this.held && this.time - this.lastTouch > HINT_S && this.stick.root.visible) at = this.stick.tip
    if (!at) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const p = this.toScreen(at)
    el.style.display = ''
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, size: number) => {
      let show = !!at && !this.films.on && this.skyT < 0
      if (show && at) {
        const p = this.toScreen(at)
        const s = Math.max(min, Math.min(this.w * 0.25, size))
        show = p.z < 1 && p.x > -s / 2 && p.x < this.w + s / 2 && p.y > -s / 2 && p.y < this.h + s / 2
        if (show) {
          el.style.transform = `translate3d(${(p.x - s / 2).toFixed(1)}px, ${(p.y - s / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${s.toFixed(0)}px`
        }
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const sized = (o: Vector3, m: number) => this.pxPerM(o) * m
    for (const [id, el] of this.anchorEls) {
      if (id === 'flashlight') {
        // (The flashlight is the thing to tap at the end: a big target, over the toy.)
        const p = this.light.toy.position
        const show = !this.films.on && this.skyT < 0 && this.light.toy.visible
        if (show) {
          const s = Math.max(min, 110)
          const q = this.toScreen(p)
          el.style.transform = `translate3d(${(q.x - s / 2).toFixed(1)}px, ${(q.y - s / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${s}px`
        }
        el.style.display = show ? '' : 'none'
        el.style.zIndex = '5'
        continue
      }
      const spot = this.spotOf.get(id)
      if (id === 'stick') {
        const v = this.section === 'roast' && this.stick.root.visible && !this.held
        place(el, v ? this.stick.tip : null, sized(this.stick.tip, 0.5))
      } else if (spot) {
        const v = spot.live() && (id !== 'roxy' || this.roxy.root.visible)
        const p = v ? spot.at(new Vector3()) : null
        place(el, p, p ? sized(p, spot.r * 2.2) : 0)
      }
      el.style.zIndex = id === 'stick' ? '4' : id.startsWith('kit') || id === 'roxy' ? '3' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (v: Vector3) => {
      const p = this.toScreen(v)
      return { x: Math.round(p.x), y: Math.round(p.y) }
    }
    const at: Record<string, { x: number; y: number }> = {}
    for (const s of this.spots) if (s.live()) at[s.id] = scr(s.at(new Vector3()))
    return {
      section: this.section,
      film: this.films.now,
      films: { done: this.films.done, skipped: this.films.skipped },
      light: { x: Math.round(this.light.at.x), y: Math.round(this.light.at.y), on: this.light.on, ground: this.light.onGround },
      lit: this.spots.filter((s) => s.lit).map((s) => s.id),
      met: [...this.met],
      kits: { at: this.kits.map((k) => ({ state: k.state, ...scr(k.a.at(0.62, new Vector3())) })), home: this.kitsHome, peeking: this.kits.filter((k) => k.state === 'out').map((k) => `kit${k.seat}`), stuck: this.stuck ? `kit${this.stuck.seat}` : null, peeks: this.peekN },
      roxy: { state: this.roxyState, pose: statueOf(this.roxy), pos: this.roxy.pos.toArray().map((v) => +v.toFixed(2)), laughs: this.laughs, yoinks: this.yoinks, speed: +(TORCH.speed * this.roxySpeed).toFixed(2), along: +this.roxyS.toFixed(2), of: +this.pathLen.toFixed(2), hold: +this.roxyHold.toFixed(2) },
      roast: this.section === 'roast' ? { held: this.held, toast: +this.stick.toast.toFixed(2), golden: this.stick.golden, fire: this.stick.fire, charred: this.stick.charred, giant: this.stick.size > 1, given: this.roasted, ate: this.eaten, tip: scr(this.stick.tip), step: this.step, stars: this.starCount(), of: this.orders.length, orders: this.active().map((o) => ({ who: o.who, want: o.want, miss: o.miss, showing: o.bubble.showing, ready: this.stick.matches(o.want, ROAST, o.miss) })), flashlight: this.light.toy.visible } : null,
      sky: this.skyT >= 0 ? { t: +this.skyT.toFixed(1), stars: +this.sky.full.toFixed(2), lights: +this.sky.lights.toFixed(2) } : null,
      flashlight: scr(this.light.toy.position),
      // (How far above her finger the light lands: a robot puts its finger this far below what it wants lit.)
      liftPx: IS_MOUSE ? 0 : TORCH.lift,
      at,
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.dead = true
    this.timers.dispose()
    this.stopBed()
    this.unwatch()
    if (this.films.on) stopSpeaking()
    this.scene.clear()
    this.bag.dispose()
  }
}

// ---------------------------------------------------------------- little things

/** How each statue is framed in its close-up (in her heights): the middle of what to show and half its height. */
const STATUE_FRAME: Record<StatueId, [mid: number, half: number]> = { tree: [0.74, 0.8], flamingo: [0.66, 0.7], ballerina: [0.6, 0.7], whistling: [0.62, 0.64], rock: [0.4, 0.52] }
const STATUE_FOV = 30
const statueTmp = new Vector3()
/** The statue close-up's camera: from the clearing's side (where her flashlight is), a little to our right and above,
 *  the whole pose in the frame with her face high and big in it, pushing slowly in. (On a tall screen the film backs
 *  it off along the same line, so the raised arms stay in.) */
function statueEye(who: FilmActor, pose: StatueId, push: number) {
  const [mid, half] = STATUE_FRAME[pose]
  const d = (half * who.height) / Math.tan(((STATUE_FOV / 2) * Math.PI) / 180) * push
  const look = who.at(mid, new Vector3())
  return { look, eye: look.clone().add(statueTmp.set(Math.sin(STATUE_YAW), 0.16, Math.cos(STATUE_YAW)).normalize().multiplyScalar(d)) }
}
function statueShot(who: FilmActor, pose: StatueId): FilmShot {
  return { eye: () => statueEye(who, pose, 1).eye, look: () => statueEye(who, pose, 1).look, fov: STATUE_FOV, to: { eye: () => statueEye(who, pose, 0.88).eye }, ease: 'out', sway: 0.01 }
}
/** The same camera, still, for QA (?statue=): a tall screen backs off the way the film does. */
function statueShotAt(who: FilmActor, pose: StatueId, tall: boolean) {
  const { eye, look } = statueEye(who, pose, 0.94)
  if (tall) eye.sub(look).multiplyScalar(1.55).add(look)
  return { eye, look, fov: STATUE_FOV }
}

/** The silly face each pose pulls (characters/statues.ts has them; the close-up needs to know which). */
function faceOf(p: StatueId) {
  return p === 'tree' || p === 'ballerina' ? 'dazzled' : p === 'flamingo' ? 'dizzy' : 'crossed'
}

/** A soft round shadow under someone, that goes where they go. */
function shadowUnder(a: FilmActor, bag: Bag) {
  a.root.add(blobShadow(a.height * 0.38, bag))
}

/** Maple's shadow bunny on the bush: a round head, two tall ears, a little nose (her paws in the light). */
function shadowBunny(bag: Bag) {
  const geo = merge([
    P.sphere(0.16, '#ffffff', { scale: [1.15, 0.95, 0.05] }, 16),
    P.sphere(0.07, '#ffffff', { at: [-0.07, 0.22, 0], rot: [0, 0, 0.25], scale: [0.6, 1.9, 0.05] }, 12),
    P.sphere(0.07, '#ffffff', { at: [0.08, 0.23, 0], rot: [0, 0, -0.15], scale: [0.6, 2.0, 0.05] }, 12),
    P.sphere(0.06, '#ffffff', { at: [0.17, -0.04, 0], scale: [1, 0.8, 0.05] }, 10),
  ])
  const m = new Mesh(bag.add(geo), bag.add(new MeshBasicMaterial({ color: '#120E28', transparent: true, opacity: 0, depthWrite: false, fog: false })))
  m.renderOrder = 3
  m.visible = false
  return m
}

/** Two shining eyes in the dark of Roxy's den (she's in there). */
function denEyes(bag: Bag) {
  const g = new Group()
  const mat = bag.add(new MeshBasicMaterial({ color: '#E8F06A', fog: false }))
  for (const s of [-1, 1]) {
    const e = new Mesh(bag.add(P.sphere(0.04, '#fff', { scale: [1, 1.15, 0.4] }, 12)), mat)
    e.position.set(s * 0.075, 0, 0)
    g.add(e)
  }
  return g
}

/** Monty's sunglasses: two round pink-framed lenses on his eyes. */
function sunglasses(a: FilmActor, bag: Bag) {
  const r = a.rig
  const g = new Group()
  const box = new Vector3()
  r.eyes.traverse((o) => {
    const geo = (o as Mesh).geometry
    if (!geo) return
    geo.computeBoundingBox()
    if (geo.boundingBox) box.max(geo.boundingBox.max)
  })
  const ex = Math.max(0.05, box.x * 0.8)
  const rr = ex * 0.62
  const lens = (s: number) => P.cyl(rr, rr, 0.02, '#2B2340', { at: [s * ex, 0, box.z + 0.015], rot: [Math.PI / 2, 0, 0] }, 18)
  const frame = (s: number) => P.torus(rr, rr * 0.16, '#FF6FA6', { at: [s * ex, 0, box.z + 0.02] })
  const geo = merge([lens(-1), lens(1), frame(-1), frame(1), P.capsule(rr * 0.12, ex * 0.5, '#FF6FA6', { at: [0, rr * 0.2, box.z + 0.03], rot: [0, 0, Math.PI / 2] }), P.sphere(rr * 0.2, '#FFFFFF', { at: [-ex + rr * 0.35, rr * 0.35, box.z + 0.035], scale: [1, 1, 0.3] }), P.sphere(rr * 0.2, '#FFFFFF', { at: [ex + rr * 0.35, rr * 0.35, box.z + 0.035], scale: [1, 1, 0.3] })])
  const mesh = new Mesh(bag.add(geo), bag.add(new MeshBasicMaterial({ vertexColors: true })))
  g.add(mesh)
  g.position.copy(r.eyes.position)
  r.eyes.parent?.add(g)
  g.visible = false
  return g
}
