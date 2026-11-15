// The Poles' story films as deep links: #/world/poles/story/<film> plays one film on the film stage (story/stage.ts,
// story/films.ts), then goes on to what follows it in the game (a chapter's game, the stamp, the globe).
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

/** Every film, in story order: the way in, then a film into and out of each chapter, then the finale's three. */
export const FILM_IDS = ['intro', 'floe-in', 'floe-out', 'narwhal-in', 'narwhal-out', 'coats-in', 'coats-out', 'slide-in', 'slide-out', 'huddle-in', 'huddle-out', 'home-in', 'home-land', 'home-reunion'] as const
export type FilmId = (typeof FILM_IDS)[number]

const NAMES: Record<FilmId, string> = {
  intro: 'The way in: Pola finds a penguin',
  'floe-in': 'Ice Floe Hop, before: hop on my back',
  'floe-out': 'Ice Floe Hop, after: Mama Bear',
  'narwhal-in': 'Narwhal Ride, before: Nari the narwhal',
  'narwhal-out': 'Narwhal Ride, after: the balloon',
  'coats-in': 'Snow Coats, before: when do we fly?',
  'coats-out': 'Snow Coats, after: winter is here',
  'slide-in': 'Penguin Slide, before: Papa looks everywhere',
  'slide-out': 'Penguin Slide, after: his favorite supper',
  'huddle-in': 'Emperor Huddle, before: the long night',
  'huddle-out': 'Emperor Huddle, after: the sun comes back',
  'home-in': 'The finale: the balloon lifts off',
  'home-land': 'The finale: a polar bear at the South Pole',
  'home-reunion': 'The finale: Papa and Pebble',
}

const STORY_SECTIONS = defineSections('poles', 'story', {
  title: "The story films: Pebble's Long Way Home",
  note: 'Each link plays one film (hold ⏭ to skip it), then goes on into the game as it does for her.',
  sections: FILM_IDS.map((id) => ({ id, name: NAMES[id] })),
})
export default STORY_SECTIONS
