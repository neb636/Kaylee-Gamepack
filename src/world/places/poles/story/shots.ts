// The films' camera shorthands (story/films.ts, story/nightFilms.ts).
import { Vector3 } from 'three'
import type { FilmPoint, FilmShot } from '../../../engine3d/film'

/** A shot: where the camera is and what it looks at, maybe moving to `to` over the beat. */
export const cam = (eye: FilmPoint, look: FilmPoint, to?: { eye?: FilmPoint; look?: FilmPoint; fov?: number }, more: Partial<FilmShot> = {}): FilmShot => ({ eye, look, to, ...more })
/** A close-up of someone's face from a little to one side (`side` meters to the camera's right), `back` meters away. */
export const close = (who: { head(out?: Vector3): Vector3 }, side = 0.5, back = 2.6, up = 0.12): FilmShot => ({
  eye: () => who.head(tmpA).add(tmpB.set(side, up, back)),
  look: () => who.head(tmpC),
  fov: 34,
})
const tmpA = new Vector3()
const tmpB = new Vector3()
export const tmpC = new Vector3()

