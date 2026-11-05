// Lunch on the deck at Ao Prao (plan: planning/around-the-world/thailand/samet-trip.html, greybox 6): Dad's photo 2, on
// the resort deck above the cove (island/layout.ts DECK, the island's own deck from island/props.ts resortDeck). A place,
// not a stop: no stamp, 45-90 s, 8-15 touches.
//
// Kaylee sits at the table across from Daddy, the cove of turquoise water and the strip of beach below the rail:
//   - The bread basket: tap it (or Daddy) and he passes her a roll; tap her (or the roll) and she takes a bite: three
//     bites, crumbs everywhere, and the basket's always got another.
//   - A fresh coconut with a pink straw arrives: hold a finger on it and she sips (slurp, slurp), let go and she stops;
//     it tips toward her as it empties, and the last drops are a big SLURP.
//   - Mango sticky rice arrives: tap the plate, a bite flies to her; five bites and the plate shines.
//   - Pokes: the cream umbrellas flap, a monitor lizard strolls along the sand below (tap: tongue out, it hurries), a
//     squirrel in the pandanus (tap: it runs up), Mommy takes the photo (flash), the sea splashes where she taps it.
// When she has had a roll, the coconut and the rice: a 🍽️ badge, the way back to the island and a way down to hide
// and seek at the driftwood tree.
//
// Talk (lines.ts L.samet.lunch): Daddy and Mommy in their own voices, Sparkle's one line and the stuck hints
// (spendHint), played by the screen's TripGuide. Every number that decides the feel is a knob (?feel=1).
import { Fog, Group, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { spendHint, type Line } from '../../../../../../sdk'
import { knobs, watch } from '../../../../../kit/knobs'
import { L } from '../../../lines'
import { noise as hiss, sfx, tone } from '../../../../../kit/sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import { CameraRig, type Shot } from '../../../../../engine3d/camera'
import { Bag } from '../../../../../engine3d/dispose'
import { merge, solid } from '../../../../../engine3d/geo'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { Particles } from '../../../../../engine3d/particles'
import { applyBands, makeLights, PAL } from '../../../../../engine3d/toon'
import type { World3D } from '../../../../../engine3d/View3D'
import { Avatar } from '../../../characters/avatar'
import { FAMILY } from '../../../characters/family'
import { Member } from '../../../characters/member'
import { monitorModel, squirrelModel, type Model } from '../book/models'
import { at as atFrame, DECK } from '../island/layout'
import { resortDeck } from '../island/props'
import { buildIsland, DAY, type Island, type TimeOfDay } from '../island/scenery'
import { breadBasket, coconut, deckUmbrella, pandanus, roll, stickyRice } from './props'

const FILE = 'src/world/places/thailand/activities/samet-trip/hideseek/lunch.ts'
const LUNCH = knobs('lunchDeck', 'Lunch on the deck', FILE, {
  sip: { value: 0.16, min: 0.03, max: 0.6, step: 0.01, label: 'Sips the coconut at', unit: '/s', note: '1 = the whole coconut: 0.16 ≈ 6 s of holding her finger on it' },
  rollBites: { value: 3, min: 1, max: 6, step: 1, label: 'Bites in a roll' },
  riceBites: { value: 5, min: 2, max: 8, step: 1, label: 'Bites of mango sticky rice' },
  toss: { value: 0.6, min: 0.2, max: 1.5, step: 0.05, label: 'A roll flies over in', unit: 's' },
  coconutAt: { value: 5, min: 0, max: 30, step: 0.5, label: 'The coconut comes after', unit: 's', note: 'or as soon as she finishes her first roll' },
  riceAt: { value: 14, min: 0, max: 60, step: 0.5, label: 'The rice comes after', unit: 's', note: 'or once the coconut is half gone' },
  pitch: { value: 36, min: 5, max: 60, step: 1, label: 'Camera looks down', unit: '°' },
  box: { value: 2.3, min: 1, max: 5, step: 0.05, label: 'Shows round the table', unit: 'm', note: 'half the width across the screen' },
  tallBox: { value: 1.5, min: 0.8, max: 4, step: 0.05, label: '…on a tall screen', unit: 'm' },
})

export interface LunchStart {
  time?: TimeOfDay
}
export interface LunchEvents {
  /** Mommy took the photo (the screen flashes). */
  photo(): void
  /** She had a roll, the coconut and the rice. */
  done(): void
  /** Someone talks (`mute`: a stuck hint shown without its voice). */
  say(line: Line, mute?: boolean): void
}

const T_ = L.samet.lunch

export const LUNCH_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'thing' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'basket', label: 'The bread basket', kind: 'thing' },
  { id: 'roll', label: 'A bread roll', kind: 'thing' },
  { id: 'coconut', label: 'A coconut to drink', kind: 'thing' },
  { id: 'plate', label: 'Mango sticky rice', kind: 'thing' },
  { id: 'umbrella:0', label: 'An umbrella', kind: 'thing' },
  { id: 'umbrella:1', label: 'An umbrella', kind: 'thing' },
  { id: 'lizard', label: 'A monitor lizard', kind: 'thing' },
  { id: 'squirrel', label: 'A squirrel', kind: 'thing' },
]

const DEG = 180 / Math.PI
const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
/** The table she sits at (deck-local u, v), and the table top's height above the deck. */
const T = { u: -2.5, v: 0.8 }
const TOP = 0.78

const slurp = (big = false) => hiss(big ? 0.6 : 0.16, big ? 0.16 : 0.07, 'bandpass', big ? 700 : 1100, big ? 300 : 800, 0, 2.5)
const ding = () => tone(1320, 1320, 0.25, 0.06, 'triangle')
const knock = () => [0, 0.12].forEach((d) => tone(240, 200, 0.06, 0.08, 'triangle', d))
const chitter = () => [0, 0.06, 0.12, 0.18].forEach((d, i) => tone(2200 + i * 200, 2600, 0.04, 0.04, 'square', d))
const shutter = () => {
  hiss(0.06, 0.12, 'highpass', 3000, 2000)
  tone(1800, 1800, 0.03, 0.05, 'square', 0.07)
}

interface Flyer {
  g: Group
  from: Vector3
  t: number
  dur: number
  done: () => void
}

export class Lunch implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private bag = new Bag()
  private lights = makeLights(this.scene)
  private isl: Island
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private unwatch: () => void
  private w = 1
  private h = 1
  private tall = false
  private time = 0
  private deckY: number
  private seaYaw: number
  private lastTouch = 0
  private finger: { id?: string } | null = null

  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private reachT = -1

  private basket: ReturnType<typeof breadBasket>
  private held: Group | null = null
  private bites = 0
  private rollsEaten = 0
  private flyers: Flyer[] = []
  private coco: ReturnType<typeof coconut>
  private cocoK = -1
  private milk = 1
  private sipping = false
  private slurpT = 0
  private cocoWob = 0
  private plate: ReturnType<typeof stickyRice>
  private plateK = -1
  private riceLeft = 0
  private umbrellas: { u: ReturnType<typeof deckUmbrella>; flap: number }[] = []
  private lizard: Model
  private liz = { s: -6, dir: 1, speed: 0.45, flick: 0, hurry: 0 }
  private squirrel: Model
  private sq = { k: 0.3, goal: 0.3, chit: 0 }
  private pand: ReturnType<typeof pandanus>
  private crumbs: Particles
  private sparkle: Particles
  private spray: Particles
  private doneAt = -1
  private turn = { pass: 0, photo: 0 }
  private said = new Set<string>()
  private fullAt = -1
  private hintOn = false
  private counts = { taps: 0, pokes: 0, rolls: 0, bites: 0, sips: 0, sipSecs: 0, rice: 0, photos: 0, splashes: 0 }

  constructor(
    private renderer: WebGLRenderer,
    start: LunchStart,
    private events: LunchEvents,
  ) {
    const { scene, bag } = this
    const time = start.time ?? 'noon'
    scene.fog = new Fog(DAY[time].haze, 170, 950)
    applyBands()
    this.rig.fov = 40
    this.rig.lag = 0.4
    this.rig.camera.far = 3200
    this.seaYaw = DECK.face

    // ---- The island, the deck (the island's own), its umbrellas, the pandanus beside it.
    this.isl = buildIsland(bag)
    scene.add(this.isl.root)
    this.isl.setTime(time)
    this.isl.lagoon.waves.height = 0.14
    const deck = resortDeck((p) => Math.max(0, this.isl.ground.heightAt(p.x, p.z)), false)
    this.deckY = deck.y
    scene.add(solid(merge(deck.parts), bag, 2))
    // (By the rail, behind the tables: from up the slope the camera sees under them to the lunch.)
    for (const u of [-4.6, 0.6]) {
      const um = deckUmbrella(bag)
      um.root.position.copy(this.D(u, 2.3, 0))
      scene.add(um.root)
      this.umbrellas.push({ u: um, flap: 0 })
    }
    this.pand = pandanus(bag, 9)
    const pp = this.D(-5.6, 2.2)
    pp.y = this.ground(pp.x, pp.z)
    this.pand.root.position.copy(pp)
    scene.add(this.pand.root)

    // ---- The family: Kaylee and Daddy across the table, Mommy at the end of the deck with her phone.
    this.kaylee = new Avatar(bag)
    scene.add(this.kaylee.root)
    const ks = this.D(T.u - 0.85, T.v, 0.6)
    const face = Math.atan2(DECK.t.x, DECK.t.z)
    this.kaylee.place(ks.x, ks.y, ks.z, face * DEG)
    this.kaylee.setPose('sit')
    const fam = (id: string) => new Member({ ...FAMILY.find((m) => m.id === id)!, spot: null }, bag)
    this.nick = fam('nick')
    this.ji = fam('ji')
    scene.add(this.nick.root, this.ji.root)
    const ns = this.D(T.u + 0.85, T.v, 0.6)
    this.nick.place(ns.x, ns.y - 0.1 * this.nick.height, ns.z, (face + Math.PI) * DEG, 'sit')
    const ms = this.D(T.u - 1.9, T.v + 1.2)
    const mt = this.D(T.u, T.v)
    this.ji.place(ms.x, ms.y, ms.z, Math.atan2(mt.x - ms.x, mt.z - ms.z) * DEG, 'stand')

    // ---- On the table: the basket by Daddy; the coconut and the plate arrive in front of her.
    this.basket = breadBasket(bag)
    this.basket.root.position.copy(this.D(T.u + 0.28, T.v + 0.2, TOP))
    scene.add(this.basket.root)
    this.coco = coconut(bag)
    this.coco.root.position.copy(this.D(T.u - 0.3, T.v - 0.12, TOP))
    this.coco.root.rotation.y = face
    this.coco.root.visible = false
    scene.add(this.coco.root)
    this.plate = stickyRice(bag, Math.round(LUNCH.riceBites))
    this.riceLeft = this.plate.pieces.length
    this.plate.root.position.copy(this.D(T.u - 0.22, T.v + 0.25, TOP))
    this.plate.root.visible = false
    scene.add(this.plate.root)

    // ---- Life below: a monitor lizard strolling along the sand, a squirrel on the pandanus.
    this.lizard = monitorModel(bag)
    scene.add(this.lizard.root)
    this.squirrel = squirrelModel(bag)
    this.squirrel.root.scale.setScalar(0.8)
    scene.add(this.squirrel.root)

    this.crumbs = new Particles({ kind: 'spray', count: 120, colors: ['#E0A65A', '#F6DFB0', '#C8955A'], gravity: 6 }, bag)
    this.sparkle = new Particles({ kind: 'spray', count: 160, colors: ['#FFFFFF', '#FFF6B8', PAL.gold, PAL.pink], gravity: -0.6 }, bag)
    this.spray = new Particles({ kind: 'spray', count: 120, colors: ['#FFFFFF', '#EAFBFF', '#C9F6EC'], gravity: 9 }, bag)
    scene.add(this.crumbs.mesh, this.sparkle.mesh, this.spray.mesh)

    this.unwatch = watch('lunch', () => ({
      'coconut left': [this.milk, 1],
      'sipping': [this.sipping ? 1 : 0, 1],
    }))
  }

  /** A point on the deck (deck-local u along it, v toward the sea), `up` above its top. */
  private D(u: number, v: number, up = 0, out = new Vector3()) {
    const p = atFrame(DECK, u, v)
    return out.set(p.x, this.deckY + up, p.z)
  }
  private ground(x: number, z: number) {
    return this.isl.ground.heightAt(x, z)
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

  update(dt: number) {
    const t = (this.time += dt)
    this.meal(dt, t)
    this.life(dt, t)
    for (const p of [this.crumbs, this.sparkle, this.spray]) p.update(dt)
    const c = this.D(T.u, T.v + 1)
    this.isl.lagoon.update(t, c.x, c.z)
    this.lights.follow(c.x, 0, c.z)
    this.isl.update(dt, t, this.rig.camera.position.x, this.rig.camera.position.z, this.lights)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
    this.drawHint(t)
  }

  // ---------------------------------------------------------------- lunch

  /** Says it once a visit to the deck. */
  private once(key: string, l: Line) {
    if (this.said.has(key)) return
    this.said.add(key)
    this.events.say(l)
  }

  private meal(dt: number, t: number) {
    if (t > 0.6) {
      this.once('hi', T_.hi)
      this.once('start', T_.start)
    }
    // The coconut and the rice arrive (a pop and a ding).
    if (this.cocoK < 0 && (t > LUNCH.coconutAt || this.rollsEaten > 0)) {
      this.cocoK = 0
      this.coco.root.visible = true
      ding()
      this.once('coconut', T_.coconut)
    }
    if (this.plateK < 0 && (t > LUNCH.riceAt || (this.cocoK >= 0 && this.milk < 0.5))) {
      this.plateK = 0
      this.plate.root.visible = true
      ding()
      this.once('rice', T_.rice)
    }
    // (Daddy's "hide and seek?" waits for Mommy's "aroi" to finish.)
    if (this.fullAt > 0 && t > this.fullAt) {
      this.fullAt = -1
      this.events.say(T_.full)
    }
    for (const [k, g] of [[this.cocoK, this.coco.root], [this.plateK, this.plate.root]] as const) {
      if (k < 0 || k >= 1) continue
      const s = 1 + Math.sin(Math.min(1, k) * Math.PI) * 0.25
      g.scale.setScalar(Math.min(1, k * 2.2) * s)
    }
    if (this.cocoK >= 0 && this.cocoK < 1) this.cocoK = Math.min(1, this.cocoK + dt / 0.5)
    if (this.plateK >= 0 && this.plateK < 1) this.plateK = Math.min(1, this.plateK + dt / 0.5)

    // Sipping: her finger on the coconut.
    if (this.sipping && this.milk > 0) {
      this.counts.sipSecs += dt
      this.milk = Math.max(0, this.milk - LUNCH.sip * dt)
      if ((this.slurpT -= dt) <= 0) {
        this.slurpT = 0.34
        slurp()
      }
      if (this.milk <= 0) {
        // The last drops: a big slurp.
        slurp(true)
        this.cocoWob = 1
        this.kaylee.react('wiggle')
        this.once('slurp', T_.slurp)
        this.sparkle.burst(this.coco.root.position.x, this.coco.root.position.y + 0.4, this.coco.root.position.z, 14, 1, 1.2, 0.08)
      }
    }
    // It tips toward her as it empties; a wobble on a knock or the last slurp; the straw bobs while she sips.
    this.cocoWob *= 1 - ease(dt, 4)
    this.coco.body.rotation.z = (1 - this.milk) * 0.45 + Math.sin(t * 22) * 0.08 * this.cocoWob
    this.coco.straw.rotation.x = this.sipping && this.milk > 0 ? Math.sin(t * 14) * 0.08 : 0

    // Rolls and bites in flight.
    for (let i = this.flyers.length - 1; i >= 0; i--) {
      const f = this.flyers[i]
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      const to = this.mouth()
      f.g.position.lerpVectors(f.from, to, k)
      f.g.position.y += Math.sin(Math.PI * k) * 0.35
      f.g.rotation.x = k * 6
      if (k >= 1) {
        this.flyers.splice(i, 1)
        f.done()
      }
    }
    if (this.held) {
      this.held.position.copy(this.mouth())
      this.held.position.y -= 0.12
    }
    // Daddy's arm reaching over with a roll.
    if (this.reachT >= 0) {
      this.reachT += dt / 0.6
      const k = Math.sin(Math.PI * Math.min(1, this.reachT))
      this.nick.rig.armR.rotation.x = -1.4 * k
      if (this.reachT >= 1) {
        this.reachT = -1
        this.nick.rig.armR.rotation.x = 0
      }
    }
    if (this.doneAt < 0 && this.rollsEaten > 0 && this.milk <= 0 && this.riceLeft <= 0) {
      this.doneAt = t
      this.events.done()
      this.fullAt = t + 2.4
    }
  }

  /** In front of her mouth (where food goes). */
  private mouth(out = new Vector3()) {
    const k = this.kaylee.root.position
    return out.set(k.x + DECK.t.x * 0.28, k.y + this.kaylee.height * 0.62, k.z + DECK.t.z * 0.28)
  }

  private passRoll() {
    if (this.held || this.flyers.length) {
      this.nick.react('hop')
      return
    }
    this.counts.rolls++
    const r = roll(this.bag)
    const from = this.basket.root.position.clone().setY(this.basket.root.position.y + 0.2)
    r.position.copy(from)
    this.scene.add(r)
    this.reachT = 0
    this.nick.react('wiggle')
    sfx.fwip()
    // (The first few rolls; after that he just passes them.)
    if (this.turn.pass < T_.pass.length) this.events.say(T_.pass[this.turn.pass++])
    // (A roll goes out of the basket while it's flying; it refills.)
    const shown = this.basket.rolls.filter((x) => x.visible)
    if (shown.length) shown[shown.length - 1].visible = false
    this.flyers.push({
      g: r,
      from,
      t: 0,
      dur: LUNCH.toss,
      done: () => {
        this.held = r
        this.bites = 0
        r.rotation.set(0, 0, 0)
        sfx.pop()
        if (!this.basket.rolls.some((x) => x.visible)) this.basket.rolls.forEach((x) => (x.visible = true))
      },
    })
  }
  private bite() {
    const r = this.held
    if (!r) return false
    this.bites++
    this.counts.bites++
    sfx.munch()
    this.kaylee.react('wiggle')
    const m = this.mouth()
    this.crumbs.burst(m.x, m.y - 0.1, m.z, 10, 0.9, 1.0, 0.04)
    const n = Math.round(LUNCH.rollBites)
    r.scale.setScalar(Math.max(0.2, 1 - this.bites / n))
    if (this.bites >= n) {
      this.scene.remove(r)
      this.held = null
      this.rollsEaten++
    }
    return true
  }
  private riceBite() {
    if (this.plateK < 1 || this.riceLeft <= 0 || this.flyers.length) return
    const piece = this.plate.pieces[this.plate.pieces.length - this.riceLeft]
    this.riceLeft--
    this.counts.rice++
    const from = piece.getWorldPosition(new Vector3())
    piece.visible = false
    const g = new Group()
    g.add(piece.clone())
    g.children[0].visible = true
    g.children[0].position.set(0, 0, 0)
    g.position.copy(from)
    this.scene.add(g)
    sfx.fwip()
    this.flyers.push({
      g,
      from,
      t: 0,
      dur: 0.4,
      done: () => {
        this.scene.remove(g)
        sfx.munch()
        this.kaylee.react('wiggle')
        if (this.riceLeft <= 0) {
          const p = this.plate.root.position
          this.sparkle.burst(p.x, p.y + 0.1, p.z, 20, 1, 1.2, 0.08)
          tone(880, 1320, 0.3, 0.06, 'triangle')
          this.once('aroi', T_.aroi)
        }
      },
    })
  }

  // ---------------------------------------------------------------- life

  private life(dt: number, t: number) {
    // The umbrellas' skirts flap in the breeze (a lot after a tap).
    for (const u of this.umbrellas) {
      u.flap *= 1 - ease(dt, 1.6)
      u.u.skirt.rotation.x = Math.sin(t * 7 + u.u.root.position.x) * (0.03 + u.flap * 0.18)
      u.u.skirt.scale.y = 1 + Math.sin(t * 9) * (0.05 + u.flap * 0.4)
      u.u.can.rotation.z = Math.sin(t * 5) * u.flap * 0.1
    }
    // The monitor lizard strolls back and forth along the sand below, tongue flicking.
    const L = this.liz
    L.hurry *= 1 - ease(dt, 0.6)
    L.s += L.dir * L.speed * (1 + L.hurry * 4) * dt
    if (L.s > 6 || L.s < -7) L.dir = -L.dir
    const lp = atFrame(DECK, L.s, 7.5)
    this.lizard.root.position.set(lp.x, Math.max(0, this.ground(lp.x, lp.z)), lp.z)
    this.lizard.root.rotation.y = Math.atan2(DECK.t.x * L.dir, DECK.t.z * L.dir)
    const body = this.lizard.parts.body
    if (body) body.rotation.y = Math.sin(t * 6 * (1 + L.hurry)) * 0.12
    const tongue = this.lizard.parts.tongue
    L.flick = Math.max(0, L.flick - dt)
    if (tongue) tongue.scale.z = L.flick > 0 || Math.sin(t * 1.3) > 0.97 ? 1 : 0.05
    // The squirrel runs up and down the pandanus trunk.
    const S = this.sq
    if (Math.random() < dt * 0.15) S.goal = 0.15 + Math.random() * 0.75
    S.k += (S.goal - S.k) * ease(dt, 2.5)
    const base = this.pand.root.position
    const top = this.pand.top
    this.squirrel.root.position.set(base.x + top.x * S.k + 0.12, base.y + 0.9 + (top.y - 0.9) * S.k, base.z + top.z * S.k)
    this.squirrel.root.rotation.set(0, this.seaYaw + Math.PI, 0)
    if (S.chit > 0) S.chit -= dt
    // Everyone looks at her (Mommy at her phone between).
    const k = this.kaylee.root.position
    this.nick.lookAt(k.x, k.y + 0.5, k.z)
    this.ji.lookAt(k.x, k.y + 0.5, k.z)
    if (this.sipping) this.kaylee.lookAt(this.coco.root.position.x, this.coco.root.position.y, this.coco.root.position.z)
    else this.kaylee.lookAt(this.nick.root.position.x, this.nick.root.position.y + 0.7, this.nick.root.position.z)
    this.kaylee.update(dt, t)
    this.nick.update(dt, t)
    this.ji.update(dt, t)
  }

  // ---------------------------------------------------------------- touches

  pointerDown(_x: number, _y: number, id?: string) {
    this.lastTouch = this.time
    this.finger = { id }
    if (id === 'coconut' && this.cocoK >= 1 && this.milk > 0) {
      this.sipping = true
      this.counts.sips++
      this.slurpT = 0
    }
  }
  pointerMove(_x: number, _y: number, _dx: number, _dy: number, held: boolean) {
    if (held) this.lastTouch = this.time
  }
  pointerUp() {
    this.finger = null
    this.sipping = false
  }

  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.counts.taps++
    if (!id) return this.tapSea(x, y)
    this.counts.pokes++
    if (id === 'basket') {
      this.basket.body.rotation.z = 0.15
      return this.passRoll()
    }
    if (id === 'family:nick') {
      if (!this.held) return this.passRoll()
      this.nick.react('hop')
      return
    }
    if (id === 'kaylee' || id === 'roll') {
      if (this.bite()) return
      this.kaylee.react('wiggle')
      tone(700, 900, 0.1, 0.05, 'triangle')
      return
    }
    if (id === 'coconut') {
      if (this.milk <= 0) {
        knock()
        this.cocoWob = 1
      }
      return
    }
    if (id === 'plate') return this.riceBite()
    if (id === 'family:ji') {
      this.ji.react('wave')
      shutter()
      this.counts.photos++
      this.events.photo()
      this.events.say(T_.photo[this.turn.photo++ % T_.photo.length])
      return
    }
    if (id.startsWith('umbrella:')) {
      this.umbrellas[+id.slice(9)].flap = 1
      sfx.fwip()
      return
    }
    if (id === 'lizard') {
      this.liz.flick = 0.6
      this.liz.hurry = 1
      hiss(0.2, 0.06, 'bandpass', 2500, 1800)
      this.once('lizard', T_.lizard)
      return
    }
    if (id === 'squirrel') {
      this.sq.goal = this.sq.k > 0.6 ? 0.15 : 1
      this.sq.chit = 0.5
      chitter()
      this.once('squirrel', T_.squirrel)
    }
  }

  /** A tap off the table: on the sea below, a splash (a fish jumps). */
  private tapSea(x: number, y: number) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const r = this.raycaster.ray
    for (let s = 1; s < 200; s += 0.75) {
      r.at(s, tmp)
      const g = this.ground(tmp.x, tmp.z)
      if (tmp.y <= Math.max(0, g)) {
        if (g < -0.2) {
          sfx.splash()
          this.counts.splashes++
          this.spray.burst(tmp.x, 0.1, tmp.z, 16, 1.8, 3, 0.14)
        }
        return
      }
    }
  }

  // ---------------------------------------------------------------- camera

  private shot(): Shot {
    const center = this.D(T.u, T.v + 0.35, TOP)
    const b = this.tall ? LUNCH.tallBox : LUNCH.box
    const half = this.tall ? new Vector3(b, 0.7, b * 1.1) : new Vector3(b, 0.7, b * 0.55)
    return { center, half, yaw: (this.seaYaw + Math.PI) * DEG, pitch: LUNCH.pitch, follow: true, minDist: 2.5, maxDist: 30 }
  }

  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }

  private toScreen(v: Vector3) {
    const p = v.clone().project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }

  private drawHint(t: number) {
    const el = this.hintEl
    if (!el) return
    let at: Vector3 | null = null
    if (!this.finger && t - this.lastTouch > HINT_S && this.doneAt < 0) {
      if (this.held) at = this.held.position.clone()
      else if (this.rollsEaten === 0) at = this.basket.root.position.clone()
      else if (this.cocoK >= 1 && this.milk > 0) at = this.coco.root.position.clone()
      else if (this.plateK >= 1 && this.riceLeft > 0) at = this.plate.root.position.clone()
    }
    if (!!at !== this.hintOn) {
      this.hintOn = !!at
      // The finger has just come up: the hint, spoken only if the budget allows (spendHint).
      const l = !at ? null : this.held ? T_.hint.roll : this.rollsEaten === 0 ? T_.hint.basket : this.cocoK >= 1 && this.milk > 0 ? T_.hint.coconut : T_.hint.rice
      if (l) this.events.say(l, !spendHint(l))
    }
    const want = at ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!at) return
    const s = this.toScreen(at.setY(at.y + 0.15))
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  placeAnchors() {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    const place = (el: HTMLElement, who: Object3D | Vector3 | null, height: number, scale = 1.4) => {
      let spot: { x: number; y: number; size: number } | null = null
      const vis = who && (who instanceof Vector3 || who.visible !== false)
      if (who && vis) {
        const base = who instanceof Vector3 ? who.clone() : who.getWorldPosition(new Vector3())
        const c = this.toScreen(tmp.copy(base).setY(base.y + height * 0.5))
        const top = this.toScreen(tmp2.copy(base).setY(base.y + height))
        if (c.z < 1) spot = { x: c.x, y: c.y, size: Math.max(min, Math.min(this.w * 0.26, Math.abs(c.y - top.y) * 2 * scale)) }
      }
      const show = !!spot && spot.x > -spot.size / 2 && spot.x < this.w + spot.size / 2 && spot.y > -spot.size / 2 && spot.y < this.h + spot.size / 2
      if (show && spot) {
        el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    for (const [id, el] of this.anchorEls) {
      if (id === 'kaylee') place(el, this.kaylee.root, this.kaylee.height * 0.9, 0.7)
      else if (id === 'family:nick') place(el, this.nick.root, this.nick.height * 0.9, 0.7)
      else if (id === 'family:ji') place(el, this.ji.root, this.ji.height * 0.9, 0.8)
      else if (id === 'basket') place(el, this.basket.root, 0.25, 1.6)
      else if (id === 'roll') place(el, this.held, 0.15, 1.6)
      else if (id === 'coconut') place(el, this.cocoK >= 1 ? this.coco.root : null, 0.4, 1.4)
      else if (id === 'plate') place(el, this.plateK >= 1 && this.riceLeft > 0 ? this.plate.root : null, 0.12, 2)
      else if (id.startsWith('umbrella:')) place(el, this.umbrellas[+id.slice(9)].u.can, 0.4, 1.4)
      else if (id === 'lizard') place(el, this.lizard.root, 0.4, 2)
      else if (id === 'squirrel') place(el, this.squirrel.root, 0.4, 2)
      // (Small things on the table win over the people behind them.)
      el.style.zIndex = id === 'roll' || id === 'coconut' || id === 'plate' || id === 'basket' ? '3' : '1'
    }
  }

  // ---------------------------------------------------------------- QA

  qa() {
    const sc = (v: Vector3) => (({ x, y }) => ({ x: Math.round(x), y: Math.round(y) }))(this.toScreen(v))
    return {
      section: 'deck',
      phase: this.doneAt >= 0 ? 'done' : 'lunch',
      rollsEaten: this.rollsEaten,
      holding: !!this.held,
      milk: +this.milk.toFixed(2),
      coconut: this.cocoK >= 1,
      riceLeft: this.plateK >= 1 ? this.riceLeft : null,
      done: this.doneAt >= 0,
      basket: sc(this.basket.root.position),
      cup: sc(this.coco.root.position),
      plateAt: sc(this.plate.root.position),
      kaylee: sc(this.kaylee.root.position.clone().setY(this.kaylee.root.position.y + 0.5)),
      ...this.counts,
      sipSecs: +this.counts.sipSecs.toFixed(1),
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

