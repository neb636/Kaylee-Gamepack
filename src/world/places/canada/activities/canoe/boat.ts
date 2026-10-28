// Red Canoe's canoe and Maple: a red cedar-strip canoe (a real canoe's shape: long and narrow, pointed at both ends, the
// ends sweeping up, wooden gunwales and thwarts, little decks at the tips), with Maple the beaver on the chibi rig
// (engine3d/characters/animal.ts, CANADA_LOOKS.maple) sitting in the stern in a pink life jacket. Kaylee's finger moves
// the paddle's blade (the world says where: paddle.ts); Maple's paws hold the shaft, one on the grip, one down low, and
// her body leans into each stroke. She also waves, cheers (a little hop on her seat, with a crouch first), slaps her
// tail, gets dizzy (her head goes round, stars circle it), looks at whatever is interesting, blinks, and talks with
// her own voice (engine3d/characters/face.ts).
//
// Local frame: +z is the bow (forward), +x is the canoe's left (facing +z, the right-hand side is -x).
import { BufferGeometry, Float32BufferAttribute, Group, Quaternion, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { CANADA_LOOKS } from '../../characters/looks'

export const CANOE_LEN = 4.6
const RED = '#E8443F'
const RED_DARK = '#C23634'
const CREAM = '#F6DCC0'
const WOOD = '#D2A67E'
const WOOD_DARK = '#A97A55'
const VEST = PAL.hotpink
const BLADE = PAL.pink

/** The hull's shape: half its width amidships, the gunwale's height there, how deep it is, and how much the ends rise. */
const W = 0.5
const GUN = 0.42
const DEPTH = 0.4
const SHEER = 0.26
/** Where Maple sits (the stern seat), how tall she is, and how long the paddle is. */
export const SEAT_Z = -1.3
const MAPLE_H = 1.2
const SIT_Y = 0.17
const PADDLE_LEN = 1.9
const WAVE_S = 1.5
const CHEER_S = 1.9
const SLAP_S = 0.9
const DIZZY_S = 3.2

const tv = new Vector3()
const tv2 = new Vector3()
const tq = new Quaternion()
const tq2 = new Quaternion()

/** Half the hull's width, the gunwale's height and the keel's depth below it at z (along the canoe). */
function hullAt(z: number) {
  const u = clamp((2 * z) / CANOE_LEN, -1, 1)
  return { w: W * Math.max(0, 1 - u * u) ** 0.62, g: GUN + SHEER * u ** 4, d: DEPTH * Math.max(0, 1 - u * u) ** 0.35 + 0.02 }
}

/** One surface of the hull swept from bow to stern: a U across the canoe at each station, `inset` in from the outside
 *  (the inside surface is inset and shallower, and flat at the tips, where the little decks are). */
function sweep(inset: number, inner: boolean) {
  const S = 40
  const M = 14
  const pos: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= S; i++) {
    const z = -CANOE_LEN / 2 + (CANOE_LEN * i) / S
    const { w, g, d } = hullAt(z)
    const u = Math.abs((2 * z) / CANOE_LEN)
    // (Inside, the floor rises to the gunwale near the tips: the decks.)
    const deck = inner ? span(u, 0.72, 0.84) : 0
    const wi = Math.max(0, w - inset)
    const di = Math.max(0, d - inset * 1.2) * (1 - deck)
    for (let j = 0; j <= M; j++) {
      const a = Math.PI + (Math.PI * j) / M
      pos.push(Math.cos(a) * wi, g + Math.sin(a) * di - (inner ? 0.004 : 0), z)
    }
  }
  for (let i = 0; i < S; i++)
    for (let j = 0; j < M; j++) {
      const a = i * (M + 1) + j
      const b = a + M + 1
      // Outside faces out (down and away), inside faces in (up toward Maple).
      if (inner) idx.push(a, b, a + 1, a + 1, b, b + 1)
      else idx.push(a, a + 1, b, a + 1, b + 1, b)
    }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** A wooden rail along the gunwale on one side (a chain of short boxes following the sheer). */
function gunwale(side: number) {
  const parts: BufferGeometry[] = []
  const S = 18
  for (let i = 0; i < S; i++) {
    const z0 = -CANOE_LEN / 2 + 0.12 + ((CANOE_LEN - 0.24) * i) / S
    const z1 = -CANOE_LEN / 2 + 0.12 + ((CANOE_LEN - 0.24) * (i + 1)) / S
    const a = hullAt(z0)
    const b = hullAt(z1)
    const x0 = side * a.w
    const x1 = side * b.w
    const len = Math.hypot(x1 - x0, b.g - a.g, z1 - z0)
    const yaw = Math.atan2(x1 - x0, z1 - z0)
    const pitch = -Math.atan2(b.g - a.g, Math.hypot(x1 - x0, z1 - z0))
    parts.push(P.box(0.07, 0.05, len + 0.02, WOOD, { at: [(x0 + x1) / 2, (a.g + b.g) / 2 + 0.01, (z0 + z1) / 2], rot: [pitch, yaw, 0] }))
  }
  return parts
}

export interface CanoePose {
  /** Forward speed (m/s): the bow lifts a little. */
  speed: number
  /** Turning (rad/s): the canoe leans out of the turn. */
  spin: number
  /** Where the blade should be (canoe-local), or null: the paddle rests across her lap. */
  blade: Vector3 | null
  /** Something to look at (world), or null: straight ahead. */
  look: Vector3 | null
}

export class Canoe {
  /** Moved and turned by the world. */
  readonly root = new Group()
  /** Rocks and bobs on the water. */
  readonly hull = new Group()
  /** Maple, sitting in the stern (the rig's root). */
  readonly maple: Group
  readonly height = MAPLE_H
  readonly rig: Rig
  private life: FaceLife
  private stars = new Group()
  private paddle = new Group()
  private blade = new Vector3(0.62, 0.48, SEAT_Z + 0.42)
  private rollV = 0
  private roll = 0
  private waveT = -1
  private cheerT = -1
  private slapT = -1
  private dizzyT = -1
  private stroke = 0
  private lastBlade = new Vector3()
  private phase = Math.random() * 6
  /** A tail slap hits the water now (the world splashes). */
  slapped = false

  constructor(bag: Bag) {
    this.root.add(this.hull)
    const L = CANOE_LEN
    // ---- The canoe: the red outside, the cream inside, wooden gunwales, thwarts and the two seats.
    const thwart = (z: number, y: number, c: string, deep = 0.1) => {
      const { w } = hullAt(z)
      return P.box(w * 2 - 0.06, 0.05, deep, c, { at: [0, y, z] })
    }
    this.hull.add(
      solidMix(
        [
          bake(sweep(0, false), RED),
          ...gunwale(1),
          ...gunwale(-1),
          thwart(SEAT_Z, GUN - 0.1, WOOD_DARK, 0.3),
          thwart(1.35, GUN - 0.08, WOOD_DARK, 0.26),
          thwart(0, GUN - 0.02, WOOD),
          // The backpack in the bow, its pocket and a rolled-up mat on top.
          P.rbox(0.42, 0.4, 0.3, 0.1, PAL.lavender, { at: [0, 0.38, 0.9] }),
          P.rbox(0.3, 0.16, 0.07, 0.04, PAL.lavenderDark, { at: [0, 0.32, 1.07] }),
          P.cyl(0.08, 0.08, 0.44, PAL.mint, { at: [0, 0.62, 0.88], rot: [0, 0, Math.PI / 2] }, 12),
        ],
        [
          bake(sweep(0.035, true), CREAM),
          // The white stripe along the outside under the gunwale, and the darker tips.
          ...[1, -1].map((s) => P.box(0.015, 0.05, L * 0.62, '#FFFFFF', { at: [s * (W + 0.004), GUN - 0.07, 0] })),
          ...[1, -1].map((s) => P.sphere(0.07, RED_DARK, { at: [0, GUN + SHEER - 0.02, s * (L / 2 - 0.05)], scale: [0.6, 1.2, 1] }, 10)),
        ],
        bag,
        2,
      ),
    )

    // ---- Maple on the rig, sitting on the stern seat facing the bow, in her pink life jacket.
    this.rig = buildAnimal({ ...CANADA_LOOKS.maple, height: MAPLE_H }, bag)
    this.maple = this.rig.root
    this.maple.children[0].visible = false // (the rig's own blob shadow: she sits in the canoe)
    this.maple.position.set(0, SIT_Y, SEAT_Z)
    this.hull.add(this.maple)
    const H = MAPLE_H
    this.rig.body.add(
      solidMix(
        [P.cyl(0.255 * H, 0.27 * H, 0.2 * H, VEST, { at: [0, 0.3 * H, 0.005 * H], scale: [1.02, 1, 0.98] }, 18), P.box(0.06 * H, 0.14 * H, 0.03 * H, VEST, { at: [0.11 * H, 0.43 * H, 0.17 * H] }), P.box(0.06 * H, 0.14 * H, 0.03 * H, VEST, { at: [-0.11 * H, 0.43 * H, 0.17 * H] })],
        [P.box(0.05 * H, 0.16 * H, 0.012 * H, '#FFFFFF', { at: [0.06 * H, 0.3 * H, 0.27 * H] }), P.box(0.05 * H, 0.16 * H, 0.012 * H, '#FFFFFF', { at: [-0.06 * H, 0.3 * H, 0.27 * H] }), P.rbox(0.09 * H, 0.03 * H, 0.015 * H, 0.008 * H, PAL.butter, { at: [0, 0.3 * H, 0.275 * H] })],
        bag,
        2,
      ),
    )
    this.life = new FaceLife(this.rig, 'maple')
    // Dizzy stars round her head.
    for (let i = 0; i < 4; i++) {
      const s = solid(merge([P.sphere(0.055, PAL.butter, { scale: [1, 1, 0.45] }), P.cone(0.03, 0.08, PAL.butter, { at: [0, 0.07, 0] }, 5), P.cone(0.03, 0.08, PAL.butter, { at: [0, -0.07, 0], rot: [Math.PI, 0, 0] }, 5)]), bag, 1.2)
      s.position.set(Math.cos((i * Math.PI) / 2) * 0.34, 0, Math.sin((i * Math.PI) / 2) * 0.34)
      this.stars.add(s)
    }
    this.stars.position.y = this.rig.face.headY + this.rig.face.R * 1.25
    this.stars.visible = false
    this.rig.head.add(this.stars)

    // ---- The paddle: a wooden shaft, a pink blade, a T-grip on top (its origin is the blade's middle).
    this.paddle.add(
      solid(
        merge([
          P.cyl(0.028, 0.028, PADDLE_LEN - 0.2, WOOD, { at: [0, (PADDLE_LEN - 0.2) / 2 + 0.2, 0] }, 8),
          P.rbox(0.2, 0.52, 0.045, 0.06, BLADE, { at: [0, 0.06, 0] }),
          P.cyl(0.034, 0.02, 0.12, WOOD, { at: [0, 0.36, 0] }, 8),
          P.rbox(0.15, 0.05, 0.06, 0.02, WOOD_DARK, { at: [0, PADDLE_LEN, 0] }),
        ]),
        bag,
        1.6,
      ),
    )
    this.hull.add(this.paddle)
  }

  // ---- Actions.
  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  cheer() {
    this.cheerT = 0
    this.waveT = -1
  }
  slap() {
    this.slapT = 0
    this.slapped = false
  }
  dizzy() {
    if (this.dizzyT < 0) this.dizzyT = 0
  }
  get isDizzy() {
    return this.dizzyT >= 0
  }
  get busy() {
    return this.waveT >= 0 || this.cheerT >= 0 || this.slapT >= 0 || this.dizzyT >= 0
  }
  /** A stroke's push sideways (the canoe rocks). */
  rock(k: number) {
    this.rollV += k
  }

  /** Where the blade is now (canoe-local). */
  bladeAt(out: Vector3) {
    return out.copy(this.blade)
  }

  update(dt: number, t: number, pose: CanoePose) {
    const ease = (rate: number) => 1 - Math.exp(-dt * rate)
    const { body, head, armL, armR, tail, eyes } = this.rig
    const H = MAPLE_H
    // ---- The hull: rocks back level after a stroke, leans out of turns, the bow lifts with speed.
    this.rollV += (-60 * this.roll - 5 * this.rollV) * dt
    this.roll += this.rollV * dt
    this.hull.rotation.z = clamp(this.roll + pose.spin * 0.05, -0.3, 0.3)
    this.hull.rotation.x = -clamp(pose.speed * 0.012, -0.03, 0.06)
    this.hull.position.y = Math.sin(t * 1.7) * 0.02

    // ---- Actions' clocks.
    const tick = (v: number, len: number) => (v < 0 ? -1 : v + dt > len ? -1 : v + dt)
    this.waveT = tick(this.waveT, WAVE_S)
    this.cheerT = tick(this.cheerT, CHEER_S)
    const wasSlap = this.slapT
    this.slapT = tick(this.slapT, SLAP_S)
    if (wasSlap >= 0 && wasSlap < 0.42 && (this.slapT >= 0.42 || this.slapT < 0)) this.slapped = true
    this.dizzyT = tick(this.dizzyT, DIZZY_S)
    this.life.update(dt)

    // ---- The blade glides to where the world says (or the paddle rests across her lap while she cheers).
    const cheering = this.cheerT >= 0
    const rest = !pose.blade || cheering
    const want = rest ? tv.set(0.66, 0.5, SEAT_Z + 0.5) : tv.copy(pose.blade!)
    this.lastBlade.copy(this.blade)
    this.blade.lerp(want, ease(rest ? 6 : 26))
    // How hard she's pulling right now (the blade moving back in the water): her body leans into it.
    const back = dt > 0 ? clamp((this.lastBlade.z - this.blade.z) / dt / 3, 0, 1) : 0
    this.stroke += ((this.blade.y < 0.1 ? back : 0) - this.stroke) * ease(8)
    const side = this.blade.x >= 0 ? 1 : -1

    // ---- Her body: sits, breathes, twists toward the paddle's side and leans into a stroke; a cheer is a hop on the
    // seat (a crouch first, then up, then a squashy landing); dizzy, she sways round.
    const breathe = 0.02 * Math.sin(t * 2.4 + this.phase)
    let hop = 0
    let squash = 0
    if (cheering) {
      const c = this.cheerT
      squash = c < 0.18 ? 0.12 * bell(c / 0.36) : 0
      const air = span(c, 0.18, 0.62)
      hop = bell(air) * 0.12 + (c > 0.62 ? Math.abs(Math.sin((c - 0.62) * 9)) * 0.04 * (1 - span(c, 0.62, CHEER_S)) : 0)
      if (c > 0.62 && c < 0.8) squash = 0.08 * bell(span(c, 0.62, 0.8))
    }
    const dz = this.dizzyT >= 0 ? bell(span(this.dizzyT / DIZZY_S, 0, 1)) : 0
    body.position.y = hop
    body.scale.set(1 + squash * 0.5, 1 - squash + breathe, 1 + squash * 0.5)
    const twist = rest ? 0 : clamp(this.blade.x * 0.28, -0.32, 0.32)
    body.rotation.y += (twist + Math.sin(this.dizzyT * 7) * 0.2 * dz - body.rotation.y) * ease(8)
    body.rotation.x += (this.stroke * 0.22 - (rest ? 0 : 0.04) - body.rotation.x) * ease(10)
    body.rotation.z += (-side * this.stroke * 0.08 * (rest ? 0 : 1) + Math.cos(this.dizzyT * 7) * 0.12 * dz - body.rotation.z) * ease(8)

    // ---- The paddle: the top paw (away from the blade) holds the grip up by her shoulder; the shaft runs from the
    // blade through it; the low paw holds the shaft down near the blade.
    this.root.updateMatrixWorld(true)
    const top = side > 0 ? armL : armR
    const low = side > 0 ? armR : armL
    const sTop = this.toHull(top.getWorldPosition(tv2), new Vector3())
    const sLow = this.toHull(low.getWorldPosition(tv2), new Vector3())
    const grip = rest ? new Vector3(-0.42, 0.62, SEAT_Z + 0.42) : new Vector3(sTop.x - side * 0.08, sTop.y + 0.2, sTop.z + 0.2)
    const topPaw = this.aimArm(top, sTop, grip, dt, rest ? 8 : 22)
    const shaft = topPaw.clone().sub(this.blade).normalize()
    this.paddle.position.copy(this.blade)
    this.paddle.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), shaft)
    // The low paw: the point on the shaft nearest its shoulder (a little toward the blade).
    const along = clamp(sLow.clone().sub(this.blade).dot(shaft) - 0.06, 0.35, PADDLE_LEN - 0.4)
    const lowAt = this.blade.clone().addScaledVector(shaft, along)
    this.aimArm(low, sLow, lowAt, dt, rest ? 8 : 22)
    // A wave (the paw on the camera's side, away from the blade) or a cheer (both paws up) take over from the paddle.
    const w = this.waveT >= 0 ? bell(span(this.waveT / WAVE_S, 0, 1)) ** 0.6 : 0
    if (w > 0) {
      const waving = side > 0 ? armL : armR
      const s = waving === armR ? 1 : -1
      const sh = this.toHull(waving.getWorldPosition(tv2), new Vector3())
      const up = sh.clone().add(new Vector3(s * (0.16 + Math.sin(this.waveT * 13) * 0.08), 0.3, 0.06))
      this.aimArm(waving, sh, up, dt, 30, w)
    }
    if (cheering) {
      const k = bell(span(this.cheerT / CHEER_S, 0, 1)) ** 0.4
      for (const [a, s] of [[armR, 1], [armL, -1]] as const) {
        const sh = this.toHull(a.getWorldPosition(tv2), new Vector3())
        this.aimArm(a, sh, sh.clone().add(new Vector3(s * 0.14, 0.3, 0.05 + Math.sin(this.cheerT * 10 + s) * 0.04)), dt, 30, k)
      }
    }

    // ---- Her head: looks at what's interesting (and up at the paddle's side mid-stroke), wobbles round when dizzy,
    // tips to the side as she waves.
    let yaw = 0
    let pitch = 0
    if (pose.look) {
      const local = this.toHull(tv.copy(pose.look), new Vector3())
      yaw = clamp(Math.atan2(local.x, local.z - SEAT_Z) - body.rotation.y, -1.1, 1.1)
      pitch = clamp(-Math.atan2(local.y - 1, Math.hypot(local.x, local.z - SEAT_Z)) * 0.5, -0.35, 0.3)
    }
    let roll = -0.15 * w
    if (dz > 0) {
      yaw = Math.sin(this.dizzyT * 7) * 0.5 * dz
      pitch = Math.cos(this.dizzyT * 7) * 0.22 * dz
      roll = Math.sin(this.dizzyT * 7 + 1) * 0.28 * dz
    }
    if (cheering) pitch = -0.25 * bell(span(this.cheerT / CHEER_S, 0, 1))
    head.rotation.y += (yaw - head.rotation.y) * ease(dz > 0 ? 14 : 5)
    head.rotation.x += (pitch - head.rotation.x) * ease(dz > 0 ? 14 : 5)
    head.rotation.z += (roll - head.rotation.z) * ease(8)
    this.stars.visible = dz > 0.02
    if (this.stars.visible) {
      this.stars.rotation.y = this.dizzyT * 6
      this.stars.scale.setScalar(0.4 + dz * 0.6)
    }
    if (dz > 0.2) eyes.scale.y = 0.18

    // ---- The tail: lies out over the stern seat and wags; a slap swings it up (anticipation), down hard, and settles.
    if (tail) {
      if (this.slapT >= 0) {
        const q = this.slapT / SLAP_S
        tail.rotation.x = q < 0.3 ? 1.0 * (q / 0.3) : q < 0.45 ? 1.0 - 1.35 * ((q - 0.3) / 0.15) : -0.35 * (1 - span(q, 0.45, 1))
      } else tail.rotation.x = 0.12 + Math.sin(t * 2.1) * 0.06
      tail.rotation.y = Math.sin(t * 1.3) * 0.18
    }
    void H
  }

  /** A world point in the hull's frame. */
  private toHull(p: Vector3, out: Vector3) {
    return this.hull.worldToLocal(out.copy(p))
  }

  /**
   * Turns an arm (on its shoulder pivot) to reach toward `target` (hull-local), stretching a little if it's far
   * (a toy's arms are short), easing there at `rate`. `weight` blends it in over the arm's other pose. Returns where the
   * paw ends up (hull-local).
   */
  private aimArm(arm: Group, shoulder: Vector3, target: Vector3, dt: number, rate: number, weight = 1) {
    const H = MAPLE_H
    // The arm hangs along this (arm-local), and the paw sits this far out.
    const rest = tv.set(arm === this.rig.armR ? 0.05 * H : -0.05 * H, -0.14 * H, 0.005 * H)
    const reach = rest.length()
    const restDir = rest.clone().normalize()
    const d = target.clone().sub(shoulder)
    const len = d.length()
    // Hull-local direction into the arm's parent (the body) frame.
    this.hull.getWorldQuaternion(tq)
    arm.parent!.getWorldQuaternion(tq2)
    const dir = d.normalize().applyQuaternion(tq).applyQuaternion(tq2.invert())
    const q = new Quaternion().setFromUnitVectors(restDir, dir)
    const k = (1 - Math.exp(-dt * rate)) * weight
    arm.quaternion.slerp(q, weight >= 1 ? k : Math.min(1, k * 3))
    const stretch = clamp(len / reach, 1, 1.9)
    arm.scale.y += (stretch - arm.scale.y) * k
    arm.scale.x = arm.scale.z = 1
    return shoulder.clone().add(target.clone().sub(shoulder).normalize().multiplyScalar(reach * arm.scale.y))
  }

  /** The tail's tip in the world (a slap splashes there). */
  tailTip(out: Vector3) {
    const tail = this.rig.tail
    if (!tail) return this.hull.localToWorld(out.set(0, 0.3, SEAT_Z - 0.5))
    return tail.localToWorld(out.set(0, 0.07 * MAPLE_H, -0.45 * MAPLE_H))
  }
  /** The blade in the world. */
  bladeWorld(out: Vector3) {
    return this.hull.localToWorld(out.copy(this.blade))
  }
  /** The hull's quaternion (for anchors and effects). */
  facing(out: Quaternion) {
    return this.root.getWorldQuaternion(out ?? tq)
  }
}
