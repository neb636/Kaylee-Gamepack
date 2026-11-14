// The map's ground as numbers: how far every spot is from Thailand's edge and from the sea, worked out once from the
// real coasts (land.ts). The terrain's shape, its painted top and the sea's foam all read it, so they always agree
// about where the coast is. No three.js here.
import { BOARD, KARSTS, LEVEL, SWELLS, TOY_ISLANDS } from './geo'
import { OTHERS, THAI, type LonLat } from './land'
import { smoothstep } from '../../../../../../sdk/math'

/** Grid cells per degree, and how far the grid runs past the board. */
const RES = 40
const PAD = 0.6

export interface Field {
  /** Degrees inside Thailand (negative: outside it). */
  thai(lon: number, lat: number): number
  /** Degrees inside any land (negative: out at sea). */
  land(lon: number, lat: number): number
  /** The ground's height there (y). */
  height(lon: number, lat: number): number
  /** The hills alone (0 on flat land). */
  swell(lon: number, lat: number): number
  /** The distance out to sea as a picture (one number per cell, rows from the north), for the water. */
  sea: { data: Float32Array; w: number; h: number; lon0: number; lon1: number; lat0: number; lat1: number }
}

/** Squared distance to the nearest "on" cell, for every cell (Felzenszwalb and Huttenlocher's two passes). */
export function distance(on: Uint8Array, w: number, h: number): Float32Array {
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

/** The field, worked out once a visit (it's the same every time: the map is built on every trip back to it). */
let built: Field | null = null
export function buildField(): Field {
  return (built ??= makeField())
}

function makeField(): Field {
  const lon0 = BOARD.lon0 - PAD
  const lat1 = BOARD.lat1 + PAD
  const w = Math.ceil((BOARD.lon1 - BOARD.lon0 + PAD * 2) * RES)
  const h = Math.ceil((BOARD.lat1 - BOARD.lat0 + PAD * 2) * RES)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  const px = ([lon, lat]: LonLat): [number, number] => [(lon - lon0) * RES, (lat1 - lat) * RES]
  const ring = (pts: LonLat[]) => {
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    g.closePath()
    g.fill()
  }
  const blob = (lon: number, lat: number, rx: number, ry: number) => {
    const [x, y] = px([lon, lat])
    g.beginPath()
    g.ellipse(x, y, rx * RES, ry * RES, 0, 0, Math.PI * 2)
    g.fill()
  }
  const mask = () => {
    const rgba = g.getImageData(0, 0, w, h).data
    const on = new Uint8Array(w * h)
    for (let i = 0; i < on.length; i++) on[i] = rgba[i * 4] > 127 ? 1 : 0
    return on
  }
  /** Signed distance in degrees: positive inside the shape. */
  const signed = (on: Uint8Array) => {
    const off = new Uint8Array(on.length)
    for (let i = 0; i < on.length; i++) off[i] = on[i] ? 0 : 1
    const toIn = distance(on, w, h)
    const toOut = distance(off, w, h)
    const s = new Float32Array(on.length)
    for (let i = 0; i < s.length; i++) s[i] = (on[i] ? Math.sqrt(toOut[i]) - 0.5 : 0.5 - Math.sqrt(toIn[i])) / RES
    return s
  }

  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'
  THAI.forEach(ring)
  for (const [lon, lat, rx, ry] of TOY_ISLANDS) blob(lon, lat, rx, ry)
  const thai = signed(mask())
  OTHERS.forEach(ring)
  // A little shoal under each limestone tower, so the sea foams round its foot.
  for (const [lon, lat, s] of KARSTS) blob(lon, lat, 0.085 * s, 0.085 * s)
  const land = signed(mask())
  c.width = c.height = 0

  const sample = (a: Float32Array, lon: number, lat: number) => {
    const x = Math.max(0, Math.min(w - 1.001, (lon - lon0) * RES - 0.5))
    const y = Math.max(0, Math.min(h - 1.001, (lat1 - lat) * RES - 0.5))
    const x0 = Math.floor(x)
    const y0 = Math.floor(y)
    const fx = x - x0
    const fy = y - y0
    const i = y0 * w + x0
    return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fy) + (a[i + w] * (1 - fx) + a[i + w + 1] * fx) * fy
  }
  const swell = (lon: number, lat: number) => {
    let up = 0
    for (const [slon, slat, r, top] of SWELLS) {
      const d2 = ((lon - slon) * (lon - slon) + (lat - slat) * (lat - slat)) / (r * r)
      if (d2 < 6) up += top * Math.exp(-d2 * 1.6)
    }
    return up
  }
  const height = (lon: number, lat: number) => {
    const sl = sample(land, lon, lat)
    const st = sample(thai, lon, lat)
    // The neighbours and the shoals: low paper land with a soft shore.
    const low = LEVEL.floor + (LEVEL.paper - LEVEL.floor) * smoothstep(-0.14, 0.05, sl)
    // Thailand stands up from it with a steep, rounded edge; its hills start a little way in.
    const up = smoothstep(-0.075, 0.035, st)
    if (up <= 0) return low
    return low + (LEVEL.thai + swell(lon, lat) * smoothstep(0.04, 0.4, st) - low) * up
  }
  const sea = new Float32Array(w * h)
  for (let i = 0; i < sea.length; i++) sea[i] = Math.max(0, -land[i])
  return {
    thai: (lon, lat) => sample(thai, lon, lat),
    land: (lon, lat) => sample(land, lon, lat),
    height,
    swell,
    sea: { data: sea, w, h, lon0, lon1: lon0 + w / RES, lat0: lat1 - h / RES, lat1 },
  }
}
