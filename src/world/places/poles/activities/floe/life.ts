// Who lives on Ice Floe Hop's sea, and what floats on it (the world, floe.ts, owns the floes and the bears). Everything
// here is something to poke on the way to Mama, spread along the course and never on it:
//   a ringed seal in her breathing hole on the first floe, a snowy owl on an ice block, a walrus on his own pan of ice,
//   a narwhal whose tusk pokes up beside the drifting ice, a puffin bobbing among it (she dives when ice floats over),
//   two belugas, a harp seal pup, Terry the tern flying over, and icebergs that twinkle.
// Each acts by itself a little (so the sea is alive before she touches it) and has one bigger act for a poke, with its
// own sound. Plus what only drifts: little bits of ice, falling snow sparkles, far icebergs, the low sun.
// Toon shapes from engine3d/geo.ts; the narwhal, the icebergs and the sun are the films' (story/props.ts).
import { BufferAttribute, BufferGeometry, CircleGeometry, Group, Mesh, MeshBasicMaterial, Points, PointsMaterial, RingGeometry, Vector3, type Object3D, type Scene } from 'three'
import { bell, clamp, smooth } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { swell } from '../../../../engine3d/water'
import { Actor } from '../../story/actor'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { roundSkirt } from '../../look/sea'
import { bergGeo, floeGeo, ICE, ICE_BLUE, ICE_LINE, ICE_SHADE, Narwhal, rng } from '../../story/props'
import type { FloeSpec } from './layout'
import { floeSfx } from './sounds'

export type CritterId = 'seal' | 'owl' | 'walrus' | 'narwhal' | 'puffin' | 'beluga' | 'pup' | 'terry' | 'berg'

/** What the animals need to know about the sea each frame (the world answers). */
export interface Sea {
  /** Where Pola is. */
  pola: Vector3
  /** Is a floe over this spot of water (within `pad` meters of it)? */
  covered(x: number, z: number, pad: number): boolean
  spray(x: number, y: number, z: number, n: number, speed: number, up: number, size: number): void
  ripple(x: number, z: number, size: number): void
}

const tmp = new Vector3()
const INK = PAL.ink
const ease = (now: number, goal: number, dt: number, rate: number) => now + (goal - now) * (1 - Math.exp(-dt * rate))

/** Two eyes with a shine each, on the front of a head of radius `r` (plain parts: no outline). */
function eyes(r: number, y: number, apart: number, size: number, color: string = INK) {
  return [-1, 1].flatMap((s) => {
    const z = Math.sqrt(Math.max(0.01, r * r - apart * apart - y * y)) * 0.97
    return [P.sphere(size, color, { at: [s * apart, y, z] }, 10), P.sphere(size * 0.36, '#FFFFFF', { at: [s * apart - size * 0.25, y + size * 0.35, z + size * 0.75] }, 6)]
  })
}

export abstract class Critter {
  readonly root = new Group()
  /** Seconds into its poked act, or -1. */
  protected act = -1
  protected phase = Math.random() * 6
  /** Out of sight right now (under the ice or the water): no tap target. */
  hidden = false
  /** `r`: how big a finger target it is (m); `cy`: how high its middle is above its root. */
  constructor(
    readonly id: CritterId,
    readonly r: number,
    protected cy: number,
  ) {}
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.cy, 0))
  }
  /** She poked it (or a splash nearby made it jump). */
  poke() {
    this.act = 0
    this.voice()
  }
  protected abstract voice(): void
  /** Moves the act along: 0..1 through it, or -1. */
  protected tick(dt: number, len: number) {
    if (this.act >= 0 && (this.act += dt) > len) this.act = -1
    return this.act >= 0 ? this.act / len : -1
  }
  abstract update(dt: number, t: number, sea: Sea): void
}

/** The ringed seal: a grey spotted head that pops up through her breathing hole in the ice (the hole is painted on the
 *  floe; she waits inside the slab). She ducks when Pola stands on her hole. */
class Seal extends Critter {
  private head = new Group()
  private up = 1
  private want = true
  private flipAt = 7
  private t = 0
  constructor(bag: Bag, parent: Group, x: number, y: number, z: number, face: number) {
    super('seal', 0.5, 0.3)
    const hole = new Mesh(
      bag.add(merge([bake(new RingGeometry(0.4, 0.52, 22), ICE_BLUE), bake(new CircleGeometry(0.41, 22), '#3D7FC4')].map((g) => g.rotateX(-Math.PI / 2)))),
      bag.add(new MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false })),
    )
    hole.position.y = 0.006
    hole.renderOrder = 1
    const fur = '#A7B0C2'
    const spots = [[0.1, 0.62, -0.08], [-0.12, 0.6, 0.02], [0.02, 0.65, 0.06], [-0.04, 0.6, -0.16], [0.17, 0.52, -0.02]].map(([sx, sy, sz]) => P.sphere(0.05, '#7E889E', { at: [sx, sy, sz], scale: [1, 0.5, 1] }, 8))
    this.head.add(
      solidMix(
        [P.capsule(0.2, 0.3, fur, { at: [0, 0.08, 0] }), P.sphere(0.25, fur, { at: [0, 0.42, 0.02] }, 16), ...[-1, 1].map((s) => P.sphere(0.1, '#DDE3EE', { at: [s * 0.075, 0.36, 0.2] }, 10))],
        [...eyes(0.25, 0.07, 0.11, 0.045).map((g) => g.translate(0, 0.42, 0.02)), P.sphere(0.04, INK, { at: [0, 0.42, 0.285] }, 8), ...spots],
        bag,
        2.5,
      ),
    )
    this.root.add(hole, this.head)
    this.root.position.set(x, y, z)
    // (Facing the camera, whichever way her floe is turned.)
    this.root.rotation.y = face
    parent.add(this.root)
  }
  protected voice() {
    floeSfx.seal()
    this.want = true
    this.flipAt = this.t + 7
  }
  update(dt: number, t: number, sea: Sea) {
    this.t = t
    this.root.getWorldPosition(tmp)
    const stoodOn = Math.hypot(tmp.x - sea.pola.x, tmp.z - sea.pola.z) < 0.9 && sea.pola.y > -0.2
    const was = this.act
    const k = this.tick(dt, 1.2)
    if (was === 0) sea.spray(tmp.x, tmp.y + 0.3, tmp.z, 8, 1.2, 2, 0.1)
    if (t > this.flipAt) {
      this.want = !this.want
      this.flipAt = t + (this.want ? 7 : 2.5)
      if (this.want && !stoodOn) floeSfx.pop()
    }
    this.up = ease(this.up, stoodOn ? 0 : k >= 0 || this.want ? 1 : 0, dt, 8)
    this.hidden = stoodOn
    this.head.position.y = -0.85 * (1 - this.up) + (k >= 0 ? 0.16 * bell(k) : 0) + 0.02 * Math.sin(t * 3)
    this.head.rotation.y = k >= 0 ? smooth(k) * Math.PI * 2 : 0.4 * Math.sin(t * 0.9 + this.phase)
    this.head.rotation.z = k >= 0 ? 0.2 * Math.sin(k * 22) * (1 - k) : 0
  }
}

/** A block of ice to sit on (the owl's). */
function perchGeo(r: number, h: number) {
  return merge([
    P.cyl(r * 0.72, r, h, ICE_SHADE, { at: [0, h / 2 - 0.15, 0] }, 6),
    P.cyl(r * 0.76, r * 0.72, 0.1, ICE, { at: [0, h - 0.13, 0] }, 6),
    P.cone(r * 0.4, h * 0.8, ICE, { at: [r * 0.8, h * 0.25, -r * 0.3], rot: [0, 0.4, -0.25] }, 5),
    P.cone(r * 0.3, h * 0.55, '#E6F1FF', { at: [-r * 0.75, h * 0.15, r * 0.35], rot: [0.2, 1, 0.3] }, 5),
  ])
}

/** The snowy owl on her ice block: white with dark flecks and big yellow eyes. Her head turns slowly from side to side;
 *  a poke spreads her wings and spins her head right round. */
class Owl extends Critter {
  private bird = new Group()
  private head = new Group()
  private wings: Group[] = []
  private look = 0
  constructor(bag: Bag, x: number, z: number) {
    super('owl', 0.6, 1.3)
    const h = 0.95
    this.root.add(solid(perchGeo(0.75, h), bag, 2.5))
    const white = '#FFFFFF'
    const flecks = [...Array(9)].map((_, i) => P.sphere(0.028, '#8A8FA6', { at: [((i % 3) - 1) * 0.1 + (i % 2) * 0.03, 0.16 + Math.floor(i / 3) * 0.1, 0.225 - Math.abs((i % 3) - 1) * 0.03 - Math.abs(Math.floor(i / 3) - 1) * 0.02], scale: [1.5, 0.6, 0.5] }, 6))
    this.bird.add(solidMix([P.sphere(0.26, white, { at: [0, 0.27, 0], scale: [0.95, 1.12, 0.9] }, 16), ...[-1, 1].map((s) => P.sphere(0.05, '#F2B63C', { at: [s * 0.09, 0.02, 0.16], scale: [1.4, 0.5, 1.8] }, 8))], flecks, bag, 2.5))
    this.head.add(
      solidMix(
        [P.sphere(0.2, white, {}, 16), P.cone(0.035, 0.09, '#4A4458', { at: [0, -0.04, 0.2], rot: [Math.PI * 0.62, 0, 0] }, 6)],
        [...eyes(0.2, 0.03, 0.085, 0.06, '#FFC83D'), ...[-1, 1].map((s) => P.sphere(0.03, INK, { at: [s * 0.085, 0.03, 0.2] }, 8))],
        bag,
        2.5,
      ),
    )
    this.head.position.set(0, 0.66, 0.02)
    this.bird.add(this.head)
    for (const s of [-1, 1]) {
      const w = new Group()
      w.add(solid(P.sphere(0.22, white, { at: [s * 0.03, -0.2, 0], scale: [0.32, 1, 0.72] }, 12), bag, 2.5))
      w.position.set(s * 0.22, 0.45, -0.02)
      this.bird.add(w)
      this.wings.push(w)
    }
    this.bird.position.y = h - 0.08
    this.root.add(this.bird)
    this.root.position.set(x, 0, z)
  }
  protected voice() {
    floeSfx.owl()
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.6)
    // (An owl looks one way, holds it, then the other.)
    this.look = ease(this.look, Math.sin(t * 0.45 + this.phase) > 0 ? 0.8 : -0.8, dt, 3)
    this.head.rotation.y = k >= 0 ? smooth(k) * Math.PI * 2 + this.look : this.look
    this.head.rotation.z = k >= 0 ? 0 : 0.12 * Math.sin(t * 0.7)
    const out = k >= 0 ? bell(k) : 0
    this.wings.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * out * (1.5 + 0.25 * Math.sin(t * 20))))
    this.bird.position.y = 0.87 + out * 0.22 + 0.012 * Math.sin(t * 2.4)
    this.root.position.y = swell(this.root.position.x, this.root.position.z, t) * 0.4
  }
}

/** The walrus, napping on his own pan of ice: brown and round with two long tusks and a whiskery nose. A poke (or a
 *  splash close by) makes him rear up and snort a puff of spray. */
class Walrus extends Critter {
  private body = new Group()
  private head = new Group()
  constructor(bag: Bag, x: number, z: number, face: number) {
    super('walrus', 0.95, 0.65)
    const top = 0.22
    this.root.add(solid(floeGeo(1.2, 77, top, 0.45), bag, 2.5))
    const skin = '#B98562'
    const dark = '#A06F50'
    this.body.add(
      solid(
        merge([
          P.sphere(0.52, skin, { at: [0, 0.4, -0.12], scale: [1.08, 0.8, 1.35] }, 18),
          ...[-1, 1].map((s) => P.sphere(0.24, dark, { at: [s * 0.5, 0.06, 0.34], scale: [1, 0.22, 0.7], rot: [0, s * 0.5, 0] }, 10)),
          ...[-1, 1].map((s) => P.sphere(0.2, dark, { at: [s * 0.2, 0.06, -0.85], scale: [0.8, 0.2, 1], rot: [0, -s * 0.4, 0] }, 10)),
        ]),
        bag,
        2.5,
      ),
    )
    const whiskers = [...Array(8)].map((_, i) => P.sphere(0.016, '#7A5238', { at: [((i % 4) - 1.5) * 0.065, -0.1 - Math.floor(i / 4) * 0.05, 0.4] }, 5))
    this.head.add(
      solidMix(
        [
          P.sphere(0.3, skin, {}, 16),
          ...[-1, 1].map((s) => P.sphere(0.15, '#E2BE98', { at: [s * 0.1, -0.1, 0.24] }, 10)),
          ...[-1, 1].map((s) => P.cone(0.045, 0.36, '#FFFBEA', { at: [s * 0.11, -0.36, 0.25], rot: [Math.PI - 0.12, 0, 0] }, 8)),
        ],
        [...eyes(0.3, 0.09, 0.13, 0.04), P.sphere(0.05, INK, { at: [0, -0.02, 0.36], scale: [1.3, 0.8, 1] }, 8), ...whiskers],
        bag,
        2.5,
      ),
    )
    this.head.position.set(0, 0.62, 0.48)
    this.body.add(this.head)
    this.body.position.y = top
    this.root.add(this.body)
    this.root.position.set(x, 0, z)
    this.root.rotation.y = face
  }
  protected voice() {
    floeSfx.walrus()
  }
  update(dt: number, t: number, sea: Sea) {
    const was = this.act
    const k = this.tick(dt, 1.5)
    if (was >= 0 && was < 0.35 && this.act >= 0.35) {
      this.head.localToWorld(tmp.set(0, 0, 0.5))
      sea.spray(tmp.x, tmp.y, tmp.z, 10, 1.4, 1.6, 0.1)
    }
    const { x, z } = this.root.position
    this.root.position.y = swell(x, z, t) * 0.6 - (k >= 0 ? 0.07 * Math.sin(k * Math.PI * 3) * (1 - k) : 0)
    this.root.rotation.z = swell(x + 1, z, t) * 0.1
    const jiggle = k >= 0 ? 0.08 * Math.sin(k * 34) * (1 - k) : 0
    // (Asleep: slow breaths.)
    this.body.scale.set(1 - jiggle * 0.5, 1 + 0.035 * Math.sin(t * 1.5 + this.phase) + jiggle, 1 - jiggle * 0.5)
    this.head.rotation.x = k >= 0 ? -0.6 * bell(k) : 0.06 * Math.sin(t * 1.5 + this.phase)
    this.head.rotation.z = k >= 0 ? 0.15 * Math.sin(k * 18) * (1 - k) : 0.08 * Math.sin(t * 0.6 + this.phase)
  }
}

/** A narwhal under the ice edge: only his tusk pokes up out of the water, swaying. A poke brings all of him up for a
 *  turn round and a blow, then down he goes again. (The films' Nari, smaller.) */
class Tusker extends Critter {
  private n: Narwhal
  private tip = new Group()
  private rise = 0
  private under = 0
  private home: [number, number, number]
  constructor(bag: Bag, x: number, z: number, face: number) {
    super('narwhal', 0.9, 0.35)
    this.n = new Narwhal(bag, 0.8)
    this.tip.add(this.n.root)
    this.root.add(this.tip)
    this.root.position.set(x, 0, z)
    this.root.rotation.y = face
    this.home = [x, z, face]
  }
  protected voice() {
    floeSfx.pop()
  }
  update(dt: number, t: number, sea: Sea) {
    const [x, z, face] = this.home
    const was = this.act
    const k = this.tick(dt, 5.5)
    if (was >= 0 && was < 0.9 && this.act >= 0.9) {
      this.n.tip(tmp)
      sea.spray(tmp.x, 0.5, tmp.z - 0.3, 14, 1.2, 3.2, 0.1)
      sea.ripple(x, z, 1.4)
      floeSfx.blow()
    }
    this.under = ease(this.under, sea.covered(x, z, 0.7) ? 1 : 0, dt, 5)
    this.rise = ease(this.rise, k >= 0 && k < 0.85 ? 1 : 0, dt, 4)
    const r = this.rise
    // Tusk up (the nose points at the sky) .. level at the top of the water.
    this.tip.rotation.x = -1.25 * (1 - r) - 0.1 * r + (1 - r) * 0.07 * Math.sin(t * 1.3 + this.phase)
    this.tip.rotation.z = (1 - r) * 0.06 * Math.sin(t * 0.9)
    this.tip.position.set(0, -1.2 * (1 - r) - 0.2 * r - this.under * 2.6, 0.9 * r)
    this.root.rotation.y = face + (k >= 0 ? smooth(clamp((k - 0.15) / 0.65)) * Math.PI * 2 : 0)
    this.n.speed = r
    this.n.update(dt, t)
    this.hidden = this.under > 0.5
  }
}

/** A white whale, nose to +z. */
function belugaGeo() {
  const white = '#FBFDFF'
  return {
    lined: [
      P.sphere(0.36, white, { scale: [0.85, 0.8, 1.9] }, 16),
      P.sphere(0.2, white, { at: [0, 0.13, 0.46] }, 12),
      P.sphere(0.11, white, { at: [0, -0.03, 0.68], scale: [1.2, 0.8, 1] }, 10),
      P.sphere(0.16, white, { at: [0, 0, -0.72], scale: [0.6, 0.55, 1.5] }, 10),
      ...[-1, 1].map((s) => P.sphere(0.2, '#DCE9F7', { at: [s * 0.17, 0, -0.98], scale: [1, 0.16, 0.62], rot: [0, s * 0.5, 0] }, 10)),
      ...[-1, 1].map((s) => P.sphere(0.15, '#DCE9F7', { at: [s * 0.3, -0.14, 0.2], scale: [1, 0.2, 0.6] }, 8)),
    ],
    plain: [...eyes(0.36, 0.03, 0.2, 0.04).map((g) => g.translate(0, 0, 0.26)), ...[-1, 1].map((s) => P.sphere(0.06, '#FFB3CF', { at: [s * 0.24, -0.06, 0.42], scale: [0.5, 0.6, 1] }, 8))],
  }
}

/** Two belugas swimming round each other, their white backs rolling up out of the water. A poke: they leap, one after
 *  the other, and sing. They sink out of the way when ice drifts over. */
class Belugas extends Critter {
  private pod: Group[] = []
  private under = 0
  private wet = [true, true]
  constructor(bag: Bag, x: number, z: number) {
    super('beluga', 1.1, 0.1)
    for (let i = 0; i < 2; i++) {
      const g = new Group()
      const b = belugaGeo()
      g.add(solidMix(b.lined, b.plain, bag, 2.5))
      g.rotation.order = 'YXZ'
      g.scale.setScalar(i ? 0.8 : 1)
      this.pod.push(g)
      this.root.add(g)
    }
    this.root.position.set(x, 0, z)
  }
  protected voice() {
    floeSfx.beluga()
  }
  update(dt: number, t: number, sea: Sea) {
    const { x, z } = this.root.position
    this.tick(dt, 2.2)
    this.under = ease(this.under, sea.covered(x, z, 1.3) ? 1 : 0, dt, 4)
    this.hidden = this.under > 0.5
    this.pod.forEach((g, i) => {
      const a = t * 0.55 + i * Math.PI + this.phase
      const roll = t * 1.7 + i * 2
      const k = this.act >= 0 ? clamp((this.act - i * 0.45) / 1.1) : 0
      const leaping = k > 0 && k < 1
      g.position.set(Math.cos(a) * 0.85, -0.3 + 0.2 * Math.sin(roll) + bell(k) * 0.95 - this.under * 1.5, Math.sin(a) * 0.85)
      g.rotation.set(leaping ? -Math.cos(k * Math.PI) * 0.95 : -0.22 * Math.cos(roll), -a, 0)
      if (leaping !== !this.wet[i]) {
        // Out of the water, or back in: a splash where she is.
        this.wet[i] = !leaping
        g.getWorldPosition(tmp)
        sea.ripple(tmp.x, tmp.z, 1.1)
        sea.spray(tmp.x, 0.1, tmp.z, 10, 1.6, 2.6, 0.12)
        if (!leaping) floeSfx.plip()
      }
    })
  }
}

/** A puffin bobbing on the water among the drifting ice: black and white with a big orange beak. A poke: she flaps,
 *  hops and spins. When ice floats over her she dives under and pops up again behind it. */
class Puffin extends Critter {
  private bird = new Group()
  private wings: Group[] = []
  private under = 0
  constructor(bag: Bag, x: number, z: number, face: number) {
    super('puffin', 0.45, 0.25)
    const black = '#3A3346'
    this.bird.add(
      solidMix(
        [
          P.sphere(0.2, black, { at: [0, 0.14, -0.02], scale: [0.95, 0.95, 1.2] }, 14),
          P.sphere(0.17, '#FFFFFF', { at: [0, 0.12, 0.09], scale: [0.9, 0.9, 1] }, 12),
          P.sphere(0.15, black, { at: [0, 0.42, 0.06] }, 14),
          ...[-1, 1].map((s) => P.sphere(0.1, '#FFFFFF', { at: [s * 0.065, 0.4, 0.14] }, 10)),
          P.cone(0.085, 0.2, '#FF8A3D', { at: [0, 0.37, 0.27], rot: [Math.PI / 2, 0, 0], scale: [0.55, 1, 1] }, 8),
          P.cyl(0.07, 0.07, 0.04, '#6C8FD0', { at: [0, 0.37, 0.19], rot: [Math.PI / 2, 0, 0], scale: [0.6, 1, 1] }, 8),
        ],
        [-1, 1].flatMap((s) => [P.sphere(0.028, INK, { at: [s * 0.1, 0.43, 0.2] }, 6), P.sphere(0.03, '#FFB3CF', { at: [s * 0.12, 0.36, 0.18], scale: [0.5, 0.6, 1] }, 6)]),
        bag,
        2.5,
      ),
    )
    for (const s of [-1, 1]) {
      const w = new Group()
      w.add(solid(P.sphere(0.17, black, { at: [s * 0.02, -0.12, 0], scale: [0.28, 1, 0.7] }, 10), bag, 2))
      w.position.set(s * 0.18, 0.26, -0.03)
      this.bird.add(w)
      this.wings.push(w)
    }
    this.bird.scale.setScalar(1.25)
    this.root.add(this.bird)
    this.root.position.set(x, 0, z)
    this.root.rotation.y = face
  }
  protected voice() {
    floeSfx.puffin()
  }
  update(dt: number, t: number, sea: Sea) {
    const { x, z } = this.root.position
    const k = this.tick(dt, 1.3)
    const was = this.hidden
    this.under = ease(this.under, sea.covered(x, z, 0.45) ? 1 : 0, dt, 6)
    this.hidden = this.under > 0.5
    if (was !== this.hidden) sea.ripple(x, z, 0.8)
    const hop = k >= 0 ? bell(k) : 0
    this.bird.position.y = -0.04 + swell(x, z, t) * 0.8 + 0.02 * Math.sin(t * 2.2 + this.phase) + hop * 0.4 - this.under * 0.95
    this.bird.rotation.set(0.06 * Math.sin(t * 1.6 + this.phase), (k >= 0 ? smooth(k) * Math.PI * 2 : 0) + 0.25 * Math.sin(t * 0.5 + this.phase), 0.05 * Math.sin(t * 1.9))
    this.wings.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * hop * (1.2 + 0.5 * Math.sin(t * 34))))
  }
}

/** A harp seal pup on a little pan of ice: a white fluffy sausage with big dark eyes. A poke rolls her right over. */
class Pup extends Critter {
  private pup = new Group()
  private head = new Group()
  constructor(bag: Bag, x: number, z: number, face: number) {
    super('pup', 0.7, 0.45)
    const top = 0.2
    this.root.add(solid(floeGeo(0.9, 91, top, 0.4), bag, 2.5))
    const white = '#FFFFFF'
    const soft = '#E4EAF6'
    this.pup.add(
      solid(
        merge([
          P.sphere(0.3, white, { at: [0, 0.2, -0.08], scale: [1, 0.72, 1.5] }, 16),
          ...[-1, 1].map((s) => P.sphere(0.13, soft, { at: [s * 0.3, 0.04, 0.12], scale: [1, 0.25, 0.6], rot: [0, s * 0.6, 0] }, 8)),
          ...[-1, 1].map((s) => P.sphere(0.12, soft, { at: [s * 0.09, 0.08, -0.56], scale: [0.7, 0.25, 1], rot: [0, -s * 0.4, 0] }, 8)),
        ]),
        bag,
        2.5,
      ),
    )
    this.head.add(solidMix([P.sphere(0.22, white, {}, 16), ...[-1, 1].map((s) => P.sphere(0.08, '#F1F4FA', { at: [s * 0.06, -0.06, 0.17] }, 8))], [...eyes(0.22, 0.04, 0.09, 0.05), P.sphere(0.032, INK, { at: [0, -0.02, 0.235] }, 8)], bag, 2.5))
    this.head.position.set(0, 0.3, 0.36)
    this.pup.add(this.head)
    this.pup.position.y = top
    this.root.add(this.pup)
    this.root.position.set(x, 0, z)
    this.root.rotation.y = face
  }
  protected voice() {
    floeSfx.pup()
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.2)
    const { x, z } = this.root.position
    this.root.position.y = swell(x, z, t) * 0.6 - (k >= 0 ? 0.05 * Math.sin(k * Math.PI * 3) * (1 - k) : 0)
    this.root.rotation.z = swell(x + 1, z, t) * 0.1
    this.pup.position.y = 0.2 + (k >= 0 ? bell(k) * 0.3 : 0)
    this.pup.rotation.set(0, 0.18 * Math.sin(t * 1.1 + this.phase), k >= 0 ? smooth(k) * Math.PI * 2 : 0)
    this.head.rotation.set(0.1 * Math.sin(t * 2 + this.phase), 0.3 * Math.sin(t * 0.7 + this.phase), 0.16 * Math.sin(t * 1.3))
  }
}

/** Terry the Arctic tern (the films' actor) flying over the ice, one way then the other. A poke: a barrel roll and
 *  his call. */
class Tern extends Critter {
  private actor: Actor
  private next = 5
  private dir = 1
  constructor(bag: Bag) {
    super('terry', 0.6, 0.35)
    this.actor = new Actor('terry', bag, { height: 0.78, voice: null })
    this.root.add(this.actor.root)
    this.hidden = true
  }
  center(out: Vector3) {
    return this.actor.at(0.5, out)
  }
  protected voice() {
    floeSfx.tern()
  }
  update(dt: number, t: number, sea: Sea) {
    const a = this.actor
    const k = this.tick(dt, 0.9)
    if (!a.busy) {
      a.root.visible = false
      this.hidden = true
      if (t > this.next) {
        const z = sea.pola.z - 2.2 - Math.random() * 2
        a.place(-11 * this.dir, 2.2, z)
        a.flyTo(11 * this.dir, 2.5, z - 1, 9, null, 0.5)
        this.dir = -this.dir
        this.next = t + 9 + 11
        this.hidden = false
      }
    }
    a.root.rotation.z = k >= 0 ? smooth(k) * Math.PI * 2 * -this.dir : 0
    a.update(dt, t)
  }
}

/** An iceberg near the way (a poke: it twinkles). */
class Berg extends Critter {
  constructor(
    bag: Bag,
    x: number,
    z: number,
    private size: number,
    seed: number,
  ) {
    super('berg', size * 0.9, size * 0.9)
    this.root.add(solid(bergGeo(size, seed), bag, 2.5, ICE_LINE))
    this.root.position.set(x, 0, z)
  }
  protected voice() {
    floeSfx.twinkle()
  }
  update(dt: number, _t: number, sea: Sea) {
    const was = this.act
    const k = this.tick(dt, 0.8)
    if (was === 0) sea.spray(this.root.position.x, this.size * 1.6, this.root.position.z, 12, 1.5, 1.5, 0.12)
    this.root.scale.setScalar(1 + (k >= 0 ? 0.07 * Math.sin(k * Math.PI * 3) * (1 - k) : 0))
  }
}

/** A spot of open water in a stretch of the course (z0 down to z1) with `pad` meters clear of every floe (and of where
 *  the drifting ones go), as near the way as it can be. `side`: which side to try first. */
export function clearSpot(specs: FloeSpec[], z0: number, z1: number, pad: number, side: number, taken: { x: number; z: number; r: number }[] = []) {
  let best: { x: number; z: number; score: number } | null = null
  const big = specs.map((f) => ({ f, R: Math.max(...f.pts.map(([x, z]) => Math.hypot(x, z))), amp: f.drift && !f.rest ? f.drift.amp : 0 }))
  for (let z = z0; z >= z1; z -= 0.4) {
    for (const s of [side, -side]) {
      for (let ax = 2.6; ax <= 7; ax += 0.3) {
        const x = s * ax
        const free = big.every(({ f, R, amp }) => Math.abs(z - f.z) > R + pad || Math.abs(x - f.x) > Math.sqrt(Math.max(0, (R + pad) ** 2 - (z - f.z) ** 2)) + amp) && taken.every((o) => Math.hypot(o.x - x, o.z - z) > o.r + pad + 1)
        if (!free) continue
        const score = ax + (s === side ? 0 : 0.7)
        if (!best || score < best.score) best = { x, z, score }
        break
      }
    }
  }
  return best ?? { x: side * 7.6, z: (z0 + z1) / 2 }
}

interface Bit {
  o: Group
  x: number
  z: number
  v: number
  kick: number
  phase: number
}

export class Life {
  readonly critters: Critter[] = []
  /** Ice that isn't a floe (the walrus's and the pup's pans, the owl's block): Pola can't land here and a pushed floe
   *  bumps into it. */
  readonly solids: { x: number; z: number; r: number; who: Critter }[] = []
  private bits: Bit[] = []
  private snow: Points
  private snowAt: Float32Array
  private far = new Group()

  /** `hole`: where the seal's breathing hole goes (a spot on the first floe, in its own coordinates). */
  /** `glow`: the sea's glow round a piece of floating ice (look/sea.ts PolarSea.skirt), from its skirt geometry. */
  constructor(scene: Scene, bag: Bag, specs: FloeSpec[], hole: { parent: Group; x: number; y: number; z: number; face: number }, glow?: (g: BufferGeometry) => Object3D) {
    const rest = (stage: string) => specs.find((f) => f.stage === stage && f.rest)!
    const drift = rest('drift')
    const melt = rest('melt')
    const mama = rest('mama')
    const add = (c: Critter, solidR = 0) => {
      this.critters.push(c)
      if (c.root.parent === null) scene.add(c.root)
      if (solidR) this.solids.push({ x: c.root.position.x, z: c.root.position.z, r: solidR, who: c })
      if (solidR && glow) c.root.add(glow(roundSkirt(solidR * 0.95, 0.9)))
      return c
    }
    add(new Seal(bag, hole.parent, hole.x, hole.y, hole.z, hole.face))
    // The big steady floes: the owl early, the walrus further on, on the other side.
    const owl = clearSpot(specs, -4.5, -10, 1.15, -1)
    add(new Owl(bag, owl.x, owl.z), 0.8)
    const wal = clearSpot(specs, -12.5, drift.z + 5, 1.6, 1, this.solids)
    add(new Walrus(bag, wal.x, wal.z, wal.x > 0 ? -0.5 : 0.5), 1.25)
    // Beside the first drifting floe (it holds still): the narwhal's tusk. Among the drifting ice: the puffin.
    const nSide = drift.x > 0 ? -1 : 1
    add(new Tusker(bag, drift.x + nSide * 3.6, drift.z + 0.9, nSide > 0 ? -0.6 : 0.6))
    add(new Puffin(bag, -nSide * 2.6, (drift.z + melt.z) / 2 + 1.9, nSide * 0.5))
    // Summer: the belugas beside the first little floe, the pup on her pan among them.
    const bSide = melt.x > 0 ? -1 : 1
    add(new Belugas(bag, melt.x + bSide * 4, melt.z + 0.4))
    const pup = clearSpot(specs, melt.z - 6, mama.z + 12, 1.25, -bSide, this.solids)
    add(new Pup(bag, pup.x, pup.z, pup.x > 0 ? -0.6 : 0.6), 0.95)
    add(new Tern(bag))

    // Icebergs: a few near the way (she can poke these), big ones further out, a wall of them behind Mama's ice with
    // the low sun over it.
    const r = rng(41)
    const end = mama.z
    for (let z = -3, i = 0; z > end + 8; z -= 11 + r() * 5, i++) {
      const s = i % 2 ? 1 : -1
      const size = 1.5 + r() * 1.1
      const berg = add(new Berg(bag, s * (8.6 + r() * 2.2), z, size, 50 + i))
      if (glow) berg.root.add(glow(roundSkirt(size * 0.95, size * 0.5)))
    }
    const farParts = []
    const farGlow: BufferGeometry[] = []
    for (let z = 6, i = 0; z > end - 6; z -= 13 + r() * 6, i++) {
      const s = i % 2 ? -1 : 1
      const size = 3.4 + r() * 3.2
      const x = s * (17 + r() * 9)
      farParts.push(bergGeo(size, 70 + i).translate(x, 0, z))
      farGlow.push(roundSkirt(size * 0.95, size * 0.45).translate(x, 0, z))
    }
    for (const [x, dz, size, seed] of [[-30, -34, 10, 1], [-9, -44, 13, 2], [17, -38, 9, 3], [36, -52, 14, 4], [-52, -60, 12, 5], [6, -26, 4.5, 6], [-17, -22, 3.6, 7], [24, -20, 3.2, 8]] as const) {
      farParts.push(bergGeo(size, seed).translate(mama.x + x, 0, end + dz))
      farGlow.push(roundSkirt(size * 0.95, Math.min(4, size * 0.45)).translate(mama.x + x, 0, end + dz))
    }
    this.far.add(solid(merge(farParts), bag, 2.5, ICE_LINE))
    if (glow) this.far.add(glow(mergeGeometries(farGlow)!))
    scene.add(this.far)

    // Little bits of ice adrift on the water.
    for (let i = 0; i < 28; i++) {
      const parts = [...Array(2 + (i % 3))].map((_, j) => floeGeo(0.16 + r() * 0.22, 200 + i * 5 + j, 0.07, 0.16).translate((r() - 0.5) * 1.1, 0, (r() - 0.5) * 1.1))
      const o = solid(merge(parts), bag, 1.5)
      const b: Bit = { o, x: (r() - 0.5) * 15, z: 2 + ((end - 4) * (i + r() * 0.8)) / 28, v: (0.08 + r() * 0.12) * (i % 2 ? 1 : -1), kick: 0, phase: r() * 6 }
      o.rotation.y = r() * 6
      this.bits.push(b)
      scene.add(o)
    }

    // Snow sparkles drifting down round Pola.
    const n = 70
    this.snowAt = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) this.snowAt.set([(r() - 0.5) * 16, r() * 4.5, (r() - 0.5) * 16], i * 3)
    const g = bag.add(new BufferGeometry())
    g.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3))
    this.snow = new Points(g, bag.add(new PointsMaterial({ color: '#FFFFFF', size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0.85, depthWrite: false })))
    this.snow.frustumCulled = false
    scene.add(this.snow)
  }

  /** A splash at (x, z): bits of ice jump, and anyone close by jumps too. */
  splash(x: number, z: number, big: number) {
    let clink = false
    for (const b of this.bits) {
      if (Math.hypot(b.x - x, b.z - z) < 1.2 + big * 1.4) {
        b.kick = 1
        clink = true
      }
    }
    if (clink) floeSfx.clink()
    if (big < 0.9) return
    for (const c of this.critters) {
      if (c.id === 'berg' || c.id === 'terry' || c.id === 'seal' || c.hidden) continue
      if (Math.hypot(c.root.position.x - x, c.root.position.z - z) < 2.8) c.poke()
    }
  }

  /** The solid ice (not a floe) at a spot, if any. */
  solidAt(x: number, z: number, pad = 0) {
    return this.solids.find((s) => Math.hypot(s.x - x, s.z - z) < s.r + pad) ?? null
  }

  update(dt: number, t: number, sea: Sea) {
    for (const c of this.critters) c.update(dt, t, sea)
    for (const b of this.bits) {
      b.x += b.v * dt
      if (Math.abs(b.x) > 8.5) b.v = -Math.sign(b.x) * Math.abs(b.v)
      b.kick = Math.max(0, b.kick - dt * 1.6)
      b.o.position.set(b.x, swell(b.x, b.z, t) * 0.9 + 0.12 * Math.abs(Math.sin(b.kick * Math.PI * 2)) * b.kick, b.z)
      b.o.rotation.y += dt * (0.1 * Math.sign(b.v) + b.kick * 3)
      b.o.rotation.z = 0.08 * Math.sin(t * 1.3 + b.phase)
    }
    // The snow: each flake falls and sways in a box that follows Pola.
    const pos = this.snow.geometry.attributes.position as BufferAttribute
    const at = this.snowAt
    for (let i = 0; i < at.length; i += 3) {
      at[i + 1] -= dt * (0.22 + (i % 5) * 0.03)
      if (at[i + 1] < 0.1) at[i + 1] += 4.5
      pos.setXYZ(i / 3, sea.pola.x * 0.7 + at[i] + 0.3 * Math.sin(t * 0.8 + i), at[i + 1], sea.pola.z - 2 + at[i + 2])
    }
    pos.needsUpdate = true
    ;(this.snow.material as PointsMaterial).opacity = 0.6 + 0.25 * Math.sin(t * 2.3)
  }
}
