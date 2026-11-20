// The big game's little props, shared by the game (rink.ts) and its two films (story/films/game.ts): the kits' tiny
// pink flags, maple taffy on a stick (golden syrup rolled up on a wooden stick, as on the snow at a sugar shack), the
// syrup in the Maple Cup, the golden stream pouring out of it and the ribbons of syrup on the snow. Toy shapes from
// engine3d/geo.ts parts, one mesh and one outline each.
import { Group, Mesh, MeshBasicMaterial } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { CANADA_COLORS } from '../../characters/looks'

const SYRUP = '#E8A23A'
const SYRUP_LIGHT = '#FFC45C'
const STICK = '#E9D3A6'

/** A tiny flag on a stick for a kit `H` meters tall: add it to `rig.armR` (it stands up out of the paw). */
export function makeFlag(H: number, bag: Bag) {
  return solid(
    merge([
      P.cyl(0.018 * H, 0.018 * H, 0.75 * H, STICK, { at: [0.05 * H, 0.2 * H, 0.06 * H] }, 6),
      P.prism([[0, 0], [0.32, 0.1], [0, 0.22]].map(([x, y]) => [x * H, y * H] as [number, number]), 0.02 * H, CANADA_COLORS.scarf, { at: [0.06 * H, 0.33 * H, 0.06 * H] }),
      P.sphere(0.03 * H, '#FFC83D', { at: [0.05 * H, 0.58 * H, 0.06 * H] }, 6),
    ]),
    bag,
    1.4,
  )
}

/** Maple taffy on a stick, about `s` meters long, its stick pointing down (y = 0 at the bottom of the stick). */
export function makeTaffy(bag: Bag, s = 0.3) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.cyl(0.03 * s, 0.03 * s, 0.7 * s, STICK, { at: [0, 0.35 * s, 0] }, 6),
        // The taffy: golden syrup rolled round the top of the stick in a fat, glossy twist.
        P.sphere(0.2 * s, SYRUP, { at: [0, 0.8 * s, 0], scale: [1, 1.25, 1] }, 12),
        P.torus(0.15 * s, 0.07 * s, SYRUP_LIGHT, { at: [0, 0.74 * s, 0], rot: [Math.PI / 2, 0, 0] }),
        P.sphere(0.07 * s, '#FFE2A0', { at: [0.07 * s, 0.9 * s, 0.12 * s] }, 6),
      ]),
      bag,
      1.6,
    ),
  )
  return g
}

/** The syrup in the Maple Cup (makeCup with `h` = 0.72, no stand): a golden disc just under its rim. Hidden. */
export function makeCupSyrup(bag: Bag, h = 0.72) {
  const m = solidMix([], [P.cyl(0.27 * h, 0.27 * h, 0.02 * h, SYRUP_LIGHT, { at: [0, 0.76 * h, 0] }, 20)], bag, 0)
  m.visible = false
  return m
}

/** A golden stream of syrup, 1 m long from its top (y = 0) down, scaled to length by `pour.scale.y`. Hidden. */
export function makeStream(bag: Bag) {
  const g = new Group()
  const mat = bag.add(new MeshBasicMaterial({ color: SYRUP_LIGHT }))
  const m = new Mesh(bag.add(P.cyl(0.035, 0.025, 1, '#FFFFFF', { at: [0, -0.5, 0] }, 8)), mat)
  g.add(m)
  g.visible = false
  return g
}

/** Ribbons of syrup poured on the snow (lying flat, in a row along x), `n` of them. Hidden. */
export function makeRibbons(bag: Bag, n = 6) {
  const g = new Group()
  const parts = []
  for (let i = 0; i < n; i++) parts.push(P.rbox(0.12, 0.03, 0.5, 0.02, i % 2 ? SYRUP : SYRUP_LIGHT, { at: [(i - (n - 1) / 2) * 0.22, 0.015, Math.sin(i * 1.7) * 0.06], rot: [0, Math.sin(i * 2.3) * 0.2, 0] }))
  g.add(solid(merge(parts), bag, 1.2))
  g.visible = false
  return g
}
