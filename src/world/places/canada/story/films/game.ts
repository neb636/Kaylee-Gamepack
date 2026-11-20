// The big game's two films (planning/around-the-world/canada.md), played by the finale (activities/party/): `game-in`
// before the hockey (the whole team skates out, Gus scoffs, Lulu sings, the puck drops) and `game-win` after the last
// goal (the Maple Cup, Gus is a good sport, the Cup is full of maple syrup: taffy on the snow for everybody). Lines:
// lines.ts `L.story.gameIn` and `L.story.gameWin`, in play order.
// STAND-IN: both films are the script said in close-ups (films/standin.ts) until they are staged here. Copy
// story/films/intro.ts; the set is the canal in the evening (story/sets/rink.ts RINK_EVENING).
import { L } from '../../lines'
import { RINK_EVENING } from '../sets/rink'
import type { StoryFilm } from '../stage'
import { standIn } from './standin'

export const GAME_IN: StoryFilm = { ...standIn('game-in', RINK_EVENING, L.story.gameIn), music: 'game' }
export const GAME_WIN: StoryFilm = { ...standIn('game-win', RINK_EVENING, L.story.gameWin), music: 'game' }
