// Maple the beaver at the Winter Carnival, on the chibi rig (engine3d/characters/animal.ts, her look in
// characters/looks.ts) in a pink knitted tuque for the cold, over her own pink scarf. The world (carnival.ts) walks her
// around; this file owns her little actions, each eased in and out (a wave, a cheer with a hop, a giggle, a tail slap
// on top of a giant snowball, patting a snowball together, drumming in the parade) and her face (blinks, and her mouth
// moving with her voice).
import { Group } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { CANADA_LOOKS } from '../../characters/looks'
import { makeHat } from './props'

/** Taller than in the lab (0.85 m), so she reads beside the snowmen from the park's camera. */
const H = 1.2
const WAVE_S = 1.5
const CHEER_S = 1.6
const HOP_S = 0.6
const SLAP_S = 0.75
const PAT_S = 0.9
const GIGGLE_S = 0.9

export class Maple {
  readonly root: Group
  readonly rig: Rig
  readonly height = H
  /** A carnival tuque on her head (a box popped and no snowman needed one). */
  readonly hat: Group
  /** Drumming (the parade): her arms beat. */
  drumming = false
  private life: FaceLife
  private waveT = -1
  private cheerT = -1
  private hopT = -1
  private slapT = -1
  private patT = -1
  private giggleT = -1
  private lookYaw = 0
  /** Arm angles, eased toward each frame's pose so nothing snaps. */
  private arm = { lx: 0, lz: 0, rx: 0, rz: 0 }
  private shadow: Group

  constructor(bag: Bag) {
    this.rig = buildAnimal({ ...CANADA_LOOKS.maple, height: H }, bag)
    this.root = this.rig.root
    this.shadow = this.root.children[0] as Group
    this.life = new FaceLife(this.rig, 'maple')
    const { R, headY } = this.rig.face
    // Her pink knitted tuque: a ribbed white band, a rounded crown and a fluffy pompom; her round ears peep out.
    const tuque = solid(
      merge([
        P.sphere(R * 0.98, '#FFB3CF', { at: [0, headY + 0.38 * R, -0.04 * R], scale: [1.04, 0.78, 1.04] }, 22),
        P.cyl(R * 0.99, R * 1.03, R * 0.26, '#FFFFFF', { at: [0, headY + 0.46 * R, -0.04 * R], rot: [-0.14, 0, 0] }, 24),
        P.sphere(R * 0.3, '#FFFFFF', { at: [0, headY + 1.16 * R, -0.12 * R] }, 14),
      ]),
      bag,
      2,
    )
    this.rig.head.add(tuque)
    this.hat = makeHat(bag)
    this.hat.scale.setScalar(R * 0.95)
    this.hat.position.set(0, headY + 0.5 * R, -0.04 * R)
    this.hat.visible = false
    this.rig.head.add(this.hat)
  }

  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  cheer() {
    this.cheerT = 0
    this.hop()
    this.waveT = -1
  }
  hop() {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.75) this.hopT = 0
  }
  slap() {
    this.slapT = 0
  }
  pat() {
    this.patT = 0
  }
  giggle() {
    this.giggleT = 0
  }
  get hopping() {
    return this.hopT >= 0
  }

  /** `walk` is how fast she's walking (m/s): she bobs and waddles and her arms swing. `up`: she's off the ground (on a
   *  ball), so her shadow hides. */
  update(dt: number, t: number, walk: number, up = false) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    const step = (v: number, max: number) => (v >= 0 ? (v + dt > max ? -1 : v + dt) : v)
    this.waveT = step(this.waveT, WAVE_S)
    this.cheerT = step(this.cheerT, CHEER_S)
    this.hopT = step(this.hopT, HOP_S)
    this.slapT = step(this.slapT, SLAP_S)
    this.patT = step(this.patT, PAT_S)
    this.giggleT = step(this.giggleT, GIGGLE_S)
    this.shadow.visible = !up

    // A hop: crouch (anticipation), up with a stretch, land with a squash, settle.
    let y = 0
    let sq = 0
    if (this.hopT >= 0) {
      const p = this.hopT / HOP_S
      const air = span(p, 0.2, 0.78)
      y = bell(air) * 0.42
      sq = p < 0.2 ? bell(p / 0.4) * 0.18 : p > 0.78 ? bell((p - 0.78) / 0.44) * 0.15 : -0.1 * bell(air)
    }
    const going = clamp(walk / 2)
    const bob = Math.abs(Math.sin(t * 11)) * 0.06 * going
    const breathe = Math.sin(t * 2.2) * 0.02
    // Patting a snowball: she leans over it.
    const lean = this.patT >= 0 ? bell(this.patT / PAT_S) * 0.35 : going * 0.12
    body.position.y = y + bob
    body.scale.set(1 + sq * 0.6, 1 - sq + breathe, 1 + sq * 0.6)
    const giggle = this.giggleT >= 0 ? Math.sin(this.giggleT * 26) * 0.12 * (1 - this.giggleT / GIGGLE_S) : 0
    body.rotation.set(lean, 0, giggle + Math.sin(t * 11) * 0.06 * going)

    // The head: looks where she's told (the ball being rolled), tips back to cheer, giggles the other way.
    const cheer = this.cheerT >= 0 ? Math.min(1, bell(this.cheerT / CHEER_S) * 2) : 0
    head.rotation.y += (clamp(this.lookYaw, -1, 1) - head.rotation.y) * (1 - Math.exp(-dt * 6))
    head.rotation.x = -cheer * 0.25 - lean * 0.4
    head.rotation.z = -giggle * 1.4 + Math.sin(t * 0.9) * 0.05

    // Arms (armR is on +x: raising it is +z; forward is -x): hang, swing, wave, cheer, pat, drum.
    let lx = Math.sin(t * 11) * 0.6 * going
    let rx = -lx
    let lz = -0.15
    let rz = 0.15
    if (this.patT >= 0) {
      const k = bell(this.patT / PAT_S)
      const pat = Math.abs(Math.sin(this.patT * 16)) * 0.35
      lx = rx = -k * (1.3 + pat)
      lz = 0.25 * k
      rz = -0.25 * k
    }
    if (this.drumming) {
      lx = -1.1 - Math.max(0, Math.sin(t * 10.5)) * 0.7
      rx = -1.1 - Math.max(0, Math.sin(t * 10.5 + Math.PI)) * 0.7
      lz = 0.2
      rz = -0.2
    }
    if (this.waveT >= 0) {
      const k = Math.min(1, bell(this.waveT / WAVE_S) * 2)
      rx = -0.2 * k
      rz = 0.15 + k * (2.3 + Math.sin(this.waveT * 14) * 0.35)
    }
    if (cheer > 0) {
      lx = rx = -0.3 * cheer
      lz = -0.15 - cheer * 2.4 - Math.sin(t * 18) * 0.15 * cheer
      rz = 0.15 + cheer * 2.4 + Math.sin(t * 18) * 0.15 * cheer
    }
    const a = this.arm
    const k = 1 - Math.exp(-dt * 18)
    a.lx += (lx - a.lx) * k
    a.lz += (lz - a.lz) * k
    a.rx += (rx - a.rx) * k
    a.rz += (rz - a.rz) * k
    armL.rotation.set(a.lx, 0, a.lz)
    armR.rotation.set(a.rx, 0, a.rz)

    // The paddle tail: a lazy sway, a big slap (up, then down hard, a little bounce), and it lifts as she hops.
    if (tail) {
      const slap = this.slapT >= 0 ? -bell(span(this.slapT, 0, 0.3)) * 1.2 + bell(span(this.slapT, 0.3, 0.55)) * 0.35 - bell(span(this.slapT, 0.55, SLAP_S)) * 0.1 : 0
      tail.rotation.x = slap - sq * 0.8 + Math.sin(t * 3) * 0.05
      tail.rotation.y = Math.sin(t * 1.7) * 0.12 * (1 - going) + Math.sin(t * 11) * 0.2 * going
    }
  }

  /** Turns her head toward a direction (radians from where she faces), or straight ahead. */
  look(yaw: number) {
    this.lookYaw = yaw
  }
}
