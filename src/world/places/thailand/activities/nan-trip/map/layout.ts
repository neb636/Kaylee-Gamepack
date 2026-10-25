// The Nan map (plan: planning/around-the-world/thailand/nan-trip.html, "The Nan map"), in meters: a toy diorama of Nan on
// a table, where everything stands, the roads between the places and which drive each one plays. Pure data (no
// three.js): sections.ts can read it at startup.
//
// Seen from above at a slant, north up the screen (-z), Laos along the right edge (+x):
//
//          the mushroom farm (Pua)  ~~ Doi Phu Kha, a cloud on top ~~   the rice steps + Stop Time Cafe (Sapan)
//                   \   the Nan River                                       |
//                    \  winding down                                  the salt hut (Bo Kluea)  |  Laos
//                     |   the middle                                 the "3" road down          |  (its flag)
//        the airport ==== the bridge ==== Nan town (the market) ===== Santi Suk                 |

export type XZ = [number, number]

/** The board: x across (east to the right), z toward us (south at the bottom). Its top is at y = 0. */
export const BOARD = { x0: -2.9, x1: 2.9, z0: -2.2, z1: 2.2 }
/** Laos starts here (the border runs down the board at this x). */
export const LAOS_X = 2.42

/** The mountains: [x, z, radius, height]. Doi Phu Kha is the big one in the middle at the top. */
export const HILLS: [number, number, number, number][] = [
  [0.35, -1.05, 0.95, 0.7],
  [1.95, -0.05, 0.75, 0.5],
  [2.15, 1.25, 0.7, 0.42],
  [1.05, 0.95, 0.55, 0.32],
  [-2.25, -1.3, 0.85, 0.45],
  [-2.35, 0.55, 0.75, 0.34],
  [-1.15, -1.95, 0.55, 0.28],
  [0.15, 1.9, 0.5, 0.22],
  [2.75, -1.45, 0.6, 0.42],
  [2.7, 0.55, 0.45, 0.3],
  [1.65, -1.95, 0.55, 0.4],
]
/** The ground's height at a point (smooth bumps; the river valley stays flat). */
export function heightAt(x: number, z: number) {
  let h = 0
  for (const [cx, cz, r, top] of HILLS) {
    const d = Math.hypot(x - cx, z - cz)
    if (d < r) h += (top * (1 + Math.cos((Math.PI * d) / r))) / 2
  }
  return h
}

/** The Nan River, north to south down the middle. */
export const RIVER: XZ[] = [[-1.35, -2.2], [-0.95, -1.55], [-0.6, -0.85], [-0.72, -0.15], [-0.55, 0.55], [-0.72, 1.3], [-0.5, 2.2]]
export const RIVER_W = 0.13

// ---------------------------------------------------------------- the places

/** The stops (each its own section) and the two other places on the map. */
export const STOPS = ['mushrooms', 'rice', 'salt'] as const
export type Stop = (typeof STOPS)[number]
export type PlaceId = Stop | 'airport' | 'town'

/** Where each place stands, and the road that drives there (the 3 road is the way home). */
export const PLACES: Record<PlaceId, { at: XZ; road: 'city' | 'valley' | 'sky' | 'three'; label: string }> = {
  airport: { at: [-1.6, 1.35], road: 'three', label: 'The airport' },
  town: { at: [-0.22, 0.95], road: 'city', label: 'Nan town' },
  mushrooms: { at: [-1.4, -1.15], road: 'valley', label: 'The mushroom farm' },
  rice: { at: [1.12, -1.55], road: 'sky', label: 'Stop Time Cafe' },
  salt: { at: [1.62, -0.55], road: 'sky', label: 'Bo Kluea salt wells' },
}
/** Each place's toy stands a little behind where the Pajero parks for it (north, up the screen), so the car shows in
 *  front of it. */
export const MODEL_BACK = 0.24
export const modelAt = (id: PlaceId): XZ => [PLACES[id].at[0], PLACES[id].at[1] - MODEL_BACK]
export const PLACE_IDS = Object.keys(PLACES) as PlaceId[]
/** After this many stops the airport (the way home) opens too; after all three it's the only way left. */
export const HOME_AFTER = 2

/** The roads on the board, between the places (a loop: town, Pua, over Doi Phu Kha to Sapan, Bo Kluea, down the 3 road
 *  to Santi Suk and back to town, and the airport road over the bridge). */
export const ROADS: { from: PlaceId; to: PlaceId; via: XZ[] }[] = [
  { from: 'airport', to: 'town', via: [[-1.2, 1.3], [-0.85, 1.18], [-0.55, 1.05]] },
  { from: 'town', to: 'mushrooms', via: [[-0.2, 0.35], [-0.35, -0.3], [-0.68, -0.5], [-1.05, -0.8]] },
  { from: 'mushrooms', to: 'rice', via: [[-0.95, -1.55], [-0.4, -1.75], [0.2, -1.95], [0.7, -1.82]] },
  { from: 'rice', to: 'salt', via: [[1.42, -1.25], [1.55, -0.9]] },
  // Down the "number 3" road (a little 3 of hairpins), to Santi Suk and back into town.
  { from: 'salt', to: 'town', via: [[1.32, -0.32], [0.95, -0.22], [1.25, 0.0], [0.9, 0.15], [1.2, 0.38], [0.85, 0.62], [0.35, 0.92]] },
]
/** Where the stamps float over the stops, and the plane's runway. */
export const STAMP_Y = 0.75
export const RUNWAY = { at: [-1.85, 1.75] as XZ, len: 1.1, w: 0.2, yaw: 0.35 }

// ---------------------------------------------------------------- the pokes

/** The clouds sitting on the peaks (tap: a little rain). */
export const CLOUDS: [number, number, number][] = [
  [0.35, 1.05, -1.05],
  [1.95, 0.85, -0.05],
  [-2.25, 0.8, -1.3],
]
/** Where the fish jumps (the river), the buffalo grazing in the paddies by the river, the flags. */
export const FISH: XZ = [-0.62, 0.15]
export const BUFFALO: XZ = [-1.05, 0.25]
export const PADDIES: XZ = [-1.15, 0.3]
export const THAI_FLAG: XZ = [0.15, 1.3]
export const LAOS_FLAG: XZ = [2.68, 1.85]

/** The little Pajero, scaled down to the board. */
export const CAR_SCALE = 0.07
/** How fast it drives along the board's roads (m/s): picked from the map, dragged by her finger. */
export const CAR_SPEED = 1.7
export const DRAG_SPEED = 3.2
