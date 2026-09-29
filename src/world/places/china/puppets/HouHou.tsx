// Hou Hou, a cheeky little golden snub-nosed monkey boy from the mountains of China: a layered SVG puppet
// (reference: art/source/world/china/houhou.png). Parts move every frame: a long curly tail on a chain of four springs
// (it lags, whips and curls), round ears and a head tuft on springs, blinking eyes that follow her finger, worried
// brows for "oops", hops with a crouch before and a squash after, and a mouth that opens with his voice.
import { forwardRef, useState, type CSSProperties } from 'react'
import { bell, lerp, setA, setT, show, smooth, span, spring, usePuppet, wobble, type PuppetHandle } from '../../../../sdk'
import { INK, inkPass, line, TONGUE, useInk } from './ink'

export const HOUHOU_ACTIONS: Record<string, number> = { wave: 1.4, cheer: 1.2, hop: 0.8, nod: 0.7, shake: 1.0, wiggle: 0.8, oops: 1.3, run: 0.9, point: 1.2, swing: 1.3, giggle: 1.0 }

type Part =
  | 'root' | 'shadow' | 'body' | 'head' | 'tuft' | 'earL' | 'earR' | 'armL' | 'armR' | 'finger' | 'legL' | 'legR'
  | 'foreL' | 'foreR' | 'tailInk' | 'tailFill' | 'held'
  | 'eyeL' | 'eyeR' | 'openL' | 'openR' | 'happyL' | 'happyR' | 'shineL' | 'shineR' | 'pupilL' | 'pupilR'
  | 'browL' | 'browR' | 'blushL' | 'blushR' | 'nose' | 'mouth' | 'tongueOpen' | 'smile'

const FUR = '#FDA033'
const FUR_SHADE = '#EF8A22'
const CREAM = '#FFE8C4'
const SKY = '#A6D9F7'
const SKY_SHADE = '#8CC8EE'
const BROWN = '#6B2E12'

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
const ring = (cx: number, cy: number, rx: number, ry: number, n: number): [number, number][] =>
  Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (Math.PI * 2 * i) / n
    return [+(cx + Math.cos(a) * rx).toFixed(1), +(cy + Math.sin(a) * ry).toFixed(1)]
  })

// Precomputed shapes (viewBox 400 x 480, feet at y 470, body centred on x 200).
const HEAD_RX = 128
const HEAD_RY = 100
const CHEEKS = tufts([
  ...Array.from({ length: 17 }, (_, i): [number, number] => {
    const a = (Math.PI * (-24 + i * 14.6)) / 180
    return [+(200 + Math.cos(a) * (HEAD_RX + 2)).toFixed(1), +(150 + Math.sin(a) * (HEAD_RY + 2)).toFixed(1)]
  }),
  [150, 140],
  [250, 140],
], 0.34)
const TUFT = 'M168 66 C158 56 162 44 174 42 L164 24 C178 24 186 30 190 36 L194 10 C206 16 212 26 214 36 L232 18 C234 30 234 40 230 48 C240 50 246 58 242 66 C216 58 192 58 168 66Z'
const TORSO = tufts([[156, 244], [200, 240], [244, 244], [258, 300], [256, 360], [246, 408], [232, 430], [168, 430], [154, 408], [144, 360], [142, 300]], 0.07)
const BELLY = soft(ring(200, 356, 40, 52, 9), 0.12)
const UPPER = tufts([[-17, -14], [17, -14], [24, 16], [22, 42], [0, 56], [-22, 42], [-24, 16]], 0.08)
const FORE = tufts([[-20, -16], [20, -16], [25, 14], [23, 36], [11, 50], [-11, 50], [-23, 36], [-25, 14]], 0.08)
const LEG = tufts([[-21, -6], [21, -6], [24, 20], [20, 42], [-20, 42], [-24, 20]], 0.08)
const FOOT = soft([[-32, 10], [-22, -10], [0, -14], [22, -10], [32, 10], [20, 16], [-20, 16]], 0.14)
const FACE_RING = 'M200 114 C188 96 160 92 138 102 C108 116 94 148 98 180 C102 220 146 250 200 250 C254 250 298 220 302 180 C306 148 292 116 262 102 C240 92 212 96 200 114Z'
const MASK = 'M200 134 C188 118 164 114 146 122 C122 134 112 156 114 180 C118 212 152 234 200 234 C248 234 282 212 286 180 C288 156 278 134 254 122 C236 114 212 118 200 134Z'

// The tail is ONE smooth tube: a stroked path through points that follow a chain of springs (the outline is the same
// path, wider, in brown, underneath). Nine short segments: four long ones, then four that curl into the tip.
const TAIL_LEN = [38, 38, 38, 38, 26, 22, 19, 16, 13]
const TAIL_REST = [-6, -16, -24, -30, -32, -34, -36, -38, -40]
const TAIL_W = 24
const PINK = '#FF9FA0'

/** Hou Hou the golden snub-nosed monkey. Actions: wave, cheer, hop, nod, shake, wiggle, oops, run, point, swing, giggle. Voice: houhou.
 *  `holding`: 'dumpling' or a CSS color (a brick of that color) held in his hands. `flip` mirrors him (tail to the left). */
export const HouHou = forwardRef<PuppetHandle, { height?: string; style?: CSSProperties; flip?: boolean; holding?: 'dumpling' | string; onTap?: () => void }>(function HouHou({ height, style, flip, holding, onTap }, ref) {
  const [m] = useState(() => ({
    earL: spring(140, 9), earR: spring(140, 9), tuft: spring(150, 7),
    t1: spring(110, 8), t2: spring(110, 7), t3: spring(110, 6), t4: spring(110, 5), t5: spring(110, 4.5),
    prevLift: 0, prevHead: 0, grip: 0, holding: false,
  }))
  m.holding = !!holding
  const ink = useInk<Part>()
  const { svg, part } = usePuppet<Part>(ref, {
    voice: 'houhou',
    actions: HOUHOU_ACTIONS,
    eyes: [200, 168],
    reach: [200, 208],
    frame: (f, p) => {
      const { t, p: q, action: a } = f
      const breathe = Math.sin(t * 2.4)
      let sx = 1 - breathe * 0.008
      let sy = 1 + breathe * 0.014
      let lift = 0
      let lean = 0
      let swing = 0
      let head = Math.sin(t * 0.9) * 2.5 + f.look.x * 4
      let headY = 26 + breathe * 1.5
      let armFree = 22 + Math.sin(t * 2.4) * 2
      let armL = armFree
      let armLen = 1
      let armLenL = 1
      let armR = armFree + Math.sin(t * 2.4 + 0.5) * 0.5
      let shL = 0
      let shR = 0
      let legL = 0
      let legR = 0
      let wag = Math.sin(t * 2.2) * 7
      let curl = 0
      let happy = false
      let open = 0
      let browTilt = -3
      let browY = 0
      let blush = 1
      let squint = 1
      let earPerk = 0
      let gaze = 0
      let grip = 1

      // Talking: little head bobs with his syllables.
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
        lift = air * (cheer ? 54 : 74)
        headY += crouch * 12 - air * 4
        const up = cheer ? smooth(span(q, 0, 0.1)) * (1 - smooth(span(q, 0.9, 1))) : air
        armL = lerp(armL, cheer ? 132 + Math.sin(q * Math.PI * 8) * 14 : 100, up)
        armR = lerp(armR, cheer ? 132 + Math.sin(q * Math.PI * 8 + 1) * 14 : 100, up)
        if (cheer) armLen = armLenL = 1 + 0.25 * up
        shL = shR = -26 * up
        legL = legR = -crouch * 8 + air * 10
        wag = Math.sin(t * 18) * 20
        curl = air * 14
        browY = -5 * up
        browTilt = -3 - 4 * up
        grip = 1 - up
        if (cheer) ((happy = true), (open = 0.6))
      } else if (a === 'wave') {
        const up = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.84, 1)))
        armR = lerp(armR, 136 + Math.sin(q * Math.PI * 7) * 18, up)
        armLen = 1 + 0.25 * up
        shR = -26 * up
        head += up * 7
        lean -= up * 3
        open = up * 0.3
        happy = up > 0.5
        wag = Math.sin(t * 9) * 16
        grip = 1 - up
      } else if (a === 'nod') {
        const n = Math.abs(Math.sin(q * Math.PI * 2)) * bell(q)
        headY += n * 15
        head += n * 3
        sy -= n * 0.03
        happy = q > 0.15 && q < 0.85
      } else if (a === 'shake') {
        // Gentle "no, not that one": a slow head shake, worried little brows, lips pressed.
        head += Math.sin(q * Math.PI * 5) * 12 * bell(q)
        browTilt += 12 * bell(q)
        browY -= 3 * bell(q)
        earPerk = -4 * bell(q)
        lean += Math.sin(q * Math.PI * 5 + 0.6) * 2 * bell(q)
        squint = 1 - 0.25 * bell(q)
        wag = Math.sin(t * 2.2) * 4 - 6 * bell(q)
      } else if (a === 'wiggle') {
        lean += Math.sin(q * Math.PI * 6) * 8 * bell(q)
        sx += Math.abs(Math.sin(q * Math.PI * 6)) * 0.04 * bell(q)
        headY += Math.abs(Math.sin(q * Math.PI * 6)) * 4 * bell(q)
        wag = Math.sin(q * Math.PI * 12) * 34
        armL = armFree + Math.sin(q * Math.PI * 6) * 20 * bell(q)
        armR = armFree - Math.sin(q * Math.PI * 6) * 20 * bell(q)
        happy = true
        open = 0.35 * bell(q)
      } else if (a === 'oops') {
        // Sheepish: hands fly to his cheeks, brows go up and worried, and he shrinks a little into his shoulders.
        const on = smooth(span(q, 0, 0.18)) * (1 - smooth(span(q, 0.82, 1)))
        const peek = wobble(span(q, 0.18, 0.5), 2)
        armL = lerp(armL, 152 + peek * 5, on)
        armR = lerp(armR, 152 + peek * 5, on)
        shL = shR = -10 * on
        sx -= 0.04 * on
        sy -= 0.07 * on
        headY += 9 * on
        head += Math.sin(q * Math.PI * 4) * 3 * on
        browTilt += 18 * on
        browY -= 7 * on
        blush = 1 + 0.25 * on
        squint = 1 - 0.2 * on
        open = 0.16 * on
        wag = -8 * on + Math.sin(q * Math.PI * 6) * 3
        curl = -10 * on
        grip = 1 - on
      } else if (a === 'run') {
        const s = Math.sin(q * Math.PI * 2 * 2)
        const b = Math.abs(s)
        lift = b * 14
        sy += (0.5 - b) * 0.08
        sx -= (0.5 - b) * 0.05
        lean += 7
        legL = s * 34
        legR = -s * 34
        armL = 20 - s * 45
        armR = 20 + s * 45
        shL = shR = -6
        head -= s * 2
        headY += (1 - b) * 4
        open = 0.4
        happy = false
        gaze = 1
        // Tail streams: stretched out behind, whipping with each step.
        wag = 16 + Math.sin(q * Math.PI * 8) * 12
        curl = -14
        grip = 0.4
      } else if (a === 'point') {
        // Pulls the arm back for a beat, then flings it out to the side and holds ("there's a gap!").
        const back = bell(span(q, 0, 0.16))
        const ext = smooth(span(q, 0.08, 0.3)) * (1 - smooth(span(q, 0.86, 1)))
        const pop = bell(span(q, 0.2, 0.42))
        armR = lerp(armR, 106, ext) - back * 14 + pop * 10
        armLen = 1 + 0.22 * ext
        shR = -20 * ext
        head += 7 * ext
        headY -= 2 * ext
        lean += 4 * ext - back * 2
        browY -= 5 * ext
        browTilt = -3 - 6 * ext
        open = 0.35 * ext
        gaze = ext
        wag = Math.sin(t * 6) * 8 + ext * 6
        grip = 1 - ext
      } else if (a === 'swing') {
        // Reaches up and grabs on, hops off the ground, swings like a pendulum with legs dangling, then lets go and lands.
        const grab = smooth(span(q, 0, 0.16)) * (1 - smooth(span(q, 0.86, 0.96)))
        const crouch = bell(span(q, 0, 0.1))
        const land = wobble(span(q, 0.9, 1), 2)
        const hang = grab * bell(span(q, 0.08, 0.92)) ** 0.5
        swing = Math.sin(q * Math.PI * 2 * 1.5) * 15 * hang
        lift = 26 * grab
        armL = lerp(armL, 142, grab)
        armR = lerp(armR, 142, grab)
        armLen = armLenL = 1 + 0.3 * grab
        shL = shR = -34 * grab
        sy += -crouch * 0.12 + 0.05 * grab - land * 0.1
        sx += crouch * 0.1 - land * 0.0 + land * 0.08
        legL = -swing * 1.3 + 8 * grab
        legR = -swing * 1.3 - 8 * grab
        happy = grab > 0.5
        open = 0.5 * grab
        wag = -swing * 0.9
        curl = 28 * grab
        grip = 1 - grab
      } else if (a === 'giggle') {
        // Hand over his mouth, shoulders bouncing, eyes squeezed shut.
        const on = smooth(span(q, 0, 0.14)) * (1 - smooth(span(q, 0.86, 1)))
        const shake = Math.sin(q * Math.PI * 16) * on
        armR = lerp(armR, -140, on)
        shR = -6 * on
        headY += Math.abs(shake) * -5 + 2 * on
        sy += shake * 0.02
        sx -= shake * 0.015
        head += 5 * on + shake * 3
        lean += shake * 1.5
        happy = on > 0.3
        open = 0.3 * on
        blush = 1 + 0.2 * on
        wag = Math.sin(t * 14) * 12 * on
        grip = 1 - on
      }

      // Holding something: both hands come in front of the belly.
      const g = m.grip + (Math.min(1, grip) - m.grip) * Math.min(1, f.dt * 14)
      m.grip = g
      const hold = m.holding ? g : 0
      if (hold > 0.001) {
        armL = lerp(armL, -12, hold)
        armR = lerp(armR, -12, hold)
      }

      // Ears, tuft and tail follow through: they lag when he rises or turns and flop when he lands.
      const dt = Math.max(f.dt, 1 / 120)
      const v = (lift - m.prevLift) / dt
      m.prevLift = lift
      const hv = (head - m.prevHead) / dt
      m.prevHead = head
      const drive = Math.max(-16, Math.min(22, -v * 0.05))
      const eL = Math.max(-14, Math.min(32, m.earL.step(2 + drive * 0.6 + earPerk - hv * 0.05 - (head - lean) * 0.3, f.dt)))
      const eR = Math.max(-14, Math.min(32, m.earR.step(2 + drive * 0.6 + earPerk + hv * 0.05 + (head + lean) * 0.3, f.dt)))
      const tf = Math.max(-40, Math.min(40, m.tuft.step(-hv * 0.06 + drive * 0.8 - lean * 0.5, f.dt)))
      // Each tail segment chases the one before it, a little later: a whip.
      const drv = wag - v * 0.04 + lean * 0.6
      const s1 = m.t1.step(drv, f.dt)
      const s2 = m.t2.step(s1, f.dt)
      const s3 = m.t3.step(s2, f.dt)
      const s4 = m.t4.step(s3, f.dt)
      const c = curl + Math.sin(t * 1.7) * 4
      const s5 = m.t5.step(s4, f.dt)
      const rot = TAIL_REST.map((r0, i) => {
        const base = [s1 * 0.5, (s2 - s1) * 0.8 - c * 0.2, (s3 - s2) * 0.9 - c * 0.3, (s4 - s3) - c * 0.4, (s5 - s4) * 0.9 - c * 0.5][Math.min(i, 4)]
        return r0 + (i < 5 ? base : (s5 - s4) * 0.35 - c * 0.35)
      })
      let tx = 250
      let ty = 404
      let ang = 0
      const pts: [number, number][] = [[tx, ty]]
      for (let i = 0; i < rot.length; i++) {
        ang += rot[i]
        tx += Math.cos((ang * Math.PI) / 180) * TAIL_LEN[i]
        ty += Math.sin((ang * Math.PI) / 180) * TAIL_LEN[i]
        pts.push([tx, ty])
      }
      const mid = (i: number) => `${((pts[i][0] + pts[i + 1][0]) / 2).toFixed(1)} ${((pts[i][1] + pts[i + 1][1]) / 2).toFixed(1)}`
      let td = `M${pts[0][0]} ${pts[0][1]} L${mid(0)}`
      for (let i = 1; i < pts.length - 1; i++) td += ` Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mid(i)}`
      td += ` L${pts[pts.length - 1][0].toFixed(1)} ${pts[pts.length - 1][1].toFixed(1)}`
      setA(p.tailInk, 'd', td)
      setA(p.tailFill, 'd', td)

      setT(p.root, `translate(0 ${-lift}) rotate(${swing} 200 -70) translate(200 468) rotate(${lean}) scale(${sx} ${sy}) translate(-200 -468)`)
      setT(p.shadow, `translate(200 470) scale(${1 - Math.min(0.5, lift / 200)})`)
      setT(p.head, `translate(0 ${headY}) rotate(${head} 200 240)`)
      setT(p.tuft, `translate(200 58) rotate(${tf}) translate(-200 -58)`)
      setT(p.earL, `translate(92 172) rotate(${eL})`)
      setT(p.earR, `translate(308 172) scale(-1 1) rotate(${eR})`)
      const bend = (ang: number) => {
        const w = (1 - smooth(span(ang, 30, 90))) * (1 - smooth(span(-ang, 30, 100)))
        return -70 * w - 14 * (1 - w)
      }
      setT(p.foreL, `translate(0 46) rotate(${bend(armL)})`)
      setT(p.foreR, `translate(0 46) rotate(${bend(armR)})`)
      setT(p.armL, `translate(${154 + shL * 0.2} ${300 + shL}) rotate(${armL}) scale(1 ${armLenL})`)
      setT(p.armR, `translate(${246 - shR * 0.2} ${300 + shR}) scale(-1 1) rotate(${armR}) scale(1 ${armLen})`)
      setT(p.legL, `translate(166 408) rotate(${legL})`)
      setT(p.legR, `translate(234 408) rotate(${-legR})`)
      show(p.finger, a === 'point' && armLen > 1.08)
      show(p.held, hold > 0.05)
      setT(p.held, `translate(200 ${352 + breathe}) scale(${(0.4 + hold * 0.6) * 1.35})`)
      setT(p.browL, `translate(0 ${browY}) rotate(${-browTilt} 156 138)`)
      setT(p.browR, `translate(0 ${browY}) rotate(${browTilt} 244 138)`)
      setT(p.blushL, `translate(126 208) scale(${blush})`)
      setT(p.blushR, `translate(274 208) scale(${blush})`)

      const lx = f.look.x + gaze * 1.2
      for (const [eye, openG, arc, pupil, shine, x] of [
        [p.eyeL, p.openL, p.happyL, p.pupilL, p.shineL, 158],
        [p.eyeR, p.openR, p.happyR, p.pupilR, p.shineR, 242],
      ] as const) {
        setT(eye, `translate(${x} 168) scale(1 ${happy ? 1 : f.blink * squint})`)
        show(openG, !happy)
        show(arc, happy)
        setT(pupil, `translate(${Math.max(-1.3, Math.min(1.3, lx)) * 3.4} ${f.look.y * 3.4})`)
        setT(shine, `translate(${lx * 1.2} ${f.look.y * 1.2})`)
      }

      const mo = Math.min(1, Math.max(open, f.mouth * 1.15))
      if (mo > 0.05) {
        const w = 13 + mo * 6
        setA(p.mouth, 'd', `M${200 - w} 209 Q200 213 ${200 + w} 209 Q${200 + w * 0.85} ${210 + 26 * mo} 200 ${212 + 26 * mo} Q${200 - w * 0.85} ${210 + 26 * mo} ${200 - w} 209Z`)
        setA(p.tongueOpen, 'd', `M190 ${207 + 22 * mo} Q200 ${199 + 16 * mo} 210 ${207 + 22 * mo} Q208 ${211 + 26 * mo} 200 ${211 + 26 * mo} Q192 ${211 + 26 * mo} 190 ${207 + 22 * mo}Z`)
      } else {
        setA(p.mouth, 'd', '')
        setA(p.tongueOpen, 'd', '')
      }
      show(p.smile, mo <= 0.05)
      ink.sync(p)
    },
  })

  const r = (name: Part, pass: boolean) => (pass ? ink.twin(name) : part(name))

  const leg = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'legL' : 'legR', pass)}>
      <path fill={FUR} d={LEG} />
      <path fill={CREAM} d={FOOT} transform="translate(0 46) scale(0.88 1)" />
      {!pass && <path {...line(3)} d="M-13 52 L-13 60 M0 54 L0 62 M13 52 L13 60" />}
    </g>
  )
  const lower = (pass: boolean) => (
    <>
      {leg('L', pass)}
      {leg('R', pass)}
      <path fill={FUR} d={TORSO} />
      {!pass && (
        <>
          <path fill={FUR_SHADE} opacity="0.5" d="M140 380 C148 414 170 428 200 428 C170 420 152 404 140 380Z" />
          <path fill={CREAM} d={BELLY} />
          <path {...line(3)} d="M176 330 Q182 340 178 350 M224 328 Q220 340 224 350 M198 396 Q202 404 198 410" />
        </>
      )}
    </>
  )
  const arm = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'armL' : 'armR', pass)}>
      <path fill={FUR} d={UPPER} />
      <g ref={r(s === 'L' ? 'foreL' : 'foreR', pass)}>
        {s === 'R' && <path ref={r('finger', pass)} fill={FUR} d="M-7 44 C-7 60 -4 72 0 72 C4 72 7 60 7 44Z" />}
        <path fill={FUR} d={FORE} />
        {!pass && <path {...line(3)} d="M-10 40 L-10 49 M2 43 L2 52 M13 40 L13 49" />}
      </g>
      {!pass && <path {...line(3)} d="M-14 14 Q-17 26 -13 36" />}
    </g>
  )
  const ear = (s: 'L' | 'R', pass: boolean) => (
    <g ref={r(s === 'L' ? 'earL' : 'earR', pass)}>
      <ellipse fill={FUR} cx="-16" cy="0" rx="34" ry="37" />
      {!pass && <ellipse fill={CREAM} cx="-17" cy="2" rx="18" ry="22" />}
    </g>
  )
  const headG = (pass: boolean) => (
    <g ref={r('head', pass)}>
      {ear('L', pass)}
      {ear('R', pass)}
      <ellipse fill={FUR} cx="200" cy="150" rx={HEAD_RX} ry={HEAD_RY} />
      <path fill={FUR} d={CHEEKS} />
      <g ref={r('tuft', pass)}>
        <path fill={FUR} d={TUFT} />
      </g>
      {!pass && (
        <>
          <path {...line(3)} d="M182 44 Q192 34 204 40 M208 34 Q216 28 226 36" />
          <path {...line(3)} d="M92 136 Q100 146 96 158 M308 136 Q300 146 304 158" />
          <g transform="translate(200 170) scale(1.08 1) translate(-200 -170)">
          <path fill={CREAM} d={FACE_RING} />
          <path fill={SKY} d={MASK} />
          <path fill={SKY_SHADE} opacity="0.55" d="M116 194 C124 218 158 234 200 234 C242 234 276 218 284 194 C268 220 238 228 200 228 C162 228 132 220 116 194Z" />
          </g>
          <ellipse fill={CREAM} cx="200" cy="208" rx="46" ry="30" />
          <ellipse ref={part('blushL')} fill={PINK} rx="21" ry="13" />
          <ellipse ref={part('blushR')} fill={PINK} rx="21" ry="13" />
          {(['L', 'R'] as const).map((s) => (
            <g key={s}>
              <path ref={part(s === 'L' ? 'browL' : 'browR')} {...line(4.5, BROWN)} d={s === 'L' ? 'M140 142 Q158 130 174 140' : 'M226 140 Q242 130 260 142'} />
              <g ref={part(s === 'L' ? 'eyeL' : 'eyeR')}>
                <g ref={part(s === 'L' ? 'openL' : 'openR')}>
                  <ellipse fill="#fff" rx="25" ry="28" />
                  <g ref={part(s === 'L' ? 'pupilL' : 'pupilR')}>
                    <ellipse fill={BROWN} rx="20" ry="24" cx={s === 'L' ? 1 : -1} cy="1" />
                    <g ref={part(s === 'L' ? 'shineL' : 'shineR')}>
                      <circle fill="#fff" cx="-4" cy="-9" r="7.5" />
                      <circle fill="#fff" cx="7" cy="8" r="3.4" />
                    </g>
                  </g>
                  <path {...line(3, BROWN)} d="M-24 -6 Q-25 -22 -8 -27 M24 -6 Q25 -22 8 -27" opacity="0" />
                </g>
                <path ref={part(s === 'L' ? 'happyL' : 'happyR')} {...line(5, BROWN)} d="M-20 6 Q0 -18 20 6" />
              </g>
            </g>
          ))}
          <g ref={part('nose')}>
            <ellipse cx="200" cy="192" rx="17" ry="11" fill={SKY} stroke={INK} strokeWidth="3.4" />
            <circle cx="193" cy="193" r="2.6" fill={BROWN} />
            <circle cx="207" cy="193" r="2.6" fill={BROWN} />
          </g>
          <path ref={part('mouth')} {...line(3.2, BROWN)} fill="#8E3432" d="" />
          <path ref={part('tongueOpen')} fill={TONGUE} d="" />
          <g ref={part('smile')}>
            <path {...line(3.6, BROWN)} d="M184 210 Q200 224 216 210" />
          </g>
        </>
      )}
    </g>
  )
  const item =
    holding === 'dumpling' ? (
      <g>
        <path fill="#FFF3E2" stroke={INK} strokeWidth="4" strokeLinejoin="round" d="M-34 8 C-38 -18 -18 -30 -4 -30 L0 -38 L5 -30 C20 -30 38 -18 34 8 C30 22 -30 22 -34 8Z" />
        <path {...line(3)} d="M-4 -28 Q-12 -12 -20 4 M2 -28 Q0 -10 -2 8 M8 -28 Q16 -12 22 2" />
      </g>
    ) : holding ? (
      <g>
        <rect x="-32" y="-19" width="64" height="38" rx="7" fill={holding} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        <path {...line(3)} d="M-4 -19 L-4 0 M-20 0 L32 0 M12 0 L12 19" opacity="0.7" />
      </g>
    ) : null
  return (
    <svg ref={svg} viewBox="0 0 400 480" onClick={onTap} role={onTap ? 'button' : undefined} aria-label={onTap ? 'Hou Hou' : undefined} style={{ height, overflow: 'visible', display: 'block', transform: flip ? 'scaleX(-1)' : undefined, ...style }}>
      <ellipse ref={part('shadow')} rx="100" ry="12" fill="#6E3B24" opacity="0.16" />
      <g ref={part('root')}>
        <path ref={part('tailInk')} fill="none" stroke={INK} strokeWidth={TAIL_W + 10} strokeLinecap="round" strokeLinejoin="round" />
        <path ref={part('tailFill')} fill="none" stroke={FUR} strokeWidth={TAIL_W} strokeLinecap="round" strokeLinejoin="round" />
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
        <g ref={part('held')}>{item}</g>
      </g>
    </svg>
  )
})
