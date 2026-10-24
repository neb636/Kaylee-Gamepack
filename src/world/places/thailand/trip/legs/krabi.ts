// Krabi, the 3-second hand-off between the runway and the pier (plan: "Lands at"): the arrivals arch in front of the
// little airport, with a real Thai roof (two tiers of orange tiles edged in green, gold trim along the gables and a
// golden chofa curling up from each peak), palms either side, rock towers behind, and the songthaew at the curb that
// takes the family to the pier. Built for the plane's world (plane.ts cuts here behind a white flash). Faces +z (the
// camera stands on the road side). Down the road, where a side road turns off into the palms, a signpost with two
// painted boards (pictures, no words): an elephant pointing up the side road to Baan Chang, a longtail pointing on along
// the road to the pier (the boat trip's fork, plan: thailand/baan-chang.md).
import { Group } from 'three'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { PAL } from '../../engine/toon'
import { buildSongthaew, type Songthaew } from '../vehicles/songthaew'

const TILE = '#FF8A4D'
const TILE_EDGE = '#5FBF8F'
const GOLD = PAL.gold
const WALL = '#FFF7F0'
const ROCK = '#C9C1D9'
const JUNGLE = '#6FBF7F'

export interface Arrival {
  root: Group
  songthaew: Songthaew
  /** Where the songthaew waits at the curb (local x), and the road's z. */
  curbX: number
  roadZ: number
  /** The fork: the side road's middle (local x, where the songthaew stops to turn into it), and the signpost's two
   *  boards (their middles, local). */
  forkX: number
  boards: { chang: V3; pier: V3 }
}

/** A painted board on the signpost: a cream plank with an arrow tip on one end (`dir` -1 points left, 1 right). */
function board(x: number, y: number, z: number, dir: number, color: string) {
  const w = 1.5
  const h = 0.62
  return [
    P.rbox(w, h, 0.08, 0.06, color, { at: [x, y, z] }),
    P.prism([[0, -h / 2 - 0.1], [0, h / 2 + 0.1], [dir * 0.42, 0]], 0.08, color, { at: [x + (dir * w) / 2 - dir * 0.02, y, z] }),
    P.rbox(w - 0.16, h - 0.16, 0.02, 0.04, PAL.cream, { at: [x, y, z + 0.045] }),
  ]
}
/** The elephant painted on its board (facing the way it points, so it walks off up the side road). */
function elephantPicture(x: number, y: number, z: number, dir: number) {
  const g = '#A9A3B8'
  return [
    P.sphere(0.2, g, { at: [x - dir * 0.12, y - 0.02, z], scale: [1.3, 0.95, 0.3] }, 12),
    P.sphere(0.15, g, { at: [x + dir * 0.18, y + 0.06, z + 0.02], scale: [1, 1, 0.3] }, 12),
    P.sphere(0.11, '#FFB3D1', { at: [x + dir * 0.08, y + 0.08, z + 0.05], scale: [0.7, 1, 0.2] }, 10),
    P.capsule(0.04, 0.16, g, { at: [x + dir * 0.33, y - 0.06, z + 0.02], rot: [0, 0, dir * 0.4] }),
    ...[-0.24, -0.02].map((dx) => P.box(0.07, 0.14, 0.04, g, { at: [x - dir * 0.12 + dx * dir, y - 0.2, z] })),
    P.sphere(0.022, '#2E2233', { at: [x + dir * 0.22, y + 0.1, z + 0.07] }, 6),
  ]
}
/** The longtail painted on its board: a hull with its ribbons on the bow, and the long engine pole at the stern. */
function longtailPicture(x: number, y: number, z: number, dir: number) {
  return [
    P.prism([[-0.42, 0.02], [0.3, 0.02], [0.46, 0.14], [0.26, -0.12], [-0.36, -0.12]].map(([px, py]) => [px * dir, py] as [number, number]), 0.04, '#C99A6E', { at: [x, y - 0.04, z + 0.02] }),
    P.box(0.04, 0.22, 0.03, '#7A5A3A', { at: [x + dir * 0.4, y + 0.16, z + 0.03], rot: [0, 0, -dir * 0.3] }),
    ...['#FF4F9A', '#FFC83D', '#8FE3C8'].map((c, i) => P.box(0.05, 0.12, 0.02, c, { at: [x + dir * (0.43 + i * 0.03), y + 0.18 - i * 0.03, z + 0.05] })),
    P.cyl(0.015, 0.015, 0.5, '#5E5872', { at: [x - dir * 0.52, y - 0.08, z + 0.03], rot: [0, 0, dir * 1.25] }, 6),
    P.box(0.9, 0.05, 0.02, '#7FC8F0', { at: [x, y - 0.17, z + 0.02] }),
  ]
}

/** One tier of a Thai roof over a box `w` wide (x) and `d` deep (z), its eaves at `y`, its ridge `rise` higher. */
function tier(w: number, d: number, y: number, rise: number) {
  const half = d / 2 + 0.25
  const slope = Math.hypot(half, rise)
  const tilt = Math.atan2(rise, half)
  const parts = []
  for (const s of [-1, 1]) {
    // A slope of tiles, a green band along its eave and a gold line along its foot.
    const at: V3 = [0, y + rise / 2, (s * half) / 2]
    parts.push(P.box(w + 0.5, 0.1, slope, TILE, { at, rot: [s * tilt, 0, 0] }))
    parts.push(P.box(w + 0.52, 0.12, 0.22, TILE_EDGE, { at: [0, y + 0.06, s * (half - 0.08)], rot: [s * tilt, 0, 0] }))
  }
  // The gable ends: gold triangles, the gold barge boards along their edges, and a chofa at each peak.
  for (const sx of [-1, 1]) {
    const x = sx * (w / 2 + 0.2)
    parts.push(P.prism([[-half + 0.12, 0], [half - 0.12, 0], [0, rise - 0.06]], 0.06, GOLD, { at: [x, y + 0.02, 0], rot: [0, Math.PI / 2, 0] }))
    for (const s of [-1, 1]) {
      parts.push(P.box(0.1, 0.12, slope + 0.2, GOLD, { at: [x + sx * 0.06, y + rise / 2 + 0.06, (s * half) / 2], rot: [s * tilt, 0, 0] }))
      // The little hooks where the barge boards end (the naga's tail).
      parts.push(P.cone(0.07, 0.24, GOLD, { at: [x + sx * 0.06, y + 0.12, s * (half + 0.08)], rot: [s * -0.9, 0, 0] }))
    }
    // The chofa: a slender golden horn curling up and out from the peak.
    parts.push(P.capsule(0.05, 0.22, GOLD, { at: [x + sx * 0.12, y + rise + 0.14, 0], rot: [0, 0, -sx * 0.5] }))
    parts.push(P.cone(0.05, 0.22, GOLD, { at: [x + sx * 0.3, y + rise + 0.36, 0], rot: [0, 0, -sx * 1.1] }))
  }
  // The ridge.
  parts.push(P.box(w + 0.5, 0.1, 0.14, TILE_EDGE, { at: [0, y + rise + 0.02, 0] }))
  return parts
}

/** The side road's middle (local x). */
const FORK_X = 8.4

export function buildArrival(bag: Bag): Arrival {
  const root = new Group()
  const roadZ = 1.6
  // ---- The ground: the road with its dashes, the curb, and grass ----
  root.add(
    solid(
      merge([
        P.box(70, 0.1, 6, '#C9C4DE', { at: [0, -0.05, roadZ] }),
        ...Array.from({ length: 14 }, (_, i) => P.box(1.4, 0.01, 0.14, PAL.butter, { at: [-30 + i * 4.6, 0.005, roadZ + 0.4] })),
        // The curb, with a gap where the side road turns off into the palms.
        P.box(35 + FORK_X - 1.9, 0.18, 1.0, '#E8E2F4', { at: [(-35 + FORK_X - 1.9) / 2, 0.09, -1.75] }),
        P.box(35 - FORK_X - 1.9, 0.18, 1.0, '#E8E2F4', { at: [(35 + FORK_X + 1.9) / 2, 0.09, -1.75] }),
        P.box(70, 0.1, 30, '#A9E3B8', { at: [0, -0.04, -17.2] }),
        P.box(3.6, 0.1, 30, '#C9C4DE', { at: [FORK_X, -0.035, -16.4] }),
      ]),
      bag,
      0,
    ),
  )
  // ---- The arrivals arch: a white pavilion on four pillars with a two-tier Thai roof ----
  const W = 6.2
  const D = 2.6
  const z0 = -3.6
  const arch = new Group()
  arch.position.set(0, 0, z0)
  arch.add(
    solid(
      merge([
        P.box(W + 1.2, 0.24, D + 1.0, '#F4EEFF', { at: [0, 0.12, 0] }),
        ...[-1, 1].flatMap((sz) => [-W / 2 + 0.3, -W / 6, W / 6, W / 2 - 0.3].map((x) => P.cyl(0.17, 0.2, 2.5, WALL, { at: [x, 1.49, sz * (D / 2 - 0.2)] }, 14))),
        // Gold collars on the pillars, the beam with its gold and pink trim, and the back wall with a big glass door.
        ...[-1, 1].flatMap((sz) => [-W / 2 + 0.3, -W / 6, W / 6, W / 2 - 0.3].map((x) => P.cyl(0.22, 0.22, 0.12, GOLD, { at: [x, 2.62, sz * (D / 2 - 0.2)] }, 14))),
        P.box(W + 0.3, 0.42, D + 0.1, WALL, { at: [0, 2.9, 0] }),
        P.box(W + 0.32, 0.08, D + 0.12, GOLD, { at: [0, 2.72, 0] }),
        P.box(W + 0.32, 0.08, D + 0.12, PAL.pink, { at: [0, 3.07, 0] }),
        P.box(W - 0.4, 2.4, 0.16, '#FFE8DE', { at: [0, 1.44, -D / 2 + 0.05] }),
        P.box(1.9, 2.0, 0.05, '#CDEBFF', { at: [0, 1.24, -D / 2 + 0.15] }),
        P.box(0.06, 2.0, 0.06, '#D8D2E6', { at: [0, 1.24, -D / 2 + 0.18] }),
        // A big round sign with a plane on it (no words), hanging under the beam.
        P.cyl(0.42, 0.42, 0.08, PAL.sky, { at: [0, 2.15, D / 2 - 0.05], rot: [Math.PI / 2, 0, 0] }, 24),
        P.box(0.5, 0.08, 0.04, '#FFFFFF', { at: [0, 2.15, D / 2 + 0.01] }),
        P.box(0.08, 0.36, 0.04, '#FFFFFF', { at: [-0.05, 2.15, D / 2 + 0.01] }),
        P.box(0.06, 0.16, 0.04, '#FFFFFF', { at: [0.22, 2.22, D / 2 + 0.01] }),
        // Two tiers of roof: the low wide one, and a narrower one above it.
        ...tier(W, D, 3.12, 1.1),
        ...tier(W * 0.62, D * 0.7, 3.82, 1.05),
        // Orchids in pots either side of the steps.
        ...[-1, 1].flatMap((s) => [
          P.cyl(0.22, 0.17, 0.36, '#C9B5F7', { at: [s * (W / 2 + 0.25), 0.42, D / 2 + 0.25] }),
          P.sphere(0.3, '#7FCB8F', { at: [s * (W / 2 + 0.25), 0.78, D / 2 + 0.25] }),
          ...[0, 2.1, 4.2].map((a) => P.sphere(0.09, PAL.hotpink, { at: [s * (W / 2 + 0.25) + Math.cos(a) * 0.2, 0.95, D / 2 + 0.25 + Math.sin(a) * 0.2] })),
        ]),
      ]),
      bag,
      2,
    ),
  )
  root.add(arch)
  // ---- Palms either side and the rock towers of Krabi behind ----
  const palm = (x: number, z: number, h: number) => [
    P.cyl(0.1, 0.16, h, '#C99A6E', { at: [x, h / 2, z] }, 10),
    ...Array.from({ length: 5 }, (_, i) => P.torus(0.13 - i * 0.008, 0.025, '#A97C54', { at: [x, (h / 6) * (i + 1), z], rot: [Math.PI / 2, 0, 0] })),
    ...Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2
      return P.sphere(0.9, '#5FBF7F', { at: [x + Math.cos(a) * 0.75, h + 0.05, z + Math.sin(a) * 0.75], rot: [Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6], scale: [1, 0.16, 0.36] })
    }),
    P.sphere(0.2, '#7A5A3A', { at: [x, h - 0.05, z] }),
  ]
  root.add(solid(merge([...palm(-5.6, -2.0, 4.6), ...palm(5.8, -2.6, 5.2), ...palm(-9.5, -4.5, 5.6), ...palm(11.6, -3.4, 4.2), ...palm(5.6, -9, 4.8), ...palm(11.4, -10.5, 5.4)]), bag, 2))
  // ---- The signpost on the corner past the side road: 🐘 up the side road (left), 🚤 on along the road (right) ----
  const post = { x: FORK_X + 2.5, z: -1.55 }
  const boards = { chang: [post.x - 0.55, 2.25, post.z + 0.08] as V3, pier: [post.x + 0.55, 1.5, post.z + 0.08] as V3 }
  root.add(
    solid(
      merge([
        P.cyl(0.07, 0.08, 2.75, '#8C6A55', { at: [post.x, 1.37, post.z] }, 8),
        P.sphere(0.09, '#8C6A55', { at: [post.x, 2.76, post.z] }, 8),
        ...board(...boards.chang, -1, PAL.pink),
        ...elephantPicture(boards.chang[0] - 0.05, boards.chang[1], boards.chang[2] + 0.06, -1),
        ...board(...boards.pier, 1, PAL.sky),
        ...longtailPicture(boards.pier[0] + 0.02, boards.pier[1], boards.pier[2] + 0.06, 1),
      ]),
      bag,
      2,
    ),
  )
  const towers = []
  for (let i = 0; i < 9; i++) {
    const x = -34 + i * 8.5 + (i % 2) * 2
    const z = -34 - (i % 3) * 7
    const h = 10 + ((i * 7) % 5) * 2.6
    const r = 3.2 + (i % 3) * 0.9
    // A tower straight up out of the ground, a darker notch at its foot, and a cap of jungle.
    towers.push(P.cyl(r * 0.92, r, h, ROCK, { at: [x, h / 2, z] }, 12), P.cyl(r * 1.02, r * 1.04, 0.6, '#A79FC2', { at: [x, 0.3, z] }, 12), P.sphere(r * 1.05, JUNGLE, { at: [x, h, z], scale: [1, 0.55, 1] }, 14))
  }
  root.add(solid(merge(towers), bag, 2))
  // ---- The songthaew at the curb ----
  const songthaew = buildSongthaew(bag)
  const curbX = -2.4
  songthaew.root.position.set(curbX, 0, roadZ - 0.6)
  root.add(songthaew.root)
  return { root, songthaew, curbX, roadZ, forkX: FORK_X, boards }
}
