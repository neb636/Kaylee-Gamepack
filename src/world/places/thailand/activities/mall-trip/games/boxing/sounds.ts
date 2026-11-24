// Muay Thai's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise): the punches (a note up the
// scale with each hit of a combo), the POW, Dad's big mitt swelling and popping, the coach's drum (the klong) and the
// little cymbal (the ching), the ring bell, the ropes; Dad's oof and laugh, Kaylee's giggle, the coach's babble between
// his words. The words are voices (lines.ts `L.mall.boxing`). Most of them are recorded clips now (ElevenLabs,
// ../../sfx/sfx.json, the `boxing-` ones) with the synth sound as the fallback; the note runs stay synthesized.
import { bed, clip, playClip } from '../../../../../../kit/clips'
import { noise, tone } from '../../../../../../kit/sfx'
import { sfx } from '../../../../sfx'
import { mallClip } from '../../sfx'

const SCALE = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760, 2093]
const note = (k: number) => SCALE[Math.max(0, Math.min(SCALE.length - 1, k))]

const synth = {
  ...sfx,
  /** A glove on the bag: a fat thud, a little bigger on a hook. */
  thud: (power = 1) => {
    noise(0.12, 0.16 * Math.min(1.4, power), 'lowpass', 520, 140)
    tone(120 + power * 10, 60, 0.16, 0.13, 'sine')
    tone(2500, 2300, 0.04, 0.012, 'square', 0.05)
  },
  /** A glove on the pad: a crisp pap! */
  pap: () => {
    noise(0.07, 0.18, 'bandpass', 1500, 900, 0, 1.2)
    tone(320, 180, 0.08, 0.08, 'triangle')
  },
  /** The glove going out: a little swish. */
  swish: () => noise(0.09, 0.05, 'bandpass', 1400, 2800, 0, 1.5),
  /** On the beat: a huge POW, a ding over it. */
  pow: () => {
    noise(0.22, 0.2, 'lowpass', 900, 160)
    tone(90, 45, 0.25, 0.16, 'sine')
    tone(1568, 1560, 0.6, 0.05, 'sine', 0.02)
    tone(2093, 2090, 0.45, 0.025, 'sine', 0.03)
  },
  /** The klong: a deep drum, dum (the first of each four a little lower and bigger). */
  drum: (accent = false) => {
    tone(accent ? 98 : 116, accent ? 58 : 70, 0.32, accent ? 0.17 : 0.13, 'sine')
    noise(0.1, accent ? 0.09 : 0.06, 'lowpass', 380, 120)
    tone(accent ? 196 : 232, accent ? 150 : 180, 0.08, 0.03, 'triangle')
  },
  /** The ching: two little cymbals, a soft ting between the beats. */
  ching: () => {
    tone(3520, 3500, 0.22, 0.012, 'sine')
    tone(4700, 4690, 0.16, 0.007, 'sine')
  },
  /** The ring bell: ding ding (n strikes). */
  bell: (n = 2) => {
    for (let i = 0; i < n; i++) {
      tone(1046, 1040, 0.9, 0.06, 'sine', i * 0.28)
      tone(2093, 2085, 0.6, 0.025, 'sine', i * 0.28 + 0.005)
      noise(0.03, 0.04, 'highpass', 4000, 4000, i * 0.28)
    }
  },
  /** A soft bell for the bow before the bout. */
  bow: (k = 0) => {
    tone(note(3 + k), note(3 + k), 1.1, 0.05, 'sine')
    tone(note(3 + k) * 2, note(3 + k) * 2, 0.7, 0.015, 'sine', 0.01)
  },
  /** A dance step on the mat: a light tap and a note up the scale. */
  step: (k = 0) => {
    noise(0.05, 0.05, 'lowpass', 700, 300)
    tone(note(5 + k), note(5 + k) * 1.01, 0.16, 0.05, 'triangle')
  },
  /** A hit in a combo: a note that climbs the scale with each one. */
  combo: (k: number) => tone(note(k), note(k) * 1.02, 0.14, 0.045, 'triangle'),
  /** Dad's big mitt swelling up before his swing: a slow rising whoop, `dur` seconds long. */
  whoop: (dur = 1.4) => {
    tone(180, 520, dur, 0.06, 'sine')
    tone(360, 1040, dur, 0.02, 'triangle')
  },
  /** She pops the big mitt: a bonk, then it deflates with a raspberry. */
  bonk: () => {
    tone(620, 240, 0.16, 0.14, 'square')
    noise(0.06, 0.16, 'bandpass', 1800, 900)
    noise(0.55, 0.07, 'bandpass', 900, 220, 0.12, 3)
    tone(260, 90, 0.5, 0.05, 'sawtooth', 0.12)
  },
  /** His pillow mitt bops her on the head: soft and squeaky. */
  bop: () => {
    noise(0.1, 0.1, 'lowpass', 500, 200)
    tone(520, 900, 0.09, 0.07, 'sine', 0.02)
    tone(900, 520, 0.1, 0.05, 'sine', 0.1)
  },
  /** Her gloves turn gold: the super punch is ready. */
  ready: () => [0, 0.07, 0.14, 0.21, 0.3].forEach((d, i) => tone(note(4 + i * 1.5 | 0), note(4 + i * 1.5 | 0), 0.3, 0.05, 'sine', d)),
  /** The super punch winding up: a long whoosh that climbs. */
  windUp: () => {
    noise(0.7, 0.1, 'bandpass', 300, 2600, 0, 1.2)
    tone(140, 620, 0.7, 0.06, 'sawtooth')
  },
  /** A tap pops him back up in the air. */
  juggle: (k: number) => {
    tone(260 + k * 60, 620 + k * 80, 0.16, 0.1, 'sine')
    noise(0.05, 0.08, 'bandpass', 1400, 1000)
  },
  /** He lands on his bottom: the whole ring jumps. */
  land: () => {
    noise(0.3, 0.24, 'lowpass', 500, 90)
    tone(80, 36, 0.4, 0.2, 'sine')
  },
  /** The ropes: a twang. */
  twang: () => {
    tone(196, 150, 0.45, 0.07, 'sawtooth')
    tone(392, 300, 0.3, 0.025, 'triangle', 0.01)
  },
  /** Dad staggering: oof. */
  oof: () => tone(280, 150, 0.2, 0.08, 'triangle'),
  /** The water bottle: a squirt, then drips. */
  squirt: () => {
    noise(0.25, 0.08, 'bandpass', 1200, 2600, 0, 2)
    ;[0.35, 0.5, 0.62].forEach((d, i) => tone(900 - i * 120, 500, 0.06, 0.04, 'sine', d))
  },
  /** The coach kicks the small bag: thwack. */
  thwack: () => {
    noise(0.1, 0.18, 'bandpass', 900, 300, 0, 1)
    tone(160, 70, 0.14, 0.12, 'sine')
  },
  /** The star board: a note up the scale. */
  note: (k: number) => tone(note(k), note(k) * 1.02, 0.18, 0.05, 'triangle'),
  /** A star onto the board. */
  star: () => [0, 0.08, 0.16, 0.26].forEach((d, i) => tone(note(3 + i * 2), note(3 + i * 2), 0.24, 0.05, 'triangle', d)),
  /** The big unicorn kick: a whoosh up, then a huge thump. */
  bigKick: () => {
    noise(0.3, 0.12, 'bandpass', 600, 2400, 0, 0.8)
    noise(0.25, 0.22, 'lowpass', 900, 150, 0.22)
    tone(110, 40, 0.3, 0.18, 'sine', 0.22)
  },
  /** The champion's belt: a fanfare up the scale. */
  fanfare: () => [0, 0.12, 0.24, 0.4, 0.52].forEach((d, i) => tone(note(2 + i * 2), note(2 + i * 2), i === 4 ? 0.6 : 0.2, 0.06, 'triangle', d)),
  /** The coach: a happy babble (no voice yet). */
  coach: () => sfx.babble(330),
}

const c = (id: string) => mallClip(`boxing-${id}`)
const bellClip = c('bell')
const juggleClip = c('juggle')

export const boxingSfx = {
  ...synth,
  thud: clip(c('thud'), synth.thud, { vol: 0.7, jitter: 0.1 }),
  pap: clip(c('pap'), synth.pap, { vol: 0.6, jitter: 0.1 }),
  swish: clip(c('swish'), synth.swish, { vol: 0.3, jitter: 0.12 }),
  pow: clip(c('pow'), synth.pow, { vol: 0.8 }),
  whoop: clip(c('whoop'), synth.whoop, { vol: 0.6 }),
  bonk: clip(c('bonk'), synth.bonk, { vol: 0.8 }),
  bop: clip(c('bop'), synth.bop, { vol: 0.7 }),
  ready: clip(c('ready'), synth.ready, { vol: 0.6 }),
  windUp: clip(c('windup'), synth.windUp, { vol: 0.6 }),
  bigKick: clip(c('kapow'), synth.bigKick, { vol: 0.9 }),
  twang: clip(c('twang'), synth.twang, { vol: 0.6, jitter: 0.08 }),
  land: clip(c('land'), synth.land, { vol: 0.8 }),
  drum: clip(c('drum'), synth.drum, { vol: 0.45, jitter: 0.03 }),
  ching: clip(c('ching'), synth.ching, { vol: 0.2 }),
  squirt: clip(c('squirt'), synth.squirt, { vol: 0.6 }),
  /** The ring bell: n strikes of the recorded one. */
  bell: (n = 2) => {
    let ok = true
    for (let i = 0; i < n && ok; i++) ok = playClip(bellClip, { vol: 0.6, delay: i * 0.3 })
    if (!ok) synth.bell(n)
  },
  /** A boing that climbs with each bounce. */
  juggle: (k: number) => {
    if (!playClip(juggleClip, { vol: 0.7, rate: 0.9 + k * 0.08 })) synth.juggle(k)
  },
}

/** The play hall around the ring, until stop(). */
export const hallBed = () => bed(mallClip('boxing-hall'), 0.22)
