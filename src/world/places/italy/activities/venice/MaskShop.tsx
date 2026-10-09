// The side verb: a Carnevale mask at Gino's mask shop. She paints with her finger and every stroke is mirrored onto the
// other half (symmetry by doing), then presses gems on and each gets a twin. No target pattern; a check button when
// she likes it. Her mask is saved, and Sparkle wears it at the finale (MaskView).
import { motion } from 'motion/react'
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { BigButton, sounds } from '../../../../../sdk'
import { sfx } from '../../../../kit/sfx'
import { PromptBubble } from '../../../../kit/Stage'
import { L } from '../../lines'
import { INK } from '../../puppets/ink'

const V = L.venice
const W = 600
const H = 320
/** A Colombina half-mask, symmetric about x = 300, with two eye holes (even-odd). */
const MASK = 'M300 74 C340 40 420 28 500 48 C562 64 592 112 582 162 C572 214 520 254 450 254 C390 254 340 224 300 204 C260 224 210 254 150 254 C80 254 28 214 18 162 C8 112 38 64 100 48 C180 28 260 40 300 74 Z'
const EYES = 'M128 150 C140 112 230 108 252 144 C240 182 150 190 128 150 Z M472 150 C460 112 370 108 348 144 C360 182 450 190 472 150 Z'

export const PAINTS = [
  { id: 'pink', color: '#FF8FB8' },
  { id: 'lavender', color: '#B9A6F5' },
  { id: 'mint', color: '#8FE3C8' },
  { id: 'sky', color: '#6EC3E6' },
  { id: 'gold', color: '#FFC83D' },
  { id: 'glitter', color: '#F2B872' },
] as const
const GEMS = [
  { id: 'heart', color: '#FF4F9A' },
  { id: 'diamond', color: '#6EC3E6' },
  { id: 'pearl', color: '#FFF7F0' },
] as const

export interface MaskData {
  strokes: { c: string; glitter?: boolean; d: string }[]
  gems: { kind: string; x: number; y: number }[]
}

const pathOf = (pts: [number, number][]) => (pts.length === 1 ? `M${pts[0][0]} ${pts[0][1]} l0.1 0` : `M${pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L')}`)

function Gem({ kind, x, y, size = 26 }: { kind: string; x: number; y: number; size?: number }) {
  const g = GEMS.find((k) => k.id === kind) ?? GEMS[0]
  const s = size
  return (
    <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth="4" strokeLinejoin="round">
      {kind === 'heart' && <path fill={g.color} d={`M0 ${s * 0.7} C${-s * 1.2} ${-s * 0.1} ${-s * 0.6} ${-s * 0.9} 0 ${-s * 0.35} C${s * 0.6} ${-s * 0.9} ${s * 1.2} ${-s * 0.1} 0 ${s * 0.7}Z`} />}
      {kind === 'diamond' && <path fill={g.color} d={`M0 ${-s * 0.8} L${s * 0.7} 0 L0 ${s * 0.8} L${-s * 0.7} 0Z`} />}
      {kind === 'pearl' && <circle r={s * 0.6} fill={g.color} />}
      <circle cx={-s * 0.18} cy={-s * 0.2} r={s * 0.14} fill="#fff" stroke="none" />
    </g>
  )
}

/** The mask drawing (shared by the shop and the finale). Every stroke and gem also drawn mirrored. */
export function MaskView({ data, live, width = '100%' }: { data: MaskData; live?: { c: string; glitter?: boolean; d: string } | null; width?: string }) {
  const strokes = live ? [...data.strokes, live] : data.strokes
  const both = (child: ReactNode) => (
    <>
      {child}
      <g transform={`translate(${W} 0) scale(-1 1)`}>{child}</g>
    </>
  )
  return (
    <svg viewBox={`-10 0 ${W + 20} ${H}`} style={{ width, display: 'block', overflow: 'visible' }}>
      <defs>
        <clipPath id="venice-mask-clip">
          <path d={`${MASK} ${EYES}`} clipRule="evenodd" />
        </clipPath>
      </defs>
      {/* Ribbon ties at the sides */}
      <path d="M22 160 C-10 170 -6 220 -18 250 M578 160 C610 170 606 220 618 250" fill="none" stroke="#FF4F9A" strokeWidth="10" strokeLinecap="round" />
      <path d={`${MASK} ${EYES}`} fillRule="evenodd" fill="#FFF7F0" />
      <g clipPath="url(#venice-mask-clip)">
        {both(
          strokes.map((s, i) => (
            <g key={i}>
              <path d={s.d} fill="none" stroke={s.c} strokeWidth="46" strokeLinecap="round" strokeLinejoin="round" />
              {s.glitter && <path d={s.d} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray="0.1 24" />}
            </g>
          )),
        )}
      </g>
      <path d={`${MASK} ${EYES}`} fillRule="evenodd" fill="none" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      {both(data.gems.map((g, i) => <Gem key={i} kind={g.kind} x={g.x} y={g.y} />))}
    </svg>
  )
}

export function MaskShop({ onDone, saved }: { onDone: (m: MaskData) => void; saved?: MaskData | null }) {
  const [step, setStep] = useState<'paint' | 'gems'>('paint')
  const [data, setData] = useState<MaskData>(saved ?? { strokes: [], gems: [] })
  const [paint, setPaint] = useState<(typeof PAINTS)[number]>(PAINTS[0])
  const [gem, setGem] = useState<string>(GEMS[0].id)
  const [live, setLive] = useState<{ c: string; glitter?: boolean; d: string } | null>(null)
  const pts = useRef<[number, number][] | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const raf = useRef(0)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const toMask = (e: PointerEvent) => {
    const r = box.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * (W + 20) - 10, ((e.clientY - r.top) / r.height) * H] as [number, number]
  }
  const down = (e: PointerEvent) => {
    const p = toMask(e)
    if (step === 'gems') {
      if (p[1] < 20 || p[1] > H - 20) return
      setData((d) => ({ ...d, gems: [...d.gems, { kind: gem, x: p[0], y: p[1] }] }))
      sounds.pop()
      return
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    pts.current = [p]
    sfx.fwip()
    setLive({ c: paint.color, glitter: paint.id === 'glitter', d: pathOf(pts.current) })
  }
  const move = (e: PointerEvent) => {
    if (!pts.current) return
    pts.current.push(toMask(e))
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => pts.current && setLive({ c: paint.color, glitter: paint.id === 'glitter', d: pathOf(pts.current) }))
  }
  const up = () => {
    if (!pts.current) return
    const stroke = { c: paint.color, glitter: paint.id === 'glitter', d: pathOf(pts.current) }
    pts.current = null
    cancelAnimationFrame(raf.current)
    setLive(null)
    setData((d) => ({ ...d, strokes: [...d.strokes.slice(-60), stroke] }))
  }

  const enough = step === 'paint' ? data.strokes.length >= 3 : data.gems.length >= 1
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'linear-gradient(#FFF1E4, #FFE3EE)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--top-clear) 16px calc(var(--safe-bottom) + 12px)', gap: 'min(12px, 2vh)', overflow: 'hidden' }}>
      {/* The shop's striped awning along the top. */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 'calc(var(--safe-top) + 40px)', background: 'repeating-linear-gradient(90deg, #E8574F 0 60px, #FFF7F0 60px 120px)', borderBottom: `5px solid ${INK}` }} />
      <PromptBubble text={step === 'paint' ? V.maskPaint : V.maskGems} />
      <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          ref={box}
          aria-label="mask"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          style={{ width: 'min(92vw, 820px, calc((100vh - 300px) * 1.94))', touchAction: 'none', cursor: 'crosshair' }}
        >
          <MaskView data={data} live={live} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'min(14px, 2vw)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 }}>
        {step === 'paint'
          ? PAINTS.map((p) => (
              <motion.button
                key={p.id}
                aria-label={`${p.id} paint`}
                whileTap={{ scale: 0.88 }}
                animate={{ scale: paint.id === p.id ? 1.15 : 1, y: paint.id === p.id ? -6 : 0 }}
                onClick={() => {
                  setPaint(p)
                  sounds.pop()
                }}
                style={{ width: 'var(--target)', height: 'var(--target)', borderRadius: '50%', border: `5px solid ${INK}`, background: p.id === 'glitter' ? `radial-gradient(circle at 30% 30%, #fff 0 8%, transparent 9%), radial-gradient(circle at 70% 60%, #fff 0 7%, transparent 8%), ${p.color}` : p.color, padding: 0 }}
              />
            ))
          : GEMS.map((k) => (
              <motion.button
                key={k.id}
                aria-label={`${k.id} gem`}
                whileTap={{ scale: 0.88 }}
                animate={{ scale: gem === k.id ? 1.15 : 1, y: gem === k.id ? -6 : 0 }}
                onClick={() => {
                  setGem(k.id)
                  sounds.pop()
                }}
                style={{ width: 'var(--target)', height: 'var(--target)', borderRadius: 24, border: `5px solid ${INK}`, background: '#FFF7F0', padding: 0 }}
              >
                <svg viewBox="-40 -40 80 80" style={{ width: '70%' }}>
                  <Gem kind={k.id} x={0} y={0} size={30} />
                </svg>
              </motion.button>
            ))}
        {enough && (
          <BigButton
            color="mint"
            ariaLabel="done"
            onClick={() => {
              sounds.sparkle()
              if (step === 'paint') setStep('gems')
              else onDone(data)
            }}
          >
            ✓
          </BigButton>
        )}
      </div>
    </div>
  )
}
