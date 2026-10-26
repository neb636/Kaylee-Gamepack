// The wardrobe toy in Kaylee's room (planning/around-the-world/thailand/wardrobe.html, greybox 1). One verb: put it on
// her. Tap the wardrobe and she hops onto the rug in front of it, facing you, and its doors swing open. Tap a drawer
// and it slides out, its things popping up on the shelves. Drag a thing onto her (or just tap it: it flies over) and it
// pops on; drop a thing on a spot that's taken and the old one boings back to its shelf. Tap something she's wearing
// and it hops back to its shelf. The paint drawer holds pots: where she drops one decides what changes (her hair, her
// dress, her fur). Drag across her to spin her round (see the wings!); let go and she springs back to face you. Tap her
// and she twirls. Tap the doors (or anything else in the room, or the ✓) and she's done: the doors close.
//
// Every change is her look (characters/style.ts): the Hub saves it on the iPad (useSaved('thailand-look')) and the
// house dresses her in it (Avatar.setLook). Greybox: simple shapes (characters/closet/), no voices.
import { Box3, Group, Plane, Raycaster, Vector2, Vector3, type Object3D } from 'three'
import { buildClosetItem } from '../../../characters/closet'
import { ITEMS, itemById, PAINT_COLORS, PAINTS, withItem, withPaint, type PaintColor, type PaintPart, type Slot, type Style } from '../../../characters/style'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { Particles } from '../../../engine/particles'
import { sfx } from '../../../sfx'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { House, HousePlugin } from '../house'
import { DIM, WARDROBE_YAW } from '../layout'
import { DOOR_OPEN, DRAWER_OUT, DRAWERS, shelfSlot, type DrawerId } from './furniture'

const deg = Math.PI / 180
/** Kaylee's size over the 1 m model (model.ts's KAYLEE_SIZE): small things (the crown) stand on the shelf a bit
 *  bigger than on her, so they're easy to see and grab. */
const SIZE = 1.25
/** The biggest a thing stands on the shelf (meters across and up). */
const SHELF_W = 0.44
const SHELF_H = 0.4
/** Where each of her pivots is in her body (model meters), so a thing on the shelf is put together like on her. */
const PIVOTS: Record<string, [number, number, number]> = { head: [0, 0.44, 0.04], body: [0, 0, 0], legL: [-0.072, 0.16, 0.03], legR: [0.072, 0.16, 0.03], armL: [-0.11, 0.4, 0.04], armR: [0.11, 0.4, 0.04] }

const SPARKLE = ['#FF4F9A', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5', '#FFFFFF']
const PAINT_HEX = PAINT_COLORS.map((c) => PAINTS[c].hex)

/** What's in a drawer: her things for that spot, or the pots of paint. */
export function drawerThings(d: DrawerId): string[] {
  return d === 'paint' ? PAINT_COLORS.map((c) => `pot-${c}`) : ITEMS.filter((i) => i.slot === d).map((i) => i.id)
}
const thingDrawer = (id: string): DrawerId | null => (id.startsWith('pot-') ? 'paint' : (itemById(id)?.slot ?? null))
const potColor = (id: string) => id.slice(4) as PaintColor

/** The wardrobe's tap targets (the Hub lays them over the house with the house's own). */
export const WARDROBE_ANCHORS: AnchorInfo[] = [
  ...DRAWERS.map((d) => ({ id: `trip:ward:drawer:${d.id}`, label: `${d.name} drawer`, kind: 'thing' as const })),
  ...DRAWERS.flatMap((d) => drawerThings(d.id).map((id) => ({ id: `trip:ward:thing:${id}`, label: id.startsWith('pot-') ? `${PAINTS[potColor(id)].name} paint` : itemById(id)!.name, kind: 'thing' as const }))),
  ...(['head', 'face', 'back', 'outfit', 'feet'] as Slot[]).map((s) => ({ id: `trip:ward:on:${s}`, label: `Take off (${s})`, kind: 'thing' as const })),
]

interface Thing {
  id: string
  holder: Group
  /** 0..1 popping onto the shelf. */
  pop: number
}
interface Flight {
  thing: Thing
  from: Vector3
  to: Vector3
  t: number
  dur: number
  arc: number
  /** Lands back on the shelf (inside the wardrobe) or somewhere in the room. */
  home: boolean
  then?: () => void
}

export interface WardrobeEvents {
  /** The doors opened or closed, or another drawer opened (the Hub keeps the address bar on it). */
  onState(open: boolean, drawer: DrawerId | null): void
  /** She put something on, took it off or painted: save it. */
  onLook(style: Style): void
}

export class WardrobePlugin implements HousePlugin {
  private house!: House
  private root!: Object3D
  private inside!: Group
  private doors: Object3D[] = []
  private drawers = new Map<DrawerId, Object3D>()
  private open = false
  private doorK = 0
  private drawer: DrawerId | null = null
  private drawerK = new Map<DrawerId, number>()
  private things = new Map<string, Thing>()
  private flights: Flight[] = []
  private drag: { kind: 'thing' | 'spin' | null; id?: string; x: number; y: number; moved: boolean; lastX: number; lastY: number } | null = null
  private ray = new Raycaster()
  private sparkle!: Particles
  private paint!: Particles

  constructor(
    private events: WardrobeEvents,
    /** A deep link to the wardrobe: start with the doors open (and this drawer out). */
    private start: { open: boolean; drawer: DrawerId | null } = { open: false, drawer: null },
  ) {}

  attach(house: House) {
    this.house = house
    const parts = house.kit.parts
    this.root = house.kit.pokes.get('wardrobe')!
    this.inside = parts.get('wardrobe.inside') as Group
    this.doors = ['wardrobe.doorL', 'wardrobe.doorR'].map((n) => parts.get(n)!)
    for (const d of DRAWERS) this.drawers.set(d.id, parts.get(`wardrobe.drawer.${d.id}`)!)
    this.sparkle = new Particles({ kind: 'spray', count: 160, colors: SPARKLE, gravity: 2.5 }, house.kit.bag)
    this.paint = new Particles({ kind: 'spray', count: 120, colors: PAINT_HEX, gravity: 6 }, house.kit.bag)
    house.scene.add(this.sparkle.mesh, this.paint.mesh)
    if (this.start.open) {
      this.openUp(true)
      if (this.start.drawer) this.pull(this.start.drawer, true)
    }
  }

  private get kaylee() {
    return this.house.kaylee
  }
  private get style() {
    return this.kaylee.myLook
  }

  // ---------------------------------------------------------------- the doors and the drawers

  /** She's on the rug: the doors swing open and she turns to face you. */
  private openUp(now = false) {
    if (this.open) return
    this.open = true
    if (now) this.doorK = 1
    else sfx.latch()
    this.kaylee.face(WARDROBE_YAW * deg)
    this.kaylee.lookAway()
    if (now) this.house.snapCamera()
    this.events.onState(true, this.drawer)
  }

  /** The doors close, the drawers slide shut, and the camera goes back to following her. */
  close() {
    if (!this.open) return
    this.open = false
    this.drawer = null
    this.flights = []
    this.drag = null
    for (const t of this.things.values()) {
      if (t.holder.parent !== this.inside) this.inside.attach(t.holder)
      t.holder.visible = false
    }
    sfx.thump()
    this.kaylee.face(WARDROBE_YAW * deg)
    this.events.onState(false, null)
  }

  /** Pulls a drawer out (its things pop up on the shelves), or pushes it back if it's the one already out. */
  private pull(id: DrawerId, now = false) {
    if (this.drawer === id) {
      this.drawer = null
      sfx.thump()
    } else {
      this.drawer = id
      if (!now) sfx.rattle()
      const ids = drawerThings(id)
      ids.forEach((tid, i) => {
        const t = this.thing(tid)
        t.holder.position.copy(shelfSlot(i, ids.length))
        t.pop = now ? 1 : -i * 0.12
      })
    }
    this.showShelf()
    this.events.onState(true, this.drawer)
  }

  /** What's on the shelves: the open drawer's things, except what she's wearing. */
  private showShelf() {
    const on = new Set(Object.values(this.style.on))
    for (const t of this.things.values()) {
      if (this.flights.some((f) => f.thing === t) || this.drag?.id === t.id) continue
      t.holder.visible = this.open && !!this.drawer && thingDrawer(t.id) === this.drawer && !on.has(t.id)
    }
  }

  /** A thing to stand on the shelf: built the first time its drawer opens. */
  private thing(id: string): Thing {
    let t = this.things.get(id)
    if (t) return t
    const holder = new Group()
    const bag = this.house.kit.bag
    if (id.startsWith('pot-')) {
      // A pot of paint in its color: a round tub with a cream band round it, a dome of paint on top, a drip.
      const c = PAINTS[potColor(id)].hex
      holder.add(solid(merge([P.cyl(0.1, 0.088, 0.15, c, { at: [0, 0.075, 0] }, 20), P.cyl(0.102, 0.098, 0.04, '#FFF7F0', { at: [0, 0.07, 0] }, 20), P.sphere(0.092, c, { at: [0, 0.15, 0], scale: [1, 0.45, 1] }, 18), P.capsule(0.014, 0.035, c, { at: [0.03, 0.115, 0.093] })]), bag, 1.5))
    } else {
      const w = buildClosetItem(id, bag, 0)
      const model = new Group()
      if (w) {
        for (const [key, g] of Object.entries(w) as [string, Group | null | undefined][]) {
          if (!g) continue
          const holderAt = new Group()
          holderAt.position.set(...PIVOTS[key])
          holderAt.add(g)
          model.add(holderAt)
        }
      }
      model.traverse((o) => o.userData.upright && o.rotation.set(0, 0, 0))
      // Stand it on its base, centered, no bigger than the shelf has room for.
      model.updateMatrixWorld(true)
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      const k = Math.min(SIZE * 1.6, SHELF_W / Math.max(size.x, size.z * 0.8, 1e-3), SHELF_H / Math.max(size.y, 1e-3))
      const center = box.getCenter(new Vector3())
      model.position.set(-center.x * k, -box.min.y * k, -center.z * k)
      model.scale.setScalar(k)
      holder.add(model)
    }
    holder.userData.pick = `trip:ward:thing:${id}`
    holder.visible = false
    this.inside.add(holder)
    t = { id, holder, pop: 1 }
    this.things.set(id, t)
    return t
  }

  // ---------------------------------------------------------------- putting things on and taking them off

  /** On she goes: pop, sparkles, a little hop. A thing already on that spot boings back to its shelf. */
  private wear(id: string, at: Vector3) {
    const item = itemById(id)
    if (!item) return
    const old = this.style.on[item.slot]
    this.setStyle(withItem(this.style, id, true), true)
    sfx.pop()
    this.sparkle.burst(at.x, at.y, at.z, 22, 1.4, 1.8, 0.05)
    this.kaylee.react('hop')
    if (old && old !== id) {
      sfx.boing()
      this.backToShelf(old, at)
    }
    this.showShelf()
  }

  /** Off it comes, hopping back to its shelf (if its drawer is out; otherwise it sparkles away into the drawer). */
  private takeOff(slot: Slot) {
    const id = this.style.on[slot]
    if (!id) return
    const from = this.wornAt(slot)
    this.setStyle(withItem(this.style, id, false), false)
    sfx.boing()
    this.sparkle.burst(from.x, from.y, from.z, 12, 1, 1.4, 0.04)
    this.backToShelf(id, from)
    this.showShelf()
  }

  private backToShelf(id: string, from: Vector3) {
    if (thingDrawer(id) !== this.drawer) return
    const t = this.thing(id)
    const ids = drawerThings(this.drawer!)
    this.fly(t, from, this.inside.localToWorld(shelfSlot(ids.indexOf(id), ids.length)), true)
  }

  private paintOn(color: PaintColor, part: PaintPart, at: Vector3) {
    this.setStyle(withPaint(this.style, part, color), false)
    sfx.splash()
    this.paint.burst(at.x, at.y, at.z, 26, 1.3, 2.2, 0.05, PAINT_COLORS.indexOf(color))
    this.sparkle.burst(at.x, at.y + 0.1, at.z, 10, 0.8, 1.2, 0.04)
    this.kaylee.react('wiggle')
  }

  private setStyle(style: Style, show: boolean) {
    this.kaylee.setLook(style, show)
    this.events.onLook(style)
  }

  /** Where the thing on a spot is now (world), or her middle. */
  private wornAt(slot: Slot): Vector3 {
    const gs = this.kaylee.onSpot(slot)
    if (gs.length) {
      const box = new Box3()
      for (const g of gs) box.expandByObject(g)
      if (!box.isEmpty()) return box.getCenter(new Vector3())
    }
    return this.kaylee.position.clone().add(new Vector3(0, this.kaylee.height * 0.5, 0))
  }

  // ---------------------------------------------------------------- flights (a thing flying to her or home)

  private fly(t: Thing, from: Vector3, to: Vector3, home: boolean, then?: () => void) {
    this.flights = this.flights.filter((f) => f.thing !== t)
    this.house.scene.attach(t.holder)
    t.holder.position.copy(from)
    t.holder.visible = true
    t.pop = 1
    this.flights.push({ thing: t, from: from.clone(), to: to.clone(), t: 0, dur: 0.45, arc: 0.35, home, then })
  }

  // ---------------------------------------------------------------- touch

  private ndc(x: number, y: number) {
    const { w, h } = this.house.size
    return new Vector2((x / w) * 2 - 1, -(y / h) * 2 + 1)
  }

  /** What's under a screen point in the wardrobe: a drawer, a thing on the shelf, a door, or her (and what she's
   *  wearing there). */
  private under(x: number, y: number): string | null {
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    const targets: Object3D[] = [this.root, this.kaylee.root, ...[...this.things.values()].filter((t) => t.holder.visible).map((t) => t.holder)]
    for (const hit of this.ray.intersectObjects(targets, true)) {
      if (!chainVisible(hit.object)) continue
      for (let o: Object3D | null = hit.object; o; o = o.parent) {
        if (typeof o.userData.pick === 'string' && o.userData.pick.startsWith('trip:ward:thing:')) return o.userData.pick
        const item = this.kaylee.itemOf(o)
        if (item) return `trip:ward:on:${itemById(item)!.slot}`
        for (const [id, d] of this.drawers) if (d === o) return `trip:ward:drawer:${id}`
        if (this.doors.includes(o)) return 'trip:ward:doors'
        if (o === this.kaylee.root) return 'kaylee'
      }
    }
    return null
  }

  /** Which part of her a pot of paint landed on: what the finger is over (her hair and tail, her dress, her fur), or by
   *  height if it's just next to her. Null: it missed her. */
  private partAt(x: number, y: number, at: Vector3): PaintPart | null {
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    for (const hit of this.ray.intersectObject(this.kaylee.root, true)) {
      const o = hit.object
      if (o.userData.hull !== undefined || !chainVisible(o)) continue
      const item = this.kaylee.itemOf(o)
      if (item) {
        const slot = itemById(item)!.slot
        return slot === 'head' || slot === 'face' ? 'hair' : slot === 'outfit' || slot === 'back' ? 'dress' : 'fur'
      }
      if (/^(hair|tail|braid)/.test(o.name)) return 'hair'
      if (/^body/.test(o.name)) return 'dress'
      if (/^(face|arm|leg|ear|eye)/.test(o.name)) return 'fur'
    }
    if (!this.near(at)) return null
    const up = (at.y - this.kaylee.position.y) / SIZE
    return up > 0.5 ? 'hair' : up > 0.17 ? 'dress' : 'fur'
  }

  /** Is a point (on the drag plane) on her or close enough to count? */
  private near(at: Vector3) {
    const k = this.kaylee.position
    const up = at.y - k.y
    return Math.hypot(at.x - k.x, at.z - k.z) < 0.5 && up > -0.1 && up < this.kaylee.height * 1.15
  }

  /** Where the finger is on an upright plane through her, facing the camera (where a dragged thing goes). */
  private dragPoint(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    const n = this.house.rig.camera.getWorldDirection(new Vector3()).setY(0).normalize()
    const p = this.kaylee.position.clone().add(new Vector3(0, 0.6, 0))
    return this.ray.ray.intersectPlane(new Plane().setFromNormalAndCoplanarPoint(n, p), new Vector3())
  }

  pointerDown(x: number, y: number, id?: string) {
    if (!this.open) return false
    const what = id?.startsWith('trip:ward:') || id === 'kaylee' ? id : (this.under(x, y) ?? id)
    if (what?.startsWith('trip:ward:thing:')) {
      this.drag = { kind: 'thing', id: what.slice(16), x, y, moved: false, lastX: x, lastY: y }
      return true
    }
    if (what === 'kaylee' || what?.startsWith('trip:ward:on:')) {
      this.drag = { kind: 'spin', x, y, moved: false, lastX: x, lastY: y }
      return true
    }
    if (!what && this.onHer(x, y)) {
      this.drag = { kind: 'spin', x, y, moved: false, lastX: x, lastY: y }
      return true
    }
    // An anchor of something else in the house (another thing, someone in the family): the tap that follows ends
    // dressing up. Anything else (the floor, the wall) is hers to poke without losing the wardrobe.
    if (id && !what?.startsWith('trip:ward:') && id !== 'wardrobe') return false
    this.drag = { kind: null, x, y, moved: false, lastX: x, lastY: y }
    return true
  }

  /** Is a screen point over her (a box round her, a little bigger than she is)? */
  private onHer(x: number, y: number) {
    const cam = this.house.rig.camera
    const { w, h } = this.house.size
    const k = this.kaylee.position
    const toScreen = (v: Vector3) => {
      const p = v.clone().project(cam)
      return [(p.x + 1) * 0.5 * w, (1 - p.y) * 0.5 * h]
    }
    const [fx, fy] = toScreen(k)
    const [, ty] = toScreen(k.clone().add(new Vector3(0, this.kaylee.height * 1.1, 0)))
    const half = (fy - ty) * 0.34
    return y > ty && y < fy + 10 && Math.abs(x - fx) < half
  }

  pointerMove(x: number, y: number) {
    const d = this.drag
    if (!d) return false
    d.lastX = x
    d.lastY = y
    if (!d.moved && Math.hypot(x - d.x, y - d.y) < 14) return true
    if (!d.moved) {
      d.moved = true
      if (d.kind === 'thing' && d.id) {
        const t = this.thing(d.id)
        this.flights = this.flights.filter((f) => f.thing !== t)
        this.house.scene.attach(t.holder)
        t.holder.visible = true
        sfx.pop()
      }
    }
    if (d.kind === 'thing' && d.id) {
      const p = this.dragPoint(x, y)
      // Held a little above the finger, so she can see what she's carrying.
      if (p) this.things.get(d.id)!.holder.position.copy(p).add(new Vector3(0, 0.05, 0))
    } else if (d.kind === 'spin') {
      this.kaylee.face(WARDROBE_YAW * deg + (x - d.x) * 0.014)
    }
    return true
  }

  pointerUp() {
    const d = this.drag
    if (!d || !d.moved) return false
    this.drag = null
    if (d.kind === 'spin') {
      // Let go: she springs back to face you.
      this.kaylee.face(WARDROBE_YAW * deg)
      sfx.fwip()
      return true
    }
    if (d.kind !== 'thing' || !d.id) return true
    const t = this.thing(d.id)
    const at = t.holder.position.clone()
    if (d.id.startsWith('pot-')) {
      const part = this.partAt(d.lastX, d.lastY, at)
      if (part) this.paintOn(potColor(d.id), part, at)
      else sfx.boing()
      this.home(t, at)
      return true
    }
    if (this.near(at) || this.partAt(d.lastX, d.lastY, at)) {
      t.holder.visible = false
      this.inside.attach(t.holder)
      this.wear(d.id, at)
    } else {
      // Missed her: it floats back to its shelf.
      sfx.boing()
      this.home(t, at)
    }
    return true
  }

  /** A thing goes back to its place on the shelf. */
  private home(t: Thing, from: Vector3) {
    const dr = thingDrawer(t.id)
    if (!dr || dr !== this.drawer) {
      t.holder.visible = false
      this.inside.attach(t.holder)
      return
    }
    const ids = drawerThings(dr)
    this.fly(t, from, this.inside.localToWorld(shelfSlot(ids.indexOf(t.id), ids.length)), true)
  }

  tap(x: number, y: number, id?: string) {
    this.drag = null
    if (!this.open) {
      if (id !== 'wardrobe') return false
      // Over to the rug in front of it, then the doors open.
      this.house.pokeThing('wardrobe')
      const { rug } = DIM.wardrobe
      const k = this.kaylee.position
      if (Math.hypot(k.x - rug.x, k.z - rug.z) < 0.15) this.openUp()
      else if (!this.house.walkTo([rug.x, rug.z], () => this.openUp())) return false
      return true
    }
    const what = id?.startsWith('trip:ward:') ? id : (this.under(x, y) ?? (this.onHer(x, y) ? 'kaylee' : id))
    // The floor or the wall: nothing happens (a stray touch doesn't shut the wardrobe on her).
    if (!what) return true
    if (what.startsWith('trip:ward:drawer:')) {
      this.pull(what.slice(17) as DrawerId)
      return true
    }
    if (what.startsWith('trip:ward:thing:')) {
      // A quick tap: it flies onto her (a pot paints her dress).
      const tid = what.slice(16)
      const t = this.thing(tid)
      const from = t.holder.getWorldPosition(new Vector3())
      const k = this.kaylee.position
      if (tid.startsWith('pot-')) {
        const to = new Vector3(k.x, k.y + 0.32 * SIZE, k.z)
        this.fly(t, from, to, false, () => {
          this.paintOn(potColor(tid), 'dress', to)
          this.home(t, to)
        })
      } else {
        const to = new Vector3(k.x, k.y + this.kaylee.height * 0.6, k.z)
        this.fly(t, from, to, false, () => {
          t.holder.visible = false
          this.inside.attach(t.holder)
          this.wear(tid, to)
        })
      }
      sfx.fwip()
      return true
    }
    if (what.startsWith('trip:ward:on:')) {
      this.takeOff(what.slice(13) as Slot)
      return true
    }
    if (what === 'kaylee') {
      this.kaylee.twirl()
      sfx.giggle()
      return true
    }
    if (what === 'trip:ward:doors' || what === 'wardrobe') {
      this.close()
      return true
    }
    // Anything else: done here (the house takes the tap).
    this.close()
    return false
  }

  // ---------------------------------------------------------------- per frame

  shot(): Shot | null {
    if (!this.open) return null
    const { rug } = DIM.wardrobe
    const { w, h } = this.house.size
    const tall = w < h
    // The wardrobe and her beside it, side by side across the screen (the box is the wardrobe's front and the rug).
    return {
      // (A tall screen is narrow: the wardrobe's far door may go off the edge, the shelves and drawers stay.)
      center: new Vector3(-2.1, DIM.g0 + (tall ? 0.85 : 1.0), (DIM.wardrobe.z + rug.z) / 2 + (tall ? 0 : 0.2)),
      half: new Vector3(0.5, 1.0, tall ? 1.22 : 1.4),
      yaw: WARDROBE_YAW,
      pitch: 9,
      minDist: 2.2,
    }
  }

  update(dt: number) {
    this.doorK += ((this.open ? 1 : 0) - this.doorK) * (1 - Math.exp(-dt * 7))
    const ease = this.doorK
    this.doors[0].rotation.y = -DOOR_OPEN * ease
    this.doors[1].rotation.y = DOOR_OPEN * ease
    for (const [id, d] of this.drawers) {
      const k0 = this.drawerK.get(id) ?? 0
      const k = k0 + ((this.drawer === id ? 1 : 0) - k0) * (1 - Math.exp(-dt * 10))
      this.drawerK.set(id, k)
      const base = d.userData.base as Vector3
      d.position.z = base.z + DRAWER_OUT * k
    }
    for (const t of this.things.values()) {
      if (t.pop >= 1) continue
      t.pop = Math.min(1, t.pop + dt / 0.35)
      const e = Math.max(0, t.pop)
      t.holder.scale.setScalar(Math.max(0.01, e < 0.7 ? (e / 0.7) * 1.15 : 1.15 - 0.15 * ((e - 0.7) / 0.3)))
    }
    for (const f of [...this.flights]) {
      f.t = Math.min(1, f.t + dt / f.dur)
      const e = f.t * f.t * (3 - 2 * f.t)
      const p = f.thing.holder.position.lerpVectors(f.from, f.to, e)
      p.y += Math.sin(Math.PI * f.t) * f.arc
      if (f.t >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        if (f.home) {
          this.inside.attach(f.thing.holder)
          sfx.thump()
        }
        f.then?.()
        this.showShelf()
      }
    }
    this.sparkle.update(dt)
    this.paint.update(dt)
  }

  anchor(id: string) {
    if (!id.startsWith('trip:ward:') || !this.open || this.house.view !== 'upstairs') return null
    if (id.startsWith('trip:ward:drawer:')) {
      const d = this.drawers.get(id.slice(17) as DrawerId)
      return d ? { at: d.getWorldPosition(new Vector3()), r: 0.2 } : null
    }
    if (id.startsWith('trip:ward:thing:')) {
      const t = this.things.get(id.slice(16))
      if (!t || !t.holder.visible || this.flights.some((f) => f.thing === t)) return null
      return { at: t.holder.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), r: 0.16 }
    }
    if (id.startsWith('trip:ward:on:')) {
      const slot = id.slice(13) as Slot
      if (!this.kaylee.onSpot(slot).length) return null
      return { at: this.wornAt(slot), r: 0.12 }
    }
    return null
  }

  hides(id: string) {
    // While she's dressing up, the wardrobe's own targets stand in for its house one.
    return this.open && id === 'wardrobe'
  }

  get roots(): Object3D[] {
    return [...this.things.values()].filter((t) => t.holder.visible).map((t) => t.holder)
  }

  get busy() {
    return this.flights.length > 0 || this.sparkle.busy || this.paint.busy || Math.abs(this.doorK - (this.open ? 1 : 0)) > 0.002 || [...this.drawerK].some(([id, k]) => Math.abs(k - (this.drawer === id ? 1 : 0)) > 0.002) || [...this.things.values()].some((t) => t.pop < 1)
  }

  qa() {
    return { wardrobe: this.open, drawer: this.drawer }
  }
}

function chainVisible(o: Object3D | null): boolean {
  for (let x = o; x; x = x.parent) if (!x.visible) return false
  return !!o
}
