// Cafe & Cake in Harbor Town (plan: planning/around-the-world/thailand/mall-trip.md, "4. Cafe & Cake"), greybox:
// shapes and sounds, with the voices (lines.ts L.mall.cafe). Kaylee in her apron and chef's hat stands at the counter; Daddy and Mommy are the
// customers at its end.
//
// The toy is the blender:
//   - Drag fruit from the tray into the jar (a tap sends it in for her). It drops in whole, in its own color.
//   - Press the big pink button: whirrrr, the jar shakes, the fruit's colors swirl round and melt into one (the color
//     is a paint-style mix of what she put in, liquid.ts). Lid off? It splats the ceiling, and the lid hops on.
//   - Grab the jar and bring it to a cup: it tips as it gets there (the closer, the more), pours in a stream and fills
//     the cup; a cup can overflow (it drips). Each cup has a pull round it, so the stream finds it on an iPhone too.
//     A tap on the jar pours for her.
//   - Whipped cream and a straw on top: the straw is "done", and the cup goes to whoever ordered it. They drink it,
//     happily, whatever it is; a drink that matches the order gets an extra yum. Ice in it: Daddy gets brain freeze.
// Three rounds, a step deeper each: (1) blend anything, every color is right; (2) orders in picture bubbles (pink:
// strawberry and banana); (3) Thai drinks, two cups at once: cha yen (orange tea poured over ice, milk on top from the
// milk jug, poured the same way) and a coconut shake. Each finished drink lines up on the shelf.
// Things to poke: the fridge, the coffee machine, the bread baskets, the cake stand, the tea set, the family.
import { Color, Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, OctahedronGeometry, Quaternion, Vector2, Vector3, type BufferGeometry, type Object3D, type WebGLRenderer } from 'three'
import { bell, wobble, type Line } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import type { Member } from '../../../../characters/member'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { L } from '../../../../lines'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { Floaters, heartGeometry, Splats } from './fx'
import { buildKitchen, type Kitchen } from './kitchen'
import { BASE_H, BEAM, BLENDER, CUP, CUP_SPOTS, CUSTOMERS, CUSTOMERS_TALL, EARLIER, ICONS, isFruit, JAR, JUICE, KAYLEE_AT, LID_REST, ROOM, ROUNDS, SHELF, TRAY, type Customer, type Fruit, type ItemId, type Order, type Round } from './layout'
import { mix, setFlat, setStripes } from './liquid'
import { buildBlender, buildCup, buildItem, buildStrawPot, JAR_FILL_H, type Blender, type Cup } from './props'
import { cafeSfx as sfx } from './sounds'

/** What a customer's thought bubble shows: the order's pictures and the color it makes. */
export interface Bubble {
  icons: string[]
  color: string | null
}

export interface CafeEvents extends LegEvents {
  /** The round now (the address bar follows). */
  round(n: Round): void
  /** A drink was served (the sock band's cafe sticker comes with the first). */
  drink(): void
  /** What each customer is waiting for (their thought bubbles). */
  bubbles(b: Partial<Record<Customer, Bubble>>): void
  /** All three rounds are done. */
  allDone(): void
}

const ALL_ITEMS: ItemId[] = [...new Set(Object.values(ROUNDS).flatMap((r) => r.tray))]
const LABELS: Record<ItemId, string> = { mango: 'Mango', strawberry: 'Strawberry', watermelon: 'Watermelon', banana: 'Banana', coconut: 'Coconut', tea: 'Thai tea', ice: 'Ice', milk: 'Milk jug', cream: 'Whipped cream', straw: 'Straws' }
export const CAFE_ANCHORS: AnchorInfo[] = [
  ...ALL_ITEMS.map((id): AnchorInfo => ({ id: `item:${id}`, label: LABELS[id], kind: 'thing' })),
  { id: 'jar', label: 'Blender jar', kind: 'thing' },
  { id: 'button', label: 'Blender button', kind: 'thing' },
  { id: 'lid', label: 'Lid', kind: 'thing' },
  { id: 'cup:0', label: 'Cup', kind: 'thing' },
  { id: 'cup:1', label: 'Second cup', kind: 'thing' },
  { id: 'fridge', label: 'Fridge', kind: 'thing' },
  { id: 'coffee', label: 'Coffee machine', kind: 'thing' },
  { id: 'bread', label: 'Bread baskets', kind: 'thing' },
  { id: 'cake', label: 'Cake stand', kind: 'thing' },
  { id: 'tea', label: 'Tea set', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
]

/** Pixels: what she holds sits this far above her finger (so the finger doesn't hide it). */
const LIFT_PX = 34
/** Held things move on this plane (the counter's front edge). */
const HOLD_Z = 0.12
/** Where the jar rests on the base (its middle). */
const JAR_HOME = new Vector3(BLENDER[0], BLENDER[1] + BASE_H + JAR.h / 2 + 0.012, BLENDER[2])
/** How far the jar tips to pour (radians), and from how far it starts pouring. */
const TIP = 1.85
const POURS_AT = 0.95
/** A full cup holds this much of a jar. */
const CUP_OF_JAR = 0.4
const WHITE = new Color('#FFFFFF')
/** Things on the tray are toy-sized, bigger than life so they're easy to see and grab (bigger still on a tall
 *  screen, where there's room below the counter). */
let ITEM_SCALE = 1.5

interface CupState {
  cup: Cup
  spot: number
  order: Order
  fill: number
  color: Color
  milk: number
  parts: Set<string>
  cream: boolean
  straw: boolean
  served: boolean
  /** Seconds since something last poured into it. */
  quiet: number
  pop: number
}
interface Chunk {
  id: Fruit | 'cream'
  g: Group
}
interface Flight {
  obj: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  arc: number
  spin: number
  scale?: [number, number]
  done?: () => void
}
type Pourer = 'jar' | 'milk'
interface Held {
  what: string
  x: number
  y: number
  x0: number
  y0: number
  moved: boolean
  /** What follows her finger: a fruit or a straw from the tray (the tray keeps its own), or the thing itself. */
  g?: Group
}
interface Guest {
  m: Member
  id: Customer
  drinking: { c: CupState; t: number; match: boolean; ice: boolean } | null
  freeze: number
  arm: number
  cream: Group
  creamT: number
}

/** The family's silly reactions: at most one line this often (seconds), so talk stays short and play long. */
const SILLY_GAP = 12
const C = L.mall.cafe

const tmp = new Vector3()
const right = new Vector3()
const qz = new Quaternion()
const Y = new Vector3(0, 1, 0)

export class CafeStage extends Stage {
  private kitchen: Kitchen
  private blender: Blender
  private kaylee: Avatar
  private guests = new Map<Customer, Guest>()
  private round: Round
  private orderIx = 0
  private phase: 'play' | 'between' | 'done' = 'play'
  private cups: CupState[] = []
  private shelf: Group[] = []
  // ---- The jar ----
  private chunks: Chunk[] = []
  private level = 0
  private color = new Color('#FFFFFF')
  private parts = new Set<string>()
  private lidOn = false
  private lidPop = 1
  private onBase = true
  /** How far each pourer is tipped (radians). */
  private tilts: Record<Pourer, number> = { jar: 0, milk: 0 }
  private blend: { t: number; dur: number; from: number; to: number; final: Color; splat: boolean; hit: boolean } | null = null
  private splatted = 0
  // ---- The tray ----
  private items = new Map<ItemId, Group>()
  private homes = new Map<ItemId, Vector3>()
  private boards = new Map<string, Group>()
  private pops = new Map<Group, number>()
  private models = new Map<ItemId | 'puff', Group>()
  private trayStep = 0.46
  // ---- Her finger ----
  private held: Held | null = null
  private auto: { what: Pourer; t: number; cup: CupState | null; home: Vector2 } | null = null
  private pourTo: { kind: 'cup'; c: CupState } | { kind: 'jar' } | null = null
  private lastX = 0
  private vx = 0
  private stream: Mesh
  private streamMat: MeshBasicMaterial
  private trickleT = 0
  private puddle: Mesh
  private puddleK = 0
  private flights: Flight[] = []
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  // ---- Effects ----
  private drops: Floaters
  private steam: Floaters
  private hearts: Floaters
  private sparkles: Floaters
  private splats: Splats
  private drip = 0
  private tall = false
  private bubbleEls = new Map<Customer, HTMLElement>()
  private shownBubbles = ''
  // ---- The pokeables ----
  private fridgeT = 1
  private coffeeT = 1
  private breadT = [1, 1, 1, 1]
  private cakeSpin = 0
  private teaT = 1
  private lampSwing = 0
  private kayleeReach = 0
  // The voices: when someone last said something silly, which idle spell the hint was said for, the first-time
  // lines and facts said, each customer's yum line next.
  private sillySaid = -99
  private hintFor = -1
  private told = new Set<string>()
  private yumN: Record<Customer, number> = { nick: 0, ji: 0 }

  constructor(renderer: WebGLRenderer, private cev: CafeEvents, start: { round: Round }) {
    super(renderer, cev)
    const { scene, bag } = this
    scene.background = new Color('#FFF1F6')
    this.rig.fov = 30
    this.round = start.round
    this.kitchen = buildKitchen(bag)
    scene.add(this.kitchen.root)
    // ---- Kaylee in her apron and chef's hat; Daddy and Mommy are the customers ----
    const { kaylee, members } = this.makeFamily(['nick', 'ji'])
    this.kaylee = kaylee
    kaylee.wear(['apron', 'chef-hat'])
    scene.add(kaylee.root)
    this.put(kaylee, KAYLEE_AT.x, 0, KAYLEE_AT.z, 'stand', KAYLEE_AT.face)
    for (const id of ['nick', 'ji'] as const) {
      const m = members.get(id)!
      m.root.userData.pick = `family:${id}`
      scene.add(m.root)
      // A dab of whipped cream that can end up on their nose.
      const cream = new Group()
      cream.add(new Mesh(bag.add(P.sphere(1, '#FFFDF8', { scale: [1, 0.8, 0.8] }, 12)), bag.add(new MeshBasicMaterial({ color: '#FFFDF8' }))))
      const f = m.rig.face
      cream.position.set(0, f.headY - 0.05 * f.R, 1.02 * f.R)
      cream.scale.setScalar(0.0001)
      m.rig.head.add(cream)
      this.guests.set(id, { m, id, drinking: null, freeze: 0, arm: 0, cream, creamT: 0 })
    }
    kaylee.root.userData.pick = 'family:kaylee'
    // ---- The blender ----
    const b = (this.blender = buildBlender(bag))
    b.base.position.set(...BLENDER)
    b.base.userData.pick = 'button'
    b.jar.userData.pick = 'jar'
    b.lid.userData.pick = 'lid'
    scene.add(b.base, b.jar)
    b.jar.position.copy(JAR_HOME)
    this.lidOn = start.round > 1
    this.placeLid()
    // ---- The stream and the puddle ----
    this.streamMat = bag.add(new MeshBasicMaterial({ color: '#ffffff' }))
    this.stream = new Mesh(bag.add(P.cyl(1, 0.8, 1, '#fff', { at: [0, -0.5, 0] }, 10)), this.streamMat)
    this.stream.visible = false
    scene.add(this.stream)
    this.puddle = new Mesh(bag.add(P.cyl(1, 1, 0.006, '#fff', {}, 20)), bag.add(new MeshBasicMaterial({ color: '#ffffff' })))
    this.puddle.visible = false
    scene.add(this.puddle)
    // ---- Effects ----
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), 160, bag, 6, 0.3, 0.02)
    this.steam = new Floaters(new IcosahedronGeometry(0.5, 1), 50, bag, -0.4, 1.2, -9)
    this.hearts = new Floaters(heartGeometry(), 30, bag, -0.5, 1)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), 90, bag, 1.2, 1.2)
    this.splats = new Splats(70, bag)
    for (const f of [this.drops.mesh, this.steam.mesh, this.hearts.mesh, this.sparkles.mesh, this.splats.mesh]) scene.add(f)
    // ---- The drinks from earlier rounds on the shelf ----
    const earlier = start.round === 3 ? 4 : start.round === 2 ? 2 : 0
    for (let i = 0; i < earlier; i++) {
      const c = buildCup(bag)
      this.dress(c, mix(EARLIER[i].map((f) => ({ color: JUICE[f].color, w: 1 }))), 0.3, true, true, false)
      this.toShelf(c.root, false)
    }
    this.layout()
    this.startRound(start.round, false)
  }

  setBubbleElements(els: Map<Customer, HTMLElement>) {
    this.bubbleEls = els
  }

  // ---------------------------------------------------------------- rounds and orders

  private startRound(r: Round, announce = true) {
    this.round = r
    this.phase = 'play'
    this.orderIx = 0
    if (announce) this.cev.round(r)
    this.setTray(ROUNDS[r].tray)
    const def = ROUNDS[r]
    // Sparkle says what's new this round (and Daddy says what he'd like).
    this.after(0.3, () => {
      if (r === 1) {
        this.cev.say(C.open)
        this.cev.say(C.thirsty)
      } else if (r === 2) this.cev.say(C.orders)
      else {
        this.cev.say(C.thai)
        this.cev.say(C.chaYen)
      }
    })
    if (def.together) def.orders.forEach((o, i) => this.newCup(o, i))
    else this.newCup(def.orders[0], 0)
  }

  private newCup(order: Order, spot: number) {
    const cup = buildCup(this.bag)
    cup.root.position.set(...CUP_SPOTS[spot])
    cup.root.userData.pick = `cup:${spot}`
    cup.ice.visible = !!order.ice
    this.scene.add(cup.root)
    const c: CupState = { cup, spot, order, fill: 0, color: new Color('#FFFFFF'), milk: 0, parts: new Set(order.ice ? ['ice'] : []), cream: false, straw: false, served: false, quiet: 9, pop: 0 }
    this.cups.push(c)
    this.play(sfx.pop)
    this.pushBubbles()
    // Round 2's picture orders, in the customer's own voice.
    if (this.round === 2 && order.want.length) this.after(0.35, () => this.cev.say(order.who === 'nick' ? C.pink : C.yellow))
  }

  /** What each customer waits for now: a cup (round 1), or their order's fruit and its color. */
  private pushBubbles() {
    const b: Partial<Record<Customer, Bubble>> = {}
    for (const c of this.cups) {
      if (c.served) continue
      const o = c.order
      b[o.who] = !o.want.length
        ? { icons: ['🥤'], color: null }
        : o.name === 'cha-yen'
          ? { icons: ['🧋', ICONS.ice], color: '#' + mix([{ color: JUICE.tea.color, w: 2 }, { color: '#FFFFFF', w: 1 }]).getHexString() }
          : { icons: o.want.map((f) => ICONS[f]), color: '#' + mix(o.want.map((f) => ({ color: JUICE[f].color, w: 1 }))).getHexString() }
    }
    const key = JSON.stringify(b)
    if (key === this.shownBubbles) return
    this.shownBubbles = key
    this.cev.bubbles(b)
  }

  /** The cup goes to whoever ordered it: they drink it up, then it lines up on the shelf. */
  private serve(c: CupState) {
    c.served = true
    const g = this.guests.get(c.order.who)!
    const match = c.order.want.every((f) => c.parts.has(f))
    this.pushBubbles()
    this.play(sfx.chime)
    this.fly(c.cup.root, () => this.mouth(g), 0.55, 0.35, 0, () => {
      g.drinking = { c, t: 0, match, ice: c.parts.has('ice') }
      this.play(sfx.slurp)
    })
  }

  private mouth(g: Guest) {
    const f = (g.m.root.rotation.y)
    return g.m.root.position.clone().add(new Vector3(Math.sin(f) * 0.32, 0.5 * g.m.height, Math.cos(f) * 0.32))
  }

  private drunk(g: Guest) {
    const d = g.drinking!
    g.drinking = null
    const c = d.c
    const head = this.headOf(g)
    // A yum in their own voice (a match, or anything in round 1), a happy surprise, or Daddy's brain freeze.
    const yum = C.yum[g.id]
    this.cev.say(d.ice && g.id === 'nick' ? C.freeze : d.match ? yum[this.yumN[g.id]++ % yum.length] : C.funny[g.id])
    if (d.match && c.order.want.length) {
      this.play(sfx.yum)
      this.sparkles.burst(head, 22, 1.8, 2.6, 1.1, 0.06, [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint])
      g.m.react('hop')
    } else {
      this.play(sfx.aah)
      g.m.react('wiggle')
      this.after(0.5, () => g.m.react('hop'))
    }
    for (let i = 0; i < 3; i++) this.hearts.emit(head.clone().add(new Vector3((i - 1) * 0.12, 0.1, 0.1)), new Vector3((i - 1) * 0.15, 0.45, 0.1), 1.4, 0.08, i % 2 ? PAL.pink : PAL.hotpink)
    if (d.ice && g.id === 'nick') {
      // Brain freeze: he shivers, frost round his head, brrrr, then he laughs it off.
      this.after(0.35, () => {
        g.freeze = 1.4
        this.play(sfx.brrr)
        this.sparkles.burst(head, 16, 1.0, 0.8, 1.2, 0.05, ['#BFE9FF', '#FFFFFF', '#8EC9F5'])
      })
      this.after(1.9, () => this.play(sfx.haha))
    }
    this.cev.drink()
    this.kaylee.react('hop')
    this.after(0.9, () => this.toShelf(c.cup.root, true, () => this.nextOrder(c)))
  }

  private nextOrder(c: CupState) {
    this.cups.splice(this.cups.indexOf(c), 1)
    const def = ROUNDS[this.round]
    if (!def.together && this.orderIx + 1 < def.orders.length) {
      this.orderIx++
      this.newCup(def.orders[this.orderIx], 0)
      return
    }
    if (this.cups.some((x) => !x.served)) return
    if (this.cups.length) return
    // The round is done: everyone cheers; then the next round (or the finale).
    this.phase = 'between'
    this.play(sfx.cheer)
    this.kaylee.react('hop')
    for (const g of this.guests.values()) g.m.react('wave')
    this.shelf.forEach((s, i) => this.after(i * 0.12, () => this.sparkles.burst(s.position.clone().add(new Vector3(0, 0.25, 0.1)), 5, 0.8, 1.6, 0.8, 0.04, [PAL.gold, '#FFFFFF'])))
    if (this.round < 3) this.after(1.8, () => this.startRound((this.round + 1) as Round))
    else this.after(1.2, () => this.finale())
  }

  /** All done: each drink on the shelf hops with a note, up the scale, then everyone cheers. */
  private finale() {
    this.phase = 'done'
    this.setTray([])
    this.shelf.forEach((s, i) =>
      this.after(i * 0.22, () => {
        this.pops.set(s, 0)
        this.play(() => sfx.shelf(i))
        this.sparkles.burst(s.position.clone().add(new Vector3(0, 0.25, 0.1)), 6, 0.8, 1.8, 0.8, 0.04, [PAL.gold, PAL.hotpink, '#FFFFFF'])
      }),
    )
    this.after(this.shelf.length * 0.22 + 0.3, () => {
      this.play(sfx.cheer)
      this.kaylee.react('hop')
      for (const g of this.guests.values()) g.m.react('hop')
      this.cev.say(C.allDone)
      this.cev.allDone()
    })
  }

  private toShelf(obj: Group, animate: boolean, done?: () => void) {
    const i = this.shelf.length
    this.shelf.push(obj)
    obj.userData.pick = undefined
    const at = new Vector3(SHELF.x0 + Math.min(i, SHELF.max - 1) * SHELF.step, SHELF.y, SHELF.z + 0.02)
    obj.rotation.set(0, 0, 0)
    if (!animate) {
      this.scene.add(obj)
      obj.position.copy(at)
      obj.scale.setScalar(0.72)
      return
    }
    this.fly(obj, () => at, 0.6, 0.45, 0, () => {
      this.play(() => sfx.shelf(i))
      done?.()
    }, [obj.scale.x, 0.72])
  }

  /** Sets a cup's look at once (the earlier rounds' drinks on the shelf). */
  private dress(c: Cup, color: Color, fill: number, cream: boolean, straw: boolean, ice: boolean) {
    c.liquid.visible = fill > 0.01
    c.liquid.scale.y = Math.max(0.0001, fill * CUP.h * 0.93)
    setFlat(c.liquidMat, color)
    c.cream.visible = cream
    c.straw.visible = straw
    c.ice.visible = ice
  }

  // ---------------------------------------------------------------- the tray

  private setTray(ids: ItemId[]) {
    for (const [id, g] of this.items) if (!ids.includes(id)) g.visible = false
    for (const id of ids) {
      let g = this.items.get(id)
      if (!g) {
        g = id === 'straw' ? buildStrawPot(this.bag) : buildItem(id, this.bag)
        g.userData.pick = `item:${id}`
        this.items.set(id, g)
        this.scene.add(g)
      }
      g.visible = true
      this.pops.set(g, 0)
    }
    this.layout()
  }

  /** A fresh one of something (a fruit off the tray, a straw, the cream's puff): copies share one model's geometry. */
  private copyOf(id: ItemId | 'puff') {
    let t = this.models.get(id)
    if (!t) {
      t = id === 'puff' ? solid(merge([P.sphere(0.09, '#FFFDF8', { at: [0, 0.06, 0], scale: [1, 0.7, 1] })]), this.bag, 1.5) : buildItem(id, this.bag)
      this.models.set(id, t)
    }
    return t.clone()
  }

  private get trayIds(): ItemId[] {
    return this.phase === 'done' ? [] : ROUNDS[this.round].tray
  }

  /** Where each thing rests: one row on a wide screen, two on a tall one (and the boards under them). */
  private layout() {
    this.tall = this.w < this.h
    ITEM_SCALE = this.tall ? 1.8 : 1.5
    for (const g of this.guests.values()) {
      const s = (this.tall ? CUSTOMERS_TALL : CUSTOMERS)[g.id]
      if (!g.drinking) this.put(g.m, s.x, 0, s.z, 'stand', s.face)
    }
    for (const b of this.boards.values()) b.visible = false
    const ids = this.trayIds
    const n = ids.length
    if (!n) return
    const rows = this.tall ? [ids.slice(0, Math.ceil(n / 2)), ids.slice(Math.ceil(n / 2))] : [ids]
    this.trayStep = this.tall ? 0.74 : Math.min(0.5, 3.7 / n)
    const s = this.trayStep
    rows.forEach((row, r) => {
      if (!row.length) return
      const y = r ? TRAY.yB : TRAY.y
      const z = r ? TRAY.zB : TRAY.z
      const cx = this.tall ? 0.2 : 0.15
      row.forEach((id, i) => this.homes.set(id, new Vector3(cx + (i - (row.length - 1) / 2) * s, y, z)))
      const key = `${r}:${row.length}:${s.toFixed(2)}:${cx}`
      let b = this.boards.get(key)
      if (!b) {
        const wide = row.length * s + 0.1
        b = new Group()
        b.add(solidBoard(wide, y, z, cx, this.bag))
        this.boards.set(key, b)
        this.scene.add(b)
      }
      b.visible = true
    })
    for (const id of ids) {
      const g = this.items.get(id)
      if (g && this.isHome(id)) this.rest(id, g)
    }
  }

  private isHome(id: ItemId) {
    const g = this.items.get(id)
    return !!g && !(this.held?.what === `item:${id}` && this.held.moved && !this.held.g) && !(this.auto?.what === id) && !this.flights.some((f) => f.obj === g)
  }
  private rest(id: ItemId, g: Group) {
    const h = this.homes.get(id)
    if (!h) return
    g.position.copy(h)
    // (The milk jug is built round its middle, so it can tip round her finger.)
    if (id === 'milk') g.position.y += 0.085 * ITEM_SCALE
    g.rotation.set(0, 0, 0)
    g.scale.setScalar(ITEM_SCALE)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    const k = this.kitchen
    return [...[...this.items.values()].filter((g) => g.visible), this.blender.jar, this.blender.base, this.blender.lid, ...this.cups.map((c) => c.cup.root), k.fridge.root, k.coffee.root, k.bread.root, k.cake.root, k.tea.root, this.kaylee.root, ...[...this.guests.values()].map((g) => g.m.root)]
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined) return
    const what = id ?? this.pick(x, y)
    if (!what || this.phase === 'done' || this.auto) return
    if (what.startsWith('item:') || what === 'lid' || (what === 'jar' && this.onBase && !this.blend)) this.held = { what, x, y, x0: x, y0: y, moved: false }
    this.lastX = x
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    const h = this.held
    if (!h || !isHeld) return
    h.x = x
    h.y = y
    this.lastTouch = this.time
    if (!h.moved && Math.hypot(x - h.x0, y - h.y0) > 10) {
      h.moved = true
      this.touches++
      this.play(sfx.fwip)
      const id = h.what.slice(5) as ItemId
      if (h.what === 'item:tea') this.once('cha-yen', C.chaYenFact)
      // A fruit or a straw: a fresh one comes off the tray (the tray never runs out).
      if (h.what.startsWith('item:') && id !== 'milk' && id !== 'cream') {
        h.g = this.copyOf(id)
        this.scene.add(h.g)
        this.pops.set(this.items.get(id)!, 0)
      }
      if (h.what === 'jar') {
        this.onBase = false
        this.play(sfx.pickup)
      }
    }
  }

  pointerUp() {
    const h = this.held
    this.held = null
    if (!h?.moved) return
    this.release(h)
  }

  /** Let go of what she's carrying: into the jar, onto a cup, onto someone, or back where it came from. */
  private release(h: Held) {
    const tip = new Vector2(h.x, h.y - LIFT_PX)
    if (h.what === 'jar' || h.what === 'item:milk') {
      this.pourTo = null
      this.stream.visible = false
      if (h.what === 'jar') this.jarHome()
      else this.itemHome('milk')
      return
    }
    if (h.what === 'lid') {
      if (this.nearJarMouth(tip)) this.putLid(true)
      else this.putLid(false)
      return
    }
    const id = h.what.slice(5) as ItemId
    const g = h.g ?? this.items.get(id)!
    const cup = this.cupAt(tip)
    const guest = this.guestAt(tip)
    if (id === 'cream') {
      if (cup) this.creamOn(cup)
      else if (guest) this.creamNose(guest)
      else if (this.nearJarMouth(tip) && this.onBase) this.intoJar('cream', null)
      this.itemHome('cream')
      return
    }
    if (id === 'straw') {
      if (cup && !cup.straw) {
        this.strawIn(cup)
        g.removeFromParent()
      } else this.fly(g, () => this.homes.get('straw')!.clone().add(new Vector3(0, 0.1, 0)), 0.35, 0.15, 0, () => g.removeFromParent())
      return
    }
    // A fruit: into the jar, or a customer eats it, or back to the tray.
    if (isFruit(id)) {
      if (this.nearJarMouth(tip) && this.onBase) return this.intoJar(id, g)
      if (guest) {
        g.removeFromParent()
        this.play(sfx.chomp)
        guest.m.react('hop')
        this.after(0.3, () => this.play(sfx.munch))
        return
      }
      this.fly(g, () => this.homes.get(id)?.clone() ?? g.position.clone(), 0.35, 0.2, 0, () => g.removeFromParent())
    }
  }

  protected onTap(id: string | null) {
    if (!id) return
    if (id.startsWith('item:')) return this.tapItem(id.slice(5) as ItemId)
    if (id.startsWith('cup:')) {
      const c = this.cups.find((x) => x.spot === Number(id.slice(4)) && !x.served)
      if (c) {
        c.pop = 0
        this.play(c.fill > 0.05 ? sfx.plink : sfx.boop)
      }
      return
    }
    switch (id) {
      case 'button':
        return this.press()
      case 'jar':
        if (this.blend || !this.onBase) return
        if (this.level > 0.02) this.autoPour('jar')
        else {
          this.pops.set(this.blender.jar as Group, 0)
          this.play(this.chunks.length ? sfx.squeak : sfx.boop)
        }
        return
      case 'lid':
        return this.putLid(!this.lidOn)
      case 'fridge':
        this.fridgeT = 0
        this.play(sfx.creak)
        this.after(0.3, () => sfx.clink())
        return
      case 'coffee':
        this.coffeeT = 0
        this.play(sfx.steam)
        this.after(0.9, () => {
          const d = this.guests.get('nick')!
          d.m.react('hop')
          sfx.haha()
          this.sillySays(C.coffee)
        })
        return
      case 'bread':
        this.breadT = [0, -0.1, -0.2, -0.3]
        this.play(sfx.boing)
        this.after(0.15, () => sfx.boing())
        return
      case 'cake':
        this.cakeSpin = Math.min(14, this.cakeSpin + 9)
        this.play(sfx.spin)
        return
      case 'tea':
        this.teaT = 0
        this.play(sfx.fwip)
        this.after(0.35, () => sfx.trickle())
        this.after(0.55, () => sfx.trickle())
        this.after(1.1, () => {
          const m = this.guests.get('ji')!
          m.m.react('wave')
          sfx.aah()
          this.sillySays(C.teaCup)
          this.hearts.emit(this.headOf(m), new Vector3(0, 0.5, 0.1), 1.3, 0.09, PAL.hotpink)
        })
        return
      case 'family:kaylee':
        this.kaylee.react('hop')
        this.play(sfx.giggle)
        return
      case 'family:nick':
      case 'family:ji': {
        const g = this.guests.get(id.slice(7) as Customer)!
        if (g.drinking) return
        g.m.react('hop')
        this.play(g.id === 'nick' ? sfx.haha : sfx.giggle)
        return
      }
    }
  }

  /** A tap on something on the tray: it goes and does its thing by itself. */
  private tapItem(id: ItemId) {
    const g = this.items.get(id)
    if (!g || !g.visible || this.phase === 'done') return
    if (id === 'tea') this.once('cha-yen', C.chaYenFact)
    if (id === 'milk') return this.autoPour('milk')
    if (id === 'cream') {
      const c = this.bestCup((x) => !x.cream && x.fill > 0.3) ?? this.bestCup((x) => !x.cream)
      this.pops.set(g, 0)
      if (!c) return this.play(sfx.squeak)
      return this.fly(g, () => this.cupTop(c).add(new Vector3(0, 0.12, 0)), 0.4, 0.25, 0, () => {
        this.creamOn(c)
        this.itemHome('cream')
      })
    }
    if (id === 'straw') {
      const c = this.bestCup((x) => !x.straw && x.fill >= 0.85) ?? this.bestCup((x) => !x.straw && x.fill > 0.05) ?? this.bestCup((x) => !x.straw)
      if (!c) return this.play(sfx.squeak)
      const s = this.copyOf('straw')
      s.position.copy(g.position).add(new Vector3(0, 0.1, 0))
      this.scene.add(s)
      this.play(sfx.fwip)
      return this.fly(s, () => this.cupTop(c), 0.4, 0.25, 0, () => {
        s.removeFromParent()
        this.strawIn(c)
      })
    }
    if (!isFruit(id) || !this.onBase) return
    const f = this.copyOf(id)
    f.position.copy(g.position)
    f.scale.setScalar(ITEM_SCALE)
    this.scene.add(f)
    this.pops.set(g, 0)
    this.play(sfx.fwip)
    this.fly(f, () => this.jarMouth(), 0.5, 0.45, 2, () => this.intoJar(id, f))
  }

  // ---------------------------------------------------------------- the jar

  private jarMouth() {
    return this.blender.jar.localToWorld(new Vector3(0, JAR.h / 2 + 0.05, 0))
  }
  private get chunkVol() {
    return this.chunks.reduce((a, c) => a + JUICE[c.id].vol, 0)
  }

  /** Something drops into the jar (a full jar bounces it back out). */
  private intoJar(id: Fruit | 'cream', g: Group | null) {
    const vol = JUICE[id].vol
    if (this.level + this.chunkVol + vol > 1.08 || this.blend) {
      this.play(sfx.boing)
      if (g) this.fly(g, () => (this.homes.get(id as ItemId) ?? g.position).clone(), 0.45, 0.4, 3, () => g.removeFromParent())
      return
    }
    if (this.lidOn) {
      // The lid flips up to let it in, and drops back.
      this.lidPop = 0
      this.play(() => sfx.lid(false))
      this.after(0.4, () => sfx.lid(true))
    }
    // (The cream goes in as a white puff.)
    const chunk = g ?? this.copyOf(id === 'cream' ? 'puff' : id)
    if (id === 'cream') chunk.position.copy(this.jarMouth())
    const i = this.chunks.length
    this.scene.updateMatrixWorld()
    this.blender.chunks.attach(chunk)
    const to = new Vector3(Math.cos(i * 2.4) * 0.035, this.level * JAR_FILL_H + 0.01 + i * 0.04, Math.sin(i * 2.4) * 0.03)
    this.chunks.push({ id, g: chunk })
    this.flightsLocal.push({
      obj: chunk,
      from: chunk.position.clone(),
      to: () => to,
      t: 0,
      dur: 0.28,
      arc: 0,
      spin: 1,
      scale: [Math.max(chunk.scale.x * 0.8, 0.3), 0.5],
      done: () => {
        this.play(sfx.plunk)
        // The first fruit in: Sparkle shows her the button.
        if (id !== 'cream') this.once('button', C.button)
        if (this.level > 0.05) this.drops.burst(this.jarMouth(), 6, 0.5, 1.2, 0.5, 0.025, ['#' + this.color.getHexString()])
        this.kaylee.react('wiggle')
      },
    })
  }
  /** Flights inside the jar (local to it). */
  private flightsLocal: Flight[] = []

  /** The big pink button: whirrrr (or a splat, with the lid off). */
  private press() {
    const b = this.blender
    b.button.position.z = 0.135
    this.after(0.15, () => (b.button.position.z = 0.15))
    if (this.blend) return this.play(sfx.boop)
    if (!this.onBase) {
      this.play(sfx.boop)
      return
    }
    const has = this.chunks.length > 0 || this.level > 0.02
    this.play(() => sfx.whirr(has ? 1.6 : 0.8))
    const parts = [...(this.level > 0 ? [{ color: this.color, w: this.level }] : []), ...this.chunks.map((c) => ({ color: JUICE[c.id].color, w: JUICE[c.id].vol }))]
    const final = mix(parts)
    setStripes(b.liquidMat, [...(this.level > 0.02 ? [this.color.clone()] : []), ...this.chunks.map((c) => new Color(JUICE[c.id].color))])
    b.liquidMat.uniforms.uFlat.value.copy(final)
    this.blend = { t: 0, dur: has ? 1.7 : 0.8, from: this.level, to: Math.min(1, this.level + this.chunkVol), final, splat: !this.lidOn && has, hit: false }
  }

  /** Lid off and something inside: it all shoots up and splats the ceiling, and drips. The lid hops on after. */
  private splat() {
    const parts = [...(this.level > 0.02 ? [{ color: this.color, w: this.level }] : []), ...this.chunks.map((c) => ({ color: JUICE[c.id].color, w: JUICE[c.id].vol }))]
    const cols = [...new Set([mix(parts).getHexString(), ...this.chunks.map((c) => new Color(JUICE[c.id].color).getHexString())])].map((h) => '#' + h)
    const mouth = this.jarMouth()
    const amount = this.level + this.chunkVol
    const n = Math.round(10 + amount * 22)
    for (let i = 0; i < n; i++) {
      const x = BLENDER[0] + (Math.random() - 0.5) * (0.6 + amount * 1.6)
      const onBeam = Math.random() < 0.7
      const at = onBeam ? new Vector3(x, BEAM.y0 + 0.02 + Math.random() * (BEAM.y1 - BEAM.y0 - 0.04), BEAM.z + 0.155) : new Vector3(x * 1.2, 1.5 + Math.random() * 0.35, ROOM.back + 0.01)
      this.after(0.08 + Math.random() * 0.12, () => this.splats.add(at, 0.035 + Math.random() * 0.07, cols[i % cols.length]))
    }
    for (let i = 0; i < 40; i++) this.drops.emit(mouth, new Vector3((Math.random() - 0.5) * 1.6, 5 + Math.random() * 2.5, (Math.random() - 0.5) * 0.4), 1.1, 0.03 + Math.random() * 0.03, cols[i % cols.length])
    this.play(sfx.splat)
    this.splatted++
    this.drip = 4
    this.lampSwing = 1
    for (const c of this.chunks) c.g.removeFromParent()
    this.chunks = []
    this.level = 0
    this.parts.clear()
    this.blend = null
    this.kaylee.react('hop')
    this.after(0.35, () => {
      for (const g of this.guests.values()) g.m.react('hop')
      sfx.haha()
      this.sillySays(C.splat)
    })
    this.after(0.6, () => sfx.giggle())
    this.after(1.1, () => this.putLid(true))
  }

  private finishBlend() {
    const bl = this.blend!
    this.blend = null
    for (const c of this.chunks) {
      this.parts.add(c.id)
      c.g.removeFromParent()
    }
    this.chunks = []
    this.level = bl.to
    this.color.copy(bl.final)
    setFlat(this.blender.liquidMat, this.color)
    if (this.level > 0.02) {
      this.sparkles.burst(this.jarMouth().add(new Vector3(0, 0.05, 0)), 12, 1.0, 1.6, 0.8, 0.04, ['#' + this.color.getHexString(), '#FFFFFF', PAL.gold])
      this.play(sfx.chime)
      this.kaylee.react('hop')
      // The first blend: Sparkle shows her the pour.
      this.once('pour', C.pour)
    }
  }

  private placeLid() {
    const { lid, jar } = this.blender
    if (this.lidOn) {
      jar.add(lid)
      lid.position.set(0, JAR.h / 2, 0)
    } else {
      this.scene.add(lid)
      lid.position.set(...LID_REST)
    }
    lid.rotation.set(0, 0, 0)
  }

  private putLid(on: boolean) {
    const lid = this.blender.lid
    if (this.flights.some((f) => f.obj === lid)) return
    this.lidOn = on
    this.play(() => sfx.lid(on))
    this.fly(lid, () => (on ? this.blender.jar.localToWorld(new Vector3(0, JAR.h / 2, 0)) : new Vector3(...LID_REST)), 0.35, 0.25, 0, () => this.placeLid())
  }

  private jarHome() {
    const jar = this.blender.jar
    this.fly(jar, () => JAR_HOME.clone(), 0.32, 0.08, 0, () => {
      this.onBase = true
      this.tilts.jar = 0
      jar.rotation.set(0, 0, 0)
      this.play(sfx.thump)
    })
  }

  private itemHome(id: ItemId) {
    const g = this.items.get(id)
    if (!g) return
    if (id === 'milk') this.tilts.milk = 0
    this.fly(g, () => this.homes.get(id)!.clone().add(new Vector3(0, id === 'milk' ? 0.085 * ITEM_SCALE : 0, 0)), 0.35, 0.15, 0, () => {
      this.rest(id, g)
      this.play(sfx.thump)
    })
  }

  // ---------------------------------------------------------------- cups and toppings

  private cupTop(c: CupState) {
    return c.cup.root.position.clone().add(new Vector3(0, CUP.h, 0))
  }
  /** The best cup for something (the order waiting longest first). */
  private bestCup(ok: (c: CupState) => boolean) {
    return this.cups.find((c) => !c.served && !this.flying(c.cup.root) && ok(c)) ?? null
  }
  private flying(o: Object3D) {
    return this.flights.some((f) => f.obj === o)
  }

  private creamOn(c: CupState) {
    if (c.served) return
    c.cream = true
    c.pop = 0
    c.parts.add('cream')
    this.play(sfx.squirt)
    this.sparkles.burst(this.cupTop(c).add(new Vector3(0, 0.1, 0)), 6, 0.6, 1, 0.6, 0.03, ['#FFFFFF', PAL.pink])
  }
  private creamNose(g: Guest) {
    g.creamT = 4
    this.play(sfx.squirt)
    g.m.react('wiggle')
    this.after(0.4, () => (g.id === 'nick' ? sfx.haha() : sfx.giggle()))
  }
  private strawIn(c: CupState) {
    if (c.served) return
    c.straw = true
    c.pop = 0
    this.play(sfx.pop)
  }

  // ---------------------------------------------------------------- pouring

  /** A tap on the jar or the milk: it goes to the cup that needs it most, pours till it's full, and comes back. */
  private autoPour(what: Pourer) {
    if (this.auto || this.held) return
    const cup = what === 'milk' ? (this.bestCup((c) => c.order.name === 'cha-yen' && c.fill > 0.3 && c.milk < 0.25) ?? this.bestCup((c) => c.fill < 0.9)) : this.bestCup((c) => c.fill < 0.9 && c.order.want.some((f) => this.parts.has(f))) ?? this.bestCup((c) => c.fill < 0.9)
    if (!cup && what === 'jar') return this.play(sfx.boop)
    const at = what === 'jar' ? this.blender.jar.position : this.items.get('milk')!.position
    const s = this.toScreenPx(at, 0)
    if (what === 'jar') this.onBase = false
    this.auto = { what, t: 0, cup, home: new Vector2(s?.x ?? this.w / 2, (s?.y ?? this.h) + LIFT_PX) }
    this.play(sfx.pickup)
  }

  /** Where to hold a pourer so it pours into a target (its middle, up and to the left of the mouth). */
  private pourPoint(what: Pourer, mouth: Vector3) {
    return what === 'jar' ? mouth.clone().add(new Vector3(-0.21, 0.27, 0.06)) : mouth.clone().add(new Vector3(-0.11, 0.17, 0.06))
  }

  /** The synthetic finger of a tap's pour: to the cup, hold there till it's full, then let go. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto
    if (!a) return null
    a.t += dt
    const target = a.cup ? this.cupTop(a.cup) : this.jarMouth()
    const s = this.toScreenPx(this.pourPoint(a.what, target), 0)
    const empty = a.what === 'jar' && this.level <= 0.001
    const full = a.cup ? (a.what === 'milk' ? a.cup.milk >= 0.25 || a.cup.fill >= 1 : a.cup.fill >= 0.95) : this.level >= 0.95
    if (!s || a.t > 3.6 || (a.t > 0.6 && (empty || full || a.cup?.served))) {
      this.auto = null
      this.pourTo = null
      this.stream.visible = false
      if (a.what === 'jar') this.jarHome()
      else this.itemHome('milk')
      return null
    }
    const p = new Vector2(s.x, s.y + LIFT_PX)
    if (a.t < 0.4) return a.home.clone().lerp(p, a.t / 0.4)
    return p
  }

  /** A pourer follows the finger; near a cup it's pulled in and tips (the nearer, the more), and pours. */
  private trackPour(what: Pourer, finger: Vector2, dt: number) {
    const obj = what === 'jar' ? this.blender.jar : this.items.get('milk')!
    const hold = this.onPlane(finger.x, finger.y - LIFT_PX, HOLD_Z)
    // The targets: cups not yet served, and (for the milk) the jar.
    const targets: { t: { kind: 'cup'; c: CupState } | { kind: 'jar' }; mouth: Vector3 }[] = this.cups.filter((c) => !c.served && !this.flying(c.cup.root)).map((c) => ({ t: { kind: 'cup' as const, c }, mouth: this.cupTop(c) }))
    if (what === 'milk' && this.onBase && !this.blend) targets.push({ t: { kind: 'jar' }, mouth: this.jarMouth() })
    let best: (typeof targets)[number] | null = null
    let bestK = 0
    let bestP = hold
    for (const tg of targets) {
      const pp = this.pourPoint(what, tg.mouth)
      const s = this.toScreenPx(pp, 0.36)
      if (!s) continue
      const R = Math.max(96, s.r)
      const d = Math.hypot(finger.x - s.x, finger.y - LIFT_PX - s.y)
      const k = Math.max(0, Math.min(1, (1 - d / R) / 0.6))
      if (k > bestK) {
        bestK = k
        best = tg
        bestP = pp
      }
    }
    // Pulled toward where it pours, and tipped.
    obj.position.copy(hold).lerp(bestP, bestK * 0.75)
    this.vx = this.vx * 0.8 + (finger.x - this.lastX) * 0.2
    this.lastX = finger.x
    const goal = best ? bestK * TIP : Math.max(-0.3, Math.min(0.3, -this.vx * 0.012))
    const tilt = (this.tilts[what] += (goal - this.tilts[what]) * (1 - Math.exp(-dt * 10)))
    obj.rotation.set(0, 0, -tilt)
    // Pouring.
    const rate = Math.max(0, Math.min(1, (tilt - POURS_AT) / (TIP - POURS_AT)))
    const has = what === 'milk' ? 1 : this.level
    if (!best || rate <= 0 || has <= 0.001) {
      this.pourTo = null
      this.stream.visible = false
      return
    }
    this.pourTo = best.t
    const spout = obj.localToWorld(what === 'jar' ? new Vector3(JAR.r1 + 0.03, JAR.h / 2 - 0.01, 0) : new Vector3(0.1, 0.085, 0))
    let amt = rate * 0.7 * dt
    const color = what === 'milk' ? WHITE : this.color
    let surface: Vector3
    if (best.t.kind === 'cup') {
      const c = best.t.c
      if (what === 'jar') amt = Math.min(amt, this.level / CUP_OF_JAR)
      if (what === 'jar') this.level = Math.max(0, this.level - amt * CUP_OF_JAR)
      const before = c.fill
      // (Milk always finds room on top: it curls into the drink.)
      const into = what === 'milk' ? Math.min(amt, Math.max(0, 0.4 - c.milk)) : Math.min(amt, Math.max(0, 1 - c.fill))
      if (into > 0) {
        if (what === 'milk') c.milk += into
        else c.color.copy(mix([{ color: c.color, w: Math.max(0, c.fill - c.milk) }, { color: this.color, w: into }]))
        for (const p of what === 'milk' ? ['milk'] : this.parts) c.parts.add(p)
        c.fill = Math.min(1, c.fill + into)
      }
      c.quiet = 0
      surface = c.cup.root.position.clone().add(new Vector3(0, 0.02 + Math.min(1, before) * CUP.h * 0.93, 0))
      // Too much: it runs down the side onto the counter.
      if (amt - into > 0.0001 && Math.random() < dt * 30) {
        const side = Math.random() < 0.5 ? -1 : 1
        this.drops.emit(c.cup.root.position.clone().add(new Vector3(side * CUP.r1, CUP.h, 0.03)), new Vector3(side * 0.15, -0.2, 0.05), 0.7, 0.025, '#' + (what === 'milk' ? 'ffffff' : this.color.getHexString()))
        this.puddleAt(c.cup.root.position, what === 'milk' ? WHITE : this.color, dt)
        if (this.ready('overflow', 2.5)) this.after(0.2, () => sfx.giggle())
      }
    } else {
      // Milk into the jar: it goes in like everything else (a creamy blend).
      const into = Math.min(amt * CUP_OF_JAR, Math.max(0, 1 - this.level - this.chunkVol))
      if (into > 0) {
        this.color.copy(this.level > 0.01 ? mix([{ color: this.color, w: this.level }, { color: WHITE, w: into }]) : WHITE)
        this.level += into
        this.parts.add('milk')
        setFlat(this.blender.liquidMat, this.color)
      }
      surface = this.blender.jar.localToWorld(new Vector3(0, -JAR.h / 2 + 0.035 + this.level * JAR_FILL_H, 0))
    }
    // The stream: from the spout down to the drink's surface.
    this.stream.visible = true
    this.streamMat.color.copy(color)
    const len = Math.max(0.02, spout.y - surface.y)
    const end = new Vector3(surface.x, surface.y, surface.z)
    this.stream.position.copy(spout)
    tmp.copy(end).sub(spout).normalize()
    qz.setFromUnitVectors(Y.clone().negate(), tmp)
    this.stream.quaternion.copy(qz)
    const wid = (what === 'jar' ? 0.018 : 0.012) * (0.5 + rate * 0.6)
    this.stream.scale.set(wid, spout.distanceTo(end) || len, wid)
    if (Math.random() < dt * 20) this.drops.emit(end, new Vector3((Math.random() - 0.5) * 0.5, 0.6 + Math.random() * 0.4, 0.1), 0.35, 0.018, '#' + color.getHexString())
    this.trickleT -= dt
    if (this.trickleT <= 0) {
      this.trickleT = 0.14
      sfx.trickle()
    }
  }

  private puddleAt(at: Vector3, color: Color, dt: number) {
    this.puddle.visible = true
    this.puddle.position.set(at.x + 0.1, BLENDER[1] + 0.004, at.z + 0.1)
    ;(this.puddle.material as MeshBasicMaterial).color.copy(color)
    this.puddleK = Math.min(1, this.puddleK + dt * 0.8)
  }

  // ---------------------------------------------------------------- carrying things

  /** Fruit, a straw, the cream or the lid under her finger; the cream squirts when it's over a cup. */
  private trackCarry(h: Held, dt: number) {
    const id = h.what.slice(5) as ItemId
    const g = h.what === 'lid' ? this.blender.lid : (h.g ?? this.items.get(id))
    if (!g) return
    if (h.what === 'lid' && g.parent !== this.scene) {
      this.scene.attach(g)
      if (this.lidOn) {
        this.lidOn = false
        this.play(() => sfx.lid(false))
      }
    }
    const tip = new Vector2(h.x, h.y - LIFT_PX)
    const p = this.onPlane(tip.x, tip.y, HOLD_Z)
    g.position.copy(p)
    g.rotation.z = Math.max(-0.4, Math.min(0.4, (h.x - this.lastX) * -0.02)) + (id === 'cream' ? -0.25 : 0)
    g.scale.setScalar(ITEM_SCALE)
    this.lastX = h.x
    if (id === 'cream') {
      const c = this.cupAt(tip)
      if (c && !c.cream && this.ready('creamhold', 0.35)) this.creamOn(c)
    }
    void dt
  }

  // ---------------------------------------------------------------- what's under the finger

  private toScreenPx(world: Vector3, r: number) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: (Math.abs(e.x - c.x) * this.w) / 2 }
  }
  private onPlane(x: number, y: number, z: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }
  private near(tip: Vector2, world: Vector3, r: number, min: number) {
    const s = this.toScreenPx(world, r)
    if (!s) return Infinity
    const d = Math.hypot(tip.x - s.x, tip.y - s.y)
    return d < Math.max(min, s.r) ? d : Infinity
  }
  private nearJarMouth(tip: Vector2) {
    return this.near(tip, this.jarMouth(), 0.24, 80) < Infinity
  }
  private cupAt(tip: Vector2) {
    let best: CupState | null = null
    let bd = Infinity
    for (const c of this.cups) {
      if (c.served || this.flying(c.cup.root)) continue
      const d = this.near(tip, this.cupTop(c).add(new Vector3(0, 0.02, 0)), 0.17, 70)
      if (d < bd) {
        bd = d
        best = c
      }
    }
    return best
  }
  private guestAt(tip: Vector2) {
    for (const g of this.guests.values()) if (this.near(tip, this.headOf(g), 0.3, 70) < Infinity) return g
    return null
  }
  private headOf(g: Guest) {
    const f = g.m.rig.face
    return g.m.rig.head.localToWorld(new Vector3(0, f.headY, 0.3 * f.R))
  }

  // ---------------------------------------------------------------- little helpers

  private play(f: () => void) {
    f()
  }
  /** A silly reaction in someone's own voice, unless one was said a moment ago. */
  private sillySays(l: Line) {
    if (this.time - this.sillySaid < SILLY_GAP) return
    this.sillySaid = this.time
    this.cev.say(l)
  }
  /** A first-time line (what's new, a fact): said once. */
  private once(key: string, l: Line) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.cev.say(l)
  }
  /** Sparkle's hint, once each time the 👆 shows; passes `at` through. */
  private hint(l: Line, at: Vector3 | null) {
    if (at && this.hintFor !== this.lastTouch) {
      this.hintFor = this.lastTouch
      this.cev.say(l)
    }
    return at
  }
  private ready(key: string, every: number) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return false
    this.cool.set(key, this.time)
    return true
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Something flies (in world space) to a spot, in an arc, then `done`. */
  private fly(obj: Object3D, to: () => Vector3, dur: number, arc: number, spin: number, done?: () => void, scale?: [number, number]) {
    this.flights = this.flights.filter((f) => f.obj !== obj)
    this.scene.updateMatrixWorld()
    this.scene.attach(obj)
    this.flights.push({ obj, from: obj.position.clone(), to, t: 0, dur, arc, spin, scale, done })
  }

  // ---------------------------------------------------------------- every frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    // ---- Her finger (or a tap's pour) ----
    const h = this.held?.moved ? this.held : null
    if (h && (h.what === 'jar' || h.what === 'item:milk')) this.trackPour(h.what === 'jar' ? 'jar' : 'milk', new Vector2(h.x, h.y), dt)
    else if (h) this.trackCarry(h, dt)
    else {
      const f = this.autoFinger(dt)
      if (f && this.auto) this.trackPour(this.auto.what, f, dt)
    }
    if (!h || (h.what !== 'jar' && h.what !== 'item:milk')) {
      if (!this.auto && this.pourTo) {
        this.pourTo = null
        this.stream.visible = false
      }
    }
    // ---- Flying things ----
    for (const list of [this.flights, this.flightsLocal]) {
      for (const f of [...list]) {
        f.t += dt / f.dur
        const k = Math.min(1, f.t)
        const e = k < 1 ? 1 - Math.pow(1 - k, 2) : 1
        f.obj.position.lerpVectors(f.from, f.to(), e).y += bell(k) * f.arc
        if (f.spin) f.obj.rotation.z = f.spin * Math.PI * 2 * e
        if (f.scale) f.obj.scale.setScalar(f.scale[0] + (f.scale[1] - f.scale[0]) * e)
        if (k >= 1) {
          list.splice(list.indexOf(f), 1)
          if (f.spin) f.obj.rotation.z = 0
          f.done?.()
        }
      }
    }
    // ---- The blender ----
    const b = this.blender
    if (this.blend) {
      const bl = this.blend
      bl.t += dt
      const k = Math.min(1, bl.t / bl.dur)
      b.blades.rotation.y += dt * 40
      if (this.onBase) b.jar.position.set(JAR_HOME.x + Math.sin(t * 70) * 0.005, JAR_HOME.y + Math.abs(Math.sin(t * 55)) * 0.006, JAR_HOME.z)
      b.base.rotation.z = Math.sin(t * 80) * 0.01
      if (bl.splat && !bl.hit && bl.t > 0.35) {
        bl.hit = true
        this.splat()
      } else if (!bl.splat) {
        b.chunks.rotation.y += dt * 18 * Math.min(1, k * 3)
        for (const c of this.chunks) c.g.scale.setScalar(0.5 * Math.max(0.001, 1 - k * 1.4))
        const lv = bl.from + (bl.to - bl.from) * Math.min(1, k * 1.3)
        b.liquid.visible = lv > 0.01
        b.liquid.scale.y = Math.max(0.0001, lv * JAR_FILL_H)
        b.liquidMat.uniforms.uMix.value = Math.pow(k, 1.6)
        b.liquidMat.uniforms.uSpin.value = 4 * (1 - k)
        if (k >= 1) this.finishBlend()
      }
    } else {
      b.base.rotation.z = 0
      b.liquid.visible = this.level > 0.01
      b.liquid.scale.y = Math.max(0.0001, this.level * JAR_FILL_H)
      if (this.onBase && !this.flying(b.jar)) b.jar.position.copy(JAR_HOME)
    }
    b.liquidMat.uniforms.uTime.value = t
    if (!this.blend && this.onBase && !this.flying(b.jar)) {
      this.tilts.jar = 0
      b.jar.rotation.set(0, 0, 0)
    }
    // The lid flips up to let fruit in.
    this.lidPop = Math.min(1, this.lidPop + dt / 0.45)
    if (this.lidOn && b.lid.parent === b.jar) {
      b.lid.position.y = JAR.h / 2 + bell(this.lidPop) * 0.12
      b.lid.rotation.z = bell(this.lidPop) * 0.6
    }
    // ---- The cups ----
    for (const c of this.cups) {
      c.quiet += dt
      const cup = c.cup
      cup.liquid.visible = c.fill > 0.01
      cup.liquid.scale.y = Math.max(0.0001, Math.min(1, c.fill) * CUP.h * 0.93)
      const flat = c.milk > 0.001 ? mix([{ color: c.color, w: Math.max(0.001, c.fill - c.milk) }, { color: WHITE, w: c.milk * 0.6 }]) : c.color
      if (c.milk > 0.001 && c.fill - c.milk > 0.02) {
        // The milk curls through the drink (a cha yen's white swirl).
        setStripes(cup.liquidMat, [c.color, flat, WHITE])
        cup.liquidMat.uniforms.uFlat.value.copy(flat)
        cup.liquidMat.uniforms.uMix.value = 0.35
        cup.liquidMat.uniforms.uSpin.value = 0.15
        cup.liquidMat.uniforms.uTime.value = t
      } else setFlat(cup.liquidMat, c.milk > 0.001 ? WHITE : c.color)
      cup.ice.position.y = Math.max(0, Math.min(1, c.fill) * CUP.h * 0.93 - 0.14) + Math.sin(t * 2 + c.spot) * 0.004 * (c.fill > 0.4 ? 1 : 0)
      cup.cream.visible = c.cream
      cup.straw.visible = c.straw
      c.pop = Math.min(1, c.pop + dt / 0.45)
      if (!c.served && !this.flying(cup.root)) {
        cup.root.scale.setScalar(1 + wobble(c.pop, 2) * 0.18)
        if (c.straw && c.fill >= 0.85 && c.quiet > 0.35 && this.pourTo?.kind !== 'cup') this.serve(c)
      }
    }
    if (this.puddleK > 0) {
      this.puddleK = Math.max(0, this.puddleK - dt * 0.05)
      this.puddle.scale.set(0.05 + this.puddleK * 0.12, 1, 0.04 + this.puddleK * 0.08)
      this.puddle.visible = this.puddleK > 0.01
    }
    // ---- The customers ----
    const held = h ? (h.what === 'jar' ? b.jar : h.what === 'lid' ? b.lid : (h.g ?? this.items.get(h.what.slice(5) as ItemId))) : null
    const look = held?.position ?? (this.auto ? (this.auto.what === 'jar' ? b.jar.position : this.items.get('milk')!.position) : JAR_HOME)
    for (const g of this.guests.values()) {
      const d = g.drinking
      if (d) {
        d.t += dt
        const k = Math.min(1, d.t / 1.5)
        const m = this.mouth(g)
        d.c.cup.root.position.copy(m)
        const side = g.m.root.position.x > m.x ? 1 : -1
        d.c.cup.root.rotation.z = -side * bell(Math.min(1, d.t / 1.5)) * 0.5
        d.c.fill = Math.max(0.3, d.c.fill - dt * 0.5)
        d.c.cup.liquid.scale.y = Math.max(0.0001, d.c.fill * CUP.h * 0.93)
        g.m.lookAt(m.x, m.y, m.z)
        if (k >= 1) this.drunk(g)
      } else {
        // Watching, but turned half to her (so their faces show).
        tmp.copy(look).lerp(this.rig.camera.position, 0.5)
        g.m.lookAt(tmp.x, tmp.y, tmp.z)
      }
      g.m.update(dt, t)
      g.arm += ((d ? 1 : 0) - g.arm) * (1 - Math.exp(-dt * 8))
      g.m.rig.armR.rotation.x = -1.2 * g.arm
      if (g.freeze > 0) {
        g.freeze = Math.max(0, g.freeze - dt)
        g.m.root.rotation.z = Math.sin(t * 60) * 0.04 * Math.min(1, g.freeze * 2)
        if (Math.random() < dt * 14) this.sparkles.emit(this.headOf(g).add(new Vector3((Math.random() - 0.5) * 0.4, 0.15, 0.1)), new Vector3(0, 0.3, 0), 0.7, 0.035, '#BFE9FF')
      } else g.m.root.rotation.z = 0
      g.creamT = Math.max(0, g.creamT - dt)
      g.cream.scale.setScalar(Math.max(0.0001, Math.min(1, g.creamT * 3, (4 - g.creamT) * 8) * 0.09 * g.m.rig.face.R * 4))
    }
    // ---- Kaylee watches what she holds (and reaches for it) ----
    this.kaylee.lookAt(look.x, look.y, look.z)
    this.kaylee.update(dt, t)
    this.kayleeReach += ((held || this.blend ? 1 : 0) - this.kayleeReach) * (1 - Math.exp(-dt * 8))
    this.kaylee.rig.armR.rotation.x = -1.1 * this.kayleeReach
    // ---- The tray ----
    for (const [g, k] of this.pops) {
      const k2 = Math.min(1, k + dt / 0.45)
      this.pops.set(g, k2)
      const base = this.shelf.includes(g) ? 0.72 : g === b.jar ? 1 : ITEM_SCALE
      if (!this.flying(g) && (g === b.jar || this.shelf.includes(g) || [...this.items.values()].includes(g))) g.scale.setScalar(base * (1 + wobble(k2, 2) * 0.22))
      if (k2 >= 1) this.pops.delete(g)
    }
    // ---- The pokeables ----
    const kt = this.kitchen
    this.fridgeT = Math.min(1, this.fridgeT + dt / 1.6)
    kt.fridge.door.rotation.y = -1.5 * bell(Math.min(1, this.fridgeT * 1.3))
    kt.fridge.bottles.rotation.z = wobble(this.fridgeT, 5) * 0.02
    kt.fridge.bottles.position.y = Math.abs(wobble(this.fridgeT, 5)) * 0.015
    this.coffeeT = Math.min(1, this.coffeeT + dt / 3)
    kt.coffee.coffee.scale.y = Math.max(0.0001, Math.min(1, this.coffeeT * 3) * (this.coffeeT < 0.85 ? 1 : (1 - this.coffeeT) / 0.15) * 0.06)
    setFlat(kt.coffee.coffeeMat, COFFEE_COLOR)
    if (this.coffeeT < 0.4 && Math.random() < dt * 30) this.steam.emit(kt.coffee.root.position.clone().add(new Vector3((Math.random() - 0.5) * 0.15, 0.55, 0.05)), new Vector3((Math.random() - 0.5) * 0.15, 0.55, 0.05), 1.2, 0.06 + Math.random() * 0.04, '#FFFFFF')
    kt.coffee.root.rotation.z = this.coffeeT < 0.3 ? Math.sin(t * 50) * 0.008 : 0
    this.breadT = this.breadT.map((x) => Math.min(1, x + dt / 0.5))
    kt.bread.pretzels.forEach((p, i) => {
      const k = Math.max(0, this.breadT[i])
      p.position.y = 0.1 + bell(k) * 0.16
      p.rotation.z = bell(k) * (i % 2 ? 0.6 : -0.6)
    })
    this.cakeSpin *= Math.exp(-dt * 1.2)
    kt.cake.top.rotation.y += this.cakeSpin * dt
    this.teaT = Math.min(1, this.teaT + dt / 1.4)
    kt.tea.pot.rotation.z = -bell(Math.min(1, this.teaT * 1.4)) * 0.8
    kt.tea.pot.position.y = 0.02 + bell(Math.min(1, this.teaT * 1.4)) * 0.06
    if (this.teaT > 0.2 && this.teaT < 0.55 && Math.random() < dt * 30) this.drops.emit(kt.tea.cup.localToWorld(new Vector3(0, 0.12, 0)), new Vector3(0, -0.4, 0), 0.25, 0.012, '#D9883A')
    this.lampSwing = Math.max(0, this.lampSwing - dt / 2.5)
    kt.lamps.forEach((l, i) => (l.rotation.z = Math.sin(t * 6 + i) * 0.25 * this.lampSwing))
    // Drips off the ceiling after a splat.
    if (this.drip > 0) {
      this.drip -= dt
      if (Math.random() < dt * 10 * Math.min(1, this.drip)) {
        const x = BLENDER[0] + (Math.random() - 0.5) * 1.2
        this.drops.emit(new Vector3(x, BEAM.y0, BEAM.z + 0.16), new Vector3(0, -0.2, 0), 1.2, 0.025, '#' + this.color.getHexString())
      }
    }
    for (const f of [this.drops, this.steam, this.hearts, this.sparkles]) f.update(dt)
    this.splats.update(dt)
  }

  // ---------------------------------------------------------------- camera, anchors, hint

  setSize(w: number, h: number, top: number) {
    super.setSize(w, h, top)
    this.layout()
  }

  protected shot(): Shot {
    // The counter, the blender, the cups and the customers, the tray along the bottom, the ceiling beam along the top.
    if (this.w < this.h) return { center: new Vector3(0.25, 0.8, 0.75), half: new Vector3(1.42, 1.36, 0.6), yaw: 0, pitch: 12, minDist: 4 }
    return { center: new Vector3(0.12, 1.06, 0.4), half: new Vector3(1.88, 0.98, 0.5), yaw: 0, pitch: 9, minDist: 4 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const b = this.blender
    const pouring = !!(this.held?.moved && (this.held.what === 'jar' || this.held.what === 'item:milk')) || !!this.auto
    if (id.startsWith('item:')) {
      const iid = id.slice(5) as ItemId
      const g = this.items.get(iid)
      if (!g?.visible || !this.trayIds.includes(iid)) return null
      const home = this.homes.get(iid)
      const at = (this.isHome(iid) && home ? home : g.position).clone().add(new Vector3(0, 0.1, 0))
      return { at, r: this.tall ? 0.24 : this.trayStep * 0.47, prio: 3, max: this.tall ? 120 : 140 }
    }
    if (id.startsWith('cup:')) {
      const c = this.cups.find((x) => x.spot === Number(id.slice(4)) && !x.served)
      if (!c || this.flying(c.cup.root)) return null
      return { at: c.cup.root.position.clone().add(new Vector3(0, CUP.h * 0.55, 0)), r: 0.16, prio: 2, max: 110, glow: pouring }
    }
    switch (id) {
      case 'jar':
        return this.phase === 'done' && !this.level ? null : { at: b.jar.position.clone(), r: 0.17, prio: 3, max: 130 }
      case 'button':
        return { at: b.base.position.clone().add(new Vector3(0, BASE_H * 0.42, 0.15)), r: 0.16, prio: 4, max: 104 }
      case 'lid':
        // (Small while it's on the jar, so it doesn't take the jar's drag.)
        return { at: b.lid.getWorldPosition(new Vector3()).add(new Vector3(0, 0.03, 0)), r: this.lidOn ? 0.09 : 0.16, prio: this.lidOn ? 4 : 3, max: 96 }
      case 'fridge':
        return { at: this.kitchen.fridge.root.position.clone().add(new Vector3(0, 0.9, 0.35)), r: 0.34 }
      case 'coffee':
        return { at: this.kitchen.coffee.root.position.clone().add(new Vector3(0, 0.25, 0.15)), r: 0.2 }
      case 'bread':
        return { at: this.kitchen.bread.root.position.clone().add(new Vector3(0, 0.08, 0)), r: 0.2 }
      case 'cake':
        return { at: this.kitchen.cake.root.position.clone().add(new Vector3(0, 0.25, 0)), r: 0.2 }
      case 'tea':
        return { at: this.kitchen.tea.root.position.clone().add(new Vector3(0, 0.08, 0)), r: 0.17 }
      case 'family:kaylee':
        return { at: this.kaylee.root.position.clone().setY(0.8), r: 0.24, prio: 0, max: 110 }
      case 'family:nick':
      case 'family:ji': {
        const g = this.guests.get(id.slice(7) as Customer)!
        return { at: g.m.root.position.clone().setY(g.m.height * 0.6), r: 0.3, prio: 0, max: 130 }
      }
    }
    return null
  }

  /** The 👆 shows the next thing to do: a fruit the order needs, the button, the jar, the straw. */
  protected hintAt() {
    if (this.phase !== 'play' || this.auto || this.held?.moved || this.blend || this.flights.length) return null
    const open = this.cups.filter((c) => !c.served)
    const item = (id: ItemId) => this.homes.get(id)?.clone().add(new Vector3(0, 0.3, 0)) ?? null
    const done = open.find((c) => c.fill >= 0.85 && !c.straw)
    if (done) return this.hint(C.hint.straw, item('straw'))
    const chaYen = open.find((c) => c.order.name === 'cha-yen' && c.fill >= 0.85 && c.milk < 0.05 && !c.straw)
    if (chaYen) return this.hint(C.hint.milk, item('milk'))
    if (this.level > 0.08 && this.onBase) return this.hint(C.hint.jar, this.blender.jar.position.clone().add(new Vector3(0, 0.1, 0)))
    if (this.chunks.length >= 2 || (this.chunks.length && open.some((c) => c.order.want.every((f) => this.chunks.some((ch) => ch.id === f))))) return this.hint(C.hint.button, overButton(this.blender.base.position))
    const want = open.flatMap((c) => c.order.want).find((f) => !this.chunks.some((ch) => ch.id === f) && !this.parts.has(f))
    return this.hint(want === 'tea' ? C.hint.tea : want ? C.hint.want : C.hint.fruit, item(want ?? 'strawberry'))
  }

  placeAnchors() {
    super.placeAnchors()
    // The customers' thought bubbles ride above their heads.
    for (const [who, el] of this.bubbleEls) {
      const g = this.guests.get(who)
      const s = g ? this.toScreenPx(g.m.root.position.clone().add(new Vector3(0.05, g.m.height * 1.08, 0)), 0) : null
      el.style.display = s && this.phase !== 'done' ? '' : 'none'
      if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
    }
  }

  qa() {
    const px = (v: Vector3) => {
      const s = this.toScreenPx(v, 0)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const items: Record<string, number[] | null> = {}
    for (const id of this.trayIds) {
      const h = this.homes.get(id)
      if (h) items[id] = px(h.clone().add(new Vector3(0, 0.1, 0)))
    }
    const open = this.cups.filter((c) => !c.served)
    return {
      game: 'cafe',
      round: this.round,
      phase: this.phase,
      jar: { level: +this.level.toFixed(2), chunks: this.chunks.map((c) => c.id), parts: [...this.parts], lid: this.lidOn, onBase: this.onBase, color: '#' + this.color.getHexString(), blending: !!this.blend, tilt: +this.tilts.jar.toFixed(2) },
      milkTilt: +this.tilts.milk.toFixed(2),
      cups: open.map((c) => ({ who: c.order.who, fill: +c.fill.toFixed(2), milk: +c.milk.toFixed(2), cream: c.cream, straw: c.straw, parts: [...c.parts], color: '#' + c.color.getHexString() })),
      pouring: this.pourTo ? (this.pourTo.kind === 'cup' ? `cup:${this.pourTo.c.spot}` : 'jar') : null,
      shelf: this.shelf.length,
      splats: this.splatted,
      held: this.held?.moved ? this.held.what : (this.auto?.what ?? null),
      touches: this.touches,
      liftPx: LIFT_PX,
      items,
      jarAt: px(this.blender.jar.position),
      mouth: px(this.jarMouth()),
      button: px(this.blender.base.position.clone().add(new Vector3(0, BASE_H * 0.42, 0.15))),
      lidAt: px(this.blender.lid.getWorldPosition(new Vector3())),
      cupsAt: open.map((c) => px(this.cupTop(c))),
      /** Where her finger goes to pour the jar (or the milk) into each open cup. */
      pourAt: open.map((c) => {
        const p = px(this.pourPoint('jar', this.cupTop(c)))
        return p && [p[0], p[1] + LIFT_PX]
      }),
      milkAt: open.map((c) => {
        const p = px(this.pourPoint('milk', this.cupTop(c)))
        return p && [p[0], p[1] + LIFT_PX]
      }),
    }
  }
}

const COFFEE_COLOR = new Color('#7A4A2E')
/** Just above the blender's button (where the 👆 points). */
const overButton = (base: Vector3) => base.clone().add(new Vector3(0, BASE_H * 0.42 + 0.12, 0.15))

/** The tray's board: a white shelf on two legs, with a lavender edge. */
function solidBoard(wide: number, y: number, z: number, cx: number, bag: Bag) {
  const parts: BufferGeometry[] = [
    P.rbox(wide, 0.06, 0.38, 0.03, '#FFFFFF', { at: [cx, y - 0.03, z] }),
    P.box(wide, 0.05, 0.03, PAL.lavenderDark, { at: [cx, y - 0.01, z + 0.19] }),
    ...[-1, 1].map((sx) => P.cyl(0.025, 0.025, Math.max(0.02, y - 0.06), '#D8D2E6', { at: [cx + sx * (wide / 2 - 0.08), Math.max(0.01, (y - 0.06) / 2), z - 0.1] })),
  ]
  return solid(merge(parts), bag, 2)
}
