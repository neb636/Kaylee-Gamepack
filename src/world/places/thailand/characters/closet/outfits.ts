// The outfits drawer: a tutu round her waist (puffs of lavender and pink over her dress's skirt) and a princess gown
// down to the floor (butter yellow, a pink sash). Body-local: her dress is centered at z 0.045; its skirt flares out to
// 0.161 wide and 0.139 deep at the hem (y 0.17..0.22), the waist narrows to 0.137 at y 0.29.
import type { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { P } from '../../engine/geo'
import { group, shell, ZC } from '../model-wear'

export function buildOutfit(id: string, bag: Bag): Group {
  if (id === 'tutu') {
    const lined = []
    const n = 14
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      lined.push(P.sphere(0.06, i % 2 ? '#FFC2DD' : '#D9CCFF', { at: [Math.sin(a) * 0.19, 0.235, ZC + Math.cos(a) * 0.165], rot: [0, a, 0], scale: [1.2, 0.55, 0.9] }, 12))
    }
    lined.push(P.cyl(0.15, 0.2, 0.05, '#E9DEFF', { at: [0, 0.26, ZC], scale: [1, 1, 0.88] }, 24))
    return group(lined, [], bag)!
  }
  const lined = [
    shell(
      [
        [0.01, 0, 0],
        [0.01, 0.265, 0.245],
        [0.08, 0.25, 0.23],
        [0.16, 0.215, 0.195],
        [0.22, 0.175, 0.158],
        [0.27, 0.152, 0.137],
        [0.32, 0.128, 0.116],
        [0.4, 0.12, 0.098],
        [0.45, 0.114, 0.075],
        [0.468, 0.072, 0.047],
        [0.472, 0, 0],
      ],
      '#FBEA9A',
    ),
    P.torus(0.15, 0.014, '#FF8FB8', { at: [0, 0.3, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] }),
  ]
  const plain = [0.38, 0.33].map((y) => P.sphere(0.012, '#8FE3C8', { at: [0, y, ZC + (y > 0.35 ? 0.104 : 0.122)] }))
  return group(lined, plain, bag)!
}
