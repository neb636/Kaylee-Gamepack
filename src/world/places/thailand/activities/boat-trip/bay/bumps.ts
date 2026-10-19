// Soft bumps for the boats: no damage, no crash, ever. A boat overlapping a circle (a rock tower, a post, the tour boat)
// or a box (a stilt house, the floating field) is pushed back out and bounces off with a little turn along the surface
// (so pushing into the same rock again slides round it: drive.ts), the shore behind the pier pushes it back, and at
// the bay's edge a current turns it round. Anything hard enough is a bonk (boing, spray, wiggles: bay.ts).
import { clamp } from '../../../../../../sdk'
import { BOUNDS, SHORE_Z } from './layout'
import type { Box, Circle, Ride } from './part'

/** `bonk(x, z, speed)` for every bump hard enough; `each(at, px, pz)` for each of the hull's circles (the buoys). */
export function collide(ride: Ride, circles: Circle[], boxes: Box[], bonk: (x: number, z: number, hit: number) => void, each?: (at: number, px: number, pz: number) => void) {
  const d = ride.d
  const v = ride.v
  const sx = Math.sin(d.heading)
  const sz = Math.cos(d.heading)
  const push = (px: number, pz: number, nx: number, nz: number, depth: number) => {
    d.x += nx * depth
    d.z += nz * depth
    const hit = d.bounce(nx, nz)
    if (hit > 1.2) bonk(px - nx * v.hull.r, pz - nz * v.hull.r, hit)
  }
  for (const at of v.hull.at) {
    const px = d.x + sx * at
    const pz = d.z + sz * at
    for (const [cx, cz, cr] of circles) {
      const dx = px - cx
      const dz = pz - cz
      const min = cr + v.hull.r
      const dd = dx * dx + dz * dz
      if (dd >= min * min || dd < 1e-8) continue
      const dist = Math.sqrt(dd)
      push(px, pz, dx / dist, dz / dist, min - dist)
    }
    for (const [cx, cz, hx, hz] of boxes) {
      // The nearest point of the box to the hull circle.
      const qx = clamp(px, cx - hx, cx + hx)
      const qz = clamp(pz, cz - hz, cz + hz)
      const dist = Math.hypot(px - qx, pz - qz)
      if (dist >= v.hull.r) continue
      if (dist < 1e-4) {
        // Inside it: out the nearest side.
        const ox = hx - Math.abs(px - cx)
        const oz = hz - Math.abs(pz - cz)
        if (ox < oz) push(px, pz, Math.sign(px - cx) || 1, 0, v.hull.r + ox)
        else push(px, pz, 0, Math.sign(pz - cz) || 1, v.hull.r + oz)
      } else push(px, pz, (px - qx) / dist, (pz - qz) / dist, v.hull.r - dist)
    }
    each?.(at, px, pz)
    // The shore behind the pier.
    if (pz > SHORE_Z - 2) {
      d.z -= pz - (SHORE_Z - 2)
      const hit = d.bounce(0, -1)
      if (hit > 1.2) bonk(px, SHORE_Z - 2, hit)
    }
  }
  // The bay's edge: a current turns her back.
  const ex = d.x - BOUNDS.x
  const ez = d.z - BOUNDS.z
  const e = Math.hypot(ex, ez)
  if (e > BOUNDS.r) {
    d.x -= (ex / e) * (e - BOUNDS.r)
    d.z -= (ez / e) * (e - BOUNDS.r)
    d.bounce(-ex / e, -ez / e, 0.6)
  }
}
