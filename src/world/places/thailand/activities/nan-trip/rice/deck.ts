// Stop Time Cafe's deck up on the hill behind the farm (#168's): a wooden deck on stilts, its railing of crossed
// branches, the peaked roof, two tall stools, a high table with the pink milk, Daddy's coffee and the kratip of sticky
// rice she threshed, and the wind chime. Built deck-local (its railing toward -z), placed and turned on the hill by DECK.
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
  kratip: Kratip
}

export interface Kratip {
  root: Group
  /** The white sticky rice inside (scaled down as she eats it), and the lid. */
  rice: Group
  lid: Group
}

const BAMBOO = '#E3C27E'
const WEAVE = '#C49A55'
const STICKY = '#FFFCF2'

/** A kratip: the little woven bamboo basket sticky rice comes in, on its foot, with its domed lid (lifted off with
 *  `open`, set down beside it). About 0.26 m tall at `s` = 1. */
export function buildKratip(bag: Bag, s = 1, open = false): Kratip {
  const root = new Group()
  const r = 0.09 * s
  const h = 0.13 * s
  root.add(
    solid(
      merge([
        // The foot (a short flared ring), the body, its woven bands and the rim.
        P.cyl(r * 0.75, r * 0.9, 0.04 * s, WEAVE, { at: [0, 0.02 * s, 0] }, 14),
        P.cyl(r, r * 0.82, h, BAMBOO, { at: [0, 0.04 * s + h / 2, 0] }, 16),
        ...[0.3, 0.55, 0.8].map((k) => P.torus(r * (0.84 + 0.16 * k) + 0.002, 0.006 * s, WEAVE, { at: [0, 0.04 * s + h * k, 0], rot: [Math.PI / 2, 0, 0] })),
        P.torus(r, 0.01 * s, WEAVE, { at: [0, 0.04 * s + h, 0], rot: [Math.PI / 2, 0, 0] }),
        // The carrying string.
        P.torus(0.06 * s, 0.005 * s, '#8C6248', { at: [r * 0.98, 0.04 * s + h * 0.7, 0], rot: [0, Math.PI / 2, 0] }, Math.PI),
      ]),
      bag,
      2,
    ),
  )
  const rice = solid(merge([P.sphere(r * 0.9, STICKY, { scale: [1, 0.5, 1] }, 14), ...[0, 1, 2, 3, 4].map((k) => P.sphere(0.012 * s, '#FFFFFF', { at: [Math.cos(k * 1.3) * r * 0.5, r * 0.36, Math.sin(k * 1.3) * r * 0.5] }, 6))]), bag, 1)
  rice.position.y = 0.04 * s + h
  root.add(rice)
  const lid = solid(merge([P.sphere(r * 1.05, BAMBOO, { scale: [1, 0.55, 1] }, 16), P.torus(r * 0.98, 0.009 * s, WEAVE, { rot: [Math.PI / 2, 0, 0] }), P.sphere(0.018 * s, WEAVE, { at: [0, r * 0.6, 0] }, 8)]), bag, 2)
  if (open) {
    lid.position.set(r * 2.3, 0.02 * s, 0)
    lid.rotation.z = 0.35
  } else lid.position.y = 0.04 * s + h
  root.add(lid)
  return { root, rice, lid }
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
    // The roof: four posts and a peaked roof of warm light wood, its rafters showing underneath.
    ...[-1.8, 1.8].flatMap((x) => [-1.5, 1.5].map((z) => P.cyl(0.06, 0.06, 2.4, WOOD_DARK, { at: [x, 1.2, z] }, 8))),
    ...[1, -1].map((s) => P.box(4.2, 0.07, 2.0, '#B98A62', { at: [0, 2.72, s * 0.85], rot: [s * 0.42, 0, 0] })),
    ...[1, -1].flatMap((s) => [-1.6, -0.8, 0, 0.8, 1.6].map((x) => P.box(0.07, 0.07, 1.95, WOOD_DARK, { at: [x, 2.66, s * 0.84], rot: [s * 0.42, 0, 0] }))),
    P.box(4.3, 0.12, 0.12, WOOD_DARK, { at: [0, 3.1, 0] }),
    // The roof's front edge: a wooden fascia with a row of little pastel lights hanging along it.
    P.box(4.3, 0.1, 0.05, WOOD_DARK, { at: [0, 2.32, -1.78] }),
    ...Array.from({ length: 11 }, (_, i) => {
      const x = -1.9 + i * 0.38
      return P.sphere(0.045, ['#FFE27A', '#FFB3CF', '#BFE6FA', '#C9F0DC'][i % 4], { at: [x, 2.2 - Math.sin((i / 10) * Math.PI) * 0.1, -1.8] }, 8)
    }),
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
  // The kratip she threshed, open, in front of the milk.
  const kratip = buildKratip(bag, 0.9, true)
  kratip.root.position.set(HIGH_TABLE[0] - 0.02, HIGH_TABLE[1], HIGH_TABLE[2] + 0.17)
  kratip.root.rotation.y = -0.5
  kratip.root.userData.pick = 'kratip'
  root.add(kratip.root)
  return { root, chime, glass: { root: glassRoot, milk }, cup, kratip }
}
