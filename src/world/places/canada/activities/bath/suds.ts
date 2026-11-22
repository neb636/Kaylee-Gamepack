// The bath's bubbles, two kinds:
//
// `Suds`: the lather that sticks to whoever she rubs (Misty's fur, Maple's chin). Soft foam, not a pile of balls: each
// rub leaves a little cluster (one round bubble and two or three small ones packed round it), drawn with a foam shader
// (white on the lit side, a pale lavender shadow, a thin lilac rim instead of the black ink line, one glint) as one
// instanced mesh: one draw call however many. Each bubble is stuck to a part of someone (its `parent`: a pivot of the
// rig, so it moves with her as she breathes, shakes and turns her head) at a point on the surface, and stands out of it
// along the surface's way out. Rubbing the same place piles them up (a mohawk, horns, a beard: the shape she rubs is the
// shape they make). Over thick mud the lather comes out a muddy tan, and turns white as she scrubs (the way the
// Nintendogs bath shows clean); the rain pops them.
//
// `Floaters`: see-through soap bubbles with a rainbow film and a window glint that drift up out of the lather (as she
// rubs, as the rain pops it, when Misty sneezes) and wobble away. Her finger pops them (a tap, or just passing through
// one): a little plip and a ring of drops. Big ones sometimes split in two.
import { Color, DynamicDrawUsage, IcosahedronGeometry, InstancedBufferAttribute, InstancedMesh, Matrix4, NormalBlending, Quaternion, ShaderMaterial, Vector3, type Camera, type Object3D, type Scene } from 'three'
import type { Bag } from '../../../../engine3d/dispose'

// ---------------------------------------------------------------- the lather

/** Clean lather (white, the palest pinks), and lather over thick mud. */
const CLEAN = ['#FFFFFF', '#FFF0F6', '#FFE4F0', '#FFF8FB'].map((c) => new Color(c))
const MUDDY = new Color('#E2C6A8')

const foamVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vCol;
  void main() {
    mat4 m = modelMatrix * instanceMatrix;
    vN = normalize((viewMatrix * m * vec4(normal, 0.0)).xyz);
    #ifdef USE_INSTANCING_COLOR
      vCol = instanceColor;
    #else
      vCol = vec3(1.0);
    #endif
    gl_Position = projectionMatrix * viewMatrix * m * vec4(position, 1.0);
  }
`
const foamFragment = /* glsl */ `
  uniform vec3 uShade;
  uniform vec3 uRim;
  varying vec3 vN;
  varying vec3 vCol;
  void main() {
    vec3 n = normalize(vN);
    // Two flat bands, lit from the upper left: the bubble's color, and a soft lavender shadow.
    float lit = dot(n, normalize(vec3(-0.45, 0.6, 0.65)));
    vec3 col = mix(vCol * uShade, vCol, smoothstep(-0.12, -0.02, lit));
    // A thin lilac rim where it turns away (it reads as foam against her white fur, without a black line).
    float edge = 1.0 - clamp(n.z, 0.0, 1.0);
    col = mix(col, uRim, smoothstep(0.7, 0.78, edge));
    // One window glint.
    float g = dot(n, normalize(vec3(-0.42, 0.5, 0.76)));
    col = mix(col, vec3(1.0), smoothstep(0.97, 0.978, g));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

interface Sud {
  parent: Object3D
  base: Vector3
  n: Vector3
  h: number
  size: number
  k: number
  goal: number
  color: Color
  seed: number
}

const m = new Matrix4()
const q = new Quaternion()
const scl = new Vector3()
const w = new Vector3()
const t1 = new Vector3()
const t2 = new Vector3()
const c1 = new Color()

export class Suds {
  readonly mesh: InstancedMesh
  readonly list: Sud[] = []
  private n = 0

  constructor(
    private max: number,
    scene: Scene,
    bag: Bag,
  ) {
    const geo = bag.add(new IcosahedronGeometry(1, 2))
    const mat = bag.add(new ShaderMaterial({ vertexShader: foamVertex, fragmentShader: foamFragment, uniforms: { uShade: { value: new Color('#EEE4F6') }, uRim: { value: new Color('#DCC6EA') } } }))
    this.mesh = bag.add(new InstancedMesh(geo, mat, max))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.raycast = () => {}
    for (let i = 0; i < max; i++) this.mesh.setColorAt(i, CLEAN[0])
    this.mesh.count = 0
    scene.add(this.mesh)
  }

  /** A bubble on `parent` at `local` (a point on its surface, parent-local), standing out along `normal`. Where there
   *  are bubbles already it lands on top of them, so rubbing one place piles them up. `mud` (0..1): how muddy the fur
   *  there is (thick mud makes tan lather). Full: the oldest one goes. */
  add(parent: Object3D, local: Vector3, normal: Vector3, size: number, mud = 0) {
    if (this.list.length >= this.max) this.list.shift()
    let h = 0
    for (const s of this.list) if (s.parent === parent && s.goal > 0 && s.base.distanceTo(local) < size * 1.2) h = Math.max(h, s.h + s.size * 0.5)
    h = Math.min(h, size * 3)
    // (Only a hint of tan: lather the color of her muddy fur would vanish on it.)
    const color = CLEAN[this.n++ % CLEAN.length].clone().lerp(MUDDY, Math.min(1, Math.max(0, (mud - 0.3) / 0.6)) * 0.4)
    this.list.push({ parent, base: local.clone(), n: normal.clone().normalize(), h, size, k: 0, goal: 1, color, seed: Math.random() * 6 })
  }
  /** A little cluster of lather: one bubble and two or three small ones packed round it on the surface (so it reads
   *  as foam). */
  lather(parent: Object3D, local: Vector3, normal: Vector3, size: number, mud = 0) {
    this.add(parent, local, normal, size, mud)
    const nn = t1.copy(normal).normalize()
    // Two ways along the surface there.
    const a = t2.set(nn.y, -nn.x, 0)
    if (a.lengthSq() < 1e-4) a.set(1, 0, 0)
    a.normalize()
    const b = new Vector3().crossVectors(nn, a)
    const extra = 2 + (Math.random() < 0.5 ? 1 : 0)
    for (let i = 0; i < extra; i++) {
      const ang = (i / extra) * Math.PI * 2 + Math.random()
      const r = size * (0.6 + Math.random() * 0.3)
      const p = local.clone().addScaledVector(a, Math.cos(ang) * r).addScaledVector(b, Math.sin(ang) * r)
      this.add(parent, p, normal, size * (0.5 + Math.random() * 0.25), mud)
    }
  }
  /** How many there are (not popping). */
  get count() {
    return this.list.reduce((n, s) => n + (s.goal > 0 ? 1 : 0), 0)
  }
  /** How many on one parent. */
  countOn(parent: Object3D) {
    return this.list.reduce((n, s) => n + (s.goal > 0 && s.parent === parent ? 1 : 0), 0)
  }
  /** Pops the ones `hit` picks (it gets each one's world position); returns their world positions. */
  pop(hit: (world: Vector3) => boolean): Vector3[] {
    const out: Vector3[] = []
    for (const s of this.list) {
      if (s.goal === 0) continue
      if (hit(this.world(s, w))) {
        s.goal = 0
        out.push(w.clone())
      }
    }
    return out
  }
  /** Everything comes off (on one parent, or all): their world positions, for the bubbles that fly off. */
  clear(parent?: Object3D): Vector3[] {
    const out: Vector3[] = []
    for (const s of this.list) {
      if (s.goal === 0 || (parent && s.parent !== parent)) continue
      out.push(this.world(s, new Vector3()))
      s.goal = 0
      s.k = Math.min(s.k, 0.3)
    }
    return out
  }
  /** Where one is in the world now. */
  world(s: Sud, out: Vector3) {
    return s.parent.localToWorld(out.copy(s.base).addScaledVector(s.n, s.h + s.size * 0.15))
  }
  /** The lather whitens as she keeps scrubbing (`k` 0..1 of the way to white, round a world point within `r`). */
  whiten(at: Vector3, r: number, k: number) {
    for (const s of this.list) {
      if (s.goal === 0) continue
      if (this.world(s, w).distanceTo(at) > r) continue
      s.color.lerp(c1.copy(CLEAN[1]), k)
    }
  }

  update(dt: number, t: number) {
    for (const s of this.list) s.k += (s.goal - s.k) * (1 - Math.exp(-dt * (s.goal ? 16 : 14)))
    for (let i = this.list.length - 1; i >= 0; i--) if (this.list[i].goal === 0 && this.list[i].k < 0.04) this.list.splice(i, 1)
    let i = 0
    for (const s of this.list) {
      if (!s.parent.visible) continue
      // Pop in with a little overshoot, then a soft wobble, like foam. Popping: a quick swell, then gone.
      const pop = s.goal ? 1 + 0.3 * Math.max(0, 1 - s.k) * Math.sin(s.k * 9) : 1 + 0.35 * (1 - s.k)
      const r = s.size * (s.goal ? s.k : Math.min(1, s.k * 2)) * pop * (1 + Math.sin(t * 3.5 + s.seed) * 0.05)
      this.world(s, w)
      // (The parent's scale shrinks a whole bubble with it: Maple's beard on her small head.)
      const k = s.parent.getWorldScale(scl).x
      m.compose(w, q, scl.set(r * k, r * k, r * k))
      this.mesh.setMatrixAt(i, m)
      this.mesh.setColorAt(i, s.color)
      i++
    }
    this.mesh.count = i
    this.mesh.instanceMatrix.needsUpdate = true
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true
  }
}

// ---------------------------------------------------------------- the floating soap bubbles

const floatVertex = /* glsl */ `
  attribute vec2 aLook;
  varying vec3 vN;
  varying vec2 vLook;
  void main() {
    mat4 m = modelMatrix * instanceMatrix;
    vN = normalize((viewMatrix * m * vec4(normal, 0.0)).xyz);
    vLook = aLook;
    gl_Position = projectionMatrix * viewMatrix * m * vec4(position, 1.0);
  }
`
const floatFragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vN;
  varying vec2 vLook;
  void main() {
    vec3 n = normalize(vN);
    float facing = clamp(n.z, 0.0, 1.0);
    float rim = 1.0 - facing;
    // The film's colors swirl with the angle and the time, thicker (more color) toward the bottom.
    float ph = rim * 1.3 + n.y * 0.35 + uTime * 0.12 + vLook.x;
    vec3 film = 0.5 + 0.5 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + ph));
    film = mix(vec3(1.0), film, 0.5 + 0.25 * (0.5 - 0.5 * n.y));
    // Nearly clear in the middle, the film strongest at the edge, and a crisp bright rim.
    float a = 0.06 + 0.55 * pow(rim, 1.6);
    vec3 col = film;
    float ring = smoothstep(0.78, 0.86, rim);
    col = mix(col, vec3(1.0, 0.97, 1.0), ring * 0.7);
    a = max(a, ring * 0.85);
    // A window glint up on the left and a small one down on the right.
    float g1 = smoothstep(0.93, 0.95, dot(n, normalize(vec3(-0.45, 0.5, 0.74))));
    float g2 = smoothstep(0.975, 0.985, dot(n, normalize(vec3(0.42, -0.42, 0.8))));
    col = mix(col, vec3(1.0), max(g1, g2));
    a = max(a, max(g1, g2 * 0.85));
    gl_FragColor = vec4(col, a * vLook.y);
    #include <colorspace_fragment>
  }
`

interface Floater {
  p: Vector3
  v: Vector3
  r: number
  age: number
  life: number
  seed: number
  /** Popping: seconds since (-1: not yet). */
  popT: number
}

/** See-through rainbow soap bubbles drifting up and away; her finger pops them. */
export class Floaters {
  readonly mesh: InstancedMesh
  private look: InstancedBufferAttribute
  private mat: ShaderMaterial
  readonly list: Floater[] = []
  /** Bubbles she popped (QA, pacing). */
  popped = 0

  constructor(
    private max: number,
    scene: Scene,
    bag: Bag,
  ) {
    const geo = bag.add(new IcosahedronGeometry(1, 3))
    this.look = new InstancedBufferAttribute(new Float32Array(max * 2), 2)
    this.look.setUsage(DynamicDrawUsage)
    geo.setAttribute('aLook', this.look)
    this.mat = bag.add(new ShaderMaterial({ vertexShader: floatVertex, fragmentShader: floatFragment, uniforms: { uTime: { value: 0 } }, transparent: true, depthWrite: false, blending: NormalBlending }))
    this.mesh = bag.add(new InstancedMesh(geo, this.mat, max))
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage)
    this.mesh.frustumCulled = false
    this.mesh.raycast = () => {}
    this.mesh.renderOrder = 5
    this.mesh.count = 0
    scene.add(this.mesh)
  }

  get count() {
    return this.list.reduce((n, f) => n + (f.popT < 0 ? 1 : 0), 0)
  }

  /** A bubble lets go at `at` (world) and drifts up; `r` its radius (m). Full: no new one. */
  emit(at: Vector3, r = Math.random() < 0.2 ? 0.15 + Math.random() * 0.04 : 0.09 + Math.random() * 0.05, v?: Vector3) {
    if (this.list.length >= this.max) return
    this.list.push({ p: at.clone(), v: v?.clone() ?? new Vector3((Math.random() - 0.5) * 0.25, 0.22 + Math.random() * 0.18, 0.08 + Math.random() * 0.12), r, age: 0, life: 7 + Math.random() * 4, seed: Math.random() * 10, popT: -1 })
  }

  /** Pops the ones within `px` of a screen point (or under it): their world positions and sizes. A big one sometimes
   *  splits into two small ones instead. */
  popAt(x: number, y: number, px: number, camera: Camera, w: number, h: number): { p: Vector3; r: number }[] {
    const out: { p: Vector3; r: number }[] = []
    for (const f of [...this.list]) {
      if (f.popT >= 0 || f.age < 0.25) continue
      const s = t1.copy(f.p).project(camera)
      if (s.z > 1) continue
      const sx = ((s.x + 1) / 2) * w
      const sy = ((1 - s.y) / 2) * h
      // The bubble's own radius on screen.
      const e = t2.copy(f.p).addScaledVector(camera.up, f.r).project(camera)
      const rp = Math.abs(((1 - e.y) / 2) * h - sy)
      if (Math.hypot(sx - x, sy - y) > Math.max(px, rp + px * 0.4)) continue
      out.push({ p: f.p.clone(), r: f.r })
      this.popped++
      if (f.r > 0.13 && Math.random() < 0.5) {
        // Splits: two little ones fly apart.
        f.popT = 0
        for (const s2 of [-1, 1]) this.emit(f.p.clone().add(t1.set(s2 * f.r * 0.5, 0, 0)), f.r * 0.55, new Vector3(s2 * 0.4, 0.35, 0.05))
      } else f.popT = 0
    }
    return out
  }

  update(dt: number, t: number) {
    this.mat.uniforms.uTime.value = t
    for (let i = this.list.length - 1; i >= 0; i--) {
      const f = this.list[i]
      f.age += dt
      if (f.popT >= 0) f.popT += dt
      // Drift: up, a slow side-to-side wander, slowing as they rise.
      f.v.x += Math.sin(t * 1.3 + f.seed) * dt * 0.12
      f.v.multiplyScalar(1 - dt * 0.15)
      f.v.y = Math.max(f.v.y, 0.1)
      f.p.addScaledVector(f.v, dt)
      if (f.age > f.life || f.popT > 0.12) this.list.splice(i, 1)
    }
    let i = 0
    for (const f of this.list) {
      const grow = Math.min(1, f.age / 0.3)
      const fade = f.age > f.life - 1 ? Math.max(0, f.life - f.age) : 1
      // Popping: swells a touch and vanishes. Alive: a soft wobble (a bit wider than tall, then taller).
      const pop = f.popT >= 0 ? 1 + f.popT * 3 : 1
      const wob = Math.sin(t * 5 + f.seed) * 0.05
      m.compose(f.p, q, scl.set(f.r * grow * pop * (1 + wob), f.r * grow * pop * (1 - wob), f.r * grow * pop))
      this.mesh.setMatrixAt(i, m)
      this.look.setXY(i, f.seed, (f.popT >= 0 ? Math.max(0, 1 - f.popT / 0.12) : 1) * fade * (0.6 + 0.4 * grow))
      i++
    }
    this.mesh.count = i
    this.mesh.instanceMatrix.needsUpdate = true
    this.look.needsUpdate = true
  }
}
