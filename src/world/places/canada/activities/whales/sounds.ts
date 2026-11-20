// Whale Watch's sounds, for the game (watch.ts) and its two films (story/films/whales.ts): recorded clips
// (sfx/parts/whales.json, made by scripts/generate-sfx.mjs) over the synth sounds they replace (kit/clips.ts), so a
// clip that hasn't been made yet, or a test browser, still plays something.
import { sounds } from '../../../../../sdk'
import { bed, clip, held } from '../../../../kit/clips'
import { noise, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

const putt = (k: number) => tone(70 + k * 50, 52, 0.06, 0.035, 'square')
/** The humpback's song (synth): long, slow swoops up and down. */
function songSynth() {
  const notes: [number, number, number][] = [
    [180, 420, 1.1],
    [420, 300, 0.9],
    [300, 520, 0.8],
    [520, 160, 1.4],
  ]
  let d = 0
  for (const [a, b, len] of notes) {
    tone(a, b, len, 0.05, 'sine', d)
    tone(a * 2, b * 2, len, 0.012, 'triangle', d)
    d += len * 0.9
  }
}
/** The orcas' calls (synth): a whistle and a burst of clicks. */
function orcaSynth(baby = false) {
  const f = baby ? 1.5 : 1
  tone(1500 * f, 2600 * f, 0.22, 0.04, 'sine')
  tone(2600 * f, 1900 * f, 0.18, 0.035, 'sine', 0.22)
  for (let i = 0; i < 5; i++) noise(0.02, 0.1, 'highpass', 3500, 3500, 0.5 + i * 0.05)
}

const orca = clip(url('whales-orca'), () => orcaSynth())
const orcaBaby = clip(url('whales-orca'), () => orcaSynth(true), { jitter: 0 })

export const whaleSfx = {
  /** The engine: call it while the boat goes (k = how fast, 0..1.3); it fades when the calls stop. */
  engine: held(url('whales-putter'), (k: number) => putt(k), (k: number) => ({ rate: 0.8 + k * 0.55, vol: 0.35 + Math.min(1, k) * 0.45 }), { linger: 0.45 }),
  /** The sea all round (until the returned stop()). */
  ocean: (vol = 0.22) => bed(url('whales-ocean'), vol),
  /** A whale breathes out. */
  blow: clip(url('whales-blow'), () => {
    noise(0.9, 0.16, 'bandpass', 700, 260, 0, 0.6)
    noise(0.6, 0.06, 'highpass', 2000, 1200, 0.05)
  }),
  /** A humpback crashes down from a jump (or the whole orca family does). */
  breach: clip(url('whales-breach'), () => {
    noise(0.9, 0.2, 'lowpass', 800, 150)
    noise(0.5, 0.14, 'bandpass', 1500, 500, 0.05, 0.8)
  }),
  /** A sea otter squeaks. */
  squeak: clip(url('whales-squeak'), () => [0, 0.12].forEach((d) => tone(1700, 2300, 0.08, 0.05, 'sine', d))),
  /** Ollie giggles (her spin). */
  giggle: clip(url('whales-giggle'), () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(1900 + i * 160, 2500 + i * 160, 0.07, 0.04, 'sine', d))),
  /** A clam knocked on a stone (one knock of the synth; the clip has three). */
  clack: clip(url('whales-clack'), () => noise(0.03, 0.18, 'highpass', 3000, 3000)),
  /** The sea lions bark. */
  lions: clip(url('whales-sealions'), () =>
    [0, 0.2, 0.4].forEach((d) => {
      tone(260, 180, 0.12, 0.08, 'sawtooth', d)
      noise(0.1, 0.06, 'bandpass', 700, 500, d)
    }),
  ),
  /** Gulls call. */
  gulls: clip(url('whales-gulls'), () => [0, 0.3].forEach((d) => tone(1500, 1100, 0.25, 0.025, 'triangle', d)), { vol: 0.7 }),
  /** The humpback sings. */
  song: clip(url('whales-song'), songSynth),
  /** The orcas call (the baby's is higher). */
  orca: (baby = false) => (baby ? orcaBaby() : orca()),
  /** The boat's horn. */
  horn: clip(url('whales-horn'), () => [0, 0.42].forEach((d) => [330, 415].forEach((f) => tone(f, f, 0.32, 0.05, 'triangle', d)))),
  /** A happy plink (something found). */
  found: () => sounds.correct(),
}
