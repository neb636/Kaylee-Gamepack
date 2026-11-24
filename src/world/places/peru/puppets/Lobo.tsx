// Lobo, a South American sea lion pup who lounges on a rock in the bay and loves splashes. Facing left (toward the
// cliff), lying on his tummy with his head up. He barks, claps his front flipper, rolls over, and when a penguin
// splashes him he dives off his rock and pops back up wearing seaweed.
// Drawn by hand in the flat look (src/world/shelf/STYLE.md): no outlines; caramel fur in a base, a shade and a light.
import { forwardRef, useId, useRef } from 'react'
import { bell, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'

const FUR = ['#c99266', '#a46e4b', '#e5b78f'] as const
const TAN = '#fae6c6'
const FLIPPER = ['#8a5b3d', '#6b432e', '#b17d56'] as const
const BODY = 'M82 152C80 112 112 94 150 106C202 122 250 152 286 180C302 192 296 212 276 213L120 215C94 215 82 190 82 152Z'

export const LOBO_ACTIONS = { bark: 0.8, clap: 1.3, roll: 1.5, dive: 2.2, flop: 0.8, giggle: 1 }
export const LOBO_VIEW = { w: 340, h: 240, bellyY: 210 }

type Part = 'root' | 'head' | 'jaw' | 'eyes' | 'eyesShut' | 'flipper' | 'tail' | 'seaweed'

export const Lobo = forwardRef<PuppetHandle, { height: string; seaweed?: boolean; label?: string }>(function Lobo({ height, seaweed = false, label }, ref) {
  const id = useId().replace(/:/g, '')
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
      <defs>
        <clipPath id={`lb${id}`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`lh${id}`}>
          <circle cx="96" cy="78" r="48" />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path d="M268 190C292 170 322 166 331 179C319 186 307 194 297 202C313 204 326 214 317 223C296 221 277 211 264 203Z" fill={FLIPPER[0]} />
          <path d="M276 190C294 178 312 174 324 178" fill="none" stroke={FLIPPER[2]} strokeWidth="5" strokeLinecap="round" />
        </g>
        {/* Body: lying on his tummy, chest up. */}
        <path d={BODY} fill={FUR[0]} />
        <g clipPath={`url(#lb${id})`}>
          <path d="M70 196C140 186 220 196 300 190V230H70Z" fill={FUR[1]} />
          <path d="M92 176C92 142 112 124 138 128C120 150 116 184 126 214H104C96 204 92 190 92 176Z" fill={FUR[2]} />
          <path d="M156 114C196 128 232 148 262 170" fill="none" stroke={FUR[2]} strokeWidth="8" strokeLinecap="round" opacity="0.8" />
        </g>
        <g ref={part('head')}>
          <path d="M94 152C86 120 90 100 102 90L142 108C140 132 132 148 122 162Z" fill={FUR[0]} />
          <circle cx="96" cy="78" r="48" fill={FUR[0]} />
          <g clipPath={`url(#lh${id})`}>
            <path d="M118 36C150 60 150 104 112 124C140 122 152 98 150 70C148 54 134 40 118 36Z" fill={FUR[1]} />
            <path d="M62 52C70 40 84 34 98 34" fill="none" stroke={FUR[2]} strokeWidth="8" strokeLinecap="round" />
          </g>
          <path d="M130 46C137 34 149 39 143 53Z" fill={FUR[1]} />
          {/* Lower jaw opens to bark and talk. */}
          <g ref={part('jaw')}>
            <path d="M40 104C52 120 80 122 96 108L92 100L46 98Z" fill="#e7699c" />
            <path d="M56 110Q68 116 80 110" fill="none" stroke="#ff9fc0" strokeWidth="5" strokeLinecap="round" />
          </g>
          <ellipse cx="62" cy="94" rx="31" ry="21" fill={TAN} />
          <path d="M34 100C42 114 78 116 92 102C82 108 50 110 34 100Z" fill="#ecd0a4" />
          <path d="M52 96L22 96M54 102L26 110M58 106L36 120" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity="0.9" />
          <ellipse cx="40" cy="83" rx="10.5" ry="8.5" fill={INK} />
          <ellipse cx="37" cy="80" rx="3.4" ry="2.2" fill="#fff" opacity="0.9" />
          {[
            [57, 92],
            [66, 97],
            [58, 101],
          ].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" fill="#c99266" />
          ))}
          <path d="M40 92V98M40 98C46 106 58 106 62 100" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          <g ref={part('eyes')}>
            <ellipse cx="94" cy="66" rx="10" ry="11.5" fill={INK} />
            <circle cx="97.5" cy="61.5" r="3.8" fill="#fff" />
            <circle cx="90.5" cy="71" r="1.7" fill="#fff" />
          </g>
          <path ref={part('eyesShut')} d="M83 68Q94 57 105 68" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <ellipse cx="111" cy="93" rx="11" ry="6.5" fill="#ff8fb8" opacity="0.7" />
          <g ref={part('seaweed')}>
            <path d="M58 40C70 18 112 14 132 30C140 38 134 46 124 44C122 56 132 70 122 78C114 74 112 60 108 50C96 52 86 46 78 52C74 64 80 78 70 82C62 74 64 58 66 50C60 50 54 46 58 40Z" fill="#73cf86" />
            <path d="M72 36C86 26 108 26 122 34" fill="none" stroke="#aee8b7" strokeWidth="5" strokeLinecap="round" />
            <path d="M116 48C118 58 124 66 122 74M72 54C70 64 74 72 70 78" fill="none" stroke="#48a96c" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
        <g ref={part('flipper')}>
          <path d="M126 164C110 180 94 200 86 215C106 221 130 214 148 190C146 176 136 164 126 164Z" fill={FLIPPER[0]} />
          <path d="M124 172C114 184 104 196 98 206" fill="none" stroke={FLIPPER[2]} strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
})
