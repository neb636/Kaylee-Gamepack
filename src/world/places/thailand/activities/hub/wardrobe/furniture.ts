// Kaylee's wardrobe in her room (wardrobe.html): a pastel toy wardrobe against the left wall, a crown-shaped top with a
// heart, two doors with a heart on each (a long mirror inside the right one, so she sees herself when it's open), three
// rows of shelves on a polka-dot back, a hanging rail with two hangers, and six drawers below, one per drawer of things
// (hats, glasses, wings, outfits, shoes, paint), each a different color with a little picture of what's inside on its
// front and a gold heart knob, so she can find them without reading. The toy (plugin.ts) swings the doors, slides the
// drawers and stands the things on the shelves.
//
// Built facing +z around its own base, then turned to face into the room (+x) at layout.ts's DIM.wardrobe.
import { CylinderGeometry, Group, Vector3, type BufferGeometry } from 'three'
import { isHalloweenDay } from '../../../../../../shell/season'
import { heart } from '../../../characters/closet/fit'
import { bake, P, type V3 } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
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
/** The drawers' size and where each sits (local: its front face's center). */
const DW = 0.44
const DH = 0.28
const drawerAt = (i: number): V3 => [(i % 3 - 1) * 0.47, i < 3 ? 0.56 : 0.24, D / 2 - 0.015]
/** Where the doors close over the shelves. */
const DOOR = { y0: 0.82, y1: H - 0.1, w: W / 2 - 0.04 }
/** How far each door swings open (radians) and each drawer slides out (meters). */
export const DOOR_OPEN = 2.95
export const DRAWER_OUT = 0.26
/** The shelves' tops (local y), top row first: the two shelves and the floor of the cupboard under them. */
export const SHELVES = [1.62, 1.2, 0.815]
/** Up to this many things stand on one row, across this much of the shelf (meters), its middle a little right of the
 *  shelf's: the open left door hides the shelves' left end from her camera. */
const PER_ROW = 4
const ROW = 1.2
const ROW_X = 0.05

/** How the `n` things of a drawer stand on the shelves: how many rows (from the middle shelf up, then the bottom one)
 *  and how much room each thing has (meters across and up). */
export function shelfRoom(n: number) {
  const rows = Math.ceil(n / PER_ROW)
  const per = Math.ceil(n / rows)
  return { rows, per, w: Math.min(0.44, ROW / per - 0.02), h: rows > 2 ? 0.32 : 0.36 }
}

/** Where the `i`th thing of `n` stands (local): up to 3 along the middle shelf; more in rows of up to 4 (the middle
 *  and top shelves, then the bottom), filled top row first. */
export function shelfSlot(i: number, n: number): Vector3 {
  const { rows, per } = shelfRoom(n)
  const ys = rows === 1 ? [SHELVES[1]] : rows === 2 ? SHELVES.slice(0, 2) : SHELVES
  const row = Math.floor(i / per)
  const inRow = Math.min(per, n - row * per)
  const k = i - row * per
  return new Vector3(ROW_X + (k - (inRow - 1) / 2) * (ROW / per), ys[row], 0.03)
}

/** Where the 4 pictures hang on the left door's inside (the door's own frame, facing -z, the room when it's open): two
 *  columns, two rows, over the hearts. */
export const PHOTO_SIZE = { w: 0.27, h: 0.36 }
export const photoPin = (i: number): V3 => [(DOOR.w / 2) + (i % 2 ? 0.16 : -0.16), (DOOR.y0 + DOOR.y1) / 2 + (i < 2 ? 0.27 : -0.27), -0.018]

/** A heart standing up on a face, facing +z (a door, a knob). */
const heartOn = (r: number, depth: number, c: string, at: V3): BufferGeometry => P.prism(heart(r), depth, c, { at })

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
  const halloween = isHalloweenDay()
  const WOOD = halloween ? '#FFD1A6' : '#FBD3E3'
  const TRIM = halloween ? '#9670C7' : '#B9A6F5'
  const INSIDE = halloween ? '#FFF2DE' : '#FFF1F6'
  // Polka dots on the back inside, little scallops along the shelves' fronts and the base.
  const dots: BufferGeometry[] = []
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      const x = (c - 3) * 0.19 + (r % 2 ? 0.095 : 0)
      if (Math.abs(x) < W / 2 - 0.1) dots.push(P.cyl(0.022, 0.022, 0.006, r % 2 ? '#FFD3E5' : '#E9DEFF', { at: [x, 0.9 + r * 0.18, -D / 2 + 0.052], rot: [Math.PI / 2, 0, 0] }, 12))
    }
  }
  const scallops = (y: number, z: number, w: number, c: string, r = 0.03) =>
    Array.from({ length: Math.floor(w / (r * 2)) }, (_, i) => P.cyl(r, r, 0.012, c, { at: [-w / 2 + r + i * r * 2, y, z], rot: [Math.PI / 2, 0, 0] }, 14))
  const root = poke(
    kit,
    'wardrobe',
    [
      ...[-1, 1].map((s) => P.box(0.06, H - 0.08, D, WOOD, { at: [s * (W / 2 - 0.03), (H - 0.08) / 2, 0] })),
      P.rbox(W + 0.08, 0.09, D + 0.06, 0.03, TRIM, { at: [0, H - 0.045, 0] }),
      P.box(W, H, 0.04, WOOD, { at: [0, H / 2, -D / 2 + 0.02] }),
      P.box(W - 0.06, 0.1, D - 0.04, TRIM, { at: [0, 0.05, 0] }),
      P.box(W - 0.12, 0.05, D - 0.03, WOOD, { at: [0, 0.79, 0] }),
      // The inside behind the shelves, a little lighter, with polka dots.
      P.box(W - 0.12, H - 0.95, 0.01, INSIDE, { at: [0, 0.82 + (H - 0.95) / 2, -D / 2 + 0.045] }),
      ...dots,
      ...SHELVES.slice(0, 2).map((y) => P.box(W - 0.12, 0.035, D - 0.1, INSIDE, { at: [0, y - 0.0175, -0.02] })),
      ...SHELVES.slice(0, 2).flatMap((y) => scallops(y - 0.04, D / 2 - 0.07, W - 0.16, '#FFC2DD', 0.022)),
      ...scallops(0.1, D / 2 - 0.01, W - 0.1, '#FFE3EF', 0.035),
      // The hanging rail and two little hangers.
      P.cyl(0.012, 0.012, W - 0.12, '#C3C7CD', { at: [0, 1.88, -0.03], rot: [0, 0, Math.PI / 2] }),
      ...[-0.3, 0.32].map((x) => P.torus(0.07, 0.008, TRIM, { at: [x, 1.8, -0.03], scale: [1.4, 0.7, 1] }, Math.PI)),
      // The crown on top: an arch with a pink heart, scalloped like a crown's points, gold balls on its tips and corners.
      bake(new CylinderGeometry(0.36, 0.36, 0.08, 32, 1, false, Math.PI / 2, Math.PI), TRIM, { at: [0, H, 0.06], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.62] }),
      ...[-0.42, -0.21, 0.21, 0.42].map((x) => P.cone(0.07, 0.15, TRIM, { at: [x, H + 0.06 + (0.42 - Math.abs(x)) * 0.25, 0.06] }, 12)),
      ...[-0.42, -0.21, 0.21, 0.42, -W / 2 - 0.01, W / 2 + 0.01].map((x) => P.sphere(0.035, PAL.gold, { at: [x, Math.abs(x) > 0.5 ? H + 0.03 : H + 0.15 + (0.42 - Math.abs(x)) * 0.25, 0.06] }, 12)),
      heartOn(0.1, 0.03, '#FF6FAE', [0, H + 0.1, 0.105]),
      P.sphere(0.022, '#FFFFFF', { at: [-0.04, H + 0.15, 0.125] }, 10),
    ],
    [DIM.left + D / 2, DIM.g0, DIM.wardrobe.z],
    { rotY: Math.PI / 2 },
  )
  if (halloween) {
    // A smiling pumpkin and a friendly ghost perched on the cupboard, clear of the drawers and mirror.
    const deco: BufferGeometry[] = []
    for (const [x, ghost] of [[-0.53, false], [0.53, true]] as const) {
      const y = H + 0.15
      deco.push(P.sphere(0.14, ghost ? '#FFF7EC' : '#FFAB67', { at: [x, y, 0.08], scale: [1, ghost ? 1.15 : 0.8, 0.75] }, 18))
      if (!ghost) deco.push(P.capsule(0.022, 0.06, '#9DD58F', { at: [x, y + 0.13, 0.08], rot: [0, 0, -0.2] }))
      for (const s of [-1, 1]) deco.push(P.sphere(0.012, '#514263', { at: [x + s * 0.04, y + 0.01, 0.185] }, 8))
      deco.push(P.torus(0.03, 0.007, '#514263', { at: [x, y - 0.025, 0.19], rot: [0, 0, Math.PI] }, Math.PI))
    }
    root.add(scenery(kit, deco, 1))
  }
  // The doors: hinged at the outside edges, a heart on each. Inside the right one, a long mirror: when the doors are
  // open it faces the room, and she sees herself.
  for (const [name, s] of [['doorL', -1], ['doorR', 1]] as const) {
    const at: V3 = [s * (W / 2 - 0.02), 0, D / 2 + 0.005]
    const cx = -s * (DOOR.w / 2)
    const cy = (DOOR.y0 + DOOR.y1) / 2
    const h = DOOR.y1 - DOOR.y0
    const parts = [
      P.rbox(DOOR.w, h, 0.035, 0.015, WOOD, { at: [cx, cy, 0.0175] }),
      P.rbox(DOOR.w - 0.12, h - 0.14, 0.012, 0.01, s < 0 ? '#FFE3EF' : '#E6EEFF', { at: [cx, cy, 0.04] }),
      heartOn(0.075, 0.012, s < 0 ? '#FF8FB8' : '#B9A6F5', [cx, cy + 0.22, 0.048]),
      heartOn(0.05, 0.012, PAL.gold, [-s * (DOOR.w - 0.07), cy, 0.05]),
      // The inside: a soft lining, and on the right door the mirror's pink frame.
      P.rbox(DOOR.w - 0.08, h - 0.1, 0.008, 0.008, s < 0 ? '#FFE3EF' : '#FF9CC8', { at: [cx, cy, -0.002] }),
    ]
    if (s < 0) for (const dy of [-0.25, 0, 0.25]) parts.push(P.prism(heart(0.045), 0.006, '#FFB8D6', { at: [cx, cy + dy, -0.007], rot: [0, Math.PI, 0] }))
    const door = part(kit, `wardrobe.${name}`, parts, at)
    door.userData.pick = 'wardrobe'
    if (s > 0) {
      const mirror = part(kit, 'wardrobe.mirror', [P.rbox(DOOR.w - 0.16, h - 0.2, 0.008, 0.06, '#DCEBFF', { at: [cx, cy, -0.008] })], [0, 0, 0])
      const shine = scenery(kit, [-0.06, 0.04].map((dx, i) => P.box(i ? 0.025 : 0.045, h * 0.5, 0.002, '#FFFFFF', { at: [cx + dx, cy + 0.1, -0.0135], rot: [0, 0, -0.35] })), 0)
      mirror.add(shine)
      mirror.userData.pick = 'wardrobe'
      door.add(mirror)
    }
    root.add(door)
  }
  DRAWERS.forEach((d, i) => {
    if (halloween && d.id !== 'outfit') return
    const width = halloween ? W - 0.12 : DW
    const height = halloween ? 0.5 : DH
    const drawer = part(
      kit,
      `wardrobe.drawer.${d.id}`,
      [P.rbox(width, height, 0.04, 0.015, d.color), P.box(width - 0.04, height - 0.06, 0.4, INSIDE, { at: [0, -0.01, -0.22] }), heartOn(0.03, 0.022, PAL.gold, [0, -height / 2 + 0.055, 0.03]), ...icon(d.id)],
      halloween ? [0, 0.4, D / 2 - 0.015] : drawerAt(i),
    )
    drawer.userData.pick = 'wardrobe'
    drawer.userData.base = drawer.position.clone()
    root.add(drawer)
  })
  // The things on the shelves go in here (the toy fills it).
  const inside = new Group()
  kit.parts.set('wardrobe.inside', inside)
  root.add(inside)
  // A round rug in front of it, where she stands to dress up: pink with a ring of little hearts.
  const { rug } = DIM.wardrobe
  const hearts = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    return P.prism(heart(0.05), 0.006, i % 2 ? '#FF8FB8' : '#C9B5F7', { at: [Math.cos(a) * (rug.r - 0.07), 0.024, Math.sin(a) * (rug.r - 0.07)], rot: [-Math.PI / 2, 0, -a - Math.PI / 2] })
  })
  const rugMesh = scenery(kit, [P.cyl(rug.r, rug.r, 0.02, '#FFC2DD', { at: [0, 0.01, 0] }, 32), P.cyl(rug.r - 0.13, rug.r - 0.13, 0.024, '#FFE3EF', { at: [0, 0.012, 0] }, 32), ...hearts], 1.5)
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
