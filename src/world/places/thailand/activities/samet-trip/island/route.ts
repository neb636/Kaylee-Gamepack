// The beach puppy's way round the island (#357 way-finding): the best walk from one point to another over the ground
// she can walk on (the roads, the paths, the sand, the shallows; never the forest or the deep sea), found on a grid
// of cells with A*, then pulled straight wherever a straight line is just as walkable. Plain math, no three.js.
import type { XZ } from './layout'

export interface Route {
  pts: XZ[]
  /** Its length in meters, and the arc length at each point. */
  len: number
  at: number[]
}

/** A route through these points. */
export function route(pts: XZ[]): Route {
  const at = [0]
  for (let i = 1; i < pts.length; i++) at.push(at[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z))
  return { pts, len: at[at.length - 1] ?? 0, at }
}

/** The point `s` meters along a route. */
export function pointAt(r: Route, s: number): XZ {
  const { pts, at } = r
  if (pts.length === 1 || s <= 0) return pts[0]
  for (let i = 1; i < pts.length; i++)
    if (s <= at[i]) {
      const k = (s - at[i - 1]) / (at[i] - at[i - 1] || 1)
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, z: pts[i - 1].z + (pts[i].z - pts[i - 1].z) * k }
    }
  return pts[pts.length - 1]
}

/** How far along the route the point nearest (x, z) is, and how far off the route (x, z) is. */
export function project(r: Route, x: number, z: number): { s: number; off: number } {
  let best = { s: 0, off: Infinity }
  for (let i = 1; i < r.pts.length; i++) {
    const a = r.pts[i - 1]
    const b = r.pts[i]
    const dx = b.x - a.x
    const dz = b.z - a.z
    const l2 = dx * dx + dz * dz || 1
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2))
    const off = Math.hypot(x - a.x - dx * t, z - a.z - dz * t)
    if (off < best.off) best = { s: r.at[i - 1] + Math.sqrt(l2) * t, off }
  }
  if (r.pts.length === 1) best = { s: 0, off: Math.hypot(x - r.pts[0].x, z - r.pts[0].z) }
  return best
}

/** A tiny binary heap of cell indices by score. */
class Heap {
  private ids: number[] = []
  private keys: number[] = []
  get size() {
    return this.ids.length
  }
  push(id: number, key: number) {
    const { ids, keys } = this
    let i = ids.length
    ids.push(id)
    keys.push(key)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (keys[p] <= key) break
      ids[i] = ids[p]
      keys[i] = keys[p]
      i = p
    }
    ids[i] = id
    keys[i] = key
  }
  pop(): number {
    const { ids, keys } = this
    const top = ids[0]
    const id = ids.pop()!
    const key = keys.pop()!
    if (ids.length) {
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        let mk = key
        if (l < ids.length && keys[l] < mk) {
          m = l
          mk = keys[l]
        }
        if (r < ids.length && keys[r] < mk) m = r
        if (m === i) break
        ids[i] = ids[m]
        keys[i] = keys[m]
        i = m
      }
      ids[i] = id
      keys[i] = key
    }
    return top
  }
}

/** Finds walks over the ground: `cost(x, z)` is how much a meter there costs (1 on a road; Infinity: can't go). */
export class Planner {
  private nx: number
  private nz: number
  private costs: Float32Array
  constructor(
    private cost: (x: number, z: number) => number,
    private box: { x0: number; z0: number; x1: number; z1: number },
    private cell = 1.5,
  ) {
    this.nx = Math.ceil((box.x1 - box.x0) / cell)
    this.nz = Math.ceil((box.z1 - box.z0) / cell)
    this.costs = new Float32Array(this.nx * this.nz).fill(-1)
  }
  private c(i: number) {
    let v = this.costs[i]
    if (v < 0) {
      const gx = i % this.nx
      const gz = (i / this.nx) | 0
      v = this.cost(this.box.x0 + (gx + 0.5) * this.cell, this.box.z0 + (gz + 0.5) * this.cell)
      if (!Number.isFinite(v)) v = 1e9
      this.costs[i] = v
    }
    return v
  }
  private cellOf(p: XZ) {
    const gx = Math.max(0, Math.min(this.nx - 1, Math.floor((p.x - this.box.x0) / this.cell)))
    const gz = Math.max(0, Math.min(this.nz - 1, Math.floor((p.z - this.box.z0) / this.cell)))
    return gz * this.nx + gx
  }
  private center(i: number): XZ {
    return { x: this.box.x0 + ((i % this.nx) + 0.5) * this.cell, z: this.box.z0 + (((i / this.nx) | 0) + 0.5) * this.cell }
  }
  /** The walkable cell nearest a point (within a few cells), or -1. */
  private snap(p: XZ) {
    const i0 = this.cellOf(p)
    if (this.c(i0) < 1e8) return i0
    const gx0 = i0 % this.nx
    const gz0 = (i0 / this.nx) | 0
    for (let r = 1; r <= 8; r++) {
      let best = -1
      let bd = Infinity
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue
          const gx = gx0 + dx
          const gz = gz0 + dz
          if (gx < 0 || gz < 0 || gx >= this.nx || gz >= this.nz) continue
          const i = gz * this.nx + gx
          if (this.c(i) >= 1e8) continue
          const d = dx * dx + dz * dz
          if (d < bd) {
            bd = d
            best = i
          }
        }
      if (best >= 0) return best
    }
    return -1
  }
  /** Is the straight line from a to b all walkable, and no dearer than the dearer of its ends (+ a little)? */
  private clear(a: XZ, b: XZ) {
    const l = Math.hypot(b.x - a.x, b.z - a.z)
    const n = Math.ceil(l / (this.cell * 0.5))
    const lim = Math.max(this.c(this.cellOf(a)), this.c(this.cellOf(b)), 1.2) + 0.3
    for (let k = 1; k < n; k++) {
      const v = this.c(this.cellOf({ x: a.x + ((b.x - a.x) * k) / n, z: a.z + ((b.z - a.z) * k) / n }))
      if (v > lim) return false
    }
    return true
  }

  /** The best walk from `from` to `to` (null: no way there). */
  plan(from: XZ, to: XZ): Route | null {
    const s = this.snap(from)
    const g = this.snap(to)
    if (s < 0 || g < 0) return null
    const n = this.nx * this.nz
    const cost = new Float32Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    const done = new Uint8Array(n)
    const goal = this.center(g)
    const h = (i: number) => {
      const p = this.center(i)
      return Math.hypot(p.x - goal.x, p.z - goal.z)
    }
    const heap = new Heap()
    cost[s] = 0
    heap.push(s, h(s))
    const D = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]]
    let found = false
    while (heap.size) {
      const i = heap.pop()
      if (done[i]) continue
      done[i] = 1
      if (i === g) {
        found = true
        break
      }
      const gx = i % this.nx
      const gz = (i / this.nx) | 0
      const ci = this.c(i)
      for (const [dx, dz, w] of D) {
        const x = gx + dx
        const z = gz + dz
        if (x < 0 || z < 0 || x >= this.nx || z >= this.nz) continue
        const j = z * this.nx + x
        if (done[j]) continue
        const cj = this.c(j)
        if (cj >= 1e8) continue
        // (No cutting a corner between two cells she can't walk on.)
        if (dx && dz && (this.c(gz * this.nx + x) >= 1e8 || this.c(z * this.nx + gx) >= 1e8)) continue
        const v = cost[i] + w * this.cell * (ci + cj) * 0.5
        if (v < cost[j]) {
          cost[j] = v
          prev[j] = i
          heap.push(j, v + h(j))
        }
      }
    }
    if (!found) return null
    const cells: XZ[] = []
    for (let i = g; i >= 0; i = prev[i]) cells.push(this.center(i))
    cells.reverse()
    cells[0] = { ...from }
    cells[cells.length - 1] = { ...to }
    // Pull it straight: from each point, on to the furthest one in a clear straight line.
    const out: XZ[] = [cells[0]]
    let i = 0
    while (i < cells.length - 1) {
      let j = Math.min(cells.length - 1, i + 40)
      while (j > i + 1 && !this.clear(cells[i], cells[j])) j--
      out.push(cells[j])
      i = j
    }
    return route(out)
  }
}
