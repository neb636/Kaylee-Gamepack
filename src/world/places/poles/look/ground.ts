// Ground for the Poles' sets: a height field meshed with vertex colors (engine3d/terrain.ts is the island-sized
// version; this one is a single small mesh with no sea texture), smooth-shaded so a snowfield reads as soft rolling
// drifts instead of a flat slab. Snow, tundra, the ice cliff where Antarctica meets the sea.
import { BufferAttribute, BufferGeometry, Color, PlaneGeometry, type ColorRepresentation } from 'three'
import { smoothstep } from '../../../../sdk/math'

export interface FieldOpts {
  x0: number
  x1: number
  z0: number
  z1: number
  cell: number
  height(x: number, z: number): number
  color(x: number, z: number, h: number, slope: number): ColorRepresentation
}

/** A height field from x0..x1, z0..z1 (smooth normals, vertex colors), ready for `solid(geo, bag, 0)`. */
export function field(o: FieldOpts): BufferGeometry {
  const w = o.x1 - o.x0
  const d = o.z1 - o.z0
  const nx = Math.max(2, Math.round(w / o.cell))
  const nz = Math.max(2, Math.round(d / o.cell))
  const g = new PlaneGeometry(w, d, nx, nz).rotateX(-Math.PI / 2).translate(o.x0 + w / 2, 0, o.z0 + d / 2)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, o.height(pos.getX(i), pos.getZ(i)))
  g.computeVertexNormals()
  const nrm = g.attributes.normal
  const rgb = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    c.set(o.color(pos.getX(i), pos.getZ(i), pos.getY(i), 1 - nrm.getY(i)))
    rgb.set([c.r, c.g, c.b], i * 3)
  }
  g.setAttribute('color', new BufferAttribute(rgb, 3))
  g.deleteAttribute('uv')
  return g
}

// A little 2D value noise (the same every time).
function hash(x: number, z: number) {
  const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return h - Math.floor(h)
}
export function noise(x: number, z: number) {
  const xi = Math.floor(x)
  const zi = Math.floor(z)
  const xf = x - xi
  const zf = z - zi
  const u = xf * xf * (3 - 2 * xf)
  const v = zf * zf * (3 - 2 * zf)
  const a = hash(xi, zi)
  const b = hash(xi + 1, zi)
  const c = hash(xi, zi + 1)
  const e = hash(xi + 1, zi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v
}
export const fbm = (x: number, z: number) => noise(x, z) * 0.55 + noise(x * 2.03 + 17, z * 2.03) * 0.3 + noise(x * 4.1, z * 4.1 + 31) * 0.15

/** How far (m) a point is outside a box (0 inside). */
export const outside = (x: number, z: number, b: { x0: number; x1: number; z0: number; z1: number }) => Math.hypot(Math.max(b.x0 - x, 0, x - b.x1), Math.max(b.z0 - z, 0, z - b.z1))

const tmp = new Color()
/** Snow's colors: white on the tops, a soft lilac-blue in the hollows and on the steep sides. */
export function snowColor(h: number, slope: number, lo: number, hi: number, out = new Color()) {
  out.set('#FFFFFF')
  out.lerp(tmp.set('#E1E9FB'), smoothstep(hi, lo, h) * 0.85)
  out.lerp(tmp.set('#C9D6F4'), smoothstep(0.08, 0.3, slope) * 0.7)
  return out
}

/** An ice cliff: a wall along a line from (x0, z0) to (x1, z1), from `top` down to `bottom`, its face crinkled
 *  into facets, snow along its lip and turquoise down to the water at `water`. Faces toward +x of the line's
 *  direction turned right (pass the ends in the order that makes it face the camera). */
export function iceCliff(x0: number, z0: number, x1: number, z1: number, top: number, bottom: number, water: number, seed = 1): BufferGeometry {
  const len = Math.hypot(x1 - x0, z1 - z0)
  const n = Math.max(4, Math.round(len / 1.6))
  const rows = 6
  const tx = (x1 - x0) / len
  const tz = (z1 - z0) / len
  // (Outward: the line's direction turned right.)
  const ox = tz
  const oz = -tx
  const pts: number[][] = []
  for (let j = 0; j <= rows; j++) {
    const k = j / rows
    const y = top + (bottom - top) * k
    const row: number[] = []
    for (let i = 0; i <= n; i++) {
      const s = (i / n) * len
      const bulge = (noise(s * 0.45 + seed, k * 3) - 0.5) * 1.1 + (j === 0 ? -0.15 : 0) + k * 0.4
      row.push(x0 + tx * s + ox * bulge, y + (j > 0 && j < rows ? (noise(s * 0.7, j + seed) - 0.5) * 0.3 : 0), z0 + tz * s + oz * bulge)
    }
    pts.push(row)
  }
  const pos: number[] = []
  const rgb: number[] = []
  const c = new Color()
  const tri = (a: number[], b: number[], e: number[], i: number) => {
    pos.push(...a, ...b, ...e)
    const cy = (a[1] + b[1] + e[1]) / 3
    if (cy > top - 0.35) c.set('#FFFFFF')
    else if (cy > water + 0.15) c.set(hash(i, cy) < 0.4 ? '#BFE6F8' : hash(i, cy * 3) < 0.6 ? '#D5EFFB' : '#A9DDF3')
    else c.set('#6FD0EC')
    for (let k = 0; k < 3; k++) rgb.push(c.r, c.g, c.b)
  }
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < n; i++) {
      const a = [pts[j][i * 3], pts[j][i * 3 + 1], pts[j][i * 3 + 2]]
      const b = [pts[j][i * 3 + 3], pts[j][i * 3 + 4], pts[j][i * 3 + 5]]
      const e = [pts[j + 1][i * 3], pts[j + 1][i * 3 + 1], pts[j + 1][i * 3 + 2]]
      const f = [pts[j + 1][i * 3 + 3], pts[j + 1][i * 3 + 4], pts[j + 1][i * 3 + 5]]
      tri(a, b, e, i * 7 + j)
      tri(b, f, e, i * 7 + j + 3)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('color', new BufferAttribute(new Float32Array(rgb), 3))
  g.computeVertexNormals()
  return g
}
