// Red Canoe's nature kit, at the Nan forest's level of detail (thailand/trip/road/forest.ts): the Rockies' conifers as
// layered skirts of branches with ragged, drooping hems (Engelmann spruce, the tall narrow subalpine fir, a golden larch
// now and then, like Larch Valley above Moraine Lake), aspens with white trunks, pink fireweed in the meadows, round
// bushes and tufts of grass; every plant its own shade of green, drawn many times as one shape (engine3d/plants.ts).
// Rocks are faceted boulders, lumpy and a little mossy on top, instead of squashed balls. The mountains are jagged
// crags whose snow sits by height and in the gullies, instead of cones with a white cap.
import { BufferAttribute, Color, ConeGeometry, CylinderGeometry, Group, IcosahedronGeometry, InstancedMesh, Matrix4, Quaternion, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, type PartOpts } from '../../../../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial } from '../../../../engine3d/outline'
import { joinParts, leafBlob, plantPart, tintedToon, type V3 } from '../../../../engine3d/plants'

/** A tiny repeatable random (the same lake every time). */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** A smooth bumpy number in -1..1 at a point (sums of sines: cheap, the same every time). */
export function bumps(x: number, y: number, z: number, seed: number) {
  return (
    0.5 * Math.sin(x * 1.7 + seed) * Math.cos(z * 1.3 - seed * 0.7) +
    0.3 * Math.sin(y * 2.3 + x * 0.9 + seed * 1.9) +
    0.2 * Math.sin(z * 3.1 - y * 1.7 + seed * 2.3)
  )
}

const BARK = '#7E5B48'

/** One skirt of conifer branches: a cone whose hem is ragged (every other point pulled out and drooped, the rest
 *  tucked up) and whose middle puffs out a little, so a stack of them reads as layered boughs, not a smooth cone. */
function skirt(r: number, h: number, y: number, shade: string, seed: number, seg = 10) {
  // (Open underneath: nobody sees under a bough, and it saves a third of the triangles.)
  const g = new ConeGeometry(r, h, seg, 2, true)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const yy = p.getY(i)
    const z = p.getZ(i)
    const a = Math.atan2(z, x)
    const t = (yy + h / 2) / h
    if (t < 0.01) {
      // The hem: points out and down, notches in and up.
      const k = Math.round((a / (Math.PI * 2)) * seg + seg) % 2
      const out = k ? 1.12 + 0.08 * Math.sin(a * 3 + seed) : 0.82
      p.setXYZ(i, x * out, yy - (k ? h * 0.16 : -h * 0.04), z * out)
    } else if (t < 0.99) {
      const puff = 1.08 + 0.06 * Math.sin(a * 2 + seed)
      p.setXYZ(i, x * puff, yy, z * puff)
    }
  }
  return plantPart(g, shade, 1, { at: [0, y + h / 2, 0], rot: [0, seed, 0] })
}

/** A conifer about `h` meters tall: `tiers` skirts from wide and shaded at the bottom to small and lit at the top, on a
 *  short brown trunk. `slim` narrows it (the subalpine fir is a spire). */
function conifer(h: number, tiers: number, slim: number, seed: number, seg = 8) {
  const parts: BufferGeometry[] = [plantPart(new CylinderGeometry(0.12, 0.2, h * 0.22, 5, 1, true), BARK, 0, { at: [0, h * 0.1, 0] })]
  const shades = ['#C4D2C6', '#D3DED3', '#E1E9DF', '#EEF3EC', '#F8FAF6', '#FFFFFF', '#FFFFFF']
  const base = h * 0.12
  const span = h - base
  for (let i = 0; i < tiers; i++) {
    const t = i / tiers
    const th = (span / tiers) * 1.75
    const y = base + span * t * 0.98 - (i ? th * 0.08 : 0)
    const r = h * slim * (1 - t * 0.82)
    parts.push(skirt(r, Math.min(th, h - y), y, shades[Math.min(shades.length - 1, Math.round((i / Math.max(1, tiers - 1)) * (shades.length - 1)))], seed + i * 1.7, seg))
  }
  return joinParts(parts)
}

/** A plant shape: how tall it is (m), its ink line, and its colors (one picked per plant, nudged a little). */
interface Kind {
  geo: BufferGeometry
  h: number
  px: number
  colors: string[]
  /** Too small to show in the lake's reflection: left out of it (`userData.noMirror`). */
  small?: boolean
  /** A plainer shape for the reflection (fewer skirts): the lake blurs it anyway. */
  lite?: BufferGeometry
}

/** The plainer shapes the reflection draws instead, by the instanced mesh's `userData.mirrorGeo` (a geometry's uuid:
 *  userData is copied as JSON, so it can't hold the geometry itself). */
const liteShapes = new Map<string, BufferGeometry>()
export const mirrorShape = (uuid: string) => liteShapes.get(uuid)

export const SPRUCE_GREENS = ['#3F8E6E', '#4C9E78', '#357F63', '#2F7A5E', '#58A884', '#46927A', '#3C8A72', '#5AAE7E']

function kinds() {
  const spruce: Kind = { geo: conifer(9, 5, 0.27, 1), lite: conifer(9, 3, 0.27, 1, 5), h: 9, px: 1.5, colors: SPRUCE_GREENS }
  const fir: Kind = { geo: conifer(11, 6, 0.17, 4, 7), lite: conifer(11, 3, 0.17, 4, 5), h: 11, px: 1.5, colors: ['#2E7461', '#36806A', '#2A6B5C', '#3F8A70', '#327866'] }
  // The larch: a soft spruce shape that turns gold (only a few, high up: a splash of color like the Nan forest's pink).
  const larch: Kind = { geo: conifer(8, 4, 0.25, 7), lite: conifer(8, 3, 0.25, 7, 5), h: 8, px: 1.5, colors: ['#F2C14E', '#F5D06A', '#E9B648', '#F7C95C'] }
  // The far forest up the slopes: three skirts, no line.
  const far: Kind = { geo: conifer(9, 3, 0.3, 9, 6), lite: conifer(9, 2, 0.3, 9, 5), h: 9, px: 0, colors: ['#4C8E74', '#3F8268', '#5A9A7A', '#477F6C'] }
  // An aspen: a white trunk with dark eyes, a lumpy round crown.
  const aspenParts: BufferGeometry[] = [plantPart(new CylinderGeometry(0.13, 0.18, 4.4, 6, 1, true), '#EEE9DF', 0, { at: [0, 2.2, 0] })]
  for (let i = 0; i < 2; i++) aspenParts.push(plantPart(new CylinderGeometry(0.19, 0.19, 0.12, 5, 1, true), '#4E4252', 0, { at: [0, 1 + i * 1.4, 0], rot: [0, i, 0], scale: [1, 1, 0.5] }))
  aspenParts.push(
    leafBlob(1.5, '#FFFFFF', [0, 5.6, 0], [1, 1.25, 1], 3),
    leafBlob(1.15, '#E3EBDB', [0.95, 4.7, 0.3], [1, 1.15, 1], 4),
    leafBlob(1.1, '#DCE5D4', [-0.85, 4.8, -0.4], [1, 1.15, 1], 5),
  )
  const aspen: Kind = { geo: joinParts(aspenParts), h: 7.2, px: 1.4, colors: ['#8CC762', '#9BD06A', '#7DBE5E', '#A6D774', '#F2D25E'] }
  const shrub: Kind = {
    geo: joinParts([leafBlob(0.8, '#FFFFFF', [0, 0.7, 0], [1.2, 0.85, 1.1], 30, [6, 4]), leafBlob(0.62, '#E2EADA', [0.7, 0.5, 0.25], [1, 0.85, 1], 31, [5, 3]), leafBlob(0.58, '#DCE5D3', [-0.6, 0.45, -0.35], [1, 0.85, 1], 32, [5, 3])]),
    h: 1.5,
    px: 1.3,
    small: true,
    colors: ['#5E9E62', '#6FAE66', '#4F9160', '#7BB86A'],
  }
  // Fireweed: a bunch of tall stems, each with a spike of pink flowers (Canada's summer meadows are full of it).
  const weed: BufferGeometry[] = []
  for (let i = 0; i < 4; i++) {
    const a = i * 2.39
    const r = 0.12 + (i % 3) * 0.1
    const L = 0.9 + (i % 4) * 0.14
    const lean = 0.06 + (i % 2) * 0.08
    weed.push(plantPart(new CylinderGeometry(0.02, 0.03, L, 4), '#5E9A5A', 0, { at: [Math.sin(a) * r, L / 2, Math.cos(a) * r], rot: [lean, a, 0] }))
    weed.push(plantPart(new ConeGeometry(0.09, 0.5, 6), i % 2 ? '#FFFFFF' : '#F0E4EC', 1, { at: [Math.sin(a) * (r + lean * L), L + 0.18, Math.cos(a) * (r + lean * L)], rot: [lean, a, 0] }))
    weed.push(plantPart(new ConeGeometry(0.06, 0.3, 4), '#6FAE66', 0, { at: [Math.sin(a) * r * 0.6, 0.25, Math.cos(a) * r * 0.6], rot: [0.9, a + 1, 0], scale: [1, 1, 0.3] }))
  }
  const fireweed: Kind = { geo: joinParts(weed), h: 1.4, px: 0, small: true, colors: ['#FF8FC8', '#F27BB8', '#FF9FD0', '#E86DB2', '#FFA8D8'] }
  const blades: BufferGeometry[] = []
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 2) * 0.35
    const lean = 0.12 + (i % 3) * 0.17
    const L = 0.7 + (i % 4) * 0.1
    blades.push(plantPart(new ConeGeometry(0.05, L, 3), i % 2 ? '#FFFFFF' : '#E8EFD8', 1, { at: [Math.sin(a) * Math.sin(lean) * L * 0.5, Math.cos(lean) * L * 0.5, Math.cos(a) * Math.sin(lean) * L * 0.5], rot: [lean, a, 0], scale: [1, 1, 0.4] }))
  }
  const tuft: Kind = { geo: joinParts(blades), h: 0.9, px: 0, small: true, colors: ['#9FD27C', '#8CC771', '#B2DA86', '#C9D98A'] }
  // Boulders and pebbles: faceted rock with a mossy or snowy top (`boulderGeometry`), tinted per rock.
  const boulder: Kind = { geo: boulderGeometry(11, true), h: 1.2, px: 1.4, colors: ['#B6AEC4', '#A9A1BA', '#9E95B0', '#BDB6CA', '#A39BB4'] }
  const pebble: Kind = { geo: boulderGeometry(23, false, 0), h: 1, px: 0, small: true, colors: ['#CFC8DA', '#BDB5CC', '#D8D2E2', '#B4ABC4', '#E2DCE8'] }
  return { spruce, fir, larch, far, aspen, shrub, fireweed, tuft, boulder, pebble }
}
export type PlantKind = keyof ReturnType<typeof kinds>

/** A faceted boulder about 1 m across and 0.65 m tall, sitting on y = 0: a lumpy icosahedron with a flat bottom, flat
 *  shaded so every facet catches the light on its own. `moss`: the facets facing up are green (tint 0). */
export function boulderGeometry(seed: number, moss: boolean, detail = 1) {
  const g = new IcosahedronGeometry(1, detail)
  const p = g.attributes.position
  const v = new Vector3()
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const k = 1 + 0.2 * bumps(v.x * 1.6, v.y * 1.6, v.z * 1.6, seed)
    v.multiplyScalar(k)
    v.y = Math.max(v.y * 0.68, -0.25) + 0.25
    p.setXYZ(i, v.x * 0.55, v.y * 0.62, v.z * 0.5)
  }
  g.deleteAttribute('uv')
  g.computeVertexNormals()
  const n = g.attributes.normal
  const col = new Float32Array(p.count * 3)
  const tint = new Float32Array(p.count)
  const mossC = new Color('#7FB873')
  const rock = [new Color('#FFFFFF'), new Color('#E6E1EC'), new Color('#D2CCDC')]
  // Per facet (three corners at a time): up-facing facets get the moss, the rest a light or a darker face of rock.
  for (let f = 0; f < p.count; f += 3) {
    const ny = (n.getY(f) + n.getY(f + 1) + n.getY(f + 2)) / 3
    const up = moss && ny > 0.8 && bumps(p.getX(f) * 4, 0, p.getZ(f) * 4, seed) > -0.2
    const c = up ? mossC : rock[ny > 0.2 ? 0 : ny > -0.4 ? 1 : 2]
    for (let j = 0; j < 3; j++) {
      col.set([c.r, c.g, c.b], (f + j) * 3)
      tint[f + j] = up ? 0 : 1
    }
  }
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.setAttribute('tint', new BufferAttribute(tint, 1))
  return g
}

/** A boulder as a merge-able part (geo.ts: position, normal, color), `size` meters across, in `color`. */
export function rockPart(size: number, color: string, seed: number, o: PartOpts = {}, moss = false) {
  const g = boulderGeometry(seed, moss)
  // (The tint picks the rock's color for the rock facets; the moss keeps its own.)
  const c = new Color(color)
  const col = g.attributes.color
  const tint = g.attributes.tint
  for (let i = 0; i < col.count; i++) if (tint.getX(i) > 0.5) col.setXYZ(i, col.getX(i) * c.r, col.getY(i) * c.g, col.getZ(i) * c.b)
  g.deleteAttribute('tint')
  const s = o.scale ?? [1, 1, 1]
  const geo = bake(g, '#ffffff', { ...o, scale: [s[0] * size, s[1] * size, s[2] * size] })
  // (bake paints every corner one color: put the facet colors back.)
  geo.setAttribute('color', col)
  return geo
}

/** Plants and rocks placed round the lake, then built as one InstancedMesh per kind (and an ink line for the near
 *  ones). The hulls are marked like engine hulls (`userData.hull`) and the small plants `userData.noMirror`, so the
 *  lake's reflection leaves them out. */
export class Grove {
  private readonly K = kinds()
  private readonly placed = new Map<PlantKind, { m: Matrix4; c: Color; ink: boolean }[]>()
  private readonly q = new Quaternion()
  private readonly up = new Vector3(0, 1, 0)
  constructor(private readonly rand: () => number) {}
  /** A plant of `kind` standing at (x, y, z), `k` times its size, squashed or stretched `sy` tall, inked or not. */
  add(kind: PlantKind, x: number, y: number, z: number, k: number, o: { sy?: number; ink?: boolean; color?: string; tilt?: V3 } = {}) {
    const K = this.K[kind]
    const c = new Color(o.color ?? K.colors[Math.floor(this.rand() * K.colors.length)])
    c.offsetHSL((this.rand() - 0.5) * 0.025, 0, (this.rand() - 0.5) * 0.07)
    this.q.setFromAxisAngle(this.up, this.rand() * Math.PI * 2)
    const list = this.placed.get(kind) ?? []
    list.push({ m: new Matrix4().compose(new Vector3(x, y - 0.12 * k, z), this.q, new Vector3(k, k * (o.sy ?? 0.9 + this.rand() * 0.2), k)), c, ink: (o.ink ?? true) && K.px > 0 })
    this.placed.set(kind, list)
  }
  count(kind: PlantKind) {
    return this.placed.get(kind)?.length ?? 0
  }
  build(bag: Bag) {
    const root = new Group()
    const mat = tintedToon()
    for (const [id, all] of this.placed) {
      const kind = this.K[id]
      const geo = bag.add(kind.geo)
      for (const ink of [true, false]) {
        const list = all.filter((p) => p.ink === ink)
        if (!list.length) continue
        const mesh = bag.add(new InstancedMesh(geo, mat, list.length))
        list.forEach((p, i) => {
          mesh.setMatrixAt(i, p.m)
          mesh.setColorAt(i, p.c)
        })
        mesh.computeBoundingSphere()
        mesh.userData.noMirror = !!kind.small
        if (kind.lite) {
          liteShapes.set(kind.lite.uuid, bag.add(kind.lite))
          mesh.userData.mirrorGeo = kind.lite.uuid
        }
        root.add(mesh)
        if (ink) {
          const hull = bag.add(new InstancedMesh(bag.add(hullGeometry(kind.geo)), instancedOutlineMaterial(kind.px), list.length))
          hull.instanceMatrix = mesh.instanceMatrix
          hull.computeBoundingSphere()
          hull.userData.hull = kind.px
          hull.raycast = () => {}
          root.add(hull)
        }
      }
    }
    for (const id of Object.keys(this.K) as PlantKind[])
      if (!this.placed.has(id)) {
        this.K[id].geo.dispose()
        this.K[id].lite?.dispose()
      }
    root.userData.counts = Object.fromEntries([...this.placed].map(([id, l]) => [id, l.length]))
    return root
  }
}

/** The colors of a crag: light and dark rock, snow, and (low down on the forested mountains) the green of the trees. */
export interface CragLook {
  rock: string
  dark: string
  snow: string
  /** Where the snow starts (0 the foot, 1 the top); above 1, none. Snow also lies lower in gullies and on ledges. */
  snowLine: number
  /** Green up to here (0: bare rock). */
  forest?: number
  green?: string
}

/** A jagged mountain `r` wide and `h` tall standing on y = 0: a many-sided cone pushed in and out into ridges and
 *  buttresses, its top bent over a little, flat shaded, painted facet by facet (snow by height, deeper in the gullies
 *  and on flat ledges; dark rock on the faces turned away; green low down). A merge-able part. */
export function cragPart(r: number, h: number, seed: number, look: CragLook, o: PartOpts = {}, seg = 9) {
  const rows = 7
  const g = new ConeGeometry(r, h, seg, rows).toNonIndexed()
  const p = g.attributes.position
  const v = new Vector3()
  const lean = (Math.sin(seed * 3.1) * 0.12 + 0.04) * r
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i)
    const t = (v.y + h / 2) / h
    if (t > 0.999) {
      p.setXYZ(i, lean, v.y, 0)
      continue
    }
    const a = Math.atan2(v.z, v.x)
    // Ridges (a few big ones, sharper near the top), lumps, and a lean toward one side.
    const ridge = 0.16 * Math.abs(Math.sin(a * 2.5 + seed)) + 0.1 * Math.sin(a * 5 + seed * 2.1) * (1 - t)
    const lump = 0.14 * bumps(Math.cos(a) * 2, t * 5, Math.sin(a) * 2, seed)
    const k = Math.max(0.2, 1 + ridge + lump)
    p.setXYZ(i, v.x * k + lean * t * t, v.y + (t > 0.02 ? 0.04 * h * bumps(a * 3, t * 4, 0, seed + 1) * (1 - t) : 0), v.z * k)
  }
  g.deleteAttribute('uv')
  g.computeVertexNormals()
  const n = g.attributes.normal
  const col = new Float32Array(p.count * 3)
  const snow = new Color(look.snow)
  const rock = new Color(look.rock)
  const dark = new Color(look.dark)
  const green = new Color(look.green ?? '#6FA285')
  const c = new Color()
  for (let f = 0; f < p.count; f += 3) {
    const t = (p.getY(f) + p.getY(f + 1) + p.getY(f + 2)) / 3 / h + 0.5
    const ny = (n.getY(f) + n.getY(f + 1) + n.getY(f + 2)) / 3
    const nx = (n.getX(f) + n.getX(f + 1) + n.getX(f + 2)) / 3
    const wob = 0.08 * bumps(p.getX(f) * 0.3, t * 6, p.getZ(f) * 0.3, seed)
    // Snow above the line, lower where the face is flatter (ledges and gullies hold it).
    const line = look.snowLine - (ny > 0.55 ? 0.22 : ny > 0.4 ? 0.1 : 0) + wob
    if (t > line) c.copy(snow)
    else if (look.forest && t < look.forest + wob) c.copy(green).multiplyScalar(nx > 0.2 ? 0.88 : 1)
    else c.copy(nx + Math.sin(seed) * 0.2 > 0.15 ? dark : rock)
    for (let j = 0; j < 3; j++) col.set([c.r, c.g, c.b], (f + j) * 3)
  }
  const geo = bake(g, '#ffffff', o)
  geo.setAttribute('color', new BufferAttribute(col, 3))
  return geo
}
