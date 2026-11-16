// The island's walkways audit (2026-11-16, after Mom kept getting stuck by the pier): two things on ground she can
// walk on are either touching (one solid thing to walk round) or have a way between them wide enough for the three of
// them (WIDE). A gap in between looks like a way through and wedges whoever tries it. And every deck's walkway is wide
// enough for a parent to step past another. Plain math, no three.js: island.ts hands it the blockers, the decks and
// where she can stand, and its qa() reports what it finds (scripts/qa-samet-walk.mjs fails on any).
import type { XZ } from './layout'

/** A way between two things: at least this wide (m), three characters side by side. Hand-placed things keep to it. */
export const WIDE = 2.4
/** Narrower than this (m) is a slot she fits through and Mom and Dad don't (or nobody does but it looks open): sealed
 *  shut (`seal`), so it's one solid thing to walk round. The random rocks leave hundreds of these. */
export const SEAL = 1.2
/** Closer than this they count as touching (m). */
const TOUCH = 0.04
/** A deck's walkway (its top's full width): at least this wide (m). */
export const DECK_WIDE = 2.6

export interface Gap {
  a: XZ & { r: number }
  b: XZ & { r: number }
  /** The way between them (m). */
  gap: number
}

/** Every pair of blockers with a too-narrow way between them, where the middle of that way is somewhere she could walk
 *  (`walk`). Each pair once; the narrowest first. */
export function narrowGaps(blockers: readonly [number, number, number][], walk: (x: number, z: number) => boolean, wide = WIDE): Gap[] {
  const out: Gap[] = []
  // (On a grid of cells, so it's pairs of neighbours, not every pair on the island.)
  const cell = 6
  const grid = new Map<string, number[]>()
  blockers.forEach(([x, z], i) => {
    const k = `${Math.floor(x / cell)},${Math.floor(z / cell)}`
    const a = grid.get(k)
    if (a) a.push(i)
    else grid.set(k, [i])
  })
  blockers.forEach(([x, z, r], i) => {
    const ci = Math.floor(x / cell)
    const cj = Math.floor(z / cell)
    for (let di = -1; di <= 1; di++)
      for (let dj = -1; dj <= 1; dj++)
        for (const j of grid.get(`${ci + di},${cj + dj}`) ?? []) {
          if (j <= i) continue
          const [x2, z2, r2] = blockers[j]
          const d = Math.hypot(x2 - x, z2 - z)
          const gap = d - r - r2
          if (gap < TOUCH || gap >= wide) continue
          // The middle of the way between their edges.
          const k = (r + gap / 2) / (d || 1)
          const mx = x + (x2 - x) * k
          const mz = z + (z2 - z) * k
          if (!walk(mx, mz)) continue
          // (Already shut by something else in it: a third rock, a filler.)
          let shut = false
          for (let ei = -1; ei <= 1 && !shut; ei++)
            for (let ej = -1; ej <= 1 && !shut; ej++)
              for (const m of grid.get(`${Math.floor(mx / cell) + ei},${Math.floor(mz / cell) + ej}`) ?? []) {
                if (m === i || m === j) continue
                const [x3, z3, r3] = blockers[m]
                if (Math.hypot(mx - x3, mz - z3) < r3) {
                  shut = true
                  break
                }
              }
          if (shut) continue
          out.push({ a: { x, z, r }, b: { x: x2, z: z2, r: r2 }, gap: +gap.toFixed(2) })
        }
  })
  return out.sort((p, q) => p.gap - q.gap)
}

/** Shuts every slot narrower than SEAL where she could walk with a filler circle between the two things (a few times
 *  over, for slots the fillers make). How many it shut. */
export function seal(blockers: { all(): readonly [number, number, number][]; add(x: number, z: number, r: number): void }, walk: (x: number, z: number) => boolean) {
  let n = 0
  for (let pass = 0; pass < 4; pass++)
    for (const g of narrowGaps(blockers.all(), walk, SEAL)) {
      const d = Math.hypot(g.b.x - g.a.x, g.b.z - g.a.z) || 1
      const k = (g.a.r + g.gap / 2) / d
      blockers.add(g.a.x + (g.b.x - g.a.x) * k, g.a.z + (g.b.z - g.a.z) * k, g.gap / 2 + 0.15)
      n++
    }
  return n
}

/** Decks whose walkway is narrower than DECK_WIDE (by index). */
export function narrowDecks(decks: readonly { hw: number; rw?: number }[]): number[] {
  return decks.flatMap((d, i) => (2 * d.hw < DECK_WIDE || (d.rw !== undefined && 2 * d.rw < DECK_WIDE) ? [i] : []))
}
