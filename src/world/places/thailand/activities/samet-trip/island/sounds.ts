// The open island's sounds (island.ts, puppy.ts): her hooves on the sand and the decks, her paddling, the beach's
// waves all round and the insects and birds in the forest on the roads inland, the sun bear's songthaew putt-putting
// by with its friendly horn, the boats' toots, her jet ski's engine, the palms and trees rustling when she pokes them,
// the coconut bonking Dad's head, the deck chairs clacking, the crabs' claws, the terns, the beach puppy's woofs,
// the sand slide's shhh, and the fire dancers' poi whooming round after dark. Recorded clips (../sfx, ElevenLabs)
// with the synthesized ones (the world kit's tone/noise) as their fallbacks; the shared ones (splash, boing, thump,
// pop, fwip, the shutter) come from ../sfx/common. The tunes and bells stay synthesized (the taxi's lap tune, the
// mermaid's flute, the bell, the ice cream and the stall's dings, the beads' jingle, the telescope, the lifeguard's
// whistle, the hide-and-seek tree's notes, the banana boat's blip), and so do the whee (the wave spin, the kite, the
// slide), her own toot when she's poked, the hammock's swish and the rocks' clack. The animals' sounds and the beach
// clean's are the book's (../book/sounds.ts).
import { clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametSfx } from '../sfx/common'
import { sametClip as c } from '../sfx'

const toot = () => [0, 0.18].forEach((d) => tone(620, 640, 0.14, 0.06, 'square', d))
const none = () => {}

const synth = {
  /** The taxi's horn (poked): beep beep. */
  honk: () => [0, 0.22].forEach((d) => tone(420, 400, 0.16, 0.08, 'square', d)),
  /** The taxi round its loop with her aboard: a little tune. */
  tune: () => [0, 0.16, 0.32, 0.48, 0.7].forEach((d, i) => tone([523, 659, 784, 659, 1046][i], [523, 659, 784, 659, 1046][i], 0.18, 0.05, 'triangle', d)),
  /** The mermaid statue's flute. */
  flute: () => [0, 0.25, 0.5, 0.75, 1.05].forEach((d, i) => tone([784, 880, 988, 1175, 988][i], [790, 885, 992, 1180, 990][i], 0.3, 0.05, 'sine', d)),
  ding: () => [0, 0.3].forEach((d) => tone(1568, 1566, 0.6, 0.06, 'sine', d)),
  jingle: () => [0, 0.06, 0.12, 0.18, 0.26].forEach((d, i) => tone(2000 + i * 260, 2100 + i * 260, 0.12, 0.03, 'sine', d)),
  /** A coconut on Dad's head; the jet ski bumping the beach. */
  bonk: () => {
    tone(300, 150, 0.18, 0.1)
    tone(1200, 1190, 0.4, 0.03, 'sine', 0.03)
  },
  whee: () => tone(500, 1100, 0.5, 0.05, 'triangle'),
  /** A boat's toot (and hers, when she's poked). */
  toot,
  /** One beat of her jet ski's engine (k: speed 0..1). */
  engine: (k: number) => tone(95 + k * 120, 90 + k * 115, 0.07, 0.016 + k * 0.012, 'sawtooth'),
  /** A bush poked: pop. */
  pop: () => tone(700, 1400, 0.08, 0.06, 'sine'),
  /** A deck chair folding (and the rocks, below). */
  clack: () => [0, 0.07].forEach((d) => hiss(0.05, 0.2, 'bandpass', 1800, 1500, d)),
  rocks: () => {
    synth.clack()
    tone(300, 220, 0.12, 0.05, 'triangle', 0.12)
  },
  /** Poked trees: the palm's fronds, the samet's papery bark, the tamarind's leaves. */
  palm: () => hiss(0.3, 0.06, 'bandpass', 900, 500),
  samet: () => hiss(0.25, 0.05, 'highpass', 2200, 1200),
  tamarind: () => hiss(0.35, 0.05, 'bandpass', 800, 400),
  hammock: () => hiss(0.4, 0.04, 'bandpass', 600, 300),
  banana: () => tone(900, 1500, 0.16, 0.05, 'triangle'),
  tern: () => tone(1800, 2400, 0.1, 0.04, 'triangle'),
  crab: () => {
    tone(1500, 1700, 0.06, 0.04, 'triangle')
    tone(1500, 1700, 0.06, 0.04, 'triangle', 0.1)
  },
  telescope: () => tone(880, 1320, 0.25, 0.05, 'sine'),
  lifeguard: () => {
    tone(1046, 1568, 0.18, 0.05, 'triangle')
    tone(1568, 1046, 0.18, 0.05, 'triangle', 0.2)
  },
  /** The driftwood tree once every flag's up (the sunset), and Dad popping out from behind it. */
  treeSunset: () => tone(660, 990, 0.3, 0.05, 'triangle'),
  treePeek: () => tone(700, 1200, 0.2, 0.06, 'triangle'),
  /** One woof from the beach puppy: a quick falling square tone with a puff of breath (a small dog: high). */
  woof: (delay = 0, pitch = 1) => {
    tone(720 * pitch, 430 * pitch, 0.11, 0.07, 'square', delay)
    tone(1440 * pitch, 860 * pitch, 0.09, 0.025, 'triangle', delay)
    hiss(0.07, 0.04, 'bandpass', 1500, 900, delay)
  },
}

const rustle = (rate: number, vol: number, fallback: () => void) => () => {
  if (!playClip(c('island-rustle'), { vol, rate: rate * (0.94 + Math.random() * 0.12) })) fallback()
}

export const islandSfx = {
  ...sametSfx,
  ...synth,
  /** A hoof on the sand (or the paths), or on a deck's planks: no synth (the island had no footsteps before). */
  step: (wood: boolean) => playClip(c(wood ? 'island-step-wood' : 'island-step-sand'), { vol: wood ? 0.3 : 0.25, rate: 0.9 + Math.random() * 0.25 }),
  /** A paddle stroke in the sea (falls back to the shared splash). */
  paddle: clip(c('island-paddle'), sametSfx.splash, { vol: 0.4, jitter: 0.12 }),
  palm: rustle(1, 0.55, synth.palm),
  samet: rustle(1.2, 0.45, synth.samet),
  tamarind: rustle(0.85, 0.5, synth.tamarind),
  bonk: clip(c('island-bonk'), synth.bonk, { vol: 0.7, jitter: 0.06 }),
  pop: clip(c('samet-pop'), synth.pop, { vol: 0.55, jitter: 0.1 }),
  clack: clip(c('island-chair'), synth.clack, { vol: 0.6, jitter: 0.08 }),
  crab: clip(c('island-crab'), synth.crab, { vol: 0.55, jitter: 0.12 }),
  tern: clip(c('jetski-tern'), synth.tern, { vol: 0.45, jitter: 0.1 }),
  /** The taxi's horn when she pokes it; a softer toot of it at each stop. */
  honk: clip(c('island-taxi-horn'), synth.honk, { vol: 0.6 }),
  taxiToot: clip(c('island-taxi-horn'), toot, { vol: 0.4 }),
  /** The boats' toots (the longtails, the speedboat, the snorkel boat, the boat home). Her own toot stays synth. */
  toot: clip(c('speedboat-horn'), toot, { vol: 0.55 }),
  herToot: toot,
  woof: (delay = 0, pitch = 1) => {
    if (!playClip(c('island-woof'), { vol: 0.55, rate: pitch, delay })) synth.woof(delay, pitch)
  },
  /** Her jet ski's engine, called every frame (k: speed 0..1, dt for the synth beat's old rate of ~8 a second). */
  skiEngine: held(
    c('jetski-engine'),
    (k: number, dt: number) => {
      if (Math.random() < dt * 8) synth.engine(k)
    },
    (k: number) => ({ rate: 0.8 + k * 0.8, vol: 0.3 + k * 0.6 }),
    { linger: 0.4 },
  ),
  /** The songthaew putt-putting along, every frame while it drives (k: its speed 0..1, vol: how near she is). */
  taxiEngine: held(c('island-taxi-engine'), none as (k: number, vol: number) => void, (k: number, vol: number) => ({ rate: 0.8 + k * 0.45, vol }), { linger: 0.4, fade: 0.6 }),
  /** Down the sand slide: shhh, quicker toward the bottom (e: 0..1), every frame. */
  slide: held(c('island-slide'), none as (e: number) => void, (e: number) => ({ rate: 0.85 + e * 0.4, vol: 0.4 + e * 0.3 }), { linger: 0.2, fade: 0.3 }),
  /** The fire dancers' poi whooming round, every frame after dark (vol: how lit and how near). */
  fire: held(c('fire-poi'), none as (vol: number) => void, (vol: number) => ({ vol }), { linger: 0.4, fade: 0.8 }),
  /** The forest on the roads inland: insects and birds, every frame she's away from the sand (k: how far in, 0..1). */
  forest: held(c('island-forest'), none as (k: number) => void, (k: number) => ({ vol: 0.3 * k }), { linger: 0.5, fade: 1.5 }),
}

/** The island's beach bed: waves all round (the shared one), until stop(). */
export { beachBed } from '../sfx/common'
