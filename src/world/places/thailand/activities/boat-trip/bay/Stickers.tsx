// The trip album's nine animal stickers, drawn in code in the app's flat sticker style (a thick ink outline, flat
// fills, big shiny eyes, blush, a white sticker border). Not found yet: a soft lavender silhouette with a sparkle, so
// she can see there's more to find (nothing is ever missed for good).
import type { ReactNode } from 'react'
import type { CritterId } from './critters'

const INK = '#2B2330'
const S = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** Big shiny eyes at (x, y), radius r. */
const Eye = ({ x, y, r = 5 }: { x: number; y: number; r?: number }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r * 0.85} ry={r} fill={INK} />
    <circle cx={x + r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
  </g>
)
const Blush = ({ x, y }: { x: number; y: number }) => <ellipse cx={x} cy={y} rx={5} ry={3} fill="#FF9DB8" />

const ART: Record<CritterId, ReactNode> = {
  needlefish: (
    <g>
      <path d="M12 56 Q40 40 72 50 L94 46 L74 56 Q42 66 12 56 Z" fill="#B8E6D8" {...S} />
      <path d="M12 56 L4 46 L6 60 Z" fill="#7FCDB5" {...S} />
      <path d="M30 50 Q46 40 62 47" fill="none" stroke="#7FCDB5" strokeWidth={5} strokeLinecap="round" />
      <Eye x={64} y={52} r={4.5} />
      <Blush x={56} y={58} />
    </g>
  ),
  eagle: (
    <g>
      <path d="M8 52 Q24 30 44 46 L56 46 Q76 30 92 52 Q72 50 60 62 L40 62 Q28 50 8 52 Z" fill="#8E8AA8" {...S} />
      <ellipse cx={50} cy={60} rx={14} ry={18} fill="#fff" {...S} />
      <circle cx={50} cy={36} r={13} fill="#fff" {...S} />
      <path d="M50 40 L58 44 L50 48 Z" fill="#FFC83D" {...S} strokeWidth={3} />
      <Eye x={45} y={34} r={3.8} />
      <Eye x={55} y={34} r={3.8} />
      <Blush x={42} y={42} />
    </g>
  ),
  macaque: (
    <g>
      <path d="M70 80 Q92 76 84 56" fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d="M70 80 Q92 76 84 56" fill="none" stroke="#B9A28E" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={50} cy={70} rx={20} ry={18} fill="#B9A28E" {...S} />
      <circle cx={28} cy={40} r={8} fill="#B9A28E" {...S} />
      <circle cx={72} cy={40} r={8} fill="#B9A28E" {...S} />
      <circle cx={50} cy={42} r={20} fill="#B9A28E" {...S} />
      <ellipse cx={50} cy={46} rx={14} ry={12} fill="#FFB8B0" {...S} strokeWidth={3} />
      <Eye x={44} y={42} r={3.6} />
      <Eye x={56} y={42} r={3.6} />
      <path d="M46 51 Q50 54 54 51" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
  ),
  cat: (
    <g>
      <path d="M72 76 Q92 70 86 50" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M72 76 Q92 70 86 50" fill="none" stroke="#FFB66E" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={50} cy={70} rx={22} ry={18} fill="#FFB66E" {...S} />
      <path d="M30 36 L32 16 L44 28 Z M70 36 L68 16 L56 28 Z" fill="#FFB66E" {...S} />
      <circle cx={50} cy={40} r={20} fill="#FFB66E" {...S} />
      <ellipse cx={50} cy={48} rx={10} ry={7} fill="#FFF1DC" />
      <Eye x={42} y={38} r={4} />
      <Eye x={58} y={38} r={4} />
      <circle cx={50} cy={45} r={2.5} fill="#FF4F9A" />
      <Blush x={36} y={48} />
      <Blush x={64} y={48} />
    </g>
  ),
  crab: (
    <g>
      <path d="M66 50 Q78 30 88 26" fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d="M66 50 Q78 30 88 26" fill="none" stroke="#FF7F6E" strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={86} cy={22} rx={12} ry={9} fill="#FFE9A8" {...S} />
      <path d="M20 66 L10 76 M26 70 L18 82 M74 70 L82 80" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={46} cy={62} rx={28} ry={16} fill="#FF7F6E" {...S} />
      <circle cx={22} cy={56} r={5} fill="#FF7F6E" {...S} strokeWidth={3} />
      <path d="M38 48 L36 34 M54 48 L56 34" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <Eye x={36} y={32} r={4.5} />
      <Eye x={56} y={32} r={4.5} />
      <Blush x={34} y={64} />
      <Blush x={58} y={64} />
    </g>
  ),
  mudskipper: (
    <g>
      <ellipse cx={50} cy={78} rx={40} ry={7} fill="#B98E6E" />
      <path d="M16 64 Q20 46 50 46 Q78 46 80 62 Q78 74 50 74 Q24 74 16 64 Z" fill="#9C8FA8" {...S} />
      <path d="M16 64 L4 54 L6 72 Z" fill="#9C8FA8" {...S} />
      <path d="M36 46 Q46 30 58 46" fill="#8DB7E8" {...S} strokeWidth={3} />
      <circle cx={42} cy={58} r={2.5} fill="#6FC3E8" />
      <circle cx={52} cy={64} r={2.5} fill="#6FC3E8" />
      <Eye x={64} y={44} r={5.5} />
      <Eye x={74} y={46} r={5} />
      <Blush x={70} y={62} />
    </g>
  ),
  lizard: (
    <g>
      <path d="M30 60 Q10 60 8 78 Q20 66 34 70" fill="#6F7A8E" {...S} />
      <ellipse cx={48} cy={62} rx={22} ry={12} fill="#6F7A8E" {...S} />
      <ellipse cx={76} cy={52} rx={16} ry={10} fill="#6F7A8E" {...S} />
      <path d="M90 54 L98 52 M90 54 L98 58" stroke="#FF4F9A" strokeWidth={3} strokeLinecap="round" />
      <circle cx={42} cy={58} r={3} fill="#F6E08A" />
      <circle cx={52} cy={64} r={3} fill="#F6E08A" />
      <path d="M34 72 L30 82 M60 72 L64 82" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <Eye x={78} y={48} r={4} />
      <Blush x={84} y={56} />
    </g>
  ),
  kingfisher: (
    <g>
      <path d="M20 84 L80 84" stroke="#8C6A55" strokeWidth={6} strokeLinecap="round" />
      <path d="M38 70 L24 84 L40 78 Z" fill="#2F86D0" {...S} />
      <ellipse cx={48} cy={60} rx={18} ry={20} fill="#FFAA5C" {...S} />
      <path d="M32 54 Q30 74 48 78 Q40 64 46 50 Z" fill="#3FA8F0" {...S} />
      <circle cx={52} cy={36} r={15} fill="#3FA8F0" {...S} />
      <path d="M64 36 L92 40 L64 44 Z" fill={INK} {...S} strokeWidth={3} />
      <ellipse cx={52} cy={44} rx={6} ry={3} fill="#fff" />
      <Eye x={56} y={34} r={4} />
      <Blush x={48} y={42} />
    </g>
  ),
  porpoise: (
    <g>
      <path d="M6 66 Q26 58 32 66" fill="#7FB2E8" opacity={0.6} />
      <path d="M14 62 Q20 34 56 34 Q86 36 90 56 Q86 70 56 70 Q30 72 14 62 Z" fill="#A9B4CC" {...S} />
      <path d="M14 62 L4 54 L4 70 Z" fill="#A9B4CC" {...S} />
      <path d="M40 66 Q58 74 82 62 Q74 70 56 70 Q44 70 40 66 Z" fill="#D7DEEC" />
      <path d="M70 58 Q78 62 86 56" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <Eye x={74} y={48} r={4.5} />
      <Blush x={80} y={58} />
    </g>
  ),
}

/** One sticker (`found` = in color, otherwise a silhouette waiting to be found). */
export function Sticker({ id, found, size = 88 }: { id: CritterId; found: boolean; size?: number }) {
  return (
    <svg viewBox="-6 -6 112 112" width={size} height={size} aria-hidden style={{ display: 'block', overflow: 'visible' }}>
      {found ? (
        // The white sticker border (four hard white shadows round the drawing), and a soft shadow under it.
        <g style={{ filter: 'drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(0 3px 3px rgba(43,35,48,.3))' }}>{ART[id]}</g>
      ) : (
        <>
          <g opacity={0.35} style={{ filter: 'grayscale(1) brightness(1.4)' }}>
            {ART[id]}
          </g>
          <text x={82} y={22} fontSize={26} textAnchor="middle">
            ✨
          </text>
        </>
      )}
    </svg>
  )
}
