// A follow camera that frames a box: "these meters around Kaylee must fit on screen", in any shape of screen (iPad
// either way round, iPhone, a wide desktop window). The distance that fits is found once per shot and screen shape
// (it doesn't depend on where the box is), then the camera glides there.
//
// The top bar covers the top of the screen, so the view is extended upward by the bar's height (setViewOffset): the
// framing is centered in the part of the screen below the bar.
import { PerspectiveCamera, Vector3 } from 'three'
import { TUNE } from './tune'

export interface Shot {
  /** What the camera looks at. */
  center: Vector3
  /** Half the size of the box (meters, world axes) that must fit on screen, centered on `center`. */
  half: Vector3
  /** Degrees: 0 = straight down the street (looking toward -z), positive = from the right. */
  yaw: number
  /** Degrees above the horizon. */
  pitch: number
  minDist?: number
  maxDist?: number
  /** The box turns with the camera (a chase camera behind a boat): its x runs across the screen and its z away from the
   *  camera, so the fit is the same whichever way the camera faces. */
  follow?: boolean
}

const deg = Math.PI / 180

export class CameraRig {
  readonly camera = new PerspectiveCamera(TUNE.fov, 1, 0.3, 300)
  private w = 1
  private h = 1
  private top = 0
  private goal: Shot | null = null
  private cur = { center: new Vector3(), yaw: 0, pitch: 30, dist: 20 }
  private fits = new Map<string, number>()
  private probe = new PerspectiveCamera()
  /** Seconds to settle (shorter = snappier). */
  lag = 0.35
  /** Degrees of view, top to bottom (default: TUNE.fov). A chase camera behind a boat wants a wider lens than the
   *  dollhouse, so the horizon and the rock towers show. */
  fov: number | null = null

  setSize(w: number, h: number, top: number) {
    this.w = Math.max(1, w)
    this.h = Math.max(1, h)
    this.top = Math.max(0, Math.min(top, h * 0.4))
    this.fits.clear()
    const c = this.camera
    c.fov = this.fov ?? TUNE.fov
    c.aspect = this.w / (this.h + this.top)
    c.setViewOffset(this.w, this.h + this.top, 0, 0, this.w, this.h)
    c.updateProjectionMatrix()
    this.place()
  }

  /** Aim at a new shot; `snap` jumps there at once (a deep link, a resize), otherwise the camera glides. */
  setShot(shot: Shot, snap = false) {
    this.goal = shot
    if (snap) {
      this.cur.center.copy(shot.center)
      this.cur.yaw = shot.yaw
      this.cur.pitch = shot.pitch
      this.cur.dist = this.fit(shot)
      this.place()
    }
  }

  /** Forget cached fits (the ?debug panel changed the field of view). */
  refit() {
    this.fits.clear()
    if (this.camera.fov !== (this.fov ?? TUNE.fov)) this.setSize(this.w, this.h, this.top)
  }

  update(dt: number) {
    const g = this.goal
    if (!g) return
    const k = 1 - Math.exp(-dt / Math.max(0.01, this.lag))
    this.cur.center.lerp(g.center, k)
    this.cur.yaw += (g.yaw - this.cur.yaw) * k
    this.cur.pitch += (g.pitch - this.cur.pitch) * k
    this.cur.dist += (this.fit(g) - this.cur.dist) * k
    this.place()
  }

  /** Which way the camera faces now (degrees, never wrapped): a turning camera unwraps its next goal from this. */
  get yaw() {
    return this.cur.yaw
  }

  /** True while the camera is still noticeably moving toward its shot. */
  get moving() {
    const g = this.goal
    if (!g) return false
    return this.cur.center.distanceToSquared(g.center) > 1e-4 || Math.abs(g.yaw - this.cur.yaw) > 0.05 || Math.abs(this.fit(g) - this.cur.dist) > 0.02
  }

  private place() {
    const { center, yaw, pitch, dist } = this.cur
    this.camera.position.copy(center).add(offset(yaw, pitch, dist))
    this.camera.lookAt(center)
  }

  /** The smallest distance at which the whole box shows below the top bar (with a small margin). */
  fit(shot: Shot): number {
    const yaw = shot.follow ? 0 : shot.yaw
    const key = `${shot.half.x.toFixed(2)},${shot.half.y.toFixed(2)},${shot.half.z.toFixed(2)},${yaw.toFixed(2)},${shot.pitch.toFixed(2)},${shot.minDist},${shot.maxDist}`
    const cached = this.fits.get(key)
    if (cached !== undefined) return cached
    const p = this.probe
    p.fov = this.camera.fov
    p.aspect = this.camera.aspect
    p.updateProjectionMatrix()
    // The part of the (extended) view below the top bar, in normalized device coordinates.
    const yMax = ((this.h - this.top) / (this.h + this.top)) * 0.94
    const xMax = 0.94
    const v = new Vector3()
    const fits = (d: number) => {
      p.position.copy(offset(yaw, shot.pitch, d))
      p.lookAt(0, 0, 0)
      p.updateMatrixWorld()
      for (const sx of [-1, 1])
        for (const sy of [-1, 1])
          for (const sz of [-1, 1]) {
            v.set(sx * shot.half.x, sy * shot.half.y, sz * shot.half.z).project(p)
            if (v.z > 1 || Math.abs(v.x) > xMax || Math.abs(v.y) > yMax) return false
          }
      return true
    }
    let lo = shot.minDist ?? 2
    let hi = shot.maxDist ?? 120
    if (fits(lo)) hi = lo
    else for (let i = 0; i < 28; i++) {
      const mid = (lo + hi) / 2
      if (fits(mid)) hi = mid
      else lo = mid
    }
    this.fits.set(key, hi)
    return hi
  }
}

function offset(yaw: number, pitch: number, dist: number) {
  const y = yaw * deg
  const p = pitch * deg
  return new Vector3(Math.sin(y) * Math.cos(p), Math.sin(p), Math.cos(y) * Math.cos(p)).multiplyScalar(dist)
}
