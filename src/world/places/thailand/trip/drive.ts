// The one finger control every trip vehicle shares (plan: planning/around-the-world/thailand/boat-trip.md, "The drive
// control"). Pure math, no three.js: a heading and a velocity on the ground (or water) plane.
//
// - hold(x, z) every frame while her finger is down: that point is where the vehicle wants to be. Far ahead = fast,
//   near = slow, to one side = it keeps turning that way (doughnuts), behind it = a happy U-turn (or, locked to a line
//   like a canoe in a tunnel, backing up).
// - goto(x, z) after a tap: it drives there by itself and slows to a stop (or, passing a waypoint, keeps going).
// - release(): it coasts and settles.
// - vroom(): a burst of speed. jump(): up in the air off a wake.
// The world around it does the rest: soft walls call bounce(), and it reads x, z, heading, speed, roll and pitch.
//
// Heading 0 faces +z and turns toward +x (like the house's characters: atan2(dx, dz)).

export interface Feel {
  /** Cruising top speed (m/s). */
  top: number
  /** While a VROOM lasts, the top speed is this many times higher. */
  boost: number
  /** Speeding up (m/s²); slowing down is a little quicker. */
  accel: number
  /** Drag when nobody drives (1/s): it coasts and settles. */
  coast: number
  /** Turn rate at cruising speed (rad/s). Slow or stopped, it turns half as fast. */
  turn: number
  /** How quickly sliding sideways dies out (1/s): low = drifty. */
  grip: number
  /** Her finger this close = a crawl; this far = full speed (m). */
  near: number
  far: number
  /** A held finger this close to straight ahead (radians either side) means straight: a finger "up there" goes
   *  straight even when the camera sits a little to one side. Taps go exactly where she tapped. */
  dead: number
  /** Lean into turns (radians of roll at full speed and full turn). */
  lean: number
}

export interface StepEvents {
  /** It came down from a jump this step, this fast (m/s). */
  landed?: number
}

const G = 18
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export class Driver {
  x = 0
  z = 0
  heading = 0
  vx = 0
  vz = 0
  yawRate = 0
  /** Height above the water (or road) while it's in the air. */
  y = 0
  vy = 0
  /** Seconds of VROOM left. */
  boostT = 0
  /** Heading locked to a line (a tunnel): it can only go forward or back along it. */
  lock: number | null = null
  /** A speed limit as a share of its top speed (a village where boats go slowly): 1 = none. */
  cap = 1
  private target: { x: number; z: number } | null = null
  private mode: 'hold' | 'goto' | null = null
  /** A waypoint on the way somewhere: no slowing down, and it doesn't stop there. */
  private passing = false

  constructor(public feel: Feel) {}

  place(x: number, z: number, heading: number) {
    this.x = x
    this.z = z
    this.heading = heading
    this.vx = this.vz = this.yawRate = this.y = this.vy = this.boostT = 0
    this.target = null
    this.mode = null
  }

  /** Speed along the way it faces (negative when backing up). */
  get speed() {
    return this.vx * Math.sin(this.heading) + this.vz * Math.cos(this.heading)
  }
  get airborne() {
    return this.y > 0 || this.vy > 0
  }
  get driven() {
    return this.mode !== null
  }
  /** Where it's going (a tap or her finger), if anywhere. */
  get goal() {
    return this.mode ? this.target : null
  }

  hold(x: number, z: number) {
    this.target = { x, z }
    this.mode = 'hold'
  }
  goto(x: number, z: number, passing = false) {
    this.target = { x, z }
    this.mode = 'goto'
    this.passing = passing
  }
  release() {
    if (this.mode === 'hold') this.mode = null
  }
  stop() {
    this.mode = null
  }
  vroom(seconds = 2) {
    this.boostT = seconds
  }
  jump(vy: number) {
    if (!this.airborne) this.vy = vy
  }

  /** It hit something whose surface faces (nx, nz): bounce off, and turn a little along the surface so pushing into
   *  the same rock again slides round it instead of getting stuck (Venice's lesson). */
  bounce(nx: number, nz: number, restitution = 0.45) {
    const vn = this.vx * nx + this.vz * nz
    if (vn >= 0) return 0
    this.vx -= (1 + restitution) * vn * nx
    this.vz -= (1 + restitution) * vn * nz
    if (this.lock === null) {
      // Turn the bow toward whichever way along the surface is closer to where it was heading.
      const tx = -nz
      const tz = nx
      const along = Math.sin(this.heading) * tx + Math.cos(this.heading) * tz
      const slide = Math.atan2(tx * Math.sign(along || 1), tz * Math.sign(along || 1))
      this.heading += wrap(slide - this.heading) * 0.35
    }
    return -vn
  }

  /** Lean (roll) for the model: into the turn, more the faster it goes. */
  get roll() {
    return -clamp(this.yawRate / Math.max(0.01, this.feel.turn), -1, 1) * clamp(Math.abs(this.speed) / this.feel.top, 0, 1.4) * this.feel.lean
  }

  /** Advances by `dt` seconds in small substeps (a slow frame in a test browser behaves like several quick ones). */
  step(dt: number): StepEvents {
    const ev: StepEvents = {}
    const n = Math.max(1, Math.ceil(dt / (1 / 120)))
    for (let i = 0; i < n; i++) {
      const landed = this.substep(dt / n)
      if (landed !== undefined) ev.landed = landed
    }
    return ev
  }

  private substep(dt: number): number | undefined {
    const f = this.feel
    const sx = Math.sin(this.heading)
    const sz = Math.cos(this.heading)
    let fwd = this.vx * sx + this.vz * sz
    let lat = this.vx * sz - this.vz * sx
    let want: number | null = null
    let err = 0
    if (this.mode && this.target) {
      const dx = this.target.x - this.x
      const dz = this.target.z - this.z
      const dist = Math.hypot(dx, dz)
      const ramp = clamp((dist - f.near) / (f.far - f.near), 0, 1)
      err = wrap(Math.atan2(dx, dz) - (this.lock ?? this.heading))
      if (this.mode === 'goto' && !this.passing && dist < f.near * 0.8) {
        this.mode = null
      } else if (this.lock !== null && Math.abs(err) > Math.PI / 2) {
        // Behind it: back up (paddling backward) rather than turning round.
        want = -f.top * 0.6 * (0.25 + 0.75 * ramp)
        err = 0
      } else if (this.mode === 'hold') {
        want = f.top * (0.15 + 0.85 * ramp)
      } else {
        // A tap's spot: full speed, slowing down for the last few meters.
        want = this.passing ? f.top : f.top * clamp(dist / (f.near * 4), 0.2, 1)
      }
      if (want !== null && want > 0) {
        // Turning hard: ease off a little, but keep enough speed for a happy arc (and doughnuts).
        want *= 0.65 + 0.35 * Math.max(0, Math.cos(err))
      }
    }
    if (this.boostT > 0) {
      this.boostT -= dt
      if (want === null || want >= 0) want = Math.max(want ?? 0, f.top * f.boost)
    }
    // A speed limit (a village): never asks for more, and eases down to it after driving in fast.
    const lim = f.top * (this.boostT > 0 ? f.boost : 1) * this.cap
    if (want !== null) want = clamp(want, -lim, lim)
    if (this.cap < 1 && Math.abs(fwd) > lim) fwd *= Math.exp(-2.5 * dt)
    if (want !== null) fwd += clamp(want - fwd, -f.accel * 1.4 * dt, f.accel * (this.boostT > 0 ? 2.5 : 1) * dt)
    else fwd *= Math.exp(-f.coast * dt)
    // Turning: limited, and better at speed (a boat barely turns standing still).
    if (this.lock !== null) {
      this.heading += wrap(this.lock - this.heading) * Math.min(1, dt * 6)
      this.yawRate = 0
    } else {
      const sp = clamp(Math.abs(fwd) / f.top, 0, 1)
      const max = f.turn * (0.5 + 0.5 * Math.min(1, sp * 1.4))
      const aim = this.mode === 'hold' ? Math.sign(err) * Math.max(0, Math.abs(err) - f.dead) : err
      const wantRate = want === null ? 0 : clamp(aim * 3, -max, max)
      this.yawRate += (wantRate - this.yawRate) * (1 - Math.exp(-dt * (want === null ? 3 : 6)))
      this.heading += this.yawRate * dt
    }
    // Sideways sliding dies out (drift through turns), then the velocity follows the new heading.
    lat *= Math.exp(-f.grip * dt)
    const nx = Math.sin(this.heading)
    const nz = Math.cos(this.heading)
    this.vx = nx * fwd + nz * lat
    this.vz = nz * fwd - nx * lat
    this.x += this.vx * dt
    this.z += this.vz * dt
    // In the air (off a wake): gravity, then a splashy landing.
    if (this.y > 0 || this.vy > 0) {
      this.vy -= G * dt
      this.y += this.vy * dt
      if (this.y <= 0) {
        const v = -this.vy
        this.y = this.vy = 0
        return v
      }
    }
    return undefined
  }
}
