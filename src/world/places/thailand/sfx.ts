// Thailand's sounds, synthesized (no files): built on the world kit's tone/noise, so they share its audio context.
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
  /** The aluminium bathroom door jiggling on its latch (it's locked). */
  jiggle: () => {
    for (let i = 0; i < 4; i++) noise(0.05, 0.1, 'bandpass', 2600 - i * 150, 3200, i * 0.09, 4)
    tone(220, 180, 0.08, 0.06, 'square', 0.02)
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
  /** A scooter or a taxi going by on the street. */
  putt: () => {
    for (let i = 0; i < 6; i++) tone(95 + i * 4, 90, 0.06, 0.05, 'sawtooth', i * 0.08)
    noise(0.6, 0.03, 'lowpass', 600, 300)
  },
  /** The tokay gecko's call: a croaky "tuk" then a rising "kae", three times. */
  tukkae: () => {
    noise(0.12, 0.05, 'bandpass', 900, 600)
    for (let i = 0; i < 3; i++) {
      const d = 0.25 + i * 0.55
      tone(260, 200, 0.07, 0.09, 'square', d)
      tone(420, 560, 0.2, 0.08, 'sawtooth', d + 0.12)
    }
  },
  /** Thumbs tapping a phone screen (the big cousins' answer to everything). */
  phone: () => [0, 0.1, 0.17, 0.31].forEach((d, i) => tone(i === 3 ? 1560 : 2200, i === 3 ? 2080 : 2150, 0.035, 0.05, 'sine', d)),
  /** Someone in the family says hi, until they have real voices (gate 3): a happy little babble at their pitch. */
  babble: (pitch: number) => {
    const n = 3 + Math.floor(Math.random() * 2)
    for (let i = 0; i < n; i++) {
      const f = pitch * (1 + (Math.random() - 0.3) * 0.35)
      tone(f, f * (i === n - 1 ? 1.35 : 0.9), 0.11, 0.09, 'triangle', i * 0.13)
    }
  },
  // ---- The boat trip ----
  /** One beat of the longtail's engine: a low putt when slow, a rasp when fast (`level` 0..1). */
  engine: (level: number) => {
    tone(70 + 70 * level, 60 + 50 * level, 0.07, 0.025 + 0.035 * level, 'sawtooth')
    if (level > 0.55) noise(0.06, 0.02 * level, 'bandpass', 900 + 600 * level, 700, 0, 2)
  },
  /** VROOM: the engine revs up. */
  vroom: () => {
    tone(90, 320, 0.6, 0.09, 'sawtooth')
    tone(140, 460, 0.5, 0.05, 'square', 0.05)
    noise(0.7, 0.06, 'bandpass', 600, 2400, 0, 1.5)
  },
  /** Landing in the water off a wake, or a big splash. */
  splash: (big = 1) => {
    noise(0.45 * big, 0.12 * big, 'lowpass', 2400, 300)
    tone(220, 90, 0.18, 0.05 * big, 'sine')
  },
  /** A paddle dipping in. */
  paddle: () => noise(0.18, 0.05, 'bandpass', 1400, 600, 0, 1.4),
  /** A unicorn horn bonking the cave roof. */
  boink: () => {
    tone(700, 1600, 0.12, 0.12, 'triangle')
    tone(320, 180, 0.2, 0.07, 'square', 0.02)
    noise(0.25, 0.05, 'highpass', 3000, 1500, 0.05)
  },
  /** A soft rubbery buoy bumping the boat back. */
  boop: () => tone(330, 520, 0.18, 0.1, 'sine'),
  /** The camera's click. */
  shutter: () => {
    noise(0.05, 0.15, 'highpass', 4000, 2500)
    noise(0.08, 0.1, 'bandpass', 1800, 1200, 0.07, 3)
  },
  /** The tour boat's big horn. */
  horn: () => [0, 0.45].forEach((d) => tone(196, 190, 0.38, 0.1, 'sawtooth', d)),
}
