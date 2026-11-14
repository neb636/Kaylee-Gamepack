// The Krabi map's ground: Krabi, Phuket's east side and the islands stand up out of an emerald sea like slices of cake
// (the real coasts, coast.ts), their cut edges in two cake layers. The tops are painted: wide pale beaches along the
// shore, bright jungle greens that deepen up the hills, dark mangroves round the top of Phang Nga Bay, the Krabi River
// and the creeks with pale banks, a soft shadow under every palm, rock and toy. No roads and no fields: this is a map
// of sea, rock and beach. The sea (the Thailand map's Sea, in Krabi's own emerald greens) foams along every shore and
// round every rock tower, and goes pale over the sandbars (layout.ts SHOALS). It's a calm sea: no foam rings.
import { BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'
import { smoothstep } from '../../../../../../sdk/math'
import { distance } from '../../hub/map/field'
import { Sea } from '../../hub/map/terrain'
import { ISLANDS, MAINLAND, type LonLat } from './coast'
import { BOARD, CLIFF_W, DEG_M, HILLS, KARSTS, LEVEL, ll, RIVER_W, RIVERS, SHOALS, toX, toZ, TOY_ISLANDS, type XZ } from './layout'

/** Field cells per meter, ground mesh cells per meter, painted pixels per meter. */
const RES = 40
const MESH = 36
const TEX = 280
/** How far the field runs past the board (m). */
const PAD = 0.5

const C = {
  sand: [255, 243, 208],
  wet: [252, 228, 178],
  cliff: [246, 208, 166],
  cliffLow: [232, 180, 140],
  rim: [214, 244, 170],
  plain: [166, 230, 150],
  south: [158, 226, 158],
  forest: [122, 208, 140],
  deep: [96, 192, 130],
  peak: [80, 178, 122],
  mangrove: [92, 180, 132],
} satisfies Record<string, [number, number, number]>

/** Krabi's water: pale mint over the sand, emerald, then a deep teal out in the Andaman Sea. */
const SEA = { shallow: '#CFF9E6', mid: '#74E6CF', deep: '#45C9D2', light: '#5AD3DA' }

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
      // (A tight halo: the shore's pale band reaches only a little way out from a rock.)
      for (const [kx, kz, r] of karsts) {
        const k = (Math.hypot(x - kx, z - kz) - r) * 1.7
        if (k < d) d = Math.max(0, k)
      }
      // (The shader's bands and foam are sized for the Thailand map: here the bay is narrower, so its water reads a
      // little deeper.)
      d *= 0.62
      // A sandbar or a reef flat: pale water, but no foam line (that's the shore's).
      for (const [sx, sz, r] of SHOALS) {
        const k = Math.max(0.075, 0.075 + (Math.hypot(x - sx, z - sz) - r) * 0.9 + wobble(x * 5, z * 5) * 0.02)
        if (k < d) d = k
      }
      sea[i] = d
    }
  built = { field, sea, w, h, x0, z0 }
  return built
}

export function buildField(): Field {
  return build().field
}

/** The sea, the size of the board, foaming along the real coasts. A calm sea: no foam rings drifting out from the
 *  shore, only a few wave dashes far out. */
export function buildSea(bag: Bag) {
  const b = build()
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  return new Sea(
    { data: b.sea, w: b.w, h: b.h, x0: b.x0, z0: b.z0, x1: b.x0 + b.w / RES, z1: b.z0 + b.h / RES },
    { w: W, d: D, cx: (BOARD.x0 + BOARD.x1) / 2, cz: (BOARD.z0 + BOARD.z1) / 2 },
    bag,
    SEA,
    { rings: 0, dashes: 0.35 },
  )
}

export interface GroundInput {
  /** Soft shadows painted under things: [x, z, radius]. */
  shadows: [number, number, number][]
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

function paint(f: Field, { shadows }: GroundInput) {
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
        if (d < (inMangroves(x, z) ? 0.045 : 0.075) + n * 0.016) col = inMangroves(x, z) ? C.mangrove : C.sand
        else if (d < 0.105 + n * 0.012) col = C.rim
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
  const rivers = RIVERS.map((r) => r.map(([lon, lat]) => ll(lon, lat)))

  // ---- Jungle: soft darker and lighter blots all over the green, so the land isn't one flat color.
  for (let n = 0; n < 700; n++) {
    const x = BOARD.x0 + rnd() * W
    const z = BOARD.z0 + rnd() * D
    if (f.land(x, z) < 0.13) continue
    const [cx, cy] = P([x, z])
    g.fillStyle = rnd() > 0.45 ? 'rgba(70,170,110,0.16)' : 'rgba(220,250,180,0.2)'
    g.beginPath()
    g.ellipse(cx, cy, TEX * (0.02 + rnd() * 0.03), TEX * (0.015 + rnd() * 0.02), rnd() * 3, 0, Math.PI * 2)
    g.fill()
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

  return c
}
