// Snorkeling at Ko Kudi (plan: planning/around-the-world/thailand/samet-trip.md, greybox 5), its own little world
// out at the reef the snorkel boat goes to from Ao Wong Duan.
//
// The toy (core verb): her finger leads Kaylee through the water, the island's verb again. She floats face down on the
// surface in her pink mask, flippers kicking; hold the finger near her and she paddles, hold it far ahead and she kicks
// fast, bubbles streaming; tap a spot and she swims there. The camera is half under the water, half above: one camera
// just over the surface, drawn twice (render()): above the waterline the sky, the boat, Ko Kudi on the horizon and the
// sea's top; below it the same view with the sea's top taken away and the water's blue fog, sunbeams slanting down,
// the reef. The line between them is where the surface is at her distance, so it runs right through her.
// The verb deepens three times (`round`), moving on by itself:
//   float   the captain toots, she splashes in off the ladder. A crowd of blue damselfish swirls round her, parting where
//           she swims and closing behind. Coral sways; coral heads come up near the surface (bump one: a little fish
//           pops out and tells her off with bubbles; the prickly ones with urchins boing her off like a bouncy ball).
//   follow  a big rainbow parrotfish swims up and waits for her to follow: past the coral heads, through the gap between
//           two rocks, over the sandy patch (a giant clam, a sea cucumber), into a hidden garden of soft corals. It goes
//           a little ahead and waits; never too fast, and it comes back for her if she wanders off.
//   cuttle  in the garden a cuttlefish hovers, sand-colored. Swim close and it flashes rainbow colors, closer and it
//           goes stripy, closest and it turns pink (for her). Mommy's waterproof camera (the 📷 button) snaps the fish for
//           her book.
// Daddy swims along behind her; swim up to him and he ducks under and blows her a bubble ring.
//
// Talk (lines.ts L.samet.snorkel): the captain sends her in, Sparkle says what each round is for, the facts the first
// time and (spendHint) what to do when she's stuck; Daddy and the captain react. The screen's TripGuide plays them. Every number that decides the feel is a knob (?feel=1), with a graph of her finger against her swimming.
import { Color, Fog, Group, InstancedMesh, Matrix4, Mesh, Object3D, Quaternion, Scene, Vector3, type WebGLRenderer } from 'three'
import { clamp, spendHint, type Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { FaceLife } from '../../../../../engine3d/characters/face'
import { knobs, watch } from '../../../../../kit/knobs'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import type { AnimalId } from '../book/animals'
import { cuttlefishModel, damselSchool, parrotfishModel, type Model } from '../book/models'
import { bed, bedHeight, BOAT, boat, bommie, BOUNDS, bubbleRing, clam, CLAM, coralPatch, cucumber, CUCUMBER, DADDY, flipper, GARDEN, hideFish, koKudi, mask, OBSTACLES, rock, ROUTE, SANDY, seaTop, softCoral, START, sunbeams, type XZ } from './reef'
import { reefBed, reefSfx as sfx } from './sounds'

const FILE = 'src/world/places/thailand/activities/samet-trip/snorkel/snorkel.ts'
/** Her swimming. */
const SWIM = knobs('snorkelSwim', 'Swimming (her finger leads her)', FILE, {
  slow: { value: 0.9, min: 0.2, max: 3, step: 0.05, label: 'Paddles at', unit: 'm/s', note: 'her finger just ahead of her' },
  fast: { value: 2.6, min: 0.8, max: 6, step: 0.05, label: 'Kicks fast at', unit: 'm/s', note: 'her finger far ahead' },
  near: { value: 0.6, min: 0, max: 3, step: 0.05, label: 'Finger this close: she floats', unit: 'm', note: 'a dead zone round her' },
  far: { value: 6, min: 1, max: 15, step: 0.1, label: 'Full speed from', unit: 'm', note: 'how far ahead her finger must point for the fast kick' },
  under: { value: 1, min: 0.2, max: 2.6, step: 0.05, label: 'Under the line, her finger points', unit: 'm deep', note: 'a finger in the underwater part points at this depth (where the fish swim): on a fish = swim to it' },
  accel: { value: 2.6, min: 0.5, max: 10, step: 0.1, label: 'Gets going', unit: '/s', note: 'how quickly she reaches the speed her finger asks' },
  glide: { value: 0.9, min: 0.1, max: 5, step: 0.05, label: 'Glides to a stop', unit: '/s', note: 'the water slowing her when her finger lets go (lower = longer glide)' },
  turn: { value: 5, min: 1, max: 15, step: 0.5, label: 'Turns', unit: '/s' },
  kick: { value: 1.5, min: 0.5, max: 3, step: 0.05, label: 'Kicks per speed', unit: '×', note: 'how fast her legs go for how fast she swims' },
  body: { value: 0.45, min: 0.2, max: 0.9, step: 0.01, label: 'Bumps from', unit: 'm', note: 'her size for bumping into the coral and the rocks' },
  reach: { value: 0.85, min: 0.3, max: 1.5, step: 0.01, label: 'Keeps off the boat by', unit: 'm', note: 'her arms and floaties reach out sideways: the hull stays this far from her middle' },
  boing: { value: 3.2, min: 1, max: 7, step: 0.1, label: 'An urchin boings her', unit: 'm/s' },
  bump: { value: 1.6, min: 1, max: 2.5, step: 0.05, label: 'Coral bounces her', unit: '×', note: '1 = she just stops, 2 = she bounces straight back' },
  float: { value: -0.12, min: -0.5, max: 0.1, step: 0.01, label: 'Floats at', unit: 'm', note: 'her middle, against the surface' },
})
/** The fish. */
const FISH = knobs('snorkelFish', 'The fish', FILE, {
  part: { value: 1.5, min: 0.4, max: 3, step: 0.05, label: 'Damselfish part from her', unit: 'm' },
  push: { value: 3.2, min: 0.5, max: 8, step: 0.1, label: '…this fast', unit: 'm/s' },
  swirl: { value: 1.0, min: 0, max: 3, step: 0.05, label: 'The crowd swirls', unit: 'm/s' },
  size: { value: 1.8, min: 0.8, max: 5, step: 0.1, label: 'The crowd is', unit: 'm wide' },
  keep: { value: 1.3, min: 0.2, max: 4, step: 0.05, label: 'The crowd keeps up', unit: '/s', note: 'how closely the crowd follows her (low = it trails behind)' },
  speed: { value: 1.7, min: 0.5, max: 4, step: 0.05, label: 'The parrotfish swims', unit: 'm/s' },
  near: { value: 3.4, min: 1, max: 8, step: 0.1, label: '…on when she’s within', unit: 'm', note: 'closer than this and it swims on to its next spot; further and it waits' },
  waitFor: { value: 5, min: 1, max: 20, step: 0.5, label: '…comes back to fetch her after', unit: 's', note: 'waiting this long without her coming closer' },
  back: { value: 11, min: 5, max: 25, step: 0.5, label: '…comes back for her past', unit: 'm' },
  flash: { value: 5.5, min: 2, max: 10, step: 0.1, label: 'Cuttlefish shows its colors at', unit: 'm', note: 'further off it’s sand-colored (hiding)' },
  pink: { value: 2.0, min: 0.6, max: 5, step: 0.1, label: '…she reaches it at', unit: 'm', note: 'a new color each time (rainbow, stripes, pink); the first two times it jets off to hide again' },
  jet: { value: 1.1, min: 0.3, max: 3, step: 0.05, label: '…jets off in', unit: 's' },
  shy: { value: 0.4, min: 0, max: 2, step: 0.05, label: 'The last time it backs away at', unit: 'm/s', note: 'slower than her paddle, so she catches it' },
  glint: { value: 14, min: 4, max: 60, step: 1, label: 'Stuck: it glints after', unit: 's', note: 'a rainbow flash where it hides, and again every 5 s' },
  comes: { value: 24, min: 8, max: 90, step: 1, label: 'Stuck: it swims to her after', unit: 's' },
})
/** Where the cuttlefish hides each time (it jets from one to the next): the garden's middle, then further each time. */
/** The boat's hull for bumping: half its width, and half the length of its straight middle (reef.ts boat()). */
const HULL = { r: 0.92, len: 2.7 }
const CUTTLE_SPOTS: XZ[] = [GARDEN, { x: GARDEN.x - 4.5, z: GARDEN.z - 4.5 }, { x: GARDEN.x + 6.5, z: GARDEN.z - 5 }]
/** The rounds and the camera. */
const PLAY = knobs('snorkelPlay', 'Rounds and the half-under camera', FILE, {
  float: { value: 28, min: 5, max: 120, step: 1, label: 'Swim before the parrotfish', unit: 'm' },
  floatMin: { value: 25, min: 0, max: 120, step: 1, label: '…and at least', unit: 's', note: 'time to just float and look, however fast she swims' },
  floatFor: { value: 60, min: 10, max: 180, step: 5, label: '…or after', unit: 's' },
  dist: { value: 6.2, min: 3, max: 14, step: 0.1, label: 'Camera behind her', unit: 'm' },
  tallDist: { value: 7.6, min: 3, max: 16, step: 0.1, label: '…on a tall screen', unit: 'm' },
  height: { value: 0.75, min: 0.05, max: 3, step: 0.05, label: 'Camera over the water', unit: 'm', note: 'lower = the waterline sits higher on the screen' },
  pitch: { value: 12, min: -5, max: 45, step: 1, label: 'Camera looks down', unit: '°' },
  tallPitch: { value: 6, min: -10, max: 30, step: 1, label: '…more on a tall screen', unit: '°' },
  ahead: { value: 1.6, min: -2, max: 6, step: 0.1, label: 'Looks ahead of her', unit: 'm' },
  fog: { value: 17, min: 6, max: 60, step: 1, label: 'See this far under water', unit: 'm' },
})

export type SnorkelRound = 'float' | 'follow' | 'cuttle'
export const SNORKEL_ROUND_IDS: SnorkelRound[] = ['float', 'follow', 'cuttle']
export interface SnorkelStart {
  round: SnorkelRound
}
export interface SnorkelEvents {
  /** A new round began (the address bar follows). */
  round(r: SnorkelRound): void
  /** The cuttlefish turned pink for her (the stop is done: the way back shows). */
  done(): void
  /** Someone talks (`mute`: a stuck hint shown without its voice). */
  say(line: Line, mute?: boolean): void
}

const S = L.samet.snorkel

const HINT_S = 8
const DEG = 180 / Math.PI
const CROWD = 90
const GARDEN_FISH = 26
const tmp = new Vector3()
const tmp2 = new Vector3()
const up = new Vector3(0, 1, 0)
const fwd = new Vector3(0, 0, 1)
const m4 = new Matrix4()
const q = new Quaternion()
const dummy = new Object3D()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const bellK = (k: number) => Math.sin(Math.PI * clamp(k, 0, 1))
const angleTo = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from))

// ---- Sounds: sounds.ts (recorded, with the synthesized ones as fallbacks).
const { blub, kick: kickSnd, toot, twinkle, shutter, thud, prickle, clam: clamSnd } = sfx

const URCHINS = OBSTACLES.map((o, i) => ({ o, i })).filter((x) => x.o.kind === 'urchin')
const CORALS = OBSTACLES.map((o, i) => ({ o, i })).filter((x) => x.o.kind === 'coral')

export const SNORKEL_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'You', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'captain', label: 'The boat captain', kind: 'thing' },
  { id: 'parrot', label: 'The parrotfish', kind: 'thing' },
  { id: 'cuttle', label: 'The cuttlefish', kind: 'thing' },
  { id: 'clam', label: 'A giant clam', kind: 'thing' },
  { id: 'cucumber', label: 'A sea cucumber', kind: 'thing' },
  ...URCHINS.map((_, k) => ({ id: `urchin:${k}`, label: 'Sea urchins', kind: 'thing' as const })),
  ...CORALS.map((_, k) => ({ id: `coral:${k}`, label: 'A coral head', kind: 'thing' as const })),
]

interface Peeker {
  fish: Group
  at: Vector3
  t: number
}

export class Snorkel implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private lineEl: HTMLElement | null = null
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private round: SnorkelRound
  private roundT = 0
  /** The waterline on screen (CSS px from the top). */
  private split = 0
  private airFog = new Fog('#CDEFFA', 120, 700)
  private waterFog = new Fog('#2EA9BA', 0, 26)
  private sky = new Color('#BFE9FA')
  private deep = new Color('#1F8EA5')

  // ---- Kaylee: a holder at her middle (her heading), tipped face down, her toy inside.
  private kaylee: Avatar
  private holder = new Group()
  private tilt = new Group()
  private pos = new Vector3(START.x, 0, START.z)
  private vel = new Vector3()
  private heading = Math.PI
  private roll = 0
  private spin = -1
  private tiltK = 1
  private intro = -1
  private swam = 0
  private bumpT = 0

  // ---- Her finger.
  private finger: { x: number; y: number; id?: string; moved: boolean; lead: boolean } | null = null
  private goal: XZ | null = null
  private lastTouch = 0
  private lead = 0
  private kickT = 0

  // ---- The others.
  private nick: Member
  private dad = { x: DADDY.x, z: DADDY.z, dip: -1, cool: 0, ring: null as null | { t: number; x: number; z: number; dx: number; dz: number } }
  private ring: Mesh
  private boat: ReturnType<typeof boat>
  private wave = -1
  private parrot: Model
  private pState: 'away' | 'arrive' | 'lead' | 'home' = 'away'
  private pi = 0
  private pPos = new Vector3(-14, -0.9, -6)
  private pYaw = 0
  private pSpeed = 0
  private pMeet: XZ = { x: 0, z: 0 }
  private pWait = 0
  private pWiggle = 0
  private cuttle: Model & { mat: import('three').MeshToonMaterial }
  private cPos = new Vector3(GARDEN.x, -1.15, GARDEN.z)
  /** Its color now (0 sand, 1 rainbow, 2 stripes, 3 pink) and how many times she has reached it (3 = done). */
  private stage = 0
  private best = 0
  /** Since it last settled to hide (the stuck clock), and its jet to the next hiding place. */
  private lapT = 0
  private glintT = 0
  private jet: { from: Vector3; to: Vector3; t: number; wait: number } | null = null
  private flashT = -1
  private doneAt = -1
  /** The captain's face (her beak opens with her voice). */
  private capFace: FaceLife
  private said = new Set<string>()
  private turn = { dad: 0, captain: 0 }
  private hintOn = false
  private crowd: InstancedMesh
  private cPts: Float32Array
  private cVel: Float32Array
  private cHome: { r: number; y: number; dir: number; ph: number }[] = []
  private crowdC = new Vector3()
  private garden: InstancedMesh
  private gHome: { r: number; y: number; ph: number; s: number }[] = []
  private soft: ReturnType<typeof softCoral>[] = []
  private urchins: { o: (typeof OBSTACLES)[number]; models: Model[]; wob: number }[] = []
  private peekers: Peeker[] = []
  private clam: ReturnType<typeof clam>
  private clamT = -1
  private cuc: ReturnType<typeof cucumber>
  private cucT = -1
  private beams: ReturnType<typeof sunbeams>
  private sea: Mesh
  /** Everything under the water (the air pass skips it: the sea's top hides it anyway). */
  private under = new Group()
  private bubbles: Particles
  private foam: Particles
  private spray: Particles
  private sparkle: Particles
  private patches: { root: Group; at: Vector3 }[] = []
  private counts = { leads: 0, taps: 0, pokes: 0, kicks: 0, bumps: 0, boings: 0, rings: 0, peeks: 0, snaps: 0, stages: 0, glints: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: SnorkelStart,
    private events: SnorkelEvents,
  ) {
    const { scene, bag } = this
    scene.fog = this.airFog
    applyBands()
    this.rig.fov = 50
    this.rig.lag = 0.3
    this.rig.camera.far = 1200
    this.round = start.round
    bag.add({ dispose: reefBed() })

    // ---- The sea, the bed, Ko Kudi on the horizon, sunbeams.
    this.sea = seaTop(bag)
    scene.add(this.sea, koKudi(bag), this.under)
    this.under.add(bed(bag))
    this.beams = sunbeams(bag)
    this.under.add(this.beams.root)

    // ---- The reef: coral patches over the bed (not on the sand), coral heads, rocks, soft corals and the garden.
    const R = mulberry(7)
    for (let i = 0; i < 46; i++) {
      const x = (R() - 0.5) * 24
      const z = 5 - R() * 46
      if (Math.hypot(x - SANDY.x, z - SANDY.z) < SANDY.r || Math.hypot(x - GARDEN.x, z - GARDEN.z) < 3.2) continue
      if (OBSTACLES.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.8)) continue
      const p = coralPatch(bag, x, z, 1.5 + R() * 1.2, i + 2)
      this.under.add(p.root)
      this.patches.push({ root: p.root, at: p.root.position.clone() })
    }
    OBSTACLES.forEach((o, i) => {
      if (o.kind === 'rock') scene.add(rock(bag, o, i))
      else if (o.kind === 'coral' || o.kind === 'urchin') {
        const b = bommie(bag, o, i)
        this.under.add(b.root)
        if (o.kind === 'urchin') this.urchins.push({ o, models: b.urchins, wob: 0 })
        else {
          const fish = hideFish(bag)
          fish.visible = false
          this.under.add(fish)
          this.peekers.push({ fish, at: new Vector3(o.x, o.top - 0.25, o.z), t: -1 })
        }
      }
    })
    for (let i = 0; i < 22; i++) {
      const x = (R() - 0.5) * 22
      const z = 3 - R() * 40
      if (Math.hypot(x - SANDY.x, z - SANDY.z) < SANDY.r) continue
      const s = softCoral(bag, x, z, 0.7 + R() * 0.4, i)
      this.under.add(s.root)
      this.soft.push(s)
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      const r = 3.6 + (i % 2) * 1.0
      const s = softCoral(bag, GARDEN.x + Math.cos(a) * r, GARDEN.z + Math.sin(a) * r, 0.85 + (i % 3) * 0.15, i + 3)
      this.under.add(s.root)
      this.soft.push(s)
    }
    this.clam = clam(bag)
    this.clam.root.position.set(CLAM.x, bedHeight(CLAM.x, CLAM.z), CLAM.z)
    this.clam.root.scale.setScalar(1.3)
    this.cuc = cucumber(bag)
    this.cuc.root.position.set(CUCUMBER.x, bedHeight(CUCUMBER.x, CUCUMBER.z), CUCUMBER.z)
    this.cuc.root.rotation.y = 0.7
    this.cuc.root.scale.setScalar(1.4)
    this.under.add(this.clam.root, this.cuc.root)

    // ---- The boat and its captain.
    this.boat = boat(bag)
    this.boat.root.position.set(BOAT.x, 0, BOAT.z)
    scene.add(this.boat.root)

    // ---- Kaylee, face down in her mask and flippers.
    this.kaylee = new Avatar(bag)
    this.kaylee.place(0, 0, 0, 0)
    const rigK = this.kaylee.rig
    const shift = new Group()
    shift.position.y = -this.kaylee.height * 0.42
    shift.add(this.kaylee.root)
    this.tilt.add(shift)
    this.holder.add(this.tilt)
    scene.add(this.holder)
    rigK.head.add(mask(bag, rigK.face.R, rigK.face.headY))
    for (const leg of [rigK.legL, rigK.legR]) if (leg) leg.add(flipper(bag, this.kaylee.height * 0.24))

    // ---- Daddy, treading water behind her.
    this.nick = new Member({ ...FAMILY.find((m) => m.id === 'nick')!, spot: null }, bag)
    scene.add(this.nick.root)
    this.ring = bubbleRing(bag)
    this.under.add(this.ring)

    // ---- The fish: the damselfish crowd, the garden's little fish, the parrotfish, the cuttlefish.
    this.crowd = damselSchool(bag, CROWD)
    this.cPts = new Float32Array(CROWD * 3)
    this.cVel = new Float32Array(CROWD * 3)
    for (let i = 0; i < CROWD; i++) {
      const home = { r: 0.35 + R() * 0.75, y: (R() - 0.5) * 1.1, dir: R() < 0.85 ? 1 : -1, ph: R() * Math.PI * 2 }
      this.cHome.push(home)
    }
    this.under.add(this.crowd)
    this.garden = damselSchool(bag, GARDEN_FISH)
    const gold = new Color('#FFD34D')
    const orange = new Color('#FF9A4D')
    const pinkC = new Color('#FF8FC7')
    for (let i = 0; i < GARDEN_FISH; i++) {
      this.garden.setColorAt(i, [gold, orange, pinkC][i % 3])
      this.gHome.push({ r: 1.2 + R() * 3.2, y: -0.9 - R() * 1.3, ph: R() * Math.PI * 2, s: (0.3 + R() * 0.4) * (R() < 0.5 ? 1 : -1) })
    }
    this.under.add(this.garden)
    this.parrot = parrotfishModel(bag)
    this.parrot.root.scale.setScalar(2.6)
    this.parrot.root.visible = false
    this.under.add(this.parrot.root)
    this.cuttle = cuttlefishModel(bag)
    this.cuttle.root.scale.setScalar(3)
    this.under.add(this.cuttle.root)

    this.bubbles = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#E6FBFF', '#BDF1FF'], gravity: -2.2 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 140, opacity: 0.9 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 160, colors: ['#FFFFFF', '#EAFBFF', '#C9F6EC'], gravity: 9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 200, colors: ['#FFFFFF', '#FFF6B8', '#C9F4FF', PAL.gold, PAL.pink, PAL.hotpink], gravity: -0.5 }, bag)
    this.under.add(this.bubbles.mesh, this.sparkle.mesh)
    scene.add(this.foam.mesh, this.spray.mesh)

    // ---- Where the link starts: as if she had played to here.
    if (this.round === 'float') {
      this.intro = 0
      this.tiltK = 0
      this.pos.set(BOAT.x - 1.1, 0.62 + this.kaylee.height * 0.42, BOAT.z - 0.4)
      this.heading = -Math.PI / 2
    } else if (this.round === 'follow') {
      this.pos.set(0.4, 0, -3)
      this.swam = PLAY.float
      this.startFollow()
    } else {
      this.pos.set(GARDEN.x + 1.5, 0, GARDEN.z + 6)
      this.pState = 'home'
      this.pPos.set(GARDEN.x + 1, -0.9, GARDEN.z + 2.5)
      this.parrot.root.visible = true
    }
    this.dad.x = this.pos.x - 2.4
    this.dad.z = this.pos.z + 2
    if (this.round === 'float') {
      this.dad.x = DADDY.x
      this.dad.z = DADDY.z
    }
    this.crowdC.set(this.pos.x, -1.1, this.pos.z)
    for (let i = 0; i < CROWD; i++) {
      const h = this.cHome[i]
      const a = h.ph
      this.cPts.set([this.crowdC.x + Math.cos(a) * h.r * FISH.size, -1.1 + h.y, this.crowdC.z + Math.sin(a) * h.r * FISH.size], i * 3)
    }
    this.placeKaylee(0)

    this.capFace = new FaceLife(this.boat.rig, 'pelican')

    this.unwatch = watch('snorkel', () => ({
      'her finger is ahead (m)': [this.lead, 15],
      'she swims (m/s)': [this.vel.length(), 4],
      'parrotfish ahead (m)': [this.pState === 'lead' ? Math.hypot(this.pPos.x - this.pos.x, this.pPos.z - this.pos.z) : 0, 14],
    }))
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
  setWaterlineElement(el: HTMLElement | null) {
    this.lineEl = el
  }
  get calm() {
    return false
  }

  setRound(r: SnorkelRound) {
    if (r === this.round) return
    this.round = r
    this.roundT = 0
    this.events.round(r)
    this.once(r, S[r])
    if (r === 'follow') this.startFollow()
    if (r === 'cuttle') twinkle(4)
  }
  private startFollow() {
    if (this.pState !== 'away') return
    this.pState = 'arrive'
    this.pi = 0
    this.pMeet = { x: this.pos.x * 0.5, z: this.pos.z - 3 }
    this.pPos.set(this.pos.x - 9, -0.9, this.pos.z - 4)
    this.parrot.root.visible = true
    sfx.fishIn()
  }

  /** Says it once a visit to the reef. */
  private once(key: string, l: Line) {
    if (this.said.has(key)) return
    this.said.add(key)
    this.events.say(l)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.roundT += dt
    // Her first moment here: the captain sends her in (off the ladder), then what this round is for.
    if (this.time > 0.3 && !this.said.has('hi')) {
      this.said.add('hi')
      if (this.round === 'float') this.events.say(S.jump)
      this.once(this.round, S[this.round])
    }
    this.progress()
    this.swim(dt)
    this.daddy(dt, t)
    this.fish(dt, t)
    this.reef(dt, t)
    for (const p of [this.bubbles, this.foam, this.spray, this.sparkle]) p.update(dt)
    this.lights.follow(this.pos.x, 0, this.pos.z)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.rig.camera.updateMatrixWorld()
    this.waterline(t)
    this.drawHint(t)
  }

  private progress() {
    if (this.round === 'float' && this.intro < 0 && ((this.swam >= PLAY.float && this.roundT >= PLAY.floatMin) || this.roundT >= PLAY.floatFor)) this.setRound('follow')
    else if (this.round === 'follow' && this.pState === 'home') this.setRound('cuttle')
    if (this.best >= 3 && this.doneAt < 0) {
      this.doneAt = this.time
      window.setTimeout(() => this.events.done(), 1800)
    }
  }

  // ---------------------------------------------------------------- her swimming

  /** Her heading as a ground vector. */
  private forward(out = tmp2) {
    return out.set(Math.sin(this.heading), 0, Math.cos(this.heading))
  }
  private toScreen(v: Vector3) {
    const p = tmp.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** Where her finger points in the water: on the surface above the waterline, at the fish's depth below it (a finger
   *  on a fish ahead of her means swim to that fish, though under the water it shows below her on the screen). The
   *  way from her there, and how far (m). */
  private fingerWay(x: number, y: number) {
    const cam = this.rig.camera
    const dir = tmp.set((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize()
    const plane = y < this.split ? 0 : -SWIM.under
    let px: number
    let pz: number
    const down = cam.position.y - plane
    if (dir.y < -1e-3 && down > 0 && down / -dir.y < 30) {
      const t = down / -dir.y
      px = cam.position.x + dir.x * t
      pz = cam.position.z + dir.z * t
    } else {
      // Up at the sky (or near the horizon): far ahead that way.
      const l = Math.hypot(dir.x, dir.z) || 1
      px = cam.position.x + (dir.x / l) * 30
      pz = cam.position.z + (dir.z / l) * 30
    }
    const dx = px - this.pos.x
    const dz = pz - this.pos.z
    const d = Math.hypot(dx, dz) || 1e-3
    return { x: dx / d, z: dz / d, d, px, pz }
  }

  private swim(dt: number) {
    const k = this.kaylee
    // The splash in off the ladder.
    if (this.intro >= 0) {
      const i = (this.intro += dt)
      if (i >= 0.2 && i - dt < 0.2) toot()
      const jump = clamp((i - 0.6) / 0.8)
      const from = { x: BOAT.x - 1.1, y: 0.62 + k.height * 0.42, z: BOAT.z - 0.4 }
      this.pos.set(from.x + (START.x - from.x) * jump, from.y + (SWIM.float - from.y) * jump + bellK(jump) * 0.9, from.z + (START.z - from.z) * jump)
      this.tiltK = clamp((i - 1.0) / 0.6)
      if (jump >= 1 && i - dt < 1.4) this.splashIn()
      if (i > 1.8) {
        this.intro = -1
        this.tiltK = 1
      }
      k.steer(0, 0, 0, () => true)
      this.placeKaylee(dt)
      return
    }

    // What her finger asks: a way to go and how hard.
    let want = 0
    let wx = 0
    let wz = 0
    this.lead = 0
    const f = this.finger
    if (f && f.lead) {
      const way = this.fingerWay(f.x, f.y)
      this.lead = way.d
      if (way.d > SWIM.near) {
        want = SWIM.slow + (SWIM.fast - SWIM.slow) * clamp((way.d - SWIM.near) / Math.max(0.01, SWIM.far - SWIM.near))
        wx = way.x
        wz = way.z
      }
    } else if (this.goal) {
      const dx = this.goal.x - this.pos.x
      const dz = this.goal.z - this.pos.z
      const d = Math.hypot(dx, dz)
      if (d < 0.4) this.goal = null
      else {
        want = Math.min(SWIM.fast * 0.7, SWIM.slow + d * 0.35)
        wx = dx / d
        wz = dz / d
      }
    }
    const v = this.vel
    if (want > 0) {
      v.x += (wx * want - v.x) * ease(dt, SWIM.accel)
      v.z += (wz * want - v.z) * ease(dt, SWIM.accel)
    } else v.multiplyScalar(1 - ease(dt, SWIM.glide))
    this.pos.x += v.x * dt
    this.pos.z += v.z * dt
    this.collide(dt)
    const speed = v.length()
    this.swam += speed * dt
    if (speed > 0.15) this.heading += angleTo(this.heading, Math.atan2(v.x, v.z)) * ease(dt, SWIM.turn)

    // Kicking: her legs (the toy's walk) go with her speed; fast kicks stream bubbles and splash at her feet.
    k.steer(0, 1, clamp((speed / 1.8) * SWIM.kick, 0.12, 1), () => true)
    const fw = this.forward()
    if (speed > 0.4) {
      sfx.swim(speed)
      const rate = speed * 9
      if (Math.random() < dt * rate) {
        const bx = this.pos.x - fw.x * 0.75
        const bz = this.pos.z - fw.z * 0.75
        this.bubbles.emit(bx + (Math.random() - 0.5) * 0.3, -0.35 - Math.random() * 0.3, bz + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.3, 0.4 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3, 1.4, 0.05 + Math.random() * 0.06)
        if (speed > 1.5 && Math.random() < 0.5) this.foam.emit(bx, 0.02, bz, -fw.x * 0.3, 0, -fw.z * 0.3, 0.9, 0.18 + Math.random() * 0.15)
      }
      if ((this.kickT -= dt) <= 0) {
        this.kickT = clamp(0.9 - speed * 0.22, 0.25, 0.9)
        kickSnd()
        this.counts.kicks++
        if (speed > 1.6) this.spray.burst(this.pos.x - fw.x * 0.7, 0.05, this.pos.z - fw.z * 0.7, 3, 1.2, 1.8, 0.06)
      }
    }
    this.placeKaylee(dt)
  }

  private placeKaylee(dt: number) {
    const k = this.kaylee
    const t = this.time
    // Face down (tilted from standing, so the splash in turns her over), bobbing on the swell.
    this.tilt.rotation.x = (Math.PI / 2) * 0.86 * this.tiltK
    const speed = this.vel.length()
    this.roll += (Math.sin(t * 5.5) * 0.08 * clamp(speed) - this.roll) * ease(dt, 6)
    let spin = 0
    if (this.spin >= 0) {
      this.spin += dt / 0.7
      spin = Math.PI * 2 * (this.spin * this.spin * (3 - 2 * this.spin))
      if (this.spin >= 1) this.spin = -1
    }
    this.holder.position.set(this.pos.x, this.intro >= 0 ? this.pos.y : SWIM.float + Math.sin(t * 1.6) * 0.03, this.pos.z)
    this.holder.rotation.set(0, this.heading, 0)
    this.tilt.rotation.z = this.roll + spin
    k.update(dt, t)
    // The toy walks on the spot (its legs kick); the holder carries her.
    k.root.position.x = 0
    k.root.position.z = 0
  }

  private splashIn() {
    sfx.splash()
    this.foam.burst(START.x, 0.02, START.z, 16, 1.6, 0, 0.35)
    this.spray.burst(START.x, 0.1, START.z, 26, 2.2, 3.2, 0.09)
    for (let i = 0; i < 30; i++) this.bubbles.emit(START.x + (Math.random() - 0.5) * 0.8, -0.3 - Math.random() * 0.8, START.z + (Math.random() - 0.5) * 0.8, 0, 0.6, 0, 1.5, 0.06 + Math.random() * 0.06)
  }

  /** Coral heads, urchins, rocks, the boat and the reef's edge. */
  private collide(dt: number) {
    const p = this.pos
    const v = this.vel
    this.bumpT = Math.max(0, this.bumpT - dt)
    OBSTACLES.forEach((o, i) => {
      // (The boat is one long hull, below.)
      if (o.kind === 'boat') return
      const dx = p.x - o.x
      const dz = p.z - o.z
      const d = Math.hypot(dx, dz)
      const min = o.r + SWIM.body
      if (d >= min || d < 1e-4) return
      const nx = dx / d
      const nz = dz / d
      p.x = o.x + nx * min
      p.z = o.z + nz * min
      const vn = v.x * nx + v.z * nz
      if (vn >= 0) return
      if (o.kind === 'urchin') {
        // Boing! Off like a bouncy ball (never hurt), the urchins wiggle their spines.
        v.set(nx * SWIM.boing, 0, nz * SWIM.boing)
        this.goal = null
        if (this.bumpT <= 0) {
          this.bumpT = 0.5
          sfx.boing()
          prickle()
          this.spin = 0
          this.counts.boings++
          this.once('urchin', S.urchin)
          const u = this.urchins.find((x) => x.o === o)
          if (u) u.wob = 1
          this.bubbles.burst(p.x - nx * 0.4, -0.4, p.z - nz * 0.4, 10, 0.8, 0.6, 0.06)
        }
      } else if (o.kind === 'coral') {
        // A soft bump, and a little fish pops out to tell her off with bubbles.
        v.x -= nx * vn * SWIM.bump
        v.z -= nz * vn * SWIM.bump
        if (this.bumpT <= 0 && -vn > 0.3) {
          this.bumpT = 0.6
          thud()
          this.counts.bumps++
          this.once('coral', S.coral)
          this.peek(CORALS.findIndex((c) => c.i === i), true)
        }
      } else {
        // Rocks: she slides along them.
        v.x -= nx * vn
        v.z -= nz * vn
        if (this.bumpT <= 0 && -vn > 0.8) {
          this.bumpT = 0.5
          thud()
        }
      }
    })
    // The boat: its whole hull (a capsule along z), kept clear of her arms and floaties as well as her middle; she
    // slides along it.
    {
      const oz = clamp(p.z, BOAT.z - HULL.len, BOAT.z + HULL.len)
      const dx = p.x - BOAT.x
      const dz = p.z - oz
      const d = Math.hypot(dx, dz)
      const min = HULL.r + SWIM.reach
      if (d < min && d > 1e-4) {
        const nx = dx / d
        const nz = dz / d
        p.x = BOAT.x + nx * min
        p.z = oz + nz * min
        const vn = v.x * nx + v.z * nz
        if (vn < 0) {
          v.x -= nx * vn
          v.z -= nz * vn
          if (this.bumpT <= 0 && -vn > 0.8) {
            this.bumpT = 0.5
            thud()
          }
        }
      }
    }
    // The reef's edge: the water gently turns her back.
    const b = BOUNDS
    if (p.x < b.x0) v.x += (b.x0 - p.x) * 4 * dt
    if (p.x > b.x1) v.x -= (p.x - b.x1) * 4 * dt
    if (p.z < b.z0) v.z += (b.z0 - p.z) * 4 * dt
    if (p.z > b.z1) v.z -= (p.z - b.z1) * 4 * dt
  }

  // ---------------------------------------------------------------- Daddy

  private daddy(dt: number, t: number) {
    const d = this.dad
    const n = this.nick
    // He swims along beside her, a little behind (not in front of the camera), slower than her.
    if (this.intro < 0) {
      const tx = this.pos.x - 2.8
      const tz = this.pos.z + 0.6
      const dx = tx - d.x
      const dz = tz - d.z
      const dist = Math.hypot(dx, dz)
      if (dist > 16) {
        // Left far behind: he catches up out of sight.
        d.x = this.pos.x - 6
        d.z = this.pos.z + 0.5
      } else if (dist > 0.8) {
        const s = Math.min(2.4, dist * 0.7) * dt
        d.x += (dx / dist) * s
        d.z += (dz / dist) * s
      }
    }
    // Swim up to him: he ducks under and blows a bubble ring her way.
    d.cool = Math.max(0, d.cool - dt)
    const near = Math.hypot(this.pos.x - d.x, this.pos.z - d.z)
    if (near < 1.5 && d.cool <= 0 && this.intro < 0 && d.dip < 0) this.blowRing()
    let dip = 0
    if (d.dip >= 0) {
      d.dip += dt
      dip = bellK(d.dip / 1.4)
      if (d.dip > 0.45 && d.dip - dt <= 0.45) {
        const dx = this.pos.x - d.x
        const dz = this.pos.z - d.z
        const l = Math.hypot(dx, dz) || 1
        d.ring = { t: 0, x: d.x, z: d.z, dx: dx / l, dz: dz / l }
        sfx.ring()
      }
      if (d.dip > 1.4) d.dip = -1
    }
    n.place(d.x, -n.height * 0.66 - dip * 0.75 + Math.sin(t * 1.3) * 0.05, d.z, Math.atan2(this.pos.x - d.x, this.pos.z - d.z) * DEG)
    n.lookAt(this.pos.x, 0, this.pos.z)
    n.update(dt, t)
    const r = d.ring
    if (r) {
      r.t += dt
      const k = r.t / 2.6
      this.ring.visible = true
      this.ring.position.set(r.x + r.dx * r.t * 1.1, -0.95 + r.t * 0.25, r.z + r.dz * r.t * 1.1)
      this.ring.lookAt(this.ring.position.x + r.dx, this.ring.position.y, this.ring.position.z + r.dz)
      this.ring.scale.setScalar(1 + k * 1.6)
      ;(this.ring.material as import('three').MeshBasicMaterial).opacity = 0.75 * (1 - k)
      if (k >= 1) {
        d.ring = null
        this.ring.visible = false
      }
    }
  }
  private blowRing() {
    const d = this.dad
    if (d.dip >= 0) return
    d.dip = 0
    d.cool = 9
    this.counts.rings++
    this.once('ring', S.ring)
    this.bubbles.burst(d.x, -0.5, d.z, 8, 0.4, 0.8, 0.05)
  }

  // ---------------------------------------------------------------- the fish

  private fish(dt: number, t: number) {
    // ---- The damselfish crowd: it trails her, swirling round, parting round her body and closing behind.
    const c = this.crowdC
    const fw = this.forward()
    c.x += (this.pos.x + fw.x * 0.6 - c.x) * ease(dt, FISH.keep)
    c.z += (this.pos.z + fw.z * 0.6 - c.z) * ease(dt, FISH.keep)
    c.y = -1.15
    const her = tmp.set(this.pos.x, -0.35, this.pos.z)
    const P = this.cPts
    const V = this.cVel
    const size = FISH.size
    for (let i = 0; i < CROWD; i++) {
      const h = this.cHome[i]
      const o = i * 3
      const px = P[o]
      const py = P[o + 1]
      const pz = P[o + 2]
      const dx = px - c.x
      const dz = pz - c.z
      const r = Math.hypot(dx, dz) || 1e-3
      const R = h.r * size
      // Round and round (most one way), pulled to its own ring and height.
      let wx = (-dz / r) * FISH.swirl * h.dir + (-dx / r) * (r - R) * 1.4
      let wz = (dx / r) * FISH.swirl * h.dir + (-dz / r) * (r - R) * 1.4
      let wy = (c.y + h.y + Math.sin(t * 0.9 + h.ph) * 0.15 - py) * 1.6
      // Out of her way.
      const ex = px - her.x
      const ey = py - her.y
      const ez = pz - her.z
      const e = Math.hypot(ex, ey * 1.4, ez) || 1e-3
      if (e < FISH.part) {
        const k = ((FISH.part - e) / FISH.part) * FISH.push
        wx += (ex / e) * k
        wy += (ey / e) * k * 0.8
        wz += (ez / e) * k
      }
      const a = ease(dt, 3.2)
      V[o] += (wx - V[o]) * a
      V[o + 1] += (wy - V[o + 1]) * a
      V[o + 2] += (wz - V[o + 2]) * a
      P[o] = px + V[o] * dt
      P[o + 1] = Math.min(-0.25, py + V[o + 1] * dt)
      P[o + 2] = pz + V[o + 2] * dt
      dummy.position.set(P[o], P[o + 1], P[o + 2])
      tmp2.set(V[o], V[o + 1] * 0.4, V[o + 2])
      if (tmp2.lengthSq() > 1e-4) dummy.quaternion.setFromUnitVectors(fwd, tmp2.normalize())
      dummy.scale.set(1.05 + Math.sin(t * 16 + h.ph) * 0.1, 1.05, 1.05)
      dummy.updateMatrix()
      this.crowd.setMatrixAt(i, dummy.matrix)
    }
    this.crowd.instanceMatrix.needsUpdate = true

    // ---- The garden's little fish, round and round the soft corals.
    for (let i = 0; i < GARDEN_FISH; i++) {
      const g = this.gHome[i]
      const a = g.ph + t * g.s
      const x = GARDEN.x + Math.cos(a) * g.r
      const z = GARDEN.z + Math.sin(a) * g.r
      const y = g.y + Math.sin(t * 1.3 + g.ph) * 0.12
      m4.compose(tmp.set(x, y, z), q.setFromAxisAngle(up, -a + (g.s > 0 ? 0 : Math.PI)), tmp2.setScalar(1.6))
      this.garden.setMatrixAt(i, m4)
    }
    this.garden.instanceMatrix.needsUpdate = true

    this.parrotfish(dt, t)
    this.cuttlefish(dt, t)
  }

  private parrotfish(dt: number, t: number) {
    const p = this.pPos
    if (this.pState === 'away') return
    const her = this.pos
    const dHer = Math.hypot(p.x - her.x, p.z - her.z)
    let tx = p.x
    let tz = p.z
    let go = 0
    if (this.pState === 'arrive') {
      // Up to a spot just down the reef from where she was, to say hello (she may swim to meet it).
      tx = this.pMeet.x
      tz = this.pMeet.z
      go = FISH.speed * 1.4
      if (Math.hypot(tx - p.x, tz - p.z) < 0.7 || dHer < FISH.near * 0.7) {
        this.pState = 'lead'
        // From the first spot still ahead of her along the reef (she may already be well down it).
        const ahead = ROUTE.findIndex((w) => w.z < her.z - 2)
        this.pi = ahead < 0 ? ROUTE.length - 1 : ahead
        this.pWiggle = 1
        sfx.fishGo()
      }
    } else if (this.pState === 'lead') {
      const wp = ROUTE[this.pi]
      if (dHer >= FISH.near) this.pWait += dt
      else this.pWait = 0
      if (dHer > FISH.back || this.pWait > FISH.waitFor) {
        // She wandered off, or hasn't come for a while: it comes back up to her (then leads on again).
        if (dHer < FISH.near * 0.7) this.pWait = 0
        tx = her.x + ((p.x - her.x) / dHer) * 2.5
        tz = her.z + ((p.z - her.z) / dHer) * 2.5
        go = FISH.speed
      } else if (dHer < FISH.near) {
        tx = wp.x
        tz = wp.z
        go = FISH.speed
        if (Math.hypot(wp.x - p.x, wp.z - p.z) < 0.6) {
          this.pi++
          if (this.pi >= ROUTE.length) {
            this.pState = 'home'
            twinkle(3)
          }
        }
      }
    } else {
      // Home in the garden: round and round, just above the soft corals.
      const a = t * 0.35
      tx = GARDEN.x + Math.cos(a) * 2.6
      tz = GARDEN.z + Math.sin(a) * 2.6
      go = FISH.speed * 0.6
    }
    const dx = tx - p.x
    const dz = tz - p.z
    const d = Math.hypot(dx, dz)
    this.pSpeed += ((d > 0.3 ? go : 0) - this.pSpeed) * ease(dt, 2.5)
    if (d > 1e-3) {
      const s = Math.min(d, this.pSpeed * dt)
      p.x += (dx / d) * s
      p.z += (dz / d) * s
    }
    // Facing where it swims, or back at her while it waits (a little wiggle: come on!).
    const waiting = this.pSpeed < 0.25 && this.pState === 'lead'
    const face = waiting ? Math.atan2(her.x - p.x, her.z - p.z) : d > 0.05 ? Math.atan2(dx, dz) : this.pYaw
    this.pYaw += angleTo(this.pYaw, face) * ease(dt, 3)
    if (waiting && Math.sin(t * 1.5) > 0.97) this.pWiggle = Math.max(this.pWiggle, 0.6)
    this.pWiggle = Math.max(0, this.pWiggle - dt * 1.2)
    p.y = -0.95 + Math.sin(t * 1.1) * 0.1 - (this.pState === 'home' ? 0.3 : 0)
    // Through the gap it dives a little under the surface's swell.
    const r = this.parrot.root
    r.position.copy(p)
    r.rotation.set(0, this.pYaw, Math.sin(t * 7) * this.pWiggle * 0.3)
    this.parrot.parts.tail.rotation.y = Math.sin(t * (5 + this.pSpeed * 5)) * (0.35 + this.pWiggle * 0.3)
    this.parrot.parts.body.rotation.y = Math.sin(t * (5 + this.pSpeed * 5) + 1.2) * 0.08
  }

  private cuttlefish(dt: number, t: number) {
    const c = this.cPos
    // (It hides, sand-colored, until the parrotfish has brought her to the garden.)
    const on = this.round === 'cuttle' && this.best < 3
    if (this.jet) {
      // Jetting off to its next hiding place: a whoosh and a puff of ink, tentacles first.
      const j = this.jet
      // (A moment showing off its new color first.)
      if (j.wait > 0 && (j.wait -= dt) <= 0) {
        sfx.jet()
        this.once(`again${this.best}`, S.again[this.best - 1])
      }
      if (j.wait <= 0) j.t += dt / FISH.jet
      const k = clamp(j.t)
      const e = 1 - (1 - k) ** 3
      c.set(j.from.x + (j.to.x - j.from.x) * e, j.from.y - bellK(k) * 0.4, j.from.z + (j.to.z - j.from.z) * e)
      if (Math.random() < dt * 30 * (1 - k)) this.bubbles.emit(c.x, c.y, c.z, (Math.random() - 0.5) * 0.4, 0.3, (Math.random() - 0.5) * 0.4, 1.2, 0.05 + Math.random() * 0.05)
      if (k >= 1) {
        this.jet = null
        this.lapT = 0
        this.glintT = 0
      }
    } else if (on) {
      this.lapT += dt
      const home = CUTTLE_SPOTS[this.best]
      const d0 = Math.hypot(this.pos.x - c.x, this.pos.z - c.z)
      const dx = c.x - this.pos.x
      const dz = c.z - this.pos.z
      if (this.lapT > FISH.comes) {
        // Stuck a long while: it comes to her (rule 3), and she reaches it.
        const l = Math.max(0.01, d0)
        c.x -= (dx / l) * 0.7 * dt
        c.z -= (dz / l) * 0.7 * dt
      } else if (this.best === 2 && d0 < 4.5 && d0 > FISH.pink && FISH.shy > 0) {
        // The last time it's shy: it backs away from her (slower than her paddle), never far from its place.
        const l = Math.max(0.01, d0)
        const nx = c.x + (dx / l) * FISH.shy * dt
        const nz = c.z + (dz / l) * FISH.shy * dt
        if (Math.hypot(nx - home.x, nz - home.z) < 3 && nx > BOUNDS.x0 + 1 && nx < BOUNDS.x1 - 1 && nz > BOUNDS.z0 + 1) {
          c.x = nx
          c.z = nz
        }
      }
      // Stuck: a rainbow glint where it hides, now and then.
      if (this.lapT > FISH.glint && (this.glintT -= dt) <= 0) {
        this.glintT = 5
        this.flashT = 0
        twinkle(3)
        this.counts.glints++
      }
    }
    const d = Math.hypot(this.pos.x - c.x, this.pos.z - c.z)
    const near = on && !this.jet && d < FISH.flash
    // (Its color: sand far off, the time's own color near; showing it off before a jet, rainbow while it jets.)
    const stage = this.round !== 'cuttle' ? 0 : this.best >= 3 ? 3 : this.jet ? (this.jet.wait > 0 ? this.best : 1) : near ? this.best + 1 : 0
    if (stage > this.stage) sfx.color(stage)
    if (near && stage === 1) this.once('colors', S.colors)
    if (on && !this.jet && d < FISH.pink) {
      // She reached it: its new color bursts out; the first two times it jets off to hide again.
      this.best++
      this.counts.stages++
      this.burstAt(c, this.best === 3 ? 40 : 22)
      if (this.best === 3) {
        twinkle(6)
        this.once('pink', S.pink)
        this.once('camera', S.camera)
      } else {
        twinkle(4)
        this.jet = { from: c.clone(), to: new Vector3(CUTTLE_SPOTS[this.best].x, -1.15, CUTTLE_SPOTS[this.best].z), t: 0, wait: 0.8 }
      }
    }
    this.stage = stage
    const col = this.cuttle.mat.color
    if (this.flashT >= 0) {
      this.flashT += dt
      col.setHSL((t * 2.4) % 1, 0.85, 0.62)
      if (this.flashT > 1.4) this.flashT = -1
    } else if (stage === 0) col.set('#E9D8B4')
    else if (stage === 1) col.setHSL((t * 1.6) % 1, 0.8, 0.62)
    else if (stage === 2) col.set(Math.sin(t * 22) > 0 ? '#8A63E8' : '#FFE15C')
    else col.set('#FF6FB5').offsetHSL(0, 0, Math.sin(t * 4) * 0.05)
    // Hovering, fins rippling, turned to her when she's near.
    const want = this.jet ? Math.atan2(this.jet.from.x - this.jet.to.x, this.jet.from.z - this.jet.to.z) : d < 9 ? Math.atan2(this.pos.x - c.x, this.pos.z - c.z) : t * 0.2
    const r = this.cuttle.root
    r.rotation.y += angleTo(r.rotation.y, want) * ease(dt, 2)
    r.position.set(c.x + Math.sin(t * 0.5) * 0.3, c.y + Math.sin(t * 1.3) * 0.08, c.z + Math.cos(t * 0.4) * 0.2)
    const fin = 1 + Math.sin(t * 9) * 0.05
    this.cuttle.parts.body.scale.set(fin, 1, 1 + Math.sin(t * 9 + 1) * 0.03)
  }

  // ---------------------------------------------------------------- the reef's life

  private reef(dt: number, t: number) {
    for (const s of this.soft) {
      s.sway.rotation.z = Math.sin(t * 1.1 + s.phase) * 0.12
      s.sway.rotation.x = Math.sin(t * 0.8 + s.phase * 1.3) * 0.08
    }
    for (const u of this.urchins) {
      u.wob = Math.max(0, u.wob - dt * 1.5)
      u.models.forEach((m, k) => m.parts.ball.scale.setScalar(1 + Math.sin(t * 30 + k) * 0.1 * u.wob))
    }
    for (const pk of this.peekers) {
      if (pk.t < 0) continue
      pk.t += dt
      const k = pk.t / 2.4
      // Out, a loop round the coral (bubbles at her: hey!), and back in.
      const a = k * Math.PI * 2
      const out = bellK(k)
      pk.fish.position.set(pk.at.x + Math.sin(a) * 1.1 * out, pk.at.y + 0.2 * out, pk.at.z + Math.cos(a) * 1.1 * out)
      pk.fish.rotation.y = a + Math.PI / 2
      pk.fish.scale.setScalar(1.8 * clamp(out * 3))
      if (Math.random() < dt * 8 * out) this.bubbles.emit(pk.fish.position.x, pk.fish.position.y, pk.fish.position.z, 0, 0.5, 0, 1, 0.04)
      if (k >= 1) {
        pk.t = -1
        pk.fish.visible = false
      }
    }
    if (this.clamT >= 0) {
      this.clamT += dt
      this.clam.lid.rotation.x = 0.55 * bellK(this.clamT / 2.4) ** 0.4
      if (this.clamT > 2.4) this.clamT = -1
    } else this.clam.lid.rotation.x = -0.05 - Math.sin(t * 0.7) * 0.04
    // She swims over the clam: it shuts (bubbles).
    if (this.clamT < 0 && Math.hypot(this.pos.x - CLAM.x, this.pos.z - CLAM.z) < 1.2 && this.vel.length() > 0.3) this.poke('clam')
    if (this.cucT >= 0) {
      this.cucT += dt
      const k = this.cucT / 1.2
      this.cuc.body.scale.set(1 + Math.sin(k * 18) * 0.1 * (1 - k), 1 - Math.sin(k * 18) * 0.12 * (1 - k), 1 + Math.sin(k * 18) * 0.15 * (1 - k))
      if (k >= 1) this.cucT = -1
    }
    // The boat rocks; the captain waves.
    const b = this.boat
    this.capFace.update(dt)
    b.body.rotation.z = Math.sin(t * 1.1) * 0.03
    b.root.position.y = Math.sin(t * 1.4) * 0.05
    if (this.wave >= 0) {
      this.wave += dt / 1.4
      b.arm.rotation.z = bellK(this.wave) * (2.4 + Math.sin(this.wave * 30) * 0.3)
      if (this.wave >= 1) this.wave = -1
    }
    // Sunbeams breathe.
    this.beams.root.position.set(this.pos.x, 0, this.pos.z - 4)
    this.beams.beams.forEach((m, i) => (m.scale.x = 0.7 + Math.sin(t * 0.6 + (m.userData.phase as number)) * 0.3 + i * 0))
    this.beams.mat.opacity = 0.11 + Math.sin(t * 0.4) * 0.03
  }

  private peek(k: number, cross: boolean) {
    const pk = this.peekers[k]
    if (!pk || pk.t >= 0) return
    pk.t = 0
    pk.fish.visible = true
    this.counts.peeks++
    if (cross) blub(0.2)
    else sfx.peek()
  }

  private burstAt(p: Vector3, n: number) {
    for (let i = 0; i < n; i++) this.sparkle.emit(p.x + (Math.random() - 0.5) * 1.2, p.y + (Math.random() - 0.5) * 0.8, p.z + (Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.8, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 0.8, 1.6, 0.06)
  }

  // ---------------------------------------------------------------- Mommy's waterproof camera

  /** Snaps what's in view under the water; the animals newly in her book. */
  snap(): AnimalId[] {
    shutter()
    this.counts.snaps++
    const out: AnimalId[] = []
    const cam = this.rig.camera.position
    const seen = (p: Vector3, range: number) => {
      if (p.distanceTo(cam) > range) return false
      const s = this.toScreen(p)
      return s.z < 1 && s.x > 0 && s.x < this.w && s.y > this.split && s.y < this.h
    }
    if (this.pState !== 'away' && seen(this.pPos, 16)) out.push('parrotfish')
    if (seen(this.cuttle.root.position, 16)) out.push('cuttlefish')
    if (seen(this.crowdC, 14)) out.push('damselfish')
    if (URCHINS.some(({ o }) => seen(tmp2.set(o.x, o.top - 0.2, o.z), 16))) out.push('urchin')
    if (this.patches.some((p) => seen(p.at, 14)) || CORALS.some(({ o }) => seen(tmp2.set(o.x, o.top - 0.3, o.z), 14))) out.push('coral')
    return out
  }

  // ---------------------------------------------------------------- her finger

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    if (this.intro >= 0) this.skipIntro()
    // On a poke's tap target it waits to see if it's a tap; anywhere else (or Kaylee herself), she follows at once.
    this.finger = { x, y, id, moved: false, lead: !id }
    if (!id) {
      this.goal = null
      this.counts.leads++
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
        this.goal = null
        this.counts.leads++
      }
    }
  }
  pointerUp() {
    this.finger = null
  }
  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) return this.poke(id)
    // A tap on the water: she swims there.
    const way = this.fingerWay(x, y)
    const d = Math.min(way.d, 10)
    this.goal = { x: this.pos.x + way.x * d, z: this.pos.z + way.z * d }
  }
  private skipIntro() {
    if (this.intro < 0) return
    this.intro = -1
    this.tiltK = 1
    this.pos.set(START.x, 0, START.z)
    this.splashIn()
  }

  private poke(id: string) {
    this.counts.pokes++
    if (id === 'kaylee') {
      // A twirl, blowing bubbles out of her snorkel.
      if (this.spin < 0) this.spin = 0
      blub()
      this.bubbles.burst(this.pos.x, -0.3, this.pos.z, 12, 0.5, 0.8, 0.06)
      this.spray.burst(this.pos.x, 0.25, this.pos.z, 6, 0.6, 2.4, 0.06)
    } else if (id === 'family:nick') {
      if (this.said.has('ring') && this.dad.dip < 0) this.events.say(S.dad[this.turn.dad++ % S.dad.length])
      this.blowRing()
    } else if (id === 'captain') {
      toot()
      this.wave = 0
      this.events.say(S.captain[this.turn.captain++ % S.captain.length])
    } else if (id === 'parrot') {
      this.pWiggle = 1
      sfx.fishPoke()
      this.bubbles.burst(this.pPos.x, this.pPos.y, this.pPos.z, 6, 0.4, 0.6, 0.05)
    } else if (id === 'cuttle') {
      this.flashT = 0
      twinkle(4)
      this.burstAt(this.cuttle.root.position, 14)
    } else if (id === 'clam') {
      if (this.clamT >= 0) return
      this.clamT = 0
      clamSnd()
      this.bubbles.burst(CLAM.x, bedHeight(CLAM.x, CLAM.z) + 0.4, CLAM.z, 10, 0.5, 1, 0.06)
    } else if (id === 'cucumber') {
      this.cucT = 0
      sfx.squish()
    } else if (id.startsWith('urchin:')) {
      const u = this.urchins[+id.slice(7)]
      if (u) u.wob = 1
      prickle()
    } else if (id.startsWith('coral:')) {
      this.peek(+id.slice(6), false)
      this.once('coral', S.coral)
    }
  }

  // ---------------------------------------------------------------- camera and drawing

  private shot(): Shot {
    const dist = this.tall ? PLAY.tallDist : PLAY.dist
    const pitch = PLAY.pitch + (this.tall ? PLAY.tallPitch : 0)
    // Behind her (looking along the reef, −z), low over the water: the camera's height fixes where the look-at sits.
    const cy = PLAY.height - dist * Math.sin(pitch / DEG)
    const center = new Vector3(this.pos.x * 0.85, cy, this.pos.z - PLAY.ahead)
    return { center, half: new Vector3(0.5, 0.5, 0.5), yaw: 0, pitch, minDist: dist, maxDist: dist }
  }

  /** Where the surface is on screen at her distance (the line between the two views), and the DOM line drawn on it. */
  private waterline(t: number) {
    const cam = this.rig.camera
    let split = this.h
    if (cam.position.y > 0.01) {
      // The surface right under her, as far off as she is (straight ahead of the camera).
      const f = tmp2.setFromMatrixColumn(cam.matrixWorld, 2).negate().setY(0).normalize()
      const d = Math.max(1, Math.hypot(this.pos.x - cam.position.x, this.pos.z - cam.position.z))
      const s = this.toScreen(tmp2.set(cam.position.x + f.x * d, 0, cam.position.z + f.z * d))
      split = s.y
    } else split = 0
    this.split = clamp(split, 0, this.h)
    const el = this.lineEl
    if (el) {
      el.style.transform = `translate3d(0, ${this.split.toFixed(1)}px, 0)`
      el.style.backgroundPositionX = `${(t * 18).toFixed(1)}px`
    }
  }

  render() {
    const r = this.renderer
    const { scene } = this
    const top = Math.round(this.split)
    let calls = 0
    let tris = 0
    r.setScissorTest(true)
    // Above the water: the sky, the sea's top out to the horizon, the boat, Ko Kudi.
    if (top > 0) {
      scene.fog = this.airFog
      scene.background = this.sky
      this.sea.visible = true
      this.under.visible = false
      r.setScissor(0, this.h - top, this.w, top)
      r.render(scene, this.rig.camera)
      calls += r.info.render.calls
      tris += r.info.render.triangles
    }
    // Under it: the same view without the sea's top, in the water's blue.
    if (top < this.h) {
      this.waterFog.far = PLAY.fog
      scene.fog = this.waterFog
      scene.background = this.deep
      this.sea.visible = false
      this.under.visible = true
      r.setScissor(0, 0, this.w, this.h - top)
      r.render(scene, this.rig.camera)
      calls += r.info.render.calls
      tris += r.info.render.triangles
    }
    r.setScissorTest(false)
    this.stats.calls = calls
    this.stats.tris = tris
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    const idle = !this.finger && !this.goal && this.intro < 0 && t - this.lastTouch > HINT_S
    if (idle) {
      if (this.round === 'float') {
        // Out ahead of her, along the reef.
        const k = (t * 0.5) % 1
        at = tmp2.set(this.pos.x, -0.6, this.pos.z - 1.5 - k * 3)
      } else if (this.pState === 'lead' || this.pState === 'arrive') at = tmp2.copy(this.pPos)
      else if (this.round === 'cuttle' && this.best < 3) at = tmp2.copy(this.cuttle.root.position)
    }
    if (!!at !== this.hintOn) {
      this.hintOn = !!at
      // The finger has just come up: the hint, spoken only if the budget allows (spendHint).
      const l = at ? S.hint[this.round] : null
      if (l) this.events.say(l, !spendHint(l))
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    const s = this.toScreen(at)
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.6, under = true) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp2.copy(at).setY(at.y + height * 0.5))
        const cx = c.x
        const cy = c.y
        const cz = c.z
        const topY = this.toScreen(tmp2.copy(at).setY(at.y + height)).y
        // Under the water, it shows only below the waterline (above it, the sea's top hides it), and the other way.
        const side = under ? cy > this.split - 10 : cy < this.split + 10
        if (cz < 1 && side) spot = { x: cx, y: cy, size: Math.max(min, Math.min(this.w * 0.3, Math.abs(cy - topY) * 2 * scale)) }
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
      if (id === 'kaylee') place(el, v.set(this.pos.x, -0.35, this.pos.z), 0.6, 0.9)
      else if (id === 'family:nick') place(el, this.nick.root.getWorldPosition(v).setY(-0.4), 0.9, 1, true)
      else if (id === 'captain') place(el, this.boat.captain.getWorldPosition(v), 1.5, 1, false)
      else if (id === 'parrot') place(el, this.pState === 'away' ? null : v.copy(this.pPos).setY(this.pPos.y - 0.4), 0.8, 1.4)
      else if (id === 'cuttle') place(el, v.copy(this.cuttle.root.position).setY(this.cuttle.root.position.y - 0.3), 0.6, 1.6)
      else if (id === 'clam') place(el, v.copy(this.clam.root.position), 0.6, 1.6)
      else if (id === 'cucumber') place(el, v.copy(this.cuc.root.position), 0.4, 2)
      else if (id.startsWith('urchin:')) {
        const u = URCHINS[+id.slice(7)]
        place(el, u ? v.set(u.o.x, u.o.top - 0.55, u.o.z) : null, 0.5, 1.6)
      } else if (id.startsWith('coral:')) {
        const c = CORALS[+id.slice(6)]
        place(el, c ? v.set(c.o.x, c.o.top - 0.7, c.o.z) : null, 0.6, 1.6)
      }
      el.style.zIndex = id === 'kaylee' ? '1' : id === 'parrot' || id === 'cuttle' ? '3' : '2'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (p: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(p))
    return {
      section: 'snorkel',
      phase: this.intro >= 0 ? 'intro' : this.round,
      round: this.round,
      at: { x: +this.pos.x.toFixed(2), z: +this.pos.z.toFixed(2) },
      speed: +this.vel.length().toFixed(2),
      swam: +this.swam.toFixed(1),
      split: Math.round(this.split),
      parrot: this.pState,
      waypoint: this.pi,
      cuttleStage: this.stage,
      cuttleBest: this.best,
      done: this.doneAt >= 0,
      kaylee: sc(tmp2.set(this.pos.x, 0, this.pos.z)),
      parrotAt: sc(this.pPos),
      cuttleAt: sc(this.cuttle.root.position),
      daddy: sc(tmp2.set(this.dad.x, -0.3, this.dad.z)),
      ...this.counts,
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

function mulberry(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
