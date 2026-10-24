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
export const BASKET = { x: 0.1, y: 0.78, z: 1.75, r: 0.5 }
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

// ---- The cafe (`drinks`) ----
// An open-sided sala at the top of the boardwalk, far up behind the family's side of the yard (the yard hides while
// she's there). Seen straight on (the camera looks toward -z), left to right:
//
//   back:      the deck's rail, and the oil palms below it
//   counter:   the bell  Kaylee  [her glass]   [Daddy's glass]  Daddy  Mommy
//   front:     ═══ the tray: milk, chocolate, spoon, three straws, ice, coffee (two rows on a tall screen) ═══

export type StrawColor = 'pink' | 'purple' | 'yellow'
export const STRAW_COLORS: Record<StrawColor, string> = { pink: '#FF4F9A', purple: '#A77BE6', yellow: '#FFC83D' }
export const isStraw = (s: string | null | undefined): s is StrawColor => !!s && s in STRAW_COLORS

export const CAFE = { z: 40 }
/** The counter she makes her drink at (its top at Kaylee's tummy). */
export const COUNTER = { x0: -1.55, x1: 1.55, z: CAFE.z, d: 0.56, top: 0.55 }
/** A tall glass (hers, and Daddy's for his iced coffee). */
export const GLASS = { r0: 0.088, r1: 0.118, h: 0.36 }
export const HER_GLASS: V3 = [0.02, COUNTER.top, CAFE.z + 0.05]
export const DAD_GLASS: V3 = [0.85, COUNTER.top, CAFE.z + 0.05]
/** Where Daddy's glass goes when he takes it (the end of the counter, in front of him). */
export const DAD_SIP: V3 = [1.32, COUNTER.top, CAFE.z + 0.12]
/** The little bell on the counter (a poke: ding!). */
export const BELL: V3 = [-1.3, COUNTER.top, CAFE.z + 0.08]
/** Kaylee behind the counter; Daddy and Mommy at its end (closer in on a tall screen). x, z, facing (degrees). */
export const CAFE_FAMILY = {
  kaylee: [-0.62, CAFE.z - 0.55, 14],
  nick: [1.55, CAFE.z - 0.55, -18],
  ji: [2.15, CAFE.z - 0.95, -22],
} as const
export const CAFE_FAMILY_TALL = {
  kaylee: [-0.58, CAFE.z - 0.55, 14],
  nick: [1.2, CAFE.z - 0.62, -14],
  ji: [1.62, CAFE.z - 1.0, -18],
} as const
/** The tray along the bottom: one row on a wide screen, two on a tall one. Held things ride the plane z = HOLD_Z. */
export const TRAY = { z: CAFE.z + 0.95, y: 0.3, zB: CAFE.z + 1.62, yB: 0.02 }
export const CAFE_HOLD_Z = CAFE.z + 0.12

export type V3 = [number, number, number]
export type ToolId = 'milk' | 'choc' | 'spoon' | `straw-${StrawColor}` | 'ice' | 'coffee'
export const TOOLS_WIDE: ToolId[] = ['milk', 'choc', 'spoon', 'straw-pink', 'straw-purple', 'straw-yellow', 'ice', 'coffee']
export const TOOLS_TALL: ToolId[][] = [['milk', 'choc', 'spoon', 'coffee'], ['straw-pink', 'straw-purple', 'straw-yellow', 'ice']]

export const CAFE_SHOT = {
  wide: { center: [0.12, 1.0, CAFE.z + 0.4], half: [1.95, 0.95, 0.5], yaw: 0, pitch: 9 },
  tall: { center: [0.05, 1.25, CAFE.z + 0.9], half: [1.38, 1.2, 0.75], yaw: 0, pitch: 12 },
} as const
