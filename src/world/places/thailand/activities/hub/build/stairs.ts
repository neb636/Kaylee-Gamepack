// The U-turn stairs in the left half, like Agong's real ones (Dad's photo): concrete steps with cream terrazzo treads
// and brick-red edges, red railings with a brown handrail. They open across the width of the house: flight 1 climbs
// from the foot toward the left wall, a landing against it, then flight 2 climbs back across (closed in underneath)
// and comes out in the upstairs hallway. Shared by both floors: from upstairs you see them through the stairwell, so
// the bit of left wall beside them lives here too.
import type { BufferGeometry, Group } from 'three'
import { P } from '../../../engine/geo'
import { DIM, LANES, RISE, RUN } from '../layout'
import { poke, scenery, type Kit } from './kit'

const PLASTER = '#F3E6D2'
const TREAD = '#F7EBD6'
const EDGE = '#E07A6A'
const BAR = '#EE7B70'
const RAIL = '#9B6A55'
const WALL = '#FFE4D4'

export function buildStairs(kit: Kit): Group {
  const { x0, xLanding, x1, zFront, mid, zBack, steps } = DIM.stairs
  const { g0 } = DIM
  const body: BufferGeometry[] = []
  const tops: BufferGeometry[] = []
  const w1 = zFront - mid
  const w2 = mid - zBack
  // Each step is solid to the floor (flight 2's are tall: that's the closed-in space under it). The red edge is on
  // the side she steps up from.
  for (let i = 1; i <= steps; i++) {
    const y = RISE * i
    const x = x1 - RUN * (i - 0.5)
    body.push(P.box(RUN + 0.005, y, w1, PLASTER, { at: [x, y / 2, LANES.up1] }))
    tops.push(P.box(RUN - 0.03, 0.02, w1 - 0.02, TREAD, { at: [x - 0.01, y + 0.01, LANES.up1] }), P.box(0.05, 0.035, w1, EDGE, { at: [x + RUN / 2 - 0.02, y - 0.005, LANES.up1] }))
  }
  const ly = RISE * (steps + 1)
  body.push(P.box(xLanding - x0, ly, zFront - zBack, PLASTER, { at: [(x0 + xLanding) / 2, ly / 2, (zFront + zBack) / 2] }))
  tops.push(P.box(xLanding - x0 - 0.02, 0.02, zFront - zBack - 0.02, TREAD, { at: [(x0 + xLanding) / 2, ly + 0.01, (zFront + zBack) / 2] }), P.box(0.05, 0.035, w1, EDGE, { at: [xLanding + 0.02, ly - 0.005, LANES.up1] }))
  for (let j = 1; j <= steps; j++) {
    const y = ly + RISE * j
    const x = xLanding + RUN * (j - 0.5)
    body.push(P.box(RUN + 0.005, y, w2, PLASTER, { at: [x, y / 2, LANES.up2] }))
    tops.push(P.box(RUN - 0.03, 0.02, w2 - 0.02, TREAD, { at: [x + 0.01, y + 0.01, LANES.up2] }), P.box(0.05, 0.035, w2, EDGE, { at: [x - RUN / 2 + 0.02, y - 0.005, LANES.up2] }))
  }
  // The left wall beside the stairs.
  body.push(P.box(0.15, g0, zFront - zBack, WALL, { at: [x0 - 0.075, g0 / 2, (zFront + zBack) / 2] }))

  const stairs = poke(kit, 'stairs-up', [], [0, 0, 0])
  stairs.add(scenery(kit, body, 2), scenery(kit, tops, 1))

  // Railings: up flight 1's open front side and along the landing, up between the flights, and along the landing's
  // back and up flight 2's open back side.
  const rails: BufferGeometry[] = []
  const zf = zFront - 0.04
  const zb = zBack + 0.04
  railing(rails, [x1 - 0.05, RISE, zf], [xLanding, ly, zf])
  railing(rails, [xLanding, ly, zf], [x0 + 0.04, ly, zf])
  railing(rails, [xLanding, ly, mid], [x1, g0 - RISE, mid])
  railing(rails, [x0 + 0.04, ly, zb], [xLanding, ly, zb])
  railing(rails, [xLanding, ly, zb], [x1, g0 - RISE, zb])
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
