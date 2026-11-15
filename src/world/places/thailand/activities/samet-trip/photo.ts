// Photos taken inside the 3D world: a camera turned a little toward what the photo is of (Mom's sunset photo for
// Agong's wall), and a small JPEG of the scene from any camera (that photo; the island's pictures of its beaches).
import { PerspectiveCamera, Vector2, Vector3, type Scene, type WebGLRenderer } from 'three'

export const PHOTO_SIZE = { w: 480, h: 360 }

/** The photo's camera: the screen's, turned `aim` of the way toward `focus`, with the phone's slightly tighter lens. */
export function phoneCamera(screen: PerspectiveCamera, focus: Vector3 | null, aim: number, zoom: number) {
  const cam = new PerspectiveCamera(screen.fov / zoom, PHOTO_SIZE.w / PHOTO_SIZE.h, 0.3, 900)
  cam.position.copy(screen.position)
  const ahead = new Vector3(0, 0, -1).applyQuaternion(screen.quaternion)
  if (focus) {
    const d = focus.distanceTo(screen.position)
    const look = screen.position.clone().addScaledVector(ahead, d).lerp(focus, aim)
    cam.up.set(0, 1, 0)
    cam.lookAt(look)
  } else cam.quaternion.copy(screen.quaternion)
  cam.updateMatrixWorld()
  cam.updateProjectionMatrix()
  return cam
}

/** Draws the scene from `cam` into a small JPEG (the corner of the canvas, then the frame draws over it as usual). */
export function snap(renderer: WebGLRenderer, scene: Scene, cam: PerspectiveCamera) {
  const canvas = renderer.domElement
  const W = canvas.width
  const H = canvas.height
  const ratio = PHOTO_SIZE.w / PHOTO_SIZE.h
  let w = W
  let h = Math.round(W / ratio)
  if (h > H) {
    h = H
    w = Math.round(H * ratio)
  }
  const pr = renderer.getPixelRatio()
  const size = renderer.getSize(new Vector2())
  renderer.setScissorTest(true)
  renderer.setViewport(0, 0, w / pr, h / pr)
  renderer.setScissor(0, 0, w / pr, h / pr)
  renderer.render(scene, cam)
  const out = document.createElement('canvas')
  out.width = PHOTO_SIZE.w
  out.height = PHOTO_SIZE.h
  out.getContext('2d')?.drawImage(canvas, 0, H - h, w, h, 0, 0, PHOTO_SIZE.w, PHOTO_SIZE.h)
  renderer.setScissorTest(false)
  renderer.setViewport(0, 0, size.x, size.y)
  return out.toDataURL('image/jpeg', 0.84)
}
