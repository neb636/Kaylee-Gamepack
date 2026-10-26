// Baan Huanam Mushroom Farm (plan: planning/around-the-world/thailand/nan-trip.html, "2. Baan Huanam Mushroom Farm"), in
// meters: where everything stands in the mushroom house and at the farm's table, the rounds, and the basket she carries
// from one to the other. Pure data (no three.js): sections.ts reads it at startup.
//
// The mushroom house, seen from the aisle (the camera looks toward -z, low, straight on):
//
//   back wall:  [the sign]   [ the rack: 4 x 3 sawdust bags lying down, mouths to us ]   [the door, light]  gecko
//   aisle:       Kaylee with the hose      (the drip from the beam)                Daddy       the farmer aunty
//   front:            her basket                                                     the sleepy dog
//
// The farm's table, 8 m along (outside, on a wooden deck over the green hills):
//
//   the hills and the rice steps far away, the deck's railing
//   the clay oven   Mommy   Kaylee   Daddy        (on stools, on the far side of the table)
//   the farmer        [plate]  [plate]  [plate]
//                       (the pizza on its board)      her basket

export type V3 = [number, number, number]

// ---------------------------------------------------------------- the rounds and the basket

export const ROUNDS = ['1', '2', '3', 'pizza'] as const
export type Round = (typeof ROUNDS)[number]

export const COLORS = ['grey', 'pink', 'gold'] as const
export type ShroomColor = (typeof COLORS)[number]
export type Basket = Record<ShroomColor, number>

/** `grey5,pink2,gold1` → counts (anything odd is skipped). */
export function parseBasket(s: string): Basket {
  const b: Basket = { grey: 0, pink: 0, gold: 0 }
  for (const part of s.split(',')) {
    const m = /^(grey|pink|gold)(\d{1,2})$/.exec(part.trim())
    if (m) b[m[1] as ShroomColor] = Math.min(20, Number(m[2]))
  }
  return b
}
export function formatBasket(b: Basket): string {
  return COLORS.filter((c) => b[c] > 0)
    .map((c) => `${c}${b[c]}`)
    .join(',')
}
export const basketSize = (b: Basket) => b.grey + b.pink + b.gold

/** What's in the basket when a link doesn't say: empty in rounds 1 and 2, round 2's grey ones in round 3, and a
 *  colorful basket at the pizza. */
export const BASKET_SEED: Record<Round, string> = { '1': '', '2': '', '3': 'grey6', pizza: 'grey4,pink2' }

/** Picks that end rounds 2 and 3. */
export const PICKS = { '2': 6, '3': 6 } as const

// ---------------------------------------------------------------- the mushroom house

export const COLS = 4
export const ROWS = 3
/** The bags' mouths (where the mushrooms come out), in a grid on the rack. */
export const BAG_X = [-0.72, -0.24, 0.24, 0.72]
export const BAG_Y = [0.5, 0.92, 1.34]
export const BAG_R = 0.13
export const BAG_LEN = 0.42
export const MOUTH_Z = 0.1
export const BAGS = BAG_Y.flatMap((y) => BAG_X.map((x): V3 => [x, y, MOUTH_Z]))

/** Round 3's new bags: a pink or gold collar grows pink or golden mushrooms; plain ones grow grey. */
export type BagKind = 'plain' | 'pink' | 'gold'
export const ROUND3_KINDS: BagKind[] = ['pink', 'plain', 'gold', 'pink', 'plain', 'pink', 'gold', 'plain', 'gold', 'plain', 'pink', 'plain']

/** Misting: how far around the spray's center a bag drinks (m), and how fast (water per second, 1 = grown). */
export const MIST_R = 0.3
export const MIST_RATE = 1.25
/** A pin pops out at this much water; grown (ready to pick) at 1; giant (round 2 and 3, keep spraying) at GIANT. */
export const PIN_AT = 0.22
export const GIANT = 3.2
/** A tap (no hold) sprays for this long. */
export const BURST_S = 0.9

export const BACK_Z = -0.45
export const RACK = { x0: -1.02, x1: 1.02 }
export const DOOR = { x0: 1.62, x1: 2.38, y1: 1.95 }
export const SIGN: V3 = [-1.58, 1.5, BACK_Z + 0.03]
export const GECKO: V3 = [-2.05, 1.95, BACK_Z + 0.04]
export const BEAM_Y = 2.2
export const DRIP: V3 = [0.12, BEAM_Y - 0.06, 0.62]
export const DOG: V3 = [0.95, 0, 0.9]
/** The bulb hanging from the roof (moths visit it), and where else the roof drips (just to watch). */
export const BULB: V3 = [-0.42, 2.48, 0.3]
export const DRIPS: V3[] = [[-2.3, BEAM_Y - 0.06, 0.62], [1.05, BEAM_Y - 0.06, -0.1], [2.6, BEAM_Y - 0.06, 0.62]]
export const HOUSE_BASKET: V3 = [-1.0, 0, 0.72]
export const BASKET_R = 0.2
export const KAYLEE_AT: V3 = [-1.5, 0, 0.42]
export const NICK_AT: V3 = [1.38, 0, 0.3]
export const FARMER_AT: V3 = [2.3, 0, -0.18]
/** On a tall screen the aisle closes in round the rack, so everyone fits: Kaylee and her basket beside it, Daddy peeking
 *  out from behind its far end. */
export const TALL = { kaylee: [-1.1, 0, 0.78] as V3, basket: [-0.6, 0, 0.98] as V3, nick: [1.22, 0, 0.12] as V3, dog: [0.45, 0, 1.12] as V3, farmer: [1.72, 0, -0.3] as V3 }

// ---------------------------------------------------------------- the farm's table

/** The table area, this far along x from the house (outside: the house is out of sight). */
export const TX = 8
export const TABLE = { x: TX, z: -0.1, w: 2.0, d: 1.2, top: 0.72 }
export const PIZZA = { x: TX - 0.08, z: 0.08, y: TABLE.top + 0.045, r: 0.36 }
export const SLICES = 6
export const TABLE_BASKET: V3 = [TX + 0.68, TABLE.top, 0.12]
export const EATERS = ['kaylee', 'ji', 'nick'] as const
export type EaterId = (typeof EATERS)[number]
export const SEATS: Record<EaterId, { x: number; seat: number }> = {
  ji: { x: TX - 0.66, seat: 0.46 },
  kaylee: { x: TX, seat: 0.62 },
  nick: { x: TX + 0.66, seat: 0.46 },
}
export const SEAT_Z = -0.98
export const PLATE_Z = -0.48
export const PLATE_R = 0.13
export const EATER_NAMES: Record<EaterId, string> = { kaylee: 'Kaylee', ji: 'Mommy', nick: 'Daddy' }
export const OVEN: V3 = [TX - 1.6, 0, -0.35]
export const OVEN_MOUTH: V3 = [TX - 1.6, 0.78, -0.03]
export const FARMER_TABLE: V3 = [TX - 2.25, 0, -0.85]
/** On a tall screen the aunty waits at the table between the oven and Mommy, so she's in the picture. */
export const FARMER_TABLE_TALL: V3 = [TX - 1.2, 0, -1.3]
export const RAIL_Z = -1.7
