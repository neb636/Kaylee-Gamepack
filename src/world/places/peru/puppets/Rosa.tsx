// Rosa the pink river dolphin (a boto): a layered SVG puppet in side view, facing right, traced from her reference
// picture (art/source/world/peru/rosa.png, drawn in the same coordinates). She breathes, blinks and watches her finger;
// her tail flukes beat on springs (faster while she swims), her flipper paddles, and her bendy neck turns her head (real
// botos can turn their heads, unlike sea dolphins). Her long lower beak is hinged, so it opens with her voice.
// Actions: spout (a puff out of her blowhole), jump, nod, giggle, cheer.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass, useInk } from '../../../kit/ink'

export const ROSA_ACTIONS = { spout: 1.3, jump: 1.5, nod: 0.7, giggle: 1.1, cheer: 1.3 }

const INK = '#2B2330'
const PINK = '#FF7FAE'
const SHINE = '#FFB3CF'
const BELLY = '#FFC6AE'
const BLUSH = '#FF5C95'
const MOUTH = '#C93F72'
const W = 11

// Key points (the reference's own pixels; viewBox 0 300 1260 640).
const TAIL: [number, number] = [300, 616] // the flukes turn here
const NECK: [number, number] = [800, 580] // the head turns here
const HINGE: [number, number] = [1004, 597] // the lower beak opens here
const FLIP: [number, number] = [780, 700] // the flipper paddles here
export const ROSA_VIEW = { x: 0, y: 300, w: 1260, h: 640 }
/** The blowhole, the beak tip and the middle of her body (for splashes and spouts, in viewBox units). */
export const ROSA_POINTS = { blowhole: [905, 338], beak: [1240, 556], middle: [640, 590] } as const

const BODY = 'M200 600 C300 552 420 500 520 470 C620 440 720 424 800 418 L846 704 C770 716 690 724 620 720 C500 714 380 690 300 664 C260 652 225 640 200 630Z'
const BELLY_PATH = 'M200 622 C300 650 420 686 560 702 C660 712 760 706 850 690 L850 740 L200 740Z'
const HEAD = 'M756 472 C790 380 860 326 940 328 C1020 332 1068 400 1068 470 C1068 488 1072 500 1086 508 C1130 525 1190 535 1226 542 C1248 547 1251 566 1232 572 C1170 574 1090 582 1006 594 C960 642 902 690 840 705 C790 714 760 700 748 680Z'
const THROAT = 'M740 676 C800 690 860 680 910 655 C950 632 980 610 1006 594 L1006 760 L740 760Z'
const JAW = 'M-6 -2 C70 -6 160 -18 222 -27 C240 -29 244 -13 229 -7 C180 12 92 32 20 42 C2 44 -16 24 -6 -2Z'
const FLUKE_UP = 'M290 590 C220 540 130 490 38 478 C14 475 10 494 24 506 C64 548 96 604 150 632 C200 630 260 620 290 614Z'
const FLUKE_DOWN = 'M160 620 C118 676 76 738 44 794 C36 808 50 818 64 811 C128 788 200 720 252 650 C230 640 190 628 160 620Z'
const STOCK = 'M190 598 C230 588 280 572 330 556 L346 668 C300 660 240 646 190 632Z'
const FLIPPER = 'M712 688 C690 760 628 842 590 882 C578 898 594 912 616 905 C700 878 790 800 846 690Z'

type Part = 'root' | 'tail' | 'head' | 'jaw' | 'flipper' | 'eyeOpen' | 'pupil' | 'eyeHappy' | 'spout' | 'blush'

export interface RosaProps {
  height: string
  style?: CSSProperties
  /** 0..1: how fast she's swimming now (her tail beats harder and faster). */
  speed?: () => number
  label?: string
}

/** Rosa the pink river dolphin. Voice: rosa. */
export const Rosa = forwardRef<PuppetHandle, RosaProps>(function Rosa({ height, style, speed, label = 'Rosa' }, ref) {
  const id = useId().replace(/:/g, '')
  const ink = useInk<Part>()
  const st = useRef({ tail: spring(90, 8), flip: spring(70, 7), head: spring(80, 10), jaw: 0, phase: 0 }).current
  const speedRef = useRef(speed)
  speedRef.current = speed

  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'rosa',
    actions: ROSA_ACTIONS,
    eyes: [935, 548],
    reach: [1200, 560],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const e = bell(q)
      const v = clamp(speedRef.current?.() ?? 0)

      // Swimming: her tail beats faster and wider the faster she goes; the body rocks a little against it.
      st.phase += dt * (2.2 + v * 5)
      const beat = Math.sin(st.phase)
      const breath = Math.sin(t * 1.8)
      let sx = 1 + breath * 0.008
      let sy = 1 - breath * 0.012
      const x = 0
      let y = beat * (6 + v * 6)
      let rot = -beat * (1.5 + v * 1.5)
      let tail = beat * (10 + v * 16)
      let flip = Math.sin(st.phase - 0.8) * (6 + v * 8)
      let head = Math.sin(t * 1.1) * 2 + look.y * 6 + beat * 1.5
      let jaw = f.mouth * 16
      let happy = false
      let spout = 0
      let blush = 1

      if (act === 'spout') {
        // Up for air: a small lift, the head tips up, then "pfff" out of the blowhole.
        const up = bell(span(q, 0, 0.8))
        y -= up * 30
        head -= up * 8
        spout = bell(span(q, 0.15, 0.9))
        tail += Math.sin(q * Math.PI * 4) * 10 * e
        if (q > 0.3) happy = true
      } else if (act === 'jump') {
        // Anticipation (a dip and a coil of the tail), a big arc nose-up then nose-down, a stretch on the way out.
        const dip = bell(span(q, 0, 0.18))
        const air = span(q, 0.18, 0.88)
        const land = wobble(span(q, 0.88, 1), 2)
        y += dip * 30 - Math.sin(Math.PI * air) * 330
        rot += air > 0 && air < 1 ? lerp(-38, 42, smooth(air)) : 0
        sx *= 1 + bell(air) * 0.06 - dip * 0.04 + land * 0.05
        sy *= 1 - bell(air) * 0.05 + dip * 0.06 - land * 0.06
        tail += dip * -28 + bell(air) * 30 * Math.sin(q * Math.PI * 6)
        flip -= bell(air) * 26
        happy = air > 0.1
        blush = 1 + bell(air) * 0.3
      } else if (act === 'nod') {
        head += Math.sin(q * Math.PI * 2) * 9
      } else if (act === 'giggle') {
        rot += Math.sin(q * Math.PI * 9) * 3 * e
        y -= Math.abs(Math.sin(q * Math.PI * 9)) * 10 * e
        jaw = Math.max(jaw, 10 * e)
        tail += Math.sin(q * Math.PI * 9) * 18 * e
        happy = true
        blush = 1 + e * 0.35
      } else if (act === 'cheer') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.75))
        const land = wobble(span(q, 0.75, 1), 2)
        y += crouch * 16 - air * 90
        rot -= air * 10
        sx *= 1 + crouch * 0.05 - air * 0.03 + land * 0.04
        sy *= 1 - crouch * 0.06 + air * 0.05 - land * 0.05
        tail += Math.sin(q * Math.PI * 8) * 30 * e
        flip -= air * 30
        jaw = Math.max(jaw, 14 * e)
        happy = true
      }

      const cx = 640
      const cy = 620
      setT(p.root, `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)} ${cx} ${cy}) translate(${cx} ${cy}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-cx} ${-cy})`)
      setT(p.tail, `rotate(${st.tail.step(tail, dt).toFixed(2)} ${TAIL[0]} ${TAIL[1]})`)
      setT(p.flipper, `rotate(${st.flip.step(flip, dt).toFixed(2)} ${FLIP[0]} ${FLIP[1]})`)
      setT(p.head, `rotate(${st.head.step(head, dt).toFixed(2)} ${NECK[0]} ${NECK[1]})`)
      st.jaw += (jaw - st.jaw) * Math.min(1, dt * 22)
      setT(p.jaw, `translate(${HINGE[0]} ${HINGE[1]}) rotate(${Math.max(0, st.jaw).toFixed(2)})`)
      setT(p.blush, `translate(893 604) scale(${blush.toFixed(3)})`)
      setT(p.spout, `translate(${ROSA_POINTS.blowhole[0]} ${ROSA_POINTS.blowhole[1]}) scale(${(0.3 + spout * 0.7).toFixed(3)} ${spout.toFixed(3)})`)
      show(p.spout, spout > 0.02)
      ink.sync(p)

      show(p.eyeOpen, !happy)
      show(p.eyeHappy, happy)
      setT(p.eyeOpen, `translate(935 548) scale(1 ${Math.max(0.08, f.blink).toFixed(3)}) translate(-935 -548)`)
      setT(p.pupil, `translate(${(look.x * 7).toFixed(1)} ${(look.y * 6).toFixed(1)})`)
    },
  })

  return (
    <svg
      ref={svg}
      viewBox={`${ROSA_VIEW.x} ${ROSA_VIEW.y} ${ROSA_VIEW.w} ${ROSA_VIEW.h}`}
      aria-label={label}
      style={{ height, aspectRatio: `${ROSA_VIEW.w} / ${ROSA_VIEW.h}`, overflow: 'visible', display: 'block', ...style }}
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={BODY} />
        </clipPath>
        <clipPath id={`${id}-head`}>
          <path d={HEAD} />
        </clipPath>
      </defs>
      <g ref={part('root')} strokeLinejoin="round" strokeLinecap="round">
        {/* One outline around body, tail stock and head together (see kit/ink.ts), so she reads as one dolphin. */}
        <g {...inkPass(W / 2, INK)}>
          <g ref={ink.twin('tail')}>
            <path d={STOCK} />
          </g>
          <path d={BODY} />
          <g ref={ink.twin('head')}>
            <path d={HEAD} />
          </g>
        </g>
        <g ref={part('tail')}>
          <path d={FLUKE_DOWN} fill={PINK} stroke={INK} strokeWidth={W} />
          <path d={FLUKE_UP} fill={PINK} stroke={INK} strokeWidth={W} />
          <path d={STOCK} fill={PINK} />
          <path d="M60 500 C110 520 160 560 200 590" fill="none" stroke={SHINE} strokeWidth="14" />
          <path d="M80 770 C110 730 140 690 170 660" fill="none" stroke={SHINE} strokeWidth="12" />
        </g>
        {/* The flipper sits under the body's fill, so its root tucks into her belly and only the paddle shows. */}
        <g ref={part('flipper')}>
          <path d={FLIPPER} fill={PINK} stroke={INK} strokeWidth={W} />
          <path d="M700 760 C680 800 650 840 625 870" fill="none" stroke={SHINE} strokeWidth="12" />
        </g>
        <path d={BODY} fill={PINK} />
        <path d={BELLY_PATH} fill={BELLY} clipPath={`url(#${id}-body)`} />
        <path d="M520 500 C580 476 650 458 720 450" fill="none" stroke={SHINE} strokeWidth="16" />
        <path d="M330 588 C380 566 420 552 460 540" fill="none" stroke={SHINE} strokeWidth="12" />
        <g ref={part('head')}>
          <path d="M1004 595 L1228 568 L1004 642Z" fill={MOUTH} />
          <g ref={part('jaw')} transform={`translate(${HINGE[0]} ${HINGE[1]})`}>
            <path d={JAW} fill={BELLY} stroke={INK} strokeWidth={W} />
          </g>
          <path d={HEAD} fill={PINK} />
          <path d={THROAT} fill={BELLY} clipPath={`url(#${id}-head)`} />
          <path d="M1002 370 C1030 390 1046 420 1050 452" fill="none" stroke={SHINE} strokeWidth="16" />
          <path d="M1100 522 C1140 530 1180 536 1210 540" fill="none" stroke={SHINE} strokeWidth="10" />
          {/* The mouth line: a gentle smile from the beak back to her cheek. */}
          <path d="M1060 585 C1030 590 1000 592 982 584" fill="none" stroke={INK} strokeWidth={W * 0.75} />
          <ellipse ref={part('blush')} rx="32" ry="19" fill={BLUSH} opacity="0.55" transform="translate(893 604)" />
          <path d="M898 490 Q922 474 948 486" fill="none" stroke={INK} strokeWidth={W * 0.75} />
          <g ref={part('eyeOpen')}>
            <circle cx="935" cy="548" r="40" fill={INK} />
            <g ref={part('pupil')}>
              <circle cx="950" cy="532" r="13" fill="#fff" />
              <circle cx="922" cy="565" r="6" fill="#fff" />
            </g>
          </g>
          <path ref={part('eyeHappy')} d="M902 556 Q935 520 968 556" fill="none" stroke={INK} strokeWidth={W * 1.1} style={{ display: 'none' }} />
          {/* The spout: a puff of spray out of the blowhole, drawn upward from (0,0). */}
          <g ref={part('spout')} style={{ display: 'none' }}>
            <path d="M0 0 C-30 -60 -90 -110 -110 -170 C-80 -150 -40 -170 -20 -210 C0 -170 30 -170 40 -215 C60 -170 100 -160 120 -175 C100 -110 40 -60 0 0Z" fill="#BFE6FF" stroke={INK} strokeWidth={W * 0.8} />
            <circle cx="-120" cy="-215" r="14" fill="#BFE6FF" stroke={INK} strokeWidth={W * 0.6} />
            <circle cx="20" cy="-250" r="12" fill="#BFE6FF" stroke={INK} strokeWidth={W * 0.6} />
            <circle cx="135" cy="-215" r="11" fill="#BFE6FF" stroke={INK} strokeWidth={W * 0.6} />
          </g>
        </g>
      </g>
    </svg>
  )
})
