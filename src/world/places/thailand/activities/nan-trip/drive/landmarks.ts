// What stands at the end of each Nan road, and along the way, as toys in the toon look (plan: thailand/nan-trip.html,
// step 8, the look): Nan's market square (stalls under striped pitched awnings round a big pink umbrella, baskets of
// fruit, a string of paper lanterns), Baan Huanam's mushroom farm (a dark plank house in the trees with a tin roof, the
// big pink mushroom on top, rows of sawdust bags through its open door, a table out front under an umbrella, mushroom
// stools), Stop Time Cafe's wooden deck on stilts (plank floor, railings of crossed branches, a peaked roof with string
// lights, benches and stools, the steps up), Bo Kluea's salt village at the turn-off off the sky road (a wet street
// down to the open salt huts: the big pan steaming over its fire, baskets heaped with white salt, the well with its
// bamboo pole, and the wooden house with its mural of a Tai Lue couple), the 3 road's viewpoint (a little open pavilion with a pink roof, a fence
// at the edge, a bench, a coin telescope, pots of pink bougainvillea), Nan town's market stalls, the three-step
// waterfall down the mountain beside the sky road, and, with the Nan Mountain Cup on (cup/rules.ts), the market square
// dressed as its race ground (a balloon arch over the way in, the board with its three tracks, the grandstand, the Cup
// on its stand, bunting). Each faces +z (the road).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { HeightField } from '../../../trip/road/build'
import type { Road } from '../../../trip/road/road'
import type { LandmarkKind } from './roads'

const WOOD = '#A07A63'
const DARK = '#6E5649'
const GOLD = PAL.gold

export function buildLandmark(kind: LandmarkKind, bag: Bag): Group {
  const g = new Group()
  const parts: BufferGeometry[] = []
  if (kind === 'market') {
    // The market square: stalls under striped awnings in a horseshoe round a big pink umbrella and its tables.
    const stripes = [PAL.hotpink, PAL.sky, PAL.mint, PAL.butter, PAL.lavenderDark]
    parts.push(P.box(11, 0.15, 10, '#EDE6F0', { at: [0, 0.075, 0] }))
    for (const k of [-2, -1, 0, 1, 2]) {
      const a = (k / 2) * 1.25
      const x = Math.sin(a) * 3.9
      const z = -Math.cos(a) * 3.3
      const c = stripes[k + 2]
      const at = (lx: number, ly: number, lz: number): [number, number, number] => [x + Math.cos(a) * lx + Math.sin(a) * lz, ly, z - Math.sin(a) * lx + Math.cos(a) * lz]
      parts.push(
        P.box(2.4, 0.9, 1.2, WOOD, { at: at(0, 0.6, 0), rot: [0, -a, 0] }),
        P.box(2.5, 0.08, 1.3, DARK, { at: at(0, 1.08, 0), rot: [0, -a, 0] }),
        // A pitched awning in stripes of the stall's color and white.
        ...[-1, 1].flatMap((side) => [0, 1, 2, 3].map((i) => P.box(0.7, 0.06, 1.05, i % 2 ? '#FFFFFF' : c, { at: at(-1.05 + i * 0.7, 2.55, side * 0.42), rot: [side * 0.45, -a, 0] }))),
        ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.05, 0.05, 2.5, '#F4EFF8', { at: at(sx * 1.3, 1.3, sz * 0.6) }))),
        // Baskets heaped with fruit.
        ...[-1, 0, 1].flatMap((j) => [
          P.cyl(0.3, 0.24, 0.18, '#C9A27E', { at: at(j * 0.75, 1.2, 0.1) }, 10),
          ...[0, 1, 2].map((q) => P.sphere(0.13, [GOLD, '#FF7A5C', '#9FE07A', '#B98AE0'][(j + k + q + 4) % 4], { at: at(j * 0.75 + (q - 1) * 0.12, 1.36 + (q === 1 ? 0.08 : 0), 0.1 + (q === 1 ? 0 : 0.06)) }, 8)),
        ]),
      )
    }
    // The big umbrella, its tables and stools, and a string of paper lanterns across the square.
    parts.push(
      P.cyl(0.08, 0.08, 2.8, DARK, { at: [0, 1.5, 0.8] }),
      P.cone(2.4, 0.9, PAL.pink, { at: [0, 3.1, 0.8] }, 12),
      P.sphere(0.14, PAL.hotpink, { at: [0, 3.6, 0.8] }),
      ...[-1, 1].flatMap((sx) => [
        P.cyl(0.6, 0.6, 0.1, WOOD, { at: [sx * 1.3, 0.8, 1.1] }),
        P.cyl(0.08, 0.1, 0.7, DARK, { at: [sx * 1.3, 0.45, 1.1] }),
        ...[-1, 1].map((sz) => P.cyl(0.2, 0.2, 0.45, PAL.cream, { at: [sx * 1.3 + sz * 0.75, 0.3, 1.1 + sz * 0.3] }, 10)),
      ]),
      ...[-1, 1].map((sx) => P.cyl(0.05, 0.05, 3.6, DARK, { at: [sx * 5, 1.8, 3.6] })),
      ...[-4, -2.4, -0.8, 0.8, 2.4, 4].map((x, i) => P.sphere(0.24, [PAL.hotpink, PAL.gold, PAL.pink][i % 3], { at: [x, 3.1 - Math.cos((x / 5) * 1.3) * 0.4 + 0.15, 3.6], scale: [1, 1.2, 1] }, 10)),
    )
  } else if (kind === 'raceground') {
    // The race ground: the square's paving, a checkered arch with balloons over the way in, the board with its three
    // tracks (forest green, rice-step green, cloud blue), the grandstand with its striped roof, the Cup on a pink stand.
    const colors = [PAL.pink, PAL.butter, PAL.mint, PAL.sky, PAL.lavender]
    parts.push(P.box(12, 0.15, 10, '#ECE4EF', { at: [0, 0.075, 0] }))
    for (const sx of [-1, 1]) parts.push(P.cyl(0.2, 0.24, 4.6, PAL.cream, { at: [sx * 3.2, 2.3, 4.2] }, 10))
    for (let i = 0; i < 8; i++) parts.push(P.box(0.8, 0.7, 0.25, i % 2 ? '#FFFFFF' : PAL.ink, { at: [-2.8 + i * 0.8, 4.6, 4.2] }))
    for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) parts.push(P.sphere(0.32, colors[i], { at: [sx * (3.2 + Math.cos(i * 1.3) * 0.45), 5.3 + (i % 3) * 0.4, 4.2 + Math.sin(i * 1.3) * 0.4], scale: [1, 1.15, 1] }, 10))
    // The board, at the back on the left.
    parts.push(
      P.cyl(0.14, 0.16, 4, PAL.cream, { at: [-5.2, 2, -2.4] }, 8),
      P.cyl(0.14, 0.16, 4, PAL.cream, { at: [-0.8, 2, -2.4] }, 8),
      P.rbox(4.8, 2.4, 0.2, 0.1, PAL.lavender, { at: [-3, 2.6, -2.3] }),
      ...['#5FAE7E', '#BFE8C8', '#A8DCFF'].map((c, i) => P.rbox(1.25, 1.25, 0.1, 0.08, c, { at: [-4.45 + i * 1.45, 2.5, -2.15] })),
    )
    // The grandstand on the right, its roof striped pink and white.
    for (let i = 0; i < 3; i++) parts.push(P.box(4.6, 0.45 * (i + 1), 0.8, i % 2 ? '#C9BDF0' : PAL.lavender, { at: [3.2, 0.225 * (i + 1), -1.6 - i * 0.8] }))
    for (let i = 0; i < 6; i++) parts.push(P.box(0.8, 0.08, 3, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [1.2 + i * 0.8, 3.1, -2.4] }))
    for (const x of [1.0, 5.4]) parts.push(P.cyl(0.08, 0.08, 3.1, PAL.cream, { at: [x, 1.55, -0.9] }, 8))
    // The Cup on its stand in the middle.
    parts.push(P.cyl(0.4, 0.5, 1.2, PAL.pink, { at: [0, 0.75, -0.6] }, 14), P.cyl(0.08, 0.12, 0.3, GOLD, { at: [0, 1.5, -0.6] }, 10), P.cyl(0.36, 0.14, 0.45, GOLD, { at: [0, 1.85, -0.6] }, 16))
    // Bunting from the arch to the grandstand.
    for (let i = 0; i < 12; i++) parts.push(P.cone(0.2, 0.4, [PAL.hotpink, GOLD, PAL.mint, PAL.sky][i % 4], { at: [-3 + i * 0.75, 4.1 - Math.sin((i / 11) * Math.PI) * 0.6, 1.4], rot: [Math.PI, 0, 0], scale: [1, 1, 0.2] }, 3))
    // Dressed for the Cup, like the race ground itself (cup/ground3d.ts): pennant flags on tall poles, round paper lanterns
    // along the grandstand's roof, the three rivals' karts parked by the board, cones along the front.
    for (const [x, z, c] of [[-5.6, 3, PAL.hotpink], [5.6, 3, GOLD], [-5.6, -4.2, PAL.mint], [5.8, -4.2, PAL.sky]] as const) parts.push(P.cyl(0.07, 0.09, 5, PAL.cream, { at: [x, 2.5, z] }, 8), P.sphere(0.13, GOLD, { at: [x, 5.05, z] }, 8), P.prism([[0, 0.35], [0, -0.35], [1.3, 0]], 0.04, c, { at: [x, 4.6, z] }))
    for (let i = 0; i < 5; i++) parts.push(P.cyl(0.006, 0.006, 0.3, PAL.ink, { at: [1.4 + i * 0.95, 2.95, -0.9] }, 4), P.sphere(0.2, colors[i], { at: [1.4 + i * 0.95, 2.62, -0.9], scale: [1, 1.1, 1] }, 10))
    for (const [x, c] of [[-4.5, '#FFC83D'], [-3, '#C9875C'], [-1.5, '#FF9A3C']] as const) parts.push(P.rbox(1.1, 0.35, 1.7, 0.1, c, { at: [x, 0.5, -0.9] }), ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.15, 0.15, 0.18, '#4A4352', { at: [x + sx * 0.6, 0.3, -0.9 + sz * 0.55], rot: [0, 0, Math.PI / 2] }, 10))))
    for (const x of [-2.2, -0.9, 0.9, 2.2]) parts.push(P.cone(0.18, 0.5, '#FF8A3D', { at: [x, 0.4, 3.6] }, 10), P.cyl(0.12, 0.15, 0.09, '#FFFFFF', { at: [x, 0.38, 3.6] }, 10))
  } else if (kind === 'mushrooms') {
    // Baan Huanam: the dark plank mushroom house with a tin roof and the big pink mushroom on it, its door open on the
    // rows of sawdust bags; out front the farm's table under an umbrella and mushroom stools; trees behind.
    parts.push(
      P.box(9, 0.2, 7, '#B9A48E', { at: [0, 0.1, 0.4] }),
      P.box(8, 3.2, 5.5, DARK, { at: [0, 1.7, -0.4] }),
      // Plank lines and the corner posts.
      ...[0.7, 1.4, 2.1, 2.8].map((y) => P.box(8.04, 0.05, 5.54, '#5A463C', { at: [0, y, -0.4] })),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.box(0.24, 3.3, 0.24, '#5A463C', { at: [sx * 4, 1.7, -0.4 + sz * 2.75] }))),
      // The tin roof: two slopes of ridged sheets, the ridge, the overhang over the door.
      ...[-1, 1].map((side) => P.box(9.2, 0.08, 3.6, '#B8BFD0', { at: [0, 4.0, -0.4 + side * 1.55], rot: [side * -0.55, 0, 0] })),
      ...[-1, 1].flatMap((side) => [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((x) => P.box(0.06, 0.06, 3.6, '#9EA6BA', { at: [x, 4.05, -0.4 + side * 1.55], rot: [side * -0.55, 0, 0] }))),
      P.box(9.3, 0.14, 0.24, '#8E96AA', { at: [0, 4.95, -0.4] }),
      P.prism([[-4, 0], [4, 0], [0, 1.6]], 0.1, WOOD, { at: [0, 3.2, 2.36] }),
      // The open door, dark inside, with sawdust bags (cream, mushrooms at their mouths) on racks.
      P.box(1.8, 2.3, 0.1, '#2E2630', { at: [-1.6, 1.25, 2.36] }),
      ...[0.55, 1.15, 1.75].flatMap((y) => [-2.2, -1.6, -1.0].map((x) => P.cyl(0.2, 0.2, 0.36, '#F1E4D6', { at: [x, y, 2.3], rot: [Math.PI / 2, 0, 0] }, 10))),
      ...[0.55, 1.15, 1.75].flatMap((y) => [-2.2, -1.6, -1.0].map((x, i) => P.sphere(0.12, i === 1 && y > 1 ? PAL.pink : '#D9D2E2', { at: [x, y, 2.5], scale: [1.2, 0.5, 1] }, 8))),
      // A window with its shutter open, glowing warm.
      P.box(1.6, 1.0, 0.1, '#FFE9B8', { at: [2.1, 1.9, 2.36] }),
      P.box(0.1, 1.2, 0.9, WOOD, { at: [3.0, 1.9, 2.75], rot: [0, 0.6, 0] }),
      // The big pink mushroom on the roof's ridge: a cream stalk, a spotty cap.
      P.cyl(0.55, 0.7, 1.8, PAL.cream, { at: [0, 5.9, -0.4] }),
      P.sphere(2.2, PAL.hotpink, { at: [0, 7.0, -0.4], scale: [1, 0.5, 1] }),
      ...[[0.9, 0.5], [-1, 0.2], [0.1, -1.1], [-0.4, 1.2], [1.3, -0.6]].map(([x, z]) => P.sphere(0.32, '#FFFFFF', { at: [x, 7.6 - Math.hypot(x, z) * 0.18, z - 0.4], scale: [1, 0.5, 1] })),
      // The table out front under its umbrella, mushroom stools round it.
      P.box(2.4, 0.12, 1.2, WOOD, { at: [3.6, 0.95, 4.6] }),
      ...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z]) => P.box(0.1, 0.9, 0.1, WOOD, { at: [3.6 + x * 1.05, 0.5, 4.6 + z * 0.5] })),
      P.cyl(0.05, 0.05, 2.6, DARK, { at: [3.6, 1.5, 4.6] }),
      P.cone(1.8, 0.7, PAL.mint, { at: [3.6, 2.9, 4.6] }, 10),
      ...[[2.3, 4.0], [4.9, 4.0], [2.3, 5.2], [4.9, 5.2]].flatMap(([x, z]) => [P.cyl(0.12, 0.14, 0.5, PAL.cream, { at: [x, 0.45, z] }, 8), P.sphere(0.32, PAL.pink, { at: [x, 0.72, z], scale: [1, 0.45, 1] }, 10)]),
      // Pots of plants and a few trees round the house.
      ...[[-4.6, 2.6], [4.6, 2.6]].flatMap(([x, z]) => [P.cyl(0.3, 0.24, 0.5, '#E3906F', { at: [x, 0.45, z] }, 10), P.sphere(0.45, '#6FBF86', { at: [x, 1.0, z] }, 10)]),
      ...[[-6, -2.5, 1.2], [6, -1.5, 1], [-5.5, 2.5, 0.8], [7, 3.5, 0.9]].flatMap(([x, z, k]) => [P.cyl(0.25 * k, 0.32 * k, 2.6 * k, '#A07A63', { at: [x, 1.3 * k, z] }, 8), P.sphere(2.2 * k, ['#5FAE7E', '#4F9D78'][Math.round(x) & 1], { at: [x, 3.6 * k, z], scale: [1, 0.9, 1] }, 10)]),
    )
  } else if (kind === 'cafe') {
    // Stop Time Cafe: a wooden deck on stilts over the valley, a peaked roof with string lights, a railing of crossed
    // branches, benches and stools at the rail, the steps up from the road and a little kitchen hut behind.
    parts.push(
      P.box(9, 0.3, 6, WOOD, { at: [0, 2.2, 0] }),
      ...[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x) => P.box(0.04, 0.02, 6, '#86624F', { at: [x, 2.36, 0] })),
      ...[-4, 0, 4].flatMap((x) => [-2.7, 2.7].map((z) => P.cyl(0.18, 0.2, 2.2, DARK, { at: [x, 1.1, z] }))),
      ...[-4, 0, 4].map((x) => P.box(0.1, 0.1, 5.6, DARK, { at: [x, 1.2, 0], rot: [0.75, 0, 0] })),
      ...[-4.2, 4.2].flatMap((x) => [-2.7, 2.7].map((z) => P.cyl(0.12, 0.12, 2.6, DARK, { at: [x, 3.6, z] }))),
      // The peaked roof: two dark-wood slopes, the gable ends, the ridge.
      ...[-1, 1].map((side) => P.box(10.4, 0.14, 4.3, '#7E5E4C', { at: [0, 5.85, side * 1.85], rot: [side * -0.55, 0, 0] })),
      ...[-1, 1].map((sx) => P.prism([[-3.5, 0], [3.5, 0], [0, 2.1]], 0.1, '#8E6C58', { at: [sx * 4.6, 4.8, 0], rot: [0, Math.PI / 2, 0] })),
      P.box(10.6, 0.16, 0.2, DARK, { at: [0, 6.95, 0] }),
      // The railing of crossed branches on three sides.
      P.box(9, 0.12, 0.12, DARK, { at: [0, 3.2, -2.9] }),
      ...[-1, 1].map((sx) => P.box(0.12, 0.12, 5.8, DARK, { at: [sx * 4.45, 3.2, 0] })),
      ...[-3.4, -2.2, -1, 0.2, 1.4, 2.6, 3.8].flatMap((x) => [P.box(0.07, 1.3, 0.07, DARK, { at: [x - 0.3, 2.85, -2.9], rot: [0, 0, 0.6] }), P.box(0.07, 1.3, 0.07, DARK, { at: [x - 0.3, 2.85, -2.9], rot: [0, 0, -0.6] })]),
      ...[-1, 1].flatMap((sx) => [-1.8, -0.4, 1].flatMap((z) => [P.box(0.07, 1.3, 0.07, DARK, { at: [sx * 4.45, 2.85, z], rot: [0.6, 0, 0] }), P.box(0.07, 1.3, 0.07, DARK, { at: [sx * 4.45, 2.85, z], rot: [-0.6, 0, 0] })])),
      // Stools at the rail and a long bench.
      ...[-3, -1.5, 0, 1.5, 3].flatMap((x) => [P.cyl(0.25, 0.22, 0.12, PAL.peach, { at: [x, 3.3, -2.2] }, 10), P.cyl(0.06, 0.08, 0.85, DARK, { at: [x, 2.8, -2.2] }, 6)]),
      P.box(4, 0.12, 0.5, WOOD, { at: [0, 2.85, 1.6] }),
      ...[-1.8, 1.8].map((x) => P.box(0.12, 0.5, 0.4, DARK, { at: [x, 2.6, 1.6] })),
      // The steps up from the road side, and the kitchen hut behind with its window.
      ...[0, 1, 2, 3, 4].map((i) => P.box(1.6, 0.14, 0.45, WOOD, { at: [-3.4, 0.25 + i * 0.44, 3.3 + (4 - i) * 0.42] })),
      P.box(3, 2.2, 2.2, '#B68E74', { at: [2.4, 3.45, 1.6] }),
      P.box(1.2, 0.8, 0.08, '#FFE9B8', { at: [2.4, 3.7, 2.72] }),
      P.prism([[-1.8, 0], [1.8, 0], [0, 1]], 2.6, '#7E5E4C', { at: [2.4, 4.55, 1.6] }),
      // Potted flowers on the deck's corners.
      ...[[-4, 2.4], [4, 2.4]].flatMap(([x, z]) => [P.cyl(0.25, 0.2, 0.4, '#E3906F', { at: [x, 2.55, z] }, 10), P.sphere(0.4, PAL.pink, { at: [x, 3.0, z] }, 10)]),
    )
    // String lights under the roof's edges (no outline: little glowing beads).
    const beads: BufferGeometry[] = []
    for (const z of [-2.75, 2.75]) for (let i = 0; i <= 12; i++) {
      const x = -4.2 + (8.4 * i) / 12
      beads.push(P.sphere(0.09, i % 3 ? '#FFE9A8' : '#FFC2D9', { at: [x, 4.75 - Math.sin((i / 12) * Math.PI) * 0.35, z] }, 6))
    }
    g.add(solidMix(parts.splice(0), beads, bag, 2))
  } else if (kind === 'salt') {
    // Bo Kluea at the turn-off: a wet street running down off the road into the village, a sign with a heap of salt on it.
    const TIN = '#B8BFD0'
    parts.push(
      P.box(3.2, 0.1, 13, '#7D7893', { at: [-4.6, 0.02, 1.5], rot: [-0.04, 0, 0] }),
      ...[[-4.2, 4.5, 0.6], [-5.1, -0.5, 0.45], [-4.4, -3.2, 0.5]].map(([x, z, r]) => P.cyl(r, r, 0.04, '#B3CDEE', { at: [x, 0.09, z], scale: [1, 1, 1.6] }, 14)),
      P.cyl(0.06, 0.06, 2.4, '#D9DCE8', { at: [-2.6, 1.2, 7.4] }),
      P.rbox(1.0, 0.8, 0.08, 0.06, PAL.sky, { at: [-2.6, 2.4, 7.45] }),
      P.cone(0.28, 0.4, '#FFFFFF', { at: [-2.6, 2.4, 7.52] }, 10),
      // The salt hut: open sides on wooden posts, a tin roof, the big square pan on its mud-brick fire box.
      P.box(6.4, 0.2, 4.6, '#C9B9A8', { at: [1.6, 0.1, -0.6] }),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.13, 0.15, 3, WOOD, { at: [1.6 + sx * 3, 1.5, -0.6 + sz * 2.1] }))),
      ...[-1, 1].map((side) => P.box(7.2, 0.08, 2.9, TIN, { at: [1.6, 3.5, -0.6 + side * 1.25], rot: [side * -0.45, 0, 0] })),
      ...[-1, 1].flatMap((side) => [-2, -1, 0, 1, 2, 3, 4, 5].map((x) => P.box(0.05, 0.05, 2.9, '#9EA6BA', { at: [x, 3.55, -0.6 + side * 1.25], rot: [side * -0.45, 0, 0] }))),
      P.rbox(3.2, 0.9, 2.2, 0.15, '#B07A5E', { at: [0.8, 0.55, -0.8] }),
      P.box(3.0, 0.2, 2.0, '#4A4458', { at: [0.8, 1.05, -0.8] }),
      P.box(2.8, 0.06, 1.8, '#F4F1FF', { at: [0.8, 1.14, -0.8] }),
      // The fire's mouth, glowing, a pile of logs beside it.
      P.rbox(0.8, 0.45, 0.1, 0.08, '#FF8A3C', { at: [0.8, 0.4, 0.31] }),
      P.cone(0.25, 0.4, PAL.gold, { at: [0.8, 0.45, 0.36] }, 8),
      ...[0, 1, 2].map((i) => P.cyl(0.12, 0.12, 1.2, '#8E6C58', { at: [2.6 + (i % 2) * 0.25, 0.25 + Math.floor(i / 2) * 0.22, 0.3 + i * 0.05], rot: [0, 0, Math.PI / 2] }, 8)),
      // Baskets heaped with white salt by the pan, and on a rack.
      ...[[3.4, -1.4], [3.9, -0.4], [-1.0, 0.6]].flatMap(([x, z]) => [P.cyl(0.38, 0.3, 0.45, '#C9A27E', { at: [x, 0.42, z] }, 12), P.cone(0.36, 0.42, '#FFFFFF', { at: [x, 0.85, z] }, 12)]),
      // The well: a round wall with a bamboo pole over it.
      P.cyl(0.8, 0.85, 0.8, '#D9D4E2', { at: [-2.6, 0.5, -3.4] }, 16),
      P.cyl(0.62, 0.62, 0.05, '#5E6E9A', { at: [-2.6, 0.88, -3.4] }, 16),
      ...[-1, 1].map((sx) => P.cyl(0.07, 0.07, 2, '#C9B46E', { at: [-2.6 + sx * 0.95, 1.2, -3.4] }, 8)),
      P.cyl(0.06, 0.06, 2.4, '#C9B46E', { at: [-2.6, 2.15, -3.4], rot: [0, 0, Math.PI / 2] }, 8),
      P.cyl(0.25, 0.2, 0.35, '#8E6C58', { at: [-2.6, 1.6, -3.4] }, 10),
      // The wooden house across the street with its mural: a Tai Lue couple in their colorful clothes.
      P.box(5, 3.4, 3.2, '#9C7864', { at: [-9.4, 1.8, 0] }),
      P.prism([[-2.9, 0], [2.9, 0], [0, 1.6]], 3.6, '#7E5E4C', { at: [-9.4, 3.5, 0], rot: [0, Math.PI / 2, 0] }),
      P.box(0.06, 2.4, 2.6, '#FFF3E2', { at: [-6.88, 1.8, 0] }),
      ...[-0.6, 0.6].flatMap((z, i) => [
        P.capsule(0.28, 0.9, i ? '#E8404E' : '#3E3849', { at: [-6.82, 1.45, z] }),
        P.box(0.04, 0.5, 0.62, i ? '#3E3849' : '#4FA3D9', { at: [-6.8, 1.0, z] }),
        P.sphere(0.24, '#F2D3C0', { at: [-6.82, 2.32, z] }, 10),
        P.sphere(0.2, i ? '#3E3849' : '#E8404E', { at: [-6.8, 2.52, z], scale: [1, 0.6, 1] }, 10),
      ]),
      ...[-1.1, 1.1].map((z) => P.sphere(0.16, PAL.hotpink, { at: [-6.8, 2.75, z] }, 8)),
    )
    g.userData.steam = [0.8, 1.3, -0.8]
  } else {
    // The viewpoint: a little open pavilion with a pink roof, a fence along the edge, a bench, the coin telescope, pots
    // of pink bougainvillea.
    parts.push(
      P.box(9, 0.25, 5.4, '#E5DDE8', { at: [0, 0.12, 0] }),
      P.box(4.4, 0.3, 4.4, PAL.cream, { at: [0, 0.4, 0] }),
      ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.14, 0.14, 2.6, WOOD, { at: [x * 1.9, 1.85, z * 1.9] }))),
      P.box(4.2, 0.18, 4.2, WOOD, { at: [0, 3.2, 0] }),
      P.cone(3.6, 2, PAL.pink, { at: [0, 4.3, 0] }, 4),
      P.sphere(0.2, PAL.gold, { at: [0, 5.35, 0] }),
      P.box(3.2, 0.12, 0.6, WOOD, { at: [0, 1.0, -1.3] }),
      ...[-1.3, 1.3].map((x) => P.box(0.12, 0.5, 0.5, DARK, { at: [x, 0.75, -1.3] })),
      // The fence along the edge of the drop.
      ...[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x) => P.box(0.1, 1, 0.1, '#F4EFF8', { at: [x, 0.75, -2.6] })),
      ...[0.95, 0.55].map((y) => P.box(8.6, 0.07, 0.07, '#F4EFF8', { at: [0, y, -2.6] })),
      // The telescope on its post.
      P.cyl(0.08, 0.1, 1.1, '#D9DCE8', { at: [3.2, 0.8, 1.6] }),
      P.cyl(0.14, 0.18, 0.7, '#D9DCE8', { at: [3.2, 1.45, 1.6], rot: [Math.PI / 2 - 0.3, 0, 0] }),
      P.cyl(0.1, 0.1, 0.06, PAL.ink, { at: [3.2, 1.55, 1.95], rot: [Math.PI / 2 - 0.3, 0, 0] }),
      ...[[-3.6, 1.8], [-3.6, -1.6], [3.8, -1.6]].flatMap(([x, z]) => [P.cyl(0.3, 0.24, 0.5, '#E3906F', { at: [x, 0.5, z] }, 10), ...[0, 1, 2].map((k) => P.sphere(0.32, k === 1 ? PAL.hotpink : '#FF8FC8', { at: [x + (k - 1) * 0.25, 1.0 + (k === 1 ? 0.15 : 0), z], scale: [1, 0.85, 1] }, 10))]),
    )
  }
  if (parts.length) g.add(solid(merge(parts), bag, 2))
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

/** The three-step waterfall pouring down the hillside next to the road into a pool, with boulders and ferns round it
 *  (its spray comes from the drive's particles). */
export function buildFalls(height: number, bag: Bag) {
  const g = new Group()
  const h = height
  const step = h / 3
  const rock = '#9C93AE'
  const parts: BufferGeometry[] = [
    // The cliff in three steps, each a bit further back.
    ...[0, 1, 2].map((i) => P.rbox(7.4 - i * 0.8, step + 0.6, 2.2, 0.7, i % 2 ? '#8F86A3' : rock, { at: [0, step * i + (step + 0.6) / 2, -1.4 - i * 0.9] })),
    // The water falling down each step (a pale sheet with a white rope down its middle), white foam at each foot.
    ...[0, 1, 2].flatMap((i) => [
      P.box(2.4 - i * 0.3, step, 0.24, '#EAF6FF', { at: [0, step * i + step / 2, -0.25 - i * 0.9] }),
      P.box(0.9, step, 0.26, '#FFFFFF', { at: [0.3, step * i + step / 2, -0.24 - i * 0.9] }),
      P.sphere(1.1 - i * 0.15, '#FFFFFF', { at: [0, step * i + 0.1, 0.05 - i * 0.9], scale: [1.4, 0.4, 0.8] }, 10),
    ]),
    // The pool, the boulders round it and a few ferns.
    P.cyl(2.8, 2.8, 0.3, '#A8DCFF', { at: [0, 0.1, 1.6] }, 20),
    P.cyl(2.2, 2.2, 0.32, '#C9EBFF', { at: [0.2, 0.11, 1.4] }, 20),
    ...[[-3, 1.2, 0.9], [2.9, 0.8, 1.1], [-2.2, 3.4, 0.7], [2.4, 3.2, 0.6], [-3.6, -0.6, 1.2], [3.7, -0.5, 1]].map(([x, z, r]) => P.sphere(r, rock, { at: [x, r * 0.4, z], scale: [1.2, 0.8, 1] }, 10)),
    ...[[-3.8, 2.2], [3.8, 2.4], [-4.2, 0.4], [4.1, 0.6]].flatMap(([x, z]) => [-0.5, 0, 0.5].map((a) => P.cone(0.18, 1.3, '#5FAE7E', { at: [x + a * 0.5, 0.6, z], rot: [0, 0, a] }, 6))),
  ]
  g.add(solid(merge(parts), bag, 2))
  return g
}
