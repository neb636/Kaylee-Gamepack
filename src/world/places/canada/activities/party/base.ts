// What the finale's two 3D worlds (the toy map of Animal Homes, the frozen canal of Pond Hockey) share: the scene, the
// camera, the lights, the bag of things to dispose, screen <-> world math and the tap targets laid over things.
import { Plane, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { CameraRig } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { applyBands, makeLights } from '../../../../engine3d/toon'

const tmp = new Vector3()
const tmp2 = new Vector3()

export abstract class Base3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  protected bag = new Bag()
  protected lights = makeLights(this.scene)
  protected anchorEls = new Map<string, HTMLElement>()
  protected hintEl: HTMLElement | null = null
  protected raycaster = new Raycaster()
  protected ground: Plane
  protected w = 1
  protected h = 1
  protected tall = false
  protected time = 0
  protected lastTouch = 0

  constructor(
    protected renderer: WebGLRenderer,
    groundY: number,
  ) {
    applyBands()
    this.ground = new Plane(new Vector3(0, 1, 0), -groundY)
  }

  protected abstract shot(): import('../../../../engine3d/camera').Shot

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
    this.tall = h > w
    this.rig.setSize(w, h, top)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }
  setAnchorElements(els: Map<string, HTMLElement>) {
    this.anchorEls = els
  }
  setHintElement(el: HTMLElement | null) {
    this.hintEl = el
  }
  render() {
    this.renderer.render(this.scene, this.rig.camera)
    this.stats.calls = this.renderer.info.render.calls
    this.stats.tris = this.renderer.info.render.triangles
  }
  memory() {
    return { ...this.renderer.info.memory }
  }
  dispose() {
    this.scene.clear()
    this.bag.dispose()
  }

  // ---- screen <-> world
  protected toScreen(v: Vector3) {
    const p = tmp2.copy(v).project(this.rig.camera)
    return { x: ((p.x + 1) / 2) * this.w, y: ((1 - p.y) / 2) * this.h, z: p.z }
  }
  protected groundAt(x: number, y: number, out: Vector3) {
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(this.ground, out)
  }
  /** How many screen pixels a meter is at this spot (for sizes on screen). */
  protected pxPerM(at: Vector3) {
    const a = this.toScreen(at)
    const b = this.toScreen(tmp.copy(at).setY(at.y + 1))
    return Math.abs(a.y - b.y) || 1
  }

  /** Puts a tap target over a thing `height` meters tall standing at `at` (null: hides it). */
  protected placeAnchor(el: HTMLElement, at: Vector3 | null, height: number, scale = 1.3) {
    const min = Math.min(this.w, this.h) < 500 ? 64 : 88
    let spot: { x: number; y: number; size: number } | null = null
    if (at) {
      const c = this.toScreen(tmp.copy(at).setY(at.y + height * 0.5))
      const cx = c.x
      const cy = c.y
      const top = this.toScreen(tmp.copy(at).setY(at.y + height))
      if (c.z < 1) spot = { x: cx, y: cy, size: Math.max(min, Math.min(this.w * 0.3, Math.abs(cy - top.y) * 2 * scale)) }
    }
    const show = !!spot && spot.x > 0 && spot.x < this.w && spot.y > 0 && spot.y < this.h
    if (show && spot) {
      el.style.transform = `translate3d(${(spot.x - spot.size / 2).toFixed(1)}px, ${(spot.y - spot.size / 2).toFixed(1)}px, 0)`
      el.style.width = el.style.height = `${spot.size.toFixed(0)}px`
    }
    const want = show ? '' : 'none'
    if (el.style.display !== want) el.style.display = want
  }

  /** The hint's hand: a drag from one screen point to another (null: hidden). */
  protected drawHint(from: Vector3 | null, to?: Vector3) {
    const el = this.hintEl
    if (!el) return
    if (!from) {
      if (el.style.display !== 'none') el.style.display = 'none'
      return
    }
    const a = this.toScreen(from)
    const b = to ? this.toScreen(to) : a
    el.style.display = ''
    el.dataset.kind = to ? 'drag' : 'press'
    el.style.transform = `translate3d(${a.x.toFixed(0)}px, ${a.y.toFixed(0)}px, 0)`
    el.style.setProperty('--dx', `${(b.x - a.x).toFixed(0)}px`)
    el.style.setProperty('--dy', `${(b.y - a.y).toFixed(0)}px`)
  }
}

export const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)
export function turn(from: number, to: number, k: number) {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + d * Math.min(1, k)
}
