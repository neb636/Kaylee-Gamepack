// The Cup's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise): the kart's buzzing engine,
// its horn, the rumble on the grass, the mushrooms' boing, and "so close" when she's second by a nose. The rest is
// Thailand's sfx (the countdown lights, the burst of speed, the fireworks) and the mountain road's (the puddles' splosh,
// into the cloud and out above it).
import { noise, tone } from '../../../../../kit/sfx'
import { roadSfx } from '../drive/sounds'

export const cupSfx = {
  ...roadSfx,
  /** One beat of the kart's little engine (`level` 0..1): a buzz that climbs with the speed. */
  engine: (level: number) => {
    const f = 70 + level * 120
    tone(f, f * 1.08, 0.07, 0.025 + level * 0.02, 'sawtooth')
  },
  /** Her horn: beep beep! */
  honk: () => [0, 0.16].forEach((d) => tone(740, 720, 0.12, 0.09, 'square', d)),
  /** Bumping over the grass. */
  rumble: () => noise(0.12, 0.05, 'lowpass', 300, 200, 0, 1.2),
  /** Second by a nose: a soft falling "aww", then a little climb (it's still great). */
  soClose: () => {
    tone(660, 520, 0.35, 0.07, 'triangle')
    ;[0, 1, 2].forEach((i) => tone(523 * 2 ** (i / 4), 523 * 2 ** (i / 4), 0.18, 0.05, 'sine', 0.45 + i * 0.12))
  },
}
