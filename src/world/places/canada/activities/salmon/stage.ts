// Salmon Leap's two logical stages (wide 1600 x 1000, tall 1000 x 1500) and the river on each. One camera: a straight-on,
// eye-level side view of a rainforest river, like a theater stage: the water flows down from the right to the left in a
// staircase of pools, each spilling over a rock lip into the one below. The salmon start in the bottom pool (from the
// sea, off the left edge) and go up to the top pool, the stream where they were born (off the right edge).
// Plain data, no React.

export type Pt = [number, number]

/** One pool of the staircase: its water spans x0..x1 (the lower pool's right end is the rock face of the lip under the
 *  upper one), its surface is at y, its floor at y + d. */
export interface Pool {
  x0: number
  x1: number
  y: number
  d: number
}
/** A rock poking out of a pool (salmon bounce off it). */
export interface Rock {
  x: number
  y: number
  r: number
}
/** A springy log leaning up a lip, from its foot in the lower pool to its top on the lip. */
export interface Log {
  a: Pt
  b: Pt
}
export interface Bear {
  spirit: boolean
  /** The lip she stands on (the pool she stands in is lip + 1). */
  lip: number
}

export type RiverKind = 'steps' | 'falls' | 'eggs'
export interface River {
  pools: Pool[]
  rocks: Rock[]
  logs: Log[]
  /** Where the bears stand (the bears' section only). */
  bears: Bear[]
  /** The rock lip's width: the face is at the upper pool's x0, and its top a little under the upper pool's water. */
  lipW: number
}

export interface StageDef {
  w: number
  h: number
  /** The forest floor behind the river (the banks' top). */
  bank: number
  /** Maple sits on the bank above the top pool (a salmon flicked too hard lands in her lap). */
  maple: Pt
  /** The berry bushes on the bank, where the bears go once they give up fishing. */
  berries: Pt[]
  /** The giant cedar on the far bank: its foot x, how tall (it goes off the top of the stage). */
  cedar: [number, number]
  /** The raven's branch on the cedar. */
  raven: Pt
  /** The banana slug's mossy log, on the far bank. */
  slug: Pt
  /** The rain cloud. */
  cloud: Pt
  /** The bald eagle circles here. */
  eagle: { x: number; y: number; rx: number; ry: number }
  /** Spruces along the back: [x, base y, height]. */
  trees: [number, number, number][]
  rivers: Record<RiverKind, River>
}

const BIG = 4000
/** A staircase of pools from its surfaces (bottom first) and the x of each lip's face. */
function stairs(ys: number[], lips: number[], d: number): Pool[] {
  return ys.map((y, i) => ({ x0: i === 0 ? -BIG : lips[i - 1], x1: i === ys.length - 1 ? BIG : lips[i], y, d }))
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  bank: 330,
  maple: [1500, 330],
  berries: [[1300, 330], [1400, 336]],
  cedar: [150, 900],
  raven: [215, 190],
  slug: [600, 336],
  cloud: [760, 110],
  eagle: { x: 900, y: 200, rx: 220, ry: 50 },
  trees: [[420, 340, 230], [560, 334, 180], [980, 340, 210], [1120, 330, 170], [1650, 336, 220]],
  rivers: {
    steps: { pools: stairs([840, 735, 630, 525, 420], [380, 660, 940, 1220], 90), rocks: [], logs: [], bears: [], lipW: 40 },
    falls: {
      pools: stairs([850, 685, 520, 355], [480, 840, 1200], 100),
      rocks: [{ x: 290, y: 842, r: 44 }],
      logs: [{ a: [650, 745], b: [826, 536] }],
      bears: [],
      lipW: 46,
    },
    eggs: { pools: [{ x0: -BIG, x1: BIG, y: 640, d: 220 }], rocks: [], logs: [], bears: [], lipW: 0 },
  },
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  bank: 520,
  maple: [920, 520],
  berries: [[700, 520], [800, 526]],
  cedar: [70, 1100],
  raven: [130, 360],
  slug: [330, 526],
  cloud: [520, 240],
  eagle: { x: 560, y: 380, rx: 170, ry: 46 },
  trees: [[300, 530, 200], [460, 524, 160], [1040, 528, 200]],
  rivers: {
    steps: { pools: stairs([1370, 1240, 1110, 980, 850], [230, 420, 610, 800], 90), rocks: [], logs: [], bears: [], lipW: 34 },
    falls: {
      pools: stairs([1390, 1180, 970, 760], [330, 580, 820], 110),
      rocks: [{ x: 170, y: 1382, r: 40 }],
      logs: [{ a: [420, 1230], b: [566, 984] }],
      bears: [],
      lipW: 40,
    },
    eggs: { pools: [{ x0: -BIG, x1: BIG, y: 1000, d: 260 }], rocks: [], logs: [], bears: [], lipW: 0 },
  },
}

/** The bears' falls: the big falls with a bear on its two upper lips (`spirit` says which lip the white one takes). */
export function bearsRiver(st: StageDef, spirit: 'high' | 'low'): River {
  const f = st.rivers.falls
  return { ...f, logs: [], bears: [{ spirit: spirit === 'low', lip: 1 }, { spirit: spirit === 'high', lip: 2 }] }
}

/** The pool at x (the one whose span holds it). */
export function poolAt(r: River, x: number) {
  for (let i = r.pools.length - 1; i >= 0; i--) if (x >= r.pools[i].x0 - (i > 0 ? r.lipW : 0)) return i
  return 0
}
/** The rock face under the upper pool of lip i (between pools i and i + 1): its x, and its top. */
export function lip(r: River, i: number) {
  const p = r.pools[i + 1]
  return { x: p.x0 - r.lipW, top: p.y + 8 }
}
/** Where a bear standing on lip i is: feet in the upper pool's water by the lip, facing left down the falls. */
export function bearAt(r: River, i: number) {
  const p = r.pools[i + 1]
  return { x: p.x0 + 40, y: p.y + 30 }
}

/** A tiny seeded random, so a run's little choices differ between runs. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}
