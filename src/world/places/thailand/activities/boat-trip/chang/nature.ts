// Baan Chang's nature and texture, modeled on Dad's photos and shared by the entrance, the cafe, the boardwalk and the
// yard: the oil palms (a shaggy trunk of old frond stubs, a crown of long feathery fronds in three tiers that rise,
// arch out and droop, and orange fruit bunches under them), the big mossy boulders (faceted khaki rock, moss on the
// faces that look up), the gravel's dirt patches and pebbles, and the boardwalk's steel mesh.
import { BufferAttribute, CanvasTexture, Color, DoubleSide, Euler, IcosahedronGeometry, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, RepeatWrapping, SRGBColorSpace, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { P } from '../../../engine/geo'

export const FROND = '#7CC98A'
export const FROND_DARK = '#5DA872'
const FROND_LOW = '#4F9866'
const PALM_TRUNK = '#9A7C64'
const PALM_STUB = '#86684F'
const FRUIT = '#D9714F'

const m4 = new Matrix4()
const fold4 = new Matrix4()
const q4 = new Quaternion()
const e4 = new Euler()
const one = new Vector3(1, 1, 1)
const p4 = new Vector3()

/** Half a frond's leaf: from the rib (x = 0) out to one side, tapering from `w0` to `w1` along its length `len` (+z),
 *  folded down along the rib by `fold` so the two halves make a V, like the leaflets hanging off an oil palm frond. */
function halfLeaf(side: 1 | -1, len: number, w0: number, w1: number, fold: number, c: string) {
  const g = P.prism([[0, 0], [side * w0, len * 0.12], [side * w1, len], [0, len]], 0.025, c, { rot: [Math.PI / 2, 0, 0] })
  return g.applyMatrix4(fold4.makeRotationZ(-side * fold))
}

/** An oil palm's parts: its trunk (with the stubs of old fronds all the way up, and the fruit bunches) and its crown
 *  (separate, so the palm by the boardwalk can shake its crown on its own pivot, at the trunk's top). `lite` is for
 *  far rows: fewer, shorter fronds. */
export function oilPalmParts(x: number, z: number, h: number, k: number, y0 = 0, lite = false) {
  const top = y0 + h
  const trunk: BufferGeometry[] = [P.cyl(0.27, 0.36, h, PALM_TRUNK, { at: [x, y0 + h / 2, z] }, 8)]
  // The old frond stubs, in a spiral up the trunk, pointing up and out (an oil palm's shaggy, criss-crossed bark).
  const stubs = lite ? 4 : 9
  for (let i = 0; i < stubs; i++) {
    const a = i * 2.4 + k
    const y = y0 + h * (0.3 + (0.65 * i) / stubs)
    trunk.push(P.box(0.13, 0.05, 0.42, i % 2 ? PALM_STUB : PALM_TRUNK, { at: [x + Math.sin(a) * 0.3, y, z + Math.cos(a) * 0.3], rot: [-0.75, a, 0] }))
  }
  // The heart, and the fruit bunches tucked under the crown.
  trunk.push(P.sphere(0.42, PALM_STUB, { at: [x, top, z] }, 8))
  if (!lite) for (const a of [k + 1, k + 3.6]) trunk.push(P.sphere(0.16, FRUIT, { at: [x + Math.sin(a) * 0.34, top - 0.3, z + Math.cos(a) * 0.34], scale: [1, 1.2, 1] }, 7))
  // The crown: three tiers of fronds (rising, arching out, drooping low), each a chain of leaf segments bending down.
  const crown: BufferGeometry[] = []
  const tiers = lite
    ? [{ n: 3, pitch: -0.45, c: FROND }, { n: 4, pitch: 0.05, c: FROND_DARK }]
    : [{ n: 4, pitch: -0.7, c: FROND }, { n: 4, pitch: -0.25, c: FROND_DARK }, { n: 3, pitch: 0.2, c: FROND_LOW }]
  const segs = lite ? [1.1, 1.0] : [1.15, 1.1, 0.95]
  tiers.forEach((tier, ti) => {
    for (let l = 0; l < tier.n; l++) {
      const yaw = (l / tier.n) * Math.PI * 2 + k + ti * 0.7
      let pitch = tier.pitch + Math.sin(l * 2.3 + k) * 0.08
      const at = new Vector3(x, top + 0.1, z)
      segs.forEach((len, si) => {
        const w0 = 0.42 - si * 0.08
        const w1 = si === segs.length - 1 ? 0.05 : 0.3 - si * 0.06
        q4.setFromEuler(e4.set(pitch, yaw, 0, 'YXZ'))
        m4.compose(at, q4, one)
        for (const side of [1, -1] as const) crown.push(halfLeaf(side, len, w0, w1, 0.5, tier.c).applyMatrix4(m4))
        // On along the frond, and bending down a little more for the next piece.
        at.add(p4.set(Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(len * 0.97))
        pitch += 0.42
      })
    }
  })
  return { trunk, crown }
}

/** An oil palm, all in one list of parts (to merge with the rest of a layer). */
export function oilPalm(x: number, z: number, h: number, k: number, y0 = 0, lite = false) {
  const { trunk, crown } = oilPalmParts(x, z, h, k, y0, lite)
  return [...trunk, ...crown]
}

/** A little hash noise in [-1, 1] for a point (the same point always gets the same bump, so a rock stays closed). */
function bump(x: number, y: number, z: number, seed: number) {
  const s = Math.sin(x * 12.99 + y * 78.23 + z * 37.72 + seed * 4.13) * 43758.55
  return (s - Math.floor(s)) * 2 - 1
}

const ROCK = new Color('#C9C1A2')
const ROCK_DARK = new Color('#B3AB8D')
const MOSS = new Color('#B4C68C')
const MOSS_DARK = new Color('#A3B97F')

/** A boulder: a faceted lump of khaki rock (a lumpy icosahedron), `w` wide, `h` tall and `d` deep, standing at (x, z),
 *  with moss on the faces that look up and darker faces here and there. Flat-shaded, so the facets read in toon bands;
 *  `detail` 1 for small or far ones. */
export function boulder(x: number, z: number, w: number, h: number, d: number, seed: number, detail = 2): BufferGeometry {
  const geo = new IcosahedronGeometry(1, detail)
  const pos = geo.attributes.position
  const v = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const k = 1 + bump(v.x, v.y, v.z, seed) * 0.1
    // Flatter on top and flat underneath (it sits on the gravel), lumpy all round.
    const y = v.y < 0 ? v.y * 0.25 : v.y * (0.8 + 0.2 * Math.abs(v.y))
    pos.setXYZ(i, v.x * k * (w / 2), (y * k + 0.25) * (h / 1.4), v.z * k * (d / 2))
  }
  geo.applyMatrix4(m4.makeRotationY(seed * 1.7).setPosition(x, 0, z))
  geo.computeVertexNormals()
  const n = geo.attributes.normal
  const rgb = new Float32Array(pos.count * 3)
  const c = new Color()
  for (let f = 0; f < pos.count; f += 3) {
    const up = n.getY(f)
    const odd = bump(f, seed, 1, seed) > 0.35
    c.copy(up > 0.8 && bump(f, 3, seed, 2) > -0.2 ? (odd ? MOSS_DARK : MOSS) : odd ? ROCK_DARK : ROCK)
    for (let j = 0; j < 3; j++) rgb.set([c.r, c.g, c.b], (f + j) * 3)
  }
  geo.setAttribute('color', new BufferAttribute(rgb, 3))
  return geo
}

/** The ground's texture: tan dirt patches in the gravel and a sprinkle of little pebbles, inside x0..x1, z0..z1. The
 *  patches' tops are at 0.022 and 0.026, over gravel or sand (tops at most 0.014) and the grass. */
export function groundScatter(x0: number, x1: number, z0: number, z1: number, seed: number, patches = 10, pebbles = 40) {
  const r = (i: number, j: number) => (bump(i, j, seed, seed) + 1) / 2
  const parts: BufferGeometry[] = []
  for (let i = 0; i < patches; i++) {
    const s = 0.8 + r(i, 1) * 1.6
    // (Each color on its own height, clear of the gravel and the sand under them: patches at the same height flicker.)
    parts.push(P.cyl(s, s, 0.01, i % 3 ? '#DDCDB3' : '#D3C2A6', { at: [x0 + r(i, 2) * (x1 - x0), i % 3 ? 0.017 : 0.021, z0 + r(i, 3) * (z1 - z0)], scale: [1.5, 1, 0.8], rot: [0, r(i, 4) * 3, 0] }, 12))
  }
  for (let i = 0; i < pebbles; i++) {
    const s = 0.04 + r(i, 5) * 0.06
    parts.push(P.sphere(s, i % 2 ? '#A9A4B2' : '#BDB7C4', { at: [x0 + r(i, 6) * (x1 - x0), s * 0.3, z0 + r(i, 7) * (z1 - z0)], scale: [1.3, 0.6, 1] }, 5))
  }
  return parts
}

/** The plantation floor round the yard (Dad's photos: brown earth under the palms, grass growing back in patches). */
export const EARTH = '#D8CDB0'
/** Green patches of grass and low ferns in the earth, inside x0..x1, z0..z1, skipping a box (`skip`: x0, x1, z0, z1).
 *  Their tops are at 0.003 and 0.006: gravel or sand laid over them (tops 0.01 and up) covers them cleanly. */
export function grassPatches(x0: number, x1: number, z0: number, z1: number, seed: number, n: number, skip?: [number, number, number, number]) {
  const r = (i: number, j: number) => (bump(i, j, seed, seed) + 1) / 2
  const parts: BufferGeometry[] = []
  for (let i = 0; i < n; i++) {
    const x = x0 + r(i, 1) * (x1 - x0)
    const z = z0 + r(i, 2) * (z1 - z0)
    if (skip && x > skip[0] && x < skip[1] && z > skip[2] && z < skip[3]) continue
    const s = 0.9 + r(i, 3) * 1.8
    // (Under the gravel and the sand, each green on its own height: the same height flickers where they overlap.)
    parts.push(P.cyl(s, s, 0.004, i % 3 ? '#B5D58E' : '#A3CB82', { at: [x, i % 3 ? 0.001 : 0.004, z], scale: [1.5, 1, 0.8], rot: [0, r(i, 4) * 3, 0] }, 12))
  }
  return parts
}

let meshTexture: CanvasTexture | null = null
/** A see-through steel mesh panel (the boardwalk's and the cafe's rail): a square grid of dark wire, `w` by `h`, its
 *  middle at `at`, facing along z (turned `rotY`). No outline: the rails and posts round it carry the ink. */
export function meshPanel(bag: Bag, w: number, h: number, at: [number, number, number], rotY = 0, color = '#4A4656') {
  if (!meshTexture) {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const g = c.getContext('2d')!
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 64, 6)
    g.fillRect(0, 0, 6, 64)
    meshTexture = new CanvasTexture(c)
    meshTexture.wrapS = meshTexture.wrapT = RepeatWrapping
    meshTexture.colorSpace = SRGBColorSpace
  }
  // One grid cell is 0.15 m.
  const tex = bag.add(meshTexture.clone())
  tex.repeat.set(w / 0.15, h / 0.15)
  tex.needsUpdate = true
  const m = new Mesh(bag.add(new PlaneGeometry(w, h)), bag.add(new MeshBasicMaterial({ color, alphaMap: tex, transparent: false, alphaTest: 0.5, side: DoubleSide })))
  m.position.set(...at)
  m.rotation.y = rotY
  return m
}
