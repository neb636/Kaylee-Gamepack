// Muay Thai at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "7. Muay Thai bags"), greybox:
// shapes, sounds, no voices. A blue ring mat with its ropes, the big red bag on its bracket with Daddy holding it from
// behind, the coach (the boxer kid from the Big Frame, a little monkey) and his drum, Kaylee in her pink gloves, red
// headband and grip socks.
//
// The toy: punch. A finger going down on the bag (or the pad) and Kaylee punches it right there, at once: the gloves
// take turns, she lunges in and bounces back on her toes, and the arm aims at the height her finger hit. The bag swings
// on its chain and squashes, gold stars and a POW pop out, and Daddy staggers. A swipe across it is a hook.
//   The warm-up, the wai kru: tap her gloves and she presses them together and bows (three bows, lower each time); the
//     coach bows back. Then three dance steps (the ram muay), each with a drum beat; the coach copies her. Then he
//     cheers and goes to his drum: ding ding.
//   1. Free punching: after three punches the drum joins in. Eight punches: a star.
//   2. On the beat: a slow drum (beat.ts), a ring closing on the bag, gold just before the beat: a punch then is a huge
//      POW. Six of those (or 16 punches anyway): a star. Off-beat ones are normal punches; the window grows if she's off.
//   3. Daddy's pad: he holds it up, left high, left low, right high, right low, the middle; she follows it. Then it
//      glows at kick height: her big unicorn kick sends the pad flying and Daddy into the ropes, which boing him back
//      onto his bottom. The coach holds her glove up and the gold belt goes round her waist. A star.
// Then it stays a toy: the drum keeps going, Daddy gets up with the pad, and every few hits it glows for another kick.
// Nothing fails: every punch is a fun punch, the window grows, round 2 ends anyway, a hit while Daddy hops still lands.
import { Color, IcosahedronGeometry, OctahedronGeometry, Plane, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import type { Member } from '../../../../characters/member'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { PAL, toon } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { SOCK_COLORS, wearSocks } from '../../socks'
import { Beat, PERIOD } from './beat'
import { buildGym, LAMP_DIM, LAMP_LIT, LAMPS, setPiece, starGeometry, type Built, type Rope } from './build'
import { Coach, GUARD } from './coach'
import { Floaters } from './fx'
import { BAG, BAG2, BAG_HOOK, BELL, BOARD, BOTTLE, BOWS, COACH_DRUM, COACH_WAI, DADDY_BAG, DRUM, DRUM_JOINS, KAYLEE, NEED, PAD, PAD_OUT, PAD_SIDES, PAD_STEPS, PAD_Y, POSTS, ROUND2_MAX, STEPS, TALL_SHIFT, type Round } from './layout'
import { boxingSfx as sfx } from './sounds'

export interface BoxingEvents extends LegEvents {
  /** The round on now (the address bar follows). */
  round(n: Round): void
  /** The wai kru warm-up is done (the sock band's 🥊). */
  warmedUp(): void
  /** All three rounds done (the 🛝 back to the hall shows; she can keep punching). */
  allDone(): void
}
export interface BoxingStart {
  round: Round
  socks: string
}

export const BOXING_ANCHORS: AnchorInfo[] = [
  { id: 'gloves', label: "Kaylee's gloves", kind: 'thing' },
  { id: 'bag', label: 'The punching bag', kind: 'thing' },
  { id: 'pad', label: "Daddy's pad", kind: 'thing' },
  { id: 'bag2', label: 'The small bag', kind: 'thing' },
  { id: 'drum', label: 'The drum', kind: 'thing' },
  { id: 'bell', label: 'The ring bell', kind: 'thing' },
  { id: 'ropes', label: 'The ropes', kind: 'thing' },
  { id: 'bottle', label: 'Water bottle', kind: 'thing' },
  { id: 'board', label: 'Star board', kind: 'thing' },
  { id: 'coach', label: 'The coach', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

type Phase = 'wai' | 'play' | 'between' | 'kick' | 'finale' | 'free'
type Target = 'bag' | 'pad'
interface Punch {
  t: number
  dur: number
  /** Which glove: 0 her left (the near one when she faces right), 1 her right. */
  arm: 0 | 1
  kind: 'jab' | 'hook' | 'kick'
  what: Target
  at: Vector3
  big: boolean
  hit: boolean
  /** Where she's punching toward, flat (her lunge goes that way). */
  dir: Vector3
  lunge: number
}
interface Pow {
  el: HTMLElement
  at: Vector3
  t: number
  big: boolean
}
type DaddyMode = 'bag' | 'pad' | 'fly' | 'sit' | 'up'

const tmp = new Vector3()
const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const deg = Math.PI / 180
/** Her shoulders' height (Kaylee is 1 m to the top of her head). */
const SHOULDER = 0.47
const JABS = ['POW!', 'BAM!', 'BOP!', 'POW!']
/** Free play after the belt: a kick every this many pad hits. */
const FREE_KICK = 4
/** The wai kru: she faces out, turned a little toward the coach on her left. */
const KAYLEE_WAI_YAW = -0.45

export class MuayThai extends Stage {
  private built: Built
  private kaylee: Avatar
  private nick: Member
  private coach: Coach
  private beat = new Beat()
  private phase: Phase = 'wai'
  private round: Round
  private count = 0
  private punches = 0
  private pads = 0
  private padStep = 0
  private stars: number
  private starPop = [1, 1, 1]
  private starTwinkle = -1
  private wai = { bows: 0, steps: 0 }
  private kAct: { kind: 'bow' | 'dance' | 'hop'; t: number; dur: number; k: number } | null = null
  private punch: Punch | null = null
  private nextArm: 0 | 1 = 0
  /** Which way she faces (radians), and where she stands. */
  private kYaw = 0
  private kBase = V(KAYLEE.x, 0, KAYLEE.z)
  private guardK = 0
  private bonk = 0
  private swing = { a: 0, v: 0, x: 0, vx: 0 }
  private swing2 = { a: 0, v: 0 }
  private squash = { t: 9, y: 0, k: 1 }
  private daddy: DaddyMode = 'bag'
  /** Round 3 on: the big bag is hooked back. */
  private hooked = false
  private dSpot = { x: DADDY_BAG.x, z: DADDY_BAG.z, face: DADDY_BAG.face }
  private padY = PAD_Y.high
  private padYGoal = PAD_Y.high
  private stagger = { s: 0, v: 0 }
  private dizzy = -1
  private padHit = 9
  private padPop = 1
  private padFly: { p: Vector3; v: Vector3; r: Vector3; spin: Vector3; down: boolean } | null = null
  private fly: { t: number; from: Vector3 } | null = null
  private dHop = false
  private ropeBack = { a: 0, v: 0 }
  private ropeSide = { a: 0, v: 0 }
  private skin = 9
  private bellT = 9
  private bottleT = 9
  private beltPop = -1
  private later: { t: number; f: () => void }[] = []
  private pows: Pow[] = []
  private powEls: HTMLElement[] = []
  private ringEl: HTMLElement | null = null
  private down: { what: Target; x: number; y: number; hooked: boolean } | null = null
  private downHandled = false
  private tall = false
  private allDoneSent = false
  private onBeats = 0
  private starsFx: Floaters
  private sparkles: Floaters
  private drops: Floaters
  private ray = new Raycaster()
  private bagPlane = new Plane(new Vector3(0, 0, 1), -BAG.z)

  constructor(renderer: WebGLRenderer, private bev: BoxingEvents, start: BoxingStart) {
    super(renderer, bev)
    const { scene, bag } = this
    scene.background = new Color('#EBDDFF')
    this.rig.fov = 30
    this.built = buildGym(bag)
    scene.add(this.built.root)
    // ---- Kaylee in her gloves, headband and grip socks; Daddy holding the bag; the coach ----
    const { kaylee, members } = this.makeFamily(['nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    kaylee.wear(['gloves', 'mongkhon'])
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    kaylee.rig.body.add(this.built.belt)
    this.built.belt.position.set(0, 0.31, 0)
    this.coach = new Coach(bag)
    scene.add(kaylee.root, this.nick.root, this.coach.root)
    this.put(kaylee, KAYLEE.x, 0, KAYLEE.z, 'stand', 0)
    this.starsFx = new Floaters(starGeometry(), [PAL.gold, '#FFFFFF', PAL.hotpink, PAL.gold], 80, bag, 2.2, 1.6)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 80, bag, 1.2, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 1), ['#A8DCFF', '#FFFFFF', '#8EC9F5'], 40, bag, 6, 0.4)
    scene.add(this.starsFx.mesh, this.sparkles.mesh, this.drops.mesh)
    // ---- The round the link starts at (the stars before it are already on the board) ----
    this.round = start.round
    this.stars = start.round - 1
    this.built.stars.forEach((s, i) => (s.visible = i < this.stars))
    this.startRound(start.round, true)
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

  // ---------------------------------------------------------------- rounds

  private startRound(n: Round, now = false) {
    this.round = n
    this.count = 0
    this.punches = 0
    this.bev.round(n)
    this.layoutLamps()
    if (n === 1 && now) {
      // The wai kru first: the coach faces her, gloves together.
      this.phase = 'wai'
      this.coach.place(COACH_WAI.x, COACH_WAI.z, COACH_WAI.face)
      this.coach.setMode('wai')
      this.faceWai()
      this.guardK = 0
      return
    }
    this.phase = 'play'
    if (now) {
      this.coach.place(this.coachDrum.x, this.coachDrum.z, 0)
      this.coach.setMode('drum')
      this.faceBag()
      this.guardK = 1
    }
    if (n === 2) this.beat.start(this.time, PERIOD[2], now ? 1.4 : 1.0)
    if (n === 3) {
      if (!this.beat.on) this.beat.start(this.time, PERIOD[3], 1.2)
      else this.beat.setPeriod(PERIOD[3])
      this.padUp(now)
    }
  }

  /** Ding ding, a star on the board, then the next round. */
  private finishRound() {
    this.phase = 'between'
    sfx.bell(2)
    this.bellT = 0
    this.after(0.5, () => this.giveStar())
    this.after(0.6, () => {
      this.coach.play('cheer')
      this.nick.react('wave')
    })
    this.after(2.0, () => this.startRound((this.round + 1) as Round))
  }

  private giveStar() {
    if (this.stars >= 3) return
    const i = this.stars++
    this.built.stars[i].visible = true
    this.starPop[i] = 0
    sfx.star()
    this.sparkles.burst(this.built.stars[i].getWorldPosition(new Vector3()), 16, 1.4, 1.6, 1, 0.05)
  }

  /** The board's lamps: one for each thing the round needs, lit as she gets them. */
  private layoutLamps() {
    const n = this.phase === 'free' ? 0 : NEED[this.round]
    this.built.lamps.forEach((m, i) => {
      m.visible = i < n
      m.position.x = (i - (n - 1) / 2) * 0.13
    })
    this.lightLamps()
  }
  private lightLamps() {
    this.built.lamps.forEach((m, i) => {
      const mat = toon(i < this.count ? LAMP_LIT : LAMP_DIM)
      if (m.material !== mat) m.material = mat
    })
  }
  private progress() {
    this.count++
    this.lightLamps()
    sfx.lamp(2 + this.count)
  }

  // ---------------------------------------------------------------- the wai kru

  private waiTap() {
    const w = this.wai
    this.faceWai()
    if (w.bows < BOWS) {
      const depth = 0.32 + 0.14 * w.bows
      this.kAct = { kind: 'bow', t: 0, dur: 1.0, k: depth }
      sfx.bow(w.bows * 2)
      this.after(0.3, () => this.coach.play('bow', depth))
      if (w.bows === 0) this.after(0.5, () => this.nick.react('wiggle'))
      w.bows++
      return
    }
    if (w.steps < STEPS) {
      const side = w.steps % 2 ? 1 : -1
      this.kAct = { kind: 'dance', t: 0, dur: 0.62, k: side }
      sfx.step(w.steps * 2)
      sfx.drum(w.steps === 0)
      this.skin = 0
      this.after(0.3, () => sfx.ching())
      this.after(0.22, () => this.coach.play('dance', -side))
      w.steps++
      if (w.steps === STEPS) this.warmedUp()
    }
  }

  /** The coach cheers, ding ding, and off he goes to his drum: round 1. */
  private warmedUp() {
    this.phase = 'between'
    this.after(0.7, () => {
      this.coach.play('cheer')
      sfx.cheer()
      sounds.sparkle()
      this.sparkles.burst(this.coach.root.position.clone().add(V(0, 1.1, 0)), 14, 1.2, 1.4, 0.9, 0.05)
    })
    this.after(1.4, () => {
      sfx.bell(2)
      this.bellT = 0
      this.bev.warmedUp()
      this.coach.setMode('guard')
      this.coach.goTo(this.coachDrum.x, this.coachDrum.z, 0, () => this.coach.setMode('drum'))
      this.faceBag()
    })
    this.after(1.9, () => (this.phase = 'play'))
  }

  // ---------------------------------------------------------------- facing

  private faceToward(x: number, z: number) {
    this.kYaw = Math.atan2(x - this.kBase.x, z - this.kBase.z)
    this.kaylee.face(this.kYaw)
  }
  /** The wai kru: she faces out (like a dance class), turned a little toward the coach beside her. */
  private faceWai() {
    this.kYaw = KAYLEE_WAI_YAW
    this.kaylee.face(this.kYaw)
  }
  private faceBag() {
    this.faceToward(BAG.x, BAG.z)
  }

  // ---------------------------------------------------------------- punching

  /** Where her finger is on the bag (its front plane), clamped to what she can reach. */
  private bagPoint(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const p = this.ray.ray.intersectPlane(this.bagPlane, tmp)?.clone() ?? V(BAG.x, 0.75, BAG.z)
    return V(BAG.x - BAG.r * 0.6, clamp(p.y, BAG.y0 + 0.12, 0.98), BAG.z)
  }
  private padWorld() {
    return this.built.pad.position.clone()
  }

  /** A punch at the bag or the pad (from her finger going down, a swipe's hook, or a key). */
  private strike(what: Target, sx: number, sy: number, kind: 'jab' | 'hook') {
    if (this.phase === 'finale') return
    if (what === 'pad' && (!this.built.pad.visible || this.padFly)) return
    if (what === 'pad' && this.phase === 'kick') return this.kick()
    if (what === 'bag' && this.hooked) {
      // Up on its hook: it just swings a little.
      this.swing.vx += 1.2
      sfx.thud(0.5)
      return
    }
    const at = what === 'bag' ? this.bagPoint(sx, sy) : this.padWorld()
    // Turn to face it (the pad can be on either side).
    if (what === 'pad') this.faceToward(at.x, at.z)
    else this.faceBag()
    // On the beat? (Rounds 2 and 3, and the toy after; round 1's drum is just music.)
    const judged = this.beat.on && this.round >= 2 && this.phase !== 'between'
    const big = judged ? this.beat.judge(this.time) : false
    const dir = V(at.x - this.kBase.x, 0, at.z - this.kBase.z)
    const dist = dir.length()
    dir.normalize()
    const reach = what === 'bag' ? BAG.r * 0.4 : PAD.d / 2
    const lunge = clamp(dist - reach - 0.34, 0, 0.36)
    this.punch = { t: 0, dur: kind === 'hook' ? 0.42 : 0.3, arm: this.nextArm, kind, what, at, big, hit: false, dir, lunge }
    this.nextArm = this.nextArm ? 0 : 1
    this.guardK = 1
    sfx.swish()
    // What it counts for.
    if (this.phase !== 'play' && this.phase !== 'free') return
    if (this.phase === 'free') {
      if (what === 'pad' && ++this.pads % FREE_KICK === 0) this.after(0.4, () => this.kickReady())
      return
    }
    if (this.round === 1) {
      this.progress()
      if (this.count === DRUM_JOINS && !this.beat.on) this.after(0.4, () => this.beat.start(this.time, PERIOD[1], 0.35))
      if (this.count >= NEED[1]) this.after(0.35, () => this.finishRound())
    } else if (this.round === 2) {
      this.punches++
      if (big) {
        this.onBeats++
        this.progress()
      }
      if (this.count >= NEED[2] || this.punches >= ROUND2_MAX) this.after(0.4, () => this.finishRound())
    } else if (what === 'pad') {
      this.progress()
      if (big) this.onBeats++
      if (this.count >= NEED[3]) this.after(0.45, () => this.kickReady())
      else this.after(0.38, () => this.padNext())
    }
  }

  /** The glove lands: the bag (or the pad) takes it. */
  private contact(p: Punch) {
    const power = (p.kind === 'hook' ? 1.6 : 1) * (p.big ? 1.7 : 1)
    if (p.what === 'bag') {
      const lever = clamp((BAG.pivot - p.at.y) / (BAG.pivot - BAG.y0), 0.5, 1)
      const held = this.daddy === 'bag'
      // A bag swinging back at her bonks her (she bounces back with a giggle).
      if (this.swing.v < -1.6) {
        this.bonk = 0
        sfx.boing()
        this.after(0.2, () => sfx.giggle())
      }
      this.swing.v += (held ? 1.1 : 1.6) * power * lever
      this.swing.vx += (Math.random() - 0.5) * 0.3 * power
      this.squash = { t: 0, y: p.at.y - (BAG.pivot + this.built.bag.mid), k: power }
      sfx.thud(power)
      if (held) {
        this.stagger.v += 1.4 * power
        if (power > 1.5) this.after(0.1, () => sfx.oof())
      }
    } else {
      this.padHit = 0
      this.stagger.v += 1.5 * power
      sfx.pap()
      if (power > 1.5) this.after(0.1, () => sfx.oof())
    }
    if (p.big) {
      sfx.pow()
      this.coach.look = p.at
    }
    const at = p.at.clone().add(tmp.copy(p.dir).multiplyScalar(-0.08))
    this.starsFx.burst(at, p.big ? 16 : 6, p.big ? 2.0 : 1.2, p.big ? 2.0 : 1.2, 0.6, p.big ? 0.09 : 0.06)
    this.popPow(at, p.big ? 'POW!' : p.kind === 'hook' ? 'WHAM!' : p.what === 'pad' ? 'PAP!' : JABS[this.touches % JABS.length], p.big || p.kind === 'hook')
  }

  // ---------------------------------------------------------------- Daddy's pad, the kick

  private padSpot() {
    const step = PAD_STEPS[Math.min(this.padStep, PAD_STEPS.length - 1)]
    return { ...this.side(step.side), y: PAD_Y[step.y] }
  }
  /** Where Daddy stands on that side, facing her. */
  private side(id: 'left' | 'right') {
    const s = PAD_SIDES[id]
    return { x: s.x, z: s.z, face: Math.atan2(this.kBase.x - s.x, this.kBase.z - s.z) / deg }
  }

  /** Round 3: Daddy lets go of the bag and the pad pops onto his hands, then he hops to its first place. */
  private padUp(now: boolean) {
    this.daddy = 'pad'
    this.hooked = true
    if (now) this.swing.x = BAG_HOOK
    else sfx.whoosh(0.4)
    this.padStep = 0
    this.built.pad.visible = true
    this.padPop = 0
    const s = this.padSpot()
    if (now) {
      this.dSpot = { x: s.x, z: s.z, face: s.face }
      this.put(this.nick, s.x, 0, s.z, 'stand', s.face)
      this.padY = this.padYGoal = s.y
      this.faceToward(s.x, s.z)
    } else this.daddyHop(s.x, s.z, s.face, s.y)
  }
  private padNext() {
    if (this.phase !== 'play' || this.round !== 3) return
    this.padStep++
    const s = this.padSpot()
    if (s.x === this.dSpot.x && s.z === this.dSpot.z) this.padYGoal = s.y
    else this.daddyHop(s.x, s.z, s.face, s.y)
  }
  private daddyHop(x: number, z: number, face: number, y: number) {
    this.dHop = true
    this.padYGoal = y
    this.hop(this.nick, this.scene, V(x, 0, z), {
      face,
      dur: 0.42,
      arc: 0.35,
      done: () => {
        this.dHop = false
        this.dSpot = { x, z, face }
      },
    })
  }

  /** The pad glows at kick height on her right: the big kick. */
  private kickReady() {
    this.phase = 'kick'
    const s = this.side('right')
    if (this.dSpot.x !== s.x || this.dSpot.z !== s.z) this.daddyHop(s.x, s.z, s.face, PAD_Y.mid)
    else this.padYGoal = PAD_Y.mid
    sounds.sparkle()
  }

  /** Her unicorn kick: she turns her back to Daddy and bucks with both back hooves. */
  private kick() {
    if (this.phase !== 'kick' || this.dHop) return
    this.phase = 'finale'
    const at = this.padWorld()
    // Face away from the pad (her back hooves toward it).
    this.kYaw = Math.atan2(this.kBase.x - at.x, this.kBase.z - at.z)
    this.kaylee.face(this.kYaw)
    const dir = V(this.kBase.x - at.x, 0, this.kBase.z - at.z).normalize()
    this.punch = { t: 0, dur: 1.0, arm: 0, kind: 'kick', what: 'pad', at, big: true, hit: false, dir, lunge: 0.12 }
    sfx.whoosh(0.4)
  }

  private kickLands() {
    const at = this.padWorld()
    sfx.bigKick()
    this.after(0.05, () => sfx.pow())
    this.starsFx.burst(at, 24, 2.6, 2.4, 0.8, 0.1)
    this.popPow(at, 'KA-POW!', true)
    // The pad flies off spinning, Daddy flies into the ropes.
    this.padFly = { p: at.clone(), v: V(1.4, 3.4, 0.5), r: V(0, 0, 0), spin: V(4, 2, 9), down: false }
    this.fly = { t: 0, from: this.nick.root.position.clone() }
    this.daddy = 'fly'
    this.after(0.1, () => sfx.oof())
    const first = !this.allDoneSent
    // Then the champion: ding ding ding, the coach holds her glove up, the belt goes on.
    this.after(1.5, () => {
      sfx.bell(3)
      this.bellT = 0
      this.coach.setMode('guard')
      const side = this.kBase.x - 0.62
      this.coach.goTo(side, this.kBase.z + 0.12, 90, () => this.coach.play('cheer'))
    })
    this.after(2.4, () => {
      this.faceToward(this.kBase.x, this.kBase.z + 2)
      this.kAct = { kind: 'hop', t: 0, dur: 0.6, k: 1 }
      if (first) {
        this.beltPop = 0
        this.built.belt.visible = true
        sfx.fanfare()
        sounds.sparkle()
        this.sparkles.burst(this.kaylee.root.position.clone().add(V(0, 0.5, 0.2)), 24, 1.6, 2.0, 1.2, 0.06)
        this.giveStar()
      } else sfx.cheer()
    })
    this.after(4.2, () => {
      this.phase = 'free'
      this.layoutLamps()
      this.coach.goTo(this.coachDrum.x, this.coachDrum.z, 0, () => this.coach.setMode('drum'))
      if (!this.allDoneSent) {
        this.allDoneSent = true
        this.bev.allDone()
      }
    })
    this.after(4.6, () => this.daddyUp())
  }

  /** Daddy gets up, the pad hops back into his hands, and he holds it up again. */
  private daddyUp() {
    this.daddy = 'pad'
    this.padFly = null
    this.padPop = 0
    this.nick.setPose('stand')
    this.nick.react('hop')
    const s = this.side('right')
    this.daddyHop(s.x, s.z, s.face, PAD_Y.mid)
    sfx.haha()
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...this.built.picks, this.kaylee.root, this.nick.root, this.coach.root]
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.down = null
    this.downHandled = false
    if (x === undefined || y === undefined) return
    const what = id ?? this.pick(x, y)
    if (what === 'bag' || what === 'pad') {
      // The punch starts on the finger going down (no waiting for it to lift).
      this.touches++
      this.downHandled = true
      this.down = { what, x, y, hooked: false }
      this.strike(what, x, y, 'jab')
    }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    const d = this.down
    if (!held || !d || d.hooked) return
    // A swipe across the bag: a hook (a jab, then a hook: a combo).
    if (Math.hypot(x - d.x, y - d.y) > 48 && this.phase !== 'kick' && this.phase !== 'finale') {
      d.hooked = true
      this.lastTouch = this.time
      this.after(0.13, () => this.strike(d.what, d.x, d.y, 'hook'))
    }
  }

  pointerUp() {
    this.down = null
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
      case 'bag':
      case 'pad':
        // (A key press: no finger went down. Aim at the middle.)
        return this.strike(id, x || this.w / 2, y || this.h / 2, 'jab')
      case 'gloves':
      case 'kaylee':
      case 'family:kaylee':
        if (this.phase === 'wai') return this.waiTap()
        this.kAct = { kind: 'hop', t: 0, dur: 0.5, k: 1 }
        sfx.giggle()
        return
      case 'bag2':
        // The coach shows a kick on the small bag (a spin, thwack).
        this.coach.look = V(BAG2.x, 1, BAG2.z)
        if (this.coach.busy) return void (this.swing2.v += 1.2)
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
        for (let i = 0; i < 14; i++) this.drops.emit(this.built.bottle.position.clone().add(V(0, 0.34, 0)), V(1.4 + Math.random() * 0.5, 2.2 + Math.random() * 0.8, -0.3 + Math.random() * 0.3), 0.9, 0.035 + Math.random() * 0.02)
        this.after(0.7, () => {
          this.kAct = { kind: 'hop', t: 0, dur: 0.5, k: 1 }
          sfx.giggle()
        })
        return
      case 'board':
        if (!this.stars) {
          sfx.boing()
          this.built.board.rotation.z = 0.12
          return
        }
        this.starTwinkle = 0
        return
      case 'coach':
        this.coach.play(this.coach.mode === 'drum' ? 'hop' : 'pose')
        sfx.coach()
        return
      case 'family:nick':
        if (this.daddy === 'fly') return
        this.nick.react('hop')
        sfx.haha()
        return
    }
  }

  // ---------------------------------------------------------------- the POWs

  setPowElements(els: HTMLElement[]) {
    this.powEls = els
  }
  setRingElement(el: HTMLElement | null) {
    this.ringEl = el
  }
  private popPow(at: Vector3, text: string, big: boolean) {
    const free = this.powEls.find((el) => !this.pows.some((p) => p.el === el)) ?? this.pows.shift()?.el
    if (!free) return
    free.textContent = text
    free.dataset.big = big ? '1' : ''
    this.pows.push({ el: free, at: at.clone(), t: 0, big })
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    for (const l of [...this.later]) {
      if (this.time < l.t) continue
      this.later.splice(this.later.indexOf(l), 1)
      l.f()
    }

    // ---- The drum's beat ----
    const tick = this.beat.tick(t)
    if (tick === 'beat') {
      sfx.drum(this.beat.n % 4 === 1)
      this.skin = 0
      this.coach.drumArm = this.coach.drumArm ? 0 : 1
    } else if (tick === 'off') sfx.ching()
    this.coach.drumPhase = this.beat.on ? 1 - this.beat.ring(t) : 0

    // ---- The bags: pendulums (stiffer while Daddy holds the big one), the squash where it was hit ----
    const held = this.daddy === 'bag'
    const sw = this.swing
    sw.v += (-(held ? 18 : 9) * sw.a - (held ? 3.2 : 1.3) * sw.v) * dt
    sw.a = clamp(sw.a + sw.v * dt, -0.6, 0.6)
    // (Round 3: Daddy has swung it back onto its hook, out of the pad's way.)
    const hook = this.hooked ? BAG_HOOK : 0
    sw.vx += (-12 * (sw.x - hook) - (this.hooked ? 4 : 2) * sw.vx) * dt
    sw.x += sw.vx * dt
    this.built.bag.pivot.rotation.set(sw.x, 0, this.hooked ? sw.a * 0.3 : sw.a)
    this.squash.t += dt
    const sq = Math.exp(-this.squash.t * 7) * Math.cos(this.squash.t * 26) * 0.12 * Math.min(1.6, this.squash.k)
    this.built.bag.body.scale.set(1 - sq, 1 + sq * 0.4, 1 + sq * 0.6)
    const s2 = this.swing2
    s2.v += (-9 * s2.a - 1.4 * s2.v) * dt
    s2.a += s2.v * dt
    this.built.bag2.pivot.rotation.z = -s2.a
    // A big swing into Daddy's face: dizzy stars round his head.
    if (held && sw.a > 0.24 && this.dizzy < 0) {
      this.dizzy = 0
      this.nick.react('wiggle')
      sfx.boing()
    }

    // ---- The ropes (a bow in the middle of each), the drum's skin, the bell, the bottle, the board ----
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
    this.skin += dt
    const sk = Math.exp(-this.skin * 10) * 0.35
    this.built.skin.scale.set(1 + sk * 0.2, 1 - sk, 1 + sk * 0.2)
    this.built.drum.scale.set(1 + sk * 0.04, 1 - sk * 0.05, 1 + sk * 0.04)
    this.bellT += dt
    this.built.bell.rotation.z = Math.sin(this.bellT * 40) * 0.12 * Math.exp(-this.bellT * 3)
    this.bottleT += dt
    this.built.bottle.rotation.z = Math.sin(this.bottleT * 18) * 0.2 * Math.exp(-this.bottleT * 4)
    this.built.bottle.scale.y = 1 - 0.15 * bell(clamp(this.bottleT / 0.3))
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

    // ---- The people ----
    const k = this.kaylee
    // (In the wai kru she and the coach glance at each other but keep their faces to us.)
    const lookAt = this.punch ? this.punch.at : this.phase === 'wai' ? this.coach.root.position.clone().add(V(0, 0.85, 1.6)) : this.daddy === 'pad' ? this.padWorld() : V(BAG.x, 0.8, BAG.z)
    k.lookAt(lookAt.x, lookAt.y, lookAt.z)
    k.update(dt, t)
    this.kayleeFrame(dt, t)
    this.nick.lookAt(k.position.x, 0.75, k.position.z)
    this.nick.update(dt, t)
    this.daddyFrame(dt, t)
    if (!this.coach.look || this.time - this.lastTouch > 1.5) this.coach.look = k.position.clone().add(V(0, 0.7, this.phase === 'wai' ? 1.6 : 0))
    this.coach.update(dt, t)

    // ---- The pad flying, the belt popping on ----
    const pf = this.padFly
    if (pf) {
      if (!pf.down) {
        pf.v.y -= 9 * dt
        pf.p.addScaledVector(pf.v, dt)
        pf.r.addScaledVector(pf.spin, dt)
        if (pf.p.y < PAD.d / 2 && pf.v.y < 0) {
          pf.p.y = PAD.d / 2
          if (pf.v.y < -1.2) {
            pf.v.y *= -0.35
            pf.v.x *= 0.5
            sfx.thump()
          } else {
            pf.down = true
            pf.r.set(-Math.PI / 2, pf.r.y, 0)
          }
        }
        pf.p.x = Math.min(pf.p.x, POSTS[1][0] - 0.3)
      }
      this.built.pad.position.copy(pf.p)
      this.built.pad.rotation.set(pf.r.x, pf.r.y, pf.r.z)
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
    for (const p of [...this.pows]) {
      p.t += dt
      if (p.t > 0.75) this.pows.splice(this.pows.indexOf(p), 1)
    }
  }

  /** Kaylee, driven by hand: her guard and bounce, the punches (aimed at her finger), the wai kru's bows and steps,
   *  the big kick, a hop. (After Avatar.update, which does her blinks and her turning.) */
  private kayleeFrame(dt: number, t: number) {
    const k = this.kaylee
    const r = k.rig
    const fight = this.phase !== 'wai'
    this.guardK += ((fight ? 1 : 0) - this.guardK) * (1 - Math.exp(-dt * 6))
    // At rest: gloves down by her sides in the wai kru, the guard up (and a bounce on her toes) to fight.
    let aL = [-0.25 * (1 - this.guardK) + GUARD[0] * this.guardK, 0.15 * (1 - this.guardK) + GUARD[1] * this.guardK]
    let aR = [-0.25 * (1 - this.guardK) + GUARD[2] * this.guardK, -0.15 * (1 - this.guardK) + GUARD[3] * this.guardK]
    let y = fight ? Math.abs(Math.sin(t * 6.2)) * 0.022 : 0
    let lean = 0
    let twist = 0
    let tilt = 0
    let headPitch = 0
    const off = new Vector3()
    const bodyOff = new Vector3()
    // ---- The wai kru's bows and steps, a hop ----
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
        off.set(a.k * 0.15 * e, 0, 0).applyAxisAngle(V(0, 1, 0), this.kYaw)
        tilt = -a.k * 0.22 * e
      } else {
        y += 0.2 * bell(span(p, 0.1, 0.9))
      }
      if (p >= 1) this.kAct = null
    }
    // ---- A punch (or the kick) ----
    const pu = this.punch
    if (pu) {
      pu.t += dt / pu.dur
      const p = Math.min(1, pu.t)
      if (pu.kind === 'kick') {
        // Turn (the yaw spring), crouch, then buck: the body tips forward round her chest, so her back hooves fly up
        // behind her into the pad; then down again with a settle.
        const crouch = bell(span(p, 0.25, 0.48))
        const buck = span(p, 0.42, 0.6) * (1 - span(p, 0.7, 0.95))
        const th = 1.25 * buck
        y -= 0.06 * crouch
        lean += th
        bodyOff.set(0, 0.5 - 0.5 * Math.cos(th), -0.5 * Math.sin(th))
        y += 0.12 * buck
        aL = [-2.0 * buck + aL[0] * (1 - buck), aL[1]]
        aR = [-2.0 * buck + aR[0] * (1 - buck), aR[1]]
        off.copy(pu.dir).multiplyScalar(-pu.lunge * buck)
        if (!pu.hit && p >= 0.55) {
          pu.hit = true
          this.kickLands()
        }
      } else {
        // Wind up, out to the target (her arm aimed at the height her finger hit), back to the guard.
        const ext = span(p, 0.18, 0.42) * (1 - span(p, 0.55, 1))
        const wind = bell(span(p, 0, 0.25))
        const dist = Math.max(0.25, Math.hypot(pu.at.x - this.kBase.x, pu.at.z - this.kBase.z) - pu.lunge - 0.08)
        const e = Math.atan2(pu.at.y - SHOULDER - y, dist)
        const aim = -(Math.PI / 2 + e)
        const hook = pu.kind === 'hook'
        const near = pu.arm === 0
        const zOut = hook ? (near ? -0.7 : 0.7) * (1 - ext) : 0
        const zIn = near ? 0.18 : -0.18
        const arm = [GUARD[0] + 0.5 * wind + (aim - GUARD[0]) * ext, (near ? GUARD[1] : GUARD[3]) * (1 - ext) + (zIn + zOut) * ext]
        if (near) aL = arm
        else aR = arm
        off.copy(pu.dir).multiplyScalar(pu.lunge * ext)
        lean += 0.22 * ext
        twist = (near ? 1 : -1) * (hook ? 0.55 : 0.3) * (ext - 0.4 * wind)
        if (!pu.hit && p >= 0.42) {
          pu.hit = true
          this.contact(pu)
        }
      }
      if (p >= 1) this.punch = null
    }
    // A bonk from the bag swinging back: a little bounce back.
    if (this.bonk >= 0) {
      this.bonk += dt / 0.45
      const b = bell(Math.min(1, this.bonk))
      off.addScaledVector(V(Math.sin(this.kYaw), 0, Math.cos(this.kYaw)), -0.14 * b)
      lean -= 0.25 * b
      if (this.bonk >= 1) this.bonk = -1
    }
    // ---- Write it ----
    k.position.set(this.kBase.x + off.x, y, this.kBase.z + off.z)
    r.body.position.set(bodyOff.x, bodyOff.y, bodyOff.z)
    r.body.rotation.set(lean, twist, tilt)
    r.head.rotation.x = headPitch
    r.armL.rotation.set(aL[0], 0, aL[1])
    r.armR.rotation.set(aR[0], 0, aR[1])
  }

  /** Daddy: holding the bag from behind (staggering when it swings into him), then holding the pad up where it should
   *  be, flying into the ropes, sitting on the mat laughing. (After Member.update: his blinks, breath and hops.) */
  private daddyFrame(dt: number, t: number) {
    const n = this.nick
    const r = n.rig
    const st = this.stagger
    st.v += (-60 * st.s - 9 * st.v) * dt
    st.s = clamp(st.s + st.v * dt, -0.2, 0.5)
    if (this.dizzy >= 0) {
      this.dizzy += dt
      if (Math.floor(this.dizzy * 8) !== Math.floor((this.dizzy - dt) * 8)) this.starsFx.emit(r.head.localToWorld(V(Math.cos(this.dizzy * 9) * 0.3, r.face.headY + r.face.R * 1.3, Math.sin(this.dizzy * 9) * 0.3)), V(0, 0.3, 0), 0.5, 0.05, 0)
      if (this.dizzy > 1.4) this.dizzy = -1
    }
    if (this.daddy === 'fly') return this.flyFrame(dt)
    if (this.daddy === 'sit') return
    const fwd = V(Math.sin(this.dSpot.face * deg), 0, Math.cos(this.dSpot.face * deg))
    if (this.daddy === 'bag') {
      // Hands on the bag, leaning in; a punch pushes him back a step and he leans in again.
      n.root.position.set(DADDY_BAG.x - fwd.x * st.s * 0.35, n.root.position.y, DADDY_BAG.z - fwd.z * st.s * 0.35)
      n.root.rotation.y = DADDY_BAG.face * deg
      r.body.rotation.x = 0.12 - st.s * 0.7
      const sway = this.swing.a * 0.6
      r.armL.rotation.set(-1.25 + sway, 0, 0.32)
      r.armR.rotation.set(-1.25 + sway, 0, -0.32)
      return
    }
    // The pad, held out in front at its height (it eases between heights), pushed back by each hit.
    this.padY += (this.padYGoal - this.padY) * (1 - Math.exp(-dt * 8))
    const root = n.root.position
    if (!this.dHop) {
      root.x = this.dSpot.x - fwd.x * st.s * 0.3
      root.z = this.dSpot.z - fwd.z * st.s * 0.3
    }
    const yaw = n.root.rotation.y
    const f = V(Math.sin(yaw), 0, Math.cos(yaw))
    const out = PAD_OUT - st.s * 0.12
    const pad = this.built.pad
    if (!this.padFly) {
      pad.position.set(root.x + f.x * out, this.padY + (root.y > 0.01 ? root.y * 0.6 : 0), root.z + f.z * out)
      pad.rotation.set(0, yaw, 0)
      this.padHit += dt
      this.padPop = Math.min(1, this.padPop + dt / 0.45)
      const hk = Math.exp(-this.padHit * 9) * Math.cos(this.padHit * 30) * 0.12
      const pop = this.padPop < 1 ? span(this.padPop, 0, 0.5) * (1 + wobble(this.padPop, 2) * 0.3) : 1
      pad.scale.set(pop * (1 + hk), pop * (1 + hk * 0.5), pop * (1 - hk * 1.5))
      // The kick: the pad glows by pulsing.
      if (this.phase === 'kick') pad.scale.multiplyScalar(1 + 0.08 * Math.sin(t * 9))
    }
    const shoulder = 0.47 * n.height
    const e = Math.atan2(this.padY - shoulder, out)
    const aim = -(Math.PI / 2 + e)
    r.armL.rotation.set(aim, 0, 0.42)
    r.armR.rotation.set(aim, 0, -0.42)
    r.body.rotation.x = 0.05 - st.s * 0.8
  }

  /** Into the ropes: up and back, the ropes stretch and boing him back, and he plops onto his bottom. */
  private flyFrame(dt: number) {
    const f = this.fly
    if (!f) return
    const n = this.nick
    f.t += dt
    const rope = POSTS[1][0] - 0.28
    let x: number
    let y: number
    let z: number
    if (f.t < 0.42) {
      const k = f.t / 0.42
      x = f.from.x + (rope - f.from.x) * k
      z = f.from.z + (0.1 - f.from.z) * k
      y = bell(k) * 0.45
      n.rig.body.rotation.x = -0.9 * k
      n.rig.armL.rotation.set(-0.3, 0, -2.2)
      n.rig.armR.rotation.set(-0.3, 0, 2.2)
    } else {
      if (f.t - dt < 0.42) {
        this.ropeSide.v += 5
        sfx.twang()
        this.after(0.05, () => sfx.boing())
      }
      const k = clamp((f.t - 0.42) / 0.5)
      x = rope - 0.55 * k
      z = 0.1 + 0.3 * k
      y = bell(k) * 0.3
      n.rig.body.rotation.x = -0.9 * (1 - k)
    }
    n.place(x, y, z, -100, 'stand')
    if (f.t >= 0.92) {
      this.fly = null
      this.daddy = 'sit'
      n.place(x, 0, z, -60, 'sit')
      n.rig.body.rotation.x = 0
      n.rig.armL.rotation.set(0, 0, 0)
      n.rig.armR.rotation.set(0, 0, 0)
      sfx.thump()
      this.after(0.3, () => {
        sfx.haha()
        n.react('wiggle')
      })
    }
  }

  // ---------------------------------------------------------------- camera, anchors, the POWs and the ring

  protected shot(): Shot {
    // (A tall screen comes in closer: the left side moves in, TALL_SHIFT, and the bell sits on the inside of its post.)
    if (this.w < this.h) return { center: V(0.08, 1.0, 0.25), half: V(1.85, 1.15, 0.9), yaw: 0, pitch: 12, minDist: 5 }
    return { center: V(-0.12, 1.02, 0.15), half: V(2.2, 1.12, 1.0), yaw: 0, pitch: 9, minDist: 5 }
  }

  private glovesAt() {
    return this.kaylee.root.position.clone().add(V(Math.sin(this.kYaw) * 0.16, 0.4, Math.cos(this.kYaw) * 0.16))
  }
  private bagMid() {
    return this.built.bag.body.getWorldPosition(new Vector3())
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const k = this.kaylee
    const idle = this.time - this.lastTouch > 3
    switch (id) {
      case 'gloves':
        return this.phase === 'wai' ? { at: this.glovesAt(), r: 0.16, glow: true, max: 130, prio: 3 } : null
      case 'bag':
        return this.hooked ? null : { at: this.bagMid(), r: BAG.r * 1.3, glow: this.phase === 'play' && this.round < 3 && idle, max: 220, prio: 2 }
      case 'pad': {
        if (!this.built.pad.visible || this.padFly || this.daddy === 'fly') return null
        return { at: this.padWorld(), r: PAD.w * 0.6, glow: this.phase === 'kick' || (this.phase === 'play' && idle), max: 190, prio: 3 }
      }
      case 'bag2':
        return { at: this.built.bag2.body.getWorldPosition(new Vector3()), r: BAG2.r * 1.2, max: 120, prio: 2 }
      case 'drum':
        return { at: this.drumAt.setY(DRUM.h * 0.8), r: DRUM.r, max: 130, prio: 2 }
      case 'bell':
        return { at: V(BELL.x, BELL.y, BELL.z), r: 0.18, max: 110, prio: 3 }
      case 'ropes':
        return { at: V(POSTS[1][0], 0.8, 0.0), r: 0.3, max: 110, prio: 1 }
      case 'bottle':
        return { at: this.built.bottle.position.clone().add(V(0, 0.15, 0)), r: 0.14, max: 100, prio: 3 }
      case 'board':
        return { at: V(BOARD.x, BOARD.y, BOARD.z + 0.1), r: BOARD.w * 0.4, max: 150, prio: 1 }
      case 'coach':
        return { at: this.coach.root.position.clone().setY(0.6), r: 0.3, max: 130, prio: 0 }
      case 'family:kaylee':
        return this.phase === 'wai' ? null : { at: k.position.clone().setY(0.62), r: 0.28, max: 110, prio: 0 }
      case 'family:nick':
        return { at: this.nick.root.position.clone().setY(this.nick.root.position.y + (this.daddy === 'sit' ? 0.6 : 1.2)), r: 0.3, max: 120, prio: 0 }
    }
    return null
  }

  /** After a while with nothing touched: her gloves (the wai kru), the bag, or Daddy's pad. */
  protected hintAt() {
    if (this.phase === 'wai') return this.glovesAt()
    if (this.phase === 'kick' || (this.round === 3 && this.phase === 'play')) return this.built.pad.visible && !this.dHop ? this.padWorld() : null
    if (this.phase === 'play') return this.bagMid()
    return null
  }

  placeAnchors() {
    super.placeAnchors()
    // The POWs: popping up from the hit, then floating off and fading.
    for (const el of this.powEls) {
      const p = this.pows.find((x) => x.el === el)
      const s = p ? this.toScreen(p.at, 0.1) : null
      if (!p || !s) {
        if (el.style.display !== 'none') el.style.display = 'none'
        continue
      }
      const k = p.t / 0.75
      const scale = (p.big ? 1.5 : 1) * (0.4 + 0.9 * span(k, 0, 0.18) - 0.1 * span(k, 0.18, 0.4))
      el.style.display = ''
      el.style.opacity = String(1 - span(k, 0.6, 1))
      el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${(s.y - 30 - 50 * k).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${p.big ? -8 : 6}deg) scale(${scale.toFixed(3)})`
    }
    // The ring closing on the bag (round 2) or the pad (round 3): gold when a punch would be on the beat.
    const el = this.ringEl
    if (!el) return
    const target = this.round === 2 && this.phase === 'play' ? this.bagMid() : this.round === 3 && this.phase === 'play' && this.built.pad.visible && !this.dHop ? this.padWorld() : null
    const s = target && this.beat.on ? this.toScreen(target, this.round === 2 ? BAG.r * 1.4 : PAD.w * 0.7, 230) : null
    if (!s) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const k = this.beat.ring(this.time)
    const now = this.beat.inWindow(this.time)
    el.style.display = ''
    el.style.width = el.style.height = `${s.size.toFixed(0)}px`
    el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(1 + 1.5 * k).toFixed(3)})`
    el.style.borderColor = now ? '#FFC83D' : 'rgba(255,255,255,.9)'
    el.style.boxShadow = now ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : 'none'
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
      count: this.count,
      need: NEED[this.round],
      punches: this.punches,
      onBeats: this.onBeats,
      bows: this.wai.bows,
      steps: this.wai.steps,
      padStep: this.padStep,
      beat: this.beat.on,
      window: this.beat.inWindow(this.time),
      toNext: Math.round(this.beat.toNext(this.time) * 1000) / 1000,
      grown: this.beat.grown,
      stars: this.stars,
      belt: this.built.belt.visible,
      daddy: this.daddy,
      hopping: this.dHop,
      swing: Math.round(this.swing.a * 100) / 100,
      touches: this.touches,
      bag: px(this.bagMid()),
      pad: this.built.pad.visible && !this.padFly ? px(this.padWorld()) : null,
      gloves: px(this.glovesAt()),
      lamps: LAMPS,
    }
  }
}
