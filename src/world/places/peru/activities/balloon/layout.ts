// Luna's Thank-You Balloon lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens
// and one for tall ones. Everything is in stage units. The balloon hangs at the top left and stays there; the world
// changes under it (the coast, the mountains, the rainforest), each stop a scene of its own with three friends.
//
// A friend moves one of four ways, and catches a present on a line of its own:
//   ground: walks along the ground (feet on `y`), catches at head height; a present that lands first hops to them.
//   fly:    circles in the sky (`orbit`) and flies to meet a present wherever it is.
//   vine:   sits on (or hangs from) the vine at height `y`; a present snags on the vine and waits for them.
//   swim:   swims in the river (body centre on `y`) and leaps up to catch; a present that lands floats.

export type Stop = 'coast' | 'mountains' | 'forest'
export const STOPS: Stop[] = ['coast', 'mountains', 'forest']

export type FriendId = 'pepa' | 'chick' | 'lobo' | 'coco' | 'pluma' | 'tika' | 'sloth' | 'monkey' | 'rosa'
export const FRIENDS: Record<Stop, FriendId[]> = {
  coast: ['pepa', 'chick', 'lobo'],
  mountains: ['coco', 'pluma', 'tika'],
  forest: ['sloth', 'monkey', 'rosa'],
}
export const ALL_FRIENDS = STOPS.flatMap((s) => FRIENDS[s])

export type Move = 'ground' | 'fly' | 'vine' | 'swim'

export interface FriendSpot {
  /** Where they start (x), and the line they live on (feet for ground, the vine, the river's surface, the orbit's centre). */
  x: number
  y: number
  /** Height on the stage. */
  h: number
  /** Where they can go. */
  range: [number, number]
  /** Stage units a second. */
  speed: number
  /** Flyers: the loop they fly while nobody needs them (seconds per lap). */
  orbit?: { cx: number; cy: number; rx: number; ry: number; period: number; phase: number }
}

export interface BalloonLayout {
  tall: boolean
  w: number
  h: number
  /** The balloon: the envelope's centre and width, the basket's top, and where the presents hang. */
  balloon: { x: number; top: number; w: number; basketTop: number; basketW: number }
  presents: { x: number; y: number }[]
  present: number
  /** Ground lines per stop (presents that miss land here). */
  ground: Record<Stop, number>
  /** The coast: sand, the sea's surface, Lobo's rock. */
  sea: { x: number; y: number }
  rock: { x: number; y: number; w: number }
  /** The mountains: three terrace steps (left edge x, top y). */
  terraces: { x: number; y: number }[]
  /** The rainforest: the river, the vine (from tree to tree), the canopy's leaves (centre x and half width) at y. */
  river: number
  vine: { a: number; b: number; y: number }
  canopy: { y: number; leaves: { x: number; r: number }[] }
  friends: Record<FriendId, FriendSpot>
  /** Pokeables: where each lives (centre x, bottom y, height). */
  pokes: Record<string, { x: number; y: number; h: number }>
  /** The night: lantern buds in the canopy, and the thank-you lineup (feet line(s)). */
  lanterns: number[]
  lineup: { y: number; xs: number[] }[]
}

const WIDE: BalloonLayout = {
  tall: false,
  w: 1600,
  h: 1000,
  balloon: { x: 300, top: 70, w: 330, basketTop: 440, basketW: 320 },
  presents: [
    { x: 120, y: 640 },
    { x: 212, y: 668 },
    { x: 300, y: 650 },
    { x: 388, y: 672 },
    { x: 480, y: 640 },
  ],
  present: 96,
  ground: { coast: 870, mountains: 900, forest: 905 },
  sea: { x: 980, y: 885 },
  rock: { x: 1330, y: 820, w: 330 },
  terraces: [
    { x: -300, y: 900 },
    { x: 760, y: 840 },
    { x: 1180, y: 780 },
  ],
  river: 905,
  vine: { a: 560, b: 1560, y: 420 },
  canopy: {
    y: 660,
    leaves: [
      { x: 640, r: 110 },
      { x: 960, r: 120 },
      { x: 1330, r: 130 },
    ],
  },
  friends: {
    pepa: { x: 720, y: 870, h: 190, range: [560, 1040], speed: 260 },
    chick: { x: 880, y: 870, h: 108, range: [560, 1040], speed: 220 },
    lobo: { x: 1330, y: 826, h: 130, range: [1180, 1500], speed: 300 },
    coco: { x: 1000, y: 300, h: 180, range: [560, 1520], speed: 520, orbit: { cx: 1040, cy: 300, rx: 300, ry: 100, period: 9, phase: 0 } },
    pluma: { x: 1150, y: 600, h: 125, range: [600, 1500], speed: 380, orbit: { cx: 1000, cy: 600, rx: 220, ry: 60, period: 7, phase: 3 } },
    tika: { x: 1350, y: 784, h: 230, range: [1220, 1520], speed: 240 },
    sloth: { x: 820, y: 424, h: 125, range: [640, 1480], speed: 70 },
    monkey: { x: 1260, y: 424, h: 120, range: [640, 1480], speed: 360 },
    rosa: { x: 1080, y: 925, h: 96, range: [560, 1520], speed: 420 },
  },
  pokes: {
    crab: { x: 160, y: 900, h: 80 },
    tern: { x: 1420, y: 822, h: 90 },
    boat: { x: 1040, y: 930, h: 100 },
    pelican: { x: 1200, y: 250, h: 110 },
    llamaGrey: { x: 560, y: 908, h: 190 },
    viscacha: { x: 900, y: 846, h: 100 },
    bird: { x: 1500, y: 600, h: 110 },
    toucan: { x: 1520, y: 400, h: 110 },
    macaw: { x: 600, y: 410, h: 130 },
    frog: { x: 240, y: 905, h: 70 },
  },
  lanterns: [620, 760, 900, 1040, 1180, 1320, 1460],
  lineup: [{ y: 990, xs: [130, 300, 470, 640, 810, 980, 1150, 1320, 1490] }],
}

const TALL: BalloonLayout = {
  tall: true,
  w: 1000,
  h: 1400,
  balloon: { x: 300, top: 90, w: 300, basketTop: 440, basketW: 290 },
  presents: [
    { x: 110, y: 640 },
    { x: 205, y: 668 },
    { x: 300, y: 650 },
    { x: 395, y: 672 },
    { x: 490, y: 640 },
  ],
  present: 92,
  ground: { coast: 1210, mountains: 1250, forest: 1265 },
  sea: { x: 640, y: 1225 },
  rock: { x: 820, y: 1160, w: 300 },
  terraces: [
    { x: -300, y: 1250 },
    { x: 420, y: 1190 },
    { x: 700, y: 1130 },
  ],
  river: 1265,
  vine: { a: 60, b: 960, y: 900 },
  canopy: {
    y: 1110,
    leaves: [
      { x: 170, r: 110 },
      { x: 500, r: 115 },
      { x: 840, r: 110 },
    ],
  },
  friends: {
    pepa: { x: 300, y: 1210, h: 180, range: [110, 600], speed: 240 },
    chick: { x: 450, y: 1210, h: 104, range: [110, 600], speed: 210 },
    lobo: { x: 830, y: 1166, h: 120, range: [700, 940], speed: 280 },
    coco: { x: 650, y: 520, h: 165, range: [140, 900], speed: 500, orbit: { cx: 680, cy: 500, rx: 220, ry: 110, period: 9, phase: 0 } },
    pluma: { x: 720, y: 880, h: 120, range: [140, 900], speed: 360, orbit: { cx: 560, cy: 890, rx: 240, ry: 60, period: 7, phase: 3 } },
    tika: { x: 830, y: 1134, h: 220, range: [740, 930], speed: 220 },
    sloth: { x: 330, y: 904, h: 115, range: [140, 900], speed: 70 },
    monkey: { x: 760, y: 904, h: 112, range: [140, 900], speed: 340 },
    rosa: { x: 560, y: 1285, h: 90, range: [100, 900], speed: 400 },
  },
  pokes: {
    crab: { x: 100, y: 1240, h: 76 },
    tern: { x: 900, y: 1162, h: 84 },
    boat: { x: 700, y: 1345, h: 96 },
    pelican: { x: 800, y: 300, h: 100 },
    llamaGrey: { x: 230, y: 1258, h: 180 },
    viscacha: { x: 560, y: 1196, h: 92 },
    bird: { x: 930, y: 960, h: 100 },
    toucan: { x: 930, y: 840, h: 100 },
    macaw: { x: 70, y: 880, h: 110 },
    frog: { x: 70, y: 1265, h: 64 },
  },
  lanterns: [120, 260, 400, 540, 680, 820],
  lineup: [
    { y: 1190, xs: [110, 300, 500, 700, 890] },
    { y: 1380, xs: [190, 400, 610, 820] },
  ],
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)

/** The friends' look: how wide their picture box is (width / height). */
export const ASPECT: Record<FriendId, number> = {
  pepa: 240 / 290,
  chick: 180 / 190,
  lobo: 340 / 240,
  coco: 600 / 420,
  pluma: 1,
  tika: 980 / 1240,
  sloth: 512 / 412,
  monkey: 367 / 512,
  rosa: 1260 / 640,
}

export const MOVE: Record<FriendId, Move> = {
  pepa: 'ground',
  chick: 'ground',
  lobo: 'ground',
  coco: 'fly',
  pluma: 'fly',
  tika: 'ground',
  sloth: 'vine',
  monkey: 'vine',
  rosa: 'swim',
}

/** The canopy's gaps: where a leaf isn't (for presents bouncing off a leaf toward the nearest gap). */
export function leafAt(S: BalloonLayout, x: number) {
  return S.canopy.leaves.find((l) => Math.abs(x - l.x) < l.r) ?? null
}
