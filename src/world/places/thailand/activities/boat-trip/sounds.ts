// The boat trip's recorded sounds (sfx/, ElevenLabs) over their old synthesized ones (../../sfx.ts and the mall cafe's
// sounds), which stay the fallbacks (tests, slow downloads). Each part imports its own `xSfx as sfx`: the synth set
// with the recorded ones swapped in under the same names, so the triggers and timing are unchanged.
//
// Phang Nga Bay: the sea all round (a bed), the longtail's engine (a loop whose pitch follows the throttle), its revs,
// splashes and paddles, the tour boat's and the fishing boats' horns, the boat creaking at the pier, ribbons fluttering,
// the camera, buoys; the sea eagle, the macaques, the crab, the rubber duck, the fisherman's net, the flopping fish; Koh
// Panyee's stilt village (its own bed near it), the football, the whistle and the cheer, the cat, Grandma's broom; the
// sea cave (its own bed inside), its drips, bats, kingfisher; the sand at the Nail Island; the porpoise breathing.
// The race: the same engine and revs, boosts, dolphins, elephants. Baan Chang: the jungle (a bed), the elephants'
// trumpets, rumbles, munching, crunching, sniffs, slurps, sprays, steps and a burp, Khanom's squeals, the gecko, palms,
// old wood, birds, bamboo; the cafe (its own bed), ice, stirring, the milk pouring and the syrup squeezing (loops while
// she pours), the slurp through the straw.
// Kept synthesized: boings, boinks, pops, boops on toys, giggles and laughs (the characters have voices), the twinkly
// chimes for stickers and hoops, countdowns, the race's start lights, lap dings, banana slips and splats.
import { bed, clip, held, playClip } from '../../../../kit/clips'
import { cafeSfx } from '../mall-trip/games/cafe/sounds'
import { sfx } from '../../sfx'
import { tripClip } from '../../trip/sfx'
import { boatClip as c } from './sfx'

/** A splash whose size (`big`, about 0.25..1.4) sets its level and pitch. */
const splash = (url: string, fallback: (big?: number) => void, vol = 0.8) => (big = 1) => {
  if (!playClip(url, { vol: vol * Math.min(1.2, 0.35 + big * 0.6), rate: 1.15 - Math.min(1, big) * 0.25 + (Math.random() - 0.5) * 0.08 })) fallback(big)
}
const splashSfx = splash(c('bay-splash'), sfx.splash)
/** The longtail's (and the race boats') engine, called every beat: pitch and level follow `level` (0..1). */
const engine = () => held(c('bay-engine'), sfx.engine, (level: number) => ({ rate: 0.8 + 0.65 * level, vol: 0.3 + 0.5 * level }), { linger: 0.45 })
const shutter = clip(c('bay-shutter'), sfx.shutter, { vol: 0.8 })
const rev = clip(c('bay-rev'), sfx.vroom, { vol: 0.7 })
const whoosh = clip(c('bay-whoosh'), sfx.whoosh, { vol: 0.6 })
const thump = clip(c('bay-thump'), sfx.thump, { vol: 0.7 })
const toot = clip(c('bay-toot'), sfx.toot, { vol: 0.6 })
const flutter = clip(c('bay-flutter'), sfx.flap, { vol: 0.6 })
const paddle = clip(c('bay-paddle'), sfx.paddle, { vol: 0.6, jitter: 0.08 })
const monkey = clip(c('bay-monkey'), sfx.chatter, { vol: 0.6, jitter: 0.08 })
const plop = clip(c('bay-plop'), sfx.plop, { vol: 0.6, jitter: 0.1 })
const cheer = clip(c('village-cheer'), sfx.cheer, { vol: 0.7 })
const trumpet = clip(c('chang-trumpet'), sfx.trumpet, { vol: 0.6, jitter: 0.08 })
const dolphin = clip(c('race-dolphin'), sfx.dolphin, { vol: 0.6, jitter: 0.08 })

/** The bay's core (bay.ts): the boats and the sea. */
export const baySfx = {
  ...sfx,
  engine: engine(),
  vroom: rev,
  splash: splashSfx,
  paddle,
  horn: clip(c('bay-horn'), sfx.horn, { vol: 0.6 }),
  shutter,
  whoosh,
  thump,
  boop: clip(c('bay-buoy'), sfx.boop, { vol: 0.7 }),
}
export const seaBed = (vol = 0.3) => bed(c('bay-sea'), vol)

export const pierSfx = { ...sfx, flap: flutter, creak: clip(c('bay-creak'), sfx.creak, { vol: 0.6 }) }

export const openSfx = {
  ...sfx,
  splash: splashSfx,
  peep: clip(c('bay-eagle'), sfx.peep, { vol: 0.5 }),
  chatter: monkey,
  toot,
  pop: clip(c('bay-crab'), sfx.pop, { vol: 0.7 }),
  chirp: clip(c('bay-duck'), sfx.chirp, { vol: 0.6 }),
  whoosh,
  scoop: clip(c('bay-scoop'), sfx.scoop, { vol: 0.6 }),
  crunch: clip(c('bay-munch'), sfx.crunch, { vol: 0.5, jitter: 0.1 }),
  flop: clip(c('bay-flop'), sfx.flop, { vol: 0.6, jitter: 0.1 }),
  plop,
}

export const villageSfx = {
  ...sfx,
  cheer,
  mrrp: clip(c('village-cat'), sfx.mrrp, { vol: 0.6 }),
  flap: flutter,
  swish: clip(c('village-broom'), sfx.swish, { vol: 0.5, jitter: 0.08 }),
  kick: clip(c('village-kick'), sfx.kick, { vol: 0.7 }),
  whistle: clip(c('village-whistle'), sfx.whistle, { vol: 0.5, jitter: 0 }),
  thump,
  shutter,
  splash: splashSfx,
}
/** Koh Panyee's water and wind chimes: plays while it's called (every frame the boat is near the village). */
export const villageLife = held(c('village-life'), () => {}, () => ({ vol: 0.35 }), { linger: 0.3, fade: 1.2 })

export const caveSfx = {
  ...sfx,
  plop,
  peep: clip(c('cave-kingfisher'), sfx.peep, { vol: 0.5 }),
  flap: clip(c('cave-wings'), sfx.flap, { vol: 0.6 }),
  squeak: clip(c('cave-bats'), sfx.squeak, { vol: 0.5 }),
  plink: clip(c('cave-drip'), sfx.plink, { vol: 0.7, jitter: 0.08 }),
  paddle,
  shutter,
}
/** The sea cave's drips and echo: plays while it's called (every frame the boat is in the tunnel). */
export const caveInside = held(c('cave-inside'), () => {}, () => ({ vol: 0.45 }), { linger: 0.3, fade: 1.2 })

export const nailSfx = { ...sfx, splash: splashSfx, shutter, puff: clip(c('nail-sand'), sfx.puff, { vol: 0.6, jitter: 0.1 }) }
export const sunsetSfx = { ...sfx, blow: clip(c('sunset-blow'), sfx.blow, { vol: 0.7 }) }
export const gateSfx = { ...sfx, vroom: rev }

export const raceSfx = {
  ...sfx,
  engine: engine(),
  vroom: rev,
  splash: splashSfx,
  cheer,
  chatter: monkey,
  toot,
  zoom: clip(c('race-zoom'), sfx.zoom, { vol: 0.6 }),
  dolphin,
  shutter,
}
export const wildlifeSfx = { ...sfx, trumpet, dolphin, plop }

export const changSfx = {
  ...sfx,
  whoosh,
  shutter,
  trumpet,
  /** The songthaew's horn. */
  toot: clip(tripClip('krabi-horn'), sfx.toot, { vol: 0.7 }),
  tick: clip(c('chang-knock'), sfx.tick, { vol: 0.7 }),
  tukkae: clip(c('chang-gecko'), sfx.tukkae, { vol: 0.6 }),
  swish: clip(c('chang-rustle'), sfx.swish, { vol: 0.6 }),
  flop: clip(c('chang-step'), sfx.flop, { vol: 0.7 }),
  thump: clip(c('chang-step'), sfx.thump, { vol: 0.6, jitter: 0.08 }),
  creak: clip(c('chang-creak'), sfx.creak, { vol: 0.6 }),
  peep: clip(c('chang-bird'), sfx.peep, { vol: 0.5, jitter: 0.08 }),
  /** Khanom's trunk sneaks a sip. */
  slurp: clip(c('chang-slurp'), sfx.slurp, { vol: 0.6 }),
  /** Her own milk on the rail post, through the straw. */
  sip: clip(c('cafe-slurp'), sfx.slurp, { vol: 0.6 }),
  squeal: clip(c('chang-squeal'), sfx.squeal, { vol: 0.6, jitter: 0.08 }),
  rumble: clip(c('chang-rumble'), sfx.rumble, { vol: 0.7, jitter: 0.08 }),
  burp: clip(c('chang-burp'), sfx.burp, { vol: 0.7 }),
  sniff: clip(c('chang-sniff'), sfx.sniff, { vol: 0.6 }),
  splash: clip(c('chang-spray'), sfx.splash, { vol: 0.7 }),
  crunch: clip(c('chang-crunch'), sfx.crunch, { vol: 0.6, jitter: 0.08 }),
  munch: clip(c('chang-munch'), sfx.munch, { vol: 0.6, jitter: 0.08 }),
}
export const jungleBed = () => bed(c('chang-yard'), 0.3)
/** The cafe's clinks and coffee machine: plays while it's called (every frame she's at the cafe). */
export const cafeLife = held(c('cafe-life'), () => {}, () => ({ vol: 0.35 }), { linger: 0.3, fade: 1.2 })

export const changCafeSfx = {
  ...cafeSfx,
  /** An ice cube into the glass (plunk and clink in one). */
  plunk: clip(c('cafe-ice'), cafeSfx.plunk, { vol: 0.7, jitter: 0.08 }),
  clink: clip(c('cafe-stir'), cafeSfx.clink, { vol: 0.5, jitter: 0.08 }),
  /** The milk (or the syrup's stream) pouring, called every 0.14 s while it pours. */
  trickle: held(c('cafe-pour'), cafeSfx.trickle, () => ({ vol: 0.5 }), { linger: 0.3 }),
  /** The syrup bottle squeezing, called every 0.35 s while she squeezes. */
  squirt: held(c('cafe-squeeze'), cafeSfx.squirt, () => ({ vol: 0.5 }), { linger: 0.5 }),
  slurp: clip(c('cafe-slurp'), cafeSfx.slurp, { vol: 0.6 }),
}
