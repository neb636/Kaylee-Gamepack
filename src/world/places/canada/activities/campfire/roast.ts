// The marshmallow roast (Flashlight Statues' side verb, kept from the 2D game). A roasting stick is propped over the
// fire: its end under a flat stone, its middle in a forked twig, its tip in the flames (`Spit`). Nobody has to hold it,
// so it never floats and never goes through anybody. What she holds is the marshmallow itself (`Mallow`): out of
// Maple's bag, onto the stick, where it puffs up and goes golden, then brown, then catches fire (a tap blows it out: a
// black, crunchy one); then off the stick and to whoever ordered that kind (orders.ts: their wish bubbles). This file
// is the stick and the marshmallow and how it toasts; the world (world.ts) moves it and decides who eats. Monty's
// order is a giant one on a thick branch (`size`): bigger, and slower to toast.
import { Color, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, Quaternion, Vector3 } from 'three'
import { clamp } from '../../../../../sdk/math'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, type V3 } from '../../../../engine3d/geo'
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
  /** The giant one toasts this many times slower. */
  giant: number
  /** A squishy one: warm at least this much (0..1 of the way to golden; 0: white, straight out of the bag, as its
   *  picture shows). */
  squishy: number
}

/** What somebody wants: just warm and squishy, golden, burnt black, or Monty's giant one (any way at all). */
export type Want = 'squishy' | 'golden' | 'burnt' | 'giant'

const UP = new Vector3(0, 1, 0)

/** The roasting stick, propped over the fire (`fire`: the fire's middle on the ground). Its far end is under a flat
 *  stone at the front right of the fire ring, a forked twig holds it up, and its tip is just in front of the flames'
 *  top, where a marshmallow shows against them. */
export class Spit {
  readonly root = new Group()
  /** Where a marshmallow sits on it (its middle, in the world), and which way the stick runs there. */
  readonly tip = new Vector3()
  readonly dir = new Vector3()
  /** How the marshmallow is turned when it's skewered on the stick. */
  readonly turn = new Quaternion()
  private thin: Group
  private thick: Group

  constructor(bag: Bag, fire: V3) {
    const base = new Vector3(0.8, 0.045, 0.66)
    const end = new Vector3(0.0, 0.52, 0.15)
    this.dir.copy(end).sub(base).normalize()
    this.turn.setFromUnitVectors(UP, this.dir)
    const len = end.distanceTo(base)
    const along = (k: number) => base.clone().addScaledVector(this.dir, len * k)
    const rodRot = this.turn
    const rod = (r: number, color: string) => {
      const g = solid(merge([P.cyl(r * 0.8, r, len, color, { at: [0, len / 2, 0] }, 8), P.cyl(r * 1.08, r * 1.08, 0.09, '#8A5A3A', { at: [0, 0.2, 0] }, 8)]), bag, 1.6)
      g.position.copy(base)
      g.quaternion.copy(rodRot)
      return g
    }
    this.thin = rod(0.024, '#B88A5A')
    // (Monty's: a thick branch, a knot and a twig stub on it.)
    this.thick = rod(0.042, '#A07A52')
    this.thick.visible = false
    // The forked twig that holds it up (planted in the ground under the stick's middle), and the flat stone on its end.
    const f = along(0.42)
    const y = f.y - 0.03
    const prop = solid(
      merge([
        P.cyl(0.026, 0.032, y, '#8A5A3A', { at: [f.x, y / 2, f.z] }, 8),
        ...[-1, 1].map((s) => P.capsule(0.02, 0.16, '#8A5A3A', { at: [f.x + s * 0.05, y + 0.07, f.z + s * 0.045], rot: [s * 0.42, 0, -s * 0.48] })),
        P.sphere(0.17, '#8C8798', { at: [base.x + 0.05, 0.05, base.z + 0.04], scale: [1.25, 0.5, 1] }, 12),
      ]),
      bag,
      1.6,
    )
    this.root.add(this.thin, this.thick, prop, blobShadow(0.28, bag).translateX(base.x - 0.1).translateZ(base.z - 0.06))
    this.root.position.set(...fire)
    this.tip.copy(end).add(this.root.position)
  }

  /** The thick branch for Monty's giant one, or the stick. */
  set giant(v: boolean) {
    this.thick.visible = v
    this.thin.visible = !v
  }
}

/** The marshmallow in play: in her fingers, on the stick, or on its way to somebody's mouth. */
export class Mallow {
  readonly root = new Group()
  private body: Group
  private mat: MeshToonMaterial
  private flames: Group
  /** Toasting: seconds of full heat so far, golden yet, on fire, burnt black. */
  toast = 0
  golden = false
  fire = false
  fireT = 0
  charred = false
  /** How hot it is right now (0..1). */
  heat = 0
  /** A new marshmallow pops on (seconds since). */
  private popT = 9
  /** 1, or the giant marshmallow. */
  size = 1
  /** Bigger in her fingers, shrinking into a mouth (the world sets it). */
  grow = 1

  constructor(bag: Bag) {
    // The marshmallow: its own toon color (it toasts), and an outline.
    this.mat = bag.add(new MeshToonMaterial({ color: '#FFFDF8', gradientMap: toonGradient() }))
    // (Big: the thing she picks up has to be easy to see and to find.)
    const geo = bag.add(P.cyl(0.085, 0.085, 0.14, '#ffffff', {}, 18))
    this.body = new Group()
    this.body.add(new Mesh(geo, this.mat))
    const hull = makeHull(geo, 1.8)
    bag.add(hull.geometry)
    this.body.add(hull)
    this.root.add(this.body)
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
    this.root.visible = false
  }

  /** A fresh white marshmallow (`size`: 1, or bigger for Monty's giant one). */
  fresh(size = this.size) {
    this.size = size
    this.toast = 0
    this.golden = false
    this.fire = false
    this.charred = false
    this.popT = 0
    this.grow = 1
  }
  /** Is it toasted enough to be a treat (golden or past it, or burnt)? */
  get done() {
    return this.charred || this.toast >= 0.75
  }
  /** Is it what they wanted? `miss` is how many times they've had the wrong one: once and the kind they want is
   *  wider; twice and anything will do (she never misses over and over). */
  matches(want: Want, k: RoastKnobs, miss = 0) {
    if (miss >= 2) return true
    const g = this.toast
    const burnt = this.charred || this.fire
    if (want === 'burnt') return burnt || (miss > 0 && g >= 1)
    if (burnt) return want === 'giant'
    if (want === 'squishy') return g >= (miss > 0 ? 0 : k.squishy) && g < (miss > 0 ? 0.95 : 0.8)
    if (want === 'golden') return g >= (miss > 0 ? 0.6 : 0.85)
    return g >= (miss > 0 ? 0.2 : 0.5)
  }

  /** Toasting: `heat` 0..1 (on the stick over the flames: 1 or more; anywhere else: 0). Returns what happened. */
  update(dt: number, t: number, heat: number, k: RoastKnobs): 'golden' | 'fire' | 'out' | null {
    let ev: 'golden' | 'fire' | 'out' | null = null
    this.heat = this.charred || this.fire ? 0 : heat
    const slow = Math.max(0.1, k.golden * (this.size > 1 ? k.giant : 1))
    if (!this.fire && !this.charred) {
      this.toast += (this.heat * dt) / slow
      if (!this.golden && this.toast >= 1) {
        this.golden = true
        ev = 'golden'
      }
      if (this.toast >= 1 + k.burn / slow) {
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
    const c = this.mat.color
    if (this.charred) c.copy(BURNT)
    else if (g < 0.5) c.lerpColors(WHITE, CREAM, g / 0.5)
    else if (g < 1) c.lerpColors(CREAM, GOLD, (g - 0.5) / 0.5)
    else c.lerpColors(GOLD, BROWN, clamp((g - 1) * 1.4))
    // (It glows a little by itself: in her fingers it's in front of the fire, its lit side away from us, and its
    // toast color has to show just when she's judging it against the picture.)
    this.mat.emissive.copy(c).multiplyScalar(this.charred ? 0.25 : 0.55)
    // It puffs up as it toasts, jiggles while it's hot, pops on fresh.
    this.popT += dt
    const puff = (1 + 0.25 * clamp(g) - (this.charred ? 0.12 : 0)) * this.size * this.grow
    const pop = this.popT < 0.35 ? 0.4 + 0.6 * (this.popT / 0.35) + 0.25 * Math.sin((this.popT / 0.35) * Math.PI) : 1
    const jig = this.heat > 0.05 ? 1 + 0.05 * Math.sin(t * 24) * Math.min(1, this.heat) : 1
    this.body.scale.set(puff * pop * jig, puff * pop, puff * pop * jig)
    this.flames.visible = this.fire
    if (this.fire) {
      // (Straight up, whichever way the marshmallow is turned.)
      this.flames.quaternion.copy(this.root.quaternion).invert()
      this.flames.position.set(0, 0.07 * this.size, 0).applyQuaternion(this.flames.quaternion)
      this.flames.scale.setScalar(1.4 * this.size)
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
}
