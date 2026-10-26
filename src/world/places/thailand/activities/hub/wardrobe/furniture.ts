// Kaylee's wardrobe in her room (wardrobe.html, greybox 1): a pastel toy wardrobe against the left wall, two doors over
// open shelves (a long mirror on one), a hanging rail with two hangers, and six drawers below, one per drawer of things
// (hats, glasses, wings, outfits, shoes, paint), each a different color with a little picture of what's inside on its
// front, so she can find them without reading. The toy (plugin.ts) swings the doors, slides the drawers and stands the
// things on the shelves.
//
// Built facing +z around its own base, then turned to face into the room (+x) at layout.ts's DIM.wardrobe.
import { Group, Vector3 } from 'three'
import { P, type V3 } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import type { Slot } from '../../../characters/style'
import { part, poke, scenery, type Kit } from '../build/kit'
import { DIM } from '../layout'

export type DrawerId = Slot | 'paint'
/** The drawers, top row then bottom row, left to right as she faces it. */
export const DRAWERS: { id: DrawerId; name: string; color: string }[] = [
  { id: 'head', name: 'Hats', color: '#FF8FB8' },
  { id: 'face', name: 'Glasses', color: '#FBEA9A' },
  { id: 'back', name: 'Wings', color: '#8FE3C8' },
  { id: 'outfit', name: 'Outfits', color: '#D9CCFF' },
  { id: 'feet', name: 'Shoes', color: '#A8DCFF' },
  { id: 'paint', name: 'Paint', color: '#FFC2A8' },
]

const W = DIM.wardrobe.w
const D = DIM.wardrobe.d
const H = DIM.wardrobe.h
const WOOD = '#FBD3E3'
const TRIM = '#B9A6F5'
const INSIDE = '#FFF1F6'
/** The drawers' size and where each sits (local: its front face's center). */
const DW = 0.44
const DH = 0.28
const drawerAt = (i: number): V3 => [(i % 3 - 1) * 0.47, i < 3 ? 0.56 : 0.24, D / 2 - 0.015]
/** Where the doors close over the shelves. */
const DOOR = { y0: 0.82, y1: H - 0.1, w: W / 2 - 0.04 }
/** How far each door swings open (radians) and each drawer slides out (meters). */
export const DOOR_OPEN = 2.7
export const DRAWER_OUT = 0.26
/** The two shelves' tops (local y). */
export const SHELVES = [1.2, 1.62]

/** Where the `i`th thing of `n` on the shelves stands (local): up to 3 along the lower shelf; more (the paint pots) four
 *  to a shelf, the upper one first. */
export function shelfSlot(i: number, n: number): Vector3 {
  if (n <= 3) return new Vector3((i - (n - 1) / 2) * 0.46, SHELVES[0], 0.02)
  const row = i < 4 ? 1 : 0
  const k = i % 4
  return new Vector3((k - 1.5) * 0.34, SHELVES[row], 0.04)
}

/** A little picture of what's in the drawer, on its front (local to the front's center, facing +z). */
function icon(id: DrawerId) {
  const z = 0.035
  const g = '#FFC83D'
  switch (id) {
    case 'head':
      return [P.cyl(0.055, 0.05, 0.035, g, { at: [0, -0.02, z], rot: [Math.PI / 2, 0, 0] }), ...[-1, 0, 1].map((s) => P.cone(0.018, 0.045, g, { at: [s * 0.035, 0.03, z] }))]
    case 'face':
      return [...[-1, 1].map((s) => P.torus(0.032, 0.008, '#FF4F9A', { at: [s * 0.042, 0, z] })), P.box(0.03, 0.008, 0.008, '#FF4F9A', { at: [0, 0.005, z] })]
    case 'back':
      return [-1, 1].map((s) => P.sphere(0.05, '#FFFFFF', { at: [s * 0.045, 0.005, z], rot: [0, 0, s * -0.5], scale: [1.1, 0.7, 0.3] }))
    case 'outfit':
      return [P.cone(0.06, 0.1, '#FF8FB8', { at: [0, -0.02, z], scale: [1, 1, 0.35] }), P.box(0.05, 0.04, 0.015, '#FF8FB8', { at: [0, 0.04, z] })]
    case 'feet':
      return [-1, 1].map((s) => P.rbox(0.05, 0.035, 0.03, 0.012, '#FFFFFF', { at: [s * 0.035, -0.01, z] }))
    case 'paint':
      return ['#FF6FAE', '#8FE3C8', '#8EC9F5'].map((c, i) => P.sphere(0.024, c, { at: [(i - 1) * 0.05, i === 1 ? 0.02 : -0.005, z] }))
  }
}

/** Builds the wardrobe into her room. Its moving parts are in kit.parts: `wardrobe.doorL`, `wardrobe.doorR` and
 *  `wardrobe.drawer.<id>`; `wardrobe.inside` is where the toy stands the things. */
export function buildWardrobe(kit: Kit): Group {
  const root = poke(
    kit,
    'wardrobe',
    [
      ...[-1, 1].map((s) => P.box(0.06, H - 0.08, D, WOOD, { at: [s * (W / 2 - 0.03), (H - 0.08) / 2, 0] })),
      P.rbox(W + 0.08, 0.09, D + 0.06, 0.03, TRIM, { at: [0, H - 0.045, 0] }),
      P.box(W, H, 0.04, WOOD, { at: [0, H / 2, -D / 2 + 0.02] }),
      P.box(W - 0.06, 0.1, D - 0.04, TRIM, { at: [0, 0.05, 0] }),
      P.box(W - 0.12, 0.05, D - 0.03, WOOD, { at: [0, 0.79, 0] }),
      // The inside behind the shelves, a little lighter.
      P.box(W - 0.12, H - 0.95, 0.01, INSIDE, { at: [0, 0.82 + (H - 0.95) / 2, -D / 2 + 0.045] }),
      ...SHELVES.map((y) => P.box(W - 0.12, 0.035, D - 0.1, INSIDE, { at: [0, y - 0.0175, -0.02] })),
      // The hanging rail and two little hangers.
      P.cyl(0.012, 0.012, W - 0.12, '#C3C7CD', { at: [0, 1.88, -0.03], rot: [0, 0, Math.PI / 2] }),
      ...[-0.3, 0.32].map((x) => P.torus(0.07, 0.008, TRIM, { at: [x, 1.8, -0.03], scale: [1.4, 0.7, 1] }, Math.PI)),
    ],
    [DIM.left + D / 2, DIM.g0, DIM.wardrobe.z],
    { rotY: Math.PI / 2 },
  )
  // The doors: hinged at the outside edges, the right one with a long mirror.
  for (const [name, s] of [['doorL', -1], ['doorR', 1]] as const) {
    const at: V3 = [s * (W / 2 - 0.02), 0, D / 2 + 0.005]
    const cx = -s * (DOOR.w / 2)
    const cy = (DOOR.y0 + DOOR.y1) / 2
    const h = DOOR.y1 - DOOR.y0
    const parts = [P.rbox(DOOR.w, h, 0.035, 0.015, WOOD, { at: [cx, cy, 0.0175] }), P.rbox(DOOR.w - 0.12, h - 0.14, 0.012, 0.01, s < 0 ? '#FFE3EF' : '#E6EEFF', { at: [cx, cy, 0.04] })]
    if (s > 0) parts.push(P.box(0.05, h - 0.4, 0.004, '#FFFFFF', { at: [cx - 0.08, cy + 0.08, 0.048], rot: [0, 0, 0.35] }))
    parts.push(P.sphere(0.025, PAL.gold, { at: [-s * (DOOR.w - 0.06), cy, 0.06] }))
    const door = part(kit, `wardrobe.${name}`, parts, at)
    door.userData.pick = 'wardrobe'
    root.add(door)
  }
  DRAWERS.forEach((d, i) => {
    const drawer = part(kit, `wardrobe.drawer.${d.id}`, [P.rbox(DW, DH, 0.04, 0.015, d.color), P.box(DW - 0.04, DH - 0.06, 0.4, INSIDE, { at: [0, -0.01, -0.22] }), P.sphere(0.026, PAL.cream, { at: [0, -DH / 2 + 0.05, 0.03] }), ...icon(d.id)], drawerAt(i))
    drawer.userData.pick = 'wardrobe'
    drawer.userData.base = drawer.position.clone()
    root.add(drawer)
  })
  // The things on the shelves go in here (the toy fills it).
  const inside = new Group()
  kit.parts.set('wardrobe.inside', inside)
  root.add(inside)
  // A round rug in front of it, where she stands to dress up.
  const { rug } = DIM.wardrobe
  const rugMesh = scenery(kit, [P.cyl(rug.r, rug.r, 0.02, '#FFC2DD', { at: [0, 0.01, 0] }, 32), P.cyl(rug.r - 0.12, rug.r - 0.12, 0.024, '#FFE3EF', { at: [0, 0.012, 0] }, 32)], 1.5)
  rugMesh.position.set(rug.x, DIM.g0, rug.z)
  const both = new Group()
  both.add(root, rugMesh)
  return both
}

/** Where a drawer's front is now (world), for its tap target. */
export function drawerFront(kit: Kit, id: DrawerId): Vector3 | null {
  const d = kit.parts.get(`wardrobe.drawer.${id}`)
  return d ? d.getWorldPosition(new Vector3()) : null
}
