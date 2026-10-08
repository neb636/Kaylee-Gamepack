// Mount Etna, one straight-on side-view camera: the whole volcano from the lemon trees by the beach to the snowy top.
//   1. Climb: drag Nino up the zig-zag trail (he follows her finger along it; a tap walks him a few steps). A big
//      thermometer drops as they climb: hot by the lemons, cooler in the forest, cold in the snow. Nino gets a scarf.
//   2. Pack the snow: drag five snowballs into his baskets (counting). Etna puffs a friendly cloud.
//   3. Zoom down: tap Nino and he slides all the way down to the beach. Wheee!
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Buddy, burst, Piece, PlayArea, say, sounds, Target, useAlive, usePointerDrag, wait, type Line, type PointerDragOptions, type PuppetHandle } from '../../../../../sdk'
import { art } from '../../art'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { PromptRow, useCover } from '../scene'
import { fx } from '../synth'

const E = L.etna
type Pt = { x: number; y: number }
/** The trail in each picture (fractions of the picture), from the beach to the snow line at the top. */
const PATHS: Record<'wide' | 'tall', Pt[]> = {
  wide: [
    { x: 0.66, y: 0.86 },
    { x: 0.45, y: 0.74 },
    { x: 0.68, y: 0.62 },
    { x: 0.4, y: 0.52 },
    { x: 0.62, y: 0.43 },
    { x: 0.45, y: 0.36 },
    { x: 0.54, y: 0.3 },
  ],
  tall: [
    { x: 0.72, y: 0.79 },
    { x: 0.45, y: 0.7 },
    { x: 0.75, y: 0.6 },
    { x: 0.3, y: 0.5 },
    { x: 0.62, y: 0.42 },
    { x: 0.4, y: 0.36 },
    { x: 0.52, y: 0.305 },
  ],
}
/** Where the crater's smoke puffs out. */
const CRATER: Record<'wide' | 'tall', Pt> = { wide: { x: 0.53, y: 0.15 }, tall: { x: 0.53, y: 0.17 } }
/** Where the trail turns cooler (into the forest), then cold (the lava rocks and snow), as a fraction of the way up. */
const ZONES: Record<'wide' | 'tall', [number, number]> = { wide: [0.3, 0.84], tall: [0.36, 0.84] }
const SNOWBALLS = 5
/** Nino's height on short phone-landscape screens. */
const SHORT_NINO = 76

function lengths(pts: Pt[]) {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y))
  const total = seg.reduce((a, b) => a + b, 0)
  return { seg, total }
}
/** The point `s` (0..1) of the way along the trail. */
function along(pts: Pt[], s: number): Pt {
  const { seg, total } = lengths(pts)
  let d = Math.max(0, Math.min(1, s)) * total
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i] || i === seg.length - 1) {
      const t = seg[i] ? Math.min(1, d / seg[i]) : 0
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t }
    }
    d -= seg[i]
  }
  return pts[pts.length - 1]
}
/** How far along the trail the point nearest to `p` is (0..1). */
function nearest(pts: Pt[], p: Pt): number {
  const { seg, total } = lengths(pts)
  let best = 0
  let bestD = Infinity
  let acc = 0
  for (let i = 0; i < seg.length; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const vx = b.x - a.x
    const vy = b.y - a.y
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy || 1)))
    const d = Math.hypot(a.x + vx * t - p.x, a.y + vy * t - p.y)
    if (d < bestD) {
      bestD = d
      best = (acc + seg[i] * t) / total
    }
    acc += seg[i]
  }
  return best
}

export function Mountain({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const cover = useCover(0.5)
  const { box, W, H, landscape } = cover
  // On short phone-landscape screens the whole trail can't fit under the top bar at full width, so the volcano shrinks to
  // fit (a soft blurred copy fills the sides) and the summit stays clear of the home button and stars.
  const short = landscape && H > 0 && H < 560
  const bh = short ? Math.min(cover.bh, (H - 100 - SHORT_NINO * 1.15) / 0.6) : cover.bh
  const bw = short ? bh * 1.5 : cover.bw
  const ox = short ? (W - bw) / 2 : cover.ox
  const oy = short ? H - bh * 0.9 : cover.oy
  const alive = useAlive()
  const nino = useRef<PuppetHandle>(null)
  const key = landscape ? 'wide' : 'tall'
  const path = PATHS[key]
  const s = useMotionValue(0)
  const sRef = useRef(0)
  // Nino's spot on screen, recomputed when the trail moves (after layout, on rotation) as well as when he walks.
  const nx = useMotionValue(0)
  const ny = useMotionValue(0)
  const geo = useRef({ path, bw, bh })
  geo.current = { path, bw, bh }
  const place = (v: number) => {
    const g = geo.current
    const p = along(g.path, v)
    nx.set(p.x * g.bw)
    ny.set(p.y * g.bh)
  }
  useEffect(() => place(sRef.current), [bw, bh, key])
  // Nino faces the way he's walking.
  const [facing, setFacing] = useState(1)
  const zones = ZONES[key]
  const temp = useTransform(s, [0, zones[0], zones[1], 1], [0.92, 0.6, 0.3, 0.1])
  const tempH = useTransform(temp, (t) => `${t * 100}%`)
  const tempC = useTransform(temp, [0.1, 0.5, 0.92], ['#6EC3E6', '#FFC83D', '#E8574F'])

  const [phase, setPhase] = useState<'climb' | 'pack' | 'zoom' | 'down'>('climb')
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [zone, setZone] = useState(0)
  const zoneRef = useRef(0)
  const [packed, setPacked] = useState(0)
  const [puffs, setPuffs] = useState(0)
  const moved = useRef(false)

  useEffect(() => {
    void (async () => {
      await wait(300)
      if (!alive()) return
      void nino.current?.play('wiggle')
      await say(E.hot)
      if (!alive()) return
      setPrompt({ text: E.climb, speak: true })
    })()
  }, [])

  const setS = (v: number) => {
    const prev = sRef.current
    sRef.current = v
    s.set(v)
    place(v)
    const a = along(path, prev)
    const b = along(path, v)
    if (Math.abs(b.x - a.x) > 0.002) setFacing(b.x > a.x ? 1 : -1)
    const z = v >= zones[1] ? 2 : v >= zones[0] ? 1 : 0
    if (z > zoneRef.current) {
      zoneRef.current = z
      setZone(z)
      void enterZone(z)
    }
    if (v >= 0.995 && phaseRef.current === 'climb') void reachTop()
  }

  const enterZone = async (z: number) => {
    onStep()
    sounds.correct()
    void nino.current?.play(z === 2 ? 'wiggle' : 'nod')
    await say(z === 1 ? E.cool : E.cold, { interrupt: false })
    if (!alive()) return
    if (z === 2) {
      sounds.sparkle()
      void say(E.scarf, { interrupt: false })
    }
  }

  const reachTop = async () => {
    setPhase('pack')
    setPrompt(null)
    void nino.current?.play('cheer')
    burst()
    await wait(600)
    if (!alive()) return
    await say(E.higher)
    if (!alive()) return
    setPrompt({ text: E.pack, speak: true })
  }

  // Dragging Nino along the trail.
  const ninoDrag: PointerDragOptions = {
    threshold: 4,
    onStart: () => {
      if (phaseRef.current !== 'climb') return
      sounds.pickup()
      setPrompt(null)
    },
    onMove: (i) => {
      if (phaseRef.current !== 'climb') return
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      const p = { x: (i.x - r.left - ox) / bw, y: (i.y - r.top - oy) / bh }
      const n = nearest(path, p)
      // Only forward, and never jumping far ahead of his hooves.
      if (n > sRef.current) setS(Math.min(n, sRef.current + 0.08))
      if (!moved.current && sRef.current > 0.04) moved.current = true
    },
    onEnd: () => {
      if (phaseRef.current === 'climb' && sRef.current < 0.995) setPrompt({ text: E.climbHint, speak: false })
    },
    onTap: () => {
      if (phaseRef.current === 'climb') {
        void nino.current?.play('jump')
        void animate(sRef.current, Math.min(1, sRef.current + 0.15), { duration: 0.7, onUpdate: (v) => setS(v) })
      } else if (phaseRef.current === 'zoom') void zoom()
      else void tickle()
    },
  }

  const tickles = useRef(0)
  const tickle = () => {
    sounds.pop()
    void nino.current?.play('wiggle')
    void say(L.tickle.nino[tickles.current++ % L.tickle.nino.length])
  }

  const pack = async () => {
    const n = packed + 1
    setPacked(n)
    fx.scrunch()
    sounds.place()
    void nino.current?.play('nod')
    void say(E.count[n - 1])
    if (n === 2) {
      setPuffs((p) => p + 1)
      fx.puff()
      await wait(700)
      if (!alive()) return
      void say(E.puff, { interrupt: false })
    }
    if (n < SNOWBALLS) return
    onStep()
    await wait(800)
    if (!alive()) return
    setPuffs((p) => p + 1)
    fx.puff()
    await say(E.tallest)
    if (!alive()) return
    void nino.current?.play('cheer')
    await say(E.full)
    if (!alive()) return
    setPhase('zoom')
    setPrompt({ text: E.zoom, speak: true })
  }

  const zoom = async () => {
    if (phaseRef.current !== 'zoom') return
    setPhase('down')
    setPrompt(null)
    onStep()
    void say(E.wheee)
    fx.slide(1.8)
    void nino.current?.play('jump')
    await animate(sRef.current, 0, { duration: 1.8, ease: 'easeIn', onUpdate: (v) => setS(v) })
    if (!alive()) return
    burst()
    await wait(500)
    if (!alive()) return
    onDone()
  }

  const nh = short ? SHORT_NINO : Math.max(110, Math.min(bh * (landscape ? 0.17 : 0.11), 210))
  const ball = short ? 66 : Math.max(88, nh * 0.55)
  const top = along(path, 1)
  const pts = path.map((p) => `${p.x * bw},${p.y * bh}`).join(' ')
  const crater = CRATER[key]
  const next = along(path, Math.min(1, sRef.current + 0.12))

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#A8DCFF' }}>
      {short && <div aria-hidden style={{ position: 'absolute', inset: -20, background: `url(${art.bgEtna}) center / cover`, filter: 'blur(10px)', opacity: 0.8 }} />}
      {W > 0 && (
        <PlayArea style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgEtna : art.bgEtnaTall}) center / 100% 100%` }}>
          {/* The trail. */}
          <svg width={bw} height={bh} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <polyline points={pts} fill="none" stroke={INK} strokeWidth={Math.max(16, nh * 0.2)} strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
            <polyline points={pts} fill="none" stroke="#E9CFA8" strokeWidth={Math.max(10, nh * 0.14)} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pts} fill="none" stroke="#C98B5B" strokeWidth="4" strokeDasharray="2 18" strokeLinecap="round" />
          </svg>
          {/* Smoke puffs from the crater. */}
          {Array.from({ length: puffs }, (_, i) => (
            <motion.div key={i} aria-hidden initial={{ scale: 0.2, opacity: 0.9, y: 0 }} animate={{ scale: 2.4, opacity: 0, y: -nh * 1.2 }} transition={{ duration: 3, ease: 'easeOut' }} style={{ position: 'absolute', left: crater.x * bw - nh * 0.4, top: crater.y * bh - nh * 0.4, width: nh * 0.8, height: nh * 0.6, borderRadius: '50%', background: '#EDE6F2', border: `4px solid ${INK}`, pointerEvents: 'none', zIndex: 1 }} />
          ))}
          {/* Where to go next. */}
          {phase === 'climb' && (
            <motion.div aria-hidden animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.1 }} style={{ position: 'absolute', left: next.x * bw - 22, top: next.y * bh - 22, width: 44, height: 44, borderRadius: '50%', background: '#FFE27A', border: `4px solid ${INK}`, pointerEvents: 'none', zIndex: 2 }} />
          )}

          {/* Snowballs to pack, on the snow by the top. */}
          {phase === 'pack' &&
            Array.from({ length: SNOWBALLS - packed }, (_, i) => {
              const k = packed + i
              const side = k % 2 ? 1 : -1
              const x = top.x * bw + side * (nh * 0.95 + Math.floor(k / 2) * ball * 0.7) + (landscape ? 0 : side * -ball * 0.2)
              const y = top.y * bh + ball * 0.2 + (k % 3) * ball * 0.18
              return (
                <Piece key={k} id={`snow${k}`} label="Snow" snapTo="nino" snapRadius={nh} onPickUp={() => sounds.pickup()} onPlace={({ target }) => (target === 'nino' ? (void pack(), 'reset') : 'home')} onTap={() => void pack()} style={{ position: 'absolute', left: Math.max(-ox + 8, Math.min(W - ox - ball - 8, x - ball / 2)), top: y - ball / 2, width: ball, height: ball, zIndex: 6 }}>
                  <img src={art.snowPile} alt="" draggable={false} style={{ width: '100%', height: '100%', display: 'block' }} />
                </Piece>
              )
            })}

          {/* Nino. */}
          <motion.div style={{ position: 'absolute', left: 0, top: 0, x: nx, y: ny, zIndex: 5 }}>
            {phase === 'pack' && <Target id="nino" style={{ position: 'absolute', left: -nh * 0.7, top: -nh * 1.05, width: nh * 1.4, height: nh * 1.15, borderRadius: '40%' }} />}
            <DragHandle drag={ninoDrag} label="Nino" className={phase === 'climb' || phase === 'zoom' ? 'world-glow' : undefined} style={{ position: 'absolute', left: -nh * 0.6, top: -nh * 0.95, width: nh * 1.2, height: nh, borderRadius: '45%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', cursor: 'grab' }}>
              <Buddy ref={nino} img={art.nino} voice="nino" height={`${nh}px`} flip={facing < 0} />
              <AnimatePresence>
                {zone === 2 && (
                  <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} style={{ position: 'absolute', left: facing > 0 ? '58%' : '18%', top: '30%', fontSize: nh * 0.32, pointerEvents: 'none' }}>
                    🧣
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Snow piling up in his baskets. */}
              {packed > 0 && (
                <div aria-hidden style={{ position: 'absolute', left: '50%', top: '36%', translate: '-50% 0', display: 'flex', gap: 2, pointerEvents: 'none' }}>
                  {Array.from({ length: packed }, (_, i) => (
                    <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: nh * 0.14, height: nh * 0.12, borderRadius: '50%', background: '#E6F2FF', border: `3px solid ${INK}` }} />
                  ))}
                </div>
              )}
            </DragHandle>
          </motion.div>
        </PlayArea>
      )}

      {/* The thermometer. */}
      <div aria-hidden style={{ position: 'absolute', left: landscape ? 18 : 14, top: 'calc(var(--top-clear) + 90px)', bottom: 'calc(var(--safe-bottom) + 24px)', width: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30, pointerEvents: 'none', maxHeight: 420 }}>
        <div style={{ fontSize: 30 }}>🌞</div>
        <div style={{ position: 'relative', flex: 1, width: 30, background: '#FFF7F0', border: `5px solid ${INK}`, borderRadius: 18, overflow: 'hidden', margin: '4px 0 -8px' }}>
          <motion.div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: tempH, background: tempC }} />
        </div>
        <motion.div style={{ width: 52, height: 52, borderRadius: '50%', background: tempC, border: `5px solid ${INK}` }} />
        <div style={{ fontSize: 30, marginTop: 2 }}>❄️</div>
      </div>
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

/** A real button that can be dragged. It owns its ref, so the drag hooks up when it first appears (after layout). */
function DragHandle({ drag, label, className, style, children }: { drag: PointerDragOptions; label: string; className?: string; style: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null)
  usePointerDrag(ref, drag)
  return (
    <button ref={ref} aria-label={label} className={className} style={{ touchAction: 'none', background: 'none', border: 'none', padding: 0, ...style }}>
      {children}
    </button>
  )
}
