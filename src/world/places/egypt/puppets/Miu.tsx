// Miu the kitten: a layered SVG puppet, drawn by hand in the Nile's look (one bold ink line, round shapes, a base, a
// stripe and a cream tone, plain dark eyes with two highlights: the hippo's look). She breathes, blinks, watches her finger, flicks her ears and tail (springs, so
// they lag and settle), talks in her own voice, and can pounce, purr, stretch, cheer, wave, shake, sniff, dance and
// wiggle. `torch` puts a little flickering torch in her paw for the pyramid tunnels.
import { forwardRef, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK, inkStyle, useInk } from '../../../kit/ink'

export interface MiuProps {
  height?: string
  style?: CSSProperties
  flip?: boolean
  onTap?: () => void
  /** Holds a torch (the flame flickers). */
  torch?: boolean
  /** Trotting along (bob, lean, swinging paws, a happy tail) while she's being moved. */
  walking?: boolean
}

const FUR = '#FFC58B'
const STRIPE = '#F0A262'
const CREAM = '#FFF4E3'
const INNER = '#FFB3C4'
const BLUSH = '#FF9DB0'
// The hippo's line: 6 units of ink around every part.
const { inkPass, line } = inkStyle(INK, 6, 0.75)
/** Her tail: one fat line that curls up beside her. */
const TAIL = 'M250 436 C318 446 362 416 358 366 C356 340 344 322 328 310'
const band = (w: number) => ({ fill: 'none', stroke: STRIPE, strokeWidth: w, strokeLinecap: 'round' as const })

export const MIU_ACTIONS = { pounce: 0.9, purr: 1.6, stretch: 1.2, cheer: 1, wave: 1.2, shake: 0.9, sniff: 1, dance: 1.8, wiggle: 0.6 }

type Part = 'root' | 'shadow' | 'head' | 'earL' | 'earR' | 'tail' | 'armL' | 'armR' | 'torch' | 'flame' | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'pupilL' | 'pupilR' | 'happyL' | 'happyR' | 'mouth' | 'tongue' | 'smile' | 'whiskers' | 'blushL' | 'blushR'

/** Miu the kitten. Actions: pounce, purr, stretch, cheer, wave, shake, sniff, dance, wiggle. Voice: miu. */
export const Miu = forwardRef<PuppetHandle, MiuProps>(function Miu({ height, style, flip, onTap, torch, walking }, ref) {
  const st = useRef({ headRot: 0, lift: 0, earL: spring(160, 8), earR: spring(160, 8), tail: spring(90, 6), flick: 0, nextFlick: 2 }).current
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'miu',
    actions: MIU_ACTIONS,
    eyes: [200, 180],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))

      const breath = Math.sin(t * 2.4)
      let sx = 1 - breath * 0.008
      let sy = 1 + breath * 0.014
      let lift = 0
      let rot = 0
      let headRot = Math.sin(t * 1.2) * 2 + look.x * 5
      let headY = 0
      let armL = 5
      let armR = torch ? -62 : -5
      let happy = false
      let closed = 0
      let mouth = f.mouth
      let tailWag = Math.sin(t * 1.6) * 10
      let blush = 1

      if (walking && !act) {
        const step = t * 13
        lift = Math.abs(Math.sin(step)) * 14
        rot = 5 + Math.sin(step) * 3
        sy *= 1 - Math.abs(Math.cos(step)) * 0.04
        armL += Math.sin(step) * 16
        armR += Math.sin(step + Math.PI) * 10
        tailWag = 18 + Math.sin(step) * 16
        headRot += Math.sin(step) * 3
      }
      if (act === 'pounce' || act === 'cheer') {
        const crouch = bell(span(q, 0, 0.25))
        const air = bell(span(q, 0.25, 0.72))
        const land = wobble(span(q, 0.72, 1), 2)
        sx *= 1 + crouch * 0.14 - air * 0.08 + land * 0.1
        sy *= 1 - crouch * 0.16 + air * 0.12 - land * 0.12
        lift = air * (act === 'pounce' ? 110 : 70)
        headY += crouch * 10
        if (act === 'pounce') {
          rot = air * 8 - crouch * 4
          armL = lerp(5, 70, air)
          armR = lerp(armR, -70, air)
        } else {
          armL = lerp(5, 150, env) + Math.sin(q * Math.PI * 8) * 10 * env
          armR = lerp(armR, -150, env) - Math.sin(q * Math.PI * 8) * 10 * env
        }
        happy = air > 0.2 || act === 'cheer'
        mouth = Math.max(mouth, 0.55 * env)
        tailWag += air * 30
      } else if (act === 'purr') {
        happy = true
        headRot += Math.sin(q * Math.PI * 4) * 9 * env
        rot = Math.sin(q * Math.PI * 4) * 3 * env
        sx *= 1 + Math.sin(t * 60) * 0.004 * env
        blush = 1 + 0.35 * env
        tailWag = Math.sin(q * Math.PI * 6) * 24 * env
      } else if (act === 'stretch') {
        const e = bell(span(q, 0.05, 0.9))
        sy *= 1 + 0.1 * e
        sx *= 1 - 0.04 * e
        armL = lerp(armL, 165, e)
        armR = lerp(armR, -165, e)
        closed = e > 0.3 ? 1 : 0
        mouth = Math.max(mouth, e * 0.9)
        headRot -= 4 * e
      } else if (act === 'wave') {
        // Wave out to the side, above the shoulder, so the paw doesn't cover her face.
        armR = lerp(armR, -118, env) + Math.sin(q * Math.PI * 7) * 18 * env
        headRot += 6 * env
        happy = true
        mouth = Math.max(mouth, 0.3 * env)
      } else if (act === 'shake') {
        headRot += Math.sin(q * Math.PI * 6) * 14 * (1 - q)
        closed = 0.5 * env
      } else if (act === 'sniff') {
        headY += 10 * env
        headRot += Math.sin(q * Math.PI * 10) * 3 * env
        closed = 0.4 * env
        sy *= 1 - 0.03 * env
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        rot = Math.sin(beat / 2) * 9 * bell(q)
        lift = Math.abs(Math.sin(beat)) * 22 * env
        armL = lerp(armL, 120 + Math.sin(beat) * 30, env)
        armR = lerp(armR, -120 + Math.sin(beat + Math.PI) * 30, env)
        headRot += Math.sin(beat / 2 + 0.6) * 7 * env
        happy = true
        mouth = Math.max(mouth, 0.4 * env)
        tailWag = Math.sin(beat) * 30
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.08 * w
        sy *= 1 - 0.08 * w
        rot += w * 6
        happy = true
      }
      // Talking: little head bobs.
      headRot += Math.sin(t * 11) * f.mouth * 3
      headY -= f.mouth * 3

      // Every few seconds one ear flicks.
      if (t > st.nextFlick) {
        st.flick = t
        st.nextFlick = t + 3 + Math.random() * 4
      }
      const flick = t - st.flick < 0.25 ? Math.sin(((t - st.flick) / 0.25) * Math.PI) * 18 : 0

      const vel = (headRot - st.headRot) / Math.max(dt, 0.001)
      st.headRot = headRot
      const liftVel = (lift - st.lift) / Math.max(dt, 0.001)
      st.lift = lift
      const earL = st.earL.step(clamp(-vel * 0.04 + liftVel * 0.03, -20, 20) - flick, dt)
      const earR = st.earR.step(clamp(-vel * 0.04 - liftVel * 0.03, -20, 20), dt)
      const tail = st.tail.step(tailWag + clamp(-liftVel * 0.08, -30, 30), dt)

      setT(p.root, `translate(0 ${-lift}) rotate(${rot} 200 470) translate(200 470) scale(${sx} ${sy}) translate(-200 -470)`)
      setT(p.shadow, `translate(200 472) scale(${1 - Math.min(0.5, lift / 250)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 200 260)`)
      setT(p.earL, `rotate(${earL} 132 100)`)
      setT(p.earR, `rotate(${earR} 268 100)`)
      setT(p.tail, `rotate(${tail} 272 440)`)
      setT(p.armL, `translate(170 338) rotate(${armL})`)
      setT(p.armR, `translate(230 338) rotate(${armR})`)
      // The torch stays upright whatever her arm does.
      if (torch) setT(p.torch, `translate(0 104) rotate(${-armR}) scale(1.3)`)
      if (torch) setT(p.flame, `translate(0 -64) scale(${1 + Math.sin(t * 17) * 0.08} ${1 + Math.sin(t * 13 + 1) * 0.12})`)
      setT(p.blushL, `translate(118 226) scale(${blush})`)
      setT(p.blushR, `translate(282 226) scale(${blush})`)

      const shut = Math.max(closed, 1 - f.blink)
      for (const [eye, open, arc, pupil, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, 150],
        [p.eyeR, p.openR, p.happyR, p.pupilR, 250],
      ] as const) {
        setT(eye, `translate(${x} 180) scale(1 ${happy ? 1 : Math.max(0.08, 1 - shut)})`)
        show(open, !happy)
        show(arc, happy)
        setT(pupil, `translate(${look.x * 4} ${look.y * 4})`)
      }

      const m = Math.min(1, mouth)
      if (m > 0.06) {
        const w = 13 + m * 5
        setA(p.mouth, 'd', `M${200 - w} 227 Q200 ${223 - m * 2} ${200 + w} 227 Q${200 + w * 0.8} ${227 + 26 * m} 200 ${229 + 26 * m} Q${200 - w * 0.8} ${227 + 26 * m} ${200 - w} 227Z`)
        setA(p.tongue, 'd', m > 0.25 ? `M191 ${227 + 22 * m} Q200 ${217 + 14 * m} 209 ${227 + 22 * m} Q205 ${229 + 24 * m} 200 ${229 + 24 * m} Q195 ${229 + 24 * m} 191 ${227 + 22 * m}Z` : '')
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongue, 'd', '')
      }
      show(p.smile, m <= 0.06)
      setT(p.whiskers, `translate(0 ${m * 3}) rotate(${Math.sin(t * 3) * 1.5} 200 212)`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const lower = (pass: boolean) => (
    <>
      <g ref={r('tail', pass)} fill="none" strokeLinecap="round">
        <path stroke={pass ? INK : FUR} strokeWidth={pass ? 48 : 36} d={TAIL} />
        {!pass && <path stroke={STRIPE} strokeWidth="36" strokeLinecap="butt" pathLength="100" strokeDasharray="0 50 8 10 8 100" d={TAIL} />}
      </g>
      <path fill={FUR} d="M200 256 C254 256 296 306 296 384 C296 438 256 464 200 464 C144 464 104 438 104 384 C104 306 146 256 200 256Z" />
      {/* her back paws peek out on each side */}
      <ellipse fill={FUR} cx="128" cy="450" rx="42" ry="20" />
      <ellipse fill={FUR} cx="272" cy="450" rx="42" ry="20" />
      {!pass && (
        <>
          <path fill={CREAM} d="M200 304 C236 304 252 342 252 390 C252 434 232 456 200 456 C168 456 148 434 148 390 C148 342 164 304 200 304Z" />
          <path {...line()} d="M92 440 C102 426 148 426 160 440 M240 440 C252 426 298 426 308 440" />
          <path {...line(3.5)} d="M116 456 v10 M134 458 v10 M266 458 v10 M284 456 v10" />
        </>
      )}
    </>
  )

  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      {s === 'R' && torch && !pass && (
        <g ref={part('torch')} transform="translate(0 104)">
          <rect x="-8" y="-60" width="16" height="72" rx="7" fill="#C99266" stroke={INK} strokeWidth="5" />
          <g ref={part('flame')}>
            <path d="M0 0 C-24 -10 -20 -40 0 -62 C20 -40 24 -10 0 0Z" fill="#FFB347" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
            <path d="M0 -6 C-10 -12 -8 -26 0 -36 C8 -26 10 -12 0 -6Z" fill="#FFF2A8" />
          </g>
        </g>
      )}
      {pass ? <path fill="none" d="M-20 2 L-19 92 C-21 124 21 124 19 92 L20 2" /> : <path fill={FUR} d="M-20 -4 C-20 -12 20 -12 20 -4 L19 92 C21 124 -21 124 -19 92 Z" />}
      {!pass && (
        <>
          <path fill={CREAM} d="M-18 88 C-18 82 18 82 18 88 L18 94 C19 118 -19 118 -18 94Z" />
          <path {...line(3.5)} d="M-7 104 v11 M7 104 v11" />
        </>
      )}
    </g>
  )

  const earShape = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <g transform={s === 'L' ? undefined : 'translate(400 0) scale(-1 1)'}>
        <path fill={FUR} d="M84 150 C70 100 76 44 96 22 C104 13 116 14 126 22 C154 44 180 72 194 100 Z" />
        {!pass && <path fill={INNER} d="M106 124 C98 94 100 62 110 46 C130 60 150 80 162 100 Z" />}
      </g>
    </g>
  )

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {earShape('L', pass)}
      {earShape('R', pass)}
      <path fill={FUR} d="M200 60 C276 60 338 108 338 184 C338 250 280 290 200 290 C120 290 62 250 62 184 C62 108 124 60 200 60Z" />
      {!pass && (
        <>
          <path {...band(10)} d="M200 74 V102 M172 80 L177 104 M228 80 L223 104" />
          <ellipse fill={CREAM} cx="200" cy="240" rx="68" ry="40" />
          <ellipse ref={part('blushL')} fill={BLUSH} opacity="0.8" rx="20" ry="12" transform="translate(118 226)" />
          <ellipse ref={part('blushR')} fill={BLUSH} opacity="0.8" rx="20" ry="12" transform="translate(282 226)" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')} transform={`translate(${s === 'L' ? 150 : 250} 180)`}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill="#2E1C1A" rx="23" ry="28" />
                <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-6" cy="-9" r="8" />
                  <circle fill="#fff" cx="7" cy="9" r="3.5" />
                </g>
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(6)} d="M-23 6 Q0 -20 23 6" style={{ display: 'none' }} />
            </g>
          ))}
          <g ref={part('whiskers')}>
            <path {...line(3.5)} d="M90 224 L42 214 M90 238 L44 246 M310 224 L358 214 M310 238 L356 246" />
          </g>
          <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="4" strokeLinejoin="round" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...line()} d="M182 226 Q191 238 200 226 Q209 238 218 226" />
          <path fill="#FF7F98" stroke={INK} strokeWidth="4" strokeLinejoin="round" d="M187 209 C187 201 213 201 213 209 C213 216 204 222 200 222 C196 222 187 216 187 209Z" />
        </>
      )}
    </g>
  )

  // The collar and its scarab charm sit over the neck.
  const collar = (
    <g>
      <path d="M150 284 Q200 306 250 284" fill="none" stroke={INK} strokeWidth="24" strokeLinecap="round" />
      <path d="M150 284 Q200 306 250 284" fill="none" stroke="#FFC83D" strokeWidth="13" strokeLinecap="round" />
      <ellipse cx="200" cy="310" rx="14" ry="16" fill="#8FE3C8" stroke={INK} strokeWidth="5" />
      <path d="M200 297 V323" stroke={INK} strokeWidth="3.5" />
    </g>
  )

  const body = (
    <>
      <ellipse ref={part('shadow')} rx="104" ry="12" fill="#6B3A2A" opacity="0.18" />
      <g ref={part('root')} strokeLinejoin="round">
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {collar}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
      </g>
    </>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label="Miu the kitten" style={{ height, aspectRatio: '400 / 480', overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      {body}
    </svg>
  )
})
