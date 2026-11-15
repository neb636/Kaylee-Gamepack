// Narwhal Ride (the Poles' story, chapter 2): the balloon is moored out past the icebergs, too far to hop, so Nari the
// narwhal, the unicorn of the sea, gives Pola and Pebble a ride there on her back.
//
// The toy (core verb): steer Nari, with the finger wheel the Penguin Slide and the Nan drive use (engine3d/wheel.ts):
// her finger goes down anywhere, a circle appears under it, and pushing left or right swims Nari that way. Nari swims
// forward by herself; let go and she drifts back to the middle of the channel. Nothing stops her: a floe or an iceberg
// is a boing and a giggle. The verb deepens three ways along one course (course.ts): open water (floes to weave
// between, leaping fish to scoop up, little ramps of ice that pop her into the air), among the icebergs (a slalom, two
// channels, then down under the sea ice, where every iceberg turns out to be far bigger below the water than above
// it, and up through a hole), and the glacier (a new iceberg cracks off its wall and sends rolling waves that lift her
// into the air), then the balloon on its floe.
//
// Pebble stays dry under the ice: Nari blows the riders a big air bubble to sit in. Built for engine3d/View3D.tsx with
// the films' props (story/props.ts) and cast (story/actor.ts); nothing here comes from Thailand. The steering and the
// ride are feel-lab knobs (?feel=1).
import { BackSide, Color, Euler, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Scene, SphereGeometry, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { clamp } from '../../../../../sdk'
import { TO_DEG } from '../../../../../sdk/math'
import { knobs, watch } from '../../../../kit/knobs'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL, toon } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { Water } from '../../../../engine3d/water'
import { FingerWheel } from '../../../../engine3d/wheel'
import { Actor } from '../../story/actor'
import { Balloon, bergGeo, floeGeo, ICE, ICE_BLUE, ICE_SHADE, mountainGeo, Narwhal, rng, skyDisc } from '../../story/props'
import { BACK_WALL, BALLOON, BERGS, CALVE, cx, dcx, DIVE, DOCK, FISH, FLOES, FORK, GLACIER, half, KEELS, lane, OPEN_END, rampAt, RAMPS, ridge, ROW, SPOTS, WALL_LAT } from './course'
import { Critter } from './critters'
import type { NarwhalSection } from './sections'
import { rideSfx } from './sounds'

const FILE = 'src/world/places/poles/activities/narwhal/ride.ts'
/** The finger wheel: the numbers tuned by hand for the Nan drive and the Penguin Slide's swim, as the start for a narwhal. */
const STEER = knobs('nari', 'Steering Nari', FILE, {
  slide: { value: 6, min: 1, max: 12, step: 0.1, label: 'Sideways speed', unit: 'm/s', note: 'how fast a full push swims her across the channel' },
  reach: { value: 1.2, min: 0.4, max: 2.5, step: 0.05, label: 'Wheel size', unit: '×', note: 'how far her finger moves for a full push (smaller = touchier)' },
  dead: { value: 0.15, min: 0, max: 0.4, step: 0.01, label: 'Dead middle', note: 'share of the wheel near the middle that counts as straight' },
  curve: { value: 1.3, min: 1, max: 3, step: 0.05, label: 'Gentle small pushes', note: '1 = even all the way; higher = a small push barely steers' },
  ease: { value: 0.08, min: 0, max: 0.6, step: 0.01, label: 'Smoothing', unit: 's', note: 'how long a quick flick takes to count in full (0 = none)' },
  aim: { value: 10, min: 3, max: 24, step: 0.5, label: 'Aim ahead', unit: 'm', note: 'the nearest point she steers toward: closer = sharper, but she swings back and forth' },
  pull: { value: 1.2, min: 0, max: 4, step: 0.1, label: 'Aim closer when far off', note: 'per meter she is from where the finger steers: a full push swerves more' },
  turn: { value: 0.6, min: 0.2, max: 1.2, step: 0.02, label: 'Sharpest swerve', unit: 'rad', note: 'how steeply she can cut across the channel' },
  back: { value: 1.6, min: 0.3, max: 4, step: 0.1, label: 'Back to the middle', unit: 's', note: 'how slowly she drifts back to the middle of the channel after the finger lets go' },
})
/** The ride itself. */
const RIDE = knobs('nariRide', 'The ride', FILE, {
  speed: { value: 7.5, min: 3, max: 14, step: 0.25, label: 'Swim speed', unit: 'm/s', note: 'among the icebergs and by the glacier' },
  calm: { value: 0.88, min: 0.4, max: 1, step: 0.02, label: 'Open water', unit: '×', note: 'swim speed on the first stretch, as a share' },
  under: { value: 0.82, min: 0.4, max: 1, step: 0.02, label: 'Under the ice', unit: '×', note: 'swim speed under the sea ice, as a share' },
  pop: { value: 5.6, min: 2, max: 10, step: 0.2, label: 'Pop off a ramp', unit: 'm/s', note: 'how hard a ramp of ice throws her up' },
  gravity: { value: 13, min: 5, max: 30, step: 0.5, label: 'Gravity in the air', unit: 'm/s²', note: 'lower = floatier jumps' },
  magnet: { value: 1.8, min: 0.6, max: 4, step: 0.1, label: 'Fish come to her', unit: 'm', note: 'a school this close is scooped up' },
  bounce: { value: 4.5, min: 0, max: 10, step: 0.25, label: 'Boing off the ice', unit: 'm/s', note: 'how hard a floe or an iceberg bounces her aside' },
  lean: { value: 0.9, min: 0, max: 2, step: 0.05, label: 'Lean into turns', unit: '×', note: 'how far she rolls when she swerves' },
  wave: { value: 2.2, min: 0, max: 5, step: 0.1, label: 'Lift off a wave', unit: '×', note: "how hard a rolling wave's crest throws her up" },
})

export interface RideStart {
  section: NarwhalSection
  channel: 'left' | 'middle' | 'right'
  fish: number
}
/** Off she goes; a jump; a big landing; a boing off the ice; down under the ice; in the bubble; up through the hole;
 *  the glacier cracks; the new iceberg lands; a wave lifts her; the balloon is in sight. */
export type RideMoment = 'go' | 'jump' | 'land' | 'bump' | 'dive' | 'bubble' | 'up' | 'crack' | 'calved' | 'wave' | 'balloon'
export type RidePoke = 'nari' | 'pola' | 'pebble' | 'terry' | 'walrus' | 'puffins' | 'seal' | 'fizz' | 'blue' | 'beluga' | 'orca' | 'chunk' | 'water' | 'ice'
export interface RideEvents {
  /** She reached the next stretch (the address bar follows). */
  section(s: NarwhalSection, fish: number): void
  /** She scooped up a school: how many now. */
  fish(n: number): void
  /** Something happened that a friend says something about (NarwhalRide.tsx picks the lines). */
  moment(m: RideMoment): void
  /** She poked something (the first time, Sparkle says something true about it). */
  poke(id: RidePoke): void
  /** Nari is at the balloon. */
  done(): void
}

export const RIDE_ANCHORS: AnchorInfo[] = [
  { id: 'nari', label: 'Nari the narwhal', kind: 'thing' },
  { id: 'pola', label: 'Pola', kind: 'thing' },
  { id: 'pebble', label: 'Pebble', kind: 'thing' },
  { id: 'terry', label: 'Terry the tern', kind: 'thing' },
  { id: 'walrus', label: 'The walrus', kind: 'thing' },
  { id: 'puffins', label: 'The puffins', kind: 'thing' },
  { id: 'seal', label: 'The seal', kind: 'thing' },
  { id: 'fizz', label: 'The fizzing bubbles', kind: 'thing' },
  { id: 'blue', label: 'The old blue iceberg', kind: 'thing' },
  { id: 'beluga:0', label: 'A beluga', kind: 'thing' },
  { id: 'beluga:1', label: 'A beluga', kind: 'thing' },
  { id: 'orca', label: 'The orca', kind: 'thing' },
  { id: 'chunk', label: 'The new iceberg', kind: 'thing' },
]

type Mode = 'ready' | 'swim' | 'arrive' | 'done'

const SKY = '#CFE9FF'
const DEEP = '#2F6FB5'
const KEEL = '#8FC3EC'
const ORDER: NarwhalSection[] = ['open', 'bergs', 'under', 'glacier', 'balloon']
/** No steering for this long: the 👆 shows how. */
const HINT_S = 8
/** Fish in each school. */
const PER = 5
const BUBBLES = 90
const smooth = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a))
  return k * k * (3 - 2 * k)
}

/** Something she can bump: a loose floe, a slalom iceberg, a keel under the sheet. */
interface Bumper {
  kind: 'floe' | 'berg' | 'keel'
  s: number
  lat: number
  r: number
  o: Group | null
  /** How far it has been shoved aside (a floe), and how fast. */
  shove: number
  shoveV: number
  hitT: number
  phase: number
}
interface School {
  s: number
  lat: number
  under: boolean
  /** Seconds since she scooped it (-1: not yet). */
  eaten: number
}
interface Wave {
  s: number
  h: number
  age: number
  on: boolean
  mesh: Mesh
  passed: boolean
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const me = new Vector3()
const mouth = new Vector3()
const mtx = new Matrix4()
const quat = new Quaternion()
const eul = new Euler()
const scl = new Vector3()

export class NarwhalRide implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private fogAir = new Fog(SKY, 70, 230)
  private fogSea = new Fog(DEEP, 4, 46)
  private skyColor = new Color(SKY)
  private seaColor = new Color(DEEP)
  private water: Water
  private sun: Group
  private wheel = new FingerWheel()
  private wheelEl: HTMLElement | null = null
  private hintEl: HTMLElement | null = null
  private anchorEls = new Map<string, HTMLElement>()
  private unwatch: () => void
  private stopSea: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: NarwhalSection

  // ---- Nari and her riders.
  private nari: Narwhal
  /** Moves and turns her (yaw); `lean` pitches her over a jump and rolls her into turns. */
  private nariRoot = new Group()
  private lean = new Group()
  private pola: Actor
  private pebble: Actor
  private terry: Actor
  private bubble: Mesh
  private bubbleK = 0
  private mode: Mode = 'ready'
  private modeT = 0
  private s = 0
  private lat = 0
  private latV = 0
  private y = 0
  private vy = 0
  private v = 0
  private air = false
  private airT = 0
  private leaping = false
  private steerLat = 0
  private prefer = 0
  private pitch = 0
  private roll = 0
  private yaw = Math.PI
  private rampWas = 0
  private bumpCool = 0
  private trailT = 0
  private lookBack = 0
  private lookWho = 0
  private terryT = -1
  private spoutT = 3
  private fish = 0
  private intro: boolean

  // ---- The course.
  private bumpers: Bumper[] = []
  private schools: School[] = []
  private fishMesh: InstancedMesh
  private bubbles: InstancedMesh
  private bubblePool: { x: number; y: number; z: number; vy: number; age: number; life: number; size: number }[] = []
  private nextBubble = 0
  private spray: Particles
  private foam: Particles
  private waves: Wave[] = []
  private chunk = new Group()
  private chunkAt = new Vector3()
  /** Seconds since the glacier started to crack (-1: not yet). */
  private calveT = -1
  private calved = false
  /** Seconds since the new iceberg was poked (it rocks). */
  private chunkT = 9
  private balloon: Balloon
  private walrus: Critter
  private seal: Critter
  private orca: Critter
  private puffins: Critter[] = []
  private belugas: Critter[] = []
  private belugaAt = [new Vector3(), new Vector3()]
  private blue: Group
  private blueT = -1
  private fizzT = 0
  private seen = { balloon: false, bubble: false }

  private lastTouch = 0
  private lastSteer = -99
  private counts = { steered: 0, touches: 0, jumps: 0, bigAir: 0, bumps: 0, schools: 0, waves: 0, taps: 0, pokes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: RideStart,
    private events: RideEvents,
  ) {
    const { scene, bag } = this
    scene.background = this.skyColor.clone()
    scene.fog = this.fogAir
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.28

    // ---- The sea, seen from above and from below ----
    this.water = new Water({ size: 1500, deep: '#5FA6DE', shallow: '#78BCEA', haze: SKY, hazeNear: 60, hazeFar: 220 }, bag)
    this.water.mesh.position.set(0, 0, -420)
    scene.add(this.water.mesh)
    // (The water's own plane lies flat: a child a little along its z is a little under it.)
    const under = new Mesh(bag.add(new PlaneGeometry(1500, 1500)), bag.add(new MeshBasicMaterial({ color: '#C9F0FF', side: BackSide })))
    under.position.z = -0.03
    this.water.mesh.add(under)
    this.sun = skyDisc(bag, 9, '#FFF3C4', '#FFE9A8')
    scene.add(this.sun)

    this.buildScenery()
    this.buildSheet()
    this.buildGlacier()
    this.buildRamps()

    // ---- What she can bump ----
    FLOES.forEach(([s, lat, r], i) => {
      const o = solid(floeGeo(r, 40 + i, 0.2, 0.42), bag, 2)
      o.rotation.y = i * 1.7
      scene.add(o)
      this.bumpers.push({ kind: 'floe', s, lat, r: r * 0.92, o, shove: 0, shoveV: 0, hitT: -1, phase: i * 1.3 })
    })
    BERGS.forEach(([s, lat, size], i) => {
      const o = solid(withKeel(bergGeo(size, 60 + i), size), bag, 2.5)
      scene.add(o)
      this.bumpers.push({ kind: 'berg', s, lat, r: size * 1.05, o, shove: 0, shoveV: 0, hitT: -1, phase: i * 2.1 })
    })
    for (const [s, lat, r] of KEELS) this.bumpers.push({ kind: 'keel', s, lat, r: r * 0.7, o: null, shove: 0, shoveV: 0, hitT: -1, phase: 0 })

    // ---- The animals along the way ----
    const at = (o: Group, [s, lat]: readonly [number, number], y: number, yaw: number) => {
      o.position.set(cx(s) + lat, y, -s)
      o.rotation.y = yaw
      scene.add(o)
    }
    this.walrus = new Critter('walrus', bag, 1.15)
    at(this.walrus.root, SPOTS.walrus, 0.2, -2.2)
    this.seal = new Critter('seal', bag, 1.3)
    at(this.seal.root, SPOTS.seal, 0.78, -2.1)
    this.orca = new Critter('orca', bag, 1.5)
    at(this.orca.root, SPOTS.orca, 0, Math.PI)
    for (let i = 0; i < 3; i++) {
      const p = new Critter('puffin', bag, 1.5)
      at(p.root, [SPOTS.puffins[0] + (i - 1) * 1.1, SPOTS.puffins[1] + (i % 2) * 0.9], 0.2, 2 + i * 0.3)
      this.puffins.push(p)
    }
    for (let i = 0; i < 2; i++) {
      const b = new Critter('beluga', bag, 1.25)
      scene.add(b.root)
      this.belugas.push(b)
    }
    this.blue = solid(blueBergGeo(4.2), bag, 2.5)
    at(this.blue, SPOTS.blue, -0.3, 0.4)

    // ---- The glacier's loose piece, its waves, and the balloon on its floe ----
    this.chunkAt.set(cx(CALVE.s) + WALL_LAT, 0, -CALVE.s)
    this.chunk.add(
      solid(merge([P.rbox(7, 13, 9.4, 0.6, ICE, { at: [-3.5, 6.5, 0] }), P.rbox(7.1, 2.4, 9.5, 0.3, ICE_BLUE, { at: [-3.5, 1.2, 0] }), P.rbox(6.6, 7, 9, 0.6, KEEL, { at: [-3.5, -3.5, 0] })]), bag, 3),
    )
    this.chunk.position.copy(this.chunkAt)
    scene.add(this.chunk)
    const waveGeo = bag.add(merge([P.cyl(1, 1, 46, '#4F9BDD', { rot: [0, 0, Math.PI / 2] }, 14), P.cyl(0.45, 0.45, 46.2, '#FFFFFF', { at: [0, 0.7, 0], rot: [0, 0, Math.PI / 2] }, 8)]))
    for (const h of [1.5, 1.15, 0.85]) {
      const mesh = new Mesh(waveGeo, toon('#ffffff', true))
      mesh.visible = false
      scene.add(mesh)
      this.waves.push({ s: 0, h, age: 0, on: false, mesh, passed: false })
    }
    const home = solid(floeGeo(6.5, 11, 0.18), bag, 2.5)
    home.position.set(cx(BALLOON), 0, -BALLOON)
    scene.add(home)
    this.balloon = new Balloon(bag)
    this.balloon.root.position.set(cx(BALLOON) + 0.4, 0.43, -BALLOON - 0.6)
    scene.add(this.balloon.root)

    // ---- Nari, Pola and Pebble on her back (as in the films), and Terry flying ahead ----
    this.nari = new Narwhal(bag, 1.15)
    this.lean.add(this.nari.root)
    this.nariRoot.add(this.lean)
    scene.add(this.nariRoot)
    this.pola = new Actor('pola', bag, { height: 1.2 })
    this.pebble = new Actor('pebble', bag, { height: 0.8 })
    this.terry = new Actor('terry', bag, { height: 1.05 })
    scene.add(this.pola.root, this.pebble.root, this.terry.root)
    this.pola.ride(this.nari.saddle, 0, 0, -0.25, 0)
    this.pebble.ride(this.nari.saddle, 0, 0.05, 0.45, 0)
    this.terry.place(0, 3, 0, 180)
    this.terry.flying = true
    // The riders' air bubble for under the ice.
    this.bubble = new Mesh(bag.add(new SphereGeometry(1, 20, 14)), bag.add(new MeshBasicMaterial({ color: '#E8FBFF', transparent: true, opacity: 0.3, depthWrite: false })))
    this.bubble.position.set(0, 0.55, 0.08)
    this.bubble.visible = false
    this.bubble.renderOrder = 3
    this.nari.saddle.add(this.bubble)

    // ---- Fish, bubbles, spray ----
    const fishGeo = bag.add(merge([P.sphere(0.2, PAL.gold, { scale: [0.55, 0.8, 1.5] }, 8), P.cone(0.16, 0.24, PAL.hotpink, { at: [0, 0, -0.36], rot: [Math.PI / 2, 0, 0], scale: [0.3, 1, 1] }, 4), P.sphere(0.04, PAL.ink, { at: [0.09, 0.05, 0.2] }, 5), P.sphere(0.04, PAL.ink, { at: [-0.09, 0.05, 0.2] }, 5)]))
    this.fishMesh = bag.add(new InstancedMesh(fishGeo, toon('#ffffff', true), FISH.length * PER))
    this.fishMesh.frustumCulled = false
    scene.add(this.fishMesh)
    for (const [s, lat] of FISH) this.schools.push({ s, lat, under: s > DIVE.from && s < DIVE.to, eaten: -1 })
    this.bubbles = bag.add(new InstancedMesh(bag.add(new SphereGeometry(0.5, 8, 6)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.7 })), BUBBLES))
    this.bubbles.frustumCulled = false
    this.bubbles.count = 0
    scene.add(this.bubbles)
    for (let i = 0; i < BUBBLES; i++) this.bubblePool.push({ x: 0, y: 0, z: 0, vy: 0, age: 1, life: 0, size: 0 })
    this.spray = new Particles({ kind: 'spray', count: 260 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 110, opacity: 0.8 }, bag)
    scene.add(this.spray.mesh, this.foam.mesh)

    // ---- Where the link starts ----
    this.section = start.section
    this.fish = start.fish
    this.intro = start.section === 'open'
    this.prefer = { left: -1, middle: 0, right: 1 }[start.channel]
    if (start.section === 'open') this.s = 4
    else {
      this.s = { bergs: OPEN_END + 6, under: DIVE.from - 16, glacier: GLACIER + 2, balloon: DOCK - 36 }[start.section]
      this.v = RIDE.speed * 0.8
      this.setMode('swim')
      if (start.section === 'bergs') this.lat = this.steerLat = this.prefer * 3
    }
    for (const f of this.schools) if (f.s < this.s) f.eaten = 99
    if (this.s > CALVE.trig) {
      // (Past the glacier: its new iceberg is already afloat.)
      this.calveT = 99
      this.calved = true
    }
    this.placeNari(0)
    this.placeTerry(0, true)

    this.stopSea = rideSfx.sea()
    this.unwatch = watch('nari', () => ({
      'her push': [this.wheel.push, 1],
      steer: [this.wheel.k, 1],
      'steering to (m)': [this.steerLat, 13],
      'across (m)': [this.lat, 13],
      'up (m)': [this.y, 4],
    }))
  }

  // ---------------------------------------------------------------- building

  /** The Arctic all around, like the films' (story/stage.ts): pack ice along both sides of the channel, icebergs behind
   *  it (every one with far more ice under the water than over it), the rows of bergs she slaloms, the ice the animals
   *  lie on. Merged into a few big pieces, one per stretch of the way. */
  private buildScenery() {
    const r = rng(17)
    const chunks: BufferGeometry[][] = [[], [], [], [], []]
    const put = (s: number, g: BufferGeometry, lat: number, y = 0) => chunks[clamp(Math.floor(s / 180), 0, 4)].push(g.translate(cx(s) + lat, y, -s))
    const spots: (readonly [number, number])[] = [SPOTS.walrus, SPOTS.puffins, SPOTS.seal, SPOTS.fizz, SPOTS.blue, SPOTS.orca, [DIVE.from + 6, -16], [DIVE.from + 6, 16]]
    const clear = (s: number, lat: number, d: number) => spots.every(([a, b]) => Math.hypot(a - s, b - lat) > d) && !(s > DIVE.sheetFrom - 6 && s < DIVE.sheetTo + 3 && Math.abs(lat) < 26)
    // Pack ice along both sides (none where the glacier's wall is).
    for (let s = -40; s < BACK_WALL - 4; s += 6.5) {
      for (const side of [-1, 1]) {
        const rad = 1.4 + r() * 3.2
        const lat = side * (half(Math.max(0, s)) + 1.6 + rad + r() * r() * 34)
        if ((side < 0 && s > GLACIER - 8 && lat < WALL_LAT + rad + 1) || !clear(s, lat, rad + 4.5)) continue
        put(s, floeGeo(rad, Math.floor(r() * 900), 0.18, 0.4).rotateY(r() * 6), lat)
      }
    }
    // Little bits of loose ice all over the channel: they stream past, so her speed reads (she swims right through).
    for (let s = 8; s < DOCK; s += 2.6) {
      if (s > DIVE.from - 4 && s < DIVE.sheetTo + 2) continue
      const lat = (r() * 2 - 1) * (half(s) + 2)
      const rad = 0.22 + r() * 0.5
      put(s, P.sphere(rad, r() < 0.3 ? ICE_SHADE : ICE, { scale: [1.3, 0.4, 1], rot: [0, r() * 3, 0] }, 6), lat, 0.02)
    }
    // Floes behind her at the start, so the sea isn't empty when the camera looks back.
    for (let i = 0; i < 8; i++) put(-10 - r() * 26, floeGeo(1.5 + r() * 2.5, 300 + i, 0.18, 0.4), (r() - 0.5) * 40)
    // Icebergs far off on both sides, all the way.
    for (let s = 10; s < 940; s += 24) {
      for (const side of [-1, 1]) {
        const size = 4 + r() * 8
        const lat = side * (36 + size + r() * 55)
        if (side < 0 && s > GLACIER - 40) continue
        if (!clear(s, lat, size + 6)) continue
        put(s, withKeel(bergGeo(size, Math.floor(r() * 900)), size), lat, -0.4)
      }
    }
    // Icebergs close along both sides of the iceberg stretch.
    for (let s = OPEN_END + 8; s < DIVE.from - 6; s += 11) {
      for (const side of [-1, 1]) {
        const size = 2.6 + r() * 2.6
        const lat = side * (half(s) + 2.2 + size + r() * 5)
        if (!clear(s, lat, size + 5)) continue
        put(s, withKeel(bergGeo(size, Math.floor(r() * 900)), size), lat, -0.3)
      }
    }
    // The big ones down the middle of the fork, and the two giants the sea ice hangs between.
    ROW.forEach((s, i) => put(s, withKeel(bergGeo(3.4 + (i % 2) * 0.5, 80 + i), 3.6), i % 2 ? 0.4 : -0.4, -0.3))
    for (const side of [-1, 1]) put(DIVE.from + 6, withKeel(bergGeo(6, 90 + side), 6), side * 15.5, -0.3)
    // The ice the animals lie on: the walrus's and the puffins' floes, the seal's growler.
    put(SPOTS.walrus[0], floeGeo(3.8, 71, 0.2, 0.5), SPOTS.walrus[1])
    put(SPOTS.puffins[0], floeGeo(3.4, 72, 0.2, 0.5), SPOTS.puffins[1])
    put(SPOTS.seal[0], merge([P.sphere(1.9, ICE_SHADE, { scale: [1.25, 0.42, 1] }, 12), P.sphere(1.2, ICE, { at: [0.5, 0.25, -0.3], scale: [1.2, 0.5, 1] }, 10)]), SPOTS.seal[1])
    // The berg the bubbles fizz out of.
    put(SPOTS.fizz[0], withKeel(bergGeo(2.6, 77), 2.6), SPOTS.fizz[1] - 4.8, -0.3)
    for (const c of chunks) if (c.length) this.scene.add(solid(merge(c), this.bag, 2.5))
  }

  /** The sea ice she swims under: a wide sheet between the two giants (a low bridge at its front edge), white on top
   *  and blue beneath, with keels of ice hanging down, and a slot of open water at its far end to pop up through. */
  private buildSheet() {
    const x = cx((DIVE.sheetFrom + DIVE.sheetTo) / 2)
    const slab = (from: number, to: number, l0: number, l1: number) => {
      const z = -(from + to) / 2
      const w = l1 - l0
      const mid = x + (l0 + l1) / 2
      return [P.box(w, 0.25, to - from, '#FFFFFF', { at: [mid, 0.13, z] }), P.box(w, 0.6, to - from, '#9CCBEF', { at: [mid, -0.3, z] })]
    }
    const hole = DIVE.hole - 13
    const parts = [...slab(DIVE.sheetFrom, hole, -26, 26), ...slab(hole, DIVE.sheetTo, -26, -5.2), ...slab(hole, DIVE.sheetTo, 5.2, 26)]
    // The low bridge of ice at the front edge: too low to swim under with riders, so Nari dips.
    parts.push(P.rbox(24, 1.5, 4.5, 0.6, ICE, { at: [cx(DIVE.sheetFrom), 1.55, -DIVE.sheetFrom + 1] }))
    for (const side of [-1, 1]) parts.push(P.rbox(3, 2.6, 4.5, 0.6, ICE_SHADE, { at: [cx(DIVE.sheetFrom) + side * 11, 0.9, -DIVE.sheetFrom + 1] }))
    // Snow drifts on top, keels underneath (the four she swims round, and smaller ones off to the sides).
    const r = rng(23)
    for (let i = 0; i < 16; i++) parts.push(P.sphere(1.5 + r() * 2, '#FFFFFF', { at: [x + (r() - 0.5) * 46, 0.2, -(DIVE.sheetFrom + 6 + r() * 70)], scale: [1.3, 0.3, 1] }, 10))
    for (const [s, lat, rad] of KEELS) parts.push(P.cone(rad * 1.15, 5.2, KEEL, { at: [cx(s) + lat, -2.9, -s], rot: [Math.PI, s, 0] }, 7))
    for (let i = 0; i < 22; i++) {
      const s = DIVE.sheetFrom + 4 + r() * (hole - DIVE.sheetFrom)
      const lat = (r() < 0.5 ? -1 : 1) * (10.5 + r() * 14)
      const h = 2 + r() * 5
      parts.push(P.cone(1 + r() * 1.6, h, i % 2 ? KEEL : '#A9D4F5', { at: [cx(s) + lat, -0.3 - h / 2, -s], rot: [Math.PI, i, 0] }, 6))
    }
    this.scene.add(solid(merge(parts), this.bag, 2.5))
  }

  /** The glacier: a tall wall of ice along the left of the bay and across its end, with a gap where the loose piece
   *  stands, and snowy mountains behind. */
  private buildGlacier() {
    const r = rng(31)
    const parts: BufferGeometry[] = []
    const cols = [ICE, '#E6F1FF', ICE_SHADE]
    let i = 0
    for (let s = GLACIER - 12; s < BACK_WALL + 14; s += 8) {
      if (Math.abs(s + 4 - CALVE.s) < 5.5) {
        // (Behind the loose piece: the wall's blue inside.)
        parts.push(P.box(10, 11, 9.4, ICE_BLUE, { at: [cx(s + 4) + WALL_LAT - 12, 5.5, -(s + 4)] }))
        continue
      }
      const h = 10 + r() * 6
      const d = 13 + r() * 2
      parts.push(P.box(d, h, 8.3, cols[i++ % 3], { at: [cx(s + 4) + WALL_LAT - d / 2 + r() * 1.2, h / 2 - 1, -(s + 4)], rot: [0, (r() - 0.5) * 0.12, 0] }))
      parts.push(P.box(d + 0.3, 1.5, 8.5, ICE_BLUE, { at: [cx(s + 4) + WALL_LAT - d / 2 + 0.4, 0.3, -(s + 4)] }))
      // Jagged ice along the top, and a blue crack down the face.
      for (let j = 0; j < 2; j++) parts.push(P.cone(2.2 + r() * 1.6, 3 + r() * 3.5, j ? ICE : '#E6F1FF', { at: [cx(s + 4) + WALL_LAT - 2.5 - r() * 6, h - 1 + 1.2, -(s + 2 + j * 4)], rot: [(r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3] }, 5))
      parts.push(P.box(0.5, h * 0.92, 0.3 + r() * 0.3, '#7FBDEC', { at: [cx(s + 4) + WALL_LAT + 1.25, h * 0.46 - 1, -(s + 1 + r() * 6)], rot: [(r() - 0.5) * 0.25, 0, 0] }))
    }
    for (let lat = WALL_LAT - 14; lat < 70; lat += 8) {
      const h = 10 + r() * 7
      parts.push(P.box(8.3, h, 14, cols[i++ % 3], { at: [lat + 4, h / 2 - 1, -(BACK_WALL + 7 + r() * 1.5)], rot: [0, (r() - 0.5) * 0.1, 0] }))
      parts.push(P.box(8.5, 1.5, 14.3, ICE_BLUE, { at: [lat + 4, 0.3, -(BACK_WALL + 7)] }))
      parts.push(P.cone(2.4 + r() * 1.6, 3 + r() * 4, i % 2 ? ICE : '#E6F1FF', { at: [lat + 2 + r() * 4, h - 1 + 1.2, -(BACK_WALL + 5 + r() * 6)], rot: [(r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3] }, 5))
      parts.push(P.box(0.3 + r() * 0.3, h * 0.92, 0.5, '#7FBDEC', { at: [lat + 1 + r() * 6, h * 0.46 - 1, -(BACK_WALL - 0.2)], rot: [0, 0, (r() - 0.5) * 0.25] }))
    }
    for (const [lat, s, rr, h, seed] of [[-80, 900, 34, 38, 1], [-20, 930, 40, 46, 2], [45, 905, 30, 32, 3], [-75, 760, 26, 30, 4], [-70, 650, 24, 26, 5]] as const) parts.push(mountainGeo(rr, h, seed).translate(lat, 0, -s))
    this.scene.add(solid(merge(parts), this.bag, 3))
  }

  /** The little ramps of ice: a blue wedge each, with a pink flag either side of its lip. */
  private buildRamps() {
    const parts: BufferGeometry[] = []
    for (const [s, lat, w, h, len] of RAMPS) {
      const x = cx(s) + lat
      // (A side view of the wedge, pushed across; then turned so it rises the way she swims.)
      parts.push(P.prism([[0, -0.4], [len, -0.4], [len, h], [0, 0.05]], w * 2, ICE_BLUE).rotateY(Math.PI / 2).translate(x, 0, -s))
      parts.push(P.box(w * 2 - 0.5, 0.06, 0.5, '#FFFFFF', { at: [x, h * 0.55, -s - len * 0.5], rot: [Math.atan(h / len), 0, 0] }))
      for (const side of [-1, 1]) {
        parts.push(P.cyl(0.05, 0.05, 1.5, '#FFFFFF', { at: [x + side * (w + 0.25), h + 0.3, -s - len + 0.2] }, 6))
        parts.push(P.prism([[0, 0], [0.6, 0.22], [0, 0.44]], 0.04, PAL.hotpink, { at: [x + side * (w + 0.25), h + 0.62, -s - len + 0.2], rot: [0, side < 0 ? Math.PI : 0, 0] }))
      }
    }
    this.scene.add(solid(merge(parts), this.bag, 2))
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.wheel.setSize(w, h)
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
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

  get calm() {
    return false
  }
  private setMode(m: Mode) {
    this.mode = m
    this.modeT = 0
  }
  private enter(s: NarwhalSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s, this.fish)
  }
  /** Under the sea ice (or on her way down or up). */
  private get diving() {
    return this.s >= DIVE.from && this.s < DIVE.to
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.modeT += dt
    this.bumpCool -= dt
    this.water.update(t)
    const k = this.wheel.update(dt, t, STEER)
    if (Math.abs(k) > 0.05) {
      this.counts.steered += dt
      this.lastSteer = t
    }

    if (this.mode === 'ready') {
      // A look at the three of them, then off she goes.
      if (this.modeT > (this.intro ? 1.5 : 0.3)) {
        this.setMode('swim')
        this.v = 2.5
        rideSfx.spout()
        this.spout()
        this.events.moment('go')
      }
    } else if (this.mode === 'swim') this.swim(dt, k)
    else if (this.mode === 'arrive') {
      // Slowing down beside the balloon's floe.
      this.v = Math.max(0, Math.min(this.v, Math.sqrt(Math.max(0, 2 * 2.4 * (DOCK - this.s)))))
      this.s = Math.min(DOCK, this.s + this.v * dt)
      this.lat += (clamp(this.lat, -2.5, 2.5) - this.lat) * (1 - Math.exp(-dt * 1.5))
      this.latV *= Math.exp(-dt * 3)
      this.y += (0 - this.y) * (1 - Math.exp(-dt * 8))
      if (this.s >= DOCK - 0.05 || (this.v < 0.1 && this.modeT > 1)) {
        this.setMode('done')
        this.v = 0
        this.pola.hop()
        this.pebble.hop()
        this.pola.pull('happy')
        this.pebble.pull('happy')
        rideSfx.arrive()
        this.spout()
        this.events.done()
      }
    }

    this.updateCalving(dt, t)
    this.updateBumpers(dt, t)
    this.updateFish(dt, t)
    this.updateBubbles(dt)
    this.updateFriends(dt, t)
    this.placeNari(dt)
    this.placeTerry(dt)
    this.wake(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)
    this.balloon.update(dt, t)

    // Under the sea, the world turns blue.
    const underSea = this.rig.camera.position.y < 0
    this.scene.fog = underSea ? this.fogSea : this.fogAir
    ;(this.scene.background as Color).copy(underSea ? this.seaColor : this.skyColor)
    if (this.y < -0.8) rideSfx.under()
    else if (this.mode === 'swim' && !this.air) rideSfx.swim(clamp(this.v / RIDE.speed), clamp(Math.abs(this.latV) / 5))

    const p = this.pos()
    this.sun.position.set(p.x - 70, 26, p.z - 190)
    this.lights.follow(p.x, Math.max(0, this.y), p.z)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    const steering = this.mode === 'swim'
    this.wheel.draw(this.wheelEl, steering, STEER.reach)
    const idle = t - Math.max(this.lastTouch, this.lastSteer)
    this.wheel.hint(this.hintEl, steering && !this.wheel.finger && ((this.counts.steered < 1 && t > 3 && idle > 2.5) || idle > HINT_S), t, STEER.reach)
  }

  /** Where she is in the world. */
  private pos(out = tmp) {
    return out.set(cx(this.s) + this.lat, this.y, -this.s)
  }

  // ---------------------------------------------------------------- the swim

  /** The water's height under her: a ramp of ice, or a rolling wave. */
  private surface(s: number, lat: number) {
    let y = rampAt(s, lat)
    for (const w of this.waves) if (w.on) y += w.h * clamp(w.age / 0.6) * Math.exp(-(((s - w.s) / 2.4) ** 2))
    return y
  }

  private swim(dt: number, k: number) {
    const watching = this.calveT >= 0 && this.calveT < 2.6
    const target = RIDE.speed * (this.s < OPEN_END ? RIDE.calm : this.diving ? RIDE.under : 1) * (watching ? 0.6 : 1)
    this.v += clamp(target - this.v, -6 * dt, 4 * dt)
    // The wheel's push slides where she's steering to; she swerves toward it (a point `aim` m ahead), or, let go,
    // drifts back to the middle of her channel. (Narrower on the way to the hole in the ice.)
    const slot = this.s > DIVE.to - 26 && this.s < DIVE.sheetTo ? 4 + 4.5 * (1 - smooth(DIVE.to - 26, DIVE.to - 8, this.s)) : 99
    const range = Math.min(half(this.s), slot)
    if (this.wheel.steering) this.steerLat = clamp(this.steerLat + k * STEER.slide * dt, -range, range)
    else this.steerLat += (lane(this.s, this.lat, this.prefer) - this.steerLat) * (1 - Math.exp(-dt / STEER.back))
    this.steerLat = clamp(this.steerLat, -range, range)
    const ds = Math.max(STEER.aim, 10 + this.v * 0.9 - Math.abs(this.steerLat - this.lat) * STEER.pull)
    const max = Math.max(1, this.v) * Math.tan(STEER.turn)
    const want = clamp((Math.max(2, this.v) * (this.steerLat - this.lat)) / ds, -max, max)
    this.latV += (want - this.latV) * (1 - Math.exp(-dt * 8))

    const was = this.s
    this.s += this.v * dt
    this.lat += this.latV * dt
    if (Math.abs(this.lat) > range) {
      this.lat = Math.sign(this.lat) * range
      if (this.latV * this.lat > 0) this.latV = 0
    }
    if (this.s > FORK.to) this.prefer = 0

    // The row of icebergs between the channels: she slides off its side into whichever channel she's on.
    const r = ridge(this.s)
    if (r > 0 && Math.abs(this.lat) < r + 1) {
      const side = Math.sign(this.lat || this.prefer || this.steerLat || -1)
      this.lat = side * (r + 1)
      if (this.latV * side < -1.5) this.boing(side, cx(this.s) + side * r, -this.s)
      if (this.latV * side < 0) this.latV = -this.latV * 0.3
      if (this.steerLat * side < r + 1) this.steerLat = side * (r + 1)
    }

    // ---- Up and down: under the ice, in the air, or on the water (over a ramp, up a wave).
    if (this.diving) {
      if (was < DIVE.from) {
        rideSfx.dive()
        this.splash(0.8)
        this.enter('under')
        this.events.moment('dive')
      }
      const goal = -DIVE.depth * smooth(DIVE.from, DIVE.from + 8, this.s)
      this.vy += ((goal - this.y) * 9 - this.vy * 5) * dt
      this.y += this.vy * dt
      this.air = false
      if (!this.seen.bubble && this.s > DIVE.from + 22) {
        this.seen.bubble = true
        this.events.moment('bubble')
      }
      return
    }
    if (was < DIVE.to && this.s >= DIVE.to) {
      // The hole in the ice: up she shoots.
      this.air = this.leaping = true
      this.airT = 0
      this.vy = RIDE.pop * 1.25
      this.events.moment('up')
    }
    const surf = this.surface(this.s, this.lat)
    if (this.air) {
      const wasY = this.y
      if (this.leaping && this.y < -0.1) this.vy = RIDE.pop * 1.25
      else this.vy -= RIDE.gravity * dt
      this.y += this.vy * dt
      this.airT += dt
      if (this.leaping && wasY < 0 && this.y >= 0) {
        this.leaping = false
        rideSfx.surface()
        this.splash(1.4)
        this.enter('glacier')
        this.pola.pull('wow')
        this.pebble.pull('happy')
      }
      if (!this.leaping && this.vy < 0 && this.y <= surf) {
        this.y = surf
        this.vy = 0
        this.air = false
        this.land()
      }
    } else {
      this.y += (surf - this.y) * (1 - Math.exp(-dt * 22))
      // Off the lip of a ramp: up she pops.
      const ramp = rampAt(this.s, this.lat)
      if (this.rampWas > 0.55 && ramp === 0) this.launch(RIDE.pop, 'jump')
      this.rampWas = ramp
      // A wave's crest passing under her throws her up too.
      for (const w of this.waves) {
        if (!w.on || w.passed || w.s > this.s) continue
        w.passed = true
        if (this.s - w.s > 4) continue
        this.counts.waves++
        rideSfx.wave()
        this.launch(2.6 + w.h * RIDE.wave, 'wave')
        break
      }
    }

    if (this.s >= OPEN_END) this.enter('bergs')
    if (this.s >= GLACIER) this.enter('glacier')
    if (this.calveT < 0 && this.s >= CALVE.trig) {
      this.calveT = 0
      rideSfx.crack()
      this.events.moment('crack')
    }
    if (!this.seen.balloon && this.s > BALLOON - 105) {
      this.seen.balloon = true
      this.events.moment('balloon')
    }
    if (this.s >= DOCK - 13 && !this.air) {
      this.setMode('arrive')
      this.enter('balloon')
    }
  }

  private launch(vy: number, why: 'jump' | 'wave') {
    this.air = true
    this.airT = 0
    this.vy = vy
    this.rampWas = 0
    this.counts.jumps++
    if (why === 'jump') rideSfx.jump()
    const p = this.pos()
    this.spray.burst(p.x, this.y + 0.3, p.z, 18, 2.6, 3.6, 0.2)
    this.pola.pull('wow')
    this.pebble.pull('wow')
    this.events.moment(why)
  }

  private land() {
    const big = this.airT > 0.55
    this.splash(big ? 1.3 : 0.8)
    rideSfx.splash()
    this.pola.hop()
    this.pebble.hop()
    this.lookBack = 1.6
    if (big) {
      this.counts.bigAir++
      this.events.moment('land')
    }
  }

  private splash(big: number) {
    const p = this.pos()
    this.spray.burst(p.x, 0.1, p.z, Math.round(24 * big), 3 * big, 5 * big, 0.22)
    for (let i = 0; i < 4; i++) this.foam.emit(p.x, 0.02, p.z, 0, 0, 0, 1.1 + i * 0.3, (1.8 + i) * big)
    for (let i = 0; i < 10; i++) this.bubbleAt(p.x + (Math.random() - 0.5) * 1.5, -0.5 - Math.random() * 1.5, p.z + (Math.random() - 0.5) * 1.5)
  }

  /** A puff of spray from her blowhole. */
  private spout() {
    const p = this.pos()
    if (this.y < -0.6) for (let i = 0; i < 10; i++) this.bubbleAt(p.x + (Math.random() - 0.5) * 0.4, this.y + 1, p.z + (Math.random() - 0.5) * 0.4)
    else for (let i = 0; i < 16; i++) this.spray.emit(p.x, this.y + 1, p.z - 0.5, (Math.random() - 0.5) * 1.2, 4 + Math.random() * 2.5, (Math.random() - 0.5) * 1.2 - this.v * 0.6, 0.7, 0.14 + Math.random() * 0.1)
  }

  /** A boing off a piece of ice: never a stop, the riders giggle. */
  private boing(side: number, x: number, z: number) {
    if (this.bumpCool > 0) return
    this.bumpCool = 0.7
    this.counts.bumps++
    rideSfx.bump()
    if (this.y < -0.6) for (let i = 0; i < 8; i++) this.bubbleAt(x + side * 0.6 + (Math.random() - 0.5), this.y + Math.random(), z + (Math.random() - 0.5))
    else this.spray.burst(x + side * 0.5, 0.4, z, 12, 2, 2.6, 0.16)
    this.pola.hop()
    this.pebble.hop()
    this.pebble.pull('happy')
    this.lookBack = 1.4
    this.events.moment('bump')
  }

  private updateBumpers(dt: number, t: number) {
    const swim = this.mode === 'swim'
    for (const b of this.bumpers) {
      const ahead = b.s - this.s
      if (ahead < -30 || ahead > 110) continue
      // A shoved floe drifts back to its place; a bumped iceberg rocks.
      if (b.kind === 'floe') {
        b.shove += b.shoveV * dt
        b.shoveV *= Math.exp(-dt * 2.5)
        b.shove *= Math.exp(-dt * 0.25)
      }
      if (b.hitT >= 0 && (b.hitT += dt) > 1.6) b.hitT = -1
      const rock = b.hitT >= 0 ? Math.exp(-b.hitT * 2.5) * Math.sin(b.hitT * 14) : 0
      const lat = b.lat + b.shove
      if (b.o) {
        b.o.position.set(cx(b.s) + lat, b.kind === 'berg' ? -0.3 + rock * 0.12 : Math.sin(t * 0.9 + b.phase) * 0.05 + rock * 0.1, -b.s)
        b.o.rotation.z = (b.kind === 'berg' ? 0.09 : 0.14) * rock + Math.sin(t * 0.7 + b.phase) * 0.012
        b.o.rotation.x = 0.06 * rock
      }
      if (!swim) continue
      const layer = b.kind === 'keel' ? this.y < -1 : this.y > -1 && this.y < 0.9
      if (!layer) continue
      const R = b.r + 0.85
      const dl = this.lat - lat
      if (Math.abs(ahead) >= R || ahead * ahead + dl * dl >= R * R) continue
      const side = Math.sign(dl || this.latV || 1)
      this.lat = lat + side * Math.sqrt(R * R - ahead * ahead)
      if (this.bumpCool <= 0) {
        b.hitT = 0
        if (b.kind === 'floe') b.shoveV = -side * 3.2
        this.latV = side * RIDE.bounce
        this.boing(-side, cx(b.s) + lat + side * b.r, -b.s)
      } else if (this.latV * side < 0) this.latV = 0
      if ((this.steerLat - lat) * side < R) this.steerLat = lat + side * R
    }
  }

  // ---------------------------------------------------------------- fish

  private updateFish(dt: number, t: number) {
    const p = this.pos(me)
    mouth.set(p.x, p.y + 0.15, p.z - 1.6)
    const canScoop = this.mode === 'swim'
    let n = 0
    for (const f of this.schools) {
      if (f.eaten > 0.35) continue
      const ahead = f.s - this.s
      if (ahead < -12 || ahead > 85) continue
      const bx = cx(f.s) + f.lat
      const bz = -f.s
      const by = f.under ? -DIVE.depth : 0
      if (f.eaten < 0) {
        if (canScoop && Math.hypot(bx - p.x, bz - p.z) < RIDE.magnet && Math.abs(by - Math.min(this.y, 1.4)) < 1.6) this.scoop(f)
      } else f.eaten += dt
      const q = f.eaten < 0 ? 0 : clamp(f.eaten / 0.3)
      for (let j = 0; j < PER; j++) {
        const a = t * 1.5 + (j / PER) * Math.PI * 2 + f.s
        // Leaping out of the water in little arcs (under the ice: swimming round in a ring).
        const ph = t * 3.4 + j * 1.9 + f.s
        const hop = f.under ? 0.3 * Math.sin(ph * 0.6) : -0.3 + 1.05 * Math.sin(ph)
        const x = bx + Math.cos(a) * 1.1
        const y = by + hop
        const z = bz + Math.sin(a) * 1.1
        const sc = (1 - q) * 1.7
        eul.set(f.under ? 0 : -0.9 * Math.cos(ph), -a, 0)
        mtx.compose(tmp2.set(x + (mouth.x - x) * q, y + (mouth.y - y) * q, z + (mouth.z - z) * q), quat.setFromEuler(eul), scl.set(sc, sc, sc))
        this.fishMesh.setMatrixAt(n++, mtx)
      }
    }
    this.fishMesh.count = n
    this.fishMesh.instanceMatrix.needsUpdate = true
  }

  private scoop(f: School) {
    f.eaten = 0
    this.fish++
    this.counts.schools++
    rideSfx.yum()
    this.events.fish(this.fish)
    const p = this.pos()
    if (this.y < -0.6) for (let i = 0; i < 6; i++) this.bubbleAt(p.x + (Math.random() - 0.5), this.y, p.z - 1.5 + (Math.random() - 0.5))
    else this.spray.burst(p.x, 0.3, p.z - 1.5, 10, 1.8, 3, 0.14)
  }

  private bubbleAt(x: number, y: number, z: number) {
    const b = this.bubblePool[this.nextBubble]
    this.nextBubble = (this.nextBubble + 1) % BUBBLES
    b.x = x
    b.y = y
    b.z = z
    b.vy = 1.2 + Math.random()
    b.age = 0
    b.life = 1.2 + Math.random() * 0.9
    b.size = 0.05 + Math.random() * 0.08
  }

  private updateBubbles(dt: number) {
    let n = 0
    for (const b of this.bubblePool) {
      if (b.age >= b.life) continue
      b.age += dt
      b.y += b.vy * dt
      b.x += Math.sin(b.age * 8 + b.z) * 0.2 * dt
      if (b.y > -0.05) b.age = b.life
      if (b.age >= b.life) continue
      const s = b.size * (1 + b.age * 0.6)
      mtx.compose(tmp2.set(b.x, b.y, b.z), quat.identity(), scl.set(s, s, s))
      this.bubbles.setMatrixAt(n++, mtx)
    }
    this.bubbles.count = n
    this.bubbles.instanceMatrix.needsUpdate = true
  }

  // ---------------------------------------------------------------- the glacier's new iceberg

  /** The loose piece of the wall cracks (it shakes, snow falls), tips out, and drops into the sea: a huge splash, then
   *  three rolling waves across the bay, and a brand-new iceberg bobbing with most of itself under the water. */
  private updateCalving(dt: number, t: number) {
    const c = this.chunk
    if (this.calveT < 0) return
    this.calveT += dt
    const ct = this.calveT
    const at = this.chunkAt
    if (ct < 1.3) {
      c.rotation.z = Math.sin(t * 40) * 0.012 - ct * 0.03
      if (Math.random() < dt * 14) this.spray.emit(at.x - Math.random() * 3, 10 + Math.random() * 3, at.z + (Math.random() - 0.5) * 9, 1 + Math.random(), -1, 0, 1.2, 0.3)
    } else if (ct < 2.6) {
      const k = (ct - 1.3) / 1.3
      c.rotation.z = -0.04 - k * k * 1.2
      c.position.set(at.x + k * 2.5, -k * k * 1.5, at.z)
    } else {
      if (!this.calved) {
        this.calved = true
        rideSfx.calve()
        this.spray.burst(at.x + 8, 0.2, at.z, 70, 7, 9, 0.5)
        for (let i = 0; i < 10; i++) this.foam.emit(at.x + 6 + Math.random() * 6, 0.03, at.z + (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 3, 0, (Math.random() - 0.5) * 3, 2 + Math.random(), 4 + Math.random() * 4)
        this.waves.forEach((w, i) => {
          w.on = true
          w.passed = false
          w.age = -i * 1.2
          w.s = CALVE.s - 6 + i * 5.4
        })
        this.events.moment('calved')
      }
      // Afloat on its side: it rocks and settles, drifting out a little.
      const u = Math.min(60, ct - 2.6)
      this.chunkT += dt
      c.rotation.z = -Math.PI / 2 + 0.3 * Math.exp(-u * 0.5) * Math.cos(u * 2.2) + 0.14 * Math.exp(-this.chunkT * 1.2) * Math.sin(this.chunkT * 5)
      c.position.set(at.x + 2.5 + 4 * (1 - Math.exp(-u * 0.4)), -1.9 - 1.6 * Math.exp(-u * 0.8) * Math.cos(u * 2.6) + 0.12 * Math.sin(t * 0.9), at.z)
    }
    for (const w of this.waves) {
      if (!w.on) continue
      w.age += dt
      if (w.age > 0) w.s -= 4.6 * dt
      const h = w.h * clamp(w.age / 0.6) * clamp((w.s - (CALVE.trig - 60)) / 20)
      w.mesh.visible = h > 0.02
      w.mesh.position.set(cx(w.s) - 4, -0.05, -w.s)
      w.mesh.scale.set(1, Math.max(0.01, h), 1.9)
      if (w.s < CALVE.trig - 60) w.on = false
      // Foam along its crest.
      if (w.mesh.visible && Math.random() < dt * 22) this.foam.emit(cx(w.s) - 4 + (Math.random() - 0.5) * 34, 0.03, -w.s + 2.4, 0, 0, 2, 0.9, 1.2)
    }
  }

  // ---------------------------------------------------------------- everyone else

  private updateFriends(dt: number, t: number) {
    // The riders: arms up in the air, a look back over the shoulder after something fun.
    const up = this.air ? 1 : 0
    for (const a of [this.pola, this.pebble]) a.armsUp += (up - a.armsUp) * (1 - Math.exp(-dt * 10))
    this.lookBack = Math.max(0, this.lookBack - dt)
    const look = 2.1 * smooth(0, 0.3, this.lookBack) * smooth(0, 0.3, 1.6 - this.lookBack)
    if (this.lookBack === 0) this.lookWho = 1 - this.lookWho
    // (At the balloon they turn to her, cheering.)
    const end = this.mode === 'done' || this.mode === 'arrive'
    const turn = (a: Actor, to: number) => (a.headTurn += (to - a.headTurn) * (1 - Math.exp(-dt * 6)))
    turn(this.pola, end ? -1.25 : this.lookWho ? look : 0)
    turn(this.pebble, end ? -1.25 : this.lookWho ? 0 : -look)
    if (this.mode === 'done') for (const a of [this.pola, this.pebble]) a.armsUp = 0.5 + 0.5 * Math.sin(t * 6)
    this.pola.update(dt, t)
    this.pebble.update(dt, t)
    // Their air bubble under the ice.
    this.bubbleK += ((this.y < -0.5 ? 1 : 0) - this.bubbleK) * (1 - Math.exp(-dt * 6))
    this.bubble.visible = this.bubbleK > 0.03
    this.bubble.scale.setScalar(1.25 * this.bubbleK * (1 + 0.03 * Math.sin(t * 5)))

    // Nari blows a little spout now and then.
    if (this.mode === 'swim' && !this.air && this.y > -0.5 && (this.spoutT -= dt) < 0) {
      this.spoutT = 7 + Math.random() * 5
      this.spout()
    }

    this.walrus.update(dt, t)
    this.seal.update(dt, t)
    for (const q of this.puffins) q.update(dt, t)
    // The orca's fin keeps pace far off to the side while she's among the icebergs.
    const os = clamp(this.s + 26 + 8 * Math.sin(t * 0.3), SPOTS.orca[0], FORK.to + 10)
    this.orca.root.position.set(cx(os) + SPOTS.orca[1], -0.75, -os)
    this.orca.root.visible = this.s > OPEN_END - 60 && this.s < DIVE.from + 10
    this.orca.update(dt, t)
    // The belugas: porpoising in the left channel, then swimming along beside her under the ice.
    this.belugas.forEach((b, i) => {
      const escort = this.s > DIVE.from - 4
      const goal = this.belugaAt[i]
      if (escort) goal.set(cx(this.s + 5) + (i ? 6.4 : -6.4), -DIVE.depth + 0.5 + 0.4 * Math.sin(t * 1.2 + i * 2), -(Math.min(this.s, DIVE.to - 6) + 5 + i * 2.5))
      else goal.set(cx(SPOTS.belugas[i][0]) + SPOTS.belugas[i][1], 0, -(SPOTS.belugas[i][0] + 3 * Math.sin(t * 0.5 + i)))
      if (b.root.position.lengthSq() === 0 || (escort && b.root.position.z > goal.z + 60)) b.root.position.copy(goal)
      b.root.position.lerp(goal, 1 - Math.exp(-dt * 3))
      b.root.rotation.y = Math.PI
      b.root.visible = escort ? this.s < DIVE.to + 30 : this.s > SPOTS.belugas[i][0] - 120
      b.update(dt, t)
    })
    // The old blue iceberg glints when it's poked.
    if (this.blueT >= 0 && (this.blueT += dt * 1.4) >= 1) this.blueT = -1
    this.blue.scale.setScalar(1 + (this.blueT >= 0 ? 0.08 * Math.sin(this.blueT * Math.PI) * Math.cos(this.blueT * 18) : 0))
    // The fizzing bubbles: old air out of the ice, by the berg and under the sheet.
    if ((this.fizzT -= dt) < 0) {
      this.fizzT = 0.07
      const [fs, fl] = SPOTS.fizz
      if (Math.abs(fs - this.s) < 70) this.spray.emit(cx(fs) + fl + (Math.random() - 0.5) * 1.2, 0.05, -fs + (Math.random() - 0.5) * 1.2, 0, 1.6 + Math.random(), 0, 0.5, 0.12 + Math.random() * 0.1)
      if (this.diving) this.bubbleAt(cx(508) + 0.5 + (Math.random() - 0.5) * 0.8, -6 + Math.random() * 2, -508 + (Math.random() - 0.5) * 0.8)
    }
  }

  /** Terry flies ahead, showing the way (he waits above the ice while she's under it, and lands on the balloon). */
  private placeTerry(dt: number, snap = false) {
    const t = this.time
    const a = this.terry
    const ahead = this.s + 9
    const done = this.mode === 'done' || this.mode === 'arrive'
    if (done) tmp2.set(cx(BALLOON) + 0.4, 1.12, -BALLOON + 0.05)
    else tmp2.set(cx(ahead) + lane(ahead, this.lat, this.prefer) * 0.6 + this.lat * 0.4 + Math.sin(t * 0.8) * 1.2, 2.1 + Math.sin(t * 2) * 0.25 + Math.max(0, this.y) * 0.5, -ahead)
    if (this.terryT >= 0) {
      // Poked: a loop the loop.
      this.terryT += dt / 0.9
      tmp2.y += Math.sin(this.terryT * Math.PI) * 1.4
      if (this.terryT >= 1) this.terryT = -1
    }
    if (snap) a.pos.copy(tmp2)
    else a.pos.lerp(tmp2, 1 - Math.exp(-dt * (done ? 1.6 : 5)))
    const landed = done && a.pos.distanceTo(tmp2) < 0.25
    a.flying = !landed
    a.root.rotation.y = landed ? 0 : Math.PI + (this.terryT >= 0 ? this.terryT * Math.PI * 2 : 0) - Math.atan(dcx(ahead)) * 0.5
    a.root.visible = this.y > -1.2
    a.update(dt, t)
  }

  /** Her wake: foam spreading out behind her, spray off her side in a swerve. */
  private wake(dt: number, t: number) {
    if (this.mode === 'done' || this.air || this.y < -0.4 || this.v < 1 || (this.trailT -= dt) > 0) return
    this.trailT = 0.07
    const p = this.pos()
    const sw = clamp(Math.abs(this.latV) / 4)
    for (const side of [-1, 1]) this.foam.emit(p.x + side * 0.45 + (Math.random() - 0.5) * 0.2, 0.03, p.z + 1.8, side * (1.3 + sw), 0, 1.2, 1, 0.42 + Math.random() * 0.25 + sw * 0.35)
    if (sw > 0.35) this.spray.emit(p.x - Math.sign(this.latV) * 0.7, 0.2, p.z + 0.4 * Math.sin(t * 30), -Math.sign(this.latV) * (1.5 + Math.random() * 1.5), 2 + Math.random() * 2 * sw, 1.2, 0.5, 0.12 + 0.1 * sw)
  }

  private placeNari(dt: number) {
    const p = this.pos()
    this.nariRoot.position.copy(p)
    const k = (rate: number) => (dt ? 1 - Math.exp(-dt * rate) : 1)
    // Facing the way she's going; nose up over a jump and down into the dive; rolling into her swerves.
    let yaw = Math.atan2(dcx(this.s) * this.v + this.latV, -Math.max(0.5, this.v))
    if (this.mode === 'done') yaw = Math.PI
    let d = yaw - this.yaw
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.yaw += d * k(8)
    this.nariRoot.rotation.y = this.yaw
    const moving = this.mode === 'swim'
    const pitch = moving && (this.air || this.diving) ? Math.atan2(-this.vy, Math.max(2, this.v)) : moving ? -Math.atan((this.surface(this.s + 0.8, this.lat) - this.surface(this.s - 0.8, this.lat)) / 1.6) : 0
    this.pitch += (clamp(pitch, -0.8, 0.8) - this.pitch) * k(9)
    const roll = moving ? clamp(this.latV / Math.max(3, this.v), -0.6, 0.6) * RIDE.lean : 0
    this.roll += (roll - this.roll) * k(7)
    this.lean.rotation.set(this.pitch, 0, -this.roll)
    this.nari.speed = clamp(this.v / RIDE.speed)
    this.nari.update(dt, this.time)
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const tall = this.tall
    if (this.mode === 'done' || (this.mode === 'arrive' && this.modeT > 0.6)) {
      // The three of them and the balloon, from the side so their faces show.
      const c = new Vector3(cx(DOCK) + this.lat * 0.5 + 0.3, 1.9, -(DOCK + 2.2))
      return { center: c, half: tall ? new Vector3(2.4, 2.2, 3.4) : new Vector3(3, 2.2, 4.6), yaw: 96, pitch: 8 }
    }
    if (this.mode === 'ready' && this.intro) {
      // A look at their faces before she sets off.
      return { center: new Vector3(cx(this.s), 1.1, -this.s - 0.3), half: new Vector3(2.4, 1.3, 2.4), yaw: 152, pitch: 10 }
    }
    const yaw = -Math.atan(dcx(this.s)) * TO_DEG * 0.7
    // (Low over the water already as she comes up to the ice bridge, so the camera dips under with her.)
    if (this.y < -0.5 || (this.s > DIVE.from - 7 && this.s < DIVE.to)) {
      const s = this.s + 5
      return { center: new Vector3(cx(s) + this.lat * 0.82, this.y + 0.5, -s), half: tall ? new Vector3(2.8, 1.3, 5) : new Vector3(4.4, 1.3, 4), yaw, pitch: 5, maxDist: 12.5 }
    }
    // Behind her: further ahead the faster she goes, so what's coming shows. (A glance at the glacier as it cracks.)
    const ahead = 3.4 + this.v * this.rig.lag * 0.6
    const s = this.s + ahead
    const watching = this.calveT >= 0 && this.calveT < 3.4 ? 1 : 0
    const c = new Vector3(cx(s) + this.lat * 0.82 - watching * 4, 0.8 + Math.max(0, this.y) * 0.45 + watching, -s - watching * 6)
    return { center: c, half: tall ? new Vector3(3.6, 1.3, 7) : new Vector3(5.6, 1.3, 4.8), yaw: yaw + watching * 14, pitch: 21 - watching * 5 }
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
    this.counts.touches++
    this.wheel.down(x, y, this.time, id)
    if (this.mode === 'swim') this.steerLat = this.lat
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    this.wheel.move(x, y, downX, downY, held)
  }
  pointerUp() {
    this.wheel.up()
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    const poke = (what: RidePoke) => {
      this.counts.pokes++
      this.events.poke(what)
    }
    if (id === 'nari') {
      rideSfx.spout()
      this.spout()
      return poke('nari')
    }
    if (id === 'pola' || id === 'pebble') {
      const a = id === 'pola' ? this.pola : this.pebble
      a.hop()
      a.pull('happy')
      this.lookWho = id === 'pola' ? 1 : 0
      this.lookBack = 1.6
      return poke(id)
    }
    if (id === 'terry') {
      this.terryT = 0
      rideSfx.tern()
      return poke('terry')
    }
    if (id === 'walrus' || id === 'seal' || id === 'orca') {
      const c = this[id]
      c.poke()
      rideSfx[id]()
      const q = c.root.position
      if (id === 'orca') this.spray.burst(q.x, 0.6, q.z, 26, 2, 6, 0.24)
      else this.spray.burst(q.x, q.y + 0.3, q.z, 8, 1.5, 2, 0.14)
      return poke(id)
    }
    if (id === 'puffins') {
      this.puffins.forEach((q, i) => setTimeout(() => q.poke(), i * 120))
      rideSfx.puffin()
      return poke('puffins')
    }
    if (id?.startsWith('beluga:')) {
      const b = this.belugas[+id.slice(7)]
      b?.poke()
      rideSfx.beluga()
      if (b) for (let i = 0; i < 8; i++) this.bubbleAt(b.root.position.x + (Math.random() - 0.5), b.root.position.y, b.root.position.z + (Math.random() - 0.5))
      if (b && b.root.position.y > -1) this.spray.burst(b.root.position.x, 0.2, b.root.position.z, 14, 2, 3.5, 0.18)
      return poke('beluga')
    }
    if (id === 'fizz') {
      rideSfx.fizz()
      this.spray.burst(cx(SPOTS.fizz[0]) + SPOTS.fizz[1], 0.1, -SPOTS.fizz[0], 30, 1.4, 4, 0.14)
      return poke('fizz')
    }
    if (id === 'chunk') {
      this.chunkT = 0
      rideSfx.tick()
      const q = this.chunk.position
      this.spray.burst(q.x + 2, 0.2, q.z, 26, 3.5, 4, 0.2)
      return poke('chunk')
    }
    if (id === 'blue') {
      this.blueT = 0
      rideSfx.glint()
      const q = this.blue.position
      this.spray.burst(q.x, 4, q.z, 22, 3, 2, 0.16)
      return poke('blue')
    }
    // The water plips where she pokes it (bubbles, under the sea); ice gives a puff of snow.
    const cam = this.rig.camera
    const dir = tmp.set((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1, 0.5).unproject(cam).sub(cam.position).normalize()
    if (cam.position.y < 0) {
      const q = tmp2.copy(cam.position).addScaledVector(dir, 9)
      for (let i = 0; i < 7; i++) this.bubbleAt(q.x + (Math.random() - 0.5), Math.min(-0.4, q.y) + (Math.random() - 0.5), q.z + (Math.random() - 0.5))
      rideSfx.plip()
      return this.events.poke('water')
    }
    if (dir.y > -0.02) return
    const q = tmp2.copy(cam.position).addScaledVector(dir, -cam.position.y / dir.y)
    if (q.distanceTo(cam.position) > 120) return
    const s = -q.z
    const lat = q.x - cx(s)
    const ice = Math.abs(lat) > half(clamp(s, 0, BACK_WALL)) + 3 || (s > DIVE.sheetFrom && s < DIVE.hole - 13)
    if (ice) {
      this.spray.burst(q.x, 0.3, q.z, 10, 1.6, 2.6, 0.16)
      rideSfx.tick()
    } else {
      this.spray.burst(q.x, 0.1, q.z, 10, 1.5, 3.2, 0.16)
      this.foam.emit(q.x, 0.03, q.z, 0, 0, 0, 1, 2)
      rideSfx.plip()
    }
    this.events.poke(ice ? 'ice' : 'water')
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, size: number, z = '1') => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(at)
        const top = this.toScreen(tmp2.copy(at).setY(at.y + size / 2))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.abs(c.y - top.y) * 2.4) }
      }
      const show = !!spot && spot.x > 0 && spot.x < this.w && spot.y > 0 && spot.y < this.h
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
      if (el.style.zIndex !== z) el.style.zIndex = z
    }
    const near = (s: number, from = -4, to = 75) => s - this.s > from && s - this.s < to
    const over = this.y > -1
    for (const [id, el] of this.anchorEls) {
      if (id === 'nari') place(el, this.nari.tip(tmp).lerp(this.nariRoot.position, 0.45), 1.3, '2')
      else if (id === 'pola') place(el, this.pola.at(0.6, tmp), 1.1, '3')
      else if (id === 'pebble') place(el, this.pebble.at(0.6, tmp), 0.9, '4')
      else if (id === 'terry') place(el, this.terry.root.visible ? this.terry.at(0.5, tmp) : null, 0.8, '2')
      else if (id === 'walrus') place(el, over && near(SPOTS.walrus[0]) ? tmp.copy(this.walrus.root.position).setY(0.9) : null, 1.8)
      else if (id === 'puffins') place(el, over && near(SPOTS.puffins[0]) ? tmp.copy(this.puffins[1].root.position).setY(0.6) : null, 1.6)
      else if (id === 'seal') place(el, over && near(SPOTS.seal[0]) ? tmp.copy(this.seal.root.position).setY(1.2) : null, 1.5)
      else if (id === 'fizz') place(el, over && near(SPOTS.fizz[0]) ? tmp.set(cx(SPOTS.fizz[0]) + SPOTS.fizz[1], 0.4, -SPOTS.fizz[0]) : null, 1.6)
      else if (id === 'blue') place(el, over && near(SPOTS.blue[0], -6, 90) ? tmp.copy(this.blue.position).setY(3) : null, 5)
      else if (id === 'orca') place(el, over && this.orca.root.visible && this.s > OPEN_END + 20 ? tmp.copy(this.orca.root.position).setY(0.8) : null, 2.4)
      else if (id === 'chunk') place(el, this.calved && over && near(CALVE.s, -14, 70) ? tmp.copy(this.chunk.position).setY(1.2) : null, 5)
      else if (id.startsWith('beluga:')) {
        const b = this.belugas[+id.slice(7)]
        const q = b?.root.position
        place(el, b && q && b.root.visible && near(-q.z, -6, 60) && q.y > -1 === over ? tmp.copy(q).setY(q.y + 0.2) : null, 1.5)
      }
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const nari = this.toScreen(tmp2.copy(this.pos()))
    return {
      section: this.section,
      mode: this.mode,
      s: +this.s.toFixed(1),
      lat: +this.lat.toFixed(2),
      y: +this.y.toFixed(2),
      air: this.air,
      under: this.y < -0.5,
      speed: +this.v.toFixed(1),
      steerLat: +this.steerLat.toFixed(2),
      push: +this.wheel.push.toFixed(2),
      channel: ridge(this.s) > 0 ? (this.lat < 0 ? 'left' : 'right') : null,
      fish: this.fish,
      calved: this.calved,
      done: this.mode === 'done',
      nari: { x: Math.round(nari.x), y: Math.round(nari.y) },
      ...this.counts,
      steered: +this.counts.steered.toFixed(1),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.unwatch()
    this.stopSea()
    this.scene.clear()
    this.bag.dispose()
  }
}

/** An iceberg with its keel: far more ice under the water than over it. */
function withKeel(top: BufferGeometry, size: number) {
  return merge([top, P.cone(size * 1.2, size * 3.4, KEEL, { at: [0, -size * 1.7 + 0.1, 0], rot: [Math.PI, 0.4, 0] }, 7)])
}

/** The old blue iceberg: ice packed so tight it has gone blue. */
function blueBergGeo(size: number) {
  const r = rng(51)
  const parts = [P.cyl(size * 0.85, size, size * 0.5, '#8CC8F2', { at: [0, size * 0.12, 0] }, 7)]
  for (let i = 0; i < 4; i++) {
    const a = r() * Math.PI * 2
    const d = r() * size * 0.45
    const h = size * (1.1 + r() * 1.1)
    parts.push(P.cone(size * (0.36 + r() * 0.22), h, ['#6DB8EE', '#8CC8F2', '#56A6E6', '#A5D6F7'][i], { at: [Math.cos(a) * d, h / 2 + size * 0.2, Math.sin(a) * d], rot: [(r() - 0.5) * 0.3, r() * 3, (r() - 0.5) * 0.3] }, 5))
  }
  return withKeel(merge(parts), size)
}
