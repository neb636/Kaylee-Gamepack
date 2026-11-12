// The reef's sounds at Ko Kudi: the captain's friendly boat horn, her big splash in off the ladder, the swish of her
// flippers and the bubbly rush of water past her mask while she swims (a loop that runs while she moves, quicker the
// faster she kicks), bubbles (out of her snorkel, Dad's bubble ring, a little fish telling her off), a soft bump on
// the coral, the rocks and the hull, the giant clam closing, the sea cucumber's squish, the cuttlefish jetting off,
// the waterproof camera's click, and the sea all round her (muffled, bubbly, a far-off swell: the stage's own bed).
// Recorded clips (sfx/, ElevenLabs) with the synthesized ones as their fallbacks. The urchins' prickly plinks, the
// twinkles, the cuttlefish's climbing color notes and the fish's little dings stay synthesized (in tune).
import { bed, clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametSfx } from '../sfx/common'
import { sametClip as c } from '../sfx'

export const synth = {
  /** Bubbles: blub blub blub (`d` seconds from now). */
  blub: (d = 0) => [0, 0.07, 0.14].forEach((x, i) => tone(320 + i * 140, 700 + i * 160, 0.07, 0.04, 'sine', d + x)),
  /** Her splash in off the ladder. */
  splash: () => {
    hiss(0.7, 0.16, 'lowpass', 1400, 300)
    hiss(0.4, 0.06, 'highpass', 3000, 1500, 0.05)
  },
  /** A flipper kick. */
  kick: () => hiss(0.12, 0.03, 'bandpass', 900, 600, 0, 1.2),
  /** The captain's toot. */
  toot: () => [0, 0.22].forEach((d) => tone(330, 340, 0.18, 0.07, 'square', d)),
  twinkle: (n = 5) => Array.from({ length: n }, (_, i) => tone(1000 * (1 + i * 0.25), 1150 * (1 + i * 0.25), 0.14, 0.045, 'sine', i * 0.09)),
  /** Mom's waterproof camera. */
  shutter: () => {
    hiss(0.06, 0.12, 'highpass', 3000, 2000)
    tone(1800, 1800, 0.03, 0.05, 'square', 0.07)
  },
  /** A soft bump on coral, a rock or the hull. */
  thud: () => hiss(0.15, 0.08, 'lowpass', 400, 200),
  /** An urchin's spines. */
  prickle: () => [0, 0.05, 0.1, 0.15].forEach((d, i) => tone(1500 + i * 300, 1400 + i * 300, 0.04, 0.03, 'triangle', d)),
  /** The giant clam closing. */
  clam: () => {
    hiss(0.1, 0.1, 'lowpass', 700, 300)
    tone(220, 160, 0.12, 0.05, 'triangle', 0.02)
  },
  /** The sea cucumber squished. */
  squish: () => tone(300, 180, 0.3, 0.05, 'triangle'),
  /** The cuttlefish jetting off to hide. */
  jet: () => hiss(0.45, 0.1, 'bandpass', 900, 2400),
  /** The parrotfish arriving, setting off, poked. */
  fishIn: () => tone(600, 900, 0.25, 0.05, 'triangle'),
  fishGo: () => tone(700, 1100, 0.18, 0.05, 'triangle'),
  fishPoke: () => tone(800, 1200, 0.15, 0.05, 'triangle'),
  /** A little fish peeking out of the coral. */
  peek: () => tone(900, 1300, 0.12, 0.05, 'triangle'),
  /** The cuttlefish's color climbing a stage. */
  color: (stage: number) => tone(700 + stage * 200, 1000 + stage * 260, 0.2, 0.05, 'sine'),
  /** (Swimming had only the kicks; while the clip loads it stays that way.) */
  swim: (_speed: number) => {},
}

export const reefSfx = {
  ...sametSfx,
  ...synth,
  blub: (d = 0) => {
    if (!playClip(c('snorkel-bubbles'), { vol: 0.55, delay: d, rate: 0.92 + Math.random() * 0.16 })) synth.blub(d)
  },
  /** Dad's bubble ring: the bubbles bigger and slower. */
  ring: () => {
    if (!playClip(c('snorkel-bubbles'), { vol: 0.7, rate: 0.78 })) synth.blub()
  },
  splash: clip(c('snorkel-jump'), synth.splash, { vol: 0.85 }),
  kick: clip(c('snorkel-kick'), synth.kick, { vol: 0.35, jitter: 0.12 }),
  /** Every frame she swims (speed in m/s): the water's rush past her mask, quicker and louder the faster she goes. */
  swim: held(c('snorkel-swim'), synth.swim, (speed: number) => ({ rate: 0.85 + Math.min(speed, 2.4) * 0.12, vol: 0.2 + Math.min(speed, 2.4) * 0.15 }), { linger: 0.25, fade: 0.35 }),
  toot: clip(c('speedboat-horn'), synth.toot, { vol: 0.4 }),
  shutter: clip(c('samet-shutter'), synth.shutter, { vol: 0.7 }),
  thud: clip(c('snorkel-bump'), synth.thud, { vol: 0.6, jitter: 0.1 }),
  clam: clip(c('snorkel-clam'), synth.clam, { vol: 0.7 }),
  squish: clip(c('snorkel-squish'), synth.squish, { vol: 0.6, jitter: 0.08 }),
  jet: clip(c('snorkel-jet'), synth.jet, { vol: 0.6 }),
}

/** Under the sea: muffled water, bubbles, a far-off swell, until stop(). */
export const reefBed = () => bed(c('snorkel-under'), 0.3)
