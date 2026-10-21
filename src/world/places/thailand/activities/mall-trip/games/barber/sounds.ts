// The barber's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: Daddy
// laughs and goes "ooh", the kids giggle.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

export const barberSfx = {
  ...sfx,
  /** The scissors: snip (a bright click and a little swish). */
  snip: () => {
    tone(2400, 3200, 0.03, 0.07, 'square')
    noise(0.06, 0.06, 'highpass', 4200, 5200, 0.015, 1.2)
  },
  /** Scissors snipping air. */
  clack: () => tone(1700, 2100, 0.03, 0.05, 'square'),
  /** The grow tonic: a squirt, and a magic shimmer as the hair grows. */
  squirt: () => noise(0.12, 0.07, 'bandpass', 2600, 1600, 0, 1.6),
  grow: () => [0, 0.06, 0.12].forEach((d, i) => tone(700 + i * 260, 1100 + i * 300, 0.12, 0.035, 'sine', d)),
  /** The comb: a quick zip through the hair, rising for spikes, falling to smooth it. */
  zip: (up: boolean) => tone(up ? 500 : 1300, up ? 1500 : 450, 0.12, 0.05, 'triangle'),
  /** The dryer's whoosh (louder on full). */
  dryer: (k = 1) => noise(0.32, 0.03 + 0.05 * k, 'bandpass', 900 + 900 * k, 1200 + 900 * k, 0, 0.8),
  /** The color spray: psshht. */
  pssht: () => noise(0.18, 0.06, 'highpass', 3000, 4200, 0, 0.8),
  /** The horn boings back. */
  horn: () => {
    tone(240, 760, 0.18, 0.12, 'sine')
    tone(760, 300, 0.4, 0.1, 'sine', 0.16)
    tone(300, 520, 0.3, 0.06, 'triangle', 0.5)
  },
  /** The chair's pump (up) and its hiss (down). */
  pump: () => [0, 0.14].forEach((d) => noise(0.08, 0.07, 'lowpass', 600, 300, d, 2)),
  hiss: () => noise(0.5, 0.05, 'highpass', 1800, 900, 0, 0.7),
  /** The chair spinning round. */
  spin: () => [0, 0.12, 0.24, 0.36].forEach((d, i) => tone(500 + i * 120, 600 + i * 120, 0.08, 0.04, 'triangle', d)),
  /** Daddy sees himself: ooh! */
  ooh: () => tone(300, 520, 0.5, 0.09, 'triangle'),
  /** The comb jar's bubbles. */
  blub: () => [0, 0.08, 0.17].forEach((d) => tone(380 + Math.random() * 300, 700 + Math.random() * 300, 0.07, 0.05, 'sine', d)),
  /** A bow or clip clicks into the hair. */
  clip: () => tone(1200, 1800, 0.05, 0.07, 'square'),
}
