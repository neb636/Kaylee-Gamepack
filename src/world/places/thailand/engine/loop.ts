// The frame loop (after ~/repos/new-start's frameloop.ts), with a frame-rate cap:
// - Kaylee: 60 fps. On 120 Hz screens an uncapped loop renders twice as often for nothing and warms the iPad up.
//   When nothing moves and nobody has touched the screen for 8 s, 30 fps until the next touch.
// - Automated browsers (navigator.webdriver): 30 fps, and 4 fps after 30 s without input, so a headless tab left open
//   after a test doesn't keep a CPU core busy.
// - `?fps=N` overrides the cap (0 = uncapped).
import { automated, flag } from './flags'

const fpsParam = flag('fps')
const CAP = fpsParam !== null && !isNaN(+fpsParam) ? +fpsParam : automated ? 30 : 60

let lastInput = performance.now()
for (const t of ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart']) addEventListener(t, () => (lastInput = performance.now()), { capture: true, passive: true })

/** Calls `frame(now, dt)` once per displayed frame, at most CAP times a second. `calm()` says nothing is moving. */
export function frameLoop(frame: (now: number, dt: number) => void, calm: () => boolean = () => false): () => void {
  let raf = 0
  let last = -Infinity
  let prev = performance.now()
  let stopped = false
  const tick = (now: number) => {
    if (stopped) return
    raf = requestAnimationFrame(tick)
    if (document.hidden) return
    const quiet = now - lastInput
    let cap = CAP
    if (fpsParam === null) {
      if (automated && quiet > 30_000) cap = 4
      else if (!automated && quiet > 8_000 && calm()) cap = 30
    }
    if (cap > 0) {
      const interval = 1000 / cap
      // 1.5 ms of slack so vsync jitter on a 60 Hz screen never drops a frame we meant to draw.
      if (now - last < interval - 1.5) return
      last = now - last > interval * 2 ? now : last + interval
    }
    const dt = Math.min(0.1, Math.max(0, (now - prev) / 1000))
    prev = now
    frame(now, dt)
  }
  raf = requestAnimationFrame(tick)
  return () => {
    stopped = true
    cancelAnimationFrame(raf)
  }
}
