// Spina, a crested porcupine girl from the olive grove: a layered SVG puppet (reference: art/source/world/italy/spina.png).
// She stands up on her hind legs like Lupa, a bit shorter and rounder. Her crest of banded quills is the star: eight fans
// that ride on springs (they lag, flop and settle), PUFF out when she is startled and RATTLE when she shakes. She is bouncy
// and a bit clumsy, so olives get stuck on her quill tips (`stuck`), and a wet-dog `shake` sends them flying.
import { forwardRef, useEffect, useRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { BLUSH, EYE, INK, inkPass, line, TONGUE, useInk } from './ink'

export const SPINA_ACTIONS: Record<string, number> = { shake: 1.6, puff: 1.4, hop: 0.8, bleh: 1.5, crunch: 1.5, cheer: 1.2, wave: 1.4, dance: 1.8, nod: 0.7 }

/** Where her quills are, in her viewBox units (400 x 480): a circle around the crest. Useful to aim olives at her. */
export const SPINA_QUILLS = { x: 200, y: 190, r: 170 }

const MAX_STUCK = 6

type Part =
  | 'root' | 'shadow' | 'head' | 'earL' | 'earR' | 'armL' | 'armR' | 'legL' | 'legR'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'scrunchL' | 'scrunchR' | 'shineL' | 'shineR'
  | 'cheekL' | 'cheekR' | 'sprig' | 'mouth' | 'tongueOpen' | 'tongueOut' | 'smile'
  | `fan${number}` | `olive${number}`

const FUR = '#A2673F'
const FUR_SHADE = '#8C5534'
const CREAM = '#FBE4C6'
const CREAM_SHADE = '#F3D2AC'
const EAR_IN = '#F4A9A0'
const IRIS = '#7A4526'
const LEAF = '#9DAA4E'
const LEAF_SHADE = '#7F8C3A'
const QUILL = '#7A4C33'
const QUILL_TIP = '#FCEBD2'
const OLIVE_GREEN = '#9DAA4E'
const OLIVE_DARK = '#4A2B3F'

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

// --- Quills ---------------------------------------------------------------------------------------------------------
// One quill points up from its base at 0,0 to its tip at 0,-len. Its width swells a little past the base and tapers to
// a rounded point. `quillPart` gives the outline of the stretch between fractions s0..s1 (for the banding).
const quillW = (s: number, w: number) => w * Math.pow(Math.sin(Math.PI * (0.16 + 0.78 * Math.min(1, s))), 0.6)
function quillPart(len: number, w: number, s0: number, s1: number) {
  const n = 10
  const left: string[] = []
  const right: string[] = []
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n
    const hw = quillW(s, w) / 2
    left.push(`${(-hw).toFixed(1)} ${(-s * len).toFixed(1)}`)
    right.unshift(`${hw.toFixed(1)} ${(-s * len).toFixed(1)}`)
  }
  // The tip gets a soft round cap (kawaii quills, not needles).
  const cap = s1 >= 1 ? ` Q0 ${(-(len + quillW(1, w) * 1.1)).toFixed(1)} ${right[0]}` : ''
  return `M${left.join(' L')}${cap} L${right.join(' L')}Z`
}

/** The cream stripes along a quill (fractions of its length); the rest is dark brown. The tip is cream. */
const BANDS: [number, number][] = [[0.47, 0.57], [0.68, 0.78], [0.88, 1]]

interface Fan {
  /** Rest angle (degrees, 0 = straight up, negative = toward her left / our left). */
  a: number
  x: number
  y: number
  len: number
  w: number
  /** Crest fans ride on the head; the rest are on her back and sides. */
  head: boolean
}
// Back to front: the low side fans first, the tall crest last. Symmetric pairs (left, right).
const FANS: Fan[] = [
  // Back quills peeking out behind her shoulders, pointing up and out.
  { a: -62, x: 172, y: 318, len: 122, w: 34, head: false },
  { a: 62, x: 228, y: 318, len: 122, w: 34, head: false },
  { a: -50, x: 170, y: 290, len: 142, w: 37, head: false },
  { a: 50, x: 230, y: 290, len: 142, w: 37, head: false },
  // The crest: a tall crown rising from the top and back of her head, longest in the middle.
  { a: -44, x: 170, y: 196, len: 172, w: 41, head: true },
  { a: 44, x: 230, y: 196, len: 172, w: 41, head: true },
  { a: -27, x: 182, y: 184, len: 198, w: 43, head: true },
  { a: 27, x: 218, y: 184, len: 198, w: 43, head: true },
  { a: -9, x: 194, y: 178, len: 214, w: 45, head: true },
  { a: 9, x: 206, y: 178, len: 214, w: 45, head: true },
]
// Each fan holds three quills: two shorter ones spread out to the sides, the longest in the middle on top.
const QUILLS = [
  { a: -13, dx: -7, k: 0.86 },
  { a: 13, dx: 7, k: 0.9 },
  { a: 0, dx: 0, k: 1 },
]
// Stuck olives: which fan they sit on (nice spots first: top of the crest, then the sides) and their color.
const OLIVES = [
  { fan: 8, color: OLIVE_GREEN },
  { fan: 7, color: OLIVE_DARK },
  { fan: 4, color: OLIVE_GREEN },
  { fan: 9, color: OLIVE_DARK },
  { fan: 5, color: OLIVE_DARK },
  { fan: 6, color: OLIVE_GREEN },
]

// --- Body shapes (viewBox 400 x 480, feet at y 470) ----------------------------------------------------------------
const HEAD = tufts(
  Array.from({ length: 20 }, (_, i) => {
    const th = (i / 20) * Math.PI * 2 - Math.PI / 2
    const s = Math.sin(th)
    return [200 + Math.cos(th) * (s > 0 ? 116 : 108), 206 + s * (s > 0 ? 92 : 98)] as [number, number]
  }),
  0.07,
)
// The cream face: a soft heart with a brown widow's peak on the forehead, like the reference.
const FACE = soft([[200, 152], [232, 134], [270, 146], [296, 178], [306, 216], [296, 254], [264, 282], [200, 294], [136, 282], [104, 254], [94, 216], [104, 178], [130, 146], [168, 134]], 0.1)
const TORSO = soft([[134, 286], [200, 274], [266, 286], [298, 336], [308, 396], [292, 440], [250, 456], [150, 456], [108, 440], [92, 396], [102, 336]], 0.1)
const BELLY = soft([[200, 300], [242, 314], [262, 366], [252, 418], [200, 440], [148, 418], [138, 366], [158, 314]], 0.12)
const ARM = soft([[-17, -8], [0, -14], [17, -8], [19, 16], [15, 32], [-15, 32], [-19, 16]], 0.1)
const LEG = soft([[-26, -22], [26, -22], [28, 10], [24, 26], [-24, 26], [-28, 10]], 0.1)

/** Spina the crested porcupine. Actions: shake, puff, hop, bleh, crunch, cheer, wave, dance, nod. Voice: spina. */
export const Spina = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; onTap?: () => void; stuck?: number }>(function Spina({ height, style, flip, onTap, stuck = 0 }, ref) {
  const [m] = useState(() => ({
    fans: FANS.map(() => spring(130, 7)),
    puff: spring(200, 11),
    earL: spring(170, 9),
    earR: spring(170, 9),
    sprig: spring(140, 6),
    ang: FANS.map((fan) => fan.a),
    prevLift: 0,
    gone: 0,
    shook: false,
  }))
  const stuckRef = useRef(stuck)
  stuckRef.current = Math.max(0, Math.min(MAX_STUCK, Math.round(stuck)))
  // A new olive count (the parent clears it after a shake, or adds one): show them all again.
  useEffect(() => {
    m.gone = 0
  }, [stuck, m])
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'spina',
    actions: SPINA_ACTIONS,
    eyes: [200, 212],
    reach: [200, 258],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.6)
      let sx = 1 - breathe * 0.01
      let sy = 1 + breathe * 0.016
      let lift = 0
      let lean = 0
      let head = Math.sin(t * 1.1) * 2.5 + f.look.x * 4
      let headY = breathe * 1.5
      let armL = -38 + Math.sin(t * 2.6) * 2
      let armR = -38 + Math.sin(t * 2.6 + 0.5) * 2
      let shL = 0
      let shR = 0
      // Raised paws: her head is big, so the arms reach out (stretch) from shoulders that slide outward.
      let upL = 0
      let upR = 0
      let legL = 0
      let legR = 0
      let eyes: 'open' | 'happy' | 'scrunch' = 'open'
      let eyeS = 1
      let open = 0
      let round = 0
      let puff = 0
      let rattle = 0
      let sway = Math.sin(t * 1.6) * 2 // gentle quill sway
      let earPerk = 0
      let cheek = 0
      let tongue = 0
      let fly = -1 // shake progress for the flying olives

      head += Math.sin(t * 11) * f.mouth * 3
      headY -= f.mouth * 3

      if (a === 'hop' || a === 'cheer') {
        const cheer = a === 'cheer'
        const k = cheer ? (q < 0.5 ? q / 0.5 : (q - 0.5) / 0.5) : q
        const crouch = bell(span(k, 0, 0.24))
        const air = bell(span(k, 0.24, 0.74))
        const land = wobble(span(k, 0.74, 1), 2)
        sx += crouch * 0.11 - air * 0.07 + land * 0.1
        sy += -crouch * 0.13 + air * 0.12 - land * 0.11
        lift = air * (cheer ? 46 : 70)
        headY += crouch * 10 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air
        armL = lerp(armL, cheer ? 128 + Math.sin(q * Math.PI * 8) * 12 : 90, up)
        armR = lerp(armR, cheer ? 128 + Math.sin(q * Math.PI * 8 + 1) * 12 : 90, up)
        shL = shR = -16 * up
        if (cheer) upL = upR = up
        legL = legR = -crouch * 8 + air * 10
        if (cheer) {
          eyes = 'happy'
          open = 0.6
          puff = 0.45 + Math.sin(q * Math.PI * 8) * 0.15
        } else {
          eyeS = 1 + air * 0.12
        }
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 156 + Math.sin(q * Math.PI * 7) * 18, up)
        shR = -24 * up
        upR = up
        head += up * 7
        lean -= up * 3
        open = up * 0.3
        if (up > 0.5) eyes = 'happy'
        sway += Math.sin(q * Math.PI * 7) * 4 * up
      } else if (a === 'puff') {
        // Bonk! A quick startled jolt (eyes wide, round mouth, quills puff huge), then she slowly relaxes.
        const jolt = smooth(span(q, 0, 0.07)) * (1 - smooth(span(q, 0.35, 0.7)))
        const big = smooth(span(q, 0, 0.06)) * (1 - smooth(span(q, 0.45, 1)))
        puff = big
        rattle = bell(span(q, 0.04, 0.3)) * 0.5
        sy += jolt * 0.1 - wobble(span(q, 0.08, 0.5), 2) * 0.05
        sx -= jolt * 0.06
        lift = bell(span(q, 0, 0.3)) * 18
        eyeS = 1 + jolt * 0.35
        round = jolt
        armL = lerp(armL, 60, jolt)
        armR = lerp(armR, 60, jolt)
        shL = shR = -10 * jolt
        earPerk = jolt * 16
        headY -= jolt * 6
        if (q > 0.7) ((eyes = 'happy'), (open = bell(span(q, 0.7, 1)) * 0.3))
      } else if (a === 'shake') {
        // Wet-dog shimmy: crouch and squeeze the eyes, shimmy hard (quills rattle, olives fly off), then a jelly settle.
        const prep = bell(span(q, 0, 0.16))
        const env = smooth(span(q, 0.12, 0.2)) * (1 - smooth(span(q, 0.7, 0.82)))
        const settle = wobble(span(q, 0.78, 1), 2)
        const w = Math.sin(span(q, 0.12, 0.82) * Math.PI * 16)
        sy += -prep * 0.1 + Math.abs(w) * env * 0.03 - settle * 0.06
        sx += prep * 0.08 + settle * 0.05
        lean += w * 11 * env + settle * 3
        head += -w * 12 * env
        headY += prep * 8
        lift = Math.abs(w) * env * 6
        armL = lerp(armL, 30 - w * 30, env)
        armR = lerp(armR, 30 + w * 30, env)
        legL = w * 6 * env
        legR = -w * 6 * env
        rattle = env * 1.6
        puff = env * 0.45 + prep * 0.15
        eyes = q > 0.06 && q < 0.86 ? 'scrunch' : 'open'
        open = env * 0.35
        earPerk = -10 * env
        fly = span(q, 0.18, 0.92)
      } else if (a === 'bleh') {
        // A taste ... then BLEH: eyes squeezed, tongue out, a fast head shake, quills bristle.
        const taste = bell(span(q, 0, 0.2))
        const yuck = smooth(span(q, 0.18, 0.28)) * (1 - smooth(span(q, 0.82, 0.96)))
        open = taste * 0.25 * Math.abs(Math.sin(q * Math.PI * 12))
        head += Math.sin(span(q, 0.28, 0.82) * Math.PI * 8) * 13 * yuck
        headY += yuck * 6
        sy -= yuck * 0.05
        sx += yuck * 0.03 + Math.sin(t * 40) * 0.008 * yuck
        lean += Math.sin(span(q, 0.28, 0.82) * Math.PI * 8) * -2 * yuck
        tongue = yuck
        if (yuck > 0.2) eyes = 'scrunch'
        armL = lerp(armL, 50, yuck)
        armR = lerp(armR, 50, yuck)
        puff = yuck * 0.35
        rattle = yuck * 0.35
        earPerk = -14 * yuck
      } else if (a === 'crunch') {
        // Yum: paws up to the mouth, munch munch (cheeks bounce), happy closed eyes.
        const env = smooth(span(q, 0, 0.12)) * (1 - smooth(span(q, 0.86, 1)))
        const chew = Math.abs(Math.sin(span(q, 0.1, 0.88) * Math.PI * 7))
        armL = lerp(armL, -122, env)
        armR = lerp(armR, -122, env)
        shL = shR = -6 * env
        open = env * chew * 0.55
        cheek = env * (1 - chew) * 1
        headY += env * chew * 4
        head += Math.sin(q * Math.PI * 3) * 4 * env
        sy += env * (chew - 0.5) * 0.025
        eyes = env > 0.4 ? 'happy' : 'open'
        sway += Math.sin(q * Math.PI * 7) * 3 * env
      } else if (a === 'dance') {
        // A tambourine step: side to side, a bounce on every beat, paws up shaking.
        const env = smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1)))
        const beat = Math.sin(q * Math.PI * 6)
        const bounce = Math.abs(Math.cos(q * Math.PI * 6))
        lean += beat * 9 * env
        lift = (1 - bounce) * 0 + bounce * 12 * env
        sy += (bounce - 0.5) * 0.06 * env
        sx -= (bounce - 0.5) * 0.04 * env
        head -= beat * 7 * env
        armL = lerp(armL, 124 + Math.sin(t * 30) * 8 + Math.min(0, beat) * -14, env)
        armR = lerp(armR, 124 + Math.sin(t * 30 + 1) * 8 + Math.max(0, beat) * 14, env)
        shL = shR = -14 * env
        upL = upR = env
        legL = Math.max(0, beat) * 14 * env
        legR = Math.max(0, -beat) * 14 * env
        eyes = 'happy'
        open = 0.45 * env
        puff = 0.2 * env
        sway += beat * 10 * env
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 14
        head += n * 3
        sy -= n * 0.03
        if (q > 0.15 && q < 0.85) eyes = 'happy'
      }

      // Follow-through: the quills lag behind every bounce and lean, flop when she lands, and puff on a spring.
      const dt = Math.max(f.dt, 1 / 120)
      const v = (lift - m.prevLift) / dt
      m.prevLift = lift
      const drive = Math.max(-16, Math.min(16, v * 0.05))
      const pf = Math.max(-0.2, m.puff.step(puff, f.dt))
      const headT = `translate(0 ${headY}) rotate(${head} 200 286)`

      FANS.forEach((fan, i) => {
        const side = Math.sign(fan.a)
        const tilt = fan.head ? head + lean : lean
        // Rising, the quills droop down and out; falling, they flick up. Leaning, they lag the other way.
        const target = -side * drive * (fan.head ? 0.7 : 1) - tilt * 0.6 + sway * (fan.head ? 1 : 0.6) + side * pf * 16
        const off = m.fans[i].step(target, f.dt)
        const jit = rattle > 0 ? Math.sin(t * 58 + i * 1.9) * rattle * 7 : 0
        const ang = fan.a + off + jit
        const ls = 1 + pf * 0.2 + (rattle > 0 ? Math.sin(t * 47 + i) * rattle * 0.03 : 0)
        const ws = 1 + pf * 0.3
        setT(p[`fan${i}`], `${fan.head ? headT : ''} translate(${fan.x} ${fan.y}) rotate(${ang.toFixed(2)}) scale(${ws.toFixed(3)} ${ls.toFixed(3)})`)
        m.ang[i] = ang + (fan.head ? head + lean : lean)
      })

      // Stuck olives: they sit on quill tips and ride along; a shake flings them off one by one.
      const n = stuckRef.current
      if (a === 'shake') m.shook = true
      else if (m.shook) ((m.shook = false), (m.gone = n))
      OLIVES.forEach((o, i) => {
        const el = p[`olive${i}`]
        const visible = i < n && i >= m.gone
        show(el, visible)
        if (!visible) return
        const fan = FANS[o.fan]
        const tipY = -fan.len * 0.92
        let k = 0
        if (fly >= 0) k = span(fly, 0.06 * i, 0.06 * i + 0.5)
        if (k <= 0) {
          setT(el, `translate(0 ${tipY})`)
          el?.setAttribute('opacity', '1')
          return
        }
        // Fly outward along the quill and arc down under gravity (world down, turned into the fan's frame).
        const th = (m.ang[o.fan] * Math.PI) / 180
        const out = 210 * k
        const drop = 520 * k * k - 200 * k
        const lx = drop * Math.sin(th)
        const ly = tipY - out + drop * Math.cos(th)
        setT(el, `translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${(k * 600).toFixed(0)})`)
        el?.setAttribute('opacity', String(1 - span(k, 0.7, 1)))
      })

      // Ears: little round ears perk up when she's startled, flop back on a shake, and wobble after a landing.
      const eL = m.earL.step(-earPerk + drive * 0.6 + (head - lean) * 0.3, f.dt)
      const eR = m.earR.step(-earPerk + drive * 0.6 - (head + lean) * 0.3, f.dt)

      setT(p.root, `translate(0 ${-lift}) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.5, lift / 200)})`)
      setT(p.head, headT)
      setT(p.earL, `translate(118 140) rotate(${-14 - eL})`)
      setT(p.earR, `translate(282 140) scale(-1 1) rotate(${-14 - eR})`)
      setT(p.armL, `translate(${132 + shL * 0.2 - upL * 18} ${316 + shL}) rotate(${armL}) scale(1 ${1 + upL * 0.36})`)
      setT(p.armR, `translate(${268 - shR * 0.2 + upR * 18} ${316 + shR}) scale(-1 1) rotate(${armR}) scale(1 ${1 + upR * 0.36})`)
      setT(p.legL, `translate(160 432) rotate(${legL})`)
      setT(p.legR, `translate(240 432) rotate(${-legR})`)
      setT(p.cheekL, `translate(124 256) scale(${1 + cheek * 0.45})`)
      setT(p.cheekR, `translate(276 256) scale(${1 + cheek * 0.45})`)
      // The leaf sprig on her head bobs on a spring (it flips around when she shakes or lands).
      setT(p.sprig, `translate(146 128) rotate(${m.sprig.step(-(head + lean) * 0.8 + drive * 0.9 - rattle * Math.sin(t * 40) * 10, f.dt)})`)

      for (const [eye, openG, arc, scr, shine, x] of [
        [p.eyeL, p.openL, p.happyL, p.scrunchL, p.shineL, 154],
        [p.eyeR, p.openR, p.happyR, p.scrunchR, p.shineR, 246],
      ] as const) {
        setT(eye, `translate(${x} 214) scale(${eyes === 'open' ? eyeS : 1} ${eyes === 'open' ? f.blink * eyeS : 1})`)
        show(openG, eyes === 'open')
        show(arc, eyes === 'happy')
        show(scr, eyes === 'scrunch')
        setT(shine, `translate(${f.look.x * 4} ${f.look.y * 4})`)
      }

      // Mouth: her voice opens it; a startle makes a round "o"; bleh pushes the tongue out.
      const mo = Math.min(1, Math.max(open, round * 0.8, tongue * 0.75, f.mouth * 1.15))
      if (mo > 0.05) {
        const w = lerp(11 + mo * 5 + tongue * 6, 7 + mo * 4, round)
        const d = 17 * mo
        setA(p.mouth, 'd', `M${200 - w} 258 Q200 ${258 - round * 6} ${200 + w} 258 Q${200 + w * 0.9} ${260 + d} 200 ${262 + d} Q${200 - w * 0.9} ${260 + d} ${200 - w} 258Z`)
        setA(p.tongueOpen, 'd', round > 0.5 || tongue > 0.1 ? '' : `M192 ${256 + 14 * mo} Q200 ${250 + 10 * mo} 208 ${256 + 14 * mo} Q206 ${259 + 17 * mo} 200 ${259 + 17 * mo} Q194 ${259 + 17 * mo} 192 ${256 + 14 * mo}Z`)
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongueOpen, 'd', '')
      }
      show(p.smile, mo <= 0.05)
      show(p.tongueOut, tongue > 0.1)
      setT(p.tongueOut, `translate(200 262) rotate(${Math.sin(t * 22) * 8 * tongue}) scale(1 ${0.4 + tongue * 0.6})`)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const quills = FANS.map((fan, i) => (
    <g key={i} ref={part(`fan${i}`)}>
      {QUILLS.map((qd, j) => {
        const len = fan.len * qd.k
        return (
          <g key={j} transform={`translate(${qd.dx} 0) rotate(${qd.a})`}>
            <path fill={QUILL} stroke={INK} strokeWidth="4.5" strokeLinejoin="round" d={quillPart(len, fan.w, 0, 1)} />
            {BANDS.map(([s0, s1]) => (
              <path key={s0} fill={QUILL_TIP} d={quillPart(len, fan.w - 4.5, s0, s1)} />
            ))}
          </g>
        )
      })}
      {OLIVES.map((o, k) =>
        o.fan === i ? (
          <g key={`o${k}`}>
          <g ref={part(`olive${k}`)} style={{ display: 'none' }}>
            <g transform="rotate(28)">
              <ellipse fill={o.color} stroke={INK} strokeWidth="4.5" rx="16" ry="20" />
              <ellipse fill="#fff" opacity={o.color === OLIVE_DARK ? 0.45 : 0.6} cx="-5.5" cy="-7" rx="4.4" ry="6.4" />
              {o.color === OLIVE_GREEN && <circle fill="#E8574F" stroke={INK} strokeWidth="3" cy="-20" r="4.2" />}
            </g>
          </g>
          </g>
        ) : null,
      )}
    </g>
  ))

  const leg = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
      <path fill={FUR} d={LEG} />
      <ellipse fill={FUR} cx={s === 'L' ? -4 : 4} cy="26" rx="31" ry="14" />
      {!pass && <path {...line(3)} d={`M${s === 'L' ? -14 : -4} 30 L${s === 'L' ? -14 : -4} 38 M${s === 'L' ? 4 : 14} 30 L${s === 'L' ? 4 : 14} 38`} />}
    </g>
  )
  const lower = (pass: boolean) => (
    <>
      {leg('L', pass)}
      {leg('R', pass)}
      <path fill={FUR} d={TORSO} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M104 404 C114 436 150 452 200 452 C150 444 118 428 104 404Z" />
          <path fill={CREAM} d={BELLY} />
          <path fill={CREAM_SHADE} opacity="0.7" d="M150 410 C166 432 234 432 250 410 C244 426 224 438 200 438 C176 438 156 426 150 410Z" />
        </>
      )}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d={ARM} />
      <circle fill={FUR} cx="0" cy="36" r="16" />
      {!pass && (
        <>
          <ellipse fill={CREAM_SHADE} cx="0" cy="38" rx="9" ry="8" />
          <path {...line(3)} d="M-6 44 L-6 51 M5 44 L5 51" />
        </>
      )}
    </g>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <circle fill={FUR} cx="0" cy="-10" r="24" />
      {!pass && <ellipse fill={EAR_IN} cx="2" cy="-10" rx="12" ry="13" />}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <path fill={FUR} d={HEAD} />
      {!pass && (
        <>
          <path fill={CREAM} d={FACE} />
          {/* Her signature: a little olive-leaf sprig tucked on her head */}
          <g ref={part('sprig')}>
            <g transform="scale(1.45)">
            <path {...line(3.5)} d="M0 6 Q2 -6 -2 -16" />
            <g transform="rotate(-38)">
              <path fill={LEAF} stroke={INK} strokeWidth="4" strokeLinejoin="round" d="M0 0 Q-13 -20 0 -44 Q13 -20 0 0Z" />
              <path {...line(2.4, LEAF_SHADE)} d="M0 -6 L0 -36" />
            </g>
            <g transform="rotate(34)">
              <path fill={LEAF} stroke={INK} strokeWidth="4" strokeLinejoin="round" d="M0 0 Q-12 -18 0 -40 Q12 -18 0 0Z" />
              <path {...line(2.4, LEAF_SHADE)} d="M0 -6 L0 -32" />
            </g>
            </g>
          </g>
          {/* A few short brown hairs on the forehead peak */}
          <path {...line(3)} d="M192 152 Q196 142 194 132 M208 152 Q204 142 206 132" />
          <path {...line(3.2)} d="M134 174 Q148 166 164 171 M236 171 Q252 166 266 174" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'cheekL' : 'cheekR')}>
              <ellipse fill={BLUSH} rx="17" ry="10" />
            </g>
          ))}
          {(['L', 'R'] as const).map((s) => (
            <g key={s} ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
              <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                <ellipse fill={EYE} rx="22" ry="25" />
                <ellipse fill={IRIS} cy="3" rx="17.5" ry="19.5" />
                <ellipse fill={EYE} cy="3" rx="9.5" ry="11" />
                <g ref={part(s === 'L' ? 'shineL' : 'shineR')}>
                  <circle fill="#fff" cx="-7" cy="-9" r="7.5" />
                  <circle fill="#fff" cx="8" cy="8" r="3.4" />
                </g>
                <path {...line(3, EYE)} d={s === 'L' ? 'M-17 -16 L-27 -22 M-21 -7 L-30 -10' : 'M17 -16 L27 -22 M21 -7 L30 -10'} />
              </g>
              <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(4.5, EYE)} d="M-18 4 Q0 -15 18 4" />
              <path ref={part(s === 'L' ? 'scrunchL' : 'scrunchR')} {...line(4.5, EYE)} d={s === 'L' ? 'M-15 -12 L11 0 L-15 12' : 'M15 -12 L-11 0 L15 12'} />
            </g>
          ))}
          <ellipse fill={EYE} cx="200" cy="240" rx="11" ry="8" />
          <ellipse fill="#fff" opacity="0.6" cx="196" cy="237" rx="3.6" ry="2.2" />
          <path {...line(2.8, EYE)} d="M200 248 L200 254" />
          <path ref={part('mouth')} {...line(3, EYE)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('tongueOut')} style={{ display: 'none' }}>
            <path fill={TONGUE} stroke={EYE} strokeWidth="3" strokeLinejoin="round" d="M-15 -4 Q-17 32 0 35 Q17 32 15 -4Z" />
            <path {...line(2.6, EYE)} d="M0 4 L0 20" />
          </g>
          <path ref={part('smile')} {...line(3.4, EYE)} d="M184 252 Q192 262 200 254 Q208 262 216 252" />
        </>
      )}
    </g>
  )
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Spina' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="104" ry="12" fill={INK} opacity="0.16" />
      <g ref={part('root')}>
        {quills}
        <g {...inkPass()}>{lower(true)}</g>
        {lower(false)}
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
