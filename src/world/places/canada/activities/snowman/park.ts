// Carnival Snowballs' park as data in meters (the build, the balls' bumps and the tap targets all read it): a snowy park
// below Quebec City's old walls, the castle hotel up on the cliff behind it. The camera looks from the park's front (+z)
// toward the castle (-z). The balls roll inside PARK; the parade path runs along its back, under the terrace, with the
// drum at its right end; the toboggan slide comes down the hill on the right.

/** Where the balls can roll (their middles stay `r` inside). */
export const PARK = { x0: -13, x1: 13, z0: -8, z1: 7.5 }

/** The parade path along the back of the park, and the line the dressed snowmen wait in (slot 0 is the first one, at
 *  the front of the parade; later ones queue to its left). They march right along the path to the drum. */
export const PATH_Z = -10.6
export const LINE_X0 = -1.5
export const LINE_GAP = 2.5
export const PARADE_END_X = 9
export const DRUM = { x: 11.6, z: -11.2 }

/** The cliff and the castle hotel on top of it. */
export const CLIFF_Z = -13.2
export const CLIFF_Y = 4
export const CASTLE = { x: 0, z: -27 }

/** Trees in the park (the balls bump them and snow falls on the ball), and the ones round its edges. */
export const TREES_IN: { x: number; z: number; s: number }[] = [
  { x: -8.8, z: 3.4, s: 1 },
  { x: 9.4, z: 2.2, s: 1.1 },
  { x: 10.2, z: -5.6, s: 0.9 },
  { x: 5.6, z: 6, s: 0.85 },
]
export const TREE_R = 0.75

/** The snowy owl's lamp post behind the path (with the others), the ice moose in the corner, the toboggan slide down the hill. */
export const LAMP = { x: -6.4, z: -12.2 }
export const LAMPS = [-14, 2, 14]
export const MOOSE = { x: -11.2, z: -6.4, r: 1.1 }
export const SLIDE = { top: { x: 21, y: 6.4, z: -7 }, foot: { x: 15.6, y: 0, z: 1.8 } }

/** The carnival's two boxes (dress): roll a snowball in and out pops a hat or a sash. */
export const HAT_BOX = { x: -5.6, z: -4.8 }
export const SASH_BOX = { x: 5.6, z: -4.8 }
export const BOX_HALF = 0.7

/** Where things start. */
export const START = { x: 0, z: 3 }
export const MAPLE_START = { x: -1.9, z: 4.2 }

/** Sizes (radius, m): a fresh ball, the bottom a stack link starts with (`size`), and the stacked snowmen links make. */
export const BIG_R = 0.65
export const HUGE_R = 1.5
/** A ball this big is bigger than Maple: she climbs on top. */
export const CLIMB_R = 1.05
export const SNOWMAN_RS = [0.72, 0.52, 0.38] as const

/** Keeps a ball's middle inside the park; returns whether it had to. */
export function keepIn(p: { x: number; z: number }, r: number) {
  const x = Math.min(PARK.x1 - r, Math.max(PARK.x0 + r, p.x))
  const z = Math.min(PARK.z1 - r, Math.max(PARK.z0 + r, p.z))
  const moved = x !== p.x || z !== p.z
  p.x = x
  p.z = z
  return moved
}

/** The parade line's spot for the snowman in `slot`. */
export const lineX = (slot: number) => LINE_X0 - slot * LINE_GAP
