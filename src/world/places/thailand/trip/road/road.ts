// The road kit's one source of truth (plan: planning/around-the-world/thailand/nan-trip.html, "The mountain road"): a
// road is an OPEN curve through control points with heights, in meters, pure math (no three.js). The boat race's course
// (activities/boat-trip/race/track.ts) is the same idea closed into a loop on flat water; this one climbs and dips.
// The scene (build.ts), the traffic (traffic.ts), the drive and the flat fallback all read it.
//
// Heading 0 faces +z and turns toward +x (like the house's characters: atan2(dx, dz)). `s` is meters along the road from
// its start, `lat` meters to the left of the middle (looking along the road). Cars in Thailand keep LEFT: Kaylee's lane
// is lat > 0, oncoming traffic drives at lat < 0.

/** A control point: across (x), along (z), and up (y), in meters. */
export type RoadPoint = [x: number, z: number, y: number]

export interface RoadSample {
  x: number
  y: number
  z: number
  /** The way the road runs here (unit vector on the ground), and its left (unit, a quarter turn from it). */
  tx: number
  tz: number
  lx: number
  lz: number
  s: number
  /** Rise per meter along the road (0.1 = a 10% climb). */
  grade: number
}

/** Meters between samples along the middle of the road. */
const STEP = 1
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** A point on the centripetal Catmull-Rom curve through `pts` (3D): segment i, t 0..1. The ends are extended in a
 *  straight line, so the road starts and ends exactly on its first and last points. */
function curve(pts: RoadPoint[], i: number, t: number): RoadPoint {
  const n = pts.length
  const at = (k: number): RoadPoint => {
    if (k < 0) return pts[0].map((v, j) => 2 * v - pts[1][j]) as RoadPoint
    if (k >= n) return pts[n - 1].map((v, j) => 2 * v - pts[n - 2][j]) as RoadPoint
    return pts[k]
  }
  const p = [at(i - 1), at(i), at(i + 1), at(i + 2)]
  const dt = (a: RoadPoint, b: RoadPoint) => Math.max(1e-4, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])))
  const t1 = dt(p[0], p[1])
  const t2 = t1 + dt(p[1], p[2])
  const t3 = t2 + dt(p[2], p[3])
  const u = t1 + (t2 - t1) * t
  const lerp = (a: RoadPoint, b: RoadPoint, ta: number, tb: number): RoadPoint => {
    const w = (u - ta) / (tb - ta)
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w]
  }
  const a1 = lerp(p[0], p[1], 0, t1)
  const a2 = lerp(p[1], p[2], t1, t2)
  const a3 = lerp(p[2], p[3], t2, t3)
  const b1 = lerp(a1, a2, 0, t2)
  const b2 = lerp(a2, a3, t1, t3)
  return lerp(b1, b2, t1, t2)
}

export class Road {
  readonly samples: RoadSample[]
  /** Meters from the first point to the last. */
  readonly length: number

  /** `half`: half the road's width (two lanes; the verges are just outside). */
  constructor(
    readonly points: RoadPoint[],
    readonly half: number,
  ) {
    // A dense polyline first, then resampled every STEP meters along the ground (even spacing keeps `s` and the
    // nearest search simple).
    const dense: RoadPoint[] = []
    for (let i = 0; i < points.length - 1; i++) for (let k = 0; k < 40; k++) dense.push(curve(points, i, k / 40))
    dense.push(points[points.length - 1])
    const cum = [0]
    for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]))
    const total = cum[cum.length - 1]
    const n = Math.floor(total / STEP)
    const pts: RoadPoint[] = []
    let j = 0
    for (let k = 0; k <= n; k++) {
      const want = k * STEP
      while (j < cum.length - 2 && cum[j + 1] < want) j++
      const w = clamp((want - cum[j]) / (cum[j + 1] - cum[j] || 1), 0, 1)
      const a = dense[j]
      const b = dense[j + 1]
      pts.push([a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w])
    }
    this.samples = pts.map(([x, z, y], k): RoadSample => {
      const a = pts[Math.max(0, k - 1)]
      const b = pts[Math.min(pts.length - 1, k + 1)]
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const tx = (b[0] - a[0]) / l
      const tz = (b[1] - a[1]) / l
      // Left of the way it runs: heading 0 faces +z and turns toward +x, so the left of +z is +x.
      return { x, y, z, tx, tz, lx: tz, lz: -tx, s: k * STEP, grade: (b[2] - a[2]) / l }
    })
    this.length = n * STEP
  }

  /** The middle of the road at `s` (interpolated, held at the ends), and its direction. */
  sampleAt(s: number): RoadSample {
    const S = this.samples
    const u = clamp(s, 0, this.length) / STEP
    const i = Math.min(S.length - 2, Math.floor(u))
    const w = u - i
    const a = S[i]
    const b = S[i + 1]
    const tx = a.tx + (b.tx - a.tx) * w
    const tz = a.tz + (b.tz - a.tz) * w
    const l = Math.hypot(tx, tz) || 1
    return { x: a.x + (b.x - a.x) * w, y: a.y + (b.y - a.y) * w, z: a.z + (b.z - a.z) * w, tx: tx / l, tz: tz / l, lx: tz / l, lz: -tx / l, s: clamp(s, 0, this.length), grade: a.grade + (b.grade - a.grade) * w }
  }

  /** A spot `lat` meters left of the middle at `s`: where, how high, and the heading along the road there. */
  spotAt(s: number, lat = 0) {
    const p = this.sampleAt(s)
    return { x: p.x + p.lx * lat, y: p.y, z: p.z + p.lz * lat, heading: Math.atan2(p.tx, p.tz) }
  }

  /** Where (x, z) is on the road: the nearest sample's index, `s` and `lat`. With `near` (an index), it only looks
   *  within `span` samples of it (a car on one leg of a hairpin never snaps to the leg beside it). */
  locate(x: number, z: number, near?: number, span = 40) {
    const S = this.samples
    let best = 0
    let bestD = Infinity
    const lo = near === undefined ? 0 : Math.max(0, near - span)
    const hi = near === undefined ? S.length - 1 : Math.min(S.length - 1, near + span)
    for (let i = lo; i <= hi; i++) {
      const p = S[i]
      const d = (p.x - x) ** 2 + (p.z - z) ** 2
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    const p = S[best]
    const dx = x - p.x
    const dz = z - p.z
    return { i: best, s: clamp(p.s + dx * p.tx + dz * p.tz, 0, this.length), lat: dx * p.lx + dz * p.lz, d: Math.sqrt(bestD) }
  }

  /** How sharply the road turns over the next `ahead` meters from `s` (radians, signed: + = left). */
  bendAhead(s: number, ahead = 24) {
    const a = this.sampleAt(s)
    const b = this.sampleAt(s + ahead)
    return -Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz)
  }

  /** The road's footprint on the ground (meters), with a margin. */
  bounds(pad = 0) {
    let x0 = Infinity
    let x1 = -Infinity
    let z0 = Infinity
    let z1 = -Infinity
    let y0 = Infinity
    let y1 = -Infinity
    for (const p of this.samples) {
      x0 = Math.min(x0, p.x)
      x1 = Math.max(x1, p.x)
      z0 = Math.min(z0, p.z)
      z1 = Math.max(z1, p.z)
      y0 = Math.min(y0, p.y)
      y1 = Math.max(y1, p.y)
    }
    return { x0: x0 - pad, x1: x1 + pad, z0: z0 - pad, z1: z1 + pad, y0, y1 }
  }

  /** `s` of the sample nearest a control point (features are tagged on the points they sit by). */
  sOfPoint(i: number) {
    const [x, z] = this.points[i]
    return this.locate(x, z).s
  }
}
