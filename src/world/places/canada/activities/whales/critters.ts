// Whale Peek-a-Boo's life round the edges of the sea, in the toon look: the sea lion on her rock (poked, she barks, and
// may slide into the water), gulls wheeling over the harbour, clouds drifting. The whales themselves are characters of
// their own (whale.ts). The world (watch.ts) places them and says when.
import { Group } from 'three'
import { bell } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

const eyes = (x: number, y: number, z: number, r = 0.03, c: string = PAL.ink) => [
  P.sphere(r, c, { at: [x, y, z] }),
  P.sphere(r, c, { at: [-x, y, z] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
  P.sphere(r * 0.35, '#FFFFFF', { at: [-x + r * 0.3, y + r * 0.4, z + r * 0.7] }),
]

/** Where the sea lion's head sits (above her chest). */
const HEAD_Y = 0.86

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

// ---------------------------------------------------------------- the shore's animals

/** A sea lion hauled out on the rock, propped up on her front flippers the way they sit: a sleek body tapering to her
 *  back flippers, a lighter chest, a little dog-like head with a pale muzzle, whiskers, tiny ear flaps and big shiny
 *  eyes. Poked, she lifts her head, flaps and barks; `slide()` sends her down into the water and back up onto the rock.
 *  She faces +z. */
export class SeaLion extends Critter {
  readonly height = 1
  private head = new Group()
  private flips: Group[] = []
  private slideT = -1
  constructor(bag: Bag) {
    super()
    const back = '#8A6248'
    const belly = '#C9A07A'
    const flip = '#5E4433'
    const muzzle = '#D8B391'
    // The body (children[0]: it breathes): hips low on the rock, the chest up, the neck leaning forward, the tail
    // end tapering back to the hind flippers spread out behind.
    this.root.add(
      solid(
        merge([
          P.sphere(0.3, back, { at: [0, 0.24, -0.36], scale: [1, 0.78, 1.45] }),
          P.sphere(0.3, back, { at: [0, 0.36, -0.03], scale: [1.02, 1, 1.15] }),
          P.sphere(0.27, back, { at: [0, 0.53, 0.17], rot: [-0.35, 0, 0], scale: [0.95, 1.15, 0.95] }),
          P.capsule(0.165, 0.2, back, { at: [0, 0.72, 0.28], rot: [0.4, 0, 0] }),
          P.sphere(0.2, belly, { at: [0, 0.5, 0.3], rot: [-0.3, 0, 0], scale: [0.8, 1.25, 0.55] }),
          P.cone(0.13, 0.34, back, { at: [0, 0.13, -0.84], rot: [-Math.PI / 2, 0, 0] }, 10),
          ...[-1, 1].map((s) => P.sphere(0.2, flip, { at: [s * 0.15, 0.05, -1.04], rot: [0, -s * 0.5, 0], scale: [0.38, 0.09, 1] })),
        ]),
        bag,
        2,
      ),
    )
    // Front flippers, each its own piece hung from the shoulder (a flap when she barks): an arm down the side of her
    // chest to a long flat flipper splayed forward on the rock.
    for (const s of [-1, 1]) {
      const f = new Group()
      f.position.set(s * 0.17, 0.42, 0.2)
      f.add(
        solid(
          merge([
            P.capsule(0.075, 0.26, back, { at: [s * 0.05, -0.18, 0.05], rot: [0.3, 0, s * 0.28] }),
            P.sphere(0.2, flip, { at: [s * 0.12, -0.36, 0.17], rot: [0, s * 0.45, s * 0.12], scale: [0.45, 0.1, 1] }),
          ]),
          bag,
          2,
        ),
      )
      this.flips.push(f)
      this.root.add(f)
    }
    // The head: round, a pale muzzle with a dark nose, whiskers, little ear flaps, big eyes with shines, pink cheeks.
    this.head.position.set(0, HEAD_Y, 0.36)
    this.root.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(0.16, back, { at: [0, 0.02, 0], scale: [0.95, 0.9, 1.05] }),
          P.sphere(0.095, muzzle, { at: [0, -0.04, 0.13], scale: [1.15, 0.8, 1.15] }),
          ...[-1, 1].map((s) => P.cone(0.026, 0.07, flip, { at: [s * 0.135, 0.06, -0.03], rot: [0, 0, -s * 1.2] }, 6)),
        ],
        [
          P.sphere(0.034, PAL.ink, { at: [0, -0.005, 0.235], scale: [1.35, 0.8, 0.9] }),
          ...eyes(0.072, 0.045, 0.125, 0.036),
          ...[-1, 1].map((s) => P.sphere(0.03, '#F4A7B9', { at: [s * 0.105, -0.035, 0.12], scale: [1, 0.6, 0.4] })),
          ...[-1, 1].flatMap((s) => [-0.02, -0.055].map((y, i) => P.cyl(0.004, 0.004, 0.17, '#FFFFFF', { at: [s * 0.15, y - 0.02, 0.16], rot: [0, 0, s * (1.45 + i * 0.25)] }, 4))),
        ],
        bag,
        2,
      ),
    )
  }
  slide() {
    if (this.slideT < 0) this.slideT = 0
  }
  get sliding() {
    return this.slideT >= 0
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 0.9)
    const bark = k < 0 ? 0 : bell(k)
    this.head.rotation.x = -0.7 * bark + Math.sin(t * 0.8 + this.phase) * 0.06
    this.head.rotation.y = Math.sin(t * 0.37 + this.phase) * 0.25 * (1 - bark)
    this.head.position.y = HEAD_Y + 0.08 * bark
    this.flips.forEach((f, i) => (f.rotation.z = (i ? 1 : -1) * 0.5 * bark * Math.abs(Math.sin((this.t < 0 ? 0 : this.t) * 14))))
    this.root.children[0].scale.y = 1 + Math.sin(t * 1.4 + this.phase) * 0.03
    if (this.slideT >= 0) {
      this.slideT += dt
      const q = this.slideT
      // Down the rock into the water, under, then she hauls out again.
      this.offset = q < 0.8 ? q / 0.8 : q < 2.8 ? 1 : q < 3.8 ? 1 - (q - 2.8) : 0
      if (q > 3.8) this.slideT = -1
    }
  }
  /** How far off the rock (0..1, the world moves her that way). */
  offset = 0
}

/** Gulls wheeling high over the harbour (ambient life): a few white birds with grey wings, gliding round in big lazy
 *  circles and flapping now and then. */
export class Gulls {
  readonly root = new Group()
  private birds: { g: Group; wings: Group[]; cx: number; cz: number; r: number; y: number; a: number; v: number }[] = []
  constructor(bag: Bag, spots: { x: number; z: number }[]) {
    spots.forEach((p, i) => {
      const g = new Group()
      g.add(solid(merge([P.sphere(0.25, '#FFFFFF', { scale: [0.7, 0.6, 1.6] }), P.cone(0.07, 0.2, PAL.gold, { at: [0, 0, 0.48], rot: [Math.PI / 2, 0, 0] }, 6)]), bag, 1.5))
      const wings = [1, -1].map((s) => {
        const w = new Group()
        w.add(solid(merge([P.sphere(0.5, '#C9CEDB', { at: [s * 0.5, 0, 0], scale: [1.1, 0.08, 0.32] }), P.sphere(0.2, '#4A4458', { at: [s * 1.0, 0, -0.03], scale: [0.6, 0.08, 0.5] })]), bag, 1.5))
        g.add(w)
        return w
      })
      this.root.add(g)
      this.birds.push({ g, wings, cx: p.x, cz: p.z, r: 10 + i * 4, y: 14 + i * 3, a: i * 2, v: (i % 2 ? 1 : -1) * (0.18 + i * 0.03) })
    })
  }
  update(dt: number, t: number) {
    this.birds.forEach((b, i) => {
      b.a += b.v * dt
      b.g.position.set(b.cx + Math.cos(b.a) * b.r, b.y + Math.sin(t * 0.5 + i) * 0.8, b.cz + Math.sin(b.a) * b.r)
      // Facing along the circle, banked into it.
      b.g.rotation.set(0, Math.atan2(-Math.sin(b.a) * b.v, Math.cos(b.a) * b.v), (b.v > 0 ? 1 : -1) * 0.3)
      const flap = Math.sin(t * 0.6 + i * 1.7) > 0.6 ? Math.sin(t * 12) * 0.6 : 0.1
      b.wings.forEach((w, k) => (w.rotation.z = (k ? -1 : 1) * flap))
    })
  }
}

/** Soft toon clouds drifting slowly over the sea (ambient life). */
export class Clouds {
  readonly root = new Group()
  private list: { g: Group; v: number }[] = []
  constructor(bag: Bag) {
    for (let i = 0; i < 7; i++) {
      const g = new Group()
      const s = 10 + (i % 3) * 5
      g.add(solid(merge([P.sphere(s, '#FFFFFF', { scale: [1.6, 0.6, 1] }), P.sphere(s * 0.7, '#FFFFFF', { at: [s * 0.9, s * 0.15, 0], scale: [1.3, 0.7, 1] }), P.sphere(s * 0.75, '#FFFFFF', { at: [-s * 0.95, s * 0.05, s * 0.1], scale: [1.3, 0.6, 1] }), P.sphere(s * 0.6, '#F3EEFF', { at: [s * 0.2, -s * 0.2, 0], scale: [2.2, 0.35, 1] })]), bag, 2))
      const a = -Math.PI * 0.9 + i * 0.55
      g.position.set(Math.sin(a) * 300, 70 + (i % 3) * 18, -Math.cos(a) * 300 - 40)
      this.root.add(g)
      this.list.push({ g, v: 1 + (i % 3) * 0.5 })
    }
  }
  update(dt: number) {
    for (const c of this.list) {
      c.g.position.x += c.v * dt
      if (c.g.position.x > 360) c.g.position.x = -360
    }
  }
}
