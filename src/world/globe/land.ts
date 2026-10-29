// The continents as raised slabs on the globe, like a toy planet's pressed-clay plates: each outline is rounded,
// triangulated flat (in a projection centered on the landmass, so even Antarctica's ring round the pole works), cut into
// small triangles that follow the sphere, lifted to its height, and given a wall down into the sea. The top reads the
// painted map (paint.ts) through lon/lat UVs; the walls are the same color a shade darker.
import { BufferAttribute, BufferGeometry, ShapeUtils, Vector2, Vector3 } from 'three'
import { smoothOutline, type Landmass, type Pt } from './continents'

const DEG = Math.PI / 180

/** A unit vector at latitude/longitude (degrees), the same mapping as three's SphereGeometry UVs, so the painted
 *  ocean, the land and everything stood on it agree. */
export function unitAt(lat: number, lon: number, out = new Vector3()) {
  const phi = (lon + 180) * DEG
  const th = lat * DEG
  return out.set(-Math.cos(phi) * Math.cos(th), Math.sin(th), Math.sin(phi) * Math.cos(th))
}

/** Latitude and longitude (degrees) of a direction from the center. */
export function latLonOf(v: Vector3) {
  const n = v.clone().normalize()
  const lat = Math.asin(Math.max(-1, Math.min(1, n.y))) / DEG
  let lon = Math.atan2(n.z, -n.x) / DEG - 180
  if (lon < -180) lon += 360
  return { lat, lon }
}

/** Longest edge (chord on the unit sphere) a top triangle may keep: short enough that the flat triangles hug the curve. */
const MAX_EDGE = 0.06
/** How far below the sea the walls go (hidden under the water). */
const FOOT = 0.012
/** The walls' shade (multiplies the painted color): a little darker and lavender, like the toon's shadow side. */
const WALL = [0.8, 0.76, 0.9]

/** The slab (`geometry`) and its walls alone (`walls`): the ink outline is drawn from the walls, since a hull of
 *  the top's long thin triangles can flip and streak lines across the land. */
export function landGeometry(m: Landmass): { geometry: BufferGeometry; walls: BufferGeometry } {
  const pts: Pt[] = smoothOutline(m.outline, 2)
  const verts: Vector3[] = pts.map(([lon, lat]) => unitAt(lat, lon))

  // ---- Triangulate in an azimuthal projection centered on the landmass.
  const c = verts.reduce((s, v) => s.add(v), new Vector3()).normalize()
  if (c.lengthSq() < 0.5) c.set(0, -1, 0)
  const any = Math.abs(c.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
  const e1 = new Vector3().crossVectors(c, any).normalize()
  const e2 = new Vector3().crossVectors(c, e1)
  const flat = verts.map((v) => {
    const d = v.dot(c)
    const t = v.clone().addScaledVector(c, -d)
    const len = t.length() || 1
    const a = Math.acos(Math.max(-1, Math.min(1, d)))
    return new Vector2((t.dot(e1) / len) * a, (t.dot(e2) / len) * a)
  })
  let tris: [number, number, number][] = ShapeUtils.triangulateShape(flat, []).map(([a, b, cc]) => [a, b, cc])

  // ---- Refine: split every edge longer than MAX_EDGE (a decision that depends on the edge alone, so neighbours agree
  // and no cracks open), until none are left.
  const mids = new Map<number, number>()
  const mid = (a: number, b: number) => {
    const k = a < b ? a * 1e6 + b : b * 1e6 + a
    let i = mids.get(k)
    if (i === undefined) {
      i = verts.push(verts[a].clone().add(verts[b]).normalize()) - 1
      mids.set(k, i)
    }
    return i
  }
  const long = (a: number, b: number) => verts[a].distanceTo(verts[b]) > MAX_EDGE
  for (let pass = 0; pass < 12; pass++) {
    let changed = false
    const next: [number, number, number][] = []
    for (const t of tris) {
      const l = [long(t[0], t[1]), long(t[1], t[2]), long(t[2], t[0])]
      const n = l.filter(Boolean).length
      if (n === 0) {
        next.push(t)
        continue
      }
      changed = true
      // Turn the triangle so the pattern starts at edge 0 (same winding).
      let r = 0
      if (n === 1) r = l.indexOf(true)
      else if (n === 2) r = (l.indexOf(false) + 1) % 3
      const [a, b, cc] = [t[r], t[(r + 1) % 3], t[(r + 2) % 3]]
      if (n === 3) {
        const ab = mid(a, b)
        const bc = mid(b, cc)
        const ca = mid(cc, a)
        next.push([a, ab, ca], [ab, b, bc], [ca, bc, cc], [ab, bc, ca])
      } else if (n === 1) {
        const ab = mid(a, b)
        next.push([a, ab, cc], [ab, b, cc])
      } else {
        // Edges ab and bc are long, ca isn't.
        const ab = mid(a, b)
        const bc = mid(b, cc)
        next.push([ab, b, bc], [a, ab, bc], [a, bc, cc])
      }
    }
    tris = next
    if (!changed) break
  }

  // Every triangle faces out of the globe.
  const tmp = new Vector3()
  const tmp2 = new Vector3()
  for (const t of tris) {
    tmp.subVectors(verts[t[1]], verts[t[0]]).cross(tmp2.subVectors(verts[t[2]], verts[t[0]]))
    if (tmp.dot(verts[t[0]]) < 0) [t[1], t[2]] = [t[2], t[1]]
  }

  // ---- The rim: edges used by one triangle only, kept with the winding of their triangle (land on the left).
  const edges = new Map<number, { a: number; b: number; n: number }>()
  for (const t of tris) {
    for (let i = 0; i < 3; i++) {
      const a = t[i]
      const b = t[(i + 1) % 3]
      const k = a < b ? a * 1e6 + b : b * 1e6 + a
      const e = edges.get(k)
      if (e) e.n++
      else edges.set(k, { a, b, n: 1 })
    }
  }
  const rim = [...edges.values()].filter((e) => e.n === 1)

  const top = 1 + m.height
  const foot = 1 - FOOT
  const pos: number[] = []
  const nrm: number[] = []
  const uv: number[] = []
  const col: number[] = []
  const uvOf = (v: Vector3) => {
    const { lat, lon } = latLonOf(v)
    return [(lon + 180) / 360, (lat + 90) / 180]
  }
  const uvs = verts.map(uvOf)
  for (const t of tris) {
    // A triangle across the date line would smear the whole map between its corners: give it one side's u.
    const us = t.map((i) => uvs[i][0])
    const wrap = Math.max(...us) - Math.min(...us) > 0.5
    for (const i of t) {
      const v = verts[i]
      pos.push(v.x * top, v.y * top, v.z * top)
      nrm.push(v.x, v.y, v.z)
      const u = wrap && uvs[i][0] < 0.5 ? uvs[i][0] + 1 : uvs[i][0]
      uv.push(u, uvs[i][1])
      col.push(1, 1, 1)
    }
  }
  const n = new Vector3()
  const wallFrom = pos.length / 3
  for (const { a, b } of rim) {
    const va = verts[a]
    const vb = verts[b]
    const at = va.clone().multiplyScalar(top)
    const bt = vb.clone().multiplyScalar(top)
    const af = va.clone().multiplyScalar(foot)
    const bf = vb.clone().multiplyScalar(foot)
    // Facing out of the land: to the right of a→b seen from outside.
    n.subVectors(vb, va).cross(va).normalize()
    // Wound so the wall faces that way too.
    tmp.subVectors(bt, at).cross(tmp2.subVectors(af, at))
    const out = tmp.dot(n) > 0
    const quad = out ? [at, bt, af, bt, bf, af] : [at, af, bt, bt, af, bf]
    const quv = out ? [uvs[a], uvs[b], uvs[a], uvs[b], uvs[b], uvs[a]] : [uvs[a], uvs[a], uvs[b], uvs[b], uvs[a], uvs[b]]
    for (let i = 0; i < 6; i++) {
      pos.push(quad[i].x, quad[i].y, quad[i].z)
      nrm.push(n.x, n.y, n.z)
      uv.push(quv[i][0], quv[i][1])
      col.push(WALL[0], WALL[1], WALL[2])
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nrm), 3))
  g.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
  g.computeBoundingSphere()
  const walls = new BufferGeometry()
  walls.setAttribute('position', new BufferAttribute(new Float32Array(pos.slice(wallFrom * 3)), 3))
  return { geometry: g, walls }
}

/** A seeded random, so the trees grow in the same places every time. */
export function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}
