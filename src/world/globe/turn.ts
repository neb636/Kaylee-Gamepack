// Which way the home globe is turned, and where a spot on the Earth lands on the screen. Plain arithmetic, shared by
// the globe's picture (sphere.ts), the toys standing on it (toys.ts) and its hands (Globe.tsx).
import { clamp, DEG, TO_DEG } from '../../sdk/math'

/** Which point of the Earth faces her, in degrees. */
export interface View {
  lon: number
  lat: number
}

/** The view's sines and cosines, worked out once per frame. */
export interface Turn {
  sl: number
  cl: number
  sp: number
  cp: number
}
export const turnOf = (v: View): Turn => ({ sl: Math.sin(v.lon * DEG), cl: Math.cos(v.lon * DEG), sp: Math.sin(v.lat * DEG), cp: Math.cos(v.lat * DEG) })

/** A spot on the unit ball (cos lat sin lon, sin lat, cos lat cos lon), as she sees it: x right, y up, z toward her. */
export function turned(a: number, b: number, d: number, t: Turn): [number, number, number] {
  const z1 = a * t.sl + d * t.cl
  return [a * t.cl - d * t.sl, b * t.cp - z1 * t.sp, b * t.sp + z1 * t.cp]
}

/** A spot on the Earth, as she sees it: x right, y up, z toward her (behind the globe when negative), each -1..1. */
export function project(lon: number, lat: number, t: Turn): [number, number, number] {
  const c = Math.cos(lat * DEG)
  return turned(c * Math.sin(lon * DEG), Math.sin(lat * DEG), c * Math.cos(lon * DEG), t)
}

/** The spot on the Earth under a point of the disc (x right, y up, -1..1), or null off the globe. */
export function unproject(x: number, y: number, t: Turn): [lon: number, lat: number] | null {
  const r2 = x * x + y * y
  if (r2 >= 1) return null
  const z = Math.sqrt(1 - r2)
  const z1 = z * t.cp - y * t.sp
  const b = clamp(y * t.cp + z * t.sp, -1, 1)
  return [Math.atan2(x * t.cl + z1 * t.sl, -x * t.sl + z1 * t.cl) * TO_DEG, Math.asin(b) * TO_DEG]
}
