// The Nan look's villages (build.ts, `look.villages`; Dad's photo of a village in the hills): houses scattered beside the
// road and up the slope, wooden on stilts or plastered on the ground, under tin roofs in pink, blue, red, teal and
// silver; a water jar by the steps, a pink bougainvillea, a banana or two. In town (`town`): two-storey shophouses
// shoulder to shoulder facing the road, with colored awnings. One mesh for them all, outlined like the other props.
import { Group, Matrix4, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { rng, type HeightField } from './build'
import type { Clear } from './forest'
import type { Road } from './road'

/** A village: `n` houses round `s` (meters along the road), on its left (`side` 1) or right (-1), from `near` to `far`
 *  meters from the road's middle. `town`: shophouses in a row along the road instead. */
export interface Village {
  s: number
  side: number
  n: number
  near?: number
  far?: number
  town?: boolean
}

const WALLS = ['#A77B5C', '#F3EDE4', '#E4EEF6', '#C98F6B', '#BFD9EE', '#F6E3C8']
const ROOFS = ['#F28DB5', '#4F86D9', '#D9534F', '#4DB3A9', '#E3E1EA', '#F2A65A', '#FF9CC4']
const DARK = '#5A4652'
const STILT = '#7A5A48'

/** One house round the origin facing +z: on stilts or not, a gable tin roof, a door and windows, a jar by the steps. */
function house(rand: () => number): BufferGeometry[] {
  const w = 4.6 + rand() * 2.2
  const d = 3.8 + rand() * 1.4
  const raised = rand() < 0.6
  const lift = raised ? 1.3 : 0.15
  const h = 2.5
  const wall = WALLS[Math.floor(rand() * WALLS.length)]
  const roof = ROOFS[Math.floor(rand() * ROOFS.length)]
  const parts: BufferGeometry[] = []
  if (raised) for (const x of [-w / 2 + 0.3, 0, w / 2 - 0.3]) for (const z of [-d / 2 + 0.3, d / 2 - 0.3]) parts.push(P.box(0.2, lift + 0.4, 0.2, STILT, { at: [x, (lift + 0.4) / 2 - 0.4, z] }))
  parts.push(P.box(w, h, d, wall, { at: [0, lift + h / 2, 0] }))
  // The roof: two slopes meeting at a ridge along the house, hanging over a little, and the gable ends filled.
  const pitch = 0.5
  const run = d / 2 + 0.5
  const slope = run / Math.cos(pitch)
  for (const side of [-1, 1]) parts.push(P.box(w + 0.8, 0.12, slope, roof, { at: [0, lift + h + Math.tan(pitch) * run * 0.5 - 0.05, (side * run) / 2], rot: [side * pitch, 0, 0] }))
  const peak = Math.tan(pitch) * (d / 2)
  for (const x of [-w / 2, w / 2]) parts.push(P.prism([[-d / 2, 0], [d / 2, 0], [0, peak]], 0.1, wall, { at: [x, lift + h, 0], rot: [0, Math.PI / 2, 0] }))
  // Door, windows, the steps up, a water jar.
  parts.push(P.box(0.9, 1.7, 0.08, DARK, { at: [-w * 0.18, lift + 0.85, d / 2 + 0.02] }))
  for (const x of [w * 0.12, w * 0.32]) parts.push(P.box(0.7, 0.6, 0.08, '#8FB8D8', { at: [x, lift + 1.5, d / 2 + 0.02] }))
  if (raised) for (let i = 0; i < 3; i++) parts.push(P.box(1, 0.1, 0.4, STILT, { at: [-w * 0.18, lift - 0.35 - i * 0.4, d / 2 + 0.35 + i * 0.4] }))
  parts.push(P.sphere(0.42, '#8C5A3C', { at: [w * 0.38, 0.4, d / 2 + 0.9], scale: [1, 1.1, 1] }, 10))
  if (rand() < 0.5) parts.push(P.sphere(0.9, '#FF6FAE', { at: [-w / 2 - 0.6, 0.8, d / 2 + 0.3], scale: [1, 0.85, 1] }, 10))
  return parts
}

/** A two-storey shophouse round the origin facing +z: a plastered front, the shop open below under an awning, two
 *  windows above, a flat parapet roof. */
function shophouse(rand: () => number): BufferGeometry[] {
  const w = 4.2
  const d = 7
  const wall = ['#F3EDE4', '#F6E3C8', '#E4EEF6', '#F7D9E4', '#E8F3DF'][Math.floor(rand() * 5)]
  const awning = ['#FF8FB8', '#4F86D9', '#4DB3A9', '#F2A65A', '#D9534F'][Math.floor(rand() * 5)]
  return [
    P.box(w, 6.2, d, wall, { at: [0, 3.1, 0] }),
    P.box(w + 0.1, 0.4, d + 0.1, '#D9D3DE', { at: [0, 6.3, 0] }),
    P.box(w - 0.6, 2.4, 0.08, DARK, { at: [0, 1.25, d / 2 + 0.02] }),
    P.box(w, 0.1, 1.4, awning, { at: [0, 2.85, d / 2 + 0.6], rot: [0.25, 0, 0] }),
    ...[-0.9, 0.9].map((x) => P.box(0.9, 1.1, 0.08, '#8FB8D8', { at: [x, 4.4, d / 2 + 0.02] })),
  ]
}

/** All the villages, and the spots each house keeps clear of trees. */
export function buildVillages(road: Road, field: HeightField, villages: Village[], seed: number, bag: Bag) {
  const rand = rng(seed * 13 + 3)
  const parts: BufferGeometry[] = []
  const clears: Clear[] = []
  const m = new Matrix4()
  const put = (g: BufferGeometry[], x: number, y: number, z: number, yaw: number) => {
    const one = merge(g)
    one.applyMatrix4(m.makeRotationY(yaw).setPosition(x, y, z))
    parts.push(one)
  }
  for (const v of villages) {
    if (v.town) {
      // Shoulder to shoulder along the road, facing it.
      for (let i = 0; i < v.n; i++) {
        const s = v.s + i * 4.5
        const p = road.spotAt(s, v.side * (road.half + 9))
        const t = road.sampleAt(s)
        const yaw = Math.atan2(-v.side * t.lx, -v.side * t.lz)
        put(shophouse(rand), p.x, field.at(p.x, p.z), p.z, yaw)
        clears.push({ x: p.x, z: p.z, r: 5 })
      }
      continue
    }
    for (let i = 0, tries = 0; i < v.n && tries < v.n * 20; tries++) {
      const s = v.s + (rand() - 0.5) * v.n * 9
      const lat = v.side * ((v.near ?? road.half + 11) + rand() * ((v.far ?? 38) - (v.near ?? road.half + 11)))
      const p = road.spotAt(s, lat)
      if (field.dist(p.x, p.z) < road.half + 9) continue
      if (clears.some((c) => Math.hypot(c.x - p.x, c.z - p.z) < 8)) continue
      const t = road.sampleAt(s)
      // Facing the road, give or take.
      const yaw = Math.atan2(-v.side * t.lx, -v.side * t.lz) + (rand() - 0.5) * 0.5
      put(house(rand), p.x, field.at(p.x, p.z), p.z, yaw)
      clears.push({ x: p.x, z: p.z, r: 5.5 })
      i++
    }
  }
  const root = new Group()
  if (parts.length) root.add(solid(merge(parts), bag, 2))
  return { root, clears }
}
