// Dad's head for the shared chibi rig (`hairdo.style: 'crop'` on a unicorn): a unicorn in the family's toy style who
// looks a little like the real Dad (the user's photos, 2026-11-23). A full round face with chubby cheeks, short
// light-brown hair cropped close with the fringe brushed up and the hairline a little higher at the temples, light
// brows, blue eyes (animal.ts draws them), a day's stubble over the jaw and round the mouth, a small cream muzzle with
// a pink nose, soft upright ears with a rounded tip like Kaylee's and Mom's, and a twisted gold horn.
// Head coordinates are in head radii R.
import { Euler, Matrix4, Vector3, type BufferGeometry } from 'three'
import { smoothstep as smooth } from '../../../sdk/math'
import { P, sculpt, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

const NOSE = '#F59DB4'
const HORN = ['#FFB733', '#F2A024']
const ZERO = new Vector3()
const UP = new Vector3(0, 1, 0)

/** An ear's shape from a ball: wide low down, a soft rounded tip, thin, and cupped a little. */
const earShape = (p: Vector3) => {
  const t = (p.y + 1) / 2
  p.x *= 1.08 - 0.5 * t ** 1.6
  p.z = p.z * 0.32 * (1 - 0.4 * t) + 0.22 * p.x * p.x
}

/** How far down the hair comes at each angle round the head (0 = the middle of the forehead, π = the back), as a
 *  height on the unit head: a fringe line that rises at the temples, a short sideburn, then down to the nape. */
const HAIRLINE: [number, number][] = [[0, 0.52], [0.55, 0.6], [0.98, 0.44], [1.22, -0.02], [1.6, -0.2], [2.2, -0.48], [Math.PI, -0.55]]
function hairline(phi: number) {
  for (let i = 1; i < HAIRLINE.length; i++) {
    const [a0, y0] = HAIRLINE[i - 1]
    const [a1, y1] = HAIRLINE[i]
    if (phi <= a1) return y0 + (y1 - y0) * smooth(a0, a1, phi)
  }
  return HAIRLINE[HAIRLINE.length - 1][1]
}
/** The hair's surface, in head radii from the middle of the head, in direction `d` (a unit vector): under the head's
 *  skin below the hairline, a short crop above it, a little fuller on top and brushed up over the forehead. */
function hairRadius(d: Vector3) {
  const turn = Math.atan2(d.x, d.z)
  const phi = Math.abs(turn)
  // (The fringe ends in short points, each leaning the same way.)
  const saw = (((turn * 2.3 + 0.35) % 1) + 1) % 1
  const line = hairline(phi) - 0.1 * saw * saw * (1 - smooth(0.85, 1.1, phi))
  const h = smooth(line - 0.03, line + 0.13, d.y)
  const top = Math.max(0, d.y)
  const quiff = 0.055 * Math.exp(-((phi / 0.85) ** 2)) * smooth(0.42, 0.66, d.y) * (1 - smooth(0.86, 1, d.y))
  return 0.95 + h * (0.092 + 0.012 * top * top + quiff)
}

/** A repeatable random (0..1) from a whole number. */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

/** `outlined` and `plain` go on the head; `hair` is his hair (the rig's mane group, so the barber's strands can take
 *  its place); `horn` stands on its own pivot; `mouth` is where his mouth goes. */
export function dadHead(look: Look, f: Frame) {
  const { R, headY, eyeX, eyeY, on, turnTo } = f
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const outlined: BufferGeometry[] = [P.sphere(R, look.fur, { at: at(0, 0, 0) }, 40)]
  const plain: BufferGeometry[] = []
  const hair: BufferGeometry[] = []
  const horn: BufferGeometry[] = []

  // Chubby cheeks that fill out the jaw, and a small cream muzzle with a pink nose on top.
  for (const s of [-1, 1]) outlined.push(P.sphere(0.52 * R, look.fur, { at: at(s * 0.57, -0.4, 0.16) }, 24))
  const M = { c: new Vector3(0, -0.36, 0.68), r: new Vector3(0.5, 0.34, 0.36) }
  outlined.push(P.sphere(R, look.light, { at: at(M.c.x, M.c.y, M.c.z), scale: [M.r.x, M.r.y, M.r.z] }, 28))
  plain.push(P.sphere(0.065 * R, NOSE, { at: at(0, -0.17, 0.99), scale: [1.35, 0.8, 0.7] }))

  for (const s of [-1, 1]) {
    // Upright ears with a soft tip, leaning out a little: fur outside, pink inside.
    const lean: V3 = [-0.1, s * 0.28, -s * 0.42]
    outlined.push(sculpt(look.fur, 32, earShape, { at: at(s * 0.7, 0.86, -0.06), rot: lean, scale: [0.36 * R, 0.46 * R, 0.36 * R] }))
    plain.push(sculpt(look.ear ?? look.light, 24, earShape, { at: at(s * 0.69, 0.82, 0.02), rot: lean, scale: [0.22 * R, 0.31 * R, 0.22 * R] }))
    // Short light brows, a little higher at the inner end.
    if (look.brows) {
      const x = s * eyeX * 1.02
      plain.push(P.capsule(0.036 * R, 0.17 * R, look.brows, { at: on(x, eyeY + 0.34 * R, 0.01 * R), rot: [-0.3, turnTo(x)[1], Math.PI / 2 + s * 0.16], scale: [1, 1, 0.5] }))
    }
  }

  // The horn: a twist of gold, each turn smaller and a little off to one side of the last.
  let hy = 1.02
  for (let i = 0, r = 0.235; i < 9; i++, r *= 0.85) {
    horn.push(P.sphere(r * R, HORN[i % 2], { at: at((i % 2 ? 0.012 : -0.012), hy, 0.2 + hy * 0.12), rot: [0.2, 0, i % 2 ? 0.2 : -0.2], scale: [1, 0.62, 1] }, 16))
    hy += r * 0.6
  }

  // ---- His hair: one smooth short crop ----
  hair.push(sculpt(look.hairdo!.color, 96, (p) => p.multiplyScalar(hairRadius(p)), { at: at(0, 0, 0), scale: [R, R, R] }))
  // ---- A day's stubble: fine dots along the jaw and round the mouth ----
  if (look.stubble) {
    const basis = new Matrix4()
    const e = new Euler()
    let n = 0
    const dot = (q: Vector3, nrm: Vector3) => {
      n++
      e.setFromRotationMatrix(basis.lookAt(nrm, ZERO, UP))
      plain.push(P.sphere((0.017 + rand(n) * 0.006) * R, look.stubble!, { at: at(q.x, q.y, q.z), rot: [e.x, e.y, e.z], scale: [1, 1, 0.35] }, 6))
    }
    const q = new Vector3()
    const nrm = new Vector3()
    // On the muzzle: round its lower half and up beside the nose (not on the nose or the mouth).
    for (const [psi, count] of [[0.6, 13], [0.82, 17], [1.03, 21], [1.22, 24], [1.4, 24]] as const) {
      for (let i = 0; i < count; i++) {
        const th = ((i + (rand(n + 5) - 0.5) * 0.5 + (psi * 7) % 1) / count) * Math.PI * 2
        if (Math.abs(th - Math.PI / 2) < 0.75) continue
        const ps = psi + (rand(n + 9) - 0.5) * 0.1
        nrm.set(Math.sin(ps) * Math.cos(th), Math.sin(ps) * Math.sin(th), Math.cos(ps))
        q.copy(nrm).multiply(M.r).add(M.c)
        if (q.length() < 1.01) continue
        nrm.divide(M.r).normalize()
        dot(q.addScaledVector(nrm, 0.004), nrm)
      }
    }
    // On the jaw and cheeks, out to the sideburns.
    for (const [y, count, reach] of [[-0.4, 12, 1.2], [-0.52, 13, 1.2], [-0.64, 12, 1.12], [-0.76, 10, 1.0], [-0.86, 6, 0.8]] as const) {
      for (let i = 0; i < count; i++) {
        const phi = (((i + 0.5 + (rand(n + 5) - 0.5) * 0.6) / count) * 2 - 1) * reach
        const yy = y + (rand(n + 9) - 0.5) * 0.07
        const k = Math.sqrt(1 - yy * yy)
        nrm.set(Math.sin(phi) * k, yy, Math.cos(phi) * k)
        q.copy(nrm).multiplyScalar(1.004)
        // (The cheeks stand out past the head ball here, and the muzzle covers the middle.)
        if (q.clone().sub(M.c).divide(M.r).length() < 1.06) continue
        for (const s of [-1, 1]) {
          const cheek = new Vector3(s * 0.6, -0.4, 0.16)
          const b = nrm.dot(cheek)
          const disc = b * b - cheek.lengthSq() + 0.52 * 0.52
          if (disc > 0 && b + Math.sqrt(disc) > 1) q.copy(nrm).multiplyScalar(b + Math.sqrt(disc) + 0.004)
        }
        dot(q, nrm)
      }
    }
  }

  const mouth: V3 = at(0, -0.42, 1.025)
  return { outlined, plain, hair, horn, mouth }
}
