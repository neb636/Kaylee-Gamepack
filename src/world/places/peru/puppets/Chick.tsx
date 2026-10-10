// Pepa's fluffy grey chicks. They sit in the burrow and beg (stretch up, beak open, tiny flippers flapping), gulp a fish
// and get rounder (`full`, 0..1), and at the end waddle to the edge for their very first swim. Chicks only peep (sound
// effects), they have no voice lines. Each one has its own little tuft so she can tell them apart.
import { forwardRef, useRef, type MutableRefObject } from 'react'
import { bell, clamp, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from './Alpaca'
import type { PenguinLive } from './Penguin'

const DOWN = '#B7AFC8'
const FACE = '#DAD4E6'
const PINK = '#FF8FB8'
const FEET = '#FFB79A'

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
const BODY = fluff(90, 112, 66, 64, 18, 0.05)
const TUFTS = [
  'M84 42C78 24 88 18 92 32C94 18 106 20 98 40Z',
  'M80 44C70 30 80 22 88 36C92 20 104 22 98 42Z',
  'M86 44C86 26 94 24 94 38C102 26 110 32 100 44Z',
]

type Part = 'root' | 'body' | 'head' | 'beakLow' | 'eyes' | 'eyesShut' | 'wingL' | 'wingR' | 'feet'

export const Chick = forwardRef<PuppetHandle, { height: string; full?: number; tuft?: number; live?: MutableRefObject<PenguinLive>; label?: string }>(function Chick({ height, full = 0, tuft = 0, live, label }, ref) {
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
      <g ref={part('root')}>
        <g ref={part('feet')} stroke={INK} strokeWidth="4.5">
          <ellipse cx="70" cy="176" rx="17" ry="7" fill={FEET} />
          <ellipse cx="110" cy="176" rx="17" ry="7" fill={FEET} />
        </g>
        <g ref={part('wingL')}>
          <path d="M36 104C18 116 12 140 20 152C32 146 42 128 44 110Z" fill={DOWN} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        </g>
        <g ref={part('wingR')}>
          <path d="M144 104C162 116 168 140 160 152C148 146 138 128 136 110Z" fill={DOWN} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" />
        </g>
        <path ref={part('body')} d={BODY} fill={DOWN} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <g ref={part('head')}>
          <path d={TUFTS[tuft % TUFTS.length]} fill={DOWN} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <ellipse cx="90" cy="98" rx="44" ry="36" fill={FACE} />
          <g ref={part('eyes')}>
            <circle cx="72" cy="92" r="8" fill={INK} />
            <circle cx="108" cy="92" r="8" fill={INK} />
            <circle cx="74.5" cy="89" r="2.8" fill="#fff" />
            <circle cx="110.5" cy="89" r="2.8" fill="#fff" />
          </g>
          <g ref={part('eyesShut')} fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round">
            <path d="M64 93Q72 85 80 93" />
            <path d="M100 93Q108 85 116 93" />
          </g>
          <ellipse cx="62" cy="108" rx="8" ry="5" fill={PINK} opacity="0.85" />
          <ellipse cx="118" cy="108" rx="8" ry="5" fill={PINK} opacity="0.85" />
          <g ref={part('beakLow')}>
            <path d="M82 108L98 108L90 120Z" fill="#4A4258" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          </g>
          <path d="M80 100L100 100L90 110Z" fill="#3A3346" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  )
})

/** The egg in the burrow: wobbles, cracks, and the third chick pops out. `crack` 0..3. */
export function Egg({ crack }: { crack: number }) {
  return (
    <svg viewBox="0 0 120 140" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <path d="M60 10C92 10 110 60 110 90C110 120 88 134 60 134C32 134 10 120 10 90C10 60 28 10 60 10Z" fill="#F4ECDC" stroke={INK} strokeWidth="5" />
      <circle cx="44" cy="60" r="5" fill="#D9CCFF" />
      <circle cx="78" cy="96" r="6" fill="#D9CCFF" />
      <circle cx="70" cy="44" r="4" fill="#D9CCFF" />
      {crack >= 1 && <path d="M30 76L44 68L52 80L64 70" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
      {crack >= 2 && <path d="M64 70L76 82L88 72L100 80" fill="none" stroke={INK} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />}
    </svg>
  )
}
