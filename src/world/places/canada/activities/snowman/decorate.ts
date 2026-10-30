// Decorate a Snowman (plan: planning/around-the-world/canada.html): the snowy park below Quebec City's castle
// hotel at the Winter Carnival, the same park the snowball game had. Maple's friends need snowmen for the carnival
// parade, and Kaylee decorates them like she styles hair at the mall's Barber Salon (Thailand's barber/salon.ts).
//
// The toy (core verb): grab a thing from Maple's red toboggan and work it on him. The thing's working end sits just
// above her finger and works on the snow under it on screen:
//   - coal: drag over him and it leaves a trail of coal dots (eyes, a smile, buttons, or coal all over)
//   - carrot: let go over him and it pokes in there (a nose on his head; on his tummy he giggles)
//   - stick: let go and an arm pokes out there (on his head: antlers!)
//   - more snow: pat it on and he gets lumpy and fat where she pats
//   - rainbow snow paint: spray and the snow turns color, going round the rainbow, so a sweep paints stripes
//   - the red tuque, the woven sash, a pink scarf: let go anywhere on him and it goes where it belongs (tuques
//     stack up to three; a fourth lands on Maple)
// Rounds: (face) coal, carrot, sticks, snow; (dress) the paint, the tuque, the sash and the scarf join them, still on
// the same snowman; (friends) a friend walks in with a picture of the snowman they want (Maple's cousin: a tuque and
// sash; the moose: a rainbow one; the raccoon: a silly one; friend.ts), Maple pats a fresh snowman together each time,
// and whatever she makes, they love it. After a handful of touches of decorating the parade
// drum pops up: a tap and he wakes up, wiggles, hops and says hello, Maple's photo flashes, and he hops off to the
// parade line. After the friends' three, the parade. A tap on a tool does a short go with it by itself, so dragging is
// never a must. Nothing fails.
//
// park.ts / props.ts / castle.ts build the park, maple.ts Maple, friend.ts the friends, critters.ts the carriage,
// trumpet, fox and geese; the parade marches to Maple's drum.
// studio.ts has where everything stands, tools.ts the tools and what they leave on him. Built for engine3d/View3D.tsx.
// The feel numbers are knobs (?feel=1).
import { BufferAttribute, Color, Fog, Group, Matrix4, Mesh, Plane, Ray, Raycaster, Scene, Sphere, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, say, sounds, speakingVoice, stopSpeaking, wobble, type Line } from '../../../../../sdk'
import { knobs } from '../../../../kit/knobs'
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
import { Friend } from './friend'
import { Maple } from './maple'
import { CASTLE, CLIFF_Y } from './park'
import { buildPark, Drum, Owl, Sled, SKY, type Park } from './props'
import type { SnowmanSection } from './sections'
import { ALL_TOOLS, BALL_RS, CARDS, DRUM_AT, DRUM_TALL, ENOUGH, ENOUGH_FRIEND, LIFT_PX, lineSpot, MAPLE_AT, MAX, SINK, SPOT, TOOL_LABELS, TRAYS, type Card, type Round, type ToolId } from './studio'
import { buildTool, decorTemplates, RAINBOW, type Decor, type Tool } from './tools'

const FILE = 'src/world/places/canada/activities/snowman/decorate.ts'
/** How each tool feels under her finger. */
const FEEL = knobs('snowDecorate', 'Decorating', FILE, {
  lift: { value: LIFT_PX, min: 0, max: 80, step: 2, label: 'Tool above her finger', unit: 'px', note: 'how far above her fingertip the working end sits (so her finger doesn’t hide it)' },
  coalGap: { value: 26, min: 8, max: 80, step: 2, label: 'Coal dot spacing', unit: 'px', note: 'a new coal dot every this far she drags' },
  snowGap: { value: 30, min: 8, max: 90, step: 2, label: 'Snow pat spacing', unit: 'px', note: 'a new lump of snow every this far she drags' },
  paint: { value: 0.55, min: 0.15, max: 1.5, step: 0.05, label: 'Paint spray size', note: 'the spray’s reach, as a part of the ball’s size on screen' },
  cycle: { value: 0.32, min: 0.08, max: 1.2, step: 0.02, label: 'Rainbow speed', unit: 's', note: 'how long the paint stays one color as she sprays' },
  grab: { value: 1.3, min: 1, max: 1.8, step: 0.02, label: 'Hit him from', note: 'a tool this far outside his edge (× the ball’s size) still works on him' },
})

export interface StudioStart {
  section: SnowmanSection
  /** Finished snowmen already waiting in the parade line. */
  made: number
}
export interface StudioEvents {
  /** She reached the next part (the address bar follows). */
  section(s: SnowmanSection, made: number): void
  /** The picture a friend asks for (friends), or null. */
  card(c: Card | null): void
  /** The drum popped up: he's ready to wake up. */
  ready(): void
  /** Maple's camera flashes. */
  flash(): void
  /** She's been stuck a while: the page shows how (the hand shows it too). */
  hint(kind: HintKind): void
  /** The parade has finished. */
  done(): void
}
export type HintKind = 'tool' | 'drum'

export const STUDIO_ANCHORS: AnchorInfo[] = [
  ...ALL_TOOLS.map((t): AnchorInfo => ({ id: `tool:${t}`, label: TOOL_LABELS[t], kind: 'thing' })),
  { id: 'drum', label: 'The parade drum', kind: 'thing' },
  { id: 'maple', label: 'Maple', kind: 'thing' },
  { id: 'owl', label: 'The snowy owl', kind: 'thing' },
  { id: 'castle', label: 'The castle hotel', kind: 'thing' },
  { id: 'trumpet', label: 'The carnival trumpet', kind: 'thing' },
  { id: 'carriage', label: 'The horse and carriage', kind: 'thing' },
  { id: 'fox', label: 'The red fox', kind: 'thing' },
  { id: 'geese', label: 'The Canada geese', kind: 'thing' },
]

const ORDER: SnowmanSection[] = ['story', 'face', 'dress', 'friends', 'parade']
const TOOL_SCALE = 1.5
const HINT_S = 7
/** The silly reactions: at most one line this often (s). */
const SILLY_GAP = 10
const UP = new Vector3(0, 1, 0)
const UNIT = new Sphere(new Vector3(), 1)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const tmpM = new Matrix4()
const tmpRay = new Ray()
const col = new Color()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

// ---- Sounds (synthesized; the voices are in lines.ts).
const pat = () => [0, 0.09].forEach((d) => noise(0.07, 0.12, 'bandpass', 1300, 700, d, 1.4))
const plink = () => tone(1300 + Math.random() * 400, 900, 0.06, 0.05, 'triangle')
const poke = () => {
  noise(0.08, 0.1, 'bandpass', 900, 500, 0, 1.2)
  tone(600, 900, 0.08, 0.05, 'triangle', 0.04)
}
const pssht = () => noise(0.18, 0.06, 'highpass', 3000, 4200, 0, 0.8)
const giggle = () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(900 + i * 90, 1200 + i * 90, 0.07, 0.05, 'triangle', d))
const hoo = () => [0, 0.45].forEach((d) => tone(420, 360, 0.32, 0.07, 'sine', d))
const boom = () => {
  tone(110, 55, 0.35, 0.22, 'sine')
  noise(0.18, 0.12, 'lowpass', 500, 120)
}
const toot = () => {
  tone(523, 523, 0.18, 0.05, 'sawtooth')
  tone(659, 659, 0.18, 0.05, 'sawtooth', 0.2)
  tone(784, 784, 0.32, 0.05, 'sawtooth', 0.4)
}
/** The parade's march, one note per beat (0: a rest). */
const MARCH = [392, 523, 523, 659, 784, 0, 659, 523, 587, 494, 392, 494, 587, 0, 523, 0]
const chime = () => [0, 0.08, 0.16].forEach((d, i) => tone(1600 + i * 400, 2200 + i * 400, 0.25, 0.03, 'sine', d))
const wake = () => [0, 0.1, 0.2, 0.32].forEach((d, i) => tone(500 + i * 180, 700 + i * 220, 0.12, 0.05, 'sine', d))
const shutter = () => {
  noise(0.05, 0.12, 'highpass', 3000, 2000)
  noise(0.05, 0.1, 'highpass', 2600, 1800, 0.09)
}

interface Ball {
  r: number
  /** Scaled by r: a unit sphere inside, so what she puts on it lives on its unit surface. */
  g: Group
  mesh: Mesh
  color: BufferAttribute
}
type Piece = 'coal' | 'carrot' | 'stick' | 'snow'
type ManState = 'pop' | 'play' | 'wake' | 'walk' | 'line' | 'parade' | 'gone'
interface Snowman {
  root: Group
  /** Wobbles (its pivot on the ground). */
  body: Group
  balls: Ball[]
  pieces: Record<Piece, Object3D[]>
  hats: Object3D[]
  sash: Object3D | null
  scarf: Object3D | null
  painted: number
  x: number
  z: number
  y: number
  wob: number
  wobV: number
  state: ManState
  t: number
  slot: number
  /** Where it's hopping to (walk, parade), one stop after another. */
  route: { x: number; z: number }[]
  hopT: number
}
interface Pop {
  o: Object3D
  s: number
  t: number
}

export class DecorateSnowman implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private park: Park
  private decor: Decor
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private cardEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: SnowmanSection

  // ---- The snowmen: the one she's decorating (`man`), the ones in the parade line.
  private men: Snowman[] = []
  private man: Snowman | null = null
  private round: Round = 'face'
  private card = -1
  /** The friend who brought this picture (walking in, waiting, or walking off beside their snowman). */
  private friend: { f: Friend; x: number; z: number; goal: { x: number; z: number }; state: 'in' | 'wait' } | null = null
  private leaving: { f: Friend; x: number; z: number }[] = []
  private beat = 0
  private beatAt = 0
  private made = 0
  /** Touches of decorating this round (the drum pops up at `enough`), and the stroke going on now. */
  private work = 0
  private stroke = { hit: false, n: 0 }
  private reveal = -1
  private paradeT = -1
  private doneT = -1
  private pops: Pop[] = []

  // ---- The toboggan and her finger.
  private tools = new Map<ToolId, Tool>()
  private homes = new Map<ToolId, Vector3>()
  private sleds = new Map<string, Object3D>()
  private going: { tool: Tool; from: Vector3; t: number }[] = []
  private held: { tool: Tool; x: number; y: number; x0: number; y0: number; moved: boolean } | null = null
  private auto: { tool: Tool; t: number; home: Vector2; n: number } | null = null
  private autoN = new Map<ToolId, number>()
  private used = new Set<ToolId>()
  private toolPops = new Map<Tool, number>()
  private tip = new Vector2(NaN, NaN)
  private lastDot = new Vector2(NaN, NaN)
  private tipWorld = new Vector3()
  private paintT = 0
  private cool = new Map<string, number>()
  private later: { t: number; f: () => void }[] = []

  // ---- Maple and everyone else.
  private maple: Maple
  private hatOnMaple = 0
  private drum: Drum
  private drumAt = new Group()
  private owl: Owl
  private carriage: Carriage
  private carriageT = 9
  private carriageDir: 1 | -1 = 1
  private trumpet: Trumpet
  private fox: Fox
  private foxT = 20
  private geese: Geese
  private geeseT = 14
  private sled: Sled
  private litT = -1
  private lit = 0

  private puff: Particles
  private snowfall: Particles
  private confetti: Particles
  private sparkle: Particles
  private mist: Particles

  private lastTouch = 0
  private storyGo = false
  private storyEnd = -10
  private quietUntil = 0
  private sillySaid = -99
  private hintFor = -1
  private told = { castle: false }
  private gone = false
  private counts = { touches: 0, strokes: 0, coal: 0, carrots: 0, sticks: 0, snow: 0, paint: 0, tuques: 0, sashes: 0, scarves: 0, mapleHats: 0, taps: 0, pokes: 0, autos: 0, reveals: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: StudioStart,
    private events: StudioEvents,
  ) {
    const { scene, bag } = this
    scene.background = new Color(SKY)
    scene.fog = new Fog(SKY, 70, 260)
    applyBands()
    this.rig.fov = 46
    this.rig.lag = 0.5
    this.rig.camera.far = 600
    this.section = start.section

    this.park = buildPark(bag)
    scene.add(this.park.root)
    this.decor = decorTemplates(bag)

    this.maple = new Maple(bag)
    this.maple.root.position.set(MAPLE_AT.x, 0, MAPLE_AT.z)
    this.maple.root.rotation.y = MAPLE_AT.yaw
    this.drum = new Drum(bag)
    // (A bit smaller than the parade's, so it doesn't hide Maple.)
    const drumAt = this.drumAt
    drumAt.position.set(DRUM_AT.x, 0, DRUM_AT.z)
    drumAt.rotation.y = 0.5
    drumAt.scale.setScalar(0.75)
    drumAt.add(this.drum.root)
    this.owl = new Owl(bag)
    this.owl.root.position.set(this.park.lamp.position.x, 4.1, this.park.lamp.position.z)
    this.sled = new Sled(bag)
    this.carriage = new Carriage(bag)
    this.trumpet = new Trumpet(bag)
    this.fox = new Fox(bag)
    this.geese = new Geese(bag)
    scene.add(this.maple.root, drumAt, this.owl.root, this.sled.root, this.carriage.root, this.trumpet.root, this.fox.root, this.geese.root)

    this.puff = new Particles({ kind: 'spray', count: 220, color: '#FFFFFF', gravity: 7 }, bag)
    this.snowfall = new Particles({ kind: 'spray', count: 320, color: '#FFFFFF', gravity: 0.25 }, bag)
    this.confetti = new Particles({ kind: 'spray', count: 260, colors: [PAL.hotpink, PAL.butter, PAL.mint, PAL.sky, '#E8443F', PAL.lavender], gravity: 3 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 140, colors: ['#FFFFFF', '#C9F4FF', '#FFF6B8', PAL.gold], gravity: -0.5 }, bag)
    this.mist = new Particles({ kind: 'spray', count: 200, colors: RAINBOW, gravity: 1.2 }, bag)
    scene.add(this.puff.mesh, this.snowfall.mesh, this.confetti.mesh, this.sparkle.mesh, this.mist.mesh)
    for (let i = 0; i < 160; i++) this.dropFlake(Math.random() * 10)

    this.setUp(start)
    this.rig.setShot(this.shot(), true)
  }

  // ---------------------------------------------------------------- where a link starts

  private setUp(start: StudioStart) {
    const s = start.section
    const made = s === 'friends' ? Math.max(1, Math.min(3, start.made || 1)) : s === 'parade' ? start.made || 4 : 0
    for (let i = 0; i < made; i++) {
      const p = lineSpot(i)
      const m = this.makeMan(p.x, p.z)
      this.readyMade(m, i)
      m.state = 'line'
      m.slot = i
    }
    this.made = made
    if (s === 'parade') {
      this.later.push({ t: 1.0, f: () => this.startParade() })
      this.setTray()
      return
    }
    this.round = s === 'friends' ? 'friends' : s === 'dress' ? 'dress' : 'face'
    const m = this.makeMan(SPOT.x, SPOT.z)
    m.state = 'play'
    this.man = m
    // A dress link: he already has a face (and arms) to dress.
    if (s === 'dress') this.giveFace(m, 1)
    if (s === 'friends') {
      this.card = made - 1
      this.comeIn(true)
    }
    this.setTray()
  }

  /** A plain snowman of three lumpy balls (each its own geometry, so the paint stays on him). */
  private makeMan(x: number, z: number): Snowman {
    const root = new Group()
    const body = new Group()
    root.add(body)
    root.position.set(x, 0, z)
    const lumps = [
      [0.6, 0.55, 0.55],
      [-0.7, 0.2, 0.62],
      [0.1, -0.75, 0.6],
      [-0.2, 0.7, -0.65],
      [0.75, -0.1, -0.6],
      [-0.55, -0.55, -0.6],
    ]
    const balls: Ball[] = []
    let y = 0
    BALL_RS.forEach((r, i) => {
      y = i === 0 ? r * (1 - SINK) : y + (BALL_RS[i - 1] + r) * (1 - SINK)
      const g = solid(merge([P.sphere(1, '#FFFFFF', {}, 24), ...lumps.map(([lx, ly, lz], j) => P.sphere(0.2, j % 2 ? '#E9EDF8' : '#F1F3FB', { at: [lx * 0.9, ly * 0.9, lz * 0.9] }, 10))]), this.bag, 2)
      g.scale.setScalar(r)
      g.position.y = y
      g.rotation.y = (i * 1.7 + x) % 6
      body.add(g)
      const mesh = g.children[0] as Mesh
      balls.push({ r, g, mesh, color: mesh.geometry.getAttribute('color') as BufferAttribute })
    })
    this.scene.add(root)
    const m: Snowman = { root, body, balls, pieces: { coal: [], carrot: [], stick: [], snow: [] }, hats: [], sash: null, scarf: null, painted: 0, x, z, y: 0, wob: 0, wobV: 0, state: 'pop', t: 0, slot: -1, route: [], hopT: 0 }
    this.men.push(m)
    return m
  }

  /** A face for a snowman that comes already made (links): two coal eyes, a smile, a carrot nose and stick arms. */
  private giveFace(m: Snowman, k: number) {
    // (Each ball is turned a little; these are the ways that face her.)
    const at = (b: Ball, x: number, y: number, z: number) => new Vector3(x, y, z).normalize().applyAxisAngle(UP, -b.g.rotation.y)
    const head = m.balls[2]
    this.put(m, head, 'coal', at(head, -0.33, 0.28, 0.9), true)
    this.put(m, head, 'coal', at(head, 0.33, 0.28, 0.9), true)
    for (const a of [-0.5, -0.25, 0, 0.25, 0.5]) this.put(m, head, 'coal', at(head, Math.sin(a) * 0.6, -0.22 - Math.cos(a * 1.4) * 0.08, 0.75), true)
    this.put(m, head, 'carrot', at(head, 0, 0.02, 1), true)
    const mid = m.balls[1]
    this.put(m, mid, 'stick', at(mid, -1, 0.2, 0.1 * k), true)
    this.put(m, mid, 'stick', at(mid, 1, 0.2, 0.1), true)
  }

  /** The line's snowmen from a link: a face, a tuque and a sash (a little different each time). */
  private readyMade(m: Snowman, i: number) {
    this.giveFace(m, i % 2 ? 1 : -1)
    this.wearHat(m, true)
    this.wearSash(m, true)
    if (i % 2) this.wearScarf(m, true)
    if (i % 3 === 2) this.paintAll(m, i)
    m.state = 'line'
  }

  private paintAll(m: Snowman, i: number) {
    m.balls.forEach((b, j) => {
      col.set(RAINBOW[(i + j * 2) % RAINBOW.length]).lerp(new Color('#FFFFFF'), 0.25)
      for (let v = 0; v < b.color.count; v++) b.color.setXYZ(v, col.r, col.g, col.b)
      b.color.needsUpdate = true
    })
    m.painted = 1
  }

  // ---------------------------------------------------------------- the toboggan

  private setTray() {
    const ids = this.paradeT >= 0 || this.section === 'parade' || this.doneT >= 0 ? [] : TRAYS[this.round]
    for (const [id, t] of this.tools) if (!ids.includes(id)) t.root.visible = false
    for (const id of ids) {
      let t = this.tools.get(id)
      if (!t) {
        t = buildTool(id, this.bag)
        t.root.scale.setScalar(TOOL_SCALE)
        this.tools.set(id, t)
        this.scene.add(t.root)
        this.toolPops.set(t, 0)
      }
      t.root.visible = true
    }
    this.layout()
  }

  private get trayIds() {
    return [...this.tools.values()].filter((t) => t.root.visible).map((t) => t.id)
  }

  /** Where each tool rests: one row on a wide screen, two on a tall one, on Maple's red toboggan. */
  private layout() {
    const ids = this.trayIds
    for (const s of this.sleds.values()) s.visible = false
    if (!ids.length) return
    const n = ids.length
    const rows = this.tall && n > 4 ? [ids.slice(0, Math.ceil(n / 2)), ids.slice(Math.ceil(n / 2))] : [ids]
    rows.forEach((row, r) => {
      const gap = this.tall ? 0.62 : Math.min(0.7, 4.6 / n)
      // On a tall screen the back row stands higher, so the front one doesn't hide it.
      const two = rows.length > 1
      const y = two ? (r ? 0.22 : 0.62) : 0.3
      const z = SPOT.z + (two ? (r ? 2.85 : 2.0) : 2.4)
      row.forEach((id, i) => this.homes.set(id, new Vector3(SPOT.x + (i - (row.length - 1) / 2) * gap, y, z)))
      const key = `${r}:${row.length}:${gap.toFixed(2)}:${this.tall}`
      let s = this.sleds.get(key)
      if (!s) {
        const wide = row.length * gap + 0.3
        s = solid(
          merge([
            P.rbox(wide, 0.08, 0.5, 0.04, '#E8443F', { at: [0, y - 0.05, z] }),
            P.cyl(0.16, 0.16, 0.5, '#E8443F', { at: [-wide / 2 - 0.02, y + 0.06, z], rot: [Math.PI / 2, 0, 0] }, 14),
            ...[-1, 1].map((sz) => P.box(wide - 0.2, 0.04, 0.05, '#C9CED9', { at: [0, 0.06, z + sz * 0.2] })),
            ...[-0.3, 0.3].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.03, 0.03, y - 0.1, '#C9CED9', { at: [sx * wide, (y - 0.1) / 2 + 0.06, z + sz * 0.2] }, 6))),
          ]),
          this.bag,
          2,
        )
        this.sleds.set(key, s)
        this.scene.add(s)
      }
      s.visible = true
    })
    for (const t of this.tools.values()) if (t.root.visible && this.isHome(t)) this.rest(t)
  }

  private isHome(t: Tool) {
    return this.held?.tool !== t && this.auto?.tool !== t && !this.going.some((g) => g.tool === t)
  }
  private rest(t: Tool) {
    const h = this.homes.get(t.id)
    if (!h) return
    t.root.position.set(h.x, h.y + t.lift * TOOL_SCALE, h.z)
    t.model.rotation.z = 0
  }
  private sendHome(t: Tool) {
    this.going.push({ tool: t, from: t.root.position.clone(), t: 0 })
  }

  // ---------------------------------------------------------------- touch

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    const was = this.tall
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    if (was !== this.tall) this.layout()
    const d = this.drumSpot
    this.drumAt.position.set(d.x, 0, d.z)
    this.drumAt.rotation.y = this.tall ? -0.5 : 0.5
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  setCardElement(el: HTMLElement | null) {
    this.cardEl = el
  }
  get calm() {
    return false
  }

  pointerDown(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.endStory(true)
    const t = id?.startsWith('tool:') ? this.tools.get(id.slice(5) as ToolId) : undefined
    if (t && t.root.visible && this.auto?.tool !== t) this.held = { tool: t, x, y, x0: x, y0: y, moved: false }
  }
  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    const h = this.held
    if (!h || !isHeld) return
    h.x = x
    h.y = y
    this.lastTouch = this.time
    if (!h.moved && Math.hypot(x - h.x0, y - h.y0) > 10) {
      h.moved = true
      this.counts.touches++
      this.going = this.going.filter((g) => g.tool !== h.tool)
      sfx.fwip()
    }
    // Every move counts (coal dots, paint), even when frames are slow.
    if (h.moved) this.track(h.tool, new Vector2(x, y), 0)
  }
  pointerUp() {
    const h = this.held
    this.held = null
    if (!h?.moved) return
    this.letGo(h.tool)
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    this.endStory(true)
    if (id?.startsWith('tool:')) {
      const t = this.tools.get(id.slice(5) as ToolId)
      if (t) this.tapTool(t)
      return
    }
    if (id) this.counts.pokes++
    switch (id) {
      case 'drum':
        this.drum.hit()
        boom()
        if (this.drum.ready && this.reveal < 0) this.wakeUp()
        return
      case 'maple':
        this.maple.wave()
        this.maple.giggle()
        sfx.chirp()
        this.talk(L.snowman.poke[this.counts.pokes % L.snowman.poke.length])
        return
      case 'owl':
        meet('snowy-owl')
        if (!this.owl.busy) {
          this.owl.poke()
          hoo()
        }
        return
      case 'castle': {
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
      case 'trumpet': {
        this.trumpet.toot()
        toot()
        const b = this.trumpet.bellAt(tmp)
        this.sparkle.burst(b.x, b.y, b.z, 18, 2.2, 2.5, 0.16)
        for (const m of this.men) if (m.state === 'line' || m.state === 'play') m.wobV += 4
        this.maple.hop()
        return
      }
      case 'carriage':
        this.carriage.poke()
        whinny()
        return
      case 'fox':
        meet('red-fox')
        if (!this.fox.pounce()) yip()
        return
      case 'geese':
        meet('canada-goose')
        this.geese.poke()
        honk(3)
        return
    }
    // A snowman: he wobbles and giggles.
    const hit = this.hitMan(x, y)
    if (hit) {
      hit.man.wobV += 5
      giggle()
      this.counts.pokes++
      if (Math.random() < 0.4) this.silly(L.snowman.tickle)
      return
    }
    // The snow: a little puff and a crunch.
    const g = this.ray(x, y).ray.intersectPlane(new Plane(UP, 0), tmp)
    if (g) {
      this.puff.burst(g.x, 0.05, g.z, 8, 1, 1.6, 0.12)
      noise(0.16, 0.06, 'bandpass', 900, 500, 0, 1.3)
    }
  }

  /** A tap on a tool: it goes and does a short go by itself (a smile in coal, a carrot nose, an arm, a hat on). */
  private tapTool(t: Tool) {
    if (this.auto || !t.root.visible) return
    if (this.reveal >= 0 || !this.man || this.man.state !== 'play') {
      this.toolPops.set(t, 0)
      sfx.boing()
      return
    }
    const s = this.toScreen(t.root.position)
    const n = this.autoN.get(t.id) ?? 0
    this.autoN.set(t.id, n + 1)
    this.going = this.going.filter((g) => g.tool !== t)
    this.auto = { tool: t, t: 0, home: new Vector2(s.x, s.y + FEEL.lift), n }
    this.counts.autos++
    sfx.fwip()
  }

  /** The synthetic finger of a tap's go, over him in screen pixels. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto
    const m = this.man
    if (!a || !m) return null
    a.t += dt
    const id = a.tool.id
    const place = id === 'carrot' || id === 'stick' || id === 'tuque' || id === 'sash' || id === 'scarf'
    const dur = place ? 0.8 : 1.8
    if (a.t > dur) {
      this.auto = null
      this.letGo(a.tool)
      return null
    }
    const head = this.ballPx(m, 2)
    const mid = this.ballPx(m, 1)
    const bot = this.ballPx(m, 0)
    const k = Math.max(0, (a.t - 0.35) / (dur - 0.35))
    let target: Vector2
    switch (id) {
      case 'coal':
        // Eyes first, then a smile, then buttons down his front.
        if (a.n % 3 === 0) target = new Vector2(head.x + (k < 0.5 ? -0.35 : 0.35) * head.r, head.y - 0.3 * head.r + (Math.abs(k - 0.5) < 0.1 ? -head.r : 0))
        else if (a.n % 3 === 1) target = new Vector2(head.x + (k * 1.2 - 0.6) * head.r, head.y + head.r * (0.25 + Math.sin(k * Math.PI) * 0.25))
        else target = new Vector2(mid.x, mid.y + (k * 1.6 - 0.8) * mid.r)
        break
      case 'carrot':
        target = a.n % 3 === 0 ? new Vector2(head.x, head.y + 0.05 * head.r) : a.n % 3 === 1 ? new Vector2(mid.x, mid.y) : new Vector2(bot.x, bot.y)
        break
      case 'stick':
        target = new Vector2(mid.x + (a.n % 2 ? 0.85 : -0.85) * mid.r, mid.y - 0.1 * mid.r)
        break
      case 'tuque':
        target = new Vector2(head.x, head.y - 0.7 * head.r)
        break
      case 'scarf':
        target = new Vector2(head.x, head.y + 0.9 * head.r)
        break
      case 'sash':
        target = new Vector2(mid.x, mid.y)
        break
      case 'snow':
        target = new Vector2(bot.x + Math.sin(k * 9) * bot.r * 0.6, bot.y - bot.r * (0.6 - k * 0.6))
        break
      default:
        // The paint: zigzag down him.
        target = new Vector2(mid.x + Math.sin(k * 12) * mid.r * 0.8, head.y + (bot.y + bot.r * 0.4 - head.y) * k)
    }
    target.y += FEEL.lift
    if (a.t < 0.35) return a.home.clone().lerp(target, a.t / 0.35)
    return target
  }

  // ---------------------------------------------------------------- where the tool works

  private toScreen(v: Vector3) {
    const p = tmp3.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private ray(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster
  }
  /** A ball of a snowman on screen: its middle and radius (px). */
  private ballPx(m: Snowman, i: number) {
    const b = m.balls[i]
    const c = b.g.getWorldPosition(new Vector3())
    const s = this.toScreen(c)
    const e = this.toScreen(c.add(tmp2.set(b.r, 0, 0)))
    return { x: s.x, y: s.y, r: Math.abs(e.x - s.x) }
  }
  /** The point on a plane in front of him under a screen point. */
  private onPlane(x: number, y: number, z: number) {
    const r = this.ray(x, y).ray
    const t = (z - r.origin.z) / (r.direction.z || 1e-6)
    return r.origin.clone().addScaledVector(r.direction, t)
  }

  /** The snowman ball under a screen point (generous: a little outside his edge counts), with the point on his surface
   *  in the ball's own unit space (which is also the way out of him there). */
  private hitMan(x: number, y: number, only?: Snowman | null): { man: Snowman; ball: Ball; n: Vector3 } | null {
    const ray = this.ray(x, y).ray
    let best: { man: Snowman; ball: Ball; n: Vector3 } | null = null
    let bestD = Infinity
    for (const m of only ? [only] : this.men) {
      if (m.state === 'gone') continue
      for (const b of m.balls) {
        tmpM.copy(b.g.matrixWorld).invert()
        tmpRay.copy(ray).applyMatrix4(tmpM)
        UNIT.radius = FEEL.grab
        const p = tmpRay.intersectSphere(UNIT, tmp)
        if (!p) continue
        const d = tmp2.copy(p).applyMatrix4(b.g.matrixWorld).distanceTo(ray.origin)
        if (d < bestD) {
          bestD = d
          best = { man: m, ball: b, n: p.clone().normalize() }
        }
      }
    }
    return best
  }

  /** The tool's working end follows the finger; what it does to him there (`dt`: time held there). */
  private track(tool: Tool, finger: Vector2, dt: number) {
    this.tip.set(finger.x, finger.y - FEEL.lift)
    this.tipWorld.copy(this.onPlane(this.tip.x, this.tip.y, SPOT.z + 0.95))
    tool.root.position.copy(this.tipWorld)
    tool.model.rotation.z = tool.lean
    this.used.add(tool.id)
    this.use(tool, dt)
  }

  /** Let go: a carrot, stick or something to wear goes on him where it is; anything else just stops. Then home. */
  private letGo(t: Tool) {
    const m = this.man
    if (m && m.state === 'play' && this.reveal < 0 && !Number.isNaN(this.tip.x)) {
      const hit = this.hitMan(this.tip.x, this.tip.y, m)
      const overMaple = this.overMaple(this.tip.x, this.tip.y)
      switch (t.id) {
        case 'carrot':
        case 'stick':
          if (hit) this.stickIn(m, hit.ball, t.id, hit.n)
          break
        case 'tuque':
          if (hit) this.wearHat(m)
          else if (overMaple) this.hatOnMapleNow()
          break
        case 'sash':
          if (hit) this.wearSash(m)
          break
        case 'scarf':
          if (hit) this.wearScarf(m)
          break
      }
    }
    this.leave()
    this.sendHome(t)
  }

  private overMaple(x: number, y: number) {
    const c = this.toScreen(tmp.copy(this.maple.root.position).setY(this.maple.height * 0.6))
    return Math.hypot(c.x - x, c.y - y) < Math.max(60, this.h * 0.08)
  }

  private leave() {
    // A stroke that touched him counts (a long one a bit more).
    if (this.stroke.hit) this.addWork(1 + Math.floor(this.stroke.n / 8))
    this.stroke = { hit: false, n: 0 }
    this.tip.set(NaN, NaN)
    this.lastDot.set(NaN, NaN)
  }

  private get drumSpot() {
    return this.tall ? DRUM_TALL : DRUM_AT
  }
  private get enough() {
    return this.round === 'friends' ? ENOUGH_FRIEND : ENOUGH
  }
  private addWork(n: number) {
    this.work += n
    this.counts.strokes++
    if (this.work >= this.enough && !this.drum.ready && this.reveal < 0) {
      this.drum.root.scale.setScalar(0.001)
      this.drum.appear()
      this.drum.ready = true
      sfx.pop()
      this.events.ready()
    }
  }

  // ---------------------------------------------------------------- what each tool does

  private use(t: Tool, dt: number) {
    const m = this.man
    if (!m || m.state !== 'play' || this.reveal >= 0) return
    const { x, y } = this.tip
    const hit = this.hitMan(x, y, m)
    if (hit) this.stroke.hit = true
    const far = Number.isNaN(this.lastDot.x) ? Infinity : this.tip.distanceTo(this.lastDot)
    switch (t.id) {
      case 'coal':
        if (hit && far > FEEL.coalGap) {
          this.lastDot.copy(this.tip)
          this.put(m, hit.ball, 'coal', hit.n)
          this.stroke.n++
          if (this.ready('plink', 0.06)) plink()
        }
        break
      case 'snow':
        if (hit && far > FEEL.snowGap) {
          this.lastDot.copy(this.tip)
          this.put(m, hit.ball, 'snow', hit.n)
          this.stroke.n++
          pat()
          const w = hit.ball.g.localToWorld(hit.n.clone())
          this.puff.burst(w.x, w.y, w.z + 0.1, 5, 1, 1.2, 0.08)
          if (this.ready('pat-wob', 0.5)) m.wobV += 1.5
        }
        break
      case 'paint': {
        this.paintT += dt + (Number.isFinite(far) ? far * 0.002 : 0)
        this.lastDot.copy(this.tip)
        const ci = Math.floor(this.paintT / FEEL.cycle) % RAINBOW.length
        if (Math.random() < 0.7) this.mist.emit(this.tipWorld.x, this.tipWorld.y, this.tipWorld.z, (Math.random() - 0.5) * 0.6, -0.3 + (Math.random() - 0.5) * 0.4, -1.2, 0.5, 0.05, ci)
        if (hit) {
          const n = this.paint(m, x, y, RAINBOW[ci])
          if (n) {
            this.stroke.n++
            m.painted++
            this.counts.paint++
            if (this.ready('paint-giggle', 4)) {
              giggle()
              m.wobV += 2
            }
          }
        }
        if (this.ready('pssht', 0.35)) pssht()
        break
      }
      default:
        // Something to put on him: he leans toward it as it comes near.
        if (hit && this.ready('near', 1.2)) m.wobV += 1
    }
  }

  /** A coal dot or a lump of snow on a ball, at `n` (the ball's unit space). `quiet`: no pop (links). */
  private put(m: Snowman, ball: Ball, kind: Piece, n: Vector3, quiet = false) {
    const list = m.pieces[kind]
    const max = MAX[kind]
    if (list.length >= max) list.shift()?.removeFromParent()
    const o = this.decor[kind].clone()
    const s = kind === 'snow' ? (0.8 + Math.random() * 0.6) / ball.r : 1 / ball.r
    o.position.copy(n).multiplyScalar(kind === 'snow' ? 0.94 : kind === 'carrot' ? 0.9 : kind === 'stick' ? 0.85 : 0.985)
    // Sticks point out and a little up, like arms.
    const out = kind === 'stick' ? tmp2.copy(n).add(tmp3.set(0, 0.45, 0)).normalize() : n
    o.quaternion.setFromUnitVectors(UP, out)
    if (kind === 'coal') o.rotateY(Math.random() * 6)
    ball.g.add(o)
    list.push(o)
    this.counts[kind === 'coal' ? 'coal' : kind === 'snow' ? 'snow' : kind === 'carrot' ? 'carrots' : 'sticks']++
    if (quiet) o.scale.setScalar(s)
    else {
      o.scale.setScalar(0.001)
      this.pops.push({ o, s, t: 0 })
    }
  }

  /** A carrot or an arm pokes in where she let go. A nose on his face is just right; anywhere else he giggles. */
  private stickIn(m: Snowman, ball: Ball, kind: 'carrot' | 'stick', n: Vector3) {
    this.put(m, ball, kind, n)
    poke()
    this.addWork(1)
    m.wobV += 3
    const w = ball.g.localToWorld(n.clone())
    this.sparkle.burst(w.x, w.y, w.z + 0.1, 8, 1, 1, 0.08)
    const head = ball === m.balls[2]
    const nose = head && n.z > 0.55 && Math.abs(n.y) < 0.5
    if (kind === 'carrot' && !nose) {
      this.later.push({ t: this.time + 0.25, f: giggle })
      this.silly(L.snowman.tickle)
    }
    if (kind === 'stick' && head) this.later.push({ t: this.time + 0.25, f: giggle })
  }

  /** The red tuque on his head (they stack up to three); a fourth goes on Maple. */
  private wearHat(m: Snowman, quiet = false) {
    if (m.hats.length >= MAX.tuque) {
      if (!quiet) this.hatOnMapleNow()
      return
    }
    const head = m.balls[2]
    const o = this.decor.tuque.clone()
    const i = m.hats.length
    o.position.set(0, i * 1.0, 0)
    o.rotation.z = i ? (i % 2 ? 0.12 : -0.1) : 0
    head.g.add(o)
    m.hats.push(o)
    this.dressed(m, o, quiet)
    this.counts.tuques++
  }
  private wearSash(m: Snowman, quiet = false) {
    if (m.sash) {
      if (!quiet) this.wiggleNo(m)
      return
    }
    const o = this.decor.sash.clone()
    o.position.y = 0.05
    m.balls[1].g.add(o)
    m.sash = o
    this.dressed(m, o, quiet)
    this.counts.sashes++
  }
  private wearScarf(m: Snowman, quiet = false) {
    if (m.scarf) {
      if (!quiet) this.wiggleNo(m)
      return
    }
    const o = this.decor.scarf.clone()
    o.position.y = -0.82
    o.scale.setScalar(0.95)
    m.balls[2].g.add(o)
    m.scarf = o
    this.dressed(m, o, quiet)
    this.counts.scarves++
  }
  private dressed(m: Snowman, o: Object3D, quiet: boolean) {
    if (quiet) return
    const s = o.scale.x
    o.scale.setScalar(0.001)
    this.pops.push({ o, s, t: 0 })
    sounds.place()
    this.addWork(1)
    m.wobV += 3
    const w = o.getWorldPosition(new Vector3())
    this.sparkle.burst(w.x, w.y + 0.2, w.z + 0.2, 12, 1.4, 1.2, 0.1)
  }
  /** Already wearing one: he shakes his head (a wobble and a boing), and it flies home. */
  private wiggleNo(m: Snowman) {
    m.wobV += 4
    sfx.boing()
  }
  private hatOnMapleNow() {
    this.hatOnMaple = 6
    this.maple.hat.visible = true
    this.maple.giggle()
    this.counts.mapleHats++
    sounds.place()
    this.silly(L.snowman.mapleHat)
  }

  /** The snow paint: every bit of his snow near her finger on screen, facing her, takes the color. */
  private paint(m: Snowman, x: number, y: number, c: string) {
    col.set(c)
    let n = 0
    const cam = this.rig.camera.position
    for (const b of m.balls) {
      const r = this.ballPx(m, m.balls.indexOf(b)).r * FEEL.paint
      const pos = b.mesh.geometry.getAttribute('position')
      const center = b.g.getWorldPosition(tmp2)
      let changed = false
      for (let i = 0; i < pos.count; i++) {
        const v = tmp.fromBufferAttribute(pos, i).applyMatrix4(b.mesh.matrixWorld)
        // Only the side facing her.
        if (tmp3.copy(v).sub(center).dot(tmp3.clone().copy(cam).sub(v)) < 0) continue
        const p = v.project(this.rig.camera)
        const sx = ((p.x + 1) / 2) * this.w
        const sy = ((1 - p.y) / 2) * this.h
        const d = Math.hypot(sx - x, sy - y)
        if (d > r) continue
        const k = d < r * 0.6 ? 1 : 1 - (d - r * 0.6) / (r * 0.4)
        b.color.setXYZ(i, b.color.getX(i) + (col.r - b.color.getX(i)) * k, b.color.getY(i) + (col.g - b.color.getY(i)) * k, b.color.getZ(i) + (col.b - b.color.getZ(i)) * k)
        changed = true
        n++
      }
      if (changed) b.color.needsUpdate = true
    }
    return n
  }

  // ---------------------------------------------------------------- he wakes up

  /** The drum: he wakes up, wiggles and hops, says hello, Maple's photo flashes; then the next round (or friend). */
  private wakeUp() {
    const m = this.man
    if (!m) return
    this.reveal = 0
    this.counts.reveals++
    if (this.held) {
      this.letGo(this.held.tool)
      this.held = null
    }
    this.drum.ready = false
    m.state = 'wake'
    m.t = 0
    wake()
    const top = m.balls[2].g.getWorldPosition(new Vector3())
    this.sparkle.burst(top.x, top.y + 0.3, top.z, 26, 2, 2, 0.12)
    const friend = this.round === 'friends'
    // He says hello; then the friend loves it (whatever it looks like), once his hello has finished.
    const fr = friend ? this.friend : null
    this.after(0.5, () => {
      this.quietUntil = this.time + 1.2
      void say(friend ? L.snowman.wake[1] : this.round === 'face' ? L.snowman.wake[0] : L.snowman.wake[2], { interrupt: true }).then(() => {
        if (fr && !this.gone) {
          fr.f.cheer()
          void say(L.snowman.friend[fr.f.card].love, { interrupt: false })
        }
      })
    })
    this.after(1.0, () => {
      this.maple.cheer()
      sounds.correct()
      if (!friend) this.talk(L.snowman.made[this.counts.reveals % L.snowman.made.length])
    })
    this.after(1.9, () => {
      this.events.flash()
      shutter()
      this.confetti.burst(m.x, 2.4, m.z, 40, 3, 3, 0.1)
    })
    this.after(3.0, () => {
      this.drum.root.visible = false
      this.drum.root.scale.setScalar(0.001)
      this.work = 0
      this.reveal = -1
      if (this.round === 'face') {
        // The same snowman again: now dress him.
        m.state = 'play'
        this.round = 'dress'
        this.setTray()
        this.enter('dress')
        return
      }
      // Off he hops to the parade line (the friend walks off beside him); the next friend's snowman (or the parade).
      this.events.card(null)
      this.toLine(m)
      this.talk(L.snowman.bye)
      const fr = this.friend
      if (fr) {
        this.leaving.push({ f: fr.f, x: fr.x, z: fr.z })
        this.friend = null
      }
      if (this.round === 'dress') {
        this.round = 'friends'
        this.card = 0
      } else this.card++
      if (this.card >= CARDS.length) {
        this.man = null
        this.setTray()
        this.after(1.8, () => this.startParade())
        return
      }
      this.after(1.0, () => this.nextFriend())
    })
  }

  private toLine(m: Snowman) {
    const slot = this.made++
    const to = lineSpot(slot)
    m.slot = slot
    m.state = 'walk'
    m.route = [{ x: (m.x + to.x) / 2, z: Math.min(m.z, to.z) - 0.4 }, to]
    if (this.man === m) this.man = null
  }

  /** Maple pats a fresh snowman together, and holds up the next friend's picture. */
  private nextFriend() {
    this.enter('friends')
    const m = this.makeMan(SPOT.x, SPOT.z)
    m.state = 'pop'
    m.t = 0
    this.man = m
    this.maple.pat()
    pat()
    this.puff.burst(SPOT.x, 0.3, SPOT.z, 30, 2.4, 2.4, 0.18)
    this.setTray()
    this.comeIn(false)
  }

  /** Where the friend stands while she decorates their snowman: beside him, in front of the parade line. */
  private get friendSpot() {
    return this.tall ? { x: 1.1, z: SPOT.z + 0.75 } : { x: 1.6, z: SPOT.z + 0.9 }
  }

  /** The next friend walks in from the right with their picture, waves and says hello (`now`: a link, already there). */
  private comeIn(now: boolean) {
    const card = CARDS[this.card]
    if (!card) return
    const f = new Friend(card, this.bag)
    this.scene.add(f.root)
    const spot = this.friendSpot
    const from = now ? spot : { x: 8.5, z: spot.z }
    this.friend = { f, x: from.x, z: from.z, goal: spot, state: now ? 'wait' : 'in' }
    f.root.rotation.y = now ? -0.45 : -Math.PI / 2
    f.root.position.set(from.x, 0, from.z)
    if (now) this.later.push({ t: 0.8, f: () => this.arrived() })
  }

  private arrived() {
    const fr = this.friend
    if (!fr) return
    fr.state = 'wait'
    fr.f.wave()
    this.talk(L.snowman.friend[fr.f.card].hi, true)
    this.events.card(fr.f.card)
  }

  /** The friends walk (in, and off with their snowman), turning to where they go and then to her. */
  private walkFriends(dt: number, t: number) {
    const walk = (w: { f: Friend; x: number; z: number }, goal: { x: number; z: number }) => {
      const dx = goal.x - w.x
      const dz = goal.z - w.z
      const d = Math.hypot(dx, dz)
      const speed = 1.6
      if (d < 0.05) return 0
      const s = Math.min(d, speed * dt)
      w.x += (dx / d) * s
      w.z += (dz / d) * s
      w.f.root.rotation.y = turn(w.f.root.rotation.y, Math.atan2(dx, dz), dt * 8)
      return speed
    }
    const fr = this.friend
    if (fr) {
      const v = fr.state === 'in' ? walk(fr, fr.goal) : 0
      if (fr.state === 'in' && !v) this.arrived()
      // Waiting: facing her, a little toward the snowman, watching the tool.
      if (!v) fr.f.root.rotation.y = turn(fr.f.root.rotation.y, -0.45, dt * 5)
      const look = this.held || this.auto ? this.tipWorld : null
      fr.f.look(look ? clamp(Math.atan2(look.x - fr.x, look.z - fr.z) - fr.f.root.rotation.y, -1, 1) : 0)
      fr.f.root.position.set(fr.x, 0, fr.z)
      fr.f.update(dt, t, v)
    }
    for (const w of [...this.leaving]) {
      const v = walk(w, { x: 9.5, z: w.z })
      w.f.root.position.set(w.x, 0, w.z)
      w.f.update(dt, t, v)
      if (!v) {
        w.f.root.removeFromParent()
        this.leaving.splice(this.leaving.indexOf(w), 1)
      }
    }
  }

  private startParade() {
    if (this.paradeT >= 0) return
    this.enter('parade')
    this.events.card(null)
    this.paradeT = 0
    this.setTray()
    this.talk(L.snowman.parade, true)
    this.maple.drumming = true
    this.trumpet.toot()
    toot()
    const line = this.men.filter((m) => m.state === 'line' || m.state === 'walk').sort((a, b) => a.slot - b.slot)
    line.forEach((m, i) => {
      m.state = 'parade'
      m.t = -i * 0.55
      m.route = [{ x: m.x, z: -3.5 }, { x: -14, z: -3.5 }]
    })
  }

  private enter(s: SnowmanSection) {
    if (ORDER.indexOf(s) <= ORDER.indexOf(this.section)) {
      // Each friend's picture keeps the address bar on the friends' section.
      if (s === 'friends' && this.section === 'friends') this.events.section(s, this.made)
      return
    }
    this.section = s
    this.events.section(s, this.made)
  }

  private endStory(skipped: boolean) {
    if (this.section !== 'story') return
    if (skipped) stopSpeaking()
    this.storyEnd = this.time
    this.lastTouch = this.time
    this.enter('face')
  }

  // ---------------------------------------------------------------- the frame

  private talk(line: Line, must = false) {
    if (!must && (speakingVoice() || this.time < this.quietUntil)) return
    this.quietUntil = this.time + 1.2
    void say(line, { interrupt: must })
  }
  private silly(l: Line) {
    if (this.time - this.sillySaid < SILLY_GAP) return
    this.sillySaid = this.time
    this.talk(l)
  }
  private ready(key: string, every: number) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return false
    this.cool.set(key, this.time)
    return true
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  update(dt: number) {
    const t = (this.time += dt)
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      l.f()
    }
    // The story: Maple waves and asks (one line), then on to decorating.
    if (this.section === 'story') {
      if (!this.storyGo && t > 0.6) {
        this.storyGo = true
        this.maple.wave()
        void say(L.snowman.story[0], { interrupt: true }).then(() => this.after(0.6, () => this.endStory(false)))
      }
    }
    // ---- The tool in her hand (or doing a tap's go) ----
    const h = this.held?.moved ? this.held : null
    const finger = h ? new Vector2(h.x, h.y) : this.autoFinger(dt)
    const tool = h?.tool ?? this.auto?.tool ?? null
    if (finger && tool) this.track(tool, finger, dt)
    for (const g of [...this.going]) {
      g.t += dt / 0.35
      const home = this.homes.get(g.tool.id)
      if (!home) continue
      const to = tmp.set(home.x, home.y + g.tool.lift * TOOL_SCALE, home.z)
      g.tool.root.position.lerpVectors(g.from, to, Math.min(1, g.t)).y += bell(Math.min(1, g.t)) * 0.2
      g.tool.model.rotation.z = g.tool.lean * (1 - Math.min(1, g.t))
      if (g.t >= 1) {
        this.going.splice(this.going.indexOf(g), 1)
        this.rest(g.tool)
        sfx.thump()
      }
    }
    for (const [tl, k] of this.toolPops) {
      const k2 = Math.min(1, k + dt / 0.45)
      this.toolPops.set(tl, k2)
      tl.root.scale.setScalar(TOOL_SCALE * (k2 < 1 ? 1 + wobble(k2, 2) * 0.25 : 1))
      if (k2 >= 1) this.toolPops.delete(tl)
    }
    if (this.held && !this.held.moved && this.isHome(this.held.tool)) {
      const home = this.homes.get(this.held.tool.id)
      if (home) this.held.tool.root.position.y += (home.y + (this.held.tool.lift + 0.06) * TOOL_SCALE - this.held.tool.root.position.y) * 0.3
    }
    // ---- What she put on him pops in ----
    for (const p of [...this.pops]) {
      p.t = Math.min(1, p.t + dt / 0.3)
      p.o.scale.setScalar(Math.max(0.001, p.s * (p.t < 1 ? Math.min(1, p.t * 1.6) * (1 + wobble(p.t, 2) * 0.3) : 1)))
      if (p.t >= 1) this.pops.splice(this.pops.indexOf(p), 1)
    }
    for (const m of this.men) this.updateMan(m, dt, t)
    this.walkFriends(dt, t)
    // The parade's march: Maple drums, one note a beat, and the trumpet toots now and then.
    if (this.paradeT >= 0 && this.doneT < 0 && t >= this.beatAt) {
      this.beatAt = t + 0.3
      const n = MARCH[this.beat++ % MARCH.length]
      if (n) tone(n, n, 0.2, 0.05, 'triangle')
      if (this.beat % 2 === 0) noise(0.08, 0.1, 'lowpass', 300, 120)
      if (this.beat % 16 === 0) {
        this.trumpet.toot()
        toot()
      }
    }
    if (this.doneT >= 0) this.maple.drumming = false
    // ---- Maple ----
    if (this.hatOnMaple > 0 && (this.hatOnMaple -= dt) <= 0) this.maple.hat.visible = false
    const look = tool ? this.tipWorld : this.man ? this.man.balls[2].g.getWorldPosition(tmp) : null
    const mp = this.maple.root.position
    this.maple.look(look ? clamp(Math.atan2(look.x - mp.x, look.z - mp.z) - MAPLE_AT.yaw, -1, 1) : 0)
    this.maple.update(dt, t, 0)
    // ---- The drum, the park ----
    this.drum.update(dt, t)
    this.owl.update(dt, t)
    if (this.sled.update(dt)) {
      this.puff.burst(this.sled.root.position.x, 0.2, this.sled.root.position.z, 14, 2.5, 3, 0.22)
      noise(0.3, 0.08, 'lowpass', 900, 300)
    }
    this.critters(dt, t)
    if (this.litT >= 0 && (this.litT += dt) > 4) this.litT = -1
    const litGoal = this.litT >= 0 || this.paradeT >= 0 ? 1 : 0
    if (Math.abs(this.lit - litGoal) > 0.002) {
      this.lit += (litGoal - this.lit) * ease(dt, 4)
      this.park.setWindows(this.lit)
    }
    if (Math.random() < dt * 30) this.dropFlake(0)
    for (const p of [this.puff, this.snowfall, this.confetti, this.sparkle, this.mist]) p.update(dt)
    // ---- The parade ----
    if (this.paradeT >= 0) {
      this.paradeT += dt
      const left = this.men.filter((m) => m.state === 'parade')
      if (this.doneT < 0 && (left.length === 0 || this.paradeT > 14)) {
        this.doneT = 0
        this.maple.cheer()
        sounds.fanfare()
        this.confetti.burst(0, 3, 0, 80, 4, 4, 0.12)
        this.talk(L.snowman.done, true)
        this.after(1.5, () => this.events.done())
      }
    }
    this.lights.follow(0, 0, SPOT.z - 2)
    this.rig.lag = this.section === 'story' || t - this.storyEnd < 2 ? 1 : 0.5
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  private updateMan(m: Snowman, dt: number, t: number) {
    m.t += dt
    // A wobbly spring: taps, pats and hops set it going.
    m.wobV += (-m.wob * 60 - m.wobV * 5) * dt
    m.wob += m.wobV * dt
    let y = 0
    let sx = 1
    let sy = 1
    if (m.state === 'pop') {
      const k = Math.min(1, m.t / 0.5)
      sx = sy = Math.max(0.001, k < 1 ? k * (1 + wobble(k, 2) * 0.25) : 1)
      if (k >= 1) m.state = 'play'
    } else if (m.state === 'wake') {
      // Wakes up: a stretch, two happy hops, a wiggle.
      const k = m.t
      if (k < 0.4) {
        sy = 1 - bell(k / 0.4) * 0.12
        sx = 1 + bell(k / 0.4) * 0.08
      } else if (k < 1.6) {
        const h = ((k - 0.4) / 0.6) % 1
        y = Math.sin(h * Math.PI) * 0.45
        if (h > 0.9 && this.ready('wake-land', 0.3)) pat()
      } else if (k < 2.6) m.wob = Math.sin((k - 1.6) * 18) * 0.12 * (1 - (k - 1.6))
    } else if (m.state === 'walk' || m.state === 'parade') {
      if (m.t > 0 && m.route.length) {
        const to = m.route[0]
        const dx = to.x - m.x
        const dz = to.z - m.z
        const d = Math.hypot(dx, dz)
        const speed = m.state === 'parade' ? 2.2 : 1.8
        if (d < 0.05) m.route.shift()
        else {
          const s = Math.min(d, speed * dt)
          m.x += (dx / d) * s
          m.z += (dz / d) * s
          m.hopT += dt * 2.6
          y = Math.abs(Math.sin(m.hopT * Math.PI)) * 0.3
          if (Math.sin(m.hopT * Math.PI) * Math.sin((m.hopT - dt * 2.6) * Math.PI) < 0) {
            if (this.ready(`land${this.men.indexOf(m)}`, 0.2)) {
              this.puff.burst(m.x, 0.05, m.z, 4, 0.8, 1, 0.1)
              if (m.state === 'walk') pat()
            }
          }
          // The drum and the trumpet keep time for the parade.
        }
        if (!m.route.length) {
          if (m.state === 'walk') {
            m.state = 'line'
            m.wobV += 3
          } else {
            m.state = 'gone'
            m.root.visible = false
          }
        }
      }
    } else if (m.state === 'line') {
      // Waiting in the line: a little bounce now and then.
      y = Math.max(0, Math.sin(t * 2.2 + m.slot)) ** 8 * 0.06
    }
    m.root.position.set(m.x, y, m.z)
    m.body.rotation.z = m.wob
    m.body.scale.set(sx, sy, sx)
    // Facing her while she works; turning to where he hops.
    m.root.rotation.y = m.state === 'parade' && m.route.length && m.route[0].x < m.x - 0.1 ? -1.2 : 0
  }

  private critters(dt: number, t: number) {
    const live = this.section !== 'story'
    this.carriage.update(dt, t, 0)
    if (live && !this.carriage.passing && (this.carriageT -= dt) < 0) {
      this.carriageT = 28 + Math.random() * 14
      this.carriage.go(this.carriageDir)
      this.carriageDir = this.carriageDir > 0 ? -1 : 1
    }
    this.trumpet.update(dt, t)
    this.geese.update(dt, t)
    if (live && !this.geese.flying && (this.geeseT -= dt) < 0) {
      this.geeseT = 34 + Math.random() * 14
      const dir = Math.random() < 0.5 ? 1 : -1
      this.geese.go(-dir * 30, dir * 30, 6.5, -7)
      honk(2)
    }
    const ev = this.fox.update(dt, t)
    if (ev === 'yip') yip()
    if (ev === 'dive') {
      const f = this.fox.pos
      this.puff.burst(f.x, 0.3, f.z, 30, 2.4, 3.2, 0.2)
      noise(0.25, 0.08, 'lowpass', 900, 300)
    }
    if (live && !this.fox.here && this.paradeT < 0 && (this.foxT -= dt) < 0) {
      // She trots in now and then to watch from beside the drum.
      this.foxT = 34 + Math.random() * 12
      this.fox.come({ x: -14, z: -0.5 }, { x: -3.9, z: 0.2 })
    }
  }

  private dropFlake(age: number) {
    this.snowfall.emit((Math.random() - 0.5) * 34, 9 + Math.random() * 5 - age, SPOT.z - 6 + (Math.random() - 0.5) * 24, (Math.random() - 0.5) * 0.3, -0.7, 0, 14, 0.07 + Math.random() * 0.06)
  }

  private shot(): Shot {
    const tall = this.tall
    if (this.paradeT >= 0) {
      // Alongside the marchers (the whole line in view as they set off), the castle up on the cliff behind them.
      const m = this.men.filter((p) => p.state === 'parade' || p.state === 'line')
      const x0 = m.length ? Math.min(...m.map((p) => p.x)) : 0
      const x1 = m.length ? Math.max(...m.map((p) => p.x)) : 0
      const cx = clamp((x0 + x1) / 2, -8, 6)
      const span = Math.max(tall ? 4 : 6, (x1 - x0) / 2 + 1.6)
      return { center: new Vector3(cx, tall ? 5.5 : 4.2, -3.5), half: tall ? new Vector3(span, 7, 6) : new Vector3(span, 5, 6), yaw: 0, pitch: 10 }
    }
    if (this.section === 'story') {
      // The park with Maple in it, the castle up on the cliff behind. (A tall screen aims higher, so the snow in front
      // doesn't fill its bottom half.)
      return { center: new Vector3(0, tall ? 6.5 : 4.5, -5.5), half: tall ? new Vector3(8, 8, 8) : new Vector3(12, 7, 10), yaw: 0, pitch: 10 }
    }
    // Close on him, Maple beside him, the toboggan along the bottom; the castle behind, up top.
    const line = this.made > 0 && !tall
    return {
      center: new Vector3(SPOT.x + (line ? 0.7 : 0), tall ? 1.45 : 1.15, SPOT.z + (tall ? 1.45 : 0.9)),
      half: tall ? new Vector3(1.5, 1.5, 1.7) : new Vector3(line ? 3.6 : 3.0, 1.4, 1.4),
      yaw: 0,
      pitch: 15,
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  // ---------------------------------------------------------------- the hint: a tool to try, or the drum

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    const idle = t - this.lastTouch
    const playing = this.section !== 'story' && this.man?.state === 'play' && this.reveal < 0 && !this.held && !this.auto
    let at: Vector3 | null = null
    let kind: HintKind = 'tool'
    if (playing && this.drum.ready && idle > 4) {
      at = tmp.set(this.drumSpot.x, 1.2, this.drumSpot.z)
      kind = 'drum'
    } else if (playing && (idle > HINT_S || (this.counts.touches === 0 && this.counts.autos === 0 && idle > 3))) {
      const id = this.trayIds.find((i) => !this.used.has(i)) ?? this.trayIds[0]
      const tl = id ? this.tools.get(id) : null
      if (tl) at = tmp.copy(tl.root.position)
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    if (idle > HINT_S && this.hintFor !== this.lastTouch) {
      this.hintFor = this.lastTouch
      this.events.hint(kind)
    }
    const p = this.toScreen(at)
    el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`
  }

  // ---------------------------------------------------------------- tap targets

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.4, size?: number) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp.copy(at).setY(at.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(at).setY(at.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: size ?? Math.max(min, Math.min(this.w * 0.3, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const pos = (o: Object3D) => o.getWorldPosition(new Vector3())
    // The tools: one target each, as wide as its share of the toboggan (never under the minimum).
    const tray = this.trayIds
    const gapPx = (() => {
      if (tray.length < 2) return min
      const a = this.homes.get(tray[0])
      const b = this.homes.get(tray[1])
      if (!a || !b) return min
      return Math.abs(this.toScreen(a).x - this.toScreen(b).x)
    })()
    for (const [id, el] of this.anchorEls) {
      if (id.startsWith('tool:')) {
        const tl = this.tools.get(id.slice(5) as ToolId)
        const home = tl ? this.homes.get(tl.id) : null
        const here = tl && tl.root.visible && home && this.isHome(tl) ? home.clone().setY(home.y - 0.05) : null
        place(el, here, 0.4, 1, Math.max(min, Math.min(gapPx * 0.98, 130)))
        el.style.zIndex = '4'
        continue
      }
      if (id === 'drum') place(el, this.drum.root.visible ? pos(this.drum.root) : null, 1.5, 0.9)
      else if (id === 'maple') place(el, pos(this.maple.root), this.maple.height, 0.9)
      else if (id === 'owl') place(el, pos(this.owl.root), 0.9, 1.6)
      else if (id === 'castle') place(el, new Vector3(CASTLE.x, CLIFF_Y + 1, CASTLE.z + 3), 11, 0.75)
      else if (id === 'trumpet') place(el, pos(this.trumpet.root), 2.6, 0.8)
      else if (id === 'carriage') place(el, this.carriage.passing ? this.carriage.center(tmp3).setY(CLIFF_Y + 0.3).clone() : null, 2, 1)
      else if (id === 'fox') place(el, this.fox.here && this.fox.pokeable ? this.fox.center(tmp3).setY(0).clone() : null, 1.1, 1.2)
      else if (id === 'geese') place(el, this.geese.flying ? this.geese.center(tmp3).setY(this.geese.root.position.y - 0.6).clone() : null, 1.2, 2)
      el.style.zIndex = id === 'drum' ? '3' : id === 'castle' ? '0' : '1'
    }
    // The friend's picture, held up over their head.
    if (this.cardEl) {
      const fr = this.friend
      const c = fr ? this.toScreen(tmp.set(fr.x, fr.f.height + 0.2, fr.z)) : { x: -999, y: -999 }
      this.cardEl.style.display = fr && fr.state === 'wait' && this.paradeT < 0 ? '' : 'none'
      this.cardEl.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const m = this.man
    return {
      section: this.section,
      round: this.round,
      card: this.card >= 0 ? CARDS[this.card] ?? null : null,
      made: this.made,
      work: this.work,
      enough: this.enough,
      drum: this.drum.ready ? scr(new Vector3(this.drumSpot.x, 1.0, this.drumSpot.z)) : null,
      /** Where to drag a tool to: his head, middle and bottom on screen. */
      man: m ? { head: scr(m.balls[2].g.getWorldPosition(new Vector3())), middle: scr(m.balls[1].g.getWorldPosition(new Vector3())), bottom: scr(m.balls[0].g.getWorldPosition(new Vector3())), state: m.state } : null,
      tools: Object.fromEntries(this.trayIds.map((id) => [id, scr(this.homes.get(id)!.clone().setY(this.homes.get(id)!.y + 0.1))])),
      wearing: m ? { coal: m.pieces.coal.length, carrots: m.pieces.carrot.length, sticks: m.pieces.stick.length, snow: m.pieces.snow.length, hats: m.hats.length, sash: !!m.sash, scarf: !!m.scarf, painted: m.painted } : null,
      states: this.men.map((s) => s.state).join(' '),
      marching: this.paradeT >= 0,
      done: this.doneT >= 0,
      fox: this.fox.state,
      ...this.counts,
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.gone = true
    this.scene.clear()
    this.bag.dispose()
  }
}

function turn(from: number, to: number, k: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + d * Math.min(1, k)
}
