// Downstairs at Agong's: his desk against the right wall at the front (he sits there a lot), the long table on the
// left with red plastic stools, old photos on the left wall and on the back wall, a fan; the stairs
// (stairs.ts, at the back left); the fridge against the right wall in the back room, just in front of the kitchen counter; and in the back room
// the family altar, the little shrine and the kitchen counter with the rice cooker.
// The desk, his slatted wooden chair, the pictures and the big fan follow Dad's photos of the
// real room (~/refs, 2026-10-18): glossy dark red-brown wood, cream walls, golden terrazzo with green bands.
import { Euler, Group, Matrix4, Quaternion, Vector3, type BufferGeometry } from 'three'
import { P, type V3 } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { part, poke, scenery, type Kit } from './kit'
import { pictureMesh, picturePlane, type PictureKind } from './pictures'
import { shopFloor } from './tiles'

const FLOOR = '#E6CB93'
const WALL = '#F6EEDC'
const WALL_BACK = '#F3EAD6'
const WOOD = '#E9B98E'
const WOOD_DARK = '#C98F62'
/** Agong's furniture: old glossy rosewood, dark red-brown. */
const ROSE = '#8A4529'
const ROSE_DARK = '#5E2C1A'
const ROSE_LIGHT = '#A85A36'
const BRASS = '#D8B062'
const GILT = '#E2B13C'
const GILT_DARK = '#B8862E'
const FRAME_DARK = '#4A2A1C'
const STEEL = '#C9CCD1'
const RED = '#E8505B'
const STOOL = '#FF6F7F'
const SEPIA = ['#E6C9A8', '#D9BFA0', '#EBD5BC', '#CDB295']
const deg = Math.PI / 180

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

  // ---- Floor (golden terrazzo with green bands, tiles.ts), walls ----
  room.add(scenery(kit, [P.box(right - left, 0.2, depth, FLOOR, { at: [0, -0.1, back / 2] })], 2), shopFloor(kit, right - left, depth, 0, back / 2))
  room.add(
    scenery(kit, [
      P.box(0.15, g0, depth, WALL, { at: [left - 0.075, g0 / 2, back / 2] }),
      P.box(0.03, 0.12, depth, WOOD_DARK, { at: [left + 0.015, 0.06, back / 2] }),
      P.box(right - left + 0.3, g0, 0.15, WALL_BACK, { at: [0, g0 / 2, back - 0.075] }),
      P.box(right - left, 0.12, 0.03, WOOD_DARK, { at: [0, 0.06, back + 0.015] }),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g0, depth, WALL, { at: [right + 0.075, g0 / 2, back / 2] })]))

  // ---- The table (a big one: the whole family eats at it) and the stools ----
  room.add(
    poke(
      kit,
      'table',
      [
        P.rbox(1.1, 0.07, 2.34, 0.03, WOOD, { at: [0, 0.74, 0] }),
        ...[
          [-0.46, -1.06],
          [0.46, -1.06],
          [-0.46, 1.06],
          [0.46, 1.06],
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
  room.add(scenery(kit, [...stool(-2.85, -2.0), ...stool(-2.85, -3.2), ...stool(-1.3, -2.0), ...stool(-1.3, -3.2), ...stool(-2.075, -1.15), ...stool(-2.075, -4.05)]))

  // ---- A grey couch against the left wall, facing into the room ----
  room.add(poke(kit, 'ground-couch', [
    P.rbox(0.85, 0.3, 2.8, 0.08, '#92949E', { at: [0, 0.2, 0] }),
    ...[-0.66, 0.66].map((z) => P.rbox(0.7, 0.14, 1.26, 0.06, '#C5C7CF', { at: [0.05, 0.41, z] })),
    P.rbox(0.2, 0.65, 2.8, 0.08, '#AFB2BC', { at: [-0.32, 0.61, 0] }),
    ...[-1.3, 1.3].map((z) => P.rbox(0.82, 0.43, 0.18, 0.07, '#AFB2BC', { at: [0, 0.46, z] })),
    P.rbox(0.13, 0.34, 0.38, 0.06, '#E2E3E8', { at: [-0.17, 0.67, -0.65], rot: [0, 0, -0.2] }),
  ], [-2.7, 0, -6.5]))

  // ---- Agong's desk against the right wall at the front: he sits at it facing the wall ----
  // Like his real one: a long drawer across the top (a brass lock and a bar handle), a cupboard with a raised panel on
  // the right, his knees go in on the left. Its front faces into the room (local -z).
  const desk = poke(
    kit,
    'desk',
    [
      P.rbox(1.56, 0.05, 0.72, 0.02, ROSE_LIGHT, { at: [0, 0.755, 0] }),
      P.box(1.5, 0.17, 0.66, ROSE, { at: [0, 0.645, 0] }),
      P.box(1.5, 0.56, 0.03, ROSE_DARK, { at: [0, 0.28, 0.315] }),
      P.box(0.04, 0.56, 0.66, ROSE, { at: [-0.73, 0.28, 0] }),
      P.box(0.5, 0.56, 0.66, ROSE, { at: [0.5, 0.28, 0] }),
      // Drawer fronts, the lock, the handles.
      P.box(0.92, 0.13, 0.02, ROSE_LIGHT, { at: [-0.27, 0.645, -0.335] }),
      P.box(0.46, 0.13, 0.02, ROSE_LIGHT, { at: [0.5, 0.645, -0.335] }),
      P.cyl(0.022, 0.022, 0.02, BRASS, { at: [-0.62, 0.655, -0.35], rot: [Math.PI / 2, 0, 0] }),
      P.box(0.22, 0.025, 0.025, BRASS, { at: [-0.27, 0.635, -0.355] }),
      P.box(0.14, 0.025, 0.025, BRASS, { at: [0.5, 0.635, -0.355] }),
      // The cupboard door with its raised panel and latch.
      P.box(0.42, 0.46, 0.02, ROSE_LIGHT, { at: [0.5, 0.3, -0.335] }),
      P.box(0.3, 0.34, 0.015, ROSE, { at: [0.5, 0.3, -0.35] }),
      P.box(0.025, 0.09, 0.02, BRASS, { at: [0.33, 0.32, -0.355] }),
    ],
    [DIM.right - 0.36, 0, -4.45],
    { rotY: Math.PI / 2 },
  )
  // On the desk (they hop when she taps it), like on his: a big thermos, a jar, water bottles, a pot with blue and
  // white teacups on its lid, his golden piggy bank and the electric kettle.
  const PIG = '#F2B33D'
  desk.add(
    part(
      kit,
      'desk.hop0',
      [
        P.cyl(0.085, 0.095, 0.28, '#EFE6D2', { at: [-0.55, 0.92, 0.17] }),
        P.cyl(0.06, 0.07, 0.05, '#C9BFA8', { at: [-0.55, 1.085, 0.17] }),
        P.cyl(0.065, 0.065, 0.15, '#F2EEE6', { at: [-0.66, 0.855, -0.13] }),
        P.cyl(0.07, 0.07, 0.03, RED, { at: [-0.66, 0.945, -0.13] }),
        ...[-0.36, -0.27].flatMap((x) => [P.cyl(0.035, 0.04, 0.24, '#CFE6F2', { at: [x, 0.9, 0.2] }), P.cyl(0.018, 0.018, 0.03, PAL.cream, { at: [x, 1.035, 0.2] })]),
        P.cyl(0.13, 0.12, 0.12, STEEL, { at: [-0.22, 0.84, -0.08] }),
        P.cyl(0.135, 0.135, 0.015, '#DADDE1', { at: [-0.22, 0.905, -0.08] }),
        ...[-0.05, 0.05].flatMap((dx) => [P.cyl(0.032, 0.025, 0.045, '#F4F4F8', { at: [-0.22 + dx, 0.935, -0.08] }), P.cyl(0.033, 0.033, 0.012, '#3E6FB0', { at: [-0.22 + dx, 0.945, -0.08] })]),
        // The piggy bank: round gold body, snout, ears, legs, a red good-luck patch and the coin slot.
        P.sphere(0.12, PIG, { at: [0.15, 0.9, 0.08], scale: [1.2, 0.95, 1] }),
        P.cyl(0.045, 0.05, 0.05, '#E8A22F', { at: [0.15, 0.89, 0.08 - 0.12], rot: [Math.PI / 2, 0, 0] }),
        ...[-1, 1].map((sx) => P.cone(0.035, 0.06, PIG, { at: [0.15 + sx * 0.06, 1.0, 0.03], rot: [-0.3, 0, -sx * 0.3] })),
        ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.025, 0.025, 0.05, '#E8A22F', { at: [0.15 + sx * 0.08, 0.8, 0.08 + sz * 0.06] }))),
        P.box(0.08, 0.07, 0.01, RED, { at: [0.15 + 0.135, 0.9, 0.08], rot: [0, Math.PI / 2, 0] }),
        P.box(0.05, 0.008, 0.012, PAL.ink, { at: [0.15, 1.013, 0.1] }),
        // The kettle on its black stand.
        P.cyl(0.105, 0.105, 0.03, '#2E2A30', { at: [0.55, 0.795, 0.12] }),
        P.cyl(0.08, 0.1, 0.2, '#D5D8DD', { at: [0.55, 0.91, 0.12] }),
        P.box(0.03, 0.16, 0.05, '#2E2A30', { at: [0.66, 0.92, 0.12] }),
        P.cone(0.025, 0.07, '#D5D8DD', { at: [0.45, 0.97, 0.12], rot: [0, 0, 1.1] }),
      ],
      [0, 0, 0],
      1.5,
    ),
  )
  room.add(desk)
  // His chair: the slatted wooden easy chair with long flat arms he sits in (the family list puts him on it).
  room.add(agongChair(kit, [2.025, 0, -4.2], 65 * deg))

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

  // ---- Old pictures hung high on the walls, tipped forward like his: portraits in big gold frames, old photos and a
  // certificate in dark wood. Then the clock. ----
  room.add(
    photoWall(kit, 'photos', [left + 0.02, 2.45, -4.0], [
      { kind: 'certificate', w: 0.4, h: 0.52, frame: 'wood' },
      { kind: 'uniform-white', w: 0.42, h: 0.56, frame: 'gold' },
      { kind: 'uniform-blue', w: 0.42, h: 0.56, frame: 'gold' },
      { kind: 'couple', w: 0.5, h: 0.4, frame: 'wood' },
      { kind: 'family', w: 0.46, h: 0.38, frame: 'wood' },
    ]),
    photoWall(
      kit,
      'photos-back',
      [-1.85, 2.95, back + 0.02],
      [
        { kind: 'family', w: 0.42, h: 0.34, frame: 'wood' },
        { kind: 'uniform-white', w: 0.34, h: 0.44, frame: 'gold' },
        { kind: 'couple', w: 0.42, h: 0.34, frame: 'wood' },
      ],
      -Math.PI / 2,
    ),
  )
  const clock = poke(kit, 'clock', [P.cyl(0.24, 0.24, 0.06, WOOD_DARK, { rot: [0, 0, Math.PI / 2] }), P.cyl(0.2, 0.2, 0.07, PAL.cream, { rot: [0, 0, Math.PI / 2] })], [left + 0.05, 2.85, -5.75], { px: 1.5 })
  clock.add(part(kit, 'clock.hands', [P.box(0.02, 0.15, 0.025, PAL.ink, { at: [0, 0.06, 0] }), P.box(0.02, 0.025, 0.11, PAL.ink, { at: [0, 0, 0.045] })], [0.05, 0, 0], 0))
  room.add(clock)
  // The tear-off calendar with today's big red date, on a backing board.
  const cal = poke(kit, 'calendar', [P.box(0.5, 0.66, 0.03, '#F3E9E6', { at: [0, -0.02, 0] }), P.box(0.5, 0.14, 0.035, RED, { at: [0, 0.24, 0] })], [1.95, 2.0, back + 0.03], { px: 1.5 })
  const page = part(kit, 'calendar.page', [], [0, 0.16, 0.02], 0)
  page.add(pictureMesh(kit, [picturePlane('calendar', 0.4, 0.5, new Matrix4().makeTranslation(0, -0.26, 0.004))]))
  cal.add(page)
  room.add(cal)

  // ---- Fan, fridge, the kitchen counter with the rice cooker, shoes ----
  room.add(pedestalFan(kit, 'fan', [2.5, 0, -5.75], -0.31))
  // The fridge against the right wall in the back room, a little in front of the kitchen counter (Dad, 2026-10-20).
  const fridge = poke(kit, 'fridge', [P.rbox(0.68, 1.7, 0.66, 0.06, '#C9EEF7', { at: [0, 0.85, 0] })], [right - 0.35, 0, -15.9], { rotY: -Math.PI / 2 })
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

interface Framed {
  kind: PictureKind
  /** The picture itself, meters (the frame goes round it). */
  w: number
  h: number
  frame: 'gold' | 'wood'
}

/**
 * A row of framed pictures on a wall, facing +x (rotY turns it), centered at `at`. Hung high and tipped forward at
 * the top like the ones in Agong's shop; big portraits in gold frames, the rest in dark wood.
 */
function photoWall(kit: Kit, id: string, at: V3, items: Framed[], rotY = 0) {
  const gap = 0.1
  const sizes = items.map((f) => f.w + (f.frame === 'gold' ? 0.16 : 0.08))
  let z = (sizes.reduce((a, b) => a + b, 0) + gap * (items.length - 1)) / 2
  const frames: BufferGeometry[] = []
  const pics: BufferGeometry[] = []
  items.forEach((f, i) => {
    const fw = sizes[i]
    z -= fw / 2
    const fh = f.h + (f.frame === 'gold' ? 0.16 : 0.08)
    const y = (i % 2) * 0.05 - (f.frame === 'wood' ? 0.04 : 0)
    // Tipped forward: the top leans out from the wall. Each frame pivots round its own middle.
    const m = new Matrix4().compose(new Vector3(0.03, y, z), new Quaternion().setFromEuler(new Euler(0, 0, -0.07)), new Vector3(1, 1, 1))
    const parts =
      f.frame === 'gold'
        ? [P.box(0.04, fh, fw, GILT), P.box(0.04, f.h + 0.05, f.w + 0.05, GILT_DARK, { at: [0.006, 0, 0] })]
        : [P.box(0.035, fh, fw, FRAME_DARK), P.box(0.035, f.h + 0.02, f.w + 0.02, PAL.cream, { at: [0.002, 0, 0] })]
    for (const g of parts) frames.push(g.applyMatrix4(m))
    pics.push(picturePlane(f.kind, f.w, f.h, m.clone().multiply(new Matrix4().compose(new Vector3(0.0275, 0, 0), new Quaternion().setFromEuler(new Euler(0, Math.PI / 2, 0)), new Vector3(1, 1, 1)))))
    z -= fw / 2 + gap
  })
  const wall = poke(kit, id, frames, at, { px: 1.5, rotY })
  wall.add(pictureMesh(kit, pics))
  return wall
}

/** Agong's easy chair: dark wood, a slatted seat and a slatted back leaning way back, long flat arms. Faces +z. */
function agongChair(kit: Kit, at: V3, rotY: number) {
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 4; i++) parts.push(P.box(0.5, 0.03, 0.1, ROSE_LIGHT, { at: [0, 0.42, 0.18 - i * 0.125] }))
  // The back: two rails leaning back and slats across them.
  const lean = 0.5
  for (const sx of [-1, 1]) parts.push(P.box(0.05, 0.75, 0.04, ROSE, { at: [sx * 0.25, 0.42 + 0.375 * Math.cos(lean), -0.25 - 0.375 * Math.sin(lean)], rot: [-lean, 0, 0] }))
  for (let i = 0; i < 6; i++) {
    const d = 0.08 + i * 0.12
    parts.push(P.box(0.46, 0.07, 0.02, ROSE_LIGHT, { at: [0, 0.42 + d * Math.cos(lean), -0.25 - d * Math.sin(lean) + 0.02], rot: [-lean, 0, 0] }))
  }
  // Arms and legs.
  for (const sx of [-1, 1]) {
    parts.push(P.rbox(0.08, 0.04, 0.7, 0.015, ROSE_LIGHT, { at: [sx * 0.31, 0.62, 0.02] }))
    parts.push(P.box(0.05, 0.62, 0.05, ROSE, { at: [sx * 0.31, 0.31, 0.3] }), P.box(0.05, 0.42, 0.05, ROSE, { at: [sx * 0.27, 0.21, -0.26] }))
    parts.push(P.box(0.04, 0.04, 0.56, ROSE_DARK, { at: [sx * 0.29, 0.12, 0.02] }))
  }
  const g = scenery(kit, parts, 1.5)
  g.position.set(...at)
  g.rotation.y = rotY
  return g
}

/**
 * The big pedestal fan by Agong's desk, like his: a heavy black base and pole, a black wire guard and three wide
 * yellow blades. Its head turns slowly side to side (pokes.ts) while the blades spin.
 */
function pedestalFan(kit: Kit, id: string, at: V3, rotY: number) {
  const BLACK = '#2E2C33'
  const fan = poke(kit, id, [P.cyl(0.2, 0.24, 0.05, BLACK, { at: [0, 0.025, 0] }), P.cyl(0.025, 0.03, 1.08, BLACK, { at: [0, 0.56, 0] }), P.cyl(0.04, 0.04, 0.1, '#46434C', { at: [0, 0.78, 0] })], at, { rotY })
  const R = 0.3
  const guard: BufferGeometry[] = [
    P.capsule(0.1, 0.1, BLACK, { at: [0, 0, -0.14], rot: [Math.PI / 2, 0, 0] }),
    P.cyl(0.03, 0.03, 0.1, BLACK, { at: [0, -0.06, -0.12] }),
    P.torus(R, 0.012, BLACK, { at: [0, 0, 0] }),
    P.torus(R * 0.65, 0.005, BLACK, { at: [0, 0, 0.055] }),
    P.torus(R * 0.32, 0.005, BLACK, { at: [0, 0, 0.065] }),
    P.cyl(0.055, 0.055, 0.02, BLACK, { at: [0, 0, 0.07], rot: [Math.PI / 2, 0, 0] }),
    P.torus(R * 0.95, 0.006, BLACK, { at: [0, 0, -0.05] }),
  ]
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    guard.push(P.box(0.006, R - 0.05, 0.006, BLACK, { at: [Math.cos(a) * (R / 2 + 0.03), Math.sin(a) * (R / 2 + 0.03), 0.05], rot: [0, 0, a - Math.PI / 2] }))
  }
  const head = part(kit, `${id}.head`, guard, [0, 1.16, 0], 1)
  head.add(
    part(
      kit,
      `${id}.blades`,
      [P.cyl(0.05, 0.05, 0.06, BLACK, { rot: [Math.PI / 2, 0, 0] }), ...[0, 1, 2].map((i) => P.sphere(0.14, '#F2C230', { at: [Math.cos((i * Math.PI * 2) / 3) * 0.13, Math.sin((i * Math.PI * 2) / 3) * 0.13, 0], scale: [1, 0.55, 0.12], rot: [0, 0, (i * Math.PI * 2) / 3] }))],
      [0, 0, 0.0],
      1.5,
    ),
  )
  fan.add(head)
  return fan
}

