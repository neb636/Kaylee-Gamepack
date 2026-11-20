// The film set for the campfire chapter (story/films/campfire.ts). The campsite at night: the fire, the tent, tall dark trees, stars.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface CampSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const CAMP: FilmSet<CampSet> = {
  id: 'campfire',
  look: { sky: ['#1B1B4A', '#3A2F6E', '#5A4A8A'], fog: ['#2A2456', 14, 70], light: [0.62, 0.5], tint: '#C9D2FF', stars: true },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#3F5A4E', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
