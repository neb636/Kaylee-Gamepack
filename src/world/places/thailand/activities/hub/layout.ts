// Agong's shophouse in meters: one source of truth for the 3D build, where Kaylee can walk, what she can tap and where
// she goes to use it. Pure data (no three.js): the flat fallback and tests read it too.
//
// Axes: +x is right as seen from the street, +y up, +z toward the street. The house front (the shutter) is at z = 0 and
// the back wall at z = -13.85. Ground floor y 0..3.6, upstairs (Kaylee's room) y 3.6..6.6.
// Facing is in degrees: 0 = toward the street (and the camera), 180 = toward the back, 90 = toward +x.
import type { Pose } from '../../characters/types'

export const DIM = {
  /** Inside face of the left and right walls. */
  left: -2.05,
  right: 2.05,
  back: -13.85,
  /** Ground floor height, and the top of the upstairs floor. */
  g0: 3.6,
  g1: 3.0,
  /** Sidewalk from the house front to the curb, then the road. */
  curb: 2.6,
  roadFar: 9.6,
  /** The five shophouses in the row (Agong's is the middle one), centers. */
  row: [-8.8, -4.4, 0, 4.4, 8.8],
  houseW: 4.4,
  /** The stairs run along the right wall, from the bottom step (front) up toward the back. */
  stairs: { x0: 1.25, x1: 2.05, zBottom: -8.4, zTop: -12.6, steps: 18 },
}

export type Area = 'street' | 'inside'
export type React = 'jelly' | 'hop' | 'spin' | 'open' | 'tilt' | 'shutter' | 'birds' | 'cat' | 'glow' | 'stairs' | 'beep' | 'toot' | 'puff' | 'tick' | 'flip' | 'wave'

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
  /** Walk there and do this. Things without a use spot just react (she looks at them). */
  use?: UseSpot
}

const U = DIM.g0
export const PICKABLES: Pickable[] = [
  // ---- The street ----
  { id: 'shutter', label: 'Front door', floor: 0, area: 'street', at: [0, 1.4, 0.05], r: 1.4, react: 'shutter', use: { x: 0.1, z: -1.1, face: 180, pose: 'stand' } },
  { id: 'sign', label: 'Shop sign', floor: 0, area: 'street', at: [0, 3.18, 0.3], r: 0.6, react: 'jelly' },
  { id: 'spirit-house', label: 'Spirit house', floor: 0, area: 'street', at: [3.55, 1.55, 0.55], r: 0.55, react: 'glow', gentle: true, use: { x: 3.55, z: 1.35, face: 180, pose: 'wai' } },
  { id: 'motorbike', label: 'Motorbike', floor: 0, area: 'street', at: [-3.7, 0.6, 1.7], r: 0.75, react: 'beep', use: { x: -3.75, z: 1.05, face: 90, pose: 'sit', snap: { x: -3.85, z: 1.7, y: 0.66 } } },
  { id: 'pot-left', label: 'Flower pot', floor: 0, area: 'street', at: [-1.75, 0.45, 0.4], r: 0.42, react: 'jelly', use: { x: -1.75, z: 1.05, face: 180, pose: 'peek' } },
  { id: 'pot-right', label: 'Lime tree', floor: 0, area: 'street', at: [1.75, 0.5, 0.4], r: 0.42, react: 'jelly', use: { x: 1.75, z: 1.05, face: 180, pose: 'peek' } },
  { id: 'basil', label: 'Basil pot', floor: 0, area: 'street', at: [-6.0, 0.35, 0.45], r: 0.38, react: 'jelly', use: { x: -6.0, z: 1.1, face: 180, pose: 'peek' } },
  { id: 'cat', label: 'Sleepy cat', floor: 0, area: 'street', at: [5.45, 0.25, 0.55], r: 0.42, react: 'cat', use: { x: 5.45, z: 1.25, face: 180, pose: 'peek' } },
  { id: 'birds', label: 'Birds', floor: 0, area: 'street', at: [5.2, 5.75, 2.35], r: 0.8, react: 'birds' },
  { id: 'tuk-tuk', label: 'Tuk-tuk', floor: 0, area: 'street', at: [8.3, 0.95, 3.95], r: 1.1, react: 'toot', use: { x: 8.1, z: 2.3, face: 0, pose: 'stand' } },
  { id: 'neighbor-left', label: "Neighbor's door", floor: 0, area: 'street', at: [-4.4, 1.5, 0.05], r: 1.2, react: 'jelly' },
  { id: 'neighbor-right', label: "Neighbor's shop", floor: 0, area: 'street', at: [4.4, 2.7, 0.5], r: 1.0, react: 'jelly' },

  // ---- Downstairs ----
  { id: 'table', label: 'Table', floor: 0, area: 'inside', at: [-1.1, 0.75, -4.45], r: 0.9, react: 'jelly', use: { x: 0.15, z: -4.0, face: -90, pose: 'sit', snap: { x: -0.36, z: -4.0, y: 0.45 } } },
  { id: 'altar', label: 'Family altar', floor: 0, area: 'inside', at: [-1.0, 1.35, -13.55], r: 0.8, react: 'glow', gentle: true, use: { x: -1.0, z: -12.7, face: 180, pose: 'wai' } },
  { id: 'shrine', label: 'Little shrine', floor: 0, area: 'inside', at: [0.2, 0.3, -13.55], r: 0.4, react: 'glow', gentle: true, use: { x: 0.2, z: -12.85, face: 180, pose: 'wai' } },
  { id: 'cabinet', label: 'Treasure cabinet', floor: 0, area: 'inside', at: [-1.82, 1.05, -7.5], r: 0.8, react: 'open', use: { x: -1.2, z: -7.5, face: -90, pose: 'peek' } },
  { id: 'lucky-cat', label: 'Lucky cat', floor: 0, area: 'inside', at: [-1.82, 2.12, -7.0], r: 0.3, react: 'wave', use: { x: -1.2, z: -7.0, face: -90, pose: 'lookup' } },
  { id: 'photos', label: 'Old photos', floor: 0, area: 'inside', at: [-2.0, 2.25, -3.9], r: 0.8, react: 'tilt', use: { x: 0.0, z: -3.0, face: -70, pose: 'lookup' } },
  { id: 'photos-back', label: 'More old photos', floor: 0, area: 'inside', at: [-2.0, 2.2, -10.4], r: 0.75, react: 'tilt', use: { x: -1.15, z: -10.4, face: -90, pose: 'lookup' } },
  { id: 'clock', label: 'Clock', floor: 0, area: 'inside', at: [-2.0, 2.85, -6.4], r: 0.32, react: 'tick', use: { x: -1.2, z: -6.15, face: -90, pose: 'lookup' } },
  { id: 'calendar', label: 'Calendar', floor: 0, area: 'inside', at: [0.75, 2.0, -13.8], r: 0.38, react: 'flip', use: { x: 0.75, z: -12.95, face: 180, pose: 'lookup' } },
  { id: 'fan', label: 'Fan', floor: 0, area: 'inside', at: [0.35, 0.75, -6.7], r: 0.45, react: 'spin', use: { x: 0.35, z: -5.95, face: 180, pose: 'peek' } },
  { id: 'fridge', label: 'Fridge', floor: 0, area: 'inside', at: [1.7, 0.9, -5.7], r: 0.65, react: 'open', use: { x: 0.95, z: -5.7, face: 90, pose: 'peek' } },
  { id: 'doormat', label: 'Go outside', floor: 0, area: 'inside', at: [0, 0.05, -0.6], r: 0.7, react: 'jelly', use: { x: 0.3, z: 1.35, face: 15, pose: 'stand' } },
  { id: 'shoes', label: 'Shoes', floor: 0, area: 'inside', at: [1.75, 0.2, -0.85], r: 0.42, react: 'hop', use: { x: 1.05, z: -0.85, face: 90, pose: 'peek' } },
  { id: 'stairs-up', label: 'Stairs up', floor: 0, area: 'inside', at: [1.65, 1.1, -9.3], r: 0.8, react: 'stairs' },

  // ---- Upstairs: Kaylee's room ----
  { id: 'mattress', label: 'Mattress', floor: 1, area: 'inside', at: [-1.25, U + 0.25, -9.0], r: 1.0, react: 'jelly', use: { x: -0.15, z: -9.0, face: 25, pose: 'bounce', snap: { x: -1.25, z: -9.0, y: 0.22 } } },
  { id: 'pillows', label: 'Pillows', floor: 1, area: 'inside', at: [-1.25, U + 0.35, -12.15], r: 0.55, react: 'puff', use: { x: -0.15, z: -11.4, face: 0, pose: 'lie', snap: { x: -1.25, z: -11.35, y: 0.22 } } },
  { id: 'couch', label: 'Couch', floor: 1, area: 'inside', at: [1.7, U + 0.5, -3.3], r: 0.75, react: 'jelly', use: { x: 0.8, z: -3.25, face: -90, pose: 'sit', snap: { x: 1.6, z: -3.25, y: 0.44 } } },
  { id: 'suitcase', label: 'Suitcase', floor: 1, area: 'inside', at: [-0.05, U + 0.3, -2.7], r: 0.45, react: 'open', use: { x: -0.75, z: -2.7, face: 90, pose: 'peek' } },
  { id: 'wardrobe', label: 'Wardrobe', floor: 1, area: 'inside', at: [-0.3, U + 1.0, -13.55], r: 0.7, react: 'open', use: { x: -0.3, z: -12.85, face: 180, pose: 'peek' } },
  { id: 'room-fan', label: 'Fan', floor: 1, area: 'inside', at: [-0.15, U + 0.75, -5.6], r: 0.42, react: 'spin', use: { x: -0.15, z: -4.85, face: 180, pose: 'peek' } },
  { id: 'balcony', label: 'Balcony', floor: 1, area: 'inside', at: [0, U + 1.15, -0.05], r: 0.95, react: 'open', use: { x: 0, z: 0.32, face: 0, pose: 'peek' } },
  { id: 'plant', label: 'Plant', floor: 1, area: 'inside', at: [1.5, U + 0.4, 0.36], r: 0.35, react: 'jelly', use: { x: 0.95, z: 0.32, face: 90, pose: 'peek' } },
  { id: 'stairs-down', label: 'Stairs down', floor: 1, area: 'inside', at: [1.65, U + 0.3, -11.0], r: 0.75, react: 'stairs' },
]

/** Where she walks on each floor (carved), and what's in the way (blocked). Rects are [x0, x1, z0, z1]. */
type Rect = [number, number, number, number]
type Circle = [number, number, number]
export const NAV: Record<0 | 1, { bounds: Rect; carve: Rect[]; block: Rect[]; circles: Circle[] }> = {
  0: {
    bounds: [-11, 11, -14, 2.8],
    carve: [
      [-10.6, 10.6, 0, DIM.curb - 0.05],
      [DIM.left, DIM.right, DIM.back, 0],
      [-2.0, 2.0, -1, 1],
    ],
    block: [
      [-1.55, -0.65, -5.4, -3.5], // table
      [DIM.left, -1.6, -8.6, -6.4], // treasure cabinet
      [-1.7, -0.3, DIM.back, -13.3], // altar
      [-0.05, 0.45, DIM.back, -13.35], // little shrine
      [1.35, DIM.right, -6.05, -5.35], // fridge
      [1.5, DIM.right, -1.2, -0.45], // shoes
      [DIM.stairs.x0, DIM.right, DIM.stairs.zTop, DIM.stairs.zBottom], // stairs
      [-4.6, -2.85, 1.45, 1.95], // motorbike
    ],
    circles: [
      [-1.85, -4.0, 0.17],
      [-1.85, -4.9, 0.17],
      [-0.36, -4.9, 0.17],
      [-1.1, -3.15, 0.17],
      [-1.1, -5.85, 0.17], // stools (the one at -0.36, -4.0 is hers)
      [0.35, -6.7, 0.2], // fan
      [3.55, 0.5, 0.28], // spirit house
      [-1.75, 0.4, 0.26],
      [1.75, 0.4, 0.26],
      [-6.0, 0.45, 0.24], // pots
      [5.45, 0.55, 0.22], // cat
      [-6.6, 2.35, 0.12],
      [6.6, 2.35, 0.12], // poles
    ],
  },
  1: {
    bounds: [-2.2, 2.2, -14, 1.2],
    carve: [
      [DIM.left, DIM.right, DIM.back, 0],
      [-1.0, 1.0, -1, 1],
      [-1.95, 1.95, 0, 0.66],
    ],
    block: [
      [DIM.left, -0.45, -12.75, -6.2], // mattress row + pillows
      [1.3, DIM.right, -5.3, -2.9], // couch
      [DIM.stairs.x0 - 0.05, DIM.right, DIM.stairs.zTop, DIM.stairs.zBottom], // stairwell
      [-0.3, 0.2, -3.0, -2.4], // suitcase
      [-0.9, 0.3, DIM.back, -13.3], // wardrobe
    ],
    circles: [
      [-0.15, -5.6, 0.2], // fan
      [1.5, 0.36, 0.18], // plant
    ],
  },
}

/** The shutter (while it's down) closes the doorway. */
export const SHUTTER_RECT: Rect = [-2.0, 2.0, -0.08, 0.08]

/** Where each deep-linked spot puts her (meters, floor, facing). */
export const STARTS = {
  arrive: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  street: { floor: 0 as const, x: 0.45, z: 1.55, face: 15 },
  downstairs: { floor: 0 as const, x: 0.35, z: -1.4, face: 140 },
  upstairs: { floor: 1 as const, x: 1.65, z: -13.2, face: 0 },
}

/** Each stair, bottom to top: where she stands on it. */
export function stairSteps(): [number, number, number][] {
  const { zBottom, zTop, steps } = DIM.stairs
  const run = (zBottom - zTop) / steps
  const rise = DIM.g0 / steps
  return Array.from({ length: steps }, (_, i) => [(DIM.stairs.x0 + DIM.right) / 2, rise * (i + 1), zBottom - run * (i + 0.5)])
}
/** The foot of the stairs downstairs, and the landing at the top. */
export const STAIRS_FOOT = { x: 1.65, z: -7.85 }
export const STAIRS_TOP = { x: 1.65, z: -13.2 }
