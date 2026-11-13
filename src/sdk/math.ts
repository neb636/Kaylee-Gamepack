// Small number helpers shared by 2D puppets, activities and the 3D worlds. Import these instead of writing your own
// copy at the top of a file (copies drift, and the same name ends up meaning different maths in different files).
// No dependencies: safe to import from anything, including code that loads at startup.

/** `v` kept between `lo` and `hi` (0..1 by default). */
export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

/** From `a` to `b` by `t` (0 → a, 1 → b; not clamped). */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Smooth ease in-out of a progress `p`, clamped to 0..1. */
export const smooth = (p: number) => {
  p = clamp(p)
  return p * p * (3 - 2 * p)
}

/** GLSL's smoothstep: 0 below `a`, 1 above `b`, a smooth ramp between. */
export const smoothstep = (a: number, b: number, x: number) => smooth((x - a) / (b - a))

/** How far to move toward a target this frame for a frame-rate-independent ease: `x += (target - x) * damp(dt, 8)`. */
export const damp = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

/** An angle (radians) wrapped to -π..π, for turning the short way round. */
export const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))

/** Degrees to radians: `30 * DEG`. */
export const DEG = Math.PI / 180
/** Radians to degrees: `angle * TO_DEG` (for the geo helpers and CSS that take degrees). */
export const TO_DEG = 180 / Math.PI
