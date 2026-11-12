// Hide and seek at Ao Prao and lunch on the deck above it. Hide and seek sounds like the sunset beach (the common beach
// bed): her hooves trotting in the sand and wading in the shallows, the pandanus and the driftwood tree's leaves
// rustling, the red plastic chairs clattering, the sea splashing where Dad hides, the towel's fwip, Kaylee's "boo!"
// pop-out and Mom's phone. Lunch: munching a roll, sipping the coconut through its straw (and the last big slurp), a
// knock on the empty shell, the monitor lizard scurrying off, the squirrel chittering up the pandanus, a fish jumping
// where she taps the sea, under the same beach bed. Recorded clips (sfx/, ElevenLabs) with the synthesized ones as
// their fallbacks; the counting notes, the ready beeps, the fanfares, the arrival dings and the little "found you"
// slides stay synthesized (in tune), and so do the giggles and Dad's "hmm" (they're the family's own voices).
import { clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametClip as c } from '../sfx'
import { beachBed, sametSfx } from '../sfx/common'

export const synth = {
  // ---- Hide and seek.
  giggle: (d = 0) => [0, 0.1, 0.2].forEach((x, i) => tone(700 + i * 90, 900 + i * 90, 0.08, 0.05, 'triangle', d + x)),
  countNote: (n: number) => tone(523 * 2 ** ((n * 2) / 12), 523 * 2 ** ((n * 2) / 12), 0.22, 0.06, 'triangle'),
  ready: () => [0, 0.12, 0.24].forEach((d, i) => tone(660 + i * 220, 700 + i * 220, 0.14, 0.06, 'square', d)),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 0.07, 'triangle', i * 0.13)),
  hmm: () => tone(220, 190, 0.45, 0.06, 'triangle'),
  rustle: () => hiss(0.35, 0.09, 'bandpass', 2400, 1400, 0, 0.8),
  clatter: () => [0, 0.07, 0.15, 0.22].forEach((d) => hiss(0.05, 0.12, 'highpass', 2200, 3000, d, 1.5)),
  boo: () => {
    tone(300, 900, 0.18, 0.08, 'square')
    hiss(0.2, 0.1, 'bandpass', 1500, 600, 0.05)
  },
  shutter: () => {
    hiss(0.06, 0.12, 'highpass', 3000, 2000)
    tone(1800, 1800, 0.03, 0.05, 'square', 0.07)
  },
  /** Found him (or he spotted her): a little slide up. */
  found: () => tone(700, 1200, 0.2, 0.06, 'triangle'),
  /** He pops out of his hiding place: "Here I am!". */
  here: () => tone(500, 900, 0.18, 0.06, 'triangle'),

  // ---- Lunch.
  slurp: (big = false) => hiss(big ? 0.6 : 0.16, big ? 0.16 : 0.07, 'bandpass', big ? 700 : 1100, big ? 300 : 800, 0, 2.5),
  ding: () => tone(1320, 1320, 0.25, 0.06, 'triangle'),
  knock: () => [0, 0.12].forEach((d) => tone(240, 200, 0.06, 0.08, 'triangle', d)),
  chitter: () => [0, 0.06, 0.12, 0.18].forEach((d, i) => tone(2200 + i * 200, 2600, 0.04, 0.04, 'square', d)),
  /** The plate all eaten: shine. */
  plateDone: () => tone(880, 1320, 0.3, 0.06, 'triangle'),
  /** A tap on her with nothing to bite: a little wiggle. */
  wiggle: () => tone(700, 900, 0.1, 0.05, 'triangle'),
  /** The monitor lizard's tongue and its hurry. */
  lizard: () => hiss(0.2, 0.06, 'bandpass', 2500, 1800),
}

/** A loop of hooves while she moves, faster with her speed (m/s); nothing until the clip loads (it was silent). */
const hooves = (id: string, vol: number) =>
  held(c(id), (_speed: number) => {}, (speed: number) => ({ rate: 0.8 + Math.min(speed, 5) * 0.09, vol: vol * Math.min(1, 0.45 + speed * 0.18) }))

export const hideSfx = {
  ...sametSfx,
  ...synth,
  /** Her hooves in the dry sand, every frame she moves (speed in m/s). */
  steps: hooves('hide-steps', 0.5),
  /** Her hooves splashing through the shallows, every frame she moves in the water. */
  wade: hooves('hide-wade', 0.55),
  rustle: clip(c('hide-rustle'), synth.rustle, { vol: 0.6, jitter: 0.1 }),
  clatter: clip(c('hide-clatter'), synth.clatter, { vol: 0.55, jitter: 0.08 }),
  boo: clip(c('hide-boo'), synth.boo, { vol: 0.7 }),
  shutter: clip(c('samet-shutter'), synth.shutter, { vol: 0.7 }),

  // ---- Lunch.
  /** A sip through the straw, every 0.34 s while her finger's on the coconut: a held loop of sipping. */
  sip: held(c('lunch-sip'), () => synth.slurp(), () => ({ vol: 0.55 }), { linger: 0.45 }),
  /** The last drops: a big SLURP. */
  bigSlurp: clip(c('lunch-slurp'), () => synth.slurp(true), { vol: 0.7 }),
  knock: clip(c('lunch-knock'), synth.knock, { vol: 0.7, jitter: 0.06 }),
  lizard: clip(c('lunch-lizard'), synth.lizard, { vol: 0.55 }),
  chitter: clip(c('book-squirrel'), synth.chitter, { vol: 0.5, jitter: 0.08 }),
  /** A fish jumps where she taps the sea (and the glowing fish at the fire show). */
  fish: () => {
    if (!playClip(c('jetski-fish'), { vol: 0.6, rate: 0.92 + Math.random() * 0.16 })) sametSfx.splash()
  },
}

export { beachBed }
