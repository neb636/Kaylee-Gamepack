// The Racing Slide at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "★ 3. The Racing Slide"), in
// meters: the four wavy lanes, the steps up, the ball pit at the bottom, and who races where. Pure data (no three.js).
//
// Seen from the bottom (the camera stands past the ball pit and looks up the lanes, toward -z):
//
//        top deck  [flags]  ─ lamps
//   steps ║ lane 1   lane 2   lane 3   lane 4 ║
//   (rail)║ Kaylee   Daddy    Mommy    a kid  ║   each lane: down, up over a bump, down... four bumps
//         ║   ~        ~        ~        ~    ║
//   ──────╚═══════ the pit of pink and white balls ═══════╝   ribbon board · the kid waiting a turn
//                               (camera)

export type V3 = [number, number, number]

/** The four lanes' centers (x), left to right as she sees them. Kaylee's is the first. */
export const LANE_W = 0.86
export const LANES = [-1.5, -0.5, 0.5, 1.5].map((k) => k * LANE_W)

/** The slide: from the top lip (u = 0) to the bottom lip (u = 1), in z and height. */
export const SLIDE = { z0: -9.4, z1: -0.6, y0: 3.0, y1: 0.58, bumps: 4, amp: 0.27 }
export const SLIDE_LEN = SLIDE.z1 - SLIDE.z0

/** The lane floor's height at `u` (0 top .. 1 bottom): a steady drop with four waves on it. */
export function laneY(u: number) {
  return SLIDE.y0 + (SLIDE.y1 - SLIDE.y0) * u - SLIDE.amp * Math.sin(2 * Math.PI * SLIDE.bumps * u)
}
export const laneZ = (u: number) => SLIDE.z0 + SLIDE_LEN * u
/** Rise per meter going down the lane (negative: downhill). */
export function laneSlope(u: number) {
  const e = 1e-3
  return (laneY(Math.min(1, u + e)) - laneY(Math.max(0, u - e))) / ((Math.min(1, u + e) - Math.max(0, u - e)) * SLIDE_LEN)
}

/** Where each bump's crest is (u), worked out from the shape. */
export const CRESTS: number[] = (() => {
  const out: number[] = []
  const n = 800
  for (let i = 1; i < n; i++) {
    const a = laneY((i - 1) / n)
    const b = laneY(i / n)
    const c = laneY((i + 1) / n)
    if (b > a && b >= c) out.push(i / n)
  }
  return out
})()

/** The top deck: where they walk to their lanes and sit. */
export const DECK = { x0: -3.0, x1: 2.1, z0: -10.4, z1: SLIDE.z0, y: SLIDE.y0 }
/** The steps up the left side: a flight of eight, from the floor to the deck. */
export const STEPS = { x: -2.45, w: 0.8, n: 8, rise: SLIDE.y0 / 8, run: 0.42, foot: -6.15 }
/** Where step k (1..n) is: the middle of its top. */
export function stepAt(k: number): V3 {
  return [STEPS.x, k * STEPS.rise, STEPS.foot - (k - 0.5) * STEPS.run]
}
/** Standing at the bottom of the steps, ready to climb. */
export const STEPS_FOOT: V3 = [STEPS.x, 0, STEPS.foot + 0.45]
/** Each tap climbs two steps: four hops to the top. */
export const CLIMB_HOPS = [2, 4, 6, 8]
/** The rail runs up the outside of the steps. */
export const RAIL_X = STEPS.x - STEPS.w / 2 - 0.08

/** The ball pit past the bottom lip. */
export const PIT = { x0: -2.1, x1: 2.1, z0: -0.5, z1: 2.1, surface: 0.42, wall: 0.56 }
/** Landing spots in the pit (z), and how deep they sit in the balls. */
export const LAND_Z = 0.55
export const SINK = 0.2
/** Out of the pit on the left, on the way back to the steps. */
export const PIT_EXIT: V3 = [PIT.x0 - 0.45, 0, 0.3]
/** The others go round the back (past the ribbon board, behind the deck) and come up the hidden back steps. */
export const BACK_PATH: V3[] = [
  [PIT.x1 + 1.45, 0, 0.6],
  [PIT.x1 + 1.45, 0, DECK.z0 - 0.5],
]
export const BACK_TOP: V3 = [DECK.x1 - 0.3, DECK.y, DECK.z0 + 0.25]

/** The ribbon board on the right of the pit, facing her: a ribbon for each race she wins. */
export const BOARD = { x: 2.75, z: -0.9, y: 1.25, w: 0.95, h: 1.15, slots: 6 }
/** The start lights on a pole at the right of the deck. */
export const LAMPS = { x: DECK.x1 - 0.12, z: SLIDE.z0 - 0.35, y: DECK.y + 1.25 }
/** A flag at the top of each lane, above the racers' heads. */
export const FLAG_COLORS = ['#FF4F9A', '#8FE3C8', '#8EC9F5', '#FFC83D']
export const FLAG_H = 2.1

/** The kid not racing waits a turn by the pit, cheering. */
export const CHEER_AT: V3 = [PIT.x1 + 0.5, 0, 1.25]

export type RacerId = 'kaylee' | 'nick' | 'ji' | 'kidA' | 'kidB'
/** Who races in which lane. The two kids take turns in lane 4 (one waits by the pit). */
export const LANE_OF: Record<Exclude<RacerId, 'kidA' | 'kidB'>, number> = { kaylee: 0, nick: 1, ji: 2 }
export const KID_LANE = 3
/** The kid racing in round n (the other one waits). */
export const kidFor = (n: number): 'kidA' | 'kidB' => (n % 2 ? 'kidA' : 'kidB')

/** How each one races beside her: how far ahead they get mid-race, and how far behind they finish (both as a share of
 *  the slide). She always wins, Daddy by a nose. */
export const RIVALS: Record<Exclude<RacerId, 'kaylee'>, { lead: number; nose: number; pitch: number }> = {
  nick: { lead: 0.075, nose: 0.028, pitch: 120 },
  ji: { lead: 0.05, nose: 0.06, pitch: 300 },
  kidA: { lead: 0.09, nose: 0.09, pitch: 400 },
  kidB: { lead: 0.03, nose: 0.11, pitch: 360 },
}

/** The rubber rings (round 3), one color per lane. */
export const RING_COLORS = ['#FF8FB8', '#8FE3C8', '#8EC9F5', '#FBEA9A']

/** How she slides (m/s along the lane): a base speed, more downhill and less uphill, plus what her taps add. */
export const SPEED = { base: 1.0, slope: 1.5, min: 0.8, tap: 0.45, maxBoost: 2.0, decay: 0.9 }
/** Seconds around a crest when a tap makes her fly (before, after), and how slow time runs there (rounds 2 and 3). */
export const WINDOW = { before: 0.38, after: 0.16, slow: [1, 0.55, 0.7] }
/** The flight off a bump: a little hop on her own, a big one with a tap at the crest. */
export const HOP = { small: 0.09, smallDur: 0.32, big: 0.85, bigDur: 0.85 }
