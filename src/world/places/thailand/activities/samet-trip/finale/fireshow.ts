// The fire show on Hat Sai Kaew at night (plan: planning/around-the-world/thailand/samet-trip.html, step 9, the finale),
// on the island's real beach (island/layout.ts BAY) by the lanterns, after the sunset at Ao Prao (sunset.ts).
//
// The toy (core verb): twirl the glowing poi. Kaylee stands on the sand behind the rope with a pair of light-up poi;
// her finger draws in the air in front of her and the poi follow it, the second one chasing the first, leaving ribbons
// of pink and gold light that hang in the dark a moment (ribbon.ts). With her finger up they keep swinging gently. The
// two gecko fire dancers (cast.ts) copy her: she spins fast, they spin fast; a big circle from her and they swing a
// ring of fire. The drum keeps time. The verb deepens three times (`round`), moving on by itself:
//   twirl   circles, swirls and scribbles of light, each loop a whoosh; the dancers copy her speed and size.
//   shapes  the dancers draw a shape in fire over the sea (a circle, a star, a heart) and its dots wait in front of her:
//           draw over them (any order, any way round) and when most are lit it sparkles and lifts into the sky like a
//           lantern of light. Stuck a while: the dots count from further away and the finger draws it for her.
//   finish  each pink flag adds something, one per loop she draws: the jet ski man rides by with lights (jetski), her
//           sandcastle glows with candles (sandcastle), the parrotfish and the cuttlefish light up in the waves
//           (snorkel), Daddy gets up and dances (hideseek). Then a big ring waits round her: one huge circle and the
//           dancers light a ring of fire round the whole beach, then fireworks (tap the sky for more).
// Fire is for grown-ups: the dancers stay behind the rope, her poi are lights.
//
// Greybox: simple shapes in the toon look, no voices (the full loop adds Mommy's "Look! Fire dancers!"); the words show
// in a bubble for Dad. Every number that decides the feel is a knob (?feel=1), with a graph of her spin against theirs.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, CylinderGeometry, Fog, Group, InstancedMesh, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Object3D, Plane, Quaternion, Raycaster, Scene, SphereGeometry, TorusGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp } from '../../../../../../sdk'
import { knobs, watch } from '../../../../../kit/knobs'
import { tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { sfx } from '../../../sfx'
import { FIRE_DANCERS, JETSKI_MAN } from '../cast'
import { BAY, bay, SEAWARD, type StopId } from '../island/layout'
import { buildProps, type Props } from '../island/props'
import { buildIsland, DAY, glowMaterial, type Island, type Key } from '../island/scenery'
import { Flames, Glows } from './flame'
import { Ribbon } from './ribbon'
import { LoopTracker, SHAPE_IDS, shapePoints, type Pt, type ShapeId } from './shapes'

const FILE = 'src/world/places/thailand/activities/samet-trip/finale/fireshow.ts'
const POI = knobs('firePoi', 'Twirling the glowing poi', FILE, {
  follow: { value: 14, min: 2, max: 40, step: 0.5, label: 'The poi follow her finger', unit: '/s', note: 'higher = right under her finger, lower = it swings after it' },
  lag: { value: 0.14, min: 0.02, max: 0.5, step: 0.01, label: 'The second poi chases at', unit: 's', note: 'how far behind the first one it follows the same path' },
  life: { value: 1.4, min: 0.3, max: 4, step: 0.05, label: 'Ribbons hang for', unit: 's' },
  width: { value: 0.14, min: 0.04, max: 0.4, step: 0.01, label: 'Ribbon width', unit: 'm' },
  reachW: { value: 2.6, min: 1, max: 5, step: 0.1, label: 'She reaches out to the side', unit: 'm', note: 'how far left and right of her the poi can go' },
  reachH: { value: 2.4, min: 1, max: 4, step: 0.1, label: '…and up', unit: 'm', note: 'above her drawing middle' },
  idle: { value: 4.5, min: 0, max: 12, step: 0.25, label: 'Finger up: they swing round at', unit: 'rad/s' },
  loopR: { value: 0.3, min: 0.1, max: 1.2, step: 0.05, label: 'A loop counts from', unit: 'm', note: 'the smallest circle that counts as a loop (a whoosh, the dancers answer)' },
})
const COPY = knobs('fireCopy', 'The dancers copy her', FILE, {
  speed: { value: 1, min: 0.2, max: 2.5, step: 0.05, label: 'They spin at her speed ×' },
  min: { value: 4, min: 1, max: 10, step: 0.25, label: 'Slowest spin', unit: 'rad/s' },
  max: { value: 16, min: 6, max: 30, step: 0.5, label: 'Fastest spin', unit: 'rad/s' },
  bigR: { value: 0.85, min: 0.3, max: 2, step: 0.05, label: 'A ring of fire from', unit: 'm', note: 'a loop of hers this big: they swing one big ring of fire' },
  catchUp: { value: 3, min: 0.5, max: 10, step: 0.25, label: 'They catch up', unit: '/s' },
  bpm: { value: 104, min: 60, max: 160, step: 2, label: 'The drum', unit: 'bpm' },
})
const SHAPE = knobs('fireShape', 'Shapes in the sky', FILE, {
  size: { value: 1.1, min: 0.5, max: 2, step: 0.05, label: 'Her shape’s size', unit: 'm', note: 'half the width of the dots she draws over' },
  tol: { value: 0.3, min: 0.1, max: 0.8, step: 0.02, label: 'A dot lights within', unit: 'm' },
  need: { value: 0.75, min: 0.3, max: 1, step: 0.05, label: 'Done when lit', note: 'of the dots' },
  stuck: { value: 7, min: 3, max: 20, step: 0.5, label: 'Stuck after', unit: 's', note: 'no new dot this long: the dots count from further away (+30%) and the finger draws it' },
  show: { value: 2.2, min: 0.8, max: 5, step: 0.1, label: 'The dancers draw it in', unit: 's' },
})
const BIG = knobs('fireBig', 'The big finish', FILE, {
  r: { value: 1.7, min: 1, max: 3, step: 0.05, label: 'The big ring', unit: 'm' },
  need: { value: 0.55, min: 0.2, max: 1, step: 0.05, label: 'Her loop counts from', note: '× the big ring' },
  flames: { value: 2.6, min: 0.8, max: 6, step: 0.1, label: 'The ring of fire lights in', unit: 's' },
  pop: { value: 0.75, min: 0.25, max: 3, step: 0.05, label: 'A firework every', unit: 's' },
})
const LOOK = knobs('fireLook', 'The night of the fire show', FILE, {
  dark: { value: 1, min: 0, max: 1, step: 0.05, label: 'How dark the beach is', note: '0 = the island’s usual night, 1 = dark for the fire (the ribbons and the flames glow)' },
  firelight: { value: 1, min: 0, max: 2, step: 0.05, label: 'Firelight on the sand ×' },
  flame: { value: 1, min: 0.5, max: 2, step: 0.05, label: 'Flame size ×' },
  chain: { value: 1, min: 0, max: 1, step: 1, label: 'Chains on the fire poi', note: '1 = on' },
})
const CAM = knobs('fireCam', 'The fire show camera', FILE, {
  pitch: { value: 11, min: 0, max: 40, step: 1, label: 'Looks down', unit: '°' },
  box: { value: 6.2, min: 3, max: 14, step: 0.1, label: 'Shows across', unit: 'm', note: 'half the width of beach across the screen' },
  tallBox: { value: 4.6, min: 2, max: 10, step: 0.1, label: '…on a tall screen', unit: 'm' },
})

export type FireRound = 'twirl' | 'shapes' | 'finish'
export const FIRE_ROUND_IDS: FireRound[] = ['twirl', 'shapes', 'finish']
/** What each pink flag adds to the big finish, in the order they come. */
export const GIFT_ORDER: StopId[] = ['jetski', 'sandcastle', 'snorkel', 'hideseek']
export interface FireStart {
  round: FireRound
  /** The pink flags she earned (each adds something to the finish). */
  flags: StopId[]
}
export interface FireEvents {
  /** A new round began (the address bar follows). */
  round(r: FireRound): void
  /** A shape lifted into the sky (its index, 0..2). */
  shape?(i: number): void
  /** A flag's surprise arrived. */
  gift?(id: StopId): void
  /** The ring of fire and the fireworks: the show is done. `photo`: the fireworks (for Agong's wall if there's no
   *  sunset photo). */
  done(photo: string): void
}

type Phase = 'intro' | 'twirl' | 'show' | 'trace' | 'lift' | 'gifts' | 'big' | 'ring' | 'fireworks'

/** Where things stand on Sai Kaew (u along the beach, v out to sea; the water's edge is v = 0). */
const KAY = { u: -5.5, v: -6 }
const DANCE: [number, number][] = [
  [-9.8, -2.4],
  [-1.2, -2.4],
]
const ROPE_V = -4.2
const DRUM = { u: 1.4, v: -5.4 }
const SEATS = { ji: { u: -7.6, v: -7.4 }, nick: { u: -3.4, v: -7.4 } }
const CASTLE = { u: -11.6, v: -5.6 }
/** The ring of fire round the whole beach (an ellipse on the sand, its middle and half sizes). */
const RING = { u: -5.5, v: -4.6, ru: 13, rv: 4.8, n: 44 }
const SHOW_AT = { u: -5.5, v: -10, y: 4.6, size: 1.6 }

/** The night of the fire show: darker than the island's usual night (DAY.night), so the fire is the brightest thing on
 *  the beach. The bars' lamps stay lit. */
const SHOW_NIGHT: Key = {
  ...DAY.night,
  top: '#0C0A24',
  mid: '#17133C',
  horizon: '#35285A',
  haze: '#1E1840',
  glow: '#A6A8E6',
  amb: '#5C54A8',
  ambK: 0.4,
  light: '#9098DC',
  lightK: 0.15,
  cloud: '#2C2856',
  belly: '#1E1A42',
  water: ['#30527A', '#26466E', '#1D3962', '#172E56', '#112448'],
  far: '#1C2244',
  hills: ['#1A183C', '#221F48'],
  lamps: 1,
}
/** Links in each fire poi's chain. */
const LINKS = 9
/** Where the hand is in a chibi arm (animal.ts: the paw sphere). */
const HAND = new Vector3(0.05, -0.15, 0.01)
const PAPER = ['#FFCF8F', '#FFB4DA', '#D8C2FF']

const DEG = 180 / Math.PI
const HINT_S = 6
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const tmpC = new Color()
const tmpQ = new Quaternion()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const UP = new Vector3(0, 1, 0)

// ---- Sounds (synthesized; the voices come at the full-loop gate).
const drum = (accent = false) => {
  tone(accent ? 120 : 95, 48, 0.22, accent ? 0.2 : 0.12, 'sine')
  if (accent) tone(240, 120, 0.08, 0.05, 'triangle')
}
const jingle = () => [0, 0.05].forEach((d, i) => tone(1760 + i * 220, 1900 + i * 220, 0.08, 0.035, 'triangle', d))
const dotNote = (n: number) => {
  const f = 523 * 2 ** (([0, 2, 4, 7, 9, 12, 14, 16][n % 8] + 12 * Math.floor(n / 8)) / 12)
  tone(f, f, 0.12, 0.04, 'triangle')
}
const lift = () => [0, 0.1, 0.2, 0.3, 0.42].forEach((d, i) => tone(660 + i * 150, 700 + i * 170, 0.18, 0.05, 'sine', d))
const fanfare = () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.24, 0.07, 'triangle', i * 0.12))
const flameUp = (d = 0) => {
  tone(160, 90, 0.25, 0.05, 'sawtooth', d)
}

export const FIRE_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'dancer:0', label: 'A fire dancer', kind: 'thing' },
  { id: 'dancer:1', label: 'A fire dancer', kind: 'thing' },
  { id: 'drum', label: 'The drum', kind: 'thing' },
]

interface Dancer {
  rig: Rig
  spin: number
  theta: number
  r: number
  /** The ring of fire (0..1), and how big. */
  ring: number
  ringR: number
  ringT: number
  hop: number
  trails: Ribbon[]
  /** The wicks (the balls of the poi) and where they were last frame (their flames stream back from where they go). */
  balls: Mesh[]
  prev: Vector3[]
}
interface Gift {
  id: StopId
  root: Group
  t: number
}

export class FireShow implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private props: Props
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private bubbleEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private round: FireRound
  private phase: Phase = 'intro'
  private phaseT = 0
  private flags: StopId[]

  // ---- The drawing plane in front of her: its middle, right and the way it faces (toward the camera).
  private O: Vector3
  private right: Vector3
  private fwd: Vector3
  private plane: Plane

  // ---- Kaylee and her poi.
  private kaylee: Avatar
  private finger: { x: number; y: number; id?: string; moved: boolean; drawing: boolean; downX: number; downY: number } | null = null
  private lastTouch = 0
  private lastDraw = -99
  private aim = new Vector3()
  private poiA = new Vector3()
  private poiB = new Vector3()
  private hist: { p: Vector3; t: number }[] = []
  private idleA = 0
  private ribA: Ribbon
  private ribB: Ribbon
  private ballA: Mesh
  private ballB: Mesh
  private tether: LineSegments
  private tracker = new LoopTracker()
  private loops = 0

  // ---- The family, the dancers, the drum.
  private nick: Member
  private ji: Member
  private dancing = false
  private dancers: Dancer[] = []
  private drumG: Group
  private drumHit = 0
  private beatT = 0
  private beats = 0

  // ---- Shapes.
  private shapeIdx = 0
  private shapeId: ShapeId = 'circle'
  private guide: InstancedMesh
  private guidePts: Pt[] = []
  private hit: boolean[] = []
  private tol = 0
  private lastHit = 0
  private showRib: Ribbon
  private showBall: Mesh
  /** Her shapes, lifted into the sky as paper lanterns: each dot a lantern (offsets from the shape's middle). */
  private lanterns: { pts: Vector3[]; color: string; t: number; from: Vector3; seed: number }[] = []
  private lanternBody: InstancedMesh
  /** The fire (every flame on the beach in one draw), the firelight on the sand, the lanterns' soft halos. */
  private fire: Flames
  private pools: Glows
  private halos: Glows
  private chains: InstancedMesh
  private darkNow = -1
  private showPrev = new Vector3()

  // ---- The finish.
  private gifts: Gift[] = []
  private giftQueue: StopId[] = []
  private castleCandles: Mesh[] = []
  private ski: { root: Group; rider: Rig; wake: Ribbon; s: number } | null = null
  private fish: { root: Group; glow: Mesh; s: number; r: number; speed: number; jump: number }[] = []
  private flameK: number[] = []
  private rockets: { p: Vector3; v: Vector3; t: number; m: Mesh }[] = []
  private nextPop = 0
  private pops = 0
  private snapPending = false

  private sparkle: Particles
  private fireworks: Particles
  private embers: Particles
  private bubble: { who: 'kaylee' | 'nick' | 'ji' | 'dancer'; text: string; until: number } | null = null
  private counts = { draws: 0, taps: 0, pokes: 0, loops: 0, rings: 0, dots: 0, shapes: 0, gifts: 0, fireworks: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: FireStart,
    private events: FireEvents,
  ) {
    const { scene, bag } = this
    scene.fog = new Fog(DAY.night.haze, 140, 900)
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.5
    this.rig.camera.far = 3200
    this.round = start.round
    this.flags = GIFT_ORDER.filter((f) => start.flags.includes(f))

    // ---- Sai Kaew at night: the island, its bars, lanterns and umbrellas.
    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.applyDark()
    this.isl.lagoon.waves.height = 0.12
    this.props = buildProps(bag, this.isl.root, this.isl.ground, this.isl.blockers, this.isl.cullable)
    for (const id of Object.keys(this.props.flags) as StopId[]) this.props.flags[id].visible = false

    // ---- The drawing plane: a little in front of her, facing the camera (which looks in from the shallows at her, the
    // lit-up beach bar behind her). `fwd` is the way the camera looks (up the beach).
    this.fwd = new Vector3(-BAY.n.x, 0, -BAY.n.z).normalize()
    this.right = new Vector3(-this.fwd.z, 0, this.fwd.x)
    this.O = this.L(KAY.u, KAY.v + 1.1).add(new Vector3(0, 1.55, 0))
    this.plane = new Plane().setFromNormalAndCoplanarPoint(this.fwd, this.O)

    // ---- The rope she stays behind (posts and a pink rope), the drum.
    const rope: Parameters<typeof merge>[0] = []
    for (let u = -14; u <= 3; u += 2.125) {
      const p = this.L(u, ROPE_V)
      rope.push(P.cyl(0.05, 0.06, 0.7, '#E8DCC8', { at: [p.x, p.y + 0.35, p.z] }, 6))
    }
    scene.add(solid(merge(rope), bag, 1.5))
    const a = this.L(-14, ROPE_V)
    const b = this.L(3, ROPE_V)
    const mid = a.clone().lerp(b, 0.5)
    const len = a.distanceTo(b)
    const ropeMesh = solid(merge([P.box(len, 0.05, 0.05, '#FF8FC8', { at: [0, 0, 0] })]), bag, 1)
    ropeMesh.position.set(mid.x, mid.y + 0.6, mid.z)
    ropeMesh.rotation.y = Math.atan2(-BAY.t.z, BAY.t.x)
    scene.add(ropeMesh)
    this.drumG = new Group()
    this.drumG.add(solid(merge([P.cyl(0.34, 0.3, 0.6, '#C8553D', { at: [0, 0.3, 0] }, 14), P.cyl(0.35, 0.35, 0.04, '#F6E8CE', { at: [0, 0.61, 0] }, 14)]), bag, 1.5))
    this.drumG.position.copy(this.L(DRUM.u, DRUM.v))
    scene.add(this.drumG)

    // ---- Kaylee behind the rope, her poi.
    this.kaylee = new Avatar(bag)
    const k0 = this.L(KAY.u, KAY.v)
    this.kaylee.place(k0.x, k0.y, k0.z, SEAWARD * DEG)
    scene.add(this.kaylee.root)
    const ks = blobShadow(0.42, bag)
    ks.position.set(k0.x, k0.y + 0.02, k0.z)
    scene.add(ks)
    this.ribA = new Ribbon(bag, { head: '#FF4FB8', tail: '#9A5BFF', life: POI.life, width: POI.width })
    this.ribB = new Ribbon(bag, { head: '#FFC23A', tail: '#FF5F9E', life: POI.life, width: POI.width })
    const ballGeo = bag.add(new SphereGeometry(0.1, 12, 8))
    this.ballA = new Mesh(ballGeo, glowMaterial(bag, '#FFC2EA'))
    this.ballB = new Mesh(ballGeo, glowMaterial(bag, '#FFF0B8'))
    for (const m of [this.ballA, this.ballB]) {
      ;(m.material as MeshBasicMaterial).opacity = 1
      const halo = new Mesh(ballGeo, glowMaterial(bag, m === this.ballA ? '#FF5FB8' : '#FFC24D'))
      ;(halo.material as MeshBasicMaterial).opacity = 0.45
      halo.scale.setScalar(2.4)
      m.add(halo)
      m.renderOrder = 7
    }
    const tg = bag.add(new BufferGeometry())
    tg.setAttribute('position', new BufferAttribute(new Float32Array(12), 3))
    this.tether = new LineSegments(tg, bag.add(new LineBasicMaterial({ color: '#FFE3F4', transparent: true, opacity: 0.7, fog: false })))
    this.tether.frustumCulled = false
    scene.add(this.ribA.mesh, this.ribB.mesh, this.ballA, this.ballB, this.tether)
    this.poiA.copy(this.O)
    this.poiB.copy(this.O)

    // ---- Mommy and Daddy on the sand beside her.
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.ji = fam('ji')
    this.nick = fam('nick')
    for (const [m, s] of [
      [this.ji, SEATS.ji],
      [this.nick, SEATS.nick],
    ] as const) {
      const p = this.L(s.u, s.v)
      m.place(p.x, p.y, p.z, SEAWARD * DEG, 'stand')
      scene.add(m.root)
    }

    // ---- The fire dancers.
    const wickGeo = bag.add(new SphereGeometry(0.075, 10, 8))
    const wickMat = bag.add(new MeshBasicMaterial({ color: '#4A3230' }))
    FIRE_DANCERS.forEach((look, i) => {
      const rig = buildAnimal(look, bag)
      const p = this.L(DANCE[i][0], DANCE[i][1])
      rig.root.position.copy(p)
      rig.root.rotation.y = SEAWARD + (i ? 0.45 : -0.45)
      scene.add(rig.root)
      const sh = blobShadow(0.45, bag)
      sh.position.set(p.x, p.y + 0.02, p.z)
      scene.add(sh)
      const trails: Ribbon[] = []
      const balls: Mesh[] = []
      for (let k = 0; k < 2; k++) {
        const tr = new Ribbon(bag, { n: 40, head: '#FFB347', tail: '#FF3A10', life: 0.35, width: 0.12 })
        scene.add(tr.mesh)
        trails.push(tr)
        // The wick: a dark ball on its chain, the flame drawn round it (flame.ts).
        const ball = new Mesh(wickGeo, wickMat)
        ball.renderOrder = 5
        scene.add(ball)
        balls.push(ball)
      }
      this.dancers.push({ rig, spin: COPY.min, theta: i * 1.3, r: 0.42, ring: 0, ringR: 1, ringT: 0, hop: 0, trails, balls, prev: [new Vector3(), new Vector3()] })
    })
    // Their chains: little steel links from the hand to the wick, catching the firelight.
    this.chains = new InstancedMesh(bag.add(new TorusGeometry(0.02, 0.0065, 4, 8)), bag.add(new MeshBasicMaterial({ color: '#E6CFAE' })), this.dancers.length * 2 * LINKS)
    this.chains.frustumCulled = false
    scene.add(this.chains)

    // ---- The shapes: her dots, the dancers' stroke of fire over the sea.
    const dotGeo = bag.add(new SphereGeometry(0.07, 8, 6))
    const dotMat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 1, blending: AdditiveBlending, depthWrite: false, fog: false }))
    this.guide = new InstancedMesh(dotGeo, dotMat, 48)
    this.guide.frustumCulled = false
    this.guide.renderOrder = 6
    this.guide.count = 0
    scene.add(this.guide)
    this.showRib = new Ribbon(bag, { n: 120, head: '#FFE7A0', tail: '#FF6A2E', life: 3, width: 0.22 })
    this.showBall = new Mesh(ballGeo, glowMaterial(bag, '#FFD27A'))
    ;(this.showBall.material as MeshBasicMaterial).opacity = 1
    this.showBall.scale.setScalar(1.1)
    this.showBall.visible = false
    scene.add(this.showRib.mesh, this.showBall)

    // ---- The fire: the dancers' poi, the ball that draws the shapes, the candles, the ring of fire round the beach
    // (hidden until the end); the firelight on the sand; the lanterns' halos.
    this.fire = new Flames(bag, 96)
    this.pools = new Glows(bag, 96, { flat: true, soft: 1.6 })
    this.halos = new Glows(bag, 3 * 48 * 2 + 16, { soft: 2.4 })
    const lanternGeo = bag.add(new CylinderGeometry(0.075, 0.06, 0.15, 10))
    this.lanternBody = new InstancedMesh(lanternGeo, bag.add(new MeshBasicMaterial({ color: '#FFFFFF', fog: false })), 3 * 48)
    this.lanternBody.frustumCulled = false
    this.lanternBody.count = 0
    scene.add(this.fire.mesh, this.pools.mesh, this.halos.mesh, this.lanternBody)
    for (let i = 0; i < RING.n; i++) this.flameK.push(0)

    this.sparkle = new Particles({ kind: 'spray', count: 320, colors: ['#FFFFFF', '#FFF6B8', PAL.gold, PAL.pink, PAL.hotpink], gravity: -0.4 }, bag)
    this.fireworks = new Particles({ kind: 'spray', count: 900, colors: ['#FF7ACB', '#FFD86E', '#B99BFF', '#7FF0C8', '#FFFFFF', '#FF6A5A'], gravity: 1.6 }, bag)
    this.embers = new Particles({ kind: 'spray', count: 240, colors: ['#FFB347', '#FFE08A', '#FF6A2E'], gravity: -1.2 }, bag)
    scene.add(this.sparkle.mesh, this.fireworks.mesh, this.embers.mesh)

    this.startRound(this.round, true)
    this.unwatch = watch('fireshow', () => ({
      'her spin (rad/s)': [this.tracker.spin, 20],
      'the dancers (rad/s)': [this.dancers[0].spin, 20],
      'her loop size (m)': [this.tracker.size, 2.5],
    }))
  }

  // ---------------------------------------------------------------- places

  /** A point on Sai Kaew (u along the beach, v out to sea) at the sand's height. */
  private L(u: number, v: number, out = new Vector3()) {
    const p = bay(u, v)
    return out.set(p.x, Math.max(0, this.isl.ground.heightAt(p.x, p.z)), p.z)
  }
  /** A point in her drawing plane (a right, b up from its middle). */
  private planePoint(a: number, b: number, out = new Vector3()) {
    return out.copy(this.O).addScaledVector(this.right, a).addScaledVector(UP, b)
  }
  private planeLocal(p: Vector3): Pt {
    tmp2.subVectors(p, this.O)
    return { x: tmp2.dot(this.right), y: tmp2.y }
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
  setBubbleElement(el: HTMLElement | null) {
    this.bubbleEl = el
  }
  get calm() {
    return false
  }

  /** Dad's round chips (?feel=1) and the rounds moving on by themselves. */
  setRound(r: FireRound) {
    if (r === this.round) return
    this.startRound(r)
  }
  private startRound(r: FireRound, first = false) {
    this.round = r
    if (!first) this.events.round(r)
    this.guide.count = 0
    this.showBall.visible = false
    if (r === 'twirl') {
      this.loops = 0
      this.setPhase(first ? 'intro' : 'twirl')
      if (first) this.say('ji', 'Look! Fire dancers!', 2.4)
    } else if (r === 'shapes') {
      this.shapeIdx = 0
      this.startShape()
    } else {
      this.giftQueue = this.flags.filter((f) => !this.gifts.some((g) => g.id === f))
      this.setPhase(this.giftQueue.length ? 'gifts' : 'big')
      if (this.phase === 'big') this.showBigRing()
    }
  }
  /** The beach as dark as the knob says (the island's usual night .. SHOW_NIGHT). */
  private applyDark() {
    const k = (this.darkNow = LOOK.dark)
    this.isl.setTime({ from: 'night', to: SHOW_NIGHT, k })
    ;(this.scene.fog as Fog).color.set(DAY.night.haze).lerp(tmpC.set(SHOW_NIGHT.haze), k)
  }
  private setPhase(p: Phase) {
    this.phase = p
    this.phaseT = 0
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.phaseT += dt
    if (LOOK.dark !== this.darkNow) this.applyDark()
    this.fire.begin(t)
    this.pools.begin()
    this.halos.begin()
    this.play(dt, t)
    this.drive(dt, t)
    this.dance(dt, t)
    this.life(dt, t)
    this.fire.commit()
    this.pools.commit()
    this.halos.commit()
    for (const p of [this.sparkle, this.fireworks, this.embers]) p.update(dt)

    const c = this.L(KAY.u, KAY.v + 2)
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    this.isl.cull(c.x, c.z, 80)
    this.props.setLamps(this.isl.lamps, t)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- the show

  private play(dt: number, t: number) {
    switch (this.phase) {
      case 'intro':
        // Mommy's line, the dancers already spinning; her poi swing by themselves until she touches.
        if (this.phaseT > 2.2 || this.counts.draws > 0) this.setPhase('twirl')
        break
      case 'twirl':
        // Six loops (or a good while of twirling) and the dancers show her a shape.
        if (this.loops >= 6 || (this.phaseT > 45 && this.loops >= 2)) this.startRound('shapes')
        break
      case 'show': {
        // A ball of fire draws the shape over the sea, leaving its stroke hanging there.
        const k = Math.min(1, this.phaseT / SHAPE.show)
        const pts = shapePoints(this.shapeId, 80)
        const i = Math.min(pts.length - 1, Math.floor(k * pts.length))
        const q = pts[i]
        const c = this.L(SHOW_AT.u, SHOW_AT.v)
        tmp.copy(c).setY(SHOW_AT.y).addScaledVector(this.right, q.x * SHOW_AT.size).addScaledVector(UP, q.y * SHOW_AT.size)
        this.showBall.visible = k < 1
        this.showBall.position.copy(tmp)
        if (k < 1) {
          // A ball of fire, its flame streaming back from where it's going.
          this.fireball(tmp, this.showPrev, dt, 0.7)
          this.showRib.push(tmp, t, 0.01)
          if (Math.random() < 0.4) this.embers.emit(tmp.x, tmp.y, tmp.z, (Math.random() - 0.5) * 0.6, 0.4, (Math.random() - 0.5) * 0.6, 0.7, 0.1)
        }
        this.showPrev.copy(tmp)
        if (k >= 1 && this.phaseT > SHAPE.show + 0.4) {
          // Her turn: the dots wait in front of her.
          this.setGuide(this.shapeId, SHAPE.size)
          this.setPhase('trace')
          this.lastHit = t
          sfx.chime()
        }
        break
      }
      case 'trace':
        // Stuck: the dots count from further away (the finger draws it in drawHint).
        if (t - this.lastHit > SHAPE.stuck && this.tol < SHAPE.tol * 2) {
          this.tol *= 1.3
          this.lastHit = t
        }
        break
      case 'lift':
        if (this.phaseT > 2.2) {
          this.shapeIdx++
          if (this.shapeIdx >= SHAPE_IDS.length) this.startRound('finish')
          else this.startShape()
        }
        break
      case 'ring': {
        // The ring of fire lights round the beach, both ways from the dancers, then the fireworks.
        const k = this.phaseT / BIG.flames
        const half = RING.n / 2
        for (let i = 0; i < RING.n; i++) {
          // Flame i lights when the wave reaches it (index 0 is straight out by the water, between the dancers).
          const d = Math.min(i, RING.n - i) / half
          if (this.flameK[i] === 0 && k >= d) {
            this.flameK[i] = 0.001
            const p = this.ringPoint(i)
            this.embers.burst(p.x, p.y + 0.3, p.z, 6, 1.2, 2.2, 0.12)
            if (i % 4 === 0) flameUp()
          }
        }
        if (this.phaseT > BIG.flames + 0.6) {
          this.setPhase('fireworks')
          this.nextPop = t
          this.snapPending = true
          sfx.cheer()
          fanfare()
          this.kaylee.showOff('cheer')
          this.ji.react('wave')
          this.nick.react('hop')
        }
        break
      }
      case 'fireworks':
        // A volley at first, then one now and then (and one wherever she taps the sky).
        if (t >= this.nextPop && (this.pops < 10 || this.phaseT < 30)) {
          this.nextPop = t + (this.pops < 8 ? BIG.pop : BIG.pop * 3)
          const a = this.L(-5.5 + (Math.random() - 0.5) * 18, -15 - Math.random() * 4)
          this.rocket(a.setY(7.5 + Math.random() * 4))
        }
        break
    }
    // The rockets and the lanterns.
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i]
      r.t += dt
      r.p.addScaledVector(r.v, dt)
      r.m.position.copy(r.p)
      if (Math.random() < 0.6) this.embers.emit(r.p.x, r.p.y, r.p.z, 0, -0.5, 0, 0.5, 0.08)
      if (r.t > 1.1) {
        this.fireworks.burst(r.p.x, r.p.y, r.p.z, 90, 7.5, 1.5, 0.32)
        sfx.bang()
        this.pops++
        this.counts.fireworks++
        r.m.visible = false
        this.rockets.splice(i, 1)
      }
    }
    this.drawLanterns(dt, t)
  }

  private rocket(to: Vector3) {
    const from = this.L(-5.5 + (Math.random() - 0.5) * 8, -3)
    const m = new Mesh(this.ballA.geometry, this.ballB.material)
    m.scale.setScalar(0.7)
    this.scene.add(m)
    const v = to.clone().sub(from).divideScalar(1.1)
    this.rockets.push({ p: from.clone(), v, t: 0, m })
    sfx.whoosh(0.8)
  }

  // ---- Shapes.
  private startShape() {
    this.shapeId = SHAPE_IDS[this.shapeIdx]
    this.guide.count = 0
    this.showRib.clear()
    this.setPhase('show')
    this.dancers.forEach((d) => (d.hop = 0.001))
    sfx.whoosh(1.4)
  }
  private setGuide(id: ShapeId | 'ring', size: number) {
    this.guidePts = id === 'ring' ? shapePoints('circle', 44) : shapePoints(id, 40)
    this.hit = this.guidePts.map(() => false)
    this.tol = SHAPE.tol
    this.guide.count = this.guidePts.length
    const m = new Object3D()
    this.guidePts.forEach((q, i) => {
      this.planePoint(q.x * size, q.y * size, m.position)
      m.scale.setScalar(1)
      m.updateMatrix()
      this.guide.setMatrixAt(i, m.matrix)
      this.guide.setColorAt(i, new Color('#B45A9C'))
    })
    this.guide.instanceMatrix.needsUpdate = true
    if (this.guide.instanceColor) this.guide.instanceColor.needsUpdate = true
    this.guideSize = size
  }
  private guideSize = 1
  private showBigRing() {
    this.setGuide('ring', BIG.r)
    this.lastHit = this.time
  }

  /** Her poi passed `p` (plane coords): the dots it lights. */
  private traceAt(p: Pt) {
    if (this.phase !== 'trace' || !this.guidePts.length) return
    let lit = 0
    const s = this.guideSize
    this.guidePts.forEach((q, i) => {
      if (this.hit[i]) return
      if (Math.hypot(q.x * s - p.x, q.y * s - p.y) < this.tol) {
        this.hit[i] = true
        lit++
        this.guide.setColorAt(i, new Color('#FFE68A'))
        dotNote(this.counts.dots++)
      }
    })
    if (!lit) return
    this.lastHit = this.time
    if (this.guide.instanceColor) this.guide.instanceColor.needsUpdate = true
    const done = this.hit.filter(Boolean).length / this.hit.length
    if (done >= SHAPE.need) this.shapeDone()
  }
  private shapeDone() {
    // It sparkles and lifts into the sky like a lantern of light (and stays up there).
    // Each dot becomes a little paper lantern, glowing softly from the light inside.
    const s = this.guideSize
    const pts = this.guidePts.map((q) => new Vector3().addScaledVector(this.right, q.x * s).addScaledVector(UP, q.y * s))
    pts.forEach((o, i) => {
      const w = tmp.copy(this.O).add(o)
      if (i % 2 === 0) this.sparkle.emit(w.x, w.y, w.z, (Math.random() - 0.5) * 1.5, 1 + Math.random(), (Math.random() - 0.5) * 1.5, 1.2, 0.12)
    })
    this.lanterns.push({ pts, color: PAPER[this.shapeIdx % 3], t: 0, from: this.O.clone(), seed: Math.random() * 10 })
    this.guide.count = 0
    this.counts.shapes++
    lift()
    this.dancers.forEach((d) => {
      d.hop = 0.001
      d.ring = 1
      d.ringR = 1.2
      d.ringT = 0
    })
    this.kaylee.react('hop')
    this.events.shape?.(this.shapeIdx)
    this.setPhase('lift')
  }

  // ---- The finish.
  private nextGift() {
    const id = this.giftQueue.shift()
    if (!id) return
    this.addGift(id)
    if (!this.giftQueue.length) {
      // Then the big ring waits round her.
      window.setTimeout(() => {
        if (this.phase === 'gifts') {
          this.setPhase('big')
          this.showBigRing()
          sfx.chime()
        }
      }, 1400)
    }
  }
  private addGift(id: StopId) {
    const { bag } = this
    const root = new Group()
    this.scene.add(root)
    this.gifts.push({ id, root, t: 0 })
    this.counts.gifts++
    fanfare()
    this.ji.react('wave')
    let at: Vector3
    if (id === 'jetski') {
      // The jet ski man rides by with lights on.
      const rider = buildAnimal(JETSKI_MAN, bag)
      const ski = new Group()
      ski.add(solid(merge([P.box(0.9, 0.35, 2.1, '#FFFFFF', { at: [0, 0.18, 0] }), P.box(0.7, 0.18, 0.9, PAL.hotpink, { at: [0, 0.42, -0.2] })]), bag, 1.5))
      for (const [x, z, c] of [
        [-0.4, 1, '#7FF0FF'],
        [0.4, 1, '#7FF0FF'],
        [-0.45, -0.9, '#FF7ACB'],
        [0.45, -0.9, '#FF7ACB'],
      ] as const) {
        const l = new Mesh(this.ballA.geometry, glowMaterial(bag, c))
        ;(l.material as MeshBasicMaterial).opacity = 1
        l.scale.setScalar(1.3)
        l.position.set(x, 0.38, z)
        ski.add(l)
      }
      rider.root.position.set(0, 0.42, -0.25)
      rider.root.scale.setScalar(0.9)
      ski.add(rider.root)
      root.add(ski)
      const wake = new Ribbon(bag, { n: 70, head: '#BFF6FF', tail: '#4FA8FF', life: 2.2, width: 0.32 })
      this.scene.add(wake.mesh)
      this.ski = { root, rider, wake, s: 0 }
      at = this.L(-30, 2.2)
    } else if (id === 'sandcastle') {
      // Her sandcastle by the drum, candles flickering on its towers.
      const sand = '#EBD3A2'
      const parts = [P.cyl(0.55, 0.62, 0.5, sand, { at: [0, 0.25, 0] }, 12)]
      const tops: [number, number, number][] = [
        [0, 1.0, 0],
        [-0.55, 0.6, 0.15],
        [0.55, 0.6, 0.15],
      ]
      parts.push(P.cyl(0.22, 0.26, 0.6, sand, { at: [0, 0.75, 0] }, 10), P.cyl(0.16, 0.2, 0.5, sand, { at: [-0.55, 0.3, 0.15] }, 10), P.cyl(0.16, 0.2, 0.5, sand, { at: [0.55, 0.3, 0.15] }, 10))
      root.add(solid(merge(parts), bag, 1.5))
      for (const [x, y, z] of tops) {
        const c = new Mesh(this.ballA.geometry, glowMaterial(bag, '#FFD27A'))
        c.scale.setScalar(0.6)
        c.position.set(x, y + 0.06, z)
        root.add(c)
        this.castleCandles.push(c)
      }
      at = this.L(CASTLE.u, CASTLE.v)
      root.position.copy(at)
      root.rotation.y = SEAWARD + Math.PI
    } else if (id === 'snorkel') {
      // The parrotfish and the cuttlefish light up in the waves.
      for (const [c, glow, r, speed] of [
        ['#4FD6C8', '#7FFFE8', 3.2, 0.7],
        ['#F2A0D8', '#FF9AE0', 2.2, -0.9],
        ['#4FD6C8', '#7FFFE8', 4.4, 0.5],
      ] as const) {
        const f = new Group()
        f.add(solid(merge([P.sphere(0.32, c, { at: [0, 0, 0], scale: [0.55, 0.5, 1] }, 10), P.cone(0.2, 0.3, c, { at: [0, 0, -0.38], rot: [Math.PI / 2, 0, 0] }, 6)]), bag, 1.2))
        const g = new Mesh(this.ballA.geometry, glowMaterial(bag, glow))
        ;(g.material as MeshBasicMaterial).opacity = 0.7
        g.scale.setScalar(2.4)
        f.add(g)
        root.add(f)
        this.fish.push({ root: f, glow: g, s: Math.random() * 6, r, speed, jump: 2 + Math.random() * 3 })
      }
      at = this.L(-5.5, 1.2)
      root.position.copy(at).setY(0)
    } else {
      // Daddy gets up and dances.
      const p = this.L(SEATS.nick.u, SEATS.nick.v)
      this.nick.place(p.x, p.y, p.z, SEAWARD * DEG, 'stand')
      this.dancing = true
      sfx.boing()
      at = p
    }
    this.sparkle.burst(at.x, at.y + 1, at.z, 40, 2.4, 3, 0.16)
    this.events.gift?.(id)
  }
  private ringPoint(i: number, out = new Vector3()) {
    const a = (i / RING.n) * Math.PI * 2
    // Index 0 is out by the water (+v), going round both ways.
    return this.L(RING.u + Math.sin(a) * RING.ru, RING.v + Math.cos(a) * RING.rv, out)
  }
  private bigFinish() {
    this.guide.count = 0
    this.setPhase('ring')
    this.counts.rings++
    sfx.zoom()
    this.dancers.forEach((d) => {
      d.ring = 1
      d.ringR = 1.6
      d.ringT = 0
    })
  }

  // ---------------------------------------------------------------- her poi

  private drive(dt: number, t: number) {
    const f = this.finger
    const drawing = !!f && f.drawing
    if (drawing && f) {
      const p = this.fingerPlane(f.x, f.y)
      if (p) this.aim.copy(p)
    } else {
      // Finger up: the poi keep swinging round in a small circle in front of her.
      this.idleA += dt * POI.idle
      this.planePoint(Math.sin(this.idleA) * 0.38, -0.15 + Math.cos(this.idleA) * 0.38, this.aim)
    }
    this.poiA.lerp(this.aim, ease(dt, POI.follow))
    this.hist.push({ p: this.poiA.clone(), t })
    while (this.hist.length > 2 && t - this.hist[1].t > 1) this.hist.shift()
    // The second poi: where the first one was a moment ago.
    const want = t - POI.lag
    let b = this.hist[0].p
    for (let i = this.hist.length - 1; i >= 0; i--)
      if (this.hist[i].t <= want) {
        b = this.hist[i].p
        break
      }
    this.poiB.lerp(b, ease(dt, 30))
    this.ballA.position.copy(this.poiA)
    this.ballB.position.copy(this.poiB)
    this.ribA.life = this.ribB.life = POI.life
    this.ribA.width = this.ribB.width = POI.width
    this.ribA.push(this.poiA, t)
    this.ribB.push(this.poiB, t)
    // (The camera looks out to sea: the ribbons lie flat to it.)
    tmp.copy(this.fwd).negate()
    this.ribA.update(t, tmp, drawing ? 1 : 0.75)
    this.ribB.update(t, tmp, drawing ? 1 : 0.75)

    // Her poi's light on the sand round her.
    const kp = this.kaylee.root.position
    this.pools.add(tmp3.set(kp.x, kp.y + 0.04, kp.z), 3, '#FF6FC8', (drawing ? 0.32 : 0.22) * LOOK.firelight)

    const loc = this.planeLocal(this.poiA)
    if (drawing) {
      const loop = this.tracker.add(loc, dt, POI.loopR)
      if (loop) this.onLoop(loop.r)
      this.traceAt(loc)
      this.traceAt(this.planeLocal(this.poiB))
      this.lastDraw = t
    } else this.tracker.idle(dt)

    // The tether lines from her hooves to the poi, and her hooves up holding them.
    const k = this.kaylee.root.position
    const hoofL = tmp2.copy(k).addScaledVector(UP, this.kaylee.height * 0.62).addScaledVector(this.right, -0.22).addScaledVector(this.fwd, -0.25)
    const pos = this.tether.geometry.attributes.position as BufferAttribute
    pos.setXYZ(0, hoofL.x, hoofL.y, hoofL.z)
    pos.setXYZ(1, this.poiB.x, this.poiB.y, this.poiB.z)
    const hoofR = hoofL.addScaledVector(this.right, 0.44)
    pos.setXYZ(2, hoofR.x, hoofR.y, hoofR.z)
    pos.setXYZ(3, this.poiA.x, this.poiA.y, this.poiA.z)
    pos.needsUpdate = true
  }
  private onLoop(r: number) {
    this.loops++
    this.counts.loops++
    sfx.whoosh(0.5)
    if (r >= COPY.bigR) {
      // A big circle: the dancers answer with a ring of fire.
      this.dancers.forEach((d) => {
        d.ring = 1
        d.ringR = clamp(r * 1.1, 0.8, 1.6)
        d.ringT = 0
      })
      this.counts.rings++
      drum(true)
    }
    if (this.phase === 'gifts') this.nextGift()
    else if (this.phase === 'big' && r >= BIG.r * BIG.need) this.bigFinish()
    else if (this.phase === 'big') {
      // Not big enough yet: the ring pulses bigger, a little sparkle.
      const p = this.planePoint(0, 0, tmp)
      this.sparkle.burst(p.x, p.y, p.z, 8, 1, 1, 0.1)
    }
  }

  // ---------------------------------------------------------------- the dancers and the beach

  private dance(dt: number, t: number) {
    // The drum keeps time; on her loops it booms.
    this.beatT += dt
    const beat = 60 / COPY.bpm
    if (this.beatT >= beat) {
      this.beatT -= beat
      this.beats++
      drum(this.beats % 4 === 0)
      this.drumHit = Math.max(this.drumHit, 0.5)
    }
    this.drumHit = Math.max(0, this.drumHit - dt * 3)
    this.drumG.scale.set(1 + this.drumHit * 0.12, 1 - this.drumHit * 0.1, 1 + this.drumHit * 0.12)

    const active = t - this.lastDraw < 0.6
    const wantSpin = active ? clamp(this.tracker.spin * COPY.speed, COPY.min, COPY.max) : COPY.min + 1.5
    const wantR = active ? clamp(0.28 + this.tracker.size * 0.45, 0.3, 0.75) : 0.42
    const n = tmp.copy(this.fwd).negate()
    this.dancers.forEach((d, i) => {
      d.spin += (wantSpin - d.spin) * ease(dt, COPY.catchUp)
      d.r += (wantR - d.r) * ease(dt, COPY.catchUp)
      d.theta += d.spin * dt
      if (d.ring > 0) {
        d.ringT += dt
        if (d.ringT > 1.3) d.ring = Math.max(0, d.ring - dt * 2)
      }
      const rig = d.rig
      const p = rig.root.position
      // A sway to the beat, a hop when they cheer.
      const s = t * 5 + i * 1.7
      let hy = 0
      if (d.hop > 0) {
        d.hop += dt / 0.55
        hy = Math.sin(Math.PI * Math.min(1, d.hop)) * 0.35
        if (d.hop >= 1) d.hop = 0
      }
      rig.body.rotation.z = Math.sin(s * 0.5) * 0.12
      rig.body.position.y = Math.abs(Math.sin(s * 0.5)) * 0.04 + hy
      rig.head.rotation.y = Math.sin(s * 0.25) * 0.3
      // Their poi on chains: a circle round each hand (a butterfly), or one big ring over their head (the ring of fire).
      const ringK = d.ring
      rig.armL.rotation.set(-1.25 - ringK * 1.0 + Math.sin(d.theta) * 0.25 * (1 - ringK), 0, -0.45)
      rig.armR.rotation.set(-1.25 - ringK * 1.0 - Math.sin(d.theta) * 0.25 * (1 - ringK), 0, 0.45)
      rig.root.updateMatrixWorld(true)
      const c = tmp2.copy(p).addScaledVector(UP, 0.78 * rig.height + hy).addScaledVector(this.fwd, -0.35)
      // The firelight round their feet, brighter with the ring.
      const fl0 = 0.85 + Math.sin(t * 11 + i * 2) * 0.08 + Math.sin(t * 27 + i) * 0.07
      this.pools.add(tmp3.copy(p).setY(p.y + 0.04), 5 + ringK * 2, '#FF8A3A', (0.5 + ringK * 0.25) * LOOK.firelight * fl0)
      d.balls.forEach((ball, k) => {
        const sign = k ? -1 : 1
        const arm = k ? rig.armR : rig.armL
        const hand = arm.localToWorld(tmp3.set((k ? 1 : -1) * HAND.x * rig.height, HAND.y * rig.height, HAND.z * rig.height))
        const a = d.theta * sign + (k ? Math.PI : 0)
        // Butterfly: round the hand.
        const bx = Math.sin(a) * d.r
        const by = Math.cos(a) * d.r
        // The ring: one big circle over the head.
        const ra = d.theta * 1.3 + k * Math.PI
        tmp.copy(c).addScaledVector(this.right, Math.sin(ra) * d.ringR).addScaledVector(UP, 0.35 + Math.cos(ra) * d.ringR)
        ball.position.copy(hand).addScaledVector(this.right, bx).addScaledVector(UP, by).lerp(tmp, ringK)
        this.fireball(ball.position, d.prev[k], dt, 1 + ringK * 0.3)
        d.prev[k].copy(ball.position)
        this.chain((i * 2 + k) * LINKS, hand, ball.position)
        const tr = d.trails[k]
        tr.life = 0.3 + ringK * 0.7
        tr.width = 0.1 + ringK * 0.05
        tr.push(ball.position, t, 0.02)
        tr.update(t, n)
        if (Math.random() < 0.12 + ringK * 0.3) this.embers.emit(ball.position.x, ball.position.y + 0.1, ball.position.z, (Math.random() - 0.5) * 0.4, 0.5, (Math.random() - 0.5) * 0.4, 0.6, 0.06)
      })
    })
    this.chains.count = LOOK.chain ? this.dancers.length * 2 * LINKS : 0
    this.chains.instanceMatrix.needsUpdate = true
  }

  /** A ball of fire at `p` (it was at `prev` a frame ago): its flame streams back from where it's going and up. */
  private fireball(p: Vector3, prev: Vector3, dt: number, size: number) {
    const F = LOOK.flame * size
    // (Its own vector: `p` may be the shared tmp.)
    const v = this.fireV.subVectors(p, prev).divideScalar(Math.max(dt, 1 / 120))
    const vx = v.dot(this.right)
    const vy = v.y
    const speed = prev.lengthSq() === 0 ? 0 : Math.min(Math.hypot(vx, vy), 14)
    // Back from the motion, and fire rises: the faster, the more it streams.
    const dx = -vx * 0.14
    const dy = -vy * 0.14 + 1
    const lean = Math.atan2(-dx, dy)
    const w = 0.42 * F
    this.fire.add(p, w, w * (1.1 + Math.min(1.4, speed * 0.16)), lean, (p.x * 3.1 + p.z * 1.7) % 1)
  }

  /** The links of a chain from `a` (the hand) to `b` (the wick), each turned 90° to the last. */
  private chain(i0: number, a: Vector3, b: Vector3) {
    const m = this.chainObj
    tmp.subVectors(b, a)
    const len = tmp.length()
    tmp.divideScalar(len || 1)
    tmpQ.setFromUnitVectors(UP, tmp)
    for (let j = 0; j < LINKS; j++) {
      m.position.copy(a).addScaledVector(tmp, ((j + 0.5) / LINKS) * len)
      m.quaternion.copy(tmpQ)
      m.rotateY(j % 2 ? Math.PI / 2 : 0)
      m.scale.set(1, Math.max(1, len / LINKS / 0.04), 1)
      m.updateMatrix()
      this.chains.setMatrixAt(i0 + j, m.matrix)
    }
  }
  private chainObj = new Object3D()
  private fireV = new Vector3()

  /** Her shapes in the sky: paper lanterns drifting up and away, bobbing, glowing softly from the light inside. */
  private drawLanterns(dt: number, t: number) {
    const o = this.lanternObj
    let n = 0
    for (const l of this.lanterns) {
      l.t += dt
      const k = Math.min(1, l.t / 6)
      const e = 1 - (1 - k) * (1 - k)
      const base = tmp2.copy(l.from).addScaledVector(this.fwd, e * 26).add(tmp.set(0, e * 11, 0))
      // Bigger as they go, so the shape still reads far away; they loosen a little as they rise.
      const grow = 1 + e * 1.4
      const sz = 1.5 * (1 + e * 1.1)
      l.pts.forEach((q, i) => {
        if (n >= this.lanternBody.instanceMatrix.count) return
        const sd = l.seed + i * 1.37
        o.position
          .copy(base)
          .addScaledVector(q, grow)
          .add(tmp.set(Math.sin(t * 0.6 + sd) * 0.12 * e, Math.sin(t * 1.1 + sd * 2) * 0.06 + Math.sin(sd) * 0.1 * e, 0))
        o.rotation.set(Math.sin(t * 0.9 + sd) * 0.12, 0, Math.sin(t * 0.7 + sd) * 0.12)
        o.scale.setScalar(sz)
        o.updateMatrix()
        this.lanternBody.setMatrixAt(n, o.matrix)
        this.lanternBody.setColorAt(n, tmpC.set(l.color))
        n++
        // The soft glow round the paper, and the little flame's light at its bottom.
        const flick = 0.85 + Math.sin(t * 6 + sd * 3) * 0.08 + Math.sin(t * 13 + sd) * 0.05
        this.halos.add(o.position, 1.0 * sz, l.color, 0.42 * flick)
        this.halos.add(tmp.copy(o.position).setY(o.position.y - 0.05 * sz), 0.32 * sz, '#FFF0C0', 0.8 * flick)
      })
    }
    this.lanternBody.count = n
    this.lanternBody.instanceMatrix.needsUpdate = true
    if (this.lanternBody.instanceColor) this.lanternBody.instanceColor.needsUpdate = true
  }
  private lanternObj = new Object3D()

  private life(dt: number, t: number) {
    // Kaylee turns a little toward her poi and holds her hooves up.
    const a = this.poiA
    this.kaylee.lookAt(a.x, a.y, a.z)
    this.kaylee.update(dt, t)
    if (!this.kaylee.showingOff) {
      const r = this.kaylee.rig
      const la = this.planeLocal(this.poiA)
      const lb = this.planeLocal(this.poiB)
      const up = (y: number) => clamp(1.25 + y * 0.45, 0.8, 2.6)
      r.armR.rotation.set(-0.25 - clamp(la.x, 0, 2) * 0.25, 0, up(la.y))
      r.armL.rotation.set(-0.25 - clamp(-lb.x, 0, 2) * 0.25, 0, -up(lb.y))
    }
    // Mommy and Daddy watch the dancers (and her ribbons); Daddy dances once his flag's surprise comes.
    this.ji.lookAt(a.x, a.y, a.z)
    this.nick.lookAt(a.x, a.y, a.z)
    this.ji.update(dt, t)
    this.nick.update(dt, t)
    if (this.dancing) {
      const n = this.nick.rig
      const s = t * (Math.PI * 2 * (COPY.bpm / 60)) * 0.5
      n.body.rotation.z = Math.sin(s) * 0.22
      n.body.position.y = Math.abs(Math.sin(s)) * 0.12
      n.armL.rotation.set(-2.4 + Math.sin(s) * 0.4, 0, 0.5)
      n.armR.rotation.set(-2.4 - Math.sin(s) * 0.4, 0, -0.5)
    }
    // The finish's surprises.
    for (const g of this.gifts) {
      g.t += dt
      const pop = Math.min(1, g.t / 0.5)
      if (g.id === 'sandcastle') g.root.scale.setScalar(pop < 1 ? pop * (1.25 - 0.25 * pop) : 1)
    }
    this.castleCandles.forEach((c, i) => {
      // A candle flame on each tower, and its little pool of light.
      ;(c.material as MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 23 + i * 2) * 0.2
      const p = c.getWorldPosition(tmp)
      this.fire.add(p, 0.16, 0.24, 0, i * 0.31 + 0.5)
      this.halos.add(p.setY(p.y + 0.06), 0.9, '#FFB060', 0.5)
    })
    if (this.ski) {
      // Back and forth past the beach, its lights and its wake.
      const sk = this.ski
      sk.s += dt * 0.09
      const ph = (Math.sin(sk.s * Math.PI * 2 - Math.PI / 2) + 1) / 2
      const u = -32 + ph * 54
      const dir = Math.cos(sk.s * Math.PI * 2 - Math.PI / 2) >= 0 ? 1 : -1
      const p = this.L(u, 2.2 + Math.sin(sk.s * 9) * 0.3)
      sk.root.position.set(p.x, Math.max(0, this.isl.lagoon.heightAt(p.x, p.z, t, 10)) + 0.05, p.z)
      sk.root.rotation.y = Math.atan2(BAY.t.x * dir, BAY.t.z * dir)
      sk.root.rotation.z = Math.sin(t * 3) * 0.06
      sk.wake.push(sk.root.position.clone().setY(0.12), t, 0.05)
      sk.wake.update(t, UP)
    }
    for (const f of this.fish) {
      f.s += dt * f.speed
      const c = this.gifts.find((g) => g.id === 'snorkel')!.root.position
      const x = c.x + Math.sin(f.s) * f.r * 1.6
      const z = c.z + Math.cos(f.s) * f.r * 0.25
      f.jump -= dt
      let y = -0.15
      if (f.jump < 0) {
        // A little leap out of the waves now and then.
        const k = -f.jump / 0.8
        y = -0.15 + Math.sin(Math.PI * Math.min(1, k)) * 1.1
        if (k >= 1) {
          f.jump = 2.5 + Math.random() * 3.5
          sfx.plop()
          this.sparkle.burst(x, 0.1, z, 6, 1, 1.5, 0.08)
        }
      }
      f.root.position.set(x - c.x, y, z - c.z)
      f.root.rotation.y = f.s * Math.sign(f.speed) + (f.speed > 0 ? Math.PI / 2 : -Math.PI / 2)
      ;(f.glow.material as MeshBasicMaterial).opacity = 0.45 + Math.sin(t * 3 + f.r) * 0.2
    }
    // The ring of fire.
    const F = LOOK.flame
    for (let i = 0; i < RING.n; i++) {
      if (this.flameK[i] <= 0) continue
      this.flameK[i] = Math.min(1, this.flameK[i] + dt * 3)
      const e = this.flameK[i]
      const p = this.ringPoint(i, tmp3)
      const fl = 0.85 + Math.sin(t * 7 + i * 1.7) * 0.15
      const w = (i % 2 ? 0.95 : 1.15) * e * F
      this.pools.add(tmp.copy(p).setY(p.y + 0.04), 3.2 * e, '#FF7A30', 0.42 * LOOK.firelight * fl)
      p.y += 0.22 * w
      this.fire.add(p, w, w * 1.5 * fl, Math.sin(t * 1.3 + i) * 0.06, i * 0.618)
      if (Math.random() < 0.04) this.embers.emit(p.x, p.y + 1, p.z, 0, 0.8, 0, 0.9, 0.09)
    }
    // The dots she draws over twinkle; the big ring breathes.
    if (this.guide.count) {
      const m = new Object3D()
      const s = this.guideSize
      this.guidePts.forEach((q, i) => {
        this.planePoint(q.x * s, q.y * s, m.position)
        const tw = this.hit[i] ? 1.5 : 1 + Math.sin(t * 5 + i * 0.7) * 0.2
        m.scale.setScalar(tw * (this.phase === 'big' ? 1.3 : 1))
        m.updateMatrix()
        this.guide.setMatrixAt(i, m.matrix)
      })
      this.guide.instanceMatrix.needsUpdate = true
    }
    if (this.bubble && this.time > this.bubble.until) this.bubble = null
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  /** Her finger on the drawing plane, kept within reach. */
  private fingerPlane(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const hitP = this.raycaster.ray.intersectPlane(this.plane, tmp)
    if (!hitP) return null
    const l = this.planeLocal(hitP)
    return this.planePoint(clamp(l.x, -POI.reachW, POI.reachW), clamp(l.y, -1.3, POI.reachH), new Vector3())
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    // On the open sky or the sand she draws at once; on a thing (a dancer, Mommy) only once she moves.
    this.finger = { x, y, id, moved: false, drawing: !id, downX: x, downY: y }
    if (!id) this.startDraw()
  }
  private startDraw() {
    this.counts.draws++
    this.tracker.reset()
    jingle()
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    this.lastTouch = this.time
    f.x = x
    f.y = y
    if (!f.moved && Math.hypot(x - downX, y - downY) > 12) {
      f.moved = true
      if (!f.drawing) {
        f.drawing = true
        this.startDraw()
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
    if (this.phase === 'fireworks') {
      // A firework wherever she taps the sky.
      this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
      const to = this.raycaster.ray.at(45, new Vector3())
      to.y = Math.max(8, to.y)
      this.rocket(to)
      return
    }
    // A tap in the air: her poi jingle and sparkle.
    jingle()
    this.sparkle.burst(this.poiA.x, this.poiA.y, this.poiA.z, 10, 1.4, 1.4, 0.1)
  }

  private poke(id: string) {
    this.counts.pokes++
    if (id === 'kaylee') {
      this.kaylee.react('hop')
      sfx.boing()
    } else if (id === 'family:nick') {
      this.nick.react('hop')
      sfx.haha()
    } else if (id === 'family:ji') {
      this.ji.react('wave')
      sfx.giggle()
    } else if (id.startsWith('dancer:')) {
      // A dancer swings a ring of fire for her.
      const d = this.dancers[+id.slice(7)]
      d.ring = 1
      d.ringR = 1.3
      d.ringT = 0
      d.hop = 0.001
      sfx.whoosh(0.7)
      sfx.tukkae()
    } else if (id === 'drum') {
      this.drumHit = 1
      drum(true)
      this.dancers.forEach((d) => (d.hop = 0.001))
    }
  }

  private say(who: 'kaylee' | 'nick' | 'ji' | 'dancer', text: string, secs: number) {
    this.bubble = { who, text, until: this.time + secs }
    if (this.bubbleEl) this.bubbleEl.textContent = text
  }

  // ---------------------------------------------------------------- camera

  private shot(): Shot {
    // From the shallows, looking up the beach at her face, the dancers either side, the lanterns and the bar behind
    // her and the sky above for her ribbons, the lanterns of light and the fireworks.
    const c = this.L(KAY.u, KAY.v + 2.6)
    c.y += 1.9
    const b = this.tall ? CAM.tallBox : CAM.box
    const half = this.tall ? new Vector3(b, 2.8, 3.6) : new Vector3(b, 2, 3.6)
    return { center: c, half, yaw: SEAWARD * DEG, pitch: CAM.pitch, follow: true, minDist: 6, maxDist: 40 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
    if (this.snapPending && this.phaseT > 1.6) {
      // The photo of the fireworks (for Agong's wall, if there's no sunset photo), then the show's done.
      this.snapPending = false
      const src = this.renderer.domElement.toDataURL('image/jpeg', 0.8)
      this.events.done(src)
    }
  }

  /** The pressing finger: drawing a little circle before she's touched, along the dots she hasn't lit when stuck. */
  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    const idle = !this.finger && t - this.lastTouch > HINT_S
    if ((this.phase === 'twirl' || this.phase === 'intro' || this.phase === 'gifts') && (idle || this.counts.draws === 0) && this.phaseT > 1.5) {
      const a = t * 3
      at = this.planePoint(Math.sin(a) * 0.7, Math.cos(a) * 0.7)
    } else if ((this.phase === 'trace' && (idle || t - this.lastHit > SHAPE.stuck * 0.7)) || (this.phase === 'big' && idle)) {
      // Round the dots she still needs, one after another.
      const left = this.guidePts.map((q, i) => (this.hit[i] ? null : q)).filter((q): q is Pt => !!q)
      if (left.length) {
        const q = left[Math.floor(t * 4) % left.length]
        at = this.planePoint(q.x * this.guideSize, q.y * this.guideSize)
      }
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
    const place = (el: HTMLElement, base: Vector3 | null, height: number, scale = 1.2) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (base) {
        const c = this.toScreen(tmp.copy(base).setY(base.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.2, Math.abs(c.y - top.y) * 2 * scale)) }
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
      if (id === 'kaylee') place(el, this.kaylee.root.getWorldPosition(v), this.kaylee.height * 0.8, 0.8)
      else if (id === 'family:nick') place(el, this.nick.root.getWorldPosition(v), this.nick.height * (this.dancing ? 0.9 : 0.6), 0.9)
      else if (id === 'family:ji') place(el, this.ji.root.getWorldPosition(v), this.ji.height * 0.6, 0.9)
      else if (id.startsWith('dancer:')) {
        const d = this.dancers[+id.slice(7)]
        place(el, d.rig.root.getWorldPosition(v), d.rig.height * 0.8, 0.8)
      } else if (id === 'drum') place(el, this.drumG.position, 0.7, 1.2)
      el.style.zIndex = id === 'kaylee' ? '3' : '1'
    }
    const b = this.bubbleEl
    if (b) {
      const who = this.bubble?.who
      const m = who === 'kaylee' ? this.kaylee.root : who === 'nick' ? this.nick.root : who === 'ji' ? this.ji.root : who === 'dancer' ? this.dancers[0].rig.root : null
      if (m) {
        const p = m.getWorldPosition(v)
        const s = this.toScreen(p.setY(p.y + 1.6))
        b.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
      }
      const want = m ? '' : 'none'
      if (b.style.display !== want) b.style.display = want
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (p: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(p))
    const o = sc(this.O)
    const edge = sc(this.planePoint(1, 0))
    return {
      section: 'fireshow',
      round: this.round,
      phase: this.phase,
      roundLoops: this.loops,
      shape: this.phase === 'show' || this.phase === 'trace' ? this.shapeId : null,
      lit: this.hit.filter(Boolean).length,
      dotsShown: this.guide.count,
      giftsIn: this.gifts.map((g) => g.id),
      waiting: this.giftQueue,
      flames: this.flameK.filter((v) => v > 0).length,
      lanterns: this.lanterns.length,
      spin: +this.tracker.spin.toFixed(1),
      dancerSpin: +this.dancers[0].spin.toFixed(1),
      bubble: this.bubble?.text ?? null,
      // Her drawing plane on screen (its middle, and pixels per meter), for scripts that draw.
      plane: { x: o.x, y: o.y, ppm: Math.abs(edge.x - o.x) },
      shapeSize: this.guideSize,
      bigR: BIG.r,
      kaylee: sc(this.kaylee.root.position.clone().setY(this.kaylee.root.position.y + 0.6)),
      ...this.counts,
    }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.unwatch()
    this.guide.dispose()
    this.chains.dispose()
    this.lanternBody.dispose()
    this.scene.clear()
    this.bag.dispose()
  }
}

