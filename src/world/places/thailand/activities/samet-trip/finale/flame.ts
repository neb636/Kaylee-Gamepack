// Fire and soft light for the fire show (fireshow.ts), drawn in the flat toon look: no textures, no post-processing.
//
// - `Flames`: cartoon flames, many in one draw. Each is a quad turned to the camera (upright) with a shader that draws a
//   teardrop flame in three flat bands (a red-orange edge, an orange middle, a pale gold core) over a round base, its
//   tip licking and flickering on its own beat, a little side tongue breaking off, a faint glow round it. Additive, so
//   on the dark beach it lights up and the dark parts vanish. `angle` leans it (a fireball's flame streams back from
//   where it's going).
// - `Glows`: soft round glows: turned to the camera (a paper lantern's halo) or lying flat on the sand (the pool of
//   firelight under a dancer, round a flame of the ring).
import { AdditiveBlending, BufferAttribute, Color, DoubleSide, DynamicDrawUsage, InstancedBufferAttribute, InstancedBufferGeometry, Mesh, ShaderMaterial, type ColorRepresentation, type Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'

const quad = (bag: Bag, x0: number, x1: number, y0: number, y1: number) => {
  const g = bag.add(new InstancedBufferGeometry())
  g.setAttribute('position', new BufferAttribute(new Float32Array([x0, y0, 0, x1, y0, 0, x1, y1, 0, x0, y1, 0]), 3))
  g.setIndex([0, 1, 2, 0, 2, 3])
  return g
}
const inst = (g: InstancedBufferGeometry, name: string, n: number, size: number) => {
  const a = new InstancedBufferAttribute(new Float32Array(n * size), size).setUsage(DynamicDrawUsage)
  g.setAttribute(name, a)
  return a
}

const FLAME_VERT = /* glsl */ `
  attribute vec3 aPos;
  attribute vec4 aShape; // width, height, lean (rad), phase
  attribute float aAlpha;
  varying vec2 vUv;
  varying float vPhase;
  varying float vAlpha;
  void main() {
    vUv = position.xy;
    vPhase = aShape.w;
    vAlpha = aAlpha;
    vec2 q = position.xy * aShape.xy;
    float c = cos(aShape.z), s = sin(aShape.z);
    q = vec2(q.x * c - q.y * s, q.x * s + q.y * c);
    // Turned to the camera but kept upright (the camera only looks down a little).
    vec3 camR = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 w = aPos + camR * q.x + vec3(0.0, 1.0, 0.0) * q.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }
`
const FLAME_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uEdge;
  uniform vec3 uMid;
  uniform vec3 uCore;
  varying vec2 vUv;
  varying float vPhase;
  varying float vAlpha;
  // How far inside a teardrop flame of size s (< 1 inside): a round base of radius 0.3 s at the origin narrowing to a
  // licking tip at about 0.95 s.
  float flame(vec2 p, float s, float ph) {
    float R = 0.3 * s;
    float H = s * (0.9 + 0.12 * sin(uTime * 9.0 + ph * 6.2831) + 0.06 * sin(uTime * 23.0 + ph * 17.0));
    float up = smoothstep(0.0, 0.7 * s, p.y);
    float wob = (sin(p.y * 9.0 / s - uTime * 12.0 + ph * 6.2831) * 0.07 + sin(p.y * 17.0 / s - uTime * 19.0 + ph * 11.0) * 0.03) * s * up;
    float x = p.x - wob;
    if (p.y < 0.0) return length(vec2(x, p.y)) / R;
    float k = 1.0 - p.y / H;
    if (k <= 0.0) return 9.0;
    // Round shoulders, then in to the tip.
    float r = R * pow(k, 0.85) * (1.0 + 0.18 * sin(k * 3.1416));
    return abs(x) / r;
  }
  void main() {
    vec2 p = vUv;
    float ph = vPhase;
    float side = sin(ph * 37.0) > 0.0 ? 1.0 : -1.0;
    // A little tongue that breaks off the side and licks up.
    float lick = fract(uTime * 1.7 + ph * 3.0);
    vec2 tp = p - vec2(side * (0.1 + 0.06 * lick), 0.22 + lick * 0.35);
    float tongue = flame(tp, 0.42 * (1.0 - lick * 0.7), ph + 0.37);
    float edge = min(flame(p, 1.0, ph), tongue);
    float mid = flame(p - vec2(0.0, -0.02), 0.68, ph + 0.13);
    float core = flame(p - vec2(0.0, -0.05), 0.4, ph + 0.29);
    float aa = 0.08;
    vec3 col = uEdge * 0.85;
    col = mix(col, uMid, smoothstep(1.0, 1.0 - aa, mid));
    col = mix(col, uCore, smoothstep(1.0, 1.0 - aa, core));
    float inside = smoothstep(1.0, 1.0 - aa, edge);
    // A faint glow round it.
    float g = exp(-length(p - vec2(0.0, 0.2)) * 4.5) * 0.45;
    vec3 outC = col * inside + uEdge * g * (1.0 - inside);
    gl_FragColor = vec4(outC * vAlpha, 1.0);
  }
`

export interface FlameColors {
  edge?: ColorRepresentation
  mid?: ColorRepresentation
  core?: ColorRepresentation
}

/** Many cartoon flames in one draw. Set them each frame with `set()`, then `commit()`. */
export class Flames {
  readonly mesh: Mesh
  private pos: InstancedBufferAttribute
  private shape: InstancedBufferAttribute
  private alpha: InstancedBufferAttribute
  private geo: InstancedBufferGeometry
  private mat: ShaderMaterial
  private n = 0

  constructor(
    bag: Bag,
    readonly max: number,
    colors: FlameColors = {},
  ) {
    // The quad: wider than the flame for its glow; the base's middle at the origin.
    const g = (this.geo = quad(bag, -0.55, 0.55, -0.4, 1.15))
    this.pos = inst(g, 'aPos', max, 3)
    this.shape = inst(g, 'aShape', max, 4)
    this.alpha = inst(g, 'aAlpha', max, 1)
    g.instanceCount = 0
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uEdge: { value: new Color(colors.edge ?? '#FF4A1C') }, uMid: { value: new Color(colors.mid ?? '#FF9A1F') }, uCore: { value: new Color(colors.core ?? '#FFE9A6') } },
        vertexShader: FLAME_VERT,
        fragmentShader: FLAME_FRAG,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
      }),
    )
    this.mesh = new Mesh(g, this.mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = 7
  }

  /** Starts a frame's flames. */
  begin(t: number) {
    this.n = 0
    this.mat.uniforms.uTime.value = t
  }
  /** One flame: its base at `p`, `w` wide and `h` tall (m), leaning `lean` rad (0 = straight up), its own beat `phase`. */
  add(p: Vector3, w: number, h: number, lean = 0, phase = 0, alpha = 1) {
    if (this.n >= this.max) return
    const i = this.n++
    this.pos.setXYZ(i, p.x, p.y, p.z)
    this.shape.setXYZW(i, w, h, lean, phase)
    this.alpha.setX(i, alpha)
  }
  commit() {
    this.geo.instanceCount = this.n
    this.pos.needsUpdate = this.shape.needsUpdate = this.alpha.needsUpdate = true
  }
}

const GLOW_VERT = /* glsl */ `
  uniform float uFlat;
  attribute vec4 aPos; // x, y, z, size
  attribute vec4 aCol; // r, g, b, alpha
  varying vec2 vUv;
  varying vec4 vCol;
  void main() {
    vUv = position.xy;
    vCol = aCol;
    vec2 q = position.xy * aPos.w;
    vec3 camR = normalize(vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]));
    vec3 camU = normalize(vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]));
    vec3 billboard = camR * q.x + camU * q.y;
    vec3 lying = vec3(q.x, 0.0, q.y);
    vec3 w = aPos.xyz + mix(billboard, lying, uFlat);
    gl_Position = projectionMatrix * viewMatrix * vec4(w, 1.0);
  }
`
const GLOW_FRAG = /* glsl */ `
  uniform float uSoft;
  varying vec2 vUv;
  varying vec4 vCol;
  void main() {
    float r = length(vUv) * 2.0;
    if (r >= 1.0) discard;
    float a = pow(1.0 - r, uSoft);
    gl_FragColor = vec4(vCol.rgb * a * vCol.a, 1.0);
  }
`

/** Soft round glows (additive). `flat`: lying on the ground instead of turned to the camera. `soft`: how quickly it
 *  fades from the middle (higher = a smaller bright middle). */
export class Glows {
  readonly mesh: Mesh
  private pos: InstancedBufferAttribute
  private col: InstancedBufferAttribute
  private geo: InstancedBufferGeometry
  private n = 0
  private c = new Color()

  constructor(
    bag: Bag,
    readonly max: number,
    opts: { flat?: boolean; soft?: number } = {},
  ) {
    const g = (this.geo = quad(bag, -0.5, 0.5, -0.5, 0.5))
    this.pos = inst(g, 'aPos', max, 4)
    this.col = inst(g, 'aCol', max, 4)
    g.instanceCount = 0
    const mat = bag.add(
      new ShaderMaterial({
        uniforms: { uFlat: { value: opts.flat ? 1 : 0 }, uSoft: { value: opts.soft ?? 2 } },
        // (Lying flat, the quad faces down: draw both sides.)
        side: DoubleSide,
        vertexShader: GLOW_VERT,
        fragmentShader: GLOW_FRAG,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        fog: false,
      }),
    )
    this.mesh = new Mesh(g, mat)
    this.mesh.frustumCulled = false
    this.mesh.renderOrder = opts.flat ? 2 : 6
  }
  begin() {
    this.n = 0
  }
  /** One glow at `p`, `size` across (m), in `color`, `alpha` bright. */
  add(p: Vector3, size: number, color: ColorRepresentation, alpha = 1) {
    if (this.n >= this.max) return
    const i = this.n++
    this.c.set(color)
    this.pos.setXYZW(i, p.x, p.y, p.z, size)
    this.col.setXYZW(i, this.c.r, this.c.g, this.c.b, alpha)
  }
  commit() {
    this.geo.instanceCount = this.n
    this.pos.needsUpdate = this.col.needsUpdate = true
  }
}
