// Agong's shophouse in meters: one source of truth for the 3D build, where Kaylee can walk, what she can tap and where
// she goes to use it. Pure data (no three.js): tests read it too.
//
// Axes: +x is right as seen from the street, +y up, +z toward the street. The house front (the shutter) is at z = 0 and
// the back wall at z = -20.898. Ground floor y 0..3.6, upstairs y 3.6..6.6.
// Facing is in degrees: 0 = toward the street (and the camera), 180 = toward the back, 90 = toward +x.
//
// The plan (Dad, 2026-10-17; the stairs and the divider from his sketch, 2026-10-20): downstairs, Agong's desk against
// the right wall at the front, the table and the couch on the left, then the cabinet divider with a doorway to the
// stairs. The stairs are an L like the real ones: they start toward the back (the foot faces the right wall), climb
// along the wall that hides the kitchen to a landing in the back left corner, then turn and climb forward along the
// left wall, coming out upstairs against it in a small hallway. There's no front room upstairs: the front half is open
// to the shop below, and the hallway looks down into it over a balcony railing. Glass doors lead back into Kaylee's
// room at the back.
//
//   GROUND FLOOR (back)          UPSTAIRS (back)
//  +-----------------+          +-----------------+
//  | photos altar    |          |MATTRESS ac   bath|
//  |    shrine  cook |          |    suitcase gecko|
//  |  kitchen fridge |          |                 |
//  |                 |          |   KAYLEE'S ROOM |
//  |=====wall====    |          |==== glass doors =|
//  |LL <<(1)<<< foot |          |+-+       couch  |
//  |2^               |          ||w|              |
//  |=2^=door=cab=====|          ||w| hallway plant|
//  |2^ top           |          |+-+ top          |
//  | couch       fan |          |=== balcony rail=|
//  | table    Agong D|          |  open: looks    |
//  | table         E |          |  down into the  |
//  |               K |          |  shop below     |
//  +----shutter------+          +---balcony-------+
import type { Pose } from '../../characters/types'

// Inside footprint: 6.25 × 20.898 m (25% wider than the original; 10% shorter than the expanded house). Furniture stays at its original scale.
export const DIM = {
  /** Inside face of the left and right walls. */
  left: -3.125,
  right: 3.125,
  back: -20.898,
  /** Ground floor height, and the top of the upstairs floor. */
  g0: 3.6,
  g1: 3.0,
  /** Sidewalk from the house front to the curb, then the road. */
  curb: 2.6,
  roadFar: 9.6,
  /** The five shophouses in the row (Agong's is the middle one), centers. */
  row: [-11.425, -6.025, 0, 6.025, 11.425],
  houseW: 6.65,
  /**
   * The L-shaped stairs at the back left (Dad's sketch, 2026-10-20). Flight 1 starts toward the back: from the foot at
   * xFoot it climbs toward the left wall along the wall behind the stairs (zLanding..zBack), to a landing in the corner
   * (x0..xLanding); flight 2 turns and climbs forward along the left wall (zLanding..zTop), coming out upstairs against
   * it. Flight 1 has `steps1` treads, flight 2 `steps2`. Flight 1 and the landing are closed in; flight 2 is open underneath. Its back
   * edge (zBack) lines up with the glass wall upstairs. (Dad, 2026-10-20: both flights 40% wider, 1.26 and 1.19 m;
   * flight 1 widened toward the back, so the kitchen got smaller and the front room didn't. Then the room between the
   * divider and the kitchen 25% deeper, 3.73 m: the kitchen wall went back again and both flights got longer, 9 steps.
   * Then the front room 0.5 m bigger, the middle room the same and the kitchen smaller; flight 2 now ends just behind
   * the divider (zTop is its back face), so the divider can go up to the ceiling all the way across. Then both flights
   * 20% wider again, 1.5 and 1.43 m, and the foot in the middle of the room so they take up only its left half: flight 1
   * is shorter than flight 2 now, 6 steps to 9.)
   */
  stairs: { x0: -3.125, xLanding: -1.625, xFoot: 0, zTop: -9.01, zLanding: -11.31, zBack: -12.74, steps1: 6, steps2: 9 },
  /** The wall behind the stairs that hides the kitchen: from the left wall to x1, `t` thick, its front face on the
   *  stairs' back edge. */
  stairWall: { x1: 1.85, t: 0.15 },
  /**
   * The wooden divider between the front room and the stairs, like Agong's real one (Dad's photo, 2026-10-20): a wall
   * of rosewood cabinets, floor to ceiling, centered at `z` and `d` deep, running all the way from the left wall to
   * the right one. Flight 2 of the stairs ends against its back; the doorway (open0..open1) she walks through to the
   * stairs and the back room is just right of them, the rest of the cabinets to its right.
   */
  divider: { z: -8.8, d: 0.42, open0: -1.505, open1: 0.5 },
  /** Upstairs: the balcony railing at the front edge of the floor (open to the shop below), and the glass wall into
   *  Kaylee's room, with its doorway. (Dad, 2026-10-19: stairs, railing and glass all 2.2 m further forward than at
   *  first, so the overlook is smaller and her room bigger.) */
  hall: { zFront: -5.2, zGlass: -12.79, door0: 1.3, door1: 2.4 },
  /** Kaylee's wardrobe (wardrobe.html, greybox 1): against the left wall of her room between the glass doors and the
   *  mattress, its front facing into the room (+x). `z` is its middle, `w` its width along the wall, `d` its depth,
   *  `h` its height. The round rug beside it (toward the mattress, clear of the open door) is where she stands to dress up (`rug`, `r`), facing the camera. */
  wardrobe: { z: -15.15, w: 1.5, d: 0.6, h: 2.05, rug: { x: -1.45, z: -16.3, r: 0.55 } },
}

export type Area = 'street' | 'inside'
export type React = 'jelly' | 'hop' | 'spin' | 'open' | 'tilt' | 'shutter' | 'birds' | 'cat' | 'glow' | 'stairs' | 'beep' | 'toot' | 'puff' | 'tick' | 'flip' | 'wave' | 'gecko' | 'rattle'

export interface UseSpot {
  /** Where she walks to. */
  x: number
  z: number
  face: number
  pose: Pose
  /** Then hops onto this spot (a stool, the mattress, the couch), at this height above her floor. */
  snap?: { x: number; z: number; y: number }
}

export interface Pickable {
  id: string
  /** What it's called (button label, for Dad and for tests). */
  label: string
  floor: 0 | 1
  area: Area
  /** Center of the tap target, world meters. */
  at: [number, number, number]
  /** Radius of the tap target (meters; the button is never smaller than 64 px). */
  r: number
  react: React
  /** Sacred things (the altar, the shrines) only react gently: a glow, a curl of smoke, a soft bell. */
  gentle?: boolean
  /** It moves about (the gecko): its tap target follows it, and `at` is only where it starts. */
  moves?: boolean
  /** Walk there and do this. Things without a use spot just react (she looks at them). */
  use?: UseSpot
}

const U = DIM.g0
const B = DIM.back
export const PICKABLES: Pickable[] = [
  // ---- The street ----
  { id: 'shutter', label: 'Front door', floor: 0, area: 'street', at: [0, 1.4, 0.05], r: 1.6, react: 'shutter', use: { x: 0.1, z: -1.1, face: 180, pose: 'stand' } },
  { id: 'sign', label: 'Shop sign', floor: 0, area: 'street', at: [0, 3.18, 0.3], r: 0.7, react: 'jelly' },
  { id: 'spirit-house', label: 'Spirit house', floor: 0, area: 'street', at: [4.3, 1.55, 0.55], r: 0.55, react: 'glow', gentle: true, use: { x: 4.3, z: 1.35, face: 180, pose: 'wai' } },
  { id: 'motorbike', label: 'Motorbike', floor: 0, area: 'street', at: [-4.5, 0.6, 1.7], r: 0.75, react: 'beep', use: { x: -4.55, z: 1.05, face: 90, pose: 'sit', snap: { x: -4.65, z: 1.7, y: 0.66 } } },
  { id: 'pot-left', label: 'Flower pot', floor: 0, area: 'street', at: [-2.2, 0.45, 0.4], r: 0.42, react: 'jelly', use: { x: -2.2, z: 1.05, face: 180, pose: 'peek' } },
  { id: 'pot-right', label: 'Lime tree', floor: 0, area: 'street', at: [2.2, 0.5, 0.4], r: 0.42, react: 'jelly', use: { x: 2.2, z: 1.05, face: 180, pose: 'peek' } },
  { id: 'basil', label: 'Basil pot', floor: 0, area: 'street', at: [-7.0, 0.35, 0.45], r: 0.38, react: 'jelly', use: { x: -7.0, z: 1.1, face: 180, pose: 'peek' } },
  { id: 'cat', label: 'Sleepy cat', floor: 0, area: 'street', at: [6.4, 0.25, 0.55], r: 0.42, react: 'cat', use: { x: 6.4, z: 1.25, face: 180, pose: 'peek' } },
  { id: 'birds', label: 'Birds', floor: 0, area: 'street', at: [6.3, 5.75, 2.35], r: 0.8, react: 'birds' },
  { id: 'tuk-tuk', label: 'Tuk-tuk', floor: 0, area: 'street', at: [9.8, 0.95, 3.95], r: 1.1, react: 'toot', use: { x: 9.6, z: 2.3, face: 0, pose: 'stand' } },
  { id: 'neighbor-left', label: "Neighbor's door", floor: 0, area: 'street', at: [DIM.row[1], 1.5, 0.05], r: 1.3, react: 'jelly' },
  { id: 'neighbor-right', label: "Neighbor's shop", floor: 0, area: 'street', at: [DIM.row[3], 2.7, 0.5], r: 1.1, react: 'jelly' },

  // ---- Downstairs ----
  { id: 'desk', label: "Agong's desk", floor: 0, area: 'inside', at: [2.765, 0.9, -4.45], r: 0.7, react: 'hop', use: { x: 2.225, z: -3.1, face: 150, pose: 'peek' } },
  { id: 'table', label: 'Table', floor: 0, area: 'inside', at: [-2.075, 0.75, -2.6], r: 1.05, react: 'jelly', use: { x: -0.55, z: -2.0, face: -90, pose: 'sit', snap: { x: -1.3, z: -2.0, y: 0.45 } } },
  { id: 'ground-couch', label: 'Grey couch', floor: 0, area: 'inside', at: [-2.7, 0.5, -6.5], r: 0.9, react: 'jelly', use: { x: -1.65, z: -6.5, face: 90, pose: 'sit', snap: { x: -2.6, z: -6.5, y: 0.44 } } },
  { id: 'photos', label: 'Old photos', floor: 0, area: 'inside', at: [DIM.left + 0.05, 2.45, -4.0], r: 0.95, react: 'tilt', use: { x: -0.3, z: -3.0, face: -70, pose: 'lookup' } },
  { id: 'clock', label: 'Clock', floor: 0, area: 'inside', at: [DIM.left + 0.05, 2.85, -5.75], r: 0.32, react: 'tick', use: { x: -1.3, z: -5.95, face: -80, pose: 'lookup' } },
  { id: 'fan', label: 'Fan', floor: 0, area: 'inside', at: [2.5, 1.15, -5.75], r: 0.5, react: 'spin', use: { x: 1.75, z: -5.3, face: 120, pose: 'peek' } },
  { id: 'fridge', label: 'Fridge', floor: 0, area: 'inside', at: [2.775, 0.9, -15.9], r: 0.65, react: 'open', use: { x: 2.025, z: -15.9, face: 90, pose: 'peek' } },
  { id: 'altar', label: 'Family altar', floor: 0, area: 'inside', at: [-0.3, 1.35, B + 0.3], r: 0.8, react: 'glow', gentle: true, use: { x: -0.3, z: B + 1.15, face: 180, pose: 'wai' } },
  { id: 'photos-back', label: 'More old photos', floor: 0, area: 'inside', at: [-1.85, 2.95, B + 0.03], r: 0.7, react: 'tilt', use: { x: -1.7, z: B + 1.0, face: 180, pose: 'lookup' } },
  { id: 'shrine', label: 'Little shrine', floor: 0, area: 'inside', at: [0.9, 0.3, B + 0.25], r: 0.4, react: 'glow', gentle: true, use: { x: 0.9, z: B + 1.0, face: 180, pose: 'wai' } },
  { id: 'calendar', label: 'Calendar', floor: 0, area: 'inside', at: [1.95, 2.0, B + 0.03], r: 0.38, react: 'flip', use: { x: 1.5, z: B + 0.85, face: 180, pose: 'lookup' } },
  { id: 'rice-cooker', label: 'Rice cooker', floor: 0, area: 'inside', at: [2.775, 1.0, -18.098], r: 0.4, react: 'puff', use: { x: 2.075, z: -18.098, face: 90, pose: 'peek' } },
  { id: 'doormat', label: 'Go outside', floor: 0, area: 'inside', at: [0, 0.05, -0.6], r: 0.7, react: 'jelly', use: { x: 0.3, z: 1.35, face: 15, pose: 'stand' } },
  { id: 'shoes', label: 'Shoes', floor: 0, area: 'inside', at: [2.825, 0.2, -0.85], r: 0.42, react: 'hop', use: { x: 2.125, z: -0.85, face: 90, pose: 'peek' } },
  { id: 'stairs-up', label: 'Stairs up', floor: 0, area: 'inside', at: [-0.8125, 0.7, -12.025], r: 0.9, react: 'stairs' },

  // ---- Upstairs: the hallway, then Kaylee's room at the back ----
  { id: 'stairs-down', label: 'Stairs down', floor: 1, area: 'inside', at: [-2.375, U + 0.2, -9.8], r: 0.7, react: 'stairs' },
  { id: 'plant', label: 'Plant', floor: 1, area: 'inside', at: [2.1, U + 0.4, -5.65], r: 0.35, react: 'jelly', use: { x: 1.4, z: -5.8, face: 90, pose: 'peek' } },
  { id: 'glass-doors', label: 'Glass doors', floor: 1, area: 'inside', at: [1.85, U + 0.8, DIM.hall.zGlass], r: 0.65, react: 'jelly', use: { x: 1.85, z: -16.998, face: 180, pose: 'stand' } },
  { id: 'mattress', label: 'Mattress', floor: 1, area: 'inside', at: [-1.625, U + 0.25, -18.71], r: 1.4, react: 'jelly', use: { x: 0.35, z: -18.25, face: 25, pose: 'bounce', snap: { x: -1.4, z: -18.25, y: 0.22 } } },
  { id: 'pillows', label: 'Pillows', floor: 1, area: 'inside', at: [-2.775, U + 0.35, -18.71], r: 0.7, react: 'puff', use: { x: 0.35, z: -18.15, face: 90, pose: 'lie', snap: { x: -1.925, z: -18.12, y: 0.22 } } },
  { id: 'couch', label: 'Couch', floor: 1, area: 'inside', at: [2.795, U + 0.5, -14.05], r: 0.75, react: 'jelly', use: { x: 1.925, z: -13.55, face: -90, pose: 'sit', snap: { x: 2.725, z: -13.55, y: 0.44 } } },
  { id: 'room-fan', label: 'Fan', floor: 1, area: 'inside', at: [0.4, U + 0.75, -16.798], r: 0.42, react: 'spin', use: { x: 0.4, z: -17.548, face: 0, pose: 'peek' } },
  { id: 'suitcase', label: 'Suitcase', floor: 1, area: 'inside', at: [0.3, U + 0.3, -20.448], r: 0.45, react: 'open', use: { x: 0.3, z: -19.748, face: 180, pose: 'peek' } },
  { id: 'bathroom-door', label: 'Bathroom door', floor: 1, area: 'inside', at: [2.2, U + 1.1, B + 0.06], r: 0.6, react: 'rattle', use: { x: 2.2, z: B + 0.95, face: 180, pose: 'stand' } },
  // The mini-split air conditioner high on the back wall, over the bed: it beeps like the remote.
  { id: 'aircon', label: 'Air conditioner', floor: 1, area: 'inside', at: [-1.0, U + 2.45, B + 0.16], r: 0.6, react: 'beep' },
  // Her wardrobe: the toy (activities/hub/wardrobe/) walks her onto the rug in front of it and opens its doors.
  { id: 'wardrobe', label: 'Wardrobe', floor: 1, area: 'inside', at: [DIM.left + DIM.wardrobe.d / 2, U + 1.05, DIM.wardrobe.z], r: 0.75, react: 'jelly' },
  { id: 'gecko', label: 'Gecko', floor: 1, area: 'inside', at: [0.5, U + 2.3, B + 0.04], r: 0.35, react: 'gecko', moves: true },
]

/** Where she walks on each floor (carved), and what's in the way (blocked). Rects are [x0, x1, z0, z1]. */
type Rect = [number, number, number, number]
type Circle = [number, number, number]
const S = DIM.stairs
const HALL = DIM.hall
export const NAV: Record<0 | 1, { bounds: Rect; carve: Rect[]; block: Rect[]; circles: Circle[] }> = {
  0: {
    bounds: [-13, 13, -21.098, 2.8],
    carve: [
      [-12.6, 12.6, 0, DIM.curb - 0.05],
      [DIM.left, DIM.right, DIM.back, 0],
      [DIM.left + 0.1, DIM.right - 0.1, -1, 1],
    ],
    block: [
      [2.425, DIM.right, -5.25, -3.65], // Agong's desk
      [1.725, 2.325, -4.5, -3.9], // his chair
      [-2.625, -1.525, -3.77, -1.43], // table
      [DIM.left, -2.25, -7.9, -5.1], // grey couch
      [2.425, DIM.right, -16.25, -15.55], // fridge
      [2.575, DIM.right, -1.25, -0.45], // shoes
      [S.x0, S.xLanding + 0.05, S.zBack, S.zTop], // stairs: flight 2 and the landing
      [S.xLanding, S.xFoot + 0.05, S.zBack, S.zLanding], // flight 1
      [DIM.left, DIM.stairWall.x1, S.zBack - DIM.stairWall.t, S.zBack], // the wall behind them
      [DIM.left, DIM.divider.open0, DIM.divider.z - DIM.divider.d / 2, DIM.divider.z + DIM.divider.d / 2], // the divider left of the doorway, under the stairs
      [DIM.divider.open1, DIM.right, DIM.divider.z - DIM.divider.d / 2, DIM.divider.z + DIM.divider.d / 2], // and its cabinets
      [-1.0, 0.4, B, B + 0.55], // altar
      [0.65, 1.15, B, B + 0.4], // little shrine
      [2.475, DIM.right, -20.298, -17.298], // kitchen counter
      [-5.4, -3.65, 1.45, 1.95], // motorbike
    ],
    circles: [
      [-2.85, -2.0, 0.17],
      [-2.85, -3.2, 0.17],
      [-1.3, -3.2, 0.17],
      [-2.075, -1.15, 0.17],
      [-2.075, -4.05, 0.17], // stools (the one at -1.3, -2.0 is hers)
      [2.5, -5.75, 0.28], // fan
      [4.3, 0.5, 0.28], // spirit house
      [-2.2, 0.4, 0.26],
      [2.2, 0.4, 0.26],
      [-7.0, 0.45, 0.24], // pots
      [6.4, 0.55, 0.22], // cat
      [-8.1, 2.35, 0.12],
      [8.1, 2.35, 0.12], // poles
    ],
  },
  1: {
    bounds: [-3.325, 3.325, -21.098, -7.2],
    carve: [[DIM.left, DIM.right, DIM.back, HALL.zFront]],
    block: [
      [S.x0, S.xLanding + 0.05, S.zBack, S.zTop], // stairwell (she comes out of it at the front, along the left wall)
      [DIM.left, HALL.door0, HALL.zGlass - 0.06, HALL.zGlass + 0.06], // the glass wall, left of the doorway
      [HALL.door1, DIM.right, HALL.zGlass - 0.06, HALL.zGlass + 0.06],
      [DIM.left, -0.075, B, -17.47], // the big mattress + pillows (and the gap behind it)
      [2.425, DIM.right, -15.25, -12.85], // couch
      [-0.05, 0.65, B, -20.198], // suitcase
      [DIM.left, DIM.left + DIM.wardrobe.d + 0.05, DIM.wardrobe.z - DIM.wardrobe.w / 2, DIM.wardrobe.z + DIM.wardrobe.w / 2], // her wardrobe
    ],
    circles: [
      [0.4, -16.798, 0.2], // fan
      [2.1, -5.65, 0.2], // plant
      [1.42, B + 0.32, 0.24], // laundry basket
    ],
  },
}

/** The shutter (while it's down) closes the doorway. */
export const SHUTTER_RECT: Rect = [DIM.left + 0.05, DIM.right - 0.05, -0.08, 0.08]

/** Where each deep-linked spot puts her (meters, floor, facing). */
export const STARTS = {
  arrive: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  street: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  downstairs: { floor: 0 as const, x: 0.2, z: -1.3, face: 160 },
  upstairs: { floor: 1 as const, x: -2.2, z: -7.6, face: 135 },
  family: { floor: 0 as const, x: 1.05, z: 1.75, face: 0 },
  /** On the rug in front of her wardrobe, facing the wardrobe's camera (WARDROBE_YAW). */
  wardrobe: { floor: 1 as const, x: DIM.wardrobe.rug.x, z: DIM.wardrobe.rug.z, face: 52 },
}
/** Degrees: where the wardrobe's camera looks from (camera.ts's yaw: from the right, across her room toward the left
 *  wall), and so the way she faces to show off. */
export const WARDROBE_YAW = 52

/** The family photo on the sidewalk in front of Agong's house: grown-ups behind, each kid in front, beside a parent. */
export const PHOTO: { back: string[]; front: [string, number][]; backZ: number; frontZ: number; spacing: number } = {
  back: ['bird', 'joy', 'jum', 'agong', 'ji', 'nick', 'ja', 'sri'],
  front: [
    ['bb', -4.45],
    ['gan', -3.3],
    ['ken', -2.15],
    ['kaylee', 1.15],
    ['putto', 2.3],
    ['putter', 3.45],
  ],
  backZ: 0.75,
  frontZ: 1.75,
  spacing: 1.15,
}

/** Lane centers of the two flights: flight 1 runs along x at z `flight1`, flight 2 along z at x `flight2`. */
export const LANES = { flight1: (S.zLanding + S.zBack) / 2, flight2: (S.x0 + S.xLanding) / 2 }
export const RISE = DIM.g0 / (S.steps1 + S.steps2 + 2)
/** Tread depth of each flight (flight 1 is shorter, so its treads are a little shallower). */
export const RUN1 = (S.xFoot - S.xLanding) / S.steps1
export const RUN2 = (S.zTop - S.zLanding) / S.steps2

/** Where she stands on the way up, bottom to top: flight 1, the landing, flight 2. */
export function stairSteps(): [number, number, number][] {
  const steps: [number, number, number][] = []
  for (let i = 1; i <= S.steps1; i++) steps.push([S.xFoot - RUN1 * (i - 0.5), RISE * i, LANES.flight1])
  const ly = RISE * (S.steps1 + 1)
  steps.push([LANES.flight2, ly, LANES.flight1])
  for (let j = 1; j <= S.steps2; j++) steps.push([LANES.flight2, ly + RISE * j, S.zLanding + RUN2 * (j - 0.5)])
  return steps
}
/** The foot of the stairs downstairs, and where she steps off at the top. */
export const STAIRS_FOOT = { x: S.xFoot + 0.4, z: LANES.flight1 }
export const STAIRS_TOP = { x: LANES.flight2, z: S.zTop + 0.45 }
