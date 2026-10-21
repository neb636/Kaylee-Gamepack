// MEGA HarborLand's hall, built from simple shapes in the house's toon look (greybox: no generated art). Harbor Town's
// three shop fronts with their arched windows and striped awnings, the Big Frame of white pipes and black nets with the
// giant mask on top (its pink nose is a slide), the four wavy racing lanes into a pit of balls, the Golden Mountain,
// Little Land's foam bricks, the punching bags and the Sky Pod. Everything still is merged into a few meshes; what
// moves (the shop doors, the barber's pole, the bricks, the bags, the crocodile's jaw, the sign bulbs, the Sky Pod's
// buttons) comes back as its own group. The slides come back as curves the kids ride.
import { CatmullRomCurve3, Group, Mesh, TubeGeometry, Vector3, type BufferGeometry, type Curve } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, merge, P, solid, type V3 } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { buildBigFrame, HL, trough, type FrameBuilt } from '../harborland/build'
import { BACK_Z, BENCH, SIGN_H, ZONE_SIGNS, BLOCKS, BOXING, CROC, DOOR, HALL, LANES, MOUNTAIN, PIT, SHOP_W, SHOPS, SKYPOD, STEPS, TOWN, WALL, type ShopId } from './layout'

export interface HallBuilt {
  root: Group
  /** Each shop's door, hinged on its left edge (rotation.y opens it). */
  doors: Record<ShopId, Group>
  /** The barber's striped pole (it spins). */
  pole: Group
  /** Little Land's front stack: each brick on its own (they tumble and pop back). */
  bricks: { g: Group; home: Vector3 }[]
  /** The punching bags, each hanging from its pivot on the beam. */
  bags: Group[]
  skypod: Mesh[]
  croc: { root: Group; jaw: Group }
  /** The two signs' bulbs, in two sets that take turns lighting up. */
  bulbs: [Mesh[], Mesh[]]
  /** The rides the kids go down (top to bottom): the mask's nose, each racing lane, the mountain's steel slide. */
  curves: { nose: Curve<Vector3>; lanes: Curve<Vector3>[]; steel: Curve<Vector3> }
  /** The Big Frame (the frame she plays in uses the hall round it: harborland/frame.ts). */
  frame: FrameBuilt
  /** Everything with userData.pick, for taps on the canvas. */
  picks: Group[]
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const SHOE = '#2B2330'
const PIPE = '#FFFFFF'
export const LIT = '#FFE680'
export const DIM = '#B59A7A'

/** A lane's floor at u (0 top .. 1 bottom): a steady drop with waves on it. */
export function laneY(u: number) {
  return LANES.y0 + (LANES.y1 - LANES.y0) * u - LANES.amp * Math.sin(2 * Math.PI * LANES.bumps * u)
}

/** The hall. `playFrame`: the Big Frame keeps its moving parts and its own taps (harborland/frame.ts plays in it). */
export function buildHall(bag: Bag, playFrame = false): HallBuilt {
  const root = new Group()
  const picks: Group[] = []
  const add = <T extends Group>(g: T, pick?: string) => {
    if (pick) {
      g.userData.pick = pick
      picks.push(g)
    }
    root.add(g)
    return g
  }
  const [hx0, hx1, hz0, hz1] = HALL
  const W = hx1 - hx0
  const cx = (hx0 + hx1) / 2

  // ---- The mats: big squares with flowers printed on them; the back wall, light below and dark up by the ceiling ----
  const tiles = []
  for (let x = hx0 - 2; x < hx1 + 2; x += 2)
    for (let z = hz0 - 0.2; z < hz1 + 4; z += 2) tiles.push(P.box(2, 0.1, 2, (Math.round((x - hx0) / 2) + Math.round((z - hz0) / 2)) % 2 ? HL.floorA : HL.floorB, { at: [x + 1, -0.05, z + 1] }))
  const petals = ['#FF8FB8', '#FBEA9A', '#8FE3C8', '#C9B5F7']
  for (let i = 0; i < 46; i++) {
    const x = hx0 + ((i * 7.31) % W)
    const z = hz0 + 0.6 + ((i * 3.17) % (hz1 - hz0 + 2.4))
    const c = petals[i % petals.length]
    for (let k = 0; k < 5; k++) tiles.push(P.sphere(0.2, c, { at: [x + Math.cos((k * 2 * Math.PI) / 5) * 0.2, 0.004, z + Math.sin((k * 2 * Math.PI) / 5) * 0.2], scale: [1, 0.02, 1] }, 10))
    tiles.push(P.sphere(0.11, '#FFFFFF', { at: [x, 0.008, z], scale: [1, 0.02, 1] }, 10))
  }
  add(solid(merge(tiles), bag, 0))
  add(
    solid(
      merge([
        P.box(W + 8, WALL.dark, 0.2, HL.wall, { at: [cx, WALL.dark / 2, BACK_Z - 0.1] }),
        P.box(W + 8, WALL.h - WALL.dark + 2, 0.2, '#3F365F', { at: [cx, (WALL.dark + WALL.h + 2) / 2, BACK_Z - 0.1] }),
        P.box(W + 8, 0.3, 0.06, HL.gold, { at: [cx, WALL.dark, BACK_Z] }),
        ...Array.from({ length: Math.ceil(W / 1.6) + 6 }, (_, i) => P.box(0.36, 0.36, 0.06, HL.goldDark, { at: [hx0 - 4 + i * 1.6, WALL.dark, BACK_Z + 0.03], rot: [0, 0, Math.PI / 4] })),
        // The dark ceiling, and its rows of strip lights running out toward us (so it reads as a ceiling, not a wall).
        P.box(W + 8, 0.2, 14, '#2E2748', { at: [cx, WALL.h + 0.1, BACK_Z + 7] }),
        ...Array.from({ length: Math.ceil(W / 2.4) + 4 }, (_, i) => P.box(0.16, 0.05, 12, '#FFF6D8', { at: [hx0 - 2 + i * 2.4, WALL.h - 0.03, BACK_Z + 6.5] })),
        ...Array.from({ length: Math.ceil(W / 2.4) + 4 }, (_, i) => P.box(0.4, 0.02, 12.2, '#4A4170', { at: [hx0 - 2 + i * 2.4, WALL.h - 0.005, BACK_Z + 6.5] })),
        // The end walls.
        ...[hx0 - 0.5, hx1 + 0.5].map((x) => P.box(0.3, WALL.h, hz1 - hz0 + 1, HL.wall, { at: [x, WALL.h / 2, (hz0 + hz1) / 2 - 0.6] })),
      ]),
      bag,
      0,
    ),
  )

  // ---- Harbor Town: three shops in a row, a balcony along the top, the big lit sign over the street ----
  const doors = {} as Record<ShopId, Group>
  const F = TOWN.front
  const D = BACK_Z
  const town = []
  for (const s of SHOPS) {
    const x = s.x
    const w = SHOP_W - 0.08
    // The shop: a block at the back, then a front wall with a real doorway in it (she steps in, out of sight).
    const R = DOOR.recess
    const side = (w - DOOR.w) / 2
    town.push(
      P.box(w, TOWN.h, F - R - D, s.wall, { at: [x, TOWN.h / 2, (F - R + D) / 2] }),
      ...[-1, 1].map((k) => P.box(side, TOWN.h, R, s.wall, { at: [x + k * (DOOR.w / 2 + side / 2), TOWN.h / 2, F - R / 2] })),
      P.box(DOOR.w, TOWN.h - DOOR.h, R, s.wall, { at: [x, (TOWN.h + DOOR.h) / 2, F - R / 2] }),
      // Dark inside the doorway, the trim round it and the round fan window over it.
      P.box(DOOR.w, DOOR.h, 0.04, '#4A3F5E', { at: [x, DOOR.h / 2, F - R + 0.03] }),
      P.box(DOOR.w, 0.02, R, '#6E6283', { at: [x, 0.012, F - R / 2] }),
      P.box(DOOR.w + 0.26, 0.14, 0.12, s.trim, { at: [x, DOOR.h + 0.07, F + 0.04] }),
      ...[-1, 1].map((k) => P.box(0.13, DOOR.h, 0.12, s.trim, { at: [x + k * (DOOR.w / 2 + 0.065), DOOR.h / 2, F + 0.04] })),
      P.cyl(DOOR.w / 2, DOOR.w / 2, 0.04, '#BFE6FF', { at: [x, DOOR.h + 0.14, F + 0.02], rot: [Math.PI / 2, 0, 0] }, 20),
      P.torus(DOOR.w / 2 + 0.04, 0.06, s.trim, { at: [x, DOOR.h + 0.14, F + 0.05] }, Math.PI),
      // Arched windows either side.
      ...[-1, 1].flatMap((k) => {
        const wx = x + k * 0.98
        return [P.box(0.62, 0.9, 0.04, '#BFE6FF', { at: [wx, 1.25, F + 0.02] }), P.cyl(0.31, 0.31, 0.04, '#BFE6FF', { at: [wx, 1.7, F + 0.02], rot: [Math.PI / 2, 0, 0] }, 16), P.torus(0.34, 0.05, s.trim, { at: [wx, 1.7, F + 0.05] }, Math.PI), P.box(0.76, 0.08, 0.16, s.trim, { at: [wx, 0.78, F + 0.06] }), P.box(0.04, 0.9, 0.05, '#FFFFFF', { at: [wx, 1.25, F + 0.05] })]
      }),
      // The black-and-white striped awning over the door, tipped out.
      ...Array.from({ length: 7 }, (_, i) => P.box(0.22, 0.05, 0.62, i % 2 ? '#FFFFFF' : SHOE, { at: [x - 0.66 + i * 0.22, 2.55, F + 0.28], rot: [0.42, 0, 0] })),
      ...Array.from({ length: 7 }, (_, i) => P.sphere(0.11, i % 2 ? '#FFFFFF' : SHOE, { at: [x - 0.66 + i * 0.22, 2.42, F + 0.56], scale: [1, 0.7, 0.4] }, 10)),
    )
    // Each shop's own picture over its awning (no words): the vet's cross, the cafe's cup, the barber's comb.
    const y = 3.95
    town.push(P.cyl(0.42, 0.42, 0.08, '#FFFFFF', { at: [x, y, F + 0.06], rot: [Math.PI / 2, 0, 0] }, 24), P.torus(0.42, 0.05, s.trim, { at: [x, y, F + 0.1] }))
    if (s.id === 'vet') town.push(P.box(0.44, 0.14, 0.06, '#FF6F6F', { at: [x, y, F + 0.12] }), P.box(0.14, 0.44, 0.06, '#FF6F6F', { at: [x, y, F + 0.12] }))
    if (s.id === 'cafe') town.push(P.cyl(0.13, 0.1, 0.26, s.trim, { at: [x - 0.03, y - 0.02, F + 0.16] }), P.torus(0.07, 0.025, s.trim, { at: [x + 0.13, y, F + 0.16] }), P.box(0.34, 0.03, 0.08, '#E8B574', { at: [x, y - 0.17, F + 0.16] }))
    if (s.id === 'cafe') town.push(...[-0.06, 0.06].map((dx, i) => P.capsule(0.022, 0.08, '#C9B5F7', { at: [x + dx - 0.03, y + 0.24 + i * 0.03, F + 0.16], rot: [0, 0, i ? -0.3 : 0.3] })))
    if (s.id === 'barber') town.push(...[-1, 1].flatMap((k) => [P.box(0.05, 0.42, 0.04, '#8E95A6', { at: [x + k * 0.06, y + 0.06, F + 0.12 + (k + 1) * 0.01], rot: [0, 0, k * 0.42] }), P.torus(0.075, 0.025, s.trim, { at: [x - k * 0.13, y - 0.2, F + 0.14] })]))
    // The door: its own group, hinged on the left.
    const door = new Group()
    door.position.set(x - DOOR.w / 2, 0, F + 0.05)
    door.add(solid(merge([P.rbox(DOOR.w, DOOR.h - 0.04, 0.07, 0.03, s.trim, { at: [DOOR.w / 2, (DOOR.h - 0.04) / 2, 0] }), P.box(DOOR.w * 0.6, 0.7, 0.03, '#BFE6FF', { at: [DOOR.w / 2, 1.45, 0.04] }), P.sphere(0.06, HL.gold, { at: [DOOR.w - 0.14, 1.0, 0.07] })]), bag, 2))
    doors[s.id] = add(door, `door:${s.id}`)
  }
  // The balcony along the top, the upper storey and its little windows, and the big sign over the street.
  const [tx0, tx1] = [TOWN.x0, TOWN.x1]
  town.push(
    P.box(tx1 - tx0, TOWN.upper - TOWN.h, F - D - 0.6, '#FFF7F0', { at: [(tx0 + tx1) / 2, (TOWN.h + TOWN.upper) / 2, (F + D) / 2 - 0.3] }),
    P.box(tx1 - tx0 + 0.2, 0.14, 0.7, '#FFFFFF', { at: [(tx0 + tx1) / 2, TOWN.h + 0.07, F + 0.05] }),
    ...Array.from({ length: Math.round((tx1 - tx0) / 0.32) }, (_, i) => P.cyl(0.025, 0.025, 0.36, SHOE, { at: [tx0 + 0.16 + i * 0.32, TOWN.h + 0.3, F + 0.36] }, 6)),
    P.box(tx1 - tx0 + 0.2, 0.06, 0.06, SHOE, { at: [(tx0 + tx1) / 2, TOWN.h + 0.48, F + 0.36] }),
    P.rbox(tx1 - tx0 - 1.2, 0.95, 0.16, 0.12, PAL.lavenderDark, { at: [(tx0 + tx1) / 2, TOWN.sign, D + 1.0] }),
    P.rbox(tx1 - tx0 - 1.5, 0.7, 0.04, 0.1, '#FFF7F0', { at: [(tx0 + tx1) / 2, TOWN.sign, D + 1.09] }),
  )
  add(solid(merge(town), bag, 2))

  // ---- The barber's pole by its door: red, white and blue stripes that turn ----
  const barber = SHOPS[2]
  const pole = new Group()
  pole.position.set(barber.x + SHOP_W / 2 - 0.25, 1.35, F + 0.2)
  pole.add(solid(merge([P.cyl(0.11, 0.11, 0.9, '#FFFFFF', {}, 14), ...[0, 1, 2, 3, 4, 5].map((i) => P.torus(0.11, 0.035, i % 2 ? '#5D7BB0' : '#FF6F6F', { at: [0, -0.38 + i * 0.15, 0], rot: [Math.PI / 2 + 0.5, 0, 0] })), P.sphere(0.13, HL.gold, { at: [0, 0.5, 0] }), P.sphere(0.13, HL.gold, { at: [0, -0.5, 0] })]), bag, 2))
  add(pole, 'pole')

  // ---- The signs' bulbs: round Harbor Town's sign (two sets that take turns) ----
  const bulbs: [Mesh[], Mesh[]] = [[], []]
  const bulbRow = (x0: number, x1: number, y0: number, y1: number, z: number) => {
    const pts: V3[] = []
    for (let x = x0; x <= x1 + 1e-6; x += 0.3) pts.push([x, y0, z], [x, y1, z])
    for (let y = y0 + 0.3; y < y1 - 0.1; y += 0.3) pts.push([x0, y, z], [x1, y, z])
    return pts
  }
  const allBulbs = bulbRow(tx0 + 0.75, tx1 - 0.75, TOWN.sign - 0.42, TOWN.sign + 0.42, D + 1.12)
  for (const k of [0, 1] as const) {
    const m = new Mesh(bag.add(merge(allBulbs.filter((_, i) => i % 2 === k).map((at) => P.sphere(0.065, '#FFFFFF', { at }, 8)))), toon(LIT))
    root.add(m)
    bulbs[k].push(m)
  }

  // ---- Mommy's bench ----
  const [bx, bz] = BENCH.at
  add(solid(merge([P.rbox(1.5, 0.12, 0.5, 0.05, HL.pad5, { at: [bx, 0.42, bz] }), P.rbox(1.5, 0.5, 0.1, 0.05, HL.pad5, { at: [bx, 0.7, bz - 0.24] }), ...[-0.62, 0.62].map((x) => P.box(0.08, 0.4, 0.4, '#D8D2E6', { at: [bx + x, 0.2, bz] }))]), bag, 2))

  // ---- The Big Frame (harborland/build.ts: the same model she plays in, merged into a few meshes when nothing on it
  //      moves). A tap anywhere on it goes in ----
  const frame = buildBigFrame(bag, !playFrame)
  root.add(frame.root)
  for (const g of frame.picks) {
    if (!playFrame) g.userData.pick = 'frame'
    picks.push(g)
  }

  // ---- The steps up the frame's side, the four wavy racing lanes, the pit of pink and white balls ----
  const race = []
  const n = STEPS.n
  for (let i = 0; i < n; i++) {
    const k = (i + 1) / n
    const z = STEPS.z1 - (STEPS.z1 - STEPS.z0) * ((i + 0.5) / n)
    race.push(P.rbox(STEPS.x1 - STEPS.x0, LANES.y0 * k, (STEPS.z1 - STEPS.z0) / n + 0.02, 0.04, i % 2 ? HL.pad4 : HL.pad5, { at: [(STEPS.x0 + STEPS.x1) / 2, (LANES.y0 * k) / 2, z] }))
  }
  race.push(P.rbox(STEPS.x1 - STEPS.x0 + 0.4, 0.14, LANES.z[3] - LANES.z[0] + LANES.w + 0.3, 0.05, HL.pad2, { at: [(STEPS.x0 + LANES.x0) / 2 + 0.2, LANES.y0 - 0.07, (LANES.z[0] + LANES.z[3]) / 2] }))
  // Posts under the lanes, and the pit's padded walls.
  for (const x of [6.8, 8.4]) for (const z of [LANES.z[0] - 0.4, LANES.z[3] + 0.4]) race.push(P.cyl(0.08, 0.08, laneY((x - LANES.x0) / (LANES.x1 - LANES.x0)), PIPE, { at: [x, laneY((x - LANES.x0) / (LANES.x1 - LANES.x0)) / 2, z] }, 8))
  const [px0, px1, pz0, pz1] = PIT
  race.push(
    P.rbox(px1 - px0, 0.4, 0.2, 0.06, HL.pad2, { at: [(px0 + px1) / 2, 0.2, pz1] }),
    P.rbox(0.2, 0.4, pz1 - pz0, 0.06, HL.pad2, { at: [px1, 0.2, (pz0 + pz1) / 2] }),
    P.rbox(px1 - px0, 0.4, 0.2, 0.06, HL.pad2, { at: [(px0 + px1) / 2, 0.2, pz0] }),
  )
  for (let i = 0; i < 90; i++) {
    const x = px0 + 0.2 + ((i * 0.613) % (px1 - px0 - 0.35))
    const z = pz0 + 0.2 + ((i * 0.377) % (pz1 - pz0 - 0.35))
    race.push(P.sphere(0.11, i % 3 ? '#FF8FB8' : '#FFFFFF', { at: [x, 0.22 + (i % 4) * 0.04, z] }, 8))
  }
  add(solid(merge(race), bag, 2), 'race')
  const lanes = LANES.z.map((z) => {
    const pts: Vector3[] = []
    for (let i = 0; i <= 30; i++) {
      const u = i / 30
      pts.push(v(LANES.x0 + (LANES.x1 - LANES.x0) * u, laneY(u), z))
    }
    pts.push(v(LANES.x1 + 0.6, 0.3, z))
    return new CatmullRomCurve3(pts)
  })
  for (const c of lanes) add(trough(c, LANES.w / 2, '#FF9A4D', '#E8742A', 70, bag), 'race')

  // ---- The Golden Mountain: a gold cone with patterned bands and holds, a red rail round the top, a steel slide ----
  const M = MOUNTAIN
  add(
    solid(
      merge([
        P.cone(M.r, M.h + 0.9, HL.gold, { at: [M.x, (M.h + 0.9) / 2, M.z] }, 28),
        ...[0.7, 1.5, 2.3].map((y, i) => P.torus(M.r * (1 - y / (M.h + 0.9)) + 0.02, 0.07, i % 2 ? '#FF6F6F' : HL.goldDark, { at: [M.x, y, M.z], rot: [Math.PI / 2, 0, 0] })),
        ...Array.from({ length: 14 }, (_, i) => {
          const y = 0.35 + ((i * 0.41) % 2.5)
          const r = M.r * (1 - y / (M.h + 0.9)) + 0.03
          const a = -1.2 + ((i * 0.77) % 2.4)
          return P.sphere(0.08, petals[i % 4], { at: [M.x + Math.sin(a) * r, y, M.z + Math.cos(a) * r] }, 8)
        }),
        P.cyl(0.62, 0.62, 0.12, HL.pad4, { at: [M.x, M.h - 0.05, M.z] }, 20),
        P.torus(0.62, 0.05, '#FF6F6F', { at: [M.x, M.h + 0.45, M.z], rot: [Math.PI / 2, 0, 0] }),
        ...[0, 1, 2, 3, 4, 5].map((i) => P.cyl(0.03, 0.03, 0.45, '#FF6F6F', { at: [M.x + Math.sin(i * 1.05) * 0.62, M.h + 0.22, M.z + Math.cos(i * 1.05) * 0.62] }, 6)),
      ]),
      bag,
      2,
    ),
    'mountain',
  )
  const steel = new CatmullRomCurve3(M.slide.map((p) => v(...p)))
  add(trough(steel, 0.32, '#C9CED8', '#8E95A6', 40, bag), 'mountain')

  // ---- Little Land: a wall of giant foam bricks at the back, a stack in front whose bricks tumble ----
  const [bw, bh, bd] = BLOCKS.brick
  const brickColors = [HL.pad1, HL.pad2, HL.pad3, HL.pad4, HL.pad5]
  const wall = []
  for (let r = 0; r < 4; r++)
    for (let x = BLOCKS.x0 + (r % 2 ? bw / 2 : 0); x + bw <= BLOCKS.x1 + 1e-6; x += bw) wall.push(P.rbox(bw - 0.03, bh - 0.03, bd, 0.06, brickColors[(r * 3 + Math.round(x / bw)) % 5], { at: [x + bw / 2, bh / 2 + r * bh, BLOCKS.back] }))
  // Loose bricks lying about.
  wall.push(P.rbox(bw, bh, bd, 0.06, HL.pad4, { at: [BLOCKS.x1 - 0.5, bh / 2, BLOCKS.front + 0.1], rot: [0, 0.6, 0] }), P.rbox(bw, bh, bd, 0.06, HL.pad1, { at: [BLOCKS.x1 - 0.7, bh * 1.5, BLOCKS.front + 0.05], rot: [0, 0.2, 0.1] }), P.rbox(bw, bh, bd, 0.06, HL.pad3, { at: [BLOCKS.x1 - 1.6, bh / 2, -2.5], rot: [0, -0.4, 0] }))
  add(solid(merge(wall), bag, 2), 'blocks')
  const bricks: HallBuilt['bricks'] = []
  const stack: [number, number][] = [
    [-1, 0],
    [0, 0],
    [1, 0],
    [-0.5, 1],
    [0.5, 1],
    [0, 2],
  ]
  const sx = BLOCKS.x0 + 1.3
  stack.forEach(([i, r], k) => {
    const g = new Group()
    g.add(solid(merge([P.rbox(bw - 0.03, bh - 0.03, bd, 0.06, brickColors[(k + 2) % 5])]), bag, 2))
    const home = v(sx + i * bw, bh / 2 + r * bh, BLOCKS.front - bd / 2)
    g.position.copy(home)
    bricks.push({ g: add(g, 'blocks'), home })
  })

  // ---- Muay Thai: a blue mat, a beam on two posts, two red bags hanging; the Sky Pod's buttons on the wall ----
  const B = BOXING
  add(
    solid(
      merge([
        P.rbox(B.x1 - B.x0, 0.08, 2.6, 0.04, '#8EC9F5', { at: [(B.x0 + B.x1) / 2, 0.04, B.z - 0.3] }),
        ...[B.x0 + 0.15, B.x1 - 0.15].map((x) => P.cyl(0.1, 0.1, B.beam, '#E8E2F2', { at: [x, B.beam / 2, B.z] }, 10)),
        P.box(B.x1 - B.x0, 0.16, 0.16, '#E8E2F2', { at: [(B.x0 + B.x1) / 2, B.beam, B.z] }),
        // The Sky Pod's dark panel.
        P.rbox(SKYPOD.cols * 0.42 + 0.3, SKYPOD.rows * 0.42 + 0.3, 0.12, 0.08, '#4A4170', { at: [SKYPOD.x, SKYPOD.y, SKYPOD.z] }),
      ]),
      bag,
      2,
    ),
  )
  const bags = B.bags.map((x) => {
    const g = new Group()
    g.position.set(x, B.beam - 0.08, B.z)
    g.add(solid(merge([P.cyl(0.02, 0.02, 0.5, SHOE, { at: [0, -0.25, 0] }, 6), P.capsule(0.3, 0.7, '#FF6F6F', { at: [0, -1.15, 0] }), P.cyl(0.31, 0.31, 0.14, '#FFFFFF', { at: [0, -0.95, 0] }, 16), P.cyl(0.31, 0.31, 0.08, SHOE, { at: [0, -1.4, 0] }, 16)]), bag, 2))
    return add(g)
  })
  bags.forEach((g, i) => (g.userData.pick = `bag:${i}`))
  picks.push(...bags)
  const skypod: Mesh[] = []
  const pod = new Group()
  for (let r = 0; r < SKYPOD.rows; r++)
    for (let c = 0; c < SKYPOD.cols; c++) {
      const b = new Mesh(bag.add(P.cyl(0.15, 0.15, 0.06, '#ffffff', { rot: [Math.PI / 2, 0, 0] }, 16)), toon(PAL.lavenderDark))
      b.position.set(SKYPOD.x + (c - (SKYPOD.cols - 1) / 2) * 0.42, SKYPOD.y + (r - (SKYPOD.rows - 1) / 2) * 0.42, SKYPOD.z + 0.09)
      pod.add(b)
      skypod.push(b)
    }
  add(pod, 'skypod')

  // ---- The big plush crocodile on the mats: a long green body, bumps down its back, a jaw that opens ----
  const croc = new Group()
  croc.position.set(CROC.at[0], 0, CROC.at[1])
  croc.rotation.y = (CROC.face * Math.PI) / 180
  croc.add(
    solid(
      merge([
        P.capsule(0.3, 1.3, '#6FCF8E', { at: [-0.2, 0.28, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.9] }),
        P.cone(0.26, 0.9, '#6FCF8E', { at: [-1.55, 0.2, 0], rot: [0, 0, Math.PI / 2] }),
        ...[-0.9, -0.5, -0.1, 0.3].map((x) => P.cone(0.08, 0.16, '#4FAF6E', { at: [x, 0.6, 0] })),
        ...[-0.7, 0.3].flatMap((x) => [-1, 1].map((s) => P.sphere(0.12, '#4FAF6E', { at: [x, 0.08, s * 0.28], scale: [1.2, 0.6, 1] }))),
        P.rbox(0.7, 0.16, 0.42, 0.06, '#6FCF8E', { at: [0.85, 0.18, 0] }),
        ...[-1, 1].flatMap((s) => [P.sphere(0.1, '#FFFFFF', { at: [0.6, 0.5, s * 0.14] }), P.sphere(0.05, PAL.ink, { at: [0.67, 0.52, s * 0.14] })]),
      ]),
      bag,
      2,
    ),
  )
  const jaw = new Group()
  jaw.position.set(0.55, 0.36, 0)
  jaw.add(solid(merge([P.rbox(0.72, 0.13, 0.42, 0.06, '#6FCF8E', { at: [0.35, 0.06, 0] }), ...[0.15, 0.35, 0.55].flatMap((x) => [-1, 1].map((s) => P.cone(0.035, 0.08, '#FFFFFF', { at: [x, -0.03, s * 0.16], rot: [Math.PI, 0, 0] })))]), bag, 2))
  croc.add(jaw)
  add(croc, 'croc')

  // ---- The painted wall ("all of Thailand in one day"): a sun and clouds over the lanes, kids riding elephants on a
  //      green hill behind the Golden Mountain, palms by Little Land and the bags. Flat paint, inked like the 2D art ----
  add(solid(merge(mural()), bag, 1.5))
  // ---- Thai festival bunting along the wall, swagging between the hooks ----
  add(solid(merge(bunting(-3.4, hx1 + 0.3)), bag, 1))

  // ---- The hanging signs over Little Land and Muay Thai (their words are HTML: hall.ts) ----
  add(
    solid(
      merge(
        ZONE_SIGNS.flatMap((z) => [
          P.rbox(z.w, SIGN_H, 0.14, 0.12, z.color, { at: [z.x, z.y, z.z] }),
          P.rbox(z.w - 0.24, SIGN_H - 0.22, 0.04, 0.08, '#FFF7F0', { at: [z.x, z.y, z.z + 0.08] }),
          ...[-1, 1].map((k) => P.cyl(0.018, 0.018, WALL.h - z.y, SHOE, { at: [z.x + k * (z.w / 2 - 0.25), (WALL.h + z.y) / 2, z.z] }, 6)),
        ]),
      ),
      bag,
      2,
    ),
  )

  return { root, doors, pole, bricks, bags, skypod, croc: { root: croc, jaw }, bulbs, curves: { nose: frame.curves.nose, lanes, steel }, frame, picks }
}

const PAINT = { z: BACK_Z + 0.03, ink: PAL.ink }
/** A flat painted blob on the back wall (an ellipse of paint). */
const dab = (x: number, y: number, rx: number, ry: number, c: string, rot = 0, z = 0) => P.sphere(1, c, { at: [x, y, PAINT.z + z * 0.004], scale: [rx, ry, 0.012], rot: [0, 0, rot] }, 20)

/** A painted elephant, a kid riding it on a red blanket (`dir` 1 faces right). */
function elephant(x: number, y: number, dir: 1 | -1, kid: string): BufferGeometry[] {
  const body = '#C9C3E6'
  return [
    ...[-0.55, -0.2, 0.25, 0.6].map((dx) => P.box(0.3, 0.75, 0.01, body, { at: [x + dx, y - 0.55, PAINT.z] })),
    dab(x, y, 1.0, 0.68, body, 0, 1),
    dab(x + dir * 1.0, y + 0.3, 0.5, 0.48, body, 0, 2),
    dab(x + dir * 0.72, y + 0.32, 0.36, 0.44, '#FFB8CC', dir * 0.2, 3),
    dab(x + dir * 1.42, y + 0.02, 0.15, 0.3, body, dir * 0.3, 3),
    dab(x + dir * 1.52, y - 0.32, 0.12, 0.2, body, dir * -0.2, 3),
    dab(x + dir * 1.2, y + 0.45, 0.06, 0.07, PAINT.ink, 0, 4),
    dab(x - dir * 0.05, y + 0.62, 0.62, 0.16, '#FF6F6F', 0, 2),
    // The kid: a round head with a top knot, a body, an arm up.
    dab(x - dir * 0.05, y + 0.95, 0.24, 0.3, kid, 0, 3),
    dab(x - dir * 0.05, y + 1.4, 0.24, 0.24, '#FFE3C8', 0, 4),
    dab(x - dir * 0.05, y + 1.66, 0.09, 0.09, PAINT.ink, 0, 5),
    dab(x + dir * 0.2, y + 1.25, 0.06, 0.24, kid, dir * -0.8, 4),
  ]
}

/** A painted palm: a curved trunk of segments, a fan of leaves. */
function palm(x: number, y: number, h: number, lean: number): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 6; i++) {
    const k = i / 6
    parts.push(P.box(0.22, h / 6 + 0.04, 0.01, i % 2 ? '#D9A066' : '#C48A55', { at: [x + lean * k * k * h, y + (h * (i + 0.5)) / 6, PAINT.z], rot: [0, 0, -lean * k * 1.6] }))
  }
  const tx = x + lean * h
  const ty = y + h
  for (let i = 0; i < 6; i++) {
    const a = -0.3 + (i / 5) * (Math.PI + 0.6)
    parts.push(dab(tx + Math.cos(a) * 0.55, ty + Math.sin(a) * 0.32 - 0.05, 0.62, 0.16, i % 2 ? '#6FCF8E' : '#8FE3C8', a, 2))
  }
  parts.push(dab(tx, ty - 0.1, 0.12, 0.12, '#A0703F', 0, 3))
  return parts
}

function mural(): BufferGeometry[] {
  const cloud = (x: number, y: number, s: number) => [dab(x, y, 1.0 * s, 0.42 * s, '#FFFFFF'), dab(x - 0.6 * s, y - 0.1 * s, 0.6 * s, 0.32 * s, '#FFFFFF', 0, 1), dab(x + 0.65 * s, y - 0.08 * s, 0.55 * s, 0.3 * s, '#FFFFFF', 0, 1)]
  return [
    // Over the lanes: a big sun and clouds.
    dab(8.6, 4.5, 0.85, 0.85, '#FFE680'),
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2
      return P.box(0.14, 0.42, 0.01, '#FFD24D', { at: [8.6 + Math.cos(a) * 1.15, 4.5 + Math.sin(a) * 1.15, PAINT.z - 0.002], rot: [0, 0, a - Math.PI / 2] })
    }),
    ...cloud(6.4, 4.85, 0.8),
    ...cloud(11.2, 4.4, 1),
    // Behind the Golden Mountain: a green hill, two elephants with kids riding.
    dab(15.2, 0.2, 4.4, 1.9, '#CFF3E3'),
    dab(12.0, 0.4, 1.6, 1.2, '#BDEBD5', 0, 1),
    ...elephant(12.3, 2.2, 1, '#FF8FB8'),
    ...elephant(18.2, 2.5, -1, '#8EC9F5'),
    ...cloud(15.4, 5.0, 0.9),
    // By Little Land and the bags: palms and a cloud.
    ...palm(21.7, 0, 3.6, 0.12),
    ...palm(25.3, 0, 3.0, -0.15),
    ...cloud(23.6, 4.7, 0.8),
  ]
}

/** Strings of little triangle flags along the wall, swagging between hooks every 3 m. */
function bunting(x0: number, x1: number): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const colors = ['#FF6F6F', '#FBEA9A', '#8FE3C8', '#8EC9F5', '#C9B5F7', '#FF8FB8']
  const top = 5.25
  const z = BACK_Z + 0.06
  const sag = (x: number) => top - 0.35 * Math.sin(Math.PI * (((x - x0) / 3) % 1))
  for (let a = x0; a < x1 - 0.1; a += 3) {
    const pts: Vector3[] = []
    for (let i = 0; i <= 8; i++) pts.push(new Vector3(a + (3 * i) / 8, sag(a + (3 * i) / 8 - 1e-4), z))
    parts.push(bake(new TubeGeometry(new CatmullRomCurve3(pts), 16, 0.018, 5), SHOE))
  }
  let i = 0
  for (let x = x0 + 0.2; x < x1 - 0.1; x += 0.36) {
    if (((x - x0) / 3) % 1 < 0.05) continue
    parts.push(P.prism([[-0.13, 0], [0.13, 0], [0, -0.3]], 0.02, colors[i++ % colors.length], { at: [x, sag(x) - 0.01, z + 0.01] }))
  }
  return parts
}
