// The sky behind the home globe, drawn first as one full-screen triangle: a pastel gradient, the app's big soft circles
// (theme.css's .screen.decorated) drifting slowly, a warm glow round the globe with faint rays turning in it, and a
// soft shadow under the globe so it floats. The globe's place on screen comes in as uniforms every frame.
import { BufferAttribute, BufferGeometry, Mesh, ShaderMaterial, Vector2 } from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`

// The colors are written as they show (sRGB), so no color-space conversion here.
const fragmentShader = /* glsl */ `
  uniform vec2 uRes;
  uniform vec2 uGlobe;
  uniform float uR;
  uniform float uTime;
  uniform float uGlow;
  varying vec2 vUv;

  vec3 blob(vec3 c, vec2 p, vec2 at, float r, vec3 color, float a) {
    float d = length(p - at);
    return mix(c, color, a * (1.0 - smoothstep(r - 1.5, r + 1.5, d)));
  }

  void main() {
    vec2 p = vUv * uRes;
    float y = vUv.y;
    vec3 c = mix(vec3(1.0, 0.95, 0.96), vec3(0.96, 0.93, 1.0), smoothstep(0.0, 0.6, y));
    c = mix(c, vec3(0.88, 0.93, 1.0), smoothstep(0.6, 1.0, y));
    // The big soft circles, breathing and drifting a little.
    float m = min(uRes.x, uRes.y);
    float t = uTime;
    c = blob(c, p, uRes * vec2(0.93, 0.9) + vec2(sin(t * 0.11), cos(t * 0.09)) * m * 0.02, m * (0.2 + 0.006 * sin(t * 0.5)), vec3(0.99, 0.92, 0.6), 0.5);
    c = blob(c, p, uRes * vec2(0.03, 0.62) + vec2(cos(t * 0.08), sin(t * 0.1)) * m * 0.025, m * 0.27, vec3(0.85, 0.8, 1.0), 0.55);
    c = blob(c, p, uRes * vec2(0.97, 0.28) + vec2(sin(t * 0.07), sin(t * 0.12)) * m * 0.02, m * 0.3, vec3(1.0, 0.72, 0.83), 0.3);
    c = blob(c, p, uRes * vec2(0.1, 0.04) + vec2(cos(t * 0.1), cos(t * 0.06)) * m * 0.02, m * 0.25, vec3(0.62, 0.9, 0.8), 0.38);

    // The glow round the globe and the slow rays in it.
    vec2 q = p - uGlobe;
    float d = length(q) / uR;
    float glow = exp(-pow(max(d - 0.95, 0.0) * 2.1, 1.6));
    float a = atan(q.y, q.x);
    float rays = smoothstep(0.42, 0.5, abs(fract(a * 1.909859 + t * 0.012) - 0.5));
    c = mix(c, vec3(1.0, 0.97, 0.92), uGlow * 0.18 * rays * exp(-max(d - 1.0, 0.0) * 0.9) * step(1.0, d));
    c = mix(c, vec3(1.0, 0.98, 0.95), uGlow * 0.9 * glow);
    c = mix(c, vec3(1.0, 0.86, 0.93), uGlow * 0.35 * exp(-pow(max(d - 1.05, 0.0) * 4.0, 2.0)));

    // The shadow it floats over.
    vec2 s = (p - (uGlobe - vec2(0.0, uR * 1.32))) / vec2(uR * 0.72, uR * 0.11);
    c = mix(c, vec3(0.78, 0.72, 0.92), 0.42 * uGlow * (1.0 - smoothstep(0.35, 1.0, length(s))));
    gl_FragColor = vec4(c, 1.0);
  }
`

export class Sky {
  readonly mesh: Mesh
  private mat: ShaderMaterial
  constructor() {
    const g = new BufferGeometry()
    g.setAttribute('position', new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3))
    this.mat = new ShaderMaterial({
      uniforms: { uRes: { value: new Vector2(1, 1) }, uGlobe: { value: new Vector2() }, uR: { value: 100 }, uTime: { value: 0 }, uGlow: { value: 1 } },
      vertexShader,
      fragmentShader,
      depthWrite: false,
      depthTest: false,
    })
    this.mesh = new Mesh(g, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = -10
  }

  /** The screen's size, where the globe's middle is (px from the top left) and its radius (px). */
  set(w: number, h: number, x: number, y: number, r: number, time: number, glow: number) {
    const u = this.mat.uniforms
    u.uRes.value.set(w, h)
    u.uGlobe.value.set(x, h - y)
    u.uR.value = r
    u.uTime.value = time
    u.uGlow.value = glow
  }

  dispose() {
    this.mesh.geometry.dispose()
    this.mat.dispose()
  }
}
