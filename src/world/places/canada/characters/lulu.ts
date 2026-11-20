// Lulu the loon as a toy (characters/toy.ts ToyActor): the best singer in Canada, who sings before the big game, and a
// proud mama. A low soft-charcoal body speckled with white, a white tummy and bib, a big round head with a deep green
// sheen, big shiny dark eyes with a ruby rim (a real loon's red eye, made sweet), rosy cheeks, a short dark bill that
// opens when she talks or calls, and the striped white necklace. `chick: true` builds her chick instead: a small grey-brown
// ball of fluff that rides on her back (`chick.ride(lulu.body, ...)`). She sits low: on water, put her feet at the
// surface; her body is made to look afloat.
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
const FLUFF = '#8E8478'
const FLUFF_LIGHT = '#D9D0C4'

export class Lulu extends ToyActor {
  private neck = new Group()
  private eyes: Group
  private bill = new Group()
  private wingL = new Group()
  private wingR = new Group()
  private team: Group | null = null
  private headAt: Vector3

  constructor(bag: Bag, o: { height?: number; voice?: string | null; chick?: boolean } = {}) {
    super(o.height ?? (o.chick ? 0.26 : 0.62), o.chick || o.voice === null ? undefined : (o.voice ?? 'loon'))
    const H = this.height
    const chick = !!o.chick
    const px = chick ? 1.6 : 2.2
    const dark = chick ? FLUFF : BLACK
    const belly = chick ? FLUFF_LIGHT : WHITE
    // The body: long and low, the white tummy under it, a stubby tail. (A loon's legs sit so far back it can hardly
    // walk: she has none to see.)
    const parts = [
      P.sphere(0.3 * H, dark, { at: [0, 0.27 * H, -0.08 * H], scale: [0.95, 0.72, chick ? 1.1 : 1.5] }, 18),
      P.sphere(0.26 * H, belly, { at: [0, 0.17 * H, 0.02 * H], scale: [0.9, 0.55, chick ? 1 : 1.35] }, 14),
    ]
    if (!chick) {
      parts.push(P.cone(0.1 * H, 0.2 * H, BLACK, { at: [0, 0.28 * H, -0.55 * H], rot: [-1.75, 0, 0], scale: [1.3, 1, 0.5] }, 8))
      // The white checks on her back, in rows.
      for (let row = 0; row < 4; row++) for (let i = -2; i <= 2; i++) {
        const z = (-0.36 + row * 0.13) * H
        const x = i * 0.085 * H + (row % 2) * 0.04 * H
        const y = 0.27 * H + Math.sqrt(Math.max(0, 1 - (x / (0.285 * H)) ** 2 - ((z + 0.08 * H) / (0.45 * H)) ** 2)) * 0.216 * H
        if (y > 0.3 * H) parts.push(P.sphere(0.022 * H, WHITE, { at: [x, y, z], scale: [1, 0.4, 1] }, 6))
      }
    }
    this.body.add(solid(merge(parts), bag, px))
    for (const [g, s] of [
      [this.wingL, -1],
      [this.wingR, 1],
    ] as const) {
      g.position.set(s * 0.24 * H, 0.33 * H, -0.02 * H)
      g.add(solid(P.sphere(0.2 * H, dark, { at: [s * 0.02 * H, -0.06 * H, -0.1 * H], scale: [0.28, 0.7, chick ? 0.9 : 1.4] }, 12), bag, px))
      this.body.add(g)
    }
    // The neck and the head.
    this.neck.position.set(0, 0.36 * H, (chick ? 0.14 : 0.24) * H)
    const R = (chick ? 0.3 : 0.25) * H
    const headY = (chick ? 0.22 : 0.3) * H
    this.headAt = new Vector3(0, headY, 0.02 * H)
    const neck = [P.capsule(0.11 * H, 0.14 * H, dark, { at: [0, 0.1 * H, 0], rot: [0.15, 0, 0] }), P.sphere(R, chick ? dark : HEAD, { at: [0, headY, 0.02 * H] }, 18)]
    if (chick) neck.push(P.sphere(R * 0.62, FLUFF_LIGHT, { at: [0, headY - R * 0.25, 0.02 * H + R * 0.55], scale: [1.1, 0.8, 0.6] }, 10))
    else {
      // The necklace: short white stripes round the front of the neck, and her white bib under it.
      for (let i = -3; i <= 3; i++) neck.push(P.rbox(0.014 * H, 0.07 * H, 0.012 * H, 0.004 * H, WHITE, { at: [Math.sin(i * 0.36) * 0.118 * H, 0.1 * H, Math.cos(i * 0.36) * 0.118 * H + 0.012 * H], rot: [0.15, i * 0.36, 0] }))
      neck.push(P.sphere(0.12 * H, WHITE, { at: [0, -0.02 * H, 0.06 * H], scale: [1, 0.9, 0.75] }, 12))
    }
    // Rosy cheeks under the eyes.
    for (const s of [-1, 1]) neck.push(P.sphere(R * 0.13, BLUSH, { at: [s * R * 0.6, headY - R * 0.18, 0.02 * H + R * 0.77], scale: [1.2, 0.7, 0.45] }, 8))
    this.neck.add(solid(merge(neck), bag, px))
    this.bill.position.set(0, headY - R * 0.16, 0.02 * H + R * 0.8)
    this.bill.add(solid(P.cone(R * (chick ? 0.2 : 0.22), R * (chick ? 0.5 : 0.8), chick ? '#5A5048' : '#3A3140', { at: [0, -R * 0.03, R * (chick ? 0.3 : 0.5)], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.45] }, 8), bag, 1.2))
    this.neck.add(this.bill)
    this.eyes = new Group()
    this.eyes.position.set(0, headY + R * 0.12, 0.02 * H)
    // Big shiny eyes: a thin ruby rim round a big dark pupil, two sparkles in it; rosy cheeks under them.
    const eye = [-1, 1].flatMap((s) => {
      const x = s * R * 0.44
      const z = Math.sqrt(R * R - x * x - (R * 0.12) ** 2)
      return [
        P.sphere(R * 0.27, chick ? WHITE : RED, { at: [x, 0, z - R * 0.03], scale: [1, 1.12, 0.45] }, 12),
        P.sphere(R * 0.21, INK, { at: [x, 0, z + R * 0.05], scale: [1, 1.12, 0.42] }, 10),
        P.sphere(R * 0.075, WHITE, { at: [x + R * 0.07, R * 0.09, z + R * 0.13] }, 6),
        P.sphere(R * 0.035, WHITE, { at: [x - R * 0.06, -R * 0.07, z + R * 0.12] }, 5),
      ]
    })
    this.eyes.add(solidMix([], eye, bag, 0))
    this.neck.add(this.eyes)
    if (!chick) {
      // The team's pink scarf (hidden until she joins): a ring at the bottom of her neck with a short tail.
      this.team = solid(merge([P.torus(0.14 * H, 0.04 * H, CANADA_COLORS.scarf, { at: [0, 0.03 * H, 0.0], rot: [Math.PI / 2 - 0.15, 0, 0] }), P.rbox(0.07 * H, 0.16 * H, 0.03 * H, 0.012 * H, CANADA_COLORS.scarf, { at: [0.09 * H, -0.03 * H, 0.15 * H], rot: [0.5, 0, -0.2] })]), bag, 1.8)
      this.team.visible = false
      this.neck.add(this.team)
    }
    this.body.add(this.neck)
  }

  /** The team's pink scarf: on when she joins. */
  scarf(on: boolean) {
    if (this.team) this.team.visible = on
    return this
  }

  head(out = new Vector3()) {
    return this.neck.localToWorld(out.copy(this.headAt))
  }

  /** How far her head is thrown back to call (0..1): set it while her song plays. */
  calling = 0

  protected animate(p: ToyPose, _dt: number, t: number) {
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    const call = this.calling
    this.neck.rotation.set(p.nod + p.droop * 0.4 - call * 0.8 - wow * 0.12, p.headTurn + 0.25 * p.shake, 0.12 * p.wave - 0.2 * p.shake + happy * 0.12 * Math.sin(t * 9))
    this.eyes.scale.y = Math.min(p.lid, 1 - p.droop * 0.4 - happy * 0.6) * (1 + wow * 0.2)
    this.bill.rotation.x = Math.max(p.talk, call * (0.7 + 0.3 * Math.sin(t * 9)), wow * 0.5) * 0.6
    const beat = p.flap * 0.9
    const up = p.armsUp * 1.9
    const flying = this.flying ? 1.25 : 0
    this.wingR.rotation.set(0, 0, 0.04 + up + flying + beat + p.wave * (1.7 + 0.4 * Math.sin(t * 15)) + Math.abs(p.shake) * 0.5)
    this.wingL.rotation.set(0, 0, -(0.04 + up + flying + beat + Math.abs(p.shake) * 0.5))
  }
}
