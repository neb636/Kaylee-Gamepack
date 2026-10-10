// Snow on a Volcano: the trail up Mount Etna and Nino's feel, in mountain units (1 unit = 1 CSS px at scale 1).
// x runs from the beach (left) up to the snowy top (right). y is screen-like: 0 is the beach, negative is up.
// One camera for everything: straight-on side view, the trail is the ground line everything stands on.

/** Every feel number in one place (the PR description lists them so Dad can ask for changes). */
export const FEEL = {
  /** How hard Nino chases her finger (spring stiffness) and how much he holds back (damping). */
  followK: 30,
  followDamp: 8,
  /** Top speed on flat ground (units/s). Uphill he is slower (heavier), downhill faster. */
  maxSpeed: 560,
  /** Uphill: top speed is divided by (1 + uphill × slope). Downhill (a full cart rolling): multiplied by downhillBoost. */
  uphill: 2.2,
  downhillBoost: 1.55,
  /** Deep snow slows him a little. */
  snowSpeed: 0.85,
  /** A donkey doesn't coast: when she lets go he stops quickly (speed × exp(-stopDrag × s)). */
  stopDrag: 7,
  /** Pulling the other way faster than this turns him round (with a hop); the cart swings round behind him. */
  turnSpeed: 60,
  /** The cart follows its hitch spot behind him on a spring. */
  cartK: 40,
  cartDamp: 11,
  /** Distance (units) from Nino's center to the cart's center. */
  cartGap: 205,
  /** How far apart his steps are (units per full leg cycle). */
  stride: 150,
  /** Camera: leads him by speed × leadTime (at most maxLead of the screen width), catching up at cameraRate/s. */
  leadTime: 0.35,
  maxLead: 0.22,
  cameraRate: 3.2,
  /** Where the ground under Nino sits on the screen (share of the height from the top). */
  groundAt: 0.66,
  /** Going this fast for a moment: "Wheee!" */
  wheeeAbove: 640,
  /** How close (units) Nino's nose must come to a drift to scoop it. */
  driftReach: 70,
} as const

/** The logical stage: how many units fit across (wide / tall / phone-tall screens) and the least height that fits. */
export const STAGE = { wideW: 1350, tallW: 860, phoneW: 680, minH: 760 } as const

/** Where Nino can walk (his center x). */
export const X_MIN = 330
export const X_MAX = 6230
export const START_X = 420

/** The trail's shape: control points [x, y] joined by smooth curves. Flat bits are where the stream and the snow field are. */
const PTS: [number, number][] = [
  [-1600, 150],
  [-760, 150],
  [-380, 0],
  [760, 0],
  [1050, -40],
  [2350, -330],
  [2880, -470],
  [3220, -470],
  [3750, -630],
  [4850, -990],
  [5050, -1030],
  [6250, -1180],
  [6420, -1240],
  [6720, -1560],
  [7400, -1600],
]

/** Ground height (y) at x. */
export function ground(x: number) {
  if (x <= PTS[0][0]) return PTS[0][1]
  for (let i = 1; i < PTS.length; i++) {
    const [x1, y1] = PTS[i]
    if (x <= x1) {
      const [x0, y0] = PTS[i - 1]
      const p = (x - x0) / (x1 - x0)
      const s = p * p * (3 - 2 * p)
      return y0 + (y1 - y0) * s
    }
  }
  return PTS[PTS.length - 1][1]
}
/** Slope dy/dx at x (negative = going up to the right). */
export const slope = (x: number) => (ground(x + 6) - ground(x - 6)) / 12

export const WORLD = { left: -1500, right: 7300 } as const

/** The zones along the trail, by x where each one starts. Their top colors paint the ground. */
export const ZONES = [
  { id: 'beach', from: -1600, top: '#F6DFA8', shade: '#EBC98A', deep: '#E9C48C' },
  { id: 'grove', from: 820, top: '#9ACB6A', shade: '#86B85C', deep: '#C98B5B' },
  { id: 'forest', from: 2420, top: '#6FB36A', shade: '#5D9E5C', deep: '#A9744E' },
  { id: 'lava', from: 3720, top: '#77707F', shade: '#625B6B', deep: '#4F4858' },
  { id: 'snow', from: 4850, top: '#EEF5FF', shade: '#D6E2F7', deep: '#4F4858' },
] as const
export type ZoneId = (typeof ZONES)[number]['id']
export const zoneAt = (x: number): ZoneId => {
  let z: ZoneId = 'beach'
  for (const zone of ZONES) if (x >= zone.from) z = zone.id
  return z
}

/** How hot it is at x: 1 = beach heat, 0 = snow cold (higher is colder). */
export const warmth = (x: number) => Math.max(0, Math.min(1, (4400 - x) / 2900))
/** How hard it snows at x (0..1). */
export const snowfall = (x: number) => Math.max(0, Math.min(1, (x - 4150) / 700))

/** The stream in the forest (Nino splashes through it). */
export const STREAM = { from: 2960, to: 3120 } as const
/** The beach ends here: coming back down past it with a full cart, they've arrived. */
export const BEACH_END = 760
/** The granita stand on the beach, and the sea beyond it. */
export const STAND_X = -150
/** The sea's surface (y) and where the water starts (it covers the ground to the left of this). */
export const SEA_Y = 40
export const SEA_X = -470

/** Things along the trail (x = where each stands). */
export const TREES = [
  { kind: 'lemon', x: 1180, fruit: 'lemon' },
  { kind: 'lemon', x: 1600, fruit: 'orange' },
  { kind: 'lemon', x: 2030, fruit: 'lemon' },
  { kind: 'chestnut', x: 2560 },
  { kind: 'chestnut', x: 2800 },
  { kind: 'chestnut', x: 3420 },
  { kind: 'pine', x: 4980 },
  { kind: 'pine', x: 5440 },
  { kind: 'pine', x: 5920 },
] as const
export const CACTI = [1400, 2250]
export const LIZARD_X = 1820
export const GOAT_X = 3600
export const ROCKS = [3870, 4310, 4700]
export const VENTS = [4080, 4500]
export const NEVIERA_X = 4380
export const DRIFTS = [5160, 5380, 5620, 5860, 6090]
/** How many bumps each drift takes before its snow flies into the cart (it gets harder near the top). */
export const DRIFT_RAMS = [1, 1, 2, 2, 3]
export const UMBRELLA_X = 600
export const CRAB_X = 820
export const GULL_X = 980
export const CRATER_X = 6560

/** Sizes (units) of things on the trail. */
export const SIZE = {
  nino: 215,
  sparkle: 112,
  lemonTree: 380,
  chestnut: 520,
  pine: 400,
  cactus: 190,
  rock: 120,
  drift: 130,
  neviera: 300,
  umbrella: 300,
  goat: 150,
  lizard: 70,
  crab: 64,
  gull: 92,
} as const

export const mod = (a: number, n: number) => ((a % n) + n) % n
