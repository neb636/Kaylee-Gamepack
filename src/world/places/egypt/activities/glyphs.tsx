// Hieroglyphs for K-A-Y-L-E-E, drawn as SVG so they stay crisp (never generated: pictures of writing come out wrong).
// These are the real signs Egyptologists use for these sounds: basket = k, vulture = a, two reeds = y, lion = l, reed = i/e.
import type { CSSProperties, ReactElement } from 'react'

export type GlyphId = 'basket' | 'vulture' | 'reeds' | 'lion' | 'reed'

const INK = '#3A2230'

function Reed({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d="M0 90 V46" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <path d="M0 8 C16 22 16 40 3 54 C-8 40 -8 22 0 8 Z" fill={INK} />
      <path d="M1 18 C6 28 6 38 2 46" stroke="#F4D6A8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  )
}

const DRAW: Record<GlyphId, () => ReactElement> = {
  basket: () => (
    <g>
      <path d="M10 42 H82 C82 70 66 82 46 82 C26 82 10 70 10 42 Z" fill={INK} />
      <path d="M80 50 C96 50 96 72 78 72" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      {/* Woven reeds, so it reads as a basket */}
      <path d="M22 50 L34 76 M36 48 L48 80 M50 48 L60 80 M64 48 L70 74 M30 48 L20 62 M46 48 L28 76 M62 48 L42 80 M76 50 L58 80" stroke="#F4D6A8" strokeWidth="2.6" strokeLinecap="round" />
    </g>
  ),
  vulture: () => (
    <g fill={INK}>
      {/* Body and folded wing, tail to the left, head up on the right */}
      <path d="M22 60 C22 40 40 30 58 32 C66 33 70 38 70 46 C70 62 56 72 38 72 L14 80 L20 68 Z" />
      <path d="M62 36 C62 24 68 16 76 16 C84 16 88 22 88 26 L80 28 C76 26 72 30 72 36 Z" />
      <path d="M86 24 L94 28 L86 30 Z" />
      <path d="M44 70 L42 90 M56 68 L58 90" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M36 44 C44 40 54 40 62 46" stroke="#F4D6A8" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
  reeds: () => (
    <g>
      <Reed x={36} />
      <Reed x={64} />
    </g>
  ),
  reed: () => <Reed x={50} />,
  lion: () => (
    <g fill={INK}>
      {/* Lying lion facing right: body, mane and head, front paws forward, tail curled up behind */}
      <path d="M18 70 C18 54 30 48 46 48 H64 C70 48 74 52 74 58 V74 H22 C19 74 18 72 18 70 Z" />
      <circle cx="76" cy="46" r="15" />
      <path d="M86 42 C92 42 94 48 90 52 L84 52 Z" />
      <path d="M66 74 H94 C96 74 96 80 92 80 H66 Z" />
      <path d="M20 62 C8 60 6 46 12 38" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="12" cy="36" r="5" />
      <circle cx="80" cy="42" r="2.4" fill="#F4D6A8" />
    </g>
  ),
}

/** One hieroglyph. `faint` draws it as a light outline hint. */
export function Glyph({ id, size, faint, style }: { id: GlyphId; size: string; faint?: boolean; style?: CSSProperties }) {
  const Draw = DRAW[id]
  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: 'block', opacity: faint ? 0.22 : 1, ...style }}>
      <Draw />
    </svg>
  )
}

/** Her name, one sign per letter. */
export const NAME_GLYPHS: { letter: string; glyph: GlyphId }[] = [
  { letter: 'K', glyph: 'basket' },
  { letter: 'A', glyph: 'vulture' },
  { letter: 'Y', glyph: 'reeds' },
  { letter: 'L', glyph: 'lion' },
  { letter: 'E', glyph: 'reed' },
  { letter: 'E', glyph: 'reed' },
]
export const ALL_GLYPHS: GlyphId[] = ['basket', 'vulture', 'reeds', 'lion', 'reed']
