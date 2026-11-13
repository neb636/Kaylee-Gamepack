// The pizza table's little effects, each one instanced mesh (one draw call however many): crumbs when someone munches,
// soda bubbles, chili flakes, a flurry of napkins, sparkles when the box closes.
import type { BufferGeometry, ColorRepresentation } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { Floaters as EngineFloaters } from '../../../../../engine3d/floaters'

/** The engine's Floaters (engine3d/floaters.ts) as this game uses them: falling ones vanish on the table, and they
 *  only wobble (no spin). */
export class Floaters extends EngineFloaters {
  constructor(geo: BufferGeometry, colors: ColorRepresentation[], count: number, bag: Bag, gravity = 0, drag = 1.5) {
    super(geo, colors, count, bag, gravity, drag, { floor: 0.02, roll: false })
  }
}
