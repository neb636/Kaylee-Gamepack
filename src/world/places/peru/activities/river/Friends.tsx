// Who lives in the flooded forest: the sloth, the monkeys, the capybaras, the otters, the birds, the frogs, the turtles,
// the fish and the butterflies. Each is a little puppet drawn here in the flat look (no outlines), alive on its own:
// they breathe, blink, look at her finger, talk with their own mouths and act out what happens to them.
import { forwardRef, useRef, type CSSProperties, type ReactNode, type Ref } from 'react'
import { bell, clamp, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../../sdk'
import { INK, LEAF } from './Forest'

const FUR = ['#c99266', '#a46e4b', '#e5b78f'] as const
const CREAM = '#fff0e0'
const BLUSH = '#ff8fb8'
const WET = '#2396ad'

const svgStyle = (height: number): CSSProperties => ({ height, display: 'block', overflow: 'visible' })
/** An eye: an ink oval with a catchlight; the pupil part slides a little toward what it looks at. */
function Eye({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r * 0.86} ry={r} fill={INK} />
      <circle cx={x + r * 0.3} cy={y - r * 0.36} r={r * 0.34} fill="#fff" />
    </>
  )
}
const Blush = ({ x, y, r = 5 }: { x: number; y: number; r?: number }) => <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill={BLUSH} opacity="0.6" />

// ---------------------------------------------------------------------------------------------------------------------
export const SLOTH_ACTIONS = { wake: 1.8, wave: 1.6, shake: 0.9 }
type SlothPart = 'root' | 'body' | 'head' | 'open' | 'shut' | 'mouth' | 'armR' | 'legs'
/** The sloth hangs by her claws from y = 0, asleep until a splash wakes her. Voice: sloth. */
export const Sloth = forwardRef<PuppetHandle, { height: number; awake: boolean; label?: string }>(function Sloth({ height, awake, label = 'sloth' }, ref) {
  const awakeRef = useRef(awake)
  awakeRef.current = awake
  const st = useRef({ sway: spring(40, 5) }).current
  const { svg, part } = usePuppet<SlothPart>(ref, {
    voice: 'sloth',
    actions: SLOTH_ACTIONS,
    eyes: [0, 48],
    frame: (f, p) => {
      const q = f.p
      const e = bell(q)
      let sway = Math.sin(f.t * 0.9) * 2.5
      let arm = 0
      let yawn = 0
      let stretch = 0
      let shut = !awakeRef.current || f.blink < 0.5
      if (f.action === 'wake') {
        stretch = bell(span(q, 0.1, 0.9))
        yawn = bell(span(q, 0.2, 0.8))
        shut = q < 0.5
      } else if (f.action === 'wave') {
        arm = bell(span(q, 0, 1)) * (70 + Math.sin(q * Math.PI * 5) * 16)
      } else if (f.action === 'shake') {
        sway += Math.sin(q * Math.PI * 10) * 9 * e
        shut = true
      }
      const breath = Math.sin(f.t * 1.3)
      setT(p.root, `rotate(${st.sway.step(sway, f.dt).toFixed(2)})`)
      setT(p.body, `translate(0 84) scale(${(1 + breath * 0.02).toFixed(3)} ${(1 - breath * 0.016 + stretch * 0.05).toFixed(3)}) translate(0 -84)`)
      setT(p.legs, `translate(0 ${(stretch * 5).toFixed(1)})`)
      setT(p.head, `translate(${(f.look.x * 2).toFixed(1)} ${(stretch * -3 + f.look.y * 1.5).toFixed(1)}) rotate(${(Math.sin(f.t * 0.7) * 3).toFixed(2)} 0 50)`)
      setT(p.armR, `rotate(${arm.toFixed(1)} 15 46)`)
      setT(p.mouth, `translate(0 61) scale(${(1 + yawn * 0.5).toFixed(3)} ${Math.max(0.12, f.mouth * 1.6 + yawn * 2.2).toFixed(3)})`)
      show(p.open, !shut)
      show(p.shut, shut)
    },
  })
  return (
    <svg ref={svg} viewBox="-55 -8 110 166" role="img" aria-label={label} style={svgStyle(height)}>
      <g ref={part('root')}>
        <path d="M-20 2L-15 46" stroke={FUR[0]} strokeWidth="15" strokeLinecap="round" />
        <path d="M-27 -3q7 -9 14 0" fill="none" stroke={CREAM} strokeWidth="3.5" strokeLinecap="round" />
        <g ref={part('armR')}>
          <path d="M20 2L15 46" stroke={FUR[0]} strokeWidth="15" strokeLinecap="round" />
          <path d="M13 -3q7 -9 14 0" fill="none" stroke={CREAM} strokeWidth="3.5" strokeLinecap="round" />
        </g>
        <g ref={part('legs')}>
          <path d="M-16 112L-20 138M16 112L20 138" stroke={FUR[0]} strokeWidth="14" strokeLinecap="round" />
          <path d="M-25 144l3 6M-19 145l1 6M17 145l-1 6M24 144l-3 6" fill="none" stroke={CREAM} strokeWidth="3" strokeLinecap="round" />
        </g>
        <g ref={part('body')}>
          <ellipse cx="0" cy="84" rx="34" ry="42" fill={FUR[0]} />
          <path d="M8 44C33 54 40 102 17 124C29 98 27 64 8 44Z" fill={FUR[1]} />
          <path d="M-22 60C-28 76 -28 94 -22 108" fill="none" stroke={FUR[2]} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        </g>
        <g ref={part('head')}>
          <circle cx="0" cy="50" r="25" fill={FUR[0]} />
          <ellipse cx="0" cy="52" rx="19" ry="17" fill={CREAM} />
          <ellipse cx="-9" cy="49" rx="7.5" ry="4.4" fill="#8a5b3d" transform="rotate(24 -9 49)" />
          <ellipse cx="9" cy="49" rx="7.5" ry="4.4" fill="#8a5b3d" transform="rotate(-24 9 49)" />
          <g ref={part('open')}>
            <circle cx="-8" cy="49" r="2.8" fill={INK} />
            <circle cx="8" cy="49" r="2.8" fill={INK} />
            <circle cx="-7.1" cy="48.1" r="1" fill="#fff" />
            <circle cx="8.9" cy="48.1" r="1" fill="#fff" />
          </g>
          <path ref={part('shut')} d="M-11.5 48.5q3.5 3 7 0.5M4.5 49q3.5 2.5 7 -0.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="0" cy="55" rx="3.6" ry="2.5" fill={INK} />
          <path d="M-5 60Q0 64.5 5 60" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <ellipse ref={part('mouth')} rx="3.4" ry="2.6" fill="#b7356a" />
          <Blush x={-13} y={58} r={4.2} />
          <Blush x={13} y={58} r={4.2} />
        </g>
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
export const MONKEY_ACTIONS = { chatter: 0.9, point: 1.1, cheer: 1.2, pull: 1.1 }
type MonkeyPart = 'root' | 'head' | 'tail' | 'armL' | 'armR' | 'eyes' | 'mouth'
/** A squirrel monkey sitting on a branch (y = 0). Voice: monkey. */
export const Monkey = forwardRef<PuppetHandle, { height: number; label?: string }>(function Monkey({ height, label = 'monkey' }, ref) {
  const st = useRef({ tail: spring(60, 6), armL: spring(120, 10), armR: spring(120, 10) }).current
  const { svg, part } = usePuppet<MonkeyPart>(ref, {
    voice: 'monkey',
    actions: MONKEY_ACTIONS,
    eyes: [0, -62],
    frame: (f, p) => {
      const q = f.p
      const e = bell(q)
      let y = 0
      let sy = 1 + Math.sin(f.t * 2.4) * 0.015
      let tail = Math.sin(f.t * 1.7) * 14
      let armL = 0
      let armR = 0
      let head = Math.sin(f.t * 1.1) * 3 + f.look.x * 5
      let mouth = f.mouth
      if (f.action === 'chatter') {
        y = -Math.abs(Math.sin(q * Math.PI * 4)) * 10 * e
        armL = 120 * e
        armR = -120 * e
        mouth = Math.max(mouth, Math.abs(Math.sin(q * Math.PI * 7)) * 0.8 * e)
        tail += Math.sin(q * Math.PI * 6) * 20
      } else if (f.action === 'point') {
        armL = 70 * bell(span(q, 0, 1))
        head += 8 * e
      } else if (f.action === 'cheer') {
        const air = bell(span(q, 0.15, 0.8))
        y = -air * 26
        sy *= 1 + air * 0.06 - bell(span(q, 0, 0.15)) * 0.1
        armL = 150 * e
        armR = -150 * e
        mouth = Math.max(mouth, 0.7 * e)
      } else if (f.action === 'pull') {
        y = e * 8
        armL = -30 * e
        armR = 40 * e
        head += 10 * e
      }
      setT(p.root, `translate(0 ${y.toFixed(1)}) scale(1 ${sy.toFixed(3)})`)
      setT(p.tail, `rotate(${st.tail.step(tail, f.dt).toFixed(1)} 12 -8)`)
      setT(p.armL, `rotate(${st.armL.step(armL, f.dt).toFixed(1)} -12 -40)`)
      setT(p.armR, `rotate(${st.armR.step(armR, f.dt).toFixed(1)} 12 -40)`)
      setT(p.head, `rotate(${head.toFixed(2)} 0 -46)`)
      setT(p.eyes, `translate(${(f.look.x * 1.6).toFixed(1)} ${(f.look.y * 1.2).toFixed(1)}) translate(0 -61) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 61)`)
      setT(p.mouth, `translate(0 -51) scale(1 ${Math.max(0.15, mouth * 1.8).toFixed(2)})`)
    },
  })
  return (
    <svg ref={svg} viewBox="-55 -96 110 150" role="img" aria-label={label} style={svgStyle(height)}>
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path d="M12 -8C38 -2 42 30 26 44C18 51 9 43 15 36" fill="none" stroke={FUR[1]} strokeWidth="7" strokeLinecap="round" />
        </g>
        <ellipse cx="0" cy="-28" rx="19" ry="25" fill={FUR[0]} />
        <ellipse cx="-2" cy="-24" rx="11" ry="16" fill={CREAM} />
        <ellipse cx="11" cy="-5" rx="14" ry="7.5" fill="#ffc83d" />
        <ellipse cx="-11" cy="-5" rx="13" ry="7" fill="#eba123" />
        <g ref={part('armR')}>
          <path d="M12 -40C24 -32 26 -18 20 -8" fill="none" stroke="#ffc83d" strokeWidth="8" strokeLinecap="round" />
          <circle cx="20" cy="-7" r="5.5" fill="#eba123" />
        </g>
        <g ref={part('armL')}>
          <path d="M-12 -40C-24 -32 -26 -18 -20 -8" fill="none" stroke="#ffc83d" strokeWidth="8" strokeLinecap="round" />
          <circle cx="-20" cy="-7" r="5.5" fill="#eba123" />
        </g>
        <g ref={part('head')}>
          <circle cx="-20" cy="-64" r="7.5" fill={CREAM} />
          <circle cx="20" cy="-64" r="7.5" fill={CREAM} />
          <circle cx="0" cy="-64" r="20" fill="#8a5b3d" />
          <circle cx="-7.5" cy="-62" r="9.5" fill="#fff" />
          <circle cx="7.5" cy="-62" r="9.5" fill="#fff" />
          <ellipse cx="0" cy="-54" rx="10" ry="7.5" fill="#fff" />
          <ellipse cx="0" cy="-53.5" rx="7" ry="5.4" fill="#6b432e" />
          <ellipse ref={part('mouth')} rx="3.2" ry="2.2" fill="#ff8fa8" />
          <g ref={part('eyes')}>
            <Eye x={-7.5} y={-63} r={3.3} />
            <Eye x={7.5} y={-63} r={3.3} />
          </g>
        </g>
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
export const CAPY_ACTIONS = { nod: 0.8, cheer: 1.1, hop: 0.7, shake: 0.8 }
type CapyPart = 'root' | 'head' | 'ear' | 'eye' | 'mouth' | 'legs'
/** A capybara floating at the surface (y = 0 is the waterline), facing right. `baby`: small and round. Voice: capy
 *  (the mama only). `dry`: out of the water (the baby riding on Rosa's back). */
export const Capy = forwardRef<PuppetHandle, { height: number; baby?: boolean; dry?: () => boolean; label?: string }>(function Capy({ height, baby, dry, label = baby ? 'baby capybara' : 'capybara' }, ref) {
  const id = baby ? 'rio-capy-b' : 'rio-capy'
  const dryRef = useRef(dry)
  dryRef.current = dry
  const { svg, part } = usePuppet<CapyPart | 'wet'>(ref, {
    voice: baby ? undefined : 'capy',
    actions: CAPY_ACTIONS,
    eyes: [48, -36],
    frame: (f, p) => {
      const q = f.p
      const e = bell(q)
      const out = dryRef.current?.() ?? false
      let y = out ? 0 : Math.sin(f.t * 1.6) * 3
      let rot = out ? 0 : Math.sin(f.t * 1.1) * 2
      let head = Math.sin(f.t * 0.8) * 2 + f.look.y * 4
      let sx = 1
      let sy = 1
      if (f.action === 'nod') head += Math.sin(q * Math.PI * 2) * 12
      else if (f.action === 'cheer' || f.action === 'hop') {
        const air = bell(span(q, 0.2, 0.8))
        y -= air * (f.action === 'cheer' ? 26 : 16)
        const land = wobble(span(q, 0.8, 1), 2)
        sx = 1 + land * 0.08
        sy = 1 - land * 0.1
        head -= air * 8
      } else if (f.action === 'shake') rot += Math.sin(q * Math.PI * 10) * 7 * e
      setT(p.root, `translate(0 ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`)
      setT(p.head, `rotate(${head.toFixed(2)} 26 -24)`)
      setT(p.ear, `rotate(${(Math.sin(f.t * 3.1) > 0.94 ? -22 : 0).toFixed(0)} 32 -52)`)
      setT(p.eye, `translate(${(f.look.x * 1.4).toFixed(1)} ${(f.look.y * 1.2).toFixed(1)}) translate(0 -37) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 37)`)
      setT(p.mouth, `translate(64 -22) scale(1 ${Math.max(0.2, f.mouth * 2.4).toFixed(2)})`)
      setT(p.legs, `rotate(${(Math.sin(f.t * 5) * (out ? 0 : 16)).toFixed(1)} 0 14)`)
      show(p.wet, !out)
    },
  })
  const bx = baby ? -44 : -62
  const bw = baby ? 92 : 112
  const s = baby ? 1.12 : 1
  return (
    <svg ref={svg} viewBox="-80 -70 160 110" role="img" aria-label={label} style={svgStyle(height)}>
      <defs>
        <clipPath id={id}>
          <rect x={bx} y="-40" width={bw} height="60" rx="28" />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('legs')}>
          <rect x={bx + 20} y="12" width="13" height="20" rx="6" fill={FUR[1]} />
          <rect x={bx + bw - 40} y="12" width="13" height="20" rx="6" fill={FUR[1]} />
        </g>
        <rect x={bx} y="-40" width={bw} height="60" rx="28" fill={FUR[0]} />
        <path d={`M${bx + 16} 6C${bx + 40} 18 ${bx + bw - 30} 16 ${bx + bw - 8} -4C${bx + bw - 10} 12 ${bx + bw - 24} 20 ${bx + bw - 30} 20L${bx + 28} 20C${bx + 20} 18 ${bx + 16} 12 ${bx + 16} 6Z`} fill={FUR[1]} />
        <path d={`M${bx + 26} -31C${bx + 46} -38 ${bx + 70} -38 ${bx + 84} -32`} fill="none" stroke={FUR[2]} strokeWidth="5" strokeLinecap="round" />
        <rect ref={part('wet')} x="-80" y="2" width="160" height="40" fill={WET} opacity="0.38" clipPath={`url(#${id})`} />
        <g ref={part('head')} transform="rotate(0)">
          <g transform={`translate(26 -24) scale(${s}) translate(-26 24)`}>
            <g ref={part('ear')}>
              <ellipse cx="32" cy="-54" rx="6.5" ry="5.5" fill={FUR[1]} />
            </g>
            <rect x="22" y="-56" width="52" height="40" rx="16" fill={FUR[0]} />
            <path d="M62 -56C70 -54 74 -48 74 -40L74 -32C74 -24 68 -16 60 -16C66 -26 68 -42 62 -56Z" fill={FUR[1]} />
            <g ref={part('eye')}>
              <Eye x={48} y={-37} r={3.6} />
            </g>
            <ellipse cx="70" cy="-36" rx="2.6" ry="3.4" fill={INK} />
            <path d="M58 -25Q64 -21 70 -26" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
            <ellipse ref={part('mouth')} rx="3.6" ry="1.6" fill="#b7356a" />
            <Blush x={44} y={-27} r={5.5} />
          </g>
        </g>
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
export const OTTER_ACTIONS = { wave: 1.1, cheer: 1.3, float: 2.2, dip: 0.9 }
type OtterPart = 'root' | 'tail' | 'head' | 'paw' | 'eye' | 'mouth'
const OTTER_TONES = { brown: ['#a9795a', '#8a5b3d', '#c99b78'], dark: ['#8a5b3d', '#6b432e', '#b17d56'] } as const
/** A giant river otter swimming at the surface (y = 0), facing right. Voice: otter. */
export const Otter = forwardRef<PuppetHandle, { height: number; tone?: keyof typeof OTTER_TONES; speed?: () => number; voice?: boolean; label?: string }>(function Otter({ height, tone = 'brown', speed, voice = true, label = 'otter' }, ref) {
  const c = OTTER_TONES[tone]
  const id = `rio-otter-${tone}`
  const speedRef = useRef(speed)
  speedRef.current = speed
  const st = useRef({ phase: 0, v: 0, paw: spring(120, 10) }).current
  const { svg, part } = usePuppet<OtterPart>(ref, {
    voice: voice ? 'otter' : undefined,
    actions: OTTER_ACTIONS,
    eyes: [66, -26],
    frame: (f, p) => {
      st.v += (clamp(speedRef.current?.() ?? 0) - st.v) * Math.min(1, f.dt * 3)
      st.phase += f.dt * (3 + st.v * 9)
      const q = f.p
      const e = bell(q)
      let y = Math.sin(st.phase) * (3 + st.v * 5)
      let rot = Math.sin(st.phase + 0.8) * (2 + st.v * 4)
      let tail = Math.sin(st.phase - 1) * (14 + st.v * 16)
      let paw = Math.sin(st.phase * 2) * 20
      let head = Math.sin(f.t * 1.2) * 3 + f.look.y * 5
      let mouth = f.mouth
      if (f.action === 'wave') {
        paw = -100 * e + Math.sin(q * Math.PI * 6) * 22 * e
        rot -= 8 * e
      } else if (f.action === 'cheer') {
        const air = bell(span(q, 0.15, 0.85))
        y -= air * 34
        rot -= air * 22
        paw = -110 * air + Math.sin(q * Math.PI * 10) * 24 * air
        mouth = Math.max(mouth, 0.7 * air)
      } else if (f.action === 'float') {
        // A lazy roll onto his back, paws on his tummy.
        rot -= 16 * e
        paw = -70 * e
        tail = Math.sin(f.t * 2) * 8
        head -= 10 * e
      } else if (f.action === 'dip') {
        y += e * 46
        rot += Math.sin(q * Math.PI * 2) * 20
      }
      setT(p.root, `translate(0 ${y.toFixed(1)}) rotate(${rot.toFixed(2)})`)
      setT(p.tail, `rotate(${tail.toFixed(1)} -62 4)`)
      setT(p.paw, `rotate(${st.paw.step(paw, f.dt).toFixed(1)} 38 8)`)
      setT(p.head, `rotate(${head.toFixed(2)} 50 -8)`)
      setT(p.eye, `translate(${(f.look.x * 1.4).toFixed(1)} ${(f.look.y * 1.2).toFixed(1)}) translate(0 -27) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 27)`)
      setT(p.mouth, `translate(80 -10) scale(1 ${Math.max(0.15, mouth * 2.6).toFixed(2)})`)
    },
  })
  return (
    <svg ref={svg} viewBox="-140 -66 250 120" role="img" aria-label={label} style={svgStyle(height)}>
      <defs>
        <clipPath id={id}>
          <rect x="-74" y="-16" width="128" height="40" rx="20" />
        </clipPath>
      </defs>
      <g ref={part('root')}>
        <g ref={part('tail')}>
          <path d="M-58 -10C-84 -8 -110 -2 -132 8C-110 16 -84 18 -58 18Z" fill={c[1]} />
        </g>
        <rect x="-74" y="-16" width="128" height="40" rx="20" fill={c[0]} />
        <path d="M-56 12C-20 22 20 20 44 6C40 18 28 24 16 24L-50 24C-54 22 -56 16 -56 12Z" fill={c[1]} />
        <path d="M-50 -9C-24 -14 6 -14 26 -10" fill="none" stroke={c[2]} strokeWidth="5" strokeLinecap="round" />
        <rect x="-140" y="2" width="250" height="40" fill={WET} opacity="0.36" clipPath={`url(#${id})`} />
        <g ref={part('paw')}>
          <path d="M38 8C42 18 40 28 34 34" fill="none" stroke={c[1]} strokeWidth="11" strokeLinecap="round" />
        </g>
        <g ref={part('head')}>
          <path d="M30 -12C36 -30 52 -44 68 -44C84 -44 96 -32 96 -18C96 -4 84 6 68 6C54 6 40 4 30 -4Z" fill={c[0]} />
          <circle cx="52" cy="-42" r="6.5" fill={c[1]} />
          <path d="M40 0C50 6 64 8 76 4C68 14 50 14 40 6Z" fill={CREAM} />
          <ellipse cx="82" cy="-12" rx="15" ry="11" fill={CREAM} />
          <ellipse cx="92" cy="-18" rx="4.4" ry="3.4" fill={INK} />
          <ellipse ref={part('mouth')} rx="4" ry="1.6" fill="#b7356a" />
          <path d="M84 -8l14 -2M84 -5l13 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
          <g ref={part('eye')}>
            <Eye x={68} y={-27} r={3.8} />
          </g>
          <Blush x={64} y={-15} r={5.5} />
        </g>
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
export const BIRD_ACTIONS = { squawk: 0.7, hop: 0.6, flap: 1.3 }
type BirdPart = 'root' | 'head' | 'beak' | 'wing' | 'eye'
/** A toucan perched on a branch (feet at y = 0), facing right. */
export const Toucan = forwardRef<PuppetHandle, { height: number }>(function Toucan({ height }, ref) {
  const { svg, part } = usePuppet<BirdPart>(ref, {
    actions: BIRD_ACTIONS,
    eyes: [8, -62],
    frame: (f, p) => {
      const q = f.p
      const e = bell(q)
      let y = 0
      let head = Math.sin(f.t * 0.9) * 4 + (Math.sin(f.t * 0.37) > 0.9 ? 14 : 0)
      let beak = 0
      let wing = 0
      if (f.action === 'squawk') {
        beak = Math.abs(Math.sin(q * Math.PI * 3)) * 16 * e
        head -= 12 * e
      } else if (f.action === 'hop') {
        y = -bell(span(q, 0.15, 0.85)) * 22
        wing = -40 * e
      } else if (f.action === 'flap') {
        y = -e * 30
        wing = -50 * e + Math.sin(q * Math.PI * 12) * 30 * e
      }
      setT(p.root, `translate(0 ${y.toFixed(1)}) scale(1 ${(1 + Math.sin(f.t * 2) * 0.012).toFixed(3)})`)
      setT(p.head, `rotate(${head.toFixed(2)} 4 -44)`)
      setT(p.beak, `rotate(${beak.toFixed(1)} 16 -52)`)
      setT(p.wing, `rotate(${wing.toFixed(1)} -2 -44)`)
      setT(p.eye, `translate(0 -63) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 63)`)
    },
  })
  return (
    <svg ref={svg} viewBox="-44 -92 116 126" role="img" aria-label="toucan" style={svgStyle(height)}>
      <g ref={part('root')}>
        <path d="M-10 -22C-22 -10 -30 8 -32 26C-22 18 -12 4 -4 -8Z" fill={INK} />
        <path d="M-4 0v-8M6 0v-8" stroke="#8ccfff" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="0" cy="-30" rx="19" ry="25" fill="#3a3147" />
        <path d="M2 -52C15 -50 20 -34 15 -22C8 -28 4 -40 2 -52Z" fill="#fbea9a" />
        <g ref={part('wing')}>
          <path d="M-6 -46C-18 -38 -20 -18 -12 -6C-2 -14 2 -32 -6 -46Z" fill="#544a66" />
        </g>
        <g ref={part('head')}>
          <circle cx="4" cy="-60" r="15" fill="#3a3147" />
          <ellipse cx="9" cy="-58" rx="9" ry="10" fill="#fbea9a" />
          <g ref={part('beak')}>
            <path d="M15 -52C30 -52 46 -51 61 -50C55 -43 34 -44 17 -48Z" fill="#ffc83d" />
          </g>
          <path d="M14 -68C42 -73 60 -62 62 -50C46 -51 30 -52 14 -52Z" fill="#ff9c57" />
          <path d="M53 -64C59 -61 62 -56 62 -50L55 -51Z" fill="#d9485e" />
          <path d="M20 -64C32 -67 44 -65 52 -60" fill="none" stroke="#ffc595" strokeWidth="3" strokeLinecap="round" />
          <g ref={part('eye')}>
            <Eye x={8} y={-63} r={3.2} />
          </g>
        </g>
      </g>
    </svg>
  )
})

/** A scarlet macaw perched on a branch (feet at y = 0), facing right; its long tail hangs below. */
export const Macaw = forwardRef<PuppetHandle, { height: number }>(function Macaw({ height }, ref) {
  const { svg, part } = usePuppet<BirdPart>(ref, {
    actions: BIRD_ACTIONS,
    eyes: [14, -70],
    frame: (f, p) => {
      const q = f.p
      const e = bell(q)
      let y = 0
      let head = Math.sin(f.t * 1.1) * 4
      let beak = 0
      let wing = Math.sin(f.t * 0.6) > 0.96 ? -20 : 0
      if (f.action === 'squawk') {
        beak = Math.abs(Math.sin(q * Math.PI * 3)) * 14 * e
        head -= 10 * e
      } else if (f.action === 'hop') y = -bell(span(q, 0.15, 0.85)) * 20
      else if (f.action === 'flap') {
        y = -e * 46
        wing = -70 * e + Math.sin(q * Math.PI * 14) * 34 * e
      }
      setT(p.root, `translate(0 ${y.toFixed(1)})`)
      setT(p.head, `rotate(${head.toFixed(2)} 8 -56)`)
      setT(p.beak, `rotate(${beak.toFixed(1)} 22 -62)`)
      setT(p.wing, `rotate(${wing.toFixed(1)} 2 -52)`)
      setT(p.eye, `translate(0 -71) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 71)`)
    },
  })
  return (
    <svg ref={svg} viewBox="-50 -100 110 180" role="img" aria-label="macaw" style={svgStyle(height)}>
      <g ref={part('root')}>
        <path d="M-8 -14C-18 14 -22 44 -18 74C-10 50 -2 22 4 -6Z" fill="#5fb0ea" />
        <path d="M-4 -14C-10 10 -10 34 -6 58C0 36 6 14 8 -8Z" fill="#ff6b6b" />
        <path d="M-2 0v-8M8 0v-8" stroke="#6b432e" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="4" cy="-36" rx="19" ry="28" fill="#ff6b6b" />
        <path d="M14 -58C22 -44 20 -22 10 -10C16 -24 16 -42 14 -58Z" fill="#d9485e" />
        <g ref={part('wing')}>
          <path d="M-8 -56C-22 -44 -26 -14 -16 6C-2 -6 6 -34 -8 -56Z" fill="#5fb0ea" />
          <path d="M-8 -56C-18 -44 -20 -24 -12 -10C-2 -20 2 -40 -8 -56Z" fill="#ffc83d" />
          <path d="M-8 -56C-14 -48 -14 -38 -10 -30C-4 -38 -4 -48 -8 -56Z" fill="#ff6b6b" />
        </g>
        <g ref={part('head')}>
          <circle cx="10" cy="-70" r="15" fill="#ff6b6b" />
          <ellipse cx="15" cy="-68" rx="9" ry="8.5" fill="#fff" />
          <g ref={part('beak')}>
            <path d="M20 -62C26 -60 28 -56 26 -52C22 -54 20 -58 20 -62Z" fill={INK} />
          </g>
          <path d="M20 -78C34 -78 36 -64 27 -56C27 -62 25 -68 19 -70Z" fill={CREAM} />
          <g ref={part('eye')}>
            <Eye x={14} y={-71} r={3} />
          </g>
        </g>
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
export const FROG_ACTIONS = { hop: 0.9, croak: 0.7 }
type FrogPart = 'root' | 'throat' | 'eyes'
/** A little frog on a floating leaf (the leaf's middle is the waterline, y = 0). */
export const Frog = forwardRef<PuppetHandle, { height: number }>(function Frog({ height }, ref) {
  const { svg, part } = usePuppet<FrogPart>(ref, {
    actions: FROG_ACTIONS,
    eyes: [0, -36],
    frame: (f, p) => {
      const q = f.p
      let y = 0
      let sx = 1 + Math.sin(f.t * 2.2) * 0.02
      let sy = 1 - Math.sin(f.t * 2.2) * 0.03
      let throat = 0
      if (f.action === 'hop') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.8))
        const land = wobble(span(q, 0.8, 1), 2)
        y = -air * 70
        sx += crouch * 0.16 + land * 0.12 - air * 0.06
        sy += -crouch * 0.2 - land * 0.14 + air * 0.12
      } else if (f.action === 'croak') throat = bell(q)
      setT(p.root, `translate(0 ${y.toFixed(1)}) translate(0 -4) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(0 4)`)
      setT(p.throat, `translate(0 -10) scale(${(0.4 + throat * 0.9).toFixed(2)})`)
      setT(p.eyes, `translate(${(f.look.x * 1.6).toFixed(1)} ${(f.look.y * 1.2).toFixed(1)}) translate(0 -36) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 36)`)
    },
  })
  return (
    <svg ref={svg} viewBox="-50 -60 100 76" role="img" aria-label="frog" style={svgStyle(height)}>
      <ellipse cx="0" cy="4" rx="46" ry="9" fill={LEAF[1]} />
      <ellipse cx="0" cy="1" rx="46" ry="8" fill={LEAF[0]} />
      <path d="M-30 1L30 1" stroke={LEAF[2]} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      <g ref={part('root')}>
        <ellipse cx="-18" cy="-4" rx="10" ry="5" fill="#ff9c57" />
        <ellipse cx="18" cy="-4" rx="10" ry="5" fill="#ff9c57" />
        <ellipse ref={part('throat')} rx="14" ry="11" fill="#fff6cc" />
        <ellipse cx="0" cy="-18" rx="25" ry="18" fill="#5cc6a6" />
        <ellipse cx="0" cy="-11" rx="16" ry="9.5" fill="#c7f3e4" />
        <circle cx="-12" cy="-34" r="10" fill="#5cc6a6" />
        <circle cx="12" cy="-34" r="10" fill="#5cc6a6" />
        <circle cx="-12" cy="-35" r="7" fill="#fff" />
        <circle cx="12" cy="-35" r="7" fill="#fff" />
        <g ref={part('eyes')}>
          <ellipse cx="-11" cy="-35" rx="3.2" ry="4" fill={INK} />
          <ellipse cx="13" cy="-35" rx="3.2" ry="4" fill={INK} />
        </g>
        <path d="M-9 -19Q0 -12 9 -19" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <Blush x={-17} y={-19} r={4.4} />
        <Blush x={17} y={-19} r={4.4} />
      </g>
    </svg>
  )
})

export const TURTLE_ACTIONS = { plop: 2.6, peek: 0.9 }
type TurtlePart = 'root' | 'head' | 'eye'
/** A river turtle sunning on a log (its feet at y = 0), facing right. `plop`: slides off into the water and climbs back. */
export const Turtle = forwardRef<PuppetHandle, { height: number }>(function Turtle({ height }, ref) {
  const { svg, part } = usePuppet<TurtlePart>(ref, {
    actions: TURTLE_ACTIONS,
    eyes: [44, -22],
    frame: (f, p) => {
      const q = f.p
      let y = 0
      let rot = 0
      let head = Math.sin(f.t * 0.8) * 3
      let o = 1
      if (f.action === 'plop') {
        const off = span(q, 0, 0.25)
        const back = span(q, 0.7, 1)
        const under = off * (1 - back)
        y = under * 90
        rot = under * 50
        o = 1 - span(q, 0.2, 0.3) + span(q, 0.7, 0.8)
        head -= 14 * (1 - back) * off
      } else if (f.action === 'peek') head = -16 * bell(q)
      setT(p.root, `translate(${(rot * 0.5).toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`)
      ;(p.root as SVGGraphicsElement).style.opacity = clamp(o).toFixed(2)
      setT(p.head, `translate(${head.toFixed(1)} 0)`)
      setT(p.eye, `translate(0 -23) scale(1 ${Math.max(0.1, f.blink).toFixed(2)}) translate(0 23)`)
    },
  })
  return (
    <svg ref={svg} viewBox="-50 -52 110 60" role="img" aria-label="turtle" style={svgStyle(height)}>
      <g ref={part('root')}>
        <ellipse cx="-22" cy="-3" rx="9" ry="5" fill="#48a96c" />
        <ellipse cx="22" cy="-3" rx="9" ry="5" fill="#48a96c" />
        <path d="M-36 -8C-44 -8 -48 -5 -50 -2C-44 -2 -38 -3 -34 -5Z" fill="#48a96c" />
        <g ref={part('head')}>
          <ellipse cx="42" cy="-20" rx="13" ry="10.5" fill="#73cf86" />
          <path d="M26 -10L38 -14L36 -6Z" fill="#73cf86" />
          <g ref={part('eye')}>
            <Eye x={45} y={-23} r={2.8} />
          </g>
          <path d="M44 -15Q48 -13 51 -16" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
          <Blush x={39} y={-15} r={3.4} />
        </g>
        <path d="M-36 -6C-36 -32 -18 -46 0 -46C18 -46 36 -32 36 -6Z" fill="#3e9e78" />
        <path d="M10 -45C26 -40 36 -26 36 -6L20 -6C22 -22 18 -36 10 -45Z" fill="#2b7a5f" />
        <path d="M-22 -16C-18 -30 -8 -38 4 -39" fill="none" stroke="#69c19a" strokeWidth="5" strokeLinecap="round" />
        <rect x="-38" y="-10" width="76" height="7" rx="3.5" fill="#fbea9a" />
      </g>
    </svg>
  )
})

// ---------------------------------------------------------------------------------------------------------------------
const FISH_TONES = [
  ['#ffc83d', '#eba123'],
  ['#ff9c57', '#e57a35'],
  ['#8fe3c8', '#5cc6a6'],
  ['#b9a6f5', '#937ee0'],
] as const
/** A little fish facing right (the game moves and turns it; its tail wags by itself). */
export function Fish({ n, size = 58 }: { n: number; size?: number }) {
  const [c, shade] = FISH_TONES[n % FISH_TONES.length]
  return (
    <svg aria-hidden viewBox="-38 -18 64 36" style={{ width: size, height: size * 0.56, display: 'block', overflow: 'visible' }}>
      <path className="rio-wag" d="M-18 0L-36 -13L-36 13Z" fill={shade} style={{ animationDelay: `${-(n % 7) * 0.13}s` }} />
      <ellipse rx="23" ry="13.5" fill={c} />
      <path d="M-6 -11.5C0 -21 11 -19 13 -10Z" fill={shade} />
      <ellipse cx="12" cy="-2" rx="3" ry="3.6" fill={INK} />
      <circle cx="13" cy="-3.2" r="1.1" fill="#fff" />
      <ellipse cx="6" cy="5.5" rx="4.4" ry="2.6" fill={BLUSH} opacity="0.6" />
    </svg>
  )
}

export const BUTTERFLY_ACTIONS = { flee: 1.8 }
type FlyPart = 'root' | 'left' | 'right'
/** A butterfly fluttering round its spot. `flee`: off and up, then back. */
export const Butterfly = forwardRef<PuppetHandle, { size: number; n: number }>(function Butterfly({ size, n }, ref) {
  const tone = n % 2 ? ['#b9a6f5', '#ddd2ff'] : ['#ff8fb8', '#ffc4da']
  const { svg, part } = usePuppet<FlyPart>(ref, {
    actions: BUTTERFLY_ACTIONS,
    frame: (f, p) => {
      const t = f.t + n * 1.7
      let x = Math.sin(t * 0.7) * 46 + Math.sin(t * 1.9) * 12
      let y = Math.sin(t * 1.1) * 26 + Math.cos(t * 2.3) * 8
      let rate = 16
      if (f.action === 'flee') {
        const e = bell(f.p)
        x += e * 120 * (n % 2 ? 1 : -1)
        y -= e * 150
        rate = 26
      }
      const flap = 0.25 + 0.75 * Math.abs(Math.sin(t * rate))
      setT(p.root, `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(Math.sin(t * 0.7) * 14).toFixed(1)})`)
      setT(p.left, `scale(${flap.toFixed(2)} 1)`)
      setT(p.right, `scale(${flap.toFixed(2)} 1)`)
    },
  })
  const wing = (
    <>
      <ellipse cx="12" cy="-8" rx="13" ry="10" fill={tone[0]} />
      <ellipse cx="10" cy="8" rx="9" ry="7.5" fill={tone[0]} />
      <circle cx="13" cy="-8" r="4.5" fill={tone[1]} />
    </>
  )
  return (
    <svg ref={svg} viewBox="-30 -22 60 44" aria-hidden style={{ width: size, height: size * 0.73, display: 'block', overflow: 'visible' }}>
      <g ref={part('root')}>
        <g ref={part('right')}>{wing}</g>
        <g transform="scale(-1 1)">
          <g ref={part('left')}>{wing}</g>
        </g>
        <rect x="-2.2" y="-12" width="4.4" height="24" rx="2.2" fill={INK} />
      </g>
    </svg>
  )
})

/** Each puppet's drawing box (x, y, w, h); its own (0, 0) is the line it hangs from, sits on or floats at. */
export const BOX = {
  sloth: [-55, -8, 110, 166],
  monkey: [-55, -96, 110, 150],
  capy: [-80, -70, 160, 110],
  otter: [-140, -66, 250, 120],
  toucan: [-44, -92, 116, 126],
  macaw: [-50, -100, 110, 180],
  frog: [-50, -60, 100, 76],
  turtle: [-50, -52, 110, 60],
} as const

/** Puts a puppet in the world so that its own (0, 0) lands on (x, y). `h` is its height in world units. */
export function Spot({ x, y, h, box, flip, z = 5, children, el, style }: { x: number; y: number; h: number; box: readonly [number, number, number, number]; flip?: boolean; z?: number; children: ReactNode; el?: Ref<HTMLDivElement>; style?: CSSProperties }) {
  const k = h / box[3]
  return (
    <div ref={el} style={{ position: 'absolute', left: x + box[0] * k, top: y + box[1] * k, width: box[2] * k, height: h, zIndex: z, pointerEvents: 'none', transformOrigin: `${-box[0] * k}px ${-box[1] * k}px`, transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {children}
    </div>
  )
}
