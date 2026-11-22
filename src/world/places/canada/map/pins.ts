// The heart pins over the places still to do (the Nan map's look): a round hot-pink badge with a white rim and a white
// heart, a little point under it, floating over the friend who needs fetching. world.ts turns each one to face the
// camera, bobs it, keeps it a readable size on a small screen, and hides it once that friend is on the team (their
// home wears the little pennant instead). Part of the 3D board, so it turns and tilts with it.
import { Group } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'

/** The badge's radius (units): world.ts scales the pin up on a small screen so it never shrinks below a thumbnail. */
export const PIN_R = 0.24

/** A heart pin, facing +z, its point's tip at the origin. */
export function heartPin(bag: Bag, gold = false) {
  const root = new Group()
  const face = new Group()
  const heart: [number, number][] = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const x = 16 * Math.sin(a) ** 3
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)
    heart.push([x * 0.0064, y * 0.0064])
  }
  const body = gold ? PAL.gold : PAL.hotpink
  face.add(
    solid(
      merge([
        // The point under the badge, then the badge (a thick coin standing up), its white rim and the heart.
        P.cone(0.1, 0.2, body, { at: [0, 0.1, 0], rot: [Math.PI, 0, 0] }, 12),
        P.cyl(PIN_R, PIN_R, 0.07, body, { at: [0, 0.2 + PIN_R * 0.9, 0], rot: [Math.PI / 2, 0, 0] }, 28),
        P.torus(PIN_R * 0.82, 0.018, '#FFFFFF', { at: [0, 0.2 + PIN_R * 0.9, 0.036] }),
        P.prism(heart, 0.03, '#FFFFFF', { at: [0, 0.2 + PIN_R * 0.9 + 0.018, 0.03] }),
      ]),
      bag,
      2,
    ),
  )
  root.add(face)
  return root
}
