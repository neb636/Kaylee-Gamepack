// The farm's water in the toon look: one small shader for every paddy and the channel. Flat bands, no lighting: muddy
// brown while a paddy fills, then shiny sky blue with a lighter rim along its banks (Animal Crossing's paddies), short
// white glints that twinkle (drifting downstream in the channel), and the ripple rings Kaylee leaves as she wades
// (shared by every water surface: a ring she starts in one paddy spreads only where there's water to draw it on).
import { Color, Mesh, PlaneGeometry, ShaderMaterial, Vector4, type ColorRepresentation } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'

const RIPPLES = 12

const vertexShader = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
// (No variable called "patch" or "sample": reserved in WebGL2, the shader would silently fail.)
const fragmentShader = /* glsl */ `
  uniform vec3 uMud;
  uniform vec3 uShiny;
  uniform vec3 uRim;
  uniform float uShine;
  uniform float uTime;
  uniform vec4 uRect;
  uniform vec2 uFlow;
  uniform vec4 uRip[${RIPPLES}];
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vWorld.xz;
    vec3 col = mix(uMud, uShiny, uShine);
    // Big soft blots of a lighter blue, drifting.
    float blot = sin(p.x * 1.1 + uTime * 0.25) * sin(p.y * 1.5 - uTime * 0.2) + 0.5 * sin((p.x - p.y) * 0.8 + uTime * 0.15);
    col = mix(col, mix(col, vec3(1.0), 0.18), step(0.75, blot) * uShine);
    // The lighter rim along the banks.
    float edge = min(min(p.x - uRect.x, uRect.z - p.x), min(p.y - uRect.y, uRect.w - p.y));
    col = mix(col, uRim, step(edge, 0.09) * 0.75 * uShine);
    // Glints: short white dashes, one in a few cells, each twinkling on and off.
    vec2 q = (p - uFlow * uTime) * vec2(2.4, 5.0);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float h = hash(cell);
    float on = step(0.82, h) * step(0.15, sin(uTime * 1.7 + h * 40.0));
    float dash = on * step(0.25, f.x) * step(f.x, 0.25 + 0.5 * hash(cell + 7.0)) * step(0.42, f.y) * step(f.y, 0.58);
    col = mix(col, vec3(1.0), dash * 0.85 * uShine);
    // Kaylee's ripples: rings that spread and fade.
    float ring = 0.0;
    for (int i = 0; i < ${RIPPLES}; i++) {
      vec4 r = uRip[i];
      float age = uTime - r.z;
      if (age < 0.0 || age > 1.4) continue;
      float rad = 0.08 + age * 0.62;
      float d = abs(distance(p, r.xy) - rad);
      ring = max(ring, step(d, 0.022 + 0.01 * (1.0 - age)) * (1.0 - age / 1.4) * r.w);
    }
    col = mix(col, vec3(1.0), ring * 0.85);
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

/** Every water surface on the farm, sharing the time and Kaylee's ripples. */
export class FarmWater {
  private time = { value: 0 }
  private rip = { value: Array.from({ length: RIPPLES }, () => new Vector4(0, 0, -99, 0)) }
  private next = 0
  constructor(private bag: Bag) {}

  /** A flat water surface `w` by `d` (its middle at x, z; it moves up and down with `mesh.position.y`). */
  surface(x: number, z: number, w: number, d: number, o: { mud?: ColorRepresentation; shiny?: ColorRepresentation; rim?: ColorRepresentation; shine?: number; flow?: [number, number] } = {}) {
    const mat = this.bag.add(
      new ShaderMaterial({
        uniforms: {
          uMud: { value: new Color(o.mud ?? '#A88F74') },
          uShiny: { value: new Color(o.shiny ?? '#9FD8F5') },
          uRim: { value: new Color(o.rim ?? '#D4F0FC') },
          uShine: { value: o.shine ?? 1 },
          uTime: this.time,
          uRect: { value: new Vector4(x - w / 2, z - d / 2, x + w / 2, z + d / 2) },
          uFlow: { value: o.flow ?? [0, 0] },
          uRip: this.rip,
        },
        vertexShader,
        fragmentShader,
      }),
    )
    const mesh = new Mesh(this.bag.add(new PlaneGeometry(w, d).rotateX(-Math.PI / 2)), mat)
    mesh.position.set(x, 0, z)
    return mesh
  }

  /** How shiny a surface is (0 muddy, 1 sky blue). */
  static setShine(mesh: Mesh, k: number) {
    ;(mesh.material as ShaderMaterial).uniforms.uShine.value = k
  }
  static setMud(mesh: Mesh, c: ColorRepresentation) {
    ;((mesh.material as ShaderMaterial).uniforms.uMud.value as Color).set(c)
  }

  /** A ripple ring starting at x, z now (`k`: how strong). */
  ripple(x: number, z: number, k = 1) {
    this.rip.value[this.next].set(x, z, this.time.value, k)
    this.next = (this.next + 1) % RIPPLES
  }

  update(t: number) {
    this.time.value = t
  }
}
