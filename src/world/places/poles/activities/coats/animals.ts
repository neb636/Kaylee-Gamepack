// Snow Coats' greybox animals and stage layouts: flat placeholder shapes in the 2D look (straight-on side view, feet on
// the ground line at y = 0, facing right, in local units). Each shape is a list of simple parts (ellipses and polygons)
// drawn three times by SnowCoats.tsx: an ink silhouette (the 5-unit outline), the summer-brown coat, and the white coat
// masked by her strokes. The same parts give the coat's grid of cells, which says how much of the coat is white.
// Plain TypeScript (no React, no perfect-freehand).

export type Part = { e: [cx: number, cy: number, rx: number, ry: number, rot?: number] } | { p: number[] }

export type CoatId = 'fox' | 'hare' | 'ptarmigan' | 'lemming'
export const COAT_IDS: readonly CoatId[] = ['fox', 'hare', 'ptarmigan', 'lemming']

export interface Face {
  eyes: [x: number, y: number, r: number][]
  nose?: [x: number, y: number, r: number]
  /** A dark beak (the ptarmigan). */
  beak?: number[]
}

export interface Shape {
  parts: Part[]
  face: Face
  brown: string
  /** Bounding box of the parts. */
  box: { x: number; y: number; w: number; h: number }
}

const leg = (x: number, top: number, w: number): Part => ({ p: [x - w / 2, top, x + w / 2, top, x + w / 2, 0, x - w / 2, 0] })

function shape(parts: Part[], face: Face, brown: string): Shape {
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const pt of parts) {
    if ('e' in pt) {
      const [cx, cy, rx, ry] = pt.e
      const r = Math.max(rx, ry)
      x0 = Math.min(x0, cx - r)
      x1 = Math.max(x1, cx + r)
      y0 = Math.min(y0, cy - r)
      y1 = Math.max(y1, cy + r)
    } else {
      for (let i = 0; i < pt.p.length; i += 2) {
        x0 = Math.min(x0, pt.p[i])
        x1 = Math.max(x1, pt.p[i])
        y0 = Math.min(y0, pt.p[i + 1])
        y1 = Math.max(y1, pt.p[i + 1])
      }
    }
  }
  return { parts, face, brown, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } }
}

export const SHAPES: Record<CoatId | 'bear' | 'owl', Shape> = {
  // A long fox with a big brush of a tail and pointy ears.
  fox: shape(
    [
      { e: [-125, -92, 72, 32, -22] },
      leg(-62, -70, 24),
      leg(-30, -70, 24),
      leg(42, -70, 24),
      leg(72, -70, 24),
      { e: [0, -82, 96, 48] },
      { p: [78, -150, 90, -204, 114, -160] },
      { p: [108, -160, 130, -204, 140, -150] },
      { e: [106, -128, 46, 40] },
      { p: [128, -142, 180, -120, 128, -104] },
    ],
    { eyes: [[120, -136, 8]], nose: [177, -120, 7] },
    '#A9764B',
  ),
  // A hare sitting up, long ears.
  hare: shape(
    [
      { e: [-64, -56, 20, 18] },
      { e: [-4, -14, 70, 16] },
      { e: [0, -78, 62, 70] },
      { e: [44, -20, 20, 12] },
      { e: [22, -238, 13, 50, -12] },
      { e: [52, -234, 13, 50, 12] },
      { e: [40, -166, 42, 36] },
    ],
    { eyes: [[56, -174, 7]], nose: [80, -160, 6] },
    '#9C7A55',
  ),
  // A plump round ground bird (rock ptarmigan), feathered feet.
  ptarmigan: shape(
    [
      { p: [-46, -84, -98, -100, -98, -60, -46, -50] },
      { e: [-12, -10, 15, 14] },
      { e: [22, -10, 15, 14] },
      { e: [0, -64, 64, 48] },
      { e: [54, -114, 32, 29] },
    ],
    { eyes: [[62, -120, 7]], beak: [82, -124, 104, -112, 82, -102] },
    '#97704E',
  ),
  // A round little lemming.
  lemming: shape(
    [
      { e: [-32, -5, 15, 7] },
      { e: [36, -5, 15, 7] },
      { e: [0, -40, 72, 40] },
      { e: [42, -78, 11, 10] },
      { e: [56, -50, 34, 30] },
    ],
    { eyes: [[70, -58, 6]], nose: [89, -48, 5] },
    '#8B6A4C',
  ),
  // The polar bear: white all year (never painted).
  bear: shape(
    [
      leg(-100, -100, 48),
      leg(-48, -100, 48),
      leg(62, -100, 48),
      leg(112, -100, 48),
      { e: [0, -128, 156, 82] },
      { e: [-150, -150, 18, 16] },
    ],
    { eyes: [] },
    '#F4F6FB',
  ),
  // The snowy owl, front on: white all year.
  owl: shape(
    [
      { e: [-14, -4, 14, 8] },
      { e: [14, -4, 14, 8] },
      { e: [0, -78, 50, 72] },
      { e: [-44, -80, 18, 52, 12] },
      { e: [44, -80, 18, 52, -12] },
      { e: [0, -152, 44, 38] },
    ],
    { eyes: [[-17, -156, 9], [17, -156, 9]], beak: [-7, -144, 7, -144, 0, -128] },
    '#F4F6FB',
  ),
}

/** The bear's head, on its own pivot (it sniffs down and looks around). In the bear's local units, pivot at the neck. */
export const BEAR_HEAD: { pivot: [number, number]; parts: Part[]; face: Face } = {
  pivot: [140, -150],
  parts: [
    { e: [150, -206, 15, 13] },
    { e: [190, -208, 15, 13] },
    { e: [172, -162, 62, 48] },
    { e: [226, -146, 34, 24] },
  ],
  face: { eyes: [[190, -172, 8]], nose: [256, -150, 10] },
}

function inEllipse(x: number, y: number, [cx, cy, rx, ry, rot = 0]: [number, number, number, number, number?]) {
  const a = (-rot * Math.PI) / 180
  const dx = x - cx
  const dy = y - cy
  const u = dx * Math.cos(a) - dy * Math.sin(a)
  const v = dx * Math.sin(a) + dy * Math.cos(a)
  return (u * u) / (rx * rx) + (v * v) / (ry * ry) <= 1
}

function inPoly(x: number, y: number, p: number[]) {
  let inside = false
  for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
    const xi = p[i]
    const yi = p[i + 1]
    const xj = p[j]
    const yj = p[j + 1]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export const inShape = (s: Shape, x: number, y: number) => s.parts.some((pt) => ('e' in pt ? inEllipse(x, y, pt.e) : inPoly(x, y, pt.p)))

/** The coat as a grid of cells (1 = white). */
export interface CoatGrid {
  /** Cell size, local units. */
  cell: number
  x0: number
  y0: number
  cols: number
  rows: number
  /** Index of each cell inside the shape, or -1. */
  index: Int32Array
  /** Centers of the inside cells. */
  xs: Float32Array
  ys: Float32Array
  /** The edge cells' indexes (where the fluff grows). */
  edge: number[]
}

export function coatGrid(s: Shape, cell = 8): CoatGrid {
  const { x, y, w, h } = s.box
  const cols = Math.ceil(w / cell) + 1
  const rows = Math.ceil(h / cell) + 1
  const index = new Int32Array(cols * rows).fill(-1)
  const xs: number[] = []
  const ys: number[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + (c + 0.5) * cell
      const cy = y + (r + 0.5) * cell
      if (!inShape(s, cx, cy)) continue
      index[r * cols + c] = xs.length
      xs.push(cx)
      ys.push(cy)
    }
  }
  // Edge cells (an outside neighbour), thinned out to one every ~3 cells along the edge.
  const edge: number[] = []
  const at = (c: number, r: number) => (c < 0 || r < 0 || c >= cols || r >= rows ? -1 : index[r * cols + c])
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = at(c, r)
      if (i < 0) continue
      if (at(c - 1, r) >= 0 && at(c + 1, r) >= 0 && at(c, r - 1) >= 0 && at(c, r + 1) >= 0) continue
      // Not on the feet (fluff on the ground line looks like a snowbank).
      if (ys[i] > -10) continue
      if (edge.some((e) => Math.hypot(xs[e] - xs[i], ys[e] - ys[i]) < cell * 3)) continue
      edge.push(i)
    }
  }
  return { cell, x0: x, y0: y, cols, rows, index, xs: Float32Array.from(xs), ys: Float32Array.from(ys), edge }
}

/** The stage: one for wide screens, one for tall, in stage units. Nothing that matters leaves it. */
export interface StageDef {
  w: number
  h: number
  /** The ground line (the horizon of the snowy tundra). */
  ground: number
  /** The fox in the first section. */
  fox: Spot
  /** Where each animal stands for hide and seek and the summer. */
  spots: Record<CoatId, Spot>
  owl: Spot
  /** The bear walks along here. */
  bear: { y: number; s: number }
  sun: [number, number]
}
export interface Spot {
  x: number
  y: number
  s: number
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  ground: 600,
  fox: { x: 820, y: 810, s: 2 },
  spots: {
    fox: { x: 400, y: 740, s: 1.1 },
    hare: { x: 1180, y: 730, s: 1.05 },
    ptarmigan: { x: 780, y: 850, s: 1.1 },
    lemming: { x: 1360, y: 860, s: 1.1 },
  },
  owl: { x: 1470, y: 650, s: 0.95 },
  bear: { y: 650, s: 0.95 },
  sun: [1320, 210],
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  ground: 900,
  fox: { x: 520, y: 1150, s: 1.85 },
  spots: {
    fox: { x: 300, y: 1080, s: 0.95 },
    hare: { x: 760, y: 1070, s: 0.95 },
    ptarmigan: { x: 280, y: 1250, s: 1.05 },
    lemming: { x: 720, y: 1265, s: 1.05 },
  },
  owl: { x: 870, y: 960, s: 0.8 },
  bear: { y: 960, s: 0.8 },
  sun: [760, 380],
}
