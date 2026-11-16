// Narwhal Ride's course: one long swim from the floes to the balloon, measured along the way (`s`, meters) and across
// it (`lat`, + to her right). Pure numbers (no three.js): where the channel runs, how wide it is, what floats in it.
// The world (ride.ts) builds what's listed here and moves Nari through it.
import { smoothstep as smooth } from '../../../../../sdk/math'

/** Where the open water ends and the icebergs start. */
export const OPEN_END = 250
/** The row of big icebergs down the middle: a channel either side. */
export const FORK = { from: 336, to: 424, r: 3.8 }
/** Under the sea ice: she dips at `from`, swims `depth` m down under the sheet, and pops up through the hole. */
export const DIVE = { from: 452, to: 549, depth: 3.1, sheetFrom: 461, sheetTo: 566, hole: 554 }
/** Where the glacier's bay starts (its wall runs along the left). */
export const GLACIER = 572
/** The calving: she passes `trig`, and a piece of the wall at `s`, `lat` cracks off. */
export const CALVE = { trig: 604, s: 668, lat: -25 }
/** The balloon's floe, where she pulls up beside it, and the glacier's back wall. */
export const BALLOON = 801
export const DOCK = 790
export const BACK_WALL = 842
/** The glacier's wall is this far to the left. */
export const WALL_LAT = -31

/** The middle of the channel in the world (x), winding a little; straight by the balloon. */
export const cx = (s: number) => 7 * Math.sin(s / 75) * (1 - smooth(690, 780, s))
export const dcx = (s: number) => cx(s + 0.5) - cx(s - 0.5)

/** How far across she can steer either side of the middle. */
export function half(s: number) {
  if (s < OPEN_END) return 13
  if (s < DIVE.from - 8) return 13 - 1.5 * smooth(OPEN_END, OPEN_END + 20, s)
  if (s < DIVE.to + 6) return 11.5 - 3.5 * smooth(DIVE.from - 8, DIVE.from + 6, s)
  return 8 + 4 * smooth(DIVE.to + 6, DIVE.to + 26, s)
}

/** Half the width of the row of icebergs down the middle (0: none here). */
export function ridge(s: number) {
  if (s <= FORK.from || s >= FORK.to) return 0
  return FORK.r * Math.sin((Math.PI * (s - FORK.from)) / (FORK.to - FORK.from)) ** 0.5
}

/** Where Nari swims by herself when nobody steers: the middle, or the middle of the channel she's in. */
export function lane(s: number, lat: number, prefer = 0) {
  if (s > FORK.from - 30 && s < FORK.to) {
    const side = Math.sign(prefer || lat || -1)
    return side * 7.2 * smooth(FORK.from - 30, FORK.from, s) * (1 - smooth(FORK.to - 16, FORK.to, s))
  }
  return 0
}

/** Loose floes to weave between: [s, lat, radius]. A bump is a boing. */
export const FLOES: [number, number, number][] = [
  [42, -5.5, 2.2], [63, 4.5, 2.6], [84, -9, 2], [108, 6.5, 2.4], [124, -4, 2], [141, 9, 2.2], [158, -6.5, 2.6], [182, 1.5, 2], [197, -9.5, 2.2], [213, 8, 2.4], [229, 0.5, 2.1],
  [596, 7, 2.2], [628, -7, 2], [712, 7.5, 2.3], [745, -7, 2.2],
]
/** Tall pointy icebergs to slalom round: [s, lat, size]. */
export const BERGS: [number, number, number][] = [
  [272, -4.5, 2.3], [291, 5, 2.5], [309, -2, 2.3], [323, 7.5, 2.1], [436, 5, 2.1], [443, -5.5, 2.1],
]
/** The big ones down the middle of the fork (they don't move: she slides off them into a channel). */
export const ROW = [347, 362, 380, 398, 413]
/** Keels of ice hanging under the sheet: [s, lat, radius]. */
export const KEELS: [number, number, number][] = [
  [481, 4.2, 1.5], [497, -4.4, 1.6], [513, 3.2, 1.5], [528, -3.4, 1.4],
]
/** Little ramps of ice: [s where it starts, lat, half its width, how high, how long]. */
export const RAMPS: [number, number, number, number, number][] = [
  [94, -0.5, 2.6, 1.0, 5], [170, 5, 2.6, 1.1, 5], [240, -6, 2.6, 1.2, 5.5], [384, 7.2, 2.3, 1.2, 5.5], [583, -2, 2.6, 1.1, 5],
]
/** Schools of little fish: [s, lat]. (The ones under the ice swim down at her depth.) */
export const FISH: [number, number][] = [
  [28, 2], [54, -6], [76, 7], [114, -2], [133, 3], [150, -1.5], [166, -9], [189, 8], [205, -3.5], [222, 4], [246, -1],
  [282, 1], [300, -6.5], [316, 3.5], [356, 7.5], [371, -6.8], [402, 7], [416, -7.2], [438, -0.5],
  [474, -3], [489, 3.5], [505, -0.5], [521, -2], [537, 1],
  [592, 2.5], [702, -3.5], [726, 4], [752, -1.5], [772, 2],
]

/** How high the ramp lifts her here (0: not on one). */
export function rampAt(s: number, lat: number) {
  for (const [s0, l, w, h, len] of RAMPS) if (s >= s0 && s <= s0 + len && Math.abs(lat - l) < w) return (h * (s - s0)) / len
  return 0
}

/** Things to poke along the way: where each one is ([s, lat]). */
export const SPOTS = {
  walrus: [70, 17.6],
  puffins: [146, -17.2],
  seal: [220, 16.6],
  fizz: [318, -9.5],
  blue: [372, -17.2],
  belugas: [
    [366, -9.8],
    [392, -10.6],
  ],
  orca: [330, 24],
} as const
