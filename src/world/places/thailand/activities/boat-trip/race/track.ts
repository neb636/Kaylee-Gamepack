// The boat race's course (race.ts): one source of truth in meters, pure math (no three.js), read by the scene, the
// boats, the rivals' driving and the minimap. A closed loop through a lagoon walled in by rock towers, three laps, in
// the shape of a big heart (the minimap shows it: the lobes at the top, the point at the bottom):
//
//          ╭── the Glow Grotto ──╮      ╭── Elephant Beach ──╮
//         ╱  (rock arches,        ╲    ╱  (they spray water   ╲
//        │    glowing crystals)    ╰╮╭╯    over the course)    │
//        │                     the Heart Gate                  │
//        │                     (the dip; beach balls)          │  the Twin Rocks
//    the small ramp                                            │  (the course splits round them)
//         ╲ Dolphin Run (pink dolphins            START ╱
//          ╲ leap beside her)                  grandstand
//           ╲  the BIG JUMP (the hoop)           ╱
//            ╲                                 ╱
//             ╰── the waterfall hairpin ──────╯
//
// She drives up the right side from the start, over the right lobe, through the dip, over the left lobe, down the long
// left side and round the point. Heading 0 faces +z and turns toward +x (like the bay: atan2(dx, dz)). `s` is meters
// along the course from the start line, `lat` meters to the left of the middle (looking along the course; left is the
// island's side, right is the lagoon wall's). The loop's math is the races' shared course (trip/race/course.ts).
import { courseMap, Loop } from '../../../trip/race/course'

export type { Sample } from '../../../trip/race/course'

/** Half the course's usual width (the buoy ropes are just outside). It's wider round the Twin Rocks (halfAt). */
export const HALF = 10
export const LAPS = 3
// The control points, in driving order: the start line first. A heart (the minimap draws z down the screen, so the
// lobes are at -z): up the right side, the right lobe, the dip, the left lobe, down the left side, the point.
const K = 0.945
const POINTS: [number, number][] = (
  [
    [60, 40],
    [78, 8],
    [92, -28],
    [94, -58],
    [80, -84],
    [54, -97],
    [30, -92],
    [15, -76],
    [0, -70],
    [-15, -76],
    [-30, -92],
    [-54, -97],
    [-80, -84],
    [-94, -58],
    [-92, -28],
    [-78, 8],
    [-55, 42],
    [-30, 72],
    [-10, 94],
    [10, 94],
    [30, 72],
  ] as [number, number][]
).map(([x, z]) => [x * K, z * K])

/** The course itself (trip/race/course.ts): sampled every meter round the loop. */
const LOOP = new Loop(POINTS)
export const SAMPLES = LOOP.samples
/** One lap, in meters (about 590: half as long again as the first course). */
export const LENGTH = LOOP.length

/** The middle of the course at `s` (interpolated), and its direction. */
export const sampleAt = (s: number) => LOOP.sampleAt(s)
/** A spot `lat` meters left of the middle at `s`, and the heading along the course there. */
export const spotAt = (s: number, lat = 0) => LOOP.spotAt(s, lat)
/** Where (x, z) is on the course: the nearest sample's index, `s` and `lat`. With `near` (an index), it only looks
 *  within `span` samples of it (a boat on one side of the lagoon never snaps to the course across the island). */
export const locate = (x: number, z: number, near?: number, span = 70) => LOOP.locate(x, z, near, span)
/** How sharply the course turns over the next `ahead` meters from `s` (radians, signed: + = left). */
export const bendAhead = (s: number, ahead = 24) => LOOP.bendAhead(s, ahead)
/** Signed meters from `a` forward to `b` round the loop (-L/2..L/2). */
export const ahead = (a: number, b: number) => LOOP.ahead(a, b)

// ---------------------------------------------------------------- what stands on the course (fractions of a lap)

const at = (f: number) => Math.round(f * LENGTH)
const smooth = (u: number) => u * u * (3 - 2 * u)

/** The Twin Rocks: two rock towers on a sandy islet in the middle of the course, which widens round them so it
 *  splits in two (coins down the left, a boost pad down the right; both the same length). */
export const FORK = { s: at(0.12), half: 14, rock: 6, wide: 16, flare: 18 }

/** Half the course's width at `s` (the ropes' place): wider round the Twin Rocks. */
export function halfAt(s: number) {
  const d = Math.abs(ahead(FORK.s, s)) - FORK.half - 3
  if (d <= 0) return FORK.wide
  if (d >= FORK.flare) return HALF
  return HALF + (FORK.wide - HALF) * smooth(1 - d / FORK.flare)
}
/** How far the Twin Rocks' islet reaches either side of the middle at `s` (0: not there). */
export function rockAt(s: number) {
  const d = ahead(FORK.s, s) / FORK.half
  return Math.abs(d) < 1 ? FORK.rock * Math.sqrt(1 - d * d) : 0
}
/** The middle of one side of the split at `s` (side +1 left, -1 right). */
export function branchLat(s: number, side: number) {
  const r = rockAt(s)
  return side * (r + (halfAt(s) - r) / 2)
}

/** Where the racers start: the two rivals side by side in front, Kaylee just behind them in the middle. */
export const GRID = {
  kids: { s: LENGTH - 6, lat: 4.2 },
  monkey: { s: LENGTH - 6, lat: -4.2 },
  kaylee: { s: LENGTH - 14, lat: 0 },
}
/** Golden arrow pads: drive over one for a burst of speed. */
export const BOOSTS: { s: number; lat: number }[] = [
  { s: FORK.s, lat: branchLat(FORK.s, -1) },
  { s: at(0.68), lat: 3 },
  { s: at(0.71), lat: -3 },
  { s: at(0.935), lat: 0 },
]
export const BOOST_HALF = { across: 2.4, along: 3.4 }
/** The ramps: up and over, a speed burst on landing. The small one at the left lobe's
 *  end; the BIG JUMP across the whole course on the long left side, through a giant flower hoop, with coins in the
 *  air along the way it flies. `kick` is how hard it throws a boat up. */
export interface Ramp {
  s: number
  lat: number
  half: number
  len: number
  lip: number
  kick: number
  big: boolean
}
export const RAMPS: Ramp[] = [
  { s: at(0.58), lat: 0, half: 5, len: 5.5, lip: 2.1, kick: 1, big: false },
  { s: at(0.765), lat: 0, half: HALF - 0.3, len: 8, lip: 3, kick: 1.5, big: true },
]
export const BIG_JUMP = RAMPS[1]
/** The flower hoop she flies through off the big jump (its middle, `s` along, up off the water). */
export const HOOP = { s: BIG_JUMP.s + BIG_JUMP.len / 2 + 9, y: 3.2, r: 8.5 }
/** Lines of coins, along a bit of the course, a little to one side (`air`: up along the big jump's flight). */
export const COIN_LINES: { s: number; lat: number; n: number; air?: boolean }[] = [
  { s: at(0.025), lat: -3.5, n: 5 },
  { s: FORK.s - 7, lat: branchLat(FORK.s, 1), n: 6 },
  { s: at(0.25), lat: 3, n: 5 },
  { s: at(0.4), lat: -2, n: 5 },
  { s: at(0.5), lat: 0, n: 6 },
  { s: at(0.73), lat: 0, n: 5 },
  { s: BIG_JUMP.s + BIG_JUMP.len / 2 + 2, lat: 0, n: 7, air: true },
  { s: at(0.86), lat: 4, n: 5 },
]
/** The Glow Grotto: rock arches one after another over the left lobe, glowing crystals and fireflies under them. */
export const GROTTO = [0.47, 0.485, 0.5, 0.515, 0.53].map(at)
/** The Heart Gate: a pink and white arch at the dip, a big puffy heart floating over it. */
export const HEART_S = at(0.366)
/** Giant beach balls bobbing round the dip: knock them flying. */
export const BALLS: { s: number; lat: number }[] = [
  { s: at(0.34), lat: 4 },
  { s: at(0.35), lat: -4.5 },
  { s: at(0.375), lat: 1.5 },
  { s: at(0.39), lat: -5 },
  { s: at(0.4), lat: 5.5 },
]
/** Elephant Beach: two elephants on the sand outside the right lobe, spraying water over the course. */
export const ELEPHANTS = [at(0.205), at(0.275)].map((s) => ({ s, lat: -(HALF + 9) }))
/** Dolphin Run: pink dolphins leap along beside her, outside the rope, down the long left side. */
export const DOLPHIN_RUN = { from: at(0.6), to: at(0.75) }
/** The big rock with the waterfall, on the inside of the hairpin at the heart's point. */
export const FALLS = (() => {
  const p = spotAt(at(0.866), HALF + 26)
  return { x: p.x, z: p.z, r: 11, h: 44 }
})()
/** The grandstand: floating, beside the start straight on the right (outside the rope). */
export const STAND = (() => {
  const p = spotAt(at(0.035), -(HALF + 9))
  return { x: p.x, z: p.z, heading: p.heading }
})()
/** The podium's floating stage, just past the finish line on the left (across from the grandstand). */
export const PODIUM = (() => {
  const p = spotAt(at(0.03), HALF + 12)
  return { x: p.x, z: p.z, heading: p.heading }
})()

// ---------------------------------------------------------------- the minimap (RaceLayer.tsx)

/** The minimap: the course fitted inside 100 SVG units with a margin, a point in the lagoon on it (x across, z down the
 *  map), and the course's middle as an SVG path. */
export const MAP = courseMap(SAMPLES, HALF + 2, true)
export const mapXY = MAP.xy
