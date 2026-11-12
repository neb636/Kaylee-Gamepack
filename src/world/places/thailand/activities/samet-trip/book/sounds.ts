// The photo book's animals and the beach clean (creatures.ts, clean.ts): the monitor lizard's soft hiss, the mouse
// deer's squeak, the macaques' and the squirrel's chatter, the hermit crab's claws, the hornbill's kok-kok and the
// heron's croak with their wings flapping up, the flying fox's squeaks, the reef's bubbly bloops, and the rubbish
// plonked into the green bin and its lid flapping. Recorded clips (../sfx, ElevenLabs) with the synthesized ones (the
// world kit's tone/noise) as their fallbacks. The bin's little sparkle up after the plonk, the lift as she picks a bit
// up, and the boing stay synthesized (tuned, toy blips). The book's own buttons (Book.tsx) use the shared `sametSfx`.
import { clip, playClip } from '../../../../../kit/clips'
import { noise as hiss, tone } from '../../../../../kit/sfx'
import { sametClip as c } from '../sfx'

const synth = {
  chatter: () => [0, 0.07, 0.14, 0.21].forEach((d) => tone(2400, 2900, 0.05, 0.03, 'square', d)),
  squeak: () => tone(2600, 3400, 0.12, 0.03, 'triangle'),
  flap: () => [0, 0.14, 0.28].forEach((d) => hiss(0.08, 0.05, 'bandpass', 700, 400, d)),
  kok: () => [0, 0.18].forEach((d) => tone(520, 380, 0.12, 0.06, 'square', d)),
  croak: () => tone(240, 160, 0.25, 0.06, 'sawtooth'),
  hiss: () => hiss(0.35, 0.05, 'highpass', 3000, 2400),
  monkey: () => [0, 0.09, 0.2].forEach((d, i) => tone(900 + i * 200, 1400 + i * 150, 0.08, 0.04, 'triangle', d)),
  click: () => [0, 0.05, 0.1].forEach((d) => tone(3200, 3000, 0.03, 0.025, 'square', d)),
  bloop: () => tone(300, 900, 0.18, 0.04, 'sine'),
  boing: () => tone(260, 640, 0.2, 0.05, 'triangle'),
  /** A bit of rubbish into the bin: plonk (and a little sparkle up). */
  plonkThud: () => tone(180, 90, 0.18, 0.12, 'sine'),
  plonkSparkle: () => tone(900, 1800, 0.25, 0.04, 'triangle', 0.08),
  /** Picked up off the sand. */
  lift: () => tone(500, 900, 0.15, 0.05, 'triangle'),
  /** A bin's lid flapping when she pokes it. */
  lid: () => tone(300, 200, 0.1, 0.06, 'square'),
}

/** The animals' sounds (creatures.ts `SOUND`). Who makes which: see each class there. */
export const wildSfx = {
  /** The monitor lizard (scared or poked). */
  hiss: clip(c('book-monitor'), synth.hiss, { vol: 0.45, jitter: 0.08 }),
  /** The mouse deer and the flying fox (the mouse deer's is the clip; the bat's has its own). */
  squeak: clip(c('book-mousedeer'), synth.squeak, { vol: 0.5, jitter: 0.1 }),
  batSqueak: clip(c('book-flyingfox'), synth.squeak, { vol: 0.45, jitter: 0.1 }),
  monkey: clip(c('book-macaque'), synth.monkey, { vol: 0.55, jitter: 0.1 }),
  chatter: clip(c('book-squirrel'), synth.chatter, { vol: 0.5, jitter: 0.1 }),
  /** The hermit crab's claws (the island's crabs share it). */
  click: clip(c('island-crab'), synth.click, { vol: 0.55, jitter: 0.12 }),
  kok: clip(c('book-hornbill'), synth.kok, { vol: 0.55 }),
  croak: clip(c('book-heron'), synth.croak, { vol: 0.55 }),
  flap: clip(c('book-flap'), synth.flap, { vol: 0.5, jitter: 0.1 }),
  /** The reef (parrotfish, damsels, cuttlefish, the urchins and the coral). */
  bloop: clip(c('book-bloop'), synth.bloop, { vol: 0.45, jitter: 0.15 }),
  boing: synth.boing,
}

/** The beach clean's sounds (clean.ts, and the bins' lids in island.ts). */
export const cleanSfx = {
  plonk: () => {
    if (!playClip(c('book-plonk'), { vol: 0.75, rate: 0.95 + Math.random() * 0.1 })) synth.plonkThud()
    synth.plonkSparkle()
  },
  lift: synth.lift,
  lid: clip(c('book-lid'), synth.lid, { vol: 0.55, jitter: 0.08 }),
}
