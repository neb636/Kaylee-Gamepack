// Bo Kluea's salt hut (plan: planning/around-the-world/thailand/nan-trip.md, "4. Bo Kluea salt wells"), in meters:
// where everything stands, the rounds and their numbers. Pure data (no three.js): sections.ts can read it at startup.
// The hut is built in hut.ts, the street and the house with the mural behind it in village.ts.
//
// The open-sided salt hut, seen from the front (the camera looks toward -z, a little from above, straight on):
//
//   across the road:          the wooden house with the Tai Lue couple painted on it
//   the hut's back:   (the rooster) Mom    [the shelf for the salt bags]  Dad               the salt aunty
//   the beam:       ===========================================================  (the bucket's rope slides along it)
//   the plane z=0:      ( the well )        the bucket           [ the big pan on its mud stove ]   the woodpile
//   the front:     baskets      Kaylee walks along under the bucket    her salt basket   (the fire's mouth)   cat

export type V3 = [number, number, number]

// ---------------------------------------------------------------- the rounds

/** `story` the way in (Pa Kluea's film: the cooks have no salt, the village dinner is tonight), 1 dip and pour (fill
 *  the pan from the well), 2 the fire (logs in, it boils down), 3 scrape the salt into the basket, `dinner` the village
 *  dinner at dusk (sprinkle the salt into each cook's food; the party film). */
export const ROUNDS = ['story', '1', '2', '3', 'dinner'] as const
export type Round = (typeof ROUNDS)[number]

// ---------------------------------------------------------------- the well, the beam and the bucket

/** The well: a round stone rim; the brine far down inside it. */
export const WELL = { x: -1.45, z: 0, r: 0.4, rim: 0.55, water: 0.16 }
/** The bamboo beam the bucket's rope slides along (on two posts), in the plane z = 0. */
export const BEAM = { x0: -2.0, x1: 2.05, y: 2.2 }
export const BUCKET = { r: 0.17, h: 0.28 }
/** Where the bucket hangs when nobody holds it (its middle), and out of the way over the well in round 3. */
export const BUCKET_REST: V3 = [-0.75, 1.45, 0]
export const BUCKET_AWAY: V3 = [WELL.x, 1.7, 0]
/** How far her finger may take it (its middle). */
export const BUCKET_X: [number, number] = [-1.9, 1.85]
export const BUCKET_TOP = 1.85
/** Below this (its bottom) it fills, over the well; the bucket's bottom can't go lower than the well's water. */
export const FILL_BELOW = 0.36
export const FILL_RATE = 1.7
/** Held low enough anywhere but over the well and it tips (its bottom below this); over the pan, a little higher. */
export const TIP_BELOW = 1.0
export const TIP_BELOW_PAN = 1.18
export const POUR_RATE = 1.25

// ---------------------------------------------------------------- the pan, the stove and the fire

/** The big shallow pan on its mud stove (the brine level goes from its bottom to its top). */
export const PAN = { x0: 0.35, x1: 1.65, z0: -0.42, z1: 0.42, top: 0.8, depth: 0.16 }
export const PAN_X = (PAN.x0 + PAN.x1) / 2
/** Buckets that fill the pan. */
export const PAN_BUCKETS = 6
/** The stove's front, and its fire's mouth. */
export const STOVE_FRONT = PAN.z1 + 0.06
export const MOUTH = { x: PAN_X, y: 0.24, w: 0.5, h: 0.3 }
/** The fire: a log adds this much (0..1), it dies down this much a second, a puff (a tap on the fire) adds this. */
export const LOG_FIRE = 0.28
export const FIRE_DECAY = 0.05
export const PUFF_FIRE = 0.07
/** The brine boils down this much a second at a full fire (1 = the pan full). */
export const BOIL_RATE = 0.034
/** Round 2 ends with this much brine left (the salt is everywhere); the salt starts at the edges at CRUST_FROM. */
export const BOILED = 0.22
export const CRUST_FROM = 0.85
export const WOODPILE: V3 = [2.25, 0, 0.62]

// ---------------------------------------------------------------- the salt

/** The salt in the pan, a grid of little heaps (round 3 scrapes them up). */
export const SALT_COLS = 11
export const SALT_ROWS = 6
export const SALT = Array.from({ length: SALT_COLS * SALT_ROWS }, (_, i): V3 => {
  const c = i % SALT_COLS
  const r = Math.floor(i / SALT_COLS)
  // A little jitter, so it reads as heaps of salt, not tiles.
  const jx = Math.sin(i * 12.9898) * 0.045
  const jz = Math.cos(i * 78.233) * 0.035
  return [PAN.x0 + 0.1 + (c * (PAN.x1 - PAN.x0 - 0.2)) / (SALT_COLS - 1) + jx, PAN.top - PAN.depth + 0.03, PAN.z0 + 0.09 + (r * (PAN.z1 - PAN.z0 - 0.18)) / (SALT_ROWS - 1) + jz]
})
/** The paddle's blade (across the scraping direction) and how much it holds before it wants emptying. */
export const BLADE = { w: 0.24, reach: 0.11 }
export const PADDLE_HOLDS = 8
/** Scraped this much of the salt and the aunty sweeps up the rest. */
export const SWEEP_AT = 0.85
/** Her salt basket, beside the pan (the paddle empties into it); the bags on the shelf at the end. */
export const SALT_BASKET: V3 = [-0.12, 0, 0.62]
export const BASKET_R = 0.27
export const BASKET_RIM = 0.24
export const SHELF = { x0: -1.05, x1: -0.2, z: -1.0, ys: [0.95, 1.4] }
export const BAGS = 4

// ---------------------------------------------------------------- the people and the pokes

export const KAYLEE_AT: V3 = [-0.55, 0, 0.82]
/** The line Kaylee walks along under the bucket, in front of everything. */
export const KAYLEE_Z = 0.82
export const KAYLEE_X: [number, number] = [-1.95, 2.0]
/** She walks along a little to the left of the bucket (so she doesn't hide what's under it). */
export const KAYLEE_LEAD = -0.42
/** In round 2 she stands back from the fire's mouth, to the left of the pan (never in front of it or the fire). */
export const KAYLEE_FIRE: V3 = [PAN.x0 - 0.58, 0, 0.82]
/** In round 3 she stands at the pan's left end, behind her basket, and reaches the paddle in (so the pan stays clear). */
export const KAYLEE_SCRAPE: V3 = [PAN.x0 - 0.52, 0, 0.12]
export const NICK_AT: V3 = [0.08, 0, -0.68]
export const JI_AT: V3 = [-2.2, 0, -0.55]
export const AUNTY_AT: V3 = [2.3, 0, -0.3]
export const CAT: V3 = [1.68, 0, 0.92]
export const BASKETS: V3 = [-2.25, 0, 0.55]
export const ROOSTER: V3 = [-2.45, 0, -1.65]
/** The house across the road, with the painted couple on its wall. */
export const ROAD_Z = -2.6
export const MURAL = { x: 0.7, y: 1.12, z: -4.15, w: 2.6, h: 1.55 }
/** On a tall screen the edges come in a little, so everyone fits. */
export const TALL = { ji: [-1.55, 0, -0.85] as V3, aunty: [1.7, 0, -0.75] as V3, wood: [1.95, 0, 0.75] as V3, baskets: [-1.95, 0, 0.62] as V3 }

// ---------------------------------------------------------------- Pa Kluea's story (story.ts, dinner.ts)

/** The three cooks wait across the road while she makes the salt (by the house with the painted couple), facing the
 *  hut: Lung Kwai the buffalo (noodle soup), Pa Kai the hen (salty eggs), Yai Nak the otter (grilled fish). */
export const COOKS_WAIT: V3[] = [
  [-1.15, 0, -3.35],
  [0.15, 0, -3.5],
  [1.4, 0, -3.35],
]
/** In the way-in film they come into the hut from the left, along the front, and stand in a row facing Pa Kluea. */
export const COOKS_IN: V3[] = [
  [-0.3, 0, 1.0],
  [0.5, 0, 1.15],
  [1.25, 0, 1.0],
]
/** Pa Kluea's big salt jar (empty: the trouble), on the floor right of the pan. */
export const SALT_JAR: V3 = [2.65, 0, 0.2]
/** Where Pa Kluea stands to talk in the films (by her pan, toward the front). */
export const AUNTY_TALK: V3 = [1.95, 0, 0.5]

/** The village dinner: a set of its own along the same road, far enough right that the hut's shots never see it. Three
 *  stalls in a row facing the camera, their cooks behind them, lanterns over each, string lights along the road. */
export const DINNER = { x: 16, z: 0 }
export const STALL_X = [-1.65, 0, 1.65].map((d) => DINNER.x + d)
export const STALL_Z = -0.35
/** The counter's top, where the food sits and the salt lands. */
export const COUNTER_Y = 0.56
/** Each food sits right of its counter's middle and its cook stands behind the left of it, so the food never hides
 *  their face. */
export const FOOD_X = [0.2, 0.16, 0.12]
export const COOK_DX = -0.36
/** Kaylee's line in front of the stalls, and where the family stand to watch. */
export const DINNER_KAYLEE_Z = 0.55
export const DINNER_NICK: V3 = [DINNER.x - 2.6, 0, -1.0]
export const DINNER_JI: V3 = [DINNER.x - 3.05, 0, -0.75]
export const DINNER_AUNTY: V3 = [DINNER.x + 2.95, 0, 0.35]
/** The salt each food wants (the spots on it a sprinkle fills: the soup pot has one, the egg jar one, the grill one per
 *  fish), how near a sprinkle must land (m), and how fast a held sprinkle fills a spot (per second). */
export const FOOD_SPOTS: [x: number, z: number][][] = [
  [[0, 0]],
  [[0.12, 0]],
  [[-0.3, 0.02], [0, 0.02], [0.3, 0.02]],
]
export const SPOT_R = 0.2
export const SALT_RATE = 0.9
/** Held on after it's just right, this much more and the cook gets a too-salty face (and it starts again). */
export const TOO_SALTY = 0.9
