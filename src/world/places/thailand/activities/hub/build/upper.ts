// Upstairs: the stairs come out in a small hallway that looks down into the shop over a balcony railing (the front
// half of the house is open, two floors high), and glass sliding doors lead back into the room Kaylee sleeps in, at
// the back of the house. In her room (Dad, 2026-10-19): one big mattress on the floor in the back left corner, its long
// side across the room (Dad, 2026-10-20), her drawings taped above its head and a mini-split air conditioner on the back wall;
// the grey couch on the right just inside the glass doors; her suitcase; a fan; and the bathroom door at the
// back on the right, aluminium like the real one (Dad's photo, 2026-10-18). It's locked: it only rattles. The floor is
// pale grey terrazzo tiles like the real one (tiles.ts). The house gecko lives on the back wall (gecko.ts).
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { standingFan } from './ground'
import { part, poke, scenery, type Kit } from './kit'
import { railing } from './stairs'
import { upstairsFloor } from './tiles'

const FLOOR = '#E2E0DC'
const WALL = '#F4F1EC'
const ALU = '#C3C7CD'
const COUCH = '#AFB2BC'
const COUCH_DARK = '#92949E'
const COUCH_SEAT = '#C5C7CF'
const FRAME = '#D8D2E6'

export interface Upper {
  room: Group
  /** The right wall (lowered while she's upstairs, so the camera can see in). */
  rightWall: Group
  /** The glass wall into her room (lowered while she's in the room). */
  glassWall: Group
}

export function buildUpper(kit: Kit): Upper {
  const room = new Group()
  const rightWall = new Group()
  const glassWall = new Group()
  const { left, right, back, g0: U, g1 } = DIM
  const { x1: sx1, zFront, zBack } = DIM.stairs
  const { zFront: hz, zGlass, door0, door1 } = DIM.hall
  const depth = -back

  // ---- Floor (terrazzo tiles) with the stairwell hole, walls ----
  room.add(
    scenery(kit, [
      P.box(right - left + 0.3, 0.2, hz - zFront, FLOOR, { at: [0, U - 0.1, (zFront + hz) / 2] }),
      P.box(right + 0.15 - sx1, 0.2, zFront - zBack, FLOOR, { at: [(sx1 + right + 0.15) / 2, U - 0.1, (zFront + zBack) / 2] }),
      P.box(right - left + 0.3, 0.2, zBack - back, FLOOR, { at: [0, U - 0.1, (zBack + back) / 2] }),
    ]),
    ...upstairsFloor(
      kit,
      [
        [left, right, zFront, hz],
        [sx1, right, zBack, zFront],
        [left, right, back, zBack],
      ],
      U + 0.002,
    ),
  )
  room.add(
    scenery(kit, [
      P.box(0.15, g1, depth, WALL, { at: [left - 0.075, U + g1 / 2, back / 2] }),
      P.box(right - left + 0.3, g1, 0.15, WALL, { at: [0, U + g1 / 2, back - 0.075] }),
      P.box(0.03, 0.12, depth, '#CFC8BE', { at: [left + 0.015, U + 0.06, back / 2] }),
      // Kaylee's drawings taped above the mattress.
      ...[
        [-19.15, PAL.pink],
        [-19.7, PAL.butter],
        [-20.25, PAL.sky],
        [-20.8, PAL.mint],
      ].map(([z, c], i) => P.box(0.02, 0.36, 0.3, c as string, { at: [left + 0.01, U + 1.25 + (i % 2) * 0.18, z as number], rot: [(i % 2 ? 0.08 : -0.06), 0, 0] })),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g1, depth, WALL, { at: [right + 0.075, U + g1 / 2, back / 2] })]))

  // ---- The hallway: a plant, the balcony railing over the shop, the railing round the stairwell ----
  room.add(poke(kit, 'plant', [P.cyl(0.18, 0.13, 0.3, '#EBA27E', { at: [0, 0.15, 0] }), P.sphere(0.24, '#7FCB8F', { at: [0, 0.45, 0] }), ...[0, 2, 4].map((a) => P.sphere(0.06, PAL.hotpink, { at: [Math.cos(a) * 0.18, 0.55, Math.sin(a) * 0.18] }))], [2.1, U, -5.65]))
  const rails: BufferGeometry[] = []
  railing(rails, [left, U, hz + 0.04], [right, U, hz + 0.04])
  // Round the stairwell: its front edge and the right edge beside flight 1 (flight 2 comes out next to it). Its back
  // edge runs along the glass wall.
  railing(rails, [left, U, zFront + 0.04], [sx1 + 0.04, U, zFront + 0.04])
  railing(rails, [sx1 + 0.04, U, zFront], [sx1 + 0.04, U, DIM.stairs.mid])
  room.add(poke(kit, 'stairs-down', [], [0, 0, 0]).add(scenery(kit, rails, 1.5)))

  // ---- The glass wall into her room: aluminium frames, glass, and the sliding door (slid open, so she can go in) ----
  const frames: BufferGeometry[] = [P.box(right - left, 0.08, 0.08, FRAME, { at: [0, U + 2.3, zGlass] }), P.box(right - left, 0.06, 0.08, FRAME, { at: [0, U + 0.03, zGlass] })]
  for (const x of [left + 0.04, -1.1, 0.2, door0, door1, right - 0.04]) frames.push(P.box(0.06, 2.3, 0.08, FRAME, { at: [x, U + 1.15, zGlass] }))
  frames.push(P.box(right - left, g1 - 2.34, 0.12, WALL, { at: [0, U + 2.34 + (g1 - 2.34) / 2, zGlass] }))
  glassWall.add(scenery(kit, frames, 1.5))
  const glassMat = kit.bag.add(new MeshBasicMaterial({ color: '#CFEFFF', transparent: true, opacity: 0.28, depthWrite: false }))
  const pane = (w: number, x: number, z = zGlass) => new Mesh(kit.bag.add(P.box(w, 2.22, 0.02, '#FFFFFF', { at: [x, U + 1.15, z] })), glassMat)
  glassWall.add(pane(-1.1 - left, (left - 1.1) / 2), pane(1.3, -0.45), pane(door0 - 0.2, (0.2 + door0) / 2), pane(right - door1, (door1 + right) / 2))
  const w = door1 - door0
  const doors = poke(kit, 'glass-doors', [], [(0.2 + door0) / 2, U, zGlass - 0.07])
  doors.add(new Mesh(kit.bag.add(P.box(w - 0.1, 2.12, 0.02, '#FFFFFF', { at: [0, 1.12, 0] })), glassMat))
  doors.add(scenery(kit, [P.box(w, 0.06, 0.06, FRAME, { at: [0, 2.21, 0] }), P.box(w, 0.06, 0.06, FRAME, { at: [0, 0.03, 0] }), ...[-1, 1].map((s) => P.box(0.06, 2.24, 0.06, FRAME, { at: [(s * w) / 2, 1.12, 0] })), P.box(0.03, 0.3, 0.05, PAL.ink, { at: [w / 2 - 0.12, 1.1, -0.03] })], 1.5))
  glassWall.add(doors)

  // ---- One big mattress in the back left corner, its long side across the room, its head at the left wall ----
  const bed = { x: left + 1.2, z: back + 0.05 + 0.95, len: 2.4, w: 1.9 }
  const mattress = poke(kit, 'mattress', [], [bed.x, U, bed.z])
  mattress.add(scenery(kit, [P.rbox(bed.len, 0.22, bed.w, 0.06, PAL.cream, { at: [0, 0.11, 0] }), P.rbox(bed.len - 0.1, 0.03, bed.w - 0.08, 0.02, PAL.pink, { at: [0, 0.225, 0] })], 2))
  // A folded blanket across its foot.
  mattress.add(scenery(kit, [P.rbox(0.45, 0.1, bed.w - 0.2, 0.05, PAL.lavenderDark, { at: [bed.len / 2 - 0.35, 0.27, 0] })], 2))
  room.add(mattress)
  room.add(poke(kit, 'pillows', [P.rbox(0.4, 0.16, 0.62, 0.07, PAL.cream, { at: [0, 0.08, -0.47] }), P.rbox(0.4, 0.16, 0.62, 0.07, '#FFE3EF', { at: [0, 0.08, 0.47] }), P.box(0.06, 0.012, 0.62, PAL.hotpink, { at: [0, 0.165, 0.47] })], [left + 0.3, U + 0.2, bed.z]))

  // ---- The grey couch on the right, just inside the glass doors (faces left) ----
  room.add(
    poke(
      kit,
      'couch',
      [
        P.rbox(0.75, 0.3, 2.4, 0.08, COUCH_DARK, { at: [0, 0.2, 0] }),
        P.rbox(0.62, 0.14, 1.12, 0.06, COUCH_SEAT, { at: [-0.04, 0.41, -0.58] }),
        P.rbox(0.62, 0.14, 1.12, 0.06, COUCH_SEAT, { at: [-0.04, 0.41, 0.58] }),
        P.rbox(0.2, 0.62, 2.4, 0.08, COUCH, { at: [0.28, 0.6, 0] }),
        P.rbox(0.72, 0.42, 0.18, 0.07, COUCH, { at: [0, 0.45, -1.15] }),
        P.rbox(0.72, 0.42, 0.18, 0.07, COUCH, { at: [0, 0.45, 1.15] }),
        P.rbox(0.12, 0.34, 0.34, 0.06, PAL.pink, { at: [0.12, 0.66, 0.65], rot: [0, 0, 0.2] }),
      ],
      [2.795, U, -12.8],
    ),
  )

  // ---- Her suitcase (the lid opens), a fan, the air conditioner ----
  const suitcase = poke(kit, 'suitcase', [P.rbox(0.62, 0.26, 0.42, 0.05, PAL.hotpink, { at: [0, 0.13, 0] }), P.box(0.64, 0.03, 0.06, PAL.gold, { at: [0, 0.13, 0.2] })], [0.3, U, -20.448], { rotY: Math.PI })
  const lid = part(kit, 'suitcase.hinge', [P.rbox(0.62, 0.08, 0.42, 0.04, PAL.hotpink, { at: [0, 0.04, 0.21] }), P.torus(0.06, 0.015, PAL.gold, { at: [0, 0.08, 0.3], rot: [Math.PI / 2, 0, 0] })], [0, 0.26, -0.21], 2)
  lid.userData.swingX = -1.6
  suitcase.add(lid)
  room.add(suitcase)
  room.add(standingFan(kit, 'room-fan', [0.4, U, -16.798], Math.PI))
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

  room.add(glassWall)
  return { room, rightWall, glassWall }
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
