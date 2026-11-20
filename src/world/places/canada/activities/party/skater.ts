// The canal's little winter toys. Each moving part is a merged mesh, with ink on the silhouette
// and smaller details painted into the same mesh.
import { Group, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, one, P, solidMix } from '../../../../engine3d/geo'

const OUTFITS = [
  { coat: '#EC6B9B', hat: '#8C59AA', scarf: '#FFD476', skin: '#F2B990', hair: '#5F3660' },
  { coat: '#53B79A', hat: '#E47C53', scarf: '#FFF0B6', skin: '#AC694A', hair: '#422D40' },
  { coat: '#60A5DE', hat: '#38658F', scarf: '#FFAD96', skin: '#F8CCAB', hair: '#B26347' },
  { coat: '#F1B74F', hat: '#DA5B87', scarf: '#FCEAF5', skin: '#C98B61', hair: '#563638' },
  { coat: '#A68CDA', hat: '#488274', scarf: '#B8E9CA', skin: '#8D523F', hair: '#38283A' },
  { coat: '#F29468', hat: '#447CA9', scarf: '#C2DCFF', skin: '#E7AC80', hair: '#694447' },
]
const WHITE = '#FFF8F3'
const INK = '#392C47'
const PANTS = '#454264'
const HALF_TURN = Math.PI
const TURN = HALF_TURN * 2
const SIDES = [-1, 1] as const
const UP = new Vector3(0, 1, 0)
const LEG_SPAN = 0.42

export class CanalSkater {
  readonly root = new Group()
  spinT = -1

  private readonly pivot = new Group()
  private readonly torso = new Group()
  private readonly head = new Group()
  private readonly scarf = new Group()
  private readonly arms: Group[]
  private readonly legs: { pants: Group; skate: Group }[]
  private readonly legAxis = new Vector3()
  private readonly lane: number
  private readonly phase: number
  private readonly pace: number

  constructor(index: number, bag: Bag) {
    const outfit = OUTFITS[index]
    const { coat, hat, scarf, skin, hair } = outfit
    const lane = index % 3
    this.lane = (lane - 1) * 3.6
    // Two skaters share each loop, starting on opposite sides with a little space between lanes.
    this.phase = lane * 0.78 + (index < 3 ? -0.56 : HALF_TURN - 0.56)
    this.pace = 0.29 + lane * 0.022

    this.torso.position.y = 0.68
    this.torso.add(solidMix([
      P.sphere(0.4, coat, { at: [0, 0.32, 0], scale: [0.83, 1, 0.64] }, 16),
      P.torus(0.22, 0.064, scarf, { at: [0, 0.68, 0], rot: [HALF_TURN / 2, 0, 0] }, 12),
    ], [
      P.capsule(0.017, 0.32, hat, { at: [0, 0.32, 0.253] }),
      ...SIDES.map((side) => P.rbox(0.15, 0.035, 0.025, 0.01, hat, {
        at: [side * 0.19, 0.22, 0.198], rot: [0, side * 0.42, side * 0.45],
      })),
      P.sphere(0.035, WHITE, { at: [0, 0.49, 0.236] }, 8),
    ], bag, 1.2))

    this.scarf.position.set(-0.17, 0.66, 0.05)
    this.scarf.add(solidMix([
      P.rbox(0.18, 0.43, 0.065, 0.025, scarf, { at: [0, -0.15, 0], rot: [0, 0, -0.2] }),
    ], [
      P.rbox(0.16, 0.048, 0.069, 0.012, hat, { at: [-0.052, -0.318, 0], rot: [0, 0, -0.2] }),
    ], bag, 1.1))
    this.torso.add(this.scarf)

    this.head.position.set(0, 0.96, 0.045)
    this.head.add(solidMix([
      P.sphere(0.336, skin, { scale: [1, 0.91, 0.86] }, 18),
      ...SIDES.map((side) => P.sphere(0.083, skin, { at: [side * 0.303, -0.019, 0.01], scale: [0.8, 1, 0.85] }, 10)),
      P.sphere(0.319, hair, { at: [0, 0.083, -0.062], scale: [1.04, 0.89, 0.83] }, 16),
      P.sphere(0.353, hat, { at: [0, 0.183, -0.035], scale: [0.98, index % 2 ? 0.72 : 0.64, 0.9] }, 18),
      P.torus(0.303, 0.046, hat, { at: [0, 0.126, -0.025], rot: [HALF_TURN / 2, 0, 0], scale: [1, 0.93, 1] }),
      P.sphere(index % 2 ? 0.092 : 0.112, scarf, { at: [0, index % 2 ? 0.42 : 0.39, -0.06] }, 12),
    ], [
      ...SIDES.flatMap((side) => [
        P.sphere(0.049, INK, { at: [side * 0.114, 0.015, 0.264], scale: [0.83, 1.12, 0.49] }, 12),
        P.sphere(0.014, WHITE, { at: [side * 0.114 - 0.012, 0.034, 0.286] }, 8),
        P.sphere(0.052, '#ED8994', { at: [side * 0.177, -0.071, 0.236], scale: [1.2, 0.56, 0.34], rot: [0, side * 0.45, 0] }, 10),
      ]),
      P.sphere(0.046, skin, { at: [0, -0.043, 0.285], scale: [1, 0.8, 0.85] }, 10),
      P.sphere(0.064, '#763B4E', { at: [0, -0.113, 0.268], scale: [1, 0.54, 0.34] }, 12),
    ], bag, 1.15))
    this.torso.add(this.head)

    this.arms = SIDES.map((side) => {
      const arm = solidMix([
        P.capsule(0.105, 0.24, coat, { at: [0, -0.15, 0] }),
        P.sphere(0.107, scarf, { at: [0, -0.375, 0.027], scale: [0.89, 1.18, 0.87] }, 12),
        P.sphere(0.056, scarf, { at: [-side * 0.078, -0.348, 0.062] }, 8),
      ], [
        P.cyl(0.091, 0.096, 0.062, hat, { at: [0, -0.294, 0] }, 12),
      ], bag, 1.1)
      arm.position.set(side * 0.258, 0.5, 0)
      this.torso.add(arm)
      return arm
    })

    this.legs = SIDES.map(() => {
      const pants = one(P.capsule(0.112, LEG_SPAN, PANTS, { at: [0, -LEG_SPAN / 2, 0] }), bag, 1.05)
      const skate = solidMix([
        P.rbox(0.234, 0.235, 0.365, 0.074, INK, { at: [0, 0.195, 0.063] }),
      ], [
        P.rbox(0.219, 0.052, 0.35, 0.024, '#8C839D', { at: [0, 0.104, 0.063] }),
        P.rbox(0.054, 0.081, 0.32, 0.024, '#BED6E7', { at: [0, 0.051, 0.061] }),
        P.rbox(0.046, 0.03, 0.365, 0.014, '#F2F9FF', { at: [0, 0.022, 0.071] }),
        ...[0, 1].map((i) => P.rbox(0.105, 0.025, 0.02, 0.008, WHITE, {
          at: [0, 0.281 - i * 0.02, 0.189 + i * 0.025], rot: [-0.64, 0, 0],
        })),
      ], bag, 1.05)
      this.pivot.add(pants, skate)
      return { pants, skate }
    })
    this.pivot.add(this.torso)
    this.root.add(this.pivot, blobShadow(0.57, bag))
    this.update(0, 0)
  }

  update(dt: number, time: number) {
    // Follow the tangent of the loop, including around the ends where they change direction.
    const lap = time * this.pace + this.phase
    const x = Math.sin(lap)
    const z = Math.cos(lap)
    this.root.position.set(this.lane + x * 1.25, 0, -24.4 + z * 11.6)
    this.root.rotation.y = Math.atan2(z * 1.25, -x * 11.6)

    if (this.spinT >= 0 && (this.spinT += dt) >= 0.9) this.spinT = -1
    this.pivot.rotation.y = this.spinT >= 0 ? (this.spinT / 0.9) * TURN * 2 : 0

    const stride = Math.sin(time * 4.1 + this.phase * 2.4)
    this.torso.rotation.set(0.13, stride * -0.12, stride * 0.16)
    this.torso.position.set(-stride * 0.065, 0.66 + (1 - Math.abs(stride)) * 0.035, -0.018)
    this.head.rotation.set(-0.08, 0.35 * Math.sin(time * 1.4 + this.phase), stride * 0.11)
    this.scarf.rotation.set(0.75 + stride * 0.22, 0, stride * -0.26)
    SIDES.forEach((side, i) => {
      const push = stride * side
      const reach = Math.max(0, push)
      const { pants, skate } = this.legs[i]
      skate.position.set(side * (0.145 + reach * 0.145), reach * 0.085, -push * 0.21)
      skate.rotation.set(-reach * 0.13, side * (0.11 + reach * 0.38), side * reach * 0.14)

      // The upper end follows the hip inside the jacket. The lower end follows the
      // ankle inside the boot, so the supporting blade can stay level on the ice.
      pants.position.set(side * 0.115, 0.025, 0)
        .applyQuaternion(this.torso.quaternion).add(this.torso.position)
      this.legAxis.set(0, 0.26, -0.015)
        .applyQuaternion(skate.quaternion).add(skate.position).sub(pants.position)
        .negate()
      pants.scale.y = this.legAxis.length() / LEG_SPAN
      pants.quaternion.setFromUnitVectors(UP, this.legAxis.normalize())
      this.arms[i].rotation.set(push * 0.65 - 0.12, 0, side * (0.85 + stride * side * 0.22))
    })
  }
}
