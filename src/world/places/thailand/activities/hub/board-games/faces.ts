// The faces on the game table's buttons (the picker's cousins, the two turn faces): little pictures of their real 3D
// selves, taken once per visit with the house's own renderer in a tiny studio (a pastel background), so they match how
// they look in the house. A cousin is built on their own for it (their phone left out); Kaylee is borrowed for a moment,
// so her picture shows today's look from the wardrobe. Call these from the plugin's update (the next
// frame draws over the photo, like the wardrobe's mirror). Pictures stay on the iPad.
import { Color, Scene, Vector3 } from 'three'
import { merge, solid } from '../../../../../engine3d/geo'
import { buildAnimal, type Rig } from '../../../../../engine3d/characters/animal'
import { Bag } from '../../../../../engine3d/dispose'
import { photoCamera } from '../../../../../engine3d/photo'
import { makeLights } from '../../../../../engine3d/toon'
import { LOOKS } from '../../../characters/looks'
import type { House } from '../house'
import type { CousinId, UnicornColor } from './list'
import { unicornParts } from './pieces'

const SIZE = { w: 200, h: 200 }
/** Each face's background, matching its ring on the buttons. */
export const FACE_BG: Record<CousinId | 'kaylee', string> = { kaylee: '#EFE6FF', bb: '#FFE1EE', gan: '#FFE9DE', ken: '#DDF7EE' }

/** A camera in front of a rig's face (along the way it faces), framing the head. */
function faceCam(rig: Rig) {
  rig.root.updateMatrixWorld(true)
  const { R, headY } = rig.face
  const head = rig.head.localToWorld(new Vector3(0, headY, 0))
  const scale = rig.head.getWorldScale(new Vector3()).y
  const r = R * scale
  const dir = new Vector3(0, 0, 1).transformDirection(rig.root.matrixWorld).setY(0).normalize()
  // fov 30: the head fills about 80% of the picture.
  const d = (r * 1.3) / Math.tan((15 * Math.PI) / 180)
  return photoCamera(30, head.x + dir.x * d, head.y + r * 0.25, head.z + dir.z * d, head.x, head.y - r * 0.05, head.z)
}

/** One face in the little studio: `rig` stands at the origin facing the camera on a pastel background. */
function studio(house: House, rig: Rig, bg: string): string {
  const scene = new Scene()
  scene.background = new Color(bg)
  const lights = makeLights(scene)
  scene.add(rig.root)
  rig.root.updateMatrixWorld(true)
  const at = rig.head.localToWorld(new Vector3(0, rig.face.headY, 0))
  lights.follow(at.x, at.y, at.z)
  const img = house.snap(faceCam(rig), SIZE, scene)
  scene.remove(rig.root)
  return img
}

/** A cousin's face, from a copy built just for the picture (their phone left out), then thrown away. */
export function cousinFace(house: House, id: CousinId): string {
  const bag = new Bag()
  const look = LOOKS[id]
  const rig = buildAnimal({ ...look, extras: look.extras?.filter((e) => e !== 'phone') }, bag)
  const img = studio(house, rig, FACE_BG[id])
  bag.dispose()
  return img
}

/** Kaylee's face in today's look: the real Kaylee, borrowed for the picture and put straight back where she was. */
export function kayleeFace(house: House): string {
  const rig = house.kaylee.rig
  const root = rig.root
  const parent = root.parent
  const pos = root.position.clone()
  const rot = root.rotation.clone()
  root.position.set(0, 0, 0)
  root.rotation.set(0, 0, 0)
  const img = studio(house, rig, FACE_BG.kaylee)
  root.position.copy(pos)
  root.rotation.copy(rot)
  parent?.add(root)
  root.updateMatrixWorld(true)
  return img
}

/** Each unicorn piece's background on the color picker (a soft tint of its own color). */
export const PIECE_BG: Record<UnicornColor, string> = { pink: '#FFE1EE', lavender: '#EFE6FF', mint: '#DDF7EE', sunny: '#FFF6D6' }

/** A Unicorn-game piece, the very one that hops on the board, seen from the front and a little above (for the color
 *  picker's buttons), built just for the picture and thrown away. */
export function pieceFace(house: House, c: UnicornColor): string {
  const bag = new Bag()
  const scene = new Scene()
  scene.background = new Color(PIECE_BG[c])
  const lights = makeLights(scene)
  const piece = solid(merge(unicornParts(c)), bag, 1.5)
  // It faces +x on the board; turn it three-quarters toward the camera (on +z) so the face and horn show.
  // Ten times its size (about 90 cm), so the photo camera's near plane is well clear of it.
  piece.rotation.y = -0.9
  piece.scale.setScalar(10)
  scene.add(piece)
  piece.updateMatrixWorld(true)
  lights.follow(0, 0.5, 0)
  const img = house.snap(photoCamera(30, 0, 0.8, 2.3, 0, 0.5, 0), SIZE, scene)
  scene.remove(piece)
  bag.dispose()
  return img
}
