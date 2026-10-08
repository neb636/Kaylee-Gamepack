// The aqueduct valley as numbers, so every arch fits exactly.
//
// Everything is measured in "arch widths" (A): x runs left → right from the spring, and the arch line (the flat tops
// of the arches, where the stone channel sits) slopes gently DOWN toward Rome: arch line y = y0 + SLOPE * x * A.
// The ground under bay k sits exactly BAYS[k] arch widths below that line, so an arch of that height stands on the
// ground with its top on the line. The terrain is a smooth curve (no overshoot) through those depths.

/** Drop of the arch line per arch width (water only flows downhill). */
export const SLOPE = 0.05
/** Height of the stone channel (trough) on top of the arches. */
export const TROUGH = 0.2
/** Left edge of the first bay (the hill ends here). */
export const XB = 1.55
/** The spring rock on top of the hill (x range) and where the hill channel starts. */
export const ROCK = { x0: 0.08, x1: 1.38, h: (1.3 * 547) / 965, mouth: 0.72 }
export const CHANNEL_START = 1.18
/** Far right end of the world (the channel runs off toward Rome on arches the Romans already built). */
export const WORLD_END = 16
/** The first of those ready-built arches. */
export const BUILT_FROM = 7

/** Arch kinds she can build with: height in arch widths. */
export const KINDS = { s: 0.9, m: 1.5, x: 1.85, t: 2.2 } as const
export type Kind = keyof typeof KINDS

/** The seven bays of the aqueduct (the kind that fits each), left to right. */
export const BAYS: Kind[] = ['s', 't', 'm', 'x', 't', 'm', 's']
/** Round 1: three gaps with clearly different heights. Round 2: four gaps, two of them almost the same height. */
export const ROUNDS: { gaps: number[]; tray: Kind[] }[] = [
  { gaps: [0, 1, 2], tray: ['t', 's', 'm'] },
  { gaps: [3, 4, 5, 6], tray: ['x', 's', 't', 'm'] },
]
export const bayX = (k: number) => XB + k
export const bayCenter = (k: number) => XB + k + 0.5

/** Ground depth below the arch line (in A) at the control points: the hill, the two valleys, the land toward Rome. */
const PTS: [number, number][] = [
  [-6, 0.9],
  [-1.6, 0.14],
  [0, 0],
  [1.45, 0],
  [XB + 0.18, 0.3],
  [bayCenter(0), KINDS.s],
  [bayCenter(1), KINDS.t],
  [bayCenter(2), KINDS.m],
  [bayCenter(3), KINDS.x],
  [bayCenter(4), KINDS.t],
  [bayCenter(5), KINDS.m],
  [bayCenter(6), KINDS.s],
  [bayCenter(7), 0.8],
  [bayCenter(8), 0.75],
  [WORLD_END + 2, 0.72],
]

// Monotone cubic (Fritsch–Carlson) tangents: smooth, and flat at the bottom of each valley.
const TAN = (() => {
  const n = PTS.length
  const dk = PTS.slice(0, -1).map(([x, y], i) => (PTS[i + 1][1] - y) / (PTS[i + 1][0] - x))
  const m = PTS.map((_, i) => (i === 0 ? dk[0] : i === n - 1 ? dk[n - 2] : dk[i - 1] * dk[i] <= 0 ? 0 : (dk[i - 1] + dk[i]) / 2))
  for (let i = 0; i < n - 1; i++) {
    if (dk[i] === 0) {
      m[i] = m[i + 1] = 0
      continue
    }
    const a = m[i] / dk[i]
    const b = m[i + 1] / dk[i]
    const s = a * a + b * b
    if (s > 9) {
      const t = 3 / Math.sqrt(s)
      m[i] = t * a * dk[i]
      m[i + 1] = t * b * dk[i]
    }
  }
  return m
})()

/** Ground depth below the arch line at x (in A). */
export function depth(x: number) {
  if (x <= PTS[0][0]) return PTS[0][1]
  let i = 0
  while (i < PTS.length - 2 && x > PTS[i + 1][0]) i++
  const [x0, y0] = PTS[i]
  const [x1, y1] = PTS[i + 1]
  const h = x1 - x0
  const t = Math.min(1, Math.max(0, (x - x0) / h))
  const t2 = t * t
  const t3 = t2 * t
  return (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * TAN[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * TAN[i + 1]
}

/** Screen layout of the valley for a W x H box. */
export interface Geom {
  W: number
  H: number
  A: number
  /** Arch line y (px) at x = 0. */
  y0: number
  /** y (px) where the near road's feet line is (tray arches and the friends stand here). */
  feet: number
  /** Camera (world x at the screen's left edge) for round 1 and round 2 (the same when it all fits). */
  cam1: number
  cam2: number
  /** Tray: x (px, screen) of each slot's left edge, for 3 and 4 arches. */
  tray: (n: number) => number[]
  /** Height (px) of Lupa and Sparkle on the road, and the free width at each side of the tray. */
  friendH: number
  side: number
  short: boolean
}

export const TRAY_GAP = 0.14

export function makeGeom(W: number, H: number): Geom {
  const short = H < 560
  const top = short ? 64 : 186
  const feet = H - (short ? 8 : 20)
  // Room above the arch line (the rock pokes up beside the prompt, except on phones), the deepest valley, a little
  // air, then the tallest tray arch.
  const above = short ? 0.8 : 0.2
  const units = above + SLOPE * bayCenter(4) + KINDS.t + 0.15 + KINDS.t
  const trayUnits = 4 + 3 * TRAY_GAP
  const A = Math.max(40, Math.min((feet - top) / units, W / (trayUnits + 1.9), 210))
  const extra = feet - top - units * A
  const y0 = top + above * A + extra * 0.85
  const view = W / A
  const L = -0.4
  const R = 9.9
  let cam1 = L
  let cam2 = L
  if (view >= R - L) cam1 = cam2 = L - (view - (R - L)) / 2
  else cam2 = R - view
  const trayW = (n: number) => n * A + (n - 1) * TRAY_GAP * A
  const side = (W - trayW(4)) / 2
  return {
    W, H, A, y0, feet, cam1, cam2, short, side,
    friendH: Math.min(1.6 * A, (side - 10) / 0.87, H * 0.3),
    tray: (n) => Array.from({ length: n }, (_, i) => (W - trayW(n)) / 2 + i * (1 + TRAY_GAP) * A),
  }
}

/** Arch line y (px) at world x. */
export const lineY = (g: Geom, x: number) => g.y0 + SLOPE * x * g.A
/** Ground y (px) at world x. */
export const groundY = (g: Geom, x: number) => lineY(g, x) + depth(x) * g.A
/** World x → px inside the world layer (the layer itself is shifted by the camera). */
export const px = (g: Geom, x: number) => x * g.A
