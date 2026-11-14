// The Krabi map (section `map`; notes: planning/around-the-world/thailand/krabi-map.md), in meters: a toy diorama of
// Krabi and Phang Nga Bay floating in the sky. Where everything stands: the places, the pins over them, the limestone
// towers and the few things in the sea. It's kept calm on purpose (2026-11-14: the first Krabi board was too busy):
// open water between a few groups of rocks, a few palms, a handful of toys. No roads: this is a map of sea, rock and
// beach, and she goes somewhere by tapping its pin. The coasts are real (coast.ts, Natural Earth); the places are where they really are, the toys a little
// bigger than life. Pure data (no three.js): sections.ts can read it.
//
// Seen from above at a slant, north up the screen (-z):
//
//     Phuket's                                 the mangroves of Ao Phang Nga          Khao Phanom Bencha
//     east side   Ko Tapu, the Nail Island      ~~ Phang Nga Bay, rock towers ~~      (a cloud on top)
//                 Koh Yao Noi  Koh Yao Yai              the pier     Baan Chang     Krabi Town     the airport
//                                                  Ao Nang, Railay      (the Krabi River, its twin rocks)
//                                                Chicken Island, its sandbar
//                 the Andaman Sea           Koh Phi Phi                               Koh Lanta Noi
//                     (dolphins, a yacht)                                             Koh Lanta Yai, the lighthouse
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
/** The places on the map: the stops, Krabi Town (to poke) and the airport (the way home). */
export type PlaceId = 'airport' | 'town' | 'chang' | 'pier'
export const STOP_PLACE: Record<Stop, PlaceId> = { chang: 'chang', bay: 'pier' }

/** Where each place's toy stands. (They're spread a little further apart than they really are, so the big toys don't
 *  crowd: Baan Chang up toward the hills, the pier up the bay's shore toward the Nail Island.) `scale`: how much
 *  bigger than the board the toy is. */
export const PLACES: Record<PlaceId, { at: XZ; label: string; scale: number }> = {
  airport: { at: ll(99.08, 8.14), label: 'Krabi airport', scale: 1.9 },
  town: { at: ll(98.93, 8.11), label: 'Krabi Town', scale: 1.5 },
  chang: { at: ll(98.855, 8.245), label: 'Baan Chang, the elephants', scale: 2.0 },
  pier: { at: ll(98.712, 8.268), label: 'The pier, the longtail boat', scale: 2.0 },
}
export const PLACE_IDS = Object.keys(PLACES) as PlaceId[]
/** After this many stops the way home opens too (the plane's pin pops up over the airport). */
export const HOME_AFTER = 1

/** Where the stamps float over the stops, and the plane's runway (Krabi's runs north-west to south-east). */
export const STAMP_Y = 0.72
export const RUNWAY = { at: ll(99.16, 8.06), len: 0.62, w: 0.15, yaw: -0.88 }

// ---------------------------------------------------------------- the toys, the pokes

/** What stands on the board to poke, kept to a few so the board stays calm: Ao Nang's beach (two umbrellas and the
 *  sailfish statue), Railay's cliffs with a monkey on top, Chicken Island and its sandbar, Koh Phi Phi, Koh Lanta's
 *  lighthouse and Ko Tapu (the Nail Island). Ao Nang and Koh Lanta are the next places: making one a real place gives
 *  it a pin (PINS). */
export const SPOTS = {
  aonang: ll(98.818, 8.03),
  railay: ll(98.842, 8.008),
  chicken: ll(98.802, 7.95),
  phiphi: ll(98.772, 7.75),
  lighthouse: ll(99.085, 7.483),
  nail: ll(98.5, 8.272),
} satisfies Record<string, XZ>
export type SpotId = keyof typeof SPOTS

/** The pins: a pink pin floats over each place she can go to, with a little toy of the place on top (a baby elephant,
 *  a longtail among the rocks, the plane home). Only the places she can go to wear one. `lift`: how high over the
 *  ground the pin's point hangs (clear of the toy under it). */
export const PINS = {
  chang: { at: PLACES.chang.at, lift: 0.5, label: 'To the elephants', place: 'chang' },
  bay: { at: PLACES.pier.at, lift: 0.4, label: 'To the boat', place: 'pier' },
  home: { at: PLACES.airport.at, lift: 0.46, label: 'Fly home', place: 'airport' },
} satisfies Record<string, { at: XZ; lift: number; label: string; place: PlaceId }>
export type PinId = keyof typeof PINS
export const PIN_IDS = Object.keys(PINS) as PinId[]
export const PLACE_PIN: Partial<Record<PlaceId, PinId>> = { chang: 'chang', pier: 'bay', airport: 'home' }

/** The limestone towers standing in the sea, in three loose groups with open water between them (the references: a
 *  calm bay, a few clusters, not a forest of rocks): [lon, lat, size]. (diorama.ts drops any that land on land.) */
export const KARSTS: [number, number, number][] = [
  // Phang Nga Bay, between the Yao islands and Krabi's shore.
  [98.54, 8.3, 1.15], [98.5, 8.235, 0.9], [98.575, 8.22, 1.05], [98.625, 8.27, 0.8], [98.6, 8.15, 0.7],
  // The Hong islands, off Ao Nang.
  [98.69, 8.11, 1.0], [98.66, 8.05, 0.75], [98.67, 7.99, 0.65],
  // Out in the Andaman Sea, one or two on their own.
  [98.65, 7.87, 0.85], [98.985, 7.86, 0.7], [98.88, 7.49, 0.8],
]
/** The limestone crags on the land, jungle on top: [lon, lat, size]. Just a few, round the top of the bay and behind
 *  Krabi Town. (diorama.ts drops any that fall in the sea or on a place.) */
export const CRAGS: [number, number, number][] = [
  [98.765, 8.1, 1.1],
  [98.935, 8.19, 1.1],
  [98.55, 8.42, 1.3],
  [98.44, 8.395, 1.0],
]
/** Krabi Town's twin rocks at the river mouth (Khao Khanap Nam). */
export const TWINS: [number, number][] = [[98.905, 8.062], [98.925, 8.058]]
/** Pale shallows out in the sea, where the sand comes up under the water: [x, z, radius] (m). The sandbar off Chicken
 *  Island, the lagoon between Koh Phi Phi's two halves, the reef flats off Koh Lanta. */
export const SANDBAR: XZ[] = [SPOTS.chicken, [SPOTS.chicken[0] - 0.13, SPOTS.chicken[1] + 0.12], [SPOTS.chicken[0] - 0.3, SPOTS.chicken[1] + 0.15], [SPOTS.chicken[0] - 0.42, SPOTS.chicken[1] + 0.07]]
export const SHOALS: [number, number, number][] = [
  ...SANDBAR.map(([x, z]) => [x, z, 0.1] as [number, number, number]),
  [...ll(98.772, 7.745), 0.2], [...ll(98.98, 7.6), 0.16], [...ll(98.99, 7.5), 0.14],
]

/** The longtail buzzing slowly round Phang Nga Bay, among the rocks: [lon, lat, east-west radius, north-south radius
 *  (m)]. */
export const BOAT_LOOPS: [number, number, number, number][] = [[98.53, 8.255, 0.32, 0.2]]
/** The dolphins out in the Andaman Sea. */
export const DOLPHINS = ll(98.44, 7.56)
/** A yacht with a pink sail on the open sea, going slowly round: [lon, lat], and the loop's east-west and north-south
 *  radius (m). */
export const YACHT = { at: ll(98.66, 7.6), rx: 0.38, rz: 0.2 }
/** The clouds over the hills (tap: a little rain): [lon, lat, height]. */
export const CLOUDS: [number, number, number][] = [
  [98.99, 8.3, 1.1],
  [99.12, 7.62, 0.72],
]
