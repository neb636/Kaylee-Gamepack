// A Canada goose as a toy (characters/toy.ts ToyActor): a round grey-brown body with a cream chest, a long black
// neck, a black head with the white chinstrap and a black bill that opens when it talks or honks. Gus, the captain of
// the geese, is one with a blue captain's band on his neck and a voice; his team are the same goose, silent (they
// honk: the sound is the scene's). They carry little blue hockey sticks under a wing.
//
// A goose pulls the silly faces in its own style (ToyPose.silly, engine3d/characters/face.ts): its little side eyes go
// huge with pin pupils (dazzled), ringed and turning (dizzy), crossed toward the bill, one up and one down with drips
// (soaked), or one squeezed shut under pink foam (sudsy). Gus pulls them at the rink as the team grows.
import { Group, Vector3, type Object3D } from 'three'
import type { Silly } from '../../../engine3d/characters/face'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'
import type { ToySpots } from './worn'

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
  /** The silly faces, built the first time each is pulled, and the one showing. */
  private sillies = new Map<Silly, { root: Group; spin: Group[] }>()
  private sillyOn: Silly | null = null
  /** Where a hat and a scarf sit on Gus (the Team Cabin, characters/worn.ts): his head, and his neck under the band. */
  readonly spots: ToySpots = { hat: new Group(), neck: new Group() }

  constructor(
    private bag: Bag,
    o: GooseOpts = {},
  ) {
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
    this.spots.hat.position.copy(this.headAt)
    this.spots.hat.userData = { R }
    this.spots.neck.position.set(0, 0.02 * H, 0)
    this.spots.neck.userData = { r: 0.075 * H }
    this.neck.add(this.spots.hat, this.spots.neck)
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

  /** A silly pair of eyes in the goose's own style, in the eyes' own space (each eye's white sits where the usual one
   *  does: on the side of the head, a little forward, facing +z). */
  private buildSilly(kind: Silly) {
    const H = this.height
    const X = 0.075 * H
    const Z = 0.118 * H
    const W = 0.042 * H
    const root = new Group()
    const spin: Group[] = []
    const white = (s: number, k: number) => P.sphere(W * k, WHITE, { at: [s * X, 0, Z - W * (k - 1) * 0.3], scale: [1, 1.12, 0.48] }, 12)
    /** The front of an eye's white, `k` times the usual size. */
    const front = (k: number) => Z - W * (k - 1) * 0.3 + W * k * 0.48
    const pupil = (s: number, k: number, dx: number, dy: number, r: number) => [
      P.sphere(W * r, BLACK, { at: [s * X + dx * W * k, dy * W * k, front(k) - W * r * 0.2], scale: [1, 1.1, 0.4] }, 10),
      P.sphere(W * r * 0.38, WHITE, { at: [s * X + (dx - 0.15) * W * k + W * r * 0.25, (dy + 0.2) * W * k, front(k) + W * 0.02] }, 6),
    ]
    if (kind === 'dazzled') {
      // Huge round eyes with tiny pin pupils: the brightest thing she ever saw.
      root.add(solidMix([white(-1, 1.6), white(1, 1.6)], [...pupil(-1, 1.6, 0, 0, 0.22), ...pupil(1, 1.6, 0, 0, 0.22)], this.bag, 1.6))
    } else if (kind === 'dizzy') {
      // Two rings in each eye on a disc that turns.
      root.add(solidMix([white(-1, 1.35), white(1, 1.35)], [], this.bag, 1.6))
      for (const s of [-1, 1]) {
        const g = solidMix([], [P.torus(W * 0.85, W * 0.13, BLACK, {}, Math.PI * 1.55), P.torus(W * 0.42, W * 0.13, BLACK, { rot: [0, 0, 2.2] }, Math.PI * 1.6), P.sphere(W * 0.14, BLACK, { scale: [1, 1, 0.4] }, 8)], this.bag, 0)
        g.position.set(s * X, 0, front(1.35) + W * 0.02)
        root.add(g)
        spin.push(g)
      }
    } else if (kind === 'soaked') {
      // One eye up and out, the other down and in, and three drips off the top of the head.
      const drips = [-1, 0, 1].map((k, i) => P.sphere(W * 0.32, '#8FD3F7', { at: [k * X * 0.9, W * (2.1 - i * 0.25), Z - W * 0.6], scale: [0.75, 1.3, 0.75] }, 8))
      root.add(solidMix([white(-1, 1.2), white(1, 1.2)], [...pupil(-1, 1.2, -0.35, 0.4, 0.5), ...pupil(1, 1.2, -0.25, -0.45, 0.5), ...drips], this.bag, 1.6))
    } else if (kind === 'sudsy') {
      // The right eye squeezed shut (a happy arc), the left one wide, pink foam over the shut one.
      const shut = P.torus(W * 0.75, W * 0.16, BLACK, { at: [X, -W * 0.25, front(1) - W * 0.1] }, Math.PI)
      const foam = [P.sphere(W * 0.95, '#FFE3F0', { at: [X * 1.15, W * 1.25, Z - W * 0.2] }, 10), P.sphere(W * 0.7, WHITE, { at: [X * 0.55, W * 1.5, Z - W * 0.1] }, 10), P.sphere(W * 0.6, '#FFD0E4', { at: [X * 1.6, W * 0.7, Z - W * 0.4] }, 10)]
      root.add(solidMix([white(-1, 1.25), ...foam], [...pupil(-1, 1.25, 0.1, 0.1, 0.6), shut], this.bag, 1.6))
    } else {
      // Crossed: both pupils on the bill.
      root.add(solidMix([white(-1, 1.2), white(1, 1.2)], [...pupil(-1, 1.2, 0.5, -0.3, 0.55), ...pupil(1, 1.2, -0.5, -0.3, 0.55)], this.bag, 1.6))
    }
    root.position.copy(this.eyes.position)
    root.visible = false
    this.neck.add(root)
    return { root, spin }
  }

  /** The silly face showing now, if any. */
  get sillyFace() {
    return this.sillyOn
  }

  private showSilly(kind: Silly | null) {
    if (kind === this.sillyOn) return
    if (this.sillyOn) this.sillies.get(this.sillyOn)!.root.visible = false
    this.sillyOn = kind
    if (kind) {
      let f = this.sillies.get(kind)
      if (!f) this.sillies.set(kind, (f = this.buildSilly(kind)))
      f.root.visible = true
    }
    this.eyes.visible = !kind
  }

  protected animate(p: ToyPose, dt: number, t: number) {
    const sad = p.droop
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    this.showSilly(p.silly)
    const silly = p.silly ? 1 : 0
    if (p.silly === 'dizzy') for (const g of this.sillies.get('dizzy')!.spin) g.rotation.z -= dt * 7
    // The neck: up tall when surprised, forward when gliding, drooping when sad, bobbing as it honks; a wobble while it
    // pulls a silly face.
    this.neck.rotation.set(p.nod + sad * 0.5 - wow * 0.15 - silly * 0.1 + (p.moving === 'glide' ? 0.25 : 0) + p.talk * 0.06 * Math.sin(t * 20), p.headTurn + 0.25 * p.shake, 0.12 * p.wave - 0.2 * p.shake + happy * 0.12 * Math.sin(t * 9) + silly * 0.09 * Math.sin(t * 16))
    this.neck.scale.y = 1 + wow * 0.12 + silly * 0.06 + 0.01 * p.breath
    this.eyes.scale.y = Math.min(p.lid, 1 - sad * 0.4 - happy * 0.6) * (1 + wow * 0.25)
    this.bill.rotation.x = Math.max(p.talk, wow * 0.6, happy * 0.4, p.silly === 'dazzled' || p.silly === 'dizzy' ? 0.55 : 0) * 0.7
    // The wings: folded; up for a cheer, the right one for a wave, beating in the air, out a little while skating.
    const out = p.moving === 'glide' ? 0.35 : 0
    const beat = p.flap * 0.9
    const up = p.armsUp * 2.1
    const flying = this.flying ? 1.25 : 0
    this.wingR.rotation.set(this.swing, 0, 0.05 + out + up + flying + beat + p.wave * (1.9 + 0.4 * Math.sin(t * 15)) + Math.abs(p.shake) * 0.5)
    this.wingL.rotation.set(0, 0, -(0.05 + out + up + flying + beat + Math.abs(p.shake) * 0.5))
  }
}
