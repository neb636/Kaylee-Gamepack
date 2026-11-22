// A raccoon's face and its big ringed tail (Roxy and her kits, Canada), after the user's reference pictures
// (2026-11-22): a wide face with fluffy white cheek ruffs, a dark bandit mask that droops down to the cheeks, white
// brows over it, a pointed white snout with a little dark nose, round ears with white rims, and a fat bushy tail in
// fur and dark rings that curls round beside her so it shows from the front.
import { BufferAttribute, Color, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { bake, P, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

const INK = '#2E2233'
/** The brown round each pupil, so the eyes read warm and alive on the dark mask (the references). */
const IRIS = '#6B4636'

export interface RaccoonFace {
  /** Parts with an ink outline (the head's own mesh). */
  outlined: BufferGeometry[]
  /** Flat markings lying on it (no outline of their own). */
  plain: BufferGeometry[]
  /** Into the eyes group (they blink with the pupils): the white and the brown iris behind each pupil. */
  eyes: BufferGeometry[]
  /** Where the resting mouth goes (head-local). */
  mouth: V3
}

export function raccoonHead(look: Look, f: Frame): RaccoonFace {
  const { R, headY, eyeX, eyeY, eyeSize, on, turnTo } = f
  const outlined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  const eyes: BufferGeometry[] = []
  const light = look.light
  const dark = look.dark

  // The head ball (squashed like before: the Canada hats are fitted to it, places/canada/characters/worn.ts).
  outlined.push(P.sphere(R, look.fur, { at: [0, headY, 0], scale: [1.1, 0.98, 1] }, 28))

  for (const s of [-1, 1]) {
    // Round ears set wide, tipped out: a white rim round a fur ear, pink inside.
    const ear: V3 = [s * 0.68 * R, headY + 0.78 * R, -0.1 * R]
    const tilt: V3 = [-0.15, s * 0.25, -s * 0.42]
    outlined.push(P.sphere(0.34 * R, light, { at: ear, rot: tilt, scale: [1, 1.12, 0.42] }, 22))
    plain.push(P.sphere(0.27 * R, look.fur, { at: [ear[0] - s * 0.005 * R, ear[1] - 0.02 * R, ear[2] + 0.07 * R], rot: tilt, scale: [1, 1.1, 0.4] }, 20))
    plain.push(P.sphere(0.17 * R, look.ear ?? light, { at: [ear[0] - s * 0.01 * R, ear[1] - 0.04 * R, ear[2] + 0.13 * R], rot: tilt, scale: [1, 1.15, 0.3] }, 18))

    // Fluffy white cheek ruffs: a soft puff low on each side of the face and pointed tufts sticking out past it, so
    // the head is wide at the cheeks like a real raccoon's.
    outlined.push(P.sphere(0.46 * R, light, { at: [s * 0.72 * R, headY - 0.34 * R, 0.3 * R], rot: [0, s * 0.5, -s * 0.2], scale: [1.08, 0.78, 0.7] }, 22))
    for (const [y, a, len, r] of [[-0.14, 1.3, 0.34, 0.15], [-0.36, 1.6, 0.38, 0.16], [-0.56, 1.95, 0.28, 0.13]] as const) {
      const out = 0.98 * R + Math.sin(a) * len * R * 0.36
      outlined.push(P.cone(r * R, len * R, light, { at: [s * out, headY + y * R - Math.cos(a) * len * R * 0.36, 0.12 * R], rot: [0, 0, -s * a] }, 12))
    }

    // The bandit mask: a dark patch round each eye that runs out and droops down onto the cheek, the two meeting
    // over the nose with a stripe of fur between.
    const x = s * eyeX
    plain.push(P.sphere(0.4 * R, dark, { at: on(s * 0.43 * R, eyeY - 0.04 * R, -0.1 * R), rot: [0, turnTo(s * 0.43 * R)[1], -s * 0.24], scale: [1.26, 0.72, 0.3] }, 24))
    plain.push(P.sphere(0.2 * R, dark, { at: on(s * 0.14 * R, eyeY - 0.12 * R, -0.05 * R), rot: [0, turnTo(s * 0.14 * R)[1], -s * 0.7], scale: [1.2, 0.7, 0.35] }, 18))
    // White brows over the mask, sweeping out and down like it.
    plain.push(P.sphere(0.3 * R, light, { at: on(s * 0.4 * R, eyeY + 0.31 * R, -0.08 * R), rot: [0, turnTo(s * 0.4 * R)[1], -s * 0.28], scale: [1.45, 0.42, 0.45] }, 20))
    // A white round each eye (the eye sits on the dark mask, so it pops), and the brown iris round the pupil: both
    // in the eyes group, so they close with the blink.
    eyes.push(P.sphere(eyeSize * 1.22, '#FFFFFF', { at: on(x, eyeY, -0.045 * R), rot: turnTo(x), scale: [0.86, 1.04, 0.34] }, 28))
    eyes.push(P.sphere(eyeSize * 1.08, IRIS, { at: on(x, eyeY, -0.04 * R), rot: turnTo(x), scale: [0.8, 1, 0.42] }, 32))
  }

  // The pointed white snout, a white stripe up the bridge between the mask's two halves, and a little dark nose.
  outlined.push(P.sphere(0.42 * R, light, { at: [0, headY - 0.36 * R, 0.66 * R], scale: [1.08, 0.7, 0.92] }, 24))
  plain.push(P.sphere(0.2 * R, light, { at: on(0, eyeY - 0.06 * R, -0.04 * R), scale: [0.55, 1.4, 0.5] }, 18))
  outlined.push(P.sphere(0.12 * R, INK, { at: [0, headY - 0.2 * R, 1.06 * R], scale: [1.35, 0.92, 0.85] }, 18))
  plain.push(P.sphere(0.035 * R, '#FFFFFF', { at: [-0.04 * R, headY - 0.15 * R, 1.15 * R], scale: [1.4, 0.8, 0.5] }))

  return { outlined, plain, eyes, mouth: [0, headY - 0.48 * R, 0.99 * R] }
}

/**
 * The bushy ringed tail: one fat tube (a sphere stretched along a curve, so it has no beads) from the rump, back and
 * round to her right side with the tip lifting, in fur with dark rings and a dark tip. `root` is where it wags from.
 */
export function raccoonTail(H: number, root: V3, fur: string, dark: string): BufferGeometry {
  const P0 = new Vector3(root[0], root[1] - 0.01 * H, root[2] - 0.02 * H)
  const P1 = new Vector3(0.02 * H, 0.06 * H, -0.36 * H)
  const P2 = new Vector3(0.3 * H, 0.0 * H, -0.32 * H)
  const P3 = new Vector3(0.32 * H, 0.2 * H, -0.08 * H)
  const at = (t: number) => {
    const u = 1 - t
    return new Vector3()
      .addScaledVector(P0, u * u * u)
      .addScaledVector(P1, 3 * u * u * t)
      .addScaledVector(P2, 3 * u * t * t)
      .addScaledVector(P3, t * t * t)
  }
  // Frames along the curve, carried from one sample to the next so the tube doesn't twist.
  const N = 96
  const pts = Array.from({ length: N + 1 }, (_, i) => at(i / N))
  const tan = pts.map((_, i) => new Vector3().subVectors(pts[Math.min(N, i + 1)], pts[Math.max(0, i - 1)]).normalize())
  const nor: Vector3[] = [new Vector3(1, 0, 0).sub(tan[0].clone().multiplyScalar(tan[0].x)).normalize()]
  for (let i = 1; i <= N; i++) {
    const n = nor[i - 1].clone()
    n.sub(tan[i].clone().multiplyScalar(n.dot(tan[i]))).normalize()
    nor.push(n)
  }
  const bin = tan.map((t, i) => new Vector3().crossVectors(t, nor[i]))
  /** How fat the tail is along its length: slim at the rump, bushiest past the middle, a round tip. */
  const fat = (t: number) => H * (0.058 + 0.05 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95)))

  const g = new SphereGeometry(1, 22, 72)
  const pos = g.attributes.position
  const v = new Vector3()
  /** Each corner's place along the tail (0 at the rump, 1 at the tip), for the rings. */
  const along = new Float32Array(pos.count)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
    const t = (1 - y) / 2
    along[i] = t
    const k = Math.min(N, Math.max(0, Math.round(t * N)))
    const ring = Math.hypot(x, z)
    // Round ends: the sphere's own curve over the last bit at each end, full width everywhere else.
    const r = fat(t) * Math.min(1, 2.6 * ring) / Math.max(ring, 1e-6)
    v.copy(pts[k]).addScaledVector(nor[k], x * r).addScaledVector(bin[k], z * r)
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  g.computeVertexNormals()
  const geo = bake(g, fur, {}, true)
  // The rings: five dark bands getting closer toward the tip, and the tip dark.
  const bands: [number, number][] = [[0.2, 0.3], [0.38, 0.48], [0.56, 0.65], [0.72, 0.8], [0.87, 1.01]]
  const c = new Color(), cf = new Color(fur), cd = new Color(dark)
  const col = geo.attributes.color as BufferAttribute
  for (let i = 0; i < along.length; i++) {
    c.copy(bands.some(([a, b]) => along[i] >= a && along[i] < b) ? cd : cf)
    col.setXYZ(i, c.r, c.g, c.b)
  }
  return geo
}
