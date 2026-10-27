// Each racer's kart dressed as its own (the look step; trip/vehicles/kart.ts builds the plain kart in their colors):
// - Kaylee's pink kart: a white heart on each side and a little pink pennant with a gold star flying off the back.
// - Grandma Taeng's old wooden kart (her husband built it long ago): planks along the sides with brass rivets, a woven
//   basket of rice sheaves on the back, and her pink parasol up over the seat, twirling as she goes.
// - Pao's orange post kart: a white envelope on each side, and a red postbox on the back stuffed with letters.
// - Moon's honey-yellow kart: honeycomb on the sides, two honey pots on the back and honey dripping down the nose.
// Everything sits on the kart's body (it leans and bounces with it); the parasol and the pennant flutter with speed.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { Kart } from '../../../trip/vehicles/kart'
import type { RacerId } from './rivals'

/** The kart's wheel radius (it sits this high: trip/vehicles/kart.ts), and the outside of its side panels. */
const R = 0.3
const SIDE = 0.6

export interface KartDress {
  /** `speed` 0..1 of top speed. */
  update(t: number, speed: number): void
}

/** A shape for each side panel (built facing +x at `z`, mirrored for the left). */
function bothSides(parts: BufferGeometry[], make: (s: 1 | -1) => BufferGeometry[]) {
  for (const s of [1, -1] as const) parts.push(...make(s))
}

export function dressKart(kart: Kart, who: RacerId, bag: Bag): KartDress {
  const parts: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  let flutter: Group | null = null
  let spin: Group | null = null
  if (who === 'kaylee') {
    // A white heart on each side, toward the front (Moon's honey-pot gift goes in the middle of the left side).
    bothSides(parts, (s) => [
      P.sphere(0.075, '#FFFFFF', { at: [s * SIDE, R + 0.24, 0.24], scale: [0.25, 1, 1] }, 12),
      P.sphere(0.075, '#FFFFFF', { at: [s * SIDE, R + 0.24, 0.36], scale: [0.25, 1, 1] }, 12),
      P.cone(0.12, 0.15, '#FFFFFF', { at: [s * SIDE, R + 0.15, 0.3], rot: [Math.PI, 0, 0], scale: [0.25, 1, 1] }, 12),
    ])
    // The pennant: a thin white pole off the back left, a pink triangle with a gold star.
    parts.push(P.cyl(0.018, 0.018, 1.1, '#FFFFFF', { at: [-0.3, R + 0.75, -1.05] }, 6))
    flutter = new Group()
    flutter.position.set(-0.3, R + 1.22, -1.05)
    flutter.add(solid(merge([P.prism([[0, 0.14], [0, -0.14], [-0.5, 0]], 0.02, PAL.hotpink, { rot: [0, -Math.PI / 2, 0] }), P.sphere(0.05, PAL.gold, { at: [0, 0, -0.16], scale: [0.4, 1, 1] }, 8)]), bag, 1.2))
    kart.body.add(flutter)
  } else if (who === 'taeng') {
    // Planks along the sides (darker seams) with brass rivets at the ends.
    bothSides(parts, (s) => [0.42, 0.55].map((y) => P.box(0.012, 0.018, 1.36, '#9C653E', { at: [s * (SIDE - 0.005), R + y - 0.16, -0.1] })))
    bothSides(plain, (s) => [-0.7, 0.5].flatMap((z) => [0.36, 0.48, 0.6].map((y) => P.sphere(0.022, PAL.gold, { at: [s * SIDE, R + y - 0.16, z] }, 6))))
    // The basket of rice sheaves on the back.
    parts.push(P.cyl(0.24, 0.2, 0.24, '#E2B66C', { at: [0, R + 0.47, -1.0] }, 14), P.torus(0.24, 0.025, '#C9954F', { at: [0, R + 0.59, -1.0], rot: [Math.PI / 2, 0, 0] }))
    for (const [x, z, a] of [[-0.09, -0.97, -0.25], [0.02, -1.04, 0], [0.11, -0.96, 0.25]] as const) {
      parts.push(P.cyl(0.012, 0.012, 0.42, '#8CC56A', { at: [x, R + 0.7, z], rot: [0, 0, a] }, 5))
      parts.push(P.sphere(0.07, '#F2D27A', { at: [x - Math.sin(a) * 0.22, R + 0.92, z], scale: [0.7, 1.4, 0.7] }, 8))
    }
    // Her parasol: a pole from behind the seat, a pink canopy with scalloped white edges and a gold tip.
    parts.push(P.cyl(0.02, 0.02, 1.7, '#9C653E', { at: [0.32, R + 1.05, -0.86], rot: [-0.08, 0, -0.05] }, 6))
    spin = new Group()
    spin.position.set(0.36, R + 1.92, -0.93)
    spin.rotation.set(-0.08, 0, -0.05)
    const canopy: BufferGeometry[] = [P.cone(0.78, 0.3, '#FF8FB8', { at: [0, 0, 0] }, 16), P.sphere(0.05, PAL.gold, { at: [0, 0.17, 0] }, 8)]
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2
      canopy.push(P.sphere(0.07, i % 2 ? '#FFFFFF' : '#FFD6E6', { at: [Math.cos(a) * 0.76, -0.16, Math.sin(a) * 0.76], scale: [1, 0.6, 1] }, 8))
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      canopy.push(P.cyl(0.01, 0.01, 0.8, '#FFFFFF', { at: [Math.cos(a) * 0.39, -0.01, Math.sin(a) * 0.39], rot: [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2] }, 4))
    }
    spin.add(solid(merge(canopy), bag, 1.5))
    kart.body.add(spin)
  } else if (who === 'pao') {
    // A white envelope on each side, its flap a pink "V".
    bothSides(parts, (s) => [P.rbox(0.03, 0.2, 0.32, 0.02, '#FFFFFF', { at: [s * SIDE, R + 0.22, -0.1] })])
    bothSides(plain, (s) => [P.prism([[-0.15, 0.09], [0.15, 0.09], [0, -0.02]], 0.01, '#FF6FAE', { at: [s * (SIDE + 0.018), R + 0.22, -0.1], rot: [0, s * Math.PI / 2, 0] })])
    // The red postbox on the back: a rounded box with a dome top, a dark slot and letters sticking out of the top.
    parts.push(P.rbox(0.46, 0.4, 0.34, 0.07, '#E8403F', { at: [0, R + 0.58, -1.0] }), P.cyl(0.23, 0.23, 0.34, '#E8403F', { at: [0, R + 0.78, -1.0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }, 16))
    parts.push(P.box(0.48, 0.05, 0.36, '#FFFFFF', { at: [0, R + 0.62, -1.0] }))
    plain.push(P.box(0.22, 0.03, 0.01, PAL.ink, { at: [0, R + 0.72, -0.83] }))
    for (const [x, a] of [[-0.1, -0.2], [0.04, 0.1], [0.13, 0.3]] as const) parts.push(P.box(0.16, 0.2, 0.012, a > 0 ? '#FFFFFF' : '#FFF1C8', { at: [x, R + 0.98, -1.02], rot: [0.2, 0, a] }))
  } else {
    // Honeycomb on the sides: three cream hexagons.
    bothSides(parts, (s) => [[-0.25, 0.48], [-0.04, 0.48], [-0.145, 0.33]].map(([z, y]) => P.cyl(0.1, 0.1, 0.02, '#FFF1B8', { at: [s * SIDE, R + y - 0.12, z], rot: [0, 0, Math.PI / 2] }, 6)))
    // Two honey pots on the back: round gold pots, brown lids, a honey dipper in one.
    for (const [x, k] of [[-0.15, 1], [0.17, 0.85]] as const) {
      parts.push(P.sphere(0.17 * k, '#F2A93B', { at: [x, R + 0.55 + 0.14 * k, -1.0], scale: [1, 0.95, 1] }, 14))
      parts.push(P.cyl(0.12 * k, 0.12 * k, 0.05, '#8A5A3C', { at: [x, R + 0.55 + 0.29 * k, -1.0] }, 12))
      parts.push(P.cyl(0.13 * k, 0.13 * k, 0.04, '#FFF1B8', { at: [x, R + 0.55 + 0.25 * k, -1.0] }, 12))
    }
    parts.push(P.cyl(0.015, 0.015, 0.36, '#C98A55', { at: [-0.12, R + 1.0, -1.0], rot: [0, 0, -0.3] }, 5), P.sphere(0.05, '#C98A55', { at: [-0.06, R + 1.16, -1.0], scale: [1, 1.3, 1] }, 8))
    // Honey dripping down the nose.
    parts.push(P.box(0.36, 0.035, 0.3, '#F2A93B', { at: [0, R + 0.35, 0.92], rot: [-0.25, 0, 0] }))
    for (const [x, d] of [[-0.12, 0.12], [0.02, 0.18], [0.14, 0.1]] as const) parts.push(P.capsule(0.03, d, '#F2A93B', { at: [x, R + 0.3 - d / 2, 1.07], rot: [0.25, 0, 0] }))
  }
  kart.body.add(solidMix(parts, plain, bag, 1.5))
  return {
    update(t, speed) {
      if (flutter) flutter.rotation.y = Math.sin(t * (5 + speed * 14)) * (0.15 + speed * 0.3) - speed * 0.25
      if (spin) spin.rotation.y = t * (0.6 + speed * 3)
    },
  }
}
