// The Sky Pod at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "8. The Sky Pod"), greybox shapes
// with voices (lines.ts `L.mall.skypod`: Daddy's race lines, Sparkle's count and few lines, said through
// blocks/talk.ts). A wall of nine light-up pods painted as a night sky, a scoreboard, Kaylee in her grip socks on the
// springy mat in front, Daddy watching from the side (and racing her in round 3).
//
// The toy: slap a pod. It reacts the moment her finger lands: it squashes into the wall, flashes, plays its own note
// (left to right they climb a scale, so the wall is an instrument), and sparks fly. Kaylee bounces over to it on the
// mat and slaps it too: a jump for the high ones, her arm reaching up. A finger sliding across the pods plays them all.
// The rules (which pods are lit, the score, the pattern, Daddy's race) are game.ts.
// Nothing fails: lights wait for her, a wrong pod is a funny note, Daddy never wins.
// Pokeables: the scoreboard (its numbers wave), the speaker (a beat to play along to: the pods and Daddy bob), the
// rocket on top (it rumbles and hops), the moon (it rocks, the painted stars twinkle), Kaylee, Daddy, the mat (she
// bounces there). A pod slapped five times fast pops out on its spring.
import { Color, IcosahedronGeometry, OctahedronGeometry, Plane, Raycaster, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../../sdk'
import type { AnchorInfo } from '../../../../engine/Anchors'
import type { Shot } from '../../../../engine/camera'
import { PAL } from '../../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../../trip/legs/stage'
import { SOCK_COLORS, wearSocks } from '../../socks'
import { Racer } from '../race/racer'
import { buildSkyPod, MAT_Y, type Built, type Layer } from './build'
import { Floaters } from './fx'
import { FINALE_SCORE, SkyGame, type GameView, type Light, type Phase, type SlapResult } from './game'
import { Talk } from '../blocks/talk'
import { L } from '../../../../lines'
import { BESIDE, BLUE, boardSpot, DADDY_REACH, DADDY_Z, daddyHome, KAYLEE_Z, kayleeHome, matX, moonSpot, PINK, POD_COLORS, PODS, podSpots, REACH, rocketSpot, SHOW, speakerSpot, TAP_R, wallSize, type Round, type V3 } from './layout'
import { Pods } from './pods'
import { podSfx as sfx } from './sounds'

export interface SkyEvents extends LegEvents {
  /** The round on now (the address bar follows). */
  round(n: Round): void
  /** The scoreboard: hers, and Daddy's (round 3). */
  score(kaylee: number, daddy: number): void
  stars(n: number): void
  phase(p: Phase): void
  /** Round 1 done: the 💡 sticker on her sock band. */
  sticker(): void
  /** A light got: a "+1" floats up from there (screen pixels). */
  plus(x: number, y: number, who: 'kaylee' | 'daddy'): void
  /** All three rounds done (the 🛝 back to the hall shows; the wall stays open). */
  allDone(): void
}
export interface SkyStart {
  round: Round
  socks: string
}

export const SKYPOD_ANCHORS: AnchorInfo[] = [
  ...Array.from({ length: PODS }, (_, i): AnchorInfo => ({ id: `pod:${i}`, label: `Light ${i + 1}`, kind: 'thing' })),
  { id: 'board', label: 'The scoreboard', kind: 'thing' },
  { id: 'speaker', label: 'The speaker', kind: 'thing' },
  { id: 'rocket', label: 'The rocket', kind: 'thing' },
  { id: 'moon', label: 'The moon', kind: 'thing' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
]

const V = (x: number, y: number, z: number) => new Vector3(x, y, z)
const tmp = new Vector3()
const T = L.mall.skypod
const WHITE = new Color('#FFFFFF')
const GOLD = new Color(PAL.gold)
const RING = new Color('#F4EEFF')
const RING_BLUE = new Color('#BFE3FF')
const C_PINK = new Color(PINK)
const C_BLUE = new Color(BLUE)
const C_SHOW = new Color(SHOW)
const OWN = POD_COLORS.map((c) => new Color(c))
/** Unlit: a dark version of the pod's own color, so the wall still shows the rainbow of notes. */
const DIM = OWN.map((c) => c.clone().lerp(new Color('#2A2450'), 0.7))
const SPIN_SIDE = Math.PI / 2 + 0.45

/** A jump to slap a pod: who, which, how far through, and which arm reaches. */
interface Reach {
  i: number
  t: number
  dur: number
  side: number
  hit: boolean
  miss?: boolean
}

export class SkyPodWall extends Stage {
  private built: Built
  private layer: Layer
  private pods: Pods
  private game: SkyGame
  private kaylee: Racer
  private nick: Racer
  private tall = false
  private sized = false
  private spots: V3[] = podSpots(false)
  private sparks: Floaters
  private puffs: Floaters
  // ---- Each pod: its spring (pressed in, bulging out), its pop-out spring, its spin, its flash and note glow ----
  private press = Array.from({ length: PODS }, () => ({ x: 0, v: 0 }))
  private out = Array.from({ length: PODS }, () => ({ x: 0, v: 0 }))
  private spin = Array.from({ length: PODS }, () => ({ x: 0, v: 0 }))
  private flash = new Array(PODS).fill(0)
  private glow = new Array(PODS).fill(0)
  private recent: number[][] = Array.from({ length: PODS }, () => [])
  // ---- Kaylee's and Daddy's jumps ----
  private kj: Reach | null = null
  private kq = -1
  private dj: Reach | null = null
  private dGoing = -1
  private dAnim: { kind: number; t: number } | null = null
  private dCheer = 0
  private hits = 0
  // ---- The toys ----
  private beat = { on: false, t: 0, n: 0, k: 0 }
  private rocket = { t: -1 }
  private moon = { a: 0, v: 0, twinkle: -1 }
  private finaleT = -1
  private freeRainbow = 0
  // ---- Touch ----
  private downPod = -1
  private swipe = -1
  private ray = new Raycaster()
  private matPlane = new Plane(new Vector3(0, 1, 0), -MAT_Y)
  private boardEl: HTMLElement | null = null
  private phaseNow: Phase = 'play'
  private starsShown = -1
  private talk = new Talk((l) => this.sev.say(l))
  private rounds = 0

  constructor(
    renderer: WebGLRenderer,
    private sev: SkyEvents,
    start: SkyStart,
  ) {
    super(renderer, sev)
    const { scene, bag } = this
    scene.background = new Color('#2E2748')
    this.rig.fov = 30
    this.built = buildSkyPod(bag)
    this.layer = this.built.wide
    scene.add(this.built.root)
    this.pods = new Pods(bag)
    scene.add(this.pods.root)
    // ---- Kaylee in her grip socks on the mat; Daddy watching from the side ----
    this.kaylee = new Racer('kaylee', bag)
    // On the climbing wall: her wings stay folded flat so her hooves show.
    this.kaylee.tuck = true
    wearSocks(this.kaylee, SOCK_COLORS[start.socks] ?? SOCK_COLORS.pink, bag)
    this.kaylee.root.userData.pick = 'family:kaylee'
    this.nick = new Racer('nick', bag)
    this.nick.root.userData.pick = 'family:nick'
    scene.add(this.kaylee.root, this.nick.root)
    this.sparks = new Floaters(new OctahedronGeometry(0.5), [...POD_COLORS, '#FFFFFF', PAL.gold], 220, bag, 2.0, 1.2)
    this.puffs = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E9E1FF', '#DDF1FF'], 50, bag, -0.4, 2.6)
    scene.add(this.sparks.mesh, this.puffs.mesh)
    this.applyLayout(false)
    this.game = new SkyGame(this.view(), start.round, () => this.spots.map((s) => s[1]))
    this.game.begin()
  }

  // ---------------------------------------------------------------- the screen's shape

  setSize(w: number, h: number, top: number) {
    const tall = w < h
    if (tall !== this.tall || !this.sized) {
      this.sized = true
      this.applyLayout(tall)
    }
    super.setSize(w, h, top)
  }

  /** An arch of pods on a wide screen, a three-by-three on a tall one: everyone back to their places. */
  private applyLayout(tall: boolean) {
    this.tall = tall
    this.spots = podSpots(tall)
    this.pods.setSpots(this.spots)
    this.built.wide.root.visible = !tall
    this.built.tall.root.visible = tall
    this.layer = tall ? this.built.tall : this.built.wide
    this.kj = null
    this.kq = -1
    const k = kayleeHome(tall)
    this.kaylee.place(k[0], MAT_Y, k[2], 0.25)
    this.dj = null
    this.dGoing = -1
    const d = this.daddySpot()
    this.nick.place(d[0], MAT_Y, d[2], -0.5)
  }

  /** Where Daddy stands between slaps: at the side of the wall, out of the way of the pods. */
  private daddySpot(): V3 {
    const h = daddyHome(this.tall)
    return [h[0], MAT_Y, h[2]]
  }

  // ---------------------------------------------------------------- what the rules say

  private view(): GameView {
    return {
      lit: (i, kind) => {
        this.flash[i] = Math.max(this.flash[i], 0.5)
        this.out[i].v += 1.2
        if (kind === 'blue') sfx.popBlue()
        else if (kind === 'lit') sfx.pop(i)
      },
      show: (i) => {
        sfx.note(i, true)
        this.flash[i] = 1
        this.press[i].v += 8
        this.glow[i] = 1
        this.sparks.ring(this.podAt3(i), 8, 1.3, 0.5, 0.05, i)
      },
      hit: (i, who) => this.got(i, who),
      wrong: () => {
        this.nick.wiggle()
        this.later(0.25, () => sfx.haha())
      },
      score: (k, d) => {
        if (this.phaseNow === 'finale') sfx.tick(k % 60)
        if (this.phaseNow === 'finale' && k === FINALE_SCORE) this.later(0.3, () => this.talk.say(T.hundred))
        this.sev.score(k, d)
      },
      phase: (p) => {
        this.phaseNow = p
        this.sev.phase(p)
        // Round 2: the wall has played its first tune, now it's her turn.
        if (p === 'copy') this.talk.once('play', T.play)
      },
      round: (n) => {
        this.sev.round(n)
        this.roundLine(n)
      },
      stars: (n) => {
        // (Each round's start says the stars again: only a new one twinkles in.)
        const more = n > this.starsShown
        this.starsShown = n
        if (more && this.time > 0.5) {
          sfx.star()
          this.kaylee.hop()
          this.nick.arms = 'cheer'
          this.dCheer = 1.2
          this.sparks.burst(V(0, boardSpot(this.tall).at[1], 0.2), 22, 1.6, 1.8, 1.0, 0.05)
        }
        this.sev.stars(n)
      },
      sticker: () => this.sev.sticker(),
      daddyIn: (on) => {
        // Round 3: he hops, ready to race ("let's go!"); after it, back to his place at the side.
        const d = this.daddySpot()
        this.nick.stop()
        this.nick.sitting = false
        this.nick.hopTo(V(d[0], MAT_Y, d[2]), 0.5, on ? 0.45 : 0.25, () => this.nick.face(-0.3))
        if (on) {
          sfx.boing()
          this.nick.arms = 'cheer'
          this.dCheer = 1.0
        }
      },
      daddyGo: (i, miss) => this.daddyGo(i, miss),
      daddyDawdle: (kind) => {
        this.dAnim = { kind: kind % 4, t: 0 }
        this.nick.face(0)
        if (kind % 4 === 1) this.nick.sitting = true
        // Sitting down for a rest, he says so (now and then); otherwise a laugh.
        if (!(kind % 4 === 1 && this.talk.react(this.time, T.rest))) sfx.haha()
      },
      daddyHey: () => {
        // (Already reaching up, he finishes the jump: his hand finds nothing there.)
        if (!this.dj) this.nick.stop()
        this.dGoing = -1
        this.nick.wiggle()
        this.nick.lookAt(this.kaylee.pos.clone().setY(0.8))
        if (this.talk.react(this.time, T.mine)) return this.backToSide()
        sfx.hey()
        this.later(0.7, () => sfx.haha())
        this.backToSide()
      },
      copied: () => {
        sfx.copied()
        this.kaylee.hop()
        this.nick.arms = 'cheer'
        this.dCheer = 1.0
      },
      win: () => {
        sfx.cheer()
        this.kaylee.hop()
        // Daddy hurries back to the side (out of the way of the board and the pods) and flops down, cheering.
        this.nick.stop()
        this.dj = null
        this.dGoing = -1
        const h = this.daddySpot()
        this.nick.walkTo(V(h[0], MAT_Y, h[2]), 2.4, () => {
          this.nick.face(-0.3)
          this.nick.sitting = true
        })
        this.nick.arms = 'cheer'
        this.dCheer = 2.0
        this.later(0.3, () => this.talk.say(T.win))
      },
      finale: () => {
        this.finaleT = 0
        sounds.fanfare()
        this.nick.sitting = false
        this.nick.arms = 'up'
        this.dCheer = 3.2
        for (let k = 0; k < 4; k++) this.later(k * 0.45, () => this.sparks.burst(V((k - 1.5) * 1.2, wallTop(this.tall), 0.3), 26, 2.4, 2.6, 1.4, 0.06))
      },
      allDone: () => {
        this.freeRainbow = 1.5
        this.sev.allDone()
      },
    }
  }

  /** After his "hey!": back to his place at the side. */
  private backToSide() {
    this.later(0.9, () => {
      if (this.dGoing >= 0 || this.dj) return
      const h = this.daddySpot()
      this.nick.walkTo(V(h[0], MAT_Y, h[2]), 1.3, () => this.nick.face(-0.3))
    })
  }

  /** What's said when a round starts: the opening (Daddy, then "Slap the lights!"), "Listen!" before the wall plays,
   *  Daddy's "Race you!". The first one waits a moment for the screen to settle. */
  private roundLine(n: Round) {
    const first = this.rounds++ === 0
    const go = () => {
      if (n === 1) {
        this.talk.say(T.fast)
        this.later(2.0, () => this.talk.say(T.slap))
      } else this.talk.say(n === 2 ? T.listen : T.race)
    }
    if (first) this.later(0.5, go)
    else go()
  }

  /** Someone got a light: the big sparks, the "+1", Daddy cheering her now and then. */
  private got(i: number, who: 'kaylee' | 'daddy') {
    // Sparkle counts her score as it climbs in rounds 1 and 3 (not over anyone talking).
    const g = this.game
    if (who === 'kaylee' && g.phase === 'play' && g.round !== 2) this.talk.count(T.count[g.score - 1])
    const at = this.podAt3(i)
    this.sparks.ring(at, 16, 2.0, 0.6, 0.065, who === 'daddy' ? 6 : i)
    this.sparks.burst(at, 6, 0.6, 1.2, 0.7, 0.04)
    const s = this.toScreen(at, 0.1)
    if (s) this.sev.plus(s.x, s.y, who)
    if (who === 'kaylee' && ++this.hits % 3 === 0 && this.game.round !== 3) {
      this.nick.arms = 'cheer'
      this.dCheer = 0.9
    }
  }

  private timers: { at: number; f: () => void }[] = []
  private later(s: number, f: () => void) {
    this.timers.push({ at: this.time + s, f })
  }

  private podAt3(i: number) {
    const s = this.spots[i]
    return V(s[0], s[1], s[2] + 0.12)
  }

  // ---------------------------------------------------------------- a slap

  /** Her finger on pod `i`: it reacts at once (squash, flash, note, sparks), then Kaylee bounces over and slaps it. */
  private slapPod(i: number) {
    this.touches++
    this.lastTouch = this.time
    const r: SlapResult = this.game.slap(i)
    this.podJuice(i, r)
    this.kayleeTo(i)
  }

  private podJuice(i: number, r: SlapResult | 'daddy') {
    this.press[i].v += 16
    this.flash[i] = 1
    this.glow[i] = 1
    sfx.slap()
    if (r === 'wrong') {
      sfx.funny(i)
      this.spin[i].v += 9
    } else sfx.note(i, r !== 'note')
    if (r === 'note') this.sparks.ring(this.podAt3(i), 7, 1.2, 0.45, 0.045, i)
    // Five slaps on the same pod in a moment: it pops out on its spring, boing.
    const now = this.time
    const rec = this.recent[i].filter((t) => now - t < 1.6)
    rec.push(now)
    this.recent[i] = rec
    if (rec.length >= 5) {
      this.recent[i] = []
      this.out[i].v += 5
      this.spin[i].v += 14
      this.later(0.05, () => sfx.sproing())
      this.later(0.4, () => {
        this.kaylee.hop()
        sfx.giggle()
      })
    }
  }

  /** Kaylee bounces over beside pod `i` (the side she's on) and jumps to slap it. Busy: she does it next. */
  private kayleeTo(i: number) {
    if (this.kj || this.kaylee.busy) {
      this.kq = i
      return
    }
    const k = this.kaylee
    const [px, py] = this.spots[i]
    const [x0, x1] = matX(this.tall)
    const side = k.pos.x <= px ? -1 : 1
    const sx = clamp(px + side * BESIDE, x0, x1)
    const dist = Math.abs(sx - k.pos.x)
    const rise = Math.max(0.1, py - REACH)
    const jump = () => {
      // Turned to the pod and the wall (so we see her face), the arm on our side reaching up.
      k.face(side < 0 ? SPIN_SIDE : -SPIN_SIDE)
      const dur = 0.34 + rise * 0.2
      this.kj = { i, t: 0, dur, side, hit: false }
      sfx.spring(rise)
      k.hopTo(V(sx, MAT_Y, KAYLEE_Z), dur, rise, () => this.kLanded())
    }
    if (dist > 0.06) k.hopTo(V(sx, MAT_Y, KAYLEE_Z), clamp(0.14 + dist * 0.09, 0.16, 0.4), 0.08 + Math.min(dist, 2) * 0.06, jump)
    else jump()
  }

  private kLanded() {
    // Back round to us a little (so we see her face) until the next one.
    if (this.kj) this.kaylee.face(this.kj.side < 0 ? 0.75 : -0.75)
    this.kj = null
    this.kaylee.land()
    this.puffs.burst(this.kaylee.pos.clone().setY(MAT_Y + 0.02), 4, 0.6, 0.2, 0.4, 0.06)
    if (this.kq >= 0) {
      const n = this.kq
      this.kq = -1
      this.kayleeTo(n)
    }
  }

  /** Daddy walks over to his blue light (the far side of it from her) and slaps it, or (`miss`) the wall beside it. */
  private daddyGo(i: number, miss: boolean) {
    const d = this.nick
    const [px] = this.spots[i]
    const [x0, x1] = matX(this.tall)
    const side = px >= this.kaylee.pos.x ? 1 : -1
    const sx = clamp(px + side * 0.45, x0, x1 + 0.25)
    this.dGoing = i
    this.dAnim = null
    d.sitting = false
    d.stop()
    const reach = () => {
      if (this.game.daddyTarget !== i) return void (this.dGoing = -1)
      const rise = Math.max(0.04, this.spots[i][1] - DADDY_REACH)
      d.face(side > 0 ? -SPIN_SIDE : SPIN_SIDE)
      const dur = 0.42 + rise * 0.3
      this.dj = { i, t: 0, dur, side: -side, hit: false, miss }
      d.hopTo(V(sx, MAT_Y, DADDY_Z), dur, rise + 0.04, () => {
        this.dj = null
        this.dGoing = -1
        d.land()
        // Back to his place at the side (so he doesn't hide the pods), a little slower.
        const h = this.daddySpot()
        d.walkTo(V(h[0], MAT_Y, h[2]), 1.3, () => d.face(-0.3))
      })
    }
    if (Math.abs(sx - d.pos.x) > 0.08 || Math.abs(d.pos.z - DADDY_Z) > 0.08) d.walkTo(V(sx, MAT_Y, DADDY_Z), 1.5, reach)
    else reach()
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.kaylee.root, this.nick.root]
  }

  /** The pod under a screen point (within its tap circle), or -1. */
  private podUnder(x: number, y: number) {
    let best = -1
    let bestD = Infinity
    for (let i = 0; i < PODS; i++) {
      const s = this.toScreen(V(...this.spots[i]), TAP_R, 170)
      if (!s) continue
      const d = Math.hypot(s.x - x, s.y - y)
      if (d < s.size / 2 && d < bestD) {
        best = i
        bestD = d
      }
    }
    return best
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.downPod = -1
    this.swipe = -1
    if (x === undefined || y === undefined) return
    const i = id?.startsWith('pod:') ? Number(id.slice(4)) : id ? -1 : this.podUnder(x, y)
    if (i < 0) return
    this.slapPod(i)
    this.downPod = i
    this.swipe = i
  }

  /** A finger sliding across the wall plays every pod it crosses (a glissando). */
  pointerMove(x: number, y: number, _dx: number, _dy: number, held: boolean) {
    if (!held || this.downPod < 0) return
    const j = this.podUnder(x, y)
    if (j >= 0 && j !== this.swipe) this.slapPod(j)
    this.swipe = j
  }

  pointerUp() {
    this.swipe = -1
  }

  tap(x: number, y: number, id?: string) {
    // The slap already happened when the finger went down.
    if (this.downPod >= 0) {
      this.downPod = -1
      this.lastTouch = this.time
      return
    }
    // (A keyboard press on a pod's button.)
    if (id?.startsWith('pod:')) return this.slapPod(Number(id.slice(4)))
    super.tap(x, y, id)
  }

  protected onTap(id: string | null, x: number, y: number) {
    switch (id) {
      case 'board':
        sfx.board()
        // The first poke: counting in Thai.
        this.later(0.3, () => this.talk.once('thai', T.thai))
        this.boardEl?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12) rotate(-3deg)' }, { transform: 'scale(0.96) rotate(2deg)' }, { transform: 'scale(1)' }], { duration: 450, composite: 'add' })
        return
      case 'speaker':
        this.beat.on = !this.beat.on
        this.beat.t = 0.5
        this.beat.n = 0
        if (!this.beat.on) sfx.thump()
        return
      case 'rocket':
        if (this.rocket.t < 0) {
          this.rocket.t = 0
          sfx.rocket()
        }
        return
      case 'moon':
        this.moon.v += 3
        this.moon.twinkle = 0
        sfx.moon()
        return
      case 'kaylee':
      case 'family:kaylee':
        if (!this.kaylee.busy) {
          this.kaylee.hopTo(this.kaylee.pos, 0.6, 0.7, () => this.kaylee.land())
          sfx.spring(0.6)
          this.later(0.2, () => sfx.giggle())
        }
        return
      case 'family:nick':
        this.nick.hop()
        sfx.haha()
        return
    }
    // The mat: she bounces over there.
    this.ray.setFromCamera(this.ndc(x, y), this.rig.camera)
    const hit = this.ray.ray.intersectPlane(this.matPlane, tmp)
    const [x0, x1] = matX(this.tall)
    if (hit && !this.kaylee.busy && !this.kj && hit.z > -0.2 && hit.z < 1.4) {
      const tx = clamp(hit.x, x0, x1)
      this.kaylee.hopTo(V(tx, MAT_Y, KAYLEE_Z), 0.3 + Math.abs(tx - this.kaylee.pos.x) * 0.08, 0.35, () => this.kaylee.land())
      sfx.spring(0.3)
    }
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    for (const tm of [...this.timers]) {
      if (this.time < tm.at) continue
      this.timers.splice(this.timers.indexOf(tm), 1)
      tm.f()
    }
    this.game.update(dt)
    const k = this.kaylee
    const d = this.nick

    // ---- Kaylee: watching the lit pods, her arm reaching up in a jump ----
    const hint = this.game.hint
    const lookPod = this.kj ? this.kj.i : hint >= 0 ? hint : this.game.lights.findIndex((l) => l !== 'off')
    // (Between jumps she glances that way over her shoulder, a point pulled toward us, so we still see her face.)
    k.lookAt(lookPod >= 0 ? this.podAt3(lookPod).setZ(this.kj ? 0.1 : 2.4) : d.pos.clone().setY(1.2))
    k.update(dt, t)
    if (this.kj) {
      const j = this.kj
      j.t += dt
      const p = clamp(j.t / j.dur)
      if (!j.hit && p >= 0.48) {
        j.hit = true
        this.press[j.i].v += 6
        this.sparks.burst(this.podAt3(j.i), 3, 0.5, 0.6, 0.4, 0.035)
      }
      this.reachArm(k, j, p)
    }

    // ---- Daddy: cheering, dawdling, walking over to his lights, reaching up ----
    if (this.dCheer > 0) {
      this.dCheer -= dt
      if (this.dCheer <= 0) d.arms = 'down'
    }
    if (this.dAnim) {
      const a = this.dAnim
      a.t += dt
      if (a.kind === 0) {
        // A little dance: arms up, hopping.
        d.arms = 'up'
        if (Math.floor(a.t / 0.5) !== Math.floor((a.t - dt) / 0.5)) d.hop()
      } else if (a.kind === 2) d.arms = 'cheer'
      else if (a.kind === 3 && a.t < 0.1) d.wiggle()
      if (a.t > 2.2) {
        this.dAnim = null
        d.arms = 'down'
        d.sitting = false
      }
    }
    if (!this.dj && !d.busy && !this.dAnim) d.lookAt(k.pos.clone().setY(k.pos.y + 0.6))
    else if (this.dGoing >= 0) d.lookAt(this.podAt3(this.dGoing))
    // The beat: he bobs along when he's free.
    d.update(dt, t)
    if (this.dj) {
      const j = this.dj
      j.t += dt
      const p = clamp(j.t / j.dur)
      if (!j.hit && p >= 0.5) {
        j.hit = true
        if (this.game.daddyTarget === j.i) {
          if (j.miss) {
            sfx.oops()
            this.talk.react(this.time, T.ow)
            d.wiggle()
            const s = this.spots[j.i]
            this.puffs.burst(V(s[0] + j.side * -0.32, s[1], 0.1), 5, 0.5, 0.3, 0.4, 0.06)
          } else this.podJuice(j.i, 'daddy')
          this.game.daddySlap(j.i, !!j.miss)
        }
      }
      this.reachArm(d, j, p)
    }

    // ---- The toys: the speaker's beat, the rocket, the moon and its stars ----
    this.toys(dt, t)

    // ---- The pods ----
    this.podsFrame(dt, t)
    this.sparks.update(dt)
    this.puffs.update(dt)
    this.lights.follow(0, 1.2, 0)
    // The 👆 after a while with nothing touched: Sparkle says what to slap, once each time it shows.
    this.talk.hint(this.time, this.lastTouch, () => this.game.hint >= 0, () => (this.game.phase === 'copy' ? T.hint.next : T.hint.lit))
  }

  /** The arm on our side reaches up to the pod and slaps, then comes back down. */
  private reachArm(r: Racer, j: Reach, p: number) {
    const up = span(p, 0.05, 0.42) * (1 - span(p, 0.62, 0.95))
    const slap = bell(span(p, 0.38, 0.62))
    // Facing +x (pod on the right), the arm on the camera's side is her left (the rig's -x).
    const arm = j.side < 0 ? r.rig.armL : r.rig.armR
    arm.rotation.set(-2.5 * up - 0.4 * slap, 0, (j.side < 0 ? -1 : 1) * 0.25 * up)
  }

  private toys(dt: number, t: number) {
    const L = this.layer
    const b = this.beat
    b.k = Math.max(0, b.k - dt * 5)
    if (b.on) {
      b.t += dt
      if (b.t >= 0.25) {
        b.t -= 0.25
        if (b.n % 2 === 0) {
          sfx.kick()
          b.k = 1
          if (b.n % 4 === 0 && !this.nick.busy && !this.dj) this.nick.hop()
        } else sfx.hat()
        b.n++
      }
    }
    L.cone.scale.setScalar(1 + b.k * 0.18)
    L.speaker.scale.set(1 + b.k * 0.03, 1 - b.k * 0.03, 1)
    // The rocket: rumbles, hops up on its flame, lands.
    if (this.rocket.t >= 0) {
      const r = this.rocket
      r.t += dt
      const [rx, ry, rz] = rocketSpot(this.tall)
      const shake = r.t < 0.5 ? Math.sin(r.t * 80) * 0.03 : 0
      const lift = r.t > 0.45 ? bell(span(r.t, 0.45, 1.5)) * 0.55 : 0
      L.rocket.position.set(rx + shake, ry + lift, rz)
      L.rocket.rotation.z = r.t > 1.5 ? wobble(span(r.t, 1.5, 2.0), 2) * 0.15 : 0
      L.flame.visible = r.t > 0.3 && r.t < 1.4
      L.flame.scale.setScalar(0.8 + Math.sin(t * 40) * 0.25)
      if (r.t > 0.45 && r.t - dt <= 0.45) this.puffs.burst(V(rx, ry + 0.05, rz + 0.1), 8, 0.8, 0.2, 0.6, 0.08)
      if (r.t > 2.0) {
        r.t = -1
        L.rocket.position.set(rx, ry, rz)
        L.rocket.rotation.z = 0
        L.flame.visible = false
        sfx.thump()
      }
    }
    // The moon rocks on its hook; the painted stars twinkle.
    const m = this.moon
    m.v += (-m.a * 16 - m.v * 2.2) * dt
    m.a += m.v * dt
    L.moon.rotation.z = m.a * 0.3
    const [mx, my, mz] = moonSpot(this.tall)
    L.moon.position.set(mx, my, mz)
    if (m.twinkle >= 0) {
      m.twinkle += dt
      L.stars.scale.setScalar(1)
      L.stars.position.z = Math.sin(m.twinkle * 18) * 0.01
      if (Math.floor(m.twinkle / 0.2) !== Math.floor((m.twinkle - dt) / 0.2) && m.twinkle < 1.2) this.sparks.burst(V(mx + (Math.random() - 0.5) * 2, my - Math.random() * 1.2, 0.1), 3, 0.4, 0.4, 0.5, 0.04)
      if (m.twinkle > 1.3) m.twinkle = -1
    }
    // (The speaker sits where the layout says.)
    const sp = speakerSpot(this.tall)
    L.speaker.position.x = sp[0]
  }

  private podsFrame(dt: number, t: number) {
    const g = this.game
    const round3 = g.round === 3 && (this.phaseNow === 'play' || this.phaseNow === 'cheer')
    if (this.finaleT >= 0) this.finaleT += dt
    const rainbow = this.finaleT >= 0 && this.finaleT < 3.6
    this.freeRainbow = Math.max(0, this.freeRainbow - dt)
    for (let i = 0; i < PODS; i++) {
      // Springs: pressed in (bulging back out past rest), popped out (boing), spinning.
      const pr = this.press[i]
      pr.v += (-pr.x * 320 - pr.v * 16) * dt
      pr.x = clamp(pr.x + pr.v * dt, -0.45, 1)
      const o = this.out[i]
      o.v += (-o.x * 60 - o.v * 3.2) * dt
      o.x = clamp(o.x + o.v * dt, -0.05, 0.7)
      const sp = this.spin[i]
      sp.v += (-sp.x * 90 - sp.v * 5) * dt
      sp.x += sp.v * dt
      this.flash[i] = Math.max(0, this.flash[i] - dt / 0.2)
      this.glow[i] = Math.max(0, this.glow[i] - dt / 0.7)
      const look = this.pods.looks[i]
      const l: Light = g.lights[i]
      const pulse = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.3)
      let halo = 0
      look.dome.copy(DIM[i])
      look.ring.copy(RING)
      if (l === 'lit') {
        look.dome.lerp(round3 ? C_PINK : OWN[i], 0.82 + 0.18 * pulse)
        look.ring.copy(GOLD)
        halo = 0.65 + 0.35 * pulse
      } else if (l === 'blue') {
        look.dome.copy(C_BLUE)
        look.ring.copy(RING_BLUE)
        halo = 0.55 + 0.25 * pulse
      } else if (l === 'show') {
        look.dome.copy(OWN[i]).lerp(C_SHOW, 0.25)
        look.ring.copy(GOLD)
        halo = 1
      } else if (l === 'help') {
        const h = 0.5 + 0.5 * Math.sin(t * 4)
        look.dome.lerp(OWN[i], 0.3 + 0.35 * h)
        look.ring.lerp(GOLD, h)
        halo = 0.3 * h
      }
      const gl = this.glow[i]
      if (gl > 0 && l !== 'lit' && l !== 'blue') {
        look.dome.lerp(OWN[i], gl)
        halo = Math.max(halo, gl * 0.8)
      }
      if (rainbow || this.freeRainbow > 0) {
        const w = 0.5 + 0.5 * Math.sin(t * 9 - i * 0.9)
        const k = rainbow ? 1 : this.freeRainbow / 1.5
        if (l === 'off') {
          look.dome.lerp(OWN[i], (0.45 + 0.55 * w) * k)
          halo = Math.max(halo, w * k)
          look.ring.lerp(GOLD, w * k)
        }
      }
      if (this.beat.k > 0) look.ring.lerp(WHITE, this.beat.k * 0.6)
      look.dome.lerp(WHITE, this.flash[i] * 0.8)
      look.halo = halo
      look.press = pr.x
      look.out = o.x
      look.spin = sp.x * 0.25
    }
    this.pods.update()
  }

  // ---------------------------------------------------------------- camera, anchors, the board

  protected shot(): Shot {
    // Tall: the three-by-three, the board on top, Kaylee and Daddy at the bottom.
    if (this.tall) return { center: V(0, 2.3, 0.3), half: V(2.2, 2.3, 0.15), yaw: 0, pitch: 5, minDist: 5 }
    // Wide: the whole arch, the speaker on the left, Daddy on the right.
    return { center: V(0, 1.6, 0.3), half: V(4.0, 1.6, 0.15), yaw: 0, pitch: 5, minDist: 5 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id.startsWith('pod:')) {
      const s = this.spots[Number(id.slice(4))]
      return s ? { at: V(s[0], s[1], s[2]), r: TAP_R, max: 170, prio: 3 } : null
    }
    switch (id) {
      case 'board': {
        const b = boardSpot(this.tall)
        return { at: V(...b.at), r: Math.min(b.w, b.h) * 0.5, max: 150, prio: 1 }
      }
      case 'speaker': {
        const s = speakerSpot(this.tall)
        return { at: V(s[0], (this.tall ? 0.45 : 0.55) + (this.tall ? MAT_Y : 0), s[2] + 0.2), r: this.tall ? 0.26 : 0.32, max: 140, prio: 1 }
      }
      case 'rocket':
        return { at: this.layer.rocket.position.clone().setY(this.layer.rocket.position.y + 0.35), r: 0.24, max: 120, prio: 1 }
      case 'moon': {
        const s = moonSpot(this.tall)
        return { at: V(s[0], s[1], s[2] + 0.05), r: 0.24, max: 120, prio: 1 }
      }
      case 'family:kaylee':
        return { at: this.kaylee.root.position.clone().setY(this.kaylee.root.position.y + 0.42), r: 0.3, max: 120, prio: 0 }
      case 'family:nick':
        return { at: this.nick.root.position.clone().setY(this.nick.root.position.y + 0.85), r: 0.36, max: 130, prio: 0 }
    }
    return null
  }

  /** The scoreboard's numbers (HTML), laid over its dark screen. */
  setBoard(el: HTMLElement | null) {
    this.boardEl = el
  }

  placeAnchors() {
    super.placeAnchors()
    const el = this.boardEl
    if (!el) return
    const b = boardSpot(this.tall)
    const cam = this.rig.camera
    const c = V(...b.at).project(cam)
    const r = V(b.at[0] + b.w / 2, b.at[1], b.at[2]).project(cam)
    const u = V(b.at[0], b.at[1] + b.h / 2, b.at[2]).project(cam)
    const x = ((c.x + 1) / 2) * this.w
    const y = ((1 - c.y) / 2) * this.h
    const w = Math.abs(r.x - c.x) * this.w
    const h = Math.abs(u.y - c.y) * this.h
    el.style.transform = `translate3d(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0)`
    el.style.width = `${w.toFixed(0)}px`
    el.style.height = `${h.toFixed(0)}px`
    el.style.fontSize = `${(h * 0.72).toFixed(1)}px`
    if (el.style.display) el.style.display = ''
  }

  /** After a while with nothing touched: one of her lights, or the pattern's next pod. */
  protected hintAt() {
    const i = this.game.hint
    return i >= 0 ? this.podAt3(i) : null
  }

  get calm() {
    return false
  }

  qa() {
    const px = (v: Vector3, r = TAP_R) => {
      const s = this.toScreen(v, r, 170)
      return s ? [Math.round(s.x), Math.round(s.y), Math.round(s.size)] : null
    }
    const g = this.game
    return {
      game: 'skypod',
      round: g.round,
      phase: g.phase,
      score: g.score,
      daddy: g.daddy,
      stars: g.stars,
      pattern: g.round === 2 ? g.pattern : null,
      step: g.round === 2 ? g.step : null,
      lights: [...g.lights],
      hint: g.hint,
      pods: this.spots.map((s) => px(V(...s))),
      kaylee: [k2(this.kaylee.pos.x), k2(this.kaylee.pos.y + (this.kaylee.root.position.y - this.kaylee.pos.y))],
      daddyGoing: this.dGoing,
      beat: this.beat.on,
      tall: this.tall,
      touches: this.touches,
    }
  }
}

const k2 = (n: number) => Math.round(n * 100) / 100
const wallTop = (tall: boolean) => wallSize(tall).h
