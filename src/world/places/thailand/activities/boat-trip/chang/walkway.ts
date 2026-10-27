// Baan Chang's raised boardwalk (`boardwalk`; plan: "The raised boardwalk"), from the cafe down to the yard: dark
// steel posts and handrails, mesh panels along the far side (the near side has only its rails, so she shows through),
// planks over the sandy ground, five steps down to the gravel by the blue bench, and rows of oil palms behind it. Two pokes on
// the way: a gecko on a post of the near rail ("to-kay!", it scurries up and back), and a palm that shakes when she taps
// it, so a frond floats down. Mommy and Daddy tag along behind her (Tagalong).
import { Group, Vector3 } from 'three'
import type { Member } from '../../../characters/member'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { GECKO, SHAKE_PALM, WALK } from './layout'
import { FROND, FROND_DARK, groundScatter, meshPanel, oilPalm, oilPalmParts } from './nature'
import { STEEL } from './yard'

const PLANK = '#B7865C'
const PLANK_LIGHT = '#C99A6E'

export interface Walkway {
  root: Group
  gecko: Group
  /** The palm she can shake, its crown on its own pivot, and the frond that floats down from it. */
  palm: Group
  crown: Group
  frond: Group
}

export function buildWalkway(bag: Bag): Walkway {
  const root = new Group()
  const { z, w, y, x0, xs, x1 } = WALK
  // (The planks run on past x1, toward the cafe, so Mommy and Daddy behind her have planks under them.)
  const xe = x1 + 2.6
  const len = xe - xs
  const mid = (xe + xs) / 2
  const near = z + w / 2
  const far = z - w / 2
  // ---- Sand under it ----
  root.add(solid(merge([P.box(len + 6, 0.012, 7, '#E6DCC6', { at: [mid, 0.007, z] }), ...groundScatter(xs, xe, z - 3.2, z + 3, 5, 0, 36)]), bag, 0))
  // (Green patches in the sand, where the grass grows back.)
  root.add(solid(merge(Array.from({ length: 7 }, (_, i) => P.cyl(0.7 + (i % 3) * 0.3, 0.7 + (i % 3) * 0.3, 0.01, i % 2 ? '#B9D98F' : '#A9CF84', { at: [xs + 1 + i * 2.1, 0.015, z - 2.2 - (i % 2) * 1.6 + (i % 3 ? 0 : 4.4)], scale: [1.6, 1, 0.8] }, 12))), bag, 0))
  // ---- The planks, the posts under them, and the steps down ----
  const deck = [
    P.box(len, 0.1, w, PLANK_LIGHT, { at: [mid, y - 0.05, z] }),
    ...Array.from({ length: Math.round(len / 0.5) }, (_, i) => P.box(0.02, 0.006, w, PLANK, { at: [xs + 0.25 + i * 0.5, y + 0.002, z] })),
    ...Array.from({ length: Math.round(len / 2) + 1 }, (_, i) => [near - 0.08, far + 0.08].map((pz) => P.box(0.12, y - 0.1, 0.12, '#7A5A3A', { at: [xs + i * 2, (y - 0.1) / 2, pz] }))).flat(),
  ]
  for (let i = 0; i < WALK.steps; i++) {
    const sx = x0 + ((i + 0.5) / WALK.steps) * (xs - x0)
    const sy = (y * (i + 1)) / WALK.steps
    deck.push(P.box((xs - x0) / WALK.steps + 0.02, sy, w, i % 2 ? PLANK : PLANK_LIGHT, { at: [sx, sy / 2, z] }))
  }
  root.add(solid(merge(deck), bag, 1.5))
  // ---- The rails: dark steel posts and handrails both sides, mesh panels along the far side ----
  const rail = []
  for (let x = xs; x <= xe + 0.01; x += 1.6)
    for (const pz of [near, far]) rail.push(P.cyl(0.035, 0.035, 0.95, STEEL, { at: [x, y + 0.47, pz] }, 6))
  for (const pz of [near, far]) {
    rail.push(P.cyl(0.035, 0.035, len, STEEL, { at: [mid, y + 0.95, pz], rot: [0, 0, Math.PI / 2] }, 8))
    rail.push(P.cyl(0.025, 0.025, len, STEEL, { at: [mid, y + 0.45, pz], rot: [0, 0, Math.PI / 2] }, 6))
    // Down the steps, the handrail slopes with them.
    const sl = Math.hypot(xs - x0, y)
    rail.push(P.cyl(0.035, 0.035, sl, STEEL, { at: [(x0 + xs) / 2, y / 2 + 0.95, pz], rot: [0, 0, Math.PI / 2 + Math.atan2(y, xs - x0)] }, 8))
    rail.push(P.cyl(0.035, 0.035, 0.95, STEEL, { at: [x0, 0.47, pz] }, 6))
  }
  root.add(solid(merge(rail), bag, 1))
  // The see-through steel mesh along the far side, between the handrail and the planks.
  root.add(meshPanel(bag, len, 0.86, [mid, y + 0.48, far]))
  // ---- Oil palms either side (the one she can shake has its own crown) ----
  const palms = []
  for (let i = 0; i < 5; i++) {
    const px = xs + 1.6 + i * 3.2
    if (Math.abs(px - SHAKE_PALM.x) > 1.5) palms.push(...oilPalm(px, z - 2.4 - (i % 2) * 0.6, 5 + (i % 3) * 0.6, i))
    // (A second row further back: none on the camera's side, where they'd stand in front of her.)
    palms.push(...oilPalm(px + 1.4, z - 6.5 - (i % 2) * 0.8, 5.4 + ((i + 1) % 3) * 0.5, i + 2, 0, true))
  }
  root.add(solid(merge(palms), bag, 2))
  const palm = new Group()
  palm.position.set(SHAKE_PALM.x, 0, SHAKE_PALM.z)
  palm.userData.pick = 'palm'
  const { trunk, crown: crownParts } = oilPalmParts(0, 0, SHAKE_PALM.h, 0.6)
  palm.add(solid(merge(trunk), bag, 2))
  const crown = new Group()
  crown.position.y = SHAKE_PALM.h
  crownParts.forEach((g) => g.translate(0, -SHAKE_PALM.h, 0))
  crown.add(solid(merge(crownParts), bag, 2))
  palm.add(crown)
  root.add(palm)
  const frond = solid(merge([P.box(0.4, 0.04, 1.8, FROND_DARK, {}), P.box(0.06, 0.05, 1.8, FROND, { at: [0, 0.02, 0] })]), bag, 1.5)
  frond.visible = false
  root.add(frond)
  // ---- The gecko on a post of the near rail: a bright lime lizard with a pink belly and big eyes (big enough to spot) ----
  const gecko = new Group()
  gecko.position.set(...GECKO)
  gecko.scale.setScalar(1.9)
  gecko.userData.pick = 'gecko'
  gecko.add(
    solid(
      merge([
        P.capsule(0.035, 0.12, '#A6E34F', { at: [0, 0, 0.04] }),
        P.capsule(0.022, 0.09, '#FFB3D1', { at: [0, 0, 0.065], scale: [1, 1, 0.5] }),
        P.sphere(0.045, '#A6E34F', { at: [0, 0.11, 0.05] }, 10),
        P.capsule(0.015, 0.12, '#A6E34F', { at: [0, -0.14, 0.04], rot: [0, 0, 0.3] }),
        ...[-1, 1].flatMap((s) => [P.capsule(0.012, 0.05, '#8ED13F', { at: [s * 0.05, 0.05, 0.05], rot: [0, 0, s * 1.2] }), P.capsule(0.012, 0.05, '#8ED13F', { at: [s * 0.05, -0.05, 0.05], rot: [0, 0, s * 1.9] })]),
        ...[-1, 1].map((s) => P.sphere(0.018, '#2E2233', { at: [s * 0.025, 0.13, 0.085] }, 6)),
        ...[-1, 1].map((s) => P.sphere(0.012, '#FFB3D1', { at: [s * 0.032, 0.095, 0.09] }, 6)),
      ]),
      bag,
      1,
    ),
  )
  root.add(gecko)
  return { root, gecko, palm, crown, frond }
}

/** Someone who tags along behind Kaylee (Mommy, Daddy): toward a goal (or a list of them) at a walk, with a little bob
 *  in each step and a lean into it, turning the way they go; standing, they face `rest`. */
export class Tagalong {
  private goals: [number, number][] = []
  private bob = 0
  private speed = 0
  pos = new Vector3()
  private yaw = 0
  rest = 0
  constructor(
    private c: Member,
    private floor: (x: number) => number,
  ) {}

  /** Starts where they are now (in the world). */
  from(x: number, z: number, faceDeg: number) {
    this.pos.set(x, this.floor(x), z)
    this.yaw = (faceDeg * Math.PI) / 180
    this.rest = faceDeg
    this.goals = []
  }
  /** Walk to (x, z), or through these points. */
  to(...pts: [number, number][]) {
    this.goals = pts
  }
  get walking() {
    return this.goals.length > 0
  }

  update(dt: number) {
    const g = this.goals[0]
    let moving = false
    if (g) {
      const dx = g[0] - this.pos.x
      const dz = g[1] - this.pos.z
      const d = Math.hypot(dx, dz)
      if (d < 0.05) this.goals.shift()
      else {
        moving = true
        // (Hurrying when they're far behind.)
        const left = this.goals.reduce((sum, p, i) => sum + (i ? Math.hypot(p[0] - this.goals[i - 1][0], p[1] - this.goals[i - 1][1]) : d), 0)
        this.speed = Math.min(left > 3 ? 2.7 : 1.9, this.speed + dt * 6, d * 3 + 0.4 + (this.goals.length > 1 ? 2 : 0))
        const step = Math.min(d, this.speed * dt)
        this.pos.x += (dx / d) * step
        this.pos.z += (dz / d) * step
        this.bob += step * 4.2
        const want = Math.atan2(dx, dz)
        let turn = want - this.yaw
        while (turn > Math.PI) turn -= Math.PI * 2
        while (turn < -Math.PI) turn += Math.PI * 2
        this.yaw += turn * Math.min(1, dt * 10)
      }
    }
    if (!moving) {
      this.speed = 0
      // Settle out of the last step, and turn to face where they rest.
      this.bob = this.bob % Math.PI > Math.PI / 2 ? Math.min(Math.ceil(this.bob / Math.PI) * Math.PI, this.bob + dt * 8) : Math.max(Math.floor(this.bob / Math.PI) * Math.PI, this.bob - dt * 8)
      let turn = (this.rest * Math.PI) / 180 - this.yaw
      while (turn > Math.PI) turn -= Math.PI * 2
      while (turn < -Math.PI) turn += Math.PI * 2
      this.yaw += turn * Math.min(1, dt * 4)
    }
    const y = this.floor(this.pos.x) + Math.abs(Math.sin(this.bob)) * 0.07
    this.c.place(this.pos.x, y, this.pos.z, (this.yaw * 180) / Math.PI)
    this.c.rig.body.rotation.x = moving ? 0.08 * Math.min(1, this.speed) : 0
  }
}
