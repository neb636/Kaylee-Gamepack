// Rosa the pink river dolphin (a boto): a layered SVG puppet in side view, facing right, in the flat art style.
// Her body is one outline drawn every frame along a bendy spine, so she swims like a real dolphin: a wave runs from her
// shoulders down to her tail and the flukes whip up and down on a spring at the end of it. Her round melon head, long
// beak and cream belly flow into each other under one ink line. She breathes, blinks and watches her finger; her
// flipper paddles; her neck turns her head (real botos can turn their heads, unlike sea dolphins); her lower beak is
// hinged, so it opens with her voice. Actions: spout (a puff out of her blowhole), jump, nod, giggle, cheer.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { inkPass, useInk } from '../../../kit/ink'

export const ROSA_ACTIONS = { spout: 1.3, jump: 1.5, nod: 0.7, giggle: 1.1, cheer: 1.3 }

const INK = '#2B2330'
const PINK = '#FF7FAE'
const SHINE = '#FFB8D2'
const BELLY = '#FFD0BC'
const BLUSH = '#FF4F8E'
const MOUTH = '#B7356A'
const TONGUE = '#FF8FA8'
const W = 11

export const ROSA_VIEW = { x: 0, y: 300, w: 1260, h: 640 }
/** The blowhole, the beak tip and the middle of her body (for splashes and spouts, in viewBox units). */
export const ROSA_POINTS = { blowhole: [902, 344], beak: [1244, 552], middle: [640, 590] } as const

// ---- The spine: s = 0 at the root of the tail, s = 1 at the neck. ----
const N = 22
const X0 = 330
const X1 = 830
const restY = (s: number) => 612 - 30 * s - 18 * Math.sin(Math.PI * s)
/** Half-thickness above the spine: a slim tail stock swelling to a round back that rises into her forehead. */
const top = (s: number) => 24 + 112 * smooth(s / 0.75) + 42 * Math.max(0, (s - 0.72) / 0.28) ** 2
/** Half-thickness below the spine: a round tummy that tucks in a little at the throat. */
const under = (s: number) => 24 + 128 * smooth(s / 0.55) - 26 * smooth((s - 0.6) / 0.4)
/** How much of the underside is cream (countershading), fading out before the tail. */
const cream = (s: number) => under(s) * 0.58 * smooth((s - 0.04) / 0.5)
const NECK: [number, number] = [X1, restY(1)]
const REST_TAIL = Math.atan2(restY(1 / N) - restY(0), (X1 - X0) / N)
const REST_NECK = Math.atan2(restY(1) - restY(1 - 1 / N), (X1 - X0) / N)

type Pt = [number, number]
/** A smooth path through points (Catmull-Rom as cubic Béziers). `move` starts a new path, otherwise it continues. */
function through(pts: Pt[], move: boolean) {
  let d = move ? `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}` : `L${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    d += `C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

// ---- Rigid parts, each drawn around the point where it joins the body. ----
/** The flukes seen from the side: one little fork at the end of the tail stock, origin at the tail root. */
const FLUKES = 'M34 -20 C0 -26 -40 -60 -86 -112 C-100 -128 -126 -126 -124 -100 C-120 -62 -100 -24 -78 0 C-100 24 -120 62 -124 100 C-126 126 -100 128 -86 112 C-40 60 0 26 34 20Z'
/** The flipper, hanging down and back from its shoulder (origin), which hides inside the body. */
const FLIPPER = 'M-40 -24 C-30 50 -60 130 -104 190 C-118 210 -100 226 -78 216 C10 176 64 100 60 -20Z'
/** Head in her rest pose (absolute units): the back edge hides inside the body; a round melon; a soft scoop into the
 *  beak; the upper beak back along the mouth line to the corner; then the round chin. The lower beak is the jaw. */
const HEAD = 'M716 474 L800 440 L812 418 L830 404 C846 395 858 382 868 370 C890 348 912 334 940 334 C1018 332 1064 384 1072 440 C1078 478 1100 498 1142 510 C1184 520 1214 526 1234 532 C1256 538 1256 562 1232 564 C1160 570 1070 582 996 590 C1004 612 1034 638 1012 645 C990 652 950 668 920 686 C886 706 846 708 830 708 L760 704Z'
const HEAD_CREAM = 'M740 634 C820 640 900 636 960 622 C985 615 998 606 1004 598 L1070 598 L1070 760 L740 760Z'
/** The mouth corner, where the jaw hinges. */
const HINGE: Pt = [1000, 592]
/** The lower beak around the hinge: its top edge is the mouth line, its underside sweeps back into the chin. */
const JAW = 'M-24 -4 C70 -8 140 -16 200 -23 C220 -25 226 -8 206 -3 C150 10 92 28 34 46 C4 58 -36 56 -52 34 C-60 18 -44 -2 -24 -4Z'
const JAW_CREAM = 'M-70 22 C0 18 120 2 260 -14 L260 80 L-70 80Z'

type Part = 'root' | 'body' | 'bodyInk' | 'belly' | 'shine' | 'shine2' | 'tail' | 'head' | 'jaw' | 'flipper' | 'eyeOpen' | 'pupil' | 'eyeHappy' | 'spout' | 'blush' | 'smile'

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
  const st = useRef({ tail: spring(110, 9), flip: spring(70, 7), head: spring(80, 10), bend: spring(60, 9), jaw: 0, phase: 0, swim: 0 }).current
  const speedRef = useRef(speed)
  speedRef.current = speed
  const pts = useRef({ spine: [] as Pt[], up: [] as Pt[] }).current

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
      st.swim += (clamp(speedRef.current?.() ?? 0) - st.swim) * Math.min(1, dt * 3)
      const v = st.swim

      // Swimming: a wave runs from her shoulders to her tail, bigger and quicker the faster she goes.
      st.phase += dt * (2.3 + v * 4.5)
      const breath = Math.sin(t * 1.8)
      let amp = 30 + v * 34
      let sx = 1 + breath * 0.008
      let sy = 1 - breath * 0.012
      let y = Math.sin(st.phase + 1.2) * (4 + v * 4)
      let rot = Math.sin(st.phase + 0.6) * (0.8 + v)
      let arch = 0 // + bows her back up (both ends dip), - curls her nose and tail up
      let curl = 0 // + tail down, - tail up
      let shimmy = 0
      let flip = Math.sin(st.phase - 0.8) * (8 + v * 10)
      let head = Math.sin(t * 1.1) * 2 + look.y * 6
      let jaw = f.mouth * 18
      let happy = false
      let spout = 0
      let blush = 1
      let kick = 0 // extra fluke flick

      if (act === 'spout') {
        // Up for air: a small lift, the head tips up, the tail sinks, then "pfff" out of the blowhole.
        const up = bell(span(q, 0, 0.8))
        y -= up * 30
        head -= up * 9
        curl += up * 40
        spout = bell(span(q, 0.15, 0.9))
        kick = Math.sin(q * Math.PI * 4) * 14 * e
        if (q > 0.3) happy = true
      } else if (act === 'jump') {
        // Anticipation (a dip, the tail coils down), a big arc nose-up then nose-down with her back bowed, a stretch
        // on the way out, and a wobble as she lands.
        const dip = bell(span(q, 0, 0.18))
        const air = span(q, 0.18, 0.88)
        const land = wobble(span(q, 0.88, 1), 2)
        y += dip * 30 - Math.sin(Math.PI * air) * 330
        rot += air > 0 && air < 1 ? lerp(-38, 42, smooth(air)) : 0
        sx *= 1 + bell(air) * 0.06 - dip * 0.04 + land * 0.05
        sy *= 1 - bell(air) * 0.05 + dip * 0.06 - land * 0.06
        curl += dip * 70 - land * 40
        arch += bell(air) * 70
        amp *= 1 - bell(air) * 0.7
        kick = air > 0 && air < 1 ? Math.sin(air * Math.PI * 3) * 26 : 0
        flip -= bell(air) * 30
        happy = air > 0.1
        blush = 1 + bell(air) * 0.3
      } else if (act === 'nod') {
        head += Math.sin(q * Math.PI * 2) * 10
        curl -= Math.sin(q * Math.PI * 2) * 12
      } else if (act === 'giggle') {
        // A wriggle from nose to tail.
        rot += Math.sin(q * Math.PI * 9) * 2 * e
        y -= Math.abs(Math.sin(q * Math.PI * 9)) * 10 * e
        shimmy = 26 * e
        jaw = Math.max(jaw, 12 * e)
        happy = true
        blush = 1 + e * 0.35
      } else if (act === 'cheer') {
        // Crouch (tail curls under), pop up with her back bowed and her tail slapping, land with a wobble.
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.75))
        const land = wobble(span(q, 0.75, 1), 2)
        y += crouch * 16 - air * 90
        rot -= air * 10
        sx *= 1 + crouch * 0.05 - air * 0.03 + land * 0.04
        sy *= 1 - crouch * 0.06 + air * 0.05 - land * 0.05
        curl += crouch * 50 - air * 30
        arch += air * 40
        kick = Math.sin(q * Math.PI * 8) * 30 * e
        flip -= air * 34
        jaw = Math.max(jaw, 16 * e)
        happy = true
      }

      // The spine for this frame: the swim wave (held still at the neck), plus arch, curl and shimmy on springs. Her
      // nods and looks bend the front of the spine too, so the head and the body under it always turn together.
      const bend = st.bend.step(arch, dt)
      const nod = Math.tan((st.head.step(head, dt) * Math.PI) / 180) * ((X1 - X0) / 0.8)
      const spine = pts.spine
      const up = pts.up
      for (let i = 0; i <= N; i++) {
        const s = i / N
        const r = 1 - s
        let d = amp * r ** 1.7 * Math.sin(st.phase - 2.6 * r)
        d += bend * (((s - 0.55) / 0.55) ** 2 - 0.3)
        d += curl * r ** 2.2
        d += nod * Math.max(0, s - 0.6) ** 2
        d += shimmy * Math.sin(t * 26 - s * 7) * (0.3 + r * 0.7)
        spine[i] = [X0 + (X1 - X0) * s, restY(s) + d]
      }
      const top0: Pt[] = []
      const bot: Pt[] = []
      const inner: Pt[] = []
      const ridge: Pt[] = []
      const ridge2: Pt[] = []
      for (let i = 0; i <= N; i++) {
        const s = i / N
        const a = spine[Math.max(0, i - 1)]
        const b = spine[Math.min(N, i + 1)]
        const dx = b[0] - a[0]
        const dy = b[1] - a[1]
        const len = Math.hypot(dx, dy) || 1
        const n: Pt = [dy / len, -dx / len] // points up, out of her back
        up[i] = n
        const [px, py] = spine[i]
        top0.push([px + n[0] * top(s), py + n[1] * top(s)])
        bot.push([px - n[0] * under(s), py - n[1] * under(s)])
        if (s >= 0.08) inner.push([px - n[0] * (under(s) - cream(s)), py - n[1] * (under(s) - cream(s))])
        if (s >= 0.36 && s <= 0.72) ridge.push([px + n[0] * top(s) * 0.66, py + n[1] * top(s) * 0.66])
        if (s >= 0.14 && s <= 0.3) ridge2.push([px + n[0] * top(s) * 0.45, py + n[1] * top(s) * 0.45])
      }
      const outline = `${through(top0, true)}${through(bot.slice().reverse(), false)}Z`
      setA(p.body, 'd', outline)
      setA(p.bodyInk, 'd', outline)
      const bellyBack = bot.slice(N + 1 - inner.length).reverse()
      setA(p.belly, 'd', `${through(inner, true)}${through(bellyBack, false)}Z`)
      setA(p.shine, 'd', through(ridge, true))
      setA(p.shine2, 'd', through(ridge2, true))

      // The flukes ride the end of the tail and lag behind it (follow-through), with an extra flick when she kicks.
      const t0 = Math.atan2(spine[1][1] - spine[0][1], spine[1][0] - spine[0][0]) - REST_TAIL
      const fluke = st.tail.step((t0 * 180) / Math.PI * 1.5 + kick, dt)
      setT(p.tail, `translate(${spine[0][0].toFixed(1)} ${spine[0][1].toFixed(1)}) rotate(${fluke.toFixed(2)})`)
      // The flipper hangs from her chest.
      const fi = Math.round(N * 0.7)
      const fa = (Math.atan2(spine[fi + 1][1] - spine[fi - 1][1], spine[fi + 1][0] - spine[fi - 1][0]) * 180) / Math.PI
      const fs = under(0.7) * 0.5
      const fx = spine[fi][0] - up[fi][0] * fs
      const fy = spine[fi][1] - up[fi][1] * fs
      const fl = st.flip.step(flip, dt)
      setT(p.flipper, `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) rotate(${(fa + fl).toFixed(2)})`)
      // The head rides the neck, turned exactly as the front of the body is.
      const tn = Math.atan2(spine[N][1] - spine[N - 1][1], spine[N][0] - spine[N - 1][0]) - REST_NECK
      const hd = (tn * 180) / Math.PI
      setT(p.head, `translate(${(spine[N][0] - NECK[0]).toFixed(1)} ${(spine[N][1] - NECK[1]).toFixed(1)}) rotate(${hd.toFixed(2)} ${NECK[0]} ${NECK[1]})`)
      st.jaw += (jaw - st.jaw) * Math.min(1, dt * 22)
      setT(p.jaw, `translate(${HINGE[0]} ${HINGE[1]}) rotate(${Math.max(0, st.jaw).toFixed(2)})`)

      const cx = 640
      const cy = 620
      setT(p.root, `translate(0 ${y.toFixed(1)}) rotate(${rot.toFixed(2)} ${cx} ${cy}) translate(${cx} ${cy}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${-cx} ${-cy})`)
      setT(p.blush, `translate(902 606) scale(${blush.toFixed(3)})`)
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
        <clipPath id={`${id}-head`}>
          <path d={HEAD} />
        </clipPath>
        <clipPath id={`${id}-jaw`}>
          <path d={JAW} />
        </clipPath>
      </defs>
      <g ref={part('root')} strokeLinejoin="round" strokeLinecap="round">
        {/* One outline around tail, body, flipper and head together (see kit/ink.ts), so she reads as one dolphin. */}
        <g {...inkPass(W / 2, INK)}>
          <g ref={ink.twin('tail')}>
            <path d={FLUKES} />
          </g>
          <g ref={ink.twin('flipper')}>
            <path d={FLIPPER} />
          </g>
          <path ref={part('bodyInk')} />
          <g ref={ink.twin('head')}>
            <path d={HEAD} />
            <g ref={ink.twin('jaw')} transform={`translate(${HINGE[0]} ${HINGE[1]})`}>
              <path d={JAW} />
            </g>
          </g>
        </g>
        <g ref={part('tail')}>
          <path d={FLUKES} fill={PINK} />
          <path d="M-20 -36 C-46 -60 -70 -86 -92 -108 M-20 36 C-46 60 -70 86 -92 108" fill="none" stroke={SHINE} strokeWidth="12" />
        </g>
        {/* The flipper's fill sits under the body's, so its root tucks into her chest and only the paddle shows. */}
        <g ref={part('flipper')}>
          <path d={FLIPPER} fill={PINK} />
          <path d="M-10 40 C-20 90 -44 140 -72 180" fill="none" stroke={SHINE} strokeWidth="12" />
        </g>
        <path ref={part('body')} fill={PINK} />
        <path ref={part('belly')} fill={BELLY} />
        <path ref={part('shine')} fill="none" stroke={SHINE} strokeWidth="18" />
        <path ref={part('shine2')} fill="none" stroke={SHINE} strokeWidth="12" />
        <g ref={part('head')}>
          {/* Inside her mouth (shows when the jaw drops), then the jaw, then the head over its back end. */}
          <path d="M984 590 L1226 564 C1150 600 1060 632 1004 640Z" fill={MOUTH} />
          <ellipse cx="1050" cy="616" rx="50" ry="16" fill={TONGUE} transform="rotate(-8 1050 616)" />
          <g ref={part('jaw')} transform={`translate(${HINGE[0]} ${HINGE[1]})`}>
            <path d={JAW} fill={PINK} />
            <path d={JAW_CREAM} fill={BELLY} clipPath={`url(#${id}-jaw)`} />
          </g>
          <path d={HEAD} fill={PINK} />
          <path d={HEAD_CREAM} fill={BELLY} clipPath={`url(#${id}-head)`} />
          {/* Paint over the head's back edge, where it lies on her body, so no hairline seam shows. */}
          <path d="M759 700 L747 638" fill="none" stroke={BELLY} strokeWidth="5" />
          <path d="M746 628 L716 474 L800 440 L808 428" fill="none" stroke={PINK} strokeWidth="5" />
          <path d="M990 370 C1024 392 1044 420 1050 452" fill="none" stroke={SHINE} strokeWidth="18" />
          <path d="M1120 514 C1160 524 1196 530 1220 536" fill="none" stroke={SHINE} strokeWidth="10" />
          {/* The mouth line, curling up into a smile at the corner. */}
          <path ref={part('smile')} d="M1222 565 C1150 572 1060 582 998 590 C986 592 980 586 980 578" fill="none" stroke={INK} strokeWidth={W * 0.75} />
          <ellipse ref={part('blush')} rx="34" ry="20" fill={BLUSH} opacity="0.5" transform="translate(902 606)" />
          <path d="M896 488 Q922 470 950 484" fill="none" stroke={INK} strokeWidth={W * 0.75} />
          <g ref={part('eyeOpen')}>
            <circle cx="935" cy="548" r="42" fill={INK} />
            <g ref={part('pupil')}>
              <circle cx="951" cy="531" r="14" fill="#fff" />
              <circle cx="921" cy="566" r="6.5" fill="#fff" />
            </g>
          </g>
          <path ref={part('eyeHappy')} d="M900 556 Q935 518 970 556" fill="none" stroke={INK} strokeWidth={W * 1.1} style={{ display: 'none' }} />
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
