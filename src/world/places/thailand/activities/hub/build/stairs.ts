// The U-turn stairs in the left half, like Agong's real ones (Dad's photo): wide concrete steps with cream terrazzo
// treads and brick-red edges, red railings with a brown handrail. Flight 1 climbs toward the back from the shop, a
// landing against the back of the stairwell, then flight 2 climbs back toward the front along the left wall (closed
// in underneath) and comes out in the upstairs hallway. Shared by both floors: from upstairs you see them through the
// stairwell, so the bit of left wall beside them lives here too.
import type { BufferGeometry, Group } from 'three'
import { P } from '../../../engine/geo'
import { DIM, RISE, RUN } from '../layout'
import { poke, scenery, type Kit } from './kit'

const PLASTER = '#F3E6D2'
const TREAD = '#F7EBD6'
const EDGE = '#E07A6A'
const BAR = '#EE7B70'
const RAIL = '#9B6A55'
const WALL = '#FFE4D4'

export function buildStairs(kit: Kit): Group {
  const { x0, mid, x1, zFront, zLanding, zBack, steps } = DIM.stairs
  const { g0 } = DIM
  const body: BufferGeometry[] = []
  const tops: BufferGeometry[] = []
  const wIn = x1 - mid
  const wOut = mid - x0
  // Each step is solid to the floor (flight 2's are tall: that's the closed-in space under it).
  for (let i = 1; i <= steps; i++) {
    const y = RISE * i
    const z = zFront - RUN * (i - 0.5)
    body.push(P.box(wIn, y, RUN + 0.005, PLASTER, { at: [(mid + x1) / 2, y / 2, z] }))
    tops.push(P.box(wIn - 0.02, 0.02, RUN - 0.03, TREAD, { at: [(mid + x1) / 2, y + 0.01, z - 0.01] }), P.box(wIn, 0.035, 0.05, EDGE, { at: [(mid + x1) / 2, y - 0.005, z + RUN / 2 - 0.02] }))
  }
  const ly = RISE * (steps + 1)
  body.push(P.box(x1 - x0, ly, zLanding - zBack, PLASTER, { at: [(x0 + x1) / 2, ly / 2, (zLanding + zBack) / 2] }))
  tops.push(P.box(x1 - x0 - 0.02, 0.02, zLanding - zBack - 0.02, TREAD, { at: [(x0 + x1) / 2, ly + 0.01, (zLanding + zBack) / 2] }), P.box(wIn, 0.035, 0.05, EDGE, { at: [(mid + x1) / 2, ly - 0.005, zLanding - 0.02] }))
  for (let j = 1; j <= steps; j++) {
    const y = ly + RISE * j
    const z = zLanding + RUN * (j - 0.5)
    body.push(P.box(wOut, y, RUN + 0.005, PLASTER, { at: [(x0 + mid) / 2, y / 2, z] }))
    tops.push(P.box(wOut - 0.02, 0.02, RUN - 0.03, TREAD, { at: [(x0 + mid) / 2, y + 0.01, z + 0.01] }), P.box(wOut, 0.035, 0.05, EDGE, { at: [(x0 + mid) / 2, y - 0.005, z - RUN / 2 + 0.02] }))
  }
  // The left wall beside the stairs, and the stairwell's back wall behind the landing (floor to ceiling).
  body.push(P.box(0.15, g0, zFront - zBack, WALL, { at: [x0 - 0.075, g0 / 2, (zFront + zBack) / 2] }))
  body.push(P.box(x1 - x0 + 0.15, g0, 0.12, WALL, { at: [(x0 + x1 - 0.15) / 2, g0 / 2, zBack - 0.06] }))

  const stairs = poke(kit, 'stairs-up', [], [0, 0, 0])
  stairs.add(scenery(kit, body, 2), scenery(kit, tops, 1))

  // Railings: red bars under a brown handrail, up flight 1's open side, along the landing, and up between the flights.
  const rails: BufferGeometry[] = []
  railing(rails, [x1 - 0.04, RISE, zFront - 0.05], [x1 - 0.04, ly, zLanding])
  railing(rails, [x1 - 0.04, ly, zLanding], [x1 - 0.04, ly, zBack + 0.04])
  railing(rails, [mid, ly, zLanding], [mid, g0 - RISE, zFront])
  stairs.add(scenery(kit, rails, 1.5))
  return stairs
}

/**
 * A run of railing from `a` to `b` (each the floor or step height at that end): bars every 13 cm and a handrail 0.9 m
 * above, sloping with the stairs. Exported for the railing round the stairwell upstairs.
 */
export function railing(out: BufferGeometry[], a: [number, number, number], b: [number, number, number], h = 0.9) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const dz = b[2] - a[2]
  const flat = Math.hypot(dx, dz)
  const n = Math.max(1, Math.round(flat / 0.13))
  for (let i = 0; i <= n; i++) {
    const t = i / n
    out.push(P.box(0.03, h, 0.03, BAR, { at: [a[0] + dx * t, a[1] + dy * t + h / 2, a[2] + dz * t] }))
  }
  // Runs either slope along z (up the stairs) or lie flat along x, so one angle is enough.
  const len = Math.hypot(flat, dy)
  const rot: [number, number, number] = Math.abs(dx) < 1e-6 ? [Math.atan2(-dy, dz), 0, 0] : [0, Math.atan2(dx, dz), 0]
  out.push(P.box(0.07, 0.06, len + 0.06, RAIL, { at: [a[0] + dx / 2, a[1] + dy / 2 + h + 0.03, a[2] + dz / 2], rot }))
}
