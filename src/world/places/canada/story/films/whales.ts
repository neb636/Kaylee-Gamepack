// The whales chapter's two films (planning/around-the-world/canada.md): `whales-in` before its game, `whales-out` after
// it (before the stamp). Lines: lines.ts `L.whales.filmIn` and `L.whales.filmOut`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts: a set (story/sets/whales.ts), the actors on their marks, one line a beat.
import { L } from '../../lines'
import { COAST } from '../sets/whales'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const WHALES_IN: StoryFilm = standIn('whales-in', COAST, L.whales.filmIn)
export const WHALES_OUT: StoryFilm = standIn('whales-out', COAST, L.whales.filmOut)
