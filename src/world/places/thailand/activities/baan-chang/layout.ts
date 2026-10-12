// Baan Chang Cafe lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens and one
// for tall ones. The camera is a straight-on, eye-level side view. The cafe terrace sits above the elephant yard, so the
// world is two stage-sized scenes stacked with a stairwell between them, and going downstairs pans the camera down.
// Everything here is in stage units.

export type ToolId = 'ice' | 'pot' | 'jug' | 'syrup' | 'spoon' | 'straws'
export type ElephantId = 'mama' | 'baby' | 'auntie'
export type FoodKind = 'banana' | 'cucumber' | 'sugarcane' | 'pineapple' | 'corn' | 'watermelon' | 'slice'

export interface Pt {
  x: number
  y: number
}

export interface ElephantSpot {
  id: ElephantId
  /** Where the feet stand (the ground line is the yard's `ground`). */
  x: number
  /** 1 faces right, -1 faces left. */
  dir: 1 | -1
  /** Size: 1 is a grown-up. */
  s: number
}

export interface Stage {
  tall: boolean
  w: number
  h: number
  /** The yard starts this far below the cafe's top (the stairwell sits in between). */
  yardY: number
  cafe: {
    /** The terrace floor behind the counter (Sparkle, the beanbags and Daddy stand on it). */
    floor: number
    /** The counter top: the glass and the tools stand on it. */
    counter: number
    glass: { x: number; w: number; h: number }
    /** Each tool's home: bottom centre. */
    tools: Record<ToolId, Pt>
    sparkle: Pt & { h: number }
    daddy: Pt
    table: Pt
    beanbags: number[]
    fans: Pt[]
    lamps: Pt[]
    stairs: Pt & { w: number; h: number }
    /** Centre of the straw and cream picker. */
    picker: Pt
  }
  yard: {
    ground: number
    rail: number
    platform: number
    posts: number[]
    elephants: ElephantSpot[]
    /** The food tray's slots (centres). */
    tray: Pt[]
    /** Her chocolate milk, standing on a fence post (bottom centre). */
    milk: Pt
    sparkle: Pt & { h: number }
    palm: Pt
    gecko: Pt
    coconut: Pt
    bird: Pt
    hay: Pt
    shed: Pt & { w: number }
  }
}

const WIDE: Stage = {
  tall: false,
  w: 1600,
  h: 1000,
  yardY: 1600,
  cafe: {
    floor: 660,
    counter: 830,
    glass: { x: 800, w: 170, h: 250 },
    tools: { ice: { x: 300, y: 830 }, pot: { x: 520, y: 830 }, jug: { x: 1090, y: 830 }, syrup: { x: 1250, y: 830 }, spoon: { x: 1390, y: 830 }, straws: { x: 1510, y: 830 } },
    sparkle: { x: 150, y: 660, h: 270 },
    daddy: { x: 1340, y: 660 },
    table: { x: 1150, y: 660 },
    beanbags: [360, 660],
    fans: [
      { x: 450, y: 170 },
      { x: 1150, y: 170 },
    ],
    lamps: [{ x: 800, y: 100 }],
    stairs: { x: 1525, y: 540, w: 150, h: 180 },
    picker: { x: 1080, y: 480 },
  },
  yard: {
    ground: 600,
    rail: 540,
    platform: 780,
    posts: [40, 560, 1000, 1560],
    elephants: [
      { id: 'mama', x: 280, dir: 1, s: 1 },
      { id: 'baby', x: 860, dir: -1, s: 0.6 },
      { id: 'auntie', x: 1290, dir: -1, s: 1 },
    ],
    tray: [330, 520, 710, 900, 1090, 1280].map((x) => ({ x, y: 890 })),
    milk: { x: 640, y: 540 },
    sparkle: { x: 1470, y: 1000, h: 240 },
    palm: { x: 1500, y: 600 },
    gecko: { x: 1500, y: 360 },
    coconut: { x: 1500, y: 140 },
    bird: { x: 70, y: 540 },
    hay: { x: 1040, y: 600 },
    shed: { x: 1350, y: 600, w: 320 },
  },
}

const TALL: Stage = {
  tall: true,
  w: 1000,
  h: 1400,
  yardY: 2000,
  cafe: {
    floor: 800,
    counter: 980,
    glass: { x: 500, w: 170, h: 250 },
    tools: { ice: { x: 120, y: 980 }, pot: { x: 300, y: 980 }, jug: { x: 700, y: 980 }, syrup: { x: 880, y: 980 }, spoon: { x: 330, y: 1310 }, straws: { x: 670, y: 1310 } },
    sparkle: { x: 140, y: 800, h: 250 },
    daddy: { x: 760, y: 800 },
    table: { x: 610, y: 800 },
    beanbags: [330],
    fans: [
      { x: 250, y: 300 },
      { x: 750, y: 300 },
    ],
    lamps: [{ x: 500, y: 240 }],
    stairs: { x: 925, y: 720, w: 130, h: 170 },
    picker: { x: 500, y: 520 },
  },
  yard: {
    ground: 760,
    rail: 700,
    platform: 930,
    posts: [30, 330, 640, 970],
    elephants: [
      { id: 'mama', x: 170, dir: 1, s: 0.8 },
      { id: 'baby', x: 600, dir: -1, s: 0.5 },
      { id: 'auntie', x: 870, dir: -1, s: 0.8 },
    ],
    tray: [
      { x: 220, y: 1060 },
      { x: 440, y: 1060 },
      { x: 660, y: 1060 },
      { x: 220, y: 1240 },
      { x: 440, y: 1240 },
      { x: 660, y: 1240 },
    ],
    milk: { x: 430, y: 700 },
    sparkle: { x: 875, y: 1400, h: 220 },
    palm: { x: 960, y: 760 },
    gecko: { x: 960, y: 470 },
    coconut: { x: 960, y: 250 },
    bird: { x: 300, y: 700 },
    hay: { x: 60, y: 760 },
    shed: { x: 520, y: 760, w: 260 },
  },
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)

// ---- An elephant's body, facing right with its feet at (0, 0), for a grown-up (s = 1). ----
export const BODY = {
  legH: 110,
  body: { x: 0, y: -215, rx: 165, ry: 105 },
  head: { x: 175, y: -250, r: 80 },
  ear: { x: 140, y: -250, rx: 52, ry: 70 },
  eye: { x: 205, y: -272 },
  /** Where the trunk joins the head, and the mouth it brings food to. */
  trunk: { x: 228, y: -220 },
  mouth: { x: 200, y: -190 },
  tail: { x: -160, y: -235 },
  trunkLen: 300,
}

/** A point of an elephant's body in stage units. `bx` is where its feet are right now (the baby wanders). */
export const bodyPt = (e: ElephantSpot, ground: number, p: Pt, bx = e.x): Pt => ({ x: bx + e.dir * p.x * e.s, y: ground + p.y * e.s })
