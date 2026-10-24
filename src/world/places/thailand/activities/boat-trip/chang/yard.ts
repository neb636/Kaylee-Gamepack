// The feeding yard at Baan Chang, greybox in the final toon look (plan: "What's really there"): grey gravel in two
// bands, the steel pipe rail on posts, mossy boulders in a row in front of it, cut grass and palm fronds on the ground,
// the little blue bench, wooden sala huts on stilts at the back, and a grid of tall oil palms all round. Each layer is
// merged into one mesh (two draw calls with its outline).
import { Euler, Group, Quaternion } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { BENCH, BOULDERS, MILK, RAIL, TROUGH } from './layout'

const GRAVEL = '#CFCAD8'
const GRAVEL_DARK = '#B9B3C8'
const STEEL = '#5E5872'
const ROCK = '#B5B0C2'
const MOSS = '#8CCB86'
const PALM_TRUNK = '#A98A6E'
const FROND = '#6FBF7F'
const FROND_DARK = '#58A86C'
const WOOD = '#C99A6E'
const THATCH = '#E8C987'
const euler = new Euler()
const quat = new Quaternion()

/** An oil palm: a ringed trunk and a crown of long fronds that arch out and droop. */
function oilPalm(x: number, z: number, h: number, k: number) {
  const parts = [P.cyl(0.3, 0.38, h, PALM_TRUNK, { at: [x, h / 2, z] }, 8)]
  // Its rough, ringed bark (the old frond stubs).
  for (let i = 1; i < 5; i++) parts.push(P.cyl(0.4, 0.4, 0.18, '#977A60', { at: [x, (h / 5) * i, z] }, 8))
  for (let l = 0; l < 9; l++) {
    const a = (l / 9) * Math.PI * 2 + k
    const droop = 0.45 + (l % 3) * 0.2
    // Each frond: a long thin leaf from the top, out and down (turned to its heading, then tipped down).
    const e = euler.setFromQuaternion(quat.setFromEuler(new Euler(droop, a, 0, 'YXZ')), 'XYZ')
    const out = [Math.sin(a) * Math.cos(droop), -Math.sin(droop), Math.cos(a) * Math.cos(droop)]
    parts.push(P.box(0.5, 0.05, 3.2, l % 2 ? FROND : FROND_DARK, { at: [x + out[0] * 1.55, h + out[1] * 1.55, z + out[2] * 1.55], rot: [e.x, e.y, e.z] }))
  }
  parts.push(P.sphere(0.45, '#8B6A4E', { at: [x, h, z] }, 8))
  return parts
}

/** A sala on stilts: a wooden deck, four posts, a peaked thatch roof. */
function sala(x: number, z: number, rot: number) {
  const c = Math.cos(rot)
  const s = Math.sin(rot)
  const at = (dx: number, y: number, dz: number): [number, number, number] => [x + dx * c + dz * s, y, z - dx * s + dz * c]
  return [
    ...[-1, 1].flatMap((i) => [-1, 1].map((j) => P.cyl(0.1, 0.1, 2.6, WOOD, { at: at(i * 1.3, 1.3, j * 1.1) }, 6))),
    P.box(3, 0.16, 2.6, '#B7865C', { at: at(0, 1.1, 0), rot: [0, rot, 0] }),
    P.box(3, 0.5, 0.06, WOOD, { at: at(0, 1.4, 1.27), rot: [0, rot, 0] }),
    P.prism([[-2, 0], [2, 0], [0, 1.4]], 3.4, THATCH, { at: at(0, 2.6, 0), rot: [0, rot + Math.PI / 2, 0] }),
  ]
}

export function buildYard(bag: Bag) {
  const root = new Group()
  // ---- The ground: gravel all round, with darker patches; sandy where the family stand ----
  const ground = [P.box(80, 0.1, 80, GRAVEL, { at: [0, -0.05, -20] })]
  for (let i = 0; i < 40; i++) {
    const x = Math.sin(i * 12.9898) * 9
    const z = -1 - ((i * 7.31) % 14)
    ground.push(P.cyl(0.5 + (i % 4) * 0.25, 0.5 + (i % 4) * 0.25, 0.01, GRAVEL_DARK, { at: [x, 0.004, z], scale: [1.4, 1, 0.8] }, 10))
  }
  ground.push(P.box(16, 0.012, 4.5, '#E6DCC6', { at: [0, 0.006, 2.6] }))
  root.add(solid(merge(ground), bag, 0))
  // ---- The rail: two steel pipes on posts ----
  const rail = []
  for (let x = RAIL.x0; x <= RAIL.x1 + 0.01; x += RAIL.posts) rail.push(P.cyl(0.06, 0.07, RAIL.top + 0.05, STEEL, { at: [x, (RAIL.top + 0.05) / 2, RAIL.z] }, 8), P.sphere(0.075, STEEL, { at: [x, RAIL.top + 0.05, RAIL.z] }, 8))
  for (const y of [RAIL.top, RAIL.mid]) rail.push(P.cyl(RAIL.r, RAIL.r, RAIL.x1 - RAIL.x0, STEEL, { at: [(RAIL.x0 + RAIL.x1) / 2, y, RAIL.z], rot: [0, 0, Math.PI / 2] }, 8))
  // A flat cap on one post, where her chocolate milk stands.
  rail.push(P.cyl(0.13, 0.11, 0.05, STEEL, { at: [MILK.x, MILK.y - 0.04, MILK.z] }, 12))
  root.add(solid(merge(rail), bag, 1.5))
  // ---- The water trough behind the rail (the splash) ----
  const tw = TROUGH.x1 - TROUGH.x0
  const tx = (TROUGH.x0 + TROUGH.x1) / 2
  root.add(
    solid(
      merge([
        P.box(tw, TROUGH.h, 0.08, '#A9A3B8', { at: [tx, TROUGH.h / 2, TROUGH.z + TROUGH.w / 2] }),
        P.box(tw, TROUGH.h, 0.08, '#A9A3B8', { at: [tx, TROUGH.h / 2, TROUGH.z - TROUGH.w / 2] }),
        ...[TROUGH.x0, TROUGH.x1].map((x) => P.box(0.08, TROUGH.h, TROUGH.w, '#A9A3B8', { at: [x, TROUGH.h / 2, TROUGH.z] })),
        P.box(tw, 0.04, TROUGH.w - 0.06, '#7FC8F0', { at: [tx, TROUGH.h - 0.07, TROUGH.z] }),
      ]),
      bag,
      1.5,
    ),
  )
  // ---- The boulders, mossy on top ----
  root.add(
    solid(
      merge(
        BOULDERS.flatMap(([x, z, r, sq], i) => [
          P.sphere(r, ROCK, { at: [x, r * sq * 0.82, z], scale: [1.25, sq, 1] }, 12),
          P.sphere(r * 0.82, MOSS, { at: [x + (i % 2 ? 0.08 : -0.06), r * sq * 1.25, z - 0.02], scale: [1.2, 0.35, 0.95] }, 10),
        ]),
      ),
      bag,
      2,
    ),
  )
  // ---- Cut grass and palm fronds on the elephants' side, the blue bench on the family's ----
  const litter = []
  for (let i = 0; i < 9; i++) {
    const x = -4 + i * 1.05 + Math.sin(i * 3.1) * 0.3
    const z = -0.9 - (i % 3) * 0.55
    litter.push(P.box(0.9, 0.06, 0.16, i % 2 ? '#9ED07E' : '#B8DA82', { at: [x, 0.04, z], rot: [0, i * 0.7, 0] }), P.box(0.7, 0.05, 0.12, '#8CC56E', { at: [x + 0.1, 0.07, z + 0.05], rot: [0, -i * 0.5, 0] }))
  }
  litter.push(
    P.rbox(1.5, 0.08, 0.42, 0.03, '#6FA8E8', { at: [BENCH.x, BENCH.y - 0.04, BENCH.z] }),
    ...[-0.6, 0.6].map((dx) => P.box(0.08, 0.44, 0.36, '#4F86C8', { at: [BENCH.x + dx, 0.22, BENCH.z] })),
  )
  root.add(solid(merge(litter), bag, 1.5))
  // ---- Wooden salas on stilts at the back, and the oil palms in their grid ----
  root.add(solid(merge([...sala(-6.5, -9, 0.3), ...sala(5.5, -11, -0.25)]), bag, 2))
  const palms = []
  for (let i = -3; i <= 3; i++)
    for (let j = 0; j < 3; j++) {
      const x = i * 4.2 + (j % 2) * 2.1
      const z = -6.5 - j * 4.5
      if (Math.abs(x + 6.5) < 2 && j === 0) continue
      palms.push(...oilPalm(x, z, 5.5 + ((i + j) % 3) * 0.8, i * 0.7 + j))
    }
  // Two closer palms at the sides frame the yard.
  palms.push(...oilPalm(-5.6, 1.2, 6.5, 0.4), ...oilPalm(7.4, 0.4, 6.8, 1.1))
  root.add(solid(merge(palms), bag, 2))
  return root
}
