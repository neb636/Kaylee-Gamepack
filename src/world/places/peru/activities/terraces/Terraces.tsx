// ⛰️ Tika's Mountain Terraces (Machu Picchu: the Inca, stone walls, terraces, llamas). Plan:
// planning/around-the-world/peru.md § 5.
// The toy (one core verb): fit big stones into a wall. She drags a chunky Inca stone off the pile; near its own gap it
// gets pulled in and lands with a clonk, a dust puff and a little shake. A stone that doesn't fit bonks and rolls back
// (not wrong, just a different gap). The same verb deepens:
//   1. Fix the wall: 3 big, clearly different gaps in the lowest terrace wall. Tika hops up and munches the grass.
//   2. Build the steps: walls of 4 and 5 smaller stones (L shapes, a many-cornered stone). Each finished terrace grows
//      what she picks (potatoes, corn or kantuta flowers) and a llama friend hops up behind Tika.
//   3. The top: the last wall up in the clouds, stones on both sides of the pile. When it clicks the clouds roll back to
//      show Machu Picchu, and Tika photobombs every picture she takes for Luna's journal.
// The camera climbs the mountainside one wall at a time. Pointer work writes straight to the stones' styles (no React
// re-render per move).
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { BigButton, burst, Buddy, say, shuffle, sounds, SparklePuppet, useAlive, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from '../../art'
import { L } from '../../lines'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/Alpaca'
import { Tika, TIKA_POSES, TIKA_VIEW, type TikaPose } from '../../puppets/Tika'
import { pickLayout, world, type StageLayout, type World } from './layout'
import { CloudShape, Dust, Hole, Mountain, SeedBag, Stone } from './Scene'
import { tsfx } from './sfx'
import { buildWall, WALLS, type StoneShape } from './stones'

const T = L.terraces
const SKY = '#8DD3FC'
const PAD = 36
const N = WALLS.length
const GAPS = WALLS.reduce((a, w) => a + w.gaps.length, 0)
/** Stars: seven for the stones (the star bar can't fit one per stone), plus the photo. */
const TOTAL = 8

type Phase = 'story' | 'build' | 'busy' | 'seeds' | 'photo' | 'end'
type Crop = 'potato' | 'corn' | 'flower'
const CROPS: { id: Crop; img: string; color: string }[] = [
  { id: 'potato', img: art.potatoPlant, color: '#C89A6A' },
  { id: 'corn', img: art.corn, color: '#FBEA9A' },
  { id: 'flower', img: art.kantuta, color: '#FF8FB8' },
]
const FRIENDS = [
  { id: 'brown', img: art.llamaBrown, facesRight: true, k: 1 },
  { id: 'grey', img: art.llamaGrey, facesRight: false, k: 1 },
  { id: 'cria', img: art.cria, facesRight: true, k: 0.62 },
] as const
/** Stage-space clouds (fractions of the stage); more appear the higher she climbs. */
const CLOUDS = [
  { x: 0.04, y: 0.1, w: 260, lvl: 0 },
  { x: 0.74, y: 0.06, w: 300, lvl: 0 },
  { x: 0.42, y: 0.02, w: 230, lvl: 1 },
  { x: 0.2, y: 0.17, w: 330, lvl: 2 },
  { x: 0.6, y: 0.15, w: 360, lvl: 2 },
  { x: -0.04, y: 0.22, w: 420, lvl: 3 },
  { x: 0.7, y: 0.22, w: 400, lvl: 3 },
  { x: 0.36, y: 0.1, w: 380, lvl: 3 },
]

declare global {
  interface Window {
    __terracesQA?: { jump: (to: 1 | 2 | 3 | 'photo') => void; place: (n?: number) => void }
  }
}

interface Cam {
  y: number
  s: number
  dur: number
}

export function Terraces({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const stageEl = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [phase, setPhaseState] = useState<Phase>('story')
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [k, setK] = useState(0)
  const [placed, setPlaced] = useState<Set<string>>(() => new Set())
  const [green, setGreen] = useState<boolean[]>(() => WALLS.map(() => false))
  const [crops, setCrops] = useState<(Crop | null)[]>(() => WALLS.map(() => null))
  const [eaten, setEaten] = useState(-1)
  const [tikaLedge, setTikaLedge] = useState(-1)
  const [pose, setPose] = useState<TikaPose | null>(null)
  const [photoSpot, setPhotoSpot] = useState(0)
  const [friendAt, setFriendAt] = useState<(null | number)[]>([null, null, null])
  const [hopping, setHopping] = useState<number | null>(null)
  const [cam, setCam] = useState<Cam>({ y: 0, s: 1, dur: 0 })
  const [hover, setHover] = useState<string | null>(null)
  const [glow, setGlow] = useState<string | null>(null)
  const [dusts, setDusts] = useState<{ id: number; x: number; y: number; w: number }[]>([])
  const [shake, setShake] = useState(0)
  const [shimmer, setShimmer] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [photos, setPhotos] = useState<TikaPose[]>([])
  const [flash, setFlash] = useState(0)
  const [bear, setBear] = useState(false)
  const [puff, setPuff] = useState<Record<number, number>>({})
  const [poke, setPoke] = useState<Record<string, number>>({})
  const [spitBall, setSpitBall] = useState(0)

  // One random wall layout per visit (replay): the gaps' jitter, a mirror flip, the pile's order.
  const [seed] = useState(() => Math.floor(Math.random() * 1e6) + 1)
  const [mirror] = useState(() => Math.random() < 0.5)
  /** Tika and her friends wait at the end of the wall whose last column is never a gap. */
  const side = mirror ? -1 : 1
  const [orders] = useState(() => WALLS.map((w) => shuffle(w.gaps.map((_, i) => `s${i}`))))

  const tika = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const friendRefs = useRef<(PuppetHandle | null)[]>([null, null, null])
  const tikaBox = useRef<HTMLButtonElement>(null)
  const stoneEls = useRef(new Map<string, HTMLDivElement | null>())

  // ---- Layout: measure, pick the wide or tall stage, scale it to fit. ----
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const S: StageLayout | null = size.W ? pickLayout(size.W, size.H) : null
  const W: World | null = useMemo(() => (S ? world(S) : null), [S])
  const scale = S ? Math.min(size.W / S.w, size.H / S.h) : 1
  const ox = S ? (size.W - S.w * scale) / 2 : 0
  const oy = S ? (size.H - S.h * scale) / 2 : 0

  /** Every wall's stones (in wall units: add wallLeft / wallTop for world units). */
  const walls = useMemo(() => (S ? WALLS.map((p, i) => buildWall(p, S.wallW[i], S.wallH, seed + i * 7919, mirror)) : []), [S, seed, mirror])

  // ---- Mutable state for pointer handling (React never sees it per move). ----
  const g = useRef({
    phase: 'story' as Phase,
    k: 0,
    held: null as null | { id: string; pid: number; sx: number; sy: number; ox: number; oy: number; x: number; y: number; moved: boolean },
    placed: new Set<string>(),
    bonks: 0,
    tapHint: null as null | { id: string; at: number },
    lastProgress: performance.now(),
    lastHint: 0,
    cam: { y: 0, s: 1 } as { y: number; s: number },
    clonks: 0,
    cornersSaid: false,
    tikaTaps: [] as number[],
    facts: 0,
    bush: 0,
    birdSaid: false,
    potatoSaid: false,
    busy: false,
    dustId: 1,
    flowerEaten: false,
  })
  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }
  const progress = (n: number) => setProgress(Math.min(n, TOTAL), TOTAL)
  useEffect(() => progress(Math.floor((placed.size / GAPS) * (TOTAL - 1)) + (photos.length ? 1 : 0)), [placed, photos])

  // The camera follows the wall she's building (re-aimed when the stage changes shape).
  const camFor = (kk: number): Cam => (W ? { y: W.camFor(kk), s: 1, dur: 1.6 } : { y: 0, s: 1, dur: 0 })
  useEffect(() => {
    if (!W) return
    const c = g.current.phase === 'photo' || revealed ? { y: W.camSummit, s: 1, dur: 0 } : { ...camFor(g.current.k), dur: 0 }
    g.current.cam = c
    setCam(c)
  }, [W])
  const moveCam = (c: Cam) => {
    g.current.cam = c
    setCam(c)
  }

  // ---- Where things are ----
  const wallStones = (kk: number) => walls[kk] ?? []
  const gapsOf = (kk: number) => wallStones(kk).filter((s) => s.gap)
  const stoneById = (kk: number, id: string) => wallStones(kk).find((s) => s.id === id)!
  const keyOf = (kk: number, id: string) => `${kk}:${id}`
  /** A gap's centre on the stage (camera at scale 1 while building). */
  const holeAt = (kk: number, st: StoneShape) => (W ? { x: W.wallLeft(kk) + st.c.x, y: W.wallTop(kk) + st.c.y - g.current.cam.y } : { x: 0, y: 0 })
  const mx = (x: number) => (side < 0 && S ? S.w - x : x)

  /** The stone pile on the foreground ledge: one row, stones lying on the ground (both sides for the top wall). */
  const pileFor = (kk: number) => {
    const out = new Map<string, { x: number; y: number; sc: number }>()
    if (!S) return out
    const order = orders[kk].map((id) => stoneById(kk, id))
    const P = S.pile
    const split = kk === N - 1
    const middle = split ? (S.tall ? 120 : 200) : 0
    const gap = 26
    const n = order.length
    const sumW = order.reduce((a, s) => a + s.w, 0)
    const maxH = Math.max(...order.map((s) => s.h))
    const avail = P.x1 - P.x0 - middle
    const sc = Math.min(0.9, (P.y1 - P.y0) / maxH, (avail - gap * (n - 1)) / sumW)
    const extra = Math.max(0, (avail - sumW * sc - gap * (n - 1)) / (n + 1))
    let x = P.x0 + extra
    order.forEach((st, i) => {
      if (split && i === Math.ceil(n / 2)) x += middle
      const cx = x + (st.w * sc) / 2
      out.set(st.id, { x: mx(cx), y: P.y1 - (st.h * sc) / 2, sc })
      x += st.w * sc + gap + extra
    })
    return out
  }
  const pile = useMemo(() => pileFor(k), [S, k, walls])
  const pileRef = useRef(pile)
  pileRef.current = pile

  const setStone = (id: string, x: number, y: number, sc: number, ms = 0, ease = 'cubic-bezier(.3,1.35,.5,1)') => {
    const el = stoneEls.current.get(id)
    const st = W && walls[g.current.k] ? stoneById(g.current.k, id) : null
    if (!el || !st) return
    el.style.transition = ms ? `transform ${ms}ms ${ease}` : 'none'
    el.style.transform = `translate(${x - st.w / 2 - PAD}px, ${y - st.h / 2 - PAD}px) scale(${sc})`
  }
  const sendHome = (id: string, ms = 450) => {
    const h = pileRef.current.get(id)
    if (h) setStone(id, h.x, h.y, h.sc, ms)
  }

  // A new pile rolls in from the side with a rumble (and settles again when the stage changes shape).
  const rolled = useRef(-1)
  useEffect(() => {
    if (!S || phase === 'story') return
    const ids = [...pile.keys()].filter((id) => !g.current.placed.has(keyOf(k, id)))
    if (rolled.current === k) {
      ids.forEach((id) => sendHome(id, 0))
      return
    }
    rolled.current = k
    ids.forEach((id) => {
      const h = pile.get(id)!
      setStone(id, h.x + side * S.w * 0.7, h.y, h.sc, 0)
    })
    void stoneEls.current.values().next().value?.offsetWidth
    tsfx.rumble()
    ids.forEach((id, i) => setTimeout(() => alive() && sendHome(id, 700), 60 + i * 110))
  }, [pile, phase === 'story'])

  // ---- The story, then play ----
  const startPlay = () => {
    setPhase('build')
    setPrompt(T.go)
    g.current.lastProgress = performance.now()
  }

  const say1 = (line: Line) => void say(line)
  const dust = (x: number, y: number, w: number) => {
    const id = g.current.dustId++
    setDusts((d) => [...d, { id, x, y, w }])
    setTimeout(() => alive() && setDusts((d) => d.filter((q) => q.id !== id)), 800)
  }

  // ---- The core verb: a stone lands in its gap ----
  const place = (id: string) => {
    const G = g.current
    const kk = G.k
    const key = keyOf(kk, id)
    if (G.placed.has(key)) return
    const st = stoneById(kk, id)
    const at = holeAt(kk, st)
    G.placed = new Set(G.placed).add(key)
    setPlaced(G.placed)
    G.bonks = 0
    G.lastProgress = performance.now()
    setGlow(null)
    setHover(null)
    tsfx.clonk()
    setShake((s) => s + 1)
    dust(at.x, at.y + st.h / 2, st.w)
    G.clonks++
    void tika.current?.play(G.clonks % 2 ? 'nod' : 'cheer')
    if (st.corners && !G.cornersSaid) {
      G.cornersSaid = true
      say1(T.corners)
    } else if (G.clonks % 3 === 1) say1(T.clonk[Math.floor(G.clonks / 3) % T.clonk.length])
    if (gapsOf(kk).every((s) => G.placed.has(keyOf(kk, s.id)))) void wallDone(kk)
  }

  /** Glide a stone from wherever it is into its gap, then clonk. */
  const flyIn = (id: string) => {
    const G = g.current
    const st = stoneById(G.k, id)
    const at = holeAt(G.k, st)
    setStone(id, at.x, at.y, 1, 260, 'cubic-bezier(.4,1.4,.6,1)')
    setTimeout(() => alive() && place(id), 270)
  }

  const bonk = (id: string) => {
    const G = g.current
    tsfx.bonk()
    sfx.boing()
    G.bonks++
    const el = stoneEls.current.get(id)
    el?.animate([{ rotate: '0deg' }, { rotate: '-9deg' }, { rotate: '7deg' }, { rotate: '0deg' }], { duration: 380 })
    sendHome(id, 650)
    void tika.current?.play('giggle')
    // After two misses in a row, help: the stone's own gap glows.
    if (G.bonks >= 2) {
      setGlow(id)
      say1(T.glow)
    }
  }

  // ---- A finished wall: grass, Tika hops up, a friend follows, seeds ----
  const wallDone = async (kk: number) => {
    const G = g.current
    setPhase('busy')
    setPrompt(null)
    await wait(350)
    if (!alive()) return
    setShimmer(kk)
    sounds.sparkle()
    setGreen((gr) => gr.map((v, i) => v || i === kk))
    await wait(700)
    if (!alive()) return
    setShimmer(null)
    // Tika crouches and hops up onto her new terrace; a friend hops up onto the one she left.
    void tika.current?.play('hop')
    sfx.boing()
    setTikaLedge(kk)
    if (kk >= 1) {
      const f = kk - 1
      setTimeout(() => {
        if (!alive()) return
        void friendRefs.current[f]?.play('jump')
        sfx.boing()
        setHopping(f)
        setTimeout(() => {
          if (!alive()) return
          setHopping(null)
          setFriendAt((a) => a.map((v, i) => (i === f ? kk - 1 : v)))
          sfx.thump()
        }, 850)
      }, 500)
    }
    await wait(950)
    if (!alive()) return
    sfx.thump()
    if (kk === N - 1) return reveal()
    void tika.current?.play('munch')
    sfx.munch()
    await say(T.wallDone[kk])
    if (!alive()) return
    if (kk === 1) say1(T.friends)
    setPhase('seeds')
    setPrompt(T.seeds)
    G.lastProgress = performance.now()
  }

  const plant = async (crop: Crop) => {
    const G = g.current
    if (G.phase !== 'seeds') return
    const kk = G.k
    setPhase('busy')
    setPrompt(null)
    setCrops((c) => c.map((v, i) => (i === kk ? crop : v)))
    tsfx.sprout()
    void tika.current?.play('cheer')
    await say(T.grew[crop])
    if (!alive()) return
    // Silly: Tika nibbles a flower she just planted and looks innocent.
    if (crop === 'flower' && !G.flowerEaten) {
      G.flowerEaten = true
      setTimeout(async () => {
        if (!alive()) return
        void tika.current?.play('munch')
        sfx.munch()
        await wait(900)
        if (!alive()) return
        setEaten(kk)
        void tika.current?.play('smug')
        say1(T.innocent)
      }, 2600)
    }
    // Climb to the next wall.
    const next = kk + 1
    G.k = next
    G.bonks = 0
    setGlow(null)
    moveCam(camFor(next))
    await wait(1700)
    if (!alive()) return
    setK(next)
    setPhase('build')
    G.lastProgress = performance.now()
    if (next === N - 1) {
      await say(T.clouds)
      if (alive()) setPrompt(T.top)
    } else setPrompt(T.next)
  }

  // ---- The top: the clouds roll back, Machu Picchu, the photobomb ----
  const reveal = async () => {
    if (!W) return
    setRevealed(true)
    moveCam({ y: W.camSummit, s: 1, dur: 2.4 })
    void tika.current?.play('cheer')
    sounds.whoosh()
    await wait(1400)
    if (!alive()) return
    sounds.fanfare()
    burst(0.5, 0.35)
    await say(T.reveal)
    if (!alive()) return
    await say(T.built)
    if (!alive()) return
    setPhase('photo')
    setPrompt(T.photo)
    g.current.lastProgress = performance.now()
  }

  const snap = async () => {
    const G = g.current
    if (G.phase !== 'photo') return
    G.lastProgress = performance.now()
    tsfx.click()
    setFlash((f) => f + 1)
    // Tika jumps into the picture with a new face every time.
    const next = shuffle(TIKA_POSES.filter((p) => p !== pose))[0]
    setPose(next)
    setPhotoSpot((s) => (s + 1 + Math.floor(Math.random() * 2)) % 3)
    void tika.current?.play('hop')
    const n = photos.length
    setPhotos((p) => [...p, next])
    say1(T.bomb[n % T.bomb.length])
    if (n === 0) {
      await wait(1500)
      if (alive()) say1(T.journal)
    }
    if (n >= 4) void finish()
  }

  const finish = async () => {
    const G = g.current
    if (G.phase !== 'photo' || !W || !S) return
    setPhase('end')
    setPrompt(null)
    setPose(null)
    // One last look: the whole mountainside, llamas on every step.
    const top = W.summit - S.tikaH - 80
    const s = Math.min(1, S.h / (W.G + 60 - top))
    moveCam({ y: top, s, dur: 2.2 })
    await wait(1800)
    if (!alive()) return
    void tika.current?.play('cheer')
    friendRefs.current.forEach((f) => void f?.play('cheer'))
    void sparkle.current?.play('cheer')
    burst(0.5, 0.5)
    sounds.sparkle()
    await wait(1800)
    if (alive()) onDone()
  }

  // ---- Pointer handling on the stage ----
  const toStage = (cx: number, cy: number) => {
    const r = stageEl.current?.getBoundingClientRect()
    return r ? { x: (cx - r.left) / scale, y: (cy - r.top) / scale } : { x: 0, y: 0 }
  }

  /** The nearest empty gap of this wall to a point (stage units), and how far it is. */
  const nearestGap = (x: number, y: number) => {
    const G = g.current
    let best: StoneShape | null = null
    let bestD = Infinity
    for (const st of gapsOf(G.k)) {
      if (G.placed.has(keyOf(G.k, st.id))) continue
      const h = holeAt(G.k, st)
      const d = Math.hypot(h.x - x, h.y - y)
      if (d < bestD) {
        bestD = d
        best = st
      }
    }
    return { st: best, d: bestD }
  }

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const target = e.target as Element
    if (target.closest('button')) return
    const el = target.closest('[data-stone]') as HTMLElement | null
    if (!el || G.phase !== 'build' || G.held) return
    const id = el.dataset.stone!
    const home = pileRef.current.get(id)
    if (!home) return
    const p = toStage(e.clientX, e.clientY)
    e.currentTarget.setPointerCapture(e.pointerId)
    // Keep the stone where she grabbed it (a little above her finger so she can see it), lifted to full size.
    const clampO = (v: number) => Math.max(-40, Math.min(40, v))
    G.held = { id, pid: e.pointerId, sx: p.x, sy: p.y, ox: clampO(home.x - p.x), oy: clampO(home.y - p.y) - 20, x: p.x, y: p.y, moved: false }
    el.style.zIndex = '40'
    setStone(id, p.x + G.held.ox, p.y + G.held.oy, 1, 160)
    tsfx.lift()
    G.lastProgress = performance.now()
  }

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const h = G.held
    if (!h || e.pointerId !== h.pid) return
    const p = toStage(e.clientX, e.clientY)
    h.x = p.x
    h.y = p.y
    if (Math.hypot(p.x - h.sx, p.y - h.sy) > 12) h.moved = true
    let x = p.x + h.ox
    let y = p.y + h.oy
    // Near its own gap the stone is pulled in, like a magnet.
    const st = stoneById(G.k, h.id)
    const own = holeAt(G.k, st)
    const d = Math.hypot(own.x - x, own.y - y)
    const pullR = 200
    if (d < pullR) {
      const k2 = 0.45 * (1 - d / pullR)
      x += (own.x - x) * k2
      y += (own.y - y) * k2
    }
    setStone(h.id, x, y, 1, 0)
    const near = nearestGap(x, y)
    const hv = near.st && near.d < Math.max(near.st.w, near.st.h) * 0.6 ? near.st.id : null
    setHover((cur) => (cur === hv ? cur : hv))
  }

  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    const h = G.held
    if (!h || e.pointerId !== h.pid) return
    G.held = null
    setHover(null)
    const el = stoneEls.current.get(h.id)
    if (el) el.style.zIndex = ''
    const st = stoneById(G.k, h.id)
    if (!h.moved) {
      // A tap shows where it goes; a second tap puts it there.
      const now = performance.now()
      if (G.tapHint?.id === h.id && now - G.tapHint.at < 3500) {
        G.tapHint = null
        flyIn(h.id)
        return
      }
      G.tapHint = { id: h.id, at: now }
      setGlow(h.id)
      sounds.pop()
      el?.animate([{ rotate: '0deg' }, { rotate: '-6deg' }, { rotate: '6deg' }, { rotate: '0deg' }], { duration: 350 })
      sendHome(h.id, 300)
      return
    }
    const x = h.x + h.ox
    const y = h.y + h.oy
    const own = holeAt(G.k, st)
    if (Math.hypot(own.x - x, own.y - y) < Math.max(110, Math.max(st.w, st.h) * 0.55)) return flyIn(h.id)
    const near = nearestGap(x, y)
    if (near.st && near.d < Math.max(near.st.w, near.st.h) * 0.6) return bonk(h.id)
    // Dropped on Tika: she hops onto it like a stage (then it rolls back).
    const tb = tikaBox.current?.getBoundingClientRect()
    if (tb && e.clientX > tb.left && e.clientX < tb.right && e.clientY > tb.top && e.clientY < tb.bottom) {
      void tika.current?.play('hop')
      sfx.boing()
      say1(T.hey)
    }
    sendHome(h.id)
    sounds.pop()
  }

  // ---- Pokeables ----
  const pokeIt = (id: string) => setPoke((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }))
  const tapTika = () => {
    const G = g.current
    const now = performance.now()
    G.tikaTaps = [...G.tikaTaps.filter((t) => now - t < 1500), now]
    sounds.pop()
    if (G.tikaTaps.length >= 3) {
      G.tikaTaps = []
      void tika.current?.play('dance')
      tsfx.hum()
      say1(T.dance)
    } else if (G.phase !== 'busy') {
      void tika.current?.play(Math.random() < 0.5 ? 'giggle' : 'munch')
      say1(T.tickle[Math.floor(Math.random() * T.tickle.length)])
    }
  }
  const tapFriend = (i: number) => {
    void friendRefs.current[i]?.play(i === 2 ? 'jump' : 'nod')
    tsfx.hum()
    // The grey llama spits a tiny grass ball at the brown one (llamas really spit!).
    if (i === 1 && friendAt[0] === friendAt[1]) {
      tsfx.spit()
      setSpitBall((b) => b + 1)
      setTimeout(() => alive() && void friendRefs.current[0]?.play('wiggle'), 450)
    }
  }
  const tapBush = () => {
    const G = g.current
    G.bush++
    tsfx.rustle()
    pokeIt('bush')
    if (G.bush % 2 === 0 && !bear) {
      setBear(true)
      sounds.sparkle()
      if (G.bush === 2) say1(T.bear)
      setTimeout(() => alive() && setBear(false), 2600)
    }
  }

  // ---- The quiet guide: Sparkle only speaks when nothing has happened for a while ----
  useEffect(() => {
    const t = setInterval(() => {
      const G = g.current
      const now = performance.now()
      if (G.held || now - G.lastProgress < 9000 || now - G.lastHint < 12000) return
      if (G.phase === 'build') {
        G.lastHint = now
        const left = orders[G.k].find((id) => !G.placed.has(keyOf(G.k, id)))
        if (left) setGlow(left)
        say1(T.idle.stone)
      } else if (G.phase === 'seeds') {
        G.lastHint = now
        say1(T.idle.seed)
      } else if (G.phase === 'photo') {
        G.lastHint = now
        say1(T.idle.photo)
      }
    }, 600)
    return () => clearInterval(t)
  }, [walls])

  // ---- QA hook: jump ahead, or place stones for her (motion, screen and pacing QA) ----
  useEffect(() => {
    window.__terracesQA = {
      place: (n = 1) => {
        const G = g.current
        if (G.phase !== 'build') return
        orders[G.k]
          .filter((id) => !G.placed.has(keyOf(G.k, id)))
          .slice(0, n)
          .forEach((id, i) => setTimeout(() => flyIn(id), i * 320))
      },
      jump: (to) => {
        const G = g.current
        const target = to === 'photo' ? N : to
        const all = new Set(G.placed)
        for (let kk = 0; kk < target; kk++) for (const st of gapsOf(kk)) all.add(keyOf(kk, st.id))
        G.placed = all
        setPlaced(all)
        setGreen(WALLS.map((_, i) => i < target))
        setCrops(WALLS.map((_, i) => (i < Math.min(target, N - 1) ? CROPS[i % 3].id : null)))
        setTikaLedge(target - 1)
        setFriendAt([0, 1, 2].map((i) => (i < target - 1 ? i : null)))
        setPhase('build')
        if (to === 'photo') {
          G.k = N - 1
          setK(N - 1)
          setRevealed(true)
          if (W) moveCam({ y: W.camSummit, s: 1, dur: 0 })
          setPhase('photo')
          setPrompt(T.photo)
        } else {
          G.k = to
          setK(to)
          moveCam({ ...camFor(to), dur: 0 })
          setPrompt(to === N - 1 ? T.top : T.next)
        }
      },
    }
    return () => {
      delete window.__terracesQA
    }
  })

  // ---- Render ----
  if (!S || !W) return <div ref={root} style={{ position: 'absolute', inset: 0, background: SKY }} />

  const tikaH = S.tikaH
  const tikaW = (tikaH * TIKA_VIEW.w) / TIKA_VIEW.h
  /** Where llamas stand on ledge j (-1 = the valley floor): at the end of the ledge on their side. */
  const llamaSpot = (j: number, w: number, inward = 0) => {
    const end = j < 0 ? W.cx + S.wallW[0] / 2 + 60 : W.cx + S.wallW[j] / 2 + 26
    // Never past the screen edge (narrow tall stages).
    const x = Math.min(end - w * 0.5 - inward, S.w - w * 0.5 - 12)
    return { x: mx(x), y: W.ledgeFeet(j) }
  }
  const photoXs = [W.cx - 160, W.cx + 70, W.cx + 230]
  const tikaPos = phase === 'photo' || phase === 'end' ? { x: mx(photoXs[photoSpot]), y: W.ledgeFeet(N - 1) } : llamaSpot(tikaLedge, tikaW, S.tall ? 0 : -34)
  const friendW = (i: number) => S.llamaH * FRIENDS[i].k * 0.85
  const frontSpot = (i: number) => ({ x: mx(S.friends.x - (1 - i) * S.friends.gap), y: S.friends.feet })
  const cloudLevel = revealed ? -1 : k
  const camT = `translate(${(S.w * (1 - cam.s)) / 2}px, ${-cam.y * cam.s}px) scale(${cam.s})`
  // The painting behind: fitted to the stage width, with the city just above the summit in the summit view, and a
  // little parallax (far away, so it moves much less than the mountainside).
  const paintTop = S.cityAt - (S.tall ? 0.48 : 0.58) * S.paintH - (cam.y - W.camSummit) * 0.12 * cam.s
  const pokeKey = (id: string) => poke[id] ?? 0
  const pk = (id: string) => ({ animate: { rotate: pokeKey(id) ? [0, -10, 8, -5, 0] : 0, y: pokeKey(id) ? [0, -14, 0] : 0 }, transition: { duration: 0.5 } })

  // Things to poke on the mountainside (world units), on the side away from Tika's end so they never hide a gap.
  const sideX = (kk: number, frac: number) => mx(W.cx - S.wallW[kk] / 2 - (S.tall ? 40 : 60) - frac)
  const bushAt = { x: sideX(1, S.tall ? 10 : 60), y: W.ledgeFeet(0) + 6, h: S.tall ? 120 : 150 }
  const birdAt = { x: sideX(2, S.tall ? 0 : 40), y: W.ledgeFeet(1) - 10, h: S.tall ? 105 : 130 }
  const viscachaAt = { x: mx(W.cx - S.wallW[0] / 2 + (S.tall ? 70 : 20)), y: W.G + 40, h: S.tall ? 100 : 120 }
  const hummAt = { x: sideX(3, 30), y: W.wallTop(2) - 120 }
  const doorAt = { x: mx(W.cx - S.wallW[N - 1] / 2 + 130), y: W.ledgeFeet(N - 1) + 4, h: S.tall ? 150 : 170 }

  const worldEl = (
    <div style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: W.height, transform: camT, transformOrigin: '0 0', transition: `transform ${cam.dur}s cubic-bezier(.45,0,.3,1)`, willChange: 'transform' }}>
      <svg viewBox={`0 0 ${S.w} ${W.height}`} style={{ position: 'absolute', left: 0, top: 0, width: S.w, height: W.height, overflow: 'visible', pointerEvents: 'none' }}>
        <defs>
          {WALLS.map((_, kk) => (
            <clipPath key={kk} id={`terr-wall-${kk}`}>
              <rect x={W.wallLeft(kk)} y={W.wallTop(kk)} width={S.wallW[kk]} height={S.wallH} />
            </clipPath>
          ))}
        </defs>
        <Mountain S={S} W={W} green={green} />
        {walls.map((stones, kk) => (
          <motion.g key={`${kk}-${kk === k ? shake : 0}`} initial={{ y: 0 }} animate={kk === k && shake ? { y: [0, 5, -3, 0] } : { y: 0 }} transition={{ duration: 0.3 }}>
            <g transform={`translate(${W.wallLeft(kk)} ${W.wallTop(kk)})`}>
              {stones.map((st) =>
                st.gap && !placed.has(keyOf(kk, st.id)) ? (
                  <Hole key={st.id} st={st} glow={kk === k && glow === st.id} hover={kk === k && hover === st.id} active={kk === k && phase !== 'story'} />
                ) : (
                  <Stone key={st.id} st={st} />
                ),
              )}
            </g>
            {shimmer === kk && (
              <g clipPath={`url(#terr-wall-${kk})`}>
                <motion.rect initial={{ x: W.wallLeft(kk) - 300 }} animate={{ x: W.wallLeft(kk) + S.wallW[kk] + 100 }} transition={{ duration: 0.7, ease: 'easeInOut' }} y={W.wallTop(kk) - 40} width="160" height={S.wallH + 80} fill="#FFF7F0" opacity=".65" transform="skewX(-20)" />
              </g>
            )}
          </motion.g>
        ))}
      </svg>

      {/* Crops on the finished terraces. */}
      {crops.map((c, kk) => {
        if (!c) return null
        const crop = CROPS.find((q) => q.id === c)!
        const from = W.cx - S.wallW[kk] / 2 + 40
        const to = W.cx + S.wallW[kk] / 2 - tikaW - 30
        const n = Math.max(2, Math.floor((to - from) / (S.tall ? 150 : 175)))
        return Array.from({ length: n }, (_, i) => {
          const x = mx(from + ((to - from) * (i + 0.5)) / n)
          if (eaten === kk && i === n - 1) return null
          return (
            <motion.button
              key={`${kk}-${i}`}
              aria-label={c}
              initial={{ scale: 0, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.12, type: 'spring', duration: 0.6 }}
              whileTap={{ scale: 1.2, rotate: -8 }}
              onClick={() => {
                tsfx.sprout()
                if (c === 'potato' && !g.current.potatoSaid) {
                  g.current.potatoSaid = true
                  say1(T.potatoes)
                }
              }}
              style={{ position: 'absolute', left: x - 65, top: W.wallTop(kk) - 6 - (S.tall ? 84 : 94), width: 130, height: S.tall ? 84 : 94, padding: 0, background: 'none', border: 'none', transformOrigin: '50% 100%', zIndex: 2 }}
            >
              <img src={crop.img} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', pointerEvents: 'none' }} />
            </motion.button>
          )
        })
      })}

      {/* Pokeables on the mountainside. */}
      <button aria-label="bush" onClick={tapBush} style={{ position: 'absolute', left: bushAt.x - bushAt.h * 0.75, top: bushAt.y - bushAt.h, width: bushAt.h * 1.5, height: bushAt.h, padding: 0, background: 'none', border: 'none', zIndex: 2 }}>
        <AnimatePresence>
          {bear && (
            <motion.img key="bear" src={art.bear} alt="spectacled bear" initial={{ y: '60%' }} animate={{ y: '-38%' }} exit={{ y: '60%' }} transition={{ type: 'spring', duration: 0.6 }} style={{ position: 'absolute', left: '22%', top: 0, width: '56%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
          )}
        </AnimatePresence>
        <motion.img key={`bush-${pokeKey('bush')}`} {...pk('bush')} src={art.bush} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', pointerEvents: 'none', transformOrigin: '50% 100%' }} />
      </button>
      <button
        aria-label="cock-of-the-rock"
        onClick={() => {
          tsfx.squawk()
          pokeIt('bird')
          if (!g.current.birdSaid) {
            g.current.birdSaid = true
            say1(L.facts.bird)
          }
        }}
        style={{ position: 'absolute', left: birdAt.x - birdAt.h * 0.5, top: birdAt.y - birdAt.h, width: birdAt.h, height: birdAt.h, padding: 0, background: 'none', border: 'none', zIndex: 2 }}
      >
        <motion.img key={`bird-${pokeKey('bird')}`} {...pk('bird')} src={art.cockRock} alt="" draggable={false} className="terr-bob" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', pointerEvents: 'none', transform: side < 0 ? undefined : 'scaleX(-1)' }} />
      </button>
      <button aria-label="viscacha" onClick={() => (sounds.pop(), pokeIt('viscacha'))} style={{ position: 'absolute', left: viscachaAt.x - viscachaAt.h * 0.45, top: viscachaAt.y - viscachaAt.h, width: viscachaAt.h * 0.9, height: viscachaAt.h, padding: 0, background: 'none', border: 'none', zIndex: 2 }}>
        <motion.img key={`viscacha-${pokeKey('viscacha')}`} {...pk('viscacha')} animate={{ scaleY: pokeKey('viscacha') ? [1, 1.25, 0.9, 1] : 1 }} src={art.viscacha} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', pointerEvents: 'none', transformOrigin: '50% 100%' }} />
      </button>
      <button aria-label="hummingbird" onClick={() => (sounds.sparkle(), pokeIt('humm'))} style={{ position: 'absolute', left: hummAt.x - 60, top: hummAt.y - 50, width: 120, height: 100, padding: 0, background: 'none', border: 'none', zIndex: 2 }}>
        <motion.img
          key={pokeKey('humm')}
          animate={pokeKey('humm') ? { x: [0, 80, 40, -60, 0], y: [0, -70, -110, -50, 0], rotate: [0, 20, 360, 340, 360] } : {}}
          transition={{ duration: 1.3 }}
          src={art.hummingbird}
          alt=""
          draggable={false}
          className="terr-hover"
          style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none', transform: side < 0 ? 'scaleX(-1)' : undefined }}
        />
      </button>
      <button
        aria-label="stone doorway"
        onClick={() => {
          tsfx.whistle()
          pokeIt('door')
        }}
        style={{ position: 'absolute', left: doorAt.x - doorAt.h * 0.5, top: doorAt.y - doorAt.h, width: doorAt.h, height: doorAt.h, padding: 0, background: 'none', border: 'none', zIndex: 1 }}
      >
        <img src={art.doorway} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: '50% 100%', pointerEvents: 'none' }} />
        {pokeKey('door') > 0 &&
          [0, 1, 2].map((i) => (
            <motion.span key={`${pokeKey('door')}-${i}`} initial={{ x: -10, y: 0, opacity: 1, rotate: 0 }} animate={{ x: side * 260, y: -60 - i * 30, opacity: 0, rotate: 300 }} transition={{ duration: 1.2, delay: i * 0.12 }} style={{ position: 'absolute', left: '42%', top: `${48 + i * 12}%`, width: 26, height: 16, borderRadius: '50% 0', background: '#6CC56E', border: `3px solid ${INK}`, pointerEvents: 'none' }} />
          ))}
      </button>

      {/* Friends who've climbed up. */}
      {FRIENDS.map((f, i) => {
        const j = friendAt[i]
        if (j === null || hopping === i) return null
        const w = friendW(i)
        const at = llamaSpot(j, w, i === 2 ? 10 : 0)
        return (
          <FriendLlama key={f.id} i={i} at={at} h={S.llamaH * f.k} facesRight={f.facesRight} side={side} refs={friendRefs} onTap={() => tapFriend(i)} z={3} />
        )
      })}

      {/* Tika. */}
      <Hopper x={tikaPos.x} y={tikaPos.y} z={4} snapKey={`${S.tall}`}>
        <motion.button ref={tikaBox} aria-label="Tika" onClick={tapTika} style={{ padding: 0, background: 'none', border: 'none', display: 'block' }}>
          <Tika ref={tika} height={`${tikaH}px`} pose={phase === 'photo' ? pose : null} flip={phase === 'photo' || phase === 'end' ? false : side > 0} />
        </motion.button>
      </Hopper>
    </div>
  )

  return (
    <div ref={root} className="terr-root" style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: SKY, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      <div
        ref={stageEl}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{ position: 'absolute', left: ox, top: oy, width: S.w, height: S.h, transform: `scale(${scale})`, transformOrigin: '0 0' }}
      >
        {/* Far away: Machu Picchu and Huayna Picchu (only seen above the mountainside). Wide screens extend it sideways. */}
        <img
          src={S.tall ? art.bgMpTall : art.bgMp}
          alt=""
          draggable={false}
          style={{ position: 'absolute', left: -ox / scale, width: size.W / scale, top: paintTop, height: S.paintH, objectFit: 'cover', objectPosition: '50% 0', transition: `top ${cam.dur}s cubic-bezier(.45,0,.3,1)`, pointerEvents: 'none' }}
        />
        {/* Below the painting: more of its green hills. */}
        <div style={{ position: 'absolute', left: -ox / scale, width: size.W / scale, top: paintTop + S.paintH - 4, height: S.h * 2, background: S.tall ? '#91DC9C' : '#A8D879', transition: `top ${cam.dur}s cubic-bezier(.45,0,.3,1)`, pointerEvents: 'none' }} />
        {worldEl}

        {/* Clouds: thicker the higher she climbs; they roll back at the top. */}
        {CLOUDS.map((c, i) => {
          const on = c.lvl <= cloudLevel
          const away = revealed
          return (
            <div
              key={i}
              style={{ position: 'absolute', left: c.x * S.w, top: c.y * S.h, zIndex: 6, opacity: on ? 0.95 : 0, transform: away ? `translateX(${c.x < 0.4 ? -900 : 900}px)` : 'none', transition: 'opacity 1.2s, transform 2.2s ease-in', pointerEvents: on && !away ? 'auto' : 'none' }}
            >
              <motion.button
                aria-label="cloud"
                className="terr-drift"
                key={puff[i] ?? 0}
                animate={puff[i] ? { scale: [1, 1.18, 0.92, 1] } : {}}
                transition={{ duration: 0.5 }}
                onClick={() => {
                  tsfx.puff()
                  setPuff((p) => ({ ...p, [i]: (p[i] ?? 0) + 1 }))
                }}
                style={{ padding: 0, background: 'none', border: 'none', display: 'block', animationDelay: `${-i * 1.7}s` }}
              >
                <CloudShape w={c.w} />
              </motion.button>
            </div>
          )
        })}

        {/* The foreground ledge we stand on: the stone pile and the llama friends waiting their turn. */}
        <div style={{ position: 'absolute', left: -ox / scale, width: size.W / scale, top: S.front, height: S.h - S.front + oy / scale + 300, zIndex: 8, transform: revealed ? `translateY(${S.h - S.front + 60}px)` : 'none', transition: 'transform 1.4s cubic-bezier(.5,0,.6,1)', pointerEvents: 'none' }}>
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <path d="M-20 40Q120 0 260 22T520 18T780 26T1020 30V320H-20Z" fill="#7FCC6A" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
            <path d="M-20 70Q200 50 420 66T1020 64V320H-20Z" fill="#6DBB5C" />
          </svg>
        </div>
        {FRIENDS.map((f, i) => {
          if (friendAt[i] !== null) return null
          const hop = hopping === i
          const front = frontSpot(i)
          const target = W ? llamaSpot(tikaLedge - 1, friendW(i), i === 2 ? 10 : 0) : front
          const at = hop ? { x: target.x, y: target.y - cam.y } : front
          return (
            <div key={f.id} style={{ position: 'absolute', inset: 0, zIndex: hop ? 12 : 9, transform: revealed ? `translateY(${S.h - S.front + 60}px)` : 'none', transition: 'transform 1.4s cubic-bezier(.5,0,.6,1)', pointerEvents: 'none' }}>
              <FriendLlama i={i} at={at} h={S.llamaH * f.k} facesRight={f.facesRight} side={side} refs={friendRefs} onTap={() => tapFriend(i)} z={1} />
              {i === 1 && spitBall > 0 && (
                <motion.div key={spitBall} initial={{ x: front.x - side * 30, y: front.y - S.llamaH * 0.8, opacity: 1 }} animate={{ x: frontSpot(0).x, y: [front.y - S.llamaH * 0.8, front.y - S.llamaH * 1.05, frontSpot(0).y - S.llamaH * 0.75], opacity: [1, 1, 0] }} transition={{ duration: 0.5 }} style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: '#7FCC6A', border: `3px solid ${INK}` }} />
              )}
            </div>
          )
        })}

        {/* The stones she can pick up. */}
        {gapsOf(k).map((st) => {
          if (placed.has(keyOf(k, st.id))) return null
          const h = pile.get(st.id)
          if (!h) return null
          return (
            <div
              key={`${k}-${st.id}`}
              data-stone={st.id}
              aria-label="stone"
              ref={(el) => void stoneEls.current.set(st.id, el)}
              className={glow === st.id ? 'terr-stone-glow' : undefined}
              style={{ position: 'absolute', left: 0, top: 0, width: st.w + PAD * 2, height: st.h + PAD * 2, transform: `translate(${h.x - st.w / 2 - PAD}px, ${h.y - st.h / 2 - PAD}px) scale(${h.sc})`, zIndex: 20, touchAction: 'none', cursor: 'grab', opacity: revealed ? 0 : 1 }}
            >
              <svg width={st.w} height={st.h} style={{ position: 'absolute', left: PAD, top: PAD, overflow: 'visible', pointerEvents: 'none' }}>
                <Stone st={st} local />
              </svg>
            </div>
          )
        })}

        {/* Sparkle, the guide, in the corner of the foreground. */}
        <motion.button
          aria-label="Sparkle"
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            void sparkle.current?.play('nod')
            sounds.pop()
            say1([T.puzzle, T.potatoes, T.carry, L.facts.machuPicchu][g.current.facts++ % 4])
          }}
          style={{ position: 'absolute', left: mx(S.sparkle.cx) - S.sparkle.h * 0.45, top: S.sparkle.bottom - S.sparkle.h, width: S.sparkle.h * 0.9, height: S.sparkle.h, padding: 0, background: 'none', border: 'none', zIndex: 15, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        >
          <SparklePuppet ref={sparkle} height={`${S.sparkle.h}px`} lookToward={side > 0 ? 0.7 : 0.3} />
        </motion.button>

        {/* Seed bags over the new terrace. */}
        <AnimatePresence>
          {phase === 'seeds' &&
            CROPS.map((c, i) => {
              const size = S.tall ? 150 : 165
              const y = W.wallTop(k) - S.ledgeH / 2 - cam.y
              return (
                <motion.button
                  key={c.id}
                  aria-label={`${c.id} seeds`}
                  initial={{ scale: 0, y: 40 }}
                  animate={{ scale: 1, y: [0, -8, 0] }}
                  exit={{ scale: 0 }}
                  transition={{ scale: { delay: i * 0.12, type: 'spring' }, y: { repeat: Infinity, duration: 1.4, delay: i * 0.2 } }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => void plant(c.id)}
                  className="world-glow"
                  style={{ position: 'absolute', left: W.cx + (i - 1) * (size + 40) - size / 2, top: y - size / 2 - (S.tall ? 30 : 20), width: size, height: size, borderRadius: 30, padding: 10, background: '#FFF7F0', border: `5px solid ${INK}`, boxShadow: '0 8px 0 rgba(43,35,48,.18)', zIndex: 22 }}
                >
                  <SeedBag img={c.img} color={c.color} />
                </motion.button>
              )
            })}
        </AnimatePresence>

        {dusts.map((d) => (
          <Dust key={d.id} x={d.x} y={d.y} w={d.w} />
        ))}

        {/* Photo time: a camera frame over the view. */}
        {phase === 'photo' && (
          <div aria-hidden style={{ position: 'absolute', left: S.w * 0.06, right: S.w * 0.06, top: S.h * 0.14, bottom: S.h * 0.06, zIndex: 18, pointerEvents: 'none' }}>
            {[
              { left: 0, top: 0, borderLeft: 10, borderTop: 10 },
              { right: 0, top: 0, borderRight: 10, borderTop: 10 },
              { left: 0, bottom: 0, borderLeft: 10, borderBottom: 10 },
              { right: 0, bottom: 0, borderRight: 10, borderBottom: 10 },
            ].map(({ borderLeft, borderTop, borderRight, borderBottom, ...pos }, i) => (
              <div key={i} style={{ position: 'absolute', ...pos, width: 90, height: 90, borderStyle: 'solid', borderColor: '#FFF7F0', borderWidth: `${borderTop ?? 0}px ${borderRight ?? 0}px ${borderBottom ?? 0}px ${borderLeft ?? 0}px`, borderRadius: 18, filter: 'drop-shadow(0 0 3px rgba(43,35,48,.6))' }} />
            ))}
          </div>
        )}
      </div>

      {/* Under the top bar: what to do now (spoken when it appears). */}
      {prompt && phase !== 'story' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 'var(--top-clear)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 'calc(100% - 24px)' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}

      {/* The camera, and the pictures she has taken. */}
      {phase === 'photo' && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(var(--safe-bottom) + 18px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 22, zIndex: 27 }}>
          <BigButton onClick={() => void snap()} ariaLabel="Take a picture" size="lg">
            📷
          </BigButton>
          {photos.length > 0 && (
            <BigButton onClick={() => void finish()} ariaLabel="Done" color="mint">
              📔 ✓
            </BigButton>
          )}
        </div>
      )}
      {photos.length > 0 && phase === 'photo' && (
        <div aria-hidden style={{ position: 'absolute', right: 'max(16px, var(--safe-right, 0px))', bottom: 'calc(var(--safe-bottom) + 16px)', width: 'min(130px, 18vw)', height: 'min(150px, 21vw)', zIndex: 26 }}>
          {photos.map((p, i) => (
            <motion.div key={i} initial={{ scale: 1.6, opacity: 0, rotate: 0 }} animate={{ scale: 1, opacity: 1, rotate: ((i * 37) % 17) - 8 }} style={{ position: 'absolute', inset: 0, background: '#FFF7F0', border: `4px solid ${INK}`, borderRadius: 10, padding: '8% 8% 24%', boxShadow: '0 6px 0 rgba(43,35,48,.2)' }}>
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(#A8DCFF 0 55%, #8FD86F 55%)', borderRadius: 4, overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                <Tika height="92%" pose={p} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 28 }} />}</AnimatePresence>

      {phase === 'story' && <StoryBeat lines={T.story} bg={art.bgMp} friend={<Tika height="100%" />} onDone={startPlay} />}
    </div>
  )
}

/**
 * Something that hops from where it was to where it is now: an arc with the landing on (x, y), its feet. Positioned by
 * its feet; the child is centred above that point.
 */
function Hopper({ x, y, z, snapKey, children }: { x: number; y: number; z: number; snapKey: string; children: ReactNode }) {
  const last = useRef({ x, y, key: snapKey })
  const anim = useRef<{ x: number | number[]; y: number | number[] }>({ x, y })
  const tr = useRef<{ duration: number; delay?: number }>({ duration: 0 })
  if (last.current.key !== snapKey) {
    anim.current = { x, y }
    tr.current = { duration: 0 }
    last.current = { x, y, key: snapKey }
  } else if (last.current.x !== x || last.current.y !== y) {
    const from = last.current
    anim.current = { x: [from.x, x], y: [from.y, Math.min(from.y, y) - 150, y] }
    tr.current = { duration: 0.7, delay: 0.2 }
    last.current = { x, y, key: snapKey }
  }
  return (
    <motion.div initial={false} animate={anim.current} transition={tr.current} style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, zIndex: z }}>
      <div style={{ position: 'absolute', left: 0, bottom: 0, transform: 'translateX(-50%)' }}>{children}</div>
    </motion.div>
  )
}

function FriendLlama({ i, at, h, facesRight, side, refs, onTap, z }: { i: number; at: { x: number; y: number }; h: number; facesRight: boolean; side: number; refs: { current: (PuppetHandle | null)[] }; onTap: () => void; z: number }) {
  // Face inward, toward the stones.
  const flip = side > 0 ? facesRight : !facesRight
  return (
    <Hopper x={at.x} y={at.y} z={z} snapKey="f">
      <button aria-label="llama" onClick={onTap} style={{ padding: 0, background: 'none', border: 'none', display: 'block', pointerEvents: 'auto' }}>
        <Buddy ref={(r) => void (refs.current[i] = r)} img={FRIENDS[i].img} height={`${h}px`} flip={flip} />
      </button>
    </Hopper>
  )
}
