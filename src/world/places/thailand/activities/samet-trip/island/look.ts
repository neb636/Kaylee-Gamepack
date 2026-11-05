// Koh Samet's finishing touches, as small additions to the toon shaders (still flat bands, no post-processing):
//   - cloud shadows: soft lavender patches that drift across the island and the trees with the wind,
//   - sway: leaves, fronds and grass (anything green) move in the sea breeze, a little out of step with each other,
//   - twinkles: the crystal sand (anything near-white on the ground) glints here and there as she walks,
// all from one shared clock (`LOOK.uTime`), set by whoever owns the scene each frame.
import { MeshToonMaterial, type Material } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'

export const LOOK = { uTime: { value: 0 }, uShade: { value: 1 }, uWind: { value: 1 } }

const pars = /* glsl */ `
  uniform float uTime;
  uniform float uShade;
  uniform float uWind;
  varying vec3 vLookW;
  float lookHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float lookNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(lookHash(i), lookHash(i + vec2(1.0, 0.0)), u.x), mix(lookHash(i + vec2(0.0, 1.0)), lookHash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  // Big soft cloud shapes drifting with the breeze (0 = sun, 1 = under a cloud).
  float cloudShade(vec2 p) {
    vec2 q = p * 0.018 + vec2(uTime * 0.012, uTime * 0.006);
    float n = lookNoise(q) * 0.65 + lookNoise(q * 2.3 + 7.1) * 0.35;
    return smoothstep(0.6, 0.72, n);
  }
`

/** A vertex-color toon material with the look's touches (`ground`: twinkles; `plants`: sway). */
export function lookMaterial(bag: Bag, o: { ground?: boolean; plants?: boolean; base?: MeshToonMaterial }) {
  const m = o.base ?? new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() })
  const prev = m.onBeforeCompile
  m.onBeforeCompile = (s, r) => {
    prev?.call(m, s, r)
    Object.assign(s.uniforms, LOOK)
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\n${pars}`)
      .replace(
        '#include <begin_vertex>',
        o.plants
          ? `#include <begin_vertex>
    {
      vec3 wp = (modelMatrix * vec4(transformed, 1.0)).xyz;
      // Green things sway (fronds, crowns, grass); trunks and everything else stay put.
      float leaf = smoothstep(0.04, 0.14, color.g - max(color.r, color.b));
      float ph = uTime * 1.6 + wp.x * 0.35 + wp.z * 0.27;
      transformed.x += sin(ph) * 0.07 * leaf * uWind;
      transformed.z += cos(ph * 0.8) * 0.05 * leaf * uWind;
      transformed.y += sin(ph * 1.3) * 0.02 * leaf * uWind;
    }`
          : '#include <begin_vertex>',
      )
      .replace('#include <project_vertex>', '#include <project_vertex>\n  vLookW = (modelMatrix * vec4(transformed, 1.0)).xyz;')
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\n${pars}`)
      .replace(
        '#include <opaque_fragment>',
        `{
      // Under a drifting cloud: a soft lavender shade.
      float cs = cloudShade(vLookW.xz) * uShade;
      outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.84, 0.82, 0.95), cs);
      ${
        o.ground
          ? `// Crystal sand twinkles: a few tiny glints in the near-white sand, each fading in and out on its own.
      vec2 cell = floor(vLookW.xz * 2.2);
      float h = lookHash(cell);
      vec2 f = fract(vLookW.xz * 2.2) - 0.5;
      float sandy = smoothstep(0.86, 0.93, min(vColor.r, vColor.g)) * step(vColor.b, vColor.g);
      float tw = step(0.965, h) * smoothstep(0.12, 0.0, length(f)) * max(0.0, sin(uTime * (1.5 + h * 3.0) + h * 40.0));
      outgoingLight = mix(outgoingLight, vec3(1.0), tw * sandy * (1.0 - cs) * 0.9);`
          : ''
      }
    }
    #include <opaque_fragment>`,
      )
  }
  const key = m.customProgramCacheKey?.() ?? ''
  m.customProgramCacheKey = () => `${key}|look${o.ground ? 'g' : ''}${o.plants ? 'p' : ''}`
  return bag.add(m) as Material
}
