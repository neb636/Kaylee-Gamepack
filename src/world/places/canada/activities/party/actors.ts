// Everyone in the finale: the friends on the chibi rig (engine3d/characters/animal.ts: Maple, the moose, the raccoon,
// and the bears, bison, puffin, squirrel and geese as rig species in their own colors) and the few animals the rig has no
// shape for, built here from toon parts (the snowy owl, the loon, the orca, the sea otter). Every one of them is an
// Actor: it breathes and blinks by itself, eases into a pose the world asks for each frame (skating, carried by her
// finger, swimming), and plays its little actions (a hop with a crouch first, a cheer, a wave, a spin, a shiver, a flop),
// never jumping between poses in one frame.
import { Group, type BufferGeometry } from 'three'
import { bell, span, wobble } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Look } from '../../../../engine3d/characters/look'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { CANADA_LOOKS } from '../../characters/looks'

export type ActorId =
  | 'maple'
  | 'moose'
  | 'raccoon'
  | 'squirrel'
  | 'owl'
  | 'loon'
  | 'grizzly'
  | 'otter'
  | 'spirit'
  | 'goose'
  | 'polar-bear'
  | 'orca'
  | 'bison'
  | 'beaver'
  | 'puffin'

/** The looks of the rig animals that aren't Canada's three friends. */
const LOOKS: Partial<Record<ActorId, Look>> = {
  maple: CANADA_LOOKS.maple,
  moose: CANADA_LOOKS.moose,
  raccoon: CANADA_LOOKS.raccoon,
  beaver: CANADA_LOOKS.cousin,
  squirrel: { species: 'fox', height: 0.6, chub: 1.05, fur: '#D9683A', light: '#FFE6CC', dark: '#5A3426', ear: '#F7A884', open: true },
  grizzly: { species: 'bear', height: 0.85, chub: 1.15, fur: '#9A6A44', light: '#D9B58C', dark: '#3A2A26', ear: '#E8B8A0', open: true },
  spirit: { species: 'bear', height: 1.15, chub: 1.18, fur: '#F4ECDA', light: '#FFF9EE', dark: '#4A3C38', ear: '#F8C8C0' },
  goose: { species: 'tern', height: 0.95, fur: '#8F8379', light: '#FFFFFF', dark: '#2B2330', cap: '#2B2330' },
  'polar-bear': { species: 'polarbear', height: 1, chub: 1.12, fur: '#FFFFFF', light: '#FFF7EC', dark: '#2B2330', ear: '#FFC9D6', open: true },
  bison: { species: 'buffalo', height: 1, chub: 1.2, fur: '#7A5236', light: '#B08762', dark: '#3A2A22', ear: '#D2A880', hairdo: { style: 'spiky', color: '#4E3424' } },
  puffin: { species: 'penguin', height: 0.8, fur: '#2E2A3A', light: '#FFFFFF', dark: '#FF7A3D', open: true },
}

/** What the world asks of an actor this frame (all 0..1 unless it says otherwise). */
export interface Pose {
  /** Skating: the body sways side to side, the arms swing. */
  skate?: number
  /** Radians forward. */
  lean?: number
  /** Held up by her finger: wriggling, legs dangling, arms out. */
  carry?: number
  /** Arms up in the air. */
  flail?: number
  /** Bobbing in water. */
  swim?: number
}

const HOP_S = 0.62
const CHEER_S = 1.1
const WAVE_S = 1.5
const SPIN_S = 0.8
const SHIVER_S = 1.1
const FLOP_S = 1.3
const SLAP_S = 0.42

/** The little actions every actor has, and how far along each one is. */
abstract class Moves {
  abstract readonly root: Group
  abstract readonly height: number
  /** The cast voice its mouth follows (none: no voice). */
  readonly voice?: string
  protected hopT = -1
  protected cheerT = -1
  protected waveT = -1
  protected spinT = -1
  protected shiverT = -1
  protected flopT = -1
  protected slapT = -1
  protected phase = Math.random() * 6
  protected k = { carry: 0, skate: 0, flail: 0, swim: 0 }

  hop() {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.75) this.hopT = 0
  }
  cheer() {
    this.cheerT = 0
    this.hop()
  }
  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  spin() {
    if (this.spinT < 0) this.spinT = 0
  }
  shiver() {
    this.shiverT = 0
  }
  flop() {
    this.flopT = 0
  }
  slap() {
    this.slapT = 0
  }
  get busy() {
    return this.hopT >= 0 || this.cheerT >= 0 || this.spinT >= 0 || this.flopT >= 0
  }

  /** Advances the actions; returns how much of each is showing now. */
  protected step(dt: number, pose: Pose) {
    const adv = (t: number, s: number) => (t < 0 ? -1 : t + dt > s ? -1 : t + dt)
    this.hopT = adv(this.hopT, HOP_S)
    this.cheerT = adv(this.cheerT, CHEER_S)
    this.waveT = adv(this.waveT, WAVE_S)
    this.spinT = adv(this.spinT, SPIN_S)
    this.shiverT = adv(this.shiverT, SHIVER_S)
    this.flopT = adv(this.flopT, FLOP_S)
    this.slapT = adv(this.slapT, SLAP_S)
    // Poses ease in and out (never a jump).
    const ease = (from: number, to: number, rate: number) => from + (to - from) * (1 - Math.exp(-dt * rate))
    this.k.carry = ease(this.k.carry, pose.carry ?? 0, 10)
    this.k.skate = ease(this.k.skate, pose.skate ?? 0, 5)
    this.k.flail = ease(this.k.flail, pose.flail ?? 0, 8)
    this.k.swim = ease(this.k.swim, pose.swim ?? 0, 4)
    let lift = 0
    let squash = 0
    if (this.hopT >= 0) {
      // Crouch, up (stretched), down, squash on landing, settle.
      const p = this.hopT / HOP_S
      const air = span(p, 0.22, 0.78)
      lift = bell(air) * 0.42 * this.height
      squash = p < 0.22 ? bell(p / 0.44) * 0.22 : p > 0.78 ? bell((p - 0.78) / 0.44) * 0.18 : -0.12 * bell(air)
    }
    const spin = this.spinT >= 0 ? smoothstep(this.spinT / SPIN_S) * Math.PI * 2 : 0
    const shiver = this.shiverT >= 0 ? Math.sin(this.shiverT * 55) * (1 - this.shiverT / SHIVER_S) : 0
    // A flop: tips over sideways, lies there a moment, wriggles, and rights itself.
    const flop = this.flopT >= 0 ? bell(Math.min(1, (this.flopT / FLOP_S) * 1.15)) : 0
    const cheer = this.cheerT >= 0 ? bell(this.cheerT / CHEER_S) : 0
    const wave = this.waveT >= 0 ? bell(this.waveT / WAVE_S) : 0
    const slap = this.slapT >= 0 ? this.slapT / SLAP_S : -1
    return { lift, squash, spin, shiver, flop, cheer, wave, slap, carry: this.k.carry, skate: this.k.skate, flail: Math.max(this.k.flail, cheer), swim: this.k.swim }
  }

  abstract update(dt: number, t: number, pose?: Pose): void
}

const smoothstep = (x: number) => x * x * (3 - 2 * x)

/** A friend on the chibi rig. */
export class RigActor extends Moves {
  readonly root: Group
  readonly rig: Rig
  readonly height: number
  /** The hockey stick in the right hand (when it skates). */
  readonly stick: Group | null = null
  private life: FaceLife

  constructor(
    bag: Bag,
    readonly id: ActorId,
    opts: { height?: number; stick?: boolean; voice?: string } = {},
  ) {
    super()
    const look = LOOKS[id]!
    this.rig = buildAnimal({ ...look, height: opts.height ?? look.height }, bag)
    this.root = this.rig.root
    this.height = this.rig.height
    ;(this as { voice?: string }).voice = opts.voice
    this.life = new FaceLife(this.rig, opts.voice)
    if (opts.stick) {
      const H = this.height
      const s = new Group()
      // From the hand down to a blade on the ice in front (its pivot at the hand, so a slap shot swings it).
      s.position.set(0.17 * H, 0.3 * H, 0.1 * H)
      const L = 0.42 * H
      s.add(
        solid(
          merge([
            P.cyl(0.018 * H, 0.018 * H, L, '#C98B5A', { at: [0, -L / 2, 0] }, 8),
            P.cyl(0.021 * H, 0.021 * H, 0.08 * H, PAL.ink, { at: [0, -0.04 * H, 0] }, 8),
            P.rbox(0.06 * H, 0.05 * H, 0.2 * H, 0.012 * H, '#2B2330', { at: [-0.01 * H, -L, 0.07 * H] }),
          ]),
          bag,
          2,
        ),
      )
      s.rotation.set(0.45, 0, 0.32)
      this.rig.body.add(s)
      ;(this as { stick: Group | null }).stick = s
    }
  }

  update(dt: number, t: number, pose: Pose = {}) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    const m = this.step(dt, pose)
    const H = this.height
    const breathe = 0.025 * Math.sin(t * 2.4 + this.phase)
    const sway = Math.sin(t * 4.2 + this.phase)
    const wriggle = Math.sin(t * 13 + this.phase) * m.carry
    body.position.set(0, m.lift + m.carry * 0.04 * H, 0)
    const sq = m.squash
    body.scale.set(1 + sq * 0.6, 1 - sq + breathe + m.carry * 0.06, 1 + sq * 0.6)
    body.rotation.set((pose.lean ?? 0) + 0.18 * m.skate - 0.08 * m.carry, m.spin, 0.12 * m.skate * sway + 0.3 * m.shiver * 0.3 + 0.18 * wriggle + m.flop * 1.35)
    head.rotation.set(-0.25 * m.flail + 0.1 * m.flop, 0.15 * Math.sin(t * 0.7 + this.phase) * (1 - m.carry), -0.1 * m.skate * sway - 0.25 * m.shiver - 0.12 * wriggle + 0.15 * m.wave)
    if (tail) tail.rotation.set(0, 0.35 * Math.sin(t * 3 + this.phase) * (0.4 + m.carry + m.cheer), 0.3 * Math.sin(t * 2 + this.phase))
    // Arms: hang, swing as it skates, reach out when carried, go up for a cheer, the right one waves.
    ;[armR, armL].forEach((a, i) => {
      const s = i ? -1 : 1
      const swing = m.skate * Math.sin(t * 4.2 + this.phase + i * Math.PI) * 0.7
      const stickHold = this.stick && i === 0 ? 0.55 : 0
      a.rotation.x = -swing * (this.stick ? 0.3 : 1) - stickHold - m.carry * 0.3
      a.rotation.z = s * (0.15 + m.carry * (0.9 + 0.3 * Math.sin(t * 11 + i)) + m.flail * (2.3 + 0.3 * Math.sin(t * 18 + i)) + (i === 0 ? m.wave * (2.1 + 0.4 * Math.sin(t * 14)) : 0) + Math.abs(m.shiver) * 0.4)
    })
    if (this.stick) {
      // A slap shot: back, then a quick swing through and a follow-through.
      const p = m.slap
      const swing = p < 0 ? 0 : p < 0.3 ? -0.9 * smoothstep(p / 0.3) : -0.9 + 1.6 * smoothstep(Math.min(1, (p - 0.3) / 0.25)) - 0.7 * span(p, 0.6, 1)
      this.stick.rotation.set(0.45 - swing, 0, 0.32 + 0.3 * m.flail)
      this.stick.visible = m.cheer < 0.5
    }
  }
}

// ---------------------------------------------------------------- the animals built here

type Parts = BufferGeometry[]
const INK = PAL.ink

/** A code-built animal: a body, a head and two wings or flippers on their own pivots, blinking eyes. */
class CodeActor extends Moves {
  readonly root = new Group()
  readonly body = new Group()
  readonly head = new Group()
  readonly sideL = new Group()
  readonly sideR = new Group()
  readonly tail = new Group()
  eyes: Group | null = null
  private blinkIn = 1 + Math.random() * 3
  private blink = -1

  constructor(
    bag: Bag,
    readonly id: ActorId,
    readonly height: number,
    readonly kind: 'owl' | 'loon' | 'orca' | 'otter',
    voice?: string,
  ) {
    super()
    ;(this as { voice?: string }).voice = voice
    this.root.add(blobShadow(kind === 'orca' ? height * 0.9 : height * 0.45, bag))
    this.root.add(this.body)
    this.body.add(this.head, this.sideL, this.sideR, this.tail)
    const H = height
    const px = 2.5
    const add = (g: Group, outlined: Parts, plain: Parts = []) => g.add(solidMix(outlined, plain, bag, px))
    const eye = (x: number, y: number, z: number, r: number, iris?: string): { o: Parts; p: Parts } => ({
      o: iris ? [P.sphere(r * 1.5, iris, { at: [x, y, z - r * 0.4] }, 14)] : [],
      p: [P.sphere(r, INK, { at: [x, y, z] }, 12), P.sphere(r * 0.36, '#FFFFFF', { at: [x + r * 0.3, y + r * 0.35, z + r * 0.75] }, 8)],
    })
    const eyePair = (x: number, y: number, z: number, r: number, iris?: string) => {
      const g = new Group()
      g.position.set(0, y, 0)
      const a = eye(x, 0, z, r, iris)
      const b = eye(-x, 0, z, r, iris)
      g.add(solidMix([...a.o, ...b.o], [...a.p, ...b.p], bag, 1.5))
      this.head.add(g)
      this.eyes = g
    }
    if (kind === 'owl') {
      // The snowy owl: a round white egg of a bird with black flecks, a flat face, big golden eyes, a little black beak.
      const flecks: Parts = []
      for (let i = 0; i < 16; i++) {
        const a = i * 2.4
        const y = 0.2 + (i % 5) * 0.07
        flecks.push(P.sphere(0.022 * H * 1.4, '#4A4458', { at: [Math.sin(a) * 0.29 * H, y * H, Math.cos(a) * 0.26 * H - 0.02 * H], scale: [1.4, 0.6, 0.6] }, 6))
      }
      add(this.body, [P.sphere(0.32 * H, '#FFFFFF', { at: [0, 0.36 * H, 0], scale: [1, 1.12, 0.95] }, 22), ...[-1, 1].map((s) => P.sphere(0.07 * H, '#E9DCC4', { at: [s * 0.1 * H, 0.04 * H, 0.12 * H], scale: [1.2, 0.5, 1.3] }))], flecks)
      this.head.position.set(0, 0.68 * H, 0)
      add(this.head, [P.sphere(0.26 * H, '#FFFFFF', { at: [0, 0.06 * H, 0] }, 22), P.sphere(0.2 * H, '#FFFBF4', { at: [0, 0.04 * H, 0.1 * H], scale: [1.15, 0.95, 0.6] }, 18), P.cone(0.035 * H, 0.07 * H, INK, { at: [0, -0.02 * H, 0.25 * H], rot: [Math.PI / 2 + 0.4, 0, 0] }, 8)], [...[-1, 1].map((s) => P.sphere(0.03 * H, '#FFB8CC', { at: [s * 0.15 * H, -0.03 * H, 0.18 * H], scale: [1, 0.6, 0.4] }, 8)), ...[0.1, -0.12, 0.02].map((x, i) => P.sphere(0.018 * H, '#4A4458', { at: [x * H, (0.24 - i * 0.02) * H, 0.1 * H], scale: [1.5, 0.6, 0.6] }, 6))])
      eyePair(0.09 * H, 0.08 * H, 0.235 * H, 0.04 * H, '#FFC83D')
      for (const [g, s] of [
        [this.sideL, -1],
        [this.sideR, 1],
      ] as const) {
        g.position.set(s * 0.28 * H, 0.5 * H, 0)
        add(g, [P.sphere(0.2 * H, '#FFFFFF', { at: [s * 0.03 * H, -0.12 * H, -0.02 * H], scale: [0.4, 1.1, 0.85] }, 14)], [0, 1, 2].map((i) => P.sphere(0.02 * H, '#4A4458', { at: [s * 0.11 * H, (-0.05 - i * 0.07) * H, (0.02 - i * 0.03) * H], scale: [0.5, 0.6, 1.4] }, 6)))
      }
    } else if (kind === 'loon') {
      // The common loon: a long low black body checkered with white, a white belly, a black head with red eyes and a white
      // necklace, and a dagger beak.
      const checks: Parts = []
      for (let i = 0; i < 6; i++) for (const s of [-1, 1]) checks.push(P.sphere(0.022 * H * 1.3, '#FFFFFF', { at: [s * (0.17 - Math.abs(i - 2.5) * 0.008) * H, (0.33 + (i % 2) * 0.03) * H, (0.18 - i * 0.075) * H], scale: [0.6, 1, 1.4] }, 6))
      add(this.body, [P.sphere(0.24 * H, '#2A2A38', { at: [0, 0.27 * H, 0], scale: [0.85, 0.62, 1.45] }, 22), P.sphere(0.2 * H, '#FFFFFF', { at: [0, 0.19 * H, 0.04 * H], scale: [0.85, 0.45, 1.3] }, 16), P.cone(0.07 * H, 0.14 * H, '#2A2A38', { at: [0, 0.3 * H, -0.36 * H], rot: [-Math.PI / 2, 0, 0], scale: [1.4, 1, 0.5] }, 8)], checks)
      this.head.position.set(0, 0.38 * H, 0.26 * H)
      add(
        this.head,
        [P.capsule(0.075 * H, 0.14 * H, '#26343A', { at: [0, 0.08 * H, 0.02 * H], rot: [0.3, 0, 0] }), P.sphere(0.12 * H, '#26343A', { at: [0, 0.22 * H, 0.06 * H] }, 18), P.cone(0.04 * H, 0.2 * H, '#3A3A48', { at: [0, 0.2 * H, 0.24 * H], rot: [Math.PI / 2 + 0.1, 0, 0] }, 8)],
        [P.torus(0.08 * H, 0.012 * H, '#FFFFFF', { at: [0, 0.07 * H, 0.03 * H], rot: [Math.PI / 2 + 0.3, 0, 0] }), P.torus(0.078 * H, 0.01 * H, '#FFFFFF', { at: [0, 0.11 * H, 0.04 * H], rot: [Math.PI / 2 + 0.3, 0, 0] })],
      )
      eyePair(0.07 * H, 0.25 * H, 0.15 * H, 0.025 * H, '#E8403F')
      for (const [g, s] of [
        [this.sideL, -1],
        [this.sideR, 1],
      ] as const) {
        g.position.set(s * 0.18 * H, 0.32 * H, 0.02 * H)
        add(g, [P.sphere(0.14 * H, '#2A2A38', { at: [s * 0.02 * H, -0.02 * H, -0.08 * H], scale: [0.3, 0.55, 1.2] }, 12)])
      }
    } else if (kind === 'orca') {
      // An orca: a big round black whale with a white belly and the white patch behind each eye, a tall fin, flippers and
      // flukes that beat.
      add(this.body, [P.sphere(0.4 * H, '#232030', { at: [0, 0.38 * H, 0], scale: [0.8, 0.72, 1.6] }, 26), P.sphere(0.33 * H, '#FFFFFF', { at: [0, 0.26 * H, 0.18 * H], scale: [0.72, 0.45, 1.25] }, 20), P.prism([[-0.12, 0], [0.16, 0], [-0.06, 0.48]], 0.07 * H, '#232030', { at: [0, 0.6 * H, -0.08 * H], rot: [0, Math.PI / 2, 0], scale: [H, H, 1] })], [...[-1, 1].map((s) => P.sphere(0.07 * H, '#FFFFFF', { at: [s * 0.28 * H, 0.48 * H, 0.18 * H], rot: [0, s * 0.4, 0], scale: [0.35, 0.6, 1.3] }, 10)), ...[-1, 1].map((s) => P.sphere(0.04 * H, '#FFB8CC', { at: [s * 0.25 * H, 0.32 * H, 0.42 * H], scale: [0.4, 0.6, 1] }, 8))])
      this.head.position.set(0, 0, 0)
      eyePair(0.27 * H, 0.4 * H, 0.38 * H, 0.04 * H)
      for (const [g, s] of [
        [this.sideL, -1],
        [this.sideR, 1],
      ] as const) {
        g.position.set(s * 0.28 * H, 0.22 * H, 0.25 * H)
        add(g, [P.sphere(0.14 * H, '#232030', { at: [s * 0.1 * H, -0.03 * H, -0.04 * H], rot: [0, 0, s * 0.5], scale: [1.2, 0.25, 0.7] }, 12)])
      }
      this.tail.position.set(0, 0.36 * H, -0.6 * H)
      add(this.tail, [P.capsule(0.1 * H, 0.2 * H, '#232030', { at: [0, 0, -0.12 * H], rot: [Math.PI / 2, 0, 0] }), ...[-1, 1].map((s) => P.sphere(0.16 * H, '#232030', { at: [s * 0.14 * H, 0, -0.3 * H], rot: [0, s * 0.5, 0], scale: [1.1, 0.18, 0.55] }, 12))])
    } else {
      // A sea otter: round brown body, a pale cream face with whiskers, little round ears, paws held up on its tummy.
      add(this.body, [P.sphere(0.24 * H, '#8A6448', { at: [0, 0.3 * H, 0], scale: [1, 1.25, 0.9] }, 20), P.sphere(0.17 * H, '#C9A27E', { at: [0, 0.28 * H, 0.1 * H], scale: [1, 1.2, 0.6] }, 16), ...[-1, 1].map((s) => P.sphere(0.07 * H, '#6E4E3A', { at: [s * 0.11 * H, 0.04 * H, 0.1 * H], scale: [1, 0.5, 1.4] }, 10))])
      this.head.position.set(0, 0.62 * H, 0)
      add(this.head, [P.sphere(0.2 * H, '#8A6448', { at: [0, 0.04 * H, 0] }, 20), P.sphere(0.17 * H, '#EBD6BC', { at: [0, 0.03 * H, 0.07 * H], scale: [1.05, 0.95, 0.8] }, 18), ...[-1, 1].map((s) => P.sphere(0.05 * H, '#8A6448', { at: [s * 0.15 * H, 0.17 * H, -0.02 * H] }, 10)), P.sphere(0.035 * H, INK, { at: [0, 0.0, 0.22 * H], scale: [1.4, 1, 0.8] }, 10)], [...[-1, 1].flatMap((s) => [0, 1].map((i) => P.cyl(0.004 * H, 0.004 * H, 0.12 * H, '#FFFFFF', { at: [s * 0.1 * H, (-0.02 - i * 0.025) * H, 0.2 * H], rot: [0, 0, s * (Math.PI / 2 + (i - 0.5) * 0.3)] }, 4))), ...[-1, 1].map((s) => P.sphere(0.03 * H, '#FFB8CC', { at: [s * 0.11 * H, -0.02 * H, 0.17 * H], scale: [1, 0.6, 0.4] }, 8))])
      eyePair(0.07 * H, 0.08 * H, 0.18 * H, 0.03 * H)
      for (const [g, s] of [
        [this.sideL, -1],
        [this.sideR, 1],
      ] as const) {
        g.position.set(s * 0.15 * H, 0.42 * H, 0.12 * H)
        add(g, [P.capsule(0.045 * H, 0.08 * H, '#6E4E3A', { at: [0, -0.05 * H, 0.03 * H], rot: [0.9, 0, -s * 0.3] })])
      }
      this.tail.position.set(0, 0.12 * H, -0.18 * H)
      add(this.tail, [P.capsule(0.05 * H, 0.18 * H, '#6E4E3A', { at: [0, -0.02 * H, -0.12 * H], rot: [Math.PI / 2 + 0.3, 0, 0] })])
    }
  }

  update(dt: number, t: number, pose: Pose = {}) {
    const m = this.step(dt, pose)
    const H = this.height
    // Blinks.
    this.blinkIn -= dt
    if (this.blinkIn <= 0) {
      this.blink = 0
      this.blinkIn = 2 + Math.random() * 3.5
    }
    let lid = 1
    if (this.blink >= 0) {
      this.blink += dt / 0.16
      lid = 1 - 0.9 * bell(Math.min(1, this.blink))
      if (this.blink >= 1) this.blink = -1
    }
    if (this.eyes) this.eyes.scale.y = lid
    const breathe = 0.03 * Math.sin(t * 2.2 + this.phase)
    const bob = m.swim * Math.sin(t * 2 + this.phase) * 0.05 * H
    const wriggle = Math.sin(t * 12 + this.phase) * m.carry
    const sway = Math.sin(t * 4.2 + this.phase) * m.skate
    this.body.position.y = m.lift + bob
    this.body.scale.set(1 + m.squash * 0.6, 1 - m.squash + breathe, 1 + m.squash * 0.6)
    // The otter spins on its back (lies back first).
    const back = this.kind === 'otter' ? Math.min(1, m.spin * 3) * (m.spin > 0 ? 1 : 0) * 1.1 : 0
    this.body.rotation.set(0.12 * m.skate - back + (this.kind === 'orca' ? -0.12 * m.carry : 0), m.spin, 0.14 * sway + 0.2 * wriggle + 0.25 * m.shiver + m.flop * 1.3)
    this.head.rotation.set(-0.2 * m.flail, 0.2 * Math.sin(t * 0.8 + this.phase), 0.1 * wriggle + 0.12 * m.wave)
    // Wings flap (owl: big flaps when cheering, carried or flying; loon: little ones), flippers paddle.
    const flap = this.kind === 'owl' ? Math.max(m.flail, m.carry * 0.7, m.cheer) : this.kind === 'loon' ? Math.max(m.carry * 0.6, m.cheer) : m.carry * 0.5 + m.swim * 0.3
    const beat = Math.sin(t * (this.kind === 'owl' ? 16 : 11)) * flap
    this.sideR.rotation.set(0, 0, 0.1 + flap * 0.9 + beat * 0.7 + m.wave * (1.2 + 0.4 * Math.sin(t * 14)))
    this.sideL.rotation.set(0, 0, -0.1 - flap * 0.9 - beat * 0.7)
    if (this.kind === 'orca') this.tail.rotation.x = 0.35 * Math.sin(t * (3 + m.carry * 6) + this.phase) * (0.5 + m.swim + m.carry)
    else this.tail.rotation.y = 0.3 * Math.sin(t * 3 + this.phase) * (0.4 + m.carry)
    void H
  }
}

export type Actor = RigActor | CodeActor

/** Builds any actor in the finale. `height` overrides its usual size (the toy-map pieces are bigger). */
export function makeActor(bag: Bag, id: ActorId, opts: { height?: number; stick?: boolean } = {}): Actor {
  const voice = VOICE[id]
  switch (id) {
    case 'owl':
      return new CodeActor(bag, id, opts.height ?? 0.75, 'owl', voice)
    case 'loon':
      return new CodeActor(bag, id, opts.height ?? 0.7, 'loon', voice)
    case 'orca':
      return new CodeActor(bag, id, opts.height ?? 1.2, 'orca', voice)
    case 'otter':
      return new CodeActor(bag, id, opts.height ?? 0.6, 'otter', voice)
    default:
      return new RigActor(bag, id, { height: opts.height, stick: opts.stick, voice })
  }
}

/** Whose voice (cast.json) each one talks in. */
export const VOICE: Partial<Record<ActorId, string>> = { maple: 'maple', moose: 'moose', raccoon: 'raccoon', owl: 'owl', otter: 'otter', grizzly: 'bear', spirit: 'bear', squirrel: 'chipmunk' }

/** A little wobble for squashy things (re-exported for the worlds). */
export { wobble }
