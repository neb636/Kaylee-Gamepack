// The cafe's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: Daddy and
// Mommy slurp, aah and laugh.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

export const cafeSfx = {
  ...sfx,
  /** The blender: whirrrr, climbing as it gets going. */
  whirr: (dur = 1.6) => {
    noise(dur, 0.09, 'bandpass', 380, 1500, 0, 1.4)
    tone(70, 140, dur, 0.05, 'sawtooth')
  },
  /** Fruit drops into the jar. */
  plunk: () => {
    tone(520, 180, 0.14, 0.12, 'sine')
    noise(0.08, 0.05, 'lowpass', 900, 300, 0.02)
  },
  /** She lifts the jar (or the milk jug) off. */
  pickup: () => tone(380, 640, 0.12, 0.08, 'triangle'),
  /** The jar's lid: on (click) or off. */
  lid: (on: boolean) => tone(on ? 900 : 700, on ? 1300 : 500, 0.07, 0.09, 'square'),
  /** A trickle while it pours (called every few frames). */
  trickle: () => noise(0.16, 0.035, 'bandpass', 1600 + Math.random() * 900, 1200, 0, 2.5),
  /** The big splat on the ceiling. */
  splat: () => {
    noise(0.35, 0.22, 'lowpass', 1400, 200, 0, 1)
    tone(300, 90, 0.3, 0.12, 'sine')
    ;[0.25, 0.4, 0.6].forEach((d) => noise(0.08, 0.05, 'lowpass', 800, 300, d, 2))
  },
  slurp: () => noise(0.5, 0.06, 'bandpass', 500, 1900, 0, 3),
  aah: () => [0, 0.2].forEach((d, i) => tone(330 + i * 70, 300 + i * 40, 0.3, 0.07, 'triangle', d)),
  /** Brain freeze: a shivery brrrr. */
  brrr: () => {
    for (let i = 0; i < 10; i++) tone(240 + (i % 2) * 30, 220, 0.05, 0.07, 'square', i * 0.055)
    noise(0.5, 0.04, 'highpass', 3000, 5000, 0.1)
  },
  /** The bottles in the fridge clink. */
  clink: () => [0, 0.09, 0.2].forEach((d, i) => tone(2400 + i * 320, 2350 + i * 300, 0.18, 0.05, 'triangle', d)),
  /** The coffee machine: a hiss of steam and a gurgle. */
  steam: () => {
    noise(0.9, 0.06, 'highpass', 2600, 4200, 0, 0.7)
    ;[0.5, 0.62, 0.74].forEach((d) => tone(300, 520, 0.06, 0.04, 'sine', d))
  },
  /** The cake stand spins. */
  spin: () => noise(0.6, 0.05, 'bandpass', 900, 2600, 0, 2),
  squirt: () => noise(0.3, 0.07, 'bandpass', 700, 300, 0, 1.8),
  /** The served drink is just right (an order she matched). */
  yum: () => [0, 0.1, 0.2, 0.32].forEach((d, i) => tone(660 * [1, 1.26, 1.5, 2][i], 660 * [1, 1.26, 1.5, 2][i], 0.2, 0.06, 'triangle', d)),
  /** A finished drink on the shelf, one note higher each. */
  shelf: (i: number) => tone(523 * Math.pow(2, (i * 2) / 12), 523 * Math.pow(2, (i * 2) / 12), 0.18, 0.07, 'triangle'),
}
