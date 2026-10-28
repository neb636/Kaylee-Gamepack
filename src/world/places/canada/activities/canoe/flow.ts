// Running water for Red Canoe's glacier stream: two flat bands that wobble, white dashes streaming along it and foam
// along both banks, in the toon look (the Mountain Bike's creek is drawn the same way; this copy keeps the canoe's
// folder on its own). A strip's `flow` attribute is (meters along, 0..1 across).
import { Color, DoubleSide, ShaderMaterial, UniformsLib, UniformsUtils, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

const flowVertex = /* glsl */ `
  #include <fog_pars_vertex>
  attribute vec2 flow;
  varying vec2 vFlow;
  void main() {
    vFlow = flow;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`
const flowFragment = /* glsl */ `
  #include <fog_pars_fragment>
  uniform vec3 uDeep;
  uniform vec3 uLight;
  uniform vec3 uFoam;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uRows;
  uniform float uAlong;
  varying vec2 vFlow;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    float band = sin(vFlow.x * 0.7 - uTime * uSpeed * 0.6 + sin(vFlow.y * 6.0) * 0.8);
    vec3 col = band > 0.35 ? uLight : uDeep;
    vec2 q = vec2(vFlow.y * uRows, vFlow.x * uAlong - uTime * uSpeed * uAlong);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float dash = step(0.62, hash(cell)) * step(0.3, f.x) * step(f.x, 0.7) * step(0.15, f.y) * step(f.y, 0.75);
    col = mix(col, uFoam, dash * 0.85);
    float edge = 1.0 - smoothstep(0.0, 0.14, min(vFlow.y, 1.0 - vFlow.y));
    col = mix(col, uFoam, edge * 0.75);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`

export class FlowMaterial {
  readonly mat: ShaderMaterial
  constructor(bag: Bag, o: { deep: ColorRepresentation; light: ColorRepresentation; speed: number; rows: number; along?: number }) {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: UniformsUtils.merge([
          UniformsLib.fog,
          { uDeep: { value: new Color(o.deep) }, uLight: { value: new Color(o.light) }, uFoam: { value: new Color('#FFFFFF') }, uTime: { value: 0 }, uSpeed: { value: o.speed }, uRows: { value: o.rows }, uAlong: { value: o.along ?? 0.8 } },
        ]),
        vertexShader: flowVertex,
        fragmentShader: flowFragment,
        fog: true,
        side: DoubleSide,
      }),
    )
  }
  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}
