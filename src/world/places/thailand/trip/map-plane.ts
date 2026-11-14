// The tiny plane on a trip map's runway (the Nan map's, the Krabi map's): poked, it takes off down the runway, loops
// round a racetrack circuit over the board and lands again where it started. Pure geometry (three's Vector3 only).
import { Vector3 } from 'three'
import { clamp } from '../../../../sdk'

/** A runway on the board: its middle (x, z), length, width and which way it points (radians: 0 runs east). */
export interface Runway {
  at: [number, number]
  len: number
  w: number
  yaw: number
}

/** How long one circuit takes (s). */
export const CIRCUIT_S = 6

/** The circuit: down the runway and up, out round a racetrack loop over the board, and back down onto the runway where
 *  it started. Where it is at `k` (0..1) and which way it's heading. `ground` is the runway's height. */
export function circuitAt(rw: Runway, ground: number, k: number) {
  const dir = new Vector3(Math.cos(rw.yaw), 0, -Math.sin(rw.yaw))
  const left = new Vector3(dir.z, 0, -dir.x)
  const S = new Vector3(rw.at[0], ground, rw.at[1]).addScaledVector(dir, -rw.len * 0.42)
  const L = rw.len * 0.84
  const R = 0.55
  const UP = 0.5
  const roll = L
  const arc = Math.PI * R
  const back = L + 0.6
  const legs = [roll + 0.3, arc, back, arc, 0.3]
  const total = legs.reduce((a, b) => a + b, 0)
  let u = k * total
  const at = new Vector3()
  let heading = dir.clone()
  let alt = UP
  if ((u -= legs[0]) < 0) {
    const d = u + legs[0]
    at.copy(S).addScaledVector(dir, d)
    alt = clamp((d - roll * 0.6) / 0.6, 0, 1) * UP
  } else if ((u -= legs[1]) < 0) {
    const a = (u + legs[1]) / R
    const c = S.clone().addScaledVector(dir, L + 0.3).addScaledVector(left, R)
    at.copy(c).addScaledVector(left, -Math.cos(a) * R).addScaledVector(dir, Math.sin(a) * R)
    heading = dir.clone().multiplyScalar(Math.cos(a)).addScaledVector(left, Math.sin(a))
  } else if ((u -= legs[2]) < 0) {
    at.copy(S).addScaledVector(dir, L + 0.3 - (u + legs[2])).addScaledVector(left, 2 * R)
    heading = dir.clone().negate()
  } else if ((u -= legs[3]) < 0) {
    const a = (u + legs[3]) / R
    const c = S.clone().addScaledVector(dir, -0.3).addScaledVector(left, R)
    at.copy(c).addScaledVector(left, Math.cos(a) * R).addScaledVector(dir, -Math.sin(a) * R)
    heading = dir.clone().multiplyScalar(-Math.cos(a)).addScaledVector(left, -Math.sin(a))
  } else {
    const d = clamp(u + legs[4], 0, 0.3)
    at.copy(S).addScaledVector(dir, d - 0.3)
    alt = (1 - d / 0.3) * UP
  }
  at.y = ground + alt
  return { at, yaw: Math.atan2(heading.x, heading.z) - Math.PI / 2, bank: alt > 0.05 && Math.abs(heading.dot(dir)) < 0.99 ? 0.4 : 0 }
}

/** Seconds into a circuit (`t`, CIRCUIT_S long) to how far round it is: it rolls off slowly and slows down to land. */
export function circuitEase(t: number) {
  const k = t < 0 ? 0 : t / CIRCUIT_S
  return clamp(k < 0.15 ? (k * k) / 0.3 : k > 0.9 ? 1 - ((1 - k) * (1 - k)) / 0.2 : 0.075 + (k - 0.15) * (0.875 / 0.75), 0, 1)
}

/** Taking off for good (the way home): down the runway, up, and away off the board in a long climb. Where it is `t`
 *  seconds after it starts rolling, how big (it shrinks away into the sky) and which way it's heading. */
export function departAt(rw: Runway, ground: number, t: number) {
  const dir = new Vector3(Math.cos(rw.yaw), 0, -Math.sin(rw.yaw))
  const S = new Vector3(rw.at[0], ground, rw.at[1]).addScaledVector(dir, -rw.len * 0.42)
  // Rolling faster and faster, lifting off two thirds down the runway, then climbing out.
  const d = 0.35 * t * t
  const at = S.clone().addScaledVector(dir, d)
  const lift = Math.max(0, d - rw.len * 0.55)
  at.y = ground + lift * 0.55 + lift * lift * 0.3
  return { at, yaw: Math.atan2(dir.x, dir.z) - Math.PI / 2, pitch: lift > 0 ? 0.3 : 0 }
}
