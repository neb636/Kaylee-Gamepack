// A hand-built toy character (the ones the chibi rig has no shape for: Tuque the snowman, Lulu the loon, Gus's
// geese) with the same directions a film gives a rig actor (engine3d/characters/actor.ts FilmActor): stand at a mark,
// walk, hop, glide or fly to another, wave, nod, shake, pull a face, talk in their own voice. A subclass builds its
// parts into `body` and moves them in `animate()` from the pose worked out here (how open the mouth is, how far
// through a wave, a blink), so every toy breathes, blinks and talks without writing that again.
//
// `Performer` is what the two kinds of actor share: the films, the map and the big game direct either the same way.
import { Group, Vector3, type Object3D } from 'three'
import { bell, smooth as easeIO, speechLevel } from '../../../../sdk'
import type { Face, FilmActor } from '../../../engine3d/characters/actor'
import type { Silly } from '../../../engine3d/characters/face'

const DEG = Math.PI / 180

/** What a film, the map or the game can ask of anyone in the cast, rig-built or hand-built. */
export interface Performer {
  /** Where they stand and which way they face (a Group in the scene). */
  readonly root: Group
  /** Meters, to the top of the head. */
  readonly height: number
  readonly pos: Vector3
  /** Still on the way to a mark. */
  readonly busy: boolean
  /** Stands them at a mark, facing `face` degrees (0: toward +z, the usual camera side), and shows them. */
  place(x: number, y: number, z: number, face?: number): Performer
  hide(): void
  /** Turns to look at a point on the ground. */
  turnTo(x: number, z: number): void
  /** Waddles to a mark in `dur` seconds, then turns to `face` degrees (null: stays facing the way they walked). */
  walkTo(x: number, z: number, dur: number, face?: number | null): void
  /** One big hop to a mark. */
  hopTo(x: number, y: number, z: number, dur?: number, face?: number | null, arc?: number): void
  /** Glides to a mark (on skates, or over the water). */
  glideTo(x: number, z: number, dur: number, face?: number | null): void
  /** Flies to a mark (only a bird looks right doing it). */
  flyTo(x: number, y: number, z: number, dur: number, face?: number | null, arc?: number, land?: boolean): void
  /** A hop on the spot, a wave, a wet-dog shake (or a shiver), a nod. */
  hop(): void
  wave(): void
  shake(): void
  nod(): void
  /** Pulls a face for a moment (sad, wow, happy); `hold` keeps it until `cheer()`. */
  pull(kind: Face, hold?: boolean): void
  cheer(): void
  /** Pulls a silly face (crossed, soaked, dazzled, dizzy, sudsy) for `seconds`: the laugh of each toy's big moment. */
  silly(face: Silly, seconds?: number): void
  /** Rides on something (a canoe, a bike, someone's back) at this spot on it, until `release()`. */
  ride(on: Object3D, x: number, y: number, z: number, face?: number): void
  release(): void
  /** The middle of their face, in the world (a shot's look point). */
  head(out?: Vector3): Vector3
  /** A point `up` of their height above their feet, in the world. */
  at(up?: number, out?: Vector3): Vector3
  update(dt: number, t: number): void
  /** Arms (or wings) held up, 0..1. */
  armsUp: number
  /** Leaning forward, radians. */
  lean: number
  /** Turning the head, radians (+ to their left). */
  headTurn: number
  flying: boolean
}
/** (A rig actor is a Performer too: this line fails to compile if the two drift apart.) */
export const asPerformer = (a: FilmActor): Performer => a

interface Move {
  from: Vector3
  to: Vector3
  t: number
  dur: number
  face: number | null
  arc: number
  kind: 'walk' | 'hop' | 'fly' | 'glide'
}

/** This frame's pose, for a subclass's `animate()`. */
export interface ToyPose {
  /** Mouth (or beak) open with their voice, 0..1. */
  talk: number
  /** Eyes: 1 open .. 0.1 shut (a blink). */
  lid: number
  /** A wave under way: 0 none .. 1 at its top. */
  wave: number
  /** A wet-dog shake: -1..1, dying away. */
  shake: number
  /** A nod: radians forward. */
  nod: number
  /** A sad droop, 0..1. */
  droop: number
  /** A face being pulled (its strength 0..1), or null. */
  face: { kind: Face; k: number } | null
  /** A silly face being pulled (the subclass swaps its own eyes for it), or null. */
  silly: Silly | null
  /** Moving this frame, and how. */
  moving: Move['kind'] | null
  /** Wings beating: -1..1 while flying, else 0. */
  flap: number
  armsUp: number
  headTurn: number
  /** A slow breath, -1..1. */
  breath: number
}

export abstract class ToyActor implements Performer {
  /** Where they stand and which way they face. */
  readonly root = new Group()
  /** Leans and tips inside the root. */
  protected tilt = new Group()
  /** Bounces and squashes: the subclass builds its parts in here. */
  readonly body = new Group()
  private move: Move | null = null
  private faceNow: { kind: Face; t: number; hold: boolean } | null = null
  private sillyNow: Silly | null = null
  private sillyT = 0
  private droop = 0
  private droopGoal = 0
  private hopT = -1
  private waveT = -1
  private shakeT = -1
  private nodT = -1
  private level = 0
  private nextBlink = 0.8 + Math.random() * 3
  private blink = -1
  private home: Object3D | null = null
  private landing = false
  protected phase = Math.random() * 6
  flying = false
  armsUp = 0
  lean = 0
  headTurn = 0

  /** `voice`: their speaker in cast.json (none: silent). */
  constructor(
    readonly height: number,
    private voice?: string,
  ) {
    this.tilt.add(this.body)
    this.root.add(this.tilt)
    this.root.visible = false
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
  turnTo(x: number, z: number) {
    this.root.rotation.y = Math.atan2(x - this.pos.x, z - this.pos.z)
  }
  walkTo(x: number, z: number, dur: number, face: number | null = null) {
    this.go('walk', x, this.pos.y, z, dur, face, 0)
  }
  hopTo(x: number, y: number, z: number, dur = 0.7, face: number | null = null, arc = 0.6) {
    this.go('hop', x, y, z, dur, face, arc)
  }
  /** Glides to a mark (on skates, or over the water). */
  glideTo(x: number, z: number, dur: number, face: number | null = null) {
    this.go('glide', x, this.pos.y, z, dur, face, 0)
  }
  /** Flies to a mark: wings out on the way, folded when `land` is true and they arrive. */
  flyTo(x: number, y: number, z: number, dur: number, face: number | null = null, arc = 0.8, land = false) {
    this.flying = true
    this.go('fly', x, y, z, dur, face, arc)
    this.landing = land
  }
  private go(kind: Move['kind'], x: number, y: number, z: number, dur: number, face: number | null, arc: number) {
    this.release()
    const from = this.pos.clone()
    this.move = { from, to: new Vector3(x, y, z), t: 0, dur: Math.max(0.01, dur), face, arc, kind }
    if (Math.hypot(x - from.x, z - from.z) > 0.05) this.root.rotation.y = Math.atan2(x - from.x, z - from.z)
    this.root.visible = true
  }
  hop() {
    this.hopT = 0
  }
  wave() {
    this.waveT = 0
  }
  shake() {
    this.shakeT = 0
  }
  nod() {
    this.nodT = 0
  }
  pull(kind: Face, hold = false) {
    this.faceNow = { kind, t: 0, hold }
    this.droopGoal = kind === 'sad' ? 1 : 0
  }
  cheer() {
    this.faceNow = null
    this.droopGoal = 0
  }
  silly(face: Silly, seconds = 1.6) {
    this.sillyNow = seconds > 0 ? face : null
    this.sillyT = seconds
  }
  ride(on: Object3D, x: number, y: number, z: number, face = 0) {
    this.move = null
    this.home = this.root.parent
    on.add(this.root)
    this.root.position.set(x, y, z)
    this.root.rotation.set(0, face * DEG, 0)
    this.root.visible = true
  }
  release() {
    const back = this.home
    if (!back) return
    this.home = null
    const p = this.root.getWorldPosition(new Vector3())
    back.add(this.root)
    this.root.position.copy(p)
  }
  /** The middle of their face, in the world (a shot's look point). */
  abstract head(out?: Vector3): Vector3
  at(up = 0.5, out = new Vector3()) {
    return this.root.localToWorld(out.set(0, this.height * up, 0))
  }

  /** Move your own parts (head, wings, beak, eyes) from this frame's pose. */
  protected abstract animate(p: ToyPose, dt: number, t: number): void

  update(dt: number, t: number) {
    if (!this.root.visible) return
    let lift = 0
    let squash = 0
    let rock = 0
    let tip = this.lean
    const m = this.move
    if (m) {
      m.t = Math.min(1, m.t + dt / m.dur)
      const k = m.kind === 'walk' ? m.t : easeIO(m.t)
      this.pos.lerpVectors(m.from, m.to, k)
      if (m.kind === 'walk') {
        lift = Math.abs(Math.sin(t * 11)) * 0.05 * this.height
        rock = Math.sin(t * 11) * 0.1
      } else if (m.kind === 'hop') {
        this.pos.y += bell(m.t) * m.arc
        squash = m.t < 0.15 ? 0.2 * bell(m.t / 0.3) : m.t > 0.85 ? 0.2 * bell((m.t - 0.85) / 0.3) : -0.1 * bell(m.t)
      } else if (m.kind === 'fly') {
        this.pos.y += bell(m.t) * m.arc
      } else {
        tip += 0.2 * bell(m.t)
        rock = Math.sin(t * 5.5 + this.phase) * 0.09 * bell(m.t)
      }
      if (m.t >= 1) {
        this.move = null
        if (m.face !== null) this.root.rotation.y = m.face * DEG
        if (m.kind === 'fly' && this.landing) this.flying = false
      }
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
    const shake = this.shakeT >= 0 ? Math.sin(this.shakeT * 38) * (1 - this.shakeT) : 0
    this.droop += (this.droopGoal - this.droop) * Math.min(1, dt * 4)

    // A blink every few seconds; the mouth follows their own voice (opens fast, closes a little slower).
    this.nextBlink -= dt
    if (this.nextBlink <= 0) {
      this.blink = 0
      this.nextBlink = Math.random() < 0.2 ? 0.25 : 2.2 + Math.random() * 3.5
    }
    let lid = 1
    if (this.blink >= 0) {
      this.blink += dt / 0.16
      lid = 1 - 0.9 * bell(Math.min(1, this.blink))
      if (this.blink >= 1) this.blink = -1
    }
    const target = this.voice ? speechLevel(this.voice) : 0
    this.level += (target - this.level) * (1 - Math.exp(-dt * (target > this.level ? 30 : 14)))

    let face: ToyPose['face'] = null
    const f = this.faceNow
    if (f) {
      f.t += dt / 1.5
      face = { kind: f.kind, k: f.hold ? Math.min(1, f.t * 3) : bell(Math.min(1, f.t * 1.25)) }
      if (f.t >= 1 && !f.hold) this.faceNow = null
    }

    if (this.sillyT > 0 && (this.sillyT -= dt) <= 0) this.sillyNow = null
    const breath = Math.sin(t * 2.6 + this.phase)
    this.body.position.y = lift
    this.body.scale.set(1 + squash * 0.6, 1 - squash + 0.022 * breath, 1 + squash * 0.6)
    this.body.rotation.set(this.droop * 0.12, 0, rock + 0.3 * shake)
    this.tilt.rotation.x += (tip - this.tilt.rotation.x) * Math.min(1, dt * 9)
    this.animate(
      {
        talk: this.level,
        lid,
        wave: this.waveT >= 0 ? bell(this.waveT) : 0,
        shake,
        nod: this.droop * 0.38 + (this.nodT >= 0 ? 0.3 * Math.sin(this.nodT * Math.PI * 2) : 0),
        droop: this.droop,
        face,
        silly: this.sillyNow,
        moving: m ? m.kind : null,
        flap: this.flying ? Math.sin(t * 13 + this.phase) : 0,
        armsUp: this.armsUp,
        headTurn: this.headTurn,
        breath,
      },
      dt,
      t,
    )
  }
}
