// Land from data: a height field sampled once on a grid (an island's hills and beaches, a reef), meshed with vertex
// colors (sand, wet sand, grass, rock bands in the toon palette) and toon-shaded like everything else. heightAt() reads
// the same grid back for whatever walks, drives or lands on it. Built for Koh Samet (the plan's tech plan:
// planning/around-the-world/thailand/samet-trip.html), kept in the engine so any 3D country can use it.
//
// The grid also carries the sea's numbers (`sea`): how deep the water is and how far it is to the shore, packed into a
// small texture the lagoon water reads (lagoon.ts), so the shallows turn turquoise and the foam runs along the sand.
import { BufferAttribute, DataTexture, LinearFilter, Mesh, PlaneGeometry, RGBAFormat, type ColorRepresentation, Color } from 'three'
import type { Bag } from './dispose'
import { toon } from './toon'

export interface TerrainOpts {
  /** The grid's corners (meters) and its cell size. */
  x0: number
  z0: number
  x1: number
  z1: number
  cell: number
  /** Height at a point (negative under the sea), and the shore distance there (positive at sea, negative on land). */
  sample(x: number, z: number): { h: number; shore: number }
  /** The ground's color at a point. */
  color(x: number, z: number, h: number, shore: number, slope: number): ColorRepresentation
}

const c = new Color()
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export class Terrain {
  readonly mesh: Mesh
  /** Depth (R: meters × 20, so 0..12.75 m) and shore distance (G: meters × 4, so 0..63.75 m) of the sea, for lagoon.ts. */
  readonly sea: DataTexture
  readonly nx: number
  readonly nz: number
  private hs: Float32Array
  private ss: Float32Array

  constructor(readonly o: TerrainOpts, bag: Bag) {
    const nx = (this.nx = Math.round((o.x1 - o.x0) / o.cell) + 1)
    const nz = (this.nz = Math.round((o.z1 - o.z0) / o.cell) + 1)
    const hs = (this.hs = new Float32Array(nx * nz))
    const ss = (this.ss = new Float32Array(nx * nz))
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const s = o.sample(o.x0 + i * o.cell, o.z0 + j * o.cell)
        hs[j * nx + i] = s.h
        ss[j * nx + i] = s.shore
      }
    // The mesh: one vertex per grid point (PlaneGeometry's vertices run along x, then z).
    const geo = new PlaneGeometry(o.x1 - o.x0, o.z1 - o.z0, nx - 1, nz - 1)
    geo.rotateX(-Math.PI / 2)
    geo.translate((o.x0 + o.x1) / 2, 0, (o.z0 + o.z1) / 2)
    const pos = geo.attributes.position as BufferAttribute
    const rgb = new Float32Array(pos.count * 3)
    for (let k = 0; k < pos.count; k++) {
      const i = Math.round((pos.getX(k) - o.x0) / o.cell)
      const j = Math.round((pos.getZ(k) - o.z0) / o.cell)
      const h = hs[j * nx + i]
      pos.setY(k, h)
      const dx = (hs[j * nx + Math.min(nx - 1, i + 1)] - hs[j * nx + Math.max(0, i - 1)]) / (2 * o.cell)
      const dz = (hs[Math.min(nz - 1, j + 1) * nx + i] - hs[Math.max(0, j - 1) * nx + i]) / (2 * o.cell)
      c.set(o.color(pos.getX(k), pos.getZ(k), h, ss[j * nx + i], Math.hypot(dx, dz)))
      rgb.set([c.r, c.g, c.b], k * 3)
    }
    geo.setAttribute('color', new BufferAttribute(rgb, 3))
    geo.computeVertexNormals()
    this.mesh = new Mesh(bag.add(geo), toon('#ffffff', true))
    // The sea's numbers, one texel per grid point.
    const data = new Uint8Array(nx * nz * 4)
    for (let k = 0; k < nx * nz; k++) {
      data[k * 4] = clamp(Math.round(-hs[k] * 20), 0, 255)
      data[k * 4 + 1] = clamp(Math.round(ss[k] * 4), 0, 255)
      data[k * 4 + 2] = 0
      data[k * 4 + 3] = 255
    }
    this.sea = bag.add(new DataTexture(data, nx, nz, RGBAFormat))
    this.sea.magFilter = this.sea.minFilter = LinearFilter
    this.sea.needsUpdate = true
  }

  private at(arr: Float32Array, x: number, z: number, outside: number) {
    const o = this.o
    const fx = (x - o.x0) / o.cell
    const fz = (z - o.z0) / o.cell
    if (fx < 0 || fz < 0 || fx > this.nx - 1 || fz > this.nz - 1) return outside
    const i = Math.min(this.nx - 2, Math.floor(fx))
    const j = Math.min(this.nz - 2, Math.floor(fz))
    const u = fx - i
    const v = fz - j
    const n = this.nx
    const a = arr[j * n + i] * (1 - u) + arr[j * n + i + 1] * u
    const b = arr[(j + 1) * n + i] * (1 - u) + arr[(j + 1) * n + i + 1] * u
    return a * (1 - v) + b * v
  }
  /** The ground's height (meters; under the sea it's negative). */
  heightAt(x: number, z: number) {
    return this.at(this.hs, x, z, -12)
  }
  /** Meters to the shore: positive at sea, negative on land (off the grid: far out at sea). */
  shoreAt(x: number, z: number) {
    return this.at(this.ss, x, z, 64)
  }
  /** Where the sea texture lies (for lagoon.ts): one texel centered on each grid point. */
  get seaBox() {
    const o = this.o
    return { x0: o.x0 - o.cell / 2, z0: o.z0 - o.cell / 2, w: this.nx * o.cell, d: this.nz * o.cell }
  }
}
