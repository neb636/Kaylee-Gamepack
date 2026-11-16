// Emperor Huddle's sounds: recorded clips from the Poles' sfx folder (sfx.json) over synth fallbacks (kit/clips.ts).
// Most are the ones the films, the slide and the finale already use (the night wind, the blizzard, a gust, the
// colony's honks, a chick's peep); the egg's crack, a cold dad's chatter and his sneeze are this game's own (their
// prompts are in sfx.json; until they're made the synth plays). The dads' songs are always synthesized
// (party/sounds.ts `sing`): each papa's tune is his own.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

export const huddleSfx = {
  /** Her finger lifts a penguin (a soft squish). */
  grab: clip(url('floe-grab'), () => sounds.pickup()),
  /** Put down on the snow. */
  place: clip(url('slide-thump'), () => sounds.place()),
  /** A puff of snow (a poke, snow shaken off his back). */
  snow: clip(url('party-snow'), () => noise(0.25, 0.07, 'highpass', 1800, 3200)),
  /** Warm again: a happy little chime. */
  warm: clip(url('floe-twinkle'), () => tone(520, 700, 0.12, 0.06, 'triangle')),
  /** A dad dropped on top of another pops him out like a cork. */
  cork: clip(url('narwhal-jump'), () => (sounds.pop(), sfx.boing())),
  /** He lands from the pop. */
  land: clip(url('story-thump'), () => sfx.thump()),
  /** The huddle shuffles round (new dads join, the wind turns). */
  shuffle: clip(url('party-shuffle'), () => [0, 0.08, 0.16, 0.24].forEach((d) => noise(0.06, 0.05, 'highpass', 2400, 2400, d))),
  /** A gust of wind. */
  gust: clip(url('party-gust'), () => noise(1.2, 0.16, 'bandpass', 600, 1800, 0, 0.7)),
  /** A cold dad's teeth-chattering shiver. */
  brrr: clip(url('huddle-brrr'), () => tone(300, 270, 0.3, 0.025, 'square'), { vol: 0.7 }),
  /** Frozen too long: a sneeze (a snowball pops off his beak). */
  sneeze: clip(url('huddle-sneeze'), () => (tone(900, 1300, 0.12, 0.06, 'triangle'), noise(0.25, 0.14, 'bandpass', 1800, 700, 0.18, 1.5))),
  /** Pebble's egg cracks a little more. */
  crack: clip(url('huddle-crack'), () => sfx.crack()),
  /** Pebble pops out of the egg. */
  hatch: clip(url('party-peek'), () => sfx.pop()),
  /** Pebble's peeps (a tap; tucked back in). */
  peep: clip(url('floe-peep'), () => sfx.chirp()),
  /** Pebble, blown off Papa's feet: a surprised cheep. */
  squeak: clip(url('floe-squeak'), () => sfx.chirp()),
  /** Tucked back in under Papa. */
  tuck: clip(url('slide-reveal'), () => sfx.fwip()),
  /** The seal pops up in its breathing hole and sings. */
  seal: clip(url('slide-weddell'), () => tone(1400, 500, 0.6, 0.05, 'sine')),
  sealPop: clip(url('floe-pop'), () => sfx.pop()),
  /** The southern lights shimmer. */
  lights: clip(url('hub-lights'), () => (tone(660, 990, 0.5, 0.04, 'sine'), tone(880, 1320, 0.5, 0.03, 'sine', 0.12))),
  /** The moon twinkles. */
  moon: clip(url('story-chime'), () => sounds.sparkle()),
  /** Something new (a stretch begins, the egg starts to wobble). */
  chime: clip(url('floe-stage'), () => sounds.sparkle()),
  /** Everyone cheers: Pebble is warm with Papa and knows his song. */
  cheer: clip(url('party-cheer'), () => sounds.fanfare()),
  /** The long night's wind over the ice, until stopped. */
  night: () => bed(url('story-wind-night'), 0.3),
  /** The blizzard's hiss on top of it, until stopped. */
  blizzard: () => bed(url('party-blizzard'), 0.28),
}
