// The mushroom farm's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): the hose's hiss, the mushrooms popping out and swelling, the twist and pop of a pick, the basket, the
// pizza's plops, the oven, and the pokes' answers.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

export const shroomSfx = {
  ...sfx,
  /** The misting hose: a soft hiss (played over and over while she holds it). */
  hiss: () => noise(0.24, 0.03, 'highpass', 3600, 5200, 0, 0.6),
  /** A pin mushroom popping out of a bag's mouth: a tiny wet bloop, higher for each one in a row. */
  bloop: (k = 0) => {
    const f = 380 * Math.pow(2, Math.min(k, 12) / 12)
    tone(f, f * 2.2, 0.09, 0.09, 'sine')
    tone(f * 2, f * 3, 0.06, 0.03, 'triangle', 0.04)
  },
  /** A mushroom swelling to full size: a soft rising whoomp. */
  swell: () => {
    tone(200, 420, 0.22, 0.06, 'sine')
    noise(0.16, 0.025, 'lowpass', 600, 1200)
  },
  /** Every bag grown: a little run of bells. */
  allGrown: () => [0, 1, 2, 3, 4].forEach((i) => tone(660 * Math.pow(2, i / 5), 660 * Math.pow(2, i / 5), 0.3, 0.05, 'sine', i * 0.09)),
  /** Pulling on a mushroom: a rubbery creak that climbs as she pulls. */
  pull: (k: number) => tone(300 + k * 260, 320 + k * 300, 0.07, 0.03, 'triangle'),
  /** Off it comes: a twisty pop. */
  twist: () => {
    noise(0.05, 0.08, 'bandpass', 2400, 1200, 0, 3)
    tone(320, 960, 0.1, 0.12, 'sine', 0.02)
    tone(960, 1500, 0.1, 0.05, 'triangle', 0.07)
  },
  /** Into the basket: a soft wicker thump, and a note that climbs with how full it is. */
  basket: (n: number) => {
    noise(0.08, 0.06, 'lowpass', 900, 300)
    const f = 523 * Math.pow(2, Math.min(n, 14) / 12)
    tone(f, f, 0.16, 0.05, 'triangle', 0.05)
  },
  /** The giant mushroom: a deep wobbly boing, higher for each bounce. */
  giant: (k = 0) => {
    const f = 110 + k * 30
    tone(f, f * 2.4, 0.42, 0.14, 'sine')
    tone(f * 1.5, f * 3, 0.3, 0.05, 'triangle', 0.04)
  },
  /** A drop from the roof landing: plink. */
  drip: () => {
    tone(1600, 2400, 0.06, 0.05, 'sine')
    tone(900, 700, 0.1, 0.03, 'sine', 0.05)
  },
  /** A mushroom landing on the pizza. */
  plopPizza: () => {
    noise(0.07, 0.05, 'lowpass', 800, 300)
    tone(340, 240, 0.08, 0.06, 'sine')
  },
  /** The oven: the wood fire crackling. */
  crackle: (dur = 2) => {
    for (let i = 0; i < dur * 9; i++) noise(0.03, 0.05 + Math.random() * 0.05, 'highpass', 2000 + Math.random() * 2500, 3000, i * 0.11 + Math.random() * 0.05, 1.5)
    noise(dur, 0.03, 'lowpass', 400, 250)
  },
  /** The pizza ready: a bright ding-ding. */
  ready: () => [0, 0.16].forEach((d, i) => tone(1046 + i * 262, 1046 + i * 262, 0.5, 0.06, 'sine', d)),
  /** The pizza's paddle sliding in or out. */
  slide: () => noise(0.35, 0.06, 'bandpass', 700, 1600, 0, 0.8),
  /** The farmer aunty laughing. */
  aunty: () => [0, 0.14, 0.28].forEach((d, i) => tone(520 - i * 20, 440 - i * 20, 0.11, 0.07, 'triangle', d)),
  /** The sleepy dog: a snore, or a sneeze and a shake when she's misted. */
  snore: () => {
    noise(0.7, 0.04, 'lowpass', 300, 600, 0, 1.5)
    tone(90, 120, 0.7, 0.05, 'sawtooth')
  },
  shake: () => [0, 0.07, 0.14, 0.21, 0.28].forEach((d) => noise(0.06, 0.05, 'bandpass', 1800, 2400, d, 1.5)),
}
