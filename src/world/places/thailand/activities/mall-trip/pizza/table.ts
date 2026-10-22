// The Pizza Company (plan: planning/around-the-world/thailand/mall-trip.md, "The Pizza Company"), greybox: shapes and
// sounds, with voices (lines.ts `L.mall.pizza`): Sparkle's "Pick a pizza!" and "Pull a slice!", the server's "Pizza
// time!" and "Khob khun ka!", Sparkle counting each plate's first and second slice round the table, Daddy hamming it
// up and his cheesy nose, Mommy's "Those are for Agong!", the cheer as the lid closes, the fact once it's all shared,
// the pokes' reactions (the chili, the onion rings), and Sparkle's hint when the finger shows. The camera looks across the table straight on; Mommy, Kaylee (on her booster) and Daddy sit in the
// green booth on the far side with their plates, and Agong's take-away box waits open at the right end.
//
// `menu`: she picks a pizza (the screen's three picture buttons); the server carries it over on its stand, sets it down
// and bows. `share`, the toy: pull a slice. It follows her finger (a little above it, so she sees it), hanging from its
// crust, and the cheese stretches from its tip back to the pan, long and thin, wobbling when she swings it, until it
// snaps, boing (Double Cheese stretches longest). Let go over a plate and it lands there; anywhere else it springs back.
// Which plate is in screen space: near one, that one; lifted above the pan, the one in her slice's column. It glows
// pink before she lets go, so she always sees where it will land. Tap a slice on a plate and that person munches it,
// chomp, cheese on their chin. A tap on the pizza serves a slice for her (with its stretch), so taps alone can share it.
//   1. The first pull: the stretch is the wow.
//   2. Sharing fairly: 8 slices, 3 plates. The plate that's behind glows gold. Give Daddy more than anyone else (his
//      second while someone has one, a third) and he hams it up (points at Mommy's plate, ho ho). With 2 each, Agong's box glows: the last two go in, and the
//      lid closes, flup.
//   3. The cheese tug (the first pull after one each): Daddy grabs the other end, it stretches right across the table,
//      and snaps onto his nose.
// Nothing is wrong: any plate is fine, the box takes a slice any time, and slices on plates can be moved again.
import { Color, Euler, IcosahedronGeometry, OctahedronGeometry, PlaneGeometry, Quaternion, Vector2, Vector3, type Group, type Mesh, type MeshBasicMaterial, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, wobble, type Line } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { FaceLife } from '../../../characters/face'
import { LOOKS } from '../../../characters/looks'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { L } from '../../../lines'
import { wearHair } from '../games/barber/mane'
import { CheeseBand, CHEESE } from './cheese'
import { Floaters } from './fx'
import { BOX_HOLDS, EATER_NAMES, EATERS, PAN, PLATE_R, SEAT_Z, SEATS, SERVER_AT, SIGN, SLICES, SNAP, TABLE, TUG_SNAP, WINDOW, type EaterId, type PizzaId } from './layout'
import { buildRoom, type Room } from './room'
import { behind, BOX_OPEN, boxSpot, boxTurn, buildBox, buildPlates, buildSlice, buildTray, MID, panHome, panTurn, plateSpot, plateTurn, ROUND, turnY, type Box, type Plate, type Slice, type Target } from './share'
import { pizzaSfx as sfx } from './sounds'

export interface PizzaEvents extends LegEvents {
  /** The pizza is on the table: the menu is over, sharing starts. */
  served(): void
  /** Slices handed out so far (on plates, eaten, in the box): the address bar follows. */
  shared(n: number): void
  /** The pan is empty and Agong's box is closed. */
  allDone(): void
}

export const PIZZA_ANCHORS: AnchorInfo[] = [
  { id: 'pan', label: 'Pizza', kind: 'thing' },
  ...EATERS.map((e): AnchorInfo => ({ id: `plate:${e}`, label: `${EATER_NAMES[e]}'s plate`, kind: 'thing' })),
  { id: 'box', label: "Agong's box", kind: 'thing' },
  { id: 'soda', label: 'Soda', kind: 'thing' },
  { id: 'rings', label: 'Onion rings', kind: 'thing' },
  { id: 'chili', label: 'Chili shaker', kind: 'thing' },
  { id: 'napkins', label: 'Napkins', kind: 'thing' },
  { id: 'server', label: 'Server', kind: 'thing' },
  { id: 'sign', label: 'Sign', kind: 'thing' },
  { id: 'window', label: 'Waterfall', kind: 'thing' },
  ...EATERS.map((e): AnchorInfo => ({ id: `family:${e}`, label: EATER_NAMES[e], kind: 'family' })),
]

type Phase = 'menu' | 'serve' | 'share' | 'done'
type Home = Target | 'pan'

/** Pixels between her finger and the slice's tip (so the finger doesn't hide what it does). */
const LIFT_PX = 30
const SLOP = 16
/** Held slices move on this upright plane, just in front of the pan. */
const HOLD_Z = PAN.z + 0.06
/** A held slice hangs from its crust, tip down, toppings to the camera. */
const HANG = new Quaternion().setFromEuler(new Euler(-Math.PI / 2 * 0.82, Math.PI, 0, 'YXZ'))
/** The server walks over to here with the pizza. */
const SERVE_SPOT = new Vector3(-0.78, 0, 0.62)
const TINTS = ['#FFFFFF', '#FFC2E0', '#D9CCFF', '#BFF5DE', '#FFE9A8']
/** Nothing touched this long (the finger shows at 7 s): Sparkle's hint. */
const STUCK_S = 8

interface Fly {
  s: Slice
  from: Vector3
  to: () => Vector3
  q0: Quaternion
  q1: Quaternion
  t: number
  dur: number
  arc: number
  done: () => void
}
interface Toss {
  o: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  done: () => void
}

/** Eases a glow ring's opacity toward `goal`. */
const fade = (m: Mesh, goal: number, k: number) => {
  const mat = m.material as MeshBasicMaterial
  mat.opacity += (goal - mat.opacity) * Math.min(1, k)
}

const tmp = new Vector3()
const tmp2 = new Vector3()
const right = new Vector3()
const q = new Quaternion()

export class PizzaTable extends Stage {
  private room: Room
  private kaylee: Avatar
  private ji: Member
  private nick: Member
  private people: Record<EaterId, Avatar | Member>
  private serverLife: FaceLife
  private phase: Phase
  private pizza: PizzaId
  private tray: Group
  private slices: Slice[] = []
  private plates: Plate[]
  private box: Box
  private boxShut = false
  private band: CheeseBand
  /** The slice the cheese hangs from (and where it comes from: the pan, or Daddy's hand in the tug). */
  private banded: Slice | null = null
  private held: { s: Slice; x: number; y: number; x0: number; y0: number; moved: boolean } | null = null
  private home = new Map<Slice, Home>()
  private auto: { s: Slice; t: number; from: Vector2; target: Target } | null = null
  private hover: Target | null = null
  private flights: Fly[] = []
  private tosses: Toss[] = []
  private stretchStep = 0
  private swing = 0
  private lastX = NaN
  private tipPx = 60
  /** The cheese's ends last frame (it springs back from there after its slice has landed). */
  private lastA = new Vector3()
  private lastB = new Vector3()
  private sharedNow = 0
  private tug: 'wait' | 'on' | 'done' = 'wait'
  private tugK = 0
  /** How long the cheese was when Daddy got hold of it (it snaps a good pull past that). */
  private tugFrom = 0
  private nose: Group | null = null
  private noseT = 0
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  private sparkles: Floaters
  private crumbs: Floaters
  private bubbles: Floaters
  private flakes: Floaters
  private papers: Floaters
  // Animations (0..1, 1 = at rest).
  private serve = { t: -1 }
  private bow = 1
  private ham = 1
  private sneeze = { t: -1 }
  private lid = { k: 0, from: BOX_OPEN, to: BOX_OPEN }
  private boxBounce = 1
  private sip = 1
  private shake = 1
  private napkinPop = 1
  private signGlow = 0
  private logoSpin = 1
  private tint = 0
  private tintGoal = new Color('#FFFFFF')
  private worn = 0
  private bracelets: Group[] = []
  private chins = new Set<EaterId>()
  /** When each speaker last talked (a quick run of taps gets one line), and whose turn it is in Daddy's list. */
  private spoke = new Map<string, number>()
  private hams = 0
  /** Mommy has said the last two are for Agong; Sparkle has said the fact. */
  private agongSaid = false
  private fairSaid = false
  /** The touch the last hint was for (one hint each time she's stuck). */
  private hintedAt = -1

  constructor(renderer: WebGLRenderer, private pev: PizzaEvents, start: { section: 'menu' | 'share'; pizza: PizzaId; shared: number; hair?: string }) {
    super(renderer, pev)
    const { scene, bag } = this
    scene.background = new Color('#FFF1E4')
    this.rig.fov = 30
    this.room = buildRoom(bag)
    scene.add(this.room.root)
    this.serverLife = new FaceLife(this.room.server, 'server')
    // ---- The family in the booth ----
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.ji = members.get('ji')!
    this.nick = members.get('nick')!
    // Daddy keeps the hairdo she gave him at the barber's.
    wearHair(this.nick.rig, LOOKS.nick, start.hair ?? '', bag)
    this.people = { ji: this.ji, kaylee, nick: this.nick }
    kaylee.root.userData.pick = 'family:kaylee'
    for (const e of EATERS) {
      scene.add(this.people[e].root)
      this.put(this.people[e], SEATS[e].x, SEATS[e].seat, SEAT_Z, 'sit', 0)
    }
    // ---- The plates, Agong's box, the pan and the cheese ----
    this.plates = buildPlates(bag)
    for (const p of this.plates) scene.add(p.root)
    this.box = buildBox(bag)
    this.box.lid.rotation.x = BOX_OPEN
    scene.add(this.box.root)
    this.tray = buildTray(bag)
    this.tray.visible = false
    scene.add(this.tray)
    this.band = new CheeseBand(bag)
    scene.add(this.band.root)
    // ---- Effects ----
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 80, bag, 1.2, 1.2)
    this.crumbs = new Floaters(new IcosahedronGeometry(0.5, 0), ['#F2C27B', CHEESE, '#E5A457'], 60, bag, 5, 0.5)
    this.bubbles = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#FFC9E3'], 40, bag, -0.4, 1.2)
    this.flakes = new Floaters(new IcosahedronGeometry(0.5, 0), ['#E5484D', '#FF7A45'], 60, bag, 3, 1)
    this.papers = new Floaters(new PlaneGeometry(1, 0.8), ['#FFFFFF', '#E8F7EE', '#FFE3EF'], 40, bag, 0.9, 1.6)
    for (const f of [this.sparkles, this.crumbs, this.bubbles, this.flakes, this.papers]) scene.add(f.mesh)
    // ---- Where the link starts ----
    this.pizza = start.pizza
    this.phase = 'menu'
    if (start.section === 'share') {
      this.bring(start.pizza, true)
      this.deal(start.shared)
      if ((this.phase as Phase) === 'share') this.after(0.6, () => this.pev.say(L.mall.pizza.start))
    } else this.after(0.6, () => this.phase === 'menu' && this.pev.say(L.mall.pizza.menu))
  }

  /** Someone says a line, unless they spoke a moment ago. */
  private talk(who: string, l: Line, every = 2.5) {
    if (this.time - (this.spoke.get(who) ?? -99) < every) return
    this.spoke.set(who, this.time)
    this.pev.say(l)
  }

  // ---------------------------------------------------------------- the menu, the server

  /** She picked a pizza on the menu: the server brings it over. */
  choose(pizza: PizzaId) {
    if (this.phase !== 'menu') return
    this.touches++
    this.lastTouch = this.time
    this.bring(pizza, false)
  }

  private bring(pizza: PizzaId, instant: boolean) {
    this.pizza = pizza
    this.slices = Array.from({ length: SLICES }, (_, i) => buildSlice(pizza, i, this.bag))
    for (const s of this.slices) {
      this.tray.add(s.root)
      s.root.position.copy(panHome(s.i))
      s.root.quaternion.copy(turnY(panTurn(s.i)))
    }
    this.tray.visible = true
    if (instant) {
      this.tray.position.set(PAN.x, TABLE.top, PAN.z)
      this.phase = 'share'
      return
    }
    this.phase = 'serve'
    this.serve.t = 0
    sfx.chime()
  }

  /** The server's walk over (carrying the pizza at her hands), setting it down, the bow, and the walk back. */
  private serving(dt: number) {
    const sv = this.room.server
    if (this.serve.t < 0) return
    const t = (this.serve.t += dt)
    const at = new Vector3(...SERVER_AT)
    const walk = (from: Vector3, to: Vector3, k: number) => {
      sv.root.position.lerpVectors(from, to, k)
      sv.root.position.y = Math.abs(Math.sin(k * Math.PI * 4)) * 0.05 * (k < 1 ? 1 : 0)
    }
    if (t < 1.3) {
      // Round the end of the table: out to the front, then along it.
      const k = t / 1.3
      const corner = new Vector3(SERVE_SPOT.x - 1.05, 0, SERVE_SPOT.z)
      if (k < 0.5) walk(at, corner, k * 2)
      else walk(corner, SERVE_SPOT, k * 2 - 1)
      sv.root.rotation.y = k < 0.5 ? 0.15 : 1.4
      sv.armL.rotation.x = sv.armR.rotation.x = -1.25
      sv.root.updateMatrixWorld()
      this.tray.position.copy(sv.root.localToWorld(tmp2.set(0, TABLE.top + 0.03, 0.5)))
    } else if (t < 1.75) {
      const k = (t - 1.3) / 0.45
      walk(at, SERVE_SPOT, 1)
      const from = sv.root.localToWorld(tmp2.set(0, TABLE.top + 0.03, 0.5)).clone()
      this.tray.position.lerpVectors(from, tmp.set(PAN.x, TABLE.top, PAN.z), k)
      this.tray.position.y += bell(k) * 0.08
      if (t + dt >= 1.75) {
        this.tray.position.set(PAN.x, TABLE.top, PAN.z)
        sfx.thump()
        sv.armL.rotation.x = sv.armR.rotation.x = 0
      }
    } else if (t < 2.6) {
      if (this.bow >= 1 && t - dt < 1.8) this.serverBow()
      if (this.phase === 'serve' && t > 2.1) {
        this.phase = 'share'
        this.pev.served()
        // The server, then Sparkle's one instruction (it waits its turn).
        this.talk('server', L.mall.pizza.served)
        this.pev.say(L.mall.pizza.start)
        this.kaylee.react('wiggle')
        this.ji.react('wiggle')
        this.nick.react('wiggle')
        sfx.cheer()
      }
    } else if (t < 3.6) {
      const k = (t - 2.6) / 1.0
      const corner = new Vector3(SERVE_SPOT.x - 1.05, 0, SERVE_SPOT.z)
      if (k < 0.5) walk(SERVE_SPOT, corner, k * 2)
      else walk(corner, at, k * 2 - 1)
      sv.root.rotation.y = k < 0.5 ? -1.6 : Math.PI
    } else {
      sv.root.position.copy(at)
      sv.root.rotation.y = 0.5
      this.serve.t = -1
    }
  }

  private serverBow() {
    this.bow = 0
    this.play(sfx.chime)
  }

  /** A link that starts partway: the first `n` slices are already handed out, round the table, then into the box. */
  private deal(n: number) {
    n = clamp(Math.round(n), 0, SLICES)
    for (let k = 0; k < n; k++) {
      const s = this.slices[k]
      const t: Target = k < 6 ? ROUND[k % 3] : 'box'
      this.land(s, t, true)
    }
    if (this.count('box') >= BOX_HOLDS) this.closeBox(true)
    if (n >= 6) this.tug = 'done'
    this.sharedNow = this.shared
    if (this.panLeft === 0 && this.boxShut) this.phase = 'done'
  }

  // ---------------------------------------------------------------- the sums

  private count(t: Target) {
    return this.slices.filter((s) => s.owner === t).length
  }
  private counts(): Record<EaterId, number> {
    return { ji: this.count('ji'), kaylee: this.count('kaylee'), nick: this.count('nick') }
  }
  private get shared() {
    return this.slices.filter((s) => s.owner).length
  }
  private get panLeft() {
    return this.slices.filter((s) => s.where === 'pan' || this.home.get(s) === 'pan').length
  }
  /** Where a slice goes when she taps the pizza: the plate that's behind, or the box once everyone has two. */
  private suggest(): Target {
    const c = this.counts()
    const min = Math.min(...EATERS.map((e) => c[e]))
    if (!this.boxShut && min >= 2) return 'box'
    return behind(c)[0] ?? ROUND.find((e) => c[e] === min)!
  }
  private onTarget(t: Target) {
    return this.slices.filter((s) => s.owner === t && (s.where === 'plate' || s.where === 'box'))
  }
  /** The slice on top of a plate (the one a tap munches and a drag picks up). */
  private topOf(e: EaterId) {
    return this.onTarget(e).sort((a, b) => b.root.position.y - a.root.position.y)[0]
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    const r = this.room
    return [...this.slices.filter((s) => s.root.visible).map((s) => s.root), ...this.plates.map((p) => p.root), this.box.root, r.soda.root, r.rings.root, r.chili, r.napkins, r.server.root, r.sign.root, r.falls.mesh, ...EATERS.map((e) => this.people[e].root)]
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    if (x === undefined || y === undefined || this.held || this.auto) return
    if (this.phase !== 'share' && this.phase !== 'done') return
    const what = id ?? this.pick(x, y)
    let s: Slice | undefined
    if (what === 'pan') s = this.nearestInPan(x, y)
    else if (what?.startsWith('plate:')) s = this.topOf(what.slice(6) as EaterId)
    if (s) this.held = { s, x, y, x0: x, y0: y, moved: false }
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
      this.lift(h.s)
    }
  }
  pointerUp() {
    const h = this.held
    this.held = null
    if (!h?.moved) return
    this.drop(h.s, this.targetAt(h.x, h.y - LIFT_PX - this.tipPx))
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (!id) return
    if (id === 'pan') {
      const s = this.phase === 'share' || this.phase === 'done' ? this.nearestInPan(x, y) : undefined
      if (s && !this.auto && !this.held) this.serveFor(s)
      return
    }
    if (id.startsWith('plate:')) return this.munch(id.slice(6) as EaterId)
    if (id.startsWith('family:')) {
      const e = id.slice(7) as EaterId
      const p = this.people[e]
      p.react(e === 'kaylee' ? 'wiggle' : 'hop')
      this.play(e === 'nick' ? sfx.haha : sfx.giggle)
      return
    }
    switch (id) {
      case 'box':
        if (this.boxShut) {
          this.boxBounce = 0
          this.play(sfx.chime)
        } else {
          this.lid = { k: 0, from: BOX_OPEN + 0.5, to: BOX_OPEN }
          this.play(sfx.creak)
        }
        return
      case 'soda':
        // Slurp: the soda goes down, bubbles come up (and it fills back up).
        this.sip = 0
        this.play(sfx.slurp)
        this.after(0.3, () => sfx.bubbles())
        this.bubbles.burst(this.room.soda.root.position.clone().add(new Vector3(0, 0.2, 0)), 10, 0.15, 0.4, 1.4, 0.025)
        return
      case 'rings':
        return this.bracelet()
      case 'chili':
        return this.achoo()
      case 'napkins':
        this.napkinPop = 0
        this.play(sfx.napkins)
        for (let i = 0; i < 12; i++) this.papers.emit(this.room.napkins.position.clone().add(new Vector3(0, 0.15, 0)), new Vector3((Math.random() - 0.5) * 1.6, 1.6 + Math.random() * 1.2, (Math.random() - 0.2) * 0.8), 2.2, 0.09)
        return
      case 'server':
        this.serverBow()
        this.talk('server', L.mall.pizza.thanks, 3)
        return
      case 'sign':
        this.signGlow = 1
        this.logoSpin = 0
        this.play(sfx.ding)
        return
      case 'window':
        this.tint = (this.tint + 1) % TINTS.length
        this.tintGoal.set(TINTS[this.tint])
        this.play(sfx.water)
        this.after(0.15, () => sfx.chime())
        return
    }
  }

  /** The slice in the pan nearest a screen point. */
  private nearestInPan(x: number, y: number) {
    let best: Slice | undefined
    let d = Infinity
    for (const s of this.slices) {
      if (s.where !== 'pan') continue
      const p = this.screen(s.root.getWorldPosition(tmp))
      const dd = p ? Math.hypot(p.x - x, p.y - y) : Infinity
      if (dd < d) {
        d = dd
        best = s
      }
    }
    return best
  }

  /** A tap on the pizza: the slice lifts by itself (stretching) and goes to the plate that's behind. */
  private serveFor(s: Slice) {
    const from = this.screen(s.root.getWorldPosition(tmp))
    if (!from) return
    this.lift(s)
    this.auto = { s, t: 0, from: new Vector2(from.x, from.y + LIFT_PX + this.tipPx), target: this.suggest() }
  }

  /** Where the tap's slice is now (its finger): up out of the pan, then over to its plate. */
  private autoFinger(dt: number): Vector2 | null {
    const a = this.auto
    if (!a) return null
    a.t += dt
    const to = this.targetScreen(a.target)
    if (a.t >= 1.05 || !to) {
      const s = a.s
      this.auto = null
      this.drop(s, a.target)
      return null
    }
    const up = a.from.clone().add(new Vector2(0, -120))
    if (a.t < 0.4) return a.from.clone().lerp(up, Math.sin((a.t / 0.4) * Math.PI / 2))
    const k = Math.min(1, (a.t - 0.4) / 0.55)
    return up.lerp(new Vector2(to.x, to.y + LIFT_PX + this.tipPx * 0.6), k * k * (3 - 2 * k))
  }

  // ---------------------------------------------------------------- the pull

  /** Picked up: out of the pan (the cheese starts stretching) or off a plate. */
  private lift(s: Slice) {
    const from: Home = s.where === 'pan' ? 'pan' : (s.owner ?? 'pan')
    this.home.set(s, from)
    this.scene.attach(s.root)
    s.where = 'held'
    s.owner = null
    this.lastX = NaN
    this.swing = 0
    this.play(sfx.fwip)
    if (from === 'pan') {
      this.banded = s
      this.band.start(this.panAnchor(s), this.tipOf(s), this.strandOff(s))
      this.stretchStep = 0
      if (this.tug === 'wait' && this.shared >= 3 && this.shared < 6) {
        this.tug = 'on'
        this.tugK = 0
      }
    }
  }

  /** Each frame while she holds it: under her finger (a little above), hanging, swinging; which plate it's over. */
  private holdAt(s: Slice, finger: Vector2, dt: number) {
    const goal = this.onPlane(finger.x, finger.y - LIFT_PX - this.tipPx, HOLD_Z)
    s.root.position.lerp(goal, 1 - Math.exp(-dt * 28))
    const vx = Number.isNaN(this.lastX) || dt <= 0 ? 0 : (s.root.position.x - this.lastX) / dt
    this.lastX = s.root.position.x
    this.swing += (clamp(-vx * 0.35, -0.7, 0.7) - this.swing) * (1 - Math.exp(-dt * 7))
    q.setFromAxisAngle(tmp.set(0, 0, 1), this.swing).multiply(HANG)
    s.root.quaternion.slerp(q, 1 - Math.exp(-dt * 12))
    s.root.updateMatrixWorld()
    const c = this.screen(s.root.position)
    const tip = this.screen(this.tipOf(s))
    if (c && tip) this.tipPx = clamp(tip.y - c.y, 20, 140)
    // Where her finger puts it (not where it has caught up to yet), so a quick flick lands where she meant.
    const hv = this.targetAt(finger.x, finger.y - LIFT_PX - this.tipPx)
    if (hv !== this.hover && hv) this.play(sfx.pop)
    this.hover = hv
  }

  /** Let go: onto the plate (or box) it's over, or back where it came from. */
  private drop(s: Slice, t: Target | null) {
    this.hover = null
    const home = this.home.get(s) ?? 'pan'
    if (this.tug === 'on' && this.banded === s) this.tugSnap()
    if (t) return this.flyTo(s, t)
    // Back where it came from (the cheese pulls it home).
    if (home === 'pan') {
      this.fly(s, () => this.tray.localToWorld(panHome(s.i, new Vector3())), turnY(panTurn(s.i)), 0.3, 0.05, () => {
        this.tray.attach(s.root)
        s.root.position.copy(panHome(s.i))
        s.root.quaternion.copy(turnY(panTurn(s.i)))
        s.where = 'pan'
        s.root.userData.pick = 'pan'
        this.home.delete(s)
        if (this.banded === s) {
          this.band.state = 'off'
          this.banded = null
        }
        this.play(sfx.boing)
      })
    } else this.flyTo(s, home)
  }

  private flyTo(s: Slice, t: Target) {
    const k = this.onTarget(t).length
    const turn = t === 'box' ? boxTurn(k) : plateTurn(k)
    this.fly(s, () => (t === 'box' ? boxSpot(this.box, k, new Vector3()) : plateSpot(this.plate(t), k, new Vector3())), turnY(turn), 0.32, 0.14, () => this.land(s, t, false))
  }

  private fly(s: Slice, to: () => Vector3, q1: Quaternion, dur: number, arc: number, done: () => void) {
    if (s.root.parent !== this.scene) this.scene.attach(s.root)
    s.where = 'fly'
    this.flights.push({ s, from: s.root.position.clone(), to, q0: s.root.quaternion.clone(), q1, t: 0, dur, arc, done })
  }

  /** It's on a plate (or in the box): the sums, and how the family takes it. */
  private land(s: Slice, t: Target, instant: boolean) {
    const k = this.onTarget(t).length
    if (s.root.parent !== this.scene) this.scene.attach(s.root)
    s.where = t === 'box' ? 'box' : 'plate'
    s.owner = t
    s.root.position.copy(t === 'box' ? boxSpot(this.box, k) : plateSpot(this.plate(t), k))
    s.root.quaternion.copy(turnY(t === 'box' ? boxTurn(k) : plateTurn(k)))
    s.root.userData.pick = t === 'box' ? 'box' : `plate:${t}`
    this.home.delete(s)
    if (this.banded === s) {
      if (this.band.state === 'on' && !instant) this.snapCheese()
      this.banded = null
    }
    if (instant) return
    this.play(sfx.plop)
    if (t === 'box') {
      this.after(0.12, () => sfx.chime())
      this.boxBounce = 0
      if (this.count('box') >= BOX_HOLDS && !this.boxShut) this.after(0.35, () => this.closeBox(false))
    } else {
      const c = this.counts()
      const min = Math.min(...EATERS.map((e) => c[e]))
      this.after(0.1, () => sfx.count(c[t]))
      const who = this.people[t]
      const ahead = c[t] > Math.max(...EATERS.filter((e) => e !== t).map((e) => c[e]))
      if (t === 'nick' && ahead && c[t] >= 2) {
        this.hamItUp()
        // "Kaylee, Mommy's hungry too!", in turn with his ho ho (the turn moves on only when he says one).
        const ham = L.mall.pizza.ham
        if (this.time - (this.spoke.get('nick') ?? -99) >= 2.5) this.talk('nick', ham[this.hams++ % ham.length])
      } else {
        // Sparkle counts round the table: each plate's first and second slice.
        if (c[t] <= 2) this.talk('count', L.mall.pizza.count[t][c[t] - 1], 0.4)
        if (c[t] >= min + 2) {
          // That's a lot for one plate: a giggle and a wiggle.
          who.react('wiggle')
          this.after(0.2, () => sfx.giggle())
        } else who.react('wiggle')
      }
      // Two each and the box still open: the last two are for Agong (the box glows and wiggles).
      if (!this.boxShut && EATERS.every((e) => c[e] >= 2) && this.panLeft > 0) this.after(0.5, () => {
        this.boxBounce = 0
        this.lid = { k: 0, from: BOX_OPEN + 0.6, to: BOX_OPEN }
        sfx.chime()
        if (!this.agongSaid && !this.boxShut) {
          this.agongSaid = true
          this.pev.say(L.mall.pizza.agong)
        }
      })
    }
    if (this.shared !== this.sharedNow) {
      this.sharedNow = this.shared
      this.pev.shared(this.sharedNow)
    }
    this.checkDone()
  }

  private closeBox(instant: boolean) {
    this.boxShut = true
    for (const s of this.onTarget('box')) s.root.userData.pick = 'box'
    if (instant) {
      this.box.lid.rotation.x = 0
      this.lid = { k: 1, from: 0, to: 0 }
      return
    }
    this.lid = { k: 0, from: this.box.lid.rotation.x, to: 0 }
    this.after(0.3, () => {
      sfx.flup()
      this.talk('nick', L.mall.pizza.closed, 0)
      this.sparkles.burst(this.box.at.clone().add(new Vector3(0, 0.15, 0)), 22, 1.6, 2.4, 1, 0.05)
      for (const e of EATERS) this.people[e].react('wiggle')
      this.checkDone()
    })
  }

  private checkDone() {
    if (this.phase !== 'share' || this.panLeft > 0 || !this.boxShut || this.held || this.auto) return
    this.phase = 'done'
    this.after(0.6, () => {
      sfx.cheer()
      EATERS.forEach((e, i) => this.after(i * 0.25, () => this.people[e].react(e === 'kaylee' ? 'wiggle' : 'hop')))
      this.sparkles.burst(new Vector3(0, 1.4, -0.6), 40, 2.2, 2.6, 1.3, 0.06)
      if (!this.fairSaid) {
        this.fairSaid = true
        this.pev.say(L.mall.pizza.fair)
      }
      this.pev.allDone()
    })
  }

  /** Tap a slice on a plate: that person munches it (three bites), with cheese on their chin. */
  private munch(e: EaterId) {
    const s = this.topOf(e)
    const who = this.people[e]
    if (!s) {
      who.react('wiggle')
      this.play(sfx.plink)
      return
    }
    s.bites++
    who.react('wiggle')
    this.play(sfx.chomp)
    this.crumbs.burst(s.root.position.clone().add(new Vector3(0, 0.05, 0)), 8, 0.6, 1.2, 0.6, 0.02)
    if (!this.chins.has(e)) this.chin(e)
    if (s.bites >= 3) {
      s.where = 'gone'
      s.root.visible = false
      this.sparkles.burst(s.root.position, 8, 0.8, 1.2, 0.7, 0.035)
      this.after(0.25, () => sfx.munch())
    } else s.bite.scale.z = 1 - s.bites * 0.3
  }

  /** A blob of cheese on their chin (it stays). */
  private chin(e: EaterId) {
    this.chins.add(e)
    const r = this.people[e].rig
    const [mx, my, mz] = r.face.mouth
    const blob = solid(merge([P.sphere(0.022, CHEESE, { scale: [1.2, 0.8, 0.6] }), P.capsule(0.008, 0.035, CHEESE, { at: [0.008, -0.03, 0] })]), this.bag, 1.2)
    blob.position.set(mx + 0.02, my - 0.12 * r.face.R, mz + 0.01)
    r.head.add(blob)
  }

  // ---------------------------------------------------------------- the cheese

  /** Where the cheese holds on in the pan: near the middle, where the slice's tip was. */
  private panAnchor(s: Slice, out = new Vector3()) {
    const th = panTurn(s.i)
    return this.tray.localToWorld(out.set(Math.sin(th) * MID * 0.25, PAN.y - TABLE.top + 0.03, Math.cos(th) * MID * 0.25))
  }
  /** The second strand starts a little to the side (from the slice's edge, to the next slice). */
  private strandOff(s: Slice) {
    const th = panTurn(s.i) + Math.PI / 2
    return new Vector3(Math.sin(th) * 0.06, 0, Math.cos(th) * 0.06)
  }
  private tipOf(s: Slice, out = new Vector3()) {
    return s.root.localToWorld(out.copy(s.tip))
  }
  /** Daddy's hand (the tug). */
  private hand(out = new Vector3()) {
    const r = this.nick.rig
    return r.armR.localToWorld(out.set(0.05 * r.height, -0.14 * r.height, 0.02 * r.height))
  }
  private bandA(out = new Vector3()) {
    const s = this.banded
    if (!s) return out
    this.panAnchor(s, out)
    if (this.tugK > 0) out.lerp(this.hand(tmp2), this.tugK * this.tugK * (3 - 2 * this.tugK))
    return out
  }

  private snapCheese() {
    if (this.band.state !== 'on') return
    this.band.snap()
    this.play(sfx.snap)
    this.after(0.08, () => sfx.boing())
    if (this.tug === 'on') this.tugSnap()
  }

  /** The tug ends with the cheese on Daddy's nose. */
  private tugSnap() {
    if (this.tug !== 'on') return
    this.tug = 'done'
    if (this.band.state === 'on') {
      this.band.snap()
      this.play(sfx.snap)
    }
    const r = this.nick.rig
    if (!this.nose) {
      const n = solid(merge([P.sphere(0.03, CHEESE, { scale: [1.3, 0.7, 0.9] }), P.capsule(0.012, 0.11, CHEESE, { at: [0, -0.07, 0.01] }), P.sphere(0.02, CHEESE, { at: [0, -0.14, 0.012] })]), this.bag, 1.2)
      n.position.set(0, r.face.headY - 0.02 * r.face.R, 1.02 * r.face.R)
      r.head.add(n)
      this.nose = n
    }
    this.noseT = 0
    this.after(0.15, () => {
      this.nick.react('hop')
      sfx.hoho()
      this.talk('nick', L.mall.pizza.nose, 0)
      this.kaylee.react('wiggle')
      this.ji.react('wiggle')
    })
    this.after(0.5, () => sfx.giggle())
  }

  /** How long the cheese gets before it snaps: the pizza's own stretch, or in the tug a good pull past where Daddy
   *  took hold (never before he has it). */
  private get snapAt() {
    if (this.tug !== 'on') return SNAP[this.pizza]
    return this.tugK < 1 ? Infinity : Math.max(TUG_SNAP, this.tugFrom + 0.5)
  }

  // ---------------------------------------------------------------- Daddy and Mommy

  private hamItUp() {
    this.ham = 0
    this.nick.react('hop')
    this.after(0.2, () => sfx.hoho())
    this.after(0.6, () => this.ji.react('wiggle'))
  }

  private achoo() {
    this.shake = 0
    this.play(sfx.shake)
    this.flakes.burst(this.room.chili.position.clone().add(new Vector3(0, 0.18, 0)), 14, 0.5, 1.2, 0.8, 0.012)
    this.sneeze.t = 0
  }

  /** An onion ring flies onto Mommy's wrist (three, then she eats one). */
  private bracelet() {
    const rings = this.room.rings.rings
    if (this.worn >= rings.length) {
      // She eats one off her wrist: chomp.
      const b = this.bracelets.pop()
      b?.removeFromParent()
      this.worn--
      rings[this.worn].visible = true
      this.ji.react('wiggle')
      this.play(sfx.chomp)
      this.talk('ji', L.mall.pizza.crunch, 1.5)
      return
    }
    const ring = rings[this.worn]
    ring.visible = false
    const r = this.ji.rig
    const b = solid(merge([P.torus(0.05, 0.017, '#E7A94B', { rot: [Math.PI / 2, 0, 0] })]), this.bag, 1.5)
    const k = this.worn++
    this.scene.add(b)
    b.position.copy(ring.getWorldPosition(new Vector3()))
    this.play(sfx.fwip)
    const local = new Vector3(0.05 * r.height, -(0.1 + k * 0.022) * r.height, 0.005 * r.height)
    this.tosses.push({
      o: b,
      from: b.position.clone(),
      to: () => r.armR.localToWorld(local.clone()),
      t: 0,
      dur: 0.45,
      done: () => {
        r.armR.add(b)
        b.position.copy(local)
        b.rotation.set(0, 0, 0)
        this.bracelets.push(b)
        this.ji.react('wave')
        this.play(sfx.chime)
        this.talk('ji', L.mall.pizza.rings[k] ?? L.mall.pizza.rings[0], 1.5)
      },
    })
  }

  // ---------------------------------------------------------------- per frame

  private play(f: () => void) {
    f()
  }
  private ready(key: string, every: number) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return false
    this.cool.set(key, this.time)
    return true
  }
  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.serving(dt)
    // ---- The slice in her hand (or doing a tap's go) ----
    const h = this.held?.moved ? this.held : null
    const finger = h ? new Vector2(h.x, h.y) : this.autoFinger(dt)
    const s = h?.s ?? this.auto?.s ?? null
    if (finger && s) this.holdAt(s, finger, dt)
    // ---- Slices flying to plates, the box, or home ----
    for (const f of [...this.flights]) {
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      const e = k * k * (3 - 2 * k)
      f.s.root.position.lerpVectors(f.from, f.to(), e).y += bell(k) * f.arc
      f.s.root.quaternion.slerpQuaternions(f.q0, f.q1, e)
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.done()
      }
    }
    for (const o of [...this.tosses]) {
      o.t += dt / o.dur
      const k = Math.min(1, o.t)
      o.o.position.lerpVectors(o.from, o.to(), k).y += bell(k) * 0.3
      o.o.rotation.x = k * 6
      if (k >= 1) {
        this.tosses.splice(this.tosses.indexOf(o), 1)
        o.done()
      }
    }
    // ---- The cheese: stretching (a creak each bit longer), snapping past its length ----
    if (this.tug === 'on' && this.banded && this.band.state === 'on' && this.band.length > 0.14) {
      this.tugK = Math.min(1, this.tugK + dt / 0.5)
      if (this.tugK < 1) this.tugFrom = this.band.length
    }
    if (this.tug !== 'on') this.tugK = Math.max(0, this.tugK - dt / 0.5)
    if (this.band.state !== 'off') {
      right.set(1, 0, 0).applyQuaternion(this.rig.camera.quaternion)
      const sl = this.banded
      const a = sl ? this.bandA(new Vector3()) : this.lastA
      const b = sl ? this.tipOf(sl, new Vector3()) : this.lastB
      this.lastA.copy(a)
      this.lastB.copy(b)
      this.band.update(dt, t, a, b, right)
      if (this.band.state === 'on') {
        const L = this.band.length
        const n = Math.floor(L / 0.12)
        if (n > this.stretchStep) {
          this.stretchStep = n
          if (this.ready('stretch', 0.06)) sfx.stretch(n)
        }
        if (L > this.snapAt) this.snapCheese()
      }
      if (this.band.gone && this.banded && this.banded.where !== 'held' && this.banded.where !== 'fly') this.banded = null
    }
    // ---- Glows: the plate that's behind (gold), the one she's over (pink), Agong's box when it's time ----
    const c = this.counts()
    const lagging = this.phase === 'share' ? behind(c) : []
    const pulse = 0.55 + Math.sin(t * 5) * 0.3
    for (const p of this.plates) {
      fade(p.glow, lagging.includes(p.id) ? pulse : 0, dt * 8)
      fade(p.hover, this.hover === p.id ? 0.9 : 0, dt * 14)
      p.hover.scale.set(1 + (this.hover === p.id ? Math.sin(t * 10) * 0.04 : 0), 0.15, 1 + (this.hover === p.id ? Math.sin(t * 10) * 0.04 : 0))
    }
    const boxTime = !this.boxShut && this.phase === 'share' && (EATERS.every((e) => c[e] >= 2) || this.panLeft === 0)
    fade(this.box.glow, boxTime ? pulse : 0, dt * 8)
    fade(this.box.hover, this.hover === 'box' ? 0.9 : 0, dt * 14)
    // ---- Agong's box: the lid, a happy bounce ----
    this.lid.k = Math.min(1, this.lid.k + dt / 0.35)
    const lk = this.lid.k
    this.box.lid.rotation.x = this.lid.from + (this.lid.to - this.lid.from) * (this.lid.to === 0 ? lk * lk : 1 - (1 - lk) ** 2) + (this.lid.to !== 0 ? wobble(lk, 2) * 0.08 : 0)
    this.boxBounce = Math.min(1, this.boxBounce + dt / 0.5)
    this.box.root.scale.set(1, 1 + wobble(this.boxBounce, 2) * 0.12, 1)
    // ---- The family: they watch the slice in her hand (or the pizza) ----
    const look = s ? s.root.position : tmp.set(PAN.x, PAN.y + 0.2, PAN.z)
    for (const e of EATERS) {
      const p = this.people[e]
      p.lookAt(look.x, look.y, look.z)
      p.update(dt, t)
    }
    this.daddyFrame(dt, t)
    // ---- Stuck: Sparkle says what to do when the finger shows (or the menu waits), once each time ----
    if (this.time - this.lastTouch > STUCK_S && this.hintedAt !== this.lastTouch) {
      const box = !this.boxShut && EATERS.every((e) => c[e] >= 2)
      const hint = this.phase === 'menu' ? L.mall.pizza.hint.menu : this.hintAt() ? (box ? L.mall.pizza.hint.box : L.mall.pizza.hint.slice) : null
      if (hint) {
        this.hintedAt = this.lastTouch
        this.pev.say(hint)
      }
    }
    // ---- The server ----
    const sv = this.room.server
    this.serverLife.update(dt)
    this.bow = Math.min(1, this.bow + dt / 0.9)
    sv.body.rotation.x = bell(this.bow) * 0.6
    sv.head.rotation.x = bell(this.bow) * 0.3
    // ---- The pokeables ----
    const r = this.room
    this.sip = Math.min(1, this.sip + dt / 2.2)
    r.soda.level.scale.y = 1 - 0.4 * bell(Math.min(1, this.sip * 1.6)) * (this.sip < 0.6 ? 1 : (1 - this.sip) / 0.4)
    this.shake = Math.min(1, this.shake + dt / 0.6)
    r.chili.rotation.z = Math.sin(this.shake * Math.PI * 6) * 0.5 * (1 - this.shake)
    r.chili.position.y = TABLE.top + bell(this.shake) * 0.08
    this.napkinPop = Math.min(1, this.napkinPop + dt / 0.5)
    r.napkins.scale.set(1, 1 + wobble(this.napkinPop, 2) * 0.25, 1)
    this.signGlow = Math.max(0, this.signGlow - dt / 1.6)
    ;(r.sign.halo.material as MeshBasicMaterial).opacity = 0.75 * this.signGlow * (0.8 + Math.sin(t * 12) * 0.2)
    this.logoSpin = Math.min(1, this.logoSpin + dt / 0.8)
    r.sign.logo.rotation.z = (1 - (1 - this.logoSpin) ** 3) * Math.PI * 2
    r.sign.logo.scale.setScalar(1 + bell(this.logoSpin) * 0.25)
    r.falls.tex.offset.y -= dt * 0.45
    r.falls.mat.color.lerp(this.tintGoal, Math.min(1, dt * 4))
    for (const f of [this.sparkles, this.crumbs, this.bubbles, this.flakes, this.papers]) f.update(dt)
  }

  /** Daddy's own moves on top of his life: reaching for the cheese, hamming it up, the sneeze, his cheesy nose. */
  private daddyFrame(dt: number, t: number) {
    const r = this.nick.rig
    // The tug: his right arm reaches out across the table for the cheese.
    const reach = this.tugK * this.tugK * (3 - 2 * this.tugK)
    r.armR.rotation.x = -1.45 * reach
    r.armR.rotation.y = -0.4 * reach
    r.body.rotation.x = 0.25 * reach
    // Hamming it up: he points at Mommy's plate and shakes his head.
    this.ham = Math.min(1, this.ham + dt / 1.6)
    const hk = bell(this.ham)
    r.armL.rotation.z = -1.35 * Math.min(1, hk * 2.2)
    r.head.rotation.z = Math.sin(this.ham * Math.PI * 6) * 0.18 * hk
    // The chili: ah... ah... CHOO!
    if (this.sneeze.t >= 0) {
      const st = (this.sneeze.t += dt)
      if (st > 0.5 && st - dt <= 0.5) sfx.ahh()
      if (st > 1.35 && st - dt <= 1.35) {
        sfx.choo()
        this.nick.react('hop')
        this.after(0.3, () => this.talk('nick', L.mall.pizza.spicy, 4))
        this.flakes.burst(r.head.localToWorld(new Vector3(0, r.face.headY, r.face.R)), 18, 1.2, 0.6, 1, 0.014)
        this.after(0.4, () => {
          this.kaylee.react('wiggle')
          sfx.giggle()
        })
      }
      const back = st < 1.35 ? clamp((st - 0.5) / 0.8, 0, 1) : Math.max(0, 1 - (st - 1.35) / 0.1)
      const fwd = st >= 1.35 ? bell(clamp((st - 1.35) / 0.5, 0, 1)) : 0
      r.head.rotation.x = -0.4 * back + 0.35 * fwd
      if (st > 2) {
        this.sneeze.t = -1
        r.head.rotation.x = 0
      }
    }
    // His cheesy nose swings.
    if (this.nose) {
      this.noseT += dt
      this.nose.rotation.z = Math.sin(this.noseT * 6) * 0.5 * Math.exp(-this.noseT * 1.2) + Math.sin(t * 1.7) * 0.05
    }
  }

  // ---------------------------------------------------------------- camera, screen space

  protected shot(): Shot {
    // The table with its plates, the pizza and Agong's box, and the family's faces; on a tall screen more above.
    if (this.w < this.h) return { center: new Vector3(0.06, 1.0, -0.25), half: new Vector3(1.5, 0.7, 0.6), yaw: 0, pitch: 28, minDist: 4 }
    return { center: new Vector3(0.05, 1.08, -0.25), half: new Vector3(1.5, 0.4, 0.5), yaw: 0, pitch: 24, minDist: 4 }
  }

  private screen(world: Vector3, r = 0) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: Math.abs(e.x - c.x) * this.w * 0.5 }
  }

  private onPlane(x: number, y: number, z: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near)
    return near.addScaledVector(dir, (z - near.z) / (dir.z || 1e-6))
  }

  private plate(e: EaterId) {
    return this.plates.find((p) => p.id === e)!
  }
  private targets(): Target[] {
    return this.boxShut ? [...EATERS] : [...EATERS, 'box']
  }
  private targetScreen(t: Target) {
    return t === 'box' ? this.screen(tmp.copy(this.box.at).add(new Vector3(0, 0.04, 0)), 0.2) : this.screen(tmp.copy(this.plate(t).at).add(new Vector3(0, 0.02, 0)), PLATE_R)
  }

  /** Which plate (or the box) a slice at this screen point would land on: one it's near; lifted above the pizza, the
   *  one in its column; down at the pizza, none (it goes back). */
  private targetAt(x: number, y: number): Target | null {
    const far = this.screen(tmp.set(PAN.x, PAN.y, PAN.z - PAN.r))
    const line = (far?.y ?? 0) - 30
    let best: Target | null = null
    let score = Infinity
    for (const t of this.targets()) {
      const s = this.targetScreen(t)
      if (!s) continue
      const rr = Math.max(s.r * 1.3, 52) + SLOP
      const d = Math.hypot(x - s.x, y - s.y)
      const near = d < rr ? d / rr : Infinity
      const col = y < line ? 1 + Math.hypot(x - s.x, (y - s.y) * 0.4) / 10000 : Infinity
      const sc = Math.min(near, col)
      if (sc < score) {
        score = sc
        best = t
      }
    }
    return best
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id.startsWith('plate:')) {
      const p = this.plate(id.slice(6) as EaterId)
      return { at: p.at.clone().add(new Vector3(0, 0.03, 0.02)), r: PLATE_R * 0.95, prio: 3, max: 150 }
    }
    if (id.startsWith('family:')) {
      const r = this.people[id.slice(7) as EaterId].rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: 1, max: 130 }
    }
    const r = this.room
    switch (id) {
      case 'pan':
        return (this.phase === 'share' || this.phase === 'done') && this.slices.some((s) => s.where === 'pan') ? { at: new Vector3(PAN.x, PAN.y + 0.02, PAN.z), r: PAN.r * 0.95, prio: 4, max: 230 } : null
      case 'box':
        return { at: this.box.at.clone().add(new Vector3(0, 0.06, 0)), r: 0.2, prio: 3, max: 140 }
      case 'soda':
        return { at: r.soda.root.position.clone().add(new Vector3(0, 0.15, 0)), r: 0.1, max: 110 }
      case 'rings':
        return { at: r.rings.root.position.clone().add(new Vector3(0, 0.07, 0)), r: 0.13, max: 110 }
      case 'chili':
        return { at: r.chili.position.clone().add(new Vector3(0, 0.09, 0)), r: 0.08, max: 100 }
      case 'napkins':
        return { at: r.napkins.position.clone().add(new Vector3(0, 0.09, 0)), r: 0.11, max: 100 }
      case 'server':
        return this.serve.t < 0 ? { at: r.server.root.position.clone().add(new Vector3(0, 0.85, 0)), r: 0.28, prio: 1, max: 130 } : null
      case 'sign':
        return { at: new Vector3(SIGN.x, SIGN.y, r.sign.root.position.z), r: 0.45, prio: 0, max: 150 }
      case 'window':
        return { at: new Vector3(WINDOW.x0 + 0.55, WINDOW.y1 - 0.35, r.falls.mesh.position.z), r: 0.35, prio: 0, max: 140 }
    }
    return null
  }

  protected hintAt() {
    if (this.held || this.auto || (this.phase !== 'share' && this.phase !== 'done')) return null
    const inPan = this.slices.find((s) => s.where === 'pan')
    if (inPan) return inPan.root.getWorldPosition(new Vector3())
    if (this.boxShut) return null
    // The pan is empty and Agong's box is still open: a slice from the fullest plate.
    const c = this.counts()
    const e = [...EATERS].sort((a, b) => c[b] - c[a])[0]
    return this.topOf(e)?.root.position.clone() ?? null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const plates: Record<string, number[] | null> = {}
    for (const e of EATERS) {
      const s = this.targetScreen(e)
      plates[e] = s ? [Math.round(s.x), Math.round(s.y), Math.round(s.r)] : null
    }
    const bs = this.targetScreen('box')
    return {
      game: 'pizza',
      phase: this.phase,
      pizza: this.pizza,
      shared: this.shared,
      counts: this.counts(),
      inBox: this.count('box'),
      boxClosed: this.boxShut,
      held: this.held?.moved ? this.held.s.i : (this.auto?.s.i ?? null),
      hover: this.hover,
      band: this.band.state,
      bandLen: Math.round(this.band.length * 100) / 100,
      snapAt: Math.round(this.snapAt * 100) / 100,
      tug: this.tug,
      touches: this.touches,
      liftPx: LIFT_PX,
      pan: this.slices.filter((s) => s.where === 'pan').map((s) => pt(s.root.getWorldPosition(new Vector3()))),
      panAt: pt(new Vector3(PAN.x, PAN.y, PAN.z)),
      plates,
      box: bs ? [Math.round(bs.x), Math.round(bs.y)] : null,
    }
  }
}
