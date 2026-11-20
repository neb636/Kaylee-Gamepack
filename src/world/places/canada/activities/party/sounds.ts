// The big game's own recorded sounds (sfx/parts/party.json, made by the lead with the `sfx` skill), each over a synth
// fallback (kit/clips.ts) until it's made. What the films already have (skates, a slap shot, the net, a boing, a bonk,
// honks, Lulu's call, a cheering crowd) is story/sounds.ts `storySfx`: the game plays those too, so the canal sounds
// the same in the films and on the ice.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

export const partySfx = {
  /** The puck thuds into a snowbank. */
  boards: clip(url('party-boards'), () => noise(0.12, 0.12, 'lowpass', 700, 200)),
  /** Roxy's kits squeaking and cheering on the snowbank. */
  kits: clip(url('party-kits'), () => [0, 0.12, 0.26].forEach((d, i) => tone(1300 + i * 220, 1700 + i * 200, 0.1, 0.05, 'triangle', d))),
  /** The goal horn: soft and friendly. */
  horn: clip(url('party-horn'), () => [0, 0.12, 0.24].forEach((d, i) => tone(392 + i * 131, 392 + i * 131, 0.5 - i * 0.1, 0.07, 'sawtooth', d))),
  /** Misty's huge slap shot: a crack and a boom. */
  bigSlap: clip(url('party-big-slap'), () => (tone(900, 200, 0.12, 0.16, 'square'), noise(0.5, 0.14, 'lowpass', 900, 120, 0.05))),
  /** The goose wall toppling over like bowling pins. */
  topple: clip(url('party-topple'), () => [0, 0.1, 0.22, 0.3].forEach((d) => (sfx.thump(), tone(500, 300, 0.12, 0.06, 'sawtooth', d)))),
  /** Ollie spinning across the ice on her back. */
  spin: clip(url('party-spin'), () => noise(0.7, 0.07, 'bandpass', 2400, 900)),
  /** A quick paw: the puck stolen in a blink. */
  steal: clip(url('party-steal'), () => sounds.whoosh()),
  /** Clang: a goose's shot off the goalpost. */
  post: clip(url('party-post'), () => tone(1400, 1300, 0.4, 0.08, 'triangle')),
  // ---- The films (story/films/game.ts).
  /** Golden syrup pouring out of the Cup onto the snow. */
  pour: clip(url('party-pour'), () => noise(1.2, 0.06, 'lowpass', 900, 500)),
  /** Everybody crunching their maple taffy. */
  crunch: clip(url('party-crunch'), () => sfx.munch()),
  /** The evening rink under the game, until `stop()`. */
  bed: (vol = 0.22) => bed(url('party-bed'), vol),
}
