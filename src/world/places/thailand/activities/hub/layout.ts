// Agong's shophouse in meters: one source of truth for the 3D build, where Kaylee can walk, what she can tap and where
// she goes to use it. Pure data (no three.js): the flat fallback and tests read it too.
//
// Axes: +x is right as seen from the street, +y up, +z toward the street. The house front (the shutter) is at z = 0 and
// the back wall at z = -20.898. Ground floor y 0..3.6, upstairs y 3.6..6.6.
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
   * The U-turn stairs in the left half, opening across the width of the house. Flight 1 (the front lane, zFront..mid)
   * climbs from the foot at x1 toward the left wall, to a landing against it (x0..xLanding); flight 2 (the back lane,
   * mid..zBack) climbs back across and comes out upstairs at x1. Each flight has `steps` treads; the space under
   * flight 2 is closed in.
   */
  stairs: { x0: -3.125, xLanding: -2.225, x1: 0, zFront: -10.6, mid: -11.75, zBack: -12.9, steps: 7 },
  /** Upstairs: the balcony railing at the front edge of the floor (open to the shop below), and the glass wall into
   *  Kaylee's room, with its doorway. */
  hall: { zFront: -7.4, zGlass: -13.4, door0: 1.3, door1: 2.4 },
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
  { id: 'neighbor-left', label: "Neighbor's door", floor: 0, area: 'street', at: [DIM.row[1], 1.5, 0.05], r: 1.3, react: 'jelly' },
  { id: 'neighbor-right', label: "Neighbor's shop", floor: 0, area: 'street', at: [DIM.row[3], 2.7, 0.5], r: 1.1, react: 'jelly' },

  // ---- Downstairs ----
  { id: 'desk', label: "Agong's desk", floor: 0, area: 'inside', at: [2.765, 0.9, -4.2], r: 0.7, react: 'hop', use: { x: 2.225, z: -3.1, face: 150, pose: 'peek' } },
  { id: 'table', label: 'Table', floor: 0, area: 'inside', at: [-2.075, 0.75, -2.6], r: 0.9, react: 'jelly', use: { x: -0.575, z: -2.2, face: -90, pose: 'sit', snap: { x: -1.325, z: -2.2, y: 0.45 } } },
  { id: 'ground-couch', label: 'Grey couch', floor: 0, area: 'inside', at: [-2.7, 0.5, -6.9], r: 0.9, react: 'jelly', use: { x: -1.65, z: -6.9, face: 90, pose: 'sit', snap: { x: -2.6, z: -6.9, y: 0.44 } } },
  { id: 'photos', label: 'Old photos', floor: 0, area: 'inside', at: [DIM.left + 0.05, 2.25, -4.0], r: 0.8, react: 'tilt', use: { x: -0.3, z: -3.0, face: -70, pose: 'lookup' } },
  { id: 'gecko', label: 'Gecko', floor: 0, area: 'inside', at: [DIM.left + 0.04, 3.0, -3.0], r: 0.35, react: 'gecko', moves: true },
  { id: 'clock', label: 'Clock', floor: 0, area: 'inside', at: [DIM.left + 0.05, 2.85, -5.75], r: 0.32, react: 'tick', use: { x: -0.4, z: -5.95, face: -80, pose: 'lookup' } },
  { id: 'fan', label: 'Fan', floor: 0, area: 'inside', at: [1.7, 0.75, -6.2], r: 0.45, react: 'spin', use: { x: 1.7, z: -5.45, face: 180, pose: 'peek' } },
  { id: 'fridge', label: 'Fridge', floor: 0, area: 'inside', at: [2.775, 0.9, -11.75], r: 0.65, react: 'open', use: { x: 2.025, z: -11.75, face: 90, pose: 'peek' } },
  { id: 'altar', label: 'Family altar', floor: 0, area: 'inside', at: [-0.3, 1.35, B + 0.3], r: 0.8, react: 'glow', gentle: true, use: { x: -0.3, z: B + 1.15, face: 180, pose: 'wai' } },
  { id: 'photos-back', label: 'More old photos', floor: 0, area: 'inside', at: [-1.85, 2.95, B + 0.03], r: 0.7, react: 'tilt', use: { x: -1.7, z: B + 1.0, face: 180, pose: 'lookup' } },
  { id: 'shrine', label: 'Little shrine', floor: 0, area: 'inside', at: [0.9, 0.3, B + 0.25], r: 0.4, react: 'glow', gentle: true, use: { x: 0.9, z: B + 1.0, face: 180, pose: 'wai' } },
  { id: 'calendar', label: 'Calendar', floor: 0, area: 'inside', at: [1.95, 2.0, B + 0.03], r: 0.38, react: 'flip', use: { x: 1.5, z: B + 0.85, face: 180, pose: 'lookup' } },
  { id: 'rice-cooker', label: 'Rice cooker', floor: 0, area: 'inside', at: [2.775, 1.0, -18.098], r: 0.4, react: 'puff', use: { x: 2.075, z: -18.098, face: 90, pose: 'peek' } },
  { id: 'doormat', label: 'Go outside', floor: 0, area: 'inside', at: [0, 0.05, -0.6], r: 0.7, react: 'jelly', use: { x: 0.3, z: 1.35, face: 15, pose: 'stand' } },
  { id: 'shoes', label: 'Shoes', floor: 0, area: 'inside', at: [2.825, 0.2, -0.85], r: 0.42, react: 'hop', use: { x: 2.125, z: -0.85, face: 90, pose: 'peek' } },
  { id: 'stairs-up', label: 'Stairs up', floor: 0, area: 'inside', at: [-1.0, 0.9, -11.2], r: 0.8, react: 'stairs' },

  // ---- Upstairs: the hallway, then Kaylee's room at the back ----
  { id: 'stairs-down', label: 'Stairs down', floor: 1, area: 'inside', at: [-0.6, U + 0.3, -12.3], r: 0.75, react: 'stairs' },
  { id: 'plant', label: 'Plant', floor: 1, area: 'inside', at: [2.1, U + 0.4, -7.85], r: 0.35, react: 'jelly', use: { x: 1.4, z: -8.0, face: 90, pose: 'peek' } },
  { id: 'glass-doors', label: 'Glass doors', floor: 1, area: 'inside', at: [1.85, U + 0.8, DIM.hall.zGlass], r: 0.65, react: 'jelly', use: { x: 1.85, z: -16.998, face: 180, pose: 'stand' } },
  { id: 'mattress', label: 'Mattress', floor: 1, area: 'inside', at: [-2.275, U + 0.25, -17.998], r: 1.0, react: 'jelly', use: { x: -1.075, z: -17.998, face: 25, pose: 'bounce', snap: { x: -2.275, z: -17.998, y: 0.22 } } },
  { id: 'pillows', label: 'Pillows', floor: 1, area: 'inside', at: [-2.275, U + 0.35, -20.348], r: 0.55, react: 'puff', use: { x: -1.075, z: -19.548, face: 0, pose: 'lie', snap: { x: -2.275, z: -19.498, y: 0.22 } } },
  { id: 'couch', label: 'Couch', floor: 1, area: 'inside', at: [2.795, U + 0.5, -18.598], r: 0.75, react: 'jelly', use: { x: 1.925, z: -18.098, face: -90, pose: 'sit', snap: { x: 2.725, z: -18.098, y: 0.44 } } },
  { id: 'room-fan', label: 'Fan', floor: 1, area: 'inside', at: [0.4, U + 0.75, -16.798], r: 0.42, react: 'spin', use: { x: 0.4, z: -17.548, face: 0, pose: 'peek' } },
  { id: 'suitcase', label: 'Suitcase', floor: 1, area: 'inside', at: [1.4, U + 0.3, -20.448], r: 0.45, react: 'open', use: { x: 1.4, z: -19.748, face: 180, pose: 'peek' } },
  { id: 'wardrobe', label: 'Wardrobe', floor: 1, area: 'inside', at: [0.25, U + 1.0, B + 0.26], r: 0.7, react: 'open', use: { x: 0.25, z: B + 1.0, face: 180, pose: 'peek' } },
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
      [2.425, DIM.right, -4.9, -3.5], // Agong's desk
      [1.725, 2.325, -4.5, -3.9], // his chair
      [-2.575, -1.575, -3.6, -1.6], // table
      [DIM.left, -2.25, -8.3, -5.5], // grey couch
      [2.425, DIM.right, -12.1, -11.4], // fridge
      [2.575, DIM.right, -1.25, -0.45], // shoes
      [S.x0, S.x1 + 0.05, S.zBack, S.zFront], // stairs
      [-1.0, 0.4, B, B + 0.55], // altar
      [0.65, 1.15, B, B + 0.4], // little shrine
      [2.475, DIM.right, -20.298, -17.298], // kitchen counter
      [-5.4, -3.65, 1.45, 1.95], // motorbike
    ],
    circles: [
      [-2.825, -2.2, 0.17],
      [-2.825, -3.1, 0.17],
      [-1.325, -3.1, 0.17],
      [-2.075, -1.3, 0.17],
      [-2.075, -4.0, 0.17], // stools (the one at -1.325, -2.2 is hers)
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
    bounds: [-3.325, 3.325, -21.098, -7.2],
    carve: [[DIM.left, DIM.right, DIM.back, HALL.zFront]],
    block: [
      [S.x0, S.x1 + 0.05, S.zBack, S.zFront], // stairwell (she comes out of it at the front, along the left wall)
      [DIM.left, HALL.door0, HALL.zGlass - 0.06, HALL.zGlass + 0.06], // the glass wall, left of the doorway
      [HALL.door1, DIM.right, HALL.zGlass - 0.06, HALL.zGlass + 0.06],
      [DIM.left, -1.475, -20.748, -16.448], // mattress row + pillows
      [2.425, DIM.right, -19.798, -17.398], // couch
      [1.05, 1.75, B, -20.198], // suitcase
      [-0.35, 0.85, B, B + 0.55], // wardrobe
    ],
    circles: [
      [0.4, -16.798, 0.2], // fan
      [2.1, -7.85, 0.2], // plant
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
  upstairs: { floor: 1 as const, x: 0.55, z: -12.3, face: 90 },
  family: { floor: 0 as const, x: 1.05, z: 1.75, face: 0 },
}

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
