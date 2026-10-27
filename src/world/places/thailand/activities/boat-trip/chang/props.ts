// The yard's greybox props beyond the basket:
// - WantBubble: a picture bubble over an elephant's head (`favorites`): the food it wants, and up to three pips that
//   fill in gold as she feeds it ("One! Two! Three!"). No words, so she can read it. It always faces the camera.
// - Milk: her chocolate milk from the cafe (`drinks`, drink.ts), with the straw she picked. Mommy holds it while she
//   feeds (no cup on the rail); it's on the rail post only in `lamyai`, and goes down a little with each of Khanom's
//   sneaky sips.
// - Splash: the water the elephants spray up over the family (`splash`), and the rainbow that arcs over the yard.
import { Camera, DoubleSide, Group, Mesh, MeshBasicMaterial, SphereGeometry, TorusGeometry, Vector3 } from 'three'
import { bell } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { Particles } from '../../../../../engine3d/particles'
import { PAL, toon } from '../../../../../engine3d/toon'
import { RAINBOW } from '../race/scenery'
import { banana, cane } from './basket'
import { buildGlass, buildStraw, pourInto, STRAW_TOP, type Drink, type Glass } from './drink'
import { MILK, type FoodKind, type StrawColor } from './layout'

const PIPS = 3

export class WantBubble {
  readonly root = new Group()
  private foods: Record<FoodKind, Group>
  private pips: Mesh[] = []
  private shown = 0
  private on = false
  private pop = 1

  constructor(bag: Bag) {
    const face = new Group()
    face.add(solid(merge([P.sphere(0.42, '#FFFFFF', { scale: [1, 0.95, 0.25] }, 18), P.cone(0.12, 0.26, '#FFFFFF', { at: [-0.12, -0.42, 0], rot: [0, 0, -0.5] }, 8)]), bag, 2.5))
    this.root.add(face)
    this.foods = { banana: banana(bag), cane: cane(bag) }
    this.foods.banana.position.set(0, 0.06, 0.12)
    this.foods.banana.scale.setScalar(1.2)
    this.foods.cane.position.set(0, 0.06, 0.12)
    this.foods.cane.rotation.z = 0.5
    this.foods.cane.scale.setScalar(0.85)
    for (const g of Object.values(this.foods)) this.root.add(g)
    const pip = bag.add(new SphereGeometry(0.055, 10, 8))
    for (let i = 0; i < PIPS; i++) {
      const m = new Mesh(pip, toon('#DCD5EA'))
      m.position.set((i - 1) * 0.16, -0.26, 0.12)
      this.pips.push(m)
      this.root.add(m)
    }
    this.root.visible = false
    this.root.scale.setScalar(0.01)
  }

  /** What it wants (null: no bubble), how many in all and how many still to go. */
  set(kind: FoodKind | null, total = 1, left = 1) {
    const was = this.on
    this.on = !!kind
    if (kind) {
      this.foods.banana.visible = kind === 'banana'
      this.foods.cane.visible = kind === 'cane'
      this.pips.forEach((p, i) => {
        p.visible = total > 1 && i < total
        p.material = toon(i < total - left ? PAL.gold : '#DCD5EA')
        p.position.x = (i - (total - 1) / 2) * 0.16
      })
    }
    if (this.on !== was || kind) this.pop = 0
  }

  update(dt: number, camera: Camera, at: Vector3) {
    this.pop = Math.min(1, this.pop + dt / 0.35)
    this.shown += ((this.on ? 1 : 0) - this.shown) * (1 - Math.exp(-dt * 10))
    this.root.visible = this.shown > 0.02
    this.root.position.copy(at)
    this.root.position.y += Math.sin(performance.now() / 600) * 0.04
    this.root.quaternion.copy(camera.quaternion)
    this.root.scale.setScalar(this.shown * (1 + bell(this.pop) * 0.18))
  }
}

export class Milk {
  readonly root = new Group()
  /** 0..1: how full the glass is. */
  level = 0.85
  private glass: Glass
  private drink: Drink = { milk: 0.5, choc: 0.4, coffee: 0, stir: 1, ice: 0 }
  private straws = new Map<StrawColor, Group>()
  private wobble = 1
  /** The top of the straw (world), where a sneaky trunk goes. */
  readonly straw = new Vector3(MILK.x, MILK.y, MILK.z).add(STRAW_TOP)

  constructor(bag: Bag, straw: StrawColor) {
    this.root.position.set(MILK.x, MILK.y, MILK.z)
    this.root.userData.pick = 'milk'
    this.glass = buildGlass(bag)
    this.root.add(this.glass.root)
    for (const c of ['pink', 'purple', 'yellow'] as const) {
      const g = buildStraw(bag, c)
      this.glass.slot.add(g)
      this.straws.set(c, g)
    }
    this.setStraw(straw)
  }

  /** Her straw, the one she picked at the cafe. */
  setStraw(c: StrawColor) {
    for (const [k, g] of this.straws) g.visible = k === c
  }

  /** On the rail post (it grows into place) or not. */
  show(on: boolean) {
    if (on && !this.root.visible) this.root.scale.setScalar(0.01)
    this.root.visible = on
  }

  sip(dt: number) {
    this.level = Math.max(0.2, this.level - dt * 0.09)
    this.wobble = 0
  }
  poke() {
    this.wobble = 0
  }

  update(dt: number) {
    this.wobble = Math.min(1, this.wobble + dt / 0.5)
    const w = this.wobble < 1 ? Math.sin(this.wobble * Math.PI * 4) * (1 - this.wobble) : 0
    this.root.rotation.z = w * 0.1
    if (this.root.scale.x < 1) this.root.scale.setScalar(Math.min(1, this.root.scale.x + dt * 4))
    // (Chocolate milk, all stirred: the level is how much of it is left.)
    this.drink.milk = this.level * 0.8
    this.drink.choc = this.level * 0.4
    pourInto(this.glass, this.drink)
  }
}

export class Splash {
  readonly root = new Group()
  private drops: Particles
  private bands: MeshBasicMaterial[]
  private rainbow = new Group()
  private want = 0

  constructor(bag: Bag) {
    this.drops = new Particles({ kind: 'spray', count: 700, color: '#CDEEFF', gravity: 9 }, bag)
    this.root.add(this.drops.mesh)
    // Six thin see-through bands in an arch over the yard, from one side of the elephants to the other.
    this.rainbow.position.set(0.9, -0.6, -2.4)
    this.bands = RAINBOW.map((c) => bag.add(new MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })))
    this.bands.forEach((m, i) => this.rainbow.add(new Mesh(bag.add(new TorusGeometry(6.2 - i * 0.28, 0.15, 4, 48, Math.PI)), m)))
    this.rainbow.visible = false
    this.root.add(this.rainbow)
  }

  /** The rainbow fades in (and stays). */
  showRainbow() {
    this.want = 0.55
  }

  /** One frame of a trunk spraying up from its tip: drops up into the air and down over the family. */
  spray(tip: Vector3, dt: number) {
    const n = dt * 90
    for (let k = 0; k < n || (k === 0 && Math.random() < n); k++) {
      this.drops.emit(tip.x, tip.y, tip.z, (Math.random() - 0.5) * 2.4, 5.5 + Math.random() * 2.5, 1.2 + Math.random() * 1.6, 2.2, 0.12 + Math.random() * 0.12)
    }
  }

  update(dt: number) {
    this.drops.update(dt)
    const cur = this.bands[0].opacity
    const next = cur + (this.want - cur) * (1 - Math.exp(-dt / 0.8))
    for (const m of this.bands) m.opacity = next
    this.rainbow.visible = next > 0.01
  }
}
