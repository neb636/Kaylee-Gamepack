// A raccoon for the shared chibi rig: a wide head with fluffy cheek ruffs, big round-tipped ears, the bandit mask as two
// dark patches that sweep out to the cheeks under white brows, a short white muzzle, and a fat ringed tail that curls
// up beside the body so it shows from the front. The markings lie flush on the head (no lumps, no ink round them), like
// the beaver's. Head coordinates are in head radii R, the tail's in body heights H.
import { BufferAttribute, BufferGeometry, Color, SphereGeometry, Vector3 } from 'three'
import { bake, P, type PartOpts, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

/** How the head ball is squashed: wide and a little low (things worn on the head fit this). */
export const RACCOON_HEAD: V3 = [1.18, 0.95, 1]
const S = RACCOON_HEAD
const BLUSH = '#FF9DB8'
const NOSE = '#3A2F40'

/** A flat patch lying on the head: it spreads from (cx, cy) on the face out to `radius(angle)`, `off` above the fur.
 *  `side` -1 mirrors it onto the other half of the face. */
function patch({ R, headY }: Frame, color: string, side: number, cx: number, cy: number, radius: (a: number) => number, off: number) {
  const rings = 10
  const around = 44
  const pos: number[] = []
  const nor: number[] = []
  const index: number[] = []
  const n = new Vector3()
  const put = (x: number, y: number) => {
    const z = Math.sqrt(Math.max(0, 1 - (x / S[0]) ** 2 - (y / S[1]) ** 2)) * S[2]
    n.set(x / S[0] ** 2, y / S[1] ** 2, z / S[2] ** 2).normalize()
    pos.push(side * (x + n.x * off) * R, headY + (y + n.y * off) * R, (z + n.z * off) * R)
    nor.push(side * n.x, n.y, n.z)
  }
  put(cx, cy)
  for (let j = 1; j <= rings; j++) {
    for (let i = 0; i < around; i++) {
      const a = (i / around) * Math.PI * 2
      const r = (radius(a) * j) / rings
      put(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
  }
  const at = (j: number, i: number) => 1 + (j - 1) * around + (i % around)
  const tri = (a: number, b: number, c: number) => (side > 0 ? index.push(a, b, c) : index.push(a, c, b))
  for (let i = 0; i < around; i++) {
    tri(0, at(1, i), at(1, i + 1))
    for (let j = 1; j < rings; j++) {
      tri(at(j, i), at(j + 1, i), at(j + 1, i + 1))
      tri(at(j, i), at(j + 1, i + 1), at(j, i + 1))
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3))
  g.setIndex(index)
  return bake(g, color, {}, true)
}

/** An egg lying at `turn` radians: `a` long (fatter by `egg` at its far end), `b` across. */
const egg = (a: number, b: number, turn: number, fat = 0) => (angle: number) => {
  const p = angle - turn
  const across = b * (1 + fat * Math.cos(p))
  return 1 / Math.hypot(Math.cos(p) / a, Math.sin(p) / across)
}

/** A soft teardrop (an ear, a tuft of cheek fur): round at the bottom, narrowing to a rounded tip, flattened front to
 *  back. */
function teardrop(color: string, o: PartOpts, point = 0.62, flat = 0.4) {
  const g = new SphereGeometry(1, 20, 16)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getY(i) + 1) / 2
    pos.setXYZ(i, pos.getX(i) * (1 - point * t ** 1.5), pos.getY(i), pos.getZ(i) * flat * (1 - 0.3 * t))
  }
  g.computeVertexNormals()
  return bake(g, color, o, true)
}

export function raccoonHead(look: Look, f: Frame) {
  const { R, headY, eyeX, eyeY, eyeSize } = f
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const ex = eyeX / R
  const ey = eyeY / R
  const outlined: BufferGeometry[] = [P.sphere(R, look.fur, { at: at(0, 0, 0), scale: S }, 40)]
  const plain: BufferGeometry[] = []
  /** Round each eye (they blink with it). */
  const eyeRings: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    // Big ears set wide, leaning out: fur outside, dark inside.
    const lean: V3 = [-0.1, s * 0.3, -s * 0.52]
    outlined.push(teardrop(look.fur, { at: at(s * 0.83, 0.78, -0.06), rot: lean, scale: [0.46 * R, 0.5 * R, 0.46 * R] }, 0.4))
    plain.push(teardrop(look.ear ?? look.dark, { at: at(s * 0.82, 0.76, 0.075), rot: lean, scale: [0.28 * R, 0.32 * R, 0.28 * R] }, 0.4, 0.3))
    // Cheek ruffs: three soft tufts fanning out and down from each cheek.
    for (const [x, y, turn, k] of [[1.0, -0.2, 0.25, 1], [0.93, -0.46, 0.75, 0.9]]) {
      outlined.push(teardrop(look.light, { at: at(s * x, y, 0.16), rot: [0, s * 0.3, -s * (Math.PI / 2 + turn)], scale: [0.27 * R * k, 0.4 * R * k, 0.42 * R * k] }, 0.5))
    }
    // The white brow sweeps from the forehead out to the ruff; the dark mask lies on it, round the eye.
    plain.push(patch(f, look.light, s, ex + 0.16, ey + 0.08, egg(0.6, 0.37, -0.42, 0.1), 0.006))
    plain.push(patch(f, look.dark, s, ex + 0.1, ey - 0.06, egg(0.43, 0.27, -0.42, 0.18), 0.012))
    eyeRings.push(patch(f, look.light, s, ex, ey, egg(eyeSize / R * 0.92, eyeSize / R * 1.14, 0), 0.018))
    plain.push(patch(f, BLUSH, s, 0.6, -0.42, egg(0.13, 0.075, 0), 0.016))
  }
  // A little tuft between the ears.
  for (const [x, tilt] of [[-0.1, 0.5], [0.08, -0.25]]) outlined.push(P.sphere(0.16 * R, look.fur, { at: at(x, 0.9, 0.3), rot: [0.7, 0, tilt], scale: [0.5, 1.3, 0.6] }))
  // The white lower face, the short muzzle on it, a small dark nose with a shine.
  plain.push(patch(f, look.light, 1, 0, -0.5, egg(0.62, 0.34, 0), 0.008))
  outlined.push(P.sphere(0.36 * R, look.light, { at: at(0, -0.36, 0.68), scale: [1.25, 0.72, 0.85] }, 28))
  plain.push(P.sphere(0.1 * R, NOSE, { at: at(0, -0.225, 0.965), scale: [1.35, 0.9, 0.8] }, 20))
  plain.push(P.sphere(0.026 * R, '#B9A9C0', { at: at(-0.04, -0.185, 1.03), scale: [1.5, 0.6, 0.4] }))
  return { outlined, plain, eyeRings, mouth: at(0, -0.47, 0.962) }
}

/** The white tummy, flush on the front of the body from the chest down. */
export function raccoonTummy(H: number, width: number, depth: number, color: string) {
  const g = new SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)
  const pos = g.attributes.position
  const normals = g.attributes.normal
  const n = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    // (The half ball's rim becomes the patch's edge, its pole the middle.)
    const x = pos.getX(i) * 0.098
    const y = 0.33 - pos.getZ(i) * 0.15
    const dy = y - Math.max(0.29, Math.min(0.39, y))
    const z = Math.sqrt(Math.max(0, 0.155 ** 2 - x * x - dy * dy))
    pos.setXYZ(i, H * width * x, H * y, H * depth * (z + 0.0015))
    n.set(x / width, dy, z / depth).normalize()
    normals.setXYZ(i, n.x, n.y, n.z)
  }
  return bake(g, color, {}, true)
}

/** The ringed tail: fat and bushy, out from behind and curling up beside the body. */
export function raccoonTail(look: Look, root: V3) {
  const H = look.height
  const middle = (t: number, out = new Vector3()) => out.set(0.04 + 0.33 * Math.sin(t * 1.5), -0.03 + 0.37 * t ** 1.6, -0.07 * (1 - (1 - t) ** 4))
  const raw = new SphereGeometry(1, 20, 42)
  const pos = raw.attributes.position
  const c = new Vector3()
  const ahead = new Vector3()
  const back = new Vector3(0, 0, 1)
  const across = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i)
    const t = (y + 1) / 2
    middle(t, c)
    ahead.copy(middle(Math.min(1, t + 0.02), across)).sub(middle(Math.max(0, t - 0.02), across)).normalize()
    across.crossVectors(ahead, back).normalize()
    const r = (0.062 + 0.036 * t) * Math.max(1e-4, 1 - y * y) ** -0.15
    pos.setXYZ(i,
      root[0] + H * (c.x + across.x * pos.getX(i) * r),
      root[1] + H * (c.y + across.y * pos.getX(i) * r),
      root[2] + H * (c.z + pos.getZ(i) * r))
  }
  raw.computeVertexNormals()
  // Rings: each triangle takes the color of the band it's in, so their edges stay crisp.
  const g = raw.toNonIndexed()
  raw.dispose()
  const along = g.attributes.uv.array.slice()
  const tail = bake(g, look.fur, {})
  const color = tail.attributes.color
  const dark = new Color(look.dark)
  for (let i = 0; i < color.count; i += 3) {
    // (Both triangles of a strip of the ball take the strip's color, or the rings' edges zigzag.)
    const t = (Math.floor(Math.min(along[i * 2 + 1], along[i * 2 + 3], along[i * 2 + 5]) * 42 + 0.01) + 0.5) / 42
    const ring = (t > 0.14 && t < 0.27) || (t > 0.41 && t < 0.54) || (t > 0.68 && t < 0.81) || t > 0.93
    if (ring) for (let k = 0; k < 3; k++) color.setXYZ(i + k, dark.r, dark.g, dark.b)
  }
  return tail
}
