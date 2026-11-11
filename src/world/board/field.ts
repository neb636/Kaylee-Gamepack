// The board's ground as numbers: how far every spot is from the nearest coast, worked out once from the real coasts
// (land.ts). The land's shape, its painted top and the sea's foam all read it, so they always agree about where the
// coast is. It also knows which of her countries (if any) stands on a spot. No three.js here.
import { BOARD, LEVEL, PIECES, SWELLS, toLat, toLon, toX, toZ, proj, type XZ } from './geo'
import { LAKES, LAND, SEAS, rings } from './land'

/** Grid cells per unit (a unit is ten degrees), and how far the grid runs past the board. */
const RES = 36
const PAD = 0.8

export interface Field {
  /** Units inside the land (negative: out at sea). */
  land(x: number, z: number): number
  /** The low land's height there (y). */
  height(x: number, z: number): number
  /** The mountain ranges alone (0 on flat land). */
  swell(x: number, z: number): number
  /** Which of her countries stands there: its index in PIECES, or -1. */
  piece(x: number, z: number): number
  /** The distance out to sea as a picture (one number per cell, rows from the north), for the water. */
  sea: { data: Float32Array; w: number; h: number; x0: number; x1: number; z0: number; z1: number }
  /** The lakes' outlines on the board. */
  lakes: XZ[][]
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
  const z = new Float32Array(n + 1)
  const pass = (len: number) => {
    let k = 0
    v[0] = 0
    z[0] = -INF
    z[1] = INF
    for (let q = 1; q < len; q++) {
      let s = 0
      for (;;) {
        const p = v[k]
        s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p)
        if (s > z[k] || k === 0) break
        k--
      }
      if (s <= z[k]) {
        // (k is 0 and the new parabola wins everywhere.)
        v[0] = q
        z[0] = -INF
        z[1] = INF
      } else {
        k++
        v[k] = q
        z[k] = s
        z[k + 1] = INF
      }
    }
    k = 0
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++
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

const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function buildField(): Field {
  const x0 = BOARD.x0 - PAD
  const z0 = BOARD.z0 - PAD
  const w = Math.ceil((BOARD.w + PAD * 2) * RES)
  const h = Math.ceil((BOARD.d + PAD * 2) * RES)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  const trace = (pts: XZ[]) => {
    g.beginPath()
    pts.forEach(([x, z], i) => (i ? g.lineTo((x - x0) * RES, (z - z0) * RES) : g.moveTo((x - x0) * RES, (z - z0) * RES)))
    g.closePath()
  }
  const fill = (pts: XZ[]) => {
    trace(pts)
    g.fill()
  }
  const red = () => {
    const rgba = g.getImageData(0, 0, w, h).data
    const out = new Uint8Array(w * h)
    for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4]
    return out
  }

  // Which of her countries stands where: each drawn in its own shade.
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  PIECES.forEach((p, i) => {
    g.fillStyle = `rgb(${(i + 1) * 16},0,0)`
    p.rings.forEach(fill)
  })
  const shades = red()
  const pieceAt = new Int8Array(w * h)
  for (let i = 0; i < pieceAt.length; i++) pieceAt[i] = shades[i] >= 12 ? Math.round(shades[i] / 16) - 1 : -1

  // The land: every coast, her countries as the board shows them (a little bigger than life), less the inland seas.
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'
  for (const r of rings(LAND)) fill(r.map(proj))
  for (const p of PIECES) p.rings.forEach(fill)
  g.fillStyle = '#000'
  for (const r of rings(SEAS)) fill(r.map(proj))
  const on = red()
  for (let i = 0; i < on.length; i++) on[i] = on[i] > 127 ? 1 : 0
  c.width = c.height = 0

  // Signed distance in units: positive inside the land.
  const off = new Uint8Array(on.length)
  for (let i = 0; i < on.length; i++) off[i] = on[i] ? 0 : 1
  const toIn = distance(on, w, h)
  const toOut = distance(off, w, h)
  const land = new Float32Array(on.length)
  for (let i = 0; i < land.length; i++) land[i] = (on[i] ? Math.sqrt(toOut[i]) - 0.5 : 0.5 - Math.sqrt(toIn[i])) / RES

  const sample = (a: Float32Array, x: number, z: number) => {
    const px = Math.max(0, Math.min(w - 1.001, (x - x0) * RES - 0.5))
    const py = Math.max(0, Math.min(h - 1.001, (z - z0) * RES - 0.5))
    const ix = Math.floor(px)
    const iy = Math.floor(py)
    const fx = px - ix
    const fy = py - iy
    const i = iy * w + ix
    return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy) + (a[i + w] * (1 - fx) + a[i + w + 1] * fx) * fy
  }
  const swells = SWELLS.map(([lon, lat, wide, top]) => [toX(lon), toZ(lat), wide / 10, top])
  const swell = (x: number, z: number) => {
    let up = 0
    for (const [sx, sz, r, top] of swells) {
      const d2 = ((x - sx) * (x - sx) + (z - sz) * (z - sz)) / (r * r)
      if (d2 < 6) up += top * Math.exp(-d2 * 1.6)
    }
    return up
  }
  const height = (x: number, z: number) => {
    const sl = sample(land, x, z)
    // A soft shore that slopes into the water, then flat land, with the mountain ranges a little way in.
    return LEVEL.floor + (LEVEL.land - LEVEL.floor) * smooth(-0.07, 0.025, sl) + swell(x, z) * smooth(0.03, 0.2, sl)
  }
  const sea = new Float32Array(w * h)
  for (let i = 0; i < sea.length; i++) sea[i] = Math.max(0, -land[i])
  return {
    land: (x, z) => sample(land, x, z),
    height,
    swell,
    piece: (x, z) => {
      const ix = Math.floor((x - x0) * RES)
      const iy = Math.floor((z - z0) * RES)
      return ix < 0 || iy < 0 || ix >= w || iy >= h ? -1 : pieceAt[iy * w + ix]
    },
    sea: { data: sea, w, h, x0, x1: x0 + w / RES, z0, z1: z0 + h / RES },
    lakes: rings(LAKES).map((r) => r.map(proj)),
  }
}

/** Longitude and latitude of a spot on the board. */
export const lonLat = (x: number, z: number): [number, number] => [toLon(x), toLat(z)]
