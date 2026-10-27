// Penguin Slide (greybox 3, plan: planning/around-the-world/poles.html): Antarctica is land, a giant mountain of ice
// that slopes down to the sea. Pebble is hungry; Kaylee steers Pebble's papa on his belly down the ice and into the sea
// to catch krill for her.
//
// The toy (core verb): steer the sliding penguin, with the Nan drive's finger wheel (engine3d/wheel.ts): her finger
// goes down anywhere, a wheel appears under it, and pushing left or right slides him that way across the slope for as
// long as she holds it; let go and he drifts back to the middle of the valley (or of his run). The slope does the
// forward part. The verb deepens three ways along one course (course.ts): the gentle slope (wide ice, Adélies that hop
// aside, squawk, or spin like tops when he bumps them; steer into a snowbank and he plunges in head first, feet
// wiggling), bumps and cracks (snow mounds that pop him into the air, a rock ridge with two runs, moguls or a big
// kicker, a lip and a crack right across), then off the ice cliff into the sea, where the same wheel steers him through
// pink krill swarms (gulp: his tummy grows) past a leopard seal who only wants to play. At the end he rockets out onto
// the colony's ice and feeds Pebble.
//
// The ground is a height field (course.ts `ground`): on it he follows its height; where it drops away faster than he
// can fall (a bump's crest, the kicker's end, the lip, the edge) he flies. Built for engine3d/View3D.tsx; nothing here
// comes from Thailand. The steering, the slide and the swim are feel-lab knobs (?feel=1).
import { BackSide, BufferAttribute, BufferGeometry, Color, Fog, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, Raycaster, Scene, SphereGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import { clamp, sounds } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights, PAL, toon } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { Water } from '../../../../engine3d/water'
import { FingerWheel } from '../../../../engine3d/wheel'
import { ADELIES, base, bumps, CRACK, cx, dcx, depth, DIVE_END, EDGE, ground, half, HOME, inCrack, KICKER, KRILL, lane, ridge, RIDGE, SEAL, SHELF, SHELF_Y, TOP_END } from './course'
import { Penguin, Seal } from './penguin'
import type { SlideSection } from './sections'

const FILE = 'src/world/places/poles/activities/slide/slide.ts'
/** The finger wheel: Dad's numbers from the Nan drive's feel lab (2026-10-27), as the start for a penguin on ice. */
const STEER = knobs('steer', 'Steering', FILE, {
  slide: { value: 6.5, min: 1, max: 12, step: 0.1, label: 'Slide speed', unit: 'm/s', note: 'how fast a full push slides him across the slope' },
  reach: { value: 1.2, min: 0.4, max: 2.5, step: 0.05, label: 'Wheel size', unit: '×', note: 'how far her finger moves for a full push (smaller = touchier)' },
  dead: { value: 0.15, min: 0, max: 0.4, step: 0.01, label: 'Dead middle', note: 'share of the wheel near the middle that counts as straight' },
  curve: { value: 1.3, min: 1, max: 3, step: 0.05, label: 'Gentle small pushes', note: '1 = even all the way; higher = a small push barely steers' },
  ease: { value: 0.08, min: 0, max: 0.6, step: 0.01, label: 'Smoothing', unit: 's', note: 'how long a quick flick takes to count in full (0 = none)' },
  aim: { value: 10, min: 3, max: 24, step: 0.5, label: 'Aim ahead', unit: 'm', note: 'the nearest point he steers toward: closer = sharper, but he swings back and forth' },
  pull: { value: 1.2, min: 0, max: 4, step: 0.1, label: 'Aim closer when far off', note: 'per meter he is from where she steers: a full push swerves more' },
  turn: { value: 0.6, min: 0.2, max: 1.2, step: 0.02, label: 'Sharpest swerve', unit: 'rad', note: 'how steeply he can cut across the slope' },
  back: { value: 1.2, min: 0.3, max: 4, step: 0.1, label: 'Back to the middle', unit: 's', note: 'how slowly he drifts back to the middle of the valley (or his run) after she lets go' },
})
/** The slide down the ice. */
const SLIDE = knobs('slide', 'The slide', FILE, {
  speed: { value: 11, min: 4, max: 20, step: 0.5, label: 'Top speed', unit: 'm/s', note: 'on the bumps; the gentle slope is a share of it' },
  gentle: { value: 0.8, min: 0.4, max: 1, step: 0.05, label: 'Gentle slope', unit: '×', note: 'top speed on the first stretch, as a share' },
  accel: { value: 4, min: 1, max: 12, step: 0.25, label: 'Speeding up', unit: 'm/s²', note: 'how fast he gets going' },
  gravity: { value: 16, min: 6, max: 30, step: 0.5, label: 'Gravity in the air', unit: 'm/s²', note: 'lower = floatier hops off the bumps' },
  bank: { value: 1.8, min: 0, max: 3, step: 0.1, label: 'Up the snowbank', unit: 'm', note: 'how far past the edge of the ice she can steer him' },
  stuck: { value: 1.3, min: 0.4, max: 3, step: 0.1, label: 'Stuck in the snow', unit: 's', note: 'how long his feet wiggle before he pops out' },
  dodge: { value: 7, min: 2, max: 14, step: 0.5, label: 'Adélies hop aside at', unit: 'm', note: 'how far ahead the wide-awake ones see him coming (the sleepy ones never do: bump!)' },
})
/** Under the sea. */
const SWIM = knobs('swim', 'Under the sea', FILE, {
  speed: { value: 7, min: 3, max: 14, step: 0.5, label: 'Swim speed', unit: 'm/s', note: 'how fast he flies through the water' },
  slide: { value: 5.5, min: 1, max: 12, step: 0.1, label: 'Slide speed', unit: 'm/s', note: 'how fast a full push moves him across' },
  magnet: { value: 1.4, min: 0, max: 4, step: 0.1, label: 'Krill come to him', unit: 'm', note: 'a swarm this close drifts into his beak (0 = only dead on)' },
  leap: { value: 3.5, min: 1, max: 7, step: 0.25, label: 'Leap out', unit: 'm', note: 'how high he rockets out onto the ice at the end' },
})

export interface SlideStart {
  section: SlideSection
  run: 'left' | 'middle' | 'right'
  krill: number
}
export interface SlideEvents {
  /** He reached the next stretch (the address bar follows). */
  section(s: SlideSection, krill: number): void
  /** He gulped a swarm: how many now. */
  krill(n: number): void
  /** Pebble is fed. */
  home(): void
}

export const SLIDE_ANCHORS: AnchorInfo[] = [
  { id: 'papa', label: "Pebble's papa", kind: 'thing' },
  { id: 'pebble', label: 'Pebble', kind: 'thing' },
  { id: 'seal', label: 'The leopard seal', kind: 'thing' },
  ...ADELIES.map((_, i) => ({ id: `adelie:${i}`, label: 'An Adélie penguin', kind: 'thing' as const })),
]

type Mode = 'ready' | 'slide' | 'bank' | 'swim' | 'leap' | 'shelf' | 'feed' | 'done'

const SKY = '#F1ECFF'
const DEEP = '#3D7FBF'
const ICE = new Color('#ABD3F4')
const ICE_STRIPE = new Color('#8EC2EE')
const SNOW = new Color('#FFFFFF')
const WALL = new Color('#E4EBF8')
const CRACK_BLUE = new Color('#4F7FBF')
const CLIFF_BLUE = new Color('#A9CDEE')
/** No steering for this long: the 👆 shows how. */
const HINT_S = 8
const DEG = 180 / Math.PI
const ORDER: SlideSection[] = ['top', 'bumps', 'dive', 'home']
/** Little krill in each swarm. */
const PER = 12
const BUBBLES = 70

/** A deterministic random (the rocks on the sea floor, the krill in a swarm). */
function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

/** A short squawk (an Adélie) or a deep honk (Papa). */
function honk(deep = false) {
  const f = deep ? 260 : 520
  tone(f, f * 0.75, 0.16, 0.12, 'square')
  tone(f * 1.01, f * 0.7, 0.16, 0.06, 'sawtooth', 0.01)
  noise(0.12, 0.04, 'bandpass', f * 3, f * 2, 0, 2)
}

interface Adelie {
  pen: Penguin
  s: number
  lat: number
  goal: number
  /** Wide-awake ones hop aside; sleepy ones stay put (bump!). */
  awake: boolean
  dodged: boolean
  hitT: number
}

interface Swarm {
  s: number
  lat: number
  drift: number
  y: number
  /** Where it is now (drifting, and pulled toward him). */
  x: number
  z: number
  yy: number
  pull: Vector3
  /** Seconds since he gulped it (-1: not yet). */
  eaten: number
  offsets: Vector3[]
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const me = new Vector3()
const beakAt = new Vector3()
const UP = new Vector3(0, 1, 0)
const mtx = new Matrix4()
const quat = new Quaternion()
const scl = new Vector3()

export class PenguinSlide implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private fogAir = new Fog(SKY, 70, 230)
  private fogSea = new Fog(DEEP, 3, 40)
  private skyColor = new Color(SKY)
  private seaColor = new Color(DEEP)
  private water: Water
  private ribbon: Mesh
  private seafloor: Mesh
  private shelf: Group
  private wheel = new FingerWheel()
  private wheelEl: HTMLElement | null = null
  private hintEl: HTMLElement | null = null
  private anchorEls = new Map<string, HTMLElement>()
  private raycaster = new Raycaster()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: SlideSection

  // ---- Papa.
  private papa: Penguin
  /** Moves and turns him (yaw); `lean` pitches him with the slope and rolls him into turns. */
  private papaRoot = new Group()
  private lean = new Group()
  private shadow: Mesh
  private mode: Mode = 'ready'
  private modeT = 0
  private s = 0
  private lat = 0
  private latV = 0
  private y = 0
  private vy = 0
  private v = 0
  private air = false
  /** The ice's own up-and-down speed under him last step (NaN: just landed). */
  private gv = NaN
  /** Which run a bumps link starts him toward (-1 left, 1 right). */
  private prefer = 0
  private airT = 0
  private belly = 0
  private pitch = 0
  private roll = 0
  private yaw = Math.PI
  private steerLat = 0
  private landT = -1
  private bankCool = 0
  private bonkCool = 0
  private trailT = 0
  private krill = 0
  private leapFrom = new Vector3()
  private leapTo = new Vector3()
  private fed = 0
  private feedN = 0
  private feedT = 0
  private homeT = -1

  // ---- Everyone else.
  private pebble: Penguin
  private colony: Penguin[] = []
  private adelies: Adelie[] = []
  private seal: Seal
  private sealOn = 0
  private sealCool = 0
  private sealPos = new Vector3()
  private swarms: Swarm[] = []
  private krillMesh: InstancedMesh
  private bubbles: InstancedMesh
  private bubblePool: { x: number; y: number; z: number; vy: number; age: number; life: number; size: number }[] = []
  private nextBubble = 0
  private bites: Mesh[] = []
  private spray: Particles
  private foam: Particles

  private lastTouch = 0
  private lastSteer = -99
  private counts = { steered: 0, hops: 0, bigAir: 0, landings: 0, dodges: 0, bumps: 0, banks: 0, bonks: 0, gulps: 0, boops: 0, taps: 0, pokes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: SlideStart,
    private events: SlideEvents,
  ) {
    const { scene, bag } = this
    scene.background = this.skyColor.clone()
    scene.fog = this.fogAir
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.28

    // ---- The sea, seen from above and from below, and its floor ----
    this.water = new Water({ size: 700, deep: '#5FA6DE', shallow: '#78BCEA', haze: SKY, hazeNear: 70, hazeFar: 220 }, bag)
    this.water.mesh.position.set(cx(EDGE), 0, -(EDGE + 300))
    scene.add(this.water.mesh)
    const under = new Mesh(bag.add(new PlaneGeometry(700, 700)), bag.add(new MeshBasicMaterial({ color: '#B7E2F8', side: BackSide })))
    under.rotation.x = -Math.PI / 2
    under.position.set(cx(EDGE), -0.03, -(EDGE + 300))
    scene.add(under)
    this.seafloor = new Mesh(bag.add(new PlaneGeometry(160, DIVE_END - EDGE + 120)), toon('#7E9CC4'))
    this.seafloor.rotation.x = -Math.PI / 2
    this.seafloor.position.set(cx(EDGE), -9, -(EDGE + DIVE_END) / 2)
    scene.add(this.seafloor)
    const rand = rng(7)
    const rocks = []
    for (let i = 0; i < 46; i++) {
      const s = EDGE + 10 + rand() * (DIVE_END - EDGE)
      const r = 0.6 + rand() * 1.6
      rocks.push(P.sphere(r, rand() < 0.5 ? '#8B97B3' : '#717D9C', { at: [cx(s) + (rand() - 0.5) * 30, -9 + r * 0.3, -s], scale: [1.3, 0.7, 1] }, 10))
    }
    scene.add(solid(merge(rocks), bag, 2))

    // ---- The ice: the valley, its snowbanks and walls, the crack and the cliff ----
    this.ribbon = this.buildRibbon()
    scene.add(this.ribbon)
    scene.add(this.buildRidge())
    scene.add(this.buildFlags())
    // The colony's ice at the end, rising out of the sea.
    this.shelf = solid(P.rbox(30, 5, 44, 0.4, '#E4EEF8', { at: [cx(HOME), SHELF_Y - 2.5, -(SHELF + 22)] }), bag, 2.5)
    scene.add(this.shelf)

    // ---- The penguins and the seal ----
    this.papa = new Penguin(bag, 'emperor', 1.25)
    this.lean.add(this.papa.root)
    this.papaRoot.add(this.lean)
    scene.add(this.papaRoot)
    this.shadow = blobShadow(0.55, bag)
    scene.add(this.shadow)
    this.pebble = new Penguin(bag, 'chick', 1)
    this.pebble.root.position.set(cx(HOME), SHELF_Y, -HOME)
    scene.add(this.pebble.root)
    for (const [dl, ds, yaw] of [
      [-2.6, 1.5, 0.4],
      [2.8, 2.2, -0.5],
      [-4.2, 4, 0.2],
      [4.5, 5, -0.2],
      [0.5, 4.5, 0],
    ]) {
      const p = new Penguin(bag, 'emperor', 1.25)
      p.root.position.set(cx(HOME) + dl, SHELF_Y, -(HOME + ds))
      p.root.rotation.y = yaw
      scene.add(p.root)
      this.colony.push(p)
    }
    ADELIES.forEach(([s, lat], i) => {
      const pen = new Penguin(bag, 'adelie', 0.75)
      scene.add(pen.root)
      this.adelies.push({ pen, s, lat, goal: lat, awake: i % 2 === 0, dodged: false, hitT: -1 })
    })
    this.seal = new Seal(bag)
    this.seal.root.visible = false
    scene.add(this.seal.root)

    // ---- Krill swarms, bubbles, snow ----
    const krillGeo = bag.add(new SphereGeometry(0.07, 6, 4).scale(1, 0.7, 1.6))
    this.krillMesh = new InstancedMesh(krillGeo, toon(PAL.pink), KRILL.length * PER)
    this.krillMesh.frustumCulled = false
    scene.add(this.krillMesh)
    KRILL.forEach(([s, lat, drift], i) => {
      const r = rng(100 + i)
      const offsets = Array.from({ length: PER }, () => new Vector3((r() - 0.5) * 1.6, (r() - 0.5) * 1, (r() - 0.5) * 1.6))
      const y = depth(s)
      this.swarms.push({ s, lat, drift, y, x: cx(s) + lat, z: -s, yy: y, pull: new Vector3(), eaten: -1, offsets })
    })
    this.bubbles = new InstancedMesh(bag.add(new SphereGeometry(0.5, 8, 6)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.7 })), BUBBLES)
    this.bubbles.frustumCulled = false
    this.bubbles.count = 0
    scene.add(this.bubbles)
    for (let i = 0; i < BUBBLES; i++) this.bubblePool.push({ x: 0, y: 0, z: 0, vy: 0, age: 1, life: 0, size: 0 })
    const biteGeo = bag.add(new SphereGeometry(0.09, 8, 6))
    for (let i = 0; i < 6; i++) {
      const b = new Mesh(biteGeo, toon(PAL.pink))
      b.visible = false
      scene.add(b)
      this.bites.push(b)
    }
    this.spray = new Particles({ kind: 'spray', count: 200 }, bag)
    this.foam = new Particles({ kind: 'foam', count: 40, opacity: 0.85 }, bag)
    scene.add(this.spray.mesh, this.foam.mesh)

    // ---- Where the link starts ----
    this.section = start.section
    this.krill = start.krill
    this.papa.full = this.tummy()
    if (start.section === 'top') {
      this.s = 2
      this.setMode('ready')
    } else if (start.section === 'bumps') {
      this.s = TOP_END + 4
      this.prefer = { left: -1, middle: 0, right: 1 }[start.run]
      this.lat = this.steerLat = this.prefer * 4
      this.v = SLIDE.speed
      this.belly = 1
      this.setMode('slide')
    } else if (start.section === 'dive') {
      this.s = EDGE + 12
      this.y = depth(this.s)
      this.v = SWIM.speed
      this.belly = 1
      this.setMode('swim')
      // (The swarms behind him are gone.)
      for (const sw of this.swarms) if (sw.s < this.s) sw.eaten = 99
    } else {
      this.s = SHELF + 5
      this.y = SHELF_Y
      this.v = 6
      this.belly = 1
      this.setMode('shelf')
      for (const sw of this.swarms) sw.eaten = 99
    }
    if (this.mode === 'slide' || this.mode === 'ready') this.y = ground(this.s, this.lat)
    // The Adélies behind him have nothing to do.
    for (const a of this.adelies) if (a.s < this.s) a.dodged = true
    this.placePapa(0)

    this.unwatch = watch('slide', () => ({
      'her push': [this.wheel.push, 1],
      steer: [this.wheel.k, 1],
      'steering to (m)': [this.steerLat, 10],
      'across (m)': [this.lat, 10],
      'in the air (m)': [this.air ? this.y - ground(this.s, this.lat) : 0, 4],
    }))
  }

  // ---------------------------------------------------------------- building

  /** The valley as one height-field mesh, colored by what's there: icy middle, snowbanks, walls, the crack, the cliff. */
  private buildRibbon() {
    const rows: number[] = []
    for (let s = -14; s < EDGE; s += 1) rows.push(s)
    // Sharp edges where the ice steps: the crack, the kicker's end, the cliff.
    for (const s of [CRACK.at - CRACK.w / 2 - 0.02, CRACK.at - CRACK.w / 2 + 0.02, CRACK.at + CRACK.w / 2 - 0.02, CRACK.at + CRACK.w / 2 + 0.02, KICKER.s + KICKER.len - 0.03, KICKER.s + KICKER.len + 0.03, EDGE]) rows.push(s)
    rows.sort((a, b) => a - b)
    const cols: number[] = [-150, -110, -80, -60, -46, -36, -28, -22, -18, -15]
    for (let l = -14.4; l <= 14.401; l += 0.6) cols.push(+l.toFixed(2))
    cols.push(15, 18, 22, 28, 36, 46, 60, 80, 110, 150)
    const nr = rows.length + 1
    const nc = cols.length
    const pos = new Float32Array(nr * nc * 3)
    const col = new Float32Array(nr * nc * 3)
    const c = new Color()
    for (let i = 0; i < nr; i++) {
      // (The last row is the cliff's foot, under the sea.)
      const cliff = i === nr - 1
      const s = cliff ? EDGE + 0.05 : rows[i]
      for (let j = 0; j < nc; j++) {
        const lat = cols[j]
        const k = (i * nc + j) * 3
        const y = cliff ? -10 : ground(Math.min(s, EDGE), lat)
        pos[k] = cx(s) + lat
        pos[k + 1] = y
        pos[k + 2] = -s
        const a = Math.abs(lat)
        const hw = half(s)
        if (cliff || (s >= EDGE - 0.01 && a < 60)) c.copy(CLIFF_BLUE)
        else if (inCrack(s) && a < hw + 4) c.copy(CRACK_BLUE)
        else if (a > hw + 3) c.copy(WALL)
        else if (a > hw || bumps(s, lat) > 0.12) c.copy(SNOW)
        // Faint stripes across the ice every 8 m: they stream past, so speed reads.
        else c.copy(((s % 8) + 8) % 8 < 1.2 ? ICE_STRIPE : ICE)
        col[k] = c.r
        col[k + 1] = c.g
        col[k + 2] = c.b
      }
    }
    // The cliff's top row stays white-blue: the last real row is EDGE itself.
    const idx: number[] = []
    for (let i = 0; i < nr - 1; i++)
      for (let j = 0; j < nc - 1; j++) {
        const a = i * nc + j
        const b = a + 1
        const d = a + nc
        const e = d + 1
        // (Counter-clockwise from above, so the ice faces up.)
        idx.push(a, b, d, b, e, d)
      }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(pos, 3))
    geo.setAttribute('color', new BufferAttribute(col, 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    this.bag.add(geo)
    return new Mesh(geo, toon('#ffffff', true))
  }

  /** The rock ridge between the two runs: dark boulders end to end. */
  private buildRidge() {
    const parts = []
    for (let s = RIDGE.from + 4; s < RIDGE.to - 2; s += 3.2) {
      const r = ridge(s)
      if (r < 0.4) continue
      const h = 0.9 + r * 0.35
      parts.push(
        P.rbox(r * 1.9, h, 4.2, 0.35, (s / 3.2) % 2 < 1 ? '#8E95A8' : '#7F879B', { at: [cx(s), base(s) + h * 0.35, -s], rot: [-Math.atan(0.2), Math.atan(dcx(s)), (Math.sin(s) * 0.08)] }),
      )
    }
    return solid(merge(parts), this.bag, 2.5)
  }

  /** Little flags along both snowbanks (they stream past: speed), pink at the ridge's nose where the runs split. */
  private buildFlags() {
    const parts = []
    for (let s = 20; s < EDGE - 4; s += 22) {
      for (const side of [-1, 1]) {
        const lat = side * (half(s) + 1.6)
        const x = cx(s) + lat
        const y = ground(s, lat)
        const color = side < 0 ? PAL.lavenderDark : PAL.mint
        parts.push(P.cyl(0.04, 0.04, 1.6, '#FFFFFF', { at: [x, y + 0.8, -s] }), P.prism([[0, 0], [0.55, 0.2], [0, 0.4]], 0.03, color, { at: [x, y + 1.15, -s], rot: [0, side < 0 ? 0 : Math.PI, 0] }))
      }
    }
    for (const side of [-1, 1]) {
      const s = RIDGE.from + 2
      const x = cx(s) + side * 0.8
      const y = base(s)
      parts.push(P.cyl(0.05, 0.05, 2.2, '#FFFFFF', { at: [x, y + 1.1, -s] }), P.prism([[0, 0], [0.7, 0.25], [0, 0.5]], 0.03, PAL.hotpink, { at: [x, y + 1.7, -s], rot: [0, side < 0 ? Math.PI : 0, 0] }))
    }
    return solid(merge(parts), this.bag, 1.5)
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
    return this.mode === 'done' && !this.papa.busy && !this.spray.busy && !this.rig.moving
  }

  private setMode(m: Mode) {
    this.mode = m
    this.modeT = 0
  }
  private enter(s: SlideSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) return
    this.section = s
    this.events.section(s, this.krill)
  }
  /** How round his tummy is for the krill he's caught. */
  private tummy() {
    return 1 + Math.min(0.55, this.krill * 0.04)
  }

  update(dt: number) {
    const t = (this.time += dt)
    this.modeT += dt
    this.bankCool -= dt
    this.bonkCool -= dt
    this.sealCool -= dt
    this.water.update(t)
    const k = this.wheel.update(dt, t, STEER)
    if (Math.abs(k) > 0.05) {
      this.counts.steered += dt
      this.lastSteer = t
    }

    switch (this.mode) {
      case 'ready':
        // He looks down the hill, flops onto his tummy, and off he goes.
        if (this.modeT > 0.7) {
          this.setMode('slide')
          this.v = 2
          sounds.whoosh()
          honk(true)
        }
        break
      case 'slide':
        this.slide(dt, k)
        break
      case 'bank':
        // Head first in the snowbank: feet wiggling, then he pops back out.
        if (this.modeT > SLIDE.stuck) {
          this.setMode('slide')
          this.v = SLIDE.speed * 0.45
          this.latV = -Math.sign(this.lat) * 4
          this.steerLat = lane(this.s, this.lat)
          this.y = ground(this.s, this.lat) + 0.3
          this.vy = 4
          this.air = true
          this.spray.burst(this.pos().x, this.y + 0.4, -this.s, 22, 2.5, 4, 0.2)
          sfx.boing()
        }
        break
      case 'swim':
        this.swim(dt, k)
        break
      case 'leap': {
        const q = clamp(this.modeT / 1.15)
        const from = this.leapFrom
        const to = this.leapTo
        const was = this.y
        this.s = -(from.z + (to.z - from.z) * q)
        this.lat = from.x + (to.x - from.x) * q - cx(this.s)
        this.y = from.y + (to.y - from.y) * q + 4 * SWIM.leap * q * (1 - q)
        this.vy = (this.y - was) / Math.max(dt, 1e-4)
        if (was < 0 && this.y >= 0) this.splash(1)
        if (q >= 1) {
          this.y = SHELF_Y
          this.vy = 0
          this.setMode('shelf')
          this.v = 6
          this.thump(5)
          this.pebble.hop()
        }
        break
      }
      case 'shelf': {
        // On his tummy across the ice to Pebble, slowing down, then up on his feet.
        const stop = HOME - 1.7
        this.v = Math.max(0, Math.min(this.v, Math.sqrt(Math.max(0, 2 * 2.8 * (stop - this.s)))))
        this.s = Math.min(stop, this.s + this.v * dt)
        this.lat += (0 - this.lat) * (1 - Math.exp(-dt * 2))
        this.y = SHELF_Y
        if (this.s >= stop - 0.02) {
          this.setMode('feed')
          this.feedN = Math.max(4, this.krill)
          this.fed = 0
          this.feedT = 0.7
          this.enter('home')
        }
        break
      }
      case 'feed':
        this.feed(dt)
        break
      case 'done':
        break
    }
    if (this.homeT >= 0) this.homeT += dt

    this.updateAdelies(dt, t)
    this.updateSeal(dt, t)
    this.updateKrill(dt, t)
    this.updateBubbles(dt)
    this.placePapa(dt)
    this.papa.update(dt, t, this.pose(dt, t))
    this.pebble.update(dt, t, { waddle: this.mode === 'feed' ? 0.3 : 0 })
    for (const c of this.colony) c.update(dt, t)
    this.seal.update(dt, t)
    this.spray.update(dt)
    this.foam.update(dt)

    // Under the sea, the world turns blue.
    const underSea = this.rig.camera.position.y < 0
    this.scene.fog = underSea ? this.fogSea : this.fogAir
    ;(this.scene.background as Color).copy(underSea ? this.seaColor : this.skyColor)

    const p = this.pos()
    this.lights.follow(p.x, this.y, p.z)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.wheel.draw(this.wheelEl, this.mode === 'slide' || this.mode === 'swim', STEER.reach)
    const idle = t - Math.max(this.lastTouch, this.lastSteer)
    const steering = this.mode === 'slide' || this.mode === 'swim'
    this.wheel.hint(this.hintEl, steering && !this.wheel.finger && ((this.counts.steered < 1 && t > 2.5 && idle > 2.5) || idle > HINT_S), t, STEER.reach)
  }

  /** Where he is in the world. */
  private pos(out = tmp) {
    return out.set(cx(this.s) + this.lat, this.y, -this.s)
  }

  // ---------------------------------------------------------------- the slide

  /** The wheel's push slides where she's steering to; he swerves toward it (a point `aim` m ahead), or, let go, drifts
   *  back to the middle. `range` is how far across she can steer him. */
  private steer(dt: number, k: number, slide: number, rest: number, range: number) {
    if (this.wheel.steering) this.steerLat = clamp(this.steerLat + k * slide * dt, -range, range)
    else this.steerLat += (rest - this.steerLat) * (1 - Math.exp(-dt / STEER.back))
    const ds = Math.max(STEER.aim, 10 + Math.abs(this.v) * 0.9 - Math.abs(this.steerLat - this.lat) * STEER.pull)
    const max = Math.max(1, this.v) * Math.tan(STEER.turn)
    const want = clamp((Math.max(2, this.v) * (this.steerLat - this.lat)) / ds, -max, max)
    this.latV += (want - this.latV) * (1 - Math.exp(-dt * 8))
  }

  private slide(dt: number, k: number) {
    const target = SLIDE.speed * (this.s < TOP_END ? SLIDE.gentle : 1)
    // (A little past the top of the bank, so pushing on gets him there.)
    const range = half(this.s) + SLIDE.bank + 0.6
    // (A bumps link with a run keeps him on that side until the runs split.)
    const rest = this.prefer && this.s < RIDGE.from ? this.prefer * 4 : lane(this.s, this.lat)
    this.steer(dt, k, STEER.slide, rest, range)
    if (!this.air) this.v += clamp(target - this.v, -SLIDE.accel * 1.5 * dt, SLIDE.accel * dt)
    const n = Math.max(1, Math.ceil(dt * 120))
    const h = dt / n
    for (let i = 0; i < n && this.mode === 'slide'; i++) this.substep(h)
    if (this.mode !== 'slide') return
    if (this.s >= TOP_END) this.enter('bumps')

    // Up the snowbank as far as it goes; pushing on into it at speed: head first into the snow.
    const edge = half(this.s) + SLIDE.bank
    if (Math.abs(this.lat) > edge) {
      this.lat = Math.sign(this.lat) * edge
      this.latV = 0
    }
    const pushing = this.wheel.steering && k * Math.sign(this.lat) > 0.5
    if (!this.air && Math.abs(this.lat) > half(this.s) + SLIDE.bank * 0.6 && pushing && this.v > 5 && this.bankCool <= 0 && this.s < EDGE - 12) {
      this.bankCool = 5
      this.counts.banks++
      this.setMode('bank')
      this.lat = Math.sign(this.lat) * (edge + 0.4)
      this.y = ground(this.s, this.lat) - 0.35
      this.latV = this.vy = 0
      this.spray.burst(this.pos().x, this.y + 0.5, -this.s, 30, 3, 4.5, 0.24)
      sfx.thump()
      sfx.fwip()
      return
    }
    // The rock between the runs: he bonks off its side, into whichever run he's on.
    const r = ridge(this.s)
    if (r > 0 && Math.abs(this.lat) < r + 0.5) {
      const side = Math.sign(this.lat || this.steerLat || 1)
      this.lat = side * (r + 0.5)
      if (this.latV * side < 0) {
        this.latV = -this.latV * 0.3
        if (this.bonkCool <= 0) {
          this.bonkCool = 0.6
          this.counts.bonks++
          sfx.thump()
          this.spray.burst(this.pos().x, this.y + 0.3, -this.s, 8, 1.5, 2, 0.14)
        }
      }
      if (this.steerLat * side < r + 0.5) this.steerLat = side * (r + 0.5)
    }

    // Snow kicked up behind him.
    if (!this.air && (this.trailT -= dt) < 0) {
      this.trailT = 0.05
      const p = this.pos()
      const sw = Math.min(1, Math.abs(this.latV) / 4)
      this.spray.emit(p.x + (Math.random() - 0.5) * 0.6, p.y + 0.1, p.z + 0.7, -this.latV * 0.3 + (Math.random() - 0.5), 1 + Math.random() + sw * 2, 1.5, 0.45, 0.1 + 0.08 * sw)
    }
    // Off the edge and into the sea.
    if (this.s > EDGE && this.y < 0) {
      this.y = -0.3
      this.vy = Math.min(this.vy, -4)
      this.air = false
      this.setMode('swim')
      this.splash(1.3)
      this.enter('dive')
    }
  }

  /** A small step of the slide: forward, across, and up and down over the ice (or through the air). */
  private substep(h: number) {
    this.s += this.v * h
    this.lat += this.latV * h
    const g = ground(this.s, this.lat)
    // How fast the slope itself goes down under him (m/s): a hop or a landing counts against that.
    const fall = ((ground(this.s + 0.4, this.lat) - ground(this.s - 0.4, this.lat)) / 0.8) * this.v
    if (this.air) {
      this.vy -= SLIDE.gravity * h
      this.y += this.vy * h
      this.airT += h
      if (this.y <= g) {
        if (inCrack(this.s)) return this.popOutOfCrack()
        const impact = fall - this.vy
        this.y = g
        this.vy = fall
        this.air = false
        this.gv = NaN
        if (this.airT > 0.25) this.counts.hops++
        if (this.airT > 0.7) this.counts.bigAir++
        this.thump(impact)
      }
      return
    }
    // On the ice he follows it as it rises under him; where it drops away faster than he can fall, he flies.
    const follow = (g - this.y) / h
    if (!Number.isNaN(this.gv) && follow < this.gv - SLIDE.gravity * h * 1.5) {
      this.air = true
      this.airT = 0
      this.vy -= SLIDE.gravity * h
      this.y += this.vy * h
      if (this.vy - fall > 1.5) sfx.boing()
      return
    }
    this.gv = follow
    this.vy = Math.min(follow, 9)
    this.y = g
  }

  /** Never stuck in the crack: a boing and he's out on the far side. */
  private popOutOfCrack() {
    this.s = CRACK.at + CRACK.w / 2 + 0.6
    this.y = ground(this.s, this.lat) + 0.2
    this.vy = 5
    this.air = true
    this.v = Math.max(this.v, SLIDE.speed * 0.7)
    sfx.boing()
  }

  private thump(impact: number) {
    if (impact < 3) return
    this.counts.landings++
    this.landT = 0
    const p = this.pos()
    this.spray.burst(p.x, p.y + 0.15, p.z, Math.round(clamp(impact * 2.5, 6, 26)), 2.2, 2.4, 0.16)
    sfx.thump()
  }

  private splash(big: number) {
    const p = this.pos()
    sfx.splash()
    this.spray.burst(p.x, 0.1, p.z, Math.round(22 * big), 2.8 * big, 5 * big, 0.22)
    for (let i = 0; i < 3; i++) this.foam.emit(p.x, 0.02, p.z, 0, 0, 0, 1.2 + i * 0.3, (1.6 + i) * big)
    for (let i = 0; i < 14; i++) this.bubble(p.x + (Math.random() - 0.5) * 1.5, -0.6 - Math.random() * 1.5, p.z + (Math.random() - 0.5) * 1.5)
  }

  // ---------------------------------------------------------------- under the sea

  private swim(dt: number, k: number) {
    // Diving in fast: he slows to swimming speed and glides down to his depth.
    this.v += (SWIM.speed - this.v) * (1 - Math.exp(-dt * 1.5))
    this.steer(dt, k, SWIM.slide, 0, 7)
    this.s += this.v * dt
    this.lat = clamp(this.lat + this.latV * dt, -8, 8)
    const goal = depth(this.s)
    this.vy += ((goal - this.y) * 6 - this.vy * 3.5) * dt
    this.y = clamp(this.y + this.vy * dt, -8, -0.4)
    if ((this.trailT -= dt) < 0) {
      this.trailT = 0.16
      const p = this.pos()
      this.bubble(p.x + (Math.random() - 0.5) * 0.3, p.y + 0.3, p.z + 0.3)
    }
    // The end of the sea: he rockets up and out onto the colony's ice.
    if (this.s > DIVE_END) {
      this.leapFrom.copy(this.pos())
      const to = SHELF + 4
      this.leapTo.set(cx(to) + this.lat * 0.4, SHELF_Y, -to)
      this.setMode('leap')
      this.enter('home')
      sounds.whoosh()
      honk(true)
    }
  }

  private updateKrill(dt: number, t: number) {
    const p = this.pos(me)
    const beak = this.beak(beakAt)
    let n = 0
    this.swarms.forEach((sw, i) => {
      if (sw.eaten > 1) return
      if (sw.eaten < 0) {
        // Drifting side to side (the later ones), pulled toward him when he comes close.
        sw.x = cx(sw.s) + sw.lat + sw.drift * Math.sin(t * 0.7 + i * 1.7) + sw.pull.x
        sw.z = -sw.s + sw.pull.z
        sw.yy = sw.y + 0.25 * Math.sin(t * 1.3 + i) + sw.pull.y
        const dx = p.x - sw.x
        const dy = p.y - sw.yy
        const dz = p.z - 0.9 - sw.z
        const d = Math.hypot(dx, dy, dz)
        if (this.mode === 'swim' && d < SWIM.magnet + 1.4 && d > 0.01) {
          const k = Math.min(1, dt * 3)
          sw.pull.x += dx * k * 0.5
          sw.pull.y += dy * k * 0.5
          sw.pull.z += dz * k * 0.5
        }
        if (this.mode === 'swim' && d < 1.05) this.gulp(sw)
      } else sw.eaten += dt
      // Each little krill wiggles; a gulped swarm streams into his beak.
      const q = sw.eaten < 0 ? 0 : clamp(sw.eaten / 0.35)
      sw.offsets.forEach((o, j) => {
        const x = sw.x + o.x + 0.08 * Math.sin(t * 9 + j * 2.1 + i)
        const y = sw.yy + o.y + 0.06 * Math.sin(t * 7 + j)
        const z = sw.z + o.z
        quat.setFromAxisAngle(UP, t * 2 + j)
        const sc = (1 - q) * (1 + 0.2 * Math.sin(t * 11 + j))
        mtx.compose(tmp.set(x + (beak.x - x) * q, y + (beak.y - y) * q, z + (beak.z - z) * q), quat, scl.set(sc, sc, sc))
        this.krillMesh.setMatrixAt(n++, mtx)
      })
    })
    this.krillMesh.count = n
    this.krillMesh.instanceMatrix.needsUpdate = true
  }

  private gulp(sw: Swarm) {
    sw.eaten = 0
    this.krill++
    this.counts.gulps++
    this.papa.full = this.tummy()
    this.events.krill(this.krill)
    sounds.note(Math.min(10, this.krill - 1))
    sfx.chomp()
    const b = this.beak(tmp)
    for (let i = 0; i < 6; i++) this.bubble(b.x + (Math.random() - 0.5) * 0.5, b.y, b.z + (Math.random() - 0.5) * 0.5)
  }

  /** His beak, in the world. */
  private beak(out: Vector3) {
    return this.papa.root.localToWorld(out.set(0, this.belly > 0.5 ? 0.35 : 1.2, this.belly > 0.5 ? 0.95 : 0.35))
  }

  private bubble(x: number, y: number, z: number) {
    const b = this.bubblePool[this.nextBubble]
    this.nextBubble = (this.nextBubble + 1) % BUBBLES
    b.x = x
    b.y = y
    b.z = z
    b.vy = 1.2 + Math.random()
    b.age = 0
    b.life = 1.2 + Math.random() * 0.8
    b.size = 0.04 + Math.random() * 0.07
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
      mtx.compose(tmp.set(b.x, b.y, b.z), quat.identity(), scl.set(s, s, s))
      this.bubbles.setMatrixAt(n++, mtx)
    }
    this.bubbles.count = n
    this.bubbles.instanceMatrix.needsUpdate = true
  }

  /** The leopard seal swims in, loops round him playing, and leaves. Bump it: you both spin. */
  private updateSeal(dt: number, t: number) {
    const on = this.mode === 'swim' && this.s > SEAL.from && this.s < SEAL.to ? 1 : 0
    this.sealOn += (on - this.sealOn) * (1 - Math.exp(-dt * 0.8))
    this.seal.root.visible = this.sealOn > 0.02
    if (!this.seal.root.visible) return
    const p = this.pos(me)
    const a = t * 0.8
    const near = tmp.set(p.x + 3.4 * Math.sin(a), p.y + 0.7 * Math.sin(t * 1.3), p.z - 3.5 - 2.6 * Math.cos(a))
    const goal = tmp2.set(p.x + 10, p.y - 4, p.z - 30).lerp(near, this.sealOn)
    const was = this.sealPos.clone()
    if (this.sealPos.lengthSq() === 0) this.sealPos.copy(goal)
    this.sealPos.lerp(goal, 1 - Math.exp(-dt * 4))
    this.seal.root.position.copy(this.sealPos)
    // Facing the way it's swimming (relative to him, it loops; he moves forward too).
    const vx = this.sealPos.x - was.x
    const vz = this.sealPos.z - was.z
    if (Math.hypot(vx, vz) > 1e-4) this.seal.root.rotation.y = Math.atan2(vx, vz)
    if (this.mode === 'swim' && this.sealCool <= 0 && this.sealPos.distanceTo(p) < 1.5) {
      this.sealCool = 3
      this.counts.boops++
      this.seal.spin()
      this.papa.spin()
      sfx.boing()
      for (let i = 0; i < 10; i++) this.bubble(p.x + (Math.random() - 0.5), p.y, p.z + (Math.random() - 0.5))
    }
  }

  // ---------------------------------------------------------------- the Adélies

  private updateAdelies(dt: number, t: number) {
    const p = this.pos(me)
    for (const a of this.adelies) {
      const ahead = a.s - this.s
      if (this.mode === 'slide' && a.awake && !a.dodged && ahead > 0 && ahead < SLIDE.dodge && Math.abs(a.lat - this.lat) < 2.2) {
        // The wide-awake ones see him coming: a squawk and a hop out of the way. (The sleepy ones don't: bump!)
        a.dodged = true
        a.goal = a.lat + Math.sign(a.lat - this.lat || 1) * 1.9
        a.pen.hop()
        this.counts.dodges++
        honk()
      }
      a.lat += (a.goal - a.lat) * (1 - Math.exp(-dt * 7))
      const x = cx(a.s) + a.lat
      const y = ground(a.s, a.lat)
      a.pen.root.position.set(x, y, -a.s)
      // Watching him come down the hill (and after him once he's past).
      a.pen.root.rotation.y = ahead > 0 ? Math.atan2(p.x - x, p.z + a.s) * 0.5 : Math.PI
      if (this.mode === 'slide' && a.hitT < 0 && Math.abs(ahead) < 0.9 && Math.abs(a.lat - this.lat) < 0.95) {
        // Bump! They both spin like tops.
        a.hitT = 0
        a.pen.spin()
        this.papa.spin()
        this.counts.bumps++
        honk()
        honk(true)
        this.spray.burst(x, y + 0.4, -a.s, 12, 2, 2.5, 0.16)
      }
      if (a.hitT >= 0) a.hitT += dt
      a.pen.update(dt, t)
    }
  }

  // ---------------------------------------------------------------- home: feeding Pebble

  private feed(dt: number) {
    if (this.fed >= this.feedN) {
      if (this.homeT < 0) {
        this.homeT = 0
        this.setMode('done')
        this.papa.hop()
        this.pebble.hop()
        for (const c of this.colony) c.hop()
        honk(true)
        sounds.fanfare()
        this.events.home()
      }
      return
    }
    // One beakful at a time: a pink krill hops from his beak to hers.
    this.feedT -= dt
    for (const b of this.bites) {
      if (!b.visible) continue
      const u = (b.userData.t += dt) / 0.32
      const from = b.userData.from as Vector3
      const to = this.pebble.root.localToWorld(tmp.set(0, 0.62, 0.22))
      if (u >= 1) {
        b.visible = false
        this.pebble.full = Math.min(1.45, this.pebble.full + 0.4 / this.feedN)
        sfx.munch()
        continue
      }
      b.position.lerpVectors(from, to, u)
      b.position.y += Math.sin(u * Math.PI) * 0.5
    }
    if (this.feedT <= 0) {
      const b = this.bites.find((m) => !m.visible)
      if (b) {
        this.feedT = Math.min(0.32, 3 / this.feedN)
        b.visible = true
        b.userData = { t: 0, from: this.beak(new Vector3()) }
        b.position.copy(b.userData.from)
        this.fed++
        this.papa.full = Math.max(1, this.papa.full - 0.5 / this.feedN)
        this.pebble.hop()
        sounds.note(Math.min(10, this.fed - 1))
      }
    }
  }

  // ---------------------------------------------------------------- Papa: where and how he lies

  private pose(dt: number, t: number) {
    const m = this.mode
    if (m === 'bank') return { belly: 1, wiggle: 1 }
    if (m === 'swim' || m === 'leap') return { belly: this.belly, swim: m === 'swim' ? 1 : 0, wings: m === 'leap' ? 1 : 0 }
    if (m === 'slide') {
      let stretch = 0
      if (this.landT >= 0) {
        this.landT += dt
        stretch = -0.25 * Math.sin(Math.min(1, this.landT / 0.3) * Math.PI)
        if (this.landT > 0.3) this.landT = -1
      }
      return { belly: this.belly, wings: this.air ? Math.min(1, this.airT * 4) : 0.15 + 0.1 * Math.sin(t * 3), stretch }
    }
    if (m === 'feed' || m === 'done') return { belly: this.belly, waddle: m === 'feed' ? 0.2 : 0 }
    return { belly: this.belly }
  }

  private placePapa(dt: number) {
    const m = this.mode
    const wantBelly = m === 'ready' ? clamp((this.modeT - 0.25) / 0.4) : m === 'feed' || m === 'done' ? 0 : 1
    this.belly += (wantBelly - this.belly) * (dt ? 1 - Math.exp(-dt * 9) : 1)
    const p = this.pos()
    this.papaRoot.position.copy(p)
    // Facing the way he's going (home: toward Pebble).
    const vx = dcx(this.s) * this.v + this.latV
    const vz = -Math.max(0.5, this.v)
    let yaw = m === 'feed' || m === 'done' ? Math.PI : m === 'ready' ? Math.PI : Math.atan2(vx, vz)
    if (m === 'leap') yaw = Math.atan2(this.leapTo.x - this.leapFrom.x, this.leapTo.z - this.leapFrom.z)
    let d = yaw - this.yaw
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.yaw += d * (dt ? 1 - Math.exp(-dt * 10) : 1)
    this.papaRoot.rotation.y = this.yaw
    // Nose down the slope (or the way he's flying), and leaning into his swerves.
    let pitch = 0
    if (m === 'slide' || m === 'bank') pitch = this.air ? Math.atan2(-this.vy, Math.max(1, this.v)) * 0.8 : Math.atan((ground(this.s - 0.6, this.lat) - ground(this.s + 0.6, this.lat)) / 1.2)
    else if (m === 'swim') pitch = Math.atan2(-this.vy, Math.max(1, this.v))
    else if (m === 'leap') pitch = Math.atan2(-this.vy, 6) * 0.7
    this.pitch += (clamp(pitch, -1, 1.2) - this.pitch) * (dt ? 1 - Math.exp(-dt * 10) : 1)
    const roll = m === 'slide' || m === 'swim' ? clamp(this.latV / Math.max(2, this.v), -0.6, 0.6) * 0.8 : 0
    this.roll += (roll - this.roll) * (dt ? 1 - Math.exp(-dt * 8) : 1)
    this.lean.rotation.set(this.pitch, 0, -this.roll)
    // His shadow on the ice under him (none in the sea).
    const gy = m === 'slide' || m === 'ready' ? ground(this.s, this.lat) : m === 'shelf' || m === 'feed' || m === 'done' ? SHELF_Y : NaN
    this.shadow.visible = !Number.isNaN(gy) && gy > -1
    if (this.shadow.visible) {
      this.shadow.position.set(p.x, gy + 0.03, p.z)
      this.shadow.scale.setScalar(clamp(1 - (this.y - gy) * 0.15, 0.35, 1) * (this.belly > 0.5 ? 1.3 : 1))
    }
  }

  // ---------------------------------------------------------------- the camera

  private shot(): Shot {
    const m = this.mode
    const tall = this.tall
    if (m === 'feed' || m === 'done') {
      const wide = this.homeT > 1.2
      const c = new Vector3(cx(HOME), SHELF_Y + 0.6, -(HOME - 1.2))
      return { center: c, half: wide ? new Vector3(5.5, 1.2, 4) : new Vector3(tall ? 2 : 2.8, 1, 2), yaw: wide ? 25 : 60, pitch: wide ? 26 : 16 }
    }
    if (m === 'shelf' || m === 'leap') {
      const s = Math.max(this.s, SHELF) + 3
      return { center: new Vector3(cx(s), SHELF_Y + 0.8, -s), half: tall ? new Vector3(3.2, 1.5, 6) : new Vector3(5, 1.5, 4.5), yaw: 0, pitch: 18 }
    }
    if (m === 'swim') {
      const s = this.s + 5
      const c = new Vector3(cx(s) + this.lat * 0.6, depth(s) + 0.3, -s)
      return { center: c, half: tall ? new Vector3(2.8, 1.2, 5) : new Vector3(4.2, 1.2, 4), yaw: -Math.atan(dcx(this.s)) * DEG * 0.6, pitch: 7, maxDist: 12 }
    }
    // Down the slope behind him: further ahead the faster he goes, so what's coming shows.
    const ahead = (m === 'ready' ? 2.5 : 4.5) + this.v * this.rig.lag
    const s = this.s + ahead
    const off = this.s > EDGE - 4
    const gy = off ? Math.max(this.y, -1) : Math.max(base(Math.min(s, EDGE)) + 0.6, this.y - 1.5)
    const c = new Vector3(cx(s) + this.lat * (ridge(this.s + 6) > 0 ? 0.9 : 0.55), gy + (this.air && !off ? Math.max(0, this.y - ground(this.s, this.lat)) * 0.4 : 0), -s)
    const box = m === 'ready' ? new Vector3(2.4, 1, 2.6) : tall ? new Vector3(3.4, 1.2, 6.5) : new Vector3(5, 1.2, 4.5)
    return { center: c, half: box, yaw: -Math.atan(dcx(this.s)) * DEG * 0.7, pitch: off ? 30 : 23 }
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
    this.wheel.down(x, y, this.time, id)
    if (this.mode === 'slide' || this.mode === 'swim') this.steerLat = this.lat
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
    if (id === 'papa') {
      this.counts.pokes++
      honk(true)
      if (this.mode === 'feed' || this.mode === 'done' || this.mode === 'ready') this.papa.hop()
      else if (this.mode === 'swim') {
        const p = this.pos()
        for (let i = 0; i < 8; i++) this.bubble(p.x + (Math.random() - 0.5), p.y + 0.3, p.z + (Math.random() - 0.5))
      } else this.papa.spin()
      return
    }
    if (id === 'pebble') {
      this.counts.pokes++
      this.pebble.hop()
      sfx.chirp()
      return
    }
    if (id === 'seal') {
      this.counts.pokes++
      this.seal.spin()
      sfx.boing()
      return
    }
    if (id?.startsWith('adelie:')) {
      const a = this.adelies[+id.slice(7)]
      if (!a) return
      this.counts.pokes++
      a.pen.hop()
      honk()
      return
    }
    // The snow puffs where she pokes it; under the sea, bubbles.
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const hit = this.raycaster.intersectObjects([this.ribbon, this.seafloor, this.shelf], true)[0]
    if (!hit) return
    if (hit.point.y < 0) {
      for (let i = 0; i < 6; i++) this.bubble(hit.point.x + (Math.random() - 0.5), Math.min(-0.3, hit.point.y + 0.3), hit.point.z + (Math.random() - 0.5))
    } else {
      this.spray.burst(hit.point.x, hit.point.y + 0.1, hit.point.z, 10, 1.6, 2.6, 0.16)
      sfx.fwip()
    }
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | null, height: number, scale = 1.6, glow = false) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (who && who.visible !== false) {
        const c = this.toScreen(who.localToWorld(tmp.set(0, height * 0.5, 0)))
        const top = this.toScreen(who.localToWorld(tmp2.set(0, height, 0)))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.abs(c.y - top.y) * 2 * scale) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
        const shadow = glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    for (const [id, el] of this.anchorEls) {
      if (id === 'papa') place(el, this.papa.root, this.belly > 0.5 ? 0.7 : this.papa.height)
      else if (id === 'pebble') place(el, this.s > SHELF - 30 || this.mode === 'leap' ? this.pebble.root : null, this.pebble.height, 1.8)
      else if (id === 'seal') place(el, this.seal.root.visible && this.sealOn > 0.5 ? this.seal.root : null, 1, 1.6)
      else if (id.startsWith('adelie:')) {
        const a = this.adelies[+id.slice(7)]
        const ahead = a ? a.s - this.s : -1
        place(el, a && this.mode === 'slide' && ahead > -2 && ahead < 40 ? a.pen.root : null, a?.pen.height ?? 1, 1.5)
      }
      el.style.zIndex = id === 'papa' ? '3' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const p = this.pos()
    const papa = this.toScreen(tmp2.copy(p))
    return {
      section: this.section,
      mode: this.mode,
      s: +this.s.toFixed(1),
      lat: +this.lat.toFixed(2),
      y: +this.y.toFixed(2),
      air: this.air,
      speed: +this.v.toFixed(1),
      steerLat: +this.steerLat.toFixed(2),
      push: +this.wheel.push.toFixed(2),
      run: ridge(this.s) > 0 ? (this.lat < 0 ? 'left' : 'right') : null,
      krill: this.krill,
      home: this.homeT >= 0,
      papa: { x: Math.round(papa.x), y: Math.round(papa.y) },
      ...this.counts,
      steered: +this.counts.steered.toFixed(1),
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
