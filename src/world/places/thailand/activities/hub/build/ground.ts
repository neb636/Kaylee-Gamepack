// Downstairs at Agong's: his desk against the right wall at the front (he sits there a lot), the long table on the
// left with red plastic stools, old photos on
// the walls, a fan; the stairs (stairs.ts, at the back left); the fridge against the right wall in front of the back
// room, and in the back room the family altar, the little shrine and the kitchen counter with the rice cooker.
import { Group } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { part, poke, scenery, type Kit } from './kit'
import { tileFloor } from './tiles'

const FLOOR = '#FFF1E2'
const WALL = '#FFE4D4'
const WALL_BACK = '#FFEADF'
const WOOD = '#E9B98E'
const WOOD_DARK = '#C98F62'
const RED = '#E8505B'
const STOOL = '#FF6F7F'
const SEPIA = ['#E6C9A8', '#D9BFA0', '#EBD5BC', '#CDB295']

export interface Ground {
  /** Floor, left and back walls, furniture: everything that stays. */
  room: Group
  /** The right wall (the cutaway lowers it so the camera can see in). */
  rightWall: Group
}

export function buildGround(kit: Kit): Ground {
  const room = new Group()
  const rightWall = new Group()
  const { left, right, back, g0 } = DIM
  const depth = -back
  const { zFront, zBack } = DIM.stairs

  // ---- Floor (patterned cement tiles, tiles.ts), walls ----
  room.add(scenery(kit, [P.box(right - left, 0.2, depth, FLOOR, { at: [0, -0.1, back / 2] })], 2), tileFloor(kit, right - left, depth, 0, back / 2))
  room.add(
    scenery(kit, [
      // The left wall in front of and behind the stairs (stairs.ts has the piece beside them, seen from upstairs too).
      ...[
        [0, zFront],
        [zBack, back],
      ].flatMap(([z0, z1]) => [P.box(0.15, g0, z0 - z1, WALL, { at: [left - 0.075, g0 / 2, (z0 + z1) / 2] }), P.box(0.03, 0.12, z0 - z1, WOOD_DARK, { at: [left + 0.015, 0.06, (z0 + z1) / 2] })]),
      P.box(right - left + 0.3, g0, 0.15, WALL_BACK, { at: [0, g0 / 2, back - 0.075] }),
      P.box(right - left, 0.12, 0.03, WOOD_DARK, { at: [0, 0.06, back + 0.015] }),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g0, depth, WALL, { at: [right + 0.075, g0 / 2, back / 2] })]))

  // ---- The table and the stools ----
  room.add(
    poke(
      kit,
      'table',
      [
        P.rbox(0.92, 0.07, 1.95, 0.03, WOOD, { at: [0, 0.74, 0] }),
        ...[
          [-0.38, -0.88],
          [0.38, -0.88],
          [-0.38, 0.88],
          [0.38, 0.88],
        ].map(([x, z]) => P.cyl(0.04, 0.04, 0.72, WOOD_DARK, { at: [x, 0.36, z] })),
        // A teapot, cups and a bowl of fruit.
        P.sphere(0.11, PAL.sky, { at: [0.15, 0.88, 0.45], scale: [1, 0.85, 1] }),
        P.cyl(0.03, 0.02, 0.1, PAL.sky, { at: [0.28, 0.9, 0.45], rot: [0, 0, -1] }),
        ...[-0.15, 0.05].map((z) => P.cyl(0.04, 0.035, 0.07, PAL.cream, { at: [-0.2, 0.81, z] })),
        P.cyl(0.18, 0.12, 0.08, PAL.cream, { at: [0.05, 0.82, -0.5] }),
        ...[
          [0, 0, PAL.gold],
          [0.08, 0.06, '#FF9F45'],
          [-0.07, 0.05, '#7FCB8F'],
        ].map(([dx, dz, c]) => P.sphere(0.07, c as string, { at: [0.05 + (dx as number), 0.9, -0.5 + (dz as number)] })),
      ],
      [-2.075, 0, -2.6],
    ),
  )
  const stool = (x: number, z: number) => [P.cyl(0.17, 0.2, 0.06, STOOL, { at: [x, 0.42, z] }), P.cyl(0.13, 0.19, 0.4, STOOL, { at: [x, 0.2, z] })]
  room.add(scenery(kit, [...stool(-2.825, -2.2), ...stool(-2.825, -3.1), ...stool(-1.325, -2.2), ...stool(-1.325, -3.1), ...stool(-2.075, -1.3), ...stool(-2.075, -4.0)]))

  // ---- A grey couch against the left wall, facing into the room ----
  room.add(poke(kit, 'ground-couch', [
    P.rbox(0.85, 0.3, 2.8, 0.08, '#92949E', { at: [0, 0.2, 0] }),
    ...[-0.66, 0.66].map((z) => P.rbox(0.7, 0.14, 1.26, 0.06, '#C5C7CF', { at: [0.05, 0.41, z] })),
    P.rbox(0.2, 0.65, 2.8, 0.08, '#AFB2BC', { at: [-0.32, 0.61, 0] }),
    ...[-1.3, 1.3].map((z) => P.rbox(0.82, 0.43, 0.18, 0.07, '#AFB2BC', { at: [0, 0.46, z] })),
    P.rbox(0.13, 0.34, 0.38, 0.06, '#E2E3E8', { at: [-0.17, 0.67, -0.65], rot: [0, 0, -0.2] }),
  ], [-2.7, 0, -6.9]))

  // ---- Agong's desk against the right wall at the front: he sits at it facing the wall ----
  const desk = poke(
    kit,
    'desk',
    [
      P.rbox(1.35, 0.07, 0.68, 0.03, WOOD_DARK, { at: [0, 0.74, 0] }),
      // A drawer column each side and a modesty panel at the front.
      ...[-0.5, 0.5].map((x) => P.rbox(0.32, 0.7, 0.62, 0.03, WOOD, { at: [x, 0.35, 0] })),
      P.box(0.7, 0.45, 0.04, WOOD, { at: [0, 0.48, 0.3] }),
      ...[-0.5, 0.5].flatMap((x) => [0.2, 0.48].map((y) => P.box(0.12, 0.03, 0.02, PAL.gold, { at: [x, y, 0.32] }))),
    ],
    [DIM.right - 0.36, 0, -4.2],
    { rotY: Math.PI / 2 },
  )
  // On the desk (they hop when she taps it): the abacus, a red telephone, his ledger, a cup of tea, a little radio.
  desk.add(
    part(
      kit,
      'desk.hop0',
      [
        P.box(0.42, 0.04, 0.2, WOOD_DARK, { at: [-0.3, 0.8, 0.08] }),
        ...[0, 1, 2, 3].flatMap((r) => [-0.12, -0.04, 0.04, 0.12].map((dx, i) => P.sphere(0.022, (r + i) % 3 ? RED : PAL.gold, { at: [-0.3 + dx + (r % 2) * 0.02, 0.84, 0.01 + r * 0.045], scale: [1, 0.8, 1] }))),
        P.rbox(0.22, 0.09, 0.18, 0.03, RED, { at: [0.12, 0.82, 0.05] }),
        P.capsule(0.03, 0.14, RED, { at: [0.12, 0.9, 0.05], rot: [0, 0, Math.PI / 2] }),
        P.cyl(0.035, 0.035, 0.012, PAL.cream, { at: [0.12, 0.865, 0.11], rot: [Math.PI / 2 - 0.4, 0, 0] }),
        P.box(0.3, 0.035, 0.22, '#7FA8D8', { at: [0.42, 0.79, -0.12], rot: [0, 0.2, 0] }),
        P.cyl(0.04, 0.035, 0.07, PAL.cream, { at: [0.5, 0.81, 0.15] }),
        P.rbox(0.24, 0.13, 0.1, 0.03, PAL.mint, { at: [-0.45, 0.84, -0.2] }),
        P.cyl(0.005, 0.005, 0.18, PAL.ink, { at: [-0.37, 0.98, -0.2], rot: [0, 0, -0.3] }),
      ],
      [0, 0, 0],
      1.5,
    ),
  )
  room.add(desk)
  // His chair (he sits here; the family list puts him on it).
  room.add(scenery(kit, [P.rbox(0.48, 0.06, 0.5, 0.02, WOOD, { at: [2.025, 0.42, -4.2] }), P.rbox(0.06, 0.5, 0.5, 0.02, WOOD, { at: [1.775, 0.72, -4.2] }), ...[-0.2, 0.2].flatMap((x) => [-0.2, 0.2].map((z) => P.cyl(0.025, 0.025, 0.42, WOOD_DARK, { at: [2.025 + x, 0.21, -4.2 + z] })))]))

  // ---- The family altar on the back wall, and the little shrine on the floor ----
  const altar = poke(
    kit,
    'altar',
    [
      P.rbox(1.4, 0.95, 0.5, 0.03, RED, { at: [0, 0.475, 0] }),
      P.box(1.44, 0.06, 0.54, PAL.gold, { at: [0, 0.97, 0] }),
      P.box(1.3, 0.06, 0.32, RED, { at: [0, 1.55, -0.08] }),
      P.box(1.36, 0.05, 0.36, PAL.gold, { at: [0, 1.6, -0.08] }),
      // Ancestor photos in gold frames on the top shelf.
      ...[-0.4, 0, 0.4].map((x, i) => P.rbox(0.3, 0.38, 0.04, 0.02, i === 1 ? SEPIA[0] : SEPIA[3], { at: [x, 1.82, -0.12] })),
      ...[-0.4, 0, 0.4].map((x) => P.box(0.34, 0.42, 0.02, PAL.gold, { at: [x, 1.82, -0.15] })),
      // A bowl of oranges, a pot for incense, two candles.
      P.cyl(0.14, 0.1, 0.07, PAL.cream, { at: [0.15, 1.04, 0.05] }),
      ...[-0.06, 0.06, 0].map((dx, i) => P.sphere(0.065, '#FF9F45', { at: [0.15 + dx, 1.1 + (i === 2 ? 0.06 : 0), 0.05] })),
      P.cyl(0.09, 0.08, 0.12, PAL.gold, { at: [-0.2, 1.06, 0.05] }),
      ...[-0.55, 0.55].map((x) => P.cyl(0.035, 0.035, 0.22, RED, { at: [x, 1.11, 0.05] })),
      // Lanterns hanging either side.
      ...[-0.85, 0.85].flatMap((x) => [P.sphere(0.15, RED, { at: [x, 2.35, 0], scale: [1, 0.85, 1] }), P.cyl(0.07, 0.07, 0.05, PAL.gold, { at: [x, 2.5, 0] }), P.cyl(0.07, 0.07, 0.05, PAL.gold, { at: [x, 2.21, 0] })]),
    ],
    [-0.3, 0, back + 0.27],
  )
  for (const [i, x] of [-0.55, 0.55].entries()) altar.add(part(kit, `altar.flame${i}`, [P.sphere(0.03, PAL.gold, { scale: [0.8, 1.6, 0.8] })], [x, 1.26, 0.05], 0))
  altar.add(part(kit, 'altar.smoke', [], [-0.2, 1.3, 0.05], 0))
  room.add(altar)
  const shrine = poke(
    kit,
    'shrine',
    [
      P.rbox(0.42, 0.34, 0.32, 0.02, RED, { at: [0, 0.17, 0] }),
      P.box(0.46, 0.04, 0.36, PAL.gold, { at: [0, 0.36, 0] }),
      P.cone(0.3, 0.16, RED, { at: [0, 0.46, 0], rot: [0, Math.PI / 4, 0] }, 4),
      P.box(0.2, 0.18, 0.02, PAL.gold, { at: [0, 0.18, 0.17] }),
      P.cyl(0.03, 0.03, 0.08, PAL.cream, { at: [0.12, 0.42, 0.1] }),
    ],
    [0.9, 0, back + 0.2],
  )
  shrine.add(part(kit, 'shrine.flame0', [P.sphere(0.022, PAL.gold, { scale: [0.8, 1.6, 0.8] })], [0.12, 0.48, 0.1], 0))
  shrine.add(part(kit, 'shrine.smoke', [], [0.12, 0.5, 0.1], 0))
  room.add(shrine)

  // ---- Old photos on the left wall (two groups) and the clock ----
  const photoWall = (id: string, at: [number, number, number], n: number, rotY = 0) =>
    poke(
      kit,
      id,
      Array.from({ length: n }, (_, i) => {
        const w = i % 2 ? 0.34 : 0.42
        const h = i % 2 ? 0.44 : 0.34
        const zz = (i - (n - 1) / 2) * 0.5
        const yy = (i % 3) * 0.12 - 0.08
        return [P.box(0.04, h + 0.08, w + 0.08, i % 3 === 1 ? PAL.gold : WOOD_DARK, { at: [0, yy, zz] }), P.box(0.05, h, w, SEPIA[i % SEPIA.length], { at: [0.01, yy, zz] })]
      }).flat(),
      at,
      { px: 1.5, rotY },
    )
  // On the left wall above the table, and on the back wall beside the altar.
  room.add(photoWall('photos', [left + 0.02, 2.25, -4.0], 4), photoWall('photos-back', [-1.85, 2.95, back + 0.02], 3, -Math.PI / 2))
  const clock = poke(kit, 'clock', [P.cyl(0.24, 0.24, 0.06, WOOD_DARK, { rot: [0, 0, Math.PI / 2] }), P.cyl(0.2, 0.2, 0.07, PAL.cream, { rot: [0, 0, Math.PI / 2] })], [left + 0.05, 2.85, -5.75], { px: 1.5 })
  clock.add(part(kit, 'clock.hands', [P.box(0.02, 0.15, 0.025, PAL.ink, { at: [0, 0.06, 0] }), P.box(0.02, 0.025, 0.11, PAL.ink, { at: [0, 0, 0.045] })], [0.05, 0, 0], 0))
  room.add(clock)
  const cal = poke(kit, 'calendar', [P.box(0.5, 0.62, 0.03, PAL.cream, { at: [0, 0, 0] }), P.box(0.5, 0.16, 0.035, RED, { at: [0, 0.23, 0] })], [1.95, 2.0, back + 0.03], { px: 1.5 })
  cal.add(part(kit, 'calendar.page', [P.box(0.46, 0.44, 0.01, '#FFFDF8', { at: [0, -0.22, 0.012] })], [0, 0.14, 0.02], 0))
  room.add(cal)

  // ---- Fan, fridge, the kitchen counter with the rice cooker, shoes ----
  room.add(standingFan(kit, 'fan', [1.7, 0, -6.2], 0.4))
  // The fridge against the right wall, just in front of the back room.
  const fridge = poke(kit, 'fridge', [P.rbox(0.68, 1.7, 0.66, 0.06, '#C9EEF7', { at: [0, 0.85, 0] })], [right - 0.35, 0, -11.75], { rotY: -Math.PI / 2 })
  const door = part(kit, 'fridge.hinge', [P.rbox(0.68, 1.1, 0.06, 0.03, '#D9F4FA', { at: [0.34, 0.55, 0] }), P.box(0.04, 0.3, 0.05, PAL.cream, { at: [0.62, 0.55, 0.05] })], [-0.34, 0.56, 0.36], 1.5)
  door.userData.swing = -1.4
  fridge.add(door)
  room.add(fridge)
  room.add(
    scenery(kit, [
      P.box(0.62, 0.86, 3.0, '#BFE6DA', { at: [right - 0.31, 0.43, -18.798] }),
      P.box(0.68, 0.05, 3.06, PAL.cream, { at: [right - 0.33, 0.885, -18.798] }),
      ...[-18.048, -18.798, -19.548].map((z) => P.box(0.02, 0.6, 0.7, '#A8D8C8', { at: [right - 0.63, 0.42, z] })),
      // A sink, a dish rack and a bowl of limes.
      P.box(0.4, 0.04, 0.5, '#D8D2E6', { at: [right - 0.32, 0.9, -19.498] }),
      P.rbox(0.3, 0.2, 0.36, 0.03, PAL.sky, { at: [right - 0.3, 1.01, -18.848] }),
      P.cyl(0.13, 0.09, 0.07, PAL.cream, { at: [right - 0.3, 0.95, -17.648] }),
      ...[-0.04, 0.04].map((dz) => P.sphere(0.045, '#9BD86F', { at: [right - 0.3, 1.0, -17.648 + dz] })),
    ]),
  )
  const cooker = poke(kit, 'rice-cooker', [P.cyl(0.17, 0.15, 0.24, PAL.cream, { at: [0, 0.12, 0] }), P.sphere(0.17, PAL.cream, { at: [0, 0.24, 0], scale: [1, 0.35, 1] }), P.box(0.1, 0.04, 0.02, PAL.hotpink, { at: [0, 0.1, 0.17] }), P.box(0.05, 0.05, 0.1, PAL.ink, { at: [0, 0.32, 0] })], [right - 0.32, 0.91, -18.098], { rotY: -Math.PI / 2 })
  cooker.add(part(kit, 'rice-cooker.smoke', [], [0, 0.35, 0], 0))
  room.add(cooker)
  // A striped doormat inside the door: tap it to go back out to the street.
  room.add(poke(kit, 'doormat', [P.rbox(1.3, 0.03, 0.62, 0.015, PAL.butter, { at: [0, 0.015, 0] }), ...[-0.4, 0, 0.4].map((x) => P.box(0.16, 0.034, 0.56, PAL.hotpink, { at: [x, 0.016, 0] }))], [0, 0, -0.62], { px: 1.5 }))
  const shoes = poke(kit, 'shoes', [P.box(0.4, 0.06, 0.75, WOOD, { at: [0, 0.03, 0] })], [right - 0.3, 0, -0.85])
  shoes.add(part(kit, 'shoes.hop0', [PAL.hotpink, PAL.sky, PAL.butter, PAL.mint].map((c, i) => P.rbox(0.14, 0.04, 0.26, 0.02, c, { at: [i % 2 ? 0.08 : -0.08, 0.02, -0.28 + i * 0.18] })), [0, 0.06, 0], 1.5))
  room.add(shoes)

  return { room, rightWall }
}

/** A standing fan whose blades turn all day (faster when poked). */
export function standingFan(kit: Kit, id: string, at: [number, number, number], rotY: number) {
  const fan = poke(kit, id, [P.cyl(0.2, 0.24, 0.06, PAL.cream, { at: [0, 0.03, 0] }), P.cyl(0.03, 0.03, 0.75, PAL.cream, { at: [0, 0.4, 0] }), P.sphere(0.08, PAL.cream, { at: [0, 0.8, -0.06] }), P.torus(0.24, 0.015, PAL.sky, { at: [0, 0.8, 0.02] })], at, { rotY })
  fan.add(part(kit, `${id}.blades`, [0, 1, 2].map((i) => P.sphere(0.1, PAL.sky, { at: [Math.cos((i * Math.PI * 2) / 3) * 0.11, Math.sin((i * Math.PI * 2) / 3) * 0.11, 0], scale: [1, 0.45, 0.2], rot: [0, 0, (i * Math.PI * 2) / 3] })), [0, 0.8, 0.02], 1.5))
  return fan
}
