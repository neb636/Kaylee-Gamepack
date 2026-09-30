// Zio Bruno: a big, round, jolly Marsican brown bear (Italy's own rare bear) who runs the pizzeria in Naples
// (reference: art/source/world/italy/bruno.png). A layered SVG puppet built like China's Chef Fu: the tall hat wobbles on
// a spring, the round ears flop, and the arms knead, toss and spin pizza dough. In the kitchen he stands behind the
// counter, so the head, hat, arms and paws carry every action.
import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetFrame, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, inkPass, INK, line, TONGUE, useInk } from './ink'

export const BRUNO_ACTIONS: Record<string, number> = { toss: 1.4, spin: 2.2, knead: 1.6, laugh: 1.6, wow: 1.4, wave: 1.5, cheer: 1.2, nod: 0.7, shake: 1.0 }

type Part =
  | 'root' | 'shadow' | 'head' | 'hat' | 'earL' | 'earR' | 'armL' | 'foreL' | 'armR' | 'foreR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'browL' | 'browR'
  | 'mouth' | 'tongue' | 'smile' | 'dough' | 'doughDisc'

const FUR = '#B7773F'
const FUR_SHADE = '#9C6232'
const MUZZLE = '#F6DDB8'
const EAR_IN = '#F4A99A'
const PAW = '#6A3A1E'
const CREAM = '#FFF4E4'
const HAT_SHADE = '#F0E0C4'
const APRON = '#FFF1DE'
const APRON_SHADE = '#F2DDC2'
const RED = '#E8574F'
const RED_SHADE = '#CF4540'
const MOUTH = '#C84F55'
const FLOUR = '#FFF8EC'
const DOUGH = '#F7E7DA'

// Arm angles [shoulder, elbow] in degrees. 0 = hanging straight down; positive swings the paw outward and up.
type Arm = [number, number]
const REST: Arm = [112, 18]
const KNEAD_UP: Arm = [-137, 137]
const KNEAD_DOWN: Arm = [-107, 109]
const UP: Arm = [168, 6]
const CHEEK: Arm = [174, 70]
const BELLY: Arm = [-22, -62]
const SPIN: Arm = [178, -8]
const mix = (a: Arm, b: Arm, p: number): Arm => [lerp(a[0], b[0], p), lerp(a[1], b[1], p)]

interface Pose {
  lift: number
  sx: number
  sy: number
  lean: number
  head: number
  headY: number
  armL: Arm
  armR: Arm
  happy: boolean
  open: number
  brow: number
  /** Dough ball height above his paws (toss), or null. */
  dough: number | null
  /** Spinning dough disc above his raised paw: spin angle, or null. */
  disc: number | null
  discSize: number
  hatKick: number
}

function bearMotion() {
  const hat = spring(120, 7)
  const hatY = spring(200, 9)
  const ear = spring(150, 8)
  let prevLift = 0
  let prevVy = 0
  return (f: PuppetFrame) => {
    const { t, p, action } = f
    const breathe = Math.sin(t * 2.1)
    const pose: Pose = {
      lift: 0,
      sx: 1 + breathe * 0.008,
      sy: 1 - breathe * 0.012,
      lean: 0,
      head: Math.sin(t * 0.9) * 1.5 + f.look.x * 2,
      headY: breathe * 1.2,
      armL: [REST[0] + Math.sin(t * 1.6) * 3, REST[1] + Math.sin(t * 1.6 + 1) * 4],
      armR: [REST[0] + Math.sin(t * 1.6 + 2) * 3, REST[1] + Math.sin(t * 1.6 + 3) * 4],
      happy: false,
      open: 0.4,
      brow: 0,
      dough: null,
      disc: null,
      discSize: 1,
      hatKick: 0,
    }
    pose.head += Math.sin(t * 10) * f.mouth * 2.5
    pose.headY -= f.mouth * 2.5
    const into = (a: Arm, b: Arm, q: number, inEnd = 0.18, outStart = 0.82) => {
      const k = q < inEnd ? smooth(q / inEnd) : q > outStart ? 1 - smooth((q - outStart) / (1 - outStart)) : 1
      return [mix(a, b, k), k] as const
    }

    if (action === 'knead') {
      const [base, k] = into(pose.armL, KNEAD_UP, p, 0.15, 0.85)
      const push = Math.max(bell(span(p, 0.2, 0.48)), bell(span(p, 0.5, 0.78)))
      pose.armL = mix(base, KNEAD_DOWN, push * k)
      pose.armR = mix(into(pose.armR, KNEAD_UP, p, 0.15, 0.85)[0], KNEAD_DOWN, push * k)
      pose.sy -= push * 0.05
      pose.sx += push * 0.03
      pose.headY += push * 7
      pose.happy = push > 0.4
      pose.open = 0.3 + push * 0.2
    } else if (action === 'toss') {
      // Crouch, fling the dough up with a little hop, watch it, catch it (arms dip), settle.
      const crouch = bell(span(p, 0, 0.22))
      const air = bell(span(p, 0.2, 0.52))
      const catchDip = bell(span(p, 0.72, 0.92))
      const [arms] = into(pose.armL, UP, p, 0.26, 0.86)
      const armsDown: Arm = [UP[0] - 40, UP[1] + 20]
      pose.armL = mix(mix(pose.armL, [60, 10], crouch), arms, 1 - crouch)
      pose.armL = mix(pose.armL, armsDown, catchDip)
      pose.armR = pose.armL
      pose.lift = air * 16
      pose.sy += -crouch * 0.07 + air * 0.05 - catchDip * 0.05
      pose.sx += crouch * 0.05 - air * 0.03 + catchDip * 0.03
      const fly = span(p, 0.24, 0.8)
      pose.dough = p > 0.22 && p < 0.84 ? Math.sin(fly * Math.PI) * 120 : null
      pose.head = -Math.sin(fly * Math.PI) * 4
      pose.headY -= Math.sin(fly * Math.PI) * 6
      pose.open = 0.35 + Math.sin(fly * Math.PI) * 0.4
      pose.happy = p > 0.8
      pose.hatKick = air
    } else if (action === 'spin') {
      // Show-off: one paw up, the dough disc spins on it and grows, a little hip sway, then a proud bounce.
      const [arm, k] = into(pose.armR, SPIN, p, 0.14, 0.86)
      pose.armR = arm
      pose.armL = into(pose.armL, BELLY, p, 0.2, 0.8)[0]
      pose.disc = k > 0.3 ? p * 1600 : null
      pose.discSize = 0.8 + span(p, 0.1, 0.7) * 0.6
      pose.lean = Math.sin(p * Math.PI * 4) * 4 * k
      pose.head = -8 * k + Math.sin(p * Math.PI * 4) * 2
      pose.headY -= 4 * k
      pose.happy = true
      pose.open = 0.5 * k
      const bounce = bell(span(p, 0.78, 0.98))
      pose.lift = bounce * 12
      pose.hatKick = bounce
    } else if (action === 'laugh') {
      const [arms] = into(pose.armL, BELLY, p, 0.15, 0.85)
      pose.armL = arms
      pose.armR = arms
      const env = bell(span(p, 0.05, 0.95))
      const ho = Math.abs(Math.sin(span(p, 0.1, 0.9) * Math.PI * 4))
      pose.sy += ho * 0.05 * env
      pose.sx -= ho * 0.025 * env
      pose.headY -= ho * 6 * env
      pose.head = -8 * env + Math.sin(p * Math.PI * 8) * 2 * env
      pose.happy = env > 0.15
      pose.open = 0.5 + ho * 0.5 * env
      pose.hatKick = ho * env * 0.6
    } else if (action === 'wow') {
      // Paws to his cheeks, brows up, a little jump: "Mamma mia, what a pizza!"
      const [arms, k] = into(pose.armL, CHEEK, p, 0.14, 0.82)
      pose.armL = arms
      pose.armR = arms
      pose.brow = k
      pose.open = 0.7 * k
      pose.lift = bell(span(p, 0.1, 0.4)) * 14
      pose.sy += bell(span(p, 0, 0.14)) * -0.05 + bell(span(p, 0.1, 0.4)) * 0.05
      pose.head = Math.sin(span(p, 0.3, 0.8) * Math.PI * 4) * 5 * k
      pose.hatKick = bell(span(p, 0.1, 0.5))
    } else if (action === 'wave') {
      const [arm, k] = into(pose.armR, [150, 20], p, 0.16, 0.84)
      pose.armR = [arm[0], arm[1] + Math.sin(span(p, 0.14, 0.86) * Math.PI * 6) * 26 * k]
      pose.head = -6 * k
      pose.happy = k > 0.5
      pose.open = 0.35 + 0.2 * k
    } else if (action === 'cheer') {
      const crouch = bell(span(p, 0, 0.22))
      const air = bell(span(p, 0.2, 0.62))
      const land = wobble(span(p, 0.6, 1), 2)
      const [arms] = into(pose.armL, UP, p, 0.25, 0.8)
      pose.armL = [arms[0] + Math.sin(p * Math.PI * 6) * 8, arms[1]]
      pose.armR = [arms[0] - Math.sin(p * Math.PI * 6) * 8, arms[1]]
      pose.lift = air * 28
      pose.sy += -crouch * 0.09 + air * 0.06 - land * 0.06
      pose.sx += crouch * 0.06 - air * 0.03 + land * 0.04
      pose.happy = p > 0.15
      pose.open = 0.35 + 0.55 * bell(span(p, 0.1, 0.9))
      pose.hatKick = air
    } else if (action === 'nod') {
      const n = Math.sin(p * Math.PI * 2)
      pose.headY += Math.max(0, n) * 9 + Math.max(0, -n) * 3
      pose.head += n * 1.5
      pose.happy = true
    } else if (action === 'shake') {
      const env = bell(p)
      pose.head = Math.sin(p * Math.PI * 4) * 8 * env
      pose.brow = -0.5 * env
      pose.open = 0.3 * (1 - env)
    }

    const dt = Math.max(1 / 240, f.dt)
    const vy = (pose.lift - prevLift) / dt
    const ay = (vy - prevVy) / dt
    prevLift = pose.lift
    prevVy = vy
    const hatAngle = hat.step(pose.head + pose.lean, f.dt)
    const hatLag = (hatAngle - (pose.head + pose.lean)) * 1.6 + pose.hatKick * Math.sin(t * 22) * 5
    const hatSquash = hatY.step(Math.max(-0.12, Math.min(0.12, -ay * 0.00006)), f.dt)
    const ears = ear.step(Math.max(-25, Math.min(25, vy * 0.06)) + pose.headY * 0.4, f.dt)
    return { ...pose, hatLag, hatSquash, ears }
  }
}

/** Zio Bruno. Actions: toss, spin, knead, laugh, wow, wave, cheer, nod, shake. Voice: bruno. */
export const Bruno = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void }>(function Bruno({ height, style, flip, onTap }, ref) {
  const [motion] = useState(() => bearMotion())
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'bruno',
    actions: BRUNO_ACTIONS,
    eyes: [200, 160],
    frame: (f, p) => {
      const r = motion(f)
      setT(p.root, `translate(0 ${-r.lift}) translate(200 470) rotate(${r.lean}) scale(${r.sx} ${r.sy}) translate(-200 -470)`)
      setT(p.shadow, `translate(200 473) scale(${1 - Math.min(0.4, r.lift / 120)})`)
      setT(p.head, `translate(0 ${r.headY}) rotate(${r.head} 200 262)`)
      setT(p.hat, `rotate(${-4 + r.hatLag} 200 108) translate(200 108) scale(${1 - r.hatSquash * 0.5} ${1 + r.hatSquash}) translate(-200 -108)`)
      setT(p.earL, `rotate(${-r.ears} 116 118)`)
      setT(p.earR, `rotate(${r.ears} 284 118)`)
      setT(p.armL, `translate(92 272) rotate(${r.armL[0]})`)
      setT(p.foreL, `translate(0 44) rotate(${r.armL[1]})`)
      setT(p.armR, `translate(308 272) scale(-1 1) rotate(${r.armR[0]})`)
      setT(p.foreR, `translate(0 44) rotate(${r.armR[1]})`)

      for (const [eye, open, arc, x] of [
        [p.eyeL, p.openL, p.happyL, 158],
        [p.eyeR, p.openR, p.happyR, 242],
      ] as const) {
        setT(eye, `translate(${x + (r.happy ? 0 : f.look.x * 3)} ${160 + (r.happy ? 0 : f.look.y * 2.5)}) scale(1 ${r.happy ? 1 : f.blink})`)
        show(open, !r.happy)
        show(arc, r.happy)
      }
      setT(p.browL, `translate(0 ${-Math.abs(r.brow) * 7}) rotate(${r.brow * 12} 158 132)`)
      setT(p.browR, `translate(0 ${-Math.abs(r.brow) * 7}) rotate(${-r.brow * 12} 242 132)`)

      const m = Math.min(1, Math.max(r.open, f.mouth * 1.15))
      if (m > 0.05) {
        const w = 17 + m * 8
        const d = 12 + 28 * m
        setA(p.mouth, 'd', `M${200 - w} 214 Q200 218 ${200 + w} 214 Q${200 + w * 0.85} ${214 + d} 200 ${215 + d} Q${200 - w * 0.85} ${214 + d} ${200 - w} 214Z`)
        setA(p.tongue, 'd', m > 0.25 ? `M${200 - w * 0.62} ${212 + d * 0.92} Q200 ${204 + d * 0.5} ${200 + w * 0.62} ${212 + d * 0.92} Q200 ${216 + d} ${200 - w * 0.62} ${212 + d * 0.92}Z` : '')
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongue, 'd', '')
      }
      show(p.smile, m <= 0.05)
      show(p.dough, r.dough !== null)
      if (r.dough !== null) setT(p.dough, `translate(0 ${-r.dough}) rotate(${r.dough * 1.5} 200 -6)`)
      show(p.doughDisc, r.disc !== null)
      if (r.disc !== null) setT(p.doughDisc, `translate(0 0) scale(${r.discSize} 1) rotate(${r.disc % 360})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  // Legs, round body and apron: one outline around the lot.
  const body = (pass: boolean) => (
    <>
      <path fill={FUR} d="M118 396 L172 396 L174 450 C174 472 114 472 114 450 Z" />
      <path fill={FUR} d="M228 396 L282 396 L286 450 C286 472 226 472 226 450 Z" />
      <path fill={FUR} d="M200 238 C286 238 330 300 326 370 C322 424 272 440 200 440 C128 440 78 424 74 370 C70 300 114 238 200 238Z" />
      <path fill={APRON} d="M150 262 C176 256 224 256 250 262 L256 318 C290 322 314 330 316 346 L304 424 C262 436 138 436 96 424 L84 346 C86 330 110 322 144 318 Z" />
      {!pass && (
        <>
          {/* Feet pads */}
          <ellipse fill={MUZZLE} cx="144" cy="458" rx="22" ry="8" />
          <ellipse fill={MUZZLE} cx="256" cy="458" rx="22" ry="8" />
          <path {...line(3)} d="M132 452 L132 462 M156 452 L156 462 M244 452 L244 462 M268 452 L268 462" />
          <path fill={FUR_SHADE} opacity="0.55" d="M86 396 C96 426 136 438 200 438 C150 432 104 420 86 396Z" />
          <path fill={APRON_SHADE} d="M96 410 C140 420 260 420 304 410 L304 424 C262 436 138 436 96 424 Z" />
          {/* Apron: waistband seam, bib pocket */}
          <path {...line(3)} d="M86 346 C140 354 260 354 314 346 M86 358 C140 366 260 366 314 358" />
          <path {...line(2.8)} d="M176 286 C176 300 178 308 180 312 L220 312 C222 308 224 300 224 286" />
          {/* Flour handprint on the apron */}
          {[
            [262, 386, 5],
            [252, 378, 3],
            [270, 376, 3],
            [258, 370, 2.6],
          ].map(([x, y, rr]) => (
            <circle key={`${x}-${y}`} fill="#F5E8D2" cx={x} cy={y} r={rr} />
          ))}
        </>
      )}
    </>
  )
  const scarf = (pass: boolean) => (
    <>
      <path fill={RED} d="M118 244 C160 266 240 266 282 244 L278 262 C240 284 160 284 122 262 Z" />
      <path fill={RED} d="M204 272 L246 318 C232 332 214 326 206 312 Z M196 272 L160 312 C170 326 188 324 196 310 Z" />
      <circle fill={RED} cx="200" cy="274" r="15" />
      {!pass && (
        <>
          <path fill={RED_SHADE} d="M122 262 C160 284 240 284 278 262 L279 256 C240 278 160 278 121 256 Z" />
          <path {...line(2.6)} d="M212 290 L226 308 M188 290 L176 306" />
          <circle {...line(3.2)} cx="200" cy="274" r="15" />
        </>
      )}
    </>
  )
  // Arm: a furry upper arm, then the forearm with a round paw (dark pads on the palm side).
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d="M-24 -6 C-24 -20 24 -20 24 -6 L21 44 C21 54 -21 54 -21 44 Z" />
      <g ref={r(s === 'L' ? 'foreL' : 'foreR', pass)}>
        <path fill={FUR} d="M-18 0 C-18 -10 18 -10 18 0 L20 26 C22 50 -22 50 -20 26 Z" />
        {!pass && (
          <>
            <ellipse fill={PAW} cx="0" cy="34" rx="9" ry="7" />
            {[-11, 0, 11].map((x) => (
              <circle key={x} fill={PAW} cx={x} cy={x === 0 ? 22 : 24} r="4.2" />
            ))}
            <path {...line(2.6)} d="M-14 -4 C-6 0 6 0 14 -4" />
          </>
        )}
      </g>
    </g>
  )
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('earL', pass)}>
        <circle fill={FUR} cx="112" cy="112" r="36" />
        {!pass && <circle fill={EAR_IN} cx="114" cy="114" r="19" />}
      </g>
      <g ref={r('earR', pass)}>
        <circle fill={FUR} cx="288" cy="112" r="36" />
        {!pass && <circle fill={EAR_IN} cx="286" cy="114" r="19" />}
      </g>
      <path fill={FUR} d="M200 96 C272 96 322 136 324 194 C326 246 274 276 200 276 C126 276 74 246 76 194 C78 136 128 96 200 96Z" />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M88 232 C108 262 148 274 200 274 C252 274 292 262 312 232 C294 258 254 268 200 268 C146 268 106 258 88 232Z" />
          <path {...line(3)} d="M92 176 L80 184 M96 206 L84 216 M308 176 L320 184 M304 206 L316 216" />
          <ellipse fill={BLUSH} cx="118" cy="204" rx="19" ry="12" />
          <ellipse fill={BLUSH} cx="282" cy="204" rx="19" ry="12" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill={EYE} rx="11" ry="13" />
                <circle fill="#fff" cx="-3.5" cy="-5" r="4" />
                <circle fill="#fff" cx="4" cy="5" r="1.8" />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(4.5, EYE)} d="M-13 4 Q0 -11 13 4" />
            </g>
          ))}
          <path ref={part('browL')} {...line(3.6)} d="M144 134 Q158 124 172 132" />
          <path ref={part('browR')} {...line(3.6)} d="M228 132 Q242 124 256 134" />
          {/* Muzzle; the mouth opens under the nose */}
          <ellipse fill={MUZZLE} cx="200" cy="208" rx="54" ry="44" />
          <path ref={part('mouth')} {...line(3.2)} fill={MOUTH} d="" />
          <path ref={part('tongue')} fill={TONGUE} d="" />
          <path ref={part('smile')} {...line(3.4)} d="M180 216 Q200 230 220 216" />
          <path fill={EYE} d="M178 186 C178 174 222 174 222 186 C222 198 208 206 200 206 C192 206 178 198 178 186Z" />
          <ellipse fill="#fff" opacity="0.55" cx="190" cy="182" rx="6" ry="3.2" />
          <path {...line(3, EYE)} d="M200 206 L200 214" />
          {/* Flour on his nose */}
          {[
            [206, 178, 4],
            [214, 184, 2.6],
            [198, 176, 2.4],
            [222, 176, 2],
            [170, 196, 2.4],
          ].map(([x, y, rr]) => (
            <circle key={`${x}-${y}`} fill={FLOUR} cx={x} cy={y} r={rr} />
          ))}
        </>
      )}
      {/* The tall puffy hat (its own outline, so it can wobble) */}
      <g ref={r('hat', pass)}>
        <path fill={CREAM} d="M152 72 C128 70 112 54 116 34 C120 14 142 6 158 14 C164 -6 184 -16 204 -12 C224 -8 236 4 238 16 C256 6 282 14 286 34 C290 54 274 70 250 72 Z" />
        <path fill={CREAM} d="M148 58 C182 66 220 66 254 58 L258 110 C222 118 180 118 144 110 Z" />
        {!pass && (
          <>
            <path fill={HAT_SHADE} d="M145 98 C180 106 222 106 257 98 L258 110 C222 118 180 118 144 110 Z" />
            <path {...line(3.2)} d="M148 60 C182 68 220 68 254 60 M170 22 C168 34 168 46 170 54 M204 8 C202 24 202 40 204 56 M236 22 C238 34 238 46 236 54" />
          </>
        )}
      </g>
    </g>
  )

  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Zio Bruno' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="112" ry="11" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{body(true)}</g>
        {body(false)}
        <g {...inkPass()}>{scarf(true)}</g>
        {scarf(false)}
        <g {...inkPass()}>{head(true)}</g>
        {head(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
        {/* The dough ball he tosses (only during toss) */}
        <g ref={part('dough')} style={{ display: 'none' }}>
          <ellipse fill={DOUGH} stroke={INK} strokeWidth={5} cx="200" cy="-6" rx="30" ry="24" />
          <path fill="#F2D2BE" d="M176 2 C186 16 214 16 224 2 C216 12 184 12 176 2Z" />
        </g>
        {/* The pizza dough spinning over his raised right paw (only during spin). The paw ends up at about 330, 150. */}
        <g transform="translate(336 118)">
          <g ref={part('doughDisc')} style={{ display: 'none' }}>
            <g transform="scale(1 0.34)">
              <circle fill={DOUGH} stroke={INK} strokeWidth={10} r="64" />
              <circle fill="none" stroke="#F2D2BE" strokeWidth={10} r="50" />
              <path fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" d="M-30 -20 Q0 -36 30 -20" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  )
})
