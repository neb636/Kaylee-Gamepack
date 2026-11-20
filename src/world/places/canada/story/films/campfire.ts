// The campfire chapter's two films (planning/around-the-world/canada.md): `campfire-in` before its game, `campfire-out` after
// it (before the stamp). Lines: lines.ts `L.campfire.filmIn` and `L.campfire.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/campfire.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { CAMP } from '../sets/campfire'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const CAMPFIRE_IN: StoryFilm = standIn('campfire-in', CAMP, L.campfire.filmIn)
export const CAMPFIRE_OUT: StoryFilm = standIn('campfire-out', CAMP, L.campfire.filmOut)
