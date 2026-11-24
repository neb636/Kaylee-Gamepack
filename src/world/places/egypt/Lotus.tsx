// The pink lotus, Egypt's flower, drawn by hand: floating on the Nile on its lily pad, strung on the felucca's garland,
// and worn by the hippo as a crown.
import type { CSSProperties } from 'react'
import { INK } from '../../kit/ink'

const PETAL = 'M0 0 C-13 -12 -11 -34 0 -46 C11 -34 13 -12 0 0Z'
const line = { stroke: INK, strokeWidth: 3, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

/** The drawing itself, in a 100 x 84 box (the flower's base is at 50, 64), for use inside another SVG. */
export function LotusArt({ pad = true }: { pad?: boolean }) {
  return (
    <>
      {pad && (
        <>
          <path d="M50 51 C78 51 96 57 96 66 C96 75 78 81 50 81 C22 81 4 75 4 66 C4 57 22 51 50 51Z" fill="#8FE3C8" {...line} />
          <path d="M50 66 L84 78" {...line} strokeWidth="2.4" fill="none" />
          <path d="M14 64 C22 58 34 56 46 56" stroke="#C7F3E4" strokeWidth="3" strokeLinecap="round" fill="none" />
        </>
      )}
      <g transform="translate(50 64)" {...line}>
        <path d={PETAL} fill="#F2609C" transform="rotate(-74) scale(0.9)" />
        <path d={PETAL} fill="#F2609C" transform="rotate(74) scale(0.9)" />
        <path d={PETAL} fill="#FF6FA8" transform="rotate(-42)" />
        <path d={PETAL} fill="#FF6FA8" transform="rotate(42)" />
        <path d={PETAL} fill="#FF8FB8" transform="scale(1.06)" />
        <g fill="#FFD766" stroke="none">
          <circle cx="-7" cy="-33" r="3" />
          <circle cx="0" cy="-36" r="3" />
          <circle cx="7" cy="-33" r="3" />
        </g>
        <path d={PETAL} fill="#FF8FB8" transform="rotate(-24) scale(0.82)" />
        <path d={PETAL} fill="#FF8FB8" transform="rotate(24) scale(0.82)" />
        <path d={PETAL} fill="#FFC4DA" transform="scale(0.72)" />
      </g>
    </>
  )
}

/** A lotus as its own picture. On the water it sits on its lily pad; on the garland it's just the flower. */
export function Lotus({ pad = true, style }: { pad?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 84" style={{ display: 'block', overflow: 'visible', ...style }}>
      <LotusArt pad={pad} />
    </svg>
  )
}
