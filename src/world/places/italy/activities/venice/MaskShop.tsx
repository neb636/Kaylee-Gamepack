// The Carnevale mask shop, one straight-on camera on the shop's back wall. A big blank mask hangs in the middle: she
// paints with her finger and every stroke is mirrored onto the other half (symmetry), then drags gems on (each gem gets
// a mirrored twin). When she taps the check, the mask flies onto Sparkle's face. The mask is saved for the opera finale.
import { getStroke } from 'perfect-freehand'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { BigButton, burst, say, SparklePuppet, sounds, useAlive, useSaved, wait, type Line, type PuppetHandle } from '../../../../../sdk'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'
import { art } from '../../art'
import { PromptRow, useCover } from '../scene'

const V = L.venice
type Pt = [number, number]
export interface MaskData {
  strokes: { color: string; pts: Pt[] }[]
  gems: { kind: GemKind; x: number; y: number }[]
}
type GemKind = 'diamond' | 'heart' | 'pearl' | 'feather'
const COLORS = ['#FF4F9A', '#FFC83D', '#9B7BEA', '#5DBB7A']
const GEMS: GemKind[] = ['diamond', 'heart', 'pearl', 'feather']
const STROKES_NEEDED = 4
const GEMS_NEEDED = 3
/** The mask is drawn in a 400 x 260 box, symmetric around x = 200. */
const MASK_OUTER = 'M200 66 C150 30 66 22 26 70 C2 100 10 170 62 202 C112 228 170 214 200 184 C230 214 288 228 338 202 C390 170 398 100 374 70 C334 22 250 30 200 66 Z'
const EYES = [
  { cx: 122, cy: 122 },
  { cx: 278, cy: 122 },
]

export function strokePath(points: Pt[], size = 26): string {
  const stroke = getStroke(points, { size, thinning: 0.3, smoothing: 0.6, streamline: 0.5 })
  if (stroke.length < 3) return ''
  let d = `M${stroke[0][0].toFixed(1)} ${stroke[0][1].toFixed(1)}`
  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i]
    const [x1, y1] = stroke[(i + 1) % stroke.length]
    d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  return d + ' Z'
}

/** The finished mask (also shown in the opera finale). */
export function MaskArt({ data, live, id = 'mask' }: { data: MaskData; live?: { color: string; pts: Pt[] } | null; id?: string }) {
  const all = live ? [...data.strokes, live] : data.strokes
  return (
    <svg viewBox="0 0 400 260" width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <mask id={`${id}-holes`}>
          <rect x="0" y="0" width="400" height="260" fill="#fff" />
          {EYES.map((e, i) => (
            <ellipse key={i} cx={e.cx} cy={e.cy} rx="44" ry="28" fill="#000" />
          ))}
        </mask>
        <clipPath id={`${id}-clip`}>
          <path d={MASK_OUTER} />
        </clipPath>
      </defs>
      {/* A ribbon behind. */}
      <path d="M26 96 Q-20 120 -10 170 M374 96 Q420 120 410 170" fill="none" stroke="#FF8FB8" strokeWidth="12" strokeLinecap="round" />
      <g mask={`url(#${id}-holes)`}>
        <path d={MASK_OUTER} fill="#FFF7F0" />
        <g clipPath={`url(#${id}-clip)`}>
          {all.map((s, i) => {
            const d = strokePath(s.pts)
            return (
              <g key={i} fill={s.color}>
                <path d={d} />
                <path d={d} transform="translate(400 0) scale(-1 1)" />
              </g>
            )
          })}
        </g>
        <path d={MASK_OUTER} fill="none" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      </g>
      {EYES.map((e, i) => (
        <ellipse key={i} cx={e.cx} cy={e.cy} rx="44" ry="28" fill="none" stroke={INK} strokeWidth="6" />
      ))}
      {data.gems.flatMap((g, i) => [
        <Gem key={`${i}a`} kind={g.kind} x={g.x} y={g.y} />,
        <Gem key={`${i}b`} kind={g.kind} x={400 - g.x} y={g.y} flip />,
      ])}
    </svg>
  )
}

function Gem({ kind, x, y, flip }: { kind: GemKind; x: number; y: number; flip?: boolean }) {
  const t = `translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}`
  if (kind === 'feather') return <image href={art.feather} x={-40} y={-56} width={80} height={80} transform={`${t} rotate(-30)`} />
  if (kind === 'heart') return <path transform={t} d="M0 14 C-22 0 -20 -16 -9 -16 C-3 -16 0 -11 0 -8 C0 -11 3 -16 9 -16 C20 -16 22 0 0 14 Z" fill="#FF4F9A" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
  if (kind === 'pearl')
    return (
      <g transform={t}>
        <circle r="12" fill="#D9CCFF" stroke={INK} strokeWidth="4" />
        <circle cx="-4" cy="-4" r="3.5" fill="#fff" />
      </g>
    )
  return (
    <g transform={t}>
      <path d="M0 -17 L13 0 L0 17 L-13 0 Z" fill="#6EC3E6" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M-4 -6 L0 -11" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </g>
  )
}

export function MaskShop({ onStep, onDone }: { onStep: () => void; onDone: () => void }) {
  const { box, W, H, bw, bh, ox, oy, landscape } = useCover(1)
  const alive = useAlive()
  const sparkle = useRef<PuppetHandle>(null)
  const [, setSaved] = useSaved<MaskData | null>('italy-mask', null)
  const [data, setData] = useState<MaskData>({ strokes: [], gems: [] })
  const [live, setLive] = useState<{ color: string; pts: Pt[] } | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [step, setStep] = useState<'intro' | 'paint' | 'gems' | 'wear' | 'done'>('intro')
  const [prompt, setPrompt] = useState<{ text: Line; speak: boolean } | null>(null)
  const [ghost, setGhost] = useState<{ kind: GemKind; x: number; y: number } | null>(null)
  const svgBox = useRef<HTMLDivElement>(null)
  const drawing = useRef<{ id: number; pts: Pt[] } | null>(null)
  const mirrored = useRef(false)

  useEffect(() => {
    void (async () => {
      await say(V.shop)
      if (!alive()) return
      await say(V.carnival)
      if (!alive()) return
      setStep('paint')
      setPrompt({ text: V.paint, speak: true })
    })()
  }, [])

  /** Client px -> mask units (400 x 260). */
  const toMask = (cx: number, cy: number): Pt | null => {
    const r = svgBox.current?.getBoundingClientRect()
    if (!r) return null
    return [((cx - r.left) / r.width) * 400, ((cy - r.top) / r.height) * 260]
  }
  const onMask = (p: Pt) => {
    // Inside the mask's outline (roughly an ellipse per half), and not in an eye hole.
    const half = p[0] < 200 ? { cx: 110, cy: 130 } : { cx: 290, cy: 130 }
    const inShape = ((p[0] - half.cx) / 112) ** 2 + ((p[1] - half.cy) / 92) ** 2 < 1.15
    const inEye = EYES.some((e) => ((p[0] - e.cx) / 44) ** 2 + ((p[1] - e.cy) / 28) ** 2 < 1)
    return inShape && !inEye
  }

  const down = (e: RPointerEvent) => {
    if (step !== 'paint' && step !== 'gems') return
    const p = toMask(e.clientX, e.clientY)
    if (!p) return
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    drawing.current = { id: e.pointerId, pts: [p] }
    setLive({ color, pts: [p] })
  }
  const move = (e: RPointerEvent) => {
    const d = drawing.current
    if (!d || d.id !== e.pointerId) return
    const p = toMask(e.clientX, e.clientY)
    if (!p) return
    d.pts.push(p)
    setLive({ color, pts: [...d.pts] })
  }
  const up = (e: RPointerEvent) => {
    const d = drawing.current
    if (!d || d.id !== e.pointerId) return
    drawing.current = null
    setLive(null)
    const pts = d.pts.length === 1 ? [d.pts[0], [d.pts[0][0] + 1, d.pts[0][1] + 1] as Pt] : d.pts.filter((_, i) => i % 2 === 0 || i === d.pts.length - 1)
    const next = { ...data, strokes: [...data.strokes, { color, pts: pts.map(([x, y]) => [Math.round(x), Math.round(y)] as Pt) }] }
    setData(next)
    sounds.sparkle()
    if (step !== 'paint') return
    const n = next.strokes.length
    if (n === 1 && !mirrored.current) {
      mirrored.current = true
      setPrompt(null)
      void (async () => {
        await say(V.mirror)
        if (!alive()) return
        await say(V.mirrorWhy)
      })()
    }
    if (n === STROKES_NEEDED) {
      onStep()
      void (async () => {
        await wait(400)
        if (!alive()) return
        setStep('gems')
        setPrompt({ text: V.stickers, speak: true })
      })()
    }
  }

  const placeGem = (kind: GemKind, p: Pt) => {
    const x = p[0] > 200 ? 400 - p[0] : p[0]
    const next = { ...data, gems: [...data.gems, { kind, x: Math.round(x), y: Math.round(p[1]) }] }
    setData(next)
    sounds.place()
    burst()
    const n = next.gems.length
    if (n <= GEMS_NEEDED) void say(V.count[n - 1])
    if (n === GEMS_NEEDED) {
      onStep()
      setPrompt({ text: V.done, speak: false })
      void (async () => {
        await wait(900)
        if (!alive()) return
        void say(V.done)
      })()
    }
  }
  /** Spots for gems she taps instead of dragging (the left half; each gets a mirrored twin). */
  const TAP_SPOTS: Pt[] = [
    [200 - 0, 70],
    [60, 100],
    [120, 180],
    [40, 150],
    [160, 92],
    [96, 72],
  ]

  const gemDown = (kind: GemKind) => (e: RPointerEvent) => {
    if (step !== 'gems') return
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    sounds.pickup()
    setGhost({ kind, x: e.clientX, y: e.clientY })
    const start = { x: e.clientX, y: e.clientY }
    const el = e.currentTarget as HTMLElement
    const onMove = (ev: PointerEvent) => setGhost({ kind, x: ev.clientX, y: ev.clientY })
    const onUp = (ev: PointerEvent) => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      setGhost(null)
      const moved = Math.hypot(ev.clientX - start.x, ev.clientY - start.y) > 12
      const p = toMask(ev.clientX, ev.clientY)
      if (moved && p && onMask(p)) return placeGem(kind, p)
      if (!moved) return placeGem(kind, TAP_SPOTS[data.gems.length % TAP_SPOTS.length])
      sounds.oops()
      void say(V.stickersHint)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
  }

  const finish = async () => {
    if (step !== 'gems' || data.gems.length < GEMS_NEEDED) return
    setStep('wear')
    setPrompt(null)
    setSaved(data)
    sounds.whoosh()
    await say(V.wear)
    if (!alive()) return
    sounds.sparkle()
    burst()
    void sparkle.current?.play('dance')
    await say(V.pretty)
    if (!alive()) return
    await wait(500)
    setStep('done')
    onDone()
  }

  // Layout: the mask big in the middle; colors and gems in a tray along the bottom; Sparkle in the bottom corner.
  const tray = Math.max(88, Math.min(120, Math.min(W, H) * 0.13))
  const maskW = Math.min(W * (landscape ? 0.6 : 0.88), (H - 200 - tray * 1.4) * 1.54)
  const sh = Math.min(H * 0.3, W * 0.3, 280)
  const wearing = step === 'wear' || step === 'done'

  return (
    <div ref={box} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#F7E7DA' }}>
      {W > 0 && <div style={{ position: 'absolute', left: ox, top: oy, width: bw, height: bh, background: `url(${landscape ? art.bgMaskShop : art.bgMaskShopTall}) center / 100% 100%` }} />}

      {/* Sparkle, waiting to try it on. */}
      <div style={{ position: 'absolute', right: landscape ? '3%' : '4%', bottom: tray * 1.25, zIndex: 6 }}>
        <SparklePuppet ref={sparkle} height={`${sh}px`} lookToward={-0.5} flip />
      </div>

      {/* The mask. While painting it's big in the middle; then it flies to Sparkle's face. */}
      {W > 0 && (
        <motion.div
          initial={false}
          animate={wearing ? { left: W - (landscape ? 0.03 * W : 0.04 * W) - sh * 0.62, top: H - tray * 1.25 - sh * 0.8, width: sh * 0.5, rotate: -6 } : { left: (W - maskW) / 2 - (landscape ? W * 0.06 : 0), top: Math.max(H * 0.5 - maskW * 0.33 - tray * 0.4, 150), width: maskW, rotate: 0 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.9 }}
          style={{ position: 'absolute', zIndex: wearing ? 7 : 4 }}
        >
          <div ref={svgBox} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none', position: 'relative' }}>
            <MaskArt data={data} live={live} />
            {step === 'paint' && data.strokes.length === 0 && (
              <motion.div aria-hidden animate={{ x: [-20, 30, -20], y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ position: 'absolute', left: '20%', top: '55%', fontSize: 'clamp(40px, 7vmin, 70px)', pointerEvents: 'none' }}>
                👆
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* The tray: colors while painting, gems after. */}
      <AnimatePresence>
        {(step === 'paint' || step === 'gems') && (
          <motion.div initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }} style={{ position: 'absolute', left: '50%', translate: '-50% 0', bottom: 'calc(var(--safe-bottom) + 10px)', zIndex: 10, display: 'flex', gap: 12, padding: 10, background: 'rgba(255,247,240,.92)', border: `5px solid ${INK}`, borderRadius: 30, boxShadow: 'var(--shadow)' }}>
            {step === 'paint' &&
              COLORS.map((c) => (
                <motion.button key={c} aria-label="Color" whileTap={{ scale: 0.9 }} onClick={() => (sounds.pop(), setColor(c))} style={{ width: tray, height: tray, borderRadius: '50%', background: c, border: `5px solid ${INK}`, boxShadow: c === color ? `0 0 0 6px #fff, 0 0 0 10px ${INK}` : 'none', padding: 0 }} />
              ))}
            {step === 'gems' &&
              GEMS.map((k) => (
                <button key={k} aria-label={k} onPointerDown={gemDown(k)} style={{ width: tray, height: tray, borderRadius: 22, background: '#fff', border: `4px solid ${INK}`, padding: 6, touchAction: 'none' }}>
                  <svg viewBox="-28 -28 56 56" width="100%" height="100%">
                    <Gem kind={k} x={0} y={k === 'feather' ? 6 : 0} />
                  </svg>
                </button>
              ))}
            {step === 'gems' && data.gems.length >= GEMS_NEEDED && (
              <BigButton ariaLabel="Done" color="mint" onClick={() => void finish()}>
                ✔
              </BigButton>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {ghost && (
        <div style={{ position: 'fixed', left: ghost.x - 40, top: ghost.y - 40, width: 80, height: 80, pointerEvents: 'none', zIndex: 80 }}>
          <svg viewBox="-28 -28 56 56" width="100%" height="100%">
            <Gem kind={ghost.kind} x={0} y={0} />
          </svg>
        </div>
      )}
      <PromptRow prompt={prompt} H={H} landscape={landscape} />
    </div>
  )
}

