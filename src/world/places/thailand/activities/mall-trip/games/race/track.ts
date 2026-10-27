// The Racing Slide at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "★ 3. The Racing Slide"),
// greybox: shapes and sounds, with the voices (lines.ts L.mall.race). Four wavy orange lanes seen from the bottom, ending in a pit of pink and white
// balls; Kaylee in lane 1, Daddy, Mommy and a kid beside her (the other kid waits a turn by the pit).
//
// The toy: climb the steps (tap, tap: two steps a tap), sit at the top, 3-2-1, then every tap is a scoot: her hands
// push the slide and she goes faster over each bump. Whee into the balls with a splash.
//   1. The first race: just scoot.
//   2. A tap just as she reaches a bump's crest makes her fly high (time slows near each crest, a ring closes on her
//      and she glows: tap now). A missed bump is still a bouncy little hop.
//   3. Rubber rings that spin: each scoot spins her ring too, and a flight twirls it.
// She always wins, Daddy by a nose (the others race her pace: ahead mid-race, just behind at the end). Each race puts a
// winner's ribbon on the board, and Daddy lands in the balls head first, legs kicking. The camera frames the steps and
// the top, follows her down, then the pit. Then round again (after the third, the 🛝 shows and she can keep racing).
import { Color, IcosahedronGeometry, OctahedronGeometry, Vector3, type Group, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, wobble } from '../../../../../../../sdk'
import type { AnchorInfo } from '../../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../../engine3d/camera'
import { PAL } from '../../../../../../engine3d/toon'
import { L } from '../../../../lines'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { BallPit, Floaters } from './fx'
import { BACK_PATH, BACK_TOP, BOARD, CHEER_AT, CLIMB_HOPS, CRESTS, DECK, FLAG_COLORS, FLAG_H, HOP, KID_LANE, kidFor, LAMPS, LAND_Z, LANE_OF, LANES, laneSlope, laneY, laneZ, PIT, PIT_EXIT, RAIL_X, RING_COLORS, RIVALS, SINK, SLIDE, SLIDE_LEN, SPEED, stepAt, STEPS_FOOT, WINDOW, type RacerId } from './layout'
import { Racer } from './racer'
import { buildRibbon, buildSlide, type Built } from './slide'
import { raceSfx as sfx } from './sounds'

export interface RaceEvents extends LegEvents {
  /** The race about to start (1, 2, 3, then on: the address bar's `round` follows, up to 3). */
  round(n: number): void
  /** She won race n (its ribbon is on the board; the sock band's sticker comes with the first). */
  won(n: number): void
  /** The countdown: 3, 2, 1, go, or nothing. */
  count(n: 3 | 2 | 1 | 0 | null): void
  /** Three races won. */
  allDone(): void
}

const OTHERS = ['nick', 'ji', 'kidA', 'kidB'] as const
type Other = (typeof OTHERS)[number]
const NAMES: Record<RacerId, string> = { kaylee: 'Kaylee', nick: 'Daddy', ji: 'Mommy', kidA: 'A kid in blue', kidB: 'A kid in yellow' }

export const RACE_ANCHORS: AnchorInfo[] = [
  { id: 'kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'steps', label: 'The steps', kind: 'thing' },
  { id: 'rail', label: 'The rail', kind: 'thing' },
  { id: 'balls', label: 'The balls', kind: 'thing' },
  { id: 'board', label: 'Ribbon board', kind: 'thing' },
  { id: 'lamps', label: 'Start lights', kind: 'thing' },
  ...FLAG_COLORS.map((_, i): AnchorInfo => ({ id: `flag:${i}`, label: `Flag ${i + 1}`, kind: 'thing' })),
  ...OTHERS.map((id): AnchorInfo => ({ id: `racer:${id}`, label: NAMES[id], kind: 'family' })),
]

type Phase = 'walk' | 'climb' | 'top' | 'count' | 'race' | 'splash'

/** One racer's run down a lane. */
interface Run {
  r: Racer
  lane: number
  u: number
  air: { t: number; dur: number; h: number; big: boolean } | null
  /** The next crest it hasn't passed. */
  crest: number
  /** Off the lip into the balls (or landed). */
  out: boolean
  /** A big flight at this crest (the others, rounds 2 and 3). */
  flyAt: number
  spinV: number
}

/** The camera stands a little to her side of straight on (degrees): the bumps show in the lanes' sides, the steps and lane 1 stay in front. */
const YAW = -14
const R = L.mall.race
const tmp = new Vector3()
const v3 = (p: readonly number[]) => new Vector3(p[0], p[1], p[2])
const seatOf = (lane: number) => new Vector3(LANES[lane], laneY(0), laneZ(0) + 0.08)

export class RaceSlide extends Stage {
  private built: Built
  private pit: BallPit
  private racers = new Map<RacerId, Racer>()
  private me: Racer
  private phase: Phase = 'climb'
  /** The race about to start or running (1-based; past 3 it plays by round 3's rules). */
  private race: number
  private runs: Run[] = []
  private her = { boost: 0, v: 0, primed: false, scoots: 0, flights: 0, raceT: 0, landed: false, slow: 1 }
  private climbed = 0
  private wantClimb = false
  private seated = new Set<RacerId>()
  private ribbons: Group[] = []
  private flying: { g: Group; t: number; from: Vector3; to: Vector3 } | null = null
  private later: { t: number; f: () => void }[] = []
  private sparkles: Floaters
  private puffs: Floaters
  private rail = 1
  private flagSpin = [1, 1, 1, 1]
  private lampsBlink = 1
  private boardWob = 1
  private daddyDive: { t: number } | null = null
  /** Each dive's number: a dive cut short (round again) must not finish later. */
  private diveN = 0
  private allDoneSent = false
  private waits = 0
  private hintRef: HTMLElement | null = null
  private ringEl: HTMLElement | null = null
  private teach: Vector3 | null = null
  private countN: 3 | 2 | 1 | 0 | null = null
  // The voices: which idle spell the hint was said for, the first-time lines said, the next win line, Daddy's last.
  private hintFor = -1
  private told = new Set<string>()
  private winN = 0
  private diveSaid = -99

  constructor(renderer: WebGLRenderer, private rev: RaceEvents, start: { round: number }) {
    super(renderer, rev)
    const { scene, bag } = this
    scene.background = new Color('#4A4166')
    this.rig.fov = 34
    this.rig.lag = 0.45
    this.built = buildSlide(bag)
    scene.add(this.built.root)
    this.pit = new BallPit(bag)
    scene.add(this.pit.root)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 90, bag, 1.4, 1.2)
    this.puffs = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#FFE6D2'], 50, bag, -0.3, 2.5)
    scene.add(this.sparkles.mesh, this.puffs.mesh)
    for (const id of ['kaylee', ...OTHERS] as RacerId[]) {
      const r = new Racer(id, bag)
      this.racers.set(id, r)
      scene.add(r.root)
    }
    this.me = this.racers.get('kaylee')!
    this.race = Math.max(1, start.round)
    // The ribbons she has already won (a link to round 2 or 3).
    for (let i = 1; i < this.race; i++) this.pin(this.newRibbon(), true)
    this.setUp()
    // Sparkle: climb up! (A link to a later race also says what's new in it.)
    this.after(0.3, () => {
      this.rev.say(R.open)
      this.newRules()
    })
  }

  /** What's new in this race (said once, on the way to the steps): the bumps in race 2, the rubber rings in race 3. */
  private newRules() {
    if (this.race === 2) this.once('bumps', R.bumps)
    if (this.race === 3) this.once('rings', R.rings)
  }
  private once(key: string, l: string) {
    if (this.told.has(key)) return
    this.told.add(key)
    this.rev.say(l)
  }

  setRingElement(el: HTMLElement | null) {
    this.ringEl = el
  }
  setHintElement(el: HTMLElement | null) {
    super.setHintElement(el)
    this.hintRef = el
  }

  private get rules() {
    return Math.min(3, this.race)
  }
  private other(id: Other) {
    return this.racers.get(id)!
  }
  private laneOf(id: RacerId) {
    return id === 'kidA' || id === 'kidB' ? KID_LANE : LANE_OF[id]
  }
  private racing(id: RacerId) {
    return id === 'kaylee' || id === 'nick' || id === 'ji' || id === kidFor(this.race)
  }

  // ---------------------------------------------------------------- a race from the start (a link, or the first)

  /** Kaylee at the bottom of the steps; the others already sitting in their lanes at the top; the other kid by the pit. */
  private setUp() {
    this.me.place(...STEPS_FOOT, Math.PI)
    for (const id of OTHERS) {
      const r = this.other(id)
      if (this.racing(id)) this.sitDown(r, this.laneOf(id), true)
      else this.toCheer(r, true)
    }
    this.phase = 'climb'
    this.climbed = 0
  }

  /** Sits in its lane at the top, facing down the slide (a ring first, in round 3). */
  private sitDown(r: Racer, lane: number, now = false) {
    const seat = seatOf(lane)
    const done = () => {
      r.place(seat.x, seat.y, seat.z, 0)
      r.sitting = true
      r.arms = 'race'
      r.land()
      if (this.rules === 3) {
        r.setRing(RING_COLORS[lane], this.bag)
        if (!now) sfx.ring()
      }
      this.seated.add(r.id)
      if (!now) this.maybeCount()
    }
    if (now) return done()
    // Along the deck to just behind the lane, then a hop onto the lip.
    r.walkTo(new Vector3(seat.x, DECK.y, DECK.z1 - 0.45), 2.0, () => {
      r.face(0)
      r.hopTo(seat, 0.32, 0.25, done)
    })
  }

  private toCheer(r: Racer, now = false) {
    const at = v3(CHEER_AT)
    const done = () => {
      r.place(at.x, at.y, at.z, -0.5)
      r.arms = 'cheer'
    }
    if (now) done()
    else r.walkTo(at, 2.4, done)
  }

  // ---------------------------------------------------------------- climbing, the countdown

  /** A tap while she climbs: up two steps (one waits if she's mid-hop). */
  private climb() {
    if (this.phase !== 'climb') return
    if (this.me.busy) {
      this.wantClimb = true
      return
    }
    const i = this.climbed
    if (i >= CLIMB_HOPS.length) return
    this.climbed++
    const k = CLIMB_HOPS[i]
    sfx.step(i * 2)
    this.after(0.12, () => sfx.step(i * 2 + 1))
    this.me.hopTo(v3(stepAt(k)), 0.34, 0.32, () => {
      this.me.land()
      if (this.climbed >= CLIMB_HOPS.length) this.atTop()
      else if (this.wantClimb) {
        this.wantClimb = false
        this.climb()
      }
    })
  }

  private atTop() {
    this.phase = 'top'
    this.wantClimb = false
    sfx.chime()
    this.me.hop()
    if (this.race === 1) this.rev.say(R.raceYou)
    this.after(0.35, () => this.sitDown(this.me, 0))
  }

  private maybeCount() {
    if (this.phase !== 'top') return
    if (![...this.racers.keys()].filter((id) => this.racing(id)).every((id) => this.seated.has(id))) return
    this.phase = 'count'
    const step = (n: 3 | 2 | 1 | 0) => {
      this.countN = n
      this.rev.count(n)
      this.rev.say(R.count[3 - n])
      this.lamp(n)
      sfx.light(n === 0)
      if (n === 0) {
        sfx.whistle()
        this.go()
        this.after(0.9, () => {
          this.countN = null
          this.rev.count(null)
        })
      } else this.after(0.85, () => step((n - 1) as 2 | 1 | 0))
    }
    this.after(0.6, () => step(3))
  }

  /** Lights for the countdown: as many lit as the number (three, two, one), then all green for go. */
  private lamp(n: 3 | 2 | 1 | 0 | null) {
    this.built.lamps.mats.forEach((m, i) => m.color.set(n === null ? '#6D6377' : n === 0 ? '#5BD88A' : i >= 3 - n ? '#FFC83D' : '#6D6377'))
  }

  // ---------------------------------------------------------------- the race

  private go() {
    this.phase = 'race'
    this.her = { boost: 0, v: SPEED.base, primed: false, scoots: 0, flights: 0, raceT: 0, landed: false, slow: 1 }
    this.runs = [...this.racers.values()]
      .filter((r) => this.racing(r.id))
      .map((r) => ({ r, lane: this.laneOf(r.id), u: 0, air: null, crest: 0, out: false, flyAt: this.rules >= 2 && r.id !== 'kaylee' ? Math.floor(Math.random() * CRESTS.length) : -1, spinV: 2 }))
    for (const run of this.runs) {
      run.r.arms = 'up'
      run.r.setWind(1)
      run.r.lookAt(null)
    }
    sfx.whee()
    this.after(0.6, () => this.runs.forEach((run) => !run.out && (run.r.arms = 'race')))
    for (const s of this.built.stripes) s.mesh.visible = this.rules >= 2
  }

  /** Every tap in the race: her hands push the slide, a little faster. At a crest (rounds 2 and 3): fly! */
  private scoot() {
    const run = this.runs.find((r) => r.r === this.me)
    if (!run || run.out) return
    const h = this.her
    h.scoots++
    h.boost = Math.min(SPEED.maxBoost, h.boost + SPEED.tap)
    run.spinV += 3.5
    this.me.scoot()
    sfx.scoot(h.boost / SPEED.maxBoost)
    this.puffs.burst(this.me.pos.clone().add(tmp.set(0, 0.2, -0.3)), 4, 0.6, 0.4, 0.5, 0.09)
    if (this.rules < 2 || run.air?.big) return
    const dtc = this.toCrest(run)
    if (dtc === null) return
    if (dtc >= 0 && dtc <= WINDOW.before) h.primed = true
    else if (dtc < 0 && -dtc <= WINDOW.after && run.air && !run.air.big) this.fly(run)
  }

  /** Seconds (of race time) to the next crest, or since the last one (negative), for her. */
  private toCrest(run: Run): number | null {
    const v = Math.max(0.1, this.her.v)
    const next = CRESTS[run.crest]
    const prev = CRESTS[run.crest - 1]
    const tn = next !== undefined ? ((next - run.u) * SLIDE_LEN) / v : Infinity
    const tp = prev !== undefined ? ((prev - run.u) * SLIDE_LEN) / v : -Infinity
    if (tn <= WINDOW.before + 0.5) return tn
    if (-tp <= WINDOW.after) return tp
    return tn === Infinity ? null : tn
  }

  /** Off a crest high in the air: a twirl, sparkles, and a little extra speed. */
  private fly(run: Run) {
    run.air = { t: 0, dur: HOP.bigDur, h: HOP.big * (run.r.height > 1.3 ? 0.8 : 1), big: true }
    run.r.arms = 'up'
    run.spinV += 6
    if (run.r === this.me) {
      this.her.flights++
      this.her.boost = Math.min(SPEED.maxBoost, this.her.boost + 0.5)
      this.her.primed = false
      sfx.fly()
      this.sparkles.burst(run.r.pos.clone().add(tmp.set(0, 0.5, 0)), 22, 1.6, 2.2, 0.9, 0.07)
    } else sfx.trick()
  }

  private stepRace(dt: number) {
    const h = this.her
    const mine = this.runs.find((r) => r.r === this.me)
    if (!mine) return
    // Time slows near each crest (rounds 2 and 3), so a five-year-old's tap lands in time.
    const dtc = !mine.out && this.rules >= 2 ? this.toCrest(mine) : null
    const near = dtc !== null && dtc <= WINDOW.before + 0.15 && dtc >= -WINDOW.after
    h.slow += ((near ? WINDOW.slow[this.rules - 1] : 1) - h.slow) * (1 - Math.exp(-dt * 10))
    const sdt = dt * h.slow
    h.raceT += sdt
    for (const run of this.runs) {
      if (run.out) continue
      const before = run.u
      if (run === mine) {
        h.v = Math.max(SPEED.min, SPEED.base + SPEED.slope * -laneSlope(run.u) + h.boost)
        h.boost *= Math.exp(-SPEED.decay * sdt)
        run.u += (h.v * sdt) / SLIDE_LEN
      } else if (!h.landed && !mine.out) {
        // Racing her pace: a little ahead mid-race, just behind at the end (Daddy by a nose).
        const p = mine.u
        const rv = RIVALS[run.r.id as Other]
        const goal = clamp(p + rv.lead * Math.sin(Math.PI * p) - rv.nose * p ** 3 + 0.012 * Math.sin(this.time * 1.9 + run.lane * 2), 0, 0.995)
        run.u += (goal - run.u) * (1 - Math.exp(-sdt * 5))
      } else run.u += (Math.max(h.v, 2) * 0.95 * sdt) / SLIDE_LEN
      run.u = Math.max(before, run.u)
      // Over a crest: a little hop on its own, or a big flight (her tap at the crest; the others now and then).
      const c = CRESTS[run.crest]
      if (c !== undefined && before < c && run.u >= c) {
        if (run === mine && h.primed) this.fly(run)
        else if (run.flyAt === run.crest) this.fly(run)
        else {
          run.air = { t: 0, dur: HOP.smallDur, h: HOP.small + (run === mine ? 0.05 * h.boost : 0.06), big: false }
          if (run === mine) {
            sfx.bip()
            h.primed = false
          }
        }
        run.crest++
      }
      // The stripe across her lane lights up while a tap would make her fly; a whistle rises before each crest.
      if (run === mine && this.rules >= 2) {
        const nxt = CRESTS[run.crest]
        this.built.stripes.forEach((s, i) => s.mat.color.set(i === run.crest && dtc !== null && dtc >= 0 && dtc <= WINDOW.before ? PAL.gold : i < run.crest ? '#FFE8F1' : '#FF8FB8'))
        if (nxt !== undefined && this.ready(`crest${this.race}:${run.crest}`, 99) && dtc !== null && dtc <= WINDOW.before + 0.25 && dtc > 0) sfx.ready()
      }
      // In the air.
      let lift = 0
      if (run.air) {
        run.air.t += sdt
        const k = Math.min(1, run.air.t / run.air.dur)
        lift = bell(k) * run.air.h
        if (k >= 1) {
          if (run.air.big) {
            run.r.arms = 'race'
            run.r.land()
            sfx.boing()
          }
          run.air = null
        }
      }
      run.r.lift = lift
      run.r.place(LANES[run.lane], laneY(Math.min(1, run.u)), laneZ(Math.min(1, run.u)), 0)
      run.r.sitting = true
      // The rubber rings spin (faster with her scoots and in the air); a big flight twirls anyone.
      if (this.rules === 3) {
        run.spinV += (2 - run.spinV) * (1 - Math.exp(-sdt * 1.2))
        run.r.spin += run.spinV * sdt
      } else run.r.spin = run.air?.big ? (run.air.t / run.air.dur) * Math.PI * 2 : 0
      run.r.setWind(clamp(0.5 + (run === mine ? h.boost / SPEED.maxBoost : 0.3)))
      if (run.u >= 1) this.launch(run)
    }
    if (h.landed && this.runs.every((r) => r.out) && this.phase === 'race') this.phase = 'splash'
  }

  /** Off the bottom lip, into the balls. */
  private launch(run: Run) {
    run.out = true
    const r = run.r
    r.lift = 0
    r.arms = 'up'
    const land = new Vector3(LANES[run.lane] + (Math.random() - 0.5) * 0.2, PIT.surface - SINK, LAND_Z + Math.random() * 0.35)
    if (r.id === 'nick') return this.dive(r, land, true)
    r.hopTo(land, 0.5, 0.55, () => {
      r.land()
      r.setWind(0)
      this.pit.splash(land.x, land.z, r === this.me ? 34 : 18, r === this.me ? 1.2 : 0.9, [0, 0.8])
      sfx.balls(r === this.me ? 1.4 : 0.8)
      if (r === this.me) this.won()
      else r.arms = 'cheer'
    })
  }

  /** Daddy into the balls head first: over he goes, legs kicking in the air, then BLOOP, out he pops. */
  private dive(r: Racer, land: Vector3, fromSlide: boolean) {
    const H = r.height
    const under = new Vector3(land.x, PIT.surface - 0.62 * H, land.z)
    const n = ++this.diveN
    this.daddyDive = { t: 0 }
    r.arms = 'up'
    r.hopTo(under, fromSlide ? 0.6 : 0.55, fromSlide ? 1.1 : 1.3, () => {
      if (n !== this.diveN) return
      r.kicking = true
      this.pit.splash(land.x, land.z, 26, 1.1, [0, 0.4])
      sfx.balls(1)
      this.after(0.4, () => n === this.diveN && sfx.mmf())
      this.after(1.7, () => {
        if (n !== this.diveN) return
        r.kicking = false
        this.daddyDive = { t: 1 }
        sfx.bloop()
        this.pit.splash(land.x, land.z, 14, 0.8)
        r.hopTo(land, 0.45, 0.6, () => {
          r.land()
          r.arms = 'cheer'
          r.hop()
          // Out he pops (a line at most every 12 s, so it stays a treat).
          if (this.time - this.diveSaid > 12) {
            this.diveSaid = this.time
            this.rev.say(R.dive[n % R.dive.length])
          }
          this.daddyDive = null
          r.flip = 0
        })
      })
    })
  }

  /** She wins: the cheer, the ribbon over her head, then onto the board. */
  private won() {
    this.her.landed = true
    this.me.arms = 'up'
    sfx.cheer()
    this.sparkles.burst(this.me.pos.clone().add(tmp.set(0, 0.9, 0)), 30, 2, 2.6, 1.1, 0.08)
    const n = this.race
    const g = this.newRibbon()
    g.position.copy(this.me.pos).add(tmp.set(0, 1.45, 0.1))
    g.scale.setScalar(0.01)
    this.after(0.35, () => sfx.ribbon())
    this.rev.say(R.win[this.winN++ % R.win.length])
    // A kid cheers her second win; three ribbons, Sparkle says so.
    if (n === 2) this.after(1.6, () => this.rev.say(R.goodRace))
    if (n === 3) this.after(2.0, () => this.rev.say(R.allDone))
    this.flying = { g, t: 0, from: g.position.clone(), to: this.built.slots[Math.min(this.ribbons.length, this.built.slots.length - 1)].clone() }
    this.after(2.0, () => {
      this.rev.won(n)
      if (n >= 3 && !this.allDoneSent) {
        this.allDoneSent = true
        this.rev.allDone()
      }
    })
    this.after(3.4, () => this.next())
  }

  private newRibbon() {
    const g = buildRibbon(this.bag)
    g.userData.pick = 'board'
    this.scene.add(g)
    return g
  }
  private pin(g: Group, now = false) {
    const i = Math.min(this.ribbons.length, this.built.slots.length - 1)
    g.position.copy(this.built.slots[i])
    g.scale.setScalar(1)
    g.rotation.set(0, 0, 0)
    this.ribbons.push(g)
    if (this.ribbons.length > this.built.slots.length) this.ribbons.shift()?.removeFromParent()
    if (!now) {
      sfx.chime()
      this.boardWob = 0
      this.sparkles.burst(g.position.clone(), 14, 1, 1.4, 0.8, 0.05)
    }
  }

  /** Round again: out of the balls, back to the steps. The others go round the back and up; the kids swap turns. */
  private next() {
    // (Wait for everyone to be in the balls, and Daddy to pop out.)
    if (this.runs.some((r) => !r.out) || (this.daddyDive && ++this.waits < 8)) return this.after(0.4, () => this.next())
    this.waits = 0
    this.diveN++
    this.daddyDive = null
    const was = this.race
    this.race++
    this.rev.round(this.race)
    this.newRules()
    this.phase = 'walk'
    this.seated.clear()
    this.climbed = 0
    this.lamp(null)
    for (const s of this.built.stripes) s.mesh.visible = false
    const me = this.me
    me.sitting = false
    me.arms = 'down'
    me.setRing(null, this.bag)
    me.spin = 0
    me.hopTo(v3(PIT_EXIT), 0.45, 0.6, () => {
      me.land()
      me.walkTo(v3(STEPS_FOOT), 2.6, () => {
        me.face(Math.PI)
        if (this.phase === 'walk') this.phase = 'climb'
      })
    })
    OTHERS.forEach((id, i) => {
      const r = this.other(id)
      const raced = id === 'nick' || id === 'ji' || id === kidFor(was)
      if (!raced) {
        // The kid who waited goes up for a turn.
        r.arms = 'down'
        this.after(0.3, () => this.upTheBack(r))
        return
      }
      this.after(0.4 + i * 0.35, () => {
        r.sitting = false
        r.kicking = false
        r.flip = 0
        r.spin = 0
        r.setRing(null, this.bag)
        r.arms = 'down'
        r.stop()
        r.hopTo(new Vector3(PIT.x1 + 0.45, 0, clamp(r.pos.z, 0.2, 1.4)), 0.45, 0.6, () => {
          r.land()
          if (this.racing(id)) this.upTheBack(r)
          else this.toCheer(r)
        })
      })
    })
  }

  /** Round the back of the slide, up the hidden back steps, along the deck to its lane. */
  private upTheBack(r: Racer) {
    const [a, b] = BACK_PATH.map(v3)
    if (Math.abs(r.pos.x - a.x) > 0.3) r.walkTo(a, 2.6)
    r.walkTo(b, 2.8)
    r.hopTo(v3(BACK_TOP), 1.3, 0.6, () => {
      r.land()
      this.sitDown(r, this.laneOf(r.id))
    })
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [...this.built.picks, this.pit.layer, ...[...this.racers.values()].map((r) => r.root), ...this.ribbons]
  }

  protected onTap(id: string | null) {
    const p = this.phase
    if (p === 'race') return this.scoot()
    // Climbing, the steps, the rail beside them and Kaylee herself all take her up (the rail plays its notes too).
    if (p === 'climb' && (id === null || id === 'steps' || id === 'rail' || id === 'kaylee')) {
      if (id === 'rail') this.rail = 0
      return this.climb()
    }
    if (id === null || id === 'kaylee') {
      // Ready, set... she bounces with excitement (the countdown), or giggles.
      if (this.me.busy) return
      this.me.hop()
      if (p === 'count') sfx.boing()
      else sfx.giggle()
      return
    }
    if (id.startsWith('racer:')) return this.pokeRacer(this.other(id.slice(6) as Other))
    if (id.startsWith('flag:')) {
      this.flagSpin[Number(id.slice(5))] = 0
      sfx.flap()
      return
    }
    switch (id) {
      case 'steps':
        sfx.step(Math.floor(Math.random() * 8))
        return
      case 'rail':
        this.rail = 0
        sfx.rail()
        return
      case 'balls': {
        const x = PIT.x0 + 0.5 + Math.random() * (PIT.x1 - PIT.x0 - 1)
        const z = 0.6 + Math.random() * 1.1
        this.pit.splash(x, z, 16, 0.9)
        sfx.balls(0.6)
        for (const r of this.racers.values()) if (this.inPit(r) && !this.daddyDive) r.hop()
        return
      }
      case 'board':
        this.boardWob = 0
        sfx.chime()
        this.sparkles.burst(new Vector3(BOARD.x, BOARD.y, BOARD.z + 0.1), 14, 1, 1.4, 0.8, 0.05)
        return
      case 'lamps':
        this.lampsBlink = 0
        sfx.beep()
        return
    }
  }

  private pokeRacer(r: Racer) {
    // Daddy in the balls: he does it again, head first.
    if (r.id === 'nick' && this.inPit(r) && !r.busy && !this.daddyDive) {
      sfx.babble(RIVALS.nick.pitch)
      return this.dive(r, r.pos.clone(), false)
    }
    if (r.busy) return
    r.hop()
    sfx.babble(RIVALS[r.id as Other].pitch)
    this.sparkles.burst(r.root.position.clone().add(tmp.set(0, r.height, 0)), 6, 0.6, 1, 0.6, 0.04)
  }

  private inPit(r: Racer) {
    const p = r.pos
    return p.x > PIT.x0 && p.x < PIT.x1 && p.z > PIT.z0 && p.z < PIT.z1 && p.y < PIT.wall
  }

  // ---------------------------------------------------------------- per frame

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  private cool = new Map<string, number>()
  private ready(key: string, every: number) {
    if (this.time - (this.cool.get(key) ?? -999) < every) return false
    this.cool.set(key, this.time)
    return true
  }

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    if (this.phase === 'race' || this.phase === 'splash') this.stepRace(dt)
    // ---- The ribbon over her head, then onto the board ----
    if (this.flying) {
      const f = this.flying
      f.t += dt
      const g = f.g
      if (f.t < 1.2) {
        const k = Math.min(1, f.t / 0.45)
        g.scale.setScalar(Math.max(0.01, 1.6 * (k < 1 ? 1 + wobble(k, 2) * 0.3 - (1 - k) : 1)))
        g.position.copy(this.me.root.position).add(tmp.set(0, 1.45 + Math.sin(f.t * 5) * 0.05, 0.1))
        g.rotation.y = Math.sin(f.t * 6) * 0.4
        f.from.copy(g.position)
      } else {
        const k = Math.min(1, (f.t - 1.2) / 0.6)
        g.position.lerpVectors(f.from, f.to, k).y += bell(k) * 0.6
        g.scale.setScalar(1.6 - 0.6 * k)
        g.rotation.y = k * Math.PI * 2
        if (k >= 1) {
          this.flying = null
          this.pin(g)
        }
      }
    }
    // ---- Daddy's dive: over he goes (and back up) ----
    const dad = this.other('nick')
    if (this.daddyDive) {
      const d = this.daddyDive
      if (d.t < 1) {
        d.t = Math.min(0.999, d.t + dt / 0.55)
        dad.flip = Math.PI * Math.min(1, d.t * 1.15)
      } else dad.flip += (0 - dad.flip) * (1 - Math.exp(-dt * 9))
    }
    // ---- Everyone: look at Kaylee (or ahead), and their life ----
    const look = this.me.root.position.clone().setY(this.me.root.position.y + 0.6)
    for (const r of this.racers.values()) {
      if (r !== this.me && this.phase !== 'race') r.lookAt(look)
      r.update(dt, t)
    }
    if (this.phase !== 'race') this.me.lookAt(this.phase === 'climb' ? null : this.other('nick').root.position.clone().setY(1.2))
    // ---- The pit parts round whoever's in it ----
    this.pit.update(dt, [...this.racers.values()].filter((r) => this.inPit(r)).map((r) => ({ x: r.pos.x, z: r.pos.z, r: 0.35 + 0.15 * r.height })))
    // ---- The pokeables ----
    const b = this.built
    this.rail = Math.min(1, this.rail + dt / 0.8)
    b.rail.position.x = Math.sin(this.rail * Math.PI * 8) * 0.03 * (1 - this.rail)
    this.flagSpin.forEach((k, i) => {
      const k2 = Math.min(1, k + dt / 0.7)
      this.flagSpin[i] = k2
      b.flags[i].rotation.y = k2 < 1 ? k2 * Math.PI * 2 : Math.sin(t * 2 + i) * 0.15
    })
    this.lampsBlink = Math.min(1, this.lampsBlink + dt / 0.9)
    if (this.lampsBlink < 1) {
      const i = Math.floor(this.lampsBlink * 6) % 3
      b.lamps.mats.forEach((m, j) => m.color.set(j === i ? ['#FF4F6A', '#FFC83D', '#5BD88A'][j] : '#6D6377'))
      if (this.lampsBlink + dt / 0.9 >= 1 && this.countN === null) this.lamp(null)
    }
    this.boardWob = Math.min(1, this.boardWob + dt / 0.7)
    b.board.rotation.z = Math.sin(this.boardWob * Math.PI * 6) * 0.04 * (1 - this.boardWob)
    for (const g of this.ribbons) g.rotation.z = Math.sin(this.boardWob * Math.PI * 6 + g.position.x * 9) * 0.25 * (1 - this.boardWob) + Math.sin(t * 1.5 + g.position.x * 7) * 0.05
    this.sparkles.update(dt)
    this.puffs.update(dt)
  }

  // ---------------------------------------------------------------- camera, anchors, hint

  protected shot(): Shot {
    const tall = this.w < this.h
    const p = this.me.pos
    switch (this.phase) {
      case 'climb':
      case 'top':
      case 'count':
        // The steps and the top: everyone sitting in their lanes, the flags and the lights.
        // (From a little to her side, so the steps and the bumps show.)
        return tall ? { center: new Vector3(-0.45, 2.15, -7.9), half: new Vector3(2.45, 2.2, 2.1), yaw: YAW, pitch: 12 } : { center: new Vector3(-0.4, 2.1, -7.8), half: new Vector3(2.75, 2.15, 2.3), yaw: YAW, pitch: 12 }
      case 'race': {
        if (this.her.landed) break
        // Following her down: all four lanes across, a little of what's coming.
        const u = clamp((p.z - SLIDE.z0) / SLIDE_LEN)
        return { center: new Vector3(0, p.y + 0.55, Math.min(p.z + 0.9, 0.2)), half: new Vector3(tall ? 1.95 : 2.1, 1.0 + 0.2 * u, 1.5), yaw: YAW, pitch: 13 }
      }
      case 'walk':
        if (p.z < -2.5) return tall ? { center: new Vector3(-0.8, 1.6, p.z - 1.4), half: new Vector3(2.0, 1.6, 2.0), yaw: YAW, pitch: 12 } : { center: new Vector3(-0.6, 1.6, p.z - 1.4), half: new Vector3(2.6, 1.5, 2.0), yaw: YAW, pitch: 12 }
        break
    }
    // The pit, the ribbon board and the kid waiting a turn.
    return tall ? { center: new Vector3(0.35, 1.05, 0.2), half: new Vector3(2.75, 1.25, 1.8), yaw: YAW, pitch: 16 } : { center: new Vector3(0.35, 1.15, -0.2), half: new Vector3(3.2, 1.2, 1.4), yaw: YAW, pitch: 16 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const p = this.phase
    const up = p === 'climb' || p === 'top' || p === 'count'
    switch (id) {
      case 'kaylee': {
        const r = this.me
        const at = r.root.position.clone().add(tmp.set(0, 0.42, 0))
        if (p === 'race') return this.her.landed ? null : { at, r: 0.5, prio: 4, max: 200, glow: this.glowHer() }
        return { at, r: 0.32, prio: 0, max: 130 }
      }
      case 'steps': {
        if (p !== 'climb') return null
        const k = CLIMB_HOPS[Math.min(this.climbed, CLIMB_HOPS.length - 1)]
        const [x, y, z] = stepAt(k)
        return { at: new Vector3(x, y + 0.15, z), r: 0.45, prio: 3, max: 150, glow: true }
      }
      case 'rail':
        return p === 'race' ? null : { at: new Vector3(RAIL_X, stepAt(3)[1] + 0.75, stepAt(3)[2]), r: 0.22, prio: 2 }
      case 'balls':
        return p === 'race' && !this.her.landed ? null : { at: new Vector3(0.9, PIT.surface, 1.55), r: 0.4, prio: 1 }
      case 'board':
        return p === 'race' && !this.her.landed ? null : { at: new Vector3(BOARD.x, BOARD.y, BOARD.z + 0.05), r: 0.42, prio: 1 }
      case 'lamps':
        return up ? { at: new Vector3(LAMPS.x, LAMPS.y + 0.3, LAMPS.z), r: 0.25, prio: 2 } : null
    }
    if (id.startsWith('flag:')) {
      if (!up) return null
      const f = this.built.flags[Number(id.slice(5))]
      return { at: f.position.clone().add(tmp.set(0.2, FLAG_H - 0.2, 0)), r: 0.25, prio: 2, max: 90 }
    }
    if (id.startsWith('racer:')) {
      if (p === 'race') return null
      const r = this.other(id.slice(6) as Other)
      return { at: r.root.position.clone().add(tmp.set(0, (r.flip > 1 ? 0.3 : 0.5) * r.height, 0)), r: 0.3 * r.height, prio: 0, max: 130 }
    }
    return null
  }

  /** Her tap target glows when a tap would make her fly (and at the very first race's start). */
  private glowHer() {
    const run = this.runs.find((r) => r.r === this.me)
    if (!run || run.out) return false
    if (this.race === 1 && this.her.scoots === 0) return true
    if (this.rules < 2) return false
    const d = this.toCrest(run)
    return d !== null && d >= -WINDOW.after && d <= WINDOW.before
  }

  protected hintAt() {
    switch (this.phase) {
      case 'climb': {
        const [x, y, z] = stepAt(CLIMB_HOPS[Math.min(this.climbed, CLIMB_HOPS.length - 1)])
        this.hint(R.hint.climb)
        return new Vector3(x, y + 0.1, z)
      }
      case 'race':
        if (this.her.landed) return null
        this.hint(R.hint.race)
        return this.me.root.position.clone().add(tmp.set(0, 0.3, 0))
    }
    return null
  }
  /** Sparkle's hint, once each time the 👆 shows. */
  private hint(l: string) {
    if (this.hintFor === this.lastTouch) return
    this.hintFor = this.lastTouch
    this.rev.say(l)
  }

  placeAnchors() {
    super.placeAnchors()
    // Showing her what to do the first time: tap her to scoot (race 1), tap at the bump (race 2's first bumps).
    const run = this.runs.find((r) => r.r === this.me)
    this.teach = null
    if (this.phase === 'race' && run && !run.out) {
      if (this.race === 1 && this.her.scoots === 0 && this.her.raceT > 0.7) {
        this.teach = this.me.root.position.clone().add(tmp.set(0, 0.3, 0))
        this.once('scoot', R.scoot)
      }
      if (this.race === 2 && this.her.flights === 0 && this.glowHer()) {
        this.teach = this.me.root.position.clone().add(tmp.set(0, 0.3, 0))
        this.once('now', R.now)
      }
    }
    const hint = this.hintRef
    if (hint && this.teach) {
      const s = this.toScreen(this.teach, 0.3)
      if (s) {
        hint.style.display = ''
        hint.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
      }
    }
    // The ring closing on her before each crest (rounds 2 and 3): tap when it's small and gold.
    const el = this.ringEl
    if (!el) return
    let show = false
    if (this.phase === 'race' && run && !run.out && this.rules >= 2 && !run.air?.big) {
      const d = this.toCrest(run)
      if (d !== null && d <= WINDOW.before + 0.55 && d >= -WINDOW.after) {
        const s = this.toScreen(this.me.root.position.clone().add(tmp.set(0, 0.42, 0)), 0.5, 200)
        if (s) {
          show = true
          const k = clamp(d / (WINDOW.before + 0.55))
          const now = d <= WINDOW.before
          el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(1 + 1.4 * k).toFixed(3)})`
          el.style.width = el.style.height = `${s.size.toFixed(0)}px`
          el.style.borderColor = now ? '#FFC83D' : 'rgba(255,255,255,.9)'
          el.style.boxShadow = now ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : 'none'
        }
      }
    }
    el.style.display = show ? '' : 'none'
  }

  qa() {
    const run = this.runs.find((r) => r.r === this.me)
    const scr = (p: Vector3) => {
      const s = this.toScreen(p, 0)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    return {
      game: 'race',
      phase: this.phase,
      race: this.race,
      round: this.rules,
      climbed: this.climbed,
      u: run ? Number(run.u.toFixed(3)) : null,
      others: Object.fromEntries(this.runs.filter((r) => r.r !== this.me).map((r) => [r.r.id, Number(r.u.toFixed(3))])),
      crest: run?.crest ?? null,
      toCrest: run && !run.out ? this.toCrest(run) : null,
      window: this.glowHer(),
      speed: Number(this.her.v.toFixed(2)),
      scoots: this.her.scoots,
      flights: this.her.flights,
      ribbons: this.ribbons.length,
      count: this.countN,
      kaylee: scr(this.me.root.position.clone().add(tmp.set(0, 0.42, 0))),
      steps: this.phase === 'climb' ? scr(v3(stepAt(CLIMB_HOPS[Math.min(this.climbed, CLIMB_HOPS.length - 1)]))) : null,
      touches: this.touches,
    }
  }
}
