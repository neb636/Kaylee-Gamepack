// The salmon chapter's two films (planning/around-the-world/canada.md): `salmon-in` before its game, `salmon-out` after
// it (before the stamp). Lines: lines.ts `L.salmon.filmIn` and `L.salmon.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/salmon.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { RIVER } from '../sets/salmon'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const SALMON_IN: StoryFilm = standIn('salmon-in', RIVER, L.salmon.filmIn)
export const SALMON_OUT: StoryFilm = standIn('salmon-out', RIVER, L.salmon.filmOut)
