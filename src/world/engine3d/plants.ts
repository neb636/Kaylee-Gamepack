// Plants drawn many times: each kind of plant is one shape (an InstancedMesh), its leaves tinted per plant and its
// trunk keeping its own brown. Shared by Nan's forest (thailand/trip/road/forest.ts) and Red Canoe's spruce forest
// round the lake (canada/activities/canoe/nature.ts).
//
// A plant is built from `part`s: each part carries a shade (multiplied by the plant's color where `tint` is 1, kept as
// is where it is 0), so one shape gets light and shade baked into it and a different green per plant.
import { BufferAttribute, Color, Euler, Matrix4, MeshToonMaterial, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { toonGradient } from './toon'

export type V3 = [number, number, number]
export interface PlantPartOpts {
  at?: V3
  /** Pitch, yaw, roll (radians), applied yaw last: a part leaning `pitch` toward +z, then turned. */
  rot?: V3
  scale?: V3
}

/** A part of a plant: its shade (multiplied by the plant's color when `tint` is 1) and its place. Kept indexed (the
 *  instanced shapes are drawn thousands of times: shared corners keep them cheap). */
export function plantPart(g: BufferGeometry, shade: string, tint: number, o: PlantPartOpts = {}) {
  for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal') g.deleteAttribute(name)
  const [p, y, r] = o.rot ?? [0, 0, 0]
  g.applyMatrix4(new Matrix4().compose(new Vector3(...(o.at ?? [0, 0, 0])), new Quaternion().setFromEuler(new Euler(p, y, r, 'YXZ')), new Vector3(...(o.scale ?? [1, 1, 1]))))
  const c = new Color(shade)
  const n = g.attributes.position.count
  const col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new BufferAttribute(col, 3))
  g.setAttribute('tint', new BufferAttribute(new Float32Array(n).fill(tint), 1))
  return g
}

/** A lumpy ball of leaves: a low sphere pushed in and out a little (its shading stays round, its edge goes bumpy). */
export function leafBlob(r: number, shade: string, at: V3, scale: V3, seed: number, seg: [number, number] = [6, 4], rot?: V3) {
  const g = new SphereGeometry(r, seg[0], seg[1])
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const y = p.getY(i)
    const z = p.getZ(i)
    const k = 1 + 0.13 * Math.sin((x * 3.1) / r + seed) * Math.cos((z * 2.7) / r + seed * 1.3) + 0.07 * Math.sin((y * 4.3) / r + seed * 0.7)
    p.setXYZ(i, x * k, y * k, z * k)
  }
  return plantPart(g, shade, 1, { at, scale, rot })
}

/** Merges a plant's parts into its one shape (and frees the parts). */
export function joinParts(parts: BufferGeometry[]) {
  const g = mergeGeometries(parts, false)
  for (const p of parts) p.dispose()
  return g!
}

/** The toon look with a per-plant tint: the leaves take the plant's color, the trunk keeps its own (the `tint`
 *  attribute: 1 tinted, 0 not). One material shared by every plant. */
let tinted: MeshToonMaterial | null = null
export function tintedToon() {
  if (tinted) return tinted
  const m = new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float tint;').replace(
      '#include <color_vertex>',
      `vColor = vec3(1.0);
      #ifdef USE_COLOR
        vColor *= color;
      #endif
      #ifdef USE_INSTANCING_COLOR
        vColor *= mix(vec3(1.0), instanceColor.rgb, tint);
      #endif`,
    )
  }
  m.customProgramCacheKey = () => 'tinted-toon'
  return (tinted = m)
}
