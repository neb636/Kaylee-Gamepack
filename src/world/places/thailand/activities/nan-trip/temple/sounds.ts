// Wat Phumin's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the lantern lighting up, a scene waking (a bell note, higher for each one), the lovers' whisper (louder the
// nearer the lantern), the temple bells (a deep bong outside, a bright one at each Buddha), the doors and their light,
// the shoes, the nagas' blink, the pigeons, the painted elephant's trumpet, the boat race's drum, the dance tune and
// the gold hall.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
const note = (base: number, k: number) => base * Math.pow(2, PENTA[k % PENTA.length] / 12) * (k >= PENTA.length ? 2 : 1)

/** A bell: a few inharmonic partials ringing out. */
function bell(f: number, vol: number, dur: number, delay = 0) {
  tone(f, f, dur, vol, 'sine', delay)
  tone(f * 2.76, f * 2.74, dur * 0.6, vol * 0.35, 'sine', delay)
  tone(f * 5.4, f * 5.38, dur * 0.3, vol * 0.15, 'sine', delay)
  tone(f * 0.5, f * 0.5, dur * 0.9, vol * 0.25, 'sine', delay)
}

export const templeSfx = {
  ...sfx,
  /** The lantern lighting up: a soft fwoomp. */
  fwoomp: () => {
    noise(0.35, 0.06, 'lowpass', 300, 1400, 0, 0.9)
    tone(220, 520, 0.3, 0.05, 'sine')
  },
  /** A scene waking: a bell-like note, higher for each one awake. */
  wake: (k: number) => {
    const f = note(523, k)
    tone(f, f, 0.6, 0.06, 'sine')
    tone(f * 2, f * 2, 0.35, 0.025, 'triangle', 0.03)
  },
  /** Round 1 done, the lovers found at home: a run of bells. */
  run: () => [0, 1, 2, 3, 4, 5, 6].forEach((i) => tone(note(523, i), note(523, i), 0.45, 0.05, 'sine', i * 0.09)),
  /** The lovers' whisper: "psst... shh-shh", louder the nearer the lantern (vol 0..1). */
  whisper: (vol: number) => {
    const v = 0.012 + vol * 0.09
    noise(0.07, v, 'bandpass', 5200, 4200, 0, 3)
    noise(0.06, v * 0.8, 'bandpass', 4600, 3800, 0.12, 3)
    noise(0.22, v, 'bandpass', 3200, 2400, 0.3, 2)
    noise(0.18, v * 0.7, 'bandpass', 3400, 2600, 0.6, 2)
  },
  /** Found! A giggle and a heart's pop. */
  found: () => {
    sfx.giggle()
    tone(900, 1500, 0.14, 0.06, 'sine', 0.3)
  },
  /** A heart flying off to the next hiding spot. */
  flyHeart: () => tone(700, 1400, 0.6, 0.04, 'triangle'),
  /** The big whisper at home, and the hearts floating up. */
  sigh: () => {
    noise(0.6, 0.06, 'bandpass', 2600, 1600, 0, 1.5)
    ;[0, 0.25, 0.5, 0.75].forEach((d, i) => tone(note(784, i), note(784, i) * 1.02, 0.3, 0.04, 'sine', 0.5 + d))
  },
  /** A temple bell: the big one outside (deep), each Buddha's (brighter, a note for each). */
  bong: () => bell(196, 0.12, 2.6),
  ding: (k = 0) => bell(note(392, k * 2), 0.08, 2.0),
  /** A door opening, and the light pouring in: a creak, then a warm chord. */
  door: () => {
    tone(150, 110, 0.5, 0.05, 'sawtooth')
    tone(180, 130, 0.4, 0.035, 'sawtooth', 0.25)
    ;[392, 494, 587, 784].forEach((f, i) => tone(f, f, 1.6, 0.025, 'sine', 0.4 + i * 0.05))
  },
  /** A knock on a shut door (light through the crack). */
  knock: () => [0, 0.16].forEach((d) => {
    tone(140, 90, 0.08, 0.1, 'sine', d)
    noise(0.05, 0.05, 'lowpass', 700, 300, d, 1)
  }),
  /** A Buddha glowing: a shimmer. */
  glow: () => [0, 1, 2, 3, 4].forEach((i) => tone(note(1046, i), note(1046, i), 0.5, 0.018, 'sine', i * 0.05)),
  /** The candle catching. */
  candle: () => {
    noise(0.25, 0.04, 'highpass', 2200, 1200, 0, 0.8)
    tone(600, 900, 0.15, 0.02, 'sine', 0.05)
  },
  /** A naga's blink: a tiny bright bling. */
  blink: () => tone(1800, 2400, 0.12, 0.04, 'sine'),
  /** A pigeon: a soft coo. */
  coo: () => [0, 0.32].forEach((d, i) => tone(i ? 360 : 420, i ? 330 : 380, 0.26, 0.05, 'sine', d)),
  /** The painted elephant's trumpet. */
  trumpet: () => {
    tone(330, 720, 0.25, 0.07, 'sawtooth')
    tone(720, 540, 0.45, 0.06, 'sawtooth', 0.22)
  },
  /** The boat race: the drum keeping time, the paddles. */
  race: () => {
    for (let i = 0; i < 8; i++) tone(110, 70, 0.1, 0.09, 'sine', i * 0.22)
    for (let i = 0; i < 6; i++) noise(0.12, 0.04, 'bandpass', 1400, 600, 0.1 + i * 0.29, 1.4)
  },
  /** Birds flying off: chirps. */
  chirp: () => [0, 0.1, 0.24].forEach((d) => tone(3600 + Math.random() * 800, 2800, 0.06, 0.035, 'sine', d)),
  /** A scene dancing: a little khaen-ish tune. */
  dance: () => [0, 2, 4, 7, 4, 2, 4, 9].forEach((s, i) => tone(392 * Math.pow(2, s / 12), 392 * Math.pow(2, s / 12), 0.16, 0.05, i % 2 ? 'triangle' : 'square', i * 0.15)),
  /** The cat in the window. */
  mew: () => tone(900, 600, 0.3, 0.05, 'triangle'),
  /** The painted buffalo. */
  moo: () => {
    tone(150, 110, 0.9, 0.1, 'sawtooth')
    tone(300, 220, 0.9, 0.025, 'triangle', 0.05)
  },
  /** The whole hall turning gold. */
  gold: () => {
    for (let i = 0; i < 10; i++) tone(note(523, i), note(523, i), 0.9, 0.03, 'sine', i * 0.12)
    ;[262, 330, 392, 523].forEach((f, i) => tone(f, f, 3, 0.025, 'sine', 0.2 + i * 0.1))
  },
  /** Daddy painted into the mural: a magic swirl. */
  magic: () => [0, 1, 2, 3, 4, 5].forEach((i) => tone(note(880, i), note(880, i), 0.18, 0.04, 'triangle', i * 0.05)),
}
