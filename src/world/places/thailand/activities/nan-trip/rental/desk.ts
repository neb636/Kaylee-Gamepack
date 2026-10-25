// The rental desk's shapes (layout.ts says where), in the house's toon look: the arrivals hall's tiled floor and its
// back wall with big windows, the rental counter with the clerk behind it (a puppy in a blue shirt and a scarf), the bell
// and a pot of orchids on the counter, a rack of folded maps, a poster of a mountain on the wall; outside, the car park
// with its white lines, a grass verge and Nan's green mountains far behind. And the things she uses: the key fob, her
// pink suitcase, Mommy's bag and Daddy's backpack. GREYBOX (step 6): shapes, no painted art.
import { Group } from 'three'
import { buildAnimal, type Rig } from '../../../characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../engine/dispose'
import { blobShadow, merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { buildSuitcase } from '../../../trip/props'
import { BELL, CLERK_AT, COUNTER, MAPS, ORCHIDS, POSTER, WALL } from './layout'

/** The rental clerk: a puppy in a blue shirt with a little scarf (not family: the airport's rental desk, a placeholder
 *  animal like the farm aunties, for Dad to pick). */
export const CLERK: Look = { species: 'puppy', height: 1.25, fur: '#E9C79A', light: '#FFF4E4', dark: '#6A4E46', ear: '#C99564', outfit: { kind: 'shirt', color: '#5D7BB0' }, extras: ['scarf'], open: true }

const FLOOR = '#F3EEF8'
const TILE = '#E6DDF2'
const WALL_C = '#EADFF7'
const WINDOW = '#CDEBFF'
const WOOD = '#C99A6E'

export interface Desk {
  root: Group
  clerk: Rig
  bell: Group
  orchids: Group
  maps: Group
  /** The map that flaps open when she pokes the rack. */
  map: Group
  poster: Group
  fob: Group
  /** Her suitcase, Mommy's bag, Daddy's backpack (each faces +z; its origin at its bottom). */
  bags: Group[]
}

export function buildDesk(bag: Bag): Desk {
  const root = new Group()

  // ---- The hall's floor and back wall, the car park outside, the hills far behind ----
  const tiles = []
  for (let x = WALL.x0 + 0.5; x < WALL.x1; x += 1) for (let z = WALL.z + 0.5; z < 1.6; z += 1) if ((Math.round(x - 0.5) + Math.round(z - 0.5)) % 2) tiles.push(P.box(0.98, 0.005, 0.98, TILE, { at: [x, 0.004, z] }))
  root.add(solid(merge([
    P.box(WALL.x1 - WALL.x0, 0.1, 4.2, FLOOR, { at: [(WALL.x0 + WALL.x1) / 2, -0.05, WALL.z + 2.1] }),
    ...tiles,
    // The car park: grey with white lines, a curb along the hall, a grass verge behind it.
    P.box(14, 0.1, 6, '#C3BDD0', { at: [WALL.x1 + 7, -0.06, -1.1] }),
    P.box(0.18, 0.12, 4.2, '#E8E2F0', { at: [WALL.x1 + 0.09, 0.0, WALL.z + 2.1] }),
    ...[2.0, 6.6, 9.4].map((x) => P.box(0.08, 0.01, 2.6, '#FFFFFF', { at: [x, 0.0, -1.6] })),
    P.box(16, 0.1, 6, '#9ED69A', { at: [WALL.x1 + 6, -0.07, -7] }),
    P.box(WALL.x1 - WALL.x0 + 4, 0.1, 6, '#9ED69A', { at: [(WALL.x0 + WALL.x1) / 2, -0.07, WALL.z - 3] }),
  ]), bag, 0))
  // The back wall with its windows, and a strip of roof along its top.
  const wallH = 2.8
  const panes = []
  for (let x = WALL.x0 + 1.9; x < WALL.x1 - 0.4; x += 1.25) panes.push(P.box(1.0, 1.35, 0.03, WINDOW, { at: [x, 1.55, WALL.z + 0.08] }))
  root.add(solid(merge([
    P.box(WALL.x1 - WALL.x0, wallH, 0.14, WALL_C, { at: [(WALL.x0 + WALL.x1) / 2, wallH / 2, WALL.z] }),
    P.box(WALL.x1 - WALL.x0 + 0.3, 0.22, 0.5, PAL.lavenderDark, { at: [(WALL.x0 + WALL.x1) / 2, wallH + 0.1, WALL.z + 0.1] }),
    P.box(0.3, wallH + 0.2, 0.3, PAL.lavenderDark, { at: [WALL.x1, (wallH + 0.2) / 2, WALL.z] }),
    ...panes,
  ]), bag, 2))
  // Nan's green mountains, far off, with a cloud on one.
  root.add(solid(merge([
    ...[[-6, 9, 4.2], [1, 11, 5.5], [9, 10, 4.6], [16, 8, 3.8], [-13, 7, 3.6]].map(([x, r, h]) => P.sphere(r, '#8CC98E', { at: [x, -r * 0.55 + h, -26], scale: [1, 0.6, 0.5] }, 20)),
    P.sphere(2.2, '#FFFFFF', { at: [1.5, 6.4, -24], scale: [1.8, 0.6, 0.6] }),
  ]), bag, 2))

  // ---- The counter, with a picture of a key on its front ----
  const cw = COUNTER.x1 - COUNTER.x0
  const cx = (COUNTER.x0 + COUNTER.x1) / 2
  root.add(solid(merge([
    P.rbox(cw, COUNTER.h - 0.06, COUNTER.d, 0.05, PAL.cream, { at: [cx, (COUNTER.h - 0.06) / 2, COUNTER.z] }),
    P.rbox(cw + 0.1, 0.07, COUNTER.d + 0.12, 0.03, WOOD, { at: [cx, COUNTER.h - 0.035, COUNTER.z] }),
    P.box(cw, 0.12, 0.01, PAL.hotpink, { at: [cx, 0.7, COUNTER.z + COUNTER.d / 2 + 0.005] }),
    P.torus(0.07, 0.025, PAL.gold, { at: [cx - 0.12, 0.42, COUNTER.z + COUNTER.d / 2 + 0.01] }),
    P.box(0.22, 0.04, 0.02, PAL.gold, { at: [cx + 0.06, 0.42, COUNTER.z + COUNTER.d / 2 + 0.01] }),
    ...[0.12, 0.17].map((x) => P.box(0.03, 0.06, 0.02, PAL.gold, { at: [cx + x, 0.38, COUNTER.z + COUNTER.d / 2 + 0.01] })),
    // A little screen and a pen pot behind the counter's top.
    P.rbox(0.36, 0.26, 0.04, 0.02, '#4A4458', { at: [cx - 0.3, COUNTER.h + 0.18, COUNTER.z - 0.18], rot: [-0.2, 0.3, 0] }),
  ]), bag, 2))
  root.add(solid(P.rbox(cw - 0.2, CLERK_AT[1], 0.7, 0.04, WOOD, { at: [cx, CLERK_AT[1] / 2, CLERK_AT[2]] }), bag, 2))
  const clerk = buildAnimal(CLERK, bag)
  clerk.root.position.set(...CLERK_AT)
  root.add(clerk.root)

  // ---- The bell, the orchids, the rack of maps, the poster ----
  const bell = new Group()
  bell.position.set(...BELL)
  bell.add(solid(merge([P.cyl(0.07, 0.08, 0.02, '#4A4458', { at: [0, 0.01, 0] }), P.sphere(0.06, PAL.gold, { at: [0, 0.02, 0], scale: [1, 0.85, 1] }), P.sphere(0.015, PAL.gold, { at: [0, 0.075, 0] })]), bag, 2))
  root.add(bell)
  const orchids = new Group()
  orchids.position.set(...ORCHIDS)
  orchids.add(solid(merge([
    P.cyl(0.07, 0.055, 0.12, '#FFFFFF', { at: [0, 0.06, 0] }),
    ...[-0.04, 0.03].map((x, i) => P.cyl(0.005, 0.005, 0.3, '#6FBF7F', { at: [x, 0.25, 0], rot: [0, 0, (i ? -1 : 1) * 0.15] })),
    ...[[-0.06, 0.36], [-0.03, 0.4], [0.02, 0.33], [0.06, 0.38], [0.0, 0.43]].map(([x, y], i) => P.sphere(0.03, i % 2 ? '#C77DF0' : PAL.pink, { at: [x, y, 0.02], scale: [1, 0.8, 0.5] }, 10)),
    P.sphere(0.06, '#6FBF7F', { at: [0, 0.13, 0], scale: [1.4, 0.35, 1] }, 10),
  ]), bag, 2))
  root.add(orchids)
  const maps = new Group()
  maps.position.set(...MAPS)
  maps.add(solid(merge([
    P.box(0.04, 1.2, 0.04, '#7A7290', { at: [0, 0.6, 0] }),
    P.cyl(0.2, 0.22, 0.04, '#7A7290', { at: [0, 0.02, 0] }),
    P.box(0.5, 0.6, 0.05, '#B9A6F5', { at: [0, 0.95, 0.03] }),
    ...[0, 1, 2].map((i) => P.box(0.12, 0.17, 0.02, [PAL.mint, PAL.butter, PAL.sky][i], { at: [-0.15 + i * 0.15, 0.85, 0.07] })),
  ]), bag, 2))
  const map = new Group()
  map.position.set(0.0, 1.1, 0.08)
  map.add(solid(merge([P.box(0.13, 0.17, 0.02, PAL.peach, { at: [0, -0.085, 0] }), P.box(0.1, 0.012, 0.022, '#6FBF7F', { at: [0, -0.07, 0] })]), bag, 2))
  maps.add(map)
  root.add(maps)
  const poster = new Group()
  poster.position.set(...POSTER.at)
  poster.add(solid(merge([
    P.box(POSTER.w + 0.08, POSTER.h + 0.08, 0.03, WOOD, {}),
    P.box(POSTER.w, POSTER.h, 0.035, '#BFE3FF', {}),
    P.prism([[-0.48, -0.4], [0.05, 0.3], [0.48, -0.4]], 0.04, '#7FC689', { at: [0, -0.15, 0.005] }),
    P.prism([[-0.12, 0.13], [0.05, 0.3], [0.2, 0.1]], 0.045, '#FFFFFF', { at: [0, -0.15, 0.007] }),
    P.prism([[-0.5, -0.4], [-0.28, -0.05], [-0.05, -0.4]], 0.045, '#5FA97E', { at: [0, -0.15, 0.009] }),
    P.sphere(0.13, '#FFFFFF', { at: [-0.2, 0.38, 0.02], scale: [1.8, 0.7, 0.2] }, 12),
  ]), bag, 2))
  root.add(poster)

  // ---- The key fob, and the bags ----
  const fob = new Group()
  fob.add(solid(merge([
    P.rbox(0.08, 0.13, 0.03, 0.03, '#3E3849', {}),
    ...[0.035, -0.005].map((y, i) => P.cyl(0.016, 0.016, 0.012, i ? '#FFFFFF' : PAL.hotpink, { at: [0, y, 0.016], rot: [Math.PI / 2, 0, 0] }, 12)),
    P.torus(0.03, 0.008, '#C9CDD8', { at: [0, 0.09, 0] }),
  ]), bag, 1.5))
  root.add(fob)
  const suitcase = buildSuitcase(bag)
  const momBag = new Group()
  momBag.add(solid(merge([
    P.rbox(0.6, 0.34, 0.3, 0.12, PAL.lavenderDark, { at: [0, 0.17, 0] }),
    P.torus(0.12, 0.02, '#7A68C8', { at: [0, 0.34, 0], scale: [1, 1, 0.4] }, Math.PI),
    P.box(0.62, 0.05, 0.31, '#FFD3E6', { at: [0, 0.2, 0] }),
  ]), bag, 2))
  const backpack = new Group()
  backpack.add(solid(merge([
    P.rbox(0.36, 0.5, 0.24, 0.1, PAL.mint, { at: [0, 0.25, 0] }),
    P.rbox(0.26, 0.2, 0.06, 0.05, '#6FCFB0', { at: [0, 0.18, 0.13] }),
    P.torus(0.06, 0.016, '#4FA889', { at: [0, 0.52, 0] }, Math.PI),
  ]), bag, 2))
  const bags = [suitcase.root, momBag, backpack]
  for (const b of bags) {
    b.add(blobShadow(0.38, bag))
    root.add(b)
  }
  return { root, clerk, bell, orchids, maps, map, poster, fob, bags }
}
