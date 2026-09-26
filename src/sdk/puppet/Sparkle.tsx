// Sparkle the unicorn as a living puppet: she breathes, blinks, watches Kaylee's finger, talks with her mouth in time
// with her voice, and her mane and tail swing after her when she moves.
//   const sparkle = useRef<PuppetHandle>(null)
//   <SparklePuppet ref={sparkle} height="min(30vh, 260px)" />
//   sparkle.current?.play('cheer')
//
// Drawn in the same coordinates as the mascot art (art/source/mascot/wave.png, 1024 px square) so it can be traced and
// compared side by side: flat fills, no outlines, a big round head with a small cream muzzle, a pink-and-lavender swirl
// around the horn, and a wavy striped mane and tail.
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
  | 'root' | 'head' | 'earL' | 'earR' | 'forelock' | 'foreBack' | 'maneBack' | 'tail' | 'tailTip' | 'arm' | 'legFront'
  | 'eyeL' | 'eyeR' | 'irisL' | 'irisR' | 'happyL' | 'happyR' | 'openL' | 'openR'
  | 'mouth' | 'mouthClip' | 'tongue' | 'smile' | 'sparkles' | 'body' | 'chin'

const PINK = '#FF93BD'
const SHADE = '#F27BAA'
const HOOF = '#F2539C'
const HOOF_DARK = '#D63F86'
const HOT = '#FF4F9A'
const LAV = '#B79CF4'
const CREAM = '#FFF3EA'
const EAR = '#FFD3DC'
const BLUSH = '#FF6F9F'
const INK = '#2B2330'
const FEET: [number, number] = [530, 976]
const NECK: [number, number] = [450, 560]
const EYES: [number, number, number][] = [
  [294, 362, -1],
  [525, 404, 1],
]
// The tail is four ribbons of the same curve, each shifted down and back a little: pink and lavender stripes like the art.
// The curve comes in two pieces joined at TAIL_JOINT so the curly end can swing after the base.
const TAIL_JOINT: [number, number] = [166, -44]
const TAIL_BASE = 'M-24 40 C-8 -70 106 -112 166 -44'
const TAIL_TIP = 'M0 0 C34 40 38 104 14 150'
const TAIL_BANDS: [number, number, string][] = [
  [0, 0, HOT],
  [-18, 26, LAV],
  [-36, 50, HOT],
  [-52, 72, LAV],
]
// Motion distances were tuned in the old 440-unit drawing; this one is about 1.9 times bigger.
const K = 1.9

// A hoof seen from the side: a rounded cup with a darker rim on top.
function Hoof({ x, y, w, h, dark }: { x: number; y: number; w: number; h: number; dark?: boolean }) {
  return (
    <g>
      <path fill={dark ? HOOF_DARK : HOOF} d={`M${x + 4} ${y + 14} C${x + 4} ${y - 2} ${x + w - 4} ${y - 2} ${x + w - 4} ${y + 14} L${x + w} ${y + h - 22} C${x + w} ${y + h + 4} ${x} ${y + h + 4} ${x} ${y + h - 22}Z`} />
      <path d={`M${x + 8} ${y + 18} Q${x + w / 2} ${y + 6} ${x + w - 8} ${y + 18}`} fill="none" stroke={dark ? '#B8306F' : HOOF_DARK} strokeWidth="7" strokeLinecap="round" />
    </g>
  )
}

export const SparklePuppet = forwardRef<PuppetHandle, SparklePuppetProps>(function SparklePuppet({ height, style, pose = 'stand', flip, lookToward = 0 }, ref) {
  const clip = useId().replace(/:/g, '')
  const springs = useRef({ mane: spring(120, 8), fore: spring(160, 9), tail: spring(90, 7), tip: spring(70, 6), ear: spring(200, 10) })
  const prev = useRef({ y: 0, rot: 0 })
  const toward = useRef(lookToward)
  toward.current = lookToward

  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'sparkle',
    actions: { wave: 1.5, cheer: 1.3, hop: 0.75, nod: 0.8, think: 1.8, dance: 1.8, wiggle: 0.6 },
    eyes: [410, 380],
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
      let headY = breathe * 1.5 * K
      let arm = -61 + Math.sin(t * 1.7) * 3 // raised front hoof, resting wave
      let leg = 0
      let happy = false
      let mouthOpen = 0.62 + f.mouth * 0.7
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
        lift = air * (a === 'cheer' ? 120 : 90) * K
        headY += crouch * 10 * K
        leg = -air * 40
        arm = a === 'cheer' ? -61 + 40 * bell(span(q, 0.1, 0.95)) + Math.sin(q * 30) * 8 * bell(q) : arm - air * 30
        if (a === 'cheer') {
          happy = true
          mouthOpen = 1.05
          sparkle = bell(span(q, 0.15, 1))
          rot = Math.sin(q * Math.PI * 2) * 4
        }
      } else if (a === 'wave') {
        arm = -64 + Math.sin(q * Math.PI * 7) * 32 * bell(span(q, 0, 0.95))
        headRot += bell(q) * -6
        mouthOpen = Math.max(mouthOpen, 0.8)
      } else if (a === 'nod') {
        headRot += Math.sin(q * Math.PI * 4) * 9 * bell(q)
        headY += Math.abs(Math.sin(q * Math.PI * 4)) * 6 * K * bell(q)
      } else if (a === 'think') {
        const k = Math.min(1, bell(q) * 2)
        thinking = k > 0.4
        headRot += 8 * k
        lookUp = k
        closedSmile = k > 0.5 && f.mouth < 0.05
      } else if (a === 'dance') {
        const beat = q * Math.PI * 6
        rot = Math.sin(beat) * 7 * bell(q)
        lift = Math.abs(Math.sin(beat)) * 24 * K * bell(q)
        headRot += Math.sin(beat + 0.6) * 10 * bell(q)
        arm = -52 + Math.sin(beat) * 25
        happy = q > 0.15 && q < 0.85
        mouthOpen = 0.95
      } else if (a === 'wiggle') {
        rot = wobble(q, 3) * 8
        sx += wobble(q, 3) * 0.04
      }

      // Follow-through: mane, forelock, tail and ears lag behind the body's up/down and tilt.
      const vy = (lift / K - prev.current.y) / Math.max(f.dt, 0.001)
      const vr = (rot + headRot - prev.current.rot) / Math.max(f.dt, 0.001)
      prev.current = { y: lift / K, rot: rot + headRot }
      const maneA = s.mane.step(-vy * 0.03 - vr * 0.12, f.dt)
      const foreA = s.fore.step(vy * 0.02 - vr * 0.08, f.dt)
      const tailA = s.tail.step(-vy * 0.045 + Math.sin(t * 1.6) * 6, f.dt)
      const tipA = s.tip.step(tailA * 0.9 + Math.sin(t * 1.6 - 0.8) * 5, f.dt)
      const earA = s.ear.step(-vy * 0.02, f.dt)
      const twitch = t % 4.7 < 0.2 ? Math.sin(((t % 4.7) / 0.2) * Math.PI) * 14 : 0

      const [fx, fy] = FEET
      setT(p.root, `translate(0 ${-lift}) translate(${fx} ${fy}) rotate(${rot}) scale(${sx} ${sy}) translate(${-fx} ${-fy})`)
      setT(p.body, `translate(0 ${breathe * -1.5})`)
      setT(p.head, `translate(0 ${headY}) rotate(${headRot} ${NECK[0]} ${NECK[1]})`)
      setT(p.earL, `translate(314 206) rotate(${-4 + earA - twitch * 0.4})`)
      setT(p.earR, `translate(622 274) rotate(${4 - earA + twitch})`)
      setT(p.forelock, `rotate(${foreA} 450 200)`)
      setT(p.foreBack, `rotate(${foreA * 0.6} 450 200)`)
      setT(p.maneBack, `rotate(${maneA} 610 250)`)
      setT(p.tail, `translate(700 646) rotate(${tailA})`)
      setT(p.tailTip, `translate(${TAIL_JOINT[0]} ${TAIL_JOINT[1]}) rotate(${tipA - tailA * 0.3})`)
      setT(p.arm, `translate(362 650) rotate(${arm})`)
      show(p.arm, !thinking)
      show(p.chin, thinking)
      setT(p.legFront, `rotate(${leg} 408 790)`)

      // Eyes: blink, look, happy arcs.
      const lx = (f.look.x * 4 + toward.current * 2) * K
      const ly = (f.look.y * 4 - lookUp * 6) * K
      for (const [i, [eye, iris, open, hap]] of ([
        [p.eyeL, p.irisL, p.openL, p.happyL],
        [p.eyeR, p.irisR, p.openR, p.happyR],
      ] as const).entries()) {
        const [cx, cy] = EYES[i]
        setT(eye, `translate(${cx} ${cy}) scale(1 ${happy ? 1 : f.blink})`)
        setT(iris, `translate(${lx} ${ly})`)
        show(open, !happy)
        show(hap, happy)
      }

      // Mouth: a wide open smile (a "D" under the nose) that opens wider with her voice. The tongue is clipped to it.
      const m = Math.max(0.15, Math.min(1.2, mouthOpen))
      show(p.smile, closedSmile)
      show(p.mouth, !closedSmile)
      show(p.tongue, !closedSmile && m > 0.3)
      const d = `M336 452 Q386 ${466 - m * 4} 436 462 C${436} ${470 + 44 * m} ${414} ${472 + 58 * m} ${388} ${472 + 58 * m} C${360} ${472 + 58 * m} ${338} ${466 + 44 * m} 336 452Z`
      setA(p.mouth, 'd', d)
      setA(p.mouthClip, 'd', d)
      setA(p.tongue, 'd', `M346 ${480 + 50 * m} C352 ${446 + 34 * m} 424 ${448 + 34 * m} 430 ${482 + 50 * m} Z`)

      setT(p.sparkles, `translate(450 330) scale(${sparkle}) rotate(${t * 40})`)
      if (p.sparkles) (p.sparkles as SVGGElement).style.opacity = String(Math.min(1, sparkle * 1.5))
    },
  })

  return (
    <svg
      ref={svg}
      viewBox="110 22 836 960"
      style={{ height, width: 'auto', aspectRatio: '836 / 960', overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}
      role="img"
      aria-label="Sparkle the unicorn"
    >
      <defs>
        <clipPath id={`${clip}-horn`}>
          <path d="M420 172 C430 120 444 72 451 44 Q457 30 464 44 C476 82 490 126 500 164 Z" />
        </clipPath>
        <clipPath id={`${clip}-mouth`}>
          <path ref={part('mouthClip')} d="" />
        </clipPath>
      </defs>
      <ellipse cx={FEET[0]} cy={FEET[1] + 4} rx="230" ry="22" fill="rgba(43,35,48,0.12)" />
      <g ref={part('root')}>
        {/* Tail: striped pink and lavender, in two linked pieces so the curly end swings after the base. */}
        <g ref={part('tail')} transform="translate(700 646)">
          {TAIL_BANDS.map(([dx, dy, c], i) => (
            <path key={i} d={TAIL_BASE} transform={`translate(${dx} ${dy})`} fill="none" stroke={c} strokeWidth="74" strokeLinecap="round" />
          ))}
          <g ref={part('tailTip')} transform={`translate(${TAIL_JOINT[0]} ${TAIL_JOINT[1]})`}>
            {/* The end of the top ribbon flicks up and out. */}
            <path fill={HOT} d="M-10 150 C20 186 72 180 88 140 C102 170 88 206 50 212 C18 216 -6 196 -10 150Z" />
            {TAIL_BANDS.map(([dx, dy, c], i) => (
              // Lower ribbons stop sooner, so only the top ones curl at the end.
              <path key={i} d={TAIL_TIP} transform={`translate(${dx} ${dy})`} fill="none" stroke={c} strokeWidth={74 - i * 6} strokeLinecap="round" pathLength={1} strokeDasharray={`${1 - i * 0.2} 2`} />
            ))}
          </g>
        </g>

        {/* Far legs, body, near back leg. No outlines: everything joins by color, like the art. */}
        <g ref={part('body')}>
          <path fill={SHADE} d="M338 740 C336 800 346 852 356 890 L398 890 C390 846 390 796 396 752 Z" />
          <path fill={SHADE} d="M544 770 C540 830 534 866 530 902 L598 902 C604 862 612 820 616 776 Z" />
          <Hoof x={516} y={890} w={86} h={54} dark />
          <path fill={PINK} d="M344 560 C328 630 316 710 330 772 C342 806 390 814 450 812 L604 808 C664 806 704 788 708 736 C714 676 690 628 640 598 C600 574 560 560 520 556 Z" />
          <path fill={SHADE} opacity="0.55" d="M332 744 C352 790 400 806 460 806 L600 804 C560 818 470 822 420 820 C370 818 338 796 332 744Z" />
          <path d="M500 772 C502 786 502 798 500 808" fill="none" stroke={SHADE} strokeWidth="6" strokeLinecap="round" />
          <path fill={PINK} d="M598 766 C612 826 618 876 618 920 L712 920 C716 862 720 802 708 740 Z" />
          <Hoof x={612} y={906} w={102} h={66} />
        </g>
        <g ref={part('legFront')}>
          <path fill={PINK} d="M340 752 C338 812 354 862 360 916 L462 916 C464 866 478 816 480 764 Z" />
          <path d="M350 770 C372 792 404 800 440 798" fill="none" stroke={SHADE} strokeWidth="6" strokeLinecap="round" opacity="0.7" />
          <Hoof x={348} y={900} w={122} h={76} />
        </g>

        {/* Raised front hoof (waves) */}
        <g ref={part('arm')} transform="translate(362 650) rotate(-61)">
          <path fill={PINK} d="M-38 30 L-34 -140 C-34 -164 34 -164 34 -140 L38 30 Z" />
          <path fill={HOOF} d="M-44 -146 C-46 -178 -32 -214 0 -216 C32 -214 46 -178 44 -146 C44 -130 -44 -130 -44 -146Z" />
          <path d="M-36 -148 Q0 -162 36 -148" fill="none" stroke={HOOF_DARK} strokeWidth="7" strokeLinecap="round" />
        </g>

        {/* Mane down the back of her neck and over her shoulder (swings) */}
        <g ref={part('maneBack')}>
          <path fill={HOT} d="M584 222 C656 208 724 262 716 336 C748 366 750 436 712 470 C730 504 712 548 666 556 C682 526 670 498 642 490 L596 300 Z" />
          <path fill={LAV} d="M638 300 C700 304 748 352 744 410 C762 432 758 466 732 474 C738 454 728 442 712 446 C720 400 692 350 632 336 Z" />
          <path fill={LAV} d="M596 462 C648 470 676 520 662 574 C654 602 624 618 598 608 C618 596 628 574 616 552 C604 532 588 514 596 462Z" />
          <path fill={HOT} d="M556 534 C612 550 622 624 592 668 C576 692 544 696 522 686 C548 672 558 650 544 628 C526 604 522 564 556 534Z" />
        </g>
        <g ref={part('head')}>
          {/* Swirl behind the horn: a lavender band over the top of her head, then pink falling down the right side. */}
          <g ref={part('foreBack')}>
            <path fill={HOT} d="M462 100 C540 70 616 110 634 186 C646 236 628 282 598 312 C600 270 590 232 566 204 C546 160 510 124 462 100Z" />
            <path fill={LAV} d="M350 208 C352 146 406 104 470 100 C530 96 578 132 592 186 C600 222 594 256 580 280 C566 240 534 214 494 206 Z" />
          </g>
          <g ref={part('earL')} transform="translate(314 206) rotate(-4)">
            <path fill={PINK} d="M-54 14 C-62 -40 -46 -92 -20 -114 C12 -102 42 -62 50 -4 Z" />
            <path fill={EAR} d="M-36 0 C-42 -38 -32 -72 -18 -90 C2 -78 22 -48 26 -12 Z" />
          </g>
          <g ref={part('earR')} transform="translate(622 274) rotate(4)">
            <path fill={PINK} d="M-44 -6 C-24 -60 26 -100 76 -106 C92 -70 80 -18 40 26 Z" />
            <path fill={EAR} d="M-20 -14 C-2 -52 34 -80 64 -88 C72 -60 62 -26 34 4 Z" />
          </g>
          {/* Head */}
          <path fill={PINK} d="M400 204 C522 190 632 252 642 372 C652 472 598 548 498 562 C430 572 332 568 280 546 C220 520 190 470 196 410 C198 350 222 298 264 262 C302 228 352 208 400 204Z" />
          <ellipse cx="238" cy="416" rx="33" ry="28" fill={BLUSH} opacity="0.45" />
          <ellipse cx="546" cy="484" rx="34" ry="28" fill={BLUSH} opacity="0.45" />
          {/* Muzzle */}
          <path fill={CREAM} d="M380 388 C452 386 498 430 496 480 C494 532 446 562 384 562 C318 562 268 530 268 480 C268 426 316 390 380 388Z" />
          <ellipse cx="333" cy="422" rx="7.5" ry="9.5" fill={INK} />
          <ellipse cx="433" cy="440" rx="7.5" ry="9.5" fill={INK} />
          {/* Mouth */}
          <path ref={part('mouth')} fill="#7A2745" stroke={INK} strokeWidth="5" strokeLinejoin="round" d="" />
          <path ref={part('tongue')} fill="#FF86A8" d="" clipPath={`url(#${clip}-mouth)`} />
          <path d="M328 446 Q333 452 340 452 M444 458 Q438 462 432 462" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path ref={part('smile')} d="M340 458 Q388 492 434 466" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" style={{ display: 'none' }} />
          {/* Eyes */}
          {(['L', 'R'] as const).map((side, i) => {
            const dir = EYES[i][2]
            return (
              <g key={side} ref={part(`eye${side}`)} transform={`translate(${EYES[i][0]} ${EYES[i][1]})`}>
                <g ref={part(`open${side}`)}>
                  <ellipse rx="34" ry="39" fill={INK} />
                  <g ref={part(`iris${side}`)}>
                    <circle cx="12" cy="-13" r="11" fill="#fff" />
                    <circle cx="-11" cy="15" r="5" fill="#fff" />
                  </g>
                  <path d={`M${dir * 26} -26 Q${dir * 34} -34 ${dir * 42} -34 M${dir * 32} -14 Q${dir * 42} -18 ${dir * 50} -16 M${dir * 18} -34 Q${dir * 22} -44 ${dir * 30} -48`} fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
                </g>
                <path ref={part(`happy${side}`)} d="M-30 8 Q0 -28 30 8" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" style={{ display: 'none' }} />
              </g>
            )
          })}
          <path d="M276 284 Q300 262 328 274" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          <path d="M540 318 Q564 308 580 334" fill="none" stroke={INK} strokeWidth="7" strokeLinecap="round" />
          {/* Horn, rising out of the swirl */}
          <path fill="#FFF7F0" d="M420 172 C430 120 444 72 451 44 Q457 30 464 44 C476 82 490 126 500 164 Z" />
          <g clipPath={`url(#${clip}-horn)`} stroke={INK} strokeWidth="7" strokeLinecap="round">
            <path d="M404 150 Q450 158 512 118" fill="none" />
            <path d="M416 106 Q456 110 504 78" fill="none" />
            <path d="M428 70 Q460 72 494 46" fill="none" />
          </g>
          {/* Forelock swirl in front of the horn (swings): a thick pink curl from her left ear, under the horn, sweeping up
              to the right, with a lavender band hugging it. */}
          <g ref={part('forelock')}>
            <path fill={LAV} d="M436 236 C486 214 556 212 588 252 C604 272 604 296 592 312 C576 284 546 268 508 268 C476 268 452 282 436 300 Z" />
            <path fill={HOT} d="M316 232 C300 190 330 158 374 158 C412 158 440 178 472 174 C502 170 522 150 524 124 C554 146 562 196 534 234 C504 272 444 284 392 280 C350 276 324 260 316 232Z" />
            <path fill={LAV} d="M372 176 C406 168 442 190 474 186 C454 200 430 204 404 198 C390 194 380 186 372 176Z" />
            <path fill="#E83E88" d="M330 222 C326 196 344 180 366 184 C352 192 348 206 356 220 Z" />
          </g>
          {/* Hoof under her chin while she thinks */}
          <g ref={part('chin')} style={{ display: 'none' }}>
            <path d="M392 702 L306 598" stroke={PINK} strokeWidth="72" strokeLinecap="round" />
            <g transform="translate(300 592) rotate(-40)">
              <path fill={HOOF} d="M-42 0 C-44 -28 -32 -60 0 -62 C32 -60 44 -28 42 0 C42 16 -42 16 -42 0Z" />
              <path d="M-34 -2 Q0 -14 34 -2" fill="none" stroke={HOOF_DARK} strokeWidth="7" strokeLinecap="round" />
            </g>
          </g>
          {pose === 'snorkel' && (
            <g>
              <path d="M200 350 C270 310 490 320 636 390" fill="none" stroke={HOT} strokeWidth="17" strokeLinecap="round" />
              <circle cx={EYES[0][0]} cy={EYES[0][1]} r="56" fill="rgba(168,220,255,0.45)" stroke="#6FC3F0" strokeWidth="15" />
              <circle cx={EYES[1][0]} cy={EYES[1][1]} r="56" fill="rgba(168,220,255,0.45)" stroke="#6FC3F0" strokeWidth="15" />
              <path d="M348 366 Q400 360 470 390" fill="none" stroke="#6FC3F0" strokeWidth="15" strokeLinecap="round" />
              <path d="M440 500 C520 510 600 480 616 390 L624 210" fill="none" stroke="#8FE3C8" strokeWidth="26" strokeLinecap="round" />
              <rect x="600" y="176" width="48" height="50" rx="15" fill={HOT} />
            </g>
          )}
        </g>
        <g ref={part('sparkles')} style={{ opacity: 0 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const ang = (i / 5) * Math.PI * 2
            const r = 250 + (i % 2) * 50
            return <path key={i} transform={`translate(${Math.cos(ang) * r} ${Math.sin(ang) * r}) scale(${i % 2 ? 1.5 : 2.2})`} d="M0 -14 Q3 -3 14 0 Q3 3 0 14 Q-3 3 -14 0 Q-3 -3 0 -14Z" fill={i % 2 ? LAV : '#FFC83D'} />
          })}
        </g>
      </g>
    </svg>
  )
})
