// Krabi's fork on Daddy's "Where to?" card (trip/legs/WhereTo.tsx): a postcard for each place, drawn flat like the
// signpost's boards (ink outlines, pastel fills, no words): Baan Chang's elephant under the palms with a banana in her
// trunk, and the longtail with its ribbons among Phang Nga Bay's rock towers. Another place at the fork is one more
// entry here.
import type { Postcard } from '../../trip/legs/WhereTo'

const INK = '#2B2330'
const line = { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round', strokeLinecap: 'round' } as const

function Elephants() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%" style={{ display: 'block' }}>
      <rect width="160" height="120" fill="#BFE6FF" />
      <circle cx="132" cy="22" r="11" fill="#FFE16B" {...line} />
      <rect y="88" width="160" height="32" fill="#B5D58E" />
      <path d="M0 88 H160" {...line} />
      {/* Two palms. */}
      {[
        [20, 1],
        [146, -1],
      ].map(([x, s]) => (
        <g key={x}>
          <path d={`M${x - 4} 90 Q${x + s * 2} 60 ${x + s * 6} 30 L${x + s * 6 + 6} 31 Q${x + s * 8 + 2} 60 ${x + 5} 90 Z`} fill="#C9955E" {...line} />
          {[-60, -20, 20, 60, 100].map((a) => (
            <ellipse key={a} cx={x + s * 6 + 3} cy="30" rx="17" ry="5" fill="#6FBF7F" {...line} transform={`rotate(${a} ${x + s * 6 + 3} 30) translate(13 0)`} />
          ))}
        </g>
      ))}
      {/* The elephant, facing right: legs, tail, body, head, the pink ear, the trunk curling up with a banana. */}
      {[48, 60, 78, 90].map((x) => (
        <rect key={x} x={x} y="80" width="11" height="22" rx="4" fill="#B9B3D6" {...line} />
      ))}
      <path d="M41 70 Q33 76 35 86" fill="none" {...line} />
      <ellipse cx="70" cy="72" rx="32" ry="22" fill="#B9B3D6" {...line} />
      <path d="M112 64 Q118 92 136 80" fill="none" stroke={INK} strokeWidth="13" strokeLinecap="round" />
      <path d="M112 64 Q118 92 136 80" fill="none" stroke="#B9B3D6" strokeWidth="6.5" strokeLinecap="round" />
      <circle cx="104" cy="58" r="18" fill="#B9B3D6" {...line} />
      <ellipse cx="92" cy="60" rx="11" ry="14" fill="#FFB8CC" {...line} />
      <circle cx="109" cy="54" r="2.6" fill={INK} />
      <circle cx="112" cy="64" r="3.2" fill="#FF9CC0" />
      <path d="M132 76 Q140 62 152 66 Q142 70 136 80 Z" fill="#FFD84A" {...line} />
    </svg>
  )
}

function Longtail() {
  return (
    <svg viewBox="0 0 160 120" width="100%" height="100%" style={{ display: 'block' }}>
      <rect width="160" height="120" fill="#BFE6FF" />
      <circle cx="80" cy="20" r="10" fill="#FFE16B" {...line} />
      {/* The rock towers (tall, bulging, a notch at the foot), with jungle tufts on top. */}
      <path d="M8 80 Q4 56 12 40 Q16 30 26 30 Q38 30 40 44 Q44 62 42 80 Z" fill="#C9C1D9" {...line} />
      <path d="M118 80 Q112 50 120 30 Q126 18 138 20 Q150 22 150 40 Q154 62 152 80 Z" fill="#C9C1D9" {...line} />
      {[
        [16, 33],
        [25, 28],
        [34, 33],
        [124, 23],
        [134, 18],
        [145, 24],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="7.5" fill="#6FBF7F" {...line} />
      ))}
      <path d="M20 66 Q24 72 22 78 M132 58 Q137 66 134 76" fill="none" stroke="#A79FC2" strokeWidth="3" strokeLinecap="round" />
      <rect y="78" width="160" height="42" fill="#7FC8F0" />
      <path d="M0 78 H160" {...line} />
      {[
        [18, 108],
        [128, 106],
        [70, 114],
      ].map(([x, y]) => (
        <path key={x} d={`M${x} ${y} q5 -5 10 0 q5 5 10 0`} fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      ))}
      {/* The longtail: the long engine pole off the stern, the hull rising to a tall bow, the ribbons tied on it. */}
      <path d="M44 86 L18 104" {...line} strokeWidth={4} />
      <rect x="38" y="76" width="14" height="11" rx="3" fill="#9C95C4" {...line} />
      <path d="M40 86 L112 86 Q124 82 134 58 L138 60 Q132 96 104 98 L52 98 Q42 96 40 86 Z" fill="#C99A6E" {...line} />
      <path d="M48 91 H118" stroke="#FF8FB8" strokeWidth="3" />
      {['#FF4F9A', '#FFC83D', '#8FE3C8'].map((c, i) => (
        <path key={c} d={`M${134 + i * 2} ${60 + i * 3} q8 ${4 + i * 3} 4 ${14 + i * 2}`} fill="none" stroke={c} strokeWidth="5" strokeLinecap="round" />
      ))}
    </svg>
  )
}

/** The fork's two places, the elephants first (up the side road). */
export const FORK_CARDS: Postcard[] = [
  { id: 'chang', label: 'Elephants', color: '#FFD3E4', picture: <Elephants /> },
  { id: 'pier', label: 'Boat trip', color: '#CDEBFF', picture: <Longtail /> },
]
