// Coco's Canyon Glide: the canyon itself, in world units (x to the right, y down; the river is at the bottom).
// One camera for everything: a straight-on side view of a cross-section of Colca Canyon, like a stage. The left and
// right walls are drawn in code in the art's flat style, so where Coco can fly and what she sees are the same shapes.
// The world is about two screens wide and three tall; the camera follows Coco.

export const WORLD = { w: 3000, h: 3000 }
/** The river's surface: Coco skims just above it. */
export const RIVER_Y = 2860
/** How close (world units) Coco's middle may come to a wall, the river or the plateaus. */
export const BODY = 105

/** The visible window on wide and tall screens (world units). Extra screen around it shows more canyon. */
export const STAGE = { wide: { w: 1600, h: 1000 }, tall: { w: 1000, h: 1400 } }

/** The rock faces, from the rim down to the river, as [x, y] points. Ledges are short flat jogs. */
export const LEFT_FACE: [number, number][] = [
  [430, 560],
  [520, 760],
  [565, 980],
  [640, 1180],
  [700, 1420],
  [760, 1598],
  // The nest ledge (Coco and Pluma's home): a shelf that sticks out into the canyon.
  [1030, 1606],
  [1020, 1666],
  [830, 1712],
  [900, 1980],
  [985, 2240],
  [1085, 2480],
  [1185, 2700],
  [1260, 2900],
]
export const RIGHT_FACE: [number, number][] = [
  [2620, 400],
  [2565, 620],
  [2505, 860],
  [2440, 1046],
  // The condor ledge, where Coco's friends rest.
  [2250, 1052],
  [2262, 1110],
  [2420, 1140],
  [2385, 1380],
  [2335, 1620],
  [2268, 1800],
  [2205, 2050],
  [2105, 2300],
  [1985, 2550],
  [1885, 2760],
  [1820, 2900],
]
/** The flat tops beside the canyon: the lookout side (left) and the high ridge (right). */
export const LEFT_RIM = 560
export const RIGHT_RIM = 400

/** x of a face at height y (straight lines between its points; above the rim the plateau's edge). */
function faceAt(face: [number, number][], y: number) {
  if (y <= face[0][1]) return face[0][0]
  for (let i = 1; i < face.length; i++) {
    const [x1, y1] = face[i]
    const [x0, y0] = face[i - 1]
    if (y <= y1) return y1 === y0 ? Math.max(x0, x1) : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0)
  }
  return face[face.length - 1][0]
}
/** Narrowest gap over a band of heights, so a ledge never lets Coco's body through its edge. */
function band(face: [number, number][], y: number, pick: (a: number, b: number) => number) {
  let x = faceAt(face, y)
  for (let d = -BODY; d <= BODY; d += 15) {
    const yy = y + d
    // Above the rim there's no wall (only the plateau, handled by `floorAt`).
    if (yy < face[0][1]) continue
    x = pick(x, faceAt(face, yy))
  }
  return x
}
/** How far left / right Coco's middle can be at height y. */
export const minX = (y: number) => (y + BODY < LEFT_RIM ? BODY : band(LEFT_FACE, y, Math.max) + BODY)
export const maxX = (y: number) => (y + BODY < RIGHT_RIM ? WORLD.w - BODY : band(RIGHT_FACE, y, Math.min) - BODY)
/** The lowest Coco's middle can be at x: over the plateaus, the rim; in the canyon, just above the river. */
export const floorAt = (x: number) => (x < LEFT_FACE[0][0] ? LEFT_RIM - BODY : x > RIGHT_FACE[0][0] ? RIGHT_RIM - BODY : RIVER_Y - BODY - 15)
/** The top of the world (the top bar covers the first ~100 px). */
export const CEILING = 210

/** A column of warm air rising off a sunny rock. */
export interface Swirl {
  id: string
  x: number
  /** Where it starts (a sunny rock) and where it fades out. */
  bottom: number
  top: number
  w: number
  /** Which part of the morning it belongs to: the sun lights the left wall first, then moves to the right wall. */
  when: 'morning' | 'more' | 'follow' | 'afternoon' | 'solo'
}

export const SWIRLS: Swirl[] = [
  // Warm air always rises off the canyon floor somewhere (the river is narrow down there), so a dive to the river can
  // always ride back up. Morning: warm rocks by the river below the nest, and the nest ledge itself.
  { id: 'low', x: 1340, bottom: 2730, top: 1330, w: 330, when: 'morning' },
  { id: 'nest', x: 890, bottom: 1520, top: 330, w: 300, when: 'more' },
  { id: 'river', x: 1620, bottom: 2730, top: 1640, w: 320, when: 'follow' },
  // Later: the sun warms the right wall below the condor ledge.
  { id: 'falls', x: 2040, bottom: 1950, top: 830, w: 300, when: 'follow' },
  // Afternoon: off the condor ledge's sunny top, up to the ridge.
  { id: 'ledge', x: 2330, bottom: 1010, top: 200, w: 290, when: 'afternoon' },
  // Pluma's own swirl, in the middle of the canyon, where the condors circle together.
  { id: 'big', x: 1500, bottom: 2730, top: 640, w: 380, when: 'solo' },
]

/** Places she leads Pluma to (any order), the ridge, and where things live. */
export const PLACES = {
  falls: { x: 2010, y: 2130, r: 270 },
  condors: { x: 2150, y: 930, r: 260 },
  lookout: { x: 470, y: 430, r: 280 },
  ridge: { x: 2780, y: 250, r: 260 },
} as const
export type PlaceId = keyof typeof PLACES

export const NEST = { x: 905, y: 1600 }
export const COCO_START = { x: 1220, y: 1430 }
/** Where the waterfall leaves the right wall. */
export const FALLS_TOP = { x: 2268, y: 1800 }
export const LEDGE_TOP = { x: 2345, y: 1052 }
export const LOOKOUT = { x: 300, y: LEFT_RIM }

/** The flying feel (world units and seconds). Sinking must feel calm, never like falling. */
export const FEEL = {
  /** Fastest sideways glide, and while Pluma is far behind. */
  speed: 560,
  waitSpeed: 190,
  /** Gentle sink in plain air, a bit less while she's pulling him up (big slow flaps that barely help). */
  sink: 75,
  sinkTrying: 40,
  /** Rise in the middle of a swirl. */
  rise: 330,
  /** Fastest dive (finger below him). */
  dive: 640,
  /** How quickly he follows: heavy and graceful. */
  turnX: 2.0,
  turnY: 2.4,
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** How much warm air lifts at (x, y): 0 in plain air, 1 in the middle of a swirl. Fades near its top so he hovers. */
export function liftOf(s: Swirl, on: number, x: number, y: number) {
  if (on <= 0.01) return 0
  const hx = 1 - smooth(s.w * 0.38, s.w * 0.5 + 50, Math.abs(x - s.x))
  const hy = smooth(s.top - 30, s.top + 220, y) * (1 - smooth(s.bottom - 60, s.bottom + 80, y))
  return on * hx * hy
}
