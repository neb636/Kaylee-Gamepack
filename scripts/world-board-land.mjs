// Writes src/world/board/land.ts: the real coasts under the 3D world board (#/world), from Natural Earth 1:50m (public
// domain, naturalearthdata.com). All the world's land, the big lakes and inland seas, and the full shape of every
// country in src/world/board/places.ts (the ones that stand up on the board).
//   node scripts/world-board-land.mjs
// Run it again after adding a country to places.ts, or to change how much detail the coasts keep. Never drawn by hand
// or generated: a picture model got Peru's shape wrong. The source is pinned to one commit, so the same coasts come out.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { BOARD_PLACES, EDGE } from '../src/world/board/places.ts'

const COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19' // natural-earth-vector v5.1.2 + fixes
const BASE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson`

const root = path.resolve(import.meta.dirname, '..')
const cache = process.argv[2] ?? path.join(root, 'node_modules/.cache/world-board')
const OUT = path.join(root, 'src/world/board/land.ts')

/** How far a simplified coast may stray (degrees), and the smallest island or lake kept (square degrees). */
const TOLERANCE = { land: 0.11, country: 0.05, lake: 0.1 }
const MIN_AREA = { land: 0.35, country: 0.3, lake: 1.1, sea: 1.5 }
/** The data stops a little past the board's top and bottom (the tray's rim hides the cut). */
const LAT = { south: EDGE.lat0 - 1.5, north: EDGE.lat1 + 3 }

async function source(file) {
  try {
    return JSON.parse(await readFile(path.join(cache, file), 'utf8'))
  } catch {
    const res = await fetch(`${BASE}/${file}`)
    if (!res.ok) throw new Error(`${res.status} fetching ${file}`)
    const text = await res.text()
    await mkdir(cache, { recursive: true })
    await writeFile(path.join(cache, file), text)
    return JSON.parse(text)
  }
}

const area = (ring) => Math.abs(ring.reduce((sum, [x, y], i) => sum + x * ring[(i + 1) % ring.length][1] - ring[(i + 1) % ring.length][0] * y, 0)) / 2

/** Douglas-Peucker on a closed ring. */
function simplify(ring, tol) {
  const pts = ring.slice()
  if (pts.length > 1 && pts[0][0] === pts.at(-1)[0] && pts[0][1] === pts.at(-1)[1]) pts.pop()
  if (pts.length < 8) return pts
  // Split the ring at its two farthest-apart points, so each half is an open line.
  let far = 0
  let best = -1
  pts.forEach((p, i) => {
    const d = Math.hypot(p[0] - pts[0][0], p[1] - pts[0][1])
    if (d > best) {
      best = d
      far = i
    }
  })
  const line = (a) => {
    const keep = new Uint8Array(a.length)
    keep[0] = keep[a.length - 1] = 1
    const stack = [[0, a.length - 1]]
    while (stack.length) {
      const [i, j] = stack.pop()
      const [ax, ay] = a[i]
      const [bx, by] = a[j]
      const len = Math.hypot(bx - ax, by - ay) || 1e-9
      let worst = 0
      let at = -1
      for (let k = i + 1; k < j; k++) {
        const d = Math.abs((bx - ax) * (ay - a[k][1]) - (ax - a[k][0]) * (by - ay)) / len
        if (d > worst) {
          worst = d
          at = k
        }
      }
      if (worst > tol && at > 0) {
        keep[at] = 1
        stack.push([i, at], [at, j])
      }
    }
    return a.filter((_, i) => keep[i])
  }
  const a = line(pts.slice(0, far + 1))
  const b = line([...pts.slice(far), pts[0]])
  return [...a, ...b.slice(1, -1)]
}

/** Sutherland-Hodgman against one straight edge: the part of a ring where `inside` holds. */
function cut(ring, axis, at, keepAbove) {
  const inside = (p) => (keepAbove ? p[axis] >= at : p[axis] <= at)
  const cross = (a, b) => {
    const t = (at - a[axis]) / (b[axis] - a[axis])
    const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    p[axis] = at
    return p
  }
  const out = []
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (inside(a)) {
      out.push(a)
      if (!inside(b)) out.push(cross(a, b))
    } else if (inside(b)) out.push(cross(a, b))
  }
  return out
}

/** A ring as the board shows it: cut at the board's top and bottom, and at the Bering Strait (what lies west of the
 *  cut moves to the far right, so Russia's tip joins Russia). One ring in, one or two out. */
function onBoard(ring) {
  let r = ring.slice()
  if (r.length > 1 && r[0][0] === r.at(-1)[0] && r[0][1] === r.at(-1)[1]) r.pop()
  r = cut(cut(r, 1, LAT.south, true), 1, LAT.north, false)
  if (r.length < 3) return []
  const lons = r.map((p) => p[0])
  const lo = Math.min(...lons)
  const hi = Math.max(...lons)
  if (lo >= EDGE.lon0) return [r]
  if (hi <= EDGE.lon0 + 2) return [r.map(([x, y]) => [x + 360, y])]
  // It straddles the cut (Antarctica, which runs all the way round): two pieces.
  const east = cut(r, 0, EDGE.lon0, true)
  const west = cut(r, 0, EDGE.lon0, false).map(([x, y]) => [x + 360, y])
  return [east, west].filter((p) => p.length >= 3)
}

const polygons = (feature) => (feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates)

/** Rings ready to write: on the board, big enough, simplified, biggest first. */
const prepare = (rings, tol, min) =>
  rings
    .flatMap(onBoard)
    .filter((r) => area(r) >= min)
    .map((r) => simplify(r, tol))
    .filter((r) => r.length >= 3)
    .sort((a, b) => area(b) - area(a))

/** A ring as whole numbers (hundredths of a degree): the first point, then each step to the next. Small numbers
 *  squeeze well. */
function pack(ring) {
  const q = ring.map(([x, y]) => [Math.round(x * 100), Math.round(y * 100)])
  const out = [q[0][0], q[0][1]]
  for (let i = 1; i < q.length; i++) {
    const dx = q[i][0] - q[i - 1][0]
    const dy = q[i][1] - q[i - 1][1]
    if (dx || dy) out.push(dx, dy)
  }
  return `[${out.join(',')}]`
}
const block = (rings) => rings.map((r) => `  ${pack(r)},`).join('\n')
const count = (rings) => rings.reduce((n, r) => n + r.length, 0)

const [landSrc, countrySrc, lakeSrc] = await Promise.all(['ne_50m_land.geojson', 'ne_50m_admin_0_countries.geojson', 'ne_50m_lakes.geojson'].map(source))

const landPolys = landSrc.features.flatMap(polygons)
const land = prepare(landPolys.map((p) => p[0]), TOLERANCE.land, MIN_AREA.land)
// Holes in the land are inland seas (the Caspian): real water on the board, with a shore.
const seas = prepare(landPolys.flatMap((p) => p.slice(1)), TOLERANCE.lake, MIN_AREA.sea)
const lakes = prepare(lakeSrc.features.flatMap(polygons).map((p) => p[0]), TOLERANCE.lake, MIN_AREA.lake)

const countries = BOARD_PLACES.map((place) => {
  const found = countrySrc.features.filter((f) => f.properties.ADM0_A3 === place.iso)
  if (!found.length) throw new Error(`No country with the code ${place.iso} (for ${place.id}) in Natural Earth`)
  return { ...place, rings: prepare(found.flatMap(polygons).map((p) => p[0]), TOLERANCE.country, MIN_AREA.country) }
})

const text = `// The real coasts under the 3D world board. Written by scripts/world-board-land.mjs from Natural Earth 1:50m (public
// domain): don't edit it by hand. Pure data. Each ring is whole numbers, hundredths of a degree: its first point
// (longitude, latitude), then each step to the next point. \`rings()\` turns them back into degrees.
import type { LonLat } from './places'

/** Packed rings back into [longitude, latitude] points. */
export function rings(packed: number[][]): LonLat[][] {
  return packed.map((r) => {
    const out: LonLat[] = []
    let x = 0
    let y = 0
    for (let i = 0; i < r.length; i += 2) {
      x += r[i]
      y += r[i + 1]
      out.push([x / 100, y / 100])
    }
    return out
  })
}

/** All the world's land, biggest piece first. */
// prettier-ignore
export const LAND: number[][] = [
${block(land)}
]

/** Inland seas (holes in the land). */
// prettier-ignore
export const SEAS: number[][] = [
${block(seas)}
]

/** The big lakes. */
// prettier-ignore
export const LAKES: number[][] = [
${block(lakes)}
]

/** The countries that stand up on the board (places.ts), by place: the mainland first, then the islands. */
// prettier-ignore
export const COUNTRIES: Record<string, number[][]> = {
${countries.map((c) => `  ${JSON.stringify(c.id)}: [\n${c.rings.map((r) => `    ${pack(r)},`).join('\n')}\n  ],`).join('\n')}
}
`
await mkdir(path.dirname(OUT), { recursive: true })
await writeFile(OUT, text)
console.log(`${path.relative(root, OUT)}: land ${land.length} rings / ${count(land)} points; seas ${seas.length}; lakes ${lakes.length} / ${count(lakes)}; ${countries.map((c) => `${c.id} ${c.rings.length}/${count(c.rings)}`).join(', ')}; ${Math.round(text.length / 1024)} KB`)
