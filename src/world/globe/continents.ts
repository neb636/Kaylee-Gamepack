// The home globe's Earth: rough continent outlines (a toy's map, not an atlas), the world map's continent colors (so the
// globe and the passport, the shelf and the old flat map all agree), and where each country sits on it. Pure data and a
// little math, no three.js.

export type Pt = [lon: number, lat: number]
export type ContinentKey = 'northAmerica' | 'southAmerica' | 'europe' | 'africa' | 'asia' | 'australia' | 'antarctica'

/** The world map's continent colors (src/world/assets/bg-world-map.webp). */
export const LAND = {
  northAmerica: '#8FE3C8',
  southAmerica: '#FFC2A8',
  europe: '#C9B6F5',
  asia: '#FF9EC4',
  africa: '#FBEA9A',
  australia: '#FFB98A',
  ice: '#FFFFFF',
} as const

export const OCEAN = '#8CD2F6'

const NORTH_AMERICA: Pt[] = [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-100, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 58], [-82, 53], [-78, 58], [-70, 60], [-62, 57], [-56, 52], [-60, 47], [-66, 44], [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-92, 19], [-88, 21], [-87, 16], [-83, 15], [-83, 10], [-79, 9], [-77, 8], [-80, 7], [-86, 11], [-92, 15], [-105, 20], [-110, 24], [-112, 29], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-126, 50], [-132, 55], [-140, 60], [-148, 61], [-155, 58], [-162, 58], [-165, 62]]
const GREENLAND: Pt[] = [[-55, 60], [-48, 61], [-42, 60], [-38, 65], [-22, 70], [-20, 76], [-18, 80], [-30, 83], [-45, 83], [-60, 82], [-70, 78], [-62, 76], [-56, 72], [-53, 67]]
const SOUTH_AMERICA: Pt[] = [[-77, 8], [-72, 12], [-63, 11], [-60, 8], [-52, 4], [-50, 0], [-44, -2], [-35, -5], [-35, -9], [-39, -14], [-40, -22], [-48, -26], [-53, -34], [-58, -35], [-57, -38], [-62, -40], [-65, -45], [-67, -48], [-69, -52], [-68, -55], [-72, -54], [-75, -50], [-74, -42], [-73, -35], [-71, -28], [-70, -18], [-76, -14], [-80, -6], [-81, -2], [-80, 1]]
const AFRICA: Pt[] = [[-17, 15], [-17, 21], [-13, 27], [-10, 30], [-6, 35], [0, 36], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [34, 28], [37, 22], [39, 16], [43, 12], [51, 12], [51, 10], [47, 4], [42, -2], [40, -10], [40, -16], [35, -20], [35, -25], [32, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -18], [13, -10], [9, -2], [9, 4], [5, 6], [0, 5], [-8, 4], [-13, 8], [-15, 11]]
const ARABIA: Pt[] = [[35, 32], [35, 28], [39, 22], [43, 13], [45, 13], [52, 16], [57, 19], [60, 22], [56, 26], [51, 24], [48, 30], [44, 30]]
const EURASIA: Pt[] = [[-10, 36], [-9, 43], [-2, 44], [-2, 48], [-5, 48], [0, 50], [8, 54], [8, 57], [5, 59], [5, 62], [12, 66], [16, 69], [25, 71], [30, 70], [40, 67], [44, 68], [60, 69], [70, 73], [80, 73], [100, 77], [115, 74], [130, 72], [142, 72], [160, 70], [170, 70], [180, 68], [180, 65], [175, 62], [163, 60], [160, 55], [156, 51], [155, 58], [143, 59], [137, 54], [141, 50], [140, 45], [132, 43], [129, 40], [127, 35], [122, 40], [118, 38], [122, 31], [120, 25], [110, 21], [108, 16], [109, 12], [105, 9], [100, 13], [100, 8], [104, 1], [98, 8], [98, 16], [94, 17], [92, 22], [87, 22], [80, 15], [78, 8], [73, 17], [72, 21], [67, 24], [62, 25], [57, 26], [52, 28], [48, 30], [44, 37], [36, 37], [27, 37], [26, 40], [23, 38], [22, 37], [20, 40], [19, 42], [13, 45], [12, 44], [16, 41], [18, 40], [15.5, 38], [12, 41.5], [10, 44], [3, 43], [-2, 37]]
const AUSTRALIA: Pt[] = [[114, -22], [114, -26], [115, -34], [118, -35], [124, -34], [129, -32], [135, -35], [138, -35], [140, -38], [146, -39], [150, -37], [153, -32], [153, -25], [146, -19], [145, -15], [142, -11], [141, -17], [136, -15], [137, -12], [132, -11], [129, -15], [126, -14], [122, -17], [118, -20]]

/** An island as an ellipse: centre, half-width and half-height in degrees, turned by `turn` degrees. */
function isle(lon: number, lat: number, rx: number, ry: number, turn = 0, n = 14): Pt[] {
  const t = (turn * Math.PI) / 180
  const out: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const x = Math.cos(a) * rx
    const y = Math.sin(a) * ry
    out.push([lon + x * Math.cos(t) - y * Math.sin(t), lat + x * Math.sin(t) + y * Math.cos(t)])
  }
  return out
}

/** Antarctica: land all the way round the bottom, with the peninsula reaching up toward South America. */
function antarctica(): Pt[] {
  const out: Pt[] = []
  for (let lon = -180; lon < 180; lon += 6) {
    const peninsula = Math.abs(lon + 62) < 14 ? 7 * (1 - Math.abs(lon + 62) / 14) : 0
    out.push([lon, -70 + 2.5 * Math.sin((lon * 3 * Math.PI) / 180) + 1.5 * Math.cos((lon * 5 * Math.PI) / 180) + peninsula])
  }
  return out
}

/** The sea ice round the North Pole: a thin white cap (where Pola lives). */
function arcticIce(): Pt[] {
  const out: Pt[] = []
  for (let lon = -180; lon < 180; lon += 8) out.push([lon, 82.5 + 1.6 * Math.sin((lon * 4 * Math.PI) / 180) + Math.cos((lon * 7 * Math.PI) / 180)])
  return out
}

export interface Landmass {
  continent: ContinentKey
  outline: Pt[]
  /** How far it stands up from the sea (the globe is 1). */
  height: number
  /** Ice: white all over. */
  ice?: boolean
  /** Big enough to grow trees on. */
  trees?: boolean
}

const H = 0.032
export const LANDMASSES: Landmass[] = [
  { continent: 'northAmerica', outline: NORTH_AMERICA, height: H, trees: true },
  { continent: 'northAmerica', outline: GREENLAND, height: H * 1.1, ice: true },
  { continent: 'northAmerica', outline: isle(-95, 75, 18, 3.6), height: H * 0.8 },
  { continent: 'northAmerica', outline: isle(-72, 70, 7, 3.6, -30), height: H * 0.8 },
  { continent: 'northAmerica', outline: isle(-79, 21.7, 5, 1.1, -12), height: H * 0.8 },
  { continent: 'southAmerica', outline: SOUTH_AMERICA, height: H, trees: true },
  { continent: 'africa', outline: AFRICA, height: H, trees: true },
  { continent: 'africa', outline: isle(47, -19, 2.4, 6, 15), height: H * 0.8 },
  { continent: 'asia', outline: ARABIA, height: H },
  { continent: 'asia', outline: EURASIA, height: H, trees: true },
  { continent: 'europe', outline: isle(-2, 54, 2.6, 4.6), height: H * 0.85 },
  { continent: 'europe', outline: isle(-8, 53.2, 1.8, 1.8), height: H * 0.8 },
  { continent: 'europe', outline: isle(-19, 65, 4, 1.6), height: H * 0.8 },
  { continent: 'asia', outline: isle(137.5, 36.5, 2.4, 5.4, 38), height: H * 0.85 },
  { continent: 'asia', outline: isle(142.5, 43.4, 2, 1.8), height: H * 0.8 },
  { continent: 'asia', outline: isle(121.5, 12.5, 2, 4.2), height: H * 0.8 },
  { continent: 'asia', outline: isle(102, 0, 6.2, 1.7, -40), height: H * 0.8 },
  { continent: 'asia', outline: isle(114, 0, 4, 3.6), height: H * 0.85 },
  { continent: 'asia', outline: isle(120.5, -2, 1.8, 2.6), height: H * 0.8 },
  { continent: 'asia', outline: isle(110, -7.3, 5, 1.1), height: H * 0.8 },
  { continent: 'asia', outline: isle(80.7, 7.8, 1.2, 1.7), height: H * 0.8 },
  { continent: 'australia', outline: AUSTRALIA, height: H, trees: true },
  { continent: 'australia', outline: isle(140, -5.5, 8, 2.6, -12), height: H * 0.85 },
  { continent: 'australia', outline: isle(146.5, -42, 1.6, 1.4), height: H * 0.8 },
  { continent: 'australia', outline: isle(174, -39.5, 1.7, 3.2, 30), height: H * 0.85 },
  { continent: 'australia', outline: isle(169.5, -45, 2, 2.6, 30), height: H * 0.85 },
  { continent: 'antarctica', outline: antarctica(), height: H * 1.6, ice: true },
  // The Arctic has no land under its ice; it floats, so it stands lower.
  { continent: 'antarctica', outline: arcticIce(), height: H * 0.55, ice: true },
]

/** Where Europe ends and Asia begins (they're one landmass, painted two colors): a rough line from the Arctic down the
 *  Urals, round the Caspian and the Black Sea. */
export const EUROPE_EDGE: Pt[] = [[62, 78], [60, 69], [59, 62], [60, 56], [57, 51], [50, 47], [47, 42], [41, 41], [29, 41], [26, 37]]
/** Inside Europe's colour: west of the edge (and north of the Mediterranean). */
export function inEurope(lon: number, lat: number) {
  if (lat < 35 || lon < -30) return false
  for (let i = 0; i < EUROPE_EDGE.length - 1; i++) {
    const [x1, y1] = EUROPE_EDGE[i]
    const [x2, y2] = EUROPE_EDGE[i + 1]
    if (lat <= y1 && lat >= y2) return lon < x1 + ((lat - y1) / (y2 - y1)) * (x2 - x1)
  }
  return false
}

/** Rivers painted on the land, [lon, lat] from the source to the sea. */
export const RIVERS: Pt[][] = [
  // The Nile, through Egypt.
  [[33, -2], [32, 5], [31.5, 12], [33, 17], [31, 22], [32.5, 26], [31, 31]],
  // The Amazon.
  [[-77, -6], [-72, -4], [-66, -3.5], [-60, -3], [-55, -2.2], [-50, -0.5]],
]

/** Where the world map's places sit on the globe (degrees), and how her view of them comes in when she picks one. A new
 *  country needs a line here (and a landmark in landmarks.ts); until it has one, its flat map pin is used and it gets a
 *  flag on a pole. */
export const SPOTS: Record<string, { lat: number; lon: number }> = {
  home: { lat: 38, lon: -98 },
  canada: { lat: 57, lon: -104 },
  peru: { lat: -11, lon: -74.5 },
  italy: { lat: 43, lon: 12.2 },
  egypt: { lat: 26.5, lon: 30 },
  china: { lat: 35.5, lon: 104 },
  thailand: { lat: 15.5, lon: 101 },
  australia: { lat: -25.5, lon: 133 },
  poles: { lat: -80, lon: 25 },
}
/** The Poles have two ends: the Arctic (Pola) opens them too. */
export const NORTH_POLE = { lat: 87, lon: -40 }

/** Where a place without a spot goes: its pin on the flat world map, read as a plain latitude and longitude. */
export function spotFromMap(x: number, y: number) {
  return { lat: 90 - y * 1.8, lon: x * 3.6 - 180 }
}

/** Where to tap a continent's name (for VoiceOver and the tests), away from the landmarks. */
export const CONTINENT_SPOTS: Record<ContinentKey, { lat: number; lon: number }> = {
  northAmerica: { lat: 46, lon: -118 },
  southAmerica: { lat: -24, lon: -60 },
  europe: { lat: 52, lon: 25 },
  africa: { lat: 6, lon: 16 },
  asia: { lat: 58, lon: 95 },
  australia: { lat: -21, lon: 120 },
  antarctica: { lat: -76, lon: -100 },
}

/** Is (lon, lat) inside this outline? (Plain lon/lat test: fine for anything that doesn't wrap round a pole.) */
export function inside(outline: Pt[], lon: number, lat: number) {
  let hit = false
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [xi, yi] = outline[i]
    const [xj, yj] = outline[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

/** Which continent is at (lon, lat), if any. */
export function continentAt(lon: number, lat: number): ContinentKey | null {
  if (lat < -62) return 'antarctica'
  for (const m of LANDMASSES) {
    if (m.continent === 'antarctica') continue
    if (inside(m.outline, lon, lat)) return m.continent === 'asia' && inEurope(lon, lat) ? 'europe' : m.continent
  }
  return null
}

/** Rounds an outline's corners (Chaikin's corner cutting): the coasts come out as soft toy curves. An edge across the
 *  date line (Antarctica's ring, the Arctic's) is cut the short way round, not back across the whole map. */
export function smoothOutline(pts: Pt[], rounds = 2): Pt[] {
  const norm = (lon: number) => (lon > 180 ? lon - 360 : lon < -180 ? lon + 360 : lon)
  let p = pts
  for (let r = 0; r < rounds; r++) {
    const out: Pt[] = []
    for (let i = 0; i < p.length; i++) {
      const [ax, ay] = p[i]
      let [bx, by] = p[(i + 1) % p.length]
      if (bx - ax > 180) bx -= 360
      else if (ax - bx > 180) bx += 360
      out.push([norm(ax * 0.75 + bx * 0.25), ay * 0.75 + by * 0.25], [norm(ax * 0.25 + bx * 0.75), ay * 0.25 + by * 0.75])
    }
    p = out
  }
  return p
}
