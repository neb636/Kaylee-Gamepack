// Chef Fu's dumpling house, built from toy shapes (engine3d/geo.ts) in the flat toon look: dark wood and red lacquer,
// red lanterns, a lattice shop window onto Shanghai's old-town lane (shophouse roofs, a lantern string, the Oriental
// Pearl Tower far off; no temples, AGENTS.md rule 7), the long counter with her floury board, the bowls, the wok on its
// stove where the bamboo steamers stack, and the things to poke. Where everything stands is layout.ts.
import { Color, Group, LatheGeometry, Mesh, MeshBasicMaterial, SphereGeometry, Vector2 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, blobShadow, merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { BASKET_H, BELL, BOARD, CHOPSTICKS, COLOR_BOWLS, COUNTER, FILLING, FISH, FLOOR_Y, FLOUR, LANTERNS, LUMP, SEATS, TEAPOT, WINDOW, WOK } from './layout'

export const SKY = '#BFE4FF'
const WOOD = '#8A4B2E'
const WOOD_DARK = '#5E3020'
const RED = '#D9473F'
const RED_DARK = '#A8322E'
const GOLD = '#FFC83D'
const CREAM = '#FFF4E2'
const TOP = '#E9B98A'
const PORCELAIN = '#FFFFFF'
const BLUE = '#5C8FD6'
const BAMBOO = '#E3B76B'
const BAMBOO_DARK = '#B9894A'

export interface Room {
  root: Group
  lanterns: Group[]
  fish: Group
  bowl: Group
  teapot: Group
  flour: Group
  chopsticks: Group
  bell: Group
  flame: Group
  pearl: Group
  cat: Group
  bike: Group
  fillingBowl: Group
  colorBowls: Group[]
  lump: Group
  stools: Record<string, Group>
}

const at = (v: V3, dy = 0): V3 => [v[0], v[1] + dy, v[2]]

export function buildRoom(bag: Bag): Room {
  const root = new Group()
  const add = (g: Group, p?: V3) => {
    if (p) g.position.set(...p)
    root.add(g)
    return g
  }

  // ---- The room: floor, walls, the shop window with the lane beyond.
  const W = WINDOW
  const backZ = W.z
  add(solid(merge([
    P.box(7, 0.1, 6, '#C99A6E', { at: [0, FLOOR_Y - 0.05, -0.8] }),
    // The back wall, built round the window opening.
    P.box(3.5 - W.w / 2, 3.4, 0.12, CREAM, { at: [-(3.5 + W.w / 2) / 2, FLOOR_Y + 1.7, backZ - 0.06] }),
    P.box(3.5 - W.w / 2, 3.4, 0.12, CREAM, { at: [(3.5 + W.w / 2) / 2, FLOOR_Y + 1.7, backZ - 0.06] }),
    P.box(W.w, W.y - W.h / 2 - FLOOR_Y, 0.12, CREAM, { at: [0, (W.y - W.h / 2 + FLOOR_Y) / 2, backZ - 0.06] }),
    P.box(W.w, FLOOR_Y + 3.4 - (W.y + W.h / 2), 0.12, CREAM, { at: [0, (FLOOR_Y + 3.4 + W.y + W.h / 2) / 2, backZ - 0.06] }),
    P.box(7, 0.22, 0.16, RED_DARK, { at: [0, FLOOR_Y + 0.11, backZ + 0.02] }),
    // Side walls.
    P.box(0.12, 3.4, 4.6, CREAM, { at: [-3.2, FLOOR_Y + 1.7, -0.6] }),
    P.box(0.12, 3.4, 4.6, CREAM, { at: [3.2, FLOOR_Y + 1.7, -0.6] }),
    // Dark wood beams along the ceiling line.
    P.box(7, 0.14, 0.16, WOOD_DARK, { at: [0, W.y + W.h / 2 + 0.55, backZ + 0.06] }),
  ]), bag, 0))
  // The lane outside: a sky, shophouses with curly roofs and red lanterns, the Pearl Tower far off.
  const sky = new Mesh(bag.add(new SphereGeometry(30, 16, 10)), bag.add(new MeshBasicMaterial({ color: SKY, side: 1 })))
  sky.position.set(0, 0, backZ - 6)
  root.add(sky)
  const lane: ReturnType<typeof P.box>[] = []
  lane.push(P.box(10, 0.05, 6, '#D8C3A5', { at: [0, FLOOR_Y + 0.1, backZ - 3] }))
  const houses = [-3.4, -2, -0.6, 0.8, 2.2, 3.6]
  const WALLS = ['#FFC9D6', '#BDE8D2', '#FFE3A3', '#CFC2F5', '#FFD0B5', '#BFE0F7']
  houses.forEach((x, i) => {
    const h = 1.0 + (i % 3) * 0.3
    const z = backZ - 4.2
    const wall = WALLS[i]
    lane.push(P.box(1.3, h, 0.8, wall, { at: [x, FLOOR_Y + h / 2, z] }))
    // The curly upturned eaves of an old-town shophouse roof.
    lane.push(P.box(1.6, 0.12, 1.1, '#5A5A6E', { at: [x, FLOOR_Y + h + 0.04, z] }))
    lane.push(P.cone(0.12, 0.3, '#5A5A6E', { at: [x - 0.82, FLOOR_Y + h + 0.16, z + 0.4], rot: [0, 0, 0.9] }, 6))
    lane.push(P.cone(0.12, 0.3, '#5A5A6E', { at: [x + 0.82, FLOOR_Y + h + 0.16, z + 0.4], rot: [0, 0, -0.9] }, 6))
    lane.push(P.box(0.5, 0.7, 0.05, i % 2 ? RED : WOOD, { at: [x, FLOOR_Y + 0.35, z + 0.42] }))
    lane.push(P.sphere(0.13, RED, { at: [x + 0.45, FLOOR_Y + h - 0.35, z + 0.5], scale: [1, 0.85, 1] }, 10))
  })
  root.add(solid(merge(lane), bag, 1.5))
  // The Oriental Pearl Tower: pink balls on a tall needle, far off over the roofs.
  const pearl = solid(merge([
    P.cyl(0.05, 0.12, 3.6, '#C9B8E8', { at: [0, 1.8, 0] }, 8),
    P.cyl(0.06, 0.06, 1.6, '#C9B8E8', { at: [0.32, 0.8, 0], rot: [0, 0, 0.18] }, 6),
    P.cyl(0.06, 0.06, 1.6, '#C9B8E8', { at: [-0.32, 0.8, 0], rot: [0, 0, -0.18] }, 6),
    P.sphere(0.5, '#FF8FB8', { at: [0, 1.7, 0] }, 16),
    P.sphere(0.3, '#FF8FB8', { at: [0, 3.0, 0] }, 14),
    P.sphere(0.13, '#FF8FB8', { at: [0, 3.65, 0] }, 10),
    P.cyl(0.015, 0.03, 0.8, '#C9B8E8', { at: [0, 4.1, 0] }, 6),
  ]), bag, 1.5)
  add(pearl, [1.9, FLOOR_Y + 0.5, backZ - 7])
  pearl.scale.setScalar(1.15)
  // A cat asleep on the sill outside, and a bicycle that rings past now and then.
  const cat = solid(merge([
    P.sphere(0.13, '#F2A65A', { at: [0, 0.1, 0], scale: [1.4, 0.8, 1] }, 12),
    P.sphere(0.08, '#F2A65A', { at: [0.16, 0.15, 0] }, 10),
    P.cone(0.03, 0.06, '#F2A65A', { at: [0.13, 0.24, 0.03] }, 6),
    P.cone(0.03, 0.06, '#F2A65A', { at: [0.2, 0.23, -0.03] }, 6),
    P.capsule(0.022, 0.18, '#E08A3A', { at: [-0.2, 0.06, 0.05], rot: [Math.PI / 2, 0, 0.6] }),
  ]), bag, 2)
  add(cat, [-1.1, W.y - W.h / 2 + 0.02, backZ - 0.18])
  const bike = new Group()
  bike.add(solid(merge([
    P.torus(0.16, 0.025, '#2E2233', { at: [-0.28, 0.16, 0] }),
    P.torus(0.16, 0.025, '#2E2233', { at: [0.28, 0.16, 0] }),
    P.cyl(0.02, 0.02, 0.6, '#4FB7A0', { at: [0, 0.3, 0], rot: [0, 0, Math.PI / 2] }, 6),
    P.cyl(0.02, 0.02, 0.35, '#4FB7A0', { at: [0.18, 0.4, 0], rot: [0, 0, 0.4] }, 6),
    P.box(0.18, 0.12, 0.2, '#C98B4E', { at: [-0.3, 0.42, 0] }),
    P.capsule(0.09, 0.2, '#7FB2F0', { at: [-0.02, 0.62, 0] }),
    P.sphere(0.09, '#F5D3B3', { at: [0, 0.86, 0] }, 10),
  ]), bag, 1.5))
  add(bike, [-5, FLOOR_Y + 0.12, backZ - 1.6])
  // The window frame: dark wood with a lattice border and red lacquer posts.
  const frame: ReturnType<typeof P.box>[] = []
  const fx = W.w / 2
  const fy = W.h / 2
  frame.push(P.box(W.w + 0.24, 0.12, 0.14, WOOD_DARK, { at: [0, W.y + fy + 0.06, backZ] }))
  frame.push(P.box(W.w + 0.24, 0.16, 0.22, WOOD_DARK, { at: [0, W.y - fy - 0.08, backZ + 0.04] }))
  frame.push(P.box(0.14, W.h + 0.3, 0.16, RED_DARK, { at: [-fx - 0.06, W.y, backZ] }))
  frame.push(P.box(0.14, W.h + 0.3, 0.16, RED_DARK, { at: [fx + 0.06, W.y, backZ] }))
  frame.push(P.box(0.05, W.h, 0.06, WOOD_DARK, { at: [0, W.y, backZ] }))
  for (let i = 0; i < 9; i++) {
    const x = -fx + (i + 0.5) * (W.w / 9)
    frame.push(P.box(0.03, 0.18, 0.04, WOOD_DARK, { at: [x, W.y + fy - 0.09, backZ] }))
  }
  frame.push(P.box(W.w, 0.03, 0.04, WOOD_DARK, { at: [0, W.y + fy - 0.18, backZ] }))
  // A red signboard over the window, with a gold edge (no letters: those would be text in the art).
  frame.push(P.rbox(1.5, 0.34, 0.08, 0.03, RED, { at: [0, W.y + fy + 0.34, backZ + 0.03] }))
  frame.push(P.rbox(1.6, 0.42, 0.05, 0.03, GOLD, { at: [0, W.y + fy + 0.34, backZ + 0.0] }))
  frame.push(P.sphere(0.07, GOLD, { at: [-0.5, W.y + fy + 0.34, backZ + 0.08] }, 10))
  frame.push(P.sphere(0.07, GOLD, { at: [0, W.y + fy + 0.34, backZ + 0.08] }, 10))
  frame.push(P.sphere(0.07, GOLD, { at: [0.5, W.y + fy + 0.34, backZ + 0.08] }, 10))
  root.add(solid(merge(frame), bag, 2))

  // ---- The counter: a lacquered red front, a warm wood top, her floury board.
  const C = COUNTER
  const cw = C.x1 - C.x0
  const cd = C.z1 - C.z0
  add(solid(merge([
    P.rbox(cw, 0.08, cd, 0.02, TOP, { at: [(C.x0 + C.x1) / 2, -0.04, (C.z0 + C.z1) / 2] }),
    P.box(cw - 0.06, -FLOOR_Y - 0.08, cd - 0.08, RED, { at: [(C.x0 + C.x1) / 2, (FLOOR_Y - 0.08) / 2, (C.z0 + C.z1) / 2] }),
    P.box(cw - 0.02, 0.05, 0.03, GOLD, { at: [(C.x0 + C.x1) / 2, -0.14, C.z1 - 0.02] }),
    P.box(cw - 0.02, 0.05, 0.03, GOLD, { at: [(C.x0 + C.x1) / 2, -0.14, C.z0 + 0.02] }),
  ]), bag, 2))
  const flourDots = Array.from({ length: 9 }, (_, i) => {
    const a = i * 2.4
    const d = 0.3 + (i % 4) * 0.05
    return P.cyl(0.012 + (i % 3) * 0.005, 0.012 + (i % 3) * 0.005, 0.003, '#FFF8EC', { at: [Math.cos(a) * d * 1.3, BOARD.y + 0.002, Math.sin(a) * d * 0.75] }, 8)
  })
  add(solid(merge([P.rbox(BOARD.w, BOARD.y, BOARD.d, 0.012, '#F6DFB4', { at: [0, BOARD.y / 2, 0] }), ...flourDots]), bag, 2), [BOARD.x, 0, BOARD.z])

  // ---- The stools across the counter.
  const stools: Record<string, Group> = {}
  for (const [id, s] of Object.entries(SEATS)) {
    const seat = id === 'doudou' ? -0.18 : -0.34
    stools[id] = add(solid(merge([
      P.cyl(0.2, 0.2, 0.07, RED, { at: [0, seat, 0] }, 18),
      P.cyl(0.04, 0.05, seat - FLOOR_Y, WOOD_DARK, { at: [0, (seat + FLOOR_Y) / 2, 0] }, 8),
      P.cyl(0.16, 0.18, 0.04, WOOD_DARK, { at: [0, FLOOR_Y + 0.02, 0] }, 14),
    ]), bag, 2), [s.x, 0, s.z])
  }

  // ---- Her bowls: the filling, the colored doughs, the big lump.
  const bowl = (c: string, r = 0.13) => merge([
    P.cyl(r, r * 0.62, r * 0.62, PORCELAIN, { at: [0, r * 0.31, 0] }, 20),
    P.torus(r * 0.97, r * 0.06, BLUE, { at: [0, r * 0.6, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cyl(r * 0.9, r * 0.9, 0.01, c, { at: [0, r * 0.55, 0] }, 20),
  ])
  const fillingBowl = add(solid(merge([bowl('#C76E55'), P.sphere(0.075, '#E08A6E', { at: [0, 0.1, 0], scale: [1.3, 0.6, 1.3] }, 12)]), bag, 2), FILLING)
  const colorBowls = COLOR_BOWLS.map((p) => add(solid(bowl('#FFF4E2', 0.11), bag, 2), p))
  const lump = add(solid(merge([
    P.sphere(0.2, '#FFF0D2', { at: [0, 0.15, 0], scale: [1.15, 0.9, 1] }, 18),
    P.sphere(0.11, '#FFF0D2', { at: [0.13, 0.25, 0.05] }, 14),
    P.sphere(0.09, '#FFF0D2', { at: [-0.12, 0.24, -0.04] }, 12),
  ]), bag, 2.5), LUMP)
  lump.add(blobShadow(0.3, bag))

  // ---- The stove and wok, where the steamers stack.
  add(solid(merge([
    P.rbox(0.62, 0.06, 0.62, 0.02, '#8E8A9E', { at: [0, 0.03, 0] }),
    P.cyl(0.29, 0.2, 0.12, '#3E3A48', { at: [0, 0.12, 0] }, 22),
    P.torus(0.29, 0.02, '#2E2233', { at: [0, 0.18, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(0.05, 0.015, '#2E2233', { at: [0.32, 0.18, 0], rot: [0, 0, Math.PI / 2] }),
    P.torus(0.05, 0.015, '#2E2233', { at: [-0.32, 0.18, 0], rot: [0, 0, Math.PI / 2] }),
  ]), bag, 2), WOK)
  const flame = solid(merge([0, 1, 2, 3, 4].map((i) => P.cone(0.045, 0.11, i % 2 ? '#FFC83D' : '#FF8A3D', { at: [Math.cos(i * 1.26) * 0.12, 0.08, Math.sin(i * 1.26) * 0.12] }, 6))), bag, 1.5)
  flame.visible = false
  add(flame, at(WOK, -0.02))

  // ---- Things to poke.
  const lanterns = LANTERNS.map((p) => {
    const g = new Group()
    g.position.set(...p)
    g.add(solid(merge([
      P.cyl(0.006, 0.006, 0.6, '#2E2233', { at: [0, 0.3, 0] }, 4),
      P.sphere(0.2, RED, { at: [0, -0.18, 0], scale: [1, 0.86, 1] }, 18),
      P.cyl(0.09, 0.09, 0.05, GOLD, { at: [0, 0.0, 0] }, 14),
      P.cyl(0.09, 0.09, 0.05, GOLD, { at: [0, -0.36, 0] }, 14),
      P.cyl(0.012, 0.03, 0.16, GOLD, { at: [0, -0.47, 0] }, 6),
    ]), bag, 2))
    root.add(g)
    return g
  })
  const teapot = add(solid(merge([
    P.sphere(0.12, PORCELAIN, { at: [0, 0.11, 0], scale: [1.1, 0.85, 1.1] }, 18),
    P.torus(0.09, 0.012, BLUE, { at: [0, 0.12, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cyl(0.05, 0.06, 0.03, PORCELAIN, { at: [0, 0.22, 0] }, 12),
    P.sphere(0.022, BLUE, { at: [0, 0.25, 0] }, 8),
    P.cyl(0.018, 0.03, 0.13, PORCELAIN, { at: [0.15, 0.14, 0], rot: [0, 0, -0.9] }, 8),
    P.torus(0.06, 0.014, PORCELAIN, { at: [-0.13, 0.13, 0], rot: [0, 0, Math.PI / 2] }),
    P.cyl(0.045, 0.035, 0.05, PORCELAIN, { at: [0.2, 0.025, 0.12] }, 12),
    P.cyl(0.045, 0.035, 0.05, PORCELAIN, { at: [-0.12, 0.025, 0.16] }, 12),
  ]), bag, 2), TEAPOT)
  const bowlGlass = new Mesh(bag.add(new SphereGeometry(0.17, 20, 14)), bag.add(new MeshBasicMaterial({ color: new Color('#BFE6FF'), transparent: true, opacity: 0.45, depthWrite: false })))
  bowlGlass.position.y = 0.16
  const bowlRoot = add(new Group(), FISH)
  bowlRoot.add(bowlGlass)
  bowlRoot.add(solid(merge([P.cyl(0.13, 0.1, 0.03, '#8FD0F0', { at: [0, 0.02, 0] }, 16), P.torus(0.12, 0.012, '#9FD8FF', { at: [0, 0.3, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
  const fish = solid(merge([
    P.sphere(0.04, '#FF8A3D', { at: [0, 0, 0], scale: [1.4, 1, 0.7] }, 10),
    P.cone(0.035, 0.05, '#FFB060', { at: [-0.07, 0, 0], rot: [0, 0, Math.PI / 2] }, 6),
  ]), bag, 1.5)
  fish.position.y = 0.15
  bowlRoot.add(fish)
  const flour = add(solid(merge([
    P.rbox(0.24, 0.26, 0.17, 0.06, '#F4EEDF', { at: [0, 0.13, 0] }),
    P.cyl(0.06, 0.1, 0.06, '#F4EEDF', { at: [0, 0.29, 0] }, 10),
    P.box(0.16, 0.09, 0.005, '#7FB2F0', { at: [0, 0.14, 0.087] }),
  ]), bag, 2), FLOUR)
  const chopsticks = add(solid(merge([
    P.cyl(0.06, 0.06, 0.16, '#5C8FD6', { at: [0, 0.08, 0] }, 14),
    ...[-0.025, 0, 0.025].map((x, i) => P.cyl(0.006, 0.006, 0.3, i % 2 ? RED : '#2E2233', { at: [x, 0.2, x * 0.5], rot: [0.05 * (i - 1), 0, 0.1 * (i - 1)] }, 5)),
  ]), bag, 2), CHOPSTICKS)
  const bell = new Group()
  bell.position.set(...BELL)
  bell.add(solid(merge([
    P.cyl(0.006, 0.006, 0.25, '#2E2233', { at: [0, 0.12, 0] }, 4),
    P.cone(0.09, 0.14, GOLD, { at: [0, -0.06, 0] }, 14),
    P.sphere(0.025, '#E0A520', { at: [0, -0.14, 0] }, 8),
  ]), bag, 2))
  root.add(bell)

  return { root, lanterns, fish, bowl: bowlRoot, teapot, flour, chopsticks, bell, flame, pearl, cat, bike, fillingBowl, colorBowls, lump, stools }
}

/** A round bamboo steamer basket with its slats; `r` grows for Bao Bao's giant dumpling. */
export function buildBasket(bag: Bag, r: number) {
  // An open ring of bamboo (inside and out, so she sees into it from above), a slatted floor and a cabbage leaf.
  const w = 0.018
  const ring = bake(new LatheGeometry([new Vector2(r - w, 0.01), new Vector2(r - w, BASKET_H), new Vector2(r, BASKET_H), new Vector2(r, 0), new Vector2(r - w, 0.01)].reverse(), 28), BAMBOO)
  const parts = [
    ring,
    P.cyl(r - w, r - w, 0.014, BAMBOO_DARK, { at: [0, 0.007, 0] }, 24),
    P.cyl(r * 0.8, r * 0.8, 0.006, '#9ED07E', { at: [0, 0.017, 0] }, 20),
    P.torus(r + 0.004, 0.01, BAMBOO_DARK, { at: [0, BASKET_H * 0.3, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(r + 0.004, 0.01, BAMBOO_DARK, { at: [0, BASKET_H * 0.75, 0], rot: [Math.PI / 2, 0, 0] }),
  ]
  const basket = solid(merge(parts), bag, 2)
  return basket
}
/** Its domed lid, woven. */
export function buildLid(bag: Bag, r: number) {
  return solid(merge([
    P.cyl(r * 1.02, r * 1.02, 0.05, BAMBOO, { at: [0, 0.025, 0] }, 26),
    P.sphere(r * 1.0, BAMBOO, { at: [0, 0.04, 0], scale: [1, 0.32, 1] }, 22),
    P.torus(r * 0.6, 0.01, BAMBOO_DARK, { at: [0, 0.04 + r * 0.22, 0], rot: [Math.PI / 2, 0, 0] }),
    P.sphere(r * 0.12, BAMBOO_DARK, { at: [0, 0.04 + r * 0.32, 0] }, 10),
  ]), bag, 2)
}
/** One steam puff (popped by a tap). */
export function buildPuff(bag: Bag) {
  return solid(merge([
    P.sphere(0.06, '#FFFFFF', { at: [0, 0, 0] }, 12),
    P.sphere(0.045, '#FFFFFF', { at: [0.05, 0.02, 0.01] }, 10),
    P.sphere(0.04, '#FFFFFF', { at: [-0.045, 0.025, -0.01] }, 10),
  ]), bag, 2)
}
/** A meatball of filling, carried on her finger from the bowl to the wrapper. */
export function buildBlob(bag: Bag) {
  return solid(P.sphere(0.05, '#E08A6E', {}, 12), bag, 2)
}
