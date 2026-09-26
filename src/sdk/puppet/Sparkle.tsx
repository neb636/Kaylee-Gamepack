// Sparkle the unicorn as a living puppet: she breathes, blinks, watches Kaylee's finger, talks with her mouth in time
// with her voice, and her mane and tail swing after her when she moves.
//   const sparkle = useRef<PuppetHandle>(null)
//   <SparklePuppet ref={sparkle} height="min(30vh, 260px)" />
//   sparkle.current?.play('cheer')
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, setA, setT, show, span, spring, usePuppet, wobble, type PuppetHandle } from './core'

export type SparkleAction = 'wave' | 'cheer' | 'hop' | 'nod' | 'think' | 'dance' | 'wiggle'
export const SPARKLE_ACTIONS: SparkleAction[] = ['wave', 'cheer', 'hop', 'nod', 'think', 'dance', 'wiggle']

export interface SparklePuppetProps {
  height: string
  style?: CSSProperties
  /** 'snorkel' adds goggles and a snorkel for underwater scenes. */
  pose?: 'stand' | 'snorkel'
  /** Mirror her so she faces left-to-right the other way. */
  flip?: boolean
  /** Turn her head a little toward something: -1 (her left/screen left) to 1 (screen right). */
  lookToward?: number
}

type Part =
  | 'root' | 'head' | 'earL' | 'earR' | 'forelock' | 'maneBack' | 'tail' | 'tailTip' | 'arm' | 'legFront'
  | 'eyeL' | 'eyeR' | 'irisL' | 'irisR' | 'happyL' | 'happyR' | 'openL' | 'openR'
  | 'mouth' | 'tongue' | 'smile' | 'sparkles' | 'body' | 'chin'

const PINK = '#FF93BD'
const SHADE = '#F57FAE'
const HOOF = '#F2539C'
const HOT = '#FF4F9A'
const LAV = '#B79CF4'
const CREAM = '#FFF3EA'
const INK = '#2B2330'
const FEET: [number, number] = [240, 492]

export const SparklePuppet = forwardRef<PuppetHandle, SparklePuppetProps>(function SparklePuppet({ height, style, pose = 'stand', flip, lookToward = 0 }, ref) {
  const clip = useId().replace(/:/g, '')
  const springs = useRef({ mane: spring(120, 8), fore: spring(160, 9), tail: spring(90, 7), tip: spring(70, 6), ear: spring(200, 10) })
  const prev = useRef({ y: 0, rot: 0 })
  const toward = useRef(lookToward)
  toward.current = lookToward

  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'sparkle',
    actions: { wave: 1.5, cheer: 1.3, hop: 0.75, nod: 0.8, think: 1.8, dance: 1.8, wiggle: 0.6 },
    eyes: [205, 195],
    frame: (f, p) => {
      const t = f.t
      const q = f.p
      const a = f.action
      const s = springs.current
      const breathe = Math.sin(t * 2.3)

      // Whole-body motion (around the hooves).
      let lift = 0
      let sx = 1 + breathe * 0.006
      let sy = 1 - breathe * 0.01
      let rot = 0
      let headRot = Math.sin(t * 1.1) * 2 + toward.current * 6 + f.look.x * 3
      let headY = breathe * 1.5
      let arm = -58 + Math.sin(t * 1.7) * 3 // raised front hoof, resting wave
      let leg = 0
      let happy = false
      let mouthOpen = 0.5 + f.mouth * 0.8
      let closedSmile = false
      let lookUp = 0
      let sparkle = 0
      let thinking = false

      if (a === 'hop' || a === 'cheer') {
        const crouch = bell(span(q, 0, 0.22))
        const air = bell(span(q, 0.22, 0.75))
        const land = wobble(span(q, 0.75, 1), 2)
        sx += crouch * 0.1 - air * 0.06 + land * 0.1
        sy += -crouch * 0.14 + air * 0.1 - land * 0.12
        lift = air * (a === 'cheer' ? 120 : 90)
        headY += crouch * 10
        leg = -air * 40
        arm = a === 'cheer' ? -58 + 40 * bell(span(q, 0.1, 0.95)) + Math.sin(q * 30) * 8 * bell(q) : arm - air * 30
        if (a === 'cheer') {
          happy = true
          mouthOpen = 1.1
          sparkle = bell(span(q, 0.15, 1))
          rot = Math.sin(q * Math.PI * 2) * 4
        }
      } else if (a === 'wave') {
        arm = -62 + Math.sin(q * Math.PI * 7) * 32 * bell(span(q, 0, 0.95))
        headRot += bell(q) * -6
        mouthOpen = Math.max(mouthOpen, 0.7)
      } else if (a === 'nod') {
        headRot += Math.sin(q * Math.PI * 4) * 9 * bell(q)
        headY += Math.abs(Math.sin(q * Math.PI * 4)) * 6 * bell(q)
      } else if (a === 'think') {
        const k = Math.min(1, bell(q) * 2)
        thinking = k > 0.4
        headRot += 8 * k
        lookUp = k
        closedSmile = k > 0.5 && f.mouth < 0.05
      } else if (a === 'dance') {
        const beat = q * Math.PI * 6
        rot = Math.sin(beat) * 7 * bell(q)
        lift = Math.abs(Math.sin(beat)) * 24 * bell(q)
        headRot += Math.sin(beat + 0.6) * 10 * bell(q)
        arm = -50 + Math.sin(beat) * 25
        happy = q > 0.15 && q < 0.85
        mouthOpen = 0.9
      } else if (a === 'wiggle') {
        rot = wobble(q, 3) * 8
        sx += wobble(q, 3) * 0.04
      }

      // Follow-through: mane, forelock, tail and ears lag behind the body's up/down and tilt.
      const vy = (lift - prev.current.y) / Math.max(f.dt, 0.001)
      const vr = (rot + headRot - prev.current.rot) / Math.max(f.dt, 0.001)
      prev.current = { y: lift, rot: rot + headRot }
      const maneA = s.mane.step(-vy * 0.03 - vr * 0.12, f.dt)
      const foreA = s.fore.step(vy * 0.02 - vr * 0.08, f.dt)
      const tailA = s.tail.step(-vy * 0.045 + Math.sin(t * 1.6) * 6, f.dt)
      const tipA = s.tip.step(tailA * 0.9 + Math.sin(t * 1.6 - 0.8) * 5, f.dt)
      const earA = s.ear.step(-vy * 0.02, f.dt)
      const twitch = t % 4.7 < 0.2 ? Math.sin(((t % 4.7) / 0.2) * Math.PI) * 14 : 0

      const [fx, fy] = FEET
      setT(p.root, `translate(0 ${-lift}) translate(${fx} ${fy}) rotate(${rot}) scale(${sx} ${sy}) translate(${-fx} ${-fy})`)
      setT(p.body, `translate(0 ${breathe * -0.8})`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} 238 292)`)
      setT(p.earL, `translate(158 122) rotate(${-10 + earA - twitch * 0.4})`)
      setT(p.earR, `translate(318 150) rotate(${12 - earA + twitch})`)
      setT(p.forelock, `rotate(${foreA} 262 112)`)
      setT(p.maneBack, `rotate(${maneA} 300 130)`)
      setT(p.tail, `translate(352 330) rotate(${tailA})`)
      setT(p.tailTip, `translate(78 18) rotate(${tipA - tailA * 0.3})`)
      setT(p.arm, `translate(186 322) rotate(${arm})`)
      show(p.arm, !thinking)
      show(p.chin, thinking)
      setT(p.legFront, `rotate(${leg} 202 380)`)

      // Eyes: blink, look, happy arcs.
      const lx = f.look.x * 4 + toward.current * 2
      const ly = f.look.y * 4 - lookUp * 6
      for (const [eye, iris, open, hap, cx, cy] of [
        [p.eyeL, p.irisL, p.openL, p.happyL, 150, 184],
        [p.eyeR, p.irisR, p.openR, p.happyR, 262, 206],
      ] as const) {
        setT(eye, `translate(${cx} ${cy}) scale(1 ${happy ? 1 : f.blink})`)
        setT(iris, `translate(${lx} ${ly})`)
        show(open, !happy)
        show(hap, happy)
      }

      // Mouth: an open smile that opens wider with her voice.
      const m = Math.max(0.12, Math.min(1.2, mouthOpen))
      show(p.smile, closedSmile)
      show(p.mouth, !closedSmile)
      show(p.tongue, !closedSmile && m > 0.3)
      setA(p.mouth, 'd', `M170 244 Q193 ${252 - m * 2} 216 240 Q${212} ${244 + 26 * m} 193 ${247 + 26 * m} Q${176} ${246 + 24 * m} 170 244Z`)
      setA(p.tongue, 'd', `M180 ${246 + 20 * m} Q193 ${238 + 14 * m} 206 ${244 + 20 * m} Q200 ${247 + 25 * m} 193 ${247 + 25 * m} Q185 ${247 + 24 * m} 180 ${246 + 20 * m}Z`)

      setT(p.sparkles, `translate(238 120) scale(${sparkle}) rotate(${t * 40})`)
      if (p.sparkles) (p.sparkles as SVGGElement).style.opacity = String(Math.min(1, sparkle * 1.5))
    },
  })

  return (
    <svg
      ref={svg}
      viewBox="40 0 440 505"
      style={{ height, width: 'auto', aspectRatio: '440 / 505', overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
      role="img"
      aria-label="Sparkle the unicorn"
    >
      <defs>
        <clipPath id={`${clip}-horn`}>
          <path d="M213 100 C219 72 227 42 232 24 Q236 16 240 24 C245 42 252 72 256 100 Z" />
        </clipPath>
      </defs>
      <ellipse cx={FEET[0] + 10} cy={FEET[1] + 4} rx="120" ry="12" fill="rgba(43,35,48,0.12)" />
      <g ref={part('root')}>
        {/* Tail: two linked pieces, so the tip swings after the base. */}
        <g ref={part('tail')} transform="translate(352 330)">
          <path fill={HOT} d="M-14 0 C6 -50 84 -66 112 -18 C128 12 116 52 92 70 C98 40 86 12 62 6 C36 0 14 14 -2 26 Z" />
          <path fill={LAV} d="M0 6 C22 -32 78 -44 100 -10 C90 -24 62 -26 42 -16 C26 -8 12 2 0 6Z" />
          <path fill={LAV} d="M30 10 C54 2 80 12 90 36 C76 24 56 22 40 26 Z" />
          <g ref={part('tailTip')} transform="translate(78 18)">
            <path fill={LAV} d="M0 -20 C40 0 50 54 22 88 C8 104 -22 110 -42 98 C-16 92 0 72 0 48 C0 24 -12 4 -30 -4 Z" />
            <path fill={HOT} d="M-20 0 C2 20 8 56 -8 82 C-18 96 -38 100 -52 94 C-32 84 -24 66 -26 46 C-28 28 -34 12 -46 4 Z" />
            <path fill={HOT} d="M14 -10 C44 6 58 44 44 72 C38 84 28 90 20 92 C34 70 34 44 20 22 C14 12 8 2 0 -4 Z" />
            <path fill={HOT} d="M-40 88 C-30 104 -36 118 -52 122 C-44 112 -46 100 -54 94 Z" />
          </g>
        </g>

        {/* Far back leg, then body, then near legs */}
        <g ref={part('body')}>
          <path fill={SHADE} d="M270 390 C270 420 272 446 274 466 L306 466 C308 444 310 416 308 390 Z" />
          <rect x="268" y="456" width="46" height="28" rx="12" fill="#DC4589" />
          <path fill={PINK} d="M170 294 C200 272 314 274 352 298 C388 322 390 400 352 418 C312 436 212 436 180 412 C150 390 146 318 170 294Z" />
          <path fill={SHADE} opacity="0.5" d="M184 404 C220 424 300 426 344 410 C326 430 222 434 184 404Z" />
          <path fill={PINK} d="M318 384 C320 418 326 446 328 466 L366 466 C368 440 368 410 364 380 Z" />
          <rect x="322" y="456" width="50" height="30" rx="13" fill={HOOF} />
          <path d="M328 464 H366" stroke="#DC4589" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g ref={part('legFront')}>
          <path fill={PINK} d="M184 384 C186 420 190 446 192 466 L230 466 C232 444 234 414 232 380 Z" />
          <rect x="184" y="456" width="52" height="30" rx="13" fill={HOOF} />
          <path d="M190 464 H230" stroke="#DC4589" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Mane down the back of her neck (swings) */}
        <g ref={part('maneBack')}>
          <path fill={HOT} d="M284 112 C338 116 368 162 352 204 C380 222 380 268 350 290 C364 312 350 342 318 346 C334 322 322 300 300 292 C318 262 306 232 290 214 Z" />
          <path fill={LAV} d="M326 176 C354 186 376 208 372 230 C362 214 344 210 330 214 C338 202 336 188 326 176Z" />
          <path fill={LAV} d="M324 262 C348 268 364 290 356 312 C348 298 334 292 320 294 C328 284 330 272 324 262Z" />
          <path fill={LAV} d="M300 128 C328 128 348 146 350 168 C336 154 318 150 302 154Z" />
        </g>

        {/* Raised front hoof (waves) */}
        <g ref={part('arm')} transform="translate(186 322) rotate(-58)">
          <rect x="-21" y="-104" width="42" height="112" rx="21" fill={PINK} />
          <rect x="-24" y="-126" width="48" height="32" rx="13" fill={HOOF} />
          <path d="M-18 -100 H18" stroke="#DC4589" strokeWidth="4" strokeLinecap="round" />
        </g>

        <g ref={part('head')}>
          <g ref={part('earL')} transform="translate(158 122) rotate(-10)">
            <path fill={PINK} d="M-26 8 C-32 -24 -26 -52 -14 -62 C4 -54 20 -30 24 2 Z" />
            <path fill="#FFD6DD" d="M-15 -2 C-19 -24 -15 -40 -10 -48 C1 -40 10 -24 12 -4 Z" />
          </g>
          <g ref={part('earR')} transform="translate(318 150) rotate(12)">
            <path fill={PINK} d="M-24 6 C-16 -28 2 -52 24 -58 C32 -40 30 -12 18 12 Z" />
            <path fill="#FFD6DD" d="M-12 0 C-6 -22 6 -38 18 -44 C22 -30 20 -14 12 4 Z" />
          </g>
          {/* Head */}
          <path fill={PINK} d="M204 106 C266 102 322 140 328 200 C334 258 298 300 238 304 C196 306 140 300 110 272 C84 248 82 200 98 166 C116 128 160 108 204 106Z" />
          {/* Muzzle */}
          <ellipse cx="112" cy="206" rx="16" ry="12" fill="#FF6F9F" opacity="0.5" />
          <path fill={CREAM} d="M186 188 C236 186 258 220 254 252 C250 286 216 298 184 296 C144 294 112 272 110 240 C108 208 142 190 186 188Z" />
          <ellipse cx="278" cy="246" rx="17" ry="12" fill="#FF6F9F" opacity="0.5" />
          <ellipse cx="160" cy="216" rx="4.2" ry="5" fill={INK} />
          <ellipse cx="214" cy="226" rx="4.2" ry="5" fill={INK} />
          {/* Mouth */}
          <path ref={part('mouth')} fill="#7A2745" d="" />
          <path ref={part('tongue')} fill="#FF86A8" d="" />
          <path ref={part('smile')} d="M176 246 Q194 258 212 244" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" style={{ display: 'none' }} />
          {/* Eyes */}
          {(['L', 'R'] as const).map((side) => (
            <g key={side} ref={part(`eye${side}`)} transform={side === 'L' ? 'translate(150 184)' : 'translate(262 206)'}>
              <g ref={part(`open${side}`)}>
                <ellipse rx="17" ry="20" fill={INK} />
                <g ref={part(`iris${side}`)}>
                  <circle cx="5" cy="-7" r="6.5" fill="#fff" />
                  <circle cx="-5" cy="6" r="2.8" fill="#fff" />
                </g>
                <path d={side === 'L' ? 'M-14 -12 L-22 -18 M-16 -5 L-25 -8' : 'M14 -12 L22 -18 M16 -5 L25 -8'} stroke={INK} strokeWidth="3" strokeLinecap="round" />
              </g>
              <path ref={part(`happy${side}`)} d="M-16 4 Q0 -16 16 4" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" style={{ display: 'none' }} />
            </g>
          ))}
          <path d="M136 154 Q148 146 160 152" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M254 172 Q266 168 276 178" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
          {/* Forelock swirl (swings) */}
          <g ref={part('forelock')}>
            <path fill={LAV} d="M300 128 C300 84 250 62 206 76 C176 86 160 104 162 124 C180 100 214 92 244 100 C270 106 288 118 300 128Z" />
            <path fill={HOT} d="M214 90 C176 90 150 114 154 140 C158 162 186 168 204 152 C188 150 180 138 186 126 C194 110 222 104 250 116 C262 104 244 90 214 90Z" />
            <path fill={HOT} d="M252 96 C282 92 306 112 304 140 C302 160 290 172 276 176 C286 158 284 136 268 124 C260 116 250 110 240 108 Z" />
            <path fill={LAV} d="M262 132 C278 138 286 152 282 166 C276 156 266 150 256 150 C262 144 264 138 262 132Z" />
          </g>
          {/* Horn, coming out of the swirl */}
          <path fill="#FFF7F0" stroke="#F3C4D6" strokeWidth="3" d="M213 100 C219 72 227 42 232 24 Q236 16 240 24 C245 42 252 72 256 100 Z" />
          <g clipPath={`url(#${clip}-horn)`} stroke={INK} strokeWidth="4" strokeLinecap="round">
            <path d="M205 90 L262 76" />
            <path d="M210 70 L258 56" />
            <path d="M216 50 L254 38" />
          </g>
          <path fill={HOT} d="M196 116 C212 94 262 90 280 112 C262 104 228 104 206 124 Z" />
          {/* Hoof under her chin while she thinks */}
          <g ref={part('chin')} style={{ display: 'none' }}>
            <path fill={PINK} d="M134 360 C136 330 140 306 146 290 L184 296 C180 316 178 340 176 364 Z" />
            <rect x="136" y="270" width="54" height="32" rx="14" fill={HOOF} transform="rotate(8 163 286)" />
          </g>
          {pose === 'snorkel' && (
            <g>
              <path d="M104 170 C140 150 250 160 318 196" fill="none" stroke={HOT} strokeWidth="9" strokeLinecap="round" />
              <circle cx="150" cy="186" r="30" fill="rgba(168,220,255,0.45)" stroke="#6FC3F0" strokeWidth="8" />
              <circle cx="262" cy="206" r="30" fill="rgba(168,220,255,0.45)" stroke="#6FC3F0" strokeWidth="8" />
              <path d="M180 190 Q206 186 232 200" fill="none" stroke="#6FC3F0" strokeWidth="8" strokeLinecap="round" />
              <path d="M224 262 C262 268 300 250 308 200 L312 110" fill="none" stroke="#8FE3C8" strokeWidth="14" strokeLinecap="round" />
              <rect x="300" y="92" width="24" height="26" rx="8" fill={HOT} />
            </g>
          )}
        </g>
        <g ref={part('sparkles')} style={{ opacity: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const ang = (i / 5) * Math.PI * 2
            const r = 120 + (i % 2) * 30
            return <path key={i} transform={`translate(${Math.cos(ang) * r} ${Math.sin(ang) * r}) scale(${i % 2 ? 0.8 : 1.2})`} d="M0 -14 Q3 -3 14 0 Q3 3 0 14 Q-3 3 -14 0 Q-3 -3 0 -14Z" fill={i % 2 ? LAV : '#FFC83D'} />
          })}
        </g>
      </g>
    </svg>
  )
})
