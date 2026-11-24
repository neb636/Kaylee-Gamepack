// Pepa's fluffy grey chicks. They sit in the burrow and beg (stretch up, beak open, tiny flippers flapping), gulp a fish
// and get rounder (`full`, 0..1), and at the end waddle to the edge for their very first swim. Chicks only peep (sound
// effects), they have no voice lines. Each one has its own little tuft so she can tell them apart.
// Drawn by hand in the flat look (src/world/shelf/STYLE.md): no outlines; soft lavender-grey down in a base, a shade
// and a light; a pale face with big ink eyes.
import { forwardRef, useId, useRef, type MutableRefObject } from 'react'
import { bell, clamp, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'
import type { PenguinLive } from './Penguin'

const DOWN = ['#c4bcdc', '#a399c6', '#e2dcf1'] as const
const FACE = '#f6f3fb'
const PINK = '#ff8fb8'
const FEET = ['#ffb38a', '#ee9675'] as const
const BEAK = ['#5d5680', '#363150'] as const

export const CHICK_ACTIONS = { beg: 1.1, gulp: 0.8, hop: 0.7, peep: 0.45, cheer: 1.1, wiggle: 0.6 }
export const CHICK_VIEW = { w: 180, h: 190, feetY: 178 }

/** A fluffy scalloped circle (down feathers). */
function fluff(cx: number, cy: number, rx: number, ry: number, bumps: number, depth: number) {
  const pts: string[] = []
  const n = 160
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = 1 - depth + depth * Math.abs(Math.sin((a * bumps) / 2))
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}
const BODY = fluff(90, 112, 66, 64, 18, 0.06)
const FACE_D = 'M90 68C104 56 134 64 134 94C134 119 111 134 90 134C69 134 46 119 46 94C46 64 76 56 90 68Z'
const TUFTS = [
  'M84 42C78 24 88 18 92 32C94 18 106 20 98 40Z',
  'M80 44C70 30 80 22 88 36C92 20 104 22 98 42Z',
  'M86 44C86 26 94 24 94 38C102 26 110 32 100 44Z',
]

type Part = 'root' | 'body' | 'head' | 'beakLow' | 'eyes' | 'eyesShut' | 'wingL' | 'wingR' | 'feet'

export const Chick = forwardRef<PuppetHandle, { height: string; full?: number; tuft?: number; live?: MutableRefObject<PenguinLive>; label?: string }>(function Chick({ height, full = 0, tuft = 0, live, label }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ full: 0, wing: spring(180, 9), round: spring(140, 9) }).current
  const fullRef = useRef(full)
  fullRef.current = full
  const { svg, part } = usePuppet<Part>(ref, {
    actions: CHICK_ACTIONS,
    eyes: [90, 92],
    frame: (f, p) => {
      st.full += (fullRef.current - st.full) * Math.min(1, f.dt * 3)
      const mode = live?.current.mode ?? 'stand'
      const q = f.p
      const a = f.action
      const e = bell(q)
      const t = f.t
      // Hungry chicks fidget; full ones are calm and round.
      const breath = Math.sin(t * (3 - st.full))
      let sx = 1 + st.full * 0.22 + breath * 0.012
      let sy = 1 + st.full * 0.06 - breath * 0.016
      let y = 0
      let rot = Math.sin(t * 2.1) * 2
      let head = 0
      let beak = 0
      let wing = 10 + Math.sin(t * 2) * 4
      let shut = f.blink < 0.5
      if (a === 'beg') {
        sy *= 1 + e * 0.16
        sx *= 1 - e * 0.06
        head -= e * 14
        beak = bell(span(q, 0.1, 0.9)) * (0.6 + 0.4 * Math.abs(Math.sin(q * Math.PI * 6)))
        wing = 10 + e * 50 + Math.sin(q * Math.PI * 12) * 20 * e
      } else if (a === 'gulp') {
        beak = bell(span(q, 0, 0.35))
        const g = bell(span(q, 0.35, 1))
        sx *= 1 + g * 0.12
        sy *= 1 - g * 0.08
        shut = q > 0.3
      } else if (a === 'hop' || a === 'cheer') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.14 + land * 0.1
        sy *= 1 - crouch * 0.16 + air * 0.08 - land * 0.12
        y -= air * (a === 'cheer' ? 40 : 26)
        wing = 10 + air * 60
        shut = a === 'cheer'
      } else if (a === 'peep') {
        beak = e * 0.8
        head -= e * 6
      } else if (a === 'wiggle') {
        rot += wobble(q, 3) * 14
      }
      if (mode === 'crouch') {
        const k = clamp(live!.current.pull, 0, 1.3)
        sy *= 1 - Math.min(k, 1) * 0.22
        sx *= 1 + Math.min(k, 1) * 0.14
        shut = k > 0.5
      } else if (mode === 'air' || mode === 'swim') {
        wing = 40 + Math.sin(t * 20) * 40
        beak = mode === 'air' ? 0.6 : 0
      }
      setT(p.root, `translate(0 ${y.toFixed(1)}) translate(90 ${CHICK_VIEW.feetY}) rotate(${rot.toFixed(2)}) scale(${st.round.step(sx, f.dt).toFixed(3)} ${sy.toFixed(3)}) translate(-90 ${-CHICK_VIEW.feetY})`)
      setT(p.head, `translate(0 ${head.toFixed(1)})`)
      setT(p.beakLow, `translate(0 ${(beak * 12).toFixed(1)})`)
      const w = st.wing.step(wing, f.dt)
      setT(p.wingL, `rotate(${w.toFixed(1)} 34 110)`)
      setT(p.wingR, `rotate(${(-w).toFixed(1)} 146 110)`)
      show(p.eyes, !shut)
      show(p.eyesShut, shut)
      show(p.feet, mode !== 'swim')
    },
  })
  return (
    <svg ref={svg} viewBox={`0 0 ${CHICK_VIEW.w} ${CHICK_VIEW.h}`} role="img" aria-label={label} style={{ height, overflow: 'visible', display: 'block' }}>
      <defs>
        <clipPath id={`down${id}`}>
          <path d={BODY} />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('feet')}>
          <ellipse cx="68" cy="176" rx="18" ry="7.5" fill={FEET[1]} />
          <ellipse cx="112" cy="176" rx="18" ry="7.5" fill={FEET[0]} />
        </g>
        <g ref={part('wingL')}>
          <path d="M38 102C18 114 10 140 19 154C33 148 44 130 46 110Z" fill={DOWN[1]} />
        </g>
        <g ref={part('wingR')}>
          <path d="M142 102C162 114 170 140 161 154C147 148 136 130 134 110Z" fill={DOWN[1]} />
        </g>
        <g ref={part('body')}>
          {/* Its own little tuft, growing out of the down on top. */}
          <path d={TUFTS[tuft % TUFTS.length]} fill={DOWN[0]} transform="translate(0 9)" />
          <path d={BODY} fill={DOWN[1]} />
          <g clipPath={`url(#down${id})`}>
            <path d={BODY} fill={DOWN[0]} transform="translate(-8 -9)" />
            <ellipse cx="88" cy="148" rx="34" ry="22" fill={DOWN[2]} opacity="0.75" />
            <path d="M40 90C46 70 60 58 76 54" fill="none" stroke={DOWN[2]} strokeWidth="8" strokeLinecap="round" opacity="0.85" />
          </g>
        </g>
        <g ref={part('head')}>
          <path d={FACE_D} fill={FACE} />
          <g ref={part('eyes')}>
            <ellipse cx="71" cy="93" rx="8.6" ry="9.8" fill={INK} />
            <ellipse cx="109" cy="93" rx="8.6" ry="9.8" fill={INK} />
            <circle cx="74" cy="89" r="3.2" fill="#fff" />
            <circle cx="112" cy="89" r="3.2" fill="#fff" />
            <circle cx="68" cy="97" r="1.5" fill="#fff" />
            <circle cx="106" cy="97" r="1.5" fill="#fff" />
          </g>
          <g ref={part('eyesShut')} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
            <path d="M63 95Q71 86 79 95" />
            <path d="M101 95Q109 86 117 95" />
          </g>
          <ellipse cx="59" cy="110" rx="9" ry="5.5" fill={PINK} opacity="0.7" />
          <ellipse cx="121" cy="110" rx="9" ry="5.5" fill={PINK} opacity="0.7" />
          {/* The beak: the lower half drops to peep, beg and gulp, and shows a pink mouth. */}
          <path d="M83 106H97L90 116Z" fill="#e7699c" />
          <g ref={part('beakLow')}>
            <path d="M82 108Q90 112 98 108L90 120Z" fill={BEAK[1]} />
          </g>
          <path d="M79 103Q90 95 101 103Q96 108 90 110Q84 108 79 103Z" fill={BEAK[0]} />
          <path d="M84 101.5Q90 98 96 101.5" fill="none" stroke="#8982b0" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  )
})

/** The egg in the burrow: wobbles, cracks, and the third chick pops out. `crack` 0..3. */
export function Egg({ crack }: { crack: number }) {
  return (
    <svg viewBox="0 0 120 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M60 10C92 10 110 60 110 90C110 120 88 134 60 134C32 134 10 120 10 90C10 60 28 10 60 10Z" fill="#e9dccd" />
      <path d="M56 10C86 10 102 58 102 88C102 116 82 130 56 130C32 130 10 118 10 90C10 60 28 10 56 10Z" fill="#fff7f0" />
      <path d="M30 62C34 42 44 28 56 22" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      <circle cx="46" cy="72" r="5" fill="#d9ccff" />
      <circle cx="78" cy="100" r="6" fill="#d9ccff" />
      <circle cx="72" cy="48" r="4" fill="#d9ccff" />
      <circle cx="36" cy="104" r="3.5" fill="#ffc4da" />
      {crack >= 1 && <path d="M30 78L44 70L52 82L64 72" fill="none" stroke="#8b78e6" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
      {crack >= 2 && <path d="M64 72L76 84L88 74L100 82" fill="none" stroke="#8b78e6" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
    </svg>
  )
}
