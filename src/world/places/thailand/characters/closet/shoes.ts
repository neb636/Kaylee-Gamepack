// The shoes drawer, on her hooves. Leg-local: each leg pivots at her hip (±0.072, 0.16, 0.03); the hoof below it is
// 0.13 wide and 0.18 long, from the floor (y -0.16) to y 0.07, centered 0.015 out from the leg and 0.027 forward.
//
// Light-up sneakers (white, a mint sole, a pink stripe, lights that blink as she walks: `userData.blink`, avatar.ts's
// Dress), sparkly lavender party shoes with a strap and a bow, pink rain boots, and mint sandals with a flower.
import type { BufferGeometry, Group } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { P, type V3 } from '../../../../engine3d/geo'
import { group } from '../model-wear'

type Parts = BufferGeometry[]

export function buildShoes(id: string, bag: Bag): [Group, Group] {
  const one = (s: number) => {
    const at: V3 = [s * 0.015, -0.118, 0.03]
    const [x, y, z] = at
    const lined: Parts = []
    const plain: Parts = []
    let lights: Parts = []
    if (id === 'sneakers') {
      lined.push(P.rbox(0.158, 0.08, 0.215, 0.035, '#FFFFFF', { at }))
      lined.push(P.rbox(0.166, 0.026, 0.224, 0.012, '#8FE3C8', { at: [x, y - 0.037, z] }))
      plain.push(P.box(0.006, 0.026, 0.12, '#FF4F9A', { at: [x + s * 0.08, y + 0.005, z - 0.01] }))
      for (const dz of [-0.05, 0.03]) plain.push(P.capsule(0.006, 0.06, '#FF8FB8', { at: [x, y + 0.04, z + dz], rot: [0, 0, Math.PI / 2] }))
      // The lights in the sole: one at the toe, two down each side.
      lights = [P.sphere(0.017, '#FFF07A', { at: [x, y - 0.035, z + 0.114], scale: [1.5, 0.7, 0.6] })]
      for (const [dz, c] of [[0.04, '#7FE7FF'], [-0.04, '#FF8FD0']] as const) lights.push(P.sphere(0.012, c, { at: [x + s * 0.083, y - 0.036, z + dz], scale: [0.5, 0.8, 1.6] }))
    } else if (id === 'party') {
      // Low and round, a strap over the top with a gold button, a pink bow on the toe, glitter.
      lined.push(P.rbox(0.152, 0.055, 0.205, 0.026, '#C9B5F7', { at: [x, y - 0.012, z] }))
      lined.push(P.rbox(0.158, 0.014, 0.21, 0.007, '#9C86DA', { at: [x, y - 0.04, z] }))
      lined.push(P.torus(0.07, 0.009, '#C9B5F7', { at: [x, y + 0.02, z - 0.01], rot: [0, Math.PI / 2, 0], scale: [1, 0.55, 1] }, Math.PI))
      plain.push(P.sphere(0.011, '#FFC83D', { at: [x + s * 0.07, y + 0.02, z - 0.01] }, 8))
      for (const t of [-1, 1]) lined.push(P.sphere(0.02, '#FF6FAE', { at: [x + t * 0.022, y + 0.02, z + 0.085], rot: [0, 0, t * 0.3], scale: [1.2, 0.8, 0.6] }, 10))
      for (const [dx, dy, dz] of [[0.05, 0.01, 0.05], [-0.04, 0.0, 0.07], [0.06, -0.01, -0.04], [-0.06, 0.01, -0.02], [0.0, 0.016, -0.07]]) plain.push(P.sphere(0.007, '#FFFFFF', { at: [x + dx * s, y + dy, z + dz] }, 6))
    } else if (id === 'sandals') {
      // A mint sole under her hoof, two pink straps across it and a flower on the front one.
      lined.push(P.rbox(0.168, 0.024, 0.228, 0.01, '#8FE3C8', { at: [x, y - 0.033, z] }))
      for (const dz of [0.055, -0.03]) lined.push(P.torus(0.07, 0.012, '#FF8FB8', { at: [x, y - 0.02, z + dz], rot: [0, Math.PI / 2, 0], scale: [1, 0.72, 1] }, Math.PI))
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        plain.push(P.sphere(0.012, '#FFFFFF', { at: [x + Math.cos(a) * 0.012, y + 0.03 + Math.sin(a) * 0.012, z + 0.06] }, 8))
      }
      plain.push(P.sphere(0.008, '#FFC83D', { at: [x, y + 0.03, z + 0.068] }, 8))
    } else {
      // Pink rain boots up her legs, a white rim and white dots.
      lined.push(P.rbox(0.166, 0.085, 0.22, 0.038, '#FF8FB8', { at }))
      lined.push(P.cyl(0.076, 0.079, 0.11, '#FF8FB8', { at: [x, y + 0.085, z - 0.03] }, 18))
      lined.push(P.torus(0.077, 0.012, '#FFFFFF', { at: [x, y + 0.14, z - 0.03], rot: [Math.PI / 2, 0, 0] }))
      for (const [a, dy] of [[0.4, 0.07], [-0.5, 0.1], [1.4, 0.05], [2.6, 0.09], [-1.9, 0.06]]) plain.push(P.sphere(0.011, '#FFFFFF', { at: [x + Math.sin(a) * 0.079, y + dy, z - 0.03 + Math.cos(a) * 0.079] }, 8))
    }
    const shoe = group(lined, plain, bag)!
    if (lights.length) {
      const lit = group([], lights, bag)!
      lit.userData.blink = true
      shoe.add(lit)
    }
    return shoe
  }
  return [one(-1), one(1)]
}
