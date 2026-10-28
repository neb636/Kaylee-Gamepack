// Carnival Snowballs (plan: planning/around-the-world/canada.html): a snowy park below Quebec City's castle hotel, at
// the Winter Carnival. The carnival needs snowmen for its parade; Kaylee rolls snowballs that grow, stacks them
// and dresses them in the carnival's red tuque and woven sash, and they march off in the parade.
//
// The toy (core verb): push a snowball. Her finger lands on a ball and it rolls after her finger, growing with every
// meter and leaving a green stripe of grass behind; let go and it rolls on a little. Big balls roll slower and squish
// down. Drag on bare snow and a new little ball is patted together under her finger. The verb deepens three ways:
//   roll   one little ball by Maple's feet: roll it big. Bump a tree and its snow falls on the ball (a bit bigger).
//   stack  push a ball against another and the smaller one hops on top: three balls make a snowman (coal face, carrot
//          nose, stick arms), every one different and wobbly. Head on the bottom: he stands on his head and says hello
//          upside down. Whenever there's no little ball left, Maple pats a new one.
//   dress  the carnival's hat box and sash box hop into the park: roll a snowball into one and out flies a red tuque or
//          a woven sash, onto a snowman who needs it. Dressed, he wakes up, waves and hops off to the parade line.
// The story: Maple waves from the park and asks for snowmen (tap anywhere skips). Then the parade: tap the drum (it asks, once someone's in the line; at five it starts by itself) and the snowmen march
// past the castle while Maple drums, and the last one waves.
// Silly moments: roll one ball forever and it gets bigger than Maple, so she climbs on top and rides it; balls chase her
// and she hops out of the way; a hat with nobody to wear it lands on Maple.
//
// park.ts has where everything stands, props.ts the park's shapes, castle.ts Old Quebec on the cliff, maple.ts Maple on
// the chibi rig, critters.ts the horse and carriage, the trumpet, the fox and the geese. Maple and the snowmen talk in
// their own voices (lines.ts, L.snowman); Sparkle's instructions and hints come from the page (CarnivalSnowballs.tsx).
// Built for engine3d/View3D.tsx; nothing here comes from Thailand. The push, the growth and the box's aim help are feel-lab knobs (?feel=1), with a graph of her finger
// against the ball.
import { Color, Fog, Group, Plane, Quaternion, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, burst, clamp, say, sounds, span, speakingVoice, speechLevel, stopSpeaking, wait, wobble, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { Carriage, Fox, Geese, honk, Trumpet, whinny, yip } from './critters'
import { BIG_R, BOX_HALF, CASTLE, CLIFF_Y, CLIMB_R, DRUM, HAT_BOX, HUGE_R, keepIn, lineX, MAPLE_START, MOOSE, PARADE_END_X, PARK, PATH_Z, SASH_BOX, SNOWMAN_RS, START, TREE_R } from './park'
import { Maple } from './maple'
import { Box, buildPark, Drum, makeHat, makeSash, Owl, Sled, SKY, Trail, type Park } from './props'
import type { BallSize, SnowmanSection } from './sections'

const FILE = 'src/world/places/canada/activities/snowman/carnival.ts'
/** Her finger pushing a ball. */
const PUSH = knobs('snowPush', 'Pushing a snowball', FILE, {
  follow: { value: 5, min: 1, max: 15, step: 0.25, label: 'Follows her finger', unit: '/s', note: 'how eagerly the ball rolls to her finger (its speed = this × the gap)' },
  speed: { value: 6, min: 1, max: 12, step: 0.1, label: 'Top speed (little ball)', unit: 'm/s', note: 'the fastest a fresh little ball rolls' },
  heavy: { value: 0.55, min: 0, max: 1.5, step: 0.05, label: 'Big balls are slower', note: '0 = every ball as fast; 1 = twice as big, half as fast' },
  grip: { value: 9, min: 1, max: 30, step: 0.5, label: 'Grip', unit: '/s', note: 'how quickly the ball takes up her finger’s speed (low = it lags behind and swings)' },
  coast: { value: 2.4, min: 0.3, max: 8, step: 0.1, label: 'Rolls on after letting go', unit: '/s', note: 'how fast a ball she let go of slows down (lower = rolls further)' },
  grab: { value: 56, min: 0, max: 160, step: 2, label: 'Grab around the ball', unit: 'px', note: 'a finger this far outside the ball’s edge still grabs it' },
})
/** The ball growing as it rolls. */
const GROW = knobs('snowGrow', 'Growing', FILE, {
  rate: { value: 0.06, min: 0.005, max: 0.2, step: 0.005, label: 'Grows', unit: 'm per m', note: 'how much a little ball’s radius grows for every meter it rolls' },
  slow: { value: 0.7, min: 0, max: 2, step: 0.05, label: 'Big ones grow slower', note: '0 = always the same; 1 = twice as big, half the growth' },
  fresh: { value: 0.3, min: 0.15, max: 0.6, step: 0.01, label: 'A new ball', unit: 'm', note: 'the radius of a ball she or Maple pats together' },
  max: { value: 1.75, min: 0.8, max: 3, step: 0.05, label: 'Biggest', unit: 'm', note: 'no ball grows past this radius' },
  squish: { value: 0.12, min: 0, max: 0.3, step: 0.01, label: 'Big ones squish', note: 'how much the biggest balls squash down' },
})
/** Rolling a ball into a box. */
const AIM = knobs('snowAim', 'Into the box', FILE, {
  reach: { value: 2.6, min: 0, max: 6, step: 0.1, label: 'Help from', unit: 'm', note: 'a ball rolling toward a box this close is drawn in' },
  pull: { value: 7, min: 0, max: 20, step: 0.5, label: 'Help', unit: 'm/s²', note: 'how hard it’s drawn toward the box' },
})

export interface SnowStart {
  section: SnowmanSection
  size: BallSize
  /** How many snowmen she has made (dress and parade links). */
  snowmen: number
}
export interface SnowEvents {
  /** She reached the next part (the address bar follows). */
  section(s: SnowmanSection, snowmen: number): void
  /** The parade can start (someone's in the line): the line at the bottom says so. */
  ready(): void
  /** The parade has finished (and the last snowman and Maple have said goodbye). */
  done(): void
  /** She's been stuck a while: Sparkle says how (the hand shows it too). */
  hint(kind: HintKind): void
}
export type HintKind = 'roll' | 'stack' | 'hat' | 'sash' | 'drum'

export const SNOW_ANCHORS: AnchorInfo[] = [
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'owl', label: 'The snowy owl', kind: 'thing' },
  { id: 'castle', label: 'The castle hotel', kind: 'thing' },
  { id: 'slide', label: 'The toboggan slide', kind: 'thing' },
  { id: 'moose', label: 'The ice moose', kind: 'thing' },
  { id: 'hatbox', label: 'The hat box', kind: 'thing' },
  { id: 'sashbox', label: 'The sash box', kind: 'thing' },
  { id: 'drum', label: 'The parade drum', kind: 'thing' },
  { id: 'trumpet', label: 'The carnival trumpet', kind: 'thing' },
  { id: 'carriage', label: 'The horse and carriage', kind: 'thing' },
  { id: 'fox', label: 'The red fox', kind: 'thing' },
  { id: 'geese', label: 'The Canada geese', kind: 'thing' },
]

const ORDER: SnowmanSection[] = ['story', 'roll', 'stack', 'dress', 'parade']
const HINT_S = 8
/** How many loose balls she can have lying around before a drag on bare snow grabs the nearest instead. */
const LOOSE_MAX = 4
/** A snowman's balls sink into each other (and the bottom one into the snow) by this much of their radius. */
const SINK = 0.14
/** The parade starts by itself with this many in the line. */
const PARADE_AUTO = 5
const HOP_S = 0.5

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const tmpPlane = new Plane()
const q = new Quaternion()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

// ---- Sounds (synthesized; the voices are in lines.ts).
const crunch = (r: number) => noise(0.16, 0.05 + r * 0.03, 'bandpass', 900 - r * 280, 500 - r * 120, 0, 1.3)
const pat = () => [0, 0.11, 0.22].forEach((d) => noise(0.07, 0.12, 'bandpass', 1300, 700, d, 1.4))
const hoo = () => [0, 0.45].forEach((d) => tone(420, 360, 0.32, 0.07, 'sine', d))
const giggle = () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(900 + i * 90, 1200 + i * 90, 0.07, 0.05, 'triangle', d))
const boom = () => {
  tone(110, 55, 0.35, 0.22, 'sine')
  noise(0.18, 0.12, 'lowpass', 500, 120)
}
const toot = () => {
  tone(523, 523, 0.18, 0.05, 'sawtooth')
  tone(659, 659, 0.18, 0.05, 'sawtooth', 0.2)
  tone(784, 784, 0.32, 0.05, 'sawtooth', 0.4)
}
const chime = () => [0, 0.08, 0.16].forEach((d, i) => tone(1600 + i * 400, 2200 + i * 400, 0.25, 0.03, 'sine', d))
/** The parade's march, one note per beat (0: a rest). */
const MARCH = [392, 523, 523, 659, 784, 0, 659, 523, 587, 494, 392, 494, 587, 0, 523, 0]

interface Ball {
  r: number
  /** Placed in its pile and scaled by r (and squished). */
  root: Group
  /** Turns as it rolls. */
  spin: Group
}
type PileState = 'loose' | 'hop' | 'stack' | 'done' | 'walk' | 'line' | 'parade'
interface Pile {
  root: Group
  x: number
  z: number
  vx: number
  vz: number
  balls: Ball[]
  state: PileState
  /** Another ball is hopping onto it. */
  busy: boolean
  /** Hopping onto another pile (state 'hop'). */
  onto: Pile | null
  hopT: number
  from: Vector3
  /** Patted together (it pops up). */
  bornT: number
  wob: number
  wobV: number
  face: Group | null
  /** The coal smile (it opens when he talks). */
  mouth: Group | null
  arm: Group | null
  hat: Group | null
  sash: Group | null
  upside: boolean
  /** Dressed: it wakes up, waves, then hops off to the line. */
  wakeT: number
  slot: number
  goal: { x: number; z: number }
  /** Hops toward its goal (walk, parade). */
  stepT: number
  stepFrom: { x: number; z: number }
  stepTo: { x: number; z: number }
  rolled: number
  crunchAt: number
  trailAt: number
  treeCool: number
  bumpCool: number
  still: number
  waveT: number
  /** Cartwheeling over onto his head (0..1). */
  flipT: number
}
interface Flight {
  kind: 'hat' | 'sash'
  g: Group
  from: Vector3
  to: Pile | null
  t: number
}
type MapleMode = 'free' | 'pat' | 'climb' | 'top' | 'down' | 'drum'

export class CarnivalSnowballs implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private park: Park
  private trail: Trail
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private ground = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: SnowmanSection

  // ---- The balls and the snowmen.
  private ballTpl: Group
  private faceTpl: Group
  private armTpl: Group
  private hatTpl: Group
  private sashTpl: Group
  private piles: Pile[] = []
  private flights: Flight[] = []
  private hatBox: Box
  private sashBox: Box
  private drum: Drum
  private made = 0
  private lineCount = 0
  private paradeT = -1
  private paradeAuto = -1
  private beat = 0
  private doneT = -1
  private readyTold = false

  // ---- Her finger.
  private finger: { x: number; y: number } | null = null
  private grab: { pile: Pile; ox: number; oz: number } | null = null
  private pending: { x: number; y: number; id?: string; t: number } | null = null
  private grabbedNow: Pile | null = null
  private gap = 0

  // ---- The camera.
  private focus = new Vector3()
  private focusR = 0.3

  // ---- Maple and everyone else.
  private maple: Maple
  private mx: number
  private mz: number
  private my = 0
  private myaw = 0
  private mWalk = 0
  private mMode: MapleMode = 'free'
  private mOn: Pile | null = null
  private mT = 0
  private mGoal = { x: 0, z: 0 }
  private mFrom = new Vector3()
  private patSpot: { x: number; z: number } | null = null
  private patWait = 0
  private dodgeCool = 0
  private boingCool = 0
  private hatOnMaple = 0
  private owl: Owl
  private carriage: Carriage
  private carriageT = 7
  private carriageDir: 1 | -1 = 1
  private trumpet: Trumpet
  private fox: Fox
  private foxT = 18
  private geese: Geese
  private geeseT = 12
  private sled: Sled
  private sledT = 14
  private litT = -1
  private lit = 0
  private litGoal = 0

  private puff: Particles
  private snowfall: Particles
  private confetti: Particles
  private sparkle: Particles

  private lastTouch = 0
  /** The story: whether Maple has started talking, and when it ended (the camera glides down after it). */
  private storyGo = false
  private storyEnd = -10
  /** Who is talking (a snowman's smile opens with his voice), and how soon anyone may chime in again. */
  private talker: Pile | null = null
  private quietUntil = 0
  private dodgeTalk = 0
  private hintFor = -1
  private told = { castle: false, moose: false }
  private gone = false
  private counts = { drags: 0, grabs: 0, made: 0, rolledM: 0, stacks: 0, snowmen: 0, upside: 0, hats: 0, sashes: 0, mapleHats: 0, trees: 0, bumps: 0, climbs: 0, dodges: 0, taps: 0, pokes: 0, parade: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: SnowStart,
    private events: SnowEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 70, 260)
    applyBands()
    this.rig.fov = 42
    this.rig.lag = 0.4
    this.rig.camera.far = 600
    this.section = start.section

    this.park = buildPark(bag)
    scene.add(this.park.root)
    this.trail = new Trail(bag)
    scene.add(this.trail.mesh)

    // ---- The templates every ball, face and arm is cloned from (they share one geometry).
    const lumps = [
      [0.6, 0.55, 0.55],
      [-0.7, 0.2, 0.62],
      [0.1, -0.75, 0.6],
      [-0.2, 0.7, -0.65],
      [0.75, -0.1, -0.6],
      [-0.55, -0.55, -0.6],
      [0.05, 0.1, -0.98],
    ]
    this.ballTpl = solid(merge([P.sphere(1, '#FFFFFF', {}, 22), ...lumps.map(([x, y, z], i) => P.sphere(0.22, i % 2 ? '#E9EDF8' : '#F1F3FB', { at: [x * 0.88, y * 0.88, z * 0.88] }, 10))]), bag, 2)
    // Coal eyes, a carrot nose and a coal smile (the smile on its own pivot, so it opens when he talks).
    const smile: [number, number, number][] = [-0.5, -0.25, 0, 0.25, 0.5].map((a) => [Math.sin(a) * 0.62, -Math.cos(a * 1.4) * 0.12 + 0.06, 0])
    this.faceTpl = new Group()
    this.faceTpl.add(
      solid(
        merge([
          P.sphere(0.12, PAL.ink, { at: [0.3, 0.3, 0.88] }, 10),
          P.sphere(0.12, PAL.ink, { at: [-0.3, 0.3, 0.88] }, 10),
          P.cone(0.13, 0.62, '#FF8A3D', { at: [0, 0.02, 1.2], rot: [Math.PI / 2, 0, 0] }, 10),
        ]),
        bag,
        1.4,
      ),
    )
    const mouthTpl = new Group()
    mouthTpl.position.set(0, -0.34, 0.86)
    mouthTpl.add(solid(merge([...smile.map((at) => P.sphere(0.07, PAL.ink, { at }, 8)), P.sphere(0.2, '#5A3448', { at: [0, -0.02, -0.06], scale: [1.4, 0.5, 0.3] }, 10)]), bag, 1.4))
    this.faceTpl.add(mouthTpl)
    // A stick arm, from the ball's side outward (its pivot at the ball's surface): two twigs at the end.
    this.armTpl = solid(
      merge([
        P.cyl(0.05, 0.07, 1.1, '#7A553E', { at: [0, 0.55, 0] }, 6),
        P.cyl(0.035, 0.045, 0.4, '#7A553E', { at: [0.12, 0.95, 0], rot: [0, 0, -0.7] }, 6),
        P.cyl(0.035, 0.045, 0.35, '#7A553E', { at: [-0.1, 1.0, 0], rot: [0, 0, 0.6] }, 6),
      ]),
      bag,
      1.4,
    )
    this.hatTpl = makeHat(bag)
    this.sashTpl = makeSash(bag)

    this.hatBox = new Box(bag, 'hat')
    this.hatBox.root.position.set(HAT_BOX.x, 0, HAT_BOX.z)
    this.sashBox = new Box(bag, 'sash')
    this.sashBox.root.position.set(SASH_BOX.x, 0, SASH_BOX.z)
    this.drum = new Drum(bag)
    this.drum.root.position.set(DRUM.x, 0, DRUM.z)
    scene.add(this.hatBox.root, this.sashBox.root, this.drum.root)

    this.maple = new Maple(bag)
    this.mx = MAPLE_START.x
    this.mz = MAPLE_START.z
    scene.add(this.maple.root)
    this.owl = new Owl(bag)
    this.owl.root.position.set(this.park.lamp.position.x, 4.1, this.park.lamp.position.z)
    this.sled = new Sled(bag)
    this.carriage = new Carriage(bag)
    this.trumpet = new Trumpet(bag)
    this.fox = new Fox(bag)
    this.geese = new Geese(bag)
    scene.add(this.owl.root, this.sled.root, this.carriage.root, this.trumpet.root, this.fox.root, this.geese.root)

    this.puff = new Particles({ kind: 'spray', count: 220, color: '#FFFFFF', gravity: 7 }, bag)
    this.snowfall = new Particles({ kind: 'spray', count: 320, color: '#FFFFFF', gravity: 0.25 }, bag)
    this.confetti = new Particles({ kind: 'spray', count: 260, colors: [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, '#E8443F', PAL.lavender], gravity: 3 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 120, colors: ['#FFFFFF', '#C9F4FF', '#FFF6B8'], gravity: -0.5 }, bag)
    scene.add(this.puff.mesh, this.snowfall.mesh, this.confetti.mesh, this.sparkle.mesh)
    // A sky already full of falling snow.
    for (let i = 0; i < 160; i++) this.dropFlake(Math.random() * 10)

    this.setUp(start)
    const f = this.firstFocus()
    this.focus.set(f.x, 0, f.z)
    this.rig.setShot(this.shot(), true)

    this.unwatch = watch('snowman', () => ({
      'finger ahead of the ball (m)': [this.gap, 4],
      'speed (m/s)': [this.grab ? Math.hypot(this.grab.pile.vx, this.grab.pile.vz) : 0, 6],
      'top speed now (m/s)': [this.grab ? this.topSpeed(this.grab.pile.balls[0].r) : 0, 6],
      'radius (m)': [this.grab ? this.grab.pile.balls[0].r : 0, 2],
    }))
  }

  // ---------------------------------------------------------------- where a link starts

  private setUp(start: SnowStart) {
    const n = start.snowmen
    if (start.section === 'story' || start.section === 'roll') {
      this.addBall(START.x, START.z, GROW.fresh, true)
      return
    }
    if (start.section === 'stack') {
      const big = this.addBall(0, 1, start.size === 'huge' ? HUGE_R : BIG_R, true)
      this.addBall(3.4, 3.6, GROW.fresh, true)
      this.mx = -1.8
      this.mz = 3.2
      if (start.size === 'huge') this.climbNow(big)
      return
    }
    // Dress and parade: snowmen already made (the dressed ones in the line), the boxes in the park.
    const line = start.section === 'parade' ? n : n - 1
    for (let i = 0; i < line; i++) {
      const s = this.snowmanAt(lineX(i), PATH_Z, i)
      this.wear(s, 'hat')
      this.wear(s, 'sash')
      s.state = 'line'
      s.slot = i
      this.lineCount++
    }
    if (this.lineCount) {
      this.drum.appear()
      this.drum.ready = true
    }
    this.hatBox.appear(true)
    this.sashBox.appear(true)
    if (start.section === 'dress') {
      this.snowmanAt(0, 0.4, line)
      this.addBall(2.6, 2.2, GROW.fresh, true)
      this.mx = -1.9
      this.mz = 2.4
    } else {
      this.mx = DRUM.x - 1.3
      this.mz = DRUM.z + 0.9
      this.paradeAuto = 1.2
    }
  }

  private firstFocus() {
    if (this.section === 'parade') return { x: 0, z: PATH_Z }
    if (this.section === 'dress') return { x: 0, z: 0 }
    return this.piles[0] ? { x: this.piles[0].x, z: this.piles[0].z } : START
  }

  /** Someone says something: `must` lines (the story, the payoff) cut in; a reaction waits its turn and is skipped if
   *  someone is already talking (so lines never pile up). `who`: the snowman talking (his smile opens). */
  private talk(line: Line, who: Pile | null = null, must = false): Promise<void> {
    if (!must && (speakingVoice() || this.time < this.quietUntil)) return Promise.resolve()
    this.quietUntil = this.time + 1.2
    if (who) this.talker = who
    return say(line, { interrupt: must })
  }

  /** The story ends (it ran out, or she touched the snow): on to rolling. */
  private endStory(skipped: boolean) {
    if (this.section !== 'story') return
    if (skipped) stopSpeaking()
    this.storyEnd = this.time
    this.lastTouch = this.time
    this.enter('roll')
  }

  /** A finished snowman (links): three balls, a little different each time. */
  private snowmanAt(x: number, z: number, i: number) {
    const k = 1 + ((i * 37) % 9) / 40 - 0.1
    const p = this.addBall(x, z, SNOWMAN_RS[0] * k, true)
    for (const r of SNOWMAN_RS.slice(1)) p.balls.push(this.makeBall(r * k, p))
    this.layout(p)
    this.finish(p, true)
    return p
  }

  // ---------------------------------------------------------------- balls and piles

  private makeBall(r: number, pile: Pile): Ball {
    const root = new Group()
    const spin = new Group()
    spin.add(this.ballTpl.clone())
    spin.rotation.set(Math.random() * 6, Math.random() * 6, 0)
    root.add(spin)
    pile.root.add(root)
    return { r, root, spin }
  }

  private addBall(x: number, z: number, r: number, now = false): Pile {
    const root = new Group()
    root.position.set(x, 0, z)
    this.scene.add(root)
    const p: Pile = {
      root,
      x,
      z,
      vx: 0,
      vz: 0,
      balls: [],
      state: 'loose',
      busy: false,
      onto: null,
      hopT: 0,
      from: new Vector3(),
      bornT: now ? 1 : 0,
      wob: 0,
      wobV: 0,
      face: null,
      mouth: null,
      arm: null,
      hat: null,
      sash: null,
      upside: false,
      wakeT: -1,
      slot: -1,
      goal: { x, z },
      stepT: -1,
      stepFrom: { x, z },
      stepTo: { x, z },
      rolled: 0,
      crunchAt: 0.4,
      trailAt: 0,
      treeCool: 0,
      bumpCool: 0,
      still: 0,
      waveT: -1,
      flipT: -1,
    }
    p.balls.push(this.makeBall(r, p))
    this.piles.push(p)
    this.layout(p)
    if (!now) this.counts.made++
    return p
  }

  private removePile(p: Pile) {
    this.piles.splice(this.piles.indexOf(p), 1)
    this.scene.remove(p.root)
    if (this.grab?.pile === p) this.grab = null
    if (this.mOn === p) this.getOff()
  }

  /** How squished a ball of radius r is. */
  private squish(r: number) {
    return GROW.squish * clamp((r - 0.35) / 1.3)
  }

  /** Puts a pile's balls one on top of the other. */
  private layout(p: Pile) {
    let y = 0
    p.balls.forEach((b, i) => {
      const sq = i === 0 ? this.squish(b.r) : 0
      const hy = b.r * (1 - sq)
      y += i === 0 ? hy * (1 - SINK * 0.5) : hy * (1 - SINK)
      b.root.position.set(0, y, 0)
      const born = i === 0 && p.bornT < 1 ? Math.max(0.001, p.bornT < 0.7 ? p.bornT / 0.7 : 1 + wobble((p.bornT - 0.7) / 0.3, 1) * 0.15) : 1
      b.root.scale.set(b.r * (1 + sq * 0.5) * born, hy * born, b.r * (1 + sq * 0.5) * born)
      y += hy * (1 - SINK)
    })
  }

  /** The top of a pile (m above the snow). */
  private topY(p: Pile) {
    const last = p.balls[p.balls.length - 1]
    return last.root.position.y + last.root.scale.y
  }

  private topSpeed(r: number) {
    return PUSH.speed * Math.pow(0.3 / Math.max(0.3, r), PUSH.heavy)
  }

  private get loose() {
    return this.piles.filter((p) => p.state === 'loose')
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

  private enter(s: SnowmanSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s, this.made)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.dodgeCool -= dt
    this.boingCool -= dt

    // A touch that started on bare snow (or a tap target) and moved: a new ball, patted together under her finger.
    if (this.pending && this.finger && Math.hypot(this.finger.x - this.pending.x, this.finger.y - this.pending.y) > 12) {
      this.startFromSnow(this.pending.x, this.pending.y)
      this.pending = null
    }

    for (const p of [...this.piles]) this.updatePile(p, dt, t)
    this.updateFlights(dt)
    this.updateMaple(dt, t)
    this.story(dt, t)
    this.storyBeat()
    this.critters(dt, t)

    // Things round the park.
    for (const tr of this.park.trees) {
      if (tr.shake < 0) continue
      tr.shake += dt
      tr.g.rotation.z = wobble(tr.shake / 0.8, 3) * 0.08
      if (tr.shake > 0.8) tr.shake = -1
    }
    this.owl.update(dt, t)
    if (this.sled.update(dt)) {
      this.puff.burst(this.sled.root.position.x, 0.2, this.sled.root.position.z, 14, 2.5, 3, 0.22)
      noise(0.3, 0.08, 'lowpass', 900, 300)
    }
    if ((this.sledT -= dt) < 0) {
      this.sledT = 24 + Math.random() * 12
      this.goSled(false)
    }
    this.hatBox.update(dt)
    this.sashBox.update(dt)
    this.drum.update(dt, t)
    // The castle's windows: lit for a while after a tap, and for the parade.
    if (this.litT >= 0 && (this.litT += dt) > 4) this.litT = -1
    this.litGoal = this.litT >= 0 || this.paradeT >= 0 ? 1 : 0
    if (Math.abs(this.lit - this.litGoal) > 0.002) {
      this.lit += (this.litGoal - this.lit) * ease(dt, 4)
      this.park.setWindows(this.lit)
    }
    // Snow falling gently all the time.
    if (Math.random() < dt * 30) this.dropFlake(0)
    for (const p of [this.puff, this.snowfall, this.confetti, this.sparkle]) p.update(dt)

    this.lights.follow(this.focus.x, 0, this.focus.z)
    this.moveFocus(dt)
    // The first look glides down to the ball once the story's done.
    this.rig.lag = this.section === 'story' || t - this.storyEnd < 2.2 ? 1 : 0.4
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  /** The story: Maple waves and asks for snowmen (two short lines), then on to rolling. */
  private storyBeat() {
    if (this.section !== 'story' || this.storyGo || this.time < 0.6) return
    this.storyGo = true
    this.maple.wave()
    void (async () => {
      await Promise.all([this.talk(L.snowman.story[0], null, true), wait(2000)])
      if (this.section !== 'story' || this.gone) return
      this.maple.hop()
      await Promise.all([this.talk(L.snowman.story[1], null, true), wait(2400)])
      this.endStory(false)
    })()
  }

  /** The horse and carriage, the trumpet, the fox and the geese: when they come, and their moves. */
  private critters(dt: number, t: number) {
    const live = this.section !== 'story'
    // The carriage crosses the terrace every half minute or so.
    this.carriage.update(dt, t, this.focus.x)
    if (live && !this.carriage.passing && (this.carriageT -= dt) < 0) {
      this.carriageT = 28 + Math.random() * 14
      this.carriage.go(this.carriageDir)
      this.carriageDir = this.carriageDir > 0 ? -1 : 1
    }
    this.trumpet.update(dt, t)
    // The geese fly over the top of what she's looking at.
    this.geese.update(dt, t)
    if (live && !this.geese.flying && (this.geeseT -= dt) < 0) {
      this.geeseT = 34 + Math.random() * 14
      const z = this.focus.z - 9
      const hit = this.ray(this.w / 2, this.h * 0.15).ray.intersectPlane(tmpPlane.set(tmp.set(0, 0, 1), -z), tmp2)
      const y = hit ? clamp(hit.y, 2.6, 16) : 7
      const dir = Math.random() < 0.5 ? 1 : -1
      this.geese.go(this.focus.x - dir * 30, this.focus.x + dir * 30, y, z)
      honk(2)
    }
    // The fox trots in to watch now and then, and off again if a ball rolls at her.
    const ev = this.fox.update(dt, t)
    if (ev === 'yip') yip()
    if (ev === 'dive') {
      const f = this.fox.pos
      this.puff.burst(f.x, 0.3, f.z, 30, 2.4, 3.2, 0.2)
      noise(0.25, 0.08, 'lowpass', 1200, 300)
    }
    if (this.fox.here) {
      const f = this.fox.pos
      for (const p of this.piles)
        if (p.state === 'loose' && Math.hypot(p.vx, p.vz) > 0.5 && Math.hypot(p.x - f.x, p.z - f.z) < p.balls[0].r + 1.1) {
          if (this.fox.pokeable) yip()
          this.fox.shoo()
        }
    } else if (live && this.paradeT < 0 && (this.foxT -= dt) < 0) {
      this.foxT = 6
      const side = Math.random() < 0.5 ? -1 : 1
      const g = this.groundAt(this.w * (0.5 + side * 0.3), this.h * 0.58, tmp)
      if (g) {
        const spot = { x: clamp(g.x, PARK.x0 + 1, PARK.x1 - 1), z: clamp(g.z, PARK.z0 + 1, PARK.z1 - 1) }
        if (this.isFree(spot.x, spot.z, 0.7) && Math.hypot(spot.x - this.mx, spot.z - this.mz) > 1.6) {
          this.foxT = 30 + Math.random() * 12
          this.fox.come({ x: spot.x + side * 11, z: spot.z - 1 }, spot)
        }
      }
    }
  }

  private dropFlake(age: number) {
    const c = this.focus
    this.snowfall.emit(c.x + (Math.random() - 0.5) * 34, 9 + Math.random() * 5 - age, c.z - 4 + (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 0.3, -0.7, 0, 14, 0.07 + Math.random() * 0.06)
  }

  // ---------------------------------------------------------------- a ball rolling

  private updatePile(p: Pile, dt: number, t: number) {
    if (p.bornT < 1) {
      p.bornT = Math.min(1, p.bornT + dt / 0.5)
      this.layout(p)
    }
    p.treeCool -= dt
    p.bumpCool -= dt
    // The wobble: a spring, kicked by bumps and landings. A top-heavy snowman teeters all the time.
    p.wobV += (-90 * p.wob - 6 * p.wobV) * dt
    p.wob += p.wobV * dt
    const heavy = p.balls.length > 1 ? clamp(Math.max(...p.balls.slice(1).map((b, i) => b.r / p.balls[i].r)) - 1, 0, 1) : 0
    p.root.rotation.z = p.wob + Math.sin(t * 2.4 + p.x) * 0.05 * heavy
    if (p.flipT >= 0) {
      // The cartwheel: up into the air, right round once, and down on his head.
      p.flipT = Math.min(1, p.flipT + dt / 0.7)
      const k = p.flipT
      p.root.position.y = bell(k) * this.topY(p) * 1.05
      p.root.rotation.z = Math.PI * 2 * (k * k * (3 - 2 * k))
      if (k >= 1) {
        p.flipT = -1
        p.root.position.y = 0
        p.root.rotation.z = 0
        p.wobV += 6
        sfx.thump()
      }
    }
    p.root.rotation.x = p.wob * 0.4
    if (p.mouth) {
      const k = p === this.talker ? speechLevel('snowman') : 0
      p.mouth.scale.set(1 + k * 0.25, 1 + k * 2.2, 1)
    }

    if (p.state === 'hop') return this.updateHop(p, dt)
    if (p.state === 'walk' || p.state === 'parade') return this.updateStep(p, dt, t)
    if (p.state === 'done' && p.wakeT >= 0) this.updateWake(p, dt)
    if (p.state === 'line' || p.state === 'done') this.updateWave(p, dt)
    if (p.state !== 'loose') return

    const b = p.balls[0]
    if (this.grab?.pile === p && this.finger) {
      const g = this.groundAt(this.finger.x, this.finger.y, tmp)
      if (g) {
        const tx = g.x - this.grab.ox
        const tz = g.z - this.grab.oz
        let dx = (tx - p.x) * PUSH.follow
        let dz = (tz - p.z) * PUSH.follow
        this.gap = Math.hypot(tx - p.x, tz - p.z)
        const top = this.topSpeed(b.r)
        const s = Math.hypot(dx, dz)
        if (s > top) {
          dx *= top / s
          dz *= top / s
        }
        const k = ease(dt, PUSH.grip)
        p.vx += (dx - p.vx) * k
        p.vz += (dz - p.vz) * k
      }
      p.still = 0
    } else {
      const k = Math.exp(-PUSH.coast * dt)
      p.vx *= k
      p.vz *= k
      if (Math.hypot(p.vx, p.vz) < 0.04) p.vx = p.vz = 0
    }
    this.aimHelp(p, dt)
    const speed = Math.hypot(p.vx, p.vz)
    if (speed < 0.01) {
      p.still += dt
      return
    }
    p.still = 0
    p.x += p.vx * dt
    p.z += p.vz * dt
    if (keepIn(p, b.r * 0.95)) {
      // Along the park's edge: it stops going out, keeps sliding along.
      const inX = p.x <= PARK.x0 + b.r || p.x >= PARK.x1 - b.r
      const inZ = p.z <= PARK.z0 + b.r || p.z >= PARK.z1 - b.r
      if (inX) p.vx *= 0.3
      if (inZ) p.vz *= 0.3
    }
    if (this.bumps(p)) return
    // It rolled: it turns, grows, leaves grass behind and crunches.
    const ds = speed * dt
    tmp.set(p.vz, 0, -p.vx).normalize()
    b.spin.quaternion.premultiply(q.setFromAxisAngle(tmp, ds / b.r))
    if (b.r < GROW.max) b.r = Math.min(GROW.max, b.r + GROW.rate * ds * Math.pow(0.3 / b.r, GROW.slow))
    p.rolled += ds
    this.counts.rolledM += ds
    p.root.position.set(p.x, 0, p.z)
    this.layout(p)
    if (p.rolled >= p.trailAt) {
      p.trailAt = p.rolled + 0.12
      this.trail.add(p.x, p.z, clamp(b.r * 1.15, 0.3, 1.9), 0.34, Math.atan2(p.vx, p.vz))
    }
    if (p.rolled >= p.crunchAt) {
      p.crunchAt = p.rolled + 0.55 + b.r * 0.6
      crunch(b.r)
      if (Math.random() < 0.5) this.puff.emit(p.x - p.vx * 0.1, 0.05, p.z - p.vz * 0.1, -p.vx * 0.2 + (Math.random() - 0.5), 1.2, -p.vz * 0.2, 0.5, 0.12)
    }
  }

  /** A loose ball's bumps (trees, the moose, the boxes, other balls and snowmen). Returns true if it's gone. */
  private bumps(p: Pile) {
    const b = p.balls[0]
    const r = b.r
    // The park's trees: it bounces off, the tree shakes and its snow falls on the ball.
    for (const tr of this.park.trees) {
      const d = Math.hypot(p.x - tr.x, p.z - tr.z)
      const min = r + TREE_R
      if (d >= min) continue
      this.pushOut(p, tr.x, tr.z, min, d, 0.35)
      if (p.treeCool <= 0) {
        p.treeCool = 1
        this.shakeTree(tr, p)
      }
    }
    // The ice moose.
    const dm = Math.hypot(p.x - MOOSE.x, p.z - MOOSE.z)
    if (dm < r + MOOSE.r) {
      this.pushOut(p, MOOSE.x, MOOSE.z, r + MOOSE.r, dm, 0.35)
      this.bumped(p, null)
    }
    // The boxes: in it goes.
    for (const box of [this.hatBox, this.sashBox]) {
      if (!box.shown) continue
      const bp = box.root.position
      const d = Math.hypot(p.x - bp.x, p.z - bp.z)
      if (d < BOX_HALF * 1.1 + r + 0.15) {
        this.intoBox(p, box)
        return true
      }
    }
    // Other balls and snowmen.
    for (const o of this.piles) {
      if (o === p || o.state === 'hop' || o.state === 'walk' || o.state === 'parade') continue
      const or = o.balls[0].r
      const d = Math.hypot(p.x - o.x, p.z - o.z)
      const min = r + or * 0.92
      if (d >= min) continue
      const speed = Math.hypot(p.vx, p.vz)
      const canStack = (o.state === 'loose' || o.state === 'stack') && !o.busy && o.balls.length < 3 && speed > 0.25 && o.bornT >= 1
      if (canStack) {
        // Two loose balls: the smaller one hops on top. A stack: the moving ball hops on, whatever its size.
        if (o.state === 'loose' && or > r) this.hopOnto(p, o)
        else if (o.state === 'loose') this.hopOnto(o, p)
        else this.hopOnto(p, o)
        return p.state !== 'loose'
      }
      this.pushOut(p, o.x, o.z, min, d, 0.3)
      this.bumped(p, o)
    }
    return false
  }

  private pushOut(p: Pile, x: number, z: number, min: number, d: number, keep: number) {
    const nx = d > 1e-4 ? (p.x - x) / d : 1
    const nz = d > 1e-4 ? (p.z - z) / d : 0
    p.x = x + nx * min
    p.z = z + nz * min
    const vn = p.vx * nx + p.vz * nz
    if (vn < 0) {
      p.vx -= vn * nx * (1 + keep)
      p.vz -= vn * nz * (1 + keep)
    }
    p.root.position.set(p.x, 0, p.z)
  }

  private bumped(p: Pile, o: Pile | null) {
    if (p.bumpCool > 0) return
    p.bumpCool = 0.6
    p.wobV += 3
    this.counts.bumps++
    if (o) {
      o.wobV += o.balls.length > 1 ? 4 : 2
      if (o.face) giggle()
      else sfx.thump()
    } else sfx.boing()
  }

  private shakeTree(tr: Park['trees'][number], p: Pile | null) {
    tr.shake = 0
    this.counts.trees++
    noise(0.4, 0.07, 'bandpass', 1800, 900, 0, 0.8)
    for (let i = 0; i < 26; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = Math.random() * 1.2
      this.puff.emit(tr.x + Math.cos(a) * rr, 1 + Math.random() * 2.2, tr.z + Math.sin(a) * rr, (Math.random() - 0.5) * 1.2, Math.random(), (Math.random() - 0.5) * 1.2, 1.2, 0.16 + Math.random() * 0.1)
    }
    // The snow lands on a ball right by it: a little bigger.
    if (p && p.state === 'loose') {
      const b = p.balls[0]
      b.r = Math.min(GROW.max, b.r + 0.05)
      p.wobV += 2
      this.layout(p)
      this.puff.burst(p.x, this.topY(p), p.z, 12, 1.2, 1.5, 0.14)
      sfx.fwip()
    }
  }

  /** Drawn toward a box that a snowman is waiting for, when rolling at it. */
  private aimHelp(p: Pile, dt: number) {
    if (AIM.pull <= 0) return
    const speed = Math.hypot(p.vx, p.vz)
    if (speed < 0.4) return
    for (const box of [this.hatBox, this.sashBox]) {
      if (!box.shown || !this.needs(box.kind)) continue
      const bp = box.root.position
      const dx = bp.x - p.x
      const dz = bp.z - p.z
      const d = Math.hypot(dx, dz)
      if (d > AIM.reach + p.balls[0].r || d < 1e-3) continue
      if ((dx * p.vx + dz * p.vz) / (d * speed) < 0.35) continue
      p.vx += (dx / d) * AIM.pull * dt
      p.vz += (dz / d) * AIM.pull * dt
    }
  }

  // ---------------------------------------------------------------- stacking

  /** Pile `a` (one ball) hops on top of pile `b`. */
  private hopOnto(a: Pile, b: Pile) {
    if (this.grab?.pile === a || this.grab?.pile === b) this.grab = null
    if (this.mOn === a || this.mOn === b) this.getOff()
    a.state = 'hop'
    a.onto = b
    a.hopT = 0
    a.from.set(a.x, a.balls[0].root.position.y, a.z)
    a.vx = a.vz = 0
    b.vx = b.vz = 0
    b.busy = true
    sfx.boing()
  }

  private updateHop(p: Pile, dt: number) {
    const b = p.onto!
    p.hopT += dt / HOP_S
    const k = clamp(p.hopT)
    const ball = p.balls[0]
    const toY = this.topY(b) + ball.r * (1 - SINK * 2)
    const x = p.from.x + (b.x - p.from.x) * k
    const z = p.from.z + (b.z - p.from.z) * k
    const y = p.from.y + (toY - p.from.y) * k + bell(k) * (0.7 + ball.r * 0.5)
    p.root.position.set(x, 0, z)
    ball.root.position.y = y
    ball.spin.rotation.x += dt * 4
    if (p.hopT < 1) return
    // Landed: the ball joins the pile.
    this.piles.splice(this.piles.indexOf(p), 1)
    this.scene.remove(p.root)
    b.root.add(ball.root)
    b.balls.push(ball)
    b.busy = false
    this.layout(b)
    b.wobV += 5
    sfx.thump()
    sounds.pop()
    this.puff.burst(b.x, this.topY(b) - ball.r, b.z, 16, 2, 1.6, 0.16)
    this.counts.stacks++
    if (b.state === 'loose') b.state = 'stack'
    if (b.balls.length === 3) this.finish(b, false)
    else this.maple.hop()
  }

  /** Three balls: a snowman. A coal face on the smallest ball (upside down if that's the bottom one), stick arms. */
  private finish(p: Pile, quiet: boolean) {
    p.state = 'done'
    this.made++
    // Top-heavy (the last ball is the biggest): he cartwheels over and stands on his head, the big ball at the
    // bottom with his face on it, upside down.
    p.upside = !quiet && p.balls[2].r > p.balls[0].r * 1.02
    if (p.upside) {
      p.balls.reverse()
      p.flipT = 0
      this.layout(p)
    }
    const face = this.faceTpl.clone()
    if (p.upside) face.rotation.z = Math.PI
    p.balls[p.upside ? 0 : 2].root.add(face)
    p.face = face
    p.mouth = face.children[1] as Group
    const mid = p.balls[1].root
    const armL = this.armTpl.clone()
    armL.position.set(0.88, 0.1, 0)
    armL.rotation.z = -1.05
    const armR = this.armTpl.clone()
    armR.position.set(-0.88, 0.1, 0)
    armR.rotation.z = 1.05
    mid.add(armL, armR)
    p.arm = armR
    if (quiet) return
    this.counts.snowmen++
    if (p.upside) this.counts.upside++
    p.wobV += 6
    sounds.correct()
    burst()
    this.confetti.burst(p.x, this.topY(p) + 0.3, p.z, 40, 3, 5, 0.16)
    this.maple.cheer()
    // Head on the bottom: he says hello upside down (a giggle and a wave). Otherwise Maple cheers.
    if (p.upside) {
      giggle()
      p.waveT = 0.4
      this.talk(L.snowman.upside, p)
    } else this.talk(L.snowman.made[(this.counts.snowmen - 1) % L.snowman.made.length])
    if (this.section === 'roll' || this.section === 'stack') {
      this.enter('dress')
      this.hatBox.appear()
      this.sashBox.appear()
      sfx.pop()
    }
  }

  // ---------------------------------------------------------------- dressing

  /** Does a snowman still need this? */
  private needs(kind: 'hat' | 'sash') {
    return this.piles.some((p) => p.state === 'done' && p.wakeT < 0 && !(kind === 'hat' ? p.hat : p.sash) && !this.flights.some((f) => f.to === p && f.kind === kind))
  }

  private intoBox(p: Pile, box: Box) {
    const bp = box.root.position
    this.removePile(p)
    this.puff.burst(bp.x, BOX_HALF * 1.6, bp.z, 26, 2.5, 3, 0.2)
    box.pop()
    sounds.pop()
    sfx.fwip()
    // Out flies the hat (or sash), onto the first snowman waiting for one; nobody needs it? Onto Maple.
    const to = this.piles.find((o) => o.state === 'done' && o.wakeT < 0 && !(box.kind === 'hat' ? o.hat : o.sash) && !this.flights.some((f) => f.to === o && f.kind === box.kind)) ?? null
    const g = (box.kind === 'hat' ? this.hatTpl : this.sashTpl).clone()
    g.scale.setScalar(0.4)
    this.scene.add(g)
    this.flights.push({ kind: box.kind, g, from: new Vector3(bp.x, BOX_HALF * 1.8, bp.z), to, t: 0 })
    if (!to) this.counts.mapleHats++
  }

  private updateFlights(dt: number) {
    for (const f of [...this.flights]) {
      f.t += dt / 0.9
      const k = clamp(f.t)
      let to: Vector3
      let scale: number
      if (f.to) {
        const ball = f.kind === 'hat' ? f.to.balls[2] : f.to.balls[1]
        to = ball.root.getWorldPosition(tmp3)
        scale = ball.r
      } else {
        to = this.maple.root.localToWorld(tmp3.set(0, 1.0 + this.maple.root.position.y * 0, 0))
        scale = 0.34
      }
      f.g.position.set(f.from.x + (to.x - f.from.x) * k, f.from.y + (to.y - f.from.y) * k + bell(k) * 3, f.from.z + (to.z - f.from.z) * k)
      f.g.scale.setScalar(0.4 + (scale - 0.4) * k)
      f.g.rotation.y = (1 - k) * 6
      if (f.t < 1) continue
      this.flights.splice(this.flights.indexOf(f), 1)
      this.scene.remove(f.g)
      if (f.to && f.to.state === 'done') {
        this.wear(f.to, f.kind)
        f.to.wobV += 4
        sfx.pop()
        this.sparkle.burst(to.x, to.y, to.z, 14, 1.6, 1.4, 0.12)
        if (f.kind === 'hat') this.counts.hats++
        else this.counts.sashes++
        if (f.to.hat && f.to.sash) f.to.wakeT = 0
      } else {
        // On Maple's head for a while (a sash just tickles her).
        if (f.kind === 'hat') this.hatOnMaple = 5
        this.maple.giggle()
        giggle()
        this.talk(L.snowman.mapleHat)
      }
    }
  }

  private wear(p: Pile, kind: 'hat' | 'sash') {
    if (kind === 'hat') {
      p.hat = this.hatTpl.clone()
      // On top of the head (the top ball), whichever way round he is.
      p.balls[2].root.add(p.hat)
    } else {
      p.sash = this.sashTpl.clone()
      p.balls[1].root.add(p.sash)
    }
  }

  /** Dressed: he wakes up and waves, then hops off to the parade line. */
  private updateWake(p: Pile, dt: number) {
    const was = p.wakeT
    p.wakeT += dt
    if (was < 0.5 && p.wakeT >= 0.5) {
      p.waveT = 0
      p.wobV += 4
      sounds.sparkle()
      this.talk(L.snowman.wake[(this.lineCount + this.made) % L.snowman.wake.length], p)
      this.confetti.burst(p.x, this.topY(p), p.z, 24, 2, 3.5, 0.14)
    }
    if (p.wakeT > 1.8) {
      p.state = 'walk'
      p.slot = this.lineCount++
      p.goal = { x: lineX(p.slot), z: PATH_Z }
      p.stepT = -1
    }
  }

  private updateWave(p: Pile, dt: number) {
    if (!p.arm) return
    if (p.waveT >= 0) {
      p.waveT += dt
      const k = bell(span(p.waveT, 0, 1.4))
      p.arm.rotation.z = 1.05 - k * 1.5 + Math.sin(p.waveT * 14) * 0.35 * k
      if (p.waveT > 1.4) {
        p.waveT = -1
        p.arm.rotation.z = 1.05
      }
    }
  }

  /** Hopping along to the line (walk) or in the parade. */
  private updateStep(p: Pile, dt: number, t: number) {
    this.updateWave(p, dt)
    const parade = p.state === 'parade'
    const len = parade ? 0.8 : 1.3
    const dur = parade ? 0.46 : 0.45
    if (p.stepT < 0) {
      const dx = p.goal.x - p.x
      const dz = p.goal.z - p.z
      const d = Math.hypot(dx, dz)
      if (d < 0.02) {
        p.root.rotation.y += (0 - p.root.rotation.y) * ease(dt, 6)
        if (p.state === 'walk') this.arrived(p)
        return
      }
      const s = Math.min(len, d)
      // Hopping to the line, he goes round trees, boxes, balls and the others instead of through them.
      const dir = parade ? { x: dx / d, z: dz / d } : this.around(p, dx / d, dz / d, d)
      p.stepFrom = { x: p.x, z: p.z }
      p.stepTo = { x: p.x + dir.x * s, z: p.z + dir.z * s }
      p.stepT = 0
      p.root.rotation.y = Math.atan2(dir.x, dir.z) * 0.35
    }
    p.stepT += dt / dur
    const k = clamp(p.stepT)
    p.x = p.stepFrom.x + (p.stepTo.x - p.stepFrom.x) * k
    p.z = p.stepFrom.z + (p.stepTo.z - p.stepFrom.z) * k
    p.root.position.set(p.x, bell(k) * (parade ? 0.3 : 0.4), p.z)
    const sq = k > 0.85 ? bell(span(k, 0.85, 1)) * 0.08 : 0
    p.root.scale.set(1 + sq, 1 - sq, 1 + sq)
    if (p.stepT >= 1) {
      p.stepT = -1
      p.root.position.y = 0
      p.root.scale.set(1, 1, 1)
      if (!parade) noise(0.1, 0.05, 'lowpass', 700, 250)
    }
    void t
  }

  /** Which way to hop toward (gx, gz) (`far` away) so he goes round what's in the way. */
  private around(p: Pile, gx: number, gz: number, far: number) {
    const r = p.balls[0].r
    const obs: { x: number; z: number; r: number }[] = [
      ...this.park.trees.map((t) => ({ x: t.x, z: t.z, r: TREE_R })),
      { x: MOOSE.x, z: MOOSE.z, r: MOOSE.r },
      { x: this.mx, z: this.mz, r: 0.45 },
    ]
    for (const box of [this.hatBox, this.sashBox]) if (box.root.visible) obs.push({ x: box.root.position.x, z: box.root.position.z, r: BOX_HALF * 1.3 })
    for (const o of this.piles) if (o !== p && o.state !== 'hop' && o.state !== 'parade') obs.push({ x: o.x, z: o.z, r: o.balls[0].r })
    let ax = gx
    let az = gz
    for (const o of obs) {
      const vx = p.x - o.x
      const vz = p.z - o.z
      const d = Math.hypot(vx, vz)
      const clear = o.r + r + 0.5
      // Only what's close and ahead of him, and not past where he's going.
      if (d < 1e-3 || d > clear + 1.4 || d - o.r > far) continue
      if (-(vx * gx + vz * gz) / d < -0.3) continue
      const w = clamp((clear + 1.4 - d) / 1.4, 0, 2)
      let tx = -vz / d
      let tz = vx / d
      if (tx * gx + tz * gz < 0) {
        tx = -tx
        tz = -tz
      }
      ax += (vx / d) * w * 0.7 + tx * w * 1.3
      az += (vz / d) * w * 0.7 + tz * w * 1.3
    }
    const n = Math.hypot(ax, az) || 1
    return { x: ax / n, z: az / n }
  }

  private arrived(p: Pile) {
    p.state = 'line'
    p.wobV += 3
    sfx.thump()
    if (!this.drum.root.visible) this.drum.appear()
    this.drum.ready = true
    if (!this.readyTold) {
      this.readyTold = true
      this.events.ready()
      toot()
    }
    if (this.lines >= PARADE_AUTO && this.paradeT < 0 && this.paradeAuto < 0) this.paradeAuto = 1.5
  }

  private get lines() {
    return this.piles.filter((p) => p.state === 'line').length
  }

  // ---------------------------------------------------------------- the parade

  private startParade() {
    if (this.paradeT >= 0 || !this.lines) return
    this.paradeT = 0
    this.paradeAuto = -1
    this.drum.ready = false
    this.counts.parade = this.lines
    this.grab = null
    this.enter('parade')
    for (const p of this.piles) {
      if (p.state !== 'line') continue
      p.state = 'parade'
      p.goal = { x: PARADE_END_X - p.slot * 2.5, z: PATH_Z }
      p.stepT = -1
    }
    if (this.mOn) this.getOff()
    this.mMode = 'drum'
    this.hatBox.hide()
    this.sashBox.hide()
    toot()
    this.trumpet.toot()
    this.talk(L.snowman.parade, null, true)
    this.litT = 0
  }

  private story(dt: number, t: number) {
    // Roll one: once a ball is big, on to stacking (Maple pats a little one for the top).
    if (this.section === 'roll' && !this.grab && this.piles.some((p) => p.state === 'loose' && p.balls[0].r >= BIG_R - 0.02)) {
      this.enter('stack')
      this.maple.cheer()
      sounds.sparkle()
      this.talk(L.snowman.big)
    }
    // Whenever there's no little ball to roll, Maple pats one together.
    if (this.section !== 'roll' && this.paradeT < 0 && this.mMode === 'free' && !this.patSpot) {
      const small = this.piles.some((p) => p.state === 'loose' && p.balls[0].r < 0.62)
      const hopping = this.piles.some((p) => p.state === 'hop')
      if (!small && !hopping && !this.flights.length) {
        if ((this.patWait += dt) > 1.1) {
          this.patWait = 0
          this.patSpot = this.freeSpot()
          if (this.patSpot) this.mMode = 'pat'
        }
      } else this.patWait = 0
    }
    if (this.paradeAuto >= 0 && (this.paradeAuto -= dt) < 0) this.startParade()
    if (this.paradeT < 0) return
    // The parade: the march plays, Maple drums, and when everyone's at the end the last one waves.
    this.paradeT += dt
    const beat = Math.floor(this.paradeT / 0.3)
    if (beat !== this.beat && this.doneT < 0) {
      this.beat = beat
      const n = MARCH[beat % MARCH.length]
      if (n) tone(n, n, 0.22, 0.05, 'triangle')
      if (beat % 2 === 0) {
        boom()
        this.drum.hit()
      }
    }
    const marching = this.piles.filter((p) => p.state === 'parade')
    if (this.doneT < 0 && marching.length && marching.every((p) => p.stepT < 0 && Math.hypot(p.goal.x - p.x, p.goal.z - p.z) < 0.02) && this.paradeT > 1) {
      this.doneT = 0
      const last = marching.reduce((a, b) => (b.slot > a.slot ? b : a))
      last.waveT = 0
      sounds.fanfare()
      for (const p of marching) {
        p.wobV += 5
        this.confetti.burst(p.x, this.topY(p) + 0.5, p.z, 30, 3, 6, 0.16)
      }
      this.maple.cheer()
      this.trumpet.toot()
      void (async () => {
        await Promise.all([this.talk(L.snowman.bye, last, true), wait(1700)])
        this.maple.cheer()
        await Promise.all([this.talk(L.snowman.done, null, true), wait(2400)])
        if (!this.gone) this.events.done()
      })()
    }
    if (this.doneT >= 0) {
      this.doneT += dt
      if (Math.random() < dt * 6) this.confetti.emit(-12 + Math.random() * 24, 9, PATH_Z + (Math.random() - 0.5) * 6, 0, 0, 0, 4, 0.18)
    }
    void t
  }

  /** A free spot for a new little ball, near the snowman she's making (or near the action). */
  private freeSpot() {
    const near = this.piles.find((p) => p.state === 'stack') ?? this.piles.find((p) => p.state === 'loose') ?? null
    const cx = near ? near.x : this.focus.x
    const cz = near ? near.z : this.focus.z
    const r = GROW.fresh
    for (const d of [3, 3.8, 2.4, 4.8]) {
      for (let i = 0; i < 10; i++) {
        const a = 0.6 + i * 0.63
        const x = cx + Math.cos(a) * d
        const z = cz + Math.sin(a) * d
        if (this.isFree(x, z, r)) return { x, z }
      }
    }
    return null
  }

  private isFree(x: number, z: number, r: number) {
    if (x < PARK.x0 + r + 0.5 || x > PARK.x1 - r - 0.5 || z < PARK.z0 + r + 0.5 || z > PARK.z1 - r - 0.5) return false
    if (this.park.trees.some((t) => Math.hypot(x - t.x, z - t.z) < r + TREE_R + 0.4)) return false
    if (Math.hypot(x - MOOSE.x, z - MOOSE.z) < r + MOOSE.r + 0.4) return false
    for (const box of [this.hatBox, this.sashBox]) if (box.root.visible && Math.hypot(x - box.root.position.x, z - box.root.position.z) < r + BOX_HALF + 0.9) return false
    return !this.piles.some((p) => Math.hypot(x - p.x, z - p.z) < r + p.balls[0].r + 0.5)
  }

  // ---------------------------------------------------------------- Maple

  private climbNow(p: Pile) {
    this.mOn = p
    this.mMode = 'top'
  }

  private getOff() {
    const p = this.mOn
    this.mOn = null
    if (!p) return
    this.mMode = 'down'
    this.mT = 0
    this.mFrom.set(this.mx, this.my, this.mz)
    const a = Math.atan2(this.mx - p.x, this.mz - p.z) + 0.6
    const d = p.balls[0].r + 0.8
    this.mGoal = { x: p.x + Math.sin(a) * d, z: p.z + Math.cos(a) * d }
    keepIn(this.mGoal, 0.4)
    sfx.boing()
  }

  private updateMaple(dt: number, t: number) {
    let walk = 0
    let lookAt: { x: number; z: number } | null = this.grab?.pile ?? null
    if (this.hatOnMaple > 0 && (this.hatOnMaple -= dt) <= 0) this.maple.hat.visible = false
    else if (this.hatOnMaple > 0) this.maple.hat.visible = true

    const walkTo = (x: number, z: number, speed: number) => {
      const dx = x - this.mx
      const dz = z - this.mz
      const d = Math.hypot(dx, dz)
      if (d < 0.08) return true
      const s = Math.min(d, speed * dt)
      this.mx += (dx / d) * s
      this.mz += (dz / d) * s
      walk = speed
      this.myaw = turn(this.myaw, Math.atan2(dx, dz), dt * 8)
      return false
    }

    if (this.mMode === 'top' && this.mOn) {
      const p = this.mOn
      this.mx = p.x
      this.mz = p.z
      this.my = this.topY(p) - 0.04
      const sp = Math.hypot(p.vx, p.vz)
      // Riding the ball: running on the spot while it rolls under her.
      walk = sp > 0.1 ? 2.4 : 0
      if (sp > 0.1) this.myaw = turn(this.myaw, Math.atan2(p.vx, p.vz), dt * 6)
      else this.myaw = turn(this.myaw, 0, dt * 2)
    } else if (this.mMode === 'down' || this.mMode === 'climb') {
      if (this.mMode === 'climb' && this.mT < 0) {
        // Walking over to the huge ball.
        const p = this.mOn
        if (!p || p.state !== 'loose') this.mMode = 'free'
        else {
          const a = Math.atan2(this.mx - p.x, this.mz - p.z)
          const d = p.balls[0].r + 0.55
          if (walkTo(p.x + Math.sin(a) * d, p.z + Math.cos(a) * d, 2.6)) {
            this.mT = 0
            this.mFrom.set(this.mx, 0, this.mz)
            this.maple.hop()
            sounds.whoosh()
          }
          lookAt = p
        }
      } else {
        this.mT += dt / 0.6
        const k = clamp(this.mT)
        const to = this.mMode === 'climb' && this.mOn ? { x: this.mOn.x, y: this.topY(this.mOn) - 0.04, z: this.mOn.z } : { x: this.mGoal.x, y: 0, z: this.mGoal.z }
        this.mx = this.mFrom.x + (to.x - this.mFrom.x) * k
        this.mz = this.mFrom.z + (to.z - this.mFrom.z) * k
        this.my = this.mFrom.y + (to.y - this.mFrom.y) * k + bell(k) * 0.9
        if (this.mT >= 1) {
          if (this.mMode === 'climb' && this.mOn) {
            this.mMode = 'top'
            this.counts.climbs++
            this.maple.cheer()
            sfx.chirp()
            this.talk(L.snowman.climb)
          } else {
            this.mMode = 'free'
            this.my = 0
            sfx.thump()
          }
        }
      }
    } else if (this.mMode === 'pat' && this.patSpot) {
      const s = this.patSpot
      const a = Math.atan2(this.mx - s.x, this.mz - s.z)
      const d = GROW.fresh + 0.55
      if (walkTo(s.x + Math.sin(a) * d, s.z + Math.cos(a) * d, 3)) {
        this.myaw = turn(this.myaw, Math.atan2(s.x - this.mx, s.z - this.mz), 1)
        if (this.mT <= 0) {
          this.mT = 0.001
          this.maple.pat()
          pat()
        }
        this.mT += dt
        if (this.mT > 0.45) {
          if (this.isFree(s.x, s.z, GROW.fresh * 0.8)) {
            this.addBall(s.x, s.z, GROW.fresh)
            this.puff.burst(s.x, 0.3, s.z, 10, 1.4, 1.6, 0.14)
            sounds.pop()
          }
          this.patSpot = null
          this.mMode = 'free'
          this.mT = 0
        }
      }
    } else if (this.mMode === 'drum') {
      if (walkTo(DRUM.x - 1.25, DRUM.z + 0.7, 3.2)) {
        this.myaw = turn(this.myaw, Math.atan2(DRUM.x - this.mx, DRUM.z - this.mz), dt * 6)
        this.maple.drumming = this.doneT < 0
      }
      lookAt = null
    } else {
      // Free: she stays by the ball being rolled (on its left, a step toward the camera), out of its way.
      const p = this.grab?.pile ?? this.piles.find((o) => o.state === 'loose' && o.vx * o.vx + o.vz * o.vz > 0.05) ?? null
      if (p) {
        const r = p.balls[0].r
        let gx = p.x - (r + 1.5)
        if (gx < PARK.x0 + 0.6) gx = p.x + r + 1.5
        const gz = Math.min(PARK.z1 - 0.5, p.z + 0.9)
        if (Math.hypot(gx - this.mx, gz - this.mz) > 1.4) walkTo(gx, gz, 2.6)
      }
      // A huge ball sitting still: she climbs it.
      const huge = this.piles.find((o) => o.state === 'loose' && o.balls[0].r >= CLIMB_R && o.still > 1.2 && this.grab?.pile !== o)
      if (huge && this.paradeT < 0) {
        this.mOn = huge
        this.mMode = 'climb'
        this.mT = -1
      }
      if (!walk && !lookAt) this.myaw = turn(this.myaw, 0, dt * 2)
    }

    // A ball rolling at her: she hops out of the way.
    if (this.mMode === 'free' || this.mMode === 'pat') {
      for (const p of this.piles) {
        if (p.state !== 'loose') continue
        const r = p.balls[0].r
        const d = Math.hypot(this.mx - p.x, this.mz - p.z)
        if (d > r + 0.45) continue
        const nx = d > 1e-3 ? (this.mx - p.x) / d : 1
        const nz = d > 1e-3 ? (this.mz - p.z) / d : 0
        this.mx = p.x + nx * (r + 0.46)
        this.mz = p.z + nz * (r + 0.46)
        const m = { x: this.mx, z: this.mz }
        keepIn(m, 0.3)
        this.mx = m.x
        this.mz = m.z
        if (this.dodgeCool <= 0 && Math.hypot(p.vx, p.vz) > 0.5) {
          this.dodgeCool = 0.8
          this.counts.dodges++
          this.maple.hop()
          if (this.boingCool <= 0) {
            this.boingCool = 1.5
            sfx.boing()
          }
          if (this.time > this.dodgeTalk) {
            this.dodgeTalk = this.time + 12
            this.talk(L.snowman.dodge)
          }
        }
      }
    }

    this.mWalk += (walk - this.mWalk) * ease(dt, 10)
    this.maple.root.position.set(this.mx, this.my, this.mz)
    this.maple.root.rotation.y = this.myaw
    if (lookAt) this.maple.look(Math.atan2(lookAt.x - this.mx, lookAt.z - this.mz) - this.myaw)
    else this.maple.look(0)
    if (this.mMode !== 'drum') this.maple.drumming = false
    this.maple.update(dt, t, this.mWalk, this.my > 0.15)
  }

  // ---------------------------------------------------------------- the camera

  private moveFocus(dt: number) {
    // The camera follows what she's doing, with some slack so small pushes don't move it.
    let want: { x: number; z: number } | null = null
    let r = this.focusR
    if (this.paradeT >= 0) want = { x: 0, z: PATH_Z }
    else if (this.grab) {
      want = this.grab.pile
      r = this.grab.pile.balls[0].r
    } else {
      const walker = this.piles.find((p) => p.state === 'walk')
      const hop = this.piles.find((p) => p.state === 'hop')
      const f = this.flights[0]
      if (walker) want = walker
      else if (hop?.onto) want = hop.onto
      else if (f?.to) want = f.to
    }
    this.focusR += (r - this.focusR) * ease(dt, 2)
    if (!want) return
    const dz = this.tall ? { x: 1.4, z: 2.2 } : { x: 2.6, z: 1.4 }
    const ex = want.x - this.focus.x
    const ez = want.z - this.focus.z
    if (this.paradeT >= 0 || this.section === 'dress') {
      this.focus.x += ex * ease(dt, 1.5)
      this.focus.z += ez * ease(dt, 1.5)
    } else {
      if (Math.abs(ex) > dz.x) this.focus.x += ex - Math.sign(ex) * dz.x
      if (Math.abs(ez) > dz.z) this.focus.z += ez - Math.sign(ez) * dz.z
    }
    this.focus.x = clamp(this.focus.x, -9, 9)
    this.focus.z = clamp(this.focus.z, this.paradeT >= 0 ? PATH_Z : -5.5, 4.5)
  }

  private shot(): Shot {
    const tall = this.tall
    const f = this.focus
    if (this.section === 'story') {
      // The first look: the park with Maple in it, the castle up on the cliff behind.
      return { center: new Vector3(0, 5.5, -6.5), half: tall ? new Vector3(11, 10, 14) : new Vector3(16, 8.5, 12.5), yaw: 0, pitch: 13 }
    }
    if (this.paradeT >= 0) {
      // Alongside the marchers, the castle behind them.
      const m = this.piles.filter((p) => p.state === 'parade')
      const mx = m.length ? m.reduce((a, p) => a + p.x, 0) / m.length : 0
      return { center: new Vector3(clamp(mx, -6, 6), 2.8, PATH_Z), half: tall ? new Vector3(4.8, 3.6, 3) : new Vector3(8, 3.2, 2.6), yaw: 0, pitch: 9 }
    }
    if (this.section === 'dress') {
      // Wide enough for the boxes, the snowman she's dressing and the line behind.
      const cx = f.x * 0.45
      const cz = (f.z - 3.5) * 0.5
      return { center: new Vector3(cx, 1.4, cz), half: tall ? new Vector3(5, 3, 8) : new Vector3(8.5, 2.2, 5.6), yaw: 0, pitch: 25 }
    }
    const extra = Math.max(0, this.focusR - 0.3) * 2.6
    return {
      center: new Vector3(f.x, 0.5 + this.focusR * 0.6, f.z - 0.3),
      half: tall ? new Vector3(3.4 + extra * 0.7, 1.6 + extra * 0.5, 4.6 + extra) : new Vector3(5 + extra, 1.4 + extra * 0.4, 3.4 + extra * 0.6),
      yaw: 0,
      pitch: 25,
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
  private groundAt(x: number, y: number, out: Vector3) {
    return this.ray(x, y).ray.intersectPlane(this.ground, out)
  }

  /** The loose ball under her finger (generously), if any. */
  private ballAt(x: number, y: number) {
    let best: Pile | null = null
    let bestD = Infinity
    for (const p of this.piles) {
      if (p.state !== 'loose' || p.busy || p.bornT < 0.3) continue
      const b = p.balls[0]
      const c = this.toScreen(tmp.set(p.x, b.root.position.y, p.z))
      const top = this.toScreen(tmp2.set(p.x, b.root.position.y + b.r, p.z))
      const sr = Math.abs(c.y - top.y)
      const d = Math.hypot(x - c.x, y - c.y) - sr
      if (d < PUSH.grab && d < bestD) {
        best = p
        bestD = d
      }
    }
    return best
  }

  private grabBall(p: Pile, x: number, y: number) {
    const g = this.groundAt(x, y, tmp)
    this.grab = { pile: p, ox: g ? g.x - p.x : 0, oz: g ? g.z - p.z : 0 }
    // A finger far off the ball's middle pulls it from where it is, not from its middle.
    const off = Math.hypot(this.grab.ox, this.grab.oz)
    const max = p.balls[0].r * 1.2
    if (off > max) {
      this.grab.ox *= max / off
      this.grab.oz *= max / off
    }
    this.grabbedNow = p
    this.counts.grabs++
    this.counts.drags++
    sounds.pickup()
  }

  /** A drag that began on bare snow: a new little ball there (or, with plenty lying around, the nearest one). */
  private startFromSnow(x: number, y: number) {
    if (this.paradeT >= 0) return
    const g = this.groundAt(x, y, tmp)
    if (!g) return
    const loose = this.loose
    const r = GROW.fresh
    if (loose.length < LOOSE_MAX && this.isFree(g.x, g.z, r * 0.9)) {
      const p = this.addBall(g.x, g.z, r)
      p.bornT = 0.6
      pat()
      this.puff.burst(g.x, 0.2, g.z, 8, 1.2, 1.4, 0.12)
      this.grabBall(p, x, y)
      return
    }
    if (!loose.length) return
    const near = loose.reduce((a, b) => (Math.hypot(b.x - g.x, b.z - g.z) < Math.hypot(a.x - g.x, a.z - g.z) ? b : a))
    this.grab = { pile: near, ox: 0, oz: 0 }
    this.counts.drags++
    sounds.pickup()
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { x, y }
    // A touch during the story skips it (and she can push the ball right away).
    this.endStory(true)
    this.grabbedNow = null
    // A ball under her finger always wins (even over a tap target): she pushes it.
    const hit = this.paradeT < 0 ? this.ballAt(x, y) : null
    if (hit) {
      this.pending = null
      this.grabBall(hit, x, y)
      return
    }
    this.pending = { x, y, id, t: this.time }
  }
  pointerMove(x: number, y: number, _downX: number, _downY: number, held: boolean) {
    if (!held) return
    this.lastTouch = this.time
    this.finger = { x, y }
  }
  pointerUp() {
    this.grab = null
    this.finger = null
    this.pending = null
    this.gap = 0
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (id) this.counts.pokes++
    if (id === 'maple') {
      this.maple.wave()
      if (this.mOn) {
        this.maple.slap()
        this.talk(L.snowman.ride)
      } else {
        this.maple.giggle()
        this.talk(L.snowman.poke[this.counts.pokes % L.snowman.poke.length])
      }
      sfx.chirp()
      return
    }
    if (id === 'owl') {
      meet('snowy-owl')
      if (!this.owl.busy) {
        this.owl.poke()
        hoo()
      }
      return
    }
    if (id === 'castle') {
      this.litT = 0
      chime()
      const c = this.park.castle.position
      this.sparkle.burst(c.x, c.y + 8, c.z + 4, 30, 6, 3, 0.4)
      if (!this.told.castle) {
        this.told.castle = true
        void say(L.snowman.castle)
      }
      return
    }
    if (id === 'trumpet') {
      this.trumpet.toot()
      toot()
      const b = this.trumpet.bellAt(tmp)
      this.sparkle.burst(b.x, b.y, b.z, 18, 2.2, 2.5, 0.16)
      // The snowmen in the line hop to it.
      for (const p of this.piles) if (p.state === 'line') p.wobV += 4
      this.maple.hop()
      return
    }
    if (id === 'carriage') {
      this.carriage.poke()
      whinny()
      return
    }
    if (id === 'fox') {
      meet('red-fox')
      if (!this.fox.pounce()) yip()
      return
    }
    if (id === 'geese') {
      meet('canada-goose')
      this.geese.poke()
      honk(3)
      return
    }
    if (id === 'slide') {
      this.goSled(true)
      return
    }
    if (id === 'moose') {
      this.sparkle.burst(MOOSE.x, 1.8, MOOSE.z, 24, 1.6, 1.8, 0.14)
      chime()
      if (!this.told.moose) {
        this.told.moose = true
        void say(L.snowman.iceMoose)
      }
      return
    }
    if (id === 'hatbox' || id === 'sashbox') {
      ;(id === 'hatbox' ? this.hatBox : this.sashBox).jiggle()
      sfx.fwip()
      return
    }
    if (id === 'drum') {
      this.drum.hit()
      boom()
      if (this.lines) this.startParade()
      return
    }
    // A ball she just touched: a pat (it squishes).
    if (this.grabbedNow) {
      this.grabbedNow.wobV += 3
      pat()
      return
    }
    // A snowman: he wobbles and giggles (one standing on his head waves, upside down).
    const sm = this.snowmanAt2D(x, y)
    if (sm) {
      sm.wobV += 5
      giggle()
      if (sm.upside || Math.random() < 0.4) sm.waveT = 0
      if (sm.face && Math.random() < 0.5) this.talk(sm.upside ? L.snowman.upside : L.snowman.tickle, sm)
      this.counts.pokes++
      return
    }
    // A tree: it shakes and its snow falls (on a ball right by it, too).
    const hit = this.ray(x, y).intersectObjects(this.park.trees.map((t) => t.g), true)[0]
    if (hit) {
      const tr = this.park.trees.find((t) => isIn(hit.object, t.g))!
      const near = this.piles.find((p) => p.state === 'loose' && Math.hypot(p.x - tr.x, p.z - tr.z) < p.balls[0].r + TREE_R + 0.8) ?? null
      this.shakeTree(tr, near)
      this.counts.pokes++
      return
    }
    // The snow: a little puff and a crunch.
    const g = this.groundAt(x, y, tmp)
    if (g) {
      this.puff.burst(g.x, 0.05, g.z, 8, 1, 1.6, 0.12)
      crunch(0.2)
    }
  }

  private goSled(tapped: boolean) {
    if (this.sled.going) return
    this.sled.go()
    sounds.whoosh()
    if (tapped) this.counts.pokes++
    setTimeout(() => sounds.whoosh(), 500)
  }

  private snowmanAt2D(x: number, y: number) {
    for (const p of this.piles) {
      if (p.balls.length < 2) continue
      const c = this.toScreen(tmp.set(p.x, this.topY(p) * 0.5, p.z))
      const top = this.toScreen(tmp2.set(p.x, this.topY(p), p.z))
      const half = Math.max(44, Math.abs(c.y - top.y))
      if (Math.abs(x - c.x) < half * 0.7 && Math.abs(y - c.y) < half) return p
    }
    return null
  }

  // ---------------------------------------------------------------- the hint: how to roll

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = t - this.lastTouch
    const first = this.counts.drags === 0 && idle > 2.8
    let show = this.section !== 'story' && t - this.storyEnd > 2.4 && this.paradeT < 0 && !this.finger && !this.flights.length && (first || idle > HINT_S)
    let kind: HintKind = 'roll'
    let from: Vector3 | null = null
    let to: { x: number; z: number } | null = null
    let press = false
    if (show) {
      const loose = this.loose
      const ball = loose.reduce<Pile | null>((a, b) => (!a || b.balls[0].r < a.balls[0].r ? b : a), null)
      const box = this.needs('hat') ? this.hatBox : this.needs('sash') ? this.sashBox : null
      if (this.lines && this.drum.root.visible && !box && !this.piles.some((p) => p.state === 'done' || p.state === 'walk')) {
        // Everyone's dressed: the drum.
        from = tmp.set(DRUM.x, 1.6, DRUM.z)
        press = true
        kind = 'drum'
      } else if (ball) {
        from = tmp.set(ball.x, ball.balls[0].root.position.y, ball.z)
        const stack = this.piles.find((p) => p.state === 'stack') ?? this.piles.find((p) => p.state === 'loose' && p !== ball && p.balls[0].r > ball.balls[0].r)
        if (box && this.section === 'dress') {
          to = { x: box.root.position.x, z: box.root.position.z }
          kind = box.kind
        } else if (stack && this.section !== 'roll') {
          to = stack
          kind = 'stack'
        } else to = { x: ball.x + (ball.x > 4 ? -4 : 4), z: ball.z }
      } else show = false
    }
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!show || !from) return
    if (idle > HINT_S && this.hintFor !== this.lastTouch) {
      this.hintFor = this.lastTouch
      this.events.hint(kind)
    }
    const p = this.toScreen(from)
    el.dataset.kind = press ? 'press' : 'drag'
    if (to) {
      const q2 = this.toScreen(tmp2.set(to.x, 0.3, to.z))
      const dx = q2.x - p.x
      const dy = q2.y - p.y
      const d = Math.hypot(dx, dy) || 1
      const len = Math.min(170, d)
      el.style.setProperty('--dx', `${((dx / d) * len).toFixed(0)}px`)
      el.style.setProperty('--dy', `${((dy / d) * len).toFixed(0)}px`)
    }
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.4) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp.copy(at).setY(at.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(at).setY(at.y + height))
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
    const pos = (o: Object3D) => o.getWorldPosition(tmp3).clone()
    for (const [id, el] of this.anchorEls) {
      if (id === 'maple') place(el, pos(this.maple.root), this.maple.height, 0.9)
      else if (id === 'owl') place(el, pos(this.owl.root), 0.9, 1.6)
      else if (id === 'castle') place(el, new Vector3(CASTLE.x, CLIFF_Y + 1, CASTLE.z + 3), 11, 0.75)
      else if (id === 'slide') place(el, new Vector3(18.6, 2.4, -2.8), 3, 0.8)
      else if (id === 'moose') place(el, new Vector3(MOOSE.x, 0, MOOSE.z), 2.5, 0.9)
      else if (id === 'hatbox') place(el, this.hatBox.root.visible ? pos(this.hatBox.root) : null, BOX_HALF * 2, 1)
      else if (id === 'sashbox') place(el, this.sashBox.root.visible ? pos(this.sashBox.root) : null, BOX_HALF * 2, 1)
      else if (id === 'drum') place(el, this.drum.root.visible ? pos(this.drum.root) : null, 2, 0.9)
      else if (id === 'trumpet') place(el, pos(this.trumpet.root), 2.6, 0.8)
      else if (id === 'carriage') place(el, this.carriage.passing ? this.carriage.center(tmp3).setY(CLIFF_Y + 0.3).clone() : null, 2, 1)
      else if (id === 'fox') place(el, this.fox.here && this.fox.pokeable ? this.fox.center(tmp3).setY(0).clone() : null, 1.1, 1.2)
      else if (id === 'geese') place(el, this.geese.flying ? this.geese.center(tmp3).setY(this.geese.root.position.y - 0.6).clone() : null, 1.2, 2)
      el.style.zIndex = id === 'maple' ? '3' : id === 'castle' ? '0' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (x: number, y: number, z: number) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(tmp2.set(x, y, z)))
    const loose = this.loose
    return {
      section: this.section,
      loose: loose.map((p) => ({ r: +p.balls[0].r.toFixed(2), ...scr(p.x, p.balls[0].root.position.y, p.z) })),
      /** The ball to push: the smallest loose one (QA drags it). */
      ball: loose.length ? (({ p }) => ({ r: +p.balls[0].r.toFixed(2), ...scr(p.x, p.balls[0].root.position.y, p.z) }))({ p: loose.reduce((a, b) => (b.balls[0].r < a.balls[0].r ? b : a)) }) : null,
      piles: this.piles.filter((p) => p.state === 'stack').map((p) => ({ balls: p.balls.length, ...scr(p.x, 0.5, p.z) })),
      snowmenMade: this.made,
      waiting: this.piles.filter((p) => p.state === 'done').length,
      line: this.lines,
      marching: this.paradeT >= 0,
      done: this.doneT >= 0,
      maple: this.mMode,
      grabbed: !!this.grab,
      gap: +this.gap.toFixed(2),
      states: this.piles.map((p) => `${p.state}${p.hat ? "H" : ""}${p.sash ? "S" : ""}${p.wakeT >= 0 ? "w" : ""}`).join(" "),
      hatBox: this.hatBox.shown ? scr(HAT_BOX.x, 0.5, HAT_BOX.z) : null,
      sashBox: this.sashBox.shown ? scr(SASH_BOX.x, 0.5, SASH_BOX.z) : null,
      drum: this.drum.root.visible ? scr(DRUM.x, 1.3, DRUM.z) : null,
      trail: this.trail.dabs,
      fox: this.fox.state,
      carriage: this.carriage.passing,
      geese: this.geese.flying,
      ...this.counts,
      rolledM: +this.counts.rolledM.toFixed(1),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.gone = true
    this.unwatch()
    this.scene.clear()
    this.bag.dispose()
  }
}

function turn(from: number, to: number, k: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + d * Math.min(1, k)
}

function isIn(o: Object3D | null, g: Object3D) {
  for (let p = o; p; p = p.parent) if (p === g) return true
  return false
}
