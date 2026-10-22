// The Golden Mountain's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise): the count up the
// scale is the SDK's sounds.note(step); Daddy's huffing, the monkeys' chatter, the bell. The words (Sparkle's count,
// Daddy's race lines) are voices (lines.ts `L.mall.mountain`).
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

export const mountainSfx = {
  ...sfx,
  /** Her hand slaps onto a hold: a rubbery squeak. */
  grab: () => {
    tone(700, 1100, 0.07, 0.05, 'triangle')
    noise(0.05, 0.05, 'bandpass', 2200, 1600, 0, 2)
  },
  /** Pulling up: a little effortful "hup" sliding up. */
  hup: () => tone(260, 420, 0.16, 0.06, 'triangle'),
  /** Feet scrabbling on the cone. */
  scrabble: () => [0, 0.06, 0.12].forEach((d) => noise(0.04, 0.05, 'highpass', 2600, 2000, d, 1)),
  /** A poke on something that just wobbles: boing. */
  boingy: () => {
    tone(220, 520, 0.16, 0.08, 'triangle')
    tone(520, 300, 0.2, 0.05, 'sine', 0.12)
  },
  /** A non-pink hold: a clown-nose honk. */
  honk: () => {
    tone(330, 300, 0.18, 0.08, 'square')
    tone(415, 380, 0.18, 0.05, 'square', 0.2)
  },
  /** A hold that giggles. */
  holdGiggle: () => [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => tone(1200 + (i % 2) * 260, 1500, 0.06, 0.05, 'sine', d)),
  /** A monkey blowing a raspberry. */
  raspberry: () => {
    noise(0.45, 0.12, 'bandpass', 180, 140, 0, 3)
    tone(90, 70, 0.45, 0.06, 'sawtooth')
  },
  /** The temple bell on top: a deep dong with a shimmer. */
  bell: (big = 1) => {
    tone(392, 388, 2.2, 0.09 * big, 'sine')
    tone(784, 780, 1.6, 0.04 * big, 'sine', 0.01)
    tone(1176, 1170, 1.0, 0.025 * big, 'sine', 0.02)
    tone(1868, 1860, 0.6, 0.012 * big, 'triangle', 0.02)
  },
  /** The bell rope: a creak and a tug. */
  rope: () => {
    tone(320, 220, 0.18, 0.04, 'sawtooth')
    noise(0.1, 0.04, 'lowpass', 900, 300)
  },
  /** Daddy out of breath: huff... puff. */
  huff: () => [0, 0.32].forEach((d, i) => noise(0.22, 0.09, 'bandpass', i ? 700 : 900, i ? 450 : 600, d, 1.2)),
  /** The steel slide: a shine running down it. */
  ting: () => [0, 0.09, 0.18].forEach((d, i) => tone(2093 - i * 260, 2090 - i * 260, 0.3, 0.035, 'sine', d)),
  /** Down the steel slide: a rising metal swoosh. */
  zoom: () => {
    noise(1.4, 0.09, 'bandpass', 500, 2400, 0, 0.9)
    tone(500, 1100, 1.2, 0.03, 'triangle')
  },
  /** An elephant on the wall: a trumpet. */
  trumpet: () => {
    tone(330, 660, 0.26, 0.07, 'sawtooth')
    tone(660, 520, 0.45, 0.06, 'sawtooth', 0.24)
  },
  /** Its spray of water. */
  spray: () => noise(0.5, 0.06, 'highpass', 3000, 1600, 0.3, 0.8),
  /** The pattern bands lighting up, a ripple of little bells. */
  ripple: () => [0, 0.07, 0.14, 0.21, 0.28].forEach((d, i) => tone(1318 + i * 180, 1320 + i * 180, 0.18, 0.03, 'sine', d)),
  /** A flag popping onto the rail. */
  flag: () => [0, 0.08, 0.16].forEach((d, i) => tone(784 * [1, 1.25, 1.5][i], 790 * [1, 1.25, 1.5][i], 0.2, 0.05, 'triangle', d)),
  /** Kaylee wins the race: a little fanfare. */
  win: () => [0, 0.12, 0.24, 0.42].forEach((d, i) => tone([784, 988, 1175, 1568][i], [784, 988, 1175, 1568][i], i === 3 ? 0.5 : 0.14, 0.06, 'triangle', d)),
}
