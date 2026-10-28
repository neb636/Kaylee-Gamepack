// Whale Watch's boat: a little Tofino whale-watching boat, the kind with fat pink tubes all round, a grey floor, a
// console with a windscreen and a wheel in the middle, an outboard motor at the back, a little flag on a pole. Maple
// (maple.ts, on the chibi rig) stands at the wheel in her life jacket and turns it as the boat turns. The yellow
// underwater microphone sits on its reel by the stern and goes down on its cable when Kaylee listens.
//
// The world (watch.ts) moves and tips the whole boat (`root`, `body`) and tells Maple what to do.
//
// Local frame: +z is the bow (forward), +x is the boat's left (facing +z, the right-hand side is -x).
import { Group, Vector3, type BufferGeometry } from 'three'
import { clamp } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { Maple } from './maple'

export const BOAT_LEN = 5.4
const TUBE = PAL.hotpink
const TUBE_DARK = '#D93E83'
const FLOOR = '#C9C2D3'
const GREY = '#8E879C'
const MIC = PAL.gold

/** Where Maple stands (on the floor, behind the console), and the wheel in front of her. */
const MAPLE_Z = -0.85
const FLOOR_Y = 0.32
const WHEEL = new Vector3(0, 0.92, -0.5)
/** The microphone's reel (on the boat's left, by the stern) and where the cable goes over the side. */
const REEL = new Vector3(0.78, 0.72, -1.7)
const OVER = new Vector3(1.25, 0.62, -1.7)

const Y = new Vector3(0, 1, 0)
const tv = new Vector3()

/** A round bar along +y, one meter long, stretched between two points each frame (the microphone's cable). */
class Bone {
  readonly g = new Group()
  constructor(bag: Bag, r: number, c: string, parent: Group, px = 2) {
    const parts: BufferGeometry[] = [P.cyl(r, r * 0.9, 1, c, { at: [0, 0.5, 0] }, 8)]
    this.g.add(solid(merge(parts), bag, px))
    parent.add(this.g)
  }
  set(a: Vector3, b: Vector3) {
    this.g.position.copy(a)
    tv.subVectors(b, a)
    const len = tv.length()
    this.g.quaternion.setFromUnitVectors(Y, tv.multiplyScalar(1 / Math.max(1e-4, len)))
    this.g.scale.set(1, len, 1)
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
  /** Maple at the wheel (the rig). */
  readonly mapleRig: Maple
  /** Her root (the boat's tap target sits on her). */
  readonly maple: Group
  readonly height: number
  /** The microphone at the end of its cable (the tap target, and what she hears with). */
  readonly mic = new Group()
  private wheel = new Group()
  private flag = new Group()
  private cable: Bone

  constructor(bag: Bag) {
    this.root.add(this.body)
    const L = BOAT_LEN
    // ---- The boat: pink tubes round a grey floor (round at the bow), the console, the motor, a flag pole.
    this.body.add(
      solid(
        merge([
          P.capsule(0.34, L - 2.2, TUBE, { at: [0.98, 0.42, -0.35], rot: [Math.PI / 2, 0, 0] }),
          P.capsule(0.34, L - 2.2, TUBE, { at: [-0.98, 0.42, -0.35], rot: [Math.PI / 2, 0, 0] }),
          P.torus(0.98, 0.34, TUBE, { at: [0, 0.42, L / 2 - 2.05], rot: [Math.PI / 2, 0, 0] }, Math.PI),
          P.rbox(2.1, 0.3, 3, 0.12, FLOOR, { at: [0, 0.18, -0.85] }),
          P.cyl(0.98, 0.98, 0.3, FLOOR, { at: [0, 0.18, L / 2 - 2.05] }, 20),
          // A dark rubbing strip along each tube.
          P.box(0.04, 0.06, L - 2.4, TUBE_DARK, { at: [1.3, 0.42, -0.35] }),
          P.box(0.04, 0.06, L - 2.4, TUBE_DARK, { at: [-1.3, 0.42, -0.35] }),
          // The console with its windscreen (low, so Maple's face shows over it) and the wheel's shaft.
          P.rbox(0.9, 0.62, 0.55, 0.1, '#FFFFFF', { at: [0, 0.63, 0.02] }),
          P.box(0.92, 0.06, 0.6, PAL.lavender, { at: [0, 0.96, 0.02] }),
          P.rbox(0.92, 0.32, 0.05, 0.03, '#BFE9F7', { at: [0, 1.12, 0.26], rot: [-0.45, 0, 0] }),
          P.cyl(0.03, 0.03, 0.3, '#B9B4C6', { at: [0, 0.9, -0.38], rot: [Math.PI / 2 - 0.55, 0, 0] }, 6),
          // A little bench behind her, a cool box at the bow.
          P.rbox(1.4, 0.3, 0.5, 0.08, PAL.lavenderDark, { at: [0, 0.47, -1.55] }),
          P.rbox(0.7, 0.42, 0.5, 0.08, '#8FD3F0', { at: [0, 0.53, 1.2] }),
          P.box(0.72, 0.06, 0.52, '#FFFFFF', { at: [0, 0.76, 1.2] }),
          // The motor at the back.
          P.rbox(0.5, 0.7, 0.5, 0.12, GREY, { at: [0, 0.85, -L / 2 + 0.2] }),
          P.box(0.16, 0.7, 0.16, '#6E6880', { at: [0, 0.25, -L / 2 + 0.15] }),
          P.rbox(0.56, 0.12, 0.56, 0.05, PAL.lavenderDark, { at: [0, 1.22, -L / 2 + 0.2] }),
          // The flag pole on the stern.
          P.cyl(0.03, 0.03, 1.4, '#FFFFFF', { at: [-0.85, 1.25, -L / 2 + 0.55] }, 6),
          // The microphone's reel.
          P.cyl(0.2, 0.2, 0.16, MIC, { at: [REEL.x, REEL.y, REEL.z], rot: [0, 0, Math.PI / 2] }, 14),
          P.cyl(0.05, 0.05, 0.3, GREY, { at: [REEL.x - 0.1, REEL.y - 0.2, REEL.z] }, 6),
        ]),
        bag,
        2,
      ),
    )
    // The flag: red, white, red (a little red leaf in the middle), flapping.
    this.flag.position.set(-0.85, 1.8, -L / 2 + 0.55)
    this.flag.add(
      solid(
        merge([
          P.box(0.02, 0.32, 0.5, '#FFFFFF', { at: [0, 0, -0.25] }),
          P.box(0.025, 0.32, 0.12, '#E8443F', { at: [0, 0, -0.06] }),
          P.box(0.025, 0.32, 0.12, '#E8443F', { at: [0, 0, -0.44] }),
          P.sphere(0.07, '#E8443F', { at: [0, 0, -0.25], scale: [0.4, 1, 1] }, 8),
        ]),
        bag,
        1.5,
      ),
    )
    this.body.add(this.flag)
    // The wheel, tipped back toward Maple.
    this.wheel.position.copy(WHEEL)
    this.wheel.rotation.x = -0.55
    this.wheel.add(solid(merge([P.torus(0.2, 0.035, '#4A4458'), P.box(0.36, 0.035, 0.035, '#4A4458'), P.box(0.035, 0.36, 0.035, '#4A4458'), P.cyl(0.05, 0.05, 0.08, '#6B6380', { rot: [Math.PI / 2, 0, 0] }, 10)]), bag, 1.5))
    this.body.add(this.wheel)

    // ---- Maple, standing behind the console facing the bow.
    this.mapleRig = new Maple(bag)
    this.maple = this.mapleRig.root
    this.maple.position.set(0, FLOOR_Y, MAPLE_Z)
    this.body.add(this.maple)
    this.height = this.mapleRig.height

    // ---- The microphone on its cable.
    this.mic.add(solid(merge([P.capsule(0.12, 0.22, MIC), P.sphere(0.1, '#4A4458', { at: [0, -0.22, 0] }), P.torus(0.13, 0.025, '#4A4458', { at: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
    this.body.add(this.mic)
    this.cable = new Bone(bag, 0.018, '#4A4458', this.body, 1)
  }

  // ---- Maple's actions.
  wave() {
    this.mapleRig.wave()
  }
  cheer() {
    this.mapleRig.cheer()
  }
  slap() {
    this.mapleRig.slap()
  }
  /** Binoculars up for a look (a spout). */
  spot() {
    this.mapleRig.spot()
  }
  pointAt(at: Vector3) {
    this.mapleRig.pointAt(at)
  }
  /** A whale sneezed on the boat: she's dripping, then shakes it off. */
  soak() {
    this.mapleRig.soak()
  }
  wobble() {
    this.mapleRig.wobble()
  }
  get soaked() {
    return this.mapleRig.soaked
  }
  get shaking() {
    return this.mapleRig.shaking
  }
  /** A tail slap hits the deck now (the world thumps). */
  get slapped() {
    return this.mapleRig.slapped
  }
  set slapped(v: boolean) {
    this.mapleRig.slapped = v
  }

  update(dt: number, t: number, pose: BoatPose) {
    // ---- The wheel turns with the boat; Maple turns it and leans.
    this.wheel.rotation.z += (-pose.turn * 1.6 - this.wheel.rotation.z) * (1 - Math.exp(-dt * 8))
    this.mapleRig.update(dt, t, { turn: pose.turn, look: pose.look })
    // The flag flaps in the wind.
    this.flag.rotation.y = Math.sin(t * 7) * 0.25 + Math.sin(t * 11.3) * 0.1
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

  /** Maple's head in the world (drips fly off it). */
  headAt(out: Vector3) {
    return this.mapleRig.headAt(out)
  }
}
