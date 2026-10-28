// Snow Coats' animals and stage layouts, in the 2D look: straight-on side view, feet on the ground line at y = 0,
// facing right, in local units. Each animal is a puppet made of two kinds of pieces:
//   - coat parts (ellipses and polygons): the fur or feathers. SnowCoats.tsx draws them three times: an ink silhouette
//     (the 5-unit outline), the summer coat (brown, a lighter belly, darker markings) and the white winter coat masked by
//     her strokes. The same parts give the coat's grid of cells, which says how much of the coat is white.
//   - details drawn on top whatever the season: big eyes with highlights (they blink and follow her finger), the nose,
//     a mouth that opens to giggle, blush, inner ears, the hare's black ear tips, the ptarmigan's red comb and beak.
// Pieces hang on the body, the head or the tail, each on its own pivot, so the head can tilt and look round and the
// tail can swish and flop after a hop. Plain TypeScript (no React, no perfect-freehand).

export type Group = 'body' | 'head' | 'tail'
export const GROUPS: readonly Group[] = ['tail', 'body', 'head']

type Geo = { e: [cx: number, cy: number, rx: number, ry: number, rot?: number] } | { p: number[] }
/** A coat part: `g` the pivot it hangs on (body by default), `c` its summer color: brown (default), light or dark. */
export type Part = Geo & { g?: Group; c?: 'l' | 'd' }

/** What's drawn on top of the coat, whatever the season. */
export type Detail = { g?: Group } & (
  | { k: 'eye'; x: number; y: number; r: number; iris?: string }
  | { k: 'nose'; x: number; y: number; r: number; color?: string }
  | { k: 'blush'; x: number; y: number; r: number }
  | { k: 'mouth'; x: number; y: number; w: number }
  | { k: 'ell'; e: [number, number, number, number, number?]; color: string }
  | { k: 'poly'; p: number[]; color: string }
  | { k: 'line'; d: string; w?: number; color?: string }
)

export type CoatId = 'fox' | 'hare' | 'ptarmigan' | 'lemming'
export const COAT_IDS: readonly CoatId[] = ['fox', 'hare', 'ptarmigan', 'lemming']

export interface Shape {
  parts: Part[]
  details: Detail[]
  /** Summer coat colors (the bear's and the owl's are white all year). */
  brown: string
  light: string
  dark: string
  /** Where the head and the tail turn. */
  pivots: Partial<Record<Group, [number, number]>>
  /** Bounding box of the parts. */
  box: { x: number; y: number; w: number; h: number }
}

export const PINK_EAR = '#FFB8CC'
export const DARK = '#2B2236'
const BEAK = '#3A2F45'

function shape(parts: Part[], details: Detail[], colors: [brown: string, light: string, dark: string], pivots: Shape['pivots']): Shape {
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
  const [brown, light, dark] = colors
  return { parts, details, brown, light, dark, pivots, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } }
}

const H = 'head' as const
const T = 'tail' as const

export const SHAPES: Record<CoatId | 'bear' | 'owl', Shape> = {
  // The Arctic fox in its late-summer coat: grey-brown back, cream belly, cheeks and muzzle, short round ears (they
  // keep the heat in), a big bushy tail it wraps round itself in the cold.
  fox: shape(
    [
      { e: [-150, -118, 72, 30, -24], g: T },
      { e: [-204, -138, 32, 22, -30], g: T },
      { e: [-62, -28, 13, 28] },
      { e: [-34, -28, 13, 28] },
      { e: [40, -28, 13, 28] },
      { e: [68, -28, 13, 28] },
      { e: [0, -90, 96, 46] },
      { e: [6, -64, 70, 20], c: 'l' },
      { e: [72, -92, 28, 32], c: 'l' },
      { e: [88, -184, 15, 24, -16], g: H },
      { e: [124, -188, 15, 24, 12], g: H },
      { e: [114, -140, 50, 44], g: H },
      { e: [104, -116, 36, 20], c: 'l', g: H },
      { e: [158, -124, 30, 18], c: 'l', g: H },
    ],
    [
      { k: 'ell', e: [89, -180, 7, 13, -16], color: PINK_EAR, g: H },
      { k: 'ell', e: [123, -184, 7, 13, 12], color: PINK_EAR, g: H },
      { k: 'blush', x: 118, y: -122, r: 10, g: H },
      { k: 'eye', x: 130, y: -148, r: 11, g: H },
      { k: 'nose', x: 186, y: -127, r: 8, g: H },
      { k: 'mouth', x: 170, y: -113, w: 9, g: H },
    ],
    ['#9E7A5A', '#E6D0B0', '#7A5A40'],
    { head: [76, -122], tail: [-86, -104] },
  ),
  // The Arctic hare sitting up: grey-brown in summer, long ears with black tips (they stay black in winter too).
  hare: shape(
    [
      { e: [-64, -58, 18, 16], c: 'l', g: T },
      { e: [-6, -9, 50, 10] },
      { e: [-22, -42, 46, 38] },
      { e: [0, -80, 62, 68] },
      { e: [30, -86, 26, 40], c: 'l' },
      { e: [52, -12, 16, 12] },
      { e: [22, -248, 13, 52, -12], g: H },
      { e: [54, -244, 13, 52, 12], g: H },
      { e: [44, -170, 42, 36], g: H },
      { e: [64, -156, 22, 15], c: 'l', g: H },
    ],
    [
      { k: 'ell', e: [20.5, -240, 5, 30, -12], color: PINK_EAR, g: H },
      { k: 'ell', e: [55.5, -236, 5, 30, 12], color: PINK_EAR, g: H },
      { k: 'ell', e: [14.5, -284.6, 8, 12, -12], color: BEAK, g: H },
      { k: 'ell', e: [61.5, -280.6, 8, 12, 12], color: BEAK, g: H },
      { k: 'blush', x: 56, y: -156, r: 9, g: H },
      { k: 'eye', x: 64, y: -178, r: 10, g: H },
      { k: 'nose', x: 85, y: -163, r: 6, color: '#E77A9A', g: H },
      { k: 'mouth', x: 78, y: -151, w: 7, g: H },
    ],
    ['#9C8466', '#E3D6C3', '#6E5A45'],
    { head: [36, -138], tail: [-52, -60] },
  ),
  // The rock ptarmigan: a plump round ground bird, mottled brown in summer, all white in winter (even its feathery
  // feet), with a little red comb over its eye.
  ptarmigan: shape(
    [
      { p: [-44, -94, -96, -124, -116, -104, -112, -78, -44, -58], g: T },
      { e: [-14, -12, 14, 12] },
      { e: [20, -12, 14, 12] },
      { e: [0, -62, 64, 48] },
      { e: [14, -40, 40, 18], c: 'l' },
      { e: [-8, -70, 42, 26, -12], c: 'd' },
      { e: [-22, -82, 6, 4], c: 'l' },
      { e: [2, -60, 6, 4], c: 'l' },
      { e: [-30, -58, 5, 3], c: 'l' },
      { e: [30, -88, 5, 3], c: 'd' },
      { e: [54, -114, 30, 28], g: H },
    ],
    [
      { k: 'line', d: 'M-48 -58 Q-14 -98 30 -76', w: 4 },
      { k: 'ell', e: [60, -137, 11, 5, -8], color: '#FF5C6C', g: H },
      { k: 'poly', p: [80, -124, 99, -114, 80, -105], color: BEAK, g: H },
      { k: 'blush', x: 56, y: -104, r: 7, g: H },
      { k: 'eye', x: 64, y: -121, r: 8, g: H },
    ],
    ['#977256', '#D9C2A3', '#6B4E38'],
    { head: [38, -96], tail: [-48, -76] },
  ),
  // The collared lemming: a round little rodent, brown with a dark stripe down its back in summer, white in winter.
  lemming: shape(
    [
      { e: [-76, -28, 12, 6], g: T },
      { e: [-34, -6, 16, 7] },
      { e: [34, -6, 16, 7] },
      { e: [0, -40, 70, 38] },
      { e: [10, -18, 52, 14], c: 'l' },
      { e: [-8, -62, 42, 5, 2], c: 'd' },
      { e: [44, -76, 10, 9], g: H },
      { e: [58, -50, 34, 30], g: H },
      { e: [70, -40, 16, 11], c: 'l', g: H },
    ],
    [
      { k: 'ell', e: [44, -76, 5, 4.5], color: PINK_EAR, g: H },
      { k: 'blush', x: 64, y: -42, r: 7, g: H },
      { k: 'eye', x: 72, y: -58, r: 8, g: H },
      { k: 'nose', x: 91, y: -50, r: 5, color: '#E77A9A', g: H },
      { k: 'mouth', x: 85, y: -40, w: 5, g: H },
      { k: 'line', d: 'M90 -46 L112 -52 M90 -43 L112 -39', w: 2.5, g: H },
    ],
    ['#8D6E54', '#D7BFA2', '#5F4635'],
    { head: [40, -46], tail: [-66, -30] },
  ),
  // The polar bear (Mama Bear's look, characters/looks.ts): white all year, never painted. He walks right, his head
  // on its own pivot so he can sniff down and look round.
  bear: shape(
    [
      { e: [-158, -172, 16, 14], g: T },
      { e: [-112, -52, 30, 52] },
      { e: [-64, -52, 30, 52] },
      { e: [62, -52, 30, 52] },
      { e: [108, -52, 30, 52] },
      { e: [-108, -150, 58, 62] },
      { e: [0, -138, 150, 78] },
      { e: [132, -158, 48, 50] },
      { e: [150, -210, 15, 13], g: H },
      { e: [186, -214, 15, 13], g: H },
      { e: [180, -168, 58, 48], g: H },
      { e: [228, -152, 36, 24], c: 'l', g: H },
    ],
    [
      { k: 'ell', e: [151, -209, 7, 6], color: PINK_EAR, g: H },
      { k: 'ell', e: [185, -213, 7, 6], color: PINK_EAR, g: H },
      { k: 'blush', x: 200, y: -152, r: 12, g: H },
      { k: 'eye', x: 198, y: -180, r: 10, g: H },
      { k: 'nose', x: 258, y: -158, r: 11, g: H },
      { k: 'mouth', x: 240, y: -138, w: 10, g: H },
    ],
    ['#FCFDFF', '#FFF1DE', '#ECE8F6'],
    { head: [130, -160], tail: [-150, -162] },
  ),
  // The snowy owl, front on, on its rock: white all year, a few dark flecks, big yellow eyes.
  owl: shape(
    [
      { e: [-14, -4, 14, 8] },
      { e: [14, -4, 14, 8] },
      { e: [-44, -80, 18, 52, 12] },
      { e: [44, -80, 18, 52, -12] },
      { e: [0, -78, 50, 72] },
      { e: [0, -152, 46, 40], g: H },
    ],
    [
      ...[-24, -2, 20].map((x, i): Detail => ({ k: 'line', d: `M${x - 8} ${-64 + i * 8} l 8 8 l 8 -8`, w: 3.5, color: '#9E97AD' })),
      ...[-12, 12].map((x): Detail => ({ k: 'line', d: `M${x - 7} -30 l 7 7 l 7 -7`, w: 3.5, color: '#9E97AD' })),
      { k: 'eye', x: -18, y: -158, r: 11, iris: '#FFD84D', g: H },
      { k: 'eye', x: 18, y: -158, r: 11, iris: '#FFD84D', g: H },
      { k: 'poly', p: [-7, -146, 7, -146, 0, -130], color: BEAK, g: H },
      { k: 'blush', x: -30, y: -138, r: 8, g: H },
      { k: 'blush', x: 30, y: -138, r: 8, g: H },
    ],
    ['#FCFDFF', '#FCFDFF', '#ECE8F6'],
    { head: [0, -118] },
  ),
}

/** Snow Coats' sounds per animal: what a tap or a giggle sounds like (a frequency for the kit's tone). */
export const VOICE: Record<CoatId, { f: number; to: number; type: OscillatorType }> = {
  fox: { f: 900, to: 1400, type: 'triangle' },
  hare: { f: 1300, to: 1900, type: 'sine' },
  ptarmigan: { f: 520, to: 380, type: 'square' },
  lemming: { f: 2200, to: 2900, type: 'sine' },
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

const inPart = (pt: Part, x: number, y: number) => ('e' in pt ? inEllipse(x, y, pt.e) : inPoly(x, y, pt.p))
export const inShape = (s: Shape, x: number, y: number) => s.parts.some((pt) => inPart(pt, x, y))
/** Which pivot the topmost part at (x, y) hangs on. */
const groupAt = (s: Shape, x: number, y: number): Group => {
  for (let i = s.parts.length - 1; i >= 0; i--) if (inPart(s.parts[i], x, y)) return s.parts[i].g ?? 'body'
  return 'body'
}

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
  /** The edge cells' indexes (where the fluff grows), and the pivot each hangs on. */
  edge: number[]
  edgeGroup: Group[]
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
  return { cell, x0: x, y0: y, cols, rows, index, xs: Float32Array.from(xs), ys: Float32Array.from(ys), edge, edgeGroup: edge.map((i) => groupAt(s, xs[i], ys[i])) }
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
