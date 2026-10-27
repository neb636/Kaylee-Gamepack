// The Nan map's shapes (layout.ts says where): a toy diorama of Nan on a table, in the house's toon look. Green hills
// with Doi Phu Kha in the middle, the Nan River winding down, cream roads between the places, and the places standing
// up like toys: the mushroom farm with a big pink mushroom on its roof, the rice steps with the little wooden café on
// top, the salt hut with its steaming pan, Nan town with its market umbrellas and the Thai flag, and the airport with
// its runway and a tiny plane. Along the right edge, Laos: a row of little border posts and its flag. Clouds sit on the
// peaks, buffalo graze the paddies by the river, a fish waits in it, and the little silver Pajero (the drive's, scaled
// down) sits on the roads. The look (step 8): the board sits in a raised wooden frame on a lavender table with a pink
// cloth, crayons and a cup of pink milk beside it; the landmarks are big chunky toys (PLACE_SCALE); round trees mixed
// with the pointy ones, rice paddies in the valleys, little pink mushrooms round the farm.
import { BufferAttribute, BufferGeometry, Color, Group, PlaneGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { buildPajero, type Pajero } from '../../../trip/vehicles/pajero'
import {
  BOARD,
  BUFFALO,
  CAR_SCALE,
  CLOUDS,
  FISH,
  heightAt,
  LAOS_FLAG,
  LAOS_X,
  modelAt,
  PADDIES,
  PLACES,
  RIVER,
  RIVER_W,
  RUNWAY,
  STAMP_Y,
  STOPS,
  THAI_FLAG,
  type PlaceId,
  type Stop,
  STOP_PLACE,
  type XZ,
} from './layout'
import { smoothLine, type Net } from './net'

const WOOD = '#C99A6E'
const WOOD_DARK = '#9C7250'
const ROOF = '#FF8A4D'
const ROAD = '#FFF1D6'
const WATER = '#8EC9F5'

export interface Diorama {
  root: Group
  /** Each place, to bounce when poked. */
  places: Record<PlaceId, Group>
  /** The stamp floating over each stop once it's done. */
  stamps: Record<Stop, Group>
  plane: Group
  clouds: Group[]
  fish: Group
  buffalo: { root: Group; head: Group }
  flags: { thai: Group; laos: Group }
  car: Pajero
  /** Where the salt pan's steam rises from (world). */
  steam: [number, number, number]
  river: XZ[]
}

const y = (x: number, z: number) => heightAt(x, z)
/** The landmarks stand this much bigger than the board's scale, like toys (map3d.ts keeps it when they bounce). */
export const PLACE_SCALE = 1.3

/** A flat ribbon laid on the ground along a line (a road, the river), `lift` above it. */
function ribbon(line: XZ[], w: number, lift: number, color: string) {
  const pos: number[] = []
  const edge = (i: number) => {
    const [ax, az] = line[Math.max(0, i - 1)]
    const [bx, bz] = line[Math.min(line.length - 1, i + 1)]
    const l = Math.hypot(bx - ax, bz - az) || 1
    const nx = (-(bz - az) / l) * (w / 2)
    const nz = ((bx - ax) / l) * (w / 2)
    const [x, z] = line[i]
    return { l: [x + nx, y(x + nx, z + nz) + lift, z + nz], r: [x - nx, y(x - nx, z - nz) + lift, z - nz] }
  }
  let a = edge(0)
  for (let i = 1; i < line.length; i++) {
    const b = edge(i)
    pos.push(...a.l, ...b.l, ...a.r, ...a.r, ...b.l, ...b.r)
    a = b
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3))
  return bake(g, color)
}

/** The ground: the hills on a grid, each triangle one flat green (darker up high, a little yellower in Laos). */
function terrain() {
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const g0 = new PlaneGeometry(W, D, 96, 72).rotateX(-Math.PI / 2)
  const p = g0.attributes.position
  for (let i = 0; i < p.count; i++) p.setY(i, heightAt(p.getX(i), p.getZ(i)))
  g0.computeVertexNormals()
  const g = bake(g0, '#ffffff')
  const pos = g.attributes.position
  const col = g.attributes.color
  const bands = ['#A9DC97', '#94D38F', '#7FC689', '#6CB883', '#5FA97E'].map((c) => new Color(c))
  const laos = new Color('#D3DE9C')
  const c = new Color()
  for (let t = 0; t < pos.count; t += 3) {
    const h = (pos.getY(t) + pos.getY(t + 1) + pos.getY(t + 2)) / 3
    const x = (pos.getX(t) + pos.getX(t + 1) + pos.getX(t + 2)) / 3
    c.copy(bands[Math.min(bands.length - 1, Math.floor(h / 0.12))])
    if (x > LAOS_X) c.lerp(laos, 0.45)
    for (let k = 0; k < 3; k++) col.setXYZ(t + k, c.r, c.g, c.b)
  }
  return g
}

/** A little house: walls and a pitched roof (its ridge along x). */
function house(x: number, z: number, w: number, d: number, h: number, wall: string, roof = ROOF, yaw = 0) {
  const at = (px: number, py: number, pz: number): [number, number, number] => [x + px * Math.cos(yaw) + pz * Math.sin(yaw), py, z - px * Math.sin(yaw) + pz * Math.cos(yaw)]
  const g = y(x, z)
  return [
    P.box(w, h, d, wall, { at: at(0, g + h / 2, 0), rot: [0, yaw, 0] }),
    P.prism([[-w / 2 - 0.015, 0], [w / 2 + 0.015, 0], [0, h * 0.7]], d + 0.03, roof, { at: at(0, g + h, 0), rot: [0, yaw, 0] }),
    P.box(w * 0.22, h * 0.5, 0.005, WOOD_DARK, { at: at(0, g + h * 0.25, d / 2 + 0.003), rot: [0, yaw, 0] }),
  ]
}

/** A flag on a pole, its cloth a separate group so it can wave (stripes top to bottom, as [color, share]). */
function flag(bag: Bag, at: XZ, stripes: [string, number][], disc?: string) {
  const root = new Group()
  root.position.set(at[0], y(...at), at[1])
  root.add(solid(merge([P.cyl(0.008, 0.008, 0.36, '#EDEAF2', { at: [0, 0.18, 0] }), P.sphere(0.014, PAL.gold, { at: [0, 0.365, 0] })]), bag, 1.5))
  const cloth = new Group()
  cloth.position.set(0.006, 0.34, 0)
  const W = 0.17
  const H = 0.11
  const total = stripes.reduce((n, s) => n + s[1], 0)
  let top = 0
  const parts = stripes.map(([c, n]) => {
    const h = (H * n) / total
    const part = P.box(W, h, 0.008, c, { at: [W / 2, -top - h / 2, 0] })
    top += h
    return part
  })
  if (disc) parts.push(P.cyl(H * 0.16, H * 0.16, 0.012, disc, { at: [W / 2, -H / 2, 0], rot: [Math.PI / 2, 0, 0] }, 16))
  cloth.add(solid(merge(parts), bag, 1.5))
  root.add(cloth)
  return root
}

export function buildDiorama(bag: Bag, net: Net): Diorama {
  const root = new Group()
  // ---- The table, the board's wooden frame and the ground ----
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const lip = 0.07
  root.add(solid(merge([
    P.rbox(W + 3.2, 0.3, D + 2.6, 0.12, '#EADFFB', { at: [0, -0.32, 0.2] }),
    // The pink cloth under the board, its scalloped edge.
    P.rbox(W + 1.0, 0.02, D + 1.0, 0.01, '#FFD3E6', { at: [0, -0.16, 0] }),
    ...Array.from({ length: 16 }, (_, i) => P.cyl(0.18, 0.18, 0.02, '#FFD3E6', { at: [-(W + 1.0) / 2 + 0.18 + (i * (W + 0.64)) / 15, -0.16, (D + 1.0) / 2] }, 14)),
    P.rbox(W + 0.2, 0.2, D + 0.2, 0.05, WOOD, { at: [0, -0.115, 0] }),
    // The frame's raised lip all round.
    P.rbox(W + 0.3, lip, 0.12, 0.03, WOOD_DARK, { at: [0, lip / 2 - 0.02, BOARD.z1 + 0.09] }),
    P.rbox(W + 0.3, lip, 0.12, 0.03, WOOD_DARK, { at: [0, lip / 2 - 0.02, BOARD.z0 - 0.09] }),
    P.rbox(0.12, lip, D + 0.06, 0.03, WOOD_DARK, { at: [BOARD.x0 - 0.09, lip / 2 - 0.02, 0] }),
    P.rbox(0.12, lip, D + 0.06, 0.03, WOOD_DARK, { at: [BOARD.x1 + 0.09, lip / 2 - 0.02, 0] }),
    // Crayons beside the board, and a cup of pink milk.
    ...[PAL.hotpink, '#B9A6F5', PAL.mint].flatMap((c, i) => [
      P.cyl(0.035, 0.035, 0.42, c, { at: [BOARD.x1 + 0.45 + i * 0.1, -0.13, 1.4 + i * 0.12], rot: [Math.PI / 2, 0.3 - i * 0.15, Math.PI / 2] }, 10),
      P.cone(0.035, 0.07, c, { at: [BOARD.x1 + 0.45 + i * 0.1 - Math.cos(0.3 - i * 0.15) * 0.245, -0.13, 1.4 + i * 0.12 + Math.sin(0.3 - i * 0.15) * 0.245], rot: [0, 0.3 - i * 0.15, Math.PI / 2] }, 10),
    ]),
    P.cyl(0.16, 0.13, 0.3, '#FFFFFF', { at: [BOARD.x0 - 0.6, -0.02, -1.2] }, 18),
    P.cyl(0.145, 0.145, 0.02, '#FFB3CF', { at: [BOARD.x0 - 0.6, 0.12, -1.2] }, 18),
    P.torus(0.07, 0.02, '#FFFFFF', { at: [BOARD.x0 - 0.78, -0.02, -1.2], rot: [0, 0, Math.PI / 2] }),
    P.cyl(0.24, 0.24, 0.02, '#FFFFFF', { at: [BOARD.x0 - 0.6, -0.17, -1.2] }, 20),
  ]), bag, 2))
  root.add(solid(terrain(), bag, 0))

  // ---- The river and the paddies by it, the roads and the bridges ----
  const river = smoothLine(RIVER)
  const flat: ReturnType<typeof P.box>[] = [ribbon(river, RIVER_W, 0.012, WATER), ribbon(river, RIVER_W * 0.45, 0.016, '#B5DDF8')]
  for (const line of net.lines) flat.push(ribbon(line, 0.075, 0.02, ROAD))
  for (let i = 0; i < 6; i++) {
    const px = PADDIES[0] + (i % 3) * 0.17 - 0.17
    const pz = PADDIES[1] + Math.floor(i / 3) * 0.17 - 0.08
    flat.push(P.box(0.15, 0.012, 0.15, i % 2 ? '#BCE7A3' : '#C9EDB6', { at: [px, y(px, pz) + 0.008, pz] }))
  }
  // More paddies down the valley: green, a few golden, one shiny with water.
  for (const [cx, cz, n] of [[-0.25, 1.62, 3], [-1.9, -0.25, 2], [0.2, -0.45, 2]] as const)
    for (let i = 0; i < n * 2; i++) {
      const px = cx + (i % n) * 0.15 - ((n - 1) * 0.15) / 2
      const pz = cz + Math.floor(i / n) * 0.15 - 0.075
      flat.push(P.box(0.13, 0.012, 0.13, ['#BCE7A3', '#F3E3A0', '#C9EDB6', '#C3E9F7'][(i + n) % 4], { at: [px, y(px, pz) + 0.008, pz] }))
    }
  root.add(solid(merge(flat), bag, 0))
  // A bridge wherever a road crosses the river.
  const bridges: ReturnType<typeof P.box>[] = []
  for (const line of net.lines)
    for (let i = 0; i < line.length; i += 2) {
      const [x, z] = line[i]
      if (river.some(([rx, rz]) => Math.hypot(rx - x, rz - z) < 0.04)) {
        const [ax, az] = line[Math.max(0, i - 2)]
        const [bx, bz] = line[Math.min(line.length - 1, i + 2)]
        const yaw = Math.atan2(bx - ax, bz - az)
        bridges.push(P.rbox(0.11, 0.025, 0.24, 0.01, '#E8DCCB', { at: [x, 0.035, z], rot: [0, yaw, 0] }), ...[-1, 1].map((s) => P.box(0.01, 0.03, 0.24, WOOD_DARK, { at: [x + Math.cos(yaw) * s * 0.055, 0.06, z - Math.sin(yaw) * s * 0.055], rot: [0, yaw, 0] })))
        i += 10
      }
    }
  if (bridges.length) root.add(solid(merge(bridges), bag, 1.5))

  // ---- Trees on the hills, away from the roads, the river and the places ----
  const trees: ReturnType<typeof P.box>[] = []
  const away = (x: number, z: number) =>
    !net.lines.some((l) => l.some(([px, pz], i) => i % 3 === 0 && Math.hypot(px - x, pz - z) < 0.12)) &&
    !river.some(([px, pz], i) => i % 3 === 0 && Math.hypot(px - x, pz - z) < 0.16) &&
    !(Object.keys(PLACES) as PlaceId[]).some((id) => Math.hypot(modelAt(id)[0] - x, modelAt(id)[1] - z) < 0.36 || Math.hypot(PLACES[id].at[0] - x, PLACES[id].at[1] - z) < 0.2) &&
    Math.abs(x - LAOS_X) > 0.06
  for (let i = 0, n = 0; i < 900 && n < 110; i++) {
    const x = BOARD.x0 + 0.15 + (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1 * (W - 0.3)
    const z = BOARD.z0 + 0.15 + (((Math.sin(i * 78.233) * 12345.678) % 1) + 1) % 1 * (D - 0.3)
    const h = heightAt(x, z)
    if (h < 0.05 || !away(x, z)) continue
    n++
    const s = 0.8 + (i % 5) * 0.1
    if (i % 4 === 0) trees.push(P.cyl(0.012, 0.012, 0.06, WOOD_DARK, { at: [x, h + 0.03, z] }), P.sphere(0.06 * s, i % 3 ? '#74C08A' : '#88CC8E', { at: [x, h + 0.08 + 0.03 * s, z] }, 8))
    else trees.push(P.cyl(0.012, 0.012, 0.05, WOOD_DARK, { at: [x, h + 0.025, z] }), P.cone(0.055 * s, 0.15 * s, i % 3 ? '#4FA36E' : '#5DB27A', { at: [x, h + 0.04 + 0.075 * s, z] }, 7))
  }
  root.add(solid(merge(trees), bag, 1.5))

  // ---- The places ----
  const placeGroup = (id: PlaceId, parts: ReturnType<typeof P.box>[], px = 2) => {
    const g = new Group()
    const [x, z] = modelAt(id)
    g.position.set(x, y(x, z), z)
    g.scale.setScalar(PLACE_SCALE)
    // (The parts are built in board coordinates: move them under the group's origin.)
    for (const p of parts) p.translate(-x, -y(x, z), -z)
    g.add(solid(merge(parts), bag, px))
    root.add(g)
    return g
  }
  const at = modelAt
  const [mx, mz] = at('mushrooms')
  const mg = y(mx, mz)
  const shroom = [
    ...house(mx, mz, 0.26, 0.2, 0.15, '#FFF4E6', WOOD),
    P.cyl(0.035, 0.045, 0.09, '#FFF1E2', { at: [mx, mg + 0.27, mz] }),
    P.sphere(0.13, PAL.hotpink, { at: [mx, mg + 0.33, mz], scale: [1, 0.55, 1] }),
    ...[[-0.06, 0.04], [0.05, 0.06], [0.02, -0.05], [-0.07, -0.04], [0.08, -0.01]].map(([dx, dz]) => P.sphere(0.022, '#FFFFFF', { at: [mx + dx, mg + 0.37, mz + dz], scale: [1, 0.5, 1] }, 8)),
    // Rows of sawdust bags by the house.
    ...[0, 1, 2].map((k) => P.capsule(0.022, 0.04, '#E9E1D2', { at: [mx + 0.2, mg + 0.035, mz - 0.06 + k * 0.06], rot: [0, 0, Math.PI / 2] })),
    ...[[-0.19, 0.1], [-0.15, 0.15], [0.12, 0.14], [-0.2, -0.06]].flatMap(([dx, dz], k) => [
      P.cyl(0.008, 0.01, 0.03, '#FFF1E2', { at: [mx + dx, mg + 0.015, mz + dz] }, 6),
      P.sphere(0.025, k % 2 ? PAL.pink : PAL.hotpink, { at: [mx + dx, mg + 0.032, mz + dz], scale: [1, 0.55, 1] }, 8),
    ]),
  ]
  const [rx, rz0] = at('rice')
  let rz = rz0
  const rg = y(rx, rz)
  const steps: ReturnType<typeof P.box>[] = []
  // The steps climb the hillside toward the back (north), each one a curved paddy with water shining on it and a row of
  // young rice along its lip.
  for (let k = 0; k < 5; k++) {
    const r = 0.3 - k * 0.045
    const cz = rz - k * 0.035
    steps.push(
      P.cyl(r, r + 0.012, 0.05, k % 2 ? '#8FD67C' : '#A2E08A', { at: [rx, rg + 0.025 + k * 0.05, cz], scale: [1.15, 1, 0.8] }, 22),
      P.cyl(r - 0.025, r - 0.025, 0.006, k === 2 ? '#F3E3A0' : '#C3E9F7', { at: [rx, rg + 0.051 + k * 0.05, cz], scale: [1.15, 1, 0.8] }, 22),
      ...[-0.6, -0.2, 0.2, 0.6].map((a) => P.cone(0.012, 0.03, '#6FBF7F', { at: [rx + Math.sin(a) * (r - 0.012) * 1.15, rg + 0.065 + k * 0.05, cz + Math.cos(a) * (r - 0.012) * 0.8] }, 5)),
    )
  }
  rz -= 0.14
  const top = rg + 0.25
  const rice = [
    ...steps,
    P.box(0.2, 0.012, 0.14, WOOD, { at: [rx, top + 0.006, rz + 0.02] }),
    P.box(0.14, 0.08, 0.1, '#E2C29A', { at: [rx, top + 0.05, rz - 0.01] }),
    P.prism([[-0.09, 0], [0.09, 0], [0, 0.07]], 0.13, WOOD_DARK, { at: [rx, top + 0.09, rz - 0.01] }),
    ...[-1, 1].map((s) => P.cyl(0.006, 0.006, 0.05, WOOD_DARK, { at: [rx + s * 0.09, top + 0.03, rz + 0.085] })),
  ]
  const [sx, sz] = at('salt')
  const sg = y(sx, sz)
  const salt = [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.008, 0.008, 0.16, WOOD_DARK, { at: [sx + a * 0.11, sg + 0.08, sz + b * 0.08] })),
    P.prism([[-0.15, 0], [0.15, 0], [0, 0.1]], 0.22, '#D9B98A', { at: [sx, sg + 0.16, sz] }),
    P.rbox(0.16, 0.05, 0.12, 0.02, '#B58A68', { at: [sx, sg + 0.025, sz] }),
    P.cyl(0.07, 0.065, 0.02, '#D7DCE6', { at: [sx, sg + 0.06, sz] }, 18),
    P.sphere(0.035, '#FFFFFF', { at: [sx + 0.13, sg + 0.015, sz + 0.1], scale: [1, 0.6, 1] }, 10),
    P.cyl(0.05, 0.05, 0.06, '#B8A5D8', { at: [sx - 0.16, sg + 0.03, sz + 0.06] }, 12),
  ]
  const [tx, tz] = at('town')
  const town = [
    ...house(tx - 0.12, tz - 0.12, 0.12, 0.1, 0.08, '#FFE9D9', ROOF, 0.2),
    ...house(tx + 0.08, tz - 0.15, 0.1, 0.1, 0.1, '#FFD9E6', '#E86A8E', -0.1),
    ...house(tx + 0.2, tz - 0.02, 0.11, 0.09, 0.07, '#FFF4CF', ROOF, 0.4),
    ...house(tx - 0.2, tz + 0.06, 0.1, 0.09, 0.07, '#E4F4E8', '#5FBF8F', -0.3),
    ...house(tx + 0.06, tz + 0.14, 0.12, 0.09, 0.08, '#E7E0FF', ROOF, 0.1),
    // The market: little umbrellas over the stalls.
    ...[[-0.04, 0.02, PAL.pink], [0.06, 0.03, PAL.mint], [0.01, -0.03, PAL.butter]].flatMap(([dx, dz, c]) => [
      P.cyl(0.004, 0.004, 0.07, '#EDEAF2', { at: [tx + (dx as number), y(tx, tz) + 0.035, tz + (dz as number)] }),
      P.cone(0.05, 0.03, c as string, { at: [tx + (dx as number), y(tx, tz) + 0.08, tz + (dz as number)] }, 8),
    ]),
  ]
  const [ax, az] = at('airport')
  const ag = y(ax, az)
  const rw = RUNWAY
  const runway = [
    P.rbox(rw.len, 0.012, rw.w, 0.005, '#6E6880', { at: [rw.at[0], y(...rw.at) + 0.008, rw.at[1]], rot: [0, rw.yaw, 0] }),
    ...[-0.4, -0.2, 0, 0.2, 0.4].map((k) => P.box(0.1, 0.004, 0.018, '#FFFFFF', { at: [rw.at[0] + Math.cos(rw.yaw) * k * rw.len, y(...rw.at) + 0.016, rw.at[1] - Math.sin(rw.yaw) * k * rw.len], rot: [0, rw.yaw, 0] })),
  ]
  const airport = [
    P.rbox(0.32, 0.09, 0.15, 0.02, PAL.cream, { at: [ax, ag + 0.045, az] }),
    P.box(0.28, 0.035, 0.005, '#BFE2FA', { at: [ax, ag + 0.055, az + 0.077] }),
    P.prism([[-0.18, 0], [0.18, 0], [0.14, 0.04], [-0.14, 0.04]], 0.17, ROOF, { at: [ax, ag + 0.09, az] }),
    P.cyl(0.02, 0.025, 0.2, PAL.cream, { at: [ax + 0.22, ag + 0.1, az - 0.02] }, 10),
    P.cyl(0.04, 0.035, 0.04, '#BFE2FA', { at: [ax + 0.22, ag + 0.22, az - 0.02] }, 10),
    ...runway,
  ]
  const places = {
    mushrooms: placeGroup('mushrooms', shroom),
    rice: placeGroup('rice', rice),
    salt: placeGroup('salt', salt),
    town: placeGroup('town', town, 1.5),
    airport: placeGroup('airport', airport),
  } as Record<PlaceId, Group>

  // ---- The tiny plane, waiting at the end of the runway ----
  const plane = new Group()
  plane.add(solid(merge([
    P.capsule(0.022, 0.13, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }),
    P.box(0.04, 0.006, 0.2, '#FFFFFF', { at: [0.01, 0, 0] }),
    P.box(0.025, 0.05, 0.006, PAL.hotpink, { at: [-0.075, 0.03, 0] }),
    P.box(0.02, 0.004, 0.07, '#FFFFFF', { at: [-0.07, 0.01, 0] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, 0.0225] }),
    P.box(0.13, 0.008, 0.002, PAL.hotpink, { at: [0, 0.006, -0.0225] }),
  ]), bag, 1.5))
  root.add(plane)

  // ---- The stamps over the stops (shown once she's done each one), facing the camera ----
  const stamps = {} as Record<Stop, Group>
  for (const id of STOPS) {
    const g = new Group()
    // (The Cup's stamp lands on Nan town, in gold.)
    const [x, z] = modelAt(STOP_PLACE[id])
    g.position.set(x, y(x, z) + STAMP_Y, z)
    const face = new Group()
    face.rotation.x = Math.PI / 2 - 0.85
    face.add(solid(merge([
      P.cyl(0.13, 0.13, 0.025, id === 'cup' ? PAL.gold : PAL.hotpink, {}, 24),
      P.torus(0.105, 0.008, '#FFFFFF', { at: [0, 0.014, 0], rot: [Math.PI / 2, 0, 0] }),
      ...[-1, 1].map((s) => P.sphere(0.035, '#FFFFFF', { at: [s * 0.026, 0.016, -0.018], scale: [1, 0.3, 1] }, 10)),
      P.cone(0.058, 0.07, '#FFFFFF', { at: [0, 0.016, 0.022], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.3] }, 10),
    ]), bag, 2))
    g.add(face)
    g.visible = false
    root.add(g)
    stamps[id] = g
  }

  // ---- Clouds on the peaks ----
  const clouds = CLOUDS.map(([x, cy, z], i) => {
    const g = new Group()
    g.position.set(x, cy, z)
    g.add(solid(merge([
      P.sphere(0.16, '#FFFFFF', { scale: [1.3, 0.7, 1] }),
      P.sphere(0.12, '#FFFFFF', { at: [0.16, -0.02, 0.03], scale: [1.2, 0.75, 1] }),
      P.sphere(0.11, '#F4F1FA', { at: [-0.17, -0.03, -0.02], scale: [1.2, 0.75, 1] }),
      P.sphere(0.1, '#FFFFFF', { at: [0.04, 0.07, -0.05 + i * 0.01] }),
    ]), bag, 2))
    root.add(g)
    return g
  })

  // ---- The fish (it jumps when she taps the river), the buffalo in the paddies ----
  const fish = new Group()
  fish.add(solid(merge([P.sphere(0.03, '#FF9AC0', { scale: [1.6, 1, 0.6] }), P.cone(0.025, 0.035, '#FF6FA8', { at: [-0.055, 0, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.4] }, 6)]), bag, 1.5))
  fish.position.set(FISH[0], 0, FISH[1])
  fish.visible = false
  root.add(fish)
  const buffalo = { root: new Group(), head: new Group() }
  buffalo.root.position.set(BUFFALO[0], y(...BUFFALO) + 0.012, BUFFALO[1])
  buffalo.root.rotation.y = 0.8
  buffalo.root.add(solid(merge([
    P.sphere(0.045, '#8E86A8', { at: [0, 0.055, 0], scale: [1.5, 1, 1] }),
    ...[[-0.04, -0.025], [0.04, -0.025], [-0.04, 0.025], [0.04, 0.025]].map(([dx, dz]) => P.cyl(0.01, 0.01, 0.04, '#6E6880', { at: [dx, 0.02, dz] }, 6)),
  ]), bag, 1.5))
  buffalo.head.position.set(0.07, 0.07, 0)
  buffalo.head.add(solid(merge([
    P.sphere(0.028, '#8E86A8', { at: [0.015, -0.005, 0] }),
    P.sphere(0.018, '#C9C1D9', { at: [0.035, -0.012, 0] }),
    // The horns point out to the sides (it faces +x), up and a little back.
    ...[-1, 1].map((s) => P.cone(0.008, 0.035, '#FFF4E6', { at: [0.0, 0.02, s * 0.03], rot: [s * 0.9, 0, 0.4] }, 6)),
  ]), bag, 1.5))
  buffalo.root.add(buffalo.head)
  root.add(buffalo.root)

  // ---- Flags: Thailand's in Nan town, Laos's past the border posts ----
  const thai = flag(bag, THAI_FLAG, [['#E8404E', 1], ['#FFFFFF', 1], ['#2D3A8C', 2], ['#FFFFFF', 1], ['#E8404E', 1]])
  const laos = flag(bag, LAOS_FLAG, [['#E8404E', 1], ['#2D4FA0', 2], ['#E8404E', 1]], '#FFFFFF')
  root.add(thai, laos)
  const posts: ReturnType<typeof P.box>[] = []
  for (let z = BOARD.z0 + 0.12; z < BOARD.z1; z += 0.2) {
    const x = LAOS_X + Math.sin(z * 2.3) * 0.03
    posts.push(P.cyl(0.01, 0.012, 0.06, '#FFFFFF', { at: [x, y(x, z) + 0.03, z] }, 6), P.cyl(0.0105, 0.0105, 0.012, '#E8404E', { at: [x, y(x, z) + 0.055, z] }, 6))
  }
  root.add(solid(merge(posts), bag, 1))

  // ---- The little Pajero ----
  const car = buildPajero(bag)
  car.root.scale.setScalar(CAR_SCALE)
  root.add(car.root)

  return { root, places, stamps, plane, clouds, fish, buffalo, flags: { thai, laos }, car, steam: [sx, sg + 0.08, sz], river }
}
