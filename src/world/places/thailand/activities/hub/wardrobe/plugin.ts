// The wardrobe toy in Kaylee's room (planning/around-the-world/thailand/wardrobe.html). One verb: put it on her. Tap the
// wardrobe (or the mirror button in the house's top bar, anywhere in the house: openHere) and she's on the rug beside
// it, facing you, and its doors swing open. Tap a drawer
// and it slides out, its things popping up on the shelves. Drag a thing onto her (or just tap it: it flies over) and it
// pops on and she shows it off (a curtsy for the crown, a flutter hop for wings: style.ts's `pose`); drop a thing on a
// spot that's taken and the old one boings back to its shelf. Tap something she's wearing
// and it hops back to its shelf. The paint drawer holds pots: where she drops one decides what changes (her hair, her
// dress, her fur). Drag across her to spin her round (see the wings!); let go and she springs back to face you. Tap her
// and she twirls; tap the mirror inside the door and she strikes a pose. Tap the doors (or anything else in the room, or
// the ✓) and she's done: the doors close.
//
// Gate 4, the full loop: Sparkle says what to do the first time and each thing's name the first time she touches it (and
// glints something after ~8 s with nothing touched); the family notice the look (notice.ts); the mirror takes a picture of
// her look and pins it to the left door (up to 4: drop one on her and she wears the whole look); Sparkle's wand floats by
// the rug (tap it: a surprise look); and silly landings are never wrong (a shoe on her head sits on her horn until it
// hops to her foot, glasses on her tail wiggle up to her face, paint on the mirror splats and drips off).
//
// Every change is her look (characters/style.ts): the Hub saves it on the iPad (useSaved('thailand-look')) and every
// scene dresses her in it (Avatar). Her things are built in characters/closet/.
import { Box3, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Plane, Raycaster, SRGBColorSpace, TextureLoader, Vector2, Vector3, type Object3D, type PerspectiveCamera } from 'three'
import { heart, star } from '../../../characters/closet/fit'
import { buildClosetItem } from '../../../characters/closet'
import { formatLook, ALL_ITEMS, HALLOWEEN_LOOKS, wardrobeItems, itemById, PAINT_COLORS, PAINT_PARTS, PAINTS, parseLook, SLOTS, withItem, withPaint, type PaintColor, type PaintPart, type Slot, type Style } from '../../../characters/style'
import type { Shot } from '../../../../../engine3d/camera'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { photoCamera } from '../../../../../engine3d/photo'
import { Particles } from '../../../../../engine3d/particles'
import { sfx } from '../../../sfx'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { House, HousePlugin } from '../house'
import { DIM, STARTS, WARDROBE_YAW } from '../layout'
import type { Line } from '../../../../../../sdk'
import { L } from '../../../lines'
import { markNew, type Kind } from '../notice'
import { isHalloweenDay } from '../../../../../../shell/season'
import { DOOR_MAX, DOOR_SIZE, type DoorPhoto } from './door'
import { DOOR_OPEN, DRAWER_OUT, DRAWERS, PHOTO_SIZE, photoPin, shelfRoom, shelfSlot, type DrawerId } from './furniture'

const deg = Math.PI / 180
/** Kaylee's size over the 1 m model (model.ts's KAYLEE_SIZE): small things (the crown) stand on the shelf a bit
 *  bigger than on her, so they're easy to see and grab. */
const SIZE = 1.25
/** How far in front of her (toward the camera, m) a dragged thing is carried, so her body never hides it. */
const DRAG_FRONT = 0.5
/** Where each of her pivots is in her body (model meters), so a thing on the shelf is put together like on her. */
const PIVOTS: Record<string, [number, number, number]> = { head: [0, 0.44, 0.04], body: [0, 0, 0], legL: [-0.072, 0.16, 0.03], legR: [0.072, 0.16, 0.03], armL: [-0.11, 0.4, 0.04], armR: [0.11, 0.4, 0.04] }

/** What Sparkle has already told her this visit (names, how-tos), like Guide's. */
const told = new Set<string>()
const isPhoto = (id: string) => id.startsWith('photo-')
const photoSlot = (id: string) => +id.slice(6)
/** Where the game's camera is, as a direction from her (WARDROBE_YAW): the pictures are taken from there. */
const TOWARD = new Vector3(Math.sin(WARDROBE_YAW * deg), 0, Math.cos(WARDROBE_YAW * deg))
/** Where Sparkle's wand floats: beside the wardrobe, between it and her rug (world x, z; y above her floor). */
const WAND_AT = { x: -1.75, z: -15.62 }
/** A bit of silliness is fine for this long between her hints (seconds with nothing touched). */
const IDLE_S = 8
const MAX_HINTS = 3

const SPARKLE = ['#FF4F9A', '#FFC83D', '#8FE3C8', '#A8DCFF', '#B9A6F5', '#FFFFFF']
const PAINT_HEX = PAINT_COLORS.map((c) => PAINTS[c].hex)

/** What's in a drawer: her things for that spot, or the pots of paint. */
export function drawerThings(d: DrawerId): string[] {
  return d === 'paint' ? PAINT_COLORS.map((c) => `pot-${c}`) : wardrobeItems().filter((i) => i.slot === d).map((i) => i.id)
}
const thingDrawer = (id: string): DrawerId | null => (id.startsWith('pot-') ? 'paint' : (itemById(id)?.slot ?? null))
const potColor = (id: string) => id.slice(4) as PaintColor

/** The wardrobe's tap targets (the Hub lays them over the house with the house's own). */
export const WARDROBE_ANCHORS: AnchorInfo[] = [
  ...DRAWERS.map((d) => ({ id: `trip:ward:drawer:${d.id}`, label: `${d.name} drawer`, kind: 'thing' as const })),
  ...ALL_ITEMS.map((item) => ({ id: `trip:ward:thing:${item.id}`, label: item.name, kind: 'thing' as const })),
  ...PAINT_COLORS.map((color) => ({ id: `trip:ward:thing:pot-${color}`, label: `${PAINTS[color].name} paint`, kind: 'thing' as const })),
  ...(['head', 'face', 'back', 'outfit', 'feet'] as Slot[]).map((s) => ({ id: `trip:ward:on:${s}`, label: `Take off (${s})`, kind: 'thing' as const })),
  { id: 'trip:ward:mirror', label: 'Mirror', kind: 'thing' as const },
  ...Array.from({ length: DOOR_MAX }, (_, i) => ({ id: `trip:ward:thing:photo-${i}`, label: 'Picture of a look', kind: 'thing' as const })),
  { id: 'trip:ward:wand', label: "Sparkle's wand", kind: 'thing' as const },
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

/** Paint on the mirror: a blob with a drip that runs down and slides off. */
interface Splat {
  g: Group
  drip: Group
  t: number
}

export interface WardrobeEvents {
  /** Sparkle says something (the Hub's Guide speaks it). */
  say(line: Line): void
  /** The pictures on the door changed: save them (oldest first). */
  onPhotos(list: DoorPhoto[]): void
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
  private mirror!: Object3D
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
  /** The pictures on the door, by place (null: an empty pin), and which places are oldest first. */
  private door: (DoorPhoto | null)[] = Array.from({ length: DOOR_MAX }, () => null)
  private age: number[] = []
  /** Things to do in a little while (seconds). */
  private later: { t: number; f: () => void }[] = []
  /** Something that sparkles for a moment to say "this one!" (a hint). */
  private glints: { at: () => Vector3 | null; t: number; next: number }[] = []
  private splats: Splat[] = []
  private wand!: Group
  private wandK = -1
  private wandN = 0
  /** The look she has on came from the wand (so it isn't pinned to the door when the wand changes it). */
  private wandLook = false
  private tail: Object3D | null | undefined
  /** Seconds since she last touched anything, and how many hints that's earned. */
  private idle = 0
  private hints = 0
  private dressed = 0
  private pictured = false
  /** Counting down to the picture (she strikes her pose first). */
  private snapIn = -1

  constructor(
    private events: WardrobeEvents,
    /** A deep link to the wardrobe: start with the doors open (and this drawer out), and these pictures on the door. */
    private start: { open: boolean; drawer: DrawerId | null; door?: DoorPhoto[] } = { open: false, drawer: null },
  ) {}

  attach(house: House) {
    this.house = house
    const parts = house.kit.parts
    this.root = house.kit.pokes.get('wardrobe')!
    this.inside = parts.get('wardrobe.inside') as Group
    this.doors = ['wardrobe.doorL', 'wardrobe.doorR'].map((n) => parts.get(n)!)
    this.mirror = parts.get('wardrobe.mirror')!
    for (const d of DRAWERS) this.drawers.set(d.id, parts.get(`wardrobe.drawer.${d.id}`)!)
    this.sparkle = new Particles({ kind: 'spray', count: 160, colors: SPARKLE, gravity: 2.5 }, house.kit.bag)
    this.paint = new Particles({ kind: 'spray', count: 120, colors: PAINT_HEX, gravity: 6 }, house.kit.bag)
    house.scene.add(this.sparkle.mesh, this.paint.mesh)
    this.wand = this.buildWand()
    house.scene.add(this.wand)
    for (const p of this.start.door ?? []) this.addPhoto(p, false)
    if (this.start.open) {
      this.openUp(true)
      if (this.start.drawer && this.drawer !== this.start.drawer) this.pull(this.start.drawer, true)
    }
  }

  /** Sparkle says it, once per visit. */
  private tell(key: string, line: Line) {
    if (told.has(key)) return
    told.add(key)
    this.events.say(line)
  }
  private after(sec: number, f: () => void) {
    this.later.push({ t: sec, f })
  }

  /** Are the doors open (the Hub keeps the address bar on it)? */
  get isOpen() {
    return this.open
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
    this.house.trying = true
    if (now) this.doorK = 1
    else sfx.latch()
    this.kaylee.face(WARDROBE_YAW * deg)
    this.kaylee.lookAway()
    if (now) this.house.snapCamera()
    this.idle = 0
    this.hints = 0
    this.wand.visible = true
    if (!this.drawer && isHalloweenDay()) this.pull('outfit', true)
    this.showShelf()
    this.events.onState(true, this.drawer)
    this.tell('open', L.wardrobe.open)
  }

  /** The mirror button (the house's top bar): a sparkle, and she's on the rug beside her wardrobe with its doors open,
   *  from anywhere in the house. */
  openHere() {
    if (this.open) return
    const { rug } = DIM.wardrobe
    this.house.teleport('upstairs', rug.x, rug.z, STARTS.wardrobe.face)
    this.openUp(true)
    const k = this.kaylee.position
    this.sparkle.burst(k.x, k.y + this.kaylee.height * 0.5, k.z, 40, 1.6, 1.6, 0.05)
    this.kaylee.twirl()
  }

  /** The doors close, the drawers slide shut, and the camera goes back to following her. */
  close() {
    if (!this.open) return
    this.open = false
    this.house.trying = false
    this.drawer = null
    this.flights = []
    this.later = []
    this.glints = []
    this.snapIn = -1
    this.drag = null
    this.wand.visible = false
    for (const t of this.things.values()) {
      this.park(t)
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
      if (!now) {
        sfx.rattle()
        this.tell(id === 'paint' ? 'paint' : 'drawer', id === 'paint' ? L.wardrobe.paint : L.wardrobe.drawer)
      }
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
      t.holder.visible = isPhoto(t.id) ? this.open : this.open && !!this.drawer && drawerThings(this.drawer).includes(t.id) && !on.has(t.id)
    }
  }

  /** A thing to stand on the shelf: built the first time its drawer opens. */
  private thing(id: string): Thing {
    let t = this.things.get(id)
    if (t) return t
    const holder = new Group()
    const bag = this.house.kit.bag
    if (isPhoto(id)) {
      this.buildPhoto(holder, this.door[photoSlot(id)])
    } else if (id.startsWith('pot-')) {
      // A pot of paint in its color: a round tub with a cream band round it, a dome of paint on top, a drip.
      const c = PAINTS[potColor(id)].hex
      holder.add(solid(merge([P.cyl(0.1, 0.088, 0.15, c, { at: [0, 0.075, 0] }, 20), P.cyl(0.102, 0.098, 0.04, '#FFF7F0', { at: [0, 0.07, 0] }, 20), P.sphere(0.092, c, { at: [0, 0.15, 0], scale: [1, 0.45, 1] }, 18), P.capsule(0.014, 0.035, c, { at: [0.03, 0.115, 0.093] })]), bag, 1.5))
    } else {
      const w = buildClosetItem(id, bag, 0)
      const room = shelfRoom(drawerThings(thingDrawer(id)!).length)
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
      model.traverse((o) => typeof o.userData.shelfTilt === 'number' && (o.rotation.x = o.userData.shelfTilt))
      // Stand it on its base, centered, no bigger than the shelf has room for.
      model.updateMatrixWorld(true)
      const box = new Box3().setFromObject(model)
      const size = box.getSize(new Vector3())
      const k = Math.min(SIZE * 1.6, room.w / Math.max(size.x, size.z * 0.8, 1e-3), room.h / Math.max(size.y, 1e-3))
      const center = box.getCenter(new Vector3())
      model.position.set(-center.x * k, -box.min.y * k, -center.z * k)
      model.scale.setScalar(k)
      holder.add(model)
    }
    holder.userData.pick = `trip:ward:thing:${id}`
    holder.visible = false
    t = { id, holder, pop: 1 }
    this.things.set(id, t)
    this.park(t)
    return t
  }

  /** A thing's home: the shelf (inside the wardrobe), or a picture's pin on the left door. */
  private park(t: Thing) {
    if (isPhoto(t.id)) {
      const d = this.doors[0]
      if (t.holder.parent !== d) d.add(t.holder)
      t.holder.position.set(...photoPin(photoSlot(t.id)))
      t.holder.rotation.set(0, Math.PI, 0)
      t.holder.scale.setScalar(1)
    } else if (t.holder.parent !== this.inside) this.inside.attach(t.holder)
  }

  /** Where a thing goes back to (world). */
  private homeWorld(t: Thing): Vector3 {
    if (isPhoto(t.id)) return this.doors[0].localToWorld(new Vector3(...photoPin(photoSlot(t.id))))
    const ids = drawerThings(thingDrawer(t.id)!)
    return this.inside.localToWorld(shelfSlot(ids.indexOf(t.id), ids.length))
  }

  // ---------------------------------------------------------------- the pictures on the door

  /** A little polaroid of her look: a cream frame with a heart magnet, the photo in it (facing +z; parked, it faces the
   *  room). */
  private buildPhoto(holder: Group, ph: DoorPhoto | null) {
    const bag = this.house.kit.bag
    const { w, h } = PHOTO_SIZE
    holder.add(solid(merge([P.rbox(w, h, 0.012, 0.012, '#FFFDF8'), P.prism(heart(0.034), 0.012, '#FF4F9A', { at: [0, h / 2 - 0.004, 0.006] })]), bag, 1.3))
    const iw = w - 0.036
    const mat = new MeshBasicMaterial({ color: ph?.img ? '#FFFFFF' : '#E9DEFF', toneMapped: false })
    if (ph?.img) {
      const tex = new TextureLoader().load(ph.img)
      tex.colorSpace = SRGBColorSpace
      mat.map = tex
      bag.add(tex)
      holder.userData.tex = tex
    }
    const pic = new Mesh(new PlaneGeometry(iw, (iw * 4) / 3), mat)
    pic.position.set(0, 0.014, 0.0066)
    holder.add(pic)
    bag.add(pic.geometry)
    bag.add(mat)
    holder.userData.mat = mat
  }

  private dropPhoto(slot: number) {
    const id = `photo-${slot}`
    const t = this.things.get(id)
    if (!t) return
    this.flights = this.flights.filter((f) => f.thing !== t)
    t.holder.removeFromParent()
    ;(t.holder.userData.tex as { dispose(): void } | undefined)?.dispose()
    this.things.delete(id)
    this.door[slot] = null
  }

  /** A new picture on the door: it flies from the mirror to its pin (the oldest goes when all four are taken). */
  private addPhoto(ph: DoorPhoto, fromMirror: boolean) {
    let slot = this.door.findIndex((p) => !p)
    if (slot < 0) {
      slot = this.age.shift()!
      this.dropPhoto(slot)
    }
    this.age = this.age.filter((a) => a !== slot)
    this.age.push(slot)
    this.door[slot] = ph
    const t = this.thing(`photo-${slot}`)
    t.holder.visible = this.open
    if (fromMirror) this.fly(t, this.mirrorCenter(), this.homeWorld(t), true)
    if (fromMirror || ph.img) this.events.onPhotos(this.age.map((i) => this.door[i]!))
  }

  private mirrorCenter() {
    const box = new Box3().setFromObject(this.mirror)
    return box.isEmpty() ? this.kaylee.position.clone().add(new Vector3(0, 1, 0)) : box.getCenter(new Vector3())
  }

  /** The picture camera: in front of her (where the game's camera is), her whole self in a little portrait. */
  private photoCam(): PerspectiveCamera {
    const k = this.kaylee
    const target = k.position.clone().add(new Vector3(0, k.height * 0.5, 0))
    const at = target.clone().addScaledVector(TOWARD, 2.7).add(new Vector3(0, 0.12, 0))
    return photoCamera(30, at.x, at.y, at.z, target.x, target.y, target.z)
  }

  /** Dresses her in a look for a moment, takes its picture, and puts her back as she was. */
  private shoot(style: Style): string {
    const k = this.kaylee
    const mine = k.myLook
    const still = { fold: 0, flap: false, wai: false, walk: false }
    k.setLook(style, false)
    k.dress.update(0, still)
    const img = this.house.snap(this.photoCam(), DOOR_SIZE)
    k.setLook(mine, false)
    k.dress.update(0, still)
    return img
  }

  /** A picture from a link has no photo yet: take it, once she's in her room. */
  private develop() {
    const i = this.door.findIndex((p) => p && !p.img)
    if (i < 0 || this.house.view !== 'upstairs' || !this.kaylee.dressable) return
    const ph = this.door[i]!
    ph.img = this.shoot(parseLook(ph.look))
    const t = this.things.get(`photo-${i}`)
    if (t) {
      this.dropPhoto(i)
      this.door[i] = ph
      const n = this.thing(`photo-${i}`)
      n.holder.visible = this.open
    }
  }

  /** The mirror click: her look, as she's posing, on the door (or the picture of this very look gives a hop). */
  private takePicture() {
    const look = formatLook(this.style)
    sfx.shutter()
    const at = this.mirrorCenter()
    this.sparkle.burst(at.x, at.y, at.z, 24, 1.2, 1.4, 0.05)
    const same = this.door.findIndex((p) => p?.look === look)
    if (same >= 0) {
      const t = this.thing(`photo-${same}`)
      const home = this.homeWorld(t)
      this.fly(t, home, home, true, undefined, 0.45, 0.12)
      sfx.plink()
      return
    }
    this.addPhoto({ look, img: this.house.snap(this.photoCam(), DOOR_SIZE) }, true)
    this.pictured = true
    this.tell('photo', L.wardrobe.photo)
  }

  /** She puts on the whole look of a picture. */
  private wearLook(slot: number, at: Vector3) {
    const ph = this.door[slot]
    if (!ph) return
    this.setStyle(parseLook(ph.look), true)
    sfx.chime()
    this.sparkle.burst(at.x, at.y, at.z, 30, 1.6, 1.8, 0.05)
    this.kaylee.twirl()
    this.tell('look', L.wardrobe.look)
    this.showShelf()
  }

  // ---------------------------------------------------------------- Sparkle's wand

  /** A star wand in a little stand, floating by her rug: a gold star on a candy-striped stick with a pink ribbon. */
  private buildWand(): Group {
    const bag = this.house.kit.bag
    const g = new Group()
    const stick = ['#FF8FB8', '#FFFFFF', '#FF8FB8', '#FFFFFF', '#FF8FB8'].map((c, i) => P.cyl(0.02, 0.02, 0.14, c, { at: [0, 0.07 + i * 0.14, 0] }, 10))
    g.add(solid(merge([...stick, P.prism(star(0.17), 0.04, '#FFC83D', { at: [0, 0.86, 0] }), P.sphere(0.04, '#FFFFFF', { at: [0, 0.86, 0.03] }, 10), P.torus(0.045, 0.012, '#FF4F9A', { at: [0, 0.68, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5))
    g.scale.setScalar(0.6)
    g.userData.pick = 'trip:ward:wand'
    g.position.set(WAND_AT.x, DIM.g0 + 0.18, WAND_AT.z)
    g.visible = false
    return g
  }

  /** A surprise look: a few random things and maybe a color (a different one from what she has on). */
  private surprise(): Style {
    const now = formatLook(this.style)
    if (isHalloweenDay()) {
      const costumes = Object.values(HALLOWEEN_LOOKS).map((look) => formatLook(parseLook(look))).filter((look) => look !== now)
      return parseLook(costumes[Math.floor(Math.random() * costumes.length)])
    }
    for (let tries = 0; tries < 8; tries++) {
      let style: Style = { v: 1, on: {}, paint: {} }
      for (const slot of SLOTS) {
        if (Math.random() < 0.35) continue
        const pool = wardrobeItems().filter((i) => i.slot === slot)
        style = withItem(style, pool[Math.floor(Math.random() * pool.length)].id, true)
      }
      if (Object.keys(style.on).length < 2) continue
      if (Math.random() < 0.4) style = withPaint(style, PAINT_PARTS[Math.floor(Math.random() * 3)], PAINT_COLORS[Math.floor(Math.random() * PAINT_COLORS.length)])
      if (formatLook(style) !== now) return style
    }
    return this.style
  }

  /** Her own look (even today's plain Kaylee) goes on the door as a picture before the wand changes it, so it's one tap
   *  away. */
  private pinLook() {
    const look = formatLook(this.style)
    if (this.wandLook || this.door.some((p) => p?.look === look)) return
    this.addPhoto({ look, img: this.house.snap(this.photoCam(), DOOR_SIZE) }, true)
    this.pictured = true
  }

  private magic() {
    const top = this.wand.localToWorld(new Vector3(0, 0.86, 0))
    this.wandK = 0
    sfx.chime()
    sfx.whoosh(0.5)
    this.sparkle.burst(top.x, top.y, top.z, 30, 1.6, 1.6, 0.06)
    const style = this.surprise()
    const k = this.kaylee
    this.after(0.02, () => this.pinLook())
    this.after(0.35, () => {
      const mid = k.position.clone().add(new Vector3(0, k.height * 0.5, 0))
      this.setStyle(style, true)
      this.wandLook = true
      this.sparkle.burst(mid.x, mid.y, mid.z, 44, 1.8, 2, 0.06)
      const pose = itemById(style.on.head ?? style.on.back ?? style.on.outfit ?? style.on.face ?? style.on.feet ?? '')?.pose
      k.twirl()
      if (pose) this.after(0.8, () => k.showOff(pose))
      this.showShelf()
    })
    // Sparkle talks on the first taps (and now and then); the chime and sparkles carry the rest.
    if (this.wandN < 2 || this.wandN % 4 === 0) this.events.say(L.wardrobe.wand[this.wandN % L.wardrobe.wand.length])
    this.wandN++
    this.dressed++
  }

  // ---------------------------------------------------------------- putting things on and taking them off

  /** On she goes: pop, sparkles, a little hop. A thing already on that spot boings back to its shelf. */
  private wear(id: string, at: Vector3) {
    const item = itemById(id)
    if (!item) return
    const old = this.style.on[item.slot]
    const costume = isHalloweenDay() ? HALLOWEEN_LOOKS[id] : undefined
    this.setStyle(costume ? { ...parseLook(costume), paint: { ...this.style.paint } } : withItem(this.style, id, true), true)
    sfx.pop()
    this.dressed++
    this.sparkle.burst(at.x, at.y, at.z, 22, 1.4, 1.8, 0.05)
    // She shows it off: a curtsy for the crown, a flutter hop for wings, a cool lean for sunglasses.
    this.kaylee.showOff(item.pose)
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
    if (!this.drawer || !drawerThings(this.drawer).includes(id)) return
    const t = this.thing(id)
    this.fly(t, from, this.homeWorld(t), true)
  }

  private paintOn(color: PaintColor, part: PaintPart, at: Vector3) {
    this.setStyle(withPaint(this.style, part, color), false)
    sfx.splash()
    this.dressed++
    this.paint.burst(at.x, at.y, at.z, 26, 1.3, 2.2, 0.05, PAINT_COLORS.indexOf(color))
    this.sparkle.burst(at.x, at.y + 0.1, at.z, 10, 0.8, 1.2, 0.04)
    this.kaylee.react('wiggle')
  }

  private setStyle(style: Style, show: boolean) {
    const before = this.style
    this.wandLook = false
    this.kaylee.setLook(style, show)
    this.events.onLook(style)
    // What's new about her look is what the family notice (notice.ts).
    for (const slot of ['head', 'back', 'outfit', 'face', 'feet'] as Slot[]) {
      if (style.on[slot] && style.on[slot] !== before.on[slot]) return markNew(style, slot as Kind, style.on[slot])
    }
    if (PAINT_PARTS.some((p) => style.paint[p] !== before.paint[p])) markNew(style, 'paint')
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

  private fly(t: Thing, from: Vector3, to: Vector3, home: boolean, then?: () => void, dur = 0.45, arc = 0.35) {
    this.flights = this.flights.filter((f) => f.thing !== t)
    this.house.scene.attach(t.holder)
    t.holder.position.copy(from)
    t.holder.visible = true
    t.pop = 1
    t.holder.scale.setScalar(1)
    // A picture flies facing you.
    if (isPhoto(t.id)) t.holder.quaternion.copy(this.house.rig.camera.quaternion)
    this.flights.push({ thing: t, from: from.clone(), to: to.clone(), t: 0, dur, arc, home, then })
  }

  // ---------------------------------------------------------------- silly landings (never wrong)

  /** Dropped where it doesn't belong: it sits there a moment (she wobbles and giggles), then hops to where it goes. */
  private silly(t: Thing, from: Vector3, perch: Vector3, goal: () => Vector3, key: string, line: Line) {
    // (Small while it sits on her: like it'd be worn.)
    const small = () => t.holder.scale.setScalar(0.6)
    this.fly(
      t,
      from,
      perch,
      false,
      () => {
        this.kaylee.react('wiggle')
        sfx.boing()
        sfx.giggle()
        this.tell(key, line)
        this.fly(
          t,
          perch,
          perch,
          false,
          () => {
            const to = goal()
            this.fly(t, perch, to, false, () => {
              t.holder.visible = false
              this.park(t)
              this.wear(t.id, to)
            })
          },
          1,
          0.04,
        )
        small()
      },
      0.3,
      0.12,
    )
    small()
  }

  /** The tail's middle (world), or just behind her. */
  private tailAt(): Vector3 {
    const k = this.kaylee
    if (this.tail === undefined) {
      this.tail = null
      k.root.traverse((o) => {
        if (!this.tail && /^tail/.test(o.name)) this.tail = o
      })
    }
    if (this.tail) {
      const box = new Box3().setFromObject(this.tail)
      if (!box.isEmpty()) return box.getCenter(new Vector3())
    }
    return k.position.clone().addScaledVector(TOWARD, -0.3).add(new Vector3(0, k.height * 0.3, 0))
  }

  /** Is a finger near her tail on the screen (a thin strip behind her skirt)? */
  private overTail(x: number, y: number) {
    const { w, h } = this.house.size
    const p = this.tailAt().project(this.house.rig.camera)
    return Math.hypot(x - (p.x + 1) * 0.5 * w, y - (1 - p.y) * 0.5 * h) < 48
  }

  /** What part of her is under a finger (a mesh's name, and which of her things it is, if one). */
  private bodyHit(x: number, y: number): { name: string; item: string | null } | null {
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    for (const hit of this.ray.intersectObject(this.kaylee.root, true)) {
      const o = hit.object
      if (o.userData.hull !== undefined || !chainVisible(o)) continue
      return { name: o.name, item: this.kaylee.itemOf(o) }
    }
    return null
  }

  /** Where the finger touches the mirror (world), when the doors are open. */
  private mirrorAt(x: number, y: number): Vector3 | null {
    if (!this.open || this.doorK < 0.9) return null
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    return this.ray.intersectObject(this.mirror, true).find((h) => chainVisible(h.object))?.point.clone() ?? null
  }

  /** Paint on the mirror: splat! It runs down in a drip and slides off, and she giggles. */
  private splat(color: PaintColor, at: Vector3) {
    const hex = PAINTS[color].hex
    const bag = this.house.kit.bag
    if (this.splats.length >= 4) this.splats.shift()?.g.removeFromParent()
    const g = solid(merge([P.sphere(0.085, hex, { scale: [1, 0.9, 0.2] }), P.sphere(0.04, hex, { at: [0.09, 0.03, 0], scale: [1, 1, 0.25] }), P.sphere(0.03, hex, { at: [-0.07, -0.06, 0], scale: [1, 1, 0.25] })]), bag, 1.2)
    const drip = solid(P.capsule(0.018, 0.1, hex), bag, 1.2)
    drip.position.set(0.015, -0.08, 0)
    drip.scale.y = 0.01
    g.add(drip)
    this.mirror.add(g)
    const local = this.mirror.worldToLocal(at.clone())
    g.position.set(local.x, local.y, -0.026)
    this.splats.push({ g, drip, t: 0 })
    this.paint.burst(at.x, at.y, at.z, 34, 1.4, 1.6, 0.05, PAINT_COLORS.indexOf(color))
    sfx.splash(0.6)
    sfx.giggle()
    this.kaylee.twirl()
    this.tell('mirror', L.wardrobe.silly.mirror)
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
    const targets: Object3D[] = [this.root, this.kaylee.root, this.wand, ...[...this.things.values()].filter((t) => t.holder.visible).map((t) => t.holder)]
    for (const hit of this.ray.intersectObjects(targets, true)) {
      if (!chainVisible(hit.object)) continue
      for (let o: Object3D | null = hit.object; o; o = o.parent) {
        if (typeof o.userData.pick === 'string' && (o.userData.pick.startsWith('trip:ward:thing:') || o.userData.pick === 'trip:ward:wand')) return o.userData.pick
        if (o === this.mirror) return 'trip:ward:mirror'
        const item = this.kaylee.itemOf(o)
        if (item) return `trip:ward:on:${itemById(item)!.slot}`
        for (const [id, d] of this.drawers) if (d === o) return `trip:ward:drawer:${id}`
        if (this.doors.includes(o)) return o === this.doors[0] ? 'trip:ward:doorL' : 'trip:ward:doors'
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

  /** The camera's facing, flat on the floor. */
  private camFlat() {
    return this.house.rig.camera.getWorldDirection(new Vector3()).setY(0).normalize()
  }

  /** Where the finger is on an upright plane facing the camera, just in front of her (where a dragged thing goes), so
   *  what she's carrying passes in front of her instead of into her. */
  private dragPoint(x: number, y: number) {
    this.ray.setFromCamera(this.ndc(x, y), this.house.rig.camera)
    const n = this.camFlat()
    const p = this.kaylee.position.clone().add(new Vector3(0, 0.6, 0)).addScaledVector(n, -DRAG_FRONT)
    return this.ray.ray.intersectPlane(new Plane().setFromNormalAndCoplanarPoint(n, p), new Vector3())
  }

  pointerDown(x: number, y: number, id?: string) {
    if (!this.open) return false
    this.idle = 0
    const what = id?.startsWith('trip:ward:') || id === 'kaylee' ? id : (this.under(x, y) ?? id)
    if (what?.startsWith('trip:ward:thing:')) {
      this.drag = { kind: 'thing', id: what.slice(16), x, y, moved: false, lastX: x, lastY: y }
      // The first time she touches a thing, Sparkle says its name.
      const name = L.wardrobe.names[what.slice(16)] ?? (itemById(what.slice(16))?.halloween ? L.wardrobe.wand[0] : undefined)
      if (name) this.tell(`name:${what.slice(16)}`, name)
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
        t.holder.scale.setScalar(1)
        if (isPhoto(t.id)) t.holder.quaternion.copy(this.house.rig.camera.quaternion)
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
    // Pushed back onto her plane to judge where it landed (the drag plane is in front of her).
    const landed = at.clone().addScaledVector(this.camFlat(), DRAG_FRONT)
    const onHer = this.near(landed) || !!this.partAt(d.lastX, d.lastY, landed)
    if (d.id.startsWith('pot-')) {
      const mirror = this.mirrorAt(d.lastX, d.lastY)
      const part = mirror ? null : this.partAt(d.lastX, d.lastY, landed)
      if (mirror) this.splat(potColor(d.id), mirror)
      else if (part) this.paintOn(potColor(d.id), part, at)
      else sfx.boing()
      this.home(t, at)
      return true
    }
    if (isPhoto(d.id)) {
      // A picture dropped on her: the whole look goes on.
      if (onHer) this.wearLook(photoSlot(d.id), at)
      else sfx.boing()
      this.home(t, at)
      return true
    }
    const item = itemById(d.id)
    if (item && onHer) {
      // A shoe on her head, glasses on her tail: silly, never wrong. It sits there a moment, then goes where it belongs.
      const hit = this.bodyHit(d.lastX, d.lastY)
      const k = this.kaylee
      const high = hit ? /^(hair|face|ear|eye|horn)/.test(hit.name) || (!!hit.item && itemById(hit.item)?.slot === 'head') : (at.y - k.position.y) / SIZE > 0.52
      if (item.slot === 'feet' && high) {
        this.silly(t, at, k.position.clone().add(new Vector3(0, k.height * 0.98, 0)), () => k.position.clone().add(new Vector3(0, 0.07, 0)), 'silly:shoe', L.wardrobe.silly.shoe)
        return true
      }
      if (item.slot === 'face' && ((hit && /^tail/.test(hit.name)) || this.overTail(d.lastX, d.lastY))) {
        this.silly(t, at, this.tailAt(), () => k.position.clone().add(new Vector3(0, k.height * 0.78, 0)).addScaledVector(TOWARD, 0.12), 'silly:glasses', L.wardrobe.silly.glasses)
        this.after(0.8, () => k.react('wiggle'))
        return true
      }
    }
    if (onHer) {
      t.holder.visible = false
      this.park(t)
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
    if (isPhoto(t.id)) {
      this.fly(t, from, this.homeWorld(t), true)
      return
    }
    const dr = thingDrawer(t.id)
    if (!dr || dr !== this.drawer || !drawerThings(dr).includes(t.id)) {
      t.holder.visible = false
      this.park(t)
      return
    }
    this.fly(t, from, this.homeWorld(t), true)
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
    this.idle = 0
    const what = id?.startsWith('trip:ward:') ? id : (this.under(x, y) ?? (this.onHer(x, y) ? 'kaylee' : id))
    // The floor or the wall: nothing happens (a stray touch doesn't shut the wardrobe on her).
    if (!what) return true
    if (what === 'trip:ward:wand') {
      this.magic()
      return true
    }
    // The left door holds her pictures: a tap that just misses one doesn't shut the wardrobe on her.
    if (what === 'trip:ward:doorL') {
      sfx.plink()
      return true
    }
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
      if (isPhoto(tid)) {
        // A picture: her whole look goes on.
        const to = new Vector3(k.x, k.y + this.kaylee.height * 0.6, k.z)
        this.fly(t, from, to, false, () => {
          t.holder.visible = false
          this.wearLook(photoSlot(tid), to)
          this.fly(t, to, this.homeWorld(t), true)
        })
      } else if (tid.startsWith('pot-')) {
        const to = new Vector3(k.x, k.y + 0.32 * SIZE, k.z)
        this.fly(t, from, to, false, () => {
          this.paintOn(potColor(tid), 'dress', to)
          this.home(t, to)
        })
      } else {
        const to = new Vector3(k.x, k.y + this.kaylee.height * 0.6, k.z)
        this.fly(t, from, to, false, () => {
          t.holder.visible = false
          this.park(t)
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
    if (what === 'trip:ward:mirror') {
      // She sees herself and strikes a pose: one of her things' (or a cool one).
      const mine = Object.values(this.style.on).map((tid) => itemById(tid!)?.pose).filter((p) => !!p)
      this.kaylee.showOff(mine.length ? mine[Math.floor(Math.random() * mine.length)]! : 'cool')
      const at = this.mirror.getWorldPosition(new Vector3())
      this.sparkle.burst(at.x, at.y + 1.3, at.z, 14, 0.9, 1, 0.04)
      sfx.plink()
      // Click: a picture of her look, once she's in her pose.
      if (this.snapIn < 0) this.snapIn = 0.5
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
      // (A tall screen is narrow: it fits the open left door (and its pictures) to her rug across the width.)
      center: new Vector3(-2.1, DIM.g0 + (tall ? 0.85 : 1.0), (DIM.wardrobe.z + rug.z) / 2 + (tall ? 0.5 : 0.2)),
      half: new Vector3(0.5, 1.0, tall ? 1.72 : 1.4),
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
          this.park(f.thing)
          sfx.thump()
        }
        f.then?.()
        this.showShelf()
      }
    }
    // The wand bobs in the air and wiggles when it's tapped (a glint every so often says "me!").
    if (this.wand.visible) {
      const t = performance.now() / 1000
      this.wand.position.y = DIM.g0 + 0.2 + Math.sin(t * 2) * 0.03
      this.wand.rotation.z = 0.18 + Math.sin(t * 1.3) * 0.04
      this.wand.rotation.y += dt * 0.6
      if (this.wandK >= 0) {
        this.wandK += dt / 0.8
        this.wand.rotation.z += Math.sin(this.wandK * Math.PI * 8) * 0.35 * (1 - this.wandK)
        if (this.wandK >= 1) this.wandK = -1
      }
      if (Math.floor(t * 0.7) !== Math.floor((t - dt) * 0.7)) {
        const top = this.wand.localToWorld(new Vector3(0, 0.86, 0))
        this.sparkle.burst(top.x, top.y, top.z, 4, 0.4, 0.6, 0.04)
      }
    }
    // Paint on the mirror runs down and slides off.
    for (const sp of [...this.splats]) {
      sp.t += dt
      const grow = Math.min(1, sp.t / 0.15)
      const fade = sp.t < 2.2 ? 1 : Math.max(0, 1 - (sp.t - 2.2) / 0.5)
      sp.g.scale.setScalar(Math.max(0.01, grow * fade))
      sp.drip.scale.y = Math.max(0.01, Math.min(1, sp.t / 1.4) * 1.6)
      sp.drip.position.y = -0.08 - sp.drip.scale.y * 0.05
      if (sp.t > 1.6) sp.g.position.y -= dt * 0.18
      if (sp.t > 2.7) {
        sp.g.removeFromParent()
        this.splats.splice(this.splats.indexOf(sp), 1)
      }
    }
    // Things to do in a little while; the picture, once she's in her pose; a picture from a link, developed.
    for (const l of [...this.later]) {
      l.t -= dt
      if (l.t <= 0) {
        this.later.splice(this.later.indexOf(l), 1)
        if (this.open) l.f()
      }
    }
    if (this.snapIn >= 0) {
      this.snapIn -= dt
      if (this.snapIn < 0) this.takePicture()
    }
    this.develop()
    for (const g of [...this.glints]) {
      g.t += dt
      g.next -= dt
      const at = g.at()
      if (at && g.next <= 0) {
        g.next = 0.25
        this.sparkle.burst(at.x, at.y, at.z, 5, 0.5, 0.7, 0.05)
      }
      if (g.t > 1.8 || !at) this.glints.splice(this.glints.indexOf(g), 1)
    }
    this.hint(dt)
    this.sparkle.update(dt)
    this.paint.update(dt)
  }

  /** After ~8 seconds with nothing touched: a hint, and the thing to touch glints (at most a few per visit). */
  private hint(dt: number) {
    if (!this.open || this.drag || this.flights.length || this.hints >= MAX_HINTS) return
    this.idle += dt
    if (this.idle < IDLE_S) return
    this.idle = 0
    this.hints++
    const h = L.wardrobe.hint
    if (!this.drawer) {
      const first = DRAWERS[this.hints === 1 ? 0 : Math.floor(Math.random() * DRAWERS.length)].id
      this.events.say(h.drawer)
      this.glints.push({ at: () => this.drawers.get(first)?.getWorldPosition(new Vector3()) ?? null, t: 0, next: 0 })
      sfx.plink()
      return
    }
    const on = new Set(Object.values(this.style.on))
    const ids = drawerThings(this.drawer).filter((id) => !on.has(id))
    if (this.dressed < 2 && ids.length) {
      const t = this.thing(ids[0])
      this.events.say(h.thing)
      this.glints.push({ at: () => (t.holder.visible ? t.holder.getWorldPosition(new Vector3()).add(new Vector3(0, 0.1, 0)) : null), t: 0, next: 0 })
      sfx.plink()
    } else if (this.dressed >= 2 && !this.pictured) {
      this.events.say(h.photo)
      this.glints.push({ at: () => this.mirrorCenter(), t: 0, next: 0 })
      sfx.plink()
    }
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
      // A picture hangs on the door (open all the way); a thing stands on the shelf.
      if (isPhoto(t.id)) return this.doorK < 0.9 ? null : { at: t.holder.getWorldPosition(new Vector3()), r: 0.2 }
      return { at: t.holder.getWorldPosition(new Vector3()).add(new Vector3(0, 0.12, 0)), r: 0.16 }
    }
    if (id === 'trip:ward:wand') return this.wand.visible ? { at: this.wand.localToWorld(new Vector3(0, 0.7, 0)), r: 0.3 } : null
    if (id === 'trip:ward:mirror') {
      // (The mirror's middle: the part's origin is the door's hinge.)
      const box = new Box3().setFromObject(this.mirror)
      return box.isEmpty() || this.doorK < 0.9 ? null : { at: box.getCenter(new Vector3()), r: 0.2 }
    }
    if (id.startsWith('trip:ward:on:')) {
      const slot = id.slice(13) as Slot
      if (!this.kaylee.onSpot(slot).length) return null
      return { at: this.wornAt(slot), r: 0.12 }
    }
    return null
  }

  hides(id: string) {
    // While she's dressing up, the wardrobe's own targets stand in for its house one, and the bed and her cousin beside her
    // (a stray tap there would end the toy) wait.
    return this.open && (id === 'wardrobe' || id === 'pillows' || id === 'mattress' || id === 'family:gan')
  }

  get roots(): Object3D[] {
    return [...this.things.values()].filter((t) => t.holder.visible).map((t) => t.holder)
  }

  get busy() {
    return this.flights.length > 0 || this.sparkle.busy || this.paint.busy || Math.abs(this.doorK - (this.open ? 1 : 0)) > 0.002 || [...this.drawerK].some(([id, k]) => Math.abs(k - (this.drawer === id ? 1 : 0)) > 0.002) || [...this.things.values()].some((t) => t.pop < 1) || this.later.length > 0 || this.snapIn >= 0 || this.splats.length > 0 || this.glints.length > 0 || this.wandK >= 0 || this.door.some((p) => p && !p.img)
  }

  qa() {
    return { wardrobe: this.open, drawer: this.drawer, door: this.age.map((i) => this.door[i]?.look ?? ''), hints: this.hints }
  }
}

function chainVisible(o: Object3D | null): boolean {
  for (let x = o; x; x = x.parent) if (!x.visible) return false
  return !!o
}
