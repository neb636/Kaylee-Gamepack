// Red Canoe's lake animals, code-built in the toon look: the common loon (who dives and pops up somewhere else,
// laughing; the last time with her chick on her back), a mother duck and her ducklings, a beaver who pops up by the
// lodge and slaps his tail, a pika who says "eep!" on the rock pile, a hoary marmot who whistles from the top of it, a
// ground squirrel who stands up on his rock, a trout who jumps, a bald eagle circling high over the lake, and a mountain
// goat on a cliff ledge. The moose is on the chibi rig (moose.ts). Each one has its own little action; the world
// (paddle.ts) places them and says when.
import { Group } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const eyes = (x: number, y: number, z: number, r = 0.03, c: string = PAL.ink) => [
  P.sphere(r, c, { at: [x, y, z] }),
  P.sphere(r, c, { at: [-x, y, z] }),
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

/** The common loon, as a toy: a long low black body with the white checkerboard on her back, a white breast, a black
 *  head with a green sheen, the striped white necklace, a ruby-red eye and a long dagger beak. She floats low;
 *  `dive()` tips her forward and under, `surface()` pops her back up. A poke (or a call) throws her head back with her
 *  beak open to laugh; `flap()` rears her up out of the water with her wings spread (the loon's wing-flap). A chick can
 *  ride on her back. */
export class Loon extends Critter {
  readonly height = 0.75
  private body = new Group()
  private neck = new Group()
  private jaw = new Group()
  private wings: Group[] = []
  private chick = new Group()
  /** 0 = under the water, 1 = floating. */
  up = 1
  private goal = 1
  private diveT = -1
  private flapT = -1
  constructor(bag: Bag, withChick = false) {
    super()
    this.root.add(this.body)
    const black = '#23212D'
    const sheen = '#20393A'
    const white = '#FFFFFF'
    // The back's checkerboard: little white squares in rows on top of the body (on the ellipsoid's surface).
    const rx = 0.25
    const ry = 0.17
    const rz = 0.5
    const cy = 0.03
    const checks = []
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 9; j++) {
        if ((i + j) % 2) continue
        const x = (i - 2.5) * 0.065
        const z = (j - 4.5) * 0.075 - 0.04
        const q = 1 - (x / rx) ** 2 - (z / rz) ** 2
        if (q < 0.18) continue
        const y = cy + ry * Math.sqrt(q)
        const tilt = Math.atan2((z / (rz * rz)) * ry, Math.sqrt(q)) * 0.6
        checks.push(P.box(0.034, 0.014, 0.038, white, { at: [x, y + 0.003, z], rot: [tilt, 0, -x * 4] }))
      }
    this.body.add(
      solidMix(
        [
          P.sphere(0.32, black, { at: [0, cy, 0], scale: [rx / 0.32, ry / 0.32, rz / 0.32] }, 22),
          // The white breast, just above the water at the front, and the little tail at the back.
          P.sphere(0.16, white, { at: [0, -0.02, 0.32], scale: [1.05, 0.7, 1] }),
          P.cone(0.07, 0.16, black, { at: [0, 0.06, -0.52], rot: [-Math.PI / 2 - 0.25, 0, 0], scale: [1.4, 1, 0.5] }, 8),
        ],
        checks,
        bag,
        2,
      ),
    )
    // Folded wings along her sides (they spread when she flaps).
    for (const s of [1, -1]) {
      const w = new Group()
      w.position.set(s * 0.2, 0.1, 0.05)
      const spots = [0, 1, 2].map((k) => P.box(0.012, 0.02, 0.03, white, { at: [s * 0.045, 0.02, -0.05 - k * 0.09] }))
      w.add(solidMix([P.sphere(0.2, black, { at: [s * 0.01, 0, -0.12], scale: [0.22, 0.38, 1.25] })], spots, bag, 1.6))
      this.body.add(w)
      this.wings.push(w)
    }
    // The neck and head on a pivot at the front of the body.
    this.neck.position.set(0, 0.12, 0.34)
    this.body.add(this.neck)
    const collar = []
    for (let k = 0; k < 12; k++) {
      const a = (k / 12) * Math.PI * 2
      collar.push(P.box(0.018, 0.05, 0.012, white, { at: [Math.sin(a) * 0.088, 0.13, Math.cos(a) * 0.088 + 0.03], rot: [0, a, 0] }))
      if (k % 2 === 0 && Math.cos(a) > 0.2) collar.push(P.box(0.014, 0.035, 0.01, white, { at: [Math.sin(a) * 0.085, 0.2, Math.cos(a) * 0.085 + 0.045], rot: [0, a, 0] }))
    }
    this.neck.add(
      solidMix(
        [P.capsule(0.085, 0.16, black, { at: [0, 0.13, 0.03], rot: [-0.2, 0, 0] }), P.sphere(0.125, sheen, { at: [0, 0.31, 0.07], scale: [0.95, 0.92, 1.12] }), P.cone(0.036, 0.25, '#3A3346', { at: [0, 0.31, 0.3], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75] }, 8)],
        [
          ...collar,
          // Ruby-red eyes with a dark pupil and a shine.
          ...[1, -1].flatMap((s) => [P.sphere(0.036, '#E3263F', { at: [s * 0.088, 0.34, 0.12] }), P.sphere(0.016, PAL.ink, { at: [s * 0.112, 0.345, 0.13] }), P.sphere(0.008, white, { at: [s * 0.118, 0.355, 0.14] })]),
        ],
        bag,
        2,
      ),
    )
    // The lower half of the beak opens to laugh.
    this.jaw.position.set(0, 0.285, 0.17)
    this.neck.add(this.jaw)
    this.jaw.add(solid(merge([P.cone(0.026, 0.2, '#4A4258', { at: [0, 0, 0.1], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }, 8)]), bag, 1.4))
    if (withChick) {
      const fluff = '#6E6372'
      this.chick.add(
        solidMix(
          [P.sphere(0.14, fluff, { scale: [1, 0.85, 1.2] }), P.sphere(0.095, '#4E4556', { at: [0, 0.13, 0.11] }), P.cone(0.022, 0.08, '#3A3346', { at: [0, 0.12, 0.23], rot: [Math.PI / 2, 0, 0] }, 6), P.sphere(0.08, '#C9BFCB', { at: [0, -0.04, 0.08], scale: [1, 0.6, 1] })],
          [...eyes(0.045, 0.16, 0.18, 0.018), ...cheeks(0.06, 0.11, 0.17, 0.022)],
          bag,
          2,
        ),
      )
      this.chick.position.set(0, 0.28, -0.12)
      this.body.add(this.chick)
    }
  }
  get under() {
    return this.up < 0.05
  }
  get diving() {
    return this.goal === 0
  }
  dive() {
    this.goal = 0
    this.diveT = 0
  }
  surface() {
    this.goal = 1
    this.diveT = -1
    this.up = Math.min(this.up, 0.01)
  }
  /** Rears up out of the water and flaps her wings. */
  flap() {
    this.flapT = 0
  }
  update(dt: number, t: number) {
    // Up and down: diving takes a moment (tip, then under); surfacing pops up quickly.
    if (this.goal === 0) {
      this.diveT += dt
      this.up = Math.max(0, 1 - span(this.diveT, 0.15, 0.6))
      this.body.rotation.x = 0.9 * bell(span(this.diveT, 0, 0.7))
    } else {
      this.up = Math.min(1, this.up + dt * 3)
      this.body.rotation.x *= 1 - Math.min(1, dt * 6)
    }
    // The wing-flap: she rises up on her tail, wings open and beating, then settles back with a bob.
    let rear = 0
    let open = 0
    if (this.flapT >= 0) {
      this.flapT += dt
      const k = span(this.flapT, 0, 1.3)
      rear = bell(k)
      open = bell(span(k, 0.08, 0.9))
      if (this.flapT > 1.3) this.flapT = -1
    }
    this.body.position.y = -0.95 * (1 - this.up) + Math.sin(t * 1.9 + this.phase) * 0.025 + rear * 0.22
    if (this.goal !== 0 && rear > 0) this.body.rotation.x = -0.75 * rear
    this.body.visible = this.up > 0.02
    this.wings.forEach((w, i) => {
      const s = i ? -1 : 1
      w.rotation.z = s * open * (1.3 + Math.sin(this.flapT * 26) * 0.5)
      w.rotation.y = s * open * 0.3
    })
    // A poke (or a call): her head goes up and back, beak open to the sky, and the laugh wobbles it.
    const k = this.tick(dt, 1.4)
    const call = k < 0 ? 0 : bell(span(k, 0, 1))
    this.neck.rotation.x = -0.75 * call + rear * 0.5 + Math.sin(t * 1.3 + this.phase) * 0.05
    this.neck.rotation.y = Math.sin(t * 0.7 + this.phase) * 0.2 * (1 - call)
    this.jaw.rotation.x = call * (0.35 + Math.abs(Math.sin((k < 0 ? 0 : this.t) * 22)) * 0.2)
    this.chick.position.y = 0.28 + Math.abs(Math.sin(t * 3)) * 0.02
    this.chick.rotation.y = Math.sin(t * 0.9) * 0.4
  }
}

/** A mother duck or a duckling: paddles along, bobbing; poked, flaps her wings and quacks. */
export class Duck extends Critter {
  readonly height: number
  private wings: Group[] = []
  private head = new Group()
  /** Swimming speed (the world moves it), for the paddle bob. */
  speed = 0
  constructor(
    bag: Bag,
    readonly baby: boolean,
  ) {
    super()
    const s = baby ? 0.45 : 1
    this.height = 0.5 * s
    const body = baby ? '#FFD95A' : '#B58A62'
    this.root.add(solid(merge([P.sphere(0.22 * s, body, { at: [0, 0.08 * s, 0], scale: [0.9, 0.7, 1.3] }), P.cone(0.1 * s, 0.18 * s, body, { at: [0, 0.16 * s, -0.3 * s], rot: [-2.2, 0, 0] }, 8)]), bag, 2))
    this.head.position.set(0, 0.2 * s, 0.2 * s)
    this.root.add(this.head)
    this.head.add(solidMix([P.sphere(0.12 * s, baby ? body : '#9C7656', { at: [0, 0.12 * s, 0] }), P.rbox(0.09 * s, 0.035 * s, 0.13 * s, 0.015, '#FF9A3C', { at: [0, 0.09 * s, 0.13 * s] })], eyes(0.06 * s, 0.15 * s, 0.08 * s, 0.022 * s), bag, 2))
    for (const side of [1, -1]) {
      const w = new Group()
      w.position.set(side * 0.18 * s, 0.14 * s, 0)
      w.add(solid(merge([P.sphere(0.12 * s, baby ? '#F5C842' : '#8F6B4E', { at: [side * 0.04 * s, 0, -0.04 * s], scale: [0.4, 0.7, 1.4] })]), bag, 1.5))
      this.root.add(w)
      this.wings.push(w)
    }
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 0.9)
    const flap = k < 0 ? 0 : bell(span(k, 0, 1))
    this.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.1 + flap * (0.9 + Math.sin(this.t * 40) * 0.5))))
    this.root.position.y = Math.sin(t * (3 + this.speed * 2) + this.phase) * 0.02 + flap * 0.12
    this.head.rotation.x = Math.sin(t * 2 + this.phase) * 0.12 - flap * 0.4
  }
}

/** A beaver who lives in the lodge: pops up out of the water, looks round, slaps his tail and dives. */
export class Beaver extends Critter {
  readonly height = 0.6
  private body = new Group()
  private tail = new Group()
  /** The tail hits the water now (the world splashes). */
  slapped = false
  private wasT = -1
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    this.body.add(
      solidMix(
        [P.sphere(0.3, '#8C5A3C', { at: [0, 0, 0], scale: [1, 0.8, 1.3] }), P.sphere(0.2, '#8C5A3C', { at: [0, 0.2, 0.32] }), P.sphere(0.1, '#C79A72', { at: [0, 0.14, 0.48], scale: [1.2, 0.8, 0.8] }), P.sphere(0.05, '#4A3036', { at: [0, 0.2, 0.55] }), P.sphere(0.05, '#8C5A3C', { at: [0.14, 0.36, 0.28] }), P.sphere(0.05, '#8C5A3C', { at: [-0.14, 0.36, 0.28] })],
        [...eyes(0.08, 0.27, 0.46, 0.028), P.box(0.06, 0.06, 0.02, '#FF9A3C', { at: [0, 0.06, 0.53] })],
        bag,
        2,
      ),
    )
    this.tail.position.set(0, 0, -0.35)
    this.body.add(this.tail)
    this.tail.add(solid(merge([P.rbox(0.3, 0.05, 0.5, 0.03, '#5A3B2E', { at: [0, 0, -0.25] })]), bag, 2))
    this.body.visible = false
  }
  update(dt: number, _t: number) {
    // Up (0-0.5 s), a look round, the slap (at 1.5 s), back under (2-2.5 s).
    const was = this.wasT
    const k = this.tick(dt, 2.6)
    this.wasT = this.t
    this.body.visible = k >= 0
    if (k < 0) return
    const s = this.t
    this.body.position.y = -0.6 + 0.62 * span(s, 0, 0.5) - 0.7 * span(s, 2.0, 2.5)
    this.body.rotation.y = Math.sin(s * 3) * 0.4 * span(s, 0.5, 0.8) * (1 - span(s, 1.2, 1.4))
    this.tail.rotation.x = s < 1.2 ? 0 : s < 1.5 ? -1.3 * span(s, 1.2, 1.45) : -1.3 + 1.6 * span(s, 1.5, 1.6)
    if (was < 1.55 && s >= 1.55) this.slapped = true
  }
}

/** A pika: a tiny round grey-brown ball with round ears; poked, pops up on the rocks and says "eep!". */
export class Pika extends Critter {
  readonly height = 0.35
  private body = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    this.body.add(
      solidMix(
        [P.sphere(0.16, '#A99484', { scale: [1, 0.9, 1.1] }), P.sphere(0.07, '#A99484', { at: [0.1, 0.13, 0], scale: [0.5, 1, 1] }), P.sphere(0.07, '#A99484', { at: [-0.1, 0.13, 0], scale: [0.5, 1, 1] }), P.sphere(0.03, '#4A3036', { at: [0, 0.02, 0.16] })],
        [...eyes(0.07, 0.06, 0.12, 0.025), ...cheeks(0.09, 0, 0.12, 0.03)],
        bag,
        2,
      ),
    )
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.1)
    const pop = k < 0 ? 0 : bell(span(k, 0, 1))
    this.body.position.y = pop * 0.25 + Math.abs(Math.sin(t * 1.3 + this.phase)) * 0.015
    this.body.scale.set(1 - pop * 0.1, 1 + pop * 0.2, 1)
  }
}

/** A Columbian ground squirrel: sits on his rock; poked, stands right up, chirps and flicks his tail. */
export class Squirrel extends Critter {
  readonly height = 0.5
  private body = new Group()
  private tail = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const fur = '#C99A6E'
    this.body.add(
      solidMix(
        [P.capsule(0.12, 0.14, fur, { at: [0, 0.2, 0] }), P.sphere(0.12, '#D8A97B', { at: [0, 0.42, 0.04] }), P.sphere(0.04, fur, { at: [0.08, 0.53, 0.02] }), P.sphere(0.04, fur, { at: [-0.08, 0.53, 0.02] }), P.sphere(0.06, '#F3DFC6', { at: [0, 0.36, 0.13], scale: [1.2, 0.8, 0.7] })],
        [...eyes(0.055, 0.45, 0.11, 0.022), P.sphere(0.018, '#4A3036', { at: [0, 0.4, 0.17] })],
        bag,
        2,
      ),
    )
    this.tail.position.set(0, 0.1, -0.12)
    this.body.add(this.tail)
    this.tail.add(solid(merge([P.capsule(0.05, 0.2, '#A97A55', { at: [0, 0.12, -0.04], rot: [-0.5, 0, 0] })]), bag, 1.5))
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.5)
    const up = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.4
    this.body.scale.set(1, 0.7 + up * 0.45, 1)
    this.body.rotation.x = 0.3 * (1 - up)
    this.tail.rotation.x = Math.sin(t * (k < 0 ? 2 : 24)) * (k < 0 ? 0.1 : 0.5)
  }
}

/** A rainbow trout: flips out of the water in an arc and back in (the world says where and when). */
export class Trout extends Critter {
  readonly height = 0.4
  private fish = new Group()
  private len = 1.1
  constructor(bag: Bag) {
    super()
    this.root.add(this.fish)
    this.fish.add(
      solidMix(
        [P.sphere(0.1, '#B9C7D4', { scale: [0.7, 0.9, 2.4] }), P.cone(0.12, 0.16, '#9BA9C2', { at: [0, 0, -0.3], rot: [-Math.PI / 2, 0, 0], scale: [0.25, 1, 1] }, 8)],
        [P.box(0.15, 0.04, 0.34, '#FF8FB8', { at: [0, 0, 0], scale: [1.08, 1, 1] }), ...eyes(0.06, 0.03, 0.17, 0.016)],
        bag,
        1.6,
      ),
    )
    this.fish.visible = false
  }
  /** Jump now (the world has put it where it jumps from). */
  jump(height = 1.1) {
    this.len = 0.75 + height * 0.25
    this.poke()
    this.peak = height
  }
  private peak = 1.1
  get flying() {
    return this.t >= 0
  }
  update(dt: number, _t: number) {
    const k = this.tick(dt, this.len)
    this.fish.visible = k >= 0
    if (k < 0) return
    // An arc forward, nose up then nose down, and a wiggle.
    this.fish.position.set(0, -0.2 + this.peak * 4 * k * (1 - k), (k - 0.5) * 1.6)
    this.fish.rotation.x = clamp(-(1 - 2 * k) * 1.1, -1.1, 1.1)
    this.fish.rotation.y = Math.sin(this.t * 30) * 0.25
  }
}

/** A hoary marmot: a chubby silver-grey rock sitter with a dark cap and feet and a white band across the nose. He sits
 *  on top of the rock pile looking round; poked, he sits up tall on his back legs, paws together, and whistles. */
export class Marmot extends Critter {
  readonly height = 0.75
  private body = new Group()
  private head = new Group()
  private tail = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const fur = '#A9A3A8'
    const silver = '#E4E0E4'
    const dark = '#5B4C4A'
    this.body.add(
      solid(
        merge([
          P.sphere(0.26, fur, { at: [0, 0.24, 0], scale: [1, 1.05, 0.95] }),
          P.sphere(0.2, silver, { at: [0, 0.4, 0.03], scale: [1.15, 0.7, 1] }),
          P.sphere(0.13, '#C9C1BE', { at: [0, 0.2, 0.17], scale: [1, 1.2, 0.6] }),
          ...[1, -1].map((s) => P.sphere(0.07, dark, { at: [s * 0.12, 0.03, 0.12], scale: [1, 0.6, 1.3] })),
          ...[1, -1].map((s) => P.capsule(0.045, 0.08, fur, { at: [s * 0.1, 0.3, 0.2], rot: [0.9, 0, s * 0.2] })),
        ]),
        bag,
        2,
      ),
    )
    this.head.position.set(0, 0.5, 0.05)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(0.15, fur, { at: [0, 0.08, 0.02] }),
          P.sphere(0.12, dark, { at: [0, 0.14, -0.01], scale: [1, 0.7, 1] }),
          P.sphere(0.08, silver, { at: [0, 0.03, 0.12], scale: [1.2, 0.8, 0.9] }),
          P.sphere(0.03, '#3A2E2C', { at: [0, 0.06, 0.2] }),
          ...[1, -1].map((s) => P.sphere(0.045, dark, { at: [s * 0.11, 0.19, -0.02], scale: [1, 0.8, 0.5] })),
        ],
        [P.box(0.1, 0.025, 0.02, '#FFFFFF', { at: [0, 0.1, 0.15] }), ...eyes(0.065, 0.12, 0.12, 0.022), ...cheeks(0.09, 0.05, 0.11, 0.025)],
        bag,
        2,
      ),
    )
    this.tail.position.set(0, 0.12, -0.22)
    this.body.add(this.tail)
    this.tail.add(solid(merge([P.capsule(0.06, 0.16, '#7A6A66', { at: [0, 0.02, -0.12], rot: [-1.2, 0, 0] })]), bag, 1.6))
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.8)
    // Up on his back legs (a little squat first), a hold while he whistles, then back down.
    const up = k < 0 ? 0 : k < 0.1 ? -0.3 * (k / 0.1) : bell(span(k, 0.1, 1)) ** 0.5
    this.body.scale.set(1 - up * 0.08, 1 + up * 0.28, 1)
    this.body.rotation.x = -0.15 * Math.max(0, up)
    this.head.rotation.x = -0.25 * Math.max(0, up)
    this.head.rotation.y = k < 0 ? Math.sin(t * 0.6 + this.phase) * 0.6 : 0
    this.tail.rotation.x = Math.sin(t * (k < 0 ? 1.5 : 18)) * (k < 0 ? 0.05 : 0.3)
  }
}

/** A bald eagle, soaring high over the lake: dark brown with a white head and tail, a hooked yellow beak and yellow
 *  feet, its long wings spread flat with the feathers fingered at the tips. The world flies it round in circles and
 *  says how much it banks; poked, it beats its wings hard (and the world makes it scream). */
export class Eagle extends Critter {
  readonly height = 0.7
  private wings: Group[] = []
  private head = new Group()
  private flapT = -1
  /** How much it banks into its circle (radians, the world sets it). */
  bank = 0
  constructor(bag: Bag) {
    super()
    const brown = '#5A3E31'
    const white = '#FFFFFF'
    const gold = '#FFC23D'
    this.root.add(
      solid(
        merge([
          P.sphere(0.24, brown, { at: [0, 0, 0], scale: [0.8, 0.7, 1.7] }),
          // The white tail, fanned.
          P.cone(0.22, 0.42, white, { at: [0, 0, -0.52], rot: [-Math.PI / 2, 0, 0], scale: [1.3, 1, 0.25] }, 10),
          ...[1, -1].map((s) => P.cone(0.04, 0.12, gold, { at: [s * 0.08, -0.12, -0.18], rot: [-Math.PI / 2 - 0.4, 0, 0] }, 6)),
        ]),
        bag,
        2,
      ),
    )
    this.head.position.set(0, 0.06, 0.38)
    this.root.add(this.head)
    this.head.add(solidMix([P.sphere(0.16, white, { scale: [0.95, 0.95, 1.1] }), P.cone(0.06, 0.16, gold, { at: [0, -0.03, 0.18], rot: [Math.PI / 2 + 0.35, 0, 0] }, 8)], eyes(0.08, 0.04, 0.11, 0.024), bag, 2))
    for (const s of [1, -1]) {
      const w = new Group()
      w.position.set(s * 0.16, 0.05, 0.05)
      const parts = [P.sphere(0.5, brown, { at: [s * 0.55, 0, 0], scale: [1.25, 0.08, 0.42] })]
      // The fingered tips.
      for (let i = 0; i < 4; i++) parts.push(P.rbox(0.32, 0.03, 0.07, 0.02, '#4A3328', { at: [s * (1.15 + i * 0.03), 0, 0.12 - i * 0.09], rot: [0, s * (0.15 - i * 0.12), 0] }))
      w.add(solid(merge(parts), bag, 2))
      this.root.add(w)
      this.wings.push(w)
    }
  }
  /** A few hard wing beats. */
  flap() {
    this.flapT = 0
  }
  update(dt: number, t: number) {
    this.tick(dt, 1)
    let beat = 0.12 * Math.sin(t * 1.3 + this.phase)
    if (this.flapT >= 0) {
      this.flapT += dt
      beat = Math.sin(this.flapT * 14) * 0.55 * (1 - span(this.flapT, 0.6, 1.6))
      if (this.flapT > 1.6) this.flapT = -1
    }
    this.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (0.08 + beat)))
    this.root.rotation.z = this.bank
    this.head.rotation.y = Math.sin(t * 0.8 + this.phase) * 0.4
  }
}

/** A mountain goat on a cliff ledge: shaggy white, with a long beard, short black horns curving back, black hooves and
 *  a black nose. He chews and looks round; poked, he crouches and hops along his ledge and back (and bleats). */
export class Goat extends Critter {
  readonly height = 1.1
  private body = new Group()
  private head = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const wool = '#FBF8F2'
    const shade = '#E6E0D8'
    const hoof = '#2E2A33'
    const parts = [
      P.rbox(0.42, 0.42, 0.78, 0.18, wool, { at: [0, 0.62, 0] }),
      // The shaggy hump over the shoulders and the "pants" of long hair on the legs.
      P.sphere(0.26, wool, { at: [0, 0.82, 0.22], scale: [0.95, 0.8, 1] }),
      P.sphere(0.2, shade, { at: [0, 0.5, -0.32], scale: [1.1, 0.9, 0.8] }),
    ]
    for (const [x, z] of [[0.13, 0.27], [-0.13, 0.27], [0.13, -0.27], [-0.13, -0.27]]) {
      parts.push(P.cyl(0.07, 0.06, 0.42, wool, { at: [x, 0.25, z] }, 8), P.cyl(0.05, 0.05, 0.08, hoof, { at: [x, 0.04, z] }, 8))
    }
    this.body.add(solid(merge(parts), bag, 2))
    this.head.position.set(0, 0.86, 0.42)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [
          P.rbox(0.2, 0.22, 0.34, 0.09, wool, { at: [0, 0.02, 0.12], rot: [0.5, 0, 0] }),
          P.sphere(0.035, hoof, { at: [0, -0.06, 0.3] }),
          P.cone(0.06, 0.2, shade, { at: [0, -0.17, 0.18], rot: [Math.PI, 0, 0] }, 8),
          ...[1, -1].map((s) => P.cone(0.025, 0.18, hoof, { at: [s * 0.05, 0.17, 0.02], rot: [-0.55, 0, s * 0.1] }, 8)),
          ...[1, -1].map((s) => P.sphere(0.04, wool, { at: [s * 0.11, 0.1, 0.0], scale: [1.4, 0.6, 0.7] })),
        ],
        [...eyes(0.075, 0.07, 0.18, 0.02), ...cheeks(0.08, 0.0, 0.2, 0.02)],
        bag,
        2,
      ),
    )
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.4)
    // A hop: crouch, up and over (along the ledge), land with a squash, and back to where he stood.
    let y = 0
    let sq = 0
    let along = 0
    if (k >= 0) {
      if (k < 0.15) sq = 0.12 * bell(k / 0.3)
      const air = span(k, 0.15, 0.6)
      y = bell(air) * 0.45
      along = Math.sin(Math.min(1, k / 0.6) * Math.PI * 0.5) * 0.6 * (1 - span(k, 0.65, 1))
      if (k > 0.6 && k < 0.75) sq = 0.1 * bell(span(k, 0.6, 0.75))
    }
    this.body.position.set(along, y, 0)
    this.body.scale.set(1 + sq * 0.5, 1 - sq, 1 + sq * 0.3)
    const chew = Math.sin(t * 6) * 0.03
    this.head.rotation.x = (k < 0 ? 0.1 : -0.2) + chew
    this.head.rotation.y = k < 0 ? Math.sin(t * 0.45 + this.phase) * 0.7 : 0
  }
}
