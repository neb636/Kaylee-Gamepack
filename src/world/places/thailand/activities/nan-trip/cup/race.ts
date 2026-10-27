// The Nan Mountain Cup's race (section `race`, plan: planning/around-the-world/thailand/nan-cup.html; greybox 1: the
// kart toy, greybox 2: the other two tracks, step 4: the look). Kaylee drives her pink kart against Grandma
// Taeng, Pao and Moon (toy animals on the chibi rig, riders.ts) from the start line to the finish, one run along a track (track.ts: `forest`, `steps`, `cloud`), not
// laps.
//
// The toy is the boat race's verb, which she already knows:
// - Hold a finger on the road ahead: the kart races there at full speed (only forward along the track: her finger
//   picks where across the road). Let go and it keeps racing by itself, a bit slower (she can never stop or get lost).
// - On a phone she tilts it to steer and holds a gas pedal (trip/race/tilt.ts, GasPedal.tsx), as in the boat race.
// - The start: three lights and GO; a finger already down at GO is a rocket start. Grandma Taeng naps on the grid and
//   wakes up at GO.
// - Pick a line: gold coins make her a little faster (up to ten), gold arrow pads give a burst of speed, and each
//   track's own trick:
//   - the forest's giant pink mushrooms: drive over one and she goes *boing* up into the air, where more coins hang;
//   - the rice steps' puddles: SPLASH, and the kart gets muddier (and a little faster) each time, until the waterfall
//     near the end washes it clean with a burst of speed;
//   - the cloud: halfway up the mountain everything turns white, and a line of glowing lanterns shows the way (each one
//     she drives under chimes, higher and higher); out the top, sunshine over a sea of clouds. Showers of pink
//     Chomphu Phu Kha blossoms fall across the road: driving through one is a burst of speed.
// - Silly, never a crash: off the road she bumps along the grass (slower, shaking), and the hay bales at its edge boing
//   her back; bump a rival and you both bounce; facing the wrong way, the kart turns round by itself.
// - The rivals keep it close the whole way (the races' rubber band, trip/race/rubber.ts, round a story per track in
//   rivals.ts). The finish is scripted both ways (`result`): she wins by a nose, or (the one race she loses) the home
//   rival, Moon here, edges past on the last stretch and wins by a nose in a slow-motion photo finish, with her second,
//   never last. Fireworks either way, and then the podium (Cup.tsx hands over to the race ground, ground.ts). The gifts
//   from the races she lost ride on her kart (gifts.ts).
// Greybox: no voices. The numbers that decide how it feels are knobs (?feel=1): her kart,
// the bounce, the mud, the cloud and the blossoms, the rivals' rubber band; the lab's graph shows her finger across the
// road against the kart.
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, DoubleSide, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, RepeatWrapping, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../../sdk'
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
import { put } from '../../../trip/legs/stage'
import { wearing } from '../../../trip/packing'
import { Coins, Pads } from '../../../trip/race/items'
import { RaceMusic } from '../../../trip/race/music'
import type { RaceHud, RacePhase } from '../../../trip/race/RaceHud'
import { herLimit, rivalPace, scripted, type Script } from '../../../trip/race/rubber'
import type { SteerMode, Tilt } from '../../../trip/race/tilt'
import { buildMirror, buildRoadScene, rng, type RoadScene } from '../../../trip/road/build'
import { buildCloudLayer, buildCloudSea } from '../../../trip/road/clouds'
import { buildKart, type Kart } from '../../../trip/vehicles/kart'
import { dressKart, type KartDress } from './karts'
import { buildRider, type Rider } from './riders'
import { Scenery } from './scenery'
import { animateGifts, giveGifts, type Gift } from './gifts'
import { GRID, HOME, RIVAL_IDS, RIVALS, scripts, type RacerId, type Result, type Rival, type RivalId } from './rivals'
import { cupSfx as sfx } from './sounds'
import { SHOWER_LEN, STREAM_LEN, Track, type Mushroom, type TrackId } from './track'

const FILE = 'src/world/places/thailand/activities/nan-trip/cup/race.ts'
/** Her kart: how it drives under her finger. */
const KART = knobs('kart', 'Her kart', FILE, {
  top: { value: 13, min: 6, max: 24, step: 0.5, label: 'Top speed', unit: 'm/s' },
  accel: { value: 9, min: 2, max: 25, step: 0.5, label: 'Speeding up', unit: 'm/s²' },
  turn: { value: 2.4, min: 0.8, max: 5, step: 0.1, label: 'Turn toward her finger', unit: 'rad/s', note: 'how hard it turns toward where her finger is' },
  grip: { value: 4, min: 0.5, max: 12, step: 0.1, label: 'Grip', unit: '1/s', note: 'low = it slides wide through the bends' },
  near: { value: 9, min: 3, max: 20, step: 0.5, label: 'Aim, nearest', unit: 'm', note: 'a finger close in front of the kart still aims this far up the road' },
  far: { value: 28, min: 12, max: 60, step: 1, label: 'Aim, furthest', unit: 'm', note: 'a finger far up the road aims no further than this' },
  offRoad: { value: 1.5, min: 0, max: 4, step: 0.1, label: 'Aim onto the grass, up to', unit: 'm past the road', note: 'a finger further out than this still steers no further' },
  cruise: { value: 0.62, min: 0.2, max: 1, step: 0.02, label: 'No finger: cruising', unit: '× top' },
  grass: { value: 0.6, min: 0.2, max: 1, step: 0.02, label: 'On the grass', unit: '× top' },
  coin: { value: 0.012, min: 0, max: 0.05, step: 0.002, label: 'Each coin', unit: '× top', note: 'up to ten coins' },
  pad: { value: 1.3, min: 0.3, max: 3, step: 0.1, label: 'Arrow pad', unit: 's of burst' },
  boost: { value: 1.6, min: 1, max: 2.5, step: 0.05, label: 'Burst speed', unit: '× top' },
})
/** The bouncy mushrooms (the Driver's gravity is 18 m/s²: 8.5 m/s up is about 2 m high, 0.95 s in the air). */
const BOUNCE = knobs('bounce', 'Bouncy mushrooms', FILE, {
  up: { value: 8.5, min: 3, max: 16, step: 0.5, label: 'Bounce', unit: 'm/s up' },
  big: { value: 11.5, min: 4, max: 20, step: 0.5, label: 'The big one', unit: 'm/s up' },
  slow: { value: 0.5, min: 0, max: 1.5, step: 0.05, label: 'Slow motion up there', unit: 's' },
})
/** The rice steps' puddles and the waterfall. */
const MUD = knobs('mud', 'Puddles and mud', FILE, {
  each: { value: 0.34, min: 0.1, max: 1, step: 0.02, label: 'Mud per puddle', unit: '× all muddy', note: 'about three puddles and the kart is as muddy as it gets' },
  fast: { value: 0.1, min: 0, max: 0.3, step: 0.01, label: 'All muddy: faster by', unit: '× top' },
  splash: { value: 0.35, min: 0, max: 1.5, step: 0.05, label: 'Splash slow motion', unit: 's' },
  wash: { value: 1.2, min: 0, max: 3, step: 0.1, label: 'The waterfall: burst', unit: 's of burst' },
})
/** The cloud on the climb, its lanterns and the blossom showers. */
const CLOUD = knobs('cloud', 'The cloud and the blossoms', FILE, {
  see: { value: 40, min: 15, max: 150, step: 5, label: 'In the cloud she sees', unit: 'm', note: 'how far before everything is white (the lanterns glow through it)' },
  lantern: { value: 1.8, min: 0.8, max: 3.5, step: 0.1, label: 'Under a lantern within', unit: 'm across' },
  petals: { value: 1.1, min: 0.2, max: 3, step: 0.1, label: 'Through the blossoms', unit: 's of burst' },
})
/** The rivals' rubber band (trip/race/rubber.ts). */
const BAND = knobs('rivals', "The rivals' rubber band", FILE, {
  gap: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Gap', unit: '× the story', note: 'how far ahead or behind her they want to be (0 = right beside her all race)' },
  pull: { value: 0.32, min: 0.05, max: 1.2, step: 0.01, label: 'Pull to the story', unit: 'm/s per m' },
  ease: { value: 120, min: 30, max: 300, step: 10, label: 'Ease off beside her from', unit: 'm before the line' },
})

export type { RacerId } from './rivals'
export type KartHud = RaceHud<RacerId>

export interface KartStart {
  track: TrackId
  result: Result
  packed: string[]
  /** She has raced here before this visit (a shorter start). */
  again: boolean
  /** The gifts on her kart, from the rivals who won a race of the Cup (cup/gifts.ts). */
  gifts?: readonly RivalId[]
}

export interface KartEvents {
  onHud(hud: KartHud): void
  /** The race is over (everyone's over the line, the fireworks are going): the end card. */
  onDone(place: number): void
}

export const KART_ANCHORS: AnchorInfo[] = [
  { id: 'kart', label: 'Her kart', kind: 'thing' },
  ...RIVAL_IDS.map((id): AnchorInfo => ({ id: `rival:${id}`, label: RIVALS[id].label, kind: 'thing' })),
  ...[0, 1, 2, 3].map((i): AnchorInfo => ({ id: `mushroom:${i}`, label: 'Bouncy mushroom', kind: 'thing' })),
  { id: 'waterfall', label: 'The waterfall', kind: 'thing' },
  { id: 'ducks', label: 'The ducks', kind: 'thing' },
  ...[0, 1, 2, 3, 4].map((i): AnchorInfo => ({ id: `tree:${i}`, label: 'Pink blossom tree', kind: 'thing' })),
]

interface Racer {
  id: RacerId
  v: Kart
  d: Driver
  feel: Feel
  /** Its usual top speed (coins and the rubber band raise it). */
  base: number
  rival: Rival | null
  rider: Rider | null
  /** Its kart dressed as its own (karts.ts). */
  dress: KartDress | null
  script: Script | null
  roll: { x: number; v: number }
  pitch: { x: number; v: number }
  squash: number
  /** Where it is on the road: the nearest sample, meters along and across; how far past the start line. */
  i: number
  s: number
  lat: number
  progress: number
  /** The ground under it (smoothed), meters. */
  y: number
  /** When it crossed the finish line (seconds), or -1. */
  done: number
  coins: number
  grass: boolean
  bumpCool: number
  padCool: number
  bounceCool: number
  splashCool: number
  /** How muddy the kart is (0..1, the rice steps), and its splats (a third more of them for each step up). */
  mud: number
  splats: Group[]
  /** A slow sway round its lane (the rivals). */
  sway: number
}

const deg = Math.PI / 180
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const wrapDeg = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180
const tmp = new Vector3()
const tmp2 = new Vector3()
/** The countdown's beat (seconds per light). */
const BEAT = 0.9
/** Seconds of slow motion over the line. */
const SLOWMO = 1.3
/** The finish clearing: where each racer rolls to a stop after the line (meters left of the middle). */
const PARK: Record<RacerId, number> = { kaylee: 0, moon: -3.2, pao: 3.2, taeng: -1.6 }
/** Each track's sky and haze; the climb's inside the cloud and above it. */
const AIR = {
  forest: { bg: '#BFE3F2', fog: '#D6ECEC', near: 110, far: 420 },
  steps: { bg: '#BFE3FF', fog: '#E4F3FC', near: 160, far: 620 },
  cloud: { bg: '#C9DCEF', fog: '#D9E3EF', near: 110, far: 420 },
  inside: { bg: '#F2F0FA', fog: '#F2F0FA', near: 6 },
  above: { bg: '#9FD6FF', fog: '#E6F5FF', near: 220, far: 760 },
}
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const tmpColor = new Color()
const m4 = new Matrix4()

export class KartRace implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  readonly bag = new Bag()
  private lights = makeLights(this.scene)
  readonly track: Track
  private world: RoadScene
  /** Each track's scenery (the log, the stream, the big trees, the cafe, the ducks, the bridge, ...). */
  private scenery: Scenery
  private air: (typeof AIR)['forest']
  private coins: Coins
  private pads: Pads
  private shrooms: { m: Mushroom; g: Group; squash: number }[] = []
  /** The waterfall (the rice steps): its rocks, and the falling water and the stream across the road (they scroll). */
  private fall: { g: Group; at: Vector3; water: CanvasTexture[]; splash: number } | null = null
  /** The cloud (the climb): the sea of clouds seen from above, how deep in she is (0..1), the lanterns. */
  private sea: Group | null = null
  private fog: Fog
  private cloudK = 0
  private wasIn = false
  private wasAbove = false
  private lanterns: { mesh: InstancedMesh; lit: number[]; on: boolean[] } | null = null
  private trees: { at: Vector3; shake: number; g: Group }[] = []
  private petals: Particles | null = null
  private splash: Particles
  private dust: Particles
  private straw: Particles
  private sparkle: Particles
  private fireworks: Particles
  private confetti: Particles
  private music = new RaceMusic()
  readonly racers: Racer[]
  private kaylee: Avatar
  private gifts: Gift[] = []
  private giftWiggle = 0
  private winner: RacerId
  private phase: RacePhase = 'intro'
  private phaseT = 0
  private ended = false
  private finger: { x: number; y: number; steering: boolean; t: number; id?: string } | null = null
  /** Where across the road her finger is now (the feel lab's graph). */
  private fingerLat = 0
  private raycaster = new Raycaster()
  private w = 1
  private h = 1
  time = 0
  private lastTouch = 0
  private camHeading = 0
  private engineT = 0
  private herRate = 0
  private lastProgress = 0
  private slow = 0
  private boostKick = 0
  private banner: KartHud['banner'] = null
  private lastHud = ''
  private lastPlace = 4
  private fireworkT = 0
  private photoFinish = false
  private rocket = false
  private told = new Set<string>()
  private steer: SteerMode = 'finger'
  private tilt: Tilt | null = null
  private gasDown = false
  private aimLat = 0
  private waiting = false
  private counts = { coinsTaken: 0, pads: 0, bounces: 0, bigBounces: 0, bales: 0, grass: 0, bumps: 0, honks: 0, pokes: 0, splashes: 0, washes: 0, lanterns: 0, showers: 0, fords: 0 }
  private timers: number[] = []
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private mapEls = new Map<string, SVGElement>()
  private unwatch: () => void
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }

  constructor(
    private renderer: WebGLRenderer,
    private start: KartStart,
    private events: KartEvents,
  ) {
    const { scene, bag } = this
    const track = (this.track = new Track(start.track))
    const road = track.road
    applyBands()
    const air = (this.air = AIR[start.track] ?? AIR.forest)
    scene.background = new Color(air.bg)
    this.fog = scene.fog = new Fog(air.fog, air.near, air.far)
    this.rig.fov = 55
    this.rig.camera.far = 900

    // ---- The forest road, its hay bales, the mushrooms, the start and the finish ----
    this.world = buildRoadScene(road, track.def.look, bag)
    scene.add(this.world.root)
    scene.add(this.bales())
    scene.add(this.verges())
    this.scenery = new Scenery(track, this.world.field, bag)
    scene.add(this.scenery.root)
    for (const m of track.mushrooms) {
      const g = this.mushroom(m)
      this.shrooms.push({ m, g, squash: 1 })
      scene.add(g)
    }
    scene.add(this.line(track.def.start, false), this.line(track.def.finish, true))
    if (track.puddles.length) scene.add(this.puddles())
    if (track.stream) scene.add(this.waterfall())
    if (track.def.cloud) this.cloud()
    if (track.showers.length) scene.add(this.blossomTrees())
    for (const m of track.def.mirrors ?? []) scene.add(buildMirror(road, this.world.field, track.def.start + m.f * track.length, m.side, bag).root)
    this.coins = new Coins(bag, track.coins, track.place, { airGap: 3 })
    this.pads = new Pads(bag, track.pads, { across: 2.2, along: 3 }, track.place, (a, b) => b - a)
    scene.add(this.coins.mesh, this.pads.root)
    this.dust = new Particles({ kind: 'spray', count: 400, colors: ['#FFFFFF', '#F1E4D6', '#D9C4A8', '#9BD37E'], gravity: 3 }, bag)
    this.straw = new Particles({ kind: 'spray', count: 160, colors: ['#F2D27A', '#E8C46A', '#FFF0B8'], gravity: 9 }, bag)
    const rainbow = [PAL.hotpink, PAL.gold, PAL.mint, PAL.sky, PAL.lavenderDark, '#FFB07A']
    this.sparkle = new Particles({ kind: 'spray', count: 360, colors: rainbow, gravity: 1.5 }, bag)
    this.fireworks = new Particles({ kind: 'spray', count: 500, colors: [...rainbow, PAL.gold, '#FFFFFF'], gravity: 4 }, bag)
    this.confetti = new Particles({ kind: 'spray', count: 320, colors: [...rainbow, PAL.gold], gravity: 1.2 }, bag)
    this.splash = new Particles({ kind: 'spray', count: 420, colors: ['#FFFFFF', '#CFE9F5', '#A9D3EA', '#9C7A5B', '#B89A7A'], gravity: 10 }, bag)
    scene.add(this.dust.mesh, this.straw.mesh, this.sparkle.mesh, this.fireworks.mesh, this.confetti.mesh, this.splash.mesh)
    if (track.showers.length) {
      this.petals = new Particles({ kind: 'spray', count: 700, colors: [PAL.pink, '#FFB3CF', '#FFD1E1', PAL.hotpink, '#FFFFFF'], gravity: 0.5 }, bag)
      scene.add(this.petals.mesh)
    }

    // ---- The karts: hers (pink, with Kaylee in it) and the rivals' (each with its rider) ----
    this.winner = start.result === 'lose' ? HOME[start.track] : 'kaylee'
    const plan = scripts(start.track, start.result)
    const racer = (id: RacerId, v: Kart, rival: Rival | null): Racer => {
      v.feel.top = KART.top * (rival?.pace ?? 1)
      const r: Racer = { id, v, d: new Driver(v.feel), feel: v.feel, base: v.feel.top, rival, rider: null, dress: null, script: rival ? plan[rival.id] : null, roll: { x: 0, v: 0 }, pitch: { x: 0, v: 0 }, squash: 1, i: 0, s: 0, lat: 0, progress: 0, y: 0, done: -1, coins: 0, grass: false, bumpCool: 0, padCool: 0, bounceCool: 0, splashCool: 0, mud: 0, splats: [], sway: Math.random() * 6 }
      v.root.add(blobShadow(1.3, bag))
      if (this.track.puddles.length) r.splats = this.mudSplats(v)
      scene.add(v.root)
      return r
    }
    const mine = buildKart(bag)
    this.gifts = giveGifts(mine, start.gifts ?? [], bag)
    this.racers = [racer('kaylee', mine, null)]
    this.racers[0].dress = dressKart(mine, 'kaylee', bag)
    for (const id of RIVAL_IDS) {
      const rv = RIVALS[id]
      const r = racer(id, buildKart(bag, rv.kart, { horn: false }), rv)
      r.rider = buildRider(bag, id)
      r.dress = dressKart(r.v, id, bag)
      r.v.seat.add(r.rider.root)
      this.racers.push(r)
    }
    this.kaylee = new Avatar(bag)
    this.kaylee.wear(wearing(start.packed))
    mine.seat.add(this.kaylee.root)
    put(this.kaylee, 0, 0, 0, 'sit', 0)

    this.unwatch = watch('kart', () => {
      const edge = this.track.edge
      const steering = !!this.finger?.steering || this.steer === 'tilt'
      return { 'her finger (m across)': [steering ? this.fingerLat : this.k.lat, edge], 'the kart (m across)': [this.k.lat, edge], 'speed (m/s)': [this.k.d.speed, KART.top * KART.boost] }
    })
    this.toGrid()
    this.emitHud()
  }

  private get k() {
    return this.racers[0]
  }
  private racer(id: RacerId) {
    return this.racers.find((r) => r.id === id)!
  }

  // ---------------------------------------------------------------- the scene

  /** A row of hay bales along each side of the grass, the whole way. */
  private bales() {
    const { road } = this.track
    const field = this.world.field
    const parts: BufferGeometry[] = []
    const edge = this.track.edge + 0.45
    for (let s = 2; s < road.length - 1; s += 2.4)
      for (const side of [1, -1]) {
        const p = road.spotAt(s, side * edge)
        const y = field.at(p.x, p.z)
        const yaw = p.heading
        const g = merge([P.rbox(0.8, 0.62, 2.1, 0.12, '#E8C46A', { at: [0, 0.31, 0] }), P.box(0.82, 0.08, 2.12, '#C9A24E', { at: [0, 0.42, 0] }), P.box(0.82, 0.08, 2.12, '#C9A24E', { at: [0, 0.2, 0] })])
        g.rotateY(yaw)
        g.translate(p.x, y, p.z)
        parts.push(g)
      }
    return solid(merge(parts), this.bag, 2)
  }

  /** Little pink and white mushrooms in the grass outside the bales (the forest floor). */
  private verges() {
    const { road } = this.track
    const field = this.world.field
    const parts: BufferGeometry[] = []
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let s = 6; s < road.length - 4; s += 9 + rand() * 10) {
      const side = rand() < 0.5 ? 1 : -1
      const p = road.spotAt(s, side * (this.track.edge + 2 + rand() * 4))
      const y = field.at(p.x, p.z)
      const k = 0.5 + rand() * 0.6
      const cap = rand() < 0.6 ? PAL.pink : '#FFFFFF'
      parts.push(P.cyl(0.12 * k, 0.16 * k, 0.5 * k, PAL.cream, { at: [p.x, y + 0.25 * k, p.z] }, 8), P.sphere(0.42 * k, cap, { at: [p.x, y + 0.5 * k, p.z], scale: [1, 0.6, 1] }, 10))
    }
    return solid(merge(parts), this.bag, 2)
  }

  /** A giant bouncy mushroom on the road: a squat pink cap with white spots on a short stem. */
  private mushroom(m: Mushroom) {
    const p = this.track.place(m.s, m.lat)
    const g = new Group()
    g.position.set(p.x, p.y, p.z)
    const r = m.r
    const parts: BufferGeometry[] = [P.cyl(r * 0.42, r * 0.5, 0.36, PAL.cream, { at: [0, 0.18, 0] }, 14), P.sphere(r, m.big ? PAL.hotpink : PAL.pink, { at: [0, 0.36, 0], scale: [1, 0.36, 1] }, 18)]
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.4
      const d = i === 6 ? 0 : r * 0.6
      parts.push(P.sphere(r * 0.16, '#FFFFFF', { at: [Math.cos(a) * d, 0.36 + r * 0.36 * Math.sqrt(1 - (d / r) ** 2) - 0.02, Math.sin(a) * d], scale: [1, 0.35, 1] }, 8))
    }
    g.add(solid(merge(parts), this.bag, 2))
    return g
  }

  /** A checkered line across the road, under an arch (the finish's with balloons). */
  private line(s: number, finish: boolean) {
    const { road } = this.track
    const half = road.half
    const g = new Group()
    const p = this.track.place(s, 0)
    g.position.set(p.x, p.y, p.z)
    g.rotation.y = p.heading
    // The checks, flat on the road.
    const c = document.createElement('canvas')
    c.width = 128
    c.height = 16
    const x = c.getContext('2d')!
    for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) {
      x.fillStyle = (i + j) % 2 ? '#2B2330' : '#FFFFFF'
      x.fillRect(i * 8, j * 8, 8, 8)
    }
    const tex = this.bag.add(new CanvasTexture(c))
    const checks = new Mesh(this.bag.add(new PlaneGeometry(half * 2, 1.5)), this.bag.add(new MeshBasicMaterial({ map: tex, polygonOffset: true, polygonOffsetFactor: -3 })))
    checks.rotation.x = -Math.PI / 2
    checks.position.y = 0.07
    checks.renderOrder = 2
    g.add(checks)
    // The arch: two tall posts beside the road and a striped beam across, high enough that the chase camera passes
    // under it.
    const w = half + 1.2
    const H = 7.2
    const parts: BufferGeometry[] = [P.cyl(0.24, 0.28, H, PAL.cream, { at: [w, H / 2, 0] }, 10), P.cyl(0.24, 0.28, H, PAL.cream, { at: [-w, H / 2, 0] }, 10)]
    for (let i = 0; i < 8; i++) parts.push(P.box((w * 2) / 8, 1, 0.3, i % 2 ? '#FFFFFF' : finish ? PAL.hotpink : PAL.lavenderDark, { at: [-w + ((i + 0.5) * w * 2) / 8, H, 0] }))
    if (finish) {
      // Balloons in bunches on the posts.
      const colors = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lavender]
      for (const side of [1, -1])
        for (let i = 0; i < 5; i++) parts.push(P.sphere(0.36, colors[i], { at: [side * (w + Math.cos(i * 1.3) * 0.5), H + 0.8 + (i % 3) * 0.45, Math.sin(i * 1.3) * 0.5], scale: [1, 1.15, 1] }, 10))
    }
    g.add(solid(merge(parts), this.bag, 2))
    return g
  }

  /** The rice steps' puddles: muddy water in the flooded corners, a pale rim round a sky-blue shine. One mesh. */
  private puddles() {
    const pos: number[] = []
    const col: number[] = []
    const c = new Color()
    const N = 18
    for (const p of this.track.puddles) {
      const t = this.track.road.sampleAt(p.s)
      for (const [k, color, y] of [[1.12, '#B89A7A', 0.06], [1, '#9C8A78', 0.065], [0.7, '#A9C9DE', 0.07], [0.32, '#E4F1FA', 0.075]] as const)
        for (let i = 0; i < N; i++) {
          const at = (a: number) => {
            const along = Math.cos(a) * p.r * 1.5 * k
            const across = p.lat + Math.sin(a) * p.r * k
            return [t.x + t.tx * along + t.lx * across, t.y + y, t.z + t.tz * along + t.lz * across]
          }
          // (The shine sits a little off the middle.)
          const m = k < 0.5 ? [t.x + t.lx * (p.lat + p.r * 0.2) + t.tx * p.r * 0.3, t.y + y, t.z + t.lz * (p.lat + p.r * 0.2) + t.tz * p.r * 0.3] : [t.x + t.lx * p.lat, t.y + y, t.z + t.lz * p.lat]
          const off = k < 0.5 ? [t.lx * p.r * 0.2 + t.tx * p.r * 0.3, 0, t.lz * p.r * 0.2 + t.tz * p.r * 0.3] : [0, 0, 0]
          const a = at((i / N) * Math.PI * 2)
          const b = at(((i + 1) / N) * Math.PI * 2)
          c.set(color)
          for (const v of [m, [a[0] + off[0], a[1], a[2] + off[2]], [b[0] + off[0], b[1], b[2] + off[2]]]) {
            pos.push(...v)
            col.push(c.r, c.g, c.b)
          }
        }
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
    const mesh = new Mesh(this.bag.add(g), this.bag.add(new MeshBasicMaterial({ vertexColors: true, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 })))
    mesh.renderOrder = 3
    return mesh
  }

  /** Mud on a kart, in three steps (each a third muddier): brown splats over its nose, sides and back. */
  private mudSplats(v: Kart) {
    const MUDDY = ['#8B6A4E', '#9C7A5B', '#7A5C44']
    const rand = rng(v.root.id + 3)
    const steps: Group[] = []
    for (let k = 0; k < 3; k++) {
      const parts: BufferGeometry[] = []
      for (let i = 0; i < 6; i++) {
        const side = rand() < 0.5 ? 1 : -1
        const where = rand()
        // On a side, the nose or the back bumper.
        const at: [number, number, number] =
          where < 0.55 ? [side * 0.62, 0.42 + rand() * 0.2, -0.9 + rand() * 1.6] : where < 0.8 ? [(rand() - 0.5) * 0.8, 0.55, 0.6 + rand() * 0.4] : [(rand() - 0.5) * 1, 0.32, -1.18]
        const r = 0.09 + rand() * 0.1
        parts.push(P.sphere(r, MUDDY[i % 3], { at, scale: [1.3, 0.8, 1.3] }, 7))
      }
      const g = new Group()
      g.add(solid(merge(parts), this.bag, 1))
      g.visible = false
      v.body.add(g)
      steps.push(g)
    }
    return steps
  }

  /** Falling water: a canvas of soft pale streaks that scrolls (down the rocks, or across the road). */
  private waterTexture() {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 64
    const x = c.getContext('2d')!
    x.fillStyle = '#9FD4F0'
    x.fillRect(0, 0, 64, 64)
    const rand = rng(11)
    for (let i = 0; i < 22; i++) {
      x.fillStyle = rand() < 0.5 ? '#FFFFFF' : '#CFEAF8'
      x.fillRect(Math.floor(rand() * 60), Math.floor(rand() * 64), 2 + Math.floor(rand() * 3), 8 + Math.floor(rand() * 16))
    }
    const tex = this.bag.add(new CanvasTexture(c))
    tex.wrapS = tex.wrapT = RepeatWrapping
    return tex
  }

  /** The rice steps' little waterfall: rocks beside the road, the water tumbling down them into a pool, and its stream
   *  running right across the road (every kart drives through it: washed clean). */
  private waterfall() {
    const st = this.track.stream!
    const { road } = this.track
    const field = this.world.field
    const side = st.side
    const t = road.sampleAt(st.s)
    const g = new Group()
    // The rocks: a stack of big rounded lavender-grey stones, their face toward the road.
    const foot = road.spotAt(st.s, side * (this.track.edge + 4))
    const y0 = Math.min(field.at(foot.x, foot.z), t.y - 0.3)
    const rocks: BufferGeometry[] = []
    const rand = rng(23)
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2
      const r = 1.6 + rand() * 1.2
      const along = Math.cos(a) * 3.2
      const out = 1.5 + Math.abs(Math.sin(a)) * 1.8
      const p = road.spotAt(st.s + along, side * (this.track.edge + 3 + out))
      rocks.push(P.sphere(r, ['#B9B3CC', '#A7A1BD', '#C9C3D8'][i % 3], { at: [p.x, y0 + 1 + rand() * 4.5, p.z], scale: [1, 1.1, 1] }, 9))
    }
    const top = road.spotAt(st.s, side * (this.track.edge + 4.2))
    rocks.push(P.sphere(2.4, '#A7A1BD', { at: [top.x, y0 + 6, top.z], scale: [1.2, 0.8, 1.2] }, 10))
    g.add(solid(merge(rocks), this.bag, 2))
    // The falling water down the rocks' face: a tall strip facing the road.
    const fallTex = this.waterTexture()
    const fallMat = this.bag.add(new MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.9, side: DoubleSide, depthWrite: false }))
    const fall = new Mesh(this.bag.add(new PlaneGeometry(2.6, 6.4)), fallMat)
    const face = road.spotAt(st.s, side * (this.track.edge + 1.9))
    fall.position.set(face.x, y0 + 3.4, face.z)
    fall.rotation.y = Math.atan2(t.tx, t.tz)
    fall.renderOrder = 4
    g.add(fall)
    // The stream across the road (and the grass): a band of moving water, flowing away from the waterfall.
    const streamTex = this.waterTexture()
    streamTex.repeat.set(1, 4)
    const w = (this.track.edge + 3) * 2
    const stream = new Mesh(this.bag.add(new PlaneGeometry(STREAM_LEN, w)), this.bag.add(new MeshBasicMaterial({ map: streamTex, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })))
    stream.rotation.x = -Math.PI / 2
    stream.rotation.z = Math.atan2(t.tx, t.tz) - Math.PI / 2
    stream.position.set(t.x, t.y + 0.09, t.z)
    stream.renderOrder = 4
    g.add(stream)
    const at = new Vector3(face.x, y0 + 3, face.z)
    this.fall = { g, at, water: [fallTex, streamTex], splash: 0 }
    return g
  }

  /** The climb's cloud: a layer of soft blobs across the mountain (white all round inside), the sea of clouds seen from
   *  above it, and the glowing lanterns that show the way through. */
  private cloud() {
    const { y0, y1 } = this.track.def.cloud!
    const b = this.track.road.bounds(120)
    this.scene.add(buildCloudLayer(b, y0, y1, 260, this.track.def.look.seed, this.bag, 0.45))
    this.sea = buildCloudSea(b, y0 + (y1 - y0) * 0.62, this.track.def.look.seed, this.bag)
    this.sea.visible = false
    this.scene.add(this.sea)
    // The lanterns: warm paper lanterns floating over the road (they glow through the white: no fog on them).
    const list = this.track.lanterns
    // (A round paper lantern: ribs round it, a pink cap and base, a tassel.)
    const ribs = [0, 1, 2].map((i) => P.torus(0.33 - Math.abs(i - 1) * 0.08, 0.025, '#FF9A3C', { at: [0, (i - 1) * 0.2, 0], rot: [Math.PI / 2, 0, 0] }))
    const geo = merge([
      P.sphere(0.38, '#FFC46B', { scale: [1, 1.15, 1] }, 14),
      P.sphere(0.24, '#FFF3C4', { at: [0, 0, 0.17], scale: [1, 1.2, 0.6] }, 10),
      ...ribs,
      P.cyl(0.16, 0.2, 0.1, PAL.hotpink, { at: [0, 0.44, 0] }, 10),
      P.cyl(0.2, 0.16, 0.1, PAL.hotpink, { at: [0, -0.44, 0] }, 10),
      P.cyl(0.03, 0.06, 0.3, PAL.hotpink, { at: [0, -0.64, 0] }, 6),
    ])
    const mesh = this.bag.add(new InstancedMesh(this.bag.add(geo), this.bag.add(new MeshBasicMaterial({ vertexColors: true, fog: false })), Math.max(1, list.length)))
    mesh.count = list.length
    mesh.frustumCulled = false
    for (let i = 0; i < list.length; i++) mesh.setColorAt(i, tmpColor.set('#F0E0D0'))
    this.lanterns = { mesh, lit: list.map(() => 0), on: list.map(() => false) }
    this.scene.add(mesh)
  }

  /** Chomphu Phu Kha trees: one leaning over the road at each blossom shower (the petals fall from it), and more along
   *  the way. */
  private blossomTrees() {
    const { road } = this.track
    const field = this.world.field
    const root = new Group()
    const PINKS = ['#FF9EC4', '#FFB7D2', PAL.pink]
    // A tree `out` meters from the road's middle, its blossoms `reach` meters in toward the road (local +x is the road's
    // left: in toward the road is -side).
    const tree = (s: number, side: number, out: number, k: number, reach: number) => {
      const p = road.spotAt(s, side * out)
      const t = road.sampleAt(s)
      const y = field.at(p.x, p.z)
      const g = new Group()
      g.position.set(p.x, y, p.z)
      g.rotation.y = Math.atan2(t.tx, t.tz)
      const H = 4.6 * k
      const lean = Math.atan2(reach, H)
      const parts: BufferGeometry[] = [P.cyl(0.18 * k, 0.28 * k, H, '#8E6E62', { at: [(-side * reach) / 2, H / 2, 0], rot: [0, 0, side * lean] }, 7)]
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2
        parts.push(P.sphere((1.1 + (i % 2) * 0.4) * k, PINKS[i % 3], { at: [-side * reach + Math.cos(a) * 1.2 * k, H + Math.sin(a * 2) * 0.4 * k, Math.sin(a) * 1.3 * k] }, 9))
      }
      g.add(solid(merge(parts), this.bag, 2))
      root.add(g)
      return g
    }
    for (const w of this.track.showers) {
      const out = this.track.edge + 1
      const g = tree(w.s, w.side, out, 1.2, out - this.track.def.half - 0.5)
      const top = road.spotAt(w.s, w.side * (this.track.def.half + 0.5))
      this.trees.push({ at: new Vector3(top.x, road.sampleAt(w.s).y + 5.5, top.z), shake: 0, g })
    }
    const rand = rng(this.track.def.look.seed + 9)
    for (let s = 40; s < road.length - 20; s += 22 + rand() * 26) {
      const y = road.sampleAt(s).y
      const c = this.track.def.cloud
      if (c && y > c.y0 - 2 && y < c.y1) continue
      tree(s, rand() < 0.5 ? 1 : -1, this.track.edge + 3 + rand() * 5, 0.8 + rand() * 0.5, 0.4)
    }
    return root
  }

  // ---------------------------------------------------------------- setting up

  /** Everyone on the grid behind the start line, then the countdown. */
  private toGrid() {
    const start = this.track.def.start
    for (const r of this.racers) {
      const g = GRID[r.id]
      const p = this.track.road.spotAt(start - g.back, g.lat)
      r.d.place(p.x, p.z, p.heading)
      this.where(r)
      r.y = this.groundAt(r)
      this.poseKart(r, 0, 0)
    }
    this.racer('taeng').rider!.nap = true
    this.lastProgress = this.k.progress
    this.camHeading = this.k.d.heading
    this.phase = 'intro'
    this.phaseT = 0
    this.rig.lag = 0.9
    this.rig.setShot(this.overview(), true)
  }

  // ---------------------------------------------------------------- input

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  /** The minimap's dots (Cup.tsx), by racer id. */
  setMapElements(els: Map<string, SVGElement>) {
    this.mapEls = els
  }
  /** A finger on the road, or (on a phone) tilting it with the gas pedal. */
  setSteer(mode: SteerMode, tilt: Tilt | null) {
    this.steer = mode
    this.tilt = mode === 'tilt' ? tilt : null
    this.aimLat = this.k.lat
    if (mode === 'finger') this.gasDown = false
  }
  /** The gas pedal, down or up (tilting). */
  gas(down: boolean) {
    this.lastTouch = this.time
    this.gasDown = down
  }
  /** The phone's setup is showing (turn it sideways, allow the tilt): the race waits for it. */
  setWaiting(on: boolean) {
    this.waiting = on
    if (on) this.gasDown = false
  }
  private get pressing() {
    return this.steer === 'tilt' ? this.gasDown : !!this.finger
  }

  pointerDown(x: number, y: number, id?: string) {
    if (this.waiting) return
    this.lastTouch = this.time
    // On the road it steers at once (before GO it revs: still down at GO is a rocket start); on a tap target it steers
    // once it moves or is held a moment (a quick tap there pokes it).
    this.finger = { x, y, steering: !id && this.steer === 'finger', t: this.time, id }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && this.steer === 'finger' && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    if (this.finger?.steering) this.k.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    if (this.waiting) return
    this.lastTouch = this.time
    void x
    void y
    if (id === 'kart') return this.honk()
    if (id?.startsWith('rival:')) {
      const r = this.racer(id.slice(6) as RacerId)
      this.counts.pokes++
      r.rider!.nap = false
      r.rider!.react('hop')
      r.squash = 0.4
      sfx.boop()
      return
    }
    if (id?.startsWith('mushroom:')) {
      const m = this.shrooms[Number(id.slice(9))]
      if (!m) return
      this.counts.pokes++
      m.squash = 0
      sfx.boingAt(2)
    }
    if (id === 'ducks') {
      this.counts.pokes++
      this.scenery.pokeDucks(this.sceneryEvents)
    }
    if (id === 'waterfall' && this.fall) {
      // A big splash off the rocks.
      this.counts.pokes++
      this.fall.splash = 1
      const a = this.fall.at
      this.splash.burst(a.x, a.y - 2, a.z, 30, 4, 5, 0.22, 1)
      sfx.splash(1.2)
    }
    if (id?.startsWith('tree:')) {
      // The tree shakes and lets go of a flurry of petals.
      const tr = this.trees[Number(id.slice(5))]
      if (!tr || !this.petals) return
      this.counts.pokes++
      tr.shake = 1
      for (let i = 0; i < 40; i++) this.petals.emit(tr.at.x + (Math.random() - 0.5) * 4, tr.at.y + Math.random(), tr.at.z + (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, Math.random(), (Math.random() - 0.5) * 2, 3 + Math.random() * 2, 0.16)
      sfx.chime()
    }
  }

  /** Tap her kart: beep beep! The horn squashes, the kart bounces, the gifts on it wiggle. */
  private honk() {
    this.counts.honks++
    sfx.honk()
    this.giftWiggle = 1
    this.k.squash = 0.35
    const h = this.k.v.horn
    if (h) h.scale.set(1.5, 1.5, 0.6)
  }

  // ---------------------------------------------------------------- per frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  get calm() {
    return false
  }

  update(rawDt: number) {
    if (this.waiting) rawDt = 0
    const dt = this.slow > 0 ? rawDt * 0.35 : rawDt
    this.slow = Math.max(0, this.slow - rawDt)
    this.time += dt
    this.phaseT += dt
    const t = this.time
    this.boostKick = Math.max(0, this.boostKick - dt * 0.8)
    this.tilt?.update(rawDt)
    if (this.finger) {
      this.lastTouch = t
      if (!this.finger.steering && this.steer === 'finger' && t - this.finger.t > 0.25) this.finger.steering = true
    }
    if (this.gasDown) this.lastTouch = t
    // The feel lab's numbers, every frame.
    for (const r of this.racers) {
      r.feel.accel = KART.accel * (r.rival ? 1.1 : 1)
      r.feel.turn = KART.turn
      r.feel.grip = KART.grip
      r.feel.boost = KART.boost
    }
    this.k.base = KART.top
    this.k.feel.top = KART.top * (1 + KART.coin * this.k.coins + MUD.fast * this.k.mud)

    this.updatePhase()
    if (this.phase === 'race' || this.phase === 'finish') {
      this.driveKaylee(dt)
      this.driveRivals(dt)
      for (const r of this.racers) this.step(r, dt)
      this.bumpKarts()
      this.places()
    } else this.rev(dt)

    for (const r of this.racers) {
      this.poseKart(r, dt, t)
      this.trail(r, dt)
      r.rider?.update(dt, t, clamp(-r.d.yawRate / r.feel.turn, -1, 1))
      r.dress?.update(t, clamp(Math.abs(r.d.speed) / KART.top, 0, 1))
    }
    this.kaylee.setWind(clamp(Math.abs(this.k.d.speed) / KART.top, 0, 1))
    const look = this.track.road.spotAt(this.k.s + 20, 0)
    this.kaylee.lookAt(look.x, this.k.y + 1, look.z)
    this.kaylee.update(dt, t)
    const horn = this.k.v.horn
    if (horn) horn.scale.lerp(tmp.set(1, 1, 1), Math.min(1, dt * 8))
    this.giftWiggle = Math.max(0, this.giftWiggle - dt / 0.8)
    animateGifts(this.gifts, t, clamp(Math.abs(this.k.d.speed) / KART.top, 0, 1), this.giftWiggle)
    for (const m of this.shrooms) {
      m.squash = Math.min(1, m.squash + dt / 0.5)
      const s = m.squash < 1 ? Math.cos(m.squash * Math.PI * 3) * (1 - m.squash) ** 2 : 0
      m.g.scale.set(1 + 0.18 * s, 1 - 0.4 * s, 1 + 0.18 * s)
    }
    this.coins.update(dt)
    this.pads.update(t)
    for (const p of [this.dust, this.straw, this.sparkle, this.fireworks, this.confetti, this.splash, this.petals]) p?.update(dt)
    this.updateTricks(dt, t)
    this.scenery.update(dt, t, this.k, this.racers, this.sceneryEvents)
    this.engine(dt)
    this.celebrate(dt)
    this.idleHints()

    // ---- The camera ----
    const d = this.k.d
    this.camHeading += wrap(d.heading - this.camHeading) * (1 - Math.exp(-dt / 0.45))
    this.rig.setShot(this.shot())
    this.rig.update(rawDt)
    this.clearTerrain()
    this.lights.follow(d.x, this.k.y, d.z)
    this.shade(dt)
    this.emitHud()
  }

  /** Each track's trick, every frame: the mud on the karts, the waterfall's water, the blossoms falling, the cloud's
   *  white closing in, the lanterns bobbing (and glowing once she's been under them). */
  private updateTricks(dt: number, t: number) {
    for (const r of this.racers) r.splats.forEach((g, i) => (g.visible = r.mud > i / 3 + 0.01))
    if (this.fall) {
      this.fall.water[0].offset.y += dt * 1.6
      this.fall.water[1].offset.y -= dt * 0.9
      this.fall.splash = Math.max(0, this.fall.splash - dt)
      // Spray at the foot of the fall.
      if (Math.random() < dt * 14) {
        const a = this.fall.at
        this.splash.emit(a.x + (Math.random() - 0.5) * 2, a.y - 2.8, a.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 2 + Math.random() * 2, (Math.random() - 0.5) * 2, 0.7, 0.16, 1)
      }
    }
    if (this.petals) {
      // Petals drift down over every shower near her (always some in the air, so she can see where they are).
      const k = this.k
      for (const w of this.track.showers) {
        if (Math.abs(w.s - k.s) > 80 || Math.random() > dt * 30) continue
        const p = this.track.road.spotAt(w.s + (Math.random() - 0.5) * SHOWER_LEN, (Math.random() - 0.3) * w.side * (this.track.def.half + 1))
        const y = this.track.road.sampleAt(w.s).y
        this.petals.emit(p.x, y + 4 + Math.random() * 2, p.z, (Math.random() - 0.5) * 1.2, -0.3, (Math.random() - 0.5) * 1.2, 4, 0.13)
      }
      for (const tr of this.trees) {
        tr.shake = Math.max(0, tr.shake - dt * 1.5)
        tr.g.rotation.z = Math.sin(t * 22) * 0.04 * tr.shake
      }
    }
    if (this.track.def.cloud) this.updateCloud(dt, t)
  }

  /** Under the forest's big trees (and inside the log) it's shady: the light dims and the sky and haze turn a deep green,
   *  so the fireflies glow. */
  private shadeK = 0
  private sceneryEvents = { quack: sfx.quack, moo: sfx.moo, cheer: sfx.cheer, creak: sfx.creak }
  private shade(dt: number) {
    if (!this.track.dark && this.track.log === null) return
    this.shadeK += (this.track.shadeAt(this.k.s) - this.shadeK) * (1 - Math.exp(-dt * 2.5))
    const k = this.shadeK
    this.lights.ambient.intensity *= 1 - 0.5 * k
    this.lights.sun.intensity *= 1 - 0.78 * k
    ;(this.scene.background as Color).set(this.air.bg).lerp(tmpColor.set('#3E6A5C'), k * 0.85)
    this.fog.color.set(this.air.fog).lerp(tmpColor.set('#4C7A66'), k * 0.85)
    this.scenery.fireflyGlow(k)
  }

  /** The climb's cloud: the haze closes in to white as she climbs into it, and she pops out above into the sunshine,
   *  over the sea of clouds. The lanterns bob; each one she's been under glows bright. */
  private updateCloud(dt: number, t: number) {
    const { y0, y1 } = this.track.def.cloud!
    const y = this.k.y
    const above = y > y1 + 1
    const base = y > y1 ? AIR.above : AIR.cloud
    const k = smooth(y0 - 3, y0 + 5, y) * (1 - smooth(y1 - 4, y1 + 2, y))
    this.cloudK += (k - this.cloudK) * (1 - Math.exp(-dt * 2))
    const c = this.cloudK
    ;(this.scene.background as Color).set(base.bg).lerp(tmpColor.set(AIR.inside.bg), c)
    this.fog.color.set(base.fog).lerp(tmpColor.set(AIR.inside.fog), c)
    this.fog.near = base.near + (AIR.inside.near - base.near) * c
    this.fog.far = base.far + (CLOUD.see - base.far) * c
    const inside = c > 0.6
    if (inside && !this.wasIn) sfx.cloudIn()
    if (this.sea) this.sea.visible = y > y1 - 4
    if (above && !this.wasAbove && this.phase === 'race') {
      sfx.cloudOut()
      this.sparkle.burst(this.k.d.x, y + 3, this.k.d.z, 40, 5, 6, 0.26)
      this.kaylee.react('hop')
    }
    this.wasIn = inside
    this.wasAbove = above
    const L = this.lanterns
    if (!L) return
    const list = this.track.lanterns
    for (let i = 0; i < list.length; i++) {
      const l = list[i]
      L.lit[i] = Math.max(0, L.lit[i] - dt * 1.4)
      const p = this.track.place(l.s, l.lat)
      const lift = L.lit[i] * 0.8
      m4.makeRotationZ(Math.sin(t * 1.3 + i) * 0.08 + Math.sin(t * 9) * 0.25 * L.lit[i])
      m4.setPosition(p.x, p.y + 2.35 + Math.sin(t * 1.6 + i * 0.7) * 0.15 + lift, p.z)
      const sc = 1 + L.lit[i] * 0.35
      m4.scale(tmp.set(sc, sc, sc))
      L.mesh.setMatrixAt(i, m4)
      L.mesh.setColorAt(i, tmpColor.set(L.on[i] ? '#FFFFFF' : '#F0E0D0'))
    }
    L.mesh.instanceMatrix.needsUpdate = true
    if (L.mesh.instanceColor) L.mesh.instanceColor.needsUpdate = true
  }

  /** The intro, the countdown, GO, the finish and the end. */
  private updatePhase() {
    const t = this.phaseT
    if (this.phase === 'intro') {
      if (t > (this.start.again ? 1.6 : 2.6)) {
        this.phase = 'count'
        this.phaseT = 0
      }
    } else if (this.phase === 'count') {
      const n = Math.min(4, Math.floor(t / BEAT) + 1)
      if (!this.told.has(`count${n}`)) {
        this.told.add(`count${n}`)
        sfx.light(n === 4)
        if (n === 4) this.go()
      }
    } else if (this.phase === 'finish' && t > 5.5 && !this.ended) {
      this.ended = true
      this.events.onDone(this.order().indexOf('kaylee') + 1)
    }
  }

  /** GO! The music starts, Grandma Taeng wakes up; a finger already down (or the gas pedal) is a rocket start. */
  private go() {
    this.phase = 'race'
    this.phaseT = 0
    this.music.start()
    this.rig.lag = 0.3
    const taeng = this.racer('taeng').rider!
    taeng.nap = false
    taeng.react('hop')
    const k = this.k
    if (this.pressing) {
      this.rocket = true
      k.d.vroom(1.6)
      sfx.vroom()
      k.pitch.v -= 3
      this.dust.burst(k.d.x, k.y + 0.3, k.d.z, 24, 3, 2.5, 0.3)
    }
  }

  /** Before GO, a finger down (or the gas pedal) revs the engine: the kart squats, the exhaust puffs. */
  private rev(dt: number) {
    const k = this.k
    if (!this.pressing || this.phaseT < 0.3) return
    k.pitch.v -= dt * 3
    if (Math.random() < dt * 24) {
      const b = this.back(k, 0.2)
      this.dust.emit(b.x, k.y + 0.4, b.z, -Math.sin(k.d.heading) * 2, 1.5, -Math.cos(k.d.heading) * 2, 0.6, 0.3, 0)
    }
  }

  /** Her finger (only forward along the road: it picks where across it), tilting the phone, or racing on by herself. */
  private driveKaylee(dt: number) {
    const k = this.k
    const d = k.d
    const road = this.track.road
    const edge = this.track.edge - 0.9
    let target: { x: number; z: number } | null = null
    let cap = 1
    if (k.done >= 0) {
      target = road.spotAt(Math.min(k.s + 14, road.length - 1), PARK.kaylee)
      cap = this.rollOut(k)
    } else if (this.steer === 'tilt') {
      // The tilt slides her aim across the road (full lock: about 9 m/s sideways); held level, she keeps her line.
      this.aimLat = clamp(this.aimLat - (this.tilt?.value ?? 0) * 9 * dt, Math.max(-edge, k.lat - 5), Math.min(edge, k.lat + 5))
      this.fingerLat = this.aimLat
      const ds = KART.near + Math.abs(d.speed) * 0.3
      target = road.spotAt(k.s + ds, this.aimLat)
      cap = this.gasDown ? 1 : KART.cruise
    } else if (this.finger?.steering) {
      const p = this.groundPoint(this.finger.x, this.finger.y)
      if (p) {
        const loc = road.locate(p.x, p.z, k.i, 50)
        this.fingerLat = loc.lat
        const ds = clamp(loc.s - k.s, KART.near, KART.far)
        const most = Math.min(edge, this.track.def.half + KART.offRoad)
        target = road.spotAt(k.s + ds, clamp(loc.lat, -most, most))
      }
    }
    if (!target) {
      // By herself: along the inside of the next bend, but straight over a mushroom or a pad just ahead (the good bits
      // shouldn't need her to aim).
      const look = k.s + this.lookAhead(k.s, 10 + Math.abs(d.speed) * 0.45)
      const showers = this.track.showers.map((w) => ({ s: w.s, lat: 0 }))
      const good = [...this.track.mushrooms, ...this.track.pads, ...this.track.puddles, ...showers, ...this.track.lanterns].map((g) => ({ g, a: g.s - k.s })).filter((x) => x.a > 2 && x.a < 26).sort((a, b) => a.a - b.a)[0]
      const lat = good ? good.g.lat : clamp(road.bendAhead(k.s, 25) * 3, -3, 3)
      target = road.spotAt(look, lat)
      cap = KART.cruise * this.bendSlow(k.s, 1)
    }
    // The grass is slower; the hay bales are past it.
    if (k.grass) cap *= KART.grass
    // The race she loses: on the last stretch she can't quite keep up with the winner, so it edges past.
    if (this.winner !== 'kaylee' && k.done < 0) {
      const win = this.racer(this.winner)
      const lim = herLimit({ gap: win.progress - k.progress, rem: this.track.length - k.progress, within: 70, lead: 1.5, itsSpeed: Math.max(4, win.d.speed), top: k.feel.top })
      if (lim < 1) {
        d.boostT = 0
        cap = Math.min(cap, lim)
      }
    }
    d.cap = Math.min(cap, this.duckCap(k))
    d.hold(target.x, target.z)
    // How fast she's getting on along the road (the rivals keep up with this).
    const rate = (k.progress - this.lastProgress) / Math.max(1e-3, dt)
    this.lastProgress = k.progress
    if (Math.abs(rate) < 60) this.herRate += (rate - this.herRate) * (1 - Math.exp(-dt / 1))
  }

  /** How far ahead to aim, driving by itself: nearer in a tight bend (so the line doesn't cut across the grass). */
  private lookAhead(s: number, far: number) {
    return far / (1 + Math.abs(this.track.road.bendAhead(s, 20)) * 1.4)
  }
  /** Easing off for the bend ahead, driving by itself (`k`: how much this driver brakes for bends). */
  private bendSlow(s: number, k: number) {
    return 1 - clamp((Math.abs(this.track.road.bendAhead(s, 20)) - 0.4) * 0.45 * k, 0, 0.4)
  }
  /** Over the line: easing down to a stop in the clearing. */
  private rollOut(r: Racer) {
    const left = this.track.road.length - 6 - r.s
    return clamp(left / 30, 0, 0.6)
  }

  /** The rivals: along their lane, as fast as the race's story wants them (the rubber band), only the winner over the
   *  line before her. */
  private driveRivals(dt: number) {
    const k = this.k
    const road = this.track.road
    const f = clamp(k.progress / this.track.length, 0, 1)
    const edge = this.track.def.half - 1.2
    for (const r of this.racers.slice(1)) {
      const d = r.d
      const rv = r.rival!
      r.sway += dt * 0.35
      let lane = rv.lane + Math.sin(r.sway) * 2
      // Out of her way: close in front of her, beside her or just behind (where the camera is), a rival steers clear of
      // her line (she never rams one and stops dead, and it never hides her kart).
      const gap = r.progress - k.progress
      const clear = gap < -2 ? 5 : 3.4
      if (k.done < 0 && gap > -14 && gap < 16 && Math.abs(lane - k.lat) < clear - 0.2) lane = k.lat + (Math.sign(lane - k.lat) || Math.sign(rv.lane) || 1) * clear
      if (r.done >= 0) lane = PARK[r.id]
      const look = r.s + this.lookAhead(r.s, 9 + Math.abs(d.speed) * 0.5)
      const target = road.spotAt(Math.min(look, road.length - 1), clamp(lane, -edge, edge))
      d.hold(target.x, target.z)
      let vt: number
      if (r.done >= 0) vt = r.base * this.rollOut(r)
      else if (k.done >= 0) vt = r.base * 0.95
      else vt = rivalPace({ want: scripted(r.script!, f) * BAND.gap, gap, herRate: this.herRate, floor: 8, pull: BAND.pull, rem: this.track.length - r.progress, easeAt: BAND.ease, winner: r.id === this.winner })
      // Behind the story (she's flying, all bursts and coins): they find more speed, up to half as fast again.
      r.base = KART.top * rv.pace
      r.feel.top = clamp(vt, r.base * 0.3, r.base * 1.55)
      let cap = clamp(vt / r.feel.top, 0, 1)
      if (r.done < 0) cap *= this.bendSlow(r.s, rv.bends)
      if (r.grass) cap *= KART.grass
      d.cap = Math.min(cap, this.duckCap(r))
    }
  }

  /** Waiting a moment for the ducks to cross (rice steps): the share of its top speed a kart may go (1: no limit). */
  private duckCap(r: Racer) {
    const v = this.scenery.hold(r.s)
    return v === Infinity ? 1 : v / Math.max(1, r.feel.top)
  }

  /** Where a racer is on the road now. */
  private where(r: Racer) {
    const loc = this.track.road.locate(r.d.x, r.d.z, r.s ? r.i : undefined, 14)
    r.i = loc.i
    r.s = loc.s
    r.lat = loc.lat
    r.progress = r.s - this.track.def.start
    r.grass = Math.abs(r.lat) > this.track.def.half + 0.3
  }

  /** The ground under a racer: the road's height on it, the forest floor off it. */
  private groundAt(r: Racer) {
    if (Math.abs(r.lat) < this.track.def.half + 1.4) return this.track.road.sampleAt(r.s).y + 0.03
    return Math.max(this.world.field.at(r.d.x, r.d.z), this.track.road.sampleAt(r.s).y - 0.25)
  }

  /** One racer's step: drive, the hay bales, where it is now, the line, the track's things. */
  private step(r: Racer, dt: number) {
    const d = r.d
    const ev = d.step(dt)
    if (ev.landed !== undefined && ev.landed > 1) this.land(r, ev.landed)
    this.hayBales(r)
    r.bumpCool -= dt
    r.padCool -= dt
    r.bounceCool -= dt
    this.where(r)
    this.atTheLine(r)
    if (r.done < 0 && r.progress >= this.track.length) this.crossed(r)
    if (r.done >= 0 || this.phase !== 'race') return
    // (The rivals get the bursts too, except on the last stretch: there the story says who's beside her at the line.)
    const bursts = r === this.k || r.progress < this.track.length * 0.85
    // Gold arrow pads: a burst of speed.
    if (this.pads.on(r.s, r.lat) && r.padCool <= 0 && !d.airborne) {
      r.padCool = 0.8
      if (bursts) d.vroom(KART.pad)
      if (r === this.k) {
        this.counts.pads++
        sfx.zoom()
        this.boostKick = 0.8
      }
      this.sparkle.burst(d.x, r.y + 0.4, d.z, 10, 2, 2, 0.14)
    }
    // A bouncy mushroom: BOING, up into the air.
    const m = !d.airborne && r.bounceCool <= 0 ? this.track.mushroomAt(r.s, r.lat) : undefined
    if (m) {
      r.bounceCool = 0.6
      d.jump(m.big ? BOUNCE.big : BOUNCE.up)
      const sh = this.shrooms.find((x) => x.m === m)
      if (sh) sh.squash = 0
      r.squash = 0.2
      sfx.boingAt(m.big ? 3 : 1)
      if (r === this.k) {
        this.counts.bounces++
        if (m.big) this.counts.bigBounces++
        this.slow = Math.max(this.slow, BOUNCE.slow * (m.big ? 1.6 : 1))
        sounds.sparkle()
      } else r.rider?.react('hop')
    }
    r.splashCool -= dt
    // A puddle: SPLASH, muddier (and a little faster).
    const pud = !d.airborne && r.splashCool <= 0 ? this.track.puddleAt(r.s, r.lat) : undefined
    if (pud) {
      r.splashCool = 0.7
      r.mud = Math.min(1, r.mud + MUD.each)
      r.squash = 0.3
      r.pitch.v += 1.2
      const sp = Math.abs(d.speed)
      for (const side of [1, -1]) {
        const lx = Math.cos(d.heading) * side
        const lz = -Math.sin(d.heading) * side
        for (let i = 0; i < (r === this.k ? 18 : 8); i++)
          this.splash.emit(d.x + lx * 0.8, r.y + 0.3, d.z + lz * 0.8, lx * (2 + Math.random() * 3) + Math.sin(d.heading) * sp * 0.3, 3 + Math.random() * 4, lz * (2 + Math.random() * 3) + Math.cos(d.heading) * sp * 0.3, 0.9, 0.2 + Math.random() * 0.12, Math.floor(Math.random() * 5))
      }
      if (r === this.k) {
        this.counts.splashes++
        sfx.splash(0.8)
        sfx.puddle()
        this.slow = Math.max(this.slow, MUD.splash)
        this.kaylee.react('hop')
      } else r.rider?.react('hop')
    }
    // The waterfall's stream: washed clean, and a burst of speed.
    if (this.track.inStream(r.s) && r.splashCool <= 0) {
      r.splashCool = 1.5
      const was = r.mud
      r.mud = 0
      if (bursts) d.vroom(MUD.wash)
      this.splash.burst(d.x, r.y + 1.5, d.z, r === this.k ? 40 : 14, 3, 4, 0.22, 1)
      if (r === this.k) {
        this.counts.washes++
        sfx.splash(1.4)
        this.later(() => sounds.sparkle(), 250)
        this.sparkle.burst(d.x, r.y + 1, d.z, was > 0 ? 30 : 12, 3, 3, 0.16)
        this.boostKick = 0.8
      }
    }
    // The forest's stream: a big splash through it.
    if (this.track.inFord(r.s) && r.splashCool <= 0 && !d.airborne) {
      r.splashCool = 0.9
      r.squash = 0.4
      r.pitch.v += 1
      const sp = Math.abs(d.speed)
      for (const side of [1, -1]) {
        const lx = Math.cos(d.heading) * side
        const lz = -Math.sin(d.heading) * side
        for (let i = 0; i < (r === this.k ? 16 : 6); i++)
          this.splash.emit(d.x + lx * 0.8, r.y + 0.3, d.z + lz * 0.8, lx * (2 + Math.random() * 3) + Math.sin(d.heading) * sp * 0.3, 3 + Math.random() * 4, lz * (2 + Math.random() * 3) + Math.cos(d.heading) * sp * 0.3, 0.9, 0.2 + Math.random() * 0.1, Math.floor(Math.random() * 3))
      }
      if (r === this.k) {
        this.counts.fords++
        sfx.splash(1)
        this.kaylee.react('hop')
      } else r.rider?.react('hop')
    }
    // The bamboo bridge: bumpy, the poles clatter under the wheels.
    if (this.track.onBridge(r.s) && !d.airborne) r.pitch.v += (Math.random() - 0.5) * dt * 40
    // A blossom shower: petals swirl round the kart, and a burst of speed.
    const sh = r.padCool <= 0 && !d.airborne ? this.track.showerAt(r.s, r.lat) : undefined
    if (sh && this.petals) {
      r.padCool = SHOWER_LEN / Math.max(4, Math.abs(d.speed)) + 0.3
      if (bursts) d.vroom(CLOUD.petals)
      for (let i = 0; i < (r === this.k ? 36 : 12); i++) this.petals.emit(d.x + (Math.random() - 0.5) * 2, r.y + 0.5 + Math.random() * 1.5, d.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 5, 1 + Math.random() * 3, (Math.random() - 0.5) * 5, 2.2, 0.15)
      if (r === this.k) {
        this.counts.showers++
        sfx.zoom()
        sfx.chime()
        this.boostKick = 0.8
      }
    }
    if (r !== this.k) return
    // Under a lantern in the cloud: it lights up bright, bobs and chimes, one note higher each time.
    const L = this.lanterns
    if (L)
      this.track.lanterns.forEach((l, i) => {
        if (L.on[i] || Math.abs(l.s - r.s) > 1.6 || Math.abs(l.lat - r.lat) > CLOUD.lantern) return
        L.on[i] = true
        L.lit[i] = 1
        this.counts.lanterns++
        sounds.note(Math.min(10, this.counts.lanterns % 11))
        const p = this.track.place(l.s, l.lat)
        this.sparkle.burst(p.x, p.y + 2.35, p.z, 10, 1.5, 1.5, 0.12, 1)
      })
    if (r.grass && !d.airborne) {
      this.counts.grass += dt
      if (Math.random() < dt * 5) sfx.rumble()
    }
    for (const c of this.coins.take(d.x, r.y + d.y, d.z)) {
      this.counts.coinsTaken++
      r.coins = Math.min(10, r.coins + 1)
      sounds.note(Math.min(10, r.coins))
      this.sparkle.burst(c.x, c.y, c.z, 6, 1.5, 2, 0.12, 1)
    }
    if (r.progress > this.track.length * 0.86 && !this.told.has('final')) {
      this.told.add('final')
      this.banner = { kind: 'final', n: this.time }
      this.music.setFinal(true)
    }
  }

  /** Only the race's winner crosses the line first (her, or the home rival in the race she loses): anyone else who
   *  gets there before (a bump, a rival rolling on) waits right at the line until the winner is over. */
  private atTheLine(r: Racer) {
    const hold = this.track.length - 0.6
    if (r.done >= 0 || r.progress <= hold || this.phase !== 'race') return
    const k = this.k
    const may = r === k ? this.winner === 'kaylee' || this.racer(this.winner).done >= 0 : r.id === this.winner || k.done >= 0
    if (may) return
    const p = this.track.road.sampleAt(r.s)
    const over = r.progress - hold
    r.d.x -= p.tx * over
    r.d.z -= p.tz * over
    const fwd = r.d.vx * p.tx + r.d.vz * p.tz
    if (fwd > 0) {
      r.d.vx -= p.tx * fwd
      r.d.vz -= p.tz * fwd
    }
    this.where(r)
  }

  /** Over the finish line: her (first or second), or the winner of the race she loses. */
  private crossed(r: Racer) {
    r.done = this.time
    if (r === this.k) return this.finished()
    if (r.id === this.winner && this.k.done < 0) {
      // A photo finish: slow motion as the winner noses over the line, the camera head on.
      this.photoFinish = true
      this.slow = SLOWMO
      r.rider?.react('wave', 4)
      sfx.cheer()
    } else r.rider?.react('wave', 2)
  }

  /** She's over the line: first (fanfare, fireworks, the crowd) or second by a nose (so close! a silver cheer). */
  private finished() {
    const k = this.k
    k.done = this.time
    const place = this.order().indexOf('kaylee') + 1
    this.phase = 'finish'
    this.phaseT = 0
    this.slow = SLOWMO
    this.banner = { kind: place === 1 ? 'win' : 'second', n: this.time }
    this.rig.setShot(this.shot(), true)
    this.music.stop()
    this.fireworkT = 0
    if (place === 1) {
      sounds.fanfare()
      sfx.cheer()
    } else {
      sfx.soClose()
      this.later(() => sounds.correct(), 900)
    }
    this.kaylee.react('hop')
  }

  /** Everyone's place: those over the line by when they crossed, then by how far along they are. */
  private order(): RacerId[] {
    return [...this.racers]
      .sort((a, b) => {
        if (a.done >= 0 || b.done >= 0) return (a.done < 0 ? Infinity : a.done) - (b.done < 0 ? Infinity : b.done)
        return b.progress - a.progress
      })
      .map((r) => r.id)
  }

  private places() {
    const order = this.order()
    const place = order.indexOf('kaylee') + 1
    if (this.phase === 'race' && place > this.lastPlace && this.phaseT > 3) this.racer(order[place - 2]).rider?.react('wave', 1)
    this.lastPlace = place
  }

  /** Karts bounce off each other (hers is the heavy one: it barely gives). */
  private bumpKarts() {
    const rs = this.racers
    for (let a = 0; a < rs.length; a++)
      for (let b = a + 1; b < rs.length; b++) {
        const A = rs[a]
        const B = rs[b]
        if (Math.hypot(A.d.x - B.d.x, A.d.z - B.d.z) > 4) continue
        if (Math.abs(A.d.y - B.d.y) > 1) continue
        for (const pa of A.v.hull.at)
          for (const pb of B.v.hull.at) {
            const ax = A.d.x + Math.sin(A.d.heading) * pa
            const az = A.d.z + Math.cos(A.d.heading) * pa
            const bx = B.d.x + Math.sin(B.d.heading) * pb
            const bz = B.d.z + Math.cos(B.d.heading) * pb
            const min = A.v.hull.r + B.v.hull.r
            const dd = Math.hypot(ax - bx, az - bz)
            if (dd >= min || dd < 1e-4) continue
            const nx = (ax - bx) / dd
            const nz = (az - bz) / dd
            const share = A === this.k ? 0.2 : B === this.k ? 0.8 : 0.5
            const push = min - dd
            A.d.x += nx * push * share
            A.d.z += nz * push * share
            B.d.x -= nx * push * (1 - share)
            B.d.z -= nz * push * (1 - share)
            const vn = (A.d.vx - B.d.vx) * nx + (A.d.vz - B.d.vz) * nz
            if (vn >= 0) continue
            const j = -1.5 * vn
            A.d.vx += nx * j * share
            A.d.vz += nz * j * share
            B.d.vx -= nx * j * (1 - share)
            B.d.vz -= nz * j * (1 - share)
            if (-vn * 1.5 > 1.5 && A.bumpCool <= 0) {
              A.bumpCool = B.bumpCool = 0.5
              if (A === this.k || B === this.k) this.counts.bumps++
              sfx.boing()
              A.squash = B.squash = 0.3
              A.roll.v += nz * 2
              B.roll.v -= nz * 2
              A.rider?.react('hop')
              B.rider?.react('hop')
              this.dust.burst((ax + bx) / 2, A.y + 0.4, (az + bz) / 2, 8, 2, 2, 0.2)
            }
          }
      }
  }

  /** The hay bales past the grass keep every kart on the track: a soft boing back on. */
  private hayBales(r: Racer) {
    const d = r.d
    const road = this.track.road
    for (const at of r.v.hull.at) {
      const px = d.x + Math.sin(d.heading) * at
      const pz = d.z + Math.cos(d.heading) * at
      const loc = road.locate(px, pz, r.i, 12)
      // (Past the end of the road, the clearing's bales too.)
      // (On the bamboo bridge, the rails are the edge.)
      const lim = (this.track.onBridge(loc.s) ? this.track.def.half + 0.15 : this.track.edge) - r.v.hull.r
      if (Math.abs(loc.lat) <= lim && loc.s < road.length - 0.5) continue
      const p = road.sampleAt(loc.s)
      const side = Math.sign(loc.lat)
      let nx = -p.lx * side
      let nz = -p.lz * side
      let depth = Math.abs(loc.lat) - lim
      if (loc.s >= road.length - 0.5) {
        nx = -p.tx
        nz = -p.tz
        depth = Math.max(depth, 0.2)
      }
      if (depth <= 0) continue
      d.x += nx * depth
      d.z += nz * depth
      const hit = d.bounce(nx, nz, 0.5)
      if (hit > 1.4 && r.bumpCool <= 0) {
        r.bumpCool = 0.4
        r.squash = 0.4
        if (r === this.k) {
          this.counts.bales++
          sfx.boing()
        }
        this.straw.burst(px - nx * 0.8, r.y + 0.6, pz - nz * 0.8, 12, 2.5, 3, 0.16)
      }
    }
  }

  /** Back down off a mushroom: a thump, a puff of dust, a little burst of speed. */
  private land(r: Racer, v: number) {
    sfx.thump()
    r.squash = 0
    r.pitch.v += 1.4
    this.dust.burst(r.d.x, r.y + 0.2, r.d.z, 14, 3, 1.5, 0.3)
    r.d.vroom(0.6)
    if (r === this.k) {
      this.boostKick = 0.6
      this.sparkle.burst(r.d.x, r.y + 0.8, r.d.z, 16, 2.5, 2.5, 0.15)
    }
    void v
  }

  /** The point `back` meters behind a kart's tail. */
  private back(r: Racer, back: number) {
    const d = r.d
    return { x: d.x + Math.sin(d.heading) * (r.v.stern - back), z: d.z + Math.cos(d.heading) * (r.v.stern - back) }
  }

  /** Where each kart is, how it sits on the road (up and down the hills), leans, squashes, and shakes on the grass. */
  private poseKart(r: Racer, dt: number, t: number) {
    const d = r.d
    const v = r.v
    const sp = d.speed / Math.max(1, d.feel.top)
    const spring = (s: { x: number; v: number }, target: number, k: number, damp: number) => {
      s.v += ((target - s.x) * k - s.v * damp) * dt
      s.x += s.v * dt
    }
    const g = this.groundAt(r)
    r.y += (g - r.y) * Math.min(1, dt * 14)
    if (dt === 0) r.y = g
    spring(r.roll, 0, 60, 5)
    const grade = this.track.road.sampleAt(r.s).grade
    spring(r.pitch, -Math.atan(grade) - (d.boostT > 0 ? 0.06 : 0) + (d.airborne ? clamp(-d.vy * 0.02, -0.15, 0.15) : 0), 50, 8)
    r.squash = Math.min(1, r.squash + dt / 0.45)
    const shake = r.grass && !d.airborne ? Math.sin(t * 47 + r.sway) * 0.035 * Math.min(1, Math.abs(sp) * 2) : 0
    v.root.position.set(d.x, r.y + d.y, d.z)
    v.root.rotation.set(0, d.heading, 0)
    v.body.rotation.set(r.pitch.x, 0, d.roll + r.roll.x * 0.12 + shake)
    v.body.position.y = Math.abs(shake) * 2
    const s = r.squash < 1 ? Math.cos(r.squash * Math.PI * 3) * (1 - r.squash) ** 2 : 0
    v.body.scale.set(1 + 0.1 * s, 1 - 0.18 * s, 1 + 0.05 * s)
    v.animate(clamp(-d.yawRate / d.feel.turn, -1, 1), Math.min(1.5, Math.abs(sp)), t, dt)
  }

  /** Dust off the back wheels (more on the grass, and fast), sparkles while a burst lasts. */
  private trail(r: Racer, dt: number) {
    const d = r.d
    const speed = Math.abs(d.speed)
    if (d.airborne || speed < 2) return
    const n = (r.grass ? 30 : 6) * Math.min(1, speed / 10) * dt * (r === this.k ? 1 : 0.5)
    if (Math.random() < n) {
      const b = this.back(r, 0)
      const q = (Math.random() - 0.5) * 1.2
      this.dust.emit(b.x + Math.cos(d.heading) * q, r.y + 0.2, b.z - Math.sin(d.heading) * q, -Math.sin(d.heading) * 1.5, 1.2 + Math.random(), -Math.cos(d.heading) * 1.5, 0.7, r.grass ? 0.3 : 0.22, r.grass ? 3 : Math.floor(Math.random() * 3))
    }
    if (d.boostT > 0 && Math.random() < dt * 40) {
      const b = this.back(r, 0.2)
      this.sparkle.emit(b.x, r.y + 0.4, b.z, (Math.random() - 0.5) * 1.5, 1.5, (Math.random() - 0.5) * 1.5, 0.5, 0.16)
    }
  }

  /** The engine: a buzz that climbs with her speed (revving on the grid). */
  private engine(dt: number) {
    const d = this.k.d
    const rev = this.pressing && (this.phase === 'count' || this.phase === 'intro') ? 0.9 : 0
    const sp = Math.max(rev, Math.min(1.4, Math.abs(d.speed) / KART.top))
    if (sp < 0.04 || this.ended) return
    this.engineT += dt
    if (this.engineT > 1 / (5 + 13 * sp)) {
      this.engineT = 0
      sfx.engine(Math.min(1, sp + (d.boostT > 0 ? 0.3 : 0)) * 0.6)
    }
  }

  /** Fireworks over the finish (a few for second, lots for first), confetti. */
  private celebrate(dt: number) {
    if (this.phase !== 'finish') return
    const first = this.order()[0] === 'kaylee'
    this.fireworkT -= dt
    if (Math.random() < dt * 30) {
      const p = this.track.place(this.track.def.finish + 6, 0)
      this.confetti.emit(p.x + (Math.random() - 0.5) * 14, p.y + 10, p.z + (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 1.2, 0, (Math.random() - 0.5) * 1.2, 5, 0.16)
    }
    if (this.fireworkT > 0) return
    this.fireworkT = first ? 0.55 : 1.2
    const c = this.track.place(this.track.def.finish + 10, 0)
    const x = c.x + (Math.random() - 0.5) * 40
    const z = c.z + (Math.random() - 0.5) * 40
    const y = c.y + 20 + Math.random() * 10
    const color = Math.floor(Math.random() * 8)
    for (let i = 0; i < 46; i++) {
      const a = Math.random() * Math.PI * 2
      const b = Math.acos(Math.random() * 2 - 1)
      const s = 7 + Math.random() * 2
      this.fireworks.emit(x, y, z, Math.sin(b) * Math.cos(a) * s, Math.cos(b) * s, Math.sin(b) * Math.sin(a) * s, 1.6 + Math.random() * 0.5, 0.55, (color + (i % 3 === 0 ? 1 : 0)) % 8)
    }
    sfx.bang()
  }

  /** After a while with nothing touched: a finger on the road ahead (at the start, and while racing). Tilting, the gas
   *  pedal shows its own finger instead. */
  private idleHints() {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    const idle = this.time - this.lastTouch
    if (this.steer === 'finger' && ((this.phase === 'count' && !this.finger) || (this.phase === 'race' && idle > 7 && this.k.done < 0))) {
      // (In the cloud: on the next lantern's line.)
      const l = this.track.lanterns.find((x) => x.s > this.k.s + 8)
      const lat = l && l.s < this.k.s + 30 ? l.lat : 0
      const p = this.track.place(this.k.s + 14, lat)
      at = new Vector3(p.x, p.y + 0.3, p.z)
    }
    const s = at ? this.toScreen(at, 1) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- camera

  /** Up over the grid and the start arch (the first look), then down behind her kart. */
  private overview(): Shot {
    const g = this.track.place(this.track.def.start - 6, 0)
    return { center: new Vector3(g.x, g.y + 1.5, g.z), half: new Vector3(9, 3, 9), yaw: this.unwrap(g.heading / deg + 180 - 32), pitch: 30, minDist: 12, maxDist: 50 }
  }

  private shot(): Shot {
    const k = this.k
    const d = k.d
    if (this.phase === 'intro' && this.phaseT < 1.4 && !this.start.again) return this.overview()
    if ((this.phase === 'finish' && this.phaseT < 2.6) || (this.photoFinish && this.phase === 'race')) {
      // Head on as she crosses, from just past the line, a little to the side away from the winner.
      const other = this.racer(this.winner === 'kaylee' ? (HOME[this.start.track] as RacerId) : this.winner)
      const side = k.lat > other.lat ? 1 : -1
      return { center: new Vector3(d.x, k.y + 1, d.z), half: new Vector3(3.2, 1.6, 2.6), yaw: this.unwrap(d.heading / deg + side * 16), pitch: 11, minDist: 6, maxDist: 30 }
    }
    const sp = clamp(Math.abs(d.speed) / KART.top, 0, 1.6)
    const tall = clamp((1 - this.w / this.h) / 0.4, 0, 1)
    const zoom = (1 + 0.2 * sp + 0.25 * this.boostKick) * (1 - 0.2 * tall)
    const ahead = 5 * Math.min(1, 0.4 + sp)
    return {
      // (Up with her in the air, so the mushroom doesn't fill the screen.)
      center: new Vector3(d.x + Math.sin(d.heading) * ahead, k.y + 0.8 + d.y * 0.7, d.z + Math.cos(d.heading) * ahead),
      half: new Vector3(4 * zoom, 1.7, 4.6 * zoom),
      yaw: this.unwrap(this.camHeading / deg + 180 + 4),
      pitch: 15,
      minDist: 5,
      maxDist: 50,
      follow: true,
    }
  }

  private unwrap(yaw: number) {
    return this.rig.yaw + wrapDeg(yaw - this.rig.yaw)
  }

  /** The camera never sits inside a hill or looks through one: it rises over it. */
  private clearTerrain() {
    const cam = this.rig.camera
    const field = this.world.field
    const p = cam.position
    const target = tmp2.set(this.k.d.x, this.k.y + 1, this.k.d.z)
    let lift = Math.max(0, field.at(p.x, p.z) + 1.8 - p.y)
    for (const k of [0.25, 0.5, 0.75]) {
      const x = p.x + (target.x - p.x) * k
      const z = p.z + (target.z - p.z) * k
      const yy = p.y + lift + (target.y - p.y - lift) * k
      const g = field.at(x, z) + 0.6
      if (g > yy) lift += (g - yy) / (1 - k)
    }
    if (lift <= 0) return
    p.y += Math.min(lift, 20)
    cam.lookAt(target)
  }

  // ---------------------------------------------------------------- the screen

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  /** Where a finger at (x, y) on the screen is on the ground: on a level at her kart's height, then again at the
   *  road's height there (the hills). */
  private groundPoint(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const ray = this.raycaster.ray
    if (ray.direction.y > -0.02) return null
    let h = this.k.y
    const hit = new Vector3()
    for (let i = 0; i < 2; i++) {
      const t = (h - ray.origin.y) / ray.direction.y
      if (t <= 0) return null
      hit.copy(ray.origin).addScaledVector(ray.direction, Math.min(t, 140))
      h = this.track.road.sampleAt(this.track.road.locate(hit.x, hit.z, this.k.i, 80).s).y
    }
    return hit
  }

  private toScreen(at: Vector3, r: number, max = 150) {
    const cam = this.rig.camera
    const center = at.clone().project(cam)
    if (center.z > 1 || Math.abs(center.x) > 1.05 || Math.abs(center.y) > 1.05) return null
    const right = tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const edge = at.clone().addScaledVector(right, r).project(cam)
    return {
      x: ((center.x + 1) / 2) * this.w,
      y: ((1 - center.y) / 2) * this.h,
      size: clamp(Math.abs(edge.x - center.x) * this.w, 64, max),
      z: Math.round((1 - center.z) * 10000),
    }
  }

  /** Where each tap target sits now (null: hidden), and its priority where they overlap. */
  private anchorAt(id: string): { at: Vector3; r: number; prio: number; max?: number } | null {
    const k = this.k
    if (id === 'kart') {
      const at = k.v.root.getWorldPosition(new Vector3())
      at.y += 0.7
      return { at, r: 1.2, prio: 1, max: 130 }
    }
    if (id.startsWith('rival:')) {
      const r = this.racer(id.slice(6) as RacerId)
      if (Math.hypot(r.d.x - k.d.x, r.d.z - k.d.z) > 45) return null
      const at = r.rider!.head.getWorldPosition(new Vector3())
      at.y += 0.3
      return { at, r: 0.8, prio: 2, max: 110 }
    }
    if (id.startsWith('mushroom:')) {
      const m = this.shrooms[Number(id.slice(9))]
      if (!m || Math.hypot(m.g.position.x - k.d.x, m.g.position.z - k.d.z) > 50) return null
      return { at: m.g.position.clone().setY(m.g.position.y + 0.6), r: m.m.r * 0.8, prio: 0, max: 140 }
    }
    if (id === 'ducks') {
      const at = this.scenery.duckAt()
      if (!at || at.distanceTo(tmp.set(k.d.x, k.y, k.d.z)) > 40) return null
      return { at: at.clone().setY(at.y + 0.6), r: 1.2, prio: 1, max: 140 }
    }
    if (id === 'waterfall') {
      if (!this.fall || this.fall.at.distanceTo(tmp.set(k.d.x, k.y, k.d.z)) > 50) return null
      return { at: this.fall.at, r: 1.4, prio: 0, max: 140 }
    }
    if (id.startsWith('tree:')) {
      const tr = this.trees[Number(id.slice(5))]
      if (!tr || tr.at.distanceTo(tmp.set(k.d.x, k.y, k.d.z)) > 45) return null
      return { at: tr.at, r: 1.5, prio: 0, max: 130 }
    }
    return null
  }

  placeAnchors() {
    for (const [id, el] of this.anchorEls) {
      const a = this.ended ? null : this.anchorAt(id)
      const s = a ? this.toScreen(a.at, a.r, a.max) : null
      if (s && a) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z + a.prio * 3000)
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    // The minimap's dots.
    for (const r of this.racers) {
      const el = this.mapEls.get(r.id)
      if (!el) continue
      const [mx, my] = this.track.map.xy(r.d.x, r.d.z)
      el.setAttribute('cx', mx.toFixed(1))
      el.setAttribute('cy', my.toFixed(1))
    }
  }

  private emitHud() {
    const order = this.order()
    const count = this.phase === 'count' ? 3 - Math.min(3, Math.floor(this.phaseT / BEAT)) : this.phase === 'race' && this.phaseT < 0.9 ? 0 : -1
    const hud: KartHud = { phase: this.phase, count, lap: 1, place: order.indexOf('kaylee') + 1, order, coins: this.k.coins, banner: this.banner, trophy: false }
    const key = JSON.stringify(hud)
    if (key === this.lastHud) return
    this.lastHud = key
    this.events.onHud(hud)
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const r2 = (v: number) => Math.round(v * 100) / 100
    return {
      section: 'race',
      track: this.start.track,
      result: this.start.result,
      winner: this.winner,
      gifts: this.gifts.map((g) => g.id),
      phase: this.phase,
      ended: this.ended,
      place: this.order().indexOf('kaylee') + 1,
      order: this.order(),
      coins: this.k.coins,
      finished: this.k.done >= 0,
      length: this.track.length,
      racers: Object.fromEntries(this.racers.map((r) => [r.id, { s: r2(r.s), lat: r2(r.lat), progress: r2(r.progress), speed: r2(r.d.speed), done: r.done >= 0, grass: r.grass }])),
      speed: r2(this.k.d.speed),
      airborne: this.k.d.airborne,
      rocket: this.rocket,
      // (Where the road's middle is on the screen a little ahead of her: QA's finger aims there.)
      aim: (() => {
        const p = this.track.place(this.k.s + 16, 0)
        const sc = this.toScreen(new Vector3(p.x, p.y, p.z), 1)
        return sc ? { x: Math.round(sc.x), y: Math.round(sc.y) } : null
      })(),
      steer: { mode: this.steer, gas: this.gasDown, tilt: r2(this.tilt?.value ?? 0), live: this.tilt?.live ?? false, aim: r2(this.aimLat), waiting: this.waiting },
      ...this.counts,
      grass: r2(this.counts.grass),
      mud: r2(this.k.mud),
      scenery: { ...this.scenery.counts, duckWait: r2(this.scenery.counts.duckWait), shade: r2(this.shadeK), ducks: this.scenery.duckState },
      cloud: this.track.def.cloud ? { in: r2(this.cloudK), above: this.wasAbove, lanterns: this.track.lanterns.length } : null,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  private later(fn: () => void, ms: number) {
    this.timers.push(window.setTimeout(fn, ms))
  }

  dispose() {
    for (const t of this.timers) clearTimeout(t)
    this.music.stop()
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

