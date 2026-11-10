// See-through for an open world: whatever stands between the camera and Kaylee (a palm's crown, the forest on the
// hill behind the beach, the pier's shelter) opens in a clean round hole around her, with a thin soft rim, outline and
// all, so she never disappears behind the scenery. The island's own toon and outline materials are swapped for these
// (the ground and the characters keep theirs, so the family never melts); island.ts moves `eye` and `focus` every frame.
//
// The hole is a cone from the lens to her: every point on one pixel's line of sight gets the same cut, so a crown's
// near side and the far side of its ink hull behind it go together. (#357: measured along the eye-to-her line instead,
// the near side was cut more than the far side's black hull, which showed through as a big dark smudge; and a hole
// that left a fifth of each crown as a screen-door dither made the trees banded and the family look ghosted.)
import { BackSide, Color, Mesh, MeshToonMaterial, ShaderMaterial, Vector3, type Material, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { outlineMaterial } from '../../../../../engine3d/outline'
import { toon, toonGradient } from '../../../../../engine3d/toon'
import { lookMaterial } from './look'

/** Shared by both materials: the camera, what it looks at, and the hole's radius around her (m). */
export const SEE = { uEye: { value: new Vector3() }, uFocus: { value: new Vector3() }, uSeeR: { value: 1.7 } }

const pars = /* glsl */ `
  uniform vec3 uEye;
  uniform vec3 uFocus;
  uniform float uSeeR;
  varying vec3 vSeeW;
  // An ordered (Bayer) dither, for the thin rim only.
  float seeB2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
  float seeB4(vec2 a) { return seeB2(0.5 * a) * 0.25 + seeB2(a); }
  // How much of this point is cut (0..1). \`deeper\`, \`deeperNear\`: meters further back the hole round her and the
  // cut at the lens reach (for an outline's far side).
  float seeCut(float deeper, float deeperNear) {
    vec3 v = vSeeW - uEye;
    // Right in front of the lens (a crown the camera passes through): gone, so it never looks into a shape.
    float near = 1.0 - smoothstep(3.8 + deeperNear, 4.6 + deeperNear, length(v));
    vec3 d = uFocus - uEye;
    float L = length(d);
    vec3 dir = d / max(L, 1e-3);
    float t = dot(v, dir);
    if (t <= 0.0) return near;
    // Off the line of sight, as meters at her distance: the same for every point along one pixel's ray.
    float r = length(v - dir * t) * L / max(t, 0.5);
    float R = uSeeR * 1.3;
    float k = (1.0 - smoothstep(R * 0.8, R, r)) * smoothstep(0.0, 0.6, L - 0.9 + deeper - t);
    return max(k, near);
  }
`
// The toon: a clean hole, dithered only across its thin rim.
const cutToon = /* glsl */ `
  {
    float k = seeCut(0.0, 0.0);
    if (k > 0.98 || (k > 0.0 && seeB4(gl_FragCoord.xy) < k)) discard;
  }
`
// Its ink hull: wherever the shape is cut at all, the line goes, a few meters deeper too (its far side, behind the cut
// near side, would otherwise show through as a dark patch). At the lens it reaches a crown's width deeper: with the
// camera in or right by a crown whose near side is gone, its hull's inside would fill the screen with black. (So
// things within about 8 m of the camera have no ink line. No dither: a dotted ink line reads as a smudge.)
const cutHull = /* glsl */ `
  if (seeCut(4.0, 3.5) > 0.0) discard;
`

/** Each world's own see-through materials (in its bag, freed with it: a cache shared by every world would hand the
 *  next one materials an earlier world had disposed). */
const perBag = new WeakMap<Bag, { toon: Map<boolean, Material>; outlines: Map<number, ShaderMaterial> }>()
const mine = (bag: Bag) => {
  let c = perBag.get(bag)
  if (!c) perBag.set(bag, (c = { toon: new Map(), outlines: new Map() }))
  return c
}

/** The island's vertex-color toon material, see-through (with the look's cloud shadows; `sway`: the plants'). */
export function seeToon(bag: Bag, sway = false) {
  const cache = mine(bag).toon
  const had = cache.get(sway)
  if (had) return had
  const m = new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, SEE)
    s.vertexShader = s.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vSeeW;').replace('#include <project_vertex>', '#include <project_vertex>\nvSeeW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\n${pars}`).replace('void main() {', `void main() {\n${cutToon}`)
  }
  m.customProgramCacheKey = () => 'samet-see2'
  const out = lookMaterial(bag, { plants: sway, base: m })
  cache.set(sway, out)
  return out
}

/** The ink outline (engine3d/outline.ts) of the same width, see-through. */
export function seeOutline(px: number, bag: Bag) {
  const cache = mine(bag).outlines
  let m = cache.get(px)
  if (m) return m
  const base = outlineMaterial(px)
  m = bag.add(
    new ShaderMaterial({
      uniforms: { ...base.uniforms, ...SEE, uColor: { value: new Color().copy(base.uniforms.uColor.value as Color) } },
      vertexShader: base.vertexShader.replace('void main() {', 'varying vec3 vSeeW;\nvoid main() {\n  vSeeW = (modelMatrix * vec4(position, 1.0)).xyz;'),
      fragmentShader: base.fragmentShader.replace('uniform vec3 uColor;', `uniform vec3 uColor;\n${pars}`).replace('void main() {', `void main() {\n${cutHull}`),
      side: BackSide,
      fog: true,
    }),
  )
  cache.set(px, m)
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
  for (const m of mine(bag).outlines.values()) {
    m.uniforms.uEye = SEE.uEye
    m.uniforms.uFocus = SEE.uFocus
    m.uniforms.uSeeR = SEE.uSeeR
  }
}
