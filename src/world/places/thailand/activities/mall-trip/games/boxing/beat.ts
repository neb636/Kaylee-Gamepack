// The drum's beat in the Muay Thai game: a clock the world (ring.ts) runs. The coach's drum booms on each beat and a
// little cymbal (the ching) ticks halfway between. It's the bout's music: like the real sarama, it speeds up as the
// fight heats up (her super punch filling). Pure (no three.js, no sound).

/** Seconds between beats: a calm bout, and one with her super punch nearly full. */
export const PERIOD = { calm: 0.66, hot: 0.42 }

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

  /** Where in the beat it is: 1 just after a beat, 0 at the next one. */
  ring(now: number) {
    return Math.max(0, Math.min(1, (this.next - now) / this.period))
  }
}
