// Which films open and close each chapter of the Poles' story (Place.tsx plays them round the game), and which films
// she has already watched in this visit to the app (so a film doesn't play twice in a row). Pure data: no three.js.
import type { FilmId } from '../activities/story/sections'

/** A chapter's films: `in` before its game, `out` after it (before the stamp). */
export const CHAPTER_FILMS: Record<string, { in: FilmId; out: FilmId }> = {
  floe: { in: 'floe-in', out: 'floe-out' },
  narwhal: { in: 'narwhal-in', out: 'narwhal-out' },
  coats: { in: 'coats-in', out: 'coats-out' },
  slide: { in: 'slide-in', out: 'slide-out' },
  huddle: { in: 'huddle-in', out: 'huddle-out' },
}

/** The chapters in story order (the globe's trail of pictures runs down the world in this order). */
export const STORY_ORDER = ['floe', 'narwhal', 'coats', 'slide', 'huddle'] as const

const seen = new Set<FilmId>()
export const filmSeen = (id: FilmId) => seen.has(id)
export const seeFilm = (id: FilmId) => void seen.add(id)
