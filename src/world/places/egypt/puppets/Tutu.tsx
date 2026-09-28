// Tutu the mummy: a giggly little girl wrapped in pink bandages, who just woke up from a very, very long nap. A layered
// SVG puppet: a loose bandage end on her head flutters on a spring, she blinks and watches her finger, talks in her own
// voice, and can yawn, wave, giggle, cheer, dance and wiggle. `asleep` closes her eyes.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'

export interface TutuProps {
  height?: string
  style?: CSSProperties
  asleep?: boolean
}

const WRAP = '#FF9DC0'
const WRAP_LIGHT = '#FFC3D8'
const INK = '#3F2A26'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

export const TUTU_ACTIONS = { yawn: 1.8, wave: 1.2, giggle: 1, cheer: 1, dance: 1.8, wiggle: 0.6 }

type Part = 'root' | 'shadow' | 'head' | 'ribbon' | 'armL' | 'armR' | 'eyesOpen' | 'eyesClosed' | 'eyesHappy' | 'pupilL' | 'pupilR' | 'mouth' | 'smile' | 'blushL' | 'blushR'

/** Tutu the mummy. Actions: yawn, wave, giggle, cheer, dance, wiggle. Voice: tutu. */
export const Tutu = forwardRef<PuppetHandle, TutuProps>(function Tutu({ height, style, asleep = false }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ ribbon: spring(70, 5), headRot: 0, lift: 0 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'tutu',
    actions: TUTU_ACTIONS,
    eyes: [180, 152],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))

      const breath = Math.sin(t * (asleep ? 1.3 : 2.4))
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * (asleep ? 0.02 : 0.012)
      let lift = 0
      let rot = 0
      let headRot = asleep ? 8 : Math.sin(t * 1.3) * 3 + look.x * 5
      let armL = 58
      let armR = -58
      let eyes: 'open' | 'closed' | 'happy' = asleep ? 'closed' : 'open'
      let mouth = f.mouth
      let blush = 1

      if (act === 'yawn') {
        const e = bell(span(q, 0.05, 0.85))
        mouth = Math.max(mouth, e)
        if (e > 0.3) eyes = 'closed'
        armL = lerp(armL, 160, e)
        armR = lerp(armR, -160, e)
        sy *= 1 + 0.07 * e
        headRot -= 6 * e
      } else if (act === 'wave') {
        armR = lerp(armR, -150, env) + Math.sin(q * Math.PI * 7) * 22 * env
        eyes = 'happy'
        mouth = Math.max(mouth, 0.3 * env)
        headRot += 6 * env
      } else if (act === 'giggle') {
        eyes = 'happy'
        rot = Math.sin(q * Math.PI * 10) * 4 * env
        sy *= 1 + Math.abs(Math.sin(q * Math.PI * 10)) * 0.03 * env
        armL = lerp(armL, 20, env)
        armR = lerp(armR, -20, env)
        mouth = Math.max(mouth, 0.4 * env)
        blush = 1 + 0.4 * env
      } else if (act === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.12 - air * 0.06 + land * 0.1
        sy *= 1 - crouch * 0.14 + air * 0.1 - land * 0.12
        lift = air * 60
        armL = lerp(armL, 150, env)
        armR = lerp(armR, -150, env)
        eyes = 'happy'
        mouth = Math.max(mouth, 0.6 * env)
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        rot = Math.sin(beat / 2) * 10 * bell(q)
        lift = Math.abs(Math.sin(beat)) * 16 * env
        // Mummy arms: straight out in front, bobbing.
        armL = lerp(armL, 95 + Math.sin(beat) * 25, env)
        armR = lerp(armR, -95 + Math.sin(beat + Math.PI) * 25, env)
        headRot += Math.sin(beat / 2 + 0.6) * 8 * env
        eyes = 'happy'
        mouth = Math.max(mouth, 0.4 * env)
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.08 * w
        sy *= 1 - 0.08 * w
        rot += w * 6
        eyes = 'happy'
      }
      headRot += Math.sin(t * 10) * f.mouth * 3
      if (eyes === 'open' && f.blink < 0.4) eyes = 'closed'

      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const liftVel = (lift - st.lift) / Math.max(dt, 0.001)
      st.lift = lift
      const ribbon = st.ribbon.step(Math.sin(t * 2.2) * 8 + clamp(-vel * 0.15 + liftVel * 0.1, -40, 40), dt)

      setT(p.root, `translate(0 ${-lift}) rotate(${rot} 180 466) translate(180 466) scale(${sx} ${sy}) translate(-180 -466)`)
      setT(p.shadow, `translate(180 468) scale(${1 - Math.min(0.5, lift / 250)})`)
      setT(p.head, `rotate(${headRot} 180 230)`)
      setT(p.ribbon, `rotate(${ribbon} 240 72)`)
      setT(p.armL, `translate(128 262) rotate(${armL})`)
      setT(p.armR, `translate(232 262) rotate(${armR})`)
      setT(p.blushL, `translate(120 180) scale(${blush})`)
      setT(p.blushR, `translate(240 180) scale(${blush})`)
      show(p.eyesOpen, eyes === 'open')
      show(p.eyesClosed, eyes === 'closed')
      show(p.eyesHappy, eyes === 'happy')
      setT(p.pupilL, `translate(${look.x * 3} ${look.y * 3})`)
      setT(p.pupilR, `translate(${look.x * 3} ${look.y * 3})`)
      const m = Math.min(1, mouth)
      if (m > 0.06) {
        const w = 12 + m * 6
        setA(p.mouth, 'd', `M${180 - w} 190 Q180 ${188 - m * 2} ${180 + w} 190 Q${180 + w * 0.8} ${196 + 26 * m} 180 ${198 + 26 * m} Q${180 - w * 0.8} ${196 + 26 * m} ${180 - w} 190Z`)
      } else setA(p.mouth, 'd', '')
      show(p.smile, m <= 0.06)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))
  // Bandage wraps: thin ink lines across a shape, tilting alternately (clipped to it).
  const wraps = (clip: string, from: number, to: number, gap: number) => (
    <g clipPath={`url(#${id}-${clip})`} fill="none" stroke={INK} strokeWidth="2.8" strokeLinecap="round">
      {Array.from({ length: Math.ceil((to - from) / gap) }, (_, i) => {
        const y = from + i * gap
        const tilt = i % 2 ? 16 : -12
        return <path key={i} d={`M40 ${y} Q180 ${y + tilt} 320 ${y - tilt * 0.4}`} />
      })}
      {Array.from({ length: Math.ceil((to - from) / gap) }, (_, i) => (
        <path key={`s${i}`} d={`M40 ${from + i * gap + 7} Q180 ${from + i * gap + 7 + (i % 2 ? 16 : -12)} 320 ${from + i * gap + 7}`} stroke={WRAP_LIGHT} strokeWidth="4" opacity="0.7" />
      ))}
    </g>
  )

  const BODY = 'M128 236 C134 222 226 222 232 236 L246 368 C248 398 112 398 114 368 Z'
  const HEAD = 'M180 44 C246 44 282 92 282 144 C282 200 242 236 180 236 C118 236 78 200 78 144 C78 92 114 44 180 44 Z'
  // An arm with a round mitten hand and a little thumb.
  const ARM = 'M-21 -6 C-21 -14 21 -14 21 -6 L19 70 C32 74 36 92 26 102 C16 112 -16 112 -26 102 C-34 94 -32 78 -19 72 Z'

  const lower = (pass: boolean) => (
    <>
      <path fill={WRAP} d="M134 376 L136 444 C132 462 180 464 178 446 L178 376 Z" />
      <path fill={WRAP} d="M182 376 L182 446 C180 464 228 462 224 444 L226 376 Z" />
      <path fill={WRAP} d={BODY} />
      {!pass && (
        <>
          {wraps('body', 246, 400, 26)}
          <path {...line(2.6)} d="M138 400 L176 394 M138 424 L176 418 M184 394 L222 400 M184 418 L222 424" />
          {/* A loose bandage end at her hip */}
          <path fill={WRAP} stroke={INK} strokeWidth="3" strokeLinejoin="round" d="M118 330 C100 344 96 368 104 386 C112 372 118 360 126 352 Z" />
        </>
      )}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      {pass ? <path fill="none" d="M-21 0 L-19 72 C-32 78 -34 94 -26 102 C-16 112 16 112 26 102 C36 92 32 74 19 70 L21 0" /> : <path fill={WRAP} d={ARM} />}
      {!pass && <path {...line(2.6)} d="M-19 22 L19 14 M-19 46 L19 38 M-14 86 C-6 82 6 82 14 86" />}
    </g>
  )
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('ribbon', pass)}>
        <path fill={WRAP} d="M234 64 C262 36 300 46 324 26 C320 52 304 62 318 84 C290 82 262 90 244 86 Z" />
      </g>
      <path fill={WRAP} d={HEAD} />
      {!pass && (
        <>
          {wraps('head', 62, 236, 24)}
          {/* Her face peeks out between the wraps: a soft pink window with no lines on it */}
          <path fill={WRAP} d="M96 124 C140 112 220 112 264 124 C270 150 266 196 250 212 C220 226 140 226 110 212 C94 196 90 150 96 124 Z" />
          <path {...line(2.8)} d="M96 124 C140 112 220 112 264 124" />
          <ellipse ref={part('blushL')} fill="#FF6F9E" opacity="0.55" rx="17" ry="10" transform="translate(120 178)" />
          <ellipse ref={part('blushR')} fill="#FF6F9E" opacity="0.55" rx="17" ry="10" transform="translate(240 178)" />
          <g ref={part('eyesOpen')}>
            {[140, 220].map((x) => (
              <g key={x} transform={`translate(${x} 152)`}>
                <ellipse fill="#2E1C1A" rx="21" ry="24" />
                <g ref={part(x === 140 ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-6" cy="-9" r="7.5" />
                  <circle fill="#fff" cx="7" cy="7" r="3.2" />
                </g>
                <path {...line(3)} d={x === 140 ? 'M-17 -15 L-26 -22 M-20 -6 L-29 -9' : 'M17 -15 L26 -22 M20 -6 L29 -9'} />
              </g>
            ))}
          </g>
          <g ref={part('eyesClosed')} style={{ display: 'none' }}>
            <path {...line(4.5)} d="M120 150 Q140 164 160 150 M200 150 Q220 164 240 150" />
          </g>
          <g ref={part('eyesHappy')} style={{ display: 'none' }}>
            <path {...line(5)} d="M120 158 Q140 138 160 158 M200 158 Q220 138 240 158" />
          </g>
          <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="3" strokeLinejoin="round" d="" />
          <path ref={part('smile')} fill="#B8323F" stroke={INK} strokeWidth="3" strokeLinejoin="round" d="M164 190 Q180 188 196 190 Q192 208 180 208 Q168 208 164 190Z" />
        </>
      )}
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 360 480" aria-label="Tutu the mummy" style={{ height, aspectRatio: '360 / 480', overflow: 'visible', display: 'block', ...style }}>
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`${id}-head`}>
          <path d={HEAD} />
        </clipPath>
      </defs>
      <ellipse ref={part('shadow')} rx="80" ry="10" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')} strokeLinejoin="round">
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
      </g>
    </svg>
  )
})
