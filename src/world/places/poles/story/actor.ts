// An actor in the Poles' story films (story/films.ts, docs/films.md): one of the friends on the chibi rig
// (characters/looks.ts) with what a film needs from them. They stand somewhere, waddle or hop to a mark, wave, pull a
// face (sad, wow, happy), ride on someone's back, and Terry flies. Their mouth moves with their own voice. A film
// tells them what to do in a beat's `start` or a cue; `update` plays it out. Everything is set each frame (never
// added to), so an action can be cut off by the next without leaving a limb behind.
import { FilmActor, type Face } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import { POLES_LOOKS, type PolesFriend } from '../characters/looks'

export type { Face }

/** Opens a penguin's beak by hand, 0 shut .. 1 wide (a song has no speech level, and in a crowd of dads who share
 *  Papa's voice only the one talking should move his). Call it after the actor's `update`, which shuts it. */
export function openBeak(a: Actor, k: number) {
  const r = a.rig
  if (r.beak) r.beak.open(k)
  else if (r.open) r.mouth.scale.set(1 + 0.15 * k, 1 + 0.9 * k, 1)
  else {
    const on = k > 0.04
    r.talk.visible = on
    r.mouth.visible = !on
    if (on) r.talk.scale.set(0.55 + 0.45 * k, Math.min(1, 0.25 + k), 1)
  }
}

/** One of the Poles' friends as a film actor (the shared engine3d/characters/actor.ts FilmActor, in their look). */
export class Actor extends FilmActor {
  /** `who`: whose look; `voice`: their speaker in cast.json (default: the same id; null for a silent extra). */
  constructor(readonly who: PolesFriend, bag: Bag, opts: { height?: number; voice?: string | null } = {}) {
    super(POLES_LOOKS[who], bag, { height: opts.height, voice: opts.voice === undefined ? who : opts.voice, flutter: who === 'terry' || who === 'pebble' || who === 'papa' || who === 'adelie' })
  }
}
