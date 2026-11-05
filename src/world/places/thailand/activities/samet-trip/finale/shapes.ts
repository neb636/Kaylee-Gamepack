// The shapes the fire dancers draw in the air for Kaylee to draw back (the fire show's second round): a circle, a
// star and a heart, each as points evenly spaced round its outline in a unit box (x right, y up, about -1..1), and a
// helper that follows a finger round: the loops it closes and how big and how fast they are.

export type ShapeId = 'circle' | 'star' | 'heart'
export const SHAPE_IDS: ShapeId[] = ['circle', 'star', 'heart']
export type Pt = { x: number; y: number }

/** Even steps along a closed polyline. */
function resample(poly: Pt[], n: number): Pt[] {
  const seg: number[] = []
  let total = 0
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const l = Math.hypot(b.x - a.x, b.y - a.y)
    seg.push(l)
    total += l
  }
  const out: Pt[] = []
  let i = 0
  let into = 0
  for (let k = 0; k < n; k++) {
    const want = (k / n) * total
    while (into + seg[i] < want && i < poly.length - 1) {
      into += seg[i]
      i++
    }
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const f = seg[i] ? (want - into) / seg[i] : 0
    out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })
  }
  return out
}

/** The outline of a shape, `n` points round it (starting at the top, going clockwise as she'd draw it). */
export function shapePoints(id: ShapeId, n = 40): Pt[] {
  if (id === 'circle') return Array.from({ length: n }, (_, i) => ({ x: Math.sin((i / n) * Math.PI * 2), y: Math.cos((i / n) * Math.PI * 2) }))
  if (id === 'star') {
    const poly: Pt[] = []
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      const r = i % 2 ? 0.45 : 1
      poly.push({ x: Math.sin(a) * r, y: Math.cos(a) * r - 0.05 })
    }
    return resample(poly, n)
  }
  // The heart: the classic curve, scaled into the box (its dip at the top, its point at the bottom).
  const poly: Pt[] = []
  for (let i = 0; i < 120; i++) {
    const t = (i / 120) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    poly.push({ x: x / 17, y: (y + 2.5) / 15 })
  }
  // Start at the dip.
  return resample(poly, n)
}

/** Follows the finger (points in the drawing plane, meters) and tells when it closes a loop: it adds up how far the
 *  stroke turns (a full turn of its direction is a loop, wherever she draws it and from the first point), how big it
 *  was (its length / 2π) and how fast her finger goes round (rad/s, smoothed). Back-and-forth scribbles cancel out. */
export class LoopTracker {
  /** Smoothed: how fast she goes round (rad/s) and how big (m). */
  spin = 0
  size = 0
  private last: Pt | null = null
  private dir: number | null = null
  private acc = 0
  private len = 0
  private loopT = 0
  private segT = 0

  reset() {
    this.last = null
    this.dir = null
    this.acc = 0
    this.len = 0
    this.loopT = 0
    this.segT = 0
  }

  /** A new finger point; returns a loop she just closed ({ r, secs }) or null. */
  add(p: Pt, dt: number, minR: number): { r: number; secs: number } | null {
    this.loopT += dt
    this.segT += dt
    if (!this.last) {
      this.last = { ...p }
      return null
    }
    const dx = p.x - this.last.x
    const dy = p.y - this.last.y
    const d = Math.hypot(dx, dy)
    // (Tiny wobbles don't turn it: a step counts once the finger has moved a few centimeters.)
    if (d < 0.05) {
      if (this.segT > 0.25) this.spin *= Math.max(0, 1 - dt * 3)
      return null
    }
    const a = Math.atan2(dy, dx)
    if (this.dir !== null) {
      const turn = Math.atan2(Math.sin(a - this.dir), Math.cos(a - this.dir))
      this.acc += turn
      const rate = Math.abs(turn) / Math.max(1e-3, this.segT)
      this.spin += (rate - this.spin) * Math.min(1, this.segT * 4)
    }
    this.dir = a
    this.len += d
    this.last = { ...p }
    this.segT = 0
    if (Math.abs(this.acc) < Math.PI * 2) return null
    const r = this.len / (Math.PI * 2)
    const out = r >= minR ? { r, secs: this.loopT } : null
    this.size += (r - this.size) * 0.6
    this.acc -= Math.sign(this.acc) * Math.PI * 2
    this.len = 0
    this.loopT = 0
    return out
  }

  /** The finger lifted: the spin dies down. */
  idle(dt: number) {
    this.spin *= Math.max(0, 1 - dt * 2)
    this.size *= Math.max(0, 1 - dt * 0.5)
  }
}
