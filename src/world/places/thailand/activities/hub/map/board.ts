// The Thailand map's shapes (geo.ts says where): a clay-toy diorama of the country lying on a paper map on a wooden
// table, in the house's toon look (Dad, 2026-10-29: "replace the flat Thailand map with something like this", a clay
// diorama and a 3D map of Thailand on parchment). The paper is the neighbours (cream, with an inked double border and a
// compass rose), the seas are painted on it in turquoise with shallow water along Thailand's coasts, and Thailand
// itself stands up off the paper as one thick rounded slab of green clay: misty mountains in the north, a patchwork of
// rice fields on Isan's plateau and the central plain, the Chao Phraya winding down to Bangkok, the Mekong along the
// border, trees, Phuket and Samui, Phang Nga Bay's limestone towers by Krabi. The three places stand on it like toys
// (Bangkok's shophouses and ICONSIAM's two towers by the river, Nan's rice terraces and hut, Krabi's rock towers and a
// beach), each under a pin's pole, and the things to poke stand round them. Hot-air balloons (Sparkle's kind) float over
// the north. No temples or Buddhas anywhere (AGENTS.md rule 7).
//
// Units: meters, x east, z south (the camera looks north), y up. The 2D stage (geo.ts) maps across at K a stage unit.
import { BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, Group, Shape, ShapeGeometry, SphereGeometry, Vector2, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { ANDAMAN, ANDAMAN_COAST, CHAO_PHRAYA, GULF, GULF_COAST, HILLS, ISLANDS, MEKONG, PINS, POKES, proj, STAGE, THAILAND, type PinId, type PokeId, type XY } from './geo'

export type XZ = [number, number]
type G = BufferGeometry

/** Meters per stage unit (the country is about 3.3 m by 5.9 m: a big toy on the table). */
export const K = 0.004
/** A stage point (geo.ts) on the table. */
export const m = ([x, y]: XY): XZ => [(x - STAGE.w / 2) * K, (y - STAGE.h / 2) * K]
/** The rain cloud's height over its spot (before TOY.poke). */
export const CLOUD_Y = 0.26
/** How high Thailand's clay stands off the paper. */
export const SLAB = 0.1
/** The painted sea's height on the paper. */
const SEA_Y = 0.009
/** The things to poke, the places and the balloons are chunky toys, this much bigger than the map's scale. */
export const TOY = { poke: 1.8, place: 1.7, balloon: 1.7 }
/** The paper's corners, in stage units (lon ~95.1-107.5, lat ~4.3-21.7). */
const PAPER = { x0: -90, x1: STAGE.w + 90, y0: -70, y1: STAGE.h + 70 }

const PAPER_C = '#F7ECD4'
const INKLINE = '#C7AB86'
const SEA = '#A3DBF0'
const SHALLOW = '#C9EEF4'
const RIVER = '#8CCDF2'
const LAND_TOP = '#AEDF8F'
const LAND_SIDE = '#86C47C'
const WOOD = '#D8AE84'
const WOOD_DARK = '#B5865E'
const ROCK = '#DCD5E8'
const JUNGLE = '#6FBF7F'

export interface Board {
  root: Group
  /** Each place's toy (it bounces when tapped), at its pin. */
  places: Record<PinId, Group>
  /** Where each pin's bubble floats (the DOM pin goes there), world. */
  pinTop: Record<PinId, [number, number, number]>
  pokes: Pokes
  balloons: Group[]
}

// ------------------------------------------------------------------ small geometry helpers

/** A smooth curve through the points (uniform Catmull-Rom, like the 2D map's), `per` samples a stretch. */
export function curve(pts: XZ[], closed: boolean, per = 6): XZ[] {
  const n = pts.length
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  const out: XZ[] = []
  const segs = closed ? n : n - 1
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    for (let s = 0; s < per; s++) {
      const t = s / per
      const t2 = t * t
      const t3 = t2 * t
      const f = (k: 0 | 1) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      out.push([f(0), f(1)])
    }
  }
  if (!closed) out.push(pts[n - 1])
  return out
}

/** The polygon clipped to a rectangle (Sutherland-Hodgman): the seas run on far past the paper. */
function clipRect(poly: XY[], r: { x0: number; x1: number; y0: number; y1: number }): XY[] {
  const edges: [(p: XY) => boolean, (a: XY, b: XY) => XY][] = [
    [(p) => p[0] >= r.x0, (a, b) => [r.x0, a[1] + ((b[1] - a[1]) * (r.x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= r.x1, (a, b) => [r.x1, a[1] + ((b[1] - a[1]) * (r.x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= r.y0, (a, b) => [a[0] + ((b[0] - a[0]) * (r.y0 - a[1])) / (b[1] - a[1]), r.y0]],
    [(p) => p[1] <= r.y1, (a, b) => [a[0] + ((b[0] - a[0]) * (r.y1 - a[1])) / (b[1] - a[1]), r.y1]],
  ]
  let out = poly
  for (const [inside, cut] of edges) {
    const src = out
    out = []
    for (let i = 0; i < src.length; i++) {
      const a = src[(i + src.length - 1) % src.length]
      const b = src[i]
      if (inside(b)) {
        if (!inside(a)) out.push(cut(a, b))
        out.push(b)
      } else if (inside(a)) out.push(cut(a, b))
    }
  }
  return out
}

/** Is a point inside the polygon (even-odd)? */
export function inside(poly: XZ[], x: number, z: number) {
  let c = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]
    const [xj, zj] = poly[j]
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c
  }
  return c
}

/** A 2D shape in table meters (x, z), for the flat-lying geometries. */
const shapeOf = (pts: XZ[]) => new Shape(pts.map(([x, z]) => new Vector2(x, -z)))

/** A flat shape lying on the table at height `y`. */
function flat(pts: XZ[], y: number, c: ColorRepresentation) {
  return bake(new ShapeGeometry(shapeOf(pts), 4).rotateX(-Math.PI / 2), c, { at: [0, y, 0] })
}

/** A flat ribbon along a line at height `y` (a river, a border line), `w` wide. */
function ribbon(line: XZ[], w: number, y: number, c: ColorRepresentation) {
  const pos: number[] = []
  const edge = (i: number) => {
    const [ax, az] = line[Math.max(0, i - 1)]
    const [bx, bz] = line[Math.min(line.length - 1, i + 1)]
    const l = Math.hypot(bx - ax, bz - az) || 1
    const nx = (-(bz - az) / l) * (w / 2)
    const nz = ((bx - ax) / l) * (w / 2)
    const [x, z] = line[i]
    return { l: [x + nx, y, z + nz], r: [x - nx, y, z - nz] }
  }
  let a = edge(0)
  for (let i = 1; i < line.length; i++) {
    const b = edge(i)
    pos.push(...a.l, ...b.l, ...a.r, ...a.r, ...b.l, ...b.r)
    a = b
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(pos.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3))
  return bake(g, c)
}

/** A thick rounded slab of clay from an outline: lit top one green, the rounded sides a deeper one. */
function slab(pts: XZ[], h: number, top: string, side: string) {
  const bevel = Math.min(0.025, h * 0.3)
  const g0 = new ExtrudeGeometry(shapeOf(pts), { depth: h - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelSegments: 3, curveSegments: 4 })
  g0.rotateX(-Math.PI / 2).translate(0, bevel, 0)
  const g = bake(g0, '#ffffff')
  const n = g.attributes.normal
  const col = g.attributes.color
  const a = new Color(top)
  const b = new Color(side)
  for (let i = 0; i < col.count; i++) {
    const c = n.getY(i) > 0.75 ? a : b
    col.setXYZ(i, c.r, c.g, c.b)
  }
  return g
}

/** A hot-air balloon's envelope: wedges of alternating colors. */
function envelope(r: number, colors: string[], at: [number, number, number]) {
  const n = 8
  return Array.from({ length: n }, (_, i) => bake(new SphereGeometry(r, 3, 10, (i * Math.PI * 2) / n, (Math.PI * 2) / n), colors[i % colors.length], { at, scale: [1, 1.15, 1] }))
}

// A tiny seeded random (the trees and fields land in the same spots every time).
const rnd = (i: number) => (((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1) + 1) % 1

// ------------------------------------------------------------------ the things to poke

export interface Pokes {
  /** Each thing's root (it hops), standing at its spot. */
  root: Record<PokeId, Group>
  elephant: { trunk: Group }
  gibbon: { swing: Group }
  buffalo: { head: Group }
  hornbill: { wings: Group[] }
  tuktuk: { body: Group }
  dolphins: Group[]
  boat: { hull: Group }
  palm: { fronds: Group; coconut: Group }
  clouds: Group
}

function buildPokes(bag: Bag, root: Group): Pokes {
  const roots = {} as Record<PokeId, Group>
  const make = (id: PokeId, parts: G[], px = 2) => {
    const at = POKES.find((p) => p.id === id)!.at
    const [x, z] = m(at)
    const g = new Group()
    g.position.set(x, onLand(id) ? SLAB : SEA_Y, z)
    g.scale.setScalar(TOY.poke)
    if (parts.length) g.add(solid(merge(parts), bag, px))
    root.add(g)
    roots[id] = g
    return g
  }
  const sub = (parent: Group, parts: G[], at: [number, number, number], px = 2) => {
    const g = new Group()
    g.position.set(...at)
    g.add(solid(merge(parts), bag, px))
    parent.add(g)
    return g
  }

  // ---- The elephant (in the north's forest): grey-lavender, pink ears, trunk on its own pivot ----
  const GREY = '#B9B3D6'
  const el = make('elephant', [
    P.sphere(0.07, GREY, { at: [0, 0.085, 0], scale: [1.25, 0.95, 0.95] }),
    ...[[-0.045, -0.03], [0.045, -0.03], [-0.045, 0.03], [0.045, 0.03]].map(([dx, dz]) => P.cyl(0.022, 0.024, 0.06, GREY, { at: [dx, 0.03, dz] }, 10)),
    P.sphere(0.05, GREY, { at: [0.085, 0.13, 0] }),
    ...[-1, 1].map((s) => P.cyl(0.045, 0.045, 0.012, '#FFC2DA', { at: [0.07, 0.13, s * 0.055], rot: [Math.PI / 2, 0, 0.2 * s] }, 16)),
    ...[-1, 1].map((s) => P.sphere(0.009, PAL.ink, { at: [0.125, 0.145, s * 0.022] }, 8)),
    P.capsule(0.008, 0.02, '#FFFFFF', { at: [0.124, 0.105, 0], rot: [0, 0, 1.2] }),
    P.cone(0.012, 0.03, GREY, { at: [-0.09, 0.09, 0], rot: [0, 0, 1.9] }, 8),
  ])
  el.rotation.y = -0.5
  const trunk = sub(el, [P.capsule(0.016, 0.06, GREY, { at: [0.012, -0.04, 0], rot: [0, 0, 0.25] })], [0.125, 0.12, 0])

  // ---- The rain cloud over Nan: a fat white cloud up in the air ----
  const clouds = make('clouds', [
    P.sphere(0.1, '#FFFFFF', { at: [0, CLOUD_Y, 0], scale: [1.4, 0.75, 1] }),
    P.sphere(0.075, '#FFFFFF', { at: [0.11, CLOUD_Y - 0.02, 0.02], scale: [1.2, 0.8, 1] }),
    P.sphere(0.07, '#F3F0FA', { at: [-0.11, CLOUD_Y - 0.025, -0.01], scale: [1.2, 0.8, 1] }),
    P.sphere(0.065, '#FFFFFF', { at: [0.03, CLOUD_Y + 0.05, -0.03] }),
  ])

  // ---- The gibbon, hanging from a branch of its jungle tree ----
  const gb = make('gibbon', [
    P.cyl(0.014, 0.02, 0.16, WOOD_DARK, { at: [-0.06, 0.08, 0] }, 8),
    P.sphere(0.075, '#5FB27A', { at: [-0.06, 0.2, 0], scale: [1.2, 0.8, 1] }),
    P.capsule(0.008, 0.11, WOOD_DARK, { at: [0.0, 0.2, 0], rot: [0, 0, Math.PI / 2] }),
  ])
  const swing = sub(gb, [
    P.capsule(0.006, 0.05, '#8C6A4F', { at: [0, -0.03, 0] }),
    P.sphere(0.028, '#C9A27E', { at: [0, -0.075, 0] }),
    P.sphere(0.016, '#F3E2CF', { at: [0.015, -0.07, 0.016] }),
    ...[-1, 1].map((s) => P.sphere(0.005, PAL.ink, { at: [0.022, -0.065, 0.016 + s * 0.008] }, 6)),
    P.sphere(0.022, '#C9A27E', { at: [0, -0.11, 0], scale: [1, 1.2, 1] }),
  ], [0.03, 0.2, 0], 1.5)

  // ---- The water buffalo in Isan's paddies ----
  const BUF = '#7D7891'
  const bf = make('buffalo', [
    P.sphere(0.06, BUF, { at: [0, 0.07, 0], scale: [1.4, 0.95, 1] }),
    ...[[-0.05, -0.03], [0.05, -0.03], [-0.05, 0.03], [0.05, 0.03]].map(([dx, dz]) => P.cyl(0.013, 0.013, 0.05, '#615C75', { at: [dx, 0.025, dz] }, 8)),
  ])
  bf.rotation.y = 0.6
  const head = sub(bf, [
    P.sphere(0.035, BUF, { at: [0.02, 0, 0] }),
    P.sphere(0.022, '#C9C1D9', { at: [0.045, -0.012, 0] }),
    ...[-1, 1].map((s) => P.sphere(0.006, PAL.ink, { at: [0.045, 0.012, s * 0.02] }, 6)),
    ...[-1, 1].map((s) => P.cone(0.01, 0.05, '#FFF4E6', { at: [0.0, 0.03, s * 0.04], rot: [s * 1.1, 0, 0.5] }, 6)),
  ], [0.085, 0.085, 0])

  // ---- The hornbill on a stump: black with a big yellow beak ----
  const hb = make('hornbill', [
    P.cyl(0.03, 0.035, 0.06, WOOD_DARK, { at: [0, 0.03, 0] }, 10),
    P.sphere(0.04, '#3F3550', { at: [0, 0.1, 0], scale: [1.2, 1, 0.9] }),
    P.sphere(0.026, '#3F3550', { at: [0.035, 0.14, 0] }),
    P.cone(0.016, 0.07, '#FFC94D', { at: [0.085, 0.135, 0], rot: [0, 0, -Math.PI / 2 - 0.25] }, 8),
    P.capsule(0.012, 0.025, '#FFB23D', { at: [0.05, 0.168, 0], rot: [0, 0, -1.2] }),
    ...[-1, 1].map((s) => P.sphere(0.006, '#FFFFFF', { at: [0.05, 0.148, s * 0.016] }, 6)),
    P.cone(0.025, 0.07, '#FFFFFF', { at: [-0.06, 0.09, 0], rot: [0, 0, 1.9] }, 8),
  ])
  hb.rotation.y = 0.4
  const wings = [-1, 1].map((s) => sub(hb, [P.sphere(0.03, '#2E2640', { at: [-0.01, 0, s * 0.02], scale: [1.4, 0.5, 0.6] })], [0, 0.11, s * 0.03], 1.5))

  // ---- The tuk-tuk on the central plain ----
  const tk = make('tuktuk', [])
  const body = sub(tk, [
    P.rbox(0.13, 0.06, 0.08, 0.02, '#7CC4F2', { at: [0, 0.05, 0] }),
    P.rbox(0.15, 0.012, 0.1, 0.006, '#FF8FB8', { at: [-0.01, 0.12, 0] }),
    ...[[-0.05, -0.04], [-0.05, 0.04], [0.05, -0.04], [0.05, 0.04]].map(([dx, dz]) => P.cyl(0.004, 0.004, 0.05, '#EDEAF2', { at: [dx, 0.095, dz] }, 6)),
    P.box(0.005, 0.03, 0.06, '#BFE2FA', { at: [0.066, 0.09, 0] }),
    P.cyl(0.018, 0.018, 0.012, PAL.ink, { at: [0.05, 0.018, 0], rot: [Math.PI / 2, 0, 0] }, 12),
    ...[-1, 1].map((s) => P.cyl(0.018, 0.018, 0.012, PAL.ink, { at: [-0.045, 0.018, s * 0.045], rot: [Math.PI / 2, 0, 0] }, 12)),
    P.sphere(0.008, PAL.butter, { at: [0.068, 0.06, 0] }, 8),
  ], [0, 0, 0])
  tk.rotation.y = 0.3

  // ---- Two dolphins in the Gulf: grey-lavender arcs, waiting just under the water ----
  const dl = make('dolphins', [P.cyl(0.11, 0.11, 0.003, '#B8E6F4', { at: [0, 0.001, 0] }, 24)], 0)
  const dolphins = [-1, 1].map((s) => {
    const g = new Group()
    g.position.set(s * 0.05, 0, s * 0.03)
    const body = new Group()
    body.add(solid(merge([
      P.sphere(0.03, '#9AA3CF', { scale: [1.9, 0.8, 0.75] }),
      P.cone(0.016, 0.04, '#9AA3CF', { at: [0.06, -0.004, 0], rot: [0, 0, -Math.PI / 2], scale: [1, 1, 0.4] }, 8),
      P.cone(0.014, 0.03, '#8A93C4', { at: [0, 0.028, 0], rot: [0, 0, 0.4], scale: [1, 1, 0.3] }, 6),
      P.cone(0.02, 0.025, '#8A93C4', { at: [-0.065, 0, 0], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.3] }, 6),
      P.sphere(0.005, PAL.ink, { at: [0.04, 0.008, 0.016] }, 6),
    ]), bag, 1.5))
    g.add(body)
    g.rotation.y = s > 0 ? 0.3 : Math.PI + 0.3
    body.position.y = -0.005
    dl.add(g)
    return g
  })

  // ---- The longtail boat in the Andaman ----
  const bt = make('boat', [])
  const hull = sub(bt, [
    P.rbox(0.2, 0.03, 0.05, 0.012, '#C98F5E', { at: [0, 0.02, 0] }),
    P.cone(0.025, 0.07, '#C98F5E', { at: [0.13, 0.028, 0], rot: [0, 0, -Math.PI / 2 + 0.35], scale: [1, 1, 1] }, 8),
    P.box(0.16, 0.006, 0.04, '#E8C9A0', { at: [-0.01, 0.036, 0] }),
    P.torus(0.012, 0.004, PAL.hotpink, { at: [0.15, 0.06, 0], rot: [0, Math.PI / 2, 0] }),
    P.capsule(0.006, 0.12, '#6E6880', { at: [-0.14, 0.03, 0], rot: [0, 0, 1.25] }),
    P.rbox(0.03, 0.025, 0.025, 0.008, '#E8404E', { at: [-0.1, 0.05, 0] }),
    P.rbox(0.06, 0.012, 0.06, 0.005, '#FF8FB8', { at: [0, 0.08, 0] }),
    ...[-1, 1].map((s) => P.cyl(0.003, 0.003, 0.04, WOOD_DARK, { at: [0, 0.055, s * 0.024] }, 5)),
  ], [0, 0, 0])
  bt.rotation.y = 0.5

  // ---- The coconut palm on the long tail's beach ----
  const pm = make('palm', [
    ...Array.from({ length: 5 }, (_, i) => P.cyl(0.012 - i * 0.001, 0.014 - i * 0.001, 0.05, i % 2 ? '#B07B4F' : '#C08B5C', { at: [i * i * 0.0025, 0.025 + i * 0.045, 0], rot: [0, 0, -0.08 - i * 0.05] }, 8)),
    P.sphere(0.04, '#FFE3A8', { at: [0, 0.005, 0], scale: [1.6, 0.25, 1.6] }),
  ])
  const fronds = sub(pm, [
    ...[0, 1, 2, 3, 4, 5].map((i) => {
      const a = (i / 6) * Math.PI * 2
      return P.sphere(0.06, i % 2 ? '#7FD18A' : '#6CC47D', { at: [Math.cos(a) * 0.045, -0.012, Math.sin(a) * 0.045], rot: [Math.sin(a) * 0.5, -a, -Math.cos(a) * 0.5], scale: [1, 0.15, 0.32] }, 10)
    }),
    ...[-1, 1].map((s) => P.sphere(0.013, '#8C6A4F', { at: [0.006 * s, -0.02, 0.008 * s] }, 8)),
  ], [0.04, 0.23, 0], 1.5)
  const coconut = sub(pm, [P.sphere(0.014, '#8C6A4F', {}, 10)], [0.05, 0.21, 0.012], 1.5)

  return {
    root: roots,
    elephant: { trunk },
    gibbon: { swing },
    buffalo: { head },
    hornbill: { wings },
    tuktuk: { body },
    dolphins,
    boat: { hull },
    palm: { fronds, coconut },
    clouds,
  }
}

/** The pokes that stand on Thailand (the rest float on the sea). */
const onLand = (id: PokeId) => id !== 'dolphins' && id !== 'boat'

// ------------------------------------------------------------------ the board

export function buildBoard(bag: Bag): Board {
  const root = new Group()
  const outline = curve(THAILAND.map(m), true, 5)

  // ---- The table, the paper and its border, the seas painted on it ----
  const [px0, pz0] = m([PAPER.x0, PAPER.y0])
  const [px1, pz1] = m([PAPER.x1, PAPER.y1])
  const PW = px1 - px0
  const PD = pz1 - pz0
  const cx = (px0 + px1) / 2
  const cz = (pz0 + pz1) / 2
  root.add(solid(merge([
    P.rbox(PW + 14, 0.24, PD + 12, 0.1, WOOD, { at: [cx, -0.125, cz] }),
    // A couple of planks' seams across the table.
    ...[-9, -6, -3, 3, 6, 9].map((dx) => P.box(0.014, 0.004, PD + 12, WOOD_DARK, { at: [cx + Math.sign(dx) * (PW / 2 + 0.4) + dx * 0.32, -0.004, cz] })),
  ]), bag, 2))
  root.add(solid(P.rbox(PW, 0.012, PD, 0.004, PAPER_C, { at: [cx, -0.002, cz] }), bag, 1.5))
  const inset = (d: number): XZ[] => [[px0 + d, pz0 + d], [px1 - d, pz0 + d], [px1 - d, pz1 - d], [px0 + d, pz1 - d], [px0 + d, pz0 + d]]
  const seaParts: G[] = [
    ...[ANDAMAN, GULF].map((poly) => flat(clipRect(poly, PAPER).map(m), SEA_Y, SEA)),
    // Shallow water along Thailand's own coasts (half of it tucks under the clay).
    ...[ANDAMAN_COAST, GULF_COAST].map((c) => ribbon(curve(c.map((p) => m(proj(p))), false, 5), 0.13, SEA_Y + 0.001, SHALLOW)),
    // The paper's inked double border.
    ribbon(inset(0.07), 0.016, SEA_Y + 0.001, INKLINE),
    ribbon(inset(0.11), 0.006, SEA_Y + 0.001, INKLINE),
    // The Mekong, along the border with Laos (on the paper, tucked under the clay's edge).
    ribbon(curve(MEKONG.map(m), false, 5), 0.05, SEA_Y + 0.002, RIVER),
  ]
  // A compass rose painted in the Gulf's far corner.
  const [rx, rz] = m(proj([105.6, 6.4]))
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4
    const long = i % 2 === 0
    const L = long ? 0.2 : 0.11
    const w = long ? 0.035 : 0.025
    const tip: XZ = [rx + Math.sin(a) * L, rz - Math.cos(a) * L]
    const l: XZ = [rx + Math.sin(a - Math.PI / 2) * w, rz - Math.cos(a - Math.PI / 2) * w]
    const r: XZ = [rx + Math.sin(a + Math.PI / 2) * w, rz - Math.cos(a + Math.PI / 2) * w]
    seaParts.push(flat([[rx, rz], l, tip], SEA_Y + 0.003, long ? '#B98E6A' : '#E3C9A6'), flat([[rx, rz], tip, r], SEA_Y + 0.003, long ? '#E8A0B8' : '#F2DCC0'))
  }
  seaParts.push(ribbon(curve(Array.from({ length: 12 }, (_, i): XZ => [rx + Math.cos((i / 12) * Math.PI * 2) * 0.13, rz + Math.sin((i / 12) * Math.PI * 2) * 0.13]), true, 4).concat([[rx + 0.13, rz]]), 0.008, SEA_Y + 0.002, '#B98E6A'))
  root.add(solid(merge(seaParts), bag, 0))

  // ---- Thailand: one slab of clay, and the islands ----
  root.add(solid(slab(outline, SLAB, LAND_TOP, LAND_SIDE), bag, 2.5))
  const islands: G[] = []
  for (const [i, [at, rxi, ryi]] of ISLANDS.entries()) {
    if (i >= 1 && i <= 3) continue // Phang Nga Bay's (the simple coast swallows them): rock towers off Krabi instead.
    const [x, z] = m(at)
    const ring = Array.from({ length: 14 }, (_, k): XZ => [x + Math.cos((k / 14) * Math.PI * 2) * rxi * K, z + Math.sin((k / 14) * Math.PI * 2) * ryi * K])
    islands.push(slab(ring, SLAB * 0.6, LAND_TOP, LAND_SIDE), P.sphere(Math.min(rxi, ryi) * K * 0.6, JUNGLE, { at: [x, SLAB * 0.6, z], scale: [1, 0.6, 1] }, 10))
  }
  root.add(solid(merge(islands), bag, 2))

  // ---- On the clay: the Chao Phraya, the fields, the mountains, the trees ----
  const chao = curve(CHAO_PHRAYA.map(m), false, 6)
  const decal: G[] = [ribbon(chao, 0.04, SLAB + 0.003, RIVER), ribbon(chao, 0.016, SLAB + 0.004, '#B9E2F8')]
  const keepClear: [number, number, number][] = [
    ...PINS.map((p): [number, number, number] => [...m(p.at), 0.26]),
    ...POKES.map((p): [number, number, number] => [...m(p.at), 0.13]),
  ]
  const clear = (x: number, z: number, pad = 0) => keepClear.every(([kx, kz, r]) => Math.hypot(kx - x, kz - z) > r + pad)
  const nearRiver = (x: number, z: number, d: number) => chao.some(([a, b]) => Math.hypot(a - x, b - z) < d)
  const fieldColors = ['#C5EBA4', '#E9E59A', '#B6E39A', '#D7F0B5', '#F1E7A8']
  // A patchwork of rice fields: Isan's plateau and the central plain.
  const fields = (lon0: number, lon1: number, lat0: number, lat1: number, step: number, seed: number) => {
    for (let lon = lon0, i = seed; lon <= lon1; lon += step)
      for (let lat = lat0; lat <= lat1; lat += step * 0.8, i++) {
        const [x, z] = m(proj([lon + (rnd(i) - 0.5) * 0.08, lat + (rnd(i + 7) - 0.5) * 0.06]))
        if (!inside(outline, x, z) || !clear(x, z, -0.04) || nearRiver(x, z, 0.05) || !inside(outline, x + 0.07, z) || !inside(outline, x - 0.07, z)) continue
        decal.push(P.box(step * 100 * K * 0.82, 0.006, step * 80 * K * 0.78, fieldColors[i % fieldColors.length], { at: [x, SLAB + 0.002, z], rot: [0, (rnd(i + 3) - 0.5) * 0.3, 0] }))
      }
  }
  fields(101.9, 105.0, 14.6, 17.7, 0.33, 0)
  fields(99.6, 101.0, 14.0, 16.4, 0.3, 100)
  root.add(solid(merge(decal), bag, 0))

  const hills: G[] = []
  const greens = ['#8FD08A', '#7FC689', '#6FBA82', '#9AD794']
  for (const [i, [at, r]] of HILLS.entries()) {
    const [x, z] = m(at)
    const R = r * K * 1.25
    const north = at[1] < 400
    const H = R * (north ? 1.7 : 1.05) * (0.85 + rnd(i) * 0.3)
    hills.push(P.sphere(R, greens[i % greens.length], { at: [x, SLAB - R * 0.15, z], scale: [1, H / R, 0.9] }, 14))
    // A smaller bump on its shoulder.
    hills.push(P.sphere(R * 0.62, greens[(i + 1) % greens.length], { at: [x + R * 0.75, SLAB - R * 0.1, z + R * 0.25], scale: [1, 0.85, 0.9] }, 12))
  }
  // A few pointed peaks among the north's round hills.
  for (const [i, [lon, lat, h]] of ([[98.35, 19.85, 0.3], [99.2, 19.05, 0.36], [99.95, 19.75, 0.28], [98.7, 17.35, 0.26]] as const).entries()) {
    const [x, z] = m(proj([lon, lat]))
    hills.push(P.cone(h * 0.55, h, '#79BE84', { at: [x, SLAB + h / 2 - 0.02, z] }, 9), P.cone(h * 0.2, h * 0.36, '#B5E0A2', { at: [x, SLAB + h - 0.02 - h * 0.18 + 0.004, z] }, 9))
    if (i < 3) hills.push(P.cone(h * 0.4, h * 0.7, '#6AB37C', { at: [x + h * 0.4, SLAB + h * 0.35 - 0.02, z + h * 0.15] }, 8))
  }
  root.add(solid(merge(hills), bag, 2))
  // Mist sitting on a few of the north's peaks.
  const mist: G[] = []
  for (const [i, at] of [[98.6, 19.2], [99.5, 18.0], [100.2, 19.0]].entries()) {
    const [x, z] = m(proj(at as [number, number]))
    mist.push(P.sphere(0.06, '#FFFFFF', { at: [x - 0.05, SLAB + 0.16 + i * 0.01, z + 0.06], scale: [1.6, 0.55, 1] }, 12), P.sphere(0.045, '#F6F3FB', { at: [x + 0.04, SLAB + 0.15, z + 0.08], scale: [1.5, 0.6, 1] }, 10))
  }
  root.add(solid(merge(mist), bag, 1.5))

  const trees: G[] = []
  const onHill = (x: number, z: number) => HILLS.some(([at, r]) => Math.hypot(m(at)[0] - x, m(at)[1] - z) < r * K * 1.1)
  for (let i = 0, n = 0; i < 2400 && n < 150; i++) {
    const [x, z] = m([140 + rnd(i * 3) * 820, 50 + rnd(i * 3 + 1) * 1480])
    if (!inside(outline, x, z) || !clear(x, z, -0.02) || nearRiver(x, z, 0.05) || onHill(x, z)) continue
    // The edge of the clay: stay a little in.
    if (![[0.05, 0], [-0.05, 0], [0, 0.05], [0, -0.05]].every(([dx, dz]) => inside(outline, x + dx, z + dz))) continue
    // Fewer trees in the fields.
    const [lon, lat] = [x / K / 100 + STAGE.w / 200 + 96, 21 - (z / K + STAGE.h / 2) / 100]
    if (((lon > 101.9 && lat > 14.6 && lat < 17.7) || (lon > 99.6 && lon < 101 && lat > 14 && lat < 16.4)) && rnd(i + 9) < 0.75) continue
    n++
    const s = 0.8 + rnd(i + 5) * 0.5
    if (i % 3 === 0) trees.push(P.cyl(0.008, 0.008, 0.03, WOOD_DARK, { at: [x, SLAB + 0.015, z] }, 6), P.cone(0.035 * s, 0.09 * s, i % 2 ? '#4FA36E' : '#5DB27A', { at: [x, SLAB + 0.025 + 0.045 * s, z] }, 7))
    else trees.push(P.cyl(0.008, 0.008, 0.03, WOOD_DARK, { at: [x, SLAB + 0.015, z] }, 6), P.sphere(0.036 * s, i % 2 ? '#74C08A' : '#88CC8E', { at: [x, SLAB + 0.04 + 0.022 * s, z] }, 8))
  }
  root.add(solid(merge(trees), bag, 1.5))

  // ---- The three places, each a toy under its pin ----
  const places = {} as Record<PinId, Group>
  const pinTop = {} as Record<PinId, [number, number, number]>
  const poles: G[] = []
  const place = (id: PinId, parts: G[], base = SLAB) => {
    const pin = PINS.find((p) => p.id === id)!
    const [x, z] = m(pin.at)
    const g = new Group()
    g.position.set(x, base, z)
    g.userData.pick = `place:${id}`
    g.scale.setScalar(TOY.place)
    g.add(solid(merge(parts), bag, 2))
    root.add(g)
    places[id] = g
    const top = 0.6
    pinTop[id] = [x, base + top, z]
    poles.push(P.cyl(0.007, 0.007, top, '#FFFFFF', { at: [x, base + top / 2, z] }, 8), P.sphere(0.018, PAL.hotpink, { at: [x, base + 0.012, z] }, 10))
  }
  // Bangkok: rows of pastel shophouses by the river and ICONSIAM's two glass towers on the far bank.
  const shop = (dx: number, dz: number, w: number, h: number, wall: string, roof: string): G[] => [
    P.box(w, h, 0.05, wall, { at: [dx, h / 2, dz] }),
    P.box(w + 0.006, 0.01, 0.056, roof, { at: [dx, h + 0.005, dz] }),
    ...[-0.3, 0.3].map((k) => P.box(w * 0.22, h * 0.28, 0.004, '#9FD6F5', { at: [dx + k * w, h * 0.62, dz + 0.026] })),
    P.box(w * 0.5, h * 0.3, 0.004, '#B5865E', { at: [dx, h * 0.15, dz + 0.026] }),
  ]
  place('bangkok', [
    ...shop(-0.12, 0.02, 0.05, 0.07, '#FFD9E6', '#E86A8E'),
    ...shop(-0.07, 0.02, 0.05, 0.08, '#FFF4CF', '#F2B04B'),
    ...shop(-0.02, 0.02, 0.05, 0.07, '#E4F4E8', '#5FBF8F'),
    ...shop(-0.12, 0.1, 0.05, 0.06, '#E7E0FF', '#A08FE0'),
    ...shop(-0.07, 0.1, 0.05, 0.075, '#FFE9D9', '#FF8A4D'),
    P.rbox(0.06, 0.26, 0.06, 0.012, '#BFE2FA', { at: [0.1, 0.13, -0.04] }),
    P.rbox(0.05, 0.2, 0.05, 0.012, '#D6EEFF', { at: [0.17, 0.1, 0.0] }),
    P.cone(0.04, 0.05, PAL.gold, { at: [0.1, 0.285, -0.04] }, 4),
    P.cone(0.034, 0.04, PAL.gold, { at: [0.17, 0.22, 0.0] }, 4),
    ...[0.06, 0.12, 0.18].map((h) => P.box(0.062, 0.004, 0.062, '#FFFFFF', { at: [0.1, h, -0.04] })),
    P.rbox(0.2, 0.012, 0.09, 0.005, '#E8E2EE', { at: [0.13, 0.006, -0.02] }),
  ])
  // Nan: rice terraces stepping up a hillside, a little wooden hut on top, a pink mushroom beside it.
  const terraces: G[] = []
  for (let k = 0; k < 5; k++) {
    const r = 0.15 - k * 0.025
    terraces.push(
      P.cyl(r, r + 0.008, 0.03, k % 2 ? '#8FD67C' : '#A2E08A', { at: [0, 0.015 + k * 0.03, -k * 0.012], scale: [1.15, 1, 0.85] }, 22),
      P.cyl(r - 0.014, r - 0.014, 0.004, k === 2 ? '#F3E3A0' : '#C3E9F7', { at: [0, 0.031 + k * 0.03, -k * 0.012], scale: [1.15, 1, 0.85] }, 22),
    )
  }
  place('nan', [
    ...terraces,
    P.box(0.07, 0.045, 0.05, '#E2C29A', { at: [0, 0.18, -0.06] }),
    P.prism([[-0.048, 0], [0.048, 0], [0, 0.04]], 0.065, WOOD_DARK, { at: [0, 0.2, -0.06] }),
    P.cyl(0.012, 0.016, 0.04, '#FFF1E2', { at: [0.17, 0.02, 0.04] }, 8),
    P.sphere(0.045, PAL.hotpink, { at: [0.17, 0.045, 0.04], scale: [1, 0.55, 1] }, 14),
    ...[[-0.02, 0.015], [0.018, 0.02], [0.004, -0.018]].map(([dx, dz]) => P.sphere(0.008, '#FFFFFF', { at: [0.17 + dx, 0.066, 0.04 + dz], scale: [1, 0.5, 1] }, 6)),
  ])
  // Krabi: Phang Nga Bay's limestone towers standing in the sea, jungle on their tops, a beach with a parked longtail.
  const [kx, kz] = m(PINS.find((p) => p.id === 'krabi')!.at)
  const karst: G[] = []
  // (The map's simple coast has no bay, so they stand just off it, out in the Andaman: [lon, lat, radius, height].)
  const towers = ([[98.05, 8.15, 0.028, 0.15], [97.9, 8.4, 0.022, 0.12], [98.12, 7.78, 0.024, 0.13], [97.82, 7.98, 0.018, 0.1], [98.2, 8.55, 0.02, 0.11]] as const).map(
    ([lon, lat, r, h]): [number, number, number, number] => [...m(proj([lon, lat])), r, h],
  )
  for (const [i, [x, z, r, h]] of towers.entries()) {
    // Relative to the place's group (it stands on the clay, scaled up like a toy): the towers stand in the sea, down at
    // the paper.
    const dx = (x - kx) / TOY.place
    const dz = (z - kz) / TOY.place
    const y0 = (SEA_Y - SLAB) / TOY.place
    karst.push(
      P.cyl(r * 0.75, r, h, i % 2 ? ROCK : '#E6E0F0', { at: [dx, y0 + h / 2, dz] }, 10),
      P.sphere(r * 0.8, JUNGLE, { at: [dx, y0 + h, dz], scale: [1, 0.7, 1] }, 10),
      P.sphere(r * 0.5, '#5FB27A', { at: [dx + r * 0.3, y0 + h + r * 0.2, dz - r * 0.2] }, 8),
      P.cyl(r * 1.1, r * 1.1, 0.003, '#E3F6FA', { at: [dx, y0 + 0.002, dz] }, 14),
    )
  }
  place('krabi', [
    ...karst,
    P.sphere(0.07, '#FFE3A8', { at: [-0.05, 0.0, 0.05], scale: [1.6, 0.12, 1] }, 14),
    P.rbox(0.09, 0.015, 0.025, 0.007, '#C98F5E', { at: [-0.09, (SEA_Y - SLAB) / TOY.place + 0.01, 0.06], rot: [0, 0.6, 0] }),
    P.torus(0.006, 0.002, PAL.hotpink, { at: [-0.055, (SEA_Y - SLAB) / TOY.place + 0.026, 0.035], rot: [0, 0.6 + Math.PI / 2, 0] }),
  ])
  root.add(solid(merge(poles), bag, 1.5))

  // ---- Hot-air balloons over the north (Sparkle's kind of ride) ----
  const balloonColors = [[PAL.pink, '#FFFFFF'], [PAL.lavenderDark, PAL.butter], [PAL.mint, '#FFFFFF']]
  const balloons = ([[98.2, 18.9, 0.62], [99.7, 20.2, 0.74], [102.6, 18.9, 0.56]] as const).map(([lon, lat, h], i) => {
    const [x, z] = m(proj([lon, lat]))
    const g = new Group()
    g.position.set(x, h, z)
    g.userData.pick = `balloon:${i}`
    g.scale.setScalar(TOY.balloon)
    const r = 0.075
    g.add(solid(merge([
      ...envelope(r, balloonColors[i], [0, 0, 0]),
      P.cone(r * 0.42, r * 0.5, balloonColors[i][0], { at: [0, -r * 1.1, 0], rot: [Math.PI, 0, 0] }, 10),
      ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => P.cyl(0.002, 0.002, r * 0.6, '#8C6A4F', { at: [a * r * 0.22, -r * 1.55, b * r * 0.22] }, 4)),
      P.rbox(r * 0.5, r * 0.35, r * 0.5, 0.008, '#C98F5E', { at: [0, -r * 1.95, 0] }),
    ]), bag, 2))
    root.add(g)
    return g
  })

  const pokes = buildPokes(bag, root)
  return { root, places, pinTop, pokes, balloons }
}
