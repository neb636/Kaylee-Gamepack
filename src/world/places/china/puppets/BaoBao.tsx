// Bao Bao, a baby giant panda girl from Sichuan (reference: art/source/world/china/baobao.png): a layered SVG puppet.
// She sits like the reference. Parts move every frame: ears and bow on springs (they lag and flop), breathing, blinks,
// eyes that follow her finger, a mouth that opens with her voice, a chewing jaw, and paws that wave, hug and climb.
//
//   <BaoBao ref={bao} height="40vh" />                    await bao.current?.play('munch')
//   <BaoBao ref={bao} bamboo />                           she hugs a piece of bamboo (it lifts to her mouth on 'munch')
//   <BaoBao ref={bao} hold={<g>...</g>} />               anything else she hugs (viewBox 400x480 units; drawn over her belly, under her paws)
//   <BaoBao ref={bao} rollBy={260} />                    'roll' tumbles her 260 viewBox units to the right (negative = left) and she
//                                                         stays there; set rollBy back to 0 (and move her wrapper) to reset. 0 = roll in place.
import { forwardRef, useId, useState, type CSSProperties, type ReactNode } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { EYE, INK, inkPass, line, useInk } from './ink'

export const BAOBAO_ACTIONS: Record<string, number> = { wave: 1.4, cheer: 1.2, hop: 0.8, nod: 0.7, shake: 0.9, wiggle: 0.8, munch: 1.6, sneeze: 1.7, roll: 1.5, climb: 1.6 }

type Part =
  | 'root' | 'shadow' | 'head' | 'earL' | 'earR' | 'bow' | 'face' | 'legL' | 'legR' | 'armL' | 'armR' | 'padsL' | 'padsR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'irisL' | 'irisR' | 'nose' | 'mouth' | 'tongue' | 'clip' | 'mouthG' | 'smile'
  | 'blushL' | 'blushR' | 'bamboo' | 'puff'

const BLUSH = '#F9B0B4'
const DARK = '#45261A'
const CREAM = '#FDF1DC'
const PAD = '#FFA3B8'
const BOW = '#FFA3B8'
const BOW_DARK = '#F27F9C'
const MOUTH_IN = '#9B2D3A'
const TONGUE_PINK = '#F7808F'
const GREEN = '#9CD98C'
const GREEN_DARK = '#6DBB73'

const ARM = 'M-22 8 C-22 -18 22 -18 22 8 L22 62 C22 98 -22 98 -22 62 Z'
const LEG = 'M0 -56 C30 -56 52 -30 52 2 C52 36 28 58 0 58 C-28 58 -52 36 -52 2 C-52 -30 -30 -56 0 -56Z'
const EAR = 'M0 -68 C26 -68 46 -50 46 -28 C46 -6 26 8 0 8 C-26 8 -46 -6 -46 -28 C-46 -50 -26 -68 0 -68Z'
const BOWS = 'M0 0 C-2 -30 22 -48 46 -40 C64 -30 62 -2 46 10 C30 20 10 12 0 0Z M0 0 C2 30 -22 48 -46 40 C-64 30 -62 2 -46 -10 C-30 -20 -10 -12 0 0Z'

/** Bao Bao the baby panda. Actions: wave, cheer, hop, nod, shake, wiggle, munch, sneeze, roll, climb. Voice: baobao. */
export const BaoBao = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void; bamboo?: boolean; hold?: ReactNode; rollBy?: number }>(function BaoBao({ height, style, flip, onTap, bamboo, hold, rollBy = 0 }, ref) {
  const [m] = useState(() => ({ earL: spring(150, 9), earR: spring(150, 9), bow: spring(120, 7), prevY: 0, rolled: false, lastAction: null as string | null, rollFrom: 0 }))
  const ink = useInk<Part>()
  const clipId = useId().replace(/:/g, '')
  const rollRef = useState(() => ({ by: 0 }))[0]
  rollRef.by = rollBy
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'baobao',
    actions: BAOBAO_ACTIONS,
    eyes: [200, 196],
    reach: [200, 240],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.2)
      let sx = 1 - breathe * 0.007
      let sy = 1 + breathe * 0.012
      let lift = 0
      let lean = 0
      let rot = 0
      let tx = 0
      let head = Math.sin(t * 0.8) * 2 + f.look.x * 3
      let headY = breathe * 1.2
      let armL = -50 + Math.sin(t * 2.2) * 2
      let armR = -50 + Math.sin(t * 2.2 + 0.6) * 2
      let shL = 0
      let shR = 0
      let legL = 0
      let legR = 0
      let happy = false
      let open = 0.42
      let eyeS = 1
      let noseS = 1
      let earPerk = 0
      let bowKick = 0
      let cheek = 0
      let bx = 0 // bamboo pose: 0 = hugged, 1 = at her mouth
      let bob = 0
      let puff = 0
      let lookUp = 0
      let bodyS = 1

      // Talking: little head bobs with her syllables.
      head += Math.sin(t * 11) * f.mouth * 2.5
      headY -= f.mouth * 3

      if (a !== m.lastAction) {
        if (a === 'roll') m.rollFrom = m.rolled ? rollRef.by : 0
        m.lastAction = a
      }

      if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.72))
        const land = wobble(span(k, 0.72, 1), 2)
        sx += crouch * 0.12 - air * 0.06 + land * 0.1
        sy += -crouch * 0.15 + air * 0.11 - land * 0.12
        lift = air * (cheer ? 44 : 60)
        headY += crouch * 10 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air * 0.8 + crouch * 0.25
        armL = lerp(armL, cheer ? 152 + Math.sin(q * Math.PI * 8) * 14 : 100, up)
        armR = lerp(armR, cheer ? 152 + Math.sin(q * Math.PI * 8 + 1) * 14 : 100, up)
        shL = shR = -16 * up
        legL = -crouch * 8 + air * 22
        legR = -legL
        open = cheer ? 0.7 : 0.55
        happy = cheer || air > 0.3
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 146 + Math.sin(q * Math.PI * 7) * 20, up)
        shR = -24 * up
        head += up * 6
        lean -= up * 3
        open = 0.35 + up * 0.35
        happy = up > 0.6 && q > 0.2 && q < 0.8
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 15
        head += n * 3
        sy -= n * 0.03
        happy = q > 0.15 && q < 0.85
        open = 0.35
      } else if (a === 'shake') {
        head += Math.sin(q * Math.PI * 6) * 13 * bell(q)
        earPerk = -8 * bell(q)
        open = 0.08
        eyeS = 1 - bell(q) * 0.25
      } else if (a === 'wiggle') {
        const w = Math.sin(q * Math.PI * 6) * bell(q)
        lean += w * 8
        sx += Math.abs(w) * 0.04
        headY += Math.abs(w) * 4
        legL = w * 18
        legR = w * 18
        armL += w * 8
        armR += w * 8
        head -= w * 4
        happy = true
        open = 0.6
      } else if (a === 'munch') {
        const ext = smooth(span(q, 0, 0.12)) * (1 - smooth(span(q, 0.88, 1)))
        const c = Math.abs(Math.sin(q * Math.PI * 2 * 3.5)) * ext
        bx = ext
        armL = lerp(armL, -138 - c * 6, ext)
        armR = lerp(armR, -138 - c * 6, ext)
        shL = shR = -3 * ext
        happy = ext > 0.4
        open = lerp(open, 0.08 + c * 0.42, ext)
        bob = c
        headY += c * 6 * ext
        cheek = ext * (0.4 + c * 0.6)
        sx += c * 0.012
        sy -= c * 0.014
        head += Math.sin(q * Math.PI * 7) * 2 * ext
        earPerk += c * 6
      } else if (a === 'sneeze') {
        const build = smooth(span(q, 0, 0.52))
        const snap = smooth(span(q, 0.52, 0.6))
        const rec = smooth(span(q, 0.66, 1))
        const ah = (1 - Math.cos(span(q, 0, 0.5) * Math.PI * 6)) / 2 // three "ah" pulses
        const back = build * (1 - snap)
        const fwd = snap * (1 - rec)
        headY += -back * 12 + fwd * 24
        head += back * -3 + Math.sin(q * 60) * 1.2 * back
        lean += fwd * 3 - back * 2
        sy += back * 0.03 - fwd * 0.12 + wobble(span(q, 0.62, 0.95), 2) * 0.05
        sx += -back * 0.02 + fwd * 0.1 - wobble(span(q, 0.62, 0.95), 2) * 0.04
        lift = wobble(span(q, 0.56, 0.75), 1.2) * 6 * snap
        eyeS = 1 - 0.85 * Math.max(build * (1 - snap) * 0.8 + fwd, 0)
        happy = false
        open = back * (0.25 + ah * 0.45) + fwd * 0.95 + (1 - back - fwd) * 0.3
        noseS = 1 + (ah * 0.18 + fwd * 0.3) * (1 - snap * 0.3)
        earPerk = back * 6 + fwd * 14
        bowKick = fwd * 30
        armL = lerp(armL, -28, back * 0.7)
        armR = lerp(armR, -28, back * 0.7)
        puff = smooth(span(q, 0.56, 0.7)) * (1 - smooth(span(q, 0.7, 0.86)))
        happy = q > 0.84 && q < 0.98
      } else if (a === 'roll') {
        const anti = bell(span(q, 0, 0.18))
        const spin = span(q, 0.16, 0.74)
        const air = bell(spin)
        const land = wobble(span(q, 0.74, 1), 2)
        const dir = rollRef.by < 0 ? -1 : 1
        const ease = smooth(spin)
        rot = dir * 360 * ease
        tx = lerp(m.rollFrom, rollRef.by, ease)
        lift = air * 34
        // Anticipation: lean back and squash; then tuck into a ball; squash on landing.
        lean -= dir * anti * 9
        sy += -anti * 0.1 + land * -0.14
        sx += anti * 0.08 + land * 0.13
        bodyS = 1 - air * 0.06
        const tuck = air
        armL = lerp(armL, -70, tuck)
        armR = lerp(armR, -70, tuck)
        legL = -tuck * 26
        legR = tuck * 26
        headY += tuck * 16
        head += 0
        eyeS = 1
        happy = spin > 0.05 && spin < 0.95
        open = 0.7
        earPerk = tuck * 8
      } else if (a === 'climb') {
        const ph = q * Math.PI * 2 * 2 // two pulls
        const pull = Math.sin(ph)
        const ext = smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1)))
        const uL = pull > 0 ? pull : 0
        const uR = pull < 0 ? -pull : 0
        armL = lerp(armL, 158 - uL * 22 + (uR > 0 ? 14 : 0), ext)
        armR = lerp(armR, 158 - uR * 22 + (uL > 0 ? 14 : 0), ext)
        shL = -20 * ext - uL * 20 * ext
        shR = -20 * ext - uR * 20 * ext
        legL = ext * (24 + uR * 24)
        legR = ext * (24 + uL * 24)
        lift = Math.abs(Math.sin(ph / 2)) * 8 * ext
        lean += pull * 3.5 * ext
        headY -= 6 * ext
        lookUp = ext
        open = 0.25 + Math.abs(pull) * 0.25
        sy += -Math.abs(pull) * 0.02
        earPerk = pull * 4
      }

      // Springs: ears and bow lag behind whatever the body just did, then flop back.
      const dt = Math.max(f.dt, 1 / 120)
      const y = -lift + headY * 0.6
      const v = (y - m.prevY) / dt
      m.prevY = y
      const drive = Math.max(-16, Math.min(22, v * 0.03))
      const eL = Math.max(-14, Math.min(46, m.earL.step(2 + drive + earPerk + (head - lean) * 0.5, f.dt)))
      const eR = Math.max(-14, Math.min(46, m.earR.step(2 + drive + earPerk - (head + lean) * 0.5, f.dt)))
      const bw = m.bow.step(drive * 1.3 + bowKick + (head + lean) * 0.9, f.dt)

      // She stays where she rolled (rollBy) until the parent resets it.
      if (a === 'roll' && q >= 1) m.rolled = true
      if (a !== 'roll') {
        if (rollRef.by === 0) m.rolled = false
        else if (m.rolled) tx = rollRef.by
      }

      setT(p.root, `translate(${tx} ${-lift}) translate(200 330) rotate(${rot}) scale(${bodyS}) translate(-200 -330) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(${200 + tx} 472) scale(${1 - Math.min(0.5, lift / 160)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 290)`)
      setT(p.earL, `translate(94 126) rotate(${eL})`)
      setT(p.earR, `translate(306 126) scale(-1 1) rotate(${eR})`)
      setT(p.bow, `translate(116 94) scale(0.85) rotate(${-12 + bw})`)
      setT(p.face, `translate(${f.look.x * 5} ${f.look.y * 3.5 - lookUp * 8})`)
      setT(p.armL, `translate(${100 + shL * 0.2} ${316 + shL}) rotate(${armL})`)
      setT(p.armR, `translate(${300 - shR * 0.2} ${316 + shR}) scale(-1 1) rotate(${armR})`)
      show(p.padsL, armL > 95)
      show(p.padsR, armR > 95)
      setT(p.legL, `translate(98 412) rotate(${-18 - legL})`)
      setT(p.legR, `translate(302 412) rotate(${18 + legR})`)
      setT(p.nose, `translate(200 214) scale(${noseS}) translate(-200 -214)`)
      for (const [blush, x] of [[p.blushL, 122], [p.blushR, 278]] as const) setT(blush, `translate(${x} 242) scale(${1 + cheek * 0.35} ${1 + cheek * 0.25})`)

      // Bamboo: hugged across her belly, lifted to her mouth while she munches.
      show(p.bamboo, !!bamboo)
      const bxx = lerp(200, 221, bx)
      const byy = lerp(378, 310, bx) + bob * 5
      setT(p.bamboo, `translate(${bxx} ${byy}) rotate(${lerp(-72, -24, bx) + bob * 4})`)

      show(p.puff, puff > 0.02)
      setT(p.puff, `translate(200 ${268 + puff * 22}) scale(${0.4 + puff * 1.2})`)
      if (p.puff) p.puff.style.opacity = String(Math.min(1, puff * 1.6))

      for (const [eye, openG, arc, iris, x, inward] of [
        [p.eyeL, p.openL, p.happyL, p.irisL, 146, 3],
        [p.eyeR, p.openR, p.happyR, p.irisR, 254, -3],
      ] as const) {
        setT(eye, `translate(${x} 196) scale(1 ${happy ? 1 : Math.max(0.06, f.blink * eyeS)})`)
        show(openG, !happy)
        show(arc, happy)
        setT(iris, `translate(${inward + f.look.x * 4} ${f.look.y * 4 - lookUp * 4})`)
      }

      const mo = Math.min(1, Math.max(open, f.mouth * 1.15))
      const w = 28 + mo * 7
      const bot = 236 + 44 * mo
      const drop = 3 + mo * 5
      setA(p.mouth, 'd', `M${200 - w} 234 Q${200 - w * 0.5} ${234 + drop} 200 ${238 + mo * 2} Q${200 + w * 0.5} ${234 + drop} ${200 + w} 234 C${200 + w * 0.9} ${bot - 4} ${200 + 12} ${bot + 2} 200 ${bot + 2} C${200 - 12} ${bot + 2} ${200 - w * 0.9} ${bot - 4} ${200 - w} 234Z`)
      setA(p.clip, 'd', `M${200 - w} 234 Q200 ${240 + mo * 2} ${200 + w} 234 C${200 + w * 0.9} ${bot - 4} ${212} ${bot + 2} 200 ${bot + 2} C188 ${bot + 2} ${200 - w * 0.9} ${bot - 4} ${200 - w} 234Z`)
      setA(p.tongue, 'd', `M${200 - w * 0.75} ${bot - 6} Q200 ${bot - 26 * Math.min(1, mo * 1.3)} ${200 + w * 0.75} ${bot - 6} L${200 + w} ${bot + 6} L${200 - w} ${bot + 6}Z`)
      show(p.mouthG, mo > 0.12)
      show(p.smile, mo <= 0.12)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={DARK} d={ARM} />
      {!pass && (
        <g ref={part(s === 'L' ? 'padsL' : 'padsR')}>
          <ellipse fill={PAD} cx="0" cy="78" rx="12" ry="13" />
          {[-13, 0, 13].map((x) => (
            <circle key={x} fill={PAD} cx={x} cy={x === 0 ? 55 : 60} r={x === 0 ? 5.5 : 5} />
          ))}
        </g>
      )}
    </g>
  )
  const leg = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
      <path fill={DARK} d={LEG} />
      {!pass && (
        <g transform={`translate(${s === 'L' ? 4 : -4} 0)`}>
          <ellipse fill={PAD} cx="0" cy="16" rx="19" ry="21" />
          {[-21, 0, 21].map((x) => (
            <circle key={x} fill={PAD} cx={x + (s === 'L' ? 0 : 0)} cy={x === 0 ? -22 : -11} r={x === 0 ? 7 : 6.5} />
          ))}
        </g>
      )}
    </g>
  )
  const torso = (pass: boolean) => (
    <>
      <ellipse fill={DARK} cx="200" cy="345" rx="106" ry="58" />
      <ellipse fill={CREAM} cx="200" cy="394" rx="92" ry="75" />
      {!pass && <path {...line(3.5)} d="M296 340 Q288 356 292 372" />}
    </>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <path fill={DARK} d={EAR} transform="translate(0 4) scale(1.16 1.08)" />
    </g>
  )
  const bow = (pass: boolean) => (
    <g ref={r('bow', pass)}>
      <path fill={BOW} d={BOWS} />
      <circle fill={pass ? BOW : BOW_DARK} r="11" />
      {!pass && <path {...line(3)} d="M24 -22 C34 -22 44 -20 50 -14 M-24 22 C-34 22 -44 20 -50 14" />}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={CREAM} d="M200 60 C282 60 336 112 336 184 C336 252 290 296 200 296 C110 296 64 252 64 184 C64 112 118 60 200 60Z" />
      {!pass && (
        <g ref={part('face')}>
          {/* Eye patches: dark teardrops that slope down and out. */}
          <path fill={DARK} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" d="M0 -44 C22 -46 40 -24 38 6 C36 34 14 50 -8 44 C-32 38 -38 14 -32 -10 C-28 -32 -14 -43 0 -44Z" transform="translate(134 196) rotate(28)" />
          <path fill={DARK} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" d="M0 -44 C22 -46 40 -24 38 6 C36 34 14 50 -8 44 C-32 38 -38 14 -32 -10 C-28 -32 -14 -43 0 -44Z" transform="translate(266 196) scale(-1 1) rotate(28)" />
          <ellipse ref={part('blushL')} fill={BLUSH} rx="21" ry="13" />
          <ellipse ref={part('blushR')} fill={BLUSH} rx="21" ry="13" />
          {(['L', 'R'] as const).map((s) => {
            const k = s === 'L' ? 1 : -1
            return (
              <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
                <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                  <ellipse fill="#fff" rx="20" ry="26" />
                  <g ref={part(s === 'L' ? 'irisL' : 'irisR')}>
                    <ellipse fill="#2E150B" rx="16" ry="22" />
                    <circle fill="#fff" cx={-5 * k + 1} cy="-9" r="6" />
                    <circle fill="#fff" cx={5 * k} cy="9" r="2.6" />
                  </g>
                  <path {...line(3.6, INK)} d={`M${-17 * k} -18 L${-27 * k} -24 M${-19 * k} -8 L${-30 * k} -10`} />
                </g>
                <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, '#2E150B')} stroke="#F7E7DA" d="M-17 5 Q0 -15 17 5" />
              </g>
            )
          })}
          <path {...line(3.5)} d="M116 138 Q128 128 142 136 M258 136 Q272 128 284 138" />
          <g ref={part('nose')}>
            <path fill={EYE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" d="M186 209 C188 202 212 202 214 209 C214 218 205 225 200 225 C195 225 186 218 186 209Z" />
            <ellipse fill="#fff" opacity="0.55" cx="195" cy="209" rx="4" ry="2.2" />
          </g>
          <g ref={part('mouthG')}>
            <clipPath id={clipId}>
              <path ref={part('clip')} d="" />
            </clipPath>
            <path ref={part('mouth')} fill={MOUTH_IN} stroke={EYE} strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" d="" />
            <g clipPath={`url(#${clipId})`}>
              <path ref={part('tongue')} fill={TONGUE_PINK} d="" />
            </g>
            <path {...line(4, EYE)} d="M200 224 L200 236" />
          </g>
          <g ref={part('smile')}>
            <path {...line(4, EYE)} d="M170 232 Q185 250 200 236 Q215 250 230 232 M200 224 L200 236" />
          </g>
        </g>
      )}
      {bow(pass)}
    </g>
  )
  const bambooG = (
    <g ref={part('bamboo')}>
      <g {...inkPass(4)}>
        <rect x="-13" y="-72" width="26" height="144" rx="6" />
        <path d="M13 -18 C34 -30 46 -26 50 -18 C40 -10 26 -10 13 -18Z" />
      </g>
      <rect fill={GREEN} x="-13" y="-72" width="26" height="144" rx="6" />
      <rect fill={GREEN_DARK} x="4" y="-72" width="9" height="144" rx="4" />
      <path {...line(3.5)} d="M-13 -30 L13 -30 M-13 30 L13 30" />
      <path {...line(3.5)} fill={GREEN} d="M13 -18 C34 -30 46 -26 50 -18 C40 -10 26 -10 13 -18Z" />
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Bao Bao' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="120" ry="12" fill="#6E3B24" opacity="0.16" />
      <g ref={part('root')}>
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
        {bambooG}
        {hold}
        <g ref={part('puff')} style={{ opacity: 0 }}>
          {[[-26, 0, 13], [0, 10, 16], [26, 0, 13]].map(([x, y, rr]) => (
            <circle key={x} {...line(3.5)} fill="#fff" cx={x} cy={y} r={rr} />
          ))}
        </g>
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
