// MEGA HarborLand's hall (plan: planning/around-the-world/thailand/mall-trip.md, "The hall"), in meters: one long
// side view she walks along, with a mini game in each part. The one source of truth for the build, the walk grid, the
// doors and the tap targets. Pure data (no three.js).
//
// Seen from the front (the camera looks toward -z and scrolls left and right with her), left to right:
//
//          ┌ Harbor Town sign ┐                ┌ the mask, the lit sign ┐
//   │ 🩺 vet │ ☕ cafe │ 💈 barber │  bench   ║ the Big Frame ║ ╲ racing lanes ╲ pit   ⛰ Golden   ▦ foam    🥊 bags
//   │  door  │  door   │  door    │  Mommy   ║  (way in)     ║   steps          balls  Mountain   blocks   Sky Pod
//   └─────────────────────────────────────────────── flower mats ─────────────────────────────────────────────────┘
//
// x runs left (-) to right (+), z toward the camera (+). The back wall is at z = -4.6.
export type XZ = [number, number]
export type Rect = [number, number, number, number]

/** The whole floor. */
export const HALL: Rect = [-16.6, 27.8, -4.4, 3.8]
export const BACK_Z = -4.6
/** The wall's height, and where the dark ceiling band with its light strips starts. */
export const WALL = { h: 7.6, dark: 5.6 }

/** Harbor Town: a little street of shops against the back wall, their fronts at `front`. */
export const TOWN = { x0: -16.0, x1: -5.6, front: -3.0, h: 3.0, upper: 4.4, sign: 5.0 }
export const SHOPS = [
  { id: 'vet', x: -14.2, wall: '#A7EBD0', trim: '#5FBF9F' },
  { id: 'cafe', x: -10.8, wall: '#FFF1E2', trim: '#FF8FB8' },
  { id: 'barber', x: -7.4, wall: '#CFE3FF', trim: '#5D7BB0' },
] as const
export type ShopId = (typeof SHOPS)[number]['id']
export const SHOP_W = 3.0
/** A shop's doorway: its size, and how deep it goes in (she steps in there, out of sight). */
export const DOOR = { w: 1.1, h: 2.05, recess: 0.7 }

/** The parents' bench between the town and the frame (the dragon spiral behind it), Mommy on it. */
export const BENCH = { at: [-4.7, -0.55] as XZ, face: 0 }

/** The Big Frame: white padded pipes and black nets, four levels, the giant mask with its pink nose slide on top, the
 *  lit MEGA HarborLand sign on its front. Built by harborland/build.ts (its insides: harborland/layout.ts). */
export const FRAME = { x0: -3.8, x1: 4.6, z0: -4.2, z1: -1.0, levels: [1.5, 3.0, 4.5], top: 5.3, cols: 7 }
/** The way in: a net tunnel's mouth at the bottom of the front. */
export const FRAME_DOOR = { x: 1.1, y: 0.37, z: -1.0 }
/** The mask on top, and its long pink nose: a tube slide down the front to a mat. */
export const MASK = { x: -1.6, y: 5.85, z: -2.75 }
export const NOSE: [number, number, number][] = [
  [-1.6, 5.15, -1.75],
  [-1.6, 4.1, -0.6],
  [-1.5, 2.6, 0.35],
  [-1.2, 1.2, 0.9],
  [-0.8, 0.38, 1.25],
]
export const NOSE_MAT: Rect = [-1.7, 0.3, 0.75, 1.95]

/** The racing slide off the frame's right side: four wavy orange lanes down to a pit of pink and white balls. */
export const LANES = { x0: 5.6, x1: 10.4, y0: 3.0, y1: 0.45, z: [-3.7, -3.0, -2.3, -1.6], w: 0.62, bumps: 3, amp: 0.2 }
export const PIT: Rect = [10.4, 12.4, -4.2, -1.1]
/** The steps up to the lanes' start, between the frame and the lanes: from the front (z1) up to the back (z0). */
export const STEPS = { x0: 4.7, x1: 5.6, z0: -4.0, z1: -0.9, n: 6 }

/** The Golden Mountain: a gold cone with climbing holds, a red rail round the top, a steel slide down the front. */
export const MOUNTAIN = { x: 15.2, z: -2.5, r: 2.0, h: 3.3, slide: [[15.2, 3.0, -1.2], [15.2, 1.8, 0.0], [15.2, 0.35, 1.0]] as [number, number, number][] }

/** Little Land: walls of giant foam bricks. The front stack's bricks tumble when she taps it. */
export const BLOCKS = { x0: 17.9, x1: 21.3, back: -3.8, front: -1.6, brick: [0.9, 0.45, 0.5] as [number, number, number] }

/** Muay Thai: two punching bags on a beam over a blue mat. Then the Sky Pod: a wall of light-up buttons. */
export const BOXING = { x0: 22.2, x1: 24.9, beam: 2.7, bags: [22.9, 24.2], z: -2.0 }
export const SKYPOD = { x: 26.3, y: 1.5, z: -4.5, cols: 4, rows: 3 }

/** Hanging signs over the zones that have no shop front (their words are HTML: hall.ts), and the painted wall. */
export const ZONE_SIGNS = [
  { id: 'little', text: 'Little Land', x: (BLOCKS.x0 + BLOCKS.x1) / 2, y: 3.75, z: -1.3, w: 2.5, color: '#8FE3C8' },
  { id: 'muay', text: 'Muay Thai', x: (BOXING.x0 + BOXING.x1) / 2, y: 3.75, z: -1.3, w: 2.3, color: '#FF6F6F' },
] as const
export const SIGN_H = 0.72

/** The plush crocodile lying on the mats, the staff in their bright shirts. */
export const CROC = { at: [7.6, 1.9] as XZ, face: -15 }
export const STAFF: { at: XZ; face: number }[] = [
  { at: [3.4, 0.3], face: -25 },
  { at: [17.2, 0.8], face: 25 },
]

/** Where she walks to before going in (in front of each way in), and which way she faces there. */
export const DOORS = {
  vet: { at: [-14.2, -2.3] as XZ, in: [-14.2, -3.45] as XZ },
  cafe: { at: [-10.8, -2.3] as XZ, in: [-10.8, -3.45] as XZ },
  barber: { at: [-7.4, -2.3] as XZ, in: [-7.4, -3.45] as XZ },
  frame: { at: [FRAME_DOOR.x, -0.3] as XZ, in: [FRAME_DOOR.x, -1.6] as XZ },
  race: { at: [(STEPS.x0 + STEPS.x1) / 2, -0.2] as XZ, in: [(STEPS.x0 + STEPS.x1) / 2, -1.2] as XZ },
  /** Little Land: beside the front stack (it tumbles as she goes in), in between the stack and the bags. */
  blocks: { at: [BLOCKS.x1 - 0.45, BLOCKS.front + 0.75] as XZ, in: [BLOCKS.x1 - 0.45, BLOCKS.front - 0.5] as XZ },
  /** The Golden Mountain: at the foot of its front-left (she climbs onto the first hold as she goes in), and just at
   *  the cone's foot when she comes back out. */
  mountain: { at: [MOUNTAIN.x - 0.4, MOUNTAIN.z + MOUNTAIN.r + 0.35] as XZ, in: [MOUNTAIN.x - 0.75, MOUNTAIN.z + MOUNTAIN.r - 0.05] as XZ },
  /** Muay Thai: in front of the first bag (she punches it as she goes in), and in between the bags. */
  boxing: { at: [BOXING.bags[0] - 0.7, BOXING.z + 1.1] as XZ, in: [(BOXING.bags[0] + BOXING.bags[1]) / 2, BOXING.z - 0.2] as XZ },
}
export type DoorId = keyof typeof DOORS
/** The ways in that open a mini game. */
export const OPEN_DOORS = ['vet', 'cafe', 'race', 'frame', 'barber', 'blocks', 'mountain', 'boxing'] as const
export type GameDoor = (typeof OPEN_DOORS)[number]

/** Where she stands when she first comes in: in front of Mommy's bench, between the town and the frame. */
export const START: { at: XZ; face: number } = { at: [-3.4, 1.0], face: 0 }

/** What blocks the floor (the shops, the frame, the rides' feet), as rectangles and circles. */
export const BLOCKED: Rect[] = [
  [TOWN.x0 - 0.6, TOWN.x1 + 0.1, -4.6, TOWN.front + 0.15],
  [FRAME.x0 - 0.15, FRAME.x1 + 0.15, -4.6, FRAME.z1 + 0.15],
  [NOSE_MAT[0] - 0.1, NOSE_MAT[1], NOSE_MAT[2] - 0.6, NOSE_MAT[3]],
  [FRAME.x1, LANES.x1, -4.6, -1.2],
  [STEPS.x0, STEPS.x1, -4.6, STEPS.z1 + 0.1],
  [PIT[0] - 0.1, PIT[1] + 0.1, -4.6, PIT[3] + 0.1],
  [MOUNTAIN.x - 0.35, MOUNTAIN.x + 0.35, -0.6, 1.35],
  [BLOCKS.x0, BLOCKS.x1, -4.6, BLOCKS.front + 0.3],
  [BOXING.x0, BOXING.x1, -4.6, -3.4],
  [BENCH.at[0] - 0.85, BENCH.at[0] + 0.85, BENCH.at[1] - 0.4, BENCH.at[1] + 0.35],
]
export const CIRCLES: [number, number, number][] = [
  [MOUNTAIN.x, MOUNTAIN.z, MOUNTAIN.r + 0.15],
  [CROC.at[0], CROC.at[1], 0.55],
  ...BOXING.bags.map((x): [number, number, number] => [x, BOXING.z, 0.45]),
]

/** Where a tap on the floor lands (the mats she can see). */
export const TAP_RECTS: Rect[] = [[HALL[0], HALL[1], -4.4, HALL[3]]]

/** The kids playing in the hall (placeholders): where each one's loop goes, as hops and walks. */
export const FRAME_LOOP: [number, number, number][] = [
  [-3.2, 0, -1.5],
  [-2.6, 1.5, -1.7],
  [-3.1, 1.5, -3.4],
  [-3.1, 3.0, -3.3],
  [1.1, 3.0, -2.6],
  [1.1, 4.5, -3.3],
  [-0.62, 4.5, -1.72],
]
