// The film set for the bike chapter (story/films/bike.ts). Mont-Sainte-Anne: the top of the mountain by the gondola, and the pond under the waterfall at the bottom.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface MountainSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const MOUNTAIN: FilmSet<MountainSet> = {
  id: 'bike',
  look: { sky: ['#8CC8F7', '#CBE8FA', '#EAF6E4'], fog: ['#DDF0E8', 50, 200] },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#9FD68A', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
