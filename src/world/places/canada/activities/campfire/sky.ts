// The night sky over the clearing (Flashlight Statues): a deep blue dome, stars that twinkle (a few at first, then,
// when she turns the flashlight off, the whole sky full of them), and at the very end the northern lights: soft
// curtains of green, aqua and pink that ripple and drift across the sky over the trees.
import { AdditiveBlending, BackSide, BufferGeometry, Color, DataTexture, DoubleSide, LinearFilter, RGBAFormat, UnsignedByteType, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Points, ShaderMaterial, SphereGeometry, SRGBColorSpace, type Object3D } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

const hex = (c: string) => {
  const k = new Color(c)
  return [k.r * 255, k.g * 255, k.b * 255] as const
}

/** A painted gradient dome (top, middle, horizon), the pixels written by hand (engine3d/softTexture.ts says why: no
 *  canvas gradients). */
function dome(bag: Bag, top: string, mid: string, low: string) {
  const [a, b, c] = [hex(top), hex(mid), hex(low)]
  const H = 128
  const data = new Uint8Array(4 * H * 4)
  for (let y = 0; y < H; y++) {
    // (Row 0 is the bottom of the texture: the dome's south pole; the horizon is the middle.)
    const v = y / (H - 1)
    const up = Math.max(0, (v - 0.5) * 2)
    const col = up < 0.35 ? mix(c, b, up / 0.35) : mix(b, a, Math.min(1, (up - 0.35) / 0.65))
    for (let x = 0; x < 4; x++) data.set([col[0], col[1], col[2], 255], (y * 4 + x) * 4)
  }
  const tex = bag.add(new DataTexture(data, 4, H, RGBAFormat, UnsignedByteType))
  tex.magFilter = tex.minFilter = LinearFilter
  tex.colorSpace = SRGBColorSpace
  tex.needsUpdate = true
  const m = new Mesh(bag.add(new SphereGeometry(400, 24, 16)), bag.add(new MeshBasicMaterial({ map: tex, side: BackSide, fog: false, depthWrite: false })))
  m.renderOrder = -10
  m.frustumCulled = false
  return m
}
const mix = (p: readonly number[], q: readonly number[], k: number) => p.map((v, i) => v + (q[i] - v) * k)

const starVert = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aLate;
  uniform float uTime;
  uniform float uFull;
  uniform float uPx;
  varying float vA;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // The early stars are always out; the late ones come out as the flashlight goes off (each at its own moment).
    float out_ = aLate < 0.5 ? 1.0 : clamp(uFull * 2.2 - aLate * 1.6 + 0.6, 0.0, 1.0);
    float tw = 0.65 + 0.35 * sin(uTime * (1.3 + aPhase * 0.4) + aPhase * 9.0);
    vA = out_ * tw;
    gl_PointSize = aSize * uPx * (0.75 + 0.25 * tw) * out_;
  }
`
const starFrag = /* glsl */ `
  varying float vA;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    // A soft round star with a little four-point glint.
    float core = smoothstep(0.5, 0.08, d);
    float glint = max(0.0, 1.0 - abs(c.x) * 12.0) * max(0.0, 1.0 - abs(c.y) * 2.2) + max(0.0, 1.0 - abs(c.y) * 12.0) * max(0.0, 1.0 - abs(c.x) * 2.2);
    float a = clamp(core * 0.9 + glint * 0.6, 0.0, 1.0) * vA;
    gl_FragColor = vec4(1.0, 0.97, 0.88, a);
  }
`

const auroraVert = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vX;
  void main() {
    vUv = uv;
    vec3 p = position;
    // The curtain's foot rises and falls along it in slow waves; folds travel along it and it sways.
    p.y += sin(p.x * 0.022 + uTime * 0.22) * 14.0 + sin(p.x * 0.009 - uTime * 0.13) * 16.0;
    p.z += (sin(p.x * 0.03 + uTime * 0.35) * 30.0 + sin(p.x * 0.09 - uTime * 0.6) * 6.0) * (0.6 + 0.4 * uv.y);
    vX = p.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`
const auroraFrag = /* glsl */ `
  uniform float uTime;
  uniform float uOn;
  uniform vec3 uLow;
  uniform vec3 uHigh;
  varying vec2 vUv;
  varying float vX;
  void main() {
    // A bright soft foot, fading up into pink; rays of uneven width that shimmer and drift along it; brighter and
    // dimmer stretches; soft ends.
    float foot = smoothstep(0.0, 0.07, vUv.y) * pow(1.0 - vUv.y, 1.7);
    float wob = sin(vX * 0.05 + uTime * 0.3) * 2.5;
    float rays = 0.6 + 0.28 * sin(vX * 0.16 + uTime * 0.7 + wob) + 0.12 * sin(vX * 0.47 - uTime * 1.3);
    float bright = 0.6 + 0.4 * sin(vX * 0.014 + uTime * 0.21 + 1.3);
    float ends = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x);
    vec3 col = mix(uLow, uHigh, smoothstep(0.1, 0.8, vUv.y));
    float a = clamp(foot * rays * bright * ends * 2.2, 0.0, 1.0) * uOn;
    gl_FragColor = vec4(col * a, a);
  }
`

export class NightSky {
  readonly root = new Group()
  private stars: Points
  private starMat: ShaderMaterial
  private aurora: Mesh[] = []
  private auroraMats: ShaderMaterial[] = []
  /** 0: a few stars .. 1: the sky full of them. */
  full = 0
  /** The northern lights, 0 (none) .. 1. */
  lights = 0
  private fullGoal = 0
  private lightsGoal = 0

  constructor(
    private bag: Bag,
    scene: Object3D,
  ) {
    this.root.add(dome(bag, '#0E0C30', '#232060', '#3B3478'))
    // The stars: a few bright ones always out, and many more that come out in the dark.
    const pos: number[] = []
    const size: number[] = []
    const phase: number[] = []
    const late: number[] = []
    for (let i = 0; i < 650; i++) {
      // (Mostly over the back of the clearing, where the camera looks up.)
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.6
      const el = 0.12 + Math.pow(Math.random(), 0.8) * 1.3
      const r = 300
      pos.push(Math.cos(a) * Math.cos(el) * r, Math.sin(el) * r, Math.sin(a) * Math.cos(el) * r)
      const early = i < 70
      size.push(early ? 5 + Math.random() * 4 : 2.6 + Math.random() * Math.random() * 5)
      phase.push(Math.random())
      late.push(early ? 0 : 0.6 + Math.random() * 0.4)
    }
    const g = bag.add(new BufferGeometry())
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    g.setAttribute('aSize', new Float32BufferAttribute(size, 1))
    g.setAttribute('aPhase', new Float32BufferAttribute(phase, 1))
    g.setAttribute('aLate', new Float32BufferAttribute(late, 1))
    this.starMat = bag.add(new ShaderMaterial({ uniforms: { uTime: { value: 0 }, uFull: { value: 0 }, uPx: { value: 1 } }, vertexShader: starVert, fragmentShader: starFrag, transparent: true, depthWrite: false, blending: AdditiveBlending }))
    this.stars = new Points(g, this.starMat)
    this.stars.frustumCulled = false
    this.stars.renderOrder = -9
    this.root.add(this.stars)
    // The northern lights: three long curtains far over the trees, behind each other.
    const bands: [number, number, number, number, string, string][] = [
      // [y, z, width, height, foot color, top color]
      [34, -150, 380, 62, '#5CF2B0', '#D58CFF'],
      [52, -200, 460, 80, '#8AF7C8', '#FF8FD0'],
    ]
    for (const [y, z, w, hgt, lo, hi] of bands) {
      const geo = bag.add(new PlaneGeometry(w, hgt, 64, 6))
      const mat = bag.add(new ShaderMaterial({ uniforms: { uTime: { value: 0 }, uOn: { value: 0 }, uLow: { value: new Color(lo) }, uHigh: { value: new Color(hi) } }, vertexShader: auroraVert, fragmentShader: auroraFrag, transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, fog: false }))
      const m = new Mesh(geo, mat)
      m.position.set(30 + z * 0.1, y + hgt / 2, z)
      m.rotation.x = 0.12
      m.frustumCulled = false
      m.renderOrder = -8
      m.visible = false
      this.root.add(m)
      this.aurora.push(m)
      this.auroraMats.push(mat)
    }
    scene.add(this.root)
  }

  /** The sky full of stars (true), or the usual few. */
  setFull(on: boolean) {
    this.fullGoal = on ? 1 : 0
  }
  /** The northern lights on or off. */
  setLights(on: boolean) {
    this.lightsGoal = on ? 1 : 0
  }

  update(dt: number, t: number, camPos: { x: number; y: number; z: number }, h: number) {
    this.root.position.set(camPos.x, 0, camPos.z)
    this.full += (this.fullGoal - this.full) * Math.min(1, dt * 0.45)
    this.lights += (this.lightsGoal - this.lights) * Math.min(1, dt * 0.35)
    this.starMat.uniforms.uTime.value = t
    this.starMat.uniforms.uFull.value = this.full
    // (Points are pixels: a star is the same size on an iPhone and a big Mac window, about.)
    this.starMat.uniforms.uPx.value = Math.max(0.8, Math.min(2, h / 820)) * (window.devicePixelRatio || 1) * 0.9
    for (const m of this.auroraMats) {
      m.uniforms.uTime.value = t
      m.uniforms.uOn.value = this.lights
    }
    for (const m of this.aurora) m.visible = this.lights > 0.01
  }

  dispose() {
    this.root.removeFromParent()
    void this.bag
  }
}
