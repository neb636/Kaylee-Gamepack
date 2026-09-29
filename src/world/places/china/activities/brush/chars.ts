// The six characters Kaylee paints, each a few strokes on a 100x100 grid, in the right stroke order. The paths use only
// M, L and Q so we can sample them ourselves (no font, no stroke database). Drawing the guide from these paths means the
// characters look the same on every device.
export interface Char {
  id: 'ren' | 'shan' | 'ri' | 'mu' | 'da' | 'yue'
  zh: string
  py: string
  en: string
  strokes: string[]
}

export const CHARS: Char[] = [
  { id: 'ren', zh: '人', py: 'rén', en: 'person', strokes: ['M50 14 Q44 62 14 88', 'M47 46 Q62 72 86 88'] },
  { id: 'shan', zh: '山', py: 'shān', en: 'mountain', strokes: ['M50 14 L50 80', 'M20 40 L20 84 L80 84', 'M80 40 L80 84'] },
  { id: 'ri', zh: '日', py: 'rì', en: 'sun', strokes: ['M30 14 L30 86', 'M30 14 L70 14 L70 86', 'M30 50 L70 50', 'M30 86 L70 86'] },
  { id: 'mu', zh: '木', py: 'mù', en: 'tree', strokes: ['M14 38 L86 38', 'M50 12 L50 90', 'M50 44 Q40 68 16 82', 'M50 44 Q60 68 84 82'] },
  { id: 'da', zh: '大', py: 'dà', en: 'big', strokes: ['M14 38 L86 38', 'M52 12 Q46 62 14 88', 'M48 42 Q62 68 86 88'] },
  { id: 'yue', zh: '月', py: 'yuè', en: 'moon', strokes: ['M34 12 Q30 66 14 88', 'M34 14 L74 14 L74 82 Q74 90 64 88', 'M34 40 L74 40', 'M34 64 L74 64'] },
]

export interface Pt {
  x: number
  y: number
}

/** Flatten an M/L/Q path into a dense polyline. */
export function flatten(d: string): Pt[] {
  const t = d.replace(/([MLQ])/g, ' $1 ').trim().split(/\s+/)
  const pts: Pt[] = []
  let i = 0
  let cur: Pt = { x: 0, y: 0 }
  while (i < t.length) {
    const c = t[i++]
    if (c === 'M' || c === 'L') {
      cur = { x: +t[i++], y: +t[i++] }
      pts.push(cur)
    } else if (c === 'Q') {
      const c1 = { x: +t[i++], y: +t[i++] }
      const e = { x: +t[i++], y: +t[i++] }
      for (let k = 1; k <= 14; k++) {
        const u = k / 14
        pts.push({ x: (1 - u) ** 2 * cur.x + 2 * (1 - u) * u * c1.x + u * u * e.x, y: (1 - u) ** 2 * cur.y + 2 * (1 - u) * u * c1.y + u * u * e.y })
      }
      cur = e
    }
  }
  return pts
}

/** `n` evenly spaced points along the path. */
export function sample(d: string, n = 28): Pt[] {
  const p = flatten(d)
  const cum = [0]
  for (let i = 1; i < p.length; i++) cum.push(cum[i - 1] + Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y))
  const total = cum[cum.length - 1]
  const out: Pt[] = []
  let j = 1
  for (let k = 0; k < n; k++) {
    const want = (total * k) / (n - 1)
    while (j < p.length - 1 && cum[j] < want) j++
    const seg = cum[j] - cum[j - 1] || 1
    const u = Math.min(1, Math.max(0, (want - cum[j - 1]) / seg))
    out.push({ x: p[j - 1].x + (p[j].x - p[j - 1].x) * u, y: p[j - 1].y + (p[j].y - p[j - 1].y) * u })
  }
  return out
}

function distToSeg(p: Pt, a: Pt, b: Pt): number {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const l2 = dx * dx + dy * dy
  const u = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2))
  return Math.hypot(p.x - (a.x + dx * u), p.y - (a.y + dy * u))
}

export function distToPolyline(p: Pt, f: Pt[]): number {
  if (f.length === 0) return Infinity
  if (f.length === 1) return Math.hypot(p.x - f[0].x, p.y - f[0].y)
  let best = Infinity
  for (let i = 1; i < f.length; i++) best = Math.min(best, distToSeg(p, f[i - 1], f[i]))
  return best
}

/** How much of the stroke the finger path covers (0..1), in either direction, within `radius` grid units. */
export function coverage(samples: Pt[], finger: Pt[], radius: number): number {
  let hit = 0
  for (const s of samples) if (distToPolyline(s, finger) <= radius) hit++
  return hit / samples.length
}

/** How much of the finger path stays near the stroke (so wild scribbles don't count). */
export function stayedNear(samples: Pt[], finger: Pt[], radius: number): number {
  if (finger.length === 0) return 0
  let ok = 0
  for (const f of finger) if (distToPolyline(f, samples) <= radius) ok++
  return ok / finger.length
}
