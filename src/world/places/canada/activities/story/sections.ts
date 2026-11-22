// The films of Maple's Team as deep links: #/world/canada/story/<film> plays one film on the film stage
// (story/stage.ts, story/films/), then goes on to what follows it in the game (a chapter's game, its stamp, the map).
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

/** The chapters, east to west across the map: each brings one friend home to the team. */
export const CHAPTERS = ['snowman', 'bike', 'campfire', 'canoe', 'bath', 'whales'] as const
export type ChapterId = (typeof CHAPTERS)[number]

/** Every film, in story order: the way in, a film into and out of each chapter, then the big game's two. */
export const FILM_IDS = ['intro', 'snowman-in', 'snowman-out', 'bike-in', 'bike-out', 'campfire-in', 'campfire-out', 'canoe-in', 'canoe-out', 'bath-in', 'bath-out', 'whales-in', 'whales-out', 'game-in', 'game-win'] as const
export type FilmId = (typeof FILM_IDS)[number]

const NAMES: Record<FilmId, string> = {
  intro: 'The way in: Maple needs a team',
  'snowman-in': "Carnival Snowballs, before: let's make a player",
  'snowman-out': 'Carnival Snowballs, after: Tuque wakes up',
  'bike-in': 'Mountain Bike, before: Monty is way down there',
  'bike-out': 'Mountain Bike, after: a goalie who stands very well',
  'campfire-in': 'Campfire Night, before: who took my marshmallow?',
  'campfire-out': 'Campfire Night, after: the quickest paws in Canada',
  'canoe-in': 'Red Canoe, before: every big game starts with a song',
  'canoe-out': 'Red Canoe, after: Lulu and the littlest singer',
  'bath-in': "Misty's Bubble Bath, before: a white bear, all brown",
  'bath-out': "Misty's Bubble Bath, after: the biggest slap shot",
  'whales-in': "Whale Peek-a-Boo, before: Ollie's lucky rock",
  'whales-out': 'Whale Peek-a-Boo, after: is hockey wet?',
  'game-in': 'The big game, before: the whole team skates out',
  'game-win': 'The big game, after: the Maple Cup',
}

const STORY_SECTIONS = defineSections('canada', 'story', {
  title: "The story films: Maple's Team",
  note: 'Each link plays one film (hold ⏭ to skip it), then goes on into the game as it does for her.',
  sections: FILM_IDS.map((id) => ({ id, name: NAMES[id] })),
})
export default STORY_SECTIONS
