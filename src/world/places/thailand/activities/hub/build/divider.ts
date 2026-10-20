// The divider between Agong's front room and the stairs, like his real one (Dad's photo, 2026-10-20): a wall of glossy
// rosewood cabinets, floor to ceiling, from the left wall to the right one; the stairs end against its back (Dad's
// sketch). A doorway with carved corner brackets leads through to the stairs, a lucky
// charm hanging by it; glass-doored cabinets full of little treasures run along the top; on the right, open shelves with
// the gold Garuda and the Buddhas, the TV, a picture and the red and gold boxes; cupboards along the bottom.
// The part above the cupboards lowers (house.ts) when she walks behind it, so the camera still sees her.
import { Group, Mesh, MeshBasicMaterial, type BufferGeometry } from 'three'
import { merge, P } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { DIM } from '../layout'
import { BRASS, FRAME_DARK, GILT, GILT_DARK, ROSE, ROSE_DARK, ROSE_LIGHT } from './ground'
import { scenery, type Kit } from './kit'

/** Top of the cupboards: the part above it is what lowers. */
export const DIVIDER_BASE = 1.0
const OPEN_TOP = 2.35
const BAND = 2.6
const TOP = 3.45
const RED = '#D9434F'
const WHITE = '#F4F1EA'

export interface Divider {
  /** The cupboards along the bottom (always there). */
  low: Group
  /** Everything above them (lowered while she's behind it). */
  high: Group
}

export function buildDivider(kit: Kit): Divider {
  const { left, right, g0 } = DIM
  const { z, d, open0, open1 } = DIM.divider
  const x0 = left
  const zf = z + d / 2
  const zb = z - d / 2
  const W = right - x0
  const cx = (x0 + right) / 2
  const sides: [number, number][] = [
    [left, open0],
    [open1, right],
  ]
  const low: BufferGeometry[] = []
  const high: BufferGeometry[] = []
  const things: BufferGeometry[] = []

  // ---- Cupboards along the bottom, right of the doorway: a plinth, panelled doors with brass knobs, a top ----
  for (const [x0, x1] of sides) {
    const w = x1 - x0
    const cx = (x0 + x1) / 2
    low.push(
      P.box(w, 0.08, d - 0.04, ROSE_DARK, { at: [cx, 0.04, z - 0.02] }),
      P.box(w, DIVIDER_BASE - 0.12, d, ROSE, { at: [cx, 0.08 + (DIVIDER_BASE - 0.12) / 2, z] }),
      P.rbox(w + 0.03, 0.04, d + 0.04, 0.012, ROSE_LIGHT, { at: [cx, DIVIDER_BASE - 0.02, z] }),
    )
    const n = Math.max(1, Math.round(w / 0.55))
    const dw = w / n
    for (let i = 0; i < n; i++) {
      const x = x0 + dw * (i + 0.5)
      const knob = x + (i % 2 ? -1 : 1) * (dw / 2 - 0.08)
      low.push(
        P.box(dw - 0.05, 0.74, 0.02, ROSE_LIGHT, { at: [x, 0.5, zf + 0.01] }),
        P.box(dw - 0.2, 0.54, 0.015, ROSE, { at: [x, 0.5, zf + 0.025] }),
        P.cyl(0.022, 0.022, 0.03, BRASS, { at: [knob, 0.6, zf + 0.04], rot: [Math.PI / 2, 0, 0] }),
      )
    }
  }

  // ---- Posts: the doorway's two (the left one just right of the stairs), and one against each wall ----
  for (const [x, w, top] of [
    [left + 0.04, 0.08, g0],
    [open0 - 0.06, 0.12, g0],
    [open1 + 0.06, 0.12, g0],
    [right - 0.04, 0.08, g0],
  ]) {
    low.push(P.box(w, DIVIDER_BASE, d + 0.04, ROSE_DARK, { at: [x, DIVIDER_BASE / 2, z] }))
    high.push(P.box(w, top - DIVIDER_BASE, d + 0.04, ROSE_DARK, { at: [x, (DIVIDER_BASE + top) / 2, z] }))
  }

  // ---- The doorway's header with a panel, and the carved brackets in its top corners ----
  const ow = open1 - open0
  const oc = (open0 + open1) / 2
  high.push(
    P.box(ow, BAND - 0.1 - OPEN_TOP, d, ROSE, { at: [oc, (OPEN_TOP + BAND - 0.1) / 2, z] }),
    P.box(ow - 0.24, 0.07, 0.02, ROSE_LIGHT, { at: [oc, (OPEN_TOP + BAND - 0.1) / 2, zf + 0.01] }),
  )
  const bracket: [number, number][] = [
    [0, 0],
    [0.32, 0],
    [0.32, -0.05],
    [0.22, -0.07],
    [0.13, -0.12],
    [0.07, -0.2],
    [0.04, -0.3],
    [0, -0.32],
  ]
  high.push(
    P.prism(bracket, d - 0.04, ROSE_LIGHT, { at: [open0, OPEN_TOP, z] }),
    P.prism(
      bracket.map(([x, y]) => [-x, y]).reverse() as [number, number][],
      d - 0.04,
      ROSE_LIGHT,
      { at: [open1, OPEN_TOP, z] },
    ),
  )

  // ---- The open shelves above the cupboards: dark inside ----
  const mid = (BAND - 0.1 + DIVIDER_BASE) / 2
  const midH = BAND - 0.1 - DIVIDER_BASE
  for (const [x0, x1] of sides) high.push(P.box(x1 - x0, midH, 0.03, FRAME_DARK, { at: [(x0 + x1) / 2, mid, zb + 0.015] }))
  // Right: two bays (the TV and the Garuda on the left, the picture and the boxes on the right) with a shelf across.
  const xm = (open1 + right) / 2
  const shelfR = 1.72
  high.push(
    P.box(right - open1, 0.04, d - 0.03, ROSE_LIGHT, { at: [(open1 + right) / 2, shelfR, z] }),
    P.box(0.06, midH, d, ROSE, { at: [xm, mid, z] }),
  )

  // The TV on its stand, showing something bright.
  const tx = (open1 + xm) / 2
  const ty = DIVIDER_BASE + 0.34
  things.push(
    P.box(0.32, 0.04, 0.18, '#26232B', { at: [tx, DIVIDER_BASE + 0.02, z] }),
    P.box(0.06, 0.06, 0.04, '#26232B', { at: [tx, DIVIDER_BASE + 0.07, z] }),
    P.rbox(0.92, 0.56, 0.06, 0.02, '#26232B', { at: [tx, ty, z] }),
    P.box(0.84, 0.48, 0.01, '#2F6BD6', { at: [tx, ty, z + 0.035] }),
    P.box(0.84, 0.12, 0.012, '#7FC8F8', { at: [tx, ty + 0.17, z + 0.037] }),
    P.box(0.62, 0.05, 0.014, PAL.hotpink, { at: [tx - 0.05, ty - 0.02, z + 0.04], rot: [0, 0, 0.35] }),
    P.box(0.5, 0.04, 0.014, '#E8505B', { at: [tx + 0.1, ty - 0.1, z + 0.04], rot: [0, 0, 0.3] }),
    P.box(0.34, 0.035, 0.014, PAL.gold, { at: [tx + 0.12, ty + 0.06, z + 0.04], rot: [0, 0, 0.4] }),
  )
  // Above it, the gold Garuda with its wings up, between two little golden Buddhas.
  const gy = shelfR + 0.02
  things.push(
    P.cyl(0.09, 0.11, 0.06, GILT_DARK, { at: [tx, gy + 0.03, z] }),
    P.sphere(0.07, GILT, { at: [tx, gy + 0.16, z], scale: [0.9, 1.3, 0.7] }),
    P.sphere(0.045, GILT, { at: [tx, gy + 0.29, z + 0.01] }),
    P.cone(0.02, 0.05, GILT_DARK, { at: [tx, gy + 0.28, z + 0.06], rot: [Math.PI / 2, 0, 0] }),
    P.cone(0.025, 0.07, GILT, { at: [tx, gy + 0.35, z] }),
    ...[-1, 1].flatMap((s) => [
      P.sphere(0.13, GILT, { at: [tx + s * 0.15, gy + 0.26, z - 0.02], scale: [1, 0.45, 0.12], rot: [0, 0, s * 0.7] }),
      P.sphere(0.09, GILT_DARK, { at: [tx + s * 0.2, gy + 0.33, z - 0.03], scale: [1, 0.35, 0.1], rot: [0, 0, s * 0.95] }),
      P.cone(0.06, 0.16, GILT, { at: [tx + s * 0.36, gy + 0.09, z], rot: [0, 0, 0] }),
      P.sphere(0.035, GILT, { at: [tx + s * 0.36, gy + 0.19, z] }),
      P.cone(0.015, 0.04, GILT, { at: [tx + s * 0.36, gy + 0.23, z] }),
    ]),
    P.cyl(0.04, 0.05, 0.12, WHITE, { at: [tx - 0.48, gy + 0.06, z + 0.04] }),
    P.sphere(0.05, WHITE, { at: [tx - 0.48, gy + 0.15, z + 0.04] }),
  )
  // Right bay: a deity picture in a gold frame and two white vases; up top the red box under the gold tin.
  const bx = (xm + right) / 2
  things.push(
    P.box(0.4, 0.52, 0.03, GILT, { at: [bx - 0.12, DIVIDER_BASE + 0.29, z - 0.06], rot: [-0.1, 0, 0] }),
    P.box(0.32, 0.44, 0.02, '#E8A04A', { at: [bx - 0.12, DIVIDER_BASE + 0.29, z - 0.04], rot: [-0.1, 0, 0] }),
    P.sphere(0.09, '#C84B3A', { at: [bx - 0.12, DIVIDER_BASE + 0.25, z - 0.03], scale: [1, 1.6, 0.15], rot: [-0.1, 0, 0] }),
    P.sphere(0.05, '#F2C9A0', { at: [bx - 0.12, DIVIDER_BASE + 0.44, z - 0.015], scale: [1, 1.1, 0.2] }),
    ...[0.2, 0.33].flatMap((dx, i) => [
      P.cyl(0.045, 0.06, 0.2 - i * 0.04, WHITE, { at: [bx + dx, DIVIDER_BASE + 0.1 - i * 0.02, z + 0.05] }),
      P.cyl(0.035, 0.025, 0.05, WHITE, { at: [bx + dx, DIVIDER_BASE + 0.22 - i * 0.04, z + 0.05] }),
    ]),
    P.rbox(0.6, 0.13, 0.3, 0.02, RED, { at: [bx, shelfR + 0.085, z] }),
    P.rbox(0.54, 0.22, 0.27, 0.02, GILT, { at: [bx, shelfR + 0.26, z] }),
    P.box(0.3, 0.1, 0.01, RED, { at: [bx, shelfR + 0.26, z + 0.14] }),
  )

  // Left, in front of the stairs: one shelf with Agong's books, a jar and a green tub.
  const lw = open0 - 0.12 - left
  const lc = left + lw / 2
  const shelfL = 1.78
  high.push(P.box(lw, 0.04, d - 0.03, ROSE_LIGHT, { at: [lc, shelfL, z] }))
  const books = ['#B5453A', '#2F5E8C', '#E0B04A', '#3F7A55', '#7A4B8C', '#C9683A']
  books.forEach((c, i) => {
    const h = 0.26 + ((i * 7) % 5) * 0.025
    things.push(P.box(0.05, h, 0.22, c, { at: [left + 0.2 + i * 0.065, DIVIDER_BASE + h / 2, z], rot: [0, 0, i === 5 ? -0.25 : 0] }))
  })
  things.push(
    P.cyl(0.08, 0.08, 0.2, '#CFE6F2', { at: [lc + 0.2, DIVIDER_BASE + 0.1, z] }),
    P.cyl(0.085, 0.085, 0.03, RED, { at: [lc + 0.2, DIVIDER_BASE + 0.215, z] }),
    P.rbox(0.4, 0.22, 0.28, 0.03, '#5DBB7A', { at: [lc, shelfL + 0.13, z] }),
  )
  // ---- The band across the top of everything, the glass cabinets and the crown ----
  high.push(
    P.box(W, 0.1, d + 0.06, ROSE_DARK, { at: [cx, BAND - 0.05, z] }),
    P.box(W, TOP - BAND, 0.03, FRAME_DARK, { at: [cx, (BAND + TOP) / 2, zb + 0.015] }),
    P.box(W, g0 - TOP, d + 0.08, ROSE_DARK, { at: [cx, (TOP + g0) / 2, z] }),
    P.box(W, 0.035, 0.02, ROSE_LIGHT, { at: [cx, TOP + 0.04, zf + 0.05] }),
  )
  const n = Math.round(W / 0.75)
  const dw = W / n
  const ch = TOP - BAND
  const glass: BufferGeometry[] = []
  const treasures = [
    (x: number) => [P.cone(0.06, 0.18, GILT, { at: [x, BAND + 0.09, z] }), P.sphere(0.04, GILT, { at: [x, BAND + 0.21, z] })],
    (x: number) => [P.cyl(0.05, 0.07, 0.24, WHITE, { at: [x, BAND + 0.12, z] }), P.sphere(0.06, WHITE, { at: [x, BAND + 0.24, z] })],
    (x: number) => [P.rbox(0.2, 0.14, 0.14, 0.02, PAL.hotpink, { at: [x, BAND + 0.07, z] })],
    (x: number) => [P.cyl(0.07, 0.07, 0.3, GILT_DARK, { at: [x, BAND + 0.15, z] }), P.cone(0.07, 0.12, GILT, { at: [x, BAND + 0.36, z] })],
    (x: number) => [P.sphere(0.08, '#CFE6F2', { at: [x, BAND + 0.08, z], scale: [1, 0.8, 1] })],
  ]
  for (let i = 0; i < n; i++) {
    const x = x0 + dw * (i + 0.5)
    const cy = (BAND + TOP) / 2
    const zd = zf - 0.02
    high.push(
      ...[-1, 1].map((s) => P.box(0.06, ch, 0.03, ROSE_LIGHT, { at: [x + s * (dw / 2 - 0.03), cy, zd] })),
      ...[-1, 1].map((s) => P.box(dw, 0.06, 0.03, ROSE_LIGHT, { at: [x, cy + s * (ch / 2 - 0.03), zd] })),
      P.cyl(0.02, 0.02, 0.03, BRASS, { at: [x + (i % 2 ? -1 : 1) * (dw / 2 - 0.1), cy - 0.08, zd + 0.03], rot: [Math.PI / 2, 0, 0] }),
    )
    glass.push(P.box(dw - 0.12, ch - 0.12, 0.01, '#FFFFFF', { at: [x, cy, zd] }))
    things.push(...treasures[i % treasures.length](x - 0.12), ...treasures[(i + 2) % treasures.length](x + 0.14))
  }

  // ---- The lucky charm hanging on the doorway's left post: a red cord, a golden knot and a red tassel ----
  const hx = open0 - 0.06
  const hz = zf + 0.04
  things.push(
    P.box(0.012, 0.42, 0.012, RED, { at: [hx, OPEN_TOP - 0.25, hz] }),
    P.sphere(0.045, GILT, { at: [hx, OPEN_TOP - 0.48, hz], scale: [1, 1.3, 0.5] }),
    P.cyl(0.015, 0.015, 0.04, RED, { at: [hx, OPEN_TOP - 0.56, hz] }),
    P.cone(0.04, 0.16, RED, { at: [hx, OPEN_TOP - 0.66, hz], rot: [Math.PI, 0, 0] }),
  )

  const lowG = new Group()
  lowG.add(scenery(kit, low, 2))
  const highG = new Group()
  const glassMat = kit.bag.add(new MeshBasicMaterial({ color: '#CFEFFF', transparent: true, opacity: 0.28, depthWrite: false }))
  highG.add(scenery(kit, high, 2), scenery(kit, things, 1), new Mesh(kit.bag.add(merge(glass)), glassMat))
  return { low: lowG, high: highG }
}
