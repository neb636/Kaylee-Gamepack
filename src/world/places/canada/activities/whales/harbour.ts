// Whale Watch's town, up close: Tofino's painted cottages along the shore and the fishing boats moored at the dock.
// Each is a list of parts (coast.ts merges the whole town into one shape).
//
// Faces that sit in front of a wall (frames, glass, doors) each stand a few centimeters proud of the one behind, never
// flush: two faces in the same plane flicker as the camera moves (the moored boats' decks did, 2026-11-20).
import { Color, type BufferGeometry } from 'three'
import { loft, P, type LoftRing } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const WHITE = '#FFFDF7'
const GLASS = '#BFE9F7'
const STONE = '#9C95AE'
const BRICK = '#C4737A'
const FLOWERS = ['#FF8FB8', '#FFD45C', '#C9A8FF', '#FFFFFF']

const shade = (c: string, k: number) => '#' + new Color(c).multiplyScalar(k).getHexString()

/** One cottage standing on the grass (its floor at `ground`), its front (a door, windows, a porch) facing the sea (-z). */
export function cottage(x: number, z: number, w: number, h: number, wall: string, roof: string, ground: number, rand: () => number): BufferGeometry[] {
  const D = 5
  const F = z - D / 2
  const y0 = ground + 0.5
  const yb = y0 + h
  const rh = 1.4 + w * 0.14
  const parts: BufferGeometry[] = []
  const at = (px: number, py: number, pz: number): { at: [number, number, number] } => ({ at: [px, py, pz] })

  // A stone footing, clapboard walls (a darker line every half meter) with white corner boards.
  parts.push(P.box(w + 0.3, 0.5, D + 0.3, STONE, at(x, ground + 0.25, z)))
  parts.push(P.rbox(w, h, D, 0.1, wall, at(x, y0 + h / 2, z)))
  const line = shade(wall, 0.9)
  for (let y = y0 + 0.55; y < yb - 0.2; y += 0.55) parts.push(P.box(w + 0.06, 0.07, D + 0.06, line, at(x, y, z)))
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(P.box(0.24, h, 0.24, WHITE, at(x + (sx * w) / 2, y0 + h / 2, z + (sz * D) / 2)))

  // The roof: the gable ends in the walls' color, two roof slabs that overhang all round, a ridge cap.
  parts.push(P.prism([[-w / 2, 0], [w / 2, 0], [0, rh]], D, wall, at(x, yb, z)))
  const hw = w / 2 + 0.5
  const th = Math.atan2(rh, w / 2)
  const L = hw / Math.cos(th) + 0.1
  for (const s of [-1, 1]) parts.push(P.box(L, 0.22, D + 0.9, roof, { at: [x + (s * hw) / 2, yb + rh - (hw / 2) * Math.tan(th) + 0.12, z], rot: [0, 0, -s * th] }))
  parts.push(P.box(0.3, 0.2, D + 0.95, shade(roof, 0.85), at(x, yb + rh + 0.2, z)))
  // A round window up in the front gable.
  parts.push(P.cyl(0.46, 0.46, 0.1, WHITE, { at: [x, yb + rh * 0.36, F - 0.03], rot: [Math.PI / 2, 0, 0] }, 16))
  parts.push(P.cyl(0.34, 0.34, 0.1, GLASS, { at: [x, yb + rh * 0.36, F - 0.07], rot: [Math.PI / 2, 0, 0] }, 16))
  // Most have a chimney.
  if (rand() < 0.7) {
    const cx = x + w * 0.22
    parts.push(P.box(0.7, rh + 0.6, 0.7, BRICK, at(cx, yb + rh * 0.55 + 0.3, z + 1.2)), P.box(0.86, 0.16, 0.86, shade(BRICK, 0.75), at(cx, yb + rh * 0.55 + 0.6 + rh / 2, z + 1.2)))
  }

  // The front door in a white frame, a little roof over it on brackets, two steps down to a stepping-stone path.
  const dx = x - w * 0.22
  const door = ['#8A6A58', '#E8443F', '#4E6A9C', '#3C7A5F'][Math.floor(rand() * 4)]
  parts.push(P.box(1.3, 2.05, 0.1, WHITE, at(dx, y0 + 1.0, F - 0.03)), P.box(1.0, 1.85, 0.1, door, at(dx, y0 + 0.93, F - 0.07)), P.sphere(0.07, PAL.gold, at(dx + 0.32, y0 + 0.9, F - 0.14), 8))
  parts.push(P.box(1.9, 0.14, 1.1, roof, { at: [dx, y0 + 2.3, F - 0.5], rot: [-0.22, 0, 0] }))
  for (const s of [-1, 1]) parts.push(P.box(0.1, 0.5, 0.1, WHITE, { at: [dx + s * 0.75, y0 + 2.0, F - 0.45], rot: [0.7, 0, 0] }))
  parts.push(P.box(1.5, 0.25, 0.5, STONE, at(dx, ground + 0.125, F - 0.4)), P.box(1.5, 0.25, 0.4, STONE, at(dx, ground + 0.375, F - 0.2)))
  for (let i = 0; i < 3; i++) parts.push(P.cyl(0.38, 0.4, 0.08, '#D9D2E0', at(dx + (rand() - 0.5) * 0.3, ground + 0.04, F - 1.2 - i * 0.9), 9))

  // Windows: white frames with a cross in the glass, a flower box under the ones downstairs.
  const win = (wx: number, wy: number, flowers: boolean) => {
    parts.push(P.box(1.25, 1.25, 0.1, WHITE, at(wx, wy, F - 0.03)), P.box(0.95, 0.95, 0.1, GLASS, at(wx, wy, F - 0.07)))
    parts.push(P.box(0.08, 0.95, 0.1, WHITE, at(wx, wy, F - 0.11)), P.box(0.95, 0.08, 0.1, WHITE, at(wx, wy, F - 0.11)))
    if (!flowers) return
    parts.push(P.box(1.35, 0.28, 0.38, '#9A6B55', at(wx, wy - 0.78, F - 0.2)))
    for (let i = 0; i < 4; i++) parts.push(P.sphere(0.16, FLOWERS[(i + Math.floor(wx)) & 3], at(wx - 0.48 + i * 0.32, wy - 0.58, F - 0.22), 7))
  }
  const wx = x + w * 0.2
  win(wx, y0 + 1.3, true)
  if (h > 4.4) {
    win(dx, y0 + h - 1.1, false)
    win(wx, y0 + h - 1.1, false)
  }
  // A window on each side.
  for (const s of [-1, 1]) {
    parts.push(P.box(0.1, 1.15, 1.15, WHITE, at(x + s * (w / 2 + 0.03), y0 + 1.4, z)), P.box(0.1, 0.88, 0.88, GLASS, at(x + s * (w / 2 + 0.07), y0 + 1.4, z)))
  }

  // A white picket fence across the front garden (a gap for the path), a bush or two beside the steps.
  const fz = F - 2.2
  for (let px = x - w / 2 - 0.4; px <= x + w / 2 + 0.4; px += 0.42) {
    if (Math.abs(px - dx) < 0.75) continue
    parts.push(P.box(0.13, 0.75, 0.06, WHITE, at(px, ground + 0.375, fz)), P.cone(0.09, 0.14, WHITE, { at: [px, ground + 0.82, fz], rot: [0, Math.PI / 4, 0] }, 4))
  }
  for (const [a, b] of [
    [x - w / 2 - 0.45, dx - 0.7],
    [dx + 0.7, x + w / 2 + 0.45],
  ]) {
    if (b - a < 0.2) continue
    for (const ry of [0.25, 0.55]) parts.push(P.box(b - a, 0.08, 0.05, WHITE, at((a + b) / 2, ground + ry, fz + 0.05)))
  }
  for (const s of [-1, 1]) {
    if (rand() < 0.35) continue
    const bx = dx + s * 1.25
    parts.push(P.sphere(0.5, s < 0 ? '#5E9E6E' : '#6FAE78', { at: [bx, ground + 0.3, F - 0.5], scale: [1, 0.8, 1] }, 9))
    parts.push(P.sphere(0.12, FLOWERS[Math.floor(rand() * 3)], at(bx + 0.2, ground + 0.62, F - 0.75), 6), P.sphere(0.12, FLOWERS[Math.floor(rand() * 3)], at(bx - 0.25, ground + 0.55, F - 0.8), 6))
  }
  return parts
}

/** A hull section: `b` half its width, the deck `top` high and the keel `keel` low, at `z` along the boat. */
const ring = (z: number, b: number, top: number, keel: number): LoftRing => ({
  z,
  pts: [
    [0, keel],
    [b * 0.72, keel + 0.32],
    [b, 0.12],
    [b, top - 0.14],
    [b, top],
    [-b, top],
    [-b, top - 0.14],
    [-b, 0.12],
    [-b * 0.72, keel + 0.32],
  ],
})

/** A little fishing boat moored at the dock (bow toward the sea): one lofted hull with its deck (no deck laid on top),
 *  a wheelhouse with windows, a mast, a life ring, white fenders on the dock side. Placed at the waterline. */
export function fishingBoat(x: number, z: number, hull: string, cabin: string): BufferGeometry[] {
  const o = { at: [x, 0.35, z] as [number, number, number], rot: [0, Math.PI, 0] as [number, number, number] }
  // (Local: +z the bow, which turns to face -z, the sea; +x is then toward the dock.)
  const bottom = '#5E5A70'
  const parts: BufferGeometry[] = [
    loft([ring(-2.7, 1.0, 0.55, -0.45), ring(-1.2, 1.15, 0.55, -0.55), ring(0.8, 1.12, 0.6, -0.55), ring(2.0, 0.82, 0.7, -0.4), ring(2.8, 0.1, 0.82, -0.05)], [bottom, hull, hull, WHITE, '#E9DFD0', WHITE, hull, hull, bottom], o),
  ]
  const put = (g: BufferGeometry) => {
    g.rotateY(Math.PI)
    g.translate(x, 0.35, z)
    parts.push(g)
  }
  const deck = 0.57
  // The wheelhouse (its windows face the bow and the sides), its white roof, the mast with a pink pennant.
  put(P.rbox(1.6, 1.4, 1.7, 0.12, cabin, { at: [0, deck + 0.7, 0.1] }))
  put(P.rbox(1.95, 0.18, 2.05, 0.06, WHITE, { at: [0, deck + 1.49, 0.1] }))
  put(P.box(1.25, 0.5, 0.08, '#4A4458', { at: [0, deck + 1.0, 0.98] }))
  for (const s of [-1, 1]) put(P.box(0.08, 0.45, 0.9, '#4A4458', { at: [s * 0.82, deck + 1.0, 0.1] }))
  put(P.cyl(0.05, 0.06, 2.2, WHITE, { at: [0, deck + 2.6, -0.3] }, 6))
  put(P.prism([[0, 0], [0.8, -0.18], [0, -0.36]], 0.03, PAL.hotpink, { at: [0.03, deck + 3.65, -0.3], rot: [0, Math.PI / 2, 0] }))
  // A life ring on the back of the wheelhouse, a rope coil and a crate on the back deck.
  put(P.torus(0.3, 0.08, '#FF8A3D', { at: [0, deck + 0.8, -0.8] }))
  put(P.torus(0.28, 0.07, '#E8D7A8', { at: [-0.45, deck + 0.05, -1.7], rot: [Math.PI / 2, 0, 0] }))
  put(P.rbox(0.7, 0.45, 0.55, 0.06, '#7FB6D9', { at: [0.4, deck + 0.22, -1.8] }))
  // Fenders hanging on the dock side.
  for (const fz of [-1.4, 0.2, 1.5]) put(P.capsule(0.15, 0.35, WHITE, { at: [1.15, 0.35, fz] }))
  return parts
}
