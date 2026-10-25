// What stands at the end of each Nan road, and along the way, as greybox toys in the toon look (the real models are the
// look step): Nan's market square (stalls round a big umbrella), the mushroom farm's dark wooden
// house with a big pink mushroom on the roof, Stop Time Cafe's deck on stilts over the valley, the viewpoint's little
// sala, Nan town's market stalls, and a waterfall down the mountain beside the sky road. Each faces +z (the road).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import type { HeightField } from '../../../trip/road/build'
import type { Road } from '../../../trip/road/road'
import type { LandmarkKind } from './roads'

const WOOD = '#A07A63'
const DARK = '#6E5649'
const GOLD = PAL.gold

export function buildLandmark(kind: LandmarkKind, bag: Bag): Group {
  const g = new Group()
  if (kind === 'market') {
    // The market square: stalls under striped awnings in a horseshoe round a big pink umbrella and its tables.
    const stripes = [PAL.hotpink, PAL.sky, PAL.mint, PAL.butter, PAL.lavenderDark]
    g.add(solid(merge([
      P.box(10, 0.15, 9, PAL.cream, { at: [0, 0.075, 0] }),
      ...[-2, -1, 0, 1, 2].flatMap((k) => {
        const a = (k / 2) * 1.25
        const x = Math.sin(a) * 3.8
        const z = -Math.cos(a) * 3.2
        return [
          P.box(2.4, 0.9, 1.2, WOOD, { at: [x, 0.6, z], rot: [0, -a, 0] }),
          P.box(2.8, 0.12, 1.8, stripes[k + 2], { at: [x, 2.5, z], rot: [0, -a, 0] }),
          ...[-1, 1].map((s) => P.cyl(0.06, 0.06, 2.3, '#F4EFF8', { at: [x + Math.cos(a) * s * 1.3, 1.3, z + Math.sin(a) * s * 1.3] })),
          ...[-1, 0, 1].map((j) => P.sphere(0.22, [GOLD, '#FF7A5C', '#9FE07A'][(j + k + 3) % 3], { at: [x + Math.cos(a) * j * 0.7, 1.2, z + Math.sin(a) * j * 0.7] })),
        ]
      }),
      P.cyl(0.08, 0.08, 2.8, DARK, { at: [0, 1.5, 0.6] }),
      P.cone(2.4, 0.9, PAL.pink, { at: [0, 3.1, 0.6] }, 12),
      ...[-1, 1].map((s) => P.cyl(0.6, 0.6, 0.1, WOOD, { at: [s * 1.3, 0.8, 0.9] })),
      ...[-1, 1].map((s) => P.cyl(0.08, 0.1, 0.7, DARK, { at: [s * 1.3, 0.45, 0.9] })),
    ]), bag, 2))
  } else if (kind === 'mushrooms') {
    // The farm's dark wooden mushroom house, a big pink mushroom on its roof, and a table out front.
    g.add(solid(merge([
      P.box(8, 3.2, 5.5, DARK, { at: [0, 1.6, 0] }),
      P.prism([[-4.6, 0], [4.6, 0], [0, 2.6]], 6.2, WOOD, { at: [0, 3.2, 0] }),
      P.box(1.4, 2.2, 0.1, '#3E3849', { at: [0, 1.1, 2.8] }),
      ...[-1, 1].map((s) => P.box(1.2, 0.8, 0.1, '#FFE9B8', { at: [s * 2.6, 2, 2.8] })),
      P.cyl(0.55, 0.7, 1.8, PAL.cream, { at: [0, 6.2, 0] }),
      P.sphere(2.2, PAL.hotpink, { at: [0, 7.3, 0], scale: [1, 0.5, 1] }),
      ...[[0.9, 0.5], [-1, 0.2], [0.1, -1.1], [-0.4, 1.2]].map(([x, z]) => P.sphere(0.32, '#FFFFFF', { at: [x, 7.9 - Math.hypot(x, z) * 0.18, z], scale: [1, 0.5, 1] })),
      P.box(2.4, 0.12, 1.2, WOOD, { at: [3.8, 0.8, 4.4] }),
      ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z]) => P.box(0.1, 0.8, 0.1, WOOD, { at: [3.8 + x * 1.05, 0.4, 4.4 + z * 0.5] })),
    ]), bag, 2))
  } else if (kind === 'cafe') {
    // Stop Time Cafe: a wooden deck on stilts, a peaked roof, a railing of crossed branches, stools at the rail.
    const parts: BufferGeometry[] = [
      P.box(9, 0.3, 6, WOOD, { at: [0, 2.2, 0] }),
      ...[-4, 0, 4].flatMap((x) => [-2.7, 2.7].map((z) => P.cyl(0.18, 0.2, 2.2, DARK, { at: [x, 1.1, z] }))),
      ...[-4.2, 4.2].flatMap((x) => [-2.7, 2.7].map((z) => P.cyl(0.12, 0.12, 2.6, DARK, { at: [x, 3.6, z] }))),
      P.prism([[-5.2, 0], [5.2, 0], [0, 2.4]], 7, '#8E6C58', { at: [0, 4.9, 0] }),
      P.box(9, 0.12, 0.12, DARK, { at: [0, 3.2, -2.9] }),
      ...[-3, -1, 1, 3].flatMap((x) => [P.box(0.08, 1.4, 0.08, DARK, { at: [x, 2.9, -2.9], rot: [0, 0, 0.6] }), P.box(0.08, 1.4, 0.08, DARK, { at: [x, 2.9, -2.9], rot: [0, 0, -0.6] })]),
      ...[-2, 0, 2].map((x) => P.cyl(0.25, 0.22, 0.9, PAL.peach, { at: [x, 2.8, -2.2] })),
    ]
    g.add(solid(merge(parts), bag, 2))
  } else {
    // The viewpoint: a little sala (an open pavilion) with a pink roof, and a coin telescope.
    g.add(solid(merge([
      P.box(4.4, 0.3, 4.4, PAL.cream, { at: [0, 0.15, 0] }),
      ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.14, 0.14, 2.6, WOOD, { at: [x * 1.9, 1.6, z * 1.9] }))),
      P.cone(3.6, 2, PAL.pink, { at: [0, 3.9, 0] }, 4),
      P.cyl(0.08, 0.1, 1.1, '#D9DCE8', { at: [2.8, 0.55, 2] }),
      P.cyl(0.14, 0.18, 0.7, '#D9DCE8', { at: [2.8, 1.2, 2], rot: [Math.PI / 2 - 0.3, 0, 0] }),
    ]), bag, 2))
  }
  return g
}

/** Market stalls along both sides of the road between `from` and `to`: striped awnings over tables of fruit. */
export function buildMarket(road: Road, field: HeightField, from: number, to: number, bag: Bag) {
  const parts: BufferGeometry[] = []
  const stripes = [PAL.hotpink, PAL.sky, PAL.mint, PAL.butter, PAL.lavenderDark]
  let n = 0
  for (const side of [1, -1])
    for (let s = from; s < to; s += 9, n++) {
      const p = road.spotAt(s, side * (road.half + 4))
      const y = field.at(p.x, p.z)
      const c = stripes[n % stripes.length]
      const yaw = p.heading + (side > 0 ? -Math.PI / 2 : Math.PI / 2)
      const at = (lx: number, ly: number, lz: number): [number, number, number] => [p.x + Math.cos(yaw) * lx + Math.sin(yaw) * lz, y + ly, p.z - Math.sin(yaw) * lx + Math.cos(yaw) * lz]
      parts.push(
        P.box(3, 0.9, 1.4, WOOD, { at: at(0, 0.45, 0), rot: [0, yaw, 0] }),
        ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.06, 0.06, 2.4, '#F4EFF8', { at: at(x * 1.5, 1.2, z * 0.8) }))),
        P.box(3.4, 0.12, 2, c, { at: at(0, 2.45, 0), rot: [0, yaw, 0] }),
        ...[-1, 0, 1].map((k) => P.sphere(0.24, [PAL.gold, '#FF7A5C', '#9FE07A'][(k + n + 3) % 3], { at: at(k * 0.8, 1.05, 0.2) })),
      )
    }
  return solid(merge(parts), bag, 2)
}

/** A waterfall pouring down the hillside next to the road into a pool (its spray comes from the drive's particles). */
export function buildFalls(height: number, bag: Bag) {
  const g = new Group()
  g.add(solid(merge([
    P.rbox(7, height + 2, 3, 0.8, '#9C93AE', { at: [0, (height + 2) / 2, -1.6] }),
    P.box(2.6, height, 0.3, '#EAF6FF', { at: [0, height / 2, 0] }),
    P.box(1.2, height, 0.32, '#FFFFFF', { at: [0.3, height / 2, 0.02] }),
    P.cyl(2.6, 2.6, 0.3, '#A8DCFF', { at: [0, 0.1, 1.6] }),
  ]), bag, 2))
  return g
}
