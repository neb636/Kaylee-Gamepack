// Bird's buffalo horns curl out above the ears, then turn back toward the crown.
// Bend a single closed surface along each arc so the taper continues through the tip.
import { sculpt } from '../geo'

export function crescentHorn(side: number, R: number, headY: number) {
  return sculpt('#FFE6B9', 36, (p) => {
    const t = (p.y + 1) / 2
    const angle = -0.1 + 2.76 * t
    const sin = Math.sin(angle), cos = Math.cos(angle)
    const dx = side * 0.68 * cos, dy = 0.53 * sin
    const length = Math.hypot(dx, dy)
    const radius = 0.34 - 0.31 * t
    // The ball's x/z rings provide the round section perpendicular to the curve.
    const offset = p.x * radius / length
    p.set(side * (0.69 + 0.68 * sin) + dy * offset,
      0.55 + 0.53 * (1 - cos) - dx * offset,
      -0.08 - 0.19 * t + p.z * radius)
  }, { at: [0, headY, 0], scale: [R, R, R] })
}
