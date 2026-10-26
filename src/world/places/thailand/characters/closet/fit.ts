// Small helpers for fitting her things to her measured shape (model-wear.ts's numbers): a point on her hair all the way
// round (the mongkhon's measured band), parts turned to face a direction, a hat brim that curls up at the sides.
import { Euler, ExtrudeGeometry, Group, Matrix4, Path, Quaternion, Shape, Vector3, type BufferGeometry } from 'three'
import { bake, type V3 } from '../../engine/geo'
import { BAND_R } from '../model-wear'

const UP = new Vector3(0, 1, 0)
const FRONT = new Vector3(0, 0, 1)

/** Where the band round her hair is (model-wear.ts's mongkhon): head-local center and its forward tip. */
const BAND_AT = new Vector3(0, 0.33, -0.04)
const BAND_TILT = 0.12

/** A point `out` meters past her hair (bangs, braid and streaks included), `th` radians round from the front toward
 *  her left (+x), on the band over the top of her bangs. */
export function onHair(th: number, out: number): Vector3 {
  const n = BAND_R.length
  const f = ((((th / (Math.PI * 2)) * n) % n) + n) % n
  const i = Math.floor(f)
  const k = f - i
  const r = BAND_R[i] * (1 - k) + BAND_R[(i + 1) % n] * k + out
  return new Vector3(Math.sin(th), -Math.cos(th) * Math.sin(BAND_TILT), Math.cos(th) * Math.cos(BAND_TILT)).multiplyScalar(r).add(BAND_AT)
}
/** Straight out from the band's center through that point (level with the band). */
export const outFrom = (th: number) => new Vector3(Math.sin(th), -Math.cos(th) * Math.sin(BAND_TILT), Math.cos(th) * Math.cos(BAND_TILT))

/** Euler angles that turn +y to point along `dir`. */
export function aim(dir: Vector3): V3 {
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, dir.clone().normalize()))
  return [e.x, e.y, e.z]
}

/** Turns a part built facing +z (a flower, a bow) to face `normal`, spun `spin` round it, and moves it to `at`. */
export function facing(geo: BufferGeometry, at: Vector3, normal: Vector3, spin = 0): BufferGeometry {
  const q = new Quaternion().setFromUnitVectors(FRONT, normal.clone().normalize()).multiply(new Quaternion().setFromAxisAngle(FRONT, spin))
  return geo.applyMatrix4(new Matrix4().compose(at, q, new Vector3(1, 1, 1)))
}

/** A hat brim: a flat ring (`r0` round the crown to `r1` at the edge, `depth` deep over `r1` wide) whose sides curl up
 *  by `curl` at the edge (a cowboy hat's) or droop all round by `droop` (a sun hat's). Head-local, centered on the
 *  origin. */
export function brim(r0: number, r1: number, color: string, o: { depth?: number; curl?: number; droop?: number; thick?: number } = {}): BufferGeometry {
  const thick = o.thick ?? 0.014
  const shape = new Shape().absarc(0, 0, r1, 0, Math.PI * 2, false)
  shape.holes.push(new Path().absarc(0, 0, r0, 0, Math.PI * 2, true))
  const geo = new ExtrudeGeometry(shape, { depth: thick, bevelEnabled: false, curveSegments: 40 })
  geo.translate(0, 0, -thick / 2)
  geo.rotateX(-Math.PI / 2)
  const pos = geo.attributes.position
  const d = o.depth ?? 1
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const r = Math.hypot(x, z)
    const t = Math.max(0, (r - r0) / (r1 - r0))
    const side = Math.abs(x) / Math.max(r, 1e-6)
    pos.setY(i, pos.getY(i) + (o.curl ?? 0) * t * t * side ** 2 - (o.droop ?? 0) * t * t)
    pos.setZ(i, z * d)
  }
  geo.computeVertexNormals()
  return bake(geo, color)
}

/** A part built round its own origin, then set at `at` turned by `rot`. */
export function placed(g: Group | null, at: V3, rot: V3 = [0, 0, 0]) {
  const holder = new Group()
  holder.position.set(...at)
  holder.rotation.set(...rot)
  if (g) holder.add(g)
  return holder
}

/** A five-pointed star outline, `r` to its points. */
export const star = (r: number): [number, number][] =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    const k = i % 2 ? 0.48 : 1
    return [Math.sin(a) * r * k, Math.cos(a) * r * k]
  })

/** A heart outline, `r` across, its point down. */
export const heart = (r: number): [number, number][] =>
  Array.from({ length: 24 }, (_, i) => {
    const t = (i / 24) * Math.PI * 2
    return [(r / 16) * 16 * Math.sin(t) ** 3, (r / 16) * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]
  })
