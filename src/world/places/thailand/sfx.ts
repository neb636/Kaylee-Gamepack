// Thailand's sounds, synthesized (no files): built on the world kit's tone/noise, so they share its audio context.
import { noise, sfx as kit, tone } from '../../kit/sfx'

export const sfx = {
  ...kit,
  /** A boing that climbs with each bounce on the mattress. */
  boingAt: (level: number) => {
    const f = 220 + level * 90
    tone(f, f * 2.6, 0.32, 0.16, 'sine')
    tone(f * 1.5, f * 3.4, 0.22, 0.05, 'triangle', 0.03)
  },
  /** The metal shutter rolling up. */
  rattle: () => {
    for (let i = 0; i < 9; i++) noise(0.06, 0.12, 'bandpass', 1800 + i * 120, 2400, i * 0.11, 3)
    tone(160, 260, 1.0, 0.05, 'sawtooth')
  },
  /** The aluminium bathroom door jiggling on its latch (it's locked). */
  jiggle: () => {
    for (let i = 0; i < 4; i++) noise(0.05, 0.1, 'bandpass', 2600 - i * 150, 3200, i * 0.09, 4)
    tone(220, 180, 0.08, 0.06, 'square', 0.02)
  },
  /** A soft temple bell: for the altar, the shrines and the spirit house. */
  ding: () => {
    tone(1318, 1310, 1.6, 0.07, 'sine')
    tone(2637, 2630, 1.1, 0.025, 'sine', 0.01)
  },
  beep: () => [0, 0.18].forEach((d) => tone(880, 860, 0.12, 0.08, 'square', d)),
  toot: () => [0, 0.2].forEach((d) => tone(392, 370, 0.16, 0.1, 'triangle', d)),
  meow: () => tone(620, 380, 0.45, 0.1, 'triangle'),
  tick: () => [0, 0.25, 0.5, 0.75].forEach((d, i) => tone(i % 2 ? 1700 : 2100, 1600, 0.04, 0.08, 'square', d)),
  whir: () => noise(1.2, 0.07, 'bandpass', 500, 1400, 0, 1.2),
  puff: () => noise(0.25, 0.1, 'lowpass', 700, 250),
  /** A scooter or a taxi going by on the street. */
  putt: () => {
    for (let i = 0; i < 6; i++) tone(95 + i * 4, 90, 0.06, 0.05, 'sawtooth', i * 0.08)
    noise(0.6, 0.03, 'lowpass', 600, 300)
  },
  /** The tokay gecko's call: a croaky "tuk" then a rising "kae", three times. */
  tukkae: () => {
    noise(0.12, 0.05, 'bandpass', 900, 600)
    for (let i = 0; i < 3; i++) {
      const d = 0.25 + i * 0.55
      tone(260, 200, 0.07, 0.09, 'square', d)
      tone(420, 560, 0.2, 0.08, 'sawtooth', d + 0.12)
    }
  },
  /** Thumbs tapping a phone screen (the big cousins' answer to everything). */
  phone: () => [0, 0.1, 0.17, 0.31].forEach((d, i) => tone(i === 3 ? 1560 : 2200, i === 3 ? 2080 : 2150, 0.035, 0.05, 'sine', d)),
  /** Someone in the family says hi, until they have real voices (gate 3): a happy little babble at their pitch. */
  babble: (pitch: number) => {
    const n = 3 + Math.floor(Math.random() * 2)
    for (let i = 0; i < n; i++) {
      const f = pitch * (1 + (Math.random() - 0.3) * 0.35)
      tone(f, f * (i === n - 1 ? 1.35 : 0.9), 0.11, 0.09, 'triangle', i * 0.13)
    }
  },
  // ---- The trip ----
  /** The suitcase's latch: click! */
  latch: () => {
    tone(2600, 1900, 0.035, 0.1, 'square')
    tone(1400, 1000, 0.05, 0.07, 'square', 0.05)
  },
  /** A whoosh going by (the skytrain, wind at the window). */
  whoosh: (dur = 0.9) => noise(dur, 0.08, 'bandpass', 400, 1800, 0, 0.8),
  /** Crunch crunch (Kaylee munching snacks). */
  crunch: () => [0, 0.16, 0.32].forEach((d) => noise(0.08, 0.1, 'highpass', 2500, 1800, d, 1)),
  /** The cabin's call button: ding. */
  callDing: () => {
    tone(1568, 1560, 0.5, 0.08, 'sine')
    tone(1175, 1170, 0.7, 0.06, 'sine', 0.18)
  },
  /** The stamp coming down on the boarding pass: ka-chunk. */
  stamp: () => {
    noise(0.08, 0.14, 'lowpass', 900, 300)
    tone(140, 70, 0.14, 0.12, 'square', 0.02)
  },
  /** A laugh with no words (the officer). */
  haha: () => [0, 0.17, 0.34].forEach((d, i) => tone(330 - i * 20, 260 - i * 20, 0.12, 0.08, 'triangle', d)),
  /** A dog's woof. */
  woof: () => [0, 0.22].forEach((d) => tone(240, 140, 0.12, 0.1, 'sawtooth', d)),
  /** A plane's engines (`level` 0..1): a hum, and a roar at takeoff. */
  jet: (level: number) => {
    noise(0.35, 0.02 + 0.07 * level, 'lowpass', 300 + 900 * level, 250 + 800 * level)
    tone(90 + 60 * level, 85 + 60 * level, 0.3, 0.015 + 0.02 * level, 'sawtooth')
  },
  /** A daddy's snore, then a snort. */
  snort: () => {
    noise(0.25, 0.12, 'lowpass', 500, 200)
    tone(160, 90, 0.2, 0.08, 'sawtooth', 0.05)
  },

  // ---- The boat trip ----
  /** One beat of the longtail's engine: a low putt-putt when slow, RRRAAAH when fast (`level` 0..1). */
  engine: (level: number) => {
    tone(70 + 70 * level, 60 + 50 * level, 0.07, 0.025 + 0.035 * level, 'sawtooth')
    if (level > 0.55) noise(0.06, 0.02 * level, 'bandpass', 900 + 600 * level, 700, 0, 2)
    // Flat out it roars: a buzzy rasp on top of the beat.
    if (level > 0.8) tone(190 + 90 * level, 170 + 80 * level, 0.08, 0.02 * level, 'square')
  },
  /** VROOM: the engine revs up. */
  vroom: () => {
    tone(90, 320, 0.6, 0.09, 'sawtooth')
    tone(140, 460, 0.5, 0.05, 'square', 0.05)
    noise(0.7, 0.06, 'bandpass', 600, 2400, 0, 1.5)
  },
  /** Landing in the water off a wake, or a big splash. */
  splash: (big = 1) => {
    noise(0.45 * big, 0.12 * big, 'lowpass', 2400, 300)
    tone(220, 90, 0.18, 0.05 * big, 'sine')
  },
  /** A paddle dipping in. */
  paddle: () => noise(0.18, 0.05, 'bandpass', 1400, 600, 0, 1.4),
  /** A unicorn horn bonking the cave roof. */
  boink: () => {
    tone(700, 1600, 0.12, 0.12, 'triangle')
    tone(320, 180, 0.2, 0.07, 'square', 0.02)
    noise(0.25, 0.05, 'highpass', 3000, 1500, 0.05)
  },
  /** A soft rubbery buoy bumping the boat back. */
  boop: () => tone(330, 520, 0.18, 0.1, 'sine'),
  /** The camera's click. */
  shutter: () => {
    noise(0.05, 0.15, 'highpass', 4000, 2500)
    noise(0.08, 0.1, 'bandpass', 1800, 1200, 0.07, 3)
  },
  /** The tour boat's big horn. */
  horn: () => [0, 0.45].forEach((d) => tone(196, 190, 0.38, 0.1, 'sawtooth', d)),

  // ---- The bay ----
  /** Kaylee's giggle (she never talks): a run of little bright hee-hees. */
  giggle: () => [0, 0.11, 0.22, 0.33].forEach((d, i) => tone(880 + i * 60, 1180 + i * 40, 0.08, 0.07, 'triangle', d)),
  /** A drip falling from a stalactite, and the cave answering it twice, softer each time. */
  plink: () => [0, 0.32, 0.64].forEach((d, i) => tone(1760, 1320, 0.16, 0.1 / (1 + i * 1.6), 'sine', d)),
  /** Bats squeaking as they swirl. */
  squeak: () => [0, 0.09, 0.2, 0.27].forEach((d, i) => tone(3200 + (i % 2) * 500, 4200, 0.05, 0.035, 'sine', d)),
  /** A macaque's chatter. */
  chatter: () => [0, 0.08, 0.16, 0.24, 0.36].forEach((d, i) => tone(900 + (i % 3) * 180, 650, 0.06, 0.06, 'square', d)),
  /** A foot kicking the ball. */
  kick: () => {
    noise(0.06, 0.16, 'lowpass', 900, 300)
    tone(180, 90, 0.08, 0.1, 'sine')
  },
  /** The village kids cheering. */
  cheer: () => {
    noise(1.1, 0.05, 'bandpass', 1600, 2200, 0, 0.7)
    for (let i = 0; i < 6; i++) tone(520 + Math.random() * 260, 760 + Math.random() * 300, 0.18, 0.035, 'triangle', i * 0.12)
  },
  /** The referee's whistle (the goal). */
  whistle: () => {
    tone(2600, 2700, 0.18, 0.06, 'sine')
    tone(2600, 2650, 0.5, 0.06, 'sine', 0.24)
  },
  /** Something scooped into the boat. */
  scoop: () => {
    noise(0.12, 0.06, 'bandpass', 1500, 900)
    tone(520, 780, 0.12, 0.07, 'triangle', 0.08)
  },
  /** Laundry or a ribbon flapping in the wind. */
  flap: () => [0, 0.12, 0.22].forEach((d) => noise(0.08, 0.06, 'bandpass', 1100, 1800, d, 1.5)),
  /** A porpoise's breath as it surfaces: pfff. */
  blow: () => noise(0.4, 0.09, 'bandpass', 1300, 700, 0, 0.9),
  /** A sticker for the album: a little sparkly chime. */
  chime: () => [0, 0.08, 0.16].forEach((d, i) => tone(1318 * [1, 1.25, 1.5][i], 1320 * [1, 1.25, 1.5][i], 0.25, 0.05, 'sine', d)),
  /** The countdown before the photo: beep, beep, bip! */
  countdown: () => [0, 0.32, 0.64].forEach((d, i) => tone(i === 2 ? 1400 : 980, i === 2 ? 1400 : 980, 0.09, 0.06, 'sine', d)),
  /** The boat tipping as Daddy steps in: whoa-oa-oa (the wood creaks). */
  creak: () => [0, 0.18].forEach((d) => tone(240, 170, 0.22, 0.05, 'sawtooth', d)),
  /** A fish flipping out of a net or the water. */
  flop: () => [0, 0.14].forEach((d) => noise(0.05, 0.08, 'bandpass', 2000, 1200, d, 2)),
  /** A cat's purr-meow as it stretches. */
  mrrp: () => {
    tone(420, 560, 0.12, 0.07, 'triangle')
    tone(560, 400, 0.3, 0.08, 'triangle', 0.1)
  },
  /** A swish of a broom (the grandma at her porch). */
  swish: () => [0, 0.25].forEach((d) => noise(0.18, 0.08, 'highpass', 1800, 3600, d, 0.8)),
  /** The kingfisher's sharp call. */
  peep: () => [0, 0.1, 0.2].forEach((d) => tone(3400, 3000, 0.05, 0.05, 'sine', d)),
  /** A plop into the water (a crab, a lizard, sunglasses). */
  plop: () => tone(520, 160, 0.12, 0.08, 'sine'),

  // ---- The boat race ----
  /** A countdown light: a low beep for three, two, one, a long high one for go. */
  light: (go: boolean) => tone(go ? 1320 : 660, go ? 1320 : 660, go ? 0.55 : 0.22, 0.09, 'square'),
  /** The item slot spinning round: tick. */
  roll: () => tone(1400 + Math.random() * 600, 1300, 0.03, 0.04, 'square'),
  /** An item lands in the slot. */
  item: () => [1, 1.26, 1.5].forEach((k, i) => tone(880 * k, 900 * k, 0.14, 0.06, 'triangle', i * 0.07)),
  /** A slide whistle going down: slipping on a banana peel. */
  slip: () => {
    tone(1400, 300, 0.6, 0.07, 'sine')
    noise(0.3, 0.05, 'bandpass', 900, 400)
  },
  /** Splat: a thrown banana landing on someone. */
  splat: () => {
    noise(0.18, 0.12, 'lowpass', 1200, 300)
    tone(300, 120, 0.15, 0.07, 'sine')
  },
  /** A trick in the air: a swirl up. */
  trick: () => [0, 1, 2, 3].forEach((i) => tone(600 + i * 200, 900 + i * 240, 0.1, 0.05, 'triangle', i * 0.06)),
  /** A boost pad or a mini-turbo: a rising whoosh. */
  zoom: () => {
    noise(0.5, 0.08, 'bandpass', 500, 2600, 0, 1.2)
    tone(220, 660, 0.4, 0.05, 'sawtooth')
  },
  /** An elephant trumpeting: a brassy note that swoops up and wobbles. */
  trumpet: () => {
    tone(330, 620, 0.22, 0.07, 'sawtooth')
    tone(620, 560, 0.4, 0.07, 'sawtooth', 0.2)
    tone(660, 600, 0.4, 0.04, 'square', 0.22)
    noise(0.3, 0.03, 'bandpass', 1200, 1800, 0.15)
  },
  /** A baby elephant's trumpet: higher, shorter, a little squeaky. */
  squeal: () => {
    tone(620, 1050, 0.16, 0.06, 'sawtooth')
    tone(1050, 920, 0.26, 0.05, 'square', 0.14)
  },
  /** A trunk snuffling after food. */
  sniff: () => [0, 0.11, 0.2].forEach((d) => noise(0.08, 0.06, 'bandpass', 2600, 1500, d, 2.2)),
  /** A big happy elephant rumble, deep in the belly. */
  rumble: () => {
    tone(62, 48, 0.7, 0.14, 'sawtooth')
    tone(93, 70, 0.6, 0.06, 'triangle', 0.05)
  },
  /** A trunk slurping up chocolate milk through a straw. */
  slurp: () => [0, 0.16, 0.3].forEach((d) => noise(0.12, 0.07, 'bandpass', 700, 1500, d, 3)),
  /** A baby elephant's hiccup. */
  hiccup: () => tone(700, 1250, 0.09, 0.08, 'square'),
  /** A big rumbly burp. */
  burp: () => {
    tone(120, 58, 0.55, 0.16, 'sawtooth')
    noise(0.45, 0.07, 'lowpass', 500, 160, 0.03)
  },
  /** A dolphin's chirp: quick whistles up and down. */
  dolphin: () => [0, 0.1, 0.19, 0.3].forEach((d, i) => tone(i % 2 ? 2600 : 1700, i % 2 ? 1500 : 2900, 0.09, 0.045, 'sine', d)),
  /** A new lap: ding-ding. */
  lap: () => [0, 0.18].forEach((d) => tone(1568, 1568, 0.3, 0.07, 'sine', d)),
  /** A firework going pop high up. */
  bang: () => {
    noise(0.35, 0.1, 'lowpass', 1600, 200)
    for (let i = 0; i < 5; i++) tone(2400 + Math.random() * 1200, 1800, 0.08, 0.02, 'sine', 0.1 + i * 0.05)
  },

  // ---- The mall trip ----
  /** HarborLand's ball cannon: a soft thoomp. */
  thoomp: () => {
    noise(0.25, 0.14, 'lowpass', 500, 120)
    tone(110, 55, 0.25, 0.12, 'sine')
  },
  /** A Phi Ta Khon figure's cowbells: a jangle. */
  jangle: () => [0, 0.07, 0.15, 0.24].forEach((d, i) => tone(1200 + (i % 2) * 340, 1150, 0.18, 0.05, 'square', d)),
}
