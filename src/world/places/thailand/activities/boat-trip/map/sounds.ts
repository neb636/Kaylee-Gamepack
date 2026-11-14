// The Krabi map's sounds (the voices are lines.ts: Dad's "Where to, Captain?" and Sparkle's hints): the songthaew's
// horn, its diesel pulling away and putting along, the Nan map's toy-board sounds (the zoom, the dive, the stamp, the
// tiny plane), and the boat trip's own recordings for the things she pokes (the longtails, the monkey, the sea eagle,
// the dolphins, the elephants, the crab), all over the sea lapping round the board. Every recorded clip keeps its
// synthesized fallback.
import { clip, held } from '../../../../../kit/clips'
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'
import { tripClip } from '../../../trip/sfx'
import { mapSfx as nanMap } from '../../nan-trip/map/sounds'
import { baySfx, openSfx, raceSfx, seaBed, wildlifeSfx } from '../sounds'

export const mapSfx = {
  ...nanMap,
  /** The songthaew's horn (tap it, or off it goes). */
  horn: clip(tripClip('krabi-horn'), sfx.toot, { vol: 0.7 }),
  pullaway: clip(tripClip('krabi-pullaway'), sfx.putt, { vol: 0.6 }),
  /** Its diesel while it drives along the board's roads, called every frame it moves. */
  putter: held(tripClip('krabi-engine'), nanMap.putter, () => ({ rate: 1.25, vol: 0.4 })),
  /** A longtail roaring off. */
  rev: baySfx.vroom,
  splash: baySfx.splash,
  /** The ferry's horn. */
  toot: raceSfx.toot,
  monkey: openSfx.chatter,
  eagle: openSfx.peep,
  crab: openSfx.pop,
  dolphin: wildlifeSfx.dolphin,
  trumpet: wildlifeSfx.trumpet,
  /** Chicken Island clucks. */
  cluck: () => [0, 0.13, 0.26].forEach((d, i) => tone(520 + i * 40, 360, 0.09, 0.08, 'square', d)),
  /** The lighthouse's lamp comes on: a soft rising glow. */
  glow: () => [0, 0.1, 0.2].forEach((d, i) => tone(660 * (1 + i * 0.25), 680 * (1 + i * 0.25), 0.3, 0.04, 'sine', d)),
  /** The waterfall on Khao Phanom Bencha. */
  splosh: () => noise(0.9, 0.06, 'bandpass', 1800, 900, 0, 1),
  /** The turtle dives. */
  plop: openSfx.plop,
  /** A beach poked: the umbrellas twirl. */
  twirl: sfx.whoosh,
}

/** The sea lapping round the board, until stop(). */
export const mapBed = () => seaBed(0.22)
