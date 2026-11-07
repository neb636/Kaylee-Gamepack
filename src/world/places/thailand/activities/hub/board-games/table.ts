// The game table in Kaylee's room (game-table.md, greybox: simple shapes in the toon look): a small low table along
// the right wall past the couch, her pink stool on the room side and the cousin's lavender one against the wall, and
// the unicorn bag sitting on the floor beside it. Where they stand is layout.ts's DIM.gameTable (the walk grid and the
// tap targets read the same numbers). When nobody plays, a folded board, a die and three pieces sit on the table, so it
// reads as a board-game table from across the room; the plugin hides them and sets the game's board out.
import { Group } from 'three'
import { P } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { part, poke, scenery, type Kit } from '../build/kit'
import { DIM } from '../layout'

const WOOD = '#F6DCC2'
const WOOD_DARK = '#E9C3A2'
export const BAG_PINK = '#FFC4DE'

export function buildGameTable(kit: Kit): Group {
  const g = new Group()
  const U = DIM.g0
  const t = DIM.gameTable
  const { w, d, h } = t

  // ---- The table (a poke: tap it and it wobbles, and she comes to sit) ----
  const legs = [-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.cyl(0.028, 0.034, h - 0.04, WOOD_DARK, { at: [sx * (w / 2 - 0.07), (h - 0.04) / 2, sz * (d / 2 - 0.08)] }, 10)))
  const table = poke(kit, 'game-table', [P.rbox(w, 0.05, d, 0.022, WOOD, { at: [0, h - 0.025, 0] }), P.rbox(w + 0.02, 0.025, d + 0.02, 0.012, PAL.pink, { at: [0, h - 0.06, 0] }), ...legs], [t.x, U, t.z])
  // What's on it when nobody plays: a folded board, a die and three pieces.
  const idle = part(
    kit,
    'gameTable.idle',
    [
      P.rbox(0.3, 0.03, 0.36, 0.01, PAL.lavender, { at: [-0.06, 0.015, -0.05], rot: [0, 0.18, 0] }),
      P.box(0.28, 0.005, 0.05, PAL.hotpink, { at: [-0.06, 0.032, -0.05], rot: [0, 0.18, 0] }),
      P.rbox(0.06, 0.06, 0.06, 0.012, PAL.hotpink, { at: [0.17, 0.03, 0.27], rot: [0, 0.5, 0] }),
      ...[
        [0.14, 0.14, PAL.mint],
        [0.21, 0.08, PAL.butter],
        [0.08, 0.2, PAL.lavenderDark],
      ].flatMap(([x, z, c]) => [P.cone(0.022, 0.06, c as string, { at: [x as number, 0.03, z as number] }, 10), P.sphere(0.018, c as string, { at: [x as number, 0.07, z as number] }, 10)]),
    ],
    [0, h, 0],
  )
  table.add(idle)
  // Where the plugin sets a game's board out (the table top, its middle).
  const top = new Group()
  top.position.set(0, h, 0)
  kit.parts.set('gameTable.top', top)
  table.add(top)
  g.add(table)

  // ---- Two stools, facing each other across it ----
  const stool = (x: number, seat: number, r: number, c: string, rim: string) => [P.cyl(r, r + 0.02, 0.05, c, { at: [x, seat - 0.025, t.z] }), P.torus(r - 0.01, 0.012, rim, { at: [x, seat, t.z], rot: [Math.PI / 2, 0, 0] }), P.cyl(r * 0.55, r * 0.85, seat - 0.05, c, { at: [x, (seat - 0.05) / 2, t.z] })]
  g.add(scenery(kit, [...stool(t.me.x, t.me.seat, t.me.r, PAL.pink, PAL.hotpink), ...stool(t.them.x, t.them.seat, t.them.r, PAL.lavender, PAL.lavenderDark)]))
  g.position.y = 0
  g.children.forEach((c) => {
    if (c !== table) c.position.y += U
  })

  // ---- The unicorn bag: an ordinary plush bag sitting by the wall (it wobbles when tapped, and never moves) ----
  const b = t.bag
  const bag = poke(
    kit,
    'unicorn-bag',
    [
      P.rbox(0.28, 0.27, 0.16, 0.07, BAG_PINK, { at: [0, 0.145, 0] }),
      // Its face (the front): closed happy eyes, rosy cheeks, a little smile, a muzzle.
      P.rbox(0.13, 0.07, 0.03, 0.03, PAL.cream, { at: [0, 0.1, 0.075] }),
      ...[-1, 1].map((s) => P.box(0.045, 0.012, 0.01, PAL.ink, { at: [s * 0.055, 0.19, 0.082], rot: [0, 0, s * 0.25] })),
      ...[-1, 1].map((s) => P.sphere(0.02, PAL.hotpink, { at: [s * 0.095, 0.15, 0.078], scale: [1, 0.7, 0.4] }, 10)),
      P.box(0.03, 0.008, 0.01, PAL.ink, { at: [0, 0.095, 0.092] }),
      // Ears, the gold horn, a pastel mane down the back.
      ...[-1, 1].map((s) => P.cone(0.03, 0.07, BAG_PINK, { at: [s * 0.09, 0.3, 0], rot: [0, 0, -s * 0.3] }, 10)),
      P.cone(0.022, 0.11, PAL.gold, { at: [0, 0.33, 0.03], rot: [0.25, 0, 0] }, 10),
      ...[PAL.lavenderDark, PAL.mint, PAL.butter, PAL.sky].map((c, i) => P.sphere(0.035, c, { at: [0.02 - i * 0.012, 0.27 - i * 0.055, -0.07] }, 10)),
      // Two straps on the back, and a handle on top.
      ...[-1, 1].map((s) => P.rbox(0.035, 0.22, 0.016, 0.008, PAL.lavender, { at: [s * 0.075, 0.15, -0.085] })),
      P.torus(0.045, 0.01, PAL.lavender, { at: [0, 0.285, -0.02], rot: [0, 0, 0] }, Math.PI),
    ],
    [b.x, U, b.z],
    // Its face turned toward the room and the camera, its back to the wall.
    { rotY: -0.45 },
  )
  g.add(bag)
  return g
}
