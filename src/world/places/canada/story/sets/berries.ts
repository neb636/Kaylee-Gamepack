// Berries that look like berries (the rainforest river's bushes, story/sets/bath.ts, and the bath's three paint bushes,
// activities/bath/props.ts). Each kind has what makes it read at a glance:
//   bumpy   a salmonberry or raspberry: a dome of little round drupelets, a green star of sepals on top
//   long    a blackberry: the same drupelets on a longer, rounder cluster
//   crown   a blueberry or huckleberry: one round, slightly flat berry with a little five-point crown on top
// and every berry gets a white shine (no ink line round the shine). Parts go into `lined` (inked) and `plain` (not),
// for engine3d/geo.ts solidMix.
import type { BufferGeometry } from 'three'
import { Color } from 'three'
import { P, type V3 } from '../../../../engine3d/geo'

export type BerryShape = 'bumpy' | 'long' | 'crown'

export interface BerryParts {
  lined: BufferGeometry[]
  plain: BufferGeometry[]
}

const SEPAL = '#4E9A45'
const SHINE = '#FFFFFF'

const shade = (c: string, k: number) => '#' + new Color(c).multiplyScalar(k).getHexString()
const light = (c: string, k: number) => '#' + new Color(c).lerp(new Color('#FFFFFF'), k).getHexString()

/** One berry `r` across (its radius), at `at`, hanging from its top (+y). `seg` lowers the drupelets' detail far away. */
export function berry(shape: BerryShape, color: string, r: number, at: V3, out: BerryParts, seg = 7) {
  const [x, y, z] = at
  if (shape === 'crown') {
    out.lined.push(P.sphere(r, color, { at: [x, y, z], scale: [1, 0.88, 1] }, 14))
    // The little crown: five points round a dark dimple on top.
    const dark = shade(color, 0.6)
    out.plain.push(P.cyl(r * 0.32, r * 0.22, r * 0.12, dark, { at: [x, y + r * 0.86, z] }, 10))
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      out.plain.push(P.cone(r * 0.12, r * 0.24, dark, { at: [x + Math.cos(a) * r * 0.3, y + r * 0.92, z + Math.sin(a) * r * 0.3], rot: [Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5] }, 5))
    }
    // A dusty bloom on the shoulder, and the shine.
    out.plain.push(P.sphere(r * 0.55, light(color, 0.35), { at: [x - r * 0.42, y + r * 0.22, z + r * 0.55], scale: [1, 0.8, 0.35] }, 8))
    out.plain.push(P.sphere(r * 0.2, SHINE, { at: [x - r * 0.38, y + r * 0.38, z + r * 0.86], scale: [1, 1.3, 0.4] }, 8))
    return
  }
  // Drupelets: rings of little balls round a dome (taller for a blackberry), the lower ones a shade darker.
  const tall = shape === 'long' ? 1.35 : 1
  const d = r * 0.36
  out.lined.push(P.sphere(r * 0.8, shade(color, 0.85), { at: [x, y - r * 0.05, z], scale: [1, tall, 1] }, 10))
  const rings = shape === 'long' ? 5 : 4
  for (let k = 0; k < rings; k++) {
    const v = (k + 0.5) / rings
    const phi = 0.35 + v * 2.3
    const n = Math.max(4, Math.round(Math.sin(phi) * 9))
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + k * 0.6
      const rr = Math.sin(phi) * r * 0.78
      const c = k >= rings - 1 ? shade(color, 0.82) : k === 0 ? light(color, 0.12) : color
      out.lined.push(P.sphere(d, c, { at: [x + Math.cos(a) * rr, y + Math.cos(phi) * r * 0.78 * tall, z + Math.sin(a) * rr] }, seg))
    }
  }
  // The green star of sepals on top, and a shine on one drupelet.
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.3
    out.lined.push(P.sphere(r * 0.34, SEPAL, { at: [x + Math.cos(a) * r * 0.3, y + r * 0.82 * tall, z + Math.sin(a) * r * 0.3], rot: [0, -a, 0.25], order: 'YZX', scale: [1, 0.22, 0.5] }, 6))
  }
  out.plain.push(P.sphere(d * 0.42, SHINE, { at: [x - r * 0.3, y + r * 0.34 * tall, z + r * 0.8] }, 6))
}

/** A leaf `s` long at `at`, pointing out along `yaw` (radians round y), tipped down `droop`: a pointed oval with a
 *  paler vein down the middle. */
export function leaf(color: string, s: number, at: V3, yaw: number, droop: number, out: BerryParts) {
  out.lined.push(P.sphere(s * 0.5, color, { at, rot: [0, yaw, droop], order: 'YZX', scale: [1, 0.1, 0.42] }, 8))
  out.plain.push(P.box(s * 0.82, s * 0.02, s * 0.03, light(color, 0.3), { at: [at[0], at[1] + s * 0.035, at[2]], rot: [0, yaw, droop], order: 'YZX' }))
}
