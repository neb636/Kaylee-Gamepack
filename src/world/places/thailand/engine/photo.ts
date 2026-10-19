// A photo of the 3D world: the scene drawn once from a photo camera into a 4:3 corner of the canvas, copied straight into
// a small JPEG, then the frame is drawn over again as usual (call it before the world's render(), and the screen never
// shows the photo's frame). It reuses the screen's own shaders, so the first photo doesn't stall to compile new ones the
// way a render target would. Photos stay on the iPad: nothing is uploaded.
import { PerspectiveCamera, Vector2, type Scene, type WebGLRenderer } from 'three'

export const PHOTO = { w: 480, h: 360 }
const size = new Vector2()

/** A JPEG data URL of `scene` seen from `camera` (its aspect is set to 4:3). */
export function snapPhoto(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera): string {
  const canvas = renderer.domElement
  const W = canvas.width
  const H = canvas.height
  // The biggest 4:3 box that fits the canvas, in device pixels, at its bottom-left corner.
  let w = W
  let h = Math.round((W * 3) / 4)
  if (h > H) {
    h = H
    w = Math.round((H * 4) / 3)
  }
  const pr = renderer.getPixelRatio()
  renderer.getSize(size)
  camera.aspect = 4 / 3
  camera.clearViewOffset()
  camera.updateProjectionMatrix()
  renderer.setScissorTest(true)
  renderer.setViewport(0, 0, w / pr, h / pr)
  renderer.setScissor(0, 0, w / pr, h / pr)
  renderer.render(scene, camera)
  const out = document.createElement('canvas')
  out.width = PHOTO.w
  out.height = PHOTO.h
  out.getContext('2d')?.drawImage(canvas, 0, H - h, w, h, 0, 0, PHOTO.w, PHOTO.h)
  renderer.setScissorTest(false)
  renderer.setViewport(0, 0, size.x, size.y)
  return out.toDataURL('image/jpeg', 0.82)
}

/** A photo camera standing at (x, y, z) looking at (tx, ty, tz). */
export function photoCamera(fov: number, x: number, y: number, z: number, tx: number, ty: number, tz: number) {
  const cam = new PerspectiveCamera(fov, 4 / 3, 0.3, 700)
  cam.position.set(x, y, z)
  cam.lookAt(tx, ty, tz)
  cam.updateMatrixWorld()
  return cam
}
