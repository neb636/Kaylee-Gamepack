// Halloween's dress-up box, fitted to the same model measurements as the everyday closet. These are clothes over
// Kaylee, never masks over her whole face: her eyes, horn, ears and expression remain visible. All geometry belongs
// to the scene's Bag and is built lazily when a drawer opens or she puts something on.
import { Box3, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import type { Worn } from '../../../../engine3d/characters/animal'
import { bake, P } from '../../../../engine3d/geo'
import { group, onArm, onTunic, shell, sleeve, tunic, ZC } from '../model-wear'
import { brim, facing, heart, star } from './fit'
import { buildHat } from './hats'
import { buildOutfit } from './outfits'

type Parts = BufferGeometry[]
const INK = '#514263'
const CREAM = '#FFF7EC'
const PURPLE = '#9670C7'
const GOLD = '#FBE27A'

function hat(id: string, bag: Bag) {
  const lined: Parts = []
  const plain: Parts = []
  if (id === 'halloween-witch-hat') {
    // A tiny tilted witch hat on the side of her hair, clear of the horn (head-local top < 0.56 m).
    lined.push(brim(0.06, 0.19, PURPLE, { depth: 0.84, curl: 0.025 }))
    lined[0].translate(-0.18, 0.34, -0.06)
    lined.push(P.cone(0.105, 0.19, PURPLE, { at: [-0.18, 0.435, -0.06], rot: [0, 0, 0.2] }, 20))
    plain.push(P.torus(0.09, 0.018, '#FFB56C', { at: [-0.18, 0.37, -0.06], rot: [Math.PI / 2, 0, 0] }))
    plain.push(P.prism(star(0.027), 0.008, GOLD, { at: [-0.18, 0.395, 0.026] }))
  } else if (id === 'halloween-leaf') {
    lined.push(P.sphere(0.15, '#FFAB67', { at: [-0.17, 0.34, -0.02], scale: [1, 0.32, 0.85] }, 20))
    lined.push(P.capsule(0.022, 0.065, '#A7CA83', { at: [-0.17, 0.405, -0.02], rot: [0, 0, -0.3] }))
    lined.push(P.sphere(0.065, '#9DD58F', { at: [-0.1, 0.42, -0.015], rot: [0, 0, -0.4], scale: [1.3, 0.35, 0.75] }, 16))
  } else {
    // Skye's pink aviator helmet, with puppy ears and goggles resting on her forehead. Her horn stays clear.
    lined.push(bake(new SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), '#FF8FB8', { at: [0, 0.32, -0.03], scale: [0.30, 0.18, 0.32] }))
    for (const side of [-1, 1]) {
      lined.push(P.capsule(0.065, 0.14, '#BD855C', { at: [side * 0.32, 0.23, -0.02], rot: [0, 0, side * 0.12], scale: [0.8, 1, 0.55] }))
      lined.push(P.torus(0.065, 0.014, '#FBE27A', { at: [side * 0.10, 0.345, 0.28], scale: [1.2, 0.7, 1] }))
      plain.push(P.sphere(0.055, '#CBEAFF', { at: [side * 0.10, 0.345, 0.28], scale: [1.25, 0.7, 0.12] }, 16))
    }
    lined.push(P.capsule(0.012, 0.06, '#FBE27A', { at: [0, 0.345, 0.29], rot: [0, 0, Math.PI / 2] }))
  }
  return group(lined, plain, bag)
}

function outfit(id: string, bag: Bag, armTilt: number): Partial<Worn> {
  const body: Parts = [], details: Parts = []
  const arms: Record<'L' | 'R', Parts> = { L: [], R: [] }
  const legs: Record<'L' | 'R', Parts> = { L: [], R: [] }
  const color = id === 'halloween-witch' ? PURPLE : id === 'halloween-pumpkin' ? '#FFAB67' : id === 'halloween-ghost' ? CREAM : '#FF8FB8'
  // Covers her existing striped dress, with a little room for it at the hips.
  body.push(tunic(0.18, color))
  body.push(shell([[0.12, 0, 0], [0.12, 0.19, 0.17], [0.2, 0.185, 0.165], [0.29, 0.15, 0.136], [0.31, 0, 0]], color))
  for (const [side, sign] of [['L', -1], ['R', 1]] as const) {
    arms[side].push(sleeve(sign, color))
  }
  const badge = (shape: [number, number][], c: string, x = 0, y = 0.36) => details.push(facing(P.prism(shape, 0.009, c), new Vector3(x, y, (y < 0.3 ? ZC + 0.17 * Math.sqrt(Math.max(0, 1 - (x / 0.19) ** 2)) : onTunic(x, y)) + 0.017), new Vector3(x * 2, 0.3, 1)))
  if (id === 'halloween-witch') {
    body.push(P.torus(0.15, 0.015, '#FFB56C', { at: [0, 0.3, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] }))
    badge(star(0.035), GOLD)
    for (const [x, y] of [[-0.07, 0.22], [0.07, 0.24], [0, 0.18]]) badge(star(0.022), GOLD, x, y)
  } else if (id === 'halloween-pumpkin') {
    for (const x of [-0.08, 0, 0.08]) body.push(P.sphere(0.12, x ? '#FFAB67' : '#FFBE83', { at: [x, 0.27, ZC], scale: [0.85, 1.1, 1.35] }, 20))
    for (const s of [-1, 1]) details.push(P.sphere(0.018, INK, { at: [s * 0.052, 0.3, 0.217], scale: [1, 1.2, 0.35] }, 10))
    details.push(P.torus(0.04, 0.009, INK, { at: [0, 0.27, 0.22], rot: [0, 0, Math.PI] }, Math.PI))
    for (const s of [-1, 1]) body.push(P.sphere(0.06, '#9DD58F', { at: [s * 0.055, 0.435, ZC + 0.055], rot: [0, 0, s * 0.4], scale: [1, 0.2, 1.4] }))
  } else if (id === 'halloween-ghost') {
    for (const s of [-1, 1]) details.push(P.sphere(0.02, INK, { at: [s * 0.043, 0.355, onTunic(s * 0.043, 0.355) + 0.014], scale: [1, 1.3, 0.4] }, 10))
    details.push(P.torus(0.022, 0.006, INK, { at: [0, 0.315, onTunic(0, 0.315) + 0.015], rot: [0, 0, Math.PI] }, Math.PI))
    for (let i = 0; i < 18; i++) {
      const a = i * Math.PI * 2 / 18
      body.push(P.sphere(0.031, CREAM, { at: [Math.sin(a) * 0.19, 0.13, ZC + Math.cos(a) * 0.17], scale: [1, 0.85, 1] }, 12))
    }
    badge(heart(0.022), '#FFB3D1', 0.07, 0.27)
  } else {
    // Skye's rescue vest: zipper, paw badge, pink pup-pack and silver flight wings.
    details.push(P.capsule(0.009, 0.16, GOLD, { at: [0, 0.35, onTunic(0, 0.35) + 0.02] }))
    badge(heart(0.045), '#D74489', 0.065, 0.365)
    const pawZ = onTunic(0.065, 0.365) + 0.04
    details.push(P.sphere(0.017, CREAM, { at: [0.065, 0.357, pawZ], scale: [1.2, 1, 0.35] }, 12))
    for (const [x, y] of [[-0.023, 0.015], [-0.008, 0.029], [0.01, 0.029], [0.025, 0.015]]) details.push(P.sphere(0.008, CREAM, { at: [0.065 + x, 0.357 + y, pawZ], scale: [1, 1.2, 0.4] }, 8))
    body.push(P.rbox(0.2, 0.18, 0.13, 0.03, '#D74489', { at: [0, 0.3, -0.2] }))
    for (const side of [-1, 1]) {
      body.push(P.rbox(0.30, 0.035, 0.13, 0.015, '#DCEBFF', { at: [side * 0.24, 0.3, -0.2], rot: [0, side * 0.15, side * 0.12] }))
      details.push(P.rbox(0.13, 0.008, 0.11, 0.004, '#FF8FB8', { at: [side * 0.32, 0.325, -0.2] }))
    }
  }
  return { body: group(body, details, bag), armL: onArm(group(arms.L, [], bag), -1, armTilt), armR: onArm(group(arms.R, [], bag), 1, armTilt), legL: group(legs.L, [], bag), legR: group(legs.R, [], bag) }
}

export function buildHalloweenItem(id: string, bag: Bag, armTilt: number): Worn {
  const empty: Worn = { head: null, body: null, armL: null, armR: null, legL: null, legR: null }
  if (id === 'halloween-princess') {
    const crown = buildHat('crown', bag)
    crown.updateMatrixWorld(true)
    crown.position.y -= Math.max(0, new Box3().setFromObject(crown).max.y - 0.55)
    return { ...empty, ...buildOutfit('gown', bag, armTilt), head: crown }
  }
  const head = id === 'halloween-witch' ? hat('halloween-witch-hat', bag) : id === 'halloween-pumpkin' ? hat('halloween-leaf', bag) : id === 'halloween-paw-patrol' ? hat('skye', bag) : null
  return { ...empty, ...outfit(id, bag, armTilt), head }
}
