// Koh Samet's ground, from layout.ts's real coastline and beaches: the height and the color of every point, for
// engine3d/terrain.ts. Wide flat crystal sand where OSM has a beach (shrunk 1:10, a real beach would be a 3 m strip:
// the sand is widened to people size), granite boulders and a quick rise where it doesn't, and a green spine of hills
// down the middle (exaggerated, so the island reads as an island from the sea). Under the water the sand slopes away
// gently off the beaches (wide turquoise shallows) and steeply off the rocks.
import { BEACHES, COAST, onLand, type XZ } from './layout'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const mix = (a: number, b: number, k: number) => a + (b - a) * k

/** Segments as flat arrays (quick to scan). */
function segments(poly: XZ[]) {
  const s = new Float32Array(poly.length * 4)
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length]
    s.set([a.x, a.z, b.x - a.x, b.z - a.z], i * 4)
  })
  return s
}
const COAST_SEG = segments(COAST)
const BEACH_SEG = BEACHES.map((b) => ({ seg: segments(b.pts), pts: b.pts, box: box(b.pts, 30) }))
function box(pts: XZ[], pad: number) {
  return { x0: Math.min(...pts.map((p) => p.x)) - pad, x1: Math.max(...pts.map((p) => p.x)) + pad, z0: Math.min(...pts.map((p) => p.z)) - pad, z1: Math.max(...pts.map((p) => p.z)) + pad }
}
function distTo(seg: Float32Array, x: number, z: number) {
  let best = Infinity
  for (let i = 0; i < seg.length; i += 4) {
    const ax = seg[i]
    const az = seg[i + 1]
    const dx = seg[i + 2]
    const dz = seg[i + 3]
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1)
    const ex = x - ax - dx * t
    const ez = z - az - dz * t
    const d = ex * ex + ez * ez
    if (d < best) best = d
  }
  return Math.sqrt(best)
}

/** Meters to the nearest beach's sand (0 on it; far away: 99). */
export function beachDistance(x: number, z: number) {
  let best = 99
  for (const b of BEACH_SEG) {
    if (x < b.box.x0 || x > b.box.x1 || z < b.box.z0 || z > b.box.z1) continue
    if (onLand(x, z, b.pts)) return 0
    best = Math.min(best, distTo(b.seg, x, z))
  }
  return best
}

/** Rolling value noise for the hills (cheap, smooth enough at this scale). */
function hash(i: number, j: number) {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453
  return s - Math.floor(s)
}
export function noise(x: number, z: number) {
  const i = Math.floor(x)
  const j = Math.floor(z)
  const u = x - i
  const v = z - j
  const su = u * u * (3 - 2 * u)
  const sv = v * v * (3 - 2 * v)
  return mix(mix(hash(i, j), hash(i + 1, j), su), mix(hash(i, j + 1), hash(i + 1, j + 1), su), sv)
}

/** How wide the sand is here (meters inland from the waterline), from 1 (on a beach) to 0 (rocks). */
function sandiness(x: number, z: number) {
  return 1 - smooth(2, 12, beachDistance(x, z))
}
export const SAND_W = { beach: 15, rock: 3 }

export interface GroundPoint {
  h: number
  shore: number
  /** 1 on a beach, 0 on rocks. */
  sand: number
}

/** The height and the shore distance at a point. */
export function groundAt(x: number, z: number): GroundPoint {
  const land = onLand(x, z)
  const d = distTo(COAST_SEG, x, z)
  const shore = land ? -d : d
  const sand = sandiness(x, z)
  if (!land) {
    // Under the sea: wide shallows off the sand, a quick drop off the rocks.
    const slope = mix(0.2, 0.075, sand)
    return { h: Math.max(-11.5, 0.05 - d * slope - smooth(25, 90, d) * 3), shore, sand }
  }
  const W = mix(SAND_W.rock, SAND_W.beach, sand)
  if (d < W) return { h: 0.05 + d * mix(0.32, 0.05, sand), shore, sand }
  const hw = 0.05 + W * mix(0.32, 0.05, sand)
  const k = d - W
  // A steep first rise (the beach's back edge), then the hills' spine with lumps.
  const hill = 3.2 * smooth(0, 8, k) + 16 * smooth(4, 55, k) * (0.55 + 0.6 * noise(x * 0.03, z * 0.03)) + 9 * smooth(30, 110, k) * noise(x * 0.012 + 5, z * 0.012)
  return { h: hw + hill, shore, sand }
}

/** The ground's color (the toon palette: crystal sand, wet sand, island green, warm granite). */
export function groundColor(x: number, z: number, h: number, shore: number, slope: number): string {
  if (shore > 0) {
    // The sea floor (seen through the shallows): pale sand, a little darker deeper down.
    return h > -1.2 ? '#F6EAD0' : h > -3.5 ? '#E6D8B6' : '#CDBF9C'
  }
  const d = -shore
  const sand = sandiness(x, z)
  const W = mix(SAND_W.rock, SAND_W.beach, sand)
  if (d < W) {
    if (sand < 0.4) return slope > 0.25 ? '#BFB5AC' : '#D8CBB8'
    // Wet sand by the water, then the crystal sand.
    return d < 1.6 ? '#EBD5AA' : '#FFF4DE'
  }
  if (d < W + 2.5) return sand > 0.4 ? '#F1E5C6' : '#BFB5AC'
  if (slope > 0.95) return '#B9AFA6'
  const n = noise(x * 0.08, z * 0.08)
  return h > 18 ? (n > 0.5 ? '#78BE6C' : '#6DB463') : n > 0.55 ? '#93CF7A' : n > 0.3 ? '#86C773' : '#9AD383'
}
