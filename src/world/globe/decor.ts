// The globe's scenery: trees and mountains on the land (one instanced shape per kind and continent, each with an
// instanced ink outline), puffy clouds over the sea, a whale, and Sparkle's hot-air balloon. Sizes in globe units
// (the Earth is 1) unless a builder says centimeters.
import { Group, InstancedMesh, LatheGeometry, Matrix4, Object3D, Quaternion, Vector2, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../engine3d/dispose'
import { bake, merge, P, solid } from '../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial } from '../engine3d/outline'
import { PAL, toon } from '../engine3d/toon'
import { inside, LANDMASSES, NORTH_POLE, SPOTS, type ContinentKey, type Pt } from './continents'
import { rng, unitAt } from './land'
import { faceted, palm, rod, roundTree } from './toys'

const UP = new Vector3(0, 1, 0)
const tq = new Quaternion()

/** Puts `o` on the globe at (lat, lon), `r` from the center, standing up (+y out), +z toward the south. */
export function standAt(o: Object3D, lat: number, lon: number, r: number, turn = 0) {
  const up = unitAt(lat, lon)
  o.position.copy(up).multiplyScalar(r)
  o.quaternion.copy(frame(up))
  if (turn) o.quaternion.multiply(tq.setFromAxisAngle(UP, turn))
}

/** The turn that takes +y to `up` and +z to the south there (+x east). */
export function frame(up: Vector3, out = new Quaternion()) {
  const east = new Vector3().crossVectors(UP, up)
  if (east.lengthSq() < 1e-6) east.set(1, 0, 0)
  east.normalize()
  const south = new Vector3().crossVectors(east, up).normalize()
  return out.setFromRotationMatrix(new Matrix4().makeBasis(east, up, south))
}

// ---------------------------------------------------------------- trees and mountains

type Kind = 'pine' | 'round' | 'palm' | 'acacia' | 'peak' | 'bigPeak' | 'icePeak'

/** One tree or mountain shape, 1 unit tall, standing on its base. */
function shape(kind: Kind, land: string): BufferGeometry {
  switch (kind) {
    case 'pine':
      return merge([P.cyl(0.06, 0.08, 0.3, '#B98260', { at: [0, 0.15, 0] }, 6), P.cone(0.32, 0.5, '#3FAF8A', { at: [0, 0.45, 0] }, 7), P.cone(0.24, 0.4, '#4FC497', { at: [0, 0.72, 0] }, 7)])
    case 'round':
      return merge(roundTree([0, 0, 0], 1, '#6DD3A8', 9))
    case 'palm':
      return merge(palm([0, 0, 0], 1, 0.6, 5))
    case 'acacia':
      return merge([rod([0, 0, 0], [0.05, 0.6, 0], 0.05, '#B98260', 5), P.sphere(0.38, '#86CF78', { at: [0.05, 0.68, 0], scale: [1.4, 0.38, 1.2] }, 10)])
    case 'peak':
    case 'bigPeak': {
      const body = tintHex(land, -0.1)
      return merge([faceted(P.cone(0.62, 1, body, { at: [0, 0.5, 0] }, 6), 0.14), faceted(P.cone(0.26, 0.42, '#FFFFFF', { at: [0, 0.8, 0] }, 6), 0.1)])
    }
    case 'icePeak':
      return merge([faceted(P.cone(0.6, 1, '#E7EEFF', { at: [0, 0.5, 0] }, 5)), faceted(P.cone(0.24, 0.4, '#FFFFFF', { at: [0, 0.8, 0] }, 5))])
  }
}

function tintHex(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const to = k > 0 ? [255, 255, 255] : [110, 70, 130]
  const a = Math.abs(k)
  return `#${c.map((v, i) => Math.round(v + (to[i] - v) * a).toString(16).padStart(2, '0')).join('')}`
}

interface Placed {
  kind: Kind
  lat: number
  lon: number
  size: number
}

/** Mountain ranges: from, to, how many peaks, how big. */
const RANGES: { continent: ContinentKey; from: Pt; to: Pt; n: number; size: number; kind?: Kind }[] = [
  { continent: 'northAmerica', from: [-128, 60], to: [-108, 38], n: 7, size: 0.075 },
  { continent: 'southAmerica', from: [-77, 4], to: [-71, -46], n: 8, size: 0.075 },
  { continent: 'europe', from: [6, 46], to: [14, 47], n: 3, size: 0.05 },
  { continent: 'asia', from: [74, 35], to: [96, 28], n: 6, size: 0.095, kind: 'bigPeak' },
  { continent: 'asia', from: [59, 52], to: [60, 64], n: 3, size: 0.045 },
  { continent: 'africa', from: [-6, 31.5], to: [6, 35], n: 2, size: 0.045 },
  { continent: 'africa', from: [37, -3], to: [37, -3], n: 1, size: 0.07 },
  { continent: 'australia', from: [148, -21], to: [149, -36], n: 3, size: 0.04 },
  { continent: 'antarctica', from: [-180, -80], to: [170, -80], n: 14, size: 0.06, kind: 'icePeak' },
]

/** No scenery this close to a landmark (degrees). */
const CLEAR = 7.5

function nearSpot(lat: number, lon: number, clear = CLEAR) {
  const v = unitAt(lat, lon)
  for (const s of [...Object.values(SPOTS), NORTH_POLE]) if (v.angleTo(unitAt(s.lat, s.lon)) < (clear * Math.PI) / 180) return true
  return false
}

/** Deserts grow nothing (or a few palms). */
function desert(c: ContinentKey, lon: number, lat: number) {
  if (c === 'africa') return lat > 14 && lat < 31
  if (c === 'australia') return lat > -32 && lat < -18 && lon > 118 && lon < 145
  return false
}

function treeKind(c: ContinentKey, lat: number, r: () => number): Kind {
  if (Math.abs(lat) > 47) return 'pine'
  if (c === 'africa') return lat < 12 && lat > -20 ? (r() < 0.7 ? 'acacia' : 'palm') : 'round'
  if (Math.abs(lat) < 17) return r() < 0.55 ? 'palm' : 'round'
  if (c === 'northAmerica' && lat > 40) return r() < 0.5 ? 'pine' : 'round'
  return 'round'
}

/** Where every tree and peak goes, by continent. */
function scatter(): Map<ContinentKey, Placed[]> {
  const out = new Map<ContinentKey, Placed[]>()
  const add = (c: ContinentKey, p: Placed) => {
    if (!out.has(c)) out.set(c, [])
    out.get(c)!.push(p)
  }
  const r = rng(23)
  for (const m of LANDMASSES) {
    if (!m.trees) continue
    const lons = m.outline.map((p) => p[0])
    const lats = m.outline.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats)]
    const area = (x1 - x0) * (y1 - y0)
    const want = Math.round(area / 150)
    let placed = 0
    for (let tries = 0; tries < want * 6 && placed < want; tries++) {
      const lon = x0 + r() * (x1 - x0)
      const lat = y0 + r() * (y1 - y0)
      if (lat > 70 || !inside(m.outline, lon, lat) || nearSpot(lat, lon)) continue
      // Not right on the coast (the slab's edge).
      if (!inside(m.outline, lon + 1.8, lat) || !inside(m.outline, lon - 1.8, lat) || !inside(m.outline, lon, lat + 1.6) || !inside(m.outline, lon, lat - 1.6)) continue
      if (desert(m.continent, lon, lat) && r() > 0.12) continue
      const continent = m.continent === 'asia' && lon < 45 && lat > 36 ? 'europe' : m.continent
      add(continent, { kind: treeKind(continent, lat, r), lat, lon, size: 0.046 + r() * 0.024 })
      placed++
    }
  }
  for (const range of RANGES) {
    for (let i = 0; i < range.n; i++) {
      const f = range.n === 1 ? 0 : i / (range.n - 1)
      const lon = range.from[0] + (range.to[0] - range.from[0]) * f + (r() - 0.5) * 3
      const lat = range.from[1] + (range.to[1] - range.from[1]) * f + (r() - 0.5) * 3
      if (nearSpot(lat, lon, range.continent === 'antarctica' ? 9 : 5)) continue
      add(range.continent, { kind: range.kind ?? 'peak', lat, lon, size: range.size * (0.75 + r() * 0.5) })
    }
  }
  return out
}

const LAND_OF: Record<ContinentKey, string> = {
  northAmerica: '#8FE3C8',
  southAmerica: '#FFC2A8',
  europe: '#C9B6F5',
  asia: '#FF9EC4',
  africa: '#FBEA9A',
  australia: '#FFB98A',
  antarctica: '#FFFFFF',
}

/** The trees and mountains of one continent, to put in its group (so they bounce with it). */
export function scenery(bag: Bag, top: (c: ContinentKey) => number): Map<ContinentKey, Group> {
  const groups = new Map<ContinentKey, Group>()
  const dummy = new Object3D()
  for (const [c, list] of scatter()) {
    const g = new Group()
    const kinds = new Map<Kind, Placed[]>()
    for (const p of list) {
      if (!kinds.has(p.kind)) kinds.set(p.kind, [])
      kinds.get(p.kind)!.push(p)
    }
    for (const [kind, ps] of kinds) {
      const geo = bag.add(shape(kind, LAND_OF[c]))
      const hull = bag.add(hullGeometry(geo))
      const mesh = new InstancedMesh(geo, toon('#ffffff', true), ps.length)
      const line = new InstancedMesh(hull, instancedOutlineMaterial(kind === 'peak' || kind === 'bigPeak' || kind === 'icePeak' ? 2 : 1.5), ps.length)
      const r = rng(ps.length * 7 + kind.length)
      ps.forEach((p, i) => {
        standAt(dummy, p.lat, p.lon, top(c) - 0.002, r() * Math.PI * 2)
        dummy.scale.setScalar(p.size)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        line.setMatrixAt(i, dummy.matrix)
      })
      mesh.frustumCulled = line.frustumCulled = false
      g.add(mesh, line)
    }
    groups.set(c, g)
  }
  return groups
}

// ---------------------------------------------------------------- clouds

/** Over the sea, away from the landmarks: [lat, lon, size]. */
export const CLOUDS: [number, number, number][] = [
  [12, -150, 1.1], [-22, -122, 1], [36, -165, 0.85], [24, -42, 1], [-14, -18, 0.9], [-24, 72, 1.1], [6, 62, 0.8],
  [-52, 105, 1], [-48, -142, 0.9], [44, 172, 0.95], [-36, 162, 0.85], [52, -32, 0.9], [-4, -100, 0.8], [-42, 20, 0.85],
]

export function cloud(bag: Bag, seed: number) {
  const r = rng(seed * 13 + 5)
  const parts: BufferGeometry[] = []
  const n = 3 + Math.floor(r() * 3)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1) - 0.5) * 1.6
    const s = 0.42 + (1 - Math.abs(x) / 0.8) * 0.28 + r() * 0.1
    parts.push(P.sphere(s, '#FFFFFF', { at: [x, s * 0.45, (r() - 0.5) * 0.3] }, 11))
  }
  parts.push(P.sphere(0.5, '#F4F0FF', { at: [0, 0.1, 0], scale: [2.1, 0.55, 1] }, 11))
  return solid(merge(parts), bag, 1.5)
}

// ---------------------------------------------------------------- the sea's little things

/** Little islands out in the sea, so the Pacific isn't empty: [lat, lon, how big]. */
export const ISLANDS: [number, number, number][] = [[20, -157, 1.1], [-17, -150, 0.9], [-17.5, 178, 1], [-0.5, -91, 0.8], [-8, 72, 0.7], [-21, 56, 0.75]]

/** A sandy island with a palm tree (cm). */
export function island(bag: Bag, seed: number) {
  const r = rng(seed * 31 + 3)
  const parts: BufferGeometry[] = [P.sphere(5, '#FFE7B0', { at: [0, -1.8, 0], scale: [1, 0.55, 0.8] }, 14), P.sphere(2.6, '#A8E6A0', { at: [0.6, 0.2, -0.4], scale: [1, 0.4, 0.8] }, 10)]
  parts.push(...palm([0.6, 0.6, -0.4], 6 + r() * 2, r() * 6, 6))
  if (r() < 0.6) parts.push(...palm([-2.2, 0.2, 1.1], 4.4, r() * 6, 6))
  return solid(merge(parts), bag, 2)
}

/** A little sailboat with a pink stripe and a heart on its sail (cm). */
export function sailboat(bag: Bag) {
  const outlined: BufferGeometry[] = [
    P.prism([[-4, 1.2], [4, 1.2], [2.8, -1], [-3, -1]], 2.6, '#FFFFFF', {}),
    P.box(7.6, 0.45, 2.7, PAL.hotpink, { at: [0, 0.9, 0] }),
    rod([0, 1, 0], [0, 9, 0], 0.22, '#C98B62', 6),
    P.prism([[0.3, 1.8], [0.3, 8.6], [5, 1.8]], 0.25, PAL.cream, {}),
    P.prism([[-0.3, 2.6], [-0.3, 7.6], [-3.6, 2.6]], 0.25, PAL.lavender, {}),
    P.prism([[0, 9], [0, 10.2], [1.8, 9.6]], 0.15, PAL.pink, {}),
  ]
  const g = new Group()
  g.add(solid(merge(outlined), bag, 2))
  return g
}

// ---------------------------------------------------------------- the whale

/** A happy blue whale, half in the water (cm: about 10 long). */
export function whale(bag: Bag) {
  const blue = '#7FA8F0'
  const outlined: BufferGeometry[] = [
    P.sphere(4, blue, { at: [0, 0, 0], scale: [1.35, 0.72, 0.85] }, 18),
    P.sphere(1.6, blue, { at: [-6.4, 0.9, 0], scale: [1, 0.5, 0.6] }, 10),
    P.sphere(1.3, blue, { at: [-7.6, 1.8, 1.3], scale: [1.1, 0.3, 0.8], rot: [0.5, 0, 0] }, 10),
    P.sphere(1.3, blue, { at: [-7.6, 1.8, -1.3], scale: [1.1, 0.3, 0.8], rot: [-0.5, 0, 0] }, 10),
    P.sphere(1.1, blue, { at: [1.5, 0.2, 3.1], scale: [1.4, 0.35, 0.7], rot: [0.5, 0.4, 0] }, 10),
  ]
  const plain: BufferGeometry[] = [
    P.sphere(3.3, '#DCE8FF', { at: [1, -0.9, 0], scale: [1.3, 0.5, 0.8] }, 14),
    P.sphere(0.42, PAL.ink, { at: [3.6, 0.9, 2.6] }, 8),
    P.sphere(0.42, PAL.ink, { at: [3.6, 0.9, -2.6] }, 8),
    P.sphere(0.5, '#FF9DB8', { at: [4.3, 0.1, 2.3], scale: [1, 0.55, 0.4] }, 8),
    P.sphere(0.5, '#FF9DB8', { at: [4.3, 0.1, -2.3], scale: [1, 0.55, 0.4] }, 8),
  ]
  const g = new Group()
  g.add(solid(merge(outlined), bag, 2), solid(merge(plain), bag, 0))
  return g
}

// ---------------------------------------------------------------- Sparkle's balloon

/** Sparkle's hot-air balloon (cm: ~30 tall, its basket at the bottom, centered on the envelope): pink and lavender
 *  stripes, a gold star on both sides, a little basket on ropes. */
export function balloon(bag: Bag) {
  const profile = [
    [0.22, -1.18], [0.42, -1.02], [0.72, -0.68], [0.95, -0.22], [1.0, 0.12], [0.94, 0.5], [0.74, 0.82], [0.42, 1.02], [0.001, 1.08],
  ].map(([x, y]) => new Vector2(x * 9, y * 9))
  const parts: BufferGeometry[] = []
  const gores = 12
  for (let i = 0; i < gores; i++) parts.push(bake(new LatheGeometry(profile, 3, (i / gores) * Math.PI * 2, (Math.PI * 2) / gores), i % 2 ? PAL.lavender : PAL.pink))
  parts.push(P.cyl(2.2, 2.4, 1.2, PAL.hotpink, { at: [0, -10.4, 0] }, 14))
  const star = (z: number, turn: number) => {
    const pts: [number, number][] = []
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 1.5 : 3.2
      const a = (Math.PI * i) / 5 + Math.PI / 2
      pts.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    return P.prism(pts, 0.8, PAL.gold, { at: [0, 0.6, z], rot: [0, turn, 0] })
  }
  parts.push(star(8.7, 0), star(-8.7, Math.PI))
  const basket: BufferGeometry[] = [P.rbox(4.6, 3.4, 4.6, 0.7, '#E2A574', { at: [0, -17.2, 0] }), P.rbox(5.2, 0.9, 5.2, 0.45, '#C9875C', { at: [0, -15.6, 0] })]
  for (const [x, z] of [[-1.9, -1.9], [1.9, -1.9], [-1.9, 1.9], [1.9, 1.9]] as const) basket.push(rod([x, -15.4, z], [x * 1.15, -10.6, z * 1.15], 0.16, '#9A7466', 5))
  const g = new Group()
  g.add(solid(merge(parts), bag, 2.5), solid(merge(basket), bag, 2))
  return g
}
