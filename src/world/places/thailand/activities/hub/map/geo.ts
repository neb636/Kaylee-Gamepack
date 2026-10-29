// The Thailand map (plan: planning/around-the-world/thailand/thailand-map.html): where everything sits, in stage units
// (100 to a degree of longitude or latitude, north up). Pure data: no React, no three.js, so sections.ts can read it.
//
// The outline is Thailand's border and coasts, simplified (good enough for a five-year-old's map: the head in the
// north, Isan's square in the east, the Gulf, and the long tail down to Malaysia). The sea shapes sit on soft lavender
// land (the neighbours: Myanmar, Laos, Cambodia, Malaysia).

export type XY = [number, number]
export type LonLat = [number, number]

const LON0 = 96
const LAT1 = 21
/** The stage: lon 96-106.6, lat 5-21. Tall, like the country. */
export const STAGE = { w: 1060, h: 1600 }
export const proj = ([lon, lat]: LonLat): XY => [(lon - LON0) * 100, (LAT1 - lat) * 100]

/** Thailand's outline, clockwise from the far north (Mae Sai). Each stretch is named so the sea shapes can reuse it. */
const NORTH_EAST: LonLat[] = [
  [99.9, 20.45], [100.1, 20.35], [100.5, 20.15], [100.6, 19.6], [101.2, 19.6], [101.3, 19.0], [101.1, 18.4], [101.6, 17.8],
  [102.1, 17.95], [102.6, 17.9], [103.0, 18.3], [103.4, 18.4], [103.9, 18.3], [104.5, 17.6], [104.8, 16.9], [104.75, 16.2],
  [105.4, 15.8], [105.6, 15.1], [105.2, 14.35], [104.4, 14.35], [103.6, 14.4], [102.9, 14.2], [102.4, 13.6], [102.6, 12.6],
  [102.85, 12.0],
]
export const GULF_COAST: LonLat[] = [
  [102.9, 11.7], [102.4, 12.3], [101.8, 12.65], [101.0, 12.65], [100.9, 13.3], [100.6, 13.5], [100.0, 13.4], [99.95, 12.8],
  [99.6, 11.8], [99.2, 10.9], [99.2, 10.3], [99.3, 9.4], [99.8, 9.3], [100.3, 8.4], [100.4, 7.3], [100.6, 7.1], [101.0, 6.85],
  [101.5, 6.9], [102.1, 6.2],
]
const MALAYSIA: LonLat[] = [[101.8, 5.8], [101.1, 6.25], [100.8, 6.45], [100.2, 6.6]]
export const ANDAMAN_COAST: LonLat[] = [
  [100.1, 6.45], [99.7, 6.9], [99.4, 7.5], [99.0, 7.9], [98.6, 8.1], [98.3, 8.2], [98.25, 8.9], [98.35, 9.6], [98.6, 10.0],
]
const MYANMAR: LonLat[] = [
  [98.75, 10.7], [99.2, 11.3], [99.3, 11.9], [99.1, 12.6], [99.2, 13.2], [98.6, 13.9], [98.3, 14.6], [98.6, 15.3], [98.6, 16.0],
  [98.9, 16.4], [98.5, 17.0], [97.8, 17.8], [97.4, 18.5], [97.7, 18.9], [97.8, 19.6], [98.2, 19.7], [98.9, 19.8], [99.5, 20.1],
]
export const THAILAND: XY[] = [...NORTH_EAST, ...GULF_COAST, ...MALAYSIA, ...ANDAMAN_COAST, ...MYANMAR].map(proj)

/** The Andaman Sea (west): Myanmar's coast, Thailand's, then Malaysia's. It runs on far past the stage, so a wide
 *  screen shows more sea, not the stage's edge. */
export const ANDAMAN: XY[] = [
  [60, -20], [60, 16.6], [97.6, 16.5], [97.8, 15.0], [98.1, 13.5], [98.5, 12.0], [98.6, 10.5],
  ...ANDAMAN_COAST.slice().reverse(), [100.35, 5.5], [100.4, -20],
].map((p) => proj(p as LonLat))
/** The Gulf of Thailand (east) and the South China Sea past it. */
export const GULF: XY[] = [
  ...GULF_COAST, [102.4, 5.9], [103.1, 5.3], [103.4, 5.0], [103.6, -20], [140, -20], [140, 8.0], [106.6, 8.6], [105.1, 8.6], [104.8, 9.6], [104.5, 10.4],
  [103.6, 10.5], [103.2, 11.0],
].map((p) => proj(p as LonLat))
/** The Mekong along Laos (a ribbon on the land), and the Chao Phraya down to Bangkok. */
export const MEKONG: XY[] = ([[100.1, 20.35], [100.5, 20.15], [101.0, 19.95], [101.5, 18.0], [102.1, 17.95], [102.6, 17.9], [103.0, 18.3], [103.4, 18.4], [103.9, 18.3], [104.5, 17.6], [104.8, 16.9], [104.75, 16.2], [105.4, 15.8], [105.9, 14.8], [106.1, 13.6]] as LonLat[]).map(proj)
export const CHAO_PHRAYA: XY[] = ([[100.1, 15.7], [100.2, 15.0], [100.4, 14.4], [100.5, 13.8], [100.55, 13.55]] as LonLat[]).map(proj)
/** Hills (centre, radius), drawn as soft bumps: the north's mountains and the spine down the tail. */
export const HILLS: [XY, number][] = (
  [
    [[98.6, 19.2], 55], [99.3, 19.4], [100.2, 19.0], [101.0, 19.0], [98.4, 18.3], [99.5, 18.0], [100.6, 18.2], [98.9, 16.8],
    [98.9, 15.4], [99.2, 14.4], [99.6, 12.4], [98.9, 9.3], [99.6, 8.6],
  ] as ([LonLat, number] | LonLat)[]
).map((h) => (Array.isArray(h[0]) ? [proj(h[0] as LonLat), h[1] as number] : [proj(h as LonLat), 42]))
/** Islands in the Andaman: Phuket, the bay's rock towers, and in the Gulf: Samui. [centre, rx, ry]. */
export const ISLANDS: [XY, number, number][] = [
  [proj([98.33, 7.95]), 14, 26],
  [proj([98.55, 8.25]), 8, 8],
  [proj([98.65, 8.35]), 7, 9],
  [proj([98.75, 7.75]), 9, 7],
  [proj([100.0, 9.5]), 14, 13],
  [proj([99.95, 9.75]), 9, 8],
]

/** A pin she taps to go there: where it is, which activity's stamp it wears, its picture. */
export type PinId = 'bangkok' | 'krabi' | 'nan'
export interface Pin {
  id: PinId
  at: XY
  /** The activity whose stamp shows on it. */
  activity: string
  icon: string
  label: string
  color: string
}
export const PINS: Pin[] = [
  { id: 'nan', at: proj([100.78, 18.78]), activity: 'nan-trip', icon: '🏔️', label: 'Nan, the mountains', color: 'var(--mint)' },
  { id: 'bangkok', at: proj([100.52, 13.75]), activity: 'mall-trip', icon: '🏠', label: "Bangkok, Agong's house", color: 'var(--pink)' },
  { id: 'krabi', at: proj([98.9, 8.08]), activity: 'boat-trip', icon: '🚤', label: 'Krabi, the boat and the elephants', color: 'var(--sky)' },
]

/** Things to poke (tap them). */
export type PokeId = 'elephant' | 'clouds' | 'boat' | 'dolphins' | 'gibbon' | 'hornbill' | 'buffalo' | 'tuktuk' | 'palm'
export const POKES: { id: PokeId; at: XY; label: string }[] = [
  { id: 'elephant', at: proj([99.1, 17.6]), label: 'The elephant' },
  { id: 'clouds', at: proj([101.75, 19.35]), label: 'The rain cloud' },
  { id: 'gibbon', at: proj([98.95, 15.2]), label: 'The gibbon' },
  { id: 'buffalo', at: proj([103.0, 16.0]), label: 'The water buffalo' },
  { id: 'hornbill', at: proj([102.6, 13.4]), label: 'The hornbill' },
  { id: 'tuktuk', at: proj([101.9, 14.9]), label: 'The tuk-tuk' },
  { id: 'dolphins', at: proj([101.2, 10.3]), label: 'The dolphins' },
  { id: 'boat', at: proj([97.25, 9.3]), label: 'The longtail boat' },
  { id: 'palm', at: proj([99.3, 11.4]), label: 'The coconut palm' },
]
