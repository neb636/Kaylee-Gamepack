// Which films open and close each chapter of Maple's Team (Place.tsx plays them round the game), who each chapter
// brings to the team, and which films she has already watched in this visit to the app (so a film doesn't play twice
// in a row). Pure data: no three.js.
import { CHAPTERS, type ChapterId, type FilmId } from '../activities/story/sections'

export { CHAPTERS, type ChapterId }

/** A chapter's films: `in` before its game, `out` after it (before the stamp). */
export const CHAPTER_FILMS: Record<ChapterId, { in: FilmId; out: FilmId }> = {
  snowman: { in: 'snowman-in', out: 'snowman-out' },
  bike: { in: 'bike-in', out: 'bike-out' },
  campfire: { in: 'campfire-in', out: 'campfire-out' },
  canoe: { in: 'canoe-in', out: 'canoe-out' },
  bath: { in: 'bath-in', out: 'bath-out' },
  whales: { in: 'whales-in', out: 'whales-out' },
}
export const isChapter = (id: string | undefined): id is ChapterId => !!id && (CHAPTERS as readonly string[]).includes(id)

/** Who each chapter's stamp brings to the team, and what they do in the big game. */
export const TEAM: Record<ChapterId, { who: 'tuque' | 'monty' | 'roxy' | 'lulu' | 'misty' | 'ollie'; name: string; icon: string; role: string }> = {
  snowman: { who: 'tuque', name: 'Tuque the snowman', icon: '⛄', role: 'nothing gets past his tummy' },
  bike: { who: 'monty', name: 'Monty the moose', icon: '🫎', role: 'the goalie: he fills the whole net' },
  campfire: { who: 'roxy', name: 'Roxy the raccoon', icon: '🦝', role: 'quick paws: she steals the puck' },
  canoe: { who: 'lulu', name: 'Lulu the loon', icon: '🎵', role: 'sings the song that starts the game' },
  bath: { who: 'misty', name: 'Misty the spirit bear', icon: '🐻‍❄️', role: 'the biggest slap shot' },
  whales: { who: 'ollie', name: 'Ollie the sea otter', icon: '🦦', role: 'spins and slides: the fastest pass' },
}
/** The team so far: the chapters she has a stamp for, in map order. */
export const teamOf = (stamps: string[]): ChapterId[] => CHAPTERS.filter((c) => stamps.includes(c))

const seen = new Set<FilmId>()
// The way-in film is remembered between visits too (she has no stamp until her first chapter is done, and a minute of
// film every time she opens Canada would be the talk she never asked for). It still opens from its link.
const INTRO_KEY = 'kaylee-gamepack:canada:intro-seen'
export const filmSeen = (id: FilmId) => {
  if (seen.has(id)) return true
  if (id !== 'intro') return false
  try {
    return localStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return false
  }
}
/** The film that has just ended, and when: a chapter's game opened straight after its way-in film skips its hello. */
let last: { id: FilmId; at: number } | null = null
export const justSeen = (id: FilmId) => !!last && last.id === id && performance.now() - last.at < 4000
export const seeFilm = (id: FilmId) => {
  seen.add(id)
  last = { id, at: performance.now() }
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
