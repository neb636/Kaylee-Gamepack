// The map of Canada as numbers (no three.js): Canada drawn as a toy, a chunky caricature of the real country, not a
// coastline dataset. Board units: x runs west (-8) to east (+8), z north (-4.5) to south (+4.5). The Pacific is on the
// left, the Atlantic on the right, Hudson Bay takes its big bite out of the top middle, a few round snowy islands sit
// along the Arctic, the Great Lakes hang off the bottom and the St Lawrence opens to the east. Alaska, Greenland and
// the United States are low cream paper, like the neighbours on the Thailand map.
//
// The shapes are drawn once onto a small canvas with smooth curves, then turned into signed distances (how far inside
// Canada, how far inside any land): the board's height, its painted top and the sea's foam all read them, so they always
// agree where the coast is. Where each place and each poke stands is here too.
import { smoothstep } from '../../../../sdk/math'

export type XZ = [x: number, z: number]

/** The board (the tray's inside). */
export const BOARD = { x0: -8, x1: 8, z0: -4.5, z1: 4.5 }
/** Heights: Canada's top, the neighbours' paper, the sea bed under the water (the sea is at 0). */
export const LEVEL = { land: 0.34, paper: 0.12, floor: -0.22 }

// ---------------------------------------------------------------- the shapes (smooth closed curves through these)

/** Canada's mainland, clockwise from the Alaska border on the Arctic coast. Hudson Bay, the Gulf of St Lawrence and
 *  the Great Lakes are cut out of it afterwards. */
const MAINLAND: XZ[] = [
  [-5.45, -2.4],
  [-4.4, -2.1],
  [-3.35, -2.3],
  [-2.2, -2.0],
  [-1.0, -2.15],
  [0.4, -2.3],
  [1.6, -2.0],
  [2.6, -1.6],
  [3.5, -1.0],
  [4.6, -0.55],
  [5.7, -0.05],
  [6.5, 0.7],
  [6.75, 1.4],
  [6.55, 2.1],
  [6.45, 2.75],
  [5.9, 3.15],
  [5.0, 3.05],
  [4.1, 2.95],
  [3.2, 3.1],
  [2.55, 3.45],
  [1.75, 3.75],
  [1.0, 3.35],
  [0.1, 3.05],
  [-1.2, 2.98],
  [-3.2, 2.98],
  [-5.1, 2.98],
  [-5.8, 2.95],
  [-6.05, 2.2],
  [-5.95, 1.2],
  [-6.15, 0.2],
  [-6.0, -0.7],
  [-5.45, -1.0],
]
/** Hudson Bay: open to the Arctic at the top. */
const HUDSON: XZ[] = [
  [-0.9, -2.8],
  [-0.95, -1.4],
  [-1.05, -0.5],
  [-0.65, 0.25],
  [-0.05, 0.35],
  [0.25, 0.72],
  [0.6, 0.7],
  [0.72, 0.28],
  [1.25, -0.15],
  [1.4, -0.95],
  [1.15, -1.7],
  [1.0, -2.8],
]
/** The Gulf of St Lawrence and its estuary, narrowing west to Quebec City; open to the Atlantic. */
const GULF: XZ[] = [
  [7.4, 1.35],
  [5.9, 1.55],
  [5.0, 1.75],
  [4.2, 1.98],
  [3.35, 2.32],
  [3.05, 2.47],
  [3.3, 2.56],
  [4.1, 2.36],
  [4.9, 2.3],
  [5.5, 2.45],
  [7.4, 2.4],
]
/** Alaska (paper), past the straight border. */
const ALASKA: XZ[] = [
  [-9, -3.4],
  [-7.2, -3.1],
  [-5.45, -2.4],
  [-5.45, -1.0],
  [-6.0, -0.7],
  [-6.5, -0.95],
  [-7.2, -1.2],
  [-7.9, -0.95],
  [-9, -0.7],
]
/** The United States (paper), along the bottom: under Canada's south edge, the Pacific coast on the left, the
 *  Atlantic's on the right. */
const USA: XZ[] = [
  [-5.85, 2.6],
  [-1, 2.6],
  [3, 2.7],
  [5.4, 2.9],
  [5.6, 3.25],
  [4.6, 3.7],
  [4.0, 4.3],
  [3.6, 5.2],
  [-6.0, 5.2],
  [-6.3, 4.3],
  [-6.05, 3.5],
]
/** Round islands: [x, z, rx, rz, turn]. The Arctic's are snowy Canada; Vancouver Island, Haida Gwaii and Newfoundland
 *  are Canada too. */
export const ISLANDS: [number, number, number, number, number][] = [
  [2.75, -3.0, 1.35, 0.62, -0.42], // Baffin
  [0.9, -4.0, 1.05, 0.38, 0.1], // Ellesmere
  [-2.4, -3.2, 0.85, 0.48, 0.15], // Victoria
  [-4.05, -3.3, 0.48, 0.42, 0], // Banks
  [-6.35, 2.3, 0.27, 0.55, -0.5], // Vancouver Island
  [-6.65, 0.45, 0.18, 0.32, -0.25], // Haida Gwaii
  [7.4, 1.75, 0.38, 0.34, 0.3], // Newfoundland
]
/** Greenland (paper), mostly off the board's top right corner. */
const GREENLAND: [number, number, number, number, number] = [7.1, -3.7, 1.5, 1.3, 0.3]
/** The Great Lakes: [x, z, rx, rz, turn]. */
export const LAKES: [number, number, number, number, number][] = [
  [-0.35, 3.08, 0.58, 0.2, -0.08], // Superior
  [0.92, 3.28, 0.24, 0.34, 0.2], // Huron
  [1.55, 3.7, 0.38, 0.12, -0.42], // Erie
  [2.2, 3.27, 0.34, 0.12, -0.15], // Ontario
]

/** The Rocky Mountains' ridge, north-west to south-east (the peaks stand along it). */
export const ROCKIES: [XZ, XZ] = [
  [-5.25, -1.3],
  [-3.55, 2.75],
]
/** The golden prairie: a rounded box [x0, z0, x1, z1]. */
export const PRAIRIE = [-3.2, 0.95, -1.85, 2.95] as const

// ---------------------------------------------------------------- where everything stands

export type PlaceId = 'party' | 'snowman' | 'bike' | 'campfire' | 'canoe' | 'salmon' | 'whales'
/** Each place's middle, east to west. */
export const PLACES: Record<PlaceId, XZ> = {
  bike: [5.95, 0.4],
  snowman: [4.1, 1.2],
  party: [1.45, 2.4],
  campfire: [-0.75, 1.15],
  canoe: [-3.85, 1.85],
  salmon: [-5.45, 0.05],
  whales: [-7.1, 2.3],
}

export type PokeId = 'geese' | 'polar' | 'orca' | 'bison' | 'beluga' | 'balloon'
export const POKES: Record<PokeId, XZ> = {
  geese: [1.45, 2.5],
  polar: [-2.4, -3.25],
  orca: [-7.2, 0.0],
  bison: [-2.45, 2.45],
  beluga: [0.15, -0.6],
  balloon: [-1.6, -0.9],
}

/** Where ice floes drift (the Arctic and Hudson Bay). */
export const FLOES: [number, number, number][] = [
  [-0.4, -1.5, 0.2],
  [0.8, -1.1, 0.14],
  [-3.3, -2.75, 0.18],
  [-1.1, -2.75, 0.15],
  [4.6, -2.3, 0.22],
  [-0.4, -4.0, 0.18],
  [3.7, -4.15, 0.15],
]

// ---------------------------------------------------------------- the field

/** Grid cells per unit, and how far the grid runs past the board. */
const RES = 26
const PAD = 1

export interface Field {
  /** Units inside Canada (negative: outside it). */
  canada(x: number, z: number): number
  /** Units inside any land (negative: out at sea, or in a lake). */
  land(x: number, z: number): number
  /** The ground's height there. */
  height(x: number, z: number): number
  /** The distance out to sea as a picture (rows from the north), for the water. */
  sea: { data: Float32Array; w: number; h: number; x0: number; z0: number; x1: number; z1: number }
}

/** Squared distance to the nearest "on" cell, for every cell (Felzenszwalb and Huttenlocher's two passes). */
function distance(on: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1e12
  const out = new Float32Array(w * h)
  for (let i = 0; i < out.length; i++) out[i] = on[i] ? 0 : INF
  const n = Math.max(w, h)
  const f = new Float32Array(n)
  const d = new Float32Array(n)
  const v = new Int32Array(n)
  const zz = new Float32Array(n + 1)
  const pass = (len: number) => {
    let k = 0
    v[0] = 0
    zz[0] = -INF
    zz[1] = INF
    for (let q = 1; q < len; q++) {
      let s = 0
      for (;;) {
        const p = v[k]
        s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p)
        if (s > zz[k] || k === 0) break
        k--
      }
      if (s <= zz[k]) {
        v[0] = q
        zz[0] = -INF
        zz[1] = INF
      } else {
        k++
        v[k] = q
        zz[k] = s
        zz[k + 1] = INF
      }
    }
    k = 0
    for (let q = 0; q < len; q++) {
      while (zz[k + 1] < q) k++
      const p = v[k]
      d[q] = (q - p) * (q - p) + f[p]
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = out[y * w + x]
    pass(h)
    for (let y = 0; y < h; y++) out[y * w + x] = d[y]
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = out[y * w + x]
    pass(w)
    for (let x = 0; x < w; x++) out[y * w + x] = d[x]
  }
  return out
}

/** A smooth closed curve through the points (Catmull-Rom as béziers), traced on `g` in its own pixel space. */
export function smoothPath(g: CanvasRenderingContext2D, pts: XZ[], px: (p: XZ) => [number, number]) {
  const q = pts.map(px)
  const n = q.length
  g.beginPath()
  g.moveTo(...q[0])
  for (let i = 0; i < n; i++) {
    const p0 = q[(i - 1 + n) % n]
    const p1 = q[i]
    const p2 = q[(i + 1) % n]
    const p3 = q[(i + 2) % n]
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1])
  }
  g.closePath()
}

/** The gentle swells on Canada's top (0 on the flat). */
const SWELLS: [number, number, number, number][] = [
  [4.2, 0.4, 1.1, 0.07],
  [2.4, 0.9, 0.9, 0.05],
  [-1.6, -1.1, 1.3, 0.04],
  [-5.4, 1.2, 0.8, 0.06],
]
const swell = (x: number, z: number) => {
  let up = 0
  for (const [sx, sz, r, top] of SWELLS) {
    const d2 = ((x - sx) ** 2 + (z - sz) ** 2) / (r * r)
    if (d2 < 6) up += top * Math.exp(-d2 * 1.6)
  }
  return up
}

let built: Field | null = null
/** The field, worked out once a visit (the map is built again every time she comes back to it). */
export function buildField(): Field {
  return (built ??= makeField())
}

function makeField(): Field {
  const x0 = BOARD.x0 - PAD
  const z0 = BOARD.z0 - PAD
  const w = Math.ceil((BOARD.x1 - BOARD.x0 + PAD * 2) * RES)
  const h = Math.ceil((BOARD.z1 - BOARD.z0 + PAD * 2) * RES)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  const px = ([x, z]: XZ): [number, number] => [(x - x0) * RES, (z - z0) * RES]
  const shape = (pts: XZ[]) => {
    smoothPath(g, pts, px)
    g.fill()
  }
  const blob = ([x, z, rx, rz, turn]: [number, number, number, number, number]) => {
    const [cx, cy] = px([x, z])
    g.beginPath()
    g.ellipse(cx, cy, rx * RES, rz * RES, turn, 0, Math.PI * 2)
    g.fill()
  }
  const mask = () => {
    const rgba = g.getImageData(0, 0, w, h).data
    const on = new Uint8Array(w * h)
    for (let i = 0; i < on.length; i++) on[i] = rgba[i * 4] > 127 ? 1 : 0
    return on
  }
  const signed = (on: Uint8Array) => {
    const off = new Uint8Array(on.length)
    for (let i = 0; i < on.length; i++) off[i] = on[i] ? 0 : 1
    const toIn = distance(on, w, h)
    const toOut = distance(off, w, h)
    const s = new Float32Array(on.length)
    for (let i = 0; i < s.length; i++) s[i] = (on[i] ? Math.sqrt(toOut[i]) - 0.5 : 0.5 - Math.sqrt(toIn[i])) / RES
    return s
  }
  const water = () => {
    g.fillStyle = '#000'
    shape(HUDSON)
    shape(GULF)
    LAKES.forEach(blob)
  }

  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'
  shape(MAINLAND)
  water()
  g.fillStyle = '#fff'
  ISLANDS.forEach(blob)
  const canada = signed(mask())
  shape(ALASKA)
  shape(USA)
  blob(GREENLAND)
  shape(MAINLAND)
  water()
  g.fillStyle = '#fff'
  ISLANDS.forEach(blob)
  const land = signed(mask())
  c.width = c.height = 0

  const read = (a: Float32Array, x: number, z: number) => {
    const gx = Math.max(0, Math.min(w - 1.001, (x - x0) * RES - 0.5))
    const gy = Math.max(0, Math.min(h - 1.001, (z - z0) * RES - 0.5))
    const ix = Math.floor(gx)
    const iy = Math.floor(gy)
    const fx = gx - ix
    const fy = gy - iy
    const i = iy * w + ix
    return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy) + (a[i + w] * (1 - fx) + a[i + w + 1] * fx) * fy
  }
  const height = (x: number, z: number) => {
    const sl = read(land, x, z)
    const sc = read(canada, x, z)
    // The neighbours: low paper with a soft shore. Canada stands up from it like a slice of cake.
    const low = LEVEL.floor + (LEVEL.paper - LEVEL.floor) * smoothstep(-0.12, 0.05, sl)
    const up = smoothstep(-0.07, 0.035, sc)
    if (up <= 0) return low
    return low + (LEVEL.land + swell(x, z) * smoothstep(0.05, 0.5, sc) - low) * up
  }
  const sea = new Float32Array(w * h)
  for (let i = 0; i < sea.length; i++) sea[i] = Math.max(0, -land[i])
  return {
    canada: (x, z) => read(canada, x, z),
    land: (x, z) => read(land, x, z),
    height,
    sea: { data: sea, w, h, x0, z0, x1: x0 + w / RES, z1: z0 + h / RES },
  }
}

/** A cheap wobble (about -1..1) so painted edges aren't ruler-straight. */
export const wobble = (x: number, z: number) => 0.5 * Math.sin(x * 3.3 + z * 1.7) + 0.3 * Math.sin(x * 1.9 - z * 3.1) + 0.2 * Math.sin(x * 7.1 + z * 6.3)

/** How far a point is from the Rockies' ridge line (units). */
export function fromRockies(x: number, z: number) {
  const [[ax, az], [bx, bz]] = ROCKIES
  const dx = bx - ax
  const dz = bz - az
  const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)))
  return { d: Math.hypot(x - (ax + dx * k), z - (az + dz * k)), k, side: Math.sign((x - ax) * dz - (z - az) * dx) }
}
