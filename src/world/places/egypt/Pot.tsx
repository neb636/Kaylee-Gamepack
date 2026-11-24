// The old pot hiding in the sand on the Sphinx's back, drawn by hand in the Nile's look: one ink line, a clay base, a
// shade and a cream tone, with the Nile's lotus painted on its belly. It sits in a square box, so it can break into
// bands (clip-path insets) and fit back together.
import type { CSSProperties } from 'react'
import { INK } from '../../kit/ink'
import { LotusArt } from './Lotus'

const CLAY = '#F7A98C'
const SHADE = '#E88D74'
const CREAM = '#FFF1D6'
const LILAC = '#C9B8F6'
const GOLD = '#FFD766'
const ink = (w = 4) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })
const BODY = 'M76 12 C70 12 68 18 72 22 C78 30 80 40 78 50 C54 60 36 84 36 114 C36 146 56 168 80 176 C76 180 72 184 72 188 C72 192 76 194 82 194 L118 194 C124 194 128 192 128 188 C128 184 124 180 120 176 C144 168 164 146 164 114 C164 84 146 60 122 50 C120 40 122 30 128 22 C132 18 130 12 124 12 Z'

/** The pot, whole. `style` sizes it (it keeps its square). */
export function Pot({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" style={{ display: 'block', width: '100%', height: '100%', ...style }}>
      <defs>
        <clipPath id="egypt-pot-body">
          <path d={BODY} />
        </clipPath>
      </defs>
      {/* the two handles, behind the neck */}
      <path d="M74 44 C40 30 26 52 34 74 C38 84 44 90 50 92" fill="none" {...ink(15)} />
      <path d="M74 44 C40 30 26 52 34 74 C38 84 44 90 50 92" fill="none" stroke={CLAY} strokeWidth="7.5" strokeLinecap="round" />
      <path d="M126 44 C160 30 174 52 166 74 C162 84 156 90 150 92" fill="none" {...ink(15)} />
      <path d="M126 44 C160 30 174 52 166 74 C162 84 156 90 150 92" fill="none" stroke={SHADE} strokeWidth="7.5" strokeLinecap="round" />
      <path d={BODY} fill={CLAY} />
      <g clipPath="url(#egypt-pot-body)">
        {/* the shaded side */}
        <path d="M128 0 C150 40 176 80 150 150 C142 172 128 184 128 200 L200 200 L200 0Z" fill={SHADE} opacity="0.75" />
        {/* painted bands: lilac at the neck, cream round the belly, lilac at the foot */}
        <rect x="60" y="26" width="80" height="12" fill={LILAC} />
        <path d="M20 88 Q100 100 180 88 L180 140 Q100 152 20 140Z" fill={CREAM} />
        <path d="M20 84 Q100 96 180 84 L180 90 Q100 102 20 90Z" fill={GOLD} />
        <path d="M20 138 Q100 150 180 138 L180 144 Q100 156 20 144Z" fill={GOLD} />
        <path d="M40 160 Q100 170 160 160 L160 168 Q100 178 40 168Z" fill={LILAC} />
        {/* a shine on the lit side */}
        <path d="M52 100 C50 82 58 68 70 60" fill="none" stroke="#FFD9C4" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* the Nile's lotus on the belly, with a ripple of water on each side */}
      <path d="M44 112 q5 -5 10 0 t10 0 M46 124 q5 -5 10 0 t10 0 M136 112 q5 -5 10 0 t10 0 M134 124 q5 -5 10 0 t10 0" fill="none" stroke="#9C8BE0" strokeWidth="3.5" strokeLinecap="round" />
      <g transform="translate(64 88) scale(0.72)">
        <LotusArt pad={false} />
      </g>
      <path d={BODY} fill="none" {...ink()} />
      <path d="M74 21 H126" fill="none" {...ink(3)} />
    </svg>
  )
}
