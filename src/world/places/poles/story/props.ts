// The things in the Poles' story (story/stage.ts builds its sets from these; the games can use them too, so the
// balloon she flies in the finale is the one in the films): Sparkle's balloon, the scientists' red ship and its fish
// crate, Nari the narwhal, sea ice, icebergs, snowy mountains, the stars and the polar lights. All toon shapes with
// ink outlines (engine3d/geo.ts), built into a caller's Bag.
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Points, PointsMaterial, ShaderMaterial, Vector3 } from 'three'
import { speechLevel } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'

/** A little random-number maker with a seed, so a set looks the same every time. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

export const ICE = '#F4F8FF'
export const ICE_SHADE = '#CFE3F7'
export const ICE_BLUE = '#A9D4F5'
export const SNOW = '#FFFFFF'

// ---------------------------------------------------------------- Sparkle's balloon

/** Sparkle's hot-air balloon: pink and lavender stripes, a gold band, a wicker basket big enough for a cub and a
 *  chick. The origin is the basket's floor; riders stand at `seat(i)`. `update` bobs and sways it. */
export class Balloon {
  readonly root = new Group()
  private sway = new Group()
  /** The basket's floor is this high above the root when it hangs still. */
  readonly basketR = 0.62
  private phase = Math.random() * 6

  constructor(bag: Bag) {
    const parts = []
    // The envelope: a ball of eight stripes (thin wedges of a sphere, alternating colors), a little taller than wide.
    const R = 1.75
    const cy = 3.55
    for (let i = 0; i < 8; i++) {
      const c = i % 2 ? PAL.lavender : PAL.pink
      const a = (i / 8) * Math.PI * 2
      // A wedge: a squashed ball pushed out from the middle, so the stripes read as puffy gores.
      parts.push(P.sphere(R * 0.62, c, { at: [Math.sin(a) * R * 0.42, cy, Math.cos(a) * R * 0.42], scale: [0.9, 1.5, 0.9] }, 14))
    }
    parts.push(P.sphere(R * 0.78, PAL.pink, { at: [0, cy + 0.15, 0], scale: [1, 1.32, 1] }, 16))
    // The mouth and its gold band, a little star on top.
    parts.push(P.cyl(0.62, 0.42, 0.7, PAL.lavenderDark, { at: [0, cy - 2.05, 0] }, 14))
    parts.push(P.torus(0.5, 0.07, PAL.gold, { at: [0, cy - 2.4, 0], rot: [Math.PI / 2, 0, 0] }))
    parts.push(P.sphere(0.16, PAL.gold, { at: [0, cy + 2.25, 0] }, 10))
    // The basket and its ropes.
    const b = this.basketR
    parts.push(P.cyl(b, b * 0.86, 0.62, '#E0A868', { at: [0, 0.31, 0] }, 14))
    parts.push(P.torus(b, 0.07, '#C98B4B', { at: [0, 0.62, 0], rot: [Math.PI / 2, 0, 0] }))
    parts.push(P.torus(b * 0.95, 0.05, '#C98B4B', { at: [0, 0.3, 0], rot: [Math.PI / 2, 0, 0] }))
    const plain = []
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4
      plain.push(P.cyl(0.02, 0.02, 0.62, '#8A6A4A', { at: [Math.sin(a) * 0.5, 0.92, Math.cos(a) * 0.5], rot: [Math.cos(a) * 0.12, 0, -Math.sin(a) * 0.12] }, 5))
    }
    this.sway.add(solidMix(parts, plain, bag, 3))
    this.root.add(this.sway)
  }

  /** Where rider `i` stands in the basket (the basket's own coordinates: `ride(balloon.basket, ...seat(i))`). */
  seat(i: number): [number, number, number] {
    return [(i === 0 ? -1 : 1) * 0.24, 0.32, 0.12]
  }
  /** What riders are added to (it sways with the balloon). */
  get basket() {
    return this.sway
  }
  update(_dt: number, t: number) {
    this.sway.position.y = Math.sin(t * 1.1 + this.phase) * 0.12
    this.sway.rotation.z = Math.sin(t * 0.7 + this.phase) * 0.035
    this.sway.rotation.x = Math.sin(t * 0.9 + this.phase * 2) * 0.025
  }
}

// ---------------------------------------------------------------- the red ship and its crate

/** The scientists' red ship (a toy icebreaker): she sits at the ice edge with a ramp down, her bow toward +x.
 *  The origin is on the waterline amidships. */
export function makeShip(bag: Bag) {
  const red = '#F0564E'
  const parts = [
    // The hull: a long rounded box, a pointed bow, a white stripe.
    P.rbox(7.2, 1.5, 2.3, 0.4, red, { at: [0, 0.55, 0] }),
    P.prism([[0, -0.75], [1.7, 0.75], [0, 0.75]], 2.2, red, { at: [3.6, 0.55, 0] }),
    P.rbox(7.25, 0.22, 2.36, 0.1, '#FFFFFF', { at: [0, 1.2, 0] }),
    // The cabin, its roof and the funnel.
    P.rbox(2.6, 1.3, 1.7, 0.22, '#FFFDF7', { at: [-1.5, 1.95, 0] }),
    P.rbox(2.9, 0.18, 1.95, 0.08, red, { at: [-1.5, 2.66, 0] }),
    P.cyl(0.3, 0.34, 0.9, '#FFC83D', { at: [-2.2, 3.15, 0] }, 12),
    P.cyl(0.32, 0.32, 0.16, PAL.ink, { at: [-2.2, 3.62, 0] }, 12),
    // A mast with a little flag, and the crane arm over the foredeck.
    P.cyl(0.05, 0.05, 1.7, '#8A8FA6', { at: [0.4, 2.15, 0] }, 6),
    P.box(0.5, 0.3, 0.03, PAL.mint, { at: [0.67, 2.85, 0] }),
  ]
  const plain = [-2.3, -1.5, -0.7].map((x) => P.sphere(0.2, '#8FD0F5', { at: [x, 2.05, 0.86], scale: [1, 1, 0.2] }, 10))
  const g = new Group()
  g.add(solidMix(parts, plain, bag, 3))
  return g
}

/** The ship's ramp: a plank from the foredeck down to the ice. */
export function makeRamp(bag: Bag) {
  return solid(merge([P.rbox(0.9, 0.08, 3.0, 0.03, '#E0A868'), ...[-1, -0.3, 0.4, 1.1].map((z) => P.box(0.9, 0.05, 0.08, '#C98B4B', { at: [0, 0.06, z] }))]), bag, 2)
}

/** A wooden fish crate (a fish painted on the side), open at the top: someone small fits inside. */
export function makeCrate(bag: Bag) {
  const w = '#E3B878'
  const d = '#C98B4B'
  const s = 0.9
  const parts = [
    P.box(s, 0.06, s, d, { at: [0, 0.03, 0] }),
    P.box(s, s * 0.8, 0.06, w, { at: [0, s * 0.4, s / 2] }),
    P.box(s, s * 0.8, 0.06, w, { at: [0, s * 0.4, -s / 2] }),
    P.box(0.06, s * 0.8, s, w, { at: [s / 2, s * 0.4, 0] }),
    P.box(0.06, s * 0.8, s, w, { at: [-s / 2, s * 0.4, 0] }),
    P.box(s + 0.06, 0.08, 0.1, d, { at: [0, s * 0.8, s / 2] }),
    P.box(s + 0.06, 0.08, 0.1, d, { at: [0, s * 0.8, -s / 2] }),
  ]
  // The fish: a body and a tail, flat on the front.
  const plain = [P.sphere(0.2, '#7CC4F2', { at: [-0.04, s * 0.42, s / 2 + 0.035], scale: [1.25, 0.7, 0.08] }, 10), P.cone(0.13, 0.2, '#7CC4F2', { at: [0.26, s * 0.42, s / 2 + 0.035], rot: [0, 0, Math.PI / 2], scale: [1, 1, 0.1] }, 3)]
  const g = new Group()
  g.add(solidMix(parts, plain, bag, 2.5))
  return g
}

// ---------------------------------------------------------------- Nari the narwhal

/** Nari the narwhal, the unicorn of the sea: a round grey-blue whale with a pale tummy, freckles, a spiral tusk
 *  and a happy face. Her nose points to +z; the origin is the middle of her body at the waterline. Riders sit at
 *  `saddle`. `update` bobs her, beats her tail and moves her with her voice. */
export class Narwhal {
  readonly root = new Group()
  private body = new Group()
  private tail: Group
  private flips: Group[] = []
  private phase = Math.random() * 6
  private level = 0
  /** Body length, nose to tail (m). */
  readonly length: number
  /** How fast she's swimming (0..1): the tail beats harder. */
  speed = 0
  /** Dives under (meters down, eased by the caller). */
  dive = 0

  constructor(bag: Bag, size = 1) {
    const s = size
    this.length = 3.4 * s
    const skin = '#AFC3DE'
    const belly = '#F4F8FF'
    const parts = [
      P.sphere(0.8 * s, skin, { scale: [0.92, 0.86, 1.75] }, 20),
      // The pale tummy shows along her sides and chin.
      P.sphere(0.74 * s, belly, { at: [0, -0.16 * s, 0.1 * s], scale: [0.9, 0.78, 1.7] }, 18),
    ]
    const plain = []
    // Freckles on her back.
    const r = rng(5)
    for (let i = 0; i < 12; i++) {
      const a = (r() - 0.5) * 1.5
      const z = (r() - 0.6) * 1.9 * s
      const rr = 0.8 * s * Math.sqrt(Math.max(0.05, 1 - (z / (1.4 * s)) ** 2))
      plain.push(P.sphere((0.05 + r() * 0.05) * s, '#8CA3C4', { at: [Math.sin(a) * rr * 0.92, Math.cos(a) * rr * 0.86 + 0.01, z], scale: [1, 0.3, 1] }, 8))
    }
    // Her face, on the front: eyes with a shine, pink cheeks, a smile.
    for (const side of [-1, 1]) {
      plain.push(P.sphere(0.085 * s, PAL.ink, { at: [side * 0.36 * s, 0.14 * s, 1.08 * s] }, 10))
      plain.push(P.sphere(0.03 * s, '#FFFFFF', { at: [side * 0.34 * s, 0.18 * s, 1.15 * s] }, 8))
      plain.push(P.sphere(0.11 * s, '#FFB3CF', { at: [side * 0.46 * s, -0.04 * s, 0.98 * s], scale: [1, 0.6, 0.5] }, 8))
    }
    plain.push(P.torus(0.14 * s, 0.025 * s, PAL.ink, { at: [0, -0.02 * s, 1.3 * s], rot: [0.5, 0, 0] }, Math.PI).rotateZ(Math.PI).translate(0, -0.04 * s, 0))
    // The tusk: a long thin cone with a spiral of gold beads, like a unicorn's horn.
    parts.push(P.cone(0.075 * s, 1.5 * s, '#FFF7E0', { at: [0, 0.3 * s, 2.02 * s], rot: [Math.PI / 2 - 0.16, 0, 0] }, 10))
    for (let i = 0; i < 9; i++) {
      const k = i / 9
      const a = k * Math.PI * 5
      const rr = 0.07 * s * (1 - k)
      plain.push(P.sphere(0.022 * s, PAL.gold, { at: [Math.sin(a) * rr, 0.19 * s + k * 1.42 * s * 0.16 + Math.cos(a) * rr, 1.32 * s + k * 1.4 * s] }, 6))
    }
    this.body.add(solidMix(parts, plain, bag, 3))
    // Flippers, each on a hinge at her side.
    for (const side of [-1, 1]) {
      const f = new Group()
      f.add(solid(P.sphere(0.3 * s, skin, { at: [side * 0.22 * s, 0, 0], scale: [1, 0.16, 0.6] }, 12), bag, 2.5))
      f.position.set(side * 0.62 * s, -0.3 * s, 0.35 * s)
      this.body.add(f)
      this.flips.push(f)
    }
    // The tail: a stalk and two flukes, on a hinge behind her.
    this.tail = new Group()
    this.tail.add(solid(merge([P.sphere(0.3 * s, skin, { at: [0, 0, -0.3 * s], scale: [0.7, 0.6, 1.5] }, 12), ...[-1, 1].map((side) => P.sphere(0.34 * s, skin, { at: [side * 0.3 * s, 0, -0.78 * s], scale: [1, 0.16, 0.62], rot: [0, side * 0.5, 0] }, 12))]), bag, 2.5))
    this.tail.position.set(0, 0.02 * s, -1.2 * s)
    this.body.add(this.tail)
    this.root.add(this.body)
    this.saddle = new Group()
    this.saddle.position.set(0, 0.66 * s, -0.1 * s)
    this.body.add(this.saddle)
  }
  /** Where riders sit: add them here (it bobs and dives with her). */
  readonly saddle: Group

  /** The tip of her tusk, in the world. */
  tip(out = new Vector3()) {
    return this.body.localToWorld(out.set(0, 0.52 * (this.length / 3.4), 2.7 * (this.length / 3.4)))
  }
  update(dt: number, t: number) {
    const target = speechLevel('nari')
    this.level += (target - this.level) * (1 - Math.exp(-dt * 18))
    const beat = 2.4 + this.speed * 6
    this.body.position.y = 0.2 + Math.sin(t * 1.5 + this.phase) * 0.07 - this.dive
    this.body.rotation.x = Math.sin(t * 1.5 + this.phase + 1) * 0.05 - this.level * 0.12
    this.body.rotation.z = Math.sin(t * 1.1 + this.phase) * 0.04
    this.tail.rotation.x = Math.sin(t * beat + this.phase) * (0.22 + this.speed * 0.3)
    this.flips.forEach((f, i) => (f.rotation.z = (i ? 1 : -1) * (0.25 + 0.2 * Math.sin(t * 2.2 + i))))
    this.body.scale.setScalar(1 + this.level * 0.05)
  }
}

// ---------------------------------------------------------------- ice, snow and mountains

/** A floe: a flat slab of sea ice with a ragged outline, its top at y = `top`. `r`: about how far across (m). */
export function floeGeo(r: number, seed: number, top = 0.18, thick = 0.5) {
  const rand = rng(seed)
  const n = 7 + Math.floor(rand() * 3)
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const rr = r * (0.78 + rand() * 0.34)
    pts.push([Math.cos(a) * rr, Math.sin(a) * rr])
  }
  const g = P.prism(pts, thick, ICE).rotateX(-Math.PI / 2).translate(0, top - thick / 2, 0)
  // The sides a shade bluer than the top, so the slab reads as thick ice, not paper.
  const pos = g.attributes.position
  const col = g.attributes.color
  const c = new Color(ICE_SHADE)
  for (let i = 0; i < pos.count; i++) if (pos.getY(i) < top - 0.01) col.setXYZ(i, c.r, c.g, c.b)
  return g
}

/** A pointy northern iceberg (several leaning peaks on a base). The origin is at the waterline. */
export function bergGeo(size: number, seed: number) {
  const rand = rng(seed)
  const parts = [P.cyl(size * 0.9, size * 1.05, size * 0.5, ICE_SHADE, { at: [0, size * 0.1, 0] }, 7)]
  const n = 3 + Math.floor(rand() * 2)
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2
    const d = rand() * size * 0.5
    const h = size * (1.1 + rand() * 1.3)
    parts.push(P.cone(size * (0.38 + rand() * 0.25), h, i % 2 ? ICE : '#E6F1FF', { at: [Math.cos(a) * d, h / 2 + size * 0.2, Math.sin(a) * d], rot: [(rand() - 0.5) * 0.3, rand() * 3, (rand() - 0.5) * 0.3] }, 5))
  }
  return merge(parts)
}

/** A flat southern iceberg: a table of ice with a blue band at the waterline. */
export function tableBergGeo(w: number, d: number, h: number) {
  return merge([P.rbox(w, h, d, 0.25, ICE, { at: [0, h / 2, 0] }), P.rbox(w * 1.01, h * 0.22, d * 1.01, 0.1, ICE_BLUE, { at: [0, h * 0.11, 0] })])
}

/** A snowy mountain: a blue-grey cone with a white cap. */
export function mountainGeo(r: number, h: number, seed: number) {
  const rand = rng(seed)
  const rot: [number, number, number] = [0, rand() * 3, 0]
  return merge([P.cone(r, h, '#C6D3EC', { at: [0, h / 2, 0], rot }, 6), P.cone(r * 0.56, h * 0.56, SNOW, { at: [0, h * 0.73, 0], rot }, 6), P.cone(r * 0.7, h * 0.5, '#D9E3F5', { at: [r * 0.5, h * 0.25, r * 0.2], rot }, 5)])
}

/** A soft snow drift: a low wide mound. */
export const driftGeo = (r: number, h: number) => P.sphere(r, SNOW, { scale: [1, h / r, 0.7] }, 14)

// ---------------------------------------------------------------- the sky

/** Stars over the long night: a dome of little points that twinkle (`update(t)`), `opacity` to fade them in. */
export class Stars {
  readonly points: Points
  private mat: PointsMaterial
  constructor(bag: Bag, n = 220, radius = 180) {
    const rand = rng(21)
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const up = 0.08 + rand() * 0.9
      const r = Math.sqrt(1 - up * up)
      pos.set([Math.cos(a) * r * radius, up * radius, Math.sin(a) * r * radius], i * 3)
    }
    const g = bag.add(new BufferGeometry())
    g.setAttribute('position', new BufferAttribute(pos, 3))
    this.mat = bag.add(new PointsMaterial({ color: '#FFFFFF', size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }))
    this.points = new Points(g, this.mat)
    this.points.frustumCulled = false
  }
  set opacity(a: number) {
    this.mat.opacity = a
    this.points.visible = a > 0.01
  }
  update(t: number) {
    this.mat.size = 2.4 + 0.5 * Math.sin(t * 2.2)
  }
}

/** The polar lights: tall curtains of green and pink (or lilac) that ripple across the night sky. `amount` 0..1
 *  fades them in; a tap can `flare()` them. */
export class Aurora {
  readonly root = new Group()
  private mat: ShaderMaterial
  private flareT = 0
  amount = 0

  constructor(bag: Bag, low = '#8FE3C8', high = '#FF8FB8') {
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uAmount: { value: 0 }, uLow: { value: new Color(low) }, uHigh: { value: new Color(high) } },
        vertexShader: /* glsl */ `
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            // The curtain's folds: it waves toward and away as it goes along.
            p.z += sin(p.x * 0.09 + uTime * 0.6) * 9.0 + sin(p.x * 0.23 - uTime * 0.9) * 3.0;
            p.y += sin(p.x * 0.05 + uTime * 0.4) * 4.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }`,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform float uAmount;
          uniform vec3 uLow;
          uniform vec3 uHigh;
          varying vec2 vUv;
          void main() {
            // Bright along the bottom edge, fading up; streaked with rays that drift along.
            float rays = 0.55 + 0.45 * sin(vUv.x * 90.0 + uTime * 1.3 + sin(vUv.x * 17.0) * 2.0);
            float up = smoothstep(0.0, 0.08, vUv.y) * pow(1.0 - vUv.y, 1.6);
            float ends = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x);
            vec3 col = mix(uLow, uHigh, smoothstep(0.15, 0.85, vUv.y));
            gl_FragColor = vec4(col, up * rays * ends * uAmount * 0.85);
            #include <colorspace_fragment>
          }`,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        fog: false,
      }),
    )
    for (const [x, y, z, w, h, yaw] of [[-30, 62, -150, 240, 70, 0.1], [50, 78, -165, 200, 60, -0.2], [-80, 70, -120, 160, 55, 0.5]] as const) {
      const m = new Mesh(bag.add(new PlaneGeometry(w, h, 64, 1)), this.mat)
      m.position.set(x, y, z)
      m.rotation.y = yaw
      m.frustumCulled = false
      m.renderOrder = -1
      this.root.add(m)
    }
  }
  flare() {
    this.flareT = 1
  }
  update(dt: number, t: number) {
    this.flareT = Math.max(0, this.flareT - dt * 0.7)
    this.mat.uniforms.uTime.value = t * (1 + this.flareT * 2)
    this.mat.uniforms.uAmount.value = this.amount * (1 + this.flareT * 0.8)
    this.root.visible = this.amount > 0.01
  }
}

/** A round sun or moon in the sky (a flat disc that always faces the camera's side of the set, with a soft halo). */
export function skyDisc(bag: Bag, r: number, color: string, halo: string) {
  const g = new Group()
  const disc = new Mesh(bag.add(P.cyl(r, r, 0.01, color, { rot: [Math.PI / 2, 0, 0] }, 28)), bag.add(new MeshBasicMaterial({ color, fog: false, depthWrite: false })))
  const glow = new Mesh(bag.add(P.cyl(r * 1.7, r * 1.7, 0.01, halo, { at: [0, 0, -0.5], rot: [Math.PI / 2, 0, 0] }, 28)), bag.add(new MeshBasicMaterial({ color: halo, transparent: true, opacity: 0.28, fog: false, depthWrite: false })))
  glow.renderOrder = -3
  disc.renderOrder = -2
  g.add(glow, disc)
  return g
}
