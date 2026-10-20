// The boat race's course (race.ts): one source of truth in meters, pure math (no three.js), read by the scene, the
// boats, the rivals' driving and the minimap. A closed loop through a lagoon walled in by rock towers, three laps:
//
//              ╭── the rock arch ──── the back straight (boost pads) ──╮
//    turn 3 ╭──╯                                                        ╰── the S bend
//           │   (karsts on the island in the middle)                       │
//   chicane │                                                     turn 1 ╮ (the waterfall)
//           ╰── the ramp ── hairpin ──╮   ╭─ START / FINISH ── the grandstand ─╯
//                                     ╰───╯
// Heading 0 faces +z and turns toward +x (like the bay: atan2(dx, dz)). `s` is meters along the course from the
// start line, `lat` meters to the left of the middle (looking along the course).

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

/** Half the course's width (the buoy ropes are just outside). */
export const HALF = 8
export const LAPS = 3
/** Meters between samples along the middle of the course. */
const STEP = 1

// The control points, in driving order: the start line first. (Scaled a little so a lap is about half a minute.)
const K = 0.86
const POINTS: [number, number][] = (
  [
    [-20, 71],
    [10, 72],
    [46, 67],
    [69, 46],
    [74, 16],
    [60, -9],
    [38, -20],
    [26, -41],
    [3, -53],
    [-24, -48],
    [-52, -42],
    [-73, -25],
    [-77, 1],
    [-65, 21],
    [-71, 42],
    [-63, 61],
    [-46, 70],
  ] as [number, number][]
).map(([x, z]) => [x * K, z * K])

/** A point on the closed centripetal Catmull-Rom curve through POINTS: segment i, t 0..1. */
function curve(i: number, t: number): [number, number] {
  const n = POINTS.length
  const p = [-1, 0, 1, 2].map((k) => POINTS[(((i + k) % n) + n) % n])
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

function build(): { samples: Sample[]; length: number } {
  // A dense polyline first, then resampled every STEP meters (even spacing makes `s` and the nearest search simple).
  const dense: [number, number][] = []
  for (let i = 0; i < POINTS.length; i++) for (let k = 0; k < 60; k++) dense.push(curve(i, k / 60))
  const cum = [0]
  for (let i = 1; i <= dense.length; i++) {
    const a = dense[i - 1]
    const b = dense[i % dense.length]
    cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]))
  }
  const total = cum[cum.length - 1]
  const n = Math.round(total / STEP)
  const length = n * STEP
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
  const samples = pts.map(([x, z], k): Sample => {
    const a = pts[(k - 1 + n) % n]
    const b = pts[(k + 1) % n]
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
    const tx = (b[0] - a[0]) / l
    const tz = (b[1] - a[1]) / l
    // Left of the way it runs: heading 0 faces +z and turns toward +x, so the left of +z is +x.
    return { x, z, tx, tz, lx: tz, lz: -tx, s: k * STEP }
  })
  return { samples, length }
}

const BUILT = build()
export const SAMPLES = BUILT.samples
/** One lap, in meters. */
export const LENGTH = BUILT.length

const wrapS = (s: number) => ((s % LENGTH) + LENGTH) % LENGTH

/** The middle of the course at `s` (interpolated), and its direction. */
export function sampleAt(s: number): Sample {
  const u = wrapS(s) / STEP
  const i = Math.floor(u)
  const w = u - i
  const a = SAMPLES[i % SAMPLES.length]
  const b = SAMPLES[(i + 1) % SAMPLES.length]
  const tx = a.tx + (b.tx - a.tx) * w
  const tz = a.tz + (b.tz - a.tz) * w
  const l = Math.hypot(tx, tz) || 1
  return { x: a.x + (b.x - a.x) * w, z: a.z + (b.z - a.z) * w, tx: tx / l, tz: tz / l, lx: tz / l, lz: -tx / l, s: wrapS(s) }
}

/** A spot `lat` meters left of the middle at `s`, and the heading along the course there. */
export function spotAt(s: number, lat = 0) {
  const p = sampleAt(s)
  return { x: p.x + p.lx * lat, z: p.z + p.lz * lat, heading: Math.atan2(p.tx, p.tz) }
}

/** Where (x, z) is on the course: the nearest sample's index, `s` and `lat`. With `near` (an index), it only looks
 *  within `span` samples of it (a boat on one side of the lagoon never snaps to the course across the island). */
export function locate(x: number, z: number, near?: number, span = 70) {
  const n = SAMPLES.length
  let best = 0
  let bestD = Infinity
  const check = (i: number) => {
    const p = SAMPLES[((i % n) + n) % n]
    const d = (p.x - x) ** 2 + (p.z - z) ** 2
    if (d < bestD) {
      bestD = d
      best = ((i % n) + n) % n
    }
  }
  if (near === undefined) for (let i = 0; i < n; i++) check(i)
  else for (let k = -span; k <= span; k++) check(near + k)
  const p = SAMPLES[best]
  const dx = x - p.x
  const dz = z - p.z
  const along = dx * p.tx + dz * p.tz
  return { i: best, s: wrapS(p.s + along), lat: dx * p.lx + dz * p.lz }
}

/** How sharply the course turns over the next `ahead` meters from `s` (radians, signed: + = left). */
export function bendAhead(s: number, ahead = 24) {
  const a = sampleAt(s)
  const b = sampleAt(s + ahead)
  return Math.atan2(a.tx * b.tz - a.tz * b.tx, a.tx * b.tx + a.tz * b.tz) * -1
}

/** Signed meters from `a` forward to `b` round the loop (-L/2..L/2). */
export function ahead(a: number, b: number) {
  let d = wrapS(b) - wrapS(a)
  if (d > LENGTH / 2) d -= LENGTH
  if (d < -LENGTH / 2) d += LENGTH
  return d
}

// ---------------------------------------------------------------- what stands on the course (fractions of a lap)

const at = (f: number) => Math.round(f * LENGTH)

/** Where the racers start: the two rivals side by side in front, Kaylee just behind them in the middle. */
export const GRID = {
  kids: { s: LENGTH - 6, lat: 3.4 },
  monkey: { s: LENGTH - 6, lat: -3.4 },
  kaylee: { s: LENGTH - 14, lat: 0 },
}
/** Rows of rainbow item boxes across the course. */
export const ITEM_ROWS = [at(0.2), at(0.6)]
export const ITEM_LATS = [-5.6, -2.8, 0, 2.8, 5.6]
/** Golden arrow pads: drive over one for a burst of speed. */
export const BOOSTS: { s: number; lat: number }[] = [
  { s: at(0.43), lat: 2.5 },
  { s: at(0.47), lat: -2.5 },
  { s: at(0.9), lat: 0 },
]
export const BOOST_HALF = { across: 2.2, along: 3.2 }
/** The ramp: up and over, a trick in the air (any tap), a speed burst on landing. */
export const RAMP = { s: at(0.8), lat: 0, half: 4.2, len: 5.5 }
/** Lines of coins, along a bit of the course, a little to one side. */
export const COIN_LINES: { s: number; lat: number; n: number }[] = [
  { s: at(0.07), lat: -3, n: 5 },
  { s: at(0.32), lat: 3, n: 5 },
  { s: at(0.53), lat: 0, n: 5 },
  { s: at(0.71), lat: -3.5, n: 5 },
  { s: at(0.86), lat: 3, n: 5 },
]
/** The natural rock arch the course runs under (on the back straight). */
export const ARCH_S = at(0.5)
/** The big rock with the waterfall, on the inside of turn 1. */
export const FALLS = (() => {
  const p = spotAt(at(0.18), HALF + 22)
  return { x: p.x, z: p.z, r: 11, h: 44 }
})()
/** The grandstand: floating, beside the start straight on the right (outside the rope). */
export const STAND = (() => {
  const p = spotAt(at(0.035), -(HALF + 9))
  return { x: p.x, z: p.z, heading: p.heading }
})()
/** The podium's floating stage, just past the finish line on the left (across from the grandstand). */
export const PODIUM = (() => {
  const p = spotAt(at(0.03), HALF + 12)
  return { x: p.x, z: p.z, heading: p.heading }
})()

// ---------------------------------------------------------------- the minimap (RaceLayer.tsx)

/** The minimap's size (SVG units), the course fitted inside with a margin. */
export const MAP = (() => {
  const xs = SAMPLES.map((p) => p.x)
  const zs = SAMPLES.map((p) => p.z)
  const pad = HALF + 2
  const x0 = Math.min(...xs) - pad
  const z0 = Math.min(...zs) - pad
  const w = Math.max(...xs) + pad - x0
  const h = Math.max(...zs) + pad - z0
  const k = 100 / Math.max(w, h)
  return { x0, z0, k, w: w * k, h: h * k }
})()
/** A point in the lagoon on the minimap (x across, z down the map). */
export function mapXY(x: number, z: number): [number, number] {
  return [(x - MAP.x0) * MAP.k, (z - MAP.z0) * MAP.k]
}
/** The course's middle as an SVG path. */
export const MAP_PATH = SAMPLES.filter((_, i) => i % 4 === 0)
  .map((p, i) => {
    const [x, y] = mapXY(p.x, p.z)
    return `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
  })
  .join(' ') + ' Z'
