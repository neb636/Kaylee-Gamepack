// Red Canoe's canoe and Maple as greybox shapes in the toon look (the art gate builds Maple on the chibi rig): a red
// canoe with wooden gunwales and seats, Maple the beaver in a pink life jacket in the stern holding the paddle, her flat
// tail out over the back, a backpack in the bow. Kaylee's finger moves the paddle's blade (the world says where: paddle.ts)
// and Maple's arms follow the shaft. She also waves, cheers, slaps her tail, gets dizzy, and looks at things.
//
// Local frame: +z is the bow (forward), +x is the canoe's left (facing +z, the right-hand side is -x).
import { Group, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'

export const CANOE_LEN = 4.6
const RED = '#E8443F'
const RED_DARK = '#C23634'
const WOOD = '#D2A67E'
const WOOD_DARK = '#A97A55'
const FUR = '#A8714A'
const FUR_LIGHT = '#E2B48A'
const TAIL = '#6E4B3B'
const TEETH = '#FF9A3C'
const VEST = PAL.hotpink
const BLADE = PAL.pink

/** Where Maple sits (the stern seat), her shoulders, and how long the paddle is. */
export const SEAT_Z = -1.3
const SHOULDER_Y = 0.98
const SHOULDER_X = 0.22
const PADDLE_LEN = 1.6
const ARM_R = 0.065
const WAVE_S = 1.4
const CHEER_S = 1.8
const SLAP_S = 0.9
const DIZZY_S = 3.2

const Y = new Vector3(0, 1, 0)
const tv = new Vector3()
const tq = new Quaternion()

/** A round bar along +y, one meter long, stretched between two points each frame (an arm). */
class Bone {
  readonly g = new Group()
  constructor(bag: Bag, r: number, c: string, parent: Group, hand?: string) {
    const parts: BufferGeometry[] = [P.cyl(r, r * 0.9, 1, c, { at: [0, 0.5, 0] }, 8)]
    this.g.add(solid(merge(parts), bag, 2))
    if (hand) {
      // The paw at the end, not stretched with the arm.
      this.hand = solid(merge([P.sphere(r * 1.45, hand)]), bag, 2)
      parent.add(this.hand)
    }
    parent.add(this.g)
  }
  hand?: Group
  set(a: Vector3, b: Vector3) {
    this.g.position.copy(a)
    tv.subVectors(b, a)
    const len = tv.length()
    this.g.quaternion.setFromUnitVectors(Y, tv.multiplyScalar(1 / Math.max(1e-4, len)))
    this.g.scale.set(1, len, 1)
    this.hand?.position.copy(b)
  }
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
  /** Maple, sitting in the stern. */
  readonly maple = new Group()
  readonly height = 1.4
  private head = new Group()
  private tail = new Group()
  private stars = new Group()
  private paddle = new Group()
  private armL: Bone
  private armR: Bone
  private blade = new Vector3(0.6, 0.45, SEAT_Z + 0.35)
  private grip = new Vector3(-0.5, 0.5, SEAT_Z + 0.35)
  private rollV = 0
  private roll = 0
  private waveT = -1
  private cheerT = -1
  private slapT = -1
  private dizzyT = -1
  private blink = 0
  private eyes: Group
  /** A tail slap hits the water now (the world splashes). */
  slapped = false

  constructor(bag: Bag) {
    this.root.add(this.hull)
    const L = CANOE_LEN
    // ---- The canoe: a long low hull, pointed at both ends, wooden gunwales and seats.
    this.hull.add(
      solid(
        merge([
          P.capsule(0.48, L - 0.96, RED, { at: [0, 0.16, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.62] }),
          P.capsule(0.4, L - 1.1, '#FFE9DA', { at: [0, 0.27, 0], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.42] }),
          P.box(0.08, 0.06, L - 1.0, WOOD, { at: [0.45, 0.42, 0] }),
          P.box(0.08, 0.06, L - 1.0, WOOD, { at: [-0.45, 0.42, 0] }),
          P.box(0.92, 0.06, 0.32, WOOD_DARK, { at: [0, 0.4, SEAT_Z] }),
          P.box(0.92, 0.06, 0.32, WOOD_DARK, { at: [0, 0.4, 1.3] }),
          P.box(0.92, 0.05, 0.1, WOOD, { at: [0, 0.42, 0] }),
          // Red tips at the bow and stern, a white stripe under the gunwale.
          P.sphere(0.2, RED_DARK, { at: [0, 0.44, L / 2 - 0.32], scale: [0.6, 1, 1] }, 10),
          P.sphere(0.2, RED_DARK, { at: [0, 0.44, -L / 2 + 0.32], scale: [0.6, 1, 1] }, 10),
          P.box(0.02, 0.06, L - 1.5, '#FFFFFF', { at: [0.5, 0.3, 0] }),
          P.box(0.02, 0.06, L - 1.5, '#FFFFFF', { at: [-0.5, 0.3, 0] }),
          // The backpack in the bow.
          P.rbox(0.42, 0.42, 0.3, 0.1, PAL.lavender, { at: [0, 0.55, 1.05] }),
          P.rbox(0.3, 0.16, 0.08, 0.04, PAL.lavenderDark, { at: [0, 0.5, 1.22] }),
        ]),
        bag,
        2,
      ),
    )

    // ---- Maple, sitting on the stern seat facing the bow.
    this.maple.position.set(0, 0, SEAT_Z)
    this.hull.add(this.maple)
    this.maple.add(
      solid(
        merge([
          P.sphere(0.33, FUR, { at: [0, 0.62, 0], scale: [1, 1.05, 0.92] }),
          P.cyl(0.3, 0.34, 0.32, VEST, { at: [0, 0.66, 0] }, 14),
          P.box(0.08, 0.3, 0.04, '#FFFFFF', { at: [0.1, 0.66, 0.3] }),
          P.box(0.08, 0.3, 0.04, '#FFFFFF', { at: [-0.1, 0.66, 0.3] }),
          P.sphere(0.12, FUR, { at: [0.17, 0.42, 0.3], scale: [1, 0.7, 1.3] }),
          P.sphere(0.12, FUR, { at: [-0.17, 0.42, 0.3], scale: [1, 0.7, 1.3] }),
        ]),
        bag,
        2,
      ),
    )
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
    // Dizzy stars round her head.
    for (let i = 0; i < 3; i++) {
      const s = solid(merge([P.sphere(0.06, PAL.butter, { scale: [1, 1, 0.5] })]), bag, 1.2)
      s.position.set(Math.cos((i * Math.PI * 2) / 3) * 0.32, 0.55, Math.sin((i * Math.PI * 2) / 3) * 0.32)
      this.stars.add(s)
    }
    this.stars.visible = false
    this.head.add(this.stars)
    // The flat tail out over the stern, on a pivot for the slap.
    this.tail.position.set(0, 0.42, -0.3)
    this.maple.add(this.tail)
    this.tail.add(solid(merge([P.rbox(0.3, 0.06, 0.62, 0.03, TAIL, { at: [0, 0, -0.32] }), ...[0, 1, 2].map((i) => P.box(0.26, 0.065, 0.02, '#5A3B2E', { at: [0, 0, -0.15 - i * 0.16] }))]), bag, 2))

    // ---- The paddle (a wooden shaft, a pink blade, a grip on top) and Maple's arms.
    this.paddle.add(
      solid(
        merge([
          P.cyl(0.03, 0.03, PADDLE_LEN, WOOD, { at: [0, PADDLE_LEN / 2, 0] }, 8),
          P.rbox(0.2, 0.5, 0.045, 0.04, BLADE, { at: [0, 0.18, 0] }),
          P.rbox(0.16, 0.05, 0.06, 0.02, WOOD_DARK, { at: [0, PADDLE_LEN, 0] }),
        ]),
        bag,
        1.6,
      ),
    )
    this.hull.add(this.paddle)
    this.armL = new Bone(bag, ARM_R, FUR, this.hull, FUR_LIGHT)
    this.armR = new Bone(bag, ARM_R, FUR, this.hull, FUR_LIGHT)
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

    // ---- The paddle: the blade glides to where the world says (or rests across her lap while she waves or cheers).
    const busy = this.cheerT >= 0
    const rest = !pose.blade || busy
    const want = rest ? tv.set(0.62, 0.48, SEAT_Z + 0.42) : tv.copy(pose.blade!)
    this.blade.lerp(want, ease(rest ? 6 : 26))
    const sh = new Vector3(0, SHOULDER_Y + 0.42, SEAT_Z)
    if (rest) this.grip.lerp(new Vector3(-0.6, 0.5, SEAT_Z + 0.42), ease(6))
    else this.grip.copy(this.blade).add(sh.clone().sub(this.blade).normalize().multiplyScalar(PADDLE_LEN))
    this.paddle.position.copy(this.blade)
    this.paddle.quaternion.setFromUnitVectors(Y, tv.subVectors(this.grip, this.blade).normalize())
    // Maple's hands: the top hand on the grip, the lower one down the shaft (on the blade's side).
    const side = this.blade.x >= 0 ? 1 : -1
    const shL = new Vector3(SHOULDER_X, SHOULDER_Y, SEAT_Z + 0.02)
    const shR = new Vector3(-SHOULDER_X, SHOULDER_Y, SEAT_Z + 0.02)
    const top = this.grip.clone()
    const low = this.blade.clone().lerp(this.grip, 0.58)
    let handL = side > 0 ? low : top
    let handR = side > 0 ? top : low
    if (rest) {
      handL = this.blade.clone().lerp(this.grip, 0.25)
      handR = this.blade.clone().lerp(this.grip, 0.78)
    }
    // A wave: her right paw (the camera's left) up and swinging; a cheer: both up.
    if (this.waveT >= 0) {
      const k = bell(span(this.waveT / WAVE_S, 0, 1))
      handR = shR.clone().lerp(new Vector3(-0.42 + Math.sin(this.waveT * 14) * 0.12, SHOULDER_Y + 0.55, SEAT_Z + 0.15), k)
    }
    if (busy) {
      const k = bell(span(this.cheerT / CHEER_S, 0, 1)) ** 0.5
      const j = Math.abs(Math.sin(this.cheerT * 9)) * 0.08
      handL = shL.clone().lerp(new Vector3(0.36, SHOULDER_Y + 0.6 + j, SEAT_Z + 0.1), k)
      handR = shR.clone().lerp(new Vector3(-0.36, SHOULDER_Y + 0.6 + j, SEAT_Z + 0.1), k)
    }
    // (Arms don't stretch past a beaver's reach: the hand stops short of the shaft.)
    const reach = (s: Vector3, h: Vector3) => {
      const d = h.clone().sub(s)
      const l = d.length()
      return l > 0.62 ? s.clone().add(d.multiplyScalar(0.62 / l)) : h
    }
    this.armL.set(shL, reach(shL, handL))
    this.armR.set(shR, reach(shR, handR))
    this.maple.position.y = this.cheerT >= 0 ? Math.abs(Math.sin(this.cheerT * 9)) * 0.06 : 0
    this.maple.rotation.y = rest ? 0 : clamp(this.blade.x * 0.25, -0.3, 0.3)

    // ---- Her head: looks at what's interesting, wobbles round when dizzy; blinks.
    let yaw = 0
    let pitch = 0
    if (pose.look) {
      this.head.updateWorldMatrix(true, false)
      const local = this.head.parent!.worldToLocal(tv.copy(pose.look))
      yaw = clamp(Math.atan2(local.x - this.head.position.x, local.z - this.head.position.z), -1.2, 1.2)
      pitch = clamp(-Math.atan2(local.y - this.head.position.y, Math.hypot(local.x, local.z)) * 0.5, -0.4, 0.3)
    }
    if (this.dizzyT >= 0) {
      const k = bell(span(this.dizzyT / DIZZY_S, 0, 1))
      yaw = Math.sin(this.dizzyT * 7) * 0.45 * k
      pitch = Math.cos(this.dizzyT * 7) * 0.2 * k
      this.head.rotation.z = Math.sin(this.dizzyT * 7) * 0.25 * k
      this.stars.visible = true
      this.stars.rotation.y = this.dizzyT * 6
    } else {
      this.head.rotation.z *= 1 - ease(8)
      this.stars.visible = false
    }
    this.head.rotation.y += (yaw - this.head.rotation.y) * ease(5)
    this.head.rotation.x += (pitch - this.head.rotation.x) * ease(5)
    this.blink -= dt
    if (this.blink < -0.12) this.blink = 2 + Math.random() * 3
    this.eyes.scale.y = this.blink < 0 || this.dizzyT >= 0 ? 0.15 : 1

    // ---- The tail: wags behind her; a slap swings it up and down onto the water.
    if (this.slapT >= 0) {
      const q = this.slapT / SLAP_S
      this.tail.rotation.x = q < 0.3 ? -1.1 * (q / 0.3) : q < 0.45 ? -1.1 + 1.5 * ((q - 0.3) / 0.15) : 0.4 * (1 - span(q, 0.45, 1))
    } else this.tail.rotation.x = Math.sin(t * 2.1) * 0.08
    this.tail.rotation.y = Math.sin(t * 1.3) * 0.15
  }

  /** The tail's tip in the world (a slap splashes there). */
  tailTip(out: Vector3) {
    return this.tail.localToWorld(out.set(0, 0, -0.6))
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
