// The Canada map's sounds: recorded clips (sfx/parts/hub.json) over synth fallbacks (kit/clips.ts), plus the films'
// shared ones (the honk, the splash, the chime, the burner, the loon: story/sounds.ts). A soft wind bed under it all.
import { sounds } from '../../../../sdk'
import { bed, clip } from '../../../kit/clips'
import { noise, sfx, tone } from '../../../kit/sfx'
import { url } from '../sfx'
import { storySfx } from '../story/sounds'

export const hubSfx = {
  hop: clip(url('hub-hop'), () => sfx.boing()),
  zoom: clip(url('hub-zoom'), () => sounds.whoosh()),
  munch: clip(url('hub-munch'), () => [0, 0.28, 0.56].forEach((d) => noise(0.12, 0.07, 'lowpass', 700, 400, d))),
  spout: clip(url('hub-spout'), () => noise(0.9, 0.08, 'highpass', 1200, 2600, 0, 0.5)),
  crackle: clip(url('hub-crackle'), () => [0, 0.09, 0.2, 0.33, 0.5].forEach((d) => noise(0.04, 0.06, 'highpass', 2500, 2000, d))),
  hoot: clip(url('hub-hoot'), () => [0, 0.42].forEach((d) => tone(430, 380, 0.3, 0.07, 'sine', d))),
  bison: clip(url('hub-bison'), () => (sfx.thump(), noise(0.6, 0.06, 'bandpass', 500, 300, 0.15))),
  beluga: clip(url('hub-beluga'), () => [0, 0.16, 0.3].forEach((d, i) => tone(1300 + i * 250, 1900 + i * 200, 0.1, 0.05, 'sine', d))),
  orca: clip(url('hub-orca'), () => sfx.splash()),
  puff: clip(url('hub-puff'), () => sfx.fwip()),
  ice: clip(url('hub-ice'), () => tone(900, 700, 0.08, 0.06, 'triangle')),
  arrive: clip(url('hub-arrive'), () => sounds.sparkle()),
  glow: clip(url('hub-glow'), () => sounds.sparkle()),
  honk: storySfx.honk,
  honks: storySfx.honks,
  splash: storySfx.splash,
  chime: storySfx.chime,
  burner: storySfx.burner,
  loon: storySfx.loon,
  pop: storySfx.pop,
  /** The skate hut: its door creaks open (she tapped it); Gus gulps (a whole team!). */
  door: clip(url('hub-hut-door'), () => (noise(0.5, 0.05, 'bandpass', 700, 380), tone(1500, 1500, 0.25, 0.04, 'sine', 0.35))),
  gulp: clip(url('hub-gus-gulp'), () => tone(320, 140, 0.18, 0.1, 'sine')),
  /** The breeze under the map, until the map goes. */
  wind: () => bed(url('hub-wind'), 0.18),
}

/** The friends' moves at the rink (moves.ts): one sound for each thing that happens in them. */
export const moveSfx = {
  /** Tuque tosses the puck up; it boings off his tummy; it clacks down on the ice. */
  toss: clip(url('hub-move-toss'), () => sfx.fwip()),
  boing: clip(url('hub-move-boing'), () => sfx.boing()),
  clack: clip(url('hub-move-clack'), () => tone(1200, 700, 0.06, 0.08, 'triangle')),
  /** Monty freezes like a statue; two geese flap in, perch on his antlers and bump bills. */
  statue: clip(url('hub-move-statue'), () => (tone(260, 200, 0.12, 0.08, 'triangle'), sounds.sparkle())),
  flap: clip(url('hub-move-flap'), () => [0, 0.12, 0.24, 0.36].forEach((d) => noise(0.07, 0.05, 'lowpass', 1100, 700, d))),
  bonk: storySfx.bonk,
  honk: storySfx.honk,
  /** Roxy leaps over the boards; her paw whisks the puck. */
  swish: clip(url('hub-move-swish'), () => sounds.whoosh()),
  snatch: clip(url('hub-move-snatch'), () => (noise(0.12, 0.06, 'highpass', 3000, 5000), sfx.pop())),
  pop: storySfx.pop,
  /** Lulu sings: her own long call over the ice. */
  song: storySfx.loon,
  /** Misty's slap shot; the pinecone lands on the ice. */
  slap: clip(url('hub-move-slap'), () => (tone(900, 250, 0.08, 0.16, 'square'), sounds.whoosh())),
  cone: clip(url('hub-move-cone'), () => tone(700, 500, 0.06, 0.08, 'triangle')),
  /** Ollie's rock lands in a paw; she spins; she passes it. */
  pat: clip(url('hub-move-pat'), () => noise(0.06, 0.06, 'lowpass', 800, 500)),
  spin: clip(url('hub-move-spin'), () => tone(500, 1100, 0.4, 0.05, 'sine')),
  pass: clip(url('hub-move-pass'), () => sounds.whoosh()),
}
