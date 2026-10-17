// What the house builders share: the dispose bag, the pokeable objects by pickable id, their named moving parts
// ('fridge.hinge', 'fan.blades'...), and the walls the cutaway lowers.
import { Group, type BufferGeometry, type Object3D } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, solid, type V3 } from '../../../engine/geo'

export interface Kit {
  bag: Bag
  pokes: Map<string, Group>
  parts: Map<string, Object3D>
}

/**
 * A pokeable thing: parts modelled around its own base (0, 0, 0), placed at `at`, so it wobbles and hops from the
 * floor up. Returns its group; add children (moving parts) to it as needed.
 */
export function poke(kit: Kit, id: string, parts: BufferGeometry[], at: V3, opts: { rotY?: number; px?: number } = {}): Group {
  const g = new Group()
  g.position.set(...at)
  g.rotation.y = opts.rotY ?? 0
  if (parts.length) g.add(solid(merge(parts), kit.bag, opts.px ?? 2))
  g.userData.pick = id
  kit.pokes.set(id, g)
  return g
}

/** A named moving part (a hinge, blades, a paw), pivoting at `at` inside its parent. */
export function part(kit: Kit, name: string, parts: BufferGeometry[], at: V3, px = 2): Group {
  const pivot = new Group()
  pivot.position.set(...at)
  if (parts.length) pivot.add(solid(merge(parts), kit.bag, px))
  kit.parts.set(name, pivot)
  return pivot
}

/** Static scenery merged into one mesh + outline. */
export function scenery(kit: Kit, parts: BufferGeometry[], px = 2): Object3D {
  return solid(merge(parts), kit.bag, px)
}
