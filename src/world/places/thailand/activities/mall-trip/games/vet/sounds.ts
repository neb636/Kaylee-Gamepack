// The vet's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). The patients don't talk: they
// bark, whinny and trumpet.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'
import type { PatientId } from '../../sections'

export const vetSfx = {
  ...sfx,
  yip: () => [0, 0.13].forEach((d, i) => tone(720 + i * 120, 980, 0.08, 0.08, 'triangle', d)),
  whimper: () => tone(900, 560, 0.5, 0.05, 'sine'),
  whinny: () => [0, 0.09, 0.18, 0.27, 0.36, 0.45].forEach((d, i) => tone(820 - i * 50 + (i % 2) * 140, 700 - i * 60, 0.1, 0.07, 'triangle', d)),
  trumpet: () => {
    tone(330, 620, 0.32, 0.1, 'sawtooth')
    tone(620, 470, 0.4, 0.09, 'sawtooth', 0.3)
  },
  /** The stethoscope: thump-thump (louder over the chest). */
  heartbeat: (loud = 1) => [0, 0.16].forEach((d, i) => tone(i ? 62 : 74, 44, 0.13, 0.16 * loud, 'sine', d)),
  /** Daddy's heart: BA-BOOM. */
  baboom: () => {
    ;[0, 0.22].forEach((d, i) => tone(i ? 58 : 70, 34, 0.24, 0.3, 'sine', d))
    noise(0.3, 0.1, 'lowpass', 300, 90, 0.22)
  },
  pluck: () => {
    tone(1500, 2600, 0.06, 0.08, 'square')
    tone(900, 300, 0.2, 0.06, 'triangle', 0.05)
  },
  squish: () => noise(0.12, 0.07, 'lowpass', 900, 400, 0, 2),
  wrap: () => noise(0.16, 0.06, 'highpass', 2600, 3800, 0, 0.7),
  bubbles: () => [0, 0.06, 0.13].forEach((d) => tone(1300 + Math.random() * 900, 2200 + Math.random() * 600, 0.05, 0.035, 'sine', d)),
  water: () => noise(0.18, 0.05, 'bandpass', 2400, 1800, 0, 0.6),
  honk: () => {
    tone(240, 200, 0.35, 0.12, 'sawtooth')
    noise(0.3, 0.08, 'bandpass', 600, 400, 0, 1.5)
  },
  sniff: () => [0, 0.12].forEach((d) => noise(0.08, 0.05, 'bandpass', 1800, 2600, d, 2)),
  ahh: () => [0, 0.45].forEach((d, i) => tone(380 + i * 120, 520 + i * 160, 0.35, 0.07, 'triangle', d)),
  choo: () => {
    noise(0.4, 0.16, 'bandpass', 1600, 500, 0, 0.8)
    tone(520, 220, 0.25, 0.08, 'sawtooth')
  },
  slurp: () => noise(0.4, 0.06, 'bandpass', 500, 1800, 0, 3),
  bleh: () => [0, 0.1, 0.2].forEach((d) => tone(200, 150, 0.08, 0.07, 'square', d)),
  squawk: () => [0, 0.14].forEach((d) => tone(1700, 1100, 0.12, 0.06, 'square', d)),
  shake: () => [0, 0.08, 0.16, 0.24].forEach((d) => noise(0.06, 0.06, 'bandpass', 2200, 1400, d, 1.2)),
  healed: () => [0, 0.1, 0.2, 0.32].forEach((d, i) => tone(660 * [1, 1.26, 1.5, 2][i], 660 * [1, 1.26, 1.5, 2][i], 0.2, 0.06, 'triangle', d)),
  needle: () => [0, 0.1, 0.2, 0.3].forEach((d, i) => tone(i % 2 ? 900 : 700, 800, 0.07, 0.04, 'triangle', d)),
}

/** A patient's own sound: a bark, a whinny, a trumpet. */
export const voiceOf = (p: PatientId) => (p === 'puppy' ? vetSfx.woof : p === 'pony' ? vetSfx.whinny : vetSfx.trumpet)
