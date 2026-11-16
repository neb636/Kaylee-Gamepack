// Timers that end with their screen. A game's `setTimeout` used to keep running after she left it: Sparkle spoke in
// the next game, a finale handed out a trophy from a screen that was gone, a 3D world stepped after it was disposed.
// Every delayed callback in a game goes through one of these instead, and closing the game cancels them all.
//
//   React component or hook:  const timers = useTimers()  →  timers.later(() => ..., 800)
//   3D world, plugin, class:  private readonly timers = new Timers()  →  this.timers.later(...); dispose(): this.timers.dispose()
//
// `later` and `every` take their arguments in setTimeout's order and return a plain timer id, so `clearTimeout(id)`
// still works (or `timers.cancel(id)`). `scripts/check-timers.mjs` keeps raw timers out of src/world/places.
import { useEffect, useRef } from 'react'

export class Timers {
  private ids = new Set<number>()
  private dead = false

  /** Runs `fn` once after `ms`, unless the owner is gone by then. Does nothing once disposed. */
  later(fn: () => void, ms = 0): number {
    if (this.dead) return 0
    const id = window.setTimeout(() => {
      this.ids.delete(id)
      if (!this.dead) fn()
    }, ms)
    this.ids.add(id)
    return id
  }

  /** Runs `fn` every `ms` until cancelled or disposed. */
  every(fn: () => void, ms: number): number {
    if (this.dead) return 0
    const id = window.setInterval(() => {
      if (!this.dead) fn()
    }, ms)
    this.ids.add(id)
    return id
  }

  /** A promise that resolves after `ms`, and never resolves if the owner goes first (so an async script just stops). */
  wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.later(resolve, ms))
  }

  cancel(id: number | undefined) {
    if (!id) return
    window.clearTimeout(id)
    window.clearInterval(id)
    this.ids.delete(id)
  }

  /** Cancels everything pending but stays usable (a section restarting). */
  clear() {
    for (const id of this.ids) {
      window.clearTimeout(id)
      window.clearInterval(id)
    }
    this.ids.clear()
  }

  /** Cancels everything, for good: later calls schedule nothing. */
  dispose() {
    this.clear()
    this.dead = true
  }

  /** Back in use after `dispose` (React runs an effect's cleanup and then the effect again in development). */
  revive() {
    this.dead = false
  }

  get pending() {
    return this.ids.size
  }
}

/** Timers for a component or hook: everything still pending is cancelled when it unmounts. */
export function useTimers(): Timers {
  const ref = useRef<Timers | null>(null)
  ref.current ??= new Timers()
  const timers = ref.current
  useEffect(() => {
    timers.revive()
    return () => timers.dispose()
  }, [timers])
  return timers
}
