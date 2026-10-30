// Salmon Leap (plan: planning/around-the-world/canada.html): the salmon swimming home up a river in BC's Great Bear
// Rainforest in late summer, seen from the side like a theater stage. Maple says what's happening (kit/StoryBeat), then
// one verb, flick the salmon: her finger grabs a sockeye in its pool and flicks it (fish.ts), it leaps in an arc,
// splashes into the pool it comes down in and wiggles. It gets richer three times:
//   steps   A little cascade of four low steps, one salmon at a time. Each one up a step does a happy wiggle.
//   falls   The big falls: three tall ledges, three salmon at once, a mossy boulder that throws them up (a stepping
//           stone) and a springy log that throws them up the falls (her choice: the rock, the log, or one big flick).
//   bears   The same falls with a black bear and the white spirit bear fishing on the ledges (Bear.tsx: they swipe at
//           the water and snap at the salmon flying past). The salmon bounce off their noses (boop!, up and over), the
//           bears sneeze and plop back in the water, and after a couple of boops each rolls over and wades off to the
//           salmonberry bushes for a happy munch instead.
//   eggs    Home: the stream where they were born. She taps each salmon to lay its pink eggs in the gravel, the seasons
//           turn (fall, snow, spring blossoms), and she taps the eggs to hatch the babies, who swim off to the sea.
//           Then Maple waves them off and the stamp comes (onDone).
// A flick too hard flies over the whole falls into Maple's lap (<Maple>, on the bank: she cheers and drops it in the
// stream); a flick into the rock face bonks and slides back down; nothing is ever lost. Always there to poke: the rain
// cloud (it's a rainforest), a bald eagle circling (it swoops), a raven on the giant cedar (kraa), the cedar itself (it
// creaks and drops a cone), a banana slug on a mossy log (it pulls its eyes in), a black bear cub by the berries (it
// rolls over), the berry bushes, Maple (tail slap), the bears (hello), the water (a ripple). Each animal is met in
// Maple's book (meet) the first time she touches it.
// Layers, back to front: sky, the far misty mountains, the rainforest edge, the giant cedar and the spruces, the mossy
// bank with ferns, the river (water, bears, rock, falls, the boulder and the log), Maple (HTML over the scene), then
// the salmon, the eagle and the splashes in a front SVG. The flick and the bounces are knobs (fish.ts), the hint here
// (?feel=1). 2D only: the SVGs are written every frame, no three.js or Phaser.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from 'react'
import { BigButton, bigCelebration, burst, lineText, say, speakingVoice, spendHint, useElementSize, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { StoryBeat } from '../../../../kit/StoryBeat'
import boulderImg from '../../assets/salmon-boulder.webp'
import bushImg from '../../assets/salmon-bush.webp'
import cedarImg from '../../assets/salmon-cedar-hd.webp'
import farImg from '../../assets/salmon-far-hd.webp'
import fern2Img from '../../assets/salmon-fern2.webp'
import fernImg from '../../assets/salmon-fern.webp'
import forestImg from '../../assets/salmon-forest-hd.webp'
import mossyLogImg from '../../assets/salmon-mossylog.webp'
import plankImg from '../../assets/salmon-plank.webp'
import spruceImg from '../../assets/salmon-spruce.webp'
import { meet } from '../../book/met'
import { L } from '../../lines'
import { Maple } from '../../puppets/Maple'
import type { CanadaActivityProps } from '../props'
import { Bear, type BearAction, type BearCtl } from './Bear'
import { BOUNCE, FISH_R, FLICK, aim, launchTo, newFish, stepAir, type Bumper, type Fish } from './fish'
import { noises } from './noises'
import SALMON_SECTIONS, { type SalmonSection } from './sections'
import { PHONE, TALL, WIDE, bearAt, bearsRiver, lip, poolAt, rng, type Pt, type River, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/salmon/SalmonLeap.tsx'
const HINT = knobs('salmonHint', 'The hint', FILE, {
  after: { value: 8, min: 3, max: 30, step: 1, label: 'Hint after', unit: 's', note: 'a hand shows a flick up to the next pool (and Sparkle says it again) after this long without one' },
})

/** The stretches of the river (the story is before them). */
type Part = Exclude<SalmonSection, 'story'>
const T = L.salmon
const SAY: Record<Part, Line> = { steps: T.steps, falls: T.falls, bears: T.bears, eggs: T.eggs }
const ORDER: Part[] = ['steps', 'falls', 'bears', 'eggs']
/** How many are home at the start of each section (`?home=` overrides), and how many get home in it. */
const START_HOME: Record<Part, number> = { steps: 0, falls: 3, bears: 7, eggs: 11 }
const NEED: Record<Part, number> = { steps: 3, falls: 4, bears: 4, eggs: 0 }
/** How many swim in the bottom pool at once. */
const AT_ONCE: Record<Part, number> = { steps: 1, falls: 3, bears: 3, eggs: 0 }
const homeParam = (home: number, section: Part) => (home === START_HOME[section] ? '' : String(home))

// The pictures' shapes (width / height, after the cutout trims them), so each one is placed by its foot.
const ASPECT = { far: 2.579, forest: 1.517, cedar: 0.718, spruce: 0.486, fern: 1.06, fern2: 1.274, bush: 1.196, mossyLog: 3.18, boulder: 1.61, plank: 6.564 }

const INK = '#4A3B57'
const BIG = 6000
const MAX_FISH = 8
/** Screen pixels kept for the line at the bottom. */
const BOTTOM = 64
const MAX_EGGS = 12
const FRY_EACH = 3
const N_DROPS = 40
const N_RIPPLES = 6
const N_SPRAY = 28
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p))
// Sockeye on their way home: a bright red body, an olive-green head, a darker red tail and fins.
const SOCKEYE = { body: '#E8463F', head: '#6FA35A', fin: '#B8323C', belly: '#F2836E' }

/** Writes an SVG attribute only when it changes (most of the scene is still most frames). */
const written = new WeakMap<Element, Record<string, string>>()
function put(el: Element | null | undefined, name: string, value: string) {
  if (!el) return
  let w = written.get(el)
  if (!w) written.set(el, (w = {}))
  if (w[name] === value) return
  w[name] = value
  el.setAttribute(name, value)
}

// ---------------------------------------------------------------- the runtime (plain objects, written every frame)

type BearState = 'fish' | 'sneeze' | 'plop' | 'roll' | 'wade' | 'berries'
interface BearRt {
  id: number
  spirit: boolean
  home: Pt
  x: number
  y: number
  state: BearState
  t0: number
  boops: number
  lunge: number
  from: Pt
  bush: Pt
  /** When she next swipes at the water, and when she last snapped at a salmon. */
  swipeAt: number
  snapAt: number
  munchAt: number
  el: SVGGElement
  foam: Element | null
  ctl: BearCtl
  h: RefObject<PuppetHandle | null>
}
/** What React hands the river for each bear puppet. */
export interface BearLink {
  ctl: BearCtl
  h: RefObject<PuppetHandle | null>
}
interface Egg {
  x: number
  y: number
  laid: number
  hatched: number
  fry: { x: number; y: number; vx: number; wig: number }[]
}
type Phase = 'play' | 'lay' | 'skip' | 'hatch' | 'done'

interface Info {
  section: Part
  home: number
}
interface Events {
  info: (i: Info) => void
  /** Sparkle's instruction for now (the line at the bottom shows it, and it can be heard again). */
  prompt: (line: Line) => void
  next: (section: Part, home: number) => void
  done: () => void
  maple: (action: 'hop' | 'wave' | 'cheer' | 'wiggle' | 'slap') => void
  progress: (done: number) => void
}

/** Lines said once per visit (the first rain, the first bonk...). */
const saidOnce = new Set<string>()

class SalmonWorld {
  st: StageDef
  river: River
  section: Part
  home: number
  startHome: number
  /** How many have come into the bottom pool in this section. */
  spawned = 0
  fish: Fish[] = []
  nextId = 1
  now = 0
  lastTouch = 0
  lastFlick = 0
  misses = 0
  /** Her finger: the salmon it holds (if any), and its recent places for the flick's speed. */
  finger: { id: number; fish: Fish | null; x: number; y: number; sx: number; sy: number; moved: number; trail: [number, number, number][] } | null = null
  fingerSpeed = 0
  lastLaunch = 0
  bears: BearRt[] = []
  cub: { h: RefObject<PuppetHandle | null>; at: number; munch: number } | null = null
  eggs: Egg[] = []
  phase: Phase
  phaseAt = 0
  laid = new Set<number>()
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  els: Record<string, Element | null> = {}
  fishEls: { root: SVGGElement; body: SVGGElement; tail: SVGGElement; fin: SVGGElement; glow: Element }[] = []
  eggEls: { g: SVGGElement; fry: SVGGElement[] }[] = []
  drops: { el: SVGLineElement; x: number; y: number; v: number }[] = []
  ripples: { el: SVGEllipseElement; x: number; y: number; t: number; big: boolean }[] = []
  spray: { el: SVGCircleElement; x: number; y: number; vx: number; vy: number; t: number; life: number }[] = []
  rain = { on: false, t0: -9, next: 40 }
  eagle = { a: 0, swoop: -9 }
  raven = -9
  cedar = -9
  cone = { t0: -9, x: 0, y: 0 }
  slug = { x: 0, dir: 1, tuck: -9 }
  bushes = [-9, -9]
  maple = { lap: -9, poke: 0, home: 0, said: -9 }
  bonk = { t0: -9, x: 0, y: 0 }
  /** When she was last nudged (the hint line), so it's said once per stuck stretch. */
  hinted = -1
  /** When a friend last reacted out loud (reactions are short and never pile up). */
  reacted = -9
  doneAt = -1
  r: () => number
  /** Set when the scene goes away (a new run, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  constructor(
    root: HTMLElement,
    private svg: SVGSVGElement,
    stage: StageDef,
    section: Part,
    home: number,
    spirit: 'high' | 'low',
    seed: number,
    private ev: Events,
    bearLinks: BearLink[],
    cubLink: RefObject<PuppetHandle | null>,
  ) {
    this.st = stage
    this.section = section
    this.home = home
    this.startHome = home
    this.r = rng(seed)
    this.river = section === 'bears' ? bearsRiver(stage, spirit) : stage.rivers[section === 'eggs' ? 'eggs' : section]
    this.phase = section === 'eggs' ? 'lay' : 'play'
    const q = <E extends Element>(k: string) => root.querySelector(`[data-k="${k}"]`) as E | null
    const qa = <E extends Element>(k: string) => [...root.querySelectorAll(`[data-k="${k}"]`)] as E[]
    for (const k of ['hint', 'hint-path', 'hint-hand', 'eagle', 'eagle-wings', 'eagle-head', 'raven', 'raven-head', 'raven-wing', 'cedar', 'cone', 'slug', 'slug-eyes', 'lap', 'bonk', 'rain', 'cloud', 'cloud-dark', 'season', 'snow', 'bloom', 'bush0', 'bush1', 'cub'])
      this.els[k] = q(k)
    for (const g of qa<SVGGElement>('fish'))
      this.fishEls.push({ root: g, body: g.querySelector('[data-k="fbody"]')!, tail: g.querySelector('[data-k="ftail"]')!, fin: g.querySelector('[data-k="ffin"]')!, glow: g.querySelector('[data-k="fglow"]')! })
    for (const g of qa<SVGGElement>('egg')) this.eggEls.push({ g, fry: [...g.querySelectorAll<SVGGElement>('[data-k="fry"]')] })
    for (const el of qa<SVGLineElement>('drop')) this.drops.push({ el, x: 0, y: -9999, v: 0 })
    for (const el of qa<SVGEllipseElement>('ripple')) this.ripples.push({ el, x: 0, y: 0, t: 9, big: false })
    for (const el of qa<SVGCircleElement>('spray')) this.spray.push({ el, x: 0, y: 0, vx: 0, vy: 0, t: 9, life: 1 })
    // The bears on their ledges.
    for (const [i, b] of this.river.bears.entries()) {
      const at = bearAt(this.river, b.lip)
      const el = q<SVGGElement>(`bear-${i}`)!
      const link = bearLinks[i]
      this.bears.push({
        id: i,
        spirit: b.spirit,
        home: [at.x, at.y],
        x: at.x,
        y: at.y,
        state: 'fish',
        t0: 0,
        boops: 0,
        lunge: 0,
        from: [at.x, at.y],
        bush: stage.berries[i % stage.berries.length],
        swipeAt: 1.5 + i * 1.7,
        snapAt: -9,
        munchAt: 0,
        el,
        foam: el.querySelector('[data-k="foam"]'),
        ctl: link.ctl,
        h: link.h,
      })
    }
    this.cub = { h: cubLink, at: -9, munch: 4 }
    this.slug.x = stage.slug[0]
    if (section === 'eggs') {
      // The salmon that made it home, swimming in the stream.
      const n = clamp(home, 4, MAX_EGGS)
      const p = this.river.pools[0]
      for (let i = 0; i < n; i++) {
        const f = newFish(this.nextId++, 0, 0, p.y + 40 + this.r() * (p.d - 90))
        f.x = this.span()[0] + ((i + 0.5) / n) * (this.span()[1] - this.span()[0])
        f.goal = f.x
        this.fish.push(f)
      }
    } else {
      // The first salmon are in the bottom pool already (so her finger has one at once).
      for (let i = 0; i < AT_ONCE[section]; i++) this.spawn(false)
    }
    this.later(() => {
      this.info()
      this.ev.progress(ORDER.indexOf(section))
      this.ev.prompt(SAY[section])
    }, 0)
    // (A moment later, so a scene rebuilt at once for the screen's shape doesn't say it twice.)
    this.later(() => void say(SAY[section]), 350)
  }

  // -------------------------------------------------------------- state

  private info() {
    this.ev.info({ section: this.section, home: this.home })
  }

  /** A friend's short reaction: only when nobody is talking and nobody just did (so they never pile up). */
  private react(line: Line, gap = 1.6) {
    if (speakingVoice() || this.now - this.reacted < gap) return
    this.reacted = this.now
    void say(line, { interrupt: false })
  }

  /** Sparkle's line, said once per visit. */
  private once(key: string, line: Line) {
    if (saidOnce.has(key)) return
    saidOnce.add(key)
    this.reacted = this.now
    void say(line)
  }

  setVb(vb: { x: number; y: number; w: number; h: number }) {
    this.vb = vb
  }

  /** The bit of the screen salmon swim in, left to right. */
  private span(): [number, number] {
    return [this.vb.x + 70, this.vb.x + this.vb.w - 70]
  }

  /** Where salmon swim in pool i (x from, x to). */
  private bounds(i: number): [number, number] {
    const r = this.river
    const p = r.pools[i]
    const [s0, s1] = this.span()
    const lo = i === 0 ? s0 : p.x0 + 20
    const hi = i === r.pools.length - 1 ? s1 : lip(r, i).x - FISH_R - 50
    return [Math.max(lo, s0), Math.max(Math.max(lo, s0) + 10, Math.min(hi, s1))]
  }

  private spawn(arrive: boolean) {
    const p = this.river.pools[0]
    const [lo, hi] = this.bounds(0)
    const x = arrive ? this.vb.x - 80 : lo + 40 + this.r() * Math.max(10, hi - lo - 80)
    const f = newFish(this.nextId++, 0, x, p.y + 30, arrive ? 'arrive' : 'swim')
    f.goal = arrive ? lo + 60 + this.r() * Math.max(10, (hi - lo) * 0.5) : x
    this.fish.push(f)
    this.spawned++
  }

  // -------------------------------------------------------------- her finger

  toStage(e: { clientX: number; clientY: number }): Pt {
    const m = this.svg.getScreenCTM()
    if (!m) return [0, 0]
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse())
    return [p.x, p.y]
  }

  down(e: RPointerEvent) {
    if (this.finger) return
    const [x, y] = this.toStage(e)
    this.lastTouch = this.now
    this.hinted = -1
    const f = { id: e.pointerId, fish: null as Fish | null, x, y, sx: e.clientX, sy: e.clientY, moved: 0, trail: [[this.now, x, y]] as [number, number, number][] }
    this.finger = f
    // A salmon first (the eggs' stream: a tap lays eggs; the river: grab it to flick).
    const hit = this.nearestFish(x, y)
    if (hit) {
      meet('salmon')
      if (this.phase === 'lay') return this.lay(hit)
      if (this.phase === 'play') {
        f.fish = hit
        hit.mode = 'held'
        hit.t = 0
        noises.splash(false)
        this.splash(hit.x, this.river.pools[hit.pool].y, 4, 260)
        return
      }
    }
    if (this.phase === 'hatch') {
      const egg = this.eggs.find((g) => g.hatched < 0 && Math.hypot(g.x - x, g.y - y) < 100)
      if (egg) return this.hatch(egg)
    }
    if (this.poke(x, y)) return
    // The water: a ripple.
    const pi = this.poolUnder(x, y)
    if (pi >= 0) {
      this.ripple(x, this.river.pools[pi].y, false)
      this.splash(x, this.river.pools[pi].y, 5, 300)
      noises.splash(false)
    }
  }

  private nearestFish(x: number, y: number) {
    let best: Fish | null = null
    let bd = FLICK.grab
    for (const f of this.fish) {
      if (f.mode !== 'swim' && f.mode !== 'arrive') continue
      if (this.phase === 'lay' && this.laid.has(f.id)) continue
      if (this.phase !== 'lay' && f.pool === this.river.pools.length - 1) continue
      const d = Math.hypot(f.x - x, f.y - y)
      if (d < bd) {
        bd = d
        best = f
      }
    }
    return best
  }

  private poolUnder(x: number, y: number) {
    const r = this.river
    for (let i = r.pools.length - 1; i >= 0; i--) {
      const p = r.pools[i]
      const x0 = i === 0 ? -BIG : lip(r, i - 1).x
      const x1 = i === r.pools.length - 1 ? BIG : lip(r, i).x
      if (x >= x0 && x < x1 && y > p.y - 40 && y < p.y + p.d) return i
    }
    return -1
  }

  move(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    const [x, y] = this.toStage(e)
    f.moved = Math.max(f.moved, Math.hypot(e.clientX - f.sx, e.clientY - f.sy))
    f.x = x
    f.y = y
    f.trail.push([this.now, x, y])
    while (f.trail.length > 2 && this.now - f.trail[0][0] > 0.1) f.trail.shift()
    const s = f.fish
    if (!s || s.mode !== 'held') return
    // Lifted out of the water far enough: it flies with her finger's speed.
    if (y < this.river.pools[s.pool].y - FLICK.leash) this.launch(s, true)
  }

  up(e: RPointerEvent) {
    const f = this.finger
    if (!f || f.id !== e.pointerId) return
    this.finger = null
    const s = f.fish
    if (!s || s.mode !== 'held') return
    const [vx, vy] = this.fingerV(f)
    if (f.moved < 12) {
      // A tap: a little hop straight up.
      this.fly(s, 0, -FLICK.hop, false)
    } else if (Math.hypot(vx, vy) * FLICK.power > 380) this.launch(s, false)
    else {
      s.mode = 'swim'
      s.goal = s.x
      noises.splash(false)
    }
  }

  /** Her finger's speed over the last tenth of a second (stage units a second). */
  private fingerV(f: NonNullable<SalmonWorld['finger']>): Pt {
    const a = f.trail[0]
    const b = f.trail[f.trail.length - 1]
    const dt = Math.max(0.016, b[0] - a[0])
    return [(b[1] - a[1]) / dt, (b[2] - a[2]) / dt]
  }

  private launch(s: Fish, lifted: boolean) {
    const f = this.finger
    let [vx, vy] = f ? this.fingerV(f) : [0, -FLICK.hop / FLICK.power]
    // Lifted out slowly: at least a hop, the way her finger went.
    if (lifted && vy * FLICK.power > -FLICK.hop) vy = -FLICK.hop / FLICK.power
    ;[vx, vy] = aim(this.river, s, vx, vy, this.misses, this.st.maple)
    this.fly(s, vx, vy, vy < -150)
    if (f && f.fish === s) f.fish = null
  }

  private fly(s: Fish, vx: number, vy: number, upward: boolean) {
    s.mode = 'air'
    s.t = 0
    s.vx = vx
    s.vy = vy
    s.from = upward ? s.pool : -1
    s.y = Math.min(s.y, this.river.pools[s.pool].y - 4)
    this.lastFlick = this.now
    this.lastLaunch = Math.hypot(vx, vy)
    noises.leap(clamp(this.lastLaunch / FLICK.max, 0, 1))
    this.ripple(s.x, this.river.pools[s.pool].y, false)
    this.splash(s.x, this.river.pools[s.pool].y, 7, 380)
  }

  // -------------------------------------------------------------- pokes

  private poke(x: number, y: number) {
    const st = this.st
    const near = (p: Pt, r: number) => Math.hypot(p[0] - x, p[1] - y) < r
    for (const b of this.bears) {
      if (Math.hypot(b.x - 30 - x, b.y - 110 - y) < 110) {
        meet(b.spirit ? 'spirit-bear' : 'black-bear')
        if (b.state === 'fish') {
          void b.h.current?.play('hello')
          noises.grumble()
          this.react(b.spirit ? T.spirit : T.black)
        } else if (b.state === 'berries') {
          void b.h.current?.play('munch')
          b.munchAt = this.now + 2.5
          noises.grumble()
          this.react(T.yum)
        }
        return true
      }
    }
    if (near([st.maple[0], st.maple[1] - 80], 100)) {
      const n = this.maple.poke++
      this.ev.maple(n % 2 ? 'wiggle' : 'slap')
      if (n % 2 === 0) this.later(() => noises.slap(), 420)
      this.react(T.poke[n % T.poke.length])
      return true
    }
    if (this.cub && near([st.cub[0] - 10, st.cub[1] - 40], 75)) {
      meet('black-bear')
      if (this.now - this.cub.at > 1.1) {
        this.cub.at = this.now
        void this.cub.h.current?.play('roll')
        noises.squeak()
      }
      return true
    }
    for (const [i, p] of st.berries.entries())
      if (near([p[0], p[1] - 50], 80)) {
        this.bushes[i] = this.now
        noises.jiggle()
        return true
      }
    if (near(this.eaglePos(), 100)) {
      meet('bald-eagle')
      if (this.now - this.eagle.swoop > 2.2) this.eagle.swoop = this.now
      noises.screech()
      return true
    }
    if (near([st.raven[0], st.raven[1] - 20], 75)) {
      meet('raven')
      this.raven = this.now
      noises.kraa()
      return true
    }
    if (near([this.slug.x, st.slug[1] - 30], 80)) {
      meet('banana-slug')
      this.slug.tuck = this.now
      noises.squish()
      return true
    }
    if (near(st.cloud, 130)) {
      this.toggleRain()
      return true
    }
    const [cx, ch] = st.cedar
    if (Math.abs(x - cx) < 90 && y < st.bank && y > st.bank - ch - 2000) {
      this.cedar = this.now
      noises.creak()
      this.once('cedar', T.cedar)
      if (this.now - this.cone.t0 > 1.4) this.cone = { t0: this.now, x: cx + 60 + this.r() * 60, y: Math.max(this.vb.y + 40, y - 40) }
      return true
    }
    return false
  }

  private toggleRain() {
    this.rain.on = !this.rain.on
    this.rain.t0 = this.now
    this.rain.next = this.now + (this.rain.on ? 14 : 45)
    if (this.rain.on) {
      noises.rain()
      this.once('rain', T.rain)
    }
  }

  private eaglePos(): Pt {
    const e = this.st.eagle
    const p = clamp((this.now - this.eagle.swoop) / 2, 0, 1)
    const dip = Math.sin(p * Math.PI)
    const top = this.river.pools[this.river.pools.length - 1].y
    return [e.x + Math.cos(this.eagle.a) * e.rx, e.y + Math.sin(this.eagle.a) * e.ry + dip * (top - 60 - e.y)]
  }

  private ripple(x: number, y: number, big: boolean) {
    const r = this.ripples.reduce((a, b) => (b.t > a.t ? b : a))
    r.x = x
    r.y = y
    r.t = 0
    r.big = big
  }

  /** A spray of water drops thrown up from the surface at (x, y). */
  private splash(x: number, y: number, n: number, speed: number) {
    for (let i = 0; i < n; i++) {
      const d = this.spray.reduce((a, b) => (b.t / b.life > a.t / a.life ? b : a))
      const a = -Math.PI / 2 + (this.r() - 0.5) * 1.8
      const v = speed * (0.6 + this.r() * 0.6)
      d.x = x + (this.r() - 0.5) * 30
      d.y = y
      d.vx = Math.cos(a) * v
      d.vy = Math.sin(a) * v
      d.t = 0
      d.life = 0.45 + this.r() * 0.35
    }
  }

  // -------------------------------------------------------------- the eggs

  private lay(f: Fish) {
    if (this.laid.has(f.id)) return
    this.laid.add(f.id)
    f.happy = this.now
    const p = this.river.pools[0]
    const egg: Egg = { x: f.x, y: p.y + p.d - 24, laid: this.now, hatched: -1, fry: [] }
    this.eggs.push(egg)
    noises.egg(this.eggs.length)
    this.later(() => noises.egg(this.eggs.length + 2), 150)
    if (this.laid.size >= this.fish.length) this.later(() => this.toSpring(), 1200)
  }

  private toSpring() {
    if (this.phase !== 'lay') return
    this.phase = 'skip'
    this.phaseAt = this.now
    void say(T.seasons)
  }

  private hatch(g: Egg) {
    g.hatched = this.now
    noises.hatch()
    for (let i = 0; i < FRY_EACH; i++) g.fry.push({ x: g.x + (i - 1) * 16, y: g.y - 10 - i * 8, vx: -(90 + this.r() * 120), wig: this.r() * 6 })
    const p = this.frac(g.x, g.y)
    if (p) burst(p[0], p[1])
    if (this.eggs.every((e) => e.hatched >= 0)) {
      this.phase = 'done'
      this.doneAt = this.now
      this.ev.progress(ORDER.length)
      // The babies swim off to the sea, Maple waves them goodbye, and the stamp.
      this.later(() => {
        void (async () => {
          bigCelebration()
          noises.home()
          this.ev.maple('wave')
          await say(T.sea)
          if (this.dead) return
          this.ev.maple('cheer')
          await say(T.win)
          if (this.dead) return
          await wait(600)
          if (!this.dead) this.ev.done()
        })()
      }, 900)
    }
  }

  /** A stage point as a fraction of the window (for the confetti). */
  private frac(x: number, y: number): Pt | null {
    const m = this.svg.getScreenCTM()
    if (!m) return null
    const p = new DOMPoint(x, y).matrixTransform(m)
    return [p.x / window.innerWidth, p.y / window.innerHeight]
  }

  // -------------------------------------------------------------- every frame

  tick(dt: number) {
    this.now += dt
    const now = this.now
    const r = this.river
    const top = r.pools.length - 1
    // Pull the bottom pool back up to `AT_ONCE` salmon, until this section's are all on their way.
    if (this.phase === 'play') {
      const waiting = this.fish.filter((f) => f.pool < top && f.mode !== 'lap').length
      if (waiting < AT_ONCE[this.section] && this.spawned < NEED[this.section] && this.fish.every((f) => f.mode !== 'arrive')) this.spawn(true)
    }
    const bumpers: Bumper[] = []
    for (const b of this.bears) if (b.state === 'fish') bumpers.push({ id: b.id, ...this.nose(b), r: 52 })
    const x0 = this.vb.x
    for (const f of [...this.fish]) {
      f.t += dt
      const p = r.pools[f.pool]
      if (f.mode === 'held') {
        const fg = this.finger
        if (fg && fg.fish === f) {
          const [lo, hi] = this.bounds(f.pool)
          const tx = clamp(fg.x, lo, hi)
          const ty = clamp(fg.y, p.y - FLICK.leash, p.y + p.d - 20)
          const k = 1 - Math.exp(-dt * 25)
          f.x += (tx - f.x) * k
          f.y += (ty - f.y) * k
        }
        f.wig += dt * 30
      } else if (f.mode === 'air') {
        f.wig += dt * 24
        stepAir(f, r, dt, now, bumpers, this.st.maple, x0, {
          bonk: (s) => {
            noises.bonk()
            this.bonk = { t0: now, x: s.x + FISH_R, y: s.y }
            this.once('bonk', T.bonk)
          },
          rock: (s) => {
            noises.knock()
            this.splash(s.x, s.y, 3, 200)
          },
          log: () => noises.boing(),
          boop: (_s, id) => this.booped(this.bears[id]),
          land: (s, i) => this.land(s, i),
          lap: (s) => {
            s.mode = 'lap'
            s.t = 0
            this.maple.lap = now
            noises.giggle()
            this.ev.maple('cheer')
            this.react(T.lap[(this.maple.home++ + 1) % T.lap.length], 0.8)
          },
        })
        // Never stuck in the air (bouncing between a rock and a lip): after a while it drops into the pool under it.
        if (f.mode === 'air' && f.t > 4) this.land(f, poolAt(r, f.x))
      } else if (f.mode === 'lap') {
        f.x = this.st.maple[0] - 8
        f.y = this.st.maple[1] - 66
        f.wig += dt * 20
        // Maple drops it in the stream.
        if (f.t > 1.3) {
          f.pool = top
          f.mode = 'air'
          f.t = 0
          f.x = this.st.maple[0] - 110
          f.vx = -160
          f.vy = -300
          f.from = top - 1
        }
      } else {
        // Swimming (and arriving from the sea): to a spot in the pool, a little pause, another spot.
        const [lo, hi] = this.bounds(f.pool)
        const speed = f.mode === 'home' ? FLICK.swim * 1.6 : f.mode === 'arrive' ? FLICK.swim * 1.8 : f.mode === 'dart' ? FLICK.swim * 3 : FLICK.swim
        const dx = f.goal - f.x
        if (Math.abs(dx) > 4) {
          f.dir = dx > 0 ? 1 : -1
          f.x += Math.sign(dx) * Math.min(Math.abs(dx), speed * dt)
          f.wig += dt * (f.mode === 'home' ? 14 : 9)
        } else {
          f.wig += dt * 3
          if (f.mode === 'arrive' || f.mode === 'dart') f.mode = 'swim'
          if (f.mode === 'swim' && this.r() < dt * 0.7) f.goal = lo + this.r() * (hi - lo)
        }
        const baseY = this.phase === 'play' ? p.y + 30 : clamp(f.y, p.y + 30, p.y + p.d - 40)
        f.y += (baseY + Math.sin(now * 2 + f.id) * 4 - f.y) * (1 - Math.exp(-dt * 6))
        if (f.mode === 'home' && f.x > this.vb.x + this.vb.w + 60) this.fish.splice(this.fish.indexOf(f), 1)
      }
    }
    this.tickBears(dt)
    this.tickEggs(dt)
    // Everyone home: on up the river.
    if (this.phase === 'play' && this.home - this.startHome >= NEED[this.section] && this.doneAt < 0) {
      this.doneAt = now
      const next = ORDER[ORDER.indexOf(this.section) + 1]
      this.ev.maple('cheer')
      this.later(() => this.ev.next(next, this.home), 2200)
    }
    // Stuck for a while: Sparkle says it again, once (the hand shows it too).
    const idle = now - Math.max(this.lastTouch, this.lastFlick, this.phase === 'hatch' ? this.phaseAt : 0)
    if (!this.finger && idle > HINT.after && this.hinted < 0 && (this.phase === 'play' || this.phase === 'lay' || this.phase === 'hatch')) {
      this.hinted = now
      const line = this.phase === 'hatch' ? T.hatch : SAY[this.section]
      if (spendHint(line)) void say(line)
    }
    // Rain comes and goes by itself too (it's a rainforest).
    if (now > this.rain.next) this.toggleRain()
    this.eagle.a += dt * 0.35
    this.slug.x += dt * 6 * this.slug.dir * (now - this.slug.tuck < 1.6 ? 0 : 1)
    if (Math.abs(this.slug.x - this.st.slug[0]) > 40) this.slug.dir = this.slug.x > this.st.slug[0] ? -1 : 1
    // The cub nibbles a berry now and then.
    if (this.cub && now > this.cub.munch) {
      this.cub.munch = now + 5 + this.r() * 4
      if (now - this.cub.at > 1.2) void this.cub.h.current?.play('munch')
    }
    this.draw(dt)
  }

  private land(f: Fish, i: number) {
    const r = this.river
    const top = r.pools.length - 1
    const p = r.pools[i]
    const fell = f.vy
    f.pool = i
    f.y = p.y + 6
    f.vx = 0
    f.vy = 0
    f.t = 0
    const [lo, hi] = this.bounds(i)
    f.goal = clamp(f.x + (f.dir > 0 ? 60 : -60), lo, hi)
    this.ripple(f.x, p.y, fell > 900)
    this.splash(f.x, p.y, fell > 900 ? 10 : 6, fell > 900 ? 520 : 360)
    noises.splash(fell > 900)
    if (i === top) {
      f.mode = 'home'
      f.dir = 1
      f.goal = this.vb.x + this.vb.w + 200
      f.happy = this.now
      this.home++
      this.misses = 0
      noises.home()
      const pt = this.frac(f.x, p.y)
      if (pt) burst(pt[0], pt[1])
      this.ev.maple(this.r() < 0.5 ? 'cheer' : 'hop')
      this.react(T.home[this.maple.home++ % T.home.length], 2.5)
      this.info()
      return
    }
    f.mode = 'swim'
    if (f.from >= 0 && i > f.from) {
      f.happy = this.now
      this.misses = 0
      noises.up(i)
    } else if (f.from >= 0) this.misses++
  }

  // -------------------------------------------------------------- the bears

  /** A bear's head (what a salmon boops), leaning out when she lunges. */
  private nose(b: BearRt) {
    return { x: b.x - 44 - b.lunge * 26, y: b.y - 128 - b.lunge * 8 }
  }

  private play(b: BearRt, a: BearAction) {
    void b.h.current?.play(a)
  }

  private booped(b: BearRt) {
    if (b.state !== 'fish') return
    b.boops++
    b.state = 'sneeze'
    b.t0 = this.now
    meet(b.spirit ? 'spirit-bear' : 'black-bear')
    this.play(b, 'sneeze')
    noises.boop()
    this.later(() => this.react(T.achoo, 0.6), 250)
  }

  private tickBears(dt: number) {
    const now = this.now
    for (const b of this.bears) {
      const t = now - b.t0
      if (b.state === 'fish') {
        // Lunge at a salmon flying near (and snap at it), and swipe at the water now and then.
        const n = this.nose(b)
        const near = this.fish.some((f) => f.mode === 'air' && Math.hypot(f.x - n.x, f.y - n.y) < 260)
        b.lunge += ((near ? 1 : 0) - b.lunge) * (1 - Math.exp(-dt * (near ? 10 : 4)))
        if (near && now - b.snapAt > 1.2) {
          b.snapAt = now
          this.play(b, 'snap')
        }
        if (!near && now > b.swipeAt) {
          b.swipeAt = now + 3 + this.r() * 3
          this.play(b, 'swipe')
          this.later(() => {
            if (b.state !== 'fish') return
            const py = this.river.pools[poolAt(this.river, b.x)].y
            this.ripple(b.x - 70, py, false)
            this.splash(b.x - 70, py, 6, 340)
            noises.splash(false)
          }, 470)
        }
      } else b.lunge += (0 - b.lunge) * (1 - Math.exp(-dt * 6))
      b.ctl.lunge = b.lunge
      if (b.state === 'sneeze' && t > 1) {
        b.state = 'plop'
        b.t0 = now
        this.play(b, 'plop')
        this.later(() => {
          noises.plop()
          this.ripple(b.x, b.home[1] - 30, true)
          this.splash(b.x, b.home[1] - 30, 10, 480)
        }, 260)
      } else if (b.state === 'plop' && t > 1.1) {
        b.t0 = now
        if (b.boops >= BOUNCE.boops) {
          b.state = 'roll'
          this.play(b, 'roll')
          noises.grumble()
          this.react(T.giveUp[b.id % T.giveUp.length], 0.5)
        } else b.state = 'fish'
      } else if (b.state === 'roll' && t > 1) {
        b.state = 'wade'
        b.t0 = now
        b.from = [b.x, b.y]
        b.ctl.walk = true
      } else if (b.state === 'wade') {
        const p = ease(t / 2.8)
        b.x = b.from[0] + (b.bush[0] - 70 - b.from[0]) * p
        b.y = b.from[1] + (b.bush[1] + 4 - b.from[1]) * p
        if (t > 2.8) {
          b.state = 'berries'
          b.t0 = now
          b.ctl.walk = false
          b.munchAt = now + 0.3
          noises.grumble()
          if (this.bears.every((o) => o.state === 'berries')) {
            this.ev.maple('cheer')
            this.later(() => this.react(T.berries, 0.5), 900)
          }
        }
      } else if (b.state === 'berries' && now > b.munchAt) {
        b.munchAt = now + 2.4 + this.r() * 1.5
        this.play(b, 'munch')
        this.bushes[b.id % this.bushes.length] = now
      }
    }
  }

  // -------------------------------------------------------------- the payoff's seasons

  private tickEggs(dt: number) {
    if (this.phase === 'skip') {
      const t = this.now - this.phaseAt
      if (t > 4.6) {
        this.phase = 'hatch'
        this.phaseAt = this.now
        this.ev.prompt(T.hatch)
        void say(T.hatch)
      }
    }
    for (const g of this.eggs)
      for (const y of g.fry) {
        y.x += y.vx * dt
        y.wig += dt * 16
        y.y += Math.sin(this.now * 3 + y.wig * 0.1) * dt * 10
      }
  }

  // -------------------------------------------------------------- drawing

  private draw(dt: number) {
    const now = this.now
    const r = this.river
    // The salmon.
    const glowFish = this.hintFish()
    for (let i = 0; i < this.fishEls.length; i++) {
      const el = this.fishEls[i]
      const f = this.fish[i]
      if (!f) {
        put(el.root, 'display', 'none')
        continue
      }
      put(el.root, 'display', 'inline')
      let ang = 0
      let flip = f.dir
      if (f.mode === 'air') {
        ang = (Math.atan2(f.vy, Math.abs(f.vx) + 1) * 180) / Math.PI
        flip = f.vx < -5 ? -1 : 1
      } else if (f.mode === 'held') ang = -20
      else if (f.mode === 'lap') ang = -10
      const happy = now - f.happy
      if (happy < 0.9) ang += Math.sin(happy * 30) * 18 * (1 - happy / 0.9)
      // Laying: dips to the gravel and back.
      let dip = 0
      if (this.phase !== 'play' && this.laid.has(f.id)) {
        const lt = now - f.happy
        dip = lt < 0.8 ? Math.sin((lt / 0.8) * Math.PI) * (r.pools[0].y + r.pools[0].d - 40 - f.y) : 0
      }
      const fade = this.phase === 'skip' ? 1 - clamp((now - this.phaseAt - 1.2) / 1.6, 0, 1) : this.phase === 'hatch' || this.phase === 'done' ? 0 : 1
      const inWater = f.mode !== 'air' && f.mode !== 'lap' && !(f.mode === 'held' && f.y < r.pools[f.pool].y)
      // Squash and stretch: long in the air, a squash just after it lands, a wriggle in her hand.
      const sq = f.mode === 'air' ? 1 + clamp(Math.hypot(f.vx, f.vy) / 4000, 0, 0.18) : f.mode === 'swim' && f.t < 0.3 ? 1 - 0.18 * Math.sin((f.t / 0.3) * Math.PI) : 1
      put(el.root, 'transform', `translate(${f.x.toFixed(1)} ${(f.y + dip).toFixed(1)})`)
      put(el.root, 'opacity', (fade * (inWater ? 0.82 : 1)).toFixed(2))
      put(el.body, 'transform', `scale(${flip} 1) rotate(${(ang * flip).toFixed(1)}) scale(${sq.toFixed(3)} ${(1 / sq).toFixed(3)})`)
      const w = Math.sin(f.wig) * (f.mode === 'air' || f.mode === 'held' || f.mode === 'lap' ? 32 : 16)
      put(el.tail, 'transform', `rotate(${w.toFixed(1)} -28 0)`)
      put(el.fin, 'transform', `rotate(${(Math.sin(f.wig + 1.2) * 20).toFixed(1)} 4 6)`)
      put(el.glow, 'opacity', f === glowFish ? (0.45 + 0.35 * Math.sin(now * 6)).toFixed(2) : '0')
    }
    // The bears: where they are (the puppets do the rest).
    for (const b of this.bears) {
      const scale = b.state === 'wade' || b.state === 'berries' ? 1 - 0.25 * clamp((b.home[1] - b.y) / Math.max(1, b.home[1] - b.bush[1]), 0, 1) : 1
      const face = b.state === 'wade' && b.bush[0] > b.from[0] ? -1 : 1
      put(b.el, 'transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) scale(${(scale * face).toFixed(3)} ${scale.toFixed(3)})`)
      put(b.foam, 'opacity', b.state === 'berries' || (b.state === 'wade' && now - b.t0 > 1.2) ? '0' : '0.9')
    }
    // Ripples and splashes.
    for (const rp of this.ripples) {
      rp.t += dt
      const p = clamp(rp.t / 0.7, 0, 1)
      const s = rp.big ? 2 : 1
      put(rp.el, 'cx', rp.x.toFixed(0))
      put(rp.el, 'cy', rp.y.toFixed(0))
      put(rp.el, 'rx', (14 + p * 60 * s).toFixed(1))
      put(rp.el, 'ry', (4 + p * 12 * s).toFixed(1))
      put(rp.el, 'opacity', p >= 1 ? '0' : (0.9 * (1 - p)).toFixed(2))
    }
    for (const d of this.spray) {
      if (d.t > d.life) {
        put(d.el, 'opacity', '0')
        continue
      }
      d.t += dt
      d.vy += 1800 * dt
      d.x += d.vx * dt
      d.y += d.vy * dt
      put(d.el, 'cx', d.x.toFixed(0))
      put(d.el, 'cy', d.y.toFixed(0))
      put(d.el, 'opacity', d.t > d.life ? '0' : (1 - d.t / d.life).toFixed(2))
    }
    // The bonk's stars.
    const bk = now - this.bonk.t0
    put(this.els.bonk, 'transform', `translate(${this.bonk.x.toFixed(0)} ${(this.bonk.y - 30 - bk * 30).toFixed(0)}) rotate(${(bk * 200).toFixed(0)})`)
    put(this.els.bonk, 'opacity', bk < 0.8 ? (1 - bk / 0.8).toFixed(2) : '0')
    // The rain.
    const rainOn = this.rain.on ? clamp((now - this.rain.t0) / 1.5, 0, 1) : 1 - clamp((now - this.rain.t0) / 1.5, 0, 1)
    put(this.els.rain, 'opacity', rainOn.toFixed(2))
    put(this.els['cloud-dark'], 'opacity', (rainOn * 0.55).toFixed(2))
    put(this.els.cloud, 'transform', `translate(${(this.st.cloud[0] + Math.sin(now * 0.2) * 30).toFixed(0)} ${this.st.cloud[1]}) scale(${(1 + rainOn * 0.15).toFixed(3)})`)
    if (rainOn > 0)
      for (const d of this.drops) {
        d.y += d.v * dt
        if (d.y > this.vb.y + this.vb.h) {
          d.x = this.vb.x + this.r() * this.vb.w
          d.y = this.vb.y - this.r() * 300
          d.v = 1100 + this.r() * 500
        }
        put(d.el, 'x1', d.x.toFixed(0))
        put(d.el, 'y1', d.y.toFixed(0))
        put(d.el, 'x2', (d.x - 6).toFixed(0))
        put(d.el, 'y2', (d.y + 28).toFixed(0))
      }
    // The eagle: wings beat faster on the swoop, and it tilts into the turn.
    const [ex, ey] = this.eaglePos()
    const sw = now - this.eagle.swoop
    const flap = Math.sin(now * (sw < 2 ? 11 : 3.2))
    const dirX = -Math.sin(this.eagle.a) >= 0 ? 1 : -1
    put(this.els.eagle, 'transform', `translate(${ex.toFixed(0)} ${ey.toFixed(0)}) scale(${dirX} 1) rotate(${(Math.cos(this.eagle.a) * 6 + (sw < 2 ? Math.sin(sw * Math.PI) * 18 : 0)).toFixed(1)})`)
    put(this.els['eagle-wings'], 'transform', `scale(1 ${(0.25 + 0.75 * flap).toFixed(2)})`)
    put(this.els['eagle-head'], 'transform', `rotate(${sw < 1 ? (Math.sin(sw * 20) * 12).toFixed(1) : '0'} 20 -4)`)
    // The raven, the cedar, the cone, the slug, the bushes, Maple's lap.
    const rv = now - this.raven
    put(this.els['raven-head'], 'transform', `rotate(${rv < 0.9 ? (Math.sin(rv * 18) * 22).toFixed(1) : (Math.sin(now * 0.7) * 4).toFixed(1)} -14 -26)`)
    put(this.els['raven-wing'], 'transform', `rotate(${rv < 0.9 ? (-Math.abs(Math.sin(rv * 14)) * 40).toFixed(1) : '0'} 6 -18)`)
    put(this.els.raven, 'transform', `translate(${this.st.raven[0]} ${(this.st.raven[1] - (rv < 0.5 ? Math.sin((rv / 0.5) * Math.PI) * 14 : 0)).toFixed(1)})`)
    const cd = now - this.cedar
    put(this.els.cedar, 'transform', `rotate(${cd < 1 ? (Math.sin(cd * 14) * 1.2 * (1 - cd)).toFixed(2) : '0'} ${this.st.cedar[0]} ${this.st.bank})`)
    const ct = now - this.cone.t0
    const cy = this.cone.y + 0.5 * 1800 * ct * ct
    put(this.els.cone, 'transform', `translate(${this.cone.x.toFixed(0)} ${Math.min(cy, this.st.bank + 30).toFixed(0)}) rotate(${(ct * 300).toFixed(0)})`)
    put(this.els.cone, 'opacity', ct < 2.2 ? '1' : '0')
    const tuck = now - this.slug.tuck
    const crawl = Math.sin(now * 2.2) * 0.04
    put(this.els.slug, 'transform', `translate(${this.slug.x.toFixed(1)} ${this.st.slug[1]}) scale(${(this.slug.dir * (1 + crawl)).toFixed(3)} ${(1 - crawl).toFixed(3)})`)
    put(this.els['slug-eyes'], 'transform', `scale(1 ${tuck < 1.6 ? (0.15 + 0.85 * clamp((tuck - 1.1) / 0.5, 0, 1)).toFixed(2) : '1'})`)
    for (const i of [0, 1]) {
      const bt = now - this.bushes[i]
      put(this.els[`bush${i}`], 'transform', `rotate(${bt < 0.6 ? (Math.sin(bt * 30) * 4).toFixed(1) : '0'} ${this.st.berries[i][0]} ${this.st.berries[i][1]})`)
    }
    // The payoff: the eggs, the babies and the seasons.
    for (let i = 0; i < this.eggEls.length; i++) {
      const el = this.eggEls[i]
      const g = this.eggs[i]
      if (!g) {
        put(el.g, 'display', 'none')
        continue
      }
      put(el.g, 'display', 'inline')
      const age = now - g.laid
      const wob = this.phase === 'hatch' && g.hatched < 0 ? Math.sin(now * 9 + i) * 6 : 0
      const s = g.hatched >= 0 ? Math.max(0, 1 - (now - g.hatched) * 3) : Math.min(1, age * 4)
      put(el.g, 'transform', `translate(${g.x.toFixed(0)} ${g.y.toFixed(0)})`)
      put(el.g.firstElementChild, 'transform', `rotate(${wob.toFixed(1)}) scale(${s.toFixed(2)})`)
      for (const [k, fe] of el.fry.entries()) {
        const fy = g.fry[k]
        put(fe, 'display', fy ? 'inline' : 'none')
        if (fy) put(fe, 'transform', `translate(${(fy.x - g.x).toFixed(0)} ${(fy.y - g.y).toFixed(0)}) rotate(${(Math.sin(fy.wig) * 14).toFixed(0)})`)
      }
    }
    if (this.section === 'eggs') {
      const t = this.phase === 'skip' ? now - this.phaseAt : this.phase === 'lay' ? 0 : 99
      const autumn = clamp(t / 0.8, 0, 1) * (1 - clamp((t - 1.4) / 0.6, 0, 1))
      const winter = clamp((t - 1.4) / 0.6, 0, 1) * (1 - clamp((t - 3) / 0.8, 0, 1))
      put(this.els.season, 'fill', autumn > 0.01 ? '#F2A65A' : '#FFFFFF')
      put(this.els.season, 'opacity', (autumn * 0.35 + winter * 0.55).toFixed(2))
      put(this.els.snow, 'opacity', winter.toFixed(2))
      put(this.els.snow, 'transform', `translate(0 ${((now * 60) % 120).toFixed(0)})`)
      put(this.els.bloom, 'opacity', clamp((t - 3.4) / 0.8, 0, 1).toFixed(2))
    }
    this.hint(glowFish)
  }

  /** The salmon the hint points at: the lowest one waiting (after a while with no flick). */
  private hintFish(): Fish | null {
    if (this.finger || this.now - Math.max(this.lastTouch, this.lastFlick) < HINT.after) return null
    if (this.phase === 'lay') return this.fish.find((f) => !this.laid.has(f.id) && f.mode === 'swim') ?? null
    if (this.phase !== 'play') return null
    let best: Fish | null = null
    for (const f of this.fish) if (f.mode === 'swim' && f.pool < this.river.pools.length - 1 && (!best || f.pool < best.pool)) best = f
    return best
  }

  private hint(f: Fish | null) {
    const hint = this.els.hint
    const hatchHint = this.phase === 'hatch' && this.now - Math.max(this.lastTouch, this.phaseAt) > HINT.after
    if (hatchHint) {
      const g = this.eggs.find((e) => e.hatched < 0)
      if (g) {
        put(hint, 'opacity', '0.9')
        put(this.els['hint-path'], 'points', '')
        put(this.els['hint-hand'], 'transform', `translate(${g.x} ${g.y + 50 - Math.abs(Math.sin(this.now * 4)) * 20})`)
        return
      }
    }
    if (!f || this.phase === 'lay') {
      if (this.phase === 'lay' && f) {
        put(hint, 'opacity', '0.9')
        put(this.els['hint-path'], 'points', '')
        put(this.els['hint-hand'], 'transform', `translate(${f.x.toFixed(0)} ${(f.y + 60 - Math.abs(Math.sin(this.now * 4)) * 20).toFixed(0)})`)
        return
      }
      put(hint, 'opacity', '0')
      return
    }
    // The arc of a clean flick up to the next pool, and a hand flicking along its start.
    const r = this.river
    const [vx, vy] = launchTo(r, f.x, r.pools[f.pool].y - 4, f.pool + 1, this.st.maple)
    const pts: string[] = []
    let x = f.x
    let y = r.pools[f.pool].y - 4
    let svx = vx
    let svy = vy
    for (let t = 0; t < 2; t += 1 / 30) {
      svy += FLICK.gravity / 30
      x += svx / 30
      y += svy / 30
      pts.push(`${x.toFixed(0)},${y.toFixed(0)}`)
      if (svy > 0 && y > r.pools[f.pool + 1].y) break
    }
    put(this.els['hint-path'], 'points', pts.join(' '))
    const p = ((this.now * 0.8) % 1) * 0.6
    const s = Math.hypot(vx, vy)
    put(this.els['hint-hand'], 'transform', `translate(${(f.x + (vx / s) * 220 * p).toFixed(0)} ${(f.y + 40 + (vy / s) * 220 * p).toFixed(0)})`)
    put(hint, 'opacity', String(clamp((this.now - Math.max(this.lastTouch, this.lastFlick) - HINT.after) * 2, 0, 0.9)))
  }

  qa() {
    const scr = (x: number, y: number) => {
      const m = this.svg.getScreenCTM()
      if (!m) return { x: 0, y: 0 }
      const p = new DOMPoint(x, y).matrixTransform(m)
      return { x: Math.round(p.x), y: Math.round(p.y) }
    }
    const r = this.river
    const waiting = this.hintFishAny()
    return {
      section: this.section,
      phase: this.phase,
      home: this.home,
      misses: this.misses,
      fish: this.fish.map((f) => ({ pool: f.pool, mode: f.mode, ...scr(f.x, f.y) })),
      waiting: waiting ? { pool: waiting.pool, ...scr(waiting.x, waiting.y) } : null,
      pools: r.pools.map((p, i) => scr(i === r.pools.length - 1 ? lip(r, i - 1).x + 120 : (Math.max(i ? lip(r, i - 1).x : this.vb.x + 80, this.vb.x + 80) + lip(r, i).x) / 2, p.y)),
      bears: this.bears.map((b) => ({ spirit: b.spirit, state: b.state, boops: b.boops, ...scr(b.x - 30, b.y - 110) })),
      eggs: this.eggs.map((g) => ({ hatched: g.hatched >= 0, ...scr(g.x, g.y) })),
      maple: scr(this.st.maple[0], this.st.maple[1] - 80),
      cloud: scr(this.st.cloud[0], this.st.cloud[1]),
      eagle: scr(...this.eaglePos()),
      raven: scr(this.st.raven[0], this.st.raven[1] - 20),
      slug: scr(this.slug.x, this.st.slug[1] - 30),
      cub: scr(this.st.cub[0] - 10, this.st.cub[1] - 40),
      cedar: scr(this.st.cedar[0], this.st.bank - 200),
      rain: this.rain.on,
    }
  }

  private hintFishAny() {
    let best: Fish | null = null
    const top = this.river.pools.length - 1
    for (const f of this.fish) if ((f.mode === 'swim' || f.mode === 'arrive') && (this.phase !== 'play' || f.pool < top) && !(this.phase === 'lay' && this.laid.has(f.id)) && (!best || f.pool < best.pool)) best = f
    return best
  }
}

// ---------------------------------------------------------------- React

interface Run {
  section: Part
  home: number
  spirit: 'high' | 'low'
  seed: number
  n: number
}

/** The story first (Maple at the river), unless a link starts further up. */
export function SalmonLeap(props: CanadaActivityProps) {
  const sec = useSections(SALMON_SECTIONS)
  const [story, setStory] = useState(!sec.start || sec.start === 'story')
  useEffect(() => {
    if (story) sec.enter('story')
  }, [])
  if (story) return <StoryBeat lines={T.story} friend={<Maple height="100%" />} onDone={() => setStory(false)} />
  return <TheRiver {...props} sec={sec} />
}

function TheRiver({ sec, onDone, setProgress }: CanadaActivityProps & { sec: ReturnType<typeof useSections<'home' | 'spirit', SalmonSection>> }) {
  const { start, param, enter } = sec
  const first: Part = !start || start === 'story' ? 'steps' : start
  const [run, setRun] = useState<Run>(() => {
    const h = parseInt(param('home'), 10)
    return { section: first, home: Number.isFinite(h) ? clamp(h, 0, 40) : START_HOME[first], spirit: param('spirit') === 'low' ? 'low' : 'high', seed: (Math.random() * 1e9) | 0, n: 0 }
  })
  const [prompt, setPrompt] = useState<Line>(SAY[run.section])
  const [info, setInfo] = useState<Info>({ section: run.section, home: run.home })
  const [done, setDone] = useState(false)
  const finished = useRef(false)
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<SalmonWorld | null>(null)
  const maple = useRef<PuppetHandle>(null)
  const cub = useRef<PuppetHandle>(null)
  const bearH = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const bearCtl = useMemo<BearCtl[]>(() => [{ lunge: 0, walk: false }, { lunge: 0, walk: false }], [run])
  const size = useElementSize(box)
  const aspect = size.height ? size.width / Math.max(1, size.height - BOTTOM) : 1.6
  const stage = !size.height || aspect >= 1.05 ? WIDE : aspect < 0.62 ? PHONE : TALL
  const mid = `salmon${run.n}`
  const cb = useRef({ onDone, setProgress })
  cb.current = { onDone, setProgress }

  // The view box: the stage scaled to fit above the line at the bottom (so it never covers the bottom pool, where the
  // salmon wait), the extra edge filled with more of the forest (sky above, the river at the sides, its rock below).
  const fitH = Math.max(1, size.height - BOTTOM)
  const k = size.width && size.height ? Math.min(size.width / stage.w, fitH / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - fitH / k) / 2, w: vw, h: vh }
  const river = run.section === 'bears' ? bearsRiver(stage, run.spirit) : stage.rivers[run.section === 'eggs' ? 'eggs' : run.section]

  useLayoutEffect(() => {
    if (!svg.current || !box.current) return
    setPrompt(SAY[run.section])
    const w = new SalmonWorld(
      box.current,
      svg.current,
      stage,
      run.section,
      run.home,
      run.spirit,
      run.seed,
      {
        info: (i) => {
          setInfo(i)
          enter(i.section, { home: homeParam(i.home, i.section), spirit: run.spirit })
        },
        prompt: setPrompt,
        next: (section, home) => setRun((r) => ({ ...r, section, home, n: r.n + 1 })),
        done: () => {
          setDone(true)
          if (finished.current) return
          finished.current = true
          cb.current.onDone()
        },
        maple: (a) => void maple.current?.play(a),
        progress: (d) => cb.current.setProgress(d, ORDER.length),
      },
      bearCtl.map((ctl, i) => ({ ctl, h: bearH[i] })),
      cub,
    )
    w.setVb(vb)
    world.current = w
    ;(window as unknown as { __canadaSalmonQA?: () => unknown }).__canadaSalmonQA = () => w.qa()
    const unwatch = watch('salmon', () => {
      const f = w.finger
      let fs = 0
      if (f && f.trail.length > 1) {
        const a = f.trail[0]
        const b = f.trail[f.trail.length - 1]
        fs = Math.hypot(b[1] - a[1], b[2] - a[2]) / Math.max(0.016, b[0] - a[0])
      }
      return {
        finger: [fs, 4000],
        launch: [w.lastLaunch, FLICK.max],
        help: [Math.min(0.9, FLICK.help + w.misses * FLICK.miss), 1],
      }
    })
    let raf = 0
    let last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      if (!document.hidden) w.tick(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      w.dead = true
      cancelAnimationFrame(raf)
      unwatch()
      if (world.current === w) world.current = null
    }
  }, [run])

  // Turning the iPad: the other stage, the same section again (with everyone who's home kept).
  const shape = useRef(stage)
  useEffect(() => {
    const w = world.current
    if (!w) return
    w.setVb(vb)
    if (shape.current !== stage) {
      shape.current = stage
      if (w.phase === 'play' || w.phase === 'lay') setRun((r) => ({ ...r, section: w.section, home: w.home, n: r.n + 1 }))
    }
  })

  const again = () => {
    setDone(false)
    setRun((r) => ({ ...r, section: 'steps', home: 0, seed: (Math.random() * 1e9) | 0, n: r.n + 1 }))
  }

  const st = stage
  const scene = useScene(st, river, vb)
  // Maple sits on the bank above the top pool (HTML over the scene, under the salmon), this tall in stage units.
  const mapleH = 200 * k
  const mapleBox = { left: (st.maple[0] - vb.x) * k - mapleH / 2, top: (st.maple[1] - vb.y) * k - mapleH * 0.95, width: mapleH, height: mapleH }
  const sky = `url(#${mid}-sky)`

  return (
    <div
      ref={box}
      style={{ position: 'absolute', inset: 0, background: '#CFEDE6', overflow: 'clip', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
      aria-label="Flick the salmon up the falls"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        world.current?.down(e)
      }}
      onPointerMove={(e) => world.current?.move(e)}
      onPointerUp={(e) => world.current?.up(e)}
      onPointerCancel={(e) => world.current?.up(e)}
    >
      <style>{CSS}</style>
      <svg key={`s${run.n}`} ref={svg} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={SVG_STYLE} aria-hidden>
        <defs>
          <linearGradient id={`${mid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFE3EC" />
            <stop offset="1" stopColor="#EAF6F0" />
          </linearGradient>
          <linearGradient id={`${mid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86CDE2" />
            <stop offset="1" stopColor="#3F86A8" />
          </linearGradient>
        </defs>
        <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG + st.bank + 40} fill={sky} />
        {/* The rain cloud (it darkens when it rains). */}
        <g data-k="cloud" transform={`translate(${st.cloud[0]} ${st.cloud[1]})`}>
          <ellipse cx={0} cy={0} rx={110} ry={40} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={-40} cy={-24} r={38} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={26} cy={-34} r={46} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={4} rx={104} ry={34} fill="#FFFFFF" />
          <g data-k="cloud-dark" opacity={0}>
            <ellipse cx={0} cy={4} rx={104} ry={34} fill="#9AA6BF" />
            <circle cx={-40} cy={-24} r={35} fill="#9AA6BF" />
            <circle cx={26} cy={-34} r={43} fill="#9AA6BF" />
          </g>
        </g>
        {/* Far: the misty coast mountains, then a band of mist. */}
        {scene.farTiles.map((x, i) => (
          <image key={i} href={farImg} x={x} y={st.bank - 40 - scene.farW / ASPECT.far} width={scene.farW + 2} height={scene.farW / ASPECT.far} preserveAspectRatio="none" />
        ))}
        <rect x={-BIG} y={st.bank - 150} width={BIG * 2} height={120} fill="#EAF6F0" opacity={0.45} />
        {/* Mid: the edge of the rainforest across the river. */}
        {scene.forestTiles.map((x, i) => (
          <image key={i} href={forestImg} x={x} y={st.bank + 30 - scene.forestW / ASPECT.forest} width={scene.forestW + 2} height={scene.forestW / ASPECT.forest} preserveAspectRatio="none" />
        ))}
        {/* The mossy bank, stepping down with the river, ferns and boulders on it. */}
        <rect x={-BIG} y={st.bank + 20} width={BIG * 2} height={BIG} fill="#8BB36A" />
        {scene.mounds.map(([d, c], i) => (
          <path key={i} d={d} fill={c} stroke="#5E8A4E" strokeWidth={4} strokeLinejoin="round" />
        ))}
        {scene.bankRocks.map(([x, y, w], i) => (
          <image key={i} href={boulderImg} x={x - w / 2} y={y - w / ASPECT.boulder} width={w} height={w / ASPECT.boulder} />
        ))}
        {scene.bankFerns.map(([x, y, w, two], i) => (
          <image key={i} href={two ? fern2Img : fernImg} x={x - w / 2} y={y - w / (two ? ASPECT.fern2 : ASPECT.fern)} width={w} height={w / (two ? ASPECT.fern2 : ASPECT.fern)} />
        ))}
        {scene.trees.map(([x, y, h], i) => (
          <image key={i} href={spruceImg} x={x - (h * ASPECT.spruce) / 2} y={y - h} width={h * ASPECT.spruce} height={h} />
        ))}
        {/* The giant cedar, taller than a building (its trunk goes on up off the top), with the raven's branch. */}
        <g data-k="cedar">
          <rect x={st.cedar[0] - 52} y={st.bank - st.cedar[1] - 3000} width={104} height={3000 + 200} fill="#9A5C3C" stroke={INK} strokeWidth={5} />
          <path d={`M${st.cedar[0] - 22} ${st.bank - st.cedar[1] - 3000} L ${st.cedar[0] - 22} ${st.bank - st.cedar[1] + 140} M${st.cedar[0] + 18} ${st.bank - st.cedar[1] - 3000} L ${st.cedar[0] + 18} ${st.bank - st.cedar[1] + 160}`} stroke="#B97A55" strokeWidth={10} />
          <image href={cedarImg} x={st.cedar[0] - scene.cedarW / 2} y={st.bank + 20 - scene.cedarW / ASPECT.cedar} width={scene.cedarW} height={scene.cedarW / ASPECT.cedar} />
          <line x1={st.cedar[0] + 40} y1={st.raven[1] + 6} x2={st.raven[0] + 70} y2={st.raven[1] - 6} stroke={INK} strokeWidth={16} strokeLinecap="round" />
          <line x1={st.cedar[0] + 40} y1={st.raven[1] + 6} x2={st.raven[0] + 70} y2={st.raven[1] - 6} stroke="#9A5C3C" strokeWidth={7} strokeLinecap="round" />
          <Raven />
        </g>
        {/* The banana slug on its mossy log, the cub and the salmonberry bushes. */}
        <image href={mossyLogImg} x={st.slug[0] - 120} y={st.slug[1] + 26 - 240 / ASPECT.mossyLog} width={240} height={240 / ASPECT.mossyLog} />
        <Slug />
        {st.berries.map(([x, y], i) => (
          <g key={i} data-k={`bush${i}`}>
            <image href={bushImg} x={x - 85} y={y + 10 - 170 / ASPECT.bush} width={170} height={170 / ASPECT.bush} />
          </g>
        ))}
        <g data-k="cub" transform={`translate(${st.cub[0]} ${st.cub[1]}) scale(-1 1)`}>
          <Bear ref={cub} cub />
        </g>
        {scene.ferns.map(([x, y, w, two], i) => (
          <image key={i} href={two ? fern2Img : fernImg} x={x - w / 2} y={y - w / (two ? ASPECT.fern2 : ASPECT.fern)} width={w} height={w / (two ? ASPECT.fern2 : ASPECT.fern)} />
        ))}
        {/* The river: the pools, the bears standing in them, then the rock (which hides the water under each floor and
            the bears' feet), the moss on the lips, the waterfalls over the lips, the boulder and the log. */}
        {scene.water.map((d, i) => (
          <path key={i} d={d} fill={`url(#${mid}-water)`} />
        ))}
        {scene.shine.map(([x, y, w], i) => (
          <line key={i} x1={x} y1={y} x2={x + w} y2={y} stroke="#D8F1F7" strokeWidth={5} strokeLinecap="round" opacity={0.75} className="salmon-shine" style={{ animationDelay: `${(i % 5) * -0.7}s` }} />
        ))}
        {river.bears.map((b, i) => (
          <g key={`${run.n}-${i}`} data-k={`bear-${i}`}>
            <Bear ref={bearH[i]} spirit={b.spirit} ctl={bearCtl[i]} />
            <g data-k="foam" opacity={0.9} className="salmon-foam">
              <ellipse cx={-6} cy={-26} rx={66} ry={9} fill="#FFFFFF" />
              {[-56, -30, 0, 26, 50].map((x, j) => (
                <circle key={j} cx={x} cy={-30 + (j % 2) * 4} r={j % 2 ? 9 : 12} fill="#FFFFFF" stroke="#9FD6EC" strokeWidth={3} />
              ))}
            </g>
          </g>
        ))}
        <path d={scene.rock} fill="#A89CAA" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {scene.stones.map(([x, y, rx, ry], i) => (
          <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill="#94889A" />
        ))}
        {scene.moss.map((d, i) => (
          <path key={i} d={d} fill="#8BB36A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        ))}
        {run.section === 'eggs' && scene.gravel.map(([x, y, r, c], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} stroke={INK} strokeWidth={2} />)}
        {scene.falls.map(([x, y0, y1], i) => (
          <g key={i}>
            <path d={`M${x - 26} ${y0} Q ${x - 30} ${(y0 + y1) / 2} ${x - 32} ${y1} L ${x + 4} ${y1} L ${x + 4} ${y0} Z`} fill="#E8F7FC" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <line x1={x - 18} y1={y0} x2={x - 20} y2={y1} stroke="#9FD6EC" strokeWidth={4} className="salmon-fall" />
            <line x1={x - 8} y1={y0} x2={x - 9} y2={y1} stroke="#9FD6EC" strokeWidth={4} className="salmon-fall salmon-fall2" />
            <g className="salmon-foam">
              <circle cx={x - 44} cy={y1 - 2} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
              <circle cx={x - 18} cy={y1 - 8} r={18} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
              <circle cx={x + 6} cy={y1 - 2} r={12} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
              <ellipse cx={x - 18} cy={y1 + 2} rx={40} ry={9} fill="#FFFFFF" />
            </g>
          </g>
        ))}
        {river.rocks.map((o, i) => (
          <image key={i} href={boulderImg} x={o.x - o.r * 1.35} y={o.y + 34 - (o.r * 2.7) / ASPECT.boulder} width={o.r * 2.7} height={(o.r * 2.7) / ASPECT.boulder} />
        ))}
        {river.logs.map((g, i) => {
          const len = Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) + 40
          const ang = (Math.atan2(g.b[1] - g.a[1], g.b[0] - g.a[0]) * 180) / Math.PI
          const h = len / ASPECT.plank
          return <image key={i} href={plankImg} x={-len / 2} y={-h / 2} width={len} height={h} transform={`translate(${(g.a[0] + g.b[0]) / 2} ${(g.a[1] + g.b[1]) / 2}) rotate(${ang.toFixed(1)})`} />
        })}
        {/* The eggs in the gravel, each with its babies. */}
        <g>
          {Array.from({ length: MAX_EGGS }, (_, i) => (
            <g key={i} data-k="egg" display="none">
              <g>
                {[
                  [-20, -4],
                  [0, -10],
                  [20, -4],
                  [-10, 10],
                  [11, 10],
                ].map(([x, y], j) => (
                  <g key={j}>
                    <circle cx={x} cy={y} r={11} fill="#FF8FB1" stroke={INK} strokeWidth={3} />
                    <circle cx={x - 3} cy={y - 4} r={3} fill="#FFFFFF" opacity={0.8} />
                  </g>
                ))}
              </g>
              {Array.from({ length: FRY_EACH }, (_, j) => (
                <g key={j} data-k="fry" display="none">
                  <path d="M16 0 C10 -8 -6 -8 -14 -2 L -22 -8 L -20 0 L -22 8 L -14 2 C -6 8 10 8 16 0Z" fill="#E9C3B4" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
                  <circle cx={8} cy={-1} r={2.5} fill={INK} />
                  <circle cx={0} cy={5} r={4.5} fill="#FF8FB1" stroke={INK} strokeWidth={1.5} />
                </g>
              ))}
            </g>
          ))}
        </g>
      </svg>
      {/* Maple on the bank. */}
      <div style={{ position: 'absolute', ...mapleBox, pointerEvents: 'none' }}>
        <Maple ref={maple} height="100%" flip={-1} />
      </div>
      {/* In front: the salmon, the eagle, the splashes, the rain, the seasons and the hint. */}
      <svg key={`f${run.n}`} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} style={{ ...SVG_STYLE, pointerEvents: 'none' }} aria-hidden>
        {Array.from({ length: MAX_FISH }, (_, i) => (
          <g key={i} data-k="fish" display="none">
            <ellipse data-k="fglow" cx={0} cy={0} rx={64} ry={38} fill="#FFFFFF" opacity={0} />
            <g data-k="fbody">
              <Sockeye />
            </g>
          </g>
        ))}
        <Eagle />
        {Array.from({ length: N_RIPPLES }, (_, i) => (
          <ellipse key={i} data-k="ripple" cx={0} cy={0} rx={10} ry={4} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0} />
        ))}
        {Array.from({ length: N_SPRAY }, (_, i) => (
          <circle key={i} data-k="spray" cx={0} cy={-9999} r={i % 3 ? 6 : 9} fill="#E8F7FC" stroke="#7FB6D9" strokeWidth={2} opacity={0} />
        ))}
        <g data-k="bonk" opacity={0}>
          {[0, 120, 240].map((a) => (
            <path key={a} d={star(0, -26, 14)} transform={`rotate(${a})`} fill="#FFD55A" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          ))}
        </g>
        <g data-k="cone" opacity={0}>
          <ellipse cx={0} cy={0} rx={10} ry={16} fill="#8A5A34" stroke={INK} strokeWidth={3} />
          <path d="M-8 -6 L 8 -6 M-9 2 L 9 2 M-7 9 L 7 9" stroke="#5E3A22" strokeWidth={2.5} />
        </g>
        <g data-k="rain" opacity={0}>
          {Array.from({ length: N_DROPS }, (_, i) => (
            <line key={i} data-k="drop" x1={0} y1={-9999} x2={0} y2={-9999} stroke="#7FB6D9" strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>
        {/* The payoff's seasons: a tint for fall and winter, snow, and blossoms on the bank. */}
        {run.section === 'eggs' && (
          <>
            <rect data-k="season" x={-BIG} y={-BIG} width={BIG * 2} height={BIG * 2} fill="#FFFFFF" opacity={0} />
            <g data-k="snow" opacity={0}>
              {scene.snow.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={6} fill="#FFFFFF" />
              ))}
            </g>
            <g data-k="bloom" opacity={0}>
              {scene.bloom.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={11} fill="#FFC1DA" stroke={INK} strokeWidth={2.5} />
              ))}
            </g>
          </>
        )}
        <g data-k="hint" opacity={0}>
          <polyline data-k="hint-path" points="" fill="none" stroke="#FFFFFF" strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
          <g data-k="hint-hand">
            <text fontSize={90} textAnchor="middle" dominantBaseline="middle" className="salmon-hint">
              👆
            </text>
          </g>
        </g>
      </svg>
      {/* How many salmon are home (for Dad). */}
      <div style={TALLY}>
        <motion.div key={info.home} initial={{ scale: 1.4 }} animate={{ scale: 1 }} style={CHIP}>
          🐟 {info.home}
        </motion.div>
        {ORDER.slice(0, 3).map((id) => (
          <div key={id} style={{ ...DOT, background: ORDER.indexOf(id) < ORDER.indexOf(info.section) ? 'var(--hotpink)' : id === info.section ? 'var(--pink)' : 'rgba(255,255,255,.7)' }} />
        ))}
      </div>
      {/* On up the river: a quick wash of water between sections. */}
      <AnimatePresence>
        <motion.div key={run.n} initial={{ opacity: run.n ? 1 : 0 }} animate={{ opacity: 0 }} transition={{ duration: 0.7 }} style={{ position: 'absolute', inset: 0, background: '#BFE6F2', pointerEvents: 'none', zIndex: 20 }} />
      </AnimatePresence>
      {done && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2, type: 'spring' }} style={AGAIN} onPointerDown={(e) => e.stopPropagation()}>
          <BigButton onClick={again} ariaLabel="Again">
            🔁 🐟
          </BigButton>
        </motion.div>
      )}
      {/* What Sparkle said (for Dad): tap it to hear it again. */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence mode="popLayout">
          <motion.button
            key={lineText(prompt)}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            style={PILL}
            aria-label="Hear it again"
            onPointerDown={(e) => {
              e.stopPropagation()
              void say(prompt)
            }}
          >
            🔊 {lineText(prompt)}
          </motion.button>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- pieces of the scene

/** A sockeye salmon on its way home, facing right, centered: bright red body, olive-green head, a hooked nose, a
 *  forked tail on a hinge (`ftail`) and a little fin (`ffin`). */
function Sockeye() {
  const body = 'M-30 0 C-30 -12 -14 -20 4 -19 C20 -18 33 -12 41 -3 C43 0 42 3 38 5 C30 12 16 16 0 16 C-16 16 -30 10 -30 0Z'
  return (
    <>
      <g data-k="ftail">
        <path d="M-27 0 C-36 -4 -44 -14 -58 -22 C-53 -8 -53 8 -58 22 C-44 14 -36 4 -27 0Z" fill={SOCKEYE.fin} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <path d="M-14 -16 C-10 -29 4 -31 12 -18Z" fill={SOCKEYE.fin} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <path d={body} fill={SOCKEYE.body} />
      <path d="M-24 6 C-10 13 10 14 30 7 C24 13 12 16 0 16 C-12 16 -22 12 -24 6Z" fill={SOCKEYE.belly} />
      {/* The green head, with the hooked nose of a salmon going home. */}
      <path d="M17 -18 C28 -15 37 -10 41 -3 C43 0 42 3 38 5 C32 9 25 12 17 14 C21 4 21 -8 17 -18Z" fill={SOCKEYE.head} />
      <path d={body} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M17 -17 C21 -8 21 4 17 13" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M38 5 C40 9 37 11 33 9" fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={28} cy={-6} r={6} fill="#FFFFFF" stroke={INK} strokeWidth={2.2} />
      <circle cx={29.5} cy={-6} r={3.4} fill={INK} />
      <circle cx={28.4} cy={-7.6} r={1.2} fill="#FFFFFF" />
      <ellipse cx={26} cy={5} rx={4.5} ry={2.6} fill="#FF9DB8" opacity={0.9} />
      <g data-k="ffin">
        <path d="M4 6 C2 14 -6 19 -11 17 C-7 12 -2 8 4 6Z" fill={SOCKEYE.fin} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </>
  )
}

/** The bald eagle, wings spread (they beat on `eagle-wings`), white head and tail, yellow beak. Faces right. */
function Eagle() {
  return (
    <g data-k="eagle">
      <path d="M-26 2 L -52 -8 L -50 4 L -54 14 L -26 8 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <g data-k="eagle-wings">
        <path d="M-10 -2 C -30 -46 -70 -56 -112 -40 L -100 -30 L -112 -22 L -96 -16 L -104 -6 C -70 -10 -36 -4 -10 8 Z" fill="#5A3E2E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M10 -2 C 30 -46 70 -56 112 -40 L 100 -30 L 112 -22 L 96 -16 L 104 -6 C 70 -10 36 -4 10 8 Z" fill="#6B4A36" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <ellipse cx={0} cy={4} rx={30} ry={15} fill="#5A3E2E" stroke={INK} strokeWidth={4} />
      <path d="M-4 18 L -2 26 M6 18 L 8 26" stroke="#F4C542" strokeWidth={5} strokeLinecap="round" />
      <g data-k="eagle-head">
        <circle cx={28} cy={-4} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <path d="M38 -8 C 50 -8 52 0 46 6 L 40 2 Z" fill="#F4C542" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={31} cy={-7} r={3} fill={INK} />
      </g>
    </g>
  )
}

/** The raven on the cedar's branch: glossy black with a purple sheen and a big beak. Faces left. */
function Raven() {
  return (
    <g data-k="raven">
      <path d="M18 -14 L 44 -2 L 40 -10 L 46 -14 L 22 -22 Z" fill="#2E2A3A" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <ellipse cx={0} cy={-16} rx={28} ry={18} fill="#2E2A3A" stroke={INK} strokeWidth={4} />
      <g data-k="raven-wing">
        <path d="M-8 -22 C 6 -28 22 -22 26 -12 C 14 -8 0 -10 -8 -22Z" fill="#4B4060" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g>
      <path d="M-6 0 L -8 8 M6 0 L 6 8" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <g data-k="raven-head">
        <circle cx={-20} cy={-30} r={14} fill="#2E2A3A" stroke={INK} strokeWidth={4} />
        <path d="M-31 -34 L -52 -27 L -31 -24 Z" fill="#3E3850" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <circle cx={-22} cy={-33} r={3.6} fill="#FFFFFF" />
        <circle cx={-23} cy={-33} r={1.8} fill={INK} />
        <path d="M-14 -40 C -10 -38 -8 -34 -9 -30" fill="none" stroke="#8C7BB8" strokeWidth={2.5} strokeLinecap="round" />
      </g>
    </g>
  )
}

/** The banana slug: big, bright yellow with brown spots, two eye stalks (`slug-eyes`, they pull in when poked). */
function Slug() {
  return (
    <g data-k="slug">
      <path d="M-40 0 C -40 -14 -28 -24 -6 -26 C 16 -28 30 -22 36 -10 C 40 -2 38 0 34 0 Z" fill="#F6D44A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-30 0 L 34 0" stroke="#E2B92E" strokeWidth={4} />
      {[
        [-22, -14, 4],
        [-6, -18, 3.5],
        [10, -16, 4],
        [-14, -6, 3],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#8A6A2E" />
      ))}
      <circle cx={26} cy={-12} r={2.6} fill={INK} />
      <path d="M22 -4 Q 27 -1 31 -4" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <g data-k="slug-eyes" style={{ transformOrigin: '30px -20px' }}>
        <line x1={28} y1={-20} x2={36} y2={-44} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <line x1={22} y1={-22} x2={24} y2={-44} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
        <circle cx={36} cy={-44} r={4.5} fill="#F6D44A" stroke={INK} strokeWidth={2.5} />
        <circle cx={24} cy={-44} r={4.5} fill="#F6D44A" stroke={INK} strokeWidth={2.5} />
      </g>
    </g>
  )
}

/** A five-pointed star centered at (cx, cy). */
function star(cx: number, cy: number, r: number) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    const rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return `M${pts.join(' L ')} Z`
}

function useScene(st: StageDef, river: River, vb: { x: number; y: number; w: number; h: number }) {
  const vx0 = Math.round(vb.x / 50) * 50
  const vx1 = Math.round((vb.x + vb.w) / 50) * 50
  return useMemo(() => {
    const r = rng(st.w * 7 + st.h)
    const bot = st.h + 2000
    const n = river.pools.length
    // The water: each pool from its left lip's face (or the far left) to the next lip's face.
    const water = river.pools.map((p, i) => {
      const x0 = i === 0 ? -BIG : lip(river, i - 1).x
      const x1 = i === n - 1 ? BIG : lip(river, i).x + 2
      return `M${x0} ${p.y} L ${x1} ${p.y} L ${x1} ${p.y + p.d + 20} L ${x0} ${p.y + p.d + 20} Z`
    })
    // Light on the water: short shining streaks in every pool.
    const shine: [number, number, number][] = []
    for (const [i, p] of river.pools.entries()) {
      const a = Math.max(vx0, i === 0 ? vx0 : lip(river, i - 1).x + 20)
      const b = Math.min(vx1, i === n - 1 ? vx1 : lip(river, i).x - 30)
      for (let x = a + 20; x < b - 60; x += 110 + r() * 80) shine.push([x, p.y + 16 + r() * Math.min(60, p.d - 30), 30 + r() * 40])
    }
    // The rock: under each pool's floor, up each lip's face to just under the upper pool's water, along the lip, down
    // into the upper pool.
    const pts: string[] = [`${-BIG} ${bot}`, `${-BIG} ${river.pools[0].y + river.pools[0].d}`]
    const moss: string[] = []
    const falls: [number, number, number][] = []
    const stones: [number, number, number, number][] = []
    for (let i = 0; i < n - 1; i++) {
      const l = lip(river, i)
      const lo = river.pools[i]
      const up = river.pools[i + 1]
      pts.push(`${l.x - 30} ${lo.y + lo.d}`, `${l.x} ${lo.y + lo.d - 30}`, `${l.x} ${l.top}`, `${up.x0 - 6} ${l.top}`, `${up.x0 + 30} ${up.y + up.d}`)
      falls.push([l.x, up.y - 2, lo.y + 4])
      moss.push(`M${l.x - 4} ${lo.y + 2} Q ${l.x - 22} ${lo.y - 16} ${l.x - 4} ${lo.y - 30} Z`)
      // Moss hanging from the lip's top edge, beside the falls.
      moss.push(`M${l.x + 4} ${l.top - 2} L ${up.x0 - 4} ${l.top - 2} Q ${(l.x + up.x0) / 2 + 6} ${l.top + 22} ${l.x + 8} ${l.top + 14} Z`)
      for (let y = l.top + 60; y < lo.y - 20; y += 70) stones.push([l.x + 26 + r() * 20, y, 12 + r() * 8, 7 + r() * 4])
    }
    // Pebbles in the rock under each pool's floor.
    for (const [i, p] of river.pools.entries()) {
      const a = Math.max(vx0, i === 0 ? vx0 : lip(river, i - 1).x + 40)
      const b = Math.min(vx1, i === n - 1 ? vx1 : lip(river, i).x - 50)
      for (let x = a + 30; x < b; x += 150 + r() * 100) stones.push([x, p.y + p.d + 50 + r() * 60, 18 + r() * 12, 9 + r() * 5])
    }
    const last = river.pools[n - 1]
    pts.push(`${BIG} ${last.y + last.d}`, `${BIG} ${bot}`)
    const rock = `M${pts.join(' L ')} Z`
    // The far and mid layers, side by side across the view.
    const farW = 1150
    const forestW = 950
    const farTiles: number[] = []
    for (let x = Math.floor((vx0 - 200) / farW) * farW; x < vx1 + 200; x += farW) farTiles.push(x)
    const forestTiles: number[] = []
    for (let x = Math.floor((vx0 - 200) / forestW) * forestW + 300; x < vx1 + 200; x += forestW) forestTiles.push(x - forestW)
    forestTiles.push(forestTiles[forestTiles.length - 1] + forestW)
    // The mossy bank below the forest, in soft mounds that step down toward the river.
    const mounds: [string, string][] = []
    const tones = ['#9CC27A', '#8DB86E', '#80AE66', '#74A35E', '#6A9A58']
    const bankFerns: [number, number, number, boolean][] = []
    const bankRocks: [number, number, number][] = []
    for (let row = 0; row < tones.length; row++) {
      const y0 = st.bank + 60 + row * 150
      if (y0 > river.pools[0].y) break
      // Ferns and the odd mossy boulder along the crest (only where the river doesn't cover it).
      for (let x = vx0 - 40 + r() * 120; x < vx1 + 40; x += 150 + r() * 130) {
        if (river.pools[poolAt(river, x)].y < y0 + 30) continue
        if (row === 0 && (Math.abs(x - st.slug[0]) < 150 || Math.abs(x - st.cedar[0]) < 120)) continue
        if (r() < 0.18) bankRocks.push([x, y0 + 24, 70 + r() * 40])
        else bankFerns.push([x, y0 + 30, 90 + r() * 50 + row * 8, r() < 0.35])
      }
      let d = `M${vx0 - 300} ${y0 + 800}`
      for (let x = vx0 - 300; x < vx1 + 300; x += 180) d += ` L ${x} ${y0 + 20 * Math.sin(x * 0.01 + row)} Q ${x + 90} ${y0 - 50 - 20 * Math.sin(x * 0.02 + row)} ${x + 180} ${y0 + 20 * Math.sin((x + 180) * 0.01 + row)}`
      d += ` L ${vx1 + 300} ${y0 + 800} Z`
      mounds.push([d, tones[row]])
    }
    // Ferns: along the back of each pool (their feet in the water) and dotted on the bank.
    const ferns: [number, number, number, boolean][] = []
    for (const [i, p] of river.pools.entries()) {
      const a = Math.max(vx0 - 60, i === 0 ? vx0 - 60 : lip(river, i - 1).x + 30)
      const b = Math.min(vx1 + 60, i === n - 1 ? vx1 + 60 : lip(river, i).x - 20)
      for (let x = a; x < b; x += 190 + r() * 120) ferns.push([x, p.y + 14, 110 + r() * 50, r() < 0.35])
    }
    for (let x = vx0 - 40; x < vx1 + 40; x += 260 + r() * 140) {
      if (Math.abs(x - st.maple[0]) < 120 || st.berries.some(([bx]) => Math.abs(x - bx) < 110) || Math.abs(x - st.slug[0]) < 140 || Math.abs(x - st.cub[0]) < 80) continue
      ferns.push([x, st.bank + 40, 120 + r() * 40, r() < 0.4])
    }
    const trees = st.trees
    const cedarW = 300
    // The stream's gravel (the payoff), snow and blossoms.
    const gravel: [number, number, number, string][] = []
    const p0 = river.pools[0]
    for (let x = vx0 - 40; x < vx1 + 40; x += 18) gravel.push([x + r() * 8, p0.y + p0.d - 2 - r() * 10, 7 + r() * 5, ['#C9B9A6', '#B4A896', '#DCCFBF'][Math.floor(r() * 3)]])
    const snow: Pt[] = []
    for (let i = 0; i < 80; i++) snow.push([vx0 + r() * (vx1 - vx0), vb.y - 120 + r() * (vb.h + 120)])
    const bloom: Pt[] = []
    for (const [x, y, h] of trees) for (let j = 0; j < 4; j++) bloom.push([x + (r() - 0.5) * h * 0.4, y - h * (0.2 + r() * 0.6)])
    for (let j = 0; j < 6; j++) bloom.push([st.cedar[0] + (r() - 0.5) * 200, st.raven[1] - 140 - r() * 330])
    for (const [bx, by] of st.berries) for (let j = 0; j < 4; j++) bloom.push([bx + (r() - 0.5) * 120, by - 30 - r() * 90])
    return { water, shine, rock, moss, falls, stones, farW, forestW, farTiles, forestTiles, mounds, bankFerns, bankRocks, ferns, trees, cedarW, gravel, snow, bloom }
  }, [st, river, vx0, vx1, vb.y, vb.h])
}

const SVG_STYLE = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' }

const CSS = `
.salmon-hint { animation: salmon-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes salmon-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.salmon-fall { stroke-dasharray: 18 26; animation: salmon-fall 0.5s linear infinite; }
.salmon-fall2 { animation-duration: 0.37s; }
@keyframes salmon-fall { to { stroke-dashoffset: -44 } }
.salmon-foam { animation: salmon-foam 0.9s ease-in-out infinite; transform-box: fill-box; transform-origin: center bottom; }
@keyframes salmon-foam { 0%,100% { transform: scale(1, 1) } 50% { transform: scale(1.06, 0.9) } }
.salmon-shine { animation: salmon-shine 3.5s ease-in-out infinite; }
@keyframes salmon-shine { 0%,100% { opacity: 0.15 } 50% { opacity: 0.8 } }
`

const AGAIN = { position: 'absolute' as const, zIndex: 31, right: 'calc(var(--safe-right, 0px) + 16px)', bottom: 'calc(var(--safe-bottom) + 70px)', pointerEvents: 'auto' as const }

const TALLY = {
  position: 'absolute' as const,
  zIndex: 30,
  left: '50%',
  transform: 'translateX(-50%)',
  top: 'calc(var(--top-clear) + 8px)',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  pointerEvents: 'none' as const,
}
const CHIP = {
  height: 'clamp(26px, 4vmin, 36px)',
  padding: '0 12px',
  borderRadius: 999,
  background: 'rgba(255,255,255,.85)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 'clamp(14px, 2.4vmin, 20px)',
  fontWeight: 700,
  color: 'var(--lavender-dark)',
}
const DOT = { width: 12, height: 12, borderRadius: 99, border: '2px solid rgba(74,59,87,.25)' }

const PILL = {
  background: 'rgba(255,255,255,.92)',
  color: 'var(--ink)',
  border: 'none',
  borderRadius: 999,
  padding: '8px 20px',
  minHeight: 44,
  fontFamily: 'inherit',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
  pointerEvents: 'auto' as const,
}
