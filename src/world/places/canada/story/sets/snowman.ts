// The film set for the snowman chapter (story/films/snowman.ts). Quebec City at the Winter Carnival: the snowy park under the castle hotel, flags and lanterns.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface CarnivalSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const CARNIVAL: FilmSet<CarnivalSet> = {
  id: 'snowman',
  look: { sky: ['#9CCBF5', '#CFE6FA', '#F4E9F4'], fog: ['#E6EFFA', 40, 160] },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#FFFFFF', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
