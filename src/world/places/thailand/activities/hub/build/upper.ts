// Upstairs: the stairs come out in a small hallway that looks down into the shop over a balcony railing (the front
// half of the house is open, two floors high), and glass sliding doors in dark wood frames lead back into the room
// Kaylee sleeps in. Like the real one (Dad's photos, 2026-10-24) it's long: it starts in line with the top of the
// stairs and wraps round the walled-in stairwell, and a plastic accordion partition splits it into the TV room and the
// bedroom at the back (the furniture is in room.ts). The floor is pale grey terrazzo tiles like the real one
// (tiles.ts). The house gecko lives on the back wall (gecko.ts).
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { poke, scenery, type Kit } from './kit'
import { buildRoom, type Partition } from './room'
import { railing } from './stairs'
import { upstairsFloor } from './tiles'

const FLOOR = '#E2E0DC'
const WALL = '#F4F1EC'
/** The glass wall's frames: dark wood like the real ones. */
const FRAME = '#4A3428'

export interface Upper {
  room: Group
  /** The right wall (lowered while she's upstairs, so the camera can see in). */
  rightWall: Group
  /** The glass wall into her room (lowered while she's in the room). */
  glassWall: Group
  /** The walls round the stairwell (lowered while she's upstairs, like the right wall). */
  stairBox: Group
  /** The accordion partition (folds open and shut; lowered while she's behind it). */
  partition: Partition
}

export function buildUpper(kit: Kit): Upper {
  const room = new Group()
  const rightWall = new Group()
  const glassWall = new Group()
  const stairBox = new Group()
  const { left, right, back, g0: U, g1 } = DIM
  const { xLanding: sx1, zTop: zFront, zBack } = DIM.stairs
  const { zFront: hz, zGlass, x0, door0, door1 } = DIM.hall
  const bt = DIM.stairBox.t
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
        [-17.9, PAL.pink],
        [-18.45, PAL.butter],
        [-19.0, PAL.sky],
        [-19.55, PAL.mint],
      ].map(([z, c], i) => P.box(0.02, 0.36, 0.3, c as string, { at: [left + 0.01, U + 1.25 + (i % 2) * 0.18, z as number], rot: [(i % 2 ? 0.08 : -0.06), 0, 0] })),
    ]),
  )
  rightWall.add(scenery(kit, [P.box(0.15, g1, depth, WALL, { at: [right + 0.075, U + g1 / 2, back / 2] })]))

  // ---- The hallway: a plant, the balcony railing over the shop ----
  room.add(poke(kit, 'plant', [P.cyl(0.18, 0.13, 0.3, '#EBA27E', { at: [0, 0.15, 0] }), P.sphere(0.24, '#7FCB8F', { at: [0, 0.45, 0] }), ...[0, 2, 4].map((a) => P.sphere(0.06, PAL.hotpink, { at: [Math.cos(a) * 0.18, 0.55, Math.sin(a) * 0.18] }))], [2.1, U, -5.65]))
  const rails: BufferGeometry[] = []
  railing(rails, [left, U, hz + 0.04], [right, U, hz + 0.04])
  room.add(poke(kit, 'stairs-down', [], [0, 0, 0]).add(scenery(kit, rails, 1.5)))

  // ---- The stairwell, walled in on the room's side (its front stays open: she comes up into the hallway) ----
  stairBox.add(
    scenery(kit, [
      P.box(bt, g1, zGlass - (zBack - bt), WALL, { at: [sx1 + bt / 2, U + g1 / 2, (zGlass + zBack - bt) / 2] }),
      P.box(sx1 + bt - left, g1, bt, WALL, { at: [(left + sx1 + bt) / 2, U + g1 / 2, zBack - bt / 2] }),
      // Skirting along their feet.
      P.box(0.02, 0.1, zGlass - (zBack - bt), '#CFC8BE', { at: [sx1 + bt + 0.01, U + 0.05, (zGlass + zBack - bt) / 2] }),
      P.box(sx1 + bt - left, 0.1, 0.02, '#CFC8BE', { at: [(left + sx1 + bt) / 2, U + 0.05, zBack - bt - 0.01] }),
    ]),
  )
  room.add(stairBox)

  // ---- The glass wall into her room: dark wood frames round three rows of tinted panes, and the sliding door (slid
  // open over the pane to its right, so she can go in) ----
  const W = right - x0
  const bay = (right - door1) / 3
  const posts = [x0 + 0.04, door0, door1, door1 + bay, door1 + bay * 2, right - 0.04]
  const frames: BufferGeometry[] = [P.box(W, 0.1, 0.1, FRAME, { at: [(x0 + right) / 2, U + 2.3, zGlass] }), P.box(W, 0.08, 0.1, FRAME, { at: [(x0 + right) / 2, U + 0.04, zGlass] })]
  for (const x of posts) frames.push(P.box(0.08, 2.3, 0.1, FRAME, { at: [x, U + 1.15, zGlass] }))
  // The glazing bars: three rows of panes in each fixed bay.
  for (const y of [0.78, 1.54]) frames.push(P.box(right - door1, 0.05, 0.06, FRAME, { at: [(door1 + right) / 2, U + y, zGlass] }))
  frames.push(P.box(W, g1 - 2.35, 0.12, WALL, { at: [(x0 + right) / 2, U + 2.35 + (g1 - 2.35) / 2, zGlass] }))
  glassWall.add(scenery(kit, frames, 1.5))
  const glassMat = kit.bag.add(new MeshBasicMaterial({ color: '#9FC4D8', transparent: true, opacity: 0.3, depthWrite: false }))
  const pane = (w: number, x: number, z = zGlass) => new Mesh(kit.bag.add(P.box(w, 2.22, 0.02, '#FFFFFF', { at: [x, U + 1.15, z] })), glassMat)
  for (let i = 2; i < posts.length - 1; i++) glassWall.add(pane(posts[i + 1] - posts[i], (posts[i] + posts[i + 1]) / 2))
  const w = door1 - door0
  const doors = poke(kit, 'glass-doors', [], [door1 + w / 2, U, zGlass - 0.08])
  doors.add(new Mesh(kit.bag.add(P.box(w - 0.1, 2.12, 0.02, '#FFFFFF', { at: [0, 1.12, 0] })), glassMat))
  doors.add(
    scenery(
      kit,
      [
        P.box(w, 0.07, 0.06, FRAME, { at: [0, 2.2, 0] }),
        P.box(w, 0.07, 0.06, FRAME, { at: [0, 0.035, 0] }),
        ...[-1, 1].map((s) => P.box(0.07, 2.24, 0.06, FRAME, { at: [(s * w) / 2, 1.12, 0] })),
        ...[0.78, 1.54].map((y) => P.box(w, 0.04, 0.04, FRAME, { at: [0, y, 0] })),
        P.box(0.03, 0.3, 0.05, PAL.gold, { at: [-w / 2 + 0.12, 1.1, -0.03] }),
      ],
      1.5,
    ),
  )
  glassWall.add(doors)

  const { partition } = buildRoom(kit, room)
  room.add(partition.root)
  room.add(glassWall)
  return { room, rightWall, glassWall, stairBox, partition }
}
