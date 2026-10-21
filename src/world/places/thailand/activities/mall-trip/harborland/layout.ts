// MEGA HarborLand's "Little Thailand" (plan: planning/around-the-world/thailand/mall-trip.md), in meters: the one
// source of truth for the build, the walk grids, the links between floors and the tap targets. Pure data (no three.js).
//
// Seen from the front like a dollhouse (the camera looks toward -z), left to right:
//
//   y 4.4                 ┌ dragon tower top ═══ bridge ═══ TOP deck ┐╲ Ta-Khon roller slide (long and bumpy) ─╮
//   y 2.2      dragon      ⛰ chedi        L1a ── rope bridge ── L1b ┘ ╲ zip line ──╮                         │
//   y 0.9    spiral down   Golden          ╲ Boomerang Donut      net            ╲                        │
//   y 0    [ BALL POOL ]   Mountain  perch: little slide    ground, Sky Pod, bike, Phi Ta Khon figures ──╯
//
// x runs left (-) to right (+), z toward the camera (+). The back wall is at z = -3.7.
export type XZ = [number, number]
export type Rect = [number, number, number, number]

export const LV = { ground: 0, perch: 0.9, l1: 2.2, top: 4.4 } as const

/** The whole floor of the hall. */
export const HALL: Rect = [-16.2, 15.4, -3.6, 4.4]
export const BACK_Z = -3.7

export const POOL = { rect: [-16, -10, -3.6, 2.6] as Rect, inner: [-15.8, -10.2, -3.4, 2.4] as Rect, rim: 0.5, front: 0.32, balls: 0.42 }

/** The twin-dragon spiral tower, in the pool: a post, a platform on top, the slide winding round it twice. */
export const TOWER = { x: -13, z: -1.6, r: 1.45, post: 0.38, deck: 1.0, turns: 2, bottom: 0.72 }

/** The Golden Mountain: three gold tiers stepping up to the first deck, a little chedi on top. */
export const MOUNTAIN = {
  tiers: [
    { rect: [-10, -6, -3.6, 0.4] as Rect, y: 0.73 },
    { rect: [-9.6, -6, -3.6, -0.35] as Rect, y: 1.47 },
    { rect: [-9.2, -6, -3.6, -1.05] as Rect, y: LV.l1 },
  ],
  /** Where her hops land on the way up (bottom to top). */
  climb: [
    [-6.75, 0.73, 0.0],
    [-7.15, 1.47, -0.72],
    [-6.6, 2.2, -1.35],
  ] as [number, number, number][],
  chedi: [-8.1, -2.6] as XZ,
  monkeys: [
    [-9.35, 0.73, -0.15],
    [-8.75, 1.47, -0.95],
    [-8.95, 2.2, -1.75],
  ] as [number, number, number][],
}

/** The two halves of the first deck, the rope bridge between them, the top deck (on the left half) and the bridge
 *  over to the dragon tower. */
export const L1A: Rect = [-6, -2.5, -3.6, 0]
export const L1B: Rect = [-0.5, 3, -3.6, 0]
export const BRIDGE = { rect: [-2.5, -0.5, -1.5, -0.5] as Rect, sag: 0.16 }
export const TOP: Rect = [-6, -2.5, -3.6, -1.6]
export const SKYWALK: Rect = [-12.1, -6, -2.6, -1.6]
export const TOWER_DECK: Rect = [-14, -12, -2.6, -0.6]

/** The toddler perch by the pool, with two steps up and the little slide down into the balls. */
export const PERCH: Rect = [-9.3, -8.1, 1.3, 2.5]

/** The Boomerang Donut: a half-pipe in front of L1a. The ring swings along an arc round (x, bottom + r). */
export const DONUT = { x: -3.3, bottom: 0.25, r: 2.2, z: 0.8, width: 1.1, from: -1.43, to: 1.32 }

/** The zip line from L1b's right end down to a mat on the ground. */
export const ZIP = { a: [3.0, 3.55, -1.2] as [number, number, number], b: [10.8, 1.75, -1.2] as [number, number, number], sag: 0.35, hang: 1.3, mat: [10.9, -0.45] as XZ }

/** The Ta-Khon roller slide: a long straight ramp of rollers from the top deck down to the far right. */
export const ROLLER = { a: [-2.55, 4.45, -3.0] as [number, number, number], b: [14.2, 0.35, -3.0] as [number, number, number], width: 0.8, posts: [4.0, 7.6, 11.0] }

export const CANNON = { at: [-8.7, 3.45] as XZ }
export const DADDY = { at: [-14.7, 1.5] as XZ, face: 70 }
export const MOMMY = { bench: [-15.4, 3.55] as XZ, face: 55 }
export const SKYPOD = { x: 5.2, z: -3.55, w: 1.6 }
export const BIKE = { at: [7.8, 1.7] as XZ }
export const MASKS: XZ[] = [
  [6.9, -2.05],
  [9.3, -2.05],
  [12.2, -2.05],
]

/** Walkable tops, for taps (what the camera sees of each floor). */
export const TAP_RECTS: Record<string, Rect[]> = {
  ground: [
    [-10, 15.4, -3.6, 4.4],
    [-16.2, -10, 2.6, 4.4],
  ],
  pool: [POOL.inner],
  perch: [PERCH],
  l1: [[L1A[0], L1A[1], -1.6, 0], BRIDGE.rect, [L1B[0], L1B[1], -2.4, 0]],
  top: [TOP, SKYWALK, TOWER_DECK],
}

/** What blocks the ground (soft-play blocks, the pool's rim, the rides' feet), as rectangles and circles. */
export const GROUND_BLOCKS: Rect[] = [
  [POOL.rect[0] - 0.3, POOL.rect[1] + 0.1, POOL.rect[2], POOL.rect[3] + 0.1],
  MOUNTAIN.tiers[0].rect,
  L1A,
  L1B,
  // Under the rope bridge: padded, so she never gets stuck in a nook.
  [-2.5, -0.5, -3.6, 0.3],
  // The donut's half-pipe.
  [DONUT.x - 2.5, DONUT.x + 2.3, DONUT.z - 0.55, DONUT.z + 0.55],
  PERCH,
  // The little slide over the ground, and the roller slide's low end.
  [-10, -9.3, 1.5, 2.3],
  [12.6, 14.6, -3.6, -2.6],
  // The Sky Pod's buttons on the wall, and the bike.
  [SKYPOD.x - SKYPOD.w / 2, SKYPOD.x + SKYPOD.w / 2, -3.6, -3.3],
  [BIKE.at[0] - 0.55, BIKE.at[0] + 0.55, BIKE.at[1] - 0.35, BIKE.at[1] + 0.35],
  // Mommy's bench.
  [MOMMY.bench[0] - 0.75, MOMMY.bench[0] + 0.75, MOMMY.bench[1] - 0.25, MOMMY.bench[1] + 0.3],
]
export const GROUND_CIRCLES: [number, number, number][] = [
  [CANNON.at[0], CANNON.at[1], 0.45],
  ...MASKS.map(([x, z]): [number, number, number] => [x, z, 0.35]),
  ...ROLLER.posts.map((x): [number, number, number] => [x, ROLLER.a[2], 0.15]),
  [ZIP.b[0] + 0.3, ZIP.b[2], 0.15],
]

/** Where she starts each section. */
export const STARTS = {
  play: { floor: 'ground', at: [-6.2, 2.6] as XZ, face: 0 },
  mountain: { floor: 'l1', at: [-5.0, -0.8] as XZ, face: 20 },
  dragon: { floor: 'top', at: [-4.4, -2.4] as XZ, face: 20 },
}

/** The links between floors (the rides and climbs). Their motions live in rides.ts; here, only where they start and
 *  end. */
export const LINKS = {
  mountain: { from: 'ground', at: [-6.6, 1.0] as XZ, to: 'l1', end: [-5.6, -0.85] as XZ },
  netL1: { from: 'ground', at: [1.5, 0.6] as XZ, to: 'l1', end: [1.5, -0.55] as XZ, x: 1.5, z: 0 },
  netTop: { from: 'l1', at: [-4.2, -1.2] as XZ, to: 'top', end: [-4.2, -2.1] as XZ, x: -4.2, z: -1.6 },
  steps: { from: 'ground', at: [-7.45, 1.9] as XZ, to: 'perch', end: [-8.6, 1.9] as XZ },
  diveA: { from: 'ground', at: [-11.0, 3.25] as XZ, to: 'pool', end: [-11.0, 1.9] as XZ },
  diveB: { from: 'ground', at: [-13.4, 3.25] as XZ, to: 'pool', end: [-13.4, 1.9] as XZ },
  slideLittle: { from: 'perch', at: [-8.85, 1.9] as XZ, to: 'pool', end: [-11.7, 1.9] as XZ },
  donut: { from: 'l1', at: [-5.3, -0.3] as XZ, to: 'ground', end: [-3.3, 2.0] as XZ },
  zip: { from: 'l1', at: [2.6, -1.2] as XZ, to: 'ground', end: [ZIP.mat[0], ZIP.mat[1]] as XZ },
  roller: { from: 'top', at: [-3.0, -3.0] as XZ, to: 'ground', end: [14.4, -1.9] as XZ },
  dragon: { from: 'top', at: [-13, -1.0] as XZ, to: 'pool', end: [-12.4, 1.3] as XZ },
}
export type LinkId = keyof typeof LINKS

/** The big rides, each a sticker on her sock band the first time. */
export const RIDES = ['pool', 'mountain', 'donut', 'zip', 'roller', 'dragon'] as const
export type RideId = (typeof RIDES)[number]
/** The sock band's stickers (emoji are fine in UI chips). */
export const RIDE_ICONS: Record<RideId, string> = { pool: '🫧', mountain: '⛰️', donut: '🍩', zip: '🪢', roller: '👺', dragon: '🐉' }
