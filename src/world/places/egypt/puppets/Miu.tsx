// Miu the kitten: a layered SVG puppet. She breathes, blinks, watches her finger, flicks her ears and tail (springs, so
// they lag and settle), talks in her own voice, and can pounce, purr, stretch, cheer, wave, shake, sniff, dance and
// wiggle. `torch` puts a little flickering torch in her paw for the pyramid tunnels.
import { forwardRef, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass as inkPassIn, line as lineIn, useInk } from '../../../kit/ink'

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

const FUR = '#F6C68E'
const STRIPE = '#E0A062'
const CREAM = '#FFF3E2'
const INNER = '#FFB3C4'
const INK = '#3F2A26'
const BLUSH = '#FF9DB0'
const inkPass = () => inkPassIn(undefined, INK)
const line = (width?: number) => lineIn(width, INK)

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
      let armL = 8
      let armR = torch ? -38 : -8
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
          armL = lerp(8, 70, air)
          armR = lerp(armR, -70, air)
        } else {
          armL = lerp(8, 150, env) + Math.sin(q * Math.PI * 8) * 10 * env
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
      setT(p.armL, `translate(178 318) rotate(${armL})`)
      setT(p.armR, `translate(222 318) rotate(${armR})`)
      // The torch stays upright whatever her arm does.
      if (torch) setT(p.torch, `translate(0 122) rotate(${-armR})`)
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
      <g ref={r('tail', pass)}>
        <path fill={FUR} d="M262 446 C312 450 350 420 352 370 C354 330 334 300 312 296 C300 294 294 308 304 316 C324 332 330 360 324 386 C316 414 290 428 258 424 Z" />
        {!pass && <path {...line(5)} stroke={STRIPE} d="M336 330 L318 340 M344 364 L322 368 M334 400 L314 394" />}
      </g>
      <path fill={FUR} d="M200 250 C246 250 272 292 280 344 C288 400 276 462 200 462 C124 462 112 400 120 344 C128 292 154 250 200 250Z" />
      {/* Round haunches on each side, with the back paws peeking out in front */}
      <ellipse fill={FUR} cx="132" cy="412" rx="50" ry="54" />
      <ellipse fill={FUR} cx="268" cy="412" rx="50" ry="54" />
      <ellipse fill={FUR} cx="120" cy="458" rx="34" ry="16" />
      <ellipse fill={FUR} cx="280" cy="458" rx="34" ry="16" />
      {!pass && (
        <>
          <path fill={CREAM} d="M200 286 C232 286 246 330 246 380 C246 430 230 456 200 456 C170 456 154 430 154 380 C154 330 168 286 200 286Z" />
          <path {...line()} d="M160 372 C150 400 150 430 162 452 M240 372 C250 400 250 430 238 452" />
          <path {...line(4.5)} stroke={STRIPE} d="M104 392 L120 396 M100 414 L118 416 M296 392 L280 396 M300 414 L282 416" />
          <path {...line(2.6)} d="M112 452 L112 466 M128 452 L128 466 M272 452 L272 466 M288 452 L288 466" />
        </>
      )}
    </>
  )

  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      {s === 'R' && torch && !pass && (
        <g ref={part('torch')} transform="translate(0 124)">
          <rect x="-7" y="-60" width="14" height="70" rx="6" fill="#B07A54" stroke={INK} strokeWidth="4" />
          <g ref={part('flame')}>
            <path d="M0 0 C-22 -10 -18 -38 0 -58 C18 -38 22 -10 0 0Z" fill="#FFB347" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            <path d="M0 -6 C-10 -12 -8 -26 0 -36 C8 -26 10 -12 0 -6Z" fill="#FFF2A8" />
          </g>
        </g>
      )}
      {pass ? <path fill="none" d="M-19 0 L-18 110 C-20 140 20 140 18 110 L19 0" /> : <path fill={FUR} d="M-19 -4 C-19 -12 19 -12 19 -4 L18 110 C20 140 -20 140 -18 110 Z" />}
      {!pass && (
        <>
          <path fill={CREAM} d="M-16 112 C-17 134 17 134 16 112 C16 104 -16 104 -16 112Z" />
          <path {...line(2.4)} d="M-6 122 L-6 133 M6 122 L6 133" />
          <path {...line(4)} stroke={STRIPE} d="M-18 30 L-8 34 M-18 58 L-8 62" />
        </>
      )}
    </g>
  )

  const earShape = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      {s === 'L' ? <path fill={FUR} d="M82 132 C72 80 84 22 102 4 C136 22 170 56 184 92 Z" /> : <path fill={FUR} d="M318 132 C328 80 316 22 298 4 C264 22 230 56 216 92 Z" />}
      {!pass && (s === 'L' ? <path fill={INNER} d="M100 114 C94 80 100 44 108 28 C130 44 150 66 160 92 Z" /> : <path fill={INNER} d="M300 114 C306 80 300 44 292 28 C270 44 250 66 240 92 Z" />)}
    </g>
  )

  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {earShape('L', pass)}
      {earShape('R', pass)}
      <path fill={FUR} d="M200 62 C282 62 334 112 334 178 C334 204 326 224 314 238 L334 248 L304 256 L312 270 C288 282 248 288 200 288 C152 288 112 282 88 270 L96 256 L66 248 L86 238 C74 224 66 204 66 178 C66 112 118 62 200 62Z" />
      {!pass && (
        <>
          <path {...line(7)} stroke={STRIPE} d="M200 76 L200 104 M174 80 L180 106 M226 80 L220 106" />
          <path fill={CREAM} d="M200 198 C236 198 258 214 258 236 C258 262 232 276 200 276 C168 276 142 262 142 236 C142 214 164 198 200 198Z" />
          <ellipse ref={part('blushL')} fill={BLUSH} opacity="0.8" rx="20" ry="12" transform="translate(128 218)" />
          <ellipse ref={part('blushR')} fill={BLUSH} opacity="0.8" rx="20" ry="12" transform="translate(272 218)" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')} transform={`translate(${s === 'L' ? 150 : 250} 180)`}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill="#2E1C1A" rx="26" ry="30" />
                <ellipse fill="#7A5236" cy="9" rx="18" ry="15" opacity="0.75" />
                <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                  <circle fill="#fff" cx="-8" cy="-11" r="9" />
                  <circle fill="#fff" cx="9" cy="9" r="4" />
                </g>
                <path {...line(3)} d={s === 'L' ? 'M-21 -18 L-31 -26 M-25 -9 L-35 -12' : 'M21 -18 L31 -26 M25 -9 L35 -12'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5)} d="M-22 6 Q0 -18 22 6" style={{ display: 'none' }} />
            </g>
          ))}
          <g ref={part('whiskers')}>
            <path {...line(2.4)} d="M104 222 L58 214 M104 234 L60 240 M296 222 L342 214 M296 234 L340 240" />
          </g>
          <path ref={part('mouth')} fill="#B8323F" stroke={INK} strokeWidth="3" strokeLinejoin="round" d="" />
          <path ref={part('tongue')} fill="#FF7F98" d="" />
          <path ref={part('smile')} {...line(3.2)} d="M184 226 Q192 236 200 226 Q208 236 216 226" />
          <path fill="#FF7F98" stroke={INK} strokeWidth="3" strokeLinejoin="round" d="M189 210 C189 203 211 203 211 210 C211 216 203 221 200 221 C197 221 189 216 189 210Z" />
        </>
      )}
    </g>
  )

  // The collar and its scarab charm sit over the neck.
  const collar = (
    <g>
      <path d="M156 284 Q200 304 244 284" fill="none" stroke={INK} strokeWidth="18" strokeLinecap="round" />
      <path d="M156 284 Q200 304 244 284" fill="none" stroke="#FFC83D" strokeWidth="11" strokeLinecap="round" />
      <ellipse cx="200" cy="306" rx="12" ry="14" fill="#8FE3C8" stroke={INK} strokeWidth="3.5" />
      <path d="M200 294 V318" stroke={INK} strokeWidth="2.5" />
    </g>
  )

  const body = (
    <>
      <ellipse ref={part('shadow')} rx="100" ry="12" fill="#6B3A2A" opacity="0.18" />
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
