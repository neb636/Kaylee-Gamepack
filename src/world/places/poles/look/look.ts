// The Poles' finishing touches on the toon look (the Koh Samet island's look.ts, made for snow and ice), as small
// additions to the shared toon shader (still flat bands, no post-processing):
//   - cloud shade: soft lavender patches drifting across the ice, the snow and everyone on it,
//   - snow: a faint blue dappling on anything snow-white facing up, so a field of snow isn't one flat white,
//   - glints: tiny pastel sparkles (ice blue, pink, gold) that wink in and out on the snow as the camera moves,
// all from one clock (`POLAR.uTime`), which the sky (sky.ts) sets each frame.
//
// `dress(root)` swaps the shared vertex-color toon material (engine3d/toon.ts `toon('#ffffff', true)`, what
// engine3d/geo.ts `solid` gives every toy shape) for this one on everything under `root`, so a world built with the
// usual kit gets the look by calling it once when it's built.
import { Mesh, MeshToonMaterial, type Material, type Object3D } from 'three'
import { toon, toonGradient } from '../../../engine3d/toon'

/** The look's shared uniforms: the clock, how strong the cloud shade is, how much the snow glints. */
export const POLAR = { uTime: { value: 0 }, uShade: { value: 1 }, uGlint: { value: 1 } }

const pars = /* glsl */ `
  uniform float uTime;
  uniform float uShade;
  uniform float uGlint;
  varying vec3 vPolarW;
  varying vec3 vPolarN;
  float polarHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float polarNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(polarHash(i), polarHash(i + vec2(1.0, 0.0)), u.x), mix(polarHash(i + vec2(0.0, 1.0)), polarHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // Big soft cloud shapes drifting with the wind (0 = in the sun, 1 = under a cloud).
  float polarCloud(vec2 p) {
    vec2 q = p * 0.02 + vec2(uTime * 0.011, uTime * 0.005);
    float n = polarNoise(q) * 0.65 + polarNoise(q * 2.3 + 7.1) * 0.35;
    return smoothstep(0.62, 0.74, n);
  }
`

/** The cloud shade on its own (the sea draws the same clouds, so they drift off the ice onto the water). */
export const CLOUD_GLSL = pars

let shared: MeshToonMaterial | null = null
/** The vertex-color toon material with the polar touches (one for every world: like toon(), never disposed). */
export function polarMaterial(): Material {
  if (shared) return shared
  const m = new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() })
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, POLAR)
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\n${pars}`)
      .replace('#include <defaultnormal_vertex>', '#include <defaultnormal_vertex>\n#ifdef USE_INSTANCING\n  vPolarN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * objectNormal);\n#else\n  vPolarN = normalize(mat3(modelMatrix) * objectNormal);\n#endif')
      .replace('#include <project_vertex>', '#include <project_vertex>\n#ifdef USE_INSTANCING\n  vPolarW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;\n#else\n  vPolarW = (modelMatrix * vec4(transformed, 1.0)).xyz;\n#endif')
    s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>\n${pars}`).replace(
      '#include <opaque_fragment>',
      `{
      float cs = polarCloud(vPolarW.xz) * uShade;
      // Snow: near-white, not warm (Pola's cream fur stays as it is), facing the sky.
      float snowy = smoothstep(0.86, 0.95, min(vColor.r, min(vColor.g, vColor.b))) * step(vColor.r, vColor.b + 0.02) * smoothstep(0.55, 0.85, vPolarN.y);
      float dapple = polarNoise(vPolarW.xz * 0.35) * 0.6 + polarNoise(vPolarW.xz * 1.1 + 3.0) * 0.4;
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.9, 0.94, 1.0), snowy * smoothstep(0.45, 0.85, dapple) * 0.8);
      // Glints: one cell in many holds a tiny star that winks; nearer ones only (no shimmer far off).
      vec2 cell = floor(vPolarW.xz * 2.6);
      float h = polarHash(cell);
      vec2 f = fract(vPolarW.xz * 2.6) - 0.5 + (vec2(polarHash(cell + 3.1), polarHash(cell + 7.7)) - 0.5) * 0.5;
      float star = smoothstep(0.11, 0.0, length(f)) + smoothstep(0.035, 0.0, abs(f.x)) * smoothstep(0.2, 0.0, abs(f.y)) * 0.6 + smoothstep(0.035, 0.0, abs(f.y)) * smoothstep(0.2, 0.0, abs(f.x)) * 0.6;
      float wink = max(0.0, sin(uTime * (1.2 + h * 2.6) + h * 50.0 + (cameraPosition.x + cameraPosition.z) * 0.6));
      float near = 1.0 - smoothstep(9.0, 26.0, distance(cameraPosition, vPolarW));
      vec3 glint = h > 0.985 ? vec3(1.0, 0.86, 0.5) : h > 0.975 ? vec3(1.0, 0.7, 0.85) : vec3(0.62, 0.88, 1.0);
      float g = step(0.965, h) * min(1.0, star) * wink * near * snowy * (1.0 - cs * 0.6) * uGlint;
      outgoingLight = mix(outgoingLight, glint, g);
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.86, 0.85, 0.97), cs);
    }
    #include <opaque_fragment>`,
    )
  }
  m.customProgramCacheKey = () => 'polar-look'
  shared = m
  return m
}

/** Gives everything under `root` built with the shared toon material the polar look instead (call once it's built;
 *  anything added later can be dressed too). */
export function dress(root: Object3D) {
  const plain = toon('#ffffff', true)
  const look = polarMaterial()
  root.traverse((o) => {
    if (o instanceof Mesh && o.material === plain) o.material = look
  })
}
