// Canada's red and its maple leaf in the toon look, shared by the map's stations and critters.
// (The Maple Leaf Train these came from was retired when the map got direct activity pins.)
import { P } from '../../../engine3d/geo'

export const RED = '#E8505B'

/** A maple leaf's outline (about 1 m tall, stem down): the flag's leaf, simplified. */
export const LEAF: [number, number][] = [
  [0, 1], [0.13, 0.74], [0.3, 0.82], [0.25, 0.44], [0.56, 0.62], [0.5, 0.44], [0.78, 0.4], [0.56, 0.2], [0.63, 0.1], [0.3, 0.07],
  [0.33, -0.13], [0.05, -0.05], [0.05, -0.36], [-0.05, -0.36], [-0.05, -0.05], [-0.33, -0.13], [-0.3, 0.07], [-0.63, 0.1],
  [-0.56, 0.2], [-0.78, 0.4], [-0.5, 0.44], [-0.56, 0.62], [-0.25, 0.44], [-0.3, 0.82], [-0.13, 0.74],
]
/** A maple leaf part of this size, in the xy plane (facing +z). */
export const leaf = (size: number, color: string, at: [number, number, number], rot: [number, number, number] = [0, 0, 0], depth = 0.012) =>
  P.prism(LEAF.map(([x, y]) => [x * size * 0.5, y * size * 0.5]), depth, color, { at, rot })
