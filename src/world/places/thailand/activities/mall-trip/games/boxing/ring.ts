// Muay Thai at HarborLand: a bout with Dad. A blue ring mat with its ropes, Dad in his sparring gear (two fat blue
// mitts and a belly pad), the coach (the boxer kid from the Big Frame, a little monkey) on his drum and as the referee,
// Kaylee in her pink gloves, red headband and grip socks. Voices: lines.ts `L.mall.boxing`, said through blocks/talk.ts.
//
// The toy: punch Dad. A finger going down on him and she punches right there, at once: the gloves take turns, she
// lunges in (and leaps for his head), he staggers back toward the ropes, stars and a POW pop out. Quick punches are a
// combo: the number climbs, each hit a note higher. Every hit fills her super punch (the lamps on the board, and her
// gloves turn gold when it's full): the next punch is in slow motion and sends Dad flying into the ropes, which sling
// him back through the air. A tap while he's up there bounces him again (a juggle). He lands on his bottom, the ring
// jumps, and the coach counts him out: nueng, song, saam. A star.
//   The start: one tap on her gloves and everyone bows (the wai before a bout), then the bell.
//   1. Dad just takes it. Twelve hits to the first super punch.
//   2. Dad swings back: his near mitt swells up like a balloon over his head, then comes down on her head (a soft bop,
//      she giggles and nothing is lost). A punch on the big mitt first pops it: BONK, he spins round dizzy and her
//      hits count double for a while.
//   3. Dad guards: mitts up by his face (his tummy is open) or down by his tummy (his head is open). A punch on the
//      mitts counts a little, one on the open spot counts in full. The super punch is her big unicorn kick; then the
//      coach holds her glove up and the gold belt goes round her waist.
// Then it stays a toy: the bout goes on, round after round, with everything in it.
// Nothing fails: every punch lands, a bop is a giggle, and his wind-up gets slower each time one lands on her.
import { Color, Group, IcosahedronGeometry, OctahedronGeometry, Plane, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../../sdk'
import { knobs } from '../../../../../../kit/knobs'
import type { Avatar } from '../../../../characters/avatar'
import type { Member } from '../../../../characters/member'
import { along, ARM, HOOF } from '../../../../characters/model-wear'
import type { AnchorInfo } from '../../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../../engine3d/camera'
import { PAL, toon } from '../../../../../../engine3d/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { SOCK_COLORS, wearSocks } from '../../socks'
import { Beat, PERIOD } from './beat'
import { buildGear, buildGym, goldGlove, LAMP_DIM, LAMP_LIT, LAMPS, MITT_R, setPiece, starGeometry, type Built, type Gear, type Rope } from './build'
import { Coach, GUARD } from './coach'
import { Floaters } from './fx'
import { BAG, BAG2, BELL, BOARD, BOTTLE, COACH_DRUM, COACH_WAI, COUNT, DAD, DRUM, KAYLEE, NEED, NEED_FREE, POSTS, TALL_SHIFT, type Round } from './layout'
import { boxingSfx as sfx, hallBed } from './sounds'
import { Talk } from '../blocks/talk'
import { L } from '../../../../lines'

const T = L.mall.boxing
const FILE = 'src/world/places/thailand/activities/mall-trip/games/boxing/ring.ts'

/** How the bout feels under her finger (the feel lab: ?feel=1). */
const FEEL = knobs(
  'boxBout',
  'The bout with Dad',
  FILE,
  {
    punch: { value: 0.26, min: 0.14, max: 0.5, step: 0.01, label: 'Punch time', unit: 's', note: 'finger down to back in her guard', main: true },
    push: { value: 0.09, min: 0, max: 0.3, step: 0.01, label: 'Push back', unit: 'm', note: 'how far each hit shoves Dad toward the ropes', main: true },
    combo: { value: 0.9, min: 0.3, max: 2, step: 0.05, label: 'Combo gap', unit: 's', note: 'the longest pause that keeps a combo going', main: true },
    windUp: { value: 1.6, min: 0.6, max: 3, step: 0.1, label: "Dad's wind-up", unit: 's', note: 'how long his big mitt swells before it comes down', main: true },
    swingGap: { value: 4.4, min: 2, max: 9, step: 0.2, label: 'Between swings', unit: 's', note: 'how often Dad swings back', main: true },
    launch: { value: 5.4, min: 2, max: 9, step: 0.2, label: 'Knock-back', unit: 'm/s', note: 'how hard the super punch sends him into the ropes', main: true },
    juggle: { value: 3.3, min: 1, max: 6, step: 0.1, label: 'Juggle pop', unit: 'm/s', note: 'how high a tap bounces him in the air' },
    float: { value: 7.5, min: 3, max: 14, step: 0.5, label: 'Gravity in the air', unit: 'm/s²', note: 'lower: he hangs up there longer' },
    slowmo: { value: 0.32, min: 0.1, max: 1, step: 0.02, label: 'Slow motion', note: 'how slow time runs while the super punch winds up (1: none)' },
    dizzy: { value: 3.4, min: 1, max: 7, step: 0.2, label: 'Dizzy for', unit: 's', note: 'how long he spins and wobbles after she pops his mitt' },
  },
  { sections: ['boxing'] },
)

export interface BoxingEvents extends LegEvents {
  /** The round on now (the address bar follows). */
  round(n: Round): void
  /** The bow before the bout is done (the sock band's 🥊). */
  warmedUp(): void
  /** All three rounds done (the way back to the hall shows; she can keep punching). */
  allDone(): void
}
export interface BoxingStart {
  round: Round
  socks: string
}

export const BOXING_ANCHORS: AnchorInfo[] = [
  { id: 'gloves', label: 'Your gloves', kind: 'thing' },
  { id: 'dad', label: 'Dad', kind: 'thing' },
  { id: 'mitt', label: "Dad's big glove", kind: 'thing' },
  { id: 'bag', label: 'The punching bag', kind: 'thing' },
  { id: 'bag2', label: 'The small bag', kind: 'thing' },
  { id: 'drum', label: 'The drum', kind: 'thing' },
  { id: 'bell', label: 'The ring bell', kind: 'thing' },
  { id: 'ropes', label: 'The ropes', kind: 'thing' },
  { id: 'bottle', label: 'Water bottle', kind: 'thing' },
  { id: 'board', label: 'Star board', kind: 'thing' },
  { id: 'coach', label: 'The coach', kind: 'thing' },
  { id: 'family:kaylee', label: 'You', kind: 'family' },
]

/** wai: the bow before the bout. bout: punching. super: her super punch (or the big kick) on its way. ko: Dad flying,
 *  landing, being counted out. between: the star, Dad getting up. finale: the belt. */
type Phase = 'wai' | 'bout' | 'super' | 'ko' | 'between' | 'finale'
type DadMode = 'guard' | 'windup' | 'swing' | 'dizzy' | 'fly' | 'sit' | 'up'
type Guard = 'open' | 'high' | 'low'
type Zone = 'head' | 'body' | 'mitt'
interface Punch {
  t: number
  dur: number
  /** Which glove: 0 her left (the near one when she faces right), 1 her right. */
  arm: 0 | 1
  kind: 'jab' | 'super' | 'kick'
  zone: Zone
  at: Vector3
  hit: boolean
  /** Where she's punching toward, flat (her lunge goes that way), and how high she leaps for it. */
  dir: Vector3
  lunge: number
  leap: number
}
interface Pow {
  el: HTMLElement
  at: Vector3
  t: number
  big: boolean
  /** A number of the count: bigger, and it stays up longer. */
  count?: boolean
}
/** Dad in the air: where his feet are, how fast, his tumble, how many times she has bounced him. */
interface Flight {
  p: Vector3
  v: Vector3
  rot: number
  spin: number
  roped: boolean
  juggles: number
}
type Arms = [number, number, number, number]

const tmp = new Vector3()
const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const deg = Math.PI / 180
/** Her shoulders' height (Kaylee is 1 m to the top of her head). */
const SHOULDER = 0.47
const JABS = ['POW!', 'BAM!', 'BOP!', 'BIFF!']
/** The wai: she faces out, turned a little toward the coach on her left. */
const KAYLEE_WAI_YAW = -0.3
/** They stand side on to us, each turned well toward us (like actors on a stage), so both faces show: her yaw to
 *  fight (radians), turned right round for the kick, and Dad's (degrees; and sitting on the mat after a knock-down). */
const KAYLEE_FACE = 0.72
const KAYLEE_KICK = -1.0
const DAD_FACE = -40
const DAD_SIT = -28
/** Dad's arms ([x, z] left then right; his right is the one nearer us): mitts apart, up by his face, down by his tummy,
 *  the right one wound up over his head, and brought down. */
const ARMS: Record<Guard | 'wind' | 'swung' | 'limp' | 'flail' | 'cower', Arms> = {
  open: [-1.35, -0.55, -1.35, 0.55],
  high: [-2.3, 0.3, -2.3, -0.3],
  low: [-1.1, 0.4, -1.1, -0.4],
  wind: [-1.5, 0.2, -2.8, 0.55],
  swung: [-1.5, 0.2, -1.25, -0.2],
  limp: [-0.2, -0.35, -0.2, 0.35],
  flail: [-0.4, -2.2, -0.4, 2.2],
  cower: [-2.5, 0.45, -2.5, -0.45],
}
/** How far along his swing the mitt lands on her head. */
const SWING = { dur: 0.36, lands: 0.6 }
/** The ropes on the right, where a flying Dad meets them. */
const ROPE_X = POSTS[1][0] - 0.3
/** How many times a tap bounces a flying Dad before he's too heavy. */
const JUGGLES = 6

export class MuayThai extends Stage {
  private built: Built
  private gear: Gear
  private gold: Group[] = []
  private kaylee: Avatar
  private nick: Member
  private coach: Coach
  private beat = new Beat()
  private phase: Phase = 'wai'
  private round: Round
  /** After the belt: the bout goes on. */
  private free = false
  private stars: number
  private starPop = [1, 1, 1]
  private starTwinkle = -1
  private bowed = false
  // ---- Her ----
  private kAct: { kind: 'bow' | 'dance' | 'hop'; t: number; dur: number; k: number } | null = null
  private punch: Punch | null = null
  private nextArm: 0 | 1 = 0
  private kYaw = 0
  private kBase = V(KAYLEE.x, 0, KAYLEE.z)
  private guardK = 0
  /** Time into being bopped by his mitt (-1: not). */
  private bopped = -1
  private steps = 0
  // ---- The bout ----
  /** Her super punch: 0 empty, 1 full (then `ready`). */
  private power = 0
  private ready = false
  private combo = 0
  private best = 0
  private lastHit = -9
  private hits = 0
  private counters = 0
  private bopsInARow = 0
  private bops = 0
  private kos = 0
  private juggles = 0
  // ---- Dad ----
  private dad: { mode: DadMode; t: number; push: number; guard: Guard; guardT: number; windDur: number; back: number } = { mode: 'guard', t: 0, push: 0, guard: 'open', guardT: 2, windDur: 1.6, back: -1 }
  private dArms: Arms = [...ARMS.open]
  private nextSwing = Infinity
  private swell = 0
  private stagger = { s: 0, v: 0 }
  private nod = { a: 0, v: 0 }
  private bellyT = 9
  private mittT = 9
  private dBow = -1
  private flight: Flight | null = null
  private counting = -1
  // ---- Juice ----
  /** Seconds of freeze left (a big hit stops time for a blink), and the camera's shake. */
  private freeze = 0
  private shake = 0
  private slow = false
  private ringHop = 9
  // ---- The gym ----
  private swing = { a: 0, v: 0 }
  private swing2 = { a: 0, v: 0 }
  private ropeBack = { a: 0, v: 0 }
  private ropeSide = { a: 0, v: 0 }
  private skin = 9
  private bellT = 9
  private bottleT = 9
  private beltPop = -1
  private later: { t: number; f: () => void }[] = []
  private pows: Pow[] = []
  private powEls: HTMLElement[] = []
  private comboEl: HTMLElement | null = null
  private comboPop = 9
  private downHandled = false
  private tall = false
  private allDoneSent = false
  private talk = new Talk((l) => this.bev.say(l))
  private starsFx: Floaters
  private sparkles: Floaters
  private drops: Floaters
  private ray = new Raycaster()
  private dadPlane = new Plane(new Vector3(0, 0, 1), -DAD.z)

  constructor(renderer: WebGLRenderer, private bev: BoxingEvents, start: BoxingStart) {
    super(renderer, bev)
    const { scene, bag } = this
    scene.background = new Color('#EBDDFF')
    this.rig.fov = 30
    this.built = buildGym(bag)
    scene.add(this.built.root)
    // ---- Kaylee in her gloves, headband and grip socks; Dad in his sparring gear; the coach ----
    const { kaylee, members } = this.makeFamily(['nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    kaylee.wear(['gloves', 'mongkhon'])
    // The gold belt goes round her dress (a tutu or a gown is wider than the belt): Muay Thai takes her outfit too.
    kaylee.claim('belt', ['outfit'])
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    // Round her waist (the belt was made 0.172 m round; her dress is narrower), in a group of its own so the belt's pop
    // can scale it.
    const waist = kaylee.rig.waist!
    const fit = new Group()
    fit.position.set(0, waist.y, waist.z)
    fit.scale.set(waist.rx / 0.172, 1, waist.rz / 0.172)
    fit.add(this.built.belt)
    kaylee.rig.body.add(fit)
    // A gold shell over each of her gloves, for when the super punch is ready.
    for (const [arm, s] of [[kaylee.rig.armL, -1], [kaylee.rig.armR, 1]] as const) {
      const g = goldGlove(bag)
      g.position.set(...along(s, HOOF + 0.012))
      g.rotation.z = s * ARM
      g.visible = false
      arm.add(g)
      this.gold.push(g)
    }
    // Dad's mitts on his hands, the pad on his tummy.
    const H = this.nick.height
    this.gear = buildGear(H, bag)
    this.nick.rig.armL.add(this.gear.mitts[0])
    this.nick.rig.armR.add(this.gear.mitts[1])
    this.gear.belly.position.set(0, 0.33 * H, 0.105 * H)
    this.nick.rig.body.add(this.gear.belly)
    this.nick.root.userData.pick = 'dad'
    this.coach = new Coach(bag)
    bag.add({ dispose: hallBed() })
    scene.add(kaylee.root, this.nick.root, this.coach.root)
    this.put(kaylee, KAYLEE.x, 0, KAYLEE.z, 'stand', 0)
    this.put(this.nick, DAD.x, 0, DAD.z, 'stand', DAD_FACE)
    this.starsFx = new Floaters(starGeometry(), [PAL.gold, '#FFFFFF', PAL.hotpink, PAL.gold], 90, bag, 2.2, 1.6)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 90, bag, 1.2, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 1), ['#A8DCFF', '#FFFFFF', '#8EC9F5'], 40, bag, 6, 0.4)
    scene.add(this.starsFx.mesh, this.sparkles.mesh, this.drops.mesh)
    // ---- The round the link starts at (the stars before it are already on the board) ----
    this.round = start.round
    this.stars = start.round - 1
    this.built.stars.forEach((s, i) => (s.visible = i < this.stars))
    this.bev.round(this.round)
    this.lightLamps()
    if (start.round === 1) {
      // The bow first: the coach beside her, gloves together.
      this.coach.place(COACH_WAI.x, COACH_WAI.z, COACH_WAI.face)
      this.coach.setMode('wai')
      this.faceWai()
      // The coach's hello and thank you, then "Tap your gloves to bow!".
      this.after(0.5, () => {
        this.talk.say(T.hello)
        this.after(3.0, () => !this.bowed && this.talk.say(T.bow))
      })
    } else {
      this.bowed = true
      this.phase = 'between'
      this.coach.place(this.coachDrum.x, this.coachDrum.z, 0)
      this.coach.setMode('drum')
      this.faceDad()
      this.guardK = 1
      this.after(0.6, () => this.startBout())
    }
  }

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  // ---------------------------------------------------------------- places (a tall screen brings the left side in)

  private lx(x: number) {
    return this.tall ? x + TALL_SHIFT : x
  }
  private get drumAt() {
    return V(this.lx(DRUM.x), 0, DRUM.z)
  }
  private get coachDrum() {
    return { x: this.lx(DRUM.x), z: DRUM.z + COACH_DRUM.dz }
  }
  private placeLeft() {
    this.built.drum.position.copy(this.drumAt)
    this.built.stool.position.set(this.lx(BOTTLE.x), 0, BOTTLE.z)
    this.built.bottle.position.set(this.lx(BOTTLE.x), BOTTLE.stool + 0.03, BOTTLE.z)
    if (this.coach.mode === 'drum' && !this.coach.walking) this.coach.place(this.coachDrum.x, this.coachDrum.z, 0)
  }

  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tall) {
      this.tall = tall
      this.placeLeft()
    }
    super.setSize(w, h, top)
  }

  // ---------------------------------------------------------------- the bow, the bell, the rounds

  /** The wai before a bout: she bows, and the coach and Dad bow back. Then the bell. */
  private bow() {
    if (this.bowed) return
    this.bowed = true
    this.faceWai()
    this.kAct = { kind: 'bow', t: 0, dur: 1.0, k: 0.42 }
    sfx.bow(2)
    this.after(0.25, () => this.coach.play('bow', 0.42))
    this.after(0.35, () => (this.dBow = 0))
    this.after(1.3, () => {
      this.bev.warmedUp()
      this.coach.setMode('guard')
      this.coach.goTo(this.coachDrum.x, this.coachDrum.z, 0, () => this.coach.setMode('drum'))
      this.faceDad()
      this.phase = 'between'
    })
    this.after(1.9, () => this.startBout())
  }

  /** Ding ding, "Chok!", and they fight. */
  private startBout() {
    if (this.disposed) return
    this.phase = 'bout'
    this.power = 0
    this.ready = false
    this.combo = 0
    this.bopsInARow = 0
    this.lightLamps()
    this.dad.mode = 'guard'
    this.dad.push = 0
    this.dad.guard = this.guards() ? 'high' : 'open'
    this.dad.guardT = 2.6
    this.nextSwing = this.swings() ? this.time + 2.4 : Infinity
    this.faceDad()
    sfx.bell(2)
    this.bellT = 0
    this.beat.start(this.time, PERIOD.calm, 0.5)
    this.after(0.35, () => this.talk.say(T.chok))
    // What's new this round, from Sparkle (round 1: how to punch).
    if (!this.free && this.round === 1) this.after(1.3, () => this.talk.once('punch', T.punch))
  }
  /** Does Dad swing back now (round 2 on), and does he guard high and low (round 3 on)? */
  private swings() {
    return this.free || this.round >= 2
  }
  private guards() {
    return this.free || this.round >= 3
  }
  private get need() {
    return this.free ? NEED_FREE : NEED[this.round]
  }

  private giveStar() {
    if (this.stars >= 3) return
    const i = this.stars++
    this.built.stars[i].visible = true
    this.starPop[i] = 0
    sfx.star()
    this.sparkles.burst(this.built.stars[i].getWorldPosition(new Vector3()), 16, 1.4, 1.6, 1, 0.05)
  }

  /** The board's lamps: her super punch filling up. */
  private lightLamps() {
    const lit = this.ready ? LAMPS : Math.floor(clamp(this.power) * LAMPS + 0.001)
    this.built.lamps.forEach((m, i) => {
      const mat = toon(i < lit ? LAMP_LIT : LAMP_DIM)
      if (m.material !== mat) m.material = mat
    })
  }

  // ---------------------------------------------------------------- facing

  private faceToward(x: number, z: number) {
    this.kYaw = Math.atan2(x - this.kBase.x, z - this.kBase.z)
    this.kaylee.face(this.kYaw)
  }
  private faceWai() {
    this.kYaw = KAYLEE_WAI_YAW
    this.kaylee.face(this.kYaw)
  }
  private faceDad() {
    this.kYaw = KAYLEE_FACE
    this.kaylee.face(this.kYaw)
  }
  /** Where Dad stands now (pushed back by her punches). */
  private get dadX() {
    return DAD.x + this.dad.push
  }
  private get H() {
    return this.nick.height
  }

  // ---------------------------------------------------------------- punching

  /** Where her finger is on Dad (a flat plane through him), and which part of him that is. */
  private aim(x: number, y: number): { zone: Zone; at: Vector3 } {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const p = this.ray.ray.intersectPlane(this.dadPlane, tmp)
    const py = p ? p.y : 0.6 * this.H
    const zone: Zone = py > 0.6 * this.H ? 'head' : 'body'
    const at = V(this.dadX - 0.17 * this.H, zone === 'head' ? clamp(py, 0.68 * this.H, 0.86 * this.H) : clamp(py, 0.2 * this.H, 0.5 * this.H), DAD.z)
    return { zone, at }
  }
  private mittAt() {
    return this.gear.mitts[1].getWorldPosition(new Vector3())
  }
  /** His big mitt is up and swelling: she can pop it. */
  private get mittUp() {
    return this.phase === 'bout' && this.dad.mode === 'windup' && this.swell > 0.2
  }

  /** A finger on Dad (or his big mitt): what it does depends on where the bout is. */
  private hitDad(x: number, y: number, what: 'dad' | 'mitt') {
    if (this.phase === 'wai') return this.bow()
    if (this.phase === 'super') return
    if (this.phase === 'ko') return this.flight ? this.bounceDad() : this.pokeDad()
    if (this.phase !== 'bout') return this.pokeDad()
    if (this.dad.mode === 'up') return
    if (this.ready) return this.superPunch()
    const a = what === 'mitt' && this.mittUp ? { zone: 'mitt' as Zone, at: this.mittAt() } : this.aim(x, y)
    this.jab(a.zone, a.at)
  }

  private jab(zone: Zone, at: Vector3) {
    // A punch still on its way out lands now, so every tap counts however fast she goes.
    if (this.punch && !this.punch.hit && this.punch.kind === 'jab') this.contact(this.punch)
    this.faceDad()
    const dir = V(at.x - this.kBase.x, 0, at.z - this.kBase.z)
    const dist = dir.length()
    dir.normalize()
    this.punch = { t: 0, dur: FEEL.punch, arm: this.nextArm, kind: 'jab', zone, at, hit: false, dir, lunge: clamp(dist - 0.36, 0, 0.75), leap: clamp(at.y - 0.78, 0, 1.6) }
    this.nextArm = this.nextArm ? 0 : 1
    this.guardK = 1
    sfx.swish()
  }

  /** The glove lands. */
  private contact(p: Punch) {
    p.hit = true
    const d = this.dad
    if (this.phase !== 'bout' || d.mode === 'fly' || d.mode === 'sit' || d.mode === 'up') return
    if (p.zone === 'mitt') return d.mode === 'windup' ? this.popMitt(p) : void sfx.pap()
    const blocked = (d.guard === 'high' && p.zone === 'head') || (d.guard === 'low' && p.zone === 'body')
    const dizzy = d.mode === 'dizzy'
    this.combo = this.time - this.lastHit <= FEEL.combo ? this.combo + 1 : 1
    this.best = Math.max(this.best, this.combo)
    this.lastHit = this.time
    this.hits++
    this.comboPop = 0
    const fifth = this.combo % 5 === 0
    this.gain((blocked ? 0.4 : 1) * (dizzy ? 2 : 1))
    // What Dad does with it: a step back toward the ropes, a lean, his head or his tummy pad taking it.
    const k = blocked ? 0.4 : fifth ? 1.6 : 1
    d.push += FEEL.push * k
    this.stagger.v += 1.5 * k
    if (blocked) {
      this.mittT = 0
      sfx.pap()
    } else {
      if (p.zone === 'head') this.nod.v += 7
      else this.bellyT = 0
      sfx.thud(fifth ? 1.6 : 1)
      sfx.combo(Math.min(10, this.combo - 1))
    }
    const at = p.at.clone().add(tmp.copy(p.dir).multiplyScalar(-0.06))
    if (fifth) {
      // Every fifth hit of a combo is a big one.
      sfx.pow()
      this.freeze = 0.05
      this.shake = Math.max(this.shake, 0.35)
      this.starsFx.burst(at, 16, 2.0, 2.0, 0.6, 0.09)
      this.popPow(at, 'POW!', true)
      this.after(0.1, () => this.oof(this.combo >= 10))
    } else {
      this.starsFx.burst(at, blocked ? 3 : 6, 1.2, 1.2, 0.6, 0.06)
      this.popPow(at, blocked ? 'PAP!' : dizzy ? 'BAM!' : JABS[this.hits % JABS.length], false)
    }
    // Into the ropes: they stretch and boing him back in.
    if (d.push >= DAD.rope - DAD.x && d.back < 0) {
      d.back = 0
      this.ropeSide.v += 4
      sfx.twang()
      this.after(0.08, () => sfx.boing())
    }
  }

  /** Her super punch fills by `hits` (a plain hit is one). */
  private gain(hits: number) {
    if (this.ready) return
    this.power = clamp(this.power + hits / this.need)
    this.lightLamps()
    if (this.power < 1) return
    // Full: her gloves turn gold, and Dad doesn't like the look of it.
    this.ready = true
    this.lightLamps()
    this.gold.forEach((g) => (g.visible = true))
    sfx.ready()
    this.sparkles.burst(this.glovesAt(), 18, 1.4, 1.6, 0.9, 0.05)
    if (this.dad.mode === 'windup') this.dad.mode = 'guard'
    this.nextSwing = Infinity
    const kick = this.kicks()
    this.after(0.25, () => {
      if (!this.talk.once(kick ? 'kick' : 'super', kick ? T.kick : T.super)) this.talk.react(this.time, T.uhOh)
    })
  }
  /** Is this round's super punch the big unicorn kick (the third round's, and every other one after the belt)? */
  private kicks() {
    return this.free ? this.kos % 2 === 1 : this.round === 3
  }

  /** Dad takes a big one: now and then he says so, else just oof. */
  private oof(big: boolean) {
    if (!this.talk.react(this.time, big ? T.oof : T.strong)) sfx.oof()
  }

  /** She pops his big mitt before it comes down: BONK. It deflates, he spins round and wobbles, dizzy. */
  private popMitt(p: Punch) {
    const d = this.dad
    d.mode = 'dizzy'
    d.t = 0
    this.counters++
    this.bopsInARow = 0
    this.combo++
    this.lastHit = this.time
    this.comboPop = 0
    sfx.bonk()
    this.freeze = 0.08
    this.shake = Math.max(this.shake, 0.5)
    this.starsFx.burst(p.at, 20, 2.2, 2.0, 0.7, 0.09)
    this.popPow(p.at, 'BONK!', true)
    this.gain(3)
    this.after(0.5, () => this.talk.react(this.time, T.dizzy))
  }

  /** His mitt comes down on her head: a soft bop. She squashes, slides back and giggles; next time he's slower. */
  private bop() {
    this.bopped = 0
    this.bops++
    this.bopsInARow++
    this.combo = 0
    sfx.bop()
    this.after(0.25, () => sfx.giggle())
    const at = this.kaylee.root.position.clone().add(V(0, 1.0, 0))
    this.starsFx.burst(at, 5, 1.0, 1.2, 0.5, 0.05)
    this.popPow(at, 'BOP!', false)
    this.after(0.3, () => this.talk.react(this.time, T.gotcha))
  }

  // ---------------------------------------------------------------- the super punch, the knock-down, the count

  private superPunch() {
    const kick = this.kicks()
    this.phase = 'super'
    this.slow = true
    const at = V(this.dadX - 0.15 * this.H, 0.36 * this.H, DAD.z)
    const dir = V(at.x - this.kBase.x, 0, at.z - this.kBase.z).normalize()
    if (kick) {
      // Her unicorn kick: she turns her back to Dad and bucks with both back hooves.
      this.kYaw = KAYLEE_KICK
      this.kaylee.face(this.kYaw)
      this.punch = { t: 0, dur: 0.62, arm: 0, kind: 'kick', zone: 'body', at, hit: false, dir: dir.clone().negate(), lunge: 0.25, leap: 0 }
    } else {
      this.faceDad()
      this.punch = { t: 0, dur: 0.5, arm: 1, kind: 'super', zone: 'body', at, hit: false, dir, lunge: clamp(at.x - this.kBase.x - 0.3, 0.1, 1.2), leap: 0 }
    }
    sfx.windUp()
  }

  /** It lands: KA-POW. Dad flies into the ropes. */
  private superLands() {
    const at = this.punch?.at.clone() ?? V(this.dadX, 0.6, DAD.z)
    this.phase = 'ko'
    this.slow = false
    this.ready = false
    this.power = 0
    this.lightLamps()
    this.gold.forEach((g) => (g.visible = false))
    this.kos++
    this.freeze = 0.12
    this.shake = 1
    sfx.bigKick()
    this.after(0.05, () => sfx.pow())
    this.starsFx.burst(at, 28, 2.8, 2.4, 0.9, 0.1)
    this.sparkles.burst(at, 14, 2.0, 1.6, 0.8, 0.06)
    this.popPow(at, 'KA-POW!', true)
    this.dad.mode = 'fly'
    this.dad.t = 0
    this.swell = 0
    this.flight = { p: V(this.dadX, 0.05, DAD.z), v: V(FEEL.launch, 2.0, 0), rot: 0, spin: -5, roped: false, juggles: 0 }
    this.nick.setPose('stand')
    this.after(0.1, () => this.talk.say(T.ropes))
  }

  /** A tap on Dad in the air: boing, up he goes again. */
  private bounceDad() {
    const f = this.flight
    if (!f || !f.roped) return
    // (After a few he's too heavy to bounce, so the count still comes.)
    if (f.juggles >= JUGGLES) {
      sfx.pap()
      return
    }
    f.juggles++
    this.juggles++
    // Up toward the ceiling, never past it (he stays on screen).
    f.v.y = Math.min(FEEL.juggle, Math.sqrt(2 * FEEL.float * Math.max(0.08, DAD.ceil - f.p.y)))
    f.v.x = (DAD.land - f.p.x) / ((2 * f.v.y) / FEEL.float + 0.2)
    f.spin = (f.juggles % 2 ? 7 : -7) * (0.8 + Math.random() * 0.4)
    sfx.juggle(Math.min(6, f.juggles))
    if (f.juggles === 2) this.after(0.1, () => sfx.giggle())
    const at = f.p.clone().add(V(0, 0.5 * this.H, 0))
    this.starsFx.burst(at, 8, 1.6, 1.4, 0.6, 0.07)
    this.popPow(at, 'BOING!', false)
    this.shake = Math.max(this.shake, 0.2)
  }

  /** A poke at Dad when there's no bout on (sitting on the mat, between rounds): a wiggle and a laugh. */
  private pokeDad() {
    this.nick.react(this.dad.mode === 'sit' ? 'wiggle' : 'hop')
    sfx.boing()
    this.after(0.15, () => sfx.haha())
  }

  /** He's down. The coach trots over and counts him out. */
  private landed(f: Flight) {
    const x = clamp(f.p.x, DAD.x + 0.1, DAD.rope - 0.1)
    this.flight = null
    this.dad.mode = 'sit'
    this.dad.push = x - DAD.x
    this.nick.place(x, 0, DAD.z, DAD_SIT, 'sit')
    this.nick.rig.body.rotation.set(0, 0, 0)
    this.nick.root.rotation.z = 0
    sfx.land()
    this.shake = Math.max(this.shake, 0.7)
    this.ringHop = 0
    this.starsFx.burst(V(x, 0.15, DAD.z + 0.2), 14, 2.0, 1.2, 0.6, 0.07)
    this.after(0.3, () => {
      this.nick.react('wiggle')
      sfx.haha()
    })
    this.coach.setMode('guard')
    this.coach.goTo(Math.min(x + 0.7, ROPE_X - 0.1), DAD.z - 0.4, -50, () => (this.counting = 0))
  }

  private count() {
    const n = this.counting
    this.coach.play('count')
    sfx.drum(true)
    this.skin = 0
    this.talk.say(T.count[n])
    this.popPow(V(this.dadX - 0.1, 1.35, DAD.z), String(n + 1), true, true)
    this.counting++
    if (this.counting < COUNT) this.after(0.85, () => this.count())
    else {
      this.counting = -1
      this.after(0.85, () => this.wonRound())
    }
  }

  /** Counted out: ding ding ding, a star, and (after the third) the belt. */
  private wonRound() {
    this.phase = 'between'
    sfx.bell(3)
    this.bellT = 0
    this.beat.stop()
    this.coach.play('cheer')
    this.kAct = { kind: 'hop', t: 0, dur: 0.6, k: 1 }
    const last = !this.free && this.round === 3
    if (last) return this.champion()
    if (this.free) sfx.cheer()
    else this.after(0.4, () => this.giveStar())
    this.after(0.7, () => this.talk.say(T.again))
    this.after(1.7, () => this.dadUp())
    this.after(2.9, () => {
      this.coach.goTo(this.coachDrum.x, this.coachDrum.z, 0, () => this.coach.setMode('drum'))
      if (!this.free) {
        this.round = (this.round + 1) as Round
        this.bev.round(this.round)
      }
      this.startBout()
    })
  }

  /** The champion: the coach holds her glove up and the gold belt goes round her waist. Then the bout goes on, a toy. */
  private champion() {
    this.phase = 'finale'
    this.coach.goTo(this.kBase.x - 0.6, this.kBase.z + 0.12, 90, () => this.coach.play('cheer'))
    this.after(0.9, () => {
      this.faceToward(this.kBase.x, this.kBase.z + 2)
      this.kAct = { kind: 'hop', t: 0, dur: 0.6, k: 1 }
      this.beltPop = 0
      this.built.belt.visible = true
      sfx.fanfare()
      sounds.sparkle()
      this.sparkles.burst(this.kaylee.root.position.clone().add(V(0, 0.5, 0.2)), 24, 1.6, 2.0, 1.2, 0.06)
      this.giveStar()
      this.after(0.4, () => this.talk.say(T.champion))
    })
    this.after(2.2, () => this.kaylee.twirl())
    this.after(3.6, () => {
      this.free = true
      if (!this.allDoneSent) {
        this.allDoneSent = true
        this.bev.allDone()
      }
      this.dadUp()
    })
    this.after(4.9, () => {
      this.coach.goTo(this.coachDrum.x, this.coachDrum.z, 0, () => this.coach.setMode('drum'))
      this.startBout()
    })
  }

  /** Dad hops up and back to his corner. */
  private dadUp() {
    this.dad.mode = 'up'
    this.nick.setPose('stand')
    this.hop(this.nick, this.scene, V(DAD.x, 0, DAD.z), { face: DAD_FACE, dur: 0.5, arc: 0.4, done: () => (this.dad.push = 0) })
    this.dad.push = 0
    this.after(0.3, () => this.talk.react(this.time, T.more))
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...this.built.picks, this.kaylee.root, this.nick.root, this.coach.root]
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.downHandled = false
    if (x === undefined || y === undefined) return
    const what = id ?? this.pick(x, y)
    if (what === 'dad' || what === 'mitt') {
      // The punch starts on the finger going down (no waiting for it to lift).
      this.touches++
      this.downHandled = true
      this.hitDad(x, y, what)
    }
  }

  tap(x: number, y: number, id?: string) {
    // Already punched when the finger went down.
    if (this.downHandled) {
      this.downHandled = false
      this.lastTouch = this.time
      return
    }
    super.tap(x, y, id)
  }

  protected onTap(id: string | null, x: number, y: number) {
    if (!id) return
    switch (id) {
      case 'dad':
      case 'mitt': {
        // (A key press: no finger went down. Aim at his tummy.)
        const s = this.toScreen(V(this.dadX, 0.36 * this.H, DAD.z), 0)
        return this.hitDad(x || s?.x || this.w / 2, y || s?.y || this.h / 2, id)
      }
      case 'gloves':
      case 'kaylee':
      case 'family:kaylee':
        if (this.phase === 'wai') return this.bow()
        // A ram muay dance step (arms out like a bird's wings), a drum beat with it; the coach copies her.
        if (this.punch || this.bopped >= 0) return
        this.kAct = { kind: 'dance', t: 0, dur: 0.62, k: this.steps % 2 ? 1 : -1 }
        sfx.step((this.steps % 4) * 2)
        if (!this.coach.busy && this.coach.mode !== 'drum') this.coach.play('dance', this.steps % 2 ? -1 : 1)
        this.steps++
        return
      case 'bag':
        this.swing.v += 2.2
        sfx.thud(0.8)
        this.starsFx.burst(V(BAG.x, 0.95, BAG.z + 0.2), 5, 1.2, 1.2, 0.5, 0.05)
        return
      case 'bag2':
        // The coach shows a kick on the small bag (a spin, thwack).
        this.coach.look = V(BAG2.x, 1, BAG2.z)
        if (this.coach.busy || this.coach.mode !== 'drum') return void (this.swing2.v += 1.2)
        this.coach.play('kick', 1, () => {
          this.swing2.v += 2.4
          sfx.thwack()
          this.starsFx.burst(V(BAG2.x, 0.95, BAG2.z + 0.15), 6, 1.2, 1.2, 0.5, 0.05)
        })
        sfx.whoosh(0.3)
        return
      case 'drum':
        sfx.drum(true)
        this.skin = 0
        if (!this.coach.busy) this.coach.play('hop')
        return
      case 'bell':
        sfx.bell(3)
        this.bellT = 0
        return
      case 'ropes':
        this.ropeBack.v += 3
        this.ropeSide.v += 2
        sfx.twang()
        return
      case 'bottle':
        this.bottleT = 0
        sfx.squirt()
        for (let i = 0; i < 14; i++) this.drops.emit(this.built.bottle.position.clone().add(V(0, 0.34, 0)), V(1.0 + Math.random() * 0.5, 2.2 + Math.random() * 0.8, -0.3 + Math.random() * 0.3), 0.9, 0.035 + Math.random() * 0.02)
        this.after(0.7, () => sfx.giggle())
        return
      case 'board':
        this.after(0.3, () => this.talk.once('sport', T.sport))
        if (!this.stars) {
          sfx.boing()
          this.built.board.rotation.z = 0.12
          return
        }
        this.starTwinkle = 0
        return
      case 'coach':
        if (this.counting >= 0) return
        this.coach.play(this.coach.mode === 'drum' ? 'hop' : 'pose')
        // The first poke: what the wai is for, in his own voice (after that, his babble).
        if (!this.talk.once('waiKru', T.waiKru)) sfx.coach()
        return
    }
  }

  // ---------------------------------------------------------------- the POWs, the combo number

  setPowElements(els: HTMLElement[]) {
    this.powEls = els
  }
  setComboElement(el: HTMLElement | null) {
    this.comboEl = el
  }
  private popPow(at: Vector3, text: string, big: boolean, count = false) {
    const free = this.powEls.find((el) => !this.pows.some((p) => p.el === el)) ?? this.pows.shift()?.el
    if (!free) return
    free.textContent = text
    free.dataset.big = big ? '1' : ''
    this.pows.push({ el: free, at: at.clone(), t: 0, big, count })
  }

  // ---------------------------------------------------------------- per frame

  /** Big hits stop time for a blink, and the super punch winds up in slow motion. */
  update(dt: number) {
    this.shake *= Math.exp(-dt * 7)
    if (this.freeze > 0) {
      this.freeze -= dt
      dt *= 0.03
    } else if (this.slow) dt *= FEEL.slowmo
    super.update(dt)
  }

  render() {
    const k = this.shake
    if (k < 0.01) return super.render()
    const c = this.rig.camera.position
    const ox = Math.sin(this.time * 97) * 0.035 * k
    const oy = Math.cos(this.time * 83) * 0.035 * k
    c.x += ox
    c.y += oy
    super.render()
    c.x -= ox
    c.y -= oy
  }

  protected step(dt: number, t: number) {
    for (const l of [...this.later]) {
      if (this.time < l.t) continue
      this.later.splice(this.later.indexOf(l), 1)
      l.f()
    }

    // ---- The drum's beat: faster as her super punch fills ----
    const hot = this.ready || this.phase === 'super' ? 1 : clamp((this.power - 0.5) * 2)
    this.beat.setPeriod(PERIOD.calm + (PERIOD.hot - PERIOD.calm) * hot)
    const tick = this.beat.tick(t)
    if (tick === 'beat') {
      if (this.coach.mode === 'drum') {
        sfx.drum(this.beat.n % 4 === 1)
        this.skin = 0
      }
      this.coach.drumArm = this.coach.drumArm ? 0 : 1
    } else if (tick === 'off' && this.coach.mode === 'drum') sfx.ching()
    this.coach.drumPhase = this.beat.on ? 1 - this.beat.ring(t) : 0

    // ---- The count ----
    if (this.counting === 0 && !this.coach.busy && !this.pows.some((p) => p.count)) this.count()

    // ---- Dad's turn: a swing now and then (round 2 on), his guard up and down (round 3 on) ----
    const d = this.dad
    if (this.phase === 'bout' && d.mode === 'guard' && !this.ready) {
      if (t >= this.nextSwing) {
        d.mode = 'windup'
        d.t = 0
        // Slower the first time, and after each one that lands on her.
        d.windDur = FEEL.windUp + (this.counters + this.bops === 0 ? 0.6 : 0) + Math.min(2, this.bopsInARow) * 0.35
        sfx.whoop(d.windDur)
        this.after(0.3, () => this.talk.once('glove', T.glove))
      } else if (this.guards()) {
        d.guardT -= dt
        if (d.guardT <= 0) {
          d.guard = d.guard === 'high' ? 'low' : 'high'
          d.guardT = 2.2 + Math.random() * 0.8
          sfx.swish()
          this.talk.once('upDown', T.upDown)
        }
      }
    }
    this.dadState(dt)

    // ---- The bags (pendulums), the ropes, the drum's skin, the bell, the bottle, the board ----
    const sw = this.swing
    sw.v += (-9 * sw.a - 1.3 * sw.v) * dt
    sw.a = clamp(sw.a + sw.v * dt, -0.6, 0.6)
    this.built.bag.pivot.rotation.z = sw.a
    const s2 = this.swing2
    s2.v += (-9 * s2.a - 1.4 * s2.v) * dt
    s2.a += s2.v * dt
    this.built.bag2.pivot.rotation.z = -s2.a
    for (const [r, w, k] of [
      [this.built.back, this.ropeBack, 0],
      [this.built.side, this.ropeSide, 1],
    ] as const) {
      w.v += (-110 * w.a - 3.5 * w.v) * dt
      w.a += w.v * dt
      ;(r as Rope[]).forEach((rope, i) => {
        const mid = rope.from.clone().lerp(rope.to, 0.5)
        if (k === 0) {
          mid.y += Math.sin(i * 1.7 + t * 30) * w.a * 0.03
          mid.z += w.a * 0.08
        } else mid.x += w.a * 0.12 * (1 + i * 0.15)
        setPiece(rope.a, rope.from, mid)
        setPiece(rope.b, mid, rope.to)
      })
    }
    // (When Dad lands, everything on the mat jumps.)
    this.ringHop += dt
    const jump = bell(clamp(this.ringHop / 0.32)) * 0.09
    this.skin += dt
    const sk = Math.exp(-this.skin * 10) * 0.35
    this.built.skin.scale.set(1 + sk * 0.2, 1 - sk, 1 + sk * 0.2)
    this.built.drum.scale.set(1 + sk * 0.04, 1 - sk * 0.05, 1 + sk * 0.04)
    this.built.drum.position.y = jump
    this.bellT += dt
    this.built.bell.rotation.z = Math.sin(this.bellT * 40) * 0.12 * Math.exp(-this.bellT * 3)
    this.bottleT += dt
    this.built.bottle.rotation.z = Math.sin(this.bottleT * 18) * 0.2 * Math.exp(-this.bottleT * 4)
    this.built.bottle.scale.y = 1 - 0.15 * bell(clamp(this.bottleT / 0.3))
    this.built.bottle.position.y = BOTTLE.stool + 0.03 + jump * 1.6
    this.built.board.rotation.z *= Math.exp(-dt * 6)
    this.built.stars.forEach((s, i) => {
      this.starPop[i] = Math.min(1, this.starPop[i] + dt / 0.6)
      let k = this.starPop[i] < 1 ? span(this.starPop[i], 0, 0.3) * (1 + wobble(this.starPop[i], 2) * 0.5) : 1
      if (this.starTwinkle >= 0) k *= 1 + 0.35 * bell(clamp((this.starTwinkle - i * 0.18) / 0.35))
      s.scale.setScalar(Math.max(0.01, k))
      s.rotation.z = Math.sin(t * 1.5 + i) * 0.08
    })
    if (this.starTwinkle >= 0) {
      const before = this.starTwinkle
      this.starTwinkle += dt
      for (let i = 0; i < this.stars; i++) if (before < i * 0.18 && this.starTwinkle >= i * 0.18) sfx.note(5 + i * 2)
      if (this.starTwinkle > 1.2) this.starTwinkle = -1
    }

    // ---- The 👆 after a while with nothing touched: Sparkle says what to do, once each time it shows ----
    this.talk.hint(this.time, this.lastTouch, () => this.hintAt() !== null, () => (this.phase === 'wai' ? T.hint.gloves : this.mittUp ? T.glove : T.hint.dad))

    // ---- The people ----
    const k = this.kaylee
    const dadHead = this.flight ? this.flight.p.clone().setY(this.flight.p.y + 0.5 * this.H) : V(this.dadX, 0.75 * this.H, DAD.z)
    // (For the bow she and the coach glance at each other but keep their faces to us.)
    const lookAt = this.punch ? this.punch.at : this.phase === 'wai' ? this.coach.root.position.clone().add(V(0, 0.85, 1.6)) : this.mittUp ? this.mittAt() : dadHead
    k.lookAt(lookAt.x, lookAt.y, lookAt.z)
    k.update(dt, t)
    this.kayleeFrame(dt, t)
    this.nick.lookAt(k.position.x, 0.75, k.position.z)
    this.nick.update(dt, t)
    this.dadFrame(dt, t)
    if (!this.coach.look || this.time - this.lastTouch > 1.5) this.coach.look = this.phase === 'wai' ? k.position.clone().add(V(0, 0.7, 1.6)) : dadHead
    this.coach.update(dt, t)
    this.coach.root.position.y += jump

    // ---- Her gold gloves, the belt popping on ----
    if (this.ready) {
      const pulse = 1.12 + 0.1 * Math.sin(t * 11)
      this.gold.forEach((g) => g.scale.setScalar(pulse))
      if (Math.floor(t * 14) !== Math.floor((t - dt) * 14)) this.sparkles.emit(this.glovesAt().add(V((Math.random() - 0.5) * 0.25, (Math.random() - 0.5) * 0.2, 0.1)), V(0, 0.6, 0), 0.5, 0.035)
    }
    if (this.beltPop >= 0) {
      this.beltPop = Math.min(1, this.beltPop + dt / 0.6)
      const e = this.beltPop
      this.built.belt.scale.setScalar(Math.max(0.01, span(e, 0, 0.4) * (1 + wobble(e, 2) * 0.3)))
      if (e >= 1) this.beltPop = -1
    }

    this.starsFx.update(dt)
    this.sparkles.update(dt)
    this.drops.update(dt)
    this.comboPop += dt
    if (this.combo && this.time - this.lastHit > FEEL.combo) this.combo = 0
    for (const p of [...this.pows]) {
      p.t += dt
      if (p.t > (p.count ? 0.8 : 0.75)) this.pows.splice(this.pows.indexOf(p), 1)
    }
  }

  /** Dad's part of the bout as time goes by: stepping back in, his wind-up and swing, being dizzy, flying. */
  private dadState(dt: number) {
    const d = this.dad
    d.t += dt
    // Pushed back by her punches, he steps back in when she lets up; from the ropes he's boinged back in.
    if (d.back >= 0) {
      d.back += dt / 0.45
      d.push *= Math.exp(-dt * 7)
      if (d.back >= 1) d.back = -1
    } else if (d.mode !== 'sit' && d.mode !== 'fly' && d.mode !== 'up' && this.time - this.lastHit > 0.45) d.push = Math.max(0, d.push - 0.45 * dt)
    if (d.mode === 'windup') {
      this.swell = Math.min(1, d.t / (d.windDur * 0.7))
      if (d.t >= d.windDur) {
        d.mode = 'swing'
        d.t = 0
        sfx.whoosh(0.25)
      }
    } else {
      this.swell = Math.max(0, this.swell - dt * (d.mode === 'swing' ? 1.2 : 5))
      if (d.mode === 'swing') {
        const before = (d.t - dt) / SWING.dur
        const now = d.t / SWING.dur
        if (before < SWING.lands && now >= SWING.lands && this.phase === 'bout') this.bop()
        if (now >= 1.8) this.backToGuard()
      } else if (d.mode === 'dizzy' && d.t >= FEEL.dizzy) this.backToGuard()
    }
    // In the air: up into the ropes, slung back, tumbling; down on his bottom.
    const f = this.flight
    if (!f) return
    f.v.y -= FEEL.float * dt
    f.p.addScaledVector(f.v, dt)
    f.rot += f.spin * dt
    if (f.p.x >= ROPE_X && f.v.x > 0) {
      f.p.x = ROPE_X
      f.roped = true
      // Slung back up and over, to land between the ropes and her.
      f.v.y = Math.sqrt(2 * FEEL.float * (DAD.ceil - f.p.y))
      f.v.x = (DAD.land - f.p.x) / ((2 * f.v.y) / FEEL.float)
      f.spin = 6.5
      this.ropeSide.v += 6
      sfx.twang()
      this.after(0.05, () => sfx.boing())
    }
    if (f.p.x < DAD.x && f.v.x < 0) f.v.x = 0
    if (f.p.y <= 0 && f.v.y < 0 && f.roped) this.landed(f)
    else if (f.p.y < 0.05 && !f.roped) f.p.y = 0.05
  }
  private backToGuard() {
    const d = this.dad
    d.mode = 'guard'
    d.t = 0
    this.nextSwing = this.swings() ? this.time + FEEL.swingGap * (0.8 + Math.random() * 0.4) : Infinity
  }

  /** Kaylee, driven by hand: her guard and bounce, the punches (aimed at her finger, a leap for his head), the super
   *  punch and the big kick, the bow, a dance step, being bopped. (After Avatar.update: her blinks and her turning.) */
  private kayleeFrame(dt: number, t: number) {
    const k = this.kaylee
    const r = k.rig
    const fight = this.phase !== 'wai'
    this.guardK += ((fight ? 1 : 0) - this.guardK) * (1 - Math.exp(-dt * 6))
    // At rest: gloves down by her sides for the bow, the guard up (and a bounce on her toes) to fight.
    let aL = [-0.25 * (1 - this.guardK) + GUARD[0] * this.guardK, 0.15 * (1 - this.guardK) + GUARD[1] * this.guardK]
    let aR = [-0.25 * (1 - this.guardK) + GUARD[2] * this.guardK, -0.15 * (1 - this.guardK) + GUARD[3] * this.guardK]
    let y = fight ? Math.abs(Math.sin(t * 6.2)) * 0.022 : 0
    let lean = 0
    let twist = 0
    let tilt = 0
    let headPitch = 0
    let squash = 0
    const off = new Vector3()
    const bodyOff = new Vector3()
    // ---- The bow, a dance step, a hop ----
    const a = this.kAct
    if (a) {
      a.t += dt / a.dur
      const p = Math.min(1, a.t)
      if (a.kind === 'bow') {
        // Gloves together (the wai), then the bow, then up.
        const wai = span(p, 0, 0.2) * (1 - span(p, 0.88, 1))
        aL = [aL[0] + (-1.75 - aL[0]) * wai, aL[1] + (0.5 - aL[1]) * wai]
        aR = [aR[0] + (-1.75 - aR[0]) * wai, aR[1] + (-0.5 - aR[1]) * wai]
        const b = bell(span(p, 0.15, 0.9))
        lean += a.k * b
        headPitch += 0.3 * b
      } else if (a.kind === 'dance') {
        const e = bell(p)
        aL = [aL[0] + (-0.25 - aL[0]) * e, aL[1] + (-1.25 - aL[1]) * e]
        aR = [aR[0] + (-0.25 - aR[0]) * e, aR[1] + (1.25 - aR[1]) * e]
        y += 0.13 * bell(span(p, 0.1, 0.8))
        tilt = -a.k * 0.22 * e
      } else {
        y += 0.2 * bell(span(p, 0.1, 0.9))
      }
      if (p >= 1) this.kAct = null
    }
    // ---- A punch, the super punch or the kick ----
    const pu = this.punch
    if (pu) {
      pu.t += dt / pu.dur
      const p = Math.min(1, pu.t)
      if (pu.kind === 'kick') {
        // Turn (the yaw spring), crouch, then buck: the body tips forward round her chest, so her back hooves fly up
        // behind her into Dad; then down again with a settle.
        const crouch = bell(span(p, 0.2, 0.5))
        const buck = span(p, 0.45, 0.62) * (1 - span(p, 0.72, 0.97))
        const th = 1.25 * buck
        y -= 0.06 * crouch
        lean += th
        bodyOff.set(0, 0.5 - 0.5 * Math.cos(th), -0.5 * Math.sin(th))
        y += 0.12 * buck
        aL = [-2.0 * buck + aL[0] * (1 - buck), aL[1]]
        aR = [-2.0 * buck + aR[0] * (1 - buck), aR[1]]
        off.copy(pu.dir).multiplyScalar(-pu.lunge * span(p, 0.3, 0.6) * (1 - span(p, 0.75, 1)))
        if (!pu.hit && p >= 0.58) {
          pu.hit = true
          this.superLands()
        }
      } else if (pu.kind === 'super') {
        // A huge wind-up (a crouch, the glove right back, a twist away), then she shoots across the ring behind it.
        const wind = span(p, 0, 0.5) * (1 - span(p, 0.56, 0.66))
        const ext = span(p, 0.56, 0.66) * (1 - span(p, 0.8, 1))
        y -= 0.07 * wind
        y += 0.1 * ext
        aR = [GUARD[2] + 1.9 * wind + (-(Math.PI / 2) - GUARD[2]) * ext, GUARD[3] * (1 - ext) - 0.18 * ext]
        twist = -0.75 * wind + 0.45 * ext
        lean += -0.12 * wind + 0.3 * ext
        off.copy(pu.dir).multiplyScalar(-0.1 * wind + pu.lunge * ext)
        if (!pu.hit && p >= 0.66) {
          pu.hit = true
          this.superLands()
        }
      } else {
        // Wind up, out to the target (her arm aimed at the height her finger hit, a leap if it's up high), back.
        const ext = span(p, 0.18, 0.42) * (1 - span(p, 0.55, 1))
        const wind = bell(span(p, 0, 0.25))
        y += pu.leap * bell(span(p, 0.05, 0.95))
        const dist = Math.max(0.25, Math.hypot(pu.at.x - this.kBase.x, pu.at.z - this.kBase.z) - pu.lunge - 0.08)
        const e = Math.atan2(pu.at.y - SHOULDER - y, dist)
        const aim = -(Math.PI / 2 + e)
        const near = pu.arm === 0
        const zIn = near ? 0.18 : -0.18
        const arm = [GUARD[0] + 0.5 * wind + (aim - GUARD[0]) * ext, (near ? GUARD[1] : GUARD[3]) * (1 - ext) + zIn * ext]
        if (near) aL = arm
        else aR = arm
        off.copy(pu.dir).multiplyScalar(pu.lunge * ext)
        lean += 0.22 * ext
        twist = (near ? 1 : -1) * 0.3 * (ext - 0.4 * wind)
        if (!pu.hit && p >= 0.42) this.contact(pu)
      }
      if (p >= 1) this.punch = null
    }
    // ---- Bopped by his mitt: a squash, a slide back, up again ----
    if (this.bopped >= 0) {
      this.bopped += dt / 0.7
      const b = bell(Math.min(1, this.bopped))
      squash = 0.3 * bell(span(this.bopped, 0, 0.35)) - 0.08 * bell(span(this.bopped, 0.35, 0.7))
      off.addScaledVector(V(Math.sin(this.kYaw), 0, Math.cos(this.kYaw)), -0.22 * b)
      lean -= 0.2 * b
      if (this.bopped >= 1) this.bopped = -1
    }
    // ---- Write it (she follows Dad as her punches push him back, and comes back to her corner after) ----
    const d = this.dad
    const chase = this.phase === 'bout' && d.mode !== 'fly' && d.mode !== 'sit' && d.mode !== 'up' ? d.push : 0
    this.kBase.x += (KAYLEE.x + chase - this.kBase.x) * (1 - Math.exp(-dt * 5))
    k.position.set(this.kBase.x + off.x, y, this.kBase.z + off.z)
    r.body.position.set(bodyOff.x, bodyOff.y, bodyOff.z)
    r.body.rotation.set(lean, twist, tilt)
    k.root.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5)
    r.head.rotation.x = headPitch
    r.armL.rotation.set(aL[0], 0, aL[1])
    r.armR.rotation.set(aR[0], 0, aR[1])
  }

  /** Dad, driven by hand: on his toes behind his mitts, staggering, his big mitt winding up and coming down, spinning
   *  dizzy, tumbling through the air, sitting on the mat. (After Member.update: his blinks, breath and hops.) */
  private dadFrame(dt: number, t: number) {
    const n = this.nick
    const r = n.rig
    const d = this.dad
    const H = this.H
    const st = this.stagger
    st.v += (-60 * st.s - 9 * st.v) * dt
    st.s = clamp(st.s + st.v * dt, -0.2, 0.5)
    const nod = this.nod
    nod.v += (-90 * nod.a - 8 * nod.v) * dt
    nod.a = clamp(nod.a + nod.v * dt, -0.5, 0.7)
    this.bellyT += dt
    this.mittT += dt
    // The tummy pad boings in where she hit it; the mitts squash when they block; the near one swells for his swing.
    const bq = Math.exp(-this.bellyT * 8) * Math.cos(this.bellyT * 28) * 0.22
    this.gear.belly.scale.set(1 + bq * 0.5, 1 + bq * 0.5, 1 - bq * 1.6)
    const mq = Math.exp(-this.mittT * 9) * Math.cos(this.mittT * 30) * 0.2
    const big = 1 + 1.7 * this.swell * (1 + 0.06 * Math.sin(t * 22))
    this.gear.mitts[0].scale.setScalar(1 + mq)
    this.gear.mitts[1].scale.setScalar((1 + mq) * big)

    if (d.mode === 'sit' || d.mode === 'up') {
      r.head.rotation.x = 0
      r.armL.rotation.set(0, 0, 0)
      r.armR.rotation.set(0, 0, 0)
      this.dArms = [...ARMS.limp]
      return
    }
    // ---- His arms for what he's doing, eased so they never snap ----
    let want: Arms = ARMS[d.guard]
    let lean = 0.1 - st.s * 0.75
    let tilt = 0
    let spin = 0
    let lunge = 0
    let y = Math.abs(Math.sin(t * 5.6)) * 0.03
    let rate = 14
    if (d.mode === 'windup') {
      // The mitt goes up over his head and swells; he leans back on his heels.
      const k = span(d.t, 0, 0.35)
      want = ARMS.wind
      lean -= 0.3 * k
      y = Math.abs(Math.sin(t * 9)) * 0.015
    } else if (d.mode === 'swing') {
      const k = clamp(d.t / SWING.dur)
      const down = span(k, 0.15, SWING.lands)
      const back = span(d.t / SWING.dur, 1.2, 1.8)
      want = down > 0 ? ARMS.swung : ARMS.wind
      rate = 30
      lean += 0.4 * down * (1 - back)
      lunge = 0.42 * down * (1 - back)
    } else if (d.mode === 'dizzy') {
      // Round and round, then wobbling on the spot with stars round his head.
      const s = span(d.t, 0, 0.9)
      spin = Math.PI * 4 * s * s * (3 - 2 * s)
      const w = span(d.t, 0.7, 1.2) * (1 - span(d.t, FEEL.dizzy - 0.5, FEEL.dizzy))
      want = ARMS.limp
      tilt = Math.sin(t * 5) * 0.2 * w
      lean += Math.cos(t * 3.7) * 0.1 * w
      y = 0
      if (Math.floor(d.t * 8) !== Math.floor((d.t - dt) * 8)) this.starsFx.emit(r.head.localToWorld(V(Math.cos(d.t * 9) * 0.3, r.face.headY + r.face.R * 1.3, Math.sin(d.t * 9) * 0.3)), V(0, 0.3, 0), 0.5, 0.05, 0)
    } else if (d.mode === 'fly') {
      want = ARMS.flail
      rate = 20
    } else if (this.ready) {
      // Her gloves are gold: he hides behind his mitts, knees knocking.
      want = ARMS.cower
      lean -= 0.12
      y = Math.abs(Math.sin(t * 22)) * 0.012
    }
    // (The bow before the bout.)
    if (this.dBow >= 0) {
      this.dBow += dt
      const b = bell(span(this.dBow, 0.1, 0.95))
      want = ARMS.low
      lean += 0.5 * b
      if (this.dBow >= 1) this.dBow = -1
    }
    const e = 1 - Math.exp(-dt * rate)
    this.dArms = this.dArms.map((v, i) => v + (want[i] - v) * e) as Arms
    r.armL.rotation.set(this.dArms[0], 0, this.dArms[1])
    r.armR.rotation.set(this.dArms[2], 0, this.dArms[3])
    r.head.rotation.x = -nod.a * 0.6

    const f = this.flight
    if (f) {
      // Tumbling about his middle.
      const c = 0.45 * H
      n.root.position.set(f.p.x + Math.sin(f.rot) * c, f.p.y + c - Math.cos(f.rot) * c, f.p.z)
      n.root.rotation.set(0, DAD_FACE * deg, 0)
      n.root.rotation.z = f.rot
      r.body.rotation.set(-0.3, 0, 0)
      return
    }
    n.root.rotation.z = 0
    const fwd = V(Math.sin(DAD_FACE * deg), 0, Math.cos(DAD_FACE * deg))
    const back = st.s * 0.3 - lunge
    // (Boinged back in off the ropes: a hop.)
    if (d.back >= 0) y += bell(d.back) * 0.3
    n.root.position.set(this.dadX - fwd.x * back, y, DAD.z - fwd.z * back)
    n.root.rotation.y = DAD_FACE * deg + spin
    r.body.rotation.set(lean, 0, tilt)
  }

  // ---------------------------------------------------------------- camera, anchors, the POWs

  protected shot(): Shot {
    // The super punch: in close on the two of them. A flying Dad: room over the ropes.
    if (this.phase === 'super') return { center: V(0.05, 0.85, 0.15), half: V(1.25, 0.95, 0.8), yaw: 6, pitch: 8, minDist: 4 }
    const up = this.flight ? 0.3 : 0
    // (A tall screen comes in closer: the left side moves in, TALL_SHIFT, and the bell sits on the inside of its post.)
    if (this.w < this.h) return { center: V(0.08, 1.0 + up, 0.25), half: V(1.85, 1.15 + up, 0.9), yaw: 0, pitch: 12, minDist: 5 }
    return { center: V(0.08, 1.02 + up, 0.15), half: V(1.92, 1.12 + up, 1.0), yaw: 0, pitch: 9, minDist: 5 }
  }

  private glovesAt() {
    return this.kaylee.root.position.clone().add(V(Math.sin(this.kYaw) * 0.16, 0.4, Math.cos(this.kYaw) * 0.16))
  }
  /** The middle of Dad, wherever he is (standing, flying, sitting). */
  private dadMid() {
    const p = this.nick.root.position
    if (this.flight) return this.flight.p.clone().setY(this.flight.p.y + 0.45 * this.H)
    return V(p.x, this.dad.mode === 'sit' ? 0.4 * this.H : 0.5 * this.H, p.z)
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const k = this.kaylee
    const idle = this.time - this.lastTouch > 3
    switch (id) {
      case 'gloves':
        return this.phase === 'wai' ? { at: this.glovesAt(), r: 0.16, glow: true, max: 130, prio: 3 } : null
      case 'dad':
        // All of him, head to toe: a punch lands wherever her finger does.
        return { at: this.dadMid(), r: 0.52 * this.H, glow: this.phase === 'bout' && idle && !this.mittUp, max: 420, prio: 2 }
      case 'mitt':
        return this.mittUp ? { at: this.mittAt(), r: MITT_R * this.H * (1 + 1.7 * this.swell) * 1.15, glow: true, max: 260, prio: 4 } : null
      case 'bag':
        return { at: this.built.bag.body.getWorldPosition(new Vector3()), r: BAG.r * 1.2, max: 130, prio: 3 }
      case 'bag2':
        return { at: this.built.bag2.body.getWorldPosition(new Vector3()), r: BAG2.r * 1.2, max: 120, prio: 2 }
      case 'drum':
        return { at: this.drumAt.setY(DRUM.h * 0.8), r: DRUM.r, max: 130, prio: 2 }
      case 'bell':
        return { at: V(BELL.x, BELL.y, BELL.z), r: 0.18, max: 110, prio: 3 }
      case 'ropes':
        return { at: V(POSTS[0][0] + 0.9, 0.8, POSTS[0][1]), r: 0.3, max: 110, prio: 1 }
      case 'bottle':
        return { at: this.built.bottle.position.clone().add(V(0, 0.15, 0)), r: 0.14, max: 100, prio: 3 }
      case 'board':
        return { at: V(BOARD.x, BOARD.y, BOARD.z + 0.1), r: BOARD.w * 0.4, max: 150, prio: 1 }
      case 'coach':
        return { at: this.coach.root.position.clone().setY(0.6), r: 0.3, max: 130, prio: 0 }
      case 'family:kaylee':
        return this.phase === 'wai' ? null : { at: k.position.clone().setY(0.62), r: 0.28, max: 110, prio: 3 }
    }
    return null
  }

  /** After a while with nothing touched: her gloves (the bow), Dad's big mitt, or Dad. */
  protected hintAt() {
    if (this.phase === 'wai') return this.glovesAt()
    if (this.mittUp) return this.mittAt()
    if (this.phase === 'bout') return this.dadMid()
    return null
  }

  placeAnchors() {
    super.placeAnchors()
    // The POWs: popping up from the hit, then floating off and fading. (The count's numbers: bigger, in place.)
    for (const el of this.powEls) {
      const p = this.pows.find((x) => x.el === el)
      const s = p ? this.toScreen(p.at, 0.1) : null
      if (!p || !s) {
        if (el.style.display !== 'none') el.style.display = 'none'
        continue
      }
      const k = p.t / (p.count ? 0.8 : 0.75)
      const scale = (p.count ? 3 : p.big ? 1.5 : 1) * (0.4 + 0.9 * span(k, 0, 0.18) - 0.1 * span(k, 0.18, 0.4))
      el.style.display = ''
      el.style.opacity = String(1 - span(k, 0.7, 1))
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${(s.y - 30 - (p.count ? 10 : 50) * k).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${p.count ? 0 : p.big ? -8 : 6}deg) scale(${scale.toFixed(3)})`
    }
    // The combo's number over Dad's head (from three hits): it jumps with each one.
    const el = this.comboEl
    if (!el) return
    const s = this.combo >= 3 && this.phase === 'bout' ? this.toScreen(V(this.dadX + 0.1, this.H + 0.22, DAD.z), 0.1) : null
    if (!s) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const text = String(this.combo)
    if (el.textContent !== text) el.textContent = text
    el.style.display = ''
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -50%) rotate(-6deg) scale(${(1 + 0.5 * Math.exp(-this.comboPop * 9) + Math.min(0.5, this.combo * 0.03)).toFixed(3)})`
  }

  get calm() {
    return false
  }

  qa() {
    const px = (v: Vector3) => {
      const s = this.toScreen(v, 0)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'boxing',
      round: this.round,
      phase: this.phase,
      free: this.free,
      dad: this.dad.mode,
      guard: this.dad.guard,
      power: Math.round(this.power * 100) / 100,
      ready: this.ready,
      need: this.need,
      hits: this.hits,
      combo: this.combo,
      best: this.best,
      counters: this.counters,
      bops: this.bops,
      kos: this.kos,
      juggles: this.juggles,
      air: !!this.flight?.roped,
      counting: this.counting,
      push: Math.round(this.dad.push * 100) / 100,
      beat: this.beat.on,
      stars: this.stars,
      belt: this.built.belt.visible,
      touches: this.touches,
      // Where to put a finger (screen pixels): his tummy, his head, his big mitt (when it's up), her gloves.
      body: px(this.flight ? this.dadMid() : V(this.dadX - 0.05, 0.36 * this.H, DAD.z)),
      head: px(V(this.dadX - 0.05, 0.76 * this.H, DAD.z)),
      mitt: this.mittUp ? px(this.mittAt()) : null,
      gloves: px(this.glovesAt()),
      lamps: LAMPS,
    }
  }
}
