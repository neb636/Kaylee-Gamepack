// A follow camera that frames a box: "these meters around Kaylee must fit on screen", in any shape of screen (iPad
// either way round, iPhone, a wide desktop window). The distance that fits is found once per shot and screen shape
// (it doesn't depend on where the box is), then the camera glides there.
//
// The top bar covers the top of the screen, so the view is extended upward by the bar's height (setViewOffset): the
// framing is centered in the part of the screen below the bar.
//
// A shot with `objectFit` frames its box the way CSS object-fit frames a picture ('contain' or 'cover'): the box's
// picture is centered below the bar on any screen shape, not just its middle point looked at. The floating 3D maps use it.
//
// The camera lab (?cam=1, lab/camera/) can change whatever shot the game asks for (`override`): the game keeps choosing
// its shots, the rig frames the changed one.
//
// Kaylee can turn it herself, the way Roblox does on the iPad (`turn`, `pinch`, from View3D and roam.ts): a shot that
// says how far (`roam`) lets a one-finger drag swing the camera around and a pinch move it in and out. Her turn stays
// put between shots (like Roblox's), only clamped to whatever the new shot allows.
//
// A cutscene can take the camera outright (`setCine`, from cinema.ts's Director): an eye, a look-at point and a lens
// every frame, no box to fit. Given null again, the rig picks up from wherever the cinema camera was and glides back to
// the game's shot.
import { PerspectiveCamera, Vector3 } from 'three'
import type { CineFrame } from './cinema'
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
  /** Frame the box the way CSS `object-fit` frames a picture, centered in the screen below the top bar on any screen
   *  shape: 'contain' (the whole box shows, with a small margin) or 'cover' (the box fills the screen and its edges may
   *  go off it). Centered on the box *as it looks from this angle*, not on `center`: a tilted board's near edge looks
   *  bigger than its far edge, so just looking at its middle leaves it sitting low (and off to one side when turned).
   *  Without it the rig looks straight at `center` and only fits the distance. For the floating 3D maps (docs/thailand-3d.md). */
  objectFit?: 'contain' | 'cover'
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
/** Seconds the glide back from the cinema camera takes to settle in. */
const HAND_BACK = 1.2

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
  /** The cinema camera's pose this frame (null: the game's shots). */
  private cine: CineFrame | null = null
  /** Seconds left of the slow glide from the cinema camera back to the game's shot. */
  private handBack = 0

  /** A cutscene takes the camera: this eye, look-at point and lens (null: back to the game's shots, gliding there from
   *  where the cinema camera was). Call it every frame the cinema camera is on. */
  setCine(f: CineFrame | null) {
    if (!f) {
      if (!this.cine) return
      // Pick up from the cinema camera's pose, so the glide back starts where it was.
      const c = this.cine
      const d = c.eye.clone().sub(c.look)
      const dist = Math.max(0.5, d.length())
      let yaw = Math.atan2(d.x, d.z) / deg
      const goal = this.goal ? this.aim(this.goal).yaw : yaw
      yaw += Math.round((goal - yaw) / 360) * 360
      this.cur.center.copy(c.look)
      this.cur.yaw = yaw
      this.cur.pitch = Math.asin(Math.max(-1, Math.min(1, d.y / dist))) / deg
      this.cur.dist = dist
      this.cine = null
      // (The lens stays the cinema camera's for now and blends back in update(): no pop.)
      this.handBack = HAND_BACK
      this.place()
      return
    }
    this.cine = f
  }

  /** The cinema camera has the shot. */
  get cinema() {
    return !!this.cine
  }

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
    if (this.cine) {
      const c = this.cine
      const d = c.eye.clone().sub(c.look)
      const dist = d.length()
      return { center: c.look.clone(), yaw: Math.atan2(d.x, d.z) / deg, pitch: Math.asin(d.y / Math.max(1e-6, dist)) / deg, dist, fov: c.fov }
    }
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
    if (!g) {
      if (this.cine) this.place()
      return
    }
    // Right after a lab slider moved, the camera follows it at once (the game's own glides stay as they are).
    // Back from a cutscene: a slow, eased glide (as long as the letterbox takes to open), not a snap.
    const lag = this.quick > 0 ? Math.min(this.lag, 0.06) : this.handBack > 0 ? Math.max(this.lag, 0.32 + 0.5 * (this.handBack / HAND_BACK)) : this.lag
    this.quick = Math.max(0, this.quick - dt)
    this.handBack = Math.max(0, this.handBack - dt)
    const k = 1 - Math.exp(-dt / Math.max(0.01, lag))
    // The lens blends back to the game's after a cutscene (and snaps once the glide is over).
    if (!this.cine && Math.abs(this.camera.fov - this.lens) > 1e-3) {
      this.camera.fov = this.handBack > 0 ? this.camera.fov + (this.lens - this.camera.fov) * k : this.lens
      this.camera.updateProjectionMatrix()
    }
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
    if (this.cine) return true
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
    if (!o) {
      const dist = this.fit(shot) * (g.zoom ?? 1)
      return { center: this.centered(g, g.yaw, g.pitch, dist), yaw: g.yaw, pitch: g.pitch, dist }
    }
    const yaw = o.mode === 'lock' ? o.yaw : g.yaw + o.yaw
    const pitch = Math.max(-20, Math.min(89, o.mode === 'lock' ? o.pitch : g.pitch + o.pitch))
    const dist = this.fit({ ...g, yaw, pitch }) * o.zoom * (g.zoom ?? 1)
    const y = yaw * deg
    const center = this.centered(g, yaw, pitch, dist)
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
    const c = this.cine
    if (c) {
      // The lab's lens still wins (so a lens can be tried on a cutscene too).
      const fov = this.over?.fov ?? c.fov
      if (Math.abs(this.camera.fov - fov) > 1e-3) {
        this.camera.fov = fov
        this.camera.updateProjectionMatrix()
      }
      this.camera.position.copy(c.eye)
      this.camera.lookAt(c.look)
      if (c.roll) this.camera.rotateZ(c.roll)
      return
    }
    const { center, yaw, pitch, dist } = this.cur
    this.camera.position.copy(center).add(offset(yaw, pitch, dist))
    this.camera.lookAt(center)
  }

  /** The part of the (extended) view below the top bar, in normalized device coordinates (its middle is 0, 0). */
  private get room() {
    return { x: 0.94, y: ((this.h - this.top) / (this.h + this.top)) * 0.94 }
  }

  /** The probe camera with the game camera's lens and shape. */
  private lensProbe() {
    const p = this.probe
    p.fov = this.lens
    p.aspect = this.camera.aspect
    p.updateProjectionMatrix()
    return p
  }

  /** An object-fit shot, seen from (yaw, pitch, dist): how far to slide the camera sideways and up (meters, along the
   *  screen) so the box's picture sits in the middle of the room below the bar, and how big that picture is then
   *  (half its width and height, in the same units as `room`). Null if part of the box is behind the camera. */
  private spread(half: Vector3, yaw: number, pitch: number, dist: number) {
    const p = this.lensProbe()
    p.position.copy(offset(yaw, pitch, dist))
    p.lookAt(0, 0, 0)
    const home = p.position.clone()
    const right = new Vector3(1, 0, 0).applyQuaternion(p.quaternion)
    const up = new Vector3(0, 1, 0).applyQuaternion(p.quaternion)
    const tanY = Math.tan((p.fov * deg) / 2)
    const tanX = tanY * p.aspect
    const v = new Vector3()
    let ax = 0
    let ay = 0
    let ex = 0
    let ey = 0
    // Sliding changes how near each corner is, so the middle moves a little each slide: a few rounds settle it.
    for (let i = 0; i < 5; i++) {
      p.position.copy(home).addScaledVector(right, ax).addScaledVector(up, ay)
      p.updateMatrixWorld()
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
      for (const sx of [-1, 1])
        for (const sy of [-1, 1])
          for (const sz of [-1, 1]) {
            v.set(sx * half.x, sy * half.y, sz * half.z).project(p)
            if (v.z > 1) return null
            x0 = Math.min(x0, v.x)
            x1 = Math.max(x1, v.x)
            y0 = Math.min(y0, v.y)
            y1 = Math.max(y1, v.y)
          }
      ex = (x1 - x0) / 2
      ey = (y1 - y0) / 2
      ax += ((x0 + x1) / 2) * dist * tanX
      ay += ((y0 + y1) / 2) * dist * tanY
    }
    return { ax, ay, ex, ey, right, up }
  }

  /** Where to look for this shot: `center`, or for an object-fit shot, slid so the box's picture is centered. */
  private centered(shot: Shot, yaw: number, pitch: number, dist: number) {
    const c = shot.center.clone()
    if (!shot.objectFit || shot.follow) return c
    const s = this.spread(shot.half, yaw, pitch, dist)
    return s ? c.addScaledVector(s.right, s.ax).addScaledVector(s.up, s.ay) : c
  }

  /** The distance that fits the box below the top bar (with a small margin): the smallest at which it all shows, or for
   *  `objectFit` (centered first) the one where it just contains the room or just covers it. */
  fit(shot: Shot): number {
    const yaw = shot.follow ? 0 : shot.yaw
    const mode = shot.follow ? undefined : shot.objectFit
    const key = `${shot.half.x.toFixed(2)},${shot.half.y.toFixed(2)},${shot.half.z.toFixed(2)},${yaw.toFixed(2)},${shot.pitch.toFixed(2)},${shot.minDist},${shot.maxDist},${mode}`
    const cached = this.fits.get(key)
    if (cached !== undefined) return cached
    const room = this.room
    if (mode) {
      // Contain: the bigger of width and height just fills its side; cover: the smaller does. Both shrink as the
      // camera backs off, so the search is the same as below.
      const fits = (d: number) => {
        const s = this.spread(shot.half, yaw, shot.pitch, d)
        if (!s) return false
        const rx = s.ex / room.x
        const ry = s.ey / room.y
        return (mode === 'cover' ? Math.min(rx, ry) : Math.max(rx, ry)) <= 1
      }
      const d = search(fits, shot.minDist ?? 2, shot.maxDist ?? 120)
      this.fits.set(key, d)
      return d
    }
    const p = this.lensProbe()
    const yMax = room.y
    const xMax = room.x
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

/** The smallest distance in [lo, hi] that `fits` (which stays true once it is true). */
function search(fits: (d: number) => boolean, lo: number, hi: number) {
  if (fits(lo)) return lo
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2
    if (fits(mid)) hi = mid
    else lo = mid
  }
  return hi
}

const clampTo =(v: number, [lo, hi]: [number, number]) => Math.max(lo, Math.min(hi, v))
