// See-through for an open world: whatever stands between the camera and Kaylee (a palm's crown, the forest on the
// hill behind the beach, the pier's shelter) melts away in a soft screen-door dither, outline and all, so she never
// disappears behind the scenery. The island's own toon and outline materials are swapped for these (the ground and
// the characters keep theirs); island.ts moves `eye` and `focus` every frame.
import { BackSide, Color, Mesh, MeshToonMaterial, ShaderMaterial, Vector3, type Material, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { outlineMaterial } from '../../../../../engine3d/outline'
import { toon, toonGradient } from '../../../../../engine3d/toon'
import { lookMaterial } from './look'

/** Shared by both materials: the camera, what it looks at, and how wide the see-through tube is (m). */
export const SEE = { uEye: { value: new Vector3() }, uFocus: { value: new Vector3() }, uSeeR: { value: 1.7 } }

const pars = /* glsl */ `
  uniform vec3 uEye;
  uniform vec3 uFocus;
  uniform float uSeeR;
  varying vec3 vSeeW;
  // An ordered (Bayer) screen door: an even, quiet see-through pattern instead of noise.
  float seeB2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float seeB4(vec2 a) { return seeB2(0.5 * a) * 0.25 + seeB2(a); }
  void seeThrough() {
    // Right in front of the lens (a crown the camera passes through): gone, so it never looks into a shape.
    float near = distance(vSeeW, uEye);
    if (near < 5.5 && seeB4(gl_FragCoord.xy) < 1.0 - smoothstep(3.5, 5.5, near)) discard;
    vec3 d = uFocus - uEye;
    float L = length(d);
    vec3 dir = d / max(L, 1e-3);
    float t = dot(vSeeW - uEye, dir);
    if (t < 0.0 || t > L - 1.6) return;
    float r = length(vSeeW - (uEye + dir * t));
    // Wider near the camera, narrowing to her.
    float R = uSeeR * (1.0 + 0.6 * (1.0 - t / L));
    float k = (1.0 - smoothstep(R * 0.5, R, r)) * smoothstep(0.0, 2.0, L - 1.6 - t);
    if (k > 0.0 && seeB4(gl_FragCoord.xy) < k * 0.8) discard;
  }
`

const toonSee = new Map<boolean, Material>()
/** The island's vertex-color toon material, see-through (with the look's cloud shadows; `sway`: the plants'). */
export function seeToon(bag: Bag, sway = false) {
  const had = toonSee.get(sway)
  if (had) return had
  const m = new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, SEE)
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>', '#include <project_vertex>\nvSeeW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\n${pars}`).replace('void main() {', 'void main() {\n  seeThrough();')
  }
  m.customProgramCacheKey = () => 'samet-see'
  const out = lookMaterial(bag, { plants: sway, base: m })
  toonSee.set(sway, out)
  return out
}

const outlines = new Map<number, ShaderMaterial>()
/** The ink outline (engine3d/outline.ts) of the same width, see-through. */
export function seeOutline(px: number, bag: Bag) {
  let m = outlines.get(px)
  if (m) return m
  const base = outlineMaterial(px)
  m = bag.add(
    new ShaderMaterial({
      uniforms: { ...base.uniforms, ...SEE, uColor: { value: new Color().copy(base.uniforms.uColor.value as Color) } },
      vertexShader: base.vertexShader.replace('void main() {', 'varying vec3 vSeeW;\nvoid main() {\n  vSeeW = (modelMatrix * vec4(position, 1.0)).xyz;'),
      fragmentShader: base.fragmentShader.replace('uniform vec3 uColor;', `uniform vec3 uColor;\n${pars}`).replace('void main() {', 'void main() {\n  seeThrough();'),
      side: BackSide,
      fog: true,
    }),
  )
  outlines.set(px, m)
  return m
}

/** Swaps the shared toon material and the outlines under `root` for the see-through ones (except `keep`). */
export function makeSeeThrough(root: Object3D, bag: Bag, keep: Set<Object3D>) {
  const plain = toon('#ffffff', true)
  root.traverse((o) => {
    if (!(o instanceof Mesh) || keep.has(o)) return
    if (o.userData.sway) o.material = seeToon(bag, true)
    else if (o.material === plain) o.material = seeToon(bag)
    else if (typeof o.userData.hull === 'number' && !o.userData.hullBias) o.material = seeOutline(o.userData.hull, bag) as Material
  })
  // (Clouds wouldn't be cut: their materials are their own.)
  for (const m of outlines.values()) {
    m.uniforms.uEye = SEE.uEye
    m.uniforms.uFocus = SEE.uFocus
    m.uniforms.uSeeR = SEE.uSeeR
  }
}
