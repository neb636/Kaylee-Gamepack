// The salt hut's sounds (the voices are lines.ts L.nan.salt): the bucket in the well, the brine pouring, the fire, the
// boiling, the paddle's scrape, the basket, the pokes' answers, the scooter going by and the village around her.
// Recorded clips (sfx/, ElevenLabs) with the synthesized ones (the world kit's tone/noise) as their fallbacks; the
// climbing notes and the bell runs stay synthesized (they're in tune), played over the clips.
import { bed, clip, held, playClip } from '../../../../../kit/clips'
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'
import { nanClip } from '../sfx'

const synth = {
  ...sfx,
  /** The bucket hitting the brine down the well: a deep, echoing splash. */
  plunge: () => {
    noise(0.3, 0.12, 'lowpass', 1400, 300)
    tone(180, 90, 0.25, 0.08, 'sine')
    noise(0.25, 0.03, 'lowpass', 900, 300, 0.22)
  },
  /** Filling up: glug glug, climbing as it fills. */
  glug: (k: number) => {
    const f = 140 + k * 220
    tone(f, f * 1.6, 0.08, 0.08, 'sine')
  },
  /** The heavy, full bucket coming up: a creak of the rope on the beam. */
  creak: () => [0, 0.12].forEach((d, i) => tone(300 - i * 40, 220 - i * 30, 0.14, 0.035, 'sawtooth', d)),
  /** Brine pouring (played over and over while it pours). */
  pour: () => noise(0.22, 0.06, 'bandpass', 900, 1500, 0, 1.2),
  /** It lands in the pan: a splashy slosh, higher as the pan fills. */
  slosh: (level: number) => {
    noise(0.3, 0.08, 'bandpass', 700 + level * 600, 400, 0, 1.1)
    tone(260 + level * 260, 200 + level * 200, 0.15, 0.04, 'sine', 0.05)
  },
  /** The pan full: a little run of bells. */
  full: () => [0, 1, 2, 3, 4].forEach((i) => tone(587 * Math.pow(2, i / 5), 587 * Math.pow(2, i / 5), 0.3, 0.05, 'sine', i * 0.09)),
  /** A log thrown on: a woody clunk and a whoosh of flame. */
  log: () => {
    tone(160, 110, 0.12, 0.12, 'triangle')
    noise(0.5, 0.07, 'bandpass', 500, 1600, 0.06, 0.8)
  },
  /** Blowing on the fire. */
  puff: () => noise(0.35, 0.08, 'bandpass', 1100, 500, 0, 0.9),
  /** The fire crackling (now and then, more the bigger it is). */
  crackle: (k: number) => {
    for (let i = 0; i < 2 + k * 4; i++) noise(0.03, 0.03 + k * 0.05, 'highpass', 2000 + Math.random() * 2500, 3000, Math.random() * 0.3, 1.5)
  },
  /** The brine bubbling. */
  bubble: () => {
    const f = 500 + Math.random() * 500
    tone(f, f * 1.8, 0.05, 0.025, 'sine')
  },
  /** Brine on the fire: a big hiss. */
  hiss: () => noise(0.7, 0.09, 'highpass', 2500, 4000, 0, 0.6),
  /** The first salt showing at the edges: a sparkly shimmer. */
  shimmer: () => [0, 1, 2].forEach((i) => tone(1568 + i * 330, 1600 + i * 330, 0.2, 0.03, 'sine', i * 0.07)),
  /** The paddle scraping salt: a gritty scrape (played while it moves through salt). */
  scrape: () => noise(0.12, 0.05, 'highpass', 1800, 2600, 0, 1.6),
  /** The paddle tipping salt into the basket: a sandy shush and a note that climbs with how full it is. */
  pourSalt: (n: number) => {
    noise(0.35, 0.06, 'bandpass', 3000, 1500, 0, 0.8)
    const f = 523 * Math.pow(2, Math.min(n, 14) / 12)
    tone(f, f, 0.18, 0.05, 'triangle', 0.1)
  },
  /** A bag onto the shelf: a soft pat and a bell, higher each time. */
  bag: (k: number) => {
    noise(0.08, 0.06, 'lowpass', 700, 300)
    const f = 784 * Math.pow(2, k / 6)
    tone(f, f, 0.3, 0.05, 'sine', 0.05)
  },
  /** Kaylee licks a salty finger: a "blehh!" wobble. */
  salty: () => {
    tone(420, 300, 0.12, 0.07, 'square')
    tone(300, 240, 0.35, 0.06, 'triangle', 0.1)
    noise(0.15, 0.04, 'bandpass', 2000, 1200, 0.1, 2)
  },
  /** The salt aunty laughing. */
  aunty: () => [0, 0.13, 0.26, 0.39].forEach((d, i) => tone(560 - i * 25, 470 - i * 25, 0.1, 0.07, 'triangle', d)),
  /** The rooster: cock-a-doodle-doo. */
  crow: () => {
    tone(700, 900, 0.12, 0.07, 'sawtooth')
    tone(900, 1000, 0.12, 0.07, 'sawtooth', 0.14)
    tone(1000, 1200, 0.18, 0.07, 'sawtooth', 0.28)
    tone(1200, 760, 0.45, 0.07, 'sawtooth', 0.48)
  },
  /** The hen: buk-buk-bukaawk. */
  cluck: () => [0, 0.11, 0.22].forEach((d, i) => tone(i === 2 ? 760 : 520, i === 2 ? 980 : 470, i === 2 ? 0.2 : 0.07, 0.06, 'square', d)),
  /** The baskets wobbling on their stack. */
  wobble: () => [0, 0.1, 0.2].forEach((d) => noise(0.06, 0.05, 'bandpass', 900, 600, d, 1.5)),
  /** A plunk down the well: an echo. */
  echo: () => [0, 0.25, 0.5].forEach((d, i) => tone(520, 380, 0.14, 0.07 / (1 + i * 1.5), 'sine', d)),
}

export const saltSfx = {
  ...synth,
  plunge: clip(nanClip('salt-plunge'), synth.plunge, { vol: 0.8 }),
  /** Climbing as it fills (`k` 0..1). */
  glug: (k: number) => {
    if (!playClip(nanClip('salt-glug'), { vol: 0.6, rate: 0.8 + k * 0.7 })) synth.glug(k)
  },
  creak: clip(nanClip('salt-creak'), synth.creak, { vol: 0.5 }),
  pour: held(nanClip('salt-pour'), synth.pour, () => ({ vol: 0.55 })),
  /** Higher as the pan fills (`level` 0..1). */
  slosh: (level: number) => {
    if (!playClip(nanClip('salt-slosh'), { vol: 0.6, rate: 0.9 + level * 0.35 })) synth.slosh(level)
  },
  log: clip(nanClip('salt-log'), synth.log, { vol: 0.7 }),
  puff: clip(nanClip('salt-blow'), synth.puff, { vol: 0.6 }),
  /** More the bigger the fire (`k` 0..1). */
  crackle: (k: number) => {
    if (!playClip(nanClip('salt-crackle'), { vol: 0.35 + k * 0.5, rate: 0.9 + Math.random() * 0.2 })) synth.crackle(k)
  },
  bubble: (): void => {
    if (!playClip(nanClip('salt-bubble'), { vol: 0.3, rate: 0.8 + Math.random() * 0.5 })) synth.bubble()
  },
  hiss: clip(nanClip('salt-sizzle'), synth.hiss, { vol: 0.6 }),
  scrape: held(nanClip('salt-scrape'), synth.scrape, () => ({ vol: 0.5 }), { linger: 0.35 }),
  /** The sandy shush, and the note that climbs with how full the basket is. */
  pourSalt: (n: number) => {
    if (!playClip(nanClip('salt-pour-salt'), { vol: 0.6 })) return synth.pourSalt(n)
    const f = 523 * Math.pow(2, Math.min(n, 14) / 12)
    tone(f, f, 0.18, 0.05, 'triangle', 0.1)
  },
  /** The soft pat, and a bell, higher each time. */
  bag: (k: number) => {
    if (!playClip(nanClip('salt-pat'), { vol: 0.6 })) return synth.bag(k)
    const f = 784 * Math.pow(2, k / 6)
    tone(f, f, 0.3, 0.05, 'sine', 0.05)
  },
  crow: clip(nanClip('salt-rooster'), synth.crow, { vol: 0.6 }),
  cluck: clip(nanClip('salt-hen'), synth.cluck, { vol: 0.6 }),
  wobble: clip(nanClip('salt-wobble'), synth.wobble, { vol: 0.6 }),
  echo: clip(nanClip('salt-echo'), synth.echo, { vol: 0.7 }),
  /** The scooter puttering past on the road (it used to go by in silence). */
  scooter: () => void playClip(nanClip('salt-scooter'), { vol: 0.45 }),
}

/** The village around the hut: drizzle, birds, a far-off rooster, until stop(). */
export const villageBed = () => bed(nanClip('salt-village'), 0.3)
