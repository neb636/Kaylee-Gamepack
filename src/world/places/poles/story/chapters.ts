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
// The way-in film is remembered between visits too (she has no stamp until her first chapter is done, and a minute of
// film every time she opens the Poles would be the talk she never asked for). It still opens from its link.
const INTRO_KEY = 'kaylee-gamepack:poles:intro-seen'
export const filmSeen = (id: FilmId) => {
  if (seen.has(id)) return true
  if (id !== 'intro') return false
  try {
    return localStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}
export const seeFilm = (id: FilmId) => {
  seen.add(id)
  if (id !== 'intro') return
  try {
    localStorage.setItem(INTRO_KEY, '1')
  } catch {
    /* a private window: it plays again next visit */
  }
}
/** Start the story over (the start-over pill): every film plays again, the way-in film first. */
export const forgetFilms = () => {
  seen.clear()
  try {
    localStorage.removeItem(INTRO_KEY)
  } catch {
    /* a private window: nothing was saved anyway */
  }
}
