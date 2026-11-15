// Who Papa meets on his search (slide.ts places them): the seals on the ice (a Weddell seal that sings, an elephant
// seal that burps), a skua and its fluffy chick, a far-off humpback, and the six things that might be Pebble and turn
// out to be something funny when he slides up to them (`Lookalike`). Toon shapes with ink outlines (engine3d/geo.ts);
// each owns its little actions, the world plays the sounds.
import { Group, InstancedMesh, Matrix4, Quaternion, SphereGeometry, Vector3 } from 'three'
import { bell, clamp } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL, toon } from '../../../../engine3d/toon'
import type { LookKind } from './course'
import { Penguin } from './penguin'

const GREY = '#A9AEBB'
const FLUFF = '#BDB9B6'

/** Two ink eyes and a little smile on a face that looks down +z, `r` across. */
function face(r: number, y: number, z: number) {
  return [
    P.sphere(r * 0.13, PAL.ink, { at: [r * 0.38, y, z] }, 8),
    P.sphere(r * 0.13, PAL.ink, { at: [-r * 0.38, y, z] }, 8),
  ]
}

// ---------------------------------------------------------------- seals on the ice

/** A seal lying on the ice, head toward +z: the Weddell seal (grey, speckled, a cat's smile) or the elephant seal
 *  (huge, brown, a floppy nose). `act()` rears its head up and wobbles (a song, a burp); asleep, its head is tucked
 *  down and its eyes are shut, so it's just a grey lump. */
export class IceSeal {
  readonly root = new Group()
  private body: Group
  private front = new Group()
  private eyes: Group
  private eyeY: number
  private actT = -1
  private phase = Math.random() * 6
  asleep = false
  readonly height: number

  constructor(bag: Bag, readonly kind: 'weddell' | 'elephant', size = 1) {
    const big = kind === 'elephant'
    const c = big ? '#A99783' : GREY
    const pale = big ? '#C9BAA6' : '#D5D9E2'
    const R = 0.44 * size
    this.height = R * 1.7
    this.body = solidMix(
      [
        P.sphere(R, c, { at: [0, R * 0.8, -R * 0.5], scale: [1.2, 0.85, 2.2] }),
        P.sphere(R * 0.8, pale, { at: [0, R * 0.55, -R * 0.3], scale: [1.15, 0.6, 2.0] }),
        // The tail flippers, and one each side.
        P.cone(R * 0.5, R * 0.9, c, { at: [0, R * 0.4, -R * 2.9], rot: [-Math.PI / 2, 0, 0], scale: [1.7, 1, 0.4] }, 8),
        P.sphere(R * 0.36, c, { at: [R * 1.15, R * 0.2, R * 0.4], scale: [1.5, 0.3, 0.8], rot: [0, -0.5, 0] }, 10),
        P.sphere(R * 0.36, c, { at: [-R * 1.15, R * 0.2, R * 0.4], scale: [1.5, 0.3, 0.8], rot: [0, 0.5, 0] }, 10),
      ],
      big ? [] : [[0.5, 1.45, -0.6], [-0.4, 1.5, -1.1], [0.2, 1.52, -0.2], [-0.7, 1.3, -0.3], [0.6, 1.3, -1.5], [0, 1.48, -1.6]].map(([x, y, z]) => P.sphere(R * 0.12, '#7C8394', { at: [x * R, y * R, z * R], scale: [1, 0.4, 1] }, 8)),
      bag,
      2.5,
    )
    // The head and chest, on a pivot at the shoulders.
    const hr = R * 0.72
    this.front.position.set(0, R * 0.75, R * 0.9)
    this.front.add(
      solid(
        merge([
          P.sphere(hr, c, { at: [0, hr * 0.2, hr * 0.7], scale: [1, 0.95, 1.1] }),
          P.sphere(hr * 0.55, pale, { at: [0, -hr * 0.05, hr * 1.5], scale: [1.2, 0.8, 0.8] }, 12),
          big ? P.sphere(hr * 0.42, '#8C7A68', { at: [0, -hr * 0.25, hr * 1.9], scale: [0.9, 1.3, 0.9] }, 12) : P.sphere(hr * 0.15, PAL.ink, { at: [0, hr * 0.1, hr * 1.95], scale: [1.3, 0.8, 0.6] }, 8),
        ]),
        bag,
        2.5,
      ),
    )
    this.eyeY = hr * 0.45
    this.eyes = solid(merge(face(hr, this.eyeY, hr * 1.5)), bag, 0)
    this.front.add(this.eyes)
    this.root.add(this.body, this.front)
  }

  act() {
    if (this.actT < 0) this.actT = 0
  }
  get busy() {
    return this.actT >= 0
  }

  update(dt: number, t: number) {
    let up = 0
    if (this.actT >= 0) {
      this.actT += dt
      if (this.actT > 1.5) this.actT = -1
      else up = bell(clamp(this.actT / 1.5))
    }
    const sleep = this.asleep ? 1 : 0
    const breathe = Math.sin(t * (this.asleep ? 1.4 : 2.2) + this.phase)
    this.body.scale.set(1 + up * 0.06, 1 + breathe * 0.03 - up * 0.05, 1)
    this.front.rotation.x = sleep * 0.55 - up * 0.9 + (1 - sleep) * 0.05 * breathe
    this.front.rotation.z = up * 0.18 * Math.sin(t * 16)
    this.front.rotation.y = (1 - sleep) * (1 - up) * 0.25 * Math.sin(t * 0.6 + this.phase)
    // (Shut eyes: squashed flat about their own height.)
    this.eyes.scale.y = this.asleep ? 0.15 : 1
    this.eyes.position.y = this.asleep ? this.eyeY * 0.85 : 0
  }
}

// ---------------------------------------------------------------- the skua and its chick

/** A skua (a big brown seabird) standing on the ice, or its chick: a ball of grey fluff with its head tucked in
 *  (`tucked` 1) until Papa comes to look. `flap()` hops it into the air, wings beating. Faces +z. */
export class Skua {
  readonly root = new Group()
  private bird = new Group()
  private head = new Group()
  private wings: Group[] = []
  private flapT = -1
  private phase = Math.random() * 6
  tucked = 0
  readonly height: number

  constructor(bag: Bag, readonly chick = false) {
    const c = chick ? FLUFF : '#7C604C'
    const dark = chick ? '#A39E9A' : '#5E4636'
    const r = chick ? 0.3 : 0.24
    this.height = chick ? 0.62 : 0.72
    const by = chick ? r * 0.92 : 0.36
    const parts = [P.sphere(r, c, { at: [0, by, 0], scale: chick ? [1, 0.95, 1] : [1, 0.9, 1.5] })]
    if (chick) {
      // Fluff: little tufts all over.
      for (let i = 0; i < 7; i++) {
        const a = i * 2.4
        parts.push(P.sphere(r * 0.3, i % 2 ? c : '#CFCBC8', { at: [Math.cos(a) * r * 0.8, by + ((i % 3) - 1) * r * 0.5, Math.sin(a) * r * 0.8] }, 8))
      }
      parts.push(P.sphere(r * 0.26, '#CFCBC8', { at: [0, by + r * 0.92, 0] }, 8))
    } else {
      parts.push(
        P.cone(0.12, 0.34, dark, { at: [0, by + 0.02, -0.42], rot: [-Math.PI / 2, 0, 0], scale: [1.5, 1, 0.3] }, 8),
        P.cyl(0.02, 0.02, 0.2, '#4A4F60', { at: [0.08, 0.1, 0] }, 6),
        P.cyl(0.02, 0.02, 0.2, '#4A4F60', { at: [-0.08, 0.1, 0] }, 6),
      )
    }
    this.bird.add(solid(merge(parts), bag, 2))
    const hr = chick ? 0.17 : 0.15
    this.head.position.set(0, chick ? by + r * 0.7 : by + 0.22, chick ? r * 0.55 : 0.26)
    this.head.add(
      solid(merge([P.sphere(hr, c, { at: [0, hr * 0.4, 0] }, 14), P.cone(hr * 0.36, hr * 1.1, chick ? '#6A6F80' : '#3F3A3A', { at: [0, hr * 0.3, hr * 1.15], rot: [Math.PI / 2, 0, 0] }, 8)]), bag, 2),
      solid(merge(face(hr, hr * 0.6, hr * 0.82)), bag, 0),
    )
    for (const side of [1, -1]) {
      const w = new Group()
      w.position.set(side * r * 0.8, by + r * 0.3, 0)
      const len = chick ? 0.2 : 0.46
      w.add(solid(merge([P.sphere(len, dark, { at: [side * len * 0.8, 0, -0.03], scale: [1, 0.14, chick ? 0.7 : 0.6] }, 10), ...(chick ? [] : [P.sphere(len * 0.3, '#FFFFFF', { at: [side * len * 1.2, 0.02, 0], scale: [1, 0.16, 0.6] }, 8)])]), bag, 2))
      this.wings.push(w)
      this.bird.add(w)
    }
    this.bird.add(this.head)
    this.root.add(this.bird)
  }

  flap() {
    if (this.flapT < 0) this.flapT = 0
  }

  update(dt: number, t: number) {
    let up = 0
    if (this.flapT >= 0) {
      this.flapT += dt
      if (this.flapT > 1.3) this.flapT = -1
      else up = bell(clamp(this.flapT / 1.3))
    }
    const out = 1 - this.tucked
    this.bird.position.y = up * (this.chick ? 0.35 : 1.2)
    this.bird.scale.y = 1 + 0.03 * Math.sin(t * 2.4 + this.phase)
    this.head.scale.setScalar(Math.max(0.001, out))
    this.head.rotation.y = out * 0.5 * Math.sin(t * 0.9 + this.phase)
    this.head.rotation.x = -up * 0.4
    this.wings.forEach((w, i) => {
      const s = i ? -1 : 1
      // Folded down along the body; beating when it flaps.
      w.rotation.z = s * (this.flapT >= 0 ? 0.9 * Math.sin(this.flapT * 24) : -1.25 * (this.chick ? 0.9 : 1))
      w.scale.setScalar(this.chick ? Math.max(0.3, out) : 1)
    })
  }
}

// ---------------------------------------------------------------- the humpback

/** A humpback whale, far off under the sea (about `size` × 9 m long, swimming toward +z): long white flippers, a
 *  pale grooved chin, a slow tail. `sing()` rolls it a little and waves a flipper. */
export class Humpback {
  readonly root = new Group()
  private body: Group
  private fluke = new Group()
  private flippers: Group[] = []
  private singT = -1

  constructor(bag: Bag, size = 1) {
    const c = '#4F6A92'
    const pale = '#DCE8F5'
    const R = 1.25 * size
    this.body = solid(
      merge([
        P.sphere(R, c, { scale: [1, 0.95, 3.3] }),
        P.sphere(R * 0.9, pale, { at: [0, -R * 0.28, R * 0.9], scale: [0.95, 0.75, 2.2] }),
        P.cone(R * 0.5, R * 2.4, c, { at: [0, 0, -R * 3.6], rot: [-Math.PI / 2, 0, 0], scale: [1, 1, 0.8] }, 10),
        P.sphere(R * 0.22, c, { at: [0, R * 0.95, -R * 1.2], scale: [0.5, 1, 1.4] }, 8),
        P.sphere(R * 0.07, PAL.ink, { at: [R * 0.8, R * 0.05, R * 2.1] }, 8),
        P.sphere(R * 0.07, PAL.ink, { at: [-R * 0.8, R * 0.05, R * 2.1] }, 8),
      ]),
      bag,
      3,
    )
    this.fluke.position.set(0, 0, -R * 4.6)
    this.fluke.add(solid(merge([1, -1].map((s) => P.sphere(R * 0.8, c, { at: [s * R * 0.7, 0, -R * 0.2], scale: [1, 0.12, 0.55], rot: [0, s * 0.5, 0] }, 10))), bag, 3))
    for (const s of [1, -1]) {
      const f = new Group()
      f.position.set(s * R * 0.85, -R * 0.3, R * 1.2)
      f.add(solid(P.sphere(R * 1.1, pale, { at: [s * R * 1.0, 0, -R * 0.2], scale: [1, 0.1, 0.3], rot: [0, s * 0.4, 0] }, 10), bag, 3))
      this.flippers.push(f)
      this.root.add(f)
    }
    this.root.add(this.body, this.fluke)
  }

  sing() {
    if (this.singT < 0) this.singT = 0
  }

  update(dt: number, t: number) {
    let k = 0
    if (this.singT >= 0) {
      this.singT += dt
      if (this.singT > 2.2) this.singT = -1
      else k = bell(clamp(this.singT / 2.2))
    }
    this.fluke.rotation.x = 0.35 * Math.sin(t * 1.3)
    this.root.rotation.z = k * 0.6 + 0.05 * Math.sin(t * 0.7)
    this.root.rotation.x = 0.06 * Math.sin(t * 1.3 + 1)
    this.flippers.forEach((f, i) => (f.rotation.z = (i ? -1 : 1) * (-0.35 + 0.2 * Math.sin(t * 0.9 + i) + (i ? 0 : k * 1.1 * Math.sin(t * 6)))))
  }
}

// ---------------------------------------------------------------- the things that might be Pebble

/** A woolly grey hat with a pom-pom (it sits on a snow mound, then on Papa's head). 1 m across: scale it. */
export function hatGeo() {
  return merge([
    P.sphere(0.5, FLUFF, { at: [0, 0.05, 0], scale: [1, 0.85, 1] }, 16),
    P.torus(0.48, 0.11, '#D8D5D2', { at: [0, 0.02, 0], rot: [Math.PI / 2, 0, 0] }),
    P.sphere(0.17, '#E9E7E5', { at: [0, 0.52, 0] }, 10),
  ])
}

const FISH = 34
const mtx = new Matrix4()
const quat = new Quaternion()
const scl = new Vector3()
const at = new Vector3()
const fwd = new Vector3(0, 0, 1)

/** Something small, grey and round on Papa's way. Is it Pebble? He slides up to it (`reveal`) and it turns out to be:
 *    snowy  a heap of snow with a grey tuft: an Adélie penguin who shakes the snow off
 *    seal   a smooth grey rock: a Weddell seal, fast asleep, who lifts her head and sings
 *    skua   a fluffy grey lump: a skua chick, who pops its head out and peeps
 *    hat    grey fluff on a snow mound: the scientist's woolly hat (it flips onto his head: the world does that)
 *    buoy   a round grey ball on a rope under the sea: the station's buoy, which swings and rings
 *    fish   a grey ball in the water: a hundred little silverfish, who dart apart
 *  Poked before that it only wobbles; after, `act()` does its trick again. */
export class Lookalike {
  readonly root = new Group()
  found = false
  /** Seconds since he found it (-1: not yet). */
  foundT = -1
  private wobT = -1
  private actT = -1
  readonly height: number
  private pen?: Penguin
  private cap?: Group
  private seal?: IceSeal
  private chick?: Skua
  /** The hat on its mound (hidden once it's on his head). */
  hat?: Group
  private swing?: Group
  private fish?: InstancedMesh
  private fishAt: Vector3[] = []
  private inner = new Group()

  constructor(bag: Bag, readonly kind: LookKind) {
    this.root.add(this.inner)
    this.height = 0.9
    if (kind === 'snowy') {
      this.pen = new Penguin(bag, 'adelie', 0.8)
      this.pen.root.visible = false
      // The heap of snow over him, a grey tuft at the top (his head, really).
      this.cap = solid(
        merge([
          P.sphere(0.5, '#FFFFFF', { at: [0, 0.36, 0], scale: [1.05, 0.95, 1.05] }, 14),
          P.sphere(0.3, '#FFFFFF', { at: [0.3, 0.16, 0.2] }, 10),
          P.sphere(0.28, '#FFFFFF', { at: [-0.32, 0.14, -0.1] }, 10),
          P.sphere(0.2, FLUFF, { at: [0, 0.78, 0.02], scale: [1, 0.8, 1] }, 10),
        ]),
        bag,
        2.5,
      )
      this.inner.add(this.pen.root, this.cap)
    } else if (kind === 'seal') {
      this.seal = new IceSeal(bag, 'weddell', 1)
      this.seal.asleep = true
      this.inner.add(this.seal.root)
    } else if (kind === 'skua') {
      this.chick = new Skua(bag, true)
      this.chick.tucked = 1
      this.inner.add(this.chick.root)
    } else if (kind === 'hat') {
      this.inner.add(solid(P.sphere(0.6, '#FFFFFF', { at: [0, 0.1, 0], scale: [1.2, 0.6, 1.2] }, 14), bag, 2.5))
      this.hat = solid(hatGeo(), bag, 2.5)
      this.hat.scale.setScalar(0.7)
      this.hat.position.y = 0.5
      this.inner.add(this.hat)
    } else if (kind === 'buoy') {
      // Hanging from the top of the sea on its rope (the root is the ball; the rope goes up from it).
      this.swing = new Group()
      this.swing.position.y = 2.4
      this.swing.add(
        solid(
          merge([
            P.cyl(0.03, 0.03, 2.4, '#8A8FA6', { at: [0, -1.0, 0] }, 6),
            P.sphere(0.5, GREY, { at: [0, -2.4, 0] }, 16),
            P.torus(0.5, 0.06, PAL.gold, { at: [0, -2.4, 0], rot: [Math.PI / 2, 0, 0] }),
            P.cyl(0.12, 0.12, 0.2, '#F0564E', { at: [0, -1.85, 0] }, 10),
          ]),
          bag,
          2.5,
        ),
      )
      this.inner.add(this.swing)
    } else {
      const geo = bag.add(new SphereGeometry(0.09, 6, 4).scale(0.6, 1, 2.2))
      this.fish = bag.add(new InstancedMesh(geo, toon('#B4BCCB'), FISH))
      this.fish.frustumCulled = false
      for (let i = 0; i < FISH; i++) {
        // Evenly over a ball (a sunflower spiral), so it reads as one round grey thing.
        const y = 1 - (2 * (i + 0.5)) / FISH
        const r = Math.sqrt(1 - y * y)
        const a = i * 2.4
        this.fishAt.push(new Vector3(Math.cos(a) * r, y, Math.sin(a) * r))
      }
      this.inner.add(this.fish)
    }
  }

  /** Poked before he has looked: a wobble. */
  wobble() {
    this.wobT = 0
  }

  /** It isn't Pebble! `quiet`: already looked at (a link that starts further on). */
  reveal(quiet = false) {
    if (this.found) return
    this.found = true
    this.foundT = quiet ? 9 : 0
    if (this.seal) this.seal.asleep = false
    if (this.pen) this.pen.root.visible = true
    if (this.hat) this.hat.visible = false
    if (!quiet) this.act()
  }

  /** Its trick (when found, and whenever she pokes it after). */
  act() {
    this.actT = 0
    this.pen?.hop()
    this.seal?.act()
    this.chick?.flap()
  }

  update(dt: number, t: number) {
    if (this.foundT >= 0) this.foundT += dt
    if (this.actT >= 0 && (this.actT += dt) > 2.4) this.actT = -1
    let wob = 0
    if (this.wobT >= 0) {
      this.wobT += dt
      if (this.wobT > 0.6) this.wobT = -1
      else wob = Math.sin(this.wobT * 26) * (1 - this.wobT / 0.6)
    }
    const out = this.found ? clamp(this.foundT / 0.35) : 0
    this.inner.rotation.z = wob * 0.14
    // Not found yet: it breathes a little (is it alive?).
    this.inner.scale.y = this.found || this.kind === 'buoy' || this.kind === 'fish' ? 1 : 1 + 0.03 * Math.sin(t * 2.2)
    if (this.cap) {
      this.cap.scale.setScalar(Math.max(0.001, 1 - out))
      this.cap.visible = out < 1
    }
    this.pen?.update(dt, t)
    this.seal?.update(dt, t)
    if (this.chick) {
      this.chick.tucked = 1 - out
      this.chick.update(dt, t)
    }
    if (this.swing) {
      const k = this.actT >= 0 ? Math.exp(-this.actT * 1.4) : 0
      this.swing.rotation.z = 0.05 * Math.sin(t * 0.9) + wob * 0.1 + k * 0.7 * Math.sin(this.actT * 5)
      this.swing.rotation.x = k * 0.3 * Math.sin(this.actT * 4 + 1)
    }
    if (this.fish) {
      // A tight ball, turning; found (or poked again): they dart apart, then drift back into a loose school.
      const burst = this.actT >= 0 ? bell(clamp(this.actT / 2.4)) : 0
      const r = (this.found ? 1.3 : 0.55) + burst * 2.6
      this.fishAt.forEach((p, i) => {
        const a = t * (this.found ? 0.7 : 1.6) + i * 0.02
        const c = Math.cos(a)
        const s = Math.sin(a)
        at.set((p.x * c - p.z * s) * r, p.y * r * 0.8 + 0.05 * Math.sin(t * 5 + i), (p.x * s + p.z * c) * r)
        // Nose along the way it's circling.
        quat.setFromUnitVectors(fwd, scl.set(-(p.x * s + p.z * c), 0, p.x * c - p.z * s).normalize())
        mtx.compose(at, quat, scl.set(1, 1, 1))
        this.fish!.setMatrixAt(i, mtx)
      })
      this.fish.instanceMatrix.needsUpdate = true
    }
  }
}
