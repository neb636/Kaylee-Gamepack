// The balloon trip's scenery, drawn in code in Peru's flat 5-unit-outline style over the painted backgrounds (the far
// layer): the balloon itself, and the near ground of each stop (the beach and Lobo's rock, the terraces, the river,
// the vine and the canopy). All in stage units (layout.ts).
import { motion } from 'motion/react'
import type { Ref } from 'react'
import { INK } from '../../puppets/Alpaca'
import type { BalloonLayout } from './layout'

/** The balloon's envelope (pink and lavender panels, ribbons) and its ropes, drawn in a 340 × 400 box whose mouth is
 *  at (170, 330). `flag`: the ribbons turn red and white, like Peru's flag. `flame` 0..1. */
export function Envelope({ flag, flame, flameRef }: { flag: boolean; flame: number; flameRef?: Ref<SVGGElement> }) {
  const ribbonA = flag ? '#D91023' : '#FFF7F0'
  const ribbonB = flag ? '#FFFFFF' : '#FFE27A'
  return (
    <svg viewBox="0 0 340 420" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M170 8C66 8 18 82 24 152C30 222 98 276 130 330H210C242 276 310 222 316 152C322 82 274 8 170 8Z" fill="#FF8FB8" />
        <path d="M170 8C120 30 104 120 118 200C126 250 136 296 146 330H194C204 296 214 250 222 200C236 120 220 30 170 8Z" fill="#B9A6F5" />
        <path d="M170 8C150 40 146 140 156 230L160 330H180L184 230C194 140 190 40 170 8Z" fill="#FFB3D1" />
        <path d="M170 8C66 8 18 82 24 152C30 222 98 276 130 330H210C242 276 310 222 316 152C322 82 274 8 170 8Z" fill="none" />
      </g>
      {/* Two garlands of ribbon across the envelope. */}
      <path d="M34 168Q100 204 170 192Q240 204 306 168" fill="none" stroke={ribbonA} strokeWidth="13" />
      <path d="M34 168Q100 204 170 192Q240 204 306 168" fill="none" stroke={INK} strokeWidth="3" opacity="0.5" />
      <path d="M60 228Q114 256 170 248Q226 256 280 228" fill="none" stroke={ribbonB} strokeWidth="11" />
      {flag && <path d="M34 168Q100 204 170 192Q240 204 306 168" fill="none" stroke="#D91023" strokeWidth="13" strokeDasharray="44 44" />}
      {/* Little flags hanging from the lower garland. */}
      {[86, 128, 170, 212, 254].map((x, i) => (
        <path key={x} d={`M${x - 11} ${244 + Math.abs(x - 170) * -0.1}l11 22l11 -22z`} fill={flag ? (i % 2 ? '#fff' : '#D91023') : ['#FFE27A', '#8FE3C8', '#7FB2FF', '#8FE3C8', '#FFE27A'][i]} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      ))}
      {/* The burner: a little flame puffs at the mouth. */}
      <rect x="148" y="326" width="44" height="18" rx="6" fill="#A7A3B0" stroke={INK} strokeWidth="5" />
      <g ref={flameRef} style={{ transformOrigin: '170px 330px', transform: `scale(${0.4 + flame * 0.9})` }}>
        <path d="M170 330C150 312 156 290 166 276C166 294 178 292 176 278C190 294 190 316 170 330Z" fill="#FFB347" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path d="M170 324C162 314 166 302 170 296C172 306 178 312 170 324Z" fill="#FFE27A" />
      </g>
      {/* Ropes down to the basket. */}
      <path d="M134 334L92 420M206 334L248 420M150 340L140 420M190 340L200 420" stroke={INK} strokeWidth="4" fill="none" />
    </svg>
  )
}

/** The basket's front, in front of Luna and Sparkle (a 320 × 130 box). */
export function BasketFront() {
  return (
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}>
      <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
        <path d="M14 18H306L290 118Q288 126 278 126H42Q32 126 30 118Z" fill="#E8A35A" />
        <path d="M24 56H298M30 90H292" fill="none" stroke="#C98446" strokeWidth="6" />
        {[60, 110, 160, 210, 260].map((x) => (
          <path key={x} d={`M${x} 22V122`} fill="none" stroke="#C98446" strokeWidth="5" />
        ))}
        <path d="M14 18H306L290 118Q288 126 278 126H42Q32 126 30 118Z" fill="none" />
        <rect x="4" y="4" width="312" height="24" rx="12" fill="#C98446" />
      </g>
      {/* Pink and lavender bunting along the rim. */}
      {[30, 80, 130, 180, 230, 280].map((x, i) => (
        <path key={x} d={`M${x - 16} 28Q${x} 48 ${x + 16} 28`} fill={i % 2 ? '#B9A6F5' : '#FF8FB8'} stroke={INK} strokeWidth="3" />
      ))}
    </svg>
  )
}

const wave = (x0: number, x1: number, y: number, amp: number, step: number) => {
  let d = `M${x0} ${y}`
  for (let x = x0; x < x1; x += step) d += ` q${step / 4} ${-amp} ${step / 2} 0 t${step / 2} 0`
  return d
}

/** The coast's near layer: the sandy beach, the cold sea, and Lobo's rock. */
export function CoastGround({ S }: { S: BalloonLayout }) {
  const g = S.ground.coast
  const pad = 800
  return (
    <svg viewBox={`${-pad} 0 ${S.w + pad * 2} ${S.h + 600}`} style={{ position: 'absolute', left: -pad, top: 0, width: S.w + pad * 2, height: S.h + 600, overflow: 'visible', pointerEvents: 'none' }}>
      {/* The sea, from the beach out to the far edge. */}
      <path d={`${wave(S.sea.x - 80, S.w + pad, S.sea.y, 10, 90)} V${S.h + 600} H${S.sea.x - 80}Z`} fill="#6BBCE4" stroke={INK} strokeWidth="5" />
      <path d={wave(S.sea.x + 40, S.w + pad, S.sea.y + 50, 8, 120)} fill="none" stroke="#A8E0FF" strokeWidth="6" />
      {/* The beach: sand down to the bottom, a wet edge where the waves come in. */}
      <path d={`M${-pad} ${g}Q${S.sea.x * 0.4} ${g - 18} ${S.sea.x * 0.8} ${g - 4}Q${S.sea.x} ${g + 4} ${S.sea.x + 60} ${g + 40}V${S.h + 600}H${-pad}Z`} fill="#F4D9A6" stroke={INK} strokeWidth="5" />
      <path d={`M${S.sea.x * 0.82} ${g + 6}Q${S.sea.x + 10} ${g + 14} ${S.sea.x + 50} ${g + 44}`} fill="none" stroke="#E7C38A" strokeWidth="10" />
      {[0.1, 0.32, 0.55].map((k) => (
        <circle key={k} cx={S.sea.x * k} cy={g + 60 + k * 40} r="6" fill="#FFF7F0" stroke={INK} strokeWidth="3" />
      ))}
      {/* Lobo's rock. */}
      <path
        d={`M${S.rock.x - S.rock.w / 2} ${S.sea.y + 30}Q${S.rock.x - S.rock.w / 2 + 10} ${S.rock.y - 10} ${S.rock.x - S.rock.w / 4} ${S.rock.y - 4}H${S.rock.x + S.rock.w / 4}Q${S.rock.x + S.rock.w / 2 - 6} ${S.rock.y - 6} ${S.rock.x + S.rock.w / 2} ${S.sea.y + 30}Z`}
        fill="#A79DB8"
        stroke={INK}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d={`M${S.rock.x - S.rock.w / 4} ${S.rock.y + 22}Q${S.rock.x} ${S.rock.y + 12} ${S.rock.x + S.rock.w / 5} ${S.rock.y + 26}`} fill="none" stroke="#857A99" strokeWidth="6" />
      <path d={wave(S.rock.x - S.rock.w / 2 - 30, S.rock.x + S.rock.w / 2 + 30, S.sea.y + 30, 7, 60)} fill="none" stroke="#fff" strokeWidth="6" />
    </svg>
  )
}

/** The mountains' near layer: Inca terraces, grassy steps held up by stone walls, stepping up to the right. */
export function MountainGround({ S }: { S: BalloonLayout }) {
  const pad = 800
  const steps = S.terraces
  const right = S.w + pad
  const bottom = S.h + 600
  return (
    <svg viewBox={`${-pad} 0 ${S.w + pad * 2} ${bottom}`} style={{ position: 'absolute', left: -pad, top: 0, width: S.w + pad * 2, height: bottom, overflow: 'visible', pointerEvents: 'none' }}>
      {steps.map((t, i) => {
        const below = i > 0 ? steps[i - 1].y : bottom
        const wall = i > 0 ? Math.min(below - t.y, 120) : 0
        return (
          <g key={i} strokeLinejoin="round">
            {/* The stone wall's face: rows of rounded stones, like the Inca built. */}
            {i > 0 && (
              <g>
                <path d={`M${t.x - 26} ${below}L${t.x - 8} ${t.y + 18}H${right}V${below}Z`} fill="#C9C1B4" stroke={INK} strokeWidth="5" />
                {Array.from({ length: 2 }, (_, r) =>
                  Array.from({ length: Math.ceil((right - t.x) / 110) }, (_, k) => (
                    <rect key={`${r}-${k}`} x={t.x + (r % 2 ? 50 : 0) + k * 110} y={t.y + 26 + r * (wall / 2.2)} width={96} height={wall / 2.6} rx={14} fill="#D8D1C5" stroke="#9E9586" strokeWidth="4" />
                  )),
                )}
              </g>
            )}
            {/* The grassy step on top. */}
            <path d={`M${t.x - 12} ${t.y + 22}Q${t.x - 10} ${t.y} ${t.x + 20} ${t.y}H${right}V${i === 0 ? bottom : t.y + 26}H${t.x - 12}Z`} fill={['#8FD86F', '#7CCB62', '#6CBF55'][i]} stroke={INK} strokeWidth="5" />
            {Array.from({ length: 12 }, (_, k) => (
              <path key={k} d={`M${t.x + 50 + k * 130} ${t.y + (i === 0 ? 40 : 14)}l7 -12l7 12`} fill="none" stroke="#4E9C3E" strokeWidth="4" strokeLinecap="round" />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

/** The rainforest's near layer: two big trees, the river, and the vine slung between them (the canopy's leaves are
 *  separate, so they can wobble when a present bounces off). */
export function ForestGround({ S }: { S: BalloonLayout }) {
  const pad = 800
  const { a, b, y } = S.vine
  const trunk = (x: number) => (
    <g key={x}>
      <path d={`M${x - 34} ${S.river + 20}Q${x - 24} ${y + 120} ${x - 20} ${y - 140}H${x + 20}Q${x + 24} ${y + 120} ${x + 34} ${S.river + 20}Z`} fill="#9B6A45" stroke={INK} strokeWidth="5" />
      <path d={`M${x - 6} ${y + 40}Q${x + 6} ${y + 160} ${x - 4} ${S.river - 40}`} fill="none" stroke="#7E5434" strokeWidth="6" />
      <ellipse cx={x} cy={y - 170} rx={130} ry={90} fill="#3E9A52" stroke={INK} strokeWidth="5" />
      <ellipse cx={x - 70} cy={y - 120} rx={80} ry={60} fill="#4FB063" stroke={INK} strokeWidth="5" />
      <ellipse cx={x + 76} cy={y - 126} rx={84} ry={62} fill="#4FB063" stroke={INK} strokeWidth="5" />
    </g>
  )
  return (
    <svg viewBox={`${-pad} 0 ${S.w + pad * 2} ${S.h + 600}`} style={{ position: 'absolute', left: -pad, top: 0, width: S.w + pad * 2, height: S.h + 600, overflow: 'visible', pointerEvents: 'none' }}>
      {/* Muddy far bank, then the river. */}
      <rect x={-pad} y={S.river - 40} width={S.w + pad * 2} height={60} fill="#5E9E4A" stroke={INK} strokeWidth="5" />
      <path d={`${wave(-pad, S.w + pad, S.river, 8, 110)} V${S.h + 600} H${-pad}Z`} fill="#8FBFAE" stroke={INK} strokeWidth="5" />
      <path d={wave(-pad + 40, S.w + pad, S.river + 46, 6, 150)} fill="none" stroke="#B8DCCF" strokeWidth="6" />
      <path d={wave(-pad + 100, S.w + pad, S.river + 110, 6, 190)} fill="none" stroke="#B8DCCF" strokeWidth="5" />
      {trunk(a)}
      {trunk(b)}
      {/* The vine. */}
      <path d={`M${a + 10} ${y - 60}Q${(a + b) / 2} ${y + 50} ${b - 10} ${y - 60}`} fill="none" stroke="#5E8C34" strokeWidth="16" strokeLinecap="round" />
      <path d={`M${a + 10} ${y - 60}Q${(a + b) / 2} ${y + 50} ${b - 10} ${y - 60}`} fill="none" stroke={INK} strokeWidth="3" opacity="0.4" />
      {[0.2, 0.4, 0.6, 0.8].map((k) => {
        const vx = a + (b - a) * k
        const vy = vineY(S, vx)
        return <path key={k} d={`M${vx} ${vy}q-14 18 -6 30q14 -6 6 -30z`} fill="#7CCB62" stroke={INK} strokeWidth="3" />
      })}
    </svg>
  )
}

/** The vine's height at x (it sags in the middle). */
export function vineY(S: BalloonLayout, x: number) {
  const { a, b, y } = S.vine
  const t = Math.max(0, Math.min(1, (x - a - 10) / (b - a - 20)))
  // The quadratic from (a, y-60) through control ((a+b)/2, y+50) to (b, y-60).
  return (1 - t) * (1 - t) * (y - 60) + 2 * (1 - t) * t * (y + 50) + t * t * (y - 60)
}

/** One big canopy leaf (a fan of three), centred on x at the canopy's height. */
export function Leaf({ r, elRef, glow }: { r: number; elRef?: Ref<HTMLDivElement>; glow?: boolean }) {
  return (
    <div ref={elRef} style={{ position: 'absolute', left: -r - 20, top: -r * 0.55, width: r * 2 + 40, height: r * 1.1, transformOrigin: '50% 80%' }}>
      <svg viewBox="-140 -70 280 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <g stroke={INK} strokeWidth="5" strokeLinejoin="round">
          <path d="M-130 20Q-120 -50 -40 -40Q-30 10 -130 20Z" fill="#4FB063" />
          <path d="M130 20Q120 -50 40 -40Q30 10 130 20Z" fill="#4FB063" />
          <path d="M-70 30Q-60 -70 0 -66Q60 -70 70 30Q0 6 -70 30Z" fill="#66C46F" />
          <path d="M0 -60V20M-90 0L-50 -22M90 0L50 -22" fill="none" stroke="#3E9A52" strokeWidth="5" />
        </g>
      </svg>
      {glow && <motion.div animate={{ opacity: [0.2, 0.7, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} style={{ position: 'absolute', inset: '10%', borderRadius: '50%', boxShadow: '0 0 40px 20px #FFE27A' }} />}
    </div>
  )
}

/** A drifting cloud (code-drawn, like the canyon's). */
export function Cloud({ w }: { w: number }) {
  return (
    <svg viewBox="0 0 200 90" style={{ width: w, height: w * 0.45, overflow: 'visible', display: 'block' }}>
      <path d="M30 80Q4 80 6 60Q8 40 32 42Q36 14 70 18Q92 0 118 16Q150 8 160 38Q194 38 194 62Q192 82 168 80Z" fill="#FFF7F0" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
    </svg>
  )
}
