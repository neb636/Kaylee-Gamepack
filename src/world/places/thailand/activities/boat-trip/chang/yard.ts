// The feeding yard at Baan Chang, modeled on Dad's photos (plan: "What's really there"): grey gravel with tan dirt
// patches and pebbles, the galvanized pipe rail on posts, big mossy boulders in a row in front of it, cut grass and palm
// fronds on the ground, the little blue bench, wooden sala huts on stilts at the back, and a grid of tall oil palms all
// round (nature.ts). Each layer is merged into one mesh (two draw calls with its outline). And the cafe at the top of
// the boardwalk (buildCafe).
import { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { BENCH, BOULDERS, CAFE, COUNTER, LAMYAI_BACK, MILK, RAIL, TROUGH } from './layout'
import { boulder, EARTH, FROND, FROND_DARK, grassPatches, groundScatter, meshPanel, oilPalm } from './nature'

const GRAVEL = '#CBC8D2'
const GRAVEL_DARK = '#B7B3C2'
/** The boardwalk's and the cafe's dark steel. */
export const STEEL = '#4A4656'
/** The yard's galvanized pipe rail. */
const PIPE = '#9C99AC'
export const WOOD = '#C99A6E'
const WOOD_DARK = '#8C6A4C'
export const THATCH = '#E8C987'
const ROOF = '#B98D5A'
const ROOF_DARK = '#9E764A'

/** A sala on stilts, like the huts in the palms behind the yard: four dark stilts, a plank deck with a low rail round
 *  three sides and a ladder up the open one, corner posts, and a steep roof with deep eaves and a ridge cap. */
function sala(x: number, z: number, rot: number) {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const at = (dx: number, y: number, dz: number): [number, number, number] => [x + dx * c + dz * s, y, z - dx * s + dz * c]
  const r: [number, number, number] = [0, rot, 0]
  return [
    ...[-1, 1].flatMap((i) => [-1, 1].map((j) => P.box(0.18, 1.2, 0.18, WOOD_DARK, { at: at(i * 1.3, 0.6, j * 1.1), rot: r }))),
    P.box(3, 0.16, 2.6, '#B7865C', { at: at(0, 1.2, 0), rot: r }),
    ...[-1, 1].flatMap((i) => [-1, 1].map((j) => P.box(0.12, 1.9, 0.12, WOOD, { at: at(i * 1.36, 2.2, j * 1.16), rot: r }))),
    // The low rail: along the back and the two sides (the front is open, with the ladder).
    P.box(2.8, 0.42, 0.06, WOOD, { at: at(0, 1.5, -1.25), rot: r }),
    ...[-1, 1].map((i) => P.box(0.06, 0.42, 2.4, WOOD, { at: at(i * 1.45, 1.5, 0), rot: r })),
    ...[0, 1, 2, 3].map((i) => P.box(0.7, 0.05, 0.1, WOOD_DARK, { at: at(0, 0.2 + i * 0.28, 1.45 + i * 0.02), rot: r })),
    ...[-1, 1].map((i) => P.box(0.06, 1.3, 0.08, WOOD_DARK, { at: at(i * 0.36, 0.62, 1.48), rot: [0.18, rot, 0] })),
    // The roof: steep, its eaves out past the deck, and a darker cap along the ridge.
    P.prism([[-2.3, 0], [2.3, 0], [0, 1.5]], 3.9, ROOF, { at: at(0, 3.1, 0), rot: [0, rot + Math.PI / 2, 0] }),
    P.box(0.2, 0.14, 4.0, ROOF_DARK, { at: at(0, 4.6, 0), rot: [0, rot + Math.PI / 2, 0] }),
  ]
}

/** The yard, and its bench (a tap bounces it). Its boulders, palms, salas and bench are pokes (`userData.pick`). */
export function buildYard(bag: Bag) {
  const root = new Group()
  // ---- The ground: gravel all round, with darker patches; sandy where the family stand ----
  // (Each layer on its own height, from the grass (tops 0.003, 0.006) up through the gravel (0.01), the sand (0.014) and
  // the dirt patches (0.022, 0.026): two at the same height flicker as the camera moves.)
  // Brown earth and grass under the palms all round; the gravel only where the elephants are fed.
  const ground = [P.box(80, 0.1, 80, EARTH, { at: [0, -0.05, -20] }), P.box(22, 0.02, 15, GRAVEL, { at: [0, 0, -6.5] }), ...grassPatches(-30, 30, -40, 10, 2, 46, [-11.5, 11.5, -14.5, 1.5])]
  for (let i = 0; i < 24; i++) {
    const x = Math.sin(i * 12.9898) * 9
    const z = -1 - ((i * 7.31) % 14)
    ground.push(P.cyl(0.5 + (i % 4) * 0.25, 0.5 + (i % 4) * 0.25, 0.01, GRAVEL_DARK, { at: [x, 0.013, z], scale: [1.4, 1, 0.8] }, 10))
  }
  // Tan dirt where the elephants have scuffed the gravel, and pebbles; the family's side is sandier.
  ground.push(...groundScatter(-9, 9, -12, -0.4, 3, 14, 30), ...groundScatter(-7, 8, 0.9, 6, 7, 4, 26))
  ground.push(P.box(16, 0.028, 4.5, '#E6DCC6', { at: [0, 0, 2.6] }))
  root.add(solid(merge(ground), bag, 0))
  // ---- The rail: galvanized pipes on posts, a thick one on top, a thinner one lower down ----
  const rail = []
  for (let x = RAIL.x0; x <= RAIL.x1 + 0.01; x += RAIL.posts) rail.push(P.cyl(0.065, 0.075, RAIL.top + 0.05, PIPE, { at: [x, (RAIL.top + 0.05) / 2, RAIL.z] }, 8), P.sphere(0.08, PIPE, { at: [x, RAIL.top + 0.05, RAIL.z] }, 8))
  rail.push(P.cyl(RAIL.r * 1.3, RAIL.r * 1.3, RAIL.x1 - RAIL.x0, PIPE, { at: [(RAIL.x0 + RAIL.x1) / 2, RAIL.top, RAIL.z], rot: [0, 0, Math.PI / 2] }, 10))
  rail.push(P.cyl(RAIL.r * 0.8, RAIL.r * 0.8, RAIL.x1 - RAIL.x0, PIPE, { at: [(RAIL.x0 + RAIL.x1) / 2, RAIL.mid, RAIL.z], rot: [0, 0, Math.PI / 2] }, 8))
  // A flat cap on one post, where her chocolate milk stands.
  rail.push(P.cyl(0.13, 0.11, 0.05, PIPE, { at: [MILK.x, MILK.y - 0.04, MILK.z] }, 12))
  root.add(solid(merge(rail), bag, 1.5))
  // ---- The water trough behind the rail (the splash) ----
  const tw = TROUGH.x1 - TROUGH.x0
  const tx = (TROUGH.x0 + TROUGH.x1) / 2
  root.add(
    solid(
      merge([
        P.box(tw, TROUGH.h, 0.08, '#A9A3B8', { at: [tx, TROUGH.h / 2, TROUGH.z + TROUGH.w / 2] }),
        P.box(tw, TROUGH.h, 0.08, '#A9A3B8', { at: [tx, TROUGH.h / 2, TROUGH.z - TROUGH.w / 2] }),
        ...[TROUGH.x0, TROUGH.x1].map((x) => P.box(0.08, TROUGH.h, TROUGH.w, '#A9A3B8', { at: [x, TROUGH.h / 2, TROUGH.z] })),
        P.box(tw, 0.04, TROUGH.w - 0.06, '#7FC8F0', { at: [tx, TROUGH.h - 0.07, TROUGH.z] }),
      ]),
      bag,
      1.5,
    ),
  )
  // ---- The big mossy boulders, and a few smaller rocks round them and further back ----
  const rocks = solid(
    merge([
      ...BOULDERS.map(([x, z, w, h, d], i) => boulder(x, z, w, h, d, i + 1)),
      boulder(-4.4, 0.75, 0.5, 0.26, 0.4, 11, 1),
      boulder(4.05, 0.85, 0.45, 0.22, 0.36, 12, 1),
      boulder(-6.2, -5.5, 1.4, 0.7, 1.0, 13, 1),
      boulder(7.5, -4.2, 1.2, 0.55, 0.9, 14, 1),
    ]),
    bag,
    2,
  )
  rocks.userData.pick = 'rocks'
  root.add(rocks)
  // ---- Cut grass and palm fronds on the elephants' side, the blue bench on the family's ----
  const litter = []
  for (let i = 0; i < 9; i++) {
    const x = -4 + i * 1.05 + Math.sin(i * 3.1) * 0.3
    const z = -0.9 - (i % 3) * 0.55
    litter.push(P.box(0.9, 0.06, 0.16, i % 2 ? '#9ED07E' : '#B8DA82', { at: [x, 0.04, z], rot: [0, i * 0.7, 0] }), P.box(0.7, 0.05, 0.12, '#8CC56E', { at: [x + 0.1, 0.07, z + 0.05], rot: [0, -i * 0.5, 0] }))
  }
  root.add(solid(merge(litter), bag, 1.5))
  // (The bench on its own, so a tap can bounce it.)
  const bench = solid(
    merge([P.rbox(1.5, 0.08, 0.42, 0.03, '#6FA8E8', { at: [0, BENCH.y - 0.04, 0] }), ...[-0.6, 0.6].map((dx) => P.box(0.08, 0.44, 0.36, '#4F86C8', { at: [dx, 0.22, 0] }))]),
    bag,
    1.5,
  )
  bench.position.set(BENCH.x, 0, BENCH.z)
  bench.userData.pick = 'bench'
  root.add(bench)
  // ---- Wooden salas on stilts at the back, and the oil palms in their grid ----
  const salas = solid(merge([...sala(-6.5, -9, 0.3), ...sala(5.5, -11, -0.25)]), bag, 2)
  salas.userData.pick = 'sala'
  root.add(salas)
  const palms = []
  for (let i = -3; i <= 3; i++)
    for (let j = 0; j < 3; j++) {
      const x = i * 4.2 + (j % 2) * 2.1
      const z = -6.5 - j * 4.5
      if (Math.abs(x + 6.5) < 2 && j === 0) continue
      // (None where Lamyai waits at the back and on her way over: she'd stand inside its trunk.)
      if (Math.hypot(x - LAMYAI_BACK.x, z - LAMYAI_BACK.z) < 2.5) continue
      palms.push(...oilPalm(x, z, 5.5 + ((i + j) % 3) * 0.8, i * 0.7 + j, 0, j > 0))
    }
  // Two closer palms at the sides frame the yard.
  palms.push(...oilPalm(-5.6, 1.2, 6.5, 0.4), ...oilPalm(7.4, 0.4, 6.8, 1.1))
  const grove = solid(merge(palms), bag, 2)
  grove.userData.pick = 'palms'
  root.add(grove)
  return { root, bench }
}

/** The cafe at the top of the boardwalk (`drinks`): an open-sided sala on a plank deck, with a thatched roof, a rail
 *  along its back, and the oil palms below it. The counter is woven bamboo with a pale wooden top; behind Kaylee a low
 *  shelf of jars. The ground falls away behind, so the palms' crowns are about level with the deck. */
export function buildCafe(bag: Bag) {
  const root = new Group()
  const z = CAFE.z
  root.add(solid(merge([P.box(70, 0.1, 40, EARTH, { at: [0, -0.9, z - 18] }), P.box(70, 0.1, 6, '#E6DCC6', { at: [0, -0.85, z + 3] }), ...grassPatches(-30, 30, z - 36, z - 3, 4, 26).map((g) => g.translate(0, -0.85, 0))]), bag, 0))
  const sala = [
    // The deck, its planks and its edge.
    P.box(7.2, 0.14, 4.2, '#C99A6E', { at: [0, -0.07, z - 0.4] }),
    ...Array.from({ length: 9 }, (_, i) => P.box(7.2, 0.006, 0.03, '#B7865C', { at: [0, 0.002, z - 2.3 + i * 0.47] })),
    P.box(7.2, 0.8, 0.12, '#B7865C', { at: [0, -0.5, z + 1.7] }),
    // Four posts and the thatched roof.
    ...[-3.2, 3.2].flatMap((x) => [z - 2.3, z + 1.5].map((pz) => P.cyl(0.11, 0.12, 3.6, WOOD, { at: [x, 1.8, pz] }, 8))),
    P.prism([[-2.9, 0], [2.9, 0], [0, 1.2]], 7.6, THATCH, { at: [0, 3.55, z - 0.4], rot: [0, Math.PI / 2, 0] }),
    // The rail along the back (dark steel, like the boardwalk's) with a mesh panel.
    ...[-3, -1.5, 0, 1.5, 3].map((x) => P.cyl(0.04, 0.04, 0.9, STEEL, { at: [x, 0.45, z - 2.35] }, 6)),
    P.cyl(0.035, 0.035, 6.4, STEEL, { at: [0, 0.9, z - 2.35], rot: [0, 0, Math.PI / 2] }, 8),
    // The counter: woven bamboo poles under a pale wooden top.
    P.box(COUNTER.x1 - COUNTER.x0, COUNTER.top - 0.04, COUNTER.d - 0.06, '#D9B86A', { at: [(COUNTER.x0 + COUNTER.x1) / 2, (COUNTER.top - 0.04) / 2, COUNTER.z - 0.02] }),
    ...Array.from({ length: 15 }, (_, i) => P.cyl(0.032, 0.032, COUNTER.top - 0.05, i % 2 ? '#E6C77E' : '#CDA95C', { at: [COUNTER.x0 + 0.1 + i * 0.207, (COUNTER.top - 0.05) / 2, COUNTER.z + COUNTER.d / 2 - 0.04] }, 8)),
    P.rbox(COUNTER.x1 - COUNTER.x0 + 0.1, 0.05, COUNTER.d + 0.06, 0.02, '#F3E2C2', { at: [(COUNTER.x0 + COUNTER.x1) / 2, COUNTER.top - 0.025, COUNTER.z] }),
    // The low shelf behind Kaylee, with jars of sweets and a potted fern.
    P.box(2.4, 0.7, 0.4, '#B7865C', { at: [-0.6, 0.35, z - 1.3] }),
    ...(['#FFB3D1', '#FBEA9A', '#8FE3C8', '#C9B6FF'] as const).map((c, i) => P.cyl(0.08, 0.08, 0.2, c, { at: [-1.5 + i * 0.32, 0.8, z - 1.3] }, 12)),
    P.cyl(0.13, 0.1, 0.2, '#E58E6C', { at: [0.35, 0.8, z - 1.3] }, 12),
    ...[0, 1, 2, 3, 4].map((i) => P.sphere(0.16, i % 2 ? FROND : FROND_DARK, { at: [0.35 + Math.sin(i * 1.3) * 0.12, 1.02 + (i % 2) * 0.06, z - 1.3 + Math.cos(i * 1.3) * 0.08], scale: [1.4, 0.5, 0.8], rot: [0, i, 0.3] }, 8)),
  ]
  root.add(solid(merge(sala), bag, 2))
  root.add(meshPanel(bag, 6.2, 0.75, [0, 0.47, z - 2.35]))
  // The oil palms below, beyond the rail.
  const palms = []
  for (let i = -3; i <= 3; i++)
    for (let j = 0; j < 2; j++) palms.push(...oilPalm(i * 3.6 + (j % 2) * 1.8, z - 6.5 - j * 4.5, 4.6 + ((i + j) % 3) * 0.7, i * 0.9 + j, -0.9, j > 0))
  root.add(solid(merge(palms), bag, 2))
  return root
}
