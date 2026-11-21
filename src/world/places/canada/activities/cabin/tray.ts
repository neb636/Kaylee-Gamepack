// The cubby shelf along the bottom of the screen (the Team Cabin's wardrobe drawers): four bins (the jerseys' crate,
// the hat box, the scarf basket, the stamp tin) and, on the shelf beside them (above them on a tall screen), the
// things in the open one: five jerseys, six hats, five scarves or three cheek stamps. It rides in front of the camera
// (a child of it), laid out in screen pixels, so every thing is a big target on any screen shape: she taps a bin to
// open it, drags a thing onto a friend, or taps it and it flies on.
import { Box3, Group, Vector3, type Object3D, type PerspectiveCamera } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { cheekParts, crestGeo, hatParts, WHITE, type CheekId, type HatId } from '../../characters/wear'
import type { WearKind } from '../../characters/worn'
import { CHEEKS, HATS, JERSEYS, SCARVES, WEAR_COLORS } from '../../looks'

/** How far in front of the camera the shelf rides (meters). */
const D = 2.2
export const KINDS: WearKind[] = ['jersey', 'hat', 'scarf', 'cheek']
export const IDS: Record<WearKind, readonly string[]> = { jersey: JERSEYS, hat: HATS, scarf: SCARVES, cheek: CHEEKS }

export interface Slot {
  /** Middle, on screen (CSS px), and how big across. */
  x: number
  y: number
  size: number
}
export interface TrayItem {
  kind: WearKind
  id: string
  /** Its place on the shelf (the camera's space), and the icon in it. */
  holder: Group
  icon: Group
  slot: Slot
  pop: number
  wiggle: number
}
interface Bin {
  kind: WearKind
  holder: Group
  slot: Slot
  lift: number
}

/** A shape scaled to fit a box 1 across, centered on its middle. */
function unit(o: Object3D) {
  const box = new Box3().setFromObject(o)
  const size = box.getSize(new Vector3())
  const c = box.getCenter(new Vector3())
  const k = 1 / Math.max(size.x, size.y, size.z * 0.6, 1e-3)
  const g = new Group()
  o.position.sub(c)
  g.add(o)
  g.scale.setScalar(k)
  return g
}

/** A little jersey on a hanger: the body, the sleeves out to the sides, two white hem stripes and the white leaf. */
export function jerseyIcon(color: string, bag: Bag) {
  return unit(
    solidMix(
      [
        P.rbox(0.56, 0.62, 0.14, 0.06, color, { at: [0, 0, 0] }),
        ...[-1, 1].map((s) => P.rbox(0.3, 0.2, 0.13, 0.05, color, { at: [s * 0.36, 0.2, 0], rot: [0, 0, s * -0.55] })),
        P.torus(0.09, 0.025, color, { at: [0, 0.31, 0.02], rot: [Math.PI / 2 - 0.3, 0, 0], scale: [1.2, 1, 1] }),
      ],
      [
        P.box(0.565, 0.035, 0.15, WHITE, { at: [0, -0.2, 0] }),
        P.box(0.565, 0.035, 0.15, WHITE, { at: [0, -0.25, 0] }),
        ...[-1, 1].map((s) => P.box(0.07, 0.205, 0.135, WHITE, { at: [s * 0.47, 0.135, 0], rot: [0, 0, s * -0.55] })),
        crestGeo(0.24).translate(0, 0.05, 0.075),
      ],
      bag,
      2,
    ),
  )
}

/** A hat, tipped toward you so its top shows. */
export function hatIcon(id: HatId, bag: Bag) {
  const p = hatParts(id, { k: 1.25, d: 0.75 })
  const g = solidMix(p.lined, p.plain, bag, 2)
  g.rotation.x = 0.16
  const w = new Group()
  w.add(g)
  return unit(w)
}

/** A scarf rolled into a ring with its two striped tails hanging. */
export function scarfIcon(color: string, bag: Bag) {
  return unit(
    solidMix(
      [P.torus(0.3, 0.11, color, { rot: [1.2, 0, 0] }), P.rbox(0.16, 0.5, 0.06, 0.03, color, { at: [0.12, -0.32, 0.18], rot: [0.2, 0, -0.18] }), P.rbox(0.16, 0.42, 0.06, 0.03, color, { at: [-0.06, -0.3, 0.22], rot: [0.25, 0, 0.12] })],
      [P.box(0.165, 0.04, 0.065, WHITE, { at: [0.155, -0.46, 0.2], rot: [0.2, 0, -0.18] }), P.box(0.165, 0.04, 0.065, WHITE, { at: [-0.085, -0.42, 0.25], rot: [0.25, 0, 0.12] })],
      bag,
      2,
    ),
  )
}

/** A cheek stamp: its shape on a round white stamp with a wooden knob behind. */
export function cheekIcon(id: CheekId, bag: Bag) {
  return unit(
    solidMix(
      [P.cyl(0.36, 0.36, 0.1, '#FFF7F0', { rot: [Math.PI / 2, 0, 0] }, 28), P.cyl(0.12, 0.16, 0.22, '#C98A55', { at: [0, 0, -0.16], rot: [Math.PI / 2, 0, 0] }, 14), P.sphere(0.17, '#B07A4A', { at: [0, 0, -0.32] }, 14)],
      cheekParts(id, 0.52).map((g) => g.translate(0, 0, 0.07)),
      bag,
      1.8,
    ),
  )
}

/** The four bins. */
function binIcon(kind: WearKind, bag: Bag) {
  if (kind === 'jersey')
    return unit(
      solidMix(
        [P.rbox(0.8, 0.36, 0.5, 0.05, '#C98A55', { at: [0, -0.1, 0] }), P.rbox(0.62, 0.1, 0.4, 0.04, WEAR_COLORS.mint, { at: [0, 0.12, 0] }), P.rbox(0.6, 0.1, 0.38, 0.04, WEAR_COLORS.blue, { at: [0.02, 0.22, 0], rot: [0, 0.08, 0] }), P.rbox(0.58, 0.1, 0.38, 0.04, WEAR_COLORS.pink, { at: [-0.02, 0.32, 0], rot: [0, -0.06, 0] })],
        [P.box(0.82, 0.04, 0.52, '#A86E44', { at: [0, -0.05, 0] }), crestGeo(0.14).translate(0, 0.32, 0.2)],
        bag,
        2,
      ),
    )
  if (kind === 'hat')
    return unit(
      solidMix(
        [P.cyl(0.42, 0.42, 0.42, '#FFD6E6', {}, 28), P.cyl(0.45, 0.45, 0.1, '#FF8FB8', { at: [0, 0.28, 0], rot: [0.12, 0, 0] }, 28), P.sphere(0.13, WHITE, { at: [0.1, 0.42, 0] }, 12)],
        [...[-0.7, -0.25, 0.2, 0.65].map((a) => P.box(0.07, 0.42, 0.02, WHITE, { at: [Math.sin(a) * 0.425, 0, Math.cos(a) * 0.425], rot: [0, a, 0] }))],
        bag,
        2,
      ),
    )
  if (kind === 'scarf')
    return unit(
      solidMix(
        [P.cyl(0.42, 0.34, 0.38, '#E2B57C', {}, 24), P.torus(0.42, 0.05, '#C98A55', { at: [0, 0.19, 0], rot: [Math.PI / 2, 0, 0] }), P.rbox(0.14, 0.42, 0.05, 0.03, WEAR_COLORS.pink, { at: [0.2, 0.05, 0.4], rot: [0.15, 0, -0.1] }), P.rbox(0.14, 0.36, 0.05, 0.03, WEAR_COLORS.mint, { at: [-0.16, 0.08, 0.4], rot: [0.15, 0, 0.12] }), P.sphere(0.22, WEAR_COLORS.purple, { at: [0, 0.22, 0], scale: [1.3, 0.6, 1] }, 12)],
        [...[-0.1, 0.05].map((y) => P.torus(0.4 - y * 0.2, 0.018, '#C98A55', { at: [0, y, 0], rot: [Math.PI / 2, 0, 0] }))],
        bag,
        2,
      ),
    )
  return unit(
    solidMix(
      [P.rbox(0.8, 0.14, 0.56, 0.05, '#B9A6F5', { at: [0, -0.1, 0] }), P.rbox(0.66, 0.05, 0.44, 0.03, '#FF5C9A', { at: [0, -0.01, 0] }), P.cyl(0.1, 0.13, 0.24, '#C98A55', { at: [0.12, 0.16, 0], rot: [0, 0, -0.3] }, 12), P.sphere(0.13, '#B07A4A', { at: [0.17, 0.32, 0] }, 12)],
      [...cheekParts('heart', 0.18).map((g) => g.rotateX(-Math.PI / 2).translate(-0.2, 0.025, 0.05))],
      bag,
      2,
    ),
  )
}

/** Builds one thing to wear's icon. */
export function iconOf(kind: WearKind, id: string, bag: Bag): Group {
  if (kind === 'jersey') return jerseyIcon(WEAR_COLORS[id as keyof typeof WEAR_COLORS], bag)
  if (kind === 'hat') return hatIcon(id as HatId, bag)
  if (kind === 'scarf') return scarfIcon(WEAR_COLORS[id as keyof typeof WEAR_COLORS], bag)
  return cheekIcon(id as CheekId, bag)
}

export class Tray {
  /** Add it to the camera. */
  readonly group = new Group()
  open: WearKind = 'jersey'
  items: TrayItem[] = []
  private bins: Bin[]
  private all = new Map<string, TrayItem>()
  private shelves: Group[] = []
  private glow: Group
  private w = 1
  private h = 1
  private hud = { halfW: 1, halfH: 1 }
  tall = false
  private args: { cam: PerspectiveCamera; left: number; bottom: number } | null = null

  constructor(bag: Bag) {
    this.group.position.z = -D
    this.bins = KINDS.map((kind) => {
      const holder = new Group()
      holder.add(binIcon(kind, bag))
      this.group.add(holder)
      return { kind, holder, slot: { x: 0, y: 0, size: 0 }, lift: 0 }
    })
    for (const kind of KINDS)
      for (const id of IDS[kind]) {
        const holder = new Group()
        const icon = iconOf(kind, id, bag)
        holder.add(icon)
        holder.visible = false
        this.group.add(holder)
        this.all.set(`${kind}.${id}`, { kind, id, holder, icon, slot: { x: 0, y: 0, size: 0 }, pop: 1, wiggle: 0 })
      }
    for (let i = 0; i < 2; i++) {
      const s = solidMix([P.rbox(1, 0.12, 0.5, 0.04, '#B07A4A')], [P.box(1, 0.02, 0.51, '#C98A55', { at: [0, 0.06, 0] })], bag, 2)
      this.group.add(s)
      this.shelves.push(s)
    }
    this.glow = solid(merge([P.torus(0.8, 0.09, '#FF5C9A', { rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.6] })]), bag, 0)
    this.group.add(this.glow)
    this.setOpen('jersey', false)
  }

  /** Screen px to the shelf's space. */
  private hudAt(x: number, y: number, out = new Vector3()) {
    return out.set((x / this.w) * 2 * this.hud.halfW - this.hud.halfW, this.hud.halfH - (y / this.h) * 2 * this.hud.halfH, 0)
  }
  private px(size: number) {
    return (size / this.h) * 2 * this.hud.halfH
  }

  /** Lays the shelf out for a screen `w`×`h` (CSS px): `left` px kept clear for Sparkle, `bottom` the safe area. */
  layout(w: number, h: number, cam: PerspectiveCamera, left: number, bottom: number) {
    this.args = { cam, left, bottom }
    this.w = w
    this.h = h
    this.hud.halfH = D * Math.tan((cam.fov * Math.PI) / 360)
    this.hud.halfW = this.hud.halfH * cam.aspect
    this.tall = h > w * 1.05
    const n = IDS[this.open].length
    const gap = 8
    let bins: Slot[]
    let items: Slot[]
    let rows: { y: number; x0: number; x1: number; size: number }[]
    if (this.tall) {
      const size = Math.min(132, Math.max(76, h * 0.095), (w - 24 - gap * 5) / 6)
      const y1 = h - bottom - 10 - size / 2
      const binSize = Math.min(size, (w - left - 12 - gap * 3) / 4)
      bins = KINDS.map((_, i) => ({ x: left + binSize / 2 + i * (binSize + gap), y: y1 + (size - binSize) / 2, size: binSize }))
      const y2 = y1 - size - 14
      const x0 = (w - (n * size + (n - 1) * gap)) / 2
      items = Array.from({ length: n }, (_, i) => ({ x: x0 + size / 2 + i * (size + gap), y: y2, size }))
      rows = [
        { y: y1 + size / 2, x0: left - 6, x1: left + 4 * binSize + 3 * gap + 6, size: binSize },
        { y: y2 + size / 2, x0: x0 - 6, x1: x0 + n * size + (n - 1) * gap + 6, size },
      ]
    } else {
      const room = w - left - 16
      const size = Math.min(128, Math.max(62, h * 0.17), (room - gap * 9 - 18) / 10)
      const y = h - bottom - 8 - size / 2
      bins = KINDS.map((_, i) => ({ x: left + size / 2 + i * (size + gap), y, size }))
      const x0 = left + 4 * (size + gap) + 18
      items = Array.from({ length: n }, (_, i) => ({ x: x0 + size / 2 + i * (size + gap), y, size }))
      rows = [{ y: y + size / 2, x0: left - 6, x1: Math.max(x0 + 6 * (size + gap), w - 10), size }]
    }
    for (const [i, b] of this.bins.entries()) b.slot = bins[i]
    this.items = IDS[this.open].map((id, i) => {
      const it = this.all.get(`${this.open}.${id}`)!
      it.slot = items[i]
      return it
    })
    for (const [i, s] of this.shelves.entries()) {
      const r = rows[i]
      s.visible = !!r
      if (!r) continue
      const a = this.hudAt(r.x0, r.y)
      const b = this.hudAt(r.x1, r.y)
      s.position.set((a.x + b.x) / 2, a.y - this.px(6), -0.15)
      s.scale.set(b.x - a.x, this.px(r.size) * 0.9, this.px(r.size) * 0.9)
    }
    this.place()
  }

  private place() {
    for (const b of this.bins) this.put(b.holder, b.slot, 0.82 + b.lift * 0.08, b.lift)
    for (const it of this.all.values()) it.holder.visible = false
    for (const it of this.items) {
      it.holder.visible = true
      this.put(it.holder, it.slot, 0.9 * Math.max(0.001, it.pop), 0)
    }
    const open = this.bins.find((b) => b.kind === this.open)!
    // (A soft pink ring on the shelf under the open bin.)
    this.glow.position.copy(this.hudAt(open.slot.x, open.slot.y + open.slot.size * 0.44)).setZ(-0.05)
    this.glow.scale.setScalar(this.px(open.slot.size) * 0.5)
  }
  private put(o: Group, s: Slot, k: number, lift: number) {
    o.position.copy(this.hudAt(s.x, s.y - lift * s.size * 0.18))
    o.scale.setScalar(this.px(s.size) * k)
  }

  /** Opens a bin: its things pop onto the shelf. */
  setOpen(kind: WearKind, pop = true) {
    this.open = kind
    for (const id of IDS[kind]) {
      const it = this.all.get(`${kind}.${id}`)!
      it.pop = pop ? -IDS[kind].indexOf(id) * 0.18 : 1
    }
    const a = this.args
    if (a) this.layout(this.w, this.h, a.cam, a.left, a.bottom)
  }

  /** What's under a screen point: a bin or a thing on the shelf (generous: the slot plus a little). */
  pick(x: number, y: number): { bin: WearKind } | { item: TrayItem } | null {
    for (const it of this.items) if (Math.abs(x - it.slot.x) < it.slot.size * 0.55 && Math.abs(y - it.slot.y) < it.slot.size * 0.6) return { item: it }
    for (const b of this.bins) if (Math.abs(x - b.slot.x) < b.slot.size * 0.55 && Math.abs(y - b.slot.y) < b.slot.size * 0.6) return { bin: b.kind }
    return null
  }

  /** The top of the shelf on screen (px): the room is framed above it. */
  get top() {
    const ys = [...this.items, ...this.bins].map((s) => s.slot.y - s.slot.size / 2)
    return ys.length ? Math.min(...ys) : this.h
  }

  /** Where a thing on the shelf is in the world, and how big it is there. */
  worldOf(it: TrayItem, out = new Vector3()) {
    return it.holder.getWorldPosition(out)
  }
  get hudDistance() {
    return D
  }
  bins_() {
    return this.bins.map((b) => ({ kind: b.kind, x: Math.round(b.slot.x), y: Math.round(b.slot.y), size: Math.round(b.slot.size) }))
  }

  update(dt: number, t: number) {
    let moved = false
    for (const b of this.bins) {
      const goal = b.kind === this.open ? 1 : 0
      if (Math.abs(b.lift - goal) > 0.001) {
        b.lift += (goal - b.lift) * Math.min(1, dt * 10)
        moved = true
      }
    }
    for (const it of this.items) {
      if (it.pop < 1) {
        it.pop = Math.min(1, it.pop + dt / 0.3)
        moved = true
      }
      const wig = it.wiggle > 0 ? Math.sin(t * 18) * 0.18 * Math.min(1, it.wiggle) : 0
      if (it.wiggle > 0) it.wiggle = Math.max(0, it.wiggle - dt)
      it.icon.rotation.z = wig
      it.icon.rotation.y = Math.sin(t * 1.3 + it.slot.x * 0.01) * 0.12
    }
    if (moved) this.place()
    // (The popping ones overshoot a little and settle.)
    for (const it of this.items) if (it.pop < 1 && it.pop > 0) it.holder.scale.multiplyScalar(1 + Math.sin(it.pop * Math.PI) * 0.15)
  }
}
