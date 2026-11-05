// Koh Samet's ground, from layout.ts's real coastline and beaches: the height and the color of every point, for
// engine3d/terrain.ts. Wide flat crystal sand where OSM has a beach (shrunk 1:10, a real beach would be a 3 m strip:
// the sand is widened to people size), granite boulders and a quick rise where it doesn't, and a green spine of hills
// down the middle (exaggerated, so the island reads as an island from the sea). Under the water the sand slopes away
// gently off the beaches (wide turquoise shallows) and steeply off the rocks.
import { Color } from 'three'
import { BEACHES, CLEARINGS, COAST, onLand, WAYS, type WayKind, type XZ } from './layout'

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const mix = (a: number, b: number, k: number) => a + (b - a) * k
const tint = new Color()
const tint2 = new Color()

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

/** The nearest point on the coastline. */
function nearestCoast(x: number, z: number): XZ {
  let best = Infinity
  let bx = x
  let bz = z
  const seg = COAST_SEG
  for (let i = 0; i < seg.length; i += 4) {
    const ax = seg[i]
    const az = seg[i + 1]
    const dx = seg[i + 2]
    const dz = seg[i + 3]
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1), 0, 1)
    const px = ax + dx * t
    const pz = az + dz * t
    const d = (x - px) ** 2 + (z - pz) ** 2
    if (d < best) {
      best = d
      bx = px
      bz = pz
    }
  }
  return { x: bx, z: bz }
}
/** Is the shore a beach here, from 1 (sand) to 0 (rocks)? Measured at the nearest waterline, so a beach is just as
 *  sandy all the way up to the back of its sand. */
function sandiness(x: number, z: number) {
  const c = nearestCoast(x, z)
  return 1 - smooth(2, 9, beachDistance(c.x, c.z))
}
export const SAND_W = { beach: 15, rock: 3 }

export interface GroundPoint {
  h: number
  shore: number
  /** 1 on a beach, 0 on rocks. */
  sand: number
}

/** The height and the shore distance at a point, before the ways are cut in. */
function baseGround(x: number, z: number): GroundPoint {
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

// ---- The ways (greybox 2): each road and path is a strip of level-ish ground following a smoothed height profile (so
// the walk over the spine is a steady climb, not every lump of the hill), blended into the slopes beside it.
const WAY_DATA = WAYS.map((w) => {
  const raw = w.pts.map((p) => Math.max(0.15, baseGround(p.x, p.z).h))
  let prof = raw
  for (let pass = 0; pass < 3; pass++) prof = prof.map((_, i) => {
    let sum = 0
    let n = 0
    for (let k = -4; k <= 4; k++) {
      const v = prof[clamp(i + k, 0, prof.length - 1)]
      sum += v
      n++
    }
    return sum / n
  })
  return { kind: w.kind, width: w.width, pts: w.pts, prof, box: box(w.pts, w.width + 6) }
})

export interface WayHit {
  /** Meters to the way's middle line. */
  d: number
  kind: WayKind
  width: number
  /** The way's height there. */
  h: number
}
const NO_WAY: WayHit = { d: 99, kind: 'path', width: 0, h: 0 }
/** The nearest way to a point (within a few meters of one; otherwise d = 99). */
export function wayAt(x: number, z: number): WayHit {
  let best = NO_WAY
  for (const w of WAY_DATA) {
    if (x < w.box.x0 || x > w.box.x1 || z < w.box.z0 || z > w.box.z1) continue
    for (let i = 0; i < w.pts.length - 1; i++) {
      const a = w.pts[i]
      const b = w.pts[i + 1]
      const dx = b.x - a.x
      const dz = b.z - a.z
      const t = clamp(((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1), 0, 1)
      const d = Math.hypot(x - a.x - dx * t, z - a.z - dz * t)
      if (d < best.d) best = { d, kind: w.kind, width: w.width, h: w.prof[i] + (w.prof[i + 1] - w.prof[i]) * t }
    }
  }
  return best
}

/** The height and the shore distance at a point. */
export function groundAt(x: number, z: number): GroundPoint {
  const g = baseGround(x, z)
  if (g.shore >= 0) return g
  const w = wayAt(x, z)
  if (w.d > w.width / 2 + 5) return g
  const k = 1 - smooth(w.width / 2, w.width / 2 + 5, w.d)
  return { ...g, h: mix(g.h, Math.max(w.h, 0.12) + 0.02, k) }
}

export type Surface = 'water' | 'wet' | 'sand' | 'rock' | 'grass' | 'road' | 'path' | 'forest'
/** What's underfoot (for walking, footprints and sounds). `forest` is where she can't go (the trees). */
export function surfaceAt(x: number, z: number): Surface {
  const land = onLand(x, z)
  if (!land) return 'water'
  const d = distTo(COAST_SEG, x, z)
  const sand = sandiness(x, z)
  const W = mix(SAND_W.rock, SAND_W.beach, sand)
  const w = wayAt(x, z)
  if (w.d < w.width / 2 + 0.6 && !(sand > 0.4 && d < W)) return w.kind
  if (d < W) return sand > 0.4 ? (d < 1.6 ? 'wet' : 'sand') : 'rock'
  if (d < W + 3 && sand > 0.4) return 'grass'
  for (const c of CLEARINGS) if (Math.hypot(x - c.x, z - c.z) < c.r) return 'grass'
  return 'forest'
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
    // Wet sand by the water, then the crystal sand (blended, so the grid's triangles don't show as a sawtooth).
    return '#' + tint.set('#EBD5AA').lerp(tint2.set('#FFF4DE'), smooth(0.4, 2.8, d)).lerp(tint2.set('#F4E8CB'), smooth(W - 3, W, d)).getHexString()
  }
  const w = wayAt(x, z)
  if (w.d < w.width / 2 + 1.1) {
    if (w.kind === 'road') return w.d < w.width / 2 - 0.15 ? (Math.floor((x + z) * 0.25) % 7 === 0 ? '#DDD6C9' : '#E9E3D8') : '#C8BFAF'
    return w.d < w.width / 2 ? '#F4E2BD' : '#E3CB9A'
  }
  if (d < W + 5 && sand > 0.4) return '#' + tint.set('#F4E8CB').lerp(tint2.set('#D3E3A2'), smooth(W + 1, W + 4.5, d)).getHexString()
  if (d < W + 2.5) return '#C9BFB4'
  if (w.d < w.width / 2 + 2.5) return '#A9DA86'
  for (const c of CLEARINGS) if (Math.hypot(x - c.x, z - c.z) < c.r) return '#A3D684'
  if (slope > 0.95 && sand < 0.3) return '#B9AFA6'
  const n = noise(x * 0.08, z * 0.08)
  return h > 18 ? (n > 0.5 ? '#78BE6C' : '#6DB463') : n > 0.55 ? '#93CF7A' : n > 0.3 ? '#86C773' : '#9AD383'
}
