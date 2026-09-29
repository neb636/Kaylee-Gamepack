// Tiny Mouse, the clever little mouse of the Great Race: a layered SVG puppet (reference: art/source/world/china/mouse.png).
// Big round ears on springs (they lag when she hops and flatten back when she rides), a long springy tail on a chain of
// springs, blinking eyes that follow her finger, hops with a crouch before and a squash after, and a mouth that opens
// with her voice. `riding` = the clinging pose on Ox's back (low, arms forward, ears back, tail streaming).
import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK, inkPass, line, TONGUE, useInk } from './ink'

export const MOUSE_ACTIONS: Record<string, number> = { hop: 0.8, cheer: 1.2, wiggle: 0.8, nod: 0.7, shake: 1.0, giggle: 1.0, ride: 0.8, wave: 1.3 }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'legL' | 'legR' | 'tailInk' | 'tailFill'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'shineL' | 'shineR' | 'pupilL' | 'pupilR'
  | 'browL' | 'browR' | 'blushL' | 'blushR' | 'nose' | 'mouth' | 'tongueOpen' | 'smile'

const FUR = '#D9D3E3'
const FUR_SHADE = '#BDB4CF'
const CREAM = '#FFF1E6'
const EAR_PINK = '#FF9DBB'
const TAIL = '#FFB3C4'
const BROWN = '#4A2616'
const PINK = '#F9C4C0'

const HEAD_D = 'M200 96 C130 92 82 138 84 196 C86 254 138 292 200 292 C262 292 314 254 316 196 C318 138 270 92 200 96Z'
const TORSO = 'M150 300 C128 330 122 388 140 418 C152 434 248 434 260 418 C278 388 272 330 250 300 C230 292 170 292 150 300Z'
const ARM = 'M-13 -8 C-19 16 -17 40 -9 52 C-2 58 8 58 13 50 C19 38 18 14 13 -8Z'
const LEG = 'M-27 -4 C-30 14 -26 24 -14 26 L18 26 C30 24 32 12 26 -4Z'

const TAIL_LEN = [34, 34, 34, 32, 30, 26, 22, 18]
const TAIL_REST = [-10, -18, -22, -24, -22, -20, -16, -12]
const TAIL_W = 15

/** Tiny Mouse. Actions: hop, cheer, wiggle, nod, shake, giggle, ride, wave. Voice: mouse. `riding`: the clinging pose on Ox's back. */
export const Mouse = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; riding?: boolean; onTap?: () => void }>(function Mouse({ height, style, flip, riding, onTap }, ref) {
  const [m] = useState(() => ({
    earL: spring(150, 8), earR: spring(150, 8),
    t1: spring(110, 8), t2: spring(110, 7), t3: spring(110, 6), t4: spring(110, 5), t5: spring(110, 4.5),
    prevLift: 0, prevHead: 0, ride: 0, riding: false,
  }))
  m.riding = !!riding
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'mouse',
    actions: MOUSE_ACTIONS,
    eyes: [200, 200],
    reach: [200, 250],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      // Riding eases in and out, so hopping on and off never snaps.
      m.ride += ((m.riding ? 1 : 0) - m.ride) * Math.min(1, f.dt * 9)
      const rd = m.ride
      const breathe = Math.sin(t * 2.6)
      let sx = 1 - breathe * 0.008
      let sy = 1 + breathe * 0.015
      let lift = 0
      let lean = 0
      let head = Math.sin(t * 0.9) * 2.5 + f.look.x * 4
      let headY = 20 + breathe * 1.5
      let armL = 18 + Math.sin(t * 2.6) * 2
      let armR = 18 + Math.sin(t * 2.6 + 0.5) * 2
      let legL = 0
      let legR = 0
      let wag = Math.sin(t * 2.2) * 8
      let curl = 0
      let happy = false
      let open = 0
      let browTilt = 4
      let browY = 0
      let blush = 1
      let squint = 1
      let earPerk = 0
      let gaze = 0

      head += Math.sin(t * 11) * f.mouth * 3
      headY -= f.mouth * 3

      if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.74))
        const land = wobble(span(k, 0.74, 1), 2)
        sx += crouch * 0.12 - air * 0.07 + land * 0.1
        sy += -crouch * 0.16 + air * 0.12 - land * 0.12
        lift = air * (cheer ? 60 : 84)
        headY += crouch * 12 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air
        armL = lerp(armL, cheer ? 140 + Math.sin(q * Math.PI * 8) * 14 : 96, up)
        armR = lerp(armR, cheer ? 140 + Math.sin(q * Math.PI * 8 + 1) * 14 : 96, up)
        legL = legR = -crouch * 8 + air * 10
        wag = Math.sin(t * 18) * 22
        curl = air * 16
        browY = -5 * up
        if (cheer) ((happy = true), (open = 0.6))
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 140 + Math.sin(q * Math.PI * 7) * 18, up)
        head += up * 7
        open = up * 0.3
        happy = up > 0.5
        wag = Math.sin(t * 9) * 16
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 14
        head += n * 3
        sy -= n * 0.03
        happy = q > 0.15 && q < 0.85
      } else if (a === 'shake') {
        head += Math.sin(q * Math.PI * 5) * 12 * bell(q)
        browTilt += 12 * bell(q)
        browY -= 3 * bell(q)
        earPerk = -6 * bell(q)
        lean += Math.sin(q * Math.PI * 5 + 0.6) * 2 * bell(q)
        squint = 1 - 0.25 * bell(q)
        wag = -6 * bell(q)
      } else if (a === 'wiggle') {
        lean += Math.sin(q * Math.PI * 6) * 8 * bell(q)
        sx += Math.abs(Math.sin(q * Math.PI * 6)) * 0.04 * bell(q)
        headY += Math.abs(Math.sin(q * Math.PI * 6)) * 4 * bell(q)
        wag = Math.sin(q * Math.PI * 12) * 34
        armL += Math.sin(q * Math.PI * 6) * 20 * bell(q)
        armR -= Math.sin(q * Math.PI * 6) * 20 * bell(q)
        happy = true
        open = 0.35 * bell(q)
      } else if (a === 'giggle') {
        const on = smooth(span(q, 0, 0.14)) * (1 - smooth(span(q, 0.86, 1)))
        const shake = Math.sin(q * Math.PI * 16) * on
        armR = lerp(armR, -140, on)
        headY += Math.abs(shake) * -5 + 2 * on
        sy += shake * 0.02
        head += 5 * on + shake * 3
        lean += shake * 1.5
        happy = on > 0.3
        open = 0.3 * on
        blush = 1 + 0.2 * on
        wag = Math.sin(t * 14) * 12 * on
      } else if (a === 'ride') {
        // Ox lurches forward with a stroke: she leans back, squeezes tight, ears and tail fly.
        const jolt = bell(span(q, 0, 0.5))
        lean -= 9 * jolt
        sy -= 0.05 * jolt
        earPerk -= 10 * jolt
        wag = -22 * jolt
        curl = -16 * jolt
        open = 0.35 * jolt
        browTilt += 8 * jolt
      }

      // Riding: crouched low, arms forward holding on, ears blown back, bobbing with Ox's paddling.
      if (rd > 0.001) {
        const bob = Math.sin(t * 5) * rd
        sy = lerp(sy, 0.9 + bob * 0.015, rd)
        sx = lerp(sx, 1.05, rd)
        armL = lerp(armL, -22, rd)
        armR = lerp(armR, -22, rd)
        legL = lerp(legL, 26, rd)
        legR = lerp(legR, 26, rd)
        headY += 6 * rd + bob * 1.5
        earPerk -= 5 * rd
        wag += -14 * rd
        curl -= 8 * rd
        gaze += 0.5 * rd
      }

      const dt = Math.max(f.dt, 1 / 120)
      const v = (lift - m.prevLift) / dt
      m.prevLift = lift
      const hv = (head - m.prevHead) / dt
      m.prevHead = head
      const drive = Math.max(-16, Math.min(22, -v * 0.05))
      const eL = Math.max(-26, Math.min(34, m.earL.step(2 + drive * 0.8 + earPerk - hv * 0.06 - (head - lean) * 0.3, f.dt)))
      const eR = Math.max(-26, Math.min(34, m.earR.step(2 + drive * 0.8 + earPerk + hv * 0.06 + (head + lean) * 0.3, f.dt)))
      const drv = wag - v * 0.04 + lean * 0.6
      const s1 = m.t1.step(drv, f.dt)
      const s2 = m.t2.step(s1, f.dt)
      const s3 = m.t3.step(s2, f.dt)
      const s4 = m.t4.step(s3, f.dt)
      const s5 = m.t5.step(s4, f.dt)
      const c = curl + Math.sin(t * 1.7) * 4
      const rot = TAIL_REST.map((r0, i) => {
        const base = [s1 * 0.5, (s2 - s1) * 0.8 - c * 0.2, (s3 - s2) * 0.9 - c * 0.3, (s4 - s3) - c * 0.4, (s5 - s4) * 0.9 - c * 0.5][Math.min(i, 4)]
        return r0 + (i < 5 ? base : (s5 - s4) * 0.4 - c * 0.35)
      })
      let tx = 262
      let ty = 396
      let ang = 0
      const pts: [number, number][] = [[tx, ty]]
      for (let i = 0; i < rot.length; i++) {
        ang += rot[i]
        tx += Math.cos((ang * Math.PI) / 180) * TAIL_LEN[i]
        ty += Math.sin((ang * Math.PI) / 180) * TAIL_LEN[i]
        pts.push([tx, ty])
      }
      const mid = (i: number) => `${((pts[i][0] + pts[i + 1][0]) / 2).toFixed(1)} ${((pts[i][1] + pts[i + 1][1]) / 2).toFixed(1)}`
      let td = `M${pts[0][0]} ${pts[0][1]} L${mid(0)}`
      for (let i = 1; i < pts.length - 1; i++) td += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mid(i)}`
      td += ` L${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`
      setA(p.tailInk, 'd', td)
      setA(p.tailFill, 'd', td)

      setT(p.root, `translate(0 ${-lift}) translate(200 436) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -436)`)
      setT(p.shadow, `translate(200 438) scale(${1 - Math.min(0.5, lift / 240)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 290)`)
      setT(p.earL, `translate(120 130) rotate(${eL})`)
      setT(p.earR, `translate(280 130) scale(-1 1) rotate(${eR})`)
      setT(p.armL, `translate(156 322) rotate(${armL})`)
      setT(p.armR, `translate(244 322) scale(-1 1) rotate(${armR})`)
      setT(p.legL, `translate(166 410) rotate(${legL})`)
      setT(p.legR, `translate(234 410) rotate(${-legR})`)
      setT(p.browL, `translate(0 ${browY}) rotate(${-browTilt} 156 190)`)
      setT(p.browR, `translate(0 ${browY}) rotate(${browTilt} 244 190)`)
      setT(p.blushL, `translate(124 232) scale(${blush})`)
      setT(p.blushR, `translate(276 232) scale(${blush})`)

      const lx = f.look.x + gaze * 1.2
      for (const [eye, openG, arc, pupil, shine, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, p.shineL, 156],
        [p.eyeR, p.openR, p.happyR, p.pupilR, p.shineR, 244],
      ] as const) {
        setT(eye, `translate(${x} 208) scale(1 ${happy ? 1 : f.blink * squint})`)
        show(openG, !happy)
        show(arc, happy)
        setT(pupil, `translate(${Math.max(-1.3, Math.min(1.3, lx)) * 3.2} ${f.look.y * 3.2})`)
        setT(shine, `translate(${lx * 1.2} ${f.look.y * 1.2})`)
      }

      const mo = Math.min(1, Math.max(open, f.mouth * 1.15))
      if (mo > 0.05) {
        const w = 12 + mo * 6
        setA(p.mouth, 'd', `M${200 - w} 246 Q200 250 ${200 + w} 246 Q${200 + w * 0.85} ${247 + 24 * mo} 200 ${249 + 24 * mo} Q${200 - w * 0.85} ${247 + 24 * mo} ${200 - w} 246Z`)
        setA(p.tongueOpen, 'd', `M190 ${244 + 20 * mo} Q200 ${237 + 15 * mo} 210 ${244 + 20 * mo} Q208 ${248 + 24 * mo} 200 ${248 + 24 * mo} Q192 ${248 + 24 * mo} 190 ${244 + 20 * mo}Z`)
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongueOpen, 'd', '')
      }
      show(p.smile, mo <= 0.05)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const lower = (pass: boolean) => (
    <>
      {(['L', 'R'] as const).map((s) => (
        <g key={s} ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
          <path fill={FUR} d={LEG} />
        </g>
      ))}
      <path fill={FUR} d={TORSO} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.55" d="M132 384 C138 416 168 430 200 430 C168 422 146 406 132 384Z" />
          <ellipse fill={CREAM} cx="200" cy="366" rx="42" ry="50" />
        </>
      )}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d={ARM} />
      {!pass && <path {...line(3)} d="M-7 44 L-7 52 M3 46 L3 54" />}
    </g>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <ellipse fill={FUR} cx="-6" cy="-24" rx="62" ry="64" />
      {!pass && <ellipse fill={EAR_PINK} cx="-4" cy="-18" rx="42" ry="44" />}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={FUR} d={HEAD_D} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M100 240 C120 274 160 288 200 288 C240 288 280 274 300 240 C274 268 240 278 200 278 C160 278 126 268 100 240Z" />
          <ellipse fill={CREAM} cx="200" cy="248" rx="56" ry="38" />
          <ellipse ref={part('blushL')} fill={PINK} rx="21" ry="13" />
          <ellipse ref={part('blushR')} fill={PINK} rx="21" ry="13" />
          <path {...line(3, INK)} d="M92 226 L58 220 M92 238 L60 244 M308 226 L342 220 M308 238 L340 244" opacity="0.8" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s}>
              <path ref={part(s === 'L' ? 'browL' : 'browR')} {...line(4.5, BROWN)} d={s === 'L' ? 'M136 178 Q156 166 174 176' : 'M226 176 Q244 166 264 178'} />
              <g ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
                <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                  <ellipse fill="#fff" rx="24" ry="28" />
                  <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                    <ellipse fill={BROWN} rx="19" ry="24" cx={s === 'L' ? 1 : -1} cy="1" />
                    <g ref={part(s === 'L' ? 'shineL' : 'shineR')}>
                      <circle fill="#fff" cx="-4" cy="-9" r="7.5" />
                      <circle fill="#fff" cx="7" cy="8" r="3.4" />
                    </g>
                  </g>
                </g>
                <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, BROWN)} d="M-20 6 Q0 -18 20 6" />
              </g>
            </g>
          ))}
          <g ref={part('nose')}>
            <ellipse cx="200" cy="228" rx="14" ry="10" fill="#FF7DA0" stroke={INK} strokeWidth="3.4" />
            <ellipse cx="195" cy="225" rx="4" ry="2.6" fill="#fff" opacity="0.7" />
          </g>
          <path ref={part('mouth')} {...line(3.2, BROWN)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('smile')}>
            <path {...line(3.6, BROWN)} d="M182 246 Q191 256 200 246 Q209 256 218 246" />
            <path fill="#fff" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" d="M194 251 L206 251 L205 264 Q200 267 195 264Z" />
          </g>
        </>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 440" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Mouse' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="96" ry="12" fill="#6E3B24" opacity="0.16" />
      <g ref={part('root')}>
        <path ref={part('tailInk')} fill="none" stroke={INK} strokeWidth={TAIL_W + 10} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={part('tailFill')} fill="none" stroke={TAIL} strokeWidth={TAIL_W} strokeLinecap="round" strokeLinejoin="round" />
        <g ref={part('body')}>
          <g {...inkPass()}>{lower(true)}</g>
          {lower(false)}
        </g>
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
