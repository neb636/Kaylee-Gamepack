// The farm's little ambient life, nothing to do but watch: dragonflies that hover over the paddies, dart to a new spot
// every few seconds and zip away from Kaylee when she wades near; and butterflies that flutter round the flowers at the
// edges. Built from the same toon parts as everything else (engine/geo.ts).
import { Group, Vector3 } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PADDIES, type V3 } from './layout'

interface Flier {
  root: Group
  wings: Group[]
  at: Vector3
  from: Vector3
  to: Vector3
  /** 0..1 along the dart from `from` to `to`, then resting until `rest` runs out. */
  k: number
  rest: number
  phase: number
}

const DRAGON = ['#7FC8F2', '#FF8FB8', '#B9A6F5']
const BUTTER = ['#FFB3D6', '#FFE27A', '#C9B6FF']
/** Where the butterflies flutter round (the nursery, the banana, the flowers by the boardwalk). */
const FLOWERS: V3[] = [[-5.4, 0.6, 2.9], [-6.2, 0.7, 0.6], [6.4, 0.6, 0.2], [2.6, 0.55, 4.9]]

export class FarmLife {
  root = new Group()
  private dragons: Flier[] = []
  private butters: Flier[] = []

  constructor(bag: Bag) {
    for (let i = 0; i < 3; i++) {
      const c = DRAGON[i % DRAGON.length]
      const body = solid(merge([P.cyl(0.012, 0.008, 0.2, c, { at: [0, 0, -0.06], rot: [Math.PI / 2, 0, 0] }, 6), P.sphere(0.024, c, { at: [0, 0, 0.05] }, 8), ...[-1, 1].map((s) => P.sphere(0.011, '#2B2330', { at: [s * 0.016, 0.01, 0.065] }, 6))]), bag, 1)
      const wings = [-1, 1].flatMap((s) => [0.03, -0.01].map((z) => {
        const w = new Group()
        w.position.set(s * 0.01, 0.01, z)
        w.add(solid(merge([P.sphere(0.05, '#F4FBFF', { at: [s * 0.06, 0, 0], scale: [1.4, 0.08, 0.32] }, 8)]), bag, 1))
        return w
      }))
      const root = new Group()
      root.add(body, ...wings)
      this.root.add(root)
      const p = PADDIES[i % PADDIES.length]
      const at = new Vector3(p.mid[0], p.top + 0.5, p.mid[2])
      this.dragons.push({ root, wings, at, from: at.clone(), to: at.clone(), k: 1, rest: Math.random() * 2, phase: Math.random() * 6 })
    }
    for (let i = 0; i < 3; i++) {
      const c = BUTTER[i]
      const wings = [-1, 1].map((s) => {
        const w = new Group()
        w.add(solid(merge([P.sphere(0.05, c, { at: [s * 0.045, 0, 0.012], scale: [1, 0.12, 1.1] }, 8), P.sphere(0.034, c, { at: [s * 0.035, 0, -0.04], scale: [1, 0.12, 1] }, 8)]), bag, 1))
        return w
      })
      const root = new Group()
      root.add(solid(merge([P.capsule(0.01, 0.06, '#6B5A7A', { rot: [Math.PI / 2, 0, 0] })]), bag, 1), ...wings)
      this.root.add(root)
      const f = FLOWERS[i]
      const at = new Vector3(...f)
      this.butters.push({ root, wings, at, from: at.clone(), to: at.clone(), k: 1, rest: 0, phase: Math.random() * 6 })
    }
  }

  update(dt: number, t: number, kaylee: Vector3) {
    // ---- Dragonflies: hover, then dart in a straight line; away from Kaylee if she comes near ----
    for (const d of this.dragons) {
      const near = Math.hypot(d.at.x - kaylee.x, d.at.z - kaylee.z) < 0.9
      if (d.k >= 1) {
        d.rest -= dt
        if (d.rest <= 0 || near) {
          const p = PADDIES[Math.floor(Math.random() * PADDIES.length)]
          d.from.copy(d.at)
          d.to.set(p.x0 + 0.4 + Math.random() * (p.x1 - p.x0 - 0.8), p.top + 0.35 + Math.random() * 0.35, p.z0 + 0.3 + Math.random() * (p.z1 - p.z0 - 0.6))
          d.k = 0
          d.rest = 1.5 + Math.random() * 2.5
        }
      } else d.k = Math.min(1, d.k + dt / (0.25 + d.from.distanceTo(d.to) * 0.12))
      const e = d.k * d.k * (3 - 2 * d.k)
      d.at.lerpVectors(d.from, d.to, e)
      d.root.position.copy(d.at)
      d.root.position.y += Math.sin(t * 3 + d.phase) * 0.03
      if (d.k < 1) d.root.rotation.y = Math.atan2(d.to.x - d.from.x, d.to.z - d.from.z)
      d.wings.forEach((w, i) => (w.rotation.z = Math.sin(t * 60 + i) * 0.35))
    }
    // ---- Butterflies: a lazy looping flutter round their flower, bobbing with each flap ----
    this.butters.forEach((b, i) => {
      const f = FLOWERS[i]
      const a = t * 0.6 + b.phase
      b.root.position.set(f[0] + Math.sin(a) * 0.5, f[1] + Math.abs(Math.sin(t * 7 + b.phase)) * 0.08 + Math.sin(a * 1.7) * 0.12, f[2] + Math.sin(a * 2) * 0.3)
      b.root.rotation.y = Math.atan2(Math.cos(a) * 0.5, Math.cos(a * 2) * 0.6)
      const flap = Math.sin(t * 14 + b.phase) * 0.9
      b.wings[0].rotation.z = flap
      b.wings[1].rotation.z = -flap
    })
  }
}
