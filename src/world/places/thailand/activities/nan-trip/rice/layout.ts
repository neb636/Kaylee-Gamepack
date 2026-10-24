// Stop Time Cafe and Sapan's rice steps (plan: planning/around-the-world/thailand/nan-trip.md, "3. Stop Time Cafe,
// Sapan"), in meters: the terraces, where everyone stands, the clouds and the café's deck. Pure data (no three.js):
// sections.ts reads it at startup.
//
// The rice steps climb a green spur that faces us across the valley floor (the camera looks toward -z). Each step is
// a band of a circle round the spur's middle (SPUR), so the steps curve round the hill the way real terraces follow
// the contour; the top step is the smallest and farthest, the bottom one the widest and nearest.
//
//                       the hilltop, the stream's pool and the bamboo pipe
//                [   top step: 2 paddies   ]
//             [     step 4: 2 paddies        ]
//          [       step 3: 3 paddies            ]
//       [         step 2: 3 paddies                ]
//    [           bottom step: 3 paddies                ]
//    the stream, Sapan's houses   Kaylee         Daddy    the buffalo
//
// Each paddy spills over a notch in its front bank into the paddy below it, so water poured at the top runs all the
// way down, step by step. Stop Time Cafe's deck stands up on the hill to the left, looking over it all.

export type V3 = [number, number, number]

// ---------------------------------------------------------------- the rounds

export const ROUNDS = ['1', '2', '3', 'deck'] as const
export type Round = (typeof ROUNDS)[number]

// ---------------------------------------------------------------- the rice steps

/** The middle of the circle the steps curve round (x, z). */
export const SPUR = { x: 0, z: -15 }
/** How far round the spur the paddies reach either side of straight at us (radians). */
export const SPAN = 0.36
/** The grassy edge either side of the paddies (radians). */
export const SIDE = 0.12

export interface Level {
  /** The paddies' floor (the mud). */
  y: number
  /** Inner (back) and outer (front) radius. */
  rIn: number
  rOut: number
  /** How many paddies across. */
  n: number
}
const DEPTH = 1.35
/** How much higher each step is than the one below. */
export const RISE = 0.5
/** Bottom step first. */
export const LEVELS: Level[] = [3, 3, 3, 2, 2].map((n, i) => ({ y: 0.6 + i * RISE, rOut: 11 - i * DEPTH, rIn: 11 - (i + 1) * DEPTH, n }))
export const TOP = LEVELS.length - 1

export interface Paddy {
  i: number
  level: number
  /** Its angles round the spur. */
  a0: number
  a1: number
  /** The notch in its front bank, where it spills into `down` (-1: into the stream). */
  notch: number
  down: number
  /** Its middle (world). */
  mid: V3
}

/** Where a point round the spur is: radius `r`, angle `a` (0 = straight at us, + to the right). */
export const spurXZ = (r: number, a: number): [number, number] => [SPUR.x + r * Math.sin(a), SPUR.z + r * Math.cos(a)]

function buildPaddies(): Paddy[] {
  const out: Paddy[] = []
  // The top step first, so a paddy's `down` is always one built after it.
  const byLevel: number[][] = LEVELS.map(() => [])
  for (let l = TOP; l >= 0; l--) {
    const L = LEVELS[l]
    const w = (2 * SPAN) / L.n
    for (let k = 0; k < L.n; k++) {
      const a0 = -SPAN + k * w
      const a1 = a0 + w
      // Notches zigzag, a little left of the middle on one step and right on the next, so the water wanders down.
      const notch = (a0 + a1) / 2 + (l % 2 ? 0.25 : -0.25) * w
      const [x, z] = spurXZ((L.rIn + L.rOut) / 2, (a0 + a1) / 2)
      byLevel[l].push(out.length)
      out.push({ i: out.length, level: l, a0, a1, notch, down: -1, mid: [x, L.y, z] })
    }
  }
  for (const p of out) {
    if (p.level === 0) continue
    const below = byLevel[p.level - 1].map((i) => out[i])
    p.down = (below.find((q) => p.notch >= q.a0 && p.notch < q.a1) ?? below[0]).i
  }
  return out
}
export const PADDIES = buildPaddies()

/** Which paddy a point round the spur is in (or null: the grassy edges, off the steps). */
export function paddyAt(level: number, a: number): Paddy | null {
  if (Math.abs(a) > SPAN) return null
  return PADDIES.find((p) => p.level === level && a >= p.a0 && a <= p.a1) ?? null
}

// ---------------------------------------------------------------- the water

/** Water poured into a paddy per second (1 = full: shiny like a mirror). */
export const POUR_RATE = 0.62
/** A tap (no hold) pours for this long. */
export const BURST_S = 1.0
/** Above the mud when full. */
export const WATER_Y = 0.05

/** The stream's little pool at the top, where the bamboo pipe starts. */
export const SPRING: V3 = [0.15, LEVELS[TOP].y + 0.62, SPUR.z + LEVELS[TOP].rIn - 0.15]
/** Where the pipe's end hangs when she isn't pouring. */
export const PIPE_REST: V3 = [0.7, LEVELS[TOP].y + 0.75, SPUR.z + LEVELS[TOP].rOut - 0.2]
/** The spout rides this far above (and behind) where the water lands. */
export const SPOUT_UP = 0.85
export const SPOUT_BACK = 0.5

// ---------------------------------------------------------------- planting (round 2)

/** The seedlings' rows: this far apart along the contour and across. */
export const ROW_GAP = 0.36
export const ROWS_PER_STEP = 3
/** Her finger plants every free spot this near it (m); a tap, this near. */
export const BRUSH = 0.48
export const TAP_BRUSH = 0.6
/** A paddy this full of seedlings plants the rest by itself. */
export const PLANTED_AT = 0.55

// ---------------------------------------------------------------- the clouds (round 3)

/** Where each cloud settles over the steps, covering them. */
export const CLOUDS: V3[] = [
  [-0.2, 4.6, -10.2],
  [-2.3, 3.6, -7.6],
  [2.2, 3.6, -7.4],
  [0.1, 2.6, -5.0],
]
/** A carried cloud rides this far above where the rain lands. */
export const CLOUD_UP = 1.35
/** Rain grows the rice in every paddy this near (m), this fast (1 = tall). */
export const RAIN_R = 1.25
export const RAIN_GROW = 0.75
/** A cloud rains itself out in this many seconds of raining. */
export const CLOUD_S = 3.2
/** A tap on a cloud rains for this long. */
export const CLOUD_TAP_S = 0.9

// ---------------------------------------------------------------- the valley floor

export const KAYLEE_AT: V3 = [-2.0, 0, -1.6]
export const NICK_AT: V3 = [1.7, 0, -1.4]
export const BUFFALO_AT: V3 = [4.4, 0, -2.9]
export const STREAM_Z = -3.75
export const HAT_POST: V3 = [-3.75, 0, -4.1]
export const VILLAGE: V3 = [-5.6, 0, -5.4]
/** On a tall screen the valley floor closes in, so everyone fits. */
export const TALL = { kaylee: [-1.15, 0, -1.2] as V3, nick: [0.95, 0, -1.0] as V3, buffalo: [2.55, 0, -2.75] as V3 }
/** Frogs and ducks: how many there can be (they come when the paddies fill). */
export const FROGS = 4
export const DUCKS = 3

// ---------------------------------------------------------------- Stop Time Cafe's deck

/** The deck, up on the hill to the left: its middle, and which way it looks (its railing toward the valley). */
export const DECK = { x: -8.0, y: 3.4, z: -1.0, yaw: -Math.PI / 4 }
/** Deck-local (x across, z toward the railing at -z). */
export const RAIL_Z = -1.35
export const STOOLS = { kaylee: [-0.36, 0.74, -0.95] as V3, nick: [0.38, 0.62, -0.95] as V3 }
export const HIGH_TABLE: V3 = [0, 0.84, -0.42]
export const MOMMY_AT: V3 = [1.3, 0, -0.95]
/** Where Mommy's photo is taken from (in front of them, the valley behind). */
export const PHOTO_FROM: V3 = [0.25, 1.2, 1.5]
export const CHIME: V3 = [-1.5, 2.0, -1.2]
/** Sips in a glass of pink milk. */
export const SIPS = 4
