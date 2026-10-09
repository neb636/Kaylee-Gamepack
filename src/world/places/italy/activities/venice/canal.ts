// Venice greybox: the canal's layout and the boat's feel, in canal units (1 unit = 1 CSS px at scale 1).
// y = 0 is the waterline where the houses stand; negative is up (houses, sky), positive is down (water).
// The canal loops, so every layer repeats after its own period (the house row after CANAL, the rooftops after FAR...).

/** Every feel number in one place (the PR description lists them so Dad can ask for changes). */
export const FEEL = {
  /** How hard the boat chases her finger (spring stiffness) and how much the water holds it back (damping). */
  followK: 34,
  followDamp: 8.5,
  /** Top speed in units per second (a wide screen is ~1200 units across). */
  maxSpeed: 900,
  /** Coasting after she lets go: speed is multiplied by exp(-coastDrag * seconds) (1.1 = half speed in ~0.6 s). */
  coastDrag: 1.1,
  /** Up/down between the two lanes: follow stiffness while dragging, settle stiffness after she lets go. */
  laneFollowK: 26,
  laneSettleK: 12,
  /** Moving backwards faster than this (units/s), with her finger behind the boat, turns it round with a spin.
   *  No turning for turnAfterBump seconds after a post bump (a bounce isn't a turn). */
  turnSpeed: 70,
  turnAfterBump: 0.45,
  /** The happy spin: seconds, number of half-turns (odd, so it ends facing the other way), hop height. The flat boat
   *  never gets thinner than spinMinWidth of its width, so it doesn't vanish mid-turn. */
  spinTime: 0.45,
  spinHalfTurns: 1,
  spinHop: 40,
  spinMinWidth: 0.25,
  /** Bobbing: height (units), speed (radians/s); rocking in degrees; tilt (degrees per unit/s² of acceleration). */
  bob: 6,
  bobSpeed: 2.4,
  rock: 2.5,
  tiltPerAccel: 0.0055,
  maxTilt: 9,
  /** Posts: bounce strength (share of the speed kept), how long her pull is weakened after a bump, post wobble. */
  bounce: 0.7,
  stunTime: 0.32,
  postWobble: 0.08,
  /** Bumping the same post this many times in a row (within 1.5 s) bounces the boat into the other lane, so pushing
   *  into a post slides round it instead of boinging forever. */
  dodgeAfter: 2,
  dodgeKick: 380,
  /** Wake: a foam circle every N units travelled, how long each lives (s); spray droplets above this speed. */
  wakeEvery: 36,
  wakeLife: 1.1,
  sprayAbove: 560,
  /** Camera: it leads the boat by its speed × leadTime (at most maxLead of the screen width), catching up at cameraRate/s.
   *  It leads by speed, not by the way the boat faces, so a finger resting on a still boat never makes it creep. */
  leadTime: 0.3,
  maxLead: 0.25,
  cameraRate: 3.5,
  /** How close (units) the boat must be to a doorstep for a friend to hop in or out: in the lane by the houses at any
   *  speed, or in the front lane when slower than frontBoardSpeed. */
  doorReach: 170,
  frontBoardSpeed: 300,
  /** A new friend pops out of a door this far ahead of the boat (units), in the way it's going. */
  friendAhead: [300, 700],
  /** Squash and stretch strength (bumps, a friend landing, the spin's landing). */
  squash: 0.35,
} as const

/** Parallax: how fast each layer moves compared with the canal (1 = the house row and the boat). */
export const PARALLAX = { clouds: 0.06, far: 0.35, canal: 1, foreground: 1.35, waterBack: 0.85, waterFront: 1.15 } as const

/** The two lanes (boat center y): by the houses and by the front of the water. */
export const LANE = { near: 92, front: 212 } as const
export const LANE_SPLIT = (LANE.near + LANE.front) / 2

/** Water from the waterline to the bottom of the screen, including the stone edge in the foreground. */
export const WATER_H = 330
/** The boat is drawn on a 230×100 grid, scaled up by `scale`. */
export const BOAT = { length: 264, halfLength: 124, scale: 264 / 230 } as const

/** The logical stage: the smallest canal area that must always show (wide screens / tall screens), scaled to fit. */
/** phoneW: very tall screens (phone portrait) zoom in further, so the boat stays big enough to grab. */
export const STAGE = { wideW: 1200, tallW: 760, phoneW: 600, minH: 600 } as const

export interface House {
  x: number
  w: number
  h: number
  color: string
  roof: string
  /** Door position from the house's left edge. */
  door: number
  pink?: boolean
}

const PALETTE = [
  ['#FFE59A', '#E8A25E'],
  ['#FFC6A2', '#D9774E'],
  ['#D7C6F2', '#9C7CC9'],
  ['#BDE6D2', '#6FAE8E'],
  ['#BFE2F6', '#6FA8CF'],
  ['#F5B08C', '#C76A48'],
  ['#FFF1D6', '#D9A877'],
]

/** Widths, heights and gaps of the house row, hand-placed so the street doesn't look regular. Index 6 is the pink house. */
const ROW: [w: number, h: number, gapAfter: number, colorIndex: number, door: number][] = [
  [400, 360, 36, 0, 0.5],
  [340, 430, 24, 2, 0.35],
  [460, 330, 140, 1, 0.62], // a little side canal after this one
  [380, 400, 30, 3, 0.5],
  [420, 450, 28, 4, 0.3],
  [360, 340, 44, 5, 0.55],
  [440, 420, 34, -1, 0.5], // the pink house
  [390, 370, 26, 6, 0.4],
  [350, 460, 120, 0, 0.6],
  [430, 350, 30, 2, 0.45],
  [370, 410, 40, 3, 0.5],
  [450, 380, 36, 1, 0.38],
]

export const HOUSES: House[] = []
let cursor = 0
for (const [w, h, gap, c, door] of ROW) {
  const pink = c < 0
  HOUSES.push({ x: cursor, w, h, color: pink ? '#FF8CC6' : PALETTE[c][0], roof: pink ? '#E0559B' : PALETTE[c][1], door: w * door, pink })
  cursor += w + gap
}
/** Length of the canal before it repeats. */
export const CANAL = cursor
export const PINK = HOUSES.findIndex((h) => h.pink)
export const doorX = (i: number) => HOUSES[i].x + HOUSES[i].door

/** Mooring posts: x along the canal and which lane they stand in. Near-lane posts stand between doors (a post in that
 *  lane shields the doors behind it, so she dodges round through the front lane; see FEEL.dodgeAfter). */
export const POSTS: { x: number; lane: 'near' | 'front' }[] = [
  { x: 820, lane: 'near' },
  { x: 1338, lane: 'front' },
  { x: 2150, lane: 'front' },
  { x: 1763, lane: 'near' },
  { x: 3300, lane: 'front' },
  { x: 3988, lane: 'near' },
  { x: 4700, lane: 'front' },
]

/** Far rooftops and bell towers (period FAR): x, width, height above the waterline, tower or not. */
export const FAR = 2400
export const ROOFTOPS: { x: number; w: number; h: number; tower?: boolean; dome?: boolean }[] = [
  { x: 0, w: 260, h: 520 },
  { x: 230, w: 70, h: 760, tower: true },
  { x: 320, w: 300, h: 560 },
  { x: 600, w: 220, h: 500 },
  { x: 800, w: 260, h: 640, dome: true },
  { x: 1080, w: 280, h: 540 },
  { x: 1340, w: 80, h: 820, tower: true },
  { x: 1440, w: 320, h: 580 },
  { x: 1740, w: 240, h: 520 },
  { x: 1960, w: 220, h: 600, dome: true },
  { x: 2170, w: 230, h: 530 },
]

/** Clouds (period CLOUDS), y measured down from the top of the screen. */
export const CLOUDS = 3000
export const CLOUD_LIST = [
  { x: 120, y: 150, w: 220 },
  { x: 820, y: 230, w: 170 },
  { x: 1500, y: 120, w: 260 },
  { x: 2300, y: 260, w: 190 },
]

/** Foreground stone edge (period FORE): bollards along the near walkway. */
export const FORE = 1500
export const BOLLARDS = [90, 520, 860, 1260]

/** Wrap a distance along a loop of length `period` into [-period/2, period/2). */
export const wrap = (d: number, period: number) => ((((d + period / 2) % period) + period) % period) - period / 2
export const mod = (a: number, n: number) => ((a % n) + n) % n
