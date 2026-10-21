// Muay Thai at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "7. Muay Thai bags"), in meters:
// the blue mat, the ropes, the bags on their beam, the coach's drum, where Kaylee, Daddy and the coach stand, the
// pokeables, and the numbers each round needs. Pure data (no three.js).
//
// Seen straight on (the camera looks toward -z), left to right:
//
//   back:   ║ ropes ══════ [board: 3 stars, the lamps] ═══════════ beam ════ ║
//           ║  coach                                    │                     ║ ropes down
//   mat:    ║  [drum]   (small bag)        Kaylee →  [ BAG ]  Daddy           ║ the right side
//   front:  [bottle on its stool]                                            [post + bell]
export type V3 = [number, number, number]
export type Round = 1 | 2 | 3

/** Kaylee stands in the middle, facing the bag on her right (and turning to Daddy's pad in round 3). The bag is a little
 *  nearer the camera than she is, so she punches it three-quarters on (her face shows). */
export const KAYLEE = { x: 0, z: 0.05 }
/** The big bag: hanging on its chain from the beam, its body from `y0` to `y1`. Swings about the beam. */
export const BAG = { x: 0.62, z: 0.42, pivot: 2.05, y0: 0.32, y1: 1.24, r: 0.24 }
/** The second, smaller bag at the back left (the coach shows a kick on it). */
export const BAG2 = { x: -0.95, z: -0.85, pivot: 2.05, y0: 0.62, y1: 1.3, r: 0.17 }
/** The beam the bags hang from, across the back. */
export const BEAM = { x0: -1.3, x1: 1.15, y: 2.3, z: -0.32 }
/** Daddy holding the bag from behind it (rounds 1 and 2), facing it (and her). */
export const DADDY_BAG = { x: 1.32, z: 0.2, face: -74 }
/** Round 3: where Daddy holds the pad, on her left and on her right (where the bag was: he swings it back onto its
 *  hook first), and the pad's heights. He always faces her. */
export const PAD_SIDES = { left: { x: -0.86, z: 0.3 }, right: { x: 1.08, z: 0.42 } }
/** The big bag hooked back out of the way in round 3 (radians, swung back toward the wall). */
export const BAG_HOOK = 1.05
export const PAD_Y = { high: 0.86, mid: 0.62, low: 0.42 }
/** The pad's path in round 3: left high, left low, right high, right low, the middle; then the kick (on the right). */
export const PAD_STEPS: { side: 'left' | 'right'; y: keyof typeof PAD_Y }[] = [
  { side: 'left', y: 'high' },
  { side: 'left', y: 'low' },
  { side: 'right', y: 'high' },
  { side: 'right', y: 'low' },
  { side: 'left', y: 'mid' },
  { side: 'right', y: 'mid' },
]
/** How far in front of Daddy the pad is held. */
export const PAD_OUT = 0.5
export const PAD = { w: 0.42, h: 0.52, d: 0.16 }

/** The coach: beside her for the wai kru (both facing out, like a dance class), then behind his drum at the back left. On a tall screen everything on the
 *  left comes in a little (so the drum stays on screen). */
export const COACH_WAI = { x: -0.95, z: 0.1, face: 25 }
export const DRUM = { x: -1.72, z: -0.42, r: 0.29, h: 0.5 }
export const TALL_SHIFT = 0.42
/** He stands behind the drum, facing out. */
export const COACH_DRUM = { dz: -0.44 }

/** The ring: posts at the back corners and the front right, three ropes (red, white, blue) along the back and down the
 *  right side. Daddy bounces into the right side. */
export const POSTS: [number, number][] = [
  [-2.3, -1.25],
  [1.95, -1.25],
  [1.95, 1.15],
]
export const ROPE_Y = [0.42, 0.78, 1.14]
export const ROPE_COLORS = ['#FF6F6F', '#FFFFFF', '#5D7BB0']
export const POST_H = 1.32
/** The ring bell on the front right post. */
export const BELL = { x: 1.8, y: 1.5, z: 1.17 }
/** The water bottle on a little stool at the front left. */
export const BOTTLE = { x: -1.95, z: 0.95, stool: 0.42 }
/** The board on the back wall: three stars, and the lamps that fill in each round. */
export const BOARD = { x: -0.17, y: 2.0, z: -1.55, w: 1.2, h: 0.62 }
export const MAT = { x0: -2.5, x1: 2.15, z0: -1.4, z1: 1.35 }
export const WALL_Z = -1.7

/** What each round needs: round 1 punches, round 2 punches on the beat (it ends after `max` punches anyway), round 3
 *  pad hits (then the kick). */
export const NEED: Record<Round, number> = { 1: 8, 2: 6, 3: PAD_STEPS.length }
export const ROUND2_MAX = 16
/** Round 1: the drum joins in after this many punches. */
export const DRUM_JOINS = 3
/** The wai kru: three bows, then three dance steps. */
export const BOWS = 3
export const STEPS = 3

/** Pixels: the POW pops up this far above the hit. */
export const POW_LIFT = 30
