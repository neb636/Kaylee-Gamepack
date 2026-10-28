// Terry's way from the top of the world to the bottom: great-circle legs from near the North Pole, through the
// countries Kaylee has visited (in order, north to south), down to Pebble's colony on Antarctica. Positions are on the
// unit globe, in the Earth's frame (globe/earth.ts's ll()).
import { Vector3 } from 'three'
import { ll } from '../../globe/earth'

/** Where each country's pin goes on the globe: [latitude, longitude]. A new country adds its line here. */
export const PINS: Record<string, [number, number]> = {
  canada: [56, -100],
  italy: [42, 12],
  china: [35, 104],
  egypt: [27, 30],
  thailand: [15, 101],
  peru: [-10, -76],
  australia: [-25, 134],
}

/** Pebble's colony, where Terry lands (on the coast of Antarctica, toward the peninsula). */
export const COLONY: [number, number] = [-78, -60]
const START_LAT = 86

export interface RoutePoint {
  /** On the globe (unit length). */
  p: Vector3
  /** Which way Terry flies (unit, along the globe). */
  t: Vector3
  /** Across his way, to his right (unit, along the globe). */
  side: Vector3
}

export class Route {
  private pts: Vector3[]
  private arcs: number[] = []
  /** Radians from start to end. */
  readonly length: number

  constructor(visited: string[]) {
    const stops = visited.filter((id) => PINS[id]).map((id) => PINS[id])
    stops.sort((a, b) => b[0] - a[0])
    // Starts up north above the first stop (or the Atlantic), ends at the colony.
    const lon0 = stops[0]?.[1] ?? -30
    this.pts = [ll(START_LAT, lon0), ...stops.map(([lat, lon]) => ll(lat, lon)), ll(...COLONY)]
    let total = 0
    for (let i = 1; i < this.pts.length; i++) {
      const a = this.pts[i - 1].angleTo(this.pts[i])
      this.arcs.push(a)
      total += a
    }
    this.length = total
  }

  /** The point `s` radians along the way. */
  at(s: number, out: RoutePoint) {
    let i = 0
    let d = Math.max(0, Math.min(this.length - 1e-6, s))
    while (i < this.arcs.length - 1 && d > this.arcs[i]) d -= this.arcs[i++]
    const a = this.pts[i]
    const b = this.pts[i + 1]
    const w = Math.max(1e-6, this.arcs[i])
    const u = d / w
    const sw = Math.sin(w)
    out.p.copy(a).multiplyScalar(Math.sin((1 - u) * w) / sw).addScaledVector(b, Math.sin(u * w) / sw).normalize()
    out.t.copy(a).multiplyScalar(-Math.cos((1 - u) * w)).addScaledVector(b, Math.cos(u * w))
    out.t.addScaledVector(out.p, -out.t.dot(out.p)).normalize()
    out.side.crossVectors(out.t, out.p).normalize()
    return out
  }

  /** How far along the way a stop is (for the pins), radians. */
  distanceTo(i: number) {
    let s = 0
    for (let k = 0; k < i && k < this.arcs.length; k++) s += this.arcs[k]
    return s
  }
}

/** A blank route point to fill. */
export const point = (): RoutePoint => ({ p: new Vector3(), t: new Vector3(), side: new Vector3() })

/** Latitude (degrees) of a point on the unit globe. */
export const latOf = (p: Vector3) => (Math.asin(Math.max(-1, Math.min(1, p.y))) * 180) / Math.PI

/** Longitude (degrees) of a point on the unit globe (ll()'s mapping backwards). */
export const lonOf = (p: Vector3) => ((((Math.atan2(p.z, -p.x) * 180) / Math.PI + 360) % 360) - 180)
