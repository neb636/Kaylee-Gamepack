// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.md): where everything sits. The map is a toy
// board in 3D: one unit is one degree, x runs east, z runs south (north is up the screen), y is up. Pure data: no
// React, no three.js.
import type { LonLat } from './land'

/** The board's edges (degrees): Thailand in the middle, a strip of each neighbour and both seas round it. */
export const BOARD = { lon0: 96.7, lon1: 106.3, lat0: 5.25, lat1: 20.95 }
const LON_C = (BOARD.lon0 + BOARD.lon1) / 2
const LAT_C = (BOARD.lat0 + BOARD.lat1) / 2
/** A degree of longitude is a little shorter than one of latitude here (cos 13°). */
const KX = 0.975

export const toX = (lon: number) => (lon - LON_C) * KX
export const toZ = (lat: number) => LAT_C - lat
export const proj = ([lon, lat]: LonLat): [number, number] => [toX(lon), toZ(lat)]
export const toLon = (x: number) => x / KX + LON_C
export const toLat = (z: number) => LAT_C - z

/** Heights (y): the sea is 0, the neighbours are low paper land, Thailand stands up from them like a slice of cake. */
export const LEVEL = { floor: -0.22, paper: 0.07, thai: 0.5 }

/** Hills pushed up out of Thailand's top: [lon, lat, how wide (degrees), how high]. The north's mountains, the long
 *  range down the Myanmar border, the ridge between the plain and Isan, and the spine of the south. */
export const SWELLS: [number, number, number, number][] = [
  [98.6, 18.7, 0.75, 0.3], [99.4, 19.5, 0.6, 0.24], [100.2, 19.2, 0.55, 0.2], [100.95, 19.1, 0.6, 0.3], [101.0, 18.4, 0.5, 0.22],
  [99.3, 18.1, 0.6, 0.2], [98.3, 17.6, 0.55, 0.22], [98.8, 16.6, 0.5, 0.2], [98.9, 15.4, 0.55, 0.24], [99.0, 14.4, 0.45, 0.2],
  [99.4, 13.2, 0.35, 0.16], [99.45, 12.1, 0.25, 0.12], [101.2, 17.0, 0.45, 0.18], [101.5, 16.0, 0.4, 0.14], [101.8, 14.5, 0.4, 0.14],
  [98.9, 9.4, 0.3, 0.14], [99.5, 8.6, 0.3, 0.14], [100.0, 7.4, 0.3, 0.1], [102.3, 12.9, 0.3, 0.12],
]

/** Toy islands, bigger than life so she can see them: [lon, lat, east-west radius, north-south radius]. Koh Samet
 *  (really a speck off Rayong) sits a little further out so it doesn't touch the coast. */
export const TOY_ISLANDS: [number, number, number, number][] = [[101.62, 11.95, 0.3, 0.36]]
export const SAMET: LonLat = [101.62, 11.95]

/** Krabi's limestone towers standing in the Andaman Sea: [lon, lat, size]. */
export const KARSTS: [number, number, number][] = [
  [98.42, 7.72, 1.15], [98.0, 7.42, 0.9], [98.72, 7.3, 0.8], [98.16, 6.92, 1], [97.7, 7.95, 0.75], [98.6, 6.62, 0.7], [97.52, 7.02, 0.6],
]

/** A pin she taps to go there: where it is, which activity's stamp it wears. */
export type PinId = 'bangkok' | 'krabi' | 'nan' | 'samet'
export interface Pin {
  id: PinId
  at: LonLat
  /** The activity whose stamp shows on it. */
  activity: string
  label: string
  color: string
}
export const PINS: Pin[] = [
  { id: 'nan', at: [100.85, 18.85], activity: 'nan-trip', label: 'Nan, the mountains', color: '#8FE3C8' },
  { id: 'bangkok', at: [100.75, 14.25], activity: 'mall-trip', label: "Bangkok, Agong's house", color: '#FF8FB8' },
  { id: 'krabi', at: [98.75, 8.2], activity: 'boat-trip', label: 'Krabi, the boat and the elephants', color: '#7CC4F2' },
  { id: 'samet', at: SAMET, activity: 'samet-trip', label: 'Koh Samet, the island', color: '#FFD46B' },
]

/** Things to poke that Sparkle has something true to say about (lines.ts L.map.pokes). */
export type PokeId = 'elephant' | 'clouds' | 'boat' | 'dolphins' | 'gibbon' | 'hornbill' | 'buffalo' | 'tuktuk' | 'palm'
/** Things that only play: Sparkle's balloon, the sea turtle, the rice barge. */
export type ToyId = PokeId | 'balloon' | 'turtle' | 'barge'
export const POKES: { id: ToyId; at: LonLat; label: string }[] = [
  { id: 'elephant', at: [99.35, 17.15], label: 'The elephants' },
  { id: 'clouds', at: [101.9, 19.6], label: 'The rain cloud' },
  { id: 'gibbon', at: [99.0, 15.05], label: 'The gibbon' },
  { id: 'buffalo', at: [103.4, 16.3], label: 'The water buffalo' },
  { id: 'hornbill', at: [102.35, 14.75], label: 'The hornbill' },
  { id: 'tuktuk', at: [100.5, 16.55], label: 'The tuk-tuk' },
  { id: 'dolphins', at: [101.0, 9.9], label: 'The dolphins' },
  { id: 'boat', at: [97.75, 9.35], label: 'The longtail boat' },
  { id: 'palm', at: [99.15, 10.75], label: 'The coconut palm' },
  { id: 'balloon', at: [103.9, 8.3], label: "Sparkle's balloon" },
  { id: 'turtle', at: [102.8, 10.9], label: 'The sea turtle' },
  { id: 'barge', at: [100.35, 12.6], label: 'The rice barge' },
]
