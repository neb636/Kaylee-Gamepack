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

/** A woven basket seen straight from the side (eye level): only a thin sliver of the rim shows, and a heap of olives
 *  peeks over it, growing with `fill` (0..1). Box ratio 200 : 168, flat bottom on the ground. */
export function Basket({ fill, glow }: { fill: number; glow?: boolean }) {
  const f = Math.max(0, Math.min(1, fill))
  // Olives in the heap, lowest first, so the heap grows up out of the basket.
  const heap: { x: number; y: number; c: OliveColor; r: number }[] = [
    { x: 46, y: 80, c: 'green', r: -20 }, { x: 78, y: 80, c: 'black', r: 15 }, { x: 110, y: 80, c: 'green', r: 5 }, { x: 142, y: 80, c: 'purple', r: -10 }, { x: 160, y: 80, c: 'green', r: 25 },
    { x: 62, y: 66, c: 'purple', r: 10 }, { x: 94, y: 64, c: 'green', r: -15 }, { x: 126, y: 64, c: 'black', r: 20 }, { x: 150, y: 68, c: 'green', r: -25 },
    { x: 78, y: 50, c: 'green', r: 5 }, { x: 110, y: 48, c: 'purple', r: -5 }, { x: 138, y: 52, c: 'green', r: 15 },
    { x: 96, y: 34, c: 'black', r: -10 }, { x: 124, y: 36, c: 'green', r: 10 },
  ]
  const shown = Math.round(f * heap.length)
  return (
    <svg viewBox="0 0 200 168" style={{ width: '100%', display: 'block', overflow: 'visible', filter: glow ? 'drop-shadow(0 0 10px #FFE27A) drop-shadow(0 0 4px #FFC83D)' : undefined }}>
      {/* handle, arching over from the sides */}
      <path d="M30 86 C30 4 170 4 170 86" fill="none" stroke={INK} strokeWidth="17" strokeLinecap="round" />
      <path d="M30 86 C30 4 170 4 170 86" fill="none" stroke="#E2A066" strokeWidth="8" strokeLinecap="round" />
      {/* the far rim: a thin sliver of the basket's opening, seen almost edge-on */}
      <ellipse cx="100" cy="88" rx="84" ry="6" fill="#B8733F" stroke={INK} strokeWidth="5" />
      {heap.slice(0, shown).map((o, i) => (
        <OliveG key={i} color={o.c} x={o.x} y={o.y} rot={o.r} s={0.95} />
      ))}
      {/* the body, wider at the top, flat on the ground */}
      <path d="M16 90 Q100 98 184 90 L168 158 Q100 166 32 158Z" fill="#E2A066" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M26 132 Q100 140 174 132 L168 156 Q100 163 32 156Z" fill="#CC8650" />
      {[108, 122, 138].map((y) => (
        <path key={y} d={`M${18 + (y - 90) * 0.24} ${y} Q100 ${y + 7} ${182 - (y - 90) * 0.24} ${y}`} fill="none" stroke={INK} strokeWidth="3" opacity="0.5" />
      ))}
      {[52, 76, 100, 124, 148].map((x) => (
        <path key={x} d={`M${x} 96 L${x + (x - 100) * -0.08} 158`} stroke={INK} strokeWidth="2.6" opacity="0.4" />
      ))}
      {/* the near rim: a braided band */}
      <path d="M12 88 Q100 100 188 88" fill="none" stroke={INK} strokeWidth="15" strokeLinecap="round" />
      <path d="M12 88 Q100 100 188 88" fill="none" stroke="#EDB57C" strokeWidth="7" strokeLinecap="round" />
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
