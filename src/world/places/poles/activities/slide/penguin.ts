// Penguin Slide's animals: Pebble's papa (an emperor penguin), Pebble (a grey fluffy chick) and the Adélies on the slope
// are the toys from the character lab on the chibi rig (engine3d/characters/animal.ts, their looks in
// characters/looks.ts); the leopard seal is still a greybox shape in the toon look. Flippers on their own pivots so they flap,
// paddle and flail. The world (slide.ts) sets the pose each frame; this file owns the little actions that play by
// themselves (a hop, a spin like a top) and the rig's face (blinks, and the beak with their voice once they have one).
import { Group, type Vector3 } from 'three'
import { bell, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { P, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { POLES_LOOKS } from '../../characters/looks'

export type Kind = 'emperor' | 'chick' | 'adelie'

const HOP_S = 0.5
const SPIN_S = 1.4
/** Lying on his belly, he pivots round this high, as a share of his height: his tummy touches the snow (the front of
 *  the rig penguin's tummy is 0.3 H out). */
const PIVOT = 0.3

export interface Pose {
  /** 0 standing up, 1 flat on his belly. */
  belly?: number
  /** The flippers paddle (0..1). */
  swim?: number
  /** The flippers fly up (0..1). */
  flail?: number
  /** The flippers stick out to the sides like wings (0..1). */
  wings?: number
  /** Feet in the air, wiggling (0..1): stuck head first in a snowbank. */
  wiggle?: number
  /** Rocks side to side as he walks (0..1). */
  waddle?: number
  /** + long, - squashed. */
  stretch?: number
}

export class Penguin {
  /** Where it stands. */
  readonly root = new Group()
  /** Spins like a top round the world's up, whichever way he's lying. */
  private spinner = new Group()
  /** Tips forward onto the belly (round PIVOT). */
  private tilt = new Group()
  /** Inside the tilt at its size: the actions move this (on the rig, the rig's root). */
  private inner: Group
  readonly flippers: Group[] = []
  /** The chibi rig (Papa, Pebble, an Adélie). */
  readonly rig: Rig
  private life: FaceLife
  /** How high the belly pivot is (m). */
  private pivot: number
  readonly height: number
  private hopT = -1
  private spinT = -1
  private phase = Math.random() * 6
  /** How round the tummy is (1 = normal). */
  full = 1

  /** `shadow`: the rig's own blob shadow (Papa's is drawn on whatever is under him by the world instead). */
  constructor(bag: Bag, readonly kind: Kind, readonly size = 1, shadow = true) {
    this.root.add(this.spinner)
    this.spinner.add(this.tilt)
    const chick = kind === 'chick'
    this.height = (chick ? 0.82 : 1.15) * size
    // The same height as the greybox was (the slide, the camera and the tap targets were tuned to it).
    const who = chick ? 'pebble' : kind === 'adelie' ? 'adelie' : 'papa'
    const rig = buildAnimal({ ...POLES_LOOKS[who], height: this.height }, bag)
    this.rig = rig
    this.inner = rig.root
    this.pivot = PIVOT * this.height
    this.flippers.push(rig.armR, rig.armL)
    // The shadow stays on the snow when he tips onto his belly.
    const blob = rig.root.children[0]
    blob.visible = shadow
    this.root.add(blob)
    this.life = new FaceLife(rig, who)
    this.tilt.add(this.inner)
    this.tilt.position.y = this.pivot
    this.inner.position.y = -this.pivot
  }

  hop() {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.7) this.hopT = 0
  }
  /** Spin like a top (bumped). */
  spin() {
    this.spinT = 0
  }
  get busy() {
    return this.hopT >= 0 || this.spinT >= 0
  }
  get spinning() {
    return this.spinT >= 0
  }

  /** Where a finger finds it, in the world. */
  center(out: Vector3) {
    return this.root.localToWorld(out.set(0, this.height * 0.5, 0))
  }

  /** The tip of the beak, in the world (krill go in here, and come out for Pebble). */
  beak(out: Vector3) {
    return this.rig.head.localToWorld(out.set(...this.rig.face.mouth))
  }

  update(dt: number, t: number, pose: Pose = {}) {
    const inner = this.inner
    this.life.update(dt)
    let lift = 0
    let sq = 0
    if (this.hopT >= 0) {
      this.hopT += dt
      const p = this.hopT / HOP_S
      if (p >= 1) this.hopT = -1
      else {
        const air = span(p, 0.2, 0.8)
        lift = bell(air) * 0.3
        sq = p < 0.2 ? bell(p / 0.4) * 0.2 : p > 0.8 ? bell((p - 0.8) / 0.4) * 0.16 : -0.08 * bell(air)
      }
    }
    let spin = 0
    if (this.spinT >= 0) {
      this.spinT += dt
      const p = this.spinT / SPIN_S
      if (p >= 1) this.spinT = -1
      // Fast at first, slowing to a wobbly stop: three turns.
      else spin = Math.PI * 6 * (1 - (1 - p) ** 2.5)
    }
    const belly = pose.belly ?? 0
    const stretch = pose.stretch ?? 0
    const breathe = 0.025 * Math.sin(t * 2.6 + this.phase)
    const squash = sq - stretch
    inner.position.y = -this.pivot + lift * this.size
    inner.scale.set(1 + squash * 0.5, 1 - squash + breathe * (1 - belly), 1 + squash * 0.5)
    // Onto his belly: head forward, tummy on the snow (wiggling: head down in the snow, feet up).
    const wiggle = pose.wiggle ?? 0
    this.tilt.rotation.x = belly * Math.PI * 0.5 + wiggle * Math.PI * 0.42
    this.spinner.rotation.y = spin
    this.tilt.rotation.z = (pose.waddle ?? 0) * 0.16 * Math.sin(t * 11) + (this.spinT >= 0 ? 0.25 * Math.sin(this.spinT * 18) * (1 - this.spinT / SPIN_S) : 0)
    // A full tummy makes the whole round body rounder; stuck in a snowbank, his bottom (and feet) wag in the air.
    const g = this.full
    const rig = this.rig
    const round = 1 + (g - 1) * 0.5
    rig.body.scale.set(round, 1 + (g - 1) * 0.2, round)
    rig.body.rotation.set(0, wiggle * 0.3 * Math.sin(t * 22), wiggle * 0.2 * Math.sin(t * 17))
    // The head follows through: up as he lies down (looking where he's going), up again when he flails, and it bobs
    // with a waddle.
    rig.head.rotation.set(-0.9 * belly * (1 - wiggle) - 0.3 * (pose.flail ?? 0), 0, (pose.waddle ?? 0) * 0.25 * Math.sin(t * 11 + 0.6))

    const swim = pose.swim ?? 0
    const flail = pose.flail ?? 0
    const wings = pose.wings ?? 0
    this.flippers.forEach((f, i) => {
      const s = i ? -1 : 1
      // Hanging down, paddling (up and down beside him on his belly), flying up, or out like wings.
      f.rotation.x = swim * 0.4 * Math.sin(t * 8 + i * 0.4)
      f.rotation.z = s * (0.12 + wings * 1.25 + swim * (0.9 + 0.6 * Math.sin(t * 8)) + flail * (2.2 + 0.4 * Math.sin(t * 19 + i)) + wiggle * 0.8 * Math.sin(t * 15 + i * 2))
    })
  }
}

/** The leopard seal: a long grey body with spots and a big friendly grin. It only wants to play. */
export class Seal {
  readonly root = new Group()
  private body = new Group()
  private spinT = -1
  readonly length = 2.6

  constructor(bag: Bag) {
    const SEAL = '#9AA3B5'
    this.body.add(
      solidMix(
        [
          P.capsule(0.42, 1.6, SEAL, { at: [0, 0, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.85] }),
          P.sphere(0.4, SEAL, { at: [0, 0.08, 1.15], scale: [1, 0.85, 1.15] }),
          P.cone(0.32, 0.55, SEAL, { at: [0, 0, -1.4], rot: [-Math.PI / 2, 0, 0], scale: [1.4, 1, 0.35] }),
          P.capsule(0.11, 0.42, SEAL, { at: [0.48, -0.15, 0.55], rot: [0, 0, 1.2] }),
          P.capsule(0.11, 0.42, SEAL, { at: [-0.48, -0.15, 0.55], rot: [0, 0, -1.2] }),
        ],
        [
          ...[
            [0.3, 0.25, 0.2],
            [-0.25, 0.3, -0.3],
            [0.2, 0.3, -0.8],
            [-0.3, 0.15, 0.4],
            [0, 0.38, -0.2],
          ].map(([x, y, z]) => P.sphere(0.07, '#5D6577', { at: [x, y, z], scale: [1, 0.5, 1] })),
          P.sphere(0.045, PAL.ink, { at: [0.15, 0.25, 1.48] }),
          P.sphere(0.045, PAL.ink, { at: [-0.15, 0.25, 1.48] }),
          P.torus(0.13, 0.02, PAL.ink, { at: [0, 0.0, 1.5], rot: [0, 0, Math.PI] }, Math.PI),
          P.sphere(0.05, PAL.pink, { at: [0.25, 0.08, 1.42], scale: [1, 0.6, 0.4] }),
          P.sphere(0.05, PAL.pink, { at: [-0.25, 0.08, 1.42], scale: [1, 0.6, 0.4] }),
        ],
        bag,
        2.5,
      ),
    )
    this.root.add(this.body)
  }

  /** A playful barrel roll. */
  spin() {
    if (this.spinT < 0) this.spinT = 0
  }

  update(dt: number, t: number) {
    if (this.spinT >= 0 && (this.spinT += dt) > 1.1) this.spinT = -1
    this.body.rotation.z = this.spinT >= 0 ? Math.PI * 2 * (1 - (1 - this.spinT / 1.1) ** 2) : 0.15 * Math.sin(t * 1.7)
    this.body.rotation.x = 0.1 * Math.sin(t * 2.3)
  }
}
