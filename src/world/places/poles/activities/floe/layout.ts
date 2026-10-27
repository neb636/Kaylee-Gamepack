// Ice Floe Hop's sea, as data in meters: where every floe floats, how big it is and what it does. One course from Pola
// (at z = 0, nearest her) away up the screen to Mama Bear's big ice (far, -z). Each stage starts on a bigger "rest" floe
// that holds still (a breather, and where a section link starts him), then rows of floes, often two to a row, so
// there's always more than one way across:
//   steady: big floes close together, nothing to get wrong;
//   drift:  smaller floes sliding side to side and turning (wait for the right moment), some tippy little ones;
//   melt:   summer, small floes further apart, and loose bits she can push together into a bridge.
// `layout(n)` lays them out differently for each n (the `layout` param), always the same for the same n.

export type Stage = 'start' | 'steady' | 'drift' | 'melt' | 'mama'

export interface FloeSpec {
  x: number
  z: number
  /** The floe's outline round its middle, [x, z] in meters (before `yaw`). */
  pts: [number, number][]
  yaw: number
  stage: Stage
  /** Holds still: a stage's first floe. */
  rest?: boolean
  /** Little and wobbly: landing near its edge tips him off. */
  tippy?: boolean
  /** She can push it around with her finger (summer). */
  push?: boolean
  /** Slides side to side and turns (meters, seconds, radians, radians a second). */
  drift?: { amp: number; period: number; phase: number; spin: number }
}

/** Seeded, so a layout number always gives the same sea. */
function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) * 7919 + 13) % 233280
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

/** A lumpy ice outline about `r` across the middle. */
function outline(r: number, rand: () => number, n = 9): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.4
    const k = r * (0.84 + rand() * 0.3)
    pts.push([Math.sin(a) * k, Math.cos(a) * k])
  }
  return pts
}

export function layout(n: number): FloeSpec[] {
  const rand = rng(n)
  const between = (a: number, b: number) => a + rand() * (b - a)
  const out: FloeSpec[] = []
  // (A drifting floe under a meter across is a tippy one.)
  const add = (x: number, z: number, r: number, stage: Stage, more: Partial<FloeSpec> = {}) =>
    out.push({ x, z, pts: outline(r, rand), yaw: rand() * Math.PI * 2, stage, tippy: !!more.drift && r < 0.95, ...more })
  /** One row: one floe somewhere in the middle, or two apart (a choice of path). */
  const row = (z: number, r: () => number, spread: number, stage: Stage, more: () => Partial<FloeSpec>) => {
    if (rand() < 0.55) {
      const gap = between(spread * 0.8, spread)
      const shift = between(-0.6, 0.6)
      add(shift - gap, z + between(-0.3, 0.3), r(), stage, more())
      add(shift + gap, z + between(-0.3, 0.3), r(), stage, more())
    } else add(between(-1.4, 1.4), z, r(), stage, more())
  }

  let z = 0
  add(0, z, 2.2, 'start', { rest: true })
  for (let i = 0; i < 6; i++) row((z -= 3.5), () => between(1.35, 1.7), 2.5, 'steady', () => ({}))

  add(between(-0.8, 0.8), (z -= 3.8), 1.9, 'drift', { rest: true })
  for (let i = 0; i < 7; i++) {
    const d = { amp: between(1.4, 2.4), period: between(6, 10), phase: rand() * Math.PI * 2, spin: between(-0.18, 0.18) }
    // A row drifts together, so its two floes never bump.
    row((z -= 3.8), () => (rand() < 0.3 ? 0.85 : between(1.05, 1.4)), 2.3, 'drift', () => ({ drift: d }))
  }

  add(between(-0.6, 0.6), (z -= 4), 1.8, 'melt', { rest: true })
  for (let i = 0; i < 6; i++) {
    row((z -= 4.4), () => between(0.75, 1.1), 2.3, 'melt', () => ({ push: true }))
    // Loose bits off to the sides, for a bridge.
    if (i % 2 === 0) add((rand() < 0.5 ? -1 : 1) * between(3.6, 4.6), z - 2.2, between(0.65, 0.85), 'melt', { push: true })
  }

  // Mama Bear's big ice.
  add(0, z - 9.5, 5.6, 'mama', { rest: true })
  return out
}
