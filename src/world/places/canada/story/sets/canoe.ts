// The film set for the canoe chapter (story/films/canoe.ts). The turquoise lake in Banff: the dock and the red canoe, the peaks, the glacier at the far end.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface LakeSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const LAKE: FilmSet<LakeSet> = {
  id: 'canoe',
  look: { sky: ['#8CC8F7', '#CBE8FA', '#E6F5F2'], fog: ['#DCEFF2', 60, 240] },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#7FD0CF', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
