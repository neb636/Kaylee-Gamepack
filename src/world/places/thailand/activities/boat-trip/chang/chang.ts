// Baan Chang Cafe, the elephants in Krabi (plan: thailand/baan-chang.md), a world of its own inside the boat trip.
// The yard's toy: she pulls a banana or a stick of sugarcane out of Daddy's basket and holds it up over the rail. Every
// trunk in reach snakes after her finger, lagging and bending along its length; the first tip to touch the food curls
// round it (her finger lets go by itself), swings it up to the mouth, and the elephant munches, its ears flap and its
// belly gets a little rounder. Held high, the trunks stretch up; held low, they reach down over the boulders. A tap on
// a food (no drag) floats it to the hungriest trunk, and food let go far from every trunk falls on the gravel and gets
// snuffled up (or Daddy pops it back in the basket). Mali is big and slow and reaches further; Khanom is small, quick
// and always hungry. Three bites in a row and Mali burps. Taps: an elephant trumpets, the family hop.
//
// First, at the top of the boardwalk, the cafe (`drinks`, cafe.ts, greybox 3): she pours her chocolate milk, squeezes
// in the chocolate, stirs and picks a straw (and maybe makes Daddy an iced coffee); the 🐘 button takes them down to the
// yard, and her glass stands on a rail post there. Then the same verb deepens, one section after another (greybox 2):
//   feed       any food to any elephant; after a few, they start asking
//   favorites  a picture bubble over each head: what it wants and how many (Mali's three pips, "One! Two! Three!").
//              The wrong snack gets sniffed and passed through the air to whoever wanted it. Two rounds.
//   lamyai     Lamyai wanders over from the sala (her footsteps make the basket hop) and Daddy sits down on the bench:
//              three trunks at the rail, a new wish whenever one comes true. When her hands are still, Khanom's trunk
//              sneaks across to her chocolate milk on the rail post; a food held out turns him back, and a sip gives him
//              the hiccups and a chocolate moustache. After a dozen more, they're full.
//   splash     full and happy, they dip their trunks in the trough and spray it up over the family, under a rainbow.
//              A tap on an elephant: another spray.
// No voices yet (greybox).
import { Color, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, pick, sounds } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { sfx } from '../../../sfx'
import { wearing } from '../../../trip/packing'
import { Stage, type AnchorSpot, type LegEvents, type Rider } from '../../../trip/legs/stage'
import { Basket, type Food } from './basket'
import { Elephant } from './elephant'
import { CHANG_FEEL } from './feel'
import { Cafe } from './cafe'
import { BENCH, ELEPHANTS, FAMILY, HOLD, LAMYAI_BACK, SHOT, STRAW_COLORS, TOOLS_WIDE, TROUGH, type ElephantId, type FoodKind, type StrawColor } from './layout'
import { Milk, Splash, WantBubble } from './props'
import { tipOf } from './trunk'
import { buildYard } from './yard'

export type ChangSection = 'drinks' | 'feed' | 'favorites' | 'lamyai' | 'splash'

/** A link into a later section starts as if she had fed them this many already (rounder bellies). */
const FED_BEFORE: Record<ChangSection, number> = { drinks: 0, feed: 0, favorites: 8, lamyai: 18, splash: 30 }
/** One spray in the splash: dip, lift, spray, rest (seconds into its cycle). */
const DIP = 0.9
const LIFT = 1.4
const SPRAY_END = 2.7
const CYCLE = 3.6

/** What the yard tells the trip around it. */
export interface ChangEvents extends LegEvents {
  /** Another food eaten: how many so far (the address bar keeps it, so a link reproduces the bellies). */
  fed(n: number): void
  /** She put a straw in her chocolate milk (it rides along to the yard). */
  straw(c: StrawColor): void
  /** Her chocolate milk is ready: the 🐘 shows (and goes once they're on their way). */
  ready(on: boolean): void
  /** A white flash (the cut from the cafe down to the yard). */
  flash(): void
}

const TOOL_LABELS: Record<string, string> = { milk: 'Milk jug', choc: 'Chocolate', spoon: 'Spoon', ice: 'Ice', coffee: 'Coffee pot' }
export const CHANG_ANCHORS: AnchorInfo[] = [
  ...TOOLS_WIDE.map((id): AnchorInfo => ({ id: `tool:${id}`, label: TOOL_LABELS[id] ?? `${id.slice(6)} straw`, kind: 'thing' })),
  { id: 'glass:her', label: 'Her glass', kind: 'thing' },
  { id: 'glass:dad', label: "Daddy's glass", kind: 'thing' },
  { id: 'bell', label: 'Bell', kind: 'thing' },
  { id: 'food:banana', label: 'Banana', kind: 'thing' },
  { id: 'food:cane', label: 'Sugarcane', kind: 'thing' },
  { id: 'milk', label: 'Chocolate milk', kind: 'thing' },
  { id: 'ele:mali', label: 'Mali the elephant', kind: 'thing' },
  { id: 'ele:khanom', label: 'Khanom the baby elephant', kind: 'thing' },
  { id: 'ele:lamyai', label: 'Lamyai the elephant', kind: 'thing' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
]

type Mode = 'idle' | 'carry' | 'munch' | 'catch' | 'sneak' | 'sip' | 'spray' | 'walk'

interface Want {
  kind: FoodKind
  total: number
  left: number
}

interface Eater {
  e: Elephant
  mode: Mode
  t: number
  food: Food | null
  /** When it last started after a food (for the sniff, not every frame). */
  sniffed: number
  chasing: boolean
  /** At the rail (Lamyai isn't until she wanders over). */
  here: boolean
  /** What it wants (`favorites`, `lamyai`), and its bubble. */
  want: Want | null
  bubble: WantBubble
  /** Carrying the wrong snack to whoever wanted it; or waiting to catch one from `from`. */
  passTo: Eater | null
  from: Eater | null
  /** Where it is in its spray cycle (splash; below 0: not started). */
  sprayT: number
}

/** The food in her hand: where her finger is (screen px) and where it went down, or gliding to a trunk by itself. */
interface Held {
  food: Food
  x: number
  y: number
  sx: number
  sy: number
  moved: boolean
  auto: Eater | null
}

/** A wrong snack passed through the air from one trunk to another. */
interface Flight {
  food: Food
  from: Vector3
  to: Eater
  t: number
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const rest = new Vector3()
const other = (k: FoodKind): FoodKind => (k === 'banana' ? 'cane' : 'banana')

export class Chang extends Stage {
  private eaters: Eater[]
  private basket: Basket
  private milk: Milk
  private cafe: Cafe
  /** Everything of the yard's (hidden while she's at the cafe). */
  private yard: Object3D[] = []
  private straw: StrawColor
  private splash: Splash
  private riders: Record<'kaylee' | 'ji' | 'nick', Rider>
  private held: Held | null = null
  private flights: Flight[] = []
  private at: ChangSection
  private fed: number
  /** Foods eaten in this section (each one moves on after so many), the favorites' round and its first kind. */
  private stepFed = 0
  private round = 1
  private firstKind: FoodKind = 'cane'
  /** A move to the next section is on its way. */
  private moving = false
  /** Mali's bites lately (three in a row: a burp). */
  private maliBites: number[] = []
  private burpAt = -1
  private sneakCool = 0
  private stacheUntil = 0
  private sips = 0
  private sprays = 0
  private seated = false
  /** When this section began (Khanom doesn't sneak in the first moments). */
  private since = 0

  constructor(
    renderer: WebGLRenderer,
    protected events: ChangEvents,
    section: ChangSection,
    packed: string[],
    fed: number,
    straw: StrawColor,
  ) {
    super(renderer, events)
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    this.rig.fov = 32
    this.at = section
    this.fed = Math.max(fed, FED_BEFORE[section])
    this.straw = straw
    const yard = buildYard(bag)
    scene.add(yard)
    this.yard.push(yard)
    this.eaters = ELEPHANTS.map((spot) => {
      const e = new Elephant(bag, spot)
      e.setReach(CHANG_FEEL.reach)
      e.root.userData.pick = `ele:${spot.id}`
      const bubble = new WantBubble(bag)
      scene.add(e.root, e.trunk.root, bubble.root)
      this.yard.push(e.root, e.trunk.root, bubble.root)
      return { e, mode: 'idle' as Mode, t: 0, food: null, sniffed: -9, chasing: false, here: true, want: null, bubble, passTo: null, from: null, sprayT: -1 }
    })
    // Lamyai waits by the sala at the back until `lamyai` (a splash link: she's at the rail already).
    const lam = this.eater('lamyai')
    if (section !== 'splash') {
      lam.here = false
      lam.e.x = LAMYAI_BACK.x
      lam.e.z = LAMYAI_BACK.z
      lam.e.heading = LAMYAI_BACK.heading
    }
    // The bellies are as round as that many meals, shared out (Khanom always gets the extra one).
    const round = this.eaters.filter((x) => x.here || section === 'lamyai')
    round.forEach((x, i) => (x.e.full = Math.floor(this.fed / round.length) + (x.e.id === 'khanom' && i < this.fed % round.length ? 1 : 0)))
    this.basket = new Basket(bag, scene)
    scene.add(this.basket.root)
    this.milk = new Milk(bag, straw)
    scene.add(this.milk.root)
    this.splash = new Splash(bag)
    scene.add(this.splash.root)
    this.yard.push(this.basket.root, this.milk.root, this.splash.root)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    kaylee.wear(wearing(packed))
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')! }
    for (const id of ['kaylee', 'ji', 'nick'] as const) {
      const c = this.riders[id]
      const [x, z, face] = FAMILY[id]
      c.root.userData.pick = `family:${id}`
      scene.add(c.root)
      this.put(c, x, 0, z, 'stand', face)
    }
    if (section === 'splash') this.sitDaddy(true)
    // The cafe at the top of the boardwalk (a drinks link always starts with an empty glass).
    this.cafe = new Cafe(bag, {
      camera: () => this.rig.camera,
      size: () => ({ w: this.w, h: this.h }),
      ndc: (x, y) => this.ndc(x, y),
      riders: this.riders,
      put: (id, x, z, face) => this.put(this.riders[id], x, 0, z, 'stand', face),
      later: (ms, fn) => this.later(ms, fn),
      ready: () => this.events.ready(true),
      straw: (c) => {
        this.straw = c
        this.milk.setStraw(c)
        this.events.straw(c)
      },
    }, null)
    scene.add(this.cafe.root)
    this.cafe.root.visible = false
    this.begin(section, true)
  }

  /** The 🐘 at the cafe: down to the elephants (a white flash; the boardwalk walk comes in greybox 4). */
  toYard() {
    if (this.at !== 'drinks') return
    this.events.ready(false)
    this.events.flash()
    sfx.whoosh()
    this.begin('feed')
  }

  /** At the cafe or in the yard: what shows, and where the family stand. */
  private show(cafe: boolean) {
    if (this.cafe.root.visible === cafe && this.yard[0].visible === !cafe) return
    this.cafe.root.visible = cafe
    for (const o of this.yard) o.visible = !cafe
    if (cafe) this.cafe.enter()
    else
      for (const id of ['kaylee', 'ji', 'nick'] as const) {
        const [x, z, face] = FAMILY[id]
        this.put(this.riders[id], x, 0, z, 'stand', face)
      }
    this.rig.setShot(this.shot(), true)
  }

  private eater(id: ElephantId) {
    return this.eaters.find((x) => x.e.id === id)!
  }
  private later(ms: number, fn: () => void) {
    setTimeout(() => !this.disposed && fn(), ms)
  }

  // ---------------------------------------------------------------- the sections

  /** A section begins (`first`: the one the link opened, already in the address bar). */
  private begin(s: ChangSection, first = false) {
    this.at = s
    this.since = this.time
    this.stepFed = 0
    this.moving = false
    if (!first) this.events.section(s)
    this.show(s === 'drinks')
    if (s === 'favorites') {
      this.round = 1
      this.drawRound()
    } else if (s === 'lamyai') {
      // Lamyai sets off from the sala; the other two get new wishes.
      const lam = this.eater('lamyai')
      lam.mode = 'walk'
      lam.t = 0
      for (const id of ['mali', 'khanom'] as const) this.newWant(this.eater(id))
      this.later(900, () => this.sitDaddy(false))
    } else if (s === 'splash') {
      // Full: whatever is in hands and trunks goes back in the basket, and they start spraying, one after another.
      if (this.held) this.basket.putBack(this.held.food)
      this.held = null
      for (const f of this.flights) this.basket.putBack(f.food)
      this.flights = []
      this.eaters.forEach((x, i) => {
        if (x.food) this.basket.putBack(x.food)
        x.food = null
        x.passTo = x.from = null
        this.setWant(x, null)
        x.mode = 'spray'
        x.sprayT = -0.6 * i
      })
      this.splash.showRainbow()
      if (!first) {
        sfx.trumpet()
        this.riders.kaylee.react('hop')
      }
    }
  }

  /** Moves on to the next section in a moment (once). */
  private next(s: ChangSection, ms: number) {
    if (this.moving) return
    this.moving = true
    this.later(ms, () => this.begin(s))
  }

  private setWant(x: Eater, kind: FoodKind | null, total = 1) {
    x.want = kind ? { kind, total, left: total } : null
    x.bubble.set(kind, total, total)
    if (kind) sfx.chime()
  }
  /** A favorites round: Mali wants three of one, Khanom two of the other; the second round swaps and asks more of
   *  Khanom. (The kinds are drawn fresh each time.) */
  private drawRound() {
    if (this.round === 1) this.firstKind = Math.random() < 0.5 ? 'cane' : 'banana'
    const k = this.round === 1 ? this.firstKind : other(this.firstKind)
    this.setWant(this.eater('mali'), k, this.round === 1 ? 3 : 2)
    this.setWant(this.eater('khanom'), other(k), this.round === 1 ? 2 : 3)
  }
  private newWant(x: Eater) {
    this.setWant(x, pick(['banana', 'cane'] as FoodKind[]), 1 + Math.round(Math.random()))
  }

  private sitDaddy(now: boolean) {
    if (this.seated) return
    this.seated = true
    const at = new Vector3(BENCH.x, BENCH.y, BENCH.z)
    if (now) this.put(this.riders.nick, at.x, at.y, at.z, 'sit', 200)
    else this.hop(this.riders.nick, this.scene, at, { pose: 'sit', face: 200, dur: 0.7, arc: 0.5 })
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    if (this.at === 'drinks') return [...this.cafe.pickRoots(), ...Object.values(this.riders).map((r) => r.root)]
    return [this.milk.root, ...this.basket.foods.map((f) => f.obj), ...this.eaters.map((x) => x.e.root), ...Object.values(this.riders).map((r) => r.root)]
  }

  pointerDown(x = 0, y = 0, id?: string) {
    super.pointerDown()
    const what = id ?? this.pick(x, y)
    if (this.at === 'drinks') {
      if (what?.startsWith('tool:')) this.touches++
      return this.cafe.down(x, y, what)
    }
    if (!what?.startsWith('food:') || this.held || this.at === 'splash') return
    // The bananas are on the left of the basket and the cane on the right: which side her finger went down on decides,
    // so a touch near the middle never grabs the other one.
    const mid = this.toScreen(this.basket.middle(tmp), 0.1, 999)
    const kind: FoodKind = mid ? (x < mid.x ? 'banana' : 'cane') : (what.slice(5) as FoodKind)
    const food = this.basket.next(kind)
    if (!food) return this.basket.poke()
    food.state = 'held'
    food.t = 0
    this.held = { food, x, y, sx: x, sy: y, moved: false, auto: null }
    this.touches++
    sounds.pickup()
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, down: boolean) {
    if (this.at === 'drinks') {
      if (down) this.cafe.move(x, y)
      return
    }
    const h = this.held
    if (!down || !h || h.auto) return
    h.x = x
    h.y = y
    if (Math.hypot(x - h.sx, y - h.sy) > 12) h.moved = true
  }

  pointerUp() {
    if (this.at === 'drinks') return this.cafe.up()
    const h = this.held
    if (!h || h.auto) return
    if (!h.moved) {
      // A tap: the food floats by itself to whoever wants it (or the hungriest trunk).
      h.auto = this.hungriest(h.food.kind)
      sfx.fwip()
      return
    }
    // Let go away from every trunk: it falls on the gravel.
    this.held = null
    h.food.state = 'falling'
    h.food.vy = 0
    h.food.t = 0
  }

  protected onTap(id: string | null) {
    if (!id || id.startsWith('food:') || id.startsWith('tool:')) return
    if (this.at === 'drinks' && this.cafe.tap(id)) return
    if (id === 'milk') {
      // Kaylee has a sip herself.
      this.milk.poke()
      sfx.slurp()
      this.riders.kaylee.react('wiggle')
      return
    }
    if (id.startsWith('ele:')) {
      const x = this.eater(id.slice(4) as ElephantId)
      // In the splash: another spray right away.
      if (this.at === 'splash' && x.here) {
        const c = x.sprayT < 0 ? 0 : x.sprayT % CYCLE
        if (c < LIFT || c > SPRAY_END) x.sprayT = Math.floor(Math.max(0, x.sprayT) / CYCLE) * CYCLE + DIP
      }
      x.e.trumpet()
      if (x.e.id === 'khanom') sfx.squeal()
      else sfx.trumpet()
      return
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as 'ji']
      c?.react('hop')
      sfx.boing()
    }
  }

  /** Who should get a tapped food: a free elephant who wants it, else the one who has eaten least (Khanom, if it's a
   *  tie: always hungry). */
  private hungriest(kind: FoodKind): Eater {
    const free = this.eaters.filter((x) => x.here && x.mode === 'idle')
    const pool = free.length ? free : this.eaters.filter((x) => x.here)
    return pool.find((x) => x.want?.kind === kind) ?? [...pool].sort((a, b) => a.e.full - b.e.full || (a.e.id === 'khanom' ? -1 : 1))[0]
  }

  // ---------------------------------------------------------------- per frame

  /** The point on the plane z = `z` under a screen point. */
  private onPlane(x: number, y: number, z: number, out: Vector3) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = out.set(n.x, n.y, -1).unproject(cam)
    const dir = tmp2.set(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }

  protected step(dt: number, t: number) {
    if (this.at === 'drinks') {
      this.cafe.step(dt)
      const watch = this.cafe.watch(tmp)
      for (const c of Object.values(this.riders)) {
        c.lookAt(watch.x, watch.y, watch.z)
        c.update(dt, t)
      }
      return
    }
    const F = CHANG_FEEL
    const h = this.held
    // ---- The food in her hand: on the plane in front of the boulders, a little above her finger ----
    if (h) {
      const p = h.food.obj.position
      if (h.auto) tmp.copy(tipOf(h.auto.e.trunk))
      else {
        this.onPlane(h.x, h.y - F.lift, HOLD.z, tmp)
        tmp.set(clamp(tmp.x, HOLD.x0, HOLD.x1), clamp(tmp.y, HOLD.y0, HOLD.y1), HOLD.z)
      }
      // It stands up straight in her hand and swings a little as it moves.
      const o = h.food.obj.rotation
      o.x *= 1 - Math.min(1, dt * 6)
      o.z += (clamp((tmp.x - p.x) * -1.5, -0.5, 0.5) - o.z) * Math.min(1, dt * 8)
      p.lerp(tmp, 1 - Math.exp(-dt * (h.auto ? F.glide : 28)))
    }
    // ---- Foods falling, lying on the gravel, and coming back to the basket ----
    for (const f of this.basket.foods) {
      f.t += dt
      if (f.state === 'falling') {
        f.vy -= 9.8 * dt
        f.obj.position.y += f.vy * dt
        if (f.obj.position.y <= HOLD.ground) {
          f.obj.position.y = HOLD.ground
          f.obj.rotation.set(Math.PI / 2, f.obj.rotation.y, 0.4)
          f.state = 'ground'
          f.t = 0
          sfx.thump()
        }
      } else if (f.state === 'ground' && f.t > F.ground && !this.eaters.some((x) => x.chasing && this.targetOf(x) === f)) {
        // Out of everyone's reach: Daddy pops it back in.
        this.basket.putBack(f)
        sfx.pop()
      } else if (f.state === 'eaten' && f.t > 1.2) {
        this.basket.putBack(f)
        sfx.pop()
      }
    }
    // ---- Wrong snacks flying from one trunk to the one who wanted it ----
    for (const fl of [...this.flights]) {
      fl.t += dt / 0.6
      const k = Math.min(1, fl.t)
      fl.food.obj.position.lerpVectors(fl.from, tipOf(fl.to.e.trunk), k)
      fl.food.obj.position.y += bell(k) * 0.9
      fl.food.obj.rotation.z += dt * 9
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(fl), 1)
        fl.to.from = null
        this.grab(fl.to, fl.food, true)
        fl.to.e.flap = 1
        sfx.rumble()
      }
    }
    // ---- The elephants ----
    for (const x of this.eaters) this.stepEater(x, dt, t)
    if (this.stacheUntil && this.time > this.stacheUntil) {
      this.stacheUntil = 0
      this.eater('khanom').e.chocolate(false)
    }
    // Mali's big burp (Daddy laughs).
    if (this.burpAt > 0 && this.time > this.burpAt) {
      this.burpAt = -1
      this.maliBites = []
      sfx.burp()
      this.eater('mali').e.trumpet()
      this.later(500, () => {
        sfx.haha()
        this.riders.nick.react('hop')
      })
    }
    this.basket.update(dt)
    this.milk.update(dt)
    this.splash.update(dt)
    // ---- The family watch the food, whoever is eating, or the spray ----
    const busy = this.eaters.find((x) => x.mode !== 'idle' && x.mode !== 'spray' && x.here)
    const watch = this.at === 'splash' ? tmp.set(0.8, 3.4, -0.6) : h ? h.food.obj.position : busy ? busy.e.headAt(tmp) : this.eater('mali').e.headAt(tmp)
    for (const c of Object.values(this.riders)) {
      c.lookAt(watch.x, watch.y, watch.z)
      c.update(dt, t)
    }
  }

  /** One elephant's frame: what its trunk goes after, then its body and trunk. */
  private stepEater(x: Eater, dt: number, t: number) {
    const F = CHANG_FEEL
    const e = x.e
    const h = this.held
    x.t += dt
    const base = e.trunkRoot(tmp)
    let chase = e.id === 'khanom' ? F.chaseBaby : F.chase
    let target: Vector3 = this.hang(x, base, t)
    let look: Vector3 | null = null
    // Turning to face the rail (or, at the back, the yard).
    if (x.mode !== 'walk') {
      const face = x.here ? 0 : LAMYAI_BACK.heading
      e.heading += (face - e.heading) * (1 - Math.exp(-dt * 2))
      e.walking = Math.max(0, e.walking - dt * 2)
    }
    switch (x.mode) {
      case 'walk': {
        // Lamyai wanders over from the sala, thump, thump (the basket hops at each step).
        const dx = e.spot.x - e.x
        const dz = e.spot.z - e.z
        const d = Math.hypot(dx, dz)
        e.walking = Math.min(1, e.walking + dt * 2)
        e.heading = Math.atan2(dx, dz)
        const step = Math.min(d, 1.6 * dt)
        e.x += (dx / (d || 1)) * step
        e.z += (dz / (d || 1)) * step
        if (Math.floor(x.t / 0.55) > Math.floor((x.t - dt) / 0.55)) {
          sfx.thump()
          this.basket.poke()
        }
        if (d < 0.05) {
          x.mode = 'idle'
          x.here = true
          e.trumpet()
          sfx.trumpet()
          if (this.at === 'lamyai') this.newWant(x)
        }
        break
      }
      case 'carry':
        if (x.passTo) {
          // The wrong snack: a sniff at the mouth, then a swing over toward whoever wanted it, and a toss.
          const o = x.passTo
          if (x.t < 0.45) target = e.mouth(rest).add(tmp2.set(Math.sin(x.t * 30) * 0.06, 0.05, 0.15))
          else {
            target = rest.lerpVectors(base, o.e.trunkRoot(tmp2), 0.5).add(tmp3.set(0, 0.4 * e.spot.s, 0.8))
            chase *= 1.4
          }
          look = o.e.headAt(tmp3)
          if (x.t > 0.95 && x.food) {
            const food = x.food
            food.state = 'flying'
            this.flights.push({ food, from: tipOf(e.trunk).clone(), to: o, t: 0 })
            x.food = null
            x.passTo = null
            x.mode = 'idle'
            x.t = 0
            sfx.fwip()
            sfx.rumble()
          }
        } else {
          target = e.mouth(rest)
          chase *= 1.6
          if (x.t > F.curl) this.eat(x)
        }
        break
      case 'munch':
        // The tip stays at the mouth while it chews, then lets go.
        target = e.mouth(rest).add(tmp2.set(0, -0.15 * e.spot.s, 0.2 * e.spot.s))
        if (x.t > F.munch) {
          x.mode = 'idle'
          x.t = 0
          if (e.id === 'mali' && this.burpAt < 0 && this.maliBites.filter((b) => this.time - b < F.burpWindow).length >= F.burp) this.burpAt = this.time + 0.4
        }
        break
      case 'catch':
        // Reaching over to catch a snack a friend is passing.
        if (x.from) {
          target = rest.lerpVectors(base, x.from.e.trunkRoot(tmp2), 0.3).add(tmp3.set(0, 0.5 * e.spot.s, 0.9))
          look = x.from.e.headAt(tmp3)
        }
        if (x.t > 3) {
          x.mode = 'idle'
          x.from = null
        }
        break
      case 'sneak':
      case 'sip': {
        // Khanom's sneaky sips: a food held out turns him back at once.
        const food = this.targetOf(x)
        if (food) {
          x.mode = 'idle'
          break
        }
        target = this.milk.straw
        look = this.milk.straw
        if (x.mode === 'sneak') {
          chase *= 0.55
          if (tipOf(e.trunk).distanceTo(this.milk.straw) < 0.16) {
            x.mode = 'sip'
            x.t = 0
            sfx.slurp()
          }
        } else {
          this.milk.sip(dt)
          if (x.t > 1.4) {
            // Hic! And a chocolate moustache.
            x.mode = 'idle'
            x.t = 0
            this.sips++
            sfx.hiccup()
            e.hop()
            e.chocolate(true)
            this.stacheUntil = this.time + 5
            this.sneakCool = this.time + F.sneakRest
            this.riders.ji.react('hop')
            this.later(300, () => {
              sfx.giggle()
              this.riders.kaylee.react('hop')
            })
          }
        }
        break
      }
      case 'spray':
        target = this.sprayStep(x, base, dt)
        break
      default: {
        const food = x.here ? this.targetOf(x) : null
        if (food) {
          target = food.obj.position
          look = food.obj.position
          if (!x.chasing && this.time - x.sniffed > 1.5) {
            x.sniffed = this.time
            sfx.sniff()
          }
          x.chasing = true
          // The one who wants it reaches a little faster.
          if (x.want?.kind === food.kind) chase *= 1.25
          // The first tip to touch it curls round it.
          if (tipOf(e.trunk).distanceTo(food.obj.position) < F.grab * (0.75 + 0.25 * e.spot.s)) this.grab(x, food)
        } else {
          x.chasing = false
          if (h) look = h.food.obj.position
          // Still hands: Khanom's trunk goes sneaking for her chocolate milk.
          if (e.id === 'khanom' && this.at === 'lamyai' && this.eater('lamyai').here && (this.stepFed > 0 || this.time - this.since > 8) && !h && this.time - this.lastTouch > F.sneakAfter && this.time > this.sneakCool && this.milk.level > 0.3) {
            x.mode = 'sneak'
            x.t = 0
          }
        }
      }
    }
    if (x.mode !== 'carry' && x.mode !== 'munch') x.chasing = x.chasing && x.mode === 'idle'
    e.update(dt, t, target, chase, look)
    // The food it's carrying rides at the tip.
    if (x.food && (x.mode === 'carry' || x.mode === 'munch')) {
      x.food.obj.position.copy(tipOf(e.trunk)).add(tmp2.set(0, -0.06, 0.04))
      x.food.obj.rotation.z += dt * 2
    }
    // Its wish, over its head.
    x.bubble.update(dt, this.rig.camera, e.headAt(tmp2).add(tmp3.set(0, 1.35 * e.spot.s + 0.35, 0)))
  }

  /** Where a free trunk hangs: behind the rail, swaying; held high while trumpeting. */
  private hang(x: Eater, base: Vector3, t: number) {
    const reach = x.e.reach
    if (x.e.trumpeting > 0) return rest.copy(base).add(tmp2.set(0, reach * 0.7, reach * 0.45))
    const sway = Math.sin(t * 1.3 + { mali: 0, khanom: 2, lamyai: 4 }[x.e.id]) * 0.12 * reach
    return rest.copy(base).add(tmp2.set(sway, -reach * 0.85, 0.12))
  }

  /** The splash: dip in the trough, lift, spray it up over the family, rest; round and round. */
  private sprayStep(x: Eater, base: Vector3, dt: number) {
    const before = x.sprayT
    x.sprayT += dt
    if (x.sprayT < 0) return this.hang(x, base, this.time)
    const c = x.sprayT % CYCLE
    const was = before < 0 ? -1 : before % CYCLE
    const reach = x.e.reach
    if (c < DIP) return rest.set(base.x, TROUGH.h - 0.12, TROUGH.z)
    if (c >= SPRAY_END) return this.hang(x, base, this.time)
    // Up high, curled toward the family.
    const up = rest.copy(base).add(tmp2.set(0, reach * 0.72, reach * 0.42))
    if (c >= LIFT) {
      if (was < LIFT || was > c) {
        this.sprays++
        sfx.splash()
        if (x.e.id === 'khanom') sfx.squeal()
        else sfx.trumpet()
        x.e.flap = 1
        // The water comes down on the family: Kaylee squeals and bounces, Mommy wiggles.
        this.later(900, () => {
          sfx.giggle()
          this.riders.kaylee.react('hop')
          this.riders.ji.react('wiggle')
        })
      }
      if (tipOf(x.e.trunk).y > base.y) this.splash.spray(tipOf(x.e.trunk), dt)
    }
    return up
  }

  /** What a free trunk goes after: the food in her hand (if it's in reach, or floating to this trunk), else the
   *  nearest food on the gravel within its reach. */
  private targetOf(x: Eater): Food | null {
    if (!x.here) return null
    const h = this.held
    const base = x.e.trunkRoot(tmp3)
    const reach = x.e.reach
    if (h && (h.auto ? h.auto === x : base.distanceTo(h.food.obj.position) < reach * CHANG_FEEL.notice)) return h.food
    let best: Food | null = null
    let bestD = reach * 1.02
    for (const f of this.basket.foods) {
      if (f.state !== 'ground') continue
      const d = base.distanceTo(f.obj.position)
      if (d < bestD) {
        best = f
        bestD = d
      }
    }
    return best
  }

  /** A trunk takes a food. The wrong snack (someone else wants it) is passed on; `mine` = it was passed to this one. */
  private grab(x: Eater, food: Food, mine = false) {
    if (this.held?.food === food) this.held = null
    food.state = 'carried'
    x.food = food
    x.mode = 'carry'
    x.t = 0
    x.chasing = false
    x.passTo = null
    sfx.sniff()
    if (mine || x.want?.kind === food.kind || (this.at !== 'favorites' && this.at !== 'lamyai')) return
    const o = this.eaters.find((w) => w !== x && w.here && w.mode === 'idle' && w.want?.kind === food.kind)
    if (o) {
      x.passTo = o
      o.mode = 'catch'
      o.t = 0
      o.from = x
    }
  }

  private eat(x: Eater) {
    const f = x.food!
    f.state = 'eaten'
    f.t = 0
    f.obj.visible = false
    x.mode = 'munch'
    x.t = 0
    x.e.ate()
    if (f.kind === 'cane') sfx.crunch()
    else sfx.munch()
    if (x.e.id === 'khanom') sfx.squeal()
    else sfx.rumble()
    if (x.e.id === 'mali') this.maliBites.push(this.time)
    x.food = null
    this.fed++
    this.stepFed++
    this.events.fed(this.fed)
    // Kaylee bounces and giggles at every other bite.
    if (this.fed % 2 === 1) {
      this.riders.kaylee.react('hop')
      sfx.giggle()
    }
    // A wish: one more pip, and when it comes true a trumpet.
    const w = x.want
    if (w && w.kind === f.kind && (this.at === 'favorites' || this.at === 'lamyai')) {
      w.left--
      sounds.note(Math.min(10, w.total - w.left + 2))
      x.bubble.set(w.kind, w.total, w.left)
      if (w.left <= 0) {
        x.want = null
        x.bubble.set(null)
        this.later(350, () => {
          x.e.trumpet()
          if (x.e.id === 'khanom') sfx.squeal()
          else sfx.trumpet()
          sounds.correct()
        })
        this.wished(x)
      }
    }
    if (this.at === 'feed' && this.stepFed >= CHANG_FEEL.toFavorites) this.next('favorites', 1000)
    if (this.at === 'lamyai' && this.stepFed >= CHANG_FEEL.toSplash) this.next('splash', 1400)
  }

  /** A wish came true: in favorites, the next round (or Lamyai) once both are done; in lamyai, a new wish soon. */
  private wished(x: Eater) {
    if (this.at === 'favorites') {
      if (this.eaters.some((w) => w.want)) return
      if (this.round === 1) {
        this.round = 2
        this.later(1300, () => this.at === 'favorites' && this.drawRound())
      } else this.next('lamyai', 1500)
    } else if (this.at === 'lamyai') this.later(1700, () => this.at === 'lamyai' && !x.want && this.newWant(x))
  }

  // ---------------------------------------------------------------- camera, anchors

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.cafe.layout(w < h)
    if (this.at === 'drinks') this.cafe.enter()
    super.setSize(w, h, top)
  }

  protected shot(): Shot {
    if (this.at === 'drinks') return this.cafe.shot()
    const tall = this.w < this.h
    const s = this.at === 'splash' ? (tall ? SHOT.splashTall : SHOT.splashWide) : this.at === 'lamyai' ? (tall ? SHOT.tall3 : SHOT.wide3) : tall ? SHOT.tall : SHOT.wide
    return { center: new Vector3(...s.center), half: new Vector3(...s.half), yaw: s.yaw, pitch: s.pitch, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.at === 'drinks') return id.startsWith('family:') ? this.familyAt(id) : this.cafe.anchorAt(id, this.time - this.lastTouch)
    if (id.startsWith('tool:') || id.startsWith('glass:') || id === 'bell') return null
    if (id === 'food:banana' || id === 'food:cane') {
      // (Hidden while she's holding one, her finger is busy, and in the splash.)
      if (this.held || this.at === 'splash') return null
      const kind = id.slice(5) as FoodKind
      const wanted = this.eaters.some((x) => x.want?.kind === kind)
      // (Bigger in the wider shot with Lamyai, so they stay at least 88 px on an iPad.)
      const r = this.at === 'lamyai' ? 0.44 : 0.34
      return { at: this.basket.target(kind, r, new Vector3()), r, glow: (this.fed === 0 || wanted) && this.time - this.lastTouch > 4, prio: 3 }
    }
    if (id === 'milk') return this.milk.root.visible ? { at: this.milk.root.getWorldPosition(new Vector3()).setY(this.milk.root.position.y + 0.15), r: 0.24, prio: 3 } : null
    if (id.startsWith('ele:')) {
      const e = this.eater(id.slice(4) as ElephantId).e
      return { at: e.headAt(new Vector3()), r: 0.85 * e.spot.s, max: 220, prio: 1 }
    }
    if (id.startsWith('family:')) return this.familyAt(id)
    return null
  }
  private familyAt(id: string): AnchorSpot | null {
    const c = this.riders[id.slice(7) as 'ji']
    if (!c) return null
    return { at: c.root.getWorldPosition(new Vector3()).setY(c.root.position.y + c.height * 0.55), r: c.height * 0.3, max: 120 }
  }

  protected hintAt() {
    if (this.at === 'drinks') return this.cafe.hintAt()
    if (this.held) return null
    if (this.at === 'splash') return this.eater('mali').e.headAt(new Vector3())
    const want = this.eaters.find((x) => x.want)?.want
    return this.basket.spot(want?.kind ?? 'banana', new Vector3())
  }

  /** The ?debug panel changed the trunks' reach. */
  retune() {
    for (const x of this.eaters) x.e.setReach(CHANG_FEEL.reach)
  }

  qa() {
    const r = (v: Vector3) => [+v.x.toFixed(2), +v.y.toFixed(2), +v.z.toFixed(2)]
    return {
      leg: 'chang',
      section: this.at,
      fed: this.fed,
      stepFed: this.stepFed,
      round: this.round,
      holding: this.held ? this.held.food.kind : null,
      trunks: this.eaters.map((x) => ({ id: x.e.id, mode: x.mode, here: x.here, full: x.e.full, chasing: x.chasing, want: x.want ? `${x.want.kind} ${x.want.total - x.want.left}/${x.want.total}` : null, tip: r(tipOf(x.e.trunk)), at: [+x.e.x.toFixed(2), +x.e.z.toFixed(2)] })),
      flying: this.flights.length,
      milk: +this.milk.level.toFixed(2),
      sips: this.sips,
      sprays: this.sprays,
      touches: this.touches,
      kaylee: (this.riders.kaylee as Avatar).wearing,
      straw: this.straw,
      strawColor: STRAW_COLORS[this.straw],
      drink: this.at === 'drinks' ? this.cafe.qa() : undefined,
    }
  }
}
