// The Cup's sounds: the kart's buzzing engine, its horn, the rumble on the grass, the bamboo bridge, the mushrooms'
// boing, and "so close" when she's second by a nose. Recorded clips (sfx/, ElevenLabs) with the synthesized ones (the
// world kit's tone/noise) as their fallbacks. The rest is Thailand's sfx (the countdown lights, the burst of speed, the
// fireworks) and the mountain road's (the puddles' splosh, into the cloud and out above it, the countryside).
import { clip, held } from '../../../../../kit/clips'
import { noise, tone } from '../../../../../kit/sfx'
import { roadBed, roadSfx } from '../drive/sounds'
import { nanClip } from '../sfx'

const synth = {
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
  /** A duck: quack quack! */
  quack: () => [0, 0.17].forEach((d) => tone(560, 380, 0.11, 0.06, 'square', d)),
  /** The bamboo bridge creaking under the karts. */
  creak: () => [0, 0.09, 0.2].forEach((d, i) => tone(180 + i * 40, 140 + i * 30, 0.08, 0.035, 'sawtooth', d)),
  /** Second by a nose: a soft falling "aww", then a little climb (it's still great). */
  soClose: () => {
    tone(660, 520, 0.35, 0.07, 'triangle')
    ;[0, 1, 2].forEach((i) => tone(523 * 2 ** (i / 4), 523 * 2 ** (i / 4), 0.18, 0.05, 'sine', 0.45 + i * 0.12))
  },
}

export const cupSfx = {
  ...synth,
  /** One beat of the kart's engine (`level` 0..1): a loop whose pitch climbs with the speed. */
  engine: held(nanClip('cup-engine'), synth.engine, (level: number) => ({ rate: 0.75 + level * 1.1, vol: 0.35 + level * 0.5 }), { linger: 0.4 }),
  honk: clip(nanClip('cup-honk'), synth.honk, { vol: 0.6 }),
  rumble: held(nanClip('cup-grass'), synth.rumble, () => ({ vol: 0.45 }), { linger: 0.45 }),
  quack: clip(nanClip('rice-duck'), synth.quack, { vol: 0.6 }),
  creak: clip(nanClip('cup-bridge'), synth.creak, { vol: 0.6 }),
}

/** The countryside around the track, until stop(). */
export const cupBed = () => roadBed(false)
