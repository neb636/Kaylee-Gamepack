// The finale's sounds. The sunset at Ao Prao sounds like the beach (the common bed): a warm hum while she pulls the sun
// down, its fizzy plop into the sea, the driftwood tree creaking, splashes, a shooting star's whoosh and Mom's phone.
// The fire show on Sai Kaew is a night beach (its own bed: waves in the dark, a crackling fire, crickets): her poi's
// whoosh-roar while she twirls them fast (the core verb), the hand drum keeping time, the fire dancers' whoomps, the
// ring of fire rushing round the beach, a glowing fish jumping, the jet ski man puttering by, and at the end the
// fireworks (a soft fizz up, a pretty crackle-sparkle pop, never a bang) and the beach clapping. Recorded clips (sfx/,
// ElevenLabs) with the synthesized ones as their fallbacks; the jingle of her poi, the dots' climbing notes, the
// lanterns' lift, the fanfares, the chimes, the countdown, the gecko's "tukkae", Dad's laugh and the giggles stay
// synthesized (in tune, or the characters' own voices).
import { bed, clip, held, playClip } from '../../../../../kit/clips'
import { tone } from '../../../../../kit/sfx'
import { sametClip as c } from '../sfx'
import { beachBed, sametSfx } from '../sfx/common'

export const synth = {
  // ---- The fire show.
  drum: (accent = false) => {
    tone(accent ? 120 : 95, 48, 0.22, accent ? 0.2 : 0.12, 'sine')
    if (accent) tone(240, 120, 0.08, 0.05, 'triangle')
  },
  jingle: () => [0, 0.05].forEach((d, i) => tone(1760 + i * 220, 1900 + i * 220, 0.08, 0.035, 'triangle', d)),
  dotNote: (n: number) => {
    const f = 523 * 2 ** (([0, 2, 4, 7, 9, 12, 14, 16][n % 8] + 12 * Math.floor(n / 8)) / 12)
    tone(f, f, 0.12, 0.04, 'triangle')
  },
  lift: () => [0, 0.1, 0.2, 0.3, 0.42].forEach((d, i) => tone(660 + i * 150, 700 + i * 170, 0.18, 0.05, 'sine', d)),
  fanfare: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f, 0.24, 0.07, 'triangle', i * 0.12)),
  flameUp: (d = 0) => {
    tone(160, 90, 0.25, 0.05, 'sawtooth', d)
  },
}

const none = () => {}

/** The sunset: the common set, plus the sun and the tree. */
export const sunsetSfx = {
  ...sametSfx,
  /** A warm, magic hum while she drags the sun down (each move of her finger; it was silent before). */
  pull: held(c('sunset-pull'), none, () => ({ vol: 0.45 }), { linger: 0.25 }),
  /** The sun touches the sea: a fizzy plop. */
  plop: clip(c('sunset-plop'), sametSfx.plop, { vol: 0.75 }),
  creak: clip(c('sunset-creak'), sametSfx.creak, { vol: 0.6, jitter: 0.08 }),
}

export const fireSfx = {
  ...sametSfx,
  ...synth,
  /** Her poi whirling round (each frame she draws, `speed` m/s): a whoosh-roar that climbs as she spins faster. */
  poi: held(c('fire-poi'), (_speed: number) => {}, (speed: number) => ({ rate: 0.85 + Math.min(speed, 10) * 0.04, vol: Math.min(0.9, 0.25 + speed * 0.07) })),
  /** The hand drum keeping time: a soft boom, a bigger one on the accent. */
  drum: (accent = false) => {
    if (!playClip(c('fire-drum'), { vol: accent ? 0.9 : 0.5, rate: accent ? 0.94 : 1.02 })) synth.drum(accent)
  },
  /** A fire dancer's poi whooming round (a tap on a dancer, a flame of the ring catching). */
  whoomp: clip(c('fire-whoomp'), () => sametSfx.whoosh(0.7), { vol: 0.6, jitter: 0.1 }),
  flameUp: clip(c('fire-whoomp'), synth.flameUp, { vol: 0.4, jitter: 0.12 }),
  /** The ring of fire rushing round the whole beach. */
  ring: clip(c('fire-ring'), sametSfx.zoom, { vol: 0.7 }),
  /** A firework going up: a soft fizz. */
  launch: clip(c('fire-launch'), () => sametSfx.whoosh(0.8), { vol: 0.45, jitter: 0.1 }),
  /** A firework opening: a soft crackle-sparkle pop. */
  bang: clip(c('fire-firework'), sametSfx.bang, { vol: 0.6, jitter: 0.1 }),
  /** The beach clapping for the ring of fire. */
  cheer: clip(c('fire-clap'), sametSfx.cheer, { vol: 0.55 }),
  /** A glowing fish leaping out of the waves (lunch's fish jump). */
  plop: () => {
    if (!playClip(c('jetski-fish'), { vol: 0.35, rate: 0.95 + Math.random() * 0.15 })) sametSfx.plop()
  },
  /** The jet ski man riding by out on the water (each frame; `near` 0..1): the jet ski stop's engine, far off. */
  jetski: held(c('jetski-engine'), (_near: number) => {}, (near: number) => ({ rate: 0.9, vol: 0.05 + near * 0.2 })),
}

/** A night on the beach: soft waves in the dark, a crackling fire, crickets, until stop(). */
export const nightBed = () => bed(c('fire-night'), 0.3)

export { beachBed }
