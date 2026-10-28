// Mountain Bike's forest animals: the moose in his pond on the chibi rig (CANADA_LOOKS.moose, Canada's moose everywhere),
// and the rest built from shapes in the toon look: a chipmunk who runs alongside, a woodpecker drumming on a birch, a
// porcupine up a maple who puffs his quills, a spring peeper by the creek who peeps and jumps when she splashes, a
// white-tailed deer who flags her tail and bounds off, a black bear far off eating blueberries, and a snowshoe hare who
// hops across the trail. Each one has idle life of its own and a reaction to a poke; the world (ride.ts) places them
// and says when.
import { Group, type Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { CANADA_LOOKS } from '../../characters/looks'

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

/** The moose on the chibi rig (CANADA_LOOKS.moose), standing in his pond up to his knees: he leans right down with his
 *  nose in the water, chewing, then lifts his head with a dripping mouthful of pond weed and looks round, chewing. Poked,
 *  he lifts his head at once and looks at her (the world plays his word in his own voice). */
export class Moose extends Critter {
  readonly height = 1.9
  readonly rig: Rig
  private life: FaceLife
  private weed: Group
  private lean = 0
  /** The world drips water off his chin when his head comes up (0..1 how high it is). */
  up = 0
  private nextLift = 3
  /** He looks at her (head yaw, rad) while his head is up. */
  look = 0
  constructor(bag: Bag) {
    super()
    this.rig = buildAnimal({ ...CANADA_LOOKS.moose, height: 1.8 }, bag)
    this.life = new FaceLife(this.rig, 'moose')
    this.rig.root.children[0].visible = false
    this.root.add(this.rig.root)
    const { R, mouth } = this.rig.face
    // Pond weed hanging out of his mouth when he comes up.
    this.weed = solid(merge([-0.12, 0, 0.1].map((x, i) => P.capsule(0.022, 0.22 + i * 0.05, '#5FA65A', { at: [x * R, -0.14 - i * 0.02, 0.02], rot: [0.15, 0, x * 1.6] }))), bag, 1.5)
    this.weed.position.set(mouth[0], mouth[1] - 0.02, mouth[2] + 0.02)
    this.rig.head.add(this.weed)
  }
  poke() {
    if (this.t < 0 || this.up < 0.5) this.t = 0.1
  }
  update(dt: number, t: number) {
    const { body, head, armL, armR, mouth } = this.rig
    this.life.update(dt)
    this.nextLift -= dt
    if (this.nextLift < 0 && this.t < 0) {
      this.t = 0
      this.nextLift = 6 + Math.random() * 4
    }
    const k = this.tick(dt, 4.2)
    // Up out of the water (a slow, heavy lift and a slower lean back down).
    const goal = k < 0 ? 0 : k < 0.2 ? span(k, 0, 0.2) : k > 0.8 ? 1 - span(k, 0.8, 1) : 1
    this.lean += (goal - this.lean) * (1 - Math.exp(-dt * 3.2))
    this.up = this.lean
    const down = 1 - this.lean
    body.rotation.x = 0.62 * down + Math.sin(t * 0.9) * 0.02
    head.rotation.x = 0.75 * down - 0.08 * this.lean + Math.sin(t * 6) * 0.03 * down
    head.rotation.y += ((this.lean > 0.5 ? this.look : 0) - head.rotation.y) * Math.min(1, dt * 3)
    // Chewing all the time: the jaw (the mouth) goes up and down.
    const chew = Math.sin(t * 7.5)
    mouth.scale.set(1 + 0.08 * chew, 1 + 0.25 * Math.max(0, chew), 1)
    head.position.x = Math.sin(t * 3.75) * 0.01
    // Breathing, his front legs (the rig's arms) reaching down into the water as he leans.
    const br = 1 + Math.sin(t * 1.6 + this.phase) * 0.015
    body.scale.set(1 / Math.sqrt(br), br, 1 / Math.sqrt(br))
    armL.rotation.set(-0.5 * down, 0, -0.1)
    armR.rotation.set(-0.5 * down, 0, 0.1)
    this.weed.visible = this.lean > 0.15
    this.weed.rotation.x = Math.sin(t * 7.5) * 0.12
    this.weed.scale.y = 0.6 + 0.4 * this.lean
  }
  /** Where his chin is (the drips fall from there). */
  chin(out: Vector3) {
    const m = this.rig.face.mouth
    return this.rig.head.localToWorld(out.set(m[0], m[1] - 0.2, m[2]))
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

/** A spring peeper (the little tan frog with a dark X on his back) on a rock by the creek: his throat puffs up in a
 *  round bubble when he peeps; poked, or when she splashes past, he jumps (a crouch, a big arc and a plop). */
export class Peeper extends Critter {
  readonly height = 0.4
  private body = new Group()
  private throat: Group
  private peepT = -1
  private nextPeep = 1.5
  /** Counts up one per peep (the world plays it when it changes and she's near). */
  peeps = 0
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const tan = '#D9AE78'
    const dark = '#8E6440'
    this.body.add(
      solidMix(
        [
          P.sphere(0.17, tan, { at: [0, 0.13, 0], scale: [1.1, 0.75, 1.1] }),
          P.sphere(0.07, tan, { at: [0.08, 0.24, 0.07] }),
          P.sphere(0.07, tan, { at: [-0.08, 0.24, 0.07] }),
          // Back legs folded at his sides, front feet with round toe pads.
          P.sphere(0.075, tan, { at: [0.15, 0.05, -0.07], scale: [1, 0.6, 1.5] }),
          P.sphere(0.075, tan, { at: [-0.15, 0.05, -0.07], scale: [1, 0.6, 1.5] }),
          ...[1, -1].flatMap((s) => [P.capsule(0.022, 0.06, tan, { at: [s * 0.09, 0.04, 0.12], rot: [0.4, 0, 0] }), P.sphere(0.026, '#F2D3A8', { at: [s * 0.1, 0.005, 0.16] })]),
        ],
        [
          ...eyes(0.08, 0.27, 0.12, 0.03),
          ...cheeks(0.12, 0.15, 0.13, 0.035),
          // The X on his back (the peeper's mark).
          P.box(0.035, 0.012, 0.2, dark, { at: [0, 0.225, -0.03], rot: [0.1, 0.65, 0] }),
          P.box(0.035, 0.012, 0.2, dark, { at: [0, 0.225, -0.03], rot: [0.1, -0.65, 0] }),
          P.box(0.12, 0.012, 0.02, dark, { at: [0, 0.255, 0.07], rot: [0.3, 0, 0] }),
        ],
        bag,
        1.5,
      ),
    )
    this.throat = solid(merge([P.sphere(0.075, '#FFF0C8', { at: [0, 0.07, 0.15] }, 14)]), bag, 1)
    this.body.add(this.throat)
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.1)
    const air = k < 0 ? 0 : span(k, 0.15, 0.78)
    this.body.position.y = Math.sin(Math.PI * air) * 0.9
    this.body.rotation.y = air * Math.PI * 2
    this.body.rotation.x = k < 0 ? 0 : -Math.sin(Math.PI * air) * 0.5
    // A crouch before the jump, a squash when he lands.
    const sq = k < 0 ? 0 : k < 0.15 ? bell(k / 0.3) * 0.3 : k > 0.78 ? bell((k - 0.78) / 0.44) * 0.28 : -0.08
    this.body.scale.set(1 + sq, 1 - sq, 1 + sq)
    // Peep: the throat bubble swells up and down twice.
    this.nextPeep -= dt
    if (this.nextPeep < 0 && this.peepT < 0 && k < 0) {
      this.peepT = 0
      this.peeps++
      this.nextPeep = 2.4 + Math.random() * 2.5
    }
    let bub = 0
    if (this.peepT >= 0) {
      this.peepT += dt
      bub = bell(span(this.peepT, 0, 0.5)) + bell(span(this.peepT, 0.55, 1.05))
      if (this.peepT > 1.1) this.peepT = -1
    }
    this.throat.scale.setScalar(clamp(0.55 + bub * 1.1, 0.55, 1.6) + Math.sin(t * 9 + this.phase) * 0.03)
  }
}

/** A white-tailed deer among the trees: grazing, her head coming up now and then to look round, ears twitching. Poked,
 *  she lifts her white tail like a flag and bounds off through the trees, stops, and a while later wanders back. */
export class Deer extends Critter {
  readonly height = 1.5
  private body = new Group()
  private neck = new Group()
  private tail = new Group()
  private ears: Group[] = []
  private legs: Group[] = []
  /** How far she's bounded off (m along her heading), and how far she means to go. */
  away = 0
  private goal = 0
  private graze = 0
  private nextLook = 3
  constructor(bag: Bag) {
    super()
    const fur = '#C98E5A'
    const light = '#F3E2C8'
    const dark = '#5A3E2C'
    this.root.add(this.body)
    this.body.position.y = 0.78
    this.body.add(solidMix([P.sphere(0.36, fur, { scale: [0.82, 0.78, 1.45] }), P.sphere(0.26, light, { at: [0, -0.1, 0.05], scale: [0.85, 0.6, 1.4] })], [], bag, 2.5))
    for (const [x, z] of [
      [0.14, 0.34],
      [-0.14, 0.34],
      [0.14, -0.34],
      [-0.14, -0.34],
    ]) {
      const g = new Group()
      g.position.set(x, -0.08, z)
      g.add(solid(merge([P.capsule(0.05, 0.45, fur, { at: [0, -0.3, 0] }), P.capsule(0.036, 0.22, fur, { at: [0, -0.62, 0.0] }), P.sphere(0.045, dark, { at: [0, -0.73, 0.02], scale: [1, 0.7, 1.2] })]), bag, 2))
      this.body.add(g)
      this.legs.push(g)
    }
    this.neck.position.set(0, 0.12, 0.42)
    this.body.add(this.neck)
    this.neck.add(
      solidMix(
        [
          P.capsule(0.11, 0.36, fur, { at: [0, 0.2, 0.06], rot: [0.35, 0, 0] }),
          P.sphere(0.17, fur, { at: [0, 0.46, 0.16], scale: [0.9, 0.92, 1.05] }),
          P.sphere(0.1, fur, { at: [0, 0.4, 0.34], scale: [0.8, 0.75, 1.1] }),
          P.sphere(0.1, light, { at: [0, 0.18, 0.18], scale: [0.8, 0.5, 0.5] }),
        ],
        [...eyes(0.09, 0.5, 0.27, 0.035), P.sphere(0.04, PAL.ink, { at: [0, 0.42, 0.45], scale: [1.2, 0.9, 0.8] }), P.sphere(0.05, light, { at: [0.08, 0.38, 0.34], scale: [0.6, 0.5, 0.5] }), P.sphere(0.05, light, { at: [-0.08, 0.38, 0.34], scale: [0.6, 0.5, 0.5] }), ...cheeks(0.12, 0.43, 0.24, 0.035)],
        bag,
        2.5,
      ),
    )
    for (const s of [1, -1]) {
      const e = new Group()
      e.position.set(s * 0.13, 0.6, 0.1)
      e.add(solidMix([P.sphere(0.1, fur, { at: [s * 0.08, 0.04, 0], rot: [0, 0, -s * 0.6], scale: [1.4, 0.65, 0.35] })], [P.sphere(0.065, '#FFD0D8', { at: [s * 0.08, 0.04, 0.025], rot: [0, 0, -s * 0.6], scale: [1.3, 0.55, 0.2] })], bag, 1.5))
      this.neck.add(e)
      this.ears.push(e)
    }
    // The tail: brown on top, white underneath (it flips up and the white shows).
    this.tail.position.set(0, 0.12, -0.5)
    this.tail.add(solidMix([P.sphere(0.09, fur, { at: [0, -0.06, -0.04], scale: [1, 1.5, 0.6] })], [P.sphere(0.085, '#FFFFFF', { at: [0, -0.06, -0.075], scale: [1, 1.45, 0.4] })], bag, 1.5))
    this.body.add(this.tail)
  }
  /** Off she bounds (unless she already is). */
  poke() {
    if (this.t >= 0) return
    this.t = 0
    this.goal = this.away + 7
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 3.4)
    const bounding = k >= 0 && k < 0.6
    const flag = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.4
    if (bounding) this.away += (this.goal - this.away) * (1 - Math.exp(-dt * 2.2))
    // A while after, she wanders slowly back.
    if (k < 0 && this.away > 0) this.away = Math.max(0, this.away - dt * 0.6)
    const walk = k < 0 && this.away > 0
    // Bounding: big arcs, legs tucked then stretched; walking back, a slow step.
    const bt = (t * 7.5) % (Math.PI * 2)
    const hop = bounding ? Math.abs(Math.sin(bt)) * 0.5 : 0
    this.body.position.y = 0.78 + hop
    this.body.rotation.x = bounding ? -Math.cos(bt) * 0.25 : 0
    this.legs.forEach((g, i) => {
      const front = i < 2
      g.rotation.x = bounding ? (front ? -1 : 1) * (0.3 + 0.5 * Math.cos(bt)) : walk ? Math.sin(t * 5 + i * 1.6) * 0.35 : 0
    })
    // Grazing: head down to the grass, then up to look round.
    this.nextLook -= dt
    if (this.nextLook < 0) this.nextLook = 3 + Math.random() * 3
    const lookUp = this.nextLook < 1.4 || k >= 0
    this.graze += ((lookUp ? 0 : 1) - this.graze) * (1 - Math.exp(-dt * 3))
    this.neck.rotation.x = 1.25 * this.graze - 0.15 * (1 - this.graze) + Math.sin(t * 8) * 0.03 * this.graze
    this.neck.rotation.y = (1 - this.graze) * Math.sin(t * 0.8 + this.phase) * 0.35
    this.ears.forEach((e, i) => (e.rotation.z = (i ? -1 : 1) * (Math.max(0, Math.sin(t * 2.3 + i * 3 + this.phase)) ** 12 * 0.5 - flag * 0.3)))
    this.tail.rotation.x = -0.15 - flag * 1.9 + Math.sin(t * 3) * 0.06
    this.walkBack = walk
  }
  /** Walking home (she faces back the way she came). */
  walkBack = false
}

/** A black bear far off at the trail side, sitting by a bush of blueberries and stuffing them in with a paw. Poked, she
 *  stands up on her back legs, sniffs, and waves a sticky paw, then sits back down to her berries. */
export class Bear extends Critter {
  readonly height = 1.6
  private body = new Group()
  private head = new Group()
  private paw = new Group()
  private pawB = new Group()
  constructor(bag: Bag) {
    super()
    const fur = '#3C3440'
    const muzzle = '#C9A27E'
    this.root.add(this.body)
    this.body.add(solidMix([P.sphere(0.5, fur, { at: [0, 0.5, 0], scale: [1, 1.05, 0.95] }), P.sphere(0.22, fur, { at: [0.28, 0.12, 0.25], scale: [1, 0.6, 1.4] }), P.sphere(0.22, fur, { at: [-0.28, 0.12, 0.25], scale: [1, 0.6, 1.4] })], [], bag, 2.5))
    this.head.position.set(0, 1.0, 0.12)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [P.sphere(0.32, fur, { at: [0, 0.12, 0] }), ...[1, -1].map((s) => P.sphere(0.1, fur, { at: [s * 0.24, 0.38, -0.02] })), P.sphere(0.15, muzzle, { at: [0, 0.03, 0.26], scale: [1.15, 0.85, 1] })],
        [...eyes(0.12, 0.2, 0.27, 0.035), P.sphere(0.05, PAL.ink, { at: [0, 0.08, 0.4], scale: [1.3, 0.9, 0.8] }), ...[1, -1].map((s) => P.sphere(0.055, '#6A5A70', { at: [s * 0.24, 0.38, 0.05], scale: [1, 1, 0.4] })), ...cheeks(0.18, 0.06, 0.22, 0.04)],
        bag,
        2.5,
      ),
    )
    for (const [g, s] of [
      [this.paw, 1],
      [this.pawB, -1],
    ] as const) {
      g.position.set(s * 0.36, 0.72, 0.15)
      g.add(solid(merge([P.capsule(0.11, 0.3, fur, { at: [0, -0.2, 0] }), P.sphere(0.11, muzzle, { at: [0, -0.4, 0.04], scale: [1, 0.6, 1] })]), bag, 2))
      this.body.add(g)
    }
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 3)
    const stand = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.5
    this.body.position.y = stand * 0.42
    this.body.scale.set(1 - stand * 0.06, 1 + stand * 0.12, 1 - stand * 0.06)
    // Eating: the right paw goes from the bush to her mouth and back; standing, it waves.
    const eat = Math.max(0, Math.sin(t * 2.2 + this.phase))
    this.paw.rotation.x = (1 - stand) * (-0.5 - 1.6 * eat) + stand * -0.3
    this.paw.rotation.z = (1 - stand) * 0.4 * eat + stand * (2.3 + Math.sin(t * 10) * 0.3)
    this.pawB.rotation.x = -0.6 * (1 - stand) - 0.4 * stand
    this.head.rotation.x = (1 - stand) * (0.15 - eat * 0.25) + stand * (-0.25 + Math.sin(t * 9) * 0.05)
    this.head.rotation.y = stand * 0.35
  }
}

/** A snowshoe hare (brown for the fall, with big white snowshoe feet) sitting at the edge of the trail, nose twitching.
 *  When Maple comes close he hops across the trail in front of her; poked, he sits up and hops round in a circle. */
export class Hare extends Critter {
  readonly height = 0.6
  private body = new Group()
  private ears: Group[] = []
  private nose: Group
  /** Hopping across the trail (the world moves him). */
  crossing = false
  constructor(bag: Bag) {
    super()
    const fur = '#A98462'
    const light = '#FFFFFF'
    this.root.add(this.body)
    this.body.add(
      solidMix(
        [
          P.sphere(0.2, fur, { at: [0, 0.2, -0.04], scale: [0.9, 0.95, 1.2] }),
          P.sphere(0.14, fur, { at: [0, 0.38, 0.14] }),
          // The big white snowshoe back feet, the front paws, the cotton tail.
          ...[1, -1].map((s) => P.sphere(0.07, light, { at: [s * 0.11, 0.03, 0.02], scale: [0.8, 0.45, 2.2] })),
          ...[1, -1].map((s) => P.sphere(0.04, light, { at: [s * 0.06, 0.06, 0.18], scale: [0.9, 0.7, 1.3] })),
          P.sphere(0.06, light, { at: [0, 0.22, -0.26] }),
        ],
        [...eyes(0.07, 0.42, 0.25, 0.026), ...cheeks(0.09, 0.35, 0.24, 0.03), P.sphere(0.06, '#F3E7DA', { at: [0, 0.33, 0.24], scale: [1, 0.7, 0.6] })],
        bag,
        2,
      ),
    )
    this.nose = solid(P.sphere(0.022, '#F28BA8'), bag, 0)
    this.nose.position.set(0, 0.37, 0.28)
    this.body.add(this.nose)
    for (const s of [1, -1]) {
      const e = new Group()
      e.position.set(s * 0.05, 0.48, 0.1)
      e.add(solidMix([P.capsule(0.04, 0.22, fur, { at: [0, 0.14, 0], scale: [1, 1, 0.45] })], [P.capsule(0.022, 0.18, '#FFD0D8', { at: [0, 0.14, 0.012], scale: [1, 1, 0.3] }), P.sphere(0.04, '#5A4334', { at: [0, 0.27, 0], scale: [1, 0.7, 0.5] })], bag, 1.5))
      this.body.add(e)
      this.ears.push(e)
    }
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.6)
    // Hopping (crossing or poked): little arcs, the ears flopping back on each.
    const hopping = this.crossing || k >= 0
    const ht = (t * 9) % Math.PI
    this.body.position.y = hopping ? Math.sin(ht) * 0.22 : 0
    this.body.rotation.x = hopping ? -Math.cos(ht) * 0.2 : 0
    this.body.rotation.y = k >= 0 && !this.crossing ? k * Math.PI * 2 : 0
    this.ears.forEach((e, i) => {
      e.rotation.x = hopping ? -0.6 + Math.cos(ht) * 0.25 : -0.15 + Math.max(0, Math.sin(t * 1.7 + i * 2.5 + this.phase)) ** 10 * 0.4
      e.rotation.z = (i ? -1 : 1) * 0.18
    })
    // His nose never stops twitching.
    this.nose.scale.setScalar(1 + Math.max(0, Math.sin(t * 22)) * 0.35)
  }
}
