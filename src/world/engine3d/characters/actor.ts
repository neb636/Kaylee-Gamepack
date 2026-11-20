// A film actor (docs/films.md): any toy animal on the chibi rig (a Look, characters/look.ts) with what a film needs
// from them. They stand somewhere, waddle or hop to a mark, wave, pull a face (sad, wow, happy), ride on someone's
// back, and a bird flies. Their mouth moves with their own voice. A film tells them what to do in a beat's `start` or
// a cue; `update` plays it out. Everything is set each frame (never added to), so an action can be cut off by the
// next without leaving a limb behind. The Poles' story (places/poles/story/actor.ts) and Canada's
// (places/canada/story/) cast their friends as these.
import { Group, Vector3, type Object3D } from 'three'
import { bell, smooth as easeIO } from '../../../sdk'
import { buildAnimal, type Rig } from './animal'
import { FaceLife } from './face'
import type { Bag } from '../dispose'
import type { Look } from './look'

const DEG = Math.PI / 180

export type Face = 'sad' | 'wow' | 'happy'

interface Move {
  from: Vector3
  to: Vector3
  t: number
  dur: number
  face: number | null
  /** How high the middle of the move lifts (a hop, a swoop), meters. */
  arc: number
  kind: 'walk' | 'hop' | 'fly' | 'slide' | 'glide'
}

export class FilmActor {
  /** Where they stand and which way they face. */
  readonly root = new Group()
  /** Leans and tips inside the root (a bow, a bird flying flat). */
  private pose = new Group()
  readonly rig: Rig
  readonly height: number
  private life: FaceLife
  private move: Move | null = null
  private face: { kind: Face; t: number; hold: boolean } | null = null
  private droop = 0
  private droopGoal = 0
  private hopT = -1
  private waveT = -1
  private shakeT = -1
  private nodT = -1
  private phase = Math.random() * 6
  /** A bird in the air: wings out and beating. */
  flying = false
  /** Arms held up (a cheer, a hug), 0..1. */
  armsUp = 0
  /** Leaning forward (radians): a bow, a peer into a crate. */
  lean = 0
  /** Turning the head (radians, + to their left). */
  headTurn = 0
  /** Waddling on the spot while a game moves them itself (0..1: how fast). */
  waddle = 0
  private home: Object3D | null = null

  /** A wave is a flutter of the whole wing (a bird, a penguin's flipper). */
  private flutter: boolean

  /** `look`: what they look like; `voice`: their speaker in cast.json (null or left out: a silent extra); `height`
   *  overrides the look's (film sizes are often a little bigger than life, so small faces read). */
  constructor(readonly look: Look, bag: Bag, opts: { height?: number; voice?: string | null; flutter?: boolean } = {}) {
    this.height = opts.height ?? look.height
    this.rig = buildAnimal({ ...look, height: this.height }, bag)
    this.pose.add(this.rig.root)
    this.root.add(this.pose)
    this.root.visible = false
    this.flutter = opts.flutter ?? (look.species === 'penguin' || look.species === 'tern' || look.species === 'hornbill' || look.species === 'pelican' || look.species === 'hen')
    this.life = new FaceLife(this.rig, opts.voice ?? undefined)
  }

  get pos() {
    return this.root.position
  }
  get busy() {
    return !!this.move
  }

  /** Stands them at a mark, facing `face` degrees (0: toward +z, the usual camera side), and shows them. */
  place(x: number, y: number, z: number, face = 0) {
    this.release()
    this.move = null
    this.root.position.set(x, y, z)
    this.root.rotation.set(0, face * DEG, 0)
    this.root.visible = true
    return this
  }
  hide() {
    this.release()
    this.move = null
    this.root.visible = false
    this.flying = false
    this.armsUp = 0
    this.lean = 0
    this.headTurn = 0
    this.cheer()
  }
  /** Turns to look at a point on the ground. */
  turnTo(x: number, z: number) {
    this.root.rotation.y = Math.atan2(x - this.pos.x, z - this.pos.z)
  }
  /** Waddles to a mark in `dur` seconds, then turns to `face` degrees (null: stays facing the way they walked). */
  walkTo(x: number, z: number, dur: number, face: number | null = null) {
    this.go('walk', x, this.pos.y, z, dur, face, 0)
  }
  /** One big hop to a mark. */
  hopTo(x: number, y: number, z: number, dur = 0.7, face: number | null = null, arc = 0.6) {
    this.go('hop', x, y, z, dur, face, arc)
  }
  /** Flies to a mark (Terry): wings out on the way, folded when `land` is true and they arrive. */
  flyTo(x: number, y: number, z: number, dur: number, face: number | null = null, arc = 0.8, land = false) {
    this.flying = true
    this.go('fly', x, y, z, dur, face, arc)
    this.landing = land
  }
  private landing = false
  /** Slides to a mark on their tummy (a penguin). */
  slideTo(x: number, z: number, dur: number, face: number | null = null) {
    this.go('slide', x, this.pos.y, z, dur, face, 0)
  }
  /** Glides to a mark on skates (or over water): eased, leaning into it, swaying from foot to foot. */
  glideTo(x: number, z: number, dur: number, face: number | null = null) {
    this.go('glide', x, this.pos.y, z, dur, face, 0)
  }
  private go(kind: Move['kind'], x: number, y: number, z: number, dur: number, face: number | null, arc: number) {
    this.release()
    const from = this.pos.clone()
    this.move = { from, to: new Vector3(x, y, z), t: 0, dur: Math.max(0.01, dur), face, arc, kind }
    if (Math.hypot(x - from.x, z - from.z) > 0.05) this.root.rotation.y = Math.atan2(x - from.x, z - from.z)
    this.root.visible = true
  }

  /** A hop on the spot. */
  hop() {
    this.hopT = 0
  }
  wave() {
    this.waveT = 0
  }
  /** A wet-dog shake (or a shiver). */
  shake() {
    this.shakeT = 0
  }
  nod() {
    this.nodT = 0
  }
  /** Pulls a face for a moment; `hold` keeps it (a sad droop lasts until `cheer`). */
  pull(kind: Face, hold = false) {
    this.face = { kind, t: 0, hold }
    this.droopGoal = kind === 'sad' ? 1 : 0
  }
  /** Back to their usual self. */
  cheer() {
    this.face = null
    this.droopGoal = 0
    this.rig.mouth.scale.set(1, 1, 1)
  }

  /** Rides on something (someone's back, the balloon's basket, the narwhal): keeps this spot on it until `release`. */
  ride(on: Object3D, x: number, y: number, z: number, face = 0) {
    this.move = null
    this.home = this.root.parent
    on.add(this.root)
    this.root.position.set(x, y, z)
    this.root.rotation.set(0, face * DEG, 0)
    this.root.visible = true
  }
  /** Gets off whatever they ride, staying where they are in the world. */
  release() {
    const back = this.home
    if (!back) return
    this.home = null
    const p = this.root.getWorldPosition(new Vector3())
    back.add(this.root)
    this.root.position.copy(p)
  }
  /** The middle of their face, in the world (a shot's look point). */
  head(out = new Vector3()) {
    return this.rig.head.localToWorld(out.set(0, this.rig.face.headY, 0))
  }
  /** A point `up` of their height above their feet, in the world. */
  at(up = 0.5, out = new Vector3()) {
    return this.root.localToWorld(out.set(0, this.height * up, 0))
  }

  update(dt: number, t: number) {
    if (!this.root.visible) return
    this.life.update(dt)
    const r = this.rig
    let lift = 0
    let squash = 0
    let rock = 0
    let tip = this.lean
    let flap = 0

    const m = this.move
    if (m) {
      m.t = Math.min(1, m.t + dt / m.dur)
      const k = m.kind === 'walk' ? m.t : easeIO(m.t)
      this.pos.lerpVectors(m.from, m.to, k)
      if (m.kind === 'walk') {
        // A waddle: a bounce each step and a rock from side to side.
        lift = Math.abs(Math.sin(t * 11)) * 0.05 * this.height
        rock = Math.sin(t * 11) * 0.1
      } else if (m.kind === 'hop') {
        this.pos.y += bell(m.t) * m.arc
        squash = m.t < 0.15 ? 0.2 * bell(m.t / 0.3) : m.t > 0.85 ? 0.2 * bell((m.t - 0.85) / 0.3) : -0.1 * bell(m.t)
      } else if (m.kind === 'fly') {
        this.pos.y += bell(m.t) * m.arc
      } else if (m.kind === 'glide') {
        // Skating: a lean into it while moving, a slow sway from skate to skate.
        tip += 0.2 * bell(m.t)
        rock = Math.sin(t * 5.5 + this.phase) * 0.09 * bell(m.t)
      } else {
        tip = 1.35
      }
      if (m.t >= 1) {
        this.move = null
        if (m.face !== null) this.root.rotation.y = m.face * DEG
        if (m.kind === 'fly' && this.landing) this.flying = false
      }
    }
    if (!m && this.waddle > 0.01) {
      lift = Math.abs(Math.sin(t * 11)) * 0.05 * this.height * this.waddle
      rock = Math.sin(t * 11) * 0.1 * this.waddle
    }
    if (this.hopT >= 0) {
      this.hopT += dt / 0.55
      if (this.hopT >= 1) this.hopT = -1
      else {
        lift += bell(this.hopT) * 0.3 * this.height
        squash += this.hopT < 0.2 ? 0.18 * bell(this.hopT / 0.4) : -0.08 * bell(this.hopT)
      }
    }
    if (this.waveT >= 0 && (this.waveT += dt / 1.6) >= 1) this.waveT = -1
    if (this.shakeT >= 0 && (this.shakeT += dt / 0.9) >= 1) this.shakeT = -1
    if (this.nodT >= 0 && (this.nodT += dt / 0.8) >= 1) this.nodT = -1
    const wave = this.waveT >= 0 ? bell(this.waveT) : 0
    const shake = this.shakeT >= 0 ? Math.sin(this.shakeT * 38) * (1 - this.shakeT) : 0

    if (this.flying) {
      // A bird in the air: flat along the way it flies, wings beating.
      tip = 1.15
      flap = Math.sin(t * 13 + this.phase)
      lift += Math.sin(t * 13 + this.phase + 1.2) * 0.04
    }

    this.droop += (this.droopGoal - this.droop) * Math.min(1, dt * 4)
    const d = this.droop
    const breathe = 0.022 * Math.sin(t * 2.6 + this.phase)
    r.body.position.y = lift
    r.body.scale.set(1 + squash * 0.6, 1 - squash + breathe, 1 + squash * 0.6)
    r.body.rotation.set(d * 0.12, 0, rock + 0.3 * shake + (d > 0.01 && !m ? Math.sin(t * 1.3) * 0.03 * d : 0))
    this.pose.rotation.x += (tip - this.pose.rotation.x) * Math.min(1, dt * 9)
    // (Lying forward, the tummy comes down to the ground.)
    this.pose.position.y = Math.sin(Math.min(1.5, Math.abs(this.pose.rotation.x))) * this.height * (this.flying ? 0 : 0.22)

    // The arms (or flippers, or wings): hanging, up in a cheer, the right one waving, a bird's beating.
    if (this.flying) {
      const z = Math.PI / 2 + 0.45 * flap + 0.08
      r.armR.rotation.set(0, 0, z)
      r.armL.rotation.set(0, 0, -z)
    } else {
      const up = this.armsUp
      const hang = 0.14 + d * 0.1
      const flutter = this.flutter ? Math.max(0, wave) * Math.sin(t * 22) * 0.5 : 0
      r.armR.rotation.set(-0.15 * d, 0, hang + up * 2.3 + wave * (2.2 + 0.4 * Math.sin(t * 15)) + flutter)
      r.armL.rotation.set(-0.15 * d, 0, -(hang + up * 2.3 + flutter))
    }
    if (r.tail) r.tail.rotation.z = 0.4 * Math.sin(t * 3 + this.phase) * (0.3 + Math.abs(shake))

    // The face.
    let nod = d * 0.38 + (this.nodT >= 0 ? 0.3 * Math.sin(this.nodT * Math.PI * 2) : 0)
    let tilt = 0.16 * wave - 0.3 * shake
    const f = this.face
    if (f) {
      f.t += dt / 1.5
      const k = f.hold ? Math.min(1, f.t * 3) : bell(Math.min(1, f.t * 1.25))
      if (f.kind === 'sad') {
        r.eyes.scale.y = Math.min(r.eyes.scale.y, 1 - k * 0.5)
        r.mouth.scale.set(1 - k * 0.35, 1 - k * 0.55, 1)
      } else if (f.kind === 'wow') {
        r.eyes.scale.y = 1 + k * 0.28
        r.mouth.scale.set(1 - k * 0.3, 1 + k * 0.7, 1)
        nod -= k * 0.16
      } else {
        r.eyes.scale.y = Math.max(0.2, 1 - k * 0.75)
        r.mouth.scale.setScalar(1 + k * 0.45)
        tilt += Math.sin(f.t * 9) * 0.12 * k
      }
      if (f.t >= 1 && !f.hold) {
        this.face = null
        r.mouth.scale.set(1, 1, 1)
      }
    }
    // (Flying flat, the head lifts to look where it's going.)
    r.head.rotation.set(nod - (this.flying ? 0.9 : 0) - (this.pose.rotation.x > 0.6 && !this.flying ? 0.8 : 0), this.headTurn, tilt)
  }
}
