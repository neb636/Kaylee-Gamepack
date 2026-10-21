// The life in HarborLand's hall: other kids playing on their own, over and over (placeholders until the art gate),
// and the staff in their bright shirts. Each kid follows a loop of moves: walk, hop (up a climbing wall, the steps,
// the mountain's holds), slide down a curve (the mask's nose, a racing lane, the steel slide), wait, cheer. They're
// the race's racers (games/race/racer.ts) dressed as someone else.
import type { Curve, Vector3 } from 'three'
import { Vector3 as V } from 'three'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../engine/dispose'
import { KID_LOOKS, Racer } from '../games/race/racer'

export type Move = { walk: [number, number, number] } | { hop: [number, number, number]; dur?: number; arc?: number } | { slide: Curve<Vector3>; speed: number } | { wait: number } | { cheer: number }

/** A third kid (a fox in mint), and the staff: a buffalo and a penguin in bright red and yellow polos and caps. */
export const KID_C: Look = { species: 'fox', height: 1.0, fur: '#FF9A4D', light: '#FFF1E2', dark: '#2B2330', ear: '#FFE6CC', outfit: { kind: 'tee', color: '#8FE3C8', shorts: '#5D7BB0' }, open: true }
export const STAFF_LOOKS: Look[] = [
  { species: 'buffalo', height: 1.5, fur: '#94A0C8', light: '#DCD8EE', dark: '#4C4F6B', ear: '#FFB8CC', outfit: { kind: 'polo', color: '#FF6F6F' }, extras: ['cap'], open: true },
  { species: 'penguin', height: 1.4, fur: '#3F365F', light: '#FFF6EC', dark: '#FFA640', outfit: { kind: 'polo', color: '#FBEA9A' }, extras: ['cap'], open: true },
]
export const KID_LOOK_LIST: Look[] = [KID_LOOKS.kidA, KID_LOOKS.kidB, KID_C]

export class Kid {
  readonly r: Racer
  private i = 0
  private busy = false
  private wait = 0
  private slide: { curve: Curve<Vector3>; u: number; speed: number } | null = null
  private cheer = 0

  constructor(
    look: Look,
    bag: Bag,
    private loop: Move[],
    pick: string,
    /** Where in its loop it starts (so they don't all move together). */
    from = 0,
  ) {
    this.r = new Racer('kidA', bag, look)
    this.r.root.userData.pick = pick
    this.i = from % loop.length
    const at = this.firstSpot()
    this.r.place(at.x, at.y, at.z, 0)
  }

  /** Where it stands before the move it starts on. */
  private firstSpot() {
    for (let k = 1; k <= this.loop.length; k++) {
      const m = this.loop[(this.i - k + this.loop.length) % this.loop.length]
      if ('walk' in m) return new V(...m.walk)
      if ('hop' in m) return new V(...m.hop)
    }
    return new V()
  }

  /** On a slide right now (for QA). */
  get sliding() {
    return !!this.slide
  }

  /** A tap: a happy hop (or a wiggle while it's up on something). */
  poke() {
    if (this.r.busy || this.slide) this.r.wiggle()
    else this.r.hop()
  }

  update(dt: number, t: number) {
    const r = this.r
    if (this.slide) {
      const s = this.slide
      s.u = Math.min(1, s.u + (dt * s.speed) / s.curve.getLength())
      r.pos.copy(s.curve.getPointAt(s.u))
      const tan = s.curve.getTangentAt(s.u)
      r.face(Math.atan2(tan.x, tan.z))
      if (s.u >= 1) {
        this.slide = null
        r.sitting = false
        r.arms = 'down'
        r.land()
        this.busy = false
      }
    } else if (this.wait > 0) {
      this.wait -= dt
      if (this.wait <= 0) {
        this.busy = false
        if (this.cheer > 0) r.arms = 'down'
        this.cheer = 0
      }
    } else if (!this.busy) this.next()
    r.update(dt, t)
  }

  private next() {
    const m = this.loop[this.i]
    this.i = (this.i + 1) % this.loop.length
    const r = this.r
    this.busy = true
    const done = () => (this.busy = false)
    if ('walk' in m) r.walkTo(new V(...m.walk), 1.6, done)
    else if ('hop' in m) r.hopTo(new V(...m.hop), m.dur ?? 0.45, m.arc ?? 0.45, done)
    else if ('slide' in m) {
      this.slide = { curve: m.slide, u: 0, speed: m.speed }
      r.sitting = true
      r.arms = 'up'
    } else if ('wait' in m) this.wait = m.wait
    else {
      this.wait = this.cheer = m.cheer
      r.arms = 'cheer'
    }
  }
}
