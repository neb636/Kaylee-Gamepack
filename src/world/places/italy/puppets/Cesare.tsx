// Cesare, a big fluffy orange tabby from the ruins of Rome who thinks he is the emperor: a layered SVG puppet (reference:
// art/source/world/italy/cesare.png). He sits like a real cat (front legs straight down, big haunches, a curled striped
// tail) and wears a laurel crown that rides on a spring. His eyes are half-closed and proud most of the time, and he does
// the slow cat blink. Big moments: `call` (one paw high, then points: "Door two!"), `bow` (a slow, grand bow) and `flick`
// (an annoyed tail flick with the ears back). `hot` makes him fan himself with a paw, ears drooping, tongue out.
import { forwardRef, useId, useRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, TONGUE, useInk } from './ink'

export const CESARE_ACTIONS: Record<string, number> = { hop: 0.8, cheer: 1.2, wave: 1.4, call: 1.2, flick: 0.9, bow: 1.8, nod: 0.7, wiggle: 0.8, blink: 1.2 }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'earL' | 'earR' | 'crown' | 'tail' | 'armL' | 'armR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'pupilL' | 'pupilR' | 'lidL' | 'lidR' | 'lidLineL' | 'lidLineR'
  | 'mouth' | 'tongueOpen' | 'tongueOut' | 'smile' | 'sweat'

const FUR = '#F7A85C'
const FUR_SHADE = '#EC9045'
const STRIPE = '#E27F34'
const CREAM = '#FCE7C6'
const CREAM_SHADE = '#F4D3A6'
const EAR_IN = '#F8B4B4'
const IRIS = '#8DB25A'
const NOSE = '#F09A9A'
const LEAF = '#86AE4E'
const LEAF_SHADE = '#6A9238'
const DROP = '#8FD3F2'

/** A closed shape with a tufty (fluffy fur) edge: every side between two points becomes a little pointed tuft. */
function tufts(points: [number, number][], amp = 0.2) {
  const n = points.length
  const cx = points.reduce((s, p) => s + p[0], 0) / n
  const cy = points.reduce((s, p) => s + p[1], 0) / n
  const f = (v: number) => v.toFixed(1)
  let d = `M${f(points[0][0])} ${f(points[0][1])}`
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % n]
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const len = Math.hypot(x2 - x1, y2 - y1)
    let nx = -(y2 - y1) / len
    let ny = (x2 - x1) / len
    if (nx * (mx - cx) + ny * (my - cy) < 0) ((nx = -nx), (ny = -ny))
    const tx = mx + nx * len * amp + (x2 - x1) * 0.12
    const ty = my + ny * len * amp + (y2 - y1) * 0.12
    const b = len * 0.1
    d += ` Q${f((x1 + tx) / 2 + nx * b)} ${f((y1 + ty) / 2 + ny * b)} ${f(tx)} ${f(ty)} Q${f((tx + x2) / 2 + nx * b * 0.4)} ${f((ty + y2) / 2 + ny * b * 0.4)} ${f(x2)} ${f(y2)}`
  }
  return d + 'Z'
}
/** A closed shape with a soft rounded edge: each side bulges out a little. */
function soft(points: [number, number][], amp = 0.12) {
  const n = points.length
  const cx = points.reduce((s, p) => s + p[0], 0) / n
  const cy = points.reduce((s, p) => s + p[1], 0) / n
  let d = `M${points[0][0]} ${points[0][1]}`
  for (let i = 0; i < n; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % n]
    const mx = (x1 + x2) / 2
    const my = (y1 + y2) / 2
    const len = Math.hypot(x2 - x1, y2 - y1)
    let nx = -(y2 - y1) / len
    let ny = (x2 - x1) / len
    if (nx * (mx - cx) + ny * (my - cy) < 0) ((nx = -nx), (ny = -ny))
    d += ` Q${(mx + nx * len * amp).toFixed(1)} ${(my + ny * len * amp).toFixed(1)} ${x2} ${y2}`
  }
  return d + 'Z'
}

// Shapes (viewBox 400 x 480, paws at y 470). A big wide fluffy head with cheek ruffs, on a pear-shaped sitting body.
const HEAD = tufts([
  [200, 64], [244, 68], [280, 86], [304, 116], [318, 150], [336, 176], [318, 194], [326, 214], [298, 230], [286, 250], [244, 266], [200, 270],
  [156, 266], [114, 250], [102, 230], [74, 214], [82, 194], [64, 176], [82, 150], [96, 116], [120, 86], [156, 68],
], 0.14)
const MUZZLE = soft([[200, 178], [232, 186], [252, 206], [244, 228], [218, 240], [200, 242], [182, 240], [156, 228], [148, 206], [168, 186]], 0.12)
// Ear, drawn with its base at 0,0 pointing up.
const EAR = 'M-38 16 C-36 -22 -22 -60 -2 -82 C4 -86 10 -84 14 -78 C30 -50 40 -18 40 16 Z'
const EAR_INNER = 'M-24 8 C-22 -18 -12 -48 2 -64 C14 -44 24 -18 24 8 Z'
const BODY = tufts([[156, 232], [244, 232], [282, 268], [304, 326], [326, 388], [334, 440], [314, 468], [86, 468], [66, 440], [74, 388], [96, 326], [118, 268]], 0.05)
const CHEST = tufts([[136, 236], [170, 246], [200, 242], [230, 246], [264, 236], [268, 286], [256, 336], [238, 384], [200, 426], [162, 384], [144, 336], [132, 286]], 0.16)
// The fluffy front of his chest ruff: drawn over the tops of his front legs, so they grow out of the fluff.
const CHEST_FRONT = tufts([[146, 300], [174, 312], [200, 306], [226, 312], [254, 300], [250, 334], [230, 356], [200, 364], [170, 356], [150, 334]], 0.18)
const HAUNCH = soft([[-70, 10], [-56, -46], [-10, -72], [40, -56], [62, -6], [56, 48], [-62, 48]], 0.14)
// A front leg, from the shoulder (0,0) straight down to the paw (about 160 long).
const LEG = soft([[-15, -6], [0, -12], [15, -6], [18, 56], [18, 116], [-18, 116], [-18, 56]], 0.06)
const PAW = soft([[-30, 4], [-24, -12], [0, -18], [24, -12], [30, 4], [20, 16], [-20, 16]], 0.14)
// The tail curls up the right side from its base (0,0).
const TAIL = 'M-10 8 C30 14 78 -4 90 -50 C102 -96 88 -142 60 -160 C42 -172 22 -164 24 -148 C26 -136 44 -130 50 -116 C62 -88 58 -52 38 -34 C22 -20 -4 -14 -16 -12 Z'
// The laurel crown: two leafy sprigs that meet at the back of his head.
// Each sprig runs from near the top of his head down the side (a quadratic curve), with leaves on both sides of it.
const STEM = { a: [-22, -6], c: [-84, -14], b: [-112, 60] } as const
const SPRIG: [number, number, number, number][] = [0.1, 0.32, 0.54, 0.76, 0.98].flatMap((u, i) => {
  const x = (1 - u) ** 2 * STEM.a[0] + 2 * u * (1 - u) * STEM.c[0] + u * u * STEM.b[0]
  const y = (1 - u) ** 2 * STEM.a[1] + 2 * u * (1 - u) * STEM.c[1] + u * u * STEM.b[1]
  const tx = 2 * (1 - u) * (STEM.c[0] - STEM.a[0]) + 2 * u * (STEM.b[0] - STEM.c[0])
  const ty = 2 * (1 - u) * (STEM.c[1] - STEM.a[1]) + 2 * u * (STEM.b[1] - STEM.c[1])
  const ang = (Math.atan2(ty, tx) * 180) / Math.PI + 90 // a leaf drawn pointing up, turned to point along the stem
  // [x, y, rotation, size]: one leaf on the outside of the stem (bigger), one on the inside (smaller); the last caps it.
  return i === 4 ? [[x, y, ang, 1]] : [[x, y, ang + 42, 1], [x, y, ang - 42, 0.78]]
})
const LEAF_D = 'M0 0 C11 -10 12 -30 0 -44 C-12 -30 -11 -10 0 0Z'

/** Cesare the Roman cat. Actions: hop, cheer, wave, call, flick, bow, nod, wiggle, blink. Voice: cesare. */
export const Cesare = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void; hot?: boolean }>(function Cesare({ height, style, flip, onTap, hot = false }, ref) {
  const [m] = useState(() => ({ earL: spring(170, 9), earR: spring(170, 9), crown: spring(110, 5), tail: spring(130, 8), hot: 0, relax: 0, wasHot: false, prevLift: 0, twitch: 0, twitchSide: 0 }))
  const hotRef = useRef(hot)
  hotRef.current = hot
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'cesare',
    actions: CESARE_ACTIONS,
    eyes: [200, 168],
    reach: [200, 220],
    frame: (f, p) => {
      const { t, dt, p: q, action: a } = f
      // Hot: eases in and out; when it ends he lets out a big happy "ahh" (relax).
      m.hot += ((hotRef.current ? 1 : 0) - m.hot) * Math.min(1, dt * 4)
      if (m.wasHot && !hotRef.current) m.relax = 1
      m.wasHot = hotRef.current
      m.relax = Math.max(0, m.relax - dt / 2.2)
      const H = m.hot
      const rx = bell(1 - m.relax) * (m.relax > 0 ? 1 : 0)

      const breathe = Math.sin(t * 2) * (1 + H * 1.6)
      let sx = 1 - breathe * 0.007
      let sy = 1 + breathe * 0.012
      let lift = 0
      let lean = 0
      let head = Math.sin(t * 0.7) * 2 + f.look.x * 4
      let headY = breathe * 1.4
      let armL = 0
      let armR = 0
      let wag = Math.sin(t * 1.3) * 5
      let happy = false
      let open = 0
      let lid = 0.42 // half-closed proud eyes
      let earPerk = 0
      let tongue = 0
      let bow = 0

      head += Math.sin(t * 9) * f.mouth * 3
      headY -= f.mouth * 2.5

      // Ears twitch now and then.
      m.twitch -= dt
      if (m.twitch < -3 - Math.random() * 3) ((m.twitch = 0.25), (m.twitchSide = Math.random() < 0.5 ? 0 : 1))

      // Hot: one paw fans his face, ears droop, tongue out, quick panting.
      if (H > 0.01) {
        armR = lerp(armR, 146 + Math.sin(t * 18) * 12, H)
        head += Math.sin(t * 16) * 1.5 * H
        earPerk -= 20 * H
        tongue = H
        lid = lerp(lid, 0.62, H)
        sy -= 0.02 * H
      }
      if (rx > 0) {
        // The happy sigh: shoulders drop, eyes close blissfully, a big slow breath out.
        sy -= rx * 0.04
        sx += rx * 0.025
        headY += rx * 6
        happy = rx > 0.4
        open = rx * 0.3
        wag = lerp(wag, Math.sin(t * 3) * 14, rx)
      }

      if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.74))
        const land = wobble(span(k, 0.74, 1), 2)
        sx += crouch * 0.12 - air * 0.07 + land * 0.1
        sy += -crouch * 0.15 + air * 0.11 - land * 0.11
        lift = air * (cheer ? 40 : 56)
        headY += crouch * 10 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : 0
        armL = lerp(armL, 150 + Math.sin(q * Math.PI * 8) * 10, up)
        armR = lerp(armR, 150 + Math.sin(q * Math.PI * 8 + 1) * 10, up)
        wag = Math.sin(t * 14) * 18
        lid = 0.25
        if (cheer) ((happy = true), (open = 0.55))
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 150 + Math.sin(q * Math.PI * 7) * 18, up)
        head += up * 6
        lean -= up * 2
        open = up * 0.2
        lid = lerp(lid, 0.3, up)
      } else if (a === 'call') {
        // "Door two!": paw up high (announce), then swings down to point straight out at the doors.
        const raise = smooth(span(q, 0, 0.22))
        const point = smooth(span(q, 0.42, 0.6))
        const down = smooth(span(q, 0.88, 1))
        armL = lerp(lerp(0, 165, raise), 92, point) * (1 - down)
        head -= raise * 6 - point * 10
        headY -= raise * 6 * (1 - down)
        sy += raise * 0.04 * (1 - down)
        lean += point * 4 * (1 - down)
        open = bell(span(q, 0.15, 0.8)) * 0.55
        lid = lerp(lid, 0.15, bell(span(q, 0.1, 0.9)))
        earPerk = 10 * bell(q)
        wag = Math.sin(t * 6) * 12
      } else if (a === 'flick') {
        // Annoyed: ears flat back, tail whips side to side, eyes narrow.
        const env = bell(q)
        earPerk = -30 * env
        wag = Math.sin(q * Math.PI * 4) * 52 * env
        lid = lerp(lid, 0.7, env)
        head -= 9 * env // turns his nose up, "hmph"
        headY -= 4 * env
        lean -= 2 * env
      } else if (a === 'bow') {
        // A slow, grand bow: one paw to his chest, eyes closed, head and shoulders dip low, then rise proudly.
        const env = smooth(span(q, 0, 0.35)) * (1 - smooth(span(q, 0.7, 1)))
        bow = env
        armR = lerp(armR, -34, smooth(span(q, 0, 0.2)) * (1 - smooth(span(q, 0.8, 1))))
        headY += env * 46
        sy -= env * 0.08
        sx += env * 0.03
        lid = lerp(lid, 1, env)
        earPerk = -6 * env
        wag = Math.sin(t * 2) * 10 + env * 20
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 15
        head += n * 3
        sy -= n * 0.03
        lid = lerp(lid, 0.6, n)
      } else if (a === 'wiggle') {
        lean += Math.sin(q * Math.PI * 6) * 8 * bell(q)
        sx += Math.abs(Math.sin(q * Math.PI * 6)) * 0.04 * bell(q)
        wag = Math.sin(q * Math.PI * 12) * 34
        happy = true
        open = 0.3 * bell(q)
      } else if (a === 'blink') {
        // The slow cat blink: "I like you."
        lid = lerp(lid, 1, bell(span(q, 0.05, 0.95)) ** 0.6)
        headY += bell(q) * 4
      }

      const dtc = Math.max(dt, 1 / 120)
      const v = (lift - m.prevLift) / dtc
      m.prevLift = lift
      const drive = Math.max(-14, Math.min(18, v * 0.04))
      const tw = m.twitch > 0 ? Math.sin(m.twitch * 40) * 10 : 0
      const eL = Math.max(-40, Math.min(34, m.earL.step(-earPerk * 0.7 + drive + (head - lean) * 0.4 + (m.twitchSide === 0 ? tw : 0), dt)))
      const eR = Math.max(-40, Math.min(34, m.earR.step(-earPerk * 0.7 + drive - (head + lean) * 0.4 + (m.twitchSide === 1 ? tw : 0), dt)))
      const cr = m.crown.step(-v * 0.06 + head * 0.4 + bow * 6, dt)
      const tl = m.tail.step(wag - v * 0.04, dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.5, lift / 200)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 250) translate(200 250) scale(${0.9 - bow * 0.04}) translate(-200 -250)`)
      setT(p.earL, `translate(124 102) rotate(${-24 - eL})`)
      setT(p.earR, `translate(276 102) scale(-1 1) rotate(${-24 - eR})`)
      setT(p.crown, `rotate(${Math.max(-14, Math.min(14, cr))} 200 70)`)
      setT(p.tail, `translate(290 456) rotate(${tl}) scale(1.18)`)
      setT(p.armL, `translate(166 326) rotate(${armL})`)
      setT(p.armR, `translate(234 326) scale(-1 1) rotate(${armR})`)
      show(p.sweat, H > 0.5)
      setT(p.sweat, `translate(0 ${(t * 30) % 24})`)

      const c = Math.max(0, Math.min(1, 1 - f.blink * (1 - lid)))
      const lidY = -20 + 40 * c
      const ly = Math.min(lidY, 7)
      const w = 22 * Math.sqrt(Math.max(0, 1 - (ly / 19) ** 2))
      for (const [eye, openG, arc, pupil, lidP, lineP] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, p.lidL, p.lidLineL],
        [p.eyeR, p.openR, p.happyR, p.pupilR, p.lidR, p.lidLineR],
      ] as const) {
        show(openG, !happy)
        show(arc, happy)
        setT(pupil, `translate(${f.look.x * 5} ${f.look.y * 3})`)
        setA(lidP, 'd', `M-30 -30 L30 -30 L30 ${lidY} Q0 ${lidY + 5} -30 ${lidY} Z`)
        setA(lineP, 'd', `M${-w - 3} ${ly + 1} Q0 ${ly + 6} ${w + 3} ${ly + 1}`)
        void eye
      }

      // Mouth: his voice opens it; when hot his tongue hangs out.
      const mo = Math.min(1, Math.max(open, f.mouth * 1.1))
      if (mo > 0.05) {
        const mw = 12 + mo * 6
        const d = 20 * mo
        setA(p.mouth, 'd', `M${200 - mw} 214 Q200 210 ${200 + mw} 214 Q${200 + mw * 0.9} ${216 + d} 200 ${218 + d} Q${200 - mw * 0.9} ${216 + d} ${200 - mw} 214Z`)
        setA(p.tongueOpen, 'd', `M190 ${212 + 16 * mo} Q200 ${206 + 12 * mo} 210 ${212 + 16 * mo} Q208 ${216 + 20 * mo} 200 ${216 + 20 * mo} Q192 ${216 + 20 * mo} 190 ${212 + 16 * mo}Z`)
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongueOpen, 'd', '')
      }
      show(p.smile, mo <= 0.05)
      show(p.tongueOut, tongue > 0.3 && mo <= 0.05)
      setT(p.tongueOut, `translate(200 214) scale(1 ${0.8 + Math.abs(Math.sin(t * 8)) * 0.3}) translate(-200 -214)`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const tail = (pass: boolean) => (
    <g ref={r('tail', pass)}>
      <path fill={FUR} d={TAIL} />
      {!pass && (
        <>
          <path fill={STRIPE} d="M40 -2 C48 -6 56 -12 62 -18 L72 -6 C64 2 54 8 46 10Z" />
          <path fill={STRIPE} d="M70 -40 L92 -44 L94 -30 L72 -26Z" />
          <path fill={STRIPE} d="M64 -86 L92 -96 L94 -80 L66 -72Z" />
          <path fill={STRIPE} d="M58 -128 L80 -144 L88 -130 L64 -116Z" />
          <path fill={CREAM} d="M18 -166 C18 -184 40 -190 56 -176 C46 -170 34 -160 30 -150 C22 -152 18 -158 18 -166Z" />
        </>
      )}
    </g>
  )
  const body = (pass: boolean) => (
    <>
      <path fill={FUR} d={BODY} />
      <path fill={FUR} d={HAUNCH} transform="translate(114 422) scale(0.88)" />
      <path fill={FUR} d={HAUNCH} transform="translate(286 422) scale(-0.88 0.88)" />
      <path fill={CREAM} d={PAW} transform="translate(92 456)" />
      <path fill={CREAM} d={PAW} transform="translate(308 456)" />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.55" d="M70 436 C80 456 110 462 140 462 C110 454 84 446 70 436Z M330 436 C320 456 290 462 260 462 C290 454 316 446 330 436Z" />
          {/* Tabby stripes on the haunches and sides */}
          <path fill={STRIPE} d="M68 404 C82 394 98 394 110 400 L106 410 C94 406 82 408 72 414Z M76 368 C88 358 102 356 114 360 L112 370 C100 368 88 370 80 376Z M98 330 C108 322 118 320 128 324 L124 334 C116 332 108 334 102 340Z" />
          <path fill={STRIPE} d="M332 404 C318 394 302 394 290 400 L294 410 C306 406 318 408 328 414Z M324 368 C312 358 298 356 286 360 L288 370 C300 368 312 370 320 376Z M302 330 C292 322 282 320 272 324 L276 334 C284 332 292 334 298 340Z" />
          <path {...line(3)} d="M84 452 L84 466 M100 452 L100 466 M316 452 L316 466 M300 452 L300 466" />
          <path fill={CREAM} d={CHEST} />
          <path fill={CREAM_SHADE} opacity="0.7" d="M168 388 C180 402 220 402 232 388 C220 396 180 396 168 388Z" />
          <path {...line(3)} d="M184 290 Q190 302 184 314 M216 290 Q210 302 216 314 M200 334 Q204 346 198 356" />
        </>
      )}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d={LEG} />
      <path fill={CREAM} d={PAW} transform="translate(0 132) scale(0.82)" />
      {!pass && (
        <>
          <path fill={STRIPE} d="M-18 30 L-2 26 L-4 35 L-18 39Z M-18 62 L-2 58 L-4 67 L-18 71Z M-18 92 L-4 90 L-6 98 L-18 100Z" />
          <path {...line(3)} d="M-8 134 L-8 144 M8 134 L8 144" />
        </>
      )}
    </g>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <path fill={FUR} d={EAR} />
      {!pass && (
        <>
          <path fill={EAR_IN} d={EAR_INNER} />
          <path {...line(2.6)} d="M-14 4 Q-12 -14 -6 -28 M6 4 Q8 -12 12 -24" stroke={CREAM} />
        </>
      )}
    </g>
  )
  const crown = (pass: boolean) => (
    <g ref={r('crown', pass)}>
      {([1, -1] as const).map((dir) => (
        <g key={dir} transform={`translate(200 74) scale(${dir} 1)`}>
          <path fill="none" stroke={pass ? INK : LEAF_SHADE} strokeWidth={pass ? 12 : 5} strokeLinecap="round" d={`M${STEM.a[0]} ${STEM.a[1]} Q${STEM.c[0]} ${STEM.c[1]} ${STEM.b[0]} ${STEM.b[1]}`} />
          {SPRIG.map(([x, y, rot, k], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${k})`}>
              <path fill={i % 2 ? LEAF_SHADE : LEAF} d={LEAF_D} {...(pass ? {} : { stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const })} />
              {!pass && <path {...line(2.2, LEAF_SHADE)} d="M0 -4 L0 -34" />}
            </g>
          ))}
        </g>
      ))}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={FUR} d={HEAD} />
      {!pass && (
        <>
          {/* Tabby "M" on the forehead, and stripes on the cheeks */}
          <path fill={STRIPE} d="M190 76 L200 112 L210 76 L206 74 L200 96 L194 74Z M168 82 L180 112 L186 108 L176 80Z M232 82 L220 112 L214 108 L224 80Z" />
          <path fill={STRIPE} d="M82 180 L114 186 L112 194 L82 192Z M90 206 L118 204 L118 212 L94 216Z M318 180 L286 186 L288 194 L318 192Z M310 206 L282 204 L282 212 L306 216Z" />
          <path fill={CREAM} d={MUZZLE} />
          {/* Pale patches over the eyes */}
          <ellipse fill={CREAM} opacity="0.6" cx="152" cy="150" rx="28" ry="14" transform="rotate(-10 152 150)" />
          <ellipse fill={CREAM} opacity="0.6" cx="248" cy="150" rx="28" ry="14" transform="rotate(10 248 150)" />
          <ellipse fill={BLUSH} cx="132" cy="206" rx="17" ry="10" />
          <ellipse fill={BLUSH} cx="268" cy="206" rx="17" ry="10" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')} transform={`translate(${s === 'L' ? 154 : 246} 168) rotate(${s === 'L' ? 6 : -6})`}>
              <clipPath id={`${uid}eye${s}`}>
                <ellipse rx="22" ry="19" />
              </clipPath>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <g clipPath={`url(#${uid}eye${s})`}>
                  <ellipse fill={IRIS} rx="22" ry="19" />
                  <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                    <ellipse fill={EYE} rx="8" ry="13" />
                    <circle fill="#fff" cx="-7" cy="-4" r="5" />
                    <circle fill="#fff" cx="6" cy="7" r="2.4" />
                  </g>
                  <path ref={part(s === 'L' ? 'lidL' : 'lidR')} fill={FUR} d="" />
                </g>
                <ellipse rx="22" ry="19" fill="none" stroke={EYE} strokeWidth="3.4" />
                <path ref={part(s === 'L' ? 'lidLineL' : 'lidLineR')} {...line(5, EYE)} d="" />
                <path {...line(3.2, EYE)} d={s === 'L' ? 'M-22 -2 L-32 -8' : 'M22 -2 L32 -8'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, EYE)} d="M-19 4 Q0 -14 19 4" />
            </g>
          ))}
          <path fill={NOSE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" d="M188 194 Q200 190 212 194 Q206 204 200 206 Q194 204 188 194Z" />
          <path {...line(3, EYE)} d="M200 206 L200 212" />
          {/* Whiskers */}
          <path {...line(2.6)} d="M146 210 L104 202 M146 218 L106 222 M254 210 L296 202 M254 218 L294 222" />
          <path ref={part('mouth')} {...line(3.2, EYE)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('smile')}>
            <path {...line(3.6, EYE)} d="M178 210 Q188 222 200 212 Q212 222 222 210" />
          </g>
          <path ref={part('tongueOut')} fill={TONGUE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" style={{ display: 'none' }} d="M192 216 Q200 213 208 216 Q210 236 200 238 Q190 236 192 216Z" />
          <g ref={part('sweat')} style={{ display: 'none' }}>
            <path fill={DROP} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" d="M300 108 Q312 126 312 134 A12 12 0 0 1 288 134 Q288 126 300 108Z" />
            <ellipse fill="#fff" cx="296" cy="132" rx="3" ry="4.5" />
          </g>
        </>
      )}
      {crown(pass)}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Cesare' : undefined} style={{ height, overflow: 'visible', display: 'block', cursor: onTap ? 'pointer' : undefined, transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="150" ry="13" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{tail(true)}</g>
        {tail(false)}
        <g ref={part('body')}>
          <g {...inkPass()}>{body(true)}</g>
          {body(false)}
        </g>
        <g {...inkPass()}>{headG(true)}</g>
        {headG(false)}
        {(['L', 'R'] as const).map((s) => (
          <g key={s}>
            <g {...inkPass()}>{arm(s, true)}</g>
            {arm(s, false)}
          </g>
        ))}
        <path fill={CREAM} d={CHEST_FRONT} />
        <path {...line(3)} d="M186 326 Q192 338 186 348 M214 326 Q208 338 214 348" />
      </g>
    </svg>
  )
})
