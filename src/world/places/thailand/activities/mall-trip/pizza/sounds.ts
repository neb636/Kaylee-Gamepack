// The pizza table's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: the
// family's lines and the server's "Khob khun ka!" come with the full loop.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const pizzaSfx = {
  ...sfx,
  /** The cheese getting longer: a rubbery creak that climbs with each stretch. */
  stretch: (k: number) => tone(260 + k * 90, 300 + k * 110, 0.09, 0.035, 'triangle'),
  /** The cheese snapping: a twangy boing. */
  snap: () => {
    tone(520, 180, 0.28, 0.12, 'sine')
    tone(780, 260, 0.2, 0.05, 'triangle', 0.02)
  },
  /** A slice landing on a plate. */
  plop: () => {
    noise(0.08, 0.06, 'lowpass', 700, 300)
    tone(300, 220, 0.08, 0.06, 'sine')
  },
  /** Counting round the table: a note that climbs with each slice on that plate. */
  count: (n: number) => tone(523 * Math.pow(2, Math.min(n, 8) / 8), 523 * Math.pow(2, Math.min(n, 8) / 8), 0.18, 0.06, 'triangle'),
  /** The box's lid closing. */
  flup: () => {
    noise(0.16, 0.1, 'lowpass', 1200, 300)
    tone(180, 110, 0.12, 0.1, 'sine', 0.1)
  },
  slurp: () => noise(0.45, 0.06, 'bandpass', 500, 1800, 0, 3),
  bubbles: () => [0, 0.06, 0.13].forEach((d) => tone(1300 + Math.random() * 900, 2200 + Math.random() * 600, 0.05, 0.035, 'sine', d)),
  shake: () => [0, 0.08, 0.16, 0.24].forEach((d) => noise(0.06, 0.06, 'bandpass', 2200, 1400, d, 1.2)),
  ahh: () => [0, 0.4].forEach((d, i) => tone(300 + i * 90, 380 + i * 120, 0.32, 0.07, 'triangle', d)),
  choo: () => {
    noise(0.4, 0.16, 'bandpass', 1600, 500, 0, 0.8)
    tone(420, 180, 0.25, 0.08, 'sawtooth')
  },
  /** Daddy hamming it up: a big wobbly "ho ho". */
  hoho: () => [0, 0.22, 0.44].forEach((d, i) => tone(200 - i * 15, 150 - i * 10, 0.18, 0.09, 'triangle', d)),
  water: () => noise(0.5, 0.05, 'bandpass', 2400, 1600, 0, 0.6),
  napkins: () => [0, 0.05, 0.1, 0.16, 0.22].forEach((d) => noise(0.07, 0.05, 'highpass', 3000, 4200, d, 0.7)),
}
