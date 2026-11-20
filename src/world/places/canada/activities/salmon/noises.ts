// Salmon Leap's sounds: recorded clips (prompts in places/canada/sfx/parts/salmon.json, made by the `sfx` skill) over
// the synthesized ones from kit/sfx, which play until the clips are made (and in test browsers). Plain Web Audio, no
// React. The films' own sounds are in story/sets/salmon.ts.
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const leap = clip(url('salmon-leap'), (power: number) => {
  noise(0.22, 0.08, 'bandpass', 900 + power * 1200, 2600 + power * 1600, 0, 1.5)
  tone(500 + power * 300, 900 + power * 500, 0.14, 0.04, 'triangle')
})
const splash = clip(url('salmon-splash'), () => noise(0.25, 0.1, 'bandpass', 2000, 700, 0, 1))
const bigSplash = clip(url('salmon-splash-big'), () => sfx.splash())
const bonk = clip(url('salmon-bonk'), () => {
  noise(0.07, 0.4, 'bandpass', 900, 500, 0, 2.5)
  tone(220, 90, 0.2, 0.18)
  tone(700, 300, 0.4, 0.04, 'sine', 0.12)
})
const boop = clip(url('salmon-boop'), () => tone(900, 1300, 0.1, 0.12, 'sine'))
const sneeze = clip(url('salmon-sneeze'), () => {
  noise(0.12, 0.2, 'bandpass', 1800, 900, 0, 1)
  noise(0.3, 0.25, 'highpass', 2000, 5000, 0.15, 1)
})
const grumble = clip(url('salmon-grumble'), () => {
  for (const d of [0, 0.18, 0.36]) tone(140, 110, 0.16, 0.14, 'sawtooth', d)
})
const munch = clip(url('salmon-munch'), () => [0, 0.16, 0.32].forEach((d) => noise(0.08, 0.08, 'lowpass', 900, 500, d, 2)))
const raven = clip(url('salmon-raven'), () => {
  for (const d of [0, 0.3]) {
    tone(520, 380, 0.22, 0.06, 'sawtooth', d)
    noise(0.2, 0.06, 'bandpass', 1400, 1000, d, 2)
  }
})
const swipe = clip(url('salmon-swing'), () => noise(0.3, 0.06, 'bandpass', 600, 2400, 0, 1), { vol: 0.7 })

export const noises = {
  /** A salmon leaving the water: a quick wet whoosh, higher for a bigger flick. */
  leap: (power: number) => leap(power),
  /** Coming down in a pool: a splash, bigger from higher up. */
  splash(big: boolean) {
    if (big) bigSplash()
    else splash()
  },
  /** Up a step: a rising note that climbs with the pool. */
  up(step: number) {
    const f = 440 * Math.pow(2, (step * 2) / 12)
    tone(f, f * 1.5, 0.16, 0.07, 'triangle')
    tone(f * 1.5, f * 2, 0.16, 0.05, 'sine', 0.1)
  },
  /** Home in the stream: a little fanfare. */
  home() {
    for (const [i, f] of [523, 659, 784, 1047].entries()) tone(f, f, 0.18, 0.07, 'triangle', i * 0.09)
  },
  /** Bonk on the rock face (and the slide back down). */
  bonk: () => bonk(),
  /** Off a rock: a dry knock. */
  knock() {
    noise(0.06, 0.35, 'bandpass', 1500, 900, 0, 3)
  },
  /** The springy log. */
  boing: () => sfx.boing(),
  /** A bear's nose boop; the sneeze after it (the river times it). */
  boop: () => boop(),
  sneeze: () => sneeze(),
  /** A bear's happy grumble (going for berries, or a laugh). */
  grumble: () => grumble(),
  /** A bear swiping a paw at the water (or snapping at a salmon flying past). */
  swipe: () => swipe(),
  /** A bear munching berries. */
  munch: () => munch(),
  /** A bear plopping back into the water. */
  plop: () => bigSplash(),
  /** Maple catching one in her lap: a beaver's giggle and a tail slap. */
  giggle() {
    for (let i = 0; i < 4; i++) tone(900 + i * 60, 1200 + i * 60, 0.07, 0.06, 'triangle', i * 0.09)
    noise(0.1, 0.4, 'bandpass', 700, 300, 0.45, 2)
  },
  /** The tail slap on the water. */
  slap() {
    noise(0.1, 0.45, 'bandpass', 700, 300, 0, 2)
    noise(0.3, 0.1, 'bandpass', 2200, 700, 0.05, 0.8)
  },
  /** The raven's "kraa". */
  kraa: () => raven(),
  /** The bald eagle's screech. */
  screech() {
    tone(2600, 1700, 0.35, 0.05, 'sawtooth')
    tone(2400, 1900, 0.25, 0.04, 'triangle', 0.32)
  },
  /** Rain starting (a soft hiss) or a raindrop on the water. */
  rain() {
    noise(1.2, 0.05, 'highpass', 3000, 5000, 0, 0.7)
  },
  /** A wooden creak (the giant cedar). */
  creak() {
    tone(90, 140, 0.5, 0.08, 'sawtooth')
    noise(0.3, 0.04, 'bandpass', 600, 900, 0.1, 4)
  },
  /** A pink egg popping into the gravel. */
  egg(step: number) {
    const f = 700 * Math.pow(2, (step % 8) / 8)
    tone(f, f * 1.3, 0.1, 0.06, 'sine')
  },
  /** A baby salmon hatching. */
  hatch: () => sfx.crack(),
  /** The cub's little squeak as it rolls over. */
  squeak() {
    tone(900, 1400, 0.12, 0.06, 'triangle')
    tone(1300, 1000, 0.14, 0.05, 'triangle', 0.14)
  },
  /** The banana slug pulling its eyes in: a soft squish. */
  squish() {
    noise(0.18, 0.12, 'lowpass', 900, 300, 0, 1.2)
    tone(500, 260, 0.18, 0.04, 'sine')
  },
  /** Berries jiggling. */
  jiggle() {
    for (const d of [0, 0.06, 0.12]) tone(1200, 1500, 0.05, 0.04, 'sine', d)
  },
  /** The river, the falls and rain on the leaves: a bed until the returned stop() (the whole visit). */
  river: () => bed(url('salmon-river'), 0.22),
}
