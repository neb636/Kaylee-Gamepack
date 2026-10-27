// A patient on the vet's table: a toy animal (engine3d/characters/animal.ts) that breathes, blinks, watches the tool in her
// hand, wags, hops and shakes, plus everything a vet visit does to it: suds and mud, the thorn in the puppy's paw,
// cream and a bandage, red cheeks, a bow, the elephant's sniffle.
//
// Where a tool lands is decided by zones pinned to the toy's own pivots (the head, the chest, the sore paw, the tail),
// so they move with it: each frame the clinic projects them onto the screen and picks the nearest under the tool's tip
// (VetClinic.zoneAt). That works the same on any screen, because it's what she sees.
import { Group, Mesh, MeshBasicMaterial, Vector3, type Object3D } from 'three'
import { bell, clamp, span, wobble } from '../../../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../../../engine3d/characters/face'
import { PATIENT_LOOKS } from '../../../../characters/looks'
import type { Bag } from '../../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../../engine3d/geo'
import type { PatientId } from '../../sections'
import { Blobs } from './fx'
import { NEEDS, type Need } from './layout'
import { buildBowGeometry } from './tools'

export type ZoneId = 'head' | 'mouth' | 'ear' | 'nose' | 'chest' | 'belly' | 'paw' | 'hand' | 'tail'
export interface Zone {
  id: ZoneId
  obj: Object3D
  at: Vector3
  /** Meters. */
  r: number
}
/** Where things stick (suds, mud, cream): the body, the head or the sore paw. */
export type Part = 'body' | 'head' | 'paw'
export const PART_OF: Record<ZoneId, Part> = { head: 'head', mouth: 'head', ear: 'head', nose: 'head', chest: 'body', belly: 'body', paw: 'paw', hand: 'body', tail: 'body' }

type Reaction = 'hop' | 'wiggle' | 'shake' | 'shiver' | 'giggle' | 'wince'

interface Hop {
  from: Vector3
  to: Vector3
  dur: number
  arc: number
  t: number
  scale: number
  fromScale: number
  done?: () => void
}

const tmp = new Vector3()

export class Patient {
  readonly root = new Group()
  readonly rig: Rig
  readonly zones: Zone[] = []
  readonly done = new Set<Need>()
  readonly needs: Need[]
  readonly H: number
  readonly suds: Record<Part, Blobs>
  readonly mud: Blobs[] = []
  readonly cream: Blobs | null = null
  thorn: Group | null = null
  bow: Group | null = null
  private life: FaceLife
  private bands: Mesh[] = []
  private glow: Mesh[] = []
  private drop: Mesh | null = null
  private reaction: { kind: Reaction; t: number } | null = null
  private hops: Hop[] = []
  private look: Vector3 | null = null
  private headYaw = 0
  private headPitch = 0
  private phase = Math.random() * 10
  /** Cheek glow (the thermometer), 0..1. */
  heat = 0
  /** Wet after the shower (the mane droops, drops fall) until the towel. */
  wet = 0
  /** The pony's mane fluffed up by the brush, 0..1. */
  fluff = 0
  /** How happy the tail is (0 calm, 1 wagging hard). */
  wag = 0.25
  /** The sore paw held up (the puppy, until it's bandaged). */
  pawUp: boolean
  /** The elephant's head goes back (an ah... ah... or drinking from the shower), 0..1. */
  tilt = 0
  tiltGoal = 0
  /** Sitting on the waiting room's bench. */
  waiting = false
  /** Which way it turns to (radians; 0 faces her). */
  faceGoal = 0
  private sniff = 0

  constructor(readonly id: PatientId, bag: Bag) {
    const look = PATIENT_LOOKS[id]
    this.rig = buildAnimal(look, bag)
    this.H = look.height
    this.root.add(this.rig.root)
    this.root.userData.pick = 'patient'
    this.life = new FaceLife(this.rig)
    this.needs = NEEDS[id]
    this.pawUp = id === 'puppy'
    const { body, head, armL, armR, tail, face } = this.rig
    const { R, headY } = face
    const H = this.H
    const c = 'chub' in look ? look.chub : 1
    const zone = (zid: ZoneId, obj: Object3D, at: [number, number, number], r: number) => this.zones.push({ id: zid, obj, at: new Vector3(...at), r })
    zone('head', head, [0, headY + 0.1 * R, 0.2 * R], R)
    zone('mouth', head, [face.mouth[0], face.mouth[1], face.mouth[2] + 0.05 * R], 0.38 * R)
    zone('chest', body, [0, 0.42 * H, 0.15 * H * c], 0.1 * H)
    zone('belly', body, [0, 0.26 * H, 0.16 * H * c], 0.13 * H)
    zone('paw', armR, [0.05 * H, -0.15 * H, 0.02 * H], 0.075 * H)
    zone('hand', armL, [-0.05 * H, -0.15 * H, 0.02 * H], 0.07 * H)
    if (tail) zone('tail', tail, [0, 0.1 * H, -0.06 * H], 0.08 * H)
    if (id === 'pony') for (const s of [-1, 1]) zone('ear', head, [s * 0.5 * R, headY + 0.98 * R, -0.05 * R], 0.28 * R)
    if (id === 'elephant') zone('nose', head, [0, headY - 0.62 * R, 1.5 * R], 0.32 * R)
    if (id === 'puppy') for (const s of [-1, 1]) zone('ear', head, [s * 0.94 * R, headY - 0.05 * R, 0], 0.3 * R)

    this.suds = { body: new Blobs('#FFFFFF', 40, body, bag), head: new Blobs('#FFFFFF', 24, head, bag), paw: new Blobs('#FFFFFF', 10, armR, bag) }
    // Two red glows on the cheeks (the thermometer).
    for (const s of [-1, 1]) {
      const g = new Mesh(bag.add(P.sphere(0.16 * R, '#fff', { scale: [1.3, 0.75, 0.35] })), bag.add(new MeshBasicMaterial({ color: '#FF3B5C', transparent: true, opacity: 0, depthWrite: false })))
      g.position.set(s * 0.56 * R, headY - (id === 'pony' ? 0.08 : 0.2) * R, Math.sqrt(R * R - (0.56 * R) ** 2) + 0.03 * R)
      g.rotation.y = Math.asin(s * 0.56)
      head.add(g)
      this.glow.push(g)
    }
    if (id === 'puppy') {
      // A thorn in the sore paw's pad, and room on the paw for cream and a bandage.
      this.thorn = solid(merge([P.cone(0.012 * H * 1.6, 0.07 * H, '#7A4A3A', { rot: [0.9, 0, 0.3] })]), bag, 2)
      this.thorn.position.set(0.055 * H, -0.18 * H, 0.06 * H)
      armR.add(this.thorn)
      ;(this as { cream: Blobs | null }).cream = new Blobs('#FFFFFF', 14, armR, bag)
      for (let i = 0; i < 3; i++) {
        const b = new Mesh(bag.add(P.cyl(0.062 * H, 0.062 * H, 0.03 * H, '#fff', {}, 18)), new MeshBasicMaterial())
        b.position.set(0.05 * H + i * 0.006 * H, -0.105 * H - i * 0.028 * H, 0.005 * H)
        b.rotation.z = 0.35
        b.visible = false
        armR.add(b)
        this.bands.push(b)
      }
    }
    if (id === 'pony') {
      // Mud all over (the bath washes it off).
      const bodyMud = new Blobs('#8A6248', 16, body, bag, 0)
      const headMud = new Blobs('#8A6248', 8, head, bag, 0)
      for (const [x, y, z, r] of [[-0.09, 0.38, 0.15, 0.05], [0.1, 0.3, 0.15, 0.06], [-0.02, 0.22, 0.17, 0.05], [0.13, 0.45, 0.08, 0.04], [-0.14, 0.27, 0.07, 0.05], [-0.09, 0.1, 0.06, 0.045], [0.1, 0.06, 0.06, 0.05], [0.05, 0.47, 0.13, 0.035]]) bodyMud.add(new Vector3(x * H, y * H, z * H), r * H)
      for (const [x, y, z, r] of [[-0.55, 0.15, 0.75, 0.2], [0.6, -0.1, 0.72, 0.18], [0.2, 0.55, 0.8, 0.16], [-0.25, -0.5, 0.9, 0.15]]) headMud.add(new Vector3(x * R, headY + y * R, z * R), r * R)
      this.mud.push(bodyMud, headMud)
    }
    if (id === 'elephant') {
      // A sniffle on the end of the trunk.
      this.drop = new Mesh(bag.add(P.sphere(0.09 * R, '#fff', { scale: [1, 1.3, 1] })), bag.add(new MeshBasicMaterial({ color: '#BFE9FF' })))
      this.drop.position.set(0, headY - 0.72 * R, 1.6 * R)
      head.add(this.drop)
    }
  }

  get healed() {
    return this.needs.every((n) => this.done.has(n))
  }
  /** The next thing it needs (the 👆 and the thought bubble), or null. */
  get next(): Need | null {
    return this.needs.find((n) => !this.done.has(n)) ?? null
  }
  /** Marks a need done; true the first time. */
  finish(n: Need) {
    if (this.done.has(n) || !this.needs.includes(n)) return false
    this.done.add(n)
    if (n === 'bandage') this.pawUp = false
    if (n === 'tissue' && this.drop) this.drop.visible = false
    return true
  }

  zoneWorld(z: Zone, out = new Vector3()) {
    return z.obj.localToWorld(out.copy(z.at))
  }
  /** The group a part's blobs ride on. */
  partObj(p: Part): Object3D {
    return p === 'head' ? this.rig.head : p === 'paw' ? this.rig.armR : this.rig.body
  }

  /** Wraps the sore paw one more turn (up to 3) in a color. */
  wrap(n: number, color: string) {
    this.bands.forEach((b, i) => {
      b.visible = i < n
      ;(b.material as MeshBasicMaterial).color.set(color)
    })
  }
  /** A bow on top of its head (another bow replaces it). */
  putBow(color: string, bag: Bag) {
    if (this.bow) this.bow.removeFromParent()
    const { R, headY } = this.rig.face
    const b = solid(buildBowGeometry(color, 0.9), bag, 2)
    b.position.set(0.35 * R, headY + 0.92 * R, 0.25 * R)
    b.rotation.set(0.1, 0, -0.35)
    this.rig.head.add(b)
    this.bow = b
  }

  react(kind: Reaction) {
    this.reaction = { kind, t: 0 }
  }
  lookAt(v: Vector3 | null) {
    this.look = v ? (this.look ?? new Vector3()).copy(v) : null
  }
  /** Hops to a spot in the world (`scale`: its size when it lands; the waiting room is farther away). */
  hopTo(to: Vector3, o: { dur?: number; arc?: number; scale?: number; delay?: number; done?: () => void } = {}) {
    this.hops.push({ from: new Vector3(), to: to.clone(), dur: o.dur ?? 0.5, arc: o.arc ?? 0.4, t: -(o.delay ?? 0), scale: o.scale ?? this.root.scale.x, fromScale: 1, done: o.done })
  }
  get hopping() {
    return this.hops.length > 0
  }

  update(dt: number, t: number) {
    const { body, head, armR, armL, tail, mane } = this.rig
    const H = this.H
    this.life.update(dt)
    let turn = this.faceGoal - this.root.rotation.y
    turn = Math.atan2(Math.sin(turn), Math.cos(turn))
    this.root.rotation.y += turn * (1 - Math.exp(-dt * 8))
    // ---- Hops (in from the door, onto the scale, up on the table, off to the waiting room) ----
    let squash = 1
    const hp = this.hops[0]
    if (hp) {
      hp.t += dt
      if (hp.t >= 0) {
        if (hp.t - dt < 0 || hp.from.lengthSq() === 0) {
          hp.from.copy(this.root.position)
          hp.fromScale = this.root.scale.x
        }
        const k = clamp(hp.t / hp.dur)
        this.root.position.lerpVectors(hp.from, hp.to, k)
        this.root.position.y += bell(k) * hp.arc
        this.root.scale.setScalar(hp.fromScale + (hp.scale - hp.fromScale) * k)
        squash = 1 + 0.12 * bell(k) - 0.15 * bell(span(k, 0.85, 1))
        if (k >= 1) {
          this.hops.shift()
          this.reaction = { kind: 'wiggle', t: 0.3 }
          hp.done?.()
        }
      }
    }
    // ---- Breathing, and a reaction on top ----
    const breath = 1 + Math.sin(t * 2.8 + this.phase) * 0.02
    let sy = breath * squash
    let rz = 0
    let y = 0
    let shiver = 0
    const r = this.reaction
    if (r) {
      r.t += dt
      const dur = r.kind === 'shake' ? 0.9 : r.kind === 'hop' ? 0.55 : 0.6
      const p = Math.min(1, r.t / dur)
      if (r.kind === 'hop') {
        y = bell(span(p, 0.2, 0.85)) * 0.22 * H
        sy *= 1 - 0.14 * bell(span(p, 0, 0.22)) + 0.08 * bell(span(p, 0.2, 0.85)) - 0.1 * bell(span(p, 0.82, 1))
      } else if (r.kind === 'shake') rz = Math.sin(p * Math.PI * 9) * 0.22 * (1 - p)
      else if (r.kind === 'shiver') shiver = (1 - p) * 0.06
      else if (r.kind === 'wince') sy *= 1 - 0.12 * bell(p)
      else if (r.kind === 'giggle') {
        rz = Math.sin(p * Math.PI * 6) * 0.08 * (1 - p)
        sy *= 1 + 0.06 * Math.sin(p * Math.PI * 6)
      } else rz = Math.sin(p * Math.PI * 6) * 0.12 * (1 - p)
      if (p >= 1) this.reaction = null
    }
    body.position.set(shiver ? Math.sin(t * 70) * shiver * 0.1 * H : 0, y, 0)
    body.rotation.z = rz
    body.scale.set(1 / Math.sqrt(sy), sy, 1 / Math.sqrt(sy))
    // ---- Head: watch the tool (or her), tip back for the elephant's ah... ah... ----
    let wantYaw = 0
    let wantPitch = 0
    if (this.look && !this.waiting) {
      this.root.updateWorldMatrix(true, false)
      const local = this.root.worldToLocal(tmp.copy(this.look))
      local.y -= 0.52 * H
      wantYaw = clamp(Math.atan2(local.x, Math.max(0.05, local.z)), -0.7, 0.7)
      wantPitch = clamp(-Math.atan2(local.y - 0.2 * H, Math.max(0.1, Math.hypot(local.x, local.z))), -0.4, 0.45)
    }
    this.tilt += (this.tiltGoal - this.tilt) * (1 - Math.exp(-dt * 5))
    const k = 1 - Math.exp(-dt * 7)
    this.headYaw += (wantYaw - this.headYaw) * k
    this.headPitch += (wantPitch - this.headPitch) * k
    head.rotation.set(this.headPitch * (1 - this.tilt) - 0.6 * this.tilt, this.headYaw * (1 - this.tilt), 0)
    // ---- The sore paw up (it trembles a little), the other arm at its side ----
    const up = this.pawUp ? 1 : 0
    armR.rotation.x += (-1.25 * up - armR.rotation.x) * (1 - Math.exp(-dt * 6))
    armR.rotation.z = 0.25 * up + Math.sin(t * 9) * 0.03 * up
    armL.rotation.z = Math.sin(t * 2 + this.phase) * 0.04
    // ---- The tail wags (harder when happy) ----
    this.wag = Math.max(0.25, this.wag - dt * 0.15)
    if (tail) tail.rotation.y = Math.sin(t * (6 + this.wag * 10)) * (0.15 + this.wag * 0.45)
    // ---- Wet and fluffy: the pony's mane droops when wet and puffs up when brushed ----
    if (mane) {
      const s = 1 - 0.18 * this.wet + 0.3 * this.fluff
      mane.scale.set(1 + 0.15 * this.fluff, s, 1 + 0.2 * this.fluff)
    }
    // ---- Red cheeks (the thermometer), cooling down slowly ----
    for (const g of this.glow) (g.material as MeshBasicMaterial).opacity = clamp(this.heat) * 0.75
    // ---- The elephant's sniffle: it swells and sniffs back up ----
    if (this.drop?.visible) {
      this.sniff += dt
      const p = (this.sniff % 2.6) / 2.6
      this.drop.scale.setScalar(0.4 + 0.8 * span(p, 0, 0.75) - 0.9 * span(p, 0.8, 0.9))
    }
    for (const b of [...Object.values(this.suds), ...this.mud, ...(this.cream ? [this.cream] : [])]) b.update(dt, t)
    // A little settle wobble after it lands.
    if (this.reaction?.kind === 'wiggle') body.scale.y *= 1 + wobble(Math.min(1, this.reaction.t / 0.6), 2) * 0.05
  }
}
