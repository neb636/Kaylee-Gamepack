// The hall's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: the family
// babble, Kaylee giggles.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093, 2349]

export const hallSfx = {
  ...sfx,
  /** A shop's door: the little bell over it. */
  shopBell: () => [0, 0.12].forEach((d, i) => tone(i ? 2350 : 1870, i ? 2340 : 1860, 0.5, 0.05, 'sine', d)),
  /** Daddy's tummy: a long low grumble. */
  rumble: () => {
    tone(70, 52, 0.7, 0.16, 'sawtooth')
    tone(95, 60, 0.5, 0.08, 'triangle', 0.35)
    noise(0.9, 0.06, 'lowpass', 220, 120)
  },
  /** The plush crocodile's jaw: a soft clap. */
  chomp: () => {
    noise(0.06, 0.12, 'lowpass', 900, 300)
    tone(180, 120, 0.08, 0.08, 'triangle')
  },
  /** A punching bag: a fat thud and a chain jingle. */
  punch: () => {
    noise(0.12, 0.18, 'lowpass', 400, 120)
    tone(110, 60, 0.15, 0.14, 'sine')
    ;[0.05, 0.1].forEach((d) => tone(2600, 2400, 0.05, 0.02, 'square', d))
  },
  /** A foam brick landing: a soft whump. */
  whump: (k = 0) => {
    noise(0.1, 0.09, 'lowpass', 500 + k * 60, 150)
    tone(160 + k * 20, 90, 0.12, 0.06, 'sine')
  },
  /** A brick hopping home: a note up the scale. */
  note: (k: number) => {
    const f = SCALE[Math.min(SCALE.length - 1, k)]
    tone(f, f * 1.02, 0.14, 0.06, 'triangle')
  },
  /** The barber's door: a puff of hair tufts. */
  poof: () => noise(0.35, 0.1, 'bandpass', 900, 2600, 0, 1.2),
}
