// The mushrooms, the bags they grow from and the basket, modeled in code in the house's toon look (engine/geo.ts parts).
// An oyster mushroom is a fan: a flat round cap like a little shelf, pale gills under it, on a short stem. A bag's
// clump is five of them fanning out of its mouth (each clump one toy shape that grows as a whole); in the basket and on
// the pizza a mushroom is a single fan. Each color's shapes are built once and shared by every clump of that color.
import { Euler, Group, Mesh, Quaternion, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid, type V3 } from '../../../engine/geo'
import { makeHull } from '../../../engine/outline'
import { toon } from '../../../engine/toon'
import { BAG_LEN, BAG_R, BASKET_R, type BagKind, type ShroomColor } from './layout'

export const SHROOM: Record<ShroomColor, { cap: string; gill: string; stem: string }> = {
  grey: { cap: '#B6B0CB', gill: '#EEEAF6', stem: '#F6F2FA' },
  pink: { cap: '#FF8FB8', gill: '#FFD6E6', stem: '#FFEDF4' },
  gold: { cap: '#FFC43D', gill: '#FFF0B8', stem: '#FFF7DE' },
}
export const COLLAR: Record<BagKind, string> = { plain: '#F4F0E8', pink: '#FF4F9A', gold: '#FFB21F' }
export const SAWDUST = '#E9D4AE'
export const BASKET_WOOD = '#C9965E'

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
    P.sphere(0.074 * s, col.cap, { at, rot: capRot, scale: [1.2, 0.34, 0.95] }, 14),
    P.sphere(0.068 * s, col.gill, { at: [at[0], at[1] - 0.012 * s, at[2]], rot: capRot, scale: [1.12, 0.22, 0.88] }, 12),
  ]
}

/** A bag's clump, coming out of its mouth (the origin) toward +z, as one shape. */
function clumpGeo(c: ShroomColor) {
  return merge([
    ...fan(c, [0, 0.01, 0], [0, 0.6, 1], 0.09, 1.3),
    ...fan(c, [-0.02, 0, 0], [-0.8, 0.25, 0.7], 0.075, 1.08),
    ...fan(c, [0.02, 0, 0], [0.85, 0.15, 0.65], 0.08, 1.14),
    ...fan(c, [0, -0.02, 0], [0.1, -0.6, 0.8], 0.06, 0.9),
    ...fan(c, [-0.01, 0.0, 0.01], [-0.3, -0.2, 1], 0.1, 0.66),
  ])
}

/** A single fan, its cap's middle at the origin, lying flat (for the basket and the pizza). */
function oneGeo(c: ShroomColor) {
  const col = SHROOM[c]
  return merge([
    P.sphere(0.07, col.cap, { at: [0, 0.012, 0], scale: [1.2, 0.36, 0.95] }, 14),
    P.sphere(0.064, col.gill, { at: [0, 0, 0], scale: [1.1, 0.22, 0.86] }, 12),
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

/** The rack's bags lying down, mouths toward +z at z = 0 (one shape, for the whole rack: pass the mouths). */
export function bagsGeo(mouths: V3[]): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  for (const [x, y, z] of mouths) {
    const body = z - 0.06 - BAG_LEN / 2
    parts.push(P.cyl(BAG_R, BAG_R * 0.96, BAG_LEN, SAWDUST, { at: [x, y, body], rot: [Math.PI / 2, 0, 0] }, 18))
    // The neck the bag is gathered into, and the dark sawdust showing in its mouth.
    parts.push(P.cyl(0.07, BAG_R * 0.96, 0.06, '#F1E2C6', { at: [x, y, z - 0.03], rot: [Math.PI / 2, 0, 0] }, 16))
    parts.push(P.cyl(0.058, 0.058, 0.012, '#9B7653', { at: [x, y, z + 0.002], rot: [Math.PI / 2, 0, 0] }, 14))
  }
  return parts
}

/** A bag's collar ring at its mouth (its own toy, so round 3's new bags can show pink or gold ones). */
export function collar(kind: BagKind, bag: Bag) {
  return solid(P.torus(0.066, 0.02, COLLAR[kind]), bag, 1)
}

/** A woven basket with a handle, its rim at y = h (local), and where things heap inside it. */
export function buildBasket(bag: Bag, r = BASKET_R, h = 0.2) {
  const parts = [
    P.cyl(r, r * 0.8, h, BASKET_WOOD, { at: [0, h / 2, 0] }, 20),
    // The weave: darker bands round it.
    ...[0.3, 0.6].map((k) => P.cyl(r * (0.8 + 0.2 * k) + 0.004, r * (0.8 + 0.2 * k) + 0.004, 0.022, '#A8763F', { at: [0, h * k, 0] }, 20)),
    P.torus(r, 0.022, '#A8763F', { at: [0, h, 0], rot: [Math.PI / 2, 0, 0] }),
    // Inside: shadowy, so it reads as a basket, not a drum.
    P.cyl(r * 0.92, r * 0.92, 0.01, '#7A5236', { at: [0, h - 0.02, 0] }, 20),
    P.torus(r * 0.85, 0.018, '#A8763F', { at: [0, h, 0], rot: [0, 0, 0] }, Math.PI),
  ]
  const g = solid(merge(parts), bag, 2)
  return { root: g, rim: h, r }
}

/** Where the n-th thing heaps in a basket of radius r: a ring on the bottom, then a smaller ring on top, then a peak. */
export function heapSpot(n: number, r: number, rim: number): Vector3 {
  const rings = [
    { k: 7, rr: r * 0.55, y: rim - 0.05 },
    { k: 5, rr: r * 0.32, y: rim + 0.0 },
    { k: 3, rr: r * 0.14, y: rim + 0.045 },
    { k: 99, rr: r * 0.2, y: rim + 0.08 },
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
