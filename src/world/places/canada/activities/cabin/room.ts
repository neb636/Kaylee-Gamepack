// The skate hut's inside (the Team Cabin's set): a small warm log room. The back wall is round logs with a window on
// the left (snow and pines outside; Gus pokes his head in), a tall oval mirror on the right (it takes the team photo),
// a bunting of little flags, pegs with a pair of skates and the team's sticks, and a shelf with pucks and the Maple Cup
// in the middle. The low log bench runs along the wall (on a tall screen a second bench stands on a step behind it, so
// the team sits in two rows like a team photo). A little iron stove glows in the corner, a lantern hangs from a beam, a
// braided pink rug lies on the plank floor.
//
// Everything that doesn't move is merged into a few meshes (engine3d/geo.ts). `layout` sets the room's width and where
// the window, the mirror and the benches go; the cabin builds a new room when the screen turns.
import { Group, InstancedMesh, Matrix4, SphereGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../../engine3d/geo'
import { PAL, toon } from '../../../../engine3d/toon'
import { leafGeo, makeCup } from '../../story/props'

export type Layout = 'wide' | 'tall'

const LOG = '#C98A55'
const LOG_DARK = '#A86E44'
const LOG_END = '#E9C08F'
const PLANK = '#DDA770'
const PLANK_DARK = '#CC955F'
const BENCH = '#B07A4A'
const CREAM = '#FFF7F0'
const PINK = '#FF8FB8'
const LAV = '#B9A6F5'
const MINT = '#8FE3C8'
const IRON = '#5A4E6E'
const GLOW = '#FF9A3C'

/** Where things are, for a layout. */
export interface RoomPlan {
  /** Half the room's width (the side walls stand at ±this). */
  halfW: number
  /** The back wall's face (z), and its top. */
  wallZ: number
  wallTop: number
  /** The window's opening: middle (x, y) and half its width and height. */
  window: { x: number; y: number; hw: number; hh: number }
  /** The mirror's middle (on the wall) and its half size. */
  mirror: { x: number; y: number; hw: number; hh: number }
  /** The front bench (a deep built-in bench, a box from the floor up): its top (y), front edge (z), depth back from
   *  there, and half its length. */
  bench: { y: number; front: number; depth: number; half: number }
  /** The back bench, higher, behind it (tall screens only). */
  back: { y: number; front: number; depth: number; half: number } | null
  /** The shelf with the Maple Cup, and the pegs with the skates (middles). */
  shelf: V3
  pegs: V3
  /** The bunting's height. */
  bunting: number
  stove: V3
  lantern: V3
}

/** The room for a screen shape, the window and the mirror just beyond the ends of the row on the bench (`row`: half
 *  its length), so a small team isn't lost on a long empty wall. */
export function plan(layout: Layout, row = 3): RoomPlan {
  if (layout === 'tall')
    return {
      halfW: 2.9,
      wallZ: -1.32,
      wallTop: 4.35,
      window: { x: -1.2, y: 3.12, hw: 0.52, hh: 0.4 },
      mirror: { x: 1.22, y: 3.08, hw: 0.38, hh: 0.52 },
      bench: { y: 0.42, front: 0.5, depth: 0.66, half: 1.6 },
      back: { y: 0.98, front: -0.16, depth: 1.02, half: 2.05 },
      shelf: [0, 3.92, 0],
      pegs: [0.05, 3.5, 0],
      bunting: 4.2,
      stove: [2.4, 0, 0.55],
      lantern: [-0.95, 4.1, 0.3],
    }
  const wx = -Math.min(2.9, Math.max(1.55, row + 0.9))
  const mx = Math.min(2.95, Math.max(1.55, row + 0.85))
  return {
    halfW: 4.7,
    wallZ: -1.32,
    wallTop: 3.45,
    window: { x: wx, y: 2.3, hw: 0.6, hh: 0.46 },
    mirror: { x: mx, y: 2.22, hw: 0.44, hh: 0.58 },
    bench: { y: 0.42, front: -0.08, depth: 1.12, half: 3.7 },
    back: null,
    // (Over the middle of the row when it's long; above the window's height over a short one.)
    shelf: wx < -2.4 ? [-0.95, 2.5, 0] : [0, 2.95, 0],
    pegs: [wx + 1.05, 2.45, 0],
    bunting: 3.2,
    stove: [Math.min(4.1, mx + 1.2), 0, -0.55],
    lantern: [mx - 1.25, 3.4, 0.2],
  }
}

export interface Room {
  root: Group
  plan: RoomPlan
  /** The two window panes, hinged at the frame's sides (rotate y to open). */
  panes: [Group, Group]
  /** The stove's flames (scale them to flicker) and its door (it puffs). */
  flames: Group
  stove: Group
  lantern: Group
  /** The pegs' skates (they swing when poked) and the mirror (it flashes). */
  skates: Group
  mirror: Group
  /** Where the next team photo is pinned on the wall (world), and how big. */
  pins: V3[]
  /** Snowflakes falling past the window outside. */
  snow: InstancedMesh
}

/** A round log lying along x from x0 to x1 at height y, its front at the wall. */
function log(parts: ReturnType<typeof P.box>[], x0: number, x1: number, y: number, z: number, r: number, i: number) {
  const len = x1 - x0
  if (len < 0.05) return
  parts.push(P.capsule(r, Math.max(0.01, len - 2 * r), i % 2 ? LOG : LOG_DARK, { at: [(x0 + x1) / 2, y, z], rot: [0, 0, Math.PI / 2] }))
}

export function buildRoom(bag: Bag, layout: Layout, row?: number): Room {
  const p = plan(layout, row)
  const root = new Group()
  const W = p.halfW
  const wz = p.wallZ
  const r = 0.15
  const z = wz - r * 0.2
  const lined: ReturnType<typeof P.box>[] = []
  const plain: ReturnType<typeof P.box>[] = []

  // ---- The back wall: logs from the floor up, cut round the window.
  const win = p.window
  for (let i = 0, y = r; y < p.wallTop + 0.3; i++, y += r * 1.9) {
    const inWin = y > win.y - win.hh - r * 0.6 && y < win.y + win.hh + r * 0.6
    if (inWin) {
      log(lined, -W, win.x - win.hw - 0.12, y, z, r, i)
      log(lined, win.x + win.hw + 0.12, W, y, z, r, i)
    } else log(lined, -W, W, y, z, r, i)
  }
  // The side walls: the log ends of the back wall poke out at the corners, and the sides run toward you.
  for (const s of [-1, 1]) {
    for (let i = 0, y = r; y < p.wallTop; i++, y += r * 1.9) {
      lined.push(P.capsule(r, 3.4, i % 2 ? LOG_DARK : LOG, { at: [s * (W + r * 0.4), y, wz + 1.7], rot: [Math.PI / 2, 0, 0] }))
      plain.push(P.cyl(r * 0.8, r * 0.8, 0.02, LOG_END, { at: [s * (W + r * 0.4), y, wz + 1.7 + 1.7 + r + 0.005], rot: [Math.PI / 2, 0, 0] }, 12))
    }
  }
  // The ceiling's planks, and two beams under it.
  lined.push(P.box(W * 2 + 0.6, 0.08, 6, LOG_DARK, { at: [0, p.wallTop + 0.3, wz + 3] }))
  for (const bz of [wz + 0.55, wz + 2.4]) lined.push(P.rbox(W * 2 + 0.4, 0.22, 0.24, 0.04, LOG_DARK, { at: [0, p.wallTop + 0.15, bz] }))

  // ---- The floor: planks running toward you, and a braided rug.
  for (let x = -W, i = 0; x < W; x += 0.34, i++) lined.push(P.box(0.33, 0.06, 9, i % 3 === 1 ? PLANK_DARK : PLANK, { at: [x + 0.17, -0.03, wz + 4.5] }))
  const rugZ = layout === 'tall' ? 1.45 : 0.85
  for (const [k, c] of [
    [1, PINK],
    [0.82, CREAM],
    [0.66, LAV],
    [0.48, PINK],
    [0.3, CREAM],
  ] as const)
    plain.push(P.cyl(k * (layout === 'tall' ? 1.7 : 2.4), k * (layout === 'tall' ? 1.7 : 2.4), 0.02, c, { at: [0, 0.01 + (1 - k) * 0.012, rugZ], scale: [1, 1, 0.45] }, 36))

  // ---- The window: a cream frame round the opening, a sill, the snowy outside behind it.
  const fw = 0.09
  lined.push(
    P.rbox(win.hw * 2 + fw * 2, fw, 0.14, 0.02, CREAM, { at: [win.x, win.y + win.hh + fw / 2, wz + 0.05] }),
    P.rbox(win.hw * 2 + fw * 4, fw * 1.2, 0.26, 0.03, CREAM, { at: [win.x, win.y - win.hh - fw * 0.6, wz + 0.1] }),
    ...[-1, 1].map((s) => P.rbox(fw, win.hh * 2, 0.14, 0.02, CREAM, { at: [win.x + s * (win.hw + fw / 2), win.y, wz + 0.05] })),
  )
  // Little curtains tied back at each side.
  for (const s of [-1, 1]) lined.push(P.rbox(0.16, win.hh * 2 + 0.2, 0.05, 0.05, PINK, { at: [win.x + s * (win.hw + 0.17), win.y + 0.04, wz + 0.16], rot: [0, 0, s * 0.05] }))
  for (const s of [-1, 1]) plain.push(P.torus(0.06, 0.02, CREAM, { at: [win.x + s * (win.hw + 0.17), win.y - 0.1, wz + 0.2], rot: [0, Math.PI / 2, 0] }))
  // Outside: sky, a snowy bank, pines.
  const out = new Group()
  const ox = win.x
  const oz = wz - 2.4
  out.add(
    solid(
      merge([
        P.box(win.hw * 6, win.hh * 5, 0.05, '#CFE6FF', { at: [ox, win.y, oz - 0.6] }),
        P.sphere(1.6, '#FFFFFF', { at: [ox - 0.6, win.y - win.hh - 1.1, oz], scale: [1.6, 0.7, 0.6] }, 18),
        P.sphere(1.4, '#F2F6FF', { at: [ox + 1.2, win.y - win.hh - 1.0, oz - 0.3], scale: [1.4, 0.7, 0.6] }, 18),
        ...[-0.9, -0.2, 0.75].flatMap((dx, i) => [
          P.cone(0.32 + (i % 2) * 0.08, 1.0 + (i % 2) * 0.3, '#5FA88A', { at: [ox + dx, win.y - win.hh + 0.35 + i * 0.05, oz - 0.2] }, 10),
          P.cone(0.2, 0.45, '#FFFFFF', { at: [ox + dx, win.y - win.hh + 0.78 + i * 0.12, oz - 0.18] }, 10),
        ]),
      ]),
      bag,
      1.6,
    ),
  )
  root.add(out)
  // The panes: each a cream frame with a cross in it, hinged at the frame's side.
  const panes: Group[] = []
  for (const s of [-1, 1]) {
    const hinge = new Group()
    hinge.position.set(win.x + s * win.hw, win.y, wz + 0.04)
    const pw = win.hw
    const g = [
      P.rbox(pw, 0.05, 0.04, 0.01, CREAM, { at: [-s * pw / 2, win.hh - 0.025, 0] }),
      P.rbox(pw, 0.05, 0.04, 0.01, CREAM, { at: [-s * pw / 2, -win.hh + 0.025, 0] }),
      P.rbox(0.05, win.hh * 2, 0.04, 0.01, CREAM, { at: [-s * 0.025, 0, 0] }),
      P.rbox(0.05, win.hh * 2, 0.04, 0.01, CREAM, { at: [-s * (pw - 0.025), 0, 0] }),
      P.rbox(pw, 0.035, 0.03, 0.01, CREAM, { at: [-s * pw / 2, 0, 0] }),
    ]
    hinge.add(solid(merge(g), bag, 1.4))
    root.add(hinge)
    panes.push(hinge)
  }

  // ---- The mirror: a tall pink oval frame with a silvery glass and a shine.
  const mirror = new Group()
  const m = p.mirror
  mirror.position.set(m.x, m.y, wz + 0.2)
  mirror.add(
    solidMix(
      [P.torus(1, 0.09, PINK, { scale: [m.hw, m.hh, 1] }), P.sphere(0.06, PINK, { at: [0, m.hh + 0.06, 0] }), P.cyl(0.97, 0.97, 0.03, '#DCE3FA', { rot: [Math.PI / 2, 0, 0], scale: [m.hw, 1, m.hh] }, 40)],
      [P.capsule(0.03, 0.4, '#FFFFFF', { at: [-m.hw * 0.35, m.hh * 0.25, 0.03], rot: [0, 0, -0.6] }), P.capsule(0.018, 0.22, '#FFFFFF', { at: [-m.hw * 0.12, m.hh * 0.42, 0.03], rot: [0, 0, -0.6] }), P.sphere(0.06, '#FFD6E6', { at: [0, -m.hh - 0.07, 0.02] })],
      bag,
      2,
    ),
  )
  root.add(mirror)
  // A little string from the nail.
  plain.push(...[-1, 1].map((s) => P.capsule(0.006, 0.32, PAL.ink, { at: [m.x + s * 0.1, m.y + m.hh + 0.2, wz + 0.18], rot: [0, 0, s * 0.6] })))

  // ---- The middle of the wall: bunting along the top, a shelf with pucks and the Maple Cup, pegs with sticks.
  const top = p.bunting
  const cols = [PINK, LAV, MINT, '#FFD86B']
  for (let i = 0, n = Math.round(W * 4); i < n; i++) {
    const x = -W + 0.25 + (i / (n - 1)) * (W * 2 - 0.5)
    const sag = Math.sin((i / (n - 1)) * Math.PI) * 0.18
    plain.push(P.prism([[-0.11, 0], [0.11, 0], [0, -0.22]], 0.015, cols[i % 4], { at: [x, top - sag, wz + 0.22] }))
  }
  for (let i = 0; i < 40; i++) {
    const a = i / 39
    const x = -W + 0.25 + a * (W * 2 - 0.5)
    plain.push(P.sphere(0.012, PAL.ink, { at: [x, top - Math.sin(a * Math.PI) * 0.18 + 0.005, wz + 0.22] }, 5))
  }
  const [shelfX, shelfY] = p.shelf
  lined.push(P.rbox(1.5, 0.07, 0.34, 0.02, BENCH, { at: [shelfX, shelfY, wz + 0.2] }), ...[-1, 1].map((s) => P.rbox(0.05, 0.22, 0.24, 0.02, BENCH, { at: [shelfX + s * 0.55, shelfY - 0.14, wz + 0.15] })))
  for (const [i, dx] of [-0.55, -0.42].entries()) lined.push(P.cyl(0.09, 0.09, 0.05, '#2E2A3A', { at: [shelfX + dx, shelfY + 0.06 + i * 0.002, wz + 0.22 + i * 0.04] }, 16))
  lined.push(P.cyl(0.09, 0.09, 0.05, '#2E2A3A', { at: [shelfX - 0.49, shelfY + 0.11, wz + 0.24] }, 16))
  lined.push(P.cyl(0.08, 0.08, 0.2, '#FFD6E6', { at: [shelfX + 0.5, shelfY + 0.14, wz + 0.22] }, 14), P.cyl(0.085, 0.085, 0.04, LAV, { at: [shelfX + 0.5, shelfY + 0.26, wz + 0.22] }, 14))
  plain.push(leafGeo(0.09).translate(shelfX + 0.5, shelfY + 0.14, wz + 0.3))
  const cup = makeCup(bag, 0.42)
  cup.position.set(shelfX + 0.05, shelfY + 0.035, wz + 0.22)
  root.add(cup)
  // The pegs with a pair of skates hanging by their laces (they swing when poked).
  const [pegX, pegY] = p.pegs
  lined.push(P.cyl(0.03, 0.03, 0.16, BENCH, { at: [pegX, pegY, wz + 0.1], rot: [Math.PI / 2, 0, 0] }, 8))
  const skates = new Group()
  skates.position.set(pegX, pegY, wz + 0.17)
  const sk: ReturnType<typeof P.box>[] = []
  for (const s of [-1, 1]) {
    const x = s * 0.09
    sk.push(
      P.capsule(0.01, 0.2, CREAM, { at: [x * 0.5, -0.1, 0], rot: [0, 0, s * 0.25] }),
      P.rbox(0.11, 0.17, 0.2, 0.04, CREAM, { at: [x, -0.32, 0.02] }),
      P.rbox(0.11, 0.07, 0.3, 0.03, CREAM, { at: [x, -0.42, 0.07] }),
      P.rbox(0.02, 0.04, 0.34, 0.01, '#C9D2E8', { at: [x, -0.49, 0.06] }),
      P.rbox(0.115, 0.03, 0.12, 0.01, PINK, { at: [x, -0.26, 0.04] }),
    )
  }
  skates.add(solid(merge(sk), bag, 1.6))
  root.add(skates)

  // ---- The benches: built-in boxes of planks with a rounded seat board on top (and, on a tall screen, a higher one
  // behind for the back row).
  const bench = (b: { y: number; front: number; depth: number; half: number }, color: string) => {
    const t = 0.08
    const cz = b.front - b.depth / 2
    lined.push(P.rbox(b.half * 2, b.y - t, b.depth - 0.04, 0.02, color, { at: [0, (b.y - t) / 2, cz - 0.02] }))
    lined.push(P.rbox(b.half * 2 + 0.08, t, b.depth + 0.04, 0.035, BENCH, { at: [0, b.y - t / 2, cz] }))
    // The front's boards and a kick strip at the bottom.
    for (let x = -b.half + 0.3; x < b.half - 0.1; x += 0.6) plain.push(P.box(0.018, b.y - t - 0.04, 0.01, LOG_DARK, { at: [x, (b.y - t) / 2, b.front - 0.035] }))
    plain.push(P.box(b.half * 2, 0.05, 0.012, LOG_DARK, { at: [0, 0.025, b.front - 0.035] }))
  }
  bench(p.bench, PLANK_DARK)
  if (p.back) bench(p.back, LOG)

  // ---- The stove: a little round iron stove on legs, a glowing window in its door, its pipe up into the roof.
  const stove = new Group()
  stove.position.set(...p.stove)
  const S: ReturnType<typeof P.box>[] = [
    P.cyl(0.32, 0.34, 0.62, IRON, { at: [0, 0.5, 0] }, 20),
    P.cyl(0.36, 0.36, 0.06, IRON, { at: [0, 0.83, 0] }, 20),
    P.cyl(0.08, 0.08, p.wallTop, IRON, { at: [0, 0.86 + p.wallTop / 2, -0.05] }, 12),
    ...[0, 1, 2].map((i) => P.cyl(0.035, 0.045, 0.2, IRON, { at: [Math.sin(i * 2.1) * 0.24, 0.1, Math.cos(i * 2.1) * 0.24] }, 8)),
    P.torus(0.17, 0.03, '#7A6E8E', { at: [0, 0.48, 0.33] }),
  ]
  stove.add(solidMix(S, [P.cyl(0.16, 0.16, 0.02, '#FFC86B', { at: [0, 0.48, 0.33], rot: [Math.PI / 2, 0, 0] }, 20), P.sphere(0.04, '#FFD86B', { at: [0.25, 0.68, 0.22] }, 8)], bag, 2.2))
  const flames = new Group()
  flames.position.set(0, 0.42, 0.345)
  flames.add(solidMix([], [P.cone(0.09, 0.2, GLOW, { at: [0, 0.07, 0], scale: [1, 1, 0.3] }, 10), P.cone(0.06, 0.14, '#FFD86B', { at: [0.05, 0.05, 0.01], scale: [1, 1, 0.3] }, 8), P.cone(0.05, 0.12, '#FFD86B', { at: [-0.06, 0.04, 0.01], scale: [1, 1, 0.3] }, 8)], bag, 0))
  stove.add(flames)
  root.add(stove)
  // A stack of split logs beside it.
  for (const [i, [dx, dy]] of [
    [-0.55, 0.08],
    [-0.75, 0.08],
    [-0.65, 0.24],
  ].entries())
    lined.push(P.cyl(0.08, 0.08, 0.5, i % 2 ? LOG : LOG_DARK, { at: [p.stove[0] + dx, dy, p.stove[2] + 0.1], rot: [Math.PI / 2, 0, 0] }, 10))

  // ---- The lantern, hanging from the beam.
  const lantern = new Group()
  lantern.position.set(...p.lantern)
  lantern.add(
    solidMix(
      [P.cyl(0.006, 0.006, 0.5, PAL.ink, { at: [0, -0.25, 0] }, 4), P.cyl(0.12, 0.1, 0.05, IRON, { at: [0, -0.52, 0] }, 12), P.cyl(0.1, 0.12, 0.05, IRON, { at: [0, -0.8, 0] }, 12), P.torus(0.05, 0.012, IRON, { at: [0, -0.48, 0] }), ...[0, 1, 2, 3].map((i) => P.cyl(0.012, 0.012, 0.24, IRON, { at: [Math.sin(i * 1.57 + 0.78) * 0.095, -0.66, Math.cos(i * 1.57 + 0.78) * 0.095] }, 4))],
      [P.cyl(0.085, 0.085, 0.22, '#FFE9A8', { at: [0, -0.66, 0] }, 12), P.sphere(0.045, '#FFC86B', { at: [0, -0.66, 0] }, 8)],
      bag,
      1.6,
    ),
  )
  root.add(lantern)

  root.add(solidMix(lined, plain, bag, 2))

  // ---- Snow past the window (outside, behind the wall: only the window shows it).
  const snow = new InstancedMesh(bag.add(new SphereGeometry(0.03, 6, 4)), toon('#FFFFFF'), 26)
  const mtx = new Matrix4()
  for (let i = 0; i < snow.count; i++) snow.setMatrixAt(i, mtx.makeTranslation(win.x + (Math.random() - 0.5) * win.hw * 3, win.y + (Math.random() - 0.5) * win.hh * 3, wz - 0.6 - Math.random() * 1.2))
  snow.userData.base = Array.from({ length: snow.count }, () => new Vector3(win.x + (Math.random() - 0.5) * win.hw * 3, Math.random(), wz - 0.6 - Math.random() * 1.2))
  root.add(snow)

  const pins: V3[] = [
    [m.x - m.hw - 0.42, m.y + 0.25, wz + 0.2],
    [m.x - m.hw - 0.42, m.y - 0.32, wz + 0.2],
    [m.x + m.hw + 0.4, m.y, wz + 0.2],
  ]
  return { root, plan: p, panes: panes as [Group, Group], flames, stove, lantern, skates, mirror, pins, snow }
}
