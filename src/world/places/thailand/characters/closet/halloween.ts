// Halloween's dress-up box, fitted to the same model measurements as the everyday closet. These are clothes over
// Kaylee, never masks over her whole face: her eyes, horn, ears and expression remain visible. All geometry belongs
// to the scene's Bag and is built lazily when a drawer opens or she puts something on.
import { Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import type { Worn } from '../../../../engine3d/characters/animal'
import { P } from '../../../../engine3d/geo'
import { FACE, group, onArm, onTunic, shell, sleeve, tunic, ZC } from '../model-wear'
import { aim, brim, facing, heart, star } from './fit'

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
    for (const s of [-1, 1]) {
      const from = new Vector3(s * 0.2, 0.29, -0.08)
      const to = new Vector3(s * 0.32, 0.48, -0.07)
      const mid = from.clone().add(to).multiplyScalar(0.5)
      lined.push(P.capsule(0.012, from.distanceTo(to), INK, { at: [mid.x, mid.y, mid.z], rot: aim(to.clone().sub(from)) }))
      lined.push(P.sphere(0.04, GOLD, { at: [to.x, to.y, to.z] }, 12))
    }
  }
  return group(lined, plain, bag)
}

function mask(bag: Bag) {
  const lined: Parts = []
  // Open rings frame her eyes instead of covering them. Head-local face coordinates match model-wear.ts's Frame.
  for (const s of [-1, 1]) {
    lined.push(P.torus(0.064, 0.02, '#8FE3C8', { at: FACE.on(s * FACE.eyeX, 0, 0.04), rot: FACE.turnTo(s * FACE.eyeX), scale: [1.2, 0.8, 1] }))
    lined.push(P.prism(star(0.035), 0.012, GOLD, { at: FACE.on(s * 0.19, 0.02, 0.045), rot: FACE.turnTo(s * 0.19) }))
  }
  lined.push(P.capsule(0.013, 0.055, '#8FE3C8', { at: FACE.on(0, 0.015, 0.04), rot: [0, 0, Math.PI / 2] }))
  return group(lined, [], bag)
}

function wings(bag: Bag) {
  const lined: Parts = []
  const plain: Parts = []
  for (const s of [-1, 1]) {
    const outline: [number, number][] = [[0.1, 0.4], [0.28, 0.6], [0.55, 0.55], [0.48, 0.28], [0.37, 0.36], [0.28, 0.22], [0.2, 0.32], [0.1, 0.29]].map(([x, y]) => [s * x, y])
    // Keep winding consistent for both sides, so both wings have the same visible face.
    if (s < 0) outline.reverse()
    lined.push(P.prism(outline, 0.025, PURPLE, { at: [0, 0, -0.24] }))
    for (const [x, y] of [[0.48, 0.5], [0.37, 0.36], [0.28, 0.25]]) {
      const a = new Vector3(s * 0.12, 0.38, -0.22), b = new Vector3(s * x, y, -0.22)
      const mid = a.clone().add(b).multiplyScalar(0.5)
      plain.push(P.capsule(0.009, a.distanceTo(b), '#D8C1F0', { at: [mid.x, mid.y, mid.z], rot: aim(b.clone().sub(a)) }))
    }
  }
  const g = group(lined, plain, bag)!
  g.userData.wings = true
  return g
}

function outfit(id: string, bag: Bag, armTilt: number): Partial<Worn> {
  const body: Parts = [], details: Parts = []
  const arms: Record<'L' | 'R', Parts> = { L: [], R: [] }
  const legs: Record<'L' | 'R', Parts> = { L: [], R: [] }
  const color = id === 'halloween-witch' ? PURPLE : id === 'halloween-pumpkin' ? '#FFAB67' : id === 'halloween-ghost' ? CREAM : id === 'halloween-skeleton' ? '#68568D' : id === 'halloween-hero' ? '#8EC9F5' : GOLD
  // Covers her existing striped dress, with a little room for it at the hips.
  body.push(tunic(0.18, color))
  body.push(shell([[0.12, 0, 0], [0.12, 0.19, 0.17], [0.2, 0.185, 0.165], [0.29, 0.15, 0.136], [0.31, 0, 0]], color))
  for (const [side, sign] of [['L', -1], ['R', 1]] as const) {
    arms[side].push(sleeve(sign, color))
    if (id === 'halloween-skeleton') {
      legs[side].push(P.cyl(0.062, 0.065, 0.1, color, { at: [0, -0.01, 0.01] }))
      legs[side].push(P.capsule(0.013, 0.06, CREAM, { at: [0, -0.01, 0.073] }))
    }
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
  } else if (id === 'halloween-skeleton') {
    details.push(P.capsule(0.012, 0.19, CREAM, { at: [0, 0.33, onTunic(0, 0.33) + 0.024] }))
    for (const y of [0.38, 0.35, 0.32]) for (const s of [-1, 1]) details.push(P.capsule(0.011, 0.065, CREAM, { at: [s * 0.043, y, onTunic(s * 0.043, y) + 0.022], rot: [0, 0, s * 1.25] }))
    badge(heart(0.023), '#FFB3D1', 0.042, 0.39)
  } else if (id === 'halloween-hero') {
    body.push(P.torus(0.15, 0.016, GOLD, { at: [0, 0.29, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] }))
    badge(star(0.057), '#FF8FB8')
    badge(star(0.029), GOLD)
    for (const [side, sign] of [['L', -1], ['R', 1]] as const) arms[side].push(P.sphere(0.05, '#8FE3C8', { at: [sign * 0.055, -0.09, 0], scale: [0.7, 0.65, 0.9] }, 12))
  } else {
    // Rounded honey stripes, plus a heart badge: a bee rather than a scary insect.
    for (const y of [0.22, 0.285, 0.36]) body.push(P.torus(y > 0.3 ? 0.123 : 0.173, 0.018, INK, { at: [0, y, ZC], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] }))
    badge(heart(0.03), '#FFB3D1')
  }
  return { body: group(body, details, bag), armL: onArm(group(arms.L, [], bag), -1, armTilt), armR: onArm(group(arms.R, [], bag), 1, armTilt), legL: group(legs.L, [], bag), legR: group(legs.R, [], bag) }
}

export function buildHalloweenItem(id: string, bag: Bag, armTilt: number): Worn {
  const empty: Worn = { head: null, body: null, armL: null, armR: null, legL: null, legR: null }
  if (['halloween-witch-hat', 'halloween-leaf', 'halloween-antennae'].includes(id)) return { ...empty, head: hat(id, bag) }
  if (id === 'halloween-mask') return { ...empty, head: mask(bag) }
  if (id === 'halloween-bat-wings') return { ...empty, body: wings(bag) }
  return { ...empty, ...outfit(id, bag, armTilt) }
}
