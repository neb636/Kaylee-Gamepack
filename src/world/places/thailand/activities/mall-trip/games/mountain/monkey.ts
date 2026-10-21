// A Lopburi monkey (greybox, from simple shapes in the toon look): a round brown body, a cream face, big ears, a curly
// tail and two arms on their own pivots. They breathe, swing their tails and watch Kaylee; a tap gets a trick:
//   flip       a backflip on the spot
//   scratch    scratches its head, puzzled
//   swing      round the top rail, upside down and back up
//   raspberry  leaps out beside a hold, blows a raspberry, and leaps back
//   ears       covers its ears (the bell)
//   cheer      both arms up, bouncing
import { CatmullRomCurve3, Group, TubeGeometry, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../../../sdk'
import { bake, merge, P, solid } from '../../../../engine/geo'
import type { Bag } from '../../../../engine/dispose'
import { PAL } from '../../../../engine/toon'

const FUR = '#A8774F'
const DARK = '#7E5434'
const FACE = '#F6D9B8'
const EAR = '#FFB8A8'

export type MonkeyTrick = 'flip' | 'scratch' | 'swing' | 'raspberry' | 'ears' | 'cheer'

export class Monkey {
  readonly root = new Group()
  /** The body pivots at the hips (flips turn round the middle). */
  private body = new Group()
  private head = new Group()
  private armL = new Group()
  private armR = new Group()
  private tail = new Group()
  private tongue: Group
  private trick: { kind: MonkeyTrick; t: number; dur: number; to?: Vector3; from?: Vector3 } | null = null
  private home = new Vector3()
  private face = 0
  private look: Vector3 | null = null
  private phase = Math.random() * 6

  constructor(bag: Bag, pick: string) {
    const s = 0.75
    this.root.userData.pick = pick
    this.root.add(this.body)
    this.body.position.y = 0.18 * s
    this.body.add(solid(merge([P.sphere(0.2 * s, FUR, { at: [0, 0.06 * s, 0], scale: [1, 1.15, 0.95] }), P.sphere(0.12 * s, FACE, { at: [0, 0.04 * s, 0.11 * s], scale: [1, 1.2, 0.5] }), ...[-1, 1].map((x) => P.sphere(0.08 * s, DARK, { at: [x * 0.11 * s, -0.14 * s, 0.07 * s], scale: [1, 0.7, 1.3] }))]), bag, 1.5))
    this.head.position.set(0, 0.32 * s, 0)
    this.body.add(this.head)
    this.head.add(
      solid(
        merge([
          P.sphere(0.17 * s, FUR, { scale: [1.05, 1, 0.95] }),
          P.sphere(0.12 * s, FACE, { at: [0, -0.02 * s, 0.1 * s], scale: [1.2, 1, 0.6] }),
          ...[-1, 1].flatMap((x) => [P.sphere(0.075 * s, FUR, { at: [x * 0.18 * s, 0.03 * s, 0], scale: [0.5, 1, 1] }), P.sphere(0.05 * s, EAR, { at: [x * 0.2 * s, 0.03 * s, 0.01 * s], scale: [0.4, 1, 1] })]),
          ...[-1, 1].map((x) => P.sphere(0.025 * s, PAL.ink, { at: [x * 0.05 * s, 0.02 * s, 0.17 * s] }, 8)),
          P.sphere(0.02 * s, '#B5654A', { at: [0, -0.04 * s, 0.18 * s], scale: [1.4, 0.8, 0.8] }, 8),
          P.box(0.06 * s, 0.01 * s, 0.01 * s, PAL.ink, { at: [0, -0.08 * s, 0.17 * s] }),
        ]),
        bag,
        1.5,
      ),
    )
    this.tongue = solid(merge([P.sphere(0.04 * s, '#FF7FA0', { scale: [1, 0.5, 1.4] })]), bag, 1)
    this.tongue.position.set(0, -0.09 * s, 0.19 * s)
    this.tongue.scale.setScalar(0.01)
    this.head.add(this.tongue)
    for (const [arm, x] of [[this.armL, -1], [this.armR, 1]] as [Group, number][]) {
      arm.position.set(x * 0.16 * s, 0.14 * s, 0.02 * s)
      arm.add(solid(merge([P.capsule(0.04 * s, 0.16 * s, FUR, { at: [x * 0.02 * s, -0.1 * s, 0] }), P.sphere(0.045 * s, FACE, { at: [x * 0.02 * s, -0.22 * s, 0] }, 8)]), bag, 1.5))
      this.body.add(arm)
    }
    this.tail.position.set(0, -0.08 * s, -0.16 * s)
    const pts = [[0, 0, 0], [0, 0.05, -0.15], [0.05, 0.22, -0.24], [0.15, 0.34, -0.16], [0.12, 0.3, -0.06]].map(([x, y, z]) => new Vector3(x * s, y * s, z * s))
    this.tail.add(solid(merge([bake(new TubeGeometry(new CatmullRomCurve3(pts), 16, 0.025 * s, 6), FUR)]), bag, 1.5))
    this.body.add(this.tail)
  }

  place(at: [number, number, number] | Vector3, face: number) {
    if (at instanceof Vector3) this.home.copy(at)
    else this.home.set(...at)
    this.face = face
    this.root.position.copy(this.home)
    this.root.rotation.y = face
  }
  get position() {
    return this.root.position
  }
  get busy() {
    return !!this.trick
  }
  lookAt(p: Vector3 | null) {
    this.look = p
  }

  /** A trick (`to`: where to leap for a raspberry). */
  play(kind: MonkeyTrick, to?: Vector3) {
    if (this.trick && this.trick.kind === 'raspberry') return
    const dur = { flip: 0.9, scratch: 1.3, swing: 1.4, raspberry: 2.0, ears: 1.4, cheer: 1.4 }[kind]
    this.trick = { kind, t: 0, dur, to: to?.clone(), from: this.home.clone() }
  }

  update(dt: number, t: number) {
    const b = this.body
    const tr = this.trick
    // Idle: breathing, the tail swinging, a little sway.
    const breath = Math.sin(t * 2.4 + this.phase)
    b.scale.set(1, 1 + 0.03 * breath, 1)
    b.rotation.set(0, 0, Math.sin(t * 1.1 + this.phase) * 0.05)
    b.position.y = 0.135
    this.tail.rotation.set(0, 0, Math.sin(t * 1.7 + this.phase) * 0.35)
    this.armL.rotation.set(0, 0, -0.2)
    this.armR.rotation.set(0, 0, 0.2)
    this.tongue.scale.setScalar(0.01)
    this.root.position.copy(this.home)
    this.root.rotation.set(0, this.face, 0)
    // Watching her: the head turns (a little) toward her.
    let hy = 0
    if (this.look) {
      const dx = this.look.x - this.root.position.x
      const dz = this.look.z - this.root.position.z
      const want = Math.atan2(dx, dz) - this.face
      hy = clamp(Math.atan2(Math.sin(want), Math.cos(want)), -0.8, 0.8)
    }
    this.head.rotation.set(0, hy, 0)
    if (!tr) return
    tr.t += dt
    const k = clamp(tr.t / tr.dur)
    switch (tr.kind) {
      case 'flip': {
        const air = span(k, 0.15, 0.85)
        b.position.y += bell(air) * 0.45 - 0.06 * bell(span(k, 0, 0.15))
        b.rotation.x = -air * Math.PI * 2
        this.armL.rotation.z = -2.6 * bell(k)
        this.armR.rotation.z = 2.6 * bell(k)
        break
      }
      case 'scratch':
        this.armR.rotation.set(-0.4, 0, 2.6 + Math.sin(tr.t * 26) * 0.25)
        this.head.rotation.z = 0.25 * bell(k)
        break
      case 'swing': {
        // Round the rail (it pivots at its hands, up over the rail).
        const a = span(k, 0.05, 0.9) * Math.PI * 2
        this.root.position.y = this.home.y + 0.28 - Math.cos(a) * 0.28
        this.root.position.z = this.home.z + Math.sin(a) * 0.28
        b.rotation.x = -a
        this.armL.rotation.z = -2.9
        this.armR.rotation.z = 2.9
        break
      }
      case 'raspberry': {
        // Leap out beside the hold, blow a raspberry, leap back.
        const to = tr.to ?? this.home
        const out = span(k, 0, 0.22)
        const back = span(k, 0.78, 1)
        const p = new Vector3().lerpVectors(this.home, to, out * (1 - back))
        p.y += (bell(out) + bell(back)) * 0.35
        this.root.position.copy(p)
        this.root.rotation.y = 0
        const blow = span(k, 0.28, 0.7)
        this.tongue.scale.setScalar(Math.max(0.01, bell(blow) * 1.2))
        this.head.rotation.set(0, Math.sin(tr.t * 30) * 0.12 * bell(blow), 0)
        this.armL.rotation.z = -1.8 * bell(blow)
        this.armR.rotation.z = 1.8 * bell(blow)
        break
      }
      case 'ears':
        this.armL.rotation.set(0, 0, -2.6)
        this.armR.rotation.set(0, 0, 2.6)
        this.head.rotation.z = Math.sin(tr.t * 18) * 0.12
        break
      case 'cheer':
        b.position.y += Math.abs(Math.sin(tr.t * 9)) * 0.12
        this.armL.rotation.z = -2.5
        this.armR.rotation.z = 2.5
        break
    }
    if (k >= 1) this.trick = null
  }
}
