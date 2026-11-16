// A tiny modelling kit for flat toy shapes. Each part is a primitive with its own palette color baked into the
// geometry (vertex colors) and its place baked into the vertices, so a whole prop (a table with its legs, a shrine)
// merges into ONE mesh with one shared toon material plus one outline: two draw calls, however many parts.
//
//   const table = solid(merge([
//     P.rbox(0.9, 0.06, 1.9, 0.02, PAL.peach, { at: [0, 0.72, 0] }),
//     ...legs.map((at) => P.cyl(0.04, 0.04, 0.7, PAL.ink, { at })),
//   ]), bag, 2)
import { BoxGeometry, BufferAttribute, CapsuleGeometry, Color, ConeGeometry, CylinderGeometry, Euler, ExtrudeGeometry, Group, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Shape, SphereGeometry, TorusGeometry, type Texture, Vector2, Vector3, BufferGeometry, type ColorRepresentation, type EulerOrder } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Bag } from './dispose'
import { makeHull } from './outline'
import { radialAlpha, softTexture } from './softTexture'
import { toon } from './toon'

export type V3 = [number, number, number]
export interface PartOpts {
  at?: V3
  /** Euler angles in radians (XYZ unless `order` says otherwise). */
  rot?: V3
  /** The Euler order. 'YXZ' turns the part to face a way (y) and then tips it in its own frame (x): a lounger's back,
   *  an awning, a ramp. (In the default XYZ the tip happens about the world's x, so it twists on anything turned.) */
  order?: EulerOrder
  scale?: V3
}

/** The matrix that places a part: `at`, `rot` (in `order`), `scale`. */
export const placeMatrix = (o: PartOpts = {}) =>
  new Matrix4().compose(new Vector3(...(o.at ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(...(o.rot ?? [0, 0, 0]), o.order ?? 'XYZ')), new Vector3(...(o.scale ?? [1, 1, 1])))

const color = new Color()
/** A part with its color and place baked in. Plain triangles (no index), so a caller can paint it a triangle at a time;
 *  `indexed` keeps the shape's own index instead (the primitives below: drawn the same, a third of the corners). */
export function bake(g: BufferGeometry, c: ColorRepresentation, o: PartOpts = {}, indexed = false): BufferGeometry {
  const geo = g.index && !indexed ? g.toNonIndexed() : g
  if (geo !== g) g.dispose()
  for (const name of Object.keys(geo.attributes)) if (name !== 'position' && name !== 'normal') geo.deleteAttribute(name)
  geo.applyMatrix4(placeMatrix(o))
  color.set(c)
  const n = geo.attributes.position.count
  const rgb = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) rgb.set([color.r, color.g, color.b], i * 3)
  geo.setAttribute('color', new BufferAttribute(rgb, 3))
  return geo
}

/** Primitive parts, each with a color and an optional place. Sizes in meters. */
export const P = {
  box: (w: number, h: number, d: number, c: ColorRepresentation, o?: PartOpts) => bake(new BoxGeometry(w, h, d), c, o, true),
  /** A box with rounded edges: furniture and props look like toys. */
  rbox: (w: number, h: number, d: number, r: number, c: ColorRepresentation, o?: PartOpts) => bake(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999), c, o, true),
  cyl: (top: number, bottom: number, h: number, c: ColorRepresentation, o?: PartOpts, seg = 16) => bake(new CylinderGeometry(top, bottom, h, seg), c, o, true),
  cone: (r: number, h: number, c: ColorRepresentation, o?: PartOpts, seg = 16) => bake(new ConeGeometry(r, h, seg), c, o, true),
  sphere: (r: number, c: ColorRepresentation, o?: PartOpts, seg = 18) => bake(new SphereGeometry(r, seg, Math.round(seg * 0.7)), c, o, true),
  /** Upright capsule: `len` is the straight middle part, total height len + 2r. */
  capsule: (r: number, len: number, c: ColorRepresentation, o?: PartOpts) => bake(new CapsuleGeometry(r, len, 5, 14), c, o, true),
  torus: (r: number, tube: number, c: ColorRepresentation, o?: PartOpts, arc = Math.PI * 2) => bake(new TorusGeometry(r, tube, 8, 24, arc), c, o, true),
  /** A flat outline [x, y][] pushed `depth` along z (centered): a gable's triangle, a sign, a roof's end. */
  prism: (pts: [number, number][], depth: number, c: ColorRepresentation, o?: PartOpts) => {
    const shape = new Shape(pts.map(([x, y]) => new Vector2(x, y)))
    return bake(new ExtrudeGeometry(shape, { depth, bevelEnabled: false }).translate(0, 0, -depth / 2), c, o)
  },
}

/** A station of a `loft`: a closed outline [x, y][] (counter-clockwise seen from +z) standing at `z`. */
export interface LoftRing {
  z: number
  pts: [number, number][]
}

/**
 * A hull-like shape lofted through outlines standing along z (a boat's or a jet ski's sections, bow to stern), each
 * with the same number of points, flat-shaded and capped at both ends. `cols` paints the band between point k and k+1
 * all the way along (one color, or one per band: a colored bottom, a pinstripe, a white deck).
 */
export function loft(rings: LoftRing[], cols: ColorRepresentation | ColorRepresentation[], o?: PartOpts): BufferGeometry {
  const rs = [...rings].sort((a, b) => a.z - b.z)
  const n = rs[0].pts.length
  const pos: number[] = []
  const rgb: number[] = []
  const c = new Color()
  const tri = (a: V3, b: V3, d: V3, col: ColorRepresentation) => {
    pos.push(...a, ...b, ...d)
    c.set(col)
    for (let i = 0; i < 3; i++) rgb.push(c.r, c.g, c.b)
  }
  const colOf = (k: number) => (Array.isArray(cols) ? cols[k % cols.length] : cols)
  const P3 = (r: LoftRing, k: number): V3 => [r.pts[k % n][0], r.pts[k % n][1], r.z]
  for (let i = 0; i + 1 < rs.length; i++) {
    for (let k = 0; k < n; k++) {
      const a = P3(rs[i], k), b = P3(rs[i], k + 1), cc = P3(rs[i + 1], k + 1), d = P3(rs[i + 1], k)
      tri(a, b, cc, colOf(k))
      tri(a, cc, d, colOf(k))
    }
  }
  // The end caps: a fan from each end's middle, painted like the deck (the last band).
  for (const [r, sign] of [[rs[0], -1], [rs[rs.length - 1], 1]] as const) {
    const m: V3 = [r.pts.reduce((s, p) => s + p[0], 0) / n, r.pts.reduce((s, p) => s + p[1], 0) / n, r.z]
    for (let k = 0; k < n; k++) {
      if (sign > 0) tri(m, P3(r, k), P3(r, k + 1), colOf(k))
      else tri(m, P3(r, k + 1), P3(r, k), colOf(k))
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.applyMatrix4(placeMatrix(o))
  g.computeVertexNormals()
  g.setAttribute('color', new BufferAttribute(new Float32Array(rgb), 3))
  return g
}

export function merge(parts: BufferGeometry[]): BufferGeometry {
  // The primitives (P) come indexed: each corner shaded once, not once per triangle that shares it. A plain-triangle
  // part (one baked by hand, an extrusion) gets the simple index that draws it the same, so every part matches.
  if (parts.some((p) => p.index)) for (const p of parts) if (!p.index) p.setIndex(serial(p.attributes.position.count))
  const merged = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  if (!merged) throw new Error('merge: parts have different attributes')
  return merged
}

const serial = (n: number) => {
  const a = n > 65535 ? new Uint32Array(n) : new Uint16Array(n)
  for (let i = 0; i < n; i++) a[i] = i
  return new BufferAttribute(a, 1)
}


/**
 * A finished toy shape: the merged parts with the shared vertex-color toon material, plus an ink outline `px` CSS
 * pixels wide (0 = none), in ink unless `line` says another color. Returns a Group so callers can move/squash it as one
 * thing.
 */
export function solid(geometry: BufferGeometry, bag: Bag, px = 2, line?: string): Group {
  const g = new Group()
  const mesh = new Mesh(bag.add(geometry), toon('#ffffff', true))
  g.add(mesh)
  if (px > 0) {
    const hull = makeHull(geometry, px, line)
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
  const lined = px > 0 && outlined.length ? merge(outlined.map((p) => p.clone())) : null
  const all = merge([...outlined, ...plain])
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

let blobTexture: Texture | null = null
/** A soft ink-tinted disc on the floor under something, so it reads as standing there (no shadow maps needed). */
export function blobShadow(r: number, bag: Bag) {
  // (Pixels written by hand, not a canvas gradient: on iPhone and iPad that speckles with colored static, see softTexture.)
  blobTexture ??= softTexture(64, 64, [43, 35, 48], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 0.34], [0.62, 0.2], [1, 0]]))
  const m = new Mesh(bag.add(new PlaneGeometry(r * 2, r * 2)), blobMaterial())
  m.rotation.x = -Math.PI / 2
  m.position.y = 0.012
  m.renderOrder = 1
  return m
}
let blobMat: MeshBasicMaterial | null = null
const blobMaterial = () => (blobMat ??= new MeshBasicMaterial({ map: blobTexture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }))
