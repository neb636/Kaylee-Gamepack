// Agong's shophouse in meters: one source of truth for the 3D build, where Kaylee can walk, what she can tap and where
// she goes to use it. Pure data (no three.js): the flat fallback and tests read it too.
//
// Axes: +x is right as seen from the street, +y up, +z toward the street. The house front (the shutter) is at z = 0 and
// the back wall at z = -17.2. Ground floor y 0..3.6, upstairs y 3.6..6.6.
// Facing is in degrees: 0 = toward the street (and the camera), 180 = toward the back, 90 = toward +x.
//
// The plan (Dad, 2026-10-17): downstairs, Agong's desk against the right wall at the front, the table on the left,
// and the stairs at the back left. They're U-turn stairs like the real ones, filling the left half of the house and
// opening across its width (she steps on walking toward the left wall). Upstairs they come out in a small hallway. There's no front room: the front half is open to the shop below,
// and the hallway looks down into it over a balcony railing. Glass doors lead back into Kaylee's room at the back.
//
//   GROUND FLOOR (back)          UPSTAIRS (back)
//  +-----------------+          +-----------------+
//  | photos altar    |          |m  KAYLEE'S ROOM |
//  |    shrine  cook |          |a          couch |
//  |                 |          |t     suitcase   |
//  |+-------+ fridge |          |==== glass doors =|
//  ||L (2) >>> top   |          |+-------+  top   |
//  ||L               |          || well  |        |
//  ||L (1) <<< foot  |          |+-------+ hallway|
//  |+-------+        |          |          plant  |
//  | cabinet     fan |          |=== balcony rail=|
//  | table    Agong D|          |  open: looks    |
//  | table         E |          |  down into the  |
//  |               K |          |  shop below     |
//  +----shutter------+          +---balcony-------+
import type { Pose } from '../../characters/types'

export const DIM = {
  /** Inside face of the left and right walls. */
  left: -2.5,
  right: 2.5,
  back: -17.2,
  /** Ground floor height, and the top of the upstairs floor. */
  g0: 3.6,
  g1: 3.0,
  /** Sidewalk from the house front to the curb, then the road. */
  curb: 2.6,
  roadFar: 9.6,
  /** The five shophouses in the row (Agong's is the middle one), centers. */
  row: [-10.8, -5.4, 0, 5.4, 10.8],
  houseW: 5.4,
  /**
   * The U-turn stairs in the left half, opening across the width of the house. Flight 1 (the front lane, zFront..mid)
   * climbs from the foot at x1 toward the left wall, to a landing against it (x0..xLanding); flight 2 (the back lane,
   * mid..zBack) climbs back across and comes out upstairs at x1. Each flight has `steps` treads; the space under
   * flight 2 is closed in.
   */
  stairs: { x0: -2.5, xLanding: -1.6, x1: 0.1, zFront: -9.6, mid: -10.75, zBack: -11.9, steps: 7 },
  /** Upstairs: the balcony railing at the front edge of the floor (open to the shop below), and the glass wall into
   *  Kaylee's room, with its doorway. */
  hall: { zFront: -7.4, zGlass: -12.4, door0: 1.3, door1: 2.4 },
}

export type Area = 'street' | 'inside'
export type React = 'jelly' | 'hop' | 'spin' | 'open' | 'tilt' | 'shutter' | 'birds' | 'cat' | 'glow' | 'stairs' | 'beep' | 'toot' | 'puff' | 'tick' | 'flip' | 'wave' | 'gecko'

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
  { id: 'neighbor-left', label: "Neighbor's door", floor: 0, area: 'street', at: [-5.4, 1.5, 0.05], r: 1.3, react: 'jelly' },
  { id: 'neighbor-right', label: "Neighbor's shop", floor: 0, area: 'street', at: [5.4, 2.7, 0.5], r: 1.1, react: 'jelly' },

  // ---- Downstairs ----
  { id: 'desk', label: "Agong's desk", floor: 0, area: 'inside', at: [2.14, 0.9, -2.6], r: 0.7, react: 'hop', use: { x: 1.6, z: -1.5, face: 150, pose: 'peek' } },
  { id: 'table', label: 'Table', floor: 0, area: 'inside', at: [-1.45, 0.75, -4.4], r: 0.9, react: 'jelly', use: { x: 0.05, z: -4.0, face: -90, pose: 'sit', snap: { x: -0.7, z: -4.0, y: 0.45 } } },
  { id: 'photos', label: 'Old photos', floor: 0, area: 'inside', at: [-2.45, 2.25, -4.0], r: 0.8, react: 'tilt', use: { x: -0.3, z: -3.0, face: -70, pose: 'lookup' } },
  { id: 'gecko', label: 'Gecko', floor: 0, area: 'inside', at: [-2.46, 3.0, -3.0], r: 0.35, react: 'gecko', moves: true },
  { id: 'clock', label: 'Clock', floor: 0, area: 'inside', at: [-2.45, 2.85, -5.75], r: 0.32, react: 'tick', use: { x: -0.4, z: -5.95, face: -80, pose: 'lookup' } },
  { id: 'cabinet', label: 'Treasure cabinet', floor: 0, area: 'inside', at: [-2.28, 1.05, -7.2], r: 0.8, react: 'open', use: { x: -1.6, z: -7.2, face: -90, pose: 'peek' } },
  { id: 'lucky-cat', label: 'Lucky cat', floor: 0, area: 'inside', at: [-2.28, 2.12, -6.7], r: 0.3, react: 'wave', use: { x: -1.6, z: -6.6, face: -90, pose: 'lookup' } },
  { id: 'fan', label: 'Fan', floor: 0, area: 'inside', at: [1.7, 0.75, -6.2], r: 0.45, react: 'spin', use: { x: 1.7, z: -5.45, face: 180, pose: 'peek' } },
  { id: 'fridge', label: 'Fridge', floor: 0, area: 'inside', at: [2.15, 0.9, -11.75], r: 0.65, react: 'open', use: { x: 1.4, z: -11.75, face: 90, pose: 'peek' } },
  { id: 'altar', label: 'Family altar', floor: 0, area: 'inside', at: [-0.3, 1.35, B + 0.3], r: 0.8, react: 'glow', gentle: true, use: { x: -0.3, z: B + 1.15, face: 180, pose: 'wai' } },
  { id: 'photos-back', label: 'More old photos', floor: 0, area: 'inside', at: [-1.85, 2.95, B + 0.03], r: 0.7, react: 'tilt', use: { x: -1.7, z: B + 1.0, face: 180, pose: 'lookup' } },
  { id: 'shrine', label: 'Little shrine', floor: 0, area: 'inside', at: [0.9, 0.3, B + 0.25], r: 0.4, react: 'glow', gentle: true, use: { x: 0.9, z: B + 1.0, face: 180, pose: 'wai' } },
  { id: 'calendar', label: 'Calendar', floor: 0, area: 'inside', at: [1.95, 2.0, B + 0.03], r: 0.38, react: 'flip', use: { x: 1.5, z: B + 0.85, face: 180, pose: 'lookup' } },
  { id: 'rice-cooker', label: 'Rice cooker', floor: 0, area: 'inside', at: [2.15, 1.0, -14.4], r: 0.4, react: 'puff', use: { x: 1.45, z: -14.4, face: 90, pose: 'peek' } },
  { id: 'doormat', label: 'Go outside', floor: 0, area: 'inside', at: [0, 0.05, -0.6], r: 0.7, react: 'jelly', use: { x: 0.3, z: 1.35, face: 15, pose: 'stand' } },
  { id: 'shoes', label: 'Shoes', floor: 0, area: 'inside', at: [2.2, 0.2, -0.85], r: 0.42, react: 'hop', use: { x: 1.5, z: -0.85, face: 90, pose: 'peek' } },
  { id: 'stairs-up', label: 'Stairs up', floor: 0, area: 'inside', at: [-0.9, 0.9, -10.2], r: 0.8, react: 'stairs' },

  // ---- Upstairs: the hallway, then Kaylee's room at the back ----
  { id: 'stairs-down', label: 'Stairs down', floor: 1, area: 'inside', at: [-0.5, U + 0.3, -11.3], r: 0.75, react: 'stairs' },
  { id: 'plant', label: 'Plant', floor: 1, area: 'inside', at: [2.1, U + 0.4, -7.85], r: 0.35, react: 'jelly', use: { x: 1.4, z: -8.0, face: 90, pose: 'peek' } },
  { id: 'glass-doors', label: 'Glass doors', floor: 1, area: 'inside', at: [1.85, U + 0.8, DIM.hall.zGlass], r: 0.65, react: 'jelly', use: { x: 1.85, z: -13.3, face: 180, pose: 'stand' } },
  { id: 'mattress', label: 'Mattress', floor: 1, area: 'inside', at: [-1.65, U + 0.25, -14.3], r: 1.0, react: 'jelly', use: { x: -0.45, z: -14.3, face: 25, pose: 'bounce', snap: { x: -1.65, z: -14.3, y: 0.22 } } },
  { id: 'pillows', label: 'Pillows', floor: 1, area: 'inside', at: [-1.65, U + 0.35, -16.65], r: 0.55, react: 'puff', use: { x: -0.45, z: -15.85, face: 0, pose: 'lie', snap: { x: -1.65, z: -15.8, y: 0.22 } } },
  { id: 'couch', label: 'Couch', floor: 1, area: 'inside', at: [2.17, U + 0.5, -14.9], r: 0.75, react: 'jelly', use: { x: 1.3, z: -14.4, face: -90, pose: 'sit', snap: { x: 2.1, z: -14.4, y: 0.44 } } },
  { id: 'room-fan', label: 'Fan', floor: 1, area: 'inside', at: [0.4, U + 0.75, -13.1], r: 0.42, react: 'spin', use: { x: 0.4, z: -13.85, face: 0, pose: 'peek' } },
  { id: 'suitcase', label: 'Suitcase', floor: 1, area: 'inside', at: [1.4, U + 0.3, -16.75], r: 0.45, react: 'open', use: { x: 1.4, z: -16.05, face: 180, pose: 'peek' } },
  { id: 'wardrobe', label: 'Wardrobe', floor: 1, area: 'inside', at: [0.25, U + 1.0, B + 0.26], r: 0.7, react: 'open', use: { x: 0.25, z: B + 1.0, face: 180, pose: 'peek' } },
]

/** Where she walks on each floor (carved), and what's in the way (blocked). Rects are [x0, x1, z0, z1]. */
type Rect = [number, number, number, number]
type Circle = [number, number, number]
const S = DIM.stairs
const HALL = DIM.hall
export const NAV: Record<0 | 1, { bounds: Rect; carve: Rect[]; block: Rect[]; circles: Circle[] }> = {
  0: {
    bounds: [-13, 13, -17.4, 2.8],
    carve: [
      [-12.6, 12.6, 0, DIM.curb - 0.05],
      [DIM.left, DIM.right, DIM.back, 0],
      [-2.4, 2.4, -1, 1],
    ],
    block: [
      [1.8, DIM.right, -3.3, -1.9], // Agong's desk
      [1.1, 1.7, -2.9, -2.3], // his chair
      [-1.95, -0.95, -5.4, -3.4], // table
      [DIM.left, -2.05, -8.35, -6.05], // treasure cabinet
      [1.8, DIM.right, -12.1, -11.4], // fridge
      [1.95, DIM.right, -1.25, -0.45], // shoes
      [S.x0, S.x1 + 0.05, S.zBack, S.zFront], // stairs
      [-1.0, 0.4, B, B + 0.55], // altar
      [0.65, 1.15, B, B + 0.4], // little shrine
      [1.85, DIM.right, -16.6, -13.6], // kitchen counter
      [-5.4, -3.65, 1.45, 1.95], // motorbike
    ],
    circles: [
      [-2.2, -4.0, 0.17],
      [-2.2, -4.9, 0.17],
      [-0.7, -4.9, 0.17],
      [-1.45, -3.1, 0.17],
      [-1.45, -5.8, 0.17], // stools (the one at -0.7, -4.0 is hers)
      [1.7, -6.2, 0.2], // fan
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
    bounds: [-2.7, 2.7, -17.4, -7.2],
    carve: [[DIM.left, DIM.right, DIM.back, HALL.zFront]],
    block: [
      [S.x0, S.x1 + 0.05, S.zBack, S.zFront], // stairwell (she comes out of it at the front, along the left wall)
      [DIM.left, HALL.door0, HALL.zGlass - 0.06, HALL.zGlass + 0.06], // the glass wall, left of the doorway
      [HALL.door1, DIM.right, HALL.zGlass - 0.06, HALL.zGlass + 0.06],
      [DIM.left, -0.85, -17.05, -12.75], // mattress row + pillows
      [1.8, DIM.right, -16.1, -13.7], // couch
      [1.05, 1.75, B, -16.5], // suitcase
      [-0.35, 0.85, B, B + 0.55], // wardrobe
    ],
    circles: [
      [0.4, -13.1, 0.2], // fan
      [2.1, -7.85, 0.2], // plant
    ],
  },
}

/** The shutter (while it's down) closes the doorway. */
export const SHUTTER_RECT: Rect = [-2.45, 2.45, -0.08, 0.08]

/** Where each deep-linked spot puts her (meters, floor, facing). */
export const STARTS = {
  arrive: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  street: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  downstairs: { floor: 0 as const, x: 0.2, z: -1.3, face: 160 },
  upstairs: { floor: 1 as const, x: 0.55, z: -11.3, face: 90 },
  family: { floor: 0 as const, x: 1.05, z: 1.75, face: 0 },
}

/** The family photo on the sidewalk in front of Agong's house: grown-ups behind, each kid in front, beside a parent. */
export const PHOTO: { back: string[]; front: [string, number][]; backZ: number; frontZ: number; spacing: number } = {
  back: ['bert', 'joy', 'jum', 'agong', 'ji', 'nick', 'ja', 'sri'],
  front: [
    ['bibi', -4.45],
    ['gun', -3.3],
    ['khane', -2.15],
    ['kaylee', 1.15],
    ['pato', 2.3],
    ['putter', 3.45],
  ],
  backZ: 0.75,
  frontZ: 1.75,
  spacing: 1.15,
}

/** Lane centers of the two flights. */
export const LANES = { up1: (S.zFront + S.mid) / 2, up2: (S.mid + S.zBack) / 2 }
export const RISE = DIM.g0 / (2 * S.steps + 2)
export const RUN = (S.x1 - S.xLanding) / S.steps

/** Where she stands on the way up, bottom to top: flight 1, across the landing, flight 2. */
export function stairSteps(): [number, number, number][] {
  const steps: [number, number, number][] = []
  for (let i = 1; i <= S.steps; i++) steps.push([S.x1 - RUN * (i - 0.5), RISE * i, LANES.up1])
  const ly = RISE * (S.steps + 1)
  const lx = (S.x0 + S.xLanding) / 2
  steps.push([lx, ly, LANES.up1], [lx, ly, LANES.up2])
  for (let j = 1; j <= S.steps; j++) steps.push([S.xLanding + RUN * (j - 0.5), ly + RISE * j, LANES.up2])
  return steps
}
/** The foot of the stairs downstairs, and where she steps off at the top. */
export const STAIRS_FOOT = { x: S.x1 + 0.4, z: LANES.up1 }
export const STAIRS_TOP = { x: S.x1 + 0.45, z: LANES.up2 }
