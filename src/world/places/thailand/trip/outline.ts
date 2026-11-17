// Thailand's real outline, for the elephant map in Kaylee's room, the seat-back screen on the plane and the country
// below the plane window. From Natural Earth's 1:50m countries (public domain, naturalearthdata.com), the mainland
// simplified to 150 points (Douglas-Peucker, 0.05°) plus Phuket. Never generated: a picture model got Peru's shape
// wrong. Pure data (no three.js), [longitude, latitude] in degrees.
//
// Thai people often say the country looks like an elephant's head: the north is the head, the east bulge its ear, and
// the long south its trunk, curling down past Phang Nga Bay to Malaysia.

export type LonLat = [number, number]

export const THAILAND: LonLat[] = [
  [100.12, 20.32], [100.14, 20.25], [100.32, 20.39], [100.52, 20.18], [100.4, 19.76], [100.51, 19.55], [100.74, 19.51], [100.97, 19.61],
  [101.21, 19.55], [101.29, 18.98], [101.05, 18.44], [101.14, 18.14], [100.91, 17.58], [100.96, 17.54], [101.17, 17.5], [101.69, 17.89],
  [101.77, 18.03], [102.1, 18.21], [102.55, 17.97], [102.66, 17.82], [103.05, 18.03], [103.29, 18.41], [103.95, 18.32], [104.82, 17.3],
  [104.74, 16.88], [104.82, 16.47], [105.05, 16.16], [105.41, 15.99], [105.4, 15.83], [105.64, 15.66], [105.49, 15.26], [105.55, 14.93],
  [105.48, 14.53], [105.07, 14.23], [104.97, 14.37], [104.78, 14.43], [103.98, 14.36], [103.6, 14.42], [103.2, 14.33], [102.91, 14.14],
  [102.55, 13.59], [102.32, 13.54], [102.5, 12.67], [102.76, 12.43], [102.74, 12.09], [102.93, 11.71], [102.59, 12.2], [102.54, 12.11],
  [102.26, 12.39], [102.23, 12.33], [101.84, 12.64], [100.9, 12.65], [100.96, 13.43], [100.6, 13.57], [100.02, 13.35], [99.99, 13.24],
  [100.09, 13.05], [99.96, 12.69], [99.99, 12.17], [99.63, 11.46], [99.49, 10.89], [99.17, 10.32], [99.16, 9.73], [99.29, 9.41],
  [99.25, 9.27], [99.39, 9.21], [99.84, 9.29], [99.99, 8.59], [100.15, 8.44], [100.28, 8.27], [100.55, 7.23], [100.44, 7.28],
  [100.38, 7.54], [100.28, 7.55], [100.32, 7.72], [100.26, 7.77], [100.16, 7.73], [100.16, 7.6], [100.42, 7.19], [100.59, 7.18],
  [101.02, 6.86], [101.5, 6.87], [101.8, 6.47], [102.1, 6.24], [101.87, 5.83], [101.68, 5.78], [101.56, 5.91], [101.26, 5.79],
  [101.11, 5.64], [100.98, 5.77], [101.08, 5.96], [101.05, 6.24], [100.87, 6.25], [100.75, 6.46], [100.35, 6.55], [100.26, 6.68],
  [100.18, 6.67], [100.12, 6.44], [99.7, 6.88], [99.72, 7.11], [99.55, 7.22], [99.6, 7.36], [99.36, 7.37], [99.26, 7.62],
  [99.08, 7.72], [99.05, 7.89], [98.79, 8.06], [98.7, 8.26], [98.58, 8.34], [98.36, 8.19], [98.24, 8.42], [98.24, 8.77],
  [98.75, 10.35], [98.76, 10.66], [99.19, 11.11], [99.61, 11.78], [99.41, 12.55], [99.22, 12.74], [99.12, 13.03], [99.14, 13.72],
  [98.93, 14.05], [98.57, 14.36], [98.2, 14.98], [98.19, 15.2], [98.56, 15.37], [98.59, 16.05], [98.82, 16.18], [98.89, 16.35],
  [98.84, 16.42], [98.66, 16.33], [98.44, 16.98], [97.71, 17.8], [97.74, 17.94], [97.63, 18.29], [97.45, 18.36], [97.37, 18.52],
  [97.75, 18.59], [97.71, 18.93], [97.8, 19.13], [97.82, 19.46], [98.02, 19.75], [98.37, 19.69], [98.92, 19.77], [99.07, 20.1],
  [99.34, 20.08], [99.49, 20.15], [99.46, 20.36], [99.72, 20.33], [99.89, 20.42],
]

export const PHUKET: LonLat[] = [[98.41, 7.9], [98.3, 7.78], [98.3, 8.14], [98.43, 8.09]]

/** Places on the trips. */
export const PLACES = {
  /** Agong's house. */
  bangkok: [100.5, 13.75] as LonLat,
  /** Krabi airport (KBV), where the plane lands. */
  krabi: [98.99, 8.1] as LonLat,
  /** Nan Nakhon airport (NNT), in the mountains of the far north (the Nan road trip lands there). */
  nan: [100.78, 18.81] as LonLat,
  /** Phang Nga Bay, where the boat pin sits. */
  phangNga: [98.52, 8.22] as LonLat,
  /** The mountains in the north (bumps on the map below the plane). */
  north: [[98.9, 18.8], [99.8, 19.4], [100.6, 18.6], [98.6, 17.2], [101.1, 17.9]] as LonLat[],
}

/** Kaylee's crayon on the view from the plane, which makes Thailand an elephant's head: the ear round the northeast
 *  bulge, and the eye in the north (the long south is the trunk). */
export const ELEPHANT: { ear: LonLat[]; eye: LonLat } = {
  ear: [[101.9, 17.4], [103.4, 17.75], [104.45, 16.9], [104.85, 15.6], [104.2, 14.75], [102.9, 14.6], [102.05, 15.4], [101.8, 16.5]],
  eye: [99.7, 17.55],
}

/** The outline's box, with a little sea round it. */
export const BOUNDS = { west: 97.0, east: 106.0, south: 5.3, north: 20.8 }
/** Degrees of longitude are shorter than degrees of latitude this far north (cos 13°). */
export const LON_SCALE = 0.974

/** A point on a flat map of Thailand: x east, y north, in "latitude degrees" from the middle of BOUNDS. */
export function flat([lon, lat]: LonLat): [number, number] {
  return [(lon - (BOUNDS.west + BOUNDS.east) / 2) * LON_SCALE, lat - (BOUNDS.south + BOUNDS.north) / 2]
}
/** The flat map's size (same units). */
export const FLAT_SIZE = { w: (BOUNDS.east - BOUNDS.west) * LON_SCALE, h: BOUNDS.north - BOUNDS.south }
