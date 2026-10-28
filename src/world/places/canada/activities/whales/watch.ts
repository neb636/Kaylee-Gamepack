// Whale Watch (plan: planning/around-the-world/canada.html): Tofino, on the Pacific side of Canada, in summer. Maple has
// never seen a whale; Kaylee steers the little boat out of the harbour to find the otters, the whales and the orcas.
// The story opens at the dock: Maple (on the chibi rig, maple.ts) waves from the wheel and says so, then the boat is
// Kaylee's. Sparkle gives the few instructions (events.say, WhaleWatch.tsx speaks them); Maple and the otters react in
// their own voices (lines.ts, L.whales). Every animal she pokes or finds goes into Maple's book (book/met.ts).
//
// The toy (core verb): steer the boat. The shared drive control (engine3d/drive.ts, the Thai bay's and the Nan
// Pajero's) on the sea, two ways to try side by side (`?steer=`):
//   finger  her finger holds the water where the boat should go and it follows (far ahead = fast, to one side = it
//           keeps turning that way, behind = a U-turn); a tap on the water drives it there and stops.
//   wheel   the Mountain Bike's finger wheel (engine3d/wheel.ts): a finger down anywhere goes, pushing it left or right
//           turns, letting go coasts.
// Either way it bounces on the waves: calm in the harbour, bigger rollers out at sea; going fast it hops off the crests
// and splashes down. The verb deepens three ways (sea.ts has where everything is): the otters in the kelp (a sleepy
// otter has drifted off from her friends: go gently close and she grabs the boat's rope, tow her home slowly and they
// hold hands; zoom in fast and they all dive and pop up with seaweed on their heads, glaring), follow the spouts (a
// spout shoots up: steer there and a whale comes up, blows, shows its tail and dives: two grey whales, then a humpback,
// then a humpback that jumps right out; sit right on the spout and the whale sneezes on the boat), then the orca family
// (they swim alongside; go fast and they jump in the wake, turn and the baby turns too; at the end they all jump
// together). The side verb: tap the yellow microphone and the boat stops, the microphone goes down on its cable and the
// camera dips under the waves to hear the humpback's song and the orcas' calls.
//
// Ambient life: gulls wheeling, clouds drifting, the seals napping, the raven tipping its head. The sea is the shared
// engine3d/water.ts. Built for engine3d/View3D.tsx; nothing here comes from Thailand. The
// steering and the bounce are feel-lab knobs (?feel=1), with a graph of her finger against what the boat does.
import { Color, Fog, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, RingGeometry, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, sounds, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { Driver, type Feel } from '../../../../engine3d/drive'
import { blobShadow } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import { FingerWheel } from '../../../../engine3d/wheel'
import { Boat, BOAT_LEN } from './boat'
import { buildCoast, DEEP, SKY, type Coast } from './coast'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { Clouds, Eagle, Gulls, HarbourSeal, Orca, Otter, Puffin, Raven, SeaLion, SeaStars, Surfer, Whale, type OrcaWho } from './critters'
import { DOCK, DRIFTS, HARBOUR_END_Z, keepOff, KELP, LIGHTHOUSE, open, RAFT, SEA, SPOUT_BOX, STARTS, SURF } from './sea'
import type { SteerMode, WhaleSection } from './sections'

const FILE = 'src/world/places/canada/activities/whales/watch.ts'
/** The boat on the drive control (both ways to steer). */
const HELM = knobs('whaleHelm', 'Steering the boat', FILE, {
  top: { value: 7.5, min: 3, max: 16, step: 0.25, label: 'Top speed', unit: 'm/s', note: 'cruising speed with her finger far ahead (or the wheel held)' },
  accel: { value: 4, min: 1, max: 12, step: 0.25, label: 'Speeding up', unit: 'm/s²', note: 'how fast it gets going (slowing down is a little quicker)' },
  coast: { value: 0.45, min: 0.05, max: 2, step: 0.05, label: 'Coasting drag', unit: '/s', note: 'how fast it slows down when she lets go (lower = glides further)' },
  turn: { value: 1.3, min: 0.4, max: 3, step: 0.05, label: 'Turn rate', unit: 'rad/s', note: 'how fast it swings round at cruising speed (slow, it turns half as fast)' },
  grip: { value: 2.4, min: 0.5, max: 10, step: 0.1, label: 'Grip', note: 'how quickly a sideways slide dies out (low = it skids round turns)' },
  near: { value: 3, min: 1, max: 8, step: 0.25, label: 'Crawl when this close', unit: 'm', note: 'her finger this close to the boat = a crawl' },
  far: { value: 22, min: 8, max: 45, step: 0.5, label: 'Full speed from', unit: 'm', note: 'her finger this far ahead = full speed' },
  dead: { value: 0.18, min: 0, max: 0.5, step: 0.01, label: 'Straight-ahead zone', unit: 'rad', note: 'a finger this close to straight ahead goes straight' },
  lean: { value: 0.15, min: 0, max: 0.5, step: 0.01, label: 'Lean into turns', unit: 'rad', note: 'how far it tips into a turn at full speed' },
  camera: { value: 0.35, min: 0, max: 1, step: 0.05, label: 'Camera turns with it', note: '0 = slow and steady, 1 = right behind the boat all the time' },
})
/** The finger wheel (?steer=wheel): Dad's numbers from the Nan drive and the bike as the start. */
const WHEEL = knobs('whaleWheel', 'The wheel (?steer=wheel)', FILE, {
  reach: { value: 1.2, min: 0.4, max: 2.5, step: 0.05, label: 'Wheel size', unit: '×', note: 'how far her finger moves for a full push (smaller = touchier)' },
  dead: { value: 0.15, min: 0, max: 0.4, step: 0.01, label: 'Dead middle', note: 'share of the wheel near the middle that counts as straight' },
  curve: { value: 1.3, min: 1, max: 3, step: 0.05, label: 'Gentle small pushes', note: '1 = even all the way; higher = a small push barely steers' },
  ease: { value: 0.08, min: 0, max: 0.6, step: 0.01, label: 'Smoothing', unit: 's', note: 'how long a quick flick takes to count in full (0 = none)' },
  lock: { value: 0.9, min: 0.2, max: 1.6, step: 0.05, label: 'Full push turns', unit: 'rad', note: 'how far off the bow a full push aims the boat (more = tighter turns)' },
})
/** Bouncing on the waves. */
const BOUNCE = knobs('whaleBounce', 'The bounce', FILE, {
  waves: { value: 1, min: 0, max: 3, step: 0.05, label: 'Waves', unit: '×', note: 'how big the waves are out at sea (the harbour is always calm)' },
  len: { value: 7, min: 2, max: 20, step: 0.5, label: 'Between crests', unit: 'm', note: 'how far apart the waves are: shorter = bumpier at speed' },
  hopFrom: { value: 0.55, min: 0, max: 1, step: 0.05, label: 'Hops from', note: 'share of top speed above which a crest throws it in the air' },
  hop: { value: 3.2, min: 0, max: 8, step: 0.1, label: 'Hop', unit: 'm/s', note: 'how hard a crest throws it up at full speed' },
  rock: { value: 1, min: 0, max: 3, step: 0.05, label: 'Rocking', unit: '×', note: 'how much it pitches and rolls with the waves' },
  spring: { value: 40, min: 8, max: 120, step: 1, label: 'Springiness', note: 'how quickly the rocking springs back (lower = floatier, wobblier)' },
  squash: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Squash on landing', unit: '×', note: 'how much the tubes squash when it splashes down' },
})
/** Finding the animals. */
const FIND = knobs('whaleFind', 'Finding the animals', FILE, {
  gentle: { value: 3.2, min: 1, max: 8, step: 0.1, label: 'Gently = below', unit: 'm/s', note: 'the otters wave and the sleepy one grabs the rope when the boat is slower than this' },
  fast: { value: 5.6, min: 2, max: 14, step: 0.1, label: 'Too fast = above', unit: 'm/s', note: 'faster than this near the otters and they dive (and pop up with seaweed on their heads)' },
  spout: { value: 12, min: 5, max: 30, step: 0.5, label: 'Spout reached at', unit: 'm', note: 'this close to a spout and the whale comes up' },
  spoutMax: { value: 22, min: 8, max: 40, step: 0.5, label: 'Easier after a while', unit: 'm', note: 'how close is close enough after 15 s of looking' },
  sneeze: { value: 5, min: 0, max: 12, step: 0.25, label: 'Sneezed on within', unit: 'm', note: 'the boat this close to the whale\'s blowhole when it blows: Maple gets soaked' },
  tow: { value: 0.55, min: 0.2, max: 1, step: 0.05, label: 'Towing speed', note: 'share of top speed the boat keeps to while it tows the sleepy otter home' },
  jumpAt: { value: 0.6, min: 0, max: 1.2, step: 0.05, label: 'Orcas jump at', note: 'share of top speed at which the orcas start jumping in the wake' },
  jumps: { value: 8, min: 2, max: 20, step: 1, label: 'Jumps before the finale', note: 'orca jumps before the whole family jumps together' },
})

export interface WhaleStart {
  section: WhaleSection
  steer: SteerMode
  found: number
}
export interface WhaleEvents {
  /** She reached the next part (the address bar follows). */
  section(s: WhaleSection): void
  /** The orca family's big jump. */
  done(): void
  /** Someone says something (Sparkle's hints, Maple's and the otters' reactions). */
  say(line: Line): void
  /** The parts she's finished (the otters home, the four whales, the orca family), for the stars in the top bar. */
  progress(done: number): void
}

const ORCAS: OrcaWho[] = ['grandma', 'mama', 'dad', 'baby']
/** Where each orca swims, in the boat's frame: meters to its left (- = right) and ahead. */
const FORMATION: Record<OrcaWho, { s: number; f: number }> = {
  grandma: { s: 7, f: 4 },
  mama: { s: 10.5, f: -2 },
  dad: { s: -8, f: 1 },
  baby: { s: 5, f: -3.5 },
}
const LIONS = 3
export const WHALE_ANCHORS: AnchorInfo[] = [
  { id: 'boat', label: "Maple's boat", kind: 'thing' },
  { id: 'mic', label: 'The underwater microphone', kind: 'thing' },
  { id: 'otters', label: 'The sea otters', kind: 'thing' },
  { id: 'drifter', label: 'The sleepy otter', kind: 'thing' },
  { id: 'whale', label: 'The whale', kind: 'thing' },
  ...ORCAS.map((w) => ({ id: `orca:${w}`, label: w === 'baby' ? 'The baby orca' : w === 'dad' ? 'The daddy orca' : w === 'mama' ? 'The mama orca' : 'The grandma orca', kind: 'thing' as const })),
  ...Array.from({ length: LIONS }, (_, i) => ({ id: `lion:${i}`, label: 'A sea lion', kind: 'thing' as const })),
  { id: 'eagle', label: 'The bald eagle', kind: 'thing' },
  { id: 'seal:0', label: 'A harbour seal', kind: 'thing' },
  { id: 'seal:1', label: 'A harbour seal', kind: 'thing' },
  { id: 'raven', label: 'The raven', kind: 'thing' },
  { id: 'puffin', label: 'The puffin', kind: 'thing' },
  { id: 'stars', label: 'The sea stars', kind: 'thing' },
  { id: 'surfer', label: 'The surfer', kind: 'thing' },
  { id: 'lighthouse', label: 'The lighthouse', kind: 'thing' },
]

const ORDER: WhaleSection[] = ['story', 'harbour', 'otters', 'spouts', 'orcas']
const DEG = 180 / Math.PI
const HINT_S = 8
/** Listening: how long the microphone stays down by itself. */
const LISTEN_S = 16
/** Sparkle's spoken hint: after this long with nothing new (and at most this often). */
const STUCK_S = 12
const HINT_EVERY_S = 22

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const horn = () => [0, 0.42].forEach((d) => [330, 415].forEach((f) => tone(f, f, 0.32, 0.05, 'triangle', d)))
const putt = (k: number) => tone(70 + k * 50, 52, 0.06, 0.035, 'square')
const thunk = () => {
  tone(120, 60, 0.18, 0.12)
  noise(0.25, 0.1, 'lowpass', 900, 250)
}
const blow = () => {
  noise(0.9, 0.16, 'bandpass', 700, 260, 0, 0.6)
  noise(0.6, 0.06, 'highpass', 2000, 1200, 0.05)
}
const achoo = () => {
  tone(520, 760, 0.25, 0.05, 'triangle')
  noise(0.35, 0.22, 'bandpass', 1800, 600, 0.3, 0.7)
}
const squeak = () => [0, 0.12].forEach((d) => tone(1700, 2300, 0.08, 0.05, 'sine', d))
const click = () => noise(0.03, 0.18, 'highpass', 3000, 3000)
const bark = () => [0, 0.2, 0.4].forEach((d) => {
  tone(260, 180, 0.12, 0.08, 'sawtooth', d)
  noise(0.1, 0.06, 'bandpass', 700, 500, d)
})
const screech = () => {
  tone(2400, 1700, 0.5, 0.04, 'sawtooth')
  tone(2600, 2100, 0.3, 0.03, 'sine', 0.5)
}
const foghorn = () => {
  tone(110, 108, 1.4, 0.12, 'sawtooth')
  tone(165, 162, 1.4, 0.05, 'triangle')
}
const twinkle = () => [0, 0.08, 0.16].forEach((d, i) => tone(1500 + i * 400, 1700 + i * 400, 0.1, 0.04, 'sine', d))
const growl = () => noise(0.6, 0.1, 'lowpass', 400, 200)
const caw = () => {
  tone(520, 380, 0.22, 0.06, 'sawtooth')
  noise(0.2, 0.05, 'bandpass', 1200, 700)
}
const grunt = () => {
  tone(150, 110, 0.35, 0.09, 'sawtooth')
  noise(0.3, 0.05, 'lowpass', 500, 250)
}
const bonk = () => {
  tone(210, 140, 0.2, 0.1, 'sine')
  noise(0.25, 0.08, 'lowpass', 700, 250)
}
/** The humpback's song: long, slow swoops up and down. */
function whaleSong() {
  const notes: [number, number, number][] = [
    [180, 420, 1.1],
    [420, 300, 0.9],
    [300, 520, 0.8],
    [520, 160, 1.4],
  ]
  let d = 0
  for (const [a, b, len] of notes) {
    tone(a, b, len, 0.05, 'sine', d)
    tone(a * 2, b * 2, len, 0.012, 'triangle', d)
    d += len * 0.9
  }
}
/** The orcas' calls: a whistle and a burst of clicks. */
function orcaCall(baby = false) {
  const f = baby ? 1.5 : 1
  tone(1500 * f, 2600 * f, 0.22, 0.04, 'sine')
  tone(2600 * f, 1900 * f, 0.18, 0.035, 'sine', 0.22)
  for (let i = 0; i < 5; i++) noise(0.02, 0.1, 'highpass', 3500, 3500, 0.5 + i * 0.05)
}

interface Spring {
  x: number
  v: number
}
type DriftState = 'drift' | 'towed' | 'home'
interface Drifter {
  o: Otter
  x: number
  z: number
  state: DriftState
  /** Out far enough from the raft to be fetched (the second one floats off first, once the first is home). */
  away: boolean
}
interface OrcaRide {
  o: Orca
  x: number
  z: number
  h: number
  phase: number
}

export class WhaleWatch implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private coast: Coast
  private water: Water
  private fog: Fog
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private wheelEl: HTMLElement | null = null
  private steerHintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: WhaleSection
  private mode: SteerMode

  // ---- The boat.
  private d: Driver
  private feel: Feel
  private boat: Boat
  private shadow: Mesh
  private roll: Spring = { x: 0, v: 0 }
  private pitch: Spring = { x: 0, v: 0 }
  private squash = 1
  private crest = 0
  private camYaw: number
  private bumpCool = 0
  private puttT = 0
  private travel = 0

  // ---- Her finger.
  private finger: { x: number; y: number; steering: boolean; t: number; id?: string } | null = null
  private wheel = new FingerWheel()
  private marker: Mesh
  private aimAhead = 0
  private aimTurn = 0

  // ---- Listening under the water.
  private listening = false
  private listenT = 0
  private mic = 0
  private below = false
  private songT = 0
  private callT = 1.5

  // ---- The otters.
  private raft: Otter[] = []
  private drifters: Drifter[] = []
  private ottersT = 0
  private raftCool = 0
  private homed = 0

  // ---- The whales.
  private grey: Whale
  private hump: Whale
  private whale: Whale | null = null
  private found: number
  private spot: { x: number; z: number } | null = null
  private spoutT = 0
  private lookT = 0
  private nextSpotT = 0

  // ---- The orcas.
  private orcas: OrcaRide[] = []
  private orcaIn = false
  private jumps = 0
  private copies = 0
  private jumpCool = 2
  private copyCool = 0
  private doneT = -1

  // ---- Everyone else.
  private lions: SeaLion[] = []
  private eagle: Eagle
  private puffin: Puffin
  private stars: SeaStars
  private surfer: Surfer
  private seals: HarbourSeal[] = []
  private raven: Raven
  private gulls: Gulls
  private clouds: Clouds
  private surfT = 0
  private beamSpin = 0
  private hornN = 0

  private foam: Particles
  private spray: Particles
  private mist: Particles
  private sparkle: Particles
  private bubbles: Particles

  private lastTouch = 0
  /** The story at the dock: Maple's little show (seconds since it began). */
  private storyT = 0
  /** Talk: when something last moved the story on, when Sparkle last hinted, and lines already said once. */
  private lastProgress = 0
  private lastHint = -99
  private hintsHere = 0
  private said = new Set<string>()
  private talkCool = 0
  private bumpTalkT = -99
  private counts = { steers: 0, taps: 0, pokes: 0, hops: 0, bumps: 0, tows: 0, dives: 0, spouts: 0, sneezes: 0, jumps: 0, copies: 0, listens: 0, horns: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: WhaleStart,
    private events: WhaleEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    this.fog = new Fog(SKY, 140, 700)
    scene.fog = this.fog
    applyBands()
    this.rig.fov = 50
    this.rig.lag = 0.35
    this.rig.camera.far = 1500
    this.section = start.section === 'listen' ? 'orcas' : start.section
    this.mode = start.steer
    this.found = start.section === 'spouts' ? start.found : start.section === 'orcas' || start.section === 'listen' ? 4 : 0
    this.lastTouch = 0

    // ---- The coast, the sea.
    this.coast = buildCoast(bag)
    scene.add(this.coast.land, this.coast.under)
    this.water = new Water({ size: 1600, deep: '#3E9DB4', shallow: '#62B9C9', haze: SKY, hazeNear: 130, hazeFar: 650 }, bag)
    scene.add(this.water.mesh)

    // ---- The boat and Maple.
    this.feel = { top: 0, boost: 1.5, accel: 0, coast: 0, turn: 0, grip: 0, near: 0, far: 0, dead: 0, lean: 0 }
    this.readFeel()
    this.d = new Driver(this.feel)
    const s0 = STARTS[start.section]
    this.d.place(s0.x, s0.z, s0.h)
    this.camYaw = s0.h
    this.boat = new Boat(bag)
    scene.add(this.boat.root)
    this.shadow = blobShadow(1.2, bag)
    this.shadow.scale.set(1.1, 1, 2.4)
    scene.add(this.shadow)
    // Where her finger holds (finger mode): a pink ring on the water.
    this.marker = new Mesh(bag.add(new RingGeometry(1.1, 1.55, 32)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.85, depthWrite: false })))
    this.marker.rotation.x = -Math.PI / 2
    this.marker.position.y = 0.05
    this.marker.renderOrder = 3
    this.marker.visible = false
    scene.add(this.marker)

    // ---- The otters: four in the raft holding hands in pairs, and the two sleepy ones who drift off.
    for (let i = 0; i < 4; i++) {
      const o = new Otter(bag)
      o.root.scale.setScalar(1.5)
      const pair = Math.floor(i / 2)
      o.root.position.set(RAFT.x + (pair ? 2.2 : -2.2) + (i % 2 ? 0.55 : -0.55), 0, RAFT.z + (pair ? 1 : -1))
      o.root.rotation.y = pair ? 0.4 : -0.3
      o.hold = i % 2 ? -1 : 1
      scene.add(o.root)
      this.raft.push(o)
    }
    for (let i = 0; i < 2; i++) {
      const o = new Otter(bag)
      o.root.scale.setScalar(1.5)
      o.sleepy = true
      const p = DRIFTS[i]
      const dr: Drifter = { o, x: p.x, z: p.z, state: 'drift', away: i === 0 }
      // Only the first is out there at the start; the second drifts off once the first is home.
      if (i === 1) {
        dr.x = RAFT.x - 1
        dr.z = RAFT.z - 3
      }
      o.root.position.set(dr.x, 0, dr.z)
      scene.add(o.root)
      this.drifters.push(dr)
    }
    if (ORDER.indexOf(this.section) > ORDER.indexOf('otters')) this.homeAll()

    // ---- The whales and the orcas.
    this.grey = new Whale(bag, 'grey')
    this.hump = new Whale(bag, 'humpback')
    scene.add(this.grey.root, this.hump.root)
    ORCAS.forEach((who, i) => {
      const o = new Orca(bag, who)
      o.root.visible = false
      scene.add(o.root)
      this.orcas.push({ o, x: 0, z: 0, h: 0, phase: i * 1.7 })
    })
    if (this.section === 'orcas') this.meetOrcas(true)

    // ---- The shore's animals.
    this.coast.lions.forEach((l) => {
      const s = new SeaLion(bag)
      s.root.position.set(l.x, l.y, l.z)
      s.root.rotation.y = l.h
      s.root.scale.setScalar(1.5)
      scene.add(s.root)
      this.lions.push(s)
    })
    this.eagle = new Eagle(bag)
    this.eagle.root.position.copy(this.coast.eagle)
    this.eagle.root.rotation.y = -2.4
    this.eagle.root.scale.setScalar(1.8)
    this.puffin = new Puffin(bag)
    this.puffin.root.position.copy(this.coast.puffin)
    this.puffin.root.rotation.y = 0.8
    this.puffin.root.scale.setScalar(2)
    this.stars = new SeaStars(bag, this.coast.stars)
    this.stars.root.position.copy(this.coast.pool)
    this.stars.root.scale.setScalar(1.5)
    this.surfer = new Surfer(bag)
    this.surfer.root.scale.setScalar(1.4)
    this.coast.seals.forEach((p, i) => {
      const s = new HarbourSeal(bag, i ? '#B3A79C' : '#9EA3B3')
      s.root.position.set(p.x, p.y, p.z)
      s.root.rotation.y = p.h
      s.root.scale.setScalar(1.6)
      scene.add(s.root)
      this.seals.push(s)
    })
    this.raven = new Raven(bag)
    this.raven.root.position.copy(this.coast.raven)
    this.raven.root.rotation.y = Math.PI * 0.85
    this.raven.root.scale.setScalar(1.6)
    this.gulls = new Gulls(bag, [
      { x: DOCK.x - 6, z: 66 },
      { x: -20, z: 40 },
      { x: 30, z: 10 },
      { x: -10, z: -50 },
    ])
    this.clouds = new Clouds(bag)
    scene.add(this.eagle.root, this.puffin.root, this.stars.root, this.surfer.root, this.raven.root, this.gulls.root, this.clouds.root)

    // ---- Wake, spray, the spouts' mist, sparkles, bubbles.
    this.foam = new Particles({ kind: 'foam', count: 220, opacity: 0.85 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 260, color: '#EAF8FF', gravity: 12 }, bag)
    this.mist = new Particles({ kind: 'spray', count: 220, color: '#FFFFFF', gravity: 5 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 140, colors: ['#FFFFFF', '#FFE1F0', '#FFF6B8', '#C9F4FF'], gravity: -0.5 }, bag)
    this.bubbles = new Particles({ kind: 'spray', count: 140, color: '#E8FBFF', gravity: -2.2 }, bag)
    scene.add(this.foam.mesh, this.spray.mesh, this.mist.mesh, this.sparkle.mesh, this.bubbles.mesh)

    // ---- Where the link starts.
    if (this.section === 'spouts') this.nextSpotT = 1.2
    if (start.section === 'listen') {
      this.startListen(true)
    }
    this.placeBoat(0)

    this.unwatch = watch('whales', () => ({
      'her finger ahead (m)': [this.aimAhead, 30],
      'turn asked (rad)': [this.aimTurn, 1.6],
      'speed (m/s)': [this.d.speed, 10],
      'turning (rad/s)': [this.d.yawRate, 2],
      'in the air (m)': [this.d.y, 1.5],
      'pitch (rad)': [this.pitch.x, 0.4],
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
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  setWheelElements(wheel: HTMLElement | null, hint: HTMLElement | null) {
    this.wheelEl = wheel
    this.steerHintEl = hint
  }
  get calm() {
    return false
  }

  private enter(s: WhaleSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.progressed()
    this.hintsHere = 0
    if (!this.listening) this.events.section(s)
  }

  /** The story's over (her tap, or Maple's lines are done): the boat is hers. */
  play() {
    if (this.section !== 'story') return
    this.lastTouch = this.time
    this.enter('harbour')
  }

  /** Something moved the story on (no hint for a while). */
  private progressed() {
    this.lastProgress = this.time
  }
  /** A line, unless it was said a moment ago (`once`: only ever once). */
  private talk(line: Line, opts: { once?: string; cool?: number } = {}) {
    if (opts.once) {
      if (this.said.has(opts.once)) return
      this.said.add(opts.once)
    }
    if (this.time < this.talkCool) return
    this.talkCool = this.time + (opts.cool ?? 1.6)
    this.events.say(line)
  }
  /** A new animal for the book; false when she'd met it already (then a friend can say something instead). */
  private met(id: Parameters<typeof meet>[0]) {
    const first = meet(id)
    // (The book's card speaks: nobody talks over it for a moment.)
    if (first) this.talkCool = this.time + 3.5
    return first
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.readFeel()
    this.water.update(t)
    this.bumpCool -= dt

    if (this.section === 'story') this.storyT += dt
    this.steer(dt)
    // Towing the sleepy otter, the boat goes gently by itself (she can't lose her on the way home).
    this.d.cap = this.activeDrifter?.state === 'towed' ? FIND.tow : 1
    this.move(dt)
    this.story(dt, t)
    this.updateAnimals(dt, t)
    this.updateListen(dt, t)
    this.placeBoat(dt)
    for (const p of [this.foam, this.spray, this.mist, this.sparkle, this.bubbles]) p.update(dt)

    // Under the water once the camera dips below the surface: the sea floor, the kelp's stalks, teal all round.
    const below = this.rig.camera.position.y < -0.05
    if (below !== this.below) {
      this.below = below
      this.coast.under.visible = below
      this.water.mesh.visible = !below
      const c = below ? DEEP : SKY
      ;(this.scene.background as Color).set(c)
      this.fog.color.set(c)
      this.fog.near = below ? 3 : 140
      this.fog.far = below ? 60 : 700
    }

    this.lights.follow(this.d.x, 0, this.d.z)
    this.camYaw += wrap(this.d.heading - this.camYaw) * ease(dt, 0.4 + HELM.camera * 4)
    this.rig.lag = this.listening ? 0.7 : this.doneT >= 0 && this.doneT < 5 ? 0.8 : 0.35
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
    this.speakHint(t)
  }

  /** Stuck for a while (nothing new happening): Sparkle helps, out loud. */
  private speakHint(t: number) {
    if (this.section === 'story' || this.listening || this.doneT >= 0 || this.hintsHere >= 3) return
    if (t - this.lastProgress < STUCK_S || t - this.lastHint < HINT_EVERY_S) return
    const h = L.whales.hint
    const dr = this.activeDrifter
    // (With the orcas, the first time, the tap-to-listen microphone: the side verb she may not have found yet.)
    const mic = this.section === 'orcas' && this.counts.listens === 0 && !this.said.has('mic')
    if (mic) this.said.add('mic')
    const line = mic ? h.mic : this.section === 'harbour' ? h.harbour : this.section === 'otters' ? (dr?.state === 'towed' ? h.tow : h.otters) : this.section === 'spouts' ? h.spouts : h.orcas
    this.lastHint = t
    this.hintsHere++
    this.events.say(line)
  }

  // ---------------------------------------------------------------- her finger: steering

  private steer(dt: number) {
    const d = this.d
    const f = this.finger
    this.marker.visible = false
    this.aimAhead = this.aimTurn = 0
    if (this.listening || this.section === 'story') {
      d.stop()
      this.wheel.update(dt, this.time, WHEEL)
      this.wheel.draw(this.wheelEl, false, WHEEL.reach)
      return
    }
    if (f && !f.steering && this.time - f.t > 0.3) this.startSteer()
    if (this.mode === 'finger') {
      if (f?.steering) {
        const p = this.waterPoint(f.x, f.y, tmp)
        if (p) {
          d.hold(p.x, p.z)
          this.marker.visible = true
          this.marker.position.set(p.x, 0.05, p.z)
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
        this.marker.position.set(g.x, 0.05, g.z)
        this.marker.scale.setScalar(0.7)
      }
    } else {
      const k = this.wheel.update(dt, this.time, WHEEL)
      if (this.wheel.steering) {
        // Her finger down = go; the push turns the bow (heading grows to the boat's left, which is the screen's right
        // seen from behind: a push to the right turns right).
        const a = d.heading - k * WHEEL.lock
        const dist = HELM.far + 6
        d.hold(d.x + Math.sin(a) * dist, d.z + Math.cos(a) * dist)
        this.aimAhead = dist
        this.aimTurn = -k * WHEEL.lock
      }
      this.wheel.draw(this.wheelEl, true, WHEEL.reach)
    }
  }

  private startSteer() {
    const f = this.finger
    if (!f || f.steering) return
    f.steering = true
    this.counts.steers++
    if (this.listening) this.endListen()
  }

  // ---------------------------------------------------------------- the boat on the waves

  /** How rough the sea is here: calm in the harbour, the full waves out past the points. */
  private rough(z: number) {
    return BOUNCE.waves * (0.2 + 0.8 * clamp((HARBOUR_END_Z + 8 - z) / 50))
  }

  private move(dt: number) {
    const d = this.d
    // Near the edge of the sea, it turns gently back (never stuck facing nowhere).
    const ox = d.x - SEA.x
    const oz = d.z - SEA.z
    const r = Math.hypot(ox, oz)
    if (r > SEA.r - 14) {
      const inward = Math.atan2(-ox, -oz)
      d.heading += wrap(inward - d.heading) * Math.min(1, dt * 0.8 * ((r - (SEA.r - 14)) / 14))
    }
    const before = { x: d.x, z: d.z }
    const ev = d.step(dt)
    const p = { x: d.x, z: d.z }
    if (r > SEA.r) {
      p.x = SEA.x + (ox / r) * SEA.r
      p.z = SEA.z + (oz / r) * SEA.r
    }
    const hit = keepOff(p, 2.6) ?? this.keepOffWhale(p)
    d.x = p.x
    d.z = p.z
    if (hit) {
      const v = d.bounce(hit.nx, hit.nz, 0.35)
      if (v > 0.8 && this.bumpCool <= 0) {
        this.bumpCool = 0.6
        this.counts.bumps++
        thunk()
        this.roll.v += (Math.random() < 0.5 ? -1 : 1) * Math.min(3, v * 0.5)
        this.squash = 0
      }
    }
    const moved = Math.hypot(d.x - before.x, d.z - before.z)
    this.travel += moved
    // The waves: each crest that passes under rocks the bow up; fast, it throws the boat into the air.
    const sp = Math.abs(d.speed)
    const rough = this.rough(d.z)
    const was = this.crest
    this.crest += moved / Math.max(0.5, BOUNCE.len)
    if (Math.floor(this.crest) !== Math.floor(was) && !d.airborne) {
      const k = sp / Math.max(0.1, HELM.top)
      this.pitch.v -= (0.6 + 1.6 * k) * rough * BOUNCE.rock
      if (k > BOUNCE.hopFrom && rough > 0.3) {
        d.jump(BOUNCE.hop * Math.min(1.3, k) * Math.min(1.4, rough))
        this.counts.hops++
      }
    }
    if (ev.landed !== undefined && ev.landed > 1) this.splashDown(ev.landed)
    // The engine: putt-putt slowly, quicker when fast.
    const k = Math.min(1.3, sp / Math.max(0.1, HELM.top))
    if (k > 0.04 || d.driven) {
      this.puttT += dt
      if (this.puttT > 1 / (3 + 10 * k)) {
        this.puttT = 0
        putt(k)
      }
    }
    // The wake: foam off the stern, more the faster it goes; spray off the bow when it's quick.
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (!d.airborne && sp > 0.5 && Math.random() < dt * (4 + sp * 3)) {
      for (const s of [-1, 1]) this.foam.emit(d.x - sx * BOAT_LEN * 0.5 + sz * s * 0.9, 0.03, d.z - sz * BOAT_LEN * 0.5 - sx * s * 0.9, sz * s * sp * 0.12, 0, -sx * s * sp * 0.12, 1.3 + sp * 0.06, 0.32 + sp * 0.03)
    }
    if (!d.airborne && sp > HELM.top * 0.6 && Math.random() < dt * 12) {
      const s = Math.random() < 0.5 ? -1 : 1
      this.spray.emit(d.x + sx * 2.2 + sz * s * 1.1, 0.4, d.z + sz * 2.2 - sx * s * 1.1, sz * s * 2.5, 2 + Math.random() * 2, -sx * s * 2.5, 0.6, 0.2)
    }
  }

  /** A whale up in the boat's way: the boat bumps gently off its side (a bonk, Maple wobbles, the whale puffs). */
  private keepOffWhale(p: { x: number; z: number }): { nx: number; nz: number } | null {
    const w = this.whale
    if (!w?.up || w.body.position.y < -1.6) return null
    // The whale's body as a line from its tail stock to its head, in the water's plane.
    const a = w.body.localToWorld(tmp.set(0, 0, w.len * 0.42))
    const ax = a.x
    const az = a.z
    const b = w.body.localToWorld(tmp.set(0, 0, -w.len * 0.45))
    const bx = b.x - ax
    const bz = b.z - az
    const l2 = bx * bx + bz * bz
    const k = l2 > 1e-4 ? clamp(((p.x - ax) * bx + (p.z - az) * bz) / l2) : 0
    const cx = ax + bx * k
    const cz = az + bz * k
    const dx = p.x - cx
    const dz = p.z - cz
    const dist = Math.hypot(dx, dz)
    const r = 1.4 + 1.5
    if (dist >= r) return null
    const nx = dist > 1e-3 ? dx / dist : 1
    const nz = dist > 1e-3 ? dz / dist : 0
    p.x = cx + nx * r
    p.z = cz + nz * r
    if (this.time - this.bumpTalkT > 1.2) {
      this.bumpTalkT = this.time
      bonk()
      this.boat.wobble()
      const h = w.holeAt(tmp)
      this.puff(h.x, h.z, 0.35)
      this.talk(L.whales.bump, { cool: 6 })
    }
    return { nx, nz }
  }

  private splashDown(v: number) {
    const d = this.d
    this.squash = 0
    this.pitch.v += Math.min(4, v * 0.35) * BOUNCE.rock
    for (const s of [-1, 1]) this.spray.burst(d.x + Math.cos(d.heading) * s * 1.2, 0.2, d.z - Math.sin(d.heading) * s * 1.2, 10, 2.2, 2.8, 0.2)
    this.foam.emit(d.x, 0.03, d.z, 0, 0, 0, 1.3, 3)
    noise(0.3, 0.12, 'bandpass', 1500, 500, 0, 0.8)
  }

  private placeBoat(dt: number) {
    const d = this.d
    const t = this.time
    const b = this.boat
    const rough = this.rough(d.z)
    // Springs: the waves rock it (bigger out at sea), a crest lifts the bow, a landing slams it.
    const k = BOUNCE.spring
    const damp = 2 * Math.sqrt(k) * 0.35
    const wavePitch = Math.sin(this.crest * Math.PI * 2) * 0.05 * rough * BOUNCE.rock + Math.sin(t * 1.1 + d.x * 0.1) * 0.02 * rough * BOUNCE.rock
    const sp = d.speed / Math.max(0.1, HELM.top)
    const bowUp = 0.03 * Math.max(0, sp) + (d.airborne ? clamp(d.vy * 0.03, -0.12, 0.12) : 0)
    this.pitch.v += ((-bowUp + wavePitch - this.pitch.x) * k - this.pitch.v * damp) * dt
    this.pitch.x += this.pitch.v * dt
    this.roll.v += ((Math.sin(t * 0.9 + d.z * 0.07) * 0.05 * rough * BOUNCE.rock - this.roll.x) * k - this.roll.v * damp) * dt
    this.roll.x += this.roll.v * dt
    this.squash = Math.min(1, this.squash + dt / 0.45)
    const y = swell(d.x, d.z, t) * (0.6 + rough) + d.y
    b.root.position.set(d.x, y, d.z)
    b.root.rotation.set(0, d.heading, 0)
    b.body.rotation.set(clamp(this.pitch.x, -0.5, 0.5), 0, d.roll + clamp(this.roll.x, -0.4, 0.4))
    const s = this.squash < 1 ? Math.cos(this.squash * Math.PI * 3) * (1 - this.squash) ** 2 * BOUNCE.squash : 0
    b.body.scale.set(1 + 0.08 * s, 1 - 0.16 * s, 1 + 0.04 * s)
    this.shadow.position.set(d.x, 0.015, d.z)
    this.shadow.rotation.z = -d.heading
    this.shadow.visible = !this.below
    // Maple looks at whatever's most interesting.
    let look: Vector3 | null = null
    if (this.section === 'story') look = this.rig.camera.position
    else if (this.whale?.up) look = this.whale.root.position
    else if (this.spot) look = tmp2.set(this.spot.x, 1, this.spot.z)
    else if (this.orcaIn) look = this.orcas.find((o) => o.o.jumping)?.o.root.position ?? this.orcas[3].o.root.position
    else if (this.section === 'otters' && this.activeDrifter) look = this.activeDrifter.o.root.position
    b.update(dt, t, { turn: clamp(d.yawRate / Math.max(0.1, HELM.turn), -1, 1), look, mic: this.mic })
    if (b.slapped) {
      b.slapped = false
      sfx.thump()
    }
    // Soaked: drips off her, then she shakes them off.
    if (b.soaked && Math.random() < dt * (b.shaking ? 40 : 8)) {
      const h = b.headAt(tmp3)
      const a = Math.random() * Math.PI * 2
      const f = b.shaking ? 3 : 0.3
      this.spray.emit(h.x, h.y, h.z, Math.cos(a) * f, b.shaking ? 1.5 : 0, Math.sin(a) * f, 0.6, 0.08)
    }
  }

  // ---------------------------------------------------------------- the story

  private get activeDrifter() {
    return this.drifters.find((d) => d.state !== 'home') ?? null
  }

  private story(dt: number, t: number) {
    const d = this.d
    if (this.section === 'story') {
      // Maple waves hello from the wheel, points out to sea ("let's find them!"), and does a happy hop.
      const was = this.storyT - dt
      const at = (s: number) => was < s && this.storyT >= s
      if (at(0.4)) this.boat.wave()
      if (at(2.6)) this.boat.pointAt(tmp.set(d.x + Math.sin(d.heading) * 40, 2, d.z + Math.cos(d.heading) * 40))
      if (at(4.6)) this.boat.cheer()
      if (this.storyT > 7) this.storyT = 0
    }
    if (this.section === 'harbour' && d.z < HARBOUR_END_Z) this.enter('otters')
    if (this.section === 'otters' || this.section === 'harbour') this.updateOtters(dt, t)
    else this.updateRaft(dt, t)
    if (this.section === 'spouts') this.updateSpouts(dt)
    this.updateWhale(dt, t)
    if (this.section === 'orcas') this.updateOrcas(dt)
    if (this.doneT >= 0) this.doneT += dt
  }

  // ---- The otters.

  /** The raft: gently close and they wave; zooming past and they all dive. */
  private updateRaft(dt: number, t: number) {
    const d = this.d
    this.raftCool -= dt
    const dist = Math.hypot(d.x - RAFT.x, d.z - RAFT.z)
    const sp = Math.abs(d.speed)
    if (dist < 12 && this.raftCool <= 0) {
      if (sp > FIND.fast) {
        this.raftCool = 6
        this.counts.dives++
        for (const o of this.raft) o.dive()
        for (const dr of this.drifters) if (dr.state === 'home') dr.o.dive()
        sfx.splash()
        setTimeout(() => squeak(), 1700)
        setTimeout(() => this.talk(L.whales.otterGrumpy, { cool: 8 }), 2000)
      } else if (sp < FIND.gentle && dist < 10) {
        this.raftCool = 5
        this.raft.forEach((o, i) => setTimeout(() => o.wave(), i * 120))
        squeak()
        if (!this.met('sea-otter')) this.talk(L.whales.otterHi, { cool: 10 })
      }
    }
    // The kelp sways; bubbles come up now and then.
    this.swayKelp(t)
  }

  private updateOtters(dt: number, t: number) {
    this.updateRaft(dt, t)
    const d = this.d
    const dr = this.activeDrifter
    if (!dr) return
    if (this.section === 'otters') this.ottersT += dt
    const o = dr.o
    const sp = Math.abs(d.speed)
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (dr.state === 'drift') {
      // She drifts slowly away from the raft, asleep (sparkles over her call Kaylee); after a while she paddles toward
      // the boat herself.
      const goal = DRIFTS[this.drifters.indexOf(dr)]
      if (!dr.away && Math.hypot(dr.x - RAFT.x, dr.z - RAFT.z) > 12) dr.away = true
      const help = dr.away && this.section === 'otters' && this.ottersT > 15
      const tx = help ? d.x : goal.x
      const tz = help ? d.z : goal.z
      const gd = Math.hypot(tx - dr.x, tz - dr.z)
      // (Floating off from the raft on the current, then drifting slowly; after a while she paddles to the boat.)
      const v = !dr.away ? 2.6 : help ? 1.4 : 0.35
      if (gd > (help ? 6 : 0.5)) {
        dr.x += ((tx - dr.x) / gd) * v * dt
        dr.z += ((tz - dr.z) / gd) * v * dt
      }
      if (this.section === 'otters' && Math.random() < dt * 4) this.sparkle.emit(dr.x + (Math.random() - 0.5) * 1.5, 1 + Math.random(), dr.z + (Math.random() - 0.5) * 1.5, 0, 0.4, 0, 1.1, 0.14)
      const dist = Math.hypot(d.x - dr.x, d.z - dr.z)
      if (dr.away && dist < 7 && sp < FIND.gentle && !o.diving) {
        // Gently close: she wakes up, waves and grabs the rope.
        dr.state = 'towed'
        o.sleepy = false
        o.wave()
        squeak()
        sounds.pop()
        this.counts.tows++
        this.progressed()
        if (!this.met('sea-otter')) this.talk(L.whales.otterWake)
        setTimeout(() => this.talk(L.whales.otterTow, { once: `tow${this.homed}` }), 1800)
      } else if (dist < 6 && sp > FIND.fast && !o.diving) {
        o.dive()
        this.counts.dives++
        sfx.splash()
        setTimeout(() => this.talk(L.whales.otterGrumpy, { cool: 8 }), 2000)
      }
    } else if (dr.state === 'towed') {
      // On the rope behind the stern, swinging along (the boat goes gently by itself while it tows her).
      const rx = d.x - sx * (BOAT_LEN * 0.5 + 3.2)
      const rz = d.z - sz * (BOAT_LEN * 0.5 + 3.2)
      dr.x += (rx - dr.x) * ease(dt, 3)
      dr.z += (rz - dr.z) * ease(dt, 3)
      if (Math.hypot(dr.x - RAFT.x, dr.z - RAFT.z) < 7) this.bringHome(dr)
      if (sp > 1 && Math.random() < dt * 6) this.foam.emit(dr.x, 0.03, dr.z, 0, 0, 0, 1, 0.5)
    }
    o.root.position.set(dr.x, 0, dr.z)
    if (dr.state === 'towed') o.root.rotation.y += wrap(d.heading + Math.PI - o.root.rotation.y) * ease(dt, 4)
  }

  private bringHome(dr: Drifter) {
    dr.state = 'home'
    this.homed++
    const i = this.drifters.indexOf(dr)
    // She swims into her place next to her friend and they hold hands.
    const pair = this.raft[i * 2 + 1]
    dr.x = pair.root.position.x - 1.1
    dr.z = pair.root.position.z + 0.3
    dr.o.root.position.set(dr.x, 0, dr.z)
    dr.o.root.rotation.y = pair.root.rotation.y
    dr.o.hold = 1
    this.raft.forEach((o, j) => setTimeout(() => o.wave(), j * 140))
    this.sparkle.burst(dr.x, 0.5, dr.z, 30, 2, 2.6, 0.18)
    sounds.correct()
    squeak()
    this.boat.wave()
    this.ottersT = 0
    this.progressed()
    this.talk(L.whales.otterHome)
    // (The first time, Maple says why they hold hands.)
    setTimeout(() => this.talk(L.whales.otterHold, { once: 'hold' }), 1600)
    if (this.homed >= this.drifters.length) {
      this.boat.cheer()
      this.events.progress(1)
      setTimeout(() => this.enter('spouts'), 2600)
      this.nextSpotT = 4
    }
  }

  /** A link past the otters: everyone's home already. */
  private homeAll() {
    this.drifters.forEach((dr, i) => {
      const pair = this.raft[i * 2 + 1]
      dr.state = 'home'
      dr.o.sleepy = false
      dr.o.hold = 1
      dr.x = pair.root.position.x - 1.1
      dr.z = pair.root.position.z + 0.3
      dr.o.root.position.set(dr.x, 0, dr.z)
      dr.o.root.rotation.y = pair.root.rotation.y
    })
    this.homed = this.drifters.length
  }

  private swayKelp(t: number) {
    for (const k of this.coast.kelp) {
      // The fronds drift to and fro on the swell; the stalks lean with them from the floor.
      k.top.position.x = KELP.x + Math.sin(t * 0.5 + k.a) * 0.35
      k.top.position.z = KELP.z + Math.cos(t * 0.4 + k.a) * 0.3
      k.top.position.y = Math.sin(t * 1.1 + k.a) * 0.04
      k.stalk.rotation.z = Math.sin(t * 0.6 + k.a) * 0.02
      k.stalk.rotation.x = Math.cos(t * 0.5 + k.a) * 0.02
    }
  }

  // ---- The spouts and the whales.

  private updateSpouts(dt: number) {
    const d = this.d
    if (this.whale?.busy) return
    if (this.found >= 4) {
      this.events.progress(2)
      this.enter('orcas')
      this.meetOrcas(false)
      return
    }
    if (!this.spot) {
      this.nextSpotT -= dt
      if (this.nextSpotT <= 0) this.pickSpot()
      return
    }
    this.lookT += dt
    // It spouts every few seconds to call her (Maple lifts her binoculars at the first).
    this.spoutT -= dt
    if (this.spoutT <= 0) {
      this.spoutT = 4.2
      this.puff(this.spot.x, this.spot.z, 0.7, this.found < 2)
      if (this.lookT < 1) {
        this.boat.spot()
        setTimeout(() => this.spot && this.boat.pointAt(tmp2.set(this.spot.x, 1.5, this.spot.z)), 2300)
      }
    }
    // Taking a while: the next spout comes up closer.
    if (this.lookT > 20) {
      this.lookT = 8
      this.spot.x += (d.x - this.spot.x) * 0.45
      this.spot.z += (d.z - this.spot.z) * 0.45
    }
    const near = FIND.spout + (FIND.spoutMax - FIND.spout) * clamp((this.lookT - 15) / 6)
    if (Math.hypot(d.x - this.spot.x, d.z - this.spot.z) < near) this.raise()
  }

  /** The next spout: 30-45 m ahead of the boat (off to one side), on open water in the whales' sea. */
  private pickSpot() {
    const d = this.d
    for (let i = 0; i < 30; i++) {
      const a = d.heading + (Math.random() - 0.5) * 1.6
      const r = 30 + Math.random() * 15
      const x = clamp(d.x + Math.sin(a) * r, SPOUT_BOX.x0, SPOUT_BOX.x1)
      const z = clamp(d.z + Math.cos(a) * r, SPOUT_BOX.z0, SPOUT_BOX.z1)
      if (open(x, z, 14) && Math.hypot(x - d.x, z - d.z) > 22) {
        this.spot = { x, z }
        break
      }
    }
    this.spot ??= { x: clamp(d.x, SPOUT_BOX.x0, SPOUT_BOX.x1), z: SPOUT_BOX.z0 + 20 }
    this.spoutT = 0
    this.lookT = 0
  }

  /** A spout: a white plume and a whoosh (`k` = how big). */
  private puff(x: number, z: number, k: number, heart = false) {
    // A grey whale's blow comes out in a V, like a heart (two blowholes side by side); a humpback's is one tall bush.
    const sides = heart ? [-1, 1] : [0]
    for (const side of sides) for (let i = 0; i < (40 * k) / sides.length; i++) this.mist.emit(x + (Math.random() - 0.5) * 0.6, 0.6, z + (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 1.4 + side * 1.6, 7 + Math.random() * 5 * k, (Math.random() - 0.5) * 1.4, 1.2 + Math.random() * 0.4, 0.35 + Math.random() * 0.35)
    this.foam.emit(x, 0.03, z, 0, 0, 0, 1.4, 2.6)
    blow()
    this.counts.spouts++
  }

  /** The whale comes up at the spout (grey, grey, humpback, then the humpback that jumps), across the boat's way. */
  private raise() {
    const d = this.d
    const spot = this.spot!
    const w = this.found < 2 ? this.grey : this.hump
    this.whale = w
    const across = Math.atan2(spot.x - d.x, spot.z - d.z) + (Math.random() < 0.5 ? 1 : -1) * 1.2
    w.root.position.set(spot.x, 0, spot.z)
    w.root.rotation.y = across
    if (this.found === 3) w.breach()
    else w.surface()
    this.spot = null
    this.boat.pointAt(w.root.position)
    this.progressed()
    // She found it: into the book (the card names it), or Maple says something about this one.
    const first = this.met(w.kind === 'grey' ? 'grey-whale' : 'humpback')
    if (!first) {
      if (this.found === 0) this.talk(L.whales.whaleUp)
      else if (this.found === 2) this.talk(L.whales.humpback)
    }
  }

  private updateWhale(dt: number, t: number) {
    const w = this.whale
    this.grey.update(dt, t)
    this.hump.update(dt, t)
    if (!w) return
    if (w.blew) {
      const h = w.holeAt(tmp)
      this.puff(h.x, h.z, 1, w.kind === 'grey')
      if (this.found === 1) this.talk(L.whales.whaleBlow, { once: 'blow' })
      // Sitting right where it comes up: the whale sneezes on the boat and Maple gets soaked.
      if (Math.hypot(this.d.x - h.x, this.d.z - h.z) < FIND.sneeze + BOAT_LEN * 0.4) {
        this.counts.sneezes++
        achoo()
        this.boat.soak()
        setTimeout(() => this.talk(L.whales.sneeze, { cool: 4 }), 700)
        const m = this.boat.headAt(tmp2)
        for (let i = 0; i < 40; i++) this.spray.emit(m.x + (Math.random() - 0.5) * 2, m.y + 3 + Math.random() * 2, m.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, -2, (Math.random() - 0.5) * 2, 0.9, 0.18)
      }
    }
    if (w.landed) {
      const p = w.body.getWorldPosition(tmp)
      for (let i = 0; i < 3; i++) this.spray.burst(p.x + (Math.random() - 0.5) * 6, 0.3, p.z + (Math.random() - 0.5) * 6, 26, 5, 7, 0.4)
      this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 2.5, 9)
      sfx.splash()
      noise(0.9, 0.2, 'lowpass', 800, 150)
      this.boat.cheer()
      this.boat.slap()
      this.talk(L.whales.breach, { once: 'breach' })
    }
    if (w.slapped) {
      const p = w.body.localToWorld(tmp.set(0, 0, -w.len * 0.7))
      this.spray.burst(p.x, 0.3, p.z, 16, 3, 4, 0.3)
      sfx.splash()
      if (this.found === 1) this.talk(L.whales.whaleTail, { once: 'tail' })
    }
    if (!w.busy && !this.listening) {
      this.whale = null
      this.found++
      sounds.correct()
      this.boat.cheer()
      this.progressed()
      this.nextSpotT = 2.5
    }
  }

  // ---- The orca family.

  private meetOrcas(snap: boolean) {
    if (this.orcaIn) return
    this.orcaIn = true
    const d = this.d
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    for (const r of this.orcas) {
      const f = FORMATION[r.o.who]
      // From the link they're alongside already; otherwise they swim in from ahead.
      const ahead = snap ? f.f : 40 + f.f
      r.x = d.x + sx * ahead + Math.cos(d.heading) * f.s
      r.z = d.z + sz * ahead - Math.sin(d.heading) * f.s
      r.h = d.heading + (snap ? 0 : Math.PI)
      r.o.root.visible = true
    }
    if (!snap) {
      orcaCall()
      setTimeout(() => {
        if (!this.met('orca')) this.talk(L.whales.orcaHello, { once: 'orcas' })
      }, 2500)
    }
  }

  private updateOrcas(dt: number) {
    const d = this.d
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    const sp = Math.abs(d.speed)
    const k = sp / Math.max(0.1, HELM.top)
    // The baby copies her turns: a clear turn makes it turn too (with a happy wiggle and a squeak).
    this.copyCool -= dt
    const turning = Math.abs(d.yawRate) > 0.5 && sp > 1.5
    if (turning && this.copyCool <= 0) {
      this.copyCool = 2.2
      this.copies++
      this.counts.copies++
      this.orcas[3].o.happy()
      orcaCall(true)
      this.progressed()
      if (this.copies === 1 || this.copies === 4) this.talk(L.whales.babyCopy, { once: `copy${this.copies}` })
    }
    // Fast: one of them jumps in the wake every so often; slow, now and then anyway.
    this.jumpCool -= dt
    if (this.jumpCool <= 0 && this.doneT < 0) {
      const fast = k > FIND.jumpAt
      this.jumpCool = fast ? 1.3 + Math.random() * 0.6 : 4 + Math.random() * 3
      const r = this.orcas[Math.floor(Math.random() * 4)]
      if (!r.o.jumping) {
        r.o.jump()
        if (fast) {
          this.jumps++
          this.counts.jumps++
          this.progressed()
        }
      }
    }
    if (this.doneT < 0 && this.jumps >= FIND.jumps && this.copies >= 2) this.finale()
    for (const r of this.orcas) {
      const f = FORMATION[r.o.who]
      // Their place beside the boat (the baby swings out the way she turns).
      const swing = r.o.who === 'baby' ? clamp(d.yawRate, -1, 1) * 2.5 : 0
      const tx = d.x + sx * f.f + Math.cos(d.heading) * (f.s + swing)
      const tz = d.z + sz * f.f - Math.sin(d.heading) * (f.s + swing)
      const dx = tx - r.x
      const dz = tz - r.z
      const dist = Math.hypot(dx, dz)
      // They swim there (never faster than the boat plus a bit), facing the way they go, or the boat's way when there.
      const v = Math.min(dist * 1.2, sp + 5)
      if (dist > 0.01) {
        r.x += (dx / dist) * v * dt
        r.z += (dz / dist) * v * dt
      }
      const face = dist > 3 ? Math.atan2(dx, dz) : d.heading + (r.o.who === 'baby' ? d.yawRate * 0.5 : 0)
      r.h += wrap(face - r.h) * ease(dt, r.o.who === 'baby' ? 5 : 2.5)
      // Swimming forward makes the wake (and the bubbles at their blowholes now and then).
      if (r.o.landed) {
        this.spray.burst(r.x, 0.2, r.z, 12, 2.4, 3.2, 0.24)
        this.foam.emit(r.x, 0.03, r.z, 0, 0, 0, 1.4, 2.4)
        sfx.splash()
      }
      if (!this.listening && Math.random() < dt * 0.25) this.mist.emit(r.x + Math.sin(r.h) * 1.5, 0.5, r.z + Math.cos(r.h) * 1.5, 0, 4, 0, 0.6, 0.3)
    }
  }

  private finale() {
    this.doneT = 0
    this.orcas.forEach((r, i) => setTimeout(() => r.o.jump(), 150 + i * 160))
    setTimeout(() => {
      this.boat.cheer()
      this.boat.slap()
      sounds.fanfare()
    }, 900)
    orcaCall()
    this.events.progress(3)
    setTimeout(() => this.talk(L.whales.finale, { once: 'finale' }), 1800)
    this.events.done()
  }

  // ---- Listening under the water.

  private startListen(snap = false) {
    if (this.listening) return
    this.listening = true
    this.listenT = 0
    this.songT = 1.6
    this.counts.listens++
    this.d.stop()
    if (snap) this.mic = 1
    // The humpback comes to sing under the boat; the orcas dive down too once she's met them.
    const d = this.d
    if (!this.whale?.busy) {
      this.hump.root.position.set(d.x + Math.sin(d.heading) * 16, -3, d.z + Math.cos(d.heading) * 16)
      this.hump.root.rotation.y = 0
      this.hump.swim()
    }
    for (const r of this.orcas) if (this.orcaIn) r.o.up = 0
    tone(600, 300, 0.4, 0.06, 'sine')
    this.events.section('listen')
  }

  private endListen() {
    if (!this.listening) return
    this.listening = false
    if (this.hump !== this.whale) this.hump.hide()
    tone(300, 600, 0.4, 0.06, 'sine')
    this.events.section(this.section)
  }

  private updateListen(dt: number, t: number) {
    // The microphone goes down (and the camera dips) while she listens; comes up after.
    this.mic += ((this.listening ? 1 : 0) - this.mic) * ease(dt, this.listening ? 1.4 : 3)
    for (const r of this.orcas) {
      if (!this.listening) r.o.up = Math.min(1, r.o.up + dt)
      r.o.root.position.set(r.x, 0, r.z)
      r.o.root.rotation.y = r.h
      r.o.update(dt, t, r.phase)
    }
    if (!this.listening) return
    this.listenT += dt
    // Under the water: the song and the calls, bubbles from the microphone.
    if (this.below) {
      this.songT -= dt
      if (this.songT <= 0) {
        this.songT = 5
        whaleSong()
      }
      if (this.orcaIn) {
        this.callT -= dt
        if (this.callT <= 0) {
          this.callT = 2.5 + Math.random() * 2
          orcaCall(Math.random() < 0.4)
        }
      }
      if (Math.random() < dt * 5) {
        const m = this.boat.mic.getWorldPosition(tmp)
        this.bubbles.emit(m.x + (Math.random() - 0.5) * 0.4, m.y, m.z + (Math.random() - 0.5) * 0.4, 0, 1, 0, 1.6, 0.12)
      }
    }
    this.swayKelp(t)
    if (this.listenT > LISTEN_S) this.endListen()
  }

  // ---- The shore's animals.

  private updateAnimals(dt: number, t: number) {
    for (const o of [...this.raft, ...this.drifters.map((d) => d.o)]) {
      o.update(dt, t)
      if (o.clack) click()
    }
    this.coast.lions.forEach((l, i) => {
      const s = this.lions[i]
      s.update(dt, t)
      // Sliding off: down the rock's side into the water, and back.
      const a = l.h + Math.PI
      s.root.position.set(l.x + Math.sin(a) * s.offset * 3.2, l.y - s.offset * (l.y + 0.6), l.z + Math.cos(a) * s.offset * 3.2)
      s.root.visible = s.offset < 0.95
      if (s.sliding && s.offset > 0.9 && !s.root.userData.splashed) {
        s.root.userData.splashed = true
        this.spray.burst(s.root.position.x, 0.2, s.root.position.z, 12, 2, 3, 0.2)
        sfx.splash()
      }
      if (!s.sliding) s.root.userData.splashed = false
    })
    this.eagle.update(dt, t)
    this.puffin.update(dt, t)
    this.stars.update(dt, t)
    for (const s of this.seals) s.update(dt, t)
    this.raven.update(dt, t)
    if (this.raven.caw) caw()
    this.gulls.update(dt, t)
    this.clouds.update(dt)
    // The surfer rides up and down along the wave.
    this.surfT += dt
    const along = Math.sin(this.surfT * 0.35) * SURF.len * 0.4
    this.surfer.root.position.set(SURF.x - 1.2, 0.2 + Math.abs(Math.sin(this.surfT * 1.3)) * 0.1, SURF.z + along)
    this.surfer.root.rotation.y = Math.cos(this.surfT * 0.35) > 0 ? 0 : Math.PI
    this.surfer.update(dt, t)
    if (this.surfer.fell) {
      this.spray.burst(this.surfer.root.position.x, 0.3, this.surfer.root.position.z, 18, 2.4, 3.4, 0.22)
      sfx.splash()
    }
    this.coast.surf.position.x = SURF.x + Math.sin(t * 0.8) * 0.4
    if (Math.random() < dt * 8) this.foam.emit(SURF.x + (Math.random() - 0.5) * 2, 0.04, SURF.z + (Math.random() - 0.5) * SURF.len, 0.4, 0, 0, 1.2, 0.8)
    // The lighthouse's beam turns (faster for a moment after a tap).
    this.beamSpin = Math.max(0, this.beamSpin - dt)
    this.coast.beam.rotation.y += dt * (0.6 + this.beamSpin * 2.5)
    this.coast.lamp.scale.setScalar(1 + this.beamSpin * 0.2)
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const d = this.d
    const tall = this.tall
    const chase = (this.camYaw + Math.PI) * DEG
    if (this.section === 'story') {
      // At the dock: in front of the boat and a little to the side, on Maple at the wheel (the harbour behind her).
      const yaw = this.d.heading * DEG + 58
      return { center: new Vector3(d.x + Math.sin(d.heading) * -0.4, 1.4, d.z + Math.cos(d.heading) * -0.4), half: tall ? new Vector3(1.2, 1.0, 1.3) : new Vector3(1.7, 0.9, 1.3), yaw, pitch: 16, minDist: 3, maxDist: 20 }
    }
    if (this.listening && this.mic > 0.5) {
      // Under the boat: looking along under the waves at whoever's singing, from just below the surface.
      return { center: new Vector3(d.x + Math.sin(d.heading) * 3, -5.5, d.z + Math.cos(d.heading) * 3), half: tall ? new Vector3(6, 4, 8) : new Vector3(11, 4, 7), yaw: chase + 35, pitch: 4, minDist: 12, maxDist: 24 }
    }
    if (this.doneT >= 0 && this.doneT < 5) {
      // The family jumping together beside the boat.
      return { center: new Vector3(d.x, 1.6, d.z), half: tall ? new Vector3(9, 3, 9) : new Vector3(14, 3, 7), yaw: chase + 55, pitch: 16, minDist: 10, maxDist: 70 }
    }
    const sp = clamp(Math.abs(d.speed) / Math.max(0.1, HELM.top), 0, 1.4)
    const sx = Math.sin(this.camYaw)
    const sz = Math.cos(this.camYaw)
    let ahead = 2.5 + sp * 3
    const half = tall ? new Vector3(4.6, 2, 7.5) : new Vector3(8.2, 2, 5.4)
    half.multiplyScalar(1 + 0.15 * sp)
    // Something to see (a spout, a whale up, the sleepy otter, the orcas): frame it too.
    const focus = this.whale?.up ? this.whale.root.position : this.spot ? tmp3.set(this.spot.x, 0, this.spot.z) : this.section === 'otters' && this.activeDrifter ? this.activeDrifter.o.root.position : null
    if (focus) {
      const fx = focus.x - d.x
      const fz = focus.z - d.z
      const along = fx * sx + fz * sz
      if (along > 0 && Math.hypot(fx, fz) < 50) {
        ahead += along * 0.3
        half.z += along * 0.25
      }
    }
    if (this.orcaIn) half.x = Math.max(half.x, tall ? 8 : 12)
    return {
      center: new Vector3(d.x + sx * ahead, 1, d.z + sz * ahead),
      half,
      yaw: chase,
      pitch: 22,
      follow: true,
      minDist: 8,
      maxDist: 110,
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
  private ray(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster
  }
  private waterPoint(x: number, y: number, out: Vector3) {
    // (From under the water the surface is above: aim along the sea at the same spot.)
    return this.ray(x, y).ray.intersectPlane(this.plane, out)
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // On a tap target, wait: a tap pokes it, a held or dragged finger steers (holding means driving).
    this.finger = { x, y, steering: false, t: this.time, id }
    if (this.mode === 'wheel') this.wheel.down(x, y, this.time, id)
    if (!id) this.startSteer()
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (this.mode === 'wheel') this.wheel.move(x, y, downX, downY, held)
    if (!f.steering && Math.hypot(x - downX, y - downY) > 12) this.startSteer()
  }
  pointerUp() {
    if (this.finger?.steering) this.d.release()
    this.finger = null
    this.wheel.up()
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) this.counts.pokes++
    if (id === 'boat') {
      this.hornN++
      this.counts.horns++
      horn()
      this.boat.wave()
      if (this.hornN % 3 === 0) this.boat.slap()
      if (this.hornN === 1 || this.hornN % 5 === 0) this.talk(L.whales.toot, { cool: 3 })
      return
    }
    if (id === 'mic') {
      if (this.listening) this.endListen()
      else this.startListen()
      return
    }
    if (id === 'otters') {
      // The one nearest her finger cracks a shell on her tummy.
      const gap = (o: Otter) => {
        const p = this.toScreen(o.root.position)
        return Math.hypot(p.x - x, p.y - y)
      }
      this.raft.reduce((a, o) => (gap(o) < gap(a) ? o : a)).poke()
      squeak()
      if (!this.met('sea-otter') && Math.random() < 0.4) this.talk(L.whales.otterClack, { cool: 8 })
      return
    }
    if (id === 'drifter') {
      const dr = this.activeDrifter
      if (dr) {
        dr.o.wave()
        squeak()
        this.met('sea-otter')
      }
      return
    }
    if (id === 'whale') {
      if (this.listening) {
        whaleSong()
        const p = this.hump.body.getWorldPosition(tmp)
        this.bubbles.burst(p.x, p.y + 1, p.z, 16, 1, 1.5, 0.2)
        if (!this.met('humpback')) this.talk(L.whales.song, { once: 'song' })
      } else if (this.whale) {
        this.whale.slap()
        this.met(this.whale.kind === 'grey' ? 'grey-whale' : 'humpback')
      }
      return
    }
    if (id?.startsWith('orca:')) {
      const r = this.orcas.find((o) => `orca:${o.o.who}` === id)
      if (r) {
        if (!this.listening) r.o.jump()
        else r.o.happy()
        orcaCall(r.o.who === 'baby')
        if (!this.met('orca') && r.o.who === 'grandma') this.talk(L.whales.grandma, { once: 'grandma' })
      }
      return
    }
    if (id?.startsWith('lion:')) {
      const s = this.lions[+id.slice(5)]
      s.poke()
      bark()
      if (Math.random() < 0.5) s.slide()
      this.met('sea-lion')
      return
    }
    if (id === 'eagle') {
      this.eagle.poke()
      screech()
      this.met('bald-eagle')
      return
    }
    if (id === 'puffin') {
      this.puffin.poke()
      tone(900, 700, 0.15, 0.05, 'square')
      this.met('puffin')
      return
    }
    if (id === 'stars') {
      this.stars.poke()
      twinkle()
      this.met('sea-star')
      return
    }
    if (id?.startsWith('seal:')) {
      const s = this.seals[+id.slice(5)]
      if (!s.busy) s.poke()
      grunt()
      this.met('harbour-seal')
      return
    }
    if (id === 'raven') {
      if (!this.raven.busy) this.raven.poke()
      this.met('raven')
      return
    }
    if (id === 'surfer') {
      if (!this.surfer.busy) this.surfer.poke()
      return
    }
    if (id === 'lighthouse') {
      this.beamSpin = 3
      foghorn()
      return
    }
    // The water.
    if (this.listening) {
      if (this.below) {
        const p = this.ray(x, y).ray.at(8, tmp)
        this.bubbles.burst(p.x, p.y, p.z, 14, 0.8, 1.2, 0.18)
        growl()
      }
      return
    }
    const p = this.waterPoint(x, y, tmp)
    if (!p) return
    if (Math.hypot(p.x - KELP.x, p.z - KELP.z) < KELP.r) noise(0.25, 0.08, 'bandpass', 600, 300, 0, 1.2)
    this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 1, 1.2)
    this.spray.burst(p.x, 0.05, p.z, 6, 1, 1.8, 0.1)
    if (this.mode === 'finger') {
      // A tap on the water: the boat goes there by itself and stops.
      const q = { x: p.x, z: p.z }
      keepOff(q, 3)
      this.d.goto(q.x, q.z)
      this.counts.steers++
    } else noise(0.1, 0.08, 'bandpass', 1600, 800)
  }

  // ---------------------------------------------------------------- the hint: how to steer, and which way

  private drawHint(t: number) {
    const idle = t - this.lastTouch
    const show = this.section !== 'story' && this.doneT < 0 && !this.listening && !this.finger && !this.d.driven && ((this.counts.steers === 0 && idle > 2.4) || idle > HINT_S)
    if (this.mode === 'wheel') {
      this.wheel.hint(this.steerHintEl, show, t, WHEEL.reach)
      if (this.hintEl && this.hintEl.style.display !== 'none') this.hintEl.style.display = 'none'
      return
    }
    const el = this.hintEl
    if (!el) return
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!show) return
    // Press on the water the way to go: toward the sleepy otter, the spout, or just ahead.
    const d = this.d
    const goal = this.section === 'otters' && this.activeDrifter ? this.activeDrifter.o.root.position : this.spot ? tmp2.set(this.spot.x, 0, this.spot.z) : null
    let a = d.heading
    if (goal) a = Math.atan2(goal.x - d.x, goal.z - d.z)
    const off = clamp(wrap(a - d.heading), -0.9, 0.9)
    const p = this.toScreen(tmp.set(d.x + Math.sin(d.heading + off) * 14, 0, d.z + Math.cos(d.heading + off) * 14))
    const x = clamp(p.x, 60, this.w - 60)
    const y = clamp(p.y, this.h * 0.25, this.h - 120)
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
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
    const close = (o: Object3D, d: number) => (o.getWorldPosition(tmp3).distanceTo(cam) < d ? o : null)
    const under = this.below
    const above = (o: Object3D | null) => (under ? null : o)
    for (const [id, el] of this.anchorEls) {
      if (this.section === 'story') {
        if (el.style.display !== 'none') el.style.display = 'none'
        continue
      }
      if (id === 'boat') place(el, above(this.boat.maple), this.boat.height, 1.1)
      else if (id === 'mic') place(el, this.mic > 0.5 || !under ? this.boat.mic : null, 0.5, 2.4)
      else if (id === 'otters') place(el, above(close(this.raft[1].root, 70)), 0.8, 3.2)
      else if (id === 'drifter') {
        const dr = this.activeDrifter
        place(el, above(dr && dr.o.root.visible ? close(dr.o.root, 60) : null), 0.8, 2.4)
      } else if (id === 'whale') {
        const w = this.listening ? (this.hump.root.visible ? this.hump.body : null) : this.whale?.up ? this.whale.body : null
        place(el, w, 2, 1.2)
      } else if (id.startsWith('orca:')) {
        const r = this.orcas.find((o) => `orca:${o.o.who}` === id)!
        place(el, this.orcaIn ? r.o.body : null, 1.4, 1.2)
      } else if (id.startsWith('lion:')) place(el, above(close(this.lions[+id.slice(5)].root, 70)), 0.9, 1.5)
      else if (id === 'eagle') place(el, above(close(this.eagle.root, 90)), 1, 1.4)
      else if (id.startsWith('seal:')) place(el, above(close(this.seals[+id.slice(5)].root, 70)), 0.7, 1.8)
      else if (id === 'raven') place(el, above(close(this.raven.root, 70)), 0.6, 2)
      else if (id === 'puffin') place(el, above(close(this.puffin.root, 70)), 0.6, 2)
      else if (id === 'stars') place(el, above(close(this.stars.root, 60)), 0.6, 2)
      else if (id === 'surfer') place(el, above(close(this.surfer.root, 90)), 1.6, 1.2)
      else if (id === 'lighthouse') place(el, above(close(this.lighthouseSpot(), 120)), 10, 0.8)
      el.style.zIndex = id === 'boat' || id === 'mic' ? '3' : id === 'drifter' || id === 'whale' || id.startsWith('orca:') ? '2' : '1'
    }
  }

  private lighthouseAnchor = new Group()
  private lighthouseSpot() {
    if (!this.lighthouseAnchor.parent) {
      this.lighthouseAnchor.position.set(LIGHTHOUSE.x, 4, LIGHTHOUSE.z)
      this.scene.add(this.lighthouseAnchor)
    }
    return this.lighthouseAnchor
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const d = this.d
    const sc = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const dr = this.activeDrifter
    return {
      section: this.section,
      steer: this.mode,
      x: +d.x.toFixed(2),
      z: +d.z.toFixed(2),
      heading: Math.round(wrap(d.heading) * DEG),
      speed: +d.speed.toFixed(2),
      air: +d.y.toFixed(2),
      travel: +this.travel.toFixed(1),
      listening: this.listening,
      below: this.below,
      homed: this.homed,
      drifter: dr ? dr.state : 'none',
      drifterAt: dr ? sc(tmp2.set(dr.x, 0, dr.z)) : null,
      raftAt: sc(tmp2.set(RAFT.x, 0, RAFT.z)),
      found: this.found,
      spot: this.spot ? sc(tmp2.set(this.spot.x, 0, this.spot.z)) : null,
      whaleUp: !!this.whale?.up,
      orcas: this.orcaIn,
      orcaJumps: this.jumps,
      soaked: this.boat.soaked,
      story: this.section === 'story',
      done: this.doneT >= 0,
      boat: sc(tmp2.set(d.x, 0.5, d.z)),
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
