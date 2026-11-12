// The mushroom farm's little effects, each one instanced mesh (one draw call however many): the hose's mist, drips off
// the wet bags, sparkles when a mushroom pops or swells, crumbs at lunch, the oven's steam.
import type { BufferGeometry, ColorRepresentation } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { Floaters as EngineFloaters } from '../../../../../engine3d/floaters'

/** The engine's Floaters (engine3d/floaters.ts) as the farm uses them: crumbs and drips vanish on the ground, they only
 *  wobble, mist is see-through (`opacity`) and swells (`grow`), bursts fly out toward the camera. */
export class Floaters extends EngineFloaters {
  constructor(geo: BufferGeometry, colors: ColorRepresentation[], count: number, bag: Bag, gravity = 0, drag = 1.5, opacity = 1, grow = 0) {
    super(geo, colors, count, bag, gravity, drag, { floor: 0.02, roll: false, opacity, grow, facing: true })
  }
}
