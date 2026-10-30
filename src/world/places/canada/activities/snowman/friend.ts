// Maple's friends who come to the carnival with a picture of the snowman they want (Decorate a Snowman, friends):
// Maple's cousin beaver, the moose and the raccoon, on the chibi rig with their looks from characters/looks.ts. Each one
// walks in from the side of the park with a waddle, waves hello in their own voice (their mouth moves with it, the face
// blinks), hops with joy when their snowman wakes up, and walks off beside it to the parade line. Their actions ease in
// and out like Maple's (maple.ts).
import { Group } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { CANADA_LOOKS } from '../../characters/looks'
import type { Card } from './studio'

const WAVE_S = 1.5
const HOP_S = 0.6
const CHEER_S = 1.6

/** Who brings which picture, how tall they stand beside the snowmen, and the voice they talk in. */
const WHO: Record<Card, { look: keyof typeof CANADA_LOOKS; height: number; voice: string; scarf: string }> = {
  tuque: { look: 'cousin', height: 0.95, voice: 'cousin', scarf: '#8FD3FF' },
  rainbow: { look: 'moose', height: 1.45, voice: 'moose', scarf: '#FFE066' },
  silly: { look: 'raccoon', height: 1.0, voice: 'raccoon', scarf: '#B9A6F5' },
}

export class Friend {
  readonly root: Group
  readonly rig: Rig
  readonly height: number
  readonly voice: string
  private life: FaceLife
  private waveT = -1
  private hopT = -1
  private cheerT = -1
  private lookYaw = 0
  private arm = { lx: 0, lz: 0, rx: 0, rz: 0 }

  constructor(
    readonly card: Card,
    bag: Bag,
  ) {
    const who = WHO[card]
    this.height = who.height
    this.voice = who.voice
    this.rig = buildAnimal({ ...CANADA_LOOKS[who.look], height: who.height }, bag)
    this.root = this.rig.root
    this.life = new FaceLife(this.rig, who.voice)
    // A knitted carnival scarf for the cold, in a color of their own.
    const { R, headY } = this.rig.face
    const neck = headY - 0.82 * R
    this.rig.head.add(
      solid(
        merge([
          P.torus(R * 0.62, R * 0.17, who.scarf, { at: [0, neck, 0.02 * R], rot: [Math.PI / 2, 0, 0] }),
          P.rbox(R * 0.3, R * 0.7, R * 0.12, R * 0.05, who.scarf, { at: [R * 0.3, neck - 0.36 * R, R * 0.55], rot: [0.2, 0, 0.15] }),
        ]),
        bag,
        2,
      ),
    )
  }

  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  hop() {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.75) this.hopT = 0
  }
  cheer() {
    this.cheerT = 0
    this.waveT = -1
    this.hop()
  }
  look(yaw: number) {
    this.lookYaw = yaw
  }

  /** `walk`: how fast they're walking (m/s), so they bob and swing their arms. */
  update(dt: number, t: number, walk: number) {
    const { body, head, armL, armR, tail } = this.rig
    this.life.update(dt)
    const step = (v: number, max: number) => (v >= 0 ? (v + dt > max ? -1 : v + dt) : v)
    this.waveT = step(this.waveT, WAVE_S)
    this.hopT = step(this.hopT, HOP_S)
    this.cheerT = step(this.cheerT, CHEER_S)
    // A hop: crouch, up with a stretch, land with a squash.
    let y = 0
    let sq = 0
    if (this.hopT >= 0) {
      const p = this.hopT / HOP_S
      const air = span(p, 0.2, 0.78)
      y = bell(air) * 0.36
      sq = p < 0.2 ? bell(p / 0.4) * 0.16 : p > 0.78 ? bell((p - 0.78) / 0.44) * 0.14 : -0.1 * bell(air)
    }
    const going = clamp(walk / 2)
    body.position.y = y + Math.abs(Math.sin(t * 10)) * 0.05 * going
    body.scale.set(1 + sq * 0.6, 1 - sq + Math.sin(t * 2.1) * 0.02, 1 + sq * 0.6)
    body.rotation.set(going * 0.1, 0, Math.sin(t * 10) * 0.06 * going)
    const cheer = this.cheerT >= 0 ? Math.min(1, bell(this.cheerT / CHEER_S) * 2) : 0
    head.rotation.y += (clamp(this.lookYaw, -1, 1) - head.rotation.y) * (1 - Math.exp(-dt * 6))
    head.rotation.x = -cheer * 0.25
    head.rotation.z = Math.sin(t * 0.8) * 0.05
    let lx = Math.sin(t * 10) * 0.6 * going
    let rx = -lx
    let lz = -0.15
    let rz = 0.15
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
    if (tail) tail.rotation.y = Math.sin(t * 2.4) * 0.25 + Math.sin(t * 10) * 0.2 * going
  }
}
