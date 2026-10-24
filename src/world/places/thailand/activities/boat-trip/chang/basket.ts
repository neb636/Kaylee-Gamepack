// Daddy's woven bamboo basket on a tree stump, and the foods in it: four bananas on the left, four sticks of
// sugarcane on the right. The same eight foods go round and round: she pulls one out, a trunk takes it, it's eaten, and a
// moment later it's back in the basket (Daddy brought plenty), so the toy never runs out.
import { Group, Vector3, type Object3D } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { BASKET, type FoodKind } from './layout'

const WEAVE = '#E2B878'
const WEAVE_DARK = '#C99A5E'
const STUMP = '#B08463'

/** One banana: a curved yellow arc with a brown stalk and tip. */
export function banana(bag: Bag) {
  return solid(
    merge([
      P.torus(0.17, 0.05, '#FFE16B', { rot: [0, 0, -0.35] }, 1.75),
      P.cyl(0.022, 0.03, 0.08, '#8B6A4E', { at: [0.15, 0.1, 0], rot: [0, 0, -0.9] }, 6),
      P.sphere(0.03, '#6E5340', { at: [-0.07, 0.165, 0] }, 6),
    ]),
    bag,
    1.5,
  )
}
/** One stick of sugarcane: a pale green stalk with darker rings at its joints. */
export function cane(bag: Bag) {
  return solid(
    merge([P.cyl(0.04, 0.042, 0.56, '#CFE07A', {}, 8), ...[-0.18, 0, 0.18].map((y) => P.cyl(0.048, 0.048, 0.035, '#8FA64A', { at: [0, y, 0] }, 8)), P.cyl(0.03, 0.03, 0.01, '#F4F0C8', { at: [0, 0.28, 0] }, 8)]),
    bag,
    1.5,
  )
}

export interface Food {
  kind: FoodKind
  obj: Group
  /** Its place in the basket (world). */
  home: Vector3
  homeRot: number
  /** in the basket, in her hand (or gliding to a trunk), falling, on the gravel, in a trunk, flying from one trunk to
   *  another, eaten. */
  state: 'basket' | 'held' | 'falling' | 'ground' | 'carried' | 'flying' | 'eaten'
  /** Seconds in this state, and its fall speed. */
  t: number
  vy: number
}

export class Basket {
  readonly root = new Group()
  readonly foods: Food[] = []
  private body: Group
  private wobble = 1

  constructor(bag: Bag, scene: Object3D) {
    const { x, y, z, r } = BASKET
    // The stump, and the basket on it: a tapered weave with bands round it and a rim.
    this.root.add(solid(merge([P.cyl(0.36, 0.42, y - 0.28, STUMP, { at: [x, (y - 0.28) / 2, z] }, 14), P.cyl(0.34, 0.34, 0.02, '#E8C9A0', { at: [x, y - 0.27, z] }, 14)]), bag, 2))
    this.body = new Group()
    this.body.position.set(x, y - 0.28, z)
    this.body.add(
      solid(
        merge([
          P.cyl(r, r * 0.78, 0.36, WEAVE, { at: [0, 0.18, 0] }, 18),
          ...[0.07, 0.16, 0.25].map((h, i) => P.torus(r * (0.8 + h * 0.6), 0.022, i % 2 ? WEAVE : WEAVE_DARK, { at: [0, h, 0], rot: [Math.PI / 2, 0, 0] })),
          P.torus(r, 0.04, WEAVE_DARK, { at: [0, 0.36, 0], rot: [Math.PI / 2, 0, 0] }),
        ]),
        bag,
        2,
      ),
    )
    this.root.add(this.body)
    // Four bananas fanned on the left, four sticks of cane standing up on the right.
    for (let i = 0; i < 4; i++) {
      const home = new Vector3(x - r * 0.45 + (i % 3) * 0.06 - 0.05, y + 0.04 + Math.floor(i / 3) * 0.06, z - 0.1 + (i % 3) * 0.1)
      this.add('banana', banana(bag), home, -0.4 + i * 0.2, scene)
    }
    for (let i = 0; i < 4; i++) {
      const home = new Vector3(x + r * 0.32 + (i % 2) * 0.12 - 0.04, y + 0.17, z - 0.14 + i * 0.07)
      this.add('cane', cane(bag), home, 0.15 - i * 0.07, scene)
    }
  }

  private add(kind: FoodKind, obj: Group, home: Vector3, rot: number, scene: Object3D) {
    obj.position.copy(home)
    obj.rotation.set(kind === 'banana' ? 0.5 : 0, rot, kind === 'banana' ? 0 : rot)
    obj.userData.pick = `food:${kind}`
    scene.add(obj)
    this.foods.push({ kind, obj, home, homeRot: rot, state: 'basket', t: 0, vy: 0 })
  }

  /** The next food of that kind still in the basket (or of the other kind, so a press always gets one). */
  next(kind: FoodKind): Food | null {
    return this.foods.find((f) => f.state === 'basket' && f.kind === kind) ?? this.foods.find((f) => f.state === 'basket') ?? null
  }
  /** Where a kind's tap target goes: its top food, or where they sit. */
  spot(kind: FoodKind, out: Vector3) {
    const f = this.foods.find((x) => x.state === 'basket' && x.kind === kind) ?? this.foods.find((x) => x.kind === kind)!
    return out.copy(f.home).add(new Vector3(0, kind === 'cane' ? 0.05 : 0.04, 0.05))
  }

  /** Back in its place (Daddy pops it in), with a little wobble of the basket. */
  putBack(f: Food) {
    f.state = 'basket'
    f.t = 0
    f.obj.visible = true
    f.obj.position.copy(f.home)
    f.obj.rotation.set(f.kind === 'banana' ? 0.5 : 0, f.homeRot, f.kind === 'banana' ? 0 : f.homeRot)
    f.obj.scale.setScalar(0.01)
    this.wobble = 0
  }
  poke() {
    this.wobble = 0
  }

  update(dt: number) {
    this.wobble = Math.min(1, this.wobble + dt / 0.5)
    const w = this.wobble < 1 ? Math.sin(this.wobble * Math.PI * 3) * (1 - this.wobble) : 0
    this.body.rotation.z = w * 0.12
    this.body.scale.set(1 + w * 0.05, 1 - w * 0.05, 1 + w * 0.05)
    // Foods that just went back in grow into place.
    for (const f of this.foods) if (f.state === 'basket' && f.obj.scale.x < 1) f.obj.scale.setScalar(Math.min(1, f.obj.scale.x + dt * 4))
  }
}
