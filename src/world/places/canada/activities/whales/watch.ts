// Whale Peek-a-Boo (planning/around-the-world/canada-round-2.md, section 3; the whales chapter of Maple's Team): a
// whale's spout blew Ollie's lucky rock out to sea off Tofino. Maple's little boat is out on the Pacific with Ollie on
// the rope behind it; bubbles come up near the boat, she touches them and a whale comes up right there (peek-a-boo!),
// and then the whale is the toy. Sparkle gives the few instructions (events.say; WhaleWatch.tsx speaks them), Maple
// and Ollie react in their own voices (lines.ts, L.whales). Every animal she pokes goes into Maple's book (book/met.ts).
//
// The verb: touch the bubbles, then play with the whale that comes up. It grows three times:
//   grey      the grey whale (whale.ts): tap the blowhole and the spout comes down all over Maple (a soaked face each
//             time; the second one in close-up); rub or tap its back and it rolls over and waves a flipper; tap the
//             barnacles and it laughs bubbles; tap the tail and it slaps the water, hold it and it pushes the boat.
//             After a while Ollie asks if it has seen her rock: it lifts its tail, and there's a sea star on it.
//   humpback  press and hold the humpback: it sinks and the bubbles grow; let go and it jumps. A longer hold is a bigger
//             jump, a bigger wave and a sillier Maple (her three soaked faces, characters/closeup.ts); the biggest lands
//             the boat on its back for a short ride. The yellow microphone: it sings into it.
//   orcas     the orca family; the baby pops straight up beside the boat with the rock on its nose (orcas do look
//             around like that), here, then there, giggling; each pop is longer, the third stays until she taps it.
//             Then Grandma comes up, one look, and the baby flicks the rock to Ollie. All the whales jump together.
//
// The boat still goes where she holds the water (engine3d/drive.ts, the canoe's control), but nothing is far away and
// nothing needs steering: left alone (about 6 s), each whale comes to her, and the camera pulls back to hold the boat
// and the whale together. It never fails: every tap and hold does something; the baby's pops only get easier, and
// when she leaves the last one alone it swims to the boat and boops it. Ollie rides on the rope from the first second
// and spins at every splash. Feel numbers are knobs (`?feel=1`): hold time to jump height, wave size, the pops,
// bubble distance.
//
// Built for engine3d/View3D.tsx; nothing here comes from Thailand. The sea is the shared engine3d/water.ts and the coast
// the one the films use (coast.ts).
import { Color, Fog, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, RingGeometry, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, sounds, spendHint, type Line, Timers } from '../../../../../sdk'
import { knobs } from '../../../../kit/knobs'
import { sfx } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Letterbox } from '../../../../engine3d/cinema'
import { Bag } from '../../../../engine3d/dispose'
import { Driver, type Feel } from '../../../../engine3d/drive'
import { FilmPlayer, type Film, type FilmShot, type FilmState } from '../../../../engine3d/film'
import { blobShadow } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { swell, Water } from '../../../../engine3d/water'
import { damp, wrapAngle } from '../../../../../sdk/math'
import { meet } from '../../book/met'
import { sillyBeat } from '../../characters/closeup'
import { twinkle } from '../../characters/rock'
import { L } from '../../lines'
import { Boat, BOAT_LEN } from './boat'
import { Bubbles } from './bubbles'
import { buildCoast, SKY, type Coast } from './coast'
import { Clouds, Gulls, SeaLion } from './critters'
import { Juggle, Ollie } from './ollie'
import { keepOff, open, KELP } from './sea'
import type { WhaleSection } from './sections'
import { whaleSfx } from './sounds'
import { GreyWhale, Humpback, noteMesh, Orca, type Whale } from './whale'

const FILE = 'src/world/places/canada/activities/whales/watch.ts'
/** The play: the feel lab's sliders (?feel=1). */
const PLAY = knobs('whales', 'Whale Peek-a-Boo', FILE, {
  holdFull: { value: 2.2, min: 0.6, max: 5, step: 0.1, label: 'Hold for the biggest jump', unit: 's', note: 'how long she holds the humpback down for its biggest jump (and the ride)' },
  easier: { value: 0.4, min: 0, max: 1.5, step: 0.05, label: 'Easier after each jump', unit: 's', note: 'the biggest jump needs this much less holding after every jump' },
  grow: { value: 0.22, min: 0, max: 0.6, step: 0.02, label: 'Taps grow too', note: 'each jump after the first is this much bigger anyway (0..1 of the biggest), so taps alone reach the ride' },
  height: { value: 1, min: 0.3, max: 2, step: 0.05, label: 'Jump height', unit: '×', note: 'how high the humpback jumps for the same hold' },
  wave: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Wave size', unit: '×', note: 'how hard the jump\'s wave rocks the boat' },
  pop1: { value: 1.5, min: 0.5, max: 5, step: 0.1, label: 'Baby\'s first pop', unit: 's', note: 'how long the baby orca stays up the first time' },
  pop2: { value: 3, min: 1, max: 8, step: 0.1, label: 'Baby\'s second pop', unit: 's', note: 'the second time (the third stays until she taps it)' },
  boop: { value: 16, min: 6, max: 40, step: 1, label: 'Baby helps after', unit: 's', note: 'the last pop left alone this long: the baby swims to the boat and boops it' },
  near: { value: 4.75, min: 3.5, max: 12, step: 0.25, label: 'Bubbles from', unit: 'm', note: 'the nearest the bubbles come up to the boat' },
  far: { value: 5.75, min: 4, max: 16, step: 0.25, label: 'Bubbles up to', unit: 'm', note: 'the furthest' },
  come: { value: 6, min: 2, max: 20, step: 0.5, label: 'Whale comes by itself', unit: 's', note: 'bubbles left alone this long: the whale comes up anyway' },
})
/** The boat on the drive control (her finger holds the water where it should go). */
const HELM = knobs('whaleHelm', 'The little boat', FILE, {
  top: { value: 5, min: 2, max: 12, step: 0.25, label: 'Top speed', unit: 'm/s', note: 'with her finger far ahead' },
  accel: { value: 3.5, min: 1, max: 12, step: 0.25, label: 'Speeding up', unit: 'm/s²' },
  coast: { value: 0.6, min: 0.05, max: 2, step: 0.05, label: 'Coasting drag', unit: '/s', note: 'how fast it slows when she lets go' },
  turn: { value: 1.4, min: 0.4, max: 3, step: 0.05, label: 'Turn rate', unit: 'rad/s' },
  grip: { value: 2.4, min: 0.5, max: 10, step: 0.1, label: 'Grip' },
  near: { value: 2.5, min: 1, max: 8, step: 0.25, label: 'Crawl when this close', unit: 'm' },
  far: { value: 14, min: 6, max: 40, step: 0.5, label: 'Full speed from', unit: 'm' },
})

export interface WhaleStart {
  section: WhaleSection
  /** The game's own film just played: no hello. */
  filmed?: boolean
  /** A look at one whale on its own (?lab=grey&view=side&move=roll), for checking the models. */
  lab?: { kind: string; view: string; move: string }
}
export interface WhaleEvents {
  /** She reached the next part (the address bar follows). */
  section(s: WhaleSection): void
  /** All the whales jumped together. */
  done(): void
  /** Someone says something (`voice` false: only shown: a hint the budget in sdk/hints.ts keeps quiet). */
  say(line: Line, voice?: boolean): void
  /** Parts done of three (the stars in the top bar). */
  progress(done: number): void
  /** A close-up is on (FilmOverlay), and its words. */
  film(s: FilmState | null): void
  filmLine(l: Line | null): void
}

export const WHALE_ANCHORS: AnchorInfo[] = [
  { id: 'bubbles', label: 'The bubbles', kind: 'thing' },
  { id: 'blowhole', label: "The whale's blowhole", kind: 'thing' },
  { id: 'barnacles', label: "The whale's barnacles", kind: 'thing' },
  { id: 'tail', label: "The whale's tail", kind: 'thing' },
  { id: 'back', label: "The whale's back", kind: 'thing' },
  { id: 'hump', label: 'The humpback whale', kind: 'thing' },
  { id: 'baby', label: 'The baby orca', kind: 'thing' },
  { id: 'grandma', label: 'The grandma orca', kind: 'thing' },
  { id: 'mama', label: 'The mama orca', kind: 'thing' },
  { id: 'ollie', label: 'Ollie the sea otter', kind: 'thing' },
  { id: 'boat', label: "Maple's boat", kind: 'thing' },
  { id: 'mic', label: 'The underwater microphone', kind: 'thing' },
  { id: 'lion', label: 'A sea lion', kind: 'thing' },
]

/** Where the play is: open water between the kelp and the sea lions' rock, the town and its mountains behind. */
const HOME = { x: 6, z: 14 }
/** How far the boat may roam from there (it turns gently back past it). */
const ARENA = 20
/** The camera's angle: from out at sea, looking back at Tofino (degrees; 180 looks toward +z). */
const CAM_YAW = 196
const SECTIONS: WhaleSection[] = ['story', 'grey', 'humpback', 'orcas']
/** Sparkle's spoken hint: after this long with nothing touched (and at most this often). */
const STUCK_S = 8
/** How far the boat sits down into the round of the humpback's back on the ride (m below the ridge). */
const SADDLE_SINK = 0.3
const HINT_EVERY_S = 20
/** Grey whale touches (or seconds) before Ollie asks about her rock. */
const GREY_TOUCHES = 7
const GREY_SECONDS = 34

const tA = new Vector3()
const tB = new Vector3()
const tC = new Vector3()
const UP = new Vector3(0, 1, 0)

type Phase =
  | 'story'
  | 'bubbles' // bubbles are up: touch them (or wait) and the whale comes
  | 'grey' // playing with the grey whale
  | 'ask' // Ollie asks, the tail with the sea star
  | 'hump' // the humpback is up: hold and let go
  | 'ride' // riding on its back
  | 'orcaIn' // the orca family arrives
  | 'peek' // the baby's pops
  | 'pass' // Grandma, the rock back to Ollie
  | 'finale'
  | 'lab'

interface Wave {
  x: number
  z: number
  r: number
  size: number
  hit: boolean
  ring: Mesh
  mat: MeshBasicMaterial
}

export class WhaleWatch implements World3D {
  readonly timers = new Timers()
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private coast: Coast
  private water: Water
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: WhaleSection = 'story'
  private phase: Phase = 'story'
  private phaseT = 0

  // ---- The boat, Maple, Ollie.
  private d: Driver
  private feel: Feel
  private boat: Boat
  private shadow: Mesh
  private marker: Mesh
  private rock = { roll: 0, rollV: 0, pitch: 0, pitchV: 0, lift: 0 }
  private finger: { x: number; y: number; id?: string; t: number; steering: boolean } | null = null
  private ollie: Ollie
  private juggle: Juggle
  private puttT = 0

  // ---- The whales.
  private grey: GreyWhale
  private hump: Humpback
  private grandma: Orca
  private mama: Orca
  private baby: Orca
  private whale: Whale | null = null
  private bubbles: Bubbles
  private spot: { x: number; z: number } | null = null
  private then: (() => void) | null = null
  private side = 1
  private greyTouches = 0
  private faceN = 0
  private blows = 0
  private tailHold = 0
  private backRub = 0
  private holdT = -1
  private jumps = 0
  /** The sizes of jump she has seen in close-up (1..3). */
  private closeups = new Set<number>()
  private ridden = false
  private rideT = 0
  private pops = 0
  private popT = 0
  private popLen = 0
  private babyTaps = 0
  private orcaSwim = 0
  private rockFly: { from: Vector3; to: () => Vector3; t: number; len: number; arc: number; done: () => void } | null = null
  private babyRock = false
  private waves: Wave[] = []
  private notes: { g: Group; t: number; x: number; z: number }[] = []
  private noteN = 0
  private micT = 0
  private micDown = 0
  private doneT = -1
  /** A spout is on its way down onto the boat until then (its soaking, maybe a close-up, follows). */
  private soakUntil = 0

  // ---- Everyone else, and the water's bits.
  private lion: SeaLion
  private gulls: Gulls
  private clouds: Clouds
  private foam: Particles
  private spray: Particles
  private mist: Particles
  private drops: Particles
  private sparkle: Particles
  private fizz: Particles

  // ---- The close-ups.
  private films: FilmPlayer
  private bars = new Letterbox()

  // ---- Talk and hints.
  private lastTouch = 0
  private lastHint = -99
  private said = new Set<string>()
  private talkCool = 0
  private counts = { taps: 0, holds: 0, steers: 0, bubbles: 0, blows: 0, rolls: 0, laughs: 0, slaps: 0, pushes: 0, jumps: 0, rides: 0, sings: 0, pops: 0, babyTaps: 0, pokes: 0, closeups: 0, boops: 0 }
  private stopOcean: () => void
  private gullT = 5
  private lab: WhaleStart['lab'] | undefined

  constructor(
    private renderer: WebGLRenderer,
    start: WhaleStart,
    private events: WhaleEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 140, 700)
    applyBands()
    this.rig.fov = 45
    this.rig.lag = 0.5
    this.rig.camera.far = 1500
    this.lab = start.lab

    this.coast = buildCoast(bag)
    scene.add(this.coast.land)
    this.water = new Water({ size: 1600, deep: '#3E9DB4', shallow: '#62B9C9', haze: SKY, hazeNear: 130, hazeFar: 650 }, bag)
    scene.add(this.water.mesh)

    // ---- The boat, side-on to the camera, the bow toward where the whales come up.
    this.feel = { top: 0, boost: 1.5, accel: 0, coast: 0, turn: 0, grip: 0, near: 0, far: 0, dead: 0.15, lean: 0.12 }
    this.readFeel()
    this.d = new Driver(this.feel)
    this.d.place(HOME.x, HOME.z, Math.PI / 2 + 0.25)
    this.boat = new Boat(bag)
    scene.add(this.boat.root)
    this.shadow = blobShadow(1.2, bag)
    this.shadow.scale.set(1.1, 1, 2.4)
    scene.add(this.shadow)
    this.marker = new Mesh(bag.add(new RingGeometry(1.1, 1.55, 32)), bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.85, depthWrite: false })))
    this.marker.rotation.x = -Math.PI / 2
    this.marker.position.y = 0.05
    this.marker.renderOrder = 3
    this.marker.visible = false
    scene.add(this.marker)

    // ---- Ollie on the rope from the first second (the film put her there); her rock is gone until the baby orca
    // gives it back.
    this.ollie = new Ollie(bag, 1.3)
    scene.add(this.ollie.root)
    this.juggle = new Juggle(this.ollie.actor, bag)
    this.juggle.gone = true
    this.stopOcean = whaleSfx.ocean()

    // ---- The whales.
    this.grey = new GreyWhale(bag)
    this.hump = new Humpback(bag)
    this.grandma = new Orca(bag, 'grandma')
    this.mama = new Orca(bag, 'mama')
    this.baby = new Orca(bag, 'baby')
    for (const w of this.all) scene.add(w.root)
    this.bubbles = new Bubbles(bag)
    scene.add(this.bubbles.root)

    // ---- The sea lion on her rock (she answers a poke), gulls, clouds.
    const l = this.coast.lions[0]
    this.lion = new SeaLion(bag)
    this.lion.root.position.set(l.x, l.y, l.z)
    this.lion.root.rotation.y = l.h
    this.lion.root.scale.setScalar(1.6)
    this.gulls = new Gulls(bag, [
      { x: HOME.x - 8, z: HOME.z + 16 },
      { x: HOME.x + 14, z: HOME.z + 6 },
      { x: HOME.x - 4, z: HOME.z - 10 },
    ])
    this.clouds = new Clouds(bag)
    scene.add(this.lion.root, this.gulls.root, this.clouds.root)

    // ---- Spray, the spouts' mist, the water raining on Maple, sparkles, fizz (bubbles a whale laughs), waves.
    this.foam = new Particles({ kind: 'foam', count: 260, opacity: 0.88 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 320, color: '#EAF8FF', gravity: 12 }, bag)
    this.mist = new Particles({ kind: 'spray', count: 320, color: '#FFFFFF', gravity: 6 }, bag)
    this.drops = new Particles({ kind: 'spray', count: 200, color: '#BFEAFF', gravity: 9 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 140, colors: ['#FFFFFF', '#FFE1F0', '#FFF6B8', '#C9F4FF'], gravity: -0.5 }, bag)
    this.fizz = new Particles({ kind: 'spray', count: 120, color: '#F2FCFF', gravity: -2.5 }, bag)
    scene.add(this.foam.mesh, this.spray.mesh, this.mist.mesh, this.drops.mesh, this.sparkle.mesh, this.fizz.mesh)
    for (let i = 0; i < 3; i++) {
      const mat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, depthWrite: false }))
      const ring = new Mesh(bag.add(new RingGeometry(0.9, 1, 64)), mat)
      ring.rotation.x = -Math.PI / 2
      ring.renderOrder = 2
      ring.visible = false
      scene.add(ring)
      this.waves.push({ x: 0, z: 0, r: 0, size: 0, hit: true, ring, mat })
    }
    for (let i = 0; i < 6; i++) {
      const g = noteMesh(bag)
      g.visible = false
      scene.add(g)
      this.notes.push({ g, t: 9, x: 0, z: 0 })
    }

    this.films = new FilmPlayer({ line: (l) => this.events.filmLine(l), state: (s) => this.events.film(s) })

    // ---- Where the link starts (on the first frame: the screen's shape decides where the bubbles come up).
    this.placeOllie(0, true)
    this.placeBoat(0)
    this.begin = () => {
      if (start.lab) this.startLab(start.lab)
      else if (start.section === 'story' && !start.filmed) this.startStory()
      else if (start.section === 'humpback') this.startHump()
      else if (start.section === 'orcas') this.startOrcas()
      else this.startGrey(!!start.filmed)
    }
  }
  private begin: (() => void) | null = null

  private get all(): Whale[] {
    return [this.grey, this.hump, this.grandma, this.mama, this.baby]
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

  // ---------------------------------------------------------------- talk

  /** A line, unless one was said a moment ago (`once`: only ever once). */
  private talk(line: Line, opts: { once?: string; cool?: number; force?: boolean } = {}) {
    // (A close-up has its own line: nobody talks over it.)
    if (this.films.on && !opts.force) return
    if (opts.once) {
      if (this.said.has(opts.once)) return
      this.said.add(opts.once)
    }
    if (!opts.force && this.time < this.talkCool) return
    this.talkCool = this.time + (opts.cool ?? 1.8)
    this.events.say(line)
  }
  /** A new animal for the book (its card names it): nobody talks over it for a moment. */
  private met(id: Parameters<typeof meet>[0]) {
    const first = meet(id)
    if (first) this.talkCool = this.time + 3.2
    return first
  }
  private touched() {
    this.lastTouch = this.time
  }

  // ---------------------------------------------------------------- the parts

  private enter(s: WhaleSection) {
    if (SECTIONS.indexOf(s) <= SECTIONS.indexOf(this.section) && this.section !== 'story') return
    this.section = s
    this.events.section(s)
  }
  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
  }

  /** From a link or a replay (no film): Ollie on the rope says what happened, then the bubbles. */
  private startStory() {
    this.section = 'story'
    this.setPhase('story')
    this.ollie.actor.pull('sad')
    this.timers.later(() => this.events.say(L.whales.filmIn.took), 500)
  }
  /** The story's over (her tap, or Ollie's line is done). */
  play() {
    if (this.phase !== 'story') return
    this.ollie.actor.cheer()
    this.startGrey(false)
  }

  private startGrey(filmed: boolean) {
    this.enter('grey')
    this.events.progress(0)
    this.offer(this.grey, () => this.raiseGrey())
    // (After the film, Sparkle's one instruction at once; from a link the same line, a beat later.)
    this.timers.later(() => this.talk(L.whales.bubbles, { once: 'bubbles', force: true }), filmed ? 300 : 900)
  }

  private startHump() {
    this.grey.hide()
    this.enter('humpback')
    this.events.progress(1)
    this.offer(this.hump, () => this.raiseHump())
  }

  private startOrcas() {
    this.grey.hide()
    this.hump.hide()
    this.enter('orcas')
    this.events.progress(2)
    this.setPhase('orcaIn')
    this.whale = null
    // Grandma and Mama swim round the boat, their fins up; the baby is somewhere under.
    const yaw = CAM_YAW * (Math.PI / 180)
    for (const [o, a, r] of [
      [this.grandma, -0.45, 8.5],
      [this.mama, 0.5, 10.5],
    ] as const) {
      const ang = yaw + Math.PI + a + Math.sin(a * 3) * 0.35
      o.root.position.set(this.d.x + Math.sin(ang) * r, 0, this.d.z + Math.cos(ang) * r)
      o.root.rotation.y = ang + Math.PI / 2
      o.surfaceNow()
    }
    this.orcaSwim = 0
    whaleSfx.orca()
    this.timers.later(() => this.talk(L.whales.orcaHello, { once: 'orcas', force: true }), 900)
    // The first pop: the baby with the rock on its nose.
    this.timers.later(() => this.nextPop(), 2600)
  }

  // ---- Bubbles: where the next whale will come up.

  /** Bubbles come up near the boat for this whale; touching them (or waiting) calls `then`. */
  private offer(w: Whale, then: () => void, dist?: number) {
    this.setPhase('bubbles')
    this.whale = null
    this.side = -this.side
    const p = this.spotFor(dist ?? PLAY.near + (PLAY.far - PLAY.near) * Math.random(), w.len)
    this.spot = p
    this.then = then
    this.bubbles.at(p.x, p.z)
    this.bubbles.radius = w.len > 5 ? 1.7 : 1.1
    this.bubbles.busy = 1
    this.bubbles.show(true)
    whaleSfx.bubbles()
    // (New bubbles are something new to do: the stuck hint waits its full time from now, not from her last touch.)
    this.lastTouch = this.time
  }

  /** A spot `dist` meters from the boat on the side the camera sees best (beside it on a wide screen, beyond it on a
   *  tall one), on open water. */
  private spotFor(dist: number, len: number) {
    const yaw = CAM_YAW * (Math.PI / 180)
    const right = tA.set(Math.cos(yaw), 0, -Math.sin(yaw))
    const into = tB.set(-Math.sin(yaw), 0, -Math.cos(yaw))
    const d = this.d
    for (let i = 0; i < 12; i++) {
      const side = i % 2 ? -this.side : this.side
      // (Beyond the boat and off to one side, a diagonal: the boat low on the screen, the whale up beside it, so the
      // pair fill the screen's height as well as its width and the camera can come in close.)
      // (On a tall screen its middle sits right beyond the boat, its head to one side: the two stack up the screen.)
      const across = this.tall ? side * len * 0.3 : side * dist * 0.5
      const deep = this.tall ? dist * 0.8 : dist * 0.8 + len * 0.05
      const x = d.x + right.x * across + into.x * deep
      const z = d.z + right.z * across + into.z * deep
      if (open(x, z, len * 0.6 + 2) && Math.hypot(x - HOME.x, z - HOME.z) < ARENA + 6) {
        this.side = side
        return { x, z }
      }
      dist = Math.max(PLAY.near, dist - 0.5)
    }
    return { x: d.x + right.x * this.side * dist, z: d.z + right.z * this.side * dist }
  }

  /** The bubbles were touched (or waited for): the whale comes. */
  private popBubbles() {
    if (this.phase !== 'bubbles' || !this.then) return
    const f = this.then
    this.then = null
    this.bubbles.show(false)
    f()
  }

  /** Which way a whale lies to play: broadside to the camera with its head to the right of the screen (`lie` +1) or
   *  the left, turned a little toward the camera (a three-quarter view: its face shows, and its tail, back, barnacles
   *  and blowhole spread out along it instead of stacking up end-on). */
  private faceFor(lie: number) {
    const yaw = CAM_YAW * (Math.PI / 180)
    return Math.atan2(Math.cos(yaw) * lie + Math.sin(yaw) * 0.45, -Math.sin(yaw) * lie + Math.cos(yaw) * 0.45)
  }
  /** Which way the whale that's up lies (see faceFor). */
  private lie = 1

  /** Puts a whale up at the spot (its head where the bubbles were), lying for play (`faceFor`), looking at the boat:
   *  on a wide screen its head toward the boat beside it; on a tall one, lying right across beyond the boat, its head
   *  where the bubbles were. */
  private raise(w: Whale) {
    const s = this.spot ?? { x: this.d.x + 7, z: this.d.z }
    const yaw = CAM_YAW * (Math.PI / 180)
    this.lie = this.tall ? this.side : (this.d.x - s.x) * Math.cos(yaw) - (this.d.z - s.z) * Math.sin(yaw) >= 0 ? 1 : -1
    const h = this.faceFor(this.lie)
    w.root.position.set(s.x - Math.sin(h) * w.len * 0.3, 0, s.z - Math.cos(h) * w.len * 0.3)
    w.root.rotation.y = h
    w.rise()
    this.whale = w
    this.spot = null
    whaleSfx.peek()
    this.splash(s.x, s.z, 0.5)
    this.timers.later(() => this.ollieSpins(), 400)
  }

  private raiseGrey() {
    this.raise(this.grey)
    this.setPhase('grey')
    this.greyTouches = 0
    this.timers.later(() => this.talk(L.whales.whaleUp, { once: 'whaleUp', force: true }), 700)
    this.timers.later(() => this.talk(L.whales.tapWhale, { once: 'tapWhale', force: true }), 2700)
  }

  private raiseHump() {
    this.raise(this.hump)
    this.setPhase('hump')
    this.jumps = 0
    this.timers.later(() => this.talk(L.whales.hold, { once: 'hold', force: true }), 900)
  }

  // ---------------------------------------------------------------- the grey whale

  private greyTouch(kind: 'blowhole' | 'back' | 'barnacles' | 'tail') {
    const g = this.grey
    if (this.phase === 'ask' && !g.doing('show')) {
      // (While Ollie asks, a poke just makes it giggle.)
      g.laugh(0.9)
      whaleSfx.laugh()
      return
    }
    if (this.phase !== 'grey' || g.busy) return
    this.greyTouches++
    if (this.greyTouches === 1) this.met('grey-whale')
    if (kind === 'blowhole') this.greyBlow()
    else if (kind === 'back') {
      g.roll(this.camSide(g))
      this.counts.rolls++
      whaleSfx.roll()
    } else if (kind === 'barnacles') {
      g.laugh(1.8)
      this.counts.laughs++
      whaleSfx.laugh()
      const m = g.zoneAt('barnacles', tA, this.camSide(g))
      for (let i = 0; i < 26; i++) this.fizz.emit(m.x + (Math.random() - 0.5) * 1.4, Math.random() * 0.3, m.z + (Math.random() - 0.5) * 1.4, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 2, (Math.random() - 0.5) * 0.6, 1.1, 0.1 + Math.random() * 0.12)
    } else {
      g.tailUp(false, this.rig.camera.position)
      this.counts.slaps++
      this.timers.later(() => this.talk(L.whales.whaleTail, { once: 'tail' }), 600)
    }
  }

  private greyBlow() {
    const g = this.grey
    g.blow()
    this.blows++
    this.counts.blows++
  }

  /** The spout comes down on the boat: Maple's soaked face (a different one each time; the second in close-up). */
  private soakMaple(size: 1 | 2 | 3, closeup: boolean, say?: Line) {
    const b = this.boat
    whaleSfx.rain()
    this.rainOn(b.root.position.x, b.root.position.z, 2.2, 110)
    this.ollieSpins()
    if (closeup) this.closeup(size, say)
    else {
      b.mapleRig.soakedFace(size, 2.6)
      if (say) this.timers.later(() => this.talk(say), 300)
    }
  }

  /** Ollie asks; the grey whale shows its tail, and the sea star on it; then it dives. */
  private greyAsk() {
    this.setPhase('ask')
    this.talk(L.whales.seenRock, { force: true })
    this.grey.look = this.ollie.root.position
    this.timers.later(() => {
      this.grey.tailUp(true, this.rig.camera.position)
      whaleSfx.roll()
    }, 2000)
    this.timers.later(() => this.talk(L.whales.whaleTail, { force: true }), 2700)
    this.timers.later(() => {
      this.talk(L.whales.seaStar, { force: true })
      whaleSfx.giggle()
      this.ollieSpins(true)
    }, 4300)
    this.timers.later(() => {
      this.grey.dive()
      whaleSfx.roll()
    }, 6900)
    this.timers.later(() => this.startHump(), 9400)
  }

  // ---------------------------------------------------------------- the humpback

  private holdHump(on: boolean) {
    const h = this.hump
    if (this.phase !== 'hump' || h.jumping || this.films.on) {
      // (Let go while something else was on: the whale comes back up as it was.)
      if (!on && this.holdT >= 0) {
        h.hold(false)
        this.bubbles.show(false)
      }
      if (!on) this.holdT = -1
      return
    }
    if (on) {
      if (this.holdT >= 0) return
      this.holdT = 0
      this.counts.holds++
      h.hold(true)
      this.bubbles.at(h.root.position.x, h.root.position.z)
      this.bubbles.radius = 1.4
      this.bubbles.show(true)
      if (this.jumps === 0) this.met('humpback')
    } else if (this.holdT >= 0) {
      // (Easier after every jump: the biggest needs less holding, and even a quick tap jumps a little higher each
      // time, so a child who only taps still gets the ride.)
      const full = Math.max(0.6, PLAY.holdFull - PLAY.easier * this.jumps)
      this.jump(clamp(this.holdT / full + PLAY.grow * Math.max(0, this.jumps - 1)))
      this.holdT = -1
    }
  }

  private jump(size: number) {
    const h = this.hump
    h.hold(false)
    this.jumpSize = clamp(size * PLAY.height, 0.1, 1)
    h.jump(this.jumpSize)
    this.bubbles.show(false)
    whaleSfx.whoosh()
    this.jumps++
    this.counts.jumps++
    this.touched()
    // (What she gets for it: the size of the splash, the wave, and Maple's face.)
    const tier: 1 | 2 | 3 = size < 0.4 ? 1 : size < 0.85 ? 2 : 3
    this.pendingTier = tier
    if (this.jumps === 1) this.timers.later(() => this.talk(L.whales.breach, { force: true }), 700)
    else if (this.jumps === 2) this.timers.later(() => this.talk(L.whales.humpback), 700)
  }
  private pendingTier: 1 | 2 | 3 = 1
  /** The humpback's jump now (0..1, for the camera). */
  private jumpSize = 0
  private sinkT = 0

  /** The jump's wave reached the boat: it rocks, the spray comes down on everybody, Maple's face for the size. */
  private waveHits(size: number) {
    const tier = this.pendingTier
    this.rock.rollV += (Math.random() < 0.5 ? -1 : 1) * (1.2 + 2.6 * size) * PLAY.wave
    this.rock.pitchV -= (0.8 + 1.6 * size) * PLAY.wave
    this.rock.lift = 0.35 * size * PLAY.wave
    whaleSfx.wave()
    sfx.thump()
    // A size she hasn't seen in close-up gets one; the biggest jump's ride follows it.
    const close = tier >= 2 && !this.closeups.has(tier)
    const ride = tier === 3 && !this.ridden
    if (ride) this.afterFilm = () => this.timers.later(() => this.startRide(), 300)
    this.soakMaple(tier, close)
    if (ride && !close) {
      this.afterFilm = null
      this.timers.later(() => this.startRide(), 1400)
    }
  }
  private afterFilm: (() => void) | null = null

  /** The boat on the whale's back: it comes up under them and swims a little loop, then lets them float again. */
  private startRide() {
    if (this.ridden) return
    this.ridden = true
    this.setPhase('ride')
    this.counts.rides++
    const h = this.hump
    const d = this.d
    d.stop()
    // Under the boat, its back where the boat is, heading the way the boat heads.
    h.root.position.set(d.x, 0, d.z)
    h.root.rotation.y = d.heading
    const sd = h.saddle(tA)
    h.root.position.set(d.x - Math.sin(d.heading) * sd.z, 0, d.z - Math.cos(d.heading) * sd.z)
    h.carry()
    this.rideT = 0
    whaleSfx.whoosh()
    this.timers.later(() => this.talk(L.whales.ride, { force: true }), 1400)
  }

  /** The mic goes down; the humpback (if it's up) sings into it. */
  private sing() {
    this.micT = 4
    this.counts.sings++
    whaleSfx.song()
    const h = this.hump
    if (this.whale === h && h.isUp && !h.busy) {
      h.sing()
      this.talk(L.whales.song, { once: 'song' })
    } else whaleSfx.orca(true)
  }

  // ---------------------------------------------------------------- the orcas

  /** The baby pops up at the next spot (bubbles first), each pop longer; the third waits for her. */
  private nextPop() {
    if (this.phase === 'pass' || this.phase === 'finale') return
    this.pops++
    this.setPhase('bubbles')
    this.side = -this.side
    // (Close, but clear of the boat's bow: nearer, the bow hid half the baby.)
    const p = this.spotFor(PLAY.near + 0.25, 3)
    this.spot = p
    this.bubbles.at(p.x, p.z)
    this.bubbles.radius = 1
    this.bubbles.show(true)
    whaleSfx.bubbles()
    this.then = () => this.popBaby()
    // (Bubbles for a moment, then up it comes, whether she tapped them or not.)
    this.timers.later(() => this.popBubbles(), 1300)
  }

  private popBaby() {
    const b = this.baby
    const s = this.spot!
    b.root.position.set(s.x, 0, s.z)
    b.root.rotation.y = Math.atan2(this.d.x - s.x, this.d.z - s.z)
    b.pop()
    this.whale = b
    this.spot = null
    this.babyRock = true
    this.setPhase('peek')
    this.counts.pops++
    this.popT = 0
    this.popLen = this.pops === 1 ? PLAY.pop1 : this.pops === 2 ? PLAY.pop2 : Infinity
    whaleSfx.peek()
    whaleSfx.babyGiggle()
    this.splash(s.x, s.z, 0.3)
    this.ollieSpins()
    // (Ollie sees her rock at the first pop; Sparkle says what to do as the second comes up, while it's there.)
    if (this.pops === 1) this.timers.later(() => this.talk(L.whales.babyHas, { force: true }), 300)
    if (this.pops === 2) this.talk(L.whales.peek, { once: 'peek', force: true })
  }

  /** She tapped the baby (or it booped the boat): it tosses the rock up and catches it; the third time, Grandma. */
  private tapBaby() {
    const b = this.baby
    if (this.phase !== 'peek' || !b.popped || this.rockFly) return
    this.babyTaps++
    this.counts.babyTaps++
    b.nod()
    whaleSfx.babyGiggle()
    whaleSfx.toss()
    b.laugh(1)
    this.met('orca')
    const from = b.noseAt(new Vector3()).add(tA.set(0, 0.15, 0))
    this.rockFly = {
      from,
      to: () => this.baby.noseAt(tB).add(tC.set(0, 0.15, 0)),
      t: 0,
      len: 1.1,
      arc: 2.6,
      done: () => {
        whaleSfx.clack()
        if (this.pops >= 3) this.grandmaComes()
      },
    }
  }

  private grandmaComes() {
    this.setPhase('pass')
    const g = this.grandma
    const b = this.baby
    // Up beside the baby, one look at it (and at the rock).
    const bp = b.root.position
    // (A little further off and well to one side across the screen, away from the boat's side: straight behind, she
    // stood in a column with the baby and hid behind it.)
    const yaw = CAM_YAW * (Math.PI / 180)
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)
    const out = (bp.x - this.d.x) * rx + (bp.z - this.d.z) * rz >= 0 ? 1 : -1
    g.root.position.set(bp.x + rx * out * 3.4 - Math.sin(yaw) * 1.6, 0, bp.z + rz * out * 3.4 - Math.cos(yaw) * 1.6)
    g.root.rotation.y = Math.atan2(bp.x - g.root.position.x, bp.z - g.root.position.z)
    g.pop()
    whaleSfx.peek()
    whaleSfx.orca()
    this.splash(g.root.position.x, g.root.position.z, 0.45)
    this.timers.later(() => this.talk(L.whales.grandma, { force: true }), 700)
    // The baby flicks the rock to Ollie.
    this.timers.later(() => {
      b.nod()
      whaleSfx.toss()
      const from = b.noseAt(new Vector3()).add(tA.set(0, 0.15, 0))
      this.rockFly = {
        from,
        to: () => this.ollie.actor.rig.body.localToWorld(tB.set(0, 0.36 * this.ollie.actor.height, 0.3 * this.ollie.actor.height)),
        t: 0,
        len: 1.4,
        arc: 3.2,
        done: () => this.rockBack(),
      }
      this.babyRock = false
    }, 3600)
  }

  /** Ollie has her rock again: she juggles it; all the whales jump together. */
  private rockBack() {
    this.juggle.gone = false
    this.juggle.on = true
    this.juggle.height = 0.45
    whaleSfx.clack()
    whaleSfx.giggle()
    this.ollie.actor.cheer()
    this.ollie.actor.pull('happy')
    const p = this.ollie.root.position
    this.sparkle.burst(p.x, 0.8, p.z, 30, 2, 2.6, 0.18)
    sounds.correct()
    this.talk(L.whales.gotIt, { force: true })
    this.timers.later(() => {
      this.baby.drop()
      this.grandma.drop()
    }, 1500)
    this.timers.later(() => this.finale(), 2800)
  }

  private finale() {
    this.setPhase('finale')
    this.doneT = 0
    this.events.progress(3)
    // Everybody round the boat, out of the water together.
    const d = this.d
    // (Fanned wide round the far side of the boat from the camera, so nobody's behind it and no two arcs cross: the big
    // two at the ends and furthest off, the baby in front, nearest. Not so wide the camera has to back off till
    // they're small: on a tall screen narrower and deeper.)
    const who: [Whale, number, number][] = [
      [this.grey, -0.95, 9],
      [this.mama, -0.45, 7.5],
      [this.grandma, 0.05, 8.5],
      [this.baby, 0.45, 5.5],
      [this.hump, 0.95, 10],
    ]
    const yaw = CAM_YAW * (Math.PI / 180)
    for (const [w, a, r0] of who) {
      const ang = yaw + Math.PI + a * (this.tall ? 0.6 : 1)
      const r = r0 + (this.tall ? 2 : 0)
      w.root.position.set(d.x + Math.sin(ang) * r, 0, d.z + Math.cos(ang) * r)
      // (Facing the boat, side by side like spokes: they jump toward it, and float there looking at everybody after.)
      w.root.rotation.y = ang + Math.PI
      w.hide()
    }
    this.timers.later(() => {
      for (const [w] of who) {
        if (w instanceof Orca) w.jump()
        else if (w instanceof Humpback) w.jump(0.6)
        else w.leap()
      }
      whaleSfx.whoosh()
    }, 300)
    this.timers.later(() => {
      this.boat.cheer()
      this.ollieSpins(true)
      sounds.fanfare()
    }, 1500)
    this.timers.later(() => this.talk(L.whales.finale, { force: true }), 2200)
    this.events.done()
  }

  // ---------------------------------------------------------------- the close-up

  /** Maple's soaked face in close-up (characters/closeup.ts's beat, framed from the side of the boat that's open). */
  private closeup(size: 1 | 2 | 3, say?: Line) {
    const b = this.boat
    const m = b.mapleRig
    this.closeups.add(size)
    this.counts.closeups++
    // She turns to the side of the boat nearer the play camera.
    const h = this.d.heading
    const left = tA.set(Math.cos(h), 0, -Math.sin(h))
    const cam = this.rig.camera.position
    const side = (cam.x - this.d.x) * left.x + (cam.z - this.d.z) * left.z >= 0 ? 1 : -1
    m.turn = (side * Math.PI) / 2
    const dir = new Vector3(left.x * side, 0, left.z * side)
    const across = new Vector3(-dir.z, 0, dir.x)
    const head = () => m.head(tC)
    const dist = 1.9 * m.height
    const shot: FilmShot = {
      eye: () => m.head(tB).addScaledVector(dir, dist).addScaledVector(across, 0.25).add(UP.clone().multiplyScalar(0.06)),
      look: head,
      fov: 31,
      to: { eye: () => m.head(tB).addScaledVector(dir, dist * 0.82).addScaledVector(across, 0.2).add(UP.clone().multiplyScalar(0.04)) },
      ease: 'out',
      sway: 0.012,
      tall: { fov: 37 },
    }
    const star = { silly: (_f: unknown, s?: number) => m.soakedFace(size, s ?? 2), shake: () => m.shake(), head: (o?: Vector3) => m.head(o), height: m.height }
    const beat = { ...sillyBeat(star, 'soaked', { say, dur: 1.9 }), shot }
    const film: Film = {
      id: `soaked-${size}`,
      beats: [beat],
      finish: () => {
        m.turn = 0
        const f = this.afterFilm
        this.afterFilm = null
        f?.()
      },
    }
    // (A moment for the spray to land first.)
    this.timers.later(() => this.films.play(film, undefined, this.rig.camera), 250)
  }

  /** Skip the close-up (the screen's ⏭). */
  skipFilm() {
    this.films.skip()
  }

  // ---------------------------------------------------------------- the frame

  update(dt: number) {
    if (this.begin) {
      const b = this.begin
      this.begin = null
      b()
    }
    const t = (this.time += dt)
    this.phaseT += dt
    this.readFeel()
    this.water.update(t)
    const cine = this.films.update(dt, this.w / Math.max(1, this.h))
    if (this.films.on) this.lastTouch = t

    if (this.phase !== 'lab') {
      this.steer()
      this.move(dt)
      this.flow(dt, t)
    }
    this.updateWhales(dt, t)
    this.placeBoat(dt)
    this.placeOllie(dt)
    this.updateWater(dt, t)
    this.updateLife(dt, t)
    for (const p of [this.foam, this.spray, this.mist, this.drops, this.sparkle, this.fizz]) p.update(dt)

    this.lights.follow(this.d.x, 0, this.d.z)
    this.rig.setShot(this.shot())
    this.rig.setCine(cine)
    this.rig.update(dt)
    this.bars.update(dt, this.films.on)
    this.drawHint(t)
    this.speakHint(t)
  }

  /** What happens next, by itself: whales coming when she waits, the baby's pops, the ride. */
  private flow(dt: number, t: number) {
    const idle = t - this.lastTouch
    if (this.doneT >= 0) this.doneT += dt
    if (this.phase === 'bubbles' && this.then && this.phaseT > PLAY.come && this.section !== 'orcas') this.popBubbles()
    if (this.phase === 'grey') {
      const g = this.grey
      // Left alone, it does things by itself now and then (a breath, a roll, a wave of its tail).
      if (!g.busy && idle > 5 && this.phaseT > 4 && Math.random() < dt * 0.4) {
        const pick = Math.floor(this.phaseT) % 3
        if (pick === 0) this.greyBlow()
        else if (pick === 1) g.roll(this.camSide(g))
        else g.tailUp(false, this.rig.camera.position)
        this.lastTouch = t - 2.5
      }
      // (Never while a spout is still coming down on Maple or her close-up is on: Ollie would talk over it.)
      if (!g.busy && !this.films.on && t > this.soakUntil && (this.greyTouches >= GREY_TOUCHES || this.phaseT > GREY_SECONDS)) this.greyAsk()
      // The blowhole's spout comes down on the boat: Maple soaked (a different face each time, the second close up).
      if (g.blew) {
        this.soakUntil = t + 1.6
        const hole = g.holeAt(tA)
        this.spout(hole, 1, true)
        this.timers.later(() => {
          // (A different face from the last one each time: the second is the close-up.)
          const n = this.faceN++
          if (this.blows === 1) this.talk(L.whales.whaleBlow, { force: true })
          this.soakMaple(n < 2 || n % 2 ? 1 : 2, n === 1, n === 1 ? L.whales.sneeze : undefined)
        }, 900)
      }
      // Holding the tail: the flukes sweep and the boat glides away a little (Maple wobbles, Ollie spins).
      if (this.tailHold >= 0 && this.finger?.id === 'tail') {
        this.tailHold += dt
        if (this.tailHold > 0.5 && !g.busy) {
          this.tailHold = -1
          g.push()
          this.counts.pushes++
          this.greyTouches++
          this.timers.later(() => {
            const away = tA.set(this.d.x - g.root.position.x, 0, this.d.z - g.root.position.z).normalize()
            this.d.vx += away.x * 3.2
            this.d.vz += away.z * 3.2
            this.boat.wobble()
            this.ollieSpins()
            whaleSfx.slap()
          }, 450)
        }
      }
    }
    if (this.phase === 'hump') {
      const h = this.hump
      // A finger that stays on the blowhole is holding the whale down too (on a phone the blowhole's target covers
      // part of the whale: a press there did nothing but a spout). A quick tap there is still a spout.
      const f = this.finger
      if (f?.id === 'blowhole' && this.holdT < 0 && t - f.t > 0.22) {
        f.id = 'hump'
        this.holdHump(true)
      }
      if (this.holdT >= 0) {
        this.holdT += dt
        // The bubbles grow while she holds it down.
        this.bubbles.at(h.root.position.x, h.root.position.z)
        this.bubbles.radius = 1.4 + 2.4 * clamp(this.holdT / Math.max(0.6, PLAY.holdFull - PLAY.easier * this.jumps))
        this.bubbles.busy = 0.5 + 0.5 * clamp(this.holdT / 2)
        if ((this.sinkT -= dt) <= 0) {
          this.sinkT = 0.12
          whaleSfx.sinking(clamp(this.holdT / 2))
        }
      }
      // Left alone, it jumps by itself: small, bigger, the biggest (and the ride), so waiting gets there too.
      if (this.holdT < 0 && !h.busy && h.isUp && idle > PLAY.come + 1 && this.phaseT > 3 && !this.films.on) {
        this.lastTouch = t
        const size = this.ridden ? 0.5 : Math.min(1, 0.3 + this.jumps * 0.35)
        this.jump(size)
      }
      if (h.splashed && h.splashSize > 0.3) {
        const p = h.body.getWorldPosition(tA)
        this.splash(p.x, p.z, h.splashSize)
        whaleSfx.breach(h.splashSize)
        this.makeWave(p.x, p.z, h.splashSize)
        this.ollieSpins()
      }
    }
    if (this.phase === 'ride') {
      const h = this.hump
      this.rideT += dt
      // A gentle loop with the boat on its back, then down it goes and the boat floats again.
      const d = this.d
      if (this.rideT < 6.5) {
        const v = 1.6 * clamp(this.rideT / 1.5) * (1 - clamp((this.rideT - 5) / 1.5))
        const turn = 0.32
        h.root.rotation.y += turn * dt * clamp(this.rideT / 1.5)
        h.root.position.x += Math.sin(h.root.rotation.y) * v * dt
        h.root.position.z += Math.cos(h.root.rotation.y) * v * dt
        if (Math.random() < dt * 14) {
          const s = Math.random() < 0.5 ? -1 : 1
          const hd = h.root.rotation.y
          this.foam.emit(h.root.position.x + Math.cos(hd) * s * 1.6, 0.03, h.root.position.z - Math.sin(hd) * s * 1.6, 0, 0, 0, 1.4, 1.4)
        }
      } else if (this.rideT > 6.5 && h.doing('carry')) {
        h.release()
        d.place(d.x, d.z, d.heading)
        whaleSfx.slap()
      }
      // Off it swims, and the orcas come.
      if (this.rideT > 8.5 && this.phase === 'ride') {
        h.hide()
        this.setPhase('orcaIn')
        this.timers.later(() => this.startOrcas(), 900)
      }
    }
    if (this.phase === 'orcaIn' || this.phase === 'peek' || this.phase === 'pass' || this.phase === 'bubbles') this.swimOrcas(dt)
    if (this.phase === 'peek') {
      const b = this.baby
      this.popT += dt
      if (this.popT > this.popLen && !this.rockFly) {
        b.drop()
        this.whale = null
        this.timers.later(() => this.nextPop(), 900)
        this.setPhase('orcaIn')
      }
      // The last pop left alone: it swims closer, then boops the boat with its nose (and tosses the rock anyway).
      if (this.pops >= 3 && idle > 8 && b.popped) {
        const p = b.root.position
        const dx = this.d.x - p.x
        const dz = this.d.z - p.z
        const dist = Math.hypot(dx, dz)
        if (dist > 3.6) {
          p.x += (dx / dist) * dt * 0.9
          p.z += (dz / dist) * dt * 0.9
        }
        if (idle > PLAY.boop && !this.rockFly) {
          this.counts.boops++
          this.boat.wobble()
          sfx.boing()
          this.lastTouch = t
          this.tapBaby()
        }
      }
    }
    if (this.phase === 'finale') {
      for (const w of this.all) {
        if (w.splashed) {
          const p = w.body.getWorldPosition(tA)
          this.splash(p.x, p.z, w.splashSize)
        }
      }
      if (this.doneT > 2.4 && this.doneT - dt <= 2.4) {
        whaleSfx.breach(1)
        this.makeWave(this.d.x + 6, this.d.z + 6, 0.4)
      }
    }
  }

  /** Which of a whale's sides the camera sees (+1: its left). */
  private camSide(w: Whale) {
    const c = this.rig.camera.position
    const h = w.root.rotation.y
    // (Its left in the world: +x turned by its heading.)
    return (c.x - w.root.position.x) * Math.cos(h) - (c.z - w.root.position.z) * Math.sin(h) >= 0 ? 1 : -1
  }

  private updateWhales(dt: number, t: number) {
    const boatAt = tC.set(this.d.x, 1, this.d.z)
    for (const w of this.all) {
      if (this.phase !== 'ask' || w !== this.grey) w.look = w === this.baby && this.phase === 'pass' ? this.grandma.root.position : boatAt
      if (w === this.grandma && this.phase === 'pass') w.look = this.baby.root.position
      w.update(dt, t)
      // The water parts round a whale at the surface: foam where its skin meets the water.
      if (w.visible && Math.random() < dt * 30) this.foamAt(w)
    }
    const g = this.grey
    if (g.splashed) {
      const p = g.body.localToWorld(tA.set(0, 0, -g.len * 0.4))
      this.splash(p.x, p.z, g.splashSize)
      if (g.splashSize > 0.5) {
        whaleSfx.slap()
        this.ollieSpins()
      }
    }
    if (this.baby.splashed && this.phase !== 'finale') {
      const p = this.baby.root.position
      this.splash(p.x, p.z, this.baby.splashSize)
    }
    // A whale that's up keeps near the boat (she can drive away, and it follows).
    const w = this.whale
    if (w && w.isUp && !w.busy && this.phase !== 'ride') {
      const p = w.root.position
      const dx = this.d.x - p.x
      const dz = this.d.z - p.z
      const dist = Math.hypot(dx, dz)
      const want = PLAY.near + w.len * 0.45
      if (dist > want + 3) {
        p.x += (dx / dist) * Math.min(2.5, dist - want) * dt
        p.z += (dz / dist) * Math.min(2.5, dist - want) * dt
      }
      // (On a wide screen it keeps its head toward the boat: she drove well round to its other side, it turns round.)
      const yaw = CAM_YAW * (Math.PI / 180)
      if (!this.tall && (dx * Math.cos(yaw) - dz * Math.sin(yaw)) * this.lie < -3) this.lie = -this.lie
      const h = w.root.rotation.y
      w.root.rotation.y += wrapAngle(this.faceFor(this.lie) - h) * damp(dt, 0.8)
    }
    // The rock on the baby's nose (a toss flies up and back down), or flying to Ollie.
    this.flyRock(dt)
  }

  /** The rock: on the baby's nose, or in the air. (Ollie's own juggle is in placeOllie.) */
  private babyRockMesh: Group | null = null
  private flyRock(dt: number) {
    if (!this.babyRockMesh) {
      this.babyRockMesh = this.juggle.rock.clone()
      this.scene.add(this.babyRockMesh)
    }
    const r = this.babyRockMesh
    const f = this.rockFly
    r.visible = (this.babyRock && this.baby.visible) || !!f
    if (f) {
      f.t += dt
      const k = clamp(f.t / f.len)
      const to = f.to()
      r.position.lerpVectors(f.from, to, k)
      r.position.y += Math.sin(Math.PI * k) * f.arc
      r.rotation.x += dt * 9
      if (k >= 1) {
        this.rockFly = null
        f.done()
      }
    } else if (r.visible) {
      // Balanced on the tip of its nose.
      this.baby.noseAt(r.position).add(tA.set(0, 0.17, 0))
    }
    if (r.visible) twinkle(r, this.time, this.rig.camera)
  }

  /** Foam where a whale's skin meets the water. */
  private foamAt(w: Whale) {
    const a = Math.random() * Math.PI * 2
    const s = Math.random()
    const p = w.body.localToWorld(w.hull.at(s, a, 0.05, tA))
    if (Math.abs(p.y) < 0.25) this.foam.emit(p.x, 0.03, p.z, (Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.4, 1.1, 0.5 + Math.random() * 0.5)
  }

  /** A whale's spout: a V (a grey whale has two blowholes) or one bush of mist, drifting toward the boat. */
  private spout(at: Vector3, k: number, v: boolean, reach = 1, high = 5) {
    const toBoat = tB.set(this.d.x - at.x, 0, this.d.z - at.z)
    const dist = toBoat.length()
    toBoat.normalize()
    const sides = v ? [-1, 1] : [0]
    const across = { x: -toBoat.z, z: toBoat.x }
    // (Up about 3 m and over in an arc: it comes down on the boat, the way a fountain would.)
    for (const s of sides)
      for (let i = 0; i < 70 * k; i++) {
        const up = high + Math.random() * high * 0.32
        const flight = (2 * up) / 6
        const over = (dist / flight) * (0.75 + Math.random() * 0.4) * reach
        const fan = v ? 0.9 : high < 4 ? 0.7 : 0.35
        this.mist.emit(at.x, at.y + 0.1, at.z, toBoat.x * over + across.x * s * fan + (Math.random() - 0.5) * 0.5, up, toBoat.z * over + across.z * s * fan + (Math.random() - 0.5) * 0.5, flight + 0.3, 0.14 + Math.random() * 0.16)
      }
    whaleSfx.blow()
  }

  /** Water raining down over a spot (the spout or the wave's spray coming down on the boat). */
  private rainOn(x: number, z: number, r: number, n: number) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.sqrt(Math.random()) * r
      this.drops.emit(x + Math.cos(a) * d, 3 + Math.random() * 2.5, z + Math.sin(a) * d, (Math.random() - 0.5) * 0.6, -2 - Math.random() * 2, (Math.random() - 0.5) * 0.6, 1.1, 0.1 + Math.random() * 0.08)
    }
  }

  private splash(x: number, z: number, k: number) {
    const n = Math.round(10 + 40 * k)
    for (let i = 0; i < 1 + Math.round(k * 2); i++) this.spray.burst(x + (Math.random() - 0.5) * 3 * k, 0.3, z + (Math.random() - 0.5) * 3 * k, n, 2 + 5 * k, 3 + 7 * k, 0.2 + 0.3 * k)
    this.foam.emit(x, 0.03, z, 0, 0, 0, 1.6 + k, 2 + 7 * k)
    if (k > 0.25) whaleSfx.splash()
  }

  /** A wave ring from a jump: it spreads, and when it reaches the boat it rocks it. */
  private makeWave(x: number, z: number, size: number) {
    const wv = this.waves.find((v) => v.hit) ?? this.waves[0]
    wv.x = x
    wv.z = z
    wv.r = 1
    wv.size = size
    wv.hit = false
    wv.ring.visible = true
  }

  private updateWater(dt: number, _t: number) {
    for (const wv of this.waves) {
      if (!wv.ring.visible) continue
      wv.r += dt * (5 + 4 * wv.size)
      const k = clamp(wv.r / 24)
      wv.ring.position.set(wv.x, 0.07, wv.z)
      wv.ring.scale.set(wv.r, wv.r, 1)
      wv.mat.opacity = 0.85 * (1 - k)
      if (!wv.hit && wv.r > Math.hypot(this.d.x - wv.x, this.d.z - wv.z) - 1.5) {
        wv.hit = true
        this.waveHits(wv.size)
      }
      if (k >= 1) {
        wv.ring.visible = false
        wv.hit = true
      }
    }
    // The microphone down on its cable; music notes rise while the humpback sings.
    this.micT = Math.max(0, this.micT - dt)
    this.micDown += ((this.micT > 0 ? 1 : 0) - this.micDown) * damp(dt, this.micT > 0 ? 2 : 3)
    if (this.micT > 0.5 && Math.random() < dt * 2.2) {
      const n = this.notes[this.noteN++ % this.notes.length]
      const m = this.boat.mic.getWorldPosition(tA)
      n.t = 0
      n.x = m.x + (Math.random() - 0.5) * 1.5
      n.z = m.z + (Math.random() - 0.5) * 1.5
      n.g.visible = true
    }
    for (const n of this.notes) {
      if (!n.g.visible) continue
      n.t += dt
      const k = n.t / 2.6
      n.g.position.set(n.x + Math.sin(n.t * 3) * 0.3, 0.5 + n.t * 1.3, n.z)
      n.g.quaternion.copy(this.rig.camera.quaternion)
      n.g.scale.setScalar(0.55 * Math.min(1, n.t * 4) * (1 - Math.max(0, k - 0.75) * 4))
      if (k >= 1) n.g.visible = false
    }
    this.bubbles.update(dt)
    if (this.bubbles.popped && Math.random() < 0.25) whaleSfx.blub()
  }

  // ---------------------------------------------------------------- the boat

  private steer() {
    const d = this.d
    const f = this.finger
    this.marker.visible = false
    if (this.phase === 'story' || this.phase === 'ride' || this.films.on) {
      if (this.phase !== 'ride') d.stop()
      return
    }
    if (f && !f.steering && !f.id && this.time - f.t > 0.25) f.steering = true
    if (f?.steering) {
      const p = this.waterPoint(f.x, f.y, tA)
      if (p) {
        d.hold(p.x, p.z)
        this.marker.visible = true
        this.marker.position.set(p.x, 0.05, p.z)
        this.marker.scale.setScalar(0.9 + Math.sin(this.time * 6) * 0.12)
      }
    }
    const g = d.goal
    if (!f && g && d.driven) {
      this.marker.visible = true
      this.marker.position.set(g.x, 0.05, g.z)
      this.marker.scale.setScalar(0.7)
    }
  }

  private move(dt: number) {
    const d = this.d
    if (this.phase === 'ride') return
    // Near the edge of the play, it turns gently back toward the middle.
    const ox = d.x - HOME.x
    const oz = d.z - HOME.z
    const r = Math.hypot(ox, oz)
    if (r > ARENA - 6) d.heading += wrapAngle(Math.atan2(-ox, -oz) - d.heading) * Math.min(1, dt * 0.9 * ((r - (ARENA - 6)) / 6))
    // Left alone and nearly still, the bow turns slowly toward the whale (so Maple at the wheel looks at it).
    const w = this.whale
    const look = w?.visible ? w.root.position : this.spot ? tB.set(this.spot.x, 0, this.spot.z) : null
    if (look && !d.driven && Math.abs(d.speed) < 0.6) {
      const to = Math.atan2(look.x - d.x, look.z - d.z)
      d.heading += wrapAngle(to - d.heading) * damp(dt, 0.5)
    }
    d.step(dt)
    const p = { x: d.x, z: d.z }
    if (r > ARENA) {
      p.x = HOME.x + (ox / r) * ARENA
      p.z = HOME.z + (oz / r) * ARENA
    }
    const hit = keepOff(p, 2.6) ?? this.keepOffWhale(p)
    d.x = p.x
    d.z = p.z
    if (hit) d.bounce(hit.nx, hit.nz, 0.3)
    // The engine putters while it goes; a little wake.
    const sp = Math.abs(d.speed)
    const k = Math.min(1.3, sp / Math.max(0.1, HELM.top))
    if (k > 0.04 || d.driven) {
      this.puttT += dt
      if (this.puttT > 1 / (3 + 10 * k)) {
        this.puttT = 0
        whaleSfx.engine(k)
      }
    }
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    if (sp > 0.5 && Math.random() < dt * (4 + sp * 3)) for (const s of [-1, 1]) this.foam.emit(d.x - sx * BOAT_LEN * 0.5 + sz * s * 0.9, 0.03, d.z - sz * BOAT_LEN * 0.5 - sx * s * 0.9, sz * s * sp * 0.12, 0, -sx * s * sp * 0.12, 1.3, 0.32 + sp * 0.03)
  }

  /** A whale up in the boat's way: the boat bumps gently off its side. */
  private keepOffWhale(p: { x: number; z: number }): { nx: number; nz: number } | null {
    for (const w of this.all) {
      if (!w.isUp || w === this.baby) continue
      const a = w.body.localToWorld(tA.set(0, 0, w.len * 0.45))
      const b = w.body.localToWorld(tB.set(0, 0, -w.len * 0.45))
      const bx = b.x - a.x
      const bz = b.z - a.z
      const l2 = bx * bx + bz * bz
      const k = l2 > 1e-4 ? clamp(((p.x - a.x) * bx + (p.z - a.z) * bz) / l2) : 0
      const cx = a.x + bx * k
      const cz = a.z + bz * k
      const dx = p.x - cx
      const dz = p.z - cz
      const dist = Math.hypot(dx, dz)
      const r = w.len * 0.16 + 1.6
      if (dist >= r) continue
      const nx = dist > 1e-3 ? dx / dist : 1
      const nz = dist > 1e-3 ? dz / dist : 0
      p.x = cx + nx * r
      p.z = cz + nz * r
      return { nx, nz }
    }
    return null
  }

  private placeBoat(dt: number) {
    const d = this.d
    const t = this.time
    const b = this.boat
    const r = this.rock
    // Springs: the swell rocks it, a wave from a jump slams it.
    const k = 40
    const dmp = 2 * Math.sqrt(k) * 0.3
    r.rollV += ((Math.sin(t * 0.9) * 0.04 - r.roll) * k - r.rollV * dmp) * dt
    r.roll += r.rollV * dt
    r.pitchV += ((Math.sin(t * 1.1 + 1) * 0.03 - r.pitch) * k - r.pitchV * dmp) * dt
    r.pitch += r.pitchV * dt
    r.lift = Math.max(0, r.lift - dt * 0.5)
    const lift = r.lift > 0 ? Math.sin(t * 6) * r.lift * 0.5 + r.lift * 0.5 : 0
    if (this.phase === 'ride' && this.hump.doing('carry')) {
      // On the whale's back: where its saddle is, turned and tipped with it.
      const h = this.hump
      h.body.updateWorldMatrix(true, false)
      const s = h.body.localToWorld(h.saddle(tA))
      d.x = s.x
      d.z = s.z
      d.heading = h.root.rotation.y
      // (Settled down onto the round of its back: the floor over the ridge of its spine, the tubes on its flanks, not
      // perched on the very top with the tubes in the air.)
      b.root.position.set(s.x, Math.max(swell(s.x, s.z, t) * 0.6, s.y - SADDLE_SINK), s.z)
      b.root.rotation.set(0, d.heading, 0)
      b.body.rotation.set(h.body.rotation.x + clamp(r.pitch, -0.12, 0.12), 0, h.body.rotation.z + clamp(r.roll, -0.12, 0.12))
    } else {
      b.root.position.set(d.x, swell(d.x, d.z, t) * 0.6 + lift, d.z)
      b.root.rotation.set(0, d.heading, 0)
      b.body.rotation.set(clamp(r.pitch, -0.45, 0.45), 0, d.roll + clamp(r.roll, -0.45, 0.45))
    }
    this.shadow.position.set(d.x, 0.015, d.z)
    this.shadow.rotation.z = -d.heading
    this.shadow.visible = b.root.position.y < 0.4
    // Maple looks at whatever's most interesting: the whale, the bubbles, the baby, Ollie when she talks.
    let look: Vector3 | null = null
    const w = this.whale
    if (this.phase === 'ask' || this.phase === 'story') look = this.ollie.root.position
    else if (w?.visible) look = tB.copy(w.root.position)
    else if (this.spot) look = tB.set(this.spot.x, 0.5, this.spot.z)
    // (Cheated toward the camera, the way films do: her face shows; in a close-up, straight at it.)
    if (look && look === tB) look.lerp(this.rig.camera.position, 0.45)
    if (this.films.on) look = this.rig.camera.position
    b.update(dt, t, { turn: clamp(d.yawRate / Math.max(0.1, HELM.turn), -1, 1), look, mic: this.micDown })
    if (b.slapped) {
      b.slapped = false
      sfx.thump()
    }
    // Dripping after a soaking.
    if (b.mapleRig.dripping && Math.random() < dt * (b.shaking ? 40 : 10)) {
      const h = b.headAt(tA)
      const a = Math.random() * Math.PI * 2
      const f = b.shaking ? 3 : 0.3
      this.spray.emit(h.x, h.y, h.z, Math.cos(a) * f, b.shaking ? 1.5 : 0, Math.sin(a) * f, 0.6, 0.08)
    }
  }

  /** Ollie on the rope behind the stern, toes back toward the camera; her rock on her tummy once it's back. */
  private placeOllie(dt: number, snap = false) {
    const d = this.d
    const o = this.ollie
    const sx = Math.sin(d.heading)
    const sz = Math.cos(d.heading)
    let rx = d.x - sx * (BOAT_LEN * 0.5 + 1.6)
    let rz = d.z - sz * (BOAT_LEN * 0.5 + 1.6)
    if (this.phase === 'ride') {
      // (Riding along beside the whale on her rope, clear of its tail.)
      const h = this.hump
      const at = h.body.localToWorld(tA.set(this.camSide(h) * 2.6, 0, -1.2))
      rx = at.x
      rz = at.z
    }
    const p = o.root.position
    if (snap) p.set(rx, 0, rz)
    p.x += (rx - p.x) * damp(dt, 3)
    p.z += (rz - p.z) * damp(dt, 3)
    p.y = swell(p.x, p.z, this.time) * 0.6
    // (Toes toward the camera, so her face shows over them; turned a little toward what she's watching.)
    const cam = this.rig.camera.position
    let face = Math.atan2(cam.x - p.x, cam.z - p.z)
    const look = this.whale?.visible ? this.whale.root.position : this.spot ? tA.set(this.spot.x, 0, this.spot.z) : null
    if (look) face += clamp(wrapAngle(Math.atan2(look.x - p.x, look.z - p.z) - face), -0.6, 0.6)
    o.float.face += wrapAngle(face - o.float.face) * damp(dt, snap ? 100 : 1.5)
    o.update(dt, this.time)
    this.juggle.update(dt, this.time, this.rig.camera)
    o.clam.visible = this.juggle.gone
    if (this.juggle.caught) whaleSfx.tick()
    this.boat.rope(o.actor.at(0.42, tB))
  }

  /** Something splashy: Ollie spins on her back and giggles. */
  private ollieSpins(force = false) {
    if (this.ollie.spinning && !force) return
    this.ollie.spin()
    whaleSfx.giggle()
    const p = this.ollie.root.position
    this.spray.burst(p.x, 0.2, p.z, 10, 1.8, 2.6, 0.18)
  }

  private swimOrcas(dt: number) {
    // Grandma and Mama swim to and fro beyond the boat (never between it and the camera), fins up, unless they're
    // popped up.
    this.orcaSwim += dt
    const d = this.d
    const yaw = CAM_YAW * (Math.PI / 180)
    for (const [o, a0, r] of [
      [this.grandma, -0.45, 8.5],
      [this.mama, 0.5, 10.5],
    ] as const) {
      if (!o.visible || o.doing('pop') || o.doing('drop') || this.phase === 'finale') continue
      const a = yaw + Math.PI + a0 + Math.sin(this.orcaSwim * 0.16 + a0 * 3) * 0.35
      const tx = d.x + Math.sin(a) * r
      const tz = d.z + Math.cos(a) * r
      const p = o.root.position
      const dx = tx - p.x
      const dz = tz - p.z
      p.x += dx * damp(dt, 0.8)
      p.z += dz * damp(dt, 0.8)
      if (Math.hypot(dx, dz) > 0.05) o.root.rotation.y += wrapAngle(Math.atan2(dx, dz) - o.root.rotation.y) * damp(dt, 2)
      // (A short bushy puff, not a tall plume: from out here a tall thin one reads as a trail of dots in the sky.)
      if (Math.random() < dt * 0.3) this.spout(o.body.localToWorld(o.hull.at(0.85, 0, 0, tA)), 0.5, false, 0.05, 3.4)
    }
  }

  private updateLife(dt: number, t: number) {
    this.lion.update(dt, t)
    this.gulls.update(dt, t)
    this.clouds.update(dt)
    if ((this.gullT -= dt) <= 0) {
      this.gullT = 10 + Math.random() * 8
      whaleSfx.gulls()
    }
    for (const k of this.coast.kelp) {
      k.top.position.x = KELP.x + Math.sin(t * 0.5 + k.a) * 0.35
      k.top.position.z = KELP.z + Math.cos(t * 0.4 + k.a) * 0.3
      k.top.position.y = Math.sin(t * 1.1 + k.a) * 0.04
    }
    this.coast.beam.rotation.y += dt * 0.6
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const d = this.d
    const tall = this.tall
    if (this.phase === 'lab' && this.lab) return this.labShot()
    // The box, in the camera's own terms (across the screen and away into it, so it fits snugly whichever way things
    // lie): the boat, Ollie on her rope, and whatever's up (the whale from nose to flukes, the bubbles, the orcas).
    const yaw = CAM_YAW * (Math.PI / 180)
    const rx = Math.cos(yaw)
    const rz = -Math.sin(yaw)
    const fx = -Math.sin(yaw)
    const fz = -Math.cos(yaw)
    const box = { a0: Infinity, a1: -Infinity, f0: Infinity, f1: -Infinity, y1: 1.4 }
    const add = (x: number, z: number, r: number, y = 1.4) => {
      const a = x * rx + z * rz
      const f = x * fx + z * fz
      box.a0 = Math.min(box.a0, a - r)
      box.a1 = Math.max(box.a1, a + r)
      box.f0 = Math.min(box.f0, f - r)
      box.f1 = Math.max(box.f1, f + r)
      box.y1 = Math.max(box.y1, y)
    }
    // (The boat end to end, whichever way it points.)
    const bx = Math.sin(d.heading) * BOAT_LEN * 0.45
    const bz = Math.cos(d.heading) * BOAT_LEN * 0.45
    add(d.x + bx, d.z + bz, 1.3, 1.9)
    add(d.x - bx, d.z - bz, 1.3, 1.9)
    const o = this.ollie.root.position
    add(o.x, o.z, 1.2)
    const whole = (w: Whale, y: number) => {
      const h = w.root.rotation.y
      const p = w.root.position
      const l = w.len * 0.5
      add(p.x + Math.sin(h) * l, p.z + Math.cos(h) * l, w.len * 0.1, y)
      add(p.x - Math.sin(h) * l, p.z - Math.cos(h) * l, w.len * 0.15, y)
    }
    const w = this.whale
    // (A breach whole, nose to flukes at the top of it: its middle goes up to 0.8 + 4.2 × the jump's size, nose-up.)
    if (w?.visible) whole(w, this.hump.jumping ? 0.8 + 4.2 * this.jumpSize + 3.4 : w === this.grey && w.busy ? 2.6 : w === this.baby ? 2.4 : 1.8)
    else if (this.spot) add(this.spot.x, this.spot.z, 2.2)
    if (this.phase === 'pass') whole(this.grandma, 2.4)
    if (this.phase === 'finale') for (const f of this.all) whole(f, f === this.hump ? 6.5 : 4.5)
    if (this.phase === 'orcaIn' && this.section === 'orcas') {
      whole(this.grandma, 1.4)
      whole(this.mama, 1.4)
    }
    if (this.phase === 'ride') whole(this.hump, 2.5)
    // (The far end counts for less than the near one: what's further off looks smaller and sits higher anyway, and a
    // deep box would back the camera off. The near edge stays exact, so nothing near the camera is cut off.)
    box.f1 = box.f0 + (box.f1 - box.f0) * (tall ? 0.8 : 0.65)
    const a = (box.a0 + box.a1) / 2
    const f = (box.f0 + box.f1) / 2
    const center = new Vector3(rx * a + fx * f, box.y1 / 2, rz * a + fz * f)
    const half = new Vector3(Math.max(tall ? 3 : 4, (box.a1 - box.a0) / 2), box.y1 / 2 + 0.1, Math.max(1.2, (box.f1 - box.f0) / 2))
    return { center, half, yaw: CAM_YAW, pitch: tall ? 36 : 28, follow: true, minDist: 6, maxDist: 90 }
  }

  render() {
    this.bars.render(this.renderer, this.scene, this.rig.camera, this.w, this.h)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- the lab: one whale, to look at

  private startLab(lab: NonNullable<WhaleStart['lab']>) {
    this.setPhase('lab')
    const w = this.labWhale()
    w.root.position.set(HOME.x, 0, HOME.z)
    w.root.rotation.y = 0
    this.d.place(HOME.x + 12, HOME.z + 6, 0)
    if (lab.move === 'hidden') w.hide()
    else if (w instanceof Orca && lab.move === 'pop') w.pop()
    else w.surfaceNow()
    this.labMove()
  }
  private labWhale(): Whale {
    const k = this.lab!.kind
    return k === 'humpback' ? this.hump : k === 'grandma' ? this.grandma : k === 'mama' ? this.mama : k === 'baby' ? this.baby : this.grey
  }
  private labMove() {
    const w = this.labWhale()
    const m = this.lab!.move
    w.look = this.rig.camera.position
    if (w instanceof GreyWhale) {
      if (m === 'blow') w.blow()
      if (m === 'roll') w.roll(1)
      if (m === 'show') w.tailUp(true, this.rig.camera.position)
      if (m === 'slap') w.tailUp(false, this.rig.camera.position)
      if (m === 'laugh') w.laugh(2)
      if (m === 'dive') w.dive()
      if (m === 'rise') (w.hide(), w.rise())
    } else if (w instanceof Humpback) {
      if (m.startsWith('jump')) w.jump(+m.slice(4) || 1)
      if (m === 'sing') w.sing()
      if (m === 'hold') w.hold(true)
      if (m === 'carry') w.carry()
    } else if (w instanceof Orca) {
      if (m === 'jump') w.jump()
      if (m === 'pop') w.pop()
    }
    if (m && m !== 'hold' && m !== 'carry') this.timers.later(() => this.labMove(), 6000)
  }
  private labShot(): Shot {
    const w = this.labWhale()
    const v = this.lab!.view
    const yaw = v === 'front' ? 0 : v === 'back' ? 180 : v === 'top' ? 90 : v === 'three' ? 40 : v === 'right' ? -90 : 90
    const pitch = v === 'top' ? 80 : v === 'low' ? 4 : 12
    const big = w.len * 0.62
    return { center: new Vector3(HOME.x, this.lab!.move.startsWith('jump') ? 3 : 0.4, HOME.z), half: new Vector3(big, this.lab!.move.startsWith('jump') ? 4.5 : big * 0.4, big), yaw, pitch, follow: true, minDist: 2, maxDist: 80 }
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
    return this.ray(x, y).ray.intersectPlane(this.plane, out)
  }

  pointerDown(x: number, y: number, id?: string) {
    if (this.films.on) return
    this.touched()
    this.finger = { x, y, id, t: this.time, steering: false }
    if (id === 'hump') this.holdHump(true)
    if (id === 'tail') this.tailHold = 0
    if (id === 'back') this.backRub = 0
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.touched()
    const moved = Math.hypot(x - f.x, y - f.y)
    f.x = x
    f.y = y
    // Rubbing the grey whale's back (her finger going to and fro on it): it rolls over.
    if (f.id === 'back') {
      this.backRub += moved
      if (this.backRub > 140) {
        this.backRub = -1e9
        this.greyTouch('back')
      }
      return
    }
    // (A finger dragged off the water's things steers the boat.)
    if (!f.steering && !f.id && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  pointerUp() {
    const f = this.finger
    if (f?.steering) this.d.release()
    if (f?.id === 'hump') this.holdHump(false)
    // (A tail held long enough pushed already; a short one is a tap.)
    this.finger = null
  }

  tap(x: number, y: number, id?: string) {
    if (this.films.on || this.phase === 'lab') return
    this.touched()
    this.counts.taps++
    if (this.phase === 'story') return this.play()
    if (id) this.counts.pokes++
    if (id === 'bubbles') {
      this.counts.bubbles++
      if (this.phase === 'bubbles') this.popBubbles()
      return
    }
    if (id === 'blowhole' || id === 'back' || id === 'barnacles') {
      if (this.whale === this.grey) return this.greyTouch(id)
      if (this.whale === this.hump && id === 'blowhole') return this.humpBlow()
      return
    }
    if (id === 'tail') {
      if (this.tailHold >= 0) this.greyTouch('tail')
      this.tailHold = -1
      return
    }
    if (id === 'hump') return
    if (id === 'baby') return this.tapBaby()
    if (id === 'grandma' || id === 'mama') {
      const o = id === 'grandma' ? this.grandma : this.mama
      if (!o.busy) o.jump()
      whaleSfx.orca()
      this.met('orca')
      return
    }
    if (id === 'ollie') {
      this.ollieSpins(true)
      if (this.juggle.on) this.juggle.height = this.juggle.height > 0.7 ? 0.35 : this.juggle.height + 0.2
      this.talk(Math.random() < 0.5 ? L.whales.otterHi : L.whales.otterClack, { cool: 6 })
      this.met('sea-otter')
      return
    }
    if (id === 'boat') {
      whaleSfx.horn()
      this.boat.wave()
      this.talk(L.whales.toot, { cool: 5 })
      return
    }
    if (id === 'mic') return this.sing()
    if (id === 'lion') {
      this.lion.poke()
      whaleSfx.lions()
      this.met('sea-lion')
      return
    }
    // The water: a splash where she touched, the boat goes there; near the bubbles, it calls the whale.
    const p = this.waterPoint(x, y, tA)
    if (!p) return
    this.foam.emit(p.x, 0.03, p.z, 0, 0, 0, 1, 1.2)
    this.spray.burst(p.x, 0.05, p.z, 6, 1, 1.8, 0.1)
    if (this.spot && Math.hypot(p.x - this.spot.x, p.z - this.spot.z) < 3.5 && this.phase === 'bubbles') {
      this.counts.bubbles++
      return this.popBubbles()
    }
    const q = { x: p.x, z: p.z }
    keepOff(q, 3)
    this.d.goto(q.x, q.z)
    this.counts.steers++
  }

  /** The humpback's blowhole: a tall single bush of a spout. */
  private humpBlow() {
    const h = this.hump
    if (h.busy || this.holdT >= 0) return
    this.spout(h.holeAt(tA), 0.8, false)
    this.timers.later(() => this.soakMaple(this.faceN++ % 2 ? 2 : 1, false), 900)
  }

  // ---------------------------------------------------------------- hints

  /** The hand: on the bubbles, the whale's blowhole, the humpback (pressing), the baby. */
  private drawHint(t: number) {
    const idle = t - this.lastTouch
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    if (!this.films.on && this.phase !== 'lab' && this.doneT < 0) {
      if (this.phase === 'bubbles' && this.spot && idle > 2.5) at = tA.set(this.spot.x, 0.3, this.spot.z)
      else if (this.phase === 'grey' && idle > STUCK_S - 2 && !this.grey.busy) at = this.grey.zoneAt('blowhole', tA)
      else if (this.phase === 'hump' && idle > 3 && this.holdT < 0 && !this.hump.busy) at = this.hump.zoneAt('body', tA)
      else if (this.phase === 'peek' && this.pops >= 3 && idle > 4 && this.baby.popped) at = this.baby.noseAt(tA)
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    const p = this.toScreen(at)
    el.style.transform = `translate3d(${clamp(p.x, 40, this.w - 40).toFixed(1)}px, ${clamp(p.y, this.h * 0.15, this.h - 60).toFixed(1)}px, 0)`
  }

  /** Stuck for a while: Sparkle says it again (the budget in sdk/hints.ts decides if out loud). */
  private speakHint(t: number) {
    if (this.films.on || this.phase === 'lab' || this.doneT >= 0 || this.phase === 'story') return
    if (t - this.lastTouch < STUCK_S || t - this.lastHint < HINT_EVERY_S) return
    const w = L.whales
    const line = this.phase === 'bubbles' ? w.bubblesHint : this.phase === 'grey' ? w.tapWhale : this.phase === 'hump' ? w.hold : this.phase === 'peek' && this.pops >= 3 ? w.peek : null
    if (!line) return
    this.lastHint = t
    this.events.say(line, spendHint(line))
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, size: number) => {
      let show = false
      if (at && !this.films.on && this.phase !== 'lab') {
        const c = this.toScreen(at)
        const s = Math.max(min, Math.min(this.w * 0.4, size))
        show = c.z < 1 && c.x > -s / 2 && c.x < this.w + s / 2 && c.y > -s / 2 && c.y < this.h + s / 2
        if (show) {
          el.style.transform = `translate3d(${(c.x - s / 2).toFixed(1)}px, ${(c.y - s / 2).toFixed(1)}px, 0)`
          el.style.width = el.style.height = `${s.toFixed(0)}px`
        }
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    /** Pixels across `m` meters at a point (how big a thing looks there). */
    const px = (at: Vector3, m: number) => {
      const a = this.toScreen(at)
      const b = this.toScreen(tC.copy(at).addScaledVector(UP, m))
      return Math.abs(a.y - b.y) / Math.max(0.2, Math.cos(22 * (Math.PI / 180)))
    }
    const g = this.grey
    const greyUp = this.whale === g && g.isUp && (this.phase === 'grey' || this.phase === 'ask')
    const h = this.hump
    const humpUp = this.whale === h && h.visible && this.phase === 'hump'
    // The grey whale's four zones, each no bigger than the gap to its nearest neighbour (never under the minimum), so
    // they stay four separate targets.
    const zones = new Map<string, { at: Vector3; size: number }>()
    if (greyUp) {
      const side = this.camSide(g)
      for (const id of ['tail', 'back', 'barnacles', 'blowhole']) {
        const at = id === 'tail' ? g.flukes.getWorldPosition(new Vector3()).setY(Math.max(0.3, g.flukes.getWorldPosition(tA).y)) : g.zoneAt(id, new Vector3(), side)
        zones.set(id, { at, size: px(at, id === 'back' ? 2.4 : id === 'tail' ? 2 : 1.4) })
      }
      const on = [...zones.values()].map((z) => this.toScreen(z.at))
      ;[...zones.values()].forEach((z, i) => {
        const gap = Math.min(...on.filter((_, j) => j !== i).map((o) => Math.hypot(o.x - on[i].x, o.y - on[i].y)))
        z.size = Math.min(z.size, Math.max(min, gap))
      })
    }
    for (const [id, el] of this.anchorEls) {
      let at: Vector3 | null = null
      let size = 0
      if (id === 'bubbles' && this.phase === 'bubbles' && this.spot) {
        at = new Vector3(this.spot.x, 0.2, this.spot.z)
        size = px(at, this.bubbles.radius * 2.6)
      } else if (zones.has(id)) {
        ;({ at, size } = zones.get(id)!)
      } else if (id === 'blowhole' && humpUp && !h.busy) {
        at = h.zoneAt('blowhole', new Vector3())
        size = px(at, 1.3)
      } else if (id === 'hump' && humpUp) {
        at = h.body.getWorldPosition(new Vector3()).setY(Math.max(0.4, h.body.position.y + 0.8))
        size = px(at, 5)
      } else if (id === 'baby' && this.baby.visible && this.phase === 'peek') {
        at = this.baby.body.localToWorld(this.baby.hull.at(0.75, 0, 0, new Vector3()))
        size = px(at, 1.6)
      } else if ((id === 'grandma' || id === 'mama') && (this.section === 'orcas' || this.phase === 'finale')) {
        const o = id === 'grandma' ? this.grandma : this.mama
        if (o.visible) {
          at = o.body.localToWorld(o.hull.at(0.6, 0, 0.3, new Vector3()))
          size = px(at, 1.8)
        }
      } else if (id === 'ollie') {
        at = this.ollie.actor.at(0.4, new Vector3())
        size = px(at, 1.1)
      } else if (id === 'boat') {
        at = this.boat.headAt(new Vector3())
        size = px(at, 1.2)
      } else if (id === 'mic') {
        at = this.boat.mic.getWorldPosition(new Vector3())
        size = px(at, 0.7)
      } else if (id === 'lion') {
        at = this.lion.root.getWorldPosition(new Vector3()).add(tA.set(0, 1, 0))
        size = px(at, 1.6)
      }
      place(el, at, size)
      // (The small zones over the big ones: the blowhole and the barnacles over the back.)
      el.style.zIndex = id === 'blowhole' || id === 'barnacles' || id === 'mic' ? '4' : id === 'tail' || id === 'baby' || id === 'ollie' || id === 'boat' ? '3' : id === 'bubbles' || id === 'hump' ? '2' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (v: Vector3) => (({ x, y, z }) => ({ x: Math.round(x), y: Math.round(y), on: z < 1 && x > 0 && x < this.w && y > 0 && y < this.h }))(this.toScreen(v))
    const w = this.whale
    return {
      section: this.section,
      phase: this.phase,
      film: this.films.now,
      films: { done: this.films.done, skipped: this.films.skipped },
      whale: w?.visible ? w.kind : null,
      whaleAt: w?.visible ? sc(w.root.position.clone().setY(0.6)) : null,
      bubblesAt: this.spot && this.phase === 'bubbles' ? sc(tA.set(this.spot.x, 0.2, this.spot.z)) : null,
      blowholeAt: this.whale === this.grey && this.grey.isUp ? sc(this.grey.zoneAt('blowhole', tA)) : null,
      humpAt: this.whale === this.hump && this.hump.visible ? sc(this.hump.body.getWorldPosition(tA).setY(0.8)) : null,
      babyAt: this.baby.visible ? sc(this.baby.body.localToWorld(this.baby.hull.at(0.75, 0, 0, tA))) : null,
      boat: sc(tA.set(this.d.x, 0.5, this.d.z)),
      boatWorld: [+this.d.x.toFixed(2), +this.boat.root.position.y.toFixed(2), +this.d.z.toFixed(2)],
      ollieAt: sc(this.ollie.actor.at(0.4, tA)),
      holding: this.holdT,
      ridden: this.ridden,
      riding: this.phase === 'ride',
      popN: this.pops,
      rockBack: !this.juggle.gone,
      face: this.boat.mapleRig.sillyNow,
      // Each tap target on screen: its middle and size (null: hidden).
      at: Object.fromEntries([...this.anchorEls].map(([id, el]) => {
        if (el.style.display === 'none') return [id, null]
        const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(el.style.transform)
        const size = parseFloat(el.style.width) || 0
        return [id, m ? { x: Math.round(+m[1] + size / 2), y: Math.round(+m[2] + size / 2), size: Math.round(size) } : null]
      })),
      done: this.doneT >= 0,
      ...this.counts,
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.timers.dispose()
    this.stopOcean()
    this.scene.clear()
    this.bag.dispose()
  }
}
