// The sandcastle's sounds at Hin Khok: the scrape of the sand under her finger while she digs (a loop that runs while
// she digs, brighter the deeper she goes), the pat of a wall or a mould patted firm, dry sand trickling over Daddy,
// the bucket slammed down on the castle, a tower slumping, the ghost crab's skitter and a shell's clink, the beach
// ball, each wave of the tide washing up the beach, the sand crumbling as the sea breaks through and the water rushing
// into the moat, and the beach itself (waves, a breeze, gulls far off: the shared beach bed). Recorded clips (sfx/,
// ElevenLabs) with the synthesized ones as their fallbacks. The moat's climbing ring notes, the twinkles, the fanfare,
// the moulds' arriving whoop, the sad slide, the flag's and Mommy's dings, Daddy's sneeze and Kaylee's giggle stay
// synthesized (in tune, or a voice).
import { clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametSfx } from '../sfx/common'
import { sametClip as c } from '../sfx'

export const synth = {
  /** Her finger through the sand, brighter the deeper (k 0..1). */
  scrape: (k: number) => hiss(0.09, 0.05 + k * 0.05, 'bandpass', 700 + k * 900, 500 + k * 500, 0, 1.4),
  /** Sand patted firm. */
  pat: () => hiss(0.06, 0.12, 'lowpass', 600, 300),
  /** Sand rubbed over Daddy. */
  pour: () => hiss(0.12, 0.08, 'lowpass', 900, 500),
  /** The sea rushing along her channel into the moat. */
  rush: () => {
    hiss(1.6, 0.14, 'lowpass', 500, 1600)
    hiss(1.2, 0.05, 'highpass', 2400, 1200, 0.2)
  },
  /** The last of the sand crumbling away between the water and the moat. */
  crumble: () => hiss(0.7, 0.12, 'lowpass', 420, 900),
  twinkle: () => [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => tone(1000 * (1 + i * 0.25), 1150 * (1 + i * 0.25), 0.14, 0.045, 'sine', d)),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.22, 0.07, 'triangle', i * 0.13)),
  sadSlide: () => tone(700, 300, 0.7, 0.05, 'triangle'),
  sneeze: () => {
    tone(500, 900, 0.35, 0.05, 'triangle')
    hiss(0.3, 0.25, 'bandpass', 1800, 900, 0.38, 0.8)
  },
  giggle: () => [0, 0.1, 0.2].forEach((d, i) => tone(700 + i * 90, 900 + i * 90, 0.08, 0.05, 'triangle', d)),
  /** The longtail out on the bay. */
  toot: () => [0, 0.2].forEach((d) => tone(330, 340, 0.16, 0.07, 'square', d)),
  /** The moulds bouncing in. */
  arrive: () => tone(880, 1320, 0.25, 0.06, 'triangle'),
  /** A bit of the moat dug round the castle: a note higher each time. */
  ring: (f: number) => tone(f, f * 1.25, 0.12, 0.045, 'sine'),
  /** A part of Daddy all covered: a note higher each part. */
  buried: (i: number) => tone(600 + i * 120, 650 + i * 120, 0.12, 0.05, 'triangle'),
  /** A shell tapped. */
  shell: () => tone(1400, 1800, 0.1, 0.05, 'sine'),
  /** A tower's flag popped up or down. */
  flag: () => tone(900, 1300, 0.12, 0.05, 'triangle'),
  /** Mommy waves. */
  mommy: () => tone(880, 1100, 0.15, 0.05, 'triangle'),
  /** (The tide's waves and the beach ball had no sound of their own; their fallbacks are quiet ones.) */
  swash: () => hiss(0.9, 0.03, 'lowpass', 900, 500, 0, 0.7),
}

export const sandSfx = {
  ...sametSfx,
  ...synth,
  /** Called every 0.11 s while she digs: the scrape loops, brighter and louder the deeper (k 0..1). */
  scrape: held(c('sand-scrape'), synth.scrape, (k: number) => ({ rate: 0.9 + k * 0.25, vol: 0.45 + k * 0.35 }), { linger: 0.25, fade: 0.15 }),
  pat: clip(c('sand-pat'), synth.pat, { vol: 0.6, jitter: 0.12 }),
  /** Called every 0.14 s while she rubs sand over Daddy. */
  pour: held(c('sand-pour'), synth.pour, () => ({ vol: 0.5 }), { linger: 0.3, fade: 0.2 }),
  crumble: clip(c('sand-crumble'), synth.crumble, { vol: 0.6 }),
  rush: clip(c('sand-rush'), synth.rush, { vol: 0.9 }),
  /** A tower slumps into a heap. */
  slump: clip(c('sand-slump'), sametSfx.thump, { vol: 0.7, jitter: 0.08 }),
  /** The mould slammed down upside down on the castle. */
  slam: clip(c('sand-slam'), sametSfx.thump, { vol: 0.8, jitter: 0.06 }),
  shell: clip(c('sand-shell'), synth.shell, { vol: 0.5, jitter: 0.1 }),
  /** The ghost crab (or the hermit crab): a tiny skitter of claws. */
  crab: clip(c('sand-crab'), sametSfx.chirp, { vol: 0.6, jitter: 0.1 }),
  /** The beach ball bounced. */
  ball: clip(c('sand-ball'), sametSfx.boing, { vol: 0.6, jitter: 0.08 }),
  toot: clip(c('speedboat-horn'), synth.toot, { vol: 0.35 }),
  /** Each wave of the tide washing up the beach; the big one (`big`) bigger and slower. */
  swash: (big = false) => {
    if (!playClip(c('sand-swash'), { vol: big ? 0.9 : 0.4, rate: big ? 0.85 : 0.95 + Math.random() * 0.1 })) synth.swash()
  },
}
