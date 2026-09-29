// Hong, a shy red panda from Sichuan (reference: art/source/world/china/hong.png): a layered SVG puppet.
// Same rig as Bao Bao: ears and a ringed tail on springs (they lag and flop), breathing, blinks, eyes that follow her
// finger, a mouth that opens with his voice, paws that wave and cheer. His special move is `standUp`: real red pandas
// rise on their back legs to look big when surprised, so he crouches, stretches tall with paws up, holds it, and sits.
//
//   <Hong ref={hong} height="40vh" />     await hong.current?.play('standUp')
import { forwardRef, useId, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { EYE, INK, inkPass, line, useInk } from './ink'

export const HONG_ACTIONS: Record<string, number> = { standUp: 2.6, cheer: 1.2, hop: 0.8, nod: 0.7, shake: 0.9, wiggle: 0.8, munch: 1.4, wave: 1.4 }

type Part =
  | 'root' | 'shadow' | 'head' | 'earL' | 'earR' | 'tail' | 'face' | 'legL' | 'legR' | 'armL' | 'armR' | 'padsL' | 'padsR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'irisL' | 'irisR' | 'nose' | 'mouth' | 'tongue' | 'clip' | 'mouthG' | 'smile'
  | 'blushL' | 'blushR' | 'belly'

const RED = '#E4703C'
const DARK = '#5B2F24'
const CREAM = '#FFF1DC'
const PAD = '#F4A0A8'
const BLUSH = '#F7A9A0'
const MOUTH_IN = '#9B2D3A'
const TONGUE_PINK = '#F7808F'

const ARM = 'M-20 8 C-20 -16 20 -16 20 8 L20 64 C20 98 -20 98 -20 64 Z'
const LEG = 'M0 -50 C28 -50 48 -28 48 2 C48 34 26 54 0 54 C-26 54 -48 34 -48 2 C-48 -28 -28 -50 0 -50Z'
const EAR = 'M-46 14 C-58 -34 -34 -76 4 -90 C40 -70 58 -30 46 14 C22 26 -22 26 -46 14Z'
const EAR_IN = 'M-32 8 C-38 -28 -22 -58 2 -68 C26 -52 38 -26 32 8 C14 16 -14 16 -32 8Z'
const TAIL = 'M0 0 C46 -10 96 -30 112 -92 C122 -140 92 -178 60 -172 C36 -166 40 -128 30 -92 C18 -50 -8 -28 -22 12Z'
const HEAD = 'M200 70 C290 70 342 118 350 186 C338 196 342 232 318 262 C290 298 250 304 200 304 C150 304 110 298 82 262 C58 232 62 196 50 186 C58 118 110 70 200 70Z'

/** Hong the red panda. Actions: standUp, cheer, hop, nod, shake, wiggle, munch, wave. Voice: hong. */
export const Hong = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void }>(function Hong({ height, style, flip, onTap }, ref) {
  const [m] = useState(() => ({ earL: spring(150, 9), earR: spring(150, 9), tail: spring(70, 4.5), prevY: 0 }))
  const ink = useInk<Part>()
  const clipId = useId().replace(/:/g, '')
  const tailClip = useId().replace(/:/g, '')
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'hong',
    actions: HONG_ACTIONS,
    eyes: [200, 200],
    reach: [200, 245],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.2)
      let sx = 1 - breathe * 0.007
      let sy = 1 + breathe * 0.012
      let lift = 0
      let lean = 0
      let head = Math.sin(t * 0.8) * 2 + f.look.x * 3
      let headY = breathe * 1.2
      let armL = -50 + Math.sin(t * 2.2) * 2
      let armR = -50 + Math.sin(t * 2.2 + 0.6) * 2
      let shL = 0
      let shR = 0
      let legL = 0
      let legR = 0
      let happy = false
      let open = 0.4
      let eyeS = 1
      let earPerk = 0
      let tailKick = 0
      let cheek = 0
      let bellyS = 1
      let up = 0

      head += Math.sin(t * 11) * f.mouth * 2.5
      headY -= f.mouth * 3

      if (a === 'standUp') {
        const crouch = bell(span(q, 0, 0.12))
        up = smooth(span(q, 0.1, 0.28)) * (1 - smooth(span(q, 0.82, 0.96)))
        const settle = wobble(span(q, 0.82, 1), 2)
        sy += -crouch * 0.12 + up * 0.36 + settle * 0.03
        sx += crouch * 0.1 - up * 0.1
        lift = up * 6
        headY += crouch * 8 - up * 18
        armL = lerp(armL, 138 + Math.sin(q * Math.PI * 10) * 8, up)
        armR = lerp(armR, 138 + Math.sin(q * Math.PI * 10 + 1) * 8, up)
        shL = shR = -22 * up
        legL = up * 10
        legR = up * 10
        open = lerp(0.4, 0.62, up)
        eyeS = 1 + up * 0.12
        earPerk = up * 12
        tailKick = up * 26 * Math.sin(q * 20)
        bellyS = 1 + up * 0.1
        happy = false
      } else if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.72))
        const land = wobble(span(k, 0.72, 1), 2)
        sx += crouch * 0.12 - air * 0.06 + land * 0.1
        sy += -crouch * 0.15 + air * 0.11 - land * 0.12
        lift = air * (cheer ? 44 : 60)
        headY += crouch * 10 - air * 4
        const u = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air * 0.8 + crouch * 0.25
        armL = lerp(armL, cheer ? 150 + Math.sin(q * Math.PI * 8) * 14 : 100, u)
        armR = lerp(armR, cheer ? 150 + Math.sin(q * Math.PI * 8 + 1) * 14 : 100, u)
        shL = shR = -16 * u
        legL = -crouch * 8 + air * 22
        legR = -legL
        open = cheer ? 0.7 : 0.55
        happy = cheer || air > 0.3
        tailKick = air * 20
      } else if (a === 'wave') {
        const u = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 146 + Math.sin(q * Math.PI * 7) * 20, u)
        shR = -24 * u
        head += u * 6
        open = 0.35 + u * 0.3
        happy = u > 0.6 && q > 0.2 && q < 0.8
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 15
        head += n * 3
        happy = q > 0.15 && q < 0.85
        open = 0.35
      } else if (a === 'shake') {
        head += Math.sin(q * Math.PI * 6) * 13 * bell(q)
        earPerk = -8 * bell(q)
        open = 0.08
      } else if (a === 'wiggle') {
        const w = Math.sin(q * Math.PI * 6) * bell(q)
        lean += w * 8
        sx += Math.abs(w) * 0.04
        headY += Math.abs(w) * 4
        legL = legR = w * 18
        head -= w * 4
        happy = true
        open = 0.6
        tailKick = w * 30
      } else if (a === 'munch') {
        const ext = smooth(span(q, 0, 0.12)) * (1 - smooth(span(q, 0.88, 1)))
        const c = Math.abs(Math.sin(q * Math.PI * 2 * 3.5)) * ext
        armL = lerp(armL, -138 - c * 6, ext)
        armR = lerp(armR, -138 - c * 6, ext)
        shL = shR = -3 * ext
        happy = ext > 0.4
        open = lerp(open, 0.08 + c * 0.42, ext)
        headY += c * 6 * ext
        cheek = ext * (0.4 + c * 0.6)
        earPerk += c * 6
        tailKick = Math.sin(q * 16) * 8 * ext
      }

      const dt = Math.max(f.dt, 1 / 120)
      const y = -lift + headY * 0.6
      const v = (y - m.prevY) / dt
      m.prevY = y
      const drive = Math.max(-16, Math.min(22, v * 0.03))
      const eL = Math.max(-14, Math.min(46, m.earL.step(2 + drive + earPerk + (head - lean) * 0.5, f.dt)))
      const eR = Math.max(-14, Math.min(46, m.earR.step(2 + drive + earPerk - (head + lean) * 0.5, f.dt)))
      const tl = m.tail.step(Math.sin(t * 1.3) * 5 + drive * 1.2 + tailKick + lean * 1.5, f.dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 472) scale(${1 - Math.min(0.5, lift / 160)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 290)`)
      setT(p.earL, `translate(112 118) rotate(${-20 + eL})`)
      setT(p.earR, `translate(288 118) scale(-1 1) rotate(${-20 + eR})`)
      setT(p.tail, `translate(286 430) rotate(${tl}) scale(${1.05})`)
      setT(p.face, `translate(${f.look.x * 5} ${f.look.y * 3.5})`)
      setT(p.armL, `translate(${104 + shL * 0.2} ${326 + shL}) rotate(${armL})`)
      setT(p.armR, `translate(${296 - shR * 0.2} ${326 + shR}) scale(-1 1) rotate(${armR})`)
      show(p.padsL, armL > 95)
      show(p.padsR, armR > 95)
      setT(p.legL, `translate(122 424) rotate(${-14 - legL})`)
      setT(p.legR, `translate(278 424) rotate(${14 + legR})`)
      setT(p.belly, `translate(200 400) scale(${bellyS}) translate(-200 -400)`)
      for (const [blush, x] of [[p.blushL, 118], [p.blushR, 282]] as const) setT(blush, `translate(${x} 244) scale(${1 + cheek * 0.35} ${1 + cheek * 0.25})`)

      for (const [eye, openG, arc, iris, x] of [
        [p.eyeL, p.openL, p.happyL, p.irisL, 148],
        [p.eyeR, p.openR, p.happyR, p.irisR, 252],
      ] as const) {
        setT(eye, `translate(${x} 196) scale(${eyeS} ${happy ? 1 : Math.max(0.06, f.blink * eyeS)})`)
        show(openG, !happy)
        show(arc, happy)
        setT(iris, `translate(${f.look.x * 4} ${f.look.y * 4})`)
      }

      const mo = Math.min(1, Math.max(open, f.mouth * 1.15))
      const w = 24 + mo * 7
      const bot = 240 + 40 * mo
      const drop = 3 + mo * 5
      setA(p.mouth, 'd', `M${200 - w} 238 Q${200 - w * 0.5} ${238 + drop} 200 ${242 + mo * 2} Q${200 + w * 0.5} ${238 + drop} ${200 + w} 238 C${200 + w * 0.9} ${bot - 4} 212 ${bot + 2} 200 ${bot + 2} C188 ${bot + 2} ${200 - w * 0.9} ${bot - 4} ${200 - w} 238Z`)
      setA(p.clip, 'd', `M${200 - w} 238 Q200 ${244 + mo * 2} ${200 + w} 238 C${200 + w * 0.9} ${bot - 4} 212 ${bot + 2} 200 ${bot + 2} C188 ${bot + 2} ${200 - w * 0.9} ${bot - 4} ${200 - w} 238Z`)
      setA(p.tongue, 'd', `M${200 - w * 0.75} ${bot - 6} Q200 ${bot - 24 * Math.min(1, mo * 1.3)} ${200 + w * 0.75} ${bot - 6} L${200 + w} ${bot + 6} L${200 - w} ${bot + 6}Z`)
      show(p.mouthG, mo > 0.12)
      show(p.smile, mo <= 0.12)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const tail = (pass: boolean) => (
    <g ref={r('tail', pass)}>
      <clipPath id={tailClip}>
        <path d={TAIL} />
      </clipPath>
      <path fill={RED} d={TAIL} />
      {!pass && (
        <g clipPath={`url(#${tailClip})`}>
          {[[0, 8], [-8, 34], [-16, 58], [-26, 80], [-40, 100], [-58, 118]].map(([a, d], i) => (
            <path key={i} fill={i % 2 ? CREAM : RED} d="M-60 -14 L140 -14 L140 4 L-60 4Z" transform={`translate(${20 + a * -0.2 + i * 6} ${-d * 1.15}) rotate(${-8 - i * 4})`} />
          ))}
          <ellipse fill={CREAM} cx="52" cy="-172" rx="34" ry="24" />
        </g>
      )}
    </g>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={DARK} d={ARM} />
      {!pass && (
        <g ref={part(s === 'L' ? 'padsL' : 'padsR')}>
          <ellipse fill={PAD} cx="0" cy="78" rx="11" ry="12" />
          {[-12, 0, 12].map((x) => (
            <circle key={x} fill={PAD} cx={x} cy={x === 0 ? 56 : 61} r={x === 0 ? 5 : 4.6} />
          ))}
        </g>
      )}
    </g>
  )
  const leg = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
      <path fill={DARK} d={LEG} />
      {!pass && (
        <g transform="translate(0 4)">
          <ellipse fill={PAD} cx="0" cy="14" rx="17" ry="19" />
          {[-19, 0, 19].map((x) => (
            <circle key={x} fill={PAD} cx={x} cy={x === 0 ? -20 : -10} r={x === 0 ? 6.5 : 6} />
          ))}
        </g>
      )}
    </g>
  )
  const torso = (pass: boolean) => (
    <>
      <ellipse fill={RED} cx="200" cy="376" rx="100" ry="96" />
      <g ref={r('belly', pass)}>
        <ellipse fill={CREAM} cx="200" cy="404" rx="62" ry="66" />
      </g>
    </>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <path fill={CREAM} d={EAR} />
      {!pass && (
        <>
          <path fill="#7A3324" d={EAR_IN} transform="translate(0 8) scale(0.8)" />
          
        </>
      )}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={RED} d={HEAD} />
      {!pass && (
        <>
          {/* Cream cheek fluff, muzzle and eyebrow dots. */}
          <path fill={CREAM} d="M52 188 C84 176 116 196 128 228 C118 262 96 280 82 262 C62 234 62 210 52 188Z" />
          <path fill={CREAM} d="M348 188 C316 176 284 196 272 228 C282 262 304 280 318 262 C338 234 338 210 348 188Z" />
          <path {...line(3)} d="M60 200 L74 204 M62 224 L76 224 M340 200 L326 204 M338 224 L324 224" />
          <g ref={part('face')}>
            <ellipse fill={CREAM} cx="200" cy="240" rx="72" ry="52" />
            <ellipse fill={CREAM} cx="150" cy="150" rx="16" ry="10" transform="rotate(-14 150 150)" />
            <ellipse fill={CREAM} cx="250" cy="150" rx="16" ry="10" transform="rotate(14 250 150)" />
            {/* Dark tear lines down from the eyes. */}
            <path fill="none" stroke="#B5502F" strokeWidth="9" strokeLinecap="round" d="M142 224 Q136 244 128 258 M258 224 Q264 244 272 258" />
            <ellipse ref={part('blushL')} fill={BLUSH} rx="19" ry="12" />
            <ellipse ref={part('blushR')} fill={BLUSH} rx="19" ry="12" />
            {(['L', 'R'] as const).map((s) => {
              const k = s === 'L' ? 1 : -1
              return (
                <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
                  <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                    <g ref={part(s === 'L' ? 'irisL' : 'irisR')}>
                      <ellipse fill="#2E150B" rx="16" ry="21" />
                      <circle fill="#fff" cx={-5 * k + 1} cy="-8" r="6" />
                      <circle fill="#fff" cx={5 * k} cy="8" r="2.6" />
                    </g>
                  </g>
                  <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, '#2E150B')} d="M-16 5 Q0 -14 16 5" />
                </g>
              )
            })}
            <ellipse fill={EYE} cx="200" cy="214" rx="15" ry="10" />
            <ellipse fill="#fff" opacity="0.55" cx="194" cy="211" rx="4" ry="2.2" />
            <g ref={part('nose')} />
            <g ref={part('mouthG')}>
              <clipPath id={clipId}>
                <path ref={part('clip')} d="" />
              </clipPath>
              <path ref={part('mouth')} fill={MOUTH_IN} stroke={EYE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" d="" />
              <g clipPath={`url(#${clipId})`}>
                <path ref={part('tongue')} fill={TONGUE_PINK} d="" />
              </g>
              <path {...line(4, EYE)} d="M200 222 L200 240" />
            </g>
            <g ref={part('smile')}>
              <path {...line(4, EYE)} d="M172 236 Q186 254 200 240 Q214 254 228 236 M200 222 L200 240" />
            </g>
          </g>
        </>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Hong' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="120" ry="12" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{tail(true)}</g>
        {tail(false)}
        <g {...inkPass()}>{torso(true)}</g>
        {torso(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{leg(s, true)}</g>
            {leg(s, false)}
          </g>
        ))}
        <g {...inkPass()}>{headG(true)}</g>
        {headG(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
      </g>
    </svg>
  )
})
