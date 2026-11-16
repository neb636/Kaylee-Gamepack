// The story's trail down the world: the chapters in story order (story/chapters.ts), then home (the finale). The
// globe's pictures (Hub.tsx) and its pins and balloon (globe/trail.ts) are both built from this list, so they always
// agree on which stop is next. Pure data: no three.js.
import type { PlaceMeta } from '../../../../types'
import { STORY_ORDER } from '../../story/chapters'

/** The finale's id (Place.tsx opens it once every stamp is in). */
export const HOME = 'party'
/** The movie ticket at the end of the trail once the whole story is told (Hub.tsx): it opens the Theater. Not on the
 *  globe (no flag), only in the trail of pictures. */
export const MOVIES: Stop = { id: 'movies', name: 'Real animals movies', lat: -90, pole: 'south', done: false }
/** Where each stop's flag stands on the trail's meridian (globe/trail.ts): three up north, two down south, and home
 *  near the South Pole. */
const STOP_LAT: Record<string, number> = { floe: 70, narwhal: 59, coats: 48, slide: -63, huddle: -72, [HOME]: -81 }

export interface Stop {
  id: string
  name: string
  /** Its sticker's picture (none for home: Hub.tsx draws Papa waiting). */
  img?: string
  lat: number
  pole: 'north' | 'south'
  done: boolean
}

/** The trail for this passport: every chapter the place has, in story order, then home. `next` is the first stop
 *  without a stamp (home once the chapters are done); `all` is true once every stamp is in (the finale is open). */
export function trail(meta: PlaceMeta, stamps: string[]) {
  const stops: Stop[] = []
  for (const id of STORY_ORDER) {
    const a = meta.activities.find((x) => x.id === id)
    // (An id the place doesn't have yet is skipped: the trail works before and after a chapter lands.)
    if (!a) continue
    const lat = STOP_LAT[id] ?? 0
    stops.push({ id, name: a.name, img: a.sticker.img, lat, pole: lat >= 0 ? 'north' : 'south', done: stamps.includes(id) })
  }
  const all = meta.activities.length > 0 && meta.activities.every((a) => stamps.includes(a.id))
  stops.push({ id: HOME, name: 'Home: Pole to Pole', lat: STOP_LAT[HOME], pole: 'south', done: false })
  const next = Math.max(0, stops.findIndex((s) => !s.done))
  return { stops, next, all }
}
