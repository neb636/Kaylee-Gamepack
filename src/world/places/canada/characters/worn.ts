// The team in what she chose in the Team Cabin (looks.ts Worn: jersey, hat, scarf, cheek stamp). STUBS until the
// cabin's builder fills them in (planning/around-the-world/canada-round-2.md): the signatures are the contract with
// story/cast.ts, map/world.ts and activities/party/players.ts.
import type { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import type { TeamId, Worn } from '../looks'
import type { ToyActor } from './toy'

/** Puts a rig friend in what she chose in the cabin: what it added last time comes off first. */
export function dressWorn(_actor: FilmActor, _who: TeamId, _worn: Worn, _bag: Bag): void {}

/** The same for a hand-built toy (Tuque, Lulu, Gus): each has a `hat` and a `neck` spot. */
export function dressToy(_actor: ToyActor, _who: TeamId, _worn: Worn, _bag: Bag): void {}
