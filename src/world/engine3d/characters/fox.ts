// A fox sculpted in more detail for the shared chibi rig (`Look.sculpted`: Joy, Gan and Ken, and every other fox). The plain fox is a ball with two cones
// and two cheek balls; this one has cupped pointed ears, a white snout that narrows to a little turned-up nose (only
// the snout is white: white cheeks and chin read as a beard, 2026-11-23), low puffy pink cheeks, soft brows, and a big bushy tail that sweeps out to one side and up, so its white tip shows from the front.
// Head coordinates are in head radii R, the tail's in body heights H.
import { Color, Vector3, type BufferGeometry } from 'three'
import { P, placeMatrix, sculpt, type PartOpts, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

/** How the head ball is squashed: a little wide (the same as the plain fox, so hats and glasses fit both). */
const HEAD: V3 = [1.1, 1, 1]
/** A fox's dark paws: warm brown, not black, so they stay soft beside the pastels. */
export const FOX_SOCK = '#6A4234'
const NOSE = '#3A2A33'
/** Her puffy cheeks: a softer pink than the cast's blush, so they read as fur (Joy; her boys' are white, `Look.cheeks`). */
const CHEEK = '#FFB5C8'

/** A sculpted ball painted before it's placed: `tint` gives point `i` of the shaped ball another color (or null).
 *  (`shape` meets the points in the same order, so it can note things down for `tint`.) */
export function painted(color: string, seg: number, shape: (p: Vector3) => void, tint: (p: Vector3, i: number) => string | null, o: PartOpts) {
  const g = sculpt(color, seg, shape)
  const pos = g.attributes.position
  const rgb = g.attributes.color
  const p = new Vector3()
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    const to = tint(p.fromBufferAttribute(pos, i), i)
    if (to) rgb.setXYZ(i, c.set(to).r, c.g, c.b)
  }
  return g.applyMatrix4(placeMatrix(o))
}

/** An ear's shape from a ball: wide low down, a point on top, thin, and cupped (its edges come forward). */
const earShape = (p: Vector3) => {
  const t = (p.y + 1) / 2
  p.x *= 1.12 - 0.86 * t ** 1.25
  p.z = p.z * 0.3 * (1 - 0.45 * t) + 0.3 * p.x * p.x
}

export function foxHead(look: Look, f: Frame, brow: string) {
  const { R, headY, eyeX, eyeY, on, turnTo } = f
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const outlined: BufferGeometry[] = [P.sphere(R, look.fur, { at: at(0, 0, 0), scale: HEAD }, 44)]
  const plain: BufferGeometry[] = []
  // Inside the ears, a paler shade of the fur; the Arctic fox's short ears keep their own (pink) color, which shows on
  // its white winter coat.
  const inner = look.ears === 'short' && look.ear ? look.ear : '#' + new Color(look.fur).lerp(new Color('#FFFFFF'), 0.45).getHexString()
  for (const s of [-1, 1]) {
    // Pointed ears set wide and leaning out.
    const lean: V3 = [-0.12, s * 0.3, -s * 0.34]
    // (Short ears, the Arctic fox's, keep their size across but stand lower: they keep the heat in.)
    const tall = look.ears === 'short' ? 0.62 : 1
    outlined.push(sculpt(look.fur, 36, earShape, { at: at(s * 0.64, 0.9 - 0.54 * (1 - tall) * 0.6, -0.1), rot: lean, scale: [0.4 * R, 0.54 * tall * R, 0.4 * R] }))
    plain.push(sculpt(inner, 28, earShape, { at: at(s * 0.628, 0.83 - 0.54 * (1 - tall) * 0.6, -0.02), rot: lean, scale: [0.23 * R, 0.36 * tall * R, 0.24 * R] }))
    // A soft arched brow over each eye.
    const bx = s * (eyeX + 0.02 * R)
    plain.push(P.torus(0.2 * R, 0.02 * R, brow, { at: on(bx, eyeY + 0.18 * R, 0.004 * R), rot: [0, turnTo(bx)[1], Math.PI / 2 - 0.45 + s * 0.06], scale: [1, 1, 0.5] }, 0.9))
    // A puffy pink cheek: a low soft mound lying on the face (turned to face out where it sits), a little way out
    // from the snout. Much flatter than the plain fox's cheek balls, and it is her blush too.
    const n: V3 = [s * 0.5, -0.43, 0.75]
    const r = 0.25
    outlined.push(P.sphere(r * R, look.cheeks === 'white' ? look.light : CHEEK, { at: at(s * 0.63 - n[0] * 0.2 * r, -0.43 - n[1] * 0.2 * r, 0.665 - n[2] * 0.2 * r), rot: [0.52, s * 0.6, 0], scale: [0.98, 0.95, 0.42] }, 32))
  }
  // The snout: it narrows toward the nose and tips up a little at the end.
  outlined.push(sculpt(look.light, 32, (p) => {
    const t = (p.z + 1) / 2
    p.x *= 1.15 - 0.3 * t
    p.y = p.y * (1.05 - 0.3 * t) + 0.12 * t * t
  }, { at: at(0, -0.38, 0.72), scale: [0.4 * R, 0.27 * R, 0.44 * R] }))
  // A little rounded nose with a shine.
  outlined.push(sculpt(NOSE, 20, (p) => {
    p.x *= 1 + 0.25 * p.y
  }, { at: at(0, -0.235, 1.105), scale: [0.115 * R, 0.08 * R, 0.085 * R] }))
  plain.push(P.sphere(0.026 * R, '#B9A9C0', { at: at(-0.04, -0.195, 1.175), scale: [1.5, 0.6, 0.4] }))
  return { outlined, plain, mouth: at(0, -0.5, 1.03) }
}

/** The tail: thin where it leaves the body, big and bushy, a point at the end; its tip is white, with a ragged edge. */
export function foxTail(look: Look, root: V3) {
  const H = look.height
  // It sweeps back and out to her left (our right, seen from the front) and curls up, clear of her hair.
  const middle = (t: number, out = new Vector3()) => out.set(0.03 + 0.3 * Math.sin(t * 1.35), -0.04 * Math.sin(t * Math.PI) + 0.34 * t ** 1.7, -0.02 - 0.2 * Math.sin(t * 1.9))
  const c = new Vector3()
  const ahead = new Vector3()
  const a = new Vector3()
  const b = new Vector3()
  const up = new Vector3(0, 1, 0)
  /** How far along the tail each point is, pushed back and forth round it: the ragged edge of the white tip. */
  const along: number[] = []
  return painted(look.fur, 40, (p) => {
    const t = (p.y + 1) / 2
    middle(t, c)
    ahead.copy(middle(Math.min(1, t + 0.02), a)).sub(middle(Math.max(0, t - 0.02), b)).normalize()
    a.crossVectors(ahead, up).normalize()
    b.crossVectors(a, ahead).normalize()
    // (The ball's own roundness, made fatter in the middle and thin at the root.)
    const round = Math.max(1e-4, 1 - p.y * p.y) ** -0.12
    const r = (0.035 + 0.095 * Math.sin(Math.PI * t ** 0.8) ** 0.8) * round
    const x = p.x * r, z = p.z * r
    along.push(t - 0.045 * Math.sin(Math.atan2(p.z, p.x) * 5))
    p.set(c.x + a.x * x + b.x * z, c.y + a.y * x + b.y * z, c.z + a.z * x + b.z * z)
  }, (_, i) => (along[i] > 0.7 ? look.light : null), { at: root, scale: [H, H, H] })
}
