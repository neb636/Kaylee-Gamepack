// The Krabi map (section `map`; notes: planning/around-the-world/thailand/krabi-map.md), in meters: a toy diorama of
// Krabi and Phang Nga Bay floating in the sky, like the Thailand map and the Nan map. Where everything stands, the
// roads between the places, and the things in the sea. The coasts are real (coast.ts, Natural Earth); the places are
// where they really are, the toys a little bigger than life. Pure data (no three.js): sections.ts can read it.
//
// Seen from above at a slant, north up the screen (-z):
//
//     Phuket's    Ko Panyee's stilt village    the mangroves of Ao Phang Nga          Khao Phanom Bencha
//     east side   Ko Tapu, the Nail Island      ~~ Phang Nga Bay, rock towers ~~      (a cloud on top)
//                 Koh Yao Noi  Koh Yao Yai              the pier ─── Baan Chang ─── Krabi Town ─── the airport
//                                                  Ao Nang, Railay      (the Krabi River, its twin rocks)
//                                                Chicken Island
//                 the Andaman Sea           Koh Phi Phi                               Koh Lanta Noi
//                                                                                     Koh Lanta Yai, the lighthouse
import type { LonLat } from './coast'

export type XZ = [number, number]

/** The board's edges (degrees). */
export const EDGES = { lon0: 98.28, lon1: 99.24, lat0: 7.42, lat1: 8.45 }
/** Meters of board per degree (a degree of longitude is a little shorter here: cos 8°). */
const K = 5.4
const KX = K * 0.99
const LON_C = (EDGES.lon0 + EDGES.lon1) / 2
const LAT_C = (EDGES.lat0 + EDGES.lat1) / 2
export const toX = (lon: number) => (lon - LON_C) * KX
export const toZ = (lat: number) => (LAT_C - lat) * K
/** A spot on the board from its longitude and latitude. */
export const ll = (lon: number, lat: number): XZ => [toX(lon), toZ(lat)]
export const fromXZ = (x: number, z: number): LonLat => [x / KX + LON_C, LAT_C - z / K]
/** Degrees to board meters (for radii). */
export const DEG_M = K

/** The board: x across (east to the right), z toward us (south at the bottom). */
export const BOARD = { x0: toX(EDGES.lon0), x1: toX(EDGES.lon1), z0: toZ(EDGES.lat1), z1: toZ(EDGES.lat0) }

/** Heights: the sea's top is 0, the land stands up out of it like a slice of cake, its hills on top. */
export const LEVEL = { floor: -0.2, land: 0.16 }
/** How wide the land's cut edge is (meters), from the sea up to its top. */
export const CLIFF_W = 0.05

/** The hills and mountains on the land: [lon, lat, radius (degrees), height (m)]. Khao Phanom Bencha is the big one
 *  north of Krabi Town; Phuket, the Yao islands and Koh Lanta have their own spines. */
export const HILLS: [number, number, number, number][] = [
  [98.99, 8.3, 0.11, 0.5],
  [99.1, 8.38, 0.08, 0.3],
  [99.16, 8.2, 0.1, 0.36],
  [99.15, 7.98, 0.09, 0.28],
  [99.2, 7.72, 0.08, 0.22],
  [98.8, 8.4, 0.08, 0.26],
  [98.66, 8.43, 0.06, 0.2],
  [99.02, 8.17, 0.05, 0.16],
  [98.32, 7.98, 0.07, 0.24],
  [98.33, 8.14, 0.06, 0.18],
  [98.6, 8.02, 0.035, 0.14],
  [99.06, 7.56, 0.04, 0.18],
  [99.1, 7.65, 0.025, 0.1],
]

/** Toy islands the coast data is too coarse for, shaped as round blobs: [lon, lat, east-west radius, north-south
 *  radius] (degrees). Koh Phi Phi Don is two lobes on a thin sandy neck (its two bays, really), Phi Phi Leh the little
 *  one below it. */
export const TOY_ISLANDS: [number, number, number, number][] = [
  [98.758, 7.765, 0.032, 0.024],
  [98.785, 7.732, 0.03, 0.022],
  [98.772, 7.748, 0.012, 0.01],
  [98.765, 7.68, 0.016, 0.02],
]

/** The Krabi River, from the hills down through town to the sea, and Phang Nga's mangrove creeks. */
export const RIVERS: LonLat[][] = [
  [[98.97, 8.24], [98.955, 8.18], [98.94, 8.13], [98.925, 8.09], [98.915, 8.055]],
  [[98.72, 8.43], [98.715, 8.39], [98.705, 8.36]],
  [[98.6, 8.46], [98.6, 8.42], [98.59, 8.39]],
]
export const RIVER_W = 0.09

// ---------------------------------------------------------------- the places

/** Krabi's two places (each its own part of the trip, done in either order: the `been` param). */
export const STOPS = ['chang', 'bay'] as const
export type Stop = (typeof STOPS)[number]
/** The places on the map: the stops, Krabi Town (the roads meet there) and the airport (the way home). */
export type PlaceId = 'airport' | 'town' | 'chang' | 'pier'
export const STOP_PLACE: Record<Stop, PlaceId> = { chang: 'chang', bay: 'pier' }

/** Where each place stands (`at`: where the songthaew parks; its toy stands at `model`, a little behind or beside it). */
/** (They're spread a little further apart than they really are, so the big toys don't crowd: Baan Chang up toward the
 *  hills, the pier up the bay's shore toward the Nail Island.) `scale`: how much bigger than the board the toy is. */
export const PLACES: Record<PlaceId, { at: XZ; model: XZ; label: string; scale: number }> = {
  airport: { at: ll(99.07, 8.105), model: ll(99.08, 8.14), label: 'Krabi airport', scale: 1.9 },
  town: { at: ll(98.925, 8.088), model: ll(98.93, 8.11), label: 'Krabi Town', scale: 1.5 },
  chang: { at: ll(98.85, 8.21), model: ll(98.855, 8.245), label: 'Baan Chang, the elephants', scale: 2.0 },
  pier: { at: ll(98.728, 8.262), model: ll(98.712, 8.268), label: 'The pier, the longtail boat', scale: 2.0 },
}
export const PLACE_IDS = Object.keys(PLACES) as PlaceId[]
/** After this many stops the airport (the way home) opens too. */
export const HOME_AFTER = 1

/** The roads (a line from the airport through Krabi Town and Baan Chang to the pier). */
export const ROADS: { from: PlaceId; to: PlaceId; via: XZ[] }[] = [
  { from: 'airport', to: 'town', via: [ll(99.03, 8.1), ll(98.99, 8.09), ll(98.955, 8.088)] },
  { from: 'town', to: 'chang', via: [ll(98.9, 8.12), ll(98.875, 8.16), ll(98.86, 8.19)] },
  { from: 'chang', to: 'pier', via: [ll(98.82, 8.225), ll(98.785, 8.24), ll(98.75, 8.255)] },
]
/** Roads painted on the board that don't go anywhere yet: Krabi Town down to Ao Nang, and on round to Railay's road end. */
export const MORE_ROADS: XZ[][] = [[PLACES.town.at, ll(98.895, 8.075), ll(98.865, 8.058), ll(98.84, 8.048), ll(98.822, 8.04)]]

/** Where the stamps float over the stops, and the plane's runway (Krabi's runs north-west to south-east). */
export const STAMP_Y = 0.72
export const RUNWAY = { at: ll(99.16, 8.06), len: 0.85, w: 0.18, yaw: -0.88 }

// ---------------------------------------------------------------- the toys, the pokes

/** Places the trip doesn't go to yet, standing on the board as toys she can poke: Ao Nang's beach (longtails pulled up
 *  on the sand, umbrellas, the hotels) with Railay's cliffs, Chicken Island, Koh Phi Phi and Koh Lanta's lighthouse.
 *  (A new trip there later is a new place in PLACES.) */
export const SPOTS = {
  aonang: ll(98.818, 8.03),
  railay: ll(98.842, 8.008),
  chicken: ll(98.802, 7.95),
  phiphi: ll(98.772, 7.75),
  lanta: ll(99.03, 7.6),
  lighthouse: ll(99.085, 7.483),
  bencha: ll(98.99, 8.3),
  nail: ll(98.5, 8.272),
  panyee: ll(98.51, 8.322),
} satisfies Record<string, XZ>
export type SpotId = keyof typeof SPOTS

/** Phang Nga Bay's limestone towers and the ones off Krabi's coast: [lon, lat, size]. (map3d.ts drops any that
 *  land on land.) */
export const KARSTS: [number, number, number][] = [
  [98.47, 8.3, 1.1], [98.545, 8.3, 0.9], [98.478, 8.245, 0.8], [98.535, 8.24, 1], [98.575, 8.265, 0.7], [98.63, 8.25, 0.85],
  [98.5, 8.2, 0.75], [98.69, 8.13, 0.8], [98.72, 8.06, 0.95], [98.74, 7.98, 0.8],
  [98.69, 7.9, 0.9], [98.97, 7.92, 0.7], [98.62, 7.85, 0.65], [98.84, 7.86, 0.7], [98.47, 8.13, 0.6],
  [99.0, 7.79, 0.6], [98.66, 7.99, 0.55],
]
/** Krabi Town's twin rocks at the river mouth (Khao Khanap Nam). */
export const TWINS: [number, number][] = [[98.905, 8.062], [98.925, 8.058]]

/** The longtails buzzing round the bay and off Ao Nang: [lon, lat, east-west radius, north-south radius (m)]. */
export const BOAT_LOOPS: [number, number, number, number][] = [
  [98.53, 8.255, 0.32, 0.22],
  [98.79, 7.99, 0.28, 0.2],
]
/** The big ferry's run: Krabi Town's river mouth, Koh Phi Phi, Koh Lanta and back (out in the sea all the way). */
export const FERRY: XZ[] = [ll(98.9, 8.035), ll(98.86, 7.92), ll(98.82, 7.79), ll(98.85, 7.7), ll(98.95, 7.63), ll(98.97, 7.7), ll(98.95, 7.84), ll(98.93, 7.97)]
/** The dolphins out in the Andaman Sea, the sea turtle off Koh Lanta, the sea eagle circling over the bay. */
export const DOLPHINS = ll(98.44, 7.56)
export const TURTLE = ll(98.98, 7.53)
export const EAGLE = { at: ll(98.6, 8.18), r: 0.45, y: 1.05 }
/** Out in the open Andaman Sea: a whale shark cruising round (they visit the reefs off Koh Lanta), and a yacht with a
 *  pink sail: [lon, lat], and the loop's east-west and north-south radius (m). */
export const WHALE = { at: ll(98.53, 7.8), rx: 0.4, rz: 0.26 }
export const YACHT = { at: ll(98.66, 7.53), rx: 0.38, rz: 0.2 }
/** The clouds over the hills (tap: a little rain): [lon, lat, height]. */
export const CLOUDS: [number, number, number][] = [
  [98.99, 8.3, 1.1],
  [99.17, 8.33, 0.85],
  [98.32, 8.05, 0.8],
  [99.12, 7.62, 0.72],
]

/** The little songthaew, scaled down to the board. How fast it drives along the roads (m/s), picked or dragged. */
export const CAR_SCALE = 0.085
export const CAR_SPEED = 1.6
export const DRAG_SPEED = 3.2
