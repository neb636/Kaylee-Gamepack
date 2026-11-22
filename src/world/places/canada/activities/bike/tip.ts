// Tip the bike (card C): her finger grabs the bike and tips it left or right, and how far it tips is how hard it carves.
// No wheel on screen: just the bike under her finger (a small half-see-through dot shows where she's holding it, so on
// the Mac the cursor's grip shows). This is the finger part only (no three.js): the world hands it where the bike is on
// screen and turns the tip (`k`, -1..1, + = right on screen) into the carve and the lean (ride.ts).
//
// She presses on the bike, or anywhere (a five-year-old won't aim: anywhere counts as grabbing it). The tip is her
// finger's sideways move from where she pressed (`from` 0), or from the bike itself (`from` 1, only when she pressed
// on it; pressing far off always counts from the press, so the bike never jumps to a full tip). A comfortable slide
// (`reach`, a share of the screen's width; a little less on a phone) is a full tip; a small dead middle, a little
// smoothing.
import { clamp, lerp } from '../../../../../sdk/math'

export interface TipFeel {
  /** A full tip: how far her finger slides sideways, as a share of the screen's width. */
  reach: number
  /** Share of a full tip near the middle that counts as straight. */
  dead: number
  /** Seconds a quick flick takes to count in full (0 = none). */
  ease: number
  /** 0 = the tip counts from where she pressed; 1 = from where the bike is on screen (when she pressed on it). */
  from: number
}

export class BikeTip {
  /** Her finger: where it is, where it went down, and whether that was on the bike. */
  finger: { x: number; y: number; ox: number; oy: number; onBike: boolean } | null = null
  /** Her raw tip, -1..1 (+ = to the right on screen). */
  raw = 0
  /** The tip that carves: past the dead middle, smoothed (-1..1). */
  k = 0
  private w = 1
  private h = 1

  setSize(w: number, h: number) {
    this.w = w
    this.h = h
  }

  /** A full tip on screen (px): ~17% of an iPad's width, a little less on a phone, never under a thumb's nudge. */
  reach(feel: Pick<TipFeel, 'reach'>) {
    const phone = Math.min(this.w, this.h) < 500
    return Math.max(phone ? 52 : 80, this.w * feel.reach * (phone ? 0.85 : 1))
  }

  get held() {
    return !!this.finger
  }

  /** Her finger goes down: on the bike (within about a bike's size of it on screen), or anywhere (still grabs it). */
  down(x: number, y: number, bike: { x: number; y: number; size: number }) {
    this.finger = { x, y, ox: x, oy: y, onBike: Math.hypot(x - bike.x, y - bike.y) < Math.max(70, bike.size) }
    this.raw = 0
  }
  move(x: number, y: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
  }
  up() {
    this.finger = null
    this.raw = 0
  }

  /** One frame: returns the tip that carves (-1..1). `bikeX`: the bike's screen x now. */
  update(dt: number, feel: TipFeel, bikeX: number) {
    const f = this.finger
    if (!f) {
      this.raw = 0
      // (Let go: the bike rights itself quickly, not at once.)
      this.k *= Math.exp(-dt / Math.max(0.02, feel.ease))
      if (Math.abs(this.k) < 0.002) this.k = 0
      return this.k
    }
    const ref = f.onBike ? lerp(f.ox, bikeX, feel.from) : f.ox
    this.raw = clamp((f.x - ref) / this.reach(feel), -1, 1)
    const u = Math.max(0, (Math.abs(this.raw) - feel.dead) / (1 - feel.dead))
    this.k += (Math.sign(this.raw) * u - this.k) * (1 - Math.exp(-dt / Math.max(1e-4, feel.ease)))
    return this.k
  }

  /** The grab cue: a small half-see-through dot where her finger holds the bike. */
  draw(el: HTMLElement | null, show: boolean) {
    if (!el) return
    const f = this.finger
    const on = show && !!f
    const want = on ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (on && f) el.style.transform = `translate3d(${f.x.toFixed(0)}px, ${f.y.toFixed(0)}px, 0)`
  }

  /** The 👆 hint: pressing on the bike and sliding side to side, tipping it. */
  hint(el: HTMLElement | null, show: boolean, time: number, bike: { x: number; y: number }, feel: Pick<TipFeel, 'reach'>) {
    if (!el) return
    if (show) el.style.transform = `translate3d(${(bike.x + Math.sin(time * 1.6) * this.reach(feel) * 0.9).toFixed(0)}px, ${bike.y.toFixed(0)}px, 0)`
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
  }
}
