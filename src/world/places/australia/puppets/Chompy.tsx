// Chompy the mama crocodile: a layered SVG puppet in side view, facing right. She breathes, blinks, watches her finger,
// her tail sways on springs (it lags and swishes after every move), and her long lower jaw is hinged: it opens with her
// voice and wider as a baby comes near her snout. Actions: snap, gulp, swim, cheer, dance, wiggle, nod.
// `inMouth` shows babies peeking out between her teeth; `babies` rides them on her head and back.
import { forwardRef, useId, useRef, type CSSProperties } from 'react'
import { bell, clamp, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { art } from '../art'

export interface ChompyProps {
  height: string
  style?: CSSProperties
  /** Babies peeking out of her mouth (0-3): mama crocs carry their hatchlings to the water in their mouths. */
  inMouth?: number
  /** Babies riding on her head and back (0-3). */
  babies?: number
}

const INK = '#2F2A2E'
const SKIN = '#8FD6A8'
const SKIN_DARK = '#6CBF8C'
const BELLY = '#FBEA9A'
const PINK = '#FF8FB8'
const BOW = '#FF4F9A'
const MOUTH = '#B93B63'
const TOOTH = '#FFF7F0'
const W = 5

// Key points (viewBox 0 0 720 400, ground at y = 380).
const HIP: [number, number] = [182, 268] // where the tail joins the body
const NECK: [number, number] = [430, 262] // the head turns here
const HINGE: [number, number] = [472, 262] // the lower jaw turns here
const UPPER_TIP: [number, number] = [664, 256]
const JAW_LEN = 186

const BODY = 'M156 276 C150 208 236 186 318 186 C398 186 450 214 454 266 C458 322 404 348 316 350 C230 352 160 340 156 276Z'
const BELLY_PATH = 'M176 300 C222 330 300 340 362 336 C404 332 436 318 452 290 C448 334 402 350 316 350 C236 352 184 338 176 300Z'
// A big round dome of a head with the long snout reaching forward to an upturned nose bump.
const HEAD = 'M398 228 C388 160 428 112 484 112 C540 112 568 150 572 196 C606 200 640 204 662 214 C686 224 684 256 660 258 L482 262 C434 266 404 258 398 228Z'
const EYE_BUMP_FAR = 'M524 164 C520 130 552 118 570 136 C584 150 580 176 566 184Z'
const NOSE_BUMP = 'M626 214 C620 186 664 178 676 204 C682 218 674 228 660 228Z'
// Lower jaw, drawn around its hinge (0,0) closed: tucked under the snout, with a pale chin and throat.
const JAW = 'M-26 -2 C-24 26 10 42 60 42 C110 42 158 30 186 10 C196 2 192 -8 180 -8 L-10 -8 C-22 -8 -26 -6 -26 -2Z'
const CHIN = 'M-22 12 C-6 34 30 42 60 42 C110 42 158 30 186 10 C176 26 140 18 100 20 C50 22 6 22 -22 12Z'
// Teeth: small rounded cream bumps. Upper ones hang from the upper jaw line, lower ones sit on the jaw.
const UPPER_TEETH = [510, 556, 602, 642]
const LOWER_TEETH = [40, 84, 128, 166]
// Dark green spots on her back.
const SPOTS: [number, number, number, number][] = [
  [228, 232, 16, 11],
  [270, 210, 13, 9],
  [312, 236, 18, 12],
  [356, 212, 14, 10],
  [250, 270, 12, 8],
  [398, 240, 12, 9],
  [336, 280, 11, 8],
]

/** The tail as one tapered shape curling up behind her, bent a little more by `a` (base) and `b` (tip), in degrees. */
const TAIL_N = 16
function tailPath(a: number, b: number) {
  const pts: [number, number, number][] = []
  let x = HIP[0] + 20
  let y = HIP[1] + 6
  let ang = Math.PI + 0.12 // leaving the hip to the left, then curling up
  const len = 255
  for (let i = 0; i <= TAIL_N; i++) {
    const u = i / TAIL_N
    pts.push([x, y, ang])
    ang += 0.075 * (0.4 + u * 1.4) + ((a * (1 - u) + b * u) * Math.PI) / 180 / TAIL_N
    x += Math.cos(ang) * (len / TAIL_N)
    y += Math.sin(ang) * (len / TAIL_N)
  }
  const width = (u: number) => lerp(58, 8, u ** 0.85)
  // `side` = +1 is the outside (bottom) edge, -1 the inside (top) edge; `k` scales how far out from the middle.
  const edge = (side: number, k = 1) =>
    pts.map(([px, py, pa], i) => {
      const w = width(i / TAIL_N) * k * side
      return `${(px - Math.sin(pa) * w).toFixed(1)} ${(py + Math.cos(pa) * w).toFixed(1)}`
    })
  const top = edge(-1)
  const bottom = edge(1)
  const [tx, ty, ta] = pts[TAIL_N]
  const cap = `Q${(tx + Math.cos(ta) * 12).toFixed(1)} ${(ty + Math.sin(ta) * 12).toFixed(1)} `
  const d = `M${top.join(' L')} ${cap}${bottom[TAIL_N]} L${[...bottom].reverse().join(' L')}Z`
  // The pale underside: a band along the outside of the curl.
  const inner = edge(-1, 0.3)
  const band = `M${top.join(' L')} L${[...inner].reverse().join(' L')}Z`
  return { d, band, pts, width }
}

type Part =
  | 'root'
  | 'body'
  | 'tail'
  | 'tailBand'
  | 'tailLine'
  | 'tailSpots'
  | 'tailBumps'
  | 'head'
  | 'jaw'
  | 'mouth'
  | 'legFL'
  | 'legFR'
  | 'legBL'
  | 'legBR'
  | 'blush'
  | 'bow'
  | 'rider0'
  | 'rider1'
  | 'rider2'
  | `eye${'N' | 'F'}${'Open' | 'Pupil' | 'Lid' | 'Happy'}`

/** Chompy the crocodile. Actions: snap, gulp, swim, cheer, dance, wiggle, nod. Voice: chompy. */
export const Chompy = forwardRef<PuppetHandle, ChompyProps>(function Chompy({ height, style, inMouth = 0, babies = 0 }, ref) {
  const id = useId().replace(/:/g, '')
  const st = useRef({ tailA: spring(60, 6), tailB: spring(40, 4.5), rootRot: 0, jaw: 0 }).current
  const props = useRef({ inMouth, babies })
  props.current = { inMouth, babies }

  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'chompy',
    actions: { snap: 1.0, gulp: 1.0, swim: 2.2, cheer: 1.1, dance: 1.8, wiggle: 0.7, nod: 0.7 },
    eyes: [510, 170],
    reach: [630, 262],
    frame: (f, p) => {
      const { t, dt, look } = f
      const q = f.p
      const act = f.action
      const env = smooth(span(q, 0, 0.15)) * (1 - smooth(span(q, 0.85, 1)))

      // Idle: slow breathing, a lazy tail sway, the head bobbing a little.
      const breath = Math.sin(t * 1.9)
      let sx = 1 - breath * 0.006
      let sy = 1 + breath * 0.014
      let rootY = 0
      let rootX = 0
      let rootRot = 0
      let headRot = Math.sin(t * 1.1) * 1.5 + look.y * 2
      let tailTarget = Math.sin(t * 1.3) * 10
      let tipTarget = Math.sin(t * 1.3 - 0.8) * 16
      let jaw = f.mouth * 16 + (props.current.inMouth > 0 ? 10 : 0)
      let legSwing = 0
      let paddle = 0
      let eye: 'open' | 'happy' = 'open'
      let blush = 1
      let bow = Math.sin(t * 2.2) * 2

      // A baby coming close to her snout: she lifts her head and opens wide, gently.
      if (f.near > 0.05 && !act) {
        const n = (f.near - 0.05) / 0.95
        jaw = Math.max(jaw, 8 + 26 * n)
        headRot -= 5 * n
      }

      if (act === 'snap') {
        // Anticipation: the head dips back a little, then the jaw swings wide and slams shut.
        const dip = bell(span(q, 0, 0.14))
        const open = smooth(span(q, 0.1, 0.34))
        const shut = span(q, 0.34, 0.41)
        const settle = wobble(span(q, 0.41, 1), 2)
        jaw = shut > 0 ? lerp(38, 0, shut) : 38 * open
        headRot += 5 * dip - 10 * open * (1 - shut) + settle * 3
        sx *= 1 + (shut > 0 ? settle * 0.04 : -0.03 * open)
        sy *= 1 + (shut > 0 ? -settle * 0.05 : 0.04 * open)
        tipTarget += shut > 0 ? 40 * (1 - span(q, 0.4, 0.6)) : 0
        if (shut >= 1 && q < 0.8) eye = 'happy'
      } else if (act === 'gulp') {
        const open = bell(span(q, 0, 0.6))
        jaw = Math.max(jaw, 24 * open)
        headRot += -6 * open + wobble(span(q, 0.6, 1), 2) * 3
        if (q > 0.55) eye = 'happy'
        blush = 1 + 0.4 * env
        tailTarget += 14 * bell(span(q, 0.5, 1))
      } else if (act === 'swim') {
        const s = q * Math.PI * 6
        rootRot += Math.sin(s) * 3 * env
        rootY += Math.sin(s * 2) * 6 * env
        rootX += Math.sin(s) * 6 * env
        tailTarget += Math.sin(s) * 34 * env
        tipTarget += Math.sin(s - 1) * 50 * env
        paddle = Math.sin(s * 1.5) * 38 * env
        legSwing = -20 * env
        headRot += Math.sin(s + 0.5) * 3 * env
        eye = 'happy'
      } else if (act === 'cheer') {
        const crouch = bell(span(q, 0, 0.2))
        const air = bell(span(q, 0.2, 0.7))
        const land = wobble(span(q, 0.7, 1), 2)
        sx *= 1 + crouch * 0.06 - air * 0.03 + land * 0.05
        sy *= 1 - crouch * 0.1 + air * 0.06 - land * 0.07
        rootY -= air * 50
        rootRot -= air * 5
        jaw = Math.max(jaw, 22 * env)
        tipTarget += Math.sin(q * Math.PI * 6) * 40 * env
        legSwing = air * 30
        eye = 'happy'
      } else if (act === 'dance') {
        const beat = q * Math.PI * 8
        rootRot += Math.sin(beat / 2) * 6 * bell(q)
        rootY -= Math.abs(Math.sin(beat)) * 12 * env
        tailTarget += Math.sin(beat / 2) * 30 * env
        tipTarget += Math.sin(beat / 2 - 1) * 40 * env
        jaw = Math.max(jaw, 14 * env + Math.abs(Math.sin(beat)) * 10 * env)
        legSwing = Math.sin(beat) * 20 * env
        eye = 'happy'
      } else if (act === 'wiggle') {
        const w = wobble(q, 3)
        sx *= 1 + 0.05 * w
        sy *= 1 - 0.05 * w
        rootRot += w * 4
        tipTarget += w * 30
      } else if (act === 'nod') {
        headRot += bell(q) * 10
      }

      // Follow-through: the tail lags behind the body and swishes when it rotates or lands.
      const vel = (rootRot - st.rootRot) / Math.max(dt, 0.001)
      st.rootRot = rootRot
      const ta = st.tailA.step(tailTarget - vel * 0.6 + rootY * 0.15, dt)
      const tb = st.tailB.step(tipTarget - vel * 0.9 + rootY * 0.3, dt)
      const tail = tailPath(ta, tb)
      setA(p.tail, 'd', tail.d)
      setA(p.tailBand, 'd', tail.band)
      setA(p.tailLine, 'd', tail.d)
      // Bumps along the inside of the curl and spots on the tail follow the curve.
      const place = (group: Element | undefined, from: number, step: number, out: number) => {
        const kids = group?.children
        if (!kids) return
        for (let i = 0; i < kids.length; i++) {
          const k = from + i * step
          const [px, py, pa] = tail.pts[k]
          const w = tail.width(k / TAIL_N) * out
          kids[i].setAttribute('transform', `translate(${(px - Math.sin(pa) * w).toFixed(1)} ${(py + Math.cos(pa) * w).toFixed(1)}) rotate(${((pa * 180) / Math.PI + (out > 0 ? 0 : 180)).toFixed(1)}) scale(${(1 - k / (TAIL_N * 1.5)).toFixed(3)})`)
        }
      }
      place(p.tailBumps, 1, 2, 0.97)
      place(p.tailSpots, 2, 3, 0.2)

      st.jaw += (jaw - st.jaw) * Math.min(1, dt * 22)
      const j = Math.max(0, st.jaw)
      setT(p.root, `translate(${rootX} ${rootY}) rotate(${rootRot} 310 380) translate(310 380) scale(${sx} ${sy}) translate(-310 -380)`)
      setT(p.head, `rotate(${headRot} ${NECK[0]} ${NECK[1]})`)
      setT(p.jaw, `translate(${HINGE[0]} ${HINGE[1]}) rotate(${j})`)
      // The inside of the mouth: from the hinge along the upper jaw to the tip, back along the open lower jaw.
      const a = (j * Math.PI) / 180
      const lx = HINGE[0] + Math.cos(a) * JAW_LEN
      const ly = HINGE[1] + Math.sin(a) * JAW_LEN
      // The front of the open mouth bows forward in a soft curve instead of a straight cut.
      const fx = (UPPER_TIP[0] - 8 + lx) / 2 + 22 * Math.cos(a / 2)
      const fy = (UPPER_TIP[1] + 2 + ly) / 2 + 22 * Math.sin(a / 2)
      setA(p.mouth, 'd', `M${HINGE[0] - 10} ${HINGE[1] - 4} L${UPPER_TIP[0] - 8} ${UPPER_TIP[1] + 2} Q${fx} ${fy} ${lx} ${ly} Z`)
      show(p.mouth, j > 1.5)
      // Legs swing together for hops and dances, and paddle in turn (diagonal pairs) when she swims.
      setT(p.legFL, `rotate(${legSwing + paddle} 404 300)`)
      setT(p.legBL, `rotate(${legSwing - paddle} 226 300)`)
      setT(p.legFR, `rotate(${-legSwing * 0.8 - paddle} 436 296)`)
      setT(p.legBR, `rotate(${-legSwing * 0.8 + paddle} 258 296)`)
      setT(p.blush, `translate(478 222) scale(${blush})`)
      setT(p.bow, `rotate(${bow} 452 118)`)

      // Babies riding on her back bob out of time with each other.
      for (let i = 0; i < 3; i++) {
        const r = p[`rider${i}` as Part]
        show(r, i < props.current.babies)
        setT(r, `translate(0 ${Math.sin(t * 3 + i * 1.7) * 3 - Math.max(0, -rootY) * 0.2 * i})`)
      }

      for (const side of ['N', 'F'] as const) {
        show(p[`eye${side}Open`], eye === 'open')
        show(p[`eye${side}Happy`], eye === 'happy')
        setT(p[`eye${side}Pupil`], `translate(${look.x * 3} ${look.y * 3})`)
        const closure = 1 - f.blink
        setA(p[`eye${side}Lid`], 'height', 44 * clamp(closure))
      }
    },
  })

  // Big eyes like the art: a white eye with a dark iris looking forward, two shines, and lashes.
  const eye = (side: 'N' | 'F', x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <clipPath id={`${id}-eye${side}`}>
        <ellipse rx="22" ry="25" />
      </clipPath>
      <g ref={part(`eye${side}Open`)}>
        <ellipse rx="22" ry="25" fill="#fff" stroke={INK} strokeWidth="4.5" />
        <g ref={part(`eye${side}Pupil`)}>
          <ellipse cx="3" cy="2" rx="16" ry="19" fill={INK} />
          <circle cx="-2" cy="-6" r="6" fill="#fff" />
          <circle cx="8" cy="8" r="2.6" fill="#fff" />
        </g>
        <rect ref={part(`eye${side}Lid`)} x="-26" y="-27" width="52" height="0" fill={SKIN} clipPath={`url(#${id}-eye${side})`} />
        {side === 'N' && <path d="M-16 -18 L-24 -26 M-20 -8 L-30 -12" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />}
      </g>
      <path ref={part(`eye${side}Happy`)} d="M-16 4 Q0 -16 16 4" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" style={{ display: 'none' }} />
    </g>
  )

  // Chunky legs with cream toenails.
  const leg = (name: Part, x: number, y: number, far: boolean) => (
    <g ref={part(name)}>
      <path d={`M${x - 30} ${y} C${x - 42} ${y + 26} ${x - 38} ${y + 56} ${x - 30} ${y + 72} C${x - 26} ${y + 84} ${x + 40} ${y + 84} ${x + 42} ${y + 72} C${x + 44} ${y + 62} ${x + 34} ${y + 54} ${x + 32} ${y + 44} C${x + 38} ${y + 30} ${x + 36} ${y + 10} ${x + 28} ${y}Z`} fill={far ? SKIN_DARK : SKIN} stroke={INK} strokeWidth={W} strokeLinejoin="round" />
      {[x - 12, x + 6, x + 24].map((tx) => (
        <path key={tx} d={`M${tx - 8} ${y + 80} Q${tx - 8} ${y + 68} ${tx} ${y + 68} Q${tx + 8} ${y + 68} ${tx + 8} ${y + 80}Z`} fill={TOOTH} stroke={INK} strokeWidth="3.2" />
      ))}
      {!far && <ellipse cx={x - 4} cy={y + 30} rx="10" ry="7" fill={SKIN_DARK} />}
    </g>
  )

  // A tiny hatchling head peeking out between her teeth.
  const peek = (x: number, i: number) => (
    <g key={i} transform={`translate(${x} ${HINGE[1] + 8}) rotate(${(i - 1) * 8}) scale(1.3)`}>
      <path d="M-24 10 C-26 -14 -14 -24 0 -24 C14 -24 26 -14 24 10Z" fill={SKIN} stroke={INK} strokeWidth="4" />
      <circle cx="-9" cy="-8" r="5.5" fill={INK} />
      <circle cx="9" cy="-8" r="5.5" fill={INK} />
      <circle cx="-10" cy="-10" r="2" fill="#fff" />
      <circle cx="8" cy="-10" r="2" fill="#fff" />
      <ellipse cx="-15" cy="1" rx="4.5" ry="3" fill={PINK} />
      <ellipse cx="15" cy="1" rx="4.5" ry="3" fill={PINK} />
      <path d="M-5 2 Q0 7 5 2" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </g>
  )

  // Where babies ride: on her back, her neck, and the top of her head.
  const RIDERS = [
    { x: 250, y: 118, h: 84 },
    { x: 340, y: 116, h: 84 },
    { x: 548, y: 64, h: 76 },
  ]

  return (
    <svg ref={svg} viewBox="0 0 720 400" aria-label="Chompy the crocodile" style={{ height, aspectRatio: '720 / 400', overflow: 'visible', display: 'block', ...style }}>
      <g ref={part('root')} strokeLinejoin="round">
        {/* Far legs, then the tail, then the body over the tail's base. */}
        {leg('legFR', 436, 296, true)}
        {leg('legBR', 258, 296, true)}
        <g ref={part('tailBumps')}>
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d="M-16 4 Q-16 22 0 22 Q16 22 16 4Z" fill={SKIN_DARK} stroke={INK} strokeWidth="4.5" />
          ))}
        </g>
        <path ref={part('tail')} d={tailPath(0, 0).d} fill={SKIN} />
        <path ref={part('tailBand')} d={tailPath(0, 0).band} fill={BELLY} />
        {/* The outline again on top, so the pale band doesn't cover half of it. */}
        <path ref={part('tailLine')} d={tailPath(0, 0).d} fill="none" stroke={INK} strokeWidth={W} />
        <g ref={part('tailSpots')}>
          {Array.from({ length: 5 }, (_, i) => (
            <ellipse key={i} rx="13" ry="9" fill={SKIN_DARK} />
          ))}
        </g>
        <g ref={part('body')}>
          {/* Bumps along her back */}
          {[
            [206, 204],
            [242, 194],
            [278, 190],
            [314, 189],
            [350, 192],
            [386, 200],
          ].map(([x, y]) => (
            <path key={x} d={`M${x - 19} ${y + 10} Q${x - 19} ${y - 18} ${x} ${y - 18} Q${x + 19} ${y - 18} ${x + 19} ${y + 10}Z`} fill={SKIN_DARK} stroke={INK} strokeWidth="4.5" />
          ))}
          <path d={BODY} fill={SKIN} stroke={INK} strokeWidth={W} />
          <path d={BELLY_PATH} fill={BELLY} />
          {SPOTS.map(([x, y, rx, ry]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx={rx} ry={ry} fill={SKIN_DARK} />
          ))}
        </g>
        {leg('legBL', 226, 300, false)}
        <g ref={part('head')}>
          {/* Lower jaw and the inside of the mouth sit behind the upper head. */}
          <path ref={part('mouth')} fill={MOUTH} stroke={INK} strokeWidth="4" style={{ display: 'none' }} />
          <g ref={part('jaw')} transform={`translate(${HINGE[0]} ${HINGE[1]})`}>
            <path d="M24 -6 C40 -26 110 -30 150 -12 L150 -6Z" fill="#FF8FA8" stroke={INK} strokeWidth="3.5" />
            {LOWER_TEETH.map((x) => (
              <path key={x} d={`M${x - 8} -6 Q${x} -22 ${x + 8} -6Z`} fill={TOOTH} stroke={INK} strokeWidth="3" />
            ))}
            <path d={JAW} fill={SKIN} stroke={INK} strokeWidth={W} />
            <path d={CHIN} fill={BELLY} />
          </g>
          <path d={EYE_BUMP_FAR} fill={SKIN} stroke={INK} strokeWidth={W} />
          <path d={HEAD} fill={SKIN} stroke={INK} strokeWidth={W} />
          {UPPER_TEETH.map((x) => (
            <path key={x} d={`M${x - 9} ${UPPER_TIP[1] - 2} Q${x} ${UPPER_TIP[1] + 20} ${x + 9} ${UPPER_TIP[1] - 2}Z`} fill={TOOTH} stroke={INK} strokeWidth="3" />
          ))}
          {/* Babies peek out between her lips. */}
          {Array.from({ length: Math.min(3, inMouth) }, (_, i) => peek(526 + i * 54, i))}
          <path d={NOSE_BUMP} fill={SKIN} stroke={INK} strokeWidth={W} />
          {/* The nose bump melts into the snout. */}
          <path d="M628 222 C640 226 660 228 672 224 L672 240 L628 240Z" fill={SKIN} />
          <ellipse cx="652" cy="206" rx="6" ry="8" fill={INK} />
          {eye('F', 550, 162, 0.82)}
          {eye('N', 506, 168, 1)}
          {/* A big smile curling up at the back of her mouth. */}
          <path d="M482 262 C470 262 456 256 450 244" fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <path d="M586 222 Q602 216 618 222" fill="none" stroke={SKIN_DARK} strokeWidth="5" strokeLinecap="round" />
          <ellipse ref={part('blush')} rx="20" ry="12" fill={PINK} opacity="0.85" transform="translate(478 222)" />
          <g ref={part('bow')}>
            <path d="M452 118 C424 88 406 120 418 134 C428 146 446 128 452 118Z M452 118 C474 84 500 108 490 128 C482 144 460 128 452 118Z" fill={BOW} stroke={INK} strokeWidth="4.5" />
            <circle cx="452" cy="120" r="10" fill={BOW} stroke={INK} strokeWidth="4.5" />
          </g>
        </g>
        {leg('legFL', 404, 300, false)}
        {RIDERS.map((r, i) => (
          <g key={i} ref={part(`rider${i}` as Part)} style={{ display: 'none' }}>
            <image href={art.babyCroc} x={r.x - r.h / 2} y={r.y} width={r.h} height={r.h} />
          </g>
        ))}
      </g>
    </svg>
  )
})
