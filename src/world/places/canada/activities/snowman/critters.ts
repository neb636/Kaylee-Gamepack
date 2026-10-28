// The carnival's other life, code-built in the toon look: the horse and carriage (a calèche) that clip-clops along the
// terrace under the castle, the big red carnival trumpet on its striped stand, a red fox who trots in to watch and
// dives nose first into the snow after a mouse, and Canada geese flying over in a V. Each one moves by itself and
// reacts to a tap; the world (carnival.ts) decides when they come and what she hears.
import { Group, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span, wobble } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { tone, noise } from '../../../../kit/sfx'
import { CLIFF_Y, TERRACE_Z, TRUMPET } from './park'

const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
const smooth = (p: number) => {
  const k = clamp(p)
  return k * k * (3 - 2 * k)
}

// ---------------------------------------------------------------- the horse and carriage

const HORSE = '#C08A62'
const HORSE_LIGHT = '#EBD0B4'
const MANE = '#5A3B2E'
const HOOF = '#3E3040'
const CARRIAGE = '#D8423E'
const CARRIAGE_DARK = '#3E3550'
const GOLD = '#F3C04F'

/** A hoof on the cobbles: clip, then clop a little lower. */
const hoof = (hi: boolean) => {
  tone(hi ? 1250 : 980, hi ? 900 : 720, 0.05, 0.035, 'triangle')
  noise(0.04, 0.03, 'bandpass', 2400, 1600)
}
/** A happy whinny: up, a wobble, down. */
export const whinny = () => {
  for (let i = 0; i < 6; i++) tone(820 + Math.sin(i * 1.7) * 160 + i * 40, 760 + Math.sin(i * 1.7 + 1) * 160, 0.09, 0.04, 'sawtooth', i * 0.08)
  tone(700, 380, 0.3, 0.035, 'sawtooth', 0.48)
}

/** The calèche: a chestnut horse in a red blanket with a pink plume, pulling a red carriage with big wheels and a driver
 *  bundled up in a coat and tuque. It crosses the terrace now and then (go) and a tap makes the horse toss her head. */
export class Carriage {
  readonly root = new Group()
  private horse = new Group()
  private head = new Group()
  private tail = new Group()
  private legs: Group[] = []
  private wheels: { g: Group; r: number }[] = []
  private dir = 1
  private x = 0
  private t = -1
  private gait = 0
  private lastStep = 0
  private tossT = -1
  private stopT = 0
  /** It's on its way along the terrace. */
  get passing() {
    return this.t >= 0
  }
  constructor(bag: Bag) {
    // Built facing +z; the root turns it to face the way it goes.
    const r = this.root
    r.add(blobShadow(1.6, bag))
    r.add(this.horse)
    const h = this.horse
    h.add(
      solidMix(
        [
          P.capsule(0.36, 0.85, HORSE, { at: [0, 1.0, 0], rot: [Math.PI / 2, 0, 0] }),
          P.capsule(0.19, 0.42, HORSE, { at: [0, 1.38, 0.62], rot: [0.62, 0, 0] }),
          // The red blanket with its gold edge, and the harness.
          P.rbox(0.8, 0.3, 0.86, 0.1, CARRIAGE, { at: [0, 1.3, -0.05] }),
          P.box(0.82, 0.08, 0.88, GOLD, { at: [0, 1.15, -0.05] }),
          P.torus(0.3, 0.05, CARRIAGE_DARK, { at: [0, 1.15, 0.5], rot: [0.5, 0, 0] }),
          // The shafts back to the carriage.
          ...[-1, 1].map((s) => P.cyl(0.035, 0.035, 2.0, '#6E4B3B', { at: [s * 0.44, 0.98, -0.75], rot: [Math.PI / 2, 0, 0] }, 6)),
        ],
        [],
        bag,
        1.6,
      ),
    )
    this.head.position.set(0, 1.68, 0.82)
    h.add(this.head)
    this.head.add(
      solidMix(
        [
          P.rbox(0.3, 0.32, 0.62, 0.14, HORSE, { at: [0, -0.02, 0.18], rot: [0.55, 0, 0] }),
          P.sphere(0.17, HORSE_LIGHT, { at: [0, -0.2, 0.42], scale: [1, 0.85, 1] }),
          ...[-1, 1].map((s) => P.cone(0.06, 0.2, HORSE, { at: [s * 0.1, 0.24, -0.04], rot: [0, 0, -s * 0.2] }, 8)),
          // The mane down her neck, and the forelock.
          ...[0, 1, 2, 3].map((i) => P.sphere(0.09, MANE, { at: [0, 0.12 - i * 0.16, -0.12 - i * 0.12] }, 8)),
          // The pink carnival plume.
          P.cyl(0.02, 0.02, 0.2, GOLD, { at: [0, 0.3, 0.02] }, 6),
          P.sphere(0.13, PAL.hotpink, { at: [0, 0.46, 0.02], scale: [1, 1.4, 1] }, 10),
        ],
        [...[-1, 1].map((s) => P.sphere(0.04, PAL.ink, { at: [s * 0.15, 0.05, 0.16] }, 8)), ...[-1, 1].map((s) => P.sphere(0.025, PAL.ink, { at: [s * 0.06, -0.24, 0.57] }, 6))],
        bag,
        1.6,
      ),
    )
    for (const [x, z] of [
      [-0.2, 0.42],
      [0.2, 0.42],
      [-0.2, -0.42],
      [0.2, -0.42],
    ]) {
      const leg = new Group()
      leg.position.set(x, 0.86, z)
      leg.add(solid(merge([P.cyl(0.075, 0.065, 0.74, HORSE, { at: [0, -0.37, 0] }, 8), P.cyl(0.095, 0.1, 0.13, HOOF, { at: [0, -0.8, 0] }, 8), P.cyl(0.085, 0.085, 0.1, '#FFFFFF', { at: [0, -0.68, 0] }, 8)]), bag, 1.4))
      h.add(leg)
      this.legs.push(leg)
    }
    this.tail.position.set(0, 1.15, -0.78)
    h.add(this.tail)
    this.tail.add(solid(P.capsule(0.09, 0.5, MANE, { at: [0, -0.3, -0.06], rot: [0.25, 0, 0] }), bag, 1.4))

    // The carriage: a red body with a black trim, a bench up front for the driver, the folded hood behind.
    const cz = -2.65
    const body: BufferGeometry[] = [
      P.rbox(1.15, 0.5, 1.7, 0.12, CARRIAGE, { at: [0, 0.92, cz] }),
      P.box(1.19, 0.08, 1.74, CARRIAGE_DARK, { at: [0, 1.17, cz] }),
      P.rbox(1.0, 0.5, 0.18, 0.06, CARRIAGE, { at: [0, 1.42, cz - 0.55] }),
      P.rbox(1.05, 0.14, 0.5, 0.05, '#F6EEE4', { at: [0, 1.22, cz - 0.3] }),
      P.sphere(0.6, CARRIAGE_DARK, { at: [0, 1.35, cz - 0.75], scale: [0.95, 0.75, 0.55] }),
      P.rbox(0.9, 0.3, 0.35, 0.06, CARRIAGE_DARK, { at: [0, 1.2, cz + 0.65] }),
      // The driver: a round coat, a round face, a red tuque with a pompom and a long scarf.
      P.capsule(0.22, 0.22, '#7D6AA6', { at: [0, 1.65, cz + 0.6] }),
      P.sphere(0.18, '#F4CDB0', { at: [0, 2.08, cz + 0.62] }),
      P.sphere(0.19, CARRIAGE, { at: [0, 2.17, cz + 0.6], scale: [1, 0.75, 1] }),
      P.sphere(0.07, '#FFFFFF', { at: [0, 2.36, cz + 0.58] }, 8),
      P.torus(0.17, 0.06, PAL.butter, { at: [0, 1.88, cz + 0.6], rot: [Math.PI / 2, 0, 0] }),
    ]
    r.add(solid(merge(body), bag, 1.6))
    for (const [x, z, rr] of [
      [-0.68, cz - 0.5, 0.55],
      [0.68, cz - 0.5, 0.55],
      [-0.62, cz + 0.6, 0.38],
      [0.62, cz + 0.6, 0.38],
    ]) {
      const g = new Group()
      g.position.set(x, rr, z)
      const parts: BufferGeometry[] = [P.torus(rr, 0.05, CARRIAGE_DARK, { rot: [0, Math.PI / 2, 0] }), P.sphere(0.08, GOLD, {}, 8)]
      for (let i = 0; i < 6; i++) parts.push(P.box(0.03, rr * 2, 0.04, GOLD, { rot: [(i / 6) * Math.PI, 0, 0] }))
      g.add(solid(merge(parts), bag, 1.2))
      r.add(g)
      this.wheels.push({ g, r: rr })
    }
    this.root.visible = false
  }

  /** Across the terrace, from one end to the other (`dir` +1 = to the right). */
  go(dir: 1 | -1) {
    if (this.t >= 0) return
    this.dir = dir
    this.x = -dir * 34
    this.t = 0
    this.root.visible = true
  }
  /** She tossed her head (a tap): the carriage stops a moment. */
  poke() {
    if (this.tossT < 0) this.tossT = 0
    this.stopT = 1.4
  }
  /** The horse's middle, in the world (the tap target). */
  center(out: Vector3) {
    return this.horse.localToWorld(out.set(0, 1.2, 0.3))
  }
  /** One frame; `near`: how close the camera's look is (x), so the hooves are heard only when she can see it. */
  update(dt: number, t: number, near: number) {
    if (this.t < 0) return
    this.t += dt
    this.stopT = Math.max(0, this.stopT - dt)
    const speed = this.stopT > 0 ? 0 : 1.9
    this.gait += ((speed ? 1 : 0) - this.gait) * ease(dt, 4)
    this.x += this.dir * speed * dt
    this.root.position.set(this.x, CLIFF_Y + 0.33, TERRACE_Z)
    this.root.rotation.y = (this.dir * Math.PI) / 2
    // The walk: diagonal legs together, a bob, the head nods with each step, the tail swishes.
    const ph = this.t * 5.2
    const g = this.gait
    this.legs.forEach((leg, i) => {
      const diag = i === 0 || i === 3 ? 0 : Math.PI
      leg.rotation.x = Math.sin(ph + diag) * 0.5 * g
    })
    const step = Math.floor((ph + Math.PI / 2) / Math.PI)
    if (step !== this.lastStep) {
      this.lastStep = step
      if (g > 0.5 && Math.abs(this.x - near) < 16) hoof(step % 2 === 0)
    }
    this.horse.position.y = Math.abs(Math.sin(ph)) * 0.05 * g
    let toss = 0
    if (this.tossT >= 0) {
      this.tossT += dt
      toss = bell(span(this.tossT, 0, 0.5)) + wobble(span(this.tossT, 0.5, 1.3), 2) * 0.4
      if (this.tossT > 1.3) this.tossT = -1
    }
    this.head.rotation.x = Math.sin(ph * 2) * 0.08 * g - toss * 0.6
    this.head.rotation.z = toss * 0.25 * Math.sin(this.tossT * 12)
    this.horse.rotation.x = -toss * 0.12
    this.tail.rotation.z = Math.sin(t * 2.3) * 0.3
    this.tail.rotation.x = Math.sin(t * 1.7) * 0.15
    for (const w of this.wheels) w.g.rotation.x += (speed * dt) / w.r
    if (Math.abs(this.x) > 35) {
      this.t = -1
      this.root.visible = false
    }
  }
}

// ---------------------------------------------------------------- the carnival trumpet

/** The carnival's long red plastic trumpet (people blow them all through the carnival), on a candy-striped stand. */
export class Trumpet {
  readonly root = new Group()
  private horn = new Group()
  private bellG = new Group()
  private tootT = -1
  constructor(bag: Bag) {
    this.root.position.set(TRUMPET.x, 0, TRUMPET.z)
    const stand: BufferGeometry[] = [P.cyl(0.42, 0.5, 0.18, '#E8443F', { at: [0, 0.09, 0] }, 14)]
    for (let i = 0; i < 6; i++) stand.push(P.cyl(0.08, 0.08, 0.3, i % 2 ? '#FFFFFF' : '#E8443F', { at: [0, 0.33 + i * 0.3, 0] }, 10))
    this.root.add(solid(merge(stand), bag, 1.4))
    this.horn.position.set(0, 2.05, 0)
    this.horn.rotation.set(0, -0.55, 0.38)
    this.root.add(this.horn)
    // Along +x from the mouthpiece to the bell.
    this.horn.add(
      solid(
        merge([
          P.cyl(0.09, 0.13, 1.6, '#E8443F', { at: [0.25, 0, 0], rot: [0, 0, -Math.PI / 2] }, 14),
          P.cyl(0.11, 0.08, 0.2, GOLD, { at: [-0.62, 0, 0], rot: [0, 0, -Math.PI / 2] }, 12),
          P.torus(0.13, 0.035, GOLD, { at: [0.6, 0, 0], rot: [0, Math.PI / 2, 0] }),
          P.cyl(0.05, 0.05, 0.4, PAL.ink, { at: [0, -0.2, 0] }, 6),
        ]),
        bag,
        1.6,
      ),
    )
    this.bellG.position.set(1.05, 0, 0)
    this.horn.add(this.bellG)
    this.bellG.add(solidMix([P.cyl(0.5, 0.14, 0.55, '#E8443F', { at: [0, 0, 0], rot: [0, 0, -Math.PI / 2] }, 18), P.torus(0.5, 0.05, GOLD, { at: [0.28, 0, 0], rot: [0, Math.PI / 2, 0] })], [P.cyl(0.44, 0.44, 0.02, '#9E2B30', { at: [0.27, 0, 0], rot: [0, 0, -Math.PI / 2] }, 18)], bag, 1.6))
  }
  /** Where the sound comes out (the notes fly from here). */
  bellAt(out: Vector3) {
    return this.bellG.localToWorld(out.set(0.4, 0, 0))
  }
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, 1.6, 0))
  }
  toot() {
    this.tootT = 0
  }
  update(dt: number, t: number) {
    let k = 0
    if (this.tootT >= 0) {
      this.tootT += dt
      // Three blasts: the bell swells with each, and the horn kicks up.
      k = Math.max(0, Math.sin((this.tootT / 0.62) * Math.PI * 3)) * (1 - span(this.tootT, 0.4, 0.62))
      if (this.tootT > 0.62) this.tootT = -1
    }
    const s = 1 + k * 0.35
    this.bellG.scale.set(1 - k * 0.15, s, s)
    this.horn.rotation.z = 0.38 + k * 0.12 + Math.sin(t * 1.3) * 0.02
  }
}

// ---------------------------------------------------------------- the red fox

const FOX = '#EE8A3C'
const FOX_DARK = '#4A3328'
type FoxState = 'away' | 'in' | 'sit' | 'crouch' | 'leap' | 'dive' | 'out' | 'leave'

/** A red fox who trots into the park now and then to watch the snowballs. A tap: she crouches, leaps and dives nose
 *  first into the snow after a mouse (that's how foxes hunt), her tail wiggling in the air, then pops out and shakes. */
export class Fox {
  readonly root = new Group()
  private body = new Group()
  private head = new Group()
  private tail = new Group()
  private legs: Group[] = []
  state: FoxState = 'away'
  private t = 0
  private x = 0
  private z = 0
  private yaw = 0
  private from = new Vector3()
  private to = { x: 0, z: 0 }
  private exit = { x: 0, z: 0 }
  private stay = 0
  constructor(bag: Bag) {
    this.root.add(blobShadow(0.55, bag), this.body)
    this.body.add(
      solidMix(
        [P.capsule(0.21, 0.42, FOX, { at: [0, 0.48, 0], rot: [Math.PI / 2, 0, 0] }), P.sphere(0.19, '#FFFFFF', { at: [0, 0.5, 0.3], scale: [0.9, 1.1, 0.7] })],
        [],
        bag,
        1.6,
      ),
    )
    this.head.position.set(0, 0.72, 0.36)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(0.2, FOX, { scale: [1.1, 0.95, 1] }),
          ...[-1, 1].map((s) => P.sphere(0.11, '#FFFFFF', { at: [s * 0.1, -0.07, 0.11], scale: [1, 0.8, 0.9] })),
          P.cone(0.1, 0.26, FOX, { at: [0, -0.04, 0.26], rot: [Math.PI / 2, 0, 0] }, 12),
          ...[-1, 1].map((s) => P.cone(0.09, 0.22, FOX, { at: [s * 0.12, 0.22, -0.02], rot: [0, 0, -s * 0.25] }, 10)),
          ...[-1, 1].map((s) => P.cone(0.04, 0.09, FOX_DARK, { at: [s * 0.143, 0.31, -0.02], rot: [0, 0, -s * 0.25] }, 8)),
        ],
        [P.sphere(0.04, PAL.ink, { at: [0, -0.04, 0.39] }, 8), ...[-1, 1].map((s) => P.sphere(0.032, PAL.ink, { at: [s * 0.09, 0.05, 0.17] }, 8))],
        bag,
        1.6,
      ),
    )
    for (const [x, z] of [
      [-0.1, 0.2],
      [0.1, 0.2],
      [-0.1, -0.2],
      [0.1, -0.2],
    ]) {
      const leg = new Group()
      leg.position.set(x, 0.38, z)
      leg.add(solid(P.cyl(0.045, 0.04, 0.38, FOX_DARK, { at: [0, -0.19, 0] }, 6), bag, 1.2))
      this.body.add(leg)
      this.legs.push(leg)
    }
    this.tail.position.set(0, 0.52, -0.3)
    this.body.add(this.tail)
    this.tail.add(solid(merge([P.sphere(0.15, FOX, { at: [0, 0.05, -0.28], scale: [0.8, 0.8, 1.9] }), P.sphere(0.1, '#FFFFFF', { at: [0, 0.08, -0.56], scale: [1, 1, 1.2] })]), bag, 1.4))
    this.root.scale.setScalar(1.3)
    this.root.visible = false
  }
  get here() {
    return this.state !== 'away'
  }
  /** She can be poked (not mid-dive). */
  get pokeable() {
    return this.state === 'sit' || this.state === 'in'
  }
  center(out: Vector3) {
    return out.set(this.x, 0.6, this.z)
  }
  get pos() {
    return { x: this.x, z: this.z }
  }
  /** Trots in from `from` to sit at `spot`, then leaves the same way after a while. */
  come(from: { x: number; z: number }, spot: { x: number; z: number }) {
    this.state = 'in'
    this.x = from.x
    this.z = from.z
    this.exit = { ...from }
    this.to = { ...spot }
    this.stay = 12
    this.root.visible = true
  }
  /** The pounce (a tap). Returns true if she went. */
  pounce() {
    if (!this.pokeable) return false
    this.state = 'crouch'
    this.t = 0
    return true
  }
  /** A ball rolling right at her: off she trots. */
  shoo() {
    if (this.state === 'sit' || this.state === 'in') {
      this.state = 'leave'
      this.to = { ...this.exit }
    }
  }
  /** One frame. Returns 'dive' the moment she lands in the snow (a puff and a poof there), 'yip' as she leaps. */
  update(dt: number, t: number): 'dive' | 'yip' | null {
    if (this.state === 'away') return null
    this.t += dt
    let ev: 'dive' | 'yip' | null = null
    let trot = 0
    let crouch = 0
    let lift = 0
    let pitch = 0
    let wig = 0
    const walk = (speed: number) => {
      const dx = this.to.x - this.x
      const dz = this.to.z - this.z
      const d = Math.hypot(dx, dz)
      if (d < 0.05) return true
      const s = Math.min(d, speed * dt)
      this.x += (dx / d) * s
      this.z += (dz / d) * s
      this.yaw = turn(this.yaw, Math.atan2(dx, dz), dt * 8)
      trot = 1
      return false
    }
    if (this.state === 'in') {
      if (walk(2.6)) {
        this.state = 'sit'
        this.t = 0
      }
    } else if (this.state === 'sit') {
      // Sitting, watching the snowballs: her head tips, her ears flick, her tail sweeps.
      this.yaw = turn(this.yaw, Math.atan2(-this.x * 0.2, 6 - this.z), dt * 2)
      if ((this.stay -= dt) < 0) {
        this.state = 'leave'
        this.to = { ...this.exit }
      }
    } else if (this.state === 'crouch') {
      crouch = smooth(this.t / 0.45)
      if (this.t > 0.45) {
        this.state = 'leap'
        this.t = 0
        this.from.set(this.x, 0, this.z)
        this.to = { x: this.x + Math.sin(this.yaw) * 1.6, z: this.z + Math.cos(this.yaw) * 1.6 }
        ev = 'yip'
      }
    } else if (this.state === 'leap') {
      // Up in a high arc, turning nose down to dive.
      const k = clamp(this.t / 0.75)
      this.x = this.from.x + (this.to.x - this.from.x) * k
      this.z = this.from.z + (this.to.z - this.from.z) * k
      lift = bell(k) * 1.5
      pitch = -0.6 + k * 2.2
      if (k >= 1) {
        this.state = 'dive'
        this.t = 0
        ev = 'dive'
      }
    } else if (this.state === 'dive') {
      // Head in the snow, back legs and tail wiggling in the air.
      pitch = 1.6
      lift = -0.25
      wig = 1
      if (this.t > 1.3) {
        this.state = 'out'
        this.t = 0
      }
    } else if (this.state === 'out') {
      // Pops out and shakes the snow off.
      const k = clamp(this.t / 0.35)
      pitch = 1.6 * (1 - smooth(k))
      lift = bell(k) * 0.4 - 0.25 * (1 - k)
      wig = this.t > 0.35 ? Math.max(0, 1 - (this.t - 0.35) / 0.6) : 0
      if (this.t > 1.0) {
        this.state = 'sit'
        this.stay = 6
        this.t = 0
      }
    } else if (this.state === 'leave') {
      if (walk(3)) {
        this.state = 'away'
        this.root.visible = false
      }
    }
    this.root.position.set(this.x, 0, this.z)
    this.root.rotation.y = this.yaw
    const sit = this.state === 'sit' ? 1 : 0
    this.body.position.y = lift + Math.abs(Math.sin(t * 12)) * 0.05 * trot - crouch * 0.12
    this.body.rotation.x = pitch - sit * 0.35
    this.body.rotation.z = this.state === 'out' ? Math.sin(this.t * 40) * 0.25 * wig : 0
    this.head.rotation.set(sit * 0.3 - crouch * 0.2, sit * Math.sin(t * 0.7) * 0.5, sit * Math.sin(t * 1.1) * 0.15)
    this.tail.rotation.set(-0.3 - sit * 0.5 + wig * Math.sin(t * 22) * 0.3, Math.sin(t * (wig ? 18 : 2.4)) * (wig ? 0.6 : 0.35), 0)
    this.legs.forEach((leg, i) => {
      const back = i >= 2
      leg.rotation.x = trot * Math.sin(t * 12 + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.7 + (back ? sit * 1.2 : 0) + (this.state === 'leap' ? (back ? -0.8 : 0.9) : 0) + (wig && back ? Math.sin(t * 26 + i) * 0.6 : 0)
    })
    return ev
  }
}

export const yip = () => {
  tone(900, 1500, 0.08, 0.05, 'triangle')
  tone(1000, 1600, 0.08, 0.04, 'triangle', 0.12)
}

// ---------------------------------------------------------------- the Canada geese

const GOOSE = '#9C8C80'
const GOOSE_DARK = '#3E3540'

/** A honk (two, a little apart). */
export const honk = (n = 2) => {
  for (let i = 0; i < n; i++) {
    tone(330 + i * 20, 290 + i * 20, 0.16, 0.05, 'square', i * 0.24)
    tone(660, 560, 0.12, 0.012, 'sawtooth', i * 0.24)
  }
}

/** Canada geese flying over in a V: brown-grey bodies, black necks and heads with the white chin strap. */
export class Geese {
  readonly root = new Group()
  private birds: { g: Group; wings: Group[]; ph: number }[] = []
  private t = -1
  private x1 = 0
  private dir = 1
  private flapT = -1
  get flying() {
    return this.t >= 0
  }
  constructor(bag: Bag) {
    const V = [
      [0, 0],
      [-1.4, -1.0],
      [-1.4, 1.0],
      [-2.8, -2.0],
      [-2.8, 2.0],
      [-4.2, -3.0],
      [-4.2, 3.0],
    ]
    const bodyGeo = () =>
      solidMix(
        [
          P.sphere(0.32, GOOSE, { scale: [1.6, 0.8, 0.8] }),
          P.sphere(0.18, '#FFFFFF', { at: [-0.45, -0.02, 0], scale: [0.8, 0.7, 0.8] }),
          P.capsule(0.07, 0.42, GOOSE_DARK, { at: [0.6, 0.12, 0], rot: [0, 0, -1.2] }),
          P.sphere(0.12, GOOSE_DARK, { at: [0.85, 0.22, 0], scale: [1.3, 0.9, 0.9] }),
          P.cone(0.05, 0.14, GOOSE_DARK, { at: [1.0, 0.2, 0], rot: [0, 0, -Math.PI / 2] }, 8),
        ],
        [...[-1, 1].map((s) => P.sphere(0.06, '#FFFFFF', { at: [0.84, 0.18, s * 0.08], scale: [1.4, 0.8, 0.5] }, 8))],
        bag,
        1.4,
      )
    for (const [dx, dz] of V) {
      const g = new Group()
      g.position.set(dx, 0, dz)
      g.add(bodyGeo())
      const wings: Group[] = []
      for (const s of [-1, 1]) {
        const w = new Group()
        w.position.set(0.05, 0.12, s * 0.18)
        w.add(solid(merge([P.rbox(0.5, 0.05, 0.85, 0.02, GOOSE, { at: [0, 0, s * 0.42] }), P.rbox(0.32, 0.055, 0.3, 0.02, GOOSE_DARK, { at: [-0.06, 0, s * 0.78] })]), bag, 1.2))
        g.add(w)
        wings.push(w)
      }
      this.root.add(g)
      this.birds.push({ g, wings, ph: Math.random() * 6 })
    }
    this.root.scale.setScalar(0.8)
    this.root.visible = false
  }
  /** Across from x0 to x1, at height y over z. */
  go(x0: number, x1: number, y: number, z: number) {
    if (this.t >= 0) return
    this.x1 = x1
    this.dir = Math.sign(x1 - x0) || 1
    this.t = 0
    this.root.position.set(x0, y, z)
    this.root.rotation.y = this.dir > 0 ? 0 : Math.PI
    this.root.visible = true
  }
  poke() {
    this.flapT = 0
  }
  center(out: Vector3) {
    return this.root.localToWorld(out.set(-1.6, 0, 0))
  }
  update(dt: number, t: number) {
    if (this.t < 0) return
    this.t += dt
    const fast = this.flapT >= 0 ? 1 : 0
    if (this.flapT >= 0 && (this.flapT += dt) > 1.2) this.flapT = -1
    this.root.position.x += this.dir * (3.6 + fast * 1.5) * dt
    for (const b of this.birds) {
      const a = Math.sin(t * (6 + fast * 6) + b.ph)
      b.wings[0].rotation.x = -a * 0.7
      b.wings[1].rotation.x = a * 0.7
      b.g.position.y = Math.sin(t * 1.4 + b.ph) * 0.15 + a * 0.05 + fast * Math.sin(t * 9 + b.ph) * 0.15
    }
    if ((this.dir > 0 && this.root.position.x > this.x1) || (this.dir < 0 && this.root.position.x < this.x1)) {
      this.t = -1
      this.root.visible = false
    }
  }
}

function turn(from: number, to: number, k: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + d * Math.min(1, k)
}
