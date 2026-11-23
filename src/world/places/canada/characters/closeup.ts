// The silly-face close-up (canada-round-2.md in git history): the laugh she repeats in Koh Samet is one
// small trick, a silly face in a tight shot with a wiggle and a boing. Every rebuilt toy's big moment uses this one
// helper, so they are all the same quality: Maple soaked by a whale, Roxy frozen in the beam, Misty at the mirror.
//
// A film (story/films/) uses `sillyBeat` as one of its beats. A game plays `sillyFilm` on its own FilmPlayer
// (engine3d/film.ts; docs/films.md, "The world"): a one-beat film that cuts to the face and back.
import type { Vector3 } from 'three'
import type { Line } from '../../../../sdk'
import type { Silly } from '../../../engine3d/characters/face'
import type { Beat, Film, FilmShot } from '../../../engine3d/film'
import { close } from '../../../engine3d/shots'
import { storySfx } from '../story/sounds'

/** Anyone who can pull a silly face and be framed (a Performer; a game's own character with these three). */
export interface SillyStar {
  silly(face: Silly, seconds?: number): void
  shake(): void
  head(out?: Vector3): Vector3
  height: number
}

export interface SillyOpts {
  /** The beat's id (default `silly`). */
  id?: string
  /** A line said over the face (the beat lasts until it's said). */
  say?: Line
  /** Seconds the face is held (default 1.9; a line makes it as long as the line). */
  dur?: number
  /** Meters to the camera's right of straight on (default 0.25: almost head on, so both eyes read). */
  side?: number
  /** How far back, in their heights (default 1.9: the face fills the frame). */
  back?: number
  /** The sound (default: the story's boing). */
  sound?: () => void
  /** As the beat begins (a splash of particles, whoever else reacts). */
  start?: () => void
}

/** The close-up's shot: 28° and tight on the face, pushing slowly in. */
export function sillyShot(who: SillyStar, side = 0.25, back = 1.9): FilmShot {
  const d = back * Math.max(0.6, who.height)
  const far = close(who, side, d, 0.06)
  const near = close(who, side * 0.8, d * 0.82, 0.04)
  return { ...far, fov: 28, to: { eye: near.eye }, ease: 'out', sway: 0.012, tall: { fov: 34 } }
}

/** One beat: the cut to their face, the silly face on, a wiggle and a boing. */
export function sillyBeat(who: SillyStar, face: Silly, o: SillyOpts = {}): Beat {
  const dur = o.dur ?? 1.9
  return {
    id: o.id ?? 'silly',
    shot: sillyShot(who, o.side, o.back),
    say: o.say,
    sayAt: 0.5,
    dur,
    hold: 0.3,
    start: () => {
      who.silly(face, dur + 3)
      o.start?.()
    },
    cues: [
      [0.12, () => (o.sound ?? storySfx.boing)()],
      [0.18, () => who.shake()],
    ],
  }
}

/** The same as a film of its own, for a game's FilmPlayer: `done` runs when it ends or is skipped (the face comes off
 *  there, so the game gets its character back as they were). */
export function sillyFilm(who: SillyStar, face: Silly, o: SillyOpts & { done?: () => void } = {}): Film {
  return {
    id: o.id ?? 'silly',
    beats: [sillyBeat(who, face, o)],
    finish: () => {
      who.silly(face, 0)
      o.done?.()
    },
  }
}
