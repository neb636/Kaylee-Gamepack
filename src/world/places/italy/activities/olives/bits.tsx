// Shared pieces of the Olive Grove: the scene box (one side-on camera, anchored to the background art), olives drawn in
// SVG, the wicker basket that fills up, the tap-to-hear sun, and a little wooden table. Everything is seen straight on
// from the side, like a theater stage: things stand on a ground line with their bottoms touching it.
import { motion } from 'motion/react'
import { useRef, type CSSProperties, type ReactNode } from 'react'
import { PlayArea, useElementSize, useLandscape, type Line } from '../../../../../sdk'
import { PromptBubble } from '../../../../kit/Stage'
import { INK } from '../../puppets/ink'
import { WordCard, type WordId } from '../../WordCard'

export type OliveColor = 'green' | 'purple' | 'black'
export const OLIVE: Record<OliveColor, { fill: string; shade: string; shine: string }> = {
  green: { fill: '#9DAA4E', shade: '#86933D', shine: '#D4DE96' },
  purple: { fill: '#9A5A8C', shade: '#814977', shine: '#D9A9CE' },
  black: { fill: '#4A2B3F', shade: '#3A2032', shine: '#9C7A92' },
}
export const OIL = '#E6C640'
export const OIL_SHADE = '#CDAA2C'

/** One olive, side view: a chubby oval with a stem dimple, one shade band and a shine. Fills its box (w:h = 0.8). */
export function OliveSvg({ color, style, stem }: { color: OliveColor; style?: CSSProperties; stem?: boolean }) {
  const c = OLIVE[color]
  return (
    <svg viewBox="-44 -56 88 112" style={{ display: 'block', width: '100%', overflow: 'visible', ...style }}>
      {stem && <path d="M0 -44 L2 -60" stroke={INK} strokeWidth="5" strokeLinecap="round" />}
      <ellipse rx="36" ry="46" fill={c.fill} stroke={INK} strokeWidth="6" />
      <path d="M-30 18 Q0 46 30 18 Q24 40 0 42 Q-24 40 -30 18Z" fill={c.shade} />
      <ellipse cx="-13" cy="-18" rx="8" ry="13" fill={c.shine} transform="rotate(20 -13 -18)" />
      <ellipse cx="0" cy="-40" rx="5" ry="3" fill={INK} />
    </svg>
  )
}

/** A raw SVG olive group (for drawing many inside one SVG). Centered at 0,0, ~ 36 x 46 units at scale 1. */
export function OliveG({ color, x, y, s = 1, rot = 0 }: { color: OliveColor; x: number; y: number; s?: number; rot?: number }) {
  const c = OLIVE[color]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse rx="18" ry="23" fill={c.fill} stroke={INK} strokeWidth="4" />
      <ellipse cx="-6" cy="-9" rx="4" ry="7" fill={c.shine} transform="rotate(20 -6 -9)" />
    </g>
  )
}

/** A box with the background's aspect ratio that covers the screen like `background-size: cover`, so children placed in
 *  % of the picture land on the same spot at every size. It's a size container: `cqw`/`cqh` are % of the picture.
 *  On very wide screens (phones sideways) it keeps the ground and crops the sky. */
export function Scene({ bg, bgTall, children, prompt, word, style }: { bg: string; bgTall: string; children?: ReactNode; prompt?: Line | null; word?: WordId | null; style?: CSSProperties }) {
  const landscape = useLandscape()
  const ref = useRef<HTMLDivElement>(null)
  const { width: w, height: h } = useElementSize(ref)
  const ratio = landscape ? 1.5 : 1 / 1.5
  const bw = Math.max(w, h * ratio)
  const bh = bw / ratio
  const anchor = w / Math.max(h, 1) > 1.7 ? 1 : 0.5
  const img = landscape ? bg : bgTall
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#8CCBEA', ...style }}>
      {w > 0 && (
        <PlayArea style={{ position: 'absolute', left: (w - bw) / 2, top: (h - bh) * anchor, width: bw, height: bh, background: `url(${img}) center / 100% 100%`, containerType: 'size' }}>
          {children}
        </PlayArea>
      )}
      {prompt && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 'var(--top-clear)', display: 'flex', justifyContent: 'center', padding: '0 24px', zIndex: 40, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <PromptBubble text={prompt} />
          </div>
        </div>
      )}
      <WordCard word={word ?? null} />
    </div>
  )
}

/** Puts something on the ground: its bottom center sits at (x, y) in % of the scene. */
export function Stand({ x, y, h, w, z, children, style }: { x: number; y: number; h?: string; w?: string; z?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, bottom: `${100 - y}%`, height: h, width: w, translate: '-50% 0', zIndex: z, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', ...style }}>
      {children}
    </div>
  )
}

/** A woven basket seen from the side, with a heap of olives that grows with `fill` (0..1). Box ratio 1.2 : 1. */
export function Basket({ fill, glow }: { fill: number; glow?: boolean }) {
  const f = Math.max(0, Math.min(1, fill))
  // Olives in the heap, back to front; the first ones show first.
  const heap: { x: number; y: number; c: OliveColor; r: number }[] = [
    { x: 60, y: 62, c: 'green', r: -20 }, { x: 140, y: 62, c: 'black', r: 25 }, { x: 100, y: 64, c: 'green', r: 5 },
    { x: 80, y: 52, c: 'purple', r: -10 }, { x: 120, y: 50, c: 'green', r: 15 }, { x: 46, y: 50, c: 'black', r: -30 },
    { x: 154, y: 50, c: 'green', r: 30 }, { x: 100, y: 40, c: 'black', r: 0 }, { x: 66, y: 38, c: 'green', r: -15 },
    { x: 134, y: 36, c: 'purple', r: 20 }, { x: 88, y: 28, c: 'green', r: 10 }, { x: 114, y: 24, c: 'green', r: -10 },
    { x: 100, y: 12, c: 'black', r: 5 },
  ]
  const shown = Math.round(f * heap.length)
  return (
    <svg viewBox="0 0 200 168" style={{ width: '100%', display: 'block', overflow: 'visible', filter: glow ? 'drop-shadow(0 0 10px #FFE27A) drop-shadow(0 0 4px #FFC83D)' : undefined }}>
      {/* handle */}
      <path d="M38 76 C38 10 162 10 162 76" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
      <path d="M38 76 C38 10 162 10 162 76" fill="none" stroke="#E2A066" strokeWidth="9" strokeLinecap="round" />
      {heap.slice(0, shown).map((o, i) => (
        <OliveG key={i} color={o.c} x={o.x} y={o.y + 16} rot={o.r} s={0.95} />
      ))}
      {/* body: wider at the rim, flat bottom on the ground */}
      <path d="M18 78 L182 78 L166 160 Q100 168 34 160Z" fill="#E2A066" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M30 128 L170 128 L166 156 Q100 164 34 156Z" fill="#CC8650" />
      {[96, 112, 128, 144].map((y) => (
        <path key={y} d={`M${24 + (y - 78) * 0.2} ${y} L${176 - (y - 78) * 0.2} ${y}`} stroke={INK} strokeWidth="3" opacity="0.55" />
      ))}
      {[50, 75, 100, 125, 150].map((x) => (
        <path key={x} d={`M${x} 84 L${x + (x < 100 ? 3 : x > 100 ? -3 : 0)} 156`} stroke={INK} strokeWidth="2.6" opacity="0.4" />
      ))}
      <rect x="12" y="70" width="176" height="18" rx="9" fill="#EDB57C" stroke={INK} strokeWidth="6" />
    </svg>
  )
}

/** The sun painted in the corner of the grove picture becomes a button: it hums, and tapping it plays `onTap`. */
export function SunButton({ x, y, size, onTap, glow }: { x: number; y: number; size: string; onTap: () => void; glow?: boolean }) {
  return (
    <motion.button
      aria-label="Sun"
      onClick={onTap}
      whileTap={{ scale: 0.85 }}
      animate={glow ? { scale: [1, 1.12, 1] } : { scale: [1, 1.04, 1] }}
      transition={{ repeat: Infinity, duration: glow ? 1 : 2.4 }}
      style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: size, height: size, translate: '-50% -50%', borderRadius: '50%', border: 'none', padding: 0, zIndex: 30, background: 'rgba(255,226,122,.01)', boxShadow: glow ? '0 0 0 8px rgba(255,226,122,.55), 0 0 40px 16px rgba(255,226,122,.75)' : '0 0 24px 6px rgba(255,226,122,.35)' }}
    />
  )
}

/** A chunky table painted Mediterranean blue, seen from the side: a top plank and two legs. Fills its box; the top surface is at 0%. */
export function Table({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 400 100" preserveAspectRatio="none" style={{ position: 'absolute', display: 'block', overflow: 'visible', ...style }}>
      <rect x="34" y="12" width="26" height="86" rx="6" fill="#5FB4DA" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
      <rect x="340" y="12" width="26" height="86" rx="6" fill="#5FB4DA" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
      <rect x="2" y="0" width="396" height="16" rx="7" fill="#7FCDEE" stroke={INK} strokeWidth="5" vectorEffect="non-scaling-stroke" />
      <rect x="8" y="10" width="384" height="4" fill="#5FB4DA" />
    </svg>
  )
}

/** Gold sparkles that pop around a point (mini-wins). */
export function Twinkles({ n = 6, style }: { n?: number; style?: CSSProperties }) {
  return (
    <div aria-hidden style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return (
          <motion.span
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(a) * 70, y: Math.sin(a) * 70, scale: [0, 1.3, 0.6], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ position: 'absolute', left: 0, top: 0, fontSize: 28, translate: '-50% -50%' }}
          >
            ✨
          </motion.span>
        )
      })}
    </div>
  )
}
