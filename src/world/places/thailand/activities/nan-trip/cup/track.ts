// The Nan Mountain Cup's tracks (plan: planning/around-the-world/thailand/nan-cup.html, "The three tracks"), one source
// of truth in meters, pure math (no three.js): each is a road from the road kit (trip/road/road.ts: `s` along it from
// its start, `lat` meters to the left of its middle), raced point to point, not laps. The race (race.ts), the scene
// and the minimap all read it.
//
// Greybox 1 builds the 🍄 Mushroom Forest (Moon's home track), the easy one: a wide road winding through a pine forest
// with gentle hills, ~800 m from the start line to the finish (about 60-80 s), and on it:
//   coins to steer through, gold arrow pads, and the forest's own trick, giant pink mushrooms: drive over one and she
//   goes *boing* up into the air, where more coins hang.
// Either side of the road is a strip of grass (she can drive on it, bumpier and slower), then a row of hay bales that
// boing her back on (she never leaves the track). The rice steps and the cloud come in greybox 2.
import { Road, type RoadPoint } from '../../../trip/road/road'
import { courseMap } from '../../../trip/race/course'
import type { CoinLine, Place } from '../../../trip/race/items'
import type { RoadLook } from '../../../trip/road/build'

export type TrackId = 'forest'
export const TRACK_IDS: TrackId[] = ['forest']

/** A giant bouncy mushroom on the road: its cap's middle and radius (meters); `big` throws her higher. */
export interface Mushroom {
  s: number
  lat: number
  r: number
  big?: boolean
}

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

export const TRACK_DEFS: Record<TrackId, TrackDef> = { forest: FOREST }

/** A track ready to race: its road, the race's length, and its things at their places along the road. */
export class Track {
  readonly road: Road
  readonly def: TrackDef
  /** Meters from the start line to the finish line. */
  readonly length: number
  readonly coins: CoinLine[]
  readonly pads: { s: number; lat: number }[]
  readonly mushrooms: Mushroom[]
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

  /** The mushroom under (s, lat), if any. */
  mushroomAt(s: number, lat: number) {
    return this.mushrooms.find((m) => (m.s - s) ** 2 + (m.lat - lat) ** 2 < m.r * m.r)
  }
}
