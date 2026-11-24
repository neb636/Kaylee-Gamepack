// A country's pin on the home globe: a round picture of the one thing she knows the place by (its animal, a pizza,
// the pyramid), a ring with one piece per stamp that turns gold as she earns them, its flag, and a gold cup once
// every stamp is hers.
import { banner } from '../cards'
import { Flag } from '../kit/Flag'
import type { PlaceMeta } from '../types'

// The pins' own pictures (pins/<place>.svg, drawn like the shelf's icons: shelf/STYLE.md), and the shelf's icons.
// Their URLs, never inlined (like cards.ts): they load with the globe and the offline cache keeps them.
const pins = import.meta.glob<string>('./pins/*.svg', { eager: true, import: 'default', query: '?no-inline' })
const icons = import.meta.glob<string>('../shelf/icons/*/*.svg', { eager: true, import: 'default', query: '?no-inline' })

/**
 * What each place's pin shows: one thing a five-year-old knows at a glance, big (an animal, a pizza, the pyramid).
 * A circle of a picture: its center and radius in the picture's own units. The picture is the pin's own drawing
 * (`pin`, 120 wide), one of the shelf's game icons (`icon`, 120 wide) or the place's shelf banner (1200 x 450).
 * A place with no line here shows the middle of its banner.
 */
const WINDOWS: Record<string, { pin?: string; icon?: string; x: number; y: number; r: number }> = {
  australia: { x: 872, y: 244, r: 138 }, // the kangaroo hopping past Uluru
  canada: { pin: 'canada', x: 60, y: 60, r: 55 }, // a moose in a red scarf (the user's pick for Canada, 2026-11-20)
  china: { icon: 'china/bamboo', x: 58, y: 61, r: 51 }, // the panda with its bamboo
  egypt: { x: 560, y: 215, r: 185 }, // the pyramid over the Nile
  italy: { pin: 'italy', x: 60, y: 60, r: 54 }, // a slice of pizza
  peru: { pin: 'peru', x: 57, y: 51, r: 53 }, // Luna the alpaca in the Andes
  poles: { icon: 'poles/floe', x: 61, y: 57, r: 48 }, // the polar bear cub waving from its ice floe
  thailand: { pin: 'thailand', x: 60, y: 60, r: 56 }, // an elephant on the beach in Krabi, reaching for bananas
}
const MIDDLE = { x: 600, y: 225, r: 200 }

const GOLD = '#ffc83d'
/** The ring: its middle line and width, in a 100-unit box. */
const RING = { r: 45.5, w: 9 }
const AROUND = 2 * Math.PI * RING.r

export function Medallion({ meta, stamps, sparkly }: { meta: PlaceMeta; stamps: number; sparkly?: boolean }) {
  const win: (typeof WINDOWS)[string] = WINDOWS[meta.id] ?? MIDDLE
  const art = win.pin ? pins[`./pins/${win.pin}.svg`] : win.icon ? icons[`../shelf/icons/${win.icon}.svg`] : banner(meta.id)
  /** How wide the whole picture is, in its own units. */
  const wide = win.pin || win.icon ? 120 : 1200
  const total = meta.activities.length
  const done = total > 0 && stamps >= total
  // One piece of the ring per stamp, with a sliver of white between them.
  const gap = total > 1 ? 4 : 0
  const piece = AROUND / Math.max(1, total) - gap
  const zoom = wide / (2 * win.r)
  return (
    <span className={`globe-medal${sparkly ? ' world-glow' : ''}`}>
      <span className="globe-medal-face">
        {art && <img src={art} alt="" draggable={false} style={{ width: `${zoom * 100}%`, left: `${(-(win.x - win.r) / (2 * win.r)) * 100}%`, top: `${(-(win.y - win.r) / (2 * win.r)) * 100}%` }} />}
      </span>
      <svg className="globe-medal-ring" viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r={RING.r} fill="none" stroke="#fff" strokeWidth={RING.w} />
        <g transform="rotate(-90 50 50)" fill="none" stroke={GOLD} strokeWidth={RING.w - 2.5}>
          {Array.from({ length: Math.min(stamps, total) }, (_, i) => (
            <circle key={i} cx="50" cy="50" r={RING.r} strokeDasharray={`${piece} ${AROUND - piece}`} strokeDashoffset={-((i * AROUND) / total + gap / 2)} />
          ))}
        </g>
      </svg>
      <Flag id={meta.flag} width="44%" style={{ position: 'absolute', right: '-12%', bottom: '-3%', borderWidth: 3, borderRadius: '18%', boxShadow: '0 3px 0 rgba(43, 35, 48, 0.14)' }} />
      {done && (
        <svg className="globe-medal-cup" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="12" fill={GOLD} />
          <circle cx="12" cy="12" r="10.6" fill="none" stroke="#fff" strokeWidth="1.6" />
          <path d="M8 6.2h8v3.6a4 4 0 0 1-8 0z" fill="#fff" />
          <path d="M8 7.2H6.4a1.9 1.9 0 0 0 2 2.9M16 7.2h1.6a1.9 1.9 0 0 1-2 2.9" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M11.2 13.4h1.6v2.4h-1.6z" fill="#fff" />
          <rect x="8.6" y="15.6" width="6.8" height="2.2" rx="1.1" fill="#fff" />
        </svg>
      )}
    </span>
  )
}
