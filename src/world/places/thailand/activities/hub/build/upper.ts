// Upstairs: the room Kaylee sleeps in. A row of mattresses on the floor along the left wall, all the way to the end of
// the room; the couch on the right; her suitcase; a wardrobe; a fan; the balcony doors at the front (street.ts); and
// the stairwell with its railing.
import { Group } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { standingFan } from './ground'
import { part, poke, scenery, type Kit } from './kit'

const FLOOR = '#F7DEC4'
const BOARD = '#EDCDAE'
const WALL = '#F1E8FF'
const WOOD = '#E9B98E'
const COUCH = '#C9B8FF'
const COUCH_DARK = '#B4A0F2'

export interface Upper {
  room: Group
  rightWall: Group
}

export function buildUpper(kit: Kit): Upper {
  const room = new Group()
  const rightWall = new Group()
  const { left, right, back, g0: U, g1 } = DIM
  const { x0: sx0, zTop, zBottom } = DIM.stairs
  const depth = -back

  // ---- Floor (wood boards) with the stairwell hole, walls ----
  const boards = []
  for (let x = left + 0.3; x < sx0; x += 0.6) boards.push(P.box(0.02, 0.005, depth, BOARD, { at: [x, U + 0.003, back / 2] }))
  room.add(
    scenery(kit, [
      P.box(sx0 - left + 0.15, 0.2, depth, FLOOR, { at: [(left - 0.15 + sx0) / 2, U - 0.1, back / 2] }),
      P.box(right + 0.15 - sx0, 0.2, -zBottom, FLOOR, { at: [(sx0 + right + 0.15) / 2, U - 0.1, zBottom / 2] }),
      P.box(right + 0.15 - sx0, 0.2, zTop - back, FLOOR, { at: [(sx0 + right + 0.15) / 2, U - 0.1, (zTop + back) / 2] }),
      ...boards,
    ]),
  )
  room.add(
    scenery(kit, [
      P.box(0.15, g1, depth, WALL, { at: [left - 0.075, U + g1 / 2, back / 2] }),
      P.box(right - left + 0.3, g1, 0.15, WALL, { at: [0, U + g1 / 2, back - 0.075] }),
      P.box(0.03, 0.12, depth, '#D9C3F5', { at: [left + 0.015, U + 0.06, back / 2] }),
      // Kaylee's drawings taped above the mattresses.
      ...[
        [-11.2, PAL.pink],
        [-10.3, PAL.butter],
        [-9.5, PAL.sky],
        [-7.8, PAL.mint],
      ].map(([z, c], i) => P.box(0.02, 0.36, 0.3, c as string, { at: [left + 0.01, U + 1.45 + (i % 2) * 0.18, z as number], rot: [(i % 2 ? 0.08 : -0.06), 0, 0] })),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g1, depth, WALL, { at: [right + 0.075, U + g1 / 2, back / 2] })]))

  // ---- The mattresses along the left wall, all the way to the end of the room ----
  const mattress = poke(kit, 'mattress', [], [-1.25, U, -9.4])
  const sheets = [PAL.pink, PAL.lavender, '#FFD3E6']
  const len = (-6.2 - -12.6) / 3
  sheets.forEach((c, i) => {
    const z = -12.6 + len * (i + 0.5) - -9.4
    mattress.add(scenery(kit, [P.rbox(1.58, 0.2, len - 0.04, 0.06, PAL.cream, { at: [0, 0.1, z] }), P.rbox(1.5, 0.03, len - 0.14, 0.02, c, { at: [0, 0.205, z] })], 2))
  })
  // A folded blanket in the middle of the row.
  mattress.add(scenery(kit, [P.rbox(1.2, 0.12, 0.5, 0.05, PAL.lavenderDark, { at: [0, 0.27, 1.6] })], 2))
  room.add(mattress)
  room.add(poke(kit, 'pillows', [P.rbox(0.62, 0.16, 0.4, 0.07, PAL.cream, { at: [-0.38, 0.08, 0] }), P.rbox(0.62, 0.16, 0.4, 0.07, '#FFE3EF', { at: [0.38, 0.08, 0] }), P.box(0.62, 0.012, 0.06, PAL.hotpink, { at: [0.38, 0.165, 0] })], [-1.25, U + 0.2, -12.2]))

  // ---- The couch on the right (faces left) ----
  room.add(
    poke(
      kit,
      'couch',
      [
        P.rbox(0.75, 0.3, 2.4, 0.08, COUCH_DARK, { at: [0, 0.2, 0] }),
        P.rbox(0.62, 0.14, 1.12, 0.06, COUCH, { at: [-0.04, 0.41, -0.58] }),
        P.rbox(0.62, 0.14, 1.12, 0.06, COUCH, { at: [-0.04, 0.41, 0.58] }),
        P.rbox(0.2, 0.62, 2.4, 0.08, COUCH, { at: [0.28, 0.6, 0] }),
        P.rbox(0.72, 0.42, 0.18, 0.07, COUCH, { at: [0, 0.45, -1.15] }),
        P.rbox(0.72, 0.42, 0.18, 0.07, COUCH, { at: [0, 0.45, 1.15] }),
        P.rbox(0.12, 0.34, 0.34, 0.06, PAL.butter, { at: [0.12, 0.66, 0.65], rot: [0, 0, 0.2] }),
      ],
      [1.67, U, -4.1],
    ),
  )

  // ---- Her suitcase (the lid opens), the wardrobe (the doors open), a fan ----
  const suitcase = poke(kit, 'suitcase', [P.rbox(0.62, 0.26, 0.42, 0.05, PAL.hotpink, { at: [0, 0.13, 0] }), P.box(0.64, 0.03, 0.06, PAL.gold, { at: [0, 0.13, 0.2] })], [-0.05, U, -2.7])
  const lid = part(kit, 'suitcase.hinge', [P.rbox(0.62, 0.08, 0.42, 0.04, PAL.hotpink, { at: [0, 0.04, 0.21] }), P.torus(0.06, 0.015, PAL.gold, { at: [0, 0.08, 0.3], rot: [Math.PI / 2, 0, 0] })], [0, 0.26, -0.21], 2)
  lid.userData.swingX = -1.6
  suitcase.add(lid)
  room.add(suitcase)
  const wardrobe = poke(kit, 'wardrobe', [P.box(1.2, 2.0, 0.5, WOOD, { at: [0, 1.0, 0] })], [-0.3, U, back + 0.26])
  for (const side of [-1, 1]) {
    const h = part(kit, `wardrobe.hinge${side < 0 ? 'L' : 'R'}`, [P.box(0.58, 1.86, 0.04, '#F2CBA6', { at: [-side * 0.29, 0.93, 0] }), P.sphere(0.03, PAL.gold, { at: [-side * 0.5, 1.0, 0.04] })], [side * 0.59, 0.07, 0.27], 1.5)
    h.userData.swing = -side * 1.3
    wardrobe.add(h)
  }
  room.add(wardrobe)
  room.add(standingFan(kit, 'room-fan', [-0.15, U, -5.6], 0.2))

  // ---- Railing around the stairwell ----
  const posts = []
  for (let z = zTop; z <= zBottom + 0.01; z += 0.35) posts.push(P.box(0.05, 0.9, 0.05, PAL.cream, { at: [sx0 - 0.04, U + 0.45, z] }))
  for (let x = sx0; x <= right; x += 0.4) posts.push(P.box(0.05, 0.9, 0.05, PAL.cream, { at: [x, U + 0.45, zBottom + 0.04] }))
  posts.push(P.box(0.08, 0.08, zBottom - zTop, WOOD, { at: [sx0 - 0.04, U + 0.92, (zTop + zBottom) / 2] }), P.box(right - sx0, 0.08, 0.08, WOOD, { at: [(sx0 + right) / 2, U + 0.92, zBottom + 0.04] }))
  room.add(poke(kit, 'stairs-down', [], [0, 0, 0]).add(scenery(kit, posts, 1.5)))

  return { room, rightWall }
}
