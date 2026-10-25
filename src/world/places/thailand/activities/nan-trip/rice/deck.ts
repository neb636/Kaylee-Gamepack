// Stop Time Cafe's deck up on the hill behind the farm (#168's, unchanged): a wooden deck on stilts, its railing of
// crossed branches, the peaked roof, two tall stools, a high table with the pink milk and Daddy's coffee, and the wind
// chime. Built deck-local (its railing toward -z), placed and turned on the hill by DECK.
import { Group, Mesh, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { CHIME, DECK, HIGH_TABLE, RAIL_Z, STOOLS } from './layout'

const WOOD = '#B98A64'
const WOOD_DARK = '#8C6248'

export interface Deck {
  root: Group
  chime: Group
  glass: { root: Group; milk: Mesh }
  cup: Group
}

/** Stop Time Cafe's deck, built deck-local (its railing toward -z), placed and turned on the hill by DECK. */
export function buildDeck(bag: Bag): Deck {
  const root = new Group()
  root.position.set(DECK.x, DECK.y, DECK.z)
  root.rotation.y = DECK.yaw
  const parts: BufferGeometry[] = [
    // The wet dark-wood floor and its planks, on stilts.
    P.box(3.8, 0.1, 3.3, '#9E7A5E', { at: [0, -0.05, 0] }),
    ...Array.from({ length: 11 }, (_, i) => P.box(3.8, 0.012, 0.02, '#7E5E48', { at: [0, 0.002, -1.6 + i * 0.32] })),
    ...[-1.75, 0, 1.75].flatMap((x) => [-1.5, 1.5].map((z) => P.cyl(0.07, 0.08, 2.4, WOOD_DARK, { at: [x, -1.25, z] }, 8))),
    // The railing: posts, the top rail and the crossed branches.
    ...Array.from({ length: 6 }, (_, i) => P.cyl(0.04, 0.045, 1.0, WOOD_DARK, { at: [-1.85 + i * 0.74, 0.5, RAIL_Z] }, 8)),
    P.cyl(0.035, 0.035, 3.8, WOOD_DARK, { at: [0, 0.98, RAIL_Z], rot: [0, 0, Math.PI / 2] }, 8),
    ...Array.from({ length: 5 }, (_, i) => [0.62, -0.62].map((a) => P.cyl(0.022, 0.022, 0.98, '#9A6E52', { at: [-1.48 + i * 0.74, 0.5, RAIL_Z + 0.02], rot: [0, 0, a] }, 6))).flat(),
    // The side railing, on the valley side.
    P.cyl(0.035, 0.035, 2.9, WOOD_DARK, { at: [1.85, 0.98, 0.1], rot: [Math.PI / 2, 0, 0] }, 8),
    ...[-0.6, 0.4, 1.4].map((z) => P.cyl(0.04, 0.045, 1.0, WOOD_DARK, { at: [1.85, 0.5, z] }, 8)),
    // The roof: four posts and a peaked roof of dark wood.
    ...[-1.8, 1.8].flatMap((x) => [-1.5, 1.5].map((z) => P.cyl(0.06, 0.06, 2.4, WOOD_DARK, { at: [x, 1.2, z] }, 8))),
    ...[1, -1].map((s) => P.box(4.2, 0.07, 2.0, '#7E5E48', { at: [0, 2.72, s * 0.85], rot: [s * 0.42, 0, 0] })),
    P.box(4.3, 0.12, 0.12, WOOD_DARK, { at: [0, 3.1, 0] }),
    // The high table and the two tall stools.
    P.cyl(0.3, 0.3, 0.05, WOOD, { at: [HIGH_TABLE[0], HIGH_TABLE[1] - 0.025, HIGH_TABLE[2]] }, 18),
    P.cyl(0.04, 0.06, HIGH_TABLE[1] - 0.05, WOOD_DARK, { at: [HIGH_TABLE[0], (HIGH_TABLE[1] - 0.05) / 2, HIGH_TABLE[2]] }, 8),
    ...Object.values(STOOLS).flatMap((s) => [
      P.cyl(0.17, 0.17, 0.05, WOOD, { at: [s[0], s[1] - 0.025, s[2]] }, 16),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.018, 0.022, s[1] - 0.05, WOOD_DARK, { at: [s[0] + a * 0.1, (s[1] - 0.05) / 2, s[2] + b * 0.1], rot: [b * 0.08, 0, -a * 0.08] }, 6)),
      P.torus(0.12, 0.012, WOOD_DARK, { at: [s[0], s[1] * 0.45, s[2]], rot: [Math.PI / 2, 0, 0] }),
    ]),
    // A pot of orchids on the railing post.
    P.cyl(0.09, 0.07, 0.14, '#E59A6E', { at: [-1.85, 1.07, RAIL_Z] }, 10),
    ...[0, 1, 2].map((k) => P.sphere(0.05, k === 1 ? PAL.hotpink : '#E8A6F2', { at: [-1.85 + (k - 1) * 0.06, 1.22 + (k % 2) * 0.05, RAIL_Z + 0.02], scale: [1, 0.7, 0.5] }, 8)),
  ]
  root.add(solid(merge(parts), bag, 2))
  // ---- The wind chime, hanging from the roof's edge ----
  const chime = new Group()
  chime.position.set(...CHIME)
  chime.userData.pick = 'chime'
  chime.add(solid(merge([P.cyl(0.005, 0.005, 0.24, PAL.ink, { at: [0, 0.12, 0] }, 4), P.torus(0.09, 0.012, WOOD_DARK, { rot: [Math.PI / 2, 0, 0] }), ...Array.from({ length: 5 }, (_, k) => P.cyl(0.014, 0.014, 0.16 + (k % 3) * 0.05, ['#BFE6FA', '#FFC2D8', '#FFE27A', '#C9F0DC', '#E2D6FF'][k], { at: [Math.cos((k / 5) * Math.PI * 2) * 0.07, -0.12 - (k % 3) * 0.025, Math.sin((k / 5) * Math.PI * 2) * 0.07] }, 6))]), bag, 1))
  root.add(chime)
  // ---- The pink milk (nom yen) in a tall glass, and Daddy's coffee ----
  const glassRoot = new Group()
  glassRoot.position.set(HIGH_TABLE[0] - 0.12, HIGH_TABLE[1], HIGH_TABLE[2] + 0.02)
  glassRoot.userData.pick = 'glass'
  glassRoot.add(solid(merge([P.cyl(0.055, 0.045, 0.2, '#EEF6FF', { at: [0, 0.1, 0] }, 14), P.cyl(0.006, 0.006, 0.18, PAL.hotpink, { at: [0.02, 0.24, 0], rot: [0, 0, -0.2] }, 6)]), bag, 2))
  const milk = new Mesh(bag.add(P.cyl(0.049, 0.041, 1, '#FF9CC8', { at: [0, 0.5, 0] }, 14)), (glassRoot.children[0].children[0] as Mesh).material)
  milk.position.y = 0.012
  milk.scale.set(1, 0.17, 1)
  glassRoot.add(milk)
  root.add(glassRoot)
  const cup = solid(merge([P.cyl(0.05, 0.04, 0.09, '#FFFFFF', { at: [0, 0.045, 0] }, 12), P.cyl(0.044, 0.044, 0.004, '#7A4E3A', { at: [0, 0.088, 0] }, 12), P.torus(0.025, 0.008, '#FFFFFF', { at: [0.055, 0.05, 0] }, Math.PI * 1.6)]), bag, 2)
  cup.position.set(HIGH_TABLE[0] + 0.16, HIGH_TABLE[1], HIGH_TABLE[2] - 0.04)
  cup.userData.pick = 'cup'
  root.add(cup)
  return { root, chime, glass: { root: glassRoot, milk }, cup }
}
