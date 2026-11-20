// The snowman chapter's two films (planning/around-the-world/canada.md): `snowman-in` before its game, `snowman-out` after
// it (before the stamp). Lines: lines.ts `L.snowman.filmIn` and `L.snowman.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/snowman.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { CARNIVAL } from '../sets/snowman'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const SNOWMAN_IN: StoryFilm = standIn('snowman-in', CARNIVAL, L.snowman.filmIn)
export const SNOWMAN_OUT: StoryFilm = standIn('snowman-out', CARNIVAL, L.snowman.filmOut)
