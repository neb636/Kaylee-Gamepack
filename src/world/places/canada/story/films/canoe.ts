// The canoe chapter's two films (planning/around-the-world/canada.md): `canoe-in` before its game, `canoe-out` after
// it (before the stamp). Lines: lines.ts `L.canoe.filmIn` and `L.canoe.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/canoe.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { LAKE } from '../sets/canoe'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const CANOE_IN: StoryFilm = standIn('canoe-in', LAKE, L.canoe.filmIn)
export const CANOE_OUT: StoryFilm = standIn('canoe-out', LAKE, L.canoe.filmOut)
