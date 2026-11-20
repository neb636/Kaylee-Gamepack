// A stand-in film: every line of a film's script said in order, the speaker in close-up on an empty set. It keeps the
// whole story playable (and its lines recorded) while a chapter's real film is being staged. A chapter's film file
// replaces its stand-ins with real beats (copy story/films/intro.ts); nothing should ship still using this.
import { cam, close } from '../../../../engine3d/shots'
import type { Beat } from '../../../../engine3d/film'
import type { FilmId } from '../../activities/story/sections'
import type { Performer } from '../../characters/toy'
import type { Cast } from '../cast'
import type { FilmSet, StoryFilm } from '../stage'

type Line = string | { text: string; voice: string }
const WHO: Record<string, (c: Cast) => Performer> = {
  maple: (c) => c.maple,
  moose: (c) => c.monty,
  raccoon: (c) => c.roxy,
  snowman: (c) => c.tuque,
  otter: (c) => c.ollie,
  bear: (c) => c.misty,
  loon: (c) => c.lulu,
  gus: (c) => c.gus,
}

export function standIn(id: FilmId, set: FilmSet, script: Record<string, Line>): StoryFilm {
  return {
    id,
    set,
    beats(s) {
      const placed = new Map<string, Performer>()
      const stand = (voice: string) => {
        let a = placed.get(voice)
        if (!a) {
          a = WHO[voice](s.cast)
          const n = placed.size
          a.place(n === 0 ? 0 : (n % 2 ? 1 : -1) * Math.ceil(n / 2) * 1.5, 0, 0, n === 0 ? 0 : n % 2 ? -25 : 25)
          placed.set(voice, a)
        }
        return a
      }
      stand('maple')
      return Object.entries(script).map(([key, line]): Beat => {
        const voice = typeof line === 'string' ? null : line.voice
        const who = voice && WHO[voice] ? stand(voice) : null
        return { id: key, shot: who ? close(who, 0.3, 2.8) : cam([0, 1.4, 6], [0, 0.8, 0]), say: line, start: () => who?.wave() }
      })
    },
  }
}
