// The mountain road's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise): the other drivers'
// toots, the animals, the guard rail's boing, the wipers, the tyres in the wet and the puddles, the nodding
// elephant's squeak, the tyres squealing round a sharp swerve. (The voices are lines.ts L.nan.drive.)
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const roadSfx = {
  ...sfx,
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
  /** The tyres squealing round a sharp swerve (k: how hard, 0..1): a cartoon "eeeee" sliding down, and a scrubby hiss. */
  screech: (k = 1) => {
    const d = 0.3 + 0.3 * k
    const f = 1150 + Math.random() * 300
    tone(f, f * 0.8, d, 0.04 + 0.03 * k, 'triangle')
    tone(f * 1.48, f * 1.25, d * 0.85, 0.012 + 0.012 * k, 'square', 0.02)
    noise(d, 0.05 + 0.05 * k, 'bandpass', 2700, 1600, 0, 5)
  },
  /** A wiper's sweep across the glass (a dry one squeaks). */
  wiper: (dry = false) => {
    noise(0.22, 0.035, 'bandpass', 1800, 900, 0, 0.8)
    if (dry) tone(1250, 1500, 0.12, 0.02, 'sine', 0.05)
  },
  /** Tyres hissing on the wet road. */
  hiss: (k = 1) => noise(0.5, 0.018 * k, 'highpass', 2500, 2000, 0, 1),
  /** Through a puddle: splosh. */
  puddle: () => {
    noise(0.35, 0.09, 'lowpass', 1600, 400, 0, 0.6)
    tone(320, 160, 0.18, 0.04, 'sine', 0.02)
  },
  /** The little elephant toy: a squeaky trumpet. */
  squeak: () => {
    tone(740, 1180, 0.14, 0.06, 'triangle')
    tone(1180, 880, 0.16, 0.05, 'triangle', 0.13)
  },
}
