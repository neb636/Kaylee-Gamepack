// The mountain road's sounds: the Pajero's engine, the scooters, tuk-tuks and songthaews going by, the other drivers'
// toots, the animals, the guard rail's boing, the wipers, the rain on the roof and the tyres in the wet, the puddles,
// the nodding elephant's squeak, the tyres squealing round a sharp swerve, and the countryside outside. Recorded clips
// (sfx/, ElevenLabs) with the synthesized ones (the world kit's tone/noise) as their fallbacks. (The voices are
// lines.ts L.nan.drive.)
import { bed, clip, held, playClip } from '../../../../../kit/clips'
import { noise, tone } from '../../../../../kit/sfx'
import type { MoverKind } from '../../../trip/road/traffic'
import { sfx } from '../../../sfx'
import { nanClip } from '../sfx'

const synth = {
  ...sfx,
  /** An oncoming driver's horn: one honk, or a happy little tune (she's on their side of the road). */
  toot: (tune: boolean, low = false) => {
    const f = low ? 262 : 392
    if (!tune) return tone(f, f * 0.98, 0.3, 0.08, 'sawtooth')
    ;[1, 1.25, 1.5, 2].forEach((k, i) => tone(f * k, f * k, 0.12, 0.06, 'square', i * 0.13))
  },
  /** A water buffalo's long low moo. */
  moo: () => {
    tone(150, 110, 0.9, 0.12, 'sawtooth')
    tone(300, 220, 0.9, 0.03, 'triangle', 0.05)
  },
  /** Chickens: bawk-bawk. */
  cluck: () => [0, 0.12, 0.3].forEach((d, i) => tone(i === 2 ? 900 : 700, i === 2 ? 1400 : 560, 0.08, 0.06, 'square', d)),
  /** The guard rail boings her back like a pinball bumper. */
  rail: () => {
    tone(260, 720, 0.28, 0.12, 'sine')
    tone(390, 980, 0.2, 0.05, 'triangle', 0.03)
  },
  /** Rain pattering on the roof. */
  patter: () => noise(0.08, 0.02, 'highpass', 4000, 3000, 0, 1),
  /** Into the cloud: a soft whoosh down; out above it: a sparkle up. */
  cloudIn: () => noise(1.4, 0.06, 'lowpass', 1400, 300, 0, 0.7),
  cloudOut: () => [0, 1, 2, 3, 4].forEach((i) => tone(880 * (1 + i * 0.25), 900 * (1 + i * 0.25), 0.3, 0.04, 'sine', i * 0.09)),
  /** The tyres squealing round a sharp swerve (k: how hard, 0..1): a cartoon "eeeee" sliding down, and a scrubby hiss. */
  screech: (k = 1) => {
    const d = 0.3 + 0.3 * k
    const f = 1150 + Math.random() * 300
    tone(f, f * 0.8, d, 0.02 + 0.015 * k, 'triangle')
    tone(f * 1.48, f * 1.25, d * 0.85, 0.006 + 0.006 * k, 'square', 0.02)
    noise(d, 0.025 + 0.025 * k, 'bandpass', 2700, 1600, 0, 5)
  },
  /** A wiper's sweep across the glass (a dry one squeaks). */
  wiper: (dry = false) => {
    noise(0.22, 0.035, 'bandpass', 1800, 900, 0, 0.8)
    if (dry) tone(1250, 1500, 0.12, 0.02, 'sine', 0.05)
  },
  /** Tyres hissing on the wet road. */
  hiss: (k = 1) => noise(0.5, 0.018 * k, 'highpass', 2500, 2000, 0, 1),
  /** Through a puddle: splosh. */
  puddle: () => {
    noise(0.35, 0.09, 'lowpass', 1600, 400, 0, 0.6)
    tone(320, 160, 0.18, 0.04, 'sine', 0.02)
  },
  /** The little elephant toy: a squeaky trumpet. */
  squeak: () => {
    tone(740, 1180, 0.14, 0.06, 'triangle')
    tone(1180, 880, 0.16, 0.05, 'triangle', 0.13)
  },
}

const honk = nanClip('drive-honk')
const tune = nanClip('drive-honk-tune')
const pass: Record<MoverKind, string> = {
  scooter: nanClip('drive-scooter'),
  tuktuk: nanClip('drive-tuktuk'),
  songthaew: nanClip('drive-songthaew'),
  car: nanClip('drive-car'),
}

export const roadSfx = {
  ...synth,
  /** One beat of the Pajero's engine (`level` 0..1): a loop whose pitch climbs with the speed, quiet when it stops. */
  engine: held(nanClip('drive-engine'), sfx.engine, (level: number) => ({ rate: 0.85 + level * 1.4, vol: 0.45 + level }), { linger: 0.6 }),
  toot: (isTune: boolean, low = false) => {
    if (!playClip(isTune ? tune : honk, { vol: 0.7, rate: low ? 0.84 : 1 })) synth.toot(isTune, low)
  },
  /** Something on the other side of the road going by her (no synth: they used to pass in silence). */
  pass: (kind: MoverKind) => void playClip(pass[kind], { vol: 0.55, rate: 0.95 + Math.random() * 0.1 }),
  moo: clip(nanClip('drive-moo'), synth.moo, { vol: 0.8 }),
  cluck: clip(nanClip('drive-cluck'), synth.cluck, { vol: 0.6 }),
  chatter: clip(nanClip('drive-monkey'), sfx.chatter, { vol: 0.6 }),
  rail: clip(nanClip('drive-rail'), synth.rail, { vol: 0.7 }),
  patter: held(nanClip('drive-rain-roof'), synth.patter, () => ({ vol: 0.5 }), { linger: 1, fade: 1 }),
  cloudIn: clip(nanClip('drive-cloud-in'), synth.cloudIn, { vol: 0.6 }),
  screech: (k = 1) => {
    if (!playClip(nanClip('drive-screech'), { vol: 0.125 + 0.175 * k, rate: 0.95 + Math.random() * 0.15 })) synth.screech(k)
  },
  wiper: (dry = false) => {
    if (!playClip(nanClip(dry ? 'drive-wiper-dry' : 'drive-wiper'), { vol: 0.45 })) synth.wiper(dry)
  },
  hiss: held(nanClip('drive-wet-tyres'), synth.hiss, (k = 1) => ({ vol: 0.35 * k, rate: 0.9 + 0.2 * k }), { linger: 0.6 }),
  puddle: clip(nanClip('drive-puddle'), synth.puddle, { vol: 0.75 }),
  squeak: clip(nanClip('drive-squeak'), synth.squeak, { vol: 0.6 }),
}

/** The countryside outside the car (or Nan town's street on the city road), quiet under everything until stop(). */
export const roadBed = (town: boolean) => bed(nanClip(town ? 'drive-town' : 'drive-country'), 0.3)
