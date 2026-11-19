// The Bangkok map (hub section `bangkok`; notes: planning/around-the-world/thailand/bangkok-map.md), in meters: a toy
// diorama of the middle of Bangkok floating in the sky, about 14 km across. Where everything stands: the places she
// can go, the pins over them, the toys to poke, the towers, the bridges, the skytrain and the boats. Everything is where
// it really is (geo.ts is the real river, khlongs, roads and parks from OpenStreetMap; the places are put down by
// their longitude and latitude), the toys a little bigger than life. So a new place is one line: its `ll(lon, lat)`.
// Pure data (no three.js): sections.ts can read it.
//
// Seen from above at a slant, north up the screen (-z):
//
//   Rama VIII Bridge                              Baiyoke's tower                      Sparkle's balloon
//       the old town      the flower market        Siam's towers        Sukhumvit's towers
//    Thonburi's khlongs     Chinatown's gate          Lumphini Park (the lake)     Benjakitti Park
//                 ICONSIAM  ~river~  the skytrain    Mahanakhon
//                         Asiatique's wheel                                        the port's cranes
//                                           Central Rama 3, the Thailand house        ~ the river's big loop ~
//                      Rama IX Bridge                                        Bang Krachao, the green lung
//                                            the Bhumibol bridges
import type { LonLat } from './geo'

export type XZ = [number, number]

/** The board's edges (degrees). */
export const EDGES = { lon0: 100.468, lon1: 100.602, lat0: 13.65, lat1: 13.776 }
/** Meters of board per degree (a degree of longitude is a little shorter here: cos 13.7°). One meter of board is
 *  about 2.6 km of city. */
const K = 43
const KX = K * 0.9715
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

/** Heights: the river's top is 0. Bangkok is flat: the city stands a little way up out of the water on low banks. */
export const LEVEL = { floor: -0.1, land: 0.07 }
/** How wide the bank's cut edge is (meters), from the water up to its top. */
export const CLIFF_W = 0.022
/** The river is drawn this much wider on each bank than it really is (meters): the Chao Phraya is what makes the
 *  board Bangkok, so it's the biggest shape on it, with room for the toy boats. */
export const RIVER_FAT = 0.03

// ---------------------------------------------------------------- the places

/** The places on the map she can go to. `house` is the Thailand house (near Central Rama 3, for now), `iconsiam` the
 *  mall day (activity `mall-trip`). `balloon` is Sparkle's balloon: back up to the Thailand map. */
export type PlaceId = 'house' | 'iconsiam' | 'balloon'

/** Where each place's toy stands. `scale`: how much bigger than the board the toy is. (ICONSIAM stands a little back
 *  from its real spot on the bank, so the whole toy is on dry land.) */
export const PLACES: Record<PlaceId, { at: XZ; label: string; scale: number }> = {
  house: { at: ll(100.5265, 13.6925), label: 'The Thailand house', scale: 1.7 },
  iconsiam: { at: ll(100.5046, 13.7272), label: 'ICONSIAM, the mall', scale: 1.9 },
  balloon: { at: ll(100.5905, 13.7655), label: "Sparkle's balloon, back to the Thailand map", scale: 1 },
}
export const PLACE_IDS = Object.keys(PLACES) as PlaceId[]

/** The pins: a pink pin floats over each place she can go to, a toy of what she does there on its head (a little
 *  house with a heart, a slide and a slice of pizza). The balloon needs none: it is its own picture. `lift`: how
 *  high over the ground the pin's point hangs (clear of the toy under it). */
export const PINS = {
  house: { at: PLACES.house.at, lift: 0.3, label: 'To the house', place: 'house' },
  // (In front of the mall, low: up over its towers it would hang in front of Chinatown's gate on the screen.)
  iconsiam: { at: [PLACES.iconsiam.at[0] - 0.06, PLACES.iconsiam.at[1] + 0.3], lift: 0.1, label: 'To the mall', place: 'iconsiam' },
} satisfies Record<string, { at: XZ; lift: number; label: string; place: PlaceId }>
export type PinId = keyof typeof PINS
export const PIN_IDS = Object.keys(PINS) as PinId[]

/** Where the mall day's stamp floats once she has it: beside ICONSIAM's pin, on its west ([east, up, south] of the pin's point, m). */
export const STAMP_OFF: [number, number, number] = [-0.36, 0.5, 0.02]
/** How high Sparkle's balloon floats over the board. */
export const BALLOON_Y = 0.55

// ---------------------------------------------------------------- the toys, the pokes

/** What stands on the board to poke. Asiatique and Chinatown are the next places (making one a real place gives it a
 *  pin: see the notes); the rest are the city's landmarks. Each is where it really is. */
export const SPOTS = {
  /** Asiatique The Riverfront: its big wheel by the river. */
  asiatique: ll(100.5062, 13.7018),
  /** Chinatown (Yaowarat): the red gate at Odeon Circle and its lanterns. */
  chinatown: ll(100.5118, 13.7392),
  /** Lumphini Park: the lake, a swan boat and the big monitor lizard. */
  lumphini: ll(100.5417, 13.7305),
  /** King Power Mahanakhon: the tower that looks like it's made of blocks. */
  mahanakhon: ll(100.5282, 13.7228),
  /** Central Rama 3: the mall near the house. */
  rama3: ll(100.5392, 13.6992),
  /** Pak Khlong Talat: the flower market by the river. */
  flowers: ll(100.4985, 13.7438),
  /** Khlong Toei port: cranes and bright boxes. */
  port: ll(100.5775, 13.7065),
  /** Bang Krachao, the green lung in the river's loop: the bird tower in its park. */
  krachao: ll(100.566, 13.6795),
  /** The night market on Ratchadaphisek Road: rows of tents in every color. */
  tents: ll(100.5698, 13.7668),
  /** A floating market on Khlong Dao Khanong, out in Thonburi: boats heaped with fruit under big umbrellas. */
  floating: ll(100.4772, 13.691),
  /** Bang Mot's orange orchards, south-west of the river. */
  orchard: ll(100.4872, 13.6672),
} satisfies Record<string, XZ>
export type SpotId = keyof typeof SPOTS

/** The tall towers, in the districts they really stand in: [lon, lat, height (m), look]. `look` picks the shape
 *  (diorama.ts tower()); a few are real ones: Baiyoke's tower with its round crown ('crown'), the riverside tower
 *  with the gold dome ('dome'). Tight bunches make the skyline (Silom and Sathon round Mahanakhon, Siam, Sukhumvit,
 *  and a little one at Rama 9): the rest of the city is left low, so the bunches read from across the board. (diorama.ts leaves out any that would stand on a place, a spot or the water.) */
export const TOWERS: [number, number, number, number | 'crown' | 'dome'][] = [
  // Silom and Sathon, round Mahanakhon.
  [100.5345, 13.7243, 0.46, 0], [100.5318, 13.7188, 0.56, 1], [100.5382, 13.7202, 0.4, 2], [100.5228, 13.7183, 0.4, 3], [100.5445, 13.7226, 0.48, 4],
  [100.5178, 13.7228, 0.5, 'dome'],
  // Siam, Ratchaprasong and Pratunam.
  [100.5404, 13.7545, 0.86, 'crown'], [100.5349, 13.7475, 0.38, 2], [100.5412, 13.7472, 0.48, 0], [100.5468, 13.7436, 0.54, 1], [100.5486, 13.7505, 0.4, 4],
  // Rama 9, where Ratchadaphisek Road meets Rama IX Road.
  // (Either side of the night market, not in front of it: from her side a tower hides what's behind it.)
  [100.5585, 13.7578, 0.48, 3], [100.5768, 13.7556, 0.4, 2],
  // Sukhumvit: Asok, Phrom Phong, Thong Lo, Ekkamai.
  [100.5604, 13.7382, 0.56, 1], [100.5655, 13.7338, 0.44, 0], [100.5702, 13.7318, 0.6, 4], [100.5745, 13.7268, 0.46, 2], [100.5798, 13.7252, 0.38, 3], [100.586, 13.72, 0.44, 1],
]

/** The bridges over the river: [lon, lat, kind]. 'harp': Rama VIII's one tall leaning tower and its fan of cables.
 *  'stay': Rama IX's two yellow towers. 'diamond': the Bhumibol bridges' golden diamonds. 'truss': the old green steel
 *  bridges (the Memorial Bridge, Krung Thep Bridge). 'rail': Taksin Bridge, the skytrain down its middle. (Each
 *  crosses the river square on: diorama.ts works out which way from the river's middle line.) */
export const BRIDGES: [number, number, 'harp' | 'stay' | 'diamond' | 'truss' | 'rail'][] = [
  [100.4969, 13.7691, 'harp'],
  [100.4975, 13.7392, 'truss'],
  [100.5127, 13.7187, 'rail'],
  [100.4921, 13.701, 'truss'],
  [100.5177, 13.6825, 'stay'],
  [100.54, 13.6743, 'diamond'],
  [100.5398, 13.6575, 'diamond'],
]

/** The skytrain (the BTS): its real stations in order, west to east. Thonburi, over the river on Taksin Bridge, up
 *  Silom to Siam, then out along Sukhumvit. The toy train runs back and forth along it on its pillars. */
export const SKYTRAIN: LonLat[] = [
  [100.4765, 13.7141], [100.486, 13.7192], [100.4952, 13.7211], [100.5029, 13.7208], [100.5141, 13.7188], [100.5216, 13.7193],
  [100.5293, 13.7238], [100.5343, 13.7285], [100.5394, 13.7394], [100.5341, 13.7456], [100.543, 13.7441], [100.5489, 13.7431],
  [100.5553, 13.7406], [100.5604, 13.737], [100.5697, 13.7305], [100.5785, 13.7243], [100.5852, 13.7195], [100.5912, 13.7152], [100.6005, 13.7062],
]
/** How high the skytrain's track runs over the ground (m). */
export const TRACK_Y = 0.13

/** Rama IV Road, from the old station out past Lumphini Park: a tuk-tuk putters up and down it. */
export const TUKTUK_ROAD: LonLat[] = [[100.5172, 13.7385], [100.53, 13.7325], [100.5375, 13.7275], [100.546, 13.7245], [100.559, 13.7195], [100.58, 13.7125]]

/** Rama III Road, round the river's bend past Central Rama 3 and the house: a hot pink taxi drives up and down it. */
export const TAXI_ROAD: LonLat[] = [[100.5457, 13.7008], [100.5475, 13.6922], [100.5481, 13.684], [100.5466, 13.6778], [100.5444, 13.6749], [100.5415, 13.6732], [100.539, 13.673], [100.5369, 13.6734], [100.5334, 13.6751], [100.5259, 13.6818], [100.5183, 13.6869], [100.5117, 13.6893], [100.5053, 13.6898]]

/** Khlong Bangkok Yai, over in Thonburi: a fruit seller paddles her boat up and down it. */
export const FRUIT_KHLONG: LonLat[] = [[100.471, 13.7227], [100.4733, 13.7225], [100.4763, 13.7224], [100.4794, 13.7229], [100.4844, 13.7249], [100.4854, 13.7273], [100.4863, 13.7325], [100.4875, 13.7357], [100.4893, 13.7393]]

/** The boats on the river, each somewhere along its middle line (geo.ts RIVER_LINE): what it is, where it starts
 *  (0 north .. 1 south), how fast it goes (m/s; minus: upstream) and how far to one side it keeps (m). The longtails
 *  are the river's own boats: a striped roof, ribbons on the nose, a long propeller out the back. */
export const BOATS: { kind: 'express' | 'barge' | 'longtail'; at: number; speed: number; side: number }[] = [
  { kind: 'express', at: 0.2, speed: 0.11, side: 0.034 },
  { kind: 'barge', at: 0.62, speed: -0.045, side: -0.036 },
  { kind: 'longtail', at: 0.84, speed: 0.15, side: 0.032 },
  { kind: 'longtail', at: 0.42, speed: -0.13, side: -0.034 },
  { kind: 'longtail', at: 0.06, speed: 0.17, side: -0.03 },
]

/** Khlong Saen Saep, right across the city: its long fast boat runs up and down it (the khlong's own bus). */
export const CANAL: LonLat[] = [[100.5975, 13.7413], [100.5594, 13.7484], [100.5479, 13.7483], [100.5372, 13.7496], [100.5337, 13.7491], [100.5275, 13.7496], [100.5253, 13.7492], [100.52, 13.7523], [100.5173, 13.7531]]

/** The roads with traffic on them (real ones, out where the city is quiet): little cars in taxi colors drive up and
 *  down each. [the road, how many cars]. */
export const TRAFFIC: [LonLat[], number][] = [
  // Rama IX Road and Ratchadaphisek Road, north-east.
  [[[100.5648, 13.7561], [100.5852, 13.7542], [100.605, 13.7476]], 4],
  [[[100.5649, 13.7562], [100.5664, 13.7613], [100.573, 13.7704], [100.574, 13.787]], 3],
  // Phetchaburi Road, across the north.
  [[[100.6009, 13.741], [100.5693, 13.7483], [100.5545, 13.75], [100.5448, 13.7495], [100.5411, 13.7499], [100.5203, 13.7571]], 5],
  // Rama II Road and Suk Sawat Road, south-west.
  [[[100.452, 13.6702], [100.4666, 13.6789], [100.4882, 13.6852]], 3],
  [[[100.5279, 13.6363], [100.5155, 13.6668], [100.4953, 13.6799], [100.4822, 13.6892], [100.4811, 13.6911], [100.4818, 13.6938]], 5],
  // Charan Sanit Wong Road, down the west.
  [[[100.4843, 13.7764], [100.4694, 13.7582], [100.4711, 13.7362], [100.4734, 13.7309]], 4],
]

/** Orchard groves: rows of little fruit trees standing in Thonburi's and the south's orchards ([lon, lat, rows,
 *  trees in a row]). */
export const GROVES: [number, number, number, number][] = [
  [100.4795, 13.6745, 2, 4],
  [100.5005, 13.6605, 3, 4],
  [100.4745, 13.7065, 2, 4],
  [100.4775, 13.7385, 2, 3],
  [100.5275, 13.6608, 2, 4],
]

/** Sanam Luang, the big open field in the old town: kites fly over it. Where each kite's string is held, how high
 *  the kite flies (m) and which kite it is ('star': the big chula; 'diamond': the little pakpao with its long tail). */
export const SANAM_LUANG: XZ = ll(100.4931, 13.7551)
export const KITES: { at: XZ; high: number; kind: 'star' | 'diamond' }[] = [
  { at: [SANAM_LUANG[0] - 0.1, SANAM_LUANG[1] + 0.02], high: 0.3, kind: 'diamond' },
  { at: [SANAM_LUANG[0] + 0.02, SANAM_LUANG[1] - 0.04], high: 0.44, kind: 'star' },
  { at: [SANAM_LUANG[0] + 0.12, SANAM_LUANG[1] + 0.07], high: 0.24, kind: 'diamond' },
]

/** Where the river's big loop holds Bang Krachao: the jungle is painted and planted inside these blobs
 *  ([lon, lat, radius in degrees]). */
export const JUNGLE: [number, number, number][] = [
  [100.566, 13.683, 0.017],
  [100.578, 13.674, 0.014],
  [100.555, 13.693, 0.009],
  [100.572, 13.693, 0.009],
  [100.585, 13.684, 0.007],
]

/** The clouds over the city (tap: a little rain): [lon, lat, height]. */
export const CLOUDS: [number, number, number][] = [
  [100.482, 13.742, 1.05],
  [100.574, 13.745, 1.2],
]

/** The old town and Chinatown, inside the river's first bend: low and close-built, so its shophouse rows stand closer
 *  together than anywhere else ([middle, how far out it reaches (m)]). */
export const OLD_TOWN: { at: XZ; r: number } = { at: ll(100.503, 13.75), r: 0.75 }

/** Where the map's compass is painted: the quiet corner out past the orchards, south-west. */
export const COMPASS: { at: XZ; r: number } = { at: [BOARD.x0 + 0.4, BOARD.z1 - 0.4], r: 0.25 }
