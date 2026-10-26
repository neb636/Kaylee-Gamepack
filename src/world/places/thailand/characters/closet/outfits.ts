// The outfits drawer, over her striped dress (which is always under: the paint changes its color). Body-local: her
// dress is centered at z 0.045; its skirt flares out to 0.161 wide and 0.139 deep at the hem (y 0.17..0.22), the waist
// narrows to 0.137 at y 0.29, the shoulders are at 0.46. Arm-local and leg-local parts ride on her arms and legs
// (model-wear.ts's `along`, `onArm`).
//
// A tutu (two tiers of lavender and pink frills), a princess gown down to the floor with puffy sleeves, denim overalls
// with a heart on the bib, and a chut thai: what Thai kids wear for a school festival, a long purple pha sin skirt with
// gold bands and a sash (sabai) over one shoulder.
import type { BufferGeometry } from 'three'
import type { Worn } from '../animal'
import type { Bag } from '../../engine/dispose'
import { P } from '../../engine/geo'
import { group, onArm, onTunic, shell, sleeve, tunic, ZC } from '../model-wear'
import { heart, star } from './fit'

type Parts = BufferGeometry[]
const sides = [['L', -1], ['R', 1]] as const

export function buildOutfit(id: string, bag: Bag, armTilt: number): Partial<Worn> {
  const body: Parts = []
  const plain: Parts = []
  const arm: Record<'L' | 'R', Parts> = { L: [], R: [] }
  const leg: Record<'L' | 'R', Parts> = { L: [], R: [] }
  if (id === 'tutu') {
    // Two tiers of frills round her waist, tipped down and out, and a butter waistband with little gems.
    for (const [n, r, y, size, tilt, colors] of [
      [18, 0.2, 0.225, 0.062, 0.42, ['#FFC2DD', '#D9CCFF']],
      [14, 0.165, 0.255, 0.056, 0.3, ['#E9DEFF', '#FFD9EA']],
    ] as const) {
      for (let i = 0; i < n; i++) {
        const a = ((i + (n === 14 ? 0.5 : 0)) / n) * Math.PI * 2
        const petal = P.sphere(size, colors[i % 2], { scale: [1.15, 0.42, 1] }, 12)
        petal.rotateX(tilt)
        petal.rotateY(a)
        petal.translate(Math.sin(a) * r, y, ZC + Math.cos(a) * r * 0.86)
        body.push(petal)
      }
    }
    body.push(P.cyl(0.146, 0.152, 0.04, '#FBEA9A', { at: [0, 0.285, ZC], scale: [1, 1, 0.9] }, 24))
    for (let i = 0; i < 7; i++) {
      const x = (i - 3) * 0.035
      plain.push(P.sphere(0.008, i % 2 ? '#8FE3C8' : '#FF6FAE', { at: [x, 0.287, onTunic(x, 0.287) + 0.01] }, 8))
    }
  } else if (id === 'gown') {
    // Butter yellow to the floor, a pink sash with a bow at the back, mint buttons, pink scallops round the hem and puffy
    // sleeves.
    body.push(
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
    )
    body.push(P.torus(0.15, 0.014, '#FF8FB8', { at: [0, 0.3, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] }))
    for (const s of [-1, 1]) body.push(P.sphere(0.04, '#FF8FB8', { at: [s * 0.045, 0.305, ZC - 0.13], rot: [0, 0, s * 0.3], scale: [1.2, 0.7, 0.5] }, 12))
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2
      plain.push(P.sphere(0.022, '#FFB8D6', { at: [Math.sin(a) * 0.262, 0.02, ZC + Math.cos(a) * 0.242], scale: [1, 0.7, 1] }, 10))
    }
    plain.push(...[0.38, 0.33].map((y) => P.sphere(0.012, '#8FE3C8', { at: [0, y, onTunic(0, y) + 0.004] })))
    for (const [side, s] of sides) arm[side].push(P.sphere(0.06, '#FBEA9A', { at: [s * 0.022, -0.012, 0], scale: [1, 0.9, 1] }, 16))
  } else if (id === 'overalls') {
    // Denim overalls: a short skirt over her dress, a bib with a pink heart, straps over her shoulders with butter
    // buttons, a pocket, and shorts cuffs round her legs.
    const DENIM = '#7FB2EE'
    const DARK = '#5E93D8'
    body.push(shell([[0.2, 0, 0], [0.2, 0.18, 0.16], [0.24, 0.165, 0.143], [0.3, 0.141, 0.124], [0.305, 0, 0]], DENIM))
    body.push(P.rbox(0.14, 0.11, 0.018, 0.016, DENIM, { at: [0, 0.36, onTunic(0, 0.36) + 0.006], rot: [-0.28, 0, 0] }))
    body.push(P.prism(heart(0.03), 0.008, '#FF8FB8', { at: [0, 0.37, onTunic(0, 0.37) + 0.018], rot: [-0.28, 0, 0] }))
    for (const s of [-1, 1]) {
      body.push(P.capsule(0.012, 0.07, DARK, { at: [s * 0.055, 0.44, 0.11], rot: [-0.9, 0, -s * 0.25] }))
      body.push(P.capsule(0.012, 0.16, DARK, { at: [s * 0.055, 0.36, -0.09], rot: [0.35, 0, s * 0.2] }))
      plain.push(P.sphere(0.012, '#FBE27A', { at: [s * 0.05, 0.405, onTunic(s * 0.05, 0.405) + 0.012] }, 8))
    }
    body.push(P.rbox(0.07, 0.05, 0.01, 0.01, DARK, { at: [0.06, 0.245, onTunic(0.06, 0.245) + 0.01], rot: [-0.3, 0.35, 0] }))
    for (const [side, s] of sides) leg[side].push(P.cyl(0.062, 0.068, 0.07, DENIM, { at: [s * -0.003, -0.01, 0.012], scale: [1, 1, 1.08] }))
  } else {
    // Chut thai: a cream-gold top, a long magenta pha sin with gold bands, a gold belt with a round buckle, and a pink
    // sabai sash from her left shoulder across to her right hip.
    const SKIRT = '#B44FC8'
    const GOLD = '#FFC83D'
    body.push(tunic(0.29, '#FFEFC2'))
    body.push(shell([[0.035, 0, 0], [0.035, 0.172, 0.152], [0.1, 0.17, 0.15], [0.19, 0.168, 0.148], [0.24, 0.16, 0.14], [0.3, 0.142, 0.124], [0.305, 0, 0]], SKIRT))
    for (const y of [0.055, 0.09]) body.push(P.torus(0.171, 0.007, GOLD, { at: [0, y, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.88, 1] }))
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2
      plain.push(P.sphere(0.01, GOLD, { at: [Math.sin(a) * 0.173, 0.0725, ZC + Math.cos(a) * 0.153], scale: [1, 1.4, 1] }, 6))
    }
    body.push(P.torus(0.144, 0.013, GOLD, { at: [0, 0.3, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.88, 1] }))
    body.push(P.cyl(0.026, 0.026, 0.012, GOLD, { at: [0, 0.3, onTunic(0, 0.3) + 0.012], rot: [Math.PI / 2 - 0.25, 0, 0] }, 16))
    plain.push(P.sphere(0.011, '#FF4F9A', { at: [0, 0.3, onTunic(0, 0.3) + 0.02] }, 8))
    // The sash: down the front from her left shoulder to her right hip, and down the back the same way.
    for (const front of [true, false]) {
      for (let i = 0; i < 6; i++) {
        const k = i / 5
        const x = 0.085 - 0.175 * k
        const y = 0.45 - 0.15 * k
        const z = front ? onTunic(x, y) + 0.006 : ZC - (onTunic(x, y) - ZC) * 0.92 - 0.006
        body.push(P.sphere(0.03, '#FF6FAE', { at: [x, y, z], rot: [0, 0, 0.62], scale: [1.3, 0.75, 0.45] }, 10))
      }
    }
    plain.push(P.prism(star(0.014), 0.006, GOLD, { at: [0.04, 0.4, onTunic(0.04, 0.4) + 0.02], rot: [-0.3, 0, 0] }))
    for (const [side, s] of sides) arm[side].push(sleeve(s, '#FFEFC2'))
  }
  return {
    body: group(body, plain, bag),
    armL: onArm(group(arm.L, [], bag), -1, armTilt),
    armR: onArm(group(arm.R, [], bag), 1, armTilt),
    legL: group(leg.L, [], bag),
    legR: group(leg.R, [], bag),
  }
}

