// The Pizza Company's table (plan: planning/around-the-world/thailand/mall-trip.md, "The Pizza Company"), in meters:
// where everything stands, the three pizzas and how far each one's cheese stretches. Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   back wall:   [ the window onto the waterfall ]          [ the green sign ]
//   booth:            Mommy         Kaylee         Daddy
//   table:  napkins  [plate]       [plate]        [plate]     [Agong's box]
//   front:      soda   onion rings  (the pizza on its stand)  chili
//   the server waits by the end of the booth.

export type V3 = [number, number, number]

export const PIZZAS = ['hawaiian', 'seafood', 'cheese'] as const
export type PizzaId = (typeof PIZZAS)[number]
export const PIZZA_ICONS: Record<PizzaId, string> = { hawaiian: '🍍', seafood: '🦐', cheese: '🧀' }
export const PIZZA_NAMES: Record<PizzaId, string> = { hawaiian: 'Hawaiian', seafood: 'Seafood', cheese: 'Double Cheese' }
/** How long the cheese stretches before it snaps (meters): Double Cheese stretches longest. */
export const SNAP: Record<PizzaId, number> = { hawaiian: 0.42, seafood: 0.5, cheese: 0.95 }
/** The cheese tug: Daddy holds the other end, and it stretches right across the table before it snaps onto his nose. */
export const TUG_SNAP = 1.3

export const SLICES = 8
export const TABLE = { w: 3.1, d: 1.1, z: 0, top: 0.72 }
export const PAN = { x: 0, z: 0.21, y: TABLE.top + 0.09, r: 0.3 }
export const PLATE_R = 0.18
export const PLATE_Z = -0.33

/** Who sits on the far side of the table, and their plates (the plate is in front of them). */
export const EATERS = ['ji', 'kaylee', 'nick'] as const
export type EaterId = (typeof EATERS)[number]
export const SEATS: Record<EaterId, { x: number; seat: number }> = {
  ji: { x: -0.9, seat: 0.46 },
  kaylee: { x: 0, seat: 0.62 },
  nick: { x: 0.9, seat: 0.46 },
}
export const SEAT_Z = -0.86
export const EATER_NAMES: Record<EaterId, string> = { ji: 'Mommy', kaylee: 'Kaylee', nick: 'Daddy' }

/** Agong's take-away box, at the right end. Its lid stands open until two slices are in. */
export const BOX = { x: 1.3, z: -0.16, w: 0.4, h: 0.1 }
export const BOX_HOLDS = 2

// The things to poke.
export const SODA: V3 = [-1.28, TABLE.top, 0.28]
export const RINGS: V3 = [-0.64, TABLE.top, 0.3]
export const CHILI: V3 = [0.62, TABLE.top, 0.33]
export const NAPKINS: V3 = [-1.33, TABLE.top, -0.24]
export const SERVER_AT: V3 = [-1.9, 0, -0.5]
export const BACK_Z = -1.55
export const WINDOW = { x0: -2.4, x1: -0.35, y0: 1.05, y1: 2.35 }
export const SIGN = { x: 1.05, y: 1.95, w: 1.3, h: 0.62 }
