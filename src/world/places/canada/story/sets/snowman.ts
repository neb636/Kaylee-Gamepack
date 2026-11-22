// The film set for the snowman chapter (story/films/snowman.ts): Quebec City at the Winter Carnival, the snowy park
// under the castle hotel. It is the game's own park (activities/snowman/props.ts buildPark: the Château's green copper
// roofs up on the cliff, the parade path with its flags, bunting and paper lanterns, the snowy spruces, the ice moose,
// the snowy owl on her lamp) with the carnival trumpet and the parade drum, so the films happen where she plays.
// The usual camera stands at the park's front (+z) and looks toward the castle (-z).
import { Group } from 'three'
import { P, solid } from '../../../../engine3d/geo'
import { Trumpet } from '../../activities/snowman/critters'
import { DRUM, LAMP } from '../../activities/snowman/park'
import { buildPark, Drum, Owl, type Park } from '../../activities/snowman/props'
import type { FilmSet } from '../stage'

export interface CarnivalSet {
  park: Park
  owl: Owl
  trumpet: Trumpet
  drum: Drum
  /** A little snowball (radius 1, scale it), hidden until a film puts it somewhere: Maple pats it, throws it. */
  ball: Group
}

export const CARNIVAL: FilmSet<CarnivalSet> = {
  id: 'snowman',
  look: { sky: ['#9CCBF5', '#D3E6F8', '#F2E8F2'], fog: ['#E3ECF8', 45, 170] },
  build(s, root) {
    const park = buildPark(s.bag)
    root.add(park.root)
    const owl = new Owl(s.bag)
    owl.root.position.set(LAMP.x, 4.1, LAMP.z)
    const trumpet = new Trumpet(s.bag)
    const drum = new Drum(s.bag)
    drum.root.position.set(DRUM.x, 0, DRUM.z)
    drum.appear()
    const ball = solid(P.sphere(1, '#FFFFFF', {}, 16), s.bag, 2)
    ball.visible = false
    root.add(owl.root, trumpet.root, drum.root, ball)
    return { park, owl, trumpet, drum, ball }
  },
  update(set, dt, t) {
    set.owl.update(dt, t)
    set.trumpet.update(dt, t)
    set.drum.update(dt, t)
  },
}
