// Running water for Red Canoe's glacier creek, in the toon look: milky turquoise glacier water, deeper in the middle and
// paler at the edges, with soft white streaks racing downstream (long and thin, never squares), a wavy line of foam
// along both banks, and whitewater wherever the creek tumbles down a step (the `rush` attribute, 0 calm to 1 a
// waterfall: faster, foamier). A strip's `flow` attribute is (meters along, 0..1 across). Call `update(t)` every frame.
import { Color, DoubleSide, ShaderMaterial, UniformsLib, UniformsUtils, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

const vertexShader = /* glsl */ `
  #include <fog_pars_vertex>
  attribute vec2 flow;
  attribute float rush;
  varying vec2 vFlow;
  varying float vRush;
  void main() {
    vFlow = flow;
    vRush = rush;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const fragmentShader = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uDeep;
  uniform vec3 uLight;
  uniform vec3 uFoam;
  uniform float uTime;
  uniform float uSpeed;
  varying vec2 vFlow;
  varying float vRush;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  void main() {
    float along = vFlow.x;
    float across = vFlow.y;
    float spd = uSpeed * (1.0 + vRush * 1.6);
    float t = uTime * spd;
    // Deeper in the middle, paler toward the banks: two flat toon bands with a wobbly edge between them.
    float mid = 1.0 - abs(across - 0.5) * 2.0;
    float wob = 0.08 * sin(along * 1.3 - t * 0.8);
    vec3 col = mid + wob > 0.45 ? uDeep : uLight;
    // Streaks: noise stretched along the flow, sliding downstream.
    float n = noise(vec2(across * 9.0, along * 0.55 - t * 0.55)) * 0.6 + noise(vec2(across * 17.0 + 4.0, along * 1.1 - t * 0.8)) * 0.4;
    float cut = 0.7 - vRush * 0.22;
    col = mix(col, uFoam, smoothstep(cut, cut + 0.03, n) * (0.75 + 0.25 * vRush));
    // Foam along the banks, its edge rippling.
    float bank = 0.07 + 0.035 * sin(along * 2.1 - t * 1.7) + 0.025 * sin(along * 5.3 + across) + vRush * 0.1;
    col = mix(col, uFoam, step(min(across, 1.0 - across), bank) * 0.9);
    // Whitewater on the steps: churning patches.
    float churn = noise(vec2(across * 7.0, along * 2.4 - t * 1.4));
    col = mix(col, uFoam, step(0.45, vRush) * step(0.72 - vRush * 0.35, churn));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export class RiverMaterial {
  readonly mat: ShaderMaterial
  constructor(bag: Bag, o: { deep: ColorRepresentation; light: ColorRepresentation; speed: number }) {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: UniformsUtils.merge([UniformsLib.fog, { uDeep: { value: new Color(o.deep) }, uLight: { value: new Color(o.light) }, uFoam: { value: new Color('#FFFFFF') }, uTime: { value: 0 }, uSpeed: { value: o.speed } }]),
        vertexShader,
        fragmentShader,
        fog: true,
        side: DoubleSide,
      }),
    )
  }
  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}
