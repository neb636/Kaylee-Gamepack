// Animal Bridge's two logical stages (wide 1600 x 1000, tall 1000 x 1500), the ground she can lead the animals on, and
// their placeholder looks. One camera: a straight-on, eye-level view down the Trans-Canada Highway in Banff, like a
// theater stage: the Rockies at the back, the highway coming toward us in its fenced cut, the green animal bridge
// across it, the forest on the left bank (where the families wait) and the meadow on the right (where they want to go).
// The ground is a band from the treeline down to the front of the stage: lower on screen is nearer. Plain data, no React.

export type Pt = [number, number]

/** The families, in the order they usually cross (any order works). */
export const FAMILIES = ['elk', 'sheep', 'bears'] as const
export type FamilyId = (typeof FAMILIES)[number]
export type Kind = 'elk' | 'calf' | 'ram' | 'ewe' | 'lamb' | 'grizzly' | 'cub'
/** Each family's line, the leader (mama, or the big ram) first. */
export const MEMBERS: Record<FamilyId, Kind[]> = {
  elk: ['elk', 'calf', 'calf', 'calf'],
  sheep: ['ram', 'ram', 'ewe', 'lamb'],
  bears: ['grizzly', 'cub', 'cub'],
}
export const EMOJI: Record<FamilyId, string> = { elk: '🦌', sheep: '🐏', bears: '🐻' }
export const NAMES: Record<FamilyId, string> = { elk: 'The elk family', sheep: 'The bighorn sheep', bears: 'The grizzlies' }

export interface StageDef {
  w: number
  h: number
  /** The land's back edge (the treeline), where the highway disappears into the forest. */
  back: number
  /** How far back and how far forward the animals can walk. */
  yMin: number
  yMax: number
  /** The highway's cut: its middle, and its half width at the back edge and at the stage's bottom edge. */
  road: { x: number; top: number; bottom: number }
  /** The bridge's walkway: the band of depth it spans the cut at. */
  deck: [number, number]
  /** How much the walkway humps up in the middle. */
  hump: number
  /** The rocky way: a pile of boulders against the fence on the forest side, right on the way to the bridge. */
  rocks: { x: number; y: number; rx: number; ry: number }
  /** Where each family waits in the forest, leader first. */
  wait: Record<FamilyId, Pt[]>
  /** Where each family grazes in the meadow once it's across, leader first. */
  meadow: Record<FamilyId, Pt[]>
  /** The wildlife camera's post (its foot), by the bridge's meadow end. */
  camera: Pt
  /** The Rockies: peaks [x, y], standing on `back`. */
  peaks: Pt[]
  /** The mountain goat's ledges on the nearest peak. */
  goat: Pt[]
  /** Banff town in the valley: its left end, width and street (y). */
  town: { x: number; w: number; y: number }
  /** The bald eagle circles here. */
  eagle: { x: number; y: number; rx: number; ry: number }
  /** Where the wolf peeks out of the forest. */
  wolf: Pt
  /** Spruces along the back of each bank: [x, base y, height]. */
  trees: [number, number, number][]
  /** Where Maple stands watching, in the meadow (her feet), and how tall she is. */
  maple: Pt
  mapleH: number
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  back: 470,
  yMin: 498,
  yMax: 968,
  road: { x: 800, top: 110, bottom: 330 },
  deck: [575, 650],
  hump: 26,
  rocks: { x: 492, y: 722, rx: 112, ry: 54 },
  wait: {
    elk: [[400, 880], [315, 892], [230, 880], [145, 892]],
    sheep: [[330, 598], [250, 610], [170, 598], [92, 612]],
    bears: [[245, 762], [165, 782], [90, 756]],
  },
  meadow: {
    elk: [[1250, 760], [1170, 785], [1335, 792], [1410, 762]],
    sheep: [[1210, 905], [1295, 925], [1380, 902], [1465, 930]],
    bears: [[1490, 830], [1540, 870], [1420, 860]],
  },
  camera: [1112, 702],
  peaks: [[160, 250], [520, 150], [880, 250], [1240, 175], [1560, 255]],
  goat: [[478, 245], [566, 292], [440, 322]],
  town: { x: 1180, w: 250, y: 462 },
  eagle: { x: 1040, y: 190, rx: 170, ry: 50 },
  wolf: [128, 520],
  trees: [
    [36, 500, 230],
    [148, 492, 190],
    [262, 506, 220],
    [560, 486, 170],
    [1050, 490, 160],
    [1190, 500, 200],
    [1540, 504, 230],
  ],
  maple: [1515, 640],
  mapleH: 190,
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  back: 640,
  yMin: 668,
  yMax: 1460,
  road: { x: 500, top: 66, bottom: 200 },
  deck: [800, 872],
  hump: 22,
  rocks: { x: 300, y: 960, rx: 96, ry: 52 },
  wait: {
    elk: [[262, 1290], [192, 1330], [122, 1300], [62, 1340]],
    sheep: [[210, 748], [142, 764], [80, 748], [30, 770]],
    bears: [[190, 1112], [118, 1136], [56, 1106]],
  },
  meadow: {
    elk: [[790, 1000], [870, 1030], [730, 1062], [935, 1072]],
    sheep: [[775, 1200], [855, 1232], [935, 1196], [745, 1262]],
    bears: [[815, 1380], [910, 1404], [770, 1426]],
  },
  camera: [700, 940],
  peaks: [[110, 430], [380, 330], [650, 410], [900, 350]],
  goat: [[352, 428], [418, 466], [306, 492]],
  town: { x: 700, w: 230, y: 632 },
  eagle: { x: 640, y: 300, rx: 150, ry: 46 },
  wolf: [92, 690],
  trees: [
    [40, 670, 220],
    [160, 658, 180],
    [660, 660, 150],
    [880, 666, 200],
  ],
  maple: [905, 775],
  mapleH: 170,
}

/** Animals keep this far from the cut's edge (the wildlife fence stands on it). */
export const FENCE_GAP = 26
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** The cut's half width at depth y. */
export function halfCut(st: StageDef, y: number) {
  return lerp(st.road.top, st.road.bottom, (y - st.back) / (st.h - st.back))
}
export const onDeck = (st: StageDef, y: number) => y >= st.deck[0] && y <= st.deck[1]
/** The bridge's ends: where the walkway meets the banks (it reaches a little past the fences). */
export function deckEnds(st: StageDef): [number, number] {
  const hw = halfCut(st, (st.deck[0] + st.deck[1]) / 2) + FENCE_GAP + 70
  return [st.road.x - hw, st.road.x + hw]
}
/** Over the cut, between the fences (on the walkway, or in the highway if not on it). */
export const overCut = (st: StageDef, x: number, y: number) => Math.abs(x - st.road.x) < halfCut(st, y) + FENCE_GAP
/** Somewhere an animal can stand: on a bank, or on the bridge (never in the highway). `x0`/`x1` keep it on screen. */
export function walkable(st: StageDef, x: number, y: number, x0: number, x1: number) {
  if (y < st.yMin || y > st.yMax || x < x0 || x > x1) return false
  return !overCut(st, x, y) || onDeck(st, y)
}
/** On the bridge's walkway (over the cut, and `margin` past the fences onto its ends): where plants grow, and where
 *  the shy bears won't step while it's bare (they stop a little further out). */
export const onBridge = (st: StageDef, x: number, y: number, margin = 40) => onDeck(st, y) && Math.abs(x - st.road.x) < halfCut(st, y) + FENCE_GAP + margin
/** The meadow, across the highway from the forest. */
export const inMeadow = (st: StageDef, x: number, y: number) => x > st.road.x + halfCut(st, y) + FENCE_GAP + 30 && y > st.deck[1] + 6
export const acrossOf = (st: StageDef, x: number) => x > st.road.x
export function onRocks(st: StageDef, x: number, y: number) {
  const r = st.rocks
  return ((x - r.x) / r.rx) ** 2 + ((y - r.y) / r.ry) ** 2 < 1
}
/** How far up the walkway lifts something standing at x on it (0 off it). */
export function lift(st: StageDef, x: number, y: number) {
  if (!onDeck(st, y)) return 0
  const [a, b] = deckEnds(st)
  const p = (x - a) / (b - a)
  return p <= 0 || p >= 1 ? 0 : st.hump * Math.sin(p * Math.PI)
}
/** Things further back are drawn a little smaller. */
export const depth = (st: StageDef, y: number) => 0.78 + 0.32 * Math.max(0, Math.min(1, (y - st.back) / (st.h - st.back)))

// ---------------------------------------------------------------- the animals (placeholder shapes)

export interface Look {
  /** Body ellipse half sizes. */
  rx: number
  ry: number
  /** Leg length (feet at y 0) and width. */
  legs: number
  legW: number
  /** Head radius, and where the head sits from the body's middle (facing right). */
  head: number
  neck: Pt
  fill: string
  dark: string
  light: string
  ears: 'tall' | 'side' | 'round'
  horns?: boolean
  spots?: boolean
  hump?: boolean
  rump?: boolean
}

export const LOOKS: Record<Kind, Look> = {
  elk: { rx: 70, ry: 36, legs: 50, legW: 13, head: 23, neck: [88, -40], fill: '#A8703E', dark: '#6E4426', light: '#E6CFA2', ears: 'tall', rump: true },
  calf: { rx: 42, ry: 23, legs: 34, legW: 9, head: 17, neck: [52, -26], fill: '#B9844E', dark: '#7A5030', light: '#F2E2C2', ears: 'tall', spots: true },
  ram: { rx: 56, ry: 33, legs: 36, legW: 12, head: 21, neck: [60, -30], fill: '#9A8068', dark: '#6A523E', light: '#F4ECDC', ears: 'side', horns: true, rump: true },
  ewe: { rx: 50, ry: 30, legs: 33, legW: 11, head: 18, neck: [54, -27], fill: '#A48A72', dark: '#72594A', light: '#F4ECDC', ears: 'side', rump: true },
  lamb: { rx: 32, ry: 20, legs: 25, legW: 8, head: 14, neck: [35, -18], fill: '#B49A80', dark: '#80664E', light: '#FAF4E8', ears: 'side', rump: true },
  grizzly: { rx: 78, ry: 48, legs: 30, legW: 22, head: 31, neck: [74, -20], fill: '#8A5A34', dark: '#5E3A20', light: '#C89A6A', ears: 'round', hump: true },
  cub: { rx: 40, ry: 27, legs: 19, legW: 13, head: 20, neck: [40, -12], fill: '#9A683E', dark: '#6A4428', light: '#D8AA7A', ears: 'round' },
}

/** A tiny seeded random, so a run's little choices (the cars, the wolf) differ between runs. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967296
  }
}

/** Where the painted Rockies (art.ts `mountains`) stand: along the treeline, a little wider than the stage, and a bit
 *  flatter than painted so the peaks stay clear of the top bar. */
export function mountainsBox(st: StageDef) {
  const w = st.w + (st.w > st.h ? 100 : 120)
  const h = (w / 3.01) * (st.w > st.h ? 0.7 : 0.8)
  return { x: (st.w - w) / 2, y: st.back + 12 - h, w, h }
}
// The mountain goat's ledges: on the second peak's left slope in the painting (fractions of the picture).
for (const st of [WIDE, TALL]) {
  const m = mountainsBox(st)
  st.goat = ([[0.265, 0.43], [0.335, 0.52], [0.235, 0.62]] as Pt[]).map(([fx, fy]) => [Math.round(m.x + fx * m.w), Math.round(m.y + fy * m.h)])
}
