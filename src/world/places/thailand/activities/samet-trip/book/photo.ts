// Mommy's phone: a photo of what Kaylee sees, turned a little toward the animal she tapped (the phone finds it, the way
// a real one focuses), and how good it is: the animal big in the frame and near its middle earns a gold frame. And the
// book's portraits: each animal drawn once on its own, cut out, for its silhouette (before she finds it) and its sticker.
import { BufferGeometry, Color, Mesh, PerspectiveCamera, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { Bag } from '../../../../../engine3d/dispose'
import { setOutlineResolution } from '../../../../../engine3d/outline'
import { makeLights } from '../../../../../engine3d/toon'
import { ANIMAL_IDS, type AnimalId } from './animals'
import { portraitModel } from './models'

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

/** How well the animal fills the photo: its height on the photo (0..1 of the frame) and how far its middle is from
 *  the frame's middle (0 = dead center, 1 = at the edge). */
export function framing(cam: PerspectiveCamera, focus: Vector3, size: number) {
  const c = focus.clone().project(cam)
  const top = focus.clone().add(new Vector3(0, size * 0.5, 0)).project(cam)
  const bot = focus.clone().add(new Vector3(0, -size * 0.5, 0)).project(cam)
  const h = Math.abs(top.y - bot.y) / 2
  const off = Math.max(Math.abs(c.x), Math.abs(c.y))
  return { h, off, inFrame: c.z < 1 && off < 1 }
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

// ---------------------------------------------------------------- the portraits

const KEY = new Color('#FF00FF')
const PORTRAIT = 200

/** Every animal's portrait, cut out (transparent PNGs): drawn one after another in a little studio scene of their own,
 *  keyed off a magenta backdrop. Call from render() (before the frame draws over the canvas). */
export function portraits(renderer: WebGLRenderer, screen: { w: number; h: number }): Record<AnimalId, string> {
  const bag = new Bag()
  const scene = new Scene()
  scene.background = KEY
  const lights = makeLights(scene)
  lights.follow(0, 0, 0)
  const cam = new PerspectiveCamera(30, 1, 0.05, 50)
  const out = {} as Record<AnimalId, string>
  const canvas = renderer.domElement
  const pr = renderer.getPixelRatio()
  const full = { x: canvas.width / pr, y: canvas.height / pr }
  const px = Math.min(PORTRAIT, Math.floor(Math.min(full.x, full.y)))
  setOutlineResolution(px, px)
  const c2 = document.createElement('canvas')
  c2.width = c2.height = PORTRAIT
  const g2 = c2.getContext('2d', { willReadFrequently: true })
  for (const id of ANIMAL_IDS) {
    const m = portraitModel(bag, id)
    if (!m) continue
    const root: Object3D = m.root
    scene.add(root)
    root.updateMatrixWorld(true)
    // Frame it from a three-quarter front view, a little above.
    const yaw = id === 'parrotfish' || id === 'damselfish' || id === 'cuttlefish' ? 1.25 : 0.55
    const lo = new Vector3(Infinity, Infinity, Infinity)
    const hi = new Vector3(-Infinity, -Infinity, -Infinity)
    root.traverse((o) => {
      if (!(o instanceof Mesh) || o.userData.hull) return
      const p = (o.geometry as BufferGeometry).attributes.position
      const v = new Vector3()
      for (let i = 0; i < p.count; i++) {
        v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(o.matrixWorld)
        lo.min(v)
        hi.max(v)
      }
    })
    const c = lo.clone().add(hi).multiplyScalar(0.5)
    const r = Math.max(0.05, lo.distanceTo(hi) * 0.5)
    const dist = r / Math.sin((cam.fov * Math.PI) / 360) * 0.82
    cam.position.set(c.x + Math.sin(yaw) * dist * 0.94, c.y + dist * 0.28, c.z + Math.cos(yaw) * dist * 0.94)
    cam.lookAt(c)
    cam.updateMatrixWorld()
    renderer.setScissorTest(true)
    renderer.setViewport(0, 0, px, px)
    renderer.setScissor(0, 0, px, px)
    renderer.render(scene, cam)
    renderer.setScissorTest(false)
    g2?.clearRect(0, 0, PORTRAIT, PORTRAIT)
    g2?.drawImage(canvas, 0, canvas.height - px * pr, px * pr, px * pr, 0, 0, PORTRAIT, PORTRAIT)
    if (g2) {
      // Key out the magenta (and un-mix it from the soft edges).
      const img = g2.getImageData(0, 0, PORTRAIT, PORTRAIT)
      const d = img.data
      const kr = KEY.r * 255
      const kg = KEY.g * 255
      const kb = KEY.b * 255
      for (let i = 0; i < d.length; i += 4) {
        const dist2 = Math.hypot(d[i] - kr, d[i + 1] - kg, d[i + 2] - kb)
        const a = Math.min(1, Math.max(0, (dist2 - 40) / 120))
        if (a <= 0) {
          d[i + 3] = 0
          continue
        }
        if (a < 1) {
          d[i] = Math.min(255, Math.max(0, (d[i] - kr * (1 - a)) / a))
          d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - kg * (1 - a)) / a))
          d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - kb * (1 - a)) / a))
        }
        d[i + 3] = Math.round(a * 255)
      }
      g2.putImageData(img, 0, 0)
      out[id] = c2.toDataURL('image/png')
    }
    scene.remove(root)
  }
  renderer.setViewport(0, 0, full.x, full.y)
  setOutlineResolution(screen.w, screen.h)
  bag.dispose()
  return out
}
