// The Krabi map's ground, in the Thailand map's look (hub/map/terrain.ts): Krabi, Phuket's east side and the islands
// stand up out of a turquoise sea like slices of cake (the real coasts, coast.ts), their cut edges in two cake layers.
// The tops are painted: soft greens that darken up the hills, sandy beaches along the shore, dark mangroves round the
// top of Phang Nga Bay, rubber and oil palm rows inland, the Krabi River and the creeks with pale banks, cream roads
// with a dashed middle (and the road on to Ao Nang), a soft shadow under every tree and toy. The sea (the Thailand
// map's Sea) foams along every shore and round every rock tower.
import { BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'
import { smoothstep } from '../../../../../../sdk/math'
import { distance } from '../../hub/map/field'
import { Sea } from '../../hub/map/terrain'
import { ISLANDS, MAINLAND, type LonLat } from './coast'
import { BOARD, CLIFF_W, DEG_M, HILLS, KARSTS, LEVEL, ll, RIVER_W, RIVERS, toX, toZ, TOY_ISLANDS, type XZ } from './layout'

/** Field cells per meter, ground mesh cells per meter, painted pixels per meter. */
const RES = 40
const MESH = 46
const TEX = 280
/** How far the field runs past the board (m). */
const PAD = 0.5

const C = {
  sand: [255, 236, 190],
  wet: [250, 222, 168],
  cliff: [244, 200, 158],
  cliffLow: [229, 172, 130],
  rim: [222, 247, 178],
  plain: [182, 233, 160],
  south: [170, 229, 168],
  forest: [146, 216, 152],
  deep: [122, 202, 142],
  peak: [100, 188, 134],
  mangrove: [112, 190, 140],
} satisfies Record<string, [number, number, number]>

export interface Field {
  /** Meters inside land (negative: out at sea). */
  land(x: number, z: number): number
  /** The ground's height there (the sea bed under the water). */
  height(x: number, z: number): number
  /** The hills alone (0 on flat land). */
  hill(x: number, z: number): number
}

/** A cheap wobble (about -1..1) so painted edges aren't ruler-straight. */
const wobble = (x: number, z: number) => 0.5 * Math.sin(x * 7.3 + z * 3.1) + 0.3 * Math.sin(x * 3.7 - z * 5.9) + 0.2 * Math.sin(x * 13.1 + z * 11.3)

/** The hills, as meters on the board: [x, z, radius, height]. */
const HILLS_M = HILLS.map(([lon, lat, r, h]) => [toX(lon), toZ(lat), r * DEG_M, h] as const)

// The field, worked out once a visit (it's the same every time: the map is built on every trip back to it).
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
  g.fillStyle = '#000'
  g.fillRect(0, 0, w, h)
  g.fillStyle = '#fff'
  for (const ring of [MAINLAND, ...ISLANDS]) {
    g.beginPath()
    ring.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    g.closePath()
    g.fill()
  }
  for (const [lon, lat, rx, ry] of TOY_ISLANDS) {
    const [cx, cy] = px([lon, lat])
    g.beginPath()
    g.ellipse(cx, cy, rx * DEG_M * RES, ry * DEG_M * RES, 0, 0, Math.PI * 2)
    g.fill()
  }
  const rgba = g.getImageData(0, 0, w, h).data
  c.width = c.height = 0
  const on = new Uint8Array(w * h)
  const off = new Uint8Array(w * h)
  for (let i = 0; i < on.length; i++) {
    on[i] = rgba[i * 4] > 127 ? 1 : 0
    off[i] = 1 - on[i]
  }
  const toIn = distance(on, w, h)
  const toOut = distance(off, w, h)
  const land = new Float32Array(on.length)
  for (let i = 0; i < land.length; i++) land[i] = (on[i] ? Math.sqrt(toOut[i]) - 0.5 : 0.5 - Math.sqrt(toIn[i])) / RES
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
  const hill = (x: number, z: number) => {
    let up = 0
    for (const [hx, hz, r, top] of HILLS_M) {
      const d = Math.hypot(x - hx, z - hz)
      if (d < r) up += (top * (1 + Math.cos((Math.PI * d) / r))) / 2
    }
    return up
  }
  const field: Field = {
    land: (x, z) => at(land, x, z),
    hill: (x, z) => hill(x, z) * smoothstep(0.02, 0.35, at(land, x, z)),
    height: (x, z) => {
      const d = at(land, x, z)
      // Out at sea: the sea bed. The land stands up from it with a steep, rounded edge; its hills start a little way in.
      const up = smoothstep(-CLIFF_W, 0.012, d)
      if (up <= 0) return LEVEL.floor
      return LEVEL.floor + (LEVEL.land + hill(x, z) * smoothstep(0.02, 0.35, d) - LEVEL.floor) * up
    },
  }
  // The sea's own picture: how far out each spot is, plus a little shoal round each rock tower so it foams at its foot.
  const sea = new Float32Array(land.length)
  const karsts = KARSTS.map(([lon, lat, s]) => [...ll(lon, lat), 0.09 * s] as const)
  for (let iz = 0; iz < h; iz++)
    for (let ix = 0; ix < w; ix++) {
      const i = iz * w + ix
      let d = Math.max(0, -land[i])
      const x = x0 + (ix + 0.5) / RES
      const z = z0 + (iz + 0.5) / RES
      for (const [kx, kz, r] of karsts) {
        const k = Math.hypot(x - kx, z - kz) - r
        if (k < d) d = Math.max(0, k)
      }
      // (The shader's bands and foam are sized for the Thailand map: here the bay is narrower, so its water reads a
      // little deeper.)
      sea[i] = d * 0.62
    }
  built = { field, sea, w, h, x0, z0 }
  return built
}

export function buildField(): Field {
  return build().field
}

/** The sea, the size of the board, foaming along the real coasts. */
export function buildSea(bag: Bag) {
  const b = build()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  return new Sea(
    { data: b.sea, w: b.w, h: b.h, x0: b.x0, z0: b.z0, x1: b.x0 + b.w / RES, z1: b.z0 + b.h / RES },
    { w: W, d: D, cx: (BOARD.x0 + BOARD.x1) / 2, cz: (BOARD.z0 + BOARD.z1) / 2 },
    bag,
  )
}

export interface GroundInput {
  roads: XZ[][]
  /** Roads painted that don't go anywhere yet (a little paler). */
  more: XZ[][]
  /** Soft shadows painted under things: [x, z, radius]. */
  shadows: [number, number, number][]
  /** Keep the palm rows off these: [x, z, radius]. */
  keep: [number, number, number][]
}

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
  const key = JSON.stringify(input.shadows.length)
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

/** Ao Phang Nga's mangroves: along the top of the bay, where the creeks come out. */
const inMangroves = (x: number, z: number) => z < toZ(8.3) && x > toX(98.44) && x < toX(98.86)

function paint(f: Field, { roads, more, shadows, keep }: GroundInput) {
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
  let o = 0
  for (let py = 0; py < bh; py++) {
    const z = BOARD.z0 + ((py + 0.5) / bh) * D
    for (let px = 0; px < bw; px++, o += 4) {
      const x = BOARD.x0 + ((px + 0.5) / bw) * W
      const d = f.land(x, z)
      const n = wobble(x * 2.2, z * 2.2)
      let col: [number, number, number]
      if (d < -CLIFF_W * 0.75) col = C.wet
      else if (d < 0) {
        // The cut edge, in two layers like cake.
        col = d < -CLIFF_W * 0.4 ? C.cliffLow : C.cliff
      } else {
        const up = f.hill(x, z)
        if (d < 0.045 + n * 0.012) col = inMangroves(x, z) ? C.mangrove : C.sand
        else if (d < 0.075 + n * 0.01) col = C.rim
        else if (up > 0.38 + n * 0.03) col = C.peak
        else if (up > 0.22 + n * 0.03) col = C.deep
        else if (up > 0.08 + n * 0.02) col = C.forest
        else if (z > toZ(7.95)) col = C.south
        else col = C.plain
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
  const path = (pts: XZ[]) => {
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p))))
  }
  const smooth = (pts: XZ[]) => {
    const q = pts.map(P)
    g.beginPath()
    g.moveTo(...q[0])
    for (let i = 0; i < q.length - 1; i++) {
      const [p0, p1, p2, p3] = [q[Math.max(0, i - 1)], q[i], q[i + 1], q[Math.min(q.length - 1, i + 2)]]
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1])
    }
  }
  g.lineCap = g.lineJoin = 'round'
  let seed = 5
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const near = (x: number, z: number, lines: XZ[][], r: number) => lines.some((l) => l.some(([lx, lz], i) => i % 2 === 0 && Math.hypot(lx - x, lz - z) < r))

  // ---- Rows of rubber trees and oil palms on the flat land inland: little patches of dotted rows.
  const rivers = RIVERS.map((r) => r.map(([lon, lat]) => ll(lon, lat)))
  const rows = ['#A6DE9A', '#B4E5A2', '#9BD69A']
  for (let z = BOARD.z0 + 0.15; z < BOARD.z1 - 0.1; z += 0.13)
    for (let x = BOARD.x0 + 0.15 + ((z * 7) % 0.05); x < BOARD.x1 - 0.1; x += 0.16) {
      const fx = x + (rnd() - 0.5) * 0.03
      const fz = z + (rnd() - 0.5) * 0.02
      if (f.land(fx, fz) < 0.18 || f.hill(fx, fz) > 0.05 || near(fx, fz, roads, 0.09) || near(fx, fz, rivers, 0.1)) continue
      if (keep.some(([kx, kz, r]) => Math.hypot(kx - fx, kz - fz) < r) || wobble(x * 0.9 + 1.3, z * 0.8 - 2.1) < 0.2 || rnd() > 0.8) continue
      const [cx, cy] = P([fx, fz])
      g.save()
      g.translate(cx, cy)
      g.rotate((rnd() - 0.5) * 0.3)
      const fw = TEX * (0.12 + rnd() * 0.02)
      const fh = TEX * (0.085 + rnd() * 0.015)
      g.fillStyle = rows[Math.floor(rnd() * rows.length)]
      g.beginPath()
      g.roundRect(-fw / 2, -fh / 2, fw, fh, TEX * 0.012)
      g.fill()
      g.fillStyle = 'rgba(80,160,100,0.45)'
      for (let ry = -1; ry <= 1; ry++) for (let rx = -2; rx <= 2; rx++) {
        g.beginPath()
        g.arc((rx * fw) / 5.5, (ry * fh) / 3.6, TEX * 0.006, 0, Math.PI * 2)
        g.fill()
      }
      g.restore()
    }

  // ---- The mangroves at the top of the bay: dark round bushes along the shore.
  for (let n = 0; n < 900; n++) {
    const x = BOARD.x0 + rnd() * W
    const z = BOARD.z0 + rnd() * D
    const d = f.land(x, z)
    if (!inMangroves(x, z) || d < 0.005 || d > 0.11) continue
    const [cx, cy] = P([x, z])
    g.fillStyle = rnd() > 0.5 ? '#5FAE80' : '#6DBB8A'
    g.beginPath()
    g.arc(cx, cy, TEX * (0.012 + rnd() * 0.008), 0, Math.PI * 2)
    g.fill()
  }

  // ---- Soft shadows under the trees and the toys.
  for (const [x, z, r] of shadows) {
    const [cx, cy] = P([x, z + r * 0.25])
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r * TEX)
    grad.addColorStop(0, 'rgba(60,120,80,0.3)')
    grad.addColorStop(0.6, 'rgba(60,120,80,0.15)')
    grad.addColorStop(1, 'rgba(60,120,80,0)')
    g.fillStyle = grad
    g.beginPath()
    g.ellipse(cx, cy, r * TEX, r * TEX * 0.8, 0, 0, Math.PI * 2)
    g.fill()
  }

  // ---- The Krabi River and the creeks: pale banks, the water, a brighter middle.
  for (const r of rivers) {
    smooth(r)
    g.strokeStyle = '#F2FBFF'
    g.lineWidth = TEX * (RIVER_W + 0.04)
    g.stroke()
    g.strokeStyle = '#8FD3F2'
    g.lineWidth = TEX * RIVER_W
    g.stroke()
    g.strokeStyle = '#B9E6FA'
    g.lineWidth = TEX * RIVER_W * 0.4
    g.stroke()
  }

  // ---- The roads: cream with a warm edge and a dashed white middle (the ones that don't go anywhere yet: no dashes).
  for (const l of [...roads, ...more]) {
    smooth(l)
    g.strokeStyle = '#EBCB9E'
    g.lineWidth = TEX * 0.078
    g.stroke()
  }
  for (const l of [...roads, ...more]) {
    smooth(l)
    g.strokeStyle = '#FFF4DC'
    g.lineWidth = TEX * 0.06
    g.stroke()
  }
  g.strokeStyle = '#FFFFFF'
  g.lineWidth = TEX * 0.009
  g.setLineDash([TEX * 0.03, TEX * 0.035])
  for (const l of roads) {
    path(l)
    g.stroke()
  }
  g.setLineDash([])
  return c
}
