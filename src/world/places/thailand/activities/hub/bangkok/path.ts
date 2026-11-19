// A line on the Bangkok board that something follows (the boats down the river's middle, the skytrain along its
// stations, the tuk-tuk up Rama IV Road): where it is a given way along, and which way it's heading. Pure math.
import type { LonLat } from './geo'
import { ll, type XZ } from './layout'

export interface Path {
  /** How long it is (m). */
  len: number
  /** The spot `d` meters along (clamped to its ends), the heading there (radians, for rotation.y of something that
   *  drives along +z) and `side` meters to its right. */
  at(d: number, side?: number): { x: number; z: number; yaw: number }
  /** How far along it the nearest point to (x, z) is (m), and how far away that is. */
  near(x: number, z: number): { d: number; dist: number }
  pts: XZ[]
}

/** A path through these points (board meters), its corners rounded off a little (Chaikin, `smooth` times). */
export function pathOf(points: XZ[], smooth = 2): Path {
  let pts = points
  for (let n = 0; n < smooth; n++) {
    const out: XZ[] = [pts[0]]
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i]
      const [bx, bz] = pts[i + 1]
      out.push([ax * 0.75 + bx * 0.25, az * 0.75 + bz * 0.25], [ax * 0.25 + bx * 0.75, az * 0.25 + bz * 0.75])
    }
    out.push(pts[pts.length - 1])
    pts = out
  }
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const len = cum[cum.length - 1]
  return {
    len,
    pts,
    at(d, side = 0) {
      const c = Math.max(0, Math.min(len, d))
      let i = 1
      while (i < cum.length - 1 && cum[i] < c) i++
      const [ax, az] = pts[i - 1]
      const [bx, bz] = pts[i]
      const seg = cum[i] - cum[i - 1] || 1e-6
      const t = (c - cum[i - 1]) / seg
      const dx = (bx - ax) / seg
      const dz = (bz - az) / seg
      return { x: ax + (bx - ax) * t - dz * side, z: az + (bz - az) * t + dx * side, yaw: Math.atan2(dx, dz) }
    },
    near(x, z) {
      let best = { d: 0, dist: Infinity }
      for (let i = 1; i < pts.length; i++) {
        const [ax, az] = pts[i - 1]
        const [bx, bz] = pts[i]
        const l2 = (bx - ax) ** 2 + (bz - az) ** 2 || 1e-9
        const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (z - az) * (bz - az)) / l2))
        const dist = Math.hypot(x - ax - t * (bx - ax), z - az - t * (bz - az))
        if (dist < best.dist) best = { d: cum[i - 1] + t * (cum[i] - cum[i - 1]), dist }
      }
      return best
    },
  }
}

/** A path through longitudes and latitudes. */
export const pathLL = (line: LonLat[], smooth = 2) => pathOf(line.map(([lon, lat]) => ll(lon, lat)), smooth)
