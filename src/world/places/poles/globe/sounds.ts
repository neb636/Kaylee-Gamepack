// The globe hub's sounds: recorded clips from the Poles' sfx folder (sfx/parts/hub.json lists them) over synth
// fallbacks (kit/clips.ts), and a soft wind bed while the globe is on screen.
import { sounds } from '../../../../sdk'
import { bed, clip } from '../../../kit/clips'
import { noise, sfx, tone } from '../../../kit/sfx'
import { url } from '../sfx'

export const hubSfx = {
  /** The red ship's horn: two friendly toots. */
  horn: clip(url('hub-horn'), () => [0, 0.45].forEach((d) => tone(196, 190, 0.34, 0.14, 'sawtooth', d))),
  /** A seal's bark. */
  seal: clip(url('hub-seal'), () => {
    tone(340, 220, 0.12, 0.08, 'square')
    tone(360, 230, 0.12, 0.07, 'square', 0.18)
  }),
  /** A whale's blow of spray. */
  spout: clip(url('hub-spout'), () => tone(900, 300, 0.4, 0.03, 'sawtooth')),
  /** The North Pole's marker: a little bell. */
  bell: clip(url('hub-bell'), () => {
    tone(1320, 1320, 0.5, 0.06, 'sine')
    tone(1760, 1760, 0.6, 0.04, 'sine', 0.08)
  }),
  /** The science station's door pops open. */
  door: clip(url('hub-door'), () => sfx.pop()),
  /** Terry's call as he loops. */
  tern: clip(url('hub-tern'), () => [0, 0.14].forEach((d) => tone(1500, 1900, 0.1, 0.06, 'triangle', d))),
  /** The balloon's burner: a soft puff of flame. */
  burner: clip(url('hub-burner'), () => noise(0.5, 0.1, 'lowpass', 500, 900)),
  /** A picture on the trail is picked: a happy pop, then the globe rolls there. */
  pick: clip(url('hub-pick'), () => sounds.pop()),
  /** The globe rolls round to a pole. */
  roll: clip(url('hub-roll'), () => sounds.whoosh()),
  /** Snowflakes burst from her finger. */
  snow: clip(url('hub-snow'), () => sounds.sparkle()),
  /** The polar lights flare. */
  lights: clip(url('hub-lights'), () => [0, 0.12, 0.24].forEach((d, i) => tone(660 * 1.25 ** i, 660 * 1.25 ** i, 0.5, 0.045, 'sine', d))),
  /** The wind over the ice, until the returned function is called. */
  wind: () => bed(url('hub-wind'), 0.16),
}
