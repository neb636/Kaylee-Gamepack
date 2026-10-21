// The Golden Mountain at HarborLand (plan: planning/around-the-world/thailand/mall-trip.md, "5. The Golden Mountain"),
// in meters: the yellow cone, its climbing holds for each round, the bell on top, the steel slide down the front, the
// mat it lands on, where Daddy and the monkeys are. Pure data (no three.js), shared by the 3D world and the flat
// version.
//
// Seen straight on (the camera looks toward -z), the cone's front faces us. Angles go round the cone: 0 faces the
// camera, negative is to the left. Kaylee climbs the front-left, the slide comes down the front a little right of the
// middle, Daddy climbs the right flank in round 3.
//
//              🔔  ┌red rail┐ 🐒
//               ╱ ● ● ●  ║   ● ╲          painted wall: kids riding elephants
//         🐒  ╱ ●  ●   ● ║  ●    ╲ 🐒
//            ╱  ● ●  ●   ║ ●      ╲   Daddy (rounds 1-2 watching; round 3 up the right)
//   ────────╱─Kaylee──────╲═══ steel slide ══▶ mat ─────────────
export type Round = 1 | 2 | 3

/** The cone: its middle, its radius at the floor and at the flat top, and the top's height. */
export const CONE = { x: 0, z: -1.6, r0: 2.5, rt: 1.05, top: 3.0 }
/** The cone's radius at height y. */
export const rAt = (y: number) => CONE.r0 - (CONE.r0 - CONE.rt) * Math.min(1, Math.max(0, y / CONE.top))
/** A point on the cone's surface at angle `a` and height `y`, `out` meters off it (negative: in from the top's rim). */
export function onCone(a: number, y: number, out = 0): [number, number, number] {
  const r = rAt(y) + out
  return [CONE.x + Math.sin(a) * r, y, CONE.z + Math.cos(a) * r]
}

export type HoldColor = 'pink' | 'yellow' | 'blue' | 'mint' | 'lilac'
export const HOLD_COLORS: Record<HoldColor, string> = { pink: '#FF5FA2', yellow: '#FFE45C', blue: '#6FB8F2', mint: '#5FD6AE', lilac: '#B79BF2' }
const RAINBOW: HoldColor[] = ['pink', 'yellow', 'mint', 'blue', 'lilac']

export interface Hold {
  /** Its index in the round's list (her tap target is `hold:<i>`). */
  i: number
  a: number
  y: number
  row: number
  color: HoldColor
}

/** How far she can reach sideways to the next row (m, round the cone). */
export const REACH = 0.95
/** Where her hands are when she stands at the foot (she reaches the first row from there). */
export const FOOT_Y = 0.15

/** Each round's holds on her side: rows of [angle, color]. */
const ROWS: Record<Round, { y0: number; dy: number; rows: [number, HoldColor][][] }> = {
  // 1. Holds in a line: five straight up, a rainbow.
  1: { y0: 0.75, dy: 0.5, rows: [0, 1, 2, 3, 4].map((i) => [[-0.45, RAINBOW[i]]]) },
  // 2. Only the pink ones: two pinks a row (left or right), the rest silly.
  2: {
    y0: 0.75,
    dy: 0.4,
    rows: [
      [[-0.85, 'pink'], [-0.5, 'blue'], [-0.15, 'pink'], [0.12, 'yellow']],
      [[-0.95, 'yellow'], [-0.62, 'pink'], [-0.3, 'mint'], [0.02, 'pink']],
      [[-0.85, 'pink'], [-0.5, 'yellow'], [-0.17, 'pink'], [0.12, 'blue']],
      [[-0.95, 'blue'], [-0.6, 'pink'], [-0.25, 'mint'], [0.08, 'pink']],
      [[-0.85, 'pink'], [-0.42, 'yellow'], [0.0, 'pink']],
      [[-0.85, 'mint'], [-0.4, 'pink'], [0.05, 'pink']],
    ],
  },
  // 3. Race Daddy: seven rows, two or three in reach, any color.
  3: {
    y0: 0.75,
    dy: 0.335,
    rows: [
      [[-0.75, 'pink'], [-0.3, 'mint']],
      [[-0.95, 'yellow'], [-0.5, 'blue'], [-0.08, 'lilac']],
      [[-0.72, 'mint'], [-0.28, 'pink']],
      [[-0.92, 'lilac'], [-0.5, 'yellow'], [-0.08, 'blue']],
      [[-0.7, 'pink'], [-0.28, 'mint']],
      [[-0.85, 'blue'], [-0.42, 'lilac'], [0.0, 'yellow']],
      [[-0.62, 'pink'], [-0.15, 'mint']],
    ],
  },
}

/** A round's holds on her side, in rows from the bottom. */
export function holdsFor(round: Round): Hold[] {
  const r = ROWS[round]
  const out: Hold[] = []
  r.rows.forEach((row, ri) => row.forEach(([a, color]) => out.push({ i: out.length, a, y: r.y0 + r.dy * ri, row: ri, color })))
  return out
}
export const rowsIn = (round: Round) => ROWS[round].rows.length
/** Where she stands at the foot of her side, each round. */
export const FOOT_A: Record<Round, number> = { 1: -0.45, 2: -0.5, 3: -0.5 }

/** Can she reach hold `h` from where her hands are (angle `a`, row `row`; -1 on the floor)? Only the next row. */
export function inReach(h: Hold, a: number, row: number) {
  return h.row === row + 1 && Math.abs(h.a - a) * rAt(h.y) <= REACH + 1e-6
}

/** Round 3: Daddy's holds up the right flank, one a row (a zigzag), the same rows as hers. */
export function daddyHolds(): Hold[] {
  const r = ROWS[3]
  return r.rows.map((_, ri) => ({ i: ri, a: ri % 2 ? 0.98 : 0.84, y: r.y0 + r.dy * ri, row: ri, color: RAINBOW[(ri + 2) % 5] }))
}
export const DADDY_FOOT_A = 0.9
/** Daddy watching from the floor at the right in rounds 1 and 2. */
export const DADDY_WATCH = { a: 1.0, out: 1.0 }

/** The slide comes down the front here (angle), and runs out onto the mat. */
export const SLIDE_A = 0.34
/** The steel slide's path (where she sits), top to bottom: down the cone's face, then out across the floor. */
export function slidePath(): [number, number, number][] {
  const a = SLIDE_A
  const pts: [number, number, number][] = []
  for (const y of [CONE.top + 0.04, 2.3, 1.5, 0.75]) pts.push(onCone(a, y, y > CONE.top - 0.01 ? -0.12 : 0.12))
  pts.push(onCone(a, 0, 0.55).map((v, i) => (i === 1 ? 0.24 : v)) as [number, number, number])
  pts.push(onCone(a, 0, 1.35).map((v, i) => (i === 1 ? 0.2 : v)) as [number, number, number])
  return pts
}
/** Where she lands off the end of the slide (the mat). */
export const LAND = onCone(SLIDE_A, 0, 2.1).map((v, i) => (i === 1 ? 0 : v)) as [number, number, number]
export const MAT = { at: onCone(SLIDE_A, 0, 2.0), w: 1.5, d: 1.3 }

/** The bell on top: a red post with a little roof, the bell under it, a rope she pulls. */
export const BELL = { x: CONE.x - 0.1, z: CONE.z - 0.25, y: CONE.top + 1.25 }
/** Where she stands to pull the rope. */
export const ROPE_AT: [number, number] = [BELL.x - 0.24, BELL.z + 0.22]

/** The three Lopburi monkeys: at the foot (on a rock), on a ledge halfway up the right, on the top rail. */
export const MONKEYS: { at: [number, number, number]; face: number }[] = [
  { at: [onCone(-1.2, 0, 0.75)[0], 0.32, onCone(-1.2, 0, 0.75)[2]], face: 0.6 },
  { at: onCone(0.62, 1.75, 0.12), face: 0.62 },
  { at: [CONE.x + 0.62, CONE.top + 0.5, CONE.z + 0.62], face: 0.3 },
]

/** The flags on the top rail, one a round (at the back, so they show over the bell). */
export const FLAG_A = [2.45, Math.PI, -2.45]

/** The painted wall behind: two elephants with kids riding (their trunks go up when tapped). */
export const WALL_Z = -4.6
export const ELEPHANTS = [
  { x: -3.6, y: 1.75, dir: 1, color: '#FF8FB8' },
  { x: 3.7, y: 1.95, dir: -1, color: '#8EC9F5' },
]

/** The pattern bands round the cone (heights). */
export const BANDS = [0.45, 1.35, 2.25]

/** Pixels: how far her finger pulls down for a whole pull (a tap does it all at once). */
export const PULL_PX = 70
