// The water buffalo's head, sculpted (Bird and BB, and every buffalo in the game: the mushroom farmer, Lung Kwai, the
// bay's fisherman and village kid). Before 2026-11-24 its horns were a torus cut off square with a cone stuck on the
// end, and its muzzle a wide flat slab across the lower face. Now each horn is one smooth tapering tube that sweeps out
// from the side of the head and curls up to a rounded tip (like the Pixar bull the user sent), cream at the root and
// paler at the tip; the muzzle is a smaller rounded pad with the nostrils set into its front; the ears are leaves that
// droop a little under the horns. Head coordinates are in head radii R.
import { Color, Vector3, type BufferGeometry } from 'three'
import { P, sculpt, type V3 } from '../geo'
import type { Frame } from './animal'
import { painted } from './fox'
import type { Look } from './look'

/** How the head ball is squashed: a little wide (the same as before, so hats and glasses still fit). */
const HEAD: V3 = [1.1, 0.98, 1]
const HORN_ROOT = '#EBD3A8'
const HORN_TIP = '#FFF8EC'
const NOSTRIL = '#3A2E40'

/** One horn on side `s` (+1 her left, our right from the front): a ball bent along an arc, fat at the root, tapering to
 *  a rounded tip. The arc leaves the head heading out and a touch down, then bends up and a little in. */
function horn(s: number, R: number, headY: number) {
  /** Where the root sits inside the head, the arc's radius, where it starts heading and how far it turns (radians). */
  const root = new Vector3(0.62 * s * R, headY + 0.4 * R, -0.06 * R)
  const rho = 0.62 * R
  const head0 = -0.22
  const sweep = 2.15
  const phi0 = head0 - Math.PI / 2
  const middle = (t: number, out = new Vector3()) => {
    const a = phi0 + sweep * t
    // (The arc's center is straight "up" of the start, so the start is on the circle.)
    return out.set(s * rho * (Math.cos(a) - Math.cos(phi0)), rho * (Math.sin(a) - Math.sin(phi0)), -0.1 * R * t * t).add(root)
  }
  const c = new Vector3()
  const ahead = new Vector3()
  const a = new Vector3()
  const b = new Vector3()
  const z = new Vector3(0, 0, 1)
  const along: number[] = []
  const tip = new Color(HORN_TIP)
  const base = new Color(HORN_ROOT)
  return painted(HORN_ROOT, 40, (p) => {
    const t = (p.y + 1) / 2
    middle(t, c)
    ahead.copy(middle(Math.min(1, t + 0.02), a)).sub(middle(Math.max(0, t - 0.02), b)).normalize()
    a.crossVectors(ahead, z).normalize()
    b.crossVectors(a, ahead).normalize()
    // Fat at the root, thinning steadily to the tip (the ball's own roundness closes both ends).
    const round = Math.max(1e-4, 1 - p.y * p.y) ** -0.35
    const r = (0.045 + 0.165 * (1 - t) ** 0.85) * R * Math.min(1.6, round)
    const x = p.x * r, w = p.z * r
    along.push(t)
    p.set(c.x + a.x * x + b.x * w, c.y + a.y * x + b.y * w, c.z + a.z * x + b.z * w)
  }, (_, i) => '#' + base.clone().lerp(tip, Math.min(1, Math.max(0, (along[i] - 0.35) / 0.55))).getHexString(), {})
}

export function buffaloHead(look: Look, f: Frame) {
  const { R, headY } = f
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const outlined: BufferGeometry[] = [P.sphere(R, look.fur, { at: at(0, 0, 0), scale: HEAD }, 44)]
  const plain: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    outlined.push(horn(s, R, headY))
    // A leaf of an ear sticking out under the horn, its tip drooping a little, pink inside.
    const ear = (q: Vector3) => {
      const t = (q.x * s + 1) / 2
      q.y *= 1.05 - 0.4 * t ** 1.6
      q.z *= 1 - 0.4 * t
    }
    outlined.push(sculpt(look.fur, 32, ear, { at: at(s * 1.0, 0.1, -0.06), rot: [0, -s * 0.35, -s * 0.38], scale: [0.34 * R, 0.19 * R, 0.1 * R] }))
    plain.push(sculpt(look.ear ?? look.light, 24, ear, { at: at(s * 1.03, 0.095, 0.0), rot: [0, -s * 0.35, -s * 0.38], scale: [0.24 * R, 0.12 * R, 0.05 * R] }))
  }
  // The muzzle: a rounded pad, a little wider at the bottom than the top, sitting low on the face.
  outlined.push(sculpt(look.light, 40, (p) => {
    p.x *= 1 - 0.12 * p.y
    p.z *= 1 - 0.15 * Math.max(0, p.y)
  }, { at: at(0, -0.37, 0.7), scale: [0.45 * R, 0.31 * R, 0.37 * R] }))
  // Two nostrils set into its front, tipped in at the top.
  for (const s of [-1, 1]) {
    plain.push(sculpt(NOSTRIL, 16, (p) => {
      p.x *= 1 + 0.2 * p.y
    }, { at: at(s * 0.15, -0.29, 1.035), rot: [-0.3, s * 0.32, s * 0.45], scale: [0.065 * R, 0.042 * R, 0.03 * R] }))
  }
  return { outlined, plain, mouth: at(0, -0.53, 1.0) }
}
