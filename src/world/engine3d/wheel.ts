// The sled-style finger wheel (the Nan drive's, PR #209): her finger goes down anywhere, a steering wheel appears under
// it, and pushing it left or right steers, further = harder, for as long as she holds it there. This is the finger
// part only (no three.js): where the wheel sits, how far it's pushed, and the push that steers after the dead middle,
// the gentle-small-pushes curve and the smoothing. The world turns `k` into motion (slide across a road or a slope).
// The screen draws it with <SteerWheel> (SteerWheel.tsx) and the world calls `draw()` each frame.
//
// The Nan drive keeps its own copy of the math (it reads the push along the road's direction on screen, round
// hairpins); the feel numbers are the ones Dad tuned there by hand in the feel lab (2026-10-27).

export interface WheelFeel {
  /** Wheel size (× a thumb's reach): how far her finger moves for a full push. */
  reach: number
  /** Share of the wheel near the middle that counts as straight. */
  dead: number
  /** 1 = even all the way; higher = a small push barely steers. */
  curve: number
  /** Seconds a quick flick takes to count in full (0 = none). */
  ease: number
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export class FingerWheel {
  /** Her finger: where it is, and where it went down (the wheel's middle). */
  finger: { x: number; y: number; ox: number; oy: number; steering: boolean; t: number; id?: string } | null = null
  /** Her raw push, -1..1 (+ = to the right on screen). */
  push = 0
  /** The push that steers: past the dead middle, curved and smoothed (-1..1). */
  k = 0
  private w = 1
  private h = 1

  setSize(w: number, h: number) {
    this.w = w
    this.h = h
  }

  /** The wheel's radius on screen (px): a good thumb's reach on an iPad, smaller on a phone. */
  radius(reach: number) {
    return clamp(Math.min(this.w, this.h) * 0.12, 56, 92) * reach
  }

  get steering() {
    return !!this.finger?.steering
  }

  /** A finger on open ground steers at once; one on a tap target (`id`) steers too once it moves or is held a moment
   *  (a quick tap there pokes it). */
  down(x: number, y: number, time: number, id?: string) {
    this.finger = { x, y, ox: x, oy: y, steering: !id, t: time, id }
    this.push = this.k = 0
  }
  move(x: number, y: number, downX: number, downY: number, held: boolean) {
    const f = this.finger
    if (!held || !f) return
    f.x = x
    f.y = y
    if (!f.steering && Math.hypot(x - downX, y - downY) > 12) f.steering = true
  }
  up() {
    this.finger = null
    this.push = this.k = 0
  }

  /** One frame: returns the push that steers (-1..1). */
  update(dt: number, time: number, feel: WheelFeel) {
    const f = this.finger
    if (f && !f.steering && time - f.t > 0.25) f.steering = true
    if (!f?.steering) {
      this.push = this.k = 0
      return 0
    }
    this.push = clamp((f.x - f.ox) / this.radius(feel.reach), -1, 1)
    const u = Math.max(0, (Math.abs(this.push) - feel.dead) / (1 - feel.dead))
    this.k += (Math.sign(this.push) * u ** feel.curve - this.k) * (1 - Math.exp(-dt / Math.max(1e-4, feel.ease)))
    return this.k
  }

  /** Places the <SteerWheel> element under her finger, turned as far as she's pushed (up to a quarter turn and a bit). */
  draw(el: HTMLElement | null, show: boolean, reach: number) {
    if (!el) return
    const f = this.finger
    const on = show && !!f?.steering
    const want = on ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
    if (!on || !f) return
    el.style.setProperty('--r', `${this.radius(reach).toFixed(0)}px`)
    el.style.setProperty('--turn', `${(this.push * 110).toFixed(1)}deg`)
    el.style.transform = `translate3d(${f.ox.toFixed(0)}px, ${f.oy.toFixed(0)}px, 0)`
  }

  /** The 👆 hint (<SteerHint>): sliding side to side low on the screen, the way the wheel works. */
  hint(el: HTMLElement | null, show: boolean, time: number, reach: number) {
    if (!el) return
    if (show) el.style.transform = `translate3d(${(this.w / 2 + Math.sin(time * 1.6) * this.radius(reach) * 0.9).toFixed(0)}px, ${(this.h * 0.72).toFixed(0)}px, 0)`
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
  }
}
