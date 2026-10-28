// Iceberg Maker's ice and the orca in the toon look: the ice cliff at each pole (faceted columns, crevasses, a snowy
// cap), the giant berg that breaks off it, the little bits, the scars they leave, and the orca under the water. The
// world (iceberg.ts) moves them; this file only owns the shapes and where things sit on them.
//
//   north (Greenland): a tall glacier front with a jagged top, mountains behind; its giant berg is pointy.
//   south (Antarctica): a flat ice shelf, a white table to the horizon; its giant berg is a flat-topped table.
//
// Every berg is built round its waterline: at rest y = 0 is the sea's surface, the white tip above it and the much
// bigger blue keel below (the water hides it until the camera dips under).
import { BufferGeometry, Float32BufferAttribute, Group, Shape, ShapeGeometry, Vector2 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import type { Pole } from './sections'

export const ICE = '#EEF5FC'
const ICE_SHADE = '#D4E5F6'
/** The keel: old ice packed tight, so it's blue. */
const KEEL = '#9CCBF2'
const KEEL_TOP = '#C9E3FA'
const SNOW = '#FFFFFF'
const ROCK = '#9AA3B8'
/** The deep blue in the cracks between the columns, and the layers of old snow in the south's shelf. */
const CREVASSE = '#6FA9E4'
const BAND = '#DCEBFA'

export interface Giant {
  /** Half its width across the cliff, and half its depth. */
  hw: number
  hd: number
  /** How high its tip stands out of the water (m), and how deep its keel goes (negative). */
  tip: number
  keel: number
  /** Its footprint on the water (m), for bumping and her finger. */
  r: number
  /** Where riders stand on it (local, above the waterline). */
  deck: [number, number, number][]
}

export interface PoleShape {
  pole: Pole
  /** The cliff's top (m above the sea). */
  h: number
  giant: Giant
  /** Where loose chunks can sit on the face: [x, height of their middle]. */
  slots: [number, number][]
  /** Where the friends stand on the cliff top (x, z). */
  friends: [number, number][]
}

export const SHAPES: Record<Pole, PoleShape> = {
  north: {
    pole: 'north',
    h: 8,
    giant: { hw: 3.2, hd: 2.3, tip: 5.2, keel: -13.6, r: 3.7, deck: [[0.8, 1.2, 1.6]] },
    slots: [-4.7, -6.4, -8.1, 4.7, 6.4, 8.1].flatMap((x) => [1.6, 3.7, 5.8].map((y): [number, number] => [x, y])),
    friends: [[-5.6, -1.1]],
  },
  south: {
    pole: 'south',
    h: 4.5,
    giant: {
      hw: 4.5,
      hd: 3,
      tip: 1.55,
      keel: -12,
      r: 5,
      deck: [
        [-1.6, 1.67, 1.2],
        [0.2, 1.67, 1.8],
        [1.9, 1.67, 0.9],
      ],
    },
    slots: [-5.9, -7.8, 5.9, 7.8].flatMap((x) => [1.3, 3].map((y): [number, number] => [x, y])),
    friends: [
      [-4.6, -1.3],
      [-3.7, -1.6],
      [-2.8, -1.2],
      [-6.2, -2],
      [3.4, -1.8],
    ],
  },
}

/** Seeded, so the cliff looks the same every time. */
export function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed)) * 7919 + 13) % 233280
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

/** Flat facets: each face lit on its own (a toon band per facet), so the ice reads as cut and chunky, not soft. */
function facets(g: BufferGeometry) {
  g.computeVertexNormals()
  return g
}

/** Pushes every corner of a part a little, the same way wherever the same corner appears (so the faces stay closed):
 *  a plain prism or cone becomes a lump of ice. `amt` is in meters per axis. */
function rough(g: BufferGeometry, rand: () => number, amt: [number, number, number]) {
  const pos = g.attributes.position
  const moved = new Map<string, [number, number, number]>()
  for (let i = 0; i < pos.count; i++) {
    const k = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`
    let d = moved.get(k)
    if (!d) moved.set(k, (d = [(rand() - 0.5) * 2 * amt[0], (rand() - 0.5) * 2 * amt[1], (rand() - 0.5) * 2 * amt[2]]))
    pos.setXYZ(i, pos.getX(i) + d[0], pos.getY(i) + d[1], pos.getZ(i) + d[2])
  }
  return facets(g)
}

/** A faceted column of ice (a 5- or 6-sided prism) from deep under the sea up to `top`, its front at `front` (z), with
 *  a ragged collar of old blue ice round its foot at the waterline. */
function column(x: number, w: number, top: number, front: number, c: string, rand: () => number): [BufferGeometry, BufferGeometry] {
  const d = 3 + rand() * 2
  const seg = rand() < 0.5 ? 5 : 6
  const rot: [number, number, number] = [0, (rand() - 0.5) * 0.5, 0]
  const at = (y: number): [number, number, number] => [x, y, front - d / 2]
  const body = rough(P.cyl(0.5, 0.5, top + 16, c, { at: at((top - 16) / 2), scale: [w * 1.08, 1, d], rot }, seg), rand, [w * 0.08, 0, 0.12])
  const band = 0.7 + rand() * 1.1
  const foot = rough(P.cyl(0.5, 0.5, band, KEEL_TOP, { at: at(band / 2 - 0.1), scale: [w * 1.12, 1, d + 0.06], rot }, seg), rand, [0.02, 0.18, 0.02])
  return [body, foot]
}

/**
 * The cliff: a row of faceted columns of ice, old blue ice at their feet and a rounded snowy cap whose drifts hang over
 * the top edge. Its front (z = 0) is the furthest anything comes forward, so the cracks drawn on the face stay in front.
 * North: Greenland's glacier, narrow columns of different heights and depths (seracs) with deep blue crevasses between
 * them, streaks down their faces and spikes of ice behind the edge. South: an ice shelf, wide columns standing flush
 * with only a few crevasses, a flat white top, and layers of old snow running right across its face. Then the land of
 * ice behind.
 */
export function buildCliff(s: PoleShape, bag: Bag) {
  const rand = rng(s.pole === 'north' ? 3 : 5)
  const north = s.pole === 'north'
  const parts: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  let x = -34
  while (x < 34) {
    const w = north ? 0.9 + rand() * 1.5 : 2.4 + rand() * 2.6
    const mid = x + w / 2
    // (Even where the friends stand, and over the giant: its crack runs across the face there.)
    const flat = s.friends.some(([fx]) => Math.abs(mid - fx) < 1.4) || Math.abs(mid) < s.giant.hw + 1
    const top = north ? s.h + (flat ? 0 : (rand() - 0.3) * 2.2) : s.h
    // (The column's corners stick out a little past its middle, so its middle sits back a little more.)
    const front = north ? -0.12 - rand() * (flat ? 0.12 : 0.5) : -0.14 - rand() * 0.06
    const c = rand() < 0.35 ? ICE_SHADE : ICE
    const [body, foot] = column(mid, w, top, front, c, rand)
    parts.push(body)
    plain.push(foot)
    // The crevasse in the gap to the next column: deep blue, set back (most gaps up north, a few in the shelf).
    if (north || rand() < 0.35) plain.push(P.box(north ? 0.5 : 0.3, top + 15.5, 0.2, CREVASSE, { at: [x + w, (top - 16) / 2, -1.2] }))
    // A streak down the face now and then.
    if (rand() < (north ? 0.55 : 0.3)) {
      const sh = top * (0.3 + rand() * 0.4)
      plain.push(P.box(0.08 + rand() * 0.05, sh, 0.04, rand() < 0.5 ? '#C8DEF4' : SNOW, { at: [mid + (rand() - 0.5) * w * 0.5, top - sh / 2 - 0.5 - rand() * 0.8, front + 0.03] }))
    }
    // The snowy cap: a rounded drift on top that hangs a little over the edge.
    parts.push(facets(P.sphere(0.5, SNOW, { at: [mid, top + 0.05, front - 0.95], scale: [w * (1.1 + rand() * 0.3), 0.45 + rand() * 0.4, 2.2] }, 7)))
    // Up north, spikes of ice (seracs) behind the edge.
    if (north && !flat && rand() < 0.55) {
      const cone = P.cone(0.6 + rand() * 0.5, 1 + rand() * 1.8, rand() < 0.5 ? ICE : ICE_SHADE, { at: [mid + (rand() - 0.5) * w * 0.4, top + 0.6, -1.4 - rand() * 2], rot: [(rand() - 0.5) * 0.3, rand(), (rand() - 0.5) * 0.3] }, 5)
      parts.push(rough(cone, rand, [0.12, 0.15, 0.12]))
    }
    x += w
  }
  if (!north) {
    // The layers of old snow, right across the shelf's face, a little wavy.
    for (const by of [1.7, 2.6, 3.5]) {
      for (let bx = -34; bx < 34; bx += 4) plain.push(P.box(4.02, 0.1, 0.04, BAND, { at: [bx + 2, by + Math.sin(bx * 0.4 + by) * 0.08, 0.005], rot: [0, 0, Math.sin(bx + by) * 0.02] }))
    }
    // A snowy lip along the shelf's top, drooping over the edge in places.
    parts.push(P.rbox(68, 0.3, 0.5, 0.1, SNOW, { at: [0, s.h + 0.05, -0.35] }))
    for (let i = 0; i < 14; i++) parts.push(facets(P.sphere(0.5, SNOW, { at: [-30 + i * 4.6 + rand() * 2, s.h - 0.05, -0.3], scale: [1.2 + rand(), 0.4, 0.5] }, 6)))
  }
  const cliff = new Group()
  cliff.add(solid(merge(parts), bag, 2.5))
  cliff.add(solid(merge(plain), bag, 0))

  // Behind the face: Greenland's glacier rising to the mountains, or Antarctica's flat shelf to the horizon.
  const back: BufferGeometry[] = []
  if (north) {
    back.push(P.prism([[6.9, s.h - 0.2], [90, s.h + 16], [90, -16], [6.9, -16]], 70, ICE, { rot: [0, Math.PI / 2, 0] }))
    const r2 = rng(11)
    for (let i = 0; i < 9; i++) {
      const x = -60 + i * 15 + (r2() - 0.5) * 8
      const hh = 18 + r2() * 16
      back.push(P.cone(12 + r2() * 6, hh, i % 2 ? ROCK : '#B6BFD2', { at: [x, s.h + 12 + hh / 2, -100 - r2() * 20] }, 6))
      back.push(P.cone(5 + r2() * 2, hh * 0.38, SNOW, { at: [x, s.h + 12 + hh * 0.81, -100 - r2() * 2] }, 6))
    }
  } else {
    back.push(P.box(70, 1, 160, SNOW, { at: [0, s.h - 0.45, -87] }))
  }
  cliff.add(solid(merge(back), bag, 0))
  return cliff
}

/** The giant berg, round its waterline (see the file's top): faceted ice above, the big blue keel below. North: a
 *  jagged, pointy berg. South: a tabletop with flat white snow on top and layers in its sides. */
export function giantGeo(s: PoleShape): BufferGeometry {
  const g = s.giant
  const rand = rng(s.pole === 'north' ? 41 : 43)
  if (s.pole === 'north') {
    return merge([
      rough(P.cyl(0.5, 0.56, 1.4, ICE, { at: [0, 0.5, 0], scale: [g.hw * 2, 1, g.hd * 2] }, 7), rand, [0.15, 0.06, 0.15]),
      rough(P.cone(2, 4, ICE, { at: [-0.6, 3.2, -0.6], rot: [0.05, 0.3, -0.08] }, 5), rand, [0.2, 0.2, 0.2]),
      rough(P.cone(1.5, 3, ICE_SHADE, { at: [1.7, 2.7, -0.2], rot: [-0.06, 0.8, 0.12] }, 5), rand, [0.15, 0.15, 0.15]),
      rough(P.cone(1.3, 2.4, ICE, { at: [-2.3, 2.4, -1], rot: [0.1, 0.2, 0.15] }, 5), rand, [0.15, 0.15, 0.15]),
      rough(P.cyl(0.56, 0.5, 3.4, KEEL_TOP, { at: [0, -1.7, 0], scale: [g.hw * 2, 1, g.hd * 2] }, 7), rand, [0.15, 0.08, 0.15]),
      rough(P.sphere(4.6, KEEL, { at: [0, -7.1, 0], scale: [1.2, 1.15, 0.95] }, 8), rand, [0.35, 0.35, 0.35]),
      rough(P.sphere(3.2, KEEL, { at: [1.8, -10.4, 0.6] }, 7), rand, [0.3, 0.3, 0.3]),
      rough(P.sphere(2.8, KEEL, { at: [-2.6, -9, -0.4] }, 7), rand, [0.3, 0.3, 0.3]),
    ])
  }
  const slab = (h: number, y: number, c: string, grow = 0) => rough(P.cyl(0.5, 0.5, h, c, { at: [0, y, 0], scale: [g.hw * 2 + grow, 1, g.hd * 2 + grow], rot: [0, Math.PI / 8, 0] }, 8), rand, [0.12, 0.02, 0.12])
  return merge([
    slab(0.5, 0.3, ICE),
    slab(0.12, 0.6, BAND, 0.05),
    slab(0.6, 0.95, ICE),
    // The flat white top: the shelf's snow.
    facets(P.cyl(0.5, 0.5, 0.25, SNOW, { at: [0, 1.4, 0], scale: [g.hw * 2 + 0.12, 1, g.hd * 2 + 0.12], rot: [0, Math.PI / 8, 0] }, 8)),
    slab(3, -1.5, KEEL_TOP),
    rough(P.cyl(0.5, 0.42, 9, KEEL, { at: [0, -7.5, 0], scale: [g.hw * 2 + 0.4, 1, g.hd * 2 + 0.4], rot: [0, Math.PI / 8, 0] }, 8), rand, [0.4, 0.3, 0.4]),
  ])
}

/** A little chunk of the face (about `size` m), centered on its middle: a lump of faceted ice with old blue ice at its
 *  bottom. Pointy up north, with a cap of snow down south. */
export function bitGeo(pole: Pole, size: number, rand: () => number): BufferGeometry {
  const w = size * (0.9 + rand() * 0.25)
  const h = size * (0.9 + rand() * 0.2)
  const d = size * (0.8 + rand() * 0.2)
  const j: [number, number, number] = [w * 0.09, h * 0.09, d * 0.09]
  const parts = [
    rough(P.cyl(0.5, 0.55, h * 0.72, ICE, { at: [0, h * 0.14, 0], scale: [w, 1, d], rot: [0, rand(), 0] }, 6), rand, j),
    rough(P.cyl(0.55, 0.45, h * 0.3, KEEL_TOP, { at: [0, -h * 0.35, 0], scale: [w, 1, d], rot: [0, rand(), 0] }, 6), rand, j),
  ]
  if (pole === 'north' && rand() < 0.7) parts.push(rough(P.cone(w * 0.34, h * 0.55, ICE, { at: [(rand() - 0.5) * w * 0.4, h * 0.72, 0], rot: [0, rand(), (rand() - 0.5) * 0.3] }, 5), rand, j))
  else parts.push(facets(P.cyl(0.5, 0.5, h * 0.12, SNOW, { at: [0, h * 0.55, 0], scale: [w * 0.92, 1, d * 0.92] }, 6)))
  return merge(parts)
}

/** A flat little growler for the seal to sunbathe on. */
export function growlerGeo(): BufferGeometry {
  const rand = rng(29)
  return merge([
    rough(P.cyl(0.5, 0.55, 1.2, ICE, { at: [0, -0.3, 0], scale: [2.6, 1, 2] }, 7), rand, [0.12, 0.06, 0.12]),
    rough(P.cyl(0.55, 0.45, 0.9, KEEL, { at: [0, -1.1, 0], scale: [2.4, 1, 1.8] }, 7), rand, [0.1, 0.05, 0.1]),
  ])
}

/** The hollow left in the face where ice broke off: a ragged blue patch with deeper facets inside, on a 1 x 1 square
 *  (scaled to the chunk). The giant's is an arch from the water up, its top as ragged as the long crack; a bit's is a
 *  rough round. Returns the rim and the facets as two flat shapes (z = 0, facing +z). */
export function scarGeo(giant: boolean, rand: () => number): [BufferGeometry, BufferGeometry] {
  const pts: [number, number][] = []
  if (giant) {
    pts.push([-0.5, -0.5])
    for (let i = 1; i < 4; i++) pts.push([-0.5 + (rand() - 0.5) * 0.06, -0.5 + i * 0.25])
    for (let i = 0; i <= 8; i++) pts.push([-0.5 + i / 8, 0.42 + (i % 2 ? 0.08 : -0.02) + (rand() - 0.5) * 0.06])
    for (let i = 3; i >= 1; i--) pts.push([0.5 + (rand() - 0.5) * 0.06, -0.5 + i * 0.25])
    pts.push([0.5, -0.5])
  } else {
    const n = 11
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const r = 0.5 * (0.82 + rand() * 0.3)
      pts.push([Math.cos(a) * r, Math.sin(a) * r])
    }
  }
  const rim = new ShapeGeometry(new Shape(pts.map(([x, y]) => new Vector2(x, y))))
  // The facets inside: a triangle from a point near the middle to every other edge of the rim, pulled in a little.
  const cx = (rand() - 0.5) * 0.15
  const cy = giant ? -0.05 : (rand() - 0.5) * 0.15
  const tri: number[] = []
  for (let i = 0; i < pts.length; i += 2) {
    const [ax, ay] = pts[i]
    const [bx, by] = pts[(i + 1) % pts.length]
    const k = 0.72 + rand() * 0.12
    const a: [number, number] = [cx + (ax - cx) * k, cy + (ay - cy) * k]
    const b: [number, number] = [cx + (bx - cx) * k, cy + (by - cy) * k]
    // (Wound to face +z.)
    const ccw = (a[0] - cx) * (b[1] - cy) - (a[1] - cy) * (b[0] - cx) > 0
    tri.push(cx, cy, 0.004, ...(ccw ? a : b), 0.004, ...(ccw ? b : a), 0.004)
  }
  const inner = new BufferGeometry()
  inner.setAttribute('position', new Float32BufferAttribute(tri, 3))
  return [rim, inner]
}

/** The orca: black and white, a tall fin, flukes. Faces +z. */
export function buildOrca(bag: Bag) {
  const BLACK = '#2E2E3E'
  const g = new Group()
  g.add(
    solidMix(
      [
        P.capsule(0.75, 2.6, BLACK, { rot: [Math.PI / 2, 0, 0] }),
        P.cone(0.32, 1.4, BLACK, { at: [0, 1.25, -0.3], rot: [-0.3, 0, 0], scale: [0.35, 1, 1] }),
        P.rbox(1.9, 0.14, 0.6, 0.06, BLACK, { at: [0, 0, -2.3] }),
        P.capsule(0.15, 0.6, BLACK, { at: [0.75, -0.4, 0.7], rot: [0.4, 0, 1.1] }),
        P.capsule(0.15, 0.6, BLACK, { at: [-0.75, -0.4, 0.7], rot: [0.4, 0, -1.1] }),
      ],
      [
        P.sphere(0.62, SNOW, { at: [0, -0.42, 0.6], scale: [0.85, 0.45, 1.9] }),
        P.sphere(0.24, SNOW, { at: [0.5, 0.25, 1.2], scale: [0.4, 0.6, 1.2] }),
        P.sphere(0.24, SNOW, { at: [-0.5, 0.25, 1.2], scale: [0.4, 0.6, 1.2] }),
        P.sphere(0.06, PAL.ink, { at: [0.62, 0.05, 1.55] }),
        P.sphere(0.06, PAL.ink, { at: [-0.62, 0.05, 1.55] }),
      ],
      bag,
      2.5,
    ),
  )
  return g
}
