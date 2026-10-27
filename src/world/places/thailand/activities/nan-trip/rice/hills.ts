// The farm's rice: every hill in the four paddies as instances of three shapes (one draw call each, plus an ink
// outline each): a clump of leaf blades (a seedling, then young, tall, and golden, all one shape scaled and recolored),
// the grain heads that come out on top and droop as they ripen, and the short stubble left when she cuts it. Each hill's
// look is set by rice3d.ts every frame: how big, which way it leans (wind, a droopy dry seedling, Kaylee wading past),
// and its colors.
import { Color, InstancedMesh, Matrix4, Quaternion, ShaderMaterial, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P } from '../../../../../engine3d/geo'
import { hullGeometry, outlineMaterial } from '../../../../../engine3d/outline'
import { toon } from '../../../../../engine3d/toon'

// The outline of an instanced shape: the engine's inverted hull, moved by each instance's matrix.
const hullVertex = /* glsl */ `
  uniform vec2 uRes;
  uniform float uPx;
  uniform float uScale;
  void main() {
    mat4 m = modelMatrix * instanceMatrix;
    vec4 mvPosition = viewMatrix * m * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;
    vec3 n = mat3(viewMatrix) * mat3(m) * normal;
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    float w = uPx * uScale * clamp(14.0 / max(clip.w, 1.0), 0.55, 1.0);
    clip.xy += dir * w * 2.0 / uRes * clip.w;
    gl_Position = clip;
  }
`
const hullFragment = /* glsl */ `
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <colorspace_fragment>
  }
`

function instancedHull(geo: BufferGeometry, count: number, px: number, bag: Bag) {
  const base = outlineMaterial(px)
  const mat = bag.add(new ShaderMaterial({ uniforms: { uRes: base.uniforms.uRes, uScale: base.uniforms.uScale, uPx: { value: px }, uColor: base.uniforms.uColor }, vertexShader: hullVertex, fragmentShader: hullFragment, side: base.side }))
  const hull = new InstancedMesh(bag.add(hullGeometry(geo)), mat, count)
  hull.frustumCulled = false
  return hull
}

/** One shape for many hills: the toon mesh and its outline, moved together. */
export class Instanced {
  readonly mesh: InstancedMesh
  readonly hull: InstancedMesh
  constructor(geo: BufferGeometry, count: number, px: number, bag: Bag) {
    this.mesh = new InstancedMesh(bag.add(geo), toon('#ffffff', true), count)
    this.mesh.frustumCulled = false
    this.hull = instancedHull(geo, count, px, bag)
    this.hull.visible = px > 0
    for (let i = 0; i < count; i++) this.mesh.setColorAt(i, new Color('#ffffff'))
  }
  set(i: number, m: Matrix4, c?: Color) {
    this.mesh.setMatrixAt(i, m)
    this.hull.setMatrixAt(i, m)
    if (c) this.mesh.setColorAt(i, c)
  }
  done() {
    this.mesh.instanceMatrix.needsUpdate = true
    this.hull.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
  dispose() {
    this.mesh.dispose()
    this.hull.dispose()
  }
}

/** A clump of leaf blades, 1 m tall (scaled down to a seedling): flat tapering leaves fanning out from the base. */
export function bladesGeometry() {
  const parts: BufferGeometry[] = []
  const n = 11
  for (let i = 0; i < n; i++) {
    const turn = (i / n) * Math.PI * 2 + (i % 2) * 0.3
    const tilt = i < 2 ? 0.04 : 0.1 + (i % 3) * 0.07
    const h = i < 2 ? 1 : 0.74 + ((i * 37) % 10) * 0.024
    const r = 0.035 + Math.sin(tilt) * h * 0.5
    // (A flattened 4-sided cone: a leaf, its flat side facing out from the clump.)
    parts.push(P.cone(0.042, h, '#ffffff', { at: [Math.sin(turn) * r, h / 2, Math.cos(turn) * r], rot: [Math.cos(turn) * tilt, turn, -Math.sin(turn) * tilt], scale: [1, 1, 0.34] }, 4))
  }
  return merge(parts)
}

/** The grain heads on a 1 m clump: three panicles rising out of the top and bending over, fat beads of grain along
 *  them. */
export function headsGeometry() {
  const parts: BufferGeometry[] = []
  for (let k = 0; k < 3; k++) {
    const turn = (k / 3) * Math.PI * 2 + 0.5
    const dx = Math.sin(turn)
    const dz = Math.cos(turn)
    for (let j = 0; j < 5; j++) {
      // An arc: up out of the clump, then over and down.
      const a = 0.35 + j * 0.42
      const out = 0.04 + Math.sin(a) * 0.15
      const y = 0.9 + Math.cos(a) * 0.13
      const s = 0.05 - j * 0.004
      parts.push(P.sphere(s, '#ffffff', { at: [dx * out, y, dz * out], scale: [1, 1.35, 1] }, 7))
    }
  }
  return merge(parts)
}

/** What's left after the sickle: a ring of short cut stalks, 1 m tall (scaled to a few centimeters). */
export function stubbleGeometry() {
  const parts: BufferGeometry[] = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    parts.push(P.cyl(0.018, 0.022, 1, '#ffffff', { at: [Math.sin(a) * 0.06, 0.5, Math.cos(a) * 0.06], rot: [Math.cos(a) * 0.15, 0, -Math.sin(a) * 0.15] }, 5))
  }
  return merge(parts)
}

const q = new Quaternion()
const spin = new Quaternion()
const axis = new Vector3()
const at = new Vector3()
const scl = new Vector3()
/** A hill's matrix: standing at (x, y, z), `w` wide and `h` tall, leaning `lx`/`lz` radians (toward +x / +z). */
export function hillMatrix(m: Matrix4, x: number, y: number, z: number, w: number, h: number, lx: number, lz: number, turn: number) {
  const tilt = Math.hypot(lx, lz)
  // (Lean toward +x is a turn about -z, toward +z a turn about +x.)
  if (tilt > 1e-4) q.setFromAxisAngle(axis.set(lz / tilt, 0, -lx / tilt), tilt)
  else q.identity()
  q.multiply(spin.setFromAxisAngle(axis.set(0, 1, 0), turn))
  return m.compose(at.set(x, y, z), q, scl.set(w, Math.max(1e-4, h), w))
}
