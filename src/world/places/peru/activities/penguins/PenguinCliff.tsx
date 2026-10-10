// 🐧 Pepa's Penguin Cliff (the desert coast at Paracas: Peru has penguins! a cold ocean full of fish). Plan:
// planning/around-the-world/peru.md § 2.
// The toy (one core verb): pull a penguin back on the launch rock and let go. It leaps in an arc (a dotted line shows
// where it will splash), belly-flops in, "flies" underwater, porpoises home and hops back up the cliff. Small pull, small
// hop; big pull, big splash and a deep dive. The same verb deepens three times:
//   1. Splash: just jump. Splash Lobo the sea lion (he dives and pops up in a seaweed hat), bounce off his belly.
//   2. Fishing: shimmering anchovy schools, near and shallow or far and deep. A penguin that dives near one comes back
//      with a fish. Pepa orders "Two fish, please!"; fish-shaped spots above the burrow fill one by one, then she taps
//      the chick she wants to feed (it gulps and gets rounder).
//   3. The twist: the egg hatches a third hungry chick, waves swell so the schools slide nearer and farther, and a
//      pelican dives for the same fish (they scatter and gather somewhere new: never a loss, just a new aim).
// Payoff: three round, fluffy chicks waddle up to the launch rock and she launches each one for its very first swim,
// then the whole family porpoises across the bay in a line for Luna's journal.
// Every moving penguin is driven by refs and one game loop (no React re-render per frame).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type MutableRefObject, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, shuffle, sounds, SparklePuppet, useAlive, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/Alpaca'
import { Chick, CHICK_VIEW, Egg } from '../../puppets/Chick'
import { Lobo, LOBO_VIEW } from '../../puppets/Lobo'
import { FishShape, Penguin, PENGUIN_VIEW, penguinLive, type PenguinKind, type PenguinLive } from '../../puppets/Penguin'
import { pickLayout, type PenguinStage } from './layout'
import { Boat, Candelabra, Crab, Jelly, Kelp, Sun, Surface, Tern, Underwater, WATER } from './Scene'
import { psfx } from './sfx'
import { Splash, type SplashHandle } from './Splash'

const P = L.penguins
/** Pepa's orders, in fish. The first three are fishing; the last two come with the twist (third chick, pelican, waves). */
const ORDERS = [1, 2, 3, 2, 3]
/** Stars: splashing, each order fed, the chicks' first swim. */
const TOTAL = ORDERS.length + 2
/** Launches before the fish appear. */
const SPLASHES = 4
/** Fish that make a chick perfectly round. */
const ROUND = 4
const DIVERS: PenguinKind[] = ['chubby', 'tiny', 'tuft']
const SKY = '#A6DCFB'
const SAND = '#F2C98F'

type Phase = 'story' | 'splash' | 'fish' | 'hatch' | 'swim' | 'parade' | 'done'
type Pt = { x: number; y: number }
type Mode = PenguinLive['mode']

interface Seg {
  kind: 'bez' | 'hop' | 'wait'
  p: Pt[]
  dur: number
  mode: Mode
  /** Turn along the path (swimming, porpoising) or stay upright (hopping on rocks). */
  turn: boolean
  h?: number
  end?: () => void
  bubbles?: boolean
}

interface Swimmer {
  id: number
  kind: PenguinKind | 'chick'
  chick: number
  h: number
  live: MutableRefObject<PenguinLive>
  puppet: MutableRefObject<PuppetHandle | null>
  el: HTMLDivElement | null
  /** Center of the body (stage units). */
  x: number
  y: number
  rot: number
  left: boolean
  state: 'queue' | 'held' | 'fly' | 'path' | 'off'
  vx: number
  vy: number
  path: Seg[]
  seg: number
  t: number
  k: number
  target: School | null
  bounced: boolean
  /** Visible at all (divers step off for the chicks' swim; the parade swimmers wait backstage). */
  shown: boolean
}

interface School {
  id: number
  band: 'near' | 'far'
  x: number
  y: number
  count: number
  /** Seconds left scattering (after a pelican dive) or waiting to come back. */
  away: number
  el: HTMLDivElement | null
  fishEls: (SVGGElement | null)[]
  /** Where it is right now (it slides with the swell). */
  cx: number
  cy: number
}

interface Flyer {
  id: number
  from: Pt
  to: Pt
}

declare global {
  interface Window {
    __penguinQA?: { jump: (to: 'fish' | 'feed' | 'twist' | 'swim' | 'parade') => void }
  }
}

const cubic = (p: Pt[], t: number): Pt => {
  const u = 1 - t
  return {
    x: u * u * u * p[0].x + 3 * u * u * t * p[1].x + 3 * u * t * t * p[2].x + t * t * t * p[3].x,
    y: u * u * u * p[0].y + 3 * u * u * t * p[1].y + 3 * u * t * t * p[2].y + t * t * t * p[3].y,
  }
}
const cubicD = (p: Pt[], t: number): Pt => {
  const u = 1 - t
  return {
    x: 3 * u * u * (p[1].x - p[0].x) + 6 * u * t * (p[2].x - p[1].x) + 3 * t * t * (p[3].x - p[2].x),
    y: 3 * u * u * (p[1].y - p[0].y) + 6 * u * t * (p[2].y - p[1].y) + 3 * t * t * (p[3].y - p[2].y),
  }
}
const lineKey = (l: Line) => (typeof l === 'string' ? l : l.text)
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const rand = (r: [number, number]) => r[0] + Math.random() * (r[1] - r[0])

/** The picture box of a swimmer: width, and where its feet are (shares). */
const boxOf = (kind: Swimmer['kind'], h: number) =>
  kind === 'chick' ? { w: (h * CHICK_VIEW.w) / CHICK_VIEW.h, fx: 90 / CHICK_VIEW.w, fy: CHICK_VIEW.feetY / CHICK_VIEW.h } : { w: (h * PENGUIN_VIEW.w) / PENGUIN_VIEW.h, fx: 118 / PENGUIN_VIEW.w, fy: PENGUIN_VIEW.feetY / PENGUIN_VIEW.h }
/** Body center while standing on the ground at y. */
const standY = (sw: Pick<Swimmer, 'kind' | 'h'>, ground: number) => ground - sw.h * (boxOf(sw.kind, sw.h).fy - 0.55)

export function PenguinCliff({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [phase, setPhaseState] = useState<Phase>('story')
  const [prompt, setPrompt] = useState<Line | null>(null)
  /** Shown without Sparkle saying it (a friend just said the same thing). */
  const [quiet, setQuiet] = useState(false)
  const [stars, setStars] = useState(0)
  const [swimmers, setSwimmers] = useState<{ id: number; kind: Swimmer['kind']; chick: number; h: number }[]>([])
  const [schoolsOn, setSchoolsOn] = useState(false)
  const [order, setOrder] = useState<{ need: number; filled: number } | null>(null)
  const [chickCount, setChickCount] = useState(2)
  const [eggCrack, setEggCrack] = useState(-1)
  const [full, setFull] = useState([0, 0, 0])
  const [chickHome, setChickHome] = useState([true, true, true])
  const [pepaHome, setPepaHome] = useState(true)
  const [feeding, setFeeding] = useState(false)
  const [seaweed, setSeaweed] = useState(false)
  const [rough, setRough] = useState(false)
  const [flyers, setFlyers] = useState<Flyer[]>([])
  const [flash, setFlash] = useState(0)
  const [hint, setHint] = useState<null | 'front' | 'chicks'>(null)
  const [frontId, setFrontId] = useState(-1)

  const sparkle = useRef<PuppetHandle>(null)
  const pepa = useRef<PuppetHandle>(null)
  const lobo = useRef<PuppetHandle>(null)
  const chicks = useRef<(PuppetHandle | null)[]>([null, null, null])
  const splash = useRef<SplashHandle>(null)
  const dots = useRef<(SVGCircleElement | null)[]>([])
  const ring = useRef<SVGEllipseElement | null>(null)
  const pelicanEl = useRef<HTMLDivElement>(null)
  const pelicanImg = useRef<HTMLImageElement>(null)

  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  const star = (n: number) => setStars((s) => Math.max(s, n))

  // ---- Mutable state for pointer handling and the loop ----
  const g = useRef({
    phase: 'story' as Phase,
    sw: [] as Swimmer[],
    queue: [] as number[],
    nextId: 1,
    held: null as null | { id: number; pid: number; sx: number; sy: number; dx: number; dy: number; moved: boolean; whoa: boolean },
    schools: [] as School[],
    splashes: 0,
    order: 0,
    need: 0,
    filled: 0,
    feeding: false,
    fed: [0, 0, 0],
    chicks: 2,
    twist: false,
    swum: 0,
    swimHome: 0,
    lastTouch: performance.now(),
    lastProgress: performance.now(),
    lastHint: 0,
    talked: 0,
    socks: 0,
    loboBusy: 0,
    loboTaps: 0,
    pepaTaps: 0,
    facts: 0,
    flyerId: 1,
    busy: false,
    fedOnce: false,
    pelican: { on: 'off' as 'off' | 'fly' | 'float' | 'leave', t: 0, x: 0, y: 0, from: { x: 0, y: 0 }, school: null as School | null, next: 0, told: false },
    time: 0,
  })
  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }

  // ---- Layout: measure, pick the wide or tall stage, scale it to fit ----
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const S: PenguinStage | null = size.W ? pickLayout(size.W, size.H) : null
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0
  const SR = useRef<PenguinStage | null>(null)
  const prevS = useRef<PenguinStage | null>(null)
  SR.current = S

  // The three divers queue on the ledge (placed again if the stage switches between wide and tall).
  useEffect(() => {
    if (!S) return
    const G = g.current
    if (!G.sw.length) {
      for (const kind of shuffle([...DIVERS])) addSwimmer(kind, -1, kind === 'tiny' ? S.diverH * 0.82 : kind === 'chubby' ? S.diverH * 1.03 : S.diverH)
      G.queue = G.sw.map((s) => s.id)
      publish()
    }
    if (prevS.current !== S) {
      // Wide <-> tall: everyone in the queue jumps to their spot; anything mid-flight lands home.
      G.sw.forEach((s) => {
        if (s.state === 'off') return
        const i = G.queue.indexOf(s.id)
        if (i >= 0 || s.state !== 'queue') {
          s.state = 'queue'
          if (i < 0) G.queue.push(s.id)
          s.live.current.mode = 'stand'
        }
      })
      G.sw.forEach((s) => {
        const i = G.queue.indexOf(s.id)
        if (i >= 0) {
          s.x = S.slots[Math.min(i, S.slots.length - 1)]
          s.y = standY(s, S.ledge)
        }
      })
      if (G.schools.length) placeSchools(true)
      prevS.current = S
    }
  }, [S])

  const addSwimmer = (kind: Swimmer['kind'], chick: number, h: number) => {
    const G = g.current
    const s: Swimmer = { id: G.nextId++, kind, chick, h, live: { current: penguinLive() }, puppet: { current: null }, el: null, x: -400, y: 0, rot: 0, left: false, state: 'queue', vx: 0, vy: 0, path: [], seg: 0, t: 0, k: 0, target: null, bounced: false, shown: true }
    G.sw.push(s)
    return s
  }
  const publish = () => setSwimmers(g.current.sw.map((s) => ({ id: s.id, kind: s.kind, chick: s.chick, h: s.h })))
  const byId = (id: number) => g.current.sw.find((s) => s.id === id)

  const toStage = (cx: number, cy: number) => {
    const r = stageEl.current?.getBoundingClientRect()
    return r ? { x: (cx - r.left) / scale, y: (cy - r.top) / scale } : { x: 0, y: 0 }
  }
  const say1 = (line: Line) => void say(line)

  // ---- The story, then play ----
  const startPlay = () => {
    setPhase('splash')
    setPrompt(P.pull)
    g.current.lastTouch = g.current.lastProgress = performance.now()
  }

  // ---- Fish schools ----
  const placeSchools = (keepCounts = false) => {
    const T = SR.current
    if (!T) return
    const G = g.current
    const old = G.schools
    G.schools = (['near', 'far'] as const).map((band, i) => {
      const b = T[band]
      const x = rand(b.x)
      const y = rand(b.y)
      return { id: i, band, x, y, cx: x, cy: y, count: keepCounts && old[i] ? old[i].count : 4, away: 0, el: old[i]?.el ?? null, fishEls: old[i]?.fishEls ?? [] }
    })
  }
  const moveSchool = (s: School) => {
    const T = SR.current
    if (!T) return
    const b = T[s.band]
    // Somewhere new, not right where it was.
    for (let i = 0; i < 6; i++) {
      s.x = rand(b.x)
      s.y = rand(b.y)
      if (Math.abs(s.x - s.cx) > 90) break
    }
  }

  // ---- Launching ----
  /** Speed and direction for a pull (stage units): `d` is finger minus launch rock. */
  const launchOf = (dx: number, dy: number) => {
    const T = SR.current!
    const len = Math.hypot(dx, dy)
    const k = clamp(len / T.pullR, 0, 1)
    let ang = Math.atan2(-dy, -dx)
    const lo = (-80 * Math.PI) / 180
    const hi = (-14 * Math.PI) / 180
    if (ang < -Math.PI / 2) ang = lo
    else if (ang > 0) ang = len < 20 ? -Math.PI / 4 : Math.max(-Math.PI / 4, hi)
    ang = clamp(ang, lo, hi)
    const v = T.vmax * (0.3 + 0.7 * k)
    return { k, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v }
  }

  /** Where a launch from the rock lands on the sea (for the dotted preview and aim). */
  const trajectory = (vx: number, vy: number, n: number) => {
    const T = SR.current!
    const pts: Pt[] = []
    const y0 = T.anchor.y - 60
    const tEnd = (vy + Math.sqrt(vy * vy + 2 * T.gravity * (T.sea - y0))) / T.gravity
    for (let i = 1; i <= n; i++) {
      const t = (tEnd * i) / n
      pts.push({ x: Math.min(T.w - 40, T.anchor.x + vx * t), y: y0 + vy * t + 0.5 * T.gravity * t * t })
    }
    return pts
  }

  const showPreview = (vx: number, vy: number, on: boolean) => {
    const pts = on ? trajectory(vx, vy, dots.current.length + 1) : []
    dots.current.forEach((d, i) => {
      if (!d) return
      d.style.display = on ? '' : 'none'
      if (on) {
        d.setAttribute('cx', pts[i].x.toFixed(1))
        d.setAttribute('cy', pts[i].y.toFixed(1))
      }
    })
    if (ring.current) {
      ring.current.style.display = on ? '' : 'none'
      if (on) ring.current.setAttribute('cx', pts[pts.length - 1].x.toFixed(1))
    }
  }

  const launch = (s: Swimmer, vx: number, vy: number, k: number, target: School | null = null) => {
    const G = g.current
    const T = SR.current!
    G.queue = G.queue.filter((id) => id !== s.id)
    s.state = 'fly'
    s.x = T.anchor.x
    s.y = T.anchor.y - 60
    s.vx = vx
    s.vy = vy
    s.k = k
    s.target = target
    s.bounced = false
    s.left = false
    s.live.current.mode = 'air'
    s.live.current.pull = 0
    s.live.current.sock = false
    psfx.launch(k)
    G.lastProgress = performance.now()
    if (k < 0.15) {
      psfx.blip()
      say1(P.blip)
    } else if (G.talked++ < 2 || Math.random() < 0.2) say1(P.wheee[Math.floor(Math.random() * P.wheee.length)])
    setHint(null)
    setFrontId(G.queue[0] ?? -1)
  }

  /** A tap on a school: the front penguin leaps right at it (the easy way to aim). */
  const tapSchool = (school: School) => {
    const G = g.current
    const T = SR.current
    if (!T || G.held || !canLaunch()) return
    const s = byId(G.queue[0])
    if (!s || school.count <= 0 || school.away > 0) return
    const dx = Math.max(140, school.cx - 90 - T.anchor.x)
    const h = T.sea - (T.anchor.y - 60)
    const vx = dx * Math.sqrt(T.gravity / (2 * (h + dx)))
    const k = clamp((Math.SQRT2 * vx) / T.vmax / 0.7 - 0.3 / 0.7, 0.2, 1)
    launch(s, vx, -vx, k, school)
  }

  const canLaunch = () => {
    const p = g.current.phase
    return p === 'splash' || p === 'fish' || p === 'swim'
  }

  // ---- In the water ----
  const splashDown = (s: Swimmer) => {
    const G = g.current
    const T = SR.current!
    const big = s.kind === 'chick' ? s.k * 0.5 : s.k
    splash.current?.splash(s.x, T.sea, big)
    psfx.splash(big)
    // Lobo gets splashed.
    const lx = T.lobo.x
    if (s.kind !== 'chick' && Math.abs(s.x - lx) < 190 && performance.now() > G.loboBusy) {
      G.loboBusy = performance.now() + 3000
      void lobo.current?.play('dive')
      setTimeout(() => alive() && setSeaweed(true), 1200)
      setTimeout(() => {
        if (!alive()) return
        say1(P.lobo[seaweedRef.current ? 2 : 0])
        void lobo.current?.play('clap')
      }, 2200)
    }
    if (G.phase === 'splash' && s.kind !== 'chick') {
      G.splashes++
      if (G.splashes === SPLASHES) void startFishing()
    }
    // Under the water: a quick swim to a school (if she aimed near one), then home.
    const depthMax = T.h - T.sea - 90
    let school = s.target
    if (!school && G.schools.length && schoolsRef.current && s.kind !== 'chick') {
      const guess = { x: s.x + 140, y: T.sea + 90 + s.k * (depthMax - 90) }
      let best = T.tall ? 230 : 270
      for (const sc of G.schools) {
        if (sc.count <= 0 || sc.away > 0) continue
        const d = Math.hypot(sc.cx - guess.x, (sc.cy - guess.y) * 0.6)
        if (d < best) {
          best = d
          school = sc
        }
      }
    }
    s.target = school
    const B = school ? { x: school.cx, y: school.cy } : { x: clamp(s.x + 140, T.shore + 120, T.w - 70), y: clamp(T.sea + 90 + s.k * (depthMax - 90) * (s.kind === 'chick' ? 0.5 : 1), T.sea + 70, T.h - 100) }
    const path: Seg[] = []
    path.push({
      kind: 'bez',
      p: [{ x: s.x, y: T.sea + 10 }, { x: s.x + s.vx * 0.15, y: T.sea + 60 + (B.y - T.sea) * 0.4 }, { x: B.x - 80, y: B.y }, B],
      dur: 0.55 + 0.3 * s.k,
      mode: 'swim',
      turn: true,
      bubbles: true,
      end: () => catchFish(s),
    })
    const home = { x: T.shore + 20, y: T.sea + 34 }
    const n = clamp(Math.floor((B.x - home.x - 120) / 200), 0, 2)
    const R = { x: home.x + 190 * n, y: T.sea + 40 }
    path.push({ kind: 'bez', p: [B, { x: B.x + 170, y: B.y + 40 }, { x: R.x + 200, y: R.y + 120 }, R], dur: 1.0, mode: 'swim', turn: true, bubbles: true })
    for (let i = 0; i < n; i++) {
      const from = { x: R.x - 190 * i, y: T.sea + 40 }
      path.push({
        kind: 'hop',
        p: [from, { x: from.x - 190, y: T.sea + 40 }],
        h: 130,
        dur: 0.55,
        mode: 'swim',
        turn: true,
        end: () => {
          splash.current?.splash(from.x - 190, T.sea, 0.15)
          psfx.splash(0.1)
        },
      })
    }
    const lip = { x: T.burrow.lip.x, y: standY(s, T.burrow.lip.y) }
    path.push({ kind: 'hop', p: [home, lip], h: 90, dur: 0.55, mode: 'stand', turn: false, end: () => backAtBurrow(s) })
    s.path = path
    s.seg = 0
    s.t = 0
    s.state = 'path'
    s.live.current.mode = 'swim'
  }

  const catchFish = (s: Swimmer) => {
    const sc = s.target
    if (sc && sc.count > 0 && sc.away <= 0 && Math.hypot(sc.cx - s.x, sc.cy - s.y) < 190) {
      sc.count--
      s.live.current.fish = true
      splash.current?.sparkle(s.x, s.y)
      sounds.pop()
      if (sc.count <= 0) sc.away = 1.6
    } else if (g.current.phase === 'fish' && s.kind !== 'chick' && Math.random() < 0.35) {
      s.live.current.sock = true
    }
  }

  /** A swimmer climbs out onto the burrow's lip: drops off its fish (or shows off its sock), then hops up to the queue. */
  const backAtBurrow = (s: Swimmer) => {
    const G = g.current
    const T = SR.current!
    if (s.kind === 'chick') {
      // A chick's first swim is done: home into the burrow.
      const c = T.chicks[s.chick]
      s.path = [{ kind: 'hop', p: [{ x: s.x, y: s.y }, { x: c.x, y: standY(s, T.burrow.floor) }], h: 50, dur: 0.5, mode: 'stand', turn: false, end: () => chickBack(s) }]
      s.seg = 0
      s.t = 0
      return
    }
    if (s.live.current.fish) {
      s.live.current.fish = false
      deliver(s)
    } else if (s.live.current.sock) {
      void s.puppet.current?.play('proud')
      if (G.socks++ % 3 === 0) say1(P.sock)
    }
    const back = { x: T.slots[Math.min(G.queue.length, T.slots.length - 1)], y: standY(s, T.ledge) }
    s.path = [
      { kind: 'wait', p: [], dur: s.live.current.sock ? 1.3 : 0.45, mode: 'stand', turn: false },
      {
        kind: 'hop',
        p: [{ x: s.x, y: s.y }, back],
        h: 120,
        dur: 0.7,
        mode: 'stand',
        turn: false,
        end: () => {
          s.state = 'queue'
          G.queue.push(s.id)
          setFrontId(G.queue[0])
          void s.puppet.current?.play('waddle')
        },
      },
    ]
    s.seg = 0
    s.t = 0
  }

  // ---- Pepa's orders and the chicks ----
  const fly = (from: Pt, to: Pt) => {
    const id = g.current.flyerId++
    setFlyers((l) => [...l, { id, from, to }])
    setTimeout(() => alive() && setFlyers((l) => l.filter((f) => f.id !== id)), 800)
  }

  const deliver = (s: Swimmer) => {
    const G = g.current
    const T = SR.current!
    if (G.need && G.filled < G.need && !G.feeding) {
      const i = G.filled++
      fly({ x: s.x, y: s.y - 30 }, T.burrow.fish[i])
      setTimeout(() => {
        if (!alive()) return
        setOrder({ need: G.need, filled: G.filled })
        sounds.note(2 + i * 2)
        say1(P.count[i])
        if (G.filled === G.need) startFeeding()
      }, 650)
      G.lastProgress = performance.now()
    } else {
      // No room in the order: the diver gulps it down itself, very pleased.
      psfx.gulp()
      void s.puppet.current?.play('proud')
    }
  }

  const startFeeding = () => {
    const G = g.current
    G.feeding = true
    setFeeding(true)
    setQuiet(true)
    setPrompt(P.idle.feed)
    for (let i = 0; i < G.chicks; i++) setTimeout(() => alive() && void chicks.current[i]?.play('beg'), i * 250)
    psfx.peep(3)
    if (!G.fedOnce) {
      G.fedOnce = true
      setTimeout(() => alive() && say1(P.feed), 500)
    }
    G.lastProgress = performance.now()
  }

  const nextOrder = async () => {
    const G = g.current
    if (G.order >= ORDERS.length) return
    G.need = ORDERS[G.order]
    G.filled = 0
    setOrder({ need: G.need, filled: 0 })
    void pepa.current?.play('flap')
    await say(P.orders[G.need - 1])
  }

  /** She taps a chick: if fish are waiting, Pepa feeds it one. */
  const tapChick = (i: number) => {
    const G = g.current
    const T = SR.current
    G.lastTouch = performance.now()
    if (!T || G.phase === 'swim' || G.phase === 'parade') return
    if (!G.feeding || G.filled <= 0) {
      void chicks.current[i]?.play(Math.random() < 0.5 ? 'peep' : 'hop')
      psfx.peep(2)
      return
    }
    const k = --G.filled
    setOrder({ need: G.need, filled: G.filled })
    void pepa.current?.play('feed')
    fly(T.burrow.fish[k], { x: T.chicks[i].x, y: T.burrow.floor - T.chicks[i].h * 0.55 })
    setTimeout(() => {
      if (!alive()) return
      void chicks.current[i]?.play('gulp')
      psfx.gulp()
      G.fed[i]++
      setFull(G.fed.map((n) => Math.min(1, n / ROUND)))
    }, 600)
    G.lastProgress = performance.now()
    if (G.filled === 0) void orderFed()
  }

  const orderFed = async () => {
    const G = g.current
    G.feeding = false
    setFeeding(false)
    setQuiet(true)
    setPrompt(P.fishGo)
    G.need = 0
    G.busy = true
    await wait(800)
    if (!alive()) return
    star(2 + G.order)
    sounds.sparkle()
    void pepa.current?.play('cheer')
    await say(P.yum[G.order % P.yum.length])
    if (!alive()) return
    G.order++
    G.busy = false
    G.lastProgress = performance.now()
    if (G.order === 3) void hatch()
    else if (G.order >= ORDERS.length) void swimTime()
    else void nextOrder()
  }

  // ---- 2. Fishing begins ----
  const startFishing = async () => {
    const G = g.current
    await wait(1400)
    if (!alive() || G.phase !== 'splash') return
    star(1)
    placeSchools()
    setSchoolsOn(true)
    setPhase('fish')
    setQuiet(false)
    setPrompt(P.fishGo)
    G.lastProgress = performance.now()
    await wait(2600)
    if (!alive()) return
    await nextOrder()
  }

  // ---- 3. The twist: the egg hatches, the pelican comes, the swell ----
  const hatch = async () => {
    const G = g.current
    setPhase('hatch')
    setPrompt(null)
    await say(P.egg)
    for (let c = 0; c < 3; c++) {
      if (!alive()) return
      setEggCrack(c)
      psfx.crack()
      await wait(800)
    }
    if (!alive()) return
    setEggCrack(3)
    G.chicks = 3
    setChickCount(3)
    psfx.peep(4)
    sounds.sparkle()
    void pepa.current?.play('cheer')
    await say(P.hatch)
    if (!alive()) return
    void chicks.current[2]?.play('cheer')
    G.twist = true
    setRough(true)
    G.pelican.next = G.time + 6
    setPhase('fish')
    G.lastProgress = performance.now()
    await nextOrder()
  }

  // ---- Payoff: the chicks' very first swim ----
  const swimTime = async () => {
    const G = g.current
    const T = SR.current
    if (!T) return
    setPhase('swim')
    setSchoolsOn(false)
    setRough(false)
    G.twist = false
    star(TOTAL - 1)
    // The divers waddle off the back of the ledge to make room; the chicks hop up to the launch rock.
    const divers = G.sw.filter((s) => s.kind !== 'chick')
    G.queue = []
    divers.forEach((s, i) => {
      s.state = 'path'
      s.path = [
        { kind: 'wait', p: [], dur: i * 0.3, mode: 'stand', turn: false },
        { kind: 'hop', p: [{ x: s.x, y: s.y }, { x: -160, y: standY(s, T.ledge) }], h: 30, dur: 1.4, mode: 'stand', turn: false, end: () => ((s.state = 'off'), (s.shown = false)) },
      ]
      s.seg = 0
      s.t = 0
    })
    await say(P.swimGo)
    if (!alive()) return
    for (let i = 0; i < 3; i++) {
      const c = T.chicks[i]
      const s = addSwimmer('chick', i, T.chicks[i].h)
      s.x = c.x
      s.y = standY(s, T.burrow.floor)
      s.state = 'path'
      s.path = [
        { kind: 'wait', p: [], dur: i * 0.5, mode: 'stand', turn: false },
        { kind: 'hop', p: [{ x: c.x, y: s.y }, { x: T.burrow.lip.x, y: standY(s, T.burrow.lip.y) }], h: 40, dur: 0.45, mode: 'stand', turn: false },
        {
          kind: 'hop',
          p: [{ x: T.burrow.lip.x, y: standY(s, T.burrow.lip.y) }, { x: T.slots[i], y: standY(s, T.ledge) }],
          h: 110,
          dur: 0.7,
          mode: 'stand',
          turn: false,
          end: () => {
            s.state = 'queue'
            G.queue.push(s.id)
            G.queue.sort((a, b) => (byId(a)?.chick ?? 0) - (byId(b)?.chick ?? 0))
            setFrontId(G.queue[0])
          },
        },
      ]
      s.seg = 0
      s.t = 0
    }
    setChickHome([false, false, false])
    publish()
    setQuiet(true)
    setPrompt(P.idle.swim)
    G.lastProgress = performance.now()
  }

  const chickBack = (s: Swimmer) => {
    const G = g.current
    s.state = 'off'
    s.shown = false
    setChickHome((h) => h.map((v, i) => (i === s.chick ? true : v)))
    setTimeout(() => alive() && void chicks.current[s.chick]?.play('cheer'), 50)
    psfx.peep(3)
    G.swimHome++
    if (G.swimHome === 1) say1(P.firstSwim)
    if (G.swimHome === 3) void parade()
  }

  /** Everyone porpoises across the bay in a line; Luna's journal gets its picture. */
  const parade = async () => {
    const G = g.current
    const T = SR.current
    if (!T || G.phase === 'parade') return
    setPhase('parade')
    setPrompt(null)
    star(TOTAL)
    await wait(900)
    if (!alive()) return
    // Pepa, the chicks and the divers, one after another.
    const line: Swimmer[] = []
    const pepaS = addSwimmer('pepa', -1, T.diverH)
    line.push(pepaS)
    for (let i = 0; i < 3; i++) line.push(addSwimmer('chick', i, T.chicks[i].h))
    G.sw.filter((s) => s.kind !== 'chick' && s.kind !== 'pepa').forEach((s) => line.push(s))
    const xs = Array.from({ length: 9 }, (_, i) => T.shore + 40 + i * ((T.w - T.shore + 260) / 8))
    line.forEach((s, i) => {
      s.shown = true
      s.state = 'path'
      s.x = T.shore - 10
      s.y = T.sea + 50
      const segs: Seg[] = [{ kind: 'wait', p: [], dur: 0.35 * i, mode: 'swim', turn: true }]
      for (let j = 0; j < xs.length - 1; j++) segs.push({ kind: 'hop', p: [{ x: xs[j], y: T.sea + 40 }, { x: xs[j + 1], y: T.sea + 40 }], h: s.kind === 'chick' ? 90 : 120, dur: 0.6, mode: 'swim', turn: true, end: j % 2 ? undefined : () => splash.current?.splash(xs[j + 1], T.sea, 0.2) })
      segs.push({ kind: 'wait', p: [], dur: 0.1, mode: 'swim', turn: true, end: () => ((s.state = 'off'), (s.shown = false)) })
      s.path = segs
      s.seg = 0
      s.t = 0
    })
    setPepaHome(false)
    setChickHome([false, false, false])
    publish()
    void sparkle.current?.play('cheer')
    await wait(2600)
    if (!alive()) return
    psfx.click()
    setFlash((f) => f + 1)
    burst(0.6, 0.6)
    await say(P.photo)
    await wait(2200)
    if (!alive()) return
    setPepaHome(true)
    setChickHome([true, true, true])
    await wait(300)
    void pepa.current?.play('cheer')
    chicks.current.forEach((c) => void c?.play('cheer'))
    await say(P.yum[2])
    await wait(600)
    if (!alive()) return
    setPhase('done')
    onDone()
  }

  // ---- Pointer handling on the stage ----
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    G.lastTouch = performance.now()
    const target = e.target as Element
    if (target.closest('button')) return
    const T = SR.current
    if (!T || G.held) return
    const swEl = target.closest('[data-swimmer]') as HTMLElement | null
    if (swEl && canLaunch()) {
      const s = byId(Number(swEl.dataset.swimmer))
      if (!s || s.state !== 'queue') return
      // Any penguin in the queue can go next: it steps up to the launch rock.
      G.queue = [s.id, ...G.queue.filter((id) => id !== s.id)]
      setFrontId(s.id)
      s.state = 'held'
      s.x = T.anchor.x
      s.y = standY(s, T.ledge)
      s.left = false
      s.live.current.mode = 'crouch'
      s.live.current.pull = 0
      const p = toStage(e.clientX, e.clientY)
      G.held = { id: s.id, pid: e.pointerId, sx: p.x, sy: p.y, dx: 0, dy: 0, moved: false, whoa: false }
      e.currentTarget.setPointerCapture(e.pointerId)
      sounds.pop()
      setHint(null)
      return
    }
    const scEl = target.closest('[data-school]') as HTMLElement | null
    if (scEl) {
      const sc = G.schools[Number(scEl.dataset.school)]
      if (sc) tapSchool(sc)
    }
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const T = SR.current
    if (!G.held || e.pointerId !== G.held.pid || !T) return
    const s = byId(G.held.id)
    if (!s) return
    const p = toStage(e.clientX, e.clientY)
    // The pull is measured from where she grabbed it, so grabbing anywhere on the penguin works.
    const dx = p.x - G.held.sx
    const dy = p.y - G.held.sy
    G.held.dx = dx
    G.held.dy = dy
    const len = Math.hypot(dx, dy)
    if (len > 14) G.held.moved = true
    const raw = len / T.pullR
    const pull = raw <= 1 ? raw : raw < 1.3 ? 1 : 1 + Math.min(0.5, raw - 1.3)
    s.live.current.pull = pull
    if (pull > 1.15 && !G.held.whoa) {
      G.held.whoa = true
      say1(P.whoa)
    }
    // It crouches and slides back along the rock with her finger (a rubbery slingshot).
    s.x = T.anchor.x + clamp(dx, -T.pullR * 1.1, T.pullR * 0.25) * 0.45
    s.y = standY(s, T.ledge) + clamp(dy * 0.12, -8, 14)
    if (G.held.moved) psfx.stretch(Math.min(1, raw))
    const l = launchOf(dx, dy)
    showPreview(l.vx, l.vy, G.held.moved && l.k >= 0.08)
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const T = SR.current
    if (!G.held || e.pointerId !== G.held.pid || !T) return
    const h = G.held
    G.held = null
    showPreview(0, 0, false)
    const s = byId(h.id)
    if (!s) return
    const l = launchOf(h.dx, h.dy)
    if (!h.moved || l.k < 0.05) {
      // Just a tap: it flaps and giggles, and stays in front.
      s.state = 'queue'
      s.live.current.mode = 'stand'
      s.live.current.pull = 0
      void s.puppet.current?.play('giggle')
      return
    }
    launch(s, l.vx, l.vy, l.k)
  }

  // ---- The loop: flights, swims, hops, the queue, the schools, the pelican, the quiet guide ----
  const schoolsRef = useRef(false)
  schoolsRef.current = schoolsOn
  const seaweedRef = useRef(false)
  seaweedRef.current = seaweed

  useGameLoop((dt) => {
    if (dt <= 0) return
    const G = g.current
    const T = SR.current
    if (!T) return
    G.time += dt
    const now = performance.now()

    for (const s of G.sw) {
      const L = s.live.current
      if (s.state === 'queue') {
        const i = G.queue.indexOf(s.id)
        const tx = T.slots[Math.min(Math.max(0, i), T.slots.length - 1)]
        const dx = tx - s.x
        const step = 190 * dt
        const ground = standY(s, T.ledge)
        if (Math.abs(dx) > 2) {
          s.x += Math.sign(dx) * Math.min(step, Math.abs(dx))
          s.left = dx < 0
          s.y = ground - Math.abs(Math.sin(G.time * 13)) * 9
        } else {
          s.left = false
          s.y = ground
        }
        s.rot = 0
        L.mode = 'stand'
      } else if (s.state === 'fly') {
        s.vy += T.gravity * dt
        s.x += s.vx * dt
        s.y += s.vy * dt
        if (s.x > T.w - 50) {
          s.x = T.w - 50
          s.vx = Math.min(0, s.vx)
        }
        s.rot = (Math.atan2(s.vy, Math.abs(s.vx) + 1) * 180) / Math.PI + 90
        s.left = s.vx < 0
        // Boing! Off Lobo's rock (and his belly).
        if (!s.bounced && s.vy > 0 && s.x > T.rock.x + 30 && s.x < T.rock.x + T.rock.w - 30 && s.y > T.rock.top - 30 && s.y < T.rock.top + 20) {
          s.bounced = true
          s.vy = -Math.abs(s.vy) * 0.55 - 200
          s.vx = -Math.abs(s.vx) * 0.4 - 160
          psfx.bounce()
          void lobo.current?.play('giggle')
          if (now > G.loboBusy) {
            G.loboBusy = now + 2500
            say1(P.lobo[1])
          }
        }
        if (s.y >= T.sea && s.vy > 0) splashDown(s)
      } else if (s.state === 'path') {
        const seg = s.path[s.seg]
        if (!seg) {
          s.state = 'off'
          continue
        }
        s.t += dt / seg.dur
        const q = Math.min(1, s.t)
        L.mode = seg.mode
        if (seg.kind === 'bez') {
          const pos = cubic(seg.p, q)
          const d = cubicD(seg.p, q)
          s.x = pos.x
          s.y = pos.y
          s.left = d.x < 0
          s.rot = (Math.atan2(d.y, Math.abs(d.x) + 0.001) * 180) / Math.PI + 90
          if (seg.bubbles && Math.random() < dt * 8) splash.current?.bubble(s.x, s.y)
        } else if (seg.kind === 'hop') {
          const [a, b] = seg.p
          const hh = seg.h ?? 60
          s.x = a.x + (b.x - a.x) * q
          s.y = a.y + (b.y - a.y) * q - 4 * hh * q * (1 - q)
          s.left = b.x < a.x
          if (seg.turn) {
            const vx = Math.abs(b.x - a.x) + 0.001
            const vy = b.y - a.y - 4 * hh * (1 - 2 * q)
            s.rot = (Math.atan2(vy, vx) * 180) / Math.PI + 90
            L.mode = s.y < T.sea ? 'air' : 'swim'
          } else s.rot = 0
        }
        if (s.t >= 1) {
          s.seg++
          s.t = 0
          seg.end?.()
        }
      }
      const el = s.el
      if (el) {
        const b = boxOf(s.kind, s.h)
        el.style.display = s.shown && s.state !== 'off' ? '' : 'none'
        el.style.transform = `translate(${(s.x - b.w * b.fx).toFixed(1)}px, ${(s.y - s.h * 0.55).toFixed(1)}px) scale(${s.left ? -1 : 1}, 1) rotate(${s.rot.toFixed(1)}deg)`
        el.style.zIndex = s.state === 'queue' || s.state === 'held' ? '10' : '12'
      }
    }

    // Fish schools circle and shimmer; with the swell they slide nearer and farther.
    for (const sc of G.schools) {
      if (sc.away > 0) {
        sc.away -= dt
        if (sc.away <= 0) {
          if (sc.count <= 0) sc.count = 4
          moveSchool(sc)
        }
      }
      const swell = G.twist ? Math.sin(G.time * 0.55 + sc.id * 2) * (T.tall ? 60 : 110) : 0
      sc.cx = sc.x + swell
      sc.cy = sc.y + (G.twist ? Math.cos(G.time * 0.55 + sc.id * 2) * 20 : 0)
      if (sc.el) {
        sc.el.style.transform = `translate(${(sc.cx - 90).toFixed(1)}px, ${(sc.cy - 50).toFixed(1)}px)`
        sc.el.style.opacity = sc.away > 0 ? '0' : '1'
        sc.el.style.pointerEvents = sc.away > 0 || sc.count <= 0 ? 'none' : 'auto'
      }
      sc.fishEls.forEach((f, i) => {
        if (!f) return
        const n = Math.max(1, sc.count)
        const a = G.time * 1.7 + (i * Math.PI * 2) / n
        const x = 90 + Math.cos(a) * 52
        const y = 50 + Math.sin(a) * 20
        f.style.display = i < sc.count ? '' : 'none'
        f.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${Math.sin(a) > 0 ? -1.3 : 1.3} 1.3)`)
      })
    }

    // The pelican dives for a school now and then (in the twist).
    const pel = G.pelican
    if (G.twist && pel.on === 'off' && G.time > pel.next) {
      const sc = G.schools.find((s) => s.count > 0 && s.away <= 0 && !G.sw.some((w) => w.target === s && (w.state === 'fly' || w.state === 'path')))
      if (sc) {
        pel.on = 'fly'
        pel.t = 0
        pel.school = sc
        pel.from = { x: T.w + 150, y: T.tall ? 300 : 200 }
        psfx.dive()
        if (!pel.told) {
          pel.told = true
          say1(P.pelican)
        }
      } else pel.next = G.time + 2
    }
    if (pel.on === 'fly' && pel.school) {
      pel.t += dt / 1.3
      const q = Math.min(1, pel.t)
      const to = { x: pel.school.cx, y: T.sea }
      pel.x = pel.from.x + (to.x - pel.from.x) * q
      pel.y = pel.from.y + (to.y - pel.from.y) * q * q
      if (q >= 1) {
        splash.current?.splash(pel.x, T.sea, 0.6)
        // The fish dart off and gather again somewhere else.
        pel.school.away = 1.4
        pel.on = 'float'
        pel.t = 0
      }
    } else if (pel.on === 'float') {
      pel.t += dt
      pel.y = T.sea + Math.sin(G.time * 2) * 4
      if (pel.t > 4) {
        pel.on = 'leave'
        pel.t = 0
      }
    } else if (pel.on === 'leave') {
      pel.t += dt / 1.4
      pel.x += 500 * dt
      pel.y -= 380 * dt
      if (pel.t >= 1) {
        pel.on = 'off'
        pel.next = G.time + 9 + Math.random() * 5
      }
    }
    if (pelicanEl.current) {
      const fl = pel.on === 'fly' || pel.on === 'leave'
      const w = fl ? (T.tall ? 200 : 240) : T.tall ? 130 : 150
      pelicanEl.current.style.display = pel.on === 'off' ? 'none' : ''
      pelicanEl.current.style.width = `${w}px`
      pelicanEl.current.style.transform = `translate(${(pel.x - w / 2).toFixed(1)}px, ${(pel.y - (fl ? w * 0.4 : w * 0.7)).toFixed(1)}px) scale(${pel.on === 'fly' ? -1 : 1}, 1) rotate(${pel.on === 'fly' ? -35 : 0}deg)`
      if (pelicanImg.current) pelicanImg.current.src = fl ? art.pelicanFly : art.pelicanFloat
    }

    // The quiet guide: Sparkle speaks only when she's been still for a while.
    const quiet = Math.max(G.lastProgress, G.lastTouch)
    if (!G.busy && !G.held && now - quiet > 8000 && now - G.lastHint > 12000) {
      const p = G.phase
      let line: Line | null = null
      if (G.feeding) line = P.idle.feed
      else if (p === 'splash') line = P.idle.launch
      else if (p === 'fish') line = P.idle.fish
      else if (p === 'swim') line = P.idle.swim
      if (line) {
        G.lastHint = now
        say1(line)
        setHint(G.feeding ? 'chicks' : 'front')
      }
    }
  })

  // ---- QA hook: jump to a later moment (motion and screen QA) ----
  useEffect(() => {
    window.__penguinQA = {
      jump: (to) => {
        const G = g.current
        if (G.phase === 'story') startPlay()
        G.splashes = SPLASHES
        star(1)
        if (!G.schools.length) placeSchools()
        setSchoolsOn(true)
        setPhase('fish')
        setPrompt(P.fishGo)
        if (to === 'fish') {
          G.order = 0
          G.need = 1
          G.filled = 0
          setOrder({ need: 1, filled: 0 })
        } else if (to === 'feed') {
          G.order = 1
          G.need = 2
          G.filled = 2
          setOrder({ need: 2, filled: 2 })
          startFeeding()
        } else if (to === 'twist') {
          G.order = 3
          G.fed = [2, 2, 0]
          setFull([0.5, 0.5, 0])
          G.chicks = 3
          setChickCount(3)
          setEggCrack(3)
          G.twist = true
          setRough(true)
          G.pelican.next = G.time + 1
          G.need = 2
          G.filled = 0
          setOrder({ need: 2, filled: 0 })
        } else {
          G.order = ORDERS.length
          G.fed = [4, 4, 3]
          setFull([1, 1, 0.75])
          G.chicks = 3
          setChickCount(3)
          setEggCrack(3)
          G.need = 0
          setOrder(null)
          void swimTime().then(() => {
            if (to === 'parade') {
              G.swimHome = 2
              const s = G.sw.find((w) => w.kind === 'chick')
              if (s) chickBack(s)
            }
          })
        }
        G.lastTouch = performance.now()
      },
    }
    return () => {
      delete window.__penguinQA
    }
  })

  const canPull = phase === 'splash' || phase === 'fish' || phase === 'swim'

  return (
    <div ref={root} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: S ? `linear-gradient(${SKY} 0, ${SKY} ${oy + S.sea * scale}px, ${WATER} ${oy + S.sea * scale}px, ${WATER} ${oy + S.h * scale}px, ${SAND} ${oy + S.h * scale}px)` : SKY, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {S && (
        <div
          ref={stageEl}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{ position: 'absolute', left: ox, top: oy, width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}
        >
          {/* Far: the desert sky, the sun, the hills with the Candelabra, the bay. */}
          <img src={S.tall ? art.bgCoastTall : art.bgCoast} alt="" draggable={false} style={{ position: 'absolute', left: S.bg.x, top: S.bg.y, width: S.bg.w, height: S.bg.h, pointerEvents: 'none' }} />
          <Sun {...S.sun} />
          <Candelabra {...S.candelabra} />
          <Boat S={S} />

          {/* The cliff: the launch rock on top, Pepa's burrow in its face. */}
          {S.cliff.y + S.cliff.h < S.h && (
            // Tall screens: more cliff below the sea, down to the sea floor (the picture's lower half again).
            <div aria-hidden style={{ position: 'absolute', left: S.cliff.x, top: S.cliff.y + S.cliff.h - 40, width: S.cliff.w, height: S.h - S.cliff.y - S.cliff.h + 40, overflow: 'hidden', zIndex: 3, pointerEvents: 'none' }}>
              <img src={art.cliff} alt="" draggable={false} style={{ position: 'absolute', left: 0, top: -S.cliff.h * 0.45, width: S.cliff.w, height: S.cliff.h }} />
            </div>
          )}
          <div aria-hidden style={{ position: 'absolute', left: S.cliff.x, top: S.cliff.y, width: S.cliff.w, height: S.cliff.y + S.cliff.h < S.h ? S.cliff.h - 14 : S.cliff.h, overflow: 'hidden', pointerEvents: 'none', zIndex: 4 }}>
            <img src={art.cliff} alt="" draggable={false} style={{ width: S.cliff.w, height: S.cliff.h, display: 'block' }} />
          </div>
          <Tern x={S.tern.x} y={S.ledge + 4} h={S.tern.h} />

          {/* Pepa's order: one fish-shaped spot per fish. */}
          {order &&
            S.burrow.fish.slice(0, order.need).map((f, i) => (
              <motion.div key={`${i}-${order.need}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15, type: 'spring' }} style={{ position: 'absolute', left: f.x - 46, top: f.y - 30, width: 92, height: 60, zIndex: 5, pointerEvents: 'none' }}>
                <div className={feeding ? 'peru-hint-ring' : undefined} style={{ position: 'absolute', inset: 0, borderRadius: 30, background: 'rgba(255,247,240,.85)', border: `4px ${i < order.filled ? 'solid' : 'dashed'} ${INK}` }} />
                <svg viewBox="-48 -20 96 40" style={{ position: 'absolute', inset: 6, width: 80, height: 48, overflow: 'visible' }}>
                  {i < order.filled ? <FishShape /> : <g opacity="0.3"><FishShape color="#B9A6F5" back="#B9A6F5" /></g>}
                </svg>
              </motion.div>
            ))}

          {/* Inside the burrow: Pepa and her chicks (and the egg). */}
          {pepaHome && (
            <motion.button
              aria-label="Pepa"
              onClick={() => {
                const G = g.current
                void pepa.current?.play('nod')
                say1(P.pepaTap[G.pepaTaps++ % P.pepaTap.length])
              }}
              style={{ position: 'absolute', left: S.pepa.x - (S.pepa.h * PENGUIN_VIEW.w) / PENGUIN_VIEW.h * 0.49, top: S.burrow.floor - S.pepa.h * 0.95, width: (S.pepa.h * PENGUIN_VIEW.w) / PENGUIN_VIEW.h, height: S.pepa.h, padding: 0, background: 'none', border: 'none', zIndex: 5 }}
            >
              <Penguin ref={pepa} kind="pepa" height="100%" label="Pepa" />
            </motion.button>
          )}
          {[0, 1, 2].map((i) => {
            const c = S.chicks[i]
            const w = (c.h * CHICK_VIEW.w) / CHICK_VIEW.h
            if (i >= chickCount) {
              if (i !== 2 || eggCrack >= 3) return null
              return (
                <motion.div key="egg" aria-hidden animate={eggCrack >= 0 ? { rotate: [0, -10, 10, -6, 0] } : { rotate: [0, -3, 3, 0] }} transition={{ repeat: Infinity, duration: eggCrack >= 0 ? 0.5 : 3 }} style={{ position: 'absolute', left: S.egg.x - S.egg.w / 2, top: S.burrow.floor - S.egg.w * 1.17, width: S.egg.w, height: S.egg.w * 1.17, zIndex: 5, transformOrigin: '50% 100%' }}>
                  <Egg crack={eggCrack} />
                </motion.div>
              )
            }
            if (!chickHome[i]) return null
            return (
              <motion.button
                key={`chick${i}`}
                aria-label={`chick ${i + 1}`}
                initial={i === 2 ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                onClick={() => tapChick(i)}
                className={hint === 'chicks' && feeding ? 'peru-tool-glow' : undefined}
                style={{ position: 'absolute', left: c.x - w * 0.5, top: S.burrow.floor - c.h * 0.94, width: w, height: c.h, padding: 0, background: 'none', border: 'none', zIndex: 6 }}
              >
                <Chick ref={(r) => void (chicks.current[i] = r)} height="100%" full={full[i]} tuft={i} label={`chick ${i + 1}`} />
              </motion.button>
            )
          })}

          {/* The rock in the bay: Lobo lounging, Sparkle watching. */}
          <img src={art.seaRock} alt="" draggable={false} style={{ position: 'absolute', left: S.rock.x, top: S.rock.y, width: S.rock.w, pointerEvents: 'none', zIndex: 5 }} />
          <motion.button
            aria-label="Lobo"
            onClick={() => {
              const G = g.current
              const acts = ['bark', 'clap', 'roll']
              void lobo.current?.play(acts[G.loboTaps % 3])
              psfx.bark()
              say1(P.loboTap[G.loboTaps++ % P.loboTap.length])
            }}
            style={{ position: 'absolute', left: S.lobo.x - (S.lobo.h * LOBO_VIEW.w) / LOBO_VIEW.h / 2, top: S.rock.top - S.lobo.h * (LOBO_VIEW.bellyY / LOBO_VIEW.h), width: (S.lobo.h * LOBO_VIEW.w) / LOBO_VIEW.h, height: S.lobo.h, padding: 0, background: 'none', border: 'none', zIndex: 6 }}
          >
            <Lobo ref={lobo} height="100%" seaweed={seaweed} label="Lobo" />
          </motion.button>
          <motion.button
            aria-label="Sparkle"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              void sparkle.current?.play('nod')
              sounds.pop()
              say1(P.facts[g.current.facts++ % P.facts.length])
            }}
            style={{ position: 'absolute', left: S.sparkle.x - S.sparkle.h * 0.45, top: S.rock.top + 14 - S.sparkle.h, width: S.sparkle.h * 0.9, height: S.sparkle.h, padding: 0, background: 'none', border: 'none', zIndex: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          >
            <SparklePuppet ref={sparkle} height={`${S.sparkle.h}px`} lookToward={0.3} />
          </motion.button>

          {/* Under the sea. */}
          {S.kelp.map((k, i) => (
            <Kelp key={i} {...k} delay={i * 1.3} />
          ))}
          <Crab x={S.crab.x} y={S.h - 18} w={S.crab.w} />
          <Jelly {...S.jelly} />
          <Underwater S={S} />
          <Surface S={S} rough={rough} />

          {/* Anchovy schools: shimmering, circling. A tap sends the front penguin right at one. */}
          {schoolsOn &&
            [0, 1].map((i) => (
              <div
                key={i}
                data-school={i}
                aria-label="fish"
                ref={(el) => {
                  const sc = g.current.schools[i]
                  if (sc) sc.el = el
                }}
                style={{ position: 'absolute', left: 0, top: 0, width: 180, height: 100, zIndex: 9, touchAction: 'none', transition: 'opacity .5s', willChange: 'transform' }}
              >
                <motion.div animate={{ opacity: [0.35, 0.7, 0.35] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ position: 'absolute', inset: 6, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,247,240,.8), rgba(255,247,240,0))' }} />
                <svg viewBox="0 0 180 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                  {[0, 1, 2, 3].map((f) => (
                    <g
                      key={f}
                      ref={(el) => {
                        const sc = g.current.schools[i]
                        if (sc) sc.fishEls[f] = el
                      }}
                    >
                      <FishShape />
                    </g>
                  ))}
                </svg>
              </div>
            ))}

          {/* The pelican (in the twist). */}
          <div ref={pelicanEl} aria-hidden style={{ position: 'absolute', left: 0, top: 0, display: 'none', zIndex: 11, pointerEvents: 'none' }}>
            <img ref={pelicanImg} src={art.pelicanFly} alt="" draggable={false} style={{ width: '100%', display: 'block' }} />
          </div>

          {/* The divers (and later the chicks), moved by the loop. */}
          {swimmers.map((sw) => {
            const b = boxOf(sw.kind, sw.h)
            return (
              <div
                key={sw.id}
                data-swimmer={sw.id}
                aria-label={sw.kind === 'chick' ? 'penguin chick' : 'penguin'}
                ref={(el) => {
                  const s = byId(sw.id)
                  if (s) s.el = el
                }}
                style={{ position: 'absolute', left: 0, top: 0, width: b.w, height: sw.h, zIndex: 10, touchAction: 'none', cursor: canPull ? 'grab' : 'default', transformOrigin: `${b.fx * 100}% 55%`, willChange: 'transform' }}
              >
                {hint === 'front' && sw.id === frontId && (
                  <div aria-hidden style={{ position: 'absolute', left: '50%', top: '50%', width: 150, height: 150, marginLeft: -75, marginTop: -75, pointerEvents: 'none' }}>
                    <div className="peru-hint-ring" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '8px solid #FFC83D', boxShadow: '0 0 0 4px rgba(255,255,255,.7)' }} />
                  </div>
                )}
                <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {sw.kind === 'chick' ? (
                    <Chick ref={(r) => void (byId(sw.id)!.puppet.current = r)} height="100%" full={full[sw.chick] ?? 1} tuft={sw.chick} live={byId(sw.id)!.live} />
                  ) : (
                    <Penguin ref={(r) => void (byId(sw.id)!.puppet.current = r)} kind={sw.kind} height="100%" live={byId(sw.id)!.live} />
                  )}
                </div>
              </div>
            )
          })}

          {/* The dotted arc of a pull, and where it will splash. */}
          <svg aria-hidden viewBox={`0 0 ${S.w} ${S.h}`} style={{ position: 'absolute', inset: 0, width: S.w, height: S.h, pointerEvents: 'none', zIndex: 13, overflow: 'visible' }}>
            {Array.from({ length: 13 }, (_, i) => (
              <circle key={i} ref={(el) => void (dots.current[i] = el)} r={7 + i * 0.4} fill="#FFF7F0" stroke={INK} strokeWidth="3" style={{ display: 'none' }} />
            ))}
            <ellipse ref={ring} cy={S.sea} rx="54" ry="16" fill="none" stroke="#FF4F9A" strokeWidth="7" strokeDasharray="14 10" style={{ display: 'none' }} />
          </svg>

          <Splash ref={splash} />

          {/* Fish on their way: to Pepa's order spots, then to a chick. */}
          <AnimatePresence>
            {flyers.map((f) => (
              <motion.div
                key={f.id}
                initial={{ x: f.from.x - 40, y: f.from.y - 20, scale: 0.8 }}
                animate={{ x: [f.from.x - 40, (f.from.x + f.to.x) / 2 - 40, f.to.x - 40], y: [f.from.y - 20, Math.min(f.from.y, f.to.y) - 140, f.to.y - 20], rotate: [0, 200, 360], scale: [0.8, 1.2, 1] }}
                transition={{ duration: 0.65, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: 0, top: 0, width: 80, height: 40, pointerEvents: 'none', zIndex: 17 }}
              >
                <svg viewBox="-48 -20 96 40" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <FishShape />
                </svg>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {prompt && phase !== 'story' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 'var(--top-clear)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 'calc(100% - 24px)' }}>
            <PromptBubble key={lineKey(prompt)} text={prompt} speak={!quiet} />
          </div>
        </div>
      )}

      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 26 }} />}</AnimatePresence>

      {phase === 'story' && <StoryBeat lines={P.story} bg={art.bgCoast} friend={<Penguin kind="pepa" height="100%" />} onDone={startPlay} />}
    </div>
  )
}
