// The marshmallow roast (Flashlight Statues' side verb, kept from the 2D game): a long stick with a marshmallow on the
// end lies by the fire. She picks it up and holds it near the flames: it puffs up and goes golden, then brown, then
// catches fire (a tap blows it out: a black, crunchy one). Then she hands it to whoever she likes. This file is the
// stick and the marshmallow and how they toast; the world (world.ts) moves them and decides who eats.
import { Color, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, Vector3 } from 'three'
import { clamp } from '../../../../../sdk/math'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { makeHull } from '../../../../engine3d/outline'
import { toonGradient } from '../../../../engine3d/toon'

const WHITE = new Color('#FFFDF8')
const CREAM = new Color('#F7E3B5')
const GOLD = new Color('#E8B15A')
const BROWN = new Color('#9A5A2A')
const BURNT = new Color('#3A2E36')

export interface RoastKnobs {
  golden: number
  burn: number
  out: number
}

const up = new Vector3(0, 1, 0)

export class Stick {
  readonly root = new Group()
  /** The stick (its +y runs from the end she holds to the tip). */
  private rod: Group
  private mallow: Group
  private mallowMat: MeshToonMaterial
  private flames: Group
  /** Toasting: seconds of full heat so far, golden yet, on fire, burnt black. */
  toast = 0
  golden = false
  fire = false
  fireT = 0
  charred = false
  /** How hot it is right now (0..1). */
  heat = 0
  /** The marshmallow's middle, in the world. */
  readonly tip = new Vector3()
  /** A new marshmallow pops on (seconds since). */
  private popT = 9

  constructor(bag: Bag) {
    this.rod = solid(merge([P.cyl(0.014, 0.018, 1, '#B88A5A', { at: [0, 0.5, 0] }, 6), P.cyl(0.0185, 0.0185, 0.1, '#8A5A3A', { at: [0, 0.05, 0] }, 6)]), bag, 1.6)
    this.root.add(this.rod)
    // The marshmallow: its own toon color (it toasts), and an outline.
    this.mallowMat = bag.add(new MeshToonMaterial({ color: '#FFFDF8', gradientMap: toonGradient() }))
    const geo = bag.add(P.cyl(0.06, 0.06, 0.1, '#ffffff', {}, 14))
    this.mallow = new Group()
    this.mallow.add(new Mesh(geo, this.mallowMat))
    const hull = makeHull(geo, 1.8)
    bag.add(hull.geometry)
    this.mallow.add(hull)
    this.root.add(this.mallow)
    // Little flames when it's on fire (they glow on their own).
    this.flames = new Group()
    const flameMat = (c: string) => bag.add(new MeshBasicMaterial({ color: c, fog: false }))
    for (const [r, h, c, x] of [
      [0.05, 0.16, '#FF6A3A', 0],
      [0.035, 0.11, '#FFA640', 0.03],
      [0.03, 0.09, '#FFE7A0', -0.02],
    ] as [number, number, string, number][]) {
      const m = new Mesh(bag.add(merge([P.sphere(r, '#fff', { scale: [1, 0.8, 1] }, 10), P.cone(r * 0.98, h, '#fff', { at: [0, h / 2, 0] }, 10)])), flameMat(c))
      m.position.x = x
      this.flames.add(m)
    }
    this.flames.visible = false
    this.root.add(this.flames)
  }

  /** A fresh white marshmallow on the stick. */
  fresh() {
    this.toast = 0
    this.golden = false
    this.fire = false
    this.charred = false
    this.popT = 0
  }
  /** Is it toasted enough to be a treat (golden or past it, or burnt)? */
  get done() {
    return this.charred || this.toast >= 0.75
  }

  /** Lays the stick from `end` (the end she holds) to `tip` (the marshmallow's middle). */
  lay(end: Vector3, tip: Vector3) {
    const d = tip.clone().sub(end)
    const len = d.length()
    this.rod.position.copy(end)
    this.rod.quaternion.setFromUnitVectors(up, d.normalize())
    this.rod.scale.set(1, len, 1)
    this.tip.copy(tip)
    this.mallow.position.copy(tip)
    this.mallow.quaternion.copy(this.rod.quaternion)
  }

  /** Toasting: `heat` 0..1 from how near the flames it is. Returns what happened this frame. */
  update(dt: number, t: number, heat: number, k: RoastKnobs): 'golden' | 'fire' | 'out' | null {
    let ev: 'golden' | 'fire' | 'out' | null = null
    this.heat = this.charred || this.fire ? 0 : heat
    if (!this.fire && !this.charred) {
      this.toast += (this.heat * dt) / Math.max(0.1, k.golden)
      if (!this.golden && this.toast >= 1) {
        this.golden = true
        ev = 'golden'
      }
      if (this.toast >= 1 + k.burn / Math.max(0.1, k.golden)) {
        this.fire = true
        this.fireT = 0
        ev = 'fire'
      }
    } else if (this.fire && (this.fireT += dt) > k.out) {
      this.blowOut()
      ev = 'out'
    }
    // White, then cream, golden, brown; black once it has burnt.
    const g = this.toast
    const c = this.mallowMat.color
    if (this.charred) c.copy(BURNT)
    else if (g < 0.5) c.lerpColors(WHITE, CREAM, g / 0.5)
    else if (g < 1) c.lerpColors(CREAM, GOLD, (g - 0.5) / 0.5)
    else c.lerpColors(GOLD, BROWN, clamp((g - 1) * 1.4))
    // It puffs up as it toasts, jiggles while it's hot, pops on fresh.
    this.popT += dt
    const puff = 1 + 0.25 * clamp(g) - (this.charred ? 0.12 : 0)
    const pop = this.popT < 0.35 ? 0.4 + 0.6 * (this.popT / 0.35) + 0.25 * Math.sin((this.popT / 0.35) * Math.PI) : 1
    const jig = this.heat > 0.05 ? 1 + 0.05 * Math.sin(t * 24) * this.heat : 1
    this.mallow.scale.set(puff * pop * jig, puff * pop, puff * pop * jig)
    this.flames.visible = this.fire
    if (this.fire) {
      this.flames.position.copy(this.tip).add(new Vector3(0, 0.05, 0))
      this.flames.children.forEach((m, i) => m.scale.set(1 + 0.12 * Math.sin(t * 19 + i), 1 + 0.25 * Math.sin(t * 23 + i * 2), 1))
    }
    return ev
  }

  /** Puff! A burning marshmallow goes out: black and crunchy. */
  blowOut() {
    if (!this.fire) return false
    this.fire = false
    this.charred = true
    return true
  }

  /** Hidden while it's being eaten (Monty eats the stick too). */
  set visible(v: boolean) {
    this.root.visible = v
  }
}
