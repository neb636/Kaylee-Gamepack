// Little Land's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet: Daddy's
// sneeze and laugh, Kaylee's giggle.
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093, 2349]
const note = (k: number) => SCALE[Math.max(0, Math.min(SCALE.length - 1, k))]

export const blocksSfx = {
  ...sfx,
  /** A brick lifted: a soft foam squeak. */
  lift: () => {
    noise(0.08, 0.05, 'bandpass', 1800, 2600, 0, 2)
    tone(600, 900, 0.07, 0.04, 'triangle')
  },
  /** A brick landing: a soft whump, a little higher the higher it lands. */
  whump: (row = 0) => {
    noise(0.1, 0.1, 'lowpass', 520 + row * 90, 150)
    tone(150 + row * 26, 90 + row * 14, 0.13, 0.07, 'sine')
  },
  /** A brick half over the edge: the tower sways, "whoa-oa". */
  whoa: () => {
    tone(520, 330, 0.5, 0.05, 'sine')
    tone(600, 380, 0.4, 0.035, 'triangle', 0.18)
  },
  /** A poke on a brick under the others: boing. */
  boingy: () => {
    tone(220, 520, 0.16, 0.08, 'triangle')
    tone(520, 300, 0.2, 0.05, 'sine', 0.12)
  },
  /** The tower going over: a big soft whoosh and a tumble of foam. */
  crash: () => {
    noise(0.7, 0.11, 'bandpass', 600, 200, 0, 0.7)
    for (let i = 0; i < 6; i++) tone(180 - i * 12, 90, 0.1, 0.06, 'sine', 0.12 + i * 0.09)
  },
  /** A flying brick hitting the mats. */
  bounce: (k = 0) => {
    noise(0.06, 0.06, 'lowpass', 600 + k * 120, 200)
    tone(200 + k * 30, 120, 0.08, 0.04, 'sine')
  },
  /** A brick hopping home into the box: a note up the scale. */
  note: (k: number) => tone(note(k), note(k) * 1.02, 0.14, 0.06, 'triangle'),
  /** Back in the box by hand: fwip. */
  fwip: () => tone(900, 300, 0.12, 0.06, 'sine'),
  /** The chedi's gold spire: a temple bell. */
  bell: () => {
    ;[0, 0.02].forEach((d, i) => tone(i ? 1568 : 784, i ? 1560 : 780, 1.6, i ? 0.03 : 0.07, 'sine', d))
    tone(2350, 2340, 0.9, 0.02, 'sine', 0.05)
  },
  /** The elephant comes alive: a trumpet. */
  trumpet: () => {
    tone(330, 660, 0.28, 0.08, 'sawtooth')
    tone(660, 520, 0.5, 0.07, 'sawtooth', 0.26)
    tone(990, 780, 0.45, 0.025, 'square', 0.26)
  },
  /** Ears flapping. */
  flap: () => [0, 0.14, 0.28].forEach((d) => noise(0.07, 0.06, 'bandpass', 900, 1500, d, 1.5)),
  /** A star onto the easel. */
  star: () => [0, 0.08, 0.16, 0.26].forEach((d, i) => tone(note(4 + i * 2), note(4 + i * 2), 0.22, 0.05, 'triangle', d)),
  /** Daddy's sneeze: ah... ah... */
  ahh: () => [0, 0.4].forEach((d, i) => tone(300 + i * 90, 380 + i * 120, 0.32, 0.07, 'triangle', d)),
  /** ...CHOO! */
  choo: () => {
    noise(0.45, 0.18, 'bandpass', 1600, 500, 0, 0.8)
    tone(420, 180, 0.25, 0.08, 'sawtooth')
  },
  /** Daddy impressed: "ooh!" */
  ooh: () => tone(260, 420, 0.4, 0.07, 'triangle'),
  /** The wall's brick: a note. */
  wallNote: (k: number) => {
    tone(note(k), note(k), 0.2, 0.05, 'sine')
    noise(0.05, 0.04, 'lowpass', 600, 300)
  },
  /** The foam ball: a fat boing. */
  ballBoing: () => {
    tone(160, 420, 0.18, 0.09, 'sine')
    tone(420, 260, 0.15, 0.04, 'triangle', 0.12)
  },
  /** The rocking elephant: a squeaky creak. */
  rock: () => [0, 0.35].forEach((d, i) => tone(i ? 700 : 900, i ? 600 : 760, 0.16, 0.035, 'triangle', d)),
}
