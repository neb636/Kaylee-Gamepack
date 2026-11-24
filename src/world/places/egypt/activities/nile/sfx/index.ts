// The Nile's sounds. Most are recorded clips (ElevenLabs, sfx.json here, made by scripts/generate-sfx.mjs) with the
// app's synth sound as the fallback (tests, slow downloads). The flower's rising note, the sun's twinkle and the
// hippo's giggle (she has a voice of her own) stay synthesized.
import { sounds } from '../../../../../../sdk'
import { bed, clip, held } from '../../../../../kit/clips'
import { noise, sfx, tone } from '../../../../../kit/sfx'

const files = import.meta.glob('./*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const nileClip = (id: string) => files[`./${id}.mp3`] ?? ''

const synth = {
  pop: sfx.pop,
  splash: sfx.splash,
  /** Something small drops in the water. */
  plop: () => {
    tone(520, 170, 0.14, 0.16)
    noise(0.14, 0.07, 'bandpass', 1500, 600, 0.02, 1)
  },
  quack: () => {
    tone(640, 430, 0.11, 0.1, 'sawtooth')
    tone(580, 390, 0.13, 0.09, 'sawtooth', 0.15)
  },
  /** The boat pushing through papyrus. */
  rustle: () => {
    noise(0.36, 0.1, 'highpass', 2600, 5200, 0, 0.7)
    noise(0.22, 0.07, 'bandpass', 1800, 3000, 0.12, 1.2)
  },
  /** The wooden wheel turning one notch, and water tipping out of a pot. */
  wheelTick: () => {
    tone(150, 230, 0.2, 0.05, 'sawtooth')
    ;[0, 0.07, 0.15, 0.24].forEach((d, i) => tone(900 + i * 150, 1500 + i * 130, 0.07, 0.045, 'sine', d))
  },
  /** The hippo's fountain lifting the boat. */
  whee: () => {
    tone(480, 1300, 0.45, 0.09, 'triangle')
    noise(0.6, 0.1, 'bandpass', 1200, 3600, 0, 0.8)
  },
  bubbles: () => [0, 0.12, 0.2, 0.33, 0.41].forEach((d) => tone(300 + Math.random() * 300, 700 + Math.random() * 400, 0.07, 0.06, 'sine', d)),
  puff: () => noise(0.18, 0.05, 'lowpass', 900, 400),
}

/** The synth wheel is a tick every notch; called every frame until the clip loads, so it keeps its own beat. */
let lastTick = 0
const wheelFallback = () => {
  const now = performance.now()
  if (now - lastTick < 360) return
  lastTick = now
  synth.wheelTick()
}

const pop = clip(nileClip('nile-catch'), synth.pop, { vol: 0.8 })

export const nsfx = {
  /** A flower hops aboard: a pop and the next note up the scale. */
  catch: (n: number) => {
    pop()
    sounds.note(n)
  },
  splash: clip(nileClip('nile-splash'), synth.splash, { vol: 0.8 }),
  plop: clip(nileClip('nile-plop'), synth.plop, { vol: 0.8 }),
  quack: clip(nileClip('nile-quack'), synth.quack, { vol: 0.8, jitter: 0.08 }),
  rustle: clip(nileClip('nile-rustle'), synth.rustle, { vol: 0.8 }),
  /** The water wheel turning while the bow holds it: call every frame. */
  wheel: held(nileClip('nile-wheel'), wheelFallback, () => ({ vol: 0.8 }), { linger: 0.35, fade: 0.4 }),
  /** Water along the hull while the boat moves (level 0-1): call every frame. No synth version: it was silent before. */
  wake: held(nileClip('nile-wake'), (_level: number) => {}, (level: number) => ({ vol: 0.15 + level * 0.45, rate: 0.9 + level * 0.2 }), { linger: 0.3, fade: 0.5 }),
  whee: clip(nileClip('nile-whee'), synth.whee, { vol: 0.8 }),
  twinkle: () => [0, 0.09, 0.18].forEach((d, i) => tone(1568 * (1 + i * 0.26), 1600 * (1 + i * 0.26), 0.26, 0.05, 'sine', d)),
  /** The hippo's giggle (her words are her voice; this is the wordless one for every later bump). */
  giggle: () => [0, 0.11, 0.22, 0.33].forEach((d, i) => tone(430 + (i % 2) * 120, 540 + (i % 2) * 120, 0.09, 0.08, 'triangle', d)),
  bubbles: clip(nileClip('nile-bubbles'), synth.bubbles, { vol: 0.8 }),
  puff: clip(nileClip('nile-puff'), synth.puff, { vol: 0.6 }),
  /** The river's ambient bed: returns its stop. */
  river: () => bed(nileClip('nile-river'), 0.3),
}
