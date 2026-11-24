// Sail the Nile: Miu's flower boat.
// The toy (one core verb): put a finger on the water and the felucca sails to it. It chases the finger with a little
// water lag, leans as it climbs and dives, bobs, billows its sail and leaves a wake, while the river slides by in layers
// (pyramids, a village, the green bank, reeds in front). The same verb deepens three times:
//   1. Flowers: steer into the lotus flowers that float down the river. Each one hops onto the boat's garland.
//   2. The water wheel: a dry brown farm comes along. Steer the bow against its water wheel and hold it there: the
//      wheel turns, the river runs down the furrows and the field turns green, plant by plant. (Egypt is desert; the
//      Nile makes it green, and here she is the one who brings the water.)
//   3. The hippo: a baby hippo pops up with a lotus on her head, somewhere new each time. Steer to her: bump, a
//      giggle, and her fountain lifts the boat. Papyrus clumps stand in the way (the boat rustles through, slower).
// Payoff: twelve flowers on the garland, two green farms, and a lotus crown for the hippo.
// Everything is drawn by hand in SVG (Scenery, Felucca, the Hippo puppet): no generated pictures. Every frame is
// written straight to the DOM from one game loop; the feel numbers are knobs in river.ts.
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { burst, clamp, damp, lerp, pick, say, smooth, sounds, speakingVoice, spendHint, useAlive, useElementSize, useGameLoop, useTimers, type Line, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { useSections } from '../../../../kit/sections'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { L } from '../../lines'
import { Lotus } from '../../Lotus'
import type { ActivityProps } from '../../Place'
import { Hippo, HIPPO_WATERLINE } from '../../puppets/Hippo'
import { Miu } from '../../puppets/Miu'
import { Garland, Hull, Sail } from './Felucca'
import { BOAT, bounds, FARM, FEEL, HOOKS, layoutFor, LEGS, PARALLAX, PER_LEG, TILE, type Layout } from './river'
import { Bank, Cloud, CROP_COUNT, Duck, FarDunes, Field, Fish, Foreground, MidDunes, Palm, Reeds, Ripples, Strip, Sun, U, WaterWheel } from './Scenery'
import SECTIONS from './sections'
import { nsfx } from './sfx'

const N = L.nile
type Phase = 'story' | 'sail' | 'farm' | 'end'
type SectionId = (typeof SECTIONS.sections)[number]['id']

/** Sizes on the water, in river units. */
const FLOWER = { w: 11, h: 9.24 }
const REED = 20
const DUCK = { w: 12, h: 9.6 }
const FISH = { w: 7, h: 4.4 }
const HIPPO_H = 30
const WHEEL = 23

interface Flower {
  on: boolean
  /** float: on the river. fly: hopping to its hook on the garland. toss: thrown to the hippo for her crown. */
  state: 'float' | 'fly' | 'toss'
  wx: number
  y: number
  seed: number
  t: number
  fromX: number
  fromY: number
  slot: number
}
interface Drifter {
  on: boolean
  wx: number
  y: number
  /** A reed's shake or a duck's dive, 1 fading to 0. */
  act: number
  hit: boolean
}
interface Leap {
  on: boolean
  wx: number
  y: number
  t: number
}

const PALMS = [
  { x: 20, h: 17 },
  { x: 71, h: 21 },
  { x: 118, h: 15 },
  { x: 171, h: 19 },
  { x: 222, h: 16 },
]
const CLOUDS = [
  { x: 0.12, y: 30, size: 22 },
  { x: 0.55, y: 44, size: 16 },
  { x: 0.9, y: 36, size: 19 },
]

const pool = <T,>(n: number, make: () => T) => Array.from({ length: n }, make)

export function Nile({ onDone, setProgress }: ActivityProps) {
  const timers = useTimers()
  const alive = useAlive()
  const { start, enter } = useSections(SECTIONS)
  const root = useRef<HTMLDivElement>(null)
  const size = useElementSize(root)
  const layout = useMemo<Layout | null>(() => (size.width && size.height ? layoutFor(size.width, size.height) : null), [size.width, size.height])
  const lay = useRef<Layout | null>(null)
  lay.current = layout

  // A deep link starts as if she had played to there.
  const seed = useMemo(() => {
    const leg = start === 'sail-2' || start === 'farm-2' || start === 'end' ? 1 : 0
    const phase: Phase = !start || start === 'story' ? 'story' : start === 'end' ? 'end' : start.startsWith('farm') ? 'farm' : 'sail'
    const caught = phase === 'sail' ? leg * PER_LEG : (leg + 1) * PER_LEG
    return { leg, phase, caught }
  }, [start])
  const [phase, setPhaseState] = useState<Phase>(seed.phase)
  const [leg, setLegState] = useState(seed.leg)
  const [landed, setLanded] = useState(seed.caught)
  const [farmOn, setFarmOn] = useState(false)
  const [water, setWater] = useState(0)
  const [hip, setHip] = useState({ lotus: false, crown: false })

  const miu = useRef<PuppetHandle>(null)
  const hippo = useRef<PuppetHandle>(null)

  // The whole river, mutated by the loop (React only hears about the few things that change what's drawn).
  const g = useRef({
    t: 0,
    phase: seed.phase,
    leg: seed.leg,
    scroll: 0,
    speed: 0,
    caught: seed.caught,
    spawnIn: 0.5,
    reedIn: 4,
    duckIn: 5,
    leapIn: 3,
    missed: 0,
    idle: 0,
    wakeIn: 0,
    boat: { placed: false, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, lift: 0, liftV: 0, slow: 1, inReeds: false },
    held: false,
    grab: { x: 0, y: 0 },
    down: { at: 0, x: 0, y: 0, onBoat: false },
    flowers: pool<Flower>(12, () => ({ on: false, state: 'float', wx: 0, y: 0, seed: 0, t: 0, fromX: 0, fromY: 0, slot: 0 })),
    reeds: pool<Drifter>(3, () => ({ on: false, wx: 0, y: 0, act: 0, hit: false })),
    ducks: pool<Drifter>(2, () => ({ on: false, wx: 0, y: 0, act: 0, hit: false })),
    leaps: pool<Leap>(3, () => ({ on: false, wx: 0, y: 0, t: 0 })),
    rings: pool<Leap>(3, () => ({ on: false, wx: 0, y: 0, t: 0 })),
    wake: pool<Leap>(14, () => ({ on: false, wx: 0, y: 0, t: 0 })),
    clouds: CLOUDS.map((c) => c.x),
    farm: { on: false, wx: 0, water: 0, steps: 0, done: false, angle: 0, spin: 0, tick: 0 },
    hippo: { state: 'hidden' as 'hidden' | 'bubbles' | 'up' | 'diving' | 'party', x: 0, y: 0, t: 0, wait: 1.6, lotus: false, since: 0, greeted: false, bumped: false },
  }).current

  const els = useRef({
    far: null as HTMLDivElement | null,
    mid: null as HTMLDivElement | null,
    bank: null as HTMLDivElement | null,
    rippleA: null as HTMLDivElement | null,
    rippleB: null as HTMLDivElement | null,
    fore: null as HTMLDivElement | null,
    boat: null as HTMLDivElement | null,
    sail: null as SVGGElement | null,
    farm: null as HTMLDivElement | null,
    wheel: null as SVGGElement | null,
    hippo: null as HTMLDivElement | null,
    bubbles: null as HTMLDivElement | null,
    flowers: [] as (HTMLDivElement | null)[],
    reeds: [] as (HTMLDivElement | null)[],
    ducks: [] as (HTMLDivElement | null)[],
    leaps: [] as (HTMLDivElement | null)[],
    rings: [] as (HTMLDivElement | null)[],
    wake: [] as (HTMLDivElement | null)[],
    clouds: [] as (HTMLDivElement | null)[],
  }).current

  const setPhase = (p: Phase) => {
    g.phase = p
    setPhaseState(p)
  }
  const stars = leg * 2 + (phase === 'farm' ? 1 : 0) + (phase === 'end' ? 2 : 0)
  useEffect(() => setProgress(stars, LEGS * 2), [stars, setProgress])
  const section: SectionId = phase === 'sail' ? (leg === 0 ? 'sail-1' : 'sail-2') : phase === 'farm' ? (leg === 0 ? 'farm-1' : 'farm-2') : phase
  useEffect(() => enter(section), [section, enter])

  const prompt: Line | undefined = phase === 'sail' ? (leg === 0 ? N.steer : N.more) : phase === 'farm' ? N.wheel : undefined
  const promptRef = useRef(prompt)
  promptRef.current = prompt

  /** Where the wheel stops on screen (units from the left). */
  const wheelStop = (l: Layout) => Math.min(l.viewW * 0.76, l.viewW - 13)

  /** A farm comes along: far enough off screen that its field slides in too. */
  const bringFarm = (l: Layout, here = false) => {
    Object.assign(g.farm, { on: true, wx: g.scroll + (here ? wheelStop(l) : l.viewW + FARM.fieldW + FARM.gap + 4), water: 0, steps: 0, done: false, spin: 0 })
    setWater(0)
    setFarmOn(true)
  }

  /** A flower hops from where it is (screen units) to the next free hook on the garland: `f` itself if it was floating,
   *  or a spare one from the pool (the hippo's). */
  const hop = (fromX: number, fromY: number, f = g.flowers.find((x) => !x.on)) => {
    const slot = g.caught
    g.caught++
    g.missed = 0
    g.idle = 0
    if (f) Object.assign(f, { on: true, state: 'fly', t: 0, fromX, fromY, slot })
    else setLanded((n) => Math.max(n, slot + 1))
    nsfx.catch((slot % PER_LEG) * 2)
    void miu.current?.play('wiggle')
    if (g.caught === (g.leg + 1) * PER_LEG) timers.later(strandDone, 750)
  }

  /** A strand of the garland is full: on to the farm. */
  const strandDone = () => {
    const l = lay.current
    if (!l || g.phase !== 'sail') return
    sounds.correct()
    burst(clamp((g.boat.x * l.u) / l.W), clamp((l.waterTop + (g.boat.y - 16) * l.u) / l.H))
    void miu.current?.play('cheer')
    if (g.hippo.state === 'up') {
      void hippo.current?.play('dive')
      Object.assign(g.hippo, { state: 'diving', t: 0 })
    }
    bringFarm(l)
    setPhase('farm')
  }

  /** The field is green. */
  const farmDone = () => {
    const l = lay.current
    if (!l) return
    sounds.correct()
    burst(clamp(((g.farm.wx - g.scroll - FARM.fieldW / 2) * l.u) / l.W), clamp((l.waterTop - 8 * l.u) / l.H))
    void miu.current?.play('cheer')
    if (g.leg + 1 < LEGS) {
      void say(N.green)
      timers.later(() => {
        g.leg++
        g.spawnIn = 1.2
        g.reedIn = 3
        Object.assign(g.hippo, { state: 'hidden', t: 0, wait: 1.4 })
        setLegState(g.leg)
        setPhase('sail')
      }, 2600)
    } else timers.later(() => void finale(), 1500)
  }

  /** The payoff: the hippo comes up beside the boat and gets a lotus crown. */
  const finale = async () => {
    const l = lay.current
    if (!l) return
    setPhase('end')
    const b = bounds(l)
    const H = g.hippo
    const B = g.boat
    // The boat tucks in on the left so there's room for her beside it.
    B.tx = clamp(l.viewW * 0.3, b.x0, l.viewW - 44)
    B.ty = lerp(b.y0, b.y1, 0.55)
    Object.assign(H, { state: 'party', t: 0, x: clamp(B.tx + 34, 20, l.viewW - 13), y: B.ty + 4, lotus: false })
    setHip({ lotus: false, crown: false })
    await timers.wait(350)
    nsfx.splash()
    void hippo.current?.play('pop')
    await timers.wait(900)
    void miu.current?.play('wave')
    // Three flowers fly from the garland to her head.
    setLanded(LEGS * PER_LEG - 3)
    for (let i = 0; i < 3; i++) {
      const f = g.flowers.find((x) => !x.on)
      const [hx, hy] = HOOKS[LEGS * PER_LEG - 1 - i]
      if (f) Object.assign(f, { on: true, state: 'toss', t: -i * 0.18, fromX: B.x - BOAT.w * BOAT.ax + hx / 10, fromY: B.y - BOAT.h * BOAT.ay + hy / 10, slot: i })
    }
    await say(N.crown)
    if (!alive()) return
    setHip({ lotus: false, crown: true })
    sounds.fanfare()
    burst(clamp((H.x * l.u) / l.W), clamp((l.waterTop + (H.y - 14) * l.u) / l.H))
    void hippo.current?.play('cheer')
    nsfx.splash()
    await say(N.thanks)
    if (!alive()) return
    void miu.current?.play('dance')
    await say(N.desert)
    await timers.wait(500)
    onDone()
  }

  // Deep links into the farms and the end.
  const seeded = useRef(false)
  useEffect(() => {
    if (!layout || seeded.current) return
    seeded.current = true
    if (seed.phase === 'farm') bringFarm(layout)
    if (seed.phase === 'end') {
      bringFarm(layout, true)
      Object.assign(g.farm, { water: 1, steps: CROP_COUNT, done: true })
      setWater(1)
      void finale()
    }
  }, [layout])

  useGameLoop((dt) => {
    const l = lay.current
    if (!l) return
    const { u, viewW, waterTop } = l
    const b = bounds(l)
    const B = g.boat
    const H = g.hippo
    g.t += dt
    const t = g.t
    if (!B.placed) {
      B.placed = true
      B.x = B.tx = viewW * 0.3
      B.y = B.ty = lerp(b.y0, b.y1, 0.42)
      // Something to catch straight away.
      if (g.phase !== 'farm' && g.phase !== 'end')
        [0.8].forEach((k, i) => {
          Object.assign(g.flowers[i], { on: true, state: 'float', wx: viewW * k, y: lerp(b.y0 + 3, b.y1, 0.3 + i * 0.4), seed: i * 2.4, t: 0 })
        })
    }
    const playing = g.phase === 'sail' || g.phase === 'farm'
    const sailing = g.phase === 'sail'

    // The river: it flows while she sails, hurries to the farm, and stops there.
    const farmX = g.farm.wx - g.scroll
    let want = 0
    if (sailing) want = FEEL.cruise
    else if (g.phase === 'farm' && g.farm.on) want = clamp((farmX - wheelStop(l)) * 1.5, 0, FEEL.cruise * 2.6)
    g.speed += (want - g.speed) * damp(dt, 3)
    g.scroll += g.speed * dt

    // The boat chases her finger.
    const x1 = g.phase === 'farm' && g.farm.on ? Math.max(b.x0, Math.min(b.x1, farmX - 14)) : b.x1
    B.tx = clamp(B.tx, b.x0, x1)
    B.ty = clamp(B.ty, b.y0, b.y1)
    let vx = (B.tx - B.x) * FEEL.chase
    let vy = (B.ty - B.y) * FEEL.chase
    const want2 = Math.hypot(vx, vy)
    const top = FEEL.top * B.slow
    if (want2 > top) {
      vx *= top / want2
      vy *= top / want2
    }
    B.vx += (vx - B.vx) * damp(dt, 9)
    B.vy += (vy - B.vy) * damp(dt, 9)
    B.x = clamp(B.x + B.vx * dt, b.x0, Math.max(x1, B.x - 40 * dt))
    B.y = clamp(B.y + B.vy * dt, b.y0, b.y1)
    B.liftV += (-B.lift * 70 - B.liftV * 6) * dt
    B.lift = Math.max(0, B.lift + B.liftV * dt)
    B.slow += ((B.inReeds ? FEEL.reeds : 1) - B.slow) * damp(dt, 6)
    const lean = clamp(B.vy * FEEL.lean, -10, 10) + Math.sin(t * 1.9) * 1.5 - B.liftV * 0.12
    const left = B.x - BOAT.w * BOAT.ax
    const topY = B.y - BOAT.h * BOAT.ay
    if (els.boat) {
      els.boat.style.transform = `translate3d(${left * u}px, ${waterTop + (topY - B.lift + Math.sin(t * 2.3) * 0.45) * u}px, 0) rotate(${lean}deg)`
      els.boat.style.zIndex = String(100 + Math.round(B.y * 4))
    }
    if (els.sail) els.sail.style.transform = `scaleX(${1 + Math.sin(t * 2.1) * 0.025 + clamp((g.speed + B.vx) / 400, -0.04, 0.08)})`
    /** How far a point on the water is from the hull (a line from stern to bow). */
    const toHull = (x: number, y: number) => Math.hypot(x - clamp(x, B.x - 11, B.x + 13), y - B.y)

    // Wake behind the stern while the boat moves through the water.
    g.wakeIn -= dt
    if (g.wakeIn <= 0 && g.speed + B.vx > 5) {
      g.wakeIn = 0.16
      const w = g.wake.find((x) => !x.on)
      if (w) Object.assign(w, { on: true, wx: g.scroll + B.x - 15, y: B.y + 1.2, t: 0 })
    }
    g.wake.forEach((w, i) => {
      const el = els.wake[i]
      if (!el) return
      if (w.on) {
        w.t += dt / 1.3
        if (w.t >= 1) w.on = false
      }
      el.style.display = w.on ? '' : 'none'
      if (w.on) {
        el.style.transform = `translate3d(${(w.wx - g.scroll) * u}px, ${waterTop + w.y * u}px, 0) translate(-50%, -50%) scale(${0.6 + w.t * 1.6}, 1)`
        el.style.opacity = String(0.7 * (1 - w.t))
      }
    })

    // Lotus flowers float down the river.
    const open = sailing && g.caught < (g.leg + 1) * PER_LEG
    if (sailing) {
      g.spawnIn -= dt
      g.idle += dt
      if (g.spawnIn <= 0 && open && g.flowers.filter((f) => f.on && f.state === 'float').length < 3) {
        const f = g.flowers.find((x) => !x.on)
        if (f) {
          // After a couple of misses (or a while with none), the next one floats straight to her.
          const help = g.missed >= 2 || g.idle > 8
          Object.assign(f, { on: true, state: 'float', wx: g.scroll + viewW + 8, y: help ? clamp(B.y + 1, b.y0 + 2, b.y1) : lerp(b.y0 + 2, b.y1, Math.random()), seed: Math.random() * 6, t: 0 })
          g.spawnIn = g.leg === 0 ? 2.5 : 3.6
        }
      }
    }
    g.flowers.forEach((f, i) => {
      const el = els.flowers[i]
      if (!el) return
      el.style.display = f.on && f.t >= 0 ? '' : 'none'
      if (!f.on) return
      let x: number
      let y: number
      let k = 1
      let rot = Math.sin(t * 1.8 + f.seed) * 6
      if (f.state === 'float') {
        x = f.wx - g.scroll
        y = f.y
        const d = toHull(x, y)
        if (open && d < FEEL.reach) return hop(x, y, f)
        if (open && d < FEEL.reach * 2.4) {
          // Close enough: it drifts to the boat by itself.
          const px = clamp(x, B.x - 11, B.x + 13)
          f.wx += ((px - x) / (d || 1)) * FEEL.pull * dt
          f.y += ((B.y - y) / (d || 1)) * FEEL.pull * dt
        }
        if (x < -10) {
          f.on = false
          if (open) g.missed++
        }
        y += Math.sin(t * 2 + f.seed) * 0.35
      } else {
        f.t += dt / (f.state === 'fly' ? 0.5 : 0.7)
        const p = smooth(clamp(f.t))
        let toX: number
        let toY: number
        if (f.state === 'fly') {
          toX = left + HOOKS[f.slot][0] / 10
          toY = topY + HOOKS[f.slot][1] / 10 + 1.2
          k = lerp(1, 0.46, p)
        } else {
          toX = H.x + (f.slot - 1) * 4.6
          toY = H.y - HIPPO_H * HIPPO_WATERLINE + 6
          k = lerp(0.46, 0.7, p)
        }
        x = lerp(f.fromX, toX, p)
        y = lerp(f.fromY, toY, p) - Math.sin(Math.PI * p) * (f.state === 'fly' ? 7 : 12)
        rot = p * 360
        if (f.t >= 1) {
          f.on = false
          if (f.state === 'fly') setLanded((n) => Math.max(n, f.slot + 1))
        }
      }
      el.style.transform = `translate3d(${x * u}px, ${waterTop + y * u}px, 0) translate(-50%, -76%) rotate(${rot}deg) scale(${k})`
      el.style.zIndex = String(f.state === 'float' ? 100 + Math.round(f.y * 4) : 900)
    })

    // Papyrus clumps on the second sail: the boat pushes through them, slower, and they rustle.
    if (sailing && g.leg > 0) {
      g.reedIn -= dt
      if (g.reedIn <= 0) {
        g.reedIn = 6 + Math.random() * 3
        const r = g.reeds.find((x) => !x.on)
        if (r) Object.assign(r, { on: true, wx: g.scroll + viewW + 12, y: lerp(b.y0 + 6, b.y1, Math.random()), act: 0, hit: false })
      }
    }
    let inReeds = false
    g.reeds.forEach((r, i) => {
      const el = els.reeds[i]
      if (!el) return
      const x = r.wx - g.scroll
      if (r.on && x < -14) r.on = false
      el.style.display = r.on ? '' : 'none'
      if (!r.on) return
      if (Math.abs(x - B.x) < 13 && Math.abs(r.y - B.y) < 4.5) {
        inReeds = true
        if (!r.hit) {
          r.hit = true
          r.act = 1
          nsfx.rustle()
        }
      } else if (r.hit && Math.abs(x - B.x) > 16) r.hit = false
      r.act = Math.max(0, r.act - dt * 1.4)
      el.style.transform = `translate3d(${x * u}px, ${waterTop + r.y * u}px, 0) translate(-50%, -91%) rotate(${Math.sin(t * 1.3 + i) * 1.5 + Math.sin(t * 26) * 7 * r.act}deg)`
      el.style.zIndex = String(100 + Math.round(r.y * 4) + 1)
    })
    B.inReeds = inReeds

    // A duck paddles by now and then.
    if (playing) {
      g.duckIn -= dt
      if (g.duckIn <= 0 && sailing) {
        g.duckIn = 9 + Math.random() * 5
        const d = g.ducks.find((x) => !x.on)
        if (d) Object.assign(d, { on: true, wx: g.scroll + viewW + 8, y: lerp(b.y0, b.y1 + 3, Math.random()), act: 0, hit: false })
      }
    }
    g.ducks.forEach((d, i) => {
      const el = els.ducks[i]
      if (!el) return
      if (d.on) d.wx -= 3 * dt
      const x = d.wx - g.scroll
      if (d.on && x < -10) d.on = false
      el.style.display = d.on ? '' : 'none'
      if (!d.on) return
      if (!d.hit && toHull(x, d.y) < 7) {
        d.hit = true
        d.act = 1
        nsfx.quack()
      }
      d.act = Math.max(0, d.act - dt * 1.1)
      // Bottoms up: a duck's dive.
      const dive = Math.sin(Math.PI * d.act)
      el.style.transform = `translate3d(${x * u}px, ${waterTop + (d.y + Math.sin(t * 2.6 + i) * 0.25 + dive * 1.4) * u}px, 0) translate(-50%, -86%) rotate(${-dive * 80 + Math.sin(t * 2.2 + i) * 3}deg)`
      el.style.zIndex = String(100 + Math.round(d.y * 4))
    })

    // Fish leap by themselves now and then (and wherever she taps the water).
    g.leapIn -= dt
    if (g.leapIn <= 0) {
      g.leapIn = 4 + Math.random() * 4
      leap(g.scroll + lerp(6, viewW - 6, Math.random()), lerp(b.y0, b.y1 + 4, Math.random()), false)
    }
    g.leaps.forEach((f, i) => {
      const el = els.leaps[i]
      if (!el) return
      if (f.on) {
        f.t += dt / 0.8
        if (f.t >= 1) {
          f.on = false
          ring(f.wx + 5, f.y)
        }
      }
      el.style.display = f.on ? '' : 'none'
      if (!f.on) return
      const p = f.t
      el.style.transform = `translate3d(${(f.wx - g.scroll + p * 5) * u}px, ${waterTop + (f.y - Math.sin(Math.PI * p) * 9) * u}px, 0) translate(-50%, -50%) rotate(${lerp(-130, -230, p)}deg) scale(${Math.min(1, Math.sin(Math.PI * p) * 3)})`
      el.style.zIndex = String(100 + Math.round(f.y * 4))
    })
    g.rings.forEach((r, i) => {
      const el = els.rings[i]
      if (!el) return
      if (r.on) {
        r.t += dt / 0.7
        if (r.t >= 1) r.on = false
      }
      el.style.display = r.on ? '' : 'none'
      if (!r.on) return
      el.style.transform = `translate3d(${(r.wx - g.scroll) * u}px, ${waterTop + r.y * u}px, 0) translate(-50%, -50%) scale(${0.3 + r.t * 1.2})`
      el.style.opacity = String(1 - r.t)
    })

    // The farm and its water wheel.
    if (g.farm.on) {
      const F = g.farm
      if (els.farm) els.farm.style.transform = `translate3d(${farmX * u}px, ${waterTop}px, 0)`
      if (g.phase === 'farm' && !F.done) {
        const touching = g.speed < 4 && Math.hypot(B.x + 13 - (farmX - 3), B.y - 2 - 3) < FARM.touch
        if (touching) {
          F.water = Math.min(1, F.water + dt * FARM.fill)
          F.spin = 200
          g.idle = 0
          F.tick -= dt
          if (F.tick <= 0) {
            F.tick = 0.36
            nsfx.creak()
            nsfx.trickle()
          }
        } else g.idle += dt
        const steps = Math.floor(F.water * CROP_COUNT + 1e-6)
        if (steps !== F.steps) {
          F.steps = steps
          setWater(steps / CROP_COUNT)
          sounds.note(steps)
        }
        if (F.water >= 1) {
          F.done = true
          farmDone()
        }
      }
      F.spin += ((F.done ? 50 : 0) - F.spin) * damp(dt, 2.2)
      F.angle = (F.angle - F.spin * dt) % 360
      if (els.wheel) els.wheel.style.transform = `rotate(${F.angle}deg)`
      if (sailing && farmX < -30) {
        F.on = false
        setFarmOn(false)
      }
    }

    // The hippo: bubbles, then up she pops with a lotus on her head, somewhere new each time.
    H.t += dt
    if (sailing && g.leg > 0) {
      if (H.state === 'hidden' && H.t > H.wait && open) {
        Object.assign(H, { state: 'bubbles', t: 0, x: clamp(B.x + 24 + Math.random() * 18, 20, viewW - 13), y: clamp(B.y + (Math.random() - 0.5) * 34, b.y0 + 8, b.y1 + 3) })
        nsfx.bubbles()
      } else if (H.state === 'bubbles' && H.t > 0.9) {
        Object.assign(H, { state: 'up', t: 0, lotus: true, since: 0 })
        setHip({ lotus: true, crown: false })
        void hippo.current?.play('pop')
        nsfx.splash()
        ring(g.scroll + H.x, H.y)
        if (!H.greeted) {
          H.greeted = true
          void say(N.hello, { interrupt: false })
        }
      } else if (H.state === 'up') {
        // If she's been waiting a while, she paddles over to the boat herself.
        if (H.lotus && H.t > 4.5) {
          H.x += (clamp(B.x + 18, 20, viewW - 13) - H.x) * damp(dt, 0.9)
          H.y += (clamp(B.y + 2, b.y0 + 8, b.y1 + 3) - H.y) * damp(dt, 0.9)
        }
        if (H.lotus && open && toHull(H.x - 2, H.y) < FEEL.reach + 3) {
          // Bump! The lotus hops aboard, she giggles and her fountain lifts the boat.
          H.lotus = false
          H.since = 0
          setHip({ lotus: false, crown: false })
          hop(H.x, H.y - HIPPO_H * HIPPO_WATERLINE + 4)
          void hippo.current?.play('spout')
          B.liftV = 62
          nsfx.splash()
          nsfx.whee()
          if (!H.bumped) {
            H.bumped = true
            void say(N.hippo)
          } else nsfx.giggle()
        }
        if (!H.lotus) {
          H.since += dt
          if (H.since > 1.7) {
            void hippo.current?.play('dive')
            Object.assign(H, { state: 'diving', t: 0 })
          }
        }
      }
    }
    if (H.state === 'diving' && H.t > 0.7) Object.assign(H, { state: 'hidden', t: 0, wait: 1.1 })
    if (els.hippo) {
      els.hippo.style.transform = `translate3d(${H.x * u}px, ${waterTop + H.y * u}px, 0) translate(-50%, ${-HIPPO_WATERLINE * 100}%)`
      els.hippo.style.zIndex = String(100 + Math.round(H.y * 4))
    }
    if (els.bubbles) {
      els.bubbles.style.display = H.state === 'bubbles' ? '' : 'none'
      els.bubbles.style.transform = `translate3d(${H.x * u}px, ${waterTop + H.y * u}px, 0) translate(-50%, -100%)`
    }

    // Stuck for a while: Sparkle says it again (her budget is in sdk/hints.ts).
    if (playing && g.idle > 11 && !speakingVoice()) {
      g.idle = -14
      const line = promptRef.current
      if (line && spendHint(line)) void say(line)
    }

    // The layers slide by at their own speeds.
    const slide = (el: HTMLDivElement | null, tile: number, k: number, lead = 0) => {
      if (el) el.style.transform = `translate3d(${-((((g.scroll * k + lead) % tile) + tile) % tile) * u}px, 0, 0)`
    }
    // (the far strip starts with the pyramids in view)
    slide(els.far, TILE.far, PARALLAX.far, 131 - Math.min(viewW * 0.62, 150))
    slide(els.mid, TILE.mid, PARALLAX.mid)
    slide(els.bank, TILE.bank, 1)
    slide(els.rippleA, TILE.ripple, 1)
    slide(els.rippleB, TILE.ripple, 1.25)
    slide(els.fore, TILE.fore, PARALLAX.fore)
    g.clouds.forEach((x, i) => {
      const w = CLOUDS[i].size / viewW
      let nx = x - ((g.speed * PARALLAX.cloud + 0.35) / viewW) * dt
      if (nx < -w) nx = 1 + w * 0.2
      g.clouds[i] = nx
      const el = els.clouds[i]
      if (el) el.style.transform = `translate3d(${nx * viewW * u}px, ${waterTop - CLOUDS[i].y * u}px, 0)`
    })
  })

  /** A fish jumps out of the water at a spot (world x, water y). */
  const leap = (wx: number, y: number, loud: boolean) => {
    const f = g.leaps.find((x) => !x.on)
    if (!f) return
    Object.assign(f, { on: true, wx, y, t: 0 })
    ring(wx, y)
    if (loud) nsfx.plop()
  }
  const ring = (wx: number, y: number) => {
    const r = g.rings.find((x) => !x.on)
    if (r) Object.assign(r, { on: true, wx, y, t: 0 })
  }

  // Her finger: the boat sails to wherever it is on the water. A quick tap also wakes a fish (or tickles Miu).
  const at = (e: PointerEvent) => {
    const l = lay.current!
    const r = root.current!.getBoundingClientRect()
    return { x: (e.clientX - r.left) / l.u, y: (e.clientY - r.top - l.waterTop) / l.u }
  }
  const aim = (e: PointerEvent) => {
    const p = at(e)
    g.boat.tx = p.x + g.grab.x
    g.boat.ty = p.y + g.grab.y
  }
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!lay.current || g.phase === 'story') return
    const p = at(e)
    const B = g.boat
    const onBoat = Math.abs(p.x - B.x) < BOAT.w * 0.5 && p.y > B.y - BOAT.h * 0.8 && p.y < B.y + 5
    g.down = { at: performance.now(), x: e.clientX, y: e.clientY, onBoat }
    if (g.phase === 'end') return
    // A finger on the boat keeps hold of the spot it touched; anywhere else, the boat comes to the finger.
    g.grab = onBoat ? { x: B.x - p.x, y: B.y - p.y } : { x: 0, y: 0 }
    g.held = true
    e.currentTarget.setPointerCapture?.(e.pointerId)
    aim(e)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (g.held && lay.current) aim(e)
  }
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    g.held = false
    const l = lay.current
    if (!l || g.phase === 'story') return
    const d = g.down
    if (performance.now() - d.at > 280 || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return
    const p = at(e)
    const H = g.hippo
    if ((H.state === 'up' || H.state === 'party') && Math.abs(p.x - H.x) < 11 && p.y > H.y - 17 && p.y < H.y + 3) {
      // A tap on the hippo: she blows her fountain.
      void hippo.current?.play('spout')
      nsfx.giggle()
      nsfx.splash()
    } else if (d.onBoat) {
      void miu.current?.play('purr')
      nsfx.puff()
      if (!speakingVoice()) void say(pick(L.tickle.miu))
    } else if (p.y > 1.5) leap(g.scroll + p.x - 2, p.y, true)
  }

  const u = layout?.u ?? 4
  const entity: CSSProperties = { position: 'absolute', left: 0, top: 0, willChange: 'transform', pointerEvents: 'none' }
  const above = (units: number) => (layout ? `calc(${layout.H - layout.waterTop}px + var(--u) * ${units})` : '0')

  return (
    <div
      ref={root}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={() => (g.held = false)}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', background: '#8FCDF7', ['--u' as string]: `${u}px` }}
    >
      <style>{`
        @keyframes nile-hooked { 0%, 100% { transform: rotate(-7deg) } 50% { transform: rotate(7deg) } }
        .nile-hooked > svg { animation: nile-hooked 2.2s ease-in-out infinite; transform-origin: 50% 20% }
        @keyframes nile-bubble { 0% { transform: translateY(0) scale(0.4); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(-140%) scale(1); opacity: 0 } }
        @keyframes nile-glint { 0%, 100% { opacity: 0.15 } 50% { opacity: 0.8 } }
      `}</style>
      {layout && (
        <>
          {/* Sky, sun and clouds */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: layout.waterTop, background: 'linear-gradient(#8FCDF7 0%, #BDE3FB 55%, #FFEFD9 100%)' }} />
          <div style={{ position: 'absolute', left: `${Math.min(72, 100 - (26 / layout.viewW) * 100)}%`, top: layout.waterTop - 52 * u, zIndex: 1 }}>
            <Sun onTap={() => nsfx.twinkle()} />
          </div>
          {CLOUDS.map((c, i) => (
            <div key={i} ref={(el) => void (els.clouds[i] = el)} style={{ ...entity, zIndex: 1 }}>
              <Cloud size={c.size} onTap={() => nsfx.puff()} />
            </div>
          ))}

          {/* Far dunes and the pyramids, the village, the water, the bank */}
          <Strip innerRef={(el) => void (els.far = el)} tile={TILE.far} height={TILE.far * (44 / 300)} bottom={above(14)} z={2}>
            <FarDunes />
            <Glint onTap={() => nsfx.twinkle()} />
          </Strip>
          <Strip innerRef={(el) => void (els.mid = el)} tile={TILE.mid} height={22} bottom={above(8)} z={3}>
            <MidDunes />
          </Strip>
          <div style={{ position: 'absolute', left: 0, right: 0, top: layout.waterTop, bottom: 0, zIndex: 4, overflow: 'hidden', background: 'linear-gradient(#8FE0EC 0%, #63C6E4 30%, #47AEDB 100%)' }}>
            <div ref={(el) => void (els.rippleA = el)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: U(TILE.ripple * 2), display: 'flex' }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ position: 'relative', width: U(TILE.ripple), height: '100%' }}>
                  <Ripples seed={1} />
                </div>
              ))}
            </div>
            <div ref={(el) => void (els.rippleB = el)} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: U(TILE.ripple * 2), display: 'flex' }}>
              {[0, 1].map((i) => (
                <div key={i} style={{ position: 'relative', width: U(TILE.ripple), height: '100%' }}>
                  <Ripples seed={2} opacity={0.35} />
                </div>
              ))}
            </div>
          </div>
          <Strip innerRef={(el) => void (els.bank = el)} tile={TILE.bank} height={14} bottom={above(-1)} z={5}>
            <Bank />
            {PALMS.map((p) => (
              <div key={p.x} style={{ position: 'absolute', left: U(p.x), bottom: U(8.5), width: 0, height: 0 }}>
                <Palm height={p.h} onTap={() => (nsfx.rustle(), timers.later(() => nsfx.plop(), 520))} />
              </div>
            ))}
          </Strip>

          {/* Everything on the water */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            {farmOn && (
              <div ref={(el) => void (els.farm = el)} style={{ ...entity, zIndex: 1 }}>
                <div style={{ position: 'absolute', left: U(-(FARM.gap + FARM.fieldW)), top: U(-13.5), width: U(FARM.fieldW), height: U(12.5) }}>
                  <Field water={water} />
                </div>
                <div style={{ position: 'absolute', left: U(-WHEEL / 2), top: U(-WHEEL * 0.48 - 2.5), width: U(WHEEL), height: U(WHEEL) }}>
                  <WaterWheel wheelRef={(el) => void (els.wheel = el)} glow={phase === 'farm' && water < 1} />
                </div>
              </div>
            )}
            {g.wake.map((_, i) => (
              <div key={i} ref={(el) => void (els.wake[i] = el)} style={{ ...entity, width: U(5), height: U(1), borderRadius: '50%', border: `${Math.max(2, u * 0.45)}px solid #fff`, borderBottomColor: 'transparent', borderLeftColor: 'transparent', display: 'none', zIndex: 50 }} />
            ))}
            {g.rings.map((_, i) => (
              <div key={i} ref={(el) => void (els.rings[i] = el)} style={{ ...entity, width: U(12), height: U(3.4), borderRadius: '50%', border: `${Math.max(2, u * 0.5)}px solid #fff`, display: 'none', zIndex: 50 }} />
            ))}
            {g.reeds.map((_, i) => (
              <div key={i} ref={(el) => void (els.reeds[i] = el)} style={{ ...entity, width: U(REED), height: U(REED), transformOrigin: '50% 91%', display: 'none' }}>
                <Reeds />
              </div>
            ))}
            {g.ducks.map((d, i) => (
              <div key={i} ref={(el) => void (els.ducks[i] = el)} style={{ ...entity, width: U(DUCK.w), height: U(DUCK.h), display: 'none' }}>
                <button
                  aria-label="Duck"
                  onPointerDown={() => {
                    // (no stopPropagation: the boat sails over to say hello too)
                    d.act = 1
                    nsfx.quack()
                  }}
                  style={{ position: 'absolute', inset: '-40%', padding: '40%', background: 'none', border: 'none', pointerEvents: 'auto', touchAction: 'none' }}
                >
                  <Duck />
                </button>
              </div>
            ))}
            {g.leaps.map((_, i) => (
              <div key={i} ref={(el) => void (els.leaps[i] = el)} style={{ ...entity, width: U(FISH.w), height: U(FISH.h), display: 'none' }}>
                <Fish />
              </div>
            ))}
            {g.flowers.map((_, i) => (
              <div key={i} ref={(el) => void (els.flowers[i] = el)} style={{ ...entity, width: U(FLOWER.w), height: U(FLOWER.h), transformOrigin: '50% 76%', display: 'none' }}>
                <Lotus style={{ width: '100%', height: '100%' }} />
              </div>
            ))}
            <div ref={(el) => void (els.bubbles = el)} style={{ ...entity, width: U(8), height: U(8), display: 'none', zIndex: 60 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ position: 'absolute', left: `${10 + i * 30}%`, bottom: 0, width: '26%', aspectRatio: '1', borderRadius: '50%', border: '3px solid #fff', background: 'rgba(255,255,255,0.35)', animation: `nile-bubble 0.7s ${i * 0.18}s ease-out infinite` }} />
              ))}
            </div>
            {(leg > 0 || phase === 'end') && (
              <div ref={(el) => void (els.hippo = el)} style={{ ...entity, height: U(HIPPO_H) }}>
                <Hippo ref={hippo} height="100%" swimming under lotus={hip.lotus} crown={hip.crown} />
              </div>
            )}
            {/* The felucca: sail, Miu, hull, garland, and Egypt's flag at the mast top */}
            <div ref={(el) => void (els.boat = el)} style={{ ...entity, width: U(BOAT.w), height: U(BOAT.h), transformOrigin: `${BOAT.ax * 100}% ${BOAT.ay * 100}%` }}>
              <Sail sailRef={(el) => void (els.sail = el)} />
              <div style={{ position: 'absolute', left: '11%', bottom: '15%', height: '47%' }}>
                <Miu ref={miu} height="100%" />
              </div>
              <Hull />
              <Garland flowers={landed} />
              <div className="nile-flag" style={{ position: 'absolute', left: '62.5%', top: '0.5%' }}>
                <Flag id="egypt" width={U(5.2)} />
              </div>
            </div>
          </div>

          {/* Reeds in front of everything */}
          <Strip innerRef={(el) => void (els.fore = el)} tile={TILE.fore} height={15} bottom="0px" z={20}>
            <Foreground />
          </Strip>
        </>
      )}
      {prompt && phase !== 'story' && (
        <div style={{ position: 'absolute', top: 'var(--top-clear)', left: 16, right: 16, display: 'flex', justifyContent: 'center', zIndex: 25, pointerEvents: 'none' }}>
          <div onPointerDown={(e) => e.stopPropagation()} style={{ pointerEvents: 'auto', maxWidth: '100%' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      {phase === 'story' && <StoryBeat lines={[N.story]} friend={<Miu height="100%" />} onDone={() => setPhase('sail')} />}
    </div>
  )
}

/** The pyramids, far away: tap them and their golden tips glint. */
function Glint({ onTap }: { onTap: () => void }) {
  const [n, setN] = useState(0)
  return (
    <button
      aria-label="Pyramids"
      onPointerDown={(e) => {
        e.stopPropagation()
        onTap()
        setN((x) => x + 1)
      }}
      style={{ position: 'absolute', left: '45%', width: '43%', top: '8%', height: '80%', padding: 0, background: 'none', border: 'none', pointerEvents: 'auto', touchAction: 'none' }}
    >
      {[
        [48, 2],
        [79, 28],
        [15, 38],
      ].map(([x, y], i) => (
        <svg key={`${n}-${i}`} viewBox="0 0 40 40" style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: '14%', translate: '-50% -50%', opacity: 0.15, animation: n ? `nile-glint 0.5s ${i * 0.12}s 2` : undefined }}>
          <path d="M20 0 L24 16 L40 20 L24 24 L20 40 L16 24 L0 20 L16 16Z" fill="#FFF6CC" />
        </svg>
      ))}
    </button>
  )
}
