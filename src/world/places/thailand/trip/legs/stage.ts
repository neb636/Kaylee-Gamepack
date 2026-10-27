// What every ride-along leg of a trip shares (Aunty Sri's car, the airport, the window seat): one 3D world in the
// house's look for engine3d/View3D.tsx, with a follow camera that frames a box, DOM tap targets laid over the things she
// can poke, a "do this" finger after a while with nothing touched, and little hops for the family (into a seat, up
// the plane's stairs). Each leg says what's where (anchorAt), where the camera looks (shot) and what a tap does (onTap).
import { Color, Object3D, Raycaster, Scene, Vector2, Vector3, type WebGLRenderer } from 'three'
import { bell, clamp, type Line } from '../../../../../sdk'
import { Avatar } from '../../characters/avatar'
import { FAMILY } from '../../characters/family'
import { Member } from '../../characters/member'
import { CameraRig, type Shot } from '../../../../engine3d/camera'
import { Bag } from '../../../../engine3d/dispose'
import { setOutlineResolution } from '../../../../engine3d/outline'
import { applyBands, makeLights, PAL } from '../../../../engine3d/toon'
import type { World3D } from '../../../../engine3d/View3D'
import { sfx } from '../../sfx'

/** What a leg tells the screen around it (BoatTrip.tsx). */
export interface LegEvents {
  /** Someone says something, in their own voice (lines.ts). */
  say(l: Line): void
  /** It moved on to another section in the same world (the address bar follows). */
  section(id: string): void
  /** The leg is over: the boarding pass, then this section. */
  done(next: string): void
}

export type Rider = Avatar | Member
export type Pose3 = 'sit' | 'stand' | 'lie'

/** Where a tap target is: a point in the world, a radius (meters) and whether it glows ("tap me!"). */
export interface AnchorSpot {
  at: Vector3
  r: number
  glow?: boolean
  /** Biggest it may get on screen (px). */
  max?: number
  /** Where tap targets overlap, the higher one gets the finger (small toys 3, things 2 by default, people 0). */
  prio?: number
}

/** Stopped and not touched for this long: a finger shows her what to do. */
const HINT_S = 7
const tmp = new Vector3()
const right = new Vector3()

export abstract class Stage implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  protected bag = new Bag()
  protected lights = makeLights(this.scene)
  protected w = 1
  protected h = 1
  protected time = 0
  protected lastTouch = 0
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  private anchorEls = new Map<string, HTMLElement>()
  private hintEl: HTMLElement | null = null
  private raycaster = new Raycaster()
  private hopper = new Hopper(this.scene)
  /** Touches so far (for QA). */
  protected touches = 0
  /** Unmounted (a timer that fires late must not build anything). */
  protected disposed = false

  constructor(
    protected renderer: WebGLRenderer,
    protected events: LegEvents,
  ) {
    this.scene.background = new Color(PAL.sky)
    applyBands()
  }

  /** The camera's goal now. */
  protected abstract shot(): Shot
  /** Where a tap target is now (null: hidden). */
  protected abstract anchorAt(id: string): AnchorSpot | null
  /** A tap on a tap target (`id`) or on the scene (`id` = what's under the finger, or null). */
  protected abstract onTap(id: string | null, x: number, y: number): void
  /** What a "do this" finger points at after a while with nothing touched. */
  protected hintAt(): Vector3 | null {
    return null
  }
  /** The leg's own frame (the camera, the anchors and the hops run around it). */
  protected abstract step(dt: number, t: number): void
  abstract qa(): Record<string, unknown>
  /** Roots to raycast for taps on the canvas (each tappable thing has userData.pick). */
  protected pickRoots(): Object3D[] {
    return []
  }

  /** The rides keep moving: the frame loop stays at full speed. */
  get calm() {
    return false
  }

  // ---------------------------------------------------------------- the family

  /** Kaylee and whoever comes along, built for this world (their mouths still move with their voices). */
  protected makeFamily(ids: string[]): { kaylee: Avatar; members: Map<string, Member> } {
    const kaylee = new Avatar(this.bag)
    const members = new Map<string, Member>()
    for (const id of ids) {
      const m = FAMILY.find((f) => f.id === id)
      if (m) members.set(id, new Member({ ...m, spot: null }, this.bag))
    }
    return { kaylee, members }
  }

  /** Puts someone somewhere at once (local to whatever they're in). */
  protected put(c: Rider, x: number, y: number, z: number, pose: Pose3, face = 0) {
    put(c, x, y, z, pose, face)
  }
  /** Someone hops from wherever they are to a spot on `parent` (a seat, the world). */
  protected hop(c: Rider, parent: Object3D, to: Vector3, opts: HopOpts = {}) {
    this.hopper.hop(c, parent, to, opts)
  }
  protected get hopping() {
    return this.hopper.busy
  }

  // ---------------------------------------------------------------- World3D

  setSize(w: number, h: number, top: number) {
    this.w = w
    this.h = h
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

  update(dt: number) {
    this.time += dt
    this.hopper.update(dt)
    this.step(dt, this.time)
    this.rig.setShot(this.shot())
    this.rig.update(dt)
  }

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
  }

  pointerDown() {
    this.lastTouch = this.time
  }
  pointerMove(_x: number, _y: number, _dx: number, _dy: number, _held: boolean) {}
  pointerUp() {}
  tap(x: number, y: number, id?: string) {
    this.lastTouch = this.time
    this.touches++
    this.onTap(id ?? this.pick(x, y), x, y)
  }

  /** What's under a screen point (the nearest thing with a userData.pick id). */
  protected pick(x: number, y: number): string | null {
    this.raycaster.setFromCamera(this.ndc(x, y), this.rig.camera)
    for (const hit of this.raycaster.intersectObjects(this.pickRoots(), true)) {
      let o: Object3D | null = hit.object
      while (o && o.userData.pick === undefined) o = o.parent
      if (o && visible(o)) return o.userData.pick as string
    }
    return null
  }
  protected ndc(x: number, y: number) {
    return new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1)
  }

  placeAnchors() {
    const cam = this.rig.camera
    right.set(1, 0, 0).applyQuaternion(cam.quaternion)
    for (const [id, el] of this.anchorEls) {
      const a = this.anchorAt(id)
      const s = a ? this.toScreen(a.at, a.r, a.max) : null
      if (s) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z + (a?.prio ?? (id.startsWith('family:') ? 0 : 2)) * 3000)
        const shadow = a?.glow ? '0 0 0 6px rgba(255,79,154,.55), 0 0 26px 10px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    const hint = this.hintEl
    if (hint) {
      const at = this.time - this.lastTouch > HINT_S ? this.hintAt() : null
      const s = at ? this.toScreen(at, 0.3) : null
      hint.style.display = s ? '' : 'none'
      if (s) hint.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
    }
  }

  protected toScreen(at: Vector3, r: number, max = 150) {
    const cam = this.rig.camera
    const center = at.clone().project(cam)
    if (center.z > 1 || Math.abs(center.x) > 1.02 || Math.abs(center.y) > 1.02) return null
    const edge = at.clone().addScaledVector(right, r).project(cam)
    return {
      x: ((center.x + 1) / 2) * this.w,
      y: ((1 - center.y) / 2) * this.h,
      size: clamp(Math.abs(edge.x - center.x) * this.w, 64, max),
      z: Math.round((1 - center.z) * 10000),
    }
  }

  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    this.disposed = true
    this.scene.clear()
    this.bag.dispose()
  }
}

function visible(o: Object3D | null) {
  for (let x = o; x; x = x.parent) if (!x.visible) return false
  return true
}

/** Puts someone somewhere at once (local to whatever they're in). A sitting Member sits lower by their own size. */
export function put(c: Rider, x: number, y: number, z: number, pose: Pose3, face = 0) {
  if (c instanceof Avatar) {
    c.place(x, y, z, face)
    c.setPose(pose)
  } else c.place(x, pose === 'sit' ? y - 0.1 * c.height : y, z, face, pose)
}

export interface HopOpts {
  pose?: Pose3
  face?: number
  delay?: number
  dur?: number
  arc?: number
  done?: () => void
}

interface Hop {
  c: Rider
  parent: Object3D
  to: Vector3
  o: HopOpts
  t: number
  delay: number
  from?: Vector3
}

/** Little hops for the family: from wherever they are to a spot on anything (a seat, a stair, the world), with a
 *  boing at the start and a wiggle and a thump when they land. */
export class Hopper {
  private hops: Hop[] = []
  constructor(private scene: Object3D) {}

  hop(c: Rider, parent: Object3D, to: Vector3, o: HopOpts = {}) {
    this.hops = this.hops.filter((h) => h.c !== c)
    this.hops.push({ c, parent, to: to.clone(), o, t: 0, delay: o.delay ?? 0 })
  }
  get busy() {
    return this.hops.length > 0
  }
  /** Is this one hopping (or waiting to)? */
  has(c: Rider) {
    return this.hops.some((h) => h.c === c)
  }

  update(dt: number) {
    for (const hp of [...this.hops]) {
      if (hp.delay > 0) {
        hp.delay -= dt
        continue
      }
      if (!hp.from) {
        this.scene.updateMatrixWorld()
        const root = hp.c.root
        hp.parent.attach(root)
        root.rotation.set(0, root.rotation.y, 0)
        root.scale.set(1, 1, 1)
        hp.from = root.position.clone()
        if (hp.c instanceof Member && hp.c.pose === 'sit') hp.from.y += 0.1 * hp.c.height
        sfx.boing()
      }
      hp.t += dt / (hp.o.dur ?? 0.42)
      const k = Math.min(1, hp.t)
      tmp.lerpVectors(hp.from, hp.to, k)
      tmp.y += bell(k) * (hp.o.arc ?? 0.6)
      put(hp.c, tmp.x, tmp.y, tmp.z, k < 1 ? 'stand' : (hp.o.pose ?? 'stand'), hp.o.face ?? 0)
      if (k >= 1) {
        this.hops.splice(this.hops.indexOf(hp), 1)
        hp.c.react('wiggle')
        sfx.thump()
        hp.o.done?.()
      }
    }
  }
}
