// 🐉 The Dragon Parade (China's finale). New Year night in the village square. Long Long is the head of a paper dragon and
// the seven friends Kaylee helped carry its body. She drags Long Long around the plaza and the body follows along his path
// (each segment trails the one before, bobbing like a real dragon dance); every friend thanks her in their own voice as
// she rounds the loop. Then: drum beats make a dance wave run through the dragon, fireworks bloom where she taps, the flag
// rises, and Bao Bao hands her a red envelope. Opening it calls onDone (the shell's trophy ceremony).
// Nothing can fail. If she stops, Long Long says a hint and then parades on his own.
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { bell, burst, bigCelebration, lineText, say, sounds, span, stopSpeaking, useAlive, useElementSize, useGameLoop, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { Flag } from '../../../../kit/Flag'
import { PromptBubble } from '../../../../kit/Stage'
import { sfx } from '../../../../kit/sfx'
import { art } from '../../art'
import { L } from '../../lines'
import { LongLong } from '../../puppets/LongLong'
import { INK } from '../../puppets/ink'
import type { ActivityProps } from '../../Place'
import { GongArt, PARADE_WORDS, ParadeCard, type Word } from './Bits'
import { Fireworks, type FireworksHandle } from './Fireworks'
import { Friend } from './Friend'
import { GUESTS } from './guests'

const P = L.parade
const TOTAL = 5
const DRUM_TAPS = 8
const SKY_TAPS = 5
const N_DOTS = 14
const TAU = Math.PI * 2
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const backOut = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2)
/** Pink first and every other one, then the festival colors. */
const FIRE = ['#FF7FB0', '#FFD04A', '#FF7FB0', '#7DE0B0', '#C9A8FF', '#FF6B6B']

type Stage = 'arrive' | 'drive' | 'drum' | 'sky' | 'flag' | 'envelope'

interface Geo {
  W: number
  H: number
  short: boolean
  topPad: number
  plazaTop: number
  head: number
  segW: number
  spacing: number
  feet: number
  cx: number
  cy: number
  rx: number
  ry: number
}

function makeGeo(W: number, H: number): Geo {
  const wide = W > H
  const short = wide && H < 560
  const head = clamp(Math.min(W * (wide ? 0.13 : 0.2), H * 0.26), 64, 170)
  const topPad = short ? 78 : 186
  const plazaTop = Math.max(topPad + 10, H * (short ? 0.42 : wide ? 0.46 : 0.42))
  const ymin = plazaTop + head * 0.6
  const ymax = H - 12 - head * 0.55
  const rx = Math.max(60, W / 2 - head * 0.85)
  return { W, H, short, topPad, plazaTop, head, segW: head * 0.95, spacing: head * 0.74, feet: head * 0.5, cx: W / 2, cy: (ymin + ymax) / 2, rx, ry: Math.max(30, (ymax - ymin) / 2) }
}

interface Trail {
  x: number[]
  y: number[]
  s: number[]
}

export function Parade({ onDone, setProgress }: ActivityProps) {
  const box = useRef<HTMLDivElement>(null)
  const { width: W, height: H } = useElementSize(box)
  const alive = useAlive()
  const g = W > 0 && H > 0 ? makeGeo(W, H) : null
  const G = useRef<Geo | null>(null)
  G.current = g

  const [stage, setStageState] = useState<Stage>('arrive')
  const stageRef = useRef<Stage>('arrive')
  const [prompt, setPrompt] = useState<Line>(P.arrive)
  const [word, setWord] = useState<Word | null>(null)
  const [shown, setShown] = useState(0)
  const [lit, setLit] = useState<boolean[]>(() => Array(N_DOTS).fill(false))
  const [hintRing, setHintRing] = useState(true)
  const [drumN, setDrumN] = useState(0)
  const [skyN, setSkyN] = useState(0)
  const [raised, setRaised] = useState(false)
  const [opened, setOpened] = useState(false)
  const [beat, setBeat] = useState(0)

  const ll = useRef<PuppetHandle>(null)
  const friends = useRef<(PuppetHandle | null)[][]>(GUESTS.map(() => []))
  const bao = useRef<PuppetHandle>(null)
  const fw = useRef<FireworksHandle>(null)
  const headEl = useRef<HTMLDivElement>(null)
  const segEls = useRef<(HTMLDivElement | null)[]>([])
  const friendEls = useRef<(HTMLDivElement | null)[]>([])
  const appear = useRef<number[]>(GUESTS.map(() => -1))
  const face = useRef<number[]>(GUESTS.map(() => 1))
  const litRef = useRef<boolean[]>(Array(N_DOTS).fill(false))
  const skipped = useRef(false)
  const finished = useRef(false)

  // The dragon: the head's position, the trail it leaves, and where she is in the loop.
  const head = useRef({ x: 0, y: 0, vx: 0, vy: 0, speed: 0, tilt: 0 })
  const trail = useRef<Trail>({ x: [], y: [], s: [] })
  const drag = useRef<{ id: number; dx: number; dy: number; moved: number; sx: number; sy: number } | null>(null)
  const target = useRef({ x: 0, y: 0 })
  const auto = useRef({ on: false, ang: Math.PI / 2 })
  const loop = useRef({ prev: null as number | null, cum: 0, maxPos: 0, maxNeg: 0, next: 0, idle: 0, hinted: false })
  const wave = useRef(-99)
  const laid = useRef('')

  const setStage = (s: Stage) => {
    stageRef.current = s
    setStageState(s)
  }
  const speak = async (l: Line) => {
    setPrompt(l)
    await say(l)
  }
  const now = () => performance.now() / 1000

  // ---- Trail: the recorded path of the head; segment i sits (i+1) spacings behind along it ----
  const resetDragon = () => {
    const geo = G.current
    if (!geo) return
    const t: Trail = { x: [], y: [], s: [] }
    // Start at the bottom of the loop with the body lying back along the bottom-left curve.
    const a0 = Math.PI / 2
    const need = geo.spacing * (GUESTS.length + 1) + geo.head
    const pts: [number, number][] = []
    let len = 0
    let prev: [number, number] | null = null
    for (let k = 0; len < need && k < 400; k++) {
      const a = a0 + k * 0.02
      const p: [number, number] = [geo.cx + geo.rx * Math.cos(a), geo.cy + geo.ry * Math.sin(a)]
      if (prev) len += Math.hypot(p[0] - prev[0], p[1] - prev[1])
      pts.push(p)
      prev = p
    }
    pts.reverse()
    for (const [x, y] of pts) {
      const n = t.x.length
      const d = n === 0 ? 0 : Math.hypot(x - t.x[n - 1], y - t.y[n - 1])
      t.x.push(x)
      t.y.push(y)
      t.s.push(n === 0 ? 0 : t.s[n - 1] + d)
    }
    trail.current = t
    const last = pts[pts.length - 1]
    head.current = { x: last[0], y: last[1], vx: 0, vy: 0, speed: 0, tilt: 0 }
    target.current = { x: last[0], y: last[1] }
    auto.current.ang = a0
    loop.current.prev = null
  }
  useEffect(() => {
    if (!g) return
    const key = `${Math.round(g.W)}x${Math.round(g.H)}`
    if (laid.current === key) return
    laid.current = key
    resetDragon()
  })

  const posAt = (sT: number, hx: number, hy: number) => {
    const t = trail.current
    const n = t.x.length
    if (n === 0) return { x: hx, y: hy }
    const lastS = t.s[n - 1]
    const dHead = Math.hypot(hx - t.x[n - 1], hy - t.y[n - 1])
    if (sT >= lastS) {
      const k = dHead > 0.001 ? clamp((sT - lastS) / dHead, 0, 1) : 0
      return { x: t.x[n - 1] + (hx - t.x[n - 1]) * k, y: t.y[n - 1] + (hy - t.y[n - 1]) * k }
    }
    if (sT <= t.s[0]) return { x: t.x[0], y: t.y[0] }
    let lo = 0
    let hi = n - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (t.s[mid] <= sT) lo = mid
      else hi = mid
    }
    const k = (sT - t.s[lo]) / Math.max(0.0001, t.s[hi] - t.s[lo])
    return { x: t.x[lo] + (t.x[hi] - t.x[lo]) * k, y: t.y[lo] + (t.y[hi] - t.y[lo]) * k }
  }

  // ---- The frame loop: move the head, then hang every segment on the trail ----
  useGameLoop((dt, time) => {
    const geo = G.current
    const h = head.current
    if (!geo || trail.current.x.length === 0) return
    const st = stageRef.current
    const d = drag.current
    const lp = loop.current

    // Autopilot: after arriving, in the show stages, or when she pauses for a long while.
    if (!d && st === 'drive') {
      lp.idle += dt
      if (lp.idle > 5 && !lp.hinted) {
        lp.hinted = true
        void speak(P.hint)
      }
      if (lp.idle > 10) auto.current.on = true
    }
    const wantAuto = st !== 'arrive' && !d && (st !== 'drive' || auto.current.on)
    if (d) {
      lp.idle = 0
      auto.current.on = false
    }
    let tx = target.current.x
    let ty = target.current.y
    let follow = 14
    if (wantAuto) {
      const a = auto.current
      a.ang -= dt * (st === 'drive' ? 0.5 : 0.42)
      tx = geo.cx + geo.rx * Math.cos(a.ang)
      ty = geo.cy + geo.ry * Math.sin(a.ang)
      follow = 4
    }
    if (st === 'arrive') {
      tx = h.x
      ty = h.y
    }
    const k = 1 - Math.exp(-dt * follow)
    const ox = h.x
    const oy = h.y
    h.x = clamp(h.x + (tx - h.x) * k, geo.head * 0.5, geo.W - geo.head * 0.5)
    h.y = clamp(h.y + (ty - h.y) * k, geo.plazaTop, geo.H - 12 - geo.feet - geo.head * 0.1)
    if (wantAuto && !d) {
      // keep the autopilot angle honest if the head was clamped
      auto.current.ang = Math.atan2((h.y - geo.cy) / geo.ry, (h.x - geo.cx) / geo.rx)
    }
    const vx = (h.x - ox) / Math.max(dt, 0.001)
    const vy = (h.y - oy) / Math.max(dt, 0.001)
    h.vx += (vx - h.vx) * 0.2
    h.vy += (vy - h.vy) * 0.2
    h.speed += (Math.hypot(vx, vy) - h.speed) * 0.15
    h.tilt += (clamp(h.vx * 0.03, -14, 14) - h.tilt) * 0.2

    // Record the path.
    const tr = trail.current
    const n = tr.x.length
    const dl = Math.hypot(h.x - tr.x[n - 1], h.y - tr.y[n - 1])
    if (dl >= 3) {
      tr.x.push(h.x)
      tr.y.push(h.y)
      tr.s.push(tr.s[n - 1] + dl)
      const keep = geo.spacing * (GUESTS.length + 2) + 40
      while (tr.s.length > 2 && tr.s[1] < tr.s[tr.s.length - 1] + dl - keep) {
        tr.x.shift()
        tr.y.shift()
        tr.s.shift()
      }
    }
    const sHead = tr.s[tr.s.length - 1] + Math.hypot(h.x - tr.x[tr.x.length - 1], h.y - tr.y[tr.y.length - 1])

    const t0 = now()
    const moving = clamp(h.speed / 260, 0, 1)
    const wv = t0 - wave.current

    // Head
    const he = headEl.current
    if (he) {
      const w = bell(span(wv, 0, 0.55))
      const dance = w * geo.head * 0.16
      he.style.transform = `translate(${h.x - geo.head * 0.58}px, ${h.y - geo.head * 0.58 - dance + Math.sin(time * 6) * geo.head * 0.012 * (0.4 + moving)}px) rotate(${h.tilt}deg)`
      he.style.zIndex = String(20 + Math.round(h.y + geo.feet) + 2)
    }
    // Body segments
    for (let i = 0; i < GUESTS.length; i++) {
      const el = segEls.current[i]
      if (!el) continue
      const p = posAt(sHead - (i + 1) * geo.spacing, h.x, h.y)
      const pf = posAt(sHead - (i + 1) * geo.spacing + 10, h.x, h.y)
      const pb = posAt(sHead - (i + 1) * geo.spacing - 10, h.x, h.y)
      const ddx = pf.x - pb.x
      if (Math.abs(ddx) > 1.5) face.current[i] += ((ddx > 0 ? 1 : -1) - face.current[i]) * Math.min(1, dt * 8)
      const bob = Math.sin(time * 6.5 - i * 0.95) * geo.segW * 0.025 * (0.35 + moving * 1.1)
      const w = bell(span(wv - (i + 1) * 0.1, 0, 0.55))
      const a0 = appear.current[i]
      const sc = a0 < 0 ? 0 : backOut(clamp((t0 - a0) / 0.45, 0, 1))
      const lift = bob - w * geo.segW * 0.3
      el.style.transform = `translate(${p.x - geo.segW / 2}px, ${p.y + geo.feet - geo.segW * 0.86 + lift}px) scale(${sc}, ${sc * (1 - w * 0.06 + Math.abs(bob) * 0.004)})`
      el.style.zIndex = String(20 + Math.round(p.y + geo.feet))
      const fe = friendEls.current[i]
      if (fe) fe.style.transform = `translateX(-50%) scaleX(${face.current[i].toFixed(3)}) rotate(${Math.sin(time * 9.5 - i * 1.3) * 3.5 * (0.15 + moving)}deg)`
    }

    // Lantern dots she has passed (and the loop she has walked).
    if (st === 'drive') {
      let changed = false
      for (let j = 0; j < N_DOTS; j++) {
        if (litRef.current[j]) continue
        const a = (j / N_DOTS) * TAU
        if (Math.hypot(h.x - (geo.cx + geo.rx * Math.cos(a)), h.y - (geo.cy + geo.ry * Math.sin(a))) < geo.head * 0.6) {
          litRef.current[j] = true
          changed = true
        }
      }
      if (changed) setLit([...litRef.current])
      const nx = (h.x - geo.cx) / geo.rx
      const ny = (h.y - geo.cy) / geo.ry
      if (Math.hypot(nx, ny) > 0.35) {
        const ang = Math.atan2(ny, nx)
        if (lp.prev !== null) {
          let da = ang - lp.prev
          if (da > Math.PI) da -= TAU
          if (da < -Math.PI) da += TAU
          lp.cum += da
          lp.maxPos = Math.max(lp.maxPos, lp.cum)
          lp.maxNeg = Math.max(lp.maxNeg, -lp.cum)
        }
        lp.prev = ang
      }
      const progress = Math.max(lp.maxPos, lp.maxNeg)
      while (lp.next < GUESTS.length && progress >= ((lp.next + 1) / GUESTS.length) * TAU * 0.9) {
        void checkpoint(lp.next)
        lp.next++
      }
    }
  })

  // ---- The story ----
  const startDrive = () => {
    if (stageRef.current !== 'arrive') return
    setStage('drive')
    setProgress(0, TOTAL)
    void (async () => {
      await speak(P.drive)
    })()
  }
  useEffect(() => {
    void (async () => {
      await wait(350)
      if (!alive()) return
      void ll.current?.play('roar')
      sounds.whoosh()
      const talk = speak(P.arrive)
      for (let i = 0; i < GUESTS.length; i++) {
        await wait(260)
        if (!alive() || skipped.current) return
        appear.current[i] = now()
        setShown(i + 1)
        sounds.note(i)
        sfx.pop()
        void friends.current[i][0]?.play('cheer')
      }
      await Promise.race([talk, wait(2600)])
      if (!alive() || skipped.current) return
      startDrive()
    })()
  }, [])
  const skip = () => {
    if (skipped.current) return
    skipped.current = true
    stopSpeaking()
    const t = now() - 1
    appear.current = appear.current.map((a) => (a < 0 ? t : a))
    setShown(GUESTS.length)
    startDrive()
  }

  const checkpoint = async (i: number) => {
    const guest = GUESTS[i]
    sounds.correct()
    burst()
    for (const f of friends.current[i]) void f?.play('cheer')
    if (i === 0) setWord(PARADE_WORDS.xiexie)
    void ll.current?.play('nod')
    setHintRing(false)
    await speak(guest.line)
    if (!alive()) return
    if (i === 0) setTimeout(() => alive() && setWord(null), 500)
    if (i < GUESTS.length - 1) return
    // A whole lap!
    setProgress(1, TOTAL)
    sounds.sparkle()
    void ll.current?.play('roar')
    await speak(P.lap)
    if (!alive()) return
    await wait(300)
    setStage('drum')
    void speak(P.drum)
  }

  // ---- Drum and gong ----
  const hit = (kind: 'drum' | 'gong') => {
    if (stageRef.current !== 'drum' || drumN >= DRUM_TAPS) return
    const n = drumN + 1
    setDrumN(n)
    wave.current = now()
    sounds.note(Math.min(10, n))
    sfx.thump()
    if (kind === 'gong') sounds.sparkle()
    void ll.current?.play(n % 2 ? 'dance' : 'wiggle')
    friends.current.forEach((fs, i) => setTimeout(() => alive() && fs.forEach((f) => void f?.play('cheer')), 90 * (i + 1)))
    if (n === 4) {
      void ll.current?.play('roar')
      void speak(P.drumMid)
    }
    if (n === DRUM_TAPS) {
      void (async () => {
        burst()
        setProgress(2, TOTAL)
        await wait(700)
        if (!alive()) return
        await speak(P.drumDone)
        if (!alive()) return
        setStage('sky')
        await speak(P.sky)
      })()
    }
  }
  useEffect(() => {
    if (stage !== 'drum') return
    const id = setInterval(() => setBeat((b) => b + 1), 900)
    return () => clearInterval(id)
  }, [stage])

  // ---- Fireworks ----
  const skyTap = (e: RPointerEvent<HTMLButtonElement>) => {
    if (stageRef.current !== 'sky' || skyN >= SKY_TAPS) return
    const r = box.current!.getBoundingClientRect()
    const n = skyN + 1
    setSkyN(n)
    sfx.fwip()
    fw.current?.bloom(e.clientX - r.left, e.clientY - r.top, FIRE[(n - 1) % FIRE.length])
    if (n === SKY_TAPS) {
      void (async () => {
        setProgress(3, TOTAL)
        await wait(1100)
        if (!alive()) return
        void ll.current?.play('roar')
        await speak(P.skyFact)
        if (!alive()) return
        await wait(200)
        setStage('flag')
        await speak(P.flag)
      })()
    }
  }
  const onBoom = () => {
    sfx.crack()
    sfx.thump()
    sounds.sparkle()
  }

  // ---- Flag ----
  const raiseFlag = async () => {
    if (stageRef.current !== 'flag' || raised) return
    setRaised(true)
    sounds.whoosh()
    for (let i = 0; i < 4; i++) setTimeout(() => alive() && sfx.fwip(), i * 500)
    const talk = speak(P.flagFact)
    await wait(2300)
    sounds.sparkle()
    burst()
    setProgress(4, TOTAL)
    await Promise.race([talk, wait(4500)])
    if (!alive()) return
    await wait(400)
    setStage('envelope')
    setWord(PARADE_WORDS.hongbao)
    await speak(P.envelope)
  }

  // ---- The red envelope ----
  const openEnvelope = async () => {
    if (stageRef.current !== 'envelope' || opened) return
    setOpened(true)
    sounds.pop()
    sounds.fanfare()
    bigCelebration()
    void bao.current?.play('cheer')
    setWord(PARADE_WORDS.xinnian)
    setProgress(5, TOTAL)
    await wait(500)
    const talk = speak(P.greet)
    await Promise.race([talk, wait(4500)])
    if (!alive()) return
    await wait(700)
    if (finished.current) return
    finished.current = true
    onDone()
  }

  // ---- Dragging the head ----
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (stageRef.current !== 'drive') return
    const r = box.current!.getBoundingClientRect()
    const h = head.current
    drag.current = { id: e.pointerId, dx: h.x - (e.clientX - r.left), dy: h.y - (e.clientY - r.top), moved: 0, sx: e.clientX, sy: e.clientY }
    target.current = { x: h.x, y: h.y }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* pointer already gone */
    }
    setHintRing(false)
    void ll.current?.play('roar')
    sounds.pop()
  }
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const r = box.current!.getBoundingClientRect()
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.sx, e.clientY - d.sy))
    target.current = { x: e.clientX - r.left + d.dx, y: e.clientY - r.top + d.dy }
  }
  const up = (e: RPointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null
  }

  // ---- Layout of the show props ----
  const drumSize = g ? clamp(Math.min(g.W * 0.27, (g.plazaTop - g.topPad) * 0.85, 190), 88, 190) : 100
  const drumY = g ? Math.max(g.plazaTop, g.topPad + drumSize * 0.5 + 34) : 0
  const gongSize = drumSize * 0.8
  const dragonOut = stage === 'envelope'
  const fwid = g ? clamp(g.W * 0.24, 116, 250) : 150
  const poleX = g ? g.W - Math.max(22, g.W * 0.035) : 0
  const poleTop = g ? g.topPad + 8 : 0
  const poleBase = g ? g.plazaTop + (g.H - g.plazaTop) * 0.34 : 0
  const flagRest = g ? poleBase - fwid / 2 - 8 : 0
  const flagTop = g ? poleTop + 6 : 0
  const envH = g ? clamp(Math.min(g.H * 0.3, g.W * 0.3), 110, 300) : 160
  const baoH = g ? clamp(Math.min(g.H * 0.4, g.W * 0.36), 130, 380) : 200

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', touchAction: 'none', backgroundColor: '#3B2C7A', backgroundImage: `url(${g && g.W > g.H ? art.bgParade : art.bgParadeTall})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>
      {/* the prompt */}
      <div style={{ position: 'absolute', top: 'var(--top-clear)', left: g?.short ? 296 : 0, right: g?.short ? 12 : 0, display: 'flex', justifyContent: "center", zIndex: 3000, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PromptBubble text={prompt} speak={false} />
        </div>
      </div>
      <ParadeCard word={word} top={g ? g.topPad + 6 : 0} />

      {g && (
        <>
          {/* the loop of lanterns to follow */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none', opacity: stage === 'drive' || stage === 'arrive' ? 1 : 0, transition: 'opacity 0.8s' }}>
            <svg width={g.W} height={g.H} style={{ position: 'absolute', inset: 0 }}>
              <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill="none" stroke="#FFE9A8" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />
            </svg>
            {Array.from({ length: N_DOTS }, (_, j) => {
              const a = (j / N_DOTS) * TAU
              const s = g.head * 0.2
              return (
                <motion.div
                  key={j}
                  animate={lit[j] ? { scale: [1, 1.5, 1.2], opacity: 1 } : { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
                  transition={lit[j] ? { duration: 0.4 } : { repeat: Infinity, duration: 1.6, delay: (j % 5) * 0.2 }}
                  style={{ position: 'absolute', left: g.cx + g.rx * Math.cos(a) - s / 2, top: g.cy + g.ry * Math.sin(a) - s / 2, width: s, height: s, borderRadius: '50%', background: lit[j] ? 'radial-gradient(circle, #fff 10%, #FF7FB0 45%, #FF4F8B 100%)' : 'radial-gradient(circle, #FFF6C8 20%, #FFD04A 60%, #E8A82A 100%)', boxShadow: lit[j] ? '0 0 22px 8px rgba(255,127,176,0.8)' : '0 0 14px 4px rgba(255,208,74,0.65)', border: `2px solid ${INK}` }}
                />
              )
            })}
          </div>

          {/* the body: seven friends under seven cloth segments */}
          {GUESTS.map((guest, i) => (
            <div key={guest.id} ref={(el) => { segEls.current[i] = el }} style={{ position: 'absolute', left: 0, top: 0, width: g.segW, height: g.segW, transformOrigin: '50% 86%', transform: 'scale(0)', pointerEvents: 'none', willChange: 'transform', visibility: shown > i ? 'visible' : 'hidden', opacity: dragonOut ? 0 : 1, transition: 'opacity 0.6s' }}>
              <div ref={(el) => { friendEls.current[i] = el }} style={{ position: 'absolute', left: '50%', bottom: g.segW * 0.08, width: 0, height: g.segW * 1.15, transform: 'translateX(-50%)', transformOrigin: '50% 100%', zIndex: 1 }}>
                {guest.riders.map((r, k) => (
                  <div key={r.who} style={{ position: 'absolute', left: r.dx * g.segW, bottom: 0, transform: 'translateX(-50%)', height: g.segW * 1.15 * r.scale, zIndex: r.who === 'mouse' ? 3 : 1 }}>
                    <Friend
                      ref={(h) => {
                        friends.current[i][k] = h
                      }}
                      who={r.who}
                      height={`${g.segW * 1.15 * r.scale}px`}
                    />
                  </div>
                ))}
              </div>
              <img src={art.dragonSegment} alt="" draggable={false} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 2 }} />
            </div>
          ))}

          {/* the head: drag me */}
          <div
            ref={headEl}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            style={{ position: 'absolute', left: 0, top: 0, width: g.head * 1.16, height: g.head * 1.16, touchAction: 'none', cursor: stage === 'drive' ? 'grab' : 'default', pointerEvents: stage === 'drive' ? 'auto' : 'none', opacity: dragonOut ? 0 : 1, transition: 'opacity 0.6s', willChange: 'transform', zIndex: 40 }}
          >
            {stage === 'drive' && hintRing && (
              <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.9, 0.3, 0.9] }} transition={{ repeat: Infinity, duration: 1.3 }} style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '6px dashed #FFE9A8', pointerEvents: 'none' }} />
            )}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <LongLong ref={ll} height={`${g.head * 1.16}px`} />
            </div>
          </div>

          <Fireworks ref={fw} onBoom={onBoom} />

          {/* drum and gong: in the middle of the loop while the dragon parades around them */}
          <AnimatePresence>
            {stage === 'drum' && (
              <motion.div key="drums" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ position: 'absolute', left: g.cx, top: drumY, transform: "translate(-50%, -50%)", zIndex: 20 + Math.round(drumY + drumSize * 0.5), display: 'flex', alignItems: 'center', gap: drumSize * 0.12 }}>
                <div style={{ position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)', display: 'flex', gap: 8, paddingBottom: 6 }}>
                  {Array.from({ length: DRUM_TAPS }, (_, k) => (
                    <motion.div key={k} animate={{ scale: k < drumN ? [1, 1.5, 1] : 1 }} style={{ width: Math.max(12, drumSize * 0.13), height: Math.max(12, drumSize * 0.13), borderRadius: '50%', background: k < drumN ? '#FFD04A' : 'rgba(255,255,255,0.4)', border: `2px solid ${INK}` }} />
                  ))}
                </div>
                <motion.button
                  aria-label="Drum"
                  onPointerDown={() => hit('drum')}
                  whileTap={{ scale: 0.9, y: 4 }}
                  style={{ position: 'relative', width: drumSize, height: drumSize, padding: 0, background: 'none', border: 'none', touchAction: 'manipulation' }}
                >
                  <motion.div key={beat} initial={{ scale: 0.8, opacity: 0.8 }} animate={{ scale: 1.35, opacity: 0 }} transition={{ duration: 0.8 }} style={{ position: 'absolute', inset: '8%', borderRadius: '50%', border: '6px solid #FFE9A8', pointerEvents: 'none' }} />
                  <img src={art.drum} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                </motion.button>
                <motion.button aria-label="Gong" onPointerDown={() => hit('gong')} whileTap={{ scale: 0.9, rotate: 4 }} style={{ width: gongSize, height: gongSize, padding: 0, background: 'none', border: 'none', touchAction: 'manipulation' }}>
                  <GongArt size={gongSize} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* fireworks: tap anywhere */}
          {stage === 'sky' && skyN < SKY_TAPS && (
            <>
              <button aria-label="Fireworks" onPointerDown={skyTap} style={{ position: 'absolute', left: 0, right: 0, top: g.topPad, bottom: 0, zIndex: 2000, background: 'transparent', border: 'none', touchAction: 'manipulation' }} />
              {skyN === 0 && (
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ position: 'absolute', left: g.cx, top: g.topPad + (g.plazaTop - g.topPad) * 0.45, transform: 'translate(-50%, -50%)', fontSize: 64, zIndex: 2001, pointerEvents: 'none' }}>
                  ✨
                </motion.div>
              )}
            </>
          )}

          {/* the flag on its pole */}
          {(stage === 'flag' || stage === 'envelope') && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: stage === 'envelope' ? 0 : 1 }} transition={{ duration: 0.6 }} style={{ position: 'absolute', inset: 0, zIndex: 2000, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: poleX - 5, top: poleTop, width: 10, height: poleBase - poleTop, background: 'linear-gradient(90deg, #C98A52, #8A5530)', border: `3px solid ${INK}`, borderRadius: 6 }} />
              <div style={{ position: 'absolute', left: poleX - 14, top: poleTop - 12, width: 28, height: 28, borderRadius: '50%', background: '#FFD04A', border: `3px solid ${INK}` }} />
              <motion.button
                aria-label="Raise the flag"
                onClick={() => void raiseFlag()}
                animate={{ top: raised ? flagTop : flagRest }}
                transition={{ duration: 2.3, ease: 'easeInOut' }}
                style={{ position: 'absolute', left: poleX - fwid - 2, top: flagRest, width: fwid, padding: 0, background: 'none', border: 'none', pointerEvents: stage === 'flag' && !raised ? 'auto' : 'none', touchAction: 'manipulation' }}
              >
                <motion.div animate={raised ? { rotate: [0, -2, 2, 0] } : { scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: raised ? 1.2 : 1.1 }} style={{ transformOrigin: '100% 50%', filter: raised ? undefined : 'drop-shadow(0 0 14px rgba(255,220,120,0.9))' }}>
                  <Flag id="china" width="100%" />
                </motion.div>
              </motion.button>
            </motion.div>
          )}

          {/* Bao Bao and the red envelope */}
          {stage === 'envelope' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, zIndex: 2100, background: 'rgba(40, 14, 70, 0.32)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'min(4vw, 40px)', padding: `${g.topPad + 20}px 16px ${g.short ? 16 : Math.max(24, g.H * 0.12)}px` }}>
              <motion.div initial={{ x: -120, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', bounce: 0.4 }} style={{ height: baoH, alignSelf: 'flex-end' }}>
                <Friend ref={bao} who="baobao" height={`${baoH}px`} />
              </motion.div>
              <div style={{ position: 'relative', alignSelf: 'center', width: envH * 0.8, height: envH }}>
                <AnimatePresence>
                  {opened && (
                    <motion.div key="card" initial={{ y: 0, scale: 0.3, opacity: 0 }} animate={{ y: -envH * 0.45, scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }} style={{ position: 'absolute', left: '8%', right: '8%', top: 0, height: envH * 0.9, borderRadius: 18, background: 'linear-gradient(#FFF3C4, #FFD04A)', border: `5px solid ${INK}`, display: 'grid', placeItems: 'center', fontSize: envH * 0.42, fontWeight: 700, color: '#E8504F', fontFamily: '"PingFang SC", "Hiragino Sans GB", "Noto Sans SC", sans-serif', zIndex: 1 }}>
                      福
                    </motion.div>
                  )}
                </AnimatePresence>
                <motion.button
                  aria-label="Open the red envelope"
                  onClick={() => void openEnvelope()}
                  animate={opened ? { y: envH * 0.25, rotate: 6, scale: 0.92 } : { rotate: [-4, 4, -4], y: [0, -8, 0], scale: [1, 1.05, 1] }}
                  transition={opened ? { type: 'spring', bounce: 0.4 } : { repeat: Infinity, duration: 1.4 }}
                  style={{ position: 'absolute', inset: 0, padding: 0, background: 'none', border: 'none', zIndex: 2, filter: opened ? undefined : 'drop-shadow(0 0 16px rgba(255,220,120,0.95))', touchAction: 'manipulation' }}
                >
                  <img src={art.redEnvelope} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* arrival: tap anywhere to skip */}
          {stage === 'arrive' && (
            <button aria-label="Skip" onClick={skip} style={{ position: 'absolute', inset: 0, zIndex: 3100, background: 'transparent', border: 'none', touchAction: 'manipulation' }} />
          )}
        </>
      )}
      {/* keep the spoken text findable for tests and Dad */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>{lineText(prompt)}</span>
    </div>
  )
}
