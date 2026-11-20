// The film set for the salmon chapter (story/films/salmon.ts). The rainforest river in British Columbia: giant cedars, ferns, the falls, soft rain.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface RiverSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const RIVER: FilmSet<RiverSet> = {
  id: 'salmon',
  look: { sky: ['#A9C9D8', '#CFE2DC', '#E2EFDF'], fog: ['#D2E4DA', 30, 120] },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#7FB56E', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
