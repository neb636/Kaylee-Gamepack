// Greybox shapes (gate 1): flat placeholder drawings for the foods, the cafe tools and the elephants, so the toy can be
// played on the iPad before any art is generated. Gate 2 replaces them with art from Dad's photos and elephant puppets.
// Everything is drawn around (0, 0): foods centred, tools and elephants standing on it.
import type { FoodKind } from './layout'

export const INK = '#3B2A3F'
export const COLORS = {
  coffee: '#6B3E26',
  latte: '#C89B6D',
  milk: '#FFF6EC',
  choc: '#7A4A2E',
  cocoa: '#B07A55',
  elephant: '#A9A3B3',
  elephantDark: '#8D8698',
  belly: '#C3BDCB',
  straw: { pink: '#FF8FB8', purple: '#B48CF2', yellow: '#FFD84D' },
} as const
export type StrawColor = keyof typeof COLORS.straw

const line = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** A food, about 100 units across (a whole watermelon is bigger). */
export function Food({ kind }: { kind: FoodKind }) {
  switch (kind) {
    case 'banana':
      return (
        <g {...line}>
          <path d="M-52 -20Q0 70 52 -22Q0 10 -52 -20Z" fill="#FFD84D" />
          <path d="M-52 -20L-60 -30" />
        </g>
      )
    case 'cucumber':
      return (
        <g {...line}>
          <rect x="-48" y="-16" width="96" height="32" rx="16" fill="#6DBF5B" transform="rotate(-20)" />
          <path d="M-20 -2L-14 -4M4 -8L10 -10M24 -14L30 -16" stroke="#3E8A33" />
        </g>
      )
    case 'sugarcane':
      return (
        <g {...line} transform="rotate(-25)">
          <rect x="-13" y="-62" width="26" height="124" rx="8" fill="#B5CF56" />
          <path d="M-13 -22H13M-13 18H13" />
          <path d="M0 -62Q20 -84 30 -76" fill="none" stroke="#5E9A3A" />
        </g>
      )
    case 'pineapple':
      return (
        <g {...line}>
          <path d="M-14 -36L-22 -66L-4 -46L0 -72L6 -46L22 -66L14 -36Z" fill="#5FB451" />
          <ellipse cx="0" cy="8" rx="32" ry="42" fill="#F5B342" />
          <path d="M-22 -10L22 30M-22 26L22 -14" stroke="#C47B1E" strokeWidth="3" />
        </g>
      )
    case 'corn':
      return (
        <g {...line}>
          <ellipse cx="0" cy="0" rx="22" ry="46" fill="#FFD95A" />
          <path d="M-22 10Q-34 -20 -6 -46Q-16 -6 -2 40Z" fill="#7CC26A" />
          <path d="M22 10Q34 -20 6 -46Q16 -6 2 40Z" fill="#7CC26A" />
        </g>
      )
    case 'watermelon':
      return (
        <g {...line}>
          <ellipse cx="0" cy="0" rx="66" ry="54" fill="#4CAF50" />
          <path d="M-36 -42Q-46 0 -36 42M0 -54Q-8 0 0 54M36 -42Q46 0 36 42" fill="none" stroke="#2E7D32" strokeWidth="6" />
        </g>
      )
    case 'slice':
      return (
        <g {...line}>
          <path d="M-46 -8A46 46 0 0 0 46 -8Z" fill="#FF6B6B" stroke="#4CAF50" strokeWidth="9" />
          <path d="M-46 -8A46 46 0 0 0 46 -8Z" fill="none" />
          <circle cx="-14" cy="8" r="3" fill={INK} stroke="none" />
          <circle cx="10" cy="14" r="3" fill={INK} stroke="none" />
          <circle cx="0" cy="2" r="3" fill={INK} stroke="none" />
        </g>
      )
  }
}

/** The coffee pot (spout toward +x). */
export function Pot() {
  return (
    <g {...line}>
      <path d="M40 -120L82 -146L78 -134L46 -100Z" fill="#4A4F5C" />
      <rect x="-50" y="-150" width="100" height="150" rx="18" fill="#4A4F5C" />
      <rect x="-50" y="-150" width="100" height="40" rx="14" fill="#6B7180" />
      <path d="M-50 -110Q-92 -90 -50 -40" fill="none" strokeWidth="9" />
      <rect x="-50" y="-150" width="100" height="150" rx="18" fill="none" />
    </g>
  )
}

/** The milk jug (spout toward +x). */
export function Jug() {
  return (
    <g {...line}>
      <path d="M-46 -140H40L62 -152L52 -118L46 0H-46Z" fill="#E8F4FF" />
      <path d="M-46 -110Q-86 -80 -46 -40" fill="none" strokeWidth="9" />
      <rect x="-30" y="-90" width="60" height="40" rx="10" fill="#7FB2FF" strokeWidth="3" />
    </g>
  )
}

/** The chocolate syrup bottle (nozzle up; it squeezes upside down). */
export function Syrup() {
  return (
    <g {...line}>
      <rect x="-30" y="-150" width="60" height="150" rx="16" fill={COLORS.choc} />
      <path d="M-14 -150L-6 -180H6L14 -150Z" fill="#FF8FB8" />
      <rect x="-20" y="-110" width="40" height="44" rx="8" fill="#FFF6EC" strokeWidth="3" />
    </g>
  )
}

/** The ice bucket, with cubes peeking out. */
export function IceBucket() {
  return (
    <g {...line}>
      {[-34, 0, 34].map((x, i) => (
        <rect key={i} x={x - 18} y={-118 + (i % 2) * 8} width="36" height="36" rx="6" fill="#DFF4FF" strokeWidth="4" />
      ))}
      <path d="M-74 -96H74L60 0H-60Z" fill="#7FB2FF" />
    </g>
  )
}

export function Cube() {
  return <rect x="-20" y="-20" width="40" height="40" rx="7" fill="#DFF4FF" stroke={INK} strokeWidth="4" opacity="0.95" />
}

/** The spoon: its bowl is at (0, 0), the handle points up. */
export function Spoon() {
  return (
    <g {...line}>
      <rect x="-7" y="-210" width="14" height="190" rx="7" fill="#C8CCD6" />
      <ellipse cx="0" cy="-8" rx="20" ry="26" fill="#C8CCD6" />
    </g>
  )
}

/** A cup of straws in her three colors. */
export function StrawCup() {
  return (
    <g {...line}>
      {(['pink', 'purple', 'yellow'] as const).map((c, i) => (
        <rect key={c} x={-26 + i * 18} y={-150 + i * 6} width="12" height="110" rx="6" fill={COLORS.straw[c]} strokeWidth="3" transform={`rotate(${(i - 1) * 8} 0 -60)`} />
      ))}
      <path d="M-40 -70H40L34 0H-34Z" fill="#FFE27A" />
    </g>
  )
}

/** Daddy, a placeholder until his family character is drawn, sitting on a yellow beanbag. */
export function Daddy() {
  return (
    <g {...line}>
      <path d="M-90 0Q-100 -70 -40 -80Q20 -100 80 -60Q104 -20 90 0Z" fill="#E7B93C" />
      <ellipse cx="0" cy="-110" rx="46" ry="56" fill="#9FC9F0" />
      <circle cx="0" cy="-190" r="40" fill="#FFD9B8" />
      <circle cx="-13" cy="-196" r="5" fill={INK} stroke="none" />
      <circle cx="13" cy="-196" r="5" fill={INK} stroke="none" />
      <path d="M-14 -176Q0 -166 14 -176" fill="none" strokeWidth="4" />
      <text x="0" y="-120" textAnchor="middle" fontSize="26" fontWeight="700" fill={INK} stroke="none" fontFamily="Fredoka, sans-serif">
        Daddy
      </text>
    </g>
  )
}

export function Beanbag() {
  return <path d="M-80 0Q-92 -60 -36 -74Q20 -96 72 -56Q96 -20 82 0Z" fill="#E7B93C" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
}

/** A round wooden table, side view. */
export function Table() {
  return (
    <g {...line}>
      <rect x="-30" y="-70" width="60" height="70" fill="#C98A52" />
      <rect x="-90" y="-86" width="180" height="22" rx="10" fill="#B9A58A" />
    </g>
  )
}
