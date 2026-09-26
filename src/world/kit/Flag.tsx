// Real flags as crisp SVG (never generated art, so the stars and stripes are exactly right).
import { motion } from 'motion/react'
import { useId, type CSSProperties, type ReactElement } from 'react'

export type FlagId = 'australia' | 'china' | 'thailand' | 'egypt'

/** Points of a star polygon centred on (cx, cy). */
export function starPoints(cx: number, cy: number, outer: number, points: number, innerRatio = 4 / 9) {
  const out: string[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : outer * innerRatio
    const a = (Math.PI * i) / points - Math.PI / 2
    out.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`)
  }
  return out.join(' ')
}

// Australian flag on a 10080 x 5040 grid (the official construction sheet).
export const SOUTHERN_CROSS = [
  { name: 'Gamma', x: 7560, y: 840, r: 360, points: 7 },
  { name: 'Delta', x: 8680, y: 1869, r: 360, points: 7 },
  { name: 'Epsilon', x: 8064, y: 2730, r: 210, points: 5 },
  { name: 'Beta', x: 6300, y: 2205, r: 360, points: 7 },
  { name: 'Alpha', x: 7560, y: 4200, r: 360, points: 7 },
] as const
export const COMMONWEALTH_STAR = { x: 2520, y: 3780, r: 756, points: 7 }

function UnionJack({ id }: { id: string }) {
  return (
    <g transform="scale(84)">
      <clipPath id={`${id}s`}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={`${id}t`}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${id}s)`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}t)`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </g>
  )
}

export interface AustraliaFlagParts {
  /** How many Southern Cross stars are on it (0-5), in SOUTHERN_CROSS order. */
  crossStars?: number
  bigStar?: boolean
  /** Show a dashed outline where the big star goes. */
  bigStarSlot?: boolean
}

function Australia({ crossStars = 5, bigStar = true, bigStarSlot = false }: AustraliaFlagParts) {
  const id = useId().replace(/:/g, '')
  const c = COMMONWEALTH_STAR
  return (
    <>
      <rect width="10080" height="5040" fill="#012169" />
      <UnionJack id={id} />
      {bigStarSlot && !bigStar && (
        <polygon points={starPoints(c.x, c.y, c.r, 7)} fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="70" strokeDasharray="160 120" />
      )}
      {bigStar && <motion.polygon initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformOrigin: `${c.x}px ${c.y}px` }} points={starPoints(c.x, c.y, c.r, 7)} fill="#fff" />}
      {SOUTHERN_CROSS.slice(0, crossStars).map((s) => (
        <motion.polygon
          key={s.name}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          style={{ transformOrigin: `${s.x}px ${s.y}px` }}
          points={starPoints(s.x, s.y, s.r, s.points)}
          fill="#fff"
        />
      ))}
    </>
  )
}

function China() {
  // 30 x 20 grid.
  const small = [
    [10, 2, 18],
    [12, 4, 45],
    [12, 7, 70],
    [10, 9, 90],
  ]
  return (
    <g transform="scale(336 252)">
      <rect width="30" height="20" fill="#EE1C25" />
      <polygon points={starPoints(5, 5, 3, 5, 0.382)} fill="#FFFF00" />
      {small.map(([x, y, rot]) => (
        <polygon key={`${x}-${y}`} points={starPoints(x, y, 1, 5, 0.382)} fill="#FFFF00" transform={`rotate(${rot} ${x} ${y})`} />
      ))}
    </g>
  )
}

function Thailand() {
  // Stripes 1:1:2:1:1.
  return (
    <>
      <rect width="10080" height="5040" fill="#A51931" />
      <rect y="840" width="10080" height="3360" fill="#F4F5F8" />
      <rect y="1680" width="10080" height="1680" fill="#2D2A4A" />
    </>
  )
}

function Egypt() {
  return (
    <>
      <rect width="10080" height="1680" fill="#CE1126" />
      <rect y="1680" width="10080" height="1680" fill="#fff" />
      <rect y="3360" width="10080" height="1680" fill="#000" />
      {/* The golden Eagle of Saladin, simplified. */}
      <g fill="#C09300">
        <ellipse cx="5040" cy="2520" rx="420" ry="620" />
        <circle cx="5040" cy="1830" r="210" />
        <path d="M4640,2300 L3900,1900 L4180,2650 Z M5440,2300 L6180,1900 L5900,2650 Z" />
      </g>
    </>
  )
}

const FLAGS: Record<FlagId, () => ReactElement> = { australia: () => <Australia />, china: China, thailand: Thailand, egypt: Egypt }

/** A flag with a white rounded border. Width sets the size (flags here are all 2:1). */
export function Flag({ id, width = 200, parts, style }: { id: FlagId; width?: number | string; parts?: AustraliaFlagParts; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 10080 5040"
      role="img"
      aria-label={`${id} flag`}
      style={{ width, height: 'auto', aspectRatio: '2 / 1', borderRadius: 'min(14px, 8%)', border: '4px solid #fff', boxShadow: 'var(--shadow)', display: 'block', background: '#fff', ...style }}
    >
      {id === 'australia' ? <Australia {...parts} /> : FLAGS[id]()}
    </svg>
  )
}
