// Dressing the team in what she made (looks.ts): Misty in the look from her bubble bath, and everybody in what she
// put on them in the Team Cabin. One place, so the films' cast (story/cast.ts), the map (map/world.ts) and the big
// game (activities/party/) show the same friends: a rig friend is dressed when it is built (story/cast.ts Friend),
// a hand-built toy (Tuque, Lulu, a goose) by whoever builds it calling `dressToy`.
//
// STUBS until the builders fill them in (planning/around-the-world/canada-round-2.md): the bath's builder owns
// `dressMisty`, the cabin's builder owns `dressWorn` and `dressToy`. The signatures are the contract: keep them.
import type { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import type { MistyLook, TeamId, Worn } from '../looks'
import type { ToyActor } from './toy'

/** Puts Misty in a look (fur colors, fluff, hairdo, decorations, her paw-print sweater): everything it added last
 *  time comes off first, so it can be called again with another look. `null`: the plain white bear. */
export function dressMisty(_actor: FilmActor, _look: MistyLook | null, _bag: Bag): void {}

/** Puts a rig friend in what she chose in the cabin (jersey, hat, scarf, cheek stamp): what it added last time comes
 *  off first. `scarf` says whether the friend is on the team (the team's pink scarf shows unless she picked another). */
export function dressWorn(_actor: FilmActor, _who: TeamId, _worn: Worn, _bag: Bag): void {}

/** The same for a hand-built toy (Tuque, Lulu, Gus): each has a `hat` and a `neck` spot. */
export function dressToy(_actor: ToyActor, _who: TeamId, _worn: Worn, _bag: Bag): void {}
