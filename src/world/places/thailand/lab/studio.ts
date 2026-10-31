// The character lab's 3D studio (#/world/characters): one character, or a lineup of them, standing on a soft floor in a
// plain backdrop, in the house's exact look (toon bands, ink outlines, blob shadows). The camera orbits, pans and
// zooms; a turntable spins them; poses, actions and the photo poses play on everyone in the lineup; and it can hand back
// a PNG of the view, a filmstrip of the last action, or little portraits for the variations popover.
//
// CharacterLab.tsx owns the state (it lives in the URL) and pushes it here with apply(); the studio reports the camera
// back after a drag (onOrbit) so a shared link opens on the same view.
import { Box3, CircleGeometry, Color, Group, Mesh, MeshBasicMaterial, Plane, Raycaster, Scene, Vector2, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { clamp, say } from '../../../../sdk'
import { applyPose, clearPose } from '../activities/boat-trip/bay/poses'
import { buildBird, buildCat, buildCrab, buildLizard, buildMacaque, buildMudskipper, buildNeedlefish, buildPorpoise, type Blink, type CritterId } from '../activities/boat-trip/bay/critters'
import { Avatar, SHOW_SECS } from '../characters/avatar'
import { kayleeModel, loadKayleeModel } from '../characters/model'
import { Member } from '../characters/member'
import type { Wearable } from '../characters/looks'
import { parseLook, type ShowPose } from '../characters/style'
import type { Pose } from '../characters/types'
import { CameraRig, type Shot } from '../../../engine3d/camera'
import { Bag } from '../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../engine3d/geo'
import { setOutlineResolution } from '../../../engine3d/outline'
import { photoCamera, snapPhoto } from '../../../engine3d/photo'
import { applyBands, makeLights } from '../../../engine3d/toon'
import { TUNE } from '../../../engine3d/tune'
import type { World3D } from '../../../engine3d/View3D'
import { sfx } from '../sfx'
import { castById, linesFor, type CastEntry, type Variant } from './catalog'

export type Tool = 'select' | 'pan' | 'look'
export type ShotKind = 'body' | 'face' | 'lineup'
export type Action = 'hop' | 'wave' | 'wiggle' | 'cheer' | 'heart' | 'silly'
export type Hideable = 'outline' | 'shadow' | 'floor' | 'sun' | 'ambient'

/** Seconds each action takes (the filmstrip spreads its frames over this, the loop waits this long plus a beat). */
export const ACTION_SECS: Record<Action, number> = { hop: 0.8, wave: 1.5, wiggle: 0.7, cheer: 2.8, heart: 2.8, silly: 2.8 }
/** Which poses each kind of character can hold (a family member stands, sits on the stool or lies down; Kaylee has more). */
export const POSES: Record<CastEntry['kind'], Pose[]> = {
  kaylee: ['stand', 'sit', 'lie', 'wai', 'peek', 'lookup', 'bounce'],
  member: ['stand', 'sit', 'lie'],
  critter: [],
}

/** Everything the lab's panels control, as CharacterLab.tsx keeps it. */
export interface StudioView {
  /** The lineup in order (always includes `selected`). */
  ids: string[]
  selected: string
  pose: Pose
  wear: Wearable[]
  /** Kaylee's own look from the wardrobe (style.ts's `crown,hearts,dress-mint`; empty: today's Kaylee). */
  look: string
  /** The big cousins hold their phones (off: they put them away). */
  phone: boolean
  wind: number
  spin: boolean
  spinSecs: number
  /** Quarter turns with a hold at each (like the house's family turntable) instead of a smooth spin. */
  steps: boolean
  slow: boolean
  tool: Tool
  shot: ShotKind
  zoom: number
  yaw: number
  pitch: number
  fov: number
  bg: string
  hide: Hideable[]
}

interface CritterRig {
  root: Group
  blink: Blink
  /** What a "wave" moves (a claw, wings, an arm, a tail). */
  wavers: { g: Group; axis: 'x' | 'y' | 'z'; amp: number; base: number }[]
}

interface Actor {
  entry: CastEntry
  key: string
  /** Studio-owned: its x in the lineup and the turntable's spin. */
  holder: Group
  bag: Bag
  char: Member | Avatar | null
  critter: CritterRig | null
  height: number
  width: number
  depth: number
  /** Lifted so a fish or a bird built around its middle sits on the floor. */
  lift: number
  stool: Group | null
  /** The pose they were last put in (a new pose places them again; anything else leaves them be). */
  posed: string
  photo: { kind: Action; t: number } | null
  poke: { kind: Action; t: number } | null
}

const deg = Math.PI / 180
const tmp = new Vector3()
const tmp2 = new Vector3()
const box = new Box3()

export class Studio implements World3D {
  readonly scene = new Scene()
  readonly rig = new CameraRig()
  stats = { fps: 0, p95: 0, calls: 0, tris: 0 }
  /** The camera moved by hand (drag, pan, pinch, wheel): the lab keeps it in the URL. */
  onOrbit: ((o: { yaw: number; pitch: number; zoom: number }) => void) | null = null
  /** Frames of the last action, for the filmstrip. */
  onFilm: ((frames: string[]) => void) | null = null
  /** Someone was tapped (the lab selects them). */
  onPick: ((id: string) => void) | null = null

  private bag = new Bag()
  private lights = makeLights(this.scene)
  private floor: Mesh
  private floorMat = new MeshBasicMaterial({ color: '#E7E7EA' })
  private actors: Actor[] = []
  private view: StudioView | null = null
  private w = 1
  private h = 1
  private time = 0
  private spinT = 0
  private pan = new Vector3()
  private yaw = 0
  private pitch = 8
  private zoom = 1
  private drag: { x: number; y: number; yaw: number; pitch: number; pan: Vector3 } | null = null
  private pinch: { d: number; zoom: number } | null = null
  private raycaster = new Raycaster()
  private lookPoint: Vector3 | null = null
  private last: { kind: Action; t: number } | null = null
  /** Repeat the last action. */
  loop = false
  private film: { frames: string[]; t: number; every: number; next: number } | null = null
  private disposed = false

  constructor(private renderer: WebGLRenderer) {
    applyBands()
    this.floor = new Mesh(this.bag.add(new CircleGeometry(1, 64)), this.bag.add(this.floorMat))
    this.floor.rotation.x = -Math.PI / 2
    this.floor.renderOrder = 0
    this.scene.add(this.floor)
    this.rig.lag = 0.22
  }

  // ---------------------------------------------------------------- state from the panels

  apply(v: StudioView) {
    const prev = this.view
    this.view = v
    this.scene.background = new Color(v.bg)
    this.floorMat.color.set(v.bg).offsetHSL(0, 0, -0.045)
    if (!prev || prev.yaw !== v.yaw || prev.pitch !== v.pitch || prev.zoom !== v.zoom) {
      this.yaw = v.yaw
      this.pitch = v.pitch
      this.zoom = v.zoom
    }
    if (prev && (prev.shot !== v.shot || prev.selected !== v.selected)) this.pan.set(0, 0, 0)
    if (!prev || prev.fov !== v.fov) {
      this.rig.fov = v.fov
      this.rig.setSize(this.w, this.h, 0)
    }
    // Who's on stage: build the new ones, drop the ones that left, keep the rest as they are.
    const keyOf = (id: string) => `${id}|${v.phone ? 'phone' : ''}|${castById(id)?.model && kayleeModel() ? 'model' : ''}`
    const keep = new Map(this.actors.map((a) => [a.key, a]))
    const next: Actor[] = []
    for (const id of v.ids) {
      const entry = castById(id)
      if (!entry) continue
      const key = keyOf(id)
      const old = keep.get(key)
      if (old) keep.delete(key)
      next.push(old ?? this.build(entry, key))
    }
    for (const a of keep.values()) this.drop(a)
    this.actors = next
    this.layout()
    for (const a of this.actors) this.pose(a, v)
    if (!v.spin && prev?.spin) this.spinT = 0
    this.applyHidden(v.hide)
  }

  /** Builds one character (or critter) into its own bag, standing at the origin facing the camera. */
  private build(entry: CastEntry, key: string): Actor {
    const bag = new Bag()
    const holder = new Group()
    let char: Member | Avatar | null = null
    let critter: CritterRig | null = null
    if (entry.kind === 'kaylee') {
      // The vinyl toy loads its model the first time; until then the code-built Kaylee stands in, then gets swapped.
      const model = entry.model ? kayleeModel() : null
      if (entry.model && !model) void loadKayleeModel().then(() => !this.disposed && this.view && this.apply(this.view))
      const k = new Avatar(bag, model)
      k.place(0, 0, 0, 0)
      char = k
    } else if (entry.kind === 'member' && entry.look) {
      char = new Member({ id: entry.id, name: entry.name, who: entry.who, height: entry.look.height, spot: null, pitch: 300 }, bag, entry.look, entry.voice)
      char.place(0, 0, 0, 0)
    } else if (entry.critter) critter = buildCritter(entry.critter, bag)
    const root = char?.root ?? critter!.root
    holder.add(root)
    if (critter && !hasBlob(root)) root.add(blobShadow(0.35, bag))
    char?.update(1 / 60, 0)
    // Measure standing (without the blob shadow, which is wider than they are).
    holder.updateMatrixWorld(true)
    box.makeEmpty()
    root.traverse((o) => {
      if (o instanceof Mesh && !isBlob(o) && o.userData.hull === undefined) box.expandByObject(o)
    })
    const lift = critter ? Math.max(0, -box.min.y) : 0
    root.position.y += lift
    for (const o of tagBlobs(root)) o.position.y = 0.012 - lift
    const a: Actor = {
      entry,
      key,
      holder,
      bag,
      char,
      critter,
      height: box.max.y - box.min.y,
      width: Math.max(0.25, box.max.x - box.min.x),
      depth: Math.max(0.25, box.max.z - box.min.z),
      lift,
      stool: null,
      posed: '',
      photo: null,
      poke: null,
    }
    this.scene.add(holder)
    return a
  }

  private drop(a: Actor) {
    this.scene.remove(a.holder)
    a.bag.dispose()
  }

  /** Side by side, in lineup order, a small gap apart. The floor grows to fit them. */
  private layout() {
    const gap = 0.35
    const total = this.actors.reduce((s, a) => s + a.width, 0) + gap * Math.max(0, this.actors.length - 1)
    let x = -total / 2
    for (const a of this.actors) {
      a.holder.position.set(x + a.width / 2, 0, 0)
      x += a.width + gap
    }
    const r = Math.max(1.4, total / 2 + 0.9)
    this.floor.scale.setScalar(r)
  }

  private pose(a: Actor, v: StudioView) {
    const c = a.char
    if (!c) return
    const can = POSES[a.entry.kind]
    const pose = can.includes(v.pose) ? v.pose : 'stand'
    const sit = pose === 'sit'
    const seat = 0.3 * a.height
    if (sit && !a.stool) {
      a.stool = solid(merge([P.cyl(0.2 * a.height, 0.18 * a.height, seat - 0.06, '#C9B5F7', { at: [0, (seat - 0.06) / 2, 0] }, 20), P.cyl(0.22 * a.height, 0.22 * a.height, 0.06, '#FF8FB8', { at: [0, seat - 0.03, 0] }, 20)]), a.bag, 2)
      a.holder.add(a.stool)
    }
    if (a.stool) a.stool.visible = sit
    const fresh = a.posed !== pose
    a.posed = pose
    if (c instanceof Avatar) {
      if (fresh) {
        c.place(0, sit ? seat : 0, 0, 0)
        c.setPose(pose)
      }
      c.wear(v.wear)
      c.setLook(parseLook(v.look))
    } else {
      if (fresh) c.place(0, sit ? seat - 0.1 * c.height : 0, 0, 0, pose)
      if (!v.phone && c.onPhone) c.putPhoneDown()
    }
    c.setWind(v.wind)
  }

  private applyHidden(hide: Hideable[]) {
    const off = new Set(hide)
    this.floor.visible = !off.has('floor')
    this.lights.sun.visible = !off.has('sun')
    this.lights.ambient.visible = !off.has('ambient')
    this.scene.traverse((o) => {
      if (!(o instanceof Mesh)) return
      if (o.userData.hull !== undefined) o.visible = !off.has('outline')
      else if (o.userData.blob) o.visible = !off.has('shadow')
    })
  }

  /** The light sliders changed TUNE: the outlines' width is a shared uniform. */
  retune() {
    setOutlineResolution(this.w, this.h)
    applyBands()
  }

  // ---------------------------------------------------------------- actions

  act(kind: Action, user = true) {
    for (const a of this.actors) {
      if (a.critter) a.poke = { kind, t: 0 }
      else if (kind === 'hop' || kind === 'wave' || kind === 'wiggle') a.char?.react(kind)
      // (The big cousins' hands stay on their phones.)
      else if (!(a.char instanceof Member && a.char.onPhone)) a.photo = { kind, t: 0 }
      if (a.char instanceof Avatar && a.char.pose === 'bounce' && kind === 'hop') a.char.bounceHigher()
    }
    if (kind === 'hop') sfx.boing()
    this.last = { kind, t: 0 }
    if (user) {
      const every = ACTION_SECS[kind] / 5
      this.film = { frames: [], t: 0, every, next: 0 }
    }
  }

  /** Kaylee shows off something she put on (the wardrobe's poses: style.ts's `pose` for each thing). */
  showOff(kind: ShowPose) {
    for (const a of this.actors) if (a.char instanceof Avatar) a.char.showOff(kind)
    this.film = { frames: [], t: 0, every: SHOW_SECS[kind] / 5, next: 0 }
  }

  /** Plays a line in the selected character's voice (their mouth moves with it). */
  speak(text: string) {
    const e = castById(this.view?.selected)
    if (e?.voice) void say({ text, voice: e.voice })
  }

  /** The current view as a PNG data URL. */
  snapshot(): string {
    this.render()
    return this.renderer.domElement.toDataURL('image/png')
  }

  /** Little portraits for the variations popover: each built on its own, shot once, then thrown away. */
  thumbs(entry: CastEntry, variants: Variant[]): string[] {
    const out: string[] = []
    for (const v of variants) {
      const e = (v.entry && castById(v.entry)) || entry
      const scene = new Scene()
      scene.background = new Color(this.view?.bg ?? '#F2F2F3')
      const lights = makeLights(scene)
      const a = this.build(e, 'thumb')
      this.scene.remove(a.holder)
      scene.add(a.holder)
      if (a.char instanceof Avatar) a.char.wear(v.wear ?? [])
      a.char?.update(1 / 60, 0)
      const h = Math.max(a.height, a.width * 0.75)
      const cy = a.height * 0.5
      lights.follow(0, cy, 0)
      const dist = (h * 0.56) / Math.tan(15 * deg) + a.depth / 2
      const cam = photoCamera(30, 0, cy + dist * 0.12, dist, 0, cy, 0)
      out.push(snapPhoto(this.renderer, scene, cam))
      scene.clear()
      a.bag.dispose()
    }
    // snapPhoto drew into the canvas: draw the studio over it before the screen shows it.
    this.render()
    return out
  }

  // ---------------------------------------------------------------- the frame

  get calm() {
    return false
  }

  setSize(w: number, h: number) {
    this.w = w
    this.h = h
    // The lab's toolbar and line bar sit outside the canvas: nothing to keep clear at the top.
    this.rig.setSize(w, h, 0)
    setOutlineResolution(w, h)
    this.rig.setShot(this.shot(), true)
  }

  update(dtReal: number) {
    const v = this.view
    const dt = dtReal * (v?.slow ? 0.25 : 1)
    this.time += dt
    if (v?.spin) {
      this.spinT += dt
      const turn = v.steps ? stepped(this.spinT / v.spinSecs) : (this.spinT / v.spinSecs) * Math.PI * 2
      for (const a of this.actors) a.holder.rotation.y = turn
    } else
      for (const a of this.actors) {
        // Ease back to facing the camera the short way round.
        const r = a.holder.rotation.y
        const goal = Math.round(r / (Math.PI * 2)) * Math.PI * 2
        a.holder.rotation.y += (goal - r) * (1 - Math.exp(-dtReal * 6))
      }
    for (const a of this.actors) this.tick(a, dt)
    if (this.loop && this.last) {
      this.last.t += dt
      if (this.last.t > ACTION_SECS[this.last.kind] + 0.6) this.act(this.last.kind, false)
    }
    if (this.film) this.film.t += dt
    this.rig.setShot(this.shot())
    this.rig.update(dtReal)
    // The sun stays on the camera's side, like in the house: whatever you look at is lit.
    const c = this.shot().center
    const y = this.rig.yaw * deg
    const { sun, ambient } = this.lights
    sun.target.position.copy(c)
    sun.position.set(c.x + 5 * Math.cos(y) + 7 * Math.sin(y), c.y + 10, c.z - 5 * Math.sin(y) + 7 * Math.cos(y))
    ambient.intensity = TUNE.ambient * Math.PI
    sun.intensity = TUNE.sun * Math.PI
  }

  private tick(a: Actor, dt: number) {
    if (a.char) {
      if (this.view?.tool === 'look' && this.lookPoint) a.char.lookAt(this.lookPoint.x, this.lookPoint.y, this.lookPoint.z)
      else a.char.lookAway()
      a.char.update(dt, this.time)
      if (a.photo) {
        const p = a.photo
        p.t += dt
        const dur = ACTION_SECS[p.kind]
        if (p.t < dur - 0.4) applyPose(a.char.rig, p.kind as 'cheer' | 'heart' | 'silly', p.t, Math.min(1, p.t / 0.35))
        else if (p.t < dur) {
          // Ease the arms back down, then let go.
          const k = 1 - Math.exp(-dt * 14)
          const { armL, armR, body, head } = a.char.rig
          for (const o of [armL.rotation, armR.rotation]) o.set(o.x * (1 - k), o.y, o.z * (1 - k))
          body.rotation.z *= 1 - k
          head.rotation.z *= 1 - k
        } else {
          clearPose(a.char.rig)
          a.char.rig.talk.visible = false
          a.char.rig.mouth.visible = true
          a.photo = null
        }
      }
      return
    }
    const cr = a.critter!
    cr.blink.update(dt)
    const breath = 1 + Math.sin(this.time * 2.4 + a.holder.position.x) * 0.02
    cr.root.scale.set(1 / Math.sqrt(breath), breath, 1 / Math.sqrt(breath))
    cr.root.position.y = a.lift
    cr.root.rotation.z = 0
    for (const w of cr.wavers) w.g.rotation[w.axis] = w.base
    const p = a.poke
    if (!p) return
    p.t += dt
    const k = clamp(p.t / ACTION_SECS[p.kind])
    if (p.kind === 'hop') {
      const air = clamp((k - 0.2) / 0.6)
      cr.root.position.y = a.lift + Math.sin(air * Math.PI) * 0.35 * Math.max(0.4, a.height)
      const sq = 1 - 0.18 * Math.sin(clamp(k / 0.2) * Math.PI) - 0.14 * Math.sin(clamp((k - 0.8) / 0.2) * Math.PI)
      cr.root.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))
    } else if (p.kind === 'wiggle' || !cr.wavers.length) cr.root.rotation.z = Math.sin(k * Math.PI * 6) * 0.16 * (1 - k)
    else for (const w of cr.wavers) w.g.rotation[w.axis] = w.base + Math.sin(k * Math.PI * 6) * w.amp * Math.sin(k * Math.PI)
    if (k >= 1) a.poke = null
  }

  /** Where the camera looks: one character's whole body or face, or the whole lineup. */
  private shot(): Shot {
    const v = this.view
    const sel = this.actors.find((a) => a.entry.id === v?.selected) ?? this.actors[0]
    const z = this.zoom
    let center: Vector3
    let half: Vector3
    if (!sel) {
      center = new Vector3(0, 0.5, 0)
      half = new Vector3(0.5, 0.5, 0.5)
    } else if (v?.shot === 'lineup' && this.actors.length > 1) {
      const first = this.actors[0].holder.position.x - this.actors[0].width / 2
      const lastA = this.actors[this.actors.length - 1]
      const last = lastA.holder.position.x + lastA.width / 2
      const h = Math.max(...this.actors.map((a) => a.height))
      const d = Math.max(...this.actors.map((a) => a.depth))
      center = new Vector3((first + last) / 2, h / 2, 0)
      half = new Vector3((last - first) / 2 + 0.1, h / 2 + 0.05, d / 2)
    } else if (v?.shot === 'face' && sel.char) {
      const rig = sel.char.rig
      rig.head.updateWorldMatrix(true, false)
      center = rig.head.localToWorld(tmp.set(0, rig.face.headY, 0)).clone()
      const R = rig.face.R
      half = new Vector3(R * 1.9, R * 1.7, R)
    } else if (v?.shot === 'face') {
      // A critter's face: the top half of it.
      center = new Vector3(sel.holder.position.x, sel.height * 0.6, sel.depth * 0.2)
      half = new Vector3(sel.width * 0.4, sel.height * 0.45, sel.depth * 0.35)
    } else {
      center = new Vector3(sel.holder.position.x, sel.height / 2, 0)
      half = new Vector3(Math.max(sel.width / 2, sel.height * 0.3), sel.height / 2, sel.depth / 2).multiplyScalar(1.18)
    }
    return { center: center.add(this.pan), half: half.divideScalar(z), yaw: this.yaw, pitch: this.pitch, minDist: 0.4, maxDist: 200 }
  }

  render() {
    const r = this.renderer
    r.render(this.scene, this.rig.camera)
    this.stats.calls = r.info.render.calls
    this.stats.tris = r.info.render.triangles
    const f = this.film
    if (f && f.t >= f.next) {
      f.frames.push(this.grab())
      f.next += f.every
      if (f.frames.length >= 6) {
        this.onFilm?.(f.frames)
        this.film = null
      }
    }
  }

  /** A small square around the selected character (a filmstrip frame). */
  private grab(): string {
    const src = this.renderer.domElement
    const sel = this.actors.find((a) => a.entry.id === this.view?.selected) ?? this.actors[0]
    const cam = this.rig.camera
    let cx = src.width / 2
    let cy = src.height / 2
    let s = Math.min(src.width, src.height) * 0.92
    if (sel) {
      const p = sel.holder.position
      const mid = tmp.set(p.x, sel.height * 0.5, p.z).project(cam)
      const top = tmp2.set(p.x, sel.height * 1.15, p.z).project(cam)
      cx = ((mid.x + 1) / 2) * src.width
      cy = ((1 - mid.y) / 2) * src.height
      s = clamp(Math.abs(top.y - mid.y) * src.height * 2.2, 60, Math.min(src.width, src.height))
    }
    const out = document.createElement('canvas')
    out.width = out.height = 160
    out.getContext('2d')?.drawImage(src, cx - s / 2, cy - s / 2, s, s, 0, 0, 160, 160)
    return out.toDataURL('image/jpeg', 0.8)
  }

  // ---------------------------------------------------------------- hands

  placeAnchors() {}
  setAnchorElements() {}

  pointerDown(x: number, y: number) {
    this.drag = { x, y, yaw: this.yaw, pitch: this.pitch, pan: this.pan.clone() }
  }
  pointerMove(x: number, y: number, downX: number, downY: number, held: boolean) {
    if (this.view?.tool === 'look') this.lookPoint = this.lookTarget(x, y)
    const d = this.drag
    if (!held || !d || this.pinch) return
    const dx = x - downX
    const dy = y - downY
    if (this.view?.tool === 'pan') {
      // Meters per pixel at the distance of what we're looking at.
      const dist = this.rig.camera.position.distanceTo(this.shot().center)
      const mpp = (2 * dist * Math.tan((this.rig.camera.fov * deg) / 2)) / this.h
      const right = tmp.set(1, 0, 0).applyQuaternion(this.rig.camera.quaternion)
      const up = tmp2.set(0, 1, 0).applyQuaternion(this.rig.camera.quaternion)
      this.pan.copy(d.pan).addScaledVector(right, -dx * mpp).addScaledVector(up, dy * mpp)
      this.rig.setShot(this.shot(), true)
    } else {
      this.yaw = d.yaw - dx * 0.4
      this.pitch = clamp(d.pitch + dy * 0.25, -15, 80)
      this.rig.setShot(this.shot(), true)
    }
  }
  pointerUp() {
    if (this.drag && (this.yaw !== this.drag.yaw || this.pitch !== this.drag.pitch)) this.reportOrbit()
    this.drag = null
  }

  /** Two fingers on the canvas: `ratio` is how much further apart they are than when the pinch began. */
  pinchZoom(ratio: number | null) {
    if (ratio === null) {
      if (this.pinch) this.reportOrbit()
      this.pinch = null
      return
    }
    this.pinch ??= { d: 1, zoom: this.zoom }
    this.zoom = clamp(this.pinch.zoom * ratio, 0.3, 6)
  }
  wheel(deltaY: number) {
    this.zoom = clamp(this.zoom * Math.exp(-deltaY * 0.0015), 0.3, 6)
    this.reportOrbit()
  }
  private reportOrbit() {
    this.onOrbit?.({ yaw: Math.round(this.yaw), pitch: Math.round(this.pitch), zoom: Math.round(this.zoom * 100) / 100 })
  }

  tap(x: number, y: number) {
    if (this.view?.tool !== 'select') return
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    const hit = this.raycaster.intersectObjects(this.actors.map((a) => a.holder), true).find((h) => !h.object.userData.blob && h.object.visible)
    const a = hit && this.actors.find((x) => isIn(hit.object, x.holder))
    if (!a) return
    this.onPick?.(a.entry.id)
    if (a.char) {
      a.char.react('hop')
      const lines = linesFor(a.entry.voice)
      if (lines.length) void say(lines[Math.floor(Math.random() * lines.length)])
    } else a.poke = { kind: 'hop', t: 0 }
    sfx.boing()
  }

  /** A point a little in front of the selected character's head, under the finger (the "look at me" tool). */
  private lookTarget(x: number, y: number): Vector3 | null {
    const sel = this.actors.find((a) => a.entry.id === this.view?.selected) ?? this.actors[0]
    if (!sel?.char) return null
    const head = sel.char.rig.head.getWorldPosition(new Vector3())
    const toCam = tmp2.copy(this.rig.camera.position).sub(head).normalize()
    const plane = new Plane().setFromNormalAndCoplanarPoint(toCam, head.clone().addScaledVector(toCam, 1.2))
    this.raycaster.setFromCamera(new Vector2((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1), this.rig.camera)
    return this.raycaster.ray.intersectPlane(plane, new Vector3())
  }

  qa() {
    const v = this.view
    return { selected: v?.selected, lineup: this.actors.map((a) => a.entry.id), pose: v?.pose, wear: v?.wear, look: v?.look, tool: v?.tool, shot: v?.shot, hide: v?.hide, yaw: this.yaw, pitch: this.pitch, zoom: this.zoom }
  }
  memory() {
    return { ...this.renderer.info.memory }
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    for (const a of this.actors) a.bag.dispose()
    this.actors = []
    this.scene.clear()
    this.bag.dispose()
  }
}

/** The house's family turntable: hold, then a smooth quarter turn, four times a lap. */
function stepped(laps: number) {
  const q = laps * 4
  const i = Math.floor(q)
  const f = clamp((q - i - 0.55) / 0.45)
  return (i + f * f * (3 - 2 * f)) * (Math.PI / 2)
}

function buildCritter(id: CritterId, bag: Bag): CritterRig {
  switch (id) {
    case 'crab': {
      const c = buildCrab(bag)
      return { root: c.root, blink: c.blink, wavers: [{ g: c.claw, axis: 'z', amp: 0.5, base: c.claw.rotation.z }] }
    }
    case 'eagle':
    case 'kingfisher': {
      const b = buildBird(bag, id)
      return { root: b.root, blink: b.blink, wavers: [{ g: b.wingL, axis: 'z', amp: -0.7, base: 0 }, { g: b.wingR, axis: 'z', amp: 0.7, base: 0 }] }
    }
    case 'macaque': {
      const m = buildMacaque(bag)
      return { root: m.root, blink: m.blink, wavers: [{ g: m.armR, axis: 'z', amp: 1.6, base: 0 }] }
    }
    case 'cat': {
      const c = buildCat(bag)
      return { root: c.root, blink: c.blink, wavers: [{ g: c.tail, axis: 'y', amp: 0.6, base: 0 }] }
    }
    case 'lizard': {
      const l = buildLizard(bag)
      return { root: l.root, blink: l.blink, wavers: [{ g: l.tail, axis: 'y', amp: 0.5, base: 0 }] }
    }
    case 'mudskipper':
      return { ...buildMudskipper(bag), wavers: [] }
    case 'needlefish':
      return { ...buildNeedlefish(bag), wavers: [] }
    case 'porpoise':
      return { ...buildPorpoise(bag), wavers: [] }
  }
}

/** Blob shadows are the only see-through plain meshes in a character. */
const isBlob = (o: Object3D) => o instanceof Mesh && o.material instanceof MeshBasicMaterial && o.material.transparent
function tagBlobs(root: Object3D): Mesh[] {
  const out: Mesh[] = []
  root.traverse((o) => {
    if (isBlob(o)) {
      o.userData.blob = true
      out.push(o as Mesh)
    }
  })
  return out
}
const hasBlob = (root: Object3D) => {
  let found = false
  root.traverse((o) => (found ||= isBlob(o)))
  return found
}
function isIn(o: Object3D | null, parent: Object3D) {
  for (let x = o; x; x = x.parent) if (x === parent) return true
  return false
}
