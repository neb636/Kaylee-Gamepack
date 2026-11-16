// Koh Samet's boats, built from code in the toon look and lofted through real hull sections (engine3d/geo.ts loft):
//
//   longtail()   the Thai longtail: a long, narrow planked hull whose prow sweeps up high and is tied with ribbons and a
//                flower garland, a raised stern deck with the car engine on its pivot and the long shaft out to the
//                propeller, a canopy with a scalloped fringe, benches across and tyres hung on the sides as fenders.
//                The snorkel boat (blue and white) at Ao Wong Duan and out at the reef, and the wooden ones offshore.
//   speedboat()  a white speedboat: a deep V hull with a sharp bow, a blue stripe, a console with its windscreen, a
//                sun roof on poles and two outboard motors.
//
// Both face +z (the bow) with the waterline at y = 0, and return parts to merge. Deck heights are kept: the snorkel
// game stands the captain on the longtail's floor at DECK_Y (0.55) about 3 m toward the bow (snorkel/reef.ts).
import type { BufferGeometry } from 'three'
import { loft, P, type LoftRing } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'

export interface LongtailColors {
  /** Below the waterline and the lower planks, the pinstripe, the upper planks. */
  bottom: string
  side: string
  stripe: string
  upper: string
  canopy: string
  /** The fringe along the canopy's edge (alternates with white). */
  fringe: string
}
export const SNORKEL_BOAT: LongtailColors = { bottom: '#2F6FB8', side: '#3F8FE8', stripe: '#F0596B', upper: '#FFFFFF', canopy: '#5FC4E0', fringe: PAL.hotpink }
export const WOOD_BOAT: LongtailColors = { bottom: '#7A5236', side: '#9A6B44', stripe: '#4FA3C9', upper: '#B98A5E', canopy: '#F6EEDD', fringe: '#F0596B' }

const WOOD = '#B07A4A'
const PLANKS = '#C99A66'
const INSIDE = '#F4EAD8'
const DARK = '#3A3140'
const STEEL = '#C8CCD2'

/** One section of an open boat: up the right side over the gunwale, down inside to the floor, across, and back down the
 *  left. `w` half-width, `k` keel, `g` gunwale, `f` floor (all m). */
function openRing(z: number, w: number, k: number, g: number, f: number): LoftRing {
  const t = Math.min(0.09, w * 0.3)
  const h = g - k
  const right: [number, number][] = [
    [w * 0.78, k + h * 0.2],
    [w * 0.95, k + h * 0.48],
    [w * 0.97, k + h * 0.6],
    [w, g - 0.1],
    [w, g],
    [w - t, g],
    [w - t * 1.1, f],
  ]
  const left = [...right].reverse().map(([x, y]) => [-x, y] as [number, number])
  return { z, pts: [[0, k], ...right, ...left] }
}

/** The bands of `openRing`, keel round to keel. */
const openBands = (c: { bottom: string; side: string; stripe: string; upper: string }) => {
  const half = [c.bottom, c.side, c.stripe, c.upper, WOOD, WOOD, INSIDE]
  return [...half, PLANKS, ...[...half].reverse()]
}

/** A Thai longtail, `len` m long, `w` m wide (the snorkel boat is 8.4 x 1.84). */
export function longtail(c: LongtailColors, len = 8.4, w = 1.84, canopy = true): BufferGeometry[] {
  const sx = w / 1.84
  const sz = len / 8.4
  const Z = (z: number) => z * sz
  const W = (x: number) => x * sx
  const rings = [
    // The stern: a raised deck for the driver and the engine, then the open middle, a little foredeck, the prow.
    openRing(Z(-4.1), W(0.7), 0.12, 0.92, 0.9),
    openRing(Z(-3.7), W(0.82), -0.12, 0.88, 0.86),
    openRing(Z(-3.25), W(0.88), -0.22, 0.86, 0.84),
    openRing(Z(-3.2), W(0.89), -0.23, 0.86, 0.55),
    openRing(Z(-1.5), W(0.92), -0.3, 0.84, 0.55),
    openRing(Z(1.2), W(0.92), -0.3, 0.86, 0.55),
    openRing(Z(2.6), W(0.82), -0.22, 0.94, 0.55),
    openRing(Z(3.25), W(0.64), -0.08, 1.04, 0.56),
    openRing(Z(3.3), W(0.62), -0.06, 1.05, 1.0),
    openRing(Z(3.75), W(0.36), 0.2, 1.3, 1.26),
    openRing(Z(4.05), W(0.16), 0.62, 1.66, 1.62),
    openRing(Z(4.2), W(0.04), 1.3, 2.05, 2.02),
  ]
  const tip: [number, number, number] = [0, 2.1, Z(4.22)]
  const parts: BufferGeometry[] = [loft(rings, openBands(c))]
  // The prow's ribbons (pink, yellow, green, like the real ones) and a flower garland round its neck.
  const rib = [PAL.hotpink, PAL.gold, '#6FCF8A', PAL.pink, '#9FD5FF']
  rib.forEach((col, i) => {
    const a = -0.5 + i * 0.25
    parts.push(P.box(0.05, 0.62, 0.02, col, { at: [tip[0] + Math.sin(a) * 0.08, tip[1] - 0.3, tip[2] + 0.02 + Math.cos(a) * 0.02], rot: [0.15, 0, a * 0.5] }))
  })
  parts.push(P.torus(0.1, 0.03, PAL.hotpink, { at: [0, 1.82, Z(4.12)], rot: [Math.PI / 2 - 0.5, 0, 0] }))
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2
    parts.push(P.sphere(0.04, i % 2 ? '#FFFFFF' : PAL.gold, { at: [Math.cos(a) * 0.1, 1.82 + Math.sin(a) * 0.06, Z(4.12) + Math.sin(a) * 0.1] }, 6))
  }
  // Benches across the middle.
  for (const z of [-2.2, -0.6, 1.0]) parts.push(P.rbox(W(1.62), 0.07, 0.34, 0.03, WOOD, { at: [0, 0.82, Z(z)] }))
  // Tyres hung on the sides as fenders.
  for (const sd of [-1, 1]) for (const z of [-1.6, 0.4]) parts.push(P.torus(0.16, 0.06, DARK, { at: [sd * W(0.97), 0.5, Z(z)], rot: [0, Math.PI / 2, 0] }))
  // The long-tail engine on its pivot at the stern: the motor, its exhaust, the shaft reaching back into the water with
  // the propeller, and the tiller pole forward for the driver.
  const ez = Z(-3.75)
  parts.push(
    P.cyl(0.07, 0.09, 0.22, DARK, { at: [0, 1.02, ez] }, 8),
    P.rbox(0.5, 0.42, 0.6, 0.08, '#E8475C', { at: [0, 1.32, ez] }),
    P.rbox(0.52, 0.12, 0.62, 0.05, STEEL, { at: [0, 1.58, ez] }),
    P.cyl(0.05, 0.05, 0.4, '#8A8A92', { at: [0.18, 1.72, ez - 0.1] }, 6),
    P.cyl(0.05, 0.05, 2.8, '#8A8A92', { at: [0, 0.65, ez - 1.6], rot: [-1.2, 0, 0] }, 8),
    ...[0, 1, 2].map((k) => P.rbox(0.07, 0.36, 0.05, 0.02, STEEL, { at: [0, 0.15, ez - 2.92], rot: [0, (k * Math.PI) / 3, 0.4] })),
    P.cyl(0.035, 0.035, 1.4, DARK, { at: [0, 1.35, ez + 0.8], rot: [1.25, 0, 0] }, 6),
  )
  if (canopy) {
    // The canopy on six posts, with its scalloped fringe.
    const cw = W(1.62)
    const cl = Z(4.6)
    const cz = Z(-0.4)
    const cy = 2.25
    parts.push(P.rbox(cw, 0.08, cl, 0.04, c.canopy, { at: [0, cy, cz] }))
    for (const sd of [-1, 1]) for (const z of [-2.4, -0.4, 1.6]) parts.push(P.cyl(0.035, 0.035, cy - 0.85, '#E9E3D8', { at: [sd * (cw / 2 - 0.08), (cy + 0.85) / 2, Z(z)] }, 5))
    const n = Math.round(cl / 0.3)
    for (let i = 0; i <= n; i++) for (const sd of [-1, 1]) parts.push(P.sphere(0.08, i % 2 ? '#FFFFFF' : c.fringe, { at: [sd * cw / 2, cy - 0.06, cz - cl / 2 + (cl * i) / n], scale: [0.5, 1, 1] }, 6))
    const m = Math.round(cw / 0.3)
    for (let i = 0; i <= m; i++) for (const sd of [-1, 1]) parts.push(P.sphere(0.08, i % 2 ? '#FFFFFF' : c.fringe, { at: [-cw / 2 + (cw * i) / m, cy - 0.06, cz + (sd * cl) / 2], scale: [1, 1, 0.5] }, 6))
  }
  return parts
}

/** A white speedboat, about 6.6 m long and 2.1 m wide. */
export function speedboat(stripe = '#3F8FE8'): BufferGeometry[] {
  // Closed deck sections: keel, chine, the stripe, the gunwale, the deck's crown.
  const ring = (z: number, w: number, k: number, g: number): LoftRing => {
    const h = g - k
    const right: [number, number][] = [
      [w * 0.88, k + h * 0.2],
      [w * 0.97, k + h * 0.5],
      [w, k + h * 0.66],
      [w, g],
      [w * 0.85, g + 0.06],
    ]
    return { z, pts: [[0, k], ...right, [0, g + 0.1], ...[...right].reverse().map(([x, y]) => [-x, y] as [number, number])] }
  }
  const half = ['#E8E4EE', '#FFFFFF', stripe, '#FFFFFF', '#F6F3FA', '#F6F3FA']
  const bands = [...half, ...[...half].reverse()]
  const parts: BufferGeometry[] = [
    loft([ring(-3.2, 0.98, -0.12, 0.62), ring(-2.4, 1.04, -0.26, 0.66), ring(0.4, 1.05, -0.3, 0.7), ring(1.9, 0.86, -0.18, 0.78), ring(2.9, 0.48, 0.08, 0.86), ring(3.35, 0.06, 0.42, 0.9)], bands),
    // The console and its windscreen, the seat behind it, the sun roof on four poles.
    P.rbox(0.9, 0.8, 0.7, 0.12, '#F6F3FA', { at: [0, 1.1, 0.5] }),
    P.rbox(0.95, 0.42, 0.06, 0.03, '#9FD5F2', { at: [0, 1.62, 0.78], rot: [-0.45, 0, 0] }),
    P.cyl(0.08, 0.08, 0.06, DARK, { at: [0, 1.52, 0.38], rot: [-0.6, 0, 0] }, 10),
    P.rbox(1.5, 0.22, 0.6, 0.08, stripe, { at: [0, 0.92, -0.6] }),
    P.rbox(1.5, 0.5, 0.16, 0.06, stripe, { at: [0, 1.15, -0.95] }),
    P.rbox(1.8, 0.08, 2.4, 0.04, stripe, { at: [0, 2.3, -0.3] }),
    ...[-1, 1].flatMap((sd) => [-1.4, 0.8].map((z) => P.cyl(0.03, 0.03, 1.6, STEEL, { at: [sd * 0.82, 1.5, z] }, 6))),
    // The bow rail.
    ...[-1, 1].map((sd) => P.cyl(0.025, 0.025, 1.6, STEEL, { at: [sd * 0.45, 1.0, 2.55], rot: [Math.PI / 2, 0, sd * 0.25] }, 5)),
    // Two outboard motors on the transom.
    ...[-0.45, 0.45].flatMap((x) => [
      P.rbox(0.36, 0.55, 0.48, 0.12, '#FFFFFF', { at: [x, 1.0, -3.42] }),
      P.rbox(0.38, 0.1, 0.5, 0.04, DARK, { at: [x, 0.74, -3.42] }),
      P.box(0.12, 0.7, 0.2, DARK, { at: [x, 0.35, -3.45] }),
    ]),
  ]
  return parts
}
