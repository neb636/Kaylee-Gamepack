// The balloon trip's sounds (synthesized, on the app's one AudioContext through kit/sfx): the burner's roar, the
// parachute popping open, a present landing and hopping, a leaf's boing, and the lanterns' chime.
import { noise, tone } from '../../../../kit/sfx'

export const bsfx = {
  /** The burner: a short warm roar. */
  burner: () => {
    noise(0.7, 0.14, 'lowpass', 500, 260, 0, 0.7)
    noise(0.5, 0.05, 'bandpass', 1400, 900, 0.05, 1)
  },
  /** The parachute pops open. */
  chute: () => {
    noise(0.18, 0.12, 'bandpass', 700, 1800, 0, 1.4)
    tone(320, 520, 0.12, 0.05, 'triangle', 0.02)
  },
  /** A present caught: a little jingle. */
  catch: () => [0, 0.08, 0.16].forEach((d, i) => tone([880, 1175, 1568][i], [880, 1175, 1568][i] * 1.01, 0.18, 0.08, 'triangle', d)),
  /** A present lands on the ground (soft) and hops. */
  land: () => {
    tone(220, 120, 0.12, 0.12)
    noise(0.12, 0.05, 'lowpass', 800, 300)
  },
  hop: () => tone(420, 760, 0.1, 0.06, 'triangle'),
  /** A present lands in the river. */
  plop: () => {
    tone(600, 180, 0.16, 0.1)
    noise(0.25, 0.07, 'bandpass', 1800, 700, 0.02, 1)
  },
  /** A sky lantern lifts off: a soft bell. */
  lantern: (step: number) => {
    const f = [523, 587, 659, 784, 880, 988, 1047][step % 7]
    tone(f, f, 0.9, 0.07, 'sine')
    tone(f * 2, f * 2, 0.5, 0.02, 'sine', 0.02)
  },
  /** A boat's toot. */
  toot: () => tone(330, 320, 0.45, 0.1, 'square'),
  /** A crab's clicky claws. */
  click: () => [0, 0.09, 0.18].forEach((d) => noise(0.04, 0.2, 'highpass', 3000, 3500, d, 2)),
  /** A bird's call. */
  tweet: () => [0, 0.12, 0.24].forEach((d) => tone(1800, 2600, 0.08, 0.06, 'triangle', d)),
  /** A squawk (pelican, macaw). */
  squawk: () => tone(700, 380, 0.25, 0.08, 'sawtooth'),
  /** Something puffs (a cloud). */
  puff: () => noise(0.3, 0.06, 'lowpass', 1200, 400),
}
