// Emperor Huddle's ice and starting huddles, in meters. Plain TypeScript (no three.js). The penguins are the films' and
// the finale's toys on the chibi rig (story/actor.ts): an emperor dad stands about 1.3 m tall, Pebble just out of the egg
// about half a meter.
//
// The huddle stands on flat snow-covered sea ice round (0, 0): x runs across the screen (the wind blows along it, from
// the left or the right) and z toward the camera. The dads pack as circles of RADIUS on the snow.

/** A grown penguin's footprint radius, m (the rig's tummy is 0.3 of his height out). */
export const RADIUS = 0.44
/** How tall the dads stand, m (each a touch different). */
export const DAD_H = 1.3
export const CHICK_H = 0.6

/** Where the penguins may stand: half its width (x) and depth (z), m. One for wide screens, one for tall. */
export interface Field {
  hx: number
  hz: number
}
export const WIDE: Field = { hx: 3.9, hz: 1.9 }
export const TALL: Field = { hx: 2.4, hz: 2.6 }

/** A dad's starting spot for wind from the left (mirrored for wind from the right), in RADIUS units from the middle
 *  of the ice, and how warm he starts. The first is always Papa. */
export interface Start {
  dx: number
  dz: number
  warm: number
}

/** Five dads: four in a little huddle, Papa alone on the windy edge, shivering. */
export const SMALL: Start[] = [
  { dx: -5.6, dz: 0.4, warm: 0.15 },
  { dx: -0.9, dz: -1, warm: 0.5 },
  { dx: -1, dz: 1.1, warm: 0.55 },
  { dx: 1, dz: -0.2, warm: 1 },
  { dx: 1.1, dz: 1.9, warm: 1 },
]
/** The three who join when the blizzard comes (they waddle in out of the dark on the side away from the wind). */
export const LATE: Start[] = [
  { dx: 3, dz: -1.6, warm: 0.9 },
  { dx: 3.1, dz: 1.3, warm: 0.9 },
  { dx: 4.4, dz: -0.2, warm: 0.9 },
]
/** Eight dads in a bigger huddle, the windward ones already chilly. */
export const BIG: Start[] = [
  { dx: -2, dz: 1.1, warm: 0.4 },
  { dx: -2, dz: -0.9, warm: 0.45 },
  { dx: -2.6, dz: 3, warm: 0.3 },
  { dx: 0, dz: -2, warm: 1 },
  { dx: -0.1, dz: 0.1, warm: 1 },
  { dx: 0, dz: 2.1, warm: 1 },
  { dx: 2, dz: -1, warm: 1 },
  { dx: 2, dz: 1.1, warm: 1 },
]
/** The hatch: Papa out on the windy edge, the rest huddled. */
export const HATCH: Start[] = [
  { dx: -4.6, dz: 0.6, warm: 0.2 },
  { dx: -1, dz: -1.6, warm: 0.7 },
  { dx: -1.1, dz: 1.4, warm: 0.75 },
  { dx: 0.9, dz: -0.4, warm: 1 },
  { dx: 1, dz: 2.4, warm: 1 },
  { dx: 2.6, dz: -1.6, warm: 1 },
  { dx: 2.8, dz: 1.2, warm: 1 },
  { dx: 3.4, dz: -3.4, warm: 1 },
]
/** Everyone huddled and warm, Papa at the front (a hatched chick, Papa's song). */
export const SNUG: Start[] = [
  { dx: 0.2, dz: 2.6, warm: 1 },
  { dx: -2, dz: -0.9, warm: 0.9 },
  { dx: -2.1, dz: 1.1, warm: 0.9 },
  { dx: 0, dz: -2, warm: 1 },
  { dx: -0.1, dz: 0.2, warm: 1 },
  { dx: 2, dz: -1, warm: 1 },
  { dx: 2, dz: 1.1, warm: 1 },
  { dx: 0.6, dz: -3.9, warm: 1 },
]
export const MAX_DADS = 8
