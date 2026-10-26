// Kaylee's room upstairs, like the real one (Dad's photos, 2026-10-24): a long room split by a cream plastic accordion
// partition. In front of it, the TV room: the grey leather L sofa along the right wall (BB sits there), a dark wood
// glass cabinet in the corner by the glass doors, the TV on the left wall in the nook behind the stairwell over a light
// wood stand of toys, the wooden chair in the corner, a fan, the pink bouncy unicorn, a little table and foam play mats.
// Behind it, where she sleeps: the big mattress, the chrome clothes rack full of her dresses and the clear plastic
// drawers along the right wall with the globe lamp on top, her suitcase, the air conditioner, the blue basket and the
// bathroom door (aluminium like the real one, Dad's photo 2026-10-18; it's locked: it only rattles).
// Positions come from layout.ts (ROOM, DIM.partition).
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM, ROOM } from '../layout'
import { standingFan } from './ground'
import { part, poke, scenery, type Kit } from './kit'

const ALU = '#C3C7CD'
const LEATHER = '#A7A9B1'
const LEATHER_DARK = '#8E909A'
const LEATHER_SEAT = '#BDBFC7'
const DARK_WOOD = '#5A3D2E'
const LIGHT_WOOD = '#DDBF93'
const CHROME = '#C9CDD3'
const PLASTIC = '#F3EEE2'
const PLASTIC_RIB = '#E1D8C7'

/** The accordion partition: `set(closed)` lays its panels out, 0 = folded against the right wall, 1 = across the room. */
export interface Partition {
  /** Lowered by the cutaway while she's behind it (scales from the upstairs floor). */
  root: Group
  set(closed: number): void
}

export function buildRoom(kit: Kit, room: Group): { partition: Partition } {
  const { left, right, back, g0: U } = DIM
  room.add(sofa(kit), cabinet(kit), tvCorner(kit), unicorn(kit), littleTable(kit), clothesRack(kit), drawers(kit))
  room.add(standingFan(kit, 'room-fan', [ROOM.fan.x, U, ROOM.fan.z], Math.PI / 2 - 0.35))

  // ---- One big mattress against the left wall, a meter off the back wall, its long side across the room ----
  const bed = { x: left + 1.5, z: back + 1.0 + 1.1875, len: 3.0, w: 2.375 }
  const mattress = poke(kit, 'mattress', [], [bed.x, U, bed.z])
  mattress.add(scenery(kit, [P.rbox(bed.len, 0.22, bed.w, 0.06, PAL.cream, { at: [0, 0.11, 0] }), P.rbox(bed.len - 0.1, 0.03, bed.w - 0.08, 0.02, PAL.pink, { at: [0, 0.225, 0] })], 2))
  // A folded blanket across its foot.
  mattress.add(scenery(kit, [P.rbox(0.45, 0.1, bed.w - 0.2, 0.05, PAL.lavenderDark, { at: [bed.len / 2 - 0.35, 0.27, 0] })], 2))
  room.add(mattress)
  room.add(poke(kit, 'pillows', [P.rbox(0.5, 0.18, 0.78, 0.08, PAL.cream, { at: [0, 0.09, -0.59] }), P.rbox(0.5, 0.18, 0.78, 0.08, '#FFE3EF', { at: [0, 0.09, 0.59] }), P.box(0.07, 0.012, 0.78, PAL.hotpink, { at: [0, 0.185, 0.59] })], [left + 0.35, U + 0.2, bed.z]))

  // ---- Her suitcase (the lid opens), the air conditioner, the bathroom door ----
  const suitcase = poke(kit, 'suitcase', [P.rbox(0.62, 0.26, 0.42, 0.05, PAL.hotpink, { at: [0, 0.13, 0] }), P.box(0.64, 0.03, 0.06, PAL.gold, { at: [0, 0.13, 0.2] })], [0.3, U, -20.448], { rotY: Math.PI })
  const lid = part(kit, 'suitcase.hinge', [P.rbox(0.62, 0.08, 0.42, 0.04, PAL.hotpink, { at: [0, 0.04, 0.21] }), P.torus(0.06, 0.015, PAL.gold, { at: [0, 0.08, 0.3], rot: [Math.PI / 2, 0, 0] })], [0, 0.26, -0.21], 2)
  lid.userData.swingX = -1.6
  suitcase.add(lid)
  room.add(suitcase)
  room.add(airCon(kit, [-1.0, U + 2.45, back]))
  room.add(bathroomDoor(kit, [2.2, U, back]))
  // A blue laundry basket by the bathroom door, like the real one.
  const BASKET = '#3D8FD6'
  room.add(
    scenery(kit, [
      P.cyl(0.21, 0.18, 0.42, BASKET, { at: [1.42, U + 0.21, back + 0.32] }, 12),
      P.torus(0.21, 0.02, '#5AA7E8', { at: [1.42, U + 0.42, back + 0.32], rot: [Math.PI / 2, 0, 0] }),
      ...[0.14, 0.28].flatMap((y, row) =>
        Array.from({ length: 9 }, (_, i) => {
          const a = ((i + row * 0.5) / 9) * Math.PI * 2
          const r = 0.183 + y * 0.072
          return P.cyl(0.032, 0.032, 0.01, '#E3F1FB', { at: [1.42 + Math.sin(a) * r, U + y, back + 0.32 + Math.cos(a) * r], rot: [0, a + Math.PI / 2, Math.PI / 2] })
        }),
      ),
    ]),
  )

  // ---- Foam play mats on the floor of the TV room ----
  const [mx0, mx1, mz0, mz1] = ROOM.mats
  const tile = 0.6
  const mats: BufferGeometry[] = []
  const matColors = [PAL.pink, PAL.mint, PAL.butter, PAL.sky, PAL.lavender, PAL.peach]
  for (let i = 0; i * tile < mx1 - mx0 - 0.01; i++)
    for (let j = 0; j * tile < mz1 - mz0 - 0.01; j++) mats.push(P.box(tile - 0.015, 0.02, tile - 0.015, matColors[(i * 2 + j) % matColors.length], { at: [mx0 + (i + 0.5) * tile, U + 0.012, mz0 + (j + 0.5) * tile] }))
  room.add(scenery(kit, mats, 1))

  return { partition: partition(kit, right - left) }
}

/** The grey leather L sofa along the right wall (faces left), its chaise end turning out toward the partition. */
function sofa(kit: Kit) {
  const [x0, x1, z0, z1] = ROOM.sofa
  const [cx0, , cz0, cz1] = ROOM.chaise
  const d = x1 - x0
  const len = z1 - z0
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const cw = x1 - cx0
  const parts: BufferGeometry[] = [
    // The long part: base, back against the wall, the arm at the front end, three seat cushions.
    P.rbox(d, 0.3, len, 0.08, LEATHER_DARK, { at: [0, 0.2, 0] }),
    P.rbox(0.22, 0.64, len, 0.08, LEATHER, { at: [d / 2 - 0.11, 0.62, 0] }),
    P.rbox(d, 0.44, 0.2, 0.08, LEATHER, { at: [0, 0.47, len / 2 - 0.1] }),
    ...[0, 1, 2].map((i) => P.rbox(d - 0.28, 0.14, (len - 0.24) / 3 - 0.03, 0.06, LEATHER_SEAT, { at: [-0.1, 0.42, len / 2 - 0.2 - ((i + 0.5) * (len - 0.24)) / 3] })),
    // The chaise end: a deep seat turning out from the wall, its back along the partition side.
    P.rbox(cw, 0.3, cz1 - cz0, 0.08, LEATHER_DARK, { at: [x1 - cw / 2 - cx, 0.2, (cz0 + cz1) / 2 - cz] }),
    P.rbox(cw - 0.22, 0.14, cz1 - cz0 - 0.24, 0.06, LEATHER_SEAT, { at: [x1 - cw / 2 - cx - 0.1, 0.42, (cz0 + cz1) / 2 - cz + 0.04] }),
    P.rbox(cw, 0.64, 0.2, 0.08, LEATHER, { at: [x1 - cw / 2 - cx, 0.62, cz0 + 0.1 - cz] }),
    P.rbox(0.18, 0.44, cz1 - cz0, 0.07, LEATHER, { at: [cx0 + 0.09 - cx, 0.47, (cz0 + cz1) / 2 - cz] }),
    // A pink cushion and her teal one.
    P.rbox(0.12, 0.34, 0.34, 0.06, PAL.pink, { at: [d / 2 - 0.3, 0.68, len / 2 - 0.55], rot: [0, 0, 0.2] }),
    P.rbox(0.12, 0.3, 0.3, 0.06, '#7FD3D0', { at: [d / 2 - 0.3, 0.66, -0.2], rot: [0, 0, 0.25] }),
  ]
  return poke(kit, 'couch', parts, [cx, DIM.g0, cz])
}

/** The dark wood cabinet in the corner by the glass doors: shelves of treasures behind a glass door that swings open. */
function cabinet(kit: Kit) {
  const [x0, x1, z0, z1] = ROOM.cabinet
  const d = x1 - x0
  const w = z1 - z0
  const H = 1.85
  const g = poke(
    kit,
    'cabinet',
    [
      P.box(0.04, H, w, DARK_WOOD, { at: [d / 2 - 0.02, H / 2, 0] }),
      ...[-1, 1].map((s) => P.box(d, H, 0.04, DARK_WOOD, { at: [0, H / 2, (s * (w - 0.04)) / 2] })),
      P.box(d, 0.08, w, DARK_WOOD, { at: [0, 0.04, 0] }),
      P.box(d + 0.04, 0.06, w + 0.04, DARK_WOOD, { at: [0, H - 0.03, 0] }),
      // Shelves and what's on them: a teapot, little elephants, jars, a photo.
      ...[0.5, 0.95, 1.4].map((y) => P.box(d - 0.04, 0.025, w - 0.06, '#6E4D3B', { at: [0, y, 0] })),
      P.sphere(0.08, PAL.cream, { at: [0, 0.6, -0.15] }),
      P.cyl(0.05, 0.06, 0.16, '#5B7FC2', { at: [0, 0.6, 0.15] }),
      ...[-0.14, 0.02].map((z) => P.rbox(0.12, 0.1, 0.07, 0.03, '#9AA0AE', { at: [0, 1.02, z] })),
      P.cyl(0.06, 0.06, 0.2, PAL.gold, { at: [0, 1.05, 0.18] }),
      P.box(0.03, 0.2, 0.16, PAL.peach, { at: [0.08, 1.52, -0.05], rot: [0, 0, 0.12] }),
      P.cyl(0.05, 0.05, 0.12, '#D45454', { at: [0, 1.48, 0.2] }),
    ],
    [(x0 + x1) / 2, DIM.g0, (z0 + z1) / 2],
  )
  // The glass door on the room side, hinged at its front edge.
  const glassMat = kit.bag.add(new MeshBasicMaterial({ color: '#BFE3F2', transparent: true, opacity: 0.3, depthWrite: false }))
  const door = part(kit, 'cabinet.hinge', [P.box(0.03, H - 0.16, 0.04, DARK_WOOD, { at: [0, (H - 0.16) / 2, -0.02] }), P.box(0.03, H - 0.16, 0.04, DARK_WOOD, { at: [0, (H - 0.16) / 2, -(w - 0.06)] }), P.box(0.03, 0.04, w - 0.06, DARK_WOOD, { at: [0, 0.02, -(w - 0.06) / 2] }), P.box(0.03, 0.04, w - 0.06, DARK_WOOD, { at: [0, H - 0.18, -(w - 0.06) / 2] })], [-d / 2, 0.08, w / 2 - 0.03], 1.5)
  door.add(new Mesh(kit.bag.add(P.box(0.01, H - 0.2, w - 0.1, '#FFFFFF', { at: [0, (H - 0.16) / 2, -(w - 0.06) / 2] })), glassMat))
  door.userData.swing = 1.4
  g.add(door)
  return g
}

/** The TV room's corner behind the stairwell: the TV on the left wall over a light wood stand of toys, the wooden chair. */
function tvCorner(kit: Kit) {
  const { left, g0: U } = DIM
  const g = new Group()
  const [sx0, sx1, sz0, sz1] = ROOM.tvStand
  const sd = sx1 - sx0
  const sl = sz1 - sz0
  const scx = (sx0 + sx1) / 2
  const scz = (sz0 + sz1) / 2
  g.add(
    scenery(kit, [
      P.rbox(sd, 0.5, sl, 0.03, LIGHT_WOOD, { at: [scx, U + 0.25, scz] }),
      // Two drawers and an open cubby full of toys.
      ...[-1, 1].map((s) => P.box(0.02, 0.18, sl / 2 - 0.08, '#CFAE7F', { at: [sx1 + 0.005, U + 0.14, scz + (s * sl) / 4] })),
      ...[-1, 1].map((s) => P.box(0.03, 0.025, 0.14, PAL.ink, { at: [sx1 + 0.02, U + 0.16, scz + (s * sl) / 4] })),
      P.box(0.02, 0.2, sl - 0.1, '#B89466', { at: [sx1 + 0.002, U + 0.38, scz] }),
      P.rbox(0.18, 0.14, 0.2, 0.03, PAL.pink, { at: [scx + 0.05, U + 0.37, sz0 + 0.25] }),
      P.rbox(0.16, 0.12, 0.16, 0.03, PAL.mint, { at: [scx + 0.05, U + 0.36, scz + 0.05] }),
      P.rbox(0.14, 0.12, 0.18, 0.03, PAL.butter, { at: [scx + 0.05, U + 0.36, sz1 - 0.22] }),
      // On top: a pink toy kitchen and a few blocks.
      P.rbox(0.28, 0.26, 0.34, 0.04, '#FFB3D6', { at: [scx, U + 0.63, sz1 - 0.3] }),
      P.cyl(0.04, 0.04, 0.02, PAL.ink, { at: [scx + 0.15, U + 0.7, sz1 - 0.3], rot: [0, 0, Math.PI / 2] }),
      ...[PAL.sky, PAL.gold, PAL.hotpink].map((c, i) => P.box(0.09, 0.09, 0.09, c, { at: [scx + 0.04, U + 0.545, sz0 + 0.18 + i * 0.13], rot: [0, i * 0.4, 0] })),
    ]),
  )
  // The TV: a big black flat screen on the wall. The screen lights up in candy colours when she taps it.
  const { z, y, w, h } = ROOM.tv
  const tv = poke(kit, 'tv', [P.rbox(0.06, h, w, 0.02, '#26232B', { at: [0, 0, 0] }), P.box(0.05, 0.1, 0.24, '#3A3640', { at: [-0.02, 0, 0] })], [left + 0.03, U + y, z], { px: 1.5 })
  const screenMat = kit.bag.add(new MeshBasicMaterial({ color: '#34303C' }))
  const screen = new Mesh(kit.bag.add(P.box(0.005, h - 0.06, w - 0.06, '#FFFFFF', { at: [0.032, 0, 0] })), screenMat)
  kit.parts.set('tv.screen', screen)
  tv.add(screen)
  g.add(tv)
  // The wooden chair in the corner, facing the room.
  const { x: chx, z: chz } = ROOM.chair
  const legs = [-1, 1].flatMap((a) => [-1, 1].map((b) => P.box(0.04, 0.45, 0.04, DARK_WOOD, { at: [a * 0.18, 0.225, b * 0.18] })))
  g.add(
    poke(
      kit,
      'chair',
      [...legs, P.rbox(0.44, 0.05, 0.44, 0.02, DARK_WOOD, { at: [0, 0.47, 0] }), ...[-1, 1].map((b) => P.box(0.04, 0.5, 0.04, DARK_WOOD, { at: [-0.2, 0.72, b * 0.18] })), P.rbox(0.04, 0.16, 0.42, 0.02, DARK_WOOD, { at: [-0.2, 0.9, 0] }), P.box(0.03, 0.04, 0.38, DARK_WOOD, { at: [-0.2, 0.65, 0] })],
      [chx, U, chz],
    ),
  )
  return g
}

/** The pink bouncy unicorn (a ride-on hopper): a round body, stubby blue feet, a head with handles and a golden horn. */
function unicorn(kit: Kit) {
  const PINK = '#FF9CC6'
  const FEET = '#4FA7E8'
  const parts: BufferGeometry[] = [
    P.sphere(0.27, PINK, { at: [0, 0.3, 0], scale: [1.25, 1, 0.95] }),
    ...[-1, 1].flatMap((a) => [-1, 1].map((b) => P.sphere(0.075, FEET, { at: [a * 0.2, 0.07, b * 0.14], scale: [1.2, 0.8, 1] }))),
    // Head and snout, ears, horn, the mane and the tail.
    P.sphere(0.15, PINK, { at: [0.27, 0.58, 0] }),
    P.sphere(0.09, '#FFC2DA', { at: [0.39, 0.53, 0], scale: [1.1, 0.85, 1] }),
    ...[-1, 1].map((s) => P.cone(0.04, 0.1, PINK, { at: [0.22, 0.73, s * 0.08], rot: [s * -0.3, 0, 0.2] })),
    P.cone(0.035, 0.16, PAL.gold, { at: [0.32, 0.77, 0], rot: [0, 0, -0.45] }),
    ...[0, 1, 2].map((i) => P.sphere(0.06, [PAL.lavenderDark, PAL.sky, PAL.mint][i], { at: [0.15 - i * 0.06, 0.62 - i * 0.07, 0] })),
    P.sphere(0.07, PAL.lavenderDark, { at: [-0.34, 0.36, 0], scale: [0.8, 1.2, 0.8] }),
    // Eyes, and the handles out of its head.
    ...[-1, 1].map((s) => P.sphere(0.022, PAL.ink, { at: [0.34, 0.62, s * 0.085] })),
    P.cyl(0.025, 0.025, 0.34, FEET, { at: [0.25, 0.64, 0], rot: [Math.PI / 2, 0, 0] }),
    ...[-1, 1].map((s) => P.sphere(0.04, FEET, { at: [0.25, 0.64, s * 0.17] })),
  ]
  return poke(kit, 'unicorn', parts, [ROOM.unicorn.x, DIM.g0, ROOM.unicorn.z], { rotY: -0.25 })
}

/** A little white table with teal legs, blocks on top. */
function littleTable(kit: Kit) {
  const TEAL = '#3FA7A0'
  const { x, z } = ROOM.table
  const legs = [-1, 1].flatMap((a) => [-1, 1].map((b) => P.cyl(0.025, 0.025, 0.42, TEAL, { at: [x + a * 0.25, DIM.g0 + 0.21, z + b * 0.17] }, 8)))
  return scenery(kit, [...legs, P.rbox(0.6, 0.04, 0.44, 0.015, '#FBFBF8', { at: [x, DIM.g0 + 0.44, z] }), P.box(0.08, 0.08, 0.08, PAL.hotpink, { at: [x - 0.1, DIM.g0 + 0.5, z] }), P.box(0.08, 0.08, 0.08, PAL.sky, { at: [x + 0.05, DIM.g0 + 0.5, z + 0.06], rot: [0, 0.5, 0] }), P.box(0.07, 0.07, 0.07, PAL.gold, { at: [x - 0.04, DIM.g0 + 0.575, z + 0.01], rot: [0, 0.3, 0] })], 1.5)
}

/** The chrome clothes rack on wheels along the right wall, full of her dresses (they jump on their hangers when tapped). */
function clothesRack(kit: Kit) {
  const [x0, x1, z0, z1] = ROOM.rack
  const cx = (x0 + x1) / 2
  const cz = (z0 + z1) / 2
  const len = z1 - z0
  const H = 1.55
  const g = poke(
    kit,
    'clothes-rack',
    [
      ...[-1, 1].map((s) => P.cyl(0.018, 0.018, H, CHROME, { at: [0, H / 2 + 0.06, (s * (len - 0.06)) / 2] }, 8)),
      P.cyl(0.018, 0.018, len, CHROME, { at: [0, H + 0.06, 0], rot: [Math.PI / 2, 0, 0] }, 8),
      ...[-1, 1].map((s) => P.box(x1 - x0 - 0.04, 0.03, 0.03, CHROME, { at: [0, 0.07, (s * (len - 0.06)) / 2] })),
      ...[-1, 1].flatMap((a) => [-1, 1].map((b) => P.sphere(0.035, '#5A5A60', { at: [(a * (x1 - x0 - 0.08)) / 2, 0.035, (b * (len - 0.06)) / 2] }))),
    ],
    [cx, DIM.g0, cz],
    { px: 1.5 },
  )
  const colors = [PAL.pink, PAL.peach, '#FFB3D6', PAL.butter, PAL.mint, '#E86A8E', PAL.sky, PAL.hotpink]
  const n = colors.length
  colors.forEach((c, i) => {
    const long = 0.55 + ((i * 37) % 5) * 0.07
    const top = 0.14
    const bottom = 0.24 + ((i * 13) % 3) * 0.03
    const dress = P.prism([[-top, 0], [top, 0], [bottom, -long], [-bottom, -long]], 0.03, c, { at: [0, -0.08, 0] })
    const hook = P.torus(0.03, 0.006, CHROME, { at: [0, 0.02, 0], rot: [0, 0, 0] })
    const hanger = P.box(top * 2 + 0.04, 0.015, 0.012, PAL.cream, { at: [0, -0.07, 0] })
    const sleeves = [-1, 1].map((s) => P.sphere(0.05, c, { at: [s * (top + 0.01), -0.12, 0], scale: [1, 0.8, 0.5] }))
    const z = -len / 2 + 0.12 + (i * (len - 0.24)) / (n - 1)
    g.add(part(kit, `clothes-rack.hop${i}`, [dress, hook, hanger, ...sleeves], [0, H + 0.05, z], 1.5))
  })
  return g
}

/** Two towers of clear plastic drawers along the right wall (her clothes in pastel lumps inside), the globe lamp on top. */
function drawers(kit: Kit) {
  const [x0, x1, z0, z1] = ROOM.drawers
  const d = x1 - x0
  const half = (z1 - z0) / 2
  const H = 1.0
  const parts: BufferGeometry[] = []
  const inside = [PAL.pink, PAL.sky, PAL.butter, PAL.mint, PAL.peach, PAL.lavender, '#FFB3D6', PAL.mint]
  for (let t = 0; t < 2; t++) {
    const cz = z0 + half * (t + 0.5)
    parts.push(P.box(d, H, half - 0.02, '#F7F7F5', { at: [(x0 + x1) / 2, DIM.g0 + H / 2, cz] }))
    for (let k = 0; k < 4; k++) {
      const y = DIM.g0 + 0.13 + k * 0.24
      parts.push(P.box(0.02, 0.2, half - 0.08, '#DCE8EE', { at: [x0 - 0.005, y, cz] }))
      parts.push(P.rbox(0.03, 0.09, half - 0.2, 0.02, inside[(t * 4 + k) % inside.length], { at: [x0 + 0.002, y - 0.03, cz] }))
      parts.push(P.box(0.025, 0.025, 0.1, '#B8C4CC', { at: [x0 - 0.02, y + 0.06, cz] }))
    }
  }
  const g = new Group()
  g.add(scenery(kit, parts, 1.5))
  // The globe lamp: a white ball that glows warm (tap it: off, on).
  const lx = (x0 + x1) / 2 - 0.02
  const lz = z0 + half * 1.5
  const lamp = poke(kit, 'lamp', [P.cyl(0.07, 0.09, 0.05, PAL.ink, { at: [0, 0.025, 0] }), P.cyl(0.03, 0.03, 0.06, PAL.ink, { at: [0, 0.07, 0] })], [lx, DIM.g0 + H, lz], { px: 1.5 })
  const globeMat = kit.bag.add(new MeshBasicMaterial({ color: '#FFF3C4' }))
  const globe = new Mesh(kit.bag.add(P.sphere(0.14, '#FFFFFF', { at: [0, 0.22, 0] })), globeMat)
  kit.parts.set('lamp.globe', globe)
  lamp.add(globe)
  g.add(lamp)
  return g
}

/**
 * The cream plastic accordion partition across the room, like the real one: `n` ribbed panels (no header beam across
 * the room over them, Dad 2026-10-25). Its panels zig-zag: folded open they stand almost edge-on in a stack against
 * the right wall; closed they spread across the room. One poke ('partition'): any panel is a tap on it.
 */
function partition(kit: Kit, span: number): Partition {
  const { right, g0: U } = DIM
  const { z, n } = DIM.partition
  const H = 2.42
  const OPEN = 1.48
  const SHUT = 0.25
  const pw = span / (n * Math.cos(SHUT))
  const root = new Group()
  const g = poke(kit, 'partition', [], [0, 0, 0])
  const panels = Array.from({ length: n }, () => {
    const p = new Group()
    p.add(scenery(kit, [P.box(pw, H - 0.04, 0.025, PLASTIC, { at: [0, U + H / 2, 0] }), ...[-0.3, 0, 0.3].map((f) => P.box(0.02, H - 0.1, 0.03, PLASTIC_RIB, { at: [f * pw, U + H / 2, 0] }))], 1))
    g.add(p)
    return p
  })
  // The leading edge: a handle on the last panel (the one that pulls across).
  panels[0].add(scenery(kit, [P.box(0.03, 0.22, 0.05, '#BFB6A6', { at: [-pw / 2 + 0.05, U + 1.0, 0] })], 1))
  root.add(g)
  return {
    root,
    set(closed: number) {
      const a = OPEN + (SHUT - OPEN) * closed
      const step = pw * Math.cos(a)
      panels.forEach((p, i) => {
        p.position.set(right - 0.02 - (n - i - 0.5) * step, 0, z)
        p.rotation.y = i % 2 ? a : -a
      })
    },
  }
}

/**
 * The bathroom door at the back of her room, like the real one: an aluminium door in a dark wood frame, dark screen
 * panels on top with a little vent window, a brushed aluminium panel below. It's locked; tapping it only rattles it.
 */
function bathroomDoor(kit: Kit, at: [number, number, number]) {
  const W = 0.86
  const H = 2.04
  const JAMB = '#3A2A22'
  const SCREEN = '#4A4A50'
  const g = new Group()
  g.add(scenery(kit, [...[-1, 1].map((s) => P.box(0.07, H + 0.08, 0.1, JAMB, { at: [at[0] + s * (W / 2 + 0.035), at[1] + (H + 0.08) / 2, at[2] + 0.03] })), P.box(W + 0.14, 0.07, 0.1, JAMB, { at: [at[0], at[1] + H + 0.045, at[2] + 0.03] })]))
  g.add(
    poke(
      kit,
      'bathroom-door',
      [
        // The aluminium frame: stiles, rails, and the rails between the panels.
        ...[-1, 1].map((s) => P.box(0.05, H, 0.04, ALU, { at: [s * (W / 2 - 0.025), H / 2, 0] })),
        ...[0.025, 1.18, 1.6, H - 0.025].map((y) => P.box(W, y === 1.18 ? 0.04 : 0.05, 0.04, ALU, { at: [0, y, 0] })),
        // Brushed panel below, dark screens above.
        P.box(W - 0.1, 1.13, 0.02, '#B4B9C0', { at: [0, 0.6, 0.004] }),
        ...[-0.2, 0.12].map((x, i) => P.box(0.03, 0.8 - i * 0.2, 0.021, '#BCC1C7', { at: [x, 0.66 + i * 0.06, 0.005] })),
        P.box(W - 0.1, 0.38, 0.015, SCREEN, { at: [0, 1.795, 0] }),
        P.box(W - 0.1, 0.38, 0.015, SCREEN, { at: [0, 1.39, 0] }),
        // The little vent window (it opens, but not for her), its latch, the handle.
        P.box(0.22, 0.44, 0.05, ALU, { at: [-W / 2 + 0.16, 1.37, 0.01] }),
        P.box(0.15, 0.36, 0.052, '#5A5A60', { at: [-W / 2 + 0.16, 1.37, 0.01] }),
        P.box(0.02, 0.07, 0.03, '#8E949C', { at: [-W / 2 + 0.06, 1.45, 0.04] }),
        P.cyl(0.03, 0.03, 0.02, '#9AA0A8', { at: [W / 2 - 0.1, 1.0, 0.03], rot: [Math.PI / 2, 0, 0] }),
        P.box(0.13, 0.025, 0.03, '#9AA0A8', { at: [W / 2 - 0.15, 1.0, 0.05] }),
      ],
      [at[0], at[1], at[2] + 0.03],
      { px: 1.5 },
    ),
  )
  return g
}

/**
 * The wall-mounted mini-split air conditioner, like in every Thai bedroom: a long white rounded box with a softly
 * curved front panel, the intake grille on top, the louver flap along its bottom tipped down to blow cool air, a little
 * display with a green light, a sky-blue snowflake, and the pipe cover going into the wall at its left end.
 */
function airCon(kit: Kit, at: [number, number, number]) {
  const W = 1.25
  const WHITE = '#FBFBF8'
  const g = poke(
    kit,
    'aircon',
    [
      P.rbox(W, 0.36, 0.25, 0.1, WHITE, { at: [0, 0, 0.125] }),
      // Its end caps, a shade darker.
      ...[-1, 1].map((s) => P.rbox(0.04, 0.34, 0.24, 0.015, '#ECECE8', { at: [s * (W / 2 - 0.015), 0, 0.125] })),
      // The intake grille on top.
      ...[0.06, 0.11, 0.16].map((z) => P.box(W - 0.16, 0.01, 0.022, '#D6D8DC', { at: [0, 0.18, z] })),
      // The front panel and the seam under it.
      P.rbox(W - 0.08, 0.2, 0.025, 0.012, '#F4F4F0', { at: [0, 0.05, 0.25] }),
      P.box(W - 0.1, 0.012, 0.012, '#D3D5DA', { at: [0, -0.065, 0.257] }),
      // The air slot and the louver flap.
      P.box(W - 0.14, 0.03, 0.09, '#8E949C', { at: [0, -0.16, 0.16] }),
      P.rbox(W - 0.16, 0.045, 0.11, 0.015, '#E8EAEE', { at: [0, -0.17, 0.22], rot: [-0.55, 0, 0] }),
      // The display (where the remote's temperature shows).
      P.rbox(0.17, 0.06, 0.012, 0.01, '#3C4250', { at: [W / 2 - 0.2, -0.02, 0.265] }),
      P.box(0.09, 0.025, 0.004, '#8FDBFF', { at: [W / 2 - 0.215, -0.02, 0.272] }),
      // A sky-blue snowflake on the panel.
      ...[0, 1, 2].map((i) => P.box(0.1, 0.014, 0.004, PAL.sky, { at: [-W / 2 + 0.2, 0.05, 0.265], rot: [0, 0, (i * Math.PI) / 3] })),
      // The pipe cover from its left end into the wall.
      P.box(0.09, 0.32, 0.06, '#F2F2EE', { at: [-W / 2 + 0.14, -0.33, 0.03] }),
    ],
    [at[0], at[1], at[2] + 0.005],
    { px: 1.5 },
  )
  g.add(part(kit, 'aircon.light', [P.sphere(0.014, '#5BD67A')], [W / 2 - 0.08, -0.02, 0.268], 0))
  return g
}
