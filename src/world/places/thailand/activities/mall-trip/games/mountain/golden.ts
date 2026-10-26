// The Golden Mountain at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "5. The Golden Mountain"),
// greybox shapes with voices (lines.ts `L.mall.mountain`: Sparkle's opening and count, Daddy's race lines, the Golden
// Mount fact, said through blocks/talk.ts). A big yellow cone with climbing holds and Thai pattern bands, a red rail
// and a bell on top, a shiny steel slide down the front, kids riding elephants painted on the wall, and three Lopburi
// monkeys.
//
// The toy: grab the next hold and pull herself up to it. Every hold she can reach from where she hangs (the next row,
// not too far sideways) glows. Her finger goes down on one and her hand reaches for it at once; pulling the finger down
// pulls her up with it (a tap does the whole pull). She rises, lands with a squash, and the hold's number pops up over
// it with a note one step up the scale. Over the top she hops onto the platform; the bell's rope and the slide's mouth
// are hers to tap, and the steel slide (the Big Frame's, harborland/rides.ts) shoots her out onto the mat.
//   1. Holds in a line: five straight up.
//   2. Only the pink ones: the pinks in reach glow; a yellow hold honks, a blue one giggles, a mint one hides a monkey
//      who leaps out and blows a raspberry. She stays put; nothing is wrong.
//   3. Race Daddy up the other side: he climbs when she does, puffing, always a hold behind; he flops over the rail as
//      she gets there, then follows her down the slide and lands head first on the mat, legs kicking.
// A flag on the rail for each round. After the third she can race him again as often as she likes.
import { Color, Group, IcosahedronGeometry, OctahedronGeometry, Vector3, type Mesh, type MeshBasicMaterial, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../../sdk'
import type { Avatar } from '../../../../characters/avatar'
import { LOOKS } from '../../../../characters/looks'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { PAL } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { wearHair } from '../barber/mane'
import { Floaters } from '../blocks/fx'
import { Racer } from '../race/racer'
import { Rides } from '../../harborland/rides'
import { SOCK_COLORS, wearSocks } from '../../socks'
import { buildGolden, haloMesh, holdShape, type Built } from './build'
import { Monkey, type MonkeyTrick } from './monkey'
import { BELL, CONE, DADDY_FOOT_A, DADDY_WATCH, daddyHolds, ELEPHANTS, FOOT_A, FOOT_Y, holdsFor, inReach, LAND, MAT, MONKEYS, onCone, PULL_PX, rAt, ROPE_AT, rowsIn, SLIDE_A, WALL_Z, type Hold, type Round } from './layout'
import { mountainSfx as sfx } from './sounds'
import { Talk } from '../blocks/talk'
import { L } from '../../../../lines'

const T = L.mall.mountain

export interface MountainEvents extends LegEvents {
  /** The round on now (the address bar follows). */
  round(n: Round): void
  /** She's on top (the sock band's ⛰️ comes the first time). */
  top(): void
  /** All three rounds done (the 🛝 back to the hall shows; she can race Daddy again). */
  allDone(): void
}
export interface MountainStart {
  round: Round
  socks: string
  /** Daddy's hairdo from the barber ('' his own mane). */
  hair: string
}

/** The most holds on her side in any round (round 2's 22): a tap target each. */
const MAX_HOLDS = 22
export const MOUNTAIN_ANCHORS: AnchorInfo[] = [
  ...Array.from({ length: MAX_HOLDS }, (_, i): AnchorInfo => ({ id: `hold:${i}`, label: 'A climbing hold', kind: 'thing' })),
  { id: 'bell', label: 'The bell', kind: 'thing' },
  { id: 'slide', label: 'The steel slide', kind: 'thing' },
  { id: 'chute', label: 'The shiny slide', kind: 'thing' },
  { id: 'band', label: 'The golden patterns', kind: 'thing' },
  ...[0, 1, 2].map((i): AnchorInfo => ({ id: `monkey:${i}`, label: 'A monkey', kind: 'thing' })),
  ...[0, 1].map((i): AnchorInfo => ({ id: `ele:${i}`, label: 'A painted elephant', kind: 'thing' })),
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

type KState = 'floor' | 'pull' | 'hang' | 'over' | 'top' | 'walk' | 'ring' | 'slide' | 'out' | 'home'
type DState = 'watch' | 'walk' | 'foot' | 'pull' | 'hang' | 'over' | 'top' | 'toMouth' | 'slide' | 'flop' | 'back'
interface Pull {
  from: { a: number; y: number }
  to: Hold
  t: number
  /** Her finger: how far through the pull it holds her (null: it plays on by itself). */
  drive: number | null
  hand: number
}

const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const deg = 180 / Math.PI
/** Pull timeline: her hand reaches (to REACH_T), she rises (to RISE_T), then settles. */
const REACH_T = 0.28
const RISE_T = 0.85
const PULL_S = 0.5
const DADDY_PULL_S = 0.72
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)

export class Golden extends Stage {
  private built: Built
  private kaylee: Avatar
  private daddy: Racer
  private rides: Rides
  private monkeys: Monkey[]
  private round: Round
  private holds: Hold[] = []
  private holdG = new Map<Round, Group[]>()
  private dHolds = daddyHolds()
  private dHoldG: Group[] = []
  private holdFx = new Map<Group, { t: number; kind: 'pop' | 'grab' | 'honk' | 'giggle' | 'wiggle' }>()
  private halos: Mesh[] = []
  private haloBoost = 0
  // ---- Kaylee ----
  private k: { state: KState; a: number; y: number; row: number; t: number } = { state: 'floor', a: 0, y: FOOT_Y, row: -1, t: 0 }
  private pull: Pull | null = null
  private queued: Hold | null = null
  private grab: { id: string; y0: number; moved: boolean } | null = null
  private handled: string | null = null
  private hand = 0
  private count = 0
  private rung = false
  private swing = { a: 0, v: 0 }
  private over: { from: Vector3; to: Vector3; t: number } | null = null
  private cheerT = -1
  // ---- Daddy ----
  private d: { state: DState; a: number; y: number; row: number; t: number; u: number; v: number } = { state: 'watch', a: DADDY_WATCH.a, y: 0, row: -1, t: 0, u: 0, v: 0 }
  private dPull: { from: { a: number; y: number }; to: Hold; t: number; dur: number } | null = null
  private dFrom = new Vector3()
  private dTo = new Vector3()
  private puffAt = 0
  // ---- The rest ----
  private flagsUp = 0
  private flagPop = [1, 1, 1]
  private bellSw = { a: 0, v: 0 }
  private ropeT = 1
  private ringT = -1
  private shineT = 1
  private bandT = [9, 9, 9]
  private trunkT = [9, 9]
  private matT = 1
  private countEl: HTMLElement | null = null
  private countAt: Vector3 | null = null
  private countT = 9
  private later: { t: number; f: () => void }[] = []
  private tall = false
  private allDoneSent = false
  private tops = 0
  private nextLife = 6
  private sparkles: Floaters
  private puffs: Floaters
  private drops: Floaters
  private talk = new Talk((l) => this.mev.say(l))
  private races = 0
  private huffed = false

  constructor(renderer: WebGLRenderer, private mev: MountainEvents, start: MountainStart) {
    super(renderer, mev)
    const { scene, bag } = this
    scene.background = new Color('#EBDDFF')
    this.rig.fov = 30
    this.built = buildGolden(bag)
    scene.add(this.built.root)
    // ---- Kaylee in her grip socks, Daddy (with the hairdo she gave him at the barber's), the monkeys ----
    const { kaylee } = this.makeFamily([])
    this.kaylee = kaylee
    // Climbing all the way (the camera looks at her back): her wings stay folded flat so her hooves show.
    kaylee.tuck = true
    wearSocks(kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    this.daddy = new Racer('nick', bag)
    wearHair(this.daddy.rig, LOOKS.nick, start.hair, bag)
    this.daddy.root.userData.pick = 'family:nick'
    scene.add(kaylee.root, this.daddy.root)
    // The slide is the Big Frame's (it needs no ring or zip handle here).
    this.rides = new Rides(kaylee, { ring: new Group(), handle: new Group() }, { splash: () => {} })
    this.monkeys = MONKEYS.map((m, i) => {
      const mk = new Monkey(bag, `monkey:${i}`)
      mk.place(m.at, m.face)
      scene.add(mk.root)
      return mk
    })
    // ---- Every round's holds (only the round on now shows), Daddy's, the halos round the ones she can reach ----
    for (const r of [1, 2, 3] as Round[]) {
      this.holdG.set(
        r,
        holdsFor(r).map((h) => {
          const g = this.makeHold(h)
          g.userData.pick = `hold:${h.i}`
          return g
        }),
      )
    }
    this.dHoldG = this.dHolds.map((h) => {
      const g = this.makeHold(h)
      g.userData.pick = 'dhold'
      return g
    })
    for (let i = 0; i < 4; i++) {
      const m = haloMesh(bag)
      m.visible = false
      this.halos.push(m)
      scene.add(m)
    }
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 90, bag, 1.2, 1.2)
    this.puffs = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#F4EEFF', '#FFF1DC'], 60, bag, -0.5, 2.4)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#8EC9F5', '#BFE3FF', '#FFFFFF'], 40, bag, 5, 0.4)
    scene.add(this.sparkles.mesh, this.puffs.mesh, this.drops.mesh)
    // ---- The round the link starts at (the flags before it are already on the rail) ----
    this.round = start.round
    this.flagsUp = start.round - 1
    this.built.flags.forEach((f, i) => (f.visible = i < this.flagsUp))
    this.setRound(start.round, true)
    // What's said first: Sparkle's "Climb the Golden Mountain!" (a link to a later round: that round's line).
    this.after(0.5, () => (start.round > 1 ? this.roundLine(start.round) : this.talk.say(T.climb)))
  }

  /** When a round's new thing shows: the pink holds, Daddy at the foot of his side ready to race. */
  private roundLine(n: Round) {
    if (n === 2) this.talk.say(T.pink)
    if (n !== 3) return
    // The first race: Sparkle says what's on, then Daddy; after that, just Daddy.
    if (this.races++) return this.talk.say(T.win)
    this.talk.say(T.race)
    this.after(2.0, () => this.talk.say(T.win))
  }

  private makeHold(h: Hold) {
    const g = holdShape(h.color, this.bag)
    const slope = Math.atan((CONE.r0 - CONE.rt) / CONE.top)
    g.position.set(...onCone(h.a, h.y, 0.03))
    g.rotation.set(0, 0, 0)
    g.rotateY(h.a)
    g.rotateX(-slope)
    g.visible = false
    this.scene.add(g)
    return g
  }

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  // ---------------------------------------------------------------- rounds

  private setRound(n: Round, now = false) {
    this.round = n
    this.holds = holdsFor(n)
    for (const [r, gs] of this.holdG)
      gs.forEach((g, i) => {
        g.visible = r === n
        if (r === n && !now) this.holdFx.set(g, { t: -i * 0.05, kind: 'pop' })
      })
    this.dHoldG.forEach((g, i) => {
      g.visible = n === 3
      if (n === 3 && !now) this.holdFx.set(g, { t: -i * 0.05, kind: 'pop' })
    })
    this.count = 0
    this.rung = false
    this.queued = null
    this.huffed = false
    this.mev.round(n)
    if (!now) this.after(0.6, () => this.roundLine(n))
    if (now) {
      this.k = { state: 'floor', a: FOOT_A[n], y: FOOT_Y, row: -1, t: 0 }
      this.placeOnWall(FOOT_A[n], FOOT_Y)
    }
    // Daddy: watching from the floor, or (round 3) at the foot of his side, ready to race.
    const d = this.daddy
    if (n === 3) {
      const foot = V(...onCone(DADDY_FOOT_A, 0, 0.42))
      if (now) {
        d.place(foot.x, 0, foot.z, DADDY_FOOT_A + Math.PI)
        this.d = { ...this.d, state: 'foot', a: DADDY_FOOT_A, y: 0, row: -1 }
      } else if (this.d.state === 'watch') {
        this.d.state = 'walk'
        d.stop()
        d.walkTo(foot, 2.2, () => {
          d.face(DADDY_FOOT_A + Math.PI)
          this.d = { ...this.d, state: 'foot', a: DADDY_FOOT_A, y: 0, row: -1 }
        })
      }
    } else {
      const w = V(...onCone(DADDY_WATCH.a, 0, DADDY_WATCH.out))
      if (now || this.d.state === 'watch') d.place(w.x, 0, w.z, -0.7)
      this.d.state = 'watch'
    }
  }

  /** What she may grab now (round 2: only the pink ones), from where her hands are (or are going). */
  private base() {
    const p = this.pull
    return p ? { a: p.to.a, row: p.to.row } : { a: this.k.a, row: this.k.row }
  }
  private canClimb() {
    const s = this.k.state
    return s === 'floor' || s === 'hang' || s === 'pull'
  }
  private allowed(h: Hold) {
    return this.round !== 2 || h.color === 'pink'
  }
  /** The holds in reach now, and which of those she may take. */
  private reachable(): Hold[] {
    if (!this.canClimb()) return []
    const b = this.base()
    return this.holds.filter((h) => inReach(h, b.a, b.row))
  }

  // ---------------------------------------------------------------- the climb

  /** Where she is on the wall with her hands at (a, yHand): her feet below, a little off the cone. */
  private wallPos(a: number, yHand: number) {
    const yr = Math.max(0, yHand - 0.78)
    return V(...onCone(a, yr, yr <= 0 ? 0.32 : 0.2))
  }
  private placeOnWall(a: number, yHand: number) {
    const p = this.wallPos(a, yHand)
    this.kaylee.place(p.x, p.y, p.z, (a + Math.PI) * deg)
  }

  /** Start a pull to `h` (`drive`: her finger holds it at the reach until it lets go). */
  private startPull(h: Hold, drive: number | null) {
    const k = this.k
    if (k.state === 'pull') {
      this.queued = h
      return
    }
    this.pull = { from: { a: k.a, y: k.y }, to: h, t: 0, drive, hand: this.hand++ % 2 }
    k.state = 'pull'
    sfx.fwip()
    const g = this.holdG.get(this.round)![h.i]
    this.holdFx.set(g, { t: 0, kind: 'grab' })
  }

  private pullFrame(dt: number) {
    const p = this.pull
    if (!p) return
    const before = p.t
    // Her hand reaches by itself; then her finger pulls her up (or, let go or tapped, she goes on by herself).
    if (p.t < REACH_T || p.drive === null) p.t = Math.min(p.drive === null ? 1 : REACH_T, p.t + dt / PULL_S)
    else p.t += (Math.max(REACH_T, p.drive) - p.t) * (1 - Math.exp(-dt * 14))
    p.t = Math.min(1, p.t)
    if (before < REACH_T && p.t >= REACH_T) sfx.grab()
    if (before < REACH_T + 0.04 && p.t >= REACH_T + 0.04) {
      sfx.hup()
      sfx.scrabble()
    }
    // Where she is: a little crouch (anticipation) while her hand reaches, then up.
    const rise = ease(span(p.t, REACH_T, RISE_T))
    const a = p.from.a + (p.to.a - p.from.a) * rise
    const y = p.from.y + (p.to.y - p.from.y) * rise - 0.05 * bell(span(p.t, 0, REACH_T))
    this.placeOnWall(a, y)
    if (p.t >= 1) this.arrive(p.to)
  }

  private arrive(h: Hold) {
    const k = this.k
    this.pull = null
    k.state = 'hang'
    k.a = h.a
    k.y = h.y
    k.row = h.row
    k.t = 0
    this.count++
    sounds.note(this.count - 1)
    // Sparkle counts the holds (not over anyone talking).
    this.talk.count(T.count[this.count - 1])
    this.swing.v += (this.hand % 2 ? 1 : -1) * 1.6
    this.kaylee.react('wiggle')
    const at = V(...onCone(h.a, h.y, 0.1))
    this.puffs.burst(at.clone().setY(h.y - 0.75), 4, 0.6, 0.2, 0.4, 0.06)
    this.sparkles.burst(at, 6, 0.8, 0.9, 0.6, 0.04)
    this.showCount(this.count, at.clone().add(V(0, 0.32, 0.25)))
    // Round 3: Daddy comes up behind her.
    if (this.round === 3) this.daddyFollow()
    if (h.row === rowsIn(this.round) - 1) {
      this.queued = null
      this.after(0.18, () => this.goOver())
      return
    }
    const q = this.queued
    this.queued = null
    if (q && inReach(q, k.a, k.row) && this.allowed(q)) this.after(0.05, () => this.k.state === 'hang' && this.startPull(q, null))
  }

  /** Over the top: a hop onto the platform, turn round, cheer. */
  private goOver() {
    const k = this.k
    if (k.state !== 'hang') return
    k.state = 'over'
    const a = clamp(k.a, -0.9, 0.05)
    this.over = { from: this.kaylee.position.clone(), to: V(...onCone(a, CONE.top, -0.42)), t: 0 }
    sfx.boing()
  }

  private onTop() {
    const k = this.k
    k.state = 'top'
    this.tops++
    this.kaylee.face(-0.2)
    this.kaylee.react('hop')
    this.cheerT = 0
    sfx.cheer()
    if (this.round === 3) this.after(0.2, () => sfx.win())
    this.sparkles.burst(this.kaylee.position.clone().setY(CONE.top + 0.9), 22, 1.6, 1.8, 1.1, 0.05)
    this.monkeys.forEach((m, i) => this.after(0.1 + i * 0.12, () => m.play('cheer')))
    if (this.d.state === 'watch') {
      this.daddy.arms = 'cheer'
      this.daddy.hop()
      this.after(1.6, () => (this.daddy.arms = 'down'))
    }
    this.mev.top()
    this.after(0.5, () => this.talk.once('top', T.top))
  }

  // ---------------------------------------------------------------- on top: the bell and the slide

  private toRope() {
    const k = this.k
    if (k.state !== 'top') return
    k.state = 'walk'
    sfx.pop()
    this.kaylee.walk([ROPE_AT], () => {
      this.kaylee.faceToward(BELL.x, BELL.z)
      k.state = 'ring'
      this.ringT = 0
    })
  }

  private ringBell(big: boolean) {
    this.bellSw.v += big ? 3.2 : 2
    this.ropeT = 0
    sfx.rope()
    this.after(0.12, () => sfx.bell(big ? 1 : 0.7))
    this.sparkles.burst(this.built.bell.getWorldPosition(new Vector3()).add(V(0, -0.3, 0.2)), big ? 18 : 8, 1.3, 1.0, 1.0, 0.045)
    this.after(0.15, () => this.monkeys[2].play('ears'))
    // The first bell: the real Golden Mount's fact.
    this.after(1.0, () => this.talk.once('mount', T.mount))
  }

  private toSlide() {
    const k = this.k
    if (k.state !== 'top') return
    k.state = 'walk'
    sfx.pop()
    const mouth = onCone(SLIDE_A, CONE.top, -0.42)
    this.kaylee.walk([[mouth[0], mouth[2]]], () => {
      k.state = 'slide'
      sfx.zoom()
      this.rides.slide(this.built.slide, { max: 6.5, accel: 2.5, land: V(...LAND) }, () => this.landed())
    })
  }

  private landed() {
    const k = this.k
    k.state = 'out'
    k.t = 0
    this.matT = 0
    this.kaylee.react('hop')
    sfx.giggle()
    this.puffs.burst(V(...LAND).setY(0.15), 12, 1.4, 0.4, 0.7, 0.08)
    // A flag on the rail for this round.
    const i = this.round - 1
    if (this.flagsUp <= i) {
      this.flagsUp = i + 1
      this.built.flags[i].visible = true
      this.flagPop[i] = 0
      this.after(0.3, () => sfx.flag())
    }
    // Daddy cheers (in round 3 he follows her down: daddyFrame).
    if (this.d.state === 'watch') {
      this.daddy.arms = 'cheer'
      this.after(1.2, () => (this.daddy.arms = 'down'))
    }
    // Then back to the foot for the next round (after the third: race Daddy again).
    this.after(0.9, () => {
      const next = (this.round < 3 ? this.round + 1 : 3) as Round
      if (this.round === 3 && !this.allDoneSent) {
        this.allDoneSent = true
        this.mev.allDone()
      }
      k.state = 'home'
      const foot = this.wallPos(FOOT_A[next], FOOT_Y)
      this.kaylee.walk([[foot.x, foot.z]], () => {
        if (this.disposed) return
        this.k = { state: 'floor', a: FOOT_A[next], y: FOOT_Y, row: -1, t: 0 }
        this.placeOnWall(FOOT_A[next], FOOT_Y)
      })
      this.after(0.4, () => this.setRound(next))
    })
  }

  // ---------------------------------------------------------------- Daddy's race

  /** Daddy goes up to one hold behind her (or over the top, once she's there). */
  private daddyGoal() {
    const s = this.k.state
    if (s === 'floor') return -1
    if (s === 'pull' || s === 'hang') return this.k.row - 1
    return rowsIn(3)
  }
  private daddyFollow() {
    this.after(0.25, () => this.daddyStep())
  }
  private daddyStep() {
    const d = this.d
    if (this.round !== 3 || (d.state !== 'foot' && d.state !== 'hang')) return
    const goal = this.daddyGoal()
    if (d.row >= goal) return
    if (d.row === rowsIn(3) - 1) return this.daddyOver()
    const to = this.dHolds[d.row + 1]
    // Far behind (she's quick), he hurries: always close behind her, never ahead.
    const behind = goal - d.row
    this.dPull = { from: { a: d.a, y: d.y }, to, t: 0, dur: DADDY_PULL_S / (1 + 0.6 * Math.max(0, behind - 1)) }
    d.state = 'pull'
    this.holdFx.set(this.dHoldG[to.i], { t: 0, kind: 'grab' })
  }
  private daddyPos(a: number, yHand: number) {
    const yr = Math.max(0, yHand - 1.3)
    return V(...onCone(a, yr, yr <= 0 ? 0.42 : 0.3))
  }
  private daddyOver() {
    const d = this.d
    d.state = 'over'
    d.t = 0
    this.dFrom.copy(this.daddy.pos)
    this.dTo.set(...onCone(DADDY_FOOT_A, CONE.top, -0.45))
    sfx.boing()
  }
  private daddyToMouth() {
    const d = this.d
    if (d.state !== 'top') return
    d.state = 'toMouth'
    const s = this.built.slide.getPointAt(0)
    this.daddy.walkTo(V(s.x, CONE.top, s.z), 1.8, () => {
      d.state = 'slide'
      d.u = 0
      d.v = 1
      this.daddy.sitting = true
      this.daddy.arms = 'up'
      sfx.zoom()
    })
  }

  private daddyFrame(dt: number) {
    const d = this.d
    const r = this.daddy
    d.t += dt
    const kp = this.kaylee.position
    if (d.state === 'pull' && this.dPull) {
      const p = this.dPull
      p.t = Math.min(1, p.t + dt / p.dur)
      const rise = ease(span(p.t, 0.3, 0.9))
      const a = p.from.a + (p.to.a - p.from.a) * rise
      const y = p.from.y + (p.to.y - p.from.y) * rise
      const at = this.daddyPos(a, y)
      r.place(at.x, at.y, at.z, a + Math.PI)
      if (p.t >= 1) {
        this.dPull = null
        d.state = 'hang'
        d.a = p.to.a
        d.y = p.to.y
        d.row = p.to.row
        r.land()
        sfx.huff()
        this.huffPuff()
        // Halfway up, once a race: out of breath, out loud.
        if (d.row === 2 && !this.huffed) {
          this.huffed = true
          this.talk.say(T.huff)
        }
        this.after(d.row < this.daddyGoal() - 1 ? 0.05 : 0.25, () => this.daddyStep())
      }
    } else if (d.state === 'hang' || d.state === 'foot') {
      // Waiting for her, puffing; on his way once she's over the top.
      if (this.time > this.puffAt) {
        this.puffAt = this.time + 1.4
        if (d.state === 'hang') this.huffPuff()
      }
      if (d.row < this.daddyGoal() && !this.later.some((l) => l.f === this.daddyStepRef)) this.after(0.3, this.daddyStepRef)
    } else if (d.state === 'over') {
      const k = clamp(d.t / 0.6)
      const p = new Vector3().lerpVectors(this.dFrom, this.dTo, k)
      p.y += bell(k) * 0.5
      r.place(p.x, p.y, p.z, DADDY_FOOT_A + Math.PI * (1 - k) + -0.6 * k)
      if (k >= 1) {
        d.state = 'top'
        d.t = 0
        r.land()
        sfx.thump()
        sfx.huff()
        this.after(0.5, () => sfx.huff())
        this.after(1.1, () => {
          this.talk.say(T.beat)
          r.arms = 'cheer'
        })
        this.after(2.2, () => (r.arms = 'down'))
      }
    } else if (d.state === 'top') {
      // Bent over, out of breath, then up and cheering for her.
      r.flip = 0.45 * (1 - span(d.t, 1.0, 1.4))
      if (this.time > this.puffAt) {
        this.puffAt = this.time + 0.7
        if (d.t < 1.2) this.huffPuff()
      }
      // She's gone down the slide: after her!
      const ks = this.k.state
      if (d.t > 1.5 && (ks === 'out' || ks === 'home' || ks === 'floor' || ks === 'hang' || ks === 'pull')) this.daddyToMouth()
    } else if (d.state === 'slide') {
      const c = this.built.slide
      const tan = c.getTangentAt(clamp(d.u))
      d.v = Math.min(6, d.v + (2 + 9 * Math.max(0, -tan.y)) * dt)
      d.u = Math.min(1, d.u + (d.v * dt) / c.getLength())
      const p = c.getPointAt(d.u)
      r.place(p.x, p.y + 0.06, p.z, Math.atan2(tan.x, tan.z))
      r.setWind(1)
      if (d.u >= 1) {
        d.state = 'flop'
        d.t = 0
        r.sitting = false
        this.dFrom.copy(p)
        this.dTo.set(LAND[0] + 0.85, 0.12, LAND[2] - 0.2)
        this.talk.say(T.whoa)
      }
    } else if (d.state === 'flop') {
      // Head first onto the mat, legs kicking, then pops up laughing.
      const k = clamp(d.t / 0.55)
      if (d.t < 0.55) {
        const p = new Vector3().lerpVectors(this.dFrom, this.dTo, k)
        p.y += bell(k) * 0.6
        r.place(p.x, p.y, p.z, 0.3)
        r.flip = -Math.PI * k
      } else if (d.t < 2.0) {
        if (!r.kicking) {
          r.kicking = true
          sfx.thump()
          sfx.boing()
          this.puffs.burst(this.dTo.clone(), 10, 1.2, 0.4, 0.6, 0.08)
          this.after(0.3, () => sfx.giggle())
        }
        r.flip = -Math.PI
      } else {
        r.kicking = false
        r.flip = -Math.PI * (1 - span(d.t, 2.0, 2.4))
        if (d.t >= 2.4) {
          r.flip = 0
          r.setWind(0)
          r.arms = 'down'
          r.place(this.dTo.x, 0, this.dTo.z, 0.3)
          r.hop()
          sfx.haha()
          d.state = 'back'
          const foot = V(...onCone(DADDY_FOOT_A, 0, 0.42))
          r.walkTo(foot, 2.2, () => {
            r.face(DADDY_FOOT_A + Math.PI)
            this.d = { ...this.d, state: 'foot', a: DADDY_FOOT_A, y: 0, row: -1 }
          })
        }
      }
    }
    // Arms: up the wall hand over hand; otherwise his own.
    const climbing = d.state === 'pull' || d.state === 'hang'
    r.lookAt(climbing ? kp.clone().setY(kp.y + 0.6) : kp.clone().setY(kp.y + 0.6))
    r.update(dt, this.time)
    if (climbing || (d.state === 'foot' && this.round === 3)) {
      const up = d.state === 'pull' ? span(this.dPull?.t ?? 0, 0, 0.3) * (1 - span(this.dPull?.t ?? 0, 0.3, 0.9)) : 0
      const hand = (this.dPull?.to.row ?? d.row) % 2
      const base = d.state === 'foot' ? 0.4 : 2.5
      r.rig.armL.rotation.z = -(base + (hand ? 0.35 * up : -0.6 * up))
      r.rig.armR.rotation.z = base + (hand ? -0.6 * up : 0.35 * up)
      if (climbing) r.rig.body.rotation.x = 0.28
    }
  }
  private daddyStepRef = () => this.daddyStep()

  private huffPuff() {
    const h = this.daddy.rig.head.localToWorld(V(0, this.daddy.rig.face.headY, 0.2))
    this.puffs.emit(h, V(0.5 + Math.random() * 0.3, 0.5, 0.6), 0.9, 0.12)
    this.puffs.emit(h, V(0.3, 0.7, 0.5), 0.8, 0.09)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...(this.holdG.get(this.round) ?? []), ...(this.round === 3 ? this.dHoldG : []), ...this.built.picks, ...this.monkeys.map((m) => m.root), this.kaylee.root, this.daddy.root]
  }

  private holdOf(id: string | null | undefined) {
    return id?.startsWith('hold:') ? (this.holds[Number(id.slice(5))] ?? null) : null
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.handled = null
    if (x === undefined || y === undefined) return
    const what = id ?? this.pick(x, y)
    const h = this.holdOf(what)
    if (!h || !this.reachable().includes(h) || !this.allowed(h)) return
    this.grab = { id: what!, y0: y, moved: false }
    this.startPull(h, this.k.state === 'pull' ? null : REACH_T)
  }

  pointerMove(x: number, y: number, downX: number, downY: number, isHeld: boolean) {
    const g = this.grab
    if (!g || !isHeld) return
    if (Math.hypot(x - downX, y - downY) >= 14) g.moved = true
    this.lastTouch = this.time
    const p = this.pull
    if (p && p.drive !== null) p.drive = REACH_T + (RISE_T - REACH_T) * clamp((y - g.y0) / PULL_PX)
  }

  pointerUp() {
    const g = this.grab
    if (!g) return
    this.grab = null
    if (this.pull) this.pull.drive = null
    // (A pull she dragged gets no tap afterwards: count it here. A short one is a tap: swallow it.)
    if (g.moved) this.touches++
    else this.handled = g.id
  }

  tap(x: number, y: number, id?: string) {
    const what = id ?? this.pick(x, y) ?? undefined
    if (what && what === this.handled) {
      this.handled = null
      this.lastTouch = this.time
      this.touches++
      return
    }
    super.tap(x, y, what)
  }

  protected onTap(id: string | null) {
    if (!id) return
    const h = this.holdOf(id)
    if (h) return this.tapHold(h)
    if (id.startsWith('monkey:')) {
      const i = Number(id.slice(7))
      const trick: MonkeyTrick = (['flip', 'scratch', 'swing'] as MonkeyTrick[])[i] ?? 'flip'
      this.monkeys[i]?.play(trick)
      sfx.chatter()
      this.after(0.6, () => this.talk.once('monkeys', T.monkeys))
      if (i === 2) this.after(0.4, () => sfx.giggle())
      return
    }
    if (id.startsWith('ele:')) {
      const i = Number(id.slice(4))
      if (this.trunkT[i] < 1.4) return
      this.trunkT[i] = 0
      sfx.trumpet()
      sfx.spray()
      this.after(0.8, () => this.talk.once('elephant', L.facts.elephant))
      return
    }
    switch (id) {
      case 'bell':
        if (this.k.state === 'top') return this.toRope()
        if (this.k.state === 'ring') return
        // From down below: the top monkey rings it for her (and covers its ears).
        this.ringBell(false)
        return
      case 'slide':
        return this.toSlide()
      case 'chute':
        if (this.k.state === 'top') return this.toSlide()
        this.shineT = 0
        sfx.ting()
        return
      case 'band':
      case 'cone':
        this.bandT = this.bandT.map((_, i) => -i * 0.12)
        sfx.ripple()
        for (const g of this.built.bands) this.sparkles.burst(g.position.clone().add(V(0, 0.1, rAt(g.position.y) + 0.1)), 4, 1.0, 0.6, 0.6, 0.035)
        return
      case 'rail':
        sfx.jangle()
        this.monkeys[2].play('swing')
        return
      case 'mat':
        this.matT = 0
        sfx.boing()
        return
      case 'dhold':
        sfx.boingy()
        return
      case 'kaylee':
      case 'family:kaylee':
        this.kaylee.react(this.k.state === 'top' || this.k.state === 'floor' ? 'hop' : 'wiggle')
        sfx.giggle()
        return
      case 'family:nick':
        if (this.d.state === 'pull' || this.d.state === 'hang') {
          this.daddy.wiggle()
          sfx.huff()
          this.huffPuff()
        } else {
          this.daddy.hop()
          sfx.haha()
        }
        return
    }
  }

  /** A tap on a hold: in reach, she pulls up to it; round 2's non-pink ones are silly toys; one out of reach wiggles and
   *  the ones she can reach shine brighter. */
  private tapHold(h: Hold) {
    const g = this.holdG.get(this.round)![h.i]
    const near = this.reachable().includes(h)
    if (near && this.allowed(h)) return this.startPull(h, null)
    if (this.round === 2 && h.color !== 'pink') {
      if (h.color === 'yellow') {
        this.holdFx.set(g, { t: 0, kind: 'honk' })
        sfx.honk()
      } else if (h.color === 'blue') {
        this.holdFx.set(g, { t: 0, kind: 'giggle' })
        sfx.holdGiggle()
      } else {
        this.holdFx.set(g, { t: 0, kind: 'wiggle' })
        this.monkeys[1].play('raspberry', V(...onCone(h.a + 0.25, h.y - 0.25, 0.15)))
        this.after(0.6, () => sfx.raspberry())
        this.after(1.3, () => sfx.giggle())
      }
      this.haloBoost = 1
      return
    }
    this.holdFx.set(g, { t: 0, kind: 'wiggle' })
    sfx.boingy()
    this.haloBoost = 1
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    for (const l of [...this.later]) {
      if (this.time < l.t) continue
      this.later.splice(this.later.indexOf(l), 1)
      l.f()
    }
    const k = this.k
    k.t += dt
    const K = this.kaylee
    // ---- Kaylee ----
    if (k.state === 'pull') this.pullFrame(dt)
    else if (k.state === 'hang' || k.state === 'floor') this.placeOnWall(k.a, k.y)
    else if (k.state === 'over' && this.over) {
      const o = this.over
      o.t = Math.min(1, o.t + dt / 0.5)
      const p = new Vector3().lerpVectors(o.from, o.to, o.t)
      p.y += bell(o.t) * 0.55
      K.place(p.x, p.y, p.z, (k.a + Math.PI) * deg)
      if (o.t >= 1) {
        this.over = null
        K.place(o.to.x, o.to.y, o.to.z, (k.a + Math.PI) * deg)
        this.onTop()
      }
    }
    const next = this.reachable().find((h) => this.allowed(h))
    const look = next ? V(...onCone(next.a, next.y, 0.1)) : k.state === 'top' ? this.built.bell.getWorldPosition(new Vector3()) : this.daddy.root.position.clone().setY(1.2)
    K.lookAt(look.x, look.y, look.z)
    K.update(dt, t)
    this.rides.update(dt, t)
    this.kayleePose(dt, t)
    // ---- Daddy, the monkeys ----
    this.daddyFrame(dt)
    const kp = K.position.clone().setY(K.position.y + 0.6)
    for (const m of this.monkeys) {
      m.lookAt(kp)
      m.update(dt, t)
    }
    // A little life on its own: now and then a monkey does something.
    if (this.time > this.nextLife) {
      this.nextLife = this.time + 6 + Math.random() * 5
      const i = Math.floor(Math.random() * 3)
      if (!this.monkeys[i].busy) this.monkeys[i].play((['flip', 'scratch', 'scratch'] as MonkeyTrick[])[i])
    }
    this.thingsFrame(dt, t)
    // The 👆 shows after a while with nothing touched: Sparkle says what to do, once each time.
    this.talk.hint(this.time, this.lastTouch, () => this.hintAt() !== null, () =>
      k.state === 'top' ? (this.rung ? T.hint.slide : T.hint.bell) : this.round === 2 ? T.hint.pink : T.hint.hold,
    )
    this.sparkles.update(dt)
    this.puffs.update(dt)
    this.drops.update(dt)
  }

  /** Her arms and body on the wall: hands up on the holds, one reaching for the next, legs dangling and swinging. */
  private kayleePose(dt: number, t: number) {
    const k = this.k
    const r = this.kaylee.rig
    const sw = this.swing
    sw.v += (-30 * sw.a - 3 * sw.v) * dt
    sw.a += sw.v * dt
    if (k.state === 'hang' || k.state === 'pull') {
      const p = this.pull
      const reach = p ? span(p.t, 0, REACH_T) * (1 - span(p.t, REACH_T, RISE_T)) : 0
      const hand = p ? p.hand : (this.hand + 1) % 2
      const hold = 2.55 - (p ? 0.9 * bell(span(p.t, REACH_T, RISE_T)) : 0)
      const left = hand === 0 ? 2.95 * reach + hold * (1 - reach) : hold
      const right = hand === 1 ? 2.95 * reach + hold * (1 - reach) : hold
      r.armL.rotation.set(0, 0, -left)
      r.armR.rotation.set(0, 0, right)
      r.body.rotation.x = 0.32
      r.body.rotation.z = clamp(sw.a, -0.3, 0.3) + Math.sin(t * 2.2) * 0.03
      // Stretched as she reaches, squashed when she lands.
      const st = p ? 1 + 0.08 * reach : 1
      r.body.scale.y *= st
    } else if (k.state === 'floor') {
      // At the foot: arms a little up, ready.
      r.armL.rotation.set(0, 0, -0.5 - Math.sin(t * 3) * 0.08)
      r.armR.rotation.set(0, 0, 0.5 + Math.sin(t * 3) * 0.08)
    } else if (k.state === 'top' && this.cheerT >= 0) {
      this.cheerT += dt
      const c = 1 - span(this.cheerT, 1.3, 1.6)
      r.armL.rotation.set(0, 0, -(1.6 + Math.max(0, Math.sin(t * 10)) * 0.9) * c)
      r.armR.rotation.set(0, 0, (1.6 + Math.max(0, Math.sin(t * 10 + Math.PI)) * 0.9) * c)
      if (this.cheerT > 1.6) this.cheerT = -1
    } else if (k.state === 'ring') {
      this.ringT += dt
      const rt = this.ringT
      // Up to the rope, a big tug down (dong!), let go.
      const up = span(rt, 0, 0.25) * (1 - span(rt, 0.75, 1.0))
      const tug = bell(span(rt, 0.25, 0.6))
      r.armR.rotation.set(-0.3 * up, 0, 2.9 * up - 0.7 * tug)
      r.armL.rotation.set(-0.3 * up, 0, -(2.6 * up - 0.5 * tug))
      r.body.scale.y *= 1 - 0.08 * tug
      if (rt - dt < 0.3 && rt >= 0.3) {
        this.ringBell(true)
        if (!this.rung) this.after(0.4, () => sounds.sparkle())
        this.rung = true
      }
      if (rt > 1.0) {
        k.state = 'top'
        this.ringT = -1
      }
    } else if (k.state === 'out') {
      // A spin on her bottom on the mat, then up.
      r.body.rotation.y = span(k.t, 0, 0.6) * Math.PI * 2
    }
  }

  /** The bell swinging, the rope, the flags popping on, the shine down the slide, the bands, the trunks, the halos. */
  private thingsFrame(dt: number, t: number) {
    const b = this.bellSw
    b.v += (-18 * b.a - 1.6 * b.v) * dt
    b.a = clamp(b.a + b.v * dt, -0.7, 0.7)
    this.built.bell.rotation.x = b.a
    this.ropeT = Math.min(1, this.ropeT + dt / 0.5)
    this.built.rope.position.y = -0.44 - 0.12 * bell(this.ropeT)
    this.built.flags.forEach((f, i) => {
      this.flagPop[i] = Math.min(1, this.flagPop[i] + dt / 0.6)
      const p = this.flagPop[i]
      f.scale.setScalar(Math.max(0.01, p < 1 ? span(p, 0, 0.4) * (1 + wobble(p, 2) * 0.3) : 1))
      f.rotation.y = Math.sin(t * 2 + i) * 0.15
    })
    // The shine running down the slide.
    const sh = this.built.shine
    if (this.shineT < 1) {
      this.shineT = Math.min(1, this.shineT + dt / 0.8)
      const c = this.built.slide
      const p = c.getPointAt(this.shineT)
      sh.position.copy(p).add(V(0, 0.04, 0))
      sh.lookAt(p.clone().add(c.getTangentAt(this.shineT)).add(V(0, 0.04, 0)))
      sh.visible = this.shineT < 1
    } else sh.visible = false
    this.built.bands.forEach((g, i) => {
      this.bandT[i] += dt
      const k = clamp(this.bandT[i] / 0.45)
      const s = this.bandT[i] >= 0 && k < 1 ? 1 + 0.07 * bell(k) : 1
      g.scale.set(s, 1 + (s - 1) * 2, s)
    })
    this.built.trunks.forEach((tr, i) => {
      this.trunkT[i] += dt
      const k = clamp(this.trunkT[i] / 1.4)
      const up = this.trunkT[i] < 1.4 ? bell(k) : 0
      const dir = tr.userData.dir as number
      tr.rotation.z = dir * (1.9 * up + Math.sin(t * 1.4 + i) * 0.06)
      if (this.trunkT[i] - dt < 0.45 && this.trunkT[i] >= 0.45) {
        const e = ELEPHANTS[i]
        const tip = V(e.x + dir * 1.35, e.y + 0.55, tr.position.z + 0.15)
        for (let j = 0; j < 14; j++) this.drops.emit(tip, V(dir * (0.4 + Math.random() * 1.4), 1.6 + Math.random() * 1.6, 0.2), 0.9, 0.05 + Math.random() * 0.03)
      }
    })
    this.matT = Math.min(1, this.matT + dt / 0.5)
    // Holds popping in, squashing when grabbed, honking, giggling, wiggling.
    for (const [g, fx] of this.holdFx) {
      fx.t += dt
      const k = clamp(fx.t / (fx.kind === 'pop' ? 0.45 : fx.kind === 'giggle' ? 0.9 : 0.5))
      let s = 1
      let sy = 1
      let rz = 0
      if (fx.t < 0) s = 0.01
      else if (fx.kind === 'pop') s = Math.max(0.01, span(k, 0, 0.5) * (1 + wobble(k, 2) * 0.3))
      else if (fx.kind === 'grab') sy = 1 - 0.25 * bell(k)
      else if (fx.kind === 'honk') {
        s = 1 + 0.45 * bell(k)
        sy = 1 - 0.3 * bell(span(k, 0, 0.4))
      } else if (fx.kind === 'giggle') rz = Math.sin(fx.t * 30) * 0.4 * (1 - k)
      else rz = Math.sin(fx.t * 24) * 0.3 * (1 - k)
      g.scale.set(s, s * sy, s)
      g.children.forEach((c) => (c.rotation.z = rz))
      if (fx.t >= 0 && k >= 1) {
        g.scale.set(1, 1, 1)
        g.children.forEach((c) => (c.rotation.z = 0))
        this.holdFx.delete(g)
      }
    }
    // The gold rings round the holds she can reach (and may take), pulsing; brighter after a silly tap.
    this.haloBoost = Math.max(0, this.haloBoost - dt / 1.2)
    const slope = Math.atan((CONE.r0 - CONE.rt) / CONE.top)
    const glow = this.reachable().filter((h) => this.allowed(h))
    this.halos.forEach((m, i) => {
      const h = this.k.state === 'pull' ? undefined : glow[i]
      m.visible = !!h
      if (!h) return
      m.position.set(...onCone(h.a, h.y, 0.05))
      m.rotation.set(0, 0, 0)
      m.rotateY(h.a)
      m.rotateX(-slope)
      m.scale.setScalar(1 + 0.12 * Math.sin(t * 6) + 0.35 * this.haloBoost)
      ;(m.material as MeshBasicMaterial).opacity = 0.6 + 0.3 * Math.sin(t * 6) * (1 - this.haloBoost) + 0.4 * this.haloBoost
    })
  }

  // ---------------------------------------------------------------- the count over each hold

  setCountElement(el: HTMLElement | null) {
    this.countEl = el
  }
  private showCount(n: number, at: Vector3) {
    const el = this.countEl
    if (!el) return
    this.countAt = at
    this.countT = 0
    const inner = el.firstElementChild as HTMLElement | null
    if (inner) {
      inner.textContent = String(n)
      inner.animate?.([{ transform: 'scale(0.2)', opacity: 0 }, { transform: 'scale(1.35)', opacity: 1, offset: 0.25 }, { transform: 'scale(1)', opacity: 1, offset: 0.6 }, { transform: 'scale(1) translateY(-20px)', opacity: 0 }], { duration: 1100, easing: 'ease-out' })
    }
  }

  placeAnchors() {
    super.placeAnchors()
    const el = this.countEl
    if (!el) return
    const show = this.countAt && this.countT < 1.1
    if (el.style.display !== (show ? '' : 'none')) el.style.display = show ? '' : 'none'
    if (!show || !this.countAt) return
    const s = this.toScreen(this.countAt, 0.2)
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  update(dt: number) {
    this.countT += dt
    super.update(dt)
  }

  // ---------------------------------------------------------------- camera, anchors, the hint

  setSize(w: number, h: number, top: number) {
    this.tall = w < h
    super.setSize(w, h, top)
  }

  protected shot(): Shot {
    const s = this.k.state
    const tall = this.tall
    const kp = this.kaylee.position
    // Down the slide and on the mat: the whole thing, slide and all.
    if (s === 'slide' || s === 'out' || s === 'home') return { center: V(0.5, 1.7, CONE.z + 1.8), half: tall ? V(2.6, 2.6, 2.2) : V(3.6, 2.0, 2.2), yaw: 0, pitch: 12, minDist: 5 }
    // On top: the platform, the bell and the slide's mouth.
    if (s === 'over' || s === 'top' || s === 'walk' || s === 'ring') return { center: V(this.round === 3 ? 0.3 : 0, CONE.top + 0.55, CONE.z + 0.6), half: tall ? V(1.7, 1.7, 1.0) : V(2.3, 1.35, 1.0), yaw: 0, pitch: 12, minDist: 5 }
    // On the wall (and at the foot): following her up, the next holds over her head; Daddy too in the race.
    const handY = s === 'floor' ? 0.9 : this.pull ? this.pull.from.y + (this.pull.to.y - this.pull.from.y) * span(this.pull.t, REACH_T, RISE_T) : this.k.y
    const y = clamp(handY + 0.05, 1.25, CONE.top - 0.15)
    const race = this.round === 3
    const x = race ? (kp.x + this.daddy.pos.x) / 2 : kp.x + 0.35
    const half = tall ? V(race ? 2.0 : 1.6, 1.85, 0.8) : V(race ? 2.9 : 2.2, 1.4, 0.8)
    return { center: V(x, y, CONE.z + rAt(y) + 0.3), half, yaw: 0, pitch: 10, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const k = this.k
    const h = this.holdOf(id)
    if (id.startsWith('hold:')) {
      if (!h || k.state === 'pull' || !this.reachable().includes(h)) return null
      return { at: V(...onCone(h.a, h.y, 0.08)), r: 0.2, glow: this.allowed(h), max: 120, prio: 3 }
    }
    if (id.startsWith('monkey:')) {
      const m = this.monkeys[Number(id.slice(7))]
      return m ? { at: m.position.clone().setY(m.position.y + 0.25), r: 0.24, max: 110, prio: 2 } : null
    }
    if (id.startsWith('ele:')) {
      const e = ELEPHANTS[Number(id.slice(4))]
      return e ? { at: V(e.x, e.y + 0.2, WALL_Z + 0.1), r: 0.9, max: 150, prio: 1 } : null
    }
    switch (id) {
      case 'bell':
        return { at: this.built.bell.getWorldPosition(new Vector3()).add(V(0, -0.3, 0)), r: 0.28, glow: k.state === 'top' && !this.rung, max: 130, prio: 2 }
      case 'slide': {
        if (k.state !== 'top') return null
        const p = this.built.slide.getPointAt(0.04)
        return { at: p.add(V(0, 0.15, 0)), r: 0.32, glow: true, max: 140, prio: 2 }
      }
      case 'chute': {
        if (k.state === 'top' || k.state === 'slide') return null
        return { at: this.built.slide.getPointAt(0.55).add(V(0, 0.1, 0)), r: 0.3, max: 120, prio: 1 }
      }
      case 'band':
        return { at: V(...onCone(0.62, 1.35, 0.05)), r: 0.35, max: 120, prio: 1 }
      case 'family:kaylee': {
        const p = this.kaylee.position
        return { at: V(p.x, p.y + 0.45, p.z + 0.1), r: 0.3, max: 120, prio: 0 }
      }
      case 'family:nick': {
        const p = this.daddy.root.position
        return { at: V(p.x, p.y + 0.85, p.z), r: 0.38, max: 130, prio: 0 }
      }
    }
    return null
  }

  /** After a while with nothing touched: the next hold she can take, or the bell, or the slide. */
  protected hintAt() {
    const k = this.k
    if (k.state === 'top') return this.rung ? this.built.slide.getPointAt(0.04).add(V(0, 0.15, 0)) : this.built.bell.getWorldPosition(new Vector3()).add(V(0, -0.3, 0))
    if (k.state !== 'floor' && k.state !== 'hang') return null
    const h = this.reachable().find((x) => this.allowed(x))
    return h ? V(...onCone(h.a, h.y, 0.08)) : null
  }

  get calm() {
    return false
  }

  qa() {
    const px = (v: Vector3 | null) => {
      if (!v) return null
      const s = this.toScreen(v, 0.1)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'mountain',
      round: this.round,
      state: this.k.state,
      row: this.k.row,
      rows: rowsIn(this.round),
      count: this.count,
      rung: this.rung,
      tops: this.tops,
      flags: this.flagsUp,
      daddy: this.round === 3 ? { state: this.d.state, row: this.d.row } : { state: this.d.state },
      touches: this.touches,
      pullPx: PULL_PX,
      reach: this.reachable().map((h) => [h.i, h.color, this.allowed(h) ? 1 : 0, ...(px(V(...onCone(h.a, h.y, 0.08))) ?? [])]),
      bell: px(this.built.bell.getWorldPosition(new Vector3()).add(V(0, -0.3, 0))),
      slide: this.k.state === 'top' ? px(this.built.slide.getPointAt(0.04).add(V(0, 0.15, 0))) : null,
      kaylee: px(this.kaylee.position.clone().setY(this.kaylee.position.y + 0.45)),
      mat: px(V(...MAT.at)),
    }
  }
}
