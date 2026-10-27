// Mali and Khanom, built from toon shapes in the house's look (greybox: the final look comes at the art gate). Chibi
// but big: a soft grey body on four legs, a belly that rounds out as they eat, a double-domed head that turns to look
// at her food, big pink-lined ears on their own pivots (they flap when happy), eyes that blink, and the trunk
// (trunk.ts), whose root rides under the face. Small tusks on Mali only; a tuft of hair on Khanom; Lamyai, in between
// in size, has pinker ears. They can walk (a heavy, swaying bob: Lamyai wandering over) and Khanom can get a chocolate
// moustache on the tip of his trunk. Faces +z, the family.
import { Group, Vector3 } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { CHANG_FEEL } from './feel'
import { floorAt, type ElephantSpot } from './layout'
import { drawTrunk, makeTrunk, stepTrunk, type Trunk } from './trunk'

// A warm elephant grey (lavender only in the toon shadows), and the pink freckles Asian elephants get on the face,
// the trunk's root and the ears' edges as they grow up (Mali has the most, Khanom hardly any yet).
const LOOK: Record<ElephantSpot['id'], { hide: string; dark: string; ear: string; freckles: number }> = {
  mali: { hide: '#B9B2BD', dark: '#A39BA9', ear: '#FFB8CC', freckles: 14 },
  khanom: { hide: '#C7C0CA', dark: '#B1A9B6', ear: '#FFAFC8', freckles: 4 },
  lamyai: { hide: '#C0B8C3', dark: '#AAA2B0', ear: '#FF9DC0', freckles: 9 },
}
const FRECKLE = '#F4BCCB'
const TIP = '#FFA3C2'
const SEGMENTS = 9
/** Where the trunk's root and the mouth are on the head (head space, before the elephant's scale). */
const TRUNK_ROOT = new Vector3(0, -0.3, 0.84)
const MOUTH = new Vector3(0, -0.7, 0.62)
const tmp = new Vector3()

export class Elephant {
  readonly root = new Group()
  readonly id: ElephantSpot['id']
  readonly trunk: Trunk
  private body = new Group()
  private belly = new Group()
  private head = new Group()
  private eyes = new Group()
  private ears: Group[]
  /** Where it stands now (Lamyai walks), which way it faces (radians, 0 = the family) and how hard it's walking. */
  x: number
  z: number
  heading = 0
  walking = 0
  private stache: Group
  /** Meals so far (the belly rounds out with them). */
  full = 0
  /** 0..1, decaying: how hard the ears flap (a bite, a tap). */
  flap = 0
  /** Seconds left of a munch (the head bobs), and of a trumpet (the head goes up). */
  munching = 0
  trumpeting = 0
  private blink = 2
  private bounce = 1
  private lean = 0
  private yaw = 0
  private pitch = 0
  private phase: number
  /** Where the ears are in their fan (advanced each frame, so a change of speed never jumps). */
  private earPhase = 0

  constructor(
    bag: Bag,
    readonly spot: ElephantSpot,
  ) {
    this.id = spot.id
    const c = LOOK[spot.id]
    this.phase = { mali: 0, khanom: 2.3, lamyai: 4.1 }[spot.id]
    this.x = spot.x
    this.z = spot.z
    this.root.position.set(spot.x, 0, spot.z)
    this.root.scale.setScalar(spot.s)
    this.root.add(this.body)
    // ---- The body: four stout legs with pale toenails, a round body, a little tail with a tuft ----
    this.body.add(
      solid(
        merge([
          P.sphere(1.35, c.hide, { at: [0, 2.0, 0], scale: [1, 0.9, 1.3] }, 18),
          ...[-1, 1].flatMap((x) => [-1, 1].map((z) => P.cyl(0.42, 0.46, 1.55, c.hide, { at: [x * 0.72, 0.78, z * 0.85] }, 12))),
          ...[-1, 1].flatMap((x) => [-1, 1].flatMap((z) => [-0.16, 0.16].map((dx) => P.sphere(0.1, '#F4EDE4', { at: [x * 0.72 + dx, 0.1, z * 0.85 + 0.4], scale: [1, 0.8, 0.6] }, 6)))),
          P.cyl(0.05, 0.04, 0.9, c.dark, { at: [0, 1.85, -1.75], rot: [-0.35, 0, 0] }, 5),
          P.sphere(0.12, c.dark, { at: [0, 1.42, -1.92], scale: [1, 1.4, 1] }, 6),
          ...(spot.id === 'khanom' ? [] : [P.sphere(0.5, c.dark, { at: [0, 3.0, -0.4], scale: [1.2, 0.4, 1.3] }, 10)]),
        ]),
        bag,
        2.5,
      ),
    )
    // The belly: inside the body at first, it pokes out as she feeds them.
    this.belly.position.set(0, 1.6, 0.15)
    this.belly.add(solid(P.sphere(1.05, c.hide, { scale: [1, 0.78, 1.15] }, 16), bag, 2.5))
    this.body.add(this.belly)
    // ---- The head: two domes on top, pink cheeks, a lower lip; tusks or a tuft ----
    this.head.position.set(0, 2.62, 1.55)
    this.body.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(1.0, c.hide, { scale: [1, 0.95, 0.9] }, 18),
          ...[-1, 1].map((s) => P.sphere(0.5, c.hide, { at: [s * 0.32, 0.52, 0.3] }, 12)),
          P.sphere(0.2, '#FF8FB0', { at: MOUTH.toArray(), scale: [1.2, 0.6, 0.9] }, 10),
          ...(spot.id === 'mali' ? [-1, 1].map((s) => P.cone(0.075, 0.42, '#FFF7F0', { at: [s * 0.36, -0.58, 0.76], rot: [1.9, 0, -s * 0.25] }, 8)) : []),
          ...(spot.id === 'khanom' ? [0, 1, 2].map((i) => P.sphere(0.12, c.dark, { at: [-0.12 + i * 0.12, 0.98, 0.28], scale: [0.8, 1.5, 0.8] }, 6)) : []),
        ],
        [
          ...[-1, 1].map((s) => P.sphere(0.17, '#FF9DB8', { at: [s * 0.62, -0.18, 0.66], scale: [1, 0.6, 0.4] }, 8)),
          // Freckles on the face: either side of the trunk's root and up between the eyes (on the head's surface).
          ...Array.from({ length: c.freckles }, (_, i) => {
            const up = i % 4 === 3
            const x = up ? Math.sin(i * 1.7) * 0.14 : (i % 2 ? 1 : -1) * (0.32 + ((i * 0.29) % 1) * 0.2)
            const y = up ? 0.34 + ((i * 0.41) % 1) * 0.12 : -0.5 + ((i * 0.37) % 1) * 0.36
            const z = 0.9 * Math.sqrt(Math.max(0, 1 - x * x - (y / 0.95) ** 2)) + 0.01
            return P.sphere(0.045 + (i % 3) * 0.015, FRECKLE, { at: [x, y, z], scale: [1, 1, 0.35] }, 6)
          }),
        ],
        bag,
        2.5,
      ),
    )
    // The eyes: their own group, so they can blink (squash) without the head.
    this.eyes.position.set(0, 0.14, 0)
    this.eyes.add(
      solid(
        merge([
          ...[-1, 1].map((s) => P.sphere(0.13, PAL.ink, { at: [s * 0.4, 0, 0.82], scale: [1, 1.3, 0.6] }, 10)),
          ...[-1, 1].map((s) => P.sphere(0.045, '#FFFFFF', { at: [s * 0.37, 0.06, 0.9] }, 6)),
        ]),
        bag,
        0,
      ),
    )
    this.head.add(this.eyes)
    // Big ears on their own pivots, pink inside, with a few freckles round the edge.
    this.ears = [-1, 1].map((s) => {
      const g = new Group()
      g.position.set(s * 0.82, 0.1, -0.1)
      g.add(
        solidMix(
          // An Asian elephant's ear: a little smaller, its top edge rolled, a lobe hanging lower at the front, and pale pink
          // freckles round its lower edge.
          [
            P.sphere(0.9, c.hide, { at: [s * 0.56, -0.05, 0], scale: [0.95, 1.08, 0.16] }, 14),
            P.sphere(0.45, c.hide, { at: [s * 0.4, -0.78, 0.03], scale: [0.95, 1.1, 0.16] }, 10),
            P.sphere(0.46, c.hide, { at: [s * 0.62, 0.7, 0.03], scale: [1.3, 0.26, 0.2] }, 10),
          ],
          [
            P.sphere(0.66, c.ear, { at: [s * 0.58, -0.12, 0.11], scale: [0.88, 1.0, 0.1] }, 12),
            P.sphere(0.3, c.ear, { at: [s * 0.42, -0.74, 0.1], scale: [0.9, 1.05, 0.1] }, 8),
            ...[0.3, 0.55, 0.95, 1.2, 1.55].map((a, i) => P.sphere(0.035 + (i % 3) * 0.018, FRECKLE, { at: [s * (0.56 + Math.sin(a) * (0.66 + (i % 2) * 0.07)), -0.08 - Math.cos(a) * (0.82 + (i % 2) * 0.06), 0.13] }, 5)),
          ],
          bag,
          2.5,
        ),
      )
      this.head.add(g)
      return g
    })
    // The trunk lives in the world (its chain is solved in meters), its root following the face.
    const r = spot.s
    this.trunk = makeTrunk(bag, this.trunkRoot(new Vector3()), spot.trunk, SEGMENTS, 0.31 * r + 0.04, 0.09 * r + 0.05, c.hide, c.dark, TIP)
    // A chocolate moustache on the tip (Khanom, after a sneaky sip).
    this.stache = solid(P.sphere((0.09 * r + 0.05) * 1.3, '#7A4A2E', { scale: [1.15, 0.8, 1.15] }, 10), bag, 0)
    this.stache.position.y = this.trunk.geo
    this.stache.visible = false
    this.trunk.parts[SEGMENTS - 1].add(this.stache)
  }

  /** The chocolate moustache on (or wiped off). */
  chocolate(on: boolean) {
    this.stache.visible = on
  }
  /** A happy hop of the body (a hiccup, a big trumpet). */
  hop() {
    this.bounce = 0
  }

  /** The trunk's root, under the face (world). */
  trunkRoot(out: Vector3) {
    this.root.updateMatrixWorld()
    return this.head.localToWorld(out.copy(TRUNK_ROOT))
  }
  /** The mouth (world). */
  mouth(out: Vector3) {
    return this.head.localToWorld(out.copy(MOUTH))
  }
  /** The head's middle (world), for its tap target and the camera. */
  headAt(out: Vector3) {
    return this.head.getWorldPosition(out)
  }
  /** Its whole trunk length now (the ?debug reach slider). */
  get reach() {
    return this.trunk.seg * SEGMENTS
  }
  setReach(k: number) {
    this.trunk.seg = (this.spot.trunk * k) / SEGMENTS
  }

  /** A bite: the ears flap, a happy bounce, a little rounder. */
  ate() {
    this.full++
    this.flap = 1
    this.bounce = 0
    this.munching = CHANG_FEEL.munch
  }
  /** Tapped: ears out, head up, a trumpet (the sound is the caller's). */
  trumpet() {
    this.flap = 1
    this.trumpeting = 0.9
  }

  /** One frame: the body and head (looking at `look`, leaning toward it), then the trunk toward `target`. */
  update(dt: number, t: number, target: Vector3, chase: number, look: Vector3 | null) {
    // Leans a little toward food she's holding, and turns its head to it.
    const wantLean = look && !this.walking ? clamp((look.x - this.x) * 0.22, -0.32, 0.32) : 0
    this.lean += (wantLean - this.lean) * (1 - Math.exp(-dt * 2.5))
    this.root.position.set(this.x + this.lean, 0, this.z)
    this.root.rotation.y = this.heading
    // Walking: a heavy bob from foot to foot.
    this.body.position.y = Math.abs(Math.sin(t * 5)) * 0.07 * this.walking
    this.body.rotation.z = Math.sin(t * 5) * 0.035 * this.walking
    let wantYaw = 0
    let wantPitch = Math.sin(t * 0.7 + this.phase) * 0.03
    if (look) {
      this.headAt(tmp)
      wantYaw = clamp((Math.atan2(look.x - tmp.x, look.z - tmp.z) - this.heading) * 0.6, -0.4, 0.4)
      wantPitch = clamp(-Math.atan2(look.y - tmp.y, Math.hypot(look.x - tmp.x, look.z - tmp.z)) * 0.5, -0.3, 0.25)
    }
    this.trumpeting = Math.max(0, this.trumpeting - dt)
    if (this.trumpeting > 0) wantPitch = -0.35
    this.yaw += (wantYaw - this.yaw) * (1 - Math.exp(-dt * 4))
    this.pitch += (wantPitch - this.pitch) * (1 - Math.exp(-dt * 4))
    this.munching = Math.max(0, this.munching - dt)
    const chew = this.munching > 0 ? Math.sin(t * 15) * 0.06 : 0
    this.head.rotation.set(this.pitch + chew, this.yaw, Math.sin(t * 0.9 + this.phase) * 0.03)
    // Breathing, and a squash-and-stretch bounce after each bite.
    this.bounce = Math.min(1, this.bounce + dt / 0.45)
    const b = this.bounce < 1 ? Math.sin(this.bounce * Math.PI) * (1 - this.bounce) : 0
    const breathe = Math.sin(t * 1.8 + this.phase) * 0.012
    this.body.scale.set(1 + breathe - b * 0.05, 1 - breathe + b * 0.1, 1 + breathe)
    const round = 0.82 + Math.min(this.full, 10) * 0.035
    this.belly.scale.setScalar(round)
    // The ears: a slow, lazy fan, a little faster and wider when happy (and easing back down after).
    this.flap = Math.max(0, this.flap - dt * 0.5)
    const happy = this.flap * this.flap * (3 - 2 * this.flap)
    this.earPhase += dt * (1.5 + happy * 3.5)
    const fan = Math.sin(this.earPhase + this.phase) * (0.12 + happy * 0.28)
    this.ears.forEach((g, i) => (g.rotation.y = (i ? -1 : 1) * (0.2 + fan)))
    // A blink now and then.
    this.blink -= dt
    if (this.blink < -0.13) this.blink = 1.8 + Math.random() * 3.5
    this.eyes.scale.y = this.blink < 0 ? 0.12 : 1
    // The trunk, from under the face.
    stepTrunk(this.trunk, this.trunkRoot(tmp), target, chase, dt, CHANG_FEEL.droop, floorAt)
    drawTrunk(this.trunk)
  }
}
