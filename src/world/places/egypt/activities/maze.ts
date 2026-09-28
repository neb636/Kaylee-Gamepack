// The pyramid's tunnels as a graph: corridors are straight segments between junctions. Miu slides along them like a
// bead on a wire, following her finger, so she can go round corners and pick a branch but never walk through a wall.
// Coordinates are maze units: 160 wide, 100 tall (landscape). In portrait the maze is drawn transposed.

export type Pt = { x: number; y: number }
export interface Maze {
  nodes: Record<string, Pt>
  edges: [string, string][]
  start: string
  exit: string
  /** Scarabs to collect before the exit door opens. */
  scarabs: Pt[]
  /** Surprises at dead ends: never a failure, just something to see. */
  ends: { at: string; kind: 'bat' | 'wall' }[]
  /** Pictures painted on the walls, lit up as she passes. */
  paintings: { at: Pt; icon: string }[]
  /** Torchlight radius, in maze units. */
  light: number
}

export const W = 160
export const H = 100

export const MAZES: Maze[] = [
  // 1: one corner, one scarab on the way.
  {
    nodes: { a: { x: 18, y: 76 }, b: { x: 80, y: 76 }, c: { x: 80, y: 24 }, d: { x: 142, y: 24 } },
    edges: [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
    ],
    start: 'a',
    exit: 'd',
    scarabs: [{ x: 80, y: 44 }],
    ends: [],
    paintings: [
      { at: { x: 48, y: 62 }, icon: '🐈' },
      { at: { x: 112, y: 38 }, icon: '⛵' },
    ],
    light: 34,
  },
  // 2: a fork. One scarab up top, one down the other branch; a sleepy bat at the far dead end.
  {
    nodes: { a: { x: 16, y: 50 }, b: { x: 56, y: 50 }, c: { x: 56, y: 20 }, d: { x: 144, y: 20 }, f: { x: 56, y: 80 }, g: { x: 108, y: 80 }, h: { x: 144, y: 80 } },
    edges: [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['b', 'f'],
      ['f', 'g'],
      ['g', 'h'],
    ],
    start: 'a',
    exit: 'd',
    scarabs: [
      { x: 100, y: 20 },
      { x: 108, y: 80 },
    ],
    ends: [{ at: 'h', kind: 'bat' }],
    paintings: [
      { at: { x: 34, y: 36 }, icon: '🪷' },
      { at: { x: 80, y: 66 }, icon: '👁️' },
      { at: { x: 124, y: 34 }, icon: '☀️' },
    ],
    light: 30,
  },
  // 3: two forks and a smaller light. Find the treasure door.
  {
    nodes: { a: { x: 16, y: 84 }, b: { x: 46, y: 84 }, c: { x: 46, y: 50 }, d: { x: 46, y: 16 }, e: { x: 104, y: 16 }, f: { x: 104, y: 50 }, g: { x: 104, y: 84 }, h: { x: 144, y: 84 }, i: { x: 144, y: 50 } },
    edges: [
      ['a', 'b'],
      ['b', 'c'],
      ['c', 'd'],
      ['d', 'e'],
      ['c', 'f'],
      ['f', 'i'],
      ['f', 'g'],
      ['g', 'h'],
    ],
    start: 'a',
    exit: 'h',
    scarabs: [],
    ends: [
      { at: 'e', kind: 'wall' },
      { at: 'i', kind: 'bat' },
    ],
    paintings: [
      { at: { x: 30, y: 70 }, icon: '🐈' },
      { at: { x: 74, y: 30 }, icon: '🪲' },
      { at: { x: 124, y: 66 }, icon: '🦅' },
      { at: { x: 76, y: 70 }, icon: '🪷' },
    ],
    light: 25,
  },
]

/** Where Miu is: on edge `e` (index into maze.edges), `t` of the way from its first node to its second. */
export interface Pos {
  e: number
  t: number
}

const sub = (a: Pt, b: Pt) => ({ x: a.x - b.x, y: a.y - b.y })
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y)

export function pointAt(maze: Maze, pos: Pos): Pt {
  const [a, b] = maze.edges[pos.e].map((n) => maze.nodes[n])
  return { x: a.x + (b.x - a.x) * pos.t, y: a.y + (b.y - a.y) * pos.t }
}

/** How far along segment a-b the point p projects, clamped to 0..1. */
function project(a: Pt, b: Pt, p: Pt) {
  const ab = sub(b, a)
  const len2 = ab.x * ab.x + ab.y * ab.y || 1
  const ap = sub(p, a)
  return Math.max(0, Math.min(1, (ap.x * ab.x + ap.y * ab.y) / len2))
}

export function startPos(maze: Maze): Pos {
  const e = maze.edges.findIndex((edge) => edge.includes(maze.start))
  return { e, t: maze.edges[e][0] === maze.start ? 0 : 1 }
}

/**
 * Slide Miu along the corridors toward her finger: along the current corridor, and at a junction onto whichever corridor
 * gets closer to the finger. Stops where she can't get any closer, so a finger on the far side of a wall just
 * brings Miu as near as the tunnels allow.
 */
export function follow(maze: Maze, pos: Pos, finger: Pt): Pos {
  let cur = { ...pos }
  for (let step = 0; step < 24; step++) {
    const [na, nb] = maze.edges[cur.e]
    const a = maze.nodes[na]
    const b = maze.nodes[nb]
    const t = project(a, b, finger)
    cur = { e: cur.e, t }
    // Near a junction or a corner (within a couple of units, so a finger pulling round the corner still turns her):
    // try the other corridors that meet here.
    const at = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
    const node = dist(at, a) < SNAP ? na : dist(at, b) < SNAP ? nb : null
    if (!node) break
    const here = maze.nodes[node]
    let best: Pos | null = null
    let bestD = dist(here, finger) - 0.5
    maze.edges.forEach((edge, i) => {
      if (i === cur.e || !edge.includes(node)) return
      const [ea, eb] = edge.map((n) => maze.nodes[n])
      const et = project(ea, eb, finger)
      const d = dist({ x: ea.x + (eb.x - ea.x) * et, y: ea.y + (eb.y - ea.y) * et }, finger)
      if (d < bestD) {
        bestD = d
        best = { e: i, t: edge[0] === node ? 0 : 1 }
      }
    })
    if (!best) break
    cur = best
  }
  return cur
}

const SNAP = 2.5

export const near = (a: Pt, b: Pt, r = 8) => dist(a, b) < r
