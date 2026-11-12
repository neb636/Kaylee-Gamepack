// The die on the game table: a chunky pink die with white dots (numbers as dots, never digits). Tap it on her turn and
// it hops up, tumbles across the near edge of the table, bounces twice and settles with the rolled number on top.
// Positions are in the table top's space (x across the table, z toward the front of the house, y up from the top).
import { Group, Quaternion, Vector3, type BufferGeometry, type Mesh } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { P } from '../../../../../engine3d/geo'
import { shadows, toy } from './look'
import { PAL } from '../../../../../engine3d/toon'
import { bell } from '../../../../../../sdk'
import { sfx } from '../../../sfx'

export const DIE_SIZE = 0.07
const H = DIE_SIZE / 2

/** Which number is on which face: +y 1, -y 6, +z 2, -z 5, +x 3, -x 4 (opposite faces add up to 7). */
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [
    [-1, -1],
    [1, 1],
  ],
  3: [
    [-1, -1],
    [0, 0],
    [1, 1],
  ],
  4: [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ],
  5: [
    [-1, -1],
    [-1, 1],
    [0, 0],
    [1, -1],
    [1, 1],
  ],
  6: [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ],
}
const FACE: Record<number, (a: number, b: number) => [number, number, number]> = {
  1: (a, b) => [a, H, b],
  6: (a, b) => [a, -H, b],
  2: (a, b) => [a, b, H],
  5: (a, b) => [a, b, -H],
  3: (a, b) => [H, a, b],
  4: (a, b) => [-H, a, b],
}
/** The turn that puts face `n` on top. */
const UP: Record<number, Quaternion> = {
  1: new Quaternion(),
  6: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI),
  2: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2),
  5: new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2),
  3: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2),
  4: new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -Math.PI / 2),
}
const Y = new Vector3(0, 1, 0)
const tq = new Quaternion()

interface Roll {
  from: Vector3
  to: Vector3
  start: Quaternion
  end: Quaternion
  axis: Vector3
  spin: number
  t: number
  dur: number
  bounced: number
  done?: () => void
}

export class Die {
  readonly root = new Group()
  /** Its shade on the tray (the table adds it beside the die: it stays flat while the die tumbles). */
  readonly shadow: Mesh
  /** The number on top now. */
  value = 1
  private roll: Roll | null = null
  private slide: { from: Vector3; to: Vector3; t: number; dur: number } | null = null
  private wiggleT = -1
  private glowT = 0

  constructor(bag: Bag) {
    const parts: BufferGeometry[] = [P.rbox(DIE_SIZE, DIE_SIZE, DIE_SIZE, 0.014, PAL.hotpink)]
    const o = DIE_SIZE * 0.26
    for (const n of [1, 2, 3, 4, 5, 6]) {
      for (const [a, b] of PIPS[n]) {
        const [x, y, z] = FACE[n](a * o, b * o)
        const out = 1.02
        // Flattened against its face.
        const scale: [number, number, number] = n === 1 || n === 6 ? [1, 0.35, 1] : n === 2 || n === 5 ? [1, 1, 0.35] : [0.35, 1, 1]
        parts.push(P.sphere(DIE_SIZE * 0.085, '#FFFFFF', { at: [x * out, y * out, z * out], scale }, 8))
      }
    }
    this.root.add(toy((parts), bag, 1.5))
    this.root.userData.pick = 'trip:table:die'
    this.shadow = shadows(bag, [[0, 0, 0.04, 0.035]])
  }

  get busy() {
    return !!this.roll || !!this.slide || this.wiggleT >= 0
  }
  get rolling() {
    return !!this.roll
  }

  /** Puts it down at once, `n` on top. */
  place(at: Vector3, n = this.value) {
    this.roll = null
    this.slide = null
    this.value = n
    this.root.position.copy(at).setY(H)
    this.root.quaternion.copy(UP[n])
  }

  /** Slides it over to whoever's turn it is. */
  slideTo(at: Vector3, dur = 0.35) {
    if (this.roll) return
    this.slide = { from: this.root.position.clone(), to: at.clone().setY(H), t: 0, dur }
  }

  /** Throws it from where it is to `to`, tumbling for `dur` seconds, and lands on `n`. */
  rollTo(n: number, to: Vector3, dur: number, done?: () => void) {
    this.slide = null
    this.wiggleT = -1
    const yaw = (Math.random() - 0.5) * 1.2
    const end = new Quaternion().setFromAxisAngle(Y, yaw).multiply(UP[n])
    const axis = new Vector3(Math.random() - 0.5, 0.3, Math.random() - 0.5).normalize()
    this.roll = { from: this.root.position.clone(), to: to.clone().setY(H), start: this.root.quaternion.clone(), end, axis, spin: Math.PI * (4 + Math.random() * 2), t: 0, dur, bounced: 0, done }
    this.value = n
    sfx.roll()
  }

  /** Not her turn (or it already rolled): a little shake, never a second roll. */
  wiggle() {
    if (this.roll) return
    this.wiggleT = 0
  }

  /** Glows ("tap me") while it's her turn. */
  setGlow(on: boolean) {
    this.glowT = on ? 1 : 0
  }

  stop() {
    this.roll = null
    this.slide = null
    this.wiggleT = -1
  }

  update(dt: number, t: number) {
    this.step(dt, t)
    // The shade follows underneath, smaller and fainter-looking the higher the die is.
    const p = this.root.position
    this.shadow.visible = this.root.visible
    this.shadow.position.set(p.x, 0.004, p.z)
    this.shadow.scale.setScalar(Math.max(0.55, 1 - (p.y - H) * 3))
  }

  private step(dt: number, t: number) {
    const r = this.roll
    if (r) {
      r.t = Math.min(1, r.t + dt / r.dur)
      const p = r.t
      // Across the table, slowing down; up in a big arc, then two little bounces.
      const e = 1 - (1 - p) ** 2.4
      this.root.position.lerpVectors(r.from, r.to, e)
      const hop = p < 0.55 ? bell(p / 0.55) * 0.14 : p < 0.8 ? bell((p - 0.55) / 0.25) * 0.035 : bell((p - 0.8) / 0.2) * 0.008
      this.root.position.y = H + hop
      if ((p >= 0.55 && r.bounced === 0) || (p >= 0.8 && r.bounced === 1)) {
        r.bounced++
        sfx.roll()
      }
      // Spinning less and less until the rolled face is on top.
      const left = (1 - p) ** 3
      tq.setFromAxisAngle(r.axis, r.spin * left)
      this.root.quaternion.copy(r.end).premultiply(tq)
      if (p >= 1) {
        this.root.quaternion.copy(r.end)
        this.root.position.y = H
        this.roll = null
        r.done?.()
      }
      return
    }
    const s = this.slide
    if (s) {
      s.t = Math.min(1, s.t + dt / s.dur)
      const e = s.t * s.t * (3 - 2 * s.t)
      this.root.position.lerpVectors(s.from, s.to, e)
      this.root.position.y = H + bell(s.t) * 0.02
      if (s.t >= 1) this.slide = null
    }
    let sx = 1
    if (this.wiggleT >= 0) {
      this.wiggleT += dt / 0.4
      const k = Math.sin(this.wiggleT * Math.PI * 4) * (1 - this.wiggleT)
      this.root.rotation.y += k * 0.08
      if (this.wiggleT >= 1) this.wiggleT = -1
    }
    // Her turn: it breathes a little, as if to say "tap me".
    if (this.glowT > 0) sx = 1 + Math.max(0, Math.sin(t * 5)) * 0.08
    this.root.scale.setScalar(sx)
  }
}
