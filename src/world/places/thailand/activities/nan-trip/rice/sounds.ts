// Stop Time Cafe's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the water running down the bamboo pipe and splashing in, a paddy filling to shiny, the spill over a
// notch, the seedlings' plips, the rain, the frogs, ducks, the buffalo and the rooster, the wind chime, the pink milk.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16]

export const riceSfx = {
  ...sfx,
  /** Water running out of the pipe (played over and over while it pours): a soft gurgle and a bubble. */
  gurgle: () => {
    noise(0.26, 0.035, 'lowpass', 900, 520, 0, 0.8)
    const f = 300 + Math.random() * 260
    tone(f, f * 1.8, 0.06, 0.02, 'sine', Math.random() * 0.12)
  },
  /** The pour landing in water. */
  splashIn: () => noise(0.18, 0.035, 'bandpass', 1600, 900, 0, 1.2),
  /** A paddy full to the brim and shiny: a bright bell, higher for each one. */
  shine: (k: number) => {
    const f = 523 * Math.pow(2, PENTA[k % PENTA.length] / 12) * (k >= PENTA.length ? 2 : 1)
    tone(f, f, 0.5, 0.06, 'sine')
    tone(f * 2, f * 2, 0.3, 0.025, 'triangle', 0.03)
  },
  /** Water spilling over a notch into the step below: a little trickle. */
  trickle: () => noise(0.22, 0.025, 'bandpass', 2600, 1800, 0, 2),
  /** Every step full: a run of bells down the hill. */
  allFull: () => [0, 1, 2, 3, 4, 5].forEach((i) => tone(1046 * Math.pow(2, -PENTA[i] / 12), 1046 * Math.pow(2, -PENTA[i] / 12), 0.35, 0.05, 'sine', i * 0.1)),
  /** A seedling pushed into the mud: plip (a little higher each time, round and round). */
  plip: (k = 0) => {
    const f = 700 * Math.pow(2, PENTA[k % 6] / 12)
    tone(f, f * 0.6, 0.07, 0.06, 'sine')
    noise(0.04, 0.025, 'bandpass', 2200, 1600, 0, 2)
  },
  /** A paddy all planted: green! */
  planted: () => [0, 4, 7, 12].forEach((s, i) => tone(660 * Math.pow(2, s / 12), 660 * Math.pow(2, s / 12), 0.22, 0.05, 'triangle', i * 0.07)),
  /** Rain from the cloud she's carrying (played over and over). */
  rain: () => {
    for (let i = 0; i < 6; i++) noise(0.03, 0.02 + Math.random() * 0.02, 'highpass', 3000 + Math.random() * 3000, 3000, i * 0.04 + Math.random() * 0.02, 1)
  },
  /** A cloud rained out: it puffs away. */
  puffAway: () => {
    noise(0.5, 0.06, 'bandpass', 600, 2400, 0, 0.8)
    tone(660, 1320, 0.3, 0.04, 'sine', 0.1)
  },
  /** The clouds rolling in. */
  rollIn: () => noise(1.8, 0.05, 'lowpass', 300, 900, 0, 0.7),
  /** The sun comes out, the rainbow: a magic run up. */
  rainbow: () => [0, 2, 4, 7, 9, 12, 14, 16, 19].forEach((s, i) => tone(523 * Math.pow(2, s / 12), 523 * Math.pow(2, s / 12), 0.4, 0.04, 'sine', i * 0.08)),
  /** A frog: rib-bit. */
  croak: () => [0, 0.14].forEach((d, i) => tone(i ? 260 : 200, i ? 170 : 150, 0.11, 0.08, 'square', d)),
  /** A duck: quack quack. */
  quack: () => [0, 0.2].forEach((d) => {
    tone(520, 380, 0.13, 0.06, 'sawtooth', d)
    noise(0.1, 0.03, 'bandpass', 1300, 900, d, 2)
  }),
  /** The water buffalo's long low moo. */
  moo: () => {
    tone(150, 110, 0.9, 0.12, 'sawtooth')
    tone(300, 220, 0.9, 0.03, 'triangle', 0.05)
  },
  /** A rooster in Sapan: cock-a-doodle-doo. */
  rooster: () => [[0, 600, 700, 0.1], [0.13, 700, 820, 0.1], [0.27, 820, 900, 0.12], [0.42, 980, 640, 0.45]].forEach(([d, f, t, len]) => tone(f, t, len, 0.06, 'sawtooth', d)),
  /** The café's wind chime: a few soft bells. */
  windChime: () => [0, 1, 2, 3].forEach((i) => {
    const s = PENTA[Math.floor(Math.random() * PENTA.length)] + 12
    tone(880 * Math.pow(2, s / 12), 880 * Math.pow(2, s / 12), 0.9, 0.025, 'sine', i * 0.13 + Math.random() * 0.06)
  }),
  /** The farmer's hat spinning up: a swoosh. */
  spin: () => noise(0.35, 0.05, 'bandpass', 900, 2600, 0, 1.5),
  /** The glass filled up again. */
  pourMilk: () => noise(0.6, 0.04, 'lowpass', 1200, 700, 0, 0.8),
  /** A happy "ahh" after Daddy's coffee. */
  ahh: () => tone(330, 260, 0.45, 0.06, 'triangle'),
  /** Splash! Someone (or the buffalo) got wet. */
  wet: () => {
    noise(0.3, 0.07, 'bandpass', 1400, 600, 0, 1)
    tone(500, 260, 0.2, 0.04, 'sine', 0.04)
  },
  /** An umbrella popping open. */
  umbrella: () => {
    tone(300, 900, 0.12, 0.08, 'sine')
    noise(0.06, 0.05, 'highpass', 2500, 2500, 0, 1)
  },
}
