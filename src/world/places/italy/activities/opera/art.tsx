// The opera's look, drawn in code in Italy's sticker style (../../STYLE.md): one warm brown outline (INK), flat pastel
// fills, at most one shade band, kawaii faces. One straight-on, eye-level camera from the audience, like the other
// Italy scenes. The Arena di Verona: the four arches of its "Ala" on the rim, pink stone terraces where the audience
// lights little candles, a stage with red curtains, the backs of the audience's heads in front.
import type { CSSProperties } from 'react'
import { BLUSH, EYE, INK } from '../../puppets/ink'

const STONE = '#F6CDB0'
const STONE_SHADE = '#E9B293'
const STONE_DARK = '#C98B6B'
const STAGE = '#E4A77A'
const STAGE_SHADE = '#CF8C60'
const CURTAIN = '#E8574F'
const CURTAIN_SHADE = '#C9423D'

/** The sky's stars (they come out as the candles light the arena). */
export function Stars({ W, H, night }: { W: number; H: number; night: number }) {
  const stars = Array.from({ length: 26 }, (_, i) => ({ x: ((i * 137.5) % 100) / 100, y: ((i * 61.8) % 100) / 100, r: 2 + (i % 3) }))
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: night, transition: 'opacity 2s' }} aria-hidden>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x * W} cy={s.y * H} r={s.r} fill="#FFF4C8">
          <animate attributeName="opacity" values="1;0.35;1" dur={`${2 + (i % 4) * 0.7}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  )
}

/** A kawaii moon: closes one eye when she winks (`wink`). */
export function Moon({ r, wink }: { r: number; wink: boolean }) {
  return (
    <svg viewBox="-60 -60 120 120" width={r * 2} height={r * 2} style={{ display: 'block', overflow: 'visible' }}>
      <circle r={52} fill="#FFF4C8" stroke={INK} strokeWidth={5} />
      <circle cx={18} cy={-20} r={9} fill="#F6E3A6" />
      <circle cx={-22} cy={22} r={6} fill="#F6E3A6" />
      <circle cx={-14} cy={4} r={4.5} fill={EYE} />
      {wink ? <path d="M8 4 q6 -6 12 0" fill="none" stroke={EYE} strokeWidth={4} strokeLinecap="round" /> : <circle cx={14} cy={4} r={4.5} fill={EYE} />}
      <ellipse cx={-26} cy={14} rx={7} ry={4} fill={BLUSH} />
      <ellipse cx={26} cy={14} rx={7} ry={4} fill={BLUSH} />
      <path d="M-6 16 q6 6 12 0" fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  )
}

/** The arena: the Ala's four arches against the sky on the right, three pink stone terraces, the stage and curtains. */
export function Arena({ W, standsTop, stageBack, stageFront, top }: { W: number; standsTop: number; stageBack: number; stageFront: number; top: number }) {
  const rows = 3
  const terraceH = (stageBack - standsTop) / rows
  // The Ala: four tall arches (two storeys) standing on the rim, all that's left of the arena's outer ring.
  const alaH = Math.min((standsTop - top) * 0.85, terraceH * 2.4)
  const alaW = Math.min(W * 0.3, alaH * 1.25)
  const alaX = W * 0.6
  const arch = alaW / 4
  return (
    <svg width={W} height={stageFront + 8} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', overflow: 'visible' }} aria-hidden>
      {/* The Ala */}
      <g transform={`translate(${alaX}, ${standsTop - alaH})`}>
        <rect x={0} y={0} width={alaW} height={alaH + 10} fill={STONE} stroke={INK} strokeWidth={4} strokeLinejoin="round" rx={6} />
        <rect x={0} y={alaH * 0.48} width={alaW} height={alaH * 0.06} fill={STONE_SHADE} stroke={INK} strokeWidth={3} />
        {[0, 1, 2, 3].map((i) =>
          [0, 1].map((k) => {
            const x = i * arch + arch * 0.18
            const w = arch * 0.64
            const y = k === 0 ? alaH * 0.1 : alaH * 0.6
            const h = k === 0 ? alaH * 0.34 : alaH * 0.4
            return <path key={`${i}${k}`} d={`M${x} ${y + h} V${y + w / 2} a${w / 2} ${w / 2} 0 0 1 ${w} 0 V${y + h} Z`} fill="#5B4A8F" fillOpacity={0.55} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          }),
        )}
      </g>
      {/* The terraces: three rows of stone seats, each a little lighter on its top edge. */}
      {Array.from({ length: rows }, (_, r) => {
        const y = standsTop + r * terraceH
        return (
          <g key={r}>
            <path d={`M-10 ${y + 6} Q${W / 2} ${y - 8} ${W + 10} ${y + 6} V${y + terraceH + 4} H-10 Z`} fill={r % 2 ? STONE_SHADE : STONE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            <path d={`M-10 ${y + 14} Q${W / 2} ${y} ${W + 10} ${y + 14}`} fill="none" stroke="#FFE7D6" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
            {/* The stairs between the seats. */}
            {[0.22, 0.5, 0.78].map((f) => (
              <rect key={f} x={W * f - 9} y={y + 6} width={18} height={terraceH - 2} fill={STONE_DARK} opacity={0.35} />
            ))}
          </g>
        )
      })}
      {/* The stage: planks, a front edge in shade. */}
      <rect x={-10} y={stageBack} width={W + 20} height={stageFront - stageBack} fill={STAGE} stroke={INK} strokeWidth={5} />
      {[0.33, 0.62].map((f) => (
        <line key={f} x1={0} x2={W} y1={stageBack + (stageFront - stageBack) * f} y2={stageBack + (stageFront - stageBack) * f} stroke={STAGE_SHADE} strokeWidth={3} />
      ))}
      <rect x={-10} y={stageFront - 14} width={W + 20} height={14} fill={STAGE_SHADE} stroke={INK} strokeWidth={4} />
    </svg>
  )
}

/** One red curtain at the side of the stage (`side` -1 left, 1 right); it sways when poked. */
export function Curtain({ w, h }: { w: number; h: number }) {
  return (
    <svg viewBox="0 0 100 400" preserveAspectRatio="none" width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M0 0 H100 C90 120 70 220 82 400 H0 Z" fill={CURTAIN} stroke={INK} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path d="M30 0 C30 140 22 260 30 400 M62 0 C58 120 50 240 56 400" fill="none" stroke={CURTAIN_SHADE} strokeWidth={4} vectorEffect="non-scaling-stroke" />
      <path d="M0 250 Q50 236 92 262" fill="none" stroke="#FFC83D" strokeWidth={6} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  )
}

/** A little candle on the terraces: lit (flame and glow) or waiting. */
export function Candle({ lit, size }: { lit: boolean; size: number }) {
  return (
    <svg viewBox="-20 -34 40 54" width={size} height={size * 1.35} style={{ display: 'block', overflow: 'visible' }}>
      {lit && <circle cx={0} cy={-16} r={24} fill="#FFD84A" opacity={0.45} />}
      <rect x={-7} y={-6} width={14} height={22} rx={3} fill={lit ? '#FFF7F0' : '#E9D6CC'} stroke={INK} strokeWidth={3} />
      <line x1={0} y1={-6} x2={0} y2={-12} stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {lit && (
        <path d="M0 -30 C7 -20 8 -14 0 -10 C-8 -14 -7 -20 0 -30 Z" fill="#FFC83D" stroke={INK} strokeWidth={2.5} strokeLinejoin="round">
          <animateTransform attributeName="transform" type="scale" values="1 1;0.9 1.1;1 1" dur="0.6s" repeatCount="indefinite" additive="sum" />
        </path>
      )}
    </svg>
  )
}

/** The baby owl in the stands: eyes from wide open (1) to asleep (0); round and startled when the band is too loud. */
export function BabyOwl({ open, startled, size }: { open: number; startled: boolean; size: number }) {
  const eyeH = startled ? 15 : Math.max(1.5, open * 12)
  return (
    <svg viewBox="-60 -70 120 140" width={size} height={size * 1.17} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M-34 -40 L-40 -66 L-16 -50 Z M34 -40 L40 -66 L16 -50 Z" fill="#B98A66" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={0} cy={6} rx={46} ry={56} fill="#C9A27A" stroke={INK} strokeWidth={5} />
      <ellipse cx={0} cy={26} rx={28} ry={30} fill="#F7E7DA" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${s * 44} 0 Q${s * 60} 30 ${s * 38} 52`} fill="#B98A66" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <circle cx={s * 18} cy={-16} r={17} fill="#FFF7F0" stroke={INK} strokeWidth={3.5} />
          <ellipse cx={s * 18} cy={-16} rx={startled ? 9 : 8} ry={eyeH / 1.6} fill={EYE} />
          <ellipse cx={s * 32} cy={6} rx={7} ry={4} fill={BLUSH} />
        </g>
      ))}
      <path d="M-6 -2 L0 8 L6 -2 Z" fill="#FFC83D" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d="M-14 60 v8 M-6 60 v8 M6 60 v8 M14 60 v8" stroke="#FFC83D" strokeWidth={5} strokeLinecap="round" />
    </svg>
  )
}

/** A pigeon on the arena's rim (Gino's cousin). */
export function Pigeon({ size }: { size: number }) {
  return (
    <svg viewBox="-50 -44 100 80" width={size} height={size * 0.8} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M30 4 L52 -4 L44 14 Z" fill="#8E9AAE" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={4} cy={8} rx={34} ry={22} fill="#B7C1D1" stroke={INK} strokeWidth={4.5} />
      <path d="M-4 0 Q14 -6 28 8" fill="none" stroke="#8E9AAE" strokeWidth={5} strokeLinecap="round" />
      <circle cx={-24} cy={-16} r={16} fill="#B7C1D1" stroke={INK} strokeWidth={4.5} />
      <path d="M-34 -6 Q-22 6 -10 -4" fill="#9ED9B8" stroke={INK} strokeWidth={3} />
      <circle cx={-28} cy={-19} r={3.5} fill={EYE} />
      <ellipse cx={-32} cy={-10} rx={4} ry={2.5} fill={BLUSH} />
      <path d="M-40 -16 L-50 -12 L-40 -10 Z" fill="#FFC83D" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M-4 28 v8 M10 28 v8" stroke="#FF8FB8" strokeWidth={4.5} strokeLinecap="round" />
    </svg>
  )
}

const HEADS = [
  { fur: '#D9CCFF', ears: 'bunny' },
  { fur: '#FFC2A8', ears: 'cat' },
  { fur: '#C9A27A', ears: 'bear' },
  { fur: '#A8DCFF', ears: 'cat' },
  { fur: '#FF8FB8', ears: 'bunny' },
  { fur: '#FBEA9A', ears: 'bear' },
] as const

/** The back of an audience member's head in the front row: a bunny, a kitten or a bear cub. */
export function CrowdHead({ i, size }: { i: number; size: number }) {
  const h = HEADS[i % HEADS.length]
  return (
    <svg viewBox="-50 -70 100 130" width={size} height={size * 1.3} style={{ display: 'block', overflow: 'visible' }}>
      {h.ears === 'bunny' && (
        <g fill={h.fur} stroke={INK} strokeWidth={4.5}>
          <ellipse cx={-16} cy={-44} rx={10} ry={26} transform="rotate(-10 -16 -44)" />
          <ellipse cx={16} cy={-44} rx={10} ry={26} transform="rotate(10 16 -44)" />
        </g>
      )}
      {h.ears === 'cat' && <path d="M-36 -12 L-30 -48 L-6 -30 Z M36 -12 L30 -48 L6 -30 Z" fill={h.fur} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />}
      {h.ears === 'bear' && (
        <g fill={h.fur} stroke={INK} strokeWidth={4.5}>
          <circle cx={-28} cy={-28} r={13} />
          <circle cx={28} cy={-28} r={13} />
        </g>
      )}
      <path d="M-44 60 C-48 10 -40 -30 0 -32 C40 -30 48 10 44 60 Z" fill={h.fur} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M-30 -6 Q0 -20 30 -6" fill="none" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.45} />
    </svg>
  )
}

/** The conductor's podium, with its music stand. */
export function Podium({ w, h, style }: { w: number; h: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 120" preserveAspectRatio="none" width={w} height={h} style={{ display: 'block', overflow: 'visible', ...style }}>
      <path d="M8 18 H92 L86 120 H14 Z" fill="#B07A52" stroke={INK} strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <rect x={2} y={8} width={96} height={14} rx={5} fill="#C98B5B" stroke={INK} strokeWidth={5} vectorEffect="non-scaling-stroke" />
      <path d="M32 50 H68 M30 72 H70" stroke="#8A5A3C" strokeWidth={5} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      <circle cx={50} cy={60} r={7} fill="#FFC83D" stroke={INK} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** A kawaii star (the wand's tip and the Trevi wishing star). */
export function StarFace({ size, glow = false }: { size: number; glow?: boolean }) {
  return (
    <svg viewBox="-50 -50 100 100" width={size} height={size} style={{ display: 'block', overflow: 'visible', filter: glow ? 'drop-shadow(0 0 10px #FFF2A8)' : undefined }}>
      <path d="M0 -46 L13 -15 L46 -14 L20 7 L29 40 L0 21 L-29 40 L-20 7 L-46 -14 L-13 -15 Z" fill="#FFE27A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={-9} cy={0} r={3.5} fill={EYE} />
      <circle cx={9} cy={0} r={3.5} fill={EYE} />
      <path d="M-5 8 q5 5 10 0" fill="none" stroke={EYE} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={-17} cy={8} rx={5} ry={3} fill={BLUSH} />
      <ellipse cx={17} cy={8} rx={5} ry={3} fill={BLUSH} />
    </svg>
  )
}

/** A red rose thrown onto the stage. */
export function Rose({ size }: { size: number }) {
  return (
    <svg viewBox="-40 -40 80 100" width={size} height={size * 1.25} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M0 10 Q-6 34 0 56" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M0 10 Q-6 34 0 56" fill="none" stroke="#5DBB7A" strokeWidth={5} strokeLinecap="round" />
      <path d="M-2 34 Q-22 26 -24 38 Q-12 44 -2 38 Z" fill="#5DBB7A" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <circle r={24} fill="#E8574F" stroke={INK} strokeWidth={4.5} />
      <path d="M-12 -4 Q0 -18 12 -4 Q4 8 -6 2 Q2 -6 6 -2" fill="none" stroke="#B83A35" strokeWidth={3.5} strokeLinecap="round" />
    </svg>
  )
}

/** One of the Frecce Tricolori: a chubby blue jet, nose to the right. */
export function Jet({ size }: { size: number }) {
  return (
    <svg viewBox="-60 -24 120 48" width={size} height={size * 0.4} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M-40 -2 L-56 -20 L-34 -8 Z" fill="#4F74D0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-50 0 C-50 -12 30 -14 52 0 C30 14 -50 12 -50 0 Z" fill="#6E95E6" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M-6 4 L-22 22 L8 6 Z" fill="#4F74D0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M14 -8 C20 -12 32 -10 38 -4 L16 -3 Z" fill="#A8DCFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <circle cx={22} cy={4} r={2.5} fill={EYE} />
    </svg>
  )
}

/** Nino's little upright piano. */
export function Piano({ w }: { w: number }) {
  return (
    <svg viewBox="0 0 120 90" width={w} height={w * 0.75} style={{ display: 'block', overflow: 'visible' }}>
      <rect x={6} y={4} width={108} height={60} rx={8} fill="#FF8FB8" stroke={INK} strokeWidth={5} />
      <rect x={18} y={12} width={84} height={18} rx={4} fill="#FFC4D8" stroke={INK} strokeWidth={3} />
      <rect x={2} y={44} width={116} height={18} rx={3} fill="#FFF7F0" stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => k !== 2 && k !== 6 && <rect key={k} x={14 + k * 14} y={44} width={7} height={10} fill={INK} />)}
      <path d="M16 64 V86 M104 64 V86" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </svg>
  )
}

/** The picnic: a checked blanket with a pizza Margherita and gelato. */
export function Pizza({ size }: { size: number }) {
  return (
    <svg viewBox="-60 -60 120 120" width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
      <circle r={54} fill="#F2B872" stroke={INK} strokeWidth={5} />
      <circle r={44} fill="#E8574F" />
      {[
        [-18, -14],
        [16, -20],
        [4, 14],
        [-22, 20],
        [26, 12],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={11} ry={9} fill="#FFF7F0" stroke={INK} strokeWidth={2.5} />
      ))}
      {[
        [-2, -28],
        [30, -4],
        [-34, 0],
        [12, 30],
      ].map(([x, y], i) => (
        <path key={i} d={`M${x - 7} ${y} q7 -9 14 0 q-7 9 -14 0 Z`} fill="#5DBB7A" stroke={INK} strokeWidth={2.5} />
      ))}
    </svg>
  )
}

export function Gelato({ size }: { size: number }) {
  return (
    <svg viewBox="-40 -60 80 120" width={size * 0.67} height={size} style={{ display: 'block', overflow: 'visible' }}>
      <path d="M-24 0 L0 56 L24 0 Z" fill="#F2B872" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M-14 12 L8 34 M2 6 L14 18 M-6 30 L12 12" stroke="#D99A55" strokeWidth={3} />
      <circle cx={-12} cy={-10} r={18} fill="#FFC4D8" stroke={INK} strokeWidth={4.5} />
      <circle cx={12} cy={-10} r={18} fill="#8FE3C8" stroke={INK} strokeWidth={4.5} />
      <circle cx={0} cy={-32} r={18} fill="#FFF7F0" stroke={INK} strokeWidth={4.5} />
      <circle cx={2} cy={-52} r={6} fill="#E8574F" stroke={INK} strokeWidth={3} />
    </svg>
  )
}
