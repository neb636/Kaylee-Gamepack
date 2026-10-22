// The drum's beat in the Muay Thai game: a clock the world (ring.ts) and the flat version (Flat.tsx) both run. The
// coach's drum booms on each beat and a little cymbal (the ching) ticks halfway between. A punch is "on the beat" when
// her finger goes down a little before the beat or just after it: a generous window for a five-year-old, and it grows
// when she's off a few times in a row. Pure (no three.js, no sound).

/** Seconds between beats in each round (round 1 is music under her punches; round 2 is slow, to punch along to). */
export const PERIOD: Record<1 | 2 | 3, number> = { 1: 0.8, 2: 1.0, 3: 0.9 }
/** How early (before) and how late (after) a punch may be and still be on the beat; `grow` is added each time she's
 *  off three in a row (twice at most). */
export const WINDOW = { before: 0.3, after: 0.2, grow: 0.1, maxGrow: 2 }

export type Tick = 'beat' | 'off' | null

export class Beat {
  on = false
  period = 1
  /** The beat before now, and the next one (seconds, the world's clock). */
  last = -Infinity
  next = Infinity
  /** Beats so far (the first of each four is a bigger boom). */
  n = 0
  private offDone = true
  /** How much the window has grown (0, 1, 2). */
  grown = 0
  /** Off-beat punches in a row. */
  private misses = 0

  /** The drum starts: the first beat `delay` seconds from now. */
  start(now: number, period: number, delay = 0.6) {
    this.on = true
    this.period = period
    this.next = now + delay
    this.last = this.next - period
    this.offDone = true
  }
  /** A new speed, keeping the next beat where it is. */
  setPeriod(period: number) {
    this.period = period
  }
  stop() {
    this.on = false
    this.next = Infinity
  }

  /** Moves the clock to `now`: 'beat' when a beat falls, 'off' at the cymbal halfway between, else null. */
  tick(now: number): Tick {
    if (!this.on) return null
    if (now >= this.next) {
      this.last = this.next
      this.next += this.period
      // A long frame (a tab in the background): skip ahead instead of firing a burst.
      if (this.next < now) this.next = now + this.period
      this.n++
      this.offDone = false
      return 'beat'
    }
    if (!this.offDone && now >= this.last + this.period / 2) {
      this.offDone = true
      return 'off'
    }
    return null
  }

  private extra() {
    return this.grown * WINDOW.grow
  }
  /** Seconds to the next beat. */
  toNext(now: number) {
    return this.next - now
  }
  /** Would a punch now be on the beat? */
  inWindow(now: number) {
    if (!this.on) return false
    const x = this.extra()
    return this.next - now <= WINDOW.before + x || now - this.last <= WINDOW.after + x
  }
  /** A punch now: is it on the beat? (Three off in a row and the window grows.) */
  judge(now: number) {
    const hit = this.inWindow(now)
    if (hit) this.misses = 0
    else if (++this.misses >= 3 && this.grown < WINDOW.maxGrow) {
      this.grown++
      this.misses = 0
    }
    return hit
  }
  /** Where the closing ring is: 1 just after a beat, 0 at the next one. */
  ring(now: number) {
    return Math.max(0, Math.min(1, (this.next - now) / this.period))
  }
}
