// The glasses drawer: her heart sunglasses (the ones from packing: animal.ts's recipe on her face), gold star
// sunglasses, and round lavender glasses like Agong's. On her face: a sphere of 0.24 around (0, 0.148, -0.02), her
// eyes 0.109 out to each side (model-wear.ts's FACE).
import { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { P, type V3 } from '../../engine/geo'
import { buildWorn } from '../animal'
import { LOOKS } from '../looks'
import { FACE, group, PX } from '../model-wear'
import { star } from './fit'

const R = FACE.R
const EYE = FACE.eyeX

export function buildFace(id: string, bag: Bag): Group {
  if (id === 'hearts') return buildWorn(LOOKS.kaylee, 'sunglasses', bag, FACE, PX).head!
  const lift = 0.13 * R
  const lined = []
  const plain = []
  for (const s of [-1, 1]) {
    const x = s * EYE
    const rot = FACE.turnTo(x)
    if (id === 'stars') {
      lined.push(P.prism(star(0.07), 0.014, '#FFC83D', { at: FACE.on(x, 0.005, lift), rot }))
      lined.push(P.prism(star(0.052), 0.016, '#5A3F66', { at: FACE.on(x, 0.005, lift + 0.004), rot }))
      plain.push(P.sphere(0.012, '#FFFFFF', { at: FACE.on(x - s * 0.018, 0.022, lift + 0.014), rot, scale: [1, 1, 0.3] }))
    } else {
      lined.push(P.torus(0.055, 0.009, '#9C86DA', { at: FACE.on(x, 0, lift), rot }, Math.PI * 2))
    }
  }
  const bridge: V3 = FACE.on(0, id === 'stars' ? 0.03 : 0.02, lift + 0.01)
  lined.push(P.capsule(0.008, EYE * 2 - 0.13, id === 'stars' ? '#FFC83D' : '#9C86DA', { at: bridge, rot: [0, 0, Math.PI / 2] }))
  return group(lined, plain, bag)!
}
