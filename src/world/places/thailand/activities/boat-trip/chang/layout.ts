// Baan Chang's feeding yard in meters, pure data (plan: thailand/baan-chang.md). The steel pipe rail runs along x at
// z = 0; the elephants stand behind it (z < 0) facing the family (+z), a row of mossy boulders sits just in front of it,
// and the family stand on the near side with Daddy's basket. Food she holds rides the plane z = HOLD.z, in front of the
// boulders. The build (yard.ts), the elephants, the trunks' floor and the camera all read this.

export type ElephantId = 'mali' | 'khanom' | 'lamyai'
export type FoodKind = 'banana' | 'cane'

export interface ElephantSpot {
  id: ElephantId
  /** Where it stands (its feet, the middle of its body). */
  x: number
  z: number
  /** Size: Mali is 1, Khanom about half. */
  s: number
  /** Trunk length (m) at CHANG_FEEL.reach = 1. */
  trunk: number
}

export const RAIL = { z: 0, top: 1.0, mid: 0.55, x0: -7, x1: 7, posts: 1.6, r: 0.05 }

export const ELEPHANTS: ElephantSpot[] = [
  // Mali, the big one, a little to the left; Khanom, the young one, right at the rail on the right.
  { id: 'mali', x: -1.2, z: -3.05, s: 1, trunk: 2.6 },
  { id: 'khanom', x: 1.3, z: -1.95, s: 0.56, trunk: 2.1 },
  // Lamyai, in between, comes over to the right of the rail in `lamyai` (until then she's at the back, by a sala).
  { id: 'lamyai', x: 3.5, z: -2.55, s: 0.72, trunk: 2.2 },
]
/** Where Lamyai waits by the sala at the back, before she wanders over. */
export const LAMYAI_BACK = { x: 4.6, z: -8.0, heading: -0.45 }

/** Her chocolate milk, on the flat top of a rail post (the trunk sneaks to the top of its straw). */
export const MILK = { x: -0.6, y: RAIL.top + 0.09, z: 0 }

/** The water trough behind the rail, where the trunks dip for the splash: from x0 to x1, its middle at z, its rim h
 *  high and w wide. */
export const TROUGH = { x0: -2.7, x1: 4.6, z: -0.8, h: 0.42, w: 0.5 }

/** The boulders in front of the rail: x, z, radius, height squash. */
export const BOULDERS: [number, number, number, number][] = [
  [-3.4, 0.42, 0.42, 0.75],
  [-2.3, 0.38, 0.36, 0.85],
  [-1.25, 0.44, 0.4, 0.7],
  [-0.15, 0.36, 0.34, 0.8],
  [0.95, 0.42, 0.4, 0.72],
  [2.05, 0.38, 0.36, 0.82],
  [3.15, 0.44, 0.42, 0.7],
]

/** Where held food rides (its z), how low and high it may go and how far to the sides. */
export const HOLD = { z: 0.9, y0: 0.8, y1: 3.4, x0: -3.2, x1: 3.4, ground: 0.07 }

/** Daddy's basket on its tree stump (the middle of its rim), and the family's spots (x, z, facing in degrees). */
export const BASKET = { x: 0.1, y: 0.78, z: 1.75, r: 0.42 }
export const FAMILY = {
  kaylee: [-0.95, 1.4, 175],
  nick: [2.55, 1.75, 205],
  ji: [-2.55, 1.6, 160],
} as const
/** The blue bench's seat: Daddy sits down there when Lamyai comes over (out of her way). */
export const BENCH = { x: 4.7, y: 0.5, z: 2.7 }

/** How high a trunk must stay over the rail and the boulders (so it reaches over them, never through). */
export function floorAt(x: number, z: number) {
  if (z > RAIL.z - 0.16 && z < RAIL.z + 0.16) return RAIL.top + 0.12
  if (z >= RAIL.z + 0.16 && z < 0.78) return 0.66
  // (Into the trough's water a little: that's where they dip.)
  if (x > TROUGH.x0 && x < TROUGH.x1 && Math.abs(z - TROUGH.z) < TROUGH.w / 2 + 0.08) return TROUGH.h - 0.1
  return 0.08
}

/** The camera's box: the rail, the elephants' heads and trunks, Kaylee and the basket (wide and tall screens). */
export const SHOT = {
  wide: { center: [0.15, 1.55, -0.35], half: [3.35, 1.75, 2.1], yaw: 9, pitch: 8 },
  tall: { center: [0.1, 2.15, -0.35], half: [2.5, 2.2, 2.1], yaw: 9, pitch: 9 },
  // With Lamyai at the rail too (the box reaches right to take her in).
  wide3: { center: [0.75, 1.6, -0.4], half: [3.95, 1.8, 2.1], yaw: 9, pitch: 8 },
  tall3: { center: [0.75, 2.3, -0.4], half: [3.4, 2.25, 2.1], yaw: 9, pitch: 9 },
  // The splash: pulled back and up, so the spray and the rainbow fit.
  splashWide: { center: [0.75, 2.3, -0.7], half: [4.2, 2.7, 2.1], yaw: 9, pitch: 10 },
  splashTall: { center: [0.75, 3.0, -0.7], half: [3.4, 3.1, 2.1], yaw: 9, pitch: 10 },
} as const
