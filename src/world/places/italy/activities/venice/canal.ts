// Venice greybox: the canal's layout and the boat's feel, in canal units (1 unit = 1 CSS px at scale 1).
// y = 0 is the waterline where the houses stand; negative is up (houses, sky), positive is down (water).
// The canal loops, so every layer repeats after its own period (the house row after CANAL, the rooftops after FAR...).

/** Every feel number in one place (the PR description lists them so Dad can ask for changes). */
export const FEEL = {
  /** How hard the boat chases her finger (spring stiffness) and how much the water holds it back (damping). */
  followK: 34,
  followDamp: 8.5,
  /** Top speed in units per second (a wide screen is ~1200 units across). Slow enough that she can stop at a door. */
  maxSpeed: 600,
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
  /** Post hit zone: how much of the boat's half-length counts (the bow and stern tips can overlap a post) and how far
   *  (units) the boat must be from the post's lane to slip past (lanes are 152 apart, so 40 = about a quarter of the way over). */
  postHitLength: 0.78,
  postHitDepth: 40,
  /** Post height above the water (units). Short, so they don't hide the doors behind them. */
  postHeight: 95,
  dodgeAfter: 2,
  dodgeKick: 380,
  /** Wake: a foam circle every N units travelled, how long each lives (s); spray droplets above this speed. */
  wakeEvery: 36,
  wakeLife: 1.1,
  sprayAbove: 380,
  /** Going this fast (units/s) for a moment makes Gino sing "Wheee!". */
  wheeeAbove: 520,
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
export const LANE = { near: 104, front: 256 } as const
export const LANE_SPLIT = (LANE.near + LANE.front) / 2

/** Water from the waterline to the bottom of the screen, including the stone edge in the foreground. */
export const WATER_H = 420
/** Where the stone edge of the near walkway starts (it covers the bottom of the water). */
export const QUAY_Y = WATER_H - 40
/** The boat is drawn on a 230×100 grid, scaled up by `scale`. */
export const BOAT = { length: 264, halfLength: 124, scale: 264 / 230 } as const

/** The logical stage: the smallest canal area that must always show (wide screens / tall screens), scaled to fit. */
/** phoneW: very tall screens (phone portrait) zoom in further, so the boat stays big enough to grab. */
export const STAGE = { wideW: 1200, tallW: 760, phoneW: 600, minH: 690 } as const

/** The house facades (sprites in art.ts): width / height of the picture, and where the door is (share of the width). */
export const FACADES = {
  butter: { aspect: 0.658, door: 0.5 },
  coral: { aspect: 0.65, door: 0.5 },
  lavender: { aspect: 0.582, door: 0.5 },
  maskshop: { aspect: 0.633, door: 0.78 },
  mint: { aspect: 0.652, door: 0.48 },
  peach: { aspect: 0.887, door: 0.5 },
  pink: { aspect: 0.627, door: 0.5 },
  sky: { aspect: 0.662, door: 0.53 },
} as const
export type Facade = keyof typeof FACADES

export interface House {
  facade: Facade
  x: number
  w: number
  h: number
  /** Door position from the house's left edge. */
  door: number
  pink?: boolean
}

/** The street, hand-placed: 8 facades, the plain ones used twice in a different order, never side by side and never
 *  mirrored; the pink house and the mask shop only once. [facade, height, gap after]. Big gaps are side canals. */
/** Width of a side canal gap. */
const SIDE = 300
const ROW: [Facade, number, number][] = [
  ['butter', 480, 8],
  ['coral', 470, 6],
  ['lavender', 500, SIDE],
  ['mint', 440, 10],
  ['peach', 360, 6],
  ['sky', 470, 12],
  ['pink', 480, 8],
  ['lavender', 500, SIDE],
  ['coral', 470, 6],
  ['mint', 440, 10],
  ['maskshop', 450, 8],
  ['butter', 480, 6],
  ['peach', 360, SIDE],
  ['sky', 470, 10],
]

export const HOUSES: House[] = []
/** Side canals between houses (x of the gap's left edge and its width), each with a little bridge seen side-on. */
export const SIDE_CANALS: { x: number; w: number }[] = []
let cursor = 0
for (const [facade, h, gap] of ROW) {
  const w = Math.round(h * FACADES[facade].aspect)
  HOUSES.push({ facade, x: cursor, w, h, door: w * FACADES[facade].door, pink: facade === 'pink' })
  cursor += w
  if (gap > 100) SIDE_CANALS.push({ x: cursor, w: gap })
  cursor += gap
}
/** Length of the canal before it repeats. */
export const CANAL = cursor
export const PINK = HOUSES.findIndex((h) => h.pink)
export const doorX = (i: number) => HOUSES[i].x + HOUSES[i].door

export const MASKSHOP = HOUSES.findIndex((h) => h.facade === 'maskshop')

const mid = (i: number) => Math.round((doorX(i) + doorX(i + 1)) / 2)

/** Mooring posts: x along the canal and which lane they stand in. Near-lane posts stand halfway between two doors (a
 *  post in that lane shields the doors behind it, so she dodges round through the front lane; see FEEL.dodgeAfter). */
const between = mid
/** Few and far apart (about one per screen), so there is room to steer round each one. */
export const POSTS: { x: number; lane: 'near' | 'front' }[] = [
  { x: between(1), lane: 'near' },
  { x: Math.round(CANAL * 0.44), lane: 'front' },
  { x: between(8), lane: 'near' },
  { x: Math.round(CANAL * 0.86), lane: 'front' },
]

/** The far skyline (period FAR): bell towers, a domed church and rooftop clusters, standing on y = -180 (behind the
 *  houses), drawn paler so they sit back. h is the height of the picture. */
export const FAR = 2600
export const SKYLINE: { kind: 'belltower' | 'dome' | 'rooftops'; x: number; h: number }[] = [
  { kind: 'rooftops', x: 0, h: 420 },
  { kind: 'belltower', x: 520, h: 980 },
  { kind: 'dome', x: 700, h: 640 },
  { kind: 'rooftops', x: 1300, h: 380 },
  { kind: 'belltower', x: 2000, h: 860 },
  { kind: 'rooftops', x: 2150, h: 400 },
]

/** Clouds (period CLOUDS), y measured down from the top of the screen. */
export const CLOUDS = 3000
export const CLOUD_LIST = [
  { x: 120, y: 120, w: 300, kind: 1 },
  { x: 820, y: 210, w: 170, kind: 2 },
  { x: 1500, y: 90, w: 340, kind: 1 },
  { x: 2300, y: 240, w: 200, kind: 2 },
]

/** Foreground stone edge (period FORE): bollards along the near walkway. */
export const FORE = 1500
export const BOLLARDS = [90, 520, 860, 1260]

/** Wrap a distance along a loop of length `period` into [-period/2, period/2). */
export const wrap = (d: number, period: number) => ((((d + period / 2) % period) + period) % period) - period / 2
export const mod = (a: number, n: number) => ((a % n) + n) % n

/** The duck family's home on the water (canal x); they paddle after the boat when it goes slowly nearby. */
export const DUCK_HOME = Math.round(CANAL * 0.35)
/** Pigeons on the near walkway (x in the foreground layer) and the winged lion statue. */
export const PIGEONS = [180, 640, 1100]
export const LION_X = 380
