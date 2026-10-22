// ICONSIAM by the river, built from code for the glimpse in arrive.ts (Dad's reference photo: the river front at dusk).
// Flat toy shapes in the toon look, from the bottom up:
// - the ground floor: a tall glass hall in the middle (warm light and two trees inside), shops either side, all under
//   the big wooden roof that reaches out over the doors;
// - three folded glass tiers (the panels zig-zag in and out like folded baisri), each narrower and further back, white
//   slabs with little points along their edges and gold horns at their ends;
// - the sign: ICONSIAM in big white 3D letters (each letter its own mesh, so they can pop in one by one) on a white
//   ledge, in front of a dark band so they read from far away;
// - the crown: the gold pointed arch on top, with its silver folds and the dark glass triangle inside.
// And the drop-off in front (buildDropOff): the road with its markings, Thai painted kerbs (red and white; yellow and
// white where a car may stop to let people out), a zebra crossing, a turning circle by the river, lamps, hedges.
import { ExtrudeGeometry, Group, Path, Shape, Vector2, type BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, merge, P, solid } from '../../engine/geo'
import { PAL } from '../../engine/toon'

/** Where the parts are (meters): the ground floor's glass front, the sign's letters, the crown's tip. */
export const ICON = {
  frontZ: -5.2,
  /** The letters stand on the top tier's ledge. */
  sign: { y: 9.5, z: -7.25, h: 1.25 },
  crown: { y: 11.6, z: -8.4, h: 5.2 },
}

const WHITE = '#FFFFFF'
const GLASS_LIT = '#D2EEFC'
const GLASS_SHADE = '#8CC6EA'
const GLASS_CORE = '#86BCDD'
const WARM = '#FFE6BF'
const WOOD = '#E8B583'
const DARK = '#4A3F66'
const SILVER = '#E4E0F0'

// ---------------------------------------------------------------- the letters

/** Letter strokes, as a share of the letters' height. */
const ST = 0.2
/** How far the letters stand above the ledge, on the dark band (meters). */
const LIFT = 0.28
const TRACK = 0.26
const quad = (pts: [number, number][]) => new Shape(pts.map(([x, y]) => new Vector2(x, y)))
const rect = (x: number, y: number, w: number, h: number) => quad([[x, y], [x + w, y], [x + w, y + h], [x, y + h]])

/** A ring cut open between angles a1 and a0 (the C). */
function band(cx: number, cy: number, R: number, r: number, a0: number, a1: number) {
  const s = new Shape()
  s.absarc(cx, cy, R, a0, a1, false)
  s.absarc(cx, cy, r, a1, a0, true)
  s.closePath()
  return s
}

/** The S as one outline: the top bowl's outside round to the middle stroke, on along the bottom bowl's inside, back
 *  round its outside, and the top bowl's inside to the start. Sampled into points (no doubled points where the arcs
 *  meet, which would make the bevel spike), both ends cut at angle `a` past the horizontal. */
function sGlyph(w: number) {
  const R = (1 + ST) / 4
  const r = R - ST
  const ox = w / 2
  const ix = ox - ST * 1.05
  const a = 0.38
  const pts: [number, number][] = []
  const arc = (cy: number, rx: number, ry: number, a0: number, a1: number) => {
    const n = 28
    for (let i = 0; i <= n; i++) {
      const t = a0 + ((a1 - a0) * i) / n
      const p: [number, number] = [ox + Math.cos(t) * rx, cy + Math.sin(t) * ry]
      const last = pts[pts.length - 1]
      if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-4) pts.push(p)
    }
  }
  arc(1 - R, ox, R, a, Math.PI * 1.5)
  arc(R, ix, r, Math.PI / 2, -Math.PI + a)
  arc(R, ox, R, -Math.PI + a, Math.PI / 2)
  arc(1 - R, ix, r, Math.PI * 1.5, a)
  return [quad(pts)]
}

/** ICONSIAM's letters, one unit tall, each starting at x = 0, with their widths. Strokes overlap where they meet. */
function glyph(ch: string): { w: number; shapes: Shape[] } {
  const d = ST * 1.22
  switch (ch) {
    case 'I':
      return { w: ST, shapes: [rect(0, 0, ST, 1)] }
    case 'C':
      return { w: 0.88, shapes: [band(0.5, 0.5, 0.5, 0.5 - ST, 0.72, Math.PI * 2 - 0.72)] }
    case 'O': {
      const o = new Shape()
      o.absarc(0.5, 0.5, 0.5, 0, Math.PI * 2, false)
      const hole = new Path()
      hole.absarc(0.5, 0.5, 0.5 - ST, 0, Math.PI * 2, true)
      o.holes.push(hole)
      return { w: 1, shapes: [o] }
    }
    case 'N': {
      const w = 0.84
      return { w, shapes: [rect(0, 0, ST, 1), rect(w - ST, 0, ST, 1), quad([[0, 1], [d, 1], [w, 0], [w - d, 0]])] }
    }
    case 'S':
      return { w: 0.7, shapes: sGlyph(0.7) }
    case 'A': {
      const w = 0.94
      return {
        w,
        shapes: [
          quad([[0, 0], [d, 0], [w / 2 + d / 2, 1], [w / 2 - d / 2, 1]]),
          quad([[w - d, 0], [w, 0], [w / 2 + d / 2, 1], [w / 2 - d / 2, 1]]),
          rect(w * 0.2, 0.22, w * 0.6, ST * 0.85),
        ],
      }
    }
    case 'M': {
      const w = 1.04
      return {
        w,
        shapes: [
          rect(0, 0, ST, 1),
          rect(w - ST, 0, ST, 1),
          quad([[0, 1], [d, 1], [w / 2 + d / 2, 0.26], [w / 2 - d / 2, 0.26]]),
          quad([[w - d, 1], [w, 1], [w / 2 + d / 2, 0.26], [w / 2 - d / 2, 0.26]]),
        ],
      }
    }
  }
  throw new Error(`no glyph for ${ch}`)
}

/** The sign's letters, each a group whose origin is at the middle of its foot (so it pops up from the ledge). */
function buildLetters(bag: Bag): Group[] {
  const text = 'ICONSIAM'
  const { h } = ICON.sign
  const glyphs = [...text].map(glyph)
  const total = glyphs.reduce((s, g) => s + g.w, 0) + TRACK * (glyphs.length - 1)
  let x = -total / 2
  return glyphs.map((g) => {
    const geo = new ExtrudeGeometry(g.shapes, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.022, bevelSegments: 2, curveSegments: 18 })
    geo.translate(-g.w / 2, 0, 0)
    const letter = solid(merge([bake(geo, WHITE, { scale: [h, h, 1] })]), bag, 1.5)
    letter.position.set((x + g.w / 2) * h, ICON.sign.y + LIFT, ICON.sign.z)
    x += g.w + TRACK
    return letter
  })
}

// ---------------------------------------------------------------- the building

/** A pointed arch (the crown's outline): wide at the foot, bulging a little, then curving in to a point. */
function arch(hw: number, h: number, y0 = 0) {
  const s = new Shape()
  s.moveTo(-hw, y0)
  s.bezierCurveTo(-hw * 1.1, y0 + h * 0.45, -hw * 0.38, y0 + h * 0.78, 0, y0 + h)
  s.bezierCurveTo(hw * 0.38, y0 + h * 0.78, hw * 1.1, y0 + h * 0.45, hw, y0)
  s.closePath()
  return s
}

/** The crown: a deep gold shell with a recessed silver face, its folds and the dark glass triangle. */
function crownParts(): BufferGeometry[] {
  const { y, z, h } = ICON.crown
  const hw = 2.7
  const depth = 2.2
  // The gold shell, open in front where the silver face sits back inside it.
  const shell = arch(hw, h)
  const hole = new Path()
  const ih = h - 0.75
  const ihw = hw - 0.5
  hole.moveTo(-ihw, 0.3)
  hole.bezierCurveTo(-ihw * 1.1, 0.3 + ih * 0.45, -ihw * 0.38, 0.3 + ih * 0.78, 0, 0.3 + ih)
  hole.bezierCurveTo(ihw * 0.38, 0.3 + ih * 0.78, ihw * 1.1, 0.3 + ih * 0.45, ihw, 0.3)
  hole.closePath()
  shell.holes.push(hole)
  const gold = bake(new ExtrudeGeometry(shell, { depth: 0.7, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 2, curveSegments: 20 }), PAL.gold, { at: [0, y, z + depth / 2 - 0.7] })
  const back = bake(new ExtrudeGeometry(arch(hw, h), { depth: depth - 0.7, bevelEnabled: false, curveSegments: 20 }), '#F2B230', { at: [0, y, z - depth / 2] })
  // The silver face inside: folded facets running up to the tip, the dark triangle in the middle.
  const fz = z + depth / 2 - 0.62
  const tri = (pts: [number, number][], c: string, dz: number) => P.prism(pts, 0.06, c, { at: [0, y, fz + dz] })
  const tip = 0.3 + ih
  return [
    gold,
    back,
    bake(new ExtrudeGeometry(arch(ihw + 0.05, ih + 0.05, 0.28), { depth: 0.1, bevelEnabled: false, curveSegments: 20 }), SILVER, { at: [0, y, fz - 0.12] }),
    tri([[-ihw, 0.3], [-ihw * 0.45, 0.3], [0, tip - 0.1]], '#F6F4FB', 0),
    tri([[ihw, 0.3], [ihw * 0.45, 0.3], [0, tip - 0.1]], '#CFC9E2', 0),
    tri([[-ihw * 0.45, 0.3], [ihw * 0.45, 0.3], [0, tip - 0.35]], WHITE, 0.03),
    tri([[-ihw * 0.32, 0.3], [ihw * 0.32, 0.3], [0, tip - 0.85]], '#3E4C80', 0.07),
    // A gold sill along the crown's foot.
    P.box(hw * 2 + 0.3, 0.22, depth + 0.2, PAL.gold, { at: [0, y + 0.08, z] }),
  ]
}

/** One folded glass tier: panels zig-zagging in and out across the front, a core behind, a white slab on top with
 *  little points along its edge and gold horns at both ends. */
function tierParts(hw: number, y0: number, y1: number, front: number, peaks: string | null): BufferGeometry[] {
  const out: BufferGeometry[] = []
  const h = y1 - y0
  const n = Math.max(2, Math.round((hw * 2) / 1.45) & ~1)
  const pw = (hw * 2) / n
  const fold = 0.8
  const zAt = (i: number) => front - (i % 2 ? fold : 0)
  for (let i = 0; i < n; i++) {
    const x0 = -hw + i * pw
    const z0 = zAt(i)
    const z1 = zAt(i + 1)
    const len = Math.hypot(pw, z1 - z0)
    out.push(P.box(len, h, 0.05, z1 < z0 ? GLASS_LIT : GLASS_SHADE, { at: [x0 + pw / 2, y0 + h / 2, (z0 + z1) / 2], rot: [0, Math.atan2(z0 - z1, pw), 0] }))
  }
  for (let i = 0; i <= n; i++) out.push(P.box(0.07, h, 0.07, WHITE, { at: [-hw + i * pw, y0 + h / 2, zAt(i) + 0.02] }))
  // The core behind the glass (so nothing shows through), back to the far side.
  const back = -20
  out.push(P.box(hw * 2 - 0.1, h, front - fold - 0.08 - back, GLASS_CORE, { at: [0, y0 + h / 2, (front - fold - 0.08 + back) / 2] }))
  // The slab on top, reaching out a little.
  out.push(P.box(hw * 2 + 0.5, 0.24, front + 0.45 - back, WHITE, { at: [0, y1 + 0.12, (front + 0.45 + back) / 2] }))
  if (peaks) for (let i = 0; i <= n; i += 2) out.push(P.prism([[-0.32, 0], [0.32, 0], [0, 0.34]], 0.1, peaks, { at: [-hw + i * pw, y1 + 0.22, front + 0.38] }))
  // Gold horns curling up at both ends, like the tips of a temple roof.
  for (const s of [-1, 1]) out.push(P.cone(0.11, 0.7, PAL.gold, { at: [s * (hw + 0.38), y1 + 0.42, front + 0.3], rot: [0, 0, -s * 0.55] }, 10))
  return out
}

/** The ground floor: the tall glass hall in the middle (warm inside, two trees), the shops either side. */
function groundParts(): BufferGeometry[] {
  const z = ICON.frontZ
  const out: BufferGeometry[] = []
  const H = 3.4
  // The hall: an open frame of slim white mullions over a warm room (reads as glass with the lights on).
  out.push(P.box(10, H, 0.12, WARM, { at: [0, H / 2, z - 2.4] }))
  out.push(P.box(10, 0.04, 2.4, '#F4DEC0', { at: [0, 0.02, z - 1.2] }))
  for (let i = 0; i <= 10; i++) out.push(P.box(0.06, H, 0.08, WHITE, { at: [-5 + i, H / 2, z] }))
  out.push(P.box(10, 0.08, 0.1, WHITE, { at: [0, 2.75, z] }))
  for (const x of [-2.6, 2.6]) out.push(P.cyl(0.07, 0.09, 1.5, '#B88760', { at: [x, 0.75, z - 1.6] }, 8), P.sphere(0.65, '#7AD69E', { at: [x, 1.85, z - 1.6], scale: [1, 0.85, 1] }, 12))
  // The shops either side, a step back, with their own warm windows and a base.
  for (const s of [-1, 1]) {
    const cx = s * 9
    out.push(P.box(8, H, 0.12, '#FFF0D6', { at: [cx, H / 2, z - 1.4] }))
    for (let i = 0; i <= 8; i++) out.push(P.box(0.07, H - 0.3, 0.08, WHITE, { at: [cx - 4 + i, (H - 0.3) / 2 + 0.3, z - 0.3] }))
    out.push(P.box(8, 0.3, 0.3, '#D8D2E6', { at: [cx, 0.15, z - 0.3] }), P.box(8, 0.08, 0.1, WHITE, { at: [cx, 2.6, z - 0.3] }))
    // The sides of the shops, back to the core.
    out.push(P.box(0.2, H, 14, '#E6E0F2', { at: [s * 13, H / 2, z - 7.4] }))
  }
  out.push(P.box(26, H, 0.2, '#E6E0F2', { at: [0, H / 2, z - 14] }))
  // The big wooden roof reaching out over the doors (white edge on top, warm wood underneath).
  out.push(P.rbox(15, 0.42, 4.6, 0.08, WOOD, { at: [0, H + 0.2, z + 1.0] }))
  out.push(P.box(15.1, 0.12, 4.7, WHITE, { at: [0, H + 0.46, z + 1.0] }))
  return out
}

export interface Iconsiam {
  root: Group
  /** I, C, O, N, S, I, A, M: pop them in one by one. */
  letters: Group[]
}

export function buildIconsiam(bag: Bag): Iconsiam {
  const root = new Group()
  const z = ICON.frontZ
  const { y: sy, z: sz, h: sh } = ICON.sign
  const tiers = [
    tierParts(13, 3.4, 5.6, z - 0.7, WHITE),
    tierParts(11.2, 5.84, 7.6, z - 1.4, WHITE),
    tierParts(9.2, 7.84, sy - 0.24, z - 2.1, null),
  ].flat()
  root.add(solid(merge([
    ...groundParts(),
    ...tiers,
    // The sign's level: a dark band (the letters show white against it), the ledge they stand on, the roof above it
    // with gold points along its edge and gold horns.
    P.box(14, sh + 0.7, 0.2, DARK, { at: [0, sy + (sh + 0.7) / 2 - 0.1, sz - 0.75] }),
    P.box(14, sh + 0.7, 12, GLASS_CORE, { at: [0, sy + (sh + 0.7) / 2 - 0.1, sz - 6.9] }),
    P.box(14, 0.07, 0.5, PAL.gold, { at: [0, sy + 0.035, sz - 0.4] }),
    P.box(14.6, 0.26, 12.6, WHITE, { at: [0, sy + sh + 0.72, sz - 5.9] }),
    ...Array.from({ length: 10 }, (_, i) => P.prism([[-0.34, 0], [0.34, 0], [0, 0.4]], 0.1, PAL.gold, { at: [-6.75 + i * 1.5, sy + sh + 0.85, sz + 0.3] })),
    ...[-1, 1].map((s) => P.cone(0.13, 0.85, PAL.gold, { at: [s * 7.6, sy + sh + 1.05, sz + 0.3], rot: [0, 0, -s * 0.6] }, 10)),
    ...crownParts(),
  ]), bag, 1.5))
  // Warm little lights under the roof's edge and along the tiers.
  const dots: BufferGeometry[] = []
  for (let x = -7; x <= 7.01; x += 1) dots.push(P.sphere(0.07, PAL.butter, { at: [x, 3.36, z + 3.1] }, 6))
  for (const [hw, y, f] of [[12.6, 3.38, z - 0.25], [10.8, 5.6, z - 0.95], [8.8, 7.6, z - 1.65]] as const) for (let x = -hw; x <= hw + 0.01; x += 1.2) dots.push(P.sphere(0.06, '#FFF3B8', { at: [x, y, f] }, 6))
  root.add(solid(merge(dots), bag, 0))
  const letters = buildLetters(bag)
  for (const l of letters) root.add(l)
  // Behind on the right: the tall tower of homes next door (lavender, white balconies); across the river, a skyline.
  root.add(solid(merge([
    P.box(6, 34, 6, '#DCD5EE', { at: [24, 17, -32] }),
    ...Array.from({ length: 26 }, (_, i) => P.box(6.3, 0.18, 6.3, WHITE, { at: [24, 2 + i * 1.25, -32] })),
    ...[[24, 7, PAL.peach], [29, 11, PAL.lavender], [34, 6, PAL.mint], [38, 9, '#FFD6E7'], [43, 13, PAL.lavender]].map(([x, h, c]) => P.box(4, h as number, 4, c as string, { at: [x as number, (h as number) / 2, -22] })),
  ]), bag, 1.5))
  return { root, letters }
}

// ---------------------------------------------------------------- the drop-off

const ASPHALT = '#B4AECB'
const PAVING = '#FFF7F0'
const PAINT = '#FFFFFF'
const KERB_RED = '#E8434F'

/** The road (near kerb at z -0.6, the car's lane at z 1.3), the plaza up to the glass, the river walk. */
export function buildDropOff(bag: Bag): Group {
  const root = new Group()
  const X0 = -36
  const X1 = 11
  const turn = { x: X1, z: 4.0, r: 4.4 }
  const far = 8.6
  // The road and the turning circle at its end by the river: flat, so no outline (it would draw the circle's edge
  // across the road).
  const asphalt = [
    P.box(X1 - X0, 0.1, far + 0.4, ASPHALT, { at: [(X0 + X1) / 2, -0.05, (far - 0.4) / 2] }),
    P.cyl(turn.r, turn.r, 0.1, ASPHALT, { at: [turn.x, -0.05, turn.z] }, 40),
  ]
  const ground: BufferGeometry[] = [
    // The island in the turning circle.
    P.cyl(1.5, 1.5, 0.2, '#8FD49A', { at: [turn.x + 0.6, 0.1, turn.z] }, 24),
    // The plaza in front of the glass, the river walk, the far pavement and the grass beyond.
    P.box(X1 + 4.2 - X0, 0.1, 4.6, PAVING, { at: [(X0 + X1 + 4.2) / 2, -0.04, -3.0] }),
    P.box(1.4, 0.1, 30, PAVING, { at: [15.5, -0.04, 9.6] }),
    P.box(X1 - X0, 0.1, 2.0, PAVING, { at: [(X0 + X1) / 2, -0.04, far + 1.2] }),
    P.box(60, 0.1, 30, '#9EDB9A', { at: [X1 - 30, -0.06, far + 17] }),
  ]
  // Thai kerbs: painted blocks, red and white, but yellow and white along the drop-off where a car may stop.
  const kerb = (x: number, z: number, along: 'x' | 'z', i: number, drop: boolean) =>
    P.box(along === 'x' ? 1 : 0.4, 0.18, along === 'x' ? 0.4 : 1, i % 2 ? WHITE : drop ? PAL.gold : KERB_RED, { at: [x, 0.09, z] })
  for (let x = X0; x < X1; x++) ground.push(kerb(x + 0.5, -0.6, 'x', x, x >= -6 && x < 6), kerb(x + 0.5, far + 0.2, 'x', x, false))
  for (let i = 0; i < 26; i++) {
    // Round the turning circle's far side, and round its island.
    const a = -Math.PI / 2 + (i / 25) * Math.PI
    const r = turn.r + 0.2
    ground.push(P.box(0.4, 0.18, 0.62, i % 2 ? WHITE : KERB_RED, { at: [turn.x + Math.cos(a) * r, 0.09, turn.z + Math.sin(a) * r], rot: [0, -a, 0] }))
    const b = (i / 26) * Math.PI * 2
    ground.push(P.box(0.25, 0.24, 0.42, i % 2 ? WHITE : KERB_RED, { at: [turn.x + 0.6 + Math.cos(b) * 1.55, 0.12, turn.z + Math.sin(b) * 1.55], rot: [0, -b, 0] }))
  }
  // Hedges in beds along the plaza (round and layered, like the real ones), with pink bougainvillea; the doors clear.
  const greens = ['#5FCB8F', '#7AD69E', '#4FB77F']
  for (const [a, b] of [[-14, -3.6], [3.6, 10.4]]) {
    ground.push(P.rbox(b - a, 0.3, 1.5, 0.08, '#E6E0F2', { at: [(a + b) / 2, 0.15, -3.7] }))
    for (let x = a + 0.5, i = 0; x < b; x += 0.8, i++) {
      ground.push(P.sphere(0.55, greens[i % 3], { at: [x, 0.45, -3.6 - (i % 2) * 0.25], scale: [1, 0.72, 0.9] }, 12))
      if (i % 3 === 1) ground.push(P.sphere(0.24, PAL.pink, { at: [x + 0.15, 0.82, -3.35], scale: [1, 0.7, 1] }, 8))
    }
  }
  // Along the far pavement: a hedge, flowers, in front of the grass.
  for (let x = -20, i = 0; x < X1 - 1; x += 1.1, i++) {
    ground.push(P.sphere(0.5, greens[i % 3], { at: [x, 0.3, far + 2.6], scale: [1, 0.7, 0.9] }, 10))
    if (i % 2) ground.push(P.sphere(0.22, i % 4 === 1 ? PAL.pink : PAL.hotpink, { at: [x + 0.2, 0.6, far + 2.4], scale: [1, 0.7, 1] }, 8))
  }
  // Street lamps on the plaza: a white pole, an arm over the road, a warm lamp.
  for (const x of [-13, -6.5, 6.5, 12.5]) {
    const z = x > 11 ? -1.4 : -1.1
    ground.push(
      P.cyl(0.07, 0.1, 4.4, WHITE, { at: [x, 2.2, z] }, 10),
      P.cyl(0.16, 0.2, 0.25, '#D8D2E6', { at: [x, 0.12, z] }, 10),
      P.box(0.07, 0.07, 0.9, WHITE, { at: [x, 4.35, z + 0.42] }),
      P.rbox(0.28, 0.16, 0.42, 0.05, PAL.butter, { at: [x, 4.26, z + 0.86] }),
    )
  }
  // The railing along the river walk.
  for (let i = 0; i < 15; i++) ground.push(P.box(0.06, 0.8, 0.06, WHITE, { at: [16.2, 0.4, -9 + i * 1.6] }))
  ground.push(P.box(0.08, 0.06, 23, WHITE, { at: [16.2, 0.8, 2.2] }))
  root.add(solid(merge(ground), bag, 1.5))

  // The paint (no outlines): edge lines, the drop-off bay's short dashes, the lane line, the zebra crossing with its
  // stop line, and arrows pointing the way the cars go.
  const y = 0.006
  const paint: BufferGeometry[] = [
    ...asphalt,
    P.box(X1 - X0, 0.01, 0.12, PAINT, { at: [(X0 + X1) / 2, y, -0.2] }),
    P.box(X1 - X0, 0.01, 0.12, PAINT, { at: [(X0 + X1) / 2, y, far - 0.2] }),
  ]
  for (let x = X0; x < X1 - 1; x += 2) paint.push(P.box(1, 0.01, 0.12, PAINT, { at: [x + 0.5, y, 2.75] }))
  for (let x = X0; x < X1 - 3; x += 6) paint.push(P.box(3, 0.01, 0.12, PAINT, { at: [x + 1.5, y, 5.65] }))
  const zebra = 8.2
  for (let z = -0.05; z < far - 0.3; z += 0.9) paint.push(P.box(2.4, 0.012, 0.46, PAINT, { at: [zebra, y + 0.001, z + 0.23] }))
  paint.push(P.box(0.3, 0.01, far - 0.2, PAINT, { at: [zebra - 1.8, y, (far - 0.4) / 2] }))
  const arrow: [number, number][] = [[-1.1, -0.12], [0.3, -0.12], [0.3, -0.38], [1.1, 0], [0.3, 0.38], [0.3, 0.12], [-1.1, 0.12]]
  for (const [x, z] of [[-10, 1.3], [-15, 4.2], [-15, 7.1]]) paint.push(P.prism(arrow, 0.01, PAINT, { at: [x, y + 0.002, z], rot: [-Math.PI / 2, 0, 0] }))
  root.add(solid(merge(paint), bag, 0))
  return root
}
