// Campfire Night's recorded sounds (prompts: sfx/parts/campfire.json), for the game and its two films, each over the
// synth sound it replaces (night.ts) until the clip is made. The game's hunt for a sound plays night.ts's panned synths
// instead (a recorded clip can't come from one side yet: kit/clips.ts has no pan), so "who's that?" still points left
// or right. No React, no three.js.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { sfx } from '../../../../kit/sfx'
import { url } from '../../sfx'
import { night } from './night'

const FIRE = url('campfire-fire')

export const camp = {
  /** The owl's "hoo, hoo-hoo". */
  hoot: clip(url('campfire-owl'), (pan: number = 0, vol: number = 0.2) => night.hoot(pan, vol)),
  /** A spring peeper's two peeps. */
  peep: clip(url('campfire-frog'), (pan: number = 0) => night.peep(pan)),
  /** Leaves rustling in a bush. */
  rustle: clip(url('campfire-rustle'), (pan: number = 0) => night.rustle(pan)),
  /** A little paw snatching a marshmallow. */
  snatch: clip(url('campfire-snatch'), () => sounds.whoosh()),
  /** Roxy's chitter, a giggle. */
  chitter: clip(url('campfire-chitter'), (pan: number = 0) => night.squeak(pan)),
  /** Her three kits squeaking. */
  kits: clip(url('campfire-kits'), (pan: number = 0) => [0, 0.12, 0.26].forEach(() => night.squeak(pan))),
  /** A marshmallow sizzling over the flames (the game calls it often while it's hot: the clip a little less often). */
  sizzle: clip(url('campfire-sizzle'), (vol: number = 0.03) => night.sizzle(vol), { vol: 0.6 }),
  /** The tent zipper. */
  zip: clip(url('campfire-zip'), (pan: number = 0) => night.zip(pan)),
  /** Sparks whoosh up from the fire. */
  sparks: clip(url('campfire-sparks'), (vol: number = 0.14) => night.whoosh(vol)),
  /** Blowing a burning marshmallow out. */
  blow: clip(url('campfire-blow'), () => night.blow()),
  /** Somebody munching a marshmallow. */
  munch: clip(url('campfire-munch'), (pan: number = 0) => night.munch(pan)),
  /** A beaver's tail slapping the pond. */
  slap: clip(url('campfire-slap'), (pan: number = 0, vol: number = 0.3) => night.slap(pan, vol)),
  /** A hare's thump, thump-thump. */
  thump: clip(url('campfire-thump'), (pan: number = 0, vol: number = 0.32) => night.thump(pan, vol)),
  /** A splash in the lake. */
  splash: () => sfx.splash(),
  /** The campfire crackling under the crickets, until the returned stop(). */
  fireBed: (vol = 0.3) => bed(FIRE, vol),
  /** No recorded fire yet: the game crackles with the synth instead. */
  synthCrackle: !FIRE,
}
