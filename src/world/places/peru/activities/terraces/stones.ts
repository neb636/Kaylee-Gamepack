// Inca walls: stones that fit together like a puzzle, with no glue. Each wall is a grid of cells whose corners are
// jittered (neighbours share them), so every stone is a different many-cornered shape and fits only its own gap.
// Some stones are bigger (two, three or four cells, L shapes). The gaps of each wall are authored, so their shapes are
// clearly different from each other (a five-year-old matches them by eye); the jitter, a mirror flip and the order of the
// stone pile change every time she plays.

export type Pt = { x: number; y: number }

/** Cells as [row, col]. Row 0 is the top row. */
type Cells = [number, number][]

export interface StoneShape {
  id: string
  /** Outline in wall units (absolute, same space as the wall). */
  pts: Pt[]
  /** Center of the outline's bounding box. */
  c: Pt
  w: number
  h: number
  color: string
  /** A gap she fills (false: a stone that is already in the wall). */
  gap: boolean
  /** The famous many-cornered stone. */
  corners?: boolean
}

export interface WallPlan {
  cols: number
  /** The gaps, in order of difficulty. Everything else is filled with 1- and 2-cell stones. */
  gaps: { cells: Cells; corners?: boolean }[]
}

const R = (r: number, c: number, w = 1, h = 1): Cells => {
  const out: Cells = []
  for (let i = 0; i < h; i++) for (let j = 0; j < w; j++) out.push([r + i, c + j])
  return out
}

/** The four walls, bottom to top: 3 big gaps, then 4, 5 (with the many-cornered stone) and 4 in the clouds. The last
 *  column is never a gap: Tika and her friends stand in front of it. */
export const WALLS: WallPlan[] = [
  { cols: 8, gaps: [{ cells: R(0, 1, 2, 2) }, { cells: R(0, 4, 1, 2) }, { cells: R(0, 5, 2, 1) }] },
  { cols: 7, gaps: [{ cells: [[0, 0], [1, 0], [1, 1]] }, { cells: R(0, 3) }, { cells: R(0, 5, 1, 2) }, { cells: R(1, 3, 2, 1) }] },
  { cols: 7, gaps: [{ cells: R(0, 0, 2, 2), corners: true }, { cells: [[0, 2], [0, 3], [1, 2]] }, { cells: R(1, 3, 2, 1) }, { cells: R(0, 4) }, { cells: R(0, 5, 1, 2) }] },
  { cols: 6, gaps: [{ cells: [[0, 1], [1, 0], [1, 1]] }, { cells: R(0, 2, 1, 2) }, { cells: R(0, 3, 2, 1) }, { cells: R(1, 4) }] },
]
export const ROWS = 2

const STONE_COLORS = ['#D3C6B8', '#C6B9AC', '#DCCFC2', '#C9BDCB', '#D7C9B2', '#BFB3A9']

/** A tiny seeded random, so one wall keeps its shape across re-renders and rotations. */
function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

/**
 * Builds one wall: `w` x `h` wall units with its top-left corner at (0, 0).
 * Returns every stone, the gaps first (in the plan's order).
 */
export function buildWall(plan: WallPlan, w: number, h: number, seed: number, mirror: boolean): StoneShape[] {
  const rand = rng(seed)
  const cols = plan.cols
  const cw = w / cols
  const ch = h / ROWS
  const flip = (cells: Cells): Cells => (mirror ? cells.map(([r, c]) => [r, cols - 1 - c] as [number, number]) : cells)

  // Grid corners, jittered. The wall's own edges stay straight (the top carries the grass terrace).
  const V: Pt[][] = []
  for (let r = 0; r <= ROWS; r++) {
    V.push([])
    for (let c = 0; c <= cols; c++) {
      const edgeX = c === 0 || c === cols
      const edgeY = r === 0 || r === ROWS
      V[r].push({
        x: c * cw + (edgeX ? 0 : (rand() - 0.5) * cw * 0.42),
        y: r * ch + (edgeY ? 0 : (rand() - 0.5) * ch * 0.36),
      })
    }
  }
  const vid = (r: number, c: number) => `${r},${c}`
  const vpt = (id: string) => {
    const [r, c] = id.split(',').map(Number)
    return V[r][c]
  }

  // Assign every cell to a stone: the gaps first, then 2-cell and 1-cell stones.
  const owner: number[][] = Array.from({ length: ROWS }, () => Array(cols).fill(-1))
  const regions: { cells: Cells; gap: boolean; corners?: boolean }[] = []
  for (const g of plan.gaps) {
    const cells = flip(g.cells)
    for (const [r, c] of cells) owner[r][c] = regions.length
    regions.push({ cells, gap: true, corners: g.corners })
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < cols; c++) {
      if (owner[r][c] >= 0) continue
      const cells: Cells = [[r, c]]
      if (c + 1 < cols && owner[r][c + 1] < 0 && rand() < 0.55) cells.push([r, c + 1])
      for (const [rr, cc] of cells) owner[rr][cc] = regions.length
      regions.push({ cells, gap: false })
    }

  // Bumps along the edges between two stones (shared by both, so they still fit). The wall's outer edges stay
  // straight. The many-cornered stone gets two bumps on each of its inner edges.
  const extra = new Map<string, Pt[]>()
  const cornerStone = regions.findIndex((g) => g.corners)
  const bumps = (a: string, b: string, ownerA: number, ownerB: number) => {
    const k = key(a, b)
    if (extra.has(k)) return
    const pa = vpt(a)
    const pb = vpt(b)
    const outer = ownerA < 0 || ownerB < 0
    const many = ownerA === cornerStone || ownerB === cornerStone
    const n = outer ? 0 : many ? 2 : rand() < 0.65 ? 1 : 0
    const dx = pb.x - pa.x
    const dy = pb.y - pa.y
    const len = Math.hypot(dx, dy)
    const nx = -dy / len
    const ny = dx / len
    const pts: Pt[] = []
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1) + (rand() - 0.5) * 0.15
      const off = (rand() < 0.5 ? -1 : 1) * len * (0.09 + rand() * 0.08)
      pts.push({ x: pa.x + dx * t + nx * off, y: pa.y + dy * t + ny * off })
    }
    // Stored from the smaller id to the bigger one.
    extra.set(k, a < b ? pts : pts.reverse())
  }
  const ownerAt = (r: number, c: number) => (r < 0 || r >= ROWS || c < 0 || c >= cols ? -1 : owner[r][c])

  return regions
    .map((g, i) => {
      // Boundary edges of this region, clockwise around each cell, skipping edges inside the region.
      const edges: [string, string][] = []
      for (const [r, c] of g.cells) {
        const sides: [number, number, string, string][] = [
          [r - 1, c, vid(r, c), vid(r, c + 1)],
          [r, c + 1, vid(r, c + 1), vid(r + 1, c + 1)],
          [r + 1, c, vid(r + 1, c + 1), vid(r + 1, c)],
          [r, c - 1, vid(r + 1, c), vid(r, c)],
        ]
        for (const [nr, nc, a, b] of sides) {
          const o = ownerAt(nr, nc)
          if (o === i) continue
          bumps(a, b, i, o)
          edges.push([a, b])
        }
      }
      // Chain the edges into one outline.
      const next = new Map(edges.map(([a, b]) => [a, b]))
      const start = edges[0][0]
      const pts: Pt[] = []
      let at = start
      for (let guard = 0; guard < 64; guard++) {
        const to = next.get(at)!
        pts.push(vpt(at))
        const mid = extra.get(key(at, to)) ?? []
        pts.push(...(at < to ? mid : [...mid].reverse()))
        at = to
        if (at === start) break
      }
      const clean = dropStraight(pts)
      const xs = clean.map((p) => p.x)
      const ys = clean.map((p) => p.y)
      const x0 = Math.min(...xs)
      const x1 = Math.max(...xs)
      const y0 = Math.min(...ys)
      const y1 = Math.max(...ys)
      return {
        id: `s${i}`,
        pts: clean,
        c: { x: (x0 + x1) / 2, y: (y0 + y1) / 2 },
        w: x1 - x0,
        h: y1 - y0,
        color: STONE_COLORS[Math.floor(rand() * STONE_COLORS.length)],
        gap: g.gap,
        corners: g.corners,
      }
    })
}

/** Removes points that sit on a straight line between their neighbours (the grid points along the wall's top). */
function dropStraight(pts: Pt[]) {
  return pts.filter((p, i) => {
    const a = pts[(i - 1 + pts.length) % pts.length]
    const b = pts[(i + 1) % pts.length]
    const cross = (p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x)
    return Math.abs(cross) / (Math.hypot(b.x - a.x, b.y - a.y) || 1) > 1.5
  })
}

/** An outline as an SVG path with softly rounded corners (Inca stones have pillowy edges). */
export function roundedPath(pts: Pt[], radius: number, dx = 0, dy = 0) {
  const n = pts.length
  let d = ''
  for (let i = 0; i < n; i++) {
    const p = pts[i]
    const a = pts[(i - 1 + n) % n]
    const b = pts[(i + 1) % n]
    const la = Math.hypot(a.x - p.x, a.y - p.y)
    const lb = Math.hypot(b.x - p.x, b.y - p.y)
    const r = Math.min(radius, la * 0.42, lb * 0.42)
    const p1 = { x: p.x + ((a.x - p.x) / la) * r, y: p.y + ((a.y - p.y) / la) * r }
    const p2 = { x: p.x + ((b.x - p.x) / lb) * r, y: p.y + ((b.y - p.y) / lb) * r }
    d += `${i === 0 ? 'M' : 'L'}${(p1.x + dx).toFixed(1)} ${(p1.y + dy).toFixed(1)}Q${(p.x + dx).toFixed(1)} ${(p.y + dy).toFixed(1)} ${(p2.x + dx).toFixed(1)} ${(p2.y + dy).toFixed(1)}`
  }
  return d + 'Z'
}

/** The outline pulled in toward its center (for the stone's pillowy lighter face). */
export function inset(pts: Pt[], c: Pt, k: number, dx: number, dy: number): Pt[] {
  return pts.map((p) => ({ x: c.x + (p.x - c.x) * k + dx, y: c.y + (p.y - c.y) * k + dy }))
}

/** Lighter version of a stone color, for its face. */
export function lighten(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const ch = (v: number) => Math.round(v + (255 - v) * amount)
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, '0')).join('')}`
}
