// The drawn control pictures (the way on, again, skip, done, back...), one flat style like the home dock's icons.
// Controls never use system emoji for these: emoji look different on every device and pasted on beside drawn art.
// The round buttons that carry them are world/kit/Hud.tsx; <HudGlyph> puts one inside a pill button or a line of text.
import type { CSSProperties } from 'react'

const S = { viewBox: '0 0 24 24', 'aria-hidden': true } as const
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** The drawn control pictures. They take the button's glyph colour (`currentColor`). */
export const HUD_ICONS = {
  /** One level up: back to where she came from. */
  back: (
    <svg {...S}>
      <path d="M10.5 3.5 4 10l6.5 6.5M4.5 10H15a5 5 0 0 1 0 10h-3" {...LINE} />
    </svg>
  ),
  map: (
    <svg {...S}>
      <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z" fill="currentColor" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M9 4.4v13M15 6.6v13" stroke="var(--hud-face, #fff)" strokeWidth={1.7} />
    </svg>
  ),
  /** The way on. */
  play: (
    <svg {...S}>
      <path d="M8.5 5.2v13.6a.9.9 0 0 0 1.4.8l10.4-6.8a.9.9 0 0 0 0-1.6L9.9 4.4a.9.9 0 0 0-1.4.8z" fill="currentColor" />
    </svg>
  ),
  check: (
    <svg {...S}>
      <path d="M5 12.6l4.6 4.6L19 7.4" {...LINE} strokeWidth={3.6} />
    </svg>
  ),
  again: (
    <svg {...S}>
      <path d="M19 12a7 7 0 1 1-2.3-5.2" {...LINE} />
      <path d="M17.7 2.6v4.9h-4.9" {...LINE} />
    </svg>
  ),
  skip: (
    <svg {...S}>
      <path d="M5 6v12l9-6z" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <rect x="16.5" y="5" width="3.2" height="14" rx="1.6" fill="currentColor" />
    </svg>
  ),
  sound: (
    <svg {...S}>
      <path d="M4 9.5v5h3.5l4.5 4v-13l-4.5 4z" fill="currentColor" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.3 6a8.5 8.5 0 0 1 0 12" {...LINE} strokeWidth={2.2} />
    </svg>
  ),
  close: (
    <svg {...S}>
      <path d="M6 6l12 12M18 6 6 18" {...LINE} strokeWidth={3.4} />
    </svg>
  ),
  home: (
    <svg {...S}>
      <path d="M3.5 11.5 12 4l8.5 7.5" {...LINE} />
      <path d="M6 10.5V20h4.2v-5h3.6v5H18v-9.5" fill="currentColor" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" />
    </svg>
  ),
  /** A party: the finale is ready. */
  party: (
    <svg {...S}>
      <path d="M4 20 8.2 8.6l7.2 7.2z" fill="currentColor" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M13 6.500c1.5-.5 2-2 1.5-3.500M17 10c1.5-1.5 3.5-1.5 4.5-.5" {...LINE} strokeWidth={2} />
      <circle cx="18.5" cy="4.5" r="1.4" fill="currentColor" />
      <circle cx="20" cy="14.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  mirror: (
    <svg {...S}>
      <ellipse cx="12" cy="9" rx="6.2" ry="7" {...LINE} strokeWidth={2.6} />
      <path d="M12 16.500V21M8.5 21.500h7" {...LINE} strokeWidth={2.6} />
      <path d="M9.5 6.500c.8-1 1.8-1.5 3-1.5" {...LINE} strokeWidth={1.8} />
    </svg>
  ),
  dice: (
    <svg {...S}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" fill="currentColor" />
      <g fill="var(--hud-face, #fff)">
        <circle cx="8.7" cy="8.7" r="1.6" />
        <circle cx="15.3" cy="8.7" r="1.6" />
        <circle cx="12" cy="12" r="1.6" />
        <circle cx="8.7" cy="15.3" r="1.6" />
        <circle cx="15.3" cy="15.3" r="1.6" />
      </g>
    </svg>
  ),
  album: (
    <svg {...S}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="3" fill="currentColor" />
      <rect x="8.5" y="7" width="7.5" height="6" rx="1.2" fill="var(--hud-face, #fff)" />
      <path d="M7 3.500v17" stroke="var(--hud-face, #fff)" strokeWidth={1.4} />
    </svg>
  ),
} as const
export type HudIcon = keyof typeof HUD_ICONS

/** One of the pictures at text size (1.1em), for a pill button's label: `<HudGlyph icon="again" />`. */
export function HudGlyph({ icon, size = '1.1em', style }: { icon: HudIcon; size?: number | string; style?: CSSProperties }) {
  return (
    <span aria-hidden className="hud-glyph" style={{ display: 'inline-grid', width: size, height: size, flex: 'none', verticalAlign: '-0.18em', ...style }}>
      {HUD_ICONS[icon]}
    </span>
  )
}
