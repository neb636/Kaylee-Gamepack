// The toy animals that ride the pins, one per country: chunky and round with big eyes, in the app's pastel colors, the
// way the toys on the Thailand map are made. Each stands about one unit tall with its feet at y = 0 and faces +z
// (toward her). An animal gives world.ts its moving parts: a head that tilts and things that wag (ears, a tail,
// flippers).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../engine3d/dispose'
import { merge, P, solid, type V3 } from '../engine3d/geo'
import { PAL } from '../engine3d/toon'
import type { AnimalId } from './places'

const INK = '#2B2330'
const BLUSH = '#FF9EC4'

export interface Animal {
  root: Group
  /** Everything but the shadow: squashes and hops as one. */
  body: Group
  /** Tilts from side to side as it looks about. */
  head?: Group
  /** Things that wag about their hinge: [the part, the axis, how far (radians), how fast]. */
  wags: [Group, 'x' | 'y' | 'z', number, number][]
}

const eye = (x: number, y: number, z: number, r = 0.05): BufferGeometry[] => [P.sphere(r, INK, { at: [x, y, z] }, 10), P.sphere(r * 0.38, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.35, z + r * 0.75] }, 6)]
const eyes = (dx: number, y: number, z: number, r = 0.05) => [...eye(-dx, y, z, r), ...eye(dx, y, z, r)]
const cheeks = (dx: number, y: number, z: number, r = 0.05) => [-1, 1].map((k) => P.sphere(r, BLUSH, { at: [k * dx, y, z], scale: [1, 0.7, 0.4] }, 8))
const piece = (parts: BufferGeometry[], bag: Bag, px = 1.5) => solid(merge(parts), bag, px)
/** A part that turns about a point: `at` is the pivot (in its parent), the parts are placed relative to it. */
function hinge(parts: BufferGeometry[], bag: Bag, at: V3, px = 1.5) {
  const g = piece(parts, bag, px)
  g.position.set(...at)
  return g
}

/** Maple the beaver (Canada): sitting up, two big teeth, a flat paddle of a tail. */
function beaver(bag: Bag): Animal {
  const fur = '#C08A5E'
  const belly = '#EDCFA6'
  const dark = '#8A5A40'
  const body = piece(
    [
      P.sphere(0.3, fur, { at: [0, 0.32, 0], scale: [1, 1.08, 0.95] }),
      P.sphere(0.2, belly, { at: [0, 0.3, 0.14], scale: [1, 1.1, 0.7] }, 12),
      ...[-1, 1].flatMap((k) => [P.sphere(0.1, dark, { at: [k * 0.17, 0.05, 0.16], scale: [1, 0.5, 1.4] }, 9), P.sphere(0.07, fur, { at: [k * 0.24, 0.4, 0.16], scale: [0.8, 1.3, 0.8] }, 8)]),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.26, fur, { scale: [1.05, 0.95, 0.95] }),
      P.sphere(0.13, belly, { at: [0, -0.06, 0.19], scale: [1.25, 0.8, 0.7] }, 10),
      P.sphere(0.04, dark, { at: [0, -0.01, 0.275], scale: [1.3, 0.9, 0.8] }, 8),
      P.rbox(0.05, 0.085, 0.03, 0.01, '#FFFFFF', { at: [-0.03, -0.135, 0.245] }),
      P.rbox(0.05, 0.085, 0.03, 0.01, '#FFFFFF', { at: [0.03, -0.135, 0.245] }),
      ...eyes(0.1, 0.05, 0.215),
      ...cheeks(0.17, -0.04, 0.17),
      ...[-1, 1].map((k) => P.sphere(0.065, dark, { at: [k * 0.19, 0.2, 0], scale: [1, 1, 0.6] }, 8)),
    ],
    bag,
    [0, 0.74, 0.03],
  )
  const tail = hinge([P.sphere(0.2, dark, { at: [0, 0, -0.2], scale: [0.85, 0.2, 1.25] }, 12)], bag, [0, 0.1, -0.22])
  body.add(head, tail)
  return finish(body, head, [[tail, 'x', 0.35, 3]])
}

/** Lupa the wolf cub (Italy): sitting, with pointed ears and a fluffy tail. */
function wolf(bag: Bag): Animal {
  const fur = '#B8BCD8'
  const pale = '#F3F1FA'
  const dark = '#8F93B8'
  const body = piece(
    [
      P.sphere(0.27, fur, { at: [0, 0.3, -0.02], scale: [0.95, 1.12, 0.95] }),
      P.sphere(0.17, pale, { at: [0, 0.34, 0.14], scale: [0.95, 1.15, 0.7] }, 12),
      ...[-1, 1].flatMap((k) => [P.cyl(0.06, 0.07, 0.3, fur, { at: [k * 0.11, 0.15, 0.2] }, 9), P.sphere(0.075, pale, { at: [k * 0.11, 0.035, 0.24], scale: [1, 0.5, 1.3] }, 8), P.sphere(0.11, fur, { at: [k * 0.2, 0.1, 0.02], scale: [0.9, 0.9, 1.3] }, 9)]),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.25, fur, { scale: [1.08, 0.95, 0.95] }),
      P.sphere(0.15, pale, { at: [0, -0.07, 0.15], scale: [1.3, 0.8, 0.8] }, 10),
      P.sphere(0.1, pale, { at: [0, -0.07, 0.23], scale: [0.9, 0.75, 1] }, 10),
      P.sphere(0.04, INK, { at: [0, -0.04, 0.325], scale: [1.2, 0.85, 0.8] }, 8),
      ...eyes(0.105, 0.04, 0.205),
      ...cheeks(0.18, -0.05, 0.15),
      ...[-1, 1].flatMap((k) => [P.cone(0.085, 0.2, fur, { at: [k * 0.15, 0.25, 0], rot: [0, 0, -k * 0.25] }, 8), P.cone(0.045, 0.12, '#FFB3CF', { at: [k * 0.15, 0.235, 0.035], rot: [0, 0, -k * 0.25] }, 6)]),
    ],
    bag,
    [0, 0.72, 0.04],
  )
  const tail = hinge([P.sphere(0.11, dark, { at: [0.12, 0.08, -0.06], scale: [1.7, 0.9, 0.9] }, 10), P.sphere(0.07, pale, { at: [0.27, 0.12, -0.06] }, 8)], bag, [0.14, 0.1, -0.18])
  body.add(head, tail)
  return finish(body, head, [[tail, 'y', 0.5, 5]])
}

/** A camel (Egypt): one hump, a long neck, sleepy lashes and a pink saddle blanket. Stands a little side-on. */
function camel(bag: Bag): Animal {
  const fur = '#EDBE7C'
  const dark = '#D29F60'
  const body = piece(
    [
      P.sphere(0.25, fur, { at: [0, 0.5, -0.05], scale: [0.85, 0.8, 1.35] }),
      P.sphere(0.17, fur, { at: [0, 0.7, -0.08], scale: [0.9, 1, 1.05] }, 12),
      P.rbox(0.36, 0.05, 0.3, 0.02, PAL.pink, { at: [0, 0.62, -0.08], scale: [1.22, 1, 1] }),
      P.box(0.445, 0.02, 0.06, PAL.butter, { at: [0, 0.6, -0.08] }),
      ...[-1, 1].flatMap((k) => [
        P.cyl(0.045, 0.05, 0.42, dark, { at: [k * 0.11, 0.21, 0.18] }, 8),
        P.cyl(0.045, 0.05, 0.42, dark, { at: [k * 0.11, 0.21, -0.28] }, 8),
        P.sphere(0.06, '#B98450', { at: [k * 0.11, 0.03, 0.19], scale: [1, 0.5, 1.15] }, 7),
        P.sphere(0.06, '#B98450', { at: [k * 0.11, 0.03, -0.27], scale: [1, 0.5, 1.15] }, 7),
      ]),
      P.cyl(0.015, 0.012, 0.2, dark, { at: [0, 0.42, -0.42], rot: [0.5, 0, 0] }, 5),
    ],
    bag,
  )
  const head = hinge(
    [
      P.cyl(0.065, 0.085, 0.42, fur, { at: [0, 0.16, 0.05], rot: [0.32, 0, 0] }, 9),
      P.sphere(0.13, fur, { at: [0, 0.4, 0.15], scale: [0.95, 0.9, 1.25] }, 12),
      P.sphere(0.085, '#F6D7A6', { at: [0, 0.36, 0.28], scale: [1.05, 0.85, 0.9] }, 10),
      P.sphere(0.014, dark, { at: [-0.03, 0.375, 0.355] }, 5),
      P.sphere(0.014, dark, { at: [0.03, 0.375, 0.355] }, 5),
      ...eyes(0.085, 0.44, 0.225, 0.036),
      ...cheeks(0.105, 0.38, 0.22, 0.035),
      ...[-1, 1].map((k) => P.sphere(0.04, fur, { at: [k * 0.1, 0.5, 0.08], scale: [0.7, 1.2, 0.5] }, 7)),
      P.sphere(0.05, dark, { at: [0, 0.52, 0.12], scale: [1, 0.7, 1] }, 7),
    ],
    bag,
    [0, 0.56, 0.2],
  )
  body.add(head)
  body.rotation.y = 0.6
  return finish(body, head, [])
}

/** A panda (China): sitting with a stalk of bamboo. */
function panda(bag: Bag): Animal {
  const white = '#FFFFFF'
  const black = '#4A4058'
  const body = piece(
    [
      P.sphere(0.3, white, { at: [0, 0.3, 0], scale: [1.05, 1, 0.95] }),
      ...[-1, 1].flatMap((k) => [P.sphere(0.12, black, { at: [k * 0.2, 0.09, 0.2], scale: [0.9, 0.8, 1.2] }, 10), P.sphere(0.045, '#FFB3CF', { at: [k * 0.2, 0.09, 0.325], scale: [1, 1, 0.4] }, 7)]),
      P.sphere(0.1, black, { at: [-0.27, 0.4, 0.1], scale: [0.85, 1.35, 0.85], rot: [0, 0, -0.5] }, 9),
      P.sphere(0.1, black, { at: [0.25, 0.38, 0.17], scale: [0.85, 1.35, 0.85], rot: [0.5, 0, 0.7] }, 9),
      // The bamboo, held across its tummy.
      P.cyl(0.028, 0.028, 0.62, '#8FD68A', { at: [0.2, 0.5, 0.27], rot: [0, 0, 0.35] }, 7),
      P.cyl(0.033, 0.033, 0.02, '#6FBF78', { at: [0.165, 0.4, 0.27], rot: [0, 0, 0.35] }, 7),
      P.cyl(0.033, 0.033, 0.02, '#6FBF78', { at: [0.24, 0.61, 0.27], rot: [0, 0, 0.35] }, 7),
      P.sphere(0.075, '#8FD68A', { at: [0.02, 0.82, 0.27], scale: [1.5, 0.35, 0.3], rot: [0, 0, 0.9] }, 7),
      P.sphere(0.075, '#7CCB82', { at: [0.17, 0.86, 0.27], scale: [1.5, 0.35, 0.3], rot: [0, 0, 2.2] }, 7),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.27, white, { scale: [1.1, 0.95, 0.95] }),
      ...[-1, 1].flatMap((k) => [P.sphere(0.095, black, { at: [k * 0.21, 0.2, -0.02], scale: [1, 1, 0.6] }, 9), P.sphere(0.075, black, { at: [k * 0.11, 0.025, 0.215], scale: [0.85, 1.15, 0.5], rot: [0, 0, k * 0.5] }, 9)]),
      ...[-1, 1].map((k) => P.sphere(0.022, white, { at: [k * 0.1, 0.045, 0.262] }, 6)),
      P.sphere(0.09, white, { at: [0, -0.08, 0.2], scale: [1.2, 0.75, 0.8] }, 10),
      P.sphere(0.035, INK, { at: [0, -0.05, 0.275], scale: [1.3, 0.8, 0.7] }, 8),
      ...cheeks(0.19, -0.06, 0.16),
    ],
    bag,
    [0, 0.74, 0.02],
  )
  body.add(head)
  return finish(body, head, [])
}

/** An elephant (Thailand): the same lavender elephant that lives on the Thailand map. */
function elephant(bag: Bag): Animal {
  const c = '#C9C2EA'
  const dark = '#B3ABDD'
  const body = piece(
    [
      P.sphere(0.32, c, { at: [0, 0.38, -0.08], scale: [1, 0.95, 1.15] }),
      ...[-1, 1].flatMap((k) => [P.cyl(0.09, 0.1, 0.26, dark, { at: [k * 0.16, 0.13, 0.12] }, 9), P.cyl(0.09, 0.1, 0.26, dark, { at: [k * 0.17, 0.13, -0.28] }, 9)]),
      P.cyl(0.016, 0.01, 0.16, dark, { at: [0, 0.4, -0.46], rot: [0.9, 0, 0] }, 5),
    ],
    bag,
  )
  const ear = (k: number) => hinge([P.sphere(0.2, c, { at: [k * 0.15, 0, 0], scale: [1, 1.05, 0.28] }, 12), P.sphere(0.14, '#FFB3CF', { at: [k * 0.15, 0, 0.034], scale: [1, 1.05, 0.2] }, 10)], bag, [k * 0.2, 0.05, -0.06])
  const earL = ear(-1)
  const earR = ear(1)
  const trunk = hinge(
    [P.cyl(0.075, 0.09, 0.18, c, { at: [0, -0.07, 0.03] }, 8), P.cyl(0.06, 0.075, 0.16, c, { at: [0, -0.2, 0.065], rot: [0.35, 0, 0] }, 8), P.sphere(0.063, c, { at: [0, -0.29, 0.11] }, 8)],
    bag,
    [0, -0.02, 0.24],
  )
  const head = hinge([P.sphere(0.27, c), ...eyes(0.115, 0.07, 0.235), ...cheeks(0.18, -0.02, 0.2)], bag, [0, 0.62, 0.26])
  head.add(earL, earR, trunk)
  body.add(head)
  return finish(body, head, [[earL, 'y', -0.35, 2.2], [earR, 'y', 0.35, 2.2], [trunk, 'x', 0.16, 1.4]])
}

/** Luna the alpaca (Peru): cream and fluffy, with a bright woven blanket. Stands a little side-on. */
function alpaca(bag: Bag): Animal {
  const wool = '#FFF4E2'
  const shade = '#F3DDBF'
  const fluff = (n: number, r: number, y: number, z: number, spread: number) => Array.from({ length: n }, (_, i) => P.sphere(r, i % 2 ? wool : '#FFFAF0', { at: [Math.cos((i / n) * 6.283) * spread, y + (i % 2) * 0.03, z + Math.sin((i / n) * 6.283) * spread * 1.4] }, 8))
  const body = piece(
    [
      P.sphere(0.25, wool, { at: [0, 0.46, -0.06], scale: [0.95, 0.9, 1.3] }),
      ...fluff(8, 0.13, 0.5, -0.06, 0.16),
      ...[-1, 1].flatMap((k) => [
        P.cyl(0.05, 0.055, 0.34, shade, { at: [k * 0.11, 0.17, 0.14] }, 8),
        P.cyl(0.05, 0.055, 0.34, shade, { at: [k * 0.11, 0.17, -0.26] }, 8),
        P.sphere(0.058, '#B98A66', { at: [k * 0.11, 0.025, 0.15], scale: [1, 0.45, 1.1] }, 7),
        P.sphere(0.058, '#B98A66', { at: [k * 0.11, 0.025, -0.25], scale: [1, 0.45, 1.1] }, 7),
      ]),
      // The blanket: pink with butter and mint stripes, and a tassel at each corner.
      P.rbox(0.5, 0.05, 0.3, 0.02, PAL.hotpink, { at: [0, 0.67, -0.06] }),
      P.box(0.505, 0.052, 0.045, PAL.butter, { at: [0, 0.67, -0.12] }),
      P.box(0.505, 0.052, 0.045, PAL.mint, { at: [0, 0.67, 0] }),
      ...[-1, 1].flatMap((k) => [P.sphere(0.03, PAL.gold, { at: [k * 0.25, 0.62, 0.08] }, 6), P.sphere(0.03, PAL.gold, { at: [k * 0.25, 0.62, -0.2] }, 6)]),
      P.sphere(0.07, wool, { at: [0, 0.5, -0.38] }, 8),
    ],
    bag,
  )
  const head = hinge(
    [
      P.cyl(0.085, 0.11, 0.4, wool, { at: [0, 0.16, 0.02], rot: [0.18, 0, 0] }, 10),
      ...[0.06, 0.2].map((y, i) => P.sphere(0.115, i ? '#FFFAF0' : wool, { at: [0, y, 0.02 + y * 0.18] }, 9)),
      P.sphere(0.15, wool, { at: [0, 0.42, 0.1], scale: [1, 0.95, 1.05] }, 12),
      P.sphere(0.085, '#FFE4C8', { at: [0, 0.37, 0.215], scale: [1.05, 0.85, 0.9] }, 10),
      P.sphere(0.022, '#C98A8A', { at: [0, 0.385, 0.295], scale: [1.3, 0.8, 0.7] }, 6),
      ...eyes(0.085, 0.44, 0.215, 0.04),
      ...cheeks(0.12, 0.38, 0.19, 0.035),
      P.sphere(0.1, '#FFFAF0', { at: [0, 0.56, 0.08] }, 9),
      P.sphere(0.07, wool, { at: [0.05, 0.6, 0.12] }, 8),
      ...[-1, 1].map((k) => P.sphere(0.045, shade, { at: [k * 0.12, 0.57, 0.04], scale: [0.6, 1.5, 0.5], rot: [0, 0, -k * 0.3] }, 7)),
    ],
    bag,
    [0, 0.6, 0.2],
  )
  body.add(head)
  body.rotation.y = -0.55
  return finish(body, head, [])
}

/** A kangaroo with her joey (Australia): up on her big feet, the long tail behind, Pip peeking out of the pouch. */
function kangaroo(bag: Bag): Animal {
  const fur = '#E9A76F'
  const pale = '#FBE1BE'
  const dark = '#C98450'
  const body = piece(
    [
      P.sphere(0.24, fur, { at: [0, 0.36, -0.04], scale: [0.95, 1.3, 1], rot: [0.25, 0, 0] }),
      P.sphere(0.15, pale, { at: [0, 0.32, 0.12], scale: [0.95, 1.25, 0.7] }, 12),
      ...[-1, 1].flatMap((k) => [P.sphere(0.13, fur, { at: [k * 0.17, 0.2, -0.04], scale: [0.7, 1.15, 1.2] }, 10), P.sphere(0.075, dark, { at: [k * 0.15, 0.035, 0.14], scale: [0.85, 0.45, 2.1] }, 8), P.sphere(0.045, fur, { at: [k * 0.15, 0.52, 0.2], scale: [0.8, 1.6, 0.8], rot: [0.9, 0, 0] }, 7)]),
      // Pip in the pouch.
      P.sphere(0.085, pale, { at: [0, 0.27, 0.2], scale: [1.25, 0.7, 0.6] }, 9),
      P.sphere(0.075, fur, { at: [0, 0.36, 0.22] }, 10),
      ...eyes(0.03, 0.375, 0.285, 0.016),
      P.sphere(0.012, INK, { at: [0, 0.345, 0.294] }, 5),
      ...[-1, 1].map((k) => P.sphere(0.025, fur, { at: [k * 0.045, 0.44, 0.21], scale: [0.6, 1.6, 0.5] }, 6)),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.17, fur, { scale: [1, 0.95, 1.05] }),
      P.sphere(0.1, pale, { at: [0, -0.05, 0.14], scale: [0.95, 0.8, 1.15] }, 10),
      P.sphere(0.03, INK, { at: [0, -0.02, 0.25], scale: [1.3, 0.85, 0.7] }, 7),
      ...eyes(0.085, 0.04, 0.14, 0.04),
      ...cheeks(0.125, -0.04, 0.12, 0.036),
      ...[-1, 1].flatMap((k) => [P.sphere(0.065, fur, { at: [k * 0.1, 0.23, -0.02], scale: [0.6, 1.9, 0.45], rot: [0, 0, -k * 0.22] }, 8), P.sphere(0.04, '#FFB3CF', { at: [k * 0.1, 0.23, 0.005], scale: [0.55, 1.7, 0.3], rot: [0, 0, -k * 0.22] }, 7)]),
    ],
    bag,
    [0, 0.76, 0.1],
  )
  const tail = hinge([P.cyl(0.05, 0.095, 0.5, fur, { at: [0, -0.02, -0.24], rot: [1.35, 0, 0] }, 9), P.sphere(0.05, dark, { at: [0, -0.07, -0.49] }, 7)], bag, [0, 0.16, -0.16])
  body.add(head, tail)
  return finish(body, head, [[tail, 'y', 0.25, 2.5]])
}

/** An emperor penguin (the Poles, the south): round, with flippers that flap. */
function penguin(bag: Bag): Animal {
  const black = '#4A4A6A'
  const body = piece(
    [
      P.sphere(0.3, black, { at: [0, 0.38, 0], scale: [0.95, 1.25, 0.9] }),
      P.sphere(0.24, '#FFFFFF', { at: [0, 0.34, 0.09], scale: [0.9, 1.25, 0.8] }, 14),
      P.sphere(0.12, PAL.butter, { at: [0, 0.6, 0.15], scale: [1.3, 0.5, 0.6] }, 9),
      ...[-1, 1].map((k) => P.sphere(0.09, '#FFA94D', { at: [k * 0.12, 0.03, 0.14], scale: [1, 0.4, 1.5] }, 8)),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.2, black, { scale: [1.05, 0.95, 1] }),
      P.sphere(0.15, '#FFFFFF', { at: [0, -0.03, 0.09], scale: [1.05, 0.85, 0.75] }, 12),
      P.cone(0.055, 0.14, '#FFA94D', { at: [0, -0.02, 0.24], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.7] }, 8),
      ...eyes(0.085, 0.035, 0.175, 0.04),
      ...cheeks(0.135, -0.04, 0.155, 0.04),
    ],
    bag,
    [0, 0.84, 0.02],
  )
  const flip = (k: number) => hinge([P.sphere(0.11, black, { at: [k * 0.06, -0.15, 0], scale: [0.4, 1.7, 0.9] }, 9)], bag, [k * 0.26, 0.56, 0.02])
  const flipL = flip(-1)
  const flipR = flip(1)
  flipL.rotation.z = -0.35
  flipR.rotation.z = 0.35
  body.add(head, flipL, flipR)
  return finish(body, head, [[flipL, 'z', -0.4, 4], [flipR, 'z', 0.4, 4]])
}

/** Pola the polar bear cub (the Poles, the north): sitting, with a pink scarf. */
function polarBear(bag: Bag): Animal {
  const white = '#FFFFFF'
  const shade = '#E6EEFA'
  const body = piece(
    [
      P.sphere(0.3, white, { at: [0, 0.3, 0], scale: [1.05, 1, 0.98] }),
      ...[-1, 1].flatMap((k) => [P.sphere(0.12, shade, { at: [k * 0.2, 0.09, 0.2], scale: [0.9, 0.8, 1.2] }, 10), P.sphere(0.045, '#C9D6EE', { at: [k * 0.2, 0.09, 0.325], scale: [1, 1, 0.4] }, 7), P.sphere(0.09, white, { at: [k * 0.27, 0.36, 0.12], scale: [0.85, 1.4, 0.85], rot: [0, 0, k * 0.4] }, 9)]),
      P.torus(0.17, 0.055, PAL.pink, { at: [0, 0.56, 0.02], rot: [Math.PI / 2, 0, 0] }),
      P.rbox(0.09, 0.22, 0.04, 0.02, PAL.pink, { at: [0.11, 0.43, 0.2], rot: [0, 0, -0.2] }),
      P.box(0.092, 0.03, 0.045, PAL.butter, { at: [0.125, 0.36, 0.2], rot: [0, 0, -0.2] }),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.26, white, { scale: [1.08, 0.95, 0.95] }),
      ...[-1, 1].flatMap((k) => [P.sphere(0.085, white, { at: [k * 0.2, 0.2, -0.02], scale: [1, 1, 0.6] }, 9), P.sphere(0.05, '#FFB3CF', { at: [k * 0.2, 0.2, 0.012], scale: [1, 1, 0.4] }, 7)]),
      P.sphere(0.11, shade, { at: [0, -0.07, 0.19], scale: [1.2, 0.8, 0.85] }, 10),
      P.sphere(0.04, INK, { at: [0, -0.035, 0.285], scale: [1.3, 0.85, 0.7] }, 8),
      ...eyes(0.105, 0.045, 0.215),
      ...cheeks(0.185, -0.05, 0.16),
    ],
    bag,
    [0, 0.76, 0.02],
  )
  body.add(head)
  return finish(body, head, [])
}

/** A gold star: what a new country's pin carries until its animal is made. */
function star(bag: Bag): Animal {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const r = i % 2 ? 0.2 : 0.46
    pts.push([Math.cos(a) * r, Math.sin(a) * r])
  }
  const head = hinge([P.prism(pts, 0.16, PAL.gold), ...eyes(0.09, 0.03, 0.09, 0.04), ...cheeks(0.15, -0.05, 0.085, 0.04)], bag, [0, 0.5, 0])
  const body = new Group()
  body.add(head)
  return finish(body, head, [])
}

function finish(body: Group, head: Group | undefined, wags: Animal['wags']): Animal {
  const root = new Group()
  root.add(body)
  return { root, body, head, wags }
}

const MAKE: Record<AnimalId, (bag: Bag) => Animal> = { beaver, wolf, camel, panda, elephant, alpaca, kangaroo, penguin, polarBear, star }
export const makeAnimal = (id: AnimalId, bag: Bag): Animal => (MAKE[id] ?? star)(bag)
