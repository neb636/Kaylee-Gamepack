// Ink outlines like the 2D art: an "inverted hull", a copy of the shape drawn back-faces-only and pushed outward in
// screen space, so the line is about the same number of pixels wide near and far (a little thinner far away). The hull
// uses welded, smoothed normals, so boxes get a continuous line instead of cracks at their corners. Lines fade into the
// scene's fog like the shapes they outline (the bay's far rock towers).
import { BackSide, Color, Mesh, ShaderMaterial, UniformsLib, UniformsUtils, type BufferGeometry } from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PAL } from './toon'
import { TUNE } from './tune'

/** Shared by every outline material: the canvas size in CSS pixels, the global width multiplier and the fog. */
const shared = { uRes: { value: [1, 1] as [number, number] }, uScale: { value: 1 }, ...UniformsUtils.clone(UniformsLib.fog) }
export function setOutlineResolution(w: number, h: number) {
  shared.uRes.value = [Math.max(1, w), Math.max(1, h)]
  shared.uScale.value = TUNE.outline
}

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  uniform vec2 uRes;
  uniform float uPx;
  uniform float uScale;
  uniform float uBias;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Slid toward the camera along its own view ray (same spot on screen, only nearer), so a line where one piece
    // rests on another (bangs on the forehead) isn't hidden by the surface it rests on.
    mvPosition.xyz -= normalize(mvPosition.xyz) * uBias;
    vec4 clip = projectionMatrix * mvPosition;
    vec3 n = normalMatrix * normal;
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    // Thinner lines on things far away (the street from the arrival camera), never thicker than uPx.
    float w = uPx * uScale * clamp(14.0 / max(clip.w, 1.0), 0.55, 1.0);
    clip.xy += dir * w * 2.0 / uRes * clip.w;
    gl_Position = clip;
    #include <fog_vertex>
  }
`
const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <fog_fragment>
  }
`

const materials = new Map<string, ShaderMaterial>()
/** One outline material per width, color and bias (meters the line is drawn nearer the camera), shared by every hull
 *  that uses it. */
export function outlineMaterial(px: number, color: string = PAL.ink, bias = 0) {
  const key = `${px}|${color}|${bias}`
  let m = materials.get(key)
  if (!m) {
    m = new ShaderMaterial({
      uniforms: { ...shared, uPx: { value: px }, uColor: { value: new Color(color) }, uBias: { value: bias } },
      vertexShader,
      fragmentShader,
      side: BackSide,
      fog: true,
    })
    materials.set(key, m)
  }
  return m
}

/** The welded copy of a shape that the outline is drawn from (dispose it with the shape). */
export function hullGeometry(geometry: BufferGeometry) {
  const g = geometry.clone()
  for (const name of Object.keys(g.attributes)) if (name !== 'position') g.deleteAttribute(name)
  const welded = mergeVertices(g, 1e-3)
  g.dispose()
  welded.computeVertexNormals()
  return welded
}

/** An outline mesh for `geometry`, to add next to (or inside) the mesh it outlines. */
export function makeHull(geometry: BufferGeometry, px: number) {
  const hull = new Mesh(hullGeometry(geometry), outlineMaterial(px))
  hull.userData.hull = px
  return hull
}

/** Hot-pink outline while the mouse hovers something tappable (desktop), back to ink after. */
export function setHullHighlight(hull: Mesh, on: boolean) {
  const px = hull.userData.hull as number | undefined
  if (px !== undefined) hull.material = outlineMaterial(px, on ? PAL.hotpink : PAL.ink, hull.userData.hullBias ?? 0)
}
