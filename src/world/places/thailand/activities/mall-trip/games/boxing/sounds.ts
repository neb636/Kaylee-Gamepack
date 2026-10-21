// Muay Thai's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise): the punches, the POW, the
// coach's drum (the klong) and the little cymbal (the ching), the ring bell, the ropes. No voices yet: Daddy's oof and
// laugh, Kaylee's giggle, the coach's babble.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093]
const note = (k: number) => SCALE[Math.max(0, Math.min(SCALE.length - 1, k))]

export const boxingSfx = {
  ...sfx,
  /** A glove on the bag: a fat thud, a little bigger on a hook. */
  thud: (power = 1) => {
    noise(0.12, 0.16 * Math.min(1.4, power), 'lowpass', 520, 140)
    tone(120 + power * 10, 60, 0.16, 0.13, 'sine')
    tone(2500, 2300, 0.04, 0.012, 'square', 0.05)
  },
  /** A glove on the pad: a crisp pap! */
  pap: () => {
    noise(0.07, 0.18, 'bandpass', 1500, 900, 0, 1.2)
    tone(320, 180, 0.08, 0.08, 'triangle')
  },
  /** The glove going out: a little swish. */
  swish: () => noise(0.09, 0.05, 'bandpass', 1400, 2800, 0, 1.5),
  /** On the beat: a huge POW, a ding over it. */
  pow: () => {
    noise(0.22, 0.2, 'lowpass', 900, 160)
    tone(90, 45, 0.25, 0.16, 'sine')
    tone(1568, 1560, 0.6, 0.05, 'sine', 0.02)
    tone(2093, 2090, 0.45, 0.025, 'sine', 0.03)
  },
  /** The klong: a deep drum, dum (the first of each four a little lower and bigger). */
  drum: (accent = false) => {
    tone(accent ? 98 : 116, accent ? 58 : 70, 0.32, accent ? 0.17 : 0.13, 'sine')
    noise(0.1, accent ? 0.09 : 0.06, 'lowpass', 380, 120)
    tone(accent ? 196 : 232, accent ? 150 : 180, 0.08, 0.03, 'triangle')
  },
  /** The ching: two little cymbals, a soft ting between the beats. */
  ching: () => {
    tone(3520, 3500, 0.22, 0.012, 'sine')
    tone(4700, 4690, 0.16, 0.007, 'sine')
  },
  /** The ring bell: ding ding (n strikes). */
  bell: (n = 2) => {
    for (let i = 0; i < n; i++) {
      tone(1046, 1040, 0.9, 0.06, 'sine', i * 0.28)
      tone(2093, 2085, 0.6, 0.025, 'sine', i * 0.28 + 0.005)
      noise(0.03, 0.04, 'highpass', 4000, 4000, i * 0.28)
    }
  },
  /** A soft temple bell for each bow of the wai kru (a little higher each time). */
  bow: (k = 0) => {
    tone(note(3 + k), note(3 + k), 1.1, 0.05, 'sine')
    tone(note(3 + k) * 2, note(3 + k) * 2, 0.7, 0.015, 'sine', 0.01)
  },
  /** A dance step on the mat: a light tap and a note up the scale. */
  step: (k = 0) => {
    noise(0.05, 0.05, 'lowpass', 700, 300)
    tone(note(5 + k), note(5 + k) * 1.01, 0.16, 0.05, 'triangle')
  },
  /** The ropes: a twang. */
  twang: () => {
    tone(196, 150, 0.45, 0.07, 'sawtooth')
    tone(392, 300, 0.3, 0.025, 'triangle', 0.01)
  },
  /** Daddy staggering: oof. */
  oof: () => tone(280, 150, 0.2, 0.08, 'triangle'),
  /** The water bottle: a squirt, then drips. */
  squirt: () => {
    noise(0.25, 0.08, 'bandpass', 1200, 2600, 0, 2)
    ;[0.35, 0.5, 0.62].forEach((d, i) => tone(900 - i * 120, 500, 0.06, 0.04, 'sine', d))
  },
  /** The coach kicks the small bag: thwack. */
  thwack: () => {
    noise(0.1, 0.18, 'bandpass', 900, 300, 0, 1)
    tone(160, 70, 0.14, 0.12, 'sine')
  },
  /** The star board: a note up the scale. */
  note: (k: number) => tone(note(k), note(k) * 1.02, 0.18, 0.05, 'triangle'),
  /** A star onto the board. */
  star: () => [0, 0.08, 0.16, 0.26].forEach((d, i) => tone(note(3 + i * 2), note(3 + i * 2), 0.24, 0.05, 'triangle', d)),
  /** A lamp on the board lighting up. */
  lamp: (k: number) => tone(note(k), note(k), 0.1, 0.035, 'sine'),
  /** The big unicorn kick: a whoosh up, then a huge thump. */
  bigKick: () => {
    noise(0.3, 0.12, 'bandpass', 600, 2400, 0, 0.8)
    noise(0.25, 0.22, 'lowpass', 900, 150, 0.22)
    tone(110, 40, 0.3, 0.18, 'sine', 0.22)
  },
  /** The champion's belt: a fanfare up the scale. */
  fanfare: () => [0, 0.12, 0.24, 0.4, 0.52].forEach((d, i) => tone(note(2 + i * 2), note(2 + i * 2), i === 4 ? 0.6 : 0.2, 0.06, 'triangle', d)),
  /** The coach: a happy babble (no voice yet). */
  coach: () => sfx.babble(330),
}
