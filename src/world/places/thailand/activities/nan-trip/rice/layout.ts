// Kaylee's little rice farm at Sapan (plan: planning/around-the-world/thailand/nan-rice.md), in meters: the four
// paddies, their rice hills, the channel and its gates, the step up to the back pair, where everyone stands, the props,
// and Stop Time Cafe's deck up on the hill behind. Pure data (no three.js): sections.ts reads it at startup.
//
// The camera looks toward -z from high in front. x runs left to right, the front of the farm is +z.
//
//      the hill, Stop Time Cafe's deck up on it (back left), the bamboo pipe down to the channel
//   hut   ┌──────────┐  ║  ┌──────────┐   bamboo, the buffalo's wallow
//         │ paddy C  ├G ║ G┤ paddy D  │          (the back pair: one step up, 0.45 m)
//         └──────────┘  ║  └──────────┘
//   ════ stair ════════ path ═║═ scarecrow ═══ stair ════   the riser: a sandy step with a grass lip
//   banana┌──────────┐  ║  ┌──────────┐   the straw pile
// nursery │ paddy A  ├G ║ G┤ paddy B  │   the drying rack
//         └──────────┘  ║  └──────────┘
//   ══════════ the plank boardwalk (Kaylee and Daddy start here), its bridge over the channel ══════   the basket

export type V3 = [number, number, number]

// ---------------------------------------------------------------- the rounds

export const ROUNDS = ['plant', 'grow', 'harvest', 'thresh', 'deck'] as const
export type Round = (typeof ROUNDS)[number]

// ---------------------------------------------------------------- the ground

/** The back pair's bank tops are this much higher than the front pair's (the front's are at 0). */
export const RISE = 0.45
/** The step between them runs along here (z). */
export const RISER_Z = -0.5
/** Below a bank's top: the water when full, where Kaylee stands in a paddy (in the water, so she splashes), the mud. */
export const WATER_DOWN = 0.15
export const WADE_DOWN = 0.27
export const MUD_DOWN = 0.34
/** The boardwalk's planks along the front, and its top. */
export const BOARDWALK = { z0: 3.55, z1: 4.45, x0: -5.2, x1: 5.6, y: 0.07 }

/** The ground's top at a point, without the paddies or the channel cut into it. */
export const levelAt = (z: number) => (z < RISER_Z ? RISE : 0)

// ---------------------------------------------------------------- the paddies

export interface Paddy {
  i: number
  /** 'A' front left, 'B' front right, 'C' back left, 'D' back right. */
  name: string
  /** The water inside its banks. */
  x0: number
  x1: number
  z0: number
  z1: number
  /** Its banks' top. */
  top: number
  /** Its middle, on the water when full. */
  mid: V3
  /** Its gate, in the bank between it and the channel (the side it opens toward: -1 left, +1 right). */
  gate: V3
  side: number
}

const W = 3.6
/** Half the channel's width, and the paddies' inside edge (the bank between them and the channel). */
export const CHANNEL_HALF = 0.25
const INNER = 0.6
const FRONT_Z = [0.5, 3.1] as const
const BACK_Z = [-3.55, -0.95] as const

function paddy(i: number, name: string, left: boolean, back: boolean): Paddy {
  const x0 = left ? -INNER - W : INNER
  const x1 = x0 + W
  const [z0, z1] = back ? BACK_Z : FRONT_Z
  const top = back ? RISE : 0
  const mz = (z0 + z1) / 2
  return { i, name, x0, x1, z0, z1, top, mid: [(x0 + x1) / 2, top - WATER_DOWN, mz], gate: [left ? -(INNER + CHANNEL_HALF) / 2 : (INNER + CHANNEL_HALF) / 2, top, mz], side: left ? 1 : -1 }
}

export const PADDIES: Paddy[] = [paddy(0, 'A', true, false), paddy(1, 'B', false, false), paddy(2, 'C', true, true), paddy(3, 'D', false, true)]
/** The banks around the paddies reach this far out (x), front (z) and back. */
export const FARM = { x: INNER + W + 0.4, front: FRONT_Z[1] + 0.4, back: BACK_Z[0] - 0.4 }

export function paddyAt(x: number, z: number, pad = 0): Paddy | null {
  return PADDIES.find((p) => x > p.x0 - pad && x < p.x1 + pad && z > p.z0 - pad && z < p.z1 + pad) ?? null
}

/** The channel runs from the bamboo pipe at the back, down the step, under the boardwalk and away. */
export const CHANNEL = { z0: FARM.back - 0.35, z1: 16 }
/** The plank bridges over the channel: the path's and the boardwalk's (z ranges). */
export const BRIDGES: [number, number][] = [[-0.42, 0.42], [BOARDWALK.z0, BOARDWALK.z1]]
export const inChannel = (x: number, z: number) => Math.abs(x) < CHANNEL_HALF && z > CHANNEL.z0 && z < CHANNEL.z1 && !BRIDGES.some(([a, b]) => z > a && z < b)

// ---------------------------------------------------------------- the rice hills

/** The hills in each paddy: this many across and deep, this far apart. */
export const HILLS_X = 7
export const HILLS_Z = 5
export const HILL_GAP = 0.46
export const HILLS = PADDIES.flatMap((p) =>
  Array.from({ length: HILLS_X * HILLS_Z }, (_, k) => {
    const cx = k % HILLS_X
    const cz = Math.floor(k / HILLS_X)
    return { paddy: p.i, x: p.mid[0] + (cx - (HILLS_X - 1) / 2) * HILL_GAP, z: p.mid[2] + (cz - (HILLS_Z - 1) / 2) * HILL_GAP, floor: p.top - MUD_DOWN }
  }),
)
export const PER_PADDY = HILLS_X * HILLS_Z

/** Whatever Kaylee walks through: hills this near her (m) get the round's action. */
export const BRUSH = 0.5
/** Rice this near her leans away as she wades. */
export const LEAN_R = 0.62
/** A paddy this planted plants the rest by itself; this cut, the rest falls by itself. */
export const PLANTED_AT = 0.7
export const CUT_AT = 0.75
/** Bundles she ties in all (one every PER_PADDY * 4 / BUNDLES hills cut). */
export const BUNDLES = 8

// ---------------------------------------------------------------- growing (round 2) and the birds

/** Seconds for the rice to grow from young green to golden on its own; each bird shooed speeds it up a little. */
export const GROW_S = 40
export const SHOO_BOOST = 0.02
/** Birds that come down at these growths (how many, from how many sides). */
export const WAVES = [
  { at: 0, n: 2, sides: 1 },
  { at: 0.3, n: 3, sides: 1 },
  { at: 0.6, n: 5, sides: 2 },
] as const
export const BIRDS = 6
/** A bird flies up when Kaylee comes this near; left this long, it gets round. */
export const SHOO_R = 1.3
export const FAT_S = 6

// ---------------------------------------------------------------- Kaylee's walk

/** She trots this fast on the banks and in the water (m/s). */
export const SPEED_BANK = 2.6
export const SPEED_WADE = 2.2
/** Where she can walk, and the things she slides round. */
export const WALK = { x0: -6.0, x1: 6.1, z0: -3.85, z1: 4.3 }

// ---------------------------------------------------------------- where everyone and everything is

export const KAYLEE_AT: V3 = [-1.3, BOARDWALK.y, 4.0]
export const NICK_AT: V3 = [-4.35, BOARDWALK.y, 4.05]
export const SCARECROW: V3 = [1.75, 0, -0.02]
export const NURSERY = { x: -5.35, z: 2.3, w: 1.0, d: 1.7 }
export const BANANA: V3 = [-5.55, 0, 0.0]
export const HUT: V3 = [-5.45, RISE, -2.35]
export const BAMBOO: V3 = [5.75, RISE, -3.35]
export const WALLOW = { x: 5.35, z: -2.15, r: 0.95 }
export const RACK = { x: 5.45, z: 1.75, len: 1.7, y: 1.12 }
export const BASKET: V3 = [5.25, 0, 3.75]
/** Beside the basket, so the threshing's straw lands on it. */
export const STRAW_PILE: V3 = [5.95, 0, 2.95]
/** Bangs on the board a bundle takes, and bundles threshed before the basket is heaped (the rest stay on the rack). */
export const BANGS_PER = 2
export const THRESHED = 5
/** The stairs up the step, either side of the middle. */
export const STAIRS = [-3.1, 3.1]
/** The bamboo pipe brings the hill's water to the head of the channel. */
export const PIPE_FROM: V3 = [-0.3, 1.45, -5.6]
export const PIPE_TO: V3 = [0, 0.78, CHANNEL.z0 + 0.15]

/** Sapan's rice steps on the valley's sides, climbing round hills (centre, base radius, steps, which way is uphill):
 *  the deck looks out over the big one, and wide screens see both past the farm's edges. */
export const TERRACES = [
  { x: 25, z: 15, r: 11, steps: 8, back: [0.84, 0.55] as const },
  { x: -19, z: 10, r: 7.4, steps: 6, back: [-0.8, 0.6] as const },
]
export const inTerrace = (x: number, z: number, pad = 0) => TERRACES.some((t) => Math.hypot(x - t.x, (z - t.z) / 0.7) < t.r * 1.15 + pad || Math.hypot(x - t.x - t.back[0] * t.r, z - t.z - t.back[1] * t.r) < t.r * 1.2 + pad)

/** Things she slides round (x, z, radius). */
export const BLOCKERS: [number, number, number][] = [
  [SCARECROW[0], SCARECROW[2], 0.32],
  [HUT[0], HUT[2], 0.95],
  [BANANA[0], BANANA[2], 0.4],
  [BAMBOO[0], BAMBOO[2], 0.5],
  [RACK.x - RACK.len / 2, RACK.z, 0.3],
  [RACK.x + RACK.len / 2, RACK.z, 0.3],
  [BASKET[0], BASKET[2], 0.5],
]

// ---------------------------------------------------------------- Stop Time Cafe's deck

/** The deck, on the hill's spur at the back left: its middle, and which way it looks (its railing toward the farm, so
 *  the camera behind it is over open hillside). */
export const DECK = { x: -7.3, y: 2.0, z: -5.7, yaw: -2.15 }
/** Deck-local (x across, z toward the railing at -z). */
export const RAIL_Z = -1.35
export const STOOLS = { kaylee: [-0.36, 0.74, -0.95] as V3, nick: [0.38, 0.62, -0.95] as V3 }
export const HIGH_TABLE: V3 = [0, 0.84, -0.42]
export const MOMMY_AT: V3 = [1.3, 0, -0.95]
/** Where Mommy's photo is taken from (in front of them, the farm behind). */
export const PHOTO_FROM: V3 = [0.25, 1.2, 1.5]
export const CHIME: V3 = [-1.5, 2.6, -1.2]
/** Sips in a glass of pink milk. */
export const SIPS = 4
