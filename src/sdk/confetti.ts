import confetti from 'canvas-confetti'

const COLORS = ['#FF8FB8', '#FF4F9A', '#D9CCFF', '#B9A6F5', '#FBEA9A', '#8FE3C8', '#FFC83D']

/** A quick happy burst of confetti (for small wins). */
export function burst(x = 0.5, y = 0.6) {
  void confetti({ particleCount: 60, spread: 70, startVelocity: 35, origin: { x, y }, colors: COLORS, scalar: 1.1, disableForReducedMotion: true })
}

/** A big celebration: confetti from both sides for a few seconds. */
export function bigCelebration(ms = 2500) {
  const end = Date.now() + ms
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS })
    void confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  void confetti({ particleCount: 40, spread: 360, startVelocity: 25, origin: { x: 0.5, y: 0.35 }, shapes: ['star'], colors: ['#FFC83D', '#FFE08A'], scalar: 1.6 })
}
