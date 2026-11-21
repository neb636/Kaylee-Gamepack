// Ollie's lucky rock (planning/around-the-world/canada-round-2.md): every sea otter keeps a favorite stone in a pocket
// of skin under her arm and juggles it, and Ollie's is why she has the fastest pass. A round grey pebble with a white
// band of quartz round it (the kind of stone you keep), a pink speck and a little four-pointed sparkle that twinkles,
// so it reads as special next to any other rock. One mesh and one outline, plus the sparkle.
//
//   const rock = makeRock(bag, 0.09)      // r: its radius in meters (a sea otter's paw is about 0.1 m)
//   paw.add(rock)                         // its middle is the rock's middle
//   twinkle(rock, t)                      // each frame: the sparkle winks and turns
//
// Used by Whale Peek-a-Boo (the game and its films); the map and the big game can use it too.
import { DoubleSide, Group, Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { P, solidMix } from '../../../engine3d/geo'

const STONE = '#8F8DA0'
const STONE_LIGHT = '#AEADBE'
const QUARTZ = '#FBF8FF'

/** A four-pointed star, about 1 m across, flat in xy. */
function starShape() {
  const s = new Shape()
  const pts = 8
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const r = i % 2 ? 0.16 : 0.5
    const x = Math.sin(a) * r
    const y = Math.cos(a) * r
    if (i) s.lineTo(x, y)
    else s.moveTo(x, y)
  }
  return s
}

/** Ollie's lucky rock, `r` meters round (its middle at the group's origin). */
export function makeRock(bag: Bag, r = 0.09): Group {
  const g = new Group()
  g.name = 'lucky-rock'
  // A smooth, slightly flat pebble, lighter on top; the quartz band goes round it on a slant.
  g.add(
    solidMix(
      [P.sphere(r, STONE, { scale: [1.12, 0.82, 1] }, 16)],
      [
        P.sphere(r * 0.62, STONE_LIGHT, { at: [-r * 0.28, r * 0.42, r * 0.18], scale: [1, 0.35, 0.9] }, 12),
        P.torus(r * 1.0, r * 0.13, QUARTZ, { rot: [Math.PI / 2 - 0.5, 0.35, 0], scale: [1.1, 0.95, 0.78] }),
        P.sphere(r * 0.16, '#FF9CC4', { at: [r * 0.55, r * 0.5, r * 0.5], scale: [1, 0.5, 1] }, 8),
      ],
      bag,
      1.5,
    ),
  )
  // The sparkle: a little white star that winks above its top edge (twinkle() turns it).
  const star = new Mesh(bag.add(new ShapeGeometry(starShape())), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.95, side: DoubleSide, depthWrite: false })))
  star.name = 'sparkle'
  star.position.set(r * 0.75, r * 0.85, r * 0.6)
  star.scale.setScalar(r * 1.4)
  star.renderOrder = 6
  g.add(star)
  return g
}

/** The rock's sparkle winks (grows and shrinks) and turns to face the camera `cam` if given. */
export function twinkle(rock: Group, t: number, cam?: { quaternion: Group['quaternion'] }) {
  const star = rock.getObjectByName('sparkle')
  if (!star) return
  const base = (star.userData.base ??= star.scale.x) as number
  const k = Math.max(0, Math.sin(t * 2.6)) ** 3
  star.visible = k > 0.05
  star.scale.setScalar(base * (0.4 + 0.9 * k))
  if (cam) {
    // (Facing the camera: undo the rock's own turn, then the camera's.)
    rock.updateWorldMatrix(true, false)
    star.quaternion.copy(rock.getWorldQuaternion(star.quaternion).invert().multiply(cam.quaternion))
  }
  star.rotateZ(t * 0.8)
}
