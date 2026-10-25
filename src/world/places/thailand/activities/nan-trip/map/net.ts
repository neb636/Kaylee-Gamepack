// The Nan map's roads as one network of points 5 cm apart (the places are shared points where roads meet), so the
// little Pajero can drive from wherever it is to anywhere along the roads: picked from the map, or pulled by her
// finger. Pure (no three.js).
import { PLACES, ROADS, type PlaceId, type XZ } from './layout'

export const STEP = 0.05

export interface Net {
  pts: XZ[]
  /** Each point's neighbours along the roads. */
  nbr: number[][]
  /** The point each place sits on. */
  place: Record<PlaceId, number>
  /** Each road's points, from its first place to its last (for drawing the ribbons). */
  lines: XZ[][]
}

/** A smooth curve through the points (Catmull-Rom), as points about STEP apart. */
export function smoothLine(ctrl: XZ[], step = STEP): XZ[] {
  const fine: XZ[] = []
  const at = (i: number) => ctrl[Math.max(0, Math.min(ctrl.length - 1, i))]
  for (let i = 0; i < ctrl.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    for (let k = 0; k < 16; k++) {
      const t = k / 16
      const t2 = t * t
      const t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      fine.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  fine.push(ctrl[ctrl.length - 1])
  // Even spacing along the way.
  const out: XZ[] = [fine[0]]
  let left = step
  for (let i = 1; i < fine.length; i++) {
    let [ax, az] = fine[i - 1]
    const [bx, bz] = fine[i]
    let seg = Math.hypot(bx - ax, bz - az)
    while (seg >= left) {
      const k = left / seg
      ax += (bx - ax) * k
      az += (bz - az) * k
      out.push([ax, az])
      seg -= left
      left = step
    }
    left -= seg
  }
  const last = ctrl[ctrl.length - 1]
  const tail = out[out.length - 1]
  if (Math.hypot(tail[0] - last[0], tail[1] - last[1]) > step * 0.4) out.push(last)
  else out[out.length - 1] = last
  return out
}

export function buildNet(): Net {
  const pts: XZ[] = []
  const nbr: number[][] = []
  const add = (p: XZ) => {
    pts.push(p)
    nbr.push([])
    return pts.length - 1
  }
  const link = (a: number, b: number) => {
    nbr[a].push(b)
    nbr[b].push(a)
  }
  const place = {} as Record<PlaceId, number>
  for (const id of Object.keys(PLACES) as PlaceId[]) place[id] = add(PLACES[id].at)
  const lines: XZ[][] = []
  for (const r of ROADS) {
    const line = smoothLine([PLACES[r.from].at, ...r.via, PLACES[r.to].at])
    lines.push(line)
    let prev = place[r.from]
    for (const p of line.slice(1, -1)) {
      const i = add(p)
      link(prev, i)
      prev = i
    }
    link(prev, place[r.to])
  }
  return { pts, nbr, place, lines }
}

/** The road point nearest (x, z), and how far it is. */
export function nearest(net: Net, x: number, z: number) {
  let best = 0
  let bd = Infinity
  for (const [i, [px, pz]] of net.pts.entries()) {
    const d = (px - x) ** 2 + (pz - z) ** 2
    if (d < bd) {
      bd = d
      best = i
    }
  }
  return { i: best, d: Math.sqrt(bd) }
}

/** The shortest way along the roads from point `a` to point `b` (both included). */
export function route(net: Net, a: number, b: number): number[] {
  const n = net.pts.length
  const dist = new Float64Array(n).fill(Infinity)
  const from = new Int32Array(n).fill(-1)
  const done = new Uint8Array(n)
  dist[a] = 0
  for (;;) {
    let u = -1
    let best = Infinity
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < best) (best = dist[i]), (u = i)
    if (u < 0 || u === b) break
    done[u] = 1
    for (const v of net.nbr[u]) {
      const d = best + Math.hypot(net.pts[u][0] - net.pts[v][0], net.pts[u][1] - net.pts[v][1])
      if (d < dist[v]) {
        dist[v] = d
        from[v] = u
      }
    }
  }
  const out = [b]
  while (out[0] !== a && from[out[0]] >= 0) out.unshift(from[out[0]])
  return out[0] === a ? out : [a]
}
