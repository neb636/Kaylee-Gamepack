// The Bangkok map's ground. Bangkok is flat, so the board is one low slab of city with the Chao Phraya cut through it
// (the real river, geo.ts): its long S past the old town and Chinatown, then the big loop round Bang Krachao. The top
// is painted like a map printed on warm paper: the city in a few creams and peaches that sit close together, its
// little streets a thin print, the real main roads in white, the khlongs in blue, the parks and their lakes, Thonburi's
// orchards in soft striped green, Bang Krachao's jungle inside the loop, a pale promenade along both banks, a compass
// in the quiet corner, a long afternoon shadow behind every tower and a soft one under every toy. The river is the
// Thailand map's Sea in the Chao Phraya's own teal, foaming a thin white line along both banks.
import { BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'
import { smoothstep } from '../../../../../../sdk/math'
import { distance } from '../map/field'
import { Sea } from '../map/terrain'
import { ISLANDS, KHLONGS, PARKS, ROADS, WATER, type LonLat } from './geo'
import { BOARD, CLIFF_W, COMPASS, DEG_M, JUNGLE, LEVEL, ll, RIVER_FAT, SKYTRAIN, toX, toZ, type XZ } from './layout'

/** Field cells per meter, ground mesh cells per meter, painted pixels per meter. */
const RES = 64
const MESH = 44
const TEX = 300
/** How far the field runs past the board (m). */
const PAD = 0.3

const C = {
  wet: [206, 238, 242],
  quay: [255, 238, 212],
  quayLow: [246, 212, 184],
  walk: [255, 251, 240],
  park: [178, 234, 160],
  jungle: [158, 226, 160],
  jungleDeep: [134, 212, 150],
} satisfies Record<string, [number, number, number]>

/** The Chao Phraya, as a toy: pale by the banks, a bright teal down the middle. */
const RIVER = { shallow: '#B9EEF0', mid: '#62CDE6', deep: '#41BADF', light: '#93E6F4' }
/** The Sea's bands are sized for a whole coast: the river is narrow, so its distances are stretched to fit them. */
const SEA_STRETCH = 5

/** The lakes in the parks (painted): [lon, lat, east-west radius, north-south radius (degrees)]. Lumphini's lake, and
 *  Benjakitti's long one. */
export const LAKES: [number, number, number, number][] = [
  [100.5428, 13.7302, 0.0026, 0.0012],
  [100.5578, 13.7292, 0.0015, 0.003],
]

export interface Field {
  /** Meters inside the land (negative: out on the water). */
  land(x: number, z: number): number
  /** The ground's height there (the river bed under the water). */
  height(x: number, z: number): number
  /** Meters to the nearest main road, khlong or skytrain pillar line (nothing is planted on them). */
  clear(x: number, z: number): number
  /** In a park? */
  park(x: number, z: number): boolean
  /** In Bang Krachao's jungle (inside the river's loop)? */
  jungle(x: number, z: number): boolean
}

/** The city is a patchwork of districts: each a big soft patch of one pastel, its little streets all leaning one way
 *  (like the real street grid does, part of town by part of town). Out west in Thonburi and south past the river's loop
 *  they are orchards: green, with rows of trees. */
export interface District {
  x: number
  z: number
  /** Which way its streets lean (radians). */
  turn: number
  /** Which pastel it is (an index: BLOCKS here, the roofs in diorama.ts). */
  k: number
  orchard: boolean
}
/** How far apart a district's little streets are (m): the houses stand in the squares between them. */
export const BLOCK = 0.085

let districts: District[] | null = null
function allDistricts() {
  if (districts) return districts
  const out: District[] = []
  let seed = 5
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  for (let i = 0; i < 4000 && out.length < 60; i++) {
    const x = BOARD.x0 + rnd() * W
    const z = BOARD.z0 + rnd() * D
    const turn = (rnd() - 0.5) * 1.1
    if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 0.62)) continue
    out.push({ x, z, turn, k: out.length, orchard: x < toX(100.487) || z > toZ(13.668) })
  }
  districts = out
  return out
}
/** The district a spot is in. */
export function districtAt(x: number, z: number): District {
  const all = allDistricts()
  let best = all[0]
  let bestD = Infinity
  for (const o of all) {
    const d = (o.x - x) ** 2 + (o.z - z) ** 2
    if (d < bestD) {
      bestD = d
      best = o
    }
  }
  return best
}
/** A spot in its district's own street grid: which square it's in ([column, row]) and where in it (0..1 each way). */
export function blockOf(o: District, x: number, z: number) {
  const [c, sn] = [Math.cos(o.turn), Math.sin(o.turn)]
  const u = (x * c + z * sn) / BLOCK
  const v = (-x * sn + z * c) / BLOCK
  return { iu: Math.floor(u), iv: Math.floor(v), fu: u - Math.floor(u), fv: v - Math.floor(v) }
}
/** The middle of a square of a district's street grid. */
export function blockMid(o: District, iu: number, iv: number): XZ {
  const [c, sn] = [Math.cos(o.turn), Math.sin(o.turn)]
  const [u, v] = [(iu + 0.5) * BLOCK, (iv + 0.5) * BLOCK]
  return [u * c - v * sn, u * sn + v * c]
}

/** A cheap wobble (about -1..1) so painted edges aren't ruler-straight. */
const wobble = (x: number, z: number) => 0.5 * Math.sin(x * 7.3 + z * 3.1) + 0.3 * Math.sin(x * 3.7 - z * 5.9) + 0.2 * Math.sin(x * 13.1 + z * 11.3)

const JUNGLE_M = JUNGLE.map(([lon, lat, r]) => [toX(lon), toZ(lat), r * DEG_M] as const)

// The field, worked out once a visit (it's the same every time).
let built: { field: Field; sea: Float32Array; w: number; h: number; x0: number; z0: number } | null = null

function build() {
  if (built) return built
  const x0 = BOARD.x0 - PAD
  const z0 = BOARD.z0 - PAD
  const w = Math.ceil((BOARD.x1 - BOARD.x0 + PAD * 2) * RES)
  const h = Math.ceil((BOARD.z1 - BOARD.z0 + PAD * 2) * RES)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  const px = ([lon, lat]: LonLat): [number, number] => [(toX(lon) - x0) * RES, (toZ(lat) - z0) * RES]
  const trace = (ring: LonLat[], close: boolean) => {
    g.beginPath()
    ring.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    if (close) g.closePath()
  }
  /** What's white on the canvas now, as a mask. */
  const mask = () => {
    const rgba = g.getImageData(0, 0, w, h).data
    const m = new Uint8Array(w * h)
    for (let i = 0; i < m.length; i++) m[i] = rgba[i * 4] > 127 ? 1 : 0
    return m
  }
  const clearAll = () => {
    g.fillStyle = '#000'
    g.fillRect(0, 0, w, h)
    g.fillStyle = g.strokeStyle = '#fff'
  }
  // ---- The water: the river's rings, less its islands.
  clearAll()
  for (const ring of WATER) {
    trace(ring, true)
    g.fill()
  }
  g.fillStyle = '#000'
  for (const ring of ISLANDS) {
    trace(ring, true)
    g.fill()
  }
  const wet = mask()
  const dry = new Uint8Array(wet.length)
  for (let i = 0; i < wet.length; i++) dry[i] = 1 - wet[i]
  const toWet = distance(wet, w, h)
  const toDry = distance(dry, w, h)
  const raw = new Float32Array(wet.length)
  for (let i = 0; i < raw.length; i++) raw[i] = (dry[i] ? Math.sqrt(toWet[i]) - 0.5 : 0.5 - Math.sqrt(toDry[i])) / RES - RIVER_FAT
  // Smoothed a little (the real banks are frilly with piers and docks: a toy river's are soft).
  const land = new Float32Array(raw.length)
  const tmp = new Float32Array(raw.length)
  const blur = (src: Float32Array, dst: Float32Array, step: number, n: number) => {
    for (let i = 0; i < src.length; i++) {
      let sum = 0
      let cnt = 0
      for (let k = -n; k <= n; k++) {
        const j = i + k * step
        if (j < 0 || j >= src.length) continue
        sum += src[j]
        cnt++
      }
      dst[i] = sum / cnt
    }
  }
  blur(raw, tmp, 1, 3)
  blur(tmp, land, w, 3)
  // ---- The lines nothing stands on: the main roads, the khlongs, under the skytrain.
  clearAll()
  g.lineWidth = 1.5
  for (const l of [...ROADS, ...KHLONGS, SKYTRAIN]) {
    trace(l, false)
    g.stroke()
  }
  const toLine = distance(mask(), w, h)
  // ---- The parks.
  clearAll()
  for (const ring of PARKS) {
    trace(ring, true)
    g.fill()
  }
  const park = mask()
  c.width = c.height = 0

  const at = (a: Float32Array, x: number, z: number) => {
    const fx0 = Math.max(0, Math.min(w - 1.001, (x - x0) * RES - 0.5))
    const fz0 = Math.max(0, Math.min(h - 1.001, (z - z0) * RES - 0.5))
    const ix = Math.floor(fx0)
    const iz = Math.floor(fz0)
    const fx = fx0 - ix
    const fz = fz0 - iz
    const i = iz * w + ix
    return (a[i] * (1 - fx) + a[i + 1] * fx) * (1 - fz) + (a[i + w] * (1 - fx) + a[i + w + 1] * fx) * fz
  }
  const cell = (x: number, z: number) => Math.max(0, Math.min(h - 1, Math.floor((z - z0) * RES))) * w + Math.max(0, Math.min(w - 1, Math.floor((x - x0) * RES)))
  const field: Field = {
    land: (x, z) => at(land, x, z),
    height: (x, z) => {
      const up = smoothstep(-CLIFF_W, 0.006, at(land, x, z))
      return LEVEL.floor + (LEVEL.land - LEVEL.floor) * up
    },
    clear: (x, z) => Math.sqrt(toLine[cell(x, z)]) / RES,
    park: (x, z) => park[cell(x, z)] === 1,
    jungle: (x, z) => at(land, x, z) > 0.02 && JUNGLE_M.some(([jx, jz, r]) => Math.hypot(x - jx, z - jz) < r + wobble(x * 3, z * 3) * 0.03),
  }
  // The river's own picture: how far out from the bank each spot is.
  const sea = new Float32Array(land.length)
  for (let i = 0; i < sea.length; i++) sea[i] = Math.max(0, -land[i]) * SEA_STRETCH
  built = { field, sea, w, h, x0, z0 }
  return built
}

export function buildField(): Field {
  return build().field
}

/** The river, the size of the board: calm water, a thin white line along both banks. */
export function buildSea(bag: Bag) {
  const b = build()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  return new Sea(
    { data: b.sea, w: b.w, h: b.h, x0: b.x0, z0: b.z0, x1: b.x0 + b.w / RES, z1: b.z0 + b.h / RES },
    { w: W, d: D, cx: (BOARD.x0 + BOARD.x1) / 2, cz: (BOARD.z0 + BOARD.z1) / 2 },
    bag,
    RIVER,
    { rings: 0, dashes: 0 },
  )
}

export interface GroundInput {
  /** Soft shadows painted under things: [x, z, radius]. */
  shadows: [number, number, number][]
  /** Paved squares painted under the places and the big toys: [x, z, radius]. */
  plazas: [number, number, number][]
  /** The long afternoon shadows the towers throw across the map: [x, z, how wide the tower is, how tall]. */
  casts: [number, number, number, number][]
}

/** Which way the afternoon shadows fall on the board (east and a little south), and how long for a meter of tower. */
const SUN = { x: 0.86, z: 0.5, len: 0.8 }

// The painted top, once a visit (the same every time).
let painted: HTMLCanvasElement | null = null
let paintedFor = ''

/** The land: one mesh shaped by the field, with its painted top. */
export function buildGround(bag: Bag, input: GroundInput) {
  const f = buildField()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const nx = Math.round(W * MESH)
  const nz = Math.round(D * MESH)
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3)
  const uv = new Float32Array((nx + 1) * (nz + 1) * 2)
  let i = 0
  for (let r = 0; r <= nz; r++) {
    const z = BOARD.z0 + (r / nz) * D
    for (let c = 0; c <= nx; c++, i++) {
      const x = BOARD.x0 + (c / nx) * W
      pos.set([x, f.height(x, z), z], i * 3)
      uv.set([c / nx, 1 - r / nz], i * 2)
    }
  }
  const index = new Uint32Array(nx * nz * 6)
  let k = 0
  for (let r = 0; r < nz; r++)
    for (let c = 0; c < nx; c++) {
      const a = r * (nx + 1) + c
      const b = a + nx + 1
      index.set([a, b, a + 1, a + 1, b, b + 1], k)
      k += 6
    }
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  geo.setIndex(new BufferAttribute(index, 1))
  geo.computeVertexNormals()
  const key = `${input.shadows.length}/${input.plazas.length}/${input.casts.length}`
  if (!painted || paintedFor !== key) {
    painted = paint(f, input)
    paintedFor = key
  }
  const tex = bag.add(new CanvasTexture(painted))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const mat = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  return new Mesh(geo, mat)
}

/** The districts' paper: creams and peaches close together (a map's print, not a quilt), and the orchards' greens. */
const BLOCKS: [number, number, number][] = [[255, 244, 226], [255, 238, 220], [255, 246, 214], [255, 240, 230]]
const ORCHARDS: [number, number, number][] = [[218, 241, 198], [226, 244, 206], [211, 238, 194]]

function paint(f: Field, { shadows, plazas, casts }: GroundInput) {
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const w = Math.round(W * TEX)
  const h = Math.round(D * TEX)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  // The colors, worked out at half the texture's size (then drawn up smoothly: the lines go on at full size).
  const bw = Math.round(w / 2)
  const bh = Math.round(h / 2)
  const base = document.createElement('canvas')
  base.width = bw
  base.height = bh
  const bg = base.getContext('2d')!
  const img = bg.createImageData(bw, bh)
  const data = img.data
  /** Which district each spot of plain city is in (255: none: water, a park, the jungle). */
  const cells = new Uint8Array(bw * bh).fill(255)
  let o = 0
  for (let py = 0; py < bh; py++) {
    const z = BOARD.z0 + ((py + 0.5) / bh) * D
    for (let px = 0; px < bw; px++, o += 4) {
      const x = BOARD.x0 + ((px + 0.5) / bw) * W
      const d = f.land(x, z)
      const n = wobble(x * 2.2, z * 2.2)
      let col: [number, number, number]
      if (d < -CLIFF_W * 0.8) col = C.wet
      else if (d < 0) col = d < -CLIFF_W * 0.4 ? C.quayLow : C.quay
      else if (d < 0.03) col = C.walk
      else if (f.jungle(x, z)) col = n > 0.25 ? C.jungleDeep : C.jungle
      else if (f.park(x, z)) col = C.park
      else {
        // (A wobbly edge between one district and the next.)
        const dist = districtAt(x + n * 0.03, z + wobble(z * 2.2, x * 2.2) * 0.03)
        col = dist.orchard ? ORCHARDS[dist.k % ORCHARDS.length] : BLOCKS[dist.k % BLOCKS.length]
        cells[py * bw + px] = dist.k
      }
      data[o] = col[0]
      data[o + 1] = col[1]
      data[o + 2] = col[2]
      data[o + 3] = 255
    }
  }
  bg.putImageData(img, 0, 0)
  g.imageSmoothingEnabled = true
  g.drawImage(base, 0, 0, w, h)

  const P = ([x, z]: XZ): [number, number] => [(x - BOARD.x0) * TEX, (z - BOARD.z0) * TEX]
  const line = (pts: LonLat[]) => {
    g.beginPath()
    pts.forEach(([lon, lat], i) => (i ? g.lineTo(...P(ll(lon, lat))) : g.moveTo(...P(ll(lon, lat)))))
  }
  g.lineCap = g.lineJoin = 'round'
  let seed = 11
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)

  // ---- Each district's little streets (pale lines, leaning its own way), and the orchards' rows of trees.
  {
    const over = document.createElement('canvas')
    over.width = w
    over.height = h
    const og = over.getContext('2d')!
    const oi = og.createImageData(w, h)
    const od = oi.data
    const all = allDistricts()
    const cs = all.map((d) => Math.cos(d.turn))
    const sn = all.map((d) => Math.sin(d.turn))
    for (let py = 0; py < h; py++) {
      const z = BOARD.z0 + ((py + 0.5) / h) * D
      const row = Math.min(bh - 1, py >> 1) * bw
      for (let px = 0; px < w; px++) {
        const k = cells[row + Math.min(bw - 1, px >> 1)]
        if (k === 255) continue
        const x = BOARD.x0 + ((px + 0.5) / w) * W
        const u = (x * cs[k] + z * sn[k]) / BLOCK
        const v = (-x * sn[k] + z * cs[k]) / BLOCK
        const fu = u - Math.floor(u)
        const fv = v - Math.floor(v)
        const i = (py * w + px) * 4
        if (all[k].orchard) {
          // The orchards' rows: a soft stripe down every square (Thonburi's orchards are ditch after ditch).
          const off = Math.abs(fu - 0.5)
          if (off > 0.16) continue
          od[i] = 168
          od[i + 1] = 220
          od[i + 2] = 158
          od[i + 3] = off > 0.1 ? 45 : 90
        } else {
          // The little streets: a thin warm print.
          const edge = Math.min(fu, 1 - fu, fv, 1 - fv)
          if (edge > 0.06) continue
          od[i] = 232
          od[i + 1] = 192
          od[i + 2] = 160
          od[i + 3] = edge > 0.035 ? 50 : 105
        }
      }
    }
    og.putImageData(oi, 0, 0)
    g.drawImage(over, 0, 0)
    over.width = over.height = 0
  }

  // ---- The parks: lighter and darker lawn, a pale path round each lake, the lakes.
  for (let n = 0; n < 2400; n++) {
    const x = BOARD.x0 + rnd() * W
    const z = BOARD.z0 + rnd() * D
    const jungle = f.jungle(x, z)
    if (!jungle && !f.park(x, z)) continue
    const [cx, cy] = P([x, z])
    g.fillStyle = jungle ? (rnd() > 0.5 ? 'rgba(74,170,112,0.28)' : 'rgba(196,244,170,0.3)') : rnd() > 0.5 ? 'rgba(120,206,128,0.3)' : 'rgba(214,248,186,0.4)'
    g.beginPath()
    g.ellipse(cx, cy, TEX * (0.014 + rnd() * 0.024), TEX * (0.012 + rnd() * 0.016), rnd() * 3, 0, Math.PI * 2)
    g.fill()
  }
  for (const [lon, lat, rx, ry] of LAKES) {
    const [cx, cy] = P(ll(lon, lat))
    g.fillStyle = '#FFFDF4'
    g.beginPath()
    g.ellipse(cx, cy, rx * DEG_M * TEX + 5, ry * DEG_M * TEX + 5, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#8FD8F2'
    g.beginPath()
    g.ellipse(cx, cy, rx * DEG_M * TEX, ry * DEG_M * TEX, 0, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#BDEAFA'
    g.beginPath()
    g.ellipse(cx - 3, cy - 2, rx * DEG_M * TEX * 0.5, ry * DEG_M * TEX * 0.4, 0, 0, Math.PI * 2)
    g.fill()
  }

  // ---- The compass, out in the quiet corner: a ring, four long points and four short ones, the north one pink.
  {
    const [cx, cy] = P(COMPASS.at)
    const r = COMPASS.r * TEX
    g.fillStyle = 'rgba(255,253,246,0.9)'
    g.beginPath()
    g.arc(cx, cy, r * 1.08, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#F6C6B4'
    g.lineWidth = r * 0.06
    g.beginPath()
    g.arc(cx, cy, r * 0.86, 0, Math.PI * 2)
    g.stroke()
    const point = (a: number, len: number, wide: number, light: string, dark: string) => {
      const [tx, ty] = [cx + Math.sin(a) * len, cy - Math.cos(a) * len]
      for (const [side, col] of [[-1, light], [1, dark]] as const) {
        g.fillStyle = col
        g.beginPath()
        g.moveTo(cx, cy)
        g.lineTo(cx + Math.sin(a + side * Math.PI / 2) * wide, cy - Math.cos(a + side * Math.PI / 2) * wide)
        g.lineTo(tx, ty)
        g.closePath()
        g.fill()
      }
    }
    for (let i = 0; i < 4; i++) point(Math.PI / 4 + (i * Math.PI) / 2, r * 0.56, r * 0.13, '#FFE9A8', '#FFD36B')
    for (let i = 1; i < 4; i++) point((i * Math.PI) / 2, r * 0.98, r * 0.17, '#DCCBFF', '#B9A6F5')
    point(0, r * 1.02, r * 0.17, '#FF9DC0', '#FF5C9A')
    g.fillStyle = '#FFFFFF'
    g.beginPath()
    g.arc(cx, cy, r * 0.1, 0, Math.PI * 2)
    g.fill()
  }

  // ---- Paved squares under the places and the big toys.
  for (const [x, z, r] of plazas) {
    const [cx, cy] = P([x, z])
    g.fillStyle = 'rgba(255,253,246,0.92)'
    g.beginPath()
    g.ellipse(cx, cy, r * TEX, r * TEX * 0.86, 0, 0, Math.PI * 2)
    g.fill()
  }

  // ---- The khlongs: pale banks, the water, a brighter middle.
  for (const k of KHLONGS) {
    line(k)
    g.strokeStyle = '#FFFDF4'
    g.lineWidth = TEX * 0.034
    g.stroke()
    g.strokeStyle = '#7FD6EC'
    g.lineWidth = TEX * 0.022
    g.stroke()
    g.strokeStyle = '#B4ECF6'
    g.lineWidth = TEX * 0.007
    g.stroke()
  }

  // ---- The main roads: a soft pink kerb, the cream road on it.
  for (const r of ROADS) {
    line(r)
    g.strokeStyle = 'rgba(240,188,168,0.8)'
    g.lineWidth = TEX * 0.042
    g.stroke()
  }
  for (const r of ROADS) {
    line(r)
    g.strokeStyle = '#FFFFFF'
    g.lineWidth = TEX * 0.028
    g.stroke()
  }

  // ---- The towers' long afternoon shadows, all falling the same way: the skyline stands up off the paper.
  for (const [x, z, wide, tall] of casts) {
    const len = tall * SUN.len
    const [ax, ay] = P([x, z])
    const [bx, by] = P([x + SUN.x * len, z + SUN.z * len])
    const grad = g.createLinearGradient(ax, ay, bx, by)
    grad.addColorStop(0, 'rgba(160,110,150,0.42)')
    grad.addColorStop(1, 'rgba(168,120,150,0)')
    g.strokeStyle = grad
    g.lineWidth = wide * TEX * 0.9
    g.lineCap = 'butt'
    g.beginPath()
    g.moveTo(ax, ay)
    g.lineTo(bx, by)
    g.stroke()
    g.lineCap = 'round'
  }

  // ---- Soft shadows under the towers, the trees and the toys.
  for (const [x, z, r] of shadows) {
    const [cx, cy] = P([x + r * 0.2, z + r * 0.28])
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r * TEX)
    grad.addColorStop(0, 'rgba(150,110,150,0.3)')
    grad.addColorStop(0.6, 'rgba(150,110,150,0.14)')
    grad.addColorStop(1, 'rgba(150,110,150,0)')
    g.fillStyle = grad
    g.beginPath()
    g.ellipse(cx, cy, r * TEX, r * TEX * 0.8, 0, 0, Math.PI * 2)
    g.fill()
  }

  return c
}
