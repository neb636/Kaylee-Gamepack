// Writes src/world/places/thailand/activities/hub/map/land.ts: the real coasts and borders for the 3D Thailand map,
// from Natural Earth 1:10m (public domain, naturalearthdata.com). Thailand and its islands, and the neighbours (Myanmar,
// Laos, Cambodia, Malaysia, Vietnam, a corner of China) cut to the map's board.
//   node scripts/thailand-map-land.mjs
// It only needs running again to change the board's edges or how much detail the coasts keep. Never drawn by hand or
// generated: a picture model got Peru's shape wrong. The source is pinned to one commit, so the same coasts come out.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19' // natural-earth-vector v5.1.2 + fixes
const FILE = 'ne_10m_admin_0_countries.geojson'
const URL_ = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson/${FILE}`

const root = path.resolve(import.meta.dirname, '..')
const cache = path.join(root, 'node_modules/.cache/thailand-map')
const cached = process.argv[2] ?? path.join(cache, FILE)
const OUT = path.join(root, 'src/world/places/thailand/activities/hub/map/land.ts')

/** What the data covers: a little past the board on every side (degrees). */
const BOX = { lon0: 94.4, lon1: 108.6, lat0: 3.2, lat1: 22.9 }
/** How far a simplified coast may stray (degrees), and the smallest island kept (square degrees). */
const TOLERANCE = { thai: 0.012, other: 0.03 }
const MIN_AREA = { thai: 0.004, other: 0.02 }
const NEIGHBOURS = ['MMR', 'LAO', 'KHM', 'MYS', 'VNM', 'CHN', 'IDN']

async function source() {
  try {
    return JSON.parse(await readFile(cached, 'utf8'))
  } catch {
    const res = await fetch(URL_)
    if (!res.ok) throw new Error(`${res.status} fetching ${URL_}`)
    const text = await res.text()
    await mkdir(cache, { recursive: true })
    await writeFile(path.join(cache, FILE), text)
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

/** Sutherland-Hodgman: the part of a ring inside the box. */
function clip(ring) {
  const edges = [
    [(p) => p[0] >= BOX.lon0, (a, b) => [BOX.lon0, a[1] + ((b[1] - a[1]) * (BOX.lon0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= BOX.lon1, (a, b) => [BOX.lon1, a[1] + ((b[1] - a[1]) * (BOX.lon1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= BOX.lat0, (a, b) => [a[0] + ((b[0] - a[0]) * (BOX.lat0 - a[1])) / (b[1] - a[1]), BOX.lat0]],
    [(p) => p[1] <= BOX.lat1, (a, b) => [a[0] + ((b[0] - a[0]) * (BOX.lat1 - a[1])) / (b[1] - a[1]), BOX.lat1]],
  ]
  let out = ring
  for (const [inside, cut] of edges) {
    const src = out
    out = []
    for (let i = 0; i < src.length; i++) {
      const a = src[i]
      const b = src[(i + 1) % src.length]
      if (inside(a)) {
        out.push(a)
        if (!inside(b)) out.push(cut(a, b))
      } else if (inside(b)) out.push(cut(a, b))
    }
    if (!out.length) return out
  }
  return out
}

const rings = (feature) => (feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates).map((poly) => poly[0])
const round = (ring) => ring.map(([lon, lat]) => [Math.round(lon * 1000) / 1000, Math.round(lat * 1000) / 1000])
const touches = (ring) => ring.some(([lon, lat]) => lon > BOX.lon0 && lon < BOX.lon1 && lat > BOX.lat0 && lat < BOX.lat1)

const world = await source()
const byCode = (code) => world.features.filter((f) => f.properties.ADM0_A3 === code)

const thai = byCode('THA')
  .flatMap(rings)
  .filter((r) => area(r) >= MIN_AREA.thai)
  .map((r) => round(simplify(r, TOLERANCE.thai)))
  .sort((a, b) => area(b) - area(a))

const others = NEIGHBOURS.flatMap((code) => byCode(code).flatMap(rings))
  .filter(touches)
  .map((r) => clip(r.slice(0, -1)))
  .filter((r) => r.length > 3 && area(r) >= MIN_AREA.other)
  .map((r) => round(simplify(r, TOLERANCE.other)))
  .filter((r) => r.length > 3)
  .sort((a, b) => area(b) - area(a))

const fmt = (ring) => `  [${ring.map(([x, y]) => `[${x},${y}]`).join(',')}],`
const text = `// The real coasts and borders under the 3D Thailand map, [longitude, latitude] in degrees. Written by
// scripts/thailand-map-land.mjs from Natural Earth 1:10m (public domain): don't edit it by hand. Pure data.
export type LonLat = [number, number]

/** Thailand: the mainland first, then its bigger islands (Phuket, Samui, Chang, Lanta...). */
// prettier-ignore
export const THAI: LonLat[][] = [
${thai.map(fmt).join('\n')}
]

/** The neighbours, cut to the map's board: Myanmar, Laos, Cambodia, Malaysia, Vietnam, a corner of China, Sumatra's tip. */
// prettier-ignore
export const OTHERS: LonLat[][] = [
${others.map(fmt).join('\n')}
]
`
await writeFile(OUT, text)
console.log(`${path.relative(root, OUT)}: Thailand ${thai.length} rings, ${thai.reduce((n, r) => n + r.length, 0)} points; neighbours ${others.length} rings, ${others.reduce((n, r) => n + r.length, 0)} points; ${text.length} bytes`)
