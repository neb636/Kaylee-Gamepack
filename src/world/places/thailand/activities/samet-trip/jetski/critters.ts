// The bay's life, in the toon look: swimmers bobbing in their rings by the sand (they squeal and wave when she zooms
// past, splash back when she pokes them), terns wheeling overhead and diving, fish that jump, and the banana boat
// towing its squealing riders round the outside of the rope. Simple, cute shapes: one mesh each.
import { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'

const ease = (k: number) => 1 - (1 - k) ** 3
const bell = (k: number) => Math.sin(Math.PI * Math.min(1, Math.max(0, k)))

/** A swimmer in a rubber ring: a round head (a little animal), the ring, and an arm that waves. */
export class Swimmer {
  readonly root = new Group()
  private arm = new Group()
  private arm2 = new Group()
  private waveT = -1
  private hopT = -1
  constructor(bag: Bag, i: number) {
    const kinds = [
      { fur: '#FFFFFF', ear: '#2B2330', ring: PAL.hotpink },
      { fur: '#E9B98A', ear: '#B9825A', ring: PAL.gold },
      { fur: '#C9A27E', ear: '#8E6A4E', ring: '#5FC8E8' },
      { fur: '#F6D9C9', ear: '#E8A9B6', ring: PAL.mint },
    ]
    const k = kinds[i % kinds.length]
    const head = merge([
      P.sphere(0.34, k.fur, { at: [0, 0.42, 0] }, 14),
      P.sphere(0.12, k.ear, { at: [0.24, 0.7, 0] }, 8),
      P.sphere(0.12, k.ear, { at: [-0.24, 0.7, 0] }, 8),
      P.sphere(0.05, PAL.ink, { at: [0.11, 0.48, 0.3] }, 6),
      P.sphere(0.05, PAL.ink, { at: [-0.11, 0.48, 0.3] }, 6),
      P.sphere(0.06, '#FF9DB8', { at: [0.2, 0.37, 0.27] }, 6),
      P.sphere(0.06, '#FF9DB8', { at: [-0.2, 0.37, 0.27] }, 6),
      P.sphere(0.24, k.fur, { at: [0, 0.08, 0], scale: [1.2, 0.7, 1] }, 10),
    ])
    this.root.add(solid(head, bag, 2))
    this.root.add(solid(merge([P.torus(0.42, 0.15, k.ring, { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] }), P.torus(0.42, 0.155, '#FFFFFF', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] }, Math.PI / 3)]), bag, 2))
    for (const [a, s] of [[this.arm, 1], [this.arm2, -1]] as const) {
      a.add(solid(merge([P.capsule(0.07, 0.32, k.fur, { at: [0, 0.2, 0] })]), bag, 2))
      a.position.set(s * 0.38, 0.12, 0)
      a.rotation.z = -s * 1.2
      this.root.add(a)
    }
  }
  /** Squeal and wave both arms (she zoomed past). */
  squeal() {
    if (this.waveT < 0) this.waveT = 0
  }
  /** A little hop up out of the ring (poked). */
  hop() {
    this.hopT = 0
    this.squeal()
  }
  get busy() {
    return this.waveT >= 0
  }
  update(dt: number, t: number, y: number, phase: number) {
    let lift = 0
    if (this.hopT >= 0) {
      this.hopT += dt / 0.6
      lift = bell(this.hopT) * 0.45
      if (this.hopT >= 1) this.hopT = -1
    }
    this.root.position.y = y - 0.12 + Math.sin(t * 2.1 + phase) * 0.04 + lift
    this.root.rotation.z = Math.sin(t * 1.3 + phase) * 0.06
    let w = 0
    if (this.waveT >= 0) {
      this.waveT += dt / 1.4
      w = bell(this.waveT)
      if (this.waveT >= 1) this.waveT = -1
    }
    this.arm.rotation.z = -1.2 + w * (2.0 + Math.sin(t * 18) * 0.35)
    this.arm2.rotation.z = 1.2 - w * (2.0 + Math.sin(t * 18 + 1) * 0.35)
  }
}

/** A tern: white with grey wings and a black cap. It wheels round a point and now and then dives into the sea. */
export class Tern {
  readonly root = new Group()
  private wingL = new Group()
  private wingR = new Group()
  private a: number
  private dive: { x: number; z: number; t: number } | null = null
  /** Splashed down this frame (where). */
  splash: { x: number; z: number } | null = null
  constructor(
    bag: Bag,
    public cx: number,
    public cz: number,
    private r: number,
    private h: number,
    private speed: number,
    seed: number,
  ) {
    this.a = seed
    this.root.add(
      solid(
        merge([
          P.capsule(0.13, 0.42, '#FFFFFF', { rot: [Math.PI / 2, 0, 0] }),
          P.sphere(0.13, '#2B2330', { at: [0, 0.06, 0.3] }, 8),
          P.cone(0.05, 0.22, '#FF8A3D', { at: [0, 0.03, 0.47], rot: [Math.PI / 2, 0, 0] }, 6),
          P.prism([[0, 0], [0.18, -0.32], [-0.18, -0.32]], 0.02, '#E4E6F0', { at: [0, 0, -0.42], rot: [Math.PI / 2, 0, 0] }),
        ]),
        bag,
        1.5,
      ),
    )
    for (const [w, s] of [[this.wingL, 1], [this.wingR, -1]] as const) {
      w.add(solid(P.prism([[0, -0.14], [0.85 * s, 0.05], [0.7 * s, 0.18], [0, 0.12]], 0.03, '#C9CCDD', { rot: [Math.PI / 2, 0, 0] }), bag, 1.5))
      this.root.add(w)
    }
  }
  /** Dive into the sea at (x, z). */
  diveAt(x: number, z: number) {
    if (!this.dive) this.dive = { x, z, t: 0 }
  }
  get diving() {
    return !!this.dive
  }
  update(dt: number, t: number) {
    this.splash = null
    let x: number
    let y: number
    let z: number
    this.a += (dt * this.speed) / this.r
    const ox = this.cx + Math.sin(this.a) * this.r
    const oz = this.cz + Math.cos(this.a) * this.r
    const oy = this.h + Math.sin(t * 0.7 + this.r) * 1.2
    let flap = Math.sin(t * 9 + this.r) * 0.5
    if (this.dive) {
      // Fold the wings, drop like a dart, splash, then flap back up to the circle.
      const d = this.dive
      d.t += dt / 2.2
      const k = d.t
      const down = Math.min(1, k / 0.4)
      const back = Math.max(0, (k - 0.5) / 0.5)
      x = ox + (d.x - ox) * (k < 0.5 ? ease(down) : 1 - ease(back))
      z = oz + (d.z - oz) * (k < 0.5 ? ease(down) : 1 - ease(back))
      y = k < 0.4 ? oy + (0.1 - oy) * down * down : k < 0.5 ? 0.1 : 0.1 + (oy - 0.1) * ease(back)
      if (k >= 0.4 && k - dt / 2.2 < 0.4) this.splash = { x: d.x, z: d.z }
      flap = k < 0.4 ? 0.7 : Math.sin(t * 16) * 0.8
      if (k >= 1) this.dive = null
    } else {
      x = ox
      y = oy
      z = oz
    }
    const px = this.root.position.x
    const pz = this.root.position.z
    if (Math.hypot(x - px, z - pz) > 1e-4) this.root.rotation.y = Math.atan2(x - px, z - pz)
    this.root.position.set(x, y, z)
    this.wingL.rotation.z = flap
    this.wingR.rotation.z = -flap
  }
}

/** Jumping fish: a little pool of them, each an arc out of the water and back with a plip. */
export class Fish {
  readonly root = new Group()
  private fish: { g: Group; x: number; z: number; h: number; t: number; dur: number; hi: number }[] = []
  constructor(bag: Bag, n = 14) {
    const colors = [PAL.hotpink, '#FF9A3D', '#5FC8E8', PAL.gold, '#B9A6F5']
    for (let i = 0; i < n; i++) {
      const c = colors[i % colors.length]
      const g = new Group()
      g.add(solid(merge([P.sphere(0.2, c, { scale: [0.55, 0.85, 1.5] }, 10), P.prism([[0, 0], [0.22, -0.2], [-0.22, -0.2]], 0.04, c, { at: [0, 0, -0.3], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.035, PAL.ink, { at: [0.09, 0.06, 0.18] }, 6), P.sphere(0.035, PAL.ink, { at: [-0.09, 0.06, 0.18] }, 6)]), bag, 1.5))
      g.visible = false
      this.root.add(g)
      this.fish.push({ g, x: 0, z: 0, h: 0, t: 1, dur: 1, hi: 1 })
    }
  }
  /** One jumps at (x, z), heading `h`. Returns false when they're all in the air. */
  jump(x: number, z: number, h = Math.random() * Math.PI * 2, hi = 1.1 + Math.random() * 0.8) {
    const f = this.fish.find((f) => f.t >= 1)
    if (!f) return false
    Object.assign(f, { x, z, h, t: 0, dur: 0.75 + hi * 0.2, hi })
    f.g.visible = true
    return true
  }
  /** Where fish went in or came out this frame (for the plips and splashes). */
  plips: { x: number; z: number }[] = []
  update(dt: number, water: (x: number, z: number) => number) {
    this.plips.length = 0
    for (const f of this.fish) {
      if (f.t >= 1) continue
      const before = f.t
      f.t = Math.min(1, f.t + dt / f.dur)
      const s = (f.t - 0.5) * 2.4
      const x = f.x + Math.sin(f.h) * s
      const z = f.z + Math.cos(f.h) * s
      f.g.position.set(x, water(x, z) + bell(f.t) * f.hi - 0.15, z)
      f.g.rotation.set(-Math.cos(f.t * Math.PI) * 1.0, f.h, 0)
      if (before === 0 || f.t >= 1) this.plips.push({ x, z })
      if (f.t >= 1) f.g.visible = false
    }
  }
}

/** The banana boat: a little speedboat towing a big yellow banana with three riders on it. Poke it and everyone falls
 *  off (splash!), then they climb back on. */
export class BananaBoat {
  readonly root = new Group()
  readonly boat = new Group()
  readonly banana = new Group()
  private riders: Group[] = []
  private offT = -1
  constructor(bag: Bag) {
    this.boat.add(solid(merge([P.rbox(1.6, 0.6, 4, 0.25, '#FFFFFF', { at: [0, 0.2, 0] }), P.box(1.62, 0.12, 3.6, '#3F8FE8', { at: [0, 0.18, -0.1] }), P.rbox(1.0, 0.5, 0.9, 0.12, '#CFEFFF', { at: [0, 0.65, 0.4] }), P.sphere(0.25, '#E9B98A', { at: [0, 0.9, -0.5] }, 10)]), bag, 2))
    this.banana.add(solid(merge([P.capsule(0.42, 3.2, '#FFD93D', { rot: [Math.PI / 2, 0, 0] }), P.cone(0.32, 0.6, '#8A6A3E', { at: [0, 0.1, 2.3], rot: [Math.PI / 2 - 0.4, 0, 0] }, 8), P.capsule(0.2, 2.8, '#FFC81F', { at: [0.55, -0.15, -0.2], rot: [Math.PI / 2, 0, 0] }), P.capsule(0.2, 2.8, '#FFC81F', { at: [-0.55, -0.15, -0.2], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
    const furs = ['#F6D9C9', '#E9B98A', '#FFFFFF']
    for (let i = 0; i < 3; i++) {
      const r = new Group()
      r.add(solid(merge([P.sphere(0.28, furs[i], { at: [0, 0.75, 0] }, 12), P.capsule(0.22, 0.25, i === 1 ? PAL.hotpink : '#FF9A3D', { at: [0, 0.3, 0] }), P.sphere(0.04, PAL.ink, { at: [0.1, 0.8, 0.25] }, 6), P.sphere(0.04, PAL.ink, { at: [-0.1, 0.8, 0.25] }, 6)]), bag, 2))
      r.position.set(0, 0.3, 1 - i * 1.1)
      this.banana.add(r)
      this.riders.push(r)
    }
    this.root.add(this.boat, this.banana)
  }
  /** Everyone falls off. False if they're already in the water. */
  tip() {
    if (this.offT >= 0) return false
    this.offT = 0
    return true
  }
  get tipped() {
    return this.offT >= 0
  }
  /** Splash points this frame (riders hitting the water). */
  splashes: { x: number; z: number }[] = []
  update(dt: number, t: number) {
    this.splashes.length = 0
    this.banana.rotation.z = Math.sin(t * 2.4) * 0.12
    this.riders.forEach((r, i) => {
      let off = 0
      let y = 0.3 + Math.abs(Math.sin(t * 6 + i)) * 0.12
      if (this.offT >= 0) {
        const k = this.offT * 1.8 - i * 0.12
        off = Math.min(1, Math.max(0, k))
        if (k > 0.35 && k - dt * 1.8 <= 0.35) {
          const w = r.getWorldPosition(r.position.clone())
          this.splashes.push({ x: w.x, z: w.z })
        }
        // Over the side, under, bob, then back on.
        const back = Math.max(0, Math.min(1, (this.offT - 2.4) / 0.6))
        y = 0.3 + bell(off * 0.7) * 1.2 - off * 0.9 + back * 0.9
        r.position.x = (i % 2 ? 1 : -1) * (off * 1.6) * (1 - back)
        r.rotation.z = (i % 2 ? -1 : 1) * off * 1.4 * (1 - back)
      }
      r.position.y = y
    })
    if (this.offT >= 0) {
      this.offT += dt
      if (this.offT > 3.2) {
        this.offT = -1
        this.riders.forEach((r) => (r.position.x = r.rotation.z = 0))
      }
    }
  }
}
