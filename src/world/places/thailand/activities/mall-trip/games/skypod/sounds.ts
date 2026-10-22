// The Sky Pod's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). The wall is an
// instrument: each pod plays its own note of a major scale (layout.ts SCALE). No voices yet: Daddy's laugh and "hey!",
// Kaylee's giggle.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'
import { SCALE } from './layout'

const f = (i: number) => SCALE[Math.max(0, Math.min(SCALE.length - 1, i))]

export const podSfx = {
  ...sfx,
  /** A pod's note: a bright bell-marimba (a soft octave on top). `lit`: the light she was after, a little sparkle more. */
  note: (i: number, lit = false) => {
    tone(f(i), f(i) * 1.002, 0.42, 0.11, 'triangle')
    tone(f(i) * 2, f(i) * 2, 0.22, 0.03, 'sine')
    if (lit) tone(f(i) * 3, f(i) * 3.01, 0.16, 0.02, 'sine', 0.04)
  },
  /** The slap itself: a soft, padded thwack. */
  slap: () => {
    noise(0.06, 0.09, 'bandpass', 1500, 700, 0, 1.4)
    tone(190, 110, 0.07, 0.06, 'sine')
  },
  /** Not the pattern's next one: its note as a silly kazoo, wobbling down. */
  funny: (i: number) => {
    tone(f(i) * 0.5, f(i) * 0.36, 0.42, 0.07, 'sawtooth')
    tone(f(i) * 0.5 * 1.03, f(i) * 0.37, 0.42, 0.04, 'square', 0.02)
  },
  /** A pod lighting up: a little blip up. */
  pop: (i = 4) => tone(f(i) * 1.5, f(i) * 2, 0.08, 0.035, 'sine'),
  /** Daddy's blue light popping on: a lower blip. */
  popBlue: () => tone(392, 520, 0.09, 0.035, 'sine'),
  /** The springy mat: a boing, higher the higher she goes. */
  spring: (k = 0) => tone(180 + k * 120, 420 + k * 260, 0.18, 0.05, 'triangle'),
  /** A pod slapped too many times: it pops out on its spring. */
  sproing: () => {
    tone(260, 900, 0.12, 0.07, 'square')
    tone(900, 300, 0.4, 0.05, 'triangle', 0.1)
  },
  /** The pattern played back right: a quick sparkle up. */
  copied: () => [0, 2, 4, 7].forEach((k, i) => tone(f(k) * 2, f(k) * 2, 0.16, 0.04, 'triangle', i * 0.06)),
  /** A star onto the board. */
  star: () => [0, 0.08, 0.16, 0.26].forEach((d, i) => tone(f(2 + i * 2) * 1.5, f(2 + i * 2) * 1.5, 0.24, 0.05, 'triangle', d)),
  /** The finale's roll-up: a tick climbing as the number does. */
  tick: (k: number) => tone(800 + k * 14, 820 + k * 14, 0.03, 0.025, 'square'),
  /** Daddy's hand misses: a slap on the wall, and "ow-ow". */
  oops: () => {
    noise(0.07, 0.1, 'lowpass', 900, 300)
    ;[0.12, 0.3].forEach((d) => tone(520, 330, 0.14, 0.06, 'triangle', d))
  },
  /** "Hey!" (she took his light). */
  hey: () => tone(330, 560, 0.2, 0.08, 'triangle'),
  /** The speaker's beat: a kick, and a little hat on the off-beat. */
  kick: () => {
    tone(140, 45, 0.18, 0.16, 'sine')
    noise(0.03, 0.04, 'lowpass', 500, 200)
  },
  hat: () => noise(0.04, 0.03, 'highpass', 6000, 7000),
  /** The rocket: a rumble and a whoosh. */
  rocket: () => {
    noise(0.9, 0.09, 'lowpass', 300, 1400, 0, 0.8)
    tone(90, 260, 0.8, 0.04, 'sawtooth', 0.1)
  },
  /** The moon: a soft dreamy chime. */
  moon: () => [0, 4, 7, 9].forEach((k, i) => tone(f(k) * 2, f(k) * 2, 0.5, 0.03, 'sine', i * 0.11)),
  /** The board: a beep-boop. */
  board: () => [0, 0.12].forEach((d, i) => tone(i ? 660 : 990, i ? 660 : 990, 0.09, 0.05, 'square', d)),
}
