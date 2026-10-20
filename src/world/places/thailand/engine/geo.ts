// A tiny modelling kit for flat toy shapes. Each part is a primitive with its own palette color baked into the
// geometry (vertex colors) and its place baked into the vertices, so a whole prop (a table with its legs, a shrine)
// merges into ONE mesh with one shared toon material plus one outline: two draw calls, however many parts.
//
//   const table = solid(merge([
//     P.rbox(0.9, 0.06, 1.9, 0.02, PAL.peach, { at: [0, 0.72, 0] }),
//     ...legs.map((at) => P.cyl(0.04, 0.04, 0.7, PAL.ink, { at })),
//   ]), bag, 2)
import { BoxGeometry, BufferAttribute, CanvasTexture, CapsuleGeometry, Color, ConeGeometry, CylinderGeometry, Euler, ExtrudeGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Shape, SphereGeometry, TorusGeometry, Vector2, Vector3, type BufferGeometry, type ColorRepresentation } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from './dispose'
import { makeHull } from './outline'
import { toon } from './toon'

export type V3 = [number, number, number]
export interface PartOpts {
  at?: V3
  /** Euler angles in radians (XYZ). */
  rot?: V3
  scale?: V3
}

const color = new Color()
function bake(g: BufferGeometry, c: ColorRepresentation, o: PartOpts = {}): BufferGeometry {
  const geo = g.index ? g.toNonIndexed() : g
  if (geo !== g) g.dispose()
  for (const name of Object.keys(geo.attributes)) if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name)
  const m = new Matrix4().compose(new Vector3(...(o.at ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(...(o.rot ?? [0, 0, 0]))), new Vector3(...(o.scale ?? [1, 1, 1])))
  geo.applyMatrix4(m)
  color.set(c)
  const n = geo.attributes.position.count
  const rgb = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) rgb.set([color.r, color.g, color.b], i * 3)
  geo.setAttribute('color', new BufferAttribute(rgb, 3))
  return geo
}

/** Primitive parts, each with a color and an optional place. Sizes in meters. */
export const P = {
  box: (w: number, h: number, d: number, c: ColorRepresentation, o?: PartOpts) => bake(new BoxGeometry(w, h, d), c, o),
  /** A box with rounded edges: furniture and props look like toys. */
  rbox: (w: number, h: number, d: number, r: number, c: ColorRepresentation, o?: PartOpts) => bake(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999), c, o),
  cyl: (top: number, bottom: number, h: number, c: ColorRepresentation, o?: PartOpts, seg = 16) => bake(new CylinderGeometry(top, bottom, h, seg), c, o),
  cone: (r: number, h: number, c: ColorRepresentation, o?: PartOpts, seg = 16) => bake(new ConeGeometry(r, h, seg), c, o),
  sphere: (r: number, c: ColorRepresentation, o?: PartOpts, seg = 18) => bake(new SphereGeometry(r, seg, Math.round(seg * 0.7)), c, o),
  /** Upright capsule: `len` is the straight middle part, total height len + 2r. */
  capsule: (r: number, len: number, c: ColorRepresentation, o?: PartOpts) => bake(new CapsuleGeometry(r, len, 5, 14), c, o),
  torus: (r: number, tube: number, c: ColorRepresentation, o?: PartOpts, arc = Math.PI * 2) => bake(new TorusGeometry(r, tube, 8, 24, arc), c, o),
  /** A flat outline [x, y][] pushed `depth` along z (centered): a gable's triangle, a sign, a roof's end. */
  prism: (pts: [number, number][], depth: number, c: ColorRepresentation, o?: PartOpts) => {
    const shape = new Shape(pts.map(([x, y]) => new Vector2(x, y)))
    return bake(new ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2), c, o)
  },
}

export function merge(parts: BufferGeometry[]): BufferGeometry {
  const merged = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  if (!merged) throw new Error('merge: parts have different attributes')
  return merged
}

/**
 * A finished toy shape: the merged parts with the shared vertex-color toon material, plus an ink outline `px` CSS
 * pixels wide (0 = none). Returns a Group so callers can move/squash it as one thing.
 */
export function solid(geometry: BufferGeometry, bag: Bag, px = 2): Group {
  const g = new Group()
  const mesh = new Mesh(bag.add(geometry), toon('#ffffff', true))
  g.add(mesh)
  if (px > 0) {
    const hull = makeHull(geometry, px)
    bag.add(hull.geometry)
    g.add(hull)
  }
  return g
}

/**
 * A toy shape whose outline only goes around some of its parts: `outlined` parts each get an ink line where they show
 * in front of the rest (a muzzle on a face, a sleeve on an arm), `plain` parts (blush, eye shines) get none.
 */
export function solidMix(outlined: BufferGeometry[], plain: BufferGeometry[], bag: Bag, px = 2): Group {
  const g = new Group()
  const all = mergeGeometries([...outlined, ...plain], false)
  const lined = px > 0 && outlined.length ? mergeGeometries(outlined, false) : null
  for (const p of [...outlined, ...plain]) p.dispose()
  if (!all) throw new Error('solidMix: parts have different attributes')
  g.add(new Mesh(bag.add(all), toon('#ffffff', true)))
  if (lined) {
    const hull = makeHull(lined, px)
    lined.dispose()
    bag.add(hull.geometry)
    g.add(hull)
  }
  return g
}

/** Like `solid`, without merging: a single part. */
export const one = (part: BufferGeometry, bag: Bag, px = 2) => solid(part, bag, px)

let blobTexture: CanvasTexture | null = null
/** A soft ink-tinted disc on the floor under something, so it reads as standing there (no shadow maps needed). */
export function blobShadow(r: number, bag: Bag) {
  if (!blobTexture) {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const x = c.getContext('2d')!
    const grad = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(43,35,48,0.34)')
    grad.addColorStop(0.62, 'rgba(43,35,48,0.2)')
    grad.addColorStop(1, 'rgba(43,35,48,0)')
    x.fillStyle = grad
    x.fillRect(0, 0, 64, 64)
    blobTexture = new CanvasTexture(c)
  }
  const m = new Mesh(bag.add(new PlaneGeometry(r * 2, r * 2)), blobMaterial())
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.012
  m.renderOrder = 1
  return m
}
let blobMat: MeshBasicMaterial | null = null
const blobMaterial = () => (blobMat ??= new MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }))
