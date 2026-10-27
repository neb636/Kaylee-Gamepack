// An elephant's trunk: a chain of short segments fixed under its face (PR #86's FABRIK chain, from 2D points to
// meters). Each frame the tip chases a target (her food, the mouth, the gravel) with some lag, and FABRIK bends the
// chain to reach it, sagging in the middle and kept above the rail and the boulders. That lag and the bend are what
// make it feel like a snake following her finger. Drawn as one tapered cylinder (with a knuckle) per segment, each
// turned toward the next point: nothing is rebuilt per frame, and the ink outline still works.
import { Group, Quaternion, Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'

export interface Trunk {
  pts: Vector3[]
  /** Where the tip is heading (it chases this). */
  tip: Vector3
  /** One segment's length (m): the whole trunk is `seg * n` (the ?debug reach slider changes it). */
  seg: number
  /** The length the segments were modeled at (they stretch to `seg`). */
  geo: number
  /** The drawn segments, in the scene (world space). */
  root: Group
  parts: Group[]
}

/** How high the chain must stay over what's in front of the elephants, by z (the rail, then the boulders). */
export type Floor = (x: number, z: number) => number

const up = new Vector3(0, 1, 0)
const d = new Vector3()
const q = new Quaternion()

/** A trunk of `n` segments hanging from `base`, `len` long, `r0` thick at the root and `r1` at the tip. */
export function makeTrunk(bag: Bag, base: Vector3, len: number, n: number, r0: number, r1: number, hide: string, dark: string, tipColor: string): Trunk {
  const seg = len / n
  const pts = Array.from({ length: n + 1 }, (_, i) => base.clone().add(new Vector3(0, -i * seg * 0.96, i * seg * 0.25)))
  const root = new Group()
  const parts: Group[] = []
  for (let i = 0; i < n; i++) {
    const a = r0 + ((r1 - r0) * i) / n
    const b = r0 + ((r1 - r0) * (i + 1)) / n
    const last = i === n - 1
    // Each segment runs up its own +y from the joint: a slightly fatter knuckle where it meets the one before it, and a
    // pink tip on the last.
    const g = solid(
      merge([
        P.cyl(b, a, seg * 1.04, i % 2 ? hide : dark, { at: [0, (seg * 1.04) / 2, 0] }, 12),
        P.sphere(a * 1.04, i % 2 ? hide : dark, {}, 10),
        ...(last ? [P.sphere(b * 1.12, tipColor, { at: [0, seg, 0], scale: [1, 0.7, 1] }, 10)] : []),
      ]),
      bag,
      1.5,
    )
    root.add(g)
    parts.push(g)
  }
  return { pts, tip: pts[n].clone(), seg, geo: seg, root, parts }
}

/** Moves the tip toward `target` (lagging) and bends the chain to follow, with its root fixed at `base`. */
export function stepTrunk(t: Trunk, base: Vector3, target: Vector3, chase: number, dt: number, droop: number, floor: Floor) {
  const n = t.pts.length - 1
  const k = 1 - Math.exp(-chase * dt)
  t.tip.lerp(target, k)
  // The tip can't run off past the trunk's length (it would come back late when the food comes near).
  d.subVectors(t.tip, base)
  const reach = t.seg * n * 0.995
  if (d.length() > reach) t.tip.copy(base).addScaledVector(d.normalize(), reach)
  // A little weight in the middle keeps it hanging and curling like a trunk instead of a stiff rod.
  for (let i = 1; i < n; i++) t.pts[i].y -= droop * Math.sin((Math.PI * i) / n)
  for (let iter = 0; iter < 4; iter++) {
    t.pts[n].copy(t.tip)
    for (let i = n - 1; i >= 0; i--) {
      d.subVectors(t.pts[i], t.pts[i + 1]).normalize()
      t.pts[i].copy(t.pts[i + 1]).addScaledVector(d, t.seg)
    }
    t.pts[0].copy(base)
    for (let i = 1; i <= n; i++) {
      d.subVectors(t.pts[i], t.pts[i - 1]).normalize()
      t.pts[i].copy(t.pts[i - 1]).addScaledVector(d, t.seg)
      // Over the rail and the boulders, never through them.
      const low = floor(t.pts[i].x, t.pts[i].z)
      if (t.pts[i].y < low) t.pts[i].y = low
    }
  }
}

/** Turns each drawn segment from its joint toward the next one (stretched to fit). */
export function drawTrunk(t: Trunk) {
  for (let i = 0; i < t.parts.length; i++) {
    const g = t.parts[i]
    const a = t.pts[i]
    d.subVectors(t.pts[i + 1], a)
    const len = d.length()
    g.position.copy(a)
    g.quaternion.copy(q.setFromUnitVectors(up, d.divideScalar(len || 1)))
    g.scale.set(1, len / t.geo, 1)
  }
}

/** Where the real tip ended up (it falls short of `t.tip` when the target is out of reach). */
export const tipOf = (t: Trunk) => t.pts[t.pts.length - 1]
