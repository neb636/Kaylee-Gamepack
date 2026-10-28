// Whale Watch's sea animals as greybox shapes in the toon look (the art gate builds them properly): sea otters floating
// on their backs (they hold hands, wave, crack a shell on their tummy, dive and pop up with seaweed on their heads,
// glaring), the grey whale and the humpback (they come up, blow, show their tail and dive; the humpback can jump right
// out), the orca family (grandma, mama, the tall-finned dad and the baby, who swim alongside and jump), the sea lions on
// their rock, the bald eagle on the dead tree, a tufted puffin, purple sea stars and a surfer. Each one has its own
// little action; the world (watch.ts) places them and says when.
import { Group, Vector3 } from 'three'
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

// ---------------------------------------------------------------- sea otters

/** A sea otter floating on her back, paws on her tummy, feet up. `wave()` lifts a paw, `poke()` cracks a shell on her
 *  tummy, `dive()` flips her under and back up with seaweed on her head and a glare. `hold` reaches a paw out to the
 *  side (holding hands with the otter next to her); `sleepy` shuts her eyes. */
export class Otter extends Critter {
  readonly height = 0.5
  private body = new Group()
  private head = new Group()
  private pawL = new Group()
  private pawR = new Group()
  private shell: Group
  private weed: Group
  private brows: Group
  private eyes: Group
  private waveT = -1
  private diveT = -1
  private clacks = 0
  /** Which paw reaches out to hold hands (+1 her left, -1 her right, 0 none). */
  hold = 0
  /** Sleepy: eyes shut (drifting off). */
  sleepy = false
  /** One clack of the shell happened this frame (the world clicks). */
  clack = false
  /** Seconds of glaring left (after a fast boat). */
  private glare = 0
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    const fur = '#8A5E45'
    const face = '#E8D2B8'
    // Lying on her back along +z (head at +z), tummy up.
    this.body.add(solid(merge([P.capsule(0.22, 0.55, fur, { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.75] }), P.sphere(0.17, '#B98D6E', { at: [0, 0.1, 0.05], scale: [1, 0.5, 1.6] }), P.sphere(0.07, '#5E4033', { at: [0.1, 0.12, -0.5] }), P.sphere(0.07, '#5E4033', { at: [-0.1, 0.12, -0.5] }), P.cone(0.07, 0.4, fur, { at: [0, 0, -0.6], rot: [-Math.PI / 2, 0, 0] }, 8)]), bag, 2))
    this.head.position.set(0, 0.08, 0.48)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [P.sphere(0.2, face, { at: [0, 0.06, 0.05] }), P.sphere(0.1, '#F4E6D6', { at: [0, 0.02, 0.2], scale: [1.3, 0.8, 0.8] }), P.sphere(0.04, PAL.ink, { at: [0, 0.07, 0.29] }), P.sphere(0.05, fur, { at: [0.15, 0.17, 0] }), P.sphere(0.05, fur, { at: [-0.15, 0.17, 0] })],
        cheeks(0.12, 0.04, 0.17, 0.03),
        bag,
        2,
      ),
    )
    this.eyes = solid(merge(eyes(0.08, 0.14, 0.17, 0.028)), bag, 0)
    this.head.add(this.eyes)
    // A frown when glaring: little dark brows.
    this.brows = solid(merge([P.box(0.07, 0.015, 0.015, PAL.ink, { at: [0.08, 0.2, 0.19], rot: [0, 0, -0.5] }), P.box(0.07, 0.015, 0.015, PAL.ink, { at: [-0.08, 0.2, 0.19], rot: [0, 0, 0.5] })]), bag, 0)
    this.brows.visible = false
    this.head.add(this.brows)
    // Seaweed on her head after a dive.
    this.weed = solid(merge([P.rbox(0.36, 0.04, 0.14, 0.02, '#5FA35A', { at: [0, 0.27, 0.02], rot: [0, 0, 0.2] }), P.rbox(0.08, 0.04, 0.3, 0.02, '#4E8F4B', { at: [0.15, 0.2, -0.05], rot: [0.4, 0, -0.8] })]), bag, 1.5)
    this.weed.visible = false
    this.head.add(this.weed)
    for (const [g, side] of [
      [this.pawL, 1],
      [this.pawR, -1],
    ] as const) {
      g.position.set(side * 0.16, 0.12, 0.25)
      g.add(solid(merge([P.capsule(0.05, 0.12, fur, { at: [0, 0.08, 0] })]), bag, 1.5))
      this.body.add(g)
    }
    this.shell = solid(merge([P.sphere(0.07, '#E6DCEB', { scale: [1, 0.5, 1] })]), bag, 1.5)
    this.shell.position.set(0, 0.2, 0.12)
    this.body.add(this.shell)
  }
  poke() {
    super.poke()
    this.clacks = 0
  }
  wave() {
    if (this.diveT < 0) this.waveT = 0
  }
  dive() {
    if (this.diveT < 0) this.diveT = 0
  }
  get diving() {
    return this.diveT >= 0
  }
  get glaring() {
    return this.glare > 0
  }
  update(dt: number, t: number) {
    this.clack = false
    // Bobbing on the swell, rocking a little.
    this.body.position.y = Math.sin(t * 1.6 + this.phase) * 0.04
    this.body.rotation.z = Math.sin(t * 0.9 + this.phase) * 0.08
    // A dive: rolls over sideways and under, then pops up with seaweed on her head, glaring.
    if (this.diveT >= 0) {
      this.diveT += dt
      const q = this.diveT
      if (q < 0.5) {
        this.body.rotation.z = Math.PI * (q / 0.5)
        this.body.position.y = -0.25 * (q / 0.5)
      } else if (q < 1.6) this.body.position.y = -1.2
      else if (q < 2) {
        const k = (q - 1.6) / 0.4
        this.body.rotation.z = Math.PI * (1 - k)
        this.body.position.y = -1.2 + 1.2 * k
        this.weed.visible = true
        this.glare = 4
      } else this.diveT = -1
    }
    this.body.visible = this.body.position.y > -1.1
    this.glare = Math.max(0, this.glare - dt)
    if (this.glare <= 0 && this.weed.visible && Math.random() < dt * 0.15) this.weed.visible = false
    this.brows.visible = this.glare > 0
    this.eyes.scale.y = this.sleepy ? 0.15 : 1
    // Paws: on her tummy, banging the shell when poked (four clacks), one reaching out to hold hands, one up waving.
    const k = this.tick(dt, 1.2)
    this.shell.visible = k >= 0
    const n = k < 0 ? 0 : Math.floor(this.t / 0.3)
    if (k >= 0 && n >= this.clacks) {
      this.clacks = n + 1
      this.clack = true
    }
    const bang = k < 0 ? 0 : Math.abs(Math.sin((this.t / 0.3) * Math.PI))
    const wave = this.waveT >= 0 ? bell(span(this.waveT, 0, 1.4)) : 0
    if (this.waveT >= 0) this.waveT = this.waveT + dt > 1.4 ? -1 : this.waveT + dt
    this.pawL.rotation.set(-bang * 0.8, 0, this.hold > 0 ? 1.3 : 0)
    this.pawR.rotation.set(-bang * 0.8 - wave * 1.5, Math.sin(t * 14) * wave * 0.4, this.hold < 0 ? -1.3 : -wave * 0.6)
    this.head.rotation.x = this.sleepy ? 0.25 : -bang * 0.15
  }
}

// ---------------------------------------------------------------- whales

export type WhaleKind = 'grey' | 'humpback'

/** A grey whale (mottled grey, knuckles along the back) or a humpback (dark, a little fin, long white flippers). The
 *  world plays one of three moves at a spot: `surface()` (rises, blows, rolls forward, shows its tail, dives), `breach()`
 *  (a humpback jumps right out and lands on its side) or `swim()` (under the water, slowly round, for listening). */
export class Whale {
  readonly root = new Group()
  readonly body = new Group()
  private fluke = new Group()
  private flipL = new Group()
  private flipR = new Group()
  readonly len: number
  /** What it's doing: the time since the move began (-1: hidden). */
  private t = -1
  private move: 'surface' | 'breach' | 'swim' | null = null
  /** It blew this frame (the world sprays the spout), landed from a jump, or slapped its tail. */
  blew = false
  landed = false
  slapped = false
  private blewOnce = false
  private landedOnce = false
  /** The blowhole, in body space. */
  readonly hole: Vector3
  constructor(
    bag: Bag,
    readonly kind: WhaleKind,
  ) {
    const grey = kind === 'grey'
    const skin = grey ? '#8F95A6' : '#4C5568'
    const belly = grey ? '#B4B9C6' : '#E9ECF4'
    this.len = grey ? 9 : 10
    const L = this.len
    this.root.add(this.body)
    const spots = grey ? Array.from({ length: 14 }, (_, i) => P.sphere(0.22 + (i % 3) * 0.08, '#C5C9D4', { at: [(i % 2 ? 1 : -1) * (0.5 + (i % 4) * 0.15), 0.75 + (i % 3) * 0.1, L * 0.3 - i * 0.55], scale: [1, 0.3, 1.2] }, 8)) : []
    const knuckles = grey ? Array.from({ length: 6 }, (_, i) => P.sphere(0.16, skin, { at: [0, 0.98 - i * 0.04, -L * 0.1 - i * 0.45] }, 8)) : [P.prism([[-0.4, 0], [0.4, 0], [0, 0.5]], 0.14, skin, { at: [0, 0.9, -L * 0.18], rot: [0, Math.PI / 2, 0] })]
    this.body.add(
      solidMix(
        [P.sphere(1, skin, { at: [0, 0, 0], scale: [1.15, 1, L * 0.42] }), P.sphere(0.9, belly, { at: [0, -0.22, 0.2], scale: [1.05, 0.75, L * 0.38] }), P.cyl(0.42, 0.14, L * 0.32, skin, { at: [0, 0.05, -L * 0.48], rot: [Math.PI / 2, 0, 0] }, 12), ...knuckles],
        [...spots, ...eyes(0.95, 0.05, L * 0.3, 0.09), P.sphere(0.12, '#2B2C3A', { at: [0, 1.0, L * 0.26], scale: [1.4, 0.4, 0.6] })],
        bag,
        3,
      ),
    )
    this.hole = new Vector3(0, 1.0, L * 0.26)
    // The tail's flukes on their pivot at the end of the tail stock.
    this.fluke.position.set(0, 0.05, -L * 0.62)
    this.body.add(this.fluke)
    this.fluke.add(solid(merge([P.sphere(1, skin, { at: [0.85, 0, -0.35], scale: [1.05, 0.12, 0.5], rot: [0, 0.35, 0] }), P.sphere(1, skin, { at: [-0.85, 0, -0.35], scale: [1.05, 0.12, 0.5], rot: [0, -0.35, 0] }), P.sphere(0.5, belly, { at: [0.85, -0.08, -0.35], scale: [1.6, 0.12, 0.7], rot: [0, 0.35, 0] }), P.sphere(0.5, belly, { at: [-0.85, -0.08, -0.35], scale: [1.6, 0.12, 0.7], rot: [0, -0.35, 0] })]), bag, 3))
    // Flippers: short for the grey, long and white for the humpback.
    for (const [g, side] of [
      [this.flipL, 1],
      [this.flipR, -1],
    ] as const) {
      g.position.set(side * 1.0, -0.35, L * 0.18)
      const fl = grey ? 1 : 2.6
      g.add(solid(merge([P.sphere(1, grey ? skin : belly, { at: [side * fl * 0.5, 0, -0.2], scale: [fl * 0.55, 0.1, 0.35], rot: [0, side * 0.4, 0] })]), bag, 2))
      this.body.add(g)
    }
    this.root.visible = false
  }
  get busy() {
    return this.move !== null
  }
  get up() {
    return this.root.visible && this.body.position.y > -1.2
  }
  /** Comes up here (facing `heading`), blows, shows its tail and dives (about 6.5 s). */
  surface() {
    this.move = 'surface'
    this.t = 0
    this.blewOnce = this.landedOnce = false
    this.root.visible = true
  }
  /** A humpback's jump: out of the water, a twist onto its side, a huge splash (about 3.5 s). */
  breach() {
    this.move = 'breach'
    this.t = 0
    this.blewOnce = this.landedOnce = false
    this.root.visible = true
  }
  /** Swims slowly round under the water (for listening), until `hide()`. */
  swim() {
    this.move = 'swim'
    this.t = 0
    this.root.visible = true
  }
  hide() {
    this.move = null
    this.t = -1
    this.root.visible = false
  }
  /** A poke while it's up: a tail slap (or another blow). */
  slap() {
    if (this.move === 'surface' && this.t < 3.2) this.t = 3.2
  }

  update(dt: number, t: number) {
    this.blew = this.landed = this.slapped = false
    if (!this.move) return
    this.t += dt
    const q = this.t
    const b = this.body
    const L = this.len
    // A gentle swim: the tail sways, the flippers paddle.
    this.fluke.rotation.x = Math.sin(t * 1.6) * 0.25
    this.flipL.rotation.z = Math.sin(t * 1.1) * 0.15
    this.flipR.rotation.z = -Math.sin(t * 1.1) * 0.15
    if (this.move === 'surface') {
      // Up (0-1.2 s), blow at 1.2, roll forward (the back arches), then the tail comes up and slides under (3.6-6 s).
      const rise = span(q, 0, 1.2)
      const roll = span(q, 3, 4.2)
      const sink = span(q, 4.6, 6.4)
      b.position.y = -3.5 + 3.05 * rise - 1.2 * roll - 3 * sink
      b.position.z = q * 0.8
      b.rotation.x = 0.18 * (1 - rise) + 0.55 * bell(roll) * 0.9 + 0.75 * span(q, 3.6, 5) - 0.2 * sink
      // The fluke lifts out of the water as the body tips down.
      this.fluke.rotation.x = 0.5 * bell(span(q, 3.6, 6)) + Math.sin(t * 1.6) * 0.1
      if (!this.blewOnce && q > 1.2) {
        this.blewOnce = true
        this.blew = true
      }
      if (!this.landedOnce && q > 5.4) {
        this.landedOnce = true
        this.slapped = true
      }
      if (q > 6.6) this.hide()
    } else if (this.move === 'breach') {
      // Rush up from below, out of the water nose first, twist onto its side at the top, crash down.
      const up = span(q, 0, 1.3)
      const fall = span(q, 1.3, 2.2)
      b.position.y = -6 + (6 + L * 0.35) * Math.sin(up * Math.PI * 0.5) - (L * 0.35 + 2) * fall * fall
      b.position.z = q * 1.5
      b.rotation.x = -1.2 * (1 - fall * 0.6) + 1.2 * fall
      b.rotation.z = 1.4 * span(q, 0.9, 2)
      this.flipL.rotation.z = 0.6 * bell(up)
      this.flipR.rotation.z = -0.6 * bell(up)
      if (!this.landedOnce && q > 2.05) {
        this.landedOnce = true
        this.landed = true
      }
      if (!this.blewOnce && q > 3) {
        this.blewOnce = true
        this.blew = true
      }
      if (q > 4.5) this.hide()
    } else {
      // Slowly round in a big circle below (the world puts the root where the circle is centered).
      const a = q * 0.12
      b.position.set(Math.cos(a) * 9, -6 + Math.sin(q * 0.4) * 0.6, Math.sin(a) * 9)
      b.rotation.set(Math.sin(q * 0.4) * 0.05, -a, Math.sin(q * 0.5) * 0.1)
    }
  }
  /** The blowhole in the world. */
  holeAt(out: Vector3) {
    return this.body.localToWorld(out.copy(this.hole))
  }
}

// ---------------------------------------------------------------- orcas

export type OrcaWho = 'grandma' | 'mama' | 'dad' | 'baby'

/** An orca: black, a white patch by the eye, a white belly, a grey saddle behind the fin. The dad's fin stands tall;
 *  the others' curve back. Cruising, its back and fin show above the water; `jump()` arcs it right out. */
export class Orca {
  readonly root = new Group()
  readonly body = new Group()
  private fluke = new Group()
  private jumpT = -1
  /** It came down from a jump this frame (the world splashes). */
  landed = false
  /** Under the water (0) or cruising with its fin up (1). */
  up = 1
  /** Seconds of a little happy wiggle left (the baby copying her turn). */
  private wiggle = 0
  constructor(
    bag: Bag,
    readonly who: OrcaWho,
  ) {
    const s = who === 'baby' ? 0.5 : who === 'dad' ? 1.12 : who === 'grandma' ? 1.02 : 0.95
    this.root.scale.setScalar(s)
    this.root.add(this.body)
    const black = '#262433'
    const fin = who === 'dad' ? P.prism([[-0.35, 0], [0.3, 0], [0.05, 1.8]], 0.12, black, { at: [0, 0.6, -0.2], rot: [0, Math.PI / 2, 0] }) : P.prism([[-0.45, 0], [0.3, 0], [-0.4, 0.95]], 0.12, black, { at: [0, 0.6, -0.2], rot: [0, Math.PI / 2, 0] })
    this.body.add(
      solidMix(
        [P.sphere(1, black, { scale: [0.75, 0.7, 2.6] }), P.sphere(0.6, '#FFFFFF', { at: [0, -0.32, 0.6], scale: [0.95, 0.6, 2.6] }), P.cyl(0.3, 0.12, 1.6, black, { at: [0, 0.02, -2.9], rot: [Math.PI / 2, 0, 0] }, 10), fin],
        [P.sphere(0.25, '#FFFFFF', { at: [0.6, 0.2, 1.5], scale: [0.4, 0.5, 1.4] }), P.sphere(0.25, '#FFFFFF', { at: [-0.6, 0.2, 1.5], scale: [0.4, 0.5, 1.4] }), P.sphere(0.35, '#B9B4C6', { at: [0, 0.55, -0.85], scale: [1, 0.4, 1.2] }), ...eyes(0.66, 0.12, 1.75, 0.05), ...(who === 'baby' ? cheeks(0.6, -0.05, 1.9, 0.08) : [])],
        bag,
        2.5,
      ),
    )
    this.fluke.position.set(0, 0.02, -3.65)
    this.body.add(this.fluke)
    this.fluke.add(solid(merge([P.sphere(1, black, { at: [0.55, 0, -0.2], scale: [0.65, 0.08, 0.32], rot: [0, 0.4, 0] }), P.sphere(1, black, { at: [-0.55, 0, -0.2], scale: [0.65, 0.08, 0.32], rot: [0, -0.4, 0] })]), bag, 2))
  }
  get jumping() {
    return this.jumpT >= 0
  }
  /** Out of the water in an arc (about 1.3 s). */
  jump() {
    if (this.jumpT < 0) this.jumpT = 0
  }
  /** The baby's little copycat wiggle (she turned, so it turns). */
  happy() {
    this.wiggle = 0.8
  }
  update(dt: number, t: number, phase: number) {
    this.landed = false
    this.wiggle = Math.max(0, this.wiggle - dt)
    // Cruising: the back rolls up and down through the surface, the fin always showing; the tail beats.
    let y = -0.5 + Math.sin(t * 1.4 + phase) * 0.18 - (1 - this.up) * 3.4
    let pitch = Math.cos(t * 1.4 + phase) * 0.06
    if (this.jumpT >= 0) {
      this.jumpT += dt
      const q = this.jumpT / 1.3
      y = -0.9 + 3.6 * Math.sin(Math.PI * clamp(q))
      pitch = -0.9 + 1.8 * clamp(q)
      if (q >= 1) {
        this.jumpT = -1
        this.landed = true
      }
    }
    this.body.position.y = y
    this.body.rotation.x = pitch
    this.body.rotation.z = Math.sin(this.wiggle * 18) * 0.35 * Math.min(1, this.wiggle * 3)
    this.fluke.rotation.x = Math.sin(t * 4 + phase) * 0.3
  }
}

// ---------------------------------------------------------------- the shore's animals

/** A sea lion lying on the rock; poked, she lifts her head and barks; `slide()` sends her down into the water and
 *  back up onto the rock. */
export class SeaLion extends Critter {
  readonly height = 1
  private head = new Group()
  private slideT = -1
  constructor(bag: Bag) {
    super()
    const brown = '#9A6E4E'
    this.root.add(solid(merge([P.capsule(0.32, 0.9, brown, { at: [0, 0.3, 0], rot: [Math.PI / 2 - 0.35, 0, 0] }), P.sphere(0.2, '#7E5840', { at: [0.32, 0.05, 0.25], scale: [1.4, 0.3, 0.8] }), P.sphere(0.2, '#7E5840', { at: [-0.32, 0.05, 0.25], scale: [1.4, 0.3, 0.8] }), P.cone(0.2, 0.4, '#7E5840', { at: [0, 0.12, -0.75], rot: [-Math.PI / 2, 0, 0] }, 8)]), bag, 2))
    this.head.position.set(0, 0.75, 0.42)
    this.root.add(this.head)
    this.head.add(solidMix([P.sphere(0.2, brown, { at: [0, 0.08, 0.05] }), P.sphere(0.11, '#B48A69', { at: [0, 0.03, 0.22], scale: [1, 0.8, 1] }), P.sphere(0.035, PAL.ink, { at: [0, 0.06, 0.32] })], eyes(0.08, 0.16, 0.18, 0.03), bag, 2))
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
    this.head.position.y = 0.75 + 0.08 * bark
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

/** The bald eagle on a dead tree: poked, she spreads her wings and screeches. */
export class Eagle extends Critter {
  readonly height = 0.9
  private wings: Group[] = []
  private head = new Group()
  constructor(bag: Bag) {
    super()
    const brown = '#5C3E2E'
    this.root.add(solid(merge([P.sphere(0.25, brown, { at: [0, 0.35, 0], scale: [0.9, 1.3, 0.85] }), P.cone(0.14, 0.3, '#FFFFFF', { at: [0, 0.08, -0.18], rot: [-2.5, 0, 0] }, 8), P.cyl(0.03, 0.03, 0.14, PAL.gold, { at: [0.08, 0.04, 0.03] }, 6), P.cyl(0.03, 0.03, 0.14, PAL.gold, { at: [-0.08, 0.04, 0.03] }, 6)]), bag, 2))
    this.head.position.set(0, 0.68, 0.04)
    this.root.add(this.head)
    this.head.add(solidMix([P.sphere(0.15, '#FFFFFF', { at: [0, 0.06, 0] }), P.cone(0.06, 0.16, PAL.gold, { at: [0, 0.04, 0.17], rot: [Math.PI / 2 + 0.3, 0, 0] }, 8)], eyes(0.07, 0.1, 0.11, 0.025), bag, 2))
    for (const side of [1, -1]) {
      const w = new Group()
      w.position.set(side * 0.2, 0.5, 0)
      w.add(solid(merge([P.sphere(0.3, brown, { at: [side * 0.3, -0.1, -0.05], scale: [1.2, 0.25, 0.55] })]), bag, 1.5))
      this.root.add(w)
      this.wings.push(w)
    }
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.6)
    const open = k < 0 ? 0 : bell(span(k, 0, 1)) ** 0.5
    this.wings.forEach((w, i) => {
      const side = i ? -1 : 1
      w.rotation.z = side * (-1.2 + 1.6 * open + Math.sin(this.t * 10) * 0.2 * open)
      w.rotation.y = side * 0.3 * (1 - open)
    })
    this.head.rotation.y = Math.sin(t * 0.5 + this.phase) * 0.6 * (1 - open)
    this.head.rotation.x = -0.4 * open
  }
}

/** A tufted puffin on her rock (black, a white face, the orange beak, golden tufts): poked, she flaps and hops up. */
export class Puffin extends Critter {
  readonly height = 0.55
  private wings: Group[] = []
  private body = new Group()
  constructor(bag: Bag) {
    super()
    this.root.add(this.body)
    this.body.add(
      solidMix(
        [P.sphere(0.2, '#2B2836', { at: [0, 0.26, 0], scale: [0.9, 1.15, 0.85] }), P.sphere(0.14, '#2B2836', { at: [0, 0.5, 0.03] }), P.sphere(0.1, '#FFFFFF', { at: [0, 0.5, 0.1], scale: [1.1, 0.9, 0.6] }), P.cone(0.07, 0.15, '#FF7A3C', { at: [0, 0.47, 0.2], rot: [Math.PI / 2, 0, 0] }, 6), P.cyl(0.03, 0.03, 0.08, '#FF7A3C', { at: [0.06, 0.03, 0.03] }, 6), P.cyl(0.03, 0.03, 0.08, '#FF7A3C', { at: [-0.06, 0.03, 0.03] }, 6)],
        [P.capsule(0.025, 0.14, PAL.butter, { at: [0.08, 0.55, -0.08], rot: [1.2, 0, 0.4] }), P.capsule(0.025, 0.14, PAL.butter, { at: [-0.08, 0.55, -0.08], rot: [1.2, 0, -0.4] }), ...eyes(0.06, 0.53, 0.12, 0.02)],
        bag,
        2,
      ),
    )
    for (const side of [1, -1]) {
      const w = new Group()
      w.position.set(side * 0.17, 0.32, 0)
      w.add(solid(merge([P.sphere(0.15, '#2B2836', { at: [side * 0.08, -0.04, 0], scale: [0.5, 1, 0.6] })]), bag, 1.5))
      this.body.add(w)
      this.wings.push(w)
    }
  }
  update(dt: number, t: number) {
    const k = this.tick(dt, 1.3)
    const flap = k < 0 ? 0 : bell(k)
    this.body.position.y = 0.5 * flap
    this.wings.forEach((w, i) => (w.rotation.z = (i ? -1 : 1) * (flap > 0 ? -0.4 + Math.sin(this.t * 30) * 1.1 : 0.05)))
    this.body.rotation.y = Math.sin(t * 0.7 + this.phase) * 0.5
  }
}

/** Purple sea stars stuck on the rock: poked, they wiggle their arms. */
export class SeaStars extends Critter {
  readonly height = 0.4
  private stars: Group[] = []
  constructor(bag: Bag, spots: [number, number, number, number][]) {
    super()
    for (const [x, y, z, ry] of spots) {
      const arms = Array.from({ length: 5 }, (_, i) => P.capsule(0.07, 0.22, '#9B5CC9', { at: [Math.sin((i * Math.PI * 2) / 5) * 0.16, 0, Math.cos((i * Math.PI * 2) / 5) * 0.16], rot: [Math.PI / 2, (i * Math.PI * 2) / 5, 0] }))
      const s = solid(merge([...arms, P.sphere(0.12, '#B475E0', { scale: [1, 0.5, 1] })]), bag, 1.5)
      s.position.set(x, y, z)
      s.rotation.set(-0.9, ry, 0)
      this.root.add(s)
      this.stars.push(s)
    }
  }
  update(dt: number) {
    const k = this.tick(dt, 1)
    const w = k < 0 ? 0 : bell(k)
    this.stars.forEach((s, i) => s.scale.setScalar(1 + w * 0.25 * Math.sin(this.t * 16 + i)))
  }
}

/** A surfer in a lavender wetsuit on a pink board, riding along a breaking wave; poked, she wobbles and falls off
 *  (splash), then climbs back on. */
export class Surfer extends Critter {
  readonly height = 1.6
  private rider = new Group()
  private board: Group
  /** Fell off this frame (the world splashes). */
  fell = false
  constructor(bag: Bag) {
    super()
    this.board = solid(merge([P.rbox(0.5, 0.08, 2.1, 0.04, PAL.pink, {}), P.box(0.06, 0.09, 1.8, '#FFFFFF', {})]), bag, 2)
    this.root.add(this.board)
    this.rider.position.set(0, 0.05, 0)
    this.rider.rotation.y = Math.PI / 2
    this.root.add(this.rider)
    this.rider.add(
      solidMix(
        [P.capsule(0.07, 0.5, PAL.lavenderDark, { at: [0.18, 0.35, 0], rot: [0, 0, 0.2] }), P.capsule(0.07, 0.5, PAL.lavenderDark, { at: [-0.18, 0.35, 0], rot: [0, 0, -0.2] }), P.capsule(0.17, 0.4, PAL.lavender, { at: [0, 0.95, 0] }), P.sphere(0.17, PAL.peach, { at: [0, 1.42, 0] }), P.sphere(0.18, '#6E4B3B', { at: [0, 1.5, -0.04], scale: [1, 0.7, 1] }), P.capsule(0.05, 0.45, PAL.lavender, { at: [0.42, 1.1, 0], rot: [0, 0, 1.3] }), P.capsule(0.05, 0.45, PAL.lavender, { at: [-0.42, 1.1, 0], rot: [0, 0, -1.3] })],
        [...eyes(0.06, 1.45, 0.14, 0.022)],
        bag,
        2,
      ),
    )
  }
  update(dt: number, t: number) {
    this.fell = false
    const k = this.tick(dt, 3.2)
    // Riding: a little balance wobble. Poked: a big wobble (0-0.8 s), off into the water (0.8), back on (2.4-3.2).
    let wob = Math.sin(t * 2.3 + this.phase) * 0.08
    this.rider.visible = true
    this.rider.position.y = 0.05
    if (k >= 0) {
      const s = this.t
      if (s < 0.8) wob = Math.sin(s * 22) * 0.45 * (s / 0.8)
      else if (s < 2.4) {
        if (!this.wasOff) this.fell = true
        this.wasOff = true
        this.rider.position.y = -1.6
        this.rider.visible = false
      } else {
        this.wasOff = false
        this.rider.position.y = -1.6 + 1.65 * span(s, 2.4, 3.1)
        wob = 0
      }
    } else this.wasOff = false
    this.rider.rotation.x = wob
    this.board.rotation.z = wob * 0.4
  }
  private wasOff = false
}
