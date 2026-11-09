// Writes src/world/map/atlas.json: the shape of every country in the world, from Natural Earth 1:50m (public domain).
//   node scripts/world-atlas.mjs
// It only needs running again to change how the coasts are drawn (the projection or the detail). A new country in the
// game doesn't need it: every country is already in the file, a place just names its code in meta.ts (docs/building.md).
// The source is pinned to one commit, so the same coasts come out every time.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { MAP_H, MAP_W, project, SEAM } from '../src/world/map/project.ts'

const COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19' // natural-earth-vector v5.1.2 + fixes
const FILE = 'ne_50m_admin_0_countries.geojson'
const URL_ = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson/${FILE}`

const root = path.resolve(import.meta.dirname, '..')
const cache = path.join(root, 'node_modules/.cache/world-atlas')
const cached = path.join(cache, FILE)
const OUT = path.join(root, 'src/world/map/atlas.json')

/** How far (in map units) a simplified coast may stray, and the smallest extra island kept. */
const TOLERANCE = 0.6
const MIN_AREA = 40
/** Budget for the home screen: about the weight of the painting this replaces. */
const MAX_GZIP = 90_000

async function source() {
  try {
    return JSON.parse(await readFile(cached, 'utf8'))
  } catch {
    const res = await fetch(URL_)
    if (!res.ok) throw new Error(`${res.status} fetching ${URL_}`)
    const text = await res.text()
    await mkdir(cache, { recursive: true })
    await writeFile(cached, text)
    return JSON.parse(text)
  }
}

const CONTINENT = { Asia: 'asia', Africa: 'africa', Europe: 'europe', Oceania: 'oceania', 'North America': 'northAmerica', 'South America': 'southAmerica', Antarctica: 'antarctica' }
const REGION = { Africa: 'africa', Asia: 'asia', Americas: 'southAmerica', Oceania: 'oceania', Europe: 'europe', Antarctica: 'antarctica' }
const continentOf = (p) => {
  if (p.ADM0_A3 === 'RUS') return 'asia' // one color from the Baltic to the Pacific, as on the painted map
  return CONTINENT[p.CONTINENT] ?? REGION[p.REGION_UN] ?? 'asia'
}

const wrap = ([lon, lat]) => [lon < SEAM ? lon + 360 : lon, lat]
/** A whole island moves across the seam together, or one straddling it would be drawn as a line across the map. */
const wrapRing = (ring) => {
  const mean = ring.reduce((sum, [lon]) => sum + lon, 0) / ring.length
  return mean < SEAM ? ring.map(([lon, lat]) => [Math.min(lon, SEAM) + 360, lat]) : ring.map(([lon, lat]) => [Math.max(lon, SEAM), lat])
}

/** Antarctica's outline runs off both ends of the map and along the pole: rebuild it to open at the seam instead. */
function antarctica(ring) {
  const coast = ring.filter(([, lat]) => lat > -89.9).map(wrap)
  let start = 0
  for (let i = 1; i < coast.length; i++) if (Math.abs(coast[i][0] - coast[i - 1][0]) > 180) start = i
  const open = [...coast.slice(start), ...coast.slice(0, start)]
  const from = open.at(-1)[0]
  const to = open[0][0]
  const pole = []
  for (let i = 0; i <= 90; i++) pole.push([from + ((to - from) * i) / 90, -89.9])
  return [...open, ...pole]
}

function simplify(points, tolerance) {
  // Douglas-Peucker on a closed ring: split at the two farthest-apart points so both ends are real corners.
  let far = 0
  let best = -1
  for (let i = 1; i < points.length; i++) {
    const d = (points[i][0] - points[0][0]) ** 2 + (points[i][1] - points[0][1]) ** 2
    if (d > best) ((best = d), (far = i))
  }
  const keep = new Uint8Array(points.length)
  keep[0] = keep[far] = keep[points.length - 1] = 1
  const stack = [[0, far], [far, points.length - 1]]
  while (stack.length) {
    const [a, b] = stack.pop()
    let idx = -1
    let max = tolerance ** 2
    const [ax, ay] = points[a]
    const dx = points[b][0] - ax
    const dy = points[b][1] - ay
    const len = dx * dx + dy * dy
    for (let i = a + 1; i < b; i++) {
      const t = len ? Math.max(0, Math.min(1, ((points[i][0] - ax) * dx + (points[i][1] - ay) * dy) / len)) : 0
      const d = (points[i][0] - ax - t * dx) ** 2 + (points[i][1] - ay - t * dy) ** 2
      if (d > max) ((max = d), (idx = i))
    }
    if (idx >= 0) {
      keep[idx] = 1
      stack.push([a, idx], [idx, b])
    }
  }
  return points.filter((_, i) => keep[i])
}

const area = (pts) => Math.abs(pts.reduce((s, [x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; return s + x * ny - nx * y }, 0)) / 2

function toPath(pts) {
  const ints = pts.map(([x, y]) => [Math.round(x), Math.round(y)]).filter(([x, y], i, all) => !i || x !== all[i - 1][0] || y !== all[i - 1][1])
  if (ints.length < 3) return '' // an islet smaller than a map unit
  let out = `M${ints[0][0]} ${ints[0][1]}l`
  let last = ''
  for (let i = 1; i < ints.length; i++) {
    const dx = ints[i][0] - ints[i - 1][0]
    const dy = ints[i][1] - ints[i - 1][1]
    const pair = (last && dx >= 0 ? ' ' : '') + dx + (dy >= 0 ? ' ' : '') + dy
    out += pair
    last = pair
  }
  return out + 'z'
}

const data = await source()
const countries = {}
const put = (key, continent, rings, label) => {
  const paths = []
  let box = [Infinity, Infinity, -Infinity, -Infinity]
  for (const pts of rings) {
    const small = simplify(pts, TOLERANCE)
    if (small.length < 3) continue
    if (small.every(([x]) => x < 0 || x > MAP_W)) continue
    const d = toPath(small)
    if (!d) continue
    paths.push(d)
    for (const [x, y] of small) box = [Math.min(box[0], x), Math.min(box[1], y), Math.max(box[2], x), Math.max(box[3], y)]
  }
  if (!paths.length) {
    // A country too tiny to draw (Vatican City, Nauru) is still on the map: a small dot where it is.
    const [x, y] = label.map(Math.round)
    paths.push(`M${x - 3} ${y - 3}l6 0 0 6-6 0z`)
    box = [x - 3, y - 3, x + 3, y + 3]
  }
  const entry = { continent, d: paths.join(''), at: label.map(Math.round), box: box.map(Math.round) }
  if (countries[key]) throw new Error(`two countries called ${key}`)
  countries[key] = entry
}

for (const f of data.features) {
  const p = f.properties
  const key = p.ADM0_A3 // the usual three-letter code for almost every country (a few, like South Sudan's SDS, are Natural Earth's own)
  const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates
  const continent = continentOf(p)
  const rings = []
  const guiana = []
  const biggest = Math.max(...polygons.map((polygon) => area(wrapRing(polygon[0]).map(([lon, lat]) => project(lon, lat)))))
  for (const polygon of polygons) {
    const outer = polygon[0] // holes are only enclaves (Lesotho, San Marino), which are countries of their own
    const isPoleRing = key === 'ATA' && outer.some(([, lat]) => lat < -89.9)
    const lonlat = isPoleRing ? antarctica(outer) : wrapRing(outer)
    const lons = lonlat.map(([lon]) => lon)
    // Off the crop: Hawaii, and the far end of the Aleutians (which would land on the wrong side of the map).
    if (key === 'USA' && (Math.min(...lons) > 170 || (Math.max(...lons) < -150 && lonlat.every(([, lat]) => lat < 30)))) continue
    const pts = lonlat.map(([lon, lat]) => project(lon, lat))
    const size = area(pts)
    if (size < MIN_AREA && size < biggest) continue // specks go, but even the tiniest country keeps its main island
    if (key === 'FRA' && lons[0] < -50 && lonlat[0][1] < 10) guiana.push(pts)
    else rings.push(pts)
  }
  put(key, continent, rings, project(p.LABEL_X, p.LABEL_Y))
  if (guiana.length) put('GUF', 'southAmerica', guiana, project(-53, 4))
}

const json = JSON.stringify({ w: MAP_W, h: MAP_H, countries })
await writeFile(OUT, json + '\n')
const gz = gzipSync(json).length
console.log(`${Object.keys(countries).length} countries, ${(json.length / 1024).toFixed(0)} KB, ${(gz / 1024).toFixed(0)} KB gzipped`)
if (gz > MAX_GZIP) throw new Error('Over budget: raise TOLERANCE or MIN_AREA.')
