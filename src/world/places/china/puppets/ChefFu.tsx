// Chef Fu: a big, round, jolly pig chef (reference: art/source/world/china/cheffu.png). A layered SVG puppet: his tall
// hat wobbles on a spring, his ears flop, his mustache twitches, and his arms knead, toss and wave. In the kitchen he
// stands behind the counter, so the head, hat, arms and hands carry every action (hands come up over the counter).
import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetFrame, type PuppetHandle } from '../../../../sdk'
import { EYE, inkPass, line, TONGUE, useInk } from './ink'

export const CHEFFU_ACTIONS: Record<string, number> = { knead: 1.6, toss: 1.4, laugh: 1.6, quick: 1.3, aiyo: 1.5, wave: 1.5, cheer: 1.2, nod: 0.7, shake: 1.0 }

type Part =
  | 'root' | 'shadow' | 'head' | 'hat' | 'earL' | 'earR' | 'armL' | 'foreL' | 'armR' | 'foreR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'browL' | 'browR'
  | 'mustL' | 'mustR' | 'mouth' | 'tongue' | 'smile' | 'sweat' | 'dough'

const PINK = '#FDADA8'
const PINK_SHADE = '#F4968F'
const SNOUT = '#F99490'
const HOOF = '#6A3020'
const CREAM = '#FCF2DE'
const JACKET = '#FAF1DC'
const JACKET_SHADE = '#F2E1C6'
const APRON = '#FC9E7C'
const APRON_SHADE = '#F08A68'
const JADE = '#7CCBA2'
const JADE_SHADE = '#5FB48A'
const RED = '#E8504F'
const MUSTACHE = '#853D1C'
const BLUSH_PIG = '#FB8583'
const MOUTH = '#D9585A'
const FLOUR = '#FFF4DC'

// Arm angles [shoulder, elbow] in degrees. 0 = hanging straight down; positive swings the hand outward and up.
type Arm = [number, number]
const REST: Arm = [112, 18]
const KNEAD_UP: Arm = [-137, 137]
const KNEAD_DOWN: Arm = [-107, 109]
const UP: Arm = [168, 6]
const CHEEK: Arm = [174, 70]
const BELLY: Arm = [-22, -62]
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
  sweat: number
  dough: number | null
  hatKick: number
}

/** Per-puppet motion state: springs remember velocity between frames. */
function chefMotion() {
  const hat = spring(120, 7)
  const hatY = spring(200, 9)
  const ear = spring(150, 8)
  const must = spring(260, 11)
  let prevLift = 0
  let prevVy = 0
  let nextTwitch = 2.5
  let twitchAt = -10
  return (f: PuppetFrame) => {
    const { t, p, action } = f
    const breathe = Math.sin(t * 2.1)
    const pose: Pose = {
      lift: 0,
      sx: 1 + breathe * 0.008,
      sy: 1 - breathe * 0.012,
      lean: 0,
      head: Math.sin(t * 0.9) * 1.5,
      headY: breathe * 1.2,
      armL: [REST[0] + Math.sin(t * 1.6) * 3, REST[1] + Math.sin(t * 1.6 + 1) * 4],
      armR: [REST[0] + Math.sin(t * 1.6 + 2) * 3, REST[1] + Math.sin(t * 1.6 + 3) * 4],
      happy: false,
      open: 0.45,
      brow: 0,
      sweat: 0,
      dough: null,
      hatKick: 0,
    }
    // Idle arms: into and out of an action pose, so the arms never jump.
    const into = (a: Arm, b: Arm, q: number, inEnd = 0.18, outStart = 0.82) => {
      const k = q < inEnd ? smooth(q / inEnd) : q > outStart ? 1 - smooth((q - outStart) / (1 - outStart)) : 1
      return [mix(a, b, k), k] as const
    }

    if (action === 'knead') {
      // Two pushes down onto the counter: lean in, arms press, body squashes; settle back.
      const [base, k] = into(pose.armL, KNEAD_UP, p, 0.15, 0.85)
      const push = Math.max(bell(span(p, 0.2, 0.48)), bell(span(p, 0.5, 0.78)))
      pose.armL = mix(base, KNEAD_DOWN, push * k)
      pose.armR = mix(into(pose.armR, KNEAD_UP, p, 0.15, 0.85)[0], KNEAD_DOWN, push * k)
      pose.sy -= push * 0.05
      pose.sx += push * 0.03
      pose.headY += push * 7
      pose.head += push * 0
      pose.lean = 0
      pose.happy = push > 0.4
      pose.open = 0.35 + push * 0.2
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
      // The dough flies up and falls back into his hands.
      const fly = span(p, 0.24, 0.8)
      pose.dough = p > 0.22 && p < 0.84 ? Math.sin(fly * Math.PI) * 110 : null
      pose.head = -Math.sin(fly * Math.PI) * 4
      pose.headY -= Math.sin(fly * Math.PI) * 6
      pose.open = 0.35 + Math.sin(fly * Math.PI) * 0.4
      pose.happy = p > 0.8
      pose.hatKick = air
    } else if (action === 'laugh') {
      // Belly laugh: hands on his belly, bouncing ho-ho-ho, eyes squeezed happy.
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
    } else if (action === 'quick') {
      // A flurry of hands at the counter, each hand out of step with the other.
      const [base, k] = into(pose.armL, KNEAD_UP, p, 0.12, 0.88)
      const q = span(p, 0.1, 0.9) * Math.PI * 14
      pose.armL = [base[0] + Math.sin(q) * 12 * k, base[1] + Math.cos(q) * 22 * k]
      const baseR = into(pose.armR, KNEAD_UP, p, 0.12, 0.88)[0]
      pose.armR = [baseR[0] + Math.sin(q + 2) * 12 * k, baseR[1] + Math.cos(q + 2) * 22 * k]
      pose.headY += Math.abs(Math.sin(q)) * 3 * k
      pose.head = Math.sin(q * 0.5) * 3 * k
      pose.happy = true
    } else if (action === 'aiyo') {
      // Flustered: hands fly to his cheeks, a worried head shake, the hat wobbles, a sweat drop.
      const [arms, k] = into(pose.armL, CHEEK, p, 0.14, 0.82)
      pose.armL = arms
      pose.armR = arms
      const shake = Math.sin(span(p, 0.12, 0.8) * Math.PI * 6) * k
      pose.head = shake * 7
      pose.brow = -k
      pose.open = 0.4 * k
      pose.sweat = k
      pose.sy += bell(span(p, 0, 0.18)) * 0.04
      pose.lift = bell(span(p, 0, 0.2)) * 6
      pose.hatKick = Math.abs(shake) * 0.8
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
      pose.open = 0.35 * (1 - env)
    }

    // Follow-through: the tall hat lags behind the head, and kicks when he hops; the ears flop with vertical speed.
    const dt = Math.max(1 / 240, f.dt)
    const vy = (pose.lift - prevLift) / dt
    const ay = (vy - prevVy) / dt
    prevLift = pose.lift
    prevVy = vy
    const hatAngle = hat.step(pose.head + pose.lean, f.dt)
    const hatLag = (hatAngle - (pose.head + pose.lean)) * 1.6 + pose.hatKick * Math.sin(t * 22) * 5
    const hatSquash = hatY.step(Math.max(-0.12, Math.min(0.12, -ay * 0.00006)), f.dt)
    const ears = ear.step(Math.max(-25, Math.min(25, vy * 0.06)) + pose.headY * 0.4, f.dt)
    // Mustache: a twitch every few seconds, and a bounce with every syllable.
    if (t > nextTwitch) {
      twitchAt = t
      nextTwitch = t + 2.5 + Math.random() * 3.5
    }
    const since = t - twitchAt
    const twitchTarget = (since < 0.35 ? Math.sin(since * Math.PI * 8) * 9 : 0) + f.mouth * 10 + pose.open * 6
    const mustache = must.step(twitchTarget, f.dt)
    return { ...pose, hatLag, hatSquash, ears, mustache }
  }
}

/** Chef Fu. Actions: knead, toss, laugh, quick, aiyo, wave, cheer, nod, shake. Voice: cheffu. */
export const ChefFu = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void }>(function ChefFu({ height, style, flip, onTap }, ref) {
  const [motion] = useState(() => chefMotion())
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'cheffu',
    actions: CHEFFU_ACTIONS,
    eyes: [200, 160],
    frame: (f, p) => {
      const r = motion(f)
      setT(p.root, `translate(0 ${-r.lift}) translate(200 470) rotate(${r.lean}) scale(${r.sx} ${r.sy}) translate(-200 -470)`)
      setT(p.shadow, `translate(200 473) scale(${1 - Math.min(0.4, r.lift / 120)})`)
      setT(p.head, `translate(0 ${r.headY}) rotate(${r.head} 200 262)`)
      setT(p.hat, `rotate(${-4 + r.hatLag} 200 116) translate(200 116) scale(${1 - r.hatSquash * 0.5} ${1 + r.hatSquash}) translate(-200 -116)`)
      setT(p.earL, `rotate(${-r.ears} 124 126)`)
      setT(p.earR, `rotate(${r.ears} 276 126)`)
      setT(p.armL, `translate(90 262) rotate(${r.armL[0]})`)
      setT(p.foreL, `translate(0 44) rotate(${r.armL[1]})`)
      setT(p.armR, `translate(310 262) scale(-1 1) rotate(${r.armR[0]})`)
      setT(p.foreR, `translate(0 44) rotate(${r.armR[1]})`)

      for (const [eye, open, arc, x] of [
        [p.eyeL, p.openL, p.happyL, 156],
        [p.eyeR, p.openR, p.happyR, 244],
      ] as const) {
        setT(eye, `translate(${x + (r.happy ? 0 : f.look.x * 3)} ${158 + (r.happy ? 0 : f.look.y * 2.5)}) scale(1 ${r.happy ? 1 : f.blink})`)
        show(open, !r.happy)
        show(arc, r.happy)
      }
      setT(p.browL, `translate(0 ${-Math.abs(r.brow) * 6}) rotate(${r.brow * 14} 156 136)`)
      setT(p.browR, `translate(0 ${-Math.abs(r.brow) * 6}) rotate(${-r.brow * 14} 244 136)`)
      setT(p.mustL, `translate(200 210) scale(1.25) rotate(${-r.mustache})`)
      setT(p.mustR, `translate(200 210) scale(-1.25 1.25) rotate(${-r.mustache})`)

      // Mouth: the voice opens it; laughing and cheering add to it.
      const m = Math.min(1, Math.max(r.open, f.mouth * 1.15))
      if (m > 0.05) {
        const w = 16 + m * 8
        const d = 12 + 30 * m
        setA(p.mouth, 'd', `M${200 - w} 219 Q200 223 ${200 + w} 219 Q${200 + w * 0.85} ${219 + d} 200 ${220 + d} Q${200 - w * 0.85} ${219 + d} ${200 - w} 219Z`)
        setA(p.tongue, 'd', m > 0.25 ? `M${200 - w * 0.62} ${217 + d * 0.92} Q200 ${209 + d * 0.5} ${200 + w * 0.62} ${217 + d * 0.92} Q200 ${221 + d} ${200 - w * 0.62} ${217 + d * 0.92}Z` : '')
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongue, 'd', '')
      }
      show(p.smile, m <= 0.05)
      show(p.sweat, r.sweat > 0.1)
      setT(p.sweat, `translate(0 ${(1 - r.sweat) * -10 + Math.sin(f.t * 3) * 2})`)
      show(p.dough, r.dough !== null)
      if (r.dough !== null) setT(p.dough, `translate(0 ${-r.dough}) rotate(${r.dough * 1.5} 200 -6)`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  // Legs, round body, chef jacket and apron: one outline around the lot.
  const body = (pass: boolean) => (
    <>
      <path fill={PINK} d="M122 400 L168 400 L170 452 C170 470 118 470 118 452 Z" />
      <path fill={PINK} d="M232 400 L278 400 L282 452 C282 470 230 470 230 452 Z" />
      <path fill={PINK} d="M200 300 C282 300 318 344 314 390 C310 426 268 436 200 436 C132 436 90 426 86 390 C82 344 118 300 200 300Z" />
      <path fill={JACKET} d="M92 250 C120 238 280 238 308 250 C326 268 334 320 326 360 C290 372 110 372 74 360 C66 320 74 268 92 250Z" />
      <path fill={APRON} d="M80 344 C140 350 260 350 320 344 L312 406 C262 418 138 418 88 406 Z" />
      {!pass && (
        <>
          {/* Hooves */}
          <path fill={HOOF} d="M118 452 C118 470 170 470 170 452 C162 458 126 458 118 452Z" />
          <path fill={HOOF} d="M230 452 C230 470 282 470 282 452 C274 458 238 458 230 452Z" />
          <path {...line(3)} d="M144 456 L144 468 M256 456 L256 468 M118 452 C126 458 162 458 170 452 M230 452 C238 458 274 458 282 452" />
          {/* One soft shade band on the belly below the apron and on the jacket's lower edge */}
          <path fill={PINK_SHADE} d="M94 414 C104 428 140 434 200 434 C260 434 296 428 306 414 C290 424 256 428 200 428 C144 428 110 424 94 414Z" />
          <path fill={JACKET_SHADE} d="M72 340 C110 352 290 352 328 340 L326 358 C290 368 110 368 74 358 Z" />
          <path fill={APRON_SHADE} d="M90 392 C140 402 260 402 310 392 L312 406 C262 418 138 418 88 406 Z" />
          {/* Double-breasted jacket: two seams and red knot buttons */}
          <path {...line(3)} d="M134 284 C132 304 132 326 134 344 M266 284 C268 304 268 326 266 344" />
          {[
            [152, 300],
            [248, 300],
            [152, 326],
            [248, 326],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill={RED}>
              <circle cx="-3.6" cy="-3.6" r="3.6" />
              <circle cx="3.6" cy="-3.6" r="3.6" />
              <circle cx="-3.6" cy="3.6" r="3.6" />
              <circle cx="3.6" cy="3.6" r="3.6" />
              <circle r="2" fill="#B8323F" />
            </g>
          ))}
          {/* Apron: waistband line, a pocket seam, and the bow tied at his side */}
          <path {...line(3)} d="M80 344 C140 350 260 350 320 344 M84 356 C140 362 260 362 316 356" />
          <path {...line(2.6)} d="M118 368 C120 384 122 396 126 404" />
        </>
      )}
    </>
  )
  const bow = (pass: boolean) => (
    <g transform="translate(322 352)">
      <path fill={APRON} d="M0 0 C10 -18 26 -16 26 -4 C26 6 12 8 0 0 Z M0 0 C4 16 2 34 -6 44 L6 44 C14 30 12 14 0 0Z M0 0 C14 10 24 26 24 38 L32 34 C30 20 18 6 0 0Z" />
      {!pass && <circle fill={APRON_SHADE} r="6" />}
    </g>
  )
  const scarf = (pass: boolean) => (
    <>
      <path fill={JADE} d="M104 256 C150 276 250 276 296 256 L292 272 C250 292 150 292 108 272 Z" />
      <path fill={JADE} d="M200 290 L166 322 C174 332 190 330 197 318 Z M200 290 L234 322 C226 332 210 330 203 318 Z" />
      <circle fill={JADE} cx="200" cy="291" r="12" />
      {!pass && (
        <>
          <path fill={JADE_SHADE} d="M108 272 C150 292 250 292 292 272 L293 268 C250 286 150 286 107 268 Z" />
          <path {...line(2.6)} d="M186 306 L178 318 M214 306 L222 318" />
          <circle {...line(3.2)} cx="200" cy="291" r="12" />
        </>
      )}
    </>
  )
  // Arm: sleeve (shoulder to cuff), then the forearm with a trotter hand (dark two-toed hoof tip).
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      {pass ? <path fill="none" d="M-21 -6 L-19 44 C-19 53 19 53 19 44 L21 -6" /> : <path fill={JACKET} d="M-21 -6 C-21 -17 21 -17 21 -6 L19 44 C19 53 -19 53 -19 44 Z" />}
      {!pass && <path {...line(2.6)} d="M-12 30 C-4 34 6 34 13 30" />}
      <g ref={r(s === 'L' ? 'foreL' : 'foreR', pass)}>
        <path fill={PINK} d="M-15 0 C-15 -8 15 -8 15 0 L17 24 C18 44 -18 44 -17 24 Z" />
        {!pass && (
          <>
            <path fill={HOOF} d="M-17 27 C-18 44 18 44 17 27 C9 33 -9 33 -17 27Z" />
            <path {...line(2.6)} d="M0 31 L0 41" />
            <path {...line(3)} d="M-17 -2 C-6 4 6 4 17 -2" />
          </>
        )}
      </g>
    </g>
  )
  const head = (pass: boolean) => (
    <g ref={r('head', pass)}>
      <g ref={r('earL', pass)}>
        <path fill={PINK} d="M158 114 C146 96 124 86 104 90 C86 94 70 112 62 138 C78 136 94 140 104 152 C114 138 132 126 158 124 Z" />
        {!pass && <path fill={PINK_SHADE} d="M140 110 C128 102 112 100 100 104 C92 110 88 118 90 126 C104 118 120 114 140 114 Z" />}
      </g>
      <g ref={r('earR', pass)}>
        <path fill={PINK} d="M242 114 C254 96 276 86 296 90 C314 94 330 112 338 138 C322 136 306 140 296 152 C286 138 268 126 242 124 Z" />
        {!pass && <path fill={PINK_SHADE} d="M260 110 C272 102 288 100 300 104 C308 110 312 118 310 126 C296 118 280 114 260 114 Z" />}
      </g>
      <path fill={PINK} d="M200 104 C270 104 318 140 320 194 C322 244 272 274 200 274 C128 274 78 244 80 194 C82 140 130 104 200 104Z" />
      {!pass && (
        <>
          <path fill={PINK_SHADE} d="M92 232 C112 260 150 272 200 272 C250 272 288 260 308 232 C292 256 252 266 200 266 C148 266 108 256 92 232Z" />
          <ellipse fill={BLUSH_PIG} cx="118" cy="200" rx="19" ry="13" />
          <ellipse fill={BLUSH_PIG} cx="282" cy="200" rx="19" ry="13" />
          {/* Eyes: tiny dots that look around and blink, or happy arcs */}
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill={EYE} rx="7.5" ry="9.5" />
                <circle fill="#fff" cx="-2.4" cy="-3.6" r="2.8" />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(4.5, EYE)} d="M-12 4 Q0 -10 12 4" />
            </g>
          ))}
          <path ref={part('browL')} {...line(3.4)} d="M146 138 Q156 131 166 136" />
          <path ref={part('browR')} {...line(3.4)} d="M234 136 Q244 131 254 138" />
          {/* Flour on his snout and cheeks */}
          {[
            [168, 176, 3.4],
            [176, 168, 2.6],
            [164, 186, 2.4],
            [174, 184, 2],
            [228, 170, 3],
            [236, 180, 2.6],
            [226, 186, 2.2],
            [196, 156, 2.4],
            [208, 150, 2],
          ].map(([x, y, rr]) => (
            <circle key={`${x}-${y}`} fill={FLOUR} cx={x} cy={y} r={rr} />
          ))}
          {/* Mouth (open when he talks or laughs), then the snout and mustache over its top edge */}
          <path ref={part('mouth')} {...line(3.2)} fill={MOUTH} d="" />
          <path ref={part('tongue')} fill={TONGUE} d="" />
          <path ref={part('smile')} {...line(3.4)} d="M184 222 Q200 234 216 222" />
          <ellipse fill={SNOUT} stroke="#6E3B24" strokeWidth={4} cx="200" cy="188" rx="34" ry="24" />
          <ellipse fill={EYE} cx="189" cy="189" rx="4.6" ry="7" />
          <ellipse fill={EYE} cx="211" cy="189" rx="4.6" ry="7" />
          <circle fill={FLOUR} cx="186" cy="176" r="2.6" />
          <circle fill={FLOUR} cx="214" cy="178" r="2" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'mustL' : 'mustR')}>
              <path
                fill={MUSTACHE}
                stroke="#6E3B24"
                strokeWidth={3.6}
                strokeLinejoin="round"
                d="M2 -7 C-8 -11 -20 -11 -31 -5 C-39 -1 -46 -1 -50 -7 C-54 -14 -49 -21 -42 -20 C-36 -19 -35 -13 -39 -11 C-42 -10 -43 -7 -40 -5 C-33 1 -23 7 -12 7 C-4 7 2 4 2 1 Z"
              />
              <path {...line(2, '#6E3B24')} d="M-12 -2 C-20 -1 -26 1 -30 3" />
            </g>
          ))}
          {/* Sweat drop (aiyo!) */}
          <path ref={part('sweat')} fill="#A8DCFF" stroke="#6E3B24" strokeWidth={3} d="M300 118 C306 130 312 138 306 146 C300 152 290 148 292 138 C293 132 298 126 300 118Z" />
        </>
      )}
      {/* The tall puffy hat (its own outline, so it can wobble) */}
      <g ref={r('hat', pass)}>
        <path fill={CREAM} d="M152 80 C128 78 112 62 116 42 C120 22 142 14 158 22 C164 2 184 -8 204 -4 C224 0 236 12 238 24 C256 14 282 22 286 42 C290 62 274 78 250 80 Z" />
        <path fill={CREAM} d="M148 66 C182 74 220 74 254 66 L258 118 C222 126 180 126 144 118 Z" />
        {!pass && (
          <>
            <path fill="#F0E0C4" d="M145 106 C180 114 222 114 257 106 L258 118 C222 126 180 126 144 118 Z" />
            <path {...line(3.2)} d="M148 68 C182 76 220 76 254 68 M170 30 C168 42 168 54 170 62 M204 16 C202 32 202 48 204 64 M236 30 C238 42 238 54 236 62" />
          </>
        )}
      </g>
    </g>
  )

  return (
    <svg
      ref={svg}
      viewBox="0 0 400 480"
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      aria-label={onTap ? 'Chef Fu' : undefined}
      style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
    >
      <ellipse ref={part('shadow')} rx="110" ry="11" fill="#6E3B24" opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{body(true)}</g>
        {body(false)}
        <g {...inkPass()}>{bow(true)}</g>
        {bow(false)}
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
          <ellipse fill="#F7E7DA" stroke="#6E3B24" strokeWidth={5} cx="200" cy="-6" rx="26" ry="22" />
          <path fill="#F2D2BE" d="M178 0 C186 14 214 14 222 0 C216 10 184 10 178 0Z" />
        </g>
      </g>
    </svg>
  )
})
