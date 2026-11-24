// Luna's map of Peru, drawn by hand (assets/scene-peru-map.svg, from scripts/peru-map.mjs): the real outline, rivers
// and lake, with Peru's three worlds side by side: the desert coast by the ocean, the Andes down the middle and the
// rainforest with its rivers. A cartographic view, used only on the hub. Tapping a world says what it is like there,
// and something small happens: a wave rolls in, the biggest snowcap glints, a pink river dolphin leaps in the Amazon.
// Two clouds drift over the sea.
import { motion } from 'motion/react'
import { useState, type CSSProperties, type MouseEvent } from 'react'
import { say, sounds } from '../../../sdk'
import { art } from './art'
import { L } from './lines'
import { ANDES_SIDE, COAST_SIDE, MAP_SIZE, PERU, SURPRISES, type Pt } from './mapLand'

/** The map is a square. */
export const MAP_RATIO = 1

type World = 'coast' | 'mountains' | 'forest'

const inside = (ring: readonly Pt[], x: number, y: number) => {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
/** How far a point is from a ring's edge. */
const toEdge = (ring: readonly Pt[], x: number, y: number) => {
  let best = Infinity
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[j]
    const [bx, by] = ring[i]
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)))
    best = Math.min(best, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)))
  }
  return best
}
/** How far out to sea a tap still counts as the coast (map units): the strip of sand is thinner than a finger. */
const SHORE = 80

/** Which of Peru's worlds a spot on the map is in (map units), if any. */
export function worldAt(x: number, y: number): World | null {
  const onCoastSide = inside(COAST_SIDE, x, y)
  if (!inside(PERU, x, y)) return onCoastSide && toEdge(PERU, x, y) < SHORE ? 'coast' : null
  return onCoastSide ? 'coast' : inside(ANDES_SIDE, x, y) ? 'mountains' : 'forest'
}

const at = ([x, y]: readonly [number, number]) => `translate(${x} ${y})`

export function PeruMap() {
  const [wave, setWave] = useState(0)
  const [glint, setGlint] = useState(0)
  const [leap, setLeap] = useState(0)
  const tap = (e: MouseEvent<HTMLButtonElement>) => {
    const box = e.currentTarget.getBoundingClientRect()
    const which = worldAt(((e.clientX - box.left) / box.width) * MAP_SIZE, ((e.clientY - box.top) / box.height) * MAP_SIZE)
    if (!which) return
    sounds.pop()
    void say(L.worlds[which])
    if (which === 'coast') setWave((w) => w + 1)
    if (which === 'mountains') {
      setGlint((g) => g + 1)
      sounds.sparkle()
    }
    if (which === 'forest') setLeap((f) => f + 1)
  }
  return (
    <div style={{ position: 'absolute', inset: 0, borderRadius: 28, overflow: 'hidden', boxShadow: 'var(--shadow)', border: '5px solid #fff', background: `#86d0fb url(${art.map}) center / cover` }}>
      <Cloud className="peru-map-cloud" style={{ left: '2%', top: '17%', width: '14%' }} />
      <Cloud className="peru-map-cloud peru-map-cloud-b" style={{ left: '9%', top: '84%', width: '12%' }} />
      {/* A little surprise for each world, in the map's own units. */}
      <svg viewBox={`0 0 ${MAP_SIZE} ${MAP_SIZE}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {wave > 0 && (
          <g transform={at(SURPRISES.wave)}>
            <motion.g key={wave} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" initial={{ x: -70, y: 52, opacity: 0 }} animate={{ x: [-70, 14], y: [52, -10], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, ease: 'easeOut' }}>
              <path d="M-52 0q13 -15 26 0t26 0t26 0t26 0" />
              <path d="M-30 26q11 -12 22 0t22 0t22 0" opacity="0.7" />
            </motion.g>
          </g>
        )}
        {glint > 0 && (
          <g transform={at(SURPRISES.glint)}>
            <motion.g key={glint} initial={{ scale: 0, rotate: 0 }} animate={{ scale: [0, 1.5, 0], rotate: 90 }} transition={{ duration: 0.9 }}>
              <path d="M0 -40L9 -9L40 0L9 9L0 40L-9 9L-40 0L-9 -9Z" fill="#ffc83d" />
              <path d="M0 -18L4 -4L18 0L4 4L0 18L-4 4L-18 0L-4 -4Z" fill="#fff6cc" />
            </motion.g>
          </g>
        )}
        {leap > 0 && (
          <g transform={at(SURPRISES.splash)}>
            {/* Rosa, as on her sticker, hopping out of the river and back in. */}
            <motion.g key={leap} initial={{ y: 18, rotate: -34, opacity: 0 }} animate={{ y: [18, -34, -34, 18], rotate: [-34, -12, 12, 34], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' }}>
              <g transform="scale(0.3)">
                <path d="M-90 6C-106 -4 -120 -24 -138 -28C-134 -10 -126 0 -114 8C-126 16 -134 30 -138 46C-120 40 -102 24 -88 14Z" fill="#e7699c" />
                <path d="M12 22C8 46 -8 62 -28 66C-22 50 -16 36 -14 20Z" fill="#e7699c" />
                <path d="M-97 8C-74 -30 -15 -50 36 -42C64 -37 84 -20 84 0C84 24 50 42 0 40C-40 38 -76 24 -97 8Z" fill="#ff8fb8" />
                <path d="M-80 17C-40 36 20 44 60 24C76 16 82 6 84 0C84 24 50 42 0 40C-34 38 -62 28 -80 17Z" fill="#ffdce8" />
                <path d="M-38 -33C-30 -50 -12 -52 -2 -42Z" fill="#e7699c" />
                <rect x="66" y="-4" width="58" height="15" rx="7.5" fill="#ff8fb8" />
                <ellipse cx="57" cy="-11" rx="5.4" ry="6.4" fill="#2b2330" />
                <circle cx="59" cy="-13.5" r="2.1" fill="#fff" />
              </g>
            </motion.g>
            <motion.g key={`s${leap}`} fill="#fff" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0, 0, 1, 0] }} transition={{ duration: 1.5, times: [0, 0.12, 0.35, 0.7, 0.88, 1] }}>
              <ellipse cy="14" rx="30" ry="7" opacity="0.85" />
              <circle cx="-26" cy="-2" r="5" />
              <circle cx="24" cy="-6" r="4" />
              <circle cx="4" cy="-14" r="3.5" />
            </motion.g>
          </g>
        )}
      </svg>
      {/* Tap a world to hear about it: one sheet over the whole map (under the pins) that works out which world she touched. */}
      <button aria-label="Peru's three worlds" onClick={tap} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'none', border: 'none', padding: 0, zIndex: 1 }} />
    </div>
  )
}

/** A flat white cloud with a flat bottom, shaded underneath. */
function Cloud({ className, style }: { className: string; style: CSSProperties }) {
  return (
    <svg viewBox="-56 -44 112 62" aria-hidden className={className} style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <path d="M-44 14a16 16 0 0 1 4 -31a24 24 0 0 1 44 -8a19 19 0 0 1 34 12a14 14 0 0 1 4 27Z" fill="#fff" />
      <path d="M-44 14a16 16 0 0 1 -9 -9q28 8 62 2q22 -4 39 -6a14 14 0 0 1 -6 13Z" fill="#e4ddf6" />
    </svg>
  )
}
