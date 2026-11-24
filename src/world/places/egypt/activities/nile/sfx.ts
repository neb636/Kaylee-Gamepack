// The Nile's own sounds, built on the app's synth (kit/sfx). These are stand-ins: the recorded ones (ElevenLabs, the
// sfx skill) go over them with clip(url, nsfx.x) when they're made.
import { sounds } from '../../../../../sdk'
import { noise, sfx, tone } from '../../../../kit/sfx'

export const nsfx = {
  /** A flower hops aboard: a pop and the next note up the scale. */
  catch: (n: number) => {
    sfx.pop()
    sounds.note(n)
  },
  splash: sfx.splash,
  /** Something small drops in the water. */
  plop: () => {
    tone(520, 170, 0.14, 0.16)
    noise(0.14, 0.07, 'bandpass', 1500, 600, 0.02, 1)
  },
  quack: () => {
    tone(640, 430, 0.11, 0.1, 'sawtooth')
    tone(580, 390, 0.13, 0.09, 'sawtooth', 0.15)
  },
  /** The boat pushing through papyrus. */
  rustle: () => {
    noise(0.36, 0.1, 'highpass', 2600, 5200, 0, 0.7)
    noise(0.22, 0.07, 'bandpass', 1800, 3000, 0.12, 1.2)
  },
  /** The wooden wheel turning one notch. */
  creak: () => tone(150, 230, 0.2, 0.05, 'sawtooth'),
  /** Water tipping out of a pot. */
  trickle: () => [0, 0.07, 0.15, 0.24].forEach((d, i) => tone(900 + i * 150, 1500 + i * 130, 0.07, 0.045, 'sine', d)),
  /** The hippo's fountain lifting the boat. */
  whee: () => {
    tone(480, 1300, 0.45, 0.09, 'triangle')
    noise(0.6, 0.1, 'bandpass', 1200, 3600, 0, 0.8)
  },
  twinkle: () => [0, 0.09, 0.18].forEach((d, i) => tone(1568 * (1 + i * 0.26), 1600 * (1 + i * 0.26), 0.26, 0.05, 'sine', d)),
  /** The hippo's giggle (her words are her voice; this is the wordless one for every later bump). */
  giggle: () => [0, 0.11, 0.22, 0.33].forEach((d, i) => tone(430 + (i % 2) * 120, 540 + (i % 2) * 120, 0.09, 0.08, 'triangle', d)),
  bubbles: () => [0, 0.12, 0.2, 0.33, 0.41].forEach((d) => tone(300 + Math.random() * 300, 700 + Math.random() * 400, 0.07, 0.06, 'sine', d)),
  puff: () => noise(0.18, 0.05, 'lowpass', 900, 400),
}
