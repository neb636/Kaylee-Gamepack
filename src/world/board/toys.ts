// The toys on the world board besides the animals (animals.ts): the pin each animal rides, the trophy a finished
// country wears, Sparkle's balloon, clouds, the whale, the orca, the sea turtle and the sailboat, the Arctic's ice, and
// the still scenery (mountains and forests on the continents, a few things on each of her countries).
import { Group, type BufferGeometry } from 'three'
import type { Bag } from '../engine3d/dispose'
import { merge, P, solid, type V3 } from '../engine3d/geo'
import { PAL } from '../engine3d/toon'
import type { Field } from './field'
import { continentAt, LEVEL, PIECES, POKES, proj, SWELLS, toLat, toLon, toX, toZ, type Piece, type XZ } from './geo'
import type { LonLat } from './places'

const INK = '#2B2330'
const TRUNK = '#B98A66'

/** A little seeded random, so the trees stand in the same places every time. */
export function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const eye = (x: number, y: number, z: number, r = 0.05): BufferGeometry[] => [P.sphere(r, INK, { at: [x, y, z] }, 10), P.sphere(r * 0.38, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.35, z + r * 0.75] }, 6)]
const piece = (parts: BufferGeometry[], bag: Bag, px = 1.5) => solid(merge(parts), bag, px)
function hinge(parts: BufferGeometry[], bag: Bag, at: V3, px = 1.5) {
  const g = piece(parts, bag, px)
  g.position.set(...at)
  return g
}

// ------------------------------------------------------------------------------------------------ pins

/** How high a pin's seat is above its tip. */
export const PIN_SEAT = 0.78

/** The pin an animal rides: a point that touches the country, and a round seat in the pin's color with a white rim. */
export function pin(color: string, bag: Bag): Group {
  return piece(
    [
      P.cone(0.2, 0.66, color, { at: [0, 0.33, 0], rot: [Math.PI, 0, 0] }, 16),
      P.cyl(0.38, 0.3, 0.15, color, { at: [0, PIN_SEAT - 0.09, 0] }, 24),
      P.cyl(0.34, 0.38, 0.04, '#FFFFFF', { at: [0, PIN_SEAT - 0.02, 0] }, 24),
    ],
    bag,
    2,
  )
}

/** A gold trophy cup with a pink ribbon: it stands on the pin of a country she has finished. */
export function trophy(bag: Bag): Group {
  return piece(
    [
      P.cyl(0.11, 0.13, 0.05, '#C98A4B', { at: [0, 0.025, 0] }, 10),
      P.cyl(0.035, 0.05, 0.1, PAL.gold, { at: [0, 0.1, 0] }, 8),
      P.cyl(0.15, 0.07, 0.2, PAL.gold, { at: [0, 0.25, 0] }, 12),
      P.cyl(0.16, 0.16, 0.03, '#FFE08A', { at: [0, 0.355, 0] }, 12),
      P.torus(0.07, 0.02, PAL.gold, { at: [-0.16, 0.27, 0], rot: [0, 0, 0] }),
      P.torus(0.07, 0.02, PAL.gold, { at: [0.16, 0.27, 0], rot: [0, 0, 0] }),
      P.sphere(0.04, PAL.hotpink, { at: [0, 0.25, 0.12], scale: [1.3, 1.3, 0.5] }, 8),
    ],
    bag,
  )
}

// ------------------------------------------------------------------------------------------------ in the sky

/** A puffy cloud. */
export function cloud(bag: Bag, s = 1): Group {
  const c = '#FFFFFF'
  return piece(
    [
      P.sphere(0.26 * s, c, { at: [0, 0, 0], scale: [1, 0.72, 0.9] }, 12),
      P.sphere(0.2 * s, c, { at: [-0.27 * s, -0.04 * s, 0.02 * s], scale: [1, 0.72, 0.9] }, 11),
      P.sphere(0.22 * s, c, { at: [0.28 * s, -0.03 * s, 0], scale: [1, 0.72, 0.9] }, 11),
      P.sphere(0.16 * s, c, { at: [0.1 * s, 0.12 * s, -0.02 * s] }, 10),
      P.sphere(0.13 * s, c, { at: [-0.48 * s, -0.07 * s, 0], scale: [1, 0.7, 0.9] }, 9),
    ],
    bag,
    1.5,
  )
}

export interface Balloon {
  root: Group
  flame: Group
  /** Sparkle, looking out of the basket. */
  rider: Group
}
/** Sparkle's hot-air balloon: pink and lavender stripes, a gold band, a basket with Sparkle in it, and a flame that
 *  roars when poked. About 1.5 units tall; its basket's floor is y = 0. */
export function balloon(bag: Bag): Balloon {
  const root = new Group()
  const parts: BufferGeometry[] = []
  const stripes = [PAL.pink, PAL.lavender, '#FFFFFF', PAL.pink, PAL.lavenderDark, '#FFFFFF']
  const rings = 7
  for (let i = 0; i < rings; i++) {
    const t = i / (rings - 1)
    const y = 0.62 + t * 0.62
    const rad = 0.36 * Math.sin(0.5 + t * 2.35) ** 0.8
    parts.push(P.sphere(rad, stripes[i % stripes.length], { at: [0, y, 0], scale: [1, 0.42, 1] }, 14))
  }
  parts.push(P.cyl(0.18, 0.1, 0.2, PAL.pink, { at: [0, 0.52, 0] }, 12))
  parts.push(P.cyl(0.185, 0.185, 0.04, PAL.gold, { at: [0, 0.62, 0] }, 12))
  for (const [x, z] of [[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]]) parts.push(P.cyl(0.006, 0.006, 0.3, '#FFF7F0', { at: [x, 0.3, z] }, 4))
  parts.push(P.rbox(0.23, 0.14, 0.23, 0.03, '#E6A375', { at: [0, 0.1, 0] }))
  parts.push(P.box(0.24, 0.03, 0.24, '#C9875C', { at: [0, 0.17, 0] }))
  root.add(piece(parts, bag, 2))
  // Sparkle: a white unicorn's head with a gold horn and a pink mane, peeking over the basket's edge.
  const rider = hinge(
    [
      P.sphere(0.085, '#FFFFFF', { scale: [1, 0.95, 1] }, 12),
      P.sphere(0.05, '#FFE9F2', { at: [0, -0.02, 0.07], scale: [1.1, 0.8, 0.9] }, 9),
      P.cone(0.022, 0.1, PAL.gold, { at: [0, 0.12, 0.03], rot: [0.2, 0, 0] }, 7),
      ...eye(-0.036, 0.015, 0.07, 0.017),
      ...eye(0.036, 0.015, 0.07, 0.017),
      ...[-1, 1].map((k) => P.cone(0.022, 0.05, '#FFFFFF', { at: [k * 0.055, 0.085, -0.01] }, 6)),
      P.sphere(0.05, PAL.hotpink, { at: [-0.01, 0.06, -0.06], scale: [1, 1.2, 0.8] }, 8),
      P.sphere(0.045, PAL.lavenderDark, { at: [0.02, 0, -0.075], scale: [1, 1.3, 0.8] }, 8),
    ],
    bag,
    [0, 0.235, 0.02],
    1,
  )
  root.add(rider)
  const flame = hinge([P.cone(0.05, 0.16, '#FFC83D', { at: [0, 0.08, 0] }, 7), P.cone(0.03, 0.1, '#FF8FB8', { at: [0, 0.05, 0] }, 7)], bag, [0, 0.36, 0], 0)
  flame.scale.setScalar(0.4)
  root.add(flame)
  return { root, flame, rider }
}

// ------------------------------------------------------------------------------------------------ in the sea

export interface Swimmer {
  root: Group
  body: Group
  tail: Group
}
/** A whale (or, black and white, an orca): round and smiling, nose along +z, with a tail that waves. */
export function whale(bag: Bag, orca = false): Swimmer {
  const c = orca ? '#4A4A6A' : '#7FA8F0'
  const belly = orca ? '#FFFFFF' : '#DCE8FF'
  const root = new Group()
  const body = piece(
    [
      P.sphere(0.34, c, { at: [0, 0.1, 0], scale: [0.85, 0.72, 1.35] }),
      P.sphere(0.27, belly, { at: [0, 0.02, 0.06], scale: [0.85, 0.6, 1.3] }, 12),
      ...eye(-0.22, 0.14, 0.26, 0.04),
      ...eye(0.22, 0.14, 0.26, 0.04),
      ...[-1, 1].flatMap((k) => [P.sphere(0.04, '#FF9EC4', { at: [k * 0.25, 0.07, 0.24], scale: [0.4, 0.7, 1] }, 7), P.sphere(0.11, c, { at: [k * 0.3, 0, 0.02], scale: [1.3, 0.22, 0.7], rot: [0, 0, -k * 0.5] }, 8)]),
      ...(orca ? [P.sphere(0.07, '#FFFFFF', { at: [-0.2, 0.2, 0.2], scale: [0.35, 0.6, 1.2] }, 7), P.sphere(0.07, '#FFFFFF', { at: [0.2, 0.2, 0.2], scale: [0.35, 0.6, 1.2] }, 7), P.prism([[-0.12, 0], [0.08, 0], [-0.1, 0.24]], 0.03, c, { at: [0, 0.3, -0.05], rot: [0, -Math.PI / 2, 0] })] : []),
    ],
    bag,
  )
  const tail = hinge([P.cone(0.13, 0.3, c, { at: [0, 0, -0.14], rot: [-Math.PI / 2, 0, 0] }, 9), P.sphere(0.12, c, { at: [-0.11, 0.02, -0.33], scale: [1.2, 0.22, 0.75], rot: [0, 0.5, 0] }, 8), P.sphere(0.12, c, { at: [0.11, 0.02, -0.33], scale: [1.2, 0.22, 0.75], rot: [0, -0.5, 0] }, 8)], bag, [0, 0.1, -0.32])
  body.add(tail)
  root.add(body)
  return { root, body, tail }
}

export interface Turtle {
  root: Group
  flipL: Group
  flipR: Group
}
/** A sea turtle paddling at the surface. Swims along +z. */
export function turtle(bag: Bag): Turtle {
  const skin = '#9FDDB0'
  const root = piece(
    [
      P.sphere(0.26, '#6FC08A', { at: [0, 0.04, 0], scale: [1, 0.5, 1.2] }, 12),
      P.sphere(0.17, '#8BD79A', { at: [0, 0.1, 0], scale: [1, 0.45, 1.2] }, 10),
      P.sphere(0.12, skin, { at: [0, 0.06, 0.36] }, 10),
      ...eye(-0.08, 0.1, 0.43, 0.03),
      ...eye(0.08, 0.1, 0.43, 0.03),
      P.sphere(0.08, skin, { at: [-0.18, 0, -0.28], scale: [1, 0.3, 1.3] }, 7),
      P.sphere(0.08, skin, { at: [0.18, 0, -0.28], scale: [1, 0.3, 1.3] }, 7),
    ],
    bag,
  )
  const flip = (k: number) => hinge([P.sphere(0.14, skin, { at: [k * 0.14, 0, 0.02], scale: [1.4, 0.25, 0.7] }, 8)], bag, [k * 0.2, 0.02, 0.16])
  const flipL = flip(-1)
  const flipR = flip(1)
  root.add(flipL, flipR)
  return { root, flipL, flipR }
}

/** A little sailboat: a cream hull, a pink sail and a white one, a flag. Sails along +z. */
export function sailboat(bag: Bag): Group {
  return piece(
    [
      P.rbox(0.3, 0.14, 0.7, 0.06, '#FFF7F0', { at: [0, 0.06, 0] }),
      P.box(0.31, 0.035, 0.66, PAL.hotpink, { at: [0, 0.12, 0] }),
      P.cyl(0.018, 0.018, 0.85, '#C9875C', { at: [0, 0.55, 0.03] }, 6),
      P.prism([[0, 0], [0.42, 0], [0, 0.66]], 0.02, PAL.pink, { at: [0, 0.22, 0.01], rot: [0, Math.PI / 2, 0] }),
      P.prism([[0, 0], [-0.3, 0], [0, 0.5]], 0.02, '#FFFFFF', { at: [0, 0.24, 0.06], rot: [0, Math.PI / 2, 0] }),
      P.prism([[0, 0], [0.14, 0.04], [0, 0.08]], 0.015, PAL.gold, { at: [0, 0.9, 0.03], rot: [0, Math.PI / 2, 0] }),
    ],
    bag,
  )
}

/** The Arctic's ice: flat white floes round the polar bear's pin. */
export function iceFloes(at: XZ, bag: Bag): Group {
  const r = rng(5)
  const parts: BufferGeometry[] = []
  const spots: [number, number, number][] = [[0, 0, 1.25], [-1.7, 0.25, 0.75], [1.6, -0.1, 0.85], [-0.9, -0.55, 0.55], [2.7, 0.3, 0.5], [0.8, 0.6, 0.5], [-2.8, -0.1, 0.5], [3.6, -0.3, 0.38], [-3.7, 0.35, 0.34]]
  for (const [dx, dz, s] of spots) {
    parts.push(P.cyl(s * 0.94, s, 0.11, '#FFFFFF', { at: [at[0] + dx, 0.035, at[1] + dz * 0.8], scale: [1, 1, 0.62], rot: [0, r() * 3, 0] }, 9))
    parts.push(P.cyl(s * 1.02, s * 1.02, 0.03, '#CFE8FF', { at: [at[0] + dx, -0.01, at[1] + dz * 0.8], scale: [1, 1, 0.62], rot: [0, r() * 3, 0] }, 9))
  }
  // A little iceberg at the back.
  parts.push(P.cone(0.36, 0.7, '#F2F9FF', { at: [at[0] + 1.75, 0.4, at[1] - 0.2] }, 6), P.cone(0.24, 0.45, '#DDEEFF', { at: [at[0] + 2.05, 0.28, at[1] - 0.05] }, 5))
  return piece(parts, bag, 1.5)
}

// ------------------------------------------------------------------------------------------------ still scenery

/** A round leafy tree. */
function treeParts(x: number, y: number, z: number, s: number, k: number, leaf: string[]): BufferGeometry[] {
  return [
    P.cyl(0.025 * s, 0.035 * s, 0.14 * s, TRUNK, { at: [x, y + 0.07 * s, z] }, 6),
    P.sphere(0.11 * s, leaf[k % leaf.length], { at: [x, y + 0.2 * s, z], scale: [1, 0.92, 1] }, 8),
    P.sphere(0.07 * s, leaf[(k + 1) % leaf.length], { at: [x + 0.05 * s, y + 0.3 * s, z + 0.01 * s] }, 7),
  ]
}
/** A pine: two cones on a short trunk (a white tip in the far north). */
function pineParts(x: number, y: number, z: number, s: number, k: number, snowy = false): BufferGeometry[] {
  const c = ['#6FC08A', '#62B682', '#7CCB94'][k % 3]
  return [
    P.cyl(0.02 * s, 0.028 * s, 0.1 * s, TRUNK, { at: [x, y + 0.05 * s, z] }, 5),
    P.cone(0.11 * s, 0.22 * s, c, { at: [x, y + 0.19 * s, z] }, 7),
    P.cone(0.08 * s, 0.19 * s, snowy ? '#F2FBFF' : c, { at: [x, y + 0.31 * s, z] }, 7),
  ]
}
/** A palm: a leaning trunk and a star of fronds. */
function palmParts(x: number, y: number, z: number, s: number, turn: number): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const lean = 0.2
  const cx = Math.cos(turn)
  const sz = Math.sin(turn)
  for (let i = 0; i < 3; i++) {
    const t = (i + 0.5) / 3
    const off = lean * t * t * s
    parts.push(P.cyl(0.026 * s, 0.034 * s, 0.15 * s, i % 2 ? '#C99B74' : TRUNK, { at: [x + cx * off, y + (0.07 + i * 0.14) * s, z + sz * off], rot: [sz * lean * t * 1.4, 0, -cx * lean * t * 1.4] }, 5))
  }
  const tx = x + cx * lean * s
  const ty = y + 0.46 * s
  const tz = z + sz * lean * s
  for (let i = 0; i < 5; i++) {
    const a = turn + (i / 5) * Math.PI * 2
    parts.push(P.sphere(0.1 * s, i % 2 ? '#6FC98A' : '#86D79A', { at: [tx + Math.cos(a) * 0.11 * s, ty - 0.015 * s, tz + Math.sin(a) * 0.11 * s], rot: [0, -a, -0.45], scale: [1.35, 0.22, 0.5] }, 7))
  }
  parts.push(P.sphere(0.045 * s, '#86D79A', { at: [tx, ty + 0.01 * s, tz] }, 6))
  return parts
}
/** An acacia: the flat-topped tree of the savanna. */
function acaciaParts(x: number, y: number, z: number, s: number): BufferGeometry[] {
  return [P.cyl(0.02 * s, 0.03 * s, 0.24 * s, TRUNK, { at: [x, y + 0.12 * s, z] }, 5), P.sphere(0.17 * s, '#9FD487', { at: [x, y + 0.27 * s, z], scale: [1.15, 0.36, 1] }, 8), P.sphere(0.1 * s, '#8CC97C', { at: [x + 0.06 * s, y + 0.32 * s, z], scale: [1.1, 0.4, 1] }, 7)]
}
/** A cactus. */
function cactusParts(x: number, y: number, z: number, s: number): BufferGeometry[] {
  return [P.capsule(0.045 * s, 0.2 * s, '#7CCB94', { at: [x, y + 0.15 * s, z] }), P.capsule(0.03 * s, 0.07 * s, '#7CCB94', { at: [x + 0.08 * s, y + 0.19 * s, z] }), P.capsule(0.03 * s, 0.05 * s, '#7CCB94', { at: [x - 0.08 * s, y + 0.14 * s, z] })]
}
/** A mountain: a chunky cone in the land's own color with a snowy cap. */
function mountainParts(x: number, y: number, z: number, r: number, h: number, body: string, cap = '#FFFFFF'): BufferGeometry[] {
  return [P.cone(r, h, body, { at: [x, y + h / 2 - 0.03, z] }, 10), P.cone(r * 0.46 + 0.006, h * 0.46, cap, { at: [x, y + h * 0.77 - 0.03 + 0.005, z] }, 10), P.sphere(r * 0.1 + 0.02, cap, { at: [x, y + h - 0.05, z] }, 7)]
}

const PEAK: Record<string, string> = { northAmerica: '#8CCFA6', southAmerica: '#E8A47E', europe: '#AD9BE0', africa: '#E2B96C', asia: '#EC8FB0', australia: '#E9A068', antarctica: '#CFE0F5' }

/** What stands on each of her countries: [what, lon, lat, size]. */
type Prop = ['pine' | 'snowpine' | 'tree' | 'palm' | 'acacia' | 'peak' | 'icepeak' | 'pyramid' | 'rock' | 'cypress' | 'bamboo', number, number, number]
const PROPS: Record<string, Prop[]> = {
  canada: [
    ['peak', -127, 58.5, 1.1], ['peak', -121.5, 53.6, 1.3], ['peak', -117.3, 50.6, 1],
    ['pine', -112, 54, 1], ['pine', -115, 57.5, 0.9], ['pine', -98, 53, 1], ['pine', -94, 50.5, 0.9], ['pine', -86, 50, 1], ['pine', -78, 48.4, 0.9], ['pine', -73, 51.5, 1], ['pine', -66, 52.5, 0.9], ['pine', -122, 61, 0.9], ['pine', -101, 57.4, 0.9], ['pine', -71, 47, 0.8],
    ['snowpine', -112, 63.5, 0.9], ['snowpine', -98, 62.6, 0.9], ['snowpine', -72, 57, 0.9], ['snowpine', -128, 65.5, 0.8],
    ['icepeak', -75, 69.5, 0.8], ['icepeak', -82, 76, 0.7],
  ],
  italy: [['peak', 7.6, 45.7, 0.75], ['peak', 10.6, 46.4, 0.85], ['peak', 12.6, 46.4, 0.7], ['cypress', 11.2, 43.3, 0.8], ['cypress', 15.6, 40.9, 0.8], ['tree', 13.6, 41.9, 0.8], ['tree', 14.4, 37.6, 0.8], ['tree', 9, 40.1, 0.8]],
  egypt: [['pyramid', 30.6, 29.4, 1], ['pyramid', 29.7, 28.9, 0.75], ['pyramid', 31.1, 28.5, 0.6], ['palm', 32.6, 25.4, 0.9], ['palm', 31.2, 30.9, 0.8], ['rock', 27, 23.6, 0.8], ['rock', 33.8, 28.6, 0.8]],
  china: [
    ['peak', 82, 31, 1.3], ['peak', 87.5, 29.6, 1.5], ['peak', 92.6, 30.6, 1.2], ['peak', 80, 36, 1], ['peak', 86, 42.6, 0.9], ['peak', 97.5, 33.4, 1],
    ['bamboo', 106, 30.6, 1], ['bamboo', 109.5, 27, 1], ['bamboo', 113.6, 24.6, 0.9], ['tree', 116.4, 29, 1], ['tree', 119, 26.5, 0.9], ['tree', 113.5, 32.6, 0.9], ['tree', 117.6, 36, 0.9], ['pine', 125, 44, 1], ['pine', 128.4, 47.5, 0.9], ['pine', 121, 49.5, 0.9], ['rock', 101, 40.6, 1], ['rock', 92, 40.6, 0.9],
  ],
  thailand: [['peak', 98.9, 18.6, 0.6], ['tree', 100.4, 17.3, 0.75], ['tree', 102.6, 16, 0.75], ['palm', 99.4, 10.6, 0.75], ['palm', 99.6, 7.9, 0.7], ['palm', 101.6, 13.2, 0.65]],
  peru: [['peak', -77.6, -8.9, 0.8], ['peak', -75.2, -12.6, 0.9], ['peak', -72, -14.4, 0.85], ['peak', -70.4, -16, 0.7], ['tree', -75, -4.2, 0.8], ['tree', -73.4, -7.4, 0.8], ['tree', -71.4, -11.6, 0.8], ['palm', -73, -3.2, 0.7]],
  australia: [
    ['rock', 131, -25.3, 1.5], ['rock', 126, -21.6, 0.8], ['rock', 137.5, -29.4, 0.8], ['acacia', 122, -26.6, 1], ['acacia', 141.4, -23, 1], ['acacia', 128.6, -18.4, 0.9], ['acacia', 118.4, -29.6, 0.9],
    ['tree', 150.4, -30, 1], ['tree', 147.4, -35.6, 1], ['tree', 145, -17.4, 0.9], ['tree', 116.6, -33.4, 0.9], ['tree', 146.6, -42.2, 0.8], ['palm', 132.6, -13.2, 0.9], ['palm', 143, -13.6, 0.8],
  ],
  poles: [['icepeak', -60, -75.4, 1.3], ['icepeak', -30, -74.6, 1], ['icepeak', 52, -72.6, 1.2], ['icepeak', 88, -73.6, 1], ['icepeak', 124, -72.2, 1.2], ['icepeak', 152, -74.6, 1], ['icepeak', -112, -76, 1.1], ['icepeak', -146, -76.6, 0.9], ['icepeak', 178, -75.6, 0.9]],
}

function propParts([kind, , , s]: Prop, x: number, y: number, z: number, k: number): BufferGeometry[] {
  switch (kind) {
    case 'pine':
      return pineParts(x, y, z, s * 1.9, k)
    case 'snowpine':
      return pineParts(x, y, z, s * 1.9, k, true)
    case 'tree':
      return treeParts(x, y, z, s * 1.8, k, ['#7ACD8E', '#68C083', '#8BD79A'])
    case 'palm':
      return palmParts(x, y, z, s * 1.5, k * 2.1)
    case 'acacia':
      return acaciaParts(x, y, z, s * 1.7)
    case 'peak':
      return mountainParts(x, y, z, 0.3 * s, 0.62 * s, ['#8FC7A0', '#A9B8D6', '#9AC4A6'][k % 3])
    case 'icepeak':
      return [P.cone(0.3 * s, 0.6 * s, '#EAF4FF', { at: [x, y + 0.27 * s, z] }, 6), P.cone(0.19 * s, 0.38 * s, '#CFE5FB', { at: [x + 0.24 * s, y + 0.17 * s, z + 0.08 * s] }, 5)]
    case 'pyramid':
      return [P.cone(0.34 * s, 0.4 * s, '#F2C879', { at: [x, y + 0.2 * s - 0.01, z], rot: [0, Math.PI / 4, 0] }, 4), P.cone(0.1 * s, 0.12 * s, '#FBE2A0', { at: [x, y + 0.34 * s, z], rot: [0, Math.PI / 4, 0] }, 4)]
    case 'rock':
      return [P.sphere(0.2 * s, '#E98A5C', { at: [x, y + 0.03 * s, z], scale: [1.5, 0.75, 1] }, 9), P.sphere(0.12 * s, '#F09A68', { at: [x + 0.16 * s, y + 0.02 * s, z + 0.08 * s], scale: [1.3, 0.7, 1] }, 7)]
    case 'cypress':
      return [P.cyl(0.02 * s, 0.025 * s, 0.1 * s, TRUNK, { at: [x, y + 0.05 * s, z] }, 5), P.sphere(0.1 * s, '#5FB57E', { at: [x, y + 0.42 * s, z], scale: [0.75, 3.3, 0.75] }, 8)]
    case 'bamboo':
      return [-1, 0, 1].flatMap((i) => [P.cyl(0.022 * s, 0.022 * s, (0.5 + i * 0.08) * s, '#8FD68A', { at: [x + i * 0.07 * s, y + (0.25 + i * 0.04) * s, z + (i ? 0.03 : 0) * s], rot: [0, 0, i * -0.08] }, 5), P.sphere(0.08 * s, '#7CCB82', { at: [x + i * 0.1 * s, y + (0.52 + i * 0.08) * s, z], scale: [1.4, 0.4, 0.6], rot: [0, 0, 0.5 - i * 0.5] }, 6)])
  }
}

export interface Scenery {
  group: Group
}

/** Everything that stands still: mountains and forests on the continents, the things on her countries. */
export function buildScenery(field: Field, bag: Bag): Scenery {
  const r = rng(11)
  // Nothing is planted under a pin, or where something lives.
  const keep: [number, number, number][] = [...PIECES.flatMap((p) => [[p.pin[0], p.pin[1], 0.75] as [number, number, number]]), ...POKES.map((p) => [...proj(p.at), 0.9] as [number, number, number])]
  const clear = (x: number, z: number) => keep.every(([a, b, rad]) => Math.hypot(x - a, (z - b) * 1.3) > rad)
  const peaks: { x: number; z: number; r: number }[] = []
  const mountains: BufferGeometry[] = []
  SWELLS.forEach(([lon, lat, wide, top]) => {
    const n = top >= 0.12 ? 3 : top >= 0.09 ? 2 : 1
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2
      const d = k ? (wide / 10) * (0.35 + r() * 0.4) : 0
      const x = toX(lon) + Math.cos(a) * d * 0.7
      const z = toZ(lat) + Math.sin(a) * d
      if (field.land(x, z) < 0.1 || field.piece(x, z) >= 0 || !clear(x, z)) continue
      const rad = (0.2 + top * 1.3 + r() * 0.06) * (k ? 0.8 : 1)
      if (peaks.some((p) => Math.hypot(p.x - x, p.z - z) < (p.r + rad) * 0.75)) continue
      peaks.push({ x, z, r: rad })
      mountains.push(...mountainParts(x, field.height(x, z), z, rad, rad * 1.8, PEAK[continentAt(toLon(x), toLat(z))]))
    }
  })
  const free = (x: number, z: number) => clear(x, z) && peaks.every((p) => Math.hypot(p.x - x, p.z - z) > p.r * 1.05)

  // Trees on the continents, by where they are: pines in the cold north, palms and jungle in the tropics, acacias on
  // the savanna, a cactus or two in the deserts. Sparse: they are decoration, the countries are the stars.
  const trees: BufferGeometry[] = []
  const stood: XZ[] = []
  for (let i = 0; i < 2600 && stood.length < 64; i++) {
    const x = toX(-165 + r() * 350)
    const z = toZ(-54 + r() * 124)
    if (field.land(x, z) < 0.09 || field.piece(x, z) >= 0 || !free(x, z)) continue
    if (stood.some(([a, b]) => Math.hypot(a - x, b - z) < 1.15)) continue
    const lon = toLon(x)
    const lat = toLat(z)
    const where = continentAt(lon, lat)
    const y = field.height(x, z)
    const s = 1.35 + r() * 0.35
    const desert = (where === 'africa' && lat > 16) || (where === 'asia' && lon < 62 && lat < 34) || (where === 'asia' && lon > 62 && lon < 112 && lat > 36 && lat < 48) || (where === 'northAmerica' && lat < 33 && lat > 24 && lon < -100)
    if (lat > 73) continue
    if (desert) {
      if (r() < 0.22) trees.push(...(where === 'northAmerica' ? cactusParts(x, y, z, s) : palmParts(x, y, z, s * 0.75, r() * 6.3)))
      else continue
    } else if (lat > 50) trees.push(...pineParts(x, y, z, s, i, lat > 62))
    else if (Math.abs(lat) < 23) {
      if (where === 'africa' && (lat > 6 || lat < -6)) trees.push(...acaciaParts(x, y, z, s))
      else if (r() < 0.4) trees.push(...palmParts(x, y, z, s * 0.8, r() * 6.3))
      else trees.push(...treeParts(x, y, z, s, i, ['#5FBF7E', '#6FCB8A', '#58B878']))
    } else if (r() < 0.75) trees.push(...treeParts(x, y, z, s, i, ['#7ACD8E', '#68C083', '#8BD79A']))
    else continue
    stood.push([x, z])
  }

  // The things on her countries.
  const props: BufferGeometry[] = []
  for (const p of PIECES) {
    // (Smaller things on a small country, so they don't hide it.)
    const small = Math.max(0.5, Math.min(1, Math.max(p.half[0], p.half[1]) / 2.4))
    ;(PROPS[p.id] ?? []).forEach((prop, k) => {
      const [x, z] = p.spot([prop[1], prop[2]] as LonLat)
      if (Math.hypot(x - p.pin[0], (z - p.pin[1]) * 1.3) < 0.4) return
      props.push(...propParts([prop[0], prop[1], prop[2], prop[3] * small], x, LEVEL.piece, z, k))
    })
  }
  const group = new Group()
  for (const parts of [mountains, trees, props]) if (parts.length) group.add(solid(merge(parts), bag, 1.5))
  return { group }
}

/** Is a spot (x, z) on this piece's own land? (The scenery's props are listed by real places, so they are.) */
export const pieceOf = (field: Field, x: number, z: number): Piece | null => PIECES[field.piece(x, z)] ?? null
