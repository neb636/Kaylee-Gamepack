// The L-shaped stairs at the back left, like Agong's real ones (Dad's photo and sketch): concrete steps with cream
// terrazzo treads and brick-red edges, red railings with a brown handrail. Flight 1 starts toward the back of the house
// and climbs toward the left wall along the wall that hides the kitchen (closed in underneath); a landing in the
// corner; then flight 2 turns and climbs forward along the left wall (open underneath) and comes out in the upstairs
// hallway. Shared by both floors: from upstairs you see them through the stairwell.
import type { BufferGeometry, Group } from 'three'
import { P } from '../../../engine/geo'
import { DIM, LANES, RISE, RUN1, RUN2 } from '../layout'
import { poke, scenery, type Kit } from './kit'

const PLASTER = '#F3E6D2'
const TREAD = '#F7EBD6'
const EDGE = '#E07A6A'
const BAR = '#EE7B70'
const RAIL = '#9B6A55'
/** How deep flight 2's concrete is under each tread. */
const SLAB = 0.3

export function buildStairs(kit: Kit): Group {
  const { x0, xLanding, xFoot, zTop, zLanding, zBack, steps1, steps2 } = DIM.stairs
  const { g0 } = DIM
  const body: BufferGeometry[] = []
  const tops: BufferGeometry[] = []
  const w1 = zLanding - zBack
  const w2 = xLanding - x0
  const z1 = LANES.flight1
  const x2 = LANES.flight2
  // Flight 1: each step solid to the floor. The red edge is on the side she steps up from.
  for (let i = 1; i <= steps1; i++) {
    const y = RISE * i
    const x = xFoot - RUN1 * (i - 0.5)
    body.push(P.box(RUN1 + 0.005, y, w1, PLASTER, { at: [x, y / 2, z1] }))
    tops.push(P.box(RUN1 - 0.03, 0.02, w1 - 0.02, TREAD, { at: [x - 0.01, y + 0.01, z1] }), P.box(0.05, 0.035, w1, EDGE, { at: [x + RUN1 / 2 - 0.02, y - 0.005, z1] }))
  }
  // The landing in the corner.
  const ly = RISE * (steps1 + 1)
  body.push(P.box(w2, ly, w1, PLASTER, { at: [x2, ly / 2, z1] }))
  tops.push(P.box(w2 - 0.02, 0.02, w1 - 0.02, TREAD, { at: [x2, ly + 0.01, z1] }), P.box(0.05, 0.035, w1, EDGE, { at: [xLanding + 0.02, ly - 0.005, z1] }))
  // Flight 2: a block of concrete under each tread, on a sloping slab, so it's open underneath.
  for (let j = 1; j <= steps2; j++) {
    const y = ly + RISE * j
    const z = zLanding + RUN2 * (j - 0.5)
    body.push(P.box(w2, SLAB, RUN2 + 0.005, PLASTER, { at: [x2, y - SLAB / 2, z] }))
    tops.push(P.box(w2 - 0.02, 0.02, RUN2 - 0.03, TREAD, { at: [x2, y + 0.01, z + 0.01] }), P.box(w2, 0.035, 0.05, EDGE, { at: [x2, y - 0.005, z - RUN2 / 2 + 0.02] }))
  }
  const dz = zTop - zLanding
  const dy = RISE * steps2
  body.push(P.box(w2, 0.2, Math.hypot(dz, dy), PLASTER, { at: [x2, ly - 0.25 + dy / 2, zLanding + dz / 2], rot: [Math.atan2(-dy, dz), 0, 0] }))

  const stairs = poke(kit, 'stairs-up', [], [0, 0, 0])
  stairs.add(scenery(kit, body, 2), scenery(kit, tops, 1))

  // Railings up flight 1's open front side, then up flight 2's open right side. Their other sides are walls.
  const rails: BufferGeometry[] = []
  railing(rails, [xFoot - 0.05, RISE, zLanding - 0.04], [xLanding, ly, zLanding - 0.04])
  railing(rails, [xLanding - 0.04, ly, zLanding], [xLanding - 0.04, g0 - RISE, zTop - 0.05])
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
  // Runs go straight along x or along z (sloping up the stairs, or flat), so one angle is enough.
  const len = Math.hypot(flat, dy)
  const at: [number, number, number] = [a[0] + dx / 2, a[1] + dy / 2 + h + 0.03, a[2] + dz / 2]
  if (Math.abs(dz) < 1e-6) out.push(P.box(len + 0.06, 0.06, 0.07, RAIL, { at, rot: [0, 0, Math.atan2(dy, dx)] }))
  else out.push(P.box(0.07, 0.06, len + 0.06, RAIL, { at, rot: [Math.atan2(-dy, dz), 0, 0] }))
}
