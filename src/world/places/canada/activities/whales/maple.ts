// Maple the beaver on the chibi rig (engine3d/characters/animal.ts, her look in characters/looks.ts), dressed for the
// boat: a little yellow life jacket with white straps over her pink scarf, and binoculars on a strap round her neck.
// She stands at the wheel (her paws on its rim, leaning into the turns) and acts out what happens: a wave, a cheer with
// a hop, a point at a spout, the binoculars up to her eyes, a tail slap on the deck, and a soaking (she droops, eyes
// shut, then shakes the water off). Every action eases in and settles; her face blinks and her mouth opens with her
// own voice (engine3d/characters/face.ts).
//
// Rig frame: she faces +z; armR is on +x (her left), armL on -x. A positive rotation.z swings armR out and up (armL
// takes a negative one); a negative rotation.x swings either arm forward.
import { Euler, Group, Quaternion, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { CANADA_LOOKS } from '../../characters/looks'

/** How tall she stands in the boat (the lab's Maple is 0.85 m; bigger here so she reads from the chase camera). */
export const MAPLE_H = 1.25
const JACKET = '#FFC93C'
const JACKET_DARK = '#F2A81E'
const STRAP = '#FFFFFF'
const BUCKLE = '#FF6FA8'

const WAVE_S = 1.5
const CHEER_S = 1.9
const SLAP_S = 0.95
const LOOK_S = 2.3
const POINT_S = 2.2
const SOAK_S = 2.6
const WOBBLE_S = 0.9

const Y_DOWN = new Vector3(0, -1, 0)
const qa = new Quaternion()
const qb = new Quaternion()
const eu = new Euler()
const tv = new Vector3()

export interface MaplePose {
  /** The boat turning, -1..1 (+ = to her left): her paws turn the wheel and she leans into it. */
  turn: number
  /** Something to look at (world), or null: straight ahead. */
  look: Vector3 | null
}

export class Maple {
  readonly rig: Rig
  readonly root: Group
  readonly height = MAPLE_H
  private life: FaceLife
  private binos: Group
  private phase = Math.random() * 6
  private waveT = -1
  private cheerT = -1
  private slapT = -1
  private lookT = -1
  private pointT = -1
  private soakT = -1
  private wobbleT = -1
  private point = new Vector3()
  private yaw = 0
  private pitch = 0
  /** A tail slap hits the deck this frame (the world thumps). */
  slapped = false

  constructor(bag: Bag) {
    this.rig = buildAnimal({ ...CANADA_LOOKS.maple, height: MAPLE_H }, bag)
    this.root = this.rig.root
    // (The boat's floor is under her: no blob shadow of her own.)
    this.root.children[0].visible = false
    this.life = new FaceLife(this.rig, 'maple')
    const H = MAPLE_H
    const c = CANADA_LOOKS.maple.chub ?? 1
    const round: [number, number, number] = [c, 1, 1 + (c - 1) * 0.8]
    // ---- The life jacket: a puffy yellow vest round her middle, two white straps and a pink buckle, a collar roll.
    this.rig.body.add(
      solidMix(
        [
          P.capsule(0.176 * H, 0.07 * H, JACKET, { at: [0, 0.36 * H, 0], scale: round }),
          P.torus(0.15 * H, 0.03 * H, JACKET_DARK, { at: [0, 0.5 * H, -0.01 * H], rot: [Math.PI / 2, 0, 0], scale: [c, 1, 1] }),
          ...[-1, 1].map((s) => P.box(0.05 * H, 0.03 * H, 0.03 * H, JACKET_DARK, { at: [s * 0.03 * H, 0.38 * H, 0.19 * H * round[2]], rot: [0, s * 0.15, 0] })),
        ],
        [
          ...[0.31, 0.42].map((y) => P.torus(0.176 * H, 0.012 * H, STRAP, { at: [0, y * H, 0], rot: [Math.PI / 2, 0, 0], scale: [c * 1.04, 1.04 * round[2], 1] })),
          P.rbox(0.07 * H, 0.05 * H, 0.03 * H, 0.01 * H, BUCKLE, { at: [0, 0.31 * H, 0.2 * H * round[2]] }),
          P.rbox(0.07 * H, 0.05 * H, 0.03 * H, 0.01 * H, BUCKLE, { at: [0, 0.42 * H, 0.2 * H * round[2]] }),
        ],
        bag,
        2.5,
      ),
    )
    // ---- Binoculars on their strap: on her chest, lifted to her eyes for a look (head-local, so they turn with her).
    this.binos = solid(
      merge([
        P.cyl(0.04 * H, 0.04 * H, 0.1 * H, '#4A4458', { at: [0.045 * H, 0, 0], rot: [Math.PI / 2, 0, 0] }, 12),
        P.cyl(0.04 * H, 0.04 * H, 0.1 * H, '#4A4458', { at: [-0.045 * H, 0, 0], rot: [Math.PI / 2, 0, 0] }, 12),
        P.box(0.05 * H, 0.03 * H, 0.05 * H, '#6B6380'),
        ...[-1, 1].map((s) => P.cyl(0.03 * H, 0.03 * H, 0.012 * H, '#BFE9F7', { at: [s * 0.045 * H, 0, 0.052 * H], rot: [Math.PI / 2, 0, 0] }, 12)),
      ]),
      bag,
      2,
    )
    this.rig.head.add(this.binos)
  }

  // ---- Actions (each one plays by itself; a new one takes over smoothly).
  wave() {
    if (this.cheerT < 0 && this.soakT < 0) this.waveT = 0
  }
  cheer() {
    if (this.soakT >= 0 && this.soakT < SOAK_S * 0.8) return
    this.cheerT = 0
    this.waveT = -1
  }
  slap() {
    this.slapT = 0
    this.slapped = false
  }
  /** Binoculars up for a look. */
  spot() {
    if (this.cheerT < 0 && this.soakT < 0) this.lookT = 0
  }
  /** Points at something (world) for a moment: "Look, there!" */
  pointAt(at: Vector3) {
    this.point.copy(at)
    if (this.soakT < 0) this.pointT = 0
  }
  /** Soaked by a whale's sneeze: she droops, eyes shut, then shakes the water off. */
  soak() {
    this.soakT = 0
    this.lookT = this.waveT = this.pointT = this.cheerT = -1
  }
  /** A bump: she wobbles and grabs the wheel. */
  wobble() {
    this.wobbleT = 0
  }
  get soaked() {
    return this.soakT >= 0
  }
  get shaking() {
    return this.soakT >= SOAK_S * 0.5
  }
  /** Her head in the world (drips fly off it). */
  headAt(out: Vector3) {
    return this.rig.head.localToWorld(out.set(0, this.rig.face.headY, 0))
  }

  /** `wheel`: where the wheel's rim is for each paw, body-local (the boat turns it); null: hands free. */
  update(dt: number, t: number, pose: MaplePose) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    const tick = (v: number, len: number) => (v < 0 ? -1 : v + dt > len ? -1 : v + dt)
    const wasSlap = this.slapT
    this.waveT = tick(this.waveT, WAVE_S)
    this.cheerT = tick(this.cheerT, CHEER_S)
    this.lookT = tick(this.lookT, LOOK_S)
    this.pointT = tick(this.pointT, POINT_S)
    this.soakT = tick(this.soakT, SOAK_S)
    this.wobbleT = tick(this.wobbleT, WOBBLE_S)
    this.slapT = tick(this.slapT, SLAP_S)
    if (wasSlap >= 0 && wasSlap < 0.45 * SLAP_S && (this.slapT >= 0.45 * SLAP_S || this.slapT < 0)) this.slapped = true

    const ease = (rate: number) => 1 - Math.exp(-dt * rate)
    const turn = clamp(pose.turn, -1, 1)
    // ---- The body: breathing, leaning into the turn, a cheer's hops (crouch, up, land with a squash), a droop, a
    // shake, a wobble.
    const breathe = 0.02 * Math.sin(t * 2.4 + this.phase)
    let lift = 0
    let squash = 0
    if (this.cheerT >= 0) {
      const p = this.cheerT / CHEER_S
      // Two hops: each a crouch, a jump, a squashy landing.
      const h = (p * 2) % 1
      const env = bell(span(p, 0, 1)) ** 0.3
      lift = env * 0.16 * bell(span(h, 0.2, 0.8))
      squash = env * (h < 0.2 ? 0.14 * bell(h / 0.4) : h > 0.8 ? 0.12 * bell((h - 0.8) / 0.4) : -0.06 * bell(span(h, 0.2, 0.8)))
    }
    const droop = this.soakT >= 0 ? bell(span(this.soakT, 0, SOAK_S * 0.55)) : 0
    const shakeK = this.soakT >= SOAK_S * 0.5 ? 1 - span(this.soakT, SOAK_S * 0.5, SOAK_S) : 0
    const shake = Math.sin(this.soakT * 38) * 0.4 * shakeK
    const wob = this.wobbleT >= 0 ? Math.sin(this.wobbleT * 16) * 0.18 * (1 - this.wobbleT / WOBBLE_S) : 0
    squash += droop * 0.12
    body.position.y = lift
    body.scale.set(1 + squash * 0.6, 1 - squash + breathe, 1 + squash * 0.6)
    body.rotation.set(droop * 0.15, shake, -turn * 0.12 + wob)

    // ---- Her head: looks at what's interesting (eased), tips with the droop, lags the shake.
    let yaw = 0
    let pitch = 0
    if (pose.look) {
      head.updateWorldMatrix(true, false)
      const local = this.root.worldToLocal(tv.copy(pose.look))
      yaw = clamp(Math.atan2(local.x, local.z), -1.2, 1.2)
      pitch = clamp(-Math.atan2(local.y - 1, Math.hypot(local.x, local.z)) * 0.5, -0.35, 0.25)
    }
    if (this.pointT >= 0) {
      const local = this.root.worldToLocal(tv.copy(this.point))
      yaw = clamp(Math.atan2(local.x, local.z), -1.2, 1.2)
    }
    this.yaw += (yaw - this.yaw) * ease(5)
    this.pitch += (pitch - this.pitch) * ease(5)
    head.rotation.set(this.pitch + droop * 0.35, this.yaw - shake * 0.8, -wob * 0.6 + turn * 0.05)

    // ---- The binoculars: on her chest, or up at her eyes.
    const H = MAPLE_H
    const lookK = this.lookT >= 0 ? bell(span(this.lookT / LOOK_S, 0, 1)) ** 0.35 : 0
    const R = this.rig.face.R
    const eyeY = this.rig.face.headY + 0.05 * R
    this.binos.position.set(0, -0.13 * H + lookK * (eyeY + 0.13 * H), 0.2 * H + lookK * (R * 1.02 - 0.2 * H))
    this.binos.rotation.x = 0.3 * (1 - lookK)

    // ---- Her paws: on the wheel (turning it), waving, up in a cheer, pointing, holding the binoculars, or limp.
    // The wheel pose: both forward, the turn lifting one paw and dropping the other.
    const steer = (s: number) => ({ x: -1.25 + s * turn * 0.35, z: s * 0.12 })
    const armRest = (s: number) => {
      // s = +1 for armR (+x), -1 for armL.
      let { x, z } = steer(s)
      // Cheer: both up high, waggling.
      if (this.cheerT >= 0) {
        const k = bell(span(this.cheerT / CHEER_S, 0, 1)) ** 0.4
        x = x * (1 - k) - 0.3 * k
        z = z * (1 - k) + s * (2.6 + 0.2 * Math.sin(this.cheerT * 18 + s)) * k
      }
      // Binoculars: both paws up to her face.
      if (lookK > 0) {
        x = x * (1 - lookK) - 2.4 * lookK
        z = z * (1 - lookK) - s * 0.35 * lookK
      }
      // Soaked: arms hang limp, then flap with the shake.
      if (droop > 0 || shakeK > 0) {
        const k = Math.max(droop, shakeK)
        x = x * (1 - k) + 0.1 * k
        z = z * (1 - k) + s * (0.15 + shakeK * (0.6 + 0.4 * Math.sin(this.soakT * 30))) * k
      }
      return { x, z }
    }
    const arms: [Group, number][] = [
      [armR, 1],
      [armL, -1],
    ]
    for (const [a, s] of arms) {
      const r = armRest(s)
      let x = r.x
      let z = r.z
      // Wave (her left paw, armR).
      if (s === 1 && this.waveT >= 0) {
        const k = bell(span(this.waveT / WAVE_S, 0, 1)) ** 0.5
        x = x * (1 - k) - 0.2 * k
        z = z * (1 - k) + (2.5 + 0.45 * Math.sin(this.waveT * 15)) * k
      }
      eu.set(x, 0, z)
      a.quaternion.setFromEuler(eu)
      // Point: the paw on that side swings out at the thing.
      if (this.pointT >= 0) {
        const local = this.rig.body.worldToLocal(tv.copy(this.point))
        const side = local.x >= 0 ? 1 : -1
        if (side === s) {
          const k = bell(span(this.pointT / POINT_S, 0, 1)) ** 0.4
          local.sub(a.position).setY(Math.max(local.y - a.position.y, 0.3 * Math.hypot(local.x, local.z)))
          qb.setFromUnitVectors(Y_DOWN, local.normalize())
          qa.copy(a.quaternion)
          a.quaternion.copy(qa.slerp(qb, k))
        }
      }
    }

    // ---- The tail: a lazy wag; a slap swings it up and down onto the deck (with a squash at the hit).
    if (tail) {
      if (this.slapT >= 0) {
        const q = this.slapT / SLAP_S
        tail.rotation.x = q < 0.3 ? 1.1 * Math.sin((q / 0.3) * Math.PI * 0.5) : q < 0.45 ? 1.1 - 1.25 * ((q - 0.3) / 0.15) : -0.15 * (1 - span(q, 0.45, 1))
      } else tail.rotation.x = 0.05 + Math.sin(t * 2.1 + this.phase) * 0.06
      tail.rotation.y = Math.sin(t * 1.3 + this.phase) * 0.18
    }
  }
}
