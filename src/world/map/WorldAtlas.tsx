// The world, drawn from real coastlines (atlas.json): true shapes, true sizes, and one set of coasts forever, so a new
// country never means a new picture. Two pictures stacked: the land, which never changes, and her countries' outlines,
// which shimmer. Keeping them apart means the iPad only ever repaints the handful of outlines.
import { motion } from 'motion/react'
import { memo, type CSSProperties } from 'react'
import { sounds } from '../../sdk'
import { WORLD_LINES } from '../lines'
import atlas from './atlas.json'
import { DECOR } from './decor'
import { FEEL } from './feel'

export type CountryCode = keyof typeof atlas.countries
type Shape = { continent: string; d: string; at: number[]; box: number[] }
const COUNTRIES: Record<string, Shape> = atlas.countries
const VIEW = `0 0 ${atlas.w} ${atlas.h}`

export type ContinentKey = keyof typeof WORLD_LINES.continents

// The painted map's colors, one per continent. `key` is the name the continent answers to.
const CONTINENTS: { atlas: string; key: ContinentKey; color: string }[] = [
  { atlas: 'antarctica', key: 'antarctica', color: '#fff7f0' },
  { atlas: 'northAmerica', key: 'northAmerica', color: '#8fe3c8' },
  { atlas: 'southAmerica', key: 'southAmerica', color: '#ffc2a8' },
  { atlas: 'europe', key: 'europe', color: '#c7b6f7' },
  { atlas: 'africa', key: 'africa', color: '#fbe68c' },
  { atlas: 'asia', key: 'asia', color: '#ff8fb8' },
  { atlas: 'oceania', key: 'australia', color: '#ffae73' },
]
const LAND = CONTINENTS.map((c) => ({
  ...c,
  d: Object.values(COUNTRIES)
    .filter((s) => s.continent === c.atlas)
    .map((s) => s.d)
    .join(''),
}))

/** A country's biggest piece: the light runs around its mainland, not hopping between islands. */
const mainland = (d: string) => (d.match(/M[^M]*/g) ?? [d]).reduce((a, b) => (b.length > a.length ? b : a))

/** Where a country is, in % of the map. */
export function spotOf(code: CountryCode): [number, number] {
  const [x, y] = COUNTRIES[code].at
  return [(x / atlas.w) * 100, (y / atlas.h) * 100]
}

/** A country's left and right edges, in % of the map. */
export function edgesOf(code: CountryCode): [number, number] {
  const [x0, , x1] = COUNTRIES[code].box
  return [(x0 / atlas.w) * 100, (x1 / atlas.w) * 100]
}

/** The camera that frames a country: how far to zoom and shift the map (in % of itself). */
export function cameraOn(code: CountryCode) {
  const [x0, y0, x1, y1] = COUNTRIES[code].box
  const scale = Math.max(1.5, Math.min(6, Math.min((atlas.w * 0.55) / (x1 - x0), (atlas.h * 0.6) / (y1 - y0))))
  const centre = (mid: number, size: number) => Math.max(100 - 100 * scale, Math.min(0, 50 - (mid / size) * 100 * scale))
  return { scale, x: `${centre((x0 + x1) / 2, atlas.w)}%`, y: `${centre((y0 + y1) / 2, atlas.h)}%` }
}

const layer: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }

/** The sea, the land (each continent says its name when tapped) and the stickers. */
export const Land = memo(function Land({ onContinent }: { onContinent: (key: ContinentKey) => void }) {
  return (
    <>
      <svg viewBox={VIEW} style={layer}>
        {LAND.map((c) => (
          <path
            key={c.key}
            role="button"
            aria-label={c.key}
            d={c.d}
            fill={c.color}
            stroke={c.color}
            strokeWidth={4}
            strokeLinejoin="round"
            style={{ cursor: 'pointer' }}
            onClick={(e) => {
              e.stopPropagation()
              onContinent(c.key)
            }}
          />
        ))}
      </svg>
      {DECOR.map((d) => (
        // Things in the sea wiggle when poked. Things on land let the tap through, so the continent says its name.
        <motion.img
          key={d.key}
          className={d.sea ? 'world-drift' : undefined}
          src={d.src}
          alt=""
          draggable={false}
          whileTap={d.sea ? { scale: 1.3, rotate: 8 } : undefined}
          onClick={d.sea ? (e) => (e.stopPropagation(), sounds.pop()) : undefined}
          style={{ position: 'absolute', left: `${d.left}%`, top: `${d.top}%`, width: `${d.width}%`, pointerEvents: d.sea ? 'auto' : 'none', cursor: d.sea ? 'pointer' : undefined }}
        />
      ))}
    </>
  )
})

/** Her countries: brighter than the land around them, with a light running around each outline to say "tap me". */
export function Outlines({ countries, lit, zoom = 1 }: { countries: { code: CountryCode; onTap: () => void }[]; lit?: CountryCode; zoom?: number }) {
  return (
    <svg viewBox={VIEW} style={{ ...layer, pointerEvents: 'none' }}>
      {countries.map(({ code, onTap }, i) => {
        const d = COUNTRIES[code].d
        const width = (code === lit ? FEEL.outline * 1.4 : FEEL.outline) / zoom // the same thickness on screen when the map closes in
        const rim = COUNTRIES[code].continent === 'antarctica' ? '#6fb3ea' : '#fff' // white wouldn't show on the ice
        return (
          <g key={code} onClick={(e) => (e.stopPropagation(), onTap())} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
            <path d={d} fill="#fff" fillOpacity={0.38} stroke={rim} strokeWidth={width} strokeLinejoin="round" style={{ transition: `stroke-width ${FEEL.zoom}s` }} />
            <path
              className="world-outline-run"
              d={mainland(d)}
              pathLength={100}
              fill="none"
              stroke="var(--gold)"
              strokeWidth={width}
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray={`${FEEL.sparkle} ${100 - FEEL.sparkle}`}
              style={{ transition: `stroke-width ${FEEL.zoom}s`, animationDuration: `${FEEL.shimmer}s`, animationDelay: `${-i * 0.9}s` }}
            />
          </g>
        )
      })}
    </svg>
  )
}

/** The line from each country to its marker, and a dot where it's planted. */
export const Stems = memo(function Stems({ stems }: { stems: { key: string; from: [number, number]; to: [number, number] }[] }) {
  const u = (x: number, of: number) => (x / 100) * of
  return (
    <svg viewBox={VIEW} style={{ ...layer, pointerEvents: 'none' }}>
      {stems.map(({ key, from, to }) => (
        <g key={key}>
          <line x1={u(from[0], atlas.w)} y1={u(from[1], atlas.h)} x2={u(to[0], atlas.w)} y2={u(to[1], atlas.h)} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
          <circle cx={u(from[0], atlas.w)} cy={u(from[1], atlas.h)} r={15} fill="#fff" />
          <circle cx={u(from[0], atlas.w)} cy={u(from[1], atlas.h)} r={8} fill="var(--hotpink)" />
        </g>
      ))}
    </svg>
  )
})
