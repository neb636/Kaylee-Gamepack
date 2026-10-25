// The rental desk's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the key fob's beep-beep, the Pajero's answer, the bags thumping into the boot, the seatbelt's click, the
// engine, and the pokes' answers.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const rentalSfx = {
  ...sfx,
  /** The key fob's button: a tiny click. */
  press: () => tone(2400, 2000, 0.03, 0.05, 'square'),
  /** The Pajero answers the fob: the classic car-lock chirp, chirp. */
  carChirp: () => [0, 0.17].forEach((d) => {
    tone(1180, 1160, 0.1, 0.07, 'square', d + 0.05)
    tone(1770, 1750, 0.1, 0.03, 'square', d + 0.05)
  }),
  /** The wing mirrors folding out: a little whirr. */
  mirrors: () => noise(0.45, 0.04, 'bandpass', 700, 1300, 0.1, 2),
  /** The tailgate popping up (and, slower, down: `down`). */
  tailgate: (down = false) => {
    if (down) {
      noise(0.2, 0.06, 'lowpass', 900, 300, 0.25)
      tone(110, 80, 0.15, 0.12, 'triangle', 0.25)
    } else {
      tone(500, 900, 0.08, 0.05, 'square')
      noise(0.6, 0.04, 'bandpass', 600, 1100, 0.05, 1.5)
    }
  },
  /** A bag into the boot: a soft heavy thump, and the springs creak as the car squats. */
  bagIn: (k: number) => {
    noise(0.15, 0.1, 'lowpass', 600, 200)
    tone(130, 90, 0.18, 0.1, 'triangle')
    ;[0, 0.12].forEach((d, i) => tone(380 + k * 40 - i * 30, 300 + k * 40, 0.1, 0.03, 'sawtooth', 0.12 + d))
  },
  /** The seatbelt clicking into its buckle. */
  click: () => {
    tone(2600, 2400, 0.025, 0.09, 'square')
    tone(1800, 1500, 0.04, 0.06, 'square', 0.035)
  },
  /** A door shutting: a solid thunk. */
  door: () => {
    noise(0.12, 0.09, 'lowpass', 700, 250)
    tone(140, 95, 0.14, 0.12, 'triangle')
  },
  /** A little rain shower out of the mountain poster. */
  rain: () => [0, 0.1, 0.2, 0.32, 0.45, 0.6].forEach((d) => noise(0.05, 0.03, 'highpass', 3500 + Math.random() * 2000, 3000, d, 1)),
  /** The clerk's laugh. */
  clerk: () => [0, 0.12, 0.24].forEach((d, i) => tone(720 - i * 30, 600 - i * 30, 0.09, 0.07, 'triangle', d)),
}
