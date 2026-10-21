// The racing slide's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: the
// family babble, Kaylee giggles.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568]

export const raceSfx = {
  ...sfx,
  /** A step up: the note climbs with the step. */
  step: (k: number) => {
    const f = SCALE[Math.min(SCALE.length - 1, k)]
    tone(f, f * 1.02, 0.12, 0.07, 'triangle')
    noise(0.05, 0.05, 'lowpass', 700, 300)
  },
  /** The rail played like a xylophone, up the scale. */
  rail: () => SCALE.slice(0, 6).forEach((f, i) => tone(f * 2, f * 2, 0.16, 0.05, 'sine', i * 0.07)),
  /** A scoot: hands push the slide, a squeaky swish (higher the faster she goes). */
  scoot: (k: number) => {
    noise(0.12, 0.07, 'bandpass', 1400 + k * 900, 3200 + k * 900, 0, 1.6)
    tone(500 + k * 260, 760 + k * 300, 0.08, 0.04, 'triangle')
  },
  /** Over a bump on her own: a little bip. */
  bip: () => tone(700, 1100, 0.09, 0.06, 'sine'),
  /** Before a bump (rounds 2 and 3): a rising whistle, "get ready". */
  ready: () => tone(500, 1100, 0.28, 0.035, 'sine'),
  /** Flying off a bump: a swirl up and a sparkle. */
  fly: () => {
    ;[0, 1, 2, 3, 4].forEach((i) => tone(600 + i * 220, 900 + i * 260, 0.1, 0.06, 'triangle', i * 0.05))
    tone(2400, 3200, 0.3, 0.025, 'sine', 0.25)
  },
  /** Whee: the long slide-whistle going down. */
  whee: () => tone(1200, 500, 0.7, 0.05, 'sine'),
  /** Diving into the balls: a soft crash of plastic, and plops. */
  balls: (big = 1) => {
    noise(0.35 * big, 0.1 * big, 'bandpass', 1800, 900, 0, 0.9)
    for (let i = 0; i < 4 + big * 3; i++) tone(500 + Math.random() * 500, 200, 0.06, 0.04, 'sine', 0.05 + i * 0.06)
  },
  /** Daddy upside down in the balls: a muffled "mmf-mmf". */
  mmf: () => [0, 0.2].forEach((d) => tone(150, 120, 0.16, 0.09, 'sawtooth', d)),
  /** Daddy pops out: bloop! */
  bloop: () => tone(260, 900, 0.16, 0.1, 'sine'),
  /** The winner's ribbon. */
  ribbon: () => [0, 0.09, 0.18, 0.3].forEach((d, i) => tone(784 * [1, 1.26, 1.5, 2][i], 784 * [1, 1.26, 1.5, 2][i], 0.24, 0.06, 'triangle', d)),
  /** A rubber ring: squeaky boing. */
  ring: () => {
    tone(300, 700, 0.2, 0.08, 'triangle')
    tone(900, 600, 0.12, 0.04, 'sine', 0.08)
  },
}
