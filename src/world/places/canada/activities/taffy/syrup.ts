// The syrup on the snow: each pour is a Piece, a line of points (each with its own width and the syrup it holds) plus
// puddles where the pot stood still. Pieces are drawn as perfect-freehand strokes (the line) and wobbly blobs (the
// puddles) into four shared layers, so overlapping pours look like one: the melt mark pressed into the snow, the ink
// outline, the syrup, and a glossy highlight along the top of it (hot syrup shines; set taffy keeps a softer shine). Rolling eats points off a piece; only the runs that are left get drawn.
import { getStroke } from 'perfect-freehand'

export interface LinePt {
  x: number
  y: number
  /** Radius (stage units). */
  r: number
  /** Syrup at this point (square stage units). */
  v: number
  eaten: boolean
}
export interface Puddle {
  x: number
  y: number
  r: number
  eaten: boolean
}
export interface Piece {
  id: number
  pts: LinePt[]
  puddles: Puddle[]
  /** When the pour ended (Infinity while it's still pouring) and when it has set. */
  endAt: number
  setAt: number
  /** How far the pour turned on itself (radians, signed): one and a half turns or more is a swirl. */
  turn: number
  lastDir: number | null
  total: number
  dirty: boolean
  dentDirty: boolean
  els: { dent: SVGGElement; ink: SVGGElement; fill: SVGGElement; gloss: SVGGElement }
}

export interface FreehandFeel {
  smoothing: number
  streamline: number
  thinning: number
}

const NS = 'http://www.w3.org/2000/svg'
export const HOT = [0xc2, 0x6a, 0x12]
export const SET = [0xf0, 0xb4, 0x4c]
export const INK = '#4A3B57'

export const puddleVol = (p: Puddle) => Math.PI * p.r * p.r
export const isSet = (p: Piece, now: number) => now >= p.setAt
export const left = (p: Piece) => p.pts.reduce((s, q) => s + (q.eaten ? 0 : q.v), 0) + p.puddles.reduce((s, q) => s + (q.eaten ? 0 : puddleVol(q)), 0)
export const isGone = (p: Piece) => p.pts.every((q) => q.eaten) && p.puddles.every((q) => q.eaten)

let nextId = 1
export type Layers = { dent: SVGGElement; ink: SVGGElement; fill: SVGGElement; gloss: SVGGElement }
export function newPiece(layers: Layers): Piece {
  const g = () => document.createElementNS(NS, 'g') as SVGGElement
  const els = { dent: g(), ink: g(), fill: g(), gloss: g() }
  layers.dent.appendChild(els.dent)
  layers.ink.appendChild(els.ink)
  layers.fill.appendChild(els.fill)
  layers.gloss.appendChild(els.gloss)
  return { id: nextId++, pts: [], puddles: [], endAt: Infinity, setAt: Infinity, turn: 0, lastDir: null, total: 0, dirty: true, dentDirty: true, els }
}

export function removePiece(p: Piece) {
  p.els.dent.remove()
  p.els.ink.remove()
  p.els.fill.remove()
  p.els.gloss.remove()
}

/** A perfect-freehand outline as a smooth closed path (the same quadratic smoothing Snow Coats uses). */
function outline(points: number[][], size: number, feel: FreehandFeel): string {
  const stroke = getStroke(points, { size, thinning: feel.thinning, smoothing: feel.smoothing, streamline: feel.streamline, simulatePressure: false, last: true })
  if (stroke.length < 3) return ''
  let d = `M${stroke[0][0].toFixed(1)} ${stroke[0][1].toFixed(1)}`
  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i]
    const [x1, y1] = stroke[(i + 1) % stroke.length]
    d += ` Q${x0.toFixed(1)} ${y0.toFixed(1)} ${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  return d + ' Z'
}

/** A puddle: a circle with a gentle wobble, so it reads as poured, not stamped. */
function blob(x: number, y: number, r: number, seed: number): string {
  const n = 14
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const k = 1 + 0.06 * Math.sin(a * 3 + seed) + 0.04 * Math.sin(a * 5 + seed * 2.3)
    pts.push([x + Math.cos(a) * r * k, y + Math.sin(a) * r * k])
  }
  const mid = (i: number) => {
    const [x0, y0] = pts[i % n]
    const [x1, y1] = pts[(i + 1) % n]
    return `${((x0 + x1) / 2).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)}`
  }
  let d = `M${mid(0)}`
  for (let i = 1; i <= n; i++) d += ` Q${pts[i % n][0].toFixed(1)} ${pts[i % n][1].toFixed(1)} ${mid(i)}`
  return d + ' Z'
}

/** The shapes of what's left of a piece: one outline per unbroken run of points, one blob per puddle. `grow` widens
 *  everything (the melt mark is wider than the syrup). */
function shapes(p: Piece, rMax: number, feel: FreehandFeel, grow: number, all: boolean): string[] {
  const out: string[] = []
  const size = rMax * grow
  let run: number[][] = []
  const flush = () => {
    if (run.length === 1) {
      const [x, y, pr] = run[0]
      out.push(blob(x, y, Math.max(3, pr * size), p.id))
    } else if (run.length > 1) {
      const d = outline(run, size, feel)
      if (d) out.push(d)
    }
    run = []
  }
  for (const q of p.pts) {
    if (q.eaten && !all) {
      flush()
      continue
    }
    run.push([q.x, q.y, Math.min(1, q.r / rMax)])
  }
  flush()
  for (const q of p.puddles) if (all || !q.eaten) out.push(blob(q.x, q.y, q.r * grow, p.id + q.x * 0.01))
  return out
}

function fillGroup(g: SVGGElement, ds: string[], attrs: Record<string, string>) {
  while (g.childElementCount > ds.length) g.lastElementChild!.remove()
  while (g.childElementCount < ds.length) {
    const el = document.createElementNS(NS, 'path')
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
    g.appendChild(el)
  }
  ds.forEach((d, i) => g.children[i].setAttribute('d', d))
}

/** Redraws a piece that changed (rMax: the widest a line point can be; the line's perfect-freehand size). */
export function drawPiece(p: Piece, rMax: number, feel: FreehandFeel) {
  if (p.dirty) {
    const ds = shapes(p, rMax, feel, 1, false)
    fillGroup(p.els.ink, ds, { fill: INK, stroke: INK, 'stroke-width': '9', 'stroke-linejoin': 'round' })
    fillGroup(p.els.fill, ds, {})
    // The shine: a thinner copy of the syrup nudged up and to the left (the light comes from the top left).
    fillGroup(p.els.gloss, shapes(p, rMax, feel, 0.34, false), { fill: '#FFF3D0', transform: 'translate(-5 -6)' })
    p.dirty = false
  }
  if (p.dentDirty) {
    // The melt mark stays in the snow after the taffy is rolled up (fresh snow from the roof covers it).
    fillGroup(p.els.dent, shapes(p, rMax, feel, 1.45, true), { fill: '#D8E2F0' })
    p.dentDirty = false
  }
}

/** The syrup's color: dark and glossy while it's hot, lighter and opaque as it sets. */
export function syrupColor(t: number) {
  return `rgb(${HOT.map((c, i) => Math.round(c + (SET[i] - c) * t)).join(',')})`
}
