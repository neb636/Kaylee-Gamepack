// Agong's house sounds, synthesized (no files): built on the world kit's tone/noise, so they share its audio context.
import { noise, sfx as kit, tone } from '../../kit/sfx'

export const sfx = {
  ...kit,
  /** A boing that climbs with each bounce on the mattress. */
  boingAt: (level: number) => {
    const f = 220 + level * 90
    tone(f, f * 2.6, 0.32, 0.16, 'sine')
    tone(f * 1.5, f * 3.4, 0.22, 0.05, 'triangle', 0.03)
  },
  /** The metal shutter rolling up. */
  rattle: () => {
    for (let i = 0; i < 9; i++) noise(0.06, 0.12, 'bandpass', 1800 + i * 120, 2400, i * 0.11, 3)
    tone(160, 260, 1.0, 0.05, 'sawtooth')
  },
  /** A soft temple bell: for the altar, the shrines and the spirit house. */
  ding: () => {
    tone(1318, 1310, 1.6, 0.07, 'sine')
    tone(2637, 2630, 1.1, 0.025, 'sine', 0.01)
  },
  beep: () => [0, 0.18].forEach((d) => tone(880, 860, 0.12, 0.08, 'square', d)),
  toot: () => [0, 0.2].forEach((d) => tone(392, 370, 0.16, 0.1, 'triangle', d)),
  meow: () => tone(620, 380, 0.45, 0.1, 'triangle'),
  tick: () => [0, 0.25, 0.5, 0.75].forEach((d, i) => tone(i % 2 ? 1700 : 2100, 1600, 0.04, 0.08, 'square', d)),
  whir: () => noise(1.2, 0.07, 'bandpass', 500, 1400, 0, 1.2),
  puff: () => noise(0.25, 0.1, 'lowpass', 700, 250),
  /** Someone in the family says hi, until they have real voices (gate 3): a happy little babble at their pitch. */
  babble: (pitch: number) => {
    const n = 3 + Math.floor(Math.random() * 2)
    for (let i = 0; i < n; i++) {
      const f = pitch * (1 + (Math.random() - 0.3) * 0.35)
      tone(f, f * (i === n - 1 ? 1.35 : 0.9), 0.11, 0.09, 'triangle', i * 0.13)
    }
  },
}
