// A follow camera that frames a box: "these meters around Kaylee must fit on screen", in any shape of screen (iPad
// either way round, iPhone, a wide desktop window). The distance that fits is found once per shot and screen shape
// (it doesn't depend on where the box is), then the camera glides there.
//
// The top bar covers the top of the screen, so the view is extended upward by the bar's height (setViewOffset): the
// framing is centered in the part of the screen below the bar.
//
// The camera lab (?cam=1, lab/camera/) can change whatever shot the game asks for (`override`): the game keeps choosing
// its shots, the rig frames the changed one.
//
// Kaylee can turn it herself, the way Roblox does on the iPad (`turn`, `pinch`, from View3D and roam.ts): a shot that
// says how far (`roam`) lets a one-finger drag swing the camera around and a pinch move it in and out. Her turn stays
// put between shots (like Roblox's), only clamped to whatever the new shot allows.
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
  /** How far she may turn this shot herself (Roblox-style drag and pinch): degrees added to its yaw and pitch, and how
   *  far in and out (times the distance that fits). No `roam`: the camera is the game's alone. */
  roam?: Roam
}

export interface Roam {
  yaw: [min: number, max: number]
  pitch: [min: number, max: number]
  zoom: [min: number, max: number]
}

/** Her own turn of the camera, on top of the game's shot. */
export interface UserTurn {
  yaw: number
  pitch: number
  zoom: number
}

/** The camera lab's change to the game's shots. */
export interface CamOverride {
  /** nudge: `yaw` and `pitch` are added to the game's; lock: they replace them. */
  mode: 'nudge' | 'lock'
  yaw: number
  pitch: number
  /** Times the distance that fits the game's box (below 1: closer). */
  zoom: number
  /** Degrees of view, top to bottom (null: the game's lens). */
  fov: number | null
  /** Meters the look-at point moves: to the right across the screen, and up. */
  px: number
  py: number
}

/** Where the camera is aiming now (for the lab's readout and guides). */
export interface Framed {
  center: Vector3
  yaw: number
  pitch: number
  dist: number
  fov: number
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
  /** The camera lab's change (null: the game's shots as they are). */
  private over: CamOverride | null = null
  /** Seconds left of a snappy glide after the lab moved a slider. */
  private quick = 0
  /** Her own turn (drag and pinch), clamped to each shot's `roam`. */
  readonly user: UserTurn = { yaw: 0, pitch: 0, zoom: 1 }

  /** The lens in use: the lab's, the game's, or the house default. */
  get lens() {
    return this.over?.fov ?? this.fov ?? TUNE.fov
  }

  setSize(w: number, h: number, top: number) {
    this.w = Math.max(1, w)
    this.h = Math.max(1, h)
    this.top = Math.max(0, Math.min(top, h * 0.4))
    this.fits.clear()
    const c = this.camera
    c.fov = this.lens
    c.aspect = this.w / (this.h + this.top)
    c.setViewOffset(this.w, this.h + this.top, 0, 0, this.w, this.h)
    c.updateProjectionMatrix()
    this.place()
  }

  /** Aim at a new shot; `snap` jumps there at once (a deep link, a resize), otherwise the camera glides. */
  setShot(shot: Shot, snap = false) {
    this.goal = shot
    if (snap) {
      const a = this.aim(shot)
      this.cur.center.copy(a.center)
      this.cur.yaw = a.yaw
      this.cur.pitch = a.pitch
      this.cur.dist = a.dist
      this.place()
    }
  }

  /** The shot the game asks for now (before the lab's change). */
  get shot(): Shot | null {
    return this.goal
  }

  /** The camera lab changes every shot from now on (null: back to the game's). `snap` jumps there at once. */
  setOverride(o: CamOverride | null, snap = false) {
    const lens = this.lens
    this.over = o
    if (this.lens !== lens) this.setSize(this.w, this.h, this.top)
    this.quick = 0.4
    if (snap && this.goal) this.setShot(this.goal, true)
  }

  /** Where the camera is aiming now, after the lab's change (null: no shot yet). */
  framed(): Framed | null {
    if (!this.goal) return null
    return { ...this.aim(this.goal), fov: this.lens }
  }

  /** Her drag swings the camera (degrees: positive yaw goes around to the right, positive pitch looks from higher up).
   *  False when this shot can't be turned. */
  turn(dyaw: number, dpitch: number) {
    const r = this.goal?.roam
    if (!r) return false
    const u = this.user
    u.yaw = clampTo(u.yaw + dyaw, r.yaw)
    u.pitch = clampTo(u.pitch + dpitch, r.pitch)
    this.quick = Math.max(this.quick, 0.12)
    return true
  }

  /** Her pinch: `zoom` times the distance that fits (below 1: closer). */
  pinch(zoom: number) {
    const r = this.goal?.roam
    if (!r) return false
    this.user.zoom = clampTo(zoom, r.zoom)
    this.quick = Math.max(this.quick, 0.12)
    return true
  }

  /** Back to the game's own view (a new place, a deep link). */
  resetTurn() {
    this.user.yaw = this.user.pitch = 0
    this.user.zoom = 1
  }

  /** Can she turn the shot on screen now? */
  get turnable() {
    return !!this.goal?.roam
  }

  /** Forget cached fits (the ?debug panel changed the field of view). */
  refit() {
    this.fits.clear()
    if (this.camera.fov !== this.lens) this.setSize(this.w, this.h, this.top)
  }

  update(dt: number) {
    const g = this.goal
    if (!g) return
    // Right after a lab slider moved, the camera follows it at once (the game's own glides stay as they are).
    const lag = this.quick > 0 ? Math.min(this.lag, 0.06) : this.lag
    this.quick = Math.max(0, this.quick - dt)
    const k = 1 - Math.exp(-dt / Math.max(0.01, lag))
    const a = this.aim(g)
    this.cur.center.lerp(a.center, k)
    this.cur.yaw += (a.yaw - this.cur.yaw) * k
    this.cur.pitch += (a.pitch - this.cur.pitch) * k
    this.cur.dist += (a.dist - this.cur.dist) * k
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
    const a = this.aim(g)
    return this.cur.center.distanceToSquared(a.center) > 1e-4 || Math.abs(a.yaw - this.cur.yaw) > 0.05 || Math.abs(a.dist - this.cur.dist) > 0.02
  }

  /** The shot with the lab's change: where to look from, and how far. */
  private aim(shot: Shot) {
    const g = this.turned(shot)
    const o = this.over
    // (Turning keeps the distance that fits the game's own view, like Roblox's camera on its stick: no refit per degree.)
    if (!o) return { center: g.center, yaw: g.yaw, pitch: g.pitch, dist: this.fit(shot) * (g.zoom ?? 1) }
    const yaw = o.mode === 'lock' ? o.yaw : g.yaw + o.yaw
    const pitch = Math.max(-20, Math.min(89, o.mode === 'lock' ? o.pitch : g.pitch + o.pitch))
    const dist = this.fit({ ...g, yaw, pitch }) * o.zoom * (g.zoom ?? 1)
    const y = yaw * deg
    const center = g.center.clone()
    center.x += Math.cos(y) * o.px
    center.z -= Math.sin(y) * o.px
    center.y += o.py
    return { center, yaw, pitch, dist }
  }

  /** The game's shot with her own turn on it (clamped to what it allows; the clamp sticks, so a turn never winds up
   *  past the edge and then has to be unwound). */
  private turned(g: Shot): Shot & { zoom?: number } {
    const r = g.roam
    if (!r) return g
    const u = this.user
    u.yaw = clampTo(u.yaw, r.yaw)
    u.pitch = clampTo(u.pitch, r.pitch)
    u.zoom = clampTo(u.zoom, r.zoom)
    if (!u.yaw && !u.pitch && u.zoom === 1) return g
    return { ...g, yaw: g.yaw + u.yaw, pitch: Math.max(-20, Math.min(85, g.pitch + u.pitch)), zoom: u.zoom }
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

const clampTo = (v: number, [lo, hi]: [number, number]) => Math.max(lo, Math.min(hi, v))
