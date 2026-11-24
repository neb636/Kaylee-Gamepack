// A country's pin on the home globe: a round window onto the place (a circle cut from its shelf banner, so a place
// has one picture everywhere), a ring with one piece per stamp that turns gold as she earns them, its flag, and a
// gold cup once every stamp is hers.
import { banner } from '../cards'
import { Flag } from '../kit/Flag'
import type { PlaceMeta } from '../types'

/**
 * The part of each place's banner its window shows: the circle's center and radius in the banner's own units
 * (shelf/banners/<banner>.svg, 1200 x 450). Thailand's row on the shelf is split into trips, so it borrows Krabi's.
 * A place with no line here shows the middle of its own banner.
 */
const WINDOWS: Record<string, { banner?: string; x: number; y: number; r: number }> = {
  australia: { x: 850, y: 240, r: 170 },
  canada: { x: 540, y: 240, r: 190 },
  china: { x: 560, y: 240, r: 170 },
  egypt: { x: 560, y: 215, r: 185 },
  italy: { x: 590, y: 230, r: 190 },
  peru: { x: 985, y: 235, r: 185 },
  poles: { x: 540, y: 235, r: 175 },
  thailand: { banner: 'krabi', x: 350, y: 252, r: 172 },
}
const MIDDLE = { x: 600, y: 225, r: 200 }

const GOLD = '#ffc83d'
/** The ring: its middle line and width, in a 100-unit box. */
const RING = { r: 45.5, w: 9 }
const AROUND = 2 * Math.PI * RING.r

export function Medallion({ meta, stamps, sparkly }: { meta: PlaceMeta; stamps: number; sparkly?: boolean }) {
  const win = WINDOWS[meta.id] ?? MIDDLE
  const art = banner(win.banner ?? meta.id)
  const total = meta.activities.length
  const done = total > 0 && stamps >= total
  // One piece of the ring per stamp, with a sliver of white between them.
  const gap = total > 1 ? 4 : 0
  const piece = AROUND / Math.max(1, total) - gap
  const zoom = 1200 / (2 * win.r)
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
