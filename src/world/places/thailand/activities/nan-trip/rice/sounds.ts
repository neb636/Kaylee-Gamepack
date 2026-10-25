// The rice farm's sounds, synthesized like the rest of Thailand's (the world kit's tone/noise). No voices yet (the
// greybox): Kaylee's sploosh in the water and her thud on the banks, the seedlings' plips (climbing a happy scale), a
// gate's creak and the water gushing in, the birds' cheeps and flutters, the sickle's swish, a bundle tied and thunked
// onto the rack, the thwack of the threshing and the grains, the steam off the sticky rice, the frogs, ducks and the buffalo, the chimes, and the pink milk on the deck.
import { noise, tone } from '../../../../../kit/sfx'
import { sfx } from '../../../sfx'

const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21]
const note = (base: number, k: number) => base * Math.pow(2, PENTA[k % PENTA.length] / 12) * (k >= PENTA.length ? 2 : 1)

export const riceSfx = {
  ...sfx,
  /** A hoof in the paddy's water. */
  sploosh: () => {
    noise(0.16, 0.05, 'bandpass', 900 + Math.random() * 500, 400, 0, 1.1)
    tone(380 + Math.random() * 80, 180, 0.08, 0.025, 'sine', 0.02)
  },
  /** A hoof on the grassy bank (soft) or the boardwalk's planks (a little knock). */
  step: (wood = false) => (wood ? tone(220 + Math.random() * 40, 160, 0.05, 0.05, 'triangle') : noise(0.06, 0.03, 'lowpass', 500, 300, 0, 1)),
  /** A hoof in the drained mud: squelch. */
  squelch: () => noise(0.14, 0.05, 'lowpass', 700, 260, 0, 3),
  /** A seedling pushed into the mud: plip, climbing the scale (each paddy starts a little higher). */
  plip: (k = 0) => {
    const f = note(620, k)
    tone(f, f * 0.62, 0.08, 0.06, 'sine')
    noise(0.04, 0.02, 'bandpass', 2400, 1600, 0, 2)
  },
  /** A paddy all planted: green! */
  planted: () => [0, 4, 7, 12].forEach((s, i) => tone(660 * Math.pow(2, s / 12), 660 * Math.pow(2, s / 12), 0.22, 0.05, 'triangle', i * 0.07)),
  /** A bright bell, higher for each one (a paddy full, a round done). */
  shine: (k: number) => {
    const f = note(523, k)
    tone(f, f, 0.5, 0.06, 'sine')
    tone(f * 2, f * 2, 0.3, 0.025, 'triangle', 0.03)
  },
  /** Every paddy done: a run of bells. */
  allDone: () => [0, 1, 2, 3, 4, 5, 6].forEach((i) => tone(note(523, i), note(523, i), 0.4, 0.05, 'sine', i * 0.09)),
  /** A wooden gate lifting in its slot. */
  gate: () => {
    tone(260, 190, 0.18, 0.05, 'sawtooth')
    tone(210, 150, 0.2, 0.04, 'sawtooth', 0.15)
  },
  /** The channel's water rushing through an open gate. */
  gush: () => {
    noise(1.4, 0.06, 'lowpass', 1400, 500, 0, 0.7)
    noise(0.9, 0.03, 'bandpass', 2600, 1200, 0.1, 1.2)
  },
  /** The water running out of the paddies at the end of the growing. */
  drain: () => noise(2.2, 0.05, 'lowpass', 900, 260, 0, 0.8),
  /** Wet seedlings springing up straight. */
  springUp: () => tone(300, 900, 0.14, 0.05, 'sine'),
  /** A munia: a tiny cheep. */
  cheep: () => [0, 0.09].forEach((d) => tone(4200 + Math.random() * 600, 3300, 0.05, 0.04, 'sine', d)),
  /** A bird flapping up. */
  flutter: () => [0, 0.05, 0.1, 0.15, 0.2].forEach((d) => noise(0.04, 0.05, 'bandpass', 1800 + Math.random() * 600, 2600, d, 2)),
  /** A fat bird's waddle-hop: boing! */
  waddle: () => tone(260, 520, 0.12, 0.06, 'sine'),
  /** The sickle through the rice. */
  swish: () => noise(0.14, 0.05, 'highpass', 2600, 5200, 0, 0.9),
  /** An armful tied into a bundle and popped onto the bank. */
  tie: () => {
    noise(0.12, 0.05, 'bandpass', 1800, 900, 0, 1.4)
    tone(500, 800, 0.12, 0.05, 'triangle', 0.08)
  },
  /** A bundle onto the drying rack. */
  thunk: () => {
    tone(150, 90, 0.12, 0.1, 'sine')
    noise(0.08, 0.05, 'lowpass', 900, 400, 0, 1)
  },
  /** Straw puffing up. */
  rustle: () => noise(0.35, 0.05, 'bandpass', 3000, 1800, 0, 0.8),
  /** A little cloud's rain on the farm. */
  rain: () => {
    for (let i = 0; i < 6; i++) noise(0.03, 0.02 + Math.random() * 0.02, 'highpass', 3000 + Math.random() * 3000, 3000, i * 0.04 + Math.random() * 0.02, 1)
  },
  /** A frog: rib-bit. */
  croak: () => [0, 0.14].forEach((d, i) => tone(i ? 260 : 200, i ? 170 : 150, 0.11, 0.08, 'square', d)),
  /** A duck: quack quack. */
  quack: () => [0, 0.2].forEach((d) => {
    tone(520, 380, 0.13, 0.06, 'sawtooth', d)
    noise(0.1, 0.03, 'bandpass', 1300, 900, d, 2)
  }),
  /** The water buffalo's long low moo. */
  moo: () => {
    tone(150, 110, 0.9, 0.12, 'sawtooth')
    tone(300, 220, 0.9, 0.03, 'triangle', 0.05)
  },
  /** A muddy splat. */
  splat: () => {
    noise(0.2, 0.08, 'lowpass', 600, 200, 0, 2)
    tone(180, 90, 0.12, 0.05, 'sine')
  },
  /** A wind chime (the hut's, the café's): a few soft bells. */
  windChime: () => [0, 1, 2, 3].forEach((i) => {
    const s = PENTA[Math.floor(Math.random() * 7)] + 12
    tone(880 * Math.pow(2, s / 12), 880 * Math.pow(2, s / 12), 0.9, 0.025, 'sine', i * 0.13 + Math.random() * 0.06)
  }),
  /** The scarecrow spinning, its hat flying up: a swoosh. */
  spin: () => noise(0.35, 0.05, 'bandpass', 900, 2600, 0, 1.5),
  /** The glass filled up again. */
  pourMilk: () => noise(0.6, 0.04, 'lowpass', 1200, 700, 0, 0.8),
  /** A happy "ahh" after Daddy's coffee. */
  ahh: () => tone(330, 260, 0.45, 0.06, 'triangle'),
  /** A bundle banged down on the threshing board: THWACK, and the grains rattling into the basket. */
  thwack: (k = 0) => {
    noise(0.07, 0.16, 'lowpass', 1600, 500, 0, 1.6)
    tone(170 + k * 6, 80, 0.14, 0.14, 'sine')
    for (let i = 0; i < 7; i++) noise(0.03, 0.025, 'highpass', 3500 + Math.random() * 2500, 3000, 0.05 + i * 0.035 + Math.random() * 0.02, 1)
  },
  /** The bundle swung up over her head. */
  swingUp: () => noise(0.2, 0.04, 'bandpass', 700, 1600, 0, 1.2),
  /** The threshed straw tossed onto the pile. */
  toss: () => noise(0.3, 0.05, 'bandpass', 1200, 2600, 0, 1.1),
  /** The steaming sticky rice: a soft hiss of steam. */
  steam: () => noise(0.9, 0.035, 'highpass', 3800, 2600, 0, 0.6),
  /** A ball of sticky rice: nom nom. */
  nom: () => [0, 0.16].forEach((d) => tone(300, 220, 0.09, 0.08, 'triangle', d)),
  /** Splash! Daddy got wet. */
  wet: () => {
    noise(0.3, 0.07, 'bandpass', 1400, 600, 0, 1)
    tone(500, 260, 0.2, 0.04, 'sine', 0.04)
  },
}
