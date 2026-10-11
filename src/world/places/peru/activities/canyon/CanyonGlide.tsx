// 🦅 Coco's Canyon Glide (Colca Canyon: Andean condors soar on warm air). Plan: planning/around-the-world/peru.md § 3.
// The toy (one core verb): steer Coco through the canyon. He follows her finger with big slow turns, wings wide, and
// hardly flaps: in plain air he slowly glides down; in warm air (swirls of shimmer rising off sunny rocks) he circles
// up fast. Pull him up without warm air and he gives a few heavy flaps that barely help. The verb deepens three times:
//   1. Morning lift: the sun warms the rocks and swirls appear one by one. Just fly, ride them up, swoop to the river.
//   2. Follow the leader: Pluma jumps off the nest and flaps after Coco. Lead her to three shiny places (the waterfall,
//      the condor ledge, the lookout with its tourists) in any order; the high ones need a swirl. Fly too fast and Pluma
//      calls "Wait for me!" and Coco slows down. Pluma gets steadier at every place.
//   3. Up and over: the sun moves to the other wall, so the morning swirls fade and new ones rise there. The high ridge
//      needs two swirls linked. At the top Pluma flies by herself: Kaylee steers Pluma into the big swirl where every
//      condor circles together. Payoff: Coco and Pluma wingtip to wingtip for Luna's journal.
// Everything per-frame (both birds, the camera, parallax, particles, clouds) is written straight to the DOM from one
// game loop; React only sees phase changes.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { burst, say, sounds, SparklePuppet, useAlive, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art } from './art'
import { L } from './lines'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/Alpaca'
import { Chick, CHICK_VIEW, Condor, CONDOR_VIEW } from '../../puppets/Condor'
import { CEILING, COCO_START, FEEL, floorAt, LEDGE_TOP, liftOf, LOOKOUT, maxX, minX, NEST, PLACES, RIVER_Y, STAGE, SWIRLS, WORLD, type PlaceId, type Swirl } from './canyon'
import { ASPECT, Cloud, Critter, Ledges, Lookout, PlaceRing, River, SwirlArt, Wall, Waterfall, type Sun } from './Scenery'
import { csfx, windLoop } from './sfx'

const C = L.canyon
/** Stars: first ride, three places, the ridge, Pluma's own glide. */
const TOTAL = 6
/** Bird sizes in world units. */
const COCO_W = 400
const COCO_H = (COCO_W * CONDOR_VIEW.h) / CONDOR_VIEW.w
const PLUMA_W = 190
const FRIEND_W = 300
const PARTICLES = 30
const CLOUDS = [
  { x: 1500, y: 420, w: 420, speed: 14 },
  { x: 2400, y: 700, w: 340, speed: -10 },
  { x: 500, y: 270, w: 380, speed: 9 },
]
const PERCHED = [2300, 2375, 2450]
/** How far the camera may look above the world's top (world units of plain sky). */
const SKY_ABOVE = 220
/** A prompt is spoken when it appears, then its bubble steps aside so it doesn't cover the sky she flies in. */
const PROMPT_MS = 5500

type Phase = 'story' | 'start' | 'morning' | 'join' | 'follow' | 'ridge' | 'alone' | 'solo' | 'finale' | 'done'
type SwirlId = Swirl['id']

interface Flyer {
  x: number
  y: number
  vx: number
  vy: number
  face: number
  faceVis: number
  pitch: number
  lift: number
}

declare global {
  interface Window {
    __canyonQA?: { jump: (to: 'follow' | 'ridge' | 'solo' | 'finale') => void; where: () => { coco: { x: number; y: number }; pluma: { x: number; y: number }; cam: { x: number; y: number }; s: number; phase: string } }
  }
}

const VISIBLE: Record<string, SwirlId[]> = {
  start: [],
  morning: ['low'],
  more: ['low', 'nest'],
  follow: ['nest', 'falls', 'river'],
  afternoon: ['falls', 'ledge', 'river'],
  solo: ['big'],
}
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

export function CanyonGlide({ onDone, setProgress }: ActivityProps) {
  const alive = useAlive()
  const root = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ W: 0, H: 0 })
  const [phase, setPhaseState] = useState<Phase>('story')
  const [prompt, setPrompt] = useState<Line | null>(null)
  const [stars, setStars] = useState(0)
  const [swirlSet, setSwirlSet] = useState<keyof typeof VISIBLE>('start')
  const [sun, setSun] = useState<Sun>({ left: 0.2, right: 0.1 })
  const [done, setDone] = useState<Record<PlaceId, boolean>>({ falls: false, condors: false, lookout: false, ridge: false })
  const [rings, setRings] = useState(false)
  const [rainbow, setRainbow] = useState(false)
  const [plumaOut, setPlumaOut] = useState(false)
  const [friendsUp, setFriendsUp] = useState(false)
  const [flash, setFlash] = useState(0)
  const [touristFlash, setTouristFlash] = useState(0)
  const [glow, setGlow] = useState(false)

  const coco = useRef<PuppetHandle>(null)
  const pluma = useRef<PuppetHandle>(null)
  const sparkle = useRef<PuppetHandle>(null)
  const tourists = useRef<PuppetHandle>(null)
  const viscacha = useRef<PuppetHandle>(null)
  const cactus = useRef<PuppetHandle>(null)
  const swallow = useRef<PuppetHandle>(null)
  const perched = [useRef<PuppetHandle>(null), useRef<PuppetHandle>(null), useRef<PuppetHandle>(null)]
  const worldEl = useRef<HTMLDivElement>(null)
  const farEl = useRef<HTMLImageElement>(null)
  const cocoEl = useRef<HTMLDivElement>(null)
  const plumaEl = useRef<HTMLDivElement>(null)
  const arrowEl = useRef<HTMLDivElement>(null)
  const friendEls = useRef<(HTMLDivElement | null)[]>([])
  const cloudEls = useRef<(HTMLDivElement | null)[]>([])
  const partEls = useRef<(HTMLDivElement | null)[]>([])
  const cocoDrive = useRef<{ lift?: number; tuck?: number; trying?: boolean; damp?: boolean }>({})
  const plumaDrive = useRef<{ flying?: boolean; confidence?: number; scared?: boolean }>({ scared: true })

  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  useEffect(() => {
    if (!prompt) return
    const t = setTimeout(() => setPrompt(null), PROMPT_MS)
    return () => clearTimeout(t)
  }, [prompt])
  const star = (n: number) => setStars((s) => Math.max(s, n))

  // ---- Everything the loop and the pointer handlers share (React never sees it per frame). ----
  const g = useRef({
    phase: 'story' as Phase,
    coco: { x: COCO_START.x, y: COCO_START.y, vx: 120, vy: 0, face: 1, faceVis: 1, pitch: 0, lift: 0 } as Flyer,
    pluma: { x: NEST.x, y: NEST.y - 90, vx: 0, vy: 0, face: 1, faceVis: 1, pitch: 0, lift: 0 } as Flyer,
    steer: 'coco' as 'coco' | 'pluma' | 'none',
    finger: null as null | { id: number; sx: number; sy: number },
    cam: { x: COCO_START.x - 800, y: COCO_START.y - 520 },
    on: Object.fromEntries(SWIRLS.map((s) => [s.id, 0])) as Record<SwirlId, number>,
    visible: [] as SwirlId[],
    trail: [] as { t: number; x: number; y: number; face: number }[],
    plumaOut: false,
    confidence: 0,
    t: 0,
    rides: 0,
    inSwirl: null as SwirlId | null,
    counted: false,
    firstGrab: 0,
    saidLift: false,
    trying: 0,
    tryingNow: 0,
    tryGlow: false,
    saidWarm: false,
    diving: 0,
    lastWhoosh: -99,
    whooshes: 0,
    flips: [] as number[],
    lastDizzy: -99,
    lastWait: -99,
    waiting: false,
    inCloud: -1,
    lastSneeze: -99,
    dampUntil: 0,
    lastSplash: -99,
    lastTourist: -99,
    lastWhee: -99,
    places: { falls: false, condors: false, lookout: false, ridge: false } as Record<PlaceId, boolean>,
    soloTime: 0,
    friendsAt: 0,
    lastTouch: performance.now(),
    lastHint: 0,
    facts: 0,
    nestTaps: 0,
    busy: false,
    particles: Array.from({ length: PARTICLES }, (_, i) => ({ swirl: -1, p: (i * 0.37) % 1, phase: i * 1.7, kind: i % 3 })),
    clouds: CLOUDS.map((c) => ({ ...c })),
    s: 1,
    viewW: 1600,
    viewH: 1000,
  })
  const setPhase = (p: Phase) => {
    g.current.phase = p
    setPhaseState(p)
  }
  const showSwirls = (set: keyof typeof VISIBLE) => {
    g.current.visible = VISIBLE[set]
    setSwirlSet(set)
  }

  // ---- Layout: the visible window is about 1600 x 1000 (wide) or 1000 x 1400 (tall) world units. ----
  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setSize({ W: el.clientWidth, H: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const tall = size.H > size.W
  const stage = tall ? STAGE.tall : STAGE.wide
  const s = size.W ? Math.min(size.W / stage.w, size.H / stage.h) : 1
  g.current.s = s
  g.current.viewW = size.W / s
  g.current.viewH = size.H / s
  // The far layer (sky, volcanoes, the far canyon wall) moves at a quarter of the camera's speed.
  const farNeedW = (g.current.viewW + 0.25 * (WORLD.w - g.current.viewW)) * s
  const farNeedH = (g.current.viewH + 0.25 * (WORLD.h - g.current.viewH)) * s
  const farScale = Math.max(farNeedW / 1536, farNeedH / 1024)
  const far = { w: 1536 * farScale, h: 1024 * farScale, left: -(1536 * farScale - farNeedW) / 2, top: -(1024 * farScale - farNeedH) }

  const say1 = (line: Line) => void say(line)
  const nudge = (who: { current: PuppetHandle | null }, action: string) => void who.current?.play(action)

  // ---- Story, then play ----
  const startPlay = () => {
    setPhase('start')
    setPrompt(C.grab)
    g.current.lastTouch = performance.now()
  }

  /** Her first grab: the sun climbs over the rim and the first swirl starts rising. */
  const firstGrab = async () => {
    const G = g.current
    G.firstGrab = G.t
    setPhase('morning')
    setSun({ left: 1, right: 0.25 })
    await wait(1300)
    if (!alive()) return
    showSwirls('morning')
    csfx.lift()
    setPrompt(C.warm)
  }

  /** Each ride to the top of a swirl. Two rides (or one and some flying) and Pluma is ready to try. */
  const rode = () => {
    const G = g.current
    G.rides++
    star(1)
    if (G.rides === 1) {
      setTimeout(() => alive() && G.phase === 'morning' && showSwirls('more'), 1200)
    }
    if (G.phase === 'morning' && G.rides >= 2) void join()
  }

  /** Pluma jumps off the nest and flaps after her dad. */
  const join = async () => {
    const G = g.current
    if (G.phase !== 'morning' || G.busy) return
    G.busy = true
    setPhase('join')
    setPrompt(null)
    await wait(600)
    if (!alive()) return
    nudge(coco, 'nod')
    await say(C.callPluma)
    if (!alive()) return
    nudge(pluma, 'peek')
    await wait(900)
    if (!alive()) return
    nudge(pluma, 'hop')
    await wait(300)
    G.plumaOut = true
    setPlumaOut(true)
    G.pluma.vy = -260
    G.pluma.vx = 160
    csfx.flutter()
    plumaDrive.current.scared = false
    plumaDrive.current.flying = true
    await say(C.pTry)
    if (!alive()) return
    showSwirls('follow')
    setRings(true)
    setPhase('follow')
    setPrompt(C.lead)
    G.busy = false
    G.lastTouch = performance.now()
  }

  /** Coco (with Pluma close behind) reaches one of the shiny places. */
  const reach = async (id: PlaceId) => {
    const G = g.current
    if (G.places[id]) return
    G.places[id] = true
    setDone({ ...G.places })
    sounds.sparkle()
    G.confidence = Math.min(0.75, G.confidence + 0.25)
    plumaDrive.current.confidence = G.confidence
    const n = (['falls', 'condors', 'lookout'] as PlaceId[]).filter((p) => G.places[p]).length
    star(1 + n)
    if (id === 'falls') {
      setRainbow(true)
      csfx.rush()
      nudge(pluma, 'cheer')
      say1(C.falls)
    } else if (id === 'condors') {
      perched.forEach((r, i) => setTimeout(() => nudge(r, 'nod'), i * 220))
      nudge(coco, 'bow')
      say1(C.condors)
    } else if (id === 'lookout') {
      touristCheer()
      nudge(pluma, 'cheer')
      void (async () => {
        await say(C.lookout)
        if (!alive()) return
        nudge(coco, 'cheer')
        await say(C.smile, { interrupt: false })
      })()
    }
    if (n === 3) {
      await wait(2600)
      if (alive()) void toRidge()
    }
  }

  /** The sun moves over to the right wall: the morning's swirls fade and new ones rise there. */
  const toRidge = async () => {
    const G = g.current
    setPhase('ridge')
    setRings(false)
    setSun({ left: 0.15, right: 1 })
    showSwirls('afternoon')
    setPrompt(null)
    await say(C.sunMoved)
    if (!alive()) return
    setPrompt(C.top)
    G.lastTouch = performance.now()
  }

  /** At the very top: Pluma lets go and flies by herself. Now she steers Pluma. */
  const atRidge = async () => {
    const G = g.current
    if (G.phase !== 'ridge') return
    G.places.ridge = true
    setDone({ ...G.places })
    setPhase('alone')
    G.finger = null
    G.steer = 'none'
    star(5)
    setPrompt(null)
    sounds.sparkle()
    G.confidence = 1
    plumaDrive.current.confidence = 1
    nudge(pluma, 'cheer')
    await say(C.alone)
    if (!alive()) return
    nudge(coco, 'cheer')
    showSwirls('solo')
    setFriendsUp(true)
    G.friendsAt = G.t
    G.steer = 'pluma'
    setPhase('solo')
    setPrompt(C.solo)
    await wait(2600)
    if (alive() && (G.phase as Phase) === 'solo') setPrompt(C.bigSwirl)
    G.lastTouch = performance.now()
  }

  /** Pluma rides the big swirl: every condor circles together, then the picture for Luna's journal. */
  const finale = async () => {
    const G = g.current
    if (G.phase !== 'solo') return
    setPhase('finale')
    G.finger = null
    G.steer = 'none'
    setPrompt(null)
    star(6)
    sounds.fanfare()
    burst(0.5, 0.4)
    nudge(pluma, 'cheer')
    await say(C.lookMe)
    if (!alive()) return
    nudge(coco, 'cheer')
    await say(C.proud, { interrupt: false })
    if (!alive()) return
    await wait(400)
    csfx.click()
    setFlash((f) => f + 1)
    void sparkle.current?.play('cheer')
    await say(C.photo)
    await wait(900)
    if (!alive()) return
    setPhase('done')
    onDone()
  }

  const touristCheer = () => {
    nudge(tourists, 'cheer')
    csfx.click()
    csfx.cheer()
    setTouristFlash((f) => f + 1)
  }

  // ---- Pointer: anywhere in the sky, her finger is where the bird flies. ----
  const steerable = (p: Phase) => p === 'start' || p === 'morning' || p === 'follow' || p === 'ridge' || p === 'solo' || p === 'join'
  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    G.lastTouch = performance.now()
    if ((e.target as Element).closest('button')) return
    if (!steerable(G.phase) || G.finger) return
    const r = root.current!.getBoundingClientRect()
    G.finger = { id: e.pointerId, sx: e.clientX - r.left, sy: e.clientY - r.top }
    e.currentTarget.setPointerCapture(e.pointerId)
    setGlow(false)
    if (G.phase === 'start') {
      nudge(coco, 'flap')
      csfx.flap()
      void firstGrab()
    }
    if ((e.target as Element).closest('[data-river]')) csfx.glint()
  }
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    if (!G.finger || e.pointerId !== G.finger.id) return
    const r = root.current!.getBoundingClientRect()
    G.finger.sx = e.clientX - r.left
    G.finger.sy = e.clientY - r.top
    G.lastTouch = performance.now()
  }
  const onUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const G = g.current
    if (G.finger && e.pointerId === G.finger.id) G.finger = null
  }

  // ---- The wind under the wings. ----
  const wind = useRef<ReturnType<typeof windLoop> | null>(null)
  useEffect(() => () => wind.current?.stop(), [])

  /** Strongest lift at a point, and which swirl it comes from. */
  const liftAt = (x: number, y: number) => {
    const G = g.current
    let best = 0
    let id: SwirlId | null = null
    for (const sw of SWIRLS) {
      const l = liftOf(sw, G.on[sw.id], x, y)
      if (l > best) {
        best = l
        id = sw.id
      }
    }
    return { lift: best, id }
  }

  /** One flying bird, steered toward (tx, ty) or gliding on its own. */
  const fly = (b: Flyer, dt: number, target: { x: number; y: number } | null, k: { speed: number; sink: number; sinkTrying: number; rise: number }) => {
    const { lift } = liftAt(b.x, b.y)
    b.lift = lift
    let vxT: number
    let vyT: number
    let trying = false
    if (target) {
      vxT = clamp((target.x - b.x) * 1.8, -k.speed, k.speed)
      const dy = target.y - b.y
      if (dy > 90) vyT = Math.min(dy * 1.6, FEEL.dive) - lift * k.rise * 0.6
      else {
        trying = dy < -90 && lift < 0.15
        vyT = (trying ? k.sinkTrying : k.sink) * (1 - lift) - k.rise * lift
      }
    } else {
      // On its own: glide along, turn before the walls, circle inside warm air.
      if (lift > 0.2) {
        const sw = SWIRLS.find((q) => liftOf(q, g.current.on[q.id], b.x, b.y) === lift)
        vxT = sw ? Math.cos(g.current.t * 1.3) * sw.w * 0.9 : b.face * 170
      } else {
        if (b.x > maxX(b.y) - 220) b.face = -1
        if (b.x < minX(b.y) + 220) b.face = 1
        vxT = b.face * 180
      }
      vyT = k.sink * (1 - lift) - k.rise * lift
    }
    b.vx += (vxT - b.vx) * Math.min(1, dt * FEEL.turnX)
    b.vy += (vyT - b.vy) * Math.min(1, dt * FEEL.turnY)
    b.x += b.vx * dt
    b.y += b.vy * dt
    // The canyon: walls, plateaus, the river, the sky's top.
    const lo = minX(b.y)
    const hi = maxX(b.y)
    if (b.x < lo) {
      b.x += (lo - b.x) * Math.min(1, dt * 10)
      b.vx = Math.max(b.vx, 0)
    }
    if (b.x > hi) {
      b.x += (hi - b.x) * Math.min(1, dt * 10)
      b.vx = Math.min(b.vx, 0)
    }
    const floor = floorAt(b.x)
    if (b.y > floor) {
      b.y = floor
      b.vy = Math.min(b.vy, 0)
    }
    if (b.y < CEILING) {
      b.y = CEILING
      b.vy = Math.max(b.vy, 0)
    }
    if (b.vx > 45) b.face = 1
    else if (b.vx < -45) b.face = -1
    b.faceVis += (b.face - b.faceVis) * Math.min(1, dt * 7)
    // Nose down in a dive, up as he climbs; a lazy bank while circling in warm air.
    const pitchT = clamp(b.vy * 0.045, -18, 38) * b.face + Math.sin(g.current.t * 2.4) * 6 * lift
    b.pitch += (pitchT - b.pitch) * Math.min(1, dt * 5)
    return trying
  }

  const place = (el: HTMLElement | null, b: Flyer, w: number, view: { w: number; h: number; cx: number; cy: number }, sitting = false) => {
    if (!el) return
    const h = (w * view.h) / view.w
    // Turning round: a quick flip with a little squash, never a paper-thin sliver.
    const fv = (b.faceVis >= 0 ? 1 : -1) * (0.6 + 0.4 * Math.abs(b.faceVis))
    el.style.transform = `translate(${(b.x - (w * view.cx) / view.w).toFixed(1)}px, ${(b.y - (h * view.cy) / view.h).toFixed(1)}px) rotate(${(sitting ? 0 : b.pitch).toFixed(2)}deg) scaleX(${fv.toFixed(3)})`
  }

  // The loop runs on real time in small steps, so the glide feels the same on a slow iPad (or a slow test browser).
  const lastFrame = useRef(0)
  useGameLoop(() => {
    const now = performance.now()
    const real = lastFrame.current ? Math.min(0.15, (now - lastFrame.current) / 1000) : 0
    lastFrame.current = now
    if (real <= 0) return
    const n = Math.ceil(real / 0.034)
    for (let i = 0; i < n; i++) step(real / n, i === n - 1)
  })

  function step(dt: number, last: boolean) {
    const G = g.current
    G.t += dt
    const t = G.t
    // Swirls fade in and out with the sun.
    for (const sw of SWIRLS) {
      const want = G.visible.includes(sw.id) ? 1 : 0
      G.on[sw.id] += (want - G.on[sw.id]) * Math.min(1, dt * 0.7)
    }
    const fingerWorld = G.finger ? { x: G.cam.x + G.finger.sx / G.s, y: G.cam.y + G.finger.sy / G.s } : null
    const c = G.coco
    const pl = G.pluma
    const playing = G.phase !== 'story' && G.phase !== 'done'

    // ---- Coco ----
    let trying = false
    if (G.phase === 'story' || G.phase === 'start') {
      // Waiting for her: lazy circles in front of the nest, holding his height.
      c.vx += (Math.cos(t * 0.6) * 160 - c.vx) * Math.min(1, dt * 2)
      c.x += c.vx * dt
      c.y += (COCO_START.y + Math.sin(t * 1.2) * 30 - c.y) * Math.min(1, dt * 2)
      c.face = c.vx >= 0 ? 1 : -1
      c.faceVis += (c.face - c.faceVis) * Math.min(1, dt * 7)
      c.pitch += (Math.sin(t * 1.2) * 4 - c.pitch) * Math.min(1, dt * 3)
    } else if (G.phase === 'finale' || G.phase === 'alone' || G.steer === 'pluma') {
      // Pluma's turn: Coco flies beside her (or circles with the others at the end).
      const big = SWIRLS.find((q) => q.id === 'big')!
      const tgt = G.phase === 'finale' ? { x: big.x + Math.sin(t * 0.9) * 300, y: big.top + 260 + Math.cos(t * 0.9) * 60 } : { x: pl.x - pl.face * 230, y: pl.y - 70 }
      fly(c, dt, tgt, { speed: 520, sink: 0, sinkTrying: 0, rise: 0 })
    } else {
      const speed = G.waiting ? FEEL.waitSpeed : FEEL.speed
      trying = fly(c, dt, G.finger && G.steer === 'coco' ? fingerWorld : null, { speed, sink: FEEL.sink, sinkTrying: FEEL.sinkTrying, rise: FEEL.rise })
    }
    G.trail.push({ t, x: c.x, y: c.y, face: c.face })
    while (G.trail.length && G.trail[0].t < t - 1.2) G.trail.shift()

    // ---- Pluma ----
    if (!G.plumaOut) {
      pl.x = NEST.x
      pl.y = NEST.y - 82
      pl.face = 1
      pl.faceVis = 1
    } else if (G.steer === 'pluma' && G.phase === 'solo') {
      fly(pl, dt, G.finger ? fingerWorld : null, { speed: 470, sink: 60, sinkTrying: 35, rise: 300 })
    } else if (G.phase === 'finale') {
      const big = SWIRLS.find((q) => q.id === 'big')!
      fly(pl, dt, { x: big.x + Math.sin(t * 0.9 + 1.2) * 260, y: big.top + 300 + Math.cos(t * 0.9 + 1.2) * 60 }, { speed: 420, sink: 0, sinkTrying: 0, rise: 0 })
    } else {
      // Following: where Dad was a moment ago, a little behind and below.
      const back = G.trail.find((q) => q.t >= t - 0.7) ?? G.trail[0]
      const tx = back.x - back.face * 170
      const ty = back.y + 70
      const k = 2.2 - G.confidence * 0.6
      pl.vx += (clamp((tx - pl.x) * k, -480, 480) - pl.vx) * Math.min(1, dt * 3)
      pl.vy += (clamp((ty - pl.y) * k, -420, 520) - pl.vy) * Math.min(1, dt * 3)
      pl.x += pl.vx * dt
      pl.y += pl.vy * dt
      pl.x = clamp(pl.x, minX(pl.y) - 30, maxX(pl.y) + 30)
      pl.y = clamp(pl.y, CEILING, floorAt(pl.x) + 30)
      if (pl.vx > 40) pl.face = 1
      else if (pl.vx < -40) pl.face = -1
      pl.faceVis += (pl.face - pl.faceVis) * Math.min(1, dt * 8)
      pl.pitch += (clamp(pl.vy * 0.03, -14, 22) * pl.face - pl.pitch) * Math.min(1, dt * 5)
    }
    const apart = Math.hypot(pl.x - c.x, pl.y - c.y)
    if (G.plumaOut && (G.phase === 'follow' || G.phase === 'ridge')) {
      // Too fast for her: she calls, and Coco slows down until she's close.
      if (!G.waiting && apart > 560) {
        G.waiting = true
        if (t - G.lastWait > 5) {
          G.lastWait = t
          say1(C.wait)
          nudge(pluma, 'flap')
        }
      } else if (G.waiting && apart < 300) G.waiting = false
    }

    // ---- Riding the warm air ----
    const rider = G.steer === 'pluma' ? pl : c
    const { lift, id } = liftAt(rider.x, rider.y)
    if (playing && lift > 0.3 && id) {
      if (G.inSwirl !== id) {
        G.inSwirl = id
        G.counted = false
        csfx.lift()
        if (!G.saidLift && rider === c && G.phase !== 'story') {
          G.saidLift = true
          void say(C.upWeGo, { interrupt: false })
        } else if (G.plumaOut && t - G.lastWhee > 12 && G.phase !== 'finale') {
          G.lastWhee = t
          say1(C.wheee)
        }
      }
      const sw = SWIRLS.find((q) => q.id === id)!
      if (!G.counted && rider.y < sw.top + 240) {
        G.counted = true
        if (rider === c && (G.phase === 'morning' || G.phase === 'follow')) rode()
      }
    } else if (lift < 0.1) G.inSwirl = null
    // Pluma's own glide counts as soon as she's inside the big swirl's column (floating at its top too).
    if (G.phase === 'solo') {
      const big = SWIRLS[5]
      if (Math.abs(pl.x - big.x) < big.w * 0.5 && pl.y > big.top - 80 && pl.y < big.bottom) {
        G.soloTime += dt
        if (G.soloTime > 1.6) void finale()
      }
    }

    // "I need warm air to go up!" once, when she pulls him up in plain air for a while.
    if (trying && G.phase !== 'start') {
      G.trying += dt
      G.tryingNow += dt
      if (G.trying > 2.6 && !G.saidWarm) {
        G.saidWarm = true
        say1(C.needWarm)
      }
      // Still pulling him up without warm air: the swirls glow and the arrow points to the nearest one.
      if (G.tryingNow > 3 && !G.tryGlow) {
        G.tryGlow = true
        setGlow(true)
      }
    } else if (!trying) {
      G.tryingNow = 0
      if (G.tryGlow && c.lift > 0.3) {
        G.tryGlow = false
        setGlow(false)
      }
    }

    // A big dive, then a pull-up: whoooosh!
    const active = G.steer === 'pluma' ? pl : c
    if (active.vy > 420) G.diving += dt
    else {
      if (G.diving > 0.45 && active.vy < 120 && t - G.lastWhoosh > 6) {
        G.lastWhoosh = t
        csfx.whoosh()
        if (active === c) {
          nudge(coco, 'swoop')
          if (G.whooshes++ < 2) say1(C.whoosh)
        }
      }
      if (active.vy < 200) G.diving = 0
    }

    // Turning round and round makes Pluma dizzy.
    if (G.trail.length > 1 && G.trail[G.trail.length - 2].face !== c.face) G.flips.push(t)
    G.flips = G.flips.filter((q) => t - q < 6)
    if (G.plumaOut && G.flips.length >= 5 && t - G.lastDizzy > 16 && (G.phase === 'follow' || G.phase === 'ridge')) {
      G.lastDizzy = t
      G.flips = []
      nudge(pluma, 'dizzy')
      say1(C.dizzy)
    }

    // Clouds drift; flying through one makes Coco sneeze.
    G.clouds.forEach((cl, i) => {
      cl.x += cl.speed * dt
      if (cl.x > WORLD.w + 400) cl.x = -400
      if (cl.x < -400) cl.x = WORLD.w + 400
      const el = cloudEls.current[i]
      const h = cl.w / ASPECT.cloud
      if (el) el.style.transform = `translate(${(cl.x - cl.w / 2).toFixed(1)}px, ${(cl.y - h / 2).toFixed(1)}px)`
      const inside = Math.abs(c.x - cl.x) < cl.w * 0.42 && Math.abs(c.y - cl.y) < h * 0.4
      if (inside) G.inCloud = i
      else if (G.inCloud === i) {
        G.inCloud = -1
        if (t - G.lastSneeze > 8 && playing) {
          G.lastSneeze = t
          G.dampUntil = t + 3
          nudge(coco, 'sneeze')
          say1(C.sneeze)
        }
      }
    })
    cocoDrive.current.damp = t < G.dampUntil

    // Skimming the river: splash!
    if (playing && c.y > RIVER_Y - 160 && Math.abs(c.vx) > 150 && t - G.lastSplash > 1.4) {
      G.lastSplash = t
      csfx.splash()
    }
    // Passing the lookout: the tourists cheer and take pictures.
    if (playing && Math.hypot(c.x - LOOKOUT.x, c.y - (LOOKOUT.y - 150)) < 420 && t - G.lastTourist > 5) {
      G.lastTourist = t
      touristCheer()
    }

    // ---- The places ----
    if (G.phase === 'follow') {
      for (const id of ['falls', 'condors', 'lookout'] as PlaceId[]) {
        const p = PLACES[id]
        if (!G.places[id] && Math.hypot(c.x - p.x, c.y - p.y) < p.r && apart < 520) void reach(id)
      }
    }
    if (G.phase === 'ridge' && Math.hypot(c.x - PLACES.ridge.x, c.y - PLACES.ridge.y) < PLACES.ridge.r) void atRidge()

    // ---- The other condors take off and circle in the big swirl. ----
    if (G.friendsAt) {
      const big = SWIRLS.find((q) => q.id === 'big')!
      const k = clamp((t - G.friendsAt) / 3.5, 0, 1)
      friendEls.current.forEach((el, i) => {
        if (!el) return
        const a = t * 0.8 + i * 2.1
        const cx = big.x + Math.sin(a) * 320
        const cy = big.top + 120 + i * 150 + Math.cos(a) * 50
        const sx = PERCHED[i]
        const sy = LEDGE_TOP.y - 90
        const x = sx + (cx - sx) * k
        const y = sy + (cy - sy) * k - Math.sin(k * Math.PI) * 200
        const face = k < 1 ? -1 : Math.cos(a) >= 0 ? 1 : -1
        const h = (FRIEND_W * CONDOR_VIEW.h) / CONDOR_VIEW.w
        el.style.transform = `translate(${(x - FRIEND_W / 2).toFixed(1)}px, ${(y - h * 0.6).toFixed(1)}px) rotate(${(Math.sin(a) * 8).toFixed(1)}deg) scaleX(${face})`
      })
    }

    // ---- Puppets' per-frame looks ----
    cocoDrive.current.lift = c.lift
    cocoDrive.current.tuck = clamp((c.vy - 260) / 320, 0, 1)
    cocoDrive.current.trying = trying
    place(cocoEl.current, c, COCO_W, CONDOR_VIEW)
    place(plumaEl.current, pl, PLUMA_W, CHICK_VIEW, !G.plumaOut)

    // ---- Camera: follows the bird she flies, a little ahead of it. ----
    // Before her first grab: Coco and Pluma on her nest, both in the picture.
    const focus =
      G.phase === 'finale'
        ? { x: SWIRLS[5].x, y: SWIRLS[5].top + 300, face: 0 }
        : G.phase === 'story' || G.phase === 'start'
          ? { x: (c.x + NEST.x) / 2, y: (c.y + NEST.y) / 2, face: 0 }
          : { x: active.x, y: active.y, face: active.faceVis }
    const camTx = clamp(focus.x - G.viewW / 2 + focus.face * G.viewW * 0.1, 0, Math.max(0, WORLD.w - G.viewW))
    // A little extra sky above the world, so things up high never sit under the top bar or the prompt.
    const camTy = clamp(focus.y - G.viewH * 0.58, -SKY_ABOVE, Math.max(0, WORLD.h - G.viewH))
    G.cam.x += (camTx - G.cam.x) * Math.min(1, dt * 2.6)
    G.cam.y += (camTy - G.cam.y) * Math.min(1, dt * 2.6)
    if (worldEl.current) worldEl.current.style.transform = `translate(${(-G.cam.x * G.s).toFixed(1)}px, ${(-G.cam.y * G.s).toFixed(1)}px) scale(${G.s})`
    if (farEl.current) farEl.current.style.transform = `translate(${(-G.cam.x * 0.25 * G.s).toFixed(1)}px, ${(-G.cam.y * 0.25 * G.s).toFixed(1)}px)`

    // Only the last step of a frame draws the particles, the arrow and the sound.
    if (!last) return

    // ---- Leaves, dust and a butterfly spiralling up each swirl ----
    const shown = SWIRLS.filter((q) => G.on[q.id] > 0.05)
    G.particles.forEach((pt, i) => {
      const el = partEls.current[i]
      if (!el) return
      const sw = shown[i % Math.max(1, shown.length)]
      if (!sw) {
        el.style.opacity = '0'
        return
      }
      pt.p += dt / (4.5 + (i % 4))
      if (pt.p > 1) pt.p -= 1
      const y = sw.bottom - (sw.bottom - sw.top) * pt.p
      const x = sw.x + Math.sin(pt.phase + pt.p * 9) * sw.w * 0.32
      el.style.opacity = (G.on[sw.id] * Math.sin(pt.p * Math.PI)).toFixed(2)
      const spin = pt.kind === 2 ? Math.sin(t * 14 + i) * 25 : (pt.p * 720 + pt.phase * 50) % 360
      el.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px) rotate(${spin.toFixed(0)}deg)`
    })

    // ---- Where to go next, when it's off screen: a little arrow at the edge. ----
    const goal = goalFor(G, rider)
    const arrow = arrowEl.current
    if (arrow) {
      const gx = (goal ? goal.x - G.cam.x : 0) * G.s
      const gy = (goal ? goal.y - G.cam.y : 0) * G.s
      const W = G.viewW * G.s
      const H = G.viewH * G.s
      const off = goal && (gx < 40 || gx > W - 40 || gy < 110 || gy > H - 40)
      if (off) {
        const ax = clamp(gx, 60, W - 60)
        const ay = clamp(gy, 150, H - 60)
        const ang = Math.atan2(gy - ay, gx - ax)
        arrow.style.opacity = '1'
        arrow.style.transform = `translate(${ax - 45}px, ${ay - 45}px) rotate(${ang}rad)`
      } else arrow.style.opacity = '0'
    }

    // ---- The wind follows his speed. ----
    if (playing) {
      if (!wind.current && G.phase !== 'start') wind.current = windLoop()
      wind.current?.set(clamp(Math.hypot(active.vx, active.vy) / 700, 0, 1))
    } else wind.current?.set(0)

    // ---- The quiet guide: only after ~8 s without a touch. ----
    const now = performance.now()
    if (playing && !G.busy && !G.finger && now - G.lastTouch > 8000 && now - G.lastHint > 12000 && steerable(G.phase)) {
      G.lastHint = now
      const line = G.phase === 'start' ? C.idle.grab : G.phase === 'morning' ? C.warm : G.phase === 'follow' ? C.idle.places : G.phase === 'ridge' ? C.top : C.bigSwirl
      say1(line)
      setGlow(true)
    }
  }

  /** What she's heading for now (for the edge arrow). */
  function goalFor(G: typeof g.current, rider: Flyer): { x: number; y: number } | null {
    // Low down in plain air (or in the morning): the nearest warm air.
    if (G.phase === 'morning' || ((rider.y > 2250 || G.tryingNow > 3) && rider.lift < 0.2 && G.phase !== 'solo')) {
      if (rider.lift > 0.2) return null
      let best: { x: number; y: number } | null = null
      let bd = Infinity
      for (const sw of SWIRLS) {
        if (G.on[sw.id] < 0.5) continue
        const p = { x: sw.x, y: clamp(rider.y, sw.top + 200, sw.bottom - 100) }
        const d = Math.hypot(p.x - rider.x, p.y - rider.y)
        if (d < bd) {
          bd = d
          best = p
        }
      }
      return best
    }
    if (G.phase === 'follow') {
      let best: { x: number; y: number } | null = null
      let bd = Infinity
      for (const id of ['falls', 'condors', 'lookout'] as PlaceId[]) {
        if (G.places[id]) continue
        const d = Math.hypot(PLACES[id].x - rider.x, PLACES[id].y - rider.y)
        if (d < bd) {
          bd = d
          best = PLACES[id]
        }
      }
      return best
    }
    if (G.phase === 'ridge') return PLACES.ridge
    if (G.phase === 'solo') {
      const big = SWIRLS[5]
      return { x: big.x, y: clamp(rider.y, big.top + 200, big.bottom - 100) }
    }
    return null
  }

  // ---- QA hook: jump to a later moment (motion and screen QA), and read where things are. ----
  useEffect(() => {
    window.__canyonQA = {
      jump: (to) => {
        const G = g.current
        G.busy = false
        G.rides = Math.max(G.rides, 2)
        G.plumaOut = true
        setPlumaOut(true)
        plumaDrive.current.flying = true
        plumaDrive.current.scared = false
        if (to === 'follow') {
          setSun({ left: 1, right: 0.25 })
          showSwirls('follow')
          setRings(true)
          setPhase('follow')
          setPrompt(C.lead)
        } else {
          G.places = { falls: true, condors: true, lookout: true, ridge: false }
          setDone({ ...G.places })
          G.confidence = 0.75
          plumaDrive.current.confidence = 0.75
          G.coco.x = 2150
          G.coco.y = 820
          G.pluma.x = 1980
          G.pluma.y = 900
          if (to === 'ridge') void toRidge()
          else {
            G.coco.x = PLACES.ridge.x - 100
            G.coco.y = PLACES.ridge.y + 20
            G.pluma.x = PLACES.ridge.x - 300
            G.pluma.y = PLACES.ridge.y + 60
            setPhase('ridge')
            setSun({ left: 0.15, right: 1 })
            showSwirls('afternoon')
            void atRidge().then(() => {
              if (to === 'finale') {
                G.pluma.x = SWIRLS[5].x
                G.pluma.y = SWIRLS[5].top + 400
                G.soloTime = 3
                void finale()
              }
            })
          }
        }
        G.lastTouch = performance.now()
      },
      where: () => {
        const G = g.current
        return { coco: { x: G.coco.x, y: G.coco.y }, pluma: { x: G.pluma.x, y: G.pluma.y }, cam: { ...G.cam }, s: G.s, phase: G.phase }
      },
    }
    return () => {
      delete window.__canyonQA
    }
  })

  const ready = size.W > 0
  return (
    <div
      ref={root}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#A8DCFF', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {ready && (
        <>
          {/* Far away: sky, volcanoes and the far canyon wall with its terraces (slow parallax). */}
          <img ref={farEl} src={art.bgCanyonFar} alt="" draggable={false} style={{ position: 'absolute', left: far.left, top: far.top, width: far.w, height: far.h, pointerEvents: 'none', willChange: 'transform' }} />
          {/* The sun: over the right rim in the morning (lighting the left wall), over the left one later. */}
          <div aria-hidden style={{ position: 'absolute', top: '16%', left: sun.right > sun.left ? '8%' : '78%', width: 'min(110px, 14vmin)', height: 'min(110px, 14vmin)', borderRadius: '50%', background: sun.left + sun.right > 0.5 ? '#FFE27A' : '#FFF1C9', border: `5px solid ${INK}`, boxShadow: '0 0 0 14px rgba(255,226,122,.35)', transition: 'left 4s ease-in-out, background 2s', pointerEvents: 'none' }} />

          {/* The canyon, in world units, moved by the camera. */}
          <div ref={worldEl} style={{ position: 'absolute', left: 0, top: 0, width: WORLD.w, height: WORLD.h, transformOrigin: '0 0', willChange: 'transform' }}>
            {CLOUDS.map((cl, i) => (
              <Cloud key={i} ref={(el) => void (cloudEls.current[i] = el)} w={cl.w} />
            ))}
            {SWIRLS.map((sw) => (
              <SwirlArt key={sw.id} s={sw} on={VISIBLE[swirlSet].includes(sw.id)} glow={(glow && phase !== 'start') || (phase === 'solo' && sw.id === 'big')} />
            ))}
            <River onTap={() => void 0} />
            <Wall side="left" sun={sun.left} />
            <Wall side="right" sun={sun.right} />
            <Waterfall rainbow={rainbow} />
            <Ledges />
            {Array.from({ length: PARTICLES }, (_, i) => (
              <div key={i} ref={(el) => void (partEls.current[i] = el)} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none', willChange: 'transform' }}>
                <Mote kind={i % 3} />
              </div>
            ))}

            {/* Pokeables. */}
            <Critter ref={viscacha} label="Viscacha" img={art.canyonViscacha} aspect={ASPECT.viscacha} x={1150} bottom={2622} h={150} onTap={() => (nudge(viscacha, 'jump'), csfx.squeak())} />
            <Critter ref={cactus} label="Cactus" img={art.canyonCactus} aspect={ASPECT.cactus} x={70} bottom={LOOKOUT.y + 4} h={250} onTap={() => (nudge(cactus, 'wiggle'), csfx.tweet())} />
            <Critter ref={swallow} label="Swallow nest" img={art.canyonSwallow} aspect={ASPECT.swallowNest} x={2280} bottom={1260} h={140} onTap={() => (nudge(swallow, 'jump'), csfx.tweet())} />
            <Lookout flash={touristFlash} buddy={tourists} onTap={touristCheer} />
            {!friendsUp &&
              PERCHED.map((x, i) => (
                <Critter key={i} ref={perched[i]} label="Condor friend" img={art.canyonPerched} aspect={ASPECT.perched} x={x} bottom={LEDGE_TOP.y + 4} h={150} onTap={() => (nudge(perched[i], 'nod'), csfx.flap())} />
              ))}
            {(['falls', 'condors', 'lookout'] as PlaceId[]).map((id) => rings && <PlaceRing key={id} id={id} done={done[id]} />)}
            {(phase === 'ridge' || phase === 'alone') && <PlaceRing id="ridge" done={done.ridge} />}

            {/* The flying friends at the end. */}
            {friendsUp &&
              [0, 1, 2].map((i) => (
                <div key={i} ref={(el) => void (friendEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: FRIEND_W, pointerEvents: 'none', willChange: 'transform', zIndex: 5 }}>
                  <Condor height={`${(FRIEND_W * CONDOR_VIEW.h) / CONDOR_VIEW.w}px`} friend label="Condor friend" drive={{ current: { lift: 0.6 } }} />
                </div>
              ))}

            {/* Pluma: on the nest, then flying after her dad. */}
            <div ref={plumaEl} style={{ position: 'absolute', left: 0, top: 0, width: PLUMA_W, zIndex: 6, willChange: 'transform', transformOrigin: `${(CHICK_VIEW.cx / CHICK_VIEW.w) * 100}% ${(CHICK_VIEW.cy / CHICK_VIEW.h) * 100}%` }}>
              {!plumaOut ? (
                <button
                  aria-label="Pluma"
                  onClick={() => {
                    const G = g.current
                    sounds.pop()
                    nudge(pluma, G.nestTaps % 2 ? 'giggle' : 'wobble')
                    say1(G.nestTaps++ === 0 ? C.scared : C.nestTap)
                  }}
                  style={{ padding: 0, background: 'none', border: 'none', width: PLUMA_W, height: PLUMA_W, display: 'block', pointerEvents: phase === 'start' || phase === 'story' ? 'none' : undefined }}
                >
                  <Chick ref={pluma} height={`${PLUMA_W}px`} drive={plumaDrive} />
                </button>
              ) : (
                <Chick ref={pluma} height={`${PLUMA_W}px`} drive={plumaDrive} />
              )}
            </div>
            {/* Coco. */}
            <div ref={cocoEl} className={glow && phase === 'start' ? 'canyon-glow' : undefined} style={{ position: 'absolute', left: 0, top: 0, width: COCO_W, height: COCO_H, zIndex: 7, willChange: 'transform', transformOrigin: `${(CONDOR_VIEW.cx / CONDOR_VIEW.w) * 100}% ${(CONDOR_VIEW.cy / CONDOR_VIEW.h) * 100}%`, pointerEvents: 'none' }}>
              <Condor ref={coco} height={`${COCO_H}px`} drive={cocoDrive} />
            </div>
          </div>

          {/* The edge arrow toward what's next. */}
          <div ref={arrowEl} aria-hidden style={{ position: 'absolute', left: 0, top: 0, width: 90, height: 90, opacity: 0, transition: 'opacity .4s', pointerEvents: 'none', zIndex: 20 }}>
            <svg viewBox="-45 -45 90 90" style={{ width: '100%', height: '100%' }}>
              <circle r="32" fill="#FFF7F0" stroke={INK} strokeWidth="5" />
              <path d="M-14 -14L16 0L-14 14Z" fill="#FFC83D" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            </svg>
          </div>
        </>
      )}

      {/* Sparkle, the guide, in the corner: tap her for condor facts. */}
      <motion.button
        aria-label="Sparkle"
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          void sparkle.current?.play('nod')
          sounds.pop()
          say1(C.facts[g.current.facts++ % C.facts.length])
        }}
        style={{ position: 'absolute', left: 'calc(var(--safe-left, 0px) + 8px)', bottom: 'calc(var(--safe-bottom) + 6px)', width: 'min(150px, 19vmin)', height: 'min(170px, 22vmin)', padding: 0, background: 'none', border: 'none', zIndex: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      >
        <SparklePuppet ref={sparkle} height="100%" lookToward={0.6} />
      </motion.button>

      {/* Under the top bar: what to do now (spoken when it appears). */}
      {prompt && phase !== 'story' && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 'var(--top-clear)', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 25 }}>
          <div style={{ pointerEvents: 'auto', maxWidth: 'calc(100% - 24px)' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}

      <AnimatePresence>{flash > 0 && <motion.div key={flash} initial={{ opacity: 0.95 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }} style={{ position: 'absolute', inset: 0, background: '#fff', pointerEvents: 'none', zIndex: 26 }} />}</AnimatePresence>

      {phase === 'story' && <StoryBeat lines={C.story} bg={art.bgCanyonFar} friend={<Condor height="100%" />} onDone={startPlay} />}
    </div>
  )
}

/** A leaf, a speck of dust or a little butterfly riding the warm air up. */
function Mote({ kind }: { kind: number }) {
  if (kind === 0)
    return (
      <svg viewBox="-20 -20 40 40" style={{ position: 'absolute', left: -20, top: -20, width: 40, height: 40, overflow: 'visible' }}>
        <path d="M-14 0Q0 -14 14 0Q0 14 -14 0Z" fill="#8FE3C8" stroke={INK} strokeWidth="3.5" />
        <path d="M-10 0H10" stroke={INK} strokeWidth="2.5" />
      </svg>
    )
  if (kind === 1)
    return (
      <svg viewBox="-12 -12 24 24" style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, overflow: 'visible' }}>
        <circle r="7" fill="#F2C69B" stroke={INK} strokeWidth="3" />
      </svg>
    )
  return (
    <svg viewBox="-24 -20 48 40" style={{ position: 'absolute', left: -24, top: -20, width: 48, height: 40, overflow: 'visible' }}>
      <g stroke={INK} strokeWidth="3" strokeLinejoin="round">
        <path d="M0 0Q-18 -22 -20 -4Q-16 8 0 0Z" fill="#FF8FB8" />
        <path d="M0 0Q18 -22 20 -4Q16 8 0 0Z" fill="#FF8FB8" />
        <ellipse rx="3" ry="9" fill={INK} />
      </g>
    </svg>
  )
}
