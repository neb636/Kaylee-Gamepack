// The bike chapter's two films (planning/around-the-world/canada.md): `bike-in` before its game, `bike-out` after
// it (before the stamp). Lines: lines.ts `L.bike.filmIn` and `L.bike.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/bike.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { MOUNTAIN } from '../sets/bike'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const BIKE_IN: StoryFilm = standIn('bike-in', MOUNTAIN, L.bike.filmIn)
export const BIKE_OUT: StoryFilm = standIn('bike-out', MOUNTAIN, L.bike.filmOut)
