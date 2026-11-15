// Ice Floe Hop's sounds: recorded clips from the Poles' sfx folder (listed in sfx/parts/floe.json) over synth fallbacks
// (kit/clips.ts), and the sea ice's wind-and-water bed. Until a clip is made, its fallback plays.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

export const floeSfx = {
  /** She grabs Pola. */
  grab: clip(url('floe-grab'), () => sounds.pickup()),
  /** Pola springs off the ice. */
  leap: clip(url('floe-leap'), () => sfx.boing()),
  /** Paws thump down on the ice. */
  land: clip(url('floe-land'), () => sfx.thump()),
  /** A belly-flop into the sea. */
  splash: clip(url('floe-splash'), () => sfx.splash()),
  /** A little splash (a poke at the water, a paddle). */
  plip: clip(url('floe-plip'), () => sfx.splash(), { vol: 0.7 }),
  /** Pola scrambles out onto the ice. */
  climb: clip(url('floe-climb'), () => sfx.boing()),
  /** She shakes the water off. */
  shake: clip(url('floe-shake'), () => sfx.splash()),
  /** Sliding down a tipped floe. */
  slide: clip(url('floe-slide'), () => sfx.fwip()),
  /** A poke at the ice: a hollow knock. */
  knock: clip(url('floe-knock'), () => sfx.thump()),
  /** Little bits of ice clink together. */
  clink: clip(url('floe-clink'), () => [0, 0.06].forEach((d) => tone(2100 + d * 4000, 2600, 0.07, 0.07, 'triangle', d))),
  /** A floe pushed over the water. */
  push: clip(url('floe-push'), () => noise(0.3, 0.06, 'lowpass', 500, 300)),
  /** Pebble squeaks as Pola crouches (he holds on tight). */
  squeak: clip(url('floe-squeak'), () => tone(1700, 2300, 0.09, 0.07, 'triangle')),
  /** Pebble's happy peep (a landing, a tickle). */
  peep: clip(url('floe-peep'), () => sfx.chirp()),
  /** Something pops up out of the water or a hole. */
  pop: clip(url('floe-pop'), () => sfx.pop()),
  /** The ringed seal's bark. */
  seal: clip(url('floe-seal'), () => [0, 0.16].forEach((d) => tone(420, 300, 0.11, 0.1, 'sawtooth', d))),
  /** The snowy owl's hoot. */
  owl: clip(url('floe-owl'), () => [0, 0.3].forEach((d) => tone(360, 330, 0.22, 0.1, 'sine', d))),
  /** The walrus snorts and blows. */
  walrus: clip(url('floe-walrus'), () => (tone(120, 80, 0.4, 0.14, 'sawtooth'), noise(0.35, 0.1, 'lowpass', 700, 300, 0.1))),
  /** A whale's blow: a puff of spray. */
  blow: clip(url('floe-blow'), () => noise(0.5, 0.1, 'bandpass', 900, 2400, 0, 1.2)),
  /** The belugas sing: chirps and whistles. */
  beluga: clip(url('floe-beluga'), () => [0, 0.14, 0.3].forEach((d, i) => tone(900 + i * 300, 1500 + i * 200, 0.12, 0.08, 'sine', d))),
  /** The seal pup's little "maa". */
  pup: clip(url('floe-pup'), () => tone(520, 430, 0.3, 0.09, 'triangle')),
  /** The puffin's funny growl. */
  puffin: clip(url('floe-puffin'), () => tone(210, 150, 0.4, 0.09, 'sawtooth')),
  /** Terry the tern's call. */
  tern: clip(url('floe-tern'), () => [0, 0.13].forEach((d) => tone(2300, 1500, 0.1, 0.08, 'square', d))),
  /** An iceberg twinkles. */
  twinkle: clip(url('floe-twinkle'), () => sounds.sparkle()),
  /** A new kind of ice begins. */
  stage: clip(url('floe-stage'), () => sounds.sparkle()),
  /** Home on Mama's ice. */
  home: clip(url('floe-home'), () => sounds.fanfare()),
  /** The wind and the water lapping at the ice, until the returned stop(). */
  bed: () => bed(url('floe-bed'), 0.24),
}
