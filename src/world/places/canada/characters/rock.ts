// Ollie's lucky rock (planning/around-the-world/canada-round-2.md): every sea otter keeps a favorite stone in a pocket
// of skin under her arm and juggles it, and Ollie's is why she has the fastest pass. A wave-worn grey pebble with an embedded
// quartz vein and a little four-pointed sparkle that twinkles,
// so it reads as special next to any other rock. One mesh and one outline, plus the sparkle.
//
//   const rock = makeRock(bag, 0.09)      // r: its radius in meters (a sea otter's paw is about 0.1 m)
//   paw.add(rock)                         // its middle is the rock's middle
//   twinkle(rock, t)                      // each frame: the sparkle winks and turns
//
// Used by Whale Peek-a-Boo (the game and its films); the map and the big game can use it too.
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { P, solid } from '../../../engine3d/geo'

/** Colour the quartz and mineral flecks on the pebble's own surface, so the vein stays flush on every side. */
function pebble(r: number) {
  const stone = P.sphere(1, '#807C7F', {}, 48)
  const pos = stone.attributes.position
  const colors = stone.attributes.color
  const base = new Color('#6D6C73')
  const light = new Color('#9E9893')
  const quartz = new Color('#E2DCD0')
  const tint = new Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    const dent = 1 + 0.063 * Math.sin(4 * x + 2 * y) * Math.cos(3 * z - y)
    pos.setXYZ(i, r * (x * 1.12 * dent + 0.12 * y), r * y * 0.77 * dent, r * (z * 0.91 * dent - 0.08 * x))

    const grain = Math.cos(43 * x + 17 * z) * Math.sin(37 * y - 29 * z)
    const mottling = Math.sin(7 * x + 4 * z) * Math.sin(8 * y - 3 * z)
    const seam = y - 0.42 * x + 0.16 * z + 0.050 * Math.sin(6 * z + 2 * x)
    const vein = Math.max(0, 1 - Math.abs(seam) / (0.105 + 0.035 * mottling))
    tint.copy(base).lerp(light, 0.52 + 0.25 * mottling + 0.16 * grain)
    tint.lerp(quartz, Math.min(1, vein * 1.55))
    colors.setXYZ(i, tint.r, tint.g, tint.b)
  }
  stone.computeVertexNormals()
  return stone
}

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
  g.add(solid(pebble(r), bag, 1.1, '#48444D'))
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
