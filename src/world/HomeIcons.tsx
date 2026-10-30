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
