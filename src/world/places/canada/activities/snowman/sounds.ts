// Carnival Snowballs' recorded sounds (prompts in sfx/parts/snowman.json, made with the `sfx` skill), each over the
// synth sound it replaces (kit/clips.ts plays the synth until the clip has loaded, and in test browsers). The game
// (carnival.ts) and the chapter's two films (story/films/snowman.ts) both use them.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const synthCrunch = (r: number) => noise(0.16, 0.05 + r * 0.03, 'bandpass', 900 - r * 280, 500 - r * 120, 0, 1.3)
const synthPat = () => [0, 0.11, 0.22].forEach((d) => noise(0.07, 0.12, 'bandpass', 1300, 700, d, 1.4))
const synthBoom = () => {
  tone(110, 55, 0.35, 0.22, 'sine')
  noise(0.18, 0.12, 'lowpass', 500, 120)
}
const synthToot = () => {
  tone(523, 523, 0.18, 0.05, 'sawtooth')
  tone(659, 659, 0.18, 0.05, 'sawtooth', 0.2)
  tone(784, 784, 0.32, 0.05, 'sawtooth', 0.4)
}

export const snowSfx = {
  /** A snowball rolling over the snow: a soft crunch (`r`, its radius, deepens the synth one). */
  crunch: clip(url('snowman-crunch'), synthCrunch, { jitter: 0.12 }),
  /** Mittens patting a new little snowball together. */
  pat: clip(url('snowman-pat'), synthPat),
  /** A snowball landing on top of another: plop. */
  plop: clip(url('snowman-plop'), () => (sfx.thump(), sounds.pop())),
  /** The box's lid pops and out flies a hat or a sash. */
  hatPop: clip(url('snowman-hat-pop'), () => (sounds.pop(), sfx.fwip())),
  /** A dressed snowman wakes up: a twinkly shimmer. */
  wake: clip(url('snowman-wake'), () => sounds.sparkle()),
  /** The big carnival trumpet: a cheerful toot-toot-toooot. */
  trumpet: clip(url('snowman-trumpet'), synthToot),
  /** The parade drum: a big soft boom. */
  drum: clip(url('snowman-drum'), synthBoom, { jitter: 0.02 }),
  /** Sleigh bells on the horse and carriage. */
  bells: clip(url('snowman-bells'), () => [0, 0.08, 0.16, 0.3].forEach((d, i) => tone(2400 + i * 180, 2300 + i * 180, 0.12, 0.02, 'sine', d))),
  /** A snowball bouncing off a round snowy tummy: a big rubbery boing. */
  boing: clip(url('snowman-boing'), () => sfx.boing(), { jitter: 0 }),
  /** A snowman dozing on his feet: a tiny whistling snore. */
  snore: clip(url('snowman-snore'), () => tone(300, 420, 0.6, 0.04, 'sine')),
  /** The carnival far off behind the park, under the game: soft crowd, faint music box bells, wind. Until stop(). */
  bed: () => bed(url('snowman-bed'), 0.22),
}
