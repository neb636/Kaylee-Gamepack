// The Poles' story films as deep links: #/world/poles/story/<film> plays one film on the film stage (story/stage.ts,
// story/films.ts), then goes on to what follows it in the game (a chapter's game, the stamp, the globe).
// Loaded at startup by the section index (keep three.js out of this file).
import { defineSections } from '../../../../kit/sections'

/** Every film, in story order: the way in, a film into and out of each chapter, then the ending's (story/nightFilms.ts). */
export const FILM_IDS = ['intro', 'floe-in', 'floe-out', 'narwhal-in', 'narwhal-out', 'coats-in', 'coats-out', 'slide-in', 'slide-out', 'night-in', 'night-lost', 'night-colony', 'night-sunrise', 'night-goodbye', 'the-end'] as const
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
  'night-in': 'The Longest Night: time to fly',
  'night-lost': 'The Longest Night: the storm',
  'night-colony': 'The Longest Night: so many papas',
  'night-sunrise': 'The Longest Night: sunrise',
  'night-goodbye': 'The Longest Night: a pebble for Pola',
  'the-end': 'The Longest Night: top and bottom (the end)',
}

const STORY_SECTIONS = defineSections('poles', 'story', {
  title: "The story films: Pebble's Long Way Home",
  note: 'Each link plays one film (hold ⏭ to skip it), then goes on into the game as it does for her.',
  sections: FILM_IDS.map((id) => ({ id, name: NAMES[id] })),
})
export default STORY_SECTIONS
