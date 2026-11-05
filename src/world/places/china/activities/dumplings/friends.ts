// The Dumpling House's friends on the chibi rig (engine3d/characters/animal.ts, looks in characters/looks.ts): Chef Fu
// behind the counter, and the friends on the stools across it. This file owns their little actions, each eased in and
// out the way Maple's are in Canada (anticipation, settle): a hop, a wave, a cheer, a giggle, a nod, eating (lean in,
// chomp chomp, a happy wiggle), and Chef Fu's toss and sneeze. Their mouths open with their own voices (FaceLife).
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { CHINA_LOOKS, type ChinaFriend } from '../../characters/looks'

const S = { wave: 1.4, cheer: 1.6, hop: 0.6, giggle: 0.9, nod: 0.7, eat: 1.1, toss: 0.7, sneeze: 1.3, laugh: 1.4, clap: 1.8 }
type Act = keyof typeof S
const tmp = new Vector3()

export class Friend {
  readonly root = new Group()
  readonly rig: Rig
  readonly height: number
  private life: FaceLife
  private t: Partial<Record<Act, number>> = {}
  private time = Math.random() * 5
  private lookYaw = 0
  private lookPitch = 0
  private arm = { lx: 0, lz: 0, rx: 0, rz: 0 }
  /** Sitting on a stool: her legs don't show and the body stays put. */
  seated = true
  /** Leaning in toward the counter (waiting for a basket, watching the dough). */
  lean = 0
  /** 0..1 popped in (a friend arriving hops up onto the stool from below). */
  shown = 1
  private shownGoal = 1
  /** The base yaw (which way they face). */
  yaw = 0

  constructor(
    readonly id: ChinaFriend,
    bag: Bag,
    height?: number,
    voice?: string,
  ) {
    const look = CHINA_LOOKS[id]
    this.height = height ?? look.height
    this.rig = buildAnimal({ ...look, height: this.height }, bag)
    this.root.add(this.rig.root)
    this.life = new FaceLife(this.rig, voice)
  }

  play(a: Act) {
    this.t[a] = 0
    if (a === 'cheer' || a === 'clap') delete this.t.wave
  }
  playing(a: Act) {
    return this.t[a] !== undefined
  }
  /** Turns the head toward a point in the world (or ahead with null). */
  lookAt(p: Vector3 | null) {
    if (!p) {
      this.lookYaw = 0
      this.lookPitch = 0
      return
    }
    const h = this.rig.head.getWorldPosition(tmp)
    const dx = p.x - h.x
    const dz = p.z - h.z
    const dy = p.y - h.y
    this.lookYaw = clamp(Math.atan2(dx, dz) - this.yaw, -1, 1)
    this.lookPitch = clamp(-Math.atan2(dy, Math.hypot(dx, dz)), -0.5, 0.6)
  }
  arrive() {
    this.shown = 0
    this.shownGoal = 1
    this.root.visible = true
    this.play('hop')
  }
  hide() {
    this.shown = this.shownGoal = 0
    this.root.visible = false
  }
  /** Where the mouth is in the world (food flies to it). */
  mouth(out: Vector3) {
    const [x, y, z] = this.rig.face.mouth
    return this.rig.head.localToWorld(out.set(x, y, z))
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    this.life.update(dt)
    const { body, head, armL, armR, tail } = this.rig
    for (const k of Object.keys(this.t) as Act[]) {
      const v = (this.t[k] as number) + dt
      if (v > S[k]) delete this.t[k]
      else this.t[k] = v
    }
    const p = (a: Act) => (this.t[a] === undefined ? -1 : (this.t[a] as number) / S[a])
    this.shown += (this.shownGoal - this.shown) * (1 - Math.exp(-dt * 6))

    // A hop: crouch, up with a stretch, land with a squash, settle.
    let y = 0
    let sq = 0
    const hop = p('hop')
    if (hop >= 0) {
      const air = span(hop, 0.2, 0.78)
      y = bell(air) * 0.22 * this.height
      sq = hop < 0.2 ? bell(hop / 0.4) * 0.16 : hop > 0.78 ? bell((hop - 0.78) / 0.44) * 0.14 : -0.1 * bell(air)
    }
    // Eating: lean in, chomp chomp chomp, a happy wiggle.
    const eat = p('eat')
    let chomp = 0
    if (eat >= 0) chomp = Math.abs(Math.sin(eat * Math.PI * 4)) * bell(eat)
    const laugh = p('laugh')
    const shake = laugh >= 0 ? Math.sin(laugh * 40) * 0.05 * bell(laugh) : 0
    const sneeze = p('sneeze')
    // Ah... ah... (back) CHOO (forward).
    const sn = sneeze >= 0 ? (sneeze < 0.6 ? -bell(span(sneeze, 0, 0.6) * 0.5) * 0.25 : bell(span(sneeze, 0.6, 1)) * 0.4) : 0
    const giggle = p('giggle')
    const gig = giggle >= 0 ? Math.sin(giggle * 24) * 0.1 * (1 - giggle) : 0
    const breathe = Math.sin(t * 2.1) * 0.02
    const lean = this.lean * 0.18 + chomp * 0.1 + sn
    body.position.y = y - (1 - this.shown) * this.height
    body.scale.set(1 + sq * 0.6 + shake, 1 - sq + breathe + chomp * 0.05, 1 + sq * 0.6)
    body.rotation.set(lean, 0, gig)

    const cheer = p('cheer') >= 0 ? Math.min(1, bell(p('cheer')) * 2) : 0
    const nod = p('nod') >= 0 ? Math.sin(p('nod') * Math.PI * 2) * 0.25 * bell(p('nod')) : 0
    head.rotation.y += (this.lookYaw - head.rotation.y) * (1 - Math.exp(-dt * 6))
    const pitch = this.lookPitch * 0.6 - cheer * 0.25 + nod + chomp * 0.15
    head.rotation.x += (pitch - head.rotation.x) * (1 - Math.exp(-dt * 10))
    head.rotation.z = -gig * 1.4 + Math.sin(t * 0.8) * 0.04
    if (eat >= 0) this.rig.talk.visible = chomp > 0.3

    // Arms (armR is on +x: raising it is +z; forward is -x).
    let lx = 0
    let rx = 0
    let lz = -0.15
    let rz = 0.15
    const wave = p('wave')
    if (wave >= 0) {
      const k = Math.min(1, bell(wave) * 2)
      rx = -0.2 * k
      rz = 0.15 + k * (2.3 + Math.sin(wave * 14) * 0.35)
    }
    const clap = p('clap')
    if (clap >= 0) {
      const k = Math.min(1, bell(clap) * 2)
      const c = Math.abs(Math.sin(clap * 30)) * 0.35
      lx = rx = -1.2 * k
      lz = (0.5 - c) * k
      rz = -(0.5 - c) * k
    }
    if (cheer > 0) {
      lx = rx = -0.3 * cheer
      lz = -0.15 - cheer * 2.4 - Math.sin(t * 18) * 0.15 * cheer
      rz = 0.15 + cheer * 2.4 + Math.sin(t * 18) * 0.15 * cheer
    }
    const toss = p('toss')
    if (toss >= 0) {
      // Wind up, then throw underarm toward the board.
      const k = toss < 0.35 ? -bell(toss / 0.7) * 0.6 : bell(span(toss, 0.35, 1)) * 1.6
      rx = -k
      rz = 0.2
    }
    if (sneeze >= 0) {
      lx = rx = -1.1 * bell(sneeze)
      lz = 0.4 * bell(sneeze)
      rz = -0.4 * bell(sneeze)
    }
    if (eat >= 0) {
      lx = rx = -1.0 * bell(eat)
      lz = 0.25 * bell(eat)
      rz = -0.25 * bell(eat)
    }
    if (this.lean > 0.5 && wave < 0 && clap < 0 && cheer === 0 && eat < 0) {
      // Waiting with paws on the counter.
      lx = rx = -0.9 * this.lean
    }
    const a = this.arm
    const k = 1 - Math.exp(-dt * 16)
    a.lx += (lx - a.lx) * k
    a.lz += (lz - a.lz) * k
    a.rx += (rx - a.rx) * k
    a.rz += (rz - a.rz) * k
    armL.rotation.set(a.lx, 0, a.lz)
    armR.rotation.set(a.rx, 0, a.rz)
    if (tail) tail.rotation.y = Math.sin(t * 2) * 0.15 + gig * 2
  }
}
