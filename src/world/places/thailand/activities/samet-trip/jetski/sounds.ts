// The jet ski race at Sai Kaew's sounds: the life jacket's buckle, the jet ski's engine (a loop whose pitch follows her
// speed and revs up in the air), the hiss of its spray, the rev as it leaves a wave and the splash it lands with, the
// horn, the rope's rubbery stretch, the bonk of the buoys, the skid up the sand, the terns and the jumping fish, the
// jet ski man's engine in the race and the banana boat's motor out past the rope, and the beach (common.ts beachBed).
// Recorded clips (sfx/, ElevenLabs) with the old synthesized ones (the world kit's tone/noise) as their fallbacks;
// the engines nobody heard before (his jet ski, the banana boat) have no fallback. The bell's ding, the loop's twinkle,
// the countdown beeps, the dizzy wobble and the swimmers' squeals stay synthesized (in tune, or voice-like). (The
// voices are lines.ts L.samet.jetski.)
import { clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametSfx } from '../sfx/common'
import { sametClip as c } from '../sfx'

const synth = {
  engine: (k: number, air: boolean) => tone(air ? 210 + k * 120 : 95 + k * 120, air ? 230 + k * 120 : 90 + k * 115, 0.07, 0.018 + k * 0.014, 'sawtooth'),
  splashBig: (k: number) => {
    hiss(0.5 + k * 0.3, 0.12 + k * 0.12, 'lowpass', 1400, 300)
    hiss(0.25, 0.06 + k * 0.05, 'highpass', 2500, 1200, 0.05)
  },
  ding: () => [0, 0.35, 0.7].forEach((d) => {
    tone(1320, 1318, 0.9, 0.07, 'sine', d)
    tone(2640, 2630, 0.5, 0.025, 'sine', d)
  }),
  bonk: () => {
    tone(240, 160, 0.22, 0.1)
    tone(990, 980, 0.6, 0.03, 'sine', 0.02)
  },
  squeal: () => [0, 0.13].forEach((d) => tone(900, 1500, 0.16, 0.05, 'triangle', d)),
  toot: () => [0, 0.18].forEach((d) => tone(620, 640, 0.14, 0.06, 'square', d)),
  twinkle: (pink: boolean) => [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => tone((pink ? 1100 : 900) * (1 + i * 0.25), (pink ? 1300 : 1050) * (1 + i * 0.25), 0.14, 0.045, 'sine', d)),
  wobble: () => tone(520, 260, 1.1, 0.05, 'triangle'),
  beep: (go: boolean) => tone(go ? 990 : 660, go ? 990 : 660, go ? 0.45 : 0.2, 0.08, 'square'),
  click: () => [0, 0.08].forEach((d) => hiss(0.04, 0.25, 'highpass', 2800, 2800, d)),
  /** Off a wave: the engine revs as it leaves the water. */
  rev: () => tone(260, 520, 0.4, 0.04, 'sawtooth'),
  /** Up onto the sand: the hull skids. */
  skid: () => hiss(0.6, 0.18, 'bandpass', 900, 300),
  /** Daddy's cap blows off. */
  cap: () => hiss(0.4, 0.08, 'bandpass', 1500, 600),
  /** A fish plips back into the water. */
  plip: () => tone(1400, 700, 0.08, 0.03, 'sine'),
  /** A tern's chirp. */
  chirp: () => tone(1800, 2400, 0.1, 0.04, 'triangle'),
}

const engineUrl = c('jetski-engine')
const land = c('jetski-land')
const none = () => {}
/** Falloff with distance (m): full close by, gone by `far`. */
const near = (d: number, far: number) => Math.max(0, 1 - d / far) ** 2

export const jetSfx = {
  ...sametSfx,
  ...synth,
  /** One beat of her engine (k: speed 0..1.3), every 0.085 s: the loop climbs with her speed, revs higher in the air. */
  engine: held(engineUrl, synth.engine, (k: number, air: boolean) => ({ rate: air ? 1.35 + k * 0.3 : 0.75 + k * 0.55, vol: air ? 0.75 : 0.35 + k * 0.5 })),
  /** The jet ski man's engine in the race (k: his speed 0..1, d: how far from her, m). Silent before (no fallback). */
  rival: held<[number, number]>(engineUrl, none, (k: number, d: number) => ({ rate: 0.7 + k * 0.5, vol: (0.2 + k * 0.5) * near(d, 45) })),
  /** The banana boat's motor out past the rope (d: how far from her, m). Silent before. */
  banana: held<[number]>(c('speedboat-engine'), none, (d: number) => ({ rate: 0.92, vol: 0.4 * near(d, 70) })),
  /** Her rooster tail of spray hissing behind her (k: speed). Silent before. */
  spray: held<[number]>(c('jetski-spray'), none, (k: number) => ({ vol: 0.15 + 0.35 * Math.min(1, k), rate: 0.9 + 0.2 * Math.min(1, k) })),
  /** Landing off a jump, or soaking Mommy (k: how hard, 0..1). */
  splashBig: (k: number) => {
    if (!playClip(land, { vol: 0.45 + 0.55 * k, rate: 1.12 - 0.2 * k + (Math.random() - 0.5) * 0.06 })) synth.splashBig(k)
  },
  rev: clip(c('jetski-rev'), synth.rev, { vol: 0.6 }),
  bonk: clip(c('jetski-bonk'), synth.bonk, { vol: 0.7, jitter: 0.08 }),
  toot: clip(c('jetski-horn'), synth.toot, { vol: 0.55 }),
  click: clip(c('jetski-buckle'), synth.click, { vol: 0.7 }),
  /** The buoy rope stretching and twanging her back. */
  rope: clip(c('jetski-rope'), sametSfx.boing, { vol: 0.65, jitter: 0.06 }),
  skid: clip(c('jetski-skid'), synth.skid, { vol: 0.7 }),
  cap: clip(c('samet-whoosh'), synth.cap, { vol: 0.45 }),
  plip: clip(c('jetski-fish'), synth.plip, { vol: 0.45, jitter: 0.1 }),
  chirp: clip(c('jetski-tern'), synth.chirp, { vol: 0.5, jitter: 0.08 }),
}
