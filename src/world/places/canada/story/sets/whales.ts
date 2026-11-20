// The film set for the whales chapter (story/films/whales.ts). The coast at Tofino: the dock and the little boat, kelp, rocky islets, the open Pacific.
// STAND-IN: a bare patch of ground in the right light, so the chapter's films play until its real set is built here.
// `build` makes the scenery in `root` and returns whatever the films move (docs/films.md; story/sets/rink.ts is a
// finished one).
import { P, solid } from '../../../../engine3d/geo'
import type { FilmSet } from '../stage'

export interface CoastSet {
  /** (What this set's films can move: props, marks. Nothing yet.) */
  ready: boolean
}

export const COAST: FilmSet<CoastSet> = {
  id: 'whales',
  look: { sky: ['#8CC8F7', '#CBE8FA', '#F2F0E4'], fog: ['#DDEEF4', 60, 260] },
  build(s, root) {
    root.add(solid(P.cyl(60, 60, 0.4, '#5DB6D6', { at: [0, -0.2, 0] }, 40), s.bag, 0))
    return { ready: true }
  },
}
