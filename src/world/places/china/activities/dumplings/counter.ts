// The Dumpling House in 3D (plan: planning/around-the-world/china/dumpling-house.html): Chef Fu's dumpling counter in
// Shanghai. Kaylee stands behind the counter (her finger is her hands) and the friends sit on the stools across it.
//
// The toy (core verb): squish and shape the dough (dough.ts). Poke it and it dents and jiggles; press it flat into a
// wrapper; drag it and it stretches like mochi. Then the same finger, richer three times:
//   grandpa  plop the filling on, push the near edge over: a half-moon, crimped shut (three, Chef Fu tosses the balls)
//   colors   soup dumplings: pinch all the way round the rim and a pleat rises under her finger (Chef Fu counts them in
//            Chinese), then it twists shut. She picks the dough from the colored bowls (drop one on another: a swirl)
//   giant    she pulls her own piece off the big lump: the further she pulls, the bigger. A giant one for Bao Bao. And
//            Hou Hou the monkey sneaks one out of the basket (tap him and he gives it back)
// Side verb: move it. Drag a dumpling into the steamer, tap the lid on, pop the steam puffs while they cook, then slide
// the basket across the counter to a friend, who eats them right there (a mix-up is fine: they eat it anyway).
// 'play' is the same toy with no orders (the greybox test: is it fun to squish?), and the payoff puts the dumplings
// she made in the shop window. Things to poke: Chef Fu, every friend, the lanterns, the teapot (then tap tap for
// thank you), the goldfish, the flour bag (Chef Fu sneezes), the chopsticks, the door bell, the Pearl Tower, the cat,
// the bike outside.
// Built for engine3d/View3D.tsx; nothing here comes from Thailand. The dough's feel is on feel-lab knobs (?feel=1).
import { Group, Plane, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { burst, clamp, say, sounds, spendHint, type Line } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { AnchorInfo } from '../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { blobShadow, P, solid } from '../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { Particles } from '../../../../engine3d/particles'
import { applyBands, makeLights } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { L } from '../../lines'
import { DOUGH, DOUGH_COLORS, Dough, PLEAT, type DoughColor, type Kind } from './dough'
import { Friend } from './friends'
import { BALL_R, BASKET_H, BELL, BOARD, CHEF, CHEF_TALL, CHOPSTICKS, COLOR_BOWLS, FILLING, FISH, FLOUR, LANTERNS, LUMP, SEATS, SERVE_Z, TEAPOT, WINDOW, WOK, WORK, type Seat } from './layout'
import { buildBasket, buildBlob, buildLid, buildPuff, buildRoom, type Room } from './room'
import type { DumplingSection, Step } from './sections'

const FILE = 'src/world/places/china/activities/dumplings/counter.ts'
/** Moving things across the counter (?feel=1). */
const MOVE = knobs('serve', 'Moving things', FILE, {
  follow: { value: 14, min: 2, max: 40, step: 0.5, label: 'Follows her finger', unit: '/s', note: 'how closely a carried dumpling or basket keeps up' },
  drop: { value: 0.42, min: 0.15, max: 1, step: 0.01, label: 'Drops in from', unit: 'm', note: 'let go this close to the basket (or a friend) and it goes there' },
  steam: { value: 5, min: 1, max: 15, step: 0.5, label: 'Steaming', unit: 's', note: 'how long the baskets steam' },
  lump: { value: 0.32, min: 0.1, max: 0.8, step: 0.01, label: 'Pull for the biggest', unit: 'm', note: 'how far she pulls from the lump to get a giant piece' },
})

export type RoundId = 'play' | 'grandpa' | 'colors' | 'giant'
type Source = 'chef' | 'bowls' | 'lump'
interface Order {
  who: Exclude<Seat, 'doudou'>
  n: number
  color?: DoughColor
}
interface RoundDef {
  kind: Kind | 'both'
  source: Source
  orders: Order[]
  basketR: number
}
const ROUNDS: Record<RoundId, RoundDef> = {
  play: { kind: 'both', source: 'chef', orders: [], basketR: 0.26 },
  grandpa: { kind: 'moon', source: 'chef', orders: [{ who: 'grandpa', n: 3 }], basketR: 0.26 },
  colors: { kind: 'pouch', source: 'bowls', orders: [{ who: 'bunnies', n: 2 }, { who: 'goose', n: 1, color: 'yellow' }], basketR: 0.24 },
  giant: { kind: 'pouch', source: 'lump', orders: [{ who: 'baobao', n: 3 }], basketR: 0.36 },
}
const NEXT: Record<RoundId, DumplingSection> = { play: 'play', grandpa: 'colors', colors: 'giant', giant: 'payoff' }
const BOWL_COLORS: DoughColor[] = ['pink', 'green', 'yellow']

export interface CounterStart {
  section: DumplingSection
  at: Step
  /** The dumplings for the window (the payoff, and what's already there from last time). */
  window: string[]
}
export interface CounterEvents {
  /** A new part began (the address bar follows): a round, the payoff. */
  section(s: DumplingSection, made: string[]): void
  /** Sparkle says it (a new thing appeared), shown in the line at the bottom. */
  guide(l: Line, voice?: boolean): void
  /** A round is finished (saved: next time she carries on from the next one). */
  round(r: RoundId, made: string[]): void
  /** The payoff is over: the stamp. */
  done(made: string[]): void
}
export type HintKind = keyof typeof L.dumplings.hint

export const COUNTER_ANCHORS: AnchorInfo[] = [
  { id: 'cheffu', label: 'Chef Fu', kind: 'thing' },
  { id: 'doudou', label: 'Dou Dou', kind: 'thing' },
  { id: 'grandpa', label: 'Grandpa Turtle', kind: 'thing' },
  { id: 'bunnies', label: 'The Bunny Twins', kind: 'thing' },
  { id: 'goose', label: 'Mrs Goose', kind: 'thing' },
  { id: 'baobao', label: 'Bao Bao', kind: 'thing' },
  { id: 'houhou', label: 'Hou Hou the monkey', kind: 'thing' },
  { id: 'teapot', label: 'The teapot', kind: 'thing' },
  { id: 'lantern0', label: 'A red lantern', kind: 'thing' },
  { id: 'lantern1', label: 'A red lantern', kind: 'thing' },
  { id: 'lantern2', label: 'A red lantern', kind: 'thing' },
  { id: 'fish', label: 'The goldfish', kind: 'thing' },
  { id: 'flour', label: 'The flour bag', kind: 'thing' },
  { id: 'chopsticks', label: 'The chopsticks', kind: 'thing' },
  { id: 'bell', label: 'The door bell', kind: 'thing' },
  { id: 'pearl', label: 'The Pearl Tower', kind: 'thing' },
  { id: 'cat', label: 'The cat', kind: 'thing' },
  { id: 'bike', label: 'The bicycle', kind: 'thing' },
]

const D = L.dumplings
const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

// ---- Sounds (synthesized; the voices are in lines.ts).
const squish = (k = 1) => noise(0.12, 0.07 * k, 'lowpass', 520, 220, 0, 1.2)
const plop = () => {
  tone(320, 140, 0.12, 0.12, 'sine')
  noise(0.06, 0.05, 'lowpass', 600, 200)
}
const click = (i: number) => tone(880 + i * 60, 1300 + i * 60, 0.06, 0.06, 'triangle')
const chomp = () => noise(0.07, 0.08, 'bandpass', 1400, 700, 0, 1.6)
const sizzle = () => noise(0.5, 0.05, 'highpass', 3000, 5000)
const ding = () => [0, 0.18].forEach((d) => tone(1568, 1568, 0.5, 0.06, 'sine', d))
const knock = () => noise(0.05, 0.12, 'lowpass', 900, 300)
const swish = () => noise(0.18, 0.04, 'bandpass', 1500, 2600)

type Stage = 'none' | 'ball' | 'wrapper' | 'filled' | 'done' | 'arrive' | 'basket' | 'flying'
interface Piece {
  dough: Dough
  stage: Stage
  /** Its code for the shop window: color, swirl-color, giant-/tiny-. */
  code: string
  basket: Basket | null
  fly: { from: Vector3; to: Vector3; t: number; dur: number; arc: number; then: () => void } | null
  giggle: number
}
interface Basket {
  root: Group
  r: number
  order: Order
  /** Who it was made for (a basket slid to someone else is still eaten happily). */
  planned: Exclude<Seat, 'doudou'>
  pieces: Piece[]
  /** Its place in the stack (0 at the bottom). */
  level: number
  state: 'stack' | 'carry' | 'served' | 'home'
  x: number
  z: number
  y: number
  eaten: number
  eatT: number
}
interface Puff {
  g: Group
  v: Vector3
  age: number
  life: number
}
type Grab =
  | { kind: 'dough'; piece: Piece; gx: number; gz: number; sx: number; sy: number; moved: boolean; lastAngle: number | null; foldZ: number }
  | { kind: 'carry'; piece: Piece; sx: number; sy: number }
  | { kind: 'blob'; g: Group }
  | { kind: 'ball'; color: DoughColor; g: Group }
  | { kind: 'lump'; g: Group; size: number }
  | { kind: 'basket'; basket: Basket }

export class DumplingCounter implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private room: Room
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private plane = new Plane(new Vector3(0, 1, 0), 0)
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private section: DumplingSection
  private round: RoundId | null = null
  private def: RoundDef = ROUNDS.play
  private gone = false

  // ---- What's on the counter.
  private piece: Piece | null = null
  private pieces: Piece[] = []
  private baskets: Basket[] = []
  private lid: Group | null = null
  private lidState: 'none' | 'ready' | 'on' | 'off' = 'none'
  private steamT = -1
  private puffs: Puff[] = []
  private puffT = 0
  private stage: 'make' | 'lid' | 'steam' | 'serve' | 'eat' | 'between' | 'payoff' | 'story' = 'story'
  private made: string[] = []
  private madeInRound = 0
  private bowlBalls: Group[] = []
  private finger: { x: number; y: number } | null = null
  private grab: Grab | null = null
  private lastProgress = 0
  private hintFor = ''
  private told = new Set<string>()
  private storyT = 0
  private storyDone = false
  private nextT = -1
  private payoffT = -1
  private windowItems: Group[] = []
  private windowShown: string[]
  private teaT = -10
  private knocks = 0
  private madeCount = 0

  // ---- The characters.
  private chef: Friend
  private friends: Record<Exclude<Seat, 'doudou'>, Friend[]>
  private doudou: Friend
  private houhou: Friend
  private houT = -1
  private houPiece: Piece | null = null
  private houDone = false
  private talker: Friend | null = null
  private lanternSwing = [0, 0, 0]
  private lanternV = [0, 0, 0]
  private fishSpin = 0
  private bellSwing = 0
  private bellV = 0
  private pearlGlow = 0
  private catStretch = 0
  private bikeT = 6
  private bikeX = -6
  private chopJump = 0
  private teapotTip = 0
  private flourPuff = 0

  private crumbs: Particles
  private flour: Particles
  private sparkle: Particles
  private soup: Particles
  private counts = { touches: 0, presses: 0, stretches: 0, folds: 0, pleats: 0, fills: 0, blorps: 0, swirls: 0, inBaskets: 0, served: 0, mixups: 0, popped: 0, pokes: 0, squirts: 0, pancakes: 0, giants: 0, sneaks: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: CounterStart,
    private events: CounterEvents,
  ) {
    const { scene, bag } = this
    scene.background = null
    applyBands()
    this.rig.fov = 40
    this.rig.lag = 0.5
    this.rig.camera.near = 0.05
    this.rig.camera.far = 80
    this.section = start.section
    this.windowShown = start.window

    this.room = buildRoom(bag)
    scene.add(this.room.root)

    // ---- Chef Fu and the friends.
    this.chef = new Friend('cheffu', bag, 1.45, 'cheffu')
    this.chef.seated = false
    this.chef.yaw = CHEF.yaw
    this.chef.root.position.set(CHEF.x, -0.92, CHEF.z)
    this.chef.root.rotation.y = CHEF.yaw
    scene.add(this.chef.root)
    const seat = (f: Friend, s: { x: number; z: number }, dx = 0) => {
      // Sitting on the stool so the chin is just over the counter.
      f.root.position.set(s.x + dx, -0.34 + 0.04, s.z)
      const shadow = f.rig.root.children[0]
      if (shadow) shadow.visible = false
      scene.add(f.root)
      f.hide()
      return f
    }
    this.friends = {
      grandpa: [seat(new Friend('grandpa', bag, 0.95, 'grandpa'), SEATS.grandpa)],
      bunnies: [seat(new Friend('bunny', bag, 0.72, 'bunnies'), SEATS.bunnies, -0.13), seat(new Friend('bunny2', bag, 0.72, 'bunnies'), SEATS.bunnies, 0.13)],
      goose: [seat(new Friend('goose', bag, 1.0, 'goose'), SEATS.goose)],
      baobao: [seat(new Friend('baobao', bag, 0.92, 'baobao'), SEATS.baobao)],
    }
    this.doudou = new Friend('doudou', bag, 0.78, 'doudou')
    this.doudou.root.position.set(SEATS.doudou.x, -0.18 + 0.04, SEATS.doudou.z)
    this.doudou.yaw = -0.5
    this.doudou.root.rotation.y = -0.5
    const ds = this.doudou.rig.root.children[0]
    if (ds) ds.visible = false
    scene.add(this.doudou.root)
    this.houhou = new Friend('houhou', bag, 0.62, 'houhou')
    this.houhou.seated = false
    this.houhou.hide()
    scene.add(this.houhou.root)

    // ---- Effects.
    this.crumbs = new Particles({ kind: 'spray', count: 60, colors: ['#FFF0D2', '#E08A6E', '#FFFFFF'], gravity: 3 }, bag)
    this.flour = new Particles({ kind: 'spray', count: 80, color: '#FFFFFF', gravity: -0.4 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 80, colors: ['#FFC83D', '#FF8FB8', '#FFFFFF', '#8FE3C8'], gravity: 1.2 }, bag)
    this.soup = new Particles({ kind: 'spray', count: 50, colors: ['#F6C46A', '#FFE3A0'], gravity: 4 }, bag)
    scene.add(this.crumbs.mesh, this.flour.mesh, this.sparkle.mesh, this.soup.mesh)

    // The dumplings already in the shop window (from last time).
    this.fillWindow(this.windowShown, false)

    this.unwatch = watch('dumplings', () => {
      const d = this.piece?.dough
      return {
        flat: [d ? d.flatGoal : 0, 1.4],
        fold: [d ? d.fold : 0, 1],
        pleats: [d ? d.pleated / Math.max(1, d.pleats.length) : 0, 1],
        finger: [this.grab ? 1 : 0, 1],
      }
    })

    this.begin(start)
  }

  // ---------------------------------------------------------------- the flow

  private begin(start: CounterStart) {
    const s = start.section
    if (s === 'open') {
      this.stage = 'story'
      this.startRound('grandpa', 'dough', true)
      return
    }
    if (s === 'payoff') {
      for (const id of ['grandpa', 'bunnies', 'goose', 'baobao'] as const) this.friends[id].forEach((f) => f.arrive())
      this.made = start.window.length ? [...start.window] : ['cream', 'cream', 'cream', 'pink', 'green', 'yellow', 'giant-pink', 'tiny-green', 'swirl-yellow']
      // A payoff link's dumplings are the ones that hop in (not twice).
      this.windowShown = []
      this.fillWindow([], false)
      this.startPayoff()
      return
    }
    // Friends from the rounds before this one are already sitting there, full and happy.
    const order: RoundId[] = ['grandpa', 'colors', 'giant']
    const k = order.indexOf(s as RoundId)
    for (let i = 0; i < k; i++) for (const o of ROUNDS[order[i]].orders) this.friends[o.who].forEach((f) => f.arrive())
    this.startRound(s as RoundId, start.at, false)
  }

  private startRound(r: RoundId, at: Step, story: boolean) {
    this.round = r
    this.def = ROUNDS[r]
    this.madeInRound = 0
    this.baskets.forEach((b) => b.state === 'stack' && b.root.removeFromParent())
    this.baskets = this.baskets.filter((b) => b.state === 'served')
    this.lidState = 'none'
    this.lid?.removeFromParent()
    this.lid = null
    // The friends this round is for arrive (and say what they'd like when the opening is over).
    for (const o of this.def.orders) this.friends[o.who].forEach((f) => !f.root.visible && f.arrive())
    if (!story) {
      this.stage = 'make'
      this.say(this.orderLine())
    }
    this.newBasket()
    // The bowls of colored dough (round 2), the big lump (round 3).
    this.room.lump.visible = this.def.source === 'lump'
    this.bowlBalls.forEach((b) => b.removeFromParent())
    this.bowlBalls = []
    this.room.colorBowls.forEach((b) => (b.visible = this.def.source === 'bowls'))
    if (this.def.source === 'bowls')
      this.bowlBalls = BOWL_COLORS.map((c, i) => {
        const g = solid(P.sphere(0.075, DOUGH_COLORS[c], {}, 14), this.bag, 2)
        g.position.set(COLOR_BOWLS[i][0], 0.1, COLOR_BOWLS[i][2])
        this.scene.add(g)
        return g
      })

    // A section link that starts further on: what came before is made for her.
    const total = this.def.orders.reduce((a, o) => a + o.n, 0)
    if (at === 'steam' || at === 'serve') {
      for (let i = 0; i < total; i++) {
        const p = this.makePiece(this.defaultColor(i), this.kindFor(i), this.def.source === 'lump' && i === 1 ? 1.9 : 1)
        p.dough.finish()
        // The next order's basket, once this one is full.
        if (!this.current && this.baskets.filter((b) => b.state === 'stack').length < this.def.orders.length) this.newBasket()
        this.toBasket(p, true)
      }
      // Settled on the wok at once (a new basket drops in from above, and would carry the dumplings down with it).
      for (const b of this.baskets) if (b.state === 'stack') b.root.position.set(b.x, b.y, b.z)
      this.stage = 'lid'
      this.lidReady()
      if (at === 'serve') {
        this.lidState = 'off'
        ;(this.lid as Group | null)?.removeFromParent()
        this.lid = null
        this.stage = 'serve'
        this.guide(D.serve)
      }
    } else {
      this.nextBall(at === 'dough' ? 'dough' : at)
    }
    if (!story) this.events.section(r as DumplingSection, this.made)
  }

  private orderLine(): Line | Line[] {
    if (this.round === 'grandpa') return D.order.grandpa
    if (this.round === 'colors') return [D.order.bunnies, D.order.goose]
    if (this.round === 'giant') return D.order.baobao
    return []
  }
  private kindFor(i: number): Kind {
    return this.def.kind === 'both' ? (i % 2 ? 'pouch' : 'moon') : this.def.kind
  }
  private defaultColor(i: number): DoughColor {
    if (this.round === 'colors') return (['pink', 'green', 'yellow'] as DoughColor[])[i % 3]
    if (this.round === 'giant') return (['pink', 'cream', 'green'] as DoughColor[])[i % 3]
    return 'cream'
  }
  /** The order the next dumpling goes to (the first basket not full yet). */
  private get current() {
    return this.baskets.find((b) => b.state === 'stack' && b.pieces.length < b.order.n) ?? null
  }

  private makePiece(color: DoughColor, kind: Kind, size = 1, swirl: DoughColor | null = null) {
    const dough = new Dough(this.bag, { r: BALL_R * size, kind, color, swirl })
    dough.root.add(blobShadow(BALL_R * size * 1.6, this.bag))
    this.scene.add(dough.root)
    const code = `${size > 1.55 ? 'giant-' : size < 0.8 ? 'tiny-' : ''}${swirl ? 'swirl-' : ''}${color}`
    const p: Piece = { dough, stage: 'ball', code, basket: null, fly: null, giggle: 0 }
    this.pieces.push(p)
    return p
  }

  /** A fresh ball on the board (Chef Fu tosses one), or the bowls/lump wait for her to bring one. */
  private nextBall(at: Step | 'dough' = 'dough') {
    if (this.piece) return
    const i = this.madeInRound
    const kind = this.kindFor(i)
    if (at !== 'dough') {
      const p = this.makePiece(this.defaultColor(i), kind, this.def.source === 'lump' ? 1.4 : 1)
      p.dough.root.position.set(...WORK)
      p.dough.makeWrapper()
      p.stage = 'wrapper'
      if (at === 'fold') {
        p.dough.addFilling()
        p.stage = 'filled'
        this.guide(kind === 'moon' ? D.fold : D.pleat)
      } else this.guide(D.fill)
      this.piece = p
      return
    }
    if (this.def.source === 'chef') {
      const p = this.makePiece('cream', kind)
      this.piece = p
      p.stage = 'arrive'
      this.chef.play('toss')
      const from = this.chef.root.position.clone().add(new Vector3(0.35, 1.37, 0.1))
      p.dough.root.position.copy(from)
      setTimeout(() => {
        if (this.gone) return
        this.fly(p, from, new Vector3(...WORK), 0.55, 0.35, () => {
          p.stage = 'ball'
          sfx.boing()
          p.dough.poke(1.2)
          if (!this.told.has('squish')) this.guide(D.squish)
        })
      }, 250)
      return
    }
    this.piece = null
    if (this.def.source === 'bowls' && !this.told.has('color')) this.guide(D.color)
    if (this.def.source === 'lump' && !this.told.has('pull')) this.guide(D.pull)
  }

  private fly(p: Piece, from: Vector3, to: Vector3, dur: number, arc: number, then: () => void) {
    p.fly = { from: from.clone(), to: to.clone(), t: 0, dur, arc, then }
    p.stage = p.stage === 'arrive' ? 'arrive' : 'flying'
  }

  private newBasket() {
    const order = this.def.orders[this.baskets.filter((b) => b.state === 'stack').length]
    const o: Order = order ?? { who: 'grandpa', n: 4 }
    const r = this.def.basketR
    const root = buildBasket(this.bag, r)
    const level = this.baskets.filter((b) => b.state === 'stack').length
    const b: Basket = { root, r, order: o, planned: o.who, pieces: [], level, state: 'stack', x: WOK[0], z: WOK[2], y: 0.2 + level * BASKET_H, eaten: 0, eatT: -1 }
    root.position.set(b.x, b.y + 0.4, b.z)
    this.scene.add(root)
    this.baskets.push(b)
    if (level > 0) swish()
  }

  /** Where each dumpling sits in a basket. */
  private slot(b: Basket, i: number, n: number) {
    const rr = n <= 1 ? 0 : b.r * 0.5
    const a = (i / Math.max(1, n)) * Math.PI * 2 + 0.6
    return new Vector3(b.x + Math.cos(a) * rr, b.y + 0.02, b.z + Math.sin(a) * rr)
  }

  private toBasket(p: Piece, snap = false) {
    const b = this.current
    if (!b) return
    p.basket = b
    b.pieces.push(p)
    if (p === this.piece) this.piece = null
    const n = Math.max(b.order.n, b.pieces.length)
    // Shrink to fit a busy basket (a giant one keeps most of its size: it gets the big basket).
    const fit = Math.min(1, (n <= 1 ? b.r * 0.9 : b.r * 0.5) / Math.max(0.01, p.dough.r * (p.dough.kind === 'moon' ? 1.25 : 1.45)))
    p.dough.root.scale.setScalar(fit)
    b.pieces.forEach((q, i) => {
      const to = this.slot(b, i, n)
      if (snap || q !== p) q.dough.root.position.copy(to)
      else this.fly(q, q.dough.root.position, to, 0.4, 0.18, () => (q.stage = 'basket'))
      if (snap) q.stage = 'basket'
    })
    if (!snap) {
      plop()
      this.counts.inBaskets++
      this.madeInRound++
      this.madeCount++
      this.made.push(p.code)
      this.lastProgress = this.time
      if (!this.round || this.round === 'play') {
        // Free play: a full basket is carried off by Chef Fu (ho ho!) and an empty one comes.
        if (b.pieces.length >= 4) setTimeout(() => this.clearBasket(b), 900)
        setTimeout(() => this.nextBall(), 600)
        return
      }
      // Round 3: Hou Hou sneaks in after the second.
      if (this.round === 'giant' && !this.houDone && this.madeInRound === 2) setTimeout(() => this.monkeySneak(), 900)
      const total = this.def.orders.reduce((a, o) => a + o.n, 0)
      if (b.pieces.length >= b.order.n && this.madeInRound < total) setTimeout(() => this.newBasket(), 400)
      if (this.madeInRound >= total) setTimeout(() => this.lidReady(), 700)
      else setTimeout(() => this.nextBall(), 600)
    }
  }

  private clearBasket(b: Basket) {
    b.pieces.forEach((p) => {
      p.dough.root.removeFromParent()
      this.pieces = this.pieces.filter((q) => q !== p)
    })
    b.pieces = []
    this.chef.play('laugh')
    sounds.whoosh()
  }

  private lidReady() {
    if (this.lidState !== 'none' || this.gone) return
    // Not while Hou Hou is holding one.
    if (this.houPiece) {
      setTimeout(() => this.lidReady(), 600)
      return
    }
    this.stage = 'lid'
    const top = this.baskets.filter((b) => b.state === 'stack').reduce((a, b) => (b.level > a.level ? b : a))
    this.lid = buildLid(this.bag, this.def.basketR)
    this.lid.position.set(WOK[0], top.y + BASKET_H + 0.4, WOK[2] - 0.05)
    this.scene.add(this.lid)
    this.lidState = 'ready'
    this.lastProgress = this.time
    this.guide(D.lid)
  }

  private lidOn() {
    if (this.lidState !== 'ready') return
    this.lidState = 'on'
    this.stage = 'steam'
    this.steamT = 0
    this.room.flame.visible = true
    sfx.thump()
    sizzle()
    this.lastProgress = this.time
    if (!this.told.has('steamFact')) this.guide(D.steamFact)
    setTimeout(() => !this.gone && this.stage === 'steam' && this.guide(D.puffs, !this.told.has('puffs')), 2600)
  }

  private steamDone() {
    this.stage = 'serve'
    this.lidState = 'off'
    this.room.flame.visible = false
    this.steamT = -1
    sounds.fanfare()
    const top = this.baskets.filter((b) => b.state === 'stack').reduce((a, b) => (b.level > a.level ? b : a))
    this.sparkle.burst(WOK[0], top.y + BASKET_H + 0.1, WOK[2], 24, 1, 1.4, 0.05)
    this.chef.play('cheer')
    if (this.def.kind !== 'moon') this.say(D.tada)
    setTimeout(() => !this.gone && this.guide(D.serve), 1200)
    this.lastProgress = this.time
  }

  private serve(b: Basket, who: Exclude<Seat, 'doudou'>) {
    b.state = 'served'
    b.x = SEATS[who].x
    b.z = SERVE_Z
    b.y = 0.01
    b.eatT = 0.6
    b.order = { ...b.order, who }
    this.counts.served++
    sounds.place()
    this.stage = this.baskets.some((x) => x.state === 'stack') ? 'serve' : 'eat'
    // The rest of the stack settles down onto the wok.
    this.baskets.filter((x) => x.state === 'stack').sort((p, q) => p.level - q.level).forEach((x, i) => {
      x.level = i
      x.y = 0.2 + i * BASKET_H
      x.pieces.forEach((q, j) => q.dough.root.position.copy(this.slot(x, j, Math.max(x.order.n, x.pieces.length))))
    })
    this.lastProgress = this.time
  }

  /** The whole round is eaten: saved, and the next friends come after a moment. */
  private roundDone() {
    const r = this.round
    if (!r || r === 'play') return
    this.stage = 'between'
    this.events.round(r, this.made)
    const next = NEXT[r]
    this.nextT = 2.8
    this.nextSection = next
  }
  private nextSection: DumplingSection = 'colors'

  private startPayoff() {
    this.stage = 'payoff'
    this.section = 'payoff'
    this.payoffT = 0
    this.events.section('payoff', this.made)
    for (const fs of Object.values(this.friends)) fs.forEach((f) => f.play('clap'))
    this.chef.play('cheer')
    this.doudou.play('cheer')
    sounds.fanfare()
    burst()
    this.guide(D.clap)
    this.say([D.thanks, D.window])
  }

  private fillWindow(codes: string[], animate: boolean) {
    this.windowItems.forEach((g) => g.removeFromParent())
    this.windowItems = []
    const list = codes.slice(-10)
    const sill = { y: WINDOW.y - WINDOW.h / 2 + 0.02, z: WINDOW.z + 0.12 }
    list.forEach((code, i) => {
      const parts = code.split('-')
      const color = (parts[parts.length - 1] as DoughColor) in DOUGH_COLORS ? (parts[parts.length - 1] as DoughColor) : 'cream'
      const size = parts.includes('giant') ? 1.7 : parts.includes('tiny') ? 0.7 : 1
      const swirl = parts.includes('swirl') ? (color === 'pink' ? 'yellow' : 'pink') : null
      const kind: Kind = color === 'cream' && !swirl && size === 1 ? 'moon' : 'pouch'
      const d = new Dough(this.bag, { r: BALL_R * size * 0.85, kind, color, swirl })
      d.finish()
      d.root.position.set(-WINDOW.w / 2 + 0.25 + (i + 0.5) * ((WINDOW.w - 0.5) / Math.max(1, list.length)), sill.y, sill.z)
      if (animate) {
        d.root.scale.setScalar(0.001)
        setTimeout(() => {
          if (this.gone) return
          d.root.scale.setScalar(1)
          d.poke(1.4)
          sfx.pop()
          this.sparkle.burst(d.root.position.x, sill.y + 0.1, sill.z, 6, 0.6, 0.8, 0.04)
        }, 600 + i * 260)
      }
      this.scene.add(d.root)
      this.windowItems.push(d.root)
      this.windowDoughs.push(d)
    })
  }
  private windowDoughs: Dough[] = []

  // ---------------------------------------------------------------- talk

  private say(l: Line | Line[]) {
    const lines = Array.isArray(l) ? l : [l]
    void (async () => {
      for (const x of lines) {
        if (this.gone) return
        await say(x, { interrupt: false })
      }
    })()
  }
  private talk(l: Line) {
    void say(l)
  }
  private guide(l: Line, voice = true) {
    const key = typeof l === 'string' ? l : l.text
    this.told.add(Object.entries(D).find(([, v]) => v === l)?.[0] ?? key)
    this.events.guide(l, voice)
  }

  // ---------------------------------------------------------------- frame

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    const c = this.tall ? CHEF_TALL : CHEF
    this.chef.root.position.set(c.x, -0.92, c.z)
    this.chef.root.rotation.y = this.chef.yaw = c.yaw
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

  private shot(): Shot {
    if (this.stage === 'payoff') {
      return { center: new Vector3(0, 0.5, -1.4), half: this.tall ? new Vector3(1.75, 0.8, 1.3) : new Vector3(2.1, 0.9, 1.2), yaw: 0, pitch: this.tall ? 24 : 18 }
    }
    // The board fills the bottom, the friends across the counter above it, the bowls and the wok at the sides.
    // Tall: a little wider (Chef Fu at the left, Dou Dou at the right) and looking further down, so the red counter
    // front doesn't fill the bottom.
    if (this.tall) return { center: new Vector3(-0.05, 0.12, -0.55), half: new Vector3(1.02, 0.5, 0.7), yaw: 0, pitch: 54 }
    // A short phone: the board sits a little higher, clear of the line at the bottom.
    if (this.h < 500) return { center: new Vector3(0, 0.2, -0.22), half: new Vector3(1.28, 0.45, 0.8), yaw: 0, pitch: 42 }
    return { center: new Vector3(0, 0.22, -0.3), half: new Vector3(1.3, 0.45, 0.72), yaw: 0, pitch: 40 }
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.lights.follow(0, 0, -0.3)

    // The opening: Dou Dou and Chef Fu say their two lines; the dough is already squishable.
    if (this.stage === 'story') {
      this.storyT += dt
      if (this.storyT > 0.4 && !this.storyGo) {
        this.storyGo = true
        this.doudou.play('wave')
        void (async () => {
          await say(D.open[0])
          if (this.gone || this.storyDone) return
          this.chef.play('wave')
          await say(D.open[1], { interrupt: false })
          this.endStory()
        })()
      }
    }

    // Free play's and the rounds' next friends.
    if (this.nextT > 0) {
      this.nextT -= dt
      if (this.nextT <= 0) {
        ding()
        this.bellV += 4
        if (this.nextSection === 'payoff') this.startPayoff()
        else {
          this.section = this.nextSection
          this.startRound(this.nextSection as RoundId, 'dough', false)
        }
      }
    }

    // ---- Her finger.
    this.handleFinger(dt)

    // ---- The dumplings.
    for (const p of this.pieces) {
      if (p.fly) {
        const f = p.fly
        f.t += dt / f.dur
        const k = Math.min(1, f.t)
        const e = k * k * (3 - 2 * k)
        p.dough.root.position.lerpVectors(f.from, f.to, e)
        p.dough.root.position.y += Math.sin(k * Math.PI) * f.arc
        if (f.t >= 1) {
          p.fly = null
          f.then()
        }
      }
      if (p.giggle > 0) {
        p.giggle -= dt
        p.dough.root.rotation.z = Math.sin(p.giggle * 30) * 0.15 * p.giggle
      }
      p.dough.update(dt)
    }
    for (const d of this.windowDoughs) d.update(dt)
    // A basket carried, sliding home or served.
    for (const b of this.baskets) {
      const goal = new Vector3(b.x, b.y, b.z)
      if (b.state === 'carry' && this.finger) {
        const g = this.onPlane(this.finger.x, this.finger.y, 0.02, tmp)
        if (g) goal.set(clamp(g.x, -1.9, 1.9), 0.08, clamp(g.z, -0.55, 0.3))
      }
      const k = ease(dt, b.state === 'carry' ? MOVE.follow : 9)
      const before = b.root.position.clone()
      b.root.position.lerp(goal, k)
      const d = b.root.position.clone().sub(before)
      b.pieces.forEach((p) => !p.fly && p !== this.houPiece && p.dough.root.position.add(d))
      // Eating, one at a time.
      if (b.state === 'served' && b.eatT >= 0 && b.root.position.distanceTo(goal) < 0.05) {
        b.eatT -= dt
        if (b.eatT <= 0) this.eatOne(b)
      }
    }
    if (this.lid) {
      if (this.lidState === 'on' || this.lidState === 'ready') {
        const top = this.baskets.filter((b) => b.state === 'stack').reduce((a, b) => (b.level > a.level ? b : a), this.baskets[0])
        const want = this.lidState === 'on' ? tmp.set(top.x, top.y + BASKET_H, top.z) : tmp.set(WOK[0], top.y + BASKET_H + 0.4 + Math.sin(t * 3) * 0.03, WOK[2] - 0.05)
        this.lid.position.lerp(want, ease(dt, 10))
        if (this.lidState === 'on') this.lid.position.y += Math.max(0, Math.sin(t * 22)) * 0.006
      }
    }
    // Steam: puffs rise from the top basket while it cooks; she can pop them.
    if (this.steamT >= 0) {
      this.steamT += dt
      this.puffT -= dt
      if (this.puffT <= 0 && this.lid) {
        this.puffT = 0.45
        const g = buildPuff(this.bag)
        g.position.set(this.lid.position.x + (Math.random() - 0.5) * 0.15, this.lid.position.y + 0.08, this.lid.position.z + (Math.random() - 0.5) * 0.1)
        g.scale.setScalar(0.4)
        this.scene.add(g)
        this.puffs.push({ g, v: new Vector3((Math.random() - 0.5) * 0.08, 0.22, 0.05), age: 0, life: 3.2 })
      }
      if (this.steamT > MOVE.steam) this.steamDone()
    }
    for (const p of this.puffs) {
      p.age += dt
      p.g.position.addScaledVector(p.v, dt)
      p.g.position.x += Math.sin(p.age * 3 + p.v.x * 50) * 0.002
      const s = Math.min(1.4, 0.4 + p.age * 0.7) * (p.age > p.life - 0.4 ? Math.max(0.01, (p.life - p.age) / 0.4) : 1)
      p.g.scale.setScalar(s)
    }
    for (const p of this.puffs.filter((q) => q.age >= q.life)) p.g.removeFromParent()
    this.puffs = this.puffs.filter((q) => q.age < q.life)

    // ---- The characters.
    const look = this.piece ? this.piece.dough.root.getWorldPosition(tmp2).clone() : new Vector3(0, 0, 0.1)
    this.chef.lookAt(look)
    this.chef.update(dt)
    for (const fs of Object.values(this.friends))
      for (const f of fs) {
        const carried = this.grab?.kind === 'basket' ? this.grab.basket.root.position : null
        f.lean += ((carried && Math.abs(carried.x - f.root.position.x) < 0.4 ? 1 : 0) - f.lean) * ease(dt, 6)
        f.lookAt(carried ?? look)
        f.update(dt)
      }
    this.doudou.lookAt(look)
    this.doudou.update(dt)
    this.updateMonkey(dt)

    // ---- Things to poke.
    this.room.lanterns.forEach((g, i) => {
      this.lanternV[i] += (-this.lanternSwing[i] * 9 - this.lanternV[i] * 1.2) * dt
      this.lanternSwing[i] += this.lanternV[i] * dt
      g.rotation.z = this.lanternSwing[i] + Math.sin(t * 0.8 + i) * 0.03
    })
    this.fishSpin = Math.max(0, this.fishSpin - dt)
    const fa = t * 0.9 + (1 - Math.exp(-this.fishSpin * 2)) * 8
    this.room.fish.position.set(Math.cos(fa) * 0.08, 0.15 + Math.sin(t * 2) * 0.01, Math.sin(fa) * 0.08)
    this.room.fish.rotation.y = -fa - Math.PI / 2
    this.bellV += (-this.bellSwing * 30 - this.bellV * 3) * dt
    this.bellSwing += this.bellV * dt
    this.room.bell.rotation.z = this.bellSwing
    this.pearlGlow = Math.max(0, this.pearlGlow - dt)
    this.room.pearl.scale.setScalar(1.15 * (1 + Math.sin(this.pearlGlow * 12) * 0.04 * this.pearlGlow))
    this.catStretch = Math.max(0, this.catStretch - dt)
    this.room.cat.scale.set(1 + Math.sin(this.catStretch * Math.PI) * 0.3, 1 - Math.sin(this.catStretch * Math.PI) * 0.15, 1)
    this.chopJump = Math.max(0, this.chopJump - dt)
    this.room.chopsticks.position.y = Math.sin(this.chopJump * Math.PI * 3) * 0.04 * this.chopJump
    this.teapotTip = Math.max(0, this.teapotTip - dt)
    this.room.teapot.rotation.z = -Math.sin(Math.min(1, this.teapotTip / 1.6) * Math.PI) * 0.6
    this.flourPuff = Math.max(0, this.flourPuff - dt)
    this.room.flour.scale.y = 1 - Math.sin(this.flourPuff * 10) * 0.08 * this.flourPuff
    this.bikeT -= dt
    if (this.bikeT <= 0) {
      this.bikeX += dt * 1.1
      this.room.bike.position.x = this.bikeX
      this.room.bike.position.y = -0.8 + Math.abs(Math.sin(t * 8)) * 0.015
      if (this.bikeX > 5) {
        this.bikeX = -6
        this.bikeT = 14 + Math.random() * 8
      }
    }
    this.room.flame.scale.y = 1 + Math.sin(t * 30) * 0.15

    // The payoff: her dumplings hop into the window, then the stamp.
    if (this.payoffT >= 0) {
      const before = this.payoffT
      this.payoffT += dt
      if (before < 2.2 && this.payoffT >= 2.2) {
        this.fillWindow([...this.windowShown, ...this.made].slice(-10), true)
      }
      if (before < 6.5 && this.payoffT >= 6.5) {
        this.events.done(this.made)
        this.payoffT = -1
        // Then the counter is a toy again.
        this.round = 'play'
        this.def = ROUNDS.play
        this.stage = 'make'
        this.madeInRound = 0
        this.newBasket()
        setTimeout(() => !this.gone && this.nextBall(), 1500)
      }
    }

    this.crumbs.update(dt)
    this.flour.update(dt)
    this.sparkle.update(dt)
    this.soup.update(dt)
    this.updateHint()
  }
  private storyGo = false

  private endStory() {
    if (this.storyDone) return
    this.storyDone = true
    if (this.stage === 'story') this.stage = 'make'
    this.section = 'grandpa'
    this.events.section('grandpa', this.made)
    setTimeout(() => {
      if (this.gone) return
      this.say(this.orderLine())
      if (!this.told.has('squish') && this.piece?.stage === 'ball') this.guide(D.squish)
    }, 300)
  }

  // ---------------------------------------------------------------- her finger

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  private onPlane(x: number, y: number, h: number, out: Vector3) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    this.plane.constant = -h
    return this.raycaster.ray.intersectPlane(this.plane, out)
  }
  /** Screen distance from a finger to a thing's middle, minus its size on screen (≤ 0: on it). */
  private near(x: number, y: number, at: Vector3, r: number) {
    const c = this.toScreen(at)
    const e = this.toScreen(tmp2.copy(at).add(new Vector3(r, 0, 0)))
    const sr = Math.max(26, Math.abs(e.x - c.x))
    return Math.hypot(x - c.x, y - c.y) - sr
  }
  private grabRoom() {
    return Math.min(this.w, this.h) < 500 ? 22 : 30
  }

  pointerDown(x: number, y: number, id?: string) {
    this.counts.touches++
    this.finger = { x, y }
    if (this.stage === 'story') this.endStory()
    const slack = this.grabRoom()
    // Steam puffs pop first (they float over everything).
    for (const p of this.puffs) {
      if (this.near(x, y, p.g.position, 0.07 * p.g.scale.x) < 8) {
        this.popPuff(p)
        return
      }
    }
    // A finger right on the filling bowl takes a meatball (even when a giant wrapper reaches over to it).
    const pc = this.piece
    if (pc && (pc.stage === 'wrapper' || pc.stage === 'filled') && this.near(x, y, tmp.set(...FILLING).setY(0.08), 0.13) < 0) {
      const g = buildBlob(this.bag)
      g.position.set(FILLING[0], 0.12, FILLING[2])
      this.scene.add(g)
      this.grab = { kind: 'blob', g }
      sounds.pickup()
      return
    }
    // The dumpling on the board: squish it, stretch it, fold it, pleat it; a finished one is carried.
    if (pc && (pc.stage === 'ball' || pc.stage === 'wrapper' || pc.stage === 'filled' || pc.stage === 'done')) {
      const c = pc.dough.root.position
      const reach = pc.stage === 'filled' && pc.dough.kind === 'pouch' ? pc.dough.footprint * PLEAT.reach : pc.dough.footprint
      if (this.near(x, y, tmp.set(c.x, c.y + pc.dough.height * 0.4, c.z), reach) < slack) {
        this.touchDough(pc, x, y)
        return
      }
    }
    // The filling bowl: a meatball on her finger.
    if (pc && (pc.stage === 'wrapper' || pc.stage === 'filled') && this.near(x, y, tmp.set(...FILLING).setY(0.08), 0.13) < slack) {
      const g = buildBlob(this.bag)
      g.position.set(FILLING[0], 0.12, FILLING[2])
      this.scene.add(g)
      this.grab = { kind: 'blob', g }
      sounds.pickup()
      return
    }
    // A colored dough ball from its bowl (round 2).
    if (this.def.source === 'bowls' && this.stage === 'make') {
      const i = this.bowlBalls.findIndex((b) => this.near(x, y, b.position, 0.1) < slack)
      if (i >= 0 && (!pc || (pc.stage === 'ball' && pc.dough.flatGoal < 0.3))) {
        const g = solid(P.sphere(0.075, DOUGH_COLORS[BOWL_COLORS[i]], {}, 14), this.bag, 2)
        g.position.copy(this.bowlBalls[i].position)
        this.scene.add(g)
        this.grab = { kind: 'ball', color: BOWL_COLORS[i], g }
        sounds.pickup()
        return
      }
    }
    // The big lump (round 3): pull a piece off it.
    if (this.def.source === 'lump' && this.stage === 'make' && !pc && this.near(x, y, tmp.set(LUMP[0], 0.12, LUMP[2]), 0.26) < slack) {
      const g = solid(P.sphere(BALL_R, DOUGH_COLORS.cream, {}, 16), this.bag, 2)
      g.position.set(LUMP[0], 0.14, LUMP[2])
      g.scale.setScalar(0.6)
      this.scene.add(g)
      this.grab = { kind: 'lump', g, size: 0.6 }
      squish()
      return
    }
    // The lid, onto the steamers.
    if (this.lidState === 'ready' && this.lid && (this.near(x, y, this.lid.position, this.def.basketR) < slack * 2 || this.near(x, y, tmp.set(WOK[0], 0.3, WOK[2]), this.def.basketR) < slack)) {
      this.lidOn()
      return
    }
    // A steamed basket: slide it across to a friend (the top one first).
    if (this.stage === 'serve') {
      const stack = this.baskets.filter((b) => b.state === 'stack')
      const top = stack.reduce<Basket | null>((a, b) => (!a || b.level > a.level ? b : a), null)
      if (top && this.near(x, y, tmp.set(top.x, top.y + BASKET_H / 2, top.z), top.r) < slack * 2) {
        this.grab = { kind: 'basket', basket: top }
        top.state = 'carry'
        sounds.pickup()
        return
      }
    }
    // A finished dumpling sitting in a basket: it giggles (handled in tap).
    void id
  }

  private touchDough(p: Piece, x: number, y: number) {
    const g = this.onPlane(x, y, BOARD.y + p.dough.height * 0.5, tmp)
    const c = p.dough.root.position
    const gx = g ? g.x - c.x : 0
    const gz = g ? g.z - c.z : 0
    this.lastProgress = this.time
    if (p.stage === 'done') {
      // A finished one: a press on a soup dumpling squirts (silly); otherwise she carries it.
      this.grab = { kind: 'carry', piece: p, sx: x, sy: y }
      p.dough.poke(0.8)
      sounds.pickup()
      return
    }
    this.grab = { kind: 'dough', piece: p, gx, gz, sx: x, sy: y, moved: false, lastAngle: null, foldZ: g ? g.z : 0 }
    if (p.stage === 'filled' && p.dough.kind === 'pouch') {
      this.pinch(p, Math.atan2(gz, gx), null)
      return
    }
    if (p.stage === 'filled' && p.dough.kind === 'moon') {
      p.dough.press(gx, gz)
      squish(0.6)
      return
    }
    // Ball or wrapper: a press.
    const wasWrapper = p.dough.wrapper
    p.dough.press(gx, gz)
    this.counts.presses++
    squish()
    if (p.stage === 'ball' && p.dough.wrapper) this.becameWrapper(p)
    if (wasWrapper && p.dough.flatGoal > 1.25 && !this.told.has('pancake')) {
      this.told.add('pancake')
      this.counts.pancakes++
      this.talk(D.pancake)
      this.chef.play('laugh')
    }
  }

  private becameWrapper(p: Piece) {
    p.stage = 'wrapper'
    sounds.sparkle()
    if (!this.told.has('wrapper')) {
      this.told.add('wrapper')
      this.talk(D.wrapper)
      setTimeout(() => !this.gone && this.guide(D.fill), 1400)
    }
  }

  /** Her finger round the rim of a soup dumpling: every pleat it passes is pinched. */
  private pinch(p: Piece, angle: number, last: number | null) {
    const n = p.dough.pleats.length
    const step = (Math.PI * 2) / n
    const angles: number[] = []
    if (last === null) angles.push(angle)
    else {
      let d = Math.atan2(Math.sin(angle - last), Math.cos(angle - last))
      const k = Math.ceil(Math.abs(d) / (step * 0.5))
      for (let i = 1; i <= k; i++) angles.push(last + (d * i) / k)
      d = 0
    }
    for (const a of angles) {
      const k = p.dough.pinchAt(a)
      if (k < 0) continue
      const count = p.dough.pleated
      this.counts.pleats++
      click(count)
      this.lastProgress = this.time
      if (count <= D.count.length) void say(D.count[count - 1])
      if (count >= n) {
        p.dough.twistShut()
        this.finished(p)
        return
      }
    }
  }

  private finished(p: Piece) {
    p.stage = 'done'
    this.grab = null
    sounds.correct()
    const c = p.dough.root.position
    this.sparkle.burst(c.x, c.y + 0.12, c.z, 14, 0.7, 1, 0.035)
    this.chef.play('cheer')
    if (p.dough.kind === 'pouch' && !this.told.has('pleated')) {
      this.told.add('pleated')
      setTimeout(() => !this.gone && this.talk(D.pleated), 700)
    } else if (p.dough.kind === 'moon' && !this.told.has('sealed')) {
      this.told.add('sealed')
      this.talk(D.sealed)
    }
    if (p.code.startsWith('giant') && this.round === 'giant') {
      this.counts.giants++
      setTimeout(() => {
        if (this.gone) return
        this.friends.baobao[0].play('cheer')
        this.talk(D.baoGiant)
      }, 1300)
    }
    if (!this.told.has('basket')) setTimeout(() => !this.gone && this.guide(D.basket), 1800)
  }

  private handleFinger(dt: number) {
    const g = this.grab
    const f = this.finger
    if (!g || !f) return
    if (g.kind === 'dough') {
      const p = g.piece
      const c = p.dough.root.position
      const moved = Math.hypot(f.x - g.sx, f.y - g.sy) > 12
      if (moved) g.moved = true
      const at = this.onPlane(f.x, f.y, BOARD.y + p.dough.height * 0.5, tmp)
      if (!at) return
      const lx = at.x - c.x
      const lz = at.z - c.z
      if (p.stage === 'filled' && p.dough.kind === 'pouch') {
        const a = Math.atan2(lz, lx)
        const r = Math.hypot(lx, lz)
        const fp = p.dough.footprint
        if (r > fp * PLEAT.inner && r < fp * PLEAT.reach) {
          this.pinch(p, a, g.lastAngle)
          if (this.grab === g) g.lastAngle = a
        } else g.lastAngle = null
        return
      }
      if (p.stage === 'filled' && p.dough.kind === 'moon') {
        // Push the near edge over: a drag away from her (up the screen) folds it best, but any drag folds it some.
        const push = Math.max(0, g.foldZ - at.z, 0.7 * Math.hypot(lx - g.gx, lz - g.gz))
        if (g.moved) p.dough.setFold(push / DOUGH.fold)
        return
      }
      if (!g.moved) {
        p.dough.hold(g.gx, g.gz, dt)
        if (p.stage === 'ball' && p.dough.wrapper) this.becameWrapper(p)
      } else {
        p.dough.stretch(g.gx, g.gz, lx - g.gx, lz - g.gz)
      }
      return
    }
    const lift = 0.16
    const at = this.onPlane(f.x, f.y, lift, tmp)
    if (!at) return
    const k = ease(dt, MOVE.follow)
    if (g.kind === 'carry') {
      const r = g.piece.dough.root.position
      r.x += (at.x - r.x) * k
      r.z += (at.z - r.z) * k
      r.y += (lift - r.y) * k
    } else if (g.kind === 'blob' || g.kind === 'ball') {
      g.g.position.x += (at.x - g.g.position.x) * k
      g.g.position.z += (at.z - g.g.position.z) * k
      g.g.position.y += (lift - g.g.position.y) * k
    } else if (g.kind === 'lump') {
      const d = Math.hypot(at.x - LUMP[0], at.z - LUMP[2])
      g.size = clamp(0.6 + (d / MOVE.lump) * 1.3, 0.6, 1.9)
      g.g.scale.setScalar(g.size)
      g.g.position.x += (at.x - g.g.position.x) * k
      g.g.position.z += (at.z - g.g.position.z) * k
      g.g.position.y = BALL_R * g.size + 0.02
      if (Math.random() < dt * 6) squish(0.3)
    }
  }

  pointerMove(x: number, y: number, _downX: number, _downY: number, held: boolean) {
    if (!held) return
    this.finger = { x, y }
  }

  pointerUp() {
    const g = this.grab
    this.grab = null
    const f = this.finger
    this.finger = null
    if (!g) return
    this.lastProgress = this.time
    if (g.kind === 'dough') {
      const p = g.piece
      p.dough.letGo()
      if (g.moved && p.stage === 'ball') {
        this.counts.stretches++
        p.dough.poke(0.8)
        squish(0.5)
      }
      if (p.stage === 'filled' && p.dough.kind === 'moon' && g.moved) {
        if (p.dough.fold > 0.42 || p.dough.foldGoal > 0.45) {
          p.dough.seal()
          this.counts.folds++
          sfx.thump()
          this.finished(p)
        } else p.dough.setFold(0)
      }
      return
    }
    if (g.kind === 'carry') {
      const p = g.piece
      const b = this.current
      const pos = p.dough.root.position
      // A tap (no drag) on a finished dumpling: it hops into the basket by itself.
      const tapped = !f || Math.hypot(f.x - g.sx, f.y - g.sy) < 14
      if (b && tapped) this.toBasket(p)
      else if (b && Math.hypot(pos.x - b.x, pos.z - b.z) < b.r + MOVE.drop) this.toBasket(p)
      else if (b && pos.distanceTo(new Vector3(...WORK)) > 0.35 && pos.x > 0.3) this.toBasket(p)
      else {
        // Back down on the board.
        this.fly(p, pos, new Vector3(...WORK), 0.3, 0.05, () => (p.stage = 'done'))
        sounds.place()
      }
      return
    }
    if (g.kind === 'blob') {
      const p = this.piece
      const pos = g.g.position
      if (p && (p.stage === 'wrapper' || p.stage === 'filled') && Math.hypot(pos.x - p.dough.root.position.x, pos.z - p.dough.root.position.z) < p.dough.footprint + MOVE.drop) {
        g.g.removeFromParent()
        this.addFilling(p)
      } else {
        // Back into the bowl.
        g.g.removeFromParent()
        sounds.place()
      }
      return
    }
    if (g.kind === 'ball') {
      const pos = g.g.position
      g.g.removeFromParent()
      const onBoard = Math.abs(pos.x - BOARD.x) < BOARD.w * 0.7 && Math.abs(pos.z - BOARD.z) < BOARD.d * 0.8
      if (!onBoard && !this.piece) {
        sounds.place()
        return
      }
      this.dropColor(g.color)
      return
    }
    if (g.kind === 'lump') {
      g.g.removeFromParent()
      this.dropLumpPiece(g.size)
      return
    }
    if (g.kind === 'basket') {
      const b = g.basket
      const pos = b.root.position
      // The nearest friend across the counter, if she slid it toward them.
      let best: Exclude<Seat, 'doudou'> | null = null
      let bestD = Infinity
      for (const who of ['grandpa', 'bunnies', 'goose', 'baobao'] as const) {
        if (!this.friends[who][0].root.visible) continue
        if (this.baskets.some((x) => x.state === 'served' && x.order.who === who && x.eaten < x.pieces.length)) continue
        const d = Math.hypot(pos.x - SEATS[who].x, pos.z - SERVE_Z)
        if (d < bestD) {
          bestD = d
          best = who
        }
      }
      if (best && bestD < MOVE.drop + 0.2 && pos.z < -0.05) this.serve(b, best)
      else {
        b.state = 'stack'
        sounds.place()
      }
    }
  }

  private addFilling(p: Piece) {
    if (p.dough.fill >= 2) {
      // Too much: it blorps back out (silly, not wrong).
      this.counts.blorps++
      const c = p.dough.root.position
      this.crumbs.burst(c.x, c.y + 0.06, c.z, 10, 0.6, 1.2, 0.04, 1)
      tone(500, 120, 0.25, 0.12, 'sawtooth')
      this.talk(D.blorp)
      this.chef.play('laugh')
      p.dough.poke(1.5)
      return
    }
    p.dough.addFilling()
    this.counts.fills++
    plop()
    if (p.stage === 'wrapper') {
      p.stage = 'filled'
      setTimeout(() => !this.gone && !this.told.has(p.dough.kind === 'moon' ? 'fold' : 'pleat') && this.guide(p.dough.kind === 'moon' ? D.fold : D.pleat), 500)
    }
  }

  private dropColor(color: DoughColor) {
    const p = this.piece
    if (p && p.stage === 'ball' && p.dough.flatGoal < 0.3 && p.dough.color !== color) {
      // Two colors squashed together: a swirly one.
      p.dough.setColor(p.dough.color, color)
      p.code = `swirl-${p.dough.color}`
      p.dough.poke(1.4)
      this.counts.swirls++
      sounds.sparkle()
      this.friends.bunnies.forEach((b) => b.play('cheer'))
      return
    }
    if (p) return
    const np = this.makePiece(color, this.kindFor(this.madeInRound))
    np.dough.root.position.set(WORK[0], 0.2, WORK[2])
    this.fly(np, np.dough.root.position, new Vector3(...WORK), 0.25, 0.05, () => {
      np.stage = 'ball'
      np.dough.poke(1)
      squish()
      if (!this.told.has('squish')) this.guide(D.squish)
    })
    np.stage = 'arrive'
    this.piece = np
  }

  private dropLumpPiece(size: number) {
    if (this.piece) return
    const np = this.makePiece(this.defaultColor(this.madeInRound), this.kindFor(this.madeInRound), size)
    np.dough.root.position.set(WORK[0] - 0.2, 0.2, WORK[2])
    np.stage = 'arrive'
    this.piece = np
    this.fly(np, np.dough.root.position, new Vector3(...WORK), 0.3, 0.1, () => {
      np.stage = 'ball'
      np.dough.poke(1.2)
      sfx.boing()
      if (size > 1.6) this.friends.baobao[0].play('hop')
    })
  }

  private popPuff(p: Puff) {
    p.age = p.life
    this.counts.popped++
    sfx.pop()
    this.sparkle.burst(p.g.position.x, p.g.position.y, p.g.position.z, 5, 0.5, 0.4, 0.03, 2)
  }

  private eatOne(b: Basket) {
    const who = b.order.who
    const fs = this.friends[who]
    const p = b.pieces[b.eaten]
    if (!p) return
    const f = fs[b.eaten % fs.length]
    f.play('eat')
    const mouth = f.mouth(new Vector3())
    this.fly(p, p.dough.root.position, mouth, 0.45, 0.12, () => {
      p.dough.root.visible = false
      chomp()
      setTimeout(chomp, 140)
      this.crumbs.burst(mouth.x, mouth.y, mouth.z + 0.05, 6, 0.4, 0.6, 0.025)
    })
    b.eaten++
    b.eatT = 0.75
    if (b.eaten >= b.pieces.length) {
      b.eatT = -1
      setTimeout(() => {
        if (this.gone) return
        fs.forEach((x) => x.play('cheer'))
        const mix = b.planned !== who
        if (mix) this.counts.mixups++
        this.talk(mix ? D.notMine[who] : D.yum[who])
        sounds.correct()
        if (this.baskets.every((x) => x.state === 'served' && x.eaten >= x.pieces.length)) setTimeout(() => this.roundDone(), 1600)
      }, 700)
    }
  }

  // ---------------------------------------------------------------- Hou Hou

  private monkeySneak() {
    if (this.gone || this.houDone) return
    const b = this.baskets.find((x) => x.state === 'stack' && x.pieces.length)
    if (!b) return
    const p = b.pieces[b.pieces.length - 1]
    this.houPiece = p
    this.houT = 0
    this.counts.sneaks++
    this.houhou.arrive()
    this.houhou.root.position.set(WOK[0] + 0.55, -0.62, WOK[2] - 0.45)
    this.houhou.root.rotation.y = -0.6
    this.houhou.yaw = -0.6
    this.guide(D.sneak)
  }
  private updateMonkey(dt: number) {
    const h = this.houhou
    if (this.houT >= 0) {
      this.houT += dt
      const t = this.houT
      // Up from behind the wok, grabs it, holds it over his head and giggles.
      h.root.position.y += (-0.05 - h.root.position.y) * ease(dt, 4)
      const p = this.houPiece
      if (p && t > 0.8) {
        const hand = h.rig.armR.getWorldPosition(tmp)
        p.dough.root.position.lerp(tmp2.set(hand.x, hand.y + 0.28, hand.z), ease(dt, 8))
        if (Math.random() < dt * 1.2) h.play('giggle')
      }
      // He gives it back by himself after a while (no "oops": just sheepish).
      if (t > 9) this.monkeySorry()
    }
    h.update(dt)
  }
  private monkeySorry() {
    const p = this.houPiece
    if (!p || !p.basket) return
    this.houPiece = null
    this.houT = -1
    this.houDone = true
    this.houhou.play('hop')
    this.talk(D.sorry)
    const b = p.basket
    const i = b.pieces.indexOf(p)
    this.fly(p, p.dough.root.position, this.slot(b, i, Math.max(b.order.n, b.pieces.length)), 0.5, 0.25, () => (p.stage = 'basket'))
    setTimeout(() => {
      if (this.gone) return
      this.houhou.hide()
    }, 1800)
  }

  // ---------------------------------------------------------------- taps

  tap(x: number, y: number, id?: string) {
    this.lastProgress = Math.max(this.lastProgress, this.time - HINT_S + 3)
    // A tap-alternative for every drag: tap the filling bowl (a scoop hops on), a color bowl, the lump, a finished
    // dumpling (it hops into the basket), the top basket (it slides to its friend).
    const pc = this.piece
    if (!id) {
      if (pc && (pc.stage === 'wrapper' || pc.stage === 'filled') && this.near(x, y, tmp.set(...FILLING).setY(0.08), 0.13) < this.grabRoom()) {
        this.addFilling(pc)
        return
      }
      if (this.def.source === 'bowls' && this.stage === 'make') {
        const i = this.bowlBalls.findIndex((b) => this.near(x, y, b.position, 0.1) < this.grabRoom())
        if (i >= 0) return this.dropColor(BOWL_COLORS[i])
      }
      if (this.def.source === 'lump' && !pc && this.stage === 'make' && this.near(x, y, tmp.set(LUMP[0], 0.12, LUMP[2]), 0.26) < this.grabRoom()) return this.dropLumpPiece(1.2)
      if (pc && pc.stage === 'done' && this.current) return this.toBasket(pc)
      if (this.stage === 'serve') {
        const top = this.baskets.filter((b) => b.state === 'stack').reduce<Basket | null>((a, b) => (!a || b.level > a.level ? b : a), null)
        if (top && this.near(x, y, tmp.set(top.x, top.y + BASKET_H / 2, top.z), top.r) < this.grabRoom() * 2) return this.serve(top, this.friendFor(top))
      }
      // Two taps on the bare counter after the tea: thank you.
      if (t3(this.time - this.teaT)) {
        knock()
        this.knocks++
        if (this.knocks === 2) {
          this.guide(D.knock)
          this.talk(D.xiexie)
          this.doudou.play('cheer')
        }
      }
      // A dumpling in a basket giggles.
      for (const p of this.pieces) {
        if (p.stage !== 'basket' || !p.dough.root.visible) continue
        if (this.near(x, y, p.dough.root.position, p.dough.footprint * p.dough.root.scale.x) < 6) {
          p.giggle = 0.6
          p.dough.poke(1)
          tone(900, 1300, 0.12, 0.05, 'triangle')
          return
        }
      }
      return
    }
    this.counts.pokes++
    const tickle = (f: Friend, lines: Line[]) => {
      f.play(Math.random() < 0.5 ? 'hop' : 'giggle')
      if (this.talker !== f || Math.random() < 0.6) this.talk(lines[this.counts.pokes % lines.length])
      this.talker = f
    }
    switch (id) {
      case 'cheffu':
        this.chef.play('laugh')
        this.talk(D.tickle.cheffu[this.counts.pokes % 2])
        return
      case 'doudou':
        return tickle(this.doudou, D.tickle.doudou)
      case 'grandpa':
        return tickle(this.friends.grandpa[0], D.tickle.grandpa)
      case 'bunnies':
        this.friends.bunnies.forEach((b) => b.play('hop'))
        this.talk(D.tickle.bunnies[this.counts.pokes % 2])
        return
      case 'goose':
        return tickle(this.friends.goose[0], D.tickle.goose)
      case 'baobao':
        return tickle(this.friends.baobao[0], D.tickle.baobao)
      case 'houhou':
        if (this.houPiece) this.monkeySorry()
        else tickle(this.houhou, D.tickle.houhou)
        return
      case 'teapot':
        this.teapotTip = 1.6
        this.teaT = this.time
        this.knocks = 0
        this.doudou.play('nod')
        noise(0.9, 0.04, 'bandpass', 1800, 900, 0.2)
        this.talk(D.teaPour)
        return
      case 'lantern0':
      case 'lantern1':
      case 'lantern2': {
        const i = Number(id.slice(-1))
        this.lanternV[i] += 2.2
        tone(1200 + i * 200, 1600 + i * 200, 0.3, 0.04, 'sine')
        return
      }
      case 'fish':
        this.fishSpin = 1.4
        sfx.splash()
        return
      case 'flour':
        this.flourPuff = 1
        this.flour.burst(FLOUR[0], 0.35, FLOUR[2], 18, 0.5, 0.6, 0.05)
        this.flour.burst(this.chef.root.position.x + 0.1, 0.45, this.chef.root.position.z + 0.1, 16, 0.3, 0.4, 0.06)
        this.chef.play('sneeze')
        setTimeout(() => !this.gone && sounds.whoosh(), 800)
        this.talk(D.floury)
        return
      case 'chopsticks':
        this.chopJump = 0.8
        ;[0, 0.12, 0.24].forEach((d) => tone(2200, 2000, 0.05, 0.05, 'square', d))
        return
      case 'bell':
        this.bellV += 6
        ding()
        return
      case 'pearl':
        this.pearlGlow = 1.2
        sounds.sparkle()
        if (!this.told.has('pearl')) this.guide(D.pearl)
        return
      case 'cat':
        this.catStretch = 1
        tone(700, 500, 0.4, 0.05, 'sine')
        return
      case 'bike':
        ;[0, 0.15].forEach((d) => tone(2400, 2400, 0.12, 0.05, 'sine', d))
        return
    }
  }
  private friendFor(b: Basket) {
    return b.order.who
  }

  // ---------------------------------------------------------------- hints

  private updateHint() {
    const kind = this.stuckOn()
    const stuck = kind && this.time - this.lastProgress > HINT_S && !this.grab
    if (stuck && this.hintFor !== kind) {
      this.hintFor = kind
      const l = D.hint[kind]
      this.events.guide(l, spendHint(l))
    }
    if (!stuck) this.hintFor = ''
    const el = this.hintEl
    if (!el) return
    const at = stuck ? this.hintSpot(kind) : null
    if (!at) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const s = this.toScreen(at.from)
    const e = at.to ? this.toScreen(at.to) : s
    el.style.display = ''
    el.dataset.kind = at.to ? 'drag' : 'press'
    el.style.transform = `translate3d(${s.x.toFixed(0)}px, ${s.y.toFixed(0)}px, 0)`
    el.style.setProperty('--dx', `${(e.x - s.x).toFixed(0)}px`)
    el.style.setProperty('--dy', `${(e.y - s.y).toFixed(0)}px`)
  }
  private stuckOn(): HintKind | null {
    if (this.stage === 'story' || this.stage === 'payoff' || this.stage === 'between' || this.stage === 'eat') return null
    if (this.houPiece) return 'houhou'
    if (this.stage === 'lid') return 'lid'
    if (this.stage === 'serve') return 'serve'
    if (this.stage !== 'make') return null
    const p = this.piece
    if (!p) return this.def.source === 'bowls' ? 'color' : this.def.source === 'lump' ? 'pull' : null
    if (p.stage === 'ball') return 'squish'
    if (p.stage === 'wrapper') return 'fill'
    if (p.stage === 'filled') return p.dough.kind === 'moon' ? 'fold' : 'pleat'
    if (p.stage === 'done') return 'basket'
    return null
  }
  private hintSpot(k: HintKind): { from: Vector3; to?: Vector3 } | null {
    const p = this.piece
    const c = p ? p.dough.root.position.clone() : new Vector3(...WORK)
    switch (k) {
      case 'squish':
        return { from: c.clone().setY(0.1) }
      case 'fill':
        return { from: new Vector3(...FILLING).setY(0.1), to: c.clone().setY(0.05) }
      case 'fold':
        return { from: c.clone().add(new Vector3(0, 0.02, p ? p.dough.footprint * 0.7 : 0.1)), to: c.clone().add(new Vector3(0, 0.02, -0.12)) }
      case 'pleat':
        return { from: c.clone().add(new Vector3(p ? p.dough.footprint : 0.15, 0.03, 0)), to: c.clone().add(new Vector3(0, 0.03, p ? p.dough.footprint : 0.15)) }
      case 'basket':
        return { from: c.clone().setY(0.08), to: new Vector3(WOK[0], 0.3, WOK[2]) }
      case 'lid':
        return this.lid ? { from: this.lid.position.clone() } : null
      case 'serve': {
        const top = this.baskets.filter((b) => b.state === 'stack').reduce<Basket | null>((a, b) => (!a || b.level > a.level ? b : a), null)
        return top ? { from: new Vector3(top.x, top.y + 0.1, top.z), to: new Vector3(SEATS[top.order.who].x, 0.05, SERVE_Z) } : null
      }
      case 'color':
        return { from: this.bowlBalls[0]?.position.clone() ?? c, to: new Vector3(...WORK) }
      case 'pull':
        return { from: new Vector3(LUMP[0], 0.12, LUMP[2]), to: new Vector3(...WORK) }
      case 'houhou':
        return { from: this.houhou.root.position.clone().setY(0.25) }
    }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, at: Vector3 | null, height: number, scale = 1.2) => {
      let spot: { x: number; y: number; size: number } | null = null
      if (at) {
        const c = this.toScreen(tmp.copy(at).setY(at.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(at).setY(at.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.22, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const head = (f: Friend) => (f.root.visible ? f.rig.head.getWorldPosition(new Vector3()).add(new Vector3(0, -0.15, 0)) : null)
    for (const [id, el] of this.anchorEls) {
      // While she's carrying something, the friends' targets get out of the way (the drop goes by distance).
      if (id === 'cheffu') place(el, head(this.chef), 0.4, 1)
      else if (id === 'doudou') place(el, head(this.doudou), 0.35, 1)
      else if (id === 'grandpa' || id === 'goose' || id === 'baobao' || id === 'bunnies') {
        const fs = this.friends[id]
        const h = fs.length > 1 && fs[0].root.visible ? fs[0].rig.head.getWorldPosition(new Vector3()).lerp(fs[1].rig.head.getWorldPosition(new Vector3()), 0.5).add(new Vector3(0, -0.1, 0)) : head(fs[0])
        place(el, h && this.grab?.kind !== 'basket' ? h : null, 0.3, 1)
      } else if (id === 'houhou') place(el, this.houhou.root.visible ? this.houhou.rig.head.getWorldPosition(new Vector3()).add(new Vector3(0, -0.25, 0)) : null, 0.4, 1.3)
      else if (id === 'teapot') place(el, new Vector3(...TEAPOT), 0.26, 1.2)
      else if (id.startsWith('lantern')) place(el, new Vector3(...LANTERNS[Number(id.slice(-1))]).add(new Vector3(0, -0.38, 0)), 0.4, 1)
      else if (id === 'fish') place(el, new Vector3(...FISH), 0.32, 1)
      else if (id === 'flour') place(el, new Vector3(...FLOUR), 0.32, 1)
      else if (id === 'chopsticks') place(el, new Vector3(...CHOPSTICKS), 0.34, 1)
      else if (id === 'bell') place(el, new Vector3(...BELL).add(new Vector3(0, -0.2, 0)), 0.25, 1.2)
      else if (id === 'pearl') place(el, this.room.pearl.getWorldPosition(new Vector3()).add(new Vector3(0, 1.4, 0)), 2.5, 0.5)
      else if (id === 'cat') place(el, this.room.cat.getWorldPosition(new Vector3()), 0.2, 1.5)
      else if (id === 'bike') place(el, this.bikeT <= 0 && Math.abs(this.bikeX) < 3.5 ? this.room.bike.getWorldPosition(new Vector3()) : null, 0.9, 0.8)
      el.style.zIndex = id === 'pearl' || id === 'cat' || id === 'bike' ? '0' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const scr = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    const p = this.piece
    const top = this.baskets.filter((b) => b.state === 'stack').reduce<Basket | null>((a, b) => (!a || b.level > a.level ? b : a), null)
    return {
      section: this.section,
      round: this.round,
      stage: this.stage,
      piece: p ? { stage: p.stage, kind: p.dough.kind, flat: +p.dough.flatGoal.toFixed(2), fill: p.dough.fill, fold: +p.dough.fold.toFixed(2), pleats: p.dough.pleated, of: p.dough.pleats.length, r: +p.dough.footprint.toFixed(3), ...scr(p.dough.root.position.clone().setY(p.dough.height * 0.4)) } : null,
      filling: scr(new Vector3(...FILLING).setY(0.08)),
      wok: scr(new Vector3(WOK[0], 0.3, WOK[2])),
      lid: this.lid && this.lidState === 'ready' ? scr(this.lid.position) : null,
      top: top ? scr(new Vector3(top.x, top.y + BASKET_H / 2, top.z)) : null,
      seats: Object.fromEntries((['grandpa', 'bunnies', 'goose', 'baobao'] as const).map((s) => [s, scr(new Vector3(SEATS[s].x, 0.02, SERVE_Z))])),
      bowls: this.bowlBalls.map((b) => scr(b.position)),
      lump: this.def.source === 'lump' ? scr(new Vector3(LUMP[0], 0.12, LUMP[2])) : null,
      work: scr(new Vector3(...WORK)),
      puffs: this.puffs.map((q) => scr(q.g.position)),
      monkey: !!this.houPiece,
      made: this.made,
      baskets: this.baskets.map((b) => `${b.order.who}:${b.pieces.length}/${b.order.n}:${b.state}`),
      ...this.counts,
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

const t3 = (dt: number) => dt > 0 && dt < 5
