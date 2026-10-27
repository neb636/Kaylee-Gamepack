// Whale Watch's boat and Maple as greybox shapes in the toon look (the art gate builds Maple on the chibi rig): a little
// Tofino whale-watching boat, the kind with fat pink tubes all round, a grey floor, a console with a windscreen and a
// wheel in the middle, an outboard motor at the back. Maple stands at the wheel in her pink life jacket, turning it as
// the boat turns, binoculars round her neck. The yellow underwater microphone sits on its reel by the stern and goes
// down on its cable when Kaylee listens.
//
// Maple waves, cheers, slaps her tail, lifts her binoculars at a spout, gets soaked by a whale's sneeze (shakes it off),
// and looks at what's interesting. The world (watch.ts) moves and tips the whole boat (`root`, `body`).
//
// Local frame: +z is the bow (forward), +x is the boat's left (facing +z, the right-hand side is -x).
import { Group, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

export const BOAT_LEN = 5.4
const TUBE = PAL.hotpink
const TUBE_DARK = '#D93E83'
const FLOOR = '#C9C2D3'
const GREY = '#8E879C'
const FUR = '#A8714A'
const FUR_LIGHT = '#E2B48A'
const TAIL = '#6E4B3B'
const TEETH = '#FF9A3C'
const MIC = PAL.gold

/** Where Maple stands, and the wheel she holds. */
const MAPLE_Z = -0.95
const WHEEL = new Vector3(0, 1.12, -0.32)
/** Just in front of her face (where the binoculars and a waving paw go). */
const MAPLE_FWD = MAPLE_Z + 0.2
/** The microphone's reel (on the boat's left, by the stern) and where the cable goes over the side. */
const REEL = new Vector3(0.78, 0.72, -1.7)
const OVER = new Vector3(1.25, 0.62, -1.7)
const WAVE_S = 1.4
const CHEER_S = 1.8
const SLAP_S = 0.9
const LOOK_S = 2.2
const SOAK_S = 2.4

const Y = new Vector3(0, 1, 0)
const tv = new Vector3()

/** A round bar along +y, one meter long, stretched between two points each frame (an arm, the cable). */
class Bone {
  readonly g = new Group()
  hand?: Group
  constructor(bag: Bag, r: number, c: string, parent: Group, hand?: string, px = 2) {
    const parts: BufferGeometry[] = [P.cyl(r, r * 0.9, 1, c, { at: [0, 0.5, 0] }, 8)]
    this.g.add(solid(merge(parts), bag, px))
    if (hand) {
      this.hand = solid(merge([P.sphere(r * 1.45, hand)]), bag, 2)
      parent.add(this.hand)
    }
    parent.add(this.g)
  }
  set(a: Vector3, b: Vector3) {
    this.g.position.copy(a)
    tv.subVectors(b, a)
    const len = tv.length()
    this.g.quaternion.setFromUnitVectors(Y, tv.multiplyScalar(1 / Math.max(1e-4, len)))
    this.g.scale.set(1, len, 1)
    this.hand?.position.copy(b)
  }
}

export interface BoatPose {
  /** Turning, -1..1 (+ = to the boat's left): the wheel turns and Maple leans. */
  turn: number
  /** Something to look at (world), or null: straight ahead. */
  look: Vector3 | null
  /** How far down the microphone is (0 = on its reel, 1 = deep under the boat). */
  mic: number
}

export class Boat {
  /** Moved and turned by the world. */
  readonly root = new Group()
  /** Pitches, rolls and squashes on the waves. */
  readonly body = new Group()
  /** Maple, standing at the wheel. */
  readonly maple = new Group()
  readonly height = 1.5
  /** The microphone at the end of its cable (the tap target, and what she hears with). */
  readonly mic = new Group()
  private head = new Group()
  private tail = new Group()
  private wheel = new Group()
  private binos = new Group()
  private armL: Bone
  private armR: Bone
  private cable: Bone
  private eyes: Group
  private waveT = -1
  private cheerT = -1
  private slapT = -1
  private lookT = -1
  private soakT = -1
  private blink = 0
  /** A tail slap hits the deck now (the world thumps). */
  slapped = false
  /** Shaking off the water now (the world flicks drips off her). */
  get shaking() {
    return this.soakT >= 0 && this.soakT > SOAK_S * 0.45
  }

  constructor(bag: Bag) {
    this.root.add(this.body)
    const L = BOAT_LEN
    // ---- The boat: pink tubes round a grey floor (round at the bow), the console, the motor.
    this.body.add(
      solid(
        merge([
          P.capsule(0.34, L - 2.2, TUBE, { at: [0.98, 0.42, -0.35], rot: [Math.PI / 2, 0, 0] }),
          P.capsule(0.34, L - 2.2, TUBE, { at: [-0.98, 0.42, -0.35], rot: [Math.PI / 2, 0, 0] }),
          P.torus(0.98, 0.34, TUBE, { at: [0, 0.42, L / 2 - 2.05], rot: [Math.PI / 2, 0, 0] }, Math.PI),
          P.rbox(2.1, 0.3, L - 1.2, 0.12, FLOOR, { at: [0, 0.18, -0.25] }),
          P.box(0.04, 0.06, L - 2.4, TUBE_DARK, { at: [1.3, 0.42, -0.35] }),
          P.box(0.04, 0.06, L - 2.4, TUBE_DARK, { at: [-1.3, 0.42, -0.35] }),
          // The console with its windscreen.
          P.rbox(0.9, 0.85, 0.6, 0.1, '#FFFFFF', { at: [0, 0.75, 0] }),
          P.rbox(0.92, 0.42, 0.06, 0.03, '#BFE9F7', { at: [0, 1.38, 0.24], rot: [-0.35, 0, 0] }),
          P.box(0.92, 0.06, 0.66, PAL.lavender, { at: [0, 1.2, 0] }),
          // The motor at the back.
          P.rbox(0.5, 0.7, 0.5, 0.12, GREY, { at: [0, 0.85, -L / 2 + 0.2] }),
          P.box(0.16, 0.7, 0.16, '#6E6880', { at: [0, 0.25, -L / 2 + 0.15] }),
          P.rbox(0.56, 0.12, 0.56, 0.05, PAL.lavenderDark, { at: [0, 1.22, -L / 2 + 0.2] }),
          // The microphone's reel.
          P.cyl(0.2, 0.2, 0.16, MIC, { at: [REEL.x, REEL.y, REEL.z], rot: [0, 0, Math.PI / 2] }, 14),
          P.cyl(0.05, 0.05, 0.3, GREY, { at: [REEL.x - 0.1, REEL.y - 0.2, REEL.z] }, 6),
        ]),
        bag,
        2,
      ),
    )
    // The wheel on the console's back, facing Maple.
    this.wheel.position.copy(WHEEL)
    this.wheel.rotation.x = -0.5
    this.wheel.add(solid(merge([P.torus(0.17, 0.03, '#4A4458', { rot: [0, 0, 0] }), P.box(0.3, 0.03, 0.03, '#4A4458'), P.box(0.03, 0.3, 0.03, '#4A4458')]), bag, 1.5))
    this.body.add(this.wheel)

    // ---- Maple, standing behind the console facing the bow.
    this.maple.position.set(0, 0.32, MAPLE_Z)
    this.body.add(this.maple)
    this.maple.add(
      solid(
        merge([
          P.sphere(0.34, FUR, { at: [0, 0.55, 0], scale: [1, 1.15, 0.92] }),
          P.cyl(0.31, 0.35, 0.36, PAL.hotpink, { at: [0, 0.62, 0] }, 14),
          P.box(0.08, 0.34, 0.04, '#FFFFFF', { at: [0.1, 0.62, 0.31] }),
          P.box(0.08, 0.34, 0.04, '#FFFFFF', { at: [-0.1, 0.62, 0.31] }),
          P.sphere(0.12, FUR, { at: [0.15, 0.1, 0.05], scale: [1, 0.7, 1.4] }),
          P.sphere(0.12, FUR, { at: [-0.15, 0.1, 0.05], scale: [1, 0.7, 1.4] }),
        ]),
        bag,
        2,
      ),
    )
    // Binoculars on their strap, on her chest (lifted to her eyes when a spout goes up).
    this.binos.position.set(0, 0.86, 0.3)
    this.binos.add(solid(merge([P.cyl(0.06, 0.06, 0.16, '#4A4458', { at: [0.07, 0, 0], rot: [Math.PI / 2, 0, 0] }, 10), P.cyl(0.06, 0.06, 0.16, '#4A4458', { at: [-0.07, 0, 0], rot: [Math.PI / 2, 0, 0] }, 10)]), bag, 1.5))
    this.maple.add(this.binos)
    // The head on its pivot (at the neck): round, a light muzzle, a dark nose, two big orange teeth, little ears.
    this.head.position.set(0, 0.92, 0.02)
    this.maple.add(this.head)
    this.head.add(
      solidMix(
        [
          P.sphere(0.27, FUR, { at: [0, 0.2, 0] }),
          P.sphere(0.15, FUR_LIGHT, { at: [0, 0.12, 0.2], scale: [1.25, 0.85, 0.9] }),
          P.sphere(0.065, '#4A3036', { at: [0, 0.2, 0.33], scale: [1.3, 0.9, 0.9] }),
          P.sphere(0.07, FUR, { at: [0.2, 0.42, -0.02] }),
          P.sphere(0.07, FUR, { at: [-0.2, 0.42, -0.02] }),
          P.rbox(0.055, 0.09, 0.03, 0.01, TEETH, { at: [0.03, 0.02, 0.31] }),
          P.rbox(0.055, 0.09, 0.03, 0.01, TEETH, { at: [-0.03, 0.02, 0.31] }),
        ],
        [P.sphere(0.04, PAL.pink, { at: [0.15, 0.13, 0.22], scale: [1, 0.6, 0.4] }), P.sphere(0.04, PAL.pink, { at: [-0.15, 0.13, 0.22], scale: [1, 0.6, 0.4] })],
        bag,
        2,
      ),
    )
    this.eyes = solid(
      merge([
        P.sphere(0.04, PAL.ink, { at: [0.1, 0.27, 0.23] }),
        P.sphere(0.04, PAL.ink, { at: [-0.1, 0.27, 0.23] }),
        P.sphere(0.014, '#FFFFFF', { at: [0.11, 0.29, 0.26] }),
        P.sphere(0.014, '#FFFFFF', { at: [-0.09, 0.29, 0.26] }),
      ]),
      bag,
      0,
    )
    this.head.add(this.eyes)
    // The flat tail out behind her, on a pivot for the slap.
    this.tail.position.set(0, 0.25, -0.28)
    this.maple.add(this.tail)
    this.tail.add(solid(merge([P.rbox(0.3, 0.06, 0.62, 0.03, TAIL, { at: [0, 0, -0.32] }), ...[0, 1, 2].map((i) => P.box(0.26, 0.065, 0.02, '#5A3B2E', { at: [0, 0, -0.15 - i * 0.16] }))]), bag, 2))
    this.armL = new Bone(bag, 0.065, FUR, this.body, FUR_LIGHT)
    this.armR = new Bone(bag, 0.065, FUR, this.body, FUR_LIGHT)

    // ---- The microphone on its cable.
    this.mic.add(solid(merge([P.capsule(0.12, 0.22, MIC), P.sphere(0.1, '#4A4458', { at: [0, -0.22, 0] }), P.torus(0.13, 0.025, '#4A4458', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
    this.body.add(this.mic)
    this.cable = new Bone(bag, 0.018, '#4A4458', this.body, undefined, 1)
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
  /** Binoculars up for a look (a spout). */
  spot() {
    if (this.cheerT < 0 && this.soakT < 0) this.lookT = 0
  }
  /** A whale sneezed on the boat: she's dripping, then shakes it off. */
  soak() {
    this.soakT = 0
    this.lookT = this.waveT = -1
  }
  get soaked() {
    return this.soakT >= 0
  }

  update(dt: number, t: number, pose: BoatPose) {
    const ease = (rate: number) => 1 - Math.exp(-dt * rate)
    const tick = (v: number, len: number) => (v < 0 ? -1 : v + dt > len ? -1 : v + dt)
    this.waveT = tick(this.waveT, WAVE_S)
    this.cheerT = tick(this.cheerT, CHEER_S)
    this.lookT = tick(this.lookT, LOOK_S)
    this.soakT = tick(this.soakT, SOAK_S)
    const wasSlap = this.slapT
    this.slapT = tick(this.slapT, SLAP_S)
    if (wasSlap >= 0 && wasSlap < 0.42 && (this.slapT >= 0.42 || this.slapT < 0)) this.slapped = true

    // ---- The wheel turns with the boat; Maple leans into the turn.
    this.wheel.rotation.z += (-pose.turn * 1.6 - this.wheel.rotation.z) * ease(8)
    this.maple.rotation.z = -pose.turn * 0.12
    // ---- Her paws: on the wheel's rim, unless she's waving, cheering or using the binoculars.
    const wz = this.wheel.rotation.z
    const rim = (a: number) => {
      const c = Math.cos(a + wz)
      const s = Math.sin(a + wz)
      // (The rim's circle, tipped back with the wheel.)
      return new Vector3(WHEEL.x + c * 0.17, WHEEL.y + s * 0.17 * Math.cos(0.5), WHEEL.z - s * 0.17 * Math.sin(0.5))
    }
    const shL = new Vector3(0.22, 0.32 + 0.82, MAPLE_Z + 0.04)
    const shR = new Vector3(-0.22, 0.32 + 0.82, MAPLE_Z + 0.04)
    let handL = rim(0.2)
    let handR = rim(Math.PI - 0.2)
    if (this.waveT >= 0) {
      const k = bell(span(this.waveT / WAVE_S, 0, 1))
      handR = shR.clone().lerp(new Vector3(-0.44 + Math.sin(this.waveT * 14) * 0.12, 1.7, MAPLE_FWD), k)
    }
    const lookK = this.lookT >= 0 ? bell(span(this.lookT / LOOK_S, 0, 1)) ** 0.4 : 0
    this.binos.position.set(0, 0.86 + lookK * 0.3, 0.3 + lookK * 0.02)
    this.binos.rotation.x = -lookK * 0.2
    if (lookK > 0) {
      handL = handL.lerp(new Vector3(0.1, 1.5, MAPLE_FWD + 0.05), lookK)
      handR = handR.lerp(new Vector3(-0.1, 1.5, MAPLE_FWD + 0.05), lookK)
    }
    if (this.cheerT >= 0) {
      const k = bell(span(this.cheerT / CHEER_S, 0, 1)) ** 0.5
      const j = Math.abs(Math.sin(this.cheerT * 9)) * 0.08
      handL = shL.clone().lerp(new Vector3(0.36, 1.85 + j, MAPLE_Z + 0.1), k)
      handR = shR.clone().lerp(new Vector3(-0.36, 1.85 + j, MAPLE_Z + 0.1), k)
    }
    const reach = (s: Vector3, h: Vector3) => {
      const d = h.clone().sub(s)
      const l = d.length()
      return l > 0.66 ? s.clone().add(d.multiplyScalar(0.66 / l)) : h
    }
    this.armL.set(shL, reach(shL, handL))
    this.armR.set(shR, reach(shR, handR))
    // Hopping when she cheers; a shake after a soaking (quick twists).
    const shake = this.soakT > SOAK_S * 0.45 ? Math.sin(this.soakT * 40) * 0.35 * (1 - span(this.soakT, SOAK_S * 0.45, SOAK_S)) : 0
    this.maple.position.y = 0.32 + (this.cheerT >= 0 ? Math.abs(Math.sin(this.cheerT * 9)) * 0.08 : 0)
    this.maple.rotation.y = shake
    // Soaked: she droops (squashes down), eyes shut, then shakes.
    const droop = this.soakT >= 0 ? bell(span(this.soakT, 0, SOAK_S * 0.5)) : 0
    this.maple.scale.set(1 + droop * 0.06, 1 - droop * 0.1, 1)

    // ---- Her head: looks at what's interesting; blinks.
    let yaw = 0
    let pitch = 0
    if (pose.look) {
      this.head.updateWorldMatrix(true, false)
      const local = this.head.parent!.worldToLocal(tv.copy(pose.look))
      yaw = clamp(Math.atan2(local.x - this.head.position.x, local.z - this.head.position.z), -1.3, 1.3)
      pitch = clamp(-Math.atan2(local.y - this.head.position.y, Math.hypot(local.x, local.z)) * 0.5, -0.4, 0.3)
    }
    this.head.rotation.y += (yaw - this.head.rotation.y) * ease(5)
    this.head.rotation.x += (pitch - this.head.rotation.x) * ease(5)
    this.blink -= dt
    if (this.blink < -0.12) this.blink = 2 + Math.random() * 3
    this.eyes.scale.y = this.blink < 0 || droop > 0.3 ? 0.15 : 1

    // ---- The tail: wags; a slap swings it up and down onto the deck.
    if (this.slapT >= 0) {
      const q = this.slapT / SLAP_S
      this.tail.rotation.x = q < 0.3 ? -1.1 * (q / 0.3) : q < 0.45 ? -1.1 + 1.5 * ((q - 0.3) / 0.15) : 0.4 * (1 - span(q, 0.45, 1))
    } else this.tail.rotation.x = Math.sin(t * 2.1) * 0.08
    this.tail.rotation.y = Math.sin(t * 1.3) * 0.15

    // ---- The microphone: on its reel, or down on its cable over the side, swaying.
    const m = clamp(pose.mic)
    const down = new Vector3(OVER.x + 0.15 + Math.sin(t * 0.9) * 0.15 * m, OVER.y - 0.3 - m * 4.6, OVER.z + Math.cos(t * 0.7) * 0.2 * m)
    const home = new Vector3(REEL.x + 0.02, REEL.y - 0.32, REEL.z + 0.32)
    const at = m < 0.02 ? home : m < 0.15 ? home.clone().lerp(OVER, m / 0.15) : OVER.clone().lerp(down, (m - 0.15) / 0.85)
    this.mic.position.copy(at)
    this.mic.rotation.z = m > 0.02 ? 0 : Math.PI / 2
    this.cable.g.visible = m > 0.02
    if (m > 0.02) this.cable.set(m < 0.15 ? REEL : OVER, tv.copy(at).setY(at.y + 0.2))
  }

  /** The tail's tip in the world (a slap thumps there). */
  tailTip(out: Vector3) {
    return this.tail.localToWorld(out.set(0, 0, -0.6))
  }
  /** Maple's head in the world (drips fly off it). */
  headAt(out: Vector3) {
    return this.head.localToWorld(out.set(0, 0.25, 0))
  }
}
