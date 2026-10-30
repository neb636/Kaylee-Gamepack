// A friend's picture card (Decorate a Snowman, friends): the snowman they'd like, drawn with no words.
import type { Card } from './studio'

const INK = '#2B2330'
const RAINBOW = ['#FF6B6B', '#FFA94D', '#FFE066', '#8CE99A', '#74C0FC', '#B197FC']

/** The snowman a friend wants, as a little picture: a tuque and sash, a rainbow one, or a silly one. */
export function CardPicture({ card, size = 84 }: { card: Card; size?: number | string }) {
  const balls: [number, number][] = [
    [50, 76],
    [50, 50],
    [50, 30],
  ]
  const rs = [20, 15, 11]
  const fill = (i: number) => (card === 'rainbow' ? RAINBOW[(i * 2) % RAINBOW.length] : '#FFFFFF')
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {card === 'silly' && (
        <>
          {/* Sticks everywhere. */}
          <path d="M37 50 L18 40 M63 50 L82 40 M43 22 L36 8 M57 22 L64 8" stroke="#7A553E" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {card !== 'silly' && <path d="M36 50 L18 42 M64 50 L82 42" stroke="#7A553E" strokeWidth="4" strokeLinecap="round" />}
      {balls.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={rs[i]} fill={fill(i)} stroke={INK} strokeWidth="3.5" />
      ))}
      {/* Coal eyes and a smile. */}
      <circle cx="46" cy="28" r="2.2" fill={INK} />
      <circle cx="54" cy="28" r="2.2" fill={INK} />
      <path d="M45 34 Q50 38 55 34" fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M50 30 L60 32 L50 33 Z" fill="#FF8A3D" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      {card === 'tuque' && (
        <>
          <path d="M40 22 Q50 2 60 22 Z" fill="#E8443F" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
          <rect x="38" y="19" width="24" height="5" rx="2.5" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
          <circle cx="50" cy="6" r="4" fill="#FFFFFF" stroke={INK} strokeWidth="2.5" />
          <rect x="35" y="52" width="30" height="6" rx="3" fill="#E8443F" stroke={INK} strokeWidth="2.5" />
          <rect x="57" y="55" width="5" height="14" rx="2" fill="#4F7FD0" stroke={INK} strokeWidth="2" />
        </>
      )}
      {card === 'silly' && (
        <>
          {/* Carrots on his tummy too. */}
          <path d="M50 50 L62 52 L50 54 Z" fill="#FF8A3D" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M50 74 L62 76 L50 78 Z" fill="#FF8A3D" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}
