// Lobo, a South American sea lion pup who lounges on a rock in the bay and loves splashes. Facing left (toward the
// cliff), lying on his tummy with his head up. He barks, claps his front flipper, rolls over, and when a penguin
// splashes him he dives off his rock and pops back up wearing seaweed.
import { forwardRef, useRef } from 'react'
import { bell, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

const FUR = '#B47A4E'
const TAN = '#E6BC8E'
const FLIPPER = '#8E5A36'

export const LOBO_ACTIONS = { bark: 0.8, clap: 1.3, roll: 1.5, dive: 2.2, flop: 0.8, giggle: 1 }
export const LOBO_VIEW = { w: 340, h: 240, bellyY: 210 }

type Part = 'root' | 'head' | 'jaw' | 'eyes' | 'eyesShut' | 'flipper' | 'tail' | 'seaweed'

export const Lobo = forwardRef<PuppetHandle, { height: string; seaweed?: boolean; label?: string }>(function Lobo({ height, seaweed = false, label }, ref) {
  const sp = useRef({ head: spring(120, 9), flip: spring(170, 10), tail: spring(110, 7) }).current
  const weed = useRef(seaweed)
  weed.current = seaweed
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'lobo',
    actions: LOBO_ACTIONS,
    eyes: [96, 74],
    reach: [56, 104],
    frame: (f, p) => {
      const q = f.p
      const a = f.action
      const e = bell(q)
      const t = f.t
      const breath = Math.sin(t * 1.9)
      let sx = 1 + breath * 0.01
      let sy = 1 - breath * 0.014
      let y = 0
      let rot = 0
      let head = Math.sin(t * 0.9) * 4 + f.look.x * -6
      let jaw = f.mouth
      let flip = Math.sin(t * 1.4) * 6
      let tail = Math.sin(t * 1.6) * 8
      let shut = f.blink < 0.5
      let hide = 0
      if (a === 'bark') {
        head -= e * 16
        jaw = Math.max(jaw, Math.abs(Math.sin(q * Math.PI * 3)))
        sy *= 1 + e * 0.05
      } else if (a === 'clap') {
        // Flipper slaps up and down; the whole pup rocks with glee.
        flip = -40 + Math.sin(q * Math.PI * 10) * 40 * e
        rot = Math.sin(q * Math.PI * 5) * 4 * e
        shut = true
        jaw = Math.max(jaw, 0.5 * e)
      } else if (a === 'roll') {
        rot = -360 * span(q, 0.1, 0.8) ** 1.2
        y -= bell(span(q, 0.1, 0.8)) * 40
        const land = wobble(span(q, 0.8, 1), 2)
        sy *= 1 - land * 0.1
        shut = q > 0.15 && q < 0.85
      } else if (a === 'dive') {
        // Slides off the rock into the water, then pops back up (with seaweed on his head).
        const down = span(q, 0, 0.35)
        const up = span(q, 0.55, 0.85)
        hide = down * (1 - up)
        rot = -30 * bell(span(q, 0, 0.4))
        const land = wobble(span(q, 0.85, 1), 2)
        sy *= 1 - land * 0.12
        shut = q > 0.2 && q < 0.8
      } else if (a === 'flop') {
        sy *= 1 - e * 0.15
        sx *= 1 + e * 0.08
        tail += e * 30
      } else if (a === 'giggle') {
        head += Math.sin(q * Math.PI * 8) * 6 * e
        shut = true
        jaw = Math.max(jaw, 0.6 * e)
        tail += Math.sin(q * Math.PI * 6) * 20 * e
      }
      y += hide * 230
      setT(p.root, `translate(0 ${y.toFixed(1)}) translate(170 ${LOBO_VIEW.bellyY}) rotate(${rot.toFixed(1)} 0 -60) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(-170 ${-LOBO_VIEW.bellyY})`)
      setT(p.head, `rotate(${sp.head.step(head, f.dt).toFixed(1)} 120 130)`)
      setT(p.jaw, `rotate(${(-jaw * 22).toFixed(1)} 76 106)`)
      setT(p.flipper, `rotate(${sp.flip.step(flip, f.dt).toFixed(1)} 136 168)`)
      setT(p.tail, `rotate(${sp.tail.step(tail, f.dt).toFixed(1)} 280 196)`)
      show(p.eyes, !shut)
      show(p.eyesShut, shut)
      show(p.seaweed, weed.current)
    },
  })
  return (
    <svg ref={svg} viewBox={`0 0 ${LOBO_VIEW.w} ${LOBO_VIEW.h}`} role="img" aria-label={label} style={{ height, overflow: 'visible', display: 'block' }}>
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path d="M270 190C292 172 322 168 330 180C318 186 306 194 296 202C312 204 324 214 316 222C296 220 278 210 266 202Z" fill={FLIPPER} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </g>
        {/* Body: lying on his tummy, chest up. */}
        <path d="M84 150C82 112 112 96 146 108C196 124 248 160 284 182C298 192 292 210 274 212L118 214C94 214 84 186 84 150Z" fill={FUR} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <path d="M104 176C126 166 190 176 250 204L120 210C106 208 100 194 104 176Z" fill={TAN} />
        <g ref={part('head')}>
          <path d="M96 150C88 120 92 100 104 92L140 108C138 130 130 146 120 160Z" fill={FUR} />
          <circle cx="96" cy="78" r="48" fill={FUR} stroke={INK} strokeWidth="5" />
          <path d="M132 44C138 36 146 40 142 50" fill={FUR} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {/* Lower jaw opens to bark and talk. */}
          <g ref={part('jaw')}>
            <path d="M40 104C52 120 80 122 96 108L92 100L46 98Z" fill="#E77F8E" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          </g>
          <ellipse cx="62" cy="94" rx="30" ry="20" fill={TAN} stroke={INK} strokeWidth="4.5" />
          <ellipse cx="40" cy="84" rx="10" ry="8" fill={INK} />
          <circle cx="37" cy="81" r="2.5" fill="#fff" />
          {[
            [56, 92],
            [66, 98],
            [56, 102],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2.4" fill={INK} />
          ))}
          <path d="M62 104C70 110 80 108 84 100" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <g ref={part('eyes')}>
            <circle cx="94" cy="66" r="10" fill={INK} />
            <circle cx="97" cy="62" r="3.6" fill="#fff" />
          </g>
          <path ref={part('eyesShut')} d="M84 68Q94 58 104 68" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="110" cy="92" rx="10" ry="6" fill="#FF8FB8" opacity="0.8" />
          <g ref={part('seaweed')}>
            <path d="M58 40C70 18 112 14 132 30C140 38 134 46 124 44C122 56 132 70 122 78C114 74 112 60 108 50C96 52 86 46 78 52C74 64 80 78 70 82C62 74 64 58 66 50C60 50 54 46 58 40Z" fill="#7CC79A" stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
          </g>
        </g>
        <g ref={part('flipper')}>
          <path d="M126 166C112 182 96 200 88 214C106 218 128 212 146 190Z" fill={FLIPPER} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  )
})
