// The island's animals, built from code in the island's toy look (flat toon colors, ink outlines, big shiny eyes and a
// little blush): the monitor lizard, the squirrel, the macaques, the mouse-deer, the hornbill, the flying fox, the reef
// heron, a hermit crab, the parrotfish, the blue damselfish, the cuttlefish, a sea urchin and the coral. Each model faces
// +z with its feet on y = 0 and hands back the parts that move (on their own pivots), so creatures.ts can bring it to
// life and the book can draw its portrait (photo.ts). A few draw calls each: whatever doesn't move is merged.
import { Color, Group, InstancedMesh, Mesh, MeshToonMaterial, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { makeHull } from '../../../../../engine3d/outline'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL, toon, toonGradient } from '../../../../../engine3d/toon'
import type { AnimalId } from './animals'

const INK = PAL.ink
const BLUSH = '#FF9DB8'
const HALF = Math.PI / 2

/** Two big shiny eyes (ink with a white glint) and, if `blush`, two pink cheeks: plain parts (no outline). */
function face(x: number, y: number, z: number, r: number, o: { blush?: [number, number, number]; spread?: number } = {}): BufferGeometry[] {
  const out: BufferGeometry[] = []
  for (const s of [1, -1]) {
    out.push(P.sphere(r, INK, { at: [s * x, y, z], scale: [0.9, 1, 0.8] }, 10))
    out.push(P.sphere(r * 0.36, '#FFFFFF', { at: [s * x + r * 0.28, y + r * 0.38, z + r * 0.62] }, 6))
    if (o.blush) out.push(P.sphere(r * 0.75, BLUSH, { at: [s * o.blush[0], o.blush[1], o.blush[2]], scale: [1, 0.55, 0.45] }, 8))
  }
  return out
}

export interface Model {
  root: Group
  /** Moving parts, by name (each on its own pivot). */
  parts: Record<string, Group>
  /** The model's rough height (m), for framing. */
  h: number
}

const pivot = (at: [number, number, number], child?: Group) => {
  const g = new Group()
  g.position.set(...at)
  if (child) g.add(child)
  return g
}

// ---------------------------------------------------------------- the land animals

/** The water monitor: long and low, olive with pale yellow spots, a forked pink tongue. */
export function monitorModel(bag: Bag): Model {
  const OL = '#707B55'
  const DK = '#5C6646'
  const SP = '#E6D78F'
  const root = new Group()
  const body = new Group()
  const spots: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) spots.push(P.sphere(0.042, SP, { at: [(i % 2 ? 0.12 : -0.12) + (i % 3) * 0.02, 0.405, -0.36 + i * 0.085], scale: [1, 0.32, 1] }, 6))
  for (let i = 0; i < 4; i++) spots.push(P.sphere(0.038, SP, { at: [0, 0.428, -0.3 + i * 0.2], scale: [1, 0.3, 1] }, 6))
  body.add(
    solidMix(
      [
        P.sphere(0.3, OL, { at: [0, 0.27, 0], scale: [0.8, 0.52, 1.55] }, 14),
        ...[[1, 1], [-1, 1], [1, -1], [-1, -1]].flatMap(([sx, sz]) => [
          P.capsule(0.055, 0.15, OL, { at: [sx * 0.27, 0.15, sz * 0.3], rot: [0, 0, sx * 1.05] }),
          P.sphere(0.075, DK, { at: [sx * 0.36, 0.045, sz * 0.3 + 0.05], scale: [1.2, 0.45, 1.5] }, 8),
        ]),
      ],
      [P.sphere(0.26, '#C6C496', { at: [0, 0.205, 0.02], scale: [0.78, 0.4, 1.4] }, 12), ...spots],
      bag,
      2,
    ),
  )
  root.add(body)
  const head = pivot([0, 0.31, 0.42])
  head.add(
    solidMix(
      [P.capsule(0.105, 0.12, OL, { at: [0, 0, 0.04], rot: [HALF, 0, 0] }), P.sphere(0.13, OL, { at: [0, 0.025, 0.24], scale: [0.95, 0.74, 1.55] }, 12)],
      [...face(0.082, 0.078, 0.31, 0.04, { blush: [0.1, 0.01, 0.31] }), P.sphere(0.012, INK, { at: [0.03, 0.05, 0.435] }, 5), P.sphere(0.012, INK, { at: [-0.03, 0.05, 0.435] }, 5), P.sphere(0.035, SP, { at: [0.05, 0.11, 0.15], scale: [1, 0.35, 1] }, 6), P.sphere(0.035, SP, { at: [-0.05, 0.11, 0.18], scale: [1, 0.35, 1] }, 6)],
      bag,
      2,
    ),
  )
  const tongue = pivot([0, 0.0, 0.43])
  tongue.add(solid(P.prism([[-0.012, 0], [0.012, 0], [0.012, 0.12], [0.038, 0.19], [0.008, 0.14], [0, 0.15], [-0.008, 0.14], [-0.038, 0.19], [-0.012, 0.12]], 0.012, '#FF6FA0', { rot: [HALF, 0, 0] }), bag, 0))
  tongue.scale.z = 0.001
  head.add(tongue)
  body.add(head)
  const tail = pivot([0, 0.26, -0.42])
  tail.add(solid(P.cyl(0.065, 0.15, 0.78, OL, { at: [0, 0, -0.38], rot: [-HALF, 0, 0], scale: [1, 1, 0.75] }, 10), bag, 2))
  const tip = pivot([0, -0.01, -0.74])
  tip.add(solid(merge([P.cone(0.068, 0.72, OL, { at: [0, -0.02, -0.34], rot: [-HALF, 0, 0], scale: [1, 1, 0.75] }, 10), P.sphere(0.03, SP, { at: [0, 0.035, -0.1], scale: [1, 0.3, 1] }, 5)]), bag, 2))
  tail.add(tip)
  body.add(tail)
  return { root, parts: { body, head, tongue, tail, tip }, h: 0.55 }
}

/** The variable squirrel: red-brown with a cream belly, a huge bushy tail. */
export function squirrelModel(bag: Bag): Model {
  const FUR = '#B8673C'
  const CR = '#F5DEB8'
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.sphere(0.16, FUR, { at: [0, 0.17, 0], scale: [0.88, 1, 1.25] }, 14),
        P.sphere(0.125, FUR, { at: [0, 0.34, 0.15] }, 14),
        P.cone(0.045, 0.1, FUR, { at: [0.07, 0.46, 0.13], rot: [0, 0, -0.25] }, 8),
        P.cone(0.045, 0.1, FUR, { at: [-0.07, 0.46, 0.13], rot: [0, 0, 0.25] }, 8),
        P.sphere(0.06, FUR, { at: [0.08, 0.06, -0.02], scale: [0.8, 0.7, 1.4] }, 8),
        P.sphere(0.06, FUR, { at: [-0.08, 0.06, -0.02], scale: [0.8, 0.7, 1.4] }, 8),
      ],
      [P.sphere(0.12, CR, { at: [0, 0.15, 0.08], scale: [0.78, 0.92, 1] }, 12), P.sphere(0.07, CR, { at: [0, 0.3, 0.24], scale: [1.2, 0.8, 0.7] }, 10), P.sphere(0.022, '#E77A8E', { at: [0, 0.335, 0.275] }, 6), ...face(0.055, 0.365, 0.245, 0.03, { blush: [0.075, 0.31, 0.22] }), P.sphere(0.03, '#E9A9A0', { at: [0.07, 0.47, 0.13], scale: [0.6, 1, 0.4] }, 6), P.sphere(0.03, '#E9A9A0', { at: [-0.07, 0.47, 0.13], scale: [0.6, 1, 0.4] }, 6)],
      bag,
      2,
    ),
  )
  root.add(body)
  const tail = pivot([0, 0.14, -0.16])
  tail.add(
    solid(
      merge([
        P.sphere(0.085, '#AE5E35', { at: [0, 0.03, -0.07] }, 10),
        P.sphere(0.11, '#B4633A', { at: [0, 0.16, -0.17] }, 10),
        P.sphere(0.125, '#BB6B40', { at: [0, 0.33, -0.17] }, 10),
        P.sphere(0.11, '#C27648', { at: [0, 0.48, -0.08] }, 10),
        P.sphere(0.07, '#E8C49A', { at: [0, 0.56, 0.02] }, 8),
      ]),
      bag,
      2,
    ),
  )
  body.add(tail)
  return { root, parts: { body, tail }, h: 0.6 }
}

/** A long-tailed macaque, sitting: grey-brown fur, a pink face with a crest of hair, a long tail. `baby` is smaller. */
export function macaqueModel(bag: Bag): Model {
  const FUR = '#9E8D74'
  const LT = '#CDBEA4'
  const FACE = '#F2C2AE'
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.sphere(0.22, FUR, { at: [0, 0.27, 0], scale: [1, 1.12, 0.92] }, 14),
        P.sphere(0.11, FUR, { at: [0.15, 0.1, 0.12], scale: [1, 0.85, 1.25] }, 10),
        P.sphere(0.11, FUR, { at: [-0.15, 0.1, 0.12], scale: [1, 0.85, 1.25] }, 10),
        P.sphere(0.055, FACE, { at: [0.14, 0.04, 0.25], scale: [1, 0.6, 1.3] }, 8),
        P.sphere(0.055, FACE, { at: [-0.14, 0.04, 0.25], scale: [1, 0.6, 1.3] }, 8),
        P.capsule(0.05, 0.18, FUR, { at: [-0.17, 0.25, 0.1], rot: [-0.5, 0, 0.25] }),
      ],
      [P.sphere(0.17, LT, { at: [0, 0.24, 0.07], scale: [0.85, 0.95, 0.8] }, 12)],
      bag,
      2,
    ),
  )
  root.add(body)
  const head = pivot([0, 0.5, 0.03])
  head.add(
    solidMix(
      [
        P.sphere(0.165, FUR, { at: [0, 0.13, 0] }, 14),
        P.cone(0.07, 0.12, FUR, { at: [0, 0.3, -0.02], rot: [-0.3, 0, 0] }, 8),
        P.sphere(0.052, FACE, { at: [0.16, 0.15, 0], scale: [0.5, 1, 1] }, 8),
        P.sphere(0.052, FACE, { at: [-0.16, 0.15, 0], scale: [0.5, 1, 1] }, 8),
        P.sphere(0.12, FACE, { at: [0, 0.11, 0.085], scale: [1, 0.95, 0.65] }, 12),
      ],
      [P.sphere(0.055, '#E8A894', { at: [0, 0.065, 0.16], scale: [1.1, 0.8, 0.8] }, 8), P.sphere(0.012, INK, { at: [0.016, 0.075, 0.2] }, 5), P.sphere(0.012, INK, { at: [-0.016, 0.075, 0.2] }, 5), P.box(0.05, 0.008, 0.01, INK, { at: [0, 0.035, 0.195] }), ...face(0.048, 0.15, 0.165, 0.027, { blush: [0.085, 0.09, 0.15] }), P.sphere(0.07, '#B9A68A', { at: [0, 0.22, 0.09], scale: [1.3, 0.45, 0.7] }, 8)],
      bag,
      2,
    ),
  )
  body.add(head)
  const arm = pivot([0.18, 0.38, 0.04])
  arm.add(solid(merge([P.capsule(0.05, 0.2, FUR, { at: [0, -0.13, 0] }), P.sphere(0.05, FACE, { at: [0, -0.27, 0.02] }, 8)]), bag, 2))
  arm.rotation.x = -0.5
  body.add(arm)
  const tail = pivot([0, 0.08, -0.18])
  tail.add(solid(merge([P.capsule(0.035, 0.42, FUR, { at: [0.02, 0, -0.24], rot: [HALF, 0, 0.1] }), P.capsule(0.03, 0.26, FUR, { at: [0.16, 0.0, -0.46], rot: [HALF, 0, -1.2] })]), bag, 2))
  body.add(tail)
  return { root, parts: { body, head, arm, tail }, h: 0.85 }
}

/** The lesser mouse-deer: tiny, red-brown, white stripes on the chest, pencil legs, huge dark eyes. */
export function mouseDeerModel(bag: Bag): Model {
  const FUR = '#AE6E46'
  const DK = '#7A4A30'
  const root = new Group()
  const body = new Group()
  const legs: BufferGeometry[] = []
  for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]])
    legs.push(P.capsule(0.022, 0.2, FUR, { at: [sx * 0.065, 0.13, sz * 0.13] }), P.sphere(0.026, DK, { at: [sx * 0.065, 0.02, sz * 0.13 + 0.01], scale: [1, 0.7, 1.3] }, 6))
  body.add(
    solidMix(
      [P.sphere(0.15, FUR, { at: [0, 0.33, 0.02], scale: [0.85, 0.82, 1.3] }, 14), P.sphere(0.15, FUR, { at: [0, 0.35, -0.1], scale: [0.95, 0.9, 1] }, 12), P.capsule(0.055, 0.1, FUR, { at: [0, 0.43, 0.17], rot: [0.6, 0, 0] }), ...legs],
      [P.sphere(0.06, '#FFF8EE', { at: [0, 0.29, 0.2], scale: [0.7, 1, 0.5] }, 8), P.capsule(0.012, 0.09, '#FFF8EE', { at: [0.04, 0.33, 0.2], rot: [0.3, 0, 0.2] }), P.capsule(0.012, 0.09, '#FFF8EE', { at: [-0.04, 0.33, 0.2], rot: [0.3, 0, -0.2] }), P.sphere(0.035, '#FFF8EE', { at: [0, 0.37, -0.25] }, 6)],
      bag,
      2,
    ),
  )
  root.add(body)
  const head = pivot([0, 0.47, 0.2])
  head.add(
    solidMix(
      [P.sphere(0.085, FUR, { at: [0, 0.06, 0.04], scale: [0.85, 0.82, 1.15] }, 12), P.sphere(0.045, DK, { at: [0, 0.03, 0.13], scale: [0.9, 0.8, 1.1] }, 8), P.sphere(0.04, FUR, { at: [0.055, 0.14, -0.01], scale: [0.55, 1.1, 0.35] }, 8), P.sphere(0.04, FUR, { at: [-0.055, 0.14, -0.01], scale: [0.55, 1.1, 0.35] }, 8)],
      [...face(0.048, 0.085, 0.085, 0.03, { blush: [0.06, 0.035, 0.09] }), P.sphere(0.014, INK, { at: [0, 0.045, 0.175] }, 5), P.sphere(0.022, '#E8A9A0', { at: [0.055, 0.14, 0.0], scale: [0.5, 1, 0.3] }, 6), P.sphere(0.022, '#E8A9A0', { at: [-0.055, 0.14, 0.0], scale: [0.5, 1, 0.3] }, 6)],
      bag,
      2,
    ),
  )
  body.add(head)
  return { root, parts: { body, head }, h: 0.62 }
}

// ---------------------------------------------------------------- the birds and the bat

/** A wing (flat, x outward along `s`, +z forward) for a bird or a bat. */
function wing(s: 1 | -1, len: number, chord: number, c: string, edge: string | null, bat = false) {
  const pts: [number, number][] = bat
    ? [[0, chord * 0.5], [len * 0.35 * s, chord * 0.7], [len * s, chord * 0.55], [len * 0.82 * s, chord * 0.05], [len * 0.66 * s, -chord * 0.25], [len * 0.45 * s, chord * 0.02], [len * 0.25 * s, -chord * 0.35], [0, -chord * 0.4]]
    : [[0, chord * 0.5], [len * 0.5 * s, chord * 0.45], [len * s, chord * 0.1], [len * 0.92 * s, -chord * 0.15], [len * 0.4 * s, -chord * 0.5], [0, -chord * 0.45]]
  const parts = [P.prism(s > 0 ? pts : [...pts].reverse(), 0.025, c, { rot: [HALF, 0, 0] })]
  if (edge) parts.push(P.prism((s > 0 ? [[len * 0.55 * s, -chord * 0.36], [len * 0.92 * s, -chord * 0.15], [len * 0.97 * s, -chord * 0.02], [len * 0.55 * s, -chord * 0.2]] : [[len * 0.55 * s, -chord * 0.2], [len * 0.97 * s, -chord * 0.02], [len * 0.92 * s, -chord * 0.15], [len * 0.55 * s, -chord * 0.36]]) as [number, number][], 0.03, edge, { rot: [HALF, 0, 0] }))
  return merge(parts)
}

/** The oriental pied hornbill: black with a white belly, a giant cream-yellow bill with a casque on top, a long tail. */
export function hornbillModel(bag: Bag): Model {
  const BK = '#2E2D38'
  const WH = '#F6F3EA'
  const BILL = '#F4D35E'
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.sphere(0.17, BK, { at: [0, 0.27, 0], scale: [0.85, 0.92, 1.3] }, 14),
        P.box(0.13, 0.035, 0.42, BK, { at: [0, 0.2, -0.36], rot: [0.45, 0, 0] }),
        P.sphere(0.115, BK, { at: [0, 0.44, 0.16] }, 14),
        P.cone(0.068, 0.34, BILL, { at: [0, 0.4, 0.38], rot: [HALF + 0.35, 0, 0], scale: [0.8, 1, 1.15] }, 10),
        P.capsule(0.045, 0.16, '#FBE58E', { at: [0, 0.5, 0.31], rot: [HALF + 0.25, 0, 0], scale: [0.8, 1, 1] }),
        P.capsule(0.02, 0.06, '#5A5260', { at: [0.05, 0.08, 0.02] }),
        P.capsule(0.02, 0.06, '#5A5260', { at: [-0.05, 0.08, 0.02] }),
      ],
      [
        P.sphere(0.13, WH, { at: [0, 0.2, 0.05], scale: [0.8, 0.75, 1.05] }, 12),
        P.box(0.135, 0.04, 0.1, WH, { at: [0, 0.075, -0.53], rot: [0.45, 0, 0] }),
        P.sphere(0.04, WH, { at: [0.08, 0.43, 0.22], scale: [0.4, 1, 1] }, 8),
        P.sphere(0.04, WH, { at: [-0.08, 0.43, 0.22], scale: [0.4, 1, 1] }, 8),
        P.sphere(0.03, '#3A3340', { at: [0, 0.42, 0.25], scale: [1.6, 1, 0.8] }, 8),
        ...face(0.07, 0.47, 0.22, 0.026),
      ],
      bag,
      2,
    ),
  )
  root.add(body)
  const wl = pivot([0.13, 0.33, 0.05])
  wl.add(solid(wing(1, 0.62, 0.36, BK, WH), bag, 1.5))
  const wr = pivot([-0.13, 0.33, 0.05])
  wr.add(solid(wing(-1, 0.62, 0.36, BK, WH), bag, 1.5))
  body.add(wl, wr)
  return { root, parts: { body, wl, wr }, h: 0.6 }
}

/** A flying fox (the big fruit bat): a fox face, a golden mantle, dark leathery wings. Modelled upright (head up);
 *  roosting, it hangs upside down. */
export function flyingFoxModel(bag: Bag): Model {
  const DK = '#3B2C29'
  const MANTLE = '#C98C42'
  const FACE = '#6A4734'
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.capsule(0.12, 0.2, DK, { at: [0, 0.26, 0] }),
        P.sphere(0.13, MANTLE, { at: [0, 0.44, 0.01], scale: [1.05, 0.85, 1] }, 12),
        P.sphere(0.1, FACE, { at: [0, 0.58, 0.04] }, 12),
        P.cone(0.045, 0.11, FACE, { at: [0, 0.56, 0.15], rot: [HALF, 0, 0] }, 8),
        P.cone(0.035, 0.09, FACE, { at: [0.06, 0.68, 0.02], rot: [0, 0, -0.3] }, 6),
        P.cone(0.035, 0.09, FACE, { at: [-0.06, 0.68, 0.02], rot: [0, 0, 0.3] }, 6),
        P.capsule(0.015, 0.07, DK, { at: [0.04, 0.06, 0], rot: [0, 0, 0.2] }),
        P.capsule(0.015, 0.07, DK, { at: [-0.04, 0.06, 0], rot: [0, 0, -0.2] }),
      ],
      [...face(0.045, 0.61, 0.1, 0.024, { blush: [0.065, 0.555, 0.1] }), P.sphere(0.014, INK, { at: [0, 0.56, 0.205] }, 5)],
      bag,
      2,
    ),
  )
  root.add(body)
  const wl = pivot([0.1, 0.42, 0])
  wl.add(solid(wing(1, 0.75, 0.5, '#4A3632', null, true), bag, 1.5))
  const wr = pivot([-0.1, 0.42, 0])
  wr.add(solid(wing(-1, 0.75, 0.5, '#4A3632', null, true), bag, 1.5))
  body.add(wl, wr)
  return { root, parts: { body, wl, wr }, h: 0.75 }
}

/** The Pacific reef heron (dark morph): slate grey, a white chin, a long yellow bill, long yellow-green legs. */
export function heronModel(bag: Bag): Model {
  const GR = '#5F6C88'
  const LEG = '#CFC46C'
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.sphere(0.18, GR, { at: [0, 0.6, -0.02], scale: [0.78, 0.82, 1.4], rot: [-0.25, 0, 0] }, 14),
        P.box(0.12, 0.03, 0.2, GR, { at: [0, 0.54, -0.27], rot: [0.35, 0, 0] }),
        P.capsule(0.022, 0.4, LEG, { at: [0.055, 0.25, 0] }),
        P.capsule(0.022, 0.4, LEG, { at: [-0.055, 0.25, 0] }),
        P.box(0.03, 0.012, 0.14, LEG, { at: [0.055, 0.01, 0.04] }),
        P.box(0.03, 0.012, 0.14, LEG, { at: [-0.055, 0.01, 0.04] }),
      ],
      [],
      bag,
      2,
    ),
  )
  root.add(body)
  const neck = pivot([0, 0.68, 0.16])
  neck.add(
    solidMix(
      [P.capsule(0.045, 0.24, GR, { at: [0, 0.15, 0.03], rot: [0.25, 0, 0] }), P.sphere(0.075, GR, { at: [0, 0.32, 0.08] }, 12), P.cone(0.028, 0.26, '#D9B54C', { at: [0, 0.31, 0.25], rot: [HALF + 0.1, 0, 0] }, 8), P.capsule(0.012, 0.12, GR, { at: [0, 0.36, -0.03], rot: [-1.1, 0, 0] })],
      [P.sphere(0.03, '#F6F3EA', { at: [0, 0.27, 0.13], scale: [0.9, 0.6, 0.7] }, 8), ...face(0.05, 0.34, 0.12, 0.02)],
      bag,
      2,
    ),
  )
  body.add(neck)
  const wl = pivot([0.12, 0.66, 0])
  wl.add(solid(wing(1, 0.7, 0.4, GR, '#4B5670'), bag, 1.5))
  const wr = pivot([-0.12, 0.66, 0])
  wr.add(solid(wing(-1, 0.7, 0.4, GR, '#4B5670'), bag, 1.5))
  body.add(wl, wr)
  return { root, parts: { body, neck, wl, wr }, h: 1.05 }
}

/** A hermit crab in a borrowed pink-orange spiral shell, red legs and claws, eyes on stalks. */
export function hermitModel(bag: Bag): Model {
  const SH = '#F6B58C'
  const SH2 = '#E8846E'
  const RED = '#E0533F'
  const root = new Group()
  const shell = new Group()
  shell.add(solid(merge([P.sphere(0.15, SH, { at: [0, 0.16, -0.03], scale: [0.95, 0.95, 1.15] }, 12), P.cone(0.12, 0.2, SH2, { at: [0, 0.3, -0.1], rot: [-0.7, 0, 0] }, 10), P.torus(0.13, 0.025, SH2, { at: [0, 0.16, -0.03], rot: [0.2, 0, 0] }), P.cone(0.06, 0.1, SH, { at: [0, 0.39, -0.17], rot: [-0.9, 0, 0] }, 8)]), bag, 2))
  root.add(shell)
  const legs = pivot([0, 0, 0])
  legs.add(
    solidMix(
      [
        ...[0.05, -0.03, -0.11].flatMap((z) => [1, -1].map((s) => P.capsule(0.022, 0.12, RED, { at: [s * 0.14, 0.06, z + 0.08], rot: [0, 0, s * 1.15] }))),
        P.sphere(0.06, RED, { at: [0.08, 0.08, 0.17], scale: [1.1, 0.8, 1] }, 8),
        P.sphere(0.045, RED, { at: [-0.07, 0.07, 0.17] }, 8),
        P.capsule(0.012, 0.07, RED, { at: [0.035, 0.17, 0.12] }),
        P.capsule(0.012, 0.07, RED, { at: [-0.035, 0.17, 0.12] }),
      ],
      [P.sphere(0.026, INK, { at: [0.035, 0.23, 0.125] }, 6), P.sphere(0.026, INK, { at: [-0.035, 0.23, 0.125] }, 6), P.sphere(0.01, '#fff', { at: [0.042, 0.24, 0.145] }, 4), P.sphere(0.01, '#fff', { at: [-0.028, 0.24, 0.145] }, 4)],
      bag,
      2,
    ),
  )
  root.add(legs)
  return { root, parts: { shell, legs }, h: 0.4 }
}

// ---------------------------------------------------------------- the sea

/** The parrotfish: a big turquoise fish with pink and orange markings and a white beak; the tail wags. */
export function parrotfishModel(bag: Bag): Model {
  const root = new Group()
  const body = new Group()
  body.add(
    solidMix(
      [
        P.sphere(0.2, '#3FD6B8', { at: [0, 0, 0], scale: [0.55, 0.85, 1.55] }, 14),
        P.prism([[0, 0], [0.3, 0.02], [0.28, 0.09], [0.04, 0.1]], 0.02, '#FF8AC0', { at: [0, 0.14, -0.12], rot: [0, -HALF, 0] }),
        P.sphere(0.065, '#F4F7F2', { at: [0, -0.02, 0.29], scale: [0.85, 0.75, 0.9] }, 8),
      ],
      [P.sphere(0.12, '#FF9A5C', { at: [0, -0.08, 0.04], scale: [0.62, 0.6, 1.6] }, 10), P.capsule(0.022, 0.1, '#FF79B6', { at: [0.1, 0.06, 0.14], rot: [0.6, 0, 0] }), P.capsule(0.022, 0.1, '#FF79B6', { at: [-0.1, 0.06, 0.14], rot: [0.6, 0, 0] }), ...face(0.09, 0.05, 0.19, 0.03, { blush: [0.1, -0.02, 0.18] })],
      bag,
      2,
    ),
  )
  root.add(body)
  const tail = pivot([0, 0, -0.27])
  tail.add(solid(P.prism([[0, 0], [0.18, -0.2], [0.2, -0.05], [0.18, 0.1], [0, 0], [-0.18, 0.1], [-0.2, -0.05], [-0.18, -0.2]].map(([a, b]) => [b, a]) as [number, number][], 0.025, '#FF8AC0', { rot: [0, HALF, 0] }), bag, 1.5))
  body.add(tail)
  return { root, parts: { body, tail }, h: 0.4 }
}

/** The cuttlefish: an oval body with a frilly fin skirt, a little bunch of arms and big W eyes. Its own material, so its
 *  colors can change (the creature tints it). */
export function cuttlefishModel(bag: Bag): Model & { mat: MeshToonMaterial } {
  const root = new Group()
  const body = new Group()
  const mat = bag.add(new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() }))
  const geo = bag.add(
    merge([
      P.sphere(0.17, '#F4EDE4', { scale: [0.72, 0.5, 1.3] }, 14),
      P.torus(0.15, 0.04, '#FFFFFF', { rot: [HALF, 0, 0], scale: [0.85, 1.4, 1] }),
      P.sphere(0.06, '#EADFD2', { at: [0, -0.01, 0.23], scale: [1, 0.8, 1] }, 10),
      ...[0, 1, 2, 3, 4, 5].map((i) => P.cone(0.022, 0.14, '#F2E6DA', { at: [(i - 2.5) * 0.022, -0.02 + Math.abs(i - 2.5) * 0.006, 0.31], rot: [HALF, 0, (i - 2.5) * 0.12] }, 6)),
      P.sphere(0.04, '#FFFFFF', { at: [0.075, 0.035, 0.15] }, 8),
      P.sphere(0.04, '#FFFFFF', { at: [-0.075, 0.035, 0.15] }, 8),
    ]),
  )
  const mesh = new Mesh(geo, mat)
  body.add(mesh)
  const hull = makeHull(geo, 2)
  bag.add(hull.geometry)
  body.add(hull)
  body.add(solid(merge([...[1, -1].map((s) => P.box(0.045, 0.02, 0.012, INK, { at: [s * 0.098, 0.04, 0.18], rot: [0, s * 0.5, 0] })), P.sphere(0.012, '#FFFFFF', { at: [0.085, 0.055, 0.19] }, 4), P.sphere(0.012, '#FFFFFF', { at: [-0.085, 0.055, 0.19] }, 4)]), bag, 0))
  root.add(body)
  return { root, parts: { body }, h: 0.3, mat }
}

/** A sea urchin: a dark purple ball of long spines. */
export function urchinModel(bag: Bag): Model {
  const spines: BufferGeometry[] = []
  const n = 34
  for (let i = 0; i < n; i++) {
    // Spread over the top two thirds of a sphere (a golden-angle spiral).
    const y = 1 - (i / (n - 1)) * 1.25
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const a = i * 2.399963
    const d = [Math.cos(a) * r, y, Math.sin(a) * r]
    const len = 0.22 + (i % 3) * 0.03
    // A cone along d: rotate +y onto d.
    const pitch = Math.acos(Math.max(-1, Math.min(1, d[1])))
    const yaw = Math.atan2(d[0], d[2])
    const g = P.cone(0.018, len, i % 2 ? '#4C3570' : '#3B2A58', { at: [0, len / 2 + 0.1, 0] }, 5)
    g.rotateX(pitch)
    g.rotateY(yaw)
    g.translate(0, 0.1, 0)
    spines.push(g)
  }
  const root = new Group()
  const ball = new Group()
  ball.add(solidMix([P.sphere(0.13, '#3B2A58', { at: [0, 0.1, 0], scale: [1, 0.8, 1] }, 12)], spines, bag, 2))
  root.add(ball)
  return { root, parts: { ball }, h: 0.45 }
}

/** A patch of coral: branching pink, round brain coral, purple plates and orange sea fans, with a few tiny fish. */
export function coralModel(bag: Bag, seed = 1): Model {
  let s = seed * 9301 + 49297
  const R = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
  const parts: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  // Branching coral: a few forked pink fingers.
  for (let k = 0; k < 2; k++) {
    const bx = (R() - 0.5) * 0.9
    const bz = (R() - 0.5) * 0.9
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + R()
      const tilt = 0.25 + R() * 0.45
      const len = 0.28 + R() * 0.22
      parts.push(P.capsule(0.04, len, k ? '#FF7FA8' : '#FF9EC0', { at: [bx + Math.sin(a) * len * 0.35, len * 0.5, bz + Math.cos(a) * len * 0.35], rot: [Math.cos(a) * tilt, 0, -Math.sin(a) * tilt] }))
    }
  }
  // Brain coral: a round dome with grooves.
  const bx = (R() - 0.5) * 0.6 + 0.5
  const bz = (R() - 0.5) * 0.6
  parts.push(P.sphere(0.28, '#F2C66A', { at: [bx, 0.05, bz], scale: [1, 0.7, 1] }, 12))
  for (let i = 0; i < 3; i++) plain.push(P.torus(0.12 + i * 0.07, 0.014, '#D9A34D', { at: [bx, 0.17 - i * 0.045, bz], rot: [HALF, 0, 0] }))
  // Plate coral: purple tiers.
  const px = -0.55 + R() * 0.2
  const pz = 0.3 + R() * 0.2
  for (let i = 0; i < 3; i++) parts.push(P.cyl(0.26 - i * 0.06, 0.24 - i * 0.06, 0.04, i % 2 ? '#B58AE8' : '#C9A3F2', { at: [px + i * 0.04, 0.12 + i * 0.13, pz - i * 0.03] }, 12))
  parts.push(P.cyl(0.05, 0.06, 0.38, '#9F78D6', { at: [px, 0.15, pz] }, 6))
  // A sea fan.
  parts.push(P.prism([[0, 0], [0.22, 0.25], [0.26, 0.5], [0.1, 0.62], [-0.1, 0.62], [-0.26, 0.5], [-0.22, 0.25]], 0.03, '#FF9F6B', { at: [-0.2, 0, -0.5], rot: [0, 0.5, 0] }))
  // Sand and pebbles round it.
  plain.push(P.cyl(0.95, 1.05, 0.06, '#F4E7CC', { at: [0, 0.0, 0] }, 14))
  const root = new Group()
  const patch = new Group()
  patch.add(solidMix(parts, plain, bag, 1.5))
  root.add(patch)
  return { root, parts: { patch }, h: 0.7 }
}

/** The blue damselfish's shape (one fish), for an instanced school. */
export function damselGeometry(): BufferGeometry {
  return merge([
    P.sphere(0.075, '#2F7BFF', { scale: [0.5, 0.9, 1.3] }, 8),
    P.sphere(0.05, '#6FB0FF', { at: [0, -0.02, 0.02], scale: [0.46, 0.7, 1.1] }, 6),
    P.prism([[0, 0], [0.07, -0.06], [0.07, 0.06]].map(([a, b]) => [b, a]) as [number, number][], 0.012, '#5AA2FF', { at: [0, 0, -0.09], rot: [0, HALF, 0] }),
    P.sphere(0.016, INK, { at: [0.033, 0.02, 0.06] }, 5),
    P.sphere(0.016, INK, { at: [-0.033, 0.02, 0.06] }, 5),
  ])
}

/** A school of blue damselfish: one instanced mesh (one draw call; tiny under the water, so no outline). */
export function damselSchool(bag: Bag, n: number): InstancedMesh {
  const mat = toon('#ffffff', true)
  const m = bag.add(new InstancedMesh(bag.add(damselGeometry()), mat, n))
  m.frustumCulled = false
  return m
}

/** The book's portrait of each animal: a model to draw (its pose for the photo), from models above. */
export function portraitModel(bag: Bag, id: AnimalId): Model | null {
  switch (id) {
    case 'monitor':
      return monitorModel(bag)
    case 'squirrel':
      return squirrelModel(bag)
    case 'macaque':
      return macaqueModel(bag)
    case 'mousedeer':
      return mouseDeerModel(bag)
    case 'hornbill':
      return hornbillModel(bag)
    case 'flyingfox': {
      const m = flyingFoxModel(bag)
      for (const [w, s] of [[m.parts.wl, -1], [m.parts.wr, 1]] as const) {
        w.rotation.order = 'YXZ'
        w.rotation.set(-HALF, s * 0.45, 0)
      }
      return m
    }
    case 'heron':
      return heronModel(bag)
    case 'crab':
      return hermitModel(bag)
    case 'parrotfish':
      return parrotfishModel(bag)
    case 'cuttlefish': {
      const m = cuttlefishModel(bag)
      m.mat.color = new Color('#FF9AD0')
      return m
    }
    case 'urchin':
      return urchinModel(bag)
    case 'coral':
      return coralModel(bag, 3)
    case 'damselfish': {
      const root = new Group()
      const fish = solid(damselGeometry(), bag, 1.5)
      for (const [x, y, z, r] of [[0, 0.2, 0, 0], [0.22, 0.3, -0.1, 0.3], [-0.2, 0.12, 0.08, -0.2], [0.05, 0.4, 0.15, 0.1], [-0.12, 0.36, -0.15, -0.4]] as const) {
        const f = fish.clone()
        f.position.set(x, y, z)
        f.rotation.y = HALF + r
        f.scale.setScalar(1.8)
        root.add(f)
      }
      return { root, parts: {}, h: 0.5 }
    }
    case 'tern': {
      const root = new Group()
      const wl = pivot([0.05, 0.26, 0])
      const wr = pivot([-0.05, 0.26, 0])
      root.add(
        solid(
          merge([P.capsule(0.13, 0.42, '#FFFFFF', { at: [0, 0.26, 0], rot: [HALF, 0, 0] }), P.sphere(0.13, '#2B2330', { at: [0, 0.32, 0.3] }, 8), P.cone(0.05, 0.22, '#FF8A3D', { at: [0, 0.29, 0.47], rot: [HALF, 0, 0] }, 6), P.prism([[0, 0], [0.18, -0.32], [-0.18, -0.32]], 0.02, '#E4E6F0', { at: [0, 0.26, -0.42], rot: [HALF, 0, 0] })]),
          bag,
          1.5,
        ),
      )
      wl.add(solid(wing(1, 0.8, 0.3, '#C9CCDD', null), bag, 1.5))
      wr.add(solid(wing(-1, 0.8, 0.3, '#C9CCDD', null), bag, 1.5))
      wl.rotation.z = 0.35
      wr.rotation.z = -0.35
      root.add(wl, wr)
      return { root, parts: {}, h: 0.5 }
    }
    default:
      return null
  }
}
