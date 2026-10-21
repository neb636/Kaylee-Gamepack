// A kid's picture card at the barber (round 3): the hair they'd like, drawn on a round face (no words).
import type { Card } from './layout'

/** The hair a kid wants, as a little picture (no words): a round face and the hair drawn on it. */
export function CardPicture({ card, size = 84 }: { card: Card; size?: number | string }) {
  const ink = '#2B2330'
  const hair = card === 'spiky' ? '#FF8FB8' : card === 'pigtails' ? '#B9A6F5' : '#FFA94D'
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      {card === 'spiky' && <path d="M22 44 L26 14 L38 34 L46 8 L54 32 L64 10 L68 34 L80 16 L78 46 Z" fill={hair} stroke={ink} strokeWidth="4" strokeLinejoin="round" />}
      {card === 'pigtails' && (
        <>
          <ellipse cx="14" cy="58" rx="11" ry="20" fill={hair} stroke={ink} strokeWidth="4" />
          <ellipse cx="86" cy="58" rx="11" ry="20" fill={hair} stroke={ink} strokeWidth="4" />
          <circle cx="22" cy="42" r="6" fill="#FF4F9A" stroke={ink} strokeWidth="3" />
          <circle cx="78" cy="42" r="6" fill="#FF4F9A" stroke={ink} strokeWidth="3" />
        </>
      )}
      {card === 'curly' && [18, 32, 50, 68, 82, 25, 75].map((x, i) => <circle key={i} cx={x} cy={i < 5 ? 30 + Math.abs(x - 50) * 0.35 : 48} r="13" fill={hair} stroke={ink} strokeWidth="4" />)}
      <circle cx="50" cy="60" r="28" fill="#FFF1DC" stroke={ink} strokeWidth="4" />
      {card === 'pigtails' && <path d="M24 52 Q50 26 76 52 Q60 40 50 42 Q40 40 24 52 Z" fill={hair} stroke={ink} strokeWidth="4" strokeLinejoin="round" />}
      <circle cx="40" cy="60" r="4" fill={ink} />
      <circle cx="60" cy="60" r="4" fill={ink} />
      <path d="M41 71 Q50 78 59 71" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}
