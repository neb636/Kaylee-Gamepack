// The baby hippo of the Nile: a layered SVG puppet, drawn by hand. She breathes, blinks, watches her finger, flicks her
// ears and talks in her own voice. In the river (`swimming`) only her head shows above the water: she can pop up, dive,
// blow a fountain and giggle. On land (the market, the light show) she stands on her stubby feet and can jump, dance,
// wiggle, cheer and nod like the other guests. She can balance a lotus on her head, or wear a lotus crown.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK } from '../../../kit/ink'
import { LotusArt } from '../Lotus'

export interface HippoProps {
  height?: string
  style?: CSSProperties
  onTap?: () => void
  /** In the river: everything below her chin is under water. */
  swimming?: boolean
  /** Starts under water (`play('pop')` brings her up). */
  under?: boolean
  /** A lotus balanced on her head. */
  lotus?: boolean
  /** Her lotus crown. */
  crown?: boolean
}

const SKIN = '#C9B8F6'
const SHADE = '#AE9BEA'
const LIGHT = '#E1D7FF'
const PINK = '#FFB3C4'
const line = (w = 6) => ({ stroke: INK, strokeWidth: w, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const })

export const HIPPO_ACTIONS = { pop: 0.7, dive: 0.6, spout: 1.1, giggle: 0.8, jump: 0.75, dance: 1.4, wiggle: 0.6, cheer: 1.2, nod: 0.6 }
/** How far down "under water" is, in her drawing's units. */
const DEEP = 250
/** The waterline in her drawing (of 440): place her so this row sits on the water. */
export const HIPPO_WATERLINE = 318 / 440

type Part = 'root' | 'head' | 'earL' | 'earR' | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'pupilL' | 'pupilR' | 'mouth' | 'teeth' | 'smile' | 'spout' | 'ripple' | 'shadow'

/** The baby hippo. Actions: pop, dive, spout, giggle (river); jump, dance, wiggle, cheer, nod (land). Voice: hippo. */
export const Hippo = forwardRef<PuppetHandle, HippoProps>(function Hippo({ height, style, onTap, swimming, under, lotus, crown }, ref) {
  const st = useRef({ under: !!under, last: null as string | null, headRot: 0, earL: spring(150, 9), earR: spring(150, 9), flick: 0, nextFlick: 2.5 }).current
  const clip = useId()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'hippo',
    actions: HIPPO_ACTIONS,
    eyes: [200, 176],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      if (st.last === 'dive' && act !== 'dive') st.under = true
      if (act === 'pop') st.under = false
      st.last = act
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))

      const breath = Math.sin(t * 2.1)
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * 0.012
      let y = swimming ? Math.sin(t * 1.7) * 5 : 0
      let rot = 0
      let headRot = Math.sin(t * 1.1) * 1.6 + look.x * 4
      let happy = false
      let mouth = f.mouth
      let spout = 0

      if (st.under) y = DEEP
      if (act === 'pop') {
        // Up through the surface: overshoot, then settle with a wobble.
        const up = smooth(span(q, 0, 0.45))
        y = DEEP * (1 - up) - bell(span(q, 0.3, 0.75)) * 34
        const land = wobble(span(q, 0.5, 1), 2)
        sx *= 1 + land * 0.07
        sy *= 1 - land * 0.07 + bell(span(q, 0.1, 0.5)) * 0.08
        happy = q > 0.3
        mouth = Math.max(mouth, 0.5 * bell(span(q, 0.3, 1)))
      } else if (act === 'dive') {
        const crouch = bell(span(q, 0, 0.3))
        y = -crouch * 16 + DEEP * smooth(span(q, 0.25, 1))
        sy *= 1 + crouch * 0.06
      } else if (act === 'spout' || act === 'cheer') {
        spout = bell(span(q, 0.08, 0.95))
        headRot += Math.sin(q * Math.PI * 4) * 4 * env
        happy = true
        mouth = Math.max(mouth, 0.45 * env)
        if (act === 'cheer') {
          const air = bell(span(q, 0.15, 0.7))
          y -= air * 46
          sy *= 1 + air * 0.08
          sx *= 1 - air * 0.05
        }
      } else if (act === 'giggle' || act === 'wiggle') {
        const w = wobble(q, 3)
        rot = w * 7
        sx *= 1 + w * 0.06
        sy *= 1 - w * 0.06
        happy = true
        mouth = Math.max(mouth, 0.5 * env)
      } else if (act === 'jump') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.12 - air * 0.07 + land * 0.1
        sy *= 1 - crouch * 0.15 + air * 0.1 - land * 0.12
        y -= air * 60
        happy = air > 0.2
      } else if (act === 'dance') {
        const beat = q * Math.PI * 6
        rot = Math.sin(beat) * 9 * bell(q)
        y -= Math.abs(Math.sin(beat)) * 24 * env
        headRot += Math.sin(beat + 0.6) * 6 * env
        happy = true
        mouth = Math.max(mouth, 0.35 * env)
      } else if (act === 'nod') {
        headRot += 0
        sy *= 1 - bell(q) * 0.07
        sx *= 1 + bell(q) * 0.04
        happy = true
      }
      // Talking: little bobs.
      headRot += Math.sin(t * 10) * f.mouth * 2.5
      y -= f.mouth * 3

      if (t > st.nextFlick) {
        st.flick = t
        st.nextFlick = t + 2.5 + Math.random() * 4
      }
      const flick = t - st.flick < 0.3 ? Math.sin(((t - st.flick) / 0.3) * Math.PI * 2) * 16 : 0
      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const earL = st.earL.step(clamp(-vel * 0.05, -18, 18) - flick, dt)
      const earR = st.earR.step(clamp(-vel * 0.05, -18, 18) + flick * 0.4, dt)

      setT(p.root, `translate(0 ${y}) rotate(${rot} 200 420) translate(200 420) scale(${sx} ${sy}) translate(-200 -420)`)
      setT(p.head, `rotate(${headRot} 200 300)`)
      setT(p.earL, `rotate(${earL} 132 128)`)
      setT(p.earR, `rotate(${earR} 268 128)`)
      setT(p.shadow, `translate(200 428) scale(${clamp(1 + y / 200, 0.5, 1)})`)

      const shut = 1 - f.blink
      for (const [eye, open, arc, pupil, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, 156],
        [p.eyeR, p.openR, p.happyR, p.pupilR, 244],
      ] as const) {
        setT(eye, `translate(${x} 176) scale(1 ${happy ? 1 : Math.max(0.08, 1 - shut)})`)
        show(open, !happy)
        show(arc, happy)
        setT(pupil, `translate(${look.x * 3.5} ${look.y * 3.5})`)
      }

      const m = Math.min(1, mouth)
      if (m > 0.06) {
        const w = 44 + m * 10
        const d = 40 * m
        setA(p.mouth, 'd', `M${200 - w} 272 Q200 ${268 - m * 2} ${200 + w} 272 Q${200 + w * 0.8} ${272 + d} 200 ${274 + d} Q${200 - w * 0.8} ${272 + d} ${200 - w} 272Z`)
        show(p.teeth, m > 0.3)
      } else {
        setA(p.mouth, 'd', '')
        show(p.teeth, false)
      }
      show(p.smile, m <= 0.06)

      show(p.spout, spout > 0.02)
      setT(p.spout, `translate(200 110) scale(${0.7 + spout * 0.3} ${spout})`)
      // The ring she makes in the water: wider when she moves through the surface, gone when she's deep.
      if (swimming) {
        const through = 1 - clamp(Math.abs(y - DEEP * 0.5) / (DEEP * 0.5))
        const k = st.under && !act ? 0 : 1 + through * 0.35 + Math.sin(t * 2.4) * 0.03
        setT(p.ripple, `translate(200 318) scale(${k})`)
      }
    },
  })

  const ear = (s: 'L' | 'R') => {
    const x = s === 'L' ? 128 : 272
    return (
      <g ref={part(s === 'L' ? 'earL' : 'earR')}>
        <ellipse cx={x} cy="110" rx="27" ry="29" fill={SKIN} {...line()} />
        <ellipse cx={x} cy="113" rx="13" ry="15" fill={PINK} />
      </g>
    )
  }

  return (
    <svg ref={svg} viewBox="0 0 400 440" onPointerDown={onTap && ((e) => (e.stopPropagation(), onTap()))} role={onTap ? 'button' : undefined} aria-label="Hippo" style={{ height, aspectRatio: '400 / 440', overflow: 'visible', display: 'block', touchAction: onTap ? 'none' : undefined, ...style }}>
      <defs>
        <clipPath id={clip}>
          <rect x="-200" y="-400" width="800" height="718" />
        </clipPath>
      </defs>
      {!swimming && <ellipse ref={part('shadow')} rx="130" ry="13" fill="#4B3A8C" opacity="0.16" />}
      <g clipPath={swimming ? `url(#${clip})` : undefined}>
        <g ref={part('root')}>
          {/* body and feet (under water when she swims) */}
          <ellipse cx="200" cy="336" rx="132" ry="88" fill={SKIN} {...line()} />
          <path d="M92 372 C120 414 280 414 308 372 C296 420 104 420 92 372Z" fill={SHADE} />
          {[142, 258].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="410" rx="44" ry="24" fill={SKIN} {...line()} />
              <path d={`M${x - 20} 420 v9 M${x} 423 v9 M${x + 20} 420 v9`} {...line(4)} fill="none" />
            </g>
          ))}
          <g ref={part('head')}>
            {ear('L')}
            {ear('R')}
            <path d="M200 92 C262 92 292 124 292 168 C292 180 290 190 286 198 C318 208 336 232 336 262 C336 300 290 322 200 322 C110 322 64 300 64 262 C64 232 82 208 114 198 C110 190 108 180 108 168 C108 124 138 92 200 92Z" fill={SKIN} {...line()} />
            <path d="M200 216 C262 216 322 234 322 264 C322 294 276 312 200 312 C124 312 78 294 78 264 C78 234 138 216 200 216Z" fill={LIGHT} />
            <path d="M150 108 C166 100 186 98 204 100" stroke={LIGHT} strokeWidth="7" strokeLinecap="round" fill="none" />
            <ellipse cx="104" cy="256" rx="20" ry="12" fill="#FF9DB0" opacity="0.8" />
            <ellipse cx="296" cy="256" rx="20" ry="12" fill="#FF9DB0" opacity="0.8" />
            {(['L', 'R'] as const).map((s) => (
              <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')} transform={`translate(${s === 'L' ? 156 : 244} 176)`}>
                <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                  <ellipse fill="#2E1C1A" rx="17" ry="21" />
                  <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                    <circle fill="#fff" cx="-5" cy="-8" r="6.5" />
                    <circle fill="#fff" cx="6" cy="7" r="3" />
                  </g>
                </g>
                <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(6)} fill="none" d="M-17 5 Q0 -15 17 5" style={{ display: 'none' }} />
              </g>
            ))}
            <ellipse cx="166" cy="240" rx="10" ry="6.5" fill="#7B66C4" transform="rotate(-14 166 240)" />
            <ellipse cx="234" cy="240" rx="10" ry="6.5" fill="#7B66C4" transform="rotate(14 234 240)" />
            <path ref={part('mouth')} fill="#B8323F" {...line(4.5)} d="" />
            <g ref={part('teeth')} style={{ display: 'none' }}>
              <rect x="172" y="272" width="16" height="13" rx="5" fill="#fff" {...line(3)} />
              <rect x="212" y="272" width="16" height="13" rx="5" fill="#fff" {...line(3)} />
            </g>
            <path ref={part('smile')} {...line(5)} fill="none" d="M152 274 Q200 300 248 274" />
            {/* the fountain she blows */}
            <g ref={part('spout')} style={{ display: 'none' }}>
              <path d="M-13 0 C-17 -60 -52 -96 -72 -66 C-50 -84 -30 -50 -9 0Z M13 0 C17 -60 52 -96 72 -66 C50 -84 30 -50 9 0Z M-8 0 C-10 -70 -6 -110 0 -124 C6 -110 10 -70 8 0Z" fill="#8CCFFF" {...line(4.5)} />
              <path d="M0 -112 C-3 -84 -3 -40 -2 -8" stroke="#E9F8FF" strokeWidth="4" strokeLinecap="round" fill="none" />
              <g fill="#C9E9FF" {...line(3.5)}>
                <circle cx="-86" cy="-44" r="7" />
                <circle cx="86" cy="-44" r="7" />
                <circle cx="-34" cy="-118" r="6" />
                <circle cx="34" cy="-118" r="6" />
              </g>
            </g>
            {lotus && (
              <g transform="translate(140 22) scale(1.2)">
                <LotusArt pad={false} />
              </g>
            )}
            {crown && (
              <g>
                <g transform="translate(96 58) rotate(-20 50 64) scale(0.74)">
                  <LotusArt pad={false} />
                </g>
                <g transform="translate(230 58) rotate(20 50 64) scale(0.74)">
                  <LotusArt pad={false} />
                </g>
                <g transform="translate(156 28) scale(0.88)">
                  <LotusArt pad={false} />
                </g>
              </g>
            )}
          </g>
        </g>
      </g>
      {swimming && (
        <g ref={part('ripple')} transform="translate(200 318)">
          <ellipse rx="164" ry="19" fill="none" stroke="#fff" strokeWidth="7" opacity="0.75" />
          <ellipse rx="190" ry="24" fill="none" stroke="#fff" strokeWidth="4" opacity="0.4" />
        </g>
      )}
    </svg>
  )
})
