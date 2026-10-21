// The Big Frame's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: the
// family babble, Kaylee giggles.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const frameSfx = {
  ...sfx,
  /** A naga's friendly roar: a low wobbly growl with a breath. */
  rawr: () => {
    tone(260, 150, 0.42, 0.08, 'sawtooth')
    tone(330, 190, 0.36, 0.05, 'triangle', 0.04)
    noise(0.4, 0.05, 'lowpass', 900, 300)
  },
  /** The boxer's ring bell: ding ding. */
  ringBell: () => [0, 0.2].forEach((d) => [2093, 2637].forEach((f, i) => tone(f, f * 0.995, 0.7, i ? 0.025 : 0.05, 'sine', d))),
  /** A punch into the air: a quick swish and a pop. */
  jab: () => {
    noise(0.1, 0.07, 'highpass', 2200, 3800)
    tone(220, 140, 0.08, 0.06, 'triangle', 0.06)
  },
  /** A temple bell on a gold spire: a long soft ring with a shimmer over it. */
  templeBell: () => {
    tone(784, 780, 1.4, 0.06, 'sine')
    tone(1568, 1565, 1.0, 0.025, 'sine')
    tone(2349, 2345, 0.7, 0.012, 'sine', 0.02)
  },
  /** The giant mask's eyes rolling: a wobbly boing. */
  goggle: () => [0, 0.12, 0.24].forEach((d, i) => tone(500 + i * 120, 300 + i * 160, 0.12, 0.06, 'triangle', d)),
  /** The rope course's logs knocking. */
  knock: () => [0, 0.11].forEach((d, i) => tone(i ? 300 : 360, 200, 0.07, 0.07, 'triangle', d)),
}
