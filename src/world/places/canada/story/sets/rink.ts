// The frozen canal in Ottawa, as a film set (the way in, and the big game's two films): the finale's own canal
// (activities/party/canal.ts: the rink painted on the ice, the snowbanks, the stone walls, Parliament on its hill) with
// the Maple Cup on its stand by the boards, a few pucks, and Sparkle's balloon. `RINK` has the rink's size: x from -5
// to 5, the geese's net at z = -9 (far), hers at z = 7.2 (near the usual camera).
import type { Group } from 'three'
import { buildCanal, RINK, type Canal } from '../../activities/party/canal'
import { Balloon, makeCup, makePuck } from '../props'
import type { FilmSet } from '../stage'

export { RINK }

export interface RinkSet {
  canal: Canal
  /** The Maple Cup on its stand (its foot is 0.62 m up). */
  cup: Group
  /** Where the cup stands. */
  cupAt: [x: number, y: number, z: number]
  /** Loose pucks, hidden until a film puts them somewhere (`s.put(set.pucks[0], x, 0, z)`). */
  pucks: Group[]
  balloon: Balloon
}

/** The canal on a bright winter afternoon. */
export const RINK_SET: FilmSet<RinkSet> = {
  id: 'rink',
  look: { sky: ['#9CCBF5', '#CFE6FA', '#F4E9F4'], fog: ['#E6EFFA', 50, 190] },
  build(s, root) {
    const canal = buildCanal(s.bag)
    root.add(canal.root)
    const cupAt: [number, number, number] = [3.5, 0, 1.2]
    const cup = makeCup(s.bag, 0.72, true)
    cup.position.set(...cupAt)
    root.add(cup)
    const pucks = [0, 1, 2, 3, 4, 5].map(() => {
      const p = makePuck(s.bag)
      p.visible = false
      root.add(p)
      return p
    })
    const balloon = new Balloon(s.bag)
    root.add(balloon.root)
    return { canal, cup, cupAt, pucks, balloon }
  },
  update(set, dt, t) {
    set.balloon.update(dt, t)
    for (const skater of set.canal.skaters) skater.update(dt, t)
  },
}

/** The same canal in the evening, for the big game: a rosy dusk, the lamps lit (as in the game, activities/party/
 *  rink.ts), a little snow (the film sets `s.snow`). The Cup is in the game's films, not on its stand. */
export const RINK_EVENING: FilmSet<RinkSet> = {
  ...RINK_SET,
  id: 'rink-evening',
  look: { sky: ['#6F6AB8', '#E7A6C8', '#FFD9B8'], fog: ['#F2D8E4', 50, 190], light: [0.92, 0.85], tint: '#FFE9E0', clouds: true },
  build(s, root) {
    const set = RINK_SET.build(s, root)
    set.cup.visible = false
    for (const l of set.canal.lamps) {
      l.mat.color.setRGB(1, 0.86, 0.55)
      l.glow.scale.setScalar(1.3)
    }
    return set
  },
}
