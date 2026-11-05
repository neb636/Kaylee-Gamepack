// The jet ski at Hat Sai Kaew (plan: planning/around-the-world/thailand/samet-trip.html, greybox 1): Kaylee steers,
// Daddy sits behind her, in the island's real coordinates (island/layout.ts), so the bay drops straight into the island
// of greybox 2.
//
// The toy (core verb): steer the jet ski with her finger. Finger down anywhere on the water and it heads there; the
// further she holds, the faster it goes (engine3d/drive.ts, the bay's and the whale boat's control, with a zippy feel).
// Let go and it glides, slows and bobs. A white rooster tail of spray, a lean into every turn, a slide on tight ones,
// and a wake that stays on the water behind her (wake.ts). The verb deepens three times (`round`):
//   ride   the calm bay inside the buoy rope: carve, spray, splash the swimmers, drive through the banana boat's wake.
//          The secret: drive a loop and close it, and the wake circle sparkles and fills with jumping fish (pink
//          sparkles for a heart).
//   waves  the wind comes up and bigger waves roll in from the open sea (engine3d/lagoon.ts draws the same waves the
//          jet ski rides): steer into them to jump, higher waves for bigger jumps, a spin in the air on the biggest. The
//          terns dive beside her.
//   race   race the jet ski man out round the big orange buoy and back to the flags. She wins most of the time (he
//          slows behind her, takes a wide turn), and when he wins it's by a nose; the winner rings the bell on the hut.
// Silly, never failing: drive up onto the sand and it skids, everyone tumbles off laughing and the jet ski man pushes
// it back; spin tight circles and Daddy goes dizzy; splash Mommy on the shore; push into the rope and it stretches
// like a rubber band and boings her back. Life jacket first: the bare link waits for her tap on the jacket.
//
// Greybox: placeholder toon shapes, no voices (the full loop adds them). Every number that decides the feel is a knob
// (?feel=1), with a graph of her finger against what the jet ski does.
import { DynamicDrawUsage, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, Plane, Raycaster, RingGeometry, Scene, SphereGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp } from '../../../../../../sdk'
import { knobs, watch } from '../../../../../kit/knobs'
import { noise as hiss, sfx, tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { Driver, type Feel } from '../../../../../engine3d/drive'
import { bake, blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial, setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL, toon } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { JETSKI_MAN } from '../cast'
import { BANANA, BAY, bay, FAR_BUOY, HUT, LAUNCH, MOMMY, RACE, ROPE, SEAWARD, SWIMMERS, toBay, WAVE_DIR, type RoundId } from '../island/layout'
import { BananaBoat, Fish, Swimmer, Tern } from './critters'
import { buildScenery, SKY, type Scenery } from './scenery'
import { buildSki, HIS, lifeJacket, STERN, type Ski } from './ski'
import { Wake, type Loop } from './wake'

const FILE = 'src/world/places/thailand/activities/samet-trip/jetski/jetski.ts'
/** Steering: the drive control's feel (engine3d/drive.ts), zippier than the boats. */
const HELM = knobs('jetHelm', 'Steering the jet ski', FILE, {
  top: { value: 9.5, min: 4, max: 18, step: 0.25, label: 'Top speed', unit: 'm/s', note: 'cruising speed with her finger far ahead' },
  accel: { value: 7, min: 1, max: 16, step: 0.25, label: 'Speeding up', unit: 'm/s²', note: 'how quickly it gets going (slowing down is a little quicker)' },
  coast: { value: 0.55, min: 0.05, max: 2, step: 0.05, label: 'Gliding drag', unit: '/s', note: 'how fast it slows when she lets go (lower = glides further)' },
  turn: { value: 2.0, min: 0.5, max: 4, step: 0.05, label: 'Turn rate', unit: 'rad/s', note: 'how fast it swings round at speed (slow, it turns half as fast)' },
  grip: { value: 2.0, min: 0.4, max: 10, step: 0.1, label: 'Grip', note: 'how quickly a sideways slide dies out (low = it slides round tight turns)' },
  near: { value: 2.5, min: 1, max: 8, step: 0.25, label: 'Crawl when this close', unit: 'm', note: 'her finger this close to the jet ski = a crawl' },
  far: { value: 18, min: 6, max: 40, step: 0.5, label: 'Full speed from', unit: 'm', note: 'her finger this far ahead = full speed' },
  dead: { value: 0.12, min: 0, max: 0.5, step: 0.01, label: 'Straight-ahead zone', unit: 'rad', note: 'a finger this close to straight ahead goes straight' },
  lean: { value: 0.34, min: 0, max: 0.7, step: 0.01, label: 'Lean into turns', unit: 'rad', note: 'how far it tips into a turn at full speed' },
  lift: { value: 0.07, min: 0, max: 0.25, step: 0.005, label: 'Nose lifts', unit: 'rad', note: 'how far the nose comes up as it speeds up' },
  camera: { value: 0.45, min: 0, max: 1, step: 0.05, label: 'Camera turns with it', note: '0 = slow and steady, 1 = right behind it all the time' },
  pitch: { value: 29, min: 10, max: 60, step: 1, label: 'Camera height', unit: '°', note: 'how far down the chase camera looks (higher shows Kaylee past Daddy)' },
  side: { value: 16, min: -40, max: 40, step: 1, label: 'Camera to the side', unit: '°', note: 'how far round to one side of the jet ski the chase camera sits' },
  ahead: { value: 4, min: 0, max: 12, step: 0.25, label: 'Camera looks ahead', unit: 'm', note: 'how far ahead of the jet ski the camera looks at full speed' },
})
/** The waves and the jumps. */
const WAVES = knobs('jetWaves', 'Waves and jumps', FILE, {
  ride: { value: 0.14, min: 0, max: 1, step: 0.01, label: 'Waves: ride', unit: 'm', note: 'crest height in the calm ride round' },
  waves: { value: 1.05, min: 0.2, max: 2.5, step: 0.05, label: 'Waves: waves', unit: 'm', note: 'crest height in the waves round' },
  race: { value: 0.4, min: 0, max: 1.5, step: 0.05, label: 'Waves: race', unit: 'm', note: 'crest height in the race' },
  length: { value: 17, min: 6, max: 40, step: 0.5, label: 'Between crests', unit: 'm' },
  speed: { value: 4.5, min: 0, max: 10, step: 0.25, label: 'Waves roll in at', unit: 'm/s' },
  hopFrom: { value: 0.9, min: 0.1, max: 4, step: 0.05, label: 'Jumps from', unit: 'm/s', note: 'how fast the water must lift it before a crest throws it in the air' },
  hop: { value: 1.35, min: 0.5, max: 4, step: 0.05, label: 'Jump', unit: '×', note: 'how hard a crest throws it (times how fast the wave lifted it)' },
  spin: { value: 7.6, min: 3, max: 14, step: 0.1, label: 'Spins from', unit: 'm/s', note: 'a throw this hard spins it round in the air' },
  squash: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Squash on landing', unit: '×' },
  jumps: { value: 8, min: 2, max: 30, step: 1, label: 'Jumps before the race', note: 'the waves round moves on to the race after this many jumps' },
})
/** The rope, the sand, the silly things. */
const SILLY = knobs('jetSilly', 'The rope, the sand, the silly things', FILE, {
  rope: { value: 7, min: 1, max: 20, step: 0.25, label: 'Rope springiness', unit: '/s²', note: 'how hard the stretched rope pulls her back' },
  give: { value: 3.5, min: 0.5, max: 8, step: 0.25, label: 'Rope stretches', unit: 'm', note: 'how far the rope stretches before it boings her back for sure' },
  beach: { value: 2.2, min: 0.5, max: 8, step: 0.1, label: 'Skids up the sand from', unit: 'm/s', note: 'slower than this and the sand just stops it gently' },
  dizzy: { value: 1.25, min: 0.5, max: 6, step: 0.25, label: 'Dizzy after', unit: 'turns', note: 'full turns round and round one way before Daddy goes dizzy' },
  splash: { value: 5, min: 2, max: 10, step: 0.25, label: 'Splashes Mommy within', unit: 'm' },
  ride: { value: 70, min: 10, max: 200, step: 5, label: 'Ride round lasts', unit: 's', note: 'seconds of riding before the waves come (sooner after a loop)' },
})
/** The race. */
const RACEK = knobs('jetRace', 'Racing the jet ski man', FILE, {
  rival: { value: 0.9, min: 0.5, max: 1.3, step: 0.01, label: 'His speed', unit: '× hers', note: 'his top speed as a share of hers' },
  ahead: { value: 0.7, min: 0.3, max: 1, step: 0.01, label: 'Slows when ahead', unit: '×', note: 'his speed while he is ahead of her' },
  catchUp: { value: 1.08, min: 1, max: 1.4, step: 0.01, label: 'Catches up', unit: '×', note: 'his speed while she is far ahead (so it stays close)' },
  ease: { value: 0.08, min: 0, max: 0.3, step: 0.01, label: 'Easier after a loss', unit: '×', note: 'how much slower he goes after each race she loses' },
  wide: { value: 9, min: 0, max: 25, step: 0.5, label: 'His wide turn', unit: 'm', note: 'how wide he swings round the buoy' },
})

export type JetSection = 'jetski'
export interface JetStart {
  round: RoundId
}
export interface JetEvents {
  /** A new round began (the address bar follows). */
  round(r: RoundId): void
  /** The race is over: she won (rings the bell) or he won by a nose ("So close! Again?"). */
  raceOver(won: boolean): void
  /** A countdown number (3, 2, 1, 0 = go; -1 = hide). */
  count(n: number): void
  /** Spray on the camera after a big landing (0..1). */
  spray(k: number): void
}

const DEG = 180 / Math.PI
const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const fm = new Matrix4()
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const easeOut = (k: number) => 1 - (1 - clamp(k, 0, 1)) ** 3
const bellK = (k: number) => Math.sin(Math.PI * clamp(k, 0, 1))

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const engine = (k: number, air: boolean) => tone(air ? 210 + k * 120 : 95 + k * 120, air ? 230 + k * 120 : 90 + k * 115, 0.07, 0.018 + k * 0.014, 'sawtooth')
const splashBig = (k: number) => {
  hiss(0.5 + k * 0.3, 0.12 + k * 0.12, 'lowpass', 1400, 300)
  hiss(0.25, 0.06 + k * 0.05, 'highpass', 2500, 1200, 0.05)
}
const ding = () => [0, 0.35, 0.7].forEach((d) => {
  tone(1320, 1318, 0.9, 0.07, 'sine', d)
  tone(2640, 2630, 0.5, 0.025, 'sine', d)
})
const bonk = () => {
  tone(240, 160, 0.22, 0.1)
  tone(990, 980, 0.6, 0.03, 'sine', 0.02)
}
const squeal = () => [0, 0.13].forEach((d) => tone(900, 1500, 0.16, 0.05, 'triangle', d))
const toot = () => [0, 0.18].forEach((d) => tone(620, 640, 0.14, 0.06, 'square', d))
const twinkle = (pink: boolean) => [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => tone((pink ? 1100 : 900) * (1 + i * 0.25), (pink ? 1300 : 1050) * (1 + i * 0.25), 0.14, 0.045, 'sine', d))
const wobble = () => tone(520, 260, 1.1, 0.05, 'triangle')
const beep = (go: boolean) => tone(go ? 990 : 660, go ? 990 : 660, go ? 0.45 : 0.2, 0.08, 'square')
const click = () => [0, 0.08].forEach((d) => hiss(0.04, 0.25, 'highpass', 2800, 2800, d))

/** The jet ski man: an otter in an orange life vest and a cap (cast.ts). */
const MAN_LOOK = JETSKI_MAN

export const JET_ANCHORS: AnchorInfo[] = [
  { id: 'jacket', label: 'The life jacket', kind: 'thing' },
  { id: 'kaylee', label: 'Kaylee on the jet ski', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'man', label: 'The jet ski man', kind: 'thing' },
  { id: 'bell', label: 'The bell on the hut', kind: 'thing' },
  { id: 'buoy', label: 'The big orange buoy', kind: 'thing' },
  { id: 'banana', label: 'The banana boat', kind: 'thing' },
  ...SWIMMERS.map((_, i) => ({ id: `swimmer:${i}`, label: 'A swimmer', kind: 'thing' as const })),
  ...[0, 1, 2].map((i) => ({ id: `tern:${i}`, label: 'A tern', kind: 'thing' as const })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ id: `umbrella:${i}`, label: 'A beach umbrella', kind: 'thing' as const })),
]

type Phase = 'jacket' | 'suit' | 'push' | 'ride' | 'beached' | 'countdown' | 'racing' | 'raceEnd'
interface Spring {
  x: number
  v: number
}
interface Float {
  /** Rest place, the rope's outward normal there, which side it's on and how far along (for the stretch). */
  x: number
  z: number
  nx: number
  nz: number
  side: number
  s: number
}

export class JetSki implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private s: Scenery
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private round: RoundId
  private phase: Phase

  // ---- Her jet ski, Kaylee and Daddy.
  private d: Driver
  private feel: Feel
  private ski: Ski
  private shadow: Mesh
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private man: Member
  private jacket: Group
  private jacketFloat: Group
  private nickJacket: Group
  private cap: Group
  private capT = -1
  private pitch: Spring = { x: 0, v: 0 }
  private roll: Spring = { x: 0, v: 0 }
  private squash = 1
  private spinT = -1
  private spinDir = 1
  private camYaw: number
  private surf = 0
  private climb = 0
  private climbMax = 0
  private engineT = 0
  private lastFwd = 0

  // ---- Her finger.
  private finger: { x: number; y: number; steering: boolean; t: number; id?: string } | null = null
  private marker: Mesh
  private aimAhead = 0
  private aimTurn = 0
  private lastTouch = 0

  // ---- The rope.
  private ropeNow: { w: number; e: number; out: number }
  private floats: Float[] = []
  private floatMesh: Group
  private floatSets: [InstancedMesh, InstancedMesh][] = []
  private stretch = { side: -1, s: 0, k: 0 }
  private boingCool = 0

  // ---- Silly things.
  private beachT = -1
  private beach = { from: new Vector3(), to: new Vector3(), back: new Vector3(), heading: 0, out: 0 }
  private spinSum = 0
  private dizzyT = -1
  private mommyCool = 0
  private soakT = -1

  // ---- The race.
  private rival: Driver
  private rivalSki: Ski
  private leg: [number, number] = [0, 0]
  private rivalWp = 0
  private countT = 0
  private lastCount = 99
  private losses = 0
  private raceT = 0
  private winner: 'her' | 'him' | null = null
  private endT = 0

  // ---- Everyone else.
  private swimmers: Swimmer[] = []
  private swimCool: number[] = []
  private terns: Tern[] = []
  private fish: Fish
  private banana: BananaBoat
  private bananaS = 0
  private bellSwing: Spring = { x: 0, v: 0 }
  private buoyBob: Spring = { x: 0, v: 0 }
  private umbrellaSpin: number[] = []
  private fishT = 4
  private ternT = 3
  private wake: Wake
  private loops: Loop[] = []
  private fillT = -1
  private fill: Loop | null = null
  private fillFish = 0

  private spray: Particles
  private foam: Particles
  private sparkle: Particles
  private stars: Particles

  private rideT = 0
  private counts = { steers: 0, taps: 0, pokes: 0, jumps: 0, spins: 0, loops: 0, hearts: 0, beachings: 0, dizzy: 0, soaked: 0, boings: 0, races: 0, wins: 0, losses: 0, bells: 0, bonks: 0, squeals: 0, tips: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: JetStart,
    private events: JetEvents,
  ) {
    const { scene, bag } = this
    scene.fog = new Fog(SKY.haze, 170, 950)
    applyBands()
    this.rig.fov = 52
    this.rig.lag = 0.3
    this.rig.camera.far = 3200
    this.round = start.round
    this.phase = start.round === 'ride' ? 'jacket' : start.round === 'race' ? 'countdown' : 'ride'
    this.ropeNow = { ...ROPE[this.round] }

    this.s = buildScenery(bag)
    scene.add(this.s.root)
    this.s.lagoon.waves.dir = WAVE_DIR
    this.s.lagoon.waves.height = this.waveGoal()

    // ---- Her jet ski with Kaylee and Daddy.
    this.feel = { top: 0, boost: 1.4, accel: 0, coast: 0, turn: 0, grip: 0, near: 0, far: 0, dead: 0, lean: 0 }
    this.readFeel()
    this.d = new Driver(this.feel)
    this.ski = buildSki(bag)
    scene.add(this.ski.root)
    this.shadow = blobShadow(1.2, bag)
    this.shadow.scale.set(0.9, 1, 2.2)
    scene.add(this.shadow)
    this.kaylee = new Avatar(bag)
    const fam = (id: string) => new Member({ ...FAMILY.find((f) => f.id === id)!, spot: null }, bag)
    this.nick = fam('nick')
    this.ji = fam('ji')
    this.ski.front.add(this.kaylee.root)
    this.ski.back.add(this.nick.root)
    this.seat()
    // Life jackets (on the body, so they lie down with them): Kaylee's pink and white (it waits for her tap on the bare link), Daddy's orange.
    this.jacket = lifeJacket(bag, 0.22, 0.4, 0.3, PAL.hotpink)
    this.kaylee.rig.body.add(this.jacket)
    this.jacketFloat = lifeJacket(bag, 0.32, 0, 0.44, PAL.hotpink)
    scene.add(this.jacketFloat)
    this.nickJacket = lifeJacket(bag, this.nick.rig.radius * 1.12, this.nick.height * 0.3, this.nick.height * 0.2, '#FF8A2E', '#FFE07A')
    this.nick.rig.body.add(this.nickJacket)
    this.jacket.visible = this.phase !== 'jacket'
    this.jacketFloat.visible = this.phase === 'jacket'
    // Daddy's cap (it blows off when she pokes him).
    const f = this.nick.rig.face
    this.cap = new Group()
    this.cap.add(capMesh(bag, f.R))
    this.cap.position.set(0, f.headY + f.R * 0.72, -f.R * 0.05)
    this.nick.rig.head.add(this.cap)

    // Mommy on the sand at the water's edge, the jet ski man by his hut (or on his own jet ski in the race).
    this.ji.place(MOMMY.x, this.groundY(MOMMY.x, MOMMY.z), MOMMY.z, SEAWARD * DEG, 'stand')
    this.man = new Member({ id: 'jetski-man', name: 'The jet ski man', who: 'runs the jet skis on Sai Kaew', height: MAN_LOOK.height, spot: null, pitch: 300 }, bag, MAN_LOOK, undefined)
    scene.add(this.ji.root, this.man.root)
    this.man.rig.body.add(lifeJacket(bag, this.man.rig.radius * 1.12, this.man.height * 0.3, this.man.height * 0.22, '#FF8A2E', '#FFE07A'))
    this.rivalSki = buildSki(bag, HIS)
    scene.add(this.rivalSki.root)
    this.rival = new Driver({ ...this.feel })
    this.parkRival()

    // Where her finger holds: a pink ring on the water.
    this.marker = new Mesh(bag.add(new RingGeometry(1.0, 1.45, 32)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.85, depthWrite: false })))
    this.marker.rotation.x = -Math.PI / 2
    this.marker.renderOrder = 3
    this.marker.visible = false
    scene.add(this.marker)

    // ---- The rope's floats (orange and white, every 2.4 m, only where they're in the water).
    this.floatMesh = new Group()
    scene.add(this.floatMesh)
    this.buildRope()

    // ---- The bay's life.
    SWIMMERS.forEach((p, i) => {
      const s = new Swimmer(bag, i)
      s.root.position.set(p.x, 0, p.z)
      s.root.rotation.y = SEAWARD + Math.PI + (i - 1.5) * 0.4
      scene.add(s.root)
      this.swimmers.push(s)
      this.swimCool.push(0)
    })
    const c1 = bay(-10, 34)
    const c2 = bay(22, 52)
    const c3 = bay(0, 80)
    this.terns = [new Tern(bag, c1.x, c1.z, 14, 9, 5, 0), new Tern(bag, c2.x, c2.z, 18, 11, 6, 2), new Tern(bag, c3.x, c3.z, 22, 13, 5.5, 4)]
    for (const t of this.terns) scene.add(t.root)
    this.fish = new Fish(bag)
    this.banana = new BananaBoat(bag)
    scene.add(this.fish.root, this.banana.root)
    this.umbrellaSpin = this.s.umbrellas.map(() => 0)

    this.wake = new Wake(bag)
    scene.add(this.wake.mesh)
    this.spray = new Particles({ kind: 'spray', count: 420, colors: ['#FFFFFF', '#EAFBFF', '#D6F6FF'], gravity: 13 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 260, opacity: 0.9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 260, colors: ['#FFFFFF', '#FFF6B8', '#C9F4FF', PAL.gold], gravity: -0.6 }, bag)
    this.stars = new Particles({ kind: 'spray', count: 60, colors: [PAL.gold, '#FFFFFF', PAL.pink], gravity: 0 }, bag)
    scene.add(this.spray.mesh, this.foam.mesh, this.sparkle.mesh, this.stars.mesh)

    // ---- Where the link starts.
    if (this.phase === 'jacket') this.d.place(LAUNCH.x, LAUNCH.z, SEAWARD)
    else if (this.round === 'race') this.startRace(true)
    else {
      const p = bay(0, 8)
      this.d.place(p.x, p.z, SEAWARD)
    }
    this.camYaw = this.d.heading
    this.placeSki(0)

    this.unwatch = watch('jetski', () => ({
      'her finger ahead (m)': [this.aimAhead, 30],
      'turn asked (rad)': [this.aimTurn, 1.6],
      'speed (m/s)': [this.d.speed, 14],
      'turning (rad/s)': [this.d.yawRate, 3],
      'water lifts it (m/s)': [this.climb, 5],
      'in the air (m)': [this.d.y, 2],
    }))
  }

  private readFeel() {
    const f = this.feel
    f.top = HELM.top
    f.accel = HELM.accel
    f.coast = HELM.coast
    f.turn = HELM.turn
    f.grip = HELM.grip
    f.near = HELM.near
    f.far = HELM.far
    f.dead = HELM.dead
    f.lean = HELM.lean
    if (this.rival) Object.assign(this.rival.feel, f, { top: f.top * RACEK.rival * (1 - RACEK.ease) ** this.losses, grip: f.grip * 1.4 })
  }
  private waveGoal() {
    return this.round === 'waves' ? WAVES.waves : this.round === 'race' ? WAVES.race : WAVES.ride
  }
  private groundY(x: number, z: number) {
    return Math.max(0, this.s.terrain.heightAt(x, z))
  }
  private water(x: number, z: number) {
    return this.s.lagoon.heightAt(x, z, this.time, this.s.terrain.shoreAt(x, z))
  }
  /** Kaylee and Daddy in their seats. */
  private seat() {
    for (const [c, seat] of [[this.kaylee, this.ski.front], [this.nick, this.ski.back]] as const) {
      if (c.root.parent !== seat) seat.add(c.root)
      if (c instanceof Avatar) {
        c.place(0, 0, 0, 0)
        c.setPose('sit')
      } else c.place(0, -0.1 * c.height, 0, 0, 'sit')
      c.root.rotation.set(0, 0, 0)
    }
  }
  private parkRival() {
    // His jet ski bobs at the water's edge along the beach; he stands on the sand beside the hut, waving her off.
    const p = bay(-11, 2.4)
    this.rival.place(p.x, p.z, SEAWARD - 0.4)
    this.rival.stop()
    if (this.man.root.parent !== this.scene) this.scene.attach(this.man.root)
    const m = bay(3.5, -1.6)
    this.man.place(m.x, this.groundY(m.x, m.z), m.z, (SEAWARD + 0.4) * DEG, 'stand')
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

  /** On to a round (her play moved it on, or Dad's chip). */
  setRound(r: RoundId, snap = false) {
    if (r === this.round && !snap) return
    this.round = r
    this.events.round(r)
    this.rideT = 0
    this.counts.jumps = r === 'waves' ? 0 : this.counts.jumps
    if (r === 'race') this.startRace(false)
    else if (this.phase === 'countdown' || this.phase === 'racing' || this.phase === 'raceEnd') {
      this.phase = 'ride'
      this.events.count(-1)
      this.parkRival()
    }
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.readFeel()
    const lag = this.s.lagoon
    lag.waves.height += (this.waveGoal() - lag.waves.height) * ease(dt, 0.4)
    lag.waves.length = WAVES.length
    lag.waves.speed = WAVES.speed
    // The rope eases out to the round's square.
    const goal = ROPE[this.round]
    for (const k of ['w', 'e', 'out'] as const) this.ropeNow[k] += (goal[k] - this.ropeNow[k]) * ease(dt, 0.8)

    this.steer()
    this.drive(dt)
    this.raceStep(dt)
    this.life(dt, t)
    this.placeSki(dt)
    this.placeRope(t)
    this.wake.update(t, this.d.heading, (x, z) => this.water(x, z))
    for (const p of [this.spray, this.foam, this.sparkle, this.stars]) p.update(dt)
    this.progress(dt)

    lag.update(t, this.d.x, this.d.z)
    this.lights.follow(this.d.x, 0, this.d.z)
    this.s.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.camYaw += wrap(this.d.heading - this.camYaw) * ease(dt, 0.3 + HELM.camera * 4) * (this.beachT >= 0 ? 0.2 : 1)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- her finger: steering

  private steer() {
    const d = this.d
    const f = this.finger
    this.marker.visible = false
    this.aimAhead = this.aimTurn = 0
    if (this.phase !== 'ride' && this.phase !== 'racing' && this.phase !== 'raceEnd') {
      if (this.phase !== 'beached') d.stop()
      return
    }
    if (f && !f.steering && this.time - f.t > 0.3) this.startSteer()
    if (f?.steering) {
      const p = this.waterPoint(f.x, f.y, tmp)
      if (p) {
        d.hold(p.x, p.z)
        this.marker.visible = true
        this.marker.position.set(p.x, this.water(p.x, p.z) + 0.06, p.z)
        this.marker.scale.setScalar(0.9 + Math.sin(this.time * 6) * 0.12)
        const dx = p.x - d.x
        const dz = p.z - d.z
        this.aimAhead = dx * Math.sin(d.heading) + dz * Math.cos(d.heading)
        this.aimTurn = wrap(Math.atan2(dx, dz) - d.heading)
      }
    }
    const g = d.goal
    if (!f && g && d.driven) {
      this.marker.visible = true
      this.marker.position.set(g.x, this.water(g.x, g.z) + 0.06, g.z)
      this.marker.scale.setScalar(0.7)
    }
  }
  private startSteer() {
    const f = this.finger
    if (!f || f.steering) return
    f.steering = true
    this.counts.steers++
  }

  // ---------------------------------------------------------------- the jet ski on the water

  private drive(dt: number) {
    const d = this.d
    if (this.phase === 'jacket' || this.phase === 'suit') {
      d.place(LAUNCH.x, LAUNCH.z, SEAWARD)
      return
    }
    if (this.phase === 'push') {
      // The jet ski man pushes them off the sand by the handlebars, like in the photo.
      this.beachT += dt / 1.5
      const k = easeOut(this.beachT)
      const a = LAUNCH
      const b = bay(0, 6)
      d.place(a.x + (b.x - a.x) * k, a.z + (b.z - a.z) * k, SEAWARD)
      const m = bay(0, -0.6 + k * 4.2)
      this.man.root.position.set(m.x, this.groundY(m.x, m.z) - Math.min(0.6, k * 0.8), m.z)
      if (this.beachT >= 1) {
        this.beachT = -1
        this.phase = 'ride'
        this.lastTouch = this.time
        const home = bay(3.5, -1.6)
        this.walkMan(home.x, home.z)
      }
      return
    }
    if (this.phase === 'beached') return this.beached(dt)
    if (this.phase === 'countdown') {
      const p = RACE.start[0]
      d.place(p.x, p.z, SEAWARD)
      return
    }
    const fwd0 = d.speed
    const ev = d.step(dt)
    // The water under it: it rides the swell; a wave lifting it fast and then dropping away throws it in the air.
    const shore = this.s.terrain.shoreAt(d.x, d.z)
    const surf = this.water(d.x, d.z)
    const rise = (surf - this.surf) / Math.max(dt, 1e-3)
    this.surf = surf
    this.climb += (rise - this.climb) * ease(dt, 12)
    if (!d.airborne) {
      if (this.climb > WAVES.hopFrom) this.climbMax = Math.max(this.climbMax, this.climb)
      else if (this.climbMax > 0 && this.climb < 0.1) {
        const vy = this.climbMax * WAVES.hop * clamp(Math.abs(d.speed) / (HELM.top * 0.5), 0.3, 1.2)
        if (vy > 1.4) this.takeOff(vy)
        this.climbMax = 0
      }
    }
    if (ev.landed !== undefined) this.land(ev.landed)
    this.lastFwd = (d.speed - fwd0) / Math.max(dt, 1e-3)

    // Dizzy: tight circles one way add up (straightening out or turning back the other way starts the count again).
    if (Math.abs(d.yawRate) < 0.6 || Math.sign(d.yawRate) !== Math.sign(this.spinSum)) this.spinSum *= Math.exp(-dt * 2)
    this.spinSum += d.yawRate * dt
    if (Math.abs(this.spinSum) > SILLY.dizzy * Math.PI * 2 && this.dizzyT < 0) {
      this.dizzyT = 0
      this.spinSum = 0
      this.counts.dizzy++
      wobble()
    }

    this.collide(dt, shore)
    // The wake, the spray.
    const sp = clamp(Math.abs(d.speed) / HELM.top, 0, 1.3)
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (!d.airborne && sp > 0.05) {
      const loop = this.wake.add(d.x + sx * STERN, d.z + sz * STERN, this.time, sp)
      if (loop) this.closed(loop)
    }
    if (!d.airborne && sp > 0.25) {
      const n = Math.random() < sp * 1.6 ? 2 : 1
      for (let i = 0; i < n; i++) {
        // The rooster tail: up and back, more the faster it goes.
        const bx = d.x + sx * (STERN - 0.1)
        const bz = d.z + sz * (STERN - 0.1)
        this.spray.emit(bx + (Math.random() - 0.5) * 0.4, surf + 0.25, bz + (Math.random() - 0.5) * 0.4, -sx * (2 + sp * 4) + (Math.random() - 0.5) * 1.4, 2.5 + sp * 5.5 + Math.random() * 1.5, -sz * (2 + sp * 4) + (Math.random() - 0.5) * 1.4, 0.7 + Math.random() * 0.3, 0.16 + sp * 0.16)
      }
      // Side spray on a hard turn, from the outside of the turn.
      if (Math.abs(d.yawRate) > 0.9 && Math.random() < 0.7) {
        const side = -Math.sign(d.yawRate)
        const ox = Math.cos(d.heading) * side
        const oz = -Math.sin(d.heading) * side
        this.spray.emit(d.x + ox * 0.6, surf + 0.2, d.z + oz * 0.6, ox * (2 + sp * 3), 2 + sp * 3, oz * (2 + sp * 3), 0.6, 0.18 + sp * 0.1)
      }
      if (Math.random() < 0.5) this.foam.emit(d.x + sx * STERN, surf + 0.05, d.z + sz * STERN, 0, 0, 0, 1.4, 0.9 + sp)
    }
    this.engineT -= dt
    if (this.engineT <= 0) {
      this.engineT = 0.085
      if (sp > 0.03 || d.airborne) engine(sp, d.airborne)
    }
  }

  private takeOff(vy: number) {
    const d = this.d
    d.jump(vy)
    this.counts.jumps++
    if (vy > WAVES.spin) {
      this.spinT = 0
      this.spinDir = d.yawRate >= 0 ? 1 : -1
      this.counts.spins++
    }
    tone(260, 520, 0.4, 0.04, 'sawtooth')
    this.kaylee.react('wiggle')
    for (const t of this.terns) if (!t.diving && Math.random() < 0.5) t.diveAt(d.x + Math.sin(d.heading) * 8 + (Math.random() - 0.5) * 8, d.z + Math.cos(d.heading) * 8 + (Math.random() - 0.5) * 8)
  }
  private land(v: number) {
    const d = this.d
    const k = clamp(v / 8, 0, 1)
    this.squash = 1 - 0.28 * k * WAVES.squash
    this.pitch.v += 2.5 * k
    const y = this.surf
    this.spray.burst(d.x, y + 0.2, d.z, 18 + Math.round(30 * k), 3 + 5 * k, 5 + 5 * k, 0.24 + 0.18 * k)
    this.foam.emit(d.x, y + 0.05, d.z, 0, 0, 0, 1.6, 3 + 4 * k)
    splashBig(k)
    if (k > 0.45) this.events.spray(k)
    this.nick.react('hop')
  }

  /** Bumping into things: the rope boings her back, the sand stops her (or she skids up it), buoys and swimmers bonk. */
  private collide(dt: number, shore: number) {
    const d = this.d
    const r = this.ropeNow
    const b = toBay(d.x, d.z)
    // The rope (the beach side is the sand).
    let ov = 0
    let nx = 0
    let nz = 0
    let side = -1
    let s = 0
    const { t, n } = BAY
    if (b.u < r.w) [ov, nx, nz, side, s] = [r.w - b.u, -t.x, -t.z, 0, b.v]
    else if (b.u > r.e) [ov, nx, nz, side, s] = [b.u - r.e, t.x, t.z, 1, b.v]
    if (b.v > r.out && b.v - r.out > ov) [ov, nx, nz, side, s] = [b.v - r.out, n.x, n.z, 2, b.u]
    if (ov > 0) {
      d.vx -= nx * ov * SILLY.rope * dt * 2
      d.vz -= nz * ov * SILLY.rope * dt * 2
      if (ov > SILLY.give) d.bounce(-nx, -nz, 0.6)
      this.stretch = { side, s, k: Math.max(this.stretch.k, ov) }
      if (ov > 0.6 && this.boingCool <= 0) {
        this.boingCool = 1.2
        sfx.boing()
        this.counts.boings++
      }
    }
    this.boingCool -= dt
    this.stretch.k = Math.max(0, this.stretch.k - dt * 2.5)
    if (ov > 0) this.stretch.k = Math.max(this.stretch.k, ov)

    // The sand: fast onto the beach = a skid and a tumble; slow = it just stops. Rocks (off the sand) bounce.
    if (shore < 0.35) {
      const gx = this.s.terrain.shoreAt(d.x + 0.5, d.z) - this.s.terrain.shoreAt(d.x - 0.5, d.z)
      const gz = this.s.terrain.shoreAt(d.x, d.z + 0.5) - this.s.terrain.shoreAt(d.x, d.z - 0.5)
      const l = Math.hypot(gx, gz) || 1
      const sandy = b.u > -32 && b.u < 27
      if (sandy && d.speed > SILLY.beach && this.phase === 'ride') this.startBeach(gx / l, gz / l)
      else {
        d.bounce(gx / l, gz / l, sandy ? 0.15 : 0.5)
        // (Never left sitting on the sand: a nudge back into the water.)
        d.x += (gx / l) * dt * 2
        d.z += (gz / l) * dt * 2
        if (!sandy && Math.abs(d.speed) > 2 && this.boingCool <= 0) {
          this.boingCool = 0.8
          bonk()
        }
      }
    }
    // The big buoy, the flags, the swimmers, his jet ski.
    const bump = (x: number, z: number, rad: number, hit: () => void) => {
      const dx = d.x - x
      const dz = d.z - z
      const dist = Math.hypot(dx, dz)
      if (dist < rad && dist > 1e-3) {
        const k = d.bounce(dx / dist, dz / dist, 0.5)
        d.x = x + (dx / dist) * rad
        d.z = z + (dz / dist) * rad
        if (k > 0.8) hit()
      }
    }
    bump(FAR_BUOY.x, FAR_BUOY.z, 2.6, () => this.pokeBuoy())
    for (const f of this.s.flags) bump(f.position.x, f.position.z, 1.6, () => bonk())
    this.swimmers.forEach((sw, i) =>
      bump(sw.root.position.x, sw.root.position.z, 1.6, () => {
        sw.hop()
        squeal()
        this.counts.squeals++
        this.swimCool[i] = 3
      }),
    )
    bump(this.rival.x, this.rival.z, 2.4, () => bonk())
  }

  // ---------------------------------------------------------------- silly: up onto the sand

  private startBeach(nx: number, nz: number) {
    const d = this.d
    this.phase = 'beached'
    this.beachT = 0
    this.counts.beachings++
    const slide = clamp(d.speed * 0.3, 1, 3)
    const hx = Math.sin(d.heading)
    const hz = Math.cos(d.heading)
    this.beach.from.set(d.x, 0, d.z)
    this.beach.to.set(d.x + hx * slide, 0, d.z + hz * slide)
    this.beach.heading = d.heading
    // Back out: a few meters off the sand, facing the sea.
    this.beach.back.set(d.x + nx * 4.5, 0, d.z + nz * 4.5)
    this.beach.out = Math.atan2(nx, nz)
    d.stop()
    d.vx = d.vz = 0
    d.yawRate = 0
    hiss(0.6, 0.18, 'bandpass', 900, 300)
    this.finger = null
  }
  private beached(dt: number) {
    const d = this.d
    const t = (this.beachT += dt)
    const B = this.beach
    // 0-0.45 s: it skids up the sand. 0.3 s: everyone tumbles off. 2.4 s: back on. 2.9-4.3 s: the man pushes it out.
    if (t < 0.45) {
      const k = easeOut(t / 0.45)
      d.x = B.from.x + (B.to.x - B.from.x) * k
      d.z = B.from.z + (B.to.z - B.from.z) * k
      if (Math.random() < 0.8) this.spray.emit(d.x, this.groundY(d.x, d.z) + 0.1, d.z, (Math.random() - 0.5) * 3, 1.5 + Math.random() * 2, (Math.random() - 0.5) * 3, 0.5, 0.14, 1)
    }
    if (t >= 0.3 && t - dt < 0.3) {
      // Tumble: off the sides onto the sand, rolling, giggling.
      for (const [c, side] of [[this.kaylee, 1], [this.nick, -1]] as const) {
        this.scene.attach(c.root)
        const ox = Math.cos(B.heading) * side * 1.4
        const oz = -Math.sin(B.heading) * side * 1.4
        c.root.userData.from = c.root.position.clone()
        const tx = B.to.x + ox
        const tz = B.to.z + oz
        c.root.userData.to = new Vector3(tx, this.groundY(tx, tz), tz)
      }
      sfx.thump()
      this.kaylee.react('wiggle')
    }
    if (t >= 0.3 && t < 2.4) {
      const k = clamp((t - 0.3) / 0.55, 0, 1)
      for (const c of [this.kaylee, this.nick]) {
        const a = c.root.userData.from as Vector3
        const b = c.root.userData.to as Vector3
        c.root.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + bellK(k) * 0.9, a.z + (b.z - a.z) * k)
        c.root.rotation.set(0, B.heading, 0)
        if (k >= 1 && c.pose !== 'lie') c.setPose('lie')
        if (k >= 1) c.root.rotation.z = Math.sin(t * 9) * 0.12
      }
    }
    if (t >= 1.6 && t - dt < 1.6) this.walkMan(B.to.x + Math.sin(B.heading) * 2.2, B.to.z + Math.cos(B.heading) * 2.2)
    if (t >= 2.4 && t - dt < 2.4) {
      // Back on.
      for (const c of [this.kaylee, this.nick]) {
        c.root.userData.from = c.root.position.clone()
        c.setPose('stand')
      }
    }
    if (t >= 2.4 && t < 2.9) {
      const k = clamp((t - 2.4) / 0.45, 0, 1)
      for (const [c, seat] of [[this.kaylee, this.ski.front], [this.nick, this.ski.back]] as const) {
        const a = c.root.userData.from as Vector3
        const b = seat.getWorldPosition(tmp3)
        c.root.position.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k + bellK(k) * 0.8, a.z + (b.z - a.z) * k)
        c.root.rotation.set(0, B.heading, 0)
      }
      if (k >= 1) this.seat()
    }
    if (t >= 2.9) {
      // The jet ski man pushes it back into the water and turns it to face the sea.
      const k = easeOut((t - 2.9) / 1.4)
      d.x = B.to.x + (B.back.x - B.to.x) * k
      d.z = B.to.z + (B.back.z - B.to.z) * k
      d.heading = B.heading + wrap(B.out - B.heading) * k
      const mx = d.x - Math.sin(d.heading) * 2.1
      const mz = d.z - Math.cos(d.heading) * 2.1
      this.man.root.position.set(mx, this.groundY(mx, mz), mz)
      this.man.root.rotation.y = d.heading
      if (t >= 4.3) {
        this.phase = 'ride'
        this.beachT = -1
        this.seat()
        const home = bay(3.5, -1.6)
        this.walkMan(home.x, home.z)
      }
    }
  }
  private manWalk: { from: Vector3; to: Vector3; t: number } | null = null
  private walkMan(x: number, z: number) {
    this.manWalk = { from: this.man.root.position.clone(), to: new Vector3(x, this.groundY(x, z), z), t: 0 }
  }

  // ---------------------------------------------------------------- the loop secret

  private closed(loop: Loop) {
    // Small wiggles don't count: a real loop she drove round.
    if (loop.area < 40 || loop.pts.length < 14) return
    this.loops.push(loop)
    this.counts.loops++
    if (loop.heart) this.counts.hearts++
    this.fill = loop
    this.fillT = 0
    this.fillFish = 0
    twinkle(loop.heart)
    this.kaylee.react('wiggle')
    this.nick.react('hop')
    if (this.round === 'ride') this.rideT += 20
  }
  private fillStep(dt: number) {
    const L = this.fill
    if (!L || this.fillT < 0) return
    this.fillT += dt
    const pink = L.heart
    // Sparkles up all along the loop's line first, then the fish jump inside it.
    if (this.fillT < 1.2) {
      for (let i = 0; i < 6; i++) {
        const p = L.pts[Math.floor(Math.random() * L.pts.length)]
        this.sparkle.emit(p.x, this.water(p.x, p.z) + 0.2, p.z, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 2.5, (Math.random() - 0.5) * 0.6, 1.2, 0.22, pink ? (Math.random() < 0.7 ? 3 : 0) : -1)
      }
    }
    const want = Math.min(12, 3 + Math.floor(L.area / 60))
    if (this.fillT > 0.5 && this.fillFish < want && Math.random() < dt * 6) {
      const p = inside(L)
      if (p && this.fish.jump(p.x, p.z)) this.fillFish++
    }
    if (this.fillT > 4) this.fillT = -1
  }

  // ---------------------------------------------------------------- the race

  private startRace(snap: boolean) {
    this.phase = 'countdown'
    this.countT = snap ? 3.6 : 3.2
    this.lastCount = 99
    this.leg = [0, 0]
    this.rivalWp = 0
    this.winner = null
    this.raceT = 0
    this.counts.races++
    const [a, b] = RACE.start
    this.d.place(a.x, a.z, SEAWARD)
    this.rival.place(b.x, b.z, SEAWARD)
    this.wake.clear()
    // The jet ski man climbs onto his jet ski.
    this.rivalSki.back.attach(this.man.root)
    this.man.place(0, -0.1 * this.man.height, 0.35, 0, 'sit')
    this.man.root.rotation.set(0, 0, 0)
    this.manWalk = null
    this.finger = null
  }
  /** Again (her tap on 🔁, or at once after a loss). */
  raceAgain() {
    if (this.round !== 'race') this.round = 'race'
    this.startRace(false)
  }
  /** How far along the course (0 at the start, 0.5 round the buoy, 1 home). */
  private progressOf(x: number, z: number, leg: number) {
    const D = Math.hypot(FAR_BUOY.x - RACE.start[0].x, FAR_BUOY.z - RACE.start[0].z)
    if (leg === 0) return 0.5 * clamp(1 - (Math.hypot(FAR_BUOY.x - x, FAR_BUOY.z - z) - RACE.round) / (D - RACE.round), 0, 1)
    const f = bay(0, RACE.finish.v)
    return 0.5 + 0.5 * clamp(1 - Math.hypot(f.x - x, f.z - z) / D, 0, 1)
  }
  private raceStep(dt: number) {
    if (this.phase === 'countdown') {
      this.countT -= dt
      const n = Math.ceil(this.countT - 0.6)
      if (n !== this.lastCount && n <= 3) {
        this.lastCount = n
        if (n >= 1) {
          this.events.count(n)
          beep(false)
        } else {
          this.events.count(0)
          beep(true)
          this.phase = 'racing'
          this.lastTouch = this.time
          window.setTimeout(() => this.events.count(-1), 900)
        }
      }
      return
    }
    if (this.phase !== 'racing' && this.phase !== 'raceEnd') {
      // Not racing: his jet ski just bobs where it's parked.
      if (this.manWalk) {
        const w = this.manWalk
        w.t = Math.min(1, w.t + dt / Math.max(0.4, w.from.distanceTo(w.to) / 3.2))
        this.man.root.position.lerpVectors(w.from, w.to, w.t)
        this.man.root.position.y = this.groundY(this.man.root.position.x, this.man.root.position.z) + Math.abs(Math.sin(w.t * 14)) * 0.08
        this.man.root.rotation.y = Math.atan2(w.to.x - w.from.x, w.to.z - w.from.z)
        if (w.t >= 1) {
          this.manWalk = null
          this.man.root.rotation.y = SEAWARD + 0.4
        }
      }
      return
    }
    this.raceT += dt
    const d = this.d
    const r = this.rival
    // Her legs: round the buoy (inside its circle, any side), then home between the flags.
    if (this.leg[0] === 0 && Math.hypot(d.x - FAR_BUOY.x, d.z - FAR_BUOY.z) < RACE.round) this.leg[0] = 1
    const home = (x: number, z: number) => {
      const b = toBay(x, z)
      return b.v < RACE.finish.v && b.u > RACE.finish.w - 4 && b.u < RACE.finish.e + 4
    }
    const pHer = this.progressOf(d.x, d.z, this.leg[0])
    const pHim = this.progressOf(r.x, r.z, this.leg[1])
    // His way: out wide round the buoy, then back to the flags (each waypoint counts once he's within 10 m of it).
    const wide = RACE.round + RACEK.wide
    const way = [bay(wide * 0.8, 118 - wide * 0.4), bay(wide * 0.2, 118 + wide), bay(-wide, 118 + wide * 0.2), bay(0, RACE.finish.v - 2)]
    while (this.rivalWp < way.length - 1 && Math.hypot(r.x - way[this.rivalWp].x, r.z - way[this.rivalWp].z) < 10) this.rivalWp++
    if (this.rivalWp >= 2) this.leg[1] = 1
    const target = way[this.rivalWp]
    if (this.phase === 'racing') {
      r.goto(target.x, target.z, true)
      // The rubber band: he eases off while he's ahead, catches up when she's well ahead (so it's close), and if she
      // stops altogether he still only wins by a nose.
      const gap = pHim - pHer
      r.cap = gap > 0.03 ? RACEK.ahead : gap < -0.1 ? RACEK.catchUp : 1
      if (pHer > 0.9 && gap < 0.02) r.cap = Math.min(r.cap, 0.85)
      if (gap > 0.12 && pHim > 0.85) r.cap = 0.35
    } else r.goto(bay(-11, 2.4).x, bay(-11, 2.4).z)
    r.step(dt)
    const rb = this.s.terrain.shoreAt(r.x, r.z)
    if (rb < 0.6) r.bounce(...this.shoreNormal(r.x, r.z), 0.2)
    if (this.phase === 'racing') {
      if (this.leg[0] === 1 && home(d.x, d.z)) this.finish('her')
      else if (this.leg[1] === 1 && home(r.x, r.z)) this.finish('him')
    } else {
      this.endT += dt
      if (this.winner === 'him' && this.endT > 2.6) this.startRace(false)
    }
    // His spray.
    const sp = clamp(Math.abs(r.speed) / HELM.top, 0, 1.3)
    if (sp > 0.25) {
      const sx = Math.sin(r.heading)
      const sz = Math.cos(r.heading)
      this.spray.emit(r.x + sx * STERN, 0.3, r.z + sz * STERN, -sx * (2 + sp * 3), 2.5 + sp * 4, -sz * (2 + sp * 3), 0.6, 0.15 + sp * 0.12)
    }
  }
  private shoreNormal(x: number, z: number): [number, number] {
    const T = this.s.terrain
    const gx = T.shoreAt(x + 0.5, z) - T.shoreAt(x - 0.5, z)
    const gz = T.shoreAt(x, z + 0.5) - T.shoreAt(x, z - 0.5)
    const l = Math.hypot(gx, gz) || 1
    return [gx / l, gz / l]
  }
  private finish(who: 'her' | 'him') {
    this.winner = who
    this.phase = 'raceEnd'
    this.endT = 0
    if (who === 'her') {
      this.counts.wins++
      this.ringBell()
      this.kaylee.react('wiggle')
      this.nick.react('hop')
      this.ji.react('hop')
      this.sparkle.burst(this.d.x, 1.5, this.d.z, 40, 3, 4, 0.3)
    } else {
      this.counts.losses++
      this.losses++
      this.ringBell()
      this.man.react('wave')
    }
    this.events.raceOver(who === 'her')
  }
  private ringBell() {
    this.bellSwing.v += 7
    this.counts.bells++
    ding()
  }

  // ---------------------------------------------------------------- the bay's life

  private life(dt: number, t: number) {
    const d = this.d
    this.fillStep(dt)
    // Swimmers squeal and wave as she zooms past.
    this.swimmers.forEach((s, i) => {
      const p = s.root.position
      s.update(dt, t, this.water(p.x, p.z), i * 1.7)
      this.swimCool[i] -= dt
      if (this.swimCool[i] <= 0 && Math.abs(d.speed) > 4 && Math.hypot(d.x - p.x, d.z - p.z) < 7) {
        this.swimCool[i] = 4
        s.squeal()
        squeal()
        this.counts.squeals++
      }
    })
    // Mommy: zoom past her at the water's edge and she gets soaked (then laughs).
    this.mommyCool -= dt
    const md = Math.hypot(d.x - MOMMY.x, d.z - MOMMY.z)
    if (this.mommyCool <= 0 && Math.abs(d.speed) > 4 && md < SILLY.splash && !d.airborne) {
      this.mommyCool = 4
      this.soakT = 0
      this.counts.soaked++
      const dx = (MOMMY.x - d.x) / (md || 1)
      const dz = (MOMMY.z - d.z) / (md || 1)
      for (let i = 0; i < 30; i++) this.spray.emit(d.x, 0.3, d.z, dx * (4 + Math.random() * 3) + (Math.random() - 0.5) * 2, 3 + Math.random() * 3, dz * (4 + Math.random() * 3) + (Math.random() - 0.5) * 2, 0.9, 0.22)
      splashBig(0.5)
    }
    if (this.soakT >= 0) {
      this.soakT += dt
      if (this.soakT > 0.5 && this.soakT - dt <= 0.5) this.ji.react('hop')
      if (this.soakT > 1.3 && this.soakT - dt <= 1.3) this.ji.react('hop')
      if (this.soakT > 2) this.soakT = -1
    }
    this.ji.lookAt(d.x, 1, d.z)
    this.ji.update(dt, t)
    this.man.update(dt, t)
    if (this.phase !== 'racing' && this.phase !== 'raceEnd' && this.phase !== 'countdown' && this.man.root.parent === this.scene) this.man.lookAt(d.x, 1, d.z)
    // Terns: wheeling; in the waves round they dive near her now and then.
    this.ternT -= dt
    if (this.ternT <= 0) {
      this.ternT = this.round === 'waves' ? 4 + Math.random() * 3 : 9 + Math.random() * 6
      const tn = this.terns[Math.floor(Math.random() * this.terns.length)]
      if (!tn.diving && Math.abs(d.speed) > 2) tn.diveAt(d.x + Math.sin(d.heading) * 10 + (Math.random() - 0.5) * 10, d.z + Math.cos(d.heading) * 10 + (Math.random() - 0.5) * 10)
    }
    for (const tn of this.terns) {
      tn.update(dt, t)
      if (tn.splash) {
        this.spray.burst(tn.splash.x, 0.2, tn.splash.z, 10, 1.5, 3, 0.16)
        sfx.splash()
      }
    }
    // Fish jump now and then near her.
    this.fishT -= dt
    if (this.fishT <= 0) {
      this.fishT = 5 + Math.random() * 6
      const a = d.heading + (Math.random() - 0.5) * 1.6
      const r = 6 + Math.random() * 8
      const x = d.x + Math.sin(a) * r
      const z = d.z + Math.cos(a) * r
      if (this.s.terrain.shoreAt(x, z) > 3) this.fish.jump(x, z)
    }
    this.fish.update(dt, (x, z) => this.water(x, z))
    for (const p of this.fish.plips) {
      this.spray.burst(p.x, 0.15, p.z, 6, 1, 1.8, 0.1)
      tone(1400, 700, 0.08, 0.03, 'sine')
    }
    // The banana boat round its loop out past the rope.
    this.bananaS += (dt * 7.5) / (Math.PI * (BANANA.ru + BANANA.rv))
    const at = (s: number) => bay(BANANA.u + Math.sin(s * Math.PI * 2) * BANANA.ru, BANANA.v + Math.cos(s * Math.PI * 2) * BANANA.rv)
    const bp = at(this.bananaS)
    const bn = at(this.bananaS + 0.004)
    const bb = at(this.bananaS - 0.035)
    const bb2 = at(this.bananaS - 0.03)
    const B = this.banana
    B.boat.position.set(bp.x, this.water(bp.x, bp.z), bp.z)
    B.boat.rotation.y = Math.atan2(bn.x - bp.x, bn.z - bp.z)
    B.banana.position.set(bb.x, this.water(bb.x, bb.z) + 0.15, bb.z)
    B.banana.rotation.y = Math.atan2(bb2.x - bb.x, bb2.z - bb.z) + Math.PI
    B.update(dt, t)
    if (Math.random() < 0.6) this.foam.emit(bp.x, 0.05, bp.z, 0, 0, 0, 1.6, 1.4)
    for (const p of B.splashes) {
      this.spray.burst(p.x, 0.2, p.z, 14, 2.2, 3.5, 0.2)
      sfx.splash()
    }
    // The bell, the big buoy, the umbrellas.
    const spring = (s: Spring, k: number, damp: number) => {
      s.v += (-s.x * k - s.v * damp) * dt
      s.x += s.v * dt
    }
    spring(this.bellSwing, 60, 3)
    this.s.bell.rotation.z = this.bellSwing.x * 0.12
    spring(this.buoyBob, 30, 2.5)
    const fb = this.s.farBuoy
    fb.position.y = this.water(fb.position.x, fb.position.z) - 0.1 + this.buoyBob.x * 0.25
    fb.rotation.z = Math.sin(t * 1.1) * 0.08 + this.buoyBob.x * 0.15
    for (const f of this.s.flags) {
      f.position.y = this.water(f.position.x, f.position.z) - 0.05
      f.rotation.z = Math.sin(t * 1.4 + f.position.x) * 0.1
    }
    this.s.umbrellas.forEach((u, i) => {
      this.umbrellaSpin[i] *= Math.exp(-dt * 0.8)
      u.rotation.y += this.umbrellaSpin[i] * dt
    })
    // Daddy's cap blowing off and back.
    if (this.capT >= 0) {
      this.capT += dt / 1.4
      const k = this.capT
      const f = this.nick.rig.face
      const rest = tmp2.set(0, f.headY + f.R * 0.72, -f.R * 0.05)
      this.cap.position.set(rest.x + Math.sin(k * 8) * bellK(k) * 0.4, rest.y + bellK(k) * 1.6, rest.z - bellK(k) * 0.7)
      this.cap.rotation.set(k * 14 * bellK(k), k * 6, 0)
      if (k > 0.85 && k - dt / 1.4 <= 0.85) this.nick.react('hop')
      if (k >= 1) {
        this.capT = -1
        this.cap.position.copy(rest)
        this.cap.rotation.set(0, 0, 0)
      }
    }
    // Dizzy Daddy: stars round his head, a wobble.
    if (this.dizzyT >= 0) {
      this.dizzyT += dt
      const hp = this.nick.root.getWorldPosition(tmp3)
      const a = this.dizzyT * 9
      if (Math.random() < 0.8) this.stars.emit(hp.x + Math.sin(a) * 0.5, hp.y + this.nick.height * 1.05, hp.z + Math.cos(a) * 0.5, Math.cos(a) * 0.6, 0.1, -Math.sin(a) * 0.6, 0.5, 0.12)
      this.nick.rig.head.rotation.z = Math.sin(this.dizzyT * 7) * 0.3 * (1 - this.dizzyT / 3)
      if (this.dizzyT > 3) {
        this.dizzyT = -1
        this.nick.rig.head.rotation.z = 0
      }
    }
    this.kaylee.update(dt, t)
    this.nick.update(dt, t)
    // Daddy's hands over hers on the handlebars (when nothing else is moving his arms).
    if (this.nick.root.parent === this.ski.back && this.nick.pose === 'sit') {
      const { armL, armR } = this.nick.rig
      armL.rotation.set(-1.25, 0, 0.35)
      armR.rotation.set(-1.25, 0, -0.35)
    }
    // The life jacket floating by the jet ski, waiting for her tap.
    if (this.phase === 'jacket') {
      const p = bay(-1.8, 2.2)
      this.jacketFloat.position.set(p.x, 1.3 + Math.sin(t * 2.4) * 0.12, p.z)
      this.jacketFloat.rotation.y = t * 0.9
      this.jacketFloat.scale.setScalar(1 + Math.sin(t * 5) * 0.06)
    } else if (this.phase === 'suit') {
      // It flies onto her.
      const k = clamp((this.time - this.jacketAt) / 0.45, 0, 1)
      const to = this.jacket.getWorldPosition(tmp3)
      this.jacketFloat.position.lerpVectors(this.jacketFrom, to, easeOut(k))
      this.jacketFloat.position.y += bellK(k) * 0.6
      this.jacketFloat.scale.setScalar(1 - 0.32 * k)
      if (k >= 1) {
        this.jacketFloat.visible = false
        this.jacket.visible = true
        click()
        this.kaylee.react('wiggle')
        this.phase = 'push'
        this.beachT = 0
        this.man.react('wave')
      }
    }
  }
  private jacketAt = 0
  private jacketFrom = new Vector3()

  /** Rounds move on with her play: the calm ride, then the waves, then the race. */
  private progress(dt: number) {
    if (this.phase !== 'ride') return
    if (this.round === 'ride') {
      if (this.finger?.steering || Math.abs(this.d.speed) > 1) this.rideT += dt
      if (this.rideT > SILLY.ride) this.setRound('waves')
    } else if (this.round === 'waves') {
      this.rideT += dt
      if (this.counts.jumps >= WAVES.jumps || this.rideT > 150) this.setRound('race')
    }
  }

  // ---------------------------------------------------------------- the jet ski's model

  private placeSki(dt: number) {
    const d = this.d
    const sk = this.ski
    const k = (s: Spring, goal: number, stiff: number, damp: number) => {
      s.v += ((goal - s.x) * stiff - s.v * damp) * dt
      s.x += s.v * dt
    }
    const surf = this.phase === 'beached' ? this.groundY(d.x, d.z) : this.water(d.x, d.z)
    const y = surf + d.y
    sk.root.position.set(d.x, y, d.z)
    sk.root.rotation.y = d.heading
    // Pitch: the water's slope under it, the nose lifting as it speeds up, nose up in the air then down.
    const hx = Math.sin(d.heading)
    const hz = Math.cos(d.heading)
    const front = this.water(d.x + hx * 1.2, d.z + hz * 1.2)
    const back = this.water(d.x - hx * 1.2, d.z - hz * 1.2)
    let goal = -Math.atan2(front - back, 2.4)
    goal -= clamp(this.lastFwd, 0, 10) * HELM.lift * 0.12 + clamp(d.speed / HELM.top, 0, 1) * HELM.lift * 0.5
    if (d.airborne) goal = -clamp(d.vy * 0.06, -0.4, 0.4)
    if (this.phase === 'beached' && this.beachT < 2.9) goal = -0.12
    if (dt > 0) {
      k(this.pitch, goal, 60, 9)
      k(this.roll, d.roll, 50, 8)
    }
    sk.tilt.rotation.set(this.pitch.x, 0, this.roll.x)
    // A spin in the air on the biggest jumps.
    if (this.spinT >= 0) {
      this.spinT += dt / 0.75
      sk.tilt.rotation.y = this.spinDir * Math.PI * 2 * easeOut(this.spinT)
      if (this.spinT >= 1 || !d.airborne) {
        this.spinT = -1
        sk.tilt.rotation.y = 0
      }
    }
    this.squash += (1 - this.squash) * ease(dt, 8)
    sk.body.scale.set(1 + (1 - this.squash) * 0.4, this.squash, 1)
    this.shadow.position.set(d.x, surf + 0.03, d.z)
    this.shadow.rotation.z = -d.heading
    const air = clamp(d.y / 2, 0, 1)
    this.shadow.scale.set(0.9 * (1 - air * 0.4), 2.2 * (1 - air * 0.4), 1)
    this.shadow.visible = this.phase !== 'beached'
    // His jet ski.
    const r = this.rival
    const rs = this.rivalSki
    const ry = this.water(r.x, r.z)
    rs.root.position.set(r.x, ry, r.z)
    rs.root.rotation.y = r.heading
    rs.tilt.rotation.set(-clamp(r.speed / HELM.top, 0, 1) * HELM.lift * 0.5 + Math.sin(this.time * 1.7) * 0.02, 0, r.roll)
  }

  // ---------------------------------------------------------------- the rope

  private buildRope() {
    const add = (u: number, v: number, nx: number, nz: number, side: number, s: number) => {
      const p = bay(u, v)
      this.floats.push({ x: p.x, z: p.z, nx, nz, side, s })
    }
    // Built for the largest square; placeRope moves each float to the current square's edge.
    for (let v = 0; v <= 140; v += 2.4) {
      add(0, v, -0.951, 0.309, 0, v)
      add(0, v, 0.951, -0.309, 1, v)
    }
    for (let u = -44; u <= 48; u += 2.4) add(u, 0, 0.309, 0.951, 2, u)
    // Two instanced shapes (orange and white, every other float) with their outlines: four draw calls for the rope.
    const geo = this.bag.add(bake(new SphereGeometry(0.28, 10, 7), '#ffffff', { scale: [1, 0.8, 1] }))
    const hull = this.bag.add(hullGeometry(geo))
    for (const c of ['#FF8A2E', '#FFFFFF']) {
      const n = Math.ceil(this.floats.length / 2)
      const mesh = this.bag.add(new InstancedMesh(geo, toon(c), n))
      const line = this.bag.add(new InstancedMesh(hull, instancedOutlineMaterial(2), n))
      for (const m of [mesh, line]) {
        m.instanceMatrix.setUsage(DynamicDrawUsage)
        m.frustumCulled = false
        this.floatMesh.add(m)
      }
      this.floatSets.push([mesh, line])
    }
  }
  private placeRope(t: number) {
    const r = this.ropeNow
    const st = this.stretch
    const shown = [0, 0]
    this.floats.forEach((f, i) => {
      let u: number
      let v: number
      if (f.side === 0) {
        u = r.w
        v = f.s
      } else if (f.side === 1) {
        u = r.e
        v = f.s
      } else {
        u = f.s
        v = r.out
      }
      const inSquare = f.side === 2 ? u >= r.w - 0.5 && u <= r.e + 0.5 : v <= r.out + 0.5
      const p = bay(u, v)
      // The rope stretches outward where she pushes into it, like a rubber band.
      let push = 0
      if (st.k > 0 && st.side === f.side) push = st.k * Math.exp(-(((f.side === 2 ? u : v) - st.s) ** 2) / 30)
      const x = p.x + (f.side === 0 ? -0.951 : f.side === 1 ? 0.951 : 0.309) * push
      const z = p.z + (f.side === 0 ? 0.309 : f.side === 1 ? -0.309 : 0.951) * push
      const shore = this.s.terrain.shoreAt(x, z)
      if (!inSquare || shore <= 0.8) return
      const k = i % 2
      fm.makeTranslation(x, this.water(x, z) - 0.05 + Math.sin(t * 2 + i) * 0.03, z)
      for (const m of this.floatSets[k]) m.setMatrixAt(shown[k], fm)
      shown[k]++
    })
    this.floatSets.forEach(([mesh, line], k) => {
      for (const m of [mesh, line]) {
        m.count = shown[k]
        m.instanceMatrix.needsUpdate = true
      }
    })
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const d = this.d
    const tall = this.tall
    if (this.phase === 'jacket' || this.phase === 'suit' || this.phase === 'push') {
      // Close on Kaylee and the jacket, from the sea side and a little to the right: the hut and the beach behind.
      const yaw = d.heading * DEG + 32
      return { center: new Vector3(d.x - Math.sin(d.heading) * 0.6, 1.25, d.z - Math.cos(d.heading) * 0.6), half: tall ? new Vector3(2.4, 1.6, 2.4) : new Vector3(3.6, 1.4, 2.2), yaw, pitch: 15, minDist: 4, maxDist: 30 }
    }
    if (this.phase === 'beached') {
      // From the sea side (the jet ski faces up the beach: in front of it is the hill).
      const yaw = SEAWARD * DEG + 28
      return { center: new Vector3(d.x, 1.0, d.z), half: tall ? new Vector3(4, 2, 4) : new Vector3(6, 2, 3.5), yaw, pitch: 24, minDist: 6, maxDist: 40 }
    }
    const chase = (this.camYaw + Math.PI) * DEG
    const sp = clamp(Math.abs(d.speed) / Math.max(0.1, HELM.top), 0, 1.3)
    const sx = Math.sin(this.camYaw)
    const sz = Math.cos(this.camYaw)
    const ahead = 2 + sp * HELM.ahead
    const half = tall ? new Vector3(4.4, 2, 7.6) : new Vector3(8, 2, 5.2)
    half.multiplyScalar(1 + 0.15 * sp + (this.round === 'race' ? 0.15 : 0))
    if (this.phase === 'countdown') half.set(tall ? 5.5 : 9, 2, tall ? 6 : 4.5)
    if (this.phase === 'raceEnd' && this.winner === 'her' && this.endT < 4) {
      return { center: new Vector3(d.x, 1.3, d.z), half: tall ? new Vector3(3, 2, 3) : new Vector3(4.5, 1.8, 2.6), yaw: SEAWARD * DEG + 30, pitch: 14, minDist: 5, maxDist: 40 }
    }
    return {
      center: new Vector3(d.x + sx * ahead, 0.9 + d.y * 0.6, d.z + sz * ahead),
      half,
      // (A little to one side and from higher up, so Kaylee in front shows past Daddy behind her.)
      yaw: chase + HELM.side,
      pitch: HELM.pitch + d.y * 3,
      follow: true,
      minDist: 7,
      maxDist: 90,
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
  private waterPoint(x: number, y: number, out: Vector3) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.plane, out)
  }
  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // On a tap target, wait: a tap pokes it, a held or dragged finger steers.
    this.finger = { x, y, steering: false, t: this.time, id }
    if (!id) this.startSteer()
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (!f.steering && Math.hypot(x - downX, y - downY) > 12) this.startSteer()
  }
  pointerUp() {
    if (this.finger?.steering) this.d.release()
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) this.counts.pokes++
    if (this.phase === 'jacket') {
      // Life jacket first: any tap near it (or on it) puts it on.
      if (id === 'jacket' || !id || id === 'kaylee') {
        this.jacketAt = this.time
        this.jacketFrom.copy(this.jacketFloat.position)
        this.phase = 'suit'
        click()
        return
      }
    }
    if (id === 'kaylee') {
      toot()
      this.kaylee.react('wiggle')
      return
    }
    if (id === 'family:nick') {
      if (this.capT < 0) {
        this.capT = 0
        hiss(0.4, 0.08, 'bandpass', 1500, 600)
      }
      return
    }
    if (id === 'family:ji') {
      this.ji.react('wave')
      return
    }
    if (id === 'man') {
      this.man.react(this.man.root.parent === this.scene ? 'hop' : 'wave')
      toot()
      return
    }
    if (id === 'bell') return this.ringBell()
    if (id === 'buoy') return this.pokeBuoy()
    if (id === 'banana') {
      if (this.banana.tip()) this.counts.tips++
      squeal()
      return
    }
    if (id?.startsWith('swimmer:')) {
      const s = this.swimmers[+id.slice(8)]
      s.hop()
      squeal()
      const p = s.root.position
      this.spray.burst(p.x, 0.3, p.z, 12, 1.6, 2.5, 0.16)
      return
    }
    if (id?.startsWith('tern:')) {
      const d = this.d
      this.terns[+id.slice(5)].diveAt(d.x + Math.sin(d.heading) * 7, d.z + Math.cos(d.heading) * 7)
      tone(1800, 2400, 0.1, 0.04, 'triangle')
      return
    }
    if (id?.startsWith('umbrella:')) {
      this.umbrellaSpin[+id.slice(9)] += 9
      sfx.fwip()
      return
    }
    // A quick tap on the water: drive there and stop.
    if (!id && (this.phase === 'ride' || this.phase === 'racing')) {
      const p = this.waterPoint(x, y, tmp)
      if (p) this.d.goto(p.x, p.z)
    }
  }
  private pokeBuoy() {
    this.buoyBob.v += 4
    this.counts.bonks++
    bonk()
  }

  /** After a while with no finger: a pressing finger on the water ahead of her. */
  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = !this.finger && t - this.lastTouch > HINT_S && (this.phase === 'ride' || this.phase === 'jacket')
    const want = idle ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!idle) return
    const d = this.d
    const at = this.phase === 'jacket' ? this.jacketFloat.position : tmp.set(d.x + Math.sin(d.heading) * 12, 0, d.z + Math.cos(d.heading) * 12)
    const s = this.toScreen(at)
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | null, height: number, scale = 1.6, lift = 0) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (who && who.visible !== false) {
        const c = this.toScreen(who.localToWorld(tmp.set(0, lift + height * 0.5, 0)))
        const top = this.toScreen(who.localToWorld(tmp2.set(0, lift + height, 0)))
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
    const cam = this.rig.camera.position
    const close = (o: Object3D, dist: number) => (o.getWorldPosition(tmp3).distanceTo(cam) < dist ? o : null)
    const jacket = this.phase === 'jacket'
    for (const [id, el] of this.anchorEls) {
      if (id === 'jacket') place(el, jacket ? this.jacketFloat : null, 0.5, 2.4, -0.25)
      else if (id === 'kaylee') place(el, jacket ? null : this.kaylee.root, this.kaylee.height, 0.9)
      else if (id === 'family:nick') place(el, jacket ? null : this.nick.root, this.nick.height * 0.7, 0.9, this.nick.height * 0.3)
      else if (id === 'family:ji') place(el, close(this.ji.root, 45), this.ji.height, 1)
      else if (id === 'man') place(el, close(this.man.root, 45), this.man.height, 1)
      else if (id === 'bell') place(el, close(this.s.bell, 40), 0.4, 3, -0.5)
      else if (id === 'buoy') place(el, close(this.s.farBuoy, 90), 2.5, 1.4)
      else if (id === 'banana') place(el, close(this.banana.banana, 90), 1.2, 2.2)
      else if (id.startsWith('swimmer:')) place(el, close(this.swimmers[+id.slice(8)].root, 40), 0.8, 2)
      else if (id.startsWith('tern:')) place(el, close(this.terns[+id.slice(5)].root, 50), 0.4, 3)
      else if (id.startsWith('umbrella:')) place(el, close(this.s.umbrellas[+id.slice(9)], 40), 0.6, 2.4, -0.3)
      el.style.zIndex = id === 'jacket' || id === 'kaylee' || id === 'family:nick' ? '3' : id.startsWith('umbrella:') ? '1' : '2'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const d = this.d
    const sc = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const b = toBay(d.x, d.z)
    return {
      section: 'jetski',
      round: this.round,
      phase: this.phase,
      x: +d.x.toFixed(2),
      z: +d.z.toFixed(2),
      u: +b.u.toFixed(1),
      v: +b.v.toFixed(1),
      heading: Math.round(wrap(d.heading) * DEG),
      speed: +d.speed.toFixed(2),
      turning: +d.yawRate.toFixed(2),
      spun: +(this.spinSum / (Math.PI * 2)).toFixed(2),
      air: +d.y.toFixed(2),
      waves: +this.s.lagoon.waves.height.toFixed(2),
      jacket: this.jacket.visible,
      leg: this.leg[0],
      rivalLeg: this.leg[1],
      rival: (({ u, v }) => ({ u: +u.toFixed(1), v: +v.toFixed(1), speed: +this.rival.speed.toFixed(1), cap: this.rival.cap }))(toBay(this.rival.x, this.rival.z)),
      winner: this.winner,
      ski: sc(tmp2.set(d.x, 0.6, d.z)),
      buoy: sc(tmp2.set(FAR_BUOY.x, 0.5, FAR_BUOY.z)),
      hut: sc(tmp2.set(HUT.x, 1, HUT.z)),
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

/** A point inside a loop, at random (for the jumping fish). */
function inside(L: Loop) {
  let x0 = Infinity
  let x1 = -Infinity
  let z0 = Infinity
  let z1 = -Infinity
  for (const p of L.pts) {
    x0 = Math.min(x0, p.x)
    x1 = Math.max(x1, p.x)
    z0 = Math.min(z0, p.z)
    z1 = Math.max(z1, p.z)
  }
  for (let k = 0; k < 20; k++) {
    const x = x0 + Math.random() * (x1 - x0)
    const z = z0 + Math.random() * (z1 - z0)
    let inn = false
    for (let i = 0, j = L.pts.length - 1; i < L.pts.length; j = i++) {
      const a = L.pts[i]
      const b = L.pts[j]
      if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inn = !inn
    }
    if (inn) return { x, z }
  }
  return null
}

function capMesh(bag: Bag, R: number) {
  return solid(merge([P.sphere(R * 0.62, PAL.hotpink, { scale: [1, 0.55, 1] }, 14), P.cyl(R * 0.5, R * 0.5, R * 0.06, PAL.hotpink, { at: [0, -R * 0.08, R * 0.5], scale: [1, 1, 0.9] }, 14)]), bag, 2)
}
