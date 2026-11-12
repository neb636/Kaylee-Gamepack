// The Nan map's shapes (layout.ts says where): a toy diorama of Nan in the Thailand map's look (hub/map/), floating in
// the sky in the same toy tray. Nan stands up out of cream paper like a slice of cake (ground.ts paints it), with Doi
// Phu Kha and the hills wooded in the Thailand map's round trees and toy mountains, the Nan River winding down (its
// glints drift, and it spills over the edge), cream roads between the places, and the places standing up like toys:
// the mushroom farm's cottage with a giant spotty mushroom behind it, the rice steps with Stop Time Cafe on top, Bo
// Kluea's thatched hut with its steaming salt pan, the well and the salt piles, Nan town's pastel houses round the
// market umbrellas and the Thai flag, and the airport with its pink roof, control tower and runway lights. Past the
// border, on the paper: Laos, a row of little border posts and its flag. Clouds sit on the peaks, a buffalo grazes the
// paddies by the river, a fish waits in it, and the little silver Pajero (the drive's, scaled down) sits on the roads.
// The landmarks are big chunky toys (PLACE_SCALE).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { trayParts } from '../../../trip/sky'
import { mountainParts, treeParts } from '../../hub/map/toys'
import { buildPajero, type Pajero } from '../../../trip/vehicles/pajero'
import {
  BOARD,
  BUFFALO,
  CAR_SCALE,
  CLOUDS,
  FISH,
  heightAt,
  hillAt,
  inNan,
  PAPER_Y,
  LAOS_FLAG,
  LAOS_X,
  modelAt,
  PLACES,
  RIVER,
  RUNWAY,
  STAMP_Y,
  STOPS,
  THAI_FLAG,
  type PlaceId,
  type Stop,
  STOP_PLACE,
  type XZ,
} from './layout'
import { buildGround, riverGlints } from './ground'
import { smoothLine, type Net } from './net'

const WOOD = '#C99A6E'
const WOOD_DARK = '#9C7250'
const ROOF = '#FF8A4D'

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
  /** The river's glints drift (call with the time). */
  water: (t: number) => void
}

const y = (x: number, z: number) => heightAt(x, z)
/** Toy mountains standing on the hills, like the Thailand map's north: [x, z, radius, height]. */
const MOUNTAINS: [number, number, number, number][] = [
  [0.05, -0.95, 0.2, 0.42],
  [0.62, -1.15, 0.17, 0.36],
  [0.3, -0.7, 0.13, 0.28],
  [-2.05, -1.55, 0.18, 0.38],
  [-2.45, -1.0, 0.15, 0.3],
  [2.05, 1.35, 0.17, 0.34],
  [1.85, 0.2, 0.15, 0.3],
  [-2.4, 0.8, 0.14, 0.28],
  [1.95, -1.75, 0.14, 0.3],
]
/** The landmarks stand this much bigger than the board's scale, like toys (map3d.ts keeps it when they bounce). */
export const PLACE_SCALE = 1.3

/** A little toy house: rounded walls, a pitched roof with an overhang (its ridge along x), a door and two windows. */
function house(x: number, z: number, w: number, d: number, h: number, wall: string, roof = ROOF, yaw = 0) {
  const at = (px: number, py: number, pz: number): [number, number, number] => [x + px * Math.cos(yaw) + pz * Math.sin(yaw), py, z - px * Math.sin(yaw) + pz * Math.cos(yaw)]
  const g = y(x, z)
  const rot: [number, number, number] = [0, yaw, 0]
  return [
    P.rbox(w, h, d, Math.min(w, d) * 0.12, wall, { at: at(0, g + h / 2, 0), rot }),
    P.prism([[-w / 2 - 0.022, 0], [w / 2 + 0.022, 0], [0, h * 0.72]], d + 0.045, roof, { at: at(0, g + h - 0.004, 0), rot }),
    P.rbox(w * 0.24, h * 0.56, 0.012, 0.005, '#B07A58', { at: at(0, g + h * 0.28, d / 2 + 0.003), rot }),
    ...[-1, 1].map((k) => P.rbox(w * 0.17, h * 0.24, 0.012, 0.004, '#DDF3FF', { at: at(k * w * 0.31, g + h * 0.58, d / 2 + 0.003), rot })),
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
  // ---- The toy tray round the board (the Thailand map's); Nan's ground is built below, once the trees are planted ----
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  root.add(solid(merge(trayParts(W, D, PAPER_Y + 0.07, 0.2, 0.55)), bag, 2))
  const river = smoothLine(RIVER)
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

  // ---- Mountains and trees on the hills, away from the roads, the river and the places (the Thailand map's) ----
  const away = (x: number, z: number, road = 0.12, place = 0.36) =>
    inNan(x, z) > 0.06 &&
    !net.lines.some((l) => l.some(([px, pz], i) => i % 3 === 0 && Math.hypot(px - x, pz - z) < road)) &&
    !river.some(([px, pz], i) => i % 3 === 0 && Math.hypot(px - x, pz - z) < 0.16) &&
    !(Object.keys(PLACES) as PlaceId[]).some((id) => Math.hypot(modelAt(id)[0] - x, modelAt(id)[1] - z) < place || Math.hypot(PLACES[id].at[0] - x, PLACES[id].at[1] - z) < 0.2) &&
    Math.hypot(RUNWAY.at[0] - x, RUNWAY.at[1] - z) > 0.65
  const shadows: [number, number, number][] = []
  const peaks: [number, number, number][] = []
  const mountains: BufferGeometry[] = []
  for (const [x, z, r, h] of MOUNTAINS) {
    if (!away(x, z, 0.06 + r * 0.8, 0.25 + r)) continue
    peaks.push([x, z, r])
    shadows.push([x, z, r * 1.25])
    mountains.push(...mountainParts(x, y(x, z), z, r, h, peaks.length))
  }
  const trees: BufferGeometry[] = []
  const spots: [number, number][] = []
  let seed = 17
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 3000 && spots.length < 150; i++) {
    const x = BOARD.x0 + 0.2 + rnd() * (W - 0.4)
    const z = BOARD.z0 + 0.15 + rnd() * (D - 0.3)
    // Forest up the hills, a few trees dotted on the flat.
    if ((hillAt(x, z) < 0.07 && rnd() > 0.04) || !away(x, z) || peaks.some(([px, pz, r]) => Math.hypot(px - x, pz - z) < r * 1.05)) continue
    if (spots.some(([sx, sz]) => Math.hypot(sx - x, sz - z) < 0.08)) continue
    spots.push([x, z])
    const s = 0.48 + rnd() * 0.26
    trees.push(...treeParts(x, y(x, z), z, s, i))
    shadows.push([x, z, 0.11 * s + 0.02])
  }
  root.add(solid(merge(mountains), bag, 1.5), solid(merge(trees), bag, 1.5))
  const ids = Object.keys(PLACES) as PlaceId[]
  for (const id of ids) shadows.push([...modelAt(id), id === 'town' ? 0.42 : 0.3])
  const keep = [...ids.map((id) => [...modelAt(id), 0.33] as [number, number, number]), [RUNWAY.at[0], RUNWAY.at[1], 0.62] as [number, number, number], ...peaks]
  root.add(buildGround(bag, { river, roads: net.lines, shadows, keep }))
  const glints = riverGlints(bag, river)
  root.add(glints.mesh)

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
  // The mushroom farm: a cottage with a giant spotty mushroom growing up behind it, little ones round about, and
  // rows of sawdust bags (where the mushrooms grow).
  const [mx, mz] = at('mushrooms')
  const mg = y(mx, mz)
  const cap = (cx: number, cy: number, cz: number, r: number, color: string, spots: number) => [
    P.sphere(r, color, { at: [cx, cy, cz], scale: [1, 0.62, 1] }, 16),
    P.cyl(r * 0.92, r * 0.92, 0.008, '#FFE3EC', { at: [cx, cy - 0.004, cz] }, 16),
    ...Array.from({ length: spots }, (_, k) => {
      const a = k * 2.4 + 0.3
      const t = k === 0 ? 0 : 0.55 + (k % 3) * 0.18
      return P.sphere(r * 0.17, '#FFFFFF', { at: [cx + Math.cos(a) * Math.sin(t) * r * 0.98, cy + Math.cos(t) * r * 0.62 - 0.002, cz + Math.sin(a) * Math.sin(t) * r * 0.98], scale: [1, 0.45, 1] }, 8)
    }),
  ]
  const shroom = [
    ...house(mx - 0.06, mz + 0.03, 0.22, 0.16, 0.13, '#FFF4E6', '#C98E6A'),
    P.cyl(0.04, 0.055, 0.27, '#FFF1E2', { at: [mx + 0.12, mg + 0.135, mz - 0.07] }, 14),
    ...cap(mx + 0.12, mg + 0.3, mz - 0.07, 0.15, PAL.hotpink, 7),
    // Rows of sawdust bags by the house.
    ...[0, 1, 2].map((k) => P.capsule(0.02, 0.04, '#E9E1D2', { at: [mx + 0.2, mg + 0.03, mz + 0.03 + k * 0.055], rot: [0, 0, Math.PI / 2] })),
    ...[[-0.2, 0.12, 0.03], [-0.15, 0.16, 0.024], [0.1, 0.15, 0.028], [-0.21, -0.05, 0.026], [0.02, -0.12, 0.022]].flatMap(([dx, dz, r], k) => [
      P.cyl(0.007, 0.01, r * 1.3, '#FFF1E2', { at: [mx + dx, mg + r * 0.65, mz + dz] }, 6),
      ...cap(mx + dx, mg + r * 1.3, mz + dz, r, k % 2 ? PAL.pink : PAL.hotpink, 0),
    ]),
  ]
  // Stop Time Cafe on top of the rice steps.
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
      P.cyl(r, r + 0.012, 0.05, k % 2 ? '#8FD67C' : '#A2E08A', { at: [rx, rg + 0.025 + k * 0.05, cz], scale: [1.15, 1, 0.8] }, 24),
      P.cyl(r - 0.025, r - 0.025, 0.006, k === 2 ? '#F3E3A0' : '#C3E9F7', { at: [rx, rg + 0.051 + k * 0.05, cz], scale: [1.15, 1, 0.8] }, 24),
      ...[-0.9, -0.5, -0.15, 0.2, 0.55, 0.9].map((a) => P.cone(0.012, 0.032, '#6FBF7F', { at: [rx + Math.sin(a) * (r - 0.012) * 1.15, rg + 0.066 + k * 0.05, cz + Math.cos(a) * (r - 0.012) * 0.8] }, 5)),
    )
  }
  rz -= 0.14
  const top = rg + 0.25
  const rice = [
    ...steps,
    P.rbox(0.22, 0.014, 0.15, 0.005, WOOD, { at: [rx, top + 0.007, rz + 0.02] }),
    P.rbox(0.15, 0.08, 0.1, 0.012, '#F2D3A8', { at: [rx, top + 0.054, rz - 0.01] }),
    P.prism([[-0.1, 0], [0.1, 0], [0, 0.07]], 0.14, '#C98E6A', { at: [rx, top + 0.092, rz - 0.01] }),
    P.rbox(0.03, 0.05, 0.008, 0.003, '#B07A58', { at: [rx, top + 0.039, rz + 0.042] }),
    ...[-1, 1].map((k) => P.rbox(0.03, 0.024, 0.008, 0.003, '#DDF3FF', { at: [rx + k * 0.045, top + 0.06, rz + 0.042] })),
    // The deck's railing and a pink umbrella over a table.
    ...[-0.1, -0.05, 0, 0.05, 0.1].map((dx) => P.cyl(0.004, 0.004, 0.03, WOOD_DARK, { at: [rx + dx, top + 0.03, rz + 0.09] }, 5)),
    P.box(0.21, 0.006, 0.008, WOOD_DARK, { at: [rx, top + 0.045, rz + 0.09] }),
    P.cyl(0.003, 0.003, 0.07, '#FFFFFF', { at: [rx + 0.075, top + 0.04, rz + 0.055] }, 5),
    P.cone(0.04, 0.025, PAL.pink, { at: [rx + 0.075, top + 0.085, rz + 0.055] }, 10),
  ]
  // Bo Kluea's salt wells: a thatched hut on stilts, the big pan steaming in front over its little fire, white piles of
  // salt and the well with its bucket.
  const [sx, sz] = at('salt')
  const sg = y(sx, sz)
  const salt = [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.009, 0.009, 0.15, WOOD_DARK, { at: [sx + a * 0.11, sg + 0.075, sz - 0.05 + b * 0.065] }, 6)),
    P.rbox(0.25, 0.016, 0.16, 0.005, WOOD, { at: [sx, sg + 0.05, sz - 0.05] }),
    P.prism([[-0.16, 0], [0.16, 0], [0, 0.1]], 0.22, '#E9C98F', { at: [sx, sg + 0.15, sz - 0.05] }),
    P.box(0.012, 0.012, 0.23, '#C9A46C', { at: [sx, sg + 0.248, sz - 0.05] }),
    // The pan on its brick stove, a fire under it.
    P.rbox(0.17, 0.05, 0.12, 0.015, '#E8A487', { at: [sx, sg + 0.025, sz + 0.03] }),
    P.cyl(0.075, 0.068, 0.022, '#C9CFDA', { at: [sx, sg + 0.06, sz + 0.03] }, 20),
    P.cyl(0.064, 0.064, 0.006, '#FFFFFF', { at: [sx, sg + 0.07, sz + 0.03] }, 20),
    P.cone(0.018, 0.035, '#FFB347', { at: [sx - 0.03, sg + 0.022, sz + 0.093] }, 7),
    P.cone(0.012, 0.025, '#FF7A59', { at: [sx + 0.02, sg + 0.018, sz + 0.093] }, 7),
    // Salt piles and a basket.
    ...[[0.15, 0.1, 0.035], [0.19, 0.04, 0.028], [-0.16, 0.12, 0.03]].map(([dx, dz, r]) => P.sphere(r, '#FFFFFF', { at: [sx + dx, sg + r * 0.45, sz + dz], scale: [1, 0.75, 1] }, 10)),
    P.cyl(0.04, 0.032, 0.05, '#D9B98A', { at: [sx - 0.17, sg + 0.025, sz + 0.04] }, 12),
    // The well: two posts, a beam, the bucket on its rope.
    ...[-1, 1].map((k) => P.cyl(0.007, 0.007, 0.13, WOOD_DARK, { at: [sx + 0.17 + k * 0.035, sg + 0.065, sz - 0.12] }, 6)),
    P.cyl(0.006, 0.006, 0.09, WOOD_DARK, { at: [sx + 0.17, sg + 0.13, sz - 0.12], rot: [0, 0, Math.PI / 2] }, 6),
    P.cyl(0.032, 0.032, 0.03, '#B8A5D8', { at: [sx + 0.17, sg + 0.015, sz - 0.12] }, 12),
    P.cyl(0.018, 0.015, 0.025, '#9C7250', { at: [sx + 0.17, sg + 0.08, sz - 0.12] }, 10),
  ]
  // Nan town: pastel houses round the market, its little umbrellas over the stalls.
  const [tx, tz] = at('town')
  const tg = y(tx, tz)
  const town = [
    ...house(tx - 0.13, tz - 0.12, 0.13, 0.1, 0.09, '#FFE9D9', ROOF, 0.2),
    ...house(tx + 0.08, tz - 0.16, 0.12, 0.1, 0.12, '#FFD9E6', '#E86A8E', -0.1),
    ...house(tx + 0.21, tz - 0.02, 0.12, 0.09, 0.08, '#FFF4CF', '#F59E5B', 0.4),
    ...house(tx - 0.21, tz + 0.06, 0.11, 0.09, 0.08, '#E4F4E8', '#5FBF8F', -0.3),
    ...house(tx + 0.07, tz + 0.15, 0.13, 0.09, 0.09, '#E7E0FF', '#9C8BE0', 0.1),
    // The market: little umbrellas over the stalls.
    ...[[-0.05, 0.03, PAL.pink], [0.06, 0.03, PAL.mint], [0.0, -0.04, PAL.butter]].flatMap(([dx, dz, c]) => [
      P.rbox(0.05, 0.025, 0.035, 0.006, '#FFF7F0', { at: [tx + (dx as number), tg + 0.0125, tz + (dz as number)] }),
      P.cyl(0.004, 0.004, 0.07, '#EDEAF2', { at: [tx + (dx as number), tg + 0.035, tz + (dz as number)] }),
      P.cone(0.05, 0.03, c as string, { at: [tx + (dx as number), tg + 0.08, tz + (dz as number)] }, 10),
    ]),
  ]
  // The airport: a pastel terminal with a pink roof, its control tower and windsock, and the runway with its lights.
  const [ax, az] = at('airport')
  const ag = y(ax, az)
  const rw = RUNWAY
  const along = (k: number, off = 0, lift = 0): [number, number, number] => {
    const px = rw.at[0] + Math.cos(rw.yaw) * k * rw.len + Math.sin(rw.yaw) * off
    const pz = rw.at[1] - Math.sin(rw.yaw) * k * rw.len + Math.cos(rw.yaw) * off
    return [px, y(px, pz) + lift, pz]
  }
  const runway = [
    P.rbox(rw.len, 0.014, rw.w, 0.006, '#7A7390', { at: along(0, 0, 0.007), rot: [0, rw.yaw, 0] }),
    ...[-0.4, -0.2, 0, 0.2, 0.4].map((k) => P.box(0.1, 0.004, 0.016, '#FFFFFF', { at: along(k, 0, 0.016), rot: [0, rw.yaw, 0] })),
    ...[-0.46, -0.3, -0.15, 0, 0.15, 0.3, 0.46].flatMap((k) => [-1, 1].map((sd) => P.sphere(0.009, k === -0.46 || k === 0.46 ? PAL.hotpink : PAL.butter, { at: along(k, sd * (rw.w / 2 - 0.012), 0.018) }, 6))),
  ]
  const airport = [
    P.rbox(0.32, 0.09, 0.15, 0.025, '#FFF7F0', { at: [ax, ag + 0.045, az] }),
    P.rbox(0.28, 0.035, 0.01, 0.006, '#BFE2FA', { at: [ax, ag + 0.055, az + 0.076] }),
    P.rbox(0.36, 0.024, 0.19, 0.01, '#FF9DC0', { at: [ax, ag + 0.1, az] }),
    P.rbox(0.05, 0.05, 0.012, 0.006, '#DDF3FF', { at: [ax - 0.1, ag + 0.025, az + 0.078] }),
    P.cyl(0.022, 0.028, 0.22, '#FFF7F0', { at: [ax + 0.22, ag + 0.11, az - 0.02] }, 12),
    P.cyl(0.046, 0.04, 0.045, '#BFE2FA', { at: [ax + 0.22, ag + 0.24, az - 0.02] }, 12),
    P.cone(0.052, 0.04, PAL.hotpink, { at: [ax + 0.22, ag + 0.282, az - 0.02] }, 12),
    // The windsock.
    P.cyl(0.004, 0.004, 0.13, '#EDEAF2', { at: [ax - 0.22, ag + 0.065, az + 0.04] }, 5),
    P.cone(0.016, 0.06, '#FF8A4D', { at: [ax - 0.19, ag + 0.12, az + 0.04], rot: [0, 0, Math.PI / 2 + 0.25] }, 8),
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
    const x = LAOS_X + 0.12 + Math.sin(z * 2.3) * 0.03
    posts.push(P.cyl(0.01, 0.012, 0.06, '#FFFFFF', { at: [x, y(x, z) + 0.03, z] }, 6), P.cyl(0.0105, 0.0105, 0.012, '#E8404E', { at: [x, y(x, z) + 0.055, z] }, 6))
  }
  root.add(solid(merge(posts), bag, 1))

  // ---- The little Pajero ----
  const car = buildPajero(bag)
  car.root.scale.setScalar(CAR_SCALE)
  root.add(car.root)

  return { root, places, stamps, plane, clouds, fish, buffalo, flags: { thai, laos }, car, steam: [sx, sg + 0.1, sz + 0.04], river, water: glints.update }
}
