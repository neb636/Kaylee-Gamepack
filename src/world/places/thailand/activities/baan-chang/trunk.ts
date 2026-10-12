// An elephant's trunk is a chain of short segments fixed at the head. Each frame its tip chases a target (her food, the
// mouth, the chocolate milk, the sky) with some lag, and FABRIK bends the chain to reach it. That lag and the bend are
// what make it feel like a snake following her finger.
import type { Pt } from './layout'

export interface Trunk {
  pts: Pt[]
  seg: number
  /** Where the tip is heading (it chases this). */
  tip: Pt
}

export function makeTrunk(base: Pt, len: number, n: number, dir: number): Trunk {
  const seg = len / n
  const pts = Array.from({ length: n + 1 }, (_, i) => ({ x: base.x + dir * i * seg * 0.2, y: base.y + i * seg * 0.95 }))
  return { pts, seg, tip: { ...pts[n] } }
}

const norm = (x: number, y: number) => {
  const d = Math.hypot(x, y) || 1
  return [x / d, y / d] as const
}

/** Moves the tip toward `target` (lagging) and bends the chain to follow, with the base fixed at `base`. */
export function stepTrunk(t: Trunk, base: Pt, target: Pt, chase: number, dt: number, droop = 1.5) {
  const k = 1 - Math.exp(-chase * dt)
  t.tip.x += (target.x - t.tip.x) * k
  t.tip.y += (target.y - t.tip.y) * k
  const n = t.pts.length - 1
  // The tip can't run off past the trunk's length (it would come back late when the food comes near).
  const dx = t.tip.x - base.x
  const dy = t.tip.y - base.y
  const d = Math.hypot(dx, dy)
  if (d > t.seg * n) {
    t.tip.x = base.x + (dx / d) * t.seg * n
    t.tip.y = base.y + (dy / d) * t.seg * n
  }
  // A little weight on the middle keeps it hanging and curling like a trunk instead of a stiff rod.
  for (let i = 1; i < n; i++) t.pts[i].y += droop * Math.sin((Math.PI * i) / n)
  for (let iter = 0; iter < 4; iter++) {
    t.pts[n].x = t.tip.x
    t.pts[n].y = t.tip.y
    for (let i = n - 1; i >= 0; i--) {
      const [ux, uy] = norm(t.pts[i].x - t.pts[i + 1].x, t.pts[i].y - t.pts[i + 1].y)
      t.pts[i].x = t.pts[i + 1].x + ux * t.seg
      t.pts[i].y = t.pts[i + 1].y + uy * t.seg
    }
    t.pts[0].x = base.x
    t.pts[0].y = base.y
    for (let i = 1; i <= n; i++) {
      const [ux, uy] = norm(t.pts[i].x - t.pts[i - 1].x, t.pts[i].y - t.pts[i - 1].y)
      t.pts[i].x = t.pts[i - 1].x + ux * t.seg
      t.pts[i].y = t.pts[i - 1].y + uy * t.seg
    }
  }
}

/** Where the real tip ended up (it can fall short of `t.tip` when the target is out of reach). */
export const tipOf = (t: Trunk) => t.pts[t.pts.length - 1]
