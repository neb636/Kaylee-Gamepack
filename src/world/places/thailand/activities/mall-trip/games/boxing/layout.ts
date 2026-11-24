// Muay Thai at HarborLand, in meters: the blue mat, the ropes, the bags on their brackets, the coach's drum, where
// Kaylee and Dad stand for the bout, the pokeables, and the numbers each round needs. Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   back:   ║ ropes ══════ [board: 3 stars, the lamps] ══════ (big bag) ══ ║
//           ║  coach                                                       ║ ropes down
//   mat:    ║  [drum]   (small bag)     Kaylee →   ← Dad  ...pushed back → ║ the right side
//   front:  [bottle on its stool]                                          [post + bell]
export type V3 = [number, number, number]
export type Round = 1 | 2 | 3

/** Kaylee stands left of the middle, Dad on her right. */
export const KAYLEE = { x: -0.5, z: 0.2 }
/** Dad in the bout: where he bounces on his toes (`x`), how far her punches can push him back (`rope`: the ropes on
 *  the right take him there and boing him back in), where a knocked-down Dad is slung back to (`land`), and how high his feet go in the air, however she bounces him
 *  (`ceil`: he stays on screen). */
export const DAD = { x: 0.42, z: 0.3, rope: 1.5, land: 0.75, ceil: 1.0 }
/** The big bag: hanging on its chain at the back right, out of the bout's way (a poke swings it). */
export const BAG = { x: 1.2, z: -0.85, pivot: 2.05, y0: 0.5, y1: 1.34, r: 0.22 }
/** The second, smaller bag at the back left (the coach shows a kick on it). */
export const BAG2 = { x: -0.95, z: -0.85, pivot: 2.05, y0: 0.62, y1: 1.3, r: 0.17 }
/** The coach: beside her for the wai kru (both facing out, like a dance class), then behind his drum at the back left. On a tall screen everything on the
 *  left comes in a little (so the drum stays on screen). */
export const COACH_WAI = { x: -1.2, z: 0.3, face: 35 }
export const DRUM = { x: -1.5, z: -0.42, r: 0.29, h: 0.5 }
export const TALL_SHIFT = 0.42
/** He stands behind the drum, facing out. */
export const COACH_DRUM = { dz: -0.44 }

/** The ring: posts at the back corners and the front right, three ropes (red, white, blue) along the back and down the
 *  right side. Dad bounces into the right side. */
export const POSTS: [number, number][] = [
  [-2.05, -1.25],
  [1.95, -1.25],
  [1.95, 1.15],
]
export const ROPE_Y = [0.42, 0.78, 1.14]
export const ROPE_COLORS = ['#FF6F6F', '#FFFFFF', '#5D7BB0']
export const POST_H = 1.32
/** The ring bell on the front right post. */
export const BELL = { x: 1.8, y: 1.5, z: 1.17 }
/** The water bottle on a little stool at the front left. */
export const BOTTLE = { x: -1.72, z: 0.95, stool: 0.42 }
/** The board on the back wall: three stars, and the lamps that fill in each round. */
export const BOARD = { x: -0.17, y: 2.0, z: -1.55, w: 1.2, h: 0.62 }
export const MAT = { x0: -2.25, x1: 2.15, z0: -1.4, z1: 1.35 }
export const WALL_Z = -1.7

/** Hits that fill the super punch in each round (a plain hit is one; a hit on a dizzy Dad is two, one on his mitts
 *  less than one). Round 1 is short so the first knock-down comes soon. */
export const NEED: Record<Round, number> = { 1: 14, 2: 22, 3: 28 }
/** After the belt (the toy goes on): hits for each super punch. */
export const NEED_FREE = 18
/** The coach counts a knocked-down Dad out: nueng, song, saam. */
export const COUNT = 3

/** Pixels: the POW pops up this far above the hit. */
export const POW_LIFT = 30
