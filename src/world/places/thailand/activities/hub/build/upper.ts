// Upstairs: the stairs come out in a small hallway (the front room's door stays shut), and glass sliding doors lead
// back into the room Kaylee sleeps in, at the back of the house. In her room: a row of mattresses on the floor along the
// left wall, all the way to the end of the room; the couch on the right; her suitcase; a wardrobe; a fan.
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { standingFan } from './ground'
import { part, poke, scenery, type Kit } from './kit'
import { railing } from './stairs'

const FLOOR = '#F7DEC4'
const BOARD = '#EDCDAE'
const WALL = '#F1E8FF'
const WOOD = '#E9B98E'
const COUCH = '#C9B8FF'
const COUCH_DARK = '#B4A0F2'
const FRAME = '#D8D2E6'
const DOOR = '#E3B386'

export interface Upper {
  room: Group
  rightWall: Group
  /** The front room's wall across the hallway (lowered while she's upstairs: it stands between the camera and her). */
  hallWall: Group
  /** The glass wall into her room (lowered while she's in the room). */
  glassWall: Group
}

export function buildUpper(kit: Kit): Upper {
  const room = new Group()
  const rightWall = new Group()
  const hallWall = new Group()
  const glassWall = new Group()
  const { left, right, back, g0: U, g1 } = DIM
  const { x0: sx0, x1: sx1, zFront, zBack } = DIM.stairs
  const { zFront: hz, zGlass, door0, door1 } = DIM.hall
  const depth = -back

  // ---- Floor (wood boards) with the stairwell hole, walls ----
  const boards = []
  for (let x = left + 0.3; x < right; x += 0.6) boards.push(P.box(0.02, 0.005, zGlass - back, BOARD, { at: [x, U + 0.003, (zGlass + back) / 2] }))
  room.add(
    scenery(kit, [
      P.box(right - left + 0.3, 0.2, -zFront, FLOOR, { at: [0, U - 0.1, zFront / 2] }),
      P.box(right + 0.15 - sx1, 0.2, zFront - zBack, FLOOR, { at: [(sx1 + right + 0.15) / 2, U - 0.1, (zFront + zBack) / 2] }),
      P.box(right - left + 0.3, 0.2, zBack - back, FLOOR, { at: [0, U - 0.1, (zBack + back) / 2] }),
      ...boards,
    ]),
  )
  room.add(
    scenery(kit, [
      P.box(0.15, g1, depth, WALL, { at: [left - 0.075, U + g1 / 2, back / 2] }),
      P.box(right - left + 0.3, g1, 0.15, WALL, { at: [0, U + g1 / 2, back - 0.075] }),
      P.box(0.03, 0.12, depth, '#D9C3F5', { at: [left + 0.015, U + 0.06, back / 2] }),
      // A window on the back wall, over the wardrobe's right.
      P.rbox(1.0, 1.0, 0.06, 0.03, '#CDEBFF', { at: [1.75, U + 1.65, back + 0.02] }),
      P.box(1.08, 0.06, 0.1, PAL.cream, { at: [1.75, U + 1.13, back + 0.04] }),
      P.box(0.04, 1.0, 0.08, PAL.cream, { at: [1.75, U + 1.65, back + 0.04] }),
      // Kaylee's drawings taped above the mattresses.
      ...[
        [-13.3, PAL.pink],
        [-14.2, PAL.butter],
        [-15.0, PAL.sky],
        [-16.2, PAL.mint],
      ].map(([z, c], i) => P.box(0.02, 0.36, 0.3, c as string, { at: [left + 0.01, U + 1.45 + (i % 2) * 0.18, z as number], rot: [(i % 2 ? 0.08 : -0.06), 0, 0] })),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g1, depth, WALL, { at: [right + 0.075, U + g1 / 2, back / 2] })]))

  // ---- The hallway: the front room's wall with its (shut) door, a plant, the railing round the stairwell ----
  hallWall.add(
    scenery(kit, [
      P.box(right - left, g1, 0.12, WALL, { at: [0, U + g1 / 2, hz + 0.06] }),
      P.box(0.9, 2.05, 0.04, DOOR, { at: [0.9, U + 1.025, hz - 0.02] }),
      P.sphere(0.04, PAL.gold, { at: [0.55, U + 1.0, hz - 0.05] }),
    ]),
  )
  // The front room behind it (someone else's; its door stays shut): a low bed and a chest of drawers.
  room.add(
    scenery(kit, [
      P.rbox(1.7, 0.32, 2.1, 0.06, WOOD, { at: [-1.5, U + 0.16, -3.6] }),
      P.rbox(1.6, 0.14, 1.9, 0.05, PAL.cream, { at: [-1.5, U + 0.37, -3.65] }),
      P.rbox(1.62, 0.06, 1.1, 0.03, '#BFE6DA', { at: [-1.5, U + 0.45, -3.2] }),
      P.rbox(0.62, 0.14, 0.4, 0.06, '#FFE3EF', { at: [-1.5, U + 0.5, -4.4] }),
      P.box(1.1, 0.9, 0.5, WOOD, { at: [1.7, U + 0.45, -5.0], rot: [0, -Math.PI / 2, 0] }),
      ...[0.25, 0.6].map((y) => P.box(0.02, 0.04, 0.8, PAL.gold, { at: [1.44, U + y, -5.0] })),
    ]),
  )
  room.add(poke(kit, 'plant', [P.cyl(0.18, 0.13, 0.3, '#EBA27E', { at: [0, 0.15, 0] }), P.sphere(0.24, '#7FCB8F', { at: [0, 0.45, 0] }), ...[0, 2, 4].map((a) => P.sphere(0.06, PAL.hotpink, { at: [Math.cos(a) * 0.18, 0.55, Math.sin(a) * 0.18] }))], [2.1, U, -7.85]))
  const rails: BufferGeometry[] = []
  railing(rails, [(sx0 + sx1) / 2 + 0.05, U, zFront - 0.04], [sx1, U, zFront - 0.04])
  railing(rails, [sx1 + 0.04, U, zFront], [sx1 + 0.04, U, zBack])
  railing(rails, [sx1, U, zBack - 0.04], [left, U, zBack - 0.04])
  room.add(poke(kit, 'stairs-down', [], [0, 0, 0]).add(scenery(kit, rails, 1.5)))

  // ---- The glass wall into her room: aluminium frames, glass, and the sliding door (slid open, so she can go in) ----
  const frames: BufferGeometry[] = [P.box(right - left, 0.08, 0.08, FRAME, { at: [0, U + 2.3, zGlass] }), P.box(right - left, 0.06, 0.08, FRAME, { at: [0, U + 0.03, zGlass] })]
  for (const x of [left + 0.04, -1.1, 0.2, door0, door1, right - 0.04]) frames.push(P.box(0.06, 2.3, 0.08, FRAME, { at: [x, U + 1.15, zGlass] }))
  frames.push(P.box(right - left, g1 - 2.34, 0.12, WALL, { at: [0, U + 2.34 + (g1 - 2.34) / 2, zGlass] }))
  glassWall.add(scenery(kit, frames, 1.5))
  const glassMat = kit.bag.add(new MeshBasicMaterial({ color: '#CFEFFF', transparent: true, opacity: 0.28, depthWrite: false }))
  const pane = (w: number, x: number, z = zGlass) => new Mesh(kit.bag.add(P.box(w, 2.22, 0.02, '#FFFFFF', { at: [x, U + 1.15, z] })), glassMat)
  glassWall.add(pane(-1.1 - left, (left - 1.1) / 2), pane(1.3, -0.45), pane(door0 - 0.2, (0.2 + door0) / 2))
  const w = door1 - door0
  const doors = poke(kit, 'glass-doors', [], [(0.2 + door0) / 2, U, zGlass - 0.07])
  doors.add(new Mesh(kit.bag.add(P.box(w - 0.1, 2.12, 0.02, '#FFFFFF', { at: [0, 1.12, 0] })), glassMat))
  doors.add(scenery(kit, [P.box(w, 0.06, 0.06, FRAME, { at: [0, 2.21, 0] }), P.box(w, 0.06, 0.06, FRAME, { at: [0, 0.03, 0] }), ...[-1, 1].map((s) => P.box(0.06, 2.24, 0.06, FRAME, { at: [(s * w) / 2, 1.12, 0] })), P.box(0.03, 0.3, 0.05, PAL.ink, { at: [w / 2 - 0.12, 1.1, -0.03] })], 1.5))
  glassWall.add(doors)

  // ---- The mattresses along the left wall, all the way to the end of the room ----
  const mattress = poke(kit, 'mattress', [], [-1.65, U, -14.3])
  const sheets = [PAL.pink, PAL.lavender, '#FFD3E6']
  const len = (-12.75 - -17.05) / 3
  sheets.forEach((c, i) => {
    const z = -17.05 + len * (i + 0.5) - -14.3
    mattress.add(scenery(kit, [P.rbox(1.58, 0.2, len - 0.04, 0.06, PAL.cream, { at: [0, 0.1, z] }), P.rbox(1.5, 0.03, len - 0.14, 0.02, c, { at: [0, 0.205, z] })], 2))
  })
  // A folded blanket in the middle of the row.
  mattress.add(scenery(kit, [P.rbox(1.2, 0.12, 0.5, 0.05, PAL.lavenderDark, { at: [0, 0.27, 0.9] })], 2))
  room.add(mattress)
  room.add(poke(kit, 'pillows', [P.rbox(0.62, 0.16, 0.4, 0.07, PAL.cream, { at: [-0.38, 0.08, 0] }), P.rbox(0.62, 0.16, 0.4, 0.07, '#FFE3EF', { at: [0.38, 0.08, 0] }), P.box(0.62, 0.012, 0.06, PAL.hotpink, { at: [0.38, 0.165, 0] })], [-1.65, U + 0.2, -16.65]))

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
      [2.17, U, -14.9],
    ),
  )

  // ---- Her suitcase (the lid opens), the wardrobe (the doors open), a fan ----
  const suitcase = poke(kit, 'suitcase', [P.rbox(0.62, 0.26, 0.42, 0.05, PAL.hotpink, { at: [0, 0.13, 0] }), P.box(0.64, 0.03, 0.06, PAL.gold, { at: [0, 0.13, 0.2] })], [1.4, U, -16.75], { rotY: Math.PI })
  const lid = part(kit, 'suitcase.hinge', [P.rbox(0.62, 0.08, 0.42, 0.04, PAL.hotpink, { at: [0, 0.04, 0.21] }), P.torus(0.06, 0.015, PAL.gold, { at: [0, 0.08, 0.3], rot: [Math.PI / 2, 0, 0] })], [0, 0.26, -0.21], 2)
  lid.userData.swingX = -1.6
  suitcase.add(lid)
  room.add(suitcase)
  const wardrobe = poke(kit, 'wardrobe', [P.box(1.2, 2.0, 0.5, WOOD, { at: [0, 1.0, 0] })], [0.25, U, back + 0.26])
  for (const side of [-1, 1]) {
    const h = part(kit, `wardrobe.hinge${side < 0 ? 'L' : 'R'}`, [P.box(0.58, 1.86, 0.04, '#F2CBA6', { at: [-side * 0.29, 0.93, 0] }), P.sphere(0.03, PAL.gold, { at: [-side * 0.5, 1.0, 0.04] })], [side * 0.59, 0.07, 0.27], 1.5)
    h.userData.swing = -side * 1.3
    wardrobe.add(h)
  }
  room.add(wardrobe)
  room.add(standingFan(kit, 'room-fan', [0.4, U, -13.1], Math.PI))

  room.add(hallWall, glassWall)
  return { room, rightWall, hallWall, glassWall }
}
