// 🌋 Snow on a Volcano (Sicily: weather and altitude, lemon granita). Plan: planning/around-the-world/italy.md § 6.
// The toy (one core verb): grab Nino the donkey and lead him along the trail up Mount Etna. He trots after her finger
// (slower uphill, faster downhill), his cart rattles along behind him with Sparkle riding in it, and he reacts to
// everything on the way. The same verb deepens three times:
//   1. Up through the heat: the beach, then the lemon grove (tap fruit and it lands in the cart), the chestnut forest,
//      a stream to splash through. Nino pants in the heat; higher up he cools down.
//   2. Into the cold: snow starts falling, Nino shivers and his breath puffs, the scarf on a trail post warms him
//      up. She *feels* "higher is colder" by walking there.
//   3. Snow: pull Nino into five snow drifts and the snow piles into the cart (one, two... five!), then zoom back down
//      to the beach (a full cart rolls fast downhill: wheee), where it gets hot again and the scarf comes off.
// Side verb (Granita.tsx): scoop the snow into cups and squeeze a lemon or an orange over it for three melting friends.
// Payoff: friends cooled down, and Nino's piano for Lupa's band. Everything per-frame is written straight to the DOM
// from one game loop (like Venice).
import { AnimatePresence } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { Buddy, say, sounds, SparklePuppet, useGameLoop, type Line, type PuppetHandle } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { StoryBeat } from '../../../../kit/StoryBeat'
import { art as italyArt } from '../../art'
import { L as LINES } from '../../lines'
import type { ActivityProps } from '../../Place'
import { INK } from '../../puppets/ink'
import { Lupa } from '../../puppets/Lupa'
import { Nino, type NinoMood } from '../../puppets/Nino'
import { etnaArt, STAND_BANDS } from './art'
import { CART, CartArt, Flyer, type Fruit } from './Cart'
import { Granita } from './Granita'
import { BEACH_END, DRIFT_RAMS, DRIFTS, FEEL, ground, SCARF_X, SIZE, slope, snowfall, STAGE, STAND_X, START_X, STREAM, warmth, WORLD, X_MAX, X_MIN, zoneAt } from './mountain'
import { Clouds, Drift, FarVolcano, Ground, Props, Scarf, Sea, Stand, Trees } from './Scenery'
import { esfx } from './sfx'

const E = LINES.etna
/** Stars: the forest, the snow, the full cart, back at the beach, three granitas. */
const TOTAL = 7
const PARTICLES = 36
const FLAKES = 54
/** Nino's picture: width / height (viewBox 1200 x 1190), and his hooves' spot in it (shares of width / height). */
const NINO_ASPECT = 1200 / 1190
const NINO_ANCHOR = [(600 - 60) / 1200, (1188 - 20) / 1190] as const
const SKY_HOT = [159, 216, 242]
const SKY_COLD = [205, 214, 236]

interface Layout {
  W: number
  H: number
  s: number
  viewW: number
  viewH: number
  /** Where the ground under Nino sits (share of the height): lower on tall screens, so there's no empty band below. */
  gAt: number
}
type Stage = 'story' | 'play' | 'granita'
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  size: number
  color: string
}
interface FlyerData {
  id: number
  from: [number, number]
  to: [number, number]
  img?: string
  fruit?: Fruit
}

function layoutFor(W: number, H: number): Layout {
  const stageW = W > H ? STAGE.wideW : H / W > 1.7 ? STAGE.phoneW : STAGE.tallW
  const s = Math.min(W / stageW, H / STAGE.minH)
  return { W, H, s, viewW: W / s, viewH: H / s, gAt: H > W ? 0.76 : FEEL.groundAt }
}

const mix = (a: number[], b: number[], k: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`

export function Etna({ onDone, setProgress }: ActivityProps) {
  const root = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [stage, setStage] = useState<Stage>('story')
  const [stars, setStars] = useState(0)
  const [fruit, setFruit] = useState<Fruit[]>([])
  const [snow, setSnow] = useState(0)
  const [scarf, setScarf] = useState(false)
  const [scarfGlow, setScarfGlow] = useState(false)
  const [scooped, setScooped] = useState<boolean[]>(() => DRIFTS.map(() => false))
  const [rams, setRams] = useState<number[]>(() => DRIFTS.map(() => 0))
  const [flyers, setFlyers] = useState<FlyerData[]>([])
  useEffect(() => setProgress(Math.min(stars, TOTAL), TOTAL), [stars])
  const star = (n: number) => setStars((s) => Math.max(s, n))
  const fruitCount = useRef(0)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const measure = () => setLayout(layoutFor(el.clientWidth, el.clientHeight))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ---- Mutable game state (the loop reads and writes it every frame; React never sees it). ----
  const g = useRef({
    t: 0,
    x: START_X,
    vx: 0,
    facing: 1,
    cartX: START_X - FEEL.cartGap,
    camX: START_X - 200,
    camY: 0,
    drag: null as null | { id: number; fx: number; fy: number; gx: number; x0: number; y0: number; at: number },
    idle: 0,
    travelled: 0,
    stage: 'story' as Stage,
    snow: 0,
    scarf: false,
    scarfWas: false,
    inStream: false,
    fastT: 0,
    lastTalk: -99,
    pending: 0,
    cool: {} as Record<string, number>,
    once: new Set<string>(),
    idleAct: 4,
    particles: [] as Particle[],
    flakes: Array.from({ length: FLAKES }, () => ({ x: Math.random(), y: Math.random(), v: 0.5 + Math.random() * 0.6, sway: Math.random() * 6, size: 8 + Math.random() * 10 })),
    nextFlyer: 1,
    arrived: false,
    pushT: 0,
    rams: DRIFTS.map(() => 0),
  })
  const mood = useRef<NinoMood>({ walk: 0, phase: 0, hot: 1, cold: 0 })
  const layoutRef = useRef<Layout | null>(null)
  layoutRef.current = layout

  // ---- DOM handles written by the loop ----
  const worldEl = useRef<HTMLDivElement>(null)
  const farEl = useRef<HTMLDivElement | null>(null)
  const cloudsEl = useRef<HTMLDivElement | null>(null)
  const ninoEl = useRef<HTMLDivElement>(null)
  const ninoFlip = useRef<HTMLDivElement>(null)
  const cartEl = useRef<HTMLDivElement>(null)
  const cartFlip = useRef<HTMLDivElement>(null)
  const shaftRef = useRef<SVGPathElement>(null)
  const wheelRef = useRef<SVGGElement>(null)
  const ringEl = useRef<HTMLDivElement>(null)
  const chipEl = useRef<HTMLDivElement>(null)
  const sunEl = useRef<HTMLButtonElement>(null)
  const partEls = useRef<(HTMLDivElement | null)[]>([])
  const flakeEls = useRef<(HTMLDivElement | null)[]>([])
  const driftEls = useRef<(HTMLButtonElement | null)[]>([])
  const ninoRef = useRef<PuppetHandle>(null)
  const sparkleRef = useRef<PuppetHandle>(null)
  const friendRefs = useRef<(PuppetHandle | null)[]>([])

  /** An instruction or story line: queued after whatever is being said, so nothing important gets cut off. */
  const talk = (line: Line) => {
    const s = g.current
    s.lastTalk = s.t
    s.pending++
    void say(line, { interrupt: false }).finally(() => (s.pending = Math.max(0, s.pending - 1)))
  }
  /** A reaction ("Wheee!", "Ow!"): only when nobody is talking, so it never pushes out an instruction. */
  const react = (line: Line) => {
    if (g.current.pending > 0) return false
    talk(line)
    return true
  }
  const cooled = (key: string, secs: number) => {
    const s = g.current
    if ((s.cool[key] ?? -99) > s.t - secs) return false
    s.cool[key] = s.t
    return true
  }
  /** True the first time only. */
  const first = (key: string) => {
    const s = g.current
    if (s.once.has(key)) return false
    s.once.add(key)
    return true
  }
  const spawn = (p: Particle) => {
    const list = g.current.particles
    if (list.length >= PARTICLES) list.shift()
    list.push(p)
  }
  const puff = (x: number, y: number, color: string, n = 6, up = 260) => {
    for (let i = 0; i < n; i++) spawn({ x, y, vx: (Math.random() - 0.5) * 260, vy: -up * (0.5 + Math.random() * 0.8), age: 0, life: 0.7, size: 12 + Math.random() * 12, color })
  }
  const cartTop = (): [number, number] => {
    const s = g.current
    return [s.cartX, ground(s.cartX) - CART.floor - 90]
  }
  const fly = (from: [number, number], img?: string, kind?: Fruit) => {
    const id = g.current.nextFlyer++
    setFlyers((f) => [...f, { id, from, to: cartTop(), img, fruit: kind }])
  }

  const toWorld = (L: Layout, px: number, py: number) => {
    const s = g.current
    return { x: s.camX + (px - L.W / 2) / L.s, y: s.camY + (py - L.H * L.gAt) / L.s }
  }

  const onPointerDown = (e: PointerEvent) => {
    const L = layoutRef.current
    const s = g.current
    if (!L || s.stage !== 'play' || s.drag) return
    const r = root.current!.getBoundingClientRect()
    const px = e.clientX - r.left
    const py = e.clientY - r.top
    const p = toWorld(L, px, py)
    // Any touch counts as playing (poking things isn't being stuck).
    s.idle = 0
    // Things to poke (fruit, the scarf...) keep their own taps, even right next to Nino.
    const target = e.target as HTMLElement
    if (target.closest('[data-poke]') && !target.closest('[data-grab]')) return
    // Grab Nino or his cart (his body and the cart box, at least ~60px on small screens).
    const near = (cx: number) => {
      const cy = ground(cx) - 95
      const rx = Math.max(110, 60 / L.s)
      const ry = Math.max(105, 60 / L.s)
      return ((p.x - cx) / rx) ** 2 + ((p.y - cy) / ry) ** 2 < 1
    }
    if (near(s.x) || near(s.cartX)) {
      e.stopPropagation()
      root.current!.setPointerCapture(e.pointerId)
      // Keep the offset from Nino wherever she grabbed (grabbing the cart never makes him turn round).
      s.drag = { id: e.pointerId, fx: px, fy: py, gx: p.x - s.x, x0: px, y0: py, at: performance.now() }
      sfx.fwip()
      return
    }
    if (target.closest('button')) return
    // Tap the ground or the sky: a little puff (sand, dirt, ash or snow).
    if (p.y > ground(p.x) - 10) {
      const zone = zoneAt(p.x)
      puff(p.x, ground(p.x) + 6, zone === 'snow' ? '#EEF5FF' : zone === 'lava' ? '#77707F' : zone === 'beach' ? '#F6DFA8' : '#C98B5B')
      if (zone === 'snow') esfx.crunch()
      else sfx.thump()
    }
  }
  const onPointerMove = (e: PointerEvent) => {
    const d = g.current.drag
    if (!d || d.id !== e.pointerId) return
    const r = root.current!.getBoundingClientRect()
    d.fx = e.clientX - r.left
    d.fy = e.clientY - r.top
  }
  const onPointerUp = (e: PointerEvent) => {
    const s = g.current
    const d = s.drag
    if (d?.id !== e.pointerId) return
    s.drag = null
    // A quick tap on Nino (no drag): he giggles or brays.
    if (e.type === 'pointerup' && performance.now() - d.at < 450 && Math.hypot(d.fx - d.x0, d.fy - d.y0) < 30) {
      if (Math.random() < 0.5) void ninoRef.current?.play('giggle')
      else void ninoRef.current?.play('bray')
      if (cooled('tickle', 6)) react(LINES.tickle.nino[Math.floor(Math.random() * LINES.tickle.nino.length)])
    }
  }

  // ---- Taps on things along the trail ----
  const onFruit = (at: [number, number], kind: Fruit) => {
    sounds.pop()
    fly(at, kind === 'lemon' ? etnaArt.lemon : etnaArt.orange, kind)
    void sparkleRef.current?.play('cheer')
    react(kind === 'lemon' ? E.lemon : E.orange)
  }
  const onChestnut = (x: number) => {
    sfx.pop()
    const s = g.current
    const top = ground(x) - 420
    puff(x + 60, top, '#6FA95A', 5, 80)
    // Right under the tree? It bonks Nino (silly, not a failure).
    if (Math.abs(s.x - x) < 220) {
      setTimeout(() => {
        sfx.thump()
        void ninoRef.current?.play('shake')
        puff(g.current.x + 40, ground(g.current.x) - 190, '#8FB86A', 6, 200)
        if (cooled('bonk', 8)) react(E.bonk)
      }, 380)
    }
  }
  const onPine = (x: number) => {
    esfx.pomf()
    const s = g.current
    for (let i = 0; i < 10; i++) spawn({ x: x + (Math.random() - 0.5) * 200, y: ground(x) - 300 - Math.random() * 100, vx: (Math.random() - 0.5) * 80, vy: 40 + Math.random() * 100, age: 0, life: 1.2, size: 14 + Math.random() * 12, color: '#EEF5FF' })
    if (Math.abs(s.x - x) < 240) {
      setTimeout(() => {
        void ninoRef.current?.play('sneeze')
        if (cooled('achoo', 10)) react(E.achoo)
      }, 600)
    }
  }
  const onCactus = () => {
    sfx.boing()
    if (Math.abs(g.current.x - 1400) < 600 || Math.abs(g.current.x - 2250) < 600) {
      void ninoRef.current?.play('hop')
      if (cooled('prickly', 12)) react(E.prickly)
    }
  }
  const onVent = (x: number) => {
    esfx.hiss()
    puff(x, ground(x) - 20, '#F4F2FA', 6, 300)
  }
  const onCrater = () => {
    esfx.rumble()
    void ninoRef.current?.play('bray')
    if (first('volcano')) talk(E.volcano)
    else if (first('tallest')) talk(E.tallest)
  }
  const onUmbrella = () => sounds.whoosh()
  const onSea = (x: number) => {
    sfx.splash()
    puff(x, 40, '#A8DCFF', 8, 380)
  }
  const onDriftTap = () => {
    esfx.crunch()
    if (cooled('driftHint', 12) && g.current.snow < DRIFTS.length) react(E.snow)
  }
  const onSun = () => {
    esfx.sizzle()
    if (warmth(g.current.x) > 0.5 && cooled('hot', 10)) {
      void ninoRef.current?.play('shake')
      react(E.hot)
    }
  }
  const takeScarf = () => {
    const s = g.current
    if (s.scarf) return
    s.scarf = true
    setScarf(true)
    setScarfGlow(false)
    sounds.sparkle()
    fly([SCARF_X, ground(SCARF_X) - 150])
    setTimeout(() => {
      void ninoRef.current?.play('cheer')
      talk(E.cozy)
    }, 500)
  }
  const tapFriend = (i: number) => {
    void friendRefs.current[i]?.play(i === 0 ? 'wiggle' : 'jump')
    sfx.chirp()
    const id = (['lupa', 'marina', 'pina'] as const)[i]
    if (cooled(`friend${i}`, 8)) react(g.current.snow >= DRIFTS.length ? E.yay : E.hotFriend[id])
  }

  // QA hook: jump straight to a moment (screens), and read where Nino is.
  useEffect(() => {
    if (!navigator.webdriver) return
    const w = window as unknown as { __etnaQA?: { jump: (to: string) => void } }
    w.__etnaQA = {
      jump: (to: string) => {
        const s = g.current
        s.stage = 'play'
        setStage('play')
        const put = (x: number, facing = 1) => {
          s.x = x
          s.facing = facing
          s.cartX = x - facing * FEEL.cartGap
          s.camX = x
          s.camY = ground(x)
          s.travelled = 1000
        }
        if (to === 'grove') put(1300)
        else if (to === 'forest') put(3000)
        else if (to === 'cold') put(4300)
        else if (to === 'snow') put(5050)
        else if (to === 'full') {
          put(5900, -1)
          s.snow = DRIFTS.length
          setSnow(DRIFTS.length)
          setScooped(DRIFTS.map(() => true))
          DRIFTS.forEach((_, i) => s.once.add(`drift${i}`))
          s.once.add('full')
        } else if (to === 'granita' || to === 'payoff') {
          s.snow = DRIFTS.length
          setSnow(DRIFTS.length)
          s.stage = 'granita'
          setStage('granita')
          ;(window as unknown as { __etnaPayoff?: boolean }).__etnaPayoff = to === 'payoff'
        }
      },
    }
    return () => void delete w.__etnaQA
  }, [])

  useGameLoop((dt) => {
    const L = layoutRef.current
    if (!L || dt <= 0) return
    const s = g.current
    s.t += dt
    const playing = s.stage === 'play'
    const full = s.snow >= DRIFTS.length

    // ---- Nino: chase the finger along the trail, or stop ----
    let pull = 0
    if (s.drag && playing) {
      const p = toWorld(L, s.drag.fx, s.drag.fy)
      const tx = Math.max(X_MIN, Math.min(X_MAX, p.x - s.drag.gx))
      pull = Math.abs(tx - s.x) > 30 ? Math.sign(tx - s.x) : 0
      s.vx += (FEEL.followK * (tx - s.x) - FEEL.followDamp * s.vx) * dt
    } else {
      s.vx *= Math.exp(-FEEL.stopDrag * dt)
      if (playing) s.idle += dt
    }
    // Top speed: slower uphill, faster downhill (a full cart rolls), a bit slower in deep snow.
    const up = -slope(s.x) * Math.sign(s.vx || 1) // > 0 when heading uphill
    let cap = FEEL.maxSpeed / (1 + FEEL.uphill * Math.max(0, up))
    if (up < 0 && full) cap *= FEEL.downhillBoost
    if (zoneAt(s.x) === 'snow' && !full) cap *= FEEL.snowSpeed
    s.vx = Math.max(-cap, Math.min(cap, s.vx))
    s.x += s.vx * dt
    if (s.x < X_MIN || s.x > X_MAX) {
      s.x = Math.max(X_MIN, Math.min(X_MAX, s.x))
      s.vx = 0
    }
    const speed = Math.abs(s.vx)
    s.travelled += speed * dt
    if (s.drag) s.idle = 0

    // Turning round: a little hop, and the cart swings round behind him.
    if (s.vx * s.facing < -FEEL.turnSpeed && pull * s.facing < 0) {
      s.facing = -s.facing
      sounds.whoosh()
      void ninoRef.current?.play('hop')
    }
    // A rigid hitch keeps the cart attached at any speed, including reversals.
    s.cartX = s.x - s.facing * FEEL.cartGap

    // Legs and weather for the puppet.
    const m = mood.current
    m.walk += (Math.min(1, speed / 320) - m.walk) * Math.min(1, dt * 8)
    m.phase += ((speed * dt) / FEEL.stride) * Math.PI * 2
    m.hot = warmth(s.x)
    m.cold = Math.max(0, 1 - warmth(s.x) * 1.6) * (s.scarf ? 0.35 : 1)

    // ---- The director: what happens along the way ----
    if (playing) {
      const x = s.x
      if (x > 950 && s.travelled > 300 && first('pick')) talk(E.pick)
      if (x > 2450 && first('forest')) {
        star(1)
        react(E.cooler)
      }
      // The stream: splash through it.
      const inStream = x > STREAM.from && x < STREAM.to
      if (inStream && !s.inStream) {
        sfx.splash()
        for (let i = 0; i < 10; i++) spawn({ x: x + (Math.random() - 0.5) * 120, y: ground(x) + 10, vx: (Math.random() - 0.5) * 300, vy: -300 - Math.random() * 250, age: 0, life: 0.8, size: 12 + Math.random() * 10, color: '#A8DCFF' })
        if (cooled('splash', 20)) react(E.splash)
      }
      s.inStream = inStream
      // Snow starts falling: cold!
      if (x > 4150 && first('cold')) {
        void ninoRef.current?.play('shake')
        void sparkleRef.current?.play('wiggle')
        talk(E.colder)
      }
      // Shivering while he stands in the cold.
      if (x > 4150 && !s.scarf && speed < 20 && s.idle > 2 && cooled('brr', 25)) react(E.cold)
      if (x > SCARF_X - 600 && !s.scarf && first('scarfGlow')) setScarfGlow(true)
      // Only when he's at the scarf and stopped (never once he's gone by).
      if (Math.abs(x - SCARF_X) < 260 && speed < 60 && !s.scarf && first('scarfHint')) talk(E.scarf)
      if (x > 4850 && first('snow')) star(2)
      // Snow drifts stop him: she bumps Nino into each one (one bump, then two, then three for the big last one)
      // and the snow flies into the cart as a snowball. A slow steady push counts as a bump too.
      DRIFTS.forEach((dx, i) => {
        if (s.once.has(`drift${i}`)) return
        const side = Math.sign(dx - s.x) || 1
        const gap = Math.abs(dx - s.x) - FEEL.driftReach - 60
        if (gap > 0) return
        // Into the drift: he can't go through it.
        s.x = dx - side * (FEEL.driftReach + 60)
        const into = s.vx * side
        s.pushT = into > 0 && s.drag ? s.pushT + dt : 0
        if (into > 140 || s.pushT > 1.1) {
          s.pushT = 0
          s.vx = -side * 260
          s.rams[i]++
          setRams((r) => r.map((v, j) => (j === i ? s.rams[i] : v)))
          esfx.pomf()
          void ninoRef.current?.play('shake')
          for (let k = 0; k < 6; k++) spawn({ x: dx - side * 50, y: ground(dx) - 60, vx: -side * Math.random() * 200, vy: -200 - Math.random() * 250, age: 0, life: 0.8, size: 12 + Math.random() * 12, color: '#EEF5FF' })
          if (s.rams[i] < DRIFT_RAMS[i]) {
            if (first('again')) talk(E.again)
            return
          }
          s.once.add(`drift${i}`)
          s.snow++
          setScooped((d) => d.map((v, j) => v || j === i))
          for (let k = 0; k < 12; k++) spawn({ x: dx, y: ground(dx) - 60, vx: (Math.random() - 0.5) * 360, vy: -300 - Math.random() * 300, age: 0, life: 0.9, size: 14 + Math.random() * 14, color: '#EEF5FF' })
          const n = s.snow
          fly([dx, ground(dx) - 80])
          setTimeout(() => setSnow(n), 650)
          sounds.note(n + 2)
          void say(E.count[n - 1])
          if (n === DRIFTS.length && first('full')) {
            star(3)
            setTimeout(() => {
              void ninoRef.current?.play('bray')
              void sparkleRef.current?.play('cheer')
              talk(E.full)
              talk(E.down)
            }, 900)
          }
        } else s.vx = 0
        if (first('bumpHint')) react(E.snow)
      })
      // Going down, it gets warmer again: the scarf comes off.
      if (full && s.scarf && x < 3700) {
        s.scarf = false
        setScarf(false)
        void ninoRef.current?.play('shake')
        talk(E.warmer)
        talk(E.lower)
      }
      // Wheee: going fast down the mountain.
      s.fastT = speed > FEEL.wheeeAbove ? s.fastT + dt : 0
      if (s.fastT > 0.6 && cooled('wheee', 12)) react(E.wheee)
      // Snow spray from the wheels in the snow.
      if (zoneAt(x) === 'snow' && speed > 200 && Math.random() < dt * 20) spawn({ x: s.cartX, y: ground(s.cartX) - 4, vx: -Math.sign(s.vx) * (80 + Math.random() * 120), vy: -160 - Math.random() * 160, age: 0, life: 0.6, size: 10 + Math.random() * 10, color: '#EEF5FF' })
      // Dust from his hooves on dry ground.
      else if (speed > 260 && zoneAt(x) !== 'snow' && Math.random() < dt * 8) spawn({ x: s.x - s.facing * 60, y: ground(s.x) - 6, vx: -Math.sign(s.vx) * 60, vy: -60, age: 0, life: 0.6, size: 16, color: zoneAt(x) === 'beach' ? '#F6DFA8' : zoneAt(x) === 'lava' ? '#77707F' : '#E2B48A' })
      // Back at the beach with the snow: granita time!
      if (full && x < BEACH_END && !s.arrived) {
        s.arrived = true
        s.drag = null
        star(4)
        void ninoRef.current?.play('cheer')
        friendRefs.current.forEach((f, i) => setTimeout(() => void f?.play(i === 0 ? 'cheer' : 'jump'), i * 200))
        talk(E.yay)
        setTimeout(() => {
          g.current.stage = 'granita'
          setStage('granita')
        }, 1800)
      }
      // Idle life: he munches a bit of grass, or brays.
      if (!s.drag && speed < 20) {
        s.idleAct -= dt
        if (s.idleAct < 0) {
          s.idleAct = 5 + Math.random() * 4
          const zone = zoneAt(x)
          void ninoRef.current?.play(zone === 'grove' || zone === 'forest' ? 'munch' : zone === 'snow' ? 'shake' : 'nod')
        }
      }
      // Stuck? Sparkle reminds her which way (and the ring around Nino pulses).
      if (s.idle > 8 && s.t - s.lastTalk > 8 && cooled('stuck', 16)) talk(full ? E.pullDown : E.pull)
      if (!s.scarf && s.idle > 9 && Math.abs(x - SCARF_X) < 400 && cooled('scarfAgain', 25)) talk(E.scarf)
    }

    // ---- Camera: follows Nino, leading by his speed; a little to the left at first (to see the friends) ----
    const lead = Math.max(-FEEL.maxLead * L.viewW, Math.min(FEEL.maxLead * L.viewW, s.vx * FEEL.leadTime))
    const intro = -200 * Math.max(0, 1 - s.travelled / 500)
    const camTarget = Math.max(WORLD.left + L.viewW / 2, Math.min(WORLD.right - L.viewW / 2, s.x + lead + intro))
    const k = 1 - Math.exp(-FEEL.cameraRate * dt)
    s.camX += (camTarget - s.camX) * k
    s.camY += (ground(s.camX) * 0.5 + ground(s.x) * 0.5 - s.camY) * k

    // ---- Particles ----
    for (const p of s.particles) {
      p.age += dt
      p.vy += 900 * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
    }
    s.particles = s.particles.filter((p) => p.age < p.life)

    // ---- Write it all to the DOM ----
    if (worldEl.current) worldEl.current.style.transform = `translate3d(${L.W / 2 - s.camX * L.s}px,${L.H * L.gAt - s.camY * L.s}px,0) scale(${L.s})`
    if (farEl.current) {
      farEl.current.style.transform = `translate3d(${L.W * 0.62 - (s.camX - START_X) * 0.1 * L.s}px,${L.H * L.gAt + (-s.camY * 0.06 + 40) * L.s}px,0) scale(${L.s})`
      // Up on the volcano itself, the far view of it fades away.
      farEl.current.style.opacity = String(Math.max(0, Math.min(1, (5000 - s.camX) / 1400)))
    }
    if (cloudsEl.current) cloudsEl.current.style.transform = `translate3d(${-(((s.camX * 0.25 + s.t * 8) % 3200) + 3200) % 3200 * L.s}px,${L.H * L.gAt + (-s.camY * 0.25) * L.s}px,0) scale(${L.s})`
    const w = warmth(s.x)
    if (root.current) root.current.style.backgroundColor = mix(SKY_HOT, SKY_COLD, 1 - w)
    if (sunEl.current) sunEl.current.style.opacity = String(Math.max(0, Math.min(1, w * 1.4 - 0.1)))

    const angle = (x: number) => (Math.atan(slope(x)) * 180) / Math.PI
    if (ninoEl.current) ninoEl.current.style.transform = `translate3d(${s.x}px,${ground(s.x)}px,0) rotate(${angle(s.x) * 0.7}deg)`
    if (ninoFlip.current) ninoFlip.current.style.transform = `scaleX(${s.facing})`
    // Directors can move Nino too (snow bumps), so resolve the hitch after those moves.
    s.cartX = s.x - s.facing * FEEL.cartGap
    const cartDir = s.facing
    const cartAngle = Math.atan(slope(s.cartX))
    if (cartEl.current) cartEl.current.style.transform = `translate3d(${s.cartX}px,${ground(s.cartX)}px,0) rotate(${angle(s.cartX)}deg)`
    if (cartFlip.current) cartFlip.current.style.transform = `scaleX(${cartDir})`
    // Transform Nino's harness into the cart's rotated, mirrored local coordinates.
    // This keeps the shaft on his body even when the two stand on different slopes.
    const ninoAngle = Math.atan(slope(s.x)) * 0.7
    const hx = s.facing * 38
    const hy = -68
    const dx = s.x + hx * Math.cos(ninoAngle) - hy * Math.sin(ninoAngle) - s.cartX
    const dy = ground(s.x) + hx * Math.sin(ninoAngle) + hy * Math.cos(ninoAngle) - ground(s.cartX)
    const hitchX = (dx * Math.cos(cartAngle) + dy * Math.sin(cartAngle)) * cartDir
    const hitchY = -dx * Math.sin(cartAngle) + dy * Math.cos(cartAngle)
    shaftRef.current?.setAttribute('d', `M${CART.w / 2 - 20} ${-CART.floor - 26} L${hitchX} ${hitchY - 6} L${hitchX} ${hitchY + 6} L${CART.w / 2 - 20} ${-CART.floor - 12}Z`)
    if (wheelRef.current) wheelRef.current.setAttribute('transform', `translate(0 ${-CART.wheel}) rotate(${((s.cartX / CART.wheel) * 180) / Math.PI * cartDir})`)
    // The ring around Nino pulses when she hasn't touched him for a while.
    if (ringEl.current) ringEl.current.style.opacity = s.idle > 4 && playing ? String(0.55 + 0.45 * Math.sin(s.t * 6)) : '0'
    // Which way to go: a chip at the edge (snow up the mountain to the right, Lupa down on the beach to the left).
    if (chipEl.current) {
      const show = playing && s.idle > 5 && !s.arrived && (full ? s.x > BEACH_END : s.snow < DRIFTS.length)
      chipEl.current.style.display = show ? 'flex' : 'none'
      if (show) {
        const left = full
        chipEl.current.style.left = left ? '14px' : `${L.W - 14 - chipEl.current.offsetWidth}px`
        chipEl.current.style.flexDirection = left ? 'row-reverse' : 'row'
        chipEl.current.style.transform = `translateX(${Math.sin(s.t * 7) * 6 * (left ? -1 : 1)}px) scale(${1 + 0.08 * Math.sin(s.t * 7)})`
        const arrow = chipEl.current.lastElementChild as HTMLElement | null
        if (arrow) arrow.style.transform = left ? 'scaleX(-1)' : ''
        const icon = chipEl.current.firstElementChild as HTMLElement | null
        if (icon) {
          ;(icon.children[0] as HTMLElement).style.display = left ? 'none' : 'block'
          ;(icon.children[1] as HTMLElement).style.display = left ? 'block' : 'none'
        }
      }
    }
    partEls.current.forEach((el, i) => {
      if (!el) return
      const p = s.particles[i]
      if (!p) return void (el.style.opacity = '0')
      el.style.opacity = String(1 - p.age / p.life)
      el.style.background = p.color
      el.style.transform = `translate3d(${p.x - 10}px,${p.y - 10}px,0) scale(${p.size / 20})`
    })
    // Snowfall (screen space), heavier the higher he goes.
    const fall = snowfall(s.x)
    const count = Math.round(fall * FLAKES)
    s.flakes.forEach((f, i) => {
      const el = flakeEls.current[i]
      if (!el) return
      if (i >= count) return void (el.style.opacity = '0')
      f.y += (f.v * 70 * dt) / Math.max(1, L.H / 900)
      if (f.y > 1.05) ((f.y = -0.05), (f.x = Math.random()))
      el.style.opacity = '0.95'
      el.style.transform = `translate3d(${f.x * L.W + Math.sin(s.t * 1.5 + f.sway) * 14}px,${f.y * L.H}px,0) scale(${f.size / 16})`
    })

    if (navigator.webdriver) (window as unknown as { __etna?: object }).__etna = { x: s.x, vx: s.vx, facing: s.facing, cartX: s.cartX, snow: s.snow, scarf: s.scarf, stage: s.stage }
  }, layout !== null)

  const L = layout
  const ninoH = SIZE.nino
  const ninoW = ninoH * NINO_ASPECT
  const friendTop = ground(STAND_X) - 330 + 8 + 330 * STAND_BANDS.window + 3
  return (
    <div
      ref={root}
      onPointerDownCapture={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={onPointerUp}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', backgroundColor: 'rgb(159,216,242)' }}
    >
      {/* The sun (tap: it sizzles; it fades away as they climb into the clouds). */}
      <button ref={sunEl} aria-label="sun" data-poke onClick={onSun} style={{ position: 'absolute', right: '8%', top: 'calc(var(--bar-clear) + 10px)', width: 'min(120px, 16vmin)', height: 'min(120px, 16vmin)', padding: 0, border: 'none', background: 'none', zIndex: 0 }}>
        <svg viewBox="-60 -60 120 120" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} transform={`rotate(${i * 36})`} d="M0 -58 L8 -42 L-8 -42Z" fill="#FFC83D" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          ))}
          <circle r="36" fill="#FFE27A" stroke={INK} strokeWidth="5" />
          <circle cx="-13" cy="-4" r="4" fill={INK} />
          <circle cx="13" cy="-4" r="4" fill={INK} />
          <path d="M-10 10 Q0 18 10 10" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="-22" cy="8" rx="7" ry="4" fill="#F9C4C0" />
          <ellipse cx="22" cy="8" rx="7" ry="4" fill="#F9C4C0" />
        </svg>
      </button>
      {L && stage !== 'granita' && (
        <>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <FarVolcano refFn={(el) => void (farEl.current = el)} />
            <Clouds refFn={(el) => void (cloudsEl.current = el)} />
          </div>
          <div ref={worldEl} style={{ position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', willChange: 'transform' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }}>
              <Ground />
            </div>
            <Sea onTap={onSea} />
            <Trees onFruit={onFruit} onChestnut={onChestnut} onPine={onPine} />
            <Props onCactus={onCactus} onVent={onVent} onCrater={onCrater} onDrift={onDriftTap} onUmbrella={onUmbrella} />
            <Scarf taken={scarf} glow={scarfGlow} onTap={takeScarf} />
            {/* The granita stand, with three hot friends waiting inside it (behind its counter and awning). */}
            <Stand x={STAND_X} h={330} />
            {[
              { x: STAND_X - 115, h: 140, el: (i: number) => <Lupa ref={(r) => void (friendRefs.current[i] = r)} height="100%" /> },
              { x: STAND_X + 5, h: 115, el: (i: number) => <Buddy ref={(r) => void (friendRefs.current[i] = r)} img={etnaArt.seal} voice="marina" height="100%" /> },
              { x: STAND_X + 108, h: 115, el: (i: number) => <Buddy ref={(r) => void (friendRefs.current[i] = r)} img={etnaArt.piglet} voice="pina" height="100%" /> },
            ].map((f, i) => (
              <button key={i} aria-label="friend" data-poke onClick={() => tapFriend(i)} style={{ position: 'absolute', left: f.x - f.h * 0.6, top: friendTop, width: f.h * 1.2, height: f.h, padding: 0, border: 'none', background: 'none', zIndex: 2, display: 'flex', justifyContent: 'center' }}>
                {f.el(i)}
              </button>
            ))}
            <Stand x={STAND_X} h={330} part="counter" />
            <Stand x={STAND_X} h={330} part="awning" />
            {/* The cart, with Sparkle riding in it. */}
            <div ref={cartEl} style={{ position: 'absolute', left: 0, top: 0, zIndex: 4, transformOrigin: '0 0' }}>
              <div ref={cartFlip}>
                <CartArt wheelRef={wheelRef} shaftRef={shaftRef} fruit={fruit} snow={snow} rider={
                  <div style={{ position: 'absolute', left: -46, top: -CART.floor - 55 - SIZE.sparkle, height: SIZE.sparkle }}>
                    <SparklePuppet ref={sparkleRef} height={`${SIZE.sparkle}px`} lookToward={0.5} />
                  </div>
                } />
              </div>
            </div>
            {/* Nino. */}
            <div ref={ninoEl} aria-label="Nino" style={{ position: 'absolute', left: 0, top: 0, zIndex: 5, transformOrigin: '0 0' }}>
              <div ref={ninoFlip}>
                <div ref={ringEl} style={{ position: 'absolute', left: -150, top: -215, width: 300, height: 250, borderRadius: '50%', border: '7px solid #FFC83D', boxShadow: '0 0 24px #FFC83D', opacity: 0, pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', left: -ninoW * NINO_ANCHOR[0], top: -ninoH * NINO_ANCHOR[1], width: ninoW, height: ninoH }}>
                  <Nino ref={ninoRef} moodRef={mood} scarf={scarf} height="100%" />
                </div>
              </div>
            </div>
            {DRIFTS.map((_, i) => (
              <Drift key={i} i={i} scooped={scooped[i]} bumps={rams[i]} need={DRIFT_RAMS[i]} refFn={(el) => void (driftEls.current[i] = el)} onTap={onDriftTap} />
            ))}
            <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 7, pointerEvents: 'none' }}>
              {Array.from({ length: PARTICLES }, (_, i) => (
                <div key={i} ref={(el) => void (partEls.current[i] = el)} style={{ position: 'absolute', left: 0, top: 0, width: 20, height: 20, borderRadius: '50%', border: `3px solid ${INK}`, opacity: 0 }} />
              ))}
            </div>
            <AnimatePresence>
              {flyers.map((f) => (
                <Flyer
                  key={f.id}
                  from={f.from}
                  to={f.to}
                  img={f.img}
                  size={f.img ? 52 : 46}
                  onDone={() => {
                    setFlyers((list) => list.filter((x) => x.id !== f.id))
                    if (f.fruit) {
                      setFruit((list) => [...list, f.fruit!])
                      esfx.thud()
                      if (fruitCount.current++ === 1) talk(E.citrus)
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
      {/* Snowflakes falling over everything (screen space). */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9 }}>
        {Array.from({ length: FLAKES }, (_, i) => (
          <div key={i} ref={(el) => void (flakeEls.current[i] = el)} style={{ position: 'absolute', left: -8, top: -8, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 2px rgba(110,59,36,.25)', opacity: 0 }} />
        ))}
      </div>
      {/* Which way: snow up the mountain (right), or Lupa on the beach (left). */}
      <div ref={chipEl} aria-hidden style={{ position: 'absolute', zIndex: 12, top: '50%', display: 'none', alignItems: 'center', pointerEvents: 'none' }}>
        <div style={{ width: 'min(84px, 14vh)', height: 'min(84px, 14vh)', borderRadius: '50%', background: '#FFF7F0', border: `5px solid ${INK}`, boxShadow: '0 0 0 6px #FFC83D', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          <img src={etnaArt.drift} alt="" style={{ width: '82%' }} />
          <img src={italyArt.lupa} alt="" style={{ width: '120%', marginTop: '12%', display: 'none' }} />
        </div>
        <svg viewBox="0 0 48 60" style={{ width: 'min(40px, 6.6vh)', margin: '0 4px', overflow: 'visible' }}>
          <path d="M6 10 L42 30 L6 50 Z" fill="#FFC83D" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </svg>
      </div>

      {stage === 'story' && <StoryBeat lines={E.arrive} friend={<Nino height="100%" hot={1} />} onDone={() => ((g.current.stage = 'play'), setStage('play'), talk(E.pull))} />}
      {stage === 'granita' && <Granita fruit={fruit} onStar={(n) => star(4 + n)} onDone={onDone} />}
    </div>
  )
}

