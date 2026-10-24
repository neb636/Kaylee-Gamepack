// The mountain road's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the Pajero's horn, the beeps back, the animals, the guard rail's boing.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const roadSfx = {
  ...sfx,
  /** The Pajero's horn: a short friendly double beep. */
  horn: () => [0, 0.16].forEach((d) => {
    tone(415, 410, 0.12, 0.09, 'square', d)
    tone(523, 520, 0.12, 0.05, 'square', d)
  }),
  /** The car round the blind bend beeps back: higher, quicker. */
  beepBack: () => [0, 0.12].forEach((d) => tone(880, 870, 0.09, 0.07, 'square', d)),
  /** An oncoming driver's horn: one honk, or a happy little tune (she's on their side of the road). */
  toot: (tune: boolean, low = false) => {
    const f = low ? 262 : 392
    if (!tune) return tone(f, f * 0.98, 0.3, 0.08, 'sawtooth')
    ;[1, 1.25, 1.5, 2].forEach((k, i) => tone(f * k, f * k, 0.12, 0.06, 'square', i * 0.13))
  },
  /** A water buffalo's long low moo. */
  moo: () => {
    tone(150, 110, 0.9, 0.12, 'sawtooth')
    tone(300, 220, 0.9, 0.03, 'triangle', 0.05)
  },
  /** Chickens: bawk-bawk. */
  cluck: () => [0, 0.12, 0.3].forEach((d, i) => tone(i === 2 ? 900 : 700, i === 2 ? 1400 : 560, 0.08, 0.06, 'square', d)),
  /** The guard rail boings her back like a pinball bumper. */
  rail: () => {
    tone(260, 720, 0.28, 0.12, 'sine')
    tone(390, 980, 0.2, 0.05, 'triangle', 0.03)
  },
  /** Rain pattering on the roof. */
  patter: () => noise(0.08, 0.02, 'highpass', 4000, 3000, 0, 1),
  /** Into the cloud: a soft whoosh down; out above it: a sparkle up. */
  cloudIn: () => noise(1.4, 0.06, 'lowpass', 1400, 300, 0, 0.7),
  cloudOut: () => [0, 1, 2, 3, 4].forEach((i) => tone(880 * (1 + i * 0.25), 900 * (1 + i * 0.25), 0.3, 0.04, 'sine', i * 0.09)),
}
