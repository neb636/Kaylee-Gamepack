// The toys that stand on the Thailand map: the still scenery (mountains, forests, palms, Krabi's limestone towers) and
// the little models of each place, and the things that move and answer her finger (elephants, a buffalo, a gibbon, a
// hornbill, a tuk-tuk, dolphins, boats, a turtle, clouds, Sparkle's balloon). Chunky and round, with big eyes, in the
// app's pastel colors. One unit is one degree of the map, so everything is far bigger than life, like toys on a board.
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, type V3 } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { Field } from './field'
import { puffCloud } from '../../../trip/sky'
import { KARSTS, PINS, POKES, SWELLS, toX, toZ } from './geo'

const INK = '#2B2330'
const TRUNK = '#B98A66'
const LEAF = ['#7ACD8E', '#68C083', '#8BD79A']
const ROCK = '#CFC8E4'
const ROCK_DARK = '#B9B0D6'

/** A little seeded random, so the trees stand in the same places every time. */
export function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const eye = (x: number, y: number, z: number, r = 0.028): BufferGeometry[] => [P.sphere(r, INK, { at: [x, y, z] }, 10), P.sphere(r * 0.38, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.35, z + r * 0.75] }, 6)]
const cheek = (x: number, y: number, z: number, r = 0.03) => P.sphere(r, '#FF9EC4', { at: [x, y, z], scale: [1, 0.7, 0.4] }, 8)

// ------------------------------------------------------------------------------------------------ still scenery

/** A round leafy tree. */
export function treeParts(x: number, y: number, z: number, s: number, k: number): BufferGeometry[] {
  return [
    P.cyl(0.025 * s, 0.035 * s, 0.14 * s, TRUNK, { at: [x, y + 0.07 * s, z] }, 6),
    P.sphere(0.11 * s, LEAF[k % 3], { at: [x, y + 0.2 * s, z], scale: [1, 0.92, 1] }, 9),
    P.sphere(0.07 * s, LEAF[(k + 1) % 3], { at: [x + 0.05 * s, y + 0.3 * s, z + 0.01 * s] }, 8),
  ]
}

/** A coconut palm: a leaning trunk, a star of fronds, coconuts. */
export function palmParts(x: number, y: number, z: number, s: number, turn: number, nuts = true): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const lean = 0.22
  const cx = Math.cos(turn)
  const sz = Math.sin(turn)
  for (let i = 0; i < 4; i++) {
    const t = (i + 0.5) / 4
    const off = lean * t * t * s
    parts.push(P.cyl(0.026 * s, 0.034 * s, 0.13 * s, i % 2 ? '#C99B74' : TRUNK, { at: [x + cx * off, y + (0.06 + i * 0.12) * s, z + sz * off], rot: [sz * lean * t * 1.4, 0, -cx * lean * t * 1.4] }, 6))
  }
  const tx = x + cx * lean * s
  const ty = y + 0.5 * s
  const tz = z + sz * lean * s
  for (let i = 0; i < 6; i++) {
    const a = turn + (i / 6) * Math.PI * 2
    parts.push(P.sphere(0.1 * s, i % 2 ? '#6FC98A' : '#86D79A', { at: [tx + Math.cos(a) * 0.11 * s, ty - 0.015 * s, tz + Math.sin(a) * 0.11 * s], rot: [0, -a, -0.45], scale: [1.35, 0.22, 0.5] }, 8))
  }
  parts.push(P.sphere(0.045 * s, '#86D79A', { at: [tx, ty + 0.01 * s, tz] }, 8))
  if (nuts) for (const a of [0.6, 2.7, 4.6]) parts.push(P.sphere(0.03 * s, '#A9764F', { at: [tx + Math.cos(a) * 0.04 * s, ty - 0.05 * s, tz + Math.sin(a) * 0.04 * s] }, 7))
  return parts
}

/** The coconut that drops from the big palm. */
export const coconutParts = (): BufferGeometry[] => [P.sphere(0.06, '#A9764F', {}, 9), P.sphere(0.02, '#8A5A44', { at: [0, 0.05, 0] }, 6)]

/** A mountain: a chunky green cone with a rounded top and a paler cap. */
export function mountainParts(x: number, y: number, z: number, r: number, h: number, k: number): BufferGeometry[] {
  const body = ['#7FCB92', '#73C28B', '#8AD29A'][k % 3]
  const cap = '#D3F4C2'
  return [
    P.cone(r, h, body, { at: [x, y + h / 2 - 0.03, z] }, 12),
    // A paler cap that hugs the same cone, with a round tip.
    P.cone(r * 0.46 + 0.006, h * 0.46, cap, { at: [x, y + h * 0.77 - 0.03 + 0.005, z] }, 12),
    P.sphere(r * 0.1 + 0.02, cap, { at: [x, y + h - 0.05, z] }, 8),
  ]
}

/** One of Krabi's limestone towers: a lumpy grey-lavender column with a jungle top. */
export function karstParts(x: number, y: number, z: number, s: number, k: number): BufferGeometry[] {
  const h = (0.62 + (k % 3) * 0.14) * s
  const r = 0.17 * s
  const parts = [
    P.cyl(r * 0.78, r, h, ROCK, { at: [x, y + h / 2, z] }, 8),
    P.cyl(r * 0.5, r * 0.62, h * 0.62, ROCK_DARK, { at: [x + r * 0.8, y + h * 0.31, z + r * 0.25] }, 7),
    P.sphere(r * 0.95, '#79CC8F', { at: [x, y + h, z], scale: [1, 0.55, 1] }, 9),
    P.sphere(r * 0.55, '#8BD79A', { at: [x + r * 0.8, y + h * 0.64, z + r * 0.25], scale: [1, 0.6, 1] }, 8),
    P.sphere(r * 0.3, '#8BD79A', { at: [x - r * 0.75, y + h * 0.5, z + r * 0.3] }, 7),
  ]
  // Ledges, so it looks like stacked stone.
  parts.push(P.cyl(r * 0.86, r * 0.9, 0.03 * s, ROCK_DARK, { at: [x, y + h * 0.36, z] }, 8))
  return parts
}

export interface Scenery {
  group: Group
  /** Where the big things stand (x, z, radius): taps on them puff leaves, and nothing else is planted there. */
  peaks: { x: number; z: number; r: number; h: number }[]
}

/** Everything that stands still: mountains, forests, palms, the limestone towers. */
export function buildScenery(field: Field, bag: Bag): Scenery {
  const r = rng(11)
  const keep: [number, number, number][] = [...PINS.map((p) => [p.at[0], p.at[1], 0.85] as [number, number, number]), ...POKES.map((p) => [p.at[0], p.at[1], 0.5] as [number, number, number])]
  const clear = (lon: number, lat: number, pad = 0) => keep.every(([a, b, rad]) => Math.hypot(lon - a, lat - b) > rad + pad)
  const peaks: Scenery['peaks'] = []
  const mountains: BufferGeometry[] = []
  SWELLS.forEach(([lon, lat, wide, top], i) => {
    const n = top >= 0.28 ? 4 : top >= 0.2 ? 3 : top >= 0.14 ? 2 : 1
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2
      const d = k ? wide * (0.3 + r() * 0.35) : 0
      const mlon = lon + Math.cos(a) * d
      const mlat = lat + Math.sin(a) * d * 0.9
      if (field.thai(mlon, mlat) < 0.22 || !clear(mlon, mlat, 0.1)) continue
      const rad = (0.2 + top * 0.55 + r() * 0.07) * (k ? 0.8 : 1)
      const h = rad * (1.9 + r() * 0.5)
      const x = toX(mlon)
      const z = toZ(mlat)
      if (peaks.some((p) => Math.hypot(p.x - x, p.z - z) < (p.r + rad) * 0.7)) continue
      peaks.push({ x, z, r: rad, h })
      mountains.push(...mountainParts(x, field.height(mlon, mlat), z, rad, h, i + k))
    }
  })
  const free = (lon: number, lat: number) => clear(lon, lat) && peaks.every((p) => Math.hypot(p.x - toX(lon), p.z - toZ(lat)) > p.r * 0.95)
  const trees: BufferGeometry[] = []
  // Forest wherever the land swells up into hills; a few trees dotted on the plains.
  for (let i = 0; i < 900 && trees.length < 190 * 3; i++) {
    const lon = 97.4 + r() * 8.2
    const lat = 5.8 + r() * 14.6
    const hill = field.swell(lon, lat)
    if (field.thai(lon, lat) < 0.12 || !free(lon, lat)) continue
    if (hill < 0.045 && r() > 0.05) continue
    trees.push(...treeParts(toX(lon), field.height(lon, lat), toZ(lat), 0.85 + r() * 0.5, i))
  }
  // Palms down the south and along the sunny coasts.
  const palms: BufferGeometry[] = []
  for (let i = 0; i < 700 && palms.length < 34 * 15; i++) {
    const lon = 98.2 + r() * 4.6
    const lat = 5.9 + r() * 7.2
    const st = field.thai(lon, lat)
    if (st < 0.07 || field.land(lon, lat) > 0.34 || field.swell(lon, lat) > 0.1 || !free(lon, lat)) continue
    if (lat > 12.4 && r() > 0.5) continue
    palms.push(...palmParts(toX(lon), field.height(lon, lat), toZ(lat), 0.8 + r() * 0.35, r() * 6.3))
  }
  const karsts = KARSTS.flatMap(([lon, lat, s], i) => karstParts(toX(lon), 0.0, toZ(lat), s, i))
  const group = new Group()
  group.add(solid(merge(mountains), bag, 1.5), solid(merge(trees), bag, 1.5), solid(merge(palms), bag, 1.5), solid(merge(karsts), bag, 1.5))
  return { group, peaks }
}

// ------------------------------------------------------------------------------------------------ the places

/** Bangkok: a row of pastel shophouses (Agong's is the pink one), a tall tower behind and the flag. */
export function bangkokParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const paint = ['#FBEA9A', '#FF9DC0', '#8FE3C8']
  const awning = ['#FF8FB8', '#FFFFFF', '#FFC83D']
  for (let i = -1; i <= 1; i++) {
    const x = i * 0.3
    const h = i ? 0.42 : 0.52
    parts.push(P.rbox(0.28, h, 0.3, 0.03, paint[i + 1], { at: [x, h / 2, 0] }))
    parts.push(P.box(0.31, 0.04, 0.33, '#FFF7F0', { at: [x, h + 0.01, 0] }))
    parts.push(P.box(0.3, 0.025, 0.13, awning[i + 1], { at: [x, 0.21, 0.2], rot: [0.4, 0, 0] }))
    parts.push(P.box(0.09, 0.15, 0.02, '#9A6B4F', { at: [x - 0.06, 0.075, 0.152] }))
    parts.push(P.box(0.08, 0.08, 0.02, '#DDF3FF', { at: [x + 0.06, 0.1, 0.152] }))
    for (const wx of [-0.07, 0.07]) parts.push(P.box(0.07, 0.09, 0.02, '#DDF3FF', { at: [x + wx, h - 0.11, 0.152] }))
  }
  // Towers behind, like the city's skyline over the river.
  parts.push(P.rbox(0.26, 0.95, 0.26, 0.04, '#BFE3FF', { at: [0.36, 0.475, -0.34] }))
  parts.push(P.rbox(0.2, 0.08, 0.2, 0.03, '#D9CCFF', { at: [0.36, 0.98, -0.34] }))
  parts.push(P.rbox(0.24, 0.66, 0.24, 0.04, '#FFD3E6', { at: [-0.3, 0.33, -0.36] }))
  parts.push(P.rbox(0.22, 0.5, 0.22, 0.04, '#D9CCFF', { at: [0.03, 0.25, -0.4] }))
  for (let k = 0; k < 4; k++) parts.push(P.box(0.2, 0.03, 0.02, '#FFFFFF', { at: [0.36, 0.25 + k * 0.18, -0.2] }))
  for (let k = 0; k < 3; k++) parts.push(P.box(0.18, 0.03, 0.02, '#FFFFFF', { at: [-0.3, 0.2 + k * 0.16, -0.235] }))
  // Thailand's flag: red, white, blue, white, red.
  parts.push(P.cyl(0.012, 0.014, 0.62, '#FFF7F0', { at: [-0.58, 0.31, 0.1] }, 6))
  parts.push(P.sphere(0.025, PAL.gold, { at: [-0.58, 0.63, 0.1] }, 8))
  const stripes: [string, number][] = [['#F0576B', 1], ['#FFFFFF', 1], ['#4B5FB8', 2], ['#FFFFFF', 1], ['#F0576B', 1]]
  let y = 0.6
  for (const [c, n] of stripes) {
    const sh = (0.15 * n) / 6
    parts.push(P.box(0.22, sh, 0.012, c, { at: [-0.46, y - sh / 2, 0.1] }))
    y -= sh
  }
  return parts
}

/** Nan: rice terraces stepping up a hill, a little hut on top, big green mountains behind. */
export function nanParts(): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  parts.push(...mountainParts(-0.42, 0, -0.42, 0.42, 1.05, 0), ...mountainParts(0.4, 0, -0.5, 0.36, 0.85, 1))
  const step = ['#D8F3A0', '#BFE88E', '#E6F4A4', '#C8EC98', '#D8F3A0']
  const radii = [0.5, 0.41, 0.32, 0.23, 0.14]
  radii.forEach((rad, i) => {
    parts.push(P.cyl(rad, rad + 0.03, 0.085, step[i], { at: [0.05, 0.0425 + i * 0.085, 0.05] }, 14))
    parts.push(P.cyl(rad + 0.012, rad + 0.035, 0.022, '#E3B98E', { at: [0.05, 0.011 + i * 0.085, 0.05] }, 14))
  })
  // The hut on stilts, with a pink roof.
  const top = 5 * 0.085
  for (const [sx, szz] of [[-0.05, -0.04], [0.05, -0.04], [-0.05, 0.04], [0.05, 0.04]]) parts.push(P.cyl(0.009, 0.009, 0.07, TRUNK, { at: [0.05 + sx, top + 0.035, 0.05 + szz] }, 5))
  parts.push(P.box(0.15, 0.08, 0.12, '#F6D3AE', { at: [0.05, top + 0.11, 0.05] }))
  parts.push(P.prism([[-0.11, 0], [0.11, 0], [0, 0.09]], 0.16, '#FF8FB8', { at: [0.05, top + 0.15, 0.05] }))
  return parts
}

/** Krabi: tall limestone towers on the shore and a beach umbrella. */
export function krabiParts(): BufferGeometry[] {
  return [...karstParts(-0.12, 0, -0.2, 1.35, 2), ...karstParts(0.3, 0, -0.34, 1.0, 0), ...parasolParts(0.22, 0, 0.2, '#FF8FB8'), ...palmParts(-0.42, 0, 0.12, 0.95, 2.6)]
}

function parasolParts(x: number, y: number, z: number, color: string): BufferGeometry[] {
  const parts = [P.cyl(0.01, 0.01, 0.3, '#FFF7F0', { at: [x, y + 0.15, z], rot: [0, 0, 0.12] }, 5)]
  parts.push(P.cone(0.2, 0.09, color, { at: [x - 0.018, y + 0.3, z] }, 8))
  parts.push(P.cone(0.11, 0.05, '#FFFFFF', { at: [x - 0.018, y + 0.323, z] }, 8))
  parts.push(P.sphere(0.018, '#FFFFFF', { at: [x - 0.018, y + 0.355, z] }, 6))
  parts.push(P.box(0.2, 0.012, 0.1, '#A8DCFF', { at: [x + 0.08, y + 0.008, z + 0.1], rot: [0, 0.4, 0] }))
  return parts
}

/** Koh Samet: palms, a beach umbrella and a sandcastle on the white sand. */
export function sametParts(): BufferGeometry[] {
  return [
    ...palmParts(-0.1, 0, -0.14, 1.1, 0.4),
    ...palmParts(0.12, 0, -0.2, 0.9, 2.2),
    ...palmParts(-0.02, 0, 0.14, 0.8, 4.4),
    ...parasolParts(0.12, 0, 0.06, '#FFC83D'),
    P.cyl(0.035, 0.05, 0.05, '#F6D9A0', { at: [-0.14, 0.025, 0.1] }, 8),
    P.cone(0.03, 0.05, '#F6D9A0', { at: [-0.14, 0.075, 0.1] }, 8),
  ]
}

// ------------------------------------------------------------------------------------------------ things that move

const piece = (parts: BufferGeometry[], bag: Bag, px = 1.5) => solid(merge(parts), bag, px)
/** A part that turns about a point: `at` is the pivot (in its parent), the parts are placed relative to it. */
function hinge(parts: BufferGeometry[], bag: Bag, at: V3, px = 1.5) {
  const g = piece(parts, bag, px)
  g.position.set(...at)
  return g
}

export interface Elephant {
  root: Group
  body: Group
  earL: Group
  earR: Group
  trunk: Group
}
/** An elephant, facing her: round body, big pink-lined ears that flap, a trunk that lifts. */
export function elephant(bag: Bag, s = 1): Elephant {
  const c = '#C9C2EA'
  const dark = '#B3ABDD'
  const root = new Group()
  const body = piece(
    [
      P.sphere(0.21, c, { at: [0, 0.3, -0.04], scale: [1, 0.95, 1.2] }),
      P.sphere(0.175, c, { at: [0, 0.42, 0.2] }),
      ...[-1, 1].flatMap((k) => [P.cyl(0.062, 0.068, 0.2, dark, { at: [k * 0.11, 0.1, 0.1] }, 9), P.cyl(0.062, 0.068, 0.2, dark, { at: [k * 0.12, 0.1, -0.18] }, 9)]),
      ...eye(-0.075, 0.47, 0.355),
      ...eye(0.075, 0.47, 0.355),
      cheek(-0.115, 0.415, 0.33),
      cheek(0.115, 0.415, 0.33),
      P.cyl(0.012, 0.008, 0.12, dark, { at: [0, 0.3, -0.31], rot: [0.9, 0, 0] }, 5),
    ],
    bag,
  )
  const ear = (k: number) => hinge([P.sphere(0.13, c, { at: [k * 0.1, 0, 0], scale: [1, 1.05, 0.28] }, 12), P.sphere(0.09, '#FFB3CF', { at: [k * 0.1, 0, 0.022], scale: [1, 1.05, 0.2] }, 10)], bag, [k * 0.13, 0.45, 0.17])
  const earL = ear(-1)
  const earR = ear(1)
  const trunk = hinge(
    [P.cyl(0.05, 0.06, 0.12, c, { at: [0, -0.05, 0.02] }, 8), P.cyl(0.04, 0.05, 0.11, c, { at: [0, -0.14, 0.045], rot: [0.35, 0, 0] }, 8), P.sphere(0.042, c, { at: [0, -0.2, 0.08] }, 8)],
    bag,
    [0, 0.42, 0.36],
  )
  body.add(earL, earR, trunk)
  root.add(body, blobShadow(0.3 * s, bag))
  body.scale.setScalar(s)
  return { root, body, earL, earR, trunk }
}

export interface Buffalo {
  root: Group
  body: Group
  head: Group
}
/** A water buffalo standing in the rice: dark, round, with big curved horns. */
export function buffalo(bag: Bag): Buffalo {
  const c = '#9A93BC'
  const root = new Group()
  const body = piece(
    [
      P.sphere(0.2, c, { at: [0, 0.27, -0.05], scale: [1, 0.9, 1.3] }),
      ...[-1, 1].flatMap((k) => [P.cyl(0.05, 0.055, 0.18, '#7A7496', { at: [k * 0.1, 0.09, 0.1] }, 8), P.cyl(0.05, 0.055, 0.18, '#7A7496', { at: [k * 0.1, 0.09, -0.2] }, 8)]),
      P.cyl(0.012, 0.008, 0.14, '#7A7496', { at: [0, 0.27, -0.33], rot: [1, 0, 0] }, 5),
    ],
    bag,
  )
  const head = hinge(
    [
      P.sphere(0.15, c, { at: [0, 0, 0.05], scale: [1, 0.95, 1.05] }),
      P.sphere(0.095, '#E4DDF2', { at: [0, -0.05, 0.15], scale: [1.15, 0.75, 0.8] }, 10),
      ...eye(-0.07, 0.04, 0.17, 0.032),
      ...eye(0.07, 0.04, 0.17, 0.032),
      cheek(-0.115, -0.01, 0.14),
      cheek(0.115, -0.01, 0.14),
      P.sphere(0.014, '#FF8FB8', { at: [-0.03, -0.045, 0.222] }, 6),
      P.sphere(0.014, '#FF8FB8', { at: [0.03, -0.045, 0.222] }, 6),
      // Horns: two arcs sweeping out and back.
      P.torus(0.13, 0.024, '#FFF2D6', { at: [-0.13, 0.1, 0.02], rot: [0, 0, 0.35] }, 2.4),
      P.torus(0.13, 0.024, '#FFF2D6', { at: [0.13, 0.1, 0.02], rot: [0, Math.PI, 0.35] }, 2.4),
      P.sphere(0.04, c, { at: [-0.13, 0.03, 0.0], scale: [1.3, 0.6, 0.5] }, 7),
      P.sphere(0.04, c, { at: [0.13, 0.03, 0.0], scale: [1.3, 0.6, 0.5] }, 7),
    ],
    bag,
    [0, 0.36, 0.2],
  )
  body.add(head)
  root.add(body, blobShadow(0.3, bag))
  return { root, body, head }
}

export interface Gibbon {
  root: Group
  swing: Group
}
/** A gibbon hanging from a branch by its long arms, swinging. */
export function gibbon(bag: Bag): Gibbon {
  const fur = '#F3DDB8'
  const root = new Group()
  // Its tree: two posts and a branch across.
  root.add(
    piece(
      [
        P.cyl(0.035, 0.05, 0.75, TRUNK, { at: [-0.34, 0.375, 0] }, 7),
        P.cyl(0.035, 0.05, 0.75, TRUNK, { at: [0.34, 0.375, 0] }, 7),
        P.cyl(0.028, 0.028, 0.8, '#C99B74', { at: [0, 0.72, 0], rot: [0, 0, Math.PI / 2] }, 7),
        P.sphere(0.16, LEAF[0], { at: [-0.36, 0.86, 0] }, 9),
        P.sphere(0.14, LEAF[2], { at: [0.38, 0.84, 0.02] }, 9),
        P.sphere(0.1, LEAF[1], { at: [-0.22, 0.92, -0.04] }, 8),
      ],
      bag,
    ),
    blobShadow(0.4, bag),
  )
  const swing = hinge(
    [
      P.cyl(0.02, 0.02, 0.26, fur, { at: [-0.06, -0.13, 0], rot: [0, 0, -0.2] }, 6),
      P.cyl(0.02, 0.02, 0.26, fur, { at: [0.06, -0.13, 0], rot: [0, 0, 0.2] }, 6),
      P.sphere(0.1, fur, { at: [0, -0.36, 0], scale: [1, 1.15, 0.9] }, 10),
      P.sphere(0.09, fur, { at: [0, -0.24, 0.02] }, 10),
      P.sphere(0.062, '#5A4A5E', { at: [0, -0.245, 0.06], scale: [1, 0.95, 0.6] }, 9),
      ...eye(-0.026, -0.235, 0.095, 0.016),
      ...eye(0.026, -0.235, 0.095, 0.016),
      P.cyl(0.02, 0.018, 0.14, fur, { at: [-0.05, -0.5, 0.02], rot: [0.3, 0, 0.15] }, 6),
      P.cyl(0.02, 0.018, 0.14, fur, { at: [0.05, -0.5, 0.02], rot: [0.3, 0, -0.15] }, 6),
    ],
    bag,
    [0, 0.72, 0],
  )
  root.add(swing)
  return { root, swing }
}

export interface Bird {
  root: Group
  body: Group
  wingL: Group
  wingR: Group
}
/** A hornbill: black and white, with a huge yellow beak and the horn on top of it. Flies nose-first along +z. */
export function hornbill(bag: Bag): Bird {
  const root = new Group()
  const body = piece(
    [
      P.sphere(0.11, '#5A4E70', { at: [0, 0, 0], scale: [0.9, 0.85, 1.4] }, 12),
      P.sphere(0.075, '#FFFFFF', { at: [0, -0.03, 0.02], scale: [0.9, 0.7, 1.2] }, 10),
      P.sphere(0.085, '#5A4E70', { at: [0, 0.06, 0.16] }, 10),
      P.cone(0.055, 0.24, '#FFC83D', { at: [0, 0.04, 0.32], rot: [Math.PI / 2 + 0.15, 0, 0] }, 8),
      P.sphere(0.05, '#FF9A5A', { at: [0, 0.12, 0.25], scale: [0.7, 0.7, 1.5] }, 8),
      ...eye(-0.045, 0.08, 0.215, 0.018),
      ...eye(0.045, 0.08, 0.215, 0.018),
      P.sphere(0.06, '#FFFFFF', { at: [0, 0, -0.2], scale: [0.8, 0.14, 1.8] }, 8),
    ],
    bag,
  )
  const wing = (k: number) => hinge([P.sphere(0.1, '#5A4E70', { at: [k * 0.1, 0, 0], scale: [1.25, 0.14, 0.8] }, 10), P.sphere(0.065, '#FFFFFF', { at: [k * 0.2, 0.004, -0.01], scale: [1.1, 0.14, 0.75] }, 8)], bag, [k * 0.06, 0.03, 0])
  const wingL = wing(-1)
  const wingR = wing(1)
  body.add(wingL, wingR)
  root.add(body)
  return { root, body, wingL, wingR }
}

/** A tuk-tuk: sky-blue with a pink roof, three wheels and a headlight. Drives along +z. */
export function tuktuk(bag: Bag): Group {
  const root = new Group()
  root.add(
    piece(
      [
        P.rbox(0.2, 0.11, 0.3, 0.035, '#7CC4F2', { at: [0, 0.115, -0.02] }),
        P.rbox(0.13, 0.1, 0.1, 0.03, '#7CC4F2', { at: [0, 0.11, 0.17] }),
        P.rbox(0.23, 0.035, 0.34, 0.015, '#FF8FB8', { at: [0, 0.31, -0.02] }),
        ...[[-0.085, 0.1], [0.085, 0.1], [-0.085, -0.15], [0.085, -0.15]].map(([x, z]) => P.cyl(0.008, 0.008, 0.14, '#FFF7F0', { at: [x, 0.235, z] }, 5)),
        P.box(0.17, 0.05, 0.1, '#FFF7F0', { at: [0, 0.19, -0.1] }),
        P.cyl(0.05, 0.05, 0.035, INK, { at: [0, 0.05, 0.19], rot: [0, 0, Math.PI / 2] }, 10),
        P.cyl(0.05, 0.05, 0.035, INK, { at: [-0.11, 0.05, -0.1], rot: [0, 0, Math.PI / 2] }, 10),
        P.cyl(0.05, 0.05, 0.035, INK, { at: [0.11, 0.05, -0.1], rot: [0, 0, Math.PI / 2] }, 10),
        P.sphere(0.025, PAL.gold, { at: [0, 0.14, 0.225] }, 8),
      ],
      bag,
    ),
    blobShadow(0.2, bag),
  )
  return root
}

/** A dolphin, nose along +z, curved a little like a jump. */
export function dolphin(bag: Bag): Group {
  const c = '#A9B4E8'
  return piece(
    [
      P.sphere(0.1, c, { at: [0, 0, 0], scale: [0.8, 0.8, 1.9] }, 12),
      P.sphere(0.075, '#F2F4FF', { at: [0, -0.03, 0.02], scale: [0.75, 0.6, 1.7] }, 10),
      P.cone(0.035, 0.11, c, { at: [0, -0.01, 0.22], rot: [Math.PI / 2, 0, 0] }, 8),
      P.prism([[-0.06, 0], [0.04, 0], [-0.05, 0.1]], 0.02, c, { at: [0, 0.07, -0.02], rot: [0, -Math.PI / 2, 0] }),
      P.prism([[-0.09, 0], [0.09, 0], [0, 0.07]], 0.02, c, { at: [0, 0, -0.2], rot: [-Math.PI / 2, 0, 0] }),
      ...eye(-0.06, 0.02, 0.11, 0.016),
      ...eye(0.06, 0.02, 0.11, 0.016),
    ],
    bag,
  )
}

/** A longtail boat: a long wooden hull with a tall prow, ribbons on it, a canopy and the long pole of its motor.
 *  Sails along +z. */
export function longtail(bag: Bag): Group {
  const wood = '#E6A375'
  return piece(
    [
      P.rbox(0.15, 0.07, 0.56, 0.03, wood, { at: [0, 0.03, 0] }),
      P.box(0.155, 0.02, 0.5, PAL.hotpink, { at: [0, 0.062, 0] }),
      P.box(0.05, 0.05, 0.2, wood, { at: [0, 0.1, 0.32], rot: [-0.75, 0, 0] }),
      P.sphere(0.03, PAL.pink, { at: [0, 0.2, 0.39] }, 8),
      P.sphere(0.024, PAL.butter, { at: [0, 0.155, 0.385] }, 8),
      P.box(0.17, 0.015, 0.22, '#FFF7F0', { at: [0, 0.2, -0.04] }),
      ...[[-0.07, 0.06], [0.07, 0.06], [-0.07, -0.14], [0.07, -0.14]].map(([x, z]) => P.cyl(0.006, 0.006, 0.13, '#FFF7F0', { at: [x, 0.13, z] }, 5)),
      P.box(0.06, 0.05, 0.07, '#A3AAC4', { at: [0, 0.1, -0.25] }),
      P.cyl(0.008, 0.008, 0.36, '#5E5468', { at: [0, 0.07, -0.44], rot: [1.25, 0, 0] }, 5),
    ],
    bag,
  )
}

/** A rice barge: fat and round, with a curved roof. Sails along +z. */
export function barge(bag: Bag): Group {
  return piece(
    [
      P.rbox(0.22, 0.09, 0.5, 0.045, '#B98A66', { at: [0, 0.035, 0] }),
      P.cyl(0.11, 0.11, 0.34, '#8FE3C8', { at: [0, 0.09, -0.02], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75] }, 12),
      P.box(0.08, 0.06, 0.06, '#FFF7F0', { at: [0, 0.11, 0.2] }),
      P.cyl(0.02, 0.02, 0.1, '#FF8FB8', { at: [0, 0.21, -0.12] }, 8),
    ],
    bag,
  )
}

/** A speedboat for the island: white with a pink stripe. Along +z. */
export function speedboat(bag: Bag): Group {
  return piece(
    [
      P.rbox(0.14, 0.07, 0.34, 0.03, '#FFFFFF', { at: [0, 0.03, 0] }),
      P.cone(0.07, 0.14, '#FFFFFF', { at: [0, 0.03, 0.22], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5] }, 8),
      P.box(0.145, 0.018, 0.3, PAL.hotpink, { at: [0, 0.058, -0.01] }),
      P.box(0.1, 0.05, 0.03, '#A8DCFF', { at: [0, 0.095, 0.06], rot: [-0.4, 0, 0] }),
      P.box(0.07, 0.05, 0.05, '#5E5468', { at: [0, 0.07, -0.18] }),
    ],
    bag,
  )
}

export interface Turtle {
  root: Group
  body: Group
  flipL: Group
  flipR: Group
}
/** A sea turtle paddling at the surface. Swims along +z. */
export function turtle(bag: Bag): Turtle {
  const skin = '#9FDDB0'
  const root = new Group()
  const body = piece(
    [
      P.sphere(0.13, '#6FC08A', { at: [0, 0.02, 0], scale: [1, 0.5, 1.2] }, 12),
      P.sphere(0.085, '#8BD79A', { at: [0, 0.05, 0], scale: [1, 0.45, 1.2] }, 10),
      P.sphere(0.06, skin, { at: [0, 0.03, 0.18] }, 10),
      ...eye(-0.04, 0.05, 0.215, 0.015),
      ...eye(0.04, 0.05, 0.215, 0.015),
      P.sphere(0.04, skin, { at: [-0.09, 0, -0.14], scale: [1, 0.3, 1.3] }, 7),
      P.sphere(0.04, skin, { at: [0.09, 0, -0.14], scale: [1, 0.3, 1.3] }, 7),
    ],
    bag,
  )
  const flip = (k: number) => hinge([P.sphere(0.07, skin, { at: [k * 0.07, 0, 0.01], scale: [1.4, 0.25, 0.7] }, 8)], bag, [k * 0.1, 0.01, 0.08])
  const flipL = flip(-1)
  const flipR = flip(1)
  body.add(flipL, flipR)
  root.add(body)
  return { root, body, flipL, flipR }
}

/** A puffy cloud (`rain`: a little greyer, the rain cloud over Nan). */
export const cloud = puffCloud

export interface Balloon {
  root: Group
  flame: Group
}
/** Sparkle's hot-air balloon: pink and lavender stripes, a gold band, a basket, and a flame that roars when poked. */
export function balloon(bag: Bag): Balloon {
  const root = new Group()
  const parts: BufferGeometry[] = []
  const stripes = [PAL.pink, PAL.lavender, '#FFFFFF', PAL.pink, PAL.lavenderDark, '#FFFFFF']
  // The envelope in six slices of color (each a squashed sphere wedge is too fiddly: stacked rings read as stripes).
  const rings = 7
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1)
    const y = 0.62 + t * 0.62
    const rad = 0.36 * Math.sin(0.5 + t * 2.35) ** 0.8
    parts.push(P.sphere(rad, stripes[i % stripes.length], { at: [0, y, 0], scale: [1, 0.42, 1] }, 14))
  }
  parts.push(P.cyl(0.18, 0.1, 0.2, PAL.pink, { at: [0, 0.52, 0] }, 12))
  parts.push(P.cyl(0.185, 0.185, 0.04, PAL.gold, { at: [0, 0.62, 0] }, 12))
  for (const [x, z] of [[-0.07, -0.07], [0.07, -0.07], [-0.07, 0.07], [0.07, 0.07]]) parts.push(P.cyl(0.006, 0.006, 0.3, '#FFF7F0', { at: [x, 0.3, z] }, 4))
  parts.push(P.rbox(0.2, 0.13, 0.2, 0.03, '#E6A375', { at: [0, 0.12, 0] }))
  parts.push(P.box(0.21, 0.03, 0.21, '#C9875C', { at: [0, 0.19, 0] }))
  root.add(piece(parts, bag, 2))
  const flame = hinge([P.cone(0.05, 0.16, '#FFC83D', { at: [0, 0.08, 0] }, 7), P.cone(0.03, 0.1, '#FF8FB8', { at: [0, 0.05, 0] }, 7)], bag, [0, 0.28, 0], 0)
  flame.scale.setScalar(0.4)
  root.add(flame)
  return { root, flame }
}

/** A rainbow (pastel arcs), for after the rain. */
export function rainbow(bag: Bag): Group {
  const g = new Group()
  ;['#FF8FB8', '#FFC2A8', '#FBEA9A', '#8FE3C8', '#A8DCFF', '#B9A6F5'].forEach((c, i) => g.add(solid(P.torus(0.62 - i * 0.05, 0.027, c, {}, Math.PI), bag, 0)))
  return g
}
