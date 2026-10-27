// Penguin Slide's one course, as data in meters (the build, the slide and the camera all read it). It runs down the
// world's -z: `s` is how far down (z = -s), `lat` is across, measured from the valley's middle line `cx(s)` (+ = +x).
// Antarctica is land: a valley of ice falling all the way to the sea.
//
//   s 0..TOP_END       the gentle slope: wide ice, Adélie penguins to slide past, three little rollers at the end
//   TOP_END..EDGE      bumps and cracks: snow mounds, a rock ridge splitting two runs (moguls left, a big kicker right),
//                      then a lip and a crack across the whole slope
//   EDGE               the ice cliff: off he goes, into the sea
//   EDGE..DIVE_END     under the sea: krill swarms, a leopard seal who wants to play
//   SHELF..            the colony's ice, where Pebble waits
// Plain numbers, no three.js.

export const TOP_END = 230
export const RIDGE = { from: 290, to: 420, half: 2.4 }
/** The left run's moguls and the right run's big kicker. */
export const MOGULS = { from: 312, to: 404, amp: 0.34, wave: 6.5 }
export const KICKER = { s: 362, len: 9, h: 1.6 }
/** The lip before the crack (m long, m high) and the crack across the slope. */
export const LIP = { len: 6, h: 0.75 }
export const CRACK = { at: 470, w: 2.6 }
export const EDGE = 545
/** The cliff's top above the sea. */
export const CLIFF = 5
export const DIVE_END = 830
/** The colony's ice: where it starts, its top above the sea, and where Pebble stands. */
export const SHELF = 838
export const SHELF_Y = 1
export const HOME = 850

/** The valley's middle line (x, m): gentle bends to steer round. */
export const cx = (s: number) => 5 * Math.sin(s / 42) + 2 * Math.sin(s / 17 + 1)
export const dcx = (s: number) => (5 / 42) * Math.cos(s / 42) + (2 / 17) * Math.cos(s / 17 + 1)

const smooth = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
/** A soft bump, 1 in the middle, 0 at ±1 and beyond. */
const bump = (k: number) => (Math.abs(k) >= 1 ? 0 : (Math.cos(Math.PI * k) + 1) / 2)

/** The valley floor's height (m above the sea): steeper once the bumps begin, CLIFF at the edge. */
export function base(s: number) {
  if (s >= TOP_END) return CLIFF + (EDGE - s) * 0.2
  return CLIFF + (EDGE - TOP_END) * 0.2 + (TOP_END - s) * 0.15
}

/** How wide the rock between the two runs is here (half, m; 0 where there's none). Its nose and tail taper. */
export function ridge(s: number) {
  const k = (s - RIDGE.from) / (RIDGE.to - RIDGE.from)
  if (k <= 0 || k >= 1) return 0
  return RIDGE.half * smooth(Math.min(k * 6, (1 - k) * 7))
}
/** Half the width of the slidable ice (m): it widens round the ridge so each run is still roomy. */
export const half = (s: number) => 7 + 2.6 * (ridge(s) / RIDGE.half)

/** Where he settles when nobody steers: the middle, or the middle of whichever run he's in. */
export function lane(s: number, lat: number) {
  const r = ridge(s)
  if (!r) return 0
  return Math.sign(lat || 1) * (r + (half(s) - r) / 2)
}

/** Snow mounds she can steer into for a hop: s, lat, radius, height. */
export const MOUNDS: [number, number, number, number][] = [
  [248, -3, 2.4, 0.9],
  [258, 3.5, 2.4, 0.9],
  [270, 0, 2.6, 1.1],
  [280, -4.5, 2.2, 0.8],
  [432, -2.5, 2.4, 1],
  [441, 3, 2.4, 1],
  [452, 0, 2.6, 1.1],
  [494, 2.5, 2.4, 1],
  [506, -3, 2.4, 1],
  [518, 1, 2.6, 1.2],
  [530, -1.5, 2.2, 0.9],
]
/** The top's little rollers right across, a taste of the bumps to come: s, half length, height. */
export const ROLLERS: [number, number, number][] = [
  [186, 4, 0.4],
  [202, 4, 0.5],
  [216, 4, 0.6],
]

/** The bumps on the ice here (m added to the floor). */
export function bumps(s: number, lat: number) {
  let h = 0
  for (const [rs, len, rh] of ROLLERS) h += rh * bump((s - rs) / len)
  for (const [ms, ml, r, mh] of MOUNDS) {
    const d = Math.hypot(s - ms, lat - ml) / r
    if (d < 1) h += mh * bump(d)
  }
  const r = ridge(s)
  if (r > 0 && lat < -r && s > MOGULS.from && s < MOGULS.to) {
    const fade = smooth(Math.min((s - MOGULS.from) / 6, (MOGULS.to - s) / 6))
    h += fade * MOGULS.amp * (1 - Math.cos((2 * Math.PI * (s - MOGULS.from)) / MOGULS.wave))
  }
  if (r > 0 && lat > r) {
    // Up the kicker, then it stops short: off he flies.
    const k = (s - KICKER.s) / KICKER.len
    if (k >= 0 && k < 1) h += KICKER.h * k ** 1.6 * smooth(Math.min(1, (lat - r) / 1.2))
  }
  const lip = (s - (CRACK.at - CRACK.w / 2 - LIP.len)) / LIP.len
  if (lip >= 0 && lip < 1) h += LIP.h * lip ** 1.5
  return h
}

/** True over the crack. */
export const inCrack = (s: number) => Math.abs(s - CRACK.at) < CRACK.w / 2

/** The ice's height under a spot (m above the sea; past the edge, far below: the sea). */
export function ground(s: number, lat: number) {
  if (s > EDGE) return -50
  let h = base(s)
  const a = Math.abs(lat)
  const hw = half(s)
  // The snowbanks along the sides, then the valley's walls going up and up.
  if (a > hw) {
    const e = a - hw
    h += e < 3 ? 1.4 * smooth(e / 3) : 1.4 + 9 * smooth((e - 3) / 18)
  }
  if (inCrack(s) && a < hw + 4) return base(s) - 3.5
  return h + bumps(s, lat)
}

/** The gentle up-and-down he swims at under the sea (m, below the surface). */
export const depth = (s: number) => -2.5 + 0.6 * Math.sin(s / 11)

/** Adélie penguins standing on the slope (s, lat): they hop aside, squawk, or spin like tops when he bumps them. */
export const ADELIES: [number, number][] = [
  [40, -2],
  [42, -3.3],
  [72, 3],
  [104, 0],
  [105.5, 1.3],
  [138, -4],
  [160, 2.5],
  [161, 3.8],
  [236, -1],
  [440, 0.5],
]

/** Krill swarms under the sea: s, lat, how far they drift side to side (m; later ones move). */
export const KRILL: [number, number, number][] = [
  [EDGE + 28, 0, 0],
  [EDGE + 44, -3, 0],
  [EDGE + 60, 3, 0],
  [EDGE + 75, 4.5, 0],
  [EDGE + 92, -1.5, 0],
  [EDGE + 108, -4.5, 0],
  [EDGE + 124, 1, 1],
  [EDGE + 140, 4, 1.5],
  [EDGE + 155, -3, 1.5],
  [EDGE + 170, 0, 2.5],
  [EDGE + 186, 3.5, 2],
  [EDGE + 202, -4, 2],
  [EDGE + 218, -1, 3],
  [EDGE + 234, 3, 3],
  [EDGE + 250, 0, 3.5],
  [EDGE + 266, -3, 3],
]
/** Where the leopard seal plays alongside him (s). */
export const SEAL = { from: EDGE + 70, to: EDGE + 200 }
