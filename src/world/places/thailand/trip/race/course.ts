// A race course, the races' one source of truth in meters (pure math, no three.js): `s` is meters along it from the
// start, `lat` meters to the left of its middle (looking along it). Heading 0 faces +z and turns toward +x (atan2(dx,
// dz), like the house's characters).
//
// Two kinds share the same questions (spotAt, locate, bendAhead, ahead):
// - a closed loop on flat water, raced in laps (Loop, here): the boat race's heart-shaped lagoon course;
// - an open road with heights, raced point to point (the road kit's Road, trip/road/road.ts): the Nan Mountain Cup.
// The minimap (courseMap) draws either.

export interface Sample {
  x: number
  z: number
  /** The way the course runs here (unit vector), and its left (unit, a quarter turn from it). */
  tx: number
  tz: number
  lx: number
  lz: number
  s: number
}

/** A point on the closed centripetal Catmull-Rom curve through `pts`: segment i, t 0..1. */
function curve(pts: [number, number][], i: number, t: number): [number, number] {
  const n = pts.length
  const p = [-1, 0, 1, 2].map((k) => pts[(((i + k) % n) + n) % n])
  const dt = (a: [number, number], b: [number, number]) => Math.max(1e-4, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])))
  const t0 = 0
  const t1 = t0 + dt(p[0], p[1])
  const t2 = t1 + dt(p[1], p[2])
  const t3 = t2 + dt(p[2], p[3])
  const u = t1 + (t2 - t1) * t
  const lerp = (a: [number, number], b: [number, number], ta: number, tb: number): [number, number] => {
    const w = (u - ta) / (tb - ta)
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w]
  }
  const a1 = lerp(p[0], p[1], t0, t1)
  const a2 = lerp(p[1], p[2], t1, t2)
  const a3 = lerp(p[2], p[3], t2, t3)
  const b1 = lerp(a1, a2, t0, t2)
  const b2 = lerp(a2, a3, t1, t3)
  return lerp(b1, b2, t1, t2)
}

/** A closed loop through control points (x, z), sampled every `step` meters (even spacing makes `s` and the nearest
 *  search simple). The first point is the start line. */
export class Loop {
  readonly samples: Sample[]
  /** One lap, in meters. */
  readonly length: number

  constructor(
    readonly points: [number, number][],
    readonly step = 1,
  ) {
    // A dense polyline first, then resampled every `step` meters.
    const dense: [number, number][] = []
    for (let i = 0; i < points.length; i++) for (let k = 0; k < 60; k++) dense.push(curve(points, i, k / 60))
    const cum = [0]
    for (let i = 1; i <= dense.length; i++) {
      const a = dense[i - 1]
      const b = dense[i % dense.length]
      cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]))
    }
    const total = cum[cum.length - 1]
    const n = Math.round(total / step)
    this.length = n * step
    const pts: [number, number][] = []
    let j = 0
    for (let k = 0; k < n; k++) {
      const want = (k / n) * total
      while (cum[j + 1] < want) j++
      const w = (want - cum[j]) / (cum[j + 1] - cum[j] || 1)
      const a = dense[j]
      const b = dense[(j + 1) % dense.length]
      pts.push([a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w])
    }
    this.samples = pts.map(([x, z], k): Sample => {
      const a = pts[(k - 1 + n) % n]
      const b = pts[(k + 1) % n]
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const tx = (b[0] - a[0]) / l
      const tz = (b[1] - a[1]) / l
      // Left of the way it runs: heading 0 faces +z and turns toward +x, so the left of +z is +x.
      return { x, z, tx, tz, lx: tz, lz: -tx, s: k * step }
    })
  }

  wrap(s: number) {
    return ((s % this.length) + this.length) % this.length
  }

  /** The middle of the course at `s` (interpolated), and its direction. */
  sampleAt(s: number): Sample {
    const S = this.samples
    const u = this.wrap(s) / this.step
    const i = Math.floor(u)
    const w = u - i
    const a = S[i % S.length]
    const b = S[(i + 1) % S.length]
    const tx = a.tx + (b.tx - a.tx) * w
    const tz = a.tz + (b.tz - a.tz) * w
    const l = Math.hypot(tx, tz) || 1
    return { x: a.x + (b.x - a.x) * w, z: a.z + (b.z - a.z) * w, tx: tx / l, tz: tz / l, lx: tz / l, lz: -tx / l, s: this.wrap(s) }
  }

  /** A spot `lat` meters left of the middle at `s`, and the heading along the course there. */
  spotAt(s: number, lat = 0) {
    const p = this.sampleAt(s)
    return { x: p.x + p.lx * lat, z: p.z + p.lz * lat, heading: Math.atan2(p.tx, p.tz) }
  }

  /** Where (x, z) is on the course: the nearest sample's index, `s` and `lat`. With `near` (an index), it only looks
   *  within `span` samples of it (a boat on one side of the lagoon never snaps to the course across the island). */
  locate(x: number, z: number, near?: number, span = 70) {
    const S = this.samples
    const n = S.length
    let best = 0
    let bestD = Infinity
    const check = (i: number) => {
      const p = S[((i % n) + n) % n]
      const d = (p.x - x) ** 2 + (p.z - z) ** 2
      if (d < bestD) {
        bestD = d
        best = ((i % n) + n) % n
      }
    }
    if (near === undefined) for (let i = 0; i < n; i++) check(i)
    else for (let k = -span; k <= span; k++) check(near + k)
    const p = S[best]
    const dx = x - p.x
    const dz = z - p.z
    const along = dx * p.tx + dz * p.tz
    return { i: best, s: this.wrap(p.s + along), lat: dx * p.lx + dz * p.lz }
  }

  /** How sharply the course turns over the next `ahead` meters from `s` (radians, signed: + = left). */
  bendAhead(s: number, ahead = 24) {
    const a = this.sampleAt(s)
    const b = this.sampleAt(s + ahead)
    return Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz) * -1
  }

  /** Signed meters from `a` forward to `b` round the loop (-L/2..L/2). */
  ahead(a: number, b: number) {
    const L = this.length
    let d = this.wrap(b) - this.wrap(a)
    if (d > L / 2) d -= L
    if (d < -L / 2) d += L
    return d
  }
}

/** The minimap of a course (the races' HUD, trip/race/RaceHud.tsx): the course fitted into 100 SVG units with a margin
 *  (`pad` meters), a point on it, and its middle as an SVG path (closed for a loop). */
export function courseMap(samples: { x: number; z: number }[], pad: number, closed: boolean) {
  const xs = samples.map((p) => p.x)
  const zs = samples.map((p) => p.z)
  const x0 = Math.min(...xs) - pad
  const z0 = Math.min(...zs) - pad
  const w = Math.max(...xs) + pad - x0
  const h = Math.max(...zs) + pad - z0
  const k = 100 / Math.max(w, h)
  const xy = (x: number, z: number): [number, number] => [(x - x0) * k, (z - z0) * k]
  const path =
    samples
      .filter((_, i) => i % 4 === 0)
      .map((p, i) => {
        const [x, y] = xy(p.x, p.z)
        return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ') + (closed ? ' Z' : '')
  return { w: w * k, h: h * k, xy, path }
}
export type CourseMap = ReturnType<typeof courseMap>
