// Salmon Leap (greybox 8, plan: planning/around-the-world/canada.html): the salmon swimming home up a river in BC's
// Great Bear Rainforest, seen from the side. One verb, flick the salmon: her finger grabs one in its pool and flicks it
// (fish.ts), it leaps in an arc, splashes into the pool it comes down in and wiggles. It gets richer three times:
//   steps   A little cascade of four low steps, one salmon at a time. Each one up a step does a happy wiggle.
//   falls   The big falls: three tall ledges, three salmon at once, a rock to bounce off and a springy log that throws
//           them up the falls (her choice: the rock face, the log, or one big flick).
//   bears   The same falls with a black bear and the white spirit bear fishing on the ledges. They lunge, but the
//           salmon bounce off their noses (boop!, up and over), the bears sneeze and plop back in the water, and after a
//           couple of boops each wades off to the berry bushes instead.
//   eggs    Home: the stream where they were born. She taps each salmon to lay its pink eggs in the gravel, the seasons
//           turn (fall, snow, spring blossoms), and she taps the eggs to hatch the babies, who swim off to the sea.
// A flick too hard flies over the whole falls into Maple's lap (she giggles and drops it in the stream); a flick into
// the rock face bonks and slides back down; nothing is ever lost. Always there: rain (tap the cloud; it's a
// rainforest), a bald eagle circling (tap: it swoops), a raven on the giant cedar (tap: kraa), the cedar itself (tap:
// it creaks and drops a cone), a banana slug on a log (tap: it pulls its eyes in), the berry bushes, Maple's tail slap.
// The flick and the bounces are knobs (fish.ts), the hint here (?feel=1). 2D only: one SVG written every frame, no
// three.js or Phaser. Placeholder shapes, no voices yet (the full-loop gate): a short line at the bottom says what's on
// screen, for Dad.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, bigCelebration, burst, useElementSize } from '../../../../../sdk'
import { knobs, watch } from '../../../../kit/knobs'
import { useSections } from '../../../../kit/sections'
import { BOUNCE, FISH_R, FLICK, aim, launchTo, newFish, stepAir, type Bumper, type Fish } from './fish'
import { noises } from './noises'
import SALMON_SECTIONS, { type SalmonSection } from './sections'
import { TALL, WIDE, bearAt, bearsRiver, lip, poolAt, rng, type Pt, type River, type StageDef } from './stage'

const FILE = 'src/world/places/canada/activities/salmon/SalmonLeap.tsx'
const HINT = knobs('salmonHint', 'The hint', FILE, {
  after: { value: 8, min: 3, max: 30, step: 1, label: 'Hint after', unit: 's', note: 'a hand shows a flick up to the next pool after this long without one' },
})

const SAY: Record<SalmonSection, string> = {
  steps: '🐟 Flick the salmon up the little falls',
  falls: '🌊 The big falls! Flick them up: off the rock, the log, or one big flick',
  bears: '🐻 The bears are fishing! Flick the salmon past them',
  eggs: '🥚 Home! Tap each salmon to lay its eggs',
}
const LINES = {
  bonk: '💫 Bonk! A bigger flick',
  lap: '🦫 Too high! Right into Maple’s lap',
  boop: '🐻 Boop! Right on the nose',
  berries: '🫐 The bears went to eat berries instead',
  home: '🏡 Home in the stream!',
  log: '🪵 Boing! The springy log',
  rain: '🌧️ Rain! It’s a rainforest',
  spring: '🍂 Fall… ❄️ winter… 🌸 spring!',
  hatch: '🐣 Tap the eggs: the babies hatch',
  sea: '🌊 The babies swim off to the sea!',
}
const ORDER: SalmonSection[] = ['steps', 'falls', 'bears', 'eggs']
/** How many are home at the start of each section (`?home=` overrides), and how many get home in it. */
const START_HOME: Record<SalmonSection, number> = { steps: 0, falls: 3, bears: 7, eggs: 11 }
const NEED: Record<SalmonSection, number> = { steps: 3, falls: 4, bears: 4, eggs: 0 }
/** How many swim in the bottom pool at once. */
const AT_ONCE: Record<SalmonSection, number> = { steps: 1, falls: 3, bears: 3, eggs: 0 }
const homeParam = (home: number, section: SalmonSection) => (home === START_HOME[section] ? '' : String(home))

const INK = '#4A3B57'
const BIG = 6000
const MAX_FISH = 8
/** Screen pixels kept for the line at the bottom. */
const BOTTOM = 64
const MAX_EGGS = 12
const FRY_EACH = 3
const N_DROPS = 40
const N_RIPPLES = 6
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
const ease = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p))

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
  wave: number
  from: Pt
  bush: Pt
  el: SVGGElement
  pose: SVGGElement
  head: SVGGElement
  jaw: Element
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
  section: SalmonSection
  home: number
}
interface Events {
  info: (i: Info) => void
  say: (text: string) => void
  next: (section: SalmonSection, home: number) => void
  done: () => void
}

class SalmonWorld {
  st: StageDef
  river: River
  section: SalmonSection
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
  eggs: Egg[] = []
  phase: Phase
  phaseAt = 0
  laid = new Set<number>()
  vb = { x: 0, y: 0, w: 1600, h: 1000 }
  els: Record<string, Element | null> = {}
  fishEls: { root: SVGGElement; body: SVGGElement; tail: SVGGElement; glow: Element }[] = []
  eggEls: { g: SVGGElement; fry: SVGGElement[] }[] = []
  drops: { el: SVGLineElement; x: number; y: number; v: number }[] = []
  ripples: { el: SVGEllipseElement; x: number; y: number; t: number; big: boolean }[] = []
  rain = { on: false, t0: -9, next: 40 }
  eagle = { a: 0, swoop: -9 }
  raven = -9
  cedar = -9
  cone = { t0: -9, x: 0, y: 0 }
  slug = { x: 0, dir: 1, tuck: -9 }
  bushes = [-9, -9]
  maple = { slap: -9, lap: -9 }
  bonk = { t0: -9, x: 0, y: 0 }
  doneAt = -1
  r: () => number
  /** Set when the scene goes away (a new run, or React trying the effect twice): its timers do nothing then. */
  dead = false
  private later(f: () => void, ms: number) {
    setTimeout(() => !this.dead && f(), ms)
  }

  constructor(
    private svg: SVGSVGElement,
    stage: StageDef,
    section: SalmonSection,
    home: number,
    spirit: 'high' | 'low',
    seed: number,
    private ev: Events,
  ) {
    this.st = stage
    this.section = section
    this.home = home
    this.startHome = home
    this.r = rng(seed)
    this.river = section === 'bears' ? bearsRiver(stage, spirit) : stage.rivers[section === 'eggs' ? 'eggs' : section]
    this.phase = section === 'eggs' ? 'lay' : 'play'
    const q = <T extends Element>(k: string) => svg.querySelector(`[data-k="${k}"]`) as T | null
    const qa = <T extends Element>(k: string) => [...svg.querySelectorAll(`[data-k="${k}"]`)] as T[]
    for (const k of ['hint', 'hint-path', 'hint-hand', 'eagle', 'eagle-wings', 'raven', 'raven-head', 'cedar', 'cone', 'slug', 'slug-eyes', 'maple', 'maple-tail', 'bonk', 'rain', 'cloud', 'season', 'snow', 'bloom', 'bush0', 'bush1'])
      this.els[k] = q(k)
    for (const root of qa<SVGGElement>('fish'))
      this.fishEls.push({ root, body: root.querySelector('[data-k="fbody"]')!, tail: root.querySelector('[data-k="ftail"]')!, glow: root.querySelector('[data-k="fglow"]')! })
    for (const g of qa<SVGGElement>('egg')) this.eggEls.push({ g, fry: [...g.querySelectorAll<SVGGElement>('[data-k="fry"]')] })
    for (const el of qa<SVGLineElement>('drop')) this.drops.push({ el, x: 0, y: -9999, v: 0 })
    for (const el of qa<SVGEllipseElement>('ripple')) this.ripples.push({ el, x: 0, y: 0, t: 9, big: false })
    // The bears on their ledges.
    for (const [i, b] of this.river.bears.entries()) {
      const at = bearAt(this.river, b.lip)
      const el = q<SVGGElement>(`bear-${i}`)!
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
        wave: -9,
        from: [at.x, at.y],
        bush: stage.berries[i % stage.berries.length],
        el,
        pose: el.querySelector('[data-k="pose"]')!,
        head: el.querySelector('[data-k="head"]')!,
        jaw: el.querySelector('[data-k="jaw"]')!,
      })
    }
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
    this.later(() => this.info(), 0)
  }

  // -------------------------------------------------------------- state

  private info() {
    this.ev.info({ section: this.section, home: this.home })
  }

  private say(text: string) {
    this.ev.say(text)
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
    const f = { id: e.pointerId, fish: null as Fish | null, x, y, sx: e.clientX, sy: e.clientY, moved: 0, trail: [[this.now, x, y]] as [number, number, number][] }
    this.finger = f
    // A salmon first (the eggs' stream: a tap lays eggs; the river: grab it to flick).
    const hit = this.nearestFish(x, y)
    if (hit) {
      if (this.phase === 'lay') return this.lay(hit)
      if (this.phase === 'play') {
        f.fish = hit
        hit.mode = 'held'
        hit.t = 0
        noises.splash(false)
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
  }

  // -------------------------------------------------------------- pokes

  private poke(x: number, y: number) {
    const st = this.st
    const near = (p: Pt, r: number) => Math.hypot(p[0] - x, p[1] - y) < r
    for (const b of this.bears) {
      if (Math.hypot(b.x - 40 - x, b.y - 80 - y) < 100) {
        if (b.state === 'fish' || b.state === 'berries') {
          b.wave = this.now
          noises.grumble()
        }
        return true
      }
    }
    if (near([st.maple[0], st.maple[1] - 50], 90)) {
      this.maple.slap = this.now
      noises.slap()
      return true
    }
    for (const [i, p] of st.berries.entries())
      if (near([p[0], p[1] - 30], 70)) {
        this.bushes[i] = this.now
        noises.jiggle()
        return true
      }
    if (near(this.eaglePos(), 90)) {
      if (this.now - this.eagle.swoop > 2.2) this.eagle.swoop = this.now
      noises.screech()
      return true
    }
    if (near(st.raven, 70)) {
      this.raven = this.now
      noises.kraa()
      return true
    }
    if (near([this.slug.x, st.slug[1] - 14], 70)) {
      this.slug.tuck = this.now
      noises.jiggle()
      return true
    }
    if (near(st.cloud, 130)) {
      this.toggleRain()
      return true
    }
    const [cx, ch] = st.cedar
    if (Math.abs(x - cx) < 75 && y < st.bank && y > st.bank - ch) {
      this.cedar = this.now
      noises.creak()
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
      this.say(LINES.rain)
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
    this.say(LINES.spring)
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
      this.later(() => {
        bigCelebration()
        noises.home()
        this.say(LINES.sea)
        this.ev.done()
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
    for (const b of this.bears) if (b.state === 'fish') bumpers.push({ id: b.id, ...this.nose(b), r: 44 })
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
            this.say(LINES.bonk)
          },
          rock: () => noises.knock(),
          log: () => {
            noises.boing()
            this.say(LINES.log)
          },
          boop: (_s, id) => this.booped(this.bears[id]),
          land: (s, i) => this.land(s, i),
          lap: (s) => {
            s.mode = 'lap'
            s.t = 0
            this.maple.lap = now
            noises.giggle()
            this.say(LINES.lap)
          },
        })
        // Never stuck in the air (bouncing between a rock and a lip): after a while it drops into the pool under it.
        if (f.mode === 'air' && f.t > 4) this.land(f, poolAt(r, f.x))
      } else if (f.mode === 'lap') {
        f.x = this.st.maple[0] - 24
        f.y = this.st.maple[1] - 44
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
      this.later(() => this.ev.next(next, this.home), 2200)
    }
    // Rain comes and goes by itself too (it's a rainforest).
    if (now > this.rain.next) this.toggleRain()
    this.eagle.a += dt * 0.35
    this.slug.x += dt * 6 * this.slug.dir * (now - this.slug.tuck < 1.6 ? 0 : 1)
    if (Math.abs(this.slug.x - this.st.slug[0]) > 50) this.slug.dir = this.slug.x > this.st.slug[0] ? -1 : 1
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
      this.say(LINES.home)
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
    return { x: b.x - 64 - b.lunge * 26, y: b.y - 96 - b.lunge * 10 }
  }

  private booped(b: BearRt) {
    if (b.state !== 'fish') return
    b.boops++
    b.state = 'sneeze'
    b.t0 = this.now
    noises.boop()
    this.say(LINES.boop)
  }

  private tickBears(dt: number) {
    const now = this.now
    for (const b of this.bears) {
      const t = now - b.t0
      if (b.state === 'fish') {
        // Lunge at a salmon flying near.
        const n = this.nose(b)
        const near = this.fish.some((f) => f.mode === 'air' && Math.hypot(f.x - n.x, f.y - n.y) < 260)
        b.lunge += ((near ? 1 : 0) - b.lunge) * (1 - Math.exp(-dt * (near ? 10 : 4)))
      } else b.lunge += (0 - b.lunge) * (1 - Math.exp(-dt * 6))
      if (b.state === 'sneeze' && t > 0.9) {
        b.state = 'plop'
        b.t0 = now
        noises.plop()
        this.ripple(b.x, b.home[1] - 30, true)
      } else if (b.state === 'plop' && t > 1.1) {
        b.t0 = now
        if (b.boops >= BOUNCE.boops) {
          b.state = 'roll'
          noises.grumble()
        } else b.state = 'fish'
      } else if (b.state === 'roll' && t > 1) {
        b.state = 'wade'
        b.t0 = now
        b.from = [b.x, b.y]
      } else if (b.state === 'wade') {
        const p = ease(t / 2.8)
        b.x = b.from[0] + (b.bush[0] - 60 - b.from[0]) * p
        b.y = b.from[1] + (b.bush[1] + 6 - b.from[1]) * p - Math.abs(Math.sin(t * 7)) * 8
        if (t > 2.8) {
          b.state = 'berries'
          b.t0 = now
          noises.grumble()
          if (this.bears.every((o) => o.state === 'berries')) this.say(LINES.berries)
        }
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
        this.say(LINES.hatch)
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
      put(el.root, 'transform', `translate(${f.x.toFixed(1)} ${(f.y + dip).toFixed(1)})`)
      put(el.root, 'opacity', (fade * (inWater ? 0.78 : 1)).toFixed(2))
      put(el.body, 'transform', `scale(${flip} 1) rotate(${(ang * flip).toFixed(1)})`)
      put(el.tail, 'transform', `rotate(${(Math.sin(f.wig) * (f.mode === 'air' || f.mode === 'held' ? 30 : 16)).toFixed(1)} -30 0)`)
      put(el.glow, 'opacity', f === glowFish ? (0.45 + 0.35 * Math.sin(now * 6)).toFixed(2) : '0')
    }
    // The bears.
    for (const b of this.bears) {
      const t = now - b.t0
      let rot = 0
      let dy = 0
      let headRot = -b.lunge * 18
      let jaw = 0.2 + b.lunge * 0.8
      if (b.state === 'sneeze') {
        headRot = t < 0.45 ? -10 * Math.sin((t / 0.45) * Math.PI) : 22 * Math.sin(((t - 0.45) / 0.45) * Math.PI)
        jaw = t > 0.45 ? 1 : 0.4
      } else if (b.state === 'plop') {
        dy = 36 * Math.sin(clamp(t / 0.3, 0, 1) * Math.PI * 0.5) * (1 - clamp((t - 0.7) / 0.4, 0, 1))
        rot = 8 * Math.sin(t * 6) * (1 - t / 1.1)
      } else if (b.state === 'roll') rot = -360 * ease(t)
      else if (b.state === 'berries') {
        headRot = 10 + Math.sin(now * 5) * 8
        jaw = 0.4 + 0.4 * Math.abs(Math.sin(now * 5))
      } else if (b.state === 'fish') dy = Math.sin(now * 1.6 + b.id) * 2
      const wave = now - b.wave
      if (wave < 0.8) headRot += Math.sin(wave * 16) * 12
      const scale = b.state === 'wade' || b.state === 'berries' ? 1 - 0.2 * clamp((b.home[1] - b.y) / Math.max(1, b.home[1] - b.bush[1]), 0, 1) : 1
      put(b.el, 'transform', `translate(${b.x.toFixed(1)} ${(b.y + dy).toFixed(1)}) scale(${scale.toFixed(3)})`)
      put(b.pose, 'transform', `rotate(${rot.toFixed(1)} 0 -60)`)
      put(b.head, 'transform', `rotate(${headRot.toFixed(1)} -30 -78) translate(${(-b.lunge * 20).toFixed(1)} 0)`)
      put(b.jaw, 'transform', `scale(1 ${jaw.toFixed(2)})`)
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
    // The bonk's stars.
    const bk = now - this.bonk.t0
    put(this.els.bonk, 'transform', `translate(${this.bonk.x.toFixed(0)} ${(this.bonk.y - 30 - bk * 30).toFixed(0)})`)
    put(this.els.bonk, 'opacity', bk < 0.8 ? (1 - bk / 0.8).toFixed(2) : '0')
    // The rain.
    const rainOn = this.rain.on ? clamp((now - this.rain.t0) / 1.5, 0, 1) : 1 - clamp((now - this.rain.t0) / 1.5, 0, 1)
    put(this.els.rain, 'opacity', rainOn.toFixed(2))
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
    // The eagle.
    const [ex, ey] = this.eaglePos()
    const flap = Math.sin(now * (now - this.eagle.swoop < 2 ? 10 : 3))
    put(this.els.eagle, 'transform', `translate(${ex.toFixed(0)} ${ey.toFixed(0)}) scale(${-Math.sin(this.eagle.a) >= 0 ? 1 : -1} 1)`)
    put(this.els['eagle-wings'], 'transform', `scale(1 ${(0.4 + 0.6 * Math.abs(flap)).toFixed(2)})`)
    // The raven, the cedar, the cone, the slug, the bushes, Maple.
    const rv = now - this.raven
    put(this.els['raven-head'], 'transform', `rotate(${rv < 0.7 ? (Math.sin(rv * 18) * 20).toFixed(1) : '0'} 0 -16)`)
    const cd = now - this.cedar
    put(this.els.cedar, 'transform', `rotate(${cd < 1 ? (Math.sin(cd * 14) * 1.2 * (1 - cd)).toFixed(2) : '0'} ${this.st.cedar[0]} ${this.st.bank})`)
    const ct = now - this.cone.t0
    const cy = this.cone.y + 0.5 * 1800 * ct * ct
    put(this.els.cone, 'transform', `translate(${this.cone.x.toFixed(0)} ${Math.min(cy, this.st.bank + 30).toFixed(0)}) rotate(${(ct * 300).toFixed(0)})`)
    put(this.els.cone, 'opacity', ct < 2.2 ? '1' : '0')
    const tuck = now - this.slug.tuck
    put(this.els.slug, 'transform', `translate(${this.slug.x.toFixed(1)} ${this.st.slug[1]}) scale(${this.slug.dir} 1)`)
    put(this.els['slug-eyes'], 'transform', `scale(1 ${tuck < 1.6 ? (0.15 + 0.85 * clamp((tuck - 1.1) / 0.5, 0, 1)).toFixed(2) : '1'})`)
    for (const i of [0, 1]) {
      const bt = now - this.bushes[i]
      put(this.els[`bush${i}`], 'transform', `rotate(${bt < 0.6 ? (Math.sin(bt * 30) * 4).toFixed(1) : '0'} ${this.st.berries[i][0]} ${this.st.berries[i][1]})`)
    }
    const sl = now - this.maple.slap
    const lp = now - this.maple.lap
    put(this.els['maple-tail'], 'transform', `rotate(${sl < 0.5 ? (-40 * Math.sin((sl / 0.5) * Math.PI)).toFixed(1) : '0'} 18 -14)`)
    put(this.els.maple, 'transform', `translate(${this.st.maple[0]} ${this.st.maple[1]}) rotate(${lp < 1.3 ? (Math.sin(lp * 16) * 5).toFixed(1) : '0'} 0 -40)`)
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
      bears: this.bears.map((b) => ({ spirit: b.spirit, state: b.state, boops: b.boops, ...scr(b.x - 50, b.y - 90) })),
      eggs: this.eggs.map((g) => ({ hatched: g.hatched >= 0, ...scr(g.x, g.y) })),
      maple: scr(this.st.maple[0], this.st.maple[1] - 50),
      cloud: scr(this.st.cloud[0], this.st.cloud[1]),
      rain: this.rain.on,
    }
  }

  private hintFishAny() {
    let best: Fish | null = null
    const top = this.river.pools.length - 1
    for (const f of this.fish) if ((f.mode === 'swim' || f.mode === 'arrive') && (this.phase !== 'play' || f.pool < top) && (!best || f.pool < best.pool)) best = f
    return best
  }
}

// ---------------------------------------------------------------- React

interface Run {
  section: SalmonSection
  home: number
  spirit: 'high' | 'low'
  seed: number
  n: number
}

export function SalmonLeap() {
  const { start, param, enter } = useSections(SALMON_SECTIONS)
  const first = (start ?? 'steps') as SalmonSection
  const [run, setRun] = useState<Run>(() => {
    const h = parseInt(param('home'), 10)
    return { section: first, home: Number.isFinite(h) ? clamp(h, 0, 40) : START_HOME[first], spirit: param('spirit') === 'low' ? 'low' : 'high', seed: (Math.random() * 1e9) | 0, n: 0 }
  })
  const [say, setSay] = useState(SAY[run.section])
  const [info, setInfo] = useState<Info>({ section: run.section, home: run.home })
  const [done, setDone] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const world = useRef<SalmonWorld | null>(null)
  const size = useElementSize(box)
  const wide = !size.height || size.width / size.height >= 1.05
  const stage = wide ? WIDE : TALL
  const mid = `salmon${run.n}`

  // The view box: the stage scaled to fit above the line at the bottom (so it never covers the bottom pool, where the
  // salmon wait), the extra edge filled with more of the forest (sky above, the river at the sides, its rock below).
  const fitH = Math.max(1, size.height - BOTTOM)
  const k = size.width && size.height ? Math.min(size.width / stage.w, fitH / stage.h) : 1
  const vw = size.width ? size.width / k : stage.w
  const vh = size.height ? size.height / k : stage.h
  const vb = { x: (stage.w - vw) / 2, y: (stage.h - fitH / k) / 2, w: vw, h: vh }
  const river = run.section === 'bears' ? bearsRiver(stage, run.spirit) : stage.rivers[run.section === 'eggs' ? 'eggs' : run.section]

  useLayoutEffect(() => {
    if (!svg.current) return
    setSay(SAY[run.section])
    const w = new SalmonWorld(svg.current, stage, run.section, run.home, run.spirit, run.seed, {
      info: (i) => {
        setInfo(i)
        enter(i.section, { home: homeParam(i.home, i.section), spirit: run.spirit })
      },
      say: setSay,
      next: (section, home) => setRun((r) => ({ ...r, section, home, n: r.n + 1 })),
      done: () => setDone(true),
    })
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
            <stop offset="0" stopColor="#B9E2EE" />
            <stop offset="1" stopColor="#E6F5F0" />
          </linearGradient>
          <linearGradient id={`${mid}-water`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7CC6E4" />
            <stop offset="1" stopColor="#3E8CB8" />
          </linearGradient>
        </defs>
        <rect x={-BIG} y={-BIG} width={BIG * 2} height={BIG + st.bank} fill={`url(#${mid}-sky)`} />
        {/* The rain cloud. */}
        <g data-k="cloud" transform={`translate(${st.cloud[0]} ${st.cloud[1]})`}>
          <ellipse cx={0} cy={0} rx={110} ry={40} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={-40} cy={-24} r={38} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={26} cy={-34} r={46} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={4} rx={104} ry={34} fill="#FFFFFF" />
        </g>
        {/* Misty mountains and the far forest along the bank. */}
        <path d={scene.hills} fill="#A9D3C8" />
        {scene.far.map(([x, h], i) => (
          <path key={i} d={`M${x - 22} ${st.bank} L ${x} ${st.bank - h} L ${x + 22} ${st.bank} Z`} fill="#6FAE8E" />
        ))}
        <rect x={-BIG} y={st.bank} width={BIG * 2} height={BIG} fill="#7DBE7A" />
        {/* The giant cedar, taller than a building (it goes off the top), with the raven's branch. */}
        <g data-k="cedar">
          <rect x={st.cedar[0] - 46} y={st.bank - st.cedar[1] - 400} width={92} height={st.cedar[1] + 410} fill="#9A5C3C" stroke={INK} strokeWidth={5} />
          <path d={`M${st.cedar[0] - 46} ${st.bank} Q ${st.cedar[0] - 80} ${st.bank + 4} ${st.cedar[0] - 100} ${st.bank + 10} L ${st.cedar[0] + 100} ${st.bank + 10} Q ${st.cedar[0] + 80} ${st.bank + 4} ${st.cedar[0] + 46} ${st.bank} Z`} fill="#9A5C3C" stroke={INK} strokeWidth={5} />
          <line x1={st.cedar[0] + 40} y1={st.raven[1] + 6} x2={st.raven[0] + 70} y2={st.raven[1] - 6} stroke={INK} strokeWidth={14} strokeLinecap="round" />
          <line x1={st.cedar[0] + 40} y1={st.raven[1] + 6} x2={st.raven[0] + 70} y2={st.raven[1] - 6} stroke="#9A5C3C" strokeWidth={6} strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx={st.cedar[0] + (i % 2 ? 70 : -70)} cy={st.raven[1] - 140 - i * 110} rx={120} ry={46} fill="#3F8A62" stroke={INK} strokeWidth={5} />
          ))}
          <g data-k="raven" transform={`translate(${st.raven[0]} ${st.raven[1]})`}>
            <ellipse cx={0} cy={-14} rx={26} ry={16} fill="#2E2A3A" stroke={INK} strokeWidth={4} />
            <path d="M18 -16 L 40 -4 L 22 -6 Z" fill="#2E2A3A" />
            <g data-k="raven-head">
              <circle cx={-20} cy={-28} r={13} fill="#2E2A3A" stroke={INK} strokeWidth={4} />
              <path d="M-31 -30 L -46 -24 L -31 -23 Z" fill="#4A4458" />
              <circle cx={-22} cy={-31} r={3} fill="#FFFFFF" />
            </g>
          </g>
        </g>
        {scene.trees.map(([x, y, h], i) => (
          <Spruce key={i} x={x} y={y} h={h} />
        ))}
        {/* The banana slug on its mossy log, and the berry bushes. */}
        <rect x={st.slug[0] - 80} y={st.slug[1] - 6} width={160} height={30} rx={15} fill="#8BB36A" stroke={INK} strokeWidth={5} />
        <g data-k="slug" transform={`translate(${st.slug[0]} ${st.slug[1]})`}>
          <path d="M-30 -6 Q -28 -22 0 -22 Q 26 -22 30 -6 Z" fill="#F6D44A" stroke={INK} strokeWidth={4} />
          <g data-k="slug-eyes" transform="scale(1 1)" style={{ transformOrigin: '22px -18px' }}>
            <line x1={22} y1={-18} x2={28} y2={-36} stroke={INK} strokeWidth={3} />
            <line x1={18} y1={-18} x2={20} y2={-34} stroke={INK} strokeWidth={3} />
            <circle cx={28} cy={-36} r={3} fill={INK} />
            <circle cx={20} cy={-34} r={3} fill={INK} />
          </g>
        </g>
        {st.berries.map(([x, y], i) => (
          <g key={i} data-k={`bush${i}`}>
            <ellipse cx={x} cy={y - 30} rx={62} ry={40} fill="#4E9A5C" stroke={INK} strokeWidth={5} />
            {[-30, -6, 18, 34, -18, 8].map((dx, j) => (
              <circle key={j} cx={x + dx} cy={y - 40 + (j % 3) * 12} r={7} fill="#4A5BC4" stroke={INK} strokeWidth={2.5} />
            ))}
          </g>
        ))}
        {/* The river: pools behind, then the salmon, then the rock (which hides the water under each floor and the lips),
            the waterfalls over the lips, the rocks and the log. */}
        {scene.water.map((d, i) => (
          <path key={i} d={d} fill={`url(#${mid}-water)`} />
        ))}
        {river.bears.map((b, i) => (
          <BearShape key={i} id={i} spirit={b.spirit} />
        ))}
        <path d={scene.rock} fill="#A79C92" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {scene.moss.map((d, i) => (
          <path key={i} d={d} fill="#8BB36A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        ))}
        {run.section === 'eggs' && scene.gravel.map(([x, y, r, c], i) => <circle key={i} cx={x} cy={y} r={r} fill={c} stroke={INK} strokeWidth={2} />)}
        {scene.falls.map(([x, y0, y1], i) => (
          <g key={i}>
            <rect x={x - 20} y={y0} width={24} height={y1 - y0} fill="#E8F7FC" stroke={INK} strokeWidth={4} />
            <line x1={x - 13} y1={y0} x2={x - 13} y2={y1} stroke="#9FD6EC" strokeWidth={4} className="salmon-fall" />
            <line x1={x - 4} y1={y0} x2={x - 4} y2={y1} stroke="#9FD6EC" strokeWidth={4} className="salmon-fall salmon-fall2" />
            <ellipse cx={x - 8} cy={y1} rx={40} ry={10} fill="#FFFFFF" opacity={0.9} />
          </g>
        ))}
        {river.rocks.map((k, i) => (
          <g key={i}>
            <path d={`M${k.x - k.r} ${k.y + 30} Q ${k.x - k.r} ${k.y - k.r} ${k.x} ${k.y - k.r} Q ${k.x + k.r} ${k.y - k.r} ${k.x + k.r} ${k.y + 30} Z`} fill="#8E837A" stroke={INK} strokeWidth={5} />
          </g>
        ))}
        {river.logs.map((g, i) => (
          <g key={i}>
            <line x1={g.a[0]} y1={g.a[1]} x2={g.b[0]} y2={g.b[1]} stroke={INK} strokeWidth={34} strokeLinecap="round" />
            <line x1={g.a[0]} y1={g.a[1]} x2={g.b[0]} y2={g.b[1]} stroke="#B07A4E" strokeWidth={24} strokeLinecap="round" />
            <circle cx={g.b[0]} cy={g.b[1]} r={10} fill="#E3B98A" stroke={INK} strokeWidth={3} />
          </g>
        ))}
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
                  <circle key={j} cx={x} cy={y} r={11} fill="#FF8FB1" stroke={INK} strokeWidth={3} />
                ))}
              </g>
              {Array.from({ length: FRY_EACH }, (_, j) => (
                <g key={j} data-k="fry" display="none">
                  <ellipse cx={0} cy={0} rx={18} ry={8} fill="#F3B3A8" stroke={INK} strokeWidth={2.5} />
                  <circle cx={-9} cy={-2} r={2.5} fill={INK} />
                  <circle cx={3} cy={6} r={4.5} fill="#FF8FB1" stroke={INK} strokeWidth={1.5} />
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* The salmon. */}
        {Array.from({ length: MAX_FISH }, (_, i) => (
          <g key={i} data-k="fish" display="none">
            <ellipse data-k="fglow" cx={0} cy={0} rx={62} ry={36} fill="#FFFFFF" opacity={0} />
            <g data-k="fbody">
              <g data-k="ftail">
                <path d="M-28 0 L -54 -18 L -48 0 L -54 18 Z" fill="#D9434F" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
              </g>
              <ellipse cx={0} cy={0} rx={34} ry={15} fill="#E85A64" stroke={INK} strokeWidth={4} />
              <path d="M-26 -6 Q 0 -18 26 -6" fill="none" stroke="#8C9A6E" strokeWidth={7} strokeLinecap="round" />
              <path d="M-6 -14 L 4 -24 L 10 -13 Z" fill="#D9434F" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
              <circle cx={20} cy={-3} r={4.5} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
              <circle cx={21} cy={-3} r={2} fill={INK} />
            </g>
          </g>
        ))}
        {/* Maple the beaver on the top bank (the salmon flicked too hard land in her lap). */}
        <g data-k="maple" transform={`translate(${st.maple[0]} ${st.maple[1]})`}>
          <ellipse cx={0} cy={6} rx={70} ry={12} fill="#000" opacity={0.12} />
          <g data-k="maple-tail">
            <ellipse cx={42} cy={-6} rx={36} ry={14} fill="#5A4A5E" stroke={INK} strokeWidth={4} transform="rotate(-15 42 -6)" />
          </g>
          <ellipse cx={0} cy={-36} rx={38} ry={40} fill="#A86B3C" stroke={INK} strokeWidth={5} />
          <ellipse cx={0} cy={-24} rx={22} ry={22} fill="#E6C49A" />
          <circle cx={-6} cy={-86} r={30} fill="#A86B3C" stroke={INK} strokeWidth={5} />
          <circle cx={-28} cy={-108} r={9} fill="#A86B3C" stroke={INK} strokeWidth={4} />
          <circle cx={16} cy={-108} r={9} fill="#A86B3C" stroke={INK} strokeWidth={4} />
          <circle cx={-16} cy={-90} r={4} fill={INK} />
          <circle cx={6} cy={-90} r={4} fill={INK} />
          <ellipse cx={-5} cy={-77} rx={9} ry={6} fill="#4A3B57" />
          <rect x={-10} y={-72} width={10} height={10} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
          <circle cx={-26} cy={-78} r={5} fill="#F7A9C0" />
          <circle cx={14} cy={-78} r={5} fill="#F7A9C0" />
        </g>
        {/* The bald eagle. */}
        <g data-k="eagle">
          <g data-k="eagle-wings">
            <path d="M-6 0 Q -50 -40 -90 -10 Q -50 -14 -6 8 Z" fill="#5A3E2E" stroke={INK} strokeWidth={4} />
            <path d="M6 0 Q 50 -40 90 -10 Q 50 -14 6 8 Z" fill="#5A3E2E" stroke={INK} strokeWidth={4} />
          </g>
          <ellipse cx={0} cy={4} rx={20} ry={13} fill="#5A3E2E" stroke={INK} strokeWidth={4} />
          <circle cx={22} cy={-2} r={11} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
          <path d="M31 -3 L 42 2 L 31 4 Z" fill="#F4C542" />
        </g>
        {/* Splashes, bonks, the cone, the rain. */}
        {Array.from({ length: N_RIPPLES }, (_, i) => (
          <ellipse key={i} data-k="ripple" cx={0} cy={0} rx={10} ry={4} fill="none" stroke="#FFFFFF" strokeWidth={5} opacity={0} />
        ))}
        <text data-k="bonk" fontSize={56} textAnchor="middle" opacity={0}>
          💫
        </text>
        <g data-k="cone" opacity={0}>
          <ellipse cx={0} cy={0} rx={10} ry={16} fill="#8A5A34" stroke={INK} strokeWidth={3} />
        </g>
        <g data-k="rain" opacity={0}>
          {Array.from({ length: N_DROPS }, (_, i) => (
            <line key={i} data-k="drop" x1={0} y1={-9999} x2={0} y2={-9999} stroke="#7FB6D9" strokeWidth={4} strokeLinecap="round" />
          ))}
        </g>
        {/* The payoff's seasons: a tint for fall and winter, snow, and blossoms on the bank. */}
        {run.section === 'eggs' && (
          <>
            <rect data-k="season" x={-BIG} y={-BIG} width={BIG * 2} height={BIG * 2} fill="#FFFFFF" opacity={0} pointerEvents="none" />
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
        <g data-k="hint" opacity={0} pointerEvents="none">
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
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(var(--safe-bottom) + 14px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, pointerEvents: 'none', zIndex: 30 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={say} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} style={PILL}>
            {say}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- pieces of the scene

/** A bear standing in the falls facing left, feet at (0, 0): `pose` rolls, `head` lunges and sneezes, `jaw` opens. */
function BearShape({ id, spirit }: { id: number; spirit: boolean }) {
  const fill = spirit ? '#F6F1E6' : '#3A3340'
  const dark = spirit ? '#DCD2C0' : '#26212C'
  return (
    <g data-k={`bear-${id}`}>
      <g data-k="pose">
        <rect x={-34} y={-30} width={24} height={34} rx={10} fill={dark} stroke={INK} strokeWidth={5} />
        <rect x={18} y={-30} width={24} height={34} rx={10} fill={dark} stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={-60} rx={62} ry={46} fill={fill} stroke={INK} strokeWidth={5} />
        <g data-k="head">
          <circle cx={-36} cy={-120} r={13} fill={fill} stroke={INK} strokeWidth={5} />
          <circle cx={-2} cy={-118} r={13} fill={fill} stroke={INK} strokeWidth={5} />
          <circle cx={-30} cy={-92} r={36} fill={fill} stroke={INK} strokeWidth={5} />
          <g data-k="jaw" style={{ transformOrigin: '-62px -80px' }}>
            <ellipse cx={-62} cy={-76} rx={16} ry={9} fill="#C94F6D" stroke={INK} strokeWidth={3} />
          </g>
          <ellipse cx={-62} cy={-88} rx={20} ry={14} fill="#C9A57E" stroke={INK} strokeWidth={4} />
          <ellipse cx={-78} cy={-92} rx={8} ry={6} fill={INK} />
          <circle cx={-40} cy={-104} r={4.5} fill={INK} />
          <circle cx={-48} cy={-84} r={6} fill="#F7A9C0" opacity={0.8} />
        </g>
      </g>
      <ellipse cx={0} cy={-6} rx={70} ry={10} fill="#FFFFFF" opacity={0.85} />
    </g>
  )
}

function Spruce({ x, y, h }: { x: number; y: number; h: number }) {
  const w = h * 0.36
  return (
    <g>
      <rect x={x - 7} y={y - 20} width={14} height={24} fill="#7A5236" />
      <path d={`M${x} ${y - h} L ${x + w * 0.55} ${y - h * 0.55} L ${x + w * 0.3} ${y - h * 0.55} L ${x + w} ${y - 16} L ${x - w} ${y - 16} L ${x - w * 0.3} ${y - h * 0.55} L ${x - w * 0.55} ${y - h * 0.55} Z`} fill="#4F9A6E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  )
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
    // The rock: under each pool's floor, up each lip's face to just under the upper pool's water, along the lip, down
    // into the upper pool.
    const pts: string[] = [`${-BIG} ${bot}`, `${-BIG} ${river.pools[0].y + river.pools[0].d}`]
    const moss: string[] = []
    const falls: [number, number, number][] = []
    for (let i = 0; i < n - 1; i++) {
      const l = lip(river, i)
      const lo = river.pools[i]
      const up = river.pools[i + 1]
      pts.push(`${l.x - 30} ${lo.y + lo.d}`, `${l.x} ${lo.y + lo.d - 30}`, `${l.x} ${l.top}`, `${up.x0 - 6} ${l.top}`, `${up.x0 + 30} ${up.y + up.d}`)
      falls.push([l.x, up.y - 2, lo.y + 4])
      moss.push(`M${l.x - 4} ${lo.y + 2} Q ${l.x - 18} ${lo.y - 14} ${l.x - 4} ${lo.y - 26} Z`)
    }
    const last = river.pools[n - 1]
    pts.push(`${BIG} ${last.y + last.d}`, `${BIG} ${bot}`)
    const rock = `M${pts.join(' L ')} Z`
    // The far hills, the far forest, the near spruces on the bank.
    const hills = `M${-BIG} ${st.bank} L ${-BIG} ${st.bank - 120} ` + Array.from({ length: 24 }, (_, i) => `Q ${-400 + i * 200 + 100} ${st.bank - 260 - (i % 3) * 60} ${-400 + (i + 1) * 200} ${st.bank - 140}`).join(' ') + ` L ${BIG} ${st.bank - 120} L ${BIG} ${st.bank} Z`
    const far: [number, number][] = []
    for (let x = vx0 - 200; x < vx1 + 200; x += 36) if (Math.abs(x - st.cedar[0]) > 70) far.push([x, 50 + 30 * Math.abs(Math.sin(x * 0.05)) + 14 * Math.sin(x * 0.013)])
    const trees = st.trees
    // The stream's gravel (the payoff), snow and blossoms.
    const gravel: [number, number, number, string][] = []
    const p0 = river.pools[0]
    for (let x = vx0 - 40; x < vx1 + 40; x += 18) gravel.push([x + r() * 8, p0.y + p0.d - 2 - r() * 10, 7 + r() * 5, ['#C9B9A6', '#B4A896', '#DCCFBF'][Math.floor(r() * 3)]])
    const snow: Pt[] = []
    for (let i = 0; i < 80; i++) snow.push([vx0 + r() * (vx1 - vx0), vb.y - 120 + r() * (vb.h + 120)])
    const bloom: Pt[] = []
    for (const [x, y, h] of trees) for (let j = 0; j < 4; j++) bloom.push([x + (r() - 0.5) * h * 0.5, y - h * (0.2 + r() * 0.6)])
    for (let j = 0; j < 6; j++) bloom.push([st.cedar[0] + (r() - 0.5) * 200, st.raven[1] - 140 - r() * 330])
    return { water, rock, moss, falls, hills, far, trees, gravel, snow, bloom }
  }, [st, river, vx0, vx1, vb.y, vb.h])
}

const SVG_STYLE = { position: 'absolute' as const, inset: 0, width: '100%', height: '100%', display: 'block' }

const CSS = `
.salmon-hint { animation: salmon-hint 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes salmon-hint { 0%,100% { transform: scale(1) } 50% { transform: scale(1.15) } }
.salmon-fall { stroke-dasharray: 18 26; animation: salmon-fall 0.5s linear infinite; }
.salmon-fall2 { animation-duration: 0.37s; }
@keyframes salmon-fall { to { stroke-dashoffset: -44 } }
`

const AGAIN = { position: 'absolute' as const, zIndex: 31, right: 'calc(var(--safe-right, 0px) + 16px)', bottom: 'calc(var(--safe-bottom) + 70px)', pointerEvents: 'auto' as const }

const TALLY = {
  position: 'absolute' as const,
  zIndex: 30,
  right: 'calc(var(--safe-right, 0px) + 12px)',
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
  borderRadius: 999,
  padding: '8px 20px',
  fontSize: 'clamp(16px, 2.4vmin, 22px)',
  fontWeight: 600,
  boxShadow: 'var(--shadow)',
  textAlign: 'center' as const,
  maxWidth: '100%',
}
