// The mushrooms, the bags they grow from and the basket, modeled in code in the house's toon look (engine/geo.ts parts).
// An oyster mushroom is a fan: a flat round cap like a little shelf with a ruffled edge (darker in the middle, paler at
// the rim), pale gills under it, on a short stem. A bag's clump is seven of them fanning out of its mouth in layers
// (each clump one toy shape that grows as a whole); in the basket and on the pizza a mushroom is a single fan. Each
// color's shapes are built once and shared by every clump of that color. A bag is a plump sack of sawdust lying on the
// rack, gathered into a neck with a plastic collar round its mouth.
import { Color, Euler, Group, Mesh, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, merge, P, solid, type PartOpts, type V3 } from '../../../engine/geo'
import { makeHull } from '../../../engine/outline'
import { toon } from '../../../engine/toon'
import { BAG_LEN, BAG_R, BASKET_R, type BagKind, type ShroomColor } from './layout'

export const SHROOM: Record<ShroomColor, { cap: string; mid: string; gill: string; stem: string }> = {
  grey: { cap: '#C9C3DD', mid: '#968FB2', gill: '#F1EDF8', stem: '#F7F3FB' },
  pink: { cap: '#FFA8C8', mid: '#F0609A', gill: '#FFDCE9', stem: '#FFEFF5' },
  gold: { cap: '#FFD772', mid: '#F2A81C', gill: '#FFF2C2', stem: '#FFF8E2' },
}
export const COLLAR: Record<BagKind, string> = { plain: '#F7F4EE', pink: '#FF4F9A', gold: '#FFB21F' }
export const SAWDUST = '#E9D4AE'
const SAWDUST_DARK = '#CDB083'
export const BASKET_WOOD = '#C9965E'

const ca = new Color()
const cb = new Color()
/** A ruffled cap: a flattened sphere whose rim waves up and down (`frills` waves round it), colored from `mid` at the
 *  middle to `rim` at the edge. */
function frilly(r: number, rim: string, mid: string, o: PartOpts, frills = 7, amp = 0.32, seed = 0): BufferGeometry {
  const g = new SphereGeometry(r, 20, 12)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const rho = Math.min(1, Math.hypot(x, z) / r)
    const th = Math.atan2(z, x)
    const wave = Math.sin(th * frills + seed) + 0.4 * Math.sin(th * (frills * 2 + 1) + seed * 2)
    pos.setY(i, y + wave * amp * r * rho ** 3)
    const k = 1 + 0.06 * Math.sin(th * frills + seed + 1) * rho
    pos.setX(i, x * k)
    pos.setZ(i, z * k)
  }
  g.computeVertexNormals()
  const out = bake(g, rim, o)
  // The middle darker than the rim (bake painted it all `rim`).
  const col = out.getAttribute('color')
  const p2 = out.getAttribute('position')
  ca.set(mid)
  cb.set(rim)
  const c = new Vector3(...(o.at ?? [0, 0, 0]))
  const reach = r * Math.max(...(o.scale ?? [1, 1, 1]))
  for (let i = 0; i < col.count; i++) {
    const d = Math.min(1, Math.hypot(p2.getX(i) - c.x, p2.getY(i) - c.y, p2.getZ(i) - c.z) / reach)
    const k = Math.min(1, Math.max(0, (d - 0.15) / 0.6))
    col.setXYZ(i, ca.r + (cb.r - ca.r) * k, ca.g + (cb.g - ca.g) * k, ca.b + (cb.b - ca.b) * k)
  }
  return out
}

const UP = new Vector3(0, 1, 0)
const tmp = new Vector3()

/** One fan: its stem from `from` out along `dir` (`len` long), the cap at the end, tipped a little toward `dir`. */
function fan(c: ShroomColor, from: V3, dir: V3, len: number, s: number): BufferGeometry[] {
  const col = SHROOM[c]
  const d = tmp.set(...dir).normalize().clone()
  const end = new Vector3(...from).addScaledVector(d, len)
  const mid = new Vector3(...from).addScaledVector(d, len / 2)
  const stemRot = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, d))
  const yaw = Math.atan2(d.x, d.z)
  const tilt = -Math.asin(Math.max(-1, Math.min(1, d.y))) * 0.5
  const capRot: V3 = [tilt, yaw, 0]
  const at: V3 = [end.x, end.y, end.z]
  return [
    P.cyl(0.016 * s, 0.02 * s, len, col.stem, { at: [mid.x, mid.y, mid.z], rot: [stemRot.x, stemRot.y, stemRot.z] }, 8),
    frilly(0.074 * s, col.cap, col.mid, { at, rot: capRot, scale: [1.2, 0.34, 0.95] }, 7, 0.3, from[0] * 40 + len * 90),
    frilly(0.068 * s, col.gill, col.gill, { at: [at[0], at[1] - 0.012 * s, at[2]], rot: capRot, scale: [1.12, 0.22, 0.88] }, 7, 0.3, from[0] * 40 + len * 90),
  ]
}

/** A bag's clump, coming out of its mouth (the origin) toward +z, as one shape: shelves of fans in layers, the big
 *  ones on top. */
function clumpGeo(c: ShroomColor) {
  return merge([
    ...fan(c, [0, 0.01, 0], [0, 0.6, 1], 0.09, 1.3),
    ...fan(c, [-0.02, 0, 0], [-0.8, 0.25, 0.7], 0.075, 1.08),
    ...fan(c, [0.02, 0, 0], [0.85, 0.15, 0.65], 0.08, 1.14),
    ...fan(c, [0, -0.02, 0], [0.1, -0.6, 0.8], 0.06, 0.9),
    ...fan(c, [-0.01, 0.0, 0.01], [-0.3, -0.2, 1], 0.1, 0.66),
    ...fan(c, [0.015, 0.01, 0.01], [0.45, 0.45, 1], 0.11, 0.72),
    ...fan(c, [-0.015, -0.01, 0.01], [-0.6, -0.45, 0.8], 0.07, 0.7),
  ])
}

/** A single fan, its cap's middle at the origin, lying flat (for the basket and the pizza). */
function oneGeo(c: ShroomColor) {
  const col = SHROOM[c]
  return merge([
    frilly(0.07, col.cap, col.mid, { at: [0, 0.012, 0], scale: [1.2, 0.36, 0.95] }, 7, 0.3, 1),
    frilly(0.064, col.gill, col.gill, { at: [0, 0, 0], scale: [1.1, 0.22, 0.86] }, 7, 0.3, 1),
    P.cyl(0.018, 0.022, 0.04, col.stem, { at: [0, -0.02, -0.035], rot: [-1.2, 0, 0] }, 8),
  ])
}

/** Builds each shape once per color and hands out toy copies (one mesh and one outline each, sharing the geometry). */
export class ShroomKit {
  private shapes = new Map<string, { geo: BufferGeometry; hull: Mesh }>()
  constructor(private bag: Bag) {}

  private get(key: string, build: () => BufferGeometry) {
    let s = this.shapes.get(key)
    if (!s) {
      const geo = this.bag.add(build())
      const hull = makeHull(geo, 2)
      this.bag.add(hull.geometry)
      s = { geo, hull }
      this.shapes.set(key, s)
    }
    const g = new Group()
    g.add(new Mesh(s.geo, toon('#ffffff', true)))
    g.add(new Mesh(s.hull.geometry, s.hull.material))
    return g
  }
  /** A bag's clump of fans. */
  clump(c: ShroomColor) {
    return this.get(`clump:${c}`, () => clumpGeo(c))
  }
  /** One mushroom (the basket, the pizza). */
  one(c: ShroomColor) {
    return this.get(`one:${c}`, () => oneGeo(c))
  }
}

/** The rack's bags lying down, mouths toward +z at z = 0 (one shape, for the whole rack: pass the mouths). Each is a
 *  plump sack (rounder at its bottom end), flecks of sawdust showing through, gathered into a neck at its mouth. */
export function bagsGeo(mouths: V3[]): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  mouths.forEach(([x, y, z], i) => {
    const body = z - 0.08 - BAG_LEN / 2
    const sag = 0.94 + 0.05 * Math.sin(i * 2.7)
    // The sack: a fat capsule lying down, a little squashed by its own weight.
    parts.push(P.capsule(BAG_R * 0.98, BAG_LEN - BAG_R * 1.6, SAWDUST, { at: [x, y - 0.006, body], rot: [Math.PI / 2, 0, 0], scale: [1.04, sag, 1] }))
    // The shoulder going into the neck.
    parts.push(P.cyl(0.07, BAG_R * 0.9, 0.08, SAWDUST, { at: [x, y, z - 0.07], rot: [Math.PI / 2, 0, 0] }, 16))
    // Flecks of darker sawdust through the plastic.
    for (let k = 0; k < 4; k++) {
      const a = i * 1.9 + k * 1.7
      parts.push(P.sphere(0.016, SAWDUST_DARK, { at: [x + Math.cos(a) * BAG_R * 0.8, y + Math.sin(a) * BAG_R * 0.8, body + ((k % 3) - 1) * 0.1], scale: [1, 1, 1.6] }, 6))
    }
    // The neck, and the dark sawdust showing in its mouth.
    parts.push(P.cyl(0.062, 0.07, 0.05, '#F1E2C6', { at: [x, y, z - 0.02], rot: [Math.PI / 2, 0, 0] }, 16))
    parts.push(P.cyl(0.052, 0.052, 0.012, '#9B7653', { at: [x, y, z + 0.004], rot: [Math.PI / 2, 0, 0] }, 14))
  })
  return parts
}

/** A bag's collar ring at its mouth (its own toy, so round 3's new bags can show pink or gold ones). */
export function collar(kind: BagKind, bag: Bag) {
  return solid(P.torus(0.066, 0.026, COLLAR[kind], {}), bag, 1)
}

/** A woven basket with a handle, its rim at y = h (local), and where things heap inside it. */
export function buildBasket(bag: Bag, r = BASKET_R, h = 0.2) {
  const parts = [
    P.cyl(r, r * 0.8, h, BASKET_WOOD, { at: [0, h / 2, 0] }, 20),
    // The weave: darker bands round it.
    ...[0.3, 0.6].map((k) => P.cyl(r * (0.8 + 0.2 * k) + 0.004, r * (0.8 + 0.2 * k) + 0.004, 0.022, '#A8763F', { at: [0, h * k, 0] }, 20)),
    P.torus(r, 0.022, '#A8763F', { at: [0, h, 0], rot: [Math.PI / 2, 0, 0] }),
    // Inside: shadowy, so it reads as a basket, not a drum.
    P.cyl(r * 0.9, r * 0.9, 0.006, '#7A5236', { at: [0, h + 0.002, 0] }, 20),
    P.torus(r * 0.85, 0.018, '#A8763F', { at: [0, h, 0], rot: [0, 0, 0] }, Math.PI),
  ]
  const g = solid(merge(parts), bag, 2)
  return { root: g, rim: h, r }
}

/** Where the n-th thing heaps on a basket of radius r (a heap on top of its dark middle): a ring at the rim, then a smaller ring on top, then a peak. */
export function heapSpot(n: number, r: number, rim: number): Vector3 {
  const rings = [
    { k: 7, rr: r * 0.55, y: rim + 0.012 },
    { k: 5, rr: r * 0.32, y: rim + 0.04 },
    { k: 3, rr: r * 0.14, y: rim + 0.068 },
    { k: 99, rr: r * 0.2, y: rim + 0.09 },
  ]
  let i = n
  for (const ring of rings) {
    if (i < ring.k) {
      const a = (i / Math.min(ring.k, 8)) * Math.PI * 2 + ring.y * 9
      return new Vector3(Math.cos(a) * ring.rr, ring.y + (ring.k === 99 ? i * 0.02 : 0), Math.sin(a) * ring.rr)
    }
    i -= ring.k
  }
  return new Vector3(0, rim, 0)
}
