// The stairs along the right wall, from the foot near the fridge up toward the back. Shared by both floors: from
// upstairs you see them through the stairwell.
import type { Group } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { poke, scenery, type Kit } from './kit'

export function buildStairs(kit: Kit): Group {
  const { x0, zBottom, zTop, steps } = DIM.stairs
  const run = (zBottom - zTop) / steps
  const rise = DIM.g0 / steps
  const w = DIM.right - x0
  const cx = (x0 + DIM.right) / 2
  const blocks = Array.from({ length: steps }, (_, i) => P.box(w, rise * (i + 1), run + 0.005, i % 2 ? '#EBC29C' : '#E3B386', { at: [cx, (rise * (i + 1)) / 2, zBottom - run * (i + 0.5)] }))
  const treads = Array.from({ length: steps }, (_, i) => P.box(w + 0.02, 0.03, 0.06, '#C98F62', { at: [cx, rise * (i + 1) + 0.015, zBottom - run * i - 0.03] }))
  const stairs = poke(kit, 'stairs-up', [], [0, 0, 0])
  stairs.add(scenery(kit, [...blocks, ...treads], 2))
  // Handrail on the open side, rising with the steps.
  const len = Math.hypot(DIM.g0, zBottom - zTop)
  const angle = Math.atan2(DIM.g0, zBottom - zTop)
  const posts = [0, 0.25, 0.5, 0.75, 1].map((t) => P.box(0.05, 0.9, 0.05, PAL.cream, { at: [x0 + 0.04, DIM.g0 * t + 0.45, zBottom - (zBottom - zTop) * t] }))
  stairs.add(scenery(kit, [...posts, P.box(0.07, 0.07, len, '#C98F62', { at: [x0 + 0.04, DIM.g0 / 2 + 0.92, (zBottom + zTop) / 2], rot: [angle, 0, 0] })], 1.5))
  return stairs
}
