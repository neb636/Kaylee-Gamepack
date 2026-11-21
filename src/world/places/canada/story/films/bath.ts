// Misty's Bubble Bath's two films (planning/around-the-world/canada-round-2.md). STAND-INS until the bath's builder
// stages them on the rainforest river (story/sets/bath.ts): the old salmon films' staging is in git history
// (`git show 1829afadf:src/world/places/canada/story/films/salmon.ts`).
import { L } from '../../lines'
import { RIVER } from '../sets/bath'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const BATH_IN: StoryFilm = standIn('bath-in', RIVER, L.bath.filmIn)
export const BATH_OUT: StoryFilm = standIn('bath-out', RIVER, L.bath.filmOut)
