import { useId } from 'react'

// The home screen's button pictures: one flat style for all of them (white shapes, details in the button's darker
// shade, no outlines, no gloss), so the dock reads as one set instead of four unrelated stickers.
type Icon = { shade: string }

const SVG = { viewBox: '0 0 100 100', width: '100%', height: '100%', 'aria-hidden': true, style: { display: 'block' } } as const

export function PassportIcon({ shade }: Icon) {
  return (
    <svg {...SVG}>
      <rect x="22" y="12" width="56" height="76" rx="10" fill="#fff" />
      <rect x="22" y="12" width="11" height="76" rx="5" fill={shade} opacity="0.35" />
      <circle cx="55" cy="42" r="15" fill="none" stroke={shade} strokeWidth="5" />
      <path d="M40 42h30M55 27c-7 8-7 22 0 30M55 27c7 8 7 22 0 30" fill="none" stroke={shade} strokeWidth="4" strokeLinecap="round" />
      <rect x="42" y="68" width="26" height="6" rx="3" fill={shade} />
    </svg>
  )
}

export function CrayonIcon({ shade }: Icon) {
  return (
    <svg {...SVG}>
      <g transform="rotate(-38 50 50)">
        <path d="M36 28h28v52a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6z" fill="#fff" />
        <path d="M38 28 50 8l12 20z" fill="#fff" />
        <path d="M46 15 50 8l4 7z" fill={shade} />
        <rect x="36" y="40" width="28" height="7" fill={shade} />
        <rect x="36" y="68" width="28" height="7" fill={shade} />
      </g>
    </svg>
  )
}

export function PuzzleIcon({ shade }: Icon) {
  return (
    <svg {...SVG}>
      <path
        d="M22 30a6 6 0 0 1 6-6h12a10 10 0 1 1 20 0h12a6 6 0 0 1 6 6v12a10 10 0 1 1 0 20v10a6 6 0 0 1-6 6H60a10 10 0 1 0-20 0H28a6 6 0 0 1-6-6V62a10 10 0 1 0 0-20z"
        fill="#fff"
      />
      <circle cx="42" cy="47" r="4" fill={shade} />
      <circle cx="58" cy="47" r="4" fill={shade} />
      <path d="M41 57q9 8 18 0" fill="none" stroke={shade} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export function TheaterIcon({ shade }: Icon) {
  return (
    <svg {...SVG}>
      <rect x="14" y="22" width="72" height="52" rx="12" fill="#fff" />
      <path d="M44 36v24l20-12z" fill={shade} strokeLinejoin="round" stroke={shade} strokeWidth="4" />
      <rect x="34" y="80" width="32" height="7" rx="3.5" fill="#fff" />
    </svg>
  )
}

/** A desk globe on its stand: the "back to the world map" button. */
export function GlobeIcon({ shade }: Icon) {
  const clip = useId()
  return (
    <svg {...SVG}>
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="44" r="29" />
        </clipPath>
      </defs>
      <circle cx="50" cy="44" r="29" fill="#fff" />
      <g clipPath={`url(#${clip})`} fill={shade}>
        <path d="M24 22c6-5 15-6 20-2 3 3-1 7 2 11 2 3-2 6-6 6-3 0-4 4-7 6-4 2-8-1-10-5-3-5-3-11 1-16z" />
        <path d="M38 52c4-1 8 2 8 6 0 5-3 9-4 14-1 3-4 3-5 0-2-6-4-11-3-16 0-2 2-4 4-4z" />
        <path d="M56 20c5-3 13-2 18 3 3 3 1 6-2 6-3 0-4 3-1 5 4 3 6 8 3 12-2 3-6 2-8 5-2 4-6 5-8 1-2-5 1-9-1-13-1-3-5-3-6-7-1-5 2-10 5-12z" />
      </g>
      <path d="M22 26A33 33 0 0 0 52 79" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <rect x="47" y="77" width="6" height="8" fill="#fff" />
      <rect x="32" y="83" width="36" height="8" rx="4" fill="#fff" />
    </svg>
  )
}

export function MapIcon({ color }: { color: string }) {
  return (
    <svg {...SVG}>
      <path d="M14 26 36 18l28 10 22-8v56l-22 8-28-10-22 8z" fill={color} strokeLinejoin="round" stroke={color} strokeWidth="6" />
      <path d="M36 18v56M64 28v56" stroke="rgba(255,255,255,0.7)" strokeWidth="5" />
    </svg>
  )
}

export function ShelfIcon({ color }: { color: string }) {
  return (
    <svg {...SVG}>
      <rect x="16" y="16" width="30" height="30" rx="8" fill={color} />
      <rect x="54" y="16" width="30" height="30" rx="8" fill={color} />
      <rect x="16" y="54" width="30" height="30" rx="8" fill={color} />
      <rect x="54" y="54" width="30" height="30" rx="8" fill={color} />
    </svg>
  )
}

/**
 * The dock's four places, each with its tile color, the darker shade for its details and press lip, and its picture.
 * Everything that stands for one of them (the dock, a screen's title, a country's top-bar buttons) uses these, so the
 * passport always looks like the passport.
 */
export const DOCK = {
  passport: { color: '#ff6fa8', shade: '#e2508c', Icon: PassportIcon },
  coloring: { color: '#ffab4c', shade: '#e88c2a', Icon: CrayonIcon },
  puzzles: { color: '#3fc6a4', shade: '#25a686', Icon: PuzzleIcon },
  theater: { color: '#9d82f2', shade: '#7c60d8', Icon: TheaterIcon },
} as const
export type DockKind = keyof typeof DOCK

/** The way back to the world map: a sky-blue tile with the globe, built like the dock's buttons so it sits with them. */
export const WORLD = { color: '#5ab4f0', shade: '#3893d6', Icon: GlobeIcon } as const

/** A dock picture on its own little colored tile, sized to the text around it (for title pills and counts). */
export function DockGlyph({ kind, size = '1.25em' }: { kind: DockKind; size?: string }) {
  const { color, shade, Icon } = DOCK[kind]
  return (
    <span aria-hidden style={{ display: 'inline-block', flex: '0 0 auto', width: size, height: size, borderRadius: '28%', background: color, padding: `calc(${size} * 0.08)`, boxSizing: 'border-box', verticalAlign: 'middle' }}>
      <Icon shade={shade} />
    </span>
  )
}

/** Spread into a `TopBar` for the "back to the world map" button: `<TopBar {...worldBack} label="World map" ...>`. */
export const worldBack = { icon: <GlobeIcon shade={WORLD.shade} />, tile: WORLD }
