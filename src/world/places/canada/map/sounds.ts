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
  /** The breeze under the map, until the map goes. */
  wind: () => bed(url('hub-wind'), 0.18),
}
