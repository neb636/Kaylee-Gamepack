// The Poles' finale (greybox): Pole to Pole, then the Polar Quiz, on the hub's globe (globe/globe.ts's Earth parts).
//
// Fly: Terry the Arctic tern carries Pola's postcard from the top of the world to the bottom. The globe turns under him
// (his way is a string of great circles, route.ts): the Arctic's floes, then the warm middle of the world past the pins
// of the countries she has been to, then the cold southern sea. Her finger steers him left and right (he heads for
// where her finger is); fish leap in the sea and he gulps the ones he flies over. Warm: clouds to puff through. South:
// gusts push him sideways. At the end he lands at Pebble's colony.
// Deliver: he hands Pebble the postcard; she holds up Pola's picture and the colony jumps back (a polar bear!).
// Quiz: the camera pulls back to the whole globe and Sparkle asks six questions from a pool, each answered by doing
// (drag Pola to his pole, spin the South Pole to the front, tap the coldest pole, tap who visits both...). A wrong
// answer gets a silly reaction, then the right place glows and she does it herself: every question ends in a star.
// Six stars: the badge, then the trophy (Finale.tsx calls onWin). No voices yet (the full-loop gate).
import { CanvasTexture, Color, Euler, Group, Matrix4, Mesh, Plane, Quaternion, Raycaster, Scene, SphereGeometry, Sprite, SpriteMaterial, Vector2, Vector3, type BufferGeometry, type WebGLRenderer } from 'three'
import { bell, clamp, shuffle, smooth, sounds, span, wobble } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import { Bag } from '../../../../engine3d/dispose'
import { merge, P } from '../../../../engine3d/geo'
import { makeHull, setOutlineResolution } from '../../../../engine3d/outline'
import { makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { earthTexture, ll } from '../../globe/earth'
import { POLES_LOOKS } from '../../characters/looks'
import { buildNorth, buildSouth, Critter, domeR, makePebble, makePola, standOn, type EarthKit, type Floe } from '../../globe/globe'
import { globeMaterials } from '../../globe/material'
import { COLONY, latOf, lonOf, PINS, point, Route } from './route'
import { QUESTIONS, type PartySection, type Question } from './sections'

const FILE = 'src/world/places/poles/activities/party/party.ts'
/** How flying Terry feels (live in the feel lab: ?feel=1 on the finale's `fly` link). */
const FLY = knobs('tern', 'Fly Terry', FILE, {
  speed: { value: 2.2, min: 0.5, max: 8, step: 0.1, label: 'Flying speed', unit: '°/s', note: 'how fast the globe turns under him (degrees of the Earth a second)' },
  minTime: { value: 80, min: 20, max: 180, step: 5, label: 'Shortest flight', unit: 's', note: 'a long way (many countries visited) flies faster so the flight never takes longer than this… or less' },
  reach: { value: 0.17, min: 0.05, max: 0.35, step: 0.01, label: 'Reach', unit: '', note: 'how far left and right he can go (the globe is 1)' },
  follow: { value: 0.18, min: 0.02, max: 0.8, step: 0.01, label: 'Steer smoothing', unit: 's', note: 'how quickly he gets to where her finger is (lower = snappier)' },
  catch: { value: 0.045, min: 0.01, max: 0.12, step: 0.005, label: 'Catch width', unit: '', note: 'how close he has to fly to a fish to gulp it' },
  fishEvery: { value: 4.5, min: 1.5, max: 12, step: 0.5, label: 'Fish every', unit: '°', note: 'how far apart the fish are along the way' },
  gust: { value: 0.1, min: 0, max: 0.4, step: 0.01, label: 'Gusts (south)', unit: '/s', note: 'how hard the southern wind pushes him sideways' },
})

export type Leg = 'north' | 'warm' | 'south'
export interface PartyStart {
  section: PartySection
  leg: Leg
  /** The quiz: start on this question, with this many stars. */
  q: Question
  stars: number
  /** Countries she has been to (for the pins and Terry's way). */
  visited: string[]
}
export interface PartyEvents {
  section(s: PartySection, state?: Record<string, string>): void
  leg(l: Leg): void
  fish(n: number): void
  pin(place: string): void
  question(q: Question, n: number): void
  answer(right: boolean): void
  star(stars: number): void
  badge(): void
}

export const PARTY_ANCHORS: AnchorInfo[] = [
  { id: 'terry', label: 'Terry the Arctic tern: steer him', kind: 'thing' },
  { id: 'pebble', label: 'Pebble', kind: 'thing' },
  { id: 'colony', label: 'The penguins', kind: 'thing' },
  { id: 'globe', label: 'The globe: spin it', kind: 'thing' },
  { id: 'piece', label: 'Drag me onto the globe', kind: 'thing' },
  { id: 'north', label: 'The North Pole', kind: 'thing' },
  { id: 'south', label: 'The South Pole', kind: 'thing' },
  { id: 'opt0', label: 'Pick me', kind: 'thing' },
  { id: 'opt1', label: 'Pick me', kind: 'thing' },
  { id: 'opt2', label: 'Pick me', kind: 'thing' },
]

const DEG = Math.PI / 180
const UP = new Vector3(0, 1, 0)
/** How big Terry is (the rig's standing height; flying flat it's his length), in the Earth's units. */
const TERN_H = 0.07
/** Terry flying: the rig (head up +y, face +z) laid on its tummy, head first toward -z, back up. Standing: just turned
 *  round to face -z. */
const FLAT = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(-1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)))
const UPRIGHT = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))
/** Terry's height over the sea (the Earth is 1). */
const ALT = 0.075
const QUIZ_N = 6
/** The quiz's globe: tipped this far to show a pole. */
const POLE_VIEW = 40 * DEG
const SKY: Record<Leg | 'quiz', Color> = { north: new Color('#D3EEFF'), warm: new Color('#FFE6D2'), south: new Color('#E4DDFF'), quiz: new Color('#F6EEFF') }

const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()
const tq2 = new Quaternion()
const tm = new Matrix4()
const rp = point()

type Kind = 'drag' | 'spin' | 'tap' | 'pick'
const KIND: Record<Question, Kind> = { bear: 'drag', penguin: 'drag', south: 'spin', north: 'spin', ocean: 'tap', coldest: 'tap', tern: 'pick', summer: 'pick' }
/** The right answer: a pole, or which of the row. */
const RIGHT: Record<Question, 'north' | 'south' | number> = { bear: 'north', penguin: 'south', south: 'south', north: 'north', ocean: 'north', coldest: 'south', tern: 2, summer: 0 }

/** Six questions for a quiz: the asked one first, then others (never both "where's the North Pole" and "the South"). */
export function pickQuestions(first: Question, have: number) {
  const rest = shuffle(QUESTIONS.filter((q) => q !== first && !(first === 'north' && q === 'south') && !(first === 'south' && q === 'north')))
  const out: Question[] = [first]
  for (const q of rest) {
    if (out.length >= QUIZ_N - have) break
    if ((q === 'north' && out.includes('south')) || (q === 'south' && out.includes('north'))) continue
    out.push(q)
  }
  return out
}

interface Fish {
  o: Group
  body: Group
  /** On the globe, in the Earth's frame. */
  at: Vector3
  phase: number
  caught: number
}
interface Cloud {
  o: Group
  puffed: boolean
}
interface Pin {
  id: string
  o: Group
  at: Vector3
  popped: number
}

/** Something to tap, drag or pick in the quiz, standing on a little floe below the globe. */
interface Piece {
  o: Group
  /** The part that hops and turns. */
  body: Group
  critter?: Critter
  home: Vector3
  hopT: number
}

export class PartyWorld implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private mats: ReturnType<typeof globeMaterials>
  private earth = new Group()
  private w = 1
  private h = 1
  private time = 0
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private unwatch: () => void
  private section: PartySection
  private sky = SKY.north.clone()
  private floesN: Floe[]
  private floesS: Floe[]
  /** Is there land at this latitude and longitude (the painted map's continents)? Fish only leap in the sea. */
  private land: (lat: number, lon: number) => boolean

  // ---- Fly.
  private route: Route
  private s = 0
  private speed = 0
  private leg: Leg = 'north'
  private terry = new Group()
  private terryX = 0
  private terryVX = 0
  private goalX = 0
  private bank = 0
  private flip = -1
  private fish: Fish[] = []
  private clouds: Cloud[] = []
  private pins: Pin[] = []
  private caught = 0
  private gustT = 4
  private gust = 0
  private streaks: { s: Sprite; v: number; t: number }[] = []
  private streakMat: SpriteMaterial
  private puffMat: SpriteMaterial
  private puffs: { s: Sprite; v: Vector3; t: number }[] = []

  // ---- Deliver.
  private pebble: Critter
  private colony: Critter[] = []
  private card = new Group()
  private deliverT = -1
  private landFrom = new Vector3()

  // ---- Quiz.
  private quizT = -1
  private fromQ = new Quaternion()
  private pitch = 0
  private pitchVel = 0
  private rest = 0
  private yaw = 0
  private questions: Question[] = []
  private qi = 0
  private stars = 0
  private q: Question = 'bear'
  /** 'ask': waiting for her; 'right' / 'wrong': playing out the answer. */
  private qState: 'ask' | 'right' | 'wrong' | 'next' | 'done' = 'ask'
  private qT = 0
  private wrongPole: 'north' | 'south' | null = null
  private pieces: { bear: Piece; penguin: Piece; tern: Piece; snowman: Piece; ball: Piece }
  private row: Piece[] = []
  private held: Piece | null = null
  private heldAt = new Vector3()
  private grab: 'globe' | 'piece' | null = null
  private last = { x: 0, y: 0 }
  private finger = { x: 0, y: 0 }
  private dragged = false
  private glow: Sprite
  private glowT = -1
  private glowAt = new Vector3()
  private question: Sprite
  private questionT = -1
  private flag = new Group()
  private flagT = -1
  private thermo = new Group()
  private thermoT = -1
  private thermoCold = false
  private rock = new Group()
  private rockT = -1
  private sea: Fish[] = []
  private seaT = -1
  private sun: Sprite
  private sunOn = 0
  private nightStars: Sprite[] = []
  private loopT = -1

  constructor(
    private renderer: WebGLRenderer,
    start: PartyStart,
    private events: PartyEvents,
  ) {
    // The friends' toon rigs (characters/looks.ts) need the engine's ambient and sun; the globe draws its own light.
    makeLights(this.scene)
    this.scene.background = this.sky
    this.rig.fov = 40
    this.rig.lag = 0.5
    // (The world is small: Terry is a few centimeters long on a globe one meter round.)
    this.rig.camera.near = 0.01
    const map = this.bag.add(earthTexture())
    this.mats = this.bag.add(globeMaterials(map))
    this.land = landMask(map.image as HTMLCanvasElement)
    this.mats.sun.set(0.25, 1, 0.55).normalize()
    this.scene.add(this.earth)
    const sphere = this.bag.add(new SphereGeometry(1, 96, 64))
    const hull = makeHull(sphere, 3)
    this.bag.add(hull.geometry)
    this.earth.add(new Mesh(sphere, this.mats.land), hull)
    const kit: EarthKit = { spin: this.earth, bag: this.bag, prop: (g, px) => this.prop(g, px) }
    this.floesN = buildNorth(kit).floes
    this.floesS = buildSouth(kit)

    this.route = new Route(start.visited)
    this.speed = Math.max(FLY.speed * DEG, this.route.length / FLY.minTime)
    this.streakMat = this.bag.add(new SpriteMaterial({ map: this.bag.add(streakTexture()), transparent: true, depthWrite: false }))
    this.puffMat = this.bag.add(new SpriteMaterial({ map: this.bag.add(puffTexture()), transparent: true, depthWrite: false }))
    this.makeTerry()
    this.scatter(start.visited)

    // Pebble and the colony at the end of the way.
    const [clat, clon] = COLONY
    this.pebble = makePebble(kit, 'pebble')
    standOn(this.pebble.root, clat, clon, domeR(90 + clat) - 0.002)
    this.earth.add(this.pebble.root)
    for (let i = 0; i < 4; i++) {
      // The grown-up emperors (Papa's look) round her.
      const c = new Critter(0.15)
      c.dress(buildAnimal({ ...POLES_LOOKS.papa, height: 0.15 }, this.bag))
      // Two either side of Pebble, a step back (wide apart: the toys' heads are big, and Pebble is the star).
      standOn(c.root, clat - 0.8 - (i % 2) * 1.4, clon + (i < 2 ? -1 : 1) * (20 + (i % 2) * 18), domeR(90 + clat - 1.5) - 0.002)
      this.earth.add(c.root)
      this.colony.push(c)
    }
    this.makeCard()

    // The quiz's pieces, its glow, its "?" and its props.
    this.pieces = {
      bear: this.critterPiece(makePola(kit)),
      penguin: this.critterPiece(makePebble(kit)),
      tern: this.ternPiece(),
      snowman: this.snowmanPiece(),
      ball: this.ballPiece(),
    }
    this.glow = new Sprite(this.bag.add(new SpriteMaterial({ map: this.bag.add(glowTexture()), transparent: true, depthWrite: false, opacity: 0 })))
    this.glow.visible = false
    this.scene.add(this.glow)
    this.question = new Sprite(this.bag.add(new SpriteMaterial({ map: this.bag.add(questionTexture()), transparent: true, depthWrite: false })))
    this.question.visible = false
    this.scene.add(this.question)
    this.sun = new Sprite(this.bag.add(new SpriteMaterial({ map: this.bag.add(sunTexture()), transparent: true, depthWrite: false })))
    this.sun.visible = false
    this.scene.add(this.sun)
    const starMat = this.bag.add(new SpriteMaterial({ map: this.bag.add(starTexture()), transparent: true, depthWrite: false }))
    for (let i = 0; i < 9; i++) {
      const s = new Sprite(starMat)
      s.visible = false
      s.userData.phase = i * 1.7
      this.scene.add(s)
      this.nightStars.push(s)
    }
    this.makeQuizProps()

    // Where the link starts.
    this.section = start.section
    if (start.section === 'fly') {
      this.s = start.leg === 'warm' ? this.sAtLat(35) : start.leg === 'south' ? this.sAtLat(-40) : 0
      this.orientFly(1)
    } else {
      this.s = this.route.length
      this.orientFly(1)
      this.terry.visible = false
      if (start.section === 'deliver') this.startDeliver(true)
      else if (start.section === 'quiz') this.startQuiz(start.q, start.stars, true)
      else this.startQuiz('bear', QUIZ_N, true)
    }

    this.unwatch = watch('tern', () => ({
      'her finger (x)': [this.goalX, FLY.reach],
      'Terry (x)': [this.terryX, FLY.reach],
      'gust': [this.gust, 0.4],
      'fish': [this.caught, 40],
    }))
  }

  // ---------------------------------------------------------------- building

  private prop(geometry: BufferGeometry, px = 2) {
    const g = new Group()
    g.add(new Mesh(this.bag.add(geometry), this.mats.props))
    if (px > 0) {
      const hull = makeHull(geometry, px)
      this.bag.add(hull.geometry)
      g.add(hull)
    }
    return g
  }

  /** Terry the Arctic tern, the toy from the character lab: his long pointed wings hang from the rig's shoulders, so
   *  flying spreads them out sideways. `g` turns him so his nose points to -z (the way he flies). */
  private ternRig(height: number) {
    const rig = buildAnimal({ ...POLES_LOOKS.terry, height }, this.bag)
    rig.root.children[0].visible = false
    const g = new Group()
    g.add(rig.root)
    return { g, rig }
  }

  private makeTerry() {
    const { g, rig } = this.ternRig(TERN_H)
    this.ternPose = g
    this.ternRigged = rig
    this.ternLife = new FaceLife(rig, 'terry')
    g.quaternion.copy(FLAT)
    this.terry.add(g)
    this.terry.position.set(0, 1 + ALT, 0)
    this.scene.add(this.terry)
  }
  private ternPose = new Group()
  private ternRigged!: Rig
  private ternLife!: FaceLife
  /** Terry's wings: `open` 0 folded along his body, 1 straight out sideways; `flap` -1..1 beats them round that. */
  private flapWings(open: number, flap: number) {
    const z = open * (Math.PI / 2 + 0.45 * flap) + 0.08
    this.ternRigged.armR.rotation.z = z
    this.ternRigged.armL.rotation.z = -z
  }

  /** The fish, the clouds and the pins along the way. */
  private scatter(visited: string[]) {
    let r = 7
    const rand = () => ((r = (r * 9301 + 49297) % 233280) / 233280)
    for (let s = 5 * DEG; s < this.route.length - 4 * DEG; s += FLY.fishEvery * DEG) {
      this.route.at(s, rp)
      const lat = latOf(rp.p)
      // The cold southern sea has a few more fish; the warm middle has clouds between.
      const n = lat < -40 ? 2 : 1
      for (let k = 0; k < n; k++) {
        const off = (rand() * 2 - 1) * FLY.reach * 0.85
        const at = rp.p.clone().addScaledVector(rp.side, off).normalize()
        if (this.land(latOf(at), lonOf(at))) continue
        const o = new Group()
        const body = new Group()
        const pink = lat < -40 ? '#FF8FB8' : lat < 40 ? '#FFB24D' : '#B9C7FF'
        body.add(this.prop(merge([P.sphere(0.009, pink, { scale: [0.7, 1, 1.8] }), P.cone(0.007, 0.012, pink, { at: [0, 0, 0.019], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.0018, PAL.ink, { at: [0.005, 0.003, -0.01] })]), 1))
        o.add(body)
        standOn(o, 0, 0, 1)
        o.position.copy(at).multiplyScalar(1.004)
        o.quaternion.setFromUnitVectors(UP, at)
        this.earth.add(o)
        this.fish.push({ o, body, at, phase: rand() * 6, caught: -1 })
      }
      if (Math.abs(lat) < 38 && rand() < 0.35) {
        const off = (rand() * 2 - 1) * FLY.reach
        const at = rp.p.clone().addScaledVector(rp.side, off).normalize()
        const o = this.prop(merge([P.sphere(0.013, '#FFFFFF'), P.sphere(0.01, '#FFFFFF', { at: [0.013, -0.003, 0.002] }), P.sphere(0.0095, '#FFFFFF', { at: [-0.013, -0.003, -0.002] })]), 1.5)
        o.position.copy(at).multiplyScalar(1 + ALT + 0.004)
        o.quaternion.setFromUnitVectors(UP, at)
        this.earth.add(o)
        this.clouds.push({ o, puffed: false })
      }
    }
    for (const id of visited) {
      const ll0 = PINS[id]
      if (!ll0) continue
      const o = this.prop(merge([P.cyl(0.003, 0.003, 0.05, PAL.ink, { at: [0, 0.025, 0] }), P.sphere(0.012, '#FF4F9A', { at: [0, 0.055, 0] })]), 1.5)
      standOn(o, ll0[0], ll0[1], 1)
      this.earth.add(o)
      this.pins.push({ id, o, at: ll(ll0[0], ll0[1]), popped: -1 })
    }
  }

  /** Pola's postcard: a white card with a pink edge and a little polar bear's face on it. */
  private makeCard() {
    this.card.add(
      this.prop(
        merge([
          P.box(0.05, 0.034, 0.002, '#FF9EC4'),
          P.box(0.044, 0.028, 0.0025, '#FFFFFF', { at: [0, 0, 0.0004] }),
          P.sphere(0.008, '#FFFFFF', { at: [0, -0.002, 0.003], scale: [1, 1, 0.4] }),
          P.sphere(0.003, '#FFFFFF', { at: [0.006, 0.005, 0.003], scale: [1, 1, 0.4] }),
          P.sphere(0.003, '#FFFFFF', { at: [-0.006, 0.005, 0.003], scale: [1, 1, 0.4] }),
          P.sphere(0.0015, PAL.ink, { at: [0.003, 0, 0.0045] }),
          P.sphere(0.0015, PAL.ink, { at: [-0.003, 0, 0.0045] }),
          P.sphere(0.0017, PAL.ink, { at: [0, -0.004, 0.0045] }),
        ]),
        1.2,
      ),
    )
    this.card.visible = false
    this.scene.add(this.card)
  }

  private standee(top: Group, floe = true) {
    const o = new Group()
    const body = new Group()
    body.add(top)
    o.add(body)
    if (floe) o.add(this.prop(P.cyl(0.09, 0.1, 0.03, '#F4FBFF', { at: [0, -0.015, 0], scale: [1, 1, 0.7] }, 9), 1.5))
    o.visible = false
    o.userData.size = 1.5
    this.scene.add(o)
    return { o, body, home: new Vector3(), hopT: -1 } as Piece
  }
  private critterPiece(c: Critter) {
    c.root.scale.setScalar(1.6)
    const p = this.standee(c.root)
    p.critter = c
    return p
  }
  private ternPiece() {
    const { g } = this.ternRig(0.17)
    return this.standee(g)
  }
  private snowmanPiece() {
    return this.standee(
      this.prop(
        merge([
          P.sphere(0.07, '#FFFFFF', { at: [0, 0.06, 0] }),
          P.sphere(0.05, '#FFFFFF', { at: [0, 0.16, 0] }),
          P.cone(0.01, 0.04, '#FF9E6B', { at: [0, 0.165, 0.06], rot: [Math.PI / 2, 0, 0] }),
          P.sphere(0.007, PAL.ink, { at: [0.018, 0.18, 0.042] }),
          P.sphere(0.007, PAL.ink, { at: [-0.018, 0.18, 0.042] }),
          P.torus(0.04, 0.012, '#FF4F9A', { at: [0, 0.125, 0], rot: [Math.PI / 2, 0, 0] }),
        ]),
        2,
      ),
    )
  }
  private ballPiece() {
    const parts: BufferGeometry[] = []
    const colors = ['#FF4F9A', '#FFFFFF', '#FFD84D', '#FFFFFF', '#7EC8F2', '#FFFFFF']
    for (let i = 0; i < 6; i++) parts.push(P.sphere(0.075, colors[i], { at: [0, 0.075, 0], rot: [0, (i * Math.PI) / 3, 0], scale: [0.36, 1, 1] }))
    return this.standee(this.prop(merge(parts), 2), false)
  }

  /** The quiz's little things on the globe: a North Pole flag, a thermometer, a rock under Antarctica's ice. */
  private makeQuizProps() {
    this.flag.add(this.prop(merge([P.cyl(0.006, 0.006, 0.16, PAL.ink, { at: [0, 0.08, 0] }), P.prism([[0, 0], [0.08, -0.02], [0, -0.04]], 0.006, '#FF4F9A', { at: [0.004, 0.16, 0] }), P.sphere(0.012, PAL.gold, { at: [0, 0.166, 0] })]), 1.5))
    this.flag.visible = false
    this.earth.add(this.flag)
    this.thermo.add(this.prop(merge([P.rbox(0.03, 0.14, 0.012, 0.01, '#FFFFFF', { at: [0, 0.08, 0] }), P.sphere(0.02, '#FF4F7B', { at: [0, 0.015, 0] }), P.box(0.008, 0.08, 0.016, '#FF4F7B', { at: [0, 0.07, 0] })]), 1.5))
    const ice = this.prop(P.rbox(0.06, 0.17, 0.04, 0.014, '#CFEFFF', { at: [0, 0.08, 0] }), 1.5)
    ice.name = 'ice'
    ice.visible = false
    this.thermo.add(ice)
    this.thermo.visible = false
    this.earth.add(this.thermo)
    this.rock.add(this.prop(merge([P.sphere(0.05, '#9A8F86', { scale: [1.3, 0.8, 1] }), P.sphere(0.03, '#B3A89E', { at: [0.04, 0.01, 0.01] })]), 1.5))
    this.rock.visible = false
    this.earth.add(this.rock)
    for (let i = 0; i < 4; i++) {
      const o = new Group()
      const body = new Group()
      body.add(this.prop(merge([P.sphere(0.014, '#FFB24D', { scale: [0.7, 1, 1.8] }), P.cone(0.01, 0.018, '#FFB24D', { at: [0, 0, 0.028], rot: [Math.PI / 2, 0, 0] })]), 1.2))
      o.add(body)
      standOn(o, 76, i * 90 + 20, 1.003)
      o.visible = false
      this.earth.add(o)
      this.sea.push({ o, body, at: o.position.clone(), phase: i * 1.6, caught: -1 })
    }
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    // Close behind Terry, looking down his way, with room either side for his reach.
    if (this.section === 'fly') return { center: new Vector3(0, 1.04, -0.16), half: new Vector3(FLY.reach + 0.05, 0.04, 0.2), yaw: 0, pitch: 24, minDist: 0.05, maxDist: 4 }
    if (this.section === 'deliver') return { center: new Vector3(0, 1.14, 0), half: new Vector3(0.3, 0.13, 0.14), yaw: 0, pitch: 16, minDist: 0.05, maxDist: 4 }
    // The whole globe, with the row of pieces under it and room above for the badge.
    return { center: new Vector3(0, -0.38, 0), half: new Vector3(1.12, 1.56, 0.3), yaw: 0, pitch: 4 }
  }

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }

  get calm() {
    return false
  }

  // ---------------------------------------------------------------- every frame

  update(dt: number) {
    const t = (this.time += dt)
    if (this.section === 'fly') this.updateFly(dt, t)
    else if (this.section === 'deliver') this.updateDeliver(dt, t)
    else this.updateQuiz(dt, t)
    const cam = this.rig.camera.position
    this.pebble.update(dt, t, cam)
    for (const c of this.colony) c.update(dt, t, cam)
    for (const f of [...this.floesN, ...this.floesS]) {
      f.o.position.copy(f.dir).multiplyScalar(1.004 + 0.004 * Math.sin(t * 1.4 + f.phase))
    }
    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]
      p.t += dt
      p.v.multiplyScalar(Math.exp(-dt * 3))
      p.s.position.addScaledVector(p.v, dt)
      p.s.scale.setScalar(0.02 + 0.04 * p.t)
      if (p.t > 0.7) {
        p.s.removeFromParent()
        this.puffs.splice(i, 1)
      }
    }
    const goal = this.section === 'fly' ? SKY[this.leg] : this.section === 'deliver' ? SKY.south : SKY.quiz
    this.sky.lerp(goal, 1 - Math.exp(-dt * 1.5))
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  /** The Earth turned so the point `s` along the way is under Terry and the way runs away from her. */
  private orientFly(k: number) {
    this.route.at(this.s, rp)
    tm.makeBasis(rp.side, rp.p, tmp.copy(rp.t).negate())
    tq.setFromRotationMatrix(tm).invert()
    this.earth.quaternion.slerp(tq, k)
  }

  private sAtLat(lat: number) {
    for (let s = 0; s < this.route.length; s += 0.5 * DEG) if (latOf(this.route.at(s, rp).p) < lat) return s
    return 0
  }

  private updateFly(dt: number, t: number) {
    this.s += this.speed * dt
    this.orientFly(1 - Math.exp(-dt * 2.5))
    const lat = latOf(this.route.at(this.s, rp).p)
    const leg: Leg = lat > 40 ? 'north' : lat < -40 ? 'south' : 'warm'
    if (leg !== this.leg) {
      this.leg = leg
      sounds.whoosh()
      this.events.leg(leg)
    }

    // Steering: he heads for her finger, banks into the turn; the south's gusts push him about.
    if (leg === 'south' && (this.gustT -= dt) < 0) {
      this.gustT = 4 + Math.random() * 3
      this.gust = FLY.gust * (Math.random() < 0.5 ? -1 : 1)
      tone(300, 180, 0.6, 0.04, 'sawtooth')
      for (let i = 0; i < 5; i++) {
        const s = new Sprite(this.streakMat)
        s.position.set(-Math.sign(this.gust) * 0.3, 1 + ALT + (Math.random() - 0.3) * 0.05, -0.05 - Math.random() * 0.3)
        s.scale.set(0.09, 0.012, 1)
        this.scene.add(s)
        this.streaks.push({ s, v: Math.sign(this.gust) * (0.5 + Math.random() * 0.3), t: 0 })
      }
    }
    this.gust *= Math.exp(-dt * 0.9)
    const before = this.terryX
    const k = FLY.follow > 0 ? 1 - Math.exp(-dt / FLY.follow) : 1
    this.terryX += (this.goalX - this.terryX) * k + this.gust * dt
    this.terryX = clamp(this.terryX, -FLY.reach, FLY.reach)
    this.terryVX = (this.terryX - before) / Math.max(dt, 1e-3)
    this.bank += (clamp(-this.terryVX * 3, -0.8, 0.8) - this.bank) * (1 - Math.exp(-dt * 8))
    this.terry.position.set(this.terryX, 1 + ALT + 0.004 * Math.sin(t * 3), 0)
    this.terry.rotation.set(0, 0, this.bank)
    if (this.flip >= 0) {
      this.flip += dt
      this.terry.rotation.z += smooth(clamp(this.flip / 0.6, 0, 1)) * Math.PI * 2
      if (this.flip > 0.6) this.flip = -1
    }
    this.ternLife.update(dt)
    this.flapWings(1, Math.sin(t * 12))

    for (let i = this.streaks.length - 1; i >= 0; i--) {
      const st = this.streaks[i]
      st.t += dt
      st.s.position.x += st.v * dt
      st.s.material.opacity = 1 - st.t
      if (st.t > 1) {
        st.s.removeFromParent()
        this.streaks.splice(i, 1)
      }
    }

    // Fish leap; the ones he flies over are his.
    const tx = this.terryX
    for (const f of this.fish) {
      if (f.caught >= 1) continue
      if (f.caught >= 0) {
        f.caught += dt / 0.25
        f.o.getWorldPosition(tmp)
        tmp.lerp(this.terry.position, smooth(Math.min(1, f.caught)))
        f.o.position.copy(this.earth.worldToLocal(tmp))
        f.o.scale.setScalar(1 - 0.6 * f.caught)
        if (f.caught >= 1) f.o.visible = false
        continue
      }
      f.body.position.y = 0.022 * Math.max(0, Math.sin(t * 3.4 + f.phase))
      f.body.rotation.x = 0.8 * Math.cos(t * 3.4 + f.phase)
      f.o.getWorldPosition(tmp)
      if (tmp.y > 0.9 && Math.abs(tmp.z) < 0.03 && Math.abs(tmp.x - tx) < FLY.catch) {
        f.caught = 0
        this.caught++
        sounds.note(this.caught % 11)
        this.events.fish(this.caught)
      }
    }
    for (const c of this.clouds) {
      c.o.getWorldPosition(tmp)
      if (!c.puffed && Math.abs(tmp.z) < 0.03 && Math.abs(tmp.x - tx) < 0.05) {
        c.puffed = true
        c.o.visible = false
        this.puff(tmp, 8)
        this.flip = 0
        tone(500, 900, 0.3, 0.06, 'triangle')
      }
    }
    for (const p of this.pins) {
      this.earth.localToWorld(tmp.copy(p.at))
      if (p.popped < 0 && Math.abs(tmp.z) < 0.12 && tmp.y > 0.9) {
        p.popped = 0
        sounds.sparkle()
        this.events.pin(p.id)
      }
      if (p.popped >= 0) {
        p.popped += dt
        p.o.scale.setScalar(1 + 0.6 * bell(clamp(p.popped / 0.6, 0, 1)))
      }
    }

    if (this.s >= this.route.length) this.startDeliver(false)
  }

  private puff(at: Vector3, n: number) {
    for (let i = 0; i < n; i++) {
      const s = new Sprite(this.puffMat)
      s.position.copy(at)
      this.scene.add(s)
      this.puffs.push({ s, v: new Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.15, (Math.random() - 0.5) * 0.3), t: 0 })
    }
  }

  // ---------------------------------------------------------------- the postcard

  private startDeliver(snap: boolean) {
    this.section = 'deliver'
    this.deliverT = snap ? 1.2 : 0
    this.landFrom.copy(this.terry.position)
    this.terry.visible = true
    this.events.section('deliver')
    if (snap) this.rig.setShot(this.shot(), true)
  }

  private updateDeliver(dt: number, t: number) {
    this.orientFly(1 - Math.exp(-dt * 4))
    const d = (this.deliverT += dt)
    // He glides down in front of Pebble and lands.
    // (In front of Pebble as she sees it: toward the camera.)
    const spot = this.pebble.root.getWorldPosition(tmp2).add(tmp.set(0.05, 0, 0.07))
    const k = smooth(clamp(d / 1.2, 0, 1))
    this.terry.position.lerpVectors(this.landFrom, spot, k)
    this.terry.position.y += 0.03 * bell(k)
    this.terry.rotation.set(0, Math.PI * k, 0)
    // He tips up from flying flat to standing, and folds his wings when he lands.
    this.ternPose.quaternion.slerpQuaternions(FLAT, UPRIGHT, smooth(span(d, 0.6, 1.3)))
    this.ternLife.update(dt)
    this.flapWings(1 - smooth(span(d, 1.1, 1.5)), d < 1.2 ? Math.sin(t * 12) : 0)
    if (d - dt < 1.2 && d >= 1.2) sfx.thump()
    // The card: out of his beak, up into Pebble's flippers, held up high.
    this.card.visible = d > 1.5
    if (d > 1.5) {
      const from = this.terry.localToWorld(tmp.set(0, 0.01, 0.04))
      const to = this.pebble.root.localToWorld(tmp2.set(0, 0.2, 0.02))
      this.card.position.lerpVectors(from, to, smooth(span(d, 1.8, 2.5)))
      this.card.quaternion.copy(this.rig.camera.quaternion)
      this.card.scale.setScalar(1 + 0.25 * bell(span(d, 2.5, 3)))
    }
    if (d - dt < 1.6 && d >= 1.6) sounds.pop()
    if (d - dt < 2.5 && d >= 2.5) {
      this.pebble.hop(true)
      sounds.sparkle()
    }
    // The colony sees Pola's picture: a polar bear! They all jump back.
    if (d - dt < 3.1 && d >= 3.1) {
      tone(700, 1100, 0.25, 0.07, 'triangle')
      this.colony.forEach((c) => c.hop())
    }
    if (d > 3.1) for (const c of this.colony) c.body.position.z = -0.03 * smooth(span(d, 3.1, 3.5))
    if (d - dt < 5 && d >= 5) {
      this.pebble.hop(true)
      this.colony.forEach((c) => c.hop(true))
      sounds.fanfare()
    }
    if (d > 7.5) this.startQuiz('bear', 0, false)
  }

  // ---------------------------------------------------------------- the quiz

  private startQuiz(first: Question, stars: number, snap: boolean) {
    this.section = 'quiz'
    this.card.visible = false
    this.terry.visible = false
    this.pebble.root.visible = false
    this.colony.forEach((c) => (c.root.visible = false))
    this.fish.forEach((f) => (f.o.visible = false))
    this.clouds.forEach((c) => (c.o.visible = false))
    this.fromQ.copy(this.earth.quaternion)
    this.quizT = snap ? 9 : 0
    this.yaw = 0.6
    this.stars = Math.min(QUIZ_N, stars)
    this.questions = pickQuestions(first, this.stars)
    this.qi = 0
    if (this.stars >= QUIZ_N) return this.finish()
    if (snap) this.rig.setShot(this.shot(), true)
    this.ask()
  }

  private ask() {
    this.q = this.questions[this.qi]
    this.qState = 'ask'
    this.qT = 0
    this.rest = 0
    this.wrongPole = null
    for (const p of Object.values(this.pieces)) p.o.visible = false
    this.flag.visible = this.thermo.visible = this.rock.visible = false
    this.sea.forEach((f) => (f.o.visible = false))
    this.sunOn = 0
    // Who stands in the row under the globe for this one.
    const P0 = this.pieces
    const kind = KIND[this.q]
    this.row = kind === 'drag' ? [this.q === 'bear' ? P0.bear : P0.penguin] : this.q === 'tern' ? [P0.bear, P0.penguin, P0.tern] : this.q === 'summer' ? [P0.snowman, P0.ball] : []
    const xs = this.row.length === 1 ? [0] : this.row.length === 2 ? [-0.38, 0.38] : [-0.6, 0, 0.6]
    this.row.forEach((p, i) => {
      p.home.set(xs[i], -1.42, 0.25)
      p.o.position.copy(p.home)
      p.o.quaternion.identity()
      p.o.scale.setScalar(p.o.userData.size)
      p.o.visible = true
      p.hopT = 0
      if (p.critter) {
        p.critter.root.position.set(0, 0, 0)
        p.critter.root.quaternion.identity()
      }
    })
    if (this.q === 'summer') this.sunOn = 0.001
    this.events.question(this.q, this.stars)
    this.events.section('quiz', { q: this.q, stars: String(this.stars) })
  }

  /** She answered: right (a star), or not (a silly bit, then the right thing glows and she tries again). */
  private answer(right: boolean, wrongPole: 'north' | 'south' | null = null) {
    if (this.qState !== 'ask') return
    this.qT = 0
    this.events.answer(right)
    if (right) {
      this.qState = 'right'
      sounds.correct()
      this.stars++
      this.events.star(this.stars)
    } else {
      this.qState = 'wrong'
      this.wrongPole = wrongPole
      tone(420, 300, 0.35, 0.07, 'triangle')
    }
  }

  private finish() {
    this.qState = 'done'
    for (const p of Object.values(this.pieces)) p.o.visible = false
    this.events.section('badge')
    this.events.badge()
  }

  private poleWorld(pole: 'north' | 'south', out: Vector3, r = 1.06) {
    return this.earth.localToWorld(out.set(0, pole === 'north' ? r : -r * 1.04, 0))
  }

  private glowOn(at: Vector3) {
    this.glowAt.copy(at)
    this.glowT = 0
  }

  private rightThing() {
    const r = RIGHT[this.q]
    if (typeof r === 'number') return this.row[r].o.getWorldPosition(tmp2).add(tmp.set(0, 0.1, 0))
    return this.poleWorld(r, tmp2, 1.1)
  }

  private updateQuiz(dt: number, t: number) {
    // The globe swings round from the flight to the whole Earth, north up, then turns on its own slowly.
    if (this.quizT >= 0) this.quizT += dt
    if (!(this.grab === 'globe')) {
      const k = 9
      this.pitchVel += (k * k * (this.rest - this.pitch) - 2 * k * 0.55 * this.pitchVel) * dt
      this.pitch += this.pitchVel * dt
    }
    this.yaw += dt * 0.08
    tq.setFromAxisAngle(tmp.set(1, 0, 0), this.pitch).multiply(tq2.setFromAxisAngle(UP, this.yaw))
    const blend = smooth(clamp(this.quizT / 1.4, 0, 1))
    this.earth.quaternion.slerpQuaternions(this.fromQ, tq, blend)
    if (this.qState === 'done') return

    // The pieces under the globe breathe and hop; a held one follows her finger.
    for (const p of this.row) {
      if (p === this.held) {
        p.o.position.lerp(this.heldAt, 1 - Math.exp(-dt * 18))
        p.body.rotation.z = 0.2 * Math.sin(t * 9)
        continue
      }
      if (p.hopT >= 0) {
        p.hopT += dt
        if (p.hopT > 0.6) p.hopT = -1
      }
      const hop = p.hopT >= 0 ? bell(p.hopT / 0.6) : 0
      p.body.position.y = 0.08 * hop
      p.body.scale.set(1, 1 + 0.03 * Math.sin(t * 2.6), 1)
      p.critter?.update(dt, t, this.rig.camera.position)
    }

    // The sun for the summer question: it rises over the north, and the south goes dark.
    if (this.sunOn > 0) {
      this.sunOn = Math.min(1, this.sunOn + dt / 1.2)
      this.sun.visible = true
      this.sun.position.set(-0.9, 1.15, 0.3)
      this.sun.scale.setScalar(0.42 * smooth(this.sunOn) * (1 + 0.04 * Math.sin(t * 3)))
      this.mats.sun.set(-0.2, 0.95, 0.35).normalize()
    } else {
      this.sun.visible = false
      this.mats.sun.set(0.3, 0.45, 1).normalize()
    }
    const night = this.q === 'summer' && this.qState === 'right'
    this.nightStars.forEach((s, i) => {
      s.visible = night
      if (night) {
        const a = (i / this.nightStars.length) * Math.PI * 1.2 - Math.PI * 0.6
        this.poleWorld('south', s.position, 1.3).add(tmp.set(Math.sin(a) * 0.5, -Math.abs(Math.cos(a)) * 0.15, 0.2))
        s.scale.setScalar(0.07 * (1 + 0.3 * Math.sin(t * 4 + s.userData.phase)) * smooth(clamp(this.qT / 0.5, 0, 1)))
      }
    })

    this.qT += dt
    if (this.qState === 'right') this.playRight(dt, t)
    else if (this.qState === 'wrong') this.playWrong(dt, t)
    else if (this.qState === 'next' && this.qT > 0.4) {
      this.qi++
      if (this.stars >= QUIZ_N || this.qi >= this.questions.length) this.finish()
      else this.ask()
    }

    // The glow on the right thing after a miss; the "?" over a puzzled one.
    if (this.glowT >= 0) {
      this.glowT += dt
      this.glow.visible = true
      this.glow.position.copy(this.glowAt)
      this.glow.material.opacity = 0.85 * Math.min(1, this.glowT / 0.3) * (0.7 + 0.3 * Math.sin(this.glowT * 8))
      this.glow.scale.setScalar(0.55 + 0.06 * Math.sin(this.glowT * 8))
      if (this.qState === 'right' || this.glowT > 8) {
        this.glowT = -1
        this.glow.visible = false
      }
    }
    if (this.questionT >= 0) {
      this.questionT += dt
      this.question.visible = this.questionT < 2
      this.question.scale.setScalar(0.16 * (1 + 0.15 * wobble(clamp(this.questionT / 0.5, 0, 1), 2)))
      if (this.questionT > 2) this.questionT = -1
    }
    this.updateProps(dt, t)
  }

  /** The answer plays out, then the next question. */
  private playRight(dt: number, t: number) {
    const d = this.qT
    const kind = KIND[this.q]
    if (kind === 'spin') {
      if (d - dt < 0.01) {
        this.flagT = 0
        standOn(this.flag, this.q === 'north' ? 90 : -90, 0, this.q === 'north' ? 1.02 : domeR(0))
        this.flag.visible = true
      }
    }
    if (kind === 'pick' && this.q === 'tern') {
      // Terry flies a loop round the globe.
      const p = this.pieces.tern
      if (this.loopT < 0) this.loopT = 0
      this.loopT += dt
      const a = smooth(clamp(this.loopT / 2.2, 0, 1)) * Math.PI * 2
      p.o.position.set(p.home.x * Math.cos(a) + Math.sin(a) * 1.25, p.home.y * Math.cos(a) + 1.25 * Math.sin(a) * 0.4 + (1 - Math.cos(a)) * 0.8, 0.35)
      p.o.position.lerp(p.home, smooth(span(this.loopT, 2.0, 2.4)))
    } else if (kind === 'pick') {
      this.row[0].hopT = this.row[0].hopT < 0 && Math.floor(d * 2) !== Math.floor((d - dt) * 2) ? 0 : this.row[0].hopT
    }
    if (d > (this.q === 'tern' ? 2.6 : 2.2)) {
      this.loopT = -1
      this.qState = 'next'
      this.qT = 0
    }
    void t
  }

  private playWrong(dt: number, _t: number) {
    const d = this.qT
    if (d - dt < 0.01) {
      this.questionT = 0
      const kind = KIND[this.q]
      if (kind === 'spin') {
        // The globe wobbles back like a top.
        this.rest = 0
        this.pitchVel += 3
      }
      if (kind === 'tap' && this.wrongPole) {
        if (this.q === 'ocean') {
          this.rockT = 0
          standOn(this.rock, -90, 0, domeR(0) - 0.01)
          this.rock.visible = true
          sfx.thump()
        } else {
          this.thermoT = 0
          this.thermoCold = false
          standOn(this.thermo, 90, 0, 1.02)
          this.thermo.visible = true
        }
      }
    }
    // The "?" sits over whatever went wrong.
    const held = this.row.find((p) => p.o.userData.away)
    if (held) this.question.position.copy(held.o.position).add(tmp.set(0, 0.32, 0))
    else if (this.wrongPole) this.poleWorld(this.wrongPole, this.question.position, 1.35)
    else if (this.row[0]) this.question.position.copy(this.row[0].o.position).add(tmp.set(0, 0.35, 0))
    else this.question.position.set(0, 1.3, 0.3)
    if (d > 1.6) {
      // Back where it came from, and the right one glows: she does it herself.
      for (const p of this.row) {
        if (p.o.userData.away) {
          p.o.userData.away = false
          p.o.position.copy(p.home)
          p.o.quaternion.identity()
          p.hopT = 0
        }
      }
      this.rock.visible = false
      if (this.thermoT >= 0 && !this.thermoCold) this.thermo.visible = false
      this.glowOn(this.rightThing())
      this.qState = 'ask'
      this.qT = 0
    }
  }

  private updateProps(dt: number, t: number) {
    if (this.flagT >= 0) {
      this.flagT += dt
      this.flag.scale.setScalar(Math.max(0.01, smooth(clamp(this.flagT / 0.4, 0, 1)) * (1 + 0.2 * wobble(clamp((this.flagT - 0.4) / 0.6, 0, 1), 2))))
    }
    if (this.thermoT >= 0) {
      this.thermoT += dt
      const pop = smooth(clamp(this.thermoT / 0.35, 0, 1))
      this.thermo.scale.setScalar(Math.max(0.01, pop))
      // Up north it shivers; on the South Pole it freezes solid with a crack.
      this.thermo.rotation.y = this.thermoCold ? 0 : 0.15 * Math.sin(this.thermoT * 30)
      const ice = this.thermo.getObjectByName('ice')!
      ice.visible = this.thermoCold && this.thermoT > 0.6
      ice.scale.setScalar(this.thermoCold ? smooth(span(this.thermoT, 0.6, 0.8)) : 1)
      if (this.thermoCold && this.thermoT - dt < 0.6 && this.thermoT >= 0.6) {
        tone(1800, 400, 0.12, 0.08, 'square')
        tone(1400, 300, 0.1, 0.06, 'square', 0.06)
      }
    }
    if (this.rockT >= 0) {
      this.rockT += dt
      this.rock.scale.setScalar(Math.max(0.01, smooth(clamp(this.rockT / 0.3, 0, 1)) * (1 + 0.15 * wobble(clamp((this.rockT - 0.3) / 0.5, 0, 1), 2))))
    }
    if (this.seaT >= 0) {
      this.seaT += dt
      this.sea.forEach((f) => {
        f.o.visible = this.seaT < 2.4
        f.body.position.y = 0.05 * Math.max(0, Math.sin(this.seaT * 5 + f.phase))
        f.body.rotation.x = Math.cos(this.seaT * 5 + f.phase)
      })
      if (this.seaT > 2.4) this.seaT = -1
    }
    void t
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private globeOnScreen() {
    const c = this.toScreen(tmp.set(0, 0, 0))
    const e = this.toScreen(tmp.set(1, 0, 0).applyQuaternion(this.rig.camera.quaternion))
    return { x: c.x, y: c.y, r: Math.max(1, Math.hypot(e.x - c.x, e.y - c.y)) }
  }
  /** The point under her finger in front of the globe. */
  private inFront(x: number, y: number) {
    const cam = this.rig.camera
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), cam)
    const plane = new Plane().setFromNormalAndCoplanarPoint(cam.getWorldDirection(new Vector3()), tmp.set(0, 0, 0.35))
    return this.raycaster.ray.intersectPlane(plane, new Vector3()) ?? tmp.set(0, 0, 0.35)
  }
  private steer(x: number) {
    this.goalX = clamp((x - this.w / 2) / (Math.min(this.w, this.h) * 0.42), -1, 1) * FLY.reach
  }

  pointerDown(x: number, y: number, id?: string) {
    this.last = { x, y }
    this.finger = { x, y }
    this.dragged = false
    if (this.section === 'fly') return this.steer(x)
    if (this.section !== 'quiz' || this.qState !== 'ask') return
    const kind = KIND[this.q]
    if (kind === 'drag' && (id === 'piece' || (!id && this.nearPiece(x, y)))) {
      this.held = this.row[0]
      this.grab = 'piece'
      this.heldAt.copy(this.held.o.position)
      sounds.pickup()
    } else if (kind === 'spin' && (id === 'globe' || !id)) {
      this.grab = 'globe'
      this.pitchVel = 0
    }
  }

  private nearPiece(x: number, y: number) {
    const p = this.row[0]
    if (!p) return false
    const s = this.toScreen(p.o.getWorldPosition(tmp))
    return Math.hypot(x - s.x, y - s.y) < 90
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held) return
    if (Math.hypot(x - this.last.x, y - this.last.y) > 12) this.dragged = true
    if (this.section === 'fly') return this.steer(x)
    if (this.grab === 'piece') {
      this.heldAt.copy(this.inFront(x, y))
      this.finger = { x, y }
    }
    else if (this.grab === 'globe') {
      const g = this.globeOnScreen()
      const dy = y - this.last.y
      this.last = { x, y }
      this.pitch = clamp(this.pitch + dy / g.r, -POLE_VIEW * 1.6, POLE_VIEW * 1.6)
    }
  }

  pointerUp() {
    const grab = this.grab
    this.grab = null
    if (grab === 'piece' && this.held) {
      const p = this.held
      this.held = null
      const g = this.globeOnScreen()
      // Where her finger let go (the piece trails a little behind it).
      const dy = (this.finger.y - g.y) / g.r
      const pole = dy < -0.4 ? 'north' : dy > 0.4 ? 'south' : null
      if (!pole || !this.dragged) {
        p.o.position.copy(p.home)
        if (this.dragged) sfx.splash()
        return
      }
      // It lands on that pole (where she can see it), a little bigger than life.
      p.o.userData.away = true
      this.poleWorld(pole, p.o.position, pole === 'north' ? 1.04 : 1.12)
      p.o.position.z += 0.1
      sfx.thump()
      p.hopT = 0
      this.answer(pole === RIGHT[this.q], pole)
      if (pole === RIGHT[this.q]) p.critter?.hop(true)
    } else if (grab === 'globe') {
      const pv = POLE_VIEW
      this.rest = this.pitch > pv / 2 ? pv : this.pitch < -pv / 2 ? -pv : 0
      if (this.rest !== 0) {
        const pole = this.rest > 0 ? 'north' : 'south'
        sounds.whoosh()
        this.answer(pole === RIGHT[this.q], pole)
      }
    }
  }

  tap(x: number, _y: number, id?: string) {
    if (this.section === 'fly') {
      if (id === 'terry') {
        this.flip = 0
        sfx.boing()
      } else this.steer(x)
      return
    }
    if (this.section === 'deliver') {
      if (id === 'pebble') this.pebble.hop(true)
      else if (id === 'colony') this.colony.forEach((c, i) => setTimeout(() => c.hop(), i * 90))
      else if (id === 'terry') sfx.boing()
      return
    }
    if (this.qState !== 'ask') return
    const kind = KIND[this.q]
    if (kind === 'tap' && (id === 'north' || id === 'south')) {
      const right = id === RIGHT[this.q]
      // The globe tips to show what happens at that pole.
      this.rest = id === 'north' ? POLE_VIEW : -POLE_VIEW
      if (right && this.q === 'ocean') {
        this.seaT = 0
        sfx.splash()
      }
      if (right && this.q === 'coldest') {
        this.thermoT = 0
        this.thermoCold = true
        standOn(this.thermo, -90, 0, domeR(0) - 0.004)
        this.thermo.visible = true
      }
      this.answer(right, id)
    } else if (kind === 'pick' && id?.startsWith('opt')) {
      const i = +id.slice(3)
      const p = this.row[i]
      if (!p) return
      p.hopT = 0
      if (i !== RIGHT[this.q] && this.q === 'summer') {
        // The beach ball bounces off; it's not beach time down there.
        sfx.boing()
      }
      this.answer(i === RIGHT[this.q])
    } else if (kind === 'drag' && id === 'piece') {
      this.row[0].hopT = 0
      this.row[0].critter?.hop(true)
    } else if (id === 'globe') sfx.pop()
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const g = this.globeOnScreen()
    const kind = this.section === 'quiz' && this.qState !== 'done' ? KIND[this.q] : null
    for (const [id, el] of this.anchorEls) {
      let spot: { x: number; y: number; size: number; z: number; glow?: boolean } | null = null
      const at = (v: Vector3, size: number, z = 5000, glow = false) => {
        const s = this.toScreen(v)
        if (s.z < 1) spot = { x: s.x, y: s.y, size: Math.max(min, size), z, glow }
      }
      if (id === 'terry' && this.terry.visible && this.section !== 'quiz') at(this.terry.position, 110)
      else if (id === 'pebble' && this.section === 'deliver') at(this.pebble.center(tmp), g.r * 0.12)
      else if (id === 'colony' && this.section === 'deliver') at(this.colony[1].center(tmp), g.r * 0.16, 4000)
      else if (id === 'globe' && this.section === 'quiz') spot = { x: g.x, y: g.y, size: g.r * 2, z: 1 }
      else if (id === 'piece' && kind === 'drag' && this.row[0]) at(this.row[0].o.getWorldPosition(tmp).add(tmp2.set(0, 0.1, 0)), g.r * 0.32, 9000)
      else if ((id === 'north' || id === 'south') && kind === 'tap') at(this.poleWorld(id, tmp, 0.96), g.r * 0.6, 6000)
      else if (id.startsWith('opt') && kind === 'pick') {
        const p = this.row[+id.slice(3)]
        if (p) at(p.o.getWorldPosition(tmp).add(tmp2.set(0, 0.1, 0)), g.r * 0.32, 7000)
      }
      const s = spot as { x: number; y: number; size: number; z: number; glow?: boolean } | null
      if (s) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z)
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  qa() {
    return {
      section: this.section,
      leg: this.leg,
      along: +(this.s / Math.max(1e-6, this.route.length)).toFixed(2),
      terry: +this.terryX.toFixed(3),
      fish: this.caught,
      pins: this.pins.map((p) => `${p.id}${p.popped >= 0 ? '!' : ''}`),
      question: this.section === 'quiz' ? this.q : null,
      questions: this.questions,
      state: this.qState,
      stars: this.stars,
      pitch: Math.round(this.pitch / DEG),
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

function canvas(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  return new CanvasTexture(c)
}
function puffTexture() {
  return canvas(64, (g) => {
    g.beginPath()
    g.arc(32, 32, 24, 0, Math.PI * 2)
    g.fillStyle = '#FFFFFF'
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = '#E4DDFF'
    g.stroke()
  })
}
/** A white wind streak. */
function streakTexture() {
  return canvas(64, (g) => {
    const grad = g.createLinearGradient(0, 0, 64, 0)
    grad.addColorStop(0, 'rgba(255,255,255,0)')
    grad.addColorStop(0.5, 'rgba(255,255,255,0.95)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 26, 64, 12)
  })
}
function glowTexture() {
  return canvas(128, (g) => {
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,234,154,0.95)')
    grad.addColorStop(0.5, 'rgba(255,79,154,0.5)')
    grad.addColorStop(1, 'rgba(255,79,154,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  })
}
function questionTexture() {
  return canvas(96, (g) => {
    g.beginPath()
    g.arc(48, 48, 40, 0, Math.PI * 2)
    g.fillStyle = '#FFFFFF'
    g.fill()
    g.lineWidth = 6
    g.strokeStyle = PAL.ink
    g.stroke()
    g.lineCap = 'round'
    g.lineWidth = 10
    g.strokeStyle = '#FF4F9A'
    g.beginPath()
    g.arc(48, 38, 13, Math.PI * 1.05, Math.PI * 2.35)
    g.lineTo(48, 58)
    g.stroke()
    g.beginPath()
    g.arc(48, 73, 5, 0, Math.PI * 2)
    g.fillStyle = '#FF4F9A'
    g.fill()
  })
}
function sunTexture() {
  return canvas(128, (g) => {
    g.translate(64, 64)
    g.fillStyle = PAL.gold
    for (let i = 0; i < 10; i++) {
      g.save()
      g.rotate((i * Math.PI) / 5)
      g.beginPath()
      g.moveTo(-8, -38)
      g.lineTo(0, -60)
      g.lineTo(8, -38)
      g.fill()
      g.restore()
    }
    g.beginPath()
    g.arc(0, 0, 34, 0, Math.PI * 2)
    g.fillStyle = '#FFD84D'
    g.fill()
    g.lineWidth = 5
    g.strokeStyle = PAL.ink
    g.stroke()
  })
}
function starTexture() {
  return canvas(64, (g) => {
    g.beginPath()
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 12 : 28
      const a = (Math.PI * i) / 5 - Math.PI / 2
      g.lineTo(32 + r * Math.cos(a), 32 + r * Math.sin(a))
    }
    g.closePath()
    g.fillStyle = '#FBEA9A'
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = PAL.ink
    g.stroke()
  })
}

/** The painted map's continents as a lookup (the map leaves the oceans transparent). */
function landMask(c: HTMLCanvasElement) {
  const W = 360
  const H = 180
  const small = document.createElement('canvas')
  small.width = W
  small.height = H
  const g = small.getContext('2d', { willReadFrequently: true })!
  g.drawImage(c, 0, 0, W, H)
  const a = g.getImageData(0, 0, W, H).data
  return (lat: number, lon: number) => {
    const x = Math.min(W - 1, Math.max(0, Math.floor(((lon + 180) / 360) * W)))
    const y = Math.min(H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * H)))
    return a[(y * W + x) * 4 + 3] > 64
  }
}
