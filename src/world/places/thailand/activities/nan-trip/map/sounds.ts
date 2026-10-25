// The Nan map's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the little Pajero's beep and putter, the stamp landing, the pokes' answers.
import { noise, tone } from '../../../../../kit/sfx'
import { roadSfx } from '../drive/sounds'

export const mapSfx = {
  ...roadSfx,
  /** The little Pajero driving along the board's roads: a toy's putter (over and over while it goes). */
  putter: () => tone(150 + Math.random() * 30, 130, 0.06, 0.035, 'square'),
  /** Off it goes to a place she picked: a rising zoom. */
  zoom: () => {
    tone(330, 660, 0.35, 0.06, 'triangle')
    noise(0.35, 0.04, 'bandpass', 800, 2400, 0, 1)
  },
  /** It's there, and the camera dives into the road: a whoosh down and a sparkle. */
  dive: () => {
    noise(0.7, 0.07, 'bandpass', 2400, 400, 0, 0.8)
    ;[0, 1, 2].forEach((i) => tone(1046 * (1 + i * 0.25), 1046 * (1 + i * 0.25), 0.2, 0.04, 'sine', 0.2 + i * 0.08))
  },
  /** A place she's already been to: a happy little run of notes. */
  been: () => [0, 1, 2].forEach((i) => tone(784 * Math.pow(2, (i * 4) / 12), 784 * Math.pow(2, (i * 4) / 12), 0.16, 0.05, 'triangle', i * 0.08)),
  /** The mushroom farm, the café and the salt hut answer a poke. */
  bloop: () => tone(300, 700, 0.16, 0.08, 'sine'),
  /** A cloud poked: a little rain. */
  rain: () => [0, 0.1, 0.2, 0.32, 0.45].forEach((d) => noise(0.05, 0.03, 'highpass', 3500 + Math.random() * 2000, 3000, d, 1)),
  /** The fish jumping out of the river and back in. */
  plip: () => {
    tone(600, 1400, 0.1, 0.06, 'sine')
    noise(0.15, 0.05, 'bandpass', 1500, 600, 0.5, 1)
  },
  /** The tiny plane taking off: a little jet climbing. */
  takeoff: () => noise(1.6, 0.05, 'bandpass', 600, 2400, 0, 1.4),
  /** A flag waving in the wind. */
  flutter: () => [0, 0.08, 0.16, 0.24].forEach((d) => noise(0.06, 0.04, 'bandpass', 900 + Math.random() * 400, 1400, d, 1.5)),
}
