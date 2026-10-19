// Upstairs: the stairs come out in a small hallway that looks down into the shop over a balcony railing (the front
// half of the house is open, two floors high), and glass sliding doors lead back into the room Kaylee sleeps in, at
// the back of the house. In her room: a row of mattresses on the floor along the
// left wall, all the way to the end of the room; the couch on the right; her suitcase; a wardrobe; a fan; and the
// bathroom door at the back on the right, aluminium like the real one (Dad's photo, 2026-10-18). It's locked: it only
// rattles. The floor is pale grey terrazzo tiles like the real one (tiles.ts). Above her suitcase hangs the elephant map:
// the real outline of Thailand on paper, doodled in crayon, with a house pin on Bangkok and a boat pin on Phang Nga Bay
// (the way into the boat trip).
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, type BufferGeometry } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { drawElephantMap, mapUV } from '../../../trip/drawings'
import { PLACES } from '../../../trip/outline'
import { DIM, MAP } from '../layout'
import { standingFan } from './ground'
import { part, poke, scenery, type Kit } from './kit'
import { railing } from './stairs'
import { upstairsFloor } from './tiles'

const FLOOR = '#E2E0DC'
const WALL = '#F4F1EC'
const ALU = '#C3C7CD'
const WOOD = '#E9B98E'
const COUCH = '#C9B8FF'
const COUCH_DARK = '#B4A0F2'
const FRAME = '#D8D2E6'

export interface Upper {
  room: Group
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
      // Kaylee's drawings taped above the mattresses.
      ...[
        [-16.998, PAL.pink],
        [-17.898, PAL.butter],
        [-18.698, PAL.sky],
        [-19.898, PAL.mint],
      ].map(([z, c], i) => P.box(0.02, 0.36, 0.3, c as string, { at: [left + 0.01, U + 1.45 + (i % 2) * 0.18, z as number], rot: [(i % 2 ? 0.08 : -0.06), 0, 0] })),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g1, depth, WALL, { at: [right + 0.075, U + g1 / 2, back / 2] })]))

  // ---- The hallway: a plant, the balcony railing over the shop, the railing round the stairwell ----
  room.add(poke(kit, 'plant', [P.cyl(0.18, 0.13, 0.3, '#EBA27E', { at: [0, 0.15, 0] }), P.sphere(0.24, '#7FCB8F', { at: [0, 0.45, 0] }), ...[0, 2, 4].map((a) => P.sphere(0.06, PAL.hotpink, { at: [Math.cos(a) * 0.18, 0.55, Math.sin(a) * 0.18] }))], [2.1, U, -7.85]))
  const rails: BufferGeometry[] = []
  railing(rails, [left, U, hz + 0.04], [right, U, hz + 0.04])
  // Round the stairwell: its front edge, the right edge beside flight 1 (flight 2 comes out next to it), the back.
  railing(rails, [left, U, zFront + 0.04], [sx1 + 0.04, U, zFront + 0.04])
  railing(rails, [sx1 + 0.04, U, zFront], [sx1 + 0.04, U, DIM.stairs.mid])
  railing(rails, [left, U, zBack - 0.04], [sx1 + 0.04, U, zBack - 0.04])
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

  // ---- The mattresses along the left wall, all the way to the end of the room ----
  const mattress = poke(kit, 'mattress', [], [-2.275, U, -17.998])
  const sheets = [PAL.pink, PAL.lavender, '#FFD3E6']
  const len = (-16.448 - -20.748) / 3
  sheets.forEach((c, i) => {
    const z = -20.748 + len * (i + 0.5) - -17.998
    mattress.add(scenery(kit, [P.rbox(1.58, 0.2, len - 0.04, 0.06, PAL.cream, { at: [0, 0.1, z] }), P.rbox(1.5, 0.03, len - 0.14, 0.02, c, { at: [0, 0.205, z] })], 2))
  })
  // A folded blanket in the middle of the row.
  mattress.add(scenery(kit, [P.rbox(1.2, 0.12, 0.5, 0.05, PAL.lavenderDark, { at: [0, 0.27, 0.9] })], 2))
  room.add(mattress)
  room.add(poke(kit, 'pillows', [P.rbox(0.62, 0.16, 0.4, 0.07, PAL.cream, { at: [-0.38, 0.08, 0] }), P.rbox(0.62, 0.16, 0.4, 0.07, '#FFE3EF', { at: [0.38, 0.08, 0] }), P.box(0.62, 0.012, 0.06, PAL.hotpink, { at: [0.38, 0.165, 0] })], [-2.275, U + 0.2, -20.348]))

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
      [2.795, U, -18.598],
    ),
  )

  // ---- Her suitcase (the lid opens), the wardrobe (the doors open), a fan ----
  const suitcase = poke(kit, 'suitcase', [P.rbox(0.62, 0.26, 0.42, 0.05, PAL.hotpink, { at: [0, 0.13, 0] }), P.box(0.64, 0.03, 0.06, PAL.gold, { at: [0, 0.13, 0.2] })], [-0.9, U, -20.448], { rotY: Math.PI })
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
  room.add(standingFan(kit, 'room-fan', [0.4, U, -16.798], Math.PI))
  room.add(elephantMap(kit))
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
 * The paper map of Thailand taped on the wall (it swings from its top edge when tapped). The outline is drawn into a
 * canvas (trip/drawings.ts); the pins stand out of the paper: a little house on Bangkok, and a boat pin on Phang Nga
 * Bay that bobs, with a soft glow round the map while a trip is waiting.
 */
function elephantMap(kit: Kit) {
  const { w, h } = MAP
  const g = poke(kit, 'map', [P.box(w, h, 0.012, '#FFF6E4', { at: [0, -h / 2, 0.006] })], [MAP.x, MAP.y + h / 2, MAP.z], { px: 1.5 })
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = Math.round(512 * (h / w))
  drawElephantMap(canvas)
  const tex = kit.bag.add(new CanvasTexture(canvas))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const paper = new Mesh(kit.bag.add(new PlaneGeometry(w * 0.985, h * 0.985)), kit.bag.add(new MeshBasicMaterial({ map: tex })))
  paper.position.set(0, -h / 2, 0.0135)
  g.add(paper)
  const glowMat = kit.bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.3, depthWrite: false }))
  const glow = part(kit, 'map.glow', [], [0, -h / 2, 0.001])
  glow.add(new Mesh(kit.bag.add(new PlaneGeometry(w + 0.18, h + 0.18)), glowMat))
  glow.userData.mat = glowMat
  g.add(glow)
  const local = (ll: [number, number]) => {
    const [u, v] = mapUV(ll)
    return [(u - 0.5) * w, -v * h] as const
  }
  const [hx, hy] = local(PLACES.bangkok)
  g.add(scenery(kit, [P.box(0.07, 0.055, 0.03, PAL.pink, { at: [hx, hy + 0.01, 0.03] }), P.cone(0.06, 0.05, PAL.hotpink, { at: [hx, hy + 0.06, 0.03], rot: [0, Math.PI / 4, 0] }, 4)], 1.5))
  const [bx, by] = local(PLACES.phangNga)
  const pin = part(
    kit,
    'map.pin',
    [
      P.cyl(0.008, 0.008, 0.06, PAL.ink, { at: [0, 0.0, 0.03], rot: [Math.PI / 2, 0, 0] }),
      P.sphere(0.035, PAL.hotpink, { at: [0, 0, 0.065] }),
      // A tiny longtail riding on the pin's head.
      P.rbox(0.12, 0.035, 0.045, 0.015, '#E6A375', { at: [0, 0.045, 0.07] }),
      P.cone(0.02, 0.05, PAL.cream, { at: [0.01, 0.085, 0.07] }),
    ],
    [bx, by, 0],
    1.5,
  )
  g.add(pin)
  return g
}
