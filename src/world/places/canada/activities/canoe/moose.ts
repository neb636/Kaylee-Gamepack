// The moose wading at the east shore of Red Canoe's lake, on the chibi rig (CANADA_LOOKS.moose, the same gentle moose
// who turns up at every stop). He stands knee-deep, dips his big nose into the water for weeds, lifts his dripping head
// and chews, flicks his ears, and looks at the canoe when it glides close. Poked, he lifts his head right up (a little
// lean back first), shakes his antlers, and his mouth moves with his own voice.
import { Group, Vector3 } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { CANADA_LOOKS } from '../../characters/looks'

const POKE_S = 2.2

export class Moose {
  readonly root = new Group()
  readonly rig: Rig
  readonly height: number
  /** How far his head is up (0 = nose in the water, 1 = up and chewing): the world drips water off his chin. */
  up = 1
  private life: FaceLife
  private dip = 0
  private next = 3 + Math.random() * 3
  private pokeT = -1
  private phase = Math.random() * 6
  private lookAt: Vector3 | null = null

  constructor(bag: Bag, height = 2.5) {
    this.rig = buildAnimal({ ...CANADA_LOOKS.moose, height }, bag)
    this.height = height
    this.root.add(this.rig.root)
    this.rig.root.children[0].visible = false // (knee-deep in the lake: no shadow)
    this.life = new FaceLife(this.rig, 'moose')
  }

  get busy() {
    return this.pokeT >= 0
  }
  poke() {
    this.pokeT = 0
  }
  /** Something to look at when his head is up (the canoe), or null. */
  watch(p: Vector3 | null) {
    this.lookAt = p
  }
  /** His chin in the world (water drips from it). */
  chin(out: Vector3) {
    return this.rig.head.localToWorld(out.set(0, this.rig.face.headY - this.rig.face.R * 0.95, this.rig.face.R * 0.6))
  }

  update(dt: number, t: number) {
    const { body, head, armL, armR, tail, mouth } = this.rig
    const ease = (r: number) => 1 - Math.exp(-dt * r)
    this.life.update(dt)
    // Grazing: head down for a few seconds, up for a few (always while poked).
    this.next -= dt
    if (this.next < 0) {
      this.dip = this.dip > 0.5 ? 0 : 1
      this.next = this.dip ? 3 + Math.random() * 2.5 : 4 + Math.random() * 4
    }
    let poke = 0
    if (this.pokeT >= 0) {
      this.pokeT += dt
      poke = bell(span(this.pokeT / POKE_S, 0, 1))
      if (this.pokeT > POKE_S) this.pokeT = -1
      this.dip = 0
    }
    const goal = this.dip ? 0 : 1
    this.up += (goal - this.up) * ease(this.dip ? 1.6 : 2.4)
    const down = 1 - this.up
    // Down: he leans forward and drops his head to the water. Up: he chews (a wobble of the jaw) and looks round.
    const chew = this.up > 0.7 ? Math.sin(t * 7) * 0.03 : 0
    // A poke: a little lean back first (anticipation), then his head goes up high and the antlers shake.
    const lean = this.pokeT >= 0 ? (this.pokeT < 0.25 ? 0.08 * (this.pokeT / 0.25) : -0.12 * poke) : 0
    body.rotation.x = 0.32 * down - lean
    body.position.y = -0.04 * down
    body.scale.y = 1 + 0.015 * Math.sin(t * 1.8 + this.phase)
    let yaw = Math.sin(t * 0.35 + this.phase) * 0.25
    if (this.lookAt && this.up > 0.6) {
      this.root.updateMatrixWorld(true)
      const l = this.root.worldToLocal(this.lookAt.clone())
      yaw = clamp(Math.atan2(l.x, l.z), -0.9, 0.9)
    }
    const shake = this.pokeT >= 0 ? Math.sin(this.pokeT * 18) * 0.18 * poke : 0
    head.rotation.x += (0.85 * down - 0.35 * poke + chew - head.rotation.x) * ease(6)
    head.rotation.y += (yaw * this.up - head.rotation.y) * ease(3)
    head.rotation.z = shake
    mouth.scale.y = 1 + chew * 8
    // His front legs (the rig's arms) shift as he leans; the little tail flicks.
    armL.rotation.x = -0.35 * down
    armR.rotation.x = -0.35 * down + Math.sin(t * 0.9) * 0.03
    if (tail) tail.rotation.z = Math.sin(t * 5 + this.phase) * 0.25 * (0.4 + poke)
  }
}
