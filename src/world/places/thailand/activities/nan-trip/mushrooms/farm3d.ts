// Baan Huanam Mushroom Farm (plan: planning/around-the-world/thailand/nan-trip.html, "2. Baan Huanam Mushroom Farm"),
// in the toon look, with voices. Two places in one world: the cozy, dim mushroom house (the camera low in the aisle,
// looking at the rack of sawdust bags; warm light through the plank walls) and the farm's table outside, 8 m along, on a
// deck over the cool green mountains, where the camera glides for lunch.
//
// The toy, the misting hose: her finger held anywhere on the rack sprays a soft mist there (Kaylee holds the hose, its
// wand points where she sprays, a little rainbow shows in the mist). Every bag the mist reaches drinks; a thirsty bag
// pops a tiny pin mushroom out of its mouth, and as it drinks more the pin swells into a clump of frilly fans. A tap is
// a short puff of mist, so taps alone grow them too.
//   1. Mist: twelve bags, grey oyster mushrooms pop and swell. The last thirsty bags glow so she finds them. All grown:
//      a run of bells, the farmer aunty hops.
//   2. Pick: grown clumps wiggle. Grab one and pull: it stretches and twists, then pops off and follows her finger; let
//      go and it flies into her basket (a tap picks one too). Mist a bag she picked and it grows again. Keep spraying a
//      grown one and it swells enormous and bouncy (a tap boings it). Six in the basket ends the round.
//   3. Pink and gold: the aunty swaps the bags; new ones with pink and gold collars grow pink and golden mushrooms. Six
//      more and they all go to lunch: the camera glides out to the table, Kaylee and Daddy hop onto their stools.
//   pizza (the side verb): her basket sits by the pizza. Drag a mushroom onto the pizza and it stays where she puts it
//      (a tap on the basket or the pizza puts the next one on for her). Basket empty: the oven glows; tap it and the
//      aunty slides the pizza in, the fire roars, ding, out it comes golden. Tap the pizza and a slice (with the
//      mushrooms she put on it) hops to the next plate, round the table; tap a plate and they munch. All six shared:
//      the end card.
// Silly instead of wrong: mist Daddy and a mushroom grows on his head (it gets bigger the more she sprays); mist the
// dog and she wakes and shakes; the giant mushroom. Things to poke: the aunty, the gecko, the dog, the drip, the sign,
// the basket, the view, Kaylee and Daddy (and Mommy at the table).
// Ambient life: the gecko scuttles now and then, the dog snores a bubble, the roof drips, two moths circle the bulb,
// the low cloud drifts along the valley, the flower on the table nods.
// Talk (lines.ts L.nan.mushrooms): the farmer aunty says hello as she arrives, then Sparkle says each round's one line
// as it begins and, after ~8 s with nothing done (counted from 3 s after the round's start), what to do; the aunty,
// Daddy and Mommy react, each thing once (a reaction is dropped while Sparkle talks rather than heard late); tapping
// the aunty or Daddy says their lines in turn; the sign tells a fact.
import { CatmullRomCurve3, Color, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, OctahedronGeometry, Plane, TubeGeometry, Vector3, type BufferGeometry, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, speakingVoice, type Line } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { FaceLife } from '../../../characters/face'
import { L } from '../../../lines'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { buildHouse, buildTable, ovenGlow, type House, type Table } from './farm'
import { Floaters } from './fx'
import {
  BAGS,
  BULB,
  BURST_S,
  COLORS,
  DOG,
  DRIP,
  DRIPS,
  EATER_NAMES,
  EATERS,
  FARMER_AT,
  FARMER_TABLE,
  formatBasket,
  GECKO,
  GIANT,
  HOUSE_BASKET,
  KAYLEE_AT,
  MIST_R,
  MIST_RATE,
  MOUTH_Z,
  NICK_AT,
  OVEN,
  OVEN_MOUTH,
  parseBasket,
  PICKS,
  PIN_AT,
  PIZZA,
  PLATE_Z,
  ROUND3_KINDS,
  SEAT_Z,
  SEATS,
  SIGN,
  SLICES,
  TABLE,
  TABLE_BASKET,
  TALL,
  TX,
  basketSize,
  type BagKind,
  type Basket,
  type EaterId,
  type Round,
  type ShroomColor,
} from './layout'
import { buildBasket, collar, heapSpot, ShroomKit } from './shroom'
import { shroomSfx as sfx } from './sounds'

export interface FarmEvents extends LegEvents {
  /** A new round began (the address bar follows). */
  round(r: Round, basket: string): void
  /** What's in her basket changed. */
  basket(s: string): void
  /** Every slice is shared: the end card. */
  allDone(): void
}

export const FARM_ANCHORS: AnchorInfo[] = [
  ...BAGS.map((_, i): AnchorInfo => ({ id: `bag:${i}`, label: `Mushroom bag ${i + 1}`, kind: 'thing' })),
  { id: 'basket', label: 'Basket', kind: 'thing' },
  { id: 'farmer', label: 'Farmer aunty', kind: 'thing' },
  { id: 'gecko', label: 'Gecko', kind: 'thing' },
  { id: 'dog', label: 'Sleepy dog', kind: 'thing' },
  { id: 'drip', label: 'Drip', kind: 'thing' },
  { id: 'sign', label: 'Mushroom sign', kind: 'thing' },
  { id: 'pizza', label: 'Mushroom pizza', kind: 'thing' },
  { id: 'tbasket', label: 'Basket of mushrooms', kind: 'thing' },
  { id: 'oven', label: 'Oven', kind: 'thing' },
  ...EATERS.map((e): AnchorInfo => ({ id: `plate:${e}`, label: `${EATER_NAMES[e]}'s plate`, kind: 'thing' })),
  { id: 'view', label: 'Rice fields', kind: 'thing' },
  ...(['kaylee', 'nick', 'ji'] as const).map((e): AnchorInfo => ({ id: `family:${e}`, label: EATER_NAMES[e], kind: 'family' })),
]

type Phase = 'house' | 'walk' | 'table'

interface BagState {
  i: number
  at: Vector3
  kind: BagKind
  water: number
  /** pin: popped out; grown: ready to pick. */
  stage: 'none' | 'pin' | 'grown'
  clump: Group
  color: ShroomColor
  /** The clump's size now (it eases toward what the water says). */
  size: number
  /** 0..1 animations (1 = at rest): the pop when a pin comes out, a boing on the giant one. */
  pop: number
  boing: number
  bounces: number
  giant: boolean
  collar: Group
  /** Being pulled off (0..1 of the way to popping off). */
  pull: number
}

interface Item {
  color: ShroomColor
  root: Group
  where: 'basket' | 'held' | 'fly' | 'pizza'
}

interface Wedge {
  i: number
  root: Group
  cheese: Mesh
  crust: Mesh
  where: 'pizza' | 'fly' | 'plate'
  owner: EaterId | null
  bites: number
}

interface Fly {
  o: Object3D
  from: Vector3
  to: () => Vector3
  s0: number
  s1: number
  t: number
  dur: number
  arc: number
  /** Turns (about y) from r0 to r1 on the way. */
  r0?: number
  r1?: number
  done: () => void
}

const STUCK_S = 5
/** Nothing done for this long: Sparkle says what to do (again after SAY_EVERY, at most SAY_MAX times a round). */
const SAY_S = 8
const SAY_EVERY = 20
const SAY_MAX = 3
const M = L.nan.mushrooms
/** The light: warm and dim in the house, cool and bright on the deck. */
const LIGHT = { house: { sun: new Color('#F2D2B4'), amb: new Color('#E6D4E2'), sky: new Color('#4E3833') }, table: { sun: new Color('#F6FAFF'), amb: new Color('#FFF7F0'), sky: new Color('#D6E6EE') } }
/** A mushroom's size on the pizza (and in her hand over it). */
const ON_PIZZA = 0.95
const LIFT_PX = 34
/** A held finger that doesn't pull for this long turns the grab into misting (so she can mist a grown one giant). */
const HOLD_TO_MIST = 0.45
const PULL_PX = 62
const CRUST = '#F2C27B'
const CRUST_BAKED = '#E3A15A'
const CHEESE = '#FFF3C4'
const CHEESE_BAKED = '#FFD45C'
const A = Math.PI / SLICES
const MID = (2 * PIZZA.r * Math.sin(A)) / (3 * A)
const ORDER: EaterId[] = ['kaylee', 'ji', 'nick', 'kaylee', 'ji', 'nick']

const tmp = new Vector3()
const tmp2 = new Vector3()
const right = new Vector3()
const wallPlane = new Plane(new Vector3(0, 0, 1), -MOUTH_Z)

const shroomOf = (k: BagKind): ShroomColor => (k === 'plain' ? 'grey' : k)

/** A wedge [-A, A] around +z, flat, its middle at the origin (the tip toward -z). */
function wedgeGeo(r: number, depth: number, y: number, color: string): BufferGeometry {
  const pts: [number, number][] = [[0, 0]]
  for (let k = 0; k <= 8; k++) {
    const f = -A + (2 * A * k) / 8
    pts.push([r * Math.sin(f), -r * Math.cos(f)])
  }
  return P.prism(pts, depth, color, { at: [0, y, -MID], rot: [-Math.PI / 2, 0, 0] })
}

/** Repaints a toy shape's baked vertex colors (the cheese turning golden in the oven). */
function recolor(m: Mesh, hex: string) {
  const c = new Color(hex)
  const attr = m.geometry.getAttribute('color')
  for (let i = 0; i < attr.count; i++) attr.setXYZ(i, c.r, c.g, c.b)
  attr.needsUpdate = true
}

export class MushroomFarm extends Stage {
  private house: House
  private table: Table
  private kit: ShroomKit
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private farmerLife: FaceLife
  private phase: Phase
  private round: Round
  private bags: BagState[] = []
  private picks = 0
  private basket: Basket
  private houseBasket: { root: Group; rim: number; r: number }
  private houseItems: Group[] = []
  private tableBasket: { root: Group; rim: number; r: number }
  private items: Item[] = []
  private pie = new Group()
  private wedges: Wedge[] = []
  private flights: Fly[] = []
  private later: { t: number; f: () => void }[] = []
  // ---- Misting ----
  private spray = { on: false, until: -1, x: 0, y: 0, k: 0, hiss: 0 }
  private pressT = 0
  private aim = new Vector3(0, 0.9, MOUTH_Z)
  private wandAt = new Vector3()
  private hose: Mesh
  private rainbow: Mesh
  private mist: Floaters
  private drops: Floaters
  private sparkles: Floaters
  private crumbs: Floaters
  private steam: Floaters
  private pops = 0
  // ---- Picking ----
  private grab: { i: number; x0: number; y0: number; x: number; y: number; t0: number; moved: boolean; detached: boolean } | null = null
  private carried: { i: number; o: Group } | null = null
  // ---- The pizza ----
  private held: { it: Item; x0: number; y0: number; x: number; y: number; moved: boolean } | null = null
  private baked = false
  private bake: { t: number } | null = null
  private served = 0
  private doneSaid = false
  // ---- Silly and pokes ----
  private hat: Group
  private hatK = 0
  private hatShown = 0
  private daddyWet = 0
  private dogWake = 1
  private farmerHop = 1
  private geckoRun: { from: Vector3; to: Vector3; t: number } | null = null
  private signSpin = 1
  private dropT = 2
  private basketBounce = 1
  private cloudT = 0
  private plateBounce = new Map<EaterId, number>()
  private cool = new Map<string, number>()
  // ---- Ambient life ----
  private moths: { root: Group; wings: Group[]; phase: number }[] = []
  private drips: { o: Group; at: Vector3; t: number; period: number }[] = []
  private geckoNext = 6
  private snore = 0
  // ---- Talk: lines said once, Sparkle's hints this round, the aunty's and Daddy's tap lines in turn ----
  private told = new Set<string>()
  private lastSay = -99
  /** Sparkle's hints count quiet time from here (a round's start and its line), not from her last touch. */
  private quietFrom = 0
  private sayN = 0
  private farmerTap = 0
  private nickTap = 0

  constructor(renderer: WebGLRenderer, private ev: FarmEvents, start: { round: Round; basket: string }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color('#DCD6E8')
    this.rig.fov = 32
    this.rig.lag = 0.45
    this.kit = new ShroomKit(bag)
    this.house = buildHouse(bag)
    scene.add(this.house.root)
    this.table = buildTable(bag)
    scene.add(this.table.root)
    this.farmerLife = new FaceLife(this.house.farmer)
    // ---- The family: Kaylee and Daddy in the house, Mommy waiting at the table ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    for (const c of [kaylee, this.nick, this.ji]) scene.add(c.root)
    this.put(this.ji, SEATS.ji.x, SEATS.ji.seat, SEAT_Z, 'sit', 0)
    // Daddy's mushroom hat (it grows when she mists him).
    this.hat = this.kit.one('grey')
    const r = this.nick.rig
    this.hat.position.set(0, r.face.headY + r.face.R * 0.78, 0)
    this.hat.scale.setScalar(0.001)
    this.hat.visible = false
    r.head.add(this.hat)
    // ---- The bags and their clumps ----
    this.round = start.round
    const kinds: BagKind[] = start.round === '3' ? ROUND3_KINDS : BAGS.map(() => 'plain')
    BAGS.forEach((m, i) => {
      const kind = kinds[i]
      const color = shroomOf(kind)
      const clump = this.newClump(i, color)
      const ring = collar(kind, bag)
      ring.position.set(m[0], m[1], m[2] + 0.004)
      scene.add(ring)
      this.bags.push({ i, at: new Vector3(...m), kind, water: 0, stage: 'none', clump, color, size: 0, pop: 1, boing: 1, bounces: 0, giant: false, collar: ring, pull: 0 })
    })
    // ---- Her basket, in the house and at the table ----
    this.houseBasket = buildBasket(bag)
    this.houseBasket.root.position.set(...HOUSE_BASKET)
    scene.add(this.houseBasket.root)
    this.tableBasket = buildBasket(bag, 0.16, 0.15)
    this.tableBasket.root.position.set(...TABLE_BASKET)
    scene.add(this.tableBasket.root)
    this.basket = parseBasket(start.basket)
    // ---- The hose, the rainbow and the effects ----
    this.hose = new Mesh(new TubeGeometry(new CatmullRomCurve3([new Vector3(), new Vector3(0, 0.1, 0)]), 4, 0.018, 6), toon('#4DB57A'))
    scene.add(this.hose)
    const bow = merge(['#FF8FB8', '#FFE27A', '#8FE3C8', '#A8DCFF'].map((c, k) => P.torus(0.2 - k * 0.022, 0.011, c, {}, Math.PI)))
    this.rainbow = new Mesh(bag.add(bow), bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false })))
    this.rainbow.renderOrder = 3
    scene.add(this.rainbow)
    this.mist = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#EEF6FF'], 200, bag, 0.35, 2.2, 0.5, 1.8)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#BFE6FF', '#E3F3FF'], 50, bag, 6, 0.2)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 90, bag, 1.0, 1.2)
    this.crumbs = new Floaters(new IcosahedronGeometry(0.5, 0), ['#F2C27B', '#FFE27A', '#E5A457'], 50, bag, 5, 0.5)
    this.steam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF'], 50, bag, -0.4, 1.2, 0.55, 2)
    for (const f of [this.mist, this.drops, this.sparkles, this.crumbs, this.steam]) scene.add(f.mesh)
    // ---- The pizza ----
    this.pie.position.set(PIZZA.x, PIZZA.y, PIZZA.z)
    scene.add(this.pie)
    for (let i = 0; i < SLICES; i++) this.wedges.push(this.buildWedge(i))
    // ---- Ambient life: moths round the bulb, more drips from the roof ----
    for (let k = 0; k < 2; k++) {
      const root = new Group()
      root.add(solid(merge([P.capsule(0.012, 0.03, '#CFC3E6', { rot: [Math.PI / 2, 0, 0] }), ...[-1, 1].map((sx) => P.sphere(0.006, PAL.ink, { at: [sx * 0.008, 0.006, 0.025] }, 5))]), bag, 1))
      const wings = [-1, 1].map((sx) => {
        const w = new Group()
        w.add(solid(P.sphere(0.04, k ? '#F4EEFF' : '#FFF1DC', { at: [sx * 0.035, 0, 0], scale: [1, 0.12, 0.8] }, 8), bag, 1))
        root.add(w)
        return w
      })
      scene.add(root)
      this.moths.push({ root, wings, phase: k * 2.4 })
    }
    for (const [k, d] of DRIPS.entries()) {
      const o = solid(P.sphere(0.03, '#BFE6FF', { scale: [1, 1.35, 1] }, 10), bag, 1)
      o.position.set(...d)
      scene.add(o)
      this.drips.push({ o, at: new Vector3(...d), t: k * 1.1, period: 3.1 + k * 0.7 })
    }
    // ---- Where the link starts ----
    if (start.round === 'pizza') {
      this.phase = 'table'
      this.seatAll(true)
      this.fillTableBasket()
    } else {
      this.phase = 'house'
      this.put(kaylee, ...KAYLEE_AT, 'stand', 120)
      this.put(this.nick, ...NICK_AT, 'stand', -60)
      this.fillHouseBasket()
      if (start.round === '2') for (const b of this.bags) this.grow(b, 1.02, true)
    }
    this.wandAt.copy(this.handAt())
    this.light(true)
    this.roundLine(start.round, true)
  }

  // ---------------------------------------------------------------- talk

  /** The round's line as it begins (Sparkle), with the aunty's hello first when she arrives. */
  private roundLine(r: Round, arriving = false) {
    this.sayN = 0
    this.lastSay = -99
    this.quietFrom = this.time + 3
    const d = arriving ? 0.5 : 0.3
    if (r === '1') this.after(0.4, () => this.once('hi', M.hi))
    const l: Record<Round, Line> = { '1': M.mist, '2': M.pick, '3': M.colors, pizza: M.pizza }
    this.after(r === '1' ? 0.6 : r === 'pizza' && !arriving ? 1.5 : d, () => this.once(r, l[r]))
  }
  /** Says it the first time only. A reaction (`now`) is dropped while Sparkle talks, rather than heard late. */
  private once(key: string, l: Line, now = false) {
    if (this.told.has(key)) return
    if (now && speakingVoice() === 'sparkle') return
    this.told.add(key)
    this.ev.say(l)
  }
  /** A tap line in turn (not while Sparkle talks: it would come late). False when nothing was said. */
  private inTurn(key: string, lines: readonly Line[], n: number) {
    if (speakingVoice() === 'sparkle' || this.time - (this.cool.get(key) ?? -99) < 3) return false
    this.cool.set(key, this.time)
    this.ev.say(lines[n % lines.length])
    return true
  }

  /** After a while with nothing done, Sparkle says what to do (a few times a round at most). */
  private stuck() {
    if (this.grab || this.carried || this.held || this.bake || this.flights.length || this.phase === 'walk' || this.spray.on || this.time < this.spray.until) return
    if (this.time - Math.max(this.lastTouch, this.quietFrom) < SAY_S || this.time - this.lastSay < SAY_EVERY || this.sayN >= SAY_MAX) return
    const l = this.stuckLine()
    if (!l || speakingVoice()) return
    this.lastSay = this.time
    this.sayN++
    this.ev.say(l)
  }
  private stuckLine(): Line | null {
    if (this.phase === 'house') return this.round !== '1' && this.bags.some((b) => b.stage === 'grown' && !b.giant) ? M.hint.pick : M.hint.mist
    if (this.phase !== 'table') return null
    if (!this.baked) return this.inBasket().length ? M.hint.pizza : this.ovenReady ? M.hint.oven : null
    return this.served < SLICES ? M.hint.share : null
  }

  /** Warm and dim in the house, cool and bright outside (`now`: at once, else it eases there as the camera glides). */
  private lightK = 0
  private light(now = false, dt = 0) {
    const goal = this.phase === 'table' ? 1 : 0
    this.lightK = now ? goal : this.lightK + (goal - this.lightK) * Math.min(1, dt * 1.6)
    const k = this.lightK
    this.lights.sun.color.copy(LIGHT.house.sun).lerp(LIGHT.table.sun, k)
    this.lights.ambient.color.copy(LIGHT.house.amb).lerp(LIGHT.table.amb, k)
    ;(this.scene.background as Color).copy(LIGHT.house.sky).lerp(LIGHT.table.sky, k)
  }

  // ---------------------------------------------------------------- building bits

  private buildWedge(i: number): Wedge {
    const root = new Group()
    const a = i * 2 * A
    root.position.set(Math.sin(a) * MID, 0, Math.cos(a) * MID)
    root.rotation.y = a
    const crust = solid(wedgeGeo(PIZZA.r, 0.035, 0, CRUST), this.bag, 2)
    const cheese = solid(wedgeGeo(PIZZA.r - 0.03, 0.012, 0.021, CHEESE), this.bag, 0)
    // Tomato peeking through the cheese and a basil leaf (they stay their color in the oven).
    const top = solid(
      merge([
        P.sphere(0.022, '#FF8A70', { at: [0.035, 0.03, 0.03], scale: [1, 0.25, 1] }, 8),
        P.sphere(0.016, '#FF8A70', { at: [-0.04, 0.03, -0.05], scale: [1, 0.25, 1] }, 8),
        P.sphere(0.022, '#6CC08A', { at: [-0.03, 0.032, 0.07], rot: [0, i * 1.3, 0], scale: [1.5, 0.2, 0.8] }, 8),
      ]),
      this.bag,
      0,
    )
    root.add(crust, cheese, top)
    this.pie.add(root)
    return { i, root, crust: crust.children[0] as Mesh, cheese: cheese.children[0] as Mesh, where: 'pizza', owner: null, bites: 0 }
  }

  private fillHouseBasket() {
    for (const o of this.houseItems) o.removeFromParent()
    this.houseItems = []
    for (const c of COLORS)
      for (let k = 0; k < this.basket[c]; k++) {
        const o = this.kit.clump(c)
        this.houseItems.push(o)
        this.inHouseBasket(o, this.houseItems.length - 1, false)
      }
  }
  /** A clump settles into its place in the house basket's heap. */
  private inHouseBasket(o: Group, n: number, giant: boolean) {
    const b = this.houseBasket
    b.root.add(o)
    o.position.copy(heapSpot(n, b.r, b.rim))
    o.rotation.set(-1.2, n * 2.1, 0)
    o.scale.setScalar(giant ? 0.85 : 0.55)
    o.visible = true
  }
  private fillTableBasket() {
    for (const it of this.items) it.root.removeFromParent()
    this.items = []
    for (const c of COLORS)
      for (let k = 0; k < this.basket[c]; k++) {
        const root = this.kit.one(c)
        this.items.push({ color: c, root, where: 'basket' })
        this.tableBasket.root.add(root)
      }
    this.restackTable()
  }
  /** The table basket's heap, in the order they went in. */
  private restackTable() {
    const b = this.tableBasket
    let n = 0
    for (const it of this.items) {
      if (it.where !== 'basket') continue
      it.root.position.copy(heapSpot(n, b.r, b.rim))
      it.root.rotation.set(0.3 * Math.sin(n * 2.3), n * 1.7, 0.2 * Math.cos(n))
      it.root.scale.setScalar(0.7)
      n++
    }
  }

  /** Kaylee and Daddy on their stools (Mommy is there already). */
  private seatAll(now: boolean) {
    const seat = (c: Avatar | Member, e: EaterId, delay: number) => {
      if (now) this.put(c, SEATS[e].x, SEATS[e].seat, SEAT_Z, 'sit', 0)
      else this.hop(c, this.scene, new Vector3(SEATS[e].x, SEATS[e].seat, SEAT_Z), { pose: 'sit', face: 0, dur: 1.0, arc: 1.4, delay })
    }
    seat(this.kaylee, 'kaylee', 0.15)
    seat(this.nick, 'nick', 0.4)
    // The aunty goes ahead to light the oven (once the camera has left the house).
    const f = this.house.farmer.root
    const go = () => {
      f.position.set(...FARMER_TABLE)
      f.rotation.y = 0.9
    }
    if (now) go()
    else this.after(0.9, go)
  }

  // ---------------------------------------------------------------- the bags

  /** Water into a bag: a pin pops out, it swells, it's grown; past that (rounds 2 and 3) it goes giant. */
  private grow(b: BagState, w: number, quiet = false) {
    const cap = this.round === '1' ? 1.15 : GIANT + 0.3
    const before = b.water
    b.water = Math.min(cap, w)
    if (before < PIN_AT && b.water >= PIN_AT && b.stage === 'none') {
      b.stage = 'pin'
      b.pop = 0
      b.clump.visible = true
      if (!quiet) {
        sfx.bloop(this.pops++ % 13)
        if (b.color !== 'grey') this.after(0.5, () => this.once('colors2', M.colors2, true))
        this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0, 0.08)), 5, 0.6, 0.6, 0.6, 0.03)
      }
    }
    if (before < 1 && b.water >= 1 && b.stage !== 'grown') {
      b.stage = 'grown'
      if (!quiet) {
        sfx.swell()
        this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0.04, 0.12)), 10, 1.0, 0.9, 0.8, 0.04)
        this.checkRound()
      }
    }
    if (before < GIANT && b.water >= GIANT && !b.giant) {
      b.giant = true
      b.clump.userData.giant = true
      b.boing = 0
      if (!quiet) {
        sfx.giant(0)
        this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0.1, 0.2)), 18, 1.4, 1.2, 1.0, 0.05)
        this.talkTo('nick', () => {
          this.nick.react('hop')
          if (this.told.has('giant') || speakingVoice() === 'sparkle') sfx.haha()
          this.once('giant', M.giant, true)
        })
      }
    }
  }
  /** The size the water says. */
  private sizeFor(b: BagState) {
    if (b.stage === 'none') return 0
    const w = b.water
    if (w < 1) return 0.28 + 0.72 * clamp((w - PIN_AT) / (1 - PIN_AT), 0, 1)
    return 1 + clamp((w - 1) / (GIANT - 1), 0, 1) * 1.35
  }

  private grownCount() {
    return this.bags.filter((b) => b.stage === 'grown').length
  }

  private checkRound() {
    if (this.round === '1' && this.grownCount() === this.bags.length) {
      this.round = '2'
      this.after(0.7, () => {
        sfx.allGrown()
        this.hopFarmer()
        for (const b of this.bags) this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0.05, 0.15)), 4, 0.8, 1, 0.9, 0.04)
        this.ev.round('2', formatBasket(this.basket))
        this.once('grown', M.grown, true)
        this.roundLine('2')
      })
    }
  }

  /** Round 3: the aunty swaps the bags. The old clumps puff away, the new collars pop on, pink and gold. */
  private newBags() {
    this.round = '3'
    this.picks = 0
    this.hopFarmer()
    sfx.aunty()
    this.bags.forEach((b, k) => {
      this.after(0.1 + k * 0.08, () => {
        if (b.stage !== 'none') this.steam.burst(tmp.copy(b.at).add(new Vector3(0, 0, 0.1)), 5, 0.4, 0.3, 0.7, 0.07)
        b.water = 0
        b.stage = 'none'
        b.giant = false
        b.size = 0
        b.clump.visible = false
        b.kind = ROUND3_KINDS[k]
        b.color = shroomOf(b.kind)
        // A new clump in the new color (one in her hand stays there), and a new collar.
        if (this.carried?.o !== b.clump) b.clump.removeFromParent()
        b.clump = this.newClump(k, b.color)
        b.collar.removeFromParent()
        b.collar = collar(b.kind, this.bag)
        b.collar.position.set(b.at.x, b.at.y, b.at.z + 0.004)
        b.collar.scale.setScalar(0.01)
        this.scene.add(b.collar)
        b.pop = 0
        sfx.plink()
        if (b.kind !== 'plain') this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0, 0.1)), 6, 0.7, 0.7, 0.7, 0.035, b.kind === 'pink' ? 1 : 0)
      })
    })
    this.ev.round('3', formatBasket(this.basket))
    this.roundLine('3')
  }

  // ---------------------------------------------------------------- picking

  /** A grown clump comes off (pulled, or tapped) and flies into the basket. */
  private pickOff(i: number, o?: Group) {
    const b = this.bags[i]
    if (!o && b.stage !== 'grown') return
    const clump = o ?? b.clump
    const giant = !!clump.userData.giant
    const color = clump.userData.color as ShroomColor
    if (b.clump === clump) {
      // The bag is empty again: a fresh clump waits inside it for the next misting.
      b.water = 0
      b.stage = 'none'
      b.giant = false
      b.size = 0
      b.pull = 0
      b.clump = this.newClump(i, b.color)
    }
    clump.userData.pick = undefined
    this.scene.attach(clump)
    if (!o) sfx.twist()
    this.touches += o ? 1 : 0
    const n = this.houseItems.length
    this.houseItems.push(clump)
    const b0 = this.houseBasket
    this.flights.push({
      o: clump,
      from: clump.position.clone(),
      to: () => b0.root.localToWorld(heapSpot(n, b0.r, b0.rim)),
      s0: clump.scale.x,
      s1: giant ? 0.85 : 0.55,
      t: 0,
      dur: 0.55,
      arc: 0.45,
      done: () => {
        this.inHouseBasket(clump, n, giant)
        this.basket[color]++
        this.picks++
        this.basketBounce = 0
        sfx.basket(basketSize(this.basket))
        this.sparkles.burst(b0.root.localToWorld(new Vector3(0, b0.rim + 0.05, 0)), 8, 0.8, 1, 0.7, 0.035, color === 'pink' ? 1 : color === 'gold' ? 0 : 2)
        this.ev.basket(formatBasket(this.basket))
        this.checkPicks()
      },
    })
  }

  /** A bag's clump, waiting (tiny, hidden) in its mouth for the mist. */
  private newClump(i: number, color: ShroomColor) {
    const clump = this.kit.clump(color)
    clump.position.copy(this.bags[i]?.at ?? new Vector3(...BAGS[i]))
    clump.scale.setScalar(0.001)
    clump.visible = false
    clump.userData.pick = `bag:${i}`
    clump.userData.color = color
    this.scene.add(clump)
    return clump
  }

  private checkPicks() {
    if (this.round === '2' && this.picks >= PICKS['2']) {
      this.round = '3'
      this.after(0.9, () => this.newBags())
    } else if (this.round === '3' && this.picks >= PICKS['3'] && this.phase === 'house') {
      this.phase = 'walk'
      this.after(1.0, () => this.toTable())
    }
  }

  /** Off to lunch: the camera glides out to the table, Kaylee and Daddy hop onto their stools. */
  private toTable() {
    sfx.allGrown()
    this.round = 'pizza'
    this.spray.on = false
    this.spray.until = -1
    this.grab = null
    this.carried = null
    this.rig.lag = 0.8
    this.phase = 'table'
    this.seatAll(false)
    this.fillTableBasket()
    this.after(1.6, () => (this.rig.lag = 0.45))
    this.ev.round('pizza', formatBasket(this.basket))
    this.roundLine('pizza')
  }

  // ---------------------------------------------------------------- the pizza

  private onPizza() {
    return this.items.filter((it) => it.where === 'pizza').length
  }
  private inBasket() {
    return this.items.filter((it) => it.where === 'basket')
  }
  private get ovenReady() {
    return this.phase === 'table' && !this.baked && !this.bake && this.items.length > 0 && this.inBasket().length === 0 && !this.items.some((it) => it.where !== 'pizza')
  }

  /** A free spot on the pizza (world), near `near` if given. */
  private freeSpot(near?: Vector3): Vector3 {
    const placed = this.items.filter((it) => it.where === 'pizza' || it.where === 'fly').map((it) => it.root.getWorldPosition(new Vector3()))
    let best = new Vector3(PIZZA.x, PIZZA.y, PIZZA.z)
    let score = -Infinity
    for (let k = 0; k < 40; k++) {
      const a = Math.random() * Math.PI * 2
      const rr = Math.sqrt(Math.random()) * PIZZA.r * 0.78
      const p = new Vector3(PIZZA.x + Math.sin(a) * rr, PIZZA.y, PIZZA.z + Math.cos(a) * rr)
      if (near) {
        p.lerp(near, 0.7)
        const off = Math.hypot(p.x - PIZZA.x, p.z - PIZZA.z)
        const max = PIZZA.r * 0.78
        if (off > max) p.set(PIZZA.x + ((p.x - PIZZA.x) * max) / off, PIZZA.y, PIZZA.z + ((p.z - PIZZA.z) * max) / off)
      }
      const gap = Math.min(...placed.map((q) => Math.hypot(q.x - p.x, q.z - p.z)), 1)
      const sc = Math.min(gap, 0.12) - (near ? Math.hypot(p.x - near.x, p.z - near.z) * 0.2 : 0)
      if (sc > score) {
        score = sc
        best = p
      }
    }
    return best
  }

  /** The wedge under a point on the pizza. */
  private wedgeAt(p: Vector3) {
    const a = Math.atan2(p.x - PIZZA.x, p.z - PIZZA.z)
    const k = ((Math.round(a / (2 * A)) % SLICES) + SLICES) % SLICES
    return this.wedges[k]
  }

  /** A mushroom onto the pizza at a world point: it rides on the wedge under it from now on. */
  private place(it: Item, at: Vector3, fly: boolean) {
    const w = this.wedgeAt(at)
    const land = () => {
      it.where = 'pizza'
      this.scene.updateMatrixWorld()
      w.root.attach(it.root)
      const local = w.root.worldToLocal(at.clone())
      it.root.position.set(local.x, 0.045, local.z)
      it.root.rotation.set(0, Math.random() * 6, 0)
      it.root.scale.setScalar(ON_PIZZA)
      sfx.plopPizza()
      this.sparkles.burst(at.clone().add(new Vector3(0, 0.06, 0)), 4, 0.4, 0.6, 0.5, 0.025)
      if (this.ovenReady) this.after(0.4, () => this.ovenReady && (sfx.chime(), this.hopFarmer()))
    }
    if (!fly) return land()
    it.where = 'fly'
    this.scene.attach(it.root)
    this.flights.push({ o: it.root, from: it.root.position.clone(), to: () => at.clone().add(new Vector3(0, 0.045, 0)), s0: it.root.scale.x, s1: ON_PIZZA, t: 0, dur: 0.45, arc: 0.3, done: land })
  }
  private backToBasket(it: Item) {
    it.where = 'fly'
    this.scene.attach(it.root)
    const b = this.tableBasket
    this.flights.push({
      o: it.root,
      from: it.root.position.clone(),
      to: () => b.root.localToWorld(new Vector3(0, b.rim + 0.03, 0)),
      s0: it.root.scale.x,
      s1: 0.62,
      t: 0,
      dur: 0.4,
      arc: 0.2,
      done: () => {
        it.where = 'basket'
        b.root.attach(it.root)
        this.restackTable()
        sfx.basket(this.inBasket().length)
      },
    })
  }
  /** The next mushroom in the basket hops onto the pizza (a tap on the basket, or on the pizza where she tapped). */
  private placeNext(near?: Vector3) {
    const it = this.inBasket().at(-1)
    if (!it) return false
    this.place(it, this.freeSpot(near), true)
    return true
  }

  /** The aunty slides the pizza in, the fire roars, ding, it comes out golden. */
  private startBake() {
    this.bake = { t: 0 }
    this.hopFarmer()
    sfx.slide()
    this.once('oven', M.oven, true)
    this.basketBounce = 0
  }
  private baking(dt: number) {
    const b = this.bake
    if (!b) return
    b.t += dt
    const home = tmp2.set(PIZZA.x, PIZZA.y, PIZZA.z)
    const mouth = new Vector3(...OVEN_MOUTH)
    const IN = 0.8
    const FIRE = 2.4
    const OUT = 0.8
    if (b.t < IN) {
      const k = b.t / IN
      const e = k * k * (3 - 2 * k)
      this.pie.position.lerpVectors(home, mouth, e).y += bell(k) * 0.35
      this.pie.scale.setScalar(1 - 0.55 * e)
      ovenGlow(this.table.oven, e * 0.6, this.time)
    } else if (b.t < IN + FIRE) {
      if (this.pie.visible) {
        this.pie.visible = false
        sfx.crackle(FIRE)
      }
      ovenGlow(this.table.oven, 1, this.time)
      if (Math.random() < dt * 8) this.steam.emit(new Vector3(OVEN[0] - 0.08, 1.2, OVEN[2] - 0.12), new Vector3((Math.random() - 0.5) * 0.2, 0.5, 0), 1.6, 0.12)
      if (!this.baked && b.t > IN + FIRE * 0.6) {
        this.baked = true
        for (const w of this.wedges) {
          recolor(w.crust, CRUST_BAKED)
          recolor(w.cheese, CHEESE_BAKED)
        }
      }
    } else {
      if (!this.pie.visible) {
        this.pie.visible = true
        sfx.slide()
      }
      const k = Math.min(1, (b.t - IN - FIRE) / OUT)
      const e = k * k * (3 - 2 * k)
      this.pie.position.lerpVectors(mouth, home, e).y += bell(k) * 0.35
      this.pie.scale.setScalar(0.45 + 0.55 * e)
      ovenGlow(this.table.oven, 1 - e, this.time)
      if (k >= 1) {
        this.bake = null
        this.pie.position.copy(home)
        this.pie.scale.setScalar(1)
        sfx.ready()
        for (let i = 0; i < 6; i++) this.steam.emit(new Vector3(PIZZA.x + (Math.random() - 0.5) * 0.4, PIZZA.y + 0.05, PIZZA.z + (Math.random() - 0.5) * 0.3), new Vector3(0, 0.35, 0), 1.4, 0.1)
        this.sparkles.burst(new Vector3(PIZZA.x, PIZZA.y + 0.1, PIZZA.z), 16, 1.2, 1.4, 1, 0.045)
        this.cheer()
        this.after(0.6, () => this.once('share', M.share, true))
        this.quietFrom = this.time + 3
        this.sayN = 0
      }
    }
  }

  /** A slice (with the mushrooms she put on it) hops to the next plate round the table. */
  private serve() {
    const w = this.wedges.find((x) => x.where === 'pizza')
    if (!w) return
    const e = ORDER[this.served]
    this.served++
    w.where = 'fly'
    w.owner = e
    this.scene.attach(w.root)
    const stack = this.wedges.filter((x) => x.owner === e && x !== w).length
    sfx.fwip()
    this.flights.push({
      o: w.root,
      from: w.root.position.clone(),
      to: () => new Vector3(SEATS[e].x, TABLE.top + 0.03 + stack * 0.04, PLATE_Z + 0.02),
      s0: 1,
      s1: 0.82,
      t: 0,
      dur: 0.55,
      arc: 0.3,
      // Its tip turns toward whoever eats it (the nearest way round).
      r0: w.root.rotation.y,
      r1: Math.round(w.root.rotation.y / (Math.PI * 2)) * Math.PI * 2 + (stack ? 0.25 : 0),
      done: () => {
        w.where = 'plate'
        this.plateBounce.set(e, 0)
        sfx.plop()
        if (this.served >= SLICES && !this.doneSaid) {
          this.doneSaid = true
          this.after(1.0, () => {
            this.cheer()
            this.ev.allDone()
          })
        }
      },
    })
  }

  /** Someone at the table munches the top slice on their plate. */
  private munch(e: EaterId) {
    const who = this.person(e)
    const w = this.wedges.filter((x) => x.owner === e && x.where === 'plate' && x.bites < 3).at(-1)
    who.react('hop')
    if (!w) return e === 'nick' ? sfx.haha() : sfx.giggle()
    w.bites++
    w.root.scale.setScalar(0.82 * (1 - w.bites * 0.28))
    if (w.bites >= 3) w.root.visible = false
    sfx.chomp()
    this.after(0.12, () => sfx.munch())
    this.after(0.5, () => this.once('yum', M.yum, true))
    this.crumbs.burst(w.root.getWorldPosition(new Vector3()).add(new Vector3(0, 0.05, 0)), 8, 0.5, 0.8, 0.6, 0.02)
  }

  private cheer() {
    for (const [k, c] of [this.kaylee, this.ji, this.nick].entries()) this.after(k * 0.12, () => c.react('hop'))
    this.hopFarmer()
    sfx.cheer()
  }

  // ---------------------------------------------------------------- helpers

  private person(e: EaterId | 'nick') {
    return e === 'kaylee' ? this.kaylee : e === 'ji' ? this.ji : this.nick
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Once every few seconds at most (a quick run of taps gets one answer). */
  private talkTo(key: string, f: () => void, every = 2.5) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  private hopFarmer() {
    this.farmerHop = 0
  }
  /** Where Kaylee holds the hose: at her side, the side she faces. */
  private handAt() {
    const k = this.kaylee.root
    const yaw = k.rotation.y
    return new Vector3(k.position.x + Math.sin(yaw) * 0.24 + Math.cos(yaw) * 0.12, k.position.y + 0.42, k.position.z + Math.cos(yaw) * 0.24 - Math.sin(yaw) * 0.12)
  }
  private screen(world: Vector3, r = 0) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: Math.abs(e.x - c.x) * this.w * 0.5 }
  }
  /** Where a screen point meets a plane. */
  private onPlane(x: number, y: number, plane: Plane) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near).normalize()
    const denom = plane.normal.dot(dir)
    if (Math.abs(denom) < 1e-6) return null
    const t = -(plane.normal.dot(near) + plane.constant) / denom
    return t > 0 ? near.addScaledVector(dir, t) : null
  }
  private aimAt(x: number, y: number) {
    const p = this.onPlane(x, y, wallPlane)
    if (p) this.aim.set(clamp(p.x, -1.2, 1.2), clamp(p.y, 0.25, 1.7), MOUTH_Z)
  }
  /** The grown clump nearest a screen point (within reach of her finger). */
  private grownNear(x: number, y: number, px = 70) {
    let best: BagState | null = null
    let d = px
    for (const b of this.bags) {
      if (b.stage !== 'grown') continue
      const s = this.screen(b.at)
      if (!s) continue
      const dd = Math.hypot(s.x - x, s.y - y) - s.r * Math.max(1, b.size) * 0.5
      if (dd < d) {
        d = dd
        best = b
      }
    }
    return best
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return this.phase === 'house' ? this.bags.filter((b) => b.clump.visible).map((b) => b.clump) : []
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined) return
    if (this.phase === 'house') {
      if (this.grab || this.carried || this.spray.on) return
      // A poke (the dog, the sign...) is a tap, not misting.
      if (id && !id.startsWith('bag:')) return
      if (this.round !== '1') {
        const b = id ? this.bags[Number(id.slice(4))] : null
        const g = b && b.stage === 'grown' ? b : this.grownNear(x, y, 46)
        if (g) {
          this.grab = { i: g.i, x0: x, y0: y, x, y, t0: this.time, moved: false, detached: false }
          return
        }
      }
      this.startSpray(x, y)
      return
    }
    if (this.phase === 'table') {
      if (this.held || this.bake || this.baked) return
      if (id && id !== 'pizza' && id !== 'tbasket') return
      const it = this.itemNear(x, y)
      if (it) this.held = { it, x0: x, y0: y, x, y, moved: false }
    }
  }

  private startSpray(x: number, y: number) {
    this.spray.on = true
    this.spray.x = x
    this.spray.y = y
    this.pressT = this.time
    this.aimAt(x, y)
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld) return
    const g = this.grab
    if (g) {
      g.x = x
      g.y = y
      this.lastTouch = this.time
      if (!g.moved && Math.hypot(x - g.x0, y - g.y0) > 10) g.moved = true
      return
    }
    if (this.carried) {
      this.lastTouch = this.time
      this.carryTo(x, y)
      return
    }
    if (this.spray.on) {
      this.spray.x = x
      this.spray.y = y
      this.lastTouch = this.time
      this.aimAt(x, y)
      return
    }
    const h = this.held
    if (h) {
      h.x = x
      h.y = y
      this.lastTouch = this.time
      if (!h.moved && Math.hypot(x - h.x0, y - h.y0) > 10) {
        h.moved = true
        this.touches++
        h.it.where = 'held'
        this.scene.attach(h.it.root)
        h.it.root.scale.setScalar(ON_PIZZA)
        sfx.pull(0.3)
      }
    }
  }

  pointerUp() {
    if (this.carried) {
      // Let go anywhere: into the basket it goes.
      const { i, o } = this.carried
      this.carried = null
      this.pickOff(i, o)
      return
    }
    const g = this.grab
    if (g) {
      this.grab = null
      // A short pull that didn't pop it off springs back (a still tap picks it: onTap).
      this.bags[g.i].pull = 0
      return
    }
    if (this.spray.on) {
      this.spray.on = false
      this.spray.until = Math.max(this.time + 0.15, this.pressT + BURST_S)
      return
    }
    const h = this.held
    this.held = null
    if (h?.moved) {
      const p = this.onPlane(h.x, h.y - LIFT_PX, new Plane(new Vector3(0, 1, 0), -PIZZA.y))
      if (p && Math.hypot(p.x - PIZZA.x, p.z - PIZZA.z) < PIZZA.r * 0.9) {
        p.y = PIZZA.y
        this.place(h.it, p, true)
      } else this.backToBasket(h.it)
    }
  }

  /** The mushroom her finger is on: in the basket, or one on the pizza to move again. */
  private itemNear(x: number, y: number) {
    let best: Item | null = null
    let d = 64
    const b = this.screen(this.tableBasket.root.getWorldPosition(new Vector3()).add(new Vector3(0, this.tableBasket.rim, 0)), this.tableBasket.r)
    const inB = this.inBasket()
    // Anywhere on the basket takes the top one.
    if (b && inB.length && Math.hypot(x - b.x, y - b.y) < Math.max(56, b.r * 1.3)) return inB.at(-1)!
    for (const it of this.items) {
      if (it.where !== 'pizza') continue
      const s = this.screen(it.root.getWorldPosition(new Vector3()))
      if (!s) continue
      const dd = Math.hypot(s.x - x, s.y - y)
      if (dd < d) {
        d = dd
        best = it
      }
    }
    return best
  }

  private carryTo(x: number, y: number) {
    const c = this.carried
    if (!c) return
    const p = this.onPlane(x, y - LIFT_PX, new Plane(new Vector3(0, 0, 1), -(MOUTH_Z + 0.35)))
    if (p) c.o.position.lerp(p, 0.6)
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (this.phase === 'house') return this.tapHouse(id, x, y)
    if (this.phase === 'table') return this.tapTable(id, x, y)
  }

  private tapHouse(id: string | null, x: number, y: number) {
    if (id?.startsWith('bag:') || id === null) {
      const b = id ? this.bags[Number(id.slice(4))] : this.grownNear(x, y, 40)
      if (b && b.stage === 'grown' && this.round !== '1') {
        if (b.giant) {
          // The giant one is bouncy.
          b.boing = 0
          sfx.giant(Math.min(6, ++b.bounces))
          this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0.25, 0.2)), 6, 0.8, 1, 0.6, 0.04)
          return
        }
        this.spray.until = -1
        this.pickOff(b.i)
      } else if (b && b.stage === 'grown' && this.round === '1') {
        // Poking a grown one before it's time to pick: it boings, and the first time Sparkle tells where they grow from.
        b.boing = 0
        this.once('sawdust', M.sawdust)
      }
      // Otherwise the press already sprayed a puff there.
      return
    }
    switch (id) {
      case 'basket':
        this.basketBounce = 0
        sfx.basket(basketSize(this.basket))
        return
      case 'farmer':
        return this.tapFarmer()
      case 'gecko': {
        const g = this.house.gecko
        const to = new Vector3(GECKO[0] + (g.position.x > GECKO[0] ? -0.5 : 0.5) * (0.6 + Math.random() * 0.4), GECKO[1] + (Math.random() - 0.5) * 0.3, GECKO[2])
        this.geckoRun = { from: g.position.clone(), to, t: 0 }
        sfx.tukkae()
        return
      }
      case 'dog':
        this.dogWake = 0
        this.talkTo('dog', () => sfx.snore(), 1.2)
        return
      case 'drip':
        this.dropT = Math.max(this.dropT, 1.4)
        return
      case 'sign':
        this.signSpin = 0
        sfx.ding()
        this.once('sawdust', M.sawdust)
        return
      case 'family:kaylee':
        this.kaylee.react('wiggle')
        sfx.giggle()
        return
      case 'family:nick':
        this.nick.react('hop')
        if (!this.inTurn('nick', M.dad, this.nickTap)) sfx.haha()
        else this.nickTap++
        return
    }
  }

  private tapFarmer() {
    this.hopFarmer()
    if (this.inTurn('farmer', M.tap, this.farmerTap)) this.farmerTap++
    else this.talkTo('farmer', () => sfx.aunty(), 1)
  }

  private tapTable(id: string | null, _x: number, _y: number) {
    if (!id) return
    if (id.startsWith('plate:') || id.startsWith('family:')) {
      const e = id.slice(id.indexOf(':') + 1) as EaterId
      this.plateBounce.set(e, 0)
      return this.munch(e)
    }
    switch (id) {
      case 'tbasket':
        if (this.baked || this.bake || !this.placeNext()) {
          this.basketBounce = 0
          sfx.basket(this.inBasket().length)
        }
        return
      case 'pizza':
        if (this.bake) return
        if (this.baked) return this.serve()
        if (!this.placeNext(this.lastTap)) {
          if (this.ovenReady) this.startBake()
          else sfx.boop()
        }
        return
      case 'oven':
        if (this.ovenReady) return this.startBake()
        sfx.crackle(0.5)
        this.steam.burst(new Vector3(OVEN[0] - 0.08, 1.2, OVEN[2] - 0.12), 4, 0.2, 0.5, 1.2, 0.08)
        return
      case 'farmer':
        return this.tapFarmer()
      case 'view':
        this.cloudT = 0
        this.table.cloud.position.x = TX - 6
        sfx.chime()
        return
    }
  }
  private lastTap: Vector3 | undefined
  tap(x: number, y: number, id?: string) {
    this.lastTap = this.phase === 'table' ? (this.onPlane(x, y, new Plane(new Vector3(0, 1, 0), -PIZZA.y)) ?? undefined) : undefined
    super.tap(x, y, id)
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    if (this.phase !== 'table') this.stepHouse(dt, t)
    else {
      this.hose.visible = this.house.wand.visible = false
      this.rainbow.visible = false
    }
    this.baking(dt)
    // ---- Things flying (into the basket, onto the pizza, to a plate) ----
    for (const f of [...this.flights]) {
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      const e = k * k * (3 - 2 * k)
      f.o.position.lerpVectors(f.from, f.to(), e).y += bell(k) * f.arc
      f.o.scale.setScalar(f.s0 + (f.s1 - f.s0) * e)
      if (f.r0 !== undefined && f.r1 !== undefined) f.o.rotation.y = f.r0 + (f.r1 - f.r0) * e
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.done()
      }
    }
    // ---- The mushroom in her hand at the table ----
    const h = this.held
    if (h?.moved) {
      const p = this.onPlane(h.x, h.y - LIFT_PX, new Plane(new Vector3(0, 1, 0), -(PIZZA.y + 0.09)))
      if (p) h.it.root.position.lerp(p, 0.7)
      h.it.root.rotation.z = Math.sin(t * 9) * 0.15
    }
    // ---- The table's life ----
    if (!this.bake) ovenGlow(this.table.oven, this.ovenReady ? 0.3 + 0.2 * Math.sin(t * 4) : 0, t)
    for (const e of EATERS) {
      const k = this.plateBounce.get(e) ?? 1
      if (k < 1) this.plateBounce.set(e, Math.min(1, k + dt / 0.35))
      this.table.plates[e].scale.set(1 + 0.12 * bell(k), 1 - 0.2 * bell(k), 1 + 0.12 * bell(k))
    }
    this.cloudT += dt
    this.table.cloud.position.x = TX - 6 + this.cloudT * 0.35
    if (this.table.cloud.position.x > TX + 6) this.cloudT = 0
    // The low cloud drifts slowly along the valley and back; the flower nods.
    for (const [i, m] of this.table.mist.entries()) m.position.x = (m.userData.home as number) + Math.sin(t * 0.06 + i * 1.9) * 1.6
    this.table.flower.rotation.z = Math.sin(t * 1.3) * 0.08
    this.light(false, dt)
    this.stuck()
    // ---- Her baskets ----
    this.basketBounce = Math.min(1, this.basketBounce + dt / 0.4)
    const bb = bell(this.basketBounce)
    for (const b of [this.houseBasket, this.tableBasket]) b.root.scale.set(1 + 0.1 * bb, 1 - 0.15 * bb, 1 + 0.1 * bb)
    // ---- The aunty ----
    this.farmerHop = Math.min(1, this.farmerHop + dt / 0.5)
    const f = this.house.farmer
    const fh = bell(this.farmerHop)
    f.root.position.y = fh * 0.18
    f.root.scale.set(1 + 0.06 * fh, 1 - 0.04 * fh, 1 + 0.06 * fh)
    this.farmerLife.update(dt)
    // ---- Daddy's mushroom hat ----
    this.hatShown += (this.hatK - this.hatShown) * Math.min(1, dt * 6)
    this.hat.visible = this.hatShown > 0.02
    this.hat.scale.setScalar(Math.max(0.001, this.hatShown * 2.4 * (1 + 0.06 * Math.sin(t * 5))))
    // ---- The family ----
    for (const c of [this.kaylee, this.nick, this.ji]) c.update(dt, t)
    if (this.phase === 'table') {
      for (const c of [this.kaylee, this.nick, this.ji]) c.lookAt(PIZZA.x, PIZZA.y, PIZZA.z)
    }
    for (const fl of [this.mist, this.drops, this.sparkles, this.crumbs, this.steam]) fl.update(dt)
  }

  private stepHouse(dt: number, t: number) {
    // ---- A grab: pull until it pops off (or hold still and it turns into misting) ----
    const g = this.grab
    if (g) {
      const b = this.bags[g.i]
      const d = Math.hypot(g.x - g.x0, g.y - g.y0)
      b.pull = clamp(d / PULL_PX, 0, 1)
      if (!g.moved && this.time - g.t0 > HOLD_TO_MIST) {
        this.grab = null
        b.pull = 0
        this.startSpray(g.x, g.y)
      } else if (b.pull >= 1 && b.stage === 'grown') {
        // Pop! It's in her hand.
        sfx.twist()
        this.sparkles.burst(tmp.copy(b.at).add(new Vector3(0, 0, 0.1)), 6, 0.7, 0.7, 0.5, 0.03)
        const o = b.clump
        this.grab = null
        this.carried = { i: g.i, o }
        b.pull = 0
        this.scene.attach(o)
        this.carryTo(g.x, g.y)
      } else if (Math.floor(b.pull * 5) !== Math.floor((b.pull - dt) * 5)) sfx.pull(b.pull)
    }
    // ---- The clumps: ease to their size, pop, wiggle when grown, stretch when pulled ----
    for (const b of this.bags) {
      if (this.carried?.o === b.clump) {
        b.clump.rotation.z = Math.sin(t * 10) * 0.2
        continue
      }
      b.pop = Math.min(1, b.pop + dt / 0.35)
      b.boing = Math.min(1, b.boing + dt / 0.6)
      b.collar.scale.setScalar(b.pop < 1 && b.stage === 'none' ? 0.01 + 0.99 * (1 + 0.3 * bell(b.pop)) * Math.min(1, b.pop * 2) : 1)
      if (!b.clump.visible) continue
      const goal = this.sizeFor(b)
      b.size += (goal - b.size) * Math.min(1, dt * 5)
      const popK = b.stage === 'pin' && b.pop < 1 ? 1 + 0.6 * bell(b.pop) : 1
      const bo = bell(b.boing)
      const s = Math.max(0.001, b.size * popK)
      b.clump.scale.set(s * (1 + 0.25 * bo), s * (1 - 0.3 * bo), s)
      // A grown clump wiggles "pick me!" (rounds 2 and 3); pulled, it leans toward her finger and twists.
      const wig = b.stage === 'grown' && this.round !== '1' ? Math.sin(t * 7 + b.i * 1.3) * 0.08 * (Math.sin(t * 1.7 + b.i) > 0.3 ? 1 : 0.2) : 0
      b.clump.rotation.set(0, 0, wig + b.pull * 0.9 * Math.sin(t * 18) * 0.4 + b.pull * 0.5)
      b.clump.position.copy(b.at)
      if (b.pull > 0 && this.grab) {
        const gp = this.onPlane(this.grab.x, this.grab.y, wallPlane)
        if (gp) b.clump.position.lerp(tmp.set(gp.x, gp.y, b.at.z + 0.04), b.pull * 0.35)
      }
      // Wet bags drip.
      if (b.water > 0.35 && Math.random() < dt * 0.6) this.drops.emit(tmp.copy(b.at).add(new Vector3((Math.random() - 0.5) * 0.12, -0.12, 0.02)), new Vector3(0, -0.1, 0.05), 1.2, 0.022)
    }
    if (this.carried) this.carried.o.rotation.z = Math.sin(t * 10) * 0.2
    // ---- The mist ----
    const spraying = this.spray.on || this.time < this.spray.until
    this.spray.k += ((spraying ? 1 : 0) - this.spray.k) * Math.min(1, dt * 8)
    const hand = this.handAt()
    const nozzle = spraying ? tmp2.copy(this.aim).add(new Vector3(-0.3, -0.12, 0.5)) : hand.clone().add(new Vector3(0.12, 0.06, -0.05))
    this.wandAt.lerp(nozzle, Math.min(1, dt * 14))
    const wand = this.house.wand
    wand.visible = true
    wand.position.copy(this.wandAt)
    wand.lookAt(spraying ? this.aim : tmp.set(0, 0.9, MOUTH_Z))
    // Side on to the rack (so we see her face), turning a little toward where she sprays.
    this.kaylee.faceToward(this.aim.x, this.homeZ + 0.35 - (spraying ? 0.25 : 0))
    this.kaylee.lookAt(this.aim.x, this.aim.y, this.aim.z)
    this.updateHose(hand, wand)
    if (spraying) {
      this.spray.hiss -= dt
      if (this.spray.hiss <= 0) {
        this.spray.hiss = 0.2
        sfx.hiss()
      }
      const tip = wand.localToWorld(new Vector3(0, 0, 0.12))
      const dir = tmp.copy(this.aim).sub(tip)
      for (let k = 0; k < 4; k++) {
        const v = dir.clone().multiplyScalar(1.5 + Math.random() * 0.6).add(new Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.3))
        this.mist.emit(tip, v, 0.55 + Math.random() * 0.25, 0.07 + Math.random() * 0.06)
      }
      // Every bag in reach drinks.
      for (const b of this.bags) {
        if (this.carried?.i === b.i) continue
        const d = Math.hypot(b.at.x - this.aim.x, b.at.y - this.aim.y)
        if (d < MIST_R) this.grow(b, b.water + dt * MIST_RATE * Math.sqrt(1 - d / MIST_R))
      }
      this.sillySpray(dt)
    }
    this.rainbow.visible = this.spray.k > 0.02
    if (this.rainbow.visible) {
      const tip = wand.localToWorld(new Vector3(0, 0, 0.12))
      this.rainbow.position.lerpVectors(tip, this.aim, 0.55).add(new Vector3(0, 0.05, 0.05))
      this.rainbow.quaternion.copy(this.rig.camera.quaternion)
      ;(this.rainbow.material as MeshBasicMaterial).opacity = 0.42 * this.spray.k
    }
    this.houseLife(dt, t)
    // ---- Pokes ----
    this.dogWake = Math.min(1, this.dogWake + dt / 1.6)
    const dg = this.house.dog
    dg.head.rotation.z = bell(this.dogWake) * 0.6
    dg.head.position.y = 0.12 + bell(this.dogWake) * 0.08
    dg.tail.rotation.y = this.dogWake < 1 ? Math.sin(t * 22) * 0.6 : Math.sin(t * 1.3) * 0.1
    dg.root.scale.y = 1 + 0.03 * Math.sin(t * 1.6)
    if (this.geckoRun) {
      const gr = this.geckoRun
      gr.t = Math.min(1, gr.t + dt / 0.5)
      this.house.gecko.position.lerpVectors(gr.from, gr.to, gr.t * gr.t * (3 - 2 * gr.t))
      this.house.gecko.rotation.z = Math.atan2(gr.to.y - gr.from.y, gr.to.x - gr.from.x) + Math.sin(gr.t * 30) * 0.15
      if (gr.t >= 1) this.geckoRun = null
    }
    this.signSpin = Math.min(1, this.signSpin + dt / 0.9)
    this.house.sign.rotation.y = this.signSpin < 1 ? this.signSpin * Math.PI * 2 : 0
    this.house.sign.position.y = SIGN[1] + bell(this.signSpin) * 0.06
    // The drip: a drop gathers on the beam, falls, plinks into the puddle.
    this.dropT += dt
    const drop = this.house.drop
    const FALL = 0.45
    const k = this.dropT - 2.2
    if (k < 0) {
      drop.position.set(DRIP[0], DRIP[1], DRIP[2])
      drop.scale.setScalar(clamp(this.dropT / 2.2, 0.2, 1))
    } else if (k < FALL) {
      drop.position.y = DRIP[1] - (DRIP[1] - 0.03) * (k / FALL) ** 2
    } else {
      this.dropT = 0
      sfx.drip()
      this.drops.burst(new Vector3(DRIP[0], 0.04, DRIP[2]), 5, 0.4, 0.8, 0.4, 0.02)
    }
    const pk = clamp(this.dropT / 0.5, 0, 1)
    this.house.puddle.scale.set(1 + 0.15 * bell(pk), 1 + 0.15 * bell(pk), 1)
  }

  /** The house's ambient life: the bulb sways, two moths circle it, the roof drips, the dog's snore bubble, the gecko
   *  scuttles a little now and then by itself. */
  private houseLife(dt: number, t: number) {
    const bulb = this.house.bulb
    bulb.rotation.z = Math.sin(t * 0.9) * 0.03
    bulb.rotation.x = Math.sin(t * 0.7 + 1) * 0.02
    for (const m of this.moths) {
      const a = t * 1.7 + m.phase
      m.root.position.set(BULB[0] + Math.cos(a) * 0.24 + Math.sin(a * 2.3) * 0.05, BULB[1] - 0.02 + Math.sin(a * 1.6) * 0.1, BULB[2] + Math.sin(a) * 0.2)
      m.root.rotation.y = -a
      const flap = Math.sin(t * 38 + m.phase) * 0.9
      m.wings[0].rotation.z = flap
      m.wings[1].rotation.z = -flap
    }
    for (const d of this.drips) {
      d.t += dt
      const k = d.t - (d.period - 0.45)
      if (k < 0) {
        d.o.position.copy(d.at)
        d.o.scale.setScalar(clamp(d.t / (d.period - 0.45), 0.2, 1))
      } else if (k < 0.45) d.o.position.y = d.at.y - (d.at.y - 0.03) * (k / 0.45) ** 2
      else {
        d.t = 0
        this.drops.burst(new Vector3(d.at.x, 0.04, d.at.z), 3, 0.3, 0.6, 0.35, 0.016)
      }
    }
    // The snore bubble swells with each slow breath out and pops (not while she's awake).
    const bub = this.house.dog.bubble
    if (this.dogWake < 1) {
      bub.visible = false
      this.snore = 0
    } else {
      this.snore += dt / 3.2
      const k = this.snore % 1
      bub.visible = k < 0.8
      bub.scale.setScalar(0.3 + 1.4 * Math.sin((k / 0.8) * Math.PI * 0.5))
      if (k >= 0.8 && (this.snore - dt / 3.2) % 1 < 0.8) this.drops.burst(this.house.dog.root.localToWorld(bub.position.clone()), 4, 0.25, 0.3, 0.3, 0.012)
    }
    // Now and then the gecko scuttles a little way by itself.
    if (!this.geckoRun && t > this.geckoNext) {
      this.geckoNext = t + 6 + Math.random() * 6
      const g = this.house.gecko
      const to = new Vector3(clamp(g.position.x + (Math.random() - 0.5) * 0.6, GECKO[0] - 0.4, GECKO[0] + 0.4), clamp(g.position.y + (Math.random() - 0.5) * 0.4, GECKO[1] - 0.3, GECKO[1] + 0.2), GECKO[2])
      this.geckoRun = { from: g.position.clone(), to, t: 0 }
    }
  }

  /** Mist on Daddy grows a mushroom on his head; on the dog, she wakes and shakes; on the aunty, she laughs. */
  private sillySpray(dt: number) {
    const near = (w: Vector3, px: number) => {
      const s = this.screen(w)
      return !!s && Math.hypot(s.x - this.spray.x, s.y - this.spray.y) < px
    }
    const r = this.nick.rig
    if (near(r.head.localToWorld(new Vector3(0, r.face.headY, 0)), 90)) {
      this.daddyWet += dt
      if (this.daddyWet > 0.4) {
        const first = this.hatK === 0
        this.hatK = Math.min(1.6, this.hatK + dt * 0.8 + (first ? 0.5 : 0))
        if (first) {
          sfx.bloop(6)
          this.nick.react('hop')
          this.after(0.3, () => this.once('hat', M.hat, true))
        }
      }
    }
    const dog = this.house.dog.root.position
    if (near(new Vector3(dog.x, 0.2, dog.z), 80)) this.talkTo('dogmist', () => {
      this.dogWake = 0
      sfx.shake()
      this.drops.burst(new Vector3(dog.x, 0.25, dog.z), 10, 0.8, 1, 0.5, 0.025)
    }, 2)
    const fm = this.house.farmer.root.position
    if (near(new Vector3(fm.x, 1.1, fm.z), 90)) this.talkTo('farmermist', () => {
      this.hopFarmer()
      sfx.aunty()
    }, 2.5)
  }

  private hoseKey = ''
  private updateHose(hand: Vector3, wand: Group) {
    const end = wand.localToWorld(new Vector3(0, 0, -0.17))
    const key = `${hand.x.toFixed(3)},${hand.y.toFixed(3)},${hand.z.toFixed(3)},${end.x.toFixed(3)},${end.y.toFixed(3)},${end.z.toFixed(3)}`
    this.hose.visible = true
    if (key === this.hoseKey) return
    this.hoseKey = key
    const mid = hand.clone().lerp(end, 0.5)
    mid.y = Math.min(hand.y, end.y) - 0.18
    // From the tap on the side wall, down to her hand, then to the wand.
    const curve = new CatmullRomCurve3([new Vector3(-3.1, 0.9, 0.2), new Vector3(-2.6, 0.03, 0.5), hand.clone().add(new Vector3(-0.35, -0.4, 0.05)), hand, mid, end])
    const old = this.hose.geometry
    this.hose.geometry = new TubeGeometry(curve, 40, 0.018, 6)
    old.dispose()
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  /** The house's aisle for this screen's shape (a tall screen brings everyone in beside the rack). */
  private tallNow: boolean | null = null
  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tallNow && this.phase === 'house') {
      this.tallNow = tall
      const k = tall ? TALL.kaylee : KAYLEE_AT
      this.kaylee.root.position.set(...k)
      this.nick.root.position.set(...(tall ? TALL.nick : NICK_AT))
      this.houseBasket.root.position.set(...(tall ? TALL.basket : HOUSE_BASKET))
      this.house.dog.root.position.set(...(tall ? TALL.dog : DOG))
      this.house.farmer.root.position.set(...(tall ? TALL.farmer : FARMER_AT))
      this.homeZ = k[2]
    }
    super.setSize(w, h, top)
  }
  private homeZ = KAYLEE_AT[2]

  protected shot(): Shot {
    const tall = this.w < this.h
    if (this.phase === 'house') {
      if (tall) return { center: new Vector3(0, 0.95, 0.3), half: new Vector3(1.42, 1.0, 0.55), yaw: 5, pitch: 13, minDist: 3 }
      return { center: new Vector3(0.1, 1.0, 0.2), half: new Vector3(2.35, 0.85, 0.5), yaw: 7, pitch: 12, minDist: 3 }
    }
    // The pizza big in the middle, the plates and the family's faces behind it, the oven at the side.
    if (tall) return { center: new Vector3(TX - 0.3, 0.85, -0.2), half: new Vector3(1.25, 0.75, 0.75), yaw: 0, pitch: 46, minDist: 2.5 }
    return { center: new Vector3(TX - 0.45, 0.85, -0.2), half: new Vector3(1.55, 0.42, 0.7), yaw: 0, pitch: 44, minDist: 2.5 }
  }

  /** What the hint finger (and the glow) points at now. */
  private hintTarget(): string | null {
    if (this.phase === 'house') {
      if (this.grab || this.carried || this.spray.on) return null
      if (this.round !== '1') {
        const g = this.bags.find((b) => b.stage === 'grown' && !b.giant)
        if (g) return `bag:${g.i}`
      }
      const dry = this.bags.filter((b) => b.stage !== 'grown').sort((a, b) => a.water - b.water)[0]
      return dry ? `bag:${dry.i}` : null
    }
    if (this.phase === 'table') {
      if (this.held || this.bake) return null
      if (!this.baked) return this.inBasket().length ? 'tbasket' : this.ovenReady ? 'oven' : null
      return this.served < SLICES ? 'pizza' : null
    }
    return null
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const idle = this.time - this.lastTouch > STUCK_S
    const hinted = idle && this.hintTarget() === id
    if (id.startsWith('family:')) {
      const e = id.slice(7) as EaterId
      if (e === 'ji' && this.phase !== 'table') return null
      const r = this.person(e).rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: 0, max: 120 }
    }
    if (this.phase === 'house') {
      if (id.startsWith('bag:')) {
        const b = this.bags[Number(id.slice(4))]
        if (this.carried?.i === b.i) return null
        const lastOnes = this.round === '1' && b.stage !== 'grown' && this.grownCount() >= 8
        return { at: b.at.clone().add(new Vector3(0, 0, 0.06)), r: 0.12 * Math.max(1, b.size * 0.8), prio: 2, max: 120, glow: hinted || lastOnes }
      }
      switch (id) {
        case 'basket':
          return { at: this.houseBasket.root.position.clone().add(new Vector3(0, 0.15, 0)), r: 0.2, max: 120 }
        case 'farmer':
          return { at: this.house.farmer.root.position.clone().add(new Vector3(0, 0.95, 0)), r: 0.3, prio: 1, max: 130 }
        case 'gecko':
          return { at: this.house.gecko.position.clone(), r: 0.1, max: 90 }
        case 'dog':
          return { at: this.house.dog.root.position.clone().setY(0.18), r: 0.25, max: 120 }
        case 'drip':
          return { at: this.house.drop.position.clone(), r: 0.06, max: 80 }
        case 'sign':
          return { at: new Vector3(...SIGN), r: 0.2, max: 110 }
      }
      return null
    }
    if (this.phase !== 'table') return null
    if (id.startsWith('plate:')) {
      const e = id.slice(6) as EaterId
      return { at: this.table.plates[e].position.clone(), r: 0.12, prio: 3, max: 110 }
    }
    switch (id) {
      case 'pizza':
        return this.wedges.some((w) => w.where === 'pizza') ? { at: this.pie.position.clone(), r: PIZZA.r * 0.9, prio: 2, max: 220, glow: hinted } : null
      case 'tbasket':
        return { at: this.tableBasket.root.position.clone().add(new Vector3(0, this.tableBasket.rim, 0)), r: 0.17, prio: 4, max: 130, glow: hinted }
      case 'oven':
        return { at: new Vector3(OVEN[0], 0.7, OVEN[2] + 0.2), r: 0.35, prio: 2, max: 150, glow: this.ovenReady }
      case 'farmer':
        return { at: this.house.farmer.root.position.clone().add(new Vector3(0, 0.95, 0)), r: 0.3, prio: 1, max: 130 }
      case 'view':
        return { at: new Vector3(TX + 1.4, 1.5, -3), r: 0.5, prio: 0, max: 140 }
    }
    return null
  }

  protected hintAt() {
    const id = this.hintTarget()
    if (!id) return null
    if (id.startsWith('bag:')) return this.bags[Number(id.slice(4))].at.clone().add(new Vector3(0, -0.04, 0.1))
    if (id === 'tbasket') return this.tableBasket.root.position.clone().add(new Vector3(0, this.tableBasket.rim, 0))
    if (id === 'oven') return new Vector3(OVEN[0], 0.75, OVEN[2] + 0.35)
    if (id === 'pizza') return this.pie.position.clone()
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'mushrooms',
      phase: this.phase,
      round: this.round,
      grown: this.grownCount(),
      bags: this.bags.map((b) => ({ at: pt(b.at), water: Math.round(b.water * 100) / 100, stage: b.stage, color: b.color, giant: b.giant })),
      basket: formatBasket(this.basket),
      picks: this.picks,
      spraying: this.spray.on || this.time < this.spray.until,
      carried: this.carried?.i ?? null,
      hat: Math.round(this.hatK * 100) / 100,
      inBasket: this.inBasket().length,
      onPizza: this.onPizza(),
      ovenReady: this.ovenReady,
      baking: !!this.bake,
      baked: this.baked,
      served: this.served,
      slices: this.wedges.map((w) => w.owner ?? w.where),
      people: [this.kaylee, this.nick, this.ji].map((c) => [c.pose, pt(c.rig.head.getWorldPosition(new Vector3()))]),
      touches: this.touches,
      points: {
        basket: pt(this.houseBasket.root.position.clone().add(new Vector3(0, 0.15, 0))),
        tbasket: pt(this.tableBasket.root.position.clone().add(new Vector3(0, this.tableBasket.rim, 0))),
        pizza: pt(new Vector3(PIZZA.x, PIZZA.y, PIZZA.z)),
        oven: pt(new Vector3(OVEN[0], 0.7, OVEN[2] + 0.2)),
      },
    }
  }

  dispose() {
    this.hose.geometry.dispose()
    super.dispose()
  }
}
