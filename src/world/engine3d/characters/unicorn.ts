// Details for the short-haired family unicorn, in head radii around the skull.
import type { BufferGeometry } from 'three'
import { P, sculpt, type V3 } from '../geo'
import type { Frame } from './animal'
import { earShape } from './fox'
import type { Look } from './look'

export function unicornCrop(look: Look, { R, headY, on, turnTo }: Frame, head: BufferGeometry[], plain: BufferGeometry[]) {
  const at = (x: number, y: number, z: number): V3 => [x * R, headY + y * R, z * R]
  const [brown, highlight = brown] = look.mane ?? [look.dark]
  // A close crop follows the skull. Its irregular hairline dips at the temples and nape.
  head.push(sculpt(brown, 56, (p) => {
    const angle = Math.atan2(p.x, p.z)
    const line = 0.93 - 0.57 * Math.cos(angle) + 0.026 * Math.sin(13 * angle)
    const polar = Math.acos(p.y) / Math.PI
    // Fold the underside back inside the skull to close the edge.
    const theta = Math.min(polar / 0.85, 1) * (line + 0.51)
    const radius = polar < 0.85 ? 1.028 : 1.028 - (polar - 0.85) * 2
    p.set(Math.sin(theta) * Math.sin(angle), Math.cos(theta), Math.sin(theta) * Math.cos(angle)).multiplyScalar(radius)
  }, { at: at(0, 0, 0), scale: [R, R, R] }))

  // Taper each lock toward its tip, which rests just across the hairline.
  for (const [x, y, z, lean] of [[-0.37, 0.78, 0.49, -0.55], [-0.13, 0.79, 0.57, -0.48], [0.12, 0.80, 0.55, -0.35]]) {
    plain.push(sculpt(highlight, 24, (p) => {
      p.x *= 0.75 - 0.42 * p.z
      p.x -= 0.42 * p.z * p.z
    }, { at: at(x, y, z), rot: [0.84, -0.30, lean], scale: [0.135 * R, 0.09 * R, 0.31 * R] }))
  }
  for (const s of [-1, 1]) {
    const rot: V3 = [-0.1, s * 0.26, -s * 0.43]
    head.push(sculpt(look.fur, 32, earShape, { at: at(s * 0.71, 0.92, -0.06), rot, scale: [0.39 * R, 0.43 * R, 0.43 * R] }))
    plain.push(sculpt(look.ear ?? look.light, 28, earShape, { at: at(s * 0.71, 0.92, 0.017), rot, scale: [0.25 * R, 0.30 * R, 0.28 * R] }))
    const x = s * 0.38 * R
    plain.push(P.sphere(R, brown, { at: on(x, 0.40 * R, 0.007 * R), rot: [-0.38, turnTo(x)[1], -s * 0.10], scale: [0.165, 0.043, 0.042] }, 24))
  }
}
