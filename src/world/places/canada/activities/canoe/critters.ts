// Red Canoe's lake animals as greybox shapes in the toon look (the art gate builds them properly): the loon (who dives
// and pops up somewhere else, laughing; the last time with her chick on her back), a mother duck and her ducklings, a
// beaver who pops up by the lodge and slaps his tail, a pika who says "eep!" on the rock pile, a ground squirrel who
// stands up on his rock, and a trout who jumps. The moose is the Mountain Bike's (bike/critters.ts). Each one has its
// own little action; the world (paddle.ts) places them and says when.
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

/** The loon: black head, white necklace, a black back checkered white, a red eye, a long dark beak. She floats low;
 *  `dive()` tips her forward and under, `surface()` pops her back up. A chick can ride on her back. */
export class Loon extends Critter {
  readonly height = 0.75
  private body = new Group()
  private neck = new Group()
  private chick = new Group()
  /** 0 = under the water, 1 = floating. */
  up = 1
  private goal = 1
  private diveT = -1
  constructor(bag: Bag, withChick = false) {
    super()
    this.root.add(this.body)
    const black = '#2E2A3A'
    const dots = []
    for (let i = 0; i < 14; i++) {
      const a = (i % 7) * 0.22 - 0.66
      const r = Math.floor(i / 7)
      dots.push(P.sphere(0.035, '#FFFFFF', { at: [(r ? 1 : -1) * (0.2 + Math.abs(a) * 0.02), 0.2, a * 0.6 - 0.05], scale: [0.6, 0.6, 1] }))
    }
    this.body.add(solidMix([P.sphere(0.32, black, { at: [0, 0.06, 0], scale: [0.85, 0.6, 1.5] }), P.sphere(0.22, '#FFFFFF', { at: [0, -0.04, 0.05], scale: [0.95, 0.5, 1.5] })], dots, bag, 2))
    this.neck.position.set(0, 0.16, 0.36)
    this.body.add(this.neck)
    this.neck.add(
      solidMix(
        [P.capsule(0.09, 0.14, black, { at: [0, 0.12, 0.02], rot: [-0.25, 0, 0] }), P.sphere(0.13, black, { at: [0, 0.3, 0.06] }), P.cone(0.04, 0.24, '#3A3346', { at: [0, 0.28, 0.27], rot: [Math.PI / 2, 0, 0] }, 8)],
        [P.torus(0.092, 0.018, '#FFFFFF', { at: [0, 0.12, 0.02], rot: [Math.PI / 2 - 0.25, 0, 0] }), ...eyes(0.09, 0.34, 0.12, 0.028, '#E2364B')],
        bag,
        2,
      ),
    )
    if (withChick) {
      this.chick.add(solidMix([P.sphere(0.14, '#8E8496', { scale: [1, 0.9, 1.15] }), P.sphere(0.09, '#8E8496', { at: [0, 0.14, 0.1] }), P.cone(0.025, 0.08, '#3A3346', { at: [0, 0.14, 0.22], rot: [Math.PI / 2, 0, 0] }, 6)], [...eyes(0.045, 0.17, 0.17, 0.018), ...cheeks(0.06, 0.12, 0.15, 0.025)], bag, 2))
      this.chick.position.set(0, 0.3, -0.12)
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
    this.body.position.y = -0.95 * (1 - this.up) + Math.sin(t * 1.9 + this.phase) * 0.025
    this.body.visible = this.up > 0.02
    // A poke (or a call): her head goes up and back, beak open to the sky.
    const k = this.tick(dt, 1.4)
    const call = k < 0 ? 0 : bell(span(k, 0, 1))
    this.neck.rotation.x = -0.7 * call + Math.sin(t * 1.3 + this.phase) * 0.05
    this.chick.position.y = 0.3 + Math.abs(Math.sin(t * 3)) * 0.02
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
