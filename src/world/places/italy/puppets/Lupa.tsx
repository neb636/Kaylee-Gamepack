// Lupa, an Italian (Apennine) wolf cub girl from Rome: a layered SVG puppet (reference: art/source/world/italy/lupa.png).
// Like Dou Dou in China she stands up on her hind legs like a cartoon character, so she can wave and cheer. Her tall
// pointy ears and bushy tail ride on springs (they perk, lag and flop), she crouches before every hop, and her big
// party trick is a howl: head back, ears flat, a round "ooo" mouth. (She dreams of singing at the opera.)
import { forwardRef, useState, type CSSProperties } from 'react'
import { motion } from 'motion/react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, TONGUE, useInk } from './ink'

export const LUPA_ACTIONS: Record<string, number> = { hop: 0.8, cheer: 1.2, wave: 1.4, howl: 1.8, run: 0.9, nod: 0.7, wiggle: 0.8, wag: 1.2, sniff: 1.1, shake: 0.9 }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'earL' | 'earR' | 'tail' | 'armL' | 'armR' | 'legL' | 'legR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'shineL' | 'shineR' | 'nose' | 'mouth' | 'tongueOpen' | 'smile' | 'notes'

const FUR = '#C8B6A4'
const FUR_SHADE = '#AE9A87'
const CREAM = '#FBEBD8'
const EAR_IN = '#F8B4B4'
const IRIS = '#7A4526'
const SCARF = '#FF8FB8'
const SCARF_SHADE = '#F06E9E'
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
    const tx = mx + nx * len * amp + (x2 - x1) * 0.12
    const ty = my + ny * len * amp + (y2 - y1) * 0.12
    const b = len * 0.1
    d += ` Q${f((x1 + tx) / 2 + nx * b)} ${f((y1 + ty) / 2 + ny * b)} ${f(tx)} ${f(ty)} Q${f((tx + x2) / 2 + nx * b * 0.4)} ${f((ty + y2) / 2 + ny * b * 0.4)} ${x2} ${y2}`
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

// Shapes (viewBox 400 x 480, feet at y 470). The head is a wide soft oval with fluffy cheek tufts at the sides.
const HEAD = tufts([
  [200, 44], [246, 50], [286, 72], [310, 108], [322, 150], [330, 176], [312, 196], [296, 218], [256, 236], [200, 242],
  [144, 236], [104, 218], [88, 196], [70, 176], [78, 150], [90, 108], [114, 72], [154, 50],
], 0.1)
const CROWN = 'M180 50 Q186 26 200 40 Q206 22 214 42 Q226 34 228 54 Z'
// Muzzle and cheeks: the cream lower face, with a soft point up between the eyes like the reference.
const MUZZLE = soft([[200, 132], [224, 150], [262, 164], [300, 184], [284, 212], [248, 230], [200, 236], [152, 230], [116, 212], [100, 184], [138, 164], [176, 150]], 0.1)
// Ear, drawn with its base at 0,0 pointing up (tall and pointy).
const EAR = 'M-40 14 C-40 -30 -22 -86 -2 -116 C4 -122 10 -120 14 -112 C32 -74 42 -30 40 14 Z'
const EAR_INNER = 'M-24 6 C-24 -28 -14 -70 2 -96 C16 -66 26 -30 24 6 Z'
const EAR_TUFT = tufts([[-22, 14], [-18, -8], [-4, -22], [8, -8], [14, 14]], 0.3)
const TORSO = tufts([[134, 216], [168, 206], [232, 206], [266, 216], [292, 262], [306, 330], [310, 390], [296, 432], [254, 448], [146, 448], [104, 432], [90, 390], [94, 330], [108, 262]], 0.08)
const CHEST = tufts([[160, 230], [200, 222], [240, 230], [250, 280], [240, 340], [226, 380], [200, 396], [174, 380], [160, 340], [150, 280]], 0.12)
// The tail: a big bushy brush that curls up, with a cream tip (anchored at its base, 0,0).
const TAIL = tufts([[-6, 12], [18, -4], [52, -26], [86, -62], [104, -104], [100, -144], [80, -168], [58, -150], [44, -114], [26, -76], [4, -46], [-14, -18]], 0.16)
const TAIL_TIP = tufts([[100, -104], [104, -140], [84, -168], [60, -152], [50, -124], [64, -104], [84, -96]], 0.2)
const ARM = tufts([[-19, -6], [0, -12], [19, -6], [22, 22], [18, 46], [-18, 46], [-22, 22]], 0.1)
const LEG = tufts([[-30, -30], [30, -30], [34, 8], [31, 34], [-31, 34], [-34, 8]], 0.08)
const FOOT = soft([[-34, 8], [-26, -8], [0, -14], [26, -8], [34, 8], [22, 16], [-22, 16]], 0.12)

/** Lupa the wolf cub. Actions: hop, cheer, wave, howl, run, nod, wiggle, wag, sniff, shake. Voice: lupa. */
export const Lupa = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void; mandolin?: string }>(function Lupa({ height, style, flip, onTap, mandolin }, ref) {
  const [m] = useState(() => ({ earL: spring(160, 9), earR: spring(160, 9), tail: spring(80, 6), prevLift: 0 }))
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'lupa',
    actions: LUPA_ACTIONS,
    eyes: [200, 140],
    reach: [200, 185],
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
      let shL = 0
      let shR = 0
      let legL = 0
      let legR = 0
      let wag = Math.sin(t * 2.6) * 6
      let happy = false
      let open = 0
      let round = 0 // 1 = the round "ooo" howl mouth
      let noseS = 1
      let squint = 1
      let earPerk = 0
      let notes = 0

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
        wag = Math.sin(t * 18) * 20
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
      } else if (a === 'howl') {
        // Big breath in (crouch, ears perk), then head back, ears flat, round mouth, a long "awoooo" with a wobble.
        const breath = bell(span(q, 0, 0.22))
        const sing = smooth(span(q, 0.18, 0.32)) * (1 - smooth(span(q, 0.84, 1)))
        sy += breath * -0.06 + sing * 0.05
        sx += breath * 0.04
        headY += breath * 8 - sing * 14
        head = lerp(head, -26 + Math.sin(t * 9) * 2.5, sing)
        lean -= sing * 5
        armL = lerp(armL, 40, sing)
        armR = lerp(armR, 40, sing)
        earPerk = breath * 12 - sing * 26
        round = sing
        squint = 1 - sing
        happy = sing > 0.6
        wag = Math.sin(t * 5) * 10 + sing * 16
        notes = sing
      } else if (a === 'wag') {
        const env = bell(q)
        wag = Math.sin(q * Math.PI * 12) * 34 * env
        lean += Math.sin(q * Math.PI * 12) * 3 * env
        happy = env > 0.3
        open = 0.25 * env
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
        earPerk = -8 * bell(q)
      } else if (a === 'sniff') {
        const fwd = bell(q)
        headY += fwd * 10
        head -= fwd * 5
        lean += fwd * 4
        noseS = 1 + Math.abs(Math.sin(q * Math.PI * 9)) * 0.25 * fwd
        squint = 1 - fwd * 0.55
        earPerk = 12 * fwd
      }

      // Ears stand up (they tilt outward a little and flick back when she lands); the tail lags and swishes.
      const dt = Math.max(f.dt, 1 / 120)
      const v = (lift - m.prevLift) / dt
      m.prevLift = lift
      const drive = Math.max(-14, Math.min(18, v * 0.04))
      const eL = Math.max(-40, Math.min(34, m.earL.step(-earPerk * 0.6 + drive + (head - lean) * 0.4, f.dt)))
      const eR = Math.max(-40, Math.min(34, m.earR.step(-earPerk * 0.6 + drive - (head + lean) * 0.4, f.dt)))
      const tl = m.tail.step(wag - v * 0.05, f.dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.5, lift / 200)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 220)`)
      setT(p.earL, `translate(128 80) rotate(${-20 - eL})`)
      setT(p.earR, `translate(272 80) scale(-1 1) rotate(${-20 - eR})`)
      setT(p.tail, `translate(282 404) rotate(${tl})`)
      // With the instrument tucked across her belly, both paws rest on it instead of waving beside it.
      setT(p.armL, mandolin ? 'translate(116 302) rotate(-56)' : `translate(${116 + shL * 0.2} ${302 + shL}) rotate(${armL})`)
      setT(p.armR, mandolin ? 'translate(284 302) scale(-1 1) rotate(68)' : `translate(${284 - shR * 0.2} ${302 + shR}) scale(-1 1) rotate(${armR})`)
      setT(p.legL, `translate(156 420) rotate(${legL})`)
      setT(p.legR, `translate(244 420) rotate(${-legR})`)
      setT(p.nose, `translate(200 168) scale(${noseS}) translate(-200 -168)`)
      show(p.notes, notes > 0.3)
      setT(p.notes, `translate(${Math.sin(t * 3) * 6} ${-((t * 40) % 40)})`)

      for (const [eye, openG, arc, shine, x] of [
        [p.eyeL, p.openL, p.happyL, p.shineL, 148],
        [p.eyeR, p.openR, p.happyR, p.shineR, 252],
      ] as const) {
        setT(eye, `translate(${x} 142) scale(1 ${happy ? 1 : f.blink * squint})`)
        show(openG, !happy)
        show(arc, happy)
        setT(shine, `translate(${f.look.x * 4} ${f.look.y * 4})`)
      }

      // Mouth: her voice opens it; the howl makes it a round "o".
      const mo = Math.min(1, Math.max(open, round * 0.9, f.mouth * 1.15))
      if (mo > 0.05) {
        const w = lerp(13 + mo * 5, 9 + mo * 6, round)
        const d = 22 * mo
        setA(p.mouth, 'd', `M${200 - w} 186 Q200 ${186 - round * 8} ${200 + w} 186 Q${200 + w * 0.9} ${188 + d} 200 ${190 + d} Q${200 - w * 0.9} ${188 + d} ${200 - w} 186Z`)
        setA(p.tongueOpen, 'd', round > 0.5 ? '' : `M190 ${184 + 18 * mo} Q200 ${177 + 13 * mo} 210 ${184 + 18 * mo} Q208 ${188 + 22 * mo} 200 ${188 + 22 * mo} Q192 ${188 + 22 * mo} 190 ${184 + 18 * mo}Z`)
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
      <path fill={FUR} d={TAIL} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M-4 8 C20 -8 48 -30 70 -58 C54 -26 26 -2 -4 8Z" />
          <path fill={CREAM} d={TAIL_TIP} />
          <path {...line(3)} d="M40 -60 Q54 -74 58 -92 M20 -30 Q36 -38 44 -54" />
        </>
      )}
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
          <path fill={CREAM} d={CHEST} />
          <path {...line(3)} d="M184 300 Q190 312 186 324 M214 300 Q210 312 216 322 M198 350 Q202 362 198 372" />
        </>
      )}
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
          <path fill={CREAM} d={EAR_TUFT} />
        </>
      )}
    </g>
  )
  const scarf = (pass: boolean) => (
    <g>
      <path fill={SCARF} d="M140 226 C170 242 230 242 260 226 L258 244 C228 260 172 260 142 244 Z" />
      <path fill={SCARF} d="M204 246 L226 296 C212 306 196 300 190 288 Z M196 250 L166 286 C174 298 190 296 198 284 Z" />
      <circle fill={SCARF} cx="200" cy="250" r="13" />
      {!pass && (
        <>
          <path fill={SCARF_SHADE} d="M142 244 C172 260 228 260 258 244 L258 238 C228 254 172 254 142 238 Z" />
          <circle {...line(3)} cx="200" cy="250" r="13" />
          <path {...line(2.6)} d="M206 264 L214 282 M192 266 L180 282" />
        </>
      )}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={FUR} d={HEAD} />
      <path fill={FUR} d={CROWN} />
      {!pass && (
        <>
          <path fill={CREAM} d={MUZZLE} />
          {/* Pale patches over the eyes, and little brows */}
          <ellipse fill={CREAM} opacity="0.55" cx="146" cy="116" rx="26" ry="12" transform="rotate(-12 146 116)" />
          <ellipse fill={CREAM} opacity="0.55" cx="254" cy="116" rx="26" ry="12" transform="rotate(12 254 116)" />
          <path {...line(3.4)} d="M132 100 Q146 92 160 98 M240 98 Q254 92 268 100" />
          <ellipse fill={BLUSH} cx="118" cy="190" rx="18" ry="11" />
          <ellipse fill={BLUSH} cx="282" cy="190" rx="18" ry="11" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill={EYE} rx="25" ry="28" />
                <ellipse fill={IRIS} cy="3" rx="20" ry="22" />
                <ellipse fill={EYE} cy="3" rx="11" ry="13" />
                <g ref={part(s === 'L' ? 'shineL' : 'shineR')}>
                  <circle fill="#fff" cx="-8" cy="-10" r="8.5" />
                  <circle fill="#fff" cx="9" cy="9" r="3.8" />
                </g>
                <path {...line(3.2, EYE)} d={s === 'L' ? 'M-20 -18 L-31 -24 M-25 -8 L-35 -11' : 'M20 -18 L31 -24 M25 -8 L35 -11'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, EYE)} d="M-19 4 Q0 -16 19 4" />
            </g>
          ))}
          <g ref={part('nose')}>
            <path fill={EYE} d="M184 162 C184 154 216 154 216 162 C216 172 206 178 200 178 C194 178 184 172 184 162Z" />
            <ellipse fill="#fff" opacity="0.6" cx="193" cy="160" rx="4.5" ry="2.6" />
          </g>
          <path {...line(3, EYE)} d="M200 178 L200 184" />
          <path ref={part('mouth')} {...line(3.2, EYE)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('smile')}>
            <path fill={TONGUE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" d="M190 190 Q200 186 210 190 Q212 208 200 210 Q188 208 190 190Z" />
            <path {...line(3.6, EYE)} d="M176 182 Q188 194 200 184 Q212 194 224 182" />
          </g>
        </>
      )}
      {/* Music notes float up while she howls (only during the howl). */}
      {!pass && (
        <g ref={part('notes')} style={{ display: 'none' }}>
          <g transform="translate(236 20) rotate(12)">
            <path {...line(4)} d="M0 0 L0 -34 L18 -40 L18 -8" />
            <ellipse fill={SCARF} stroke={INK} strokeWidth="3.5" cx="-6" cy="2" rx="10" ry="8" />
            <ellipse fill={SCARF} stroke={INK} strokeWidth="3.5" cx="12" cy="-6" rx="10" ry="8" />
          </g>
          <g transform="translate(150 -10) rotate(-10)">
            <path {...line(4)} d="M0 0 L0 -30" />
            <ellipse fill="#B9A6F5" stroke={INK} strokeWidth="3.5" cx="-6" cy="2" rx="10" ry="8" />
          </g>
        </g>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Lupa' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="100" ry="12" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        <g {...inkPass()}>{tail(true)}</g>
        {tail(false)}
        <g ref={part('body')}>
          <g {...inkPass()}>{lower(true)}</g>
          {lower(false)}
        </g>
        <g {...inkPass()}>{scarf(true)}</g>
        {scarf(false)}
        <g {...inkPass()}>{headG(true)}</g>
        {headG(false)}
        {/* Inside the moving root, behind her paws: the mandolin travels with her body during a howl or hop. */}
        {mandolin && (
          <motion.g initial={{ opacity: 0, x: -160, y: -100, scale: 0.6 }} animate={{ opacity: 1, x: 0, y: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.25, duration: 0.9 }}>
            <image href={mandolin} x="128" y="245" width="220" height="235" transform="rotate(20 238 362)" />
          </motion.g>
        )}
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
