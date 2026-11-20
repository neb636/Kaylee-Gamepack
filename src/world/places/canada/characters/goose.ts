// A Canada goose as a toy (characters/toy.ts ToyActor): a round grey-brown body with a cream chest, a long black
// neck, a black head with the white chinstrap and a black bill that opens when it talks or honks. Gus, the captain of
// the geese, is one with a blue captain's band on his neck and a voice; his team are the same goose, silent (they
// honk: the sound is the scene's). They carry little blue hockey sticks under a wing.
import { Group, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'

const BODY = '#9A8672'
const WING = '#7E6C5C'
const CHEST = '#F3E9D8'
const BLACK = '#2B2330'
const WHITE = '#FFFFFF'

export interface GooseOpts {
  height?: number
  /** Their speaker in cast.json ('gus'); none for the rest of the team. */
  voice?: string
  /** The captain's blue band round the neck. */
  captain?: boolean
  /** A little hockey stick under the right wing. */
  stick?: boolean
}

export class Goose extends ToyActor {
  private neck = new Group()
  private eyes: Group
  private bill = new Group()
  private wingL = new Group()
  private wingR = new Group()
  private headAt: Vector3

  constructor(bag: Bag, o: GooseOpts = {}) {
    super(o.height ?? 0.95, o.voice)
    const H = this.height
    const px = 2.2
    // The body: a fat egg lying a little forward, a cream chest and rump, a stubby tail, black feet.
    this.body.add(
      solid(
        merge([
          P.sphere(0.27 * H, BODY, { at: [0, 0.3 * H, -0.03 * H], scale: [1, 0.88, 1.22] }, 18),
          P.sphere(0.2 * H, CHEST, { at: [0, 0.27 * H, 0.13 * H], scale: [1, 0.95, 0.9] }, 14),
          P.sphere(0.13 * H, CHEST, { at: [0, 0.25 * H, -0.27 * H], scale: [1, 0.8, 1] }, 10),
          P.cone(0.1 * H, 0.2 * H, BLACK, { at: [0, 0.34 * H, -0.38 * H], rot: [-1.9, 0, 0], scale: [1.2, 1, 0.5] }, 8),
          ...[-1, 1].map((s) => P.sphere(0.075 * H, BLACK, { at: [s * 0.1 * H, 0.03 * H, 0.05 * H], scale: [1, 0.4, 1.5] }, 10)),
          ...[-1, 1].map((s) => P.cyl(0.025 * H, 0.03 * H, 0.1 * H, BLACK, { at: [s * 0.1 * H, 0.08 * H, 0] }, 6)),
        ]),
        bag,
        px,
      ),
    )
    // The wings, folded along the sides (pivots at the shoulders).
    for (const [g, s] of [
      [this.wingL, -1],
      [this.wingR, 1],
    ] as const) {
      g.position.set(s * 0.22 * H, 0.4 * H, 0)
      g.add(solid(P.sphere(0.2 * H, WING, { at: [s * 0.03 * H, -0.1 * H, -0.06 * H], scale: [0.32, 0.85, 1.25] }, 12), bag, px))
      this.body.add(g)
    }
    if (o.stick) {
      const c = CANADA_COLORS.geese
      this.wingR.add(solid(merge([P.cyl(0.018 * H, 0.018 * H, 0.62 * H, c, { at: [0.07 * H, -0.12 * H, 0.14 * H], rot: [0.5, 0, 0] }, 6), P.rbox(0.05 * H, 0.03 * H, 0.2 * H, 0.01 * H, c, { at: [0.07 * H, -0.37 * H, 0.36 * H] })]), bag, 1.6))
    }
    // The long neck and the head, on a pivot at the front of the body.
    this.neck.position.set(0, 0.42 * H, 0.13 * H)
    const headY = 0.44 * H
    const R = 0.15 * H
    this.headAt = new Vector3(0, headY, 0.03 * H)
    const neckParts = [
      P.capsule(0.065 * H, 0.3 * H, BLACK, { at: [0, 0.16 * H, 0.0], rot: [0.12, 0, 0] }),
      P.sphere(R, BLACK, { at: [0, headY, 0.03 * H] }, 18),
      // The chinstrap: a white patch on each cheek, meeting under the chin.
      ...[-1, 1].map((s) => P.sphere(0.085 * H, WHITE, { at: [s * 0.095 * H, headY - 0.045 * H, 0.06 * H], scale: [0.55, 1, 1] }, 10)),
      P.sphere(0.06 * H, WHITE, { at: [0, headY - 0.11 * H, 0.07 * H], scale: [1.4, 0.5, 1] }, 8),
      // The top of the bill.
      P.cone(0.062 * H, 0.17 * H, BLACK, { at: [0, headY - 0.005 * H, 0.2 * H], rot: [Math.PI / 2, 0, 0], scale: [1.25, 1, 0.55] }, 10),
    ]
    if (o.captain) neckParts.push(P.torus(0.075 * H, 0.028 * H, CANADA_COLORS.geese, { at: [0, 0.1 * H, 0.012 * H], rot: [Math.PI / 2 - 0.12, 0, 0] }))
    this.neck.add(solid(merge(neckParts), bag, px))
    // The lower bill, on its hinge.
    this.bill.position.set(0, headY - 0.03 * H, 0.13 * H)
    this.bill.add(solid(P.cone(0.05 * H, 0.14 * H, '#3A3140', { at: [0, -0.012 * H, 0.06 * H], rot: [Math.PI / 2, 0, 0], scale: [1.2, 1, 0.4] }, 8), bag, 1.4))
    this.neck.add(this.bill)
    // Eyes: white with a big dark middle and a shine, so they read on the black head.
    this.eyes = new Group()
    this.eyes.position.set(0, headY + 0.035 * H, 0.03 * H)
    const eye: ReturnType<typeof P.sphere>[] = []
    for (const s of [-1, 1]) {
      const x = s * 0.075 * H
      const z = 0.118 * H
      eye.push(P.sphere(0.042 * H, WHITE, { at: [x, 0, z], scale: [1, 1.15, 0.45] }, 10))
      eye.push(P.sphere(0.027 * H, BLACK, { at: [x, -0.002 * H, z + 0.014 * H], scale: [1, 1.15, 0.4] }, 8))
      eye.push(P.sphere(0.01 * H, WHITE, { at: [x + 0.008 * H, 0.012 * H, z + 0.024 * H] }, 6))
    }
    this.eyes.add(solidMix([], eye, bag, 0))
    this.neck.add(this.eyes)
    this.body.add(this.neck)
  }

  head(out = new Vector3()) {
    return this.neck.localToWorld(out.copy(this.headAt))
  }

  /** The stick wing swung back (+) or through (-), radians: a slap shot (activities/party/players.ts). */
  swing = 0
  /** Holds something under the right wing tip (a taffy on a stick): put it at the wing's end, `H`-relative. */
  hold(o: Object3D) {
    const H = this.height
    o.position.set(0.1 * H, -0.2 * H, 0.12 * H)
    this.wingR.add(o)
  }

  protected animate(p: ToyPose, _dt: number, t: number) {
    const sad = p.droop
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    // The neck: up tall when surprised, forward when gliding, drooping when sad, bobbing as it honks.
    this.neck.rotation.set(p.nod + sad * 0.5 - wow * 0.15 + (p.moving === 'glide' ? 0.25 : 0) + p.talk * 0.06 * Math.sin(t * 20), p.headTurn + 0.25 * p.shake, 0.12 * p.wave - 0.2 * p.shake + happy * 0.12 * Math.sin(t * 9))
    this.neck.scale.y = 1 + wow * 0.12 + 0.01 * p.breath
    this.eyes.scale.y = Math.min(p.lid, 1 - sad * 0.4 - happy * 0.6) * (1 + wow * 0.25)
    this.bill.rotation.x = Math.max(p.talk, wow * 0.6, happy * 0.4) * 0.7
    // The wings: folded; up for a cheer, the right one for a wave, beating in the air, out a little while skating.
    const out = p.moving === 'glide' ? 0.35 : 0
    const beat = p.flap * 0.9
    const up = p.armsUp * 2.1
    const flying = this.flying ? 1.25 : 0
    this.wingR.rotation.set(this.swing, 0, 0.05 + out + up + flying + beat + p.wave * (1.9 + 0.4 * Math.sin(t * 15)) + Math.abs(p.shake) * 0.5)
    this.wingL.rotation.set(0, 0, -(0.05 + out + up + flying + beat + Math.abs(p.shake) * 0.5))
  }
}
