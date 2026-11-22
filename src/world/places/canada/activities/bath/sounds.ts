// Misty's Bubble Bath's recorded sounds (prompts in sfx/parts/bath.json, made with the `sfx` skill), each over the
// synth sound it stands in for until the clip has loaded (kit/clips.ts; test browsers hear the synth). The river's own
// (the falls, a salmon leaping, the raven) are the set's (story/sets/bath.ts riverSfx); Misty's sneeze, her boop and
// her happy grumble kept their salmon names.
import { sounds } from '../../../../../sdk'
import { clip, held, playClip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const bubbles = () => [0, 0.06, 0.13].forEach((d, i) => tone(700 + i * 260 + Math.random() * 200, 1300 + i * 200, 0.06, 0.03, 'sine', d))

export const bathSfx = {
  /** The sponge scrubbing through suds: a soft, bubbly squish (a loop while she rubs). */
  suds: held(url('bath-suds'), (_k: number) => noise(0.12, 0.05, 'bandpass', 1400, 2600, 0, 1.6), (k: number) => ({ vol: 0.5 + 0.5 * k, rate: 0.9 + 0.2 * k })),
  /** A rubbery squeak of the sponge on wet fur. */
  squeak: clip(url('bath-squeak'), () => tone(900, 1500, 0.09, 0.04, 'triangle'), { jitter: 0.1 }),
  /** Suds popping as the rain rinses them. */
  pop: clip(url('bath-pop'), bubbles, { jitter: 0.12 }),
  /** The little rain cloud raining on her (a loop while it rains). */
  rain: held(url('bath-rain'), () => noise(0.18, 0.04, 'highpass', 3500, 5000, 0, 0.8), () => ({ vol: 0.8 })),
  /** The towel rubbing her fluffy (a loop). */
  towel: held(url('bath-towel'), () => noise(0.14, 0.04, 'lowpass', 900, 500, 0, 1), () => ({ vol: 0.7 })),
  /** The comb through her fur: a quick soft zip. */
  comb: clip(url('bath-comb'), () => noise(0.14, 0.06, 'bandpass', 2400, 4200, 0, 3), { jitter: 0.1 }),
  /** A berry bush squashed: a juicy squelch. */
  squash: clip(url('bath-squash'), () => (noise(0.16, 0.12, 'lowpass', 700, 260, 0, 2), tone(300, 160, 0.12, 0.06, 'sine'))),
  /** Berry juice rubbed on: a wet little dab. */
  paint: clip(url('bath-paint'), () => noise(0.08, 0.05, 'bandpass', 900, 600, 0, 2.5), { jitter: 0.15 }),
  /** A wet bear shaking like a dog: fur flapping and drops flying. */
  shake: clip(url('bath-shake'), () => [0, 0.08, 0.16, 0.24, 0.32].forEach((d) => noise(0.08, 0.08, 'bandpass', 1600, 900, d, 1.2))),
  /** Her paw pressed onto the sweater: THUMP. */
  thump: clip(url('bath-thump'), () => (sfx.thump(), tone(140, 70, 0.22, 0.2, 'sine')), { jitter: 0 }),
  /** Her back scratched on the cedar's bark: scritch-scratch. */
  scratch: clip(url('bath-scratch'), () => [0, 0.12, 0.24, 0.36].forEach((d) => noise(0.09, 0.07, 'bandpass', 2200, 1500, d, 2))),
  /** The banana slug stretching out its eye stalks: a tiny slurpy squelch. */
  slug: clip(url('bath-slug'), () => tone(500, 900, 0.2, 0.04, 'sine')),
  /** The still pool starting to glow like a mirror: a soft magical shimmer. */
  shimmer: clip(url('bath-shimmer'), () => sounds.sparkle(), { jitter: 0 }),
  /** The team sweater pulled on: a soft cloth whoosh and a twinkle. */
  dress: clip(url('bath-dress'), () => (sounds.whoosh(), sounds.sparkle())),
  /** A decoration popping onto her: a soft pop and a tiny twinkle. */
  deco: clip(url('bath-deco'), () => (sounds.pop(), tone(1800, 2400, 0.12, 0.03, 'sine', 0.05))),
  /** The bar of soap slipping out and flying: a slippery squirt. */
  soap: clip(url('bath-soap'), () => (noise(0.1, 0.06, 'bandpass', 1800, 3400, 0, 2), sounds.pop())),
  /** A floating soap bubble popped by her finger: a tiny wet plip. */
  plip: clip(url('bath-plip'), () => tone(1400 + Math.random() * 500, 2400, 0.05, 0.05, 'sine'), { jitter: 0.15 }),
  /** The pink rubber duck squeaking. */
  duck: clip(url('bath-duck'), () => [0, 0.14].forEach((d) => tone(1100, 1500, 0.08, 0.06, 'square', d)), { jitter: 0.06 }),
  /** A patch of her comes clean: a sparkly ding, a step higher for each one (`n` 0, 1, 2...). */
  ding: (n: number) => {
    const rate = Math.pow(2, [0, 2, 4, 7, 9, 12, 14][Math.min(6, n)] / 12)
    if (!playClip(url('bath-ding'), { vol: 0.8, rate })) tone(880 * rate, 1320 * rate, 0.25, 0.06, 'sine')
  },
  /** (Loads the ding before the first patch comes clean.) */
  warm: () => void playClip(url('bath-ding'), { vol: 0 }),
  /** Misty sneezing (her own clip from the salmon days). */
  sneeze: clip(url('salmon-sneeze'), () => (noise(0.3, 0.12, 'bandpass', 1200, 600, 0.25, 1), tone(500, 300, 0.2, 0.06, 'triangle'))),
  /** A boop on her big round nose. */
  boop: clip(url('salmon-boop'), () => sfx.boing()),
  /** Her soft, low, happy grumble when she likes it. */
  grumble: clip(url('salmon-grumble'), () => tone(120, 150, 0.5, 0.08, 'triangle')),
}
