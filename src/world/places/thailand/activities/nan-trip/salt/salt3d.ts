// Bo Kluea's salt wells (plan: planning/around-the-world/thailand/nan-trip.html, "4. Bo Kluea salt wells"), greybox:
// shapes and sounds, no voices yet. One open-sided salt hut seen from the front: the well on the left, the big pan on
// its mud stove on the right, a bamboo beam over both with the bucket hanging from it on a rope.
//
// The toy, the bucket: her finger held anywhere pulls the bucket there (it swings on its rope, heavy when it's full).
// Down into the well and it fills (splash, glug); carried over the pan and lowered, it tips and the brine pours in.
// Lowered anywhere else it pours there too (on the floor, on Daddy's foot, on the cat). Kaylee walks along under it.
// A tap on the well dips it for her, a tap on the pan (or the bucket) carries a bucketful over and pours it.
//   1. Dip and pour: six buckets fill the pan. A run of bells, the aunty lights the fire.
//   2. The fire: grab a log from the woodpile and throw it in the fire's mouth (a tap on the pile throws one too); a
//      finger on the fire blows on it. The bigger the fire, the more it bubbles and steams and the faster the brine
//      boils down, and white salt grows in from the pan's edges. The bucket still works (more brine, more salt). Left
//      alone too long, the aunty throws a log on herself.
//   3. Salt!: the brine is gone and the pan is full of salt. Kaylee holds the long wooden paddle: her finger moves its
//      blade through the salt, which heaps up on it; let go (or it's full) and it tips into her basket. A tap on the
//      pan scrapes a stripe there. Most of it scraped: the aunty sweeps up the rest, fills the bags, and they hop onto
//      the shelf one by one. The end card.
// Silly instead of wrong: brine on Daddy's foot (he hops), on the cat (she jumps and shakes), on the fire (a big hiss and
// a cloud of steam); tap Kaylee once she has touched the brine and she licks her finger: a big salty face. Things to
// poke: the aunty, the cat, the rooster, the baskets, the painted couple across the road, the well (an echo), the
// steam, the family.
import { Color, IcosahedronGeometry, Matrix4, Mesh, MeshBasicMaterial, OctahedronGeometry, Plane, Quaternion, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { FaceLife } from '../../../characters/face'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Floaters } from '../mushrooms/fx'
import { BRINE, buildHut, logGeo, type Hut } from './hut'
import {
  AUNTY_AT,
  BAGS,
  BASKET_RIM,
  BASKETS,
  BEAM,
  BLADE,
  BOIL_RATE,
  BOILED,
  BUCKET,
  BUCKET_AWAY,
  BUCKET_REST,
  BUCKET_TOP,
  BUCKET_X,
  CAT,
  CRUST_FROM,
  FILL_BELOW,
  FILL_RATE,
  FIRE_DECAY,
  JI_AT,
  KAYLEE_AT,
  KAYLEE_FIRE,
  KAYLEE_LEAD,
  KAYLEE_X,
  KAYLEE_Z,
  LOG_FIRE,
  MOUTH,
  MURAL,
  NICK_AT,
  PADDLE_HOLDS,
  PAN,
  PAN_BUCKETS,
  PAN_X,
  POUR_RATE,
  PUFF_FIRE,
  ROAD_Z,
  ROOSTER,
  SALT,
  SALT_BASKET,
  STOVE_FRONT,
  SWEEP_AT,
  TALL,
  TIP_BELOW,
  TIP_BELOW_PAN,
  WELL,
  WOODPILE,
  type Round,
} from './layout'
import { saltSfx as sfx } from './sounds'

export interface SaltEvents extends LegEvents {
  /** A new round began (the address bar follows). */
  round(r: Round): void
  /** The bags are on the shelf: the end card. */
  allDone(): void
}

export const SALT_ANCHORS: AnchorInfo[] = [
  { id: 'bucket', label: 'Bucket', kind: 'thing' },
  { id: 'well', label: 'Salt well', kind: 'thing' },
  { id: 'pan', label: 'Salt pan', kind: 'thing' },
  { id: 'fire', label: 'Fire', kind: 'thing' },
  { id: 'wood', label: 'Woodpile', kind: 'thing' },
  { id: 'basket', label: 'Salt basket', kind: 'thing' },
  { id: 'aunty', label: 'Salt aunty', kind: 'thing' },
  { id: 'cat', label: 'Sleepy cat', kind: 'thing' },
  { id: 'rooster', label: 'Rooster', kind: 'thing' },
  { id: 'baskets', label: 'Baskets', kind: 'thing' },
  { id: 'mural', label: 'Painted couple', kind: 'thing' },
  ...(['kaylee', 'nick', 'ji'] as const).map((e): AnchorInfo => ({ id: `family:${e}`, label: { kaylee: 'Kaylee', nick: 'Daddy', ji: 'Mommy' }[e], kind: 'family' })),
]

/** Taps on these are pokes: a finger on them doesn't pull the bucket or the paddle. */
const POKES = new Set(['aunty', 'cat', 'rooster', 'baskets', 'mural', 'basket', 'family:kaylee', 'family:nick', 'family:ji'])

type Step = 'dip' | 'pour'

interface Fly {
  o: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  arc: number
  spin?: number
  done: () => void
}

const STUCK_S = 5
/** Round 2: no log for this long (and the fire low) and the aunty throws one on herself. */
const AUNTY_LOG_S = 9
const LIFT_PX = 30
const HALF = BUCKET.h / 2

const tmp = new Vector3()
const tmp2 = new Vector3()
const right = new Vector3()
const m4 = new Matrix4()
const q = new Quaternion()
const up = new Vector3(0, 1, 0)
const bucketPlane = new Plane(new Vector3(0, 0, 1), 0)
const saltPlane = new Plane(new Vector3(0, 1, 0), -(SALT[0][1] + 0.02))
const frontPlane = new Plane(new Vector3(0, 0, 1), -(STOVE_FRONT + 0.25))

const overWell = (x: number) => Math.abs(x - WELL.x) < WELL.r - BUCKET.r + 0.02
const overPan = (x: number) => x > PAN.x0 + 0.04 && x < PAN.x1 - 0.04

export class SaltHut extends Stage {
  private hut: Hut
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private auntyLife: FaceLife
  private round: Round
  private flights: Fly[] = []
  private later: { t: number; f: () => void }[] = []
  private cool = new Map<string, number>()
  // ---- The bucket ----
  private bucket = { at: new Vector3(...BUCKET_REST), goal: new Vector3(...BUCKET_REST), vx: 0, fill: 0, tilt: 0, swing: 0, held: false, pourS: 0, wet: false, splashed: false, glug: 0 }
  private auto: Step[] = []
  private fingerX = 0
  private fingerY = 0
  private poured = 0
  private touchedBrine = false
  // ---- The pan and the fire ----
  private level = 0
  private fire = 0
  private lastLog = 0
  private blowing = false
  private puffT = 0
  private crackleT = 0
  private bubbleT = 0
  private shimmered = false
  private log: { o: Object3D; moved: boolean; x0: number; y0: number } | null = null
  // ---- The salt ----
  private salt: number[] = SALT.map(() => 0)
  private shown: number[] = SALT.map(() => 0)
  private paddle = { at: new Vector3(PAN.x0 + 0.2, SALT[0][1] + 0.02, PAN.z1 - 0.1), goal: new Vector3(PAN.x0 + 0.2, SALT[0][1] + 0.02, PAN.z1 - 0.1), held: false, finish: false, load: 0, dump: -1, scrapeT: 0, sweep: null as null | { x: number; t: number } }
  private inBasket = 0
  private swept = false
  private bagsUp = 0
  private doneSaid = false
  // ---- Silly and pokes ----
  private salty = 1
  private catJump = 1
  private catStretch = 1
  private auntyHop = 1
  private roosterCrow = 1
  private basketsWobble = 1
  private basketBounce = 1
  private muralGlow = 1
  private scooterT = 4
  private woodBounce = 1
  private steamPokes: { at: Vector3; t: number }[] = []
  // ---- Effects ----
  private drops: Floaters
  private stream: Floaters
  private steam: Floaters
  private bubbles: Floaters
  private sparkles: Floaters
  private grains: Floaters
  private smoke: Floaters

  constructor(renderer: WebGLRenderer, private ev: SaltEvents, start: { round: Round }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color('#D6E3EE')
    this.rig.fov = 32
    this.rig.lag = 0.45
    this.hut = buildHut(bag)
    scene.add(this.hut.root)
    this.auntyLife = new FaceLife(this.hut.aunty)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    for (const c of [kaylee, this.nick, this.ji]) scene.add(c.root)
    this.put(kaylee, ...KAYLEE_AT, 'stand', 0)
    this.put(this.nick, ...NICK_AT, 'stand', 10)
    this.put(this.ji, ...JI_AT, 'stand', 25)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#BFE6FF', '#E3F3FF'], 80, bag, 6, 0.2)
    this.stream = new Floaters(new IcosahedronGeometry(0.5, 1), [BRINE, '#C9E8F6', '#E3F3FF'], 160, bag, 7, 0.1)
    this.steam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#F1F4F8'], 90, bag, -0.35, 1.0, 0.6, 2.2)
    this.bubbles = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E3F3FF'], 60, bag, 0, 2.5)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 120, bag, 1.0, 1.2)
    this.grains = new Floaters(new IcosahedronGeometry(0.5, 0), ['#FFFFFF', '#F4F0E8'], 120, bag, 5, 0.4)
    this.smoke = new Floaters(new IcosahedronGeometry(0.5, 1), ['#C9C3D6', '#DDD8E8'], 40, bag, -0.3, 0.8, 0.5, 2.5)
    for (const f of [this.drops, this.stream, this.steam, this.bubbles, this.sparkles, this.grains, this.smoke]) scene.add(f.mesh)
    // ---- Where the link starts ----
    this.round = start.round
    if (start.round === '2') {
      this.level = 1
      this.fire = 0.3
      this.touchedBrine = true
    } else if (start.round === '3') this.startScraping(true)
    this.lastLog = 0
  }

  // ---------------------------------------------------------------- the bucket

  private get bottom() {
    return this.bucket.at.y - HALF
  }
  /** The lowest the bucket's bottom may go at `x`: the brine down the well, the pan, the well's rim, the floor. */
  private floorAt(x: number) {
    if (overWell(x)) return WELL.water
    if (Math.abs(x - WELL.x) < WELL.r + BUCKET.r) return WELL.rim + 0.03
    if (x > PAN.x0 - BUCKET.r && x < PAN.x1 + BUCKET.r) return overPan(x) ? PAN.top - 0.05 : PAN.top + 0.02
    return 0.05
  }

  private stepBucket(dt: number, t: number) {
    const b = this.bucket
    // ---- Where it wants to be: her finger, the next automatic step, or hanging where she left it ----
    const step = this.auto[0]
    if (b.held) {
      const p = this.onPlane(this.fingerX, this.fingerY - LIFT_PX, bucketPlane)
      if (p) b.goal.set(p.x, p.y, 0)
    } else if (step === 'dip') {
      const above = Math.abs(b.at.x - WELL.x) > 0.06 && this.bottom < WELL.rim + 0.1
      b.goal.set(WELL.x, above ? WELL.rim + HALF + 0.3 : WELL.water + HALF - 0.05, 0)
      if (b.fill >= 1) this.auto.shift()
    } else if (step === 'pour') {
      const far = Math.abs(b.at.x - (PAN_X - 0.15)) > 0.12
      b.goal.set(PAN_X - 0.15, far ? Math.max(this.bottom + HALF, PAN.top + 0.55) : TIP_BELOW_PAN + HALF - 0.12, 0)
      if (b.fill <= 0.001) this.auto.shift()
    } else if (this.pouringOver()) {
      // Let go over the pan with brine still in it: it finishes pouring.
    } else b.goal.y += (BUCKET_REST[1] - b.goal.y) * Math.min(1, dt * 2)
    b.goal.x = clamp(b.goal.x, BUCKET_X[0], BUCKET_X[1])
    b.goal.y = clamp(b.goal.y, this.floorAt(b.goal.x) + HALF, BUCKET_TOP)
    // Out of the well only over its rim: while it's down inside, it stays inside.
    if (this.bottom < WELL.rim && Math.abs(b.at.x - WELL.x) < WELL.r) b.goal.x = clamp(b.goal.x, WELL.x - (WELL.r - BUCKET.r), WELL.x + (WELL.r - BUCKET.r))
    // ---- It follows (heavier when full), and swings on its rope ----
    const before = b.at.x
    const k = 1 - Math.exp(-dt * (b.held ? 9 : 5) / (1 + b.fill * 0.6))
    tmp.copy(b.goal).sub(b.at).multiplyScalar(k)
    const max = (b.held ? 4.5 : 2.4) * dt
    if (tmp.length() > max) tmp.setLength(max)
    b.at.add(tmp)
    b.at.y = Math.max(b.at.y, this.floorAt(b.at.x) + HALF)
    b.vx += ((b.at.x - before) / Math.max(dt, 1e-3) - b.vx) * Math.min(1, dt * 10)
    b.swing += (clamp(-b.vx * 0.22, -0.5, 0.5) - b.swing) * Math.min(1, dt * 5)
    // ---- Into the brine down the well: splash, glug, full ----
    if (overWell(b.at.x) && this.bottom < FILL_BELOW) {
      if (!b.splashed) {
        b.splashed = true
        sfx.plunge()
        this.drops.burst(new Vector3(WELL.x, WELL.rim - 0.05, 0), 10, 0.6, 1.4, 0.6, 0.03)
      }
      if (b.fill < 1) {
        b.fill = Math.min(1, b.fill + dt * FILL_RATE)
        b.glug -= dt
        if (b.glug <= 0) {
          b.glug = 0.18
          sfx.glug(b.fill)
        }
        if (b.fill >= 1) {
          sfx.creak()
          this.touchedBrine = true
        }
      }
    } else if (this.bottom > FILL_BELOW + 0.1) b.splashed = false
    // ---- Tipping: held low anywhere but over the well, it tips and pours ----
    const low = this.bottom < (overPan(b.at.x) ? TIP_BELOW_PAN : TIP_BELOW)
    const want = b.fill > 0.001 && low && !overWell(b.at.x) && this.bottom > WELL.rim - 0.05 ? 1.85 : 0
    b.tilt += (want - b.tilt) * Math.min(1, dt * 7)
    if (b.tilt > 0.9 && b.fill > 0) this.pour(dt)
    else b.pourS = 0
    // A full bucket drips on the way up.
    if (b.fill > 0.2 && b.tilt < 0.5 && !overWell(b.at.x) && Math.random() < dt * 4) this.drops.emit(tmp.set(b.at.x + (Math.random() - 0.5) * 0.2, this.bottom, 0), tmp2.set(0, -0.2, 0), 0.8, 0.02)
    // ---- Place it: the rope from the ring on the beam to the handle ----
    const o = this.hut.bucket.root
    o.position.copy(b.at)
    o.rotation.set(0, 0, -(b.tilt + b.swing) + Math.sin(t * 2.1) * 0.02)
    const brine = this.hut.bucket.brine
    brine.visible = b.fill > 0.01 && b.tilt < 1.3
    brine.position.y = -HALF + 0.03 + b.fill * (BUCKET.h - 0.07)
    const ringX = b.at.x - Math.sin(b.swing) * 0.15
    this.hut.trolley.position.set(ringX, BEAM.y - 0.02, 0)
    const handle = o.localToWorld(tmp.set(0, HALF + 0.02, 0))
    stick(this.hut.rope, tmp2.set(ringX, BEAM.y - 0.09, 0), handle)
  }

  private pouringOver() {
    const b = this.bucket
    return !b.held && b.fill > 0.001 && b.tilt > 0.3 && overPan(b.at.x)
  }

  /** Brine out of the bucket: into the pan, or onto whatever is under it. */
  private pour(dt: number) {
    const b = this.bucket
    const amount = Math.min(b.fill, dt * POUR_RATE)
    b.fill -= amount
    const lip = this.hut.bucket.root.localToWorld(new Vector3(BUCKET.r, HALF, 0))
    for (let k = 0; k < 3; k++) this.stream.emit(lip, tmp2.set(0.25 + Math.random() * 0.25, -0.3 - Math.random() * 0.4, (Math.random() - 0.5) * 0.25), 0.5, 0.035 + Math.random() * 0.025)
    if (b.pourS <= 0) {
      b.pourS = 0.22
      sfx.pour()
    }
    b.pourS -= dt
    const x = lip.x + 0.1
    if (x > PAN.x0 && x < PAN.x1) {
      const before = this.level
      this.level = Math.min(1.12, this.level + amount / PAN_BUCKETS)
      if (Math.floor(before * 12) !== Math.floor(this.level * 12)) sfx.slosh(this.level)
      if (this.level > 1.02 && Math.random() < dt * 8) this.drops.emit(tmp.set(PAN.x0 + Math.random() * (PAN.x1 - PAN.x0), PAN.top, PAN.z1), tmp2.set(0, -0.3, 0.2), 0.7, 0.025)
      this.poured += amount
      if (b.fill <= 0.001) this.bucketDone()
      return
    }
    // On the floor (a splash), and the silly ones: Daddy's foot, the cat, the fire's mouth.
    if (Math.random() < dt * 12) this.drops.burst(tmp.set(x, 0.04, 0), 2, 0.6, 0.9, 0.5, 0.025)
    if (b.fill <= 0.001) this.bucketDone()
    const nick = this.nick.root.position
    if (Math.abs(x - nick.x) < 0.35)
      this.talkTo('nickfoot', () => {
        this.nick.react('hop')
        sfx.splash(0.6)
        this.after(0.15, () => sfx.haha())
      }, 1.6)
    const cat = this.hut.cat.root.position
    if (Math.abs(x - cat.x) < 0.35) this.wetCat()
  }

  private bucketDone() {
    const b = this.bucket
    if (b.wet) return
    b.wet = true
    this.after(0.3, () => (b.wet = false))
    if (this.round === '1' && this.level >= 0.999) this.fullPan()
  }

  /** The pan's full: a run of bells, the aunty lights the fire. */
  private fullPan() {
    if (this.round !== '1') return
    this.round = '2'
    this.after(0.6, () => {
      sfx.full()
      this.hopAunty()
      sfx.aunty()
      this.sparkles.burst(new Vector3(PAN_X, PAN.top + 0.05, 0), 18, 1.2, 1.2, 0.9, 0.045)
      this.after(0.8, () => {
        this.fire = Math.max(this.fire, 0.3)
        this.lastLog = this.time
        sfx.log()
        this.sparkles.burst(new Vector3(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.1), 10, 0.8, 1, 0.6, 0.035, 0)
        this.ev.round('2')
      })
    })
  }

  // ---------------------------------------------------------------- the fire

  private feed(from?: Vector3) {
    const o = this.log?.o ?? this.newLog()
    this.log = null
    this.scene.attach(o)
    const start = from ?? o.position.clone()
    o.position.copy(start)
    this.flights.push({
      o,
      from: start,
      to: () => new Vector3(MOUTH.x, MOUTH.y - 0.05, STOVE_FRONT - 0.05),
      t: 0,
      dur: 0.45,
      arc: 0.25,
      spin: 4,
      done: () => {
        o.removeFromParent()
        this.fire = Math.min(1, this.fire + LOG_FIRE)
        this.lastLog = this.time
        sfx.log()
        this.sparkles.burst(new Vector3(MOUTH.x, MOUTH.y + 0.05, STOVE_FRONT + 0.1), 10, 0.9, 1.3, 0.6, 0.03, 0)
        if (this.fire > 0.95) this.talkTo('roar', () => {
          sfx.whoosh(0.8)
          this.steam.burst(new Vector3(PAN_X, PAN.top + 0.1, 0), 8, 0.5, 0.6, 1.6, 0.18)
        }, 3)
      },
    })
  }
  private newLog() {
    const o = solid(logGeo(), this.bag, 2)
    const w = this.woodAt
    o.position.set(w.x, 0.3, w.z)
    this.scene.add(o)
    this.woodBounce = 0
    return o
  }

  private stepFire(dt: number, t: number) {
    const boiling = this.round === '2' && this.level > 0
    if (this.blowing) {
      this.fire = Math.min(1, this.fire + dt * 0.25)
      this.puffT -= dt
      if (this.puffT <= 0) {
        this.puffT = 0.35
        sfx.puff()
        this.sparkles.burst(new Vector3(MOUTH.x, MOUTH.y + 0.05, STOVE_FRONT + 0.08), 3, 0.6, 1, 0.5, 0.025, 0)
      }
    }
    this.fire = Math.max(0, this.fire - dt * FIRE_DECAY * (this.round === '2' ? 1 : 3))
    // Round 2, left too long with a little fire: the aunty throws a log on.
    if (this.round === '2' && this.fire < 0.25 && this.time - this.lastLog > AUNTY_LOG_S && this.time - this.lastTouch > 4 && !this.flights.length) {
      this.lastLog = this.time
      this.hopAunty()
      const a = this.hut.aunty.root.position
      this.feed(new Vector3(a.x - 0.2, 0.9, a.z + 0.2))
    }
    const f = this.hut.fire
    const k = this.fire
    for (const [i, fl] of f.flames.children.entries()) {
      const flick = 0.75 + 0.25 * Math.sin(t * (13 + i * 3.1) + i) * Math.sin(t * 5.3 + i * 2)
      const s = k < 0.02 ? 0.001 : (0.35 + k * 0.85) * flick
      fl.scale.set(0.7 + k * 0.5, s, 0.7 + k * 0.5)
    }
    ;(f.glow.material as MeshBasicMaterial).opacity = k * (0.65 + 0.3 * Math.sin(t * 19) * Math.sin(t * 7))
    f.embers.visible = k > 0.01 || this.round === '2'
    if (k > 0.05) {
      this.crackleT -= dt
      if (this.crackleT <= 0) {
        this.crackleT = 0.6 + Math.random() * 0.8
        sfx.crackle(k)
      }
      // Smoke from the chimney.
      if (Math.random() < dt * (1 + k * 3)) this.smoke.emit(tmp.set(PAN.x1 - 0.12, 2.05, PAN.z0 - 0.16), tmp2.set(0.05, 0.35, 0), 2.2, 0.12 + k * 0.08)
    }
    // ---- Boiling: bubbles and steam, the brine goes down, the salt comes in from the edges ----
    if (boiling && k > 0.03) {
      const before = this.level
      this.level = Math.max(BOILED, this.level - dt * BOIL_RATE * (0.25 + k))
      if (Math.random() < dt * k * 30) this.bubbles.emit(tmp.set(PAN.x0 + 0.08 + Math.random() * (PAN.x1 - PAN.x0 - 0.16), this.brineY + 0.01, PAN.z0 + 0.06 + Math.random() * (PAN.z1 - PAN.z0 - 0.12)), tmp2.set(0, 0.05, 0), 0.4, 0.025 + k * 0.025)
      if (Math.random() < dt * (0.6 + k * 4)) this.steam.emit(tmp.set(PAN.x0 + Math.random() * (PAN.x1 - PAN.x0), this.brineY + 0.05, (Math.random() - 0.5) * 0.6), tmp2.set((Math.random() - 0.5) * 0.1, 0.4 + k * 0.3, 0), 1.8, 0.1 + k * 0.12)
      this.bubbleT -= dt
      if (this.bubbleT <= 0) {
        this.bubbleT = 0.3 / (0.3 + k)
        sfx.bubble()
      }
      if (!this.shimmered && this.level < CRUST_FROM - 0.05) {
        this.shimmered = true
        sfx.shimmer()
        this.sparkles.burst(new Vector3(PAN.x0 + 0.1, PAN.top, 0), 8, 0.6, 0.8, 0.7, 0.03, 2)
      }
      if (before > BOILED && this.level <= BOILED) this.boiledDown()
    }
  }

  /** The brine's gone and the salt is everywhere: round 3. */
  private boiledDown() {
    if (this.round !== '2') return
    this.round = '3'
    this.bucket.held = false
    this.auto = []
    this.after(0.8, () => {
      sfx.full()
      this.hopAunty()
      sfx.aunty()
      this.startScraping(false)
      this.ev.round('3')
    })
  }

  private get brineY() {
    return PAN.top - PAN.depth + 0.015 + clamp(this.level, 0, 1.08) * (PAN.depth - 0.02)
  }

  // ---------------------------------------------------------------- the salt

  private startScraping(now: boolean) {
    this.round = '3'
    this.level = 0
    this.fire = now ? 0 : this.fire
    this.touchedBrine = true
    this.salt = SALT.map(() => 1)
    if (now) this.shown = SALT.map(() => 1)
    this.hut.paddle.root.visible = this.hut.handle.visible = true
    this.bucket.fill = 0
    if (now) {
      this.bucket.at.set(...BUCKET_AWAY)
      this.bucket.goal.set(...BUCKET_AWAY)
    }
  }

  private get saltLeft() {
    return this.salt.reduce((a, b) => a + b, 0)
  }

  /** The blade picks up the salt under it. */
  private scrapeUnder(dt: number) {
    const p = this.paddle
    let got = 0
    for (const [i, s] of SALT.entries()) {
      if (this.salt[i] <= 0 || p.load >= PADDLE_HOLDS) continue
      if (Math.abs(s[0] - p.at.x) < BLADE.w / 2 + 0.03 && Math.abs(s[2] - p.at.z) < BLADE.reach) {
        this.salt[i] = 0
        p.load++
        got++
        this.grains.burst(tmp.set(s[0], s[1] + 0.03, s[2]), 3, 0.4, 0.6, 0.4, 0.018)
      }
    }
    if (got) {
      p.scrapeT -= dt
      if (p.scrapeT <= 0) {
        p.scrapeT = 0.12
        sfx.scrape()
      }
      if (p.load >= PADDLE_HOLDS) this.dump()
    }
  }

  /** The paddle tips its salt into her basket. */
  private dump() {
    const p = this.paddle
    if (p.dump >= 0 || p.load <= 0) return
    p.dump = 0
  }

  private stepPaddle(dt: number, t: number) {
    const p = this.paddle
    const o = this.hut.paddle.root
    if (!o.visible) return
    const y = SALT[0][1] + 0.02
    if (p.dump >= 0) {
      // Over to the basket, tip, back.
      p.dump += dt / 0.75
      const k = Math.min(1, p.dump)
      const rim = tmp2.set(SALT_BASKET[0] + 0.05, BASKET_RIM + 0.12, SALT_BASKET[2] - 0.05)
      const go = Math.min(1, k / 0.4)
      const e = go * go * (3 - 2 * go)
      o.position.lerpVectors(p.at, rim, e).y += bell(go) * 0.15
      o.rotation.z = k > 0.4 ? -bell(Math.min(1, (k - 0.4) / 0.6)) * 1.3 : 0
      if (k > 0.5 && p.load > 0) {
        const n = p.load
        p.load = 0
        this.inBasket += n
        this.basketBounce = 0
        sfx.pourSalt(Math.min(14, Math.round(this.inBasket / 3)))
        this.grains.burst(rim.clone().add(new Vector3(0, -0.05, 0)), 12, 0.5, 0.4, 0.6, 0.022)
        this.sparkles.burst(rim.clone().add(new Vector3(0, 0.05, 0)), 6, 0.6, 0.9, 0.6, 0.03)
        this.checkSalt()
      }
      if (k >= 1) {
        p.dump = -1
        p.at.copy(o.position).setY(y)
        p.at.x = clamp(p.at.x, PAN.x0 + 0.1, PAN.x1 - 0.1)
        p.at.z = clamp(p.at.z, PAN.z0 + 0.06, PAN.z1 - 0.06)
      }
    } else {
      if (p.held) this.bladeToFinger(false)
      else if (p.sweep) {
        // A tap on the pan: the blade sweeps a stripe from the back toward her, then tips into the basket.
        p.sweep.t += dt / 0.7
        const k = Math.min(1, p.sweep.t)
        p.goal.set(p.sweep.x, y, PAN.z0 + 0.05 + (PAN.z1 - PAN.z0 - 0.1) * k)
        if (k < 0.05) p.at.copy(p.goal)
        if (k >= 1) {
          p.sweep = null
          this.dump()
        }
      }
      const before = p.at.clone()
      p.at.lerp(p.goal, 1 - Math.exp(-dt * 14))
      o.position.copy(p.at)
      o.rotation.z = 0
      if (p.held || p.sweep || p.finish) {
        // Steps along the path so a fast swipe doesn't jump over salt.
        const d = before.distanceTo(p.at)
        const n = Math.max(1, Math.ceil(d / 0.04))
        const end = p.at.clone()
        for (let i = 1; i <= n; i++) {
          p.at.lerpVectors(before, end, i / n)
          this.scrapeUnder(dt / n)
        }
        p.at.copy(end)
        // Let go: the blade finishes its stroke to where her finger left it, then tips into the basket.
        if (p.finish && p.at.distanceTo(p.goal) < 0.015) {
          p.finish = false
          this.dump()
        }
      }
    }
    // The blade turns to face Kaylee; the handle runs from it up to her hands.
    const hand = this.handAt()
    o.rotation.y = Math.atan2(hand.x - o.position.x, hand.z - o.position.z)
    const lp = this.hut.paddle.load
    const ls = Math.min(1.3, p.load / PADDLE_HOLDS * 1.3)
    lp.scale.setScalar(Math.max(0.001, ls * (1 + 0.04 * Math.sin(t * 6))))
    stick(this.hut.handle, o.localToWorld(tmp.set(0, 0.03, 0.08)), hand)
    // Kaylee keeps up with the blade along the front.
    this.follow(o.position.x - 0.15)
  }

  /** The blade's goal is right under her finger (the blade lies flat in the pan, nothing to hide); `jump` puts it there
   *  at once (a new press doesn't drag it across the salt from where it was). */
  private bladeToFinger(jump: boolean) {
    const p = this.paddle
    const hit = this.onPlane(this.fingerX, this.fingerY, saltPlane)
    if (!hit) return
    p.goal.set(clamp(hit.x, PAN.x0 + 0.1, PAN.x1 - 0.1), SALT[0][1] + 0.02, clamp(hit.z, PAN.z0 + 0.05, PAN.z1 - 0.05))
    if (jump) p.at.copy(p.goal)
  }

  private checkSalt() {
    const total = SALT.length
    if (!this.swept && this.inBasket >= total * SWEEP_AT) {
      this.swept = true
      // The aunty sweeps up the rest.
      this.after(0.5, () => {
        this.hopAunty()
        sfx.aunty()
        for (const [i, s] of SALT.entries()) {
          if (this.salt[i] <= 0) continue
          this.salt[i] = 0
          this.after(Math.random() * 0.6, () => this.grains.burst(tmp.set(s[0], s[1] + 0.03, s[2]), 4, 0.5, 0.8, 0.4, 0.018))
        }
        this.after(0.9, () => {
          this.inBasket = total
          this.basketBounce = 0
          sfx.pourSalt(14)
          this.finale()
        })
      })
    }
  }

  /** The basket heaped and sparkling; the bags hop onto the shelf one by one; everyone cheers. */
  private finale() {
    this.sparkles.burst(new Vector3(SALT_BASKET[0], BASKET_RIM + 0.2, SALT_BASKET[2]), 20, 1.2, 1.4, 1.0, 0.045)
    for (let i = 0; i < BAGS; i++)
      this.after(0.9 + i * 0.5, () => {
        const b = this.hut.bags[i]
        b.visible = true
        this.bagsUp = i + 1
        sfx.bag(i)
        this.sparkles.burst(b.position.clone().add(new Vector3(0, 0.2, 0.1)), 8, 0.7, 1, 0.6, 0.03)
      })
    this.after(0.9 + BAGS * 0.5 + 0.3, () => {
      this.cheer()
      if (!this.doneSaid) {
        this.doneSaid = true
        this.after(1.4, () => this.ev.allDone())
      }
    })
  }

  // ---------------------------------------------------------------- silly and pokes

  private wetCat() {
    this.talkTo('catwet', () => {
      this.catJump = 0
      sfx.meow()
      this.after(0.5, () => sfx.flap())
      const c = this.hut.cat.root.position
      this.drops.burst(new Vector3(c.x, 0.3, c.z), 10, 0.8, 1, 0.5, 0.025)
    }, 2)
  }

  private lick() {
    if (!this.touchedBrine) {
      this.kaylee.react('wiggle')
      sfx.giggle()
      return
    }
    this.salty = 0
    sfx.salty()
    this.after(0.5, () => this.talkTo('nicklaugh', () => (this.nick.react('hop'), sfx.haha()), 3))
  }

  private cheer() {
    for (const [k, c] of [this.kaylee, this.ji, this.nick].entries()) this.after(k * 0.12, () => c.react('hop'))
    this.hopAunty()
    sfx.cheer()
  }

  // ---------------------------------------------------------------- helpers

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  /** Once every few seconds at most (a quick run of taps gets one answer). */
  private talkTo(key: string, f: () => void, every = 2.5) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  private hopAunty() {
    this.auntyHop = 0
  }
  /** Kaylee walks along the front to keep up with the bucket or the paddle. */
  private followGoal = KAYLEE_AT[0]
  private follow(x: number) {
    const gx = clamp(x, KAYLEE_X[0], KAYLEE_X[1])
    const p = this.kaylee.root.position
    if (Math.abs(gx - this.followGoal) > 0.2 || (!this.kaylee.walking && Math.abs(gx - p.x) > 0.35)) {
      this.followGoal = gx
      this.kaylee.walk([[gx, KAYLEE_Z]])
    }
  }
  /** Where Kaylee's hands are (at her chest, a little forward). */
  private handAt() {
    const k = this.kaylee.root
    const yaw = k.rotation.y
    return new Vector3(k.position.x + Math.sin(yaw) * 0.18, k.position.y + 0.48, k.position.z + Math.cos(yaw) * 0.18)
  }
  private get woodAt() {
    return this.hut.wood.position
  }
  private screen(world: Vector3, r = 0) {
    const cam = this.rig.camera
    const c = world.clone().project(cam)
    if (c.z > 1) return null
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    const e = world.clone().addScaledVector(right, r).project(cam)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h, r: Math.abs(e.x - c.x) * this.w }
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
  private nearScreen(world: Vector3, x: number, y: number, px: number) {
    const s = this.screen(world)
    return !!s && Math.hypot(s.x - x, s.y - y) < px
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return []
  }

  /** This press already counted as a touch (a still tap after it mustn't count again). */
  private counted = false
  tap(x: number, y: number, id?: string) {
    if (this.counted) this.touches--
    this.counted = false
    super.tap(x, y, id)
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.counted = false
    if (x === undefined || y === undefined) return
    this.fingerX = x
    this.fingerY = y
    if (id && POKES.has(id)) return
    if (this.round === '3') {
      if (this.paddle.dump >= 0 || this.swept) return
      this.touches++
      this.counted = true
      this.paddle.held = true
      this.paddle.finish = false
      this.paddle.sweep = null
      this.bladeToFinger(true)
      return
    }
    // Before the fire's lit, the fire and the woodpile are pokes like the rest.
    if (this.round === '1' && (id === 'fire' || id === 'wood')) return
    if (this.round === '2') {
      if (id === 'wood' || (!id && this.nearScreen(this.woodAt.clone().setY(0.25), x, y, 70))) {
        this.log = { o: this.newLog(), moved: false, x0: x, y0: y }
        return
      }
      if (id === 'fire') {
        this.touches++
        this.counted = true
        this.blowing = true
        this.puffT = 0
        return
      }
    }
    // Anywhere else: the bucket comes to her finger.
    this.touches++
    this.counted = true
    this.bucket.held = true
    this.auto = []
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld) return
    this.fingerX = x
    this.fingerY = y
    if (this.bucket.held || this.paddle.held || this.blowing) this.lastTouch = this.time
    const l = this.log
    if (l) {
      this.lastTouch = this.time
      if (!l.moved && Math.hypot(x - l.x0, y - l.y0) > 10) {
        l.moved = true
        this.touches++
      }
      const p = this.onPlane(x, y - LIFT_PX, frontPlane)
      if (p) l.o.position.lerp(p.setY(Math.max(0.1, p.y)), 0.6)
    }
  }

  pointerUp() {
    if (this.bucket.held) {
      this.bucket.held = false
      this.bucket.goal.copy(this.bucket.at)
    }
    this.blowing = false
    if (this.paddle.held) {
      this.bladeToFinger(false)
      this.paddle.held = false
      this.paddle.finish = true
    }
    const l = this.log
    if (l?.moved) this.feed()
    else if (l) {
      // A still tap: onTap('wood') throws one on; this one goes back on the pile.
      l.o.removeFromParent()
      this.log = null
    }
  }

  protected onTap(id: string | null, x: number, y: number) {
    switch (id) {
      case 'well':
        sfx.echo()
        if (this.round !== '3' && this.bucket.fill < 0.5) this.auto = ['dip']
        return
      case 'bucket':
      case 'pan':
        if (this.round === '3') {
          if (id === 'pan' && this.paddle.dump < 0 && !this.swept) {
            const hit = this.onPlane(x, y, saltPlane)
            this.paddle.sweep = { x: clamp(hit?.x ?? PAN_X, PAN.x0 + 0.12, PAN.x1 - 0.12), t: 0 }
          }
          return
        }
        this.auto = this.bucket.fill > 0.3 ? ['pour'] : ['dip', 'pour']
        return
      case 'wood':
        if (this.round === '2') this.feed()
        else {
          this.woodBounce = 0
          sfx.log()
        }
        return
      case 'fire':
        if (this.round === '2') this.fire = Math.min(1, this.fire + PUFF_FIRE)
        sfx.puff()
        this.sparkles.burst(new Vector3(MOUTH.x, MOUTH.y + 0.05, STOVE_FRONT + 0.08), 5, 0.6, 1, 0.5, 0.025, 0)
        return
      case 'basket':
        this.basketBounce = 0
        sfx.pourSalt(Math.min(14, Math.round(this.inBasket / 3)))
        return
      case 'aunty':
        this.hopAunty()
        this.talkTo('aunty', () => sfx.aunty(), 1)
        return
      case 'cat':
        this.catStretch = 0
        this.talkTo('cat', () => sfx.mrrp(), 1)
        return
      case 'rooster':
        this.roosterCrow = 0
        this.talkTo('rooster', () => sfx.crow(), 1.2)
        return
      case 'baskets':
        this.basketsWobble = 0
        sfx.wobble()
        return
      case 'mural':
        this.muralGlow = 0
        sfx.chime()
        this.sparkles.burst(new Vector3(MURAL.x - 0.15, MURAL.y + 0.3, MURAL.z + 0.1), 10, 0.6, 1, 0.8, 0.05, 1)
        return
      case 'family:kaylee':
        return this.lick()
      case 'family:nick':
        this.nick.react('hop')
        sfx.haha()
        return
      case 'family:ji':
        this.ji.react('wave')
        sfx.giggle()
        return
    }
    // A puff of steam: pop!
    if (id === null) {
      for (const s of this.steamPokes) if (this.nearScreen(s.at, x, y, 60)) return
      const p = this.onPlane(x, y, bucketPlane)
      if (p && this.round === '2' && p.x > PAN.x0 - 0.2 && p.x < PAN.x1 + 0.2 && p.y > PAN.top + 0.2 && p.y < 2.2) {
        this.steamPokes.push({ at: p, t: this.time })
        this.sparkles.burst(p, 6, 0.6, 0.6, 0.5, 0.03, 2)
        sfx.pop()
      }
    }
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.steamPokes = this.steamPokes.filter((s) => this.time - s.t < 0.5)
    if (this.round === '3') {
      // Round 3: the bucket hangs up out of the way.
      this.bucket.held = false
      this.auto = []
      this.bucket.goal.set(...BUCKET_AWAY)
    }
    this.stepBucket(dt, t)
    // Looking down into the pan in round 3, the camera is above the roof and the beam: they hide (the bucket too).
    const inside = this.round !== '3'
    this.hut.overhead.visible = this.hut.rope.visible = this.hut.trolley.visible = this.hut.bucket.root.visible = inside
    this.stepFire(dt, t)
    this.stepPaddle(dt, t)
    // ---- Flying things (logs into the fire) ----
    for (const f of [...this.flights]) {
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      const e = k * k * (3 - 2 * k)
      f.o.position.lerpVectors(f.from, f.to(), e).y += bell(k) * f.arc
      if (f.spin) f.o.rotation.z += dt * f.spin
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.done()
      }
    }
    if (this.log?.moved) this.log.o.rotation.z = Math.sin(t * 8) * 0.2
    // ---- The pan: the brine's level and color, the salt ----
    const br = this.hut.brine
    br.visible = this.level > 0.005
    br.position.y = this.brineY
    const crust = clamp((CRUST_FROM - this.level) / (CRUST_FROM - BOILED), 0, 1)
    ;(br.material as MeshBasicMaterial).color.set(BRINE).lerp(new Color('#EEF4F6'), crust * 0.7)
    ;(br.material as MeshBasicMaterial).opacity = 0.88 - crust * 0.3
    const salt = this.hut.salt
    for (const [i, s] of SALT.entries()) {
      // In round 2 the salt grows in from the edges as the brine boils down; in round 3 it's what's left to scrape.
      const edge = Math.min(s[0] - PAN.x0, PAN.x1 - s[0], (s[2] - PAN.z0) * 1.5, (PAN.z1 - s[2]) * 1.5) / 0.6
      const goal = this.round === '3' ? this.salt[i] : this.round === '2' ? clamp((crust - clamp(edge, 0, 1) * 0.75) * 4, 0, 1) : 0
      this.shown[i] += (goal - this.shown[i]) * Math.min(1, dt * (goal > this.shown[i] ? 3 : 12))
      const sc = Math.max(0.001, this.shown[i])
      m4.compose(tmp.set(s[0], s[1] + (this.round === '3' ? 0 : Math.max(0, this.brineY - s[1] - 0.025)), s[2]), q.setFromAxisAngle(up, i * 1.7), tmp2.set(sc, sc * (0.8 + 0.2 * Math.sin(i)), sc))
      salt.setMatrixAt(i, m4)
    }
    salt.instanceMatrix.needsUpdate = true
    // ---- Her basket ----
    this.basketBounce = Math.min(1, this.basketBounce + dt / 0.4)
    const bb = bell(this.basketBounce)
    this.hut.basket.root.scale.set(1 + 0.1 * bb, 1 - 0.15 * bb, 1 + 0.1 * bb)
    const fillK = this.inBasket / SALT.length
    this.hut.basket.heap.scale.set(Math.max(0.001, 0.4 + fillK * 0.6), Math.max(0.001, fillK * 1.6), Math.max(0.001, 0.4 + fillK * 0.6))
    this.hut.basket.heap.visible = this.inBasket > 0
    // ---- The bags popping onto the shelf ----
    for (const [i, b] of this.hut.bags.entries()) {
      if (!b.visible) continue
      const k = b.userData.k = Math.min(1, ((b.userData.k as number | undefined) ?? 0) + dt / 0.4)
      b.scale.setScalar(Math.max(0.001, k < 0.7 ? (k / 0.7) * 1.2 : 1.2 - ((k - 0.7) / 0.3) * 0.2))
      b.rotation.z = Math.sin(t * 3 + i) * 0.03
    }
    // ---- The aunty ----
    this.auntyHop = Math.min(1, this.auntyHop + dt / 0.5)
    const a = this.hut.aunty
    const ah = bell(this.auntyHop)
    a.root.position.y = ah * 0.18
    a.root.scale.set(1 + 0.06 * ah, 1 - 0.04 * ah, 1 + 0.06 * ah)
    this.auntyLife.update(dt)
    // ---- The cat: breathing, a stretch when poked, a jump when splashed; she rolls over in a big fire ----
    this.catJump = Math.min(1, this.catJump + dt / 0.7)
    this.catStretch = Math.min(1, this.catStretch + dt / 1.4)
    const cat = this.hut.cat
    cat.root.position.y = bell(this.catJump) * 0.35
    cat.root.scale.set(1 + 0.25 * bell(this.catStretch), 1 + 0.03 * Math.sin(t * 1.5) - 0.1 * bell(this.catStretch), 1)
    cat.head.rotation.z = bell(this.catStretch) * 0.5 + (this.catJump < 1 ? Math.sin(t * 30) * 0.3 : 0)
    cat.tail.rotation.y = this.catJump < 1 || this.catStretch < 1 ? Math.sin(t * 16) * 0.5 : Math.sin(t * 1.2) * 0.15 + (this.fire > 0.7 ? 0.4 : 0)
    // ---- The rooster: pecks, and crows when poked ----
    this.roosterCrow = Math.min(1, this.roosterCrow + dt / 1.3)
    const rh = this.hut.rooster.head
    rh.rotation.z = this.roosterCrow < 1 ? bell(this.roosterCrow) * 0.9 : Math.max(0, Math.sin(t * 2.3)) ** 6 * -0.8
    this.basketsWobble = Math.min(1, this.basketsWobble + dt / 0.8)
    this.hut.baskets.rotation.z = Math.sin(this.basketsWobble * Math.PI * 4) * 0.12 * (1 - this.basketsWobble)
    this.woodBounce = Math.min(1, this.woodBounce + dt / 0.35)
    this.hut.wood.scale.set(1 + 0.06 * bell(this.woodBounce), 1 - 0.1 * bell(this.woodBounce), 1)
    this.muralGlow = Math.min(1, this.muralGlow + dt / 1.2)
    this.hut.mural.scale.setScalar(1 + 0.04 * bell(this.muralGlow))
    // ---- A scooter putters past on the road now and then ----
    this.scooterT -= dt
    const sc = this.hut.scooter
    if (this.scooterT < 0) {
      sc.position.x += dt * 2.4
      sc.position.y = Math.abs(Math.sin(t * 9)) * 0.02
      if (sc.position.x > 8) {
        sc.position.x = -8
        this.scooterT = 10 + Math.random() * 8
      }
    } else if (sc.position.x < -7 || sc.position.x > 7) sc.position.set(-8, 0, ROAD_Z + 0.3)
    // ---- The family: Kaylee walks along under the bucket and reaches for it; everyone watches ----
    if (this.round !== '3' && (this.bucket.held || this.auto.length)) this.follow(this.bucket.at.x + KAYLEE_LEAD)
    else if (this.round === '2' && !this.log) this.follow(KAYLEE_FIRE[0])
    for (const c of [this.kaylee, this.nick, this.ji]) c.update(dt, t)
    const look = this.round === '3' ? this.hut.paddle.root.position : this.round === '2' && !this.bucket.held ? tmp.set(MOUTH.x, MOUTH.y + 0.3, STOVE_FRONT) : this.bucket.at
    // Turned three-quarters to us (toward what she's doing, and toward the front), so we see her face; at the pan in
    // round 3, toward the blade.
    const kp = this.kaylee.root.position
    if (!this.kaylee.walking) this.kaylee.faceToward(look.x, this.round === '3' ? look.z : kp.z + 0.55)
    this.kaylee.lookAt(look.x, look.y, look.z)
    this.nick.lookAt(look.x, look.y, look.z)
    this.ji.lookAt(look.x, look.y, look.z)
    this.poseArms()
    this.saltyFace(dt)
    for (const fl of [this.drops, this.stream, this.steam, this.bubbles, this.sparkles, this.grains, this.smoke]) fl.update(dt)
  }

  /** Her arms up toward the bucket while she's leading it, or forward on the paddle (over whatever the pose did). */
  private poseArms() {
    const r = this.kaylee.rig
    if (this.round === '3' && this.hut.paddle.root.visible) {
      r.armL.rotation.set(-0.9, 0, 0.3)
      r.armR.rotation.set(-0.9, 0, -0.3)
    } else if (this.bucket.held || this.auto.length) r.armR.rotation.set(-2.6, 0, -0.2)
  }

  /** The salty face: her eyes squeeze shut, her mouth puckers small, her head shakes. */
  private saltyFace(dt: number) {
    if (this.salty >= 1) return
    this.salty = Math.min(1, this.salty + dt / 1.4)
    const r = this.kaylee.rig
    const k = bell(Math.min(1, this.salty * 1.4))
    r.eyes.scale.y = Math.max(0.12, 1 - k * 0.9)
    r.mouth.scale.set(1 - k * 0.6, 1 + k * 0.4, 1)
    r.head.rotation.y = Math.sin(this.salty * Math.PI * 8) * 0.25 * k
    // Her finger to her mouth first.
    if (this.salty < 0.3) r.armR.rotation.set(-1.9, 0, 0.6)
    if (this.salty >= 1) {
      r.eyes.scale.y = 1
      r.mouth.scale.set(1, 1, 1)
      r.head.rotation.y = 0
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  private tallNow: boolean | null = null
  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tallNow) {
      this.tallNow = tall
      this.ji.root.position.set(...(tall ? TALL.ji : JI_AT))
      this.hut.aunty.root.position.set(...(tall ? TALL.aunty : AUNTY_AT))
      this.hut.wood.position.set(...(tall ? TALL.wood : WOODPILE))
      this.hut.baskets.position.set(...(tall ? TALL.baskets : BASKETS))
    }
    super.setSize(w, h, top)
  }

  protected shot(): Shot {
    const tall = this.w < this.h
    if (this.round === '3') {
      // Down on the pan, her basket beside it.
      if (tall) return { center: new Vector3(0.55, 0.78, 0.2), half: new Vector3(0.95, 0.5, 0.8), yaw: 0, pitch: 58, minDist: 2.6 }
      return { center: new Vector3(0.6, 0.78, 0.15), half: new Vector3(1.6, 0.45, 0.78), yaw: 0, pitch: 55, minDist: 3 }
    }
    if (tall) return { center: new Vector3(0.05, 1.0, 0.3), half: new Vector3(2.0, 1.15, 0.8), yaw: 0, pitch: 32, minDist: 3 }
    return { center: new Vector3(0.1, 1.1, 0.15), half: new Vector3(2.3, 1.1, 0.65), yaw: 0, pitch: 22, minDist: 3 }
  }

  /** What the hint finger (and the glow) points at now. */
  private hintTarget(): string | null {
    if (this.bucket.held || this.paddle.held || this.log || this.auto.length || this.paddle.dump >= 0) return null
    if (this.round === '1') return this.bucket.fill > 0.4 ? 'pan' : 'well'
    if (this.round === '2') return this.fire < 0.6 ? 'wood' : 'fire'
    if (this.round === '3' && !this.swept) return 'pan'
    return null
  }

  /** Where the salt is thickest (the round-3 hint points there). */
  private saltSpot() {
    let best = new Vector3(PAN_X, SALT[0][1], 0)
    let n = -1
    for (const [i, s] of SALT.entries()) {
      if (this.salt[i] <= 0) continue
      let c = 0
      for (const [j, o] of SALT.entries()) if (this.salt[j] > 0 && Math.abs(o[0] - s[0]) < 0.2 && Math.abs(o[2] - s[2]) < 0.2) c++
      if (c > n) {
        n = c
        best = new Vector3(s[0], s[1], s[2])
      }
    }
    return best
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const idle = this.time - this.lastTouch > STUCK_S
    const hinted = idle && this.hintTarget() === id
    if (id.startsWith('family:')) {
      const c = id === 'family:kaylee' ? this.kaylee : id === 'family:nick' ? this.nick : this.ji
      const r = c.rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: 0, max: 120 }
    }
    const three = this.round === '3'
    switch (id) {
      case 'bucket':
        return three ? null : { at: this.bucket.at.clone(), r: BUCKET.r * 1.2, prio: 4, max: 130 }
      case 'well':
        return three ? null : { at: new Vector3(WELL.x, WELL.rim, WELL.z + 0.2), r: WELL.r * 0.8, prio: 1, max: 150, glow: hinted }
      case 'pan':
        return { at: new Vector3(PAN_X, PAN.top, three ? 0 : 0.1), r: (PAN.x1 - PAN.x0) * (three ? 0.42 : 0.36), prio: 1, max: three ? 420 : 200, glow: hinted }
      case 'fire':
        return three ? null : { at: new Vector3(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.05), r: 0.22, prio: 2, max: 120, glow: hinted }
      case 'wood':
        return three ? null : { at: this.woodAt.clone().setY(0.2), r: 0.25, prio: 2, max: 120, glow: hinted || (this.round === '2' && this.fire < 0.15) }
      case 'basket':
        return { at: this.hut.basket.root.position.clone().setY(BASKET_RIM), r: 0.22, prio: 2, max: 130 }
      case 'aunty':
        return { at: this.hut.aunty.root.position.clone().setY(1.0), r: 0.3, prio: 1, max: 130 }
      case 'cat':
        return { at: this.hut.cat.root.position.clone().setY(0.15), r: 0.2, max: 110 }
      case 'rooster':
        return three ? null : { at: new Vector3(ROOSTER[0], 0.3, ROOSTER[2]), r: 0.18, max: 110 }
      case 'baskets':
        return three ? null : { at: this.hut.baskets.position.clone().setY(0.25), r: 0.2, max: 110 }
      case 'mural':
        return three ? null : { at: new Vector3(MURAL.x, MURAL.y, MURAL.z), r: 0.6, prio: 0, max: 150 }
    }
    return null
  }

  protected hintAt() {
    const id = this.hintTarget()
    if (id === 'well') return new Vector3(WELL.x, WELL.rim + 0.1, WELL.z + 0.3)
    if (id === 'pan') return this.round === '3' ? this.saltSpot() : new Vector3(PAN_X, PAN.top + 0.1, 0.2)
    if (id === 'wood') return this.woodAt.clone().setY(0.25)
    if (id === 'fire') return new Vector3(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.1)
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screen(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'salt',
      round: this.round,
      bucket: { at: pt(this.bucket.at), fill: Math.round(this.bucket.fill * 100) / 100, tilt: Math.round(this.bucket.tilt * 100) / 100, held: this.bucket.held, auto: this.auto.join(',') },
      level: Math.round(this.level * 100) / 100,
      buckets: Math.min(PAN_BUCKETS, Math.round(this.level * PAN_BUCKETS)),
      fire: Math.round(this.fire * 100) / 100,
      saltLeft: this.saltLeft,
      inBasket: this.inBasket,
      paddleLoad: this.paddle.load,
      paddle: { at: pt(this.paddle.at), held: this.paddle.held, dump: this.paddle.dump >= 0, sweep: !!this.paddle.sweep },
      bags: this.bagsUp,
      done: this.doneSaid,
      salty: this.salty < 1,
      touches: this.touches,
      points: {
        well: pt(new Vector3(WELL.x, WELL.rim, WELL.z + 0.2)),
        wellDeep: pt(new Vector3(WELL.x, WELL.water + 0.05, 0)),
        pan: pt(new Vector3(PAN_X, PAN.top, 0)),
        panLow: pt(new Vector3(PAN_X - 0.15, TIP_BELOW_PAN + HALF - 0.15, 0)),
        fire: pt(new Vector3(MOUTH.x, MOUTH.y, STOVE_FRONT + 0.05)),
        wood: pt(this.woodAt.clone().setY(0.2)),
        basket: pt(this.hut.basket.root.position.clone().setY(BASKET_RIM)),
        spot: this.round === '3' ? pt(this.saltSpot()) : null,
        saltBack: pt(new Vector3(PAN_X, SALT[0][1], PAN.z0 + 0.1)),
        saltFront: pt(new Vector3(PAN_X, SALT[0][1], PAN.z1 - 0.1)),
        nick: pt(this.nick.root.position.clone().setY(0.1)),
        cat: pt(new Vector3(CAT[0], 0.15, CAT[2])),
      },
    }
  }
}

/** A stick (the rope, the paddle's handle) from `a` to `b`: a unit cylinder along +y from its base, stretched. */
const along = new Vector3()
function stick(m: Mesh, a: Vector3, b: Vector3) {
  const d = along.copy(b).sub(a)
  const len = d.length()
  m.position.copy(a)
  m.scale.set(1, Math.max(0.001, len), 1)
  m.quaternion.setFromUnitVectors(up, d.normalize())
}
