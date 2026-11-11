// The world board: where everything sits. The board is a toy map in 3D: one unit is ten degrees of longitude, x runs
// east, z runs south (north is up the screen, always), y is up. The map is Miller's (a gentler Mercator): north stays
// straight up everywhere and countries keep their familiar shapes. Pure numbers: no React, no three.js.
import { COUNTRIES, rings } from './land'
import { BOARD_PLACES, EDGE, type BoardPlace, type LonLat } from './places'

/** Degrees of longitude in one unit of the board. */
const UNIT = 10
const RAD = Math.PI / 180
/** Miller's stretch (1 would be Mercator). */
const K = 0.8
/** Latitude as a height on the map, in degrees at the equator. */
const mill = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (K * lat * RAD) / 2)) / K / RAD
const unmill = (m: number) => ((2 * Math.atan(Math.exp(m * K * RAD)) - Math.PI / 2) / K) / RAD

const LON_C = (EDGE.lon0 + EDGE.lon1) / 2
const M0 = mill(EDGE.lat0)
const M1 = mill(EDGE.lat1)
const M_C = (M0 + M1) / 2

export const toX = (lon: number) => (lon - LON_C) / UNIT
export const toZ = (lat: number) => (M_C - mill(lat)) / UNIT
export const toLon = (x: number) => x * UNIT + LON_C
export const toLat = (z: number) => unmill(M_C - z * UNIT)
export type XZ = [x: number, z: number]
export const proj = ([lon, lat]: LonLat): XZ => [toX(lon), toZ(lat)]

/** The board's size and edges (units). */
export const BOARD = { w: (EDGE.lon1 - EDGE.lon0) / UNIT, d: (M1 - M0) / UNIT, x0: toX(EDGE.lon0), x1: toX(EDGE.lon1), z0: toZ(EDGE.lat1), z1: toZ(EDGE.lat0) }

/** Heights (y): the sea is 0, the continents are low land, her countries stand up from them like slices of cake. */
export const LEVEL = { floor: -0.3, land: 0.1, piece: 0.5 }

/** Mountain ranges pushed up out of the low land: [lon, lat, how wide (degrees), how high]. */
export const SWELLS: [number, number, number, number][] = [
  // The Rockies and the Sierra Madre.
  [-122, 47, 5, 0.1], [-112, 41, 6, 0.12], [-106, 35, 5, 0.1], [-103, 24, 4, 0.08], [-150, 62, 5, 0.1],
  // The Andes.
  [-77, 2, 3, 0.1], [-67, -19, 4, 0.13], [-70, -31, 3.5, 0.13], [-72, -43, 3, 0.1],
  // The Alps, the Caucasus, the Urals, Scandinavia.
  [8, 46.5, 3, 0.09], [43, 42.5, 3, 0.09], [59, 58, 4, 0.07], [12, 63, 4, 0.07],
  // The Himalayas' foothills and the ranges of Central Asia, Iran and Siberia.
  [76, 35, 5, 0.13], [70, 39, 4, 0.1], [53, 33, 5, 0.08], [93, 50, 6, 0.09], [130, 62, 7, 0.07],
  // Ethiopia, the Atlas, the Drakensberg; New Guinea and New Zealand.
  [39, 9, 4, 0.1], [-4, 32, 3.5, 0.08], [28, -29, 3, 0.08], [141, -5, 3, 0.08], [170, -44, 2, 0.08],
]

export type ContinentId = 'northAmerica' | 'southAmerica' | 'europe' | 'africa' | 'asia' | 'australia' | 'antarctica'

/** Which continent a spot of land belongs to. The lines between them run where the map-makers draw them (the Urals,
 *  the Caucasus, the Mediterranean, the Red Sea, Panama), near enough for a map this size. */
export function continentAt(lon: number, lat: number): ContinentId {
  if (lat < -58) return 'antarctica'
  // East of the board's cut it is still Russia's tip.
  if (lon > 180) return 'asia'
  // The Americas (Greenland is North America's; Iceland is Europe's).
  if (lon < -30 || (lat > 67 && lon < -10)) return lon > -77.6 && lat < 12.6 ? 'southAmerica' : 'northAmerica'
  // Australia, New Zealand, New Guinea and the Pacific's islands.
  if ((lon > 112 && lat < -10.4) || (lon > 130.8 && lat < 0.5) || (lon > 150 && lat < 12)) return 'australia'
  // Africa: south of the Mediterranean, west of the Red Sea.
  const med = lon < 1 ? 36 : lon < 11.6 ? 37.6 : lon < 20 ? 35 : 34
  const redSea = lat > 29.5 ? 34.9 : lat > 12.6 ? 34.9 + ((29.5 - lat) * 8.4) / 16.9 : 51.6
  if (lat < med && lon < redSea) return 'africa'
  // Europe: west of the Urals and the Caspian, north of the Caucasus and the Black Sea's far shore.
  if (lon < 60) {
    const south = lon < 26 ? -90 : lon < 29.2 ? 40.4 : lon < 41 ? 42.6 : lon < 50 ? 43 : 47
    if (lat > south) return 'europe'
  }
  return 'asia'
}

/** One of her countries, as the board shows it. */
export interface Piece extends BoardPlace {
  /** Its outline on the board (x, z), the mainland first. */
  rings: XZ[][]
  /** Its middle and how far it reaches from there. */
  center: XZ
  half: XZ
  /** Where the pin's tip touches it. */
  pin: XZ
  /** A spot of the real world as this piece shows it (it may be drawn bigger than life). */
  spot: (p: LonLat) => XZ
}

function piece(place: BoardPlace): Piece {
  const raw = rings(COUNTRIES[place.id] ?? []).map((r) => r.map(proj))
  let x0 = Infinity
  let x1 = -Infinity
  let z0 = Infinity
  let z1 = -Infinity
  // (Its middle is the mainland's: Italy's doesn't drift toward Sardinia.)
  for (const [x, z] of raw[0] ?? [proj(place.at)]) {
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    z0 = Math.min(z0, z)
    z1 = Math.max(z1, z)
  }
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const k = place.grow ?? 1
  const grow = ([x, z]: XZ): XZ => [cx + (x - cx) * k, cz + (z - cz) * k]
  const shown = raw.map((r) => r.map(grow))
  let hx = 0.6
  let hz = 0.6
  for (const r of shown)
    for (const [x, z] of r) {
      hx = Math.max(hx, Math.abs(x - cx))
      hz = Math.max(hz, Math.abs(z - cz))
    }
  return { ...place, rings: shown, center: [cx, cz], half: [hx, hz], pin: grow(proj(place.at)), spot: (p) => grow(proj(p)) }
}

export const PIECES: Piece[] = BOARD_PLACES.map(piece)

/** Where Sparkle's balloon waits before she has flown anywhere: over the middle of North America. */
export const BALLOON_HOME: LonLat = [-90, 33]

/** Things in the sea that answer a poke. */
export type PokeId = 'whale' | 'sailboat' | 'balloon' | 'orca' | 'turtle'
export const POKES: { id: PokeId; at: LonLat; label: string }[] = [
  { id: 'whale', at: [-38, 30], label: 'The whale' },
  { id: 'sailboat', at: [72, -18], label: 'The sailboat' },
  { id: 'orca', at: [-150, 36], label: 'The orca' },
  { id: 'turtle', at: [-125, -22], label: 'The sea turtle' },
  { id: 'balloon', at: BALLOON_HOME, label: "Sparkle's balloon" },
]

/** Where the compass rose is painted: the empty South Pacific. */
export const COMPASS: LonLat = [-128, -52]
