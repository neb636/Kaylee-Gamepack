// Narwhal Ride's sounds: recorded clips from the Poles' sfx folder (sfx/parts/narwhal.json lists them) over synth
// fallbacks (kit/clips.ts), so every sound plays before its clip is made, while it downloads and in test browsers.
import { sounds } from '../../../../../sdk'
import { bed, clip, held } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

export const rideSfx = {
  /** She lands back in the water after a jump. */
  splash: clip(url('narwhal-splash'), () => sfx.splash()),
  /** Up off a ramp of ice. */
  jump: clip(url('narwhal-jump'), () => (sfx.boing(), sounds.whoosh())),
  /** A bump on a floe or an iceberg: a boing, never a crash. */
  bump: clip(url('narwhal-bump'), () => (sfx.boing(), sfx.thump())),
  /** A fish scooped up. */
  yum: clip(url('narwhal-yum'), () => sfx.chomp()),
  /** Down under the ice, and up out through the hole. */
  dive: clip(url('narwhal-dive'), () => (tone(520, 160, 0.5, 0.1, 'sine'), noise(0.5, 0.1, 'lowpass', 900, 300))),
  surface: clip(url('narwhal-surface'), () => (sfx.splash(), tone(260, 620, 0.3, 0.08, 'sine'))),
  /** Nari blows a spout. */
  spout: clip(url('narwhal-spout'), () => noise(0.45, 0.12, 'highpass', 1800, 4200, 0, 0.7)),
  /** The friends along the way. */
  walrus: clip(url('narwhal-walrus'), () => [0, 0.2, 0.4].forEach((d) => tone(150, 110, 0.16, 0.14, 'sawtooth', d))),
  beluga: clip(url('narwhal-beluga'), () => (tone(1300, 2100, 0.22, 0.07, 'sine'), tone(2100, 1500, 0.2, 0.07, 'sine', 0.22))),
  seal: clip(url('narwhal-seal'), () => [0, 0.22].forEach((d) => tone(330, 250, 0.16, 0.12, 'square', d))),
  orca: clip(url('narwhal-orca'), () => (noise(0.5, 0.12, 'highpass', 1500, 3600, 0, 0.7), tone(700, 1100, 0.3, 0.05, 'sine', 0.1))),
  puffin: clip(url('narwhal-puffin'), () => (noise(0.3, 0.07, 'bandpass', 900, 2200, 0, 2), tone(420, 320, 0.2, 0.07, 'sawtooth', 0.1))),
  tern: clip(url('narwhal-tern'), () => sfx.chirp()),
  /** Old air fizzing out of the ice. */
  fizz: clip(url('narwhal-fizz'), () => [0, 0.06, 0.13, 0.2, 0.3].forEach((d) => tone(900 + d * 2400, 1500 + d * 2400, 0.06, 0.05, 'sine', d))),
  /** The old blue iceberg glints. */
  glint: clip(url('narwhal-glint'), () => sounds.sparkle()),
  /** A poke on the water, and on the ice. */
  plip: clip(url('narwhal-plip'), () => sfx.pop()),
  tick: clip(url('narwhal-tick'), () => sfx.fwip()),
  /** The glacier cracks, then the new iceberg drops into the sea. */
  crack: clip(url('narwhal-crack'), () => (sfx.crack(), noise(0.5, 0.1, 'lowpass', 500, 200, 0.1))),
  calve: clip(url('narwhal-calve'), () => (noise(1.4, 0.2, 'lowpass', 320, 90), tone(90, 45, 1, 0.2, 'sine'), noise(0.9, 0.16, 'bandpass', 2000, 600, 0.5, 0.8))),
  /** The rolling wave lifts her. */
  wave: clip(url('narwhal-wave'), () => noise(0.9, 0.12, 'bandpass', 500, 1600, 0, 0.8)),
  /** At the balloon. */
  arrive: clip(url('narwhal-arrive'), () => sounds.fanfare()),
  /** The water rushing past as she swims (every frame; `speed` 0..1 and `turn` 0..1 shape it). */
  swim: held(
    url('narwhal-swim'),
    (_speed: number, _turn: number) => {},
    (speed, turn) => ({ rate: 0.85 + speed * 0.3, vol: 0.25 + speed * 0.35 + turn * 0.3 }),
  ),
  /** The hush under the sea ice (every frame while she's under). */
  under: held(url('narwhal-under'), () => {}, () => ({ vol: 0.7 }), { linger: 0.4, fade: 0.5 }),
  /** The Arctic sea all around: lapping water, a soft wind, far-off birds. Returns its stop. */
  sea: () => bed(url('narwhal-sea'), 0.24),
}
