// The Maple Leaf Train's track across the map: a smooth curve through ROUTE (canada.ts), with a full loop inside the
// Spiral Tunnel mountain. Everything that moves on it works in meters along the track (`s`): 0 at Mont-Sainte-Anne in the
// east, `length` at Vancouver in the west.
import { CatmullRomCurve3, Vector3, type BufferGeometry } from 'three'
import { P, merge } from '../../../engine3d/geo'
import { proj, ROUTE, SPIRAL, SPIRAL_AFTER, type LL } from './canada'

/** The land's top, and where the rails sit. */
export const LAND_TOP = 0.3
export const RAIL_Y = LAND_TOP + 0.07
/** How round the loop inside the mountain is (m). */
export const SPIRAL_R = 0.48

const STEP = 0.05

export class Track {
  readonly curve: CatmullRomCurve3
  readonly length: number
  /** Points every STEP meters (x, z pairs), for finding the nearest spot to her finger. */
  private pts: Float32Array

  constructor() {
    const v = (ll: LL) => {
      const [x, z] = proj(ll)
      return new Vector3(x, RAIL_Y, z)
    }
    const pts = ROUTE.map(v)
    // The Spiral Tunnels: in on the east side of the mountain, once round inside it, out on the west side.
    const c = v(SPIRAL)
    const loop: Vector3[] = []
    for (let i = 0; i <= 9; i++) {
      const a = (i / 9) * Math.PI * 3
      loop.push(new Vector3(c.x + Math.cos(a) * SPIRAL_R, RAIL_Y, c.z - Math.sin(a) * SPIRAL_R))
    }
    pts.splice(SPIRAL_AFTER + 1, 0, ...loop)
    this.curve = new CatmullRomCurve3(pts, false, 'centripetal')
    this.curve.arcLengthDivisions = 6000
    this.length = this.curve.getLength()
    const n = Math.ceil(this.length / STEP) + 1
    this.pts = new Float32Array(n * 2)
    const p = new Vector3()
    for (let i = 0; i < n; i++) {
      this.at(Math.min(this.length, i * STEP), p)
      this.pts[i * 2] = p.x
      this.pts[i * 2 + 1] = p.z
    }
  }

  clampS(s: number) {
    return Math.min(this.length, Math.max(0, s))
  }
  at(s: number, out: Vector3) {
    return this.curve.getPointAt(this.clampS(s) / this.length, out)
  }
  tangent(s: number, out: Vector3) {
    return this.curve.getTangentAt(this.clampS(s) / this.length, out)
  }

  /** The spot on the track nearest (x, z): anywhere, or only within `window` meters of `around` (her finger pushing the
   *  train never jumps it to another part of the track, like the other side of the spiral). Returns s and the distance. */
  nearest(x: number, z: number, around?: number, window = 4) {
    const n = this.pts.length / 2
    const lo = around === undefined ? 0 : Math.max(0, Math.floor((around - window) / STEP))
    const hi = around === undefined ? n - 1 : Math.min(n - 1, Math.ceil((around + window) / STEP))
    let best = lo
    let bd = Infinity
    for (let i = lo; i <= hi; i++) {
      const d = (this.pts[i * 2] - x) ** 2 + (this.pts[i * 2 + 1] - z) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    }
    return { s: Math.min(this.length, best * STEP), d: Math.sqrt(bd) }
  }

  /** How close the track comes to (x, z), anywhere. */
  distance(x: number, z: number) {
    return this.nearest(x, z).d
  }

  /** The sleepers and the two rails, as one toy shape. */
  geometry(): BufferGeometry {
    const parts: BufferGeometry[] = []
    const p = new Vector3()
    const t = new Vector3()
    for (let s = 0.1; s < this.length; s += 0.26) {
      this.at(s, p)
      this.tangent(s, t)
      const yaw = Math.atan2(t.x, t.z)
      parts.push(P.box(0.34, 0.04, 0.08, '#A9785B', { at: [p.x, LAND_TOP + 0.03, p.z], rot: [0, yaw, 0] }))
    }
    for (let s = 0; s < this.length; s += 0.16) {
      this.at(s + 0.08, p)
      this.tangent(s + 0.08, t)
      const yaw = Math.atan2(t.x, t.z)
      for (const side of [-1, 1]) {
        const ox = Math.cos(yaw) * 0.11 * side
        const oz = -Math.sin(yaw) * 0.11 * side
        parts.push(P.box(0.03, 0.035, 0.17, '#8E87A8', { at: [p.x + ox, LAND_TOP + 0.065, p.z + oz], rot: [0, yaw, 0] }))
      }
    }
    return merge(parts)
  }
}
