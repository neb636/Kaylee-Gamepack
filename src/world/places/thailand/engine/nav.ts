// Where Kaylee can walk on one floor: a grid of 20 cm cells. Walkable areas are carved out, furniture is blocked
// (already grown by her radius, so a path through free cells never clips a table), and paths are A* with 8 directions
// (no cutting corners), then smoothed by skipping every point she can see past.
export type XZ = [number, number]

export class NavGrid {
  readonly cols: number
  readonly rows: number
  private base: Uint8Array
  private grid: Uint8Array

  constructor(
    readonly x0: number,
    readonly z0: number,
    x1: number,
    z1: number,
    readonly cell = 0.2,
    /** Kaylee's radius: obstacles grow by this much. */
    readonly radius = 0.22,
  ) {
    this.cols = Math.ceil((x1 - x0) / cell)
    this.rows = Math.ceil((z1 - z0) / cell)
    this.base = new Uint8Array(this.cols * this.rows).fill(1)
    this.grid = this.base.slice()
  }

  /** Makes a rectangle walkable (its edge stays `radius` away from whatever is outside it). */
  carve(xa: number, xb: number, za: number, zb: number) {
    this.fill(this.base, xa + this.radius, xb - this.radius, za + this.radius, zb - this.radius, 0)
  }
  /** Blocks a rectangle (furniture), grown by Kaylee's radius. */
  block(xa: number, xb: number, za: number, zb: number) {
    this.fill(this.base, xa - this.radius, xb + this.radius, za - this.radius, zb + this.radius, 1)
  }
  /** Blocks a circle (a family member standing there), grown by Kaylee's radius. */
  blockCircle(x: number, z: number, r: number) {
    const rr = r + this.radius
    for (let row = 0; row < this.rows; row++)
      for (let col = 0; col < this.cols; col++) {
        const [cx, cz] = this.center(col, row)
        if ((cx - x) ** 2 + (cz - z) ** 2 <= rr * rr) this.base[row * this.cols + col] = 1
      }
  }
  /** Things that come and go (the shutter): `grid` = base + these rectangles. */
  setDynamic(rects: [number, number, number, number][]) {
    this.grid = this.base.slice()
    for (const [xa, xb, za, zb] of rects) this.fill(this.grid, xa - this.radius, xb + this.radius, za - this.radius, zb + this.radius, 1)
  }
  commit() {
    this.grid = this.base.slice()
  }

  private fill(target: Uint8Array, xa: number, xb: number, za: number, zb: number, v: number) {
    for (let row = 0; row < this.rows; row++)
      for (let col = 0; col < this.cols; col++) {
        const [cx, cz] = this.center(col, row)
        if (cx >= xa && cx <= xb && cz >= za && cz <= zb) target[row * this.cols + col] = v
      }
  }

  center(col: number, row: number): XZ {
    return [this.x0 + (col + 0.5) * this.cell, this.z0 + (row + 0.5) * this.cell]
  }
  cellOf(x: number, z: number): [number, number] {
    return [Math.floor((x - this.x0) / this.cell), Math.floor((z - this.z0) / this.cell)]
  }
  freeCell(col: number, row: number) {
    return col >= 0 && row >= 0 && col < this.cols && row < this.rows && this.grid[row * this.cols + col] === 0
  }
  free(x: number, z: number) {
    const [c, r] = this.cellOf(x, z)
    return this.freeCell(c, r)
  }
  /** Every cell, for the ?debug overlay. */
  cells() {
    return { cols: this.cols, rows: this.rows, blocked: this.grid }
  }

  /** The free spot nearest to (x, z): a tap on a table walks her up to it. */
  nearestFree(x: number, z: number): XZ | null {
    if (this.free(x, z)) return [x, z]
    const [c0, r0] = this.cellOf(x, z)
    let best: XZ | null = null
    let bestD = Infinity
    const maxRing = Math.max(this.cols, this.rows)
    for (let ring = 1; ring < maxRing; ring++) {
      for (let dr = -ring; dr <= ring; dr++)
        for (let dc = -ring; dc <= ring; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== ring || !this.freeCell(c0 + dc, r0 + dr)) continue
          const p = this.center(c0 + dc, r0 + dr)
          const d = (p[0] - x) ** 2 + (p[1] - z) ** 2
          if (d < bestD) {
            bestD = d
            best = p
          }
        }
      // A ring further out can't hold anything closer than (ring - 1) cells.
      if (best && Math.sqrt(bestD) < (ring - 0.5) * this.cell) break
    }
    return best
  }

  /** Can she walk in a straight line from a to b? */
  clear(a: XZ, b: XZ) {
    const d = Math.hypot(b[0] - a[0], b[1] - a[1])
    const steps = Math.ceil(d / (this.cell * 0.4))
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      if (!this.free(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)) return false
    }
    return true
  }

  /** Walking points from `from` to `to` (excluding `from`), or null if there's no way. */
  path(from: XZ, to: XZ): XZ[] | null {
    const goal = this.nearestFree(to[0], to[1])
    if (!goal) return null
    let start = from
    if (!this.free(from[0], from[1])) start = this.nearestFree(from[0], from[1]) ?? from
    if (this.clear(start, goal)) return [goal]
    const [sc, sr] = this.cellOf(start[0], start[1])
    const [gc, gr] = this.cellOf(goal[0], goal[1])
    const n = this.cols * this.rows
    const g = new Float32Array(n).fill(Infinity)
    const came = new Int32Array(n).fill(-1)
    const closed = new Uint8Array(n)
    const heap = new Heap()
    const s = sr * this.cols + sc
    const target = gr * this.cols + gc
    g[s] = 0
    heap.push(s, octile(sc, sr, gc, gr))
    const D = [
      [1, 0, 1],
      [-1, 0, 1],
      [0, 1, 1],
      [0, -1, 1],
      [1, 1, Math.SQRT2],
      [1, -1, Math.SQRT2],
      [-1, 1, Math.SQRT2],
      [-1, -1, Math.SQRT2],
    ]
    let found = false
    while (heap.size) {
      const cur = heap.pop()
      if (cur === target) {
        found = true
        break
      }
      if (closed[cur]) continue
      closed[cur] = 1
      const cc = cur % this.cols
      const cr = (cur - cc) / this.cols
      for (const [dc, dr, cost] of D) {
        const nc = cc + dc
        const nr = cr + dr
        if (!this.freeCell(nc, nr)) continue
        // No cutting corners: a diagonal step needs both side cells free.
        if (dc && dr && (!this.freeCell(cc + dc, cr) || !this.freeCell(cc, cr + dr))) continue
        const ni = nr * this.cols + nc
        const ng = g[cur] + cost
        if (ng < g[ni]) {
          g[ni] = ng
          came[ni] = cur
          heap.push(ni, ng + octile(nc, nr, gc, gr))
        }
      }
    }
    if (!found) return null
    const cells: XZ[] = []
    for (let i = target; i !== s && i !== -1; i = came[i]) cells.push(this.center(i % this.cols, Math.floor(i / this.cols)))
    cells.reverse()
    if (!cells.length) return [goal]
    cells[cells.length - 1] = goal
    // String-pulling: from each point, jump to the furthest point still in plain sight.
    const out: XZ[] = []
    let at = start
    let i = 0
    while (i < cells.length) {
      let j = cells.length - 1
      while (j > i && !this.clear(at, cells[j])) j--
      out.push(cells[j])
      at = cells[j]
      i = j + 1
    }
    return out
  }
}

const octile = (c: number, r: number, gc: number, gr: number) => {
  const dx = Math.abs(c - gc)
  const dy = Math.abs(r - gr)
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)
}

/** A small binary min-heap of cell indices by priority. */
class Heap {
  private items: number[] = []
  private prio: number[] = []
  get size() {
    return this.items.length
  }
  push(item: number, p: number) {
    const a = this.items
    const q = this.prio
    a.push(item)
    q.push(p)
    let i = a.length - 1
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (q[parent] <= q[i]) break
      ;[a[parent], a[i]] = [a[i], a[parent]]
      ;[q[parent], q[i]] = [q[i], q[parent]]
      i = parent
    }
  }
  pop(): number {
    const a = this.items
    const q = this.prio
    const top = a[0]
    const lastItem = a.pop()!
    const lastP = q.pop()!
    if (a.length) {
      a[0] = lastItem
      q[0] = lastP
      let i = 0
      for (;;) {
        const l = i * 2 + 1
        const r = l + 1
        let m = i
        if (l < a.length && q[l] < q[m]) m = l
        if (r < a.length && q[r] < q[m]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        ;[q[m], q[i]] = [q[i], q[m]]
        i = m
      }
    }
    return top
  }
}
