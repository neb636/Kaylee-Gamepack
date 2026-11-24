// Draws Luna's map of Peru, the picture on Peru's hub, and says where things are on it:
//   src/world/places/peru/assets/scene-peru-map.svg   the picture
//   src/world/places/peru/mapLand.ts                  the pins' spots, the three worlds' shapes (for her taps), the surprises' spots
//   node scripts/peru-map.mjs            writes both
//   node scripts/peru-map.mjs --out f    writes only the picture, somewhere else, to look at it first
// Peru's outline, its neighbours, its big rivers (the Marañón and the Ucayali join into the Amazon) and Lake Titicaca
// are the real ones, from Natural Earth 1:50m (public domain, naturalearthdata.com), pinned to one commit so the same
// map comes out. Never traced from a generated picture: a picture model got Peru's shape wrong. Everything else is
// drawn here by hand in the shelf's look (src/world/shelf/STYLE.md): flat tones, no outlines, light from the top
// left. Peru's three worlds sit side by side: the desert coast, the Andes and the rainforest.
// Change the drawing here and run it again; don't edit the SVG.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const COMMIT = 'ca96624a56bd078437bca8184e78163e5039ad19' // natural-earth-vector v5.1.2 + fixes
const SOURCE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${COMMIT}/geojson`
const root = path.resolve(import.meta.dirname, '..')
const cache = path.join(root, 'node_modules/.cache/peru-map')
const outAt = process.argv.indexOf('--out')
const OUT = outAt > 0 ? process.argv[outAt + 1] : path.join(root, 'src/world/places/peru/assets/scene-peru-map.svg')
const LAND = path.join(root, 'src/world/places/peru/mapLand.ts')

async function source(name) {
  const file = path.join(cache, `${name}.geojson`)
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    const res = await fetch(`${SOURCE}/${name}.geojson`)
    if (!res.ok) throw new Error(`${res.status} fetching ${name}`)
    const text = await res.text()
    await mkdir(cache, { recursive: true })
    await writeFile(file, text)
    return JSON.parse(text)
  }
}

// ---- The map's box: a 1000 x 1000 square, Peru filling its height. ----
const SIZE = 1000
/** Map units per degree of latitude; longitudes shrink by the cosine of Peru's middle latitude. */
const K = 48
const SQUEEZE = Math.cos((9.2 * Math.PI) / 180)
const ORIGIN = { lon: -81.34, lat: -0.04, x: 212, y: 58 }
/** [longitude, latitude] to the map. */
const at = ([lon, lat]) => [ORIGIN.x + (lon - ORIGIN.lon) * SQUEEZE * K, ORIGIN.y + (ORIGIN.lat - lat) * K]

// ---- Geometry helpers ----
const r5 = (n) => String(Math.round(n * 2) / 2)
const P = ([x, y]) => `${r5(x)} ${r5(y)}`
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])

/** Douglas-Peucker on an open line. */
function thin(a, tol) {
  if (a.length < 3) return a
  const keep = new Uint8Array(a.length)
  keep[0] = keep[a.length - 1] = 1
  const stack = [[0, a.length - 1]]
  while (stack.length) {
    const [i, j] = stack.pop()
    const [ax, ay] = a[i]
    const [bx, by] = a[j]
    const len = Math.hypot(bx - ax, by - ay) || 1e-9
    let worst = 0
    let k0 = -1
    for (let k = i + 1; k < j; k++) {
      const d = Math.abs((bx - ax) * (ay - a[k][1]) - (ax - a[k][0]) * (by - ay)) / len
      if (d > worst) {
        worst = d
        k0 = k
      }
    }
    if (worst > tol && k0 > 0) {
      keep[k0] = 1
      stack.push([i, k0], [k0, j])
    }
  }
  return a.filter((_, i) => keep[i])
}
/** The same on a closed ring: split at its two farthest-apart points. */
function thinRing(ring, tol) {
  const pts = ring.slice()
  if (dist(pts[0], pts.at(-1)) < 1e-9) pts.pop()
  let far = 0
  pts.forEach((p, i) => {
    if (dist(p, pts[0]) > dist(pts[far], pts[0])) far = i
  })
  return [...thin(pts.slice(0, far + 1), tol), ...thin([...pts.slice(far), pts[0]], tol).slice(1, -1)]
}
/** Sutherland-Hodgman: the part of a ring inside a box (map units). */
function clipRing(ring, x0, y0, x1, y1) {
  const cutX = (x) => (a, b) => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])]
  const cutY = (y) => (a, b) => [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]), y]
  const edges = [
    [(p) => p[0] >= x0, cutX(x0)],
    [(p) => p[0] <= x1, cutX(x1)],
    [(p) => p[1] >= y0, cutY(y0)],
    [(p) => p[1] <= y1, cutY(y1)],
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
    if (!out.length) break
  }
  return out
}
const inside = (ring, [x, y]) => {
  let hit = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}
const toSegment = (p, a, b) => {
  const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2 || 1e-9
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2))
  return dist(p, [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])])
}
/** How far a point is from a line (or from a ring's edge, with `closed`). */
const toLine = (p, line, closed = false) => {
  let best = Infinity
  for (let i = 0; i < line.length - (closed ? 0 : 1); i++) best = Math.min(best, toSegment(p, line[i], line[(i + 1) % line.length]))
  return best
}
/** A soft closed shape: the ring's corners are rounded (each corner pulls a curve between its sides' middles). */
const softRing = (ring) => {
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  let d = `M${P(mid(ring.at(-1), ring[0]))}`
  ring.forEach((p, i) => (d += `Q${P(p)} ${P(mid(p, ring[(i + 1) % ring.length]))}`))
  return `${d}Z`
}
/** A smooth open line through its points (Catmull-Rom, as cubic curves). */
const smooth = (pts) => {
  let d = `M${P(pts[0])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    d += `C${P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${P(p2)}`
  }
  return d
}
/** Points every `step` units along a line, each with the line's direction there. */
function along(line, step, start = step / 2) {
  const out = []
  let left = start
  for (let i = 0; i < line.length - 1; i++) {
    const len = dist(line[i], line[i + 1])
    const dir = Math.atan2(line[i + 1][1] - line[i][1], line[i + 1][0] - line[i][0])
    while (left <= len) {
      const t = left / len
      out.push({ p: [line[i][0] + t * (line[i + 1][0] - line[i][0]), line[i][1] + t * (line[i + 1][1] - line[i][1])], dir })
      left += step
    }
    left -= len
  }
  return out
}
/** Denser points on a smooth line through the given ones (the same curve `smooth` draws). */
function fine(pts, per = 8) {
  const out = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    for (let k = 0; k < per; k++) {
      const t = k / per
      const h = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t)
      out.push([h(p0[0], p1[0], p2[0], p3[0]), h(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts.at(-1))
  return out
}
/** The same wobble every run. */
let seed = 7
const rnd = () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
}
const wob = (n) => (rnd() - 0.5) * 2 * n

// ---- The real shapes ----
const countries = await source('ne_50m_admin_0_countries')
const ringsOf = (code) => {
  const f = countries.features.find((c) => c.properties.ADM0_A3 === code)
  return (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map((poly) => poly[0].map(at))
}
const PERU = thinRing(ringsOf('PER')[0], 1.1)
const VIEW = [-40, -40, SIZE + 40, SIZE + 40]
const NEIGHBOURS = ['ECU', 'COL', 'BRA', 'BOL', 'CHL', 'VEN'].map((code) =>
  ringsOf(code)
    .map((r) => clipRing(r.slice(0, -1), ...VIEW))
    .filter((r) => r.length > 3)
    .map((r) => thinRing(r, 2))
    .filter((r) => r.length > 3),
)

const riverData = await source('ne_50m_rivers_lake_centerlines')
const river = (name) =>
  riverData.features
    .filter((f) => f.properties.name === name && f.geometry)
    .flatMap((f) => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates))
    .map((line) => line.map(at).filter(([x, y]) => x > -60 && x < SIZE + 60 && y > -60 && y < SIZE + 60))
    .filter((line) => line.length > 1)
    .map((line) => thin(line, 1.6))
const RIVERS = [
  { lines: river('Amazonas'), w: 15 },
  { lines: river('Marañón'), w: 11 },
  { lines: river('Ucayali'), w: 11 },
  { lines: river('Madre de Dios'), w: 8 },
]
const lakes = await source('ne_50m_lakes')
const TITICACA = thinRing(lakes.features.find((f) => f.properties.name === 'Lago Titicaca').geometry.coordinates[0].map(at), 0.8)

// ---- Peru's three worlds ----
// Two lines down the country, north to south, in [longitude, latitude]: where the desert coast meets the Andes, and
// where the Andes meet the rainforest. The coast is drawn wider than it is (a real one would be a hair on this map).
const FOOTHILLS = fine(
  [[-80.3, -2.7], [-79.95, -4.2], [-79.85, -5.4], [-79.3, -6.4], [-78.45, -7.5], [-77.8, -8.6], [-77.1, -10], [-76.4, -11.3], [-75.6, -12.6], [-74.85, -13.8], [-73.9, -14.8], [-72.6, -15.7], [-71.2, -16.6], [-70, -17.35], [-69, -17.9]].map(at),
)
const TREELINE = fine(
  [[-78.7, -2.6], [-78.2, -4.5], [-77.4, -5.8], [-76.6, -7.2], [-75.95, -8.6], [-75.3, -9.9], [-74.6, -11], [-73.8, -11.95], [-72.8, -12.6], [-71.8, -13.05], [-70.7, -13.5], [-69.7, -14], [-68.4, -14.5]].map(at),
)
/** Everything on the ocean's side of a line. */
const oceanRing = (line) => [...line, [line.at(-1)[0], SIZE + 80], [-80, SIZE + 80], [-80, -80]]
const sparse = (line) => line.filter((_, i) => i % 4 === 0 || i === line.length - 1)
const oceanSide = (line) => `${smooth(sparse(line))}V${SIZE + 80}H-80V-80Z`
const isForest = (p) => inside(PERU, p) && !inside(oceanRing(TREELINE), p)
const isCoast = (p) => inside(PERU, p) && inside(oceanRing(FOOTHILLS), p)
const isAndes = (p) => inside(PERU, p) && !isForest(p) && !isCoast(p)

// ---- Colors (the shelf's palette) ----
const C = {
  sea: ['#86d0fb', '#5cb5ee'],
  shallows: '#c9e9ff',
  land: ['#fcf1d9', '#f9ebcf', '#fbeed4', '#f8e9cb', '#fcf1d9', '#f9ebcf'],
  ghost: '#f3e4bf',
  forest: '#93de9f',
  glade: '#aee8b7',
  tree: ['#55b97a', '#3e9e78', '#8adb9a'],
  trunk: '#b17d56',
  andes: '#d3c8f7',
  peak: ['#b9a6f5', '#937ee0'],
  snow: ['#ffffff', '#e4ddf6'],
  sand: ['#f5dba8', '#e3bb7a', '#fdeecc'],
  cactus: ['#5cc6a6', '#3e9e78', '#a8ecd4'],
  water: ['#3fc1cf', '#8fe3ea'],
  shadow: '#4b3a8c',
}

// ---- Little drawings, each around its own middle ----
const put = (id, [x, y], k) => `<use href="#${id}" transform="translate(${r5(x)} ${r5(y)}) scale(${Math.round(k * 100) / 100})"/>`
/** A round tree, 10 units across its crown's radius. */
const TREE = `<g id="tree"><rect x="-2" y="5" width="4" height="8.5" rx="2" fill="${C.trunk}"/><circle r="10" fill="${C.tree[1]}"/><circle cx="-1.2" cy="-1.3" r="8.6" fill="${C.tree[0]}"/><circle cx="-3.4" cy="-3.8" r="3" fill="${C.tree[2]}"/></g>`
const PALM = `<g id="palm"><path d="M-3 22Q-6 6 1 -6L5 -5Q0 7 4 22Z" fill="${C.trunk}"/>${[
  [-158, 1],
  [-112, 0],
  [-68, 1],
  [-22, 0],
  [24, 1],
  [-200, 0],
]
  .map(([a, k]) => `<path d="M0 0Q12 -9 25 0Q12 3 0 0Z" transform="translate(2 -7) rotate(${a})" fill="${C.tree[k]}"/>`)
  .join('')}<circle cx="2" cy="-7" r="3.5" fill="${C.tree[2]}"/></g>`
/** A snowy peak, 100 wide and 94 tall, standing on its foot's middle: the body, its shaded face, the snow and the snow's shade. */
const PEAK = `<g id="peak"><path d="M-50 0L-7 -85Q0 -99 7 -85L50 0Q0 13 -50 0Z" fill="${C.peak[0]}"/><path d="M7 -85L50 0Q30 5.5 12 6L20 -28L3 -44Q0 -99 7 -85Z" fill="${C.peak[1]}"/><path d="M-7 -85Q0 -99 7 -85L27 -45L15 -55L5 -39L-9 -54L-25 -44Z" fill="${C.snow[0]}"/><path d="M2 -92Q4.5 -90 7 -85L27 -45L15 -55L5 -39Z" fill="${C.snow[1]}"/></g>`
const tree = (p, r) => put('tree', p, r / 10)
const palm = (p, k) => put('palm', p, k)
const peak = (p, w) => put('peak', p, w / 100)
const dune = ([x, y], s, k = 2) => `<path d="M-22 4Q0 -16 22 4Q0 -5 -22 4Z" transform="translate(${r5(x)} ${r5(y)}) scale(${s})" fill="${C.sand[k]}"/>`
const cactus = ([x, y], s) =>
  `<g transform="translate(${r5(x)} ${r5(y)}) scale(${s})"><path d="M-9 0V-6Q-9 -9 -6 -9M9 -4V-11Q9 -14 6 -14" fill="none" stroke="${C.cactus[1]}" stroke-width="5" stroke-linecap="round"/><rect x="-5" y="-22" width="10" height="30" rx="5" fill="${C.cactus[0]}"/><rect x="-5" y="-22" width="4" height="30" rx="2" fill="${C.cactus[2]}" opacity="0.6"/><circle cy="-23" r="3" fill="#ff8fb8"/></g>`
const wave = ([x, y], s = 1) => `<path d="M-24 0q12 -12 24 0t24 0" transform="translate(${r5(x)} ${r5(y)}) scale(${s})"/>`

// ---- Where things go ----
/** The places she flies to, on their real spots. */
const PLACES = {
  river: at([-74.4, -4.9]), // the flooded forest of Pacaya-Samiria, where the pink dolphins swim
  'machu-picchu': at([-72.545, -13.163]),
  penguins: at([-76.45, -13.75]), // the Ballestas Islands, off Paracas
  alpaca: at([-70.3, -15.25]), // the high plain by Lake Titicaca
}
/**
 * Their pins: a pin is a fifth of the map wide on a phone, so the three in the south are nudged apart (Machu Picchu up
 * the range, Luna toward the lake, the penguins out to sea) until none covers another.
 */
const PINS = {
  river: PLACES.river,
  'machu-picchu': [PLACES['machu-picchu'][0] - 34, PLACES['machu-picchu'][1] - 42],
  penguins: [PLACES.penguins[0] - 62, PLACES.penguins[1] + 38],
  alpaca: [PLACES.alpaca[0] + 36, PLACES.alpaca[1] + 30],
}
const clearOfPins = (p, by) => Object.values(PINS).every((pin) => dist(pin, p) > by)

// The Andes: one row of big snowy peaks down the range's middle, smaller ones where it widens in the south.
const SPINE = FOOTHILLS.map((p, i) => {
  const q = TREELINE[Math.min(TREELINE.length - 1, Math.round((i / (FOOTHILLS.length - 1)) * (TREELINE.length - 1)))]
  return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]
})
const peaks = []
const tryPeak = (p, w, h = w * 0.94) => {
  // It stands in the Andes with its foot inside Peru, clear of the lake, and the peaks don't pile up.
  const foot = [[-w * 0.5, 0], [w * 0.5, 0], [0, -h], [0, h * 0.14]].every(([dx, dy]) => inside(PERU, [p[0] + dx, p[1] + dy]) && toLine([p[0] + dx, p[1] + dy], PERU, true) > 7)
  if (!foot || !isAndes([p[0], p[1] - h * 0.3]) || toLine(p, TITICACA, true) < w * 0.75 || inside(TITICACA, p)) return
  if (peaks.some((o) => Math.hypot(o.p[0] - p[0], (o.p[1] - p[1]) * 1.5) < (o.w + w) * 0.4)) return
  peaks.push({ p, w, h })
}
along(SPINE, 56, 70).forEach(({ p }, i) => tryPeak([p[0] + (i % 2 ? 9 : -9), p[1] + 24], [70, 58, 78, 62][i % 4]))
// Where the range widens in the south: a second and a third row of smaller ones.
for (const [lon, lat, w] of [[-73.6, -12.75, 50], [-72.6, -14.05, 56], [-71.2, -14.1, 50], [-73.9, -14.25, 46], [-72.3, -15.2, 50], [-70.95, -15.75, 54], [-69.9, -16.75, 46], [-71.4, -16.4, 42]]) tryPeak(at([lon, lat]), w)
peaks.sort((a, b) => a.p[1] - b.p[1])

// The rainforest: round trees on a loose grid, palms here and there, clear of the rivers, the border and the pins.
const riverLines = RIVERS.flatMap((r) => r.lines)
const trees = []
const roomFor = (p, r, gap) => trees.every((t) => dist(t.p, p) > t.r + r + gap)
// A row of them where the forest climbs the mountains.
along(TREELINE, 31, 8).forEach(({ p, dir }, i) => {
  const r = 14 + (i % 3) * 2.5
  const q = [p[0] + Math.cos(dir - Math.PI / 2) * (i % 2 ? 4 : 13) + wob(2), p[1] + Math.sin(dir - Math.PI / 2) * (i % 2 ? 4 : 13) + wob(2)]
  if (inside(PERU, q) && toLine(q, PERU, true) > r + 6 && riverLines.every((l) => toLine(q, l) > r + 5)) trees.push({ p: q, r, palm: false })
})
// Then the rest, wherever there is room: candidates on a fine grid, tried in a shuffled order.
const spots = []
for (let gy = 60; gy < 880; gy += 11) for (let gx = 300; gx < 900; gx += 11) spots.push([gx, gy])
for (let i = spots.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1))
  ;[spots[i], spots[j]] = [spots[j], spots[i]]
}
for (const small of [false, true]) {
  for (const p of spots) {
    const r = small ? 10 + rnd() * 2 : 15 + rnd() * 6
    if (!isForest(p) || toLine(p, PERU, true) < r + 9 || !roomFor(p, r, small ? 5 : 8)) continue
    if (riverLines.some((l) => toLine(p, l) < r + 8)) continue
    trees.push({ p, r, palm: !small && trees.length % 4 === 3 })
  }
}
trees.sort((a, b) => a.p[1] - b.p[1])

// The coast: dunes and a few cactuses, clear of the foothills and the shore.
const coast = []
along(FOOTHILLS, 24, 14).forEach(({ p, dir }, i) => {
  const off = 26 + (i % 3) * 13
  const q = [p[0] + Math.cos(dir + Math.PI / 2) * off, p[1] + Math.sin(dir + Math.PI / 2) * off]
  if (isCoast(q) && toLine(q, PERU, true) > 13 && coast.every((c) => dist(c, q) > 27)) coast.push(q)
})

// Where each world's little surprise happens, clear of the pins: a wave off the middle of the coast, a glint on the
// biggest snowcap, a pink dolphin in the Amazon.
const tallest = peaks.filter((k) => clearOfPins([k.p[0], k.p[1] - k.w * 0.5], 115)).sort((a, b) => b.w - a.w)[0]
const SURPRISES = {
  wave: at([-78.75, -11.35]),
  glint: [tallest.p[0], tallest.p[1] - tallest.w * 0.74],
  splash: RIVERS[0].lines.flatMap((l) => along(l, 6)).map((k) => k.p).filter((p) => inside(PERU, p) && toLine(p, PERU, true) > 30 && clearOfPins(p, 105))[0],
}

// The neighbours' own forests and mountains, as pale as their land.
const GHOSTS = {
  trees: [[-71.6, -6.4], [-70.3, -8.1], [-68.2, -5.6], [-66.9, -9.3], [-69.2, -2.2], [-73.3, 0.35], [-71.4, -0.6], [-66.6, -2.9], [-67.6, -12.2], [-65.7, -7.1], [-77.3, -1.2]].map(at),
  peaks: [[-78.9, -1.5], [-67.3, -16.2], [-66.2, -18.4], [-68.6, -19.6], [-65.5, -15.1]].map(at),
}

// ---- The picture ----
const peruPath = softRing(PERU)
const hills = along(FOOTHILLS, 38)
  .filter(({ p }) => inside(PERU, p) || toLine(p, PERU, true) < 20)
  .map(({ p }, i) => `<circle cx="${r5(p[0] + 4)}" cy="${r5(p[1] - 4)}" r="${[15, 21, 13, 18][i % 4]}"/>`)
  .join('')
const riverPaths = (grow = 0) => RIVERS.map((r) => `<g stroke-width="${r.w + grow}">${r.lines.map((l) => `<path d="${smooth(l)}"/>`).join('')}</g>`).join('')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
  <title>Luna's map of Peru: the desert coast, the Andes and the rainforest</title>
  <defs>
    <linearGradient id="sea" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${C.sea[0]}"/><stop offset="1" stop-color="${C.sea[1]}"/></linearGradient>
    <path id="peru" d="${peruPath}"/>
    ${TREE}
    ${PALM}
    ${PEAK}
    <g id="near">${NEIGHBOURS.map((rings, i) => rings.map((r) => `<path d="${softRing(r)}" fill="${C.land[i]}"/>`).join('')).join('')}</g>
    <clipPath id="in"><use href="#peru"/></clipPath>
  </defs>
  <!-- the Pacific -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#sea)"/>
  <!-- the neighbours (Ecuador, Colombia, Brazil, Bolivia, Chile): quiet, with pale shallows along the shore -->
  <g fill="none" stroke="${C.shallows}" stroke-linejoin="round">
    <g stroke-width="46" opacity="0.4"><use href="#near"/><use href="#peru"/></g>
    <g stroke-width="20" opacity="0.5"><use href="#near"/><use href="#peru"/></g>
  </g>
  <use href="#near" stroke="#fff" stroke-width="5" stroke-linejoin="round"/>
  <g fill="${C.ghost}">
    ${GHOSTS.trees.map((p, i) => `<circle cx="${r5(p[0])}" cy="${r5(p[1])}" r="${16 + (i % 3) * 3}"/><circle cx="${r5(p[0] + 24)}" cy="${r5(p[1] + 9)}" r="${12 + (i % 2) * 3}"/>`).join('')}
    ${GHOSTS.peaks.map((p, i) => `<path d="M-30 0L-4 -36Q0 -41 4 -36L30 0Z" transform="translate(${P(p)}) scale(${1 + (i % 2) * 0.25})"/>`).join('')}
  </g>
  <g fill="none" stroke="#cdeaf3" stroke-linecap="round" stroke-linejoin="round">${riverPaths(-3)}</g>
  <!-- Peru: a soft shadow, a white rim, then its three worlds -->
  <use href="#peru" transform="translate(5 9)" fill="${C.shadow}" opacity="0.16"/>
  <use href="#peru" fill="#fff" stroke="#fff" stroke-width="13" stroke-linejoin="round"/>
  <g clip-path="url(#in)">
    <rect width="${SIZE}" height="${SIZE}" fill="${C.forest}"/>
    <g fill="${C.glade}">${trees.filter((_, i) => i % 4 === 0).map(({ p, r }) => `<ellipse cx="${r5(p[0] + 30)}" cy="${r5(p[1] + 24)}" rx="${r5(r * 2.2)}" ry="${r5(r * 1.3)}"/>`).join('')}</g>
    <g fill="none" stroke="${C.water[0]}" stroke-linecap="round" stroke-linejoin="round">${riverPaths()}</g>
    <g fill="none" stroke="${C.water[1]}" stroke-linecap="round" stroke-dasharray="10 38" opacity="0.9">${RIVERS.map((r) => `<g stroke-width="${Math.max(2.5, r.w * 0.28)}">${r.lines.map((l) => `<path d="${smooth(l)}"/>`).join('')}</g>`).join('')}</g>
    <path d="${oceanSide(TREELINE)}" fill="${C.andes}"/>
    <path d="${oceanSide(FOOTHILLS)}" fill="${C.sand[0]}"/>
    <g fill="${C.andes}">${hills}</g>
  </g>
  <!-- Lake Titicaca, on the border -->
  <path d="${softRing(TITICACA)}" fill="${C.water[0]}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
  <!-- the coast: dunes and cactuses -->
  ${coast.map((p, i) => (i % 4 === 2 ? cactus(p, 0.9) : dune(p, 0.8 + (i % 3) * 0.18, i % 3 === 1 ? 1 : 2))).join('\n  ')}
  <!-- the Andes: snowy peaks, far ones first -->
  ${peaks.map(({ p, w }) => peak(p, w)).join('\n  ')}
  <!-- the rainforest: trees and palms, far ones first -->
  ${trees.map(({ p, r, palm: isPalm }) => (isPalm ? palm(p, r / 17) : tree(p, r))).join('\n  ')}
  <!-- the sea: little waves, a whale's tail and a compass -->
  <g fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.85">
    ${[[150, 70], [270, 300], [60, 300], [318, 505], [205, 470], [60, 700], [228, 742], [455, 775], [330, 905], [575, 940], [120, 960]].map((p, i) => wave(p, 0.8 + (i % 3) * 0.15)).join('\n    ')}
  </g>
  <g transform="translate(${P(at([-83.25, -7.1]))}) scale(1.35)">
    <ellipse cy="11" rx="21" ry="5" fill="#fff" opacity="0.75"/>
    <path d="M-6 11Q-5 -6 -2 -14Q-16 -14 -27 -27Q-12 -33 0 -20Q12 -33 27 -27Q16 -14 2 -14Q5 -6 6 11Z" fill="#6f82e2"/>
    <path d="M-2 -14Q-16 -14 -27 -27Q-12 -33 0 -20Q-3 -18 -2 -14Z" fill="#9aaaf2"/>
    <circle cx="-24" cy="3" r="3" fill="#fff"/><circle cx="25" cy="1" r="2.5" fill="#fff"/><circle cx="31" cy="9" r="2" fill="#fff"/>
  </g>
  <g transform="translate(112 590)">
    <circle r="43" fill="#fff" opacity="0.22"/>
    <circle r="43" fill="none" stroke="#fff" stroke-width="4" opacity="0.8"/>
    <path d="M0 -30L6 -6L30 0L6 6L0 30L-6 6L-30 0L-6 -6Z" transform="rotate(45)" fill="${C.shallows}"/>
    <path d="M0 -52L9 -9L52 0L9 9L0 52L-9 9L-52 0L-9 -9Z" fill="#fff"/>
    <path d="M0 -52L9 -9H-9Z" fill="#ff4f9a"/>
    <path d="M0 -52L9 -9L52 0L9 9L0 52V0Z" fill="${C.shadow}" opacity="0.12"/>
    <circle r="6" fill="#ffc83d"/>
  </g>
</svg>
`
await writeFile(OUT, svg)

const pct = ([x, y]) => `[${(x / (SIZE / 100)).toFixed(1)}, ${(y / (SIZE / 100)).toFixed(1)}]`
const xy = ([x, y]) => `[${Math.round(x)}, ${Math.round(y)}]`
const pts = (ring) => `[${ring.map(xy).join(', ')}]`
if (outAt < 0) {
  const land = `// Where things are on Luna's map of Peru (assets/scene-peru-map.svg). Written by scripts/peru-map.mjs together with
// the picture, so the two can't drift apart: don't edit it by hand, change the script and run it again.

export type Pt = readonly [x: number, y: number]

/** The picture is a square this many units a side. */
export const MAP_SIZE = ${SIZE}

/** The four pins, in % of the map: on their real spots, the three in the south nudged apart so none covers another. */
export const PINS = {
${Object.entries(PINS).map(([id, p]) => `  ${/^\w+$/.test(id) ? id : `'${id}'`}: ${pct(p)},`).join('\n')}
} as const

/** Peru's outline, in map units. */
// prettier-ignore
export const PERU: Pt[] = ${pts(PERU)}
/** Everything on the ocean's side of the foothills: inside the outline, that is the desert coast. */
// prettier-ignore
export const COAST_SIDE: Pt[] = ${pts(oceanRing(sparse(FOOTHILLS)))}
/** Everything on the ocean's side of the treeline: inside the outline and past the coast, that is the Andes (the rest is rainforest). */
// prettier-ignore
export const ANDES_SIDE: Pt[] = ${pts(oceanRing(sparse(TREELINE)))}

/** Where each world's surprise happens, in map units: a wave off the coast, a glint on the biggest snowcap, a dolphin in the Amazon. */
export const SURPRISES = { wave: ${xy(SURPRISES.wave)}, glint: ${xy(SURPRISES.glint)}, splash: ${xy(SURPRISES.splash)} } as const
`
  await writeFile(LAND, land)
}

console.log(`${path.relative(root, OUT)}: ${(svg.length / 1024).toFixed(1)} KB, ${peaks.length} peaks, ${trees.length} trees, ${coast.length} on the coast`)
console.log('pins (% of the map):', Object.entries(PINS).map(([id, p]) => `${id} ${pct(p)}`).join(', '))
console.log('surprises:', Object.entries(SURPRISES).map(([id, p]) => `${id} ${xy(p)}`).join(', '))
