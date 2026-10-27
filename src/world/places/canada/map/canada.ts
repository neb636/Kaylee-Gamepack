// Canada as a toy-table map: a hand-simplified coastline in longitude and latitude, the islands, the big lakes, and the
// places the train and the pokes stand on. Projected onto the table in meters: east is +x, north is -z, and the
// meridians lean in toward the north like a real map of Canada (a cone-ish projection), so the Arctic looks narrower than
// the south. About 45 m from Vancouver Island to Newfoundland. Pure data and math, no three.js.

export type LL = readonly [lon: number, lat: number]

/** Meters per degree of latitude on the table. */
const K = 0.5
const C55 = Math.cos((55 * Math.PI) / 180)

/** Where a longitude and latitude sit on the table: x east, z south (north is -z). */
export function proj([lon, lat]: LL): [x: number, z: number] {
  const lean = Math.cos((lat * Math.PI) / 180) / C55
  return [(lon + 95) * K * lean, -(lat - 55) * K * 1.15]
}

/** Back from the table to a longitude and latitude. */
export function unproj(x: number, z: number): LL {
  const lat = 55 - z / (K * 1.15)
  return [x / (K * (Math.cos((lat * Math.PI) / 180) / C55)) - 95, lat]
}

/** The mainland, one loop: along the US border from Vancouver east, the Great Lakes' north shores, the Maritimes, up the
 *  St. Lawrence to Quebec City and back down its north shore, Labrador, Hudson Bay, the Arctic coast, Alaska, and the
 *  BC coast back to Vancouver. */
export const MAINLAND: LL[] = [
  [-123.1, 49.0], [-95.2, 49.0], [-95.2, 49.4], [-94.6, 48.7], [-93.3, 48.6], [-90.9, 48.2], [-89.6, 48.0], [-88.5, 48.6],
  [-87.0, 48.8], [-85.8, 48.0], [-84.8, 47.4], [-84.5, 46.5], [-83.6, 46.1], [-81.6, 46.1], [-80.5, 45.6], [-80.0, 44.9],
  [-81.3, 45.2], [-81.6, 44.6], [-81.7, 44.0], [-82.4, 43.1], [-82.5, 42.1], [-81.4, 42.6], [-80.0, 42.8], [-79.1, 42.9],
  [-79.8, 43.3], [-79.4, 43.65], [-78.0, 43.9], [-76.5, 44.1], [-75.5, 44.6], [-74.7, 45.0], [-71.5, 45.0], [-70.8, 45.4],
  [-70.0, 46.2], [-69.2, 47.4], [-67.9, 47.1], [-67.8, 45.6], [-67.0, 45.0], [-66.0, 45.3], [-64.8, 45.6],
  // Nova Scotia, round the Bay of Fundy and Cape Breton.
  [-64.6, 45.35], [-66.0, 44.6], [-65.8, 43.7], [-65.3, 43.5], [-64.0, 44.4], [-62.5, 44.8], [-61.0, 45.2], [-59.9, 45.9],
  [-60.3, 46.9], [-61.4, 46.4], [-62.6, 45.7], [-63.8, 45.9],
  // New Brunswick, the Gaspé, and up the St. Lawrence to Quebec City.
  [-64.6, 46.3], [-64.9, 47.1], [-64.7, 47.8], [-64.3, 48.6], [-65.5, 49.2], [-67.3, 49.1], [-68.8, 48.4], [-69.9, 47.6],
  [-70.8, 47.0], [-71.15, 46.76], [-71.25, 46.86],
  // The river's north shore, out to the gulf and Labrador.
  [-71.0, 46.98], [-70.3, 47.5], [-69.4, 48.2], [-68.4, 49.0], [-67.0, 49.4], [-66.3, 50.15], [-63.5, 50.25], [-60.5, 50.25],
  [-58.5, 50.8], [-57.2, 51.45], [-55.8, 52.3], [-56.9, 53.8], [-58.8, 54.8], [-60.8, 55.8], [-61.8, 57.4], [-63.2, 58.6],
  [-64.6, 60.3],
  // Ungava Bay, Hudson Strait, and down the east side of Hudson Bay to James Bay.
  [-65.4, 59.2], [-67.3, 58.3], [-69.5, 58.8], [-69.6, 60.6], [-71.6, 61.2], [-73.5, 62.2], [-77.6, 62.5], [-77.9, 60.8],
  [-77.4, 59.5], [-77.1, 58.2], [-76.6, 57.2], [-76.9, 56.0], [-78.7, 55.2], [-79.3, 54.3], [-78.8, 52.6], [-79.0, 51.4],
  [-80.2, 51.2], [-81.8, 52.3], [-82.3, 53.3], [-82.2, 55.2],
  // Hudson Bay's south and west shores (Churchill), up to the Arctic.
  [-85.0, 55.3], [-87.6, 55.9], [-89.9, 57.0], [-92.4, 57.3], [-94.2, 58.8], [-94.6, 59.9], [-94.8, 61.2], [-93.5, 61.9],
  [-92.5, 62.7], [-90.8, 63.4], [-88.5, 64.0], [-87.0, 64.8], [-86.0, 66.3], [-86.6, 68.0], [-89.0, 68.9],
  // The Arctic coast, west to Alaska.
  [-94.4, 68.0], [-98.0, 67.8], [-102.5, 67.8], [-106.5, 68.3], [-108.5, 68.5], [-113.5, 67.8], [-116.2, 67.0], [-119.0, 67.8],
  [-121.0, 69.4], [-124.5, 69.4], [-127.0, 70.2], [-129.8, 69.9], [-131.5, 69.5], [-134.5, 69.6], [-137.0, 69.0], [-141.0, 69.6],
  // Alaska's border and the panhandle, then the BC coast.
  [-141.0, 60.3], [-139.1, 60.0], [-137.5, 59.2], [-136.5, 59.6], [-135.4, 59.8], [-133.4, 58.4], [-131.8, 56.6], [-130.0, 55.9],
  [-130.0, 55.0], [-130.4, 54.5], [-129.3, 53.3], [-128.2, 52.2], [-127.6, 51.3], [-126.0, 50.6], [-124.8, 49.9], [-123.9, 49.4],
]

export const ISLANDS: Record<string, LL[]> = {
  vancouver: [[-128.4, 50.8], [-127.2, 50.3], [-125.9, 49.1], [-124.7, 48.6], [-123.4, 48.35], [-123.6, 48.9], [-125.0, 49.8], [-126.9, 50.9]],
  haidaGwaii: [[-133.1, 54.1], [-131.7, 54.0], [-131.4, 53.0], [-131.6, 52.4], [-132.6, 53.1]],
  newfoundland: [[-59.4, 47.6], [-57.5, 47.6], [-55.8, 46.9], [-53.0, 46.7], [-52.6, 47.6], [-53.6, 48.1], [-53.0, 49.3], [-55.5, 49.8], [-55.6, 51.6], [-57.4, 50.6], [-58.4, 49.1]],
  pei: [[-64.4, 46.75], [-63.6, 46.45], [-62.0, 46.45], [-62.2, 46.15], [-63.6, 46.2], [-64.1, 46.4]],
  baffin: [[-77.0, 62.5], [-71.0, 62.8], [-64.6, 63.2], [-61.9, 66.6], [-66.5, 68.2], [-68.3, 70.3], [-72.0, 71.4], [-78.0, 72.6], [-83.0, 73.7], [-90.0, 72.9], [-88.5, 70.5], [-84.5, 69.9], [-81.5, 69.2], [-79.0, 68.0], [-77.5, 66.2], [-74.0, 65.3]],
  victoria: [[-117.5, 69.5], [-110.0, 68.6], [-101.5, 69.0], [-102.0, 70.5], [-105.5, 72.9], [-113.0, 73.0], [-118.5, 71.0]],
  banks: [[-125.0, 71.5], [-120.5, 71.4], [-117.6, 72.4], [-120.0, 74.3], [-125.5, 74.2]],
  southampton: [[-86.5, 64.2], [-83.0, 63.9], [-80.6, 64.0], [-83.5, 65.6], [-86.0, 65.6]],
}

/** Big lakes inside the mainland: holes in the table, so the sea shows through. `[lon, lat, half-width°, half-height°, turn]`. */
export const LAKES: [number, number, number, number, number][] = [
  [-97.8, 52.6, 0.55, 1.6, 0.25], // Lake Winnipeg
  [-114.0, 61.6, 2.6, 0.5, -0.15], // Great Slave Lake
  [-121.0, 66.0, 2.2, 0.8, 0.2], // Great Bear Lake
  [-105.5, 59.2, 1.6, 0.3, -0.3], // Lake Athabasca
  [-88.4, 49.8, 0.5, 0.35, 0], // Lake Nipigon
  [-74.5, 51.0, 0.6, 0.4, 0.4], // a lake in Quebec's forest
  [-101.5, 57.0, 0.7, 0.45, -0.2], // Reindeer Lake
]

/** A lake's outline (a wobbly oval). */
export function lakeOutline([lon, lat, rx, ry, turn]: (typeof LAKES)[number], n = 16): LL[] {
  const out: LL[] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const w = 1 + 0.12 * Math.sin(a * 3 + lon)
    const x = Math.cos(a) * rx * w
    const y = Math.sin(a) * ry * w
    out.push([lon + x * Math.cos(turn) - y * Math.sin(turn), lat + x * Math.sin(turn) + y * Math.cos(turn)])
  }
  return out
}

/** Is this point inside the outline? (even-odd) */
export function inside([lon, lat]: LL, poly: readonly LL[]) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** On the mainland, not in a lake. */
export function onLand(p: LL) {
  return inside(p, MAINLAND) && !LAKES.some((l) => inside(p, lakeOutline(l)))
}

/** Clips an outline to one side of a line of longitude or latitude (Sutherland-Hodgman, fine for a concave outline
 *  against one straight cut). `keep` says which side stays. */
export function clip(poly: readonly LL[], axis: 0 | 1, at: number, keep: 'above' | 'below'): LL[] {
  const ok = (p: LL) => (keep === 'above' ? p[axis] >= at : p[axis] <= at)
  const out: LL[] = []
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    if (ok(a)) out.push(a)
    if (ok(a) !== ok(b)) {
      const t = (at - a[axis]) / (b[axis] - a[axis])
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
    }
  }
  return out
}

/** The regions she rides through, east to west, for the pill at the bottom and the address bar. */
export type Region = 'quebec' | 'msa' | 'ottawa' | 'forest' | 'prairies' | 'rockies' | 'banff' | 'bc'

/** The track, east to west: Mont-Sainte-Anne, Quebec City, Montreal, Ottawa, the forests north of Lake Superior,
 *  Winnipeg, the prairies (Regina, Calgary), Banff, the Spiral Tunnels, Kamloops, Vancouver. */
export const ROUTE: LL[] = [
  [-70.45, 47.9], [-71.0, 47.8], [-71.45, 47.45], [-71.6, 47.0], [-72.6, 46.4], [-73.6, 45.65], [-75.7, 45.5], [-78.0, 45.9], [-81.0, 46.6],
  [-83.6, 47.5], [-85.4, 48.7], [-87.2, 49.3], [-89.4, 48.7], [-92.5, 49.6], [-97.1, 50.0], [-101.0, 50.25], [-104.6, 50.5],
  [-109.0, 50.6], [-114.0, 51.05], [-115.3, 51.18],
  // (The Spiral Tunnels are added round SPIRAL in track.ts.)
  [-120.4, 51.0], [-121.2, 50.45], [-121.9, 49.85], [-122.7, 49.35],
]
/** The mountain the track loops inside (the real Spiral Tunnels, near Field, BC: a little further west than the real ones,
 *  so the mountain doesn't sit on Banff), and where along ROUTE it goes in. */
export const SPIRAL: LL = [-119.0, 51.45]
export const SPIRAL_AFTER = 19

/** The stops along the track. `acts` are the two activities there (the finale for Ottawa). */
export const STOPS: { id: Region; at: LL; acts: string[] }[] = [
  // (Mont-Sainte-Anne is really just down the road from Quebec City; on the toy map it sits a train's length away.)
  { id: 'msa', at: [-70.45, 47.9], acts: ['bike', 'campfire'] },
  { id: 'quebec', at: [-71.6, 47.0], acts: ['taffy', 'snowman'] },
  { id: 'ottawa', at: [-75.7, 45.5], acts: ['party'] },
  { id: 'banff', at: [-115.3, 51.18], acts: ['canoe', 'bridge'] },
  { id: 'bc', at: [-122.7, 49.35], acts: ['whales', 'salmon'] },
]

/** Which region a longitude is in (along the track). */
export function regionAt([lon]: LL): Region {
  if (lon > -71.2) return 'msa'
  if (lon > -73) return 'quebec'
  if (lon > -77.5) return 'ottawa'
  if (lon > -96) return 'forest'
  if (lon > -113.5) return 'prairies'
  if (lon > -114.8) return 'rockies'
  if (lon > -116.8) return 'banff'
  if (lon > -121.3) return 'rockies'
  return 'bc'
}
