// The shoes drawer: light-up sneakers (white, a mint sole, a pink stripe and a light at the toe) and pink rain boots.
// Leg-local: each leg pivots at her hip (±0.072, 0.16, 0.03); the hoof below it is 0.13 wide and 0.18 long, from the
// floor to y 0.07, centered 0.015 out from the leg and 0.027 forward.
import type { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { P, type V3 } from '../../engine/geo'
import { group } from '../model-wear'

export function buildShoes(id: string, bag: Bag): [Group, Group] {
  const one = (s: number) => {
    const at: V3 = [s * 0.015, -0.118, 0.03]
    const lined = []
    const plain = []
    if (id === 'sneakers') {
      lined.push(P.rbox(0.158, 0.08, 0.215, 0.035, '#FFFFFF', { at }))
      lined.push(P.rbox(0.166, 0.026, 0.224, 0.012, '#8FE3C8', { at: [at[0], at[1] - 0.037, at[2]] }))
      plain.push(P.box(0.006, 0.026, 0.12, '#FF4F9A', { at: [at[0] + s * 0.08, at[1] + 0.005, at[2] - 0.01] }))
      plain.push(P.sphere(0.016, '#FBE27A', { at: [at[0], at[1] - 0.025, at[2] + 0.112], scale: [1.4, 0.7, 0.6] }))
    } else {
      lined.push(P.rbox(0.166, 0.085, 0.22, 0.038, '#FF8FB8', { at }))
      lined.push(P.cyl(0.076, 0.079, 0.11, '#FF8FB8', { at: [at[0], at[1] + 0.085, at[2] - 0.03] }, 18))
      lined.push(P.torus(0.077, 0.012, '#FFFFFF', { at: [at[0], at[1] + 0.14, at[2] - 0.03], rot: [Math.PI / 2, 0, 0] }))
    }
    return group(lined, plain, bag)!
  }
  return [one(-1), one(1)]
}
