// The Thailand map's 3D world (ThaiMap.tsx mounts it): the clay diorama of Thailand on its paper map (board.ts), seen
// from above at a slant with north up the screen. It owns the camera, the life on the board and what a poke does to the
// toy; ThaiMap.tsx keeps the rest (the pins over the places, the stamps, Sparkle's talk, the sounds, where a pin goes).
//
// The pins are DOM buttons in ThaiMap.tsx that this world moves every frame (anchorAt `pin:<id>`) to float on their
// poles over the places. The things to poke get invisible tap targets (THAI_MAP_ANCHORS), and a tap on a place's toy
// itself opens it, like its pin. Poked, each thing acts it out: the elephant lifts its trunk and sprays, the cloud rains,
// the gibbon swings, the buffalo tosses its head, the hornbill flaps, the tuk-tuk zips round the block, the dolphins
// leap, the longtail zooms round in a loop of foam, the palm drops a coconut; a balloon puffs and rises.
import { Color, IcosahedronGeometry, OctahedronGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import { PAL } from '../../../../../engine3d/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { Floaters } from '../../nan-trip/mushrooms/fx'
import { buildBoard, CLOUD_Y, m, SLAB, TOY, type Board } from './board'
import { POKES, type PinId, type PokeId } from './geo'

export interface ThaiMapEvents extends LegEvents {
  /** She poked a thing (ThaiMap.tsx plays its sound and Sparkle's fact). */
  poke(id: PokeId): void
  /** She tapped a place's toy: as if she'd tapped its pin. */
  pin(id: PinId): void
  /** She poked a balloon (no words: a whoosh). */
  balloon(i: number): void
}

export const BALLOONS = 3
export const THAI_MAP_ANCHORS: AnchorInfo[] = [
  ...POKES.map((p): AnchorInfo => ({ id: `poke:${p.id}`, label: p.label, kind: 'thing' })),
  ...Array.from({ length: BALLOONS }, (_, i): AnchorInfo => ({ id: `balloon:${i}`, label: 'A hot-air balloon', kind: 'thing' })),
]

/** Where each poke's tap target sits above its spot (m), and how big it is. */
const POKE_SPOT: Record<PokeId, [y: number, r: number]> = {
  elephant: [0.1, 0.11],
  clouds: [CLOUD_Y, 0.18],
  gibbon: [0.15, 0.11],
  buffalo: [0.08, 0.1],
  hornbill: [0.12, 0.09],
  tuktuk: [0.07, 0.09],
  dolphins: [0.03, 0.12],
  boat: [0.05, 0.12],
  palm: [0.16, 0.1],
}

const tmp = new Vector3()

export class ThaiMapWorld extends Stage {
  private b: Board
  private pokeT = new Map<string, number>()
  private sparkles: Floaters
  private drops: Floaters
  private foam: Floaters
  private pinSize = 96

  constructor(renderer: WebGLRenderer, private ev: ThaiMapEvents) {
    super(renderer, ev)
    this.scene.background = new Color('#E9E1F6')
    this.rig.fov = 32
    this.rig.lag = 0.5
    this.b = buildBoard(this.bag)
    this.scene.add(this.b.root)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 120, this.bag, 0.6, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF'], 120, this.bag, 2.2, 0.2)
    this.foam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E8F7FC'], 90, this.bag, 0, 2.5)
    this.scene.add(this.sparkles.mesh, this.drops.mesh, this.foam.mesh)
  }

  setSize(w: number, h: number, top: number) {
    // The pins: about a ninth of the short side, 64-104 px (as on the flat map).
    this.pinSize = clamp(Math.min(w, h) * 0.11, 64, 104)
    super.setSize(w, h, top)
  }

  /** A place's toy bounces (its pin was tapped). */
  bouncePlace(id: PinId) {
    this.pokeT.set(`place:${id}`, this.time)
    const [x, y, z] = this.b.pinTop[id]
    this.sparkles.burst(tmp.set(x, y - 0.3, z), 18, 0.5, 0.6, 0.7, 0.025)
  }

  // ---------------------------------------------------------------- the frame

  private since(key: string) {
    return this.time - (this.pokeT.get(key) ?? -99)
  }

  protected step(dt: number, t: number) {
    const p = this.b.pokes
    const R = p.root
    // ---- A poked thing hops (squash and stretch), then each acts its own part ----
    for (const { id } of POKES) {
      const k = clamp(this.since(id) / 0.5, 0, 1)
      const b = bell(k)
      R[id].scale.set(1 + 0.12 * b, 1 + 0.22 * b - (k > 0.75 ? 0.25 * bell((k - 0.75) / 0.25) : 0), 1 + 0.12 * b).multiplyScalar(TOY.poke)
    }
    // The elephant lifts its trunk and sprays.
    const ek = clamp(this.since('elephant') / 1.2, 0, 1)
    p.elephant.trunk.rotation.z = ek < 1 ? 1.6 * bell(Math.min(1, ek * 1.6)) : Math.sin(t * 1.3) * 0.12
    if (ek > 0.25 && ek < 0.7 && Math.random() < dt * 60) {
      p.elephant.trunk.getWorldPosition(tmp)
      this.drops.emit(tmp.setY(tmp.y + 0.05), new Vector3((Math.random() - 0.5) * 0.15, 0.5, (Math.random() - 0.5) * 0.15), 0.5, 0.01)
    }
    // The cloud drifts; poked, it rains.
    const cl = p.clouds
    const [cx, cz] = m(POKES.find((q) => q.id === 'clouds')!.at)
    cl.position.set(cx + Math.sin(t * 0.3) * 0.04, SLAB + Math.sin(t * 0.7) * 0.012, cz + Math.cos(t * 0.25) * 0.02)
    const rk = this.since('clouds')
    if (rk < 1.8 && Math.random() < dt * 50) this.drops.emit(tmp.set(cl.position.x + (Math.random() - 0.5) * 0.3, cl.position.y + CLOUD_Y * TOY.poke - 0.04, cl.position.z + (Math.random() - 0.5) * 0.15), new Vector3(0, -0.5, 0), 0.6, 0.01)
    // The gibbon swings from its branch (a little always, a big swing when poked).
    const gk = this.since('gibbon')
    p.gibbon.swing.rotation.z = Math.sin(t * 2.2) * 0.15 + (gk < 1.8 ? Math.sin(gk * 9) * 0.9 * (1 - gk / 1.8) : 0)
    // The buffalo grazes; poked, it tosses its head.
    const bk = clamp(this.since('buffalo') / 0.6, 0, 1)
    p.buffalo.head.rotation.z = bk < 1 ? 0.5 * bell(bk) : -Math.max(0, Math.sin(t * 0.8)) * 0.45
    // The hornbill flaps.
    const hk = this.since('hornbill')
    for (const [i, w] of p.hornbill.wings.entries()) w.rotation.x = (i ? 1 : -1) * (hk < 1 ? Math.abs(Math.sin(hk * 22)) * 1.0 : 0.05)
    // The tuk-tuk zips round the block and back (and jiggles its engine meanwhile).
    const tk = clamp(this.since('tuktuk') / 1.4, 0, 1)
    const a = tk < 1 ? tk * Math.PI * 2 : 0
    const tb = p.tuktuk.body
    tb.position.set(Math.sin(a) * 0.1, Math.abs(Math.sin(t * 18)) * 0.004, (1 - Math.cos(a)) * 0.07)
    tb.rotation.y = tk < 1 ? -a : 0
    // The dolphins leap, one after the other; otherwise they peek up now and then.
    const dk = this.since('dolphins')
    for (const [i, d] of p.dolphins.entries()) {
      const k = clamp((dk - i * 0.25) / 0.9, 0, 1)
      const body = d.children[0] as Object3D
      if (k > 0 && k < 1) {
        body.position.set((k - 0.5) * 0.18, bell(k) * 0.16 - 0.005, 0)
        body.rotation.z = (0.5 - k) * 2.2
        if (Math.random() < dt * 30 && (k < 0.12 || k > 0.88)) {
          d.getWorldPosition(tmp)
          this.drops.burst(tmp.setY(0.02), 3, 0.25, 0.4, 0.4, 0.008)
        }
      } else {
        const peek = Math.max(0, Math.sin(t * 0.9 + i * 2.3))
        body.position.set(0, -0.03 + peek * 0.03, 0)
        body.rotation.z = Math.sin(t * 0.9 + i * 2.3) * 0.2
      }
    }
    // The longtail bobs; poked, it zooms round a loop, foam behind it.
    const ok = clamp(this.since('boat') / 2.2, 0, 1)
    const hull = p.boat.hull
    const oa = ok < 1 ? ok * Math.PI * 2 : 0
    hull.position.set(Math.sin(oa) * 0.14, Math.sin(t * 2) * 0.004, (Math.cos(oa) - 1) * -0.1)
    hull.rotation.y = ok < 1 ? -oa : 0
    hull.rotation.x = Math.sin(t * 1.7) * 0.05
    if (ok > 0 && ok < 1 && Math.random() < dt * 40) {
      hull.getWorldPosition(tmp)
      this.foam.emit(tmp.setY(0.012), new Vector3(0, 0.02, 0), 0.9, 0.014)
    }
    // The palm sways; poked, a coconut drops and bounces.
    const pk = this.since('palm')
    p.palm.fronds.rotation.z = Math.sin(t * 1.5) * 0.05 + (pk < 1 ? Math.sin(pk * 20) * 0.2 * (1 - pk) : 0)
    const nut = p.palm.coconut
    if (pk < 1.4) {
      const k = clamp(pk / 0.45, 0, 1)
      const bounce = pk > 0.45 ? bell(clamp((pk - 0.45) / 0.35, 0, 1)) * 0.04 : 0
      nut.position.set(0.05 + clamp(pk - 0.45, 0, 1) * 0.08, 0.21 - k * k * 0.2 + bounce, 0.012)
    } else nut.position.set(0.05, 0.21, 0.012)
    // ---- The balloons drift and bob; a poked one puffs and rises, then floats back down ----
    for (const [i, g] of this.b.balloons.entries()) {
      const k = this.since(`balloon:${i}`)
      const up = k < 3 ? bell(clamp(k / 3, 0, 1)) * 0.3 : 0
      g.userData.y0 ??= g.position.y
      g.userData.x0 ??= g.position.x
      g.position.y = (g.userData.y0 as number) + Math.sin(t * 0.8 + i * 2) * 0.03 + up
      g.position.x = (g.userData.x0 as number) + Math.sin(t * 0.2 + i) * 0.05
      const puff = k < 0.4 ? bell(k / 0.4) : 0
      g.scale.setScalar((1 + puff * 0.12) * TOY.balloon)
    }
    // ---- A place bounces when she taps it ----
    for (const id of Object.keys(this.b.places) as PinId[]) {
      const k = clamp(this.since(`place:${id}`) / 0.45, 0, 1)
      const b = bell(k)
      this.b.places[id].scale.set(1 + 0.08 * b, 1 + 0.15 * b, 1 + 0.08 * b).multiplyScalar(TOY.place)
    }
    for (const f of [this.sparkles, this.drops, this.foam]) f.update(dt)
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots() {
    return [...Object.values(this.b.places), ...this.b.balloons, ...Object.values(this.b.pokes.root)]
  }

  protected onTap(id: string | null) {
    if (!id) return
    if (id.startsWith('place:')) return this.ev.pin(id.slice(6) as PinId)
    if (id.startsWith('balloon:')) {
      const i = Number(id.slice(8))
      if (this.since(id) > 1.5) this.pokeT.set(id, this.time)
      this.ev.balloon(i)
      return
    }
    const pid = (id.startsWith('poke:') ? id.slice(5) : id) as PokeId
    if (!POKES.some((q) => q.id === pid)) return
    this.pokeT.set(pid, this.time)
    this.ev.poke(pid)
  }

  // ---------------------------------------------------------------- camera and tap targets

  protected shot(): Shot {
    // Thailand runs from about (-1.6, -3.0) to (1.7, 2.9): the whole country on screen, north up. A wide screen sees it
    // from a little lower (more of the table at the sides); a tall one from higher, so the long tail fits.
    // A very wide, short screen (an iPhone on its side) would show the tall country tiny, its pins and pokes on top of
    // each other: there the camera swings round to the west side, so the country runs across the screen (north left).
    const tall = this.w < this.h
    if (this.w > this.h * 1.75) return { center: new Vector3(0.08, 0.35, 0.1), half: new Vector3(1.7, 0.45, 3.0), yaw: -90, pitch: 50, minDist: 3 }
    if (tall) return { center: new Vector3(0.08, 0.35, 0.3), half: new Vector3(1.7, 0.45, 2.95), yaw: 0, pitch: 60, minDist: 3 }
    return { center: new Vector3(0.08, 0.35, 0.3), half: new Vector3(1.5, 0.45, 2.65), yaw: 0, pitch: 42, minDist: 3 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (id.startsWith('pin:')) {
      const at = this.b.pinTop[id.slice(4) as PinId]
      return at ? { at: new Vector3(...at), r: 10, max: this.pinSize, prio: 6 } : null
    }
    if (id.startsWith('balloon:')) {
      const g = this.b.balloons[Number(id.slice(8))]
      return g ? { at: g.position.clone().setY(g.position.y - 0.04), r: 0.15, max: 120, prio: 4 } : null
    }
    if (id.startsWith('poke:')) {
      const pid = id.slice(5) as PokeId
      const g = this.b.pokes.root[pid]
      const [y, r] = POKE_SPOT[pid]
      return { at: g.position.clone().setY(g.position.y + y * TOY.poke), r: r * TOY.poke * 0.8, max: 130, prio: 3 }
    }
    return null
  }

  /** Where a pin's bubble is on screen (for the stamp and QA). */
  pinScreen(id: PinId) {
    const c = new Vector3(...this.b.pinTop[id]).project(this.rig.camera)
    return { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }

  qa() {
    const pins: Record<string, [number, number]> = {}
    for (const id of Object.keys(this.b.pinTop) as PinId[]) {
      const s = this.pinScreen(id)
      pins[id] = [Math.round(s.x), Math.round(s.y)]
    }
    return { game: 'thailand-map', pins, touches: this.touches }
  }
}
