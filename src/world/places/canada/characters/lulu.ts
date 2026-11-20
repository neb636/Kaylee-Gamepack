// Lulu the loon as a toy (characters/toy.ts ToyActor): the best singer in Canada, who sings before the big game, and a
// proud mama. A low soft-charcoal body speckled with white, a white tummy and bib, a big round head with a deep green
// sheen, big shiny dark eyes with a ruby rim (a real loon's red eye, made sweet), rosy cheeks, a short dark bill that
// opens when she talks or calls, and the striped white necklace. `chick: true` builds her chick instead: a round ball of
// light grey fluff with a big head, a pale face, big shiny eyes, a tuft on top and a tiny bill that pops wide open when
// it squeaks; it rides on her back (`chick.ride(lulu.body, ...)`). She sits low: on water, put her feet at the surface;
// her body is made to look afloat.
import { Group, Vector3 } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'

const BLACK = '#2F3443'
const HEAD = '#294A50'
const WHITE = '#FFFFFF'
const RED = '#E2384B'
const INK = '#1C1820'
const BLUSH = '#FF9DBB'
/** The chick: light grey down, a paler face and tummy, a soft dark bill. */
const FLUFF = '#BDB7B0'
const FLUFF_DARK = '#A39C94'
const FLUFF_PALE = '#F4F0EA'
const CHICK_BILL = '#4A4048'

/** Big shiny eyes on a head of radius R: a rim, a big dark pupil, two sparkles. */
function eyeParts(R: number, rim: string, x0: number, size: number) {
  return [-1, 1].flatMap((s) => {
    const x = s * R * x0
    const z = Math.sqrt(R * R - x * x - (R * 0.12) ** 2)
    return [
      P.sphere(R * size, rim, { at: [x, 0, z - R * 0.03], scale: [1, 1.12, 0.45] }, 12),
      P.sphere(R * size * 0.78, INK, { at: [x, 0, z + R * 0.05], scale: [1, 1.12, 0.42] }, 10),
      P.sphere(R * size * 0.28, WHITE, { at: [x + R * size * 0.26, R * size * 0.33, z + R * 0.13] }, 6),
      P.sphere(R * size * 0.13, WHITE, { at: [x - R * size * 0.22, -R * size * 0.26, z + R * 0.12] }, 5),
    ]
  })
}

export class Lulu extends ToyActor {
  private neck = new Group()
  private eyes = new Group()
  private bill = new Group()
  /** The chick's lower bill: it drops open when the chick squeaks (Lulu's whole bill tips instead). */
  private jaw: Group | null = null
  private wingL = new Group()
  private wingR = new Group()
  private team: Group | null = null
  private headAt = new Vector3()

  constructor(bag: Bag, o: { height?: number; voice?: string | null; chick?: boolean } = {}) {
    super(o.height ?? (o.chick ? 0.26 : 0.62), o.chick || o.voice === null ? undefined : (o.voice ?? 'loon'))
    if (o.chick) this.buildChick(bag)
    else this.buildLoon(bag)
    this.body.add(this.neck)
  }

  private buildLoon(bag: Bag) {
    const H = this.height
    const px = 2.2
    // The body: long and low, the white tummy under it, a stubby tail. (A loon's legs sit so far back it can hardly
    // walk: she has none to see.)
    const parts = [
      P.sphere(0.3 * H, BLACK, { at: [0, 0.27 * H, -0.08 * H], scale: [0.95, 0.72, 1.5] }, 18),
      P.sphere(0.26 * H, WHITE, { at: [0, 0.17 * H, 0.02 * H], scale: [0.9, 0.55, 1.35] }, 14),
      P.cone(0.1 * H, 0.2 * H, BLACK, { at: [0, 0.28 * H, -0.55 * H], rot: [-1.75, 0, 0], scale: [1.3, 1, 0.5] }, 8),
    ]
    // The white checks on her back, in rows.
    for (let row = 0; row < 4; row++) for (let i = -2; i <= 2; i++) {
      const z = (-0.36 + row * 0.13) * H
      const x = i * 0.085 * H + (row % 2) * 0.04 * H
      const y = 0.27 * H + Math.sqrt(Math.max(0, 1 - (x / (0.285 * H)) ** 2 - ((z + 0.08 * H) / (0.45 * H)) ** 2)) * 0.216 * H
      if (y > 0.3 * H) parts.push(P.sphere(0.022 * H, WHITE, { at: [x, y, z], scale: [1, 0.4, 1] }, 6))
    }
    this.body.add(solid(merge(parts), bag, px))
    this.wings(bag, BLACK, 1.4, px)
    // The neck and the head.
    this.neck.position.set(0, 0.36 * H, 0.24 * H)
    const R = 0.25 * H
    const headY = 0.3 * H
    this.headAt.set(0, headY, 0.02 * H)
    const neck = [P.capsule(0.11 * H, 0.14 * H, BLACK, { at: [0, 0.1 * H, 0], rot: [0.15, 0, 0] }), P.sphere(R, HEAD, { at: [0, headY, 0.02 * H] }, 18)]
    // The necklace: short white stripes round the front of the neck, and her white bib under it.
    for (let i = -3; i <= 3; i++) neck.push(P.rbox(0.014 * H, 0.07 * H, 0.012 * H, 0.004 * H, WHITE, { at: [Math.sin(i * 0.36) * 0.118 * H, 0.1 * H, Math.cos(i * 0.36) * 0.118 * H + 0.012 * H], rot: [0.15, i * 0.36, 0] }))
    neck.push(P.sphere(0.12 * H, WHITE, { at: [0, -0.02 * H, 0.06 * H], scale: [1, 0.9, 0.75] }, 12))
    // Rosy cheeks under the eyes.
    for (const s of [-1, 1]) neck.push(P.sphere(R * 0.13, BLUSH, { at: [s * R * 0.6, headY - R * 0.18, 0.02 * H + R * 0.77], scale: [1.2, 0.7, 0.45] }, 8))
    this.neck.add(solid(merge(neck), bag, px))
    this.bill.position.set(0, headY - R * 0.16, 0.02 * H + R * 0.8)
    this.bill.add(solid(P.cone(R * 0.22, R * 0.8, '#3A3140', { at: [0, -R * 0.03, R * 0.5], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.45] }, 8), bag, 1.2))
    this.neck.add(this.bill)
    // Big shiny eyes: a thin ruby rim round a big dark pupil, two sparkles in it.
    this.eyes.position.set(0, headY + R * 0.12, 0.02 * H)
    this.eyes.add(solidMix([], eyeParts(R, RED, 0.44, 0.27), bag, 0))
    this.neck.add(this.eyes)
    // The team's pink scarf (hidden until she joins): a ring at the bottom of her neck with a short tail.
    this.team = solid(merge([P.torus(0.14 * H, 0.04 * H, CANADA_COLORS.scarf, { at: [0, 0.03 * H, 0.0], rot: [Math.PI / 2 - 0.15, 0, 0] }), P.rbox(0.07 * H, 0.16 * H, 0.03 * H, 0.012 * H, CANADA_COLORS.scarf, { at: [0.09 * H, -0.03 * H, 0.15 * H], rot: [0.5, 0, -0.2] })]), bag, 1.8)
    this.team.visible = false
    this.neck.add(this.team)
  }

  /** The chick: a round ball of light grey fluff, most of it head (that's what makes a baby read as a baby), a pale
   *  face with big eyes, a tuft on top, and a tiny bill in two halves so it can open wide. */
  private buildChick(bag: Bag) {
    const H = this.height
    const px = 1.6
    const parts = [
      P.sphere(0.3 * H, FLUFF, { at: [0, 0.26 * H, -0.04 * H], scale: [1, 0.86, 1.1] }, 16),
      P.sphere(0.24 * H, FLUFF_PALE, { at: [0, 0.2 * H, 0.08 * H], scale: [0.92, 0.72, 0.85] }, 12),
      // Fluffy bumps on its back and a little tail tuft.
      ...[-1, 0, 1].map((i) => P.sphere(0.09 * H, FLUFF_DARK, { at: [i * 0.13 * H, 0.46 * H - Math.abs(i) * 0.05 * H, -0.16 * H], scale: [1, 0.8, 1] }, 8)),
      P.sphere(0.09 * H, FLUFF_DARK, { at: [0, 0.3 * H, -0.36 * H], scale: [1, 0.8, 1.2] }, 8),
    ]
    this.body.add(solid(merge(parts), bag, px))
    this.wings(bag, FLUFF_DARK, 0.8, px)
    this.neck.position.set(0, 0.34 * H, 0.1 * H)
    const R = 0.4 * H
    const headY = 0.26 * H
    this.headAt.set(0, headY, 0.02 * H)
    const head = [
      P.sphere(R, FLUFF, { at: [0, headY, 0.02 * H] }, 18),
      // The pale face: a soft mask over the front of the head, round the bill and under the eyes.
      P.sphere(R * 0.82, FLUFF_PALE, { at: [0, headY - R * 0.16, 0.02 * H + R * 0.32], scale: [1.05, 0.82, 0.8] }, 14),
      // A tuft of down on top.
      ...[-1, 0, 1].map((i) => P.sphere(R * (i ? 0.16 : 0.2), FLUFF_DARK, { at: [i * R * 0.16, headY + R * (i ? 0.92 : 1.0), 0.02 * H - R * 0.05], scale: [0.8, 1.3, 0.8] }, 8)),
    ]
    for (const s of [-1, 1]) head.push(P.sphere(R * 0.13, BLUSH, { at: [s * R * 0.6, headY - R * 0.26, 0.02 * H + R * 0.76], scale: [1.2, 0.7, 0.45] }, 8))
    this.neck.add(solid(merge(head), bag, px))
    // The bill: a tiny upper half and a lower half (the jaw) that drops open on a squeak.
    this.bill.position.set(0, headY - R * 0.2, 0.02 * H + R * 0.93)
    this.bill.add(solid(P.cone(R * 0.15, R * 0.3, CHICK_BILL, { at: [0, R * 0.025, R * 0.13], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.5] }, 8), bag, 1))
    this.jaw = new Group()
    this.jaw.add(solid(P.cone(R * 0.12, R * 0.24, CHICK_BILL, { at: [0, -R * 0.02, R * 0.1], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.45] }, 8), bag, 1))
    this.bill.add(this.jaw)
    this.neck.add(this.bill)
    this.eyes.position.set(0, headY + R * 0.1, 0.02 * H)
    this.eyes.add(solidMix([], eyeParts(R, WHITE, 0.4, 0.3), bag, 0))
    this.neck.add(this.eyes)
  }

  private wings(bag: Bag, color: string, long: number, px: number) {
    const H = this.height
    for (const [g, s] of [
      [this.wingL, -1],
      [this.wingR, 1],
    ] as const) {
      g.position.set(s * 0.24 * H, 0.33 * H, -0.02 * H)
      g.add(solid(P.sphere(0.2 * H, color, { at: [s * 0.02 * H, -0.06 * H, -0.1 * H], scale: [0.28, 0.7, long] }, 12), bag, px))
      this.body.add(g)
    }
  }

  /** The team's pink scarf: on when she joins. */
  scarf(on: boolean) {
    if (this.team) this.team.visible = on
    return this
  }

  head(out = new Vector3()) {
    return this.neck.localToWorld(out.copy(this.headAt))
  }

  /** How far her head is thrown back to call (0..1): set it while her song plays. (The chick's squeak: its head tips
   *  back a little and its bill pops wide open.) */
  calling = 0

  protected animate(p: ToyPose, _dt: number, t: number) {
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    const call = this.calling
    const back = this.jaw ? 0.3 : 0.8
    this.neck.rotation.set(p.nod + p.droop * 0.4 - call * back - wow * 0.12, p.headTurn + 0.25 * p.shake, 0.12 * p.wave - 0.2 * p.shake + happy * 0.12 * Math.sin(t * 9))
    this.eyes.scale.y = Math.min(p.lid, 1 - p.droop * 0.4 - happy * 0.6) * (1 + wow * 0.2)
    const open = Math.max(p.talk, call * (0.7 + 0.3 * Math.sin(t * 9)), wow * 0.5)
    if (this.jaw) {
      this.bill.rotation.x = -open * 0.3
      this.jaw.rotation.x = open * 1.1
    } else this.bill.rotation.x = open * 0.6
    const beat = p.flap * 0.9
    const up = p.armsUp * 1.9
    const flying = this.flying ? 1.25 : 0
    this.wingR.rotation.set(0, 0, 0.04 + up + flying + beat + p.wave * (1.7 + 0.4 * Math.sin(t * 15)) + Math.abs(p.shake) * 0.5)
    this.wingL.rotation.set(0, 0, -(0.04 + up + flying + beat + Math.abs(p.shake) * 0.5))
  }
}
