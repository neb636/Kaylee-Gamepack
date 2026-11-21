// Whale Peek-a-Boo's sounds, for the game (watch.ts) and its two films (story/films/whales.ts): recorded clips
// (sfx/parts/whales.json, made by scripts/generate-sfx.mjs once the lead merges the parts) over the synth sounds they
// replace (kit/clips.ts), so a clip that hasn't been made yet, or a test browser, still plays something nice.
import { sounds } from '../../../../../sdk'
import { bed, clip, held, playClip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
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
/** A big splash (synth), `k` how big. */
function splashSynth(k: number) {
  noise(0.5 + 0.5 * k, 0.1 + 0.12 * k, 'lowpass', 900, 150)
  noise(0.4, 0.08 + 0.06 * k, 'bandpass', 1600, 500, 0.05, 0.8)
}
/** Bubbles (synth): little rising blips. */
const blubs = (n = 5) => Array.from({ length: n }, (_, i) => tone(300 + Math.random() * 300, 700 + Math.random() * 400, 0.06, 0.03, 'sine', i * 0.09 + Math.random() * 0.04))

const orca = clip(url('whales-orca'), () => orcaSynth())
const orcaBaby = clip(url('whales-orca'), () => orcaSynth(true), { jitter: 0 })
const breach = url('whales-breach')
const breachSynth = clip('', (k: number) => splashSynth(k))
const sink = held(url('whales-sink'), (_k: number) => blubs(2), (k: number) => ({ rate: 0.8 + k * 0.4, vol: 0.4 + k * 0.5 }), { linger: 0.35 })

export const whaleSfx = {
  /** The engine: call it while the boat goes (k = how fast, 0..1.3); it fades when the calls stop. */
  engine: held(url('whales-putter'), (k: number) => putt(k), (k: number) => ({ rate: 0.8 + k * 0.55, vol: 0.35 + Math.min(1, k) * 0.45 }), { linger: 0.45 }),
  /** The sea all round (until the returned stop()). */
  ocean: (vol = 0.22) => bed(url('whales-ocean'), vol),
  /** Bubbles come up where a whale is about to peek out. */
  bubbles: clip(url('whales-bubbles'), () => blubs(7)),
  /** One bubble pops at the surface (quiet, now and then). */
  blub: clip(url('whales-blub'), () => blubs(1), { vol: 0.5 }),
  /** A whale pops up out of the water: peek-a-boo! */
  peek: clip(url('whales-peek'), () => {
    tone(260, 620, 0.22, 0.08, 'sine')
    noise(0.4, 0.08, 'bandpass', 1200, 500, 0.05)
  }),
  /** A whale breathes out of its blowhole. */
  blow: clip(url('whales-blow'), () => {
    noise(0.9, 0.16, 'bandpass', 700, 260, 0, 0.6)
    noise(0.6, 0.06, 'highpass', 2000, 1200, 0.05)
  }),
  /** Spray rains down on the boat. */
  rain: clip(url('whales-rain'), () => noise(1.1, 0.07, 'highpass', 3500, 2500)),
  /** The grey whale rolls over (a big wet swish). */
  roll: clip(url('whales-roll'), () => noise(0.8, 0.1, 'bandpass', 900, 400, 0, 0.7)),
  /** It laughs bubbles (a bubbly giggle, no voice). */
  laugh: clip(url('whales-laugh'), () => blubs(9)),
  /** A tail slaps the water. */
  slap: clip(url('whales-slap'), () => {
    tone(160, 90, 0.12, 0.12, 'sine')
    noise(0.5, 0.12, 'lowpass', 1600, 300)
  }),
  /** Held down: the humpback sinks in a rush of bubbles (call it a few times a second while held, `k` how far down;
   *  it fades when the calls stop). */
  sinking: (k: number) => sink(k),
  /** Something big rushes up out of the water. */
  whoosh: clip(url('whales-whoosh'), () => sounds.whoosh()),
  /** A whale crashes back into the sea (`k` 0..1 how big a jump). */
  breach: (k = 1) => (breach ? playClip(breach, { rate: 1.25 - 0.35 * k, vol: 0.5 + 0.5 * k }) : false) || breachSynth(k),
  /** The jump's wave reaches the boat and washes over it. */
  wave: clip(url('whales-wave'), () => noise(0.9, 0.12, 'bandpass', 700, 300, 0, 0.6)),
  /** A little splash. */
  splash: clip(url('whales-splash'), () => sfx.splash()),
  /** A sea otter squeaks. */
  squeak: clip(url('whales-squeak'), () => [0, 0.12].forEach((d) => tone(1700, 2300, 0.08, 0.05, 'sine', d))),
  /** Ollie giggles (her spin). */
  giggle: clip(url('whales-giggle'), () => [0, 0.09, 0.18, 0.27].forEach((d, i) => tone(1900 + i * 160, 2500 + i * 160, 0.07, 0.04, 'sine', d))),
  /** The baby orca giggles (squeaky clicks and a whistle). */
  babyGiggle: clip(url('whales-baby'), () => {
    orcaSynth(true)
    ;[0, 0.07, 0.14].forEach((d) => tone(2600, 3200, 0.05, 0.03, 'sine', 0.3 + d))
  }),
  /** The rock tossed up into the air. */
  toss: clip(url('whales-toss'), () => tone(500, 1100, 0.18, 0.05, 'sine')),
  /** The rock caught (a knock of stone on stone). */
  clack: clip(url('whales-clack'), () => noise(0.03, 0.18, 'highpass', 3000, 3000)),
  /** A soft tick: the rock lands back in Ollie's paws as she juggles. */
  tick: () => tone(1800, 1600, 0.03, 0.025, 'triangle'),
  /** The sea lion barks. */
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
}
