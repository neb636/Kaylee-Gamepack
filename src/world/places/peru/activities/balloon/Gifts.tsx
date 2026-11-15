// The presents, drawn in code in Peru's flat 5-unit-outline style: a gift bag with the present peeking out (so she can
// see what she's giving), the little parachute that opens when she lets go, and the five things a friend can wear.
import { INK } from '../../puppets/Alpaca'

export type GiftKind = 'party' | 'crown' | 'chullo' | 'bow' | 'shades'
export const GIFTS: GiftKind[] = ['party', 'crown', 'chullo', 'bow', 'shades']
/** Sunglasses go on the eyes; everything else sits on top of the head. */
export const ON_EYES: Record<GiftKind, boolean> = { party: false, crown: false, chullo: false, bow: false, shades: true }
const BAG: Record<GiftKind, { bag: string; band: string }> = {
  party: { bag: '#FF8FB8', band: '#FFE27A' },
  crown: { bag: '#8FE3C8', band: '#FF8FB8' },
  chullo: { bag: '#FFE27A', band: '#D91023' },
  bow: { bag: '#B9A6F5', band: '#FFF7F0' },
  shades: { bag: '#7FB2FF', band: '#FF8FB8' },
}

/** What a friend wears, in a box 100 wide: head things sit on y = 0 and grow upward; sunglasses are centred on y = 0. */
export function WornItem({ kind }: { kind: GiftKind }) {
  const s = { stroke: INK, strokeWidth: 5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }
  switch (kind) {
    case 'party':
      return (
        <g {...s}>
          <path d="M-30 0L0 -78L30 0Z" fill="#FF5FA2" />
          <path d="M-21 -24L21 -24M-12 -48L12 -48" fill="none" stroke="#FFE27A" strokeWidth="7" />
          <path d="M-30 0Q0 10 30 0" fill="none" />
          <circle cx="0" cy="-82" r="11" fill="#FFE27A" />
        </g>
      )
    case 'crown':
      // A ring of kantuta flowers, Peru's national flower (red, pink and yellow bells).
      return (
        <g {...s}>
          <path d="M-46 -2Q0 -26 46 -2" fill="none" stroke="#5BAE5B" strokeWidth="10" />
          {[
            [-40, -8, '#D91023'],
            [-20, -18, '#FF8FB8'],
            [0, -22, '#FFE27A'],
            [20, -18, '#FF8FB8'],
            [40, -8, '#D91023'],
          ].map(([x, y, c]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <path d="M-11 -10Q0 -20 11 -10L8 8Q0 13 -8 8Z" fill={c as string} />
              <circle cx="0" cy="-4" r="3" fill={INK} stroke="none" />
            </g>
          ))}
        </g>
      )
    case 'chullo':
      // A chullo: the Andes' knitted hat with ear flaps and tassels.
      return (
        <g {...s}>
          <path d="M-38 4L-38 26" fill="none" strokeWidth="4" />
          <path d="M38 4L38 26" fill="none" strokeWidth="4" />
          <circle cx="-38" cy="30" r="7" fill="#FFE27A" />
          <circle cx="38" cy="30" r="7" fill="#FFE27A" />
          <path d="M-40 4Q-44 -56 0 -58Q44 -56 40 4L28 14L18 2H-18L-28 14Z" fill="#D91023" />
          <path d="M-36 -18L-26 -28L-16 -18L-6 -28L4 -18L14 -28L24 -18L34 -28" fill="none" stroke="#FFF7F0" strokeWidth="5" />
          <path d="M-30 -40L-20 -34L-10 -40L0 -34L10 -40L20 -34L30 -40" fill="none" stroke="#FFE27A" strokeWidth="5" />
          <circle cx="0" cy="-64" r="11" fill="#FF8FB8" />
        </g>
      )
    case 'bow':
      return (
        <g {...s}>
          <path d="M0 -20Q-34 -52 -46 -30Q-50 -6 0 -20Z" fill="#FF5FA2" />
          <path d="M0 -20Q34 -52 46 -30Q50 -6 0 -20Z" fill="#FF5FA2" />
          <path d="M-4 -18L-16 6M4 -18L16 6" fill="none" stroke="#FF5FA2" strokeWidth="9" />
          <circle cx="0" cy="-20" r="10" fill="#FFB3D1" />
        </g>
      )
    case 'shades':
      // Heart-shaped sunglasses.
      return (
        <g {...s}>
          <path d="M-8 -4Q0 -10 8 -4" fill="none" />
          {[-1, 1].map((k) => (
            <g key={k} transform={`translate(${k * 26} 0)`}>
              <path d="M0 16Q-24 0 -22 -10Q-18 -22 -6 -16Q0 -12 0 -10Q0 -12 6 -16Q18 -22 22 -10Q24 0 0 16Z" fill="#6B4F8F" stroke="#FF5FA2" strokeWidth="6" />
              <path d="M-12 -10Q-8 -14 -4 -11" fill="none" stroke="#fff" strokeWidth="4" />
            </g>
          ))}
          <path d="M-48 -8L-60 -14M48 -8L60 -14" fill="none" stroke="#FF5FA2" strokeWidth="5" />
        </g>
      )
  }
}

/** A gift bag with its present peeking out of the top, and (when falling) a parachute opening above it. Centred on the
 *  bag; `chute` is 0..1 (closed to open). viewBox units: the bag is 100 wide. */
export function GiftBag({ kind, chute = 0, size }: { kind: GiftKind; chute?: number; size: number }) {
  const c = BAG[kind]
  const peek = ON_EYES[kind] ? 'translate(0 -44) scale(0.95)' : 'translate(0 -26) scale(0.95)'
  return (
    <svg viewBox="-70 -190 140 260" style={{ width: size * 1.4, height: size * 2.6, overflow: 'visible', display: 'block', marginLeft: -size * 0.7, marginTop: -size * 1.9 }}>
      {chute > 0.02 && (
        <g transform={`translate(0 -32) scale(${0.3 + chute * 0.7} ${chute}) translate(0 32)`}>
          <path d="M-34 -36L-62 -112M34 -36L62 -112M0 -36L0 -116M-14 -36L-30 -116M14 -36L30 -116" stroke={INK} strokeWidth="3" fill="none" />
          <path d="M-66 -112Q-66 -176 0 -178Q66 -176 66 -112Q52 -124 38 -112Q26 -124 12 -112Q0 -124 -12 -112Q-26 -124 -38 -112Q-52 -124 -66 -112Z" fill="#FFF7F0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
          <path d="M-38 -112Q-40 -160 -14 -176L12 -177Q-12 -150 -12 -112Q-26 -124 -38 -112Z" fill="#FF8FB8" />
          <path d="M38 -112Q40 -160 22 -174Q12 -150 12 -112Q26 -124 38 -112Z" fill="#B9A6F5" />
          <path d="M-66 -112Q-66 -176 0 -178Q66 -176 66 -112" fill="none" stroke={INK} strokeWidth="5" />
        </g>
      )}
      <g transform={peek}>
        <WornItem kind={kind} />
      </g>
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M-26 -34Q-26 -56 -12 -56Q0 -56 0 -40M26 -34Q26 -56 12 -56Q0 -56 0 -40" fill="none" />
        <path d="M-44 -34H44L38 52Q38 60 30 60H-30Q-38 60 -38 52Z" fill={c.bag} />
        <path d="M-41 0H41" stroke={c.band} strokeWidth="12" />
        <path d="M-44 -34H44L38 52Q38 60 30 60H-30Q-38 60 -38 52Z" fill="none" />
        <path d="M-28 -24Q-22 -28 -16 -24" fill="none" stroke="#fff" strokeWidth="4" opacity="0.7" />
      </g>
    </svg>
  )
}

/** A sky lantern: a warm paper lantern with a glowing heart. */
export function Lantern({ size, lit = 1 }: { size: number; lit?: number }) {
  return (
    <svg viewBox="-40 -60 80 110" style={{ width: size, height: size * 1.375, overflow: 'visible', display: 'block', marginLeft: -size / 2, marginTop: -size * 0.75 }}>
      <ellipse cx="0" cy="-4" rx={56} ry={64} fill="#FFD27A" opacity={0.28 * lit} />
      <path d="M-28 -50Q0 -60 28 -50L22 30Q0 38 -22 30Z" fill="#FFB347" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <path d="M-14 -46L-11 30M14 -46L11 30" stroke="#E8873A" strokeWidth="4" />
      <path d="M0 6Q-14 -6 -8 -14Q-2 -18 0 -12Q2 -18 8 -14Q14 -6 0 6Z" fill="#FFF3B0" opacity={0.4 + lit * 0.6} />
      <path d="M-14 34Q0 44 14 34" fill="none" stroke={INK} strokeWidth="4" />
    </svg>
  )
}
