// The speedboat ride to Koh Samet's sounds: the outboards coughing into life and pulling away from Ban Phe pier, their
// roar (a loop whose pitch follows the boat's speed), the rush of water past her hoof, the hull thumping up off a wake
// (the splash down is common.ts), the flying fish, the boats coming the other way going by (the ferry's diesel, the
// longtail's rattly engine, the jet ski, the other speedboat) and their horns, the captain's horn, the bump against Na
// Dan pier, and the open sea. Recorded clips (sfx/, ElevenLabs) with the old synthesized ones (the world kit's
// tone/noise) as their fallbacks; the passing boats' engines had no sound before and have no fallback. The family's
// little boops when she pokes them and the fish's flip stay synthesized (voice-like and twinkly). (The voices are
// lines.ts L.samet.trip.boat.)
import { bed, clip, held, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametSfx } from '../sfx/common'
import { sametClip as c } from '../sfx'

export type PassKind = 'ferry' | 'longtail' | 'ski' | 'speed'

const synth = {
  /** The motors cough into life. */
  start: () => tone(90, 140, 0.6, 0.06, 'sawtooth'),
  /** Throttle up, and off they go. */
  throttle: () => tone(110, 260, 0.9, 0.05, 'sawtooth'),
  /** One beat of the motors' hum (v: speed, m/s), every half second. */
  engine: (v: number) => tone(70 + v * 6, 75 + v * 6, 0.5, 0.012, 'sawtooth'),
  /** Tied up at Na Dan: the bump against the pier. */
  dock: () => {
    sametSfx.thump()
    tone(300, 220, 0.2, 0.05, 'triangle')
  },
  /** Up off a wake. */
  bump: () => tone(520, 880, 0.18, 0.05, 'sine'),
  /** Her hoof in the water (dip 0..1): the hiss of spray. */
  hoof: (dip: number) => hiss(0.32, 0.025 + dip * 0.02, 'highpass', 2600, 1800),
  /** A flying fish skips out of her spray. */
  fish: () => tone(900, 1400, 0.12, 0.03, 'sine'),
  /** Tapped a fish: it flips. */
  flip: () => tone(1200, 1800, 0.15, 0.04, 'sine'),
  /** The family when she pokes them. */
  boopKaylee: () => tone(600, 1100, 0.25, 0.05, 'triangle'),
  boopNick: () => tone(400, 700, 0.2, 0.04, 'triangle'),
  boopJi: () => tone(700, 900, 0.2, 0.04, 'sine'),
  /** The captain's horn: two notes. */
  horn: () => {
    tone(330, 330, 0.35, 0.07, 'square')
    tone(415, 415, 0.35, 0.05, 'square', 0.4)
  },
  /** A boat going the other way toots back (the ferry lower). */
  toot: (ferry: boolean) => tone(ferry ? 220 : 360, ferry ? 220 : 360, 0.4, 0.06, 'square'),
}

const horns: Record<PassKind, [string, number]> = {
  ferry: [c('speedboat-ferry-horn'), 1],
  longtail: [c('speedboat-horn'), 1.2],
  ski: [c('jetski-horn'), 1],
  speed: [c('speedboat-horn'), 1.08],
}
const pass: Record<PassKind, string> = {
  ferry: c('speedboat-pass-ferry'),
  longtail: c('speedboat-pass-longtail'),
  ski: c('speedboat-pass-ski'),
  speed: c('speedboat-pass-speed'),
}

export const boatSfx = {
  ...sametSfx,
  ...synth,
  start: clip(c('speedboat-start'), synth.start, { vol: 0.7 }),
  throttle: clip(c('speedboat-throttle'), synth.throttle, { vol: 0.75 }),
  /** The outboards' roar (v: speed, m/s, top 17), called on the half-second beat: the loop climbs with the speed. */
  engine: held(c('speedboat-engine'), synth.engine, (v: number) => ({ rate: 0.8 + v * 0.035, vol: 0.35 + v * 0.025 }), { linger: 0.8, fade: 0.6 }),
  /** The rush of water past her hoof (dip 0..1), on its beat: a loop as loud as she's dipping. */
  hoof: held(c('speedboat-hoof'), synth.hoof, (dip: number) => ({ vol: 0.25 + dip * 0.45 }), { linger: 0.8, fade: 0.3 }),
  bump: clip(c('speedboat-bump'), synth.bump, { vol: 0.65 }),
  fish: clip(c('jetski-fish'), synth.fish, { vol: 0.45, jitter: 0.1 }),
  dock: clip(c('speedboat-dock'), synth.dock, { vol: 0.75 }),
  horn: clip(c('speedboat-horn'), synth.horn, { vol: 0.6 }),
  toot: (kind: PassKind) => {
    const [url, rate] = horns[kind]
    if (!playClip(url, { vol: 0.6, rate })) synth.toot(kind === 'ferry')
  },
  /** A boat going by her, a couple of seconds before it's alongside (no synth: they used to pass in silence). */
  pass: (kind: PassKind) => void playClip(pass[kind], { vol: 0.6, rate: 0.96 + Math.random() * 0.08 }),
}

/** Out on the open sea: the wind, the water slapping the hull, a gull now and then, until stop(). */
export const seaBed = () => bed(c('speedboat-sea'), 0.3)
