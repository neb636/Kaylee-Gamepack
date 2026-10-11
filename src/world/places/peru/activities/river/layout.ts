// Rosa's Rainy River lays out on a logical stage that scales to fit (AGENTS.md "Screens"): one for wide screens and one
// for tall ones. Everything is in stage units. The world is two screens wide: the river (where she starts) and the
// lily lagoon to its right; the camera pans over once the river is full.
//
// The river is drawn as a cut-away (side view): the bank's grass line, the riverbed dipping under it, and the water
// filling the riverbed from a small dry-season pool up to the brim. Water levels are kept as a share (0..1) so a
// rotation mid-play keeps her progress.

export interface Pt {
  x: number
  y: number
}

export interface RiverLayout {
  tall: boolean
  /** Visible stage. */
  w: number
  h: number
  /** Whole world width, and how far the camera pans to show the lagoon. */
  worldW: number
  camLagoon: number
  /** The grass line of the forest floor. */
  bank: number
  /** The river's riverbed (left lip → bottom → right lip), the dry-season pool, and the brim. */
  river: Pt[]
  riverLow: number
  riverHigh: number
  /** The lily lagoon's basin, same idea. */
  lagoon: Pt[]
  lagoonLow: number
  lagoonHigh: number
  cloud: { w: number; y0: number; yMin: number; yMax: number }
  /** Tall trees standing on the river's slopes (base = where the trunk meets the ground). */
  slothTree: { x: number; base: number; h: number }
  monkeyTree: { x: number; base: number; h: number }
  /** One more big tree behind the lagoon's far bank. */
  lagoonTree: { x: number; h: number }
  /** Birds in the lagoon tree (a toucan on its branch, a macaw in its crown). */
  lagoonBirds: { x: number; y: number; h: number }[]
  /** A liana hangs in a loop from the sloth tree's branch (between a and b, at branch height y); the sloth grips its
   *  bottom, low over the river (x = middle of its claws, y = top of the sloth). */
  liana: { a: number; b: number; y: number }
  sloth: { x: number; y: number; h: number }
  monkeys: { x: number; y: number; h: number }[]
  macaws: { x: number; y: number; h: number }[]
  toucan: { x: number; y: number; h: number }
  fruits: Pt[]
  plants: { x: number; h: number }[]
  frog: { x: number; h: number }
  ants: { x0: number; x1: number }
  puddle: { x: number; w: number }
  /** Capybaras rest on the dry-season sandbar inside the riverbed (feet on the riverbed). */
  capys: { x: number; h: number; baby?: boolean }[]
  canoe: { x: number; w: number }
  /** Sparkle stands on the bank by the river, then by the lagoon. */
  sparkle: { x: [number, number]; h: number }
  rosa: number
  butterflies: Pt[]
  /** Lily buds on the lagoon floor; the friends wait on the lagoon's far bank. */
  buds: number[]
  pad: number
  waiting: number[]
  critter: number
}

const WIDE: RiverLayout = {
  tall: false,
  w: 1600,
  h: 1000,
  worldW: 3150,
  camLagoon: 1550,
  bank: 700,
  river: [
    { x: 330, y: 700 },
    { x: 420, y: 800 },
    { x: 520, y: 900 },
    { x: 640, y: 935 },
    { x: 820, y: 975 },
    { x: 1000, y: 935 },
    { x: 1120, y: 890 },
    { x: 1220, y: 790 },
    { x: 1300, y: 700 },
  ],
  riverLow: 930,
  riverHigh: 664,
  lagoon: [
    { x: 1830, y: 700 },
    { x: 1930, y: 820 },
    { x: 2060, y: 915 },
    { x: 2350, y: 965 },
    { x: 2640, y: 915 },
    { x: 2770, y: 820 },
    { x: 2870, y: 700 },
  ],
  lagoonLow: 915,
  lagoonHigh: 735,
  cloud: { w: 340, y0: 300, yMin: 270, yMax: 410 },
  slothTree: { x: 440, base: 815, h: 760 },
  monkeyTree: { x: 1180, base: 840, h: 780 },
  lagoonTree: { x: 3010, h: 700 },
  lagoonBirds: [
    { x: 2850, y: 425, h: 100 },
    { x: 3060, y: 230, h: 110 },
  ],
  liana: { a: 506, b: 670, y: 473 },
  sloth: { x: 588, y: 612, h: 170 },
  monkeys: [
    { x: 1010, y: 462, h: 110 },
    { x: 1095, y: 462, h: 104 },
  ],
  macaws: [
    { x: 250, y: 300, h: 120 },
    { x: 690, y: 370, h: 110 },
  ],
  toucan: { x: 1400, y: 270, h: 110 },
  fruits: [
    { x: 1030, y: 300 },
    { x: 1200, y: 250 },
    { x: 1300, y: 300 },
  ],
  plants: [
    { x: 45, h: 150 },
    { x: 280, h: 150 },
    { x: 3090, h: 150 },
  ],
  frog: { x: 160, h: 70 },
  ants: { x0: 0, x1: 320 },
  puddle: { x: 1355, w: 100 },
  capys: [
    { x: 540, h: 120 },
    { x: 625, h: 82, baby: true },
  ],
  canoe: { x: 1110, w: 260 },
  sparkle: { x: [1500, 1660], h: 210 },
  rosa: 300,
  butterflies: [
    { x: 120, y: 520 },
    { x: 1450, y: 470 },
    { x: 2500, y: 520 },
  ],
  buds: [2120, 2350, 2580],
  pad: 230,
  waiting: [2930, 3040, 1790],
  critter: 1,
}

const TALL: RiverLayout = {
  tall: true,
  w: 1000,
  h: 1400,
  worldW: 2100,
  camLagoon: 1100,
  bank: 1000,
  river: [
    { x: 230, y: 1000 },
    { x: 290, y: 1120 },
    { x: 360, y: 1240 },
    { x: 450, y: 1300 },
    { x: 520, y: 1340 },
    { x: 600, y: 1300 },
    { x: 680, y: 1240 },
    { x: 740, y: 1120 },
    { x: 800, y: 1000 },
  ],
  riverLow: 1290,
  riverHigh: 964,
  lagoon: [
    { x: 1300, y: 1000 },
    { x: 1350, y: 1130 },
    { x: 1420, y: 1250 },
    { x: 1590, y: 1310 },
    { x: 1760, y: 1250 },
    { x: 1830, y: 1130 },
    { x: 1880, y: 1000 },
  ],
  lagoonLow: 1262,
  lagoonHigh: 1030,
  cloud: { w: 320, y0: 360, yMin: 320, yMax: 540 },
  slothTree: { x: 290, base: 1110, h: 830 },
  monkeyTree: { x: 760, base: 1075, h: 820 },
  lagoonTree: { x: 2010, h: 820 },
  lagoonBirds: [
    { x: 1850, y: 668, h: 95 },
    { x: 2040, y: 440, h: 100 },
  ],
  liana: { a: 361, b: 539, y: 731 },
  sloth: { x: 450, y: 930, h: 160 },
  monkeys: [
    { x: 580, y: 668, h: 100 },
    { x: 665, y: 668, h: 95 },
  ],
  macaws: [
    { x: 90, y: 470, h: 110 },
    { x: 330, y: 560, h: 100 },
  ],
  toucan: { x: 930, y: 400, h: 100 },
  fruits: [
    { x: 600, y: 440 },
    { x: 740, y: 390 },
    { x: 870, y: 450 },
  ],
  plants: [
    { x: 40, h: 140 },
    { x: 1240, h: 140 },
    { x: 2060, h: 140 },
  ],
  frog: { x: 140, h: 64 },
  ants: { x0: 0, x1: 220 },
  puddle: { x: 1050, w: 100 },
  capys: [
    { x: 380, h: 105 },
    { x: 465, h: 72, baby: true },
  ],
  canoe: { x: 690, w: 200 },
  sparkle: { x: [912, 1170], h: 190 },
  rosa: 260,
  butterflies: [
    { x: 60, y: 760 },
    { x: 900, y: 700 },
    { x: 1650, y: 760 },
  ],
  buds: [1445, 1590, 1735],
  pad: 165,
  waiting: [1945, 2040, 1262],
  critter: 0.9,
}

export const pickLayout = (W: number, H: number) => (W >= H ? WIDE : TALL)

/** The ground's height at x: the riverbed or lagoon basin where it dips, the grass line elsewhere. */
export function groundAt(S: RiverLayout, x: number) {
  for (const pts of [S.river, S.lagoon]) {
    if (x <= pts[0].x || x >= pts[pts.length - 1].x) continue
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]
      const b = pts[i]
      if (x <= b.x) return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x)
    }
  }
  return S.bank
}

/** The water surface for a fill share (0 = the little dry-season pool, 1 = brim full). */
export const levelY = (low: number, high: number, f: number) => low + (high - low) * Math.max(0, Math.min(1, f))

/** Left and right edges of the water at height y in a basin (where the surface meets the banks). */
export function waterSpan(pts: Pt[], y: number): [number, number] {
  let left = pts[0].x
  let right = pts[pts.length - 1].x
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    if (a.y < y && b.y >= y) left = a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y)
    if (a.y >= y && b.y < y) right = a.x + ((b.x - a.x) * (y - a.y)) / (b.y - a.y)
  }
  return [left, right]
}

/** The riverbed curve (smoothed through the points), as path commands after an `M` to its first point. */
function curve(pts: Pt[]) {
  let d = ''
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1]
    const q = pts[i]
    d += i === 1 ? ` L${(p.x + q.x) / 2} ${(p.y + q.y) / 2}` : ` Q${p.x} ${p.y} ${(p.x + q.x) / 2} ${(p.y + q.y) / 2}`
  }
  const last = pts[pts.length - 1]
  return d + ` L${last.x} ${last.y}`
}

/** The hollow of a basin (everything above its riverbed, between its lips): water is clipped to this. */
export function hollowPath(pts: Pt[]) {
  const top = Math.min(...pts.map((p) => p.y)) - 800
  const last = pts[pts.length - 1]
  return `M${pts[0].x} ${pts[0].y}${curve(pts)} L${last.x} ${top} L${pts[0].x} ${top}Z`
}

/** The ground's top line across the whole world (grass, dipping into the river and the lagoon). */
export function groundLine(S: RiverLayout, pad = 200) {
  return `M${-pad} ${S.bank} L${S.river[0].x} ${S.bank}${curve(S.river)} L${S.lagoon[0].x} ${S.bank}${curve(S.lagoon)} L${S.worldW + pad} ${S.bank}`
}

/** The ground as a filled shape down past the bottom of the stage. */
export const groundShape = (S: RiverLayout, pad = 200) => `${groundLine(S, pad)} L${S.worldW + pad} ${S.h + 400} L${-pad} ${S.h + 400}Z`
