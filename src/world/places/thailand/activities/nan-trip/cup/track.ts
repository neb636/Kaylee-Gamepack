// The Nan Mountain Cup's tracks (plan: planning/around-the-world/thailand/nan-cup.html, "The three tracks"), one source
// of truth in meters, pure math (no three.js): each is a road from the road kit (trip/road/road.ts: `s` along it from
// its start, `lat` meters to the left of its middle), raced point to point, not laps. The race (race.ts), the scene
// and the minimap all read it.
//
// Three tracks, easiest to hardest, each with coins to steer through, gold arrow pads and its own trick:
// - 🍄 the Mushroom Forest (Moon's home track, greybox 1): a wide road winding through a pine forest with gentle hills,
//   ~800 m from the start line to the finish (about 60-80 s). Its trick: giant pink mushrooms. Drive over one and she
//   goes *boing* up into the air, where more coins hang.
// - 🌾 the Rice Steps Rally (Grandma Taeng's home track, greybox 2): down the terraces at Sapan, zig-zagging from step to
//   step, ~1100 m down to the river. Its trick: puddles in the flooded corners. Drive through one and it splashes and
//   muddies the kart (muddier is a little faster); near the end, a little waterfall runs across the road and washes it
//   clean (with a burst of speed).
// - ☁️ the Cloud Top Climb (Pao's home track, greybox 2): up Doi Phu Kha's hairpins, the tightest of the three, ~1180 m
//   to the summit. Its trick: the cloud. Halfway up everything turns white and a line of glowing lanterns shows the way
//   (each one she drives under chimes); out the top, sunshine over a sea of clouds. Pink Chomphu Phu Kha blossoms fall
//   across the road in showers: driving through one is a burst of speed.
// Either side of the road is a strip of grass (she can drive on it, bumpier and slower), then a row of hay bales that
// boing her back on (she never leaves the track).
import { Road, type RoadPoint } from '../../../trip/road/road'
import { courseMap } from '../../../trip/race/course'
import type { CoinLine, Place } from '../../../trip/race/items'
import type { RoadLook } from '../../../trip/road/build'

export type TrackId = 'forest' | 'steps' | 'cloud'
export const TRACK_IDS: TrackId[] = ['forest', 'steps', 'cloud']

/** A giant bouncy mushroom on the road: its cap's middle and radius (meters); `big` throws her higher. */
export interface Mushroom {
  s: number
  lat: number
  r: number
  big?: boolean
}

/** A puddle in a flooded corner (the rice steps): its middle and radius across (meters; it's half as long again
 *  along the road). */
export interface Puddle {
  s: number
  lat: number
  r: number
}

/** A shower of Chomphu Phu Kha blossoms falling across the road (the cloud): its middle along the road, and the side its
 *  tree stands on (+1 left, -1 right). */
export interface Shower {
  s: number
  side: number
}

/** The meters of road a blossom shower covers (along it), and of a waterfall's stream (across it, the whole width). */
export const SHOWER_LEN = 7
export const STREAM_LEN = 3.2

export interface TrackDef {
  id: TrackId
  points: RoadPoint[]
  /** Half the road's width (meters). */
  half: number
  /** The grass between the road's edge and the hay bales (meters). */
  grass: number
  look: RoadLook
  /** The start line and the finish line, meters along the road (the grid is behind the start; after the finish
   *  there's road to roll on into the clearing). */
  start: number
  finish: number
  /** Where along the race (0 = the start line, 1 = the finish line) and across the road things lie. */
  coins: { f: number; lat: number; n: number }[]
  pads: { f: number; lat: number }[]
  mushrooms: (Omit<Mushroom, 's'> & { f: number })[]
  puddles?: (Omit<Puddle, 's'> & { f: number })[]
  /** Where a waterfall's stream runs across the road (the rice steps), and the side the waterfall is on. */
  waterfall?: { f: number; side: number }
  /** The cloud the road climbs through (heights in meters): white inside, lanterns showing the way. */
  cloud?: { y0: number; y1: number }
  showers?: { f: number; side: number }[]
  /** Round mirrors on the blind hairpins (where along the race, which side). */
  mirrors?: { f: number; side: number }[]
}

const FOREST: TrackDef = {
  id: 'forest',
  // A long winding run through the pines, up a gentle hill and down again: out of the trees into a sunny clearing.
  points: [
    [0, 0, 0],
    [0, 50, 0],
    [8, 100, 1],
    [38, 140, 2],
    [85, 158, 4],
    [135, 148, 6],
    [165, 112, 7],
    [162, 62, 6],
    [132, 30, 4],
    [118, -12, 3],
    [138, -58, 1.5],
    [188, -78, 0.5],
    [238, -58, 1.5],
    [258, -10, 3],
    [252, 40, 4],
    [272, 95, 3],
    [305, 140, 1.5],
    [330, 170, 1.5],
  ],
  half: 6,
  grass: 3.5,
  look: { hills: { near: 1.2, far: 16 }, wall: 70, trees: 1100, seed: 41, signs: false },
  start: 30,
  finish: 820,
  coins: [
    { f: 0.05, lat: 2.5, n: 5 },
    { f: 0.15, lat: -3, n: 6 },
    { f: 0.33, lat: 3.5, n: 5 },
    { f: 0.45, lat: -2, n: 5 },
    { f: 0.64, lat: 0, n: 6 },
    { f: 0.86, lat: -3.5, n: 5 },
    { f: 0.93, lat: 2, n: 5 },
  ],
  pads: [
    { f: 0.1, lat: 0 },
    { f: 0.38, lat: -3 },
    { f: 0.38, lat: 3 },
    { f: 0.7, lat: 0 },
    { f: 0.95, lat: -2.5 },
  ],
  mushrooms: [
    { f: 0.22, lat: -2.2, r: 1.7 },
    { f: 0.52, lat: 2.4, r: 1.7 },
    { f: 0.56, lat: -2.4, r: 1.7 },
    { f: 0.79, lat: 0, r: 2.2, big: true },
  ],
}

const STEPS: TrackDef = {
  id: 'steps',
  // Down the terraces at Sapan, zig-zagging across the hill from step to step (each long run along a terrace, each bend
  // a step down), to the river at the bottom of the valley.
  points: [
    [0, 0, 54], [0, 42, 54], [9, 76, 53.5], [32, 90, 53], [68, 92, 52.5], [95, 101, 51.5], [107, 126, 49.5],
    [98, 151, 47.5], [72, 158, 46], [36, 158, 45.5], [7, 162, 44.5], [-9, 185, 42.5], [-3, 210, 40.5], [19, 218, 39],
    [55, 221, 38.5], [85, 225, 37.5], [101, 248, 35.5], [94, 273, 33.5], [69, 279, 32], [33, 279, 31.5],
    [4, 284, 30.5], [-12, 307, 28.5], [-6, 332, 26.5], [16, 340, 25], [52, 342, 24], [81, 347, 23], [96, 370, 21],
    [89, 395, 19], [65, 401, 17.5], [36, 403, 17], [7, 412, 16.5], [-12, 429, 14.5], [-6, 454, 12.5], [16, 462, 11],
    [52, 464, 10], [81, 469, 9], [96, 492, 7], [89, 517, 5], [65, 523, 3.5], [36, 525, 3], [7, 534, 2.5],
  ],
  half: 5.5,
  grass: 3.5,
  look: { hills: { near: 2, far: 22 }, wall: 60, paddies: true, terraces: 1.6, river: { s: 1152, width: 10 }, trees: 500, seed: 53, signs: false },
  start: 30,
  finish: 1130,
  coins: [
    { f: 0.04, lat: -2, n: 5 },
    { f: 0.2, lat: 2.5, n: 5 },
    { f: 0.36, lat: -2.5, n: 5 },
    { f: 0.52, lat: 2, n: 6 },
    { f: 0.68, lat: -2, n: 5 },
    { f: 0.83, lat: 2.5, n: 5 },
  ],
  pads: [
    { f: 0.1, lat: 0 },
    { f: 0.44, lat: 2.5 },
    { f: 0.62, lat: -2.5 },
    { f: 0.95, lat: 0 },
  ],
  mushrooms: [],
  // In the flooded corners, more on the inside of the bends (the short way round is the splashy way).
  puddles: [
    { f: 0.07, lat: 2.6, r: 1.6 },
    { f: 0.14, lat: -2.2, r: 1.8 },
    { f: 0.19, lat: -0.8, r: 2 },
    { f: 0.24, lat: 1.5, r: 2.2 },
    { f: 0.3, lat: -2.8, r: 1.6 },
    { f: 0.4, lat: 2.4, r: 2 },
    { f: 0.48, lat: -2, r: 1.8 },
    { f: 0.57, lat: 0, r: 2.4 },
    { f: 0.66, lat: 2.6, r: 1.6 },
    { f: 0.73, lat: -2.4, r: 2 },
    { f: 0.79, lat: 1.8, r: 1.8 },
    { f: 0.84, lat: -2, r: 2 },
  ],
  waterfall: { f: 0.89, side: 1 },
}

const CLOUD: TrackDef = {
  id: 'cloud',
  // Up Doi Phu Kha's face in hairpins, climbing about a meter in every fifteen: into the cloud halfway up and out the top
  // into the sunshine, to the summit over a sea of clouds.
  points: [
    [0, 0, 0], [0, 40, 1.5], [9, 72, 3.5], [41, 86, 6], [86, 90, 9], [115, 100, 11], [128, 122, 13], [119, 144, 15],
    [90, 150, 17], [45, 152, 20], [7, 158, 23], [-13, 178, 25], [-5, 200, 27], [22, 208, 29], [67, 212, 32],
    [104, 220, 35], [119, 242, 37], [110, 264, 39], [81, 270, 41], [36, 272, 44], [0, 278, 47], [-18, 298, 49],
    [-11, 320, 51], [16, 328, 53], [61, 332, 56], [104, 340, 59], [119, 362, 61], [110, 384, 63], [81, 390, 65],
    [36, 392, 68], [0, 398, 71], [-18, 418, 73], [-11, 440, 75], [16, 448, 77], [61, 452, 80], [97, 462, 82],
    [110, 486, 84], [106, 512, 85], [99, 540, 85.5],
  ],
  half: 5,
  grass: 3.5,
  look: { hills: { near: 6, far: 24 }, wall: 36, trees: 420, seed: 37, signs: false },
  start: 30,
  finish: 1210,
  coins: [
    { f: 0.05, lat: 2, n: 5 },
    { f: 0.18, lat: -2, n: 5 },
    { f: 0.32, lat: 2, n: 5 },
    { f: 0.76, lat: -2, n: 5 },
    { f: 0.9, lat: 2, n: 6 },
  ],
  pads: [
    { f: 0.11, lat: 0 },
    { f: 0.27, lat: -2 },
    { f: 0.8, lat: 0 },
    { f: 0.96, lat: -2 },
  ],
  mushrooms: [],
  // From about 0.42 to 0.72 of the way up she's inside (the road's height there).
  cloud: { y0: 36, y1: 61 },
  showers: [
    { f: 0.08, side: 1 },
    { f: 0.22, side: -1 },
    { f: 0.36, side: 1 },
    { f: 0.84, side: -1 },
    { f: 0.93, side: 1 },
  ],
  mirrors: [
    { f: 0.14, side: -1 },
    { f: 0.4, side: 1 },
    { f: 0.66, side: -1 },
  ],
}

export const TRACK_DEFS: Record<TrackId, TrackDef> = { forest: FOREST, steps: STEPS, cloud: CLOUD }

/** A track ready to race: its road, the race's length, and its things at their places along the road. */
export class Track {
  readonly road: Road
  readonly def: TrackDef
  /** Meters from the start line to the finish line. */
  readonly length: number
  readonly coins: CoinLine[]
  readonly pads: { s: number; lat: number }[]
  readonly mushrooms: Mushroom[]
  readonly puddles: Puddle[]
  /** The waterfall's stream across the road (meters along), or none. */
  readonly stream: { s: number; side: number } | null
  readonly showers: Shower[]
  /** The glowing lanterns through the cloud, along the line to follow (the inside of each bend). */
  readonly lanterns: { s: number; lat: number }[]
  /** The minimap (the races' HUD). */
  readonly map: ReturnType<typeof courseMap>

  constructor(id: TrackId) {
    const def = (this.def = TRACK_DEFS[id] ?? FOREST)
    this.road = new Road(def.points, def.half)
    this.length = def.finish - def.start
    const s = (f: number) => def.start + f * this.length
    this.mushrooms = def.mushrooms.map((m) => ({ ...m, s: s(m.f) }))
    // The mushrooms' coins hang in the air along the way she flies off them (as high as the bounce throws her: about
    // 2 m, the big one nearly 4; race.ts's BOUNCE knobs).
    const air = this.mushrooms.map((m): CoinLine => ({ s: m.s + 1, lat: m.lat, n: m.big ? 5 : 4, air: true, arc: m.big ? 3.2 : 1.7 }))
    this.coins = [...def.coins.map((c) => ({ s: s(c.f), lat: c.lat, n: c.n })), ...air]
    this.pads = def.pads.map((p) => ({ s: s(p.f), lat: p.lat }))
    this.puddles = (def.puddles ?? []).map((p) => ({ ...p, s: s(p.f) }))
    this.stream = def.waterfall ? { s: s(def.waterfall.f), side: def.waterfall.side } : null
    this.showers = (def.showers ?? []).map((w) => ({ s: s(w.f), side: w.side }))
    this.lanterns = []
    if (def.cloud) {
      // From a little before the cloud to a little past it, one every 9 m: along the inside of the bend ahead.
      const { y0, y1 } = def.cloud
      for (let at = def.start; at < def.finish; at += 9) {
        const y = this.road.sampleAt(at).y
        if (y < y0 - 2 || y > y1 + 1) continue
        this.lanterns.push({ s: at, lat: Math.max(-1.8, Math.min(1.8, this.road.bendAhead(at, 18) * 2.4)) })
      }
    }
    this.map = courseMap(this.road.samples, def.half + 4, false)
  }

  /** How far she can go across before the hay bales (meters from the middle). */
  get edge() {
    return this.def.half + this.def.grass
  }

  /** On the road at (s, lat): the ground's height there (the road's), the heading and how steeply it climbs. */
  place: Place = (s, lat) => {
    const p = this.road.sampleAt(s)
    return { x: p.x + p.lx * lat, y: p.y, z: p.z + p.lz * lat, heading: Math.atan2(p.tx, p.tz), grade: p.grade }
  }

  /** The puddle under (s, lat), if any. */
  puddleAt(s: number, lat: number) {
    return this.puddles.find((p) => ((p.s - s) / 1.5) ** 2 + (p.lat - lat) ** 2 < p.r * p.r)
  }

  /** In the waterfall's stream (anywhere across the road). */
  inStream(s: number) {
    return !!this.stream && Math.abs(s - this.stream.s) < STREAM_LEN / 2
  }

  /** The blossom shower over (s, lat), if any (it covers the road and a little of the grass). */
  showerAt(s: number, lat: number) {
    return this.showers.find((w) => Math.abs(w.s - s) < SHOWER_LEN / 2 && Math.abs(lat) < this.def.half + 1)
  }

  /** The mushroom under (s, lat), if any. */
  mushroomAt(s: number, lat: number) {
    return this.mushrooms.find((m) => (m.s - s) ** 2 + (m.lat - lat) ** 2 < m.r * m.r)
  }
}
