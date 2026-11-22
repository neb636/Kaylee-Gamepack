// Where everything is in Flashlight Statues' clearing, and the scenery the game adds round the film set's campsite
// (story/sets/campfire.ts builds the fire, Maple's log and bag, the bush, the tent, the ring of trees and the moon).
// Meters; the camera stands on +z looking toward -z, like the films'.
//
//   back:   a spruce (left), the owl's old snag, Roxy's den behind the bush, Monty, the big spruce, the maple with the
//           bat, the deer
//   middle: the bush, the fire, the tent
//   front:  the frog's stone, the fallen log, Maple on her log with the bag, the porcupine on his stump
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix, type V3 } from '../../../../engine3d/geo'
import { makeHull } from '../../../../engine3d/outline'
import { PAL } from '../../../../engine3d/toon'
import { mapleTree, spruce } from '../../story/sets/campfire'

/** [x, z, facing degrees (0: toward the camera)] */
export type Mark = [x: number, z: number, face: number]

export const CLEARING = {
  /** The owl on his branch (where his feet grip it). */
  owl: [-1.9, 1.66, -1.99] as V3,
  /** The bat hanging under the maple's branch (where his feet hold it). */
  bat: [2.98, 1.42, -2.86] as V3,
  deer: [3.95, -2.05, -20] as Mark,
  /** The porcupine on the stump. */
  porcupine: [2.75, 0.33, -0.45] as V3,
  /** The frog on the stone at the front. */
  frog: [-2.3, 0.21, 0.9] as V3,
  monty: [0.75, -2.8, -6] as Mark,
  /** In the roast, Monty comes and stands behind the fire. */
  montyFire: [0.45, -1.55, -12] as Mark,
  /** Roxy's den: a hollow log behind the bush (where the little paw came from in the film), its open end toward the
   *  fire; and where her eyes shine in the bush before she comes out. */
  den: [-0.8, -2.6, 40] as Mark,
  denEyes: [-0.6, 0.68, -0.46] as V3,
  /** Where Roxy sneaks: out of the den, round the bush, behind the fire to the bag on Maple's log. */
  path: [
    [-0.2, -2.35],
    [0.45, -1.75],
    [0.6, -1.0],
    [0.2, -0.62],
    [-0.5, -0.32],
  ] as [number, number][],
  /** The kits' hiding places: hidden behind (or inside) it, and peeking out (x, y, z), facing; where a stuck kit's tail
   *  shows. The tent's kit peeks out of its glowing door; the log's comes up behind it and round its end. */
  hides: [
    { id: 'tent', hide: [2.02, 0, -1.57] as V3, peek: [1.74, 0, -0.88] as V3, face: -18, tail: [1.62, 0.12, -1.02] as V3, tailDir: -1 },
    { id: 'snag', hide: [-2.35, 0, -2.5] as V3, peek: [-2.85, 0, -1.98] as V3, face: 20, tail: [-2.68, 0.12, -2.4] as V3, tailDir: -1 },
    { id: 'log', hide: [-2.9, -0.62, -0.78] as V3, peek: [-2.05, 0, -0.8] as V3, face: 25, tail: [-2.22, 0.1, -0.72] as V3, tailDir: 1 },
  ],
  /** Round the fire, after: Roxy, her kits, Monty. */
  roxyFire: [0.95, -0.6, -28] as Mark,
  /** The marshmallow stick at rest: the end she grabs (with the marshmallow) and the end on the ground. */
  stickRest: { tip: [1.05, 0.34, 0.95] as V3, end: [1.75, 0.02, 1.55] as V3 },
}

export const SNAG = { x: -2.35, z: -2.05, r: 0.3, h: 2.7 }
export const FALLEN = { x: -3.05, z: -0.42, len: 1.5, r: 0.21 }

/** The game's own scenery round the campsite: the near trees (the snag the owl sits in, the maple the bat hangs from),
 *  the fallen log, Roxy's den, ferns and mushrooms, and soft shadows under them. */
export function buildClearing(bag: Bag, root: Group) {
  const parts: ReturnType<typeof P.box>[] = []
  // The near trees, round the back of the clearing (the film set's ring stands further out).
  for (const [x, z, h, maple] of [
    [-3.7, -3.6, 4.4, false],
    [-1.25, -4.5, 3.0, true],
    [1.15, -4.75, 5.2, false],
    [3.75, -3.35, 3.2, true],
    [5.6, -2.3, 4.0, false],
    [-5.4, -1.8, 3.6, false],
  ] as [number, number, number, boolean][])
    for (const p of maple ? mapleTree(h, Math.round(x * 3)) : spruce(h, Math.round(z * 3))) parts.push(p.translate(x, 0, z))
  // The maple's low branch the bat hangs from (out of its trunk toward the clearing).
  parts.push(P.capsule(0.05, 0.8, '#5A3A2A', { at: [3.33, 1.47, -3.07], rot: [0, 0.55, 1.28], order: 'YXZ' }))
  root.add(solid(merge(parts), bag, 2))

  // The owl's old snag: a thick grey trunk with a broken top, its bark ridged, one bare branch out to the right where
  // the owl sits, a stub on the other side.
  const { x: sx, z: sz, r: sr, h: sh } = SNAG
  const bark = '#7C6E6A'
  const dark = '#5E524F'
  root.add(
    solidMix(
      [
        P.cyl(sr * 0.72, sr, sh, bark, { at: [sx, sh / 2, sz] }, 14),
        // Roots spreading at the foot.
        ...[0, 1, 2, 3].map((i) => P.sphere(sr * 0.55, bark, { at: [sx + Math.cos(i * 1.7 + 0.4) * sr * 0.95, 0.06, sz + Math.sin(i * 1.7 + 0.4) * sr * 0.95], scale: [1.4, 0.5, 0.9], rot: [0, -(i * 1.7 + 0.4), 0] })),
        // The owl's branch, sloping up a little to its tip, and a stub.
        P.capsule(0.055, 0.62, bark, { at: [sx + 0.28, 1.61, sz + 0.06], rot: [0, 0, -1.42] }),
        P.capsule(0.045, 0.3, bark, { at: [sx - 0.25, 1.15, sz + 0.02], rot: [0, 0, 1.0] }),
        // The broken top.
        ...[0, 1, 2].map((i) => P.cone(sr * 0.32, 0.26 - i * 0.05, bark, { at: [sx + Math.cos(i * 2.1) * sr * 0.4, sh + 0.08, sz + Math.sin(i * 2.1) * sr * 0.4], rot: [Math.sin(i * 2.1) * 0.3, 0, -Math.cos(i * 2.1) * 0.3] }, 6)),
      ],
      [
        // Bark ridges, a knot hole.
        ...[0, 1, 2, 3, 4].map((i) => P.box(0.03, 0.5 + (i % 2) * 0.3, 0.02, dark, { at: [sx + Math.sin(-0.9 + i * 0.45) * sr * 0.9, 0.6 + (i % 3) * 0.45, sz + Math.cos(-0.9 + i * 0.45) * sr * 0.9], rot: [0, -0.9 + i * 0.45, 0] })),
        P.sphere(0.07, '#3A302E', { at: [sx - 0.05, 1.05, sz + sr * 0.84], scale: [1, 1.35, 0.4] }, 10),
      ],
      bag,
      2,
    ),
  )
  root.add(blobShadow(0.65, bag).translateX(sx).translateZ(sz))

  // The fallen log at the front left (a kit hides behind it): mossy on top, its ends pale.
  const { x: lx, z: lz, len, r: lr } = FALLEN
  root.add(
    solidMix(
      [P.cyl(lr, lr * 1.05, len, '#8A5A3A', { at: [lx, lr * 0.9, lz], rot: [0, 0.18, Math.PI / 2], order: 'YXZ' }, 14)],
      [
        ...[-1, 1].map((s) => P.cyl(lr * 0.86, lr * 0.86, 0.02, '#D9A46E', { at: [lx + s * (len / 2 + 0.005) * Math.cos(0.18), lr * 0.9, lz - s * (len / 2 + 0.005) * Math.sin(0.18)], rot: [0, 0.18, Math.PI / 2], order: 'YXZ' }, 14)),
        ...[-0.4, 0, 0.35].map((k, i) => P.sphere(0.13 - i * 0.02, '#5E8C4E', { at: [lx + k * Math.cos(0.18), lr * 1.75, lz - k * Math.sin(0.18) + 0.02], scale: [1.6, 0.4, 1] }, 10)),
      ],
      bag,
      2,
    ),
  )
  root.add(blobShadow(0.9, bag).translateX(lx).translateZ(lz))

  // Roxy's den: a big hollow log behind the bush, its dark open end toward the fire, a little pink bow of hers over the
  // door.
  const den = new Group()
  const [dx, dz, df] = CLEARING.den
  den.position.set(dx, 0, dz)
  den.rotation.y = (df * Math.PI) / 180
  den.add(
    solidMix(
      [P.cyl(0.42, 0.44, 1.3, '#7A5034', { at: [0, 0.4, -0.2], rot: [Math.PI / 2, 0, 0] }, 16), P.torus(0.36, 0.07, '#8E6040', { at: [0, 0.4, 0.45] })],
      [
        P.cyl(0.35, 0.35, 0.02, '#1E1622', { at: [0, 0.4, 0.43], rot: [Math.PI / 2, 0, 0] }, 16),
        ...[-0.45, 0.05].map((z, i) => P.sphere(0.14 - i * 0.03, '#5E8C4E', { at: [0.05 - i * 0.1, 0.82, z], scale: [1.7, 0.45, 1.2] }, 10)),
        P.sphere(0.05, PAL.pink, { at: [-0.06, 0.87, 0.4], scale: [1.2, 0.8, 0.5] }, 8),
        P.sphere(0.05, PAL.pink, { at: [0.06, 0.87, 0.4], scale: [1.2, 0.8, 0.5] }, 8),
        P.sphere(0.03, PAL.hotpink, { at: [0, 0.87, 0.42] }, 8),
      ],
      bag,
      2,
    ),
  )
  root.add(den, blobShadow(0.8, bag).translateX(dx).translateZ(dz))

  // Ferns and little mushrooms round the edge of the clearing, so it isn't bare.
  const small: ReturnType<typeof P.box>[] = []
  const fern = (x: number, z: number, s: number) => {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + x
      small.push(P.sphere(0.2 * s, i % 2 ? '#3F7A55' : '#4E8A5E', { at: [x + Math.cos(a) * 0.17 * s, 0.11 * s, z + Math.sin(a) * 0.17 * s], rot: [0, -a, 0.5], scale: [1.6, 0.25, 0.55] }, 8))
    }
  }
  for (const [x, z, s] of [
    [-3.9, 0.6, 1.1],
    [-1.75, -1.85, 0.9],
    [3.6, 0.5, 1.2],
    [4.2, -1.1, 0.9],
    [-0.4, -2.2, 0.8],
    [1.9, -3.2, 1],
  ])
    fern(x, z, s)
  for (const [x, z] of [
    [-2.7, 0.35],
    [-2.55, 0.42],
    [3.15, -0.15],
    [1.65, -2.75],
  ]) {
    small.push(P.cyl(0.018, 0.022, 0.08, '#F3E7DA', { at: [x, 0.04, z] }, 6))
    small.push(P.sphere(0.05, '#FF8FB8', { at: [x, 0.08, z], scale: [1, 0.55, 1] }, 10))
  }
  root.add(solid(merge(small), bag, 1.2))
}

/** A stuck kit's tail, sticking out from its hiding place and wiggling (the help after 8 s): grey with dark rings,
 *  a little moonlit (it shows in the dark without the flashlight on it). It wags from its root (the group's origin). */
export function kitTail(bag: Bag) {
  const g = new Group()
  const rings: ReturnType<typeof P.box>[] = []
  for (let i = 0; i < 6; i++) rings.push(P.sphere(0.075 - i * 0.004, i % 2 ? '#5E5872' : '#C9C4D8', { at: [i * 0.07, 0, 0], scale: [0.75, 1, 1] }, 12))
  rings.push(P.sphere(0.064, '#5E5872', { at: [0.42, 0, 0], scale: [1.25, 1, 1] }, 12))
  const geo = bag.add(merge(rings))
  g.add(new Mesh(geo, bag.add(new MeshBasicMaterial({ vertexColors: true }))))
  const hull = makeHull(geo, 2.5, '#E8F06A')
  bag.add(hull.geometry)
  g.add(hull)
  g.visible = false
  return g
}
