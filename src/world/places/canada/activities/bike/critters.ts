// Mountain Bike's forest animals as greybox shapes in the toon look (the art gate builds them properly): a chipmunk who
// runs alongside, a moose in a pond who lifts his dripping head, a woodpecker drumming on a birch, a porcupine up a
// tree who puffs his quills, and a frog by the creek who jumps when she splashes. Each one has its own little action;
// the world (ride.ts) places them and says when.
import { Group } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const eyes = (x: number, y: number, z: number, r = 0.03) => [
  P.sphere(r, PAL.ink, { at: [x, y, z] }),
  P.sphere(r, PAL.ink, { at: [-x, y, z] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [-x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
]
const cheeks = (x: number, y: number, z: number, r = 0.04) => [P.sphere(r, PAL.pink, { at: [x, y, z], scale: [1, 0.6, 0.4] }), P.sphere(r, PAL.pink, { at: [-x, y, z], scale: [1, 0.6, 0.4] })]

/** Something with a little action: `t` counts up from 0 while it plays. */
abstract class Critter {
  readonly root = new Group()
  abstract readonly height: number
  protected t = -1
  protected phase = Math.random() * 6
  poke() {
    this.t = 0
  }
  get busy() {
    return this.t >= 0
  }
  protected tick(dt: number, len: number) {
    if (this.t < 0) return -1
    this.t += dt
    if (this.t > len) this.t = -1
    return this.t < 0 ? -1 : this.t / len
  }
  abstract update(dt: number, t: number): void
}

/** Runs along beside her on all fours, hopping; poked, he sits up and stuffs his cheeks. */
export class Chipmunk extends Critter {
  readonly height = 0.45
  private body = new Group()
  private cheeks: Group
  private tail = new Group()
  /** How fast he's running (0..1): the world sets it. */
  run = 0
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const brown = '#C98B55'
    this.body.add(
      solidMix(
        [
          P.sphere(0.13, brown, { at: [0, 0.14, 0], scale: [0.9, 0.85, 1.25] }),
          P.sphere(0.1, brown, { at: [0, 0.26, 0.15] }),
          P.sphere(0.035, brown, { at: [0.06, 0.35, 0.13] }),
          P.sphere(0.035, brown, { at: [-0.06, 0.35, 0.13] }),
        ],
        [
          // His stripes.
          P.box(0.03, 0.02, 0.26, PAL.ink, { at: [0, 0.255, 0], rot: [0.15, 0, 0] }),
          P.box(0.025, 0.02, 0.22, '#FFF2DE', { at: [0.05, 0.245, 0], rot: [0.15, 0, 0.3] }),
          P.box(0.025, 0.02, 0.22, '#FFF2DE', { at: [-0.05, 0.245, 0], rot: [0.15, 0, -0.3] }),
          P.sphere(0.05, '#FFF2DE', { at: [0, 0.23, 0.22], scale: [1, 0.7, 0.7] }),
          ...eyes(0.04, 0.29, 0.23, 0.022),
        ],
        bag,
        1.5,
      ),
    )
    this.cheeks = solid(merge([P.sphere(0.055, '#E6B07A', { at: [0.07, 0.24, 0.2] }), P.sphere(0.055, '#E6B07A', { at: [-0.07, 0.24, 0.2] })]), bag, 1.5)
    this.cheeks.scale.setScalar(0.4)
    this.body.add(this.cheeks)
    this.tail.position.set(0, 0.16, -0.14)
    this.tail.add(solid(merge([P.capsule(0.035, 0.18, brown, { at: [0, 0.1, -0.02], rot: [-0.4, 0, 0] })]), bag, 1.5))
    this.body.add(this.tail)
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 2)
    const run = this.run
    // Hops as he runs (faster when she's quick).
    const hop = Math.abs(Math.sin(t * 13 + this.phase)) * 0.12 * run
    this.body.position.y = hop
    this.body.rotation.x = run * 0.15 * Math.sin(t * 13 + this.phase)
    this.tail.rotation.x = -0.4 + 0.5 * Math.sin(t * 13 + this.phase + 1) * run + Math.sin(t * 2) * 0.1
    // Poked: sits up and his cheeks puff up full.
    const sit = k < 0 ? 0 : bell(span(k, 0, 1))
    this.body.rotation.x -= sit * 0.6
    this.cheeks.scale.setScalar(0.4 + 0.75 * sit)
  }
}

/** Stands in his pond, head down in the water chewing, then up with a dripping mouthful of weed. */
export class Moose extends Critter {
  readonly height = 2.5
  private neck = new Group()
  private ears: Group[] = []
  /** The world drips water off his chin when his head comes up (0..1 how high it is). */
  up = 0
  private nextLift = 4
  constructor(bag: Bag) {
    super()
    const brown = '#7A5240'
    const dark = '#5C3C30'
    const leg = (x: number, z: number) => P.cyl(0.08, 0.07, 1.1, dark, { at: [x, 0.55, z] }, 8)
    this.root.add(solid(merge([P.sphere(0.65, brown, { at: [0, 1.45, 0], scale: [0.85, 0.8, 1.6] }), P.sphere(0.4, brown, { at: [0, 1.75, 0.55] }), leg(0.3, 0.6), leg(-0.3, 0.6), leg(0.3, -0.65), leg(-0.3, -0.65)]), bag, 2.5))
    this.neck.position.set(0, 1.75, 0.8)
    this.root.add(this.neck)
    // The head on the neck: long nose, a beard, big flat antlers.
    const antler = (side: number) => [
      P.rbox(0.62, 0.08, 0.36, 0.04, '#E9D6B4', { at: [side * 0.42, 0.62, 0.42], rot: [0, side * 0.25, side * 0.35] }),
      ...[0, 1, 2].map((i) => P.cyl(0.03, 0.04, 0.2, '#E9D6B4', { at: [side * (0.55 + i * 0.11), 0.74 + i * 0.05, 0.38 + i * 0.05], rot: [0, 0, side * -0.4] }, 6)),
    ]
    this.neck.add(
      solidMix(
        [
          P.capsule(0.17, 0.5, brown, { at: [0, 0.25, 0.2], rot: [0.9, 0, 0] }),
          P.sphere(0.24, brown, { at: [0, 0.5, 0.5] }),
          P.capsule(0.15, 0.3, brown, { at: [0, 0.38, 0.8], rot: [1.25, 0, 0] }),
          P.sphere(0.07, dark, { at: [0, 0.1, 0.55], scale: [0.7, 1.6, 0.7] }),
          ...antler(1),
          ...antler(-1),
        ],
        [...eyes(0.13, 0.56, 0.68, 0.04), P.sphere(0.03, PAL.ink, { at: [0.06, 0.34, 1.03] }), P.sphere(0.03, PAL.ink, { at: [-0.06, 0.34, 1.03] })],
        bag,
        2.5,
      ),
    )
    for (const side of [1, -1]) {
      const e = new Group()
      e.position.set(side * 0.2, 0.68, 0.45)
      e.add(solid(merge([P.sphere(0.08, brown, { at: [side * 0.08, 0, 0], scale: [1.6, 0.6, 0.9] })]), bag, 1.5))
      this.neck.add(e)
      this.ears.push(e)
    }
  }
  update(dt: number, t: number) {
    // Head down chewing, up every so often (or when she pokes him) with water dripping off.
    this.nextLift -= dt
    if (this.nextLift < 0 && this.t < 0) {
      this.t = 0
      this.nextLift = 7 + Math.random() * 4
    }
    const k = this.tick(dt, 3.2)
    this.up = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.6
    this.neck.rotation.x = 1.05 * (1 - this.up) - 0.15 * this.up + Math.sin(t * 6) * 0.03 * (1 - this.up)
    this.ears.forEach((e, i) => (e.rotation.z = (i ? -1 : 1) * (0.2 + 0.25 * Math.sin(t * 3 + i * 2) * this.up)))
  }
  /** Where his chin is (the drips fall from there). */
  chin(out: import('three').Vector3) {
    return this.neck.localToWorld(out.set(0, 0.1, 1))
  }
}

/** Clings to a birch trunk, drumming now and then; poked, a fast drum roll. */
export class Woodpecker extends Critter {
  readonly height = 0.6
  private bird = new Group()
  /** How many pecks a second right now (the world plays a knock on each). */
  pecking = 0
  private nextDrum = 2
  private pecked = 0
  /** Counts up one per peck (the world knocks when it changes). */
  pecks = 0
  constructor(bag: Bag) {
    super()
    this.root.add(this.bird)
    this.bird.add(
      solidMix(
        [
          P.sphere(0.14, PAL.ink, { at: [0, 0.2, 0], scale: [0.85, 1.4, 0.8] }),
          P.sphere(0.11, '#FFFFFF', { at: [0, 0.42, 0.04] }),
          P.cone(0.07, 0.2, '#E8553F', { at: [0, 0.55, -0.02], rot: [-0.5, 0, 0] }, 8),
          P.cone(0.03, 0.17, '#4A4058', { at: [0, 0.43, 0.18], rot: [Math.PI / 2, 0, 0] }, 6),
          P.box(0.1, 0.24, 0.03, PAL.ink, { at: [0, 0.0, -0.08], rot: [0.4, 0, 0] }),
        ],
        [...eyes(0.07, 0.45, 0.09, 0.022), ...cheeks(0.09, 0.4, 0.07, 0.03)],
        bag,
        1.5,
      ),
    )
  }
  update(dt: number, t: number) {
    this.nextDrum -= dt
    if (this.nextDrum < 0 && this.t < 0) {
      this.t = 0
      this.nextDrum = 3 + Math.random() * 3
    }
    const k = this.tick(dt, 1.2)
    this.pecking = k < 0 ? 0 : 14
    if (this.pecking) {
      this.pecked += dt * this.pecking
      if (this.pecked >= 1) {
        this.pecked -= 1
        this.pecks++
      }
    }
    this.bird.rotation.x = this.pecking ? -0.35 * Math.abs(Math.sin(t * Math.PI * this.pecking)) : Math.sin(t * 1.3) * 0.05
  }
}

/** Sits on a branch, round and sleepy; poked, his quills puff right out. */
export class Porcupine extends Critter {
  readonly height = 0.8
  private quills: Group
  private body = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    this.body.add(solidMix([P.sphere(0.3, '#6E5A52', { at: [0, 0.28, 0], scale: [1, 0.9, 1.2] }), P.sphere(0.15, '#8C7468', { at: [0, 0.26, 0.32], scale: [1, 0.9, 0.9] })], [...eyes(0.07, 0.32, 0.43, 0.025), P.sphere(0.035, PAL.ink, { at: [0, 0.27, 0.47] }), ...cheeks(0.11, 0.24, 0.4, 0.035)], bag, 2))
    const spikes = []
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 * 3.7
      const up = 0.3 + (i / 28) * 1.1
      const dx = Math.cos(a) * Math.sin(up)
      const dy = Math.cos(up)
      const dz = -Math.abs(Math.sin(a) * Math.sin(up)) - 0.2
      spikes.push(P.cone(0.025, 0.28, '#EADFD2', { at: [dx * 0.3, 0.28 + dy * 0.28, dz * 0.25], rot: [Math.atan2(-dz, dy), 0, Math.atan2(-dx, dy)] }, 5))
    }
    this.quills = solid(merge(spikes), bag, 1)
    this.body.add(this.quills)
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.6)
    const puff = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.5
    this.quills.scale.setScalar(0.75 + 0.55 * puff)
    this.body.scale.set(1 + puff * 0.1, 1 + puff * 0.15 + Math.sin(t * 1.8 + this.phase) * 0.02, 1 + puff * 0.1)
  }
}

/** Sits on a rock by the creek; jumps (a big arc and a plop) when poked or when she splashes past. */
export class Frog extends Critter {
  readonly height = 0.4
  private body = new Group()
  private throat: Group
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const green = '#7CCB6B'
    this.body.add(solidMix([P.sphere(0.17, green, { at: [0, 0.13, 0], scale: [1.1, 0.75, 1.1] }), P.sphere(0.065, green, { at: [0.08, 0.24, 0.07] }), P.sphere(0.065, green, { at: [-0.08, 0.24, 0.07] }), P.sphere(0.07, green, { at: [0.15, 0.04, -0.08], scale: [1, 0.6, 1.5] }), P.sphere(0.07, green, { at: [-0.15, 0.04, -0.08], scale: [1, 0.6, 1.5] })], [...eyes(0.08, 0.27, 0.12, 0.028), ...cheeks(0.12, 0.15, 0.13, 0.035)], bag, 1.5))
    this.throat = solid(merge([P.sphere(0.07, '#FFF0B8', { at: [0, 0.06, 0.15] })]), bag, 1)
    this.body.add(this.throat)
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1)
    const air = k < 0 ? 0 : span(k, 0.1, 0.75)
    this.body.position.y = Math.sin(Math.PI * air) * 0.9
    this.body.rotation.y = air * Math.PI * 2
    const sq = k < 0 ? 0 : k < 0.1 ? bell(k / 0.2) * 0.3 : k > 0.75 ? bell((k - 0.75) / 0.5) * 0.25 : 0
    this.body.scale.set(1 + sq, 1 - sq, 1 + sq)
    this.throat.scale.setScalar(clamp(0.6 + 0.6 * Math.max(0, Math.sin(t * 4 + this.phase)) ** 6, 0.6, 1.2))
  }
}
