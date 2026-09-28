// Dou Dou, a fluffy Pekingese puppy girl from Shanghai: a layered SVG puppet (reference: art/source/world/china/doudou.png).
// She stands up on her hind legs like a cartoon character. Parts move every frame: floppy ears and a plume tail on
// springs (they lag and flop), a bouncy run, hops with a crouch before and a squash after, eyes that follow her finger,
// and a mouth that opens with her voice.
import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, TONGUE, useInk } from './ink'

export const DOUDOU_ACTIONS: Record<string, number> = { hop: 0.8, cheer: 1.2, wave: 1.4, run: 0.9, nod: 0.7, wiggle: 0.8, pour: 1.6, sniff: 1.1, shake: 0.9 }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'earL' | 'earR' | 'tail' | 'armL' | 'armR' | 'legL' | 'legR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'shineL' | 'shineR' | 'nose' | 'mouth' | 'tongueOpen' | 'smile' | 'teapot'

const FUR = '#F3B676'
const FUR_SHADE = '#E39A58'
const CREAM = '#FCE3C8'
const TAIL = '#F7CD96'
const VEST = '#D9473F'
const GOLD = '#F4C04A'
const PAD = '#F4A3B4'

/** A closed shape with a tufty (fluffy fur) edge: every side between two points becomes a little pointed tuft. */
function tufts(points: [number, number][], amp = 0.2) {
  const n = points.length
  const cx = points.reduce((s, p) => s + p[0], 0) / n
  const cy = points.reduce((s, p) => s + p[1], 0) / n
  const f = (v: number) => v.toFixed(1)
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
    // The tip leans a little along the edge, like combed fur.
    const tx = mx + nx * len * amp + (x2 - x1) * 0.12
    const ty = my + ny * len * amp + (y2 - y1) * 0.12
    const b = len * 0.1
    d += ` Q${f((x1 + tx) / 2 + nx * b)} ${f((y1 + ty) / 2 + ny * b)} ${f(tx)} ${f(ty)} Q${f((tx + x2) / 2 + nx * b * 0.4)} ${f((ty + y2) / 2 + ny * b * 0.4)} ${x2} ${y2}`
  }
  return d + 'Z'
}
/** A closed shape with a soft rounded edge (no tufts): each side bulges out a little. */
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
/** Points around an ellipse, starting at the top. */
const ring = (cx: number, cy: number, rx: number, ry: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / n
    return [+(cx + Math.cos(a) * rx).toFixed(1), +(cy + Math.sin(a) * ry).toFixed(1)]
  })

// Precomputed shapes (viewBox 400 x 480, feet at y 470).
// The head is one smooth round dome (a few tufts on the crown) with fluffy cheeks at the bottom.
const HEAD_RX = 112
const HEAD_RY = 100
const CHEEKS = tufts([
  ...Array.from({ length: 9 }, (_, i): [number, number] => {
    const a = (Math.PI * (8 + i * 20.5)) / 180
    return [+(200 + Math.cos(a) * (HEAD_RX + 4)).toFixed(1), +(140 + Math.sin(a) * (HEAD_RY + 4)).toFixed(1)]
  }),
  [150, 150],
  [250, 150],
], 0.16)
const TOP_TUFT = 'M172 48 Q180 24 194 38 Q200 18 208 38 Q222 26 228 50 Z'
const EAR = tufts([[18, -10], [-4, -14], [-22, -2], [-34, 26], [-40, 64], [-42, 104], [-38, 138], [-26, 160], [-8, 166], [8, 156], [16, 128], [20, 90], [22, 50], [22, 14]], 0.18)
const TORSO = tufts([[134, 216], [168, 206], [232, 206], [266, 216], [292, 262], [306, 330], [310, 390], [296, 432], [254, 448], [146, 448], [104, 432], [90, 390], [94, 330], [108, 262]], 0.08)
const BELLY = soft(ring(200, 384, 58, 56, 10), 0.12)
const RUFF = tufts([[104, 214], [150, 198], [200, 194], [250, 198], [296, 214], [306, 254], [298, 296], [276, 312], [264, 286], [256, 258], [236, 240], [200, 234], [164, 240], [144, 258], [136, 286], [124, 312], [102, 296], [94, 254]], 0.14)
const MASK = soft([[124, 166], [146, 136], [176, 140], [200, 150], [224, 140], [254, 136], [276, 166], [272, 200], [246, 222], [200, 228], [154, 222], [128, 200]], 0.12)
const TAIL_BLOB = tufts(ring(50, -54, 54, 60, 13), 0.2)
const TAIL_STEM = soft([[-10, 10], [18, -6], [36, -30], [14, -40], [-8, -18]], 0.1)
const TAIL_IN = soft(ring(46, -48, 30, 34, 9), 0.12)
const ARM = tufts([[-19, -6], [0, -12], [19, -6], [22, 22], [18, 46], [-18, 46], [-22, 22]], 0.1)
const LEG = tufts([[-30, -30], [30, -30], [34, 8], [31, 34], [-31, 34], [-34, 8]], 0.08)
const FOOT = soft([[-34, 8], [-26, -8], [0, -14], [26, -8], [34, 8], [22, 16], [-22, 16]], 0.12)

/** Dou Dou the Pekingese puppy. Actions: hop, cheer, wave, run, nod, wiggle, pour (tea), sniff, shake. Voice: doudou. */
export const DouDou = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void }>(function DouDou({ height, style, flip, onTap }, ref) {
  const [m] = useState(() => ({ earL: spring(120, 10), earR: spring(120, 10), tail: spring(90, 6), prevLift: 0 }))
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'doudou',
    actions: DOUDOU_ACTIONS,
    eyes: [200, 145],
    reach: [200, 175],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.4)
      let sx = 1 - breathe * 0.008
      let sy = 1 + breathe * 0.014
      let lift = 0
      let lean = 0
      let head = Math.sin(t * 0.9) * 2.5 + f.look.x * 4
      let headY = 2 + breathe * 1.5
      let armL = 16 + Math.sin(t * 2.4) * 2
      let armR = 16 + Math.sin(t * 2.4 + 0.5) * 2
      let legL = 0
      // How far each shoulder rises (her arms are short, so a raised arm lifts from the shoulder too).
      let shL = 0
      let shR = 0
      let legR = 0
      let wag = Math.sin(t * 3.2) * 7
      let happy = false
      let open = 0
      let tip = 0
      let pot = 0
      let noseS = 1
      let squint = 1
      let earPerk = 0

      // Talking: little head bobs with her syllables.
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
        lift = air * (cheer ? 50 : 72)
        headY += crouch * 12 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air
        armL = lerp(armL, cheer ? 140 + Math.sin(q * Math.PI * 8) * 12 : 110, up)
        armR = lerp(armR, cheer ? 140 + Math.sin(q * Math.PI * 8 + 1) * 12 : 110, up)
        shL = shR = -22 * up
        legL = legR = -crouch * 10 + air * 8
        wag = Math.sin(t * 18) * 18
        if (cheer) ((happy = true), (open = 0.55))
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 162 + Math.sin(q * Math.PI * 7) * 20, up)
        shR = -30 * up
        head += up * 7
        lean -= up * 3
        open = up * 0.25
        happy = up > 0.5
        wag = Math.sin(t * 12) * 14
      } else if (a === 'run') {
        const s = Math.sin(q * Math.PI * 2)
        const b = Math.abs(Math.sin(q * Math.PI * 2))
        lift = b * 16
        sy += (0.5 - b) * 0.08
        sx -= (0.5 - b) * 0.05
        lean += 6
        legL = s * 30
        legR = -s * 30
        armL = 10 - s * 30
        armR = 10 + s * 30
        head -= s * 2
        headY += (1 - b) * 4
        open = 0.3
        wag = Math.sin(t * 16) * 16
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 17
        head += n * 4
        sy -= n * 0.03
        happy = q > 0.15 && q < 0.85
      } else if (a === 'wiggle') {
        lean += Math.sin(q * Math.PI * 6) * 9 * bell(q)
        sx += Math.abs(Math.sin(q * Math.PI * 6)) * 0.04 * bell(q)
        headY += Math.abs(Math.sin(q * Math.PI * 6)) * 4 * bell(q)
        wag = Math.sin(q * Math.PI * 14) * 40
        happy = true
        open = 0.3 * bell(q)
      } else if (a === 'shake') {
        head += Math.sin(q * Math.PI * 6) * 13 * bell(q)
        earPerk = -6 * bell(q)
      } else if (a === 'pour') {
        const ext = smooth(span(q, 0, 0.22)) * (1 - smooth(span(q, 0.82, 1)))
        pot = ext
        armR = lerp(armR, 112, ext)
        shR = -16 * ext
        tip = bell(span(q, 0.28, 0.78))
        lean += ext * 3
        head += ext * 5 + tip * 3
        headY += tip * 4
      } else if (a === 'sniff') {
        const fwd = bell(q)
        headY += fwd * 10
        head -= fwd * 5
        lean += fwd * 4
        noseS = 1 + Math.abs(Math.sin(q * Math.PI * 9)) * 0.22 * fwd
        squint = 1 - fwd * 0.55
        earPerk = 10 * fwd
      }

      // Ears and tail follow through: they flop up when she falls and lag when she rises or turns.
      const dt = Math.max(f.dt, 1 / 120)
      const v = (lift - m.prevLift) / dt
      m.prevLift = lift
      const drive = Math.max(-18, Math.min(24, -v * 0.06))
      const eL = Math.max(-8, Math.min(48, m.earL.step(4 + drive + earPerk - (head - lean) * 0.6, f.dt)))
      const eR = Math.max(-8, Math.min(48, m.earR.step(4 + drive + earPerk + (head + lean) * 0.6, f.dt)))
      const tl = m.tail.step(wag - v * 0.04, f.dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.5, lift / 200)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 214)`)
      setT(p.earL, `translate(94 132) rotate(${eL})`)
      setT(p.earR, `translate(306 132) scale(-1 1) rotate(${eR})`)
      setT(p.tail, `translate(284 400) rotate(${tl})`)
      setT(p.armL, `translate(${116 + shL * 0.2} ${302 + shL}) rotate(${armL})`)
      setT(p.armR, `translate(${284 - shR * 0.2} ${302 + shR}) scale(-1 1) rotate(${armR})`)
      setT(p.legL, `translate(156 420) rotate(${legL})`)
      setT(p.legR, `translate(244 420) rotate(${-legR})`)
      setT(p.nose, `translate(200 150) scale(${noseS}) translate(-200 -150)`)
      show(p.teapot, pot > 0.02)
      setT(p.teapot, `translate(0 60) rotate(${-armR + tip * 42}) scale(${1 + pot * 0.5})`)

      for (const [eye, openG, arc, shine, x] of [
        [p.eyeL, p.openL, p.happyL, p.shineL, 150],
        [p.eyeR, p.openR, p.happyR, p.shineR, 250],
      ] as const) {
        setT(eye, `translate(${x} 150) scale(1 ${happy ? 1 : f.blink * squint})`)
        show(openG, !happy)
        show(arc, happy)
        setT(shine, `translate(${f.look.x * 4} ${f.look.y * 4})`)
      }

      const mo = Math.min(1, Math.max(open, f.mouth * 1.15))
      if (mo > 0.05) {
        const w = 13 + mo * 5
        setA(p.mouth, 'd', `M${200 - w} 166 Q200 170 ${200 + w} 166 Q${200 + w * 0.85} ${167 + 26 * mo} 200 ${169 + 26 * mo} Q${200 - w * 0.85} ${167 + 26 * mo} ${200 - w} 166Z`)
        setA(p.tongueOpen, 'd', `M${190} ${164 + 22 * mo} Q200 ${156 + 16 * mo} 210 ${164 + 22 * mo} Q208 ${168 + 26 * mo} 200 ${168 + 26 * mo} Q192 ${168 + 26 * mo} 190 ${164 + 22 * mo}Z`)
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongueOpen, 'd', '')
      }
      show(p.smile, mo <= 0.05)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const tail = (pass: boolean) => (
    <g ref={r('tail', pass)}>
      <path fill={TAIL} d={TAIL_STEM} />
      <path fill={TAIL} d={TAIL_BLOB} />
      {!pass && <path fill={CREAM} d={TAIL_IN} />}
      {!pass && <path {...line(3)} d="M40 -90 Q62 -84 70 -62 M22 -58 Q34 -40 56 -34 M66 -30 Q80 -38 86 -54" />}
    </g>
  )
  const leg = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
      <path fill={FUR} d={LEG} />
      <path fill={CREAM} d={FOOT} transform={`translate(${s === 'L' ? -4 : 4} 40)`} />
      {!pass && <path {...line(3)} d={`M${s === 'L' ? -14 : -6} 44 L${s === 'L' ? -14 : -6} 52 M${s === 'L' ? 4 : 12} 44 L${s === 'L' ? 4 : 12} 52`} />}
    </g>
  )
  const lower = (pass: boolean) => (
    <>
      {leg('L', pass)}
      {leg('R', pass)}
      <path fill={FUR} d={TORSO} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.45" d="M108 400 C116 430 150 444 200 444 C150 438 120 422 108 400Z" />
          <path fill={CREAM} d={BELLY} />
          <path {...line(3)} d="M170 372 Q176 382 172 394 M226 370 Q222 382 228 392 M198 420 Q202 430 198 438" />
          {vest}
        </>
      )}
      {/* The cream mane under her chin drapes over the vest's edges. */}
      {pass ? <path d={RUFF} /> : <path fill={CREAM} stroke={INK} strokeWidth="3.2" strokeLinejoin="round" d={RUFF} />}
      {!pass && <path stroke={INK} strokeWidth="4" strokeLinejoin="round" fill={VEST} d="M176 238 C188 230 214 230 226 238 L224 252 C212 246 190 246 178 252Z" />}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d={ARM} />
      <circle fill={CREAM} cx="0" cy="52" r="19" />
      {!pass && (
        <>
          <ellipse fill={PAD} cx="0" cy="56" rx="8" ry="6.5" />
          {[-9, 0, 9].map((x) => (
            <circle key={x} fill={PAD} cx={x} cy={x === 0 ? 42 : 45} r="3.8" />
          ))}
          {s === 'R' && (
            <g ref={part('teapot')}>
              {/* A little jade teapot (only while pouring). Drawn in the mirrored arm, so the spout points outward. */}
              <g transform="scale(-1 1)">
                <path {...line(4)} fill="#7CCBA2" d="M-26 -10 C-30 -34 30 -34 26 -10 C28 12 -28 12 -26 -10Z" />
                <path {...line(4)} fill="#7CCBA2" d="M24 -10 L46 -26 L50 -20 L30 2" />
                <path {...line(4)} fill="none" d="M-24 -18 C-44 -20 -44 6 -24 2" />
                <path {...line(4)} fill={GOLD} d="M-10 -30 C-10 -40 10 -40 10 -30Z" />
              </g>
            </g>
          )}
        </>
      )}
    </g>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <path fill={FUR} d={EAR} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M4 150 C14 124 18 84 20 40 C26 84 22 136 4 158Z" />
          <path {...line(3)} d="M-26 40 Q-34 76 -30 110 M-12 64 Q-18 100 -12 136 M-34 98 Q-38 124 -30 146" />
        </>
      )}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <ellipse fill={FUR} cx="200" cy="140" rx={HEAD_RX} ry={HEAD_RY} />
      <path fill={FUR} d={CHEEKS} />
      <path fill={FUR} d={TOP_TUFT} />
      {!pass && (
        <g transform="translate(200 160) scale(1.12) translate(-200 -160)">
          {/* Cream mask: muzzle, cheeks and eyebrow spots, with an apricot stripe down between the eyes. */}
          <path fill={CREAM} d={MASK} />
          <ellipse fill={CREAM} cx="148" cy="108" rx="18" ry="11" transform="rotate(-14 148 108)" />
          <ellipse fill={CREAM} cx="252" cy="108" rx="18" ry="11" transform="rotate(14 252 108)" />
          <path fill={FUR} d="M186 92 C192 82 208 82 214 92 L208 138 C205 146 195 146 192 138Z" />
          <ellipse fill={BLUSH} cx="132" cy="182" rx="16" ry="10" />
          <ellipse fill={BLUSH} cx="268" cy="182" rx="16" ry="10" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill={EYE} rx="23" ry="25" />
                <g ref={part(s === 'L' ? 'shineL' : 'shineR')}>
                  <circle fill="#fff" cx="-7" cy="-9" r="8.5" />
                  <circle fill="#fff" cx="8" cy="8" r="3.6" />
                </g>
                <path {...line(3)} d={s === 'L' ? 'M-20 -13 L-29 -19 M-23 -4 L-32 -6' : 'M20 -13 L29 -19 M23 -4 L32 -6'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5)} stroke={EYE} d="M-18 4 Q0 -16 18 4" />
            </g>
          ))}
          <g ref={part('nose')}>
            <path fill={EYE} d="M186 146 C186 138 214 138 214 146 C214 154 205 160 200 160 C195 160 186 154 186 146Z" />
            <ellipse fill="#fff" opacity="0.6" cx="194" cy="144" rx="4" ry="2.4" />
          </g>
          <path ref={part('mouth')} {...line(3.2, EYE)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('smile')}>
            <path fill={TONGUE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" d="M188 170 Q200 164 212 170 Q215 195 200 197 Q185 195 188 170Z" />
            <path {...line(2.4, '#C9606A')} d="M200 175 L200 187" />
            <path {...line(3.6, EYE)} d="M178 163 Q189 175 200 162 Q211 175 222 163" />
          </g>
        </g>
      )}
      {!pass && (
        /* Pink bow at the top of her right ear. */
        <g transform="translate(284 70) rotate(18)">
          <path {...line(3)} fill="#FF9DBB" d="M0 0 L-24 -16 C-32 -2 -28 12 -20 18 Z M0 0 L24 -18 C32 -4 28 12 20 16 Z" />
          <circle {...line(3)} fill="#FF9DBB" r="7" />
        </g>
      )}
    </g>
  )
  const vest = (
    <g>
      {/* A little red qipao-style vest: mandarin collar, frog buttons, and a hem that slants down to one side. */}
      <path stroke={INK} strokeWidth="4.5" strokeLinejoin="round" fill={VEST} d="M150 234 C176 226 228 226 254 234 C262 264 268 300 272 332 C274 344 266 350 254 346 L162 320 C150 316 146 308 146 296 C144 272 146 252 150 234Z" />
      <path fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round" d="M158 312 L256 338 M202 238 C204 268 220 300 262 322" />
      {[258, 280].map((y, i) => (
        <g key={y} transform={`translate(${196 + i * 4} ${y})`}>
          <path stroke={INK} strokeWidth="2.5" fill={GOLD} d="M-11 0 C-11 -6 11 -6 11 0 C11 6 -11 6 -11 0Z" />
          <circle stroke={INK} strokeWidth="2" fill={GOLD} r="3.2" />
        </g>
      ))}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Dou Dou' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="100" ry="12" fill="#6E3B24" opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{tail(true)}</g>
        {tail(false)}
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
