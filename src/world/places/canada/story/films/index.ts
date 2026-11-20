// Every film of Maple's Team, by its id (activities/story/sections.ts FILM_IDS): the way in, each chapter's two
// (one file a chapter), the big game's two.
import type { FilmId } from '../../activities/story/sections'
import type { StoryFilm } from '../stage'
import { BIKE_IN, BIKE_OUT } from './bike'
import { CAMPFIRE_IN, CAMPFIRE_OUT } from './campfire'
import { CANOE_IN, CANOE_OUT } from './canoe'
import { GAME_IN, GAME_WIN } from './game'
import { INTRO } from './intro'
import { SALMON_IN, SALMON_OUT } from './salmon'
import { SNOWMAN_IN, SNOWMAN_OUT } from './snowman'
import { WHALES_IN, WHALES_OUT } from './whales'

export const FILMS: Record<FilmId, StoryFilm> = {
  intro: INTRO,
  'snowman-in': SNOWMAN_IN,
  'snowman-out': SNOWMAN_OUT,
  'bike-in': BIKE_IN,
  'bike-out': BIKE_OUT,
  'campfire-in': CAMPFIRE_IN,
  'campfire-out': CAMPFIRE_OUT,
  'canoe-in': CANOE_IN,
  'canoe-out': CANOE_OUT,
  'salmon-in': SALMON_IN,
  'salmon-out': SALMON_OUT,
  'whales-in': WHALES_IN,
  'whales-out': WHALES_OUT,
  'game-in': GAME_IN,
  'game-win': GAME_WIN,
}
