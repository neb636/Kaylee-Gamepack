// Sugar Snow's two logical stages (wide 1600 x 1000, tall 1000 x 1500) and its placeholder shapes. The camera looks
// straight down at the table, like a kitchen toy: the tray of snow in the middle, the stove with the pot and the jar of
// sticks on one side, the maple tree with its sap bucket and the sugar shack's roof on the other, and the animals across
// the table peeking over the tray's far edge (their faces toward her). Plain data, no React.

export type Pt = [number, number]
export interface Box {
  x: number
  y: number
  w: number
  h: number
}
export type AnimalId = 'maple' | 'chipmunk' | 'cousin' | 'owl' | 'moose'
export const ORDER_IDS = ['chipmunk', 'cousin', 'owl', 'moose'] as const satisfies readonly AnimalId[]
export type OrderId = (typeof ORDER_IDS)[number]

export interface StageDef {
  w: number
  h: number
  /** The snow inside the tray (the wooden frame is drawn around it). */
  snow: Box
  /** Where the pot sits on the stove, and the jar of clean sticks. */
  stove: Pt
  jar: Pt
  tree: Pt
  bucket: Pt
  roof: Pt
  post: Pt
  /** Across the table, on the tray's far edge: Maple alone (lines and shapes), and the line-up at orders and share. */
  maple: Pt
  line: Record<AnimalId, Pt>
  /** The shape card from Maple. */
  card: Pt
  /** Where the little used sticks are counted, along the tray's near edge. */
  tally: Pt
  /** Where the moose pops in from for a giant one (off the far edge). */
  mooseIn: Pt
  /** Where each order bubble sits, from the animal's head (clear of the neighbours and the top bar). */
  bubbles: Record<OrderId, Pt>
  /** The sugar shack's roof is smaller on the tall stage. */
  roofScale: number
}

export const WIDE: StageDef = {
  w: 1600,
  h: 1000,
  snow: { x: 330, y: 270, w: 940, h: 630 },
  stove: [1450, 560],
  jar: [1450, 830],
  tree: [150, 420],
  bucket: [235, 575],
  roof: [140, 820],
  post: [1450, 300],
  maple: [800, 200],
  line: { maple: [410, 205], chipmunk: [590, 212], cousin: [770, 205], owl: [960, 205], moose: [1200, 195] },
  card: [150, 175],
  tally: [350, 904],
  mooseIn: [1200, -140],
  bubbles: { chipmunk: [76, -6], cousin: [92, -9], owl: [94, -9], moose: [126, -14] },
  roofScale: 1,
}

export const TALL: StageDef = {
  w: 1000,
  h: 1500,
  snow: { x: 85, y: 440, w: 830, h: 730 },
  stove: [600, 1345],
  jar: [840, 1350],
  tree: [140, 1330],
  bucket: [235, 1440],
  roof: [395, 1405],
  post: [860, 285],
  maple: [500, 335],
  line: { maple: [130, 340], chipmunk: [300, 346], cousin: [470, 340], owl: [640, 340], moose: [840, 328] },
  card: [150, 260],
  tally: [105, 1174],
  mooseIn: [840, -150],
  bubbles: { chipmunk: [0, -92], cousin: [0, -108], owl: [0, -110], moose: [118, -16] },
  roofScale: 0.75,
}

// ---------------------------------------------------------------- the animals (front faces, placeholder shapes)

export interface Look {
  /** Head radius (stage units). */
  r: number
  fill: string
  /** Ears: [x, y, r] in head units (radius 1 = the head). */
  ears: [number, number, number][]
  earFill?: string
  /** Muzzle ellipse [x, y, rx, ry] and its fill. */
  muzzle?: [number, number, number, number]
  muzzleFill?: string
  eyes: number
  eyeY: number
  nose?: string
  teeth?: boolean
  beak?: boolean
  stripes?: boolean
  antlers?: boolean
  yellowEyes?: boolean
}

export const LOOKS: Record<AnimalId | 'squirrel', Look> = {
  maple: { r: 74, fill: '#9A6236', ears: [[-0.72, -0.72, 0.26], [0.72, -0.72, 0.26]], earFill: '#7A4A28', muzzle: [0, 0.38, 0.5, 0.36], muzzleFill: '#C99A6E', eyes: 0.36, eyeY: -0.12, nose: '#3A2622', teeth: true },
  cousin: { r: 58, fill: '#B07848', ears: [[-0.72, -0.72, 0.26], [0.72, -0.72, 0.26]], earFill: '#8A5A34', muzzle: [0, 0.38, 0.5, 0.36], muzzleFill: '#DDB287', eyes: 0.36, eyeY: -0.12, nose: '#3A2622', teeth: true },
  chipmunk: { r: 42, fill: '#C9884A', ears: [[-0.6, -0.8, 0.24], [0.6, -0.8, 0.24]], earFill: '#A86A34', muzzle: [0, 0.4, 0.46, 0.32], muzzleFill: '#F4DCC0', eyes: 0.34, eyeY: -0.1, nose: '#3A2622', stripes: true },
  owl: { r: 60, fill: '#FBFBFF', ears: [[-0.6, -0.86, 0.18], [0.6, -0.86, 0.18]], earFill: '#E4E6F2', eyes: 0.36, eyeY: -0.08, beak: true, yellowEyes: true },
  moose: { r: 92, fill: '#6E4A32', ears: [[-0.86, -0.42, 0.24], [0.86, -0.42, 0.24]], earFill: '#5A3A26', muzzle: [0, 0.5, 0.56, 0.42], muzzleFill: '#8A6448', eyes: 0.36, eyeY: -0.22, nose: '#2E1E18', antlers: true },
  squirrel: { r: 40, fill: '#D0612E', ears: [[-0.56, -0.86, 0.22], [0.56, -0.86, 0.22]], earFill: '#B04A20', muzzle: [0, 0.4, 0.44, 0.3], muzzleFill: '#F6E2CC', eyes: 0.32, eyeY: -0.1, nose: '#3A2622' },
}

/** What each animal in the orders line wants, in lollipop sizes (1 = a medium one). The owl wants a swirl. */
export const WANTS: Record<OrderId, { size: number; swirl?: boolean }> = {
  chipmunk: { size: 0.35 },
  cousin: { size: 1 },
  owl: { size: 1, swirl: true },
  moose: { size: 4 },
}

// ---------------------------------------------------------------- the shape cards (shapes section)

export type ShapeId = 'heart' | 'leaf' | 'loop' | 'k'
export const SHAPE_IDS: ShapeId[] = ['heart', 'leaf', 'loop', 'k']

/** Each shape as one or more strokes in a -1..1 box (y down). */
function heart(): Pt[][] {
  const pts: Pt[] = []
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    pts.push([x / 17, -y / 17 + 0.08])
  }
  return [pts]
}
function loop(): Pt[][] {
  const pts: Pt[] = []
  for (let i = 0; i <= 56; i++) {
    const t = (i / 56) * Math.PI * 2
    pts.push([Math.cos(t) * 0.85, Math.sin(t) * 0.85])
  }
  return [pts]
}
/** A simple maple leaf: eleven points and a stem. */
function leaf(): Pt[][] {
  const out: Pt[] = [
    [0, -1], [0.16, -0.62], [0.42, -0.74], [0.36, -0.36], [0.86, -0.5], [0.72, -0.18], [0.94, 0.02], [0.5, 0.2], [0.58, 0.46],
    [0.12, 0.36], [0.06, 0.6], [-0.06, 0.6], [-0.12, 0.36], [-0.58, 0.46], [-0.5, 0.2], [-0.94, 0.02], [-0.72, -0.18], [-0.86, -0.5],
    [-0.36, -0.36], [-0.42, -0.74], [-0.16, -0.62], [0, -1],
  ]
  return [out, [[0, 0.6], [0, 0.98]]]
}
function k(): Pt[][] {
  return [
    [[-0.45, -0.9], [-0.45, 0.9]],
    [[0.5, -0.9], [-0.42, 0.05], [0.55, 0.9]],
  ]
}
export const SHAPES: Record<ShapeId, Pt[][]> = { heart: heart(), leaf: leaf(), loop: loop(), k: k() }

/** Points every `step` units along a shape placed at (cx, cy) with half-size `s` (for the dotted guide and coverage). */
export function sampleShape(id: ShapeId, cx: number, cy: number, s: number, step: number): Pt[] {
  const out: Pt[] = []
  for (const stroke of SHAPES[id]) {
    for (let i = 1; i < stroke.length; i++) {
      const [x0, y0] = stroke[i - 1]
      const [x1, y1] = stroke[i]
      const len = Math.hypot(x1 - x0, y1 - y0) * s
      const n = Math.max(1, Math.round(len / step))
      for (let j = i === 1 ? 0 : 1; j <= n; j++) out.push([cx + (x0 + ((x1 - x0) * j) / n) * s, cy + (y0 + ((y1 - y0) * j) / n) * s])
    }
  }
  return out
}

/** The shape as an SVG path (for the card and the guide pressed into the snow). */
export function shapePath(id: ShapeId, cx: number, cy: number, s: number): string {
  return SHAPES[id].map((st) => st.map(([x, y], i) => `${i ? 'L' : 'M'}${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`).join(' ')).join(' ')
}
