// The Nan trip's four roads, as data in meters (plan: thailand/nan-trip.html, "The mountain road"). Same verb on each
// (steer the Pajero), and each one deepens it:
// - city: through Nan town to its market, short and flat, over the Nan River bridge; tuk-tuks and scooters.
// - valley: through the rice fields of Pua to the mushroom farm; chickens on the road, a songthaew coming the other
//   way (keep left!), a buffalo that ambles across (Mommy stops for it).
// - sky: up Doi Phu Kha in steep S-bends, into the cloud (white all round, the headlights on) and out above it into the
//   sunshine, with round mirrors on the blind bends (beep before the bend, and the car coming beeps back), a waterfall
//   and a monkey on the rail.
// - three: the hairpins down to Santi Suk (count the bends: one, two, three); from the viewpoint at the end the road
//   below is a giant 3.
// Pure (no three.js). Control points are [x, z, y]; for the 3, z runs
// down the page as you look at it from above (the top of the 3 is at -z).
import { Road, type RoadPoint } from '../../../trip/road/road'
import type { RoadLook } from '../../../trip/road/build'
import type { TrafficPlan } from '../../../trip/road/traffic'

export const ROAD_IDS = ['city', 'valley', 'sky', 'three'] as const
export type RoadId = (typeof ROAD_IDS)[number]
export type Weather = 'grey' | 'rain' | 'sun'
export type LandmarkKind = 'market' | 'mushrooms' | 'cafe' | 'viewpoint'

export interface NanRoad {
  id: RoadId
  icon: string
  /** For Dad (the end card's buttons say it out loud with pictures). */
  name: string
  road: Road
  look: RoadLook
  weather: Weather
  /** The cloud she drives into (heights in meters). */
  cloud?: { y0: number; y1: number }
  traffic: TrafficPlan
  /** Blind bends (s of each bend), with a round mirror and a car coming round. */
  blind: number[]
  /** The bends she counts (the 3). */
  count: number[]
  /** A waterfall beside the road (s). */
  falls?: number
  /** A market along the road (from, to). */
  market?: [number, number]
  /** What's at the end of the road. */
  landmark: LandmarkKind
}

/** Half the road's width: two lanes of four meters (a toy's proportions, room to steer). */
export const HALF = 4
/** Her lane's middle: on the left (Thailand keeps left). */
export const LANE_LAT = HALF / 2

function city(): NanRoad {
  const points: RoadPoint[] = [[0, -20, 0], [0, 0, 0], [3, 40, 0.1], [1, 70, 0.8], [-2, 95, 0.8], [-5, 125, 0.1], [-2, 160, 0], [8, 195, 0], [14, 225, 0], [14, 250, 0]]
  const road = new Road(points, HALF)
  const at = (i: number) => road.sOfPoint(i)
  return {
    id: 'city',
    icon: '🧺',
    name: 'Nan town to the market',
    road,
    look: { hills: { near: 0.3, far: 6 }, wall: 30, river: { s: (at(3) + at(4)) / 2, width: 18 }, trees: 120, seed: 11 },
    weather: 'sun',
    traffic: {
      movers: [
        { kind: 'tuktuk', when: 10, from: 110, speed: 5 },
        { kind: 'scooter', when: 70, from: 175, speed: 5.5 },
        { kind: 'tuktuk', when: 120, from: 225, speed: 5 },
      ],
      buffalo: [],
      chickens: [at(2)],
      monkeys: [],
    },
    blind: [],
    count: [],
    market: [at(5) - 8, at(7)],
    landmark: 'market',
  }
}

function valley(): NanRoad {
  const points: RoadPoint[] = [[0, -20, 0], [0, 0, 0], [6, 40, 0.5], [22, 80, 1], [28, 120, 1.5], [18, 160, 2], [0, 195, 2.5], [-12, 235, 3], [-10, 275, 3.5], [5, 315, 4], [25, 350, 5], [32, 390, 6], [25, 430, 7], [15, 460, 7], [12, 490, 7]]
  const road = new Road(points, HALF)
  const at = (i: number) => road.sOfPoint(i)
  return {
    id: 'valley',
    icon: '🍄',
    name: 'Through the rice fields to the mushroom farm',
    road,
    look: { hills: { near: 0.5, far: 22 }, wall: 55, paddies: true, trees: 260, seed: 23 },
    weather: 'grey',
    traffic: {
      movers: [
        { kind: 'songthaew', when: at(3), from: at(6) + 10, speed: 6 },
        { kind: 'scooter', when: at(8), from: at(11), speed: 6 },
      ],
      buffalo: [at(8)],
      chickens: [at(3) + 10, at(11)],
      monkeys: [],
    },
    blind: [],
    count: [],
    landmark: 'mushrooms',
  }
}

function sky(): NanRoad {
  // Switchbacks up the mountain's face, climbing about a meter in every six, into the cloud and above it.
  const points: RoadPoint[] = [
    [0, -20, 0], [0, 0, 0], [5, 35, 5], [25, 60, 10], [50, 72, 15],
    [68, 88, 20], [62, 112, 25], [38, 124, 30], [8, 130, 35], [-20, 140, 40],
    [-36, 160, 45], [-31, 184, 50], [-8, 198, 55], [22, 206, 60], [48, 220, 65],
    [60, 244, 70], [50, 266, 75], [25, 280, 80], [0, 292, 85], [-15, 315, 88],
    [-18, 345, 91], [-14, 378, 92],
  ]
  const road = new Road(points, HALF)
  const at = (i: number) => road.sOfPoint(i)
  return {
    id: 'sky',
    icon: '☁️',
    name: 'Up Doi Phu Kha into the clouds',
    road,
    look: { hills: { near: 8, far: 34 }, wall: 70, trees: 420, seed: 37 },
    weather: 'rain',
    cloud: { y0: 38, y1: 62 },
    traffic: {
      movers: [
        { kind: 'car', when: at(5) - 55, from: at(5) + 40, speed: 5, blind: at(5) },
        { kind: 'car', when: at(15) - 55, from: at(15) + 40, speed: 5, blind: at(15) },
        { kind: 'songthaew', when: at(17), from: at(21), speed: 5.5 },
      ],
      buffalo: [],
      chickens: [at(2)],
      monkeys: [{ s: at(9) + 6, side: 0 }],
    },
    blind: [at(5), at(15)],
    count: [],
    falls: at(7),
    landmark: 'cafe',
  }
}

function three(): NanRoad {
  // A 3 drawn on the hill (seen from above, the top of the 3 at -z): in from the top left, round the top bowl, back in
  // to the middle in a tight hairpin, round the bigger bottom bowl and out to the lay-by at the bottom left. Downhill
  // all the way, about 70 meters.
  const arc = (cx: number, cz: number, r: number, from: number, to: number, step: number) => {
    const out: [number, number][] = []
    for (let a = from; a <= to + 1e-6; a += step) out.push([cx + r * Math.cos((a * Math.PI) / 180), cz + r * Math.sin((a * Math.PI) / 180)])
    return out
  }
  const flat: [number, number][] = [
    [-58, -36], [-48, -58],
    ...arc(0, -60, 40, -150, 90, 30),
    [-11, -18], [-17, -10], [-11, -2],
    ...arc(0, 40, 42, -90, 150, 30),
    [-46, 50], [-56, 42], [-62, 36],
  ]
  // Heights fall evenly along the way.
  let len = 0
  const cum = flat.map((p, i) => (i ? (len += Math.hypot(p[0] - flat[i - 1][0], p[1] - flat[i - 1][1])) : 0))
  const points: RoadPoint[] = flat.map(([x, z], i) => [x, z, 72 - (70 * cum[i]) / len])
  const road = new Road(points, HALF)
  // The three bends to count: the top bowl's far side, the hairpin in the middle, the bottom bowl's far side.
  const near = (x: number, z: number) => road.locate(x, z).s
  return {
    id: 'three',
    icon: '3️⃣',
    name: 'The "number 3" road, down the hairpins',
    road,
    look: { hills: { near: 4, far: 26 }, wall: 40, trees: 340, seed: 53 },
    weather: 'sun',
    traffic: {
      movers: [{ kind: 'scooter', when: near(40, -60), from: near(36.4, 19), speed: 5 }],
      buffalo: [],
      chickens: [],
      monkeys: [{ s: near(20, -94.6), side: 0 }],
    },
    blind: [],
    count: [near(40, -60), near(-17, -10), near(42, 40)],
    landmark: 'viewpoint',
  }
}

const BUILDERS: Record<RoadId, () => NanRoad> = { city, valley, sky, three }
const built = new Map<RoadId, NanRoad>()
/** A road (built once per visit). */
export function nanRoad(id: RoadId): NanRoad {
  let r = built.get(id)
  if (!r) built.set(id, (r = BUILDERS[id]()))
  return r
}
