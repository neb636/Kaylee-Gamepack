// Canada's little forest animals, built from shapes in the toon look, shared by the games that meet them: Mountain
// Bike's trail (activities/bike/) and Campfire Night's clearing (activities/campfire/). A porcupine who puffs his
// quills, a spring peeper whose throat balloons when he peeps, a white-tailed deer who grazes and flags her tail, a
// barred owl whose head turns all the way round, and a little brown bat who hangs upside down and yawns.
//
// Each one has idle life of its own and a reaction (`poke`, plus the campfire's own: `balloon`, `freeze`, `spin`,
// `yawn`); the world places them and says when. `shine` is where their eyes are, so a night scene can make them shine
// back at a flashlight (activities/campfire/shade.ts).
import { Euler, Group, Quaternion, Vector3, type Object3D } from 'three'
import { bell, clamp, span } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'

/** Two round ink eyes with a white shine each, at (±x, y, z). */
export const eyes = (x: number, y: number, z: number, r = 0.03) => [
  P.sphere(r, PAL.ink, { at: [x, y, z] }),
  P.sphere(r, PAL.ink, { at: [-x, y, z] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [-x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
]
/** Pink cheeks at (±x, y, z). */
export const cheeks = (x: number, y: number, z: number, r = 0.04) => [P.sphere(r, PAL.pink, { at: [x, y, z], scale: [1, 0.6, 0.4] }), P.sphere(r, PAL.pink, { at: [-x, y, z], scale: [1, 0.6, 0.4] })]

/** Where a critter's eyes are (in `parent`'s space) and how big, for the eyes that shine back at a light at night. */
export interface Shine {
  parent: Object3D
  at: [V3, V3]
  r: number
}
const shineOf = (parent: Object3D, x: number, y: number, z: number, r: number): Shine => ({
  parent,
  at: [
    [x, y, z],
    [-x, y, z],
  ],
  r,
})

/** Something with a little action: `t` counts up from 0 while it plays. */
export abstract class Critter {
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

/** Sits round and sleepy (on a branch, or at the foot of a tree) on four little feet, his quills lying back along him
 *  like a coat, his nose twitching; poked, his quills puff right up and out and he rolls up into a prickly ball. */
export class Porcupine extends Critter {
  readonly height = 0.8
  private flat: Group
  private erect: Group
  private nose = new Group()
  private body = new Group()
  readonly shine: Shine
  constructor(bag: Bag) {
    super()
    const fur = '#5E4A42'
    const face = '#A08473'
    const snout = '#C2A38E'
    const foot = '#4A3A33'
    this.root.add(this.body)
    // A round, low body (an egg lying down), a pale face at the front, little round ears and four stubby feet.
    const C: V3 = [0, 0.27, -0.04]
    const R: V3 = [0.3, 0.26, 0.34]
    this.body.add(
      solidMix(
        [
          P.sphere(1, fur, { at: C, scale: R }),
          P.sphere(0.18, face, { at: [0, 0.25, 0.22], scale: [1, 0.9, 0.9] }),
          ...[1, -1].map((s) => P.sphere(0.06, face, { at: [s * 0.15, 0.37, 0.18], scale: [1, 1, 0.55] })),
          ...[
            [0.14, 0.13],
            [0.15, -0.17],
          ].flatMap(([x, z]) => [1, -1].map((s) => P.sphere(0.045, foot, { at: [s * x, 0.03, z], scale: [1, 0.65, 1.3] }))),
        ],
        [...eyes(0.075, 0.31, 0.375, 0.032), ...cheeks(0.12, 0.23, 0.34, 0.035), ...[1, -1].map((s) => P.sphere(0.035, '#F2B8C0', { at: [s * 0.15, 0.37, 0.205], scale: [1, 1, 0.4] }))],
        bag,
        2,
      ),
    )
    // The snout and nose on their own, so they twitch (sniff sniff).
    this.nose.position.set(0, 0.22, 0.36)
    this.nose.add(solidMix([P.sphere(0.085, snout, { at: [0, 0, 0.02], scale: [1.05, 0.85, 0.9] })], [P.sphere(0.036, PAL.ink, { at: [0, 0.025, 0.09], scale: [1.3, 0.95, 0.8] })], bag, 1.6))
    this.body.add(this.nose)
    // His quills: cream with a dark tip, standing out of his back and sides (not his face or tummy). Two coats from the
    // same spots: lying back along him (resting), and standing straight out (puffed), so a poke can pop him up.
    const coat = (puffed: boolean) => {
      const spikes = []
      const up = new Vector3(0, 1, 0)
      const back = new Vector3(0, 0.25, -1)
      const n = new Vector3()
      const d = new Vector3()
      const e = new Euler()
      const q = new Quaternion()
      const N = 110
      for (let i = 0; i < N; i++) {
        // A golden-angle spiral over the whole egg, keeping the back, the top and the sides.
        const y = 1 - (2 * (i + 0.5)) / N
        const r = Math.sqrt(1 - y * y)
        const a = i * 2.39996
        const u = new Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
        if (u.y < -0.15 || u.z > 0.45 || (u.z > 0.1 && u.y < 0.35)) continue
        n.set(u.x / R[0], u.y / R[1], u.z / R[2]).normalize()
        d.copy(n)
        if (!puffed) d.multiplyScalar(0.4).addScaledVector(back, 0.8)
        d.normalize()
        e.setFromQuaternion(q.setFromUnitVectors(up, d))
        const len = (0.2 + (i % 3) * 0.035) * (puffed ? 1.15 : 1)
        const base = [u.x * R[0] * 0.92, u.y * R[1] * 0.92, u.z * R[2] * 0.92]
        const mid = (k: number) => [base[0] + d.x * len * k, base[1] + d.y * len * k, base[2] + d.z * len * k] as V3
        // (A tapering cream shaft, then a dark point that carries the taper on.)
        spikes.push(P.cyl(0.009, 0.024, len * 0.7, '#EFE4D4', { at: mid(0.35), rot: [e.x, e.y, e.z] }, 6))
        spikes.push(P.cone(0.009, len * 0.3, '#3A2C26', { at: mid(0.85), rot: [e.x, e.y, e.z] }, 6))
      }
      const g = solid(merge(spikes), bag, 1)
      g.position.set(...C)
      this.body.add(g)
      return g
    }
    this.flat = coat(false)
    this.erect = coat(true)
    this.erect.visible = false
    this.shine = shineOf(this.body, 0.075, 0.31, 0.385, 0.032)
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.6)
    const puff = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.5
    // Puffed, the standing coat pops up (with a little overshoot) and he curls round into a ball.
    const up = puff > 0.25
    this.flat.visible = !up
    this.erect.visible = up
    this.erect.scale.setScalar(0.8 + 0.3 * puff)
    this.body.scale.set(1 + puff * 0.1, 1 + puff * 0.12 + Math.sin(t * 1.8 + this.phase) * 0.02, 1 - puff * 0.08)
    this.body.rotation.x = puff * 0.25
    // Sniff sniff: his nose wiggles in little bursts (still while he's puffed).
    const sniff = Math.max(0, Math.sin(t * 0.9 + this.phase)) ** 6 * (1 - puff)
    this.nose.position.y = 0.22 + Math.sin(t * 22) * 0.008 * sniff
    this.nose.scale.setScalar(1 + Math.sin(t * 22) * 0.06 * sniff)
  }
}

/** A spring peeper (the little tan frog with a dark X on his back) on a rock: his throat puffs up in a round bubble
 *  when he peeps; poked, or when she splashes past, he jumps (a crouch, a big arc and a plop). `balloon()`: his throat
 *  blows up into a bubble bigger than his head and holds it (a flashlight on him). */
export class Peeper extends Critter {
  readonly height = 0.4
  private body = new Group()
  private throat: Group
  private peepT = -1
  private nextPeep = 1.5
  private bigT = -1
  /** Counts up one per peep (the world plays it when it changes and she's near). */
  peeps = 0
  readonly shine: Shine
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
    this.shine = shineOf(this.body, 0.08, 0.27, 0.135, 0.034)
  }
  /** His throat blows up into a huge bubble (two big peeps), then goes down. */
  balloon() {
    if (this.bigT < 0 && this.t < 0) {
      this.bigT = 0
      this.peeps++
    }
  }
  get ballooning() {
    return this.bigT >= 0
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
    if (this.nextPeep < 0 && this.peepT < 0 && k < 0 && this.bigT < 0) {
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
    // The big balloon: up fast, held with a wobble, a second big peep, and down.
    let big = 0
    if (this.bigT >= 0) {
      this.bigT += dt
      const b = this.bigT
      big = b < 0.25 ? span(b, 0, 0.25) : b < 1.6 ? 1 - 0.18 * bell(span(b, 0.75, 1.15)) : 1 - span(b, 1.6, 1.95)
      if (b > 1.95) this.bigT = -1
    }
    const s = big > 0 ? 0.55 + big * 1.15 : clamp(0.55 + bub * 1.1, 0.55, 1.6)
    this.throat.scale.setScalar(s + Math.sin(t * (big > 0 ? 18 : 9) + this.phase) * 0.03)
    // (A ballooned throat pushes his chin up a little.)
    this.body.rotation.x -= big * 0.18
  }
}

/** A white-tailed deer among the trees: grazing, her head coming up now and then to look round, ears twitching. Poked,
 *  she lifts her white tail like a flag and bounds off through the trees, stops, and a while later wanders back.
 *  `freeze()`: her head comes up with a mouthful of leaves and she stands stock still, ears up, staring (a light on
 *  her at night), then goes back to grazing. */
export class Deer extends Critter {
  readonly height = 1.5
  private body = new Group()
  private neck = new Group()
  private tail = new Group()
  private ears: Group[] = []
  private legs: Group[] = []
  private leaves: Group
  private frozeT = -1
  /** How far she's bounded off (m along her heading), and how far she means to go. */
  away = 0
  private goal = 0
  private graze = 0
  private nextLook = 3
  readonly shine: Shine
  constructor(bag: Bag) {
    super()
    const fur = '#C98E5A'
    const light = '#F3E2C8'
    const dark = '#5A3E2C'
    this.root.add(this.body)
    this.body.position.y = 0.78
    // A soft barrel of a body with a deep chest and round haunches, her pale tummy underneath.
    this.body.add(
      solidMix(
        [
          P.sphere(0.34, fur, { at: [0, 0, -0.02], scale: [0.78, 0.74, 1.35] }),
          P.sphere(0.22, fur, { at: [0, 0.04, 0.28], scale: [1, 1.05, 1] }),
          ...[1, -1].map((s) => P.sphere(0.16, fur, { at: [s * 0.1, 0.03, -0.3], scale: [1, 1.15, 1.1] })),
        ],
        [P.sphere(0.24, light, { at: [0, -0.1, 0.02], scale: [0.85, 0.6, 1.4] })],
        bag,
        2.5,
      ),
    )
    // Slim legs (a little thicker at the top), dark hooves.
    for (const [x, z] of [
      [0.13, 0.3],
      [-0.13, 0.3],
      [0.13, -0.32],
      [-0.13, -0.32],
    ]) {
      const g = new Group()
      g.position.set(x, -0.08, z)
      g.add(solid(merge([P.capsule(0.058, 0.3, fur, { at: [0, -0.2, 0] }), P.capsule(0.04, 0.28, fur, { at: [0, -0.5, 0.0] }), P.cyl(0.038, 0.05, 0.08, dark, { at: [0, -0.665, 0.01] }, 12)]), bag, 2))
      this.body.add(g)
      this.legs.push(g)
    }
    // The neck grows up out of her chest; the head is big and round (a chibi deer), with a soft muzzle.
    this.neck.position.set(0, 0.1, 0.34)
    this.body.add(this.neck)
    this.neck.add(
      solidMix(
        [
          P.capsule(0.12, 0.24, fur, { at: [0, 0.18, 0.06], rot: [0.35, 0, 0] }),
          P.sphere(0.19, fur, { at: [0, 0.46, 0.14], scale: [0.95, 0.9, 1] }),
          P.sphere(0.11, fur, { at: [0, 0.39, 0.3], scale: [0.85, 0.75, 1.1] }),
        ],
        [
          // A pale throat patch and a pale muzzle, both on her (not floating in front).
          P.sphere(0.09, light, { at: [0, 0.3, 0.2], scale: [0.75, 0.55, 0.4], rot: [0.6, 0, 0] }),
          P.sphere(0.09, light, { at: [0, 0.35, 0.34], scale: [0.85, 0.5, 0.9] }),
          ...eyes(0.088, 0.5, 0.29, 0.042),
          P.sphere(0.045, PAL.ink, { at: [0, 0.42, 0.41], scale: [1.25, 0.9, 0.8] }),
          ...cheeks(0.13, 0.42, 0.25, 0.038),
        ],
        bag,
        2.5,
      ),
    )
    // Her ears: big, soft and pink inside, pointing up and out, their bases tucked into the top of her head. Each group's
    // pivot sits on the head, so a twitch swings the ear from where it joins.
    for (const s of [1, -1]) {
      const e = new Group()
      e.position.set(s * 0.1, 0.59, 0.1)
      const at = (k: number, z = 0): V3 => [s * Math.cos(0.5) * k, Math.sin(0.5) * k, z]
      e.add(solidMix([P.sphere(0.1, fur, { at: at(0.09), rot: [0, 0, s * 0.5], scale: [1.45, 0.62, 0.32] })], [P.sphere(0.07, '#FFD0D8', { at: at(0.1, 0.022), rot: [0, 0, s * 0.5], scale: [1.4, 0.55, 0.2] })], bag, 1.5))
      this.neck.add(e)
      this.ears.push(e)
    }
    // A mouthful of leaves, sticking out each side of her mouth (only while she's frozen mid-chew).
    const leaf = (x: number, y: number, z: number, ry: number, rz: number, col: string) => P.sphere(0.06, col, { at: [x, y, z], rot: [0, ry, rz], scale: [1.5, 0.22, 0.75] }, 8)
    this.leaves = solid(merge([leaf(0.1, 0.33, 0.37, 0.5, -0.5, '#7DBA5C'), leaf(-0.09, 0.325, 0.38, -0.4, 0.45, '#9CCB62'), leaf(0.02, 0.31, 0.41, 0.1, 0.1, '#E2603F')]), bag, 1.2)
    this.leaves.visible = false
    this.neck.add(this.leaves)
    // The tail: brown on top, white underneath (it flips up and the white shows).
    this.tail.position.set(0, 0.12, -0.46)
    this.tail.add(solidMix([P.sphere(0.09, fur, { at: [0, -0.06, -0.04], scale: [1, 1.5, 0.6] })], [P.sphere(0.085, '#FFFFFF', { at: [0, -0.06, -0.075], scale: [1, 1.45, 0.4] })], bag, 1.5))
    this.body.add(this.tail)
    this.shine = shineOf(this.neck, 0.088, 0.5, 0.31, 0.045)
  }
  /** Off she bounds (unless she already is). */
  poke() {
    if (this.t >= 0) return
    this.t = 0
    this.goal = this.away + 7
  }
  /** Stock still with a mouthful of leaves (unless she's bounding). */
  freeze() {
    if (this.t >= 0) return
    this.frozeT = 0
  }
  get frozen() {
    return this.frozeT >= 0
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
    // Frozen: head up at once, staring, ears straight up, not a twitch (3 s), then she chews and goes back to grazing.
    let froze = 0
    if (this.frozeT >= 0) {
      this.frozeT += dt
      froze = this.frozeT < 2.6 ? 1 : 1 - span(this.frozeT, 2.6, 3.2)
      if (this.frozeT > 3.2) this.frozeT = -1
    }
    this.leaves.visible = froze > 0.05
    // Grazing: head down to the grass, then up to look round.
    this.nextLook -= dt
    if (this.nextLook < 0) this.nextLook = 3 + Math.random() * 3
    const lookUp = this.nextLook < 1.4 || k >= 0 || froze > 0
    this.graze += ((lookUp ? 0 : 1) - this.graze) * (1 - Math.exp(-dt * (froze > 0 ? 14 : 3)))
    this.neck.rotation.x = 1.25 * this.graze - 0.15 * (1 - this.graze) + Math.sin(t * 8) * 0.03 * this.graze - 0.1 * froze
    this.neck.rotation.y = (1 - this.graze) * Math.sin(t * 0.8 + this.phase) * 0.35 * (1 - froze)
    // (Positive swings an ear up: a twitch, back when she bounds, straight up when she freezes.)
    this.ears.forEach((e, i) => (e.rotation.z = (i ? -1 : 1) * ((Math.max(0, Math.sin(t * 2.3 + i * 3 + this.phase)) ** 12 * 0.35 - flag * 0.3) * (1 - froze) + 0.5 * froze)))
    this.tail.rotation.x = -0.15 - flag * 1.9 + Math.sin(t * 3) * 0.06 * (1 - froze) - froze * 0.9
    this.walkBack = walk
  }
  /** Walking home (she faces back the way she came). */
  walkBack = false
}

/** A barred owl on a branch: round and fluffy, grey-brown with pale bars on his chest, a pale face disc round two big
 *  dark eyes, a little yellow beak and his feet curled round the branch. He blinks slowly and bobs. `spin()`: his head
 *  goes all the way round (a full turn, the owl's trick) and back to the front. His root sits where his feet grip the
 *  branch. */
export class Owl extends Critter {
  readonly height = 0.62
  private body = new Group()
  private head = new Group()
  private lids: Group
  private wings: Group[] = []
  private blinkIn = 2
  private blinkT = -1
  readonly shine: Shine
  constructor(bag: Bag) {
    super()
    const fur = '#8C7A6A'
    const light = '#E9DCC8'
    const bar = '#6A5A4C'
    this.root.add(this.body)
    // The body, a soft egg, with pale bars across the chest.
    this.body.add(
      solidMix(
        [P.sphere(0.2, fur, { at: [0, 0.22, 0], scale: [1, 1.12, 0.92] })],
        [
          // His pale chest, with soft brown streaks down it (the barred owl's).
          P.sphere(0.15, light, { at: [0, 0.19, 0.06], scale: [0.95, 1.05, 0.8] }),
          ...[
            [-0.05, 0.2],
            [0.05, 0.2],
            [0, 0.13],
            [-0.06, 0.1],
            [0.06, 0.1],
          ].map(([x, y]) => P.sphere(0.018, bar, { at: [x, y, 0.06 + Math.sqrt(Math.max(0, 0.0225 - x * x * 1.1 - (y - 0.19) ** 2 * 0.9)) * 0.8 + 0.003], scale: [0.7, 1.6, 0.4] }, 8)),
          // The tail, and his toes curled over the front of the branch.
          ...[1, -1].flatMap((s) => [0.025, 0.05].map((dx) => P.capsule(0.012, 0.03, '#E8B84A', { at: [s * dx, 0.012, 0.055], rot: [Math.PI / 2 - 0.4, 0, 0] }))),
        ],
        bag,
        1.8,
      ),
    )
    this.body.add(solid(P.cone(0.09, 0.14, fur, { at: [0, 0.07, -0.16], rot: [-2.4, 0, 0] }, 8), bag, 1.4))
    for (const s of [1, -1]) {
      const w = new Group()
      w.position.set(s * 0.15, 0.32, -0.02)
      w.add(solidMix([P.sphere(0.1, '#7A6858', { at: [s * 0.015, -0.1, -0.01], rot: [0, 0, s * 0.12], scale: [0.5, 1.3, 1.05] })], [...[0, 1].map((i) => P.sphere(0.02, bar, { at: [s * 0.058, -0.06 - i * 0.07, 0.02], scale: [0.4, 1.4, 1] }, 8))], bag, 1.6))
      this.body.add(w)
      this.wings.push(w)
    }
    // The head: a round ball with a pale face disc, big eyes (the barred owl's are dark), a little beak.
    this.head.position.set(0, 0.42, 0.01)
    this.body.add(this.head)
    const E = 0.048
    this.head.add(
      solidMix(
        [P.sphere(0.16, fur, { at: [0, 0.07, 0], scale: [1.05, 0.95, 0.95] })],
        [
          ...[1, -1].map((s) => P.sphere(0.075, light, { at: [s * 0.06, 0.07, 0.11], scale: [1, 1.05, 0.45] }, 14)),
          ...[1, -1].map((s) => P.torus(0.07, 0.007, bar, { at: [s * 0.06, 0.07, 0.13] }, Math.PI * 2)),
          ...eyes(0.06, 0.075, 0.143, E),
          P.cone(0.022, 0.05, '#E8B84A', { at: [0, 0.025, 0.155], rot: [Math.PI, 0, 0] }, 6),
          // Little bars on the crown.
          ...[-1, 0, 1].map((k) => P.box(0.05, 0.012, 0.02, bar, { at: [k * 0.05, 0.19 - Math.abs(k) * 0.02, 0.07], rot: [-0.6, 0, k * 0.4] })),
        ],
        bag,
        1.8,
      ),
    )
    // Slow, sleepy lids for the blink (fur colored, over each eye).
    this.lids = solid(merge([1, -1].map((s) => P.sphere(0.058, fur, { at: [s * 0.06, 0.075, 0.13], scale: [1, 1, 0.5] }, 12))), bag, 0)
    this.lids.scale.y = 0.01
    this.lids.position.y = 0.075
    this.lids.children[0].position.y = -0.075
    this.head.add(this.lids)
    this.shine = shineOf(this.head, 0.06, 0.075, 0.15, 0.05)
  }
  /** His head goes all the way round. */
  spin() {
    if (this.t < 0) this.t = 0
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.5)
    // A full turn, slow out and quick back to the front, with a little stop at the back (the funny bit).
    const turn = k < 0 ? 0 : k < 0.45 ? 0.5 * span(k, 0, 0.45) ** 1.2 : k < 0.6 ? 0.5 : 0.5 + 0.5 * span(k, 0.6, 1) ** 0.8
    this.head.rotation.y = turn * Math.PI * 2 + (k < 0 ? Math.sin(t * 0.7 + this.phase) * 0.3 : 0)
    this.head.rotation.z = k < 0 ? Math.sin(t * 0.45) * 0.08 : 0
    this.body.position.y = Math.max(0, Math.sin(t * 1.4 + this.phase)) * 0.01
    this.body.scale.set(1, 1 + Math.sin(t * 2 + this.phase) * 0.015, 1)
    this.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.05 + (k >= 0 ? 0.25 * bell(k) : 0))))
    // A slow owl blink.
    this.blinkIn -= dt
    if (this.blinkIn < 0) {
      this.blinkT = 0
      this.blinkIn = 2.5 + Math.random() * 3
    }
    let lid = 0
    if (this.blinkT >= 0) {
      this.blinkT += dt / 0.45
      lid = bell(Math.min(1, this.blinkT))
      if (this.blinkT >= 1) this.blinkT = -1
    }
    this.lids.scale.y = Math.max(0.01, lid)
    this.lids.visible = lid > 0.02
  }
  /** 0 open .. 1 shut, for the night eyes (they go dark with the blink). */
  get blink() {
    return this.lids.visible ? this.lids.scale.y : 0
  }
}

/** A little brown bat hanging upside down under a branch, wrapped in his wings, swinging gently. `yawn()`: a huge
 *  upside-down yawn, eyes squeezed shut, his wings stretching open, then he wraps up again. His root is where his feet
 *  hold the branch (he hangs below it). */
export class Bat extends Critter {
  readonly height = 0.42
  private swing = new Group()
  private body = new Group()
  private mouth: Group
  private wings: Group[] = []
  private eyesG: Group
  readonly shine: Shine
  constructor(bag: Bag) {
    super()
    const fur = '#9A7464'
    const wing = '#6A4E5C'
    const pink = '#F2A7B8'
    this.root.add(this.swing)
    this.swing.add(this.body)
    // Upside down: his feet at the top (y 0), his head at the bottom.
    this.body.add(
      solidMix(
        [P.sphere(0.1, fur, { at: [0, -0.15, 0], scale: [0.9, 1.25, 0.85] }), P.sphere(0.095, fur, { at: [0, -0.31, 0.01] })],
        [
          // His big ears (they point down: he's upside down), pink inside; his little feet on the branch.
          ...[1, -1].flatMap((s) => [P.cone(0.05, 0.13, fur, { at: [s * 0.06, -0.42, -0.005], rot: [Math.PI, 0, -s * 0.35] }, 8), P.cone(0.03, 0.09, pink, { at: [s * 0.062, -0.415, 0.018], rot: [Math.PI, 0, -s * 0.35], scale: [1, 1, 0.4] }, 8)]),
          ...[1, -1].map((s) => P.capsule(0.012, 0.05, '#3A2A30', { at: [s * 0.03, -0.03, 0], rot: [0, 0, s * 0.2] })),
          P.sphere(0.03, '#5A4040', { at: [0, -0.27, 0.085], scale: [1.2, 0.8, 0.8] }),
          ...cheeks(0.06, -0.27, 0.07, 0.02),
        ],
        bag,
        1.6,
      ),
    )
    // His eyes (upside down: above the nose on screen, so below it in his body).
    this.eyesG = solid(merge(eyes(0.04, -0.34, 0.075, 0.02)), bag, 0)
    this.body.add(this.eyesG)
    // The yawning mouth: a pink open oval under his nose (above it, upside down).
    this.mouth = solid(merge([P.sphere(0.035, '#B84A6A', { at: [0, 0, 0], scale: [1, 1, 0.4] }), P.sphere(0.018, '#FF8FB0', { at: [0, -0.01, 0.006], scale: [1, 0.7, 0.4] })]), bag, 0.8)
    this.mouth.position.set(0, -0.225, 0.085)
    this.mouth.scale.setScalar(0.01)
    this.body.add(this.mouth)
    // The wings, wrapped round him; they open like a cape when he yawns.
    // (Upside down, his shoulders are down by his head: the wings reach up along him from there.)
    for (const s of [1, -1]) {
      const w = new Group()
      w.position.set(s * 0.07, -0.24, 0.01)
      w.add(solid(merge([P.sphere(0.14, wing, { at: [s * 0.03, 0.1, 0.02], scale: [0.42, 1.15, 0.55] }), ...[0, 1, 2].map((i) => P.capsule(0.009, 0.18, '#3A2A30', { at: [s * (0.035 + i * 0.02), 0.1, 0.07 - i * 0.005], rot: [0, 0, s * (0.2 - i * 0.18)] }))]), bag, 1.6))
      this.body.add(w)
      this.wings.push(w)
    }
    this.shine = shineOf(this.body, 0.04, -0.34, 0.09, 0.022)
  }
  /** A big upside-down yawn. */
  yawn() {
    if (this.t < 0) this.t = 0
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 2)
    const y = k < 0 ? 0 : bell(span(k, 0, 0.85)) ** 0.6
    this.swing.rotation.z = Math.sin(t * 1.3 + this.phase) * 0.12 * (1 - y)
    this.swing.rotation.x = Math.sin(t * 0.9 + this.phase) * 0.05
    this.mouth.scale.set(0.6 + y * 0.9, 0.2 + y * 1.4, 1).multiplyScalar(y > 0.02 ? 1 : 0.01)
    this.eyesG.scale.set(1, Math.max(0.12, 1 - y * 0.9), 1)
    // A stretch: his wings open out to the sides, and he lengthens.
    this.wings.forEach((w, i) => {
      const s = i ? -1 : 1
      w.rotation.z = -s * (0.05 + y * 1.25)
      w.rotation.y = -s * y * 0.3
    })
    this.body.scale.set(1, 1 + y * 0.12, 1)
  }
  /** His eyes squeeze shut while he yawns (the night eyes too). */
  get blink() {
    return 1 - this.eyesG.scale.y
  }
}
