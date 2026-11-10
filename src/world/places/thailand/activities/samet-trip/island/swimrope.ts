// The edge of the swim area (#357: she just stopped in open blue): a rope of orange and white floats, like the jet ski
// bay's, that comes up out of the sea round her when she paddles near the farthest she may go (island.ts WALK.far
// meters from the shore), and bobs and jiggles when she bumps into it.
//
// The edge runs round the whole island, so the rope is only drawn near her: each float sits where the edge crosses a
// fixed grid line (every SPACE m, in world coordinates), so the floats stay put as she swims along instead of sliding
// with her. Lines across the edge's run only, so they're about evenly spaced. Two instanced shapes and their outlines.
import { DynamicDrawUsage, Group, InstancedMesh, Matrix4, SphereGeometry, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { bake } from '../../../../../engine3d/geo'
import { hullGeometry, instancedOutlineMaterial } from '../../../../../engine3d/outline'
import { toon } from '../../../../../engine3d/toon'

/** Meters between floats (the grid the edge is sampled on). */
const SPACE = 2.2
/** The rope shows within this many meters of her. */
const REACH = 15
const MAX = 40

const m4 = new Matrix4()

export class SwimRope {
  private sets: [InstancedMesh, InstancedMesh][] = []
  private root = new Group()
  /** 0..1: how far up out of the sea the rope is. */
  private up = 0
  /** Where she last bumped it, and how hard it's still wobbling there. */
  private bumpAt = { x: 0, z: 0, k: 0 }
  /** Floats drawn this frame (QA). */
  shown = 0

  constructor(bag: Bag, parent: Object3D) {
    const geo = bag.add(bake(new SphereGeometry(0.42, 10, 7), '#ffffff', { scale: [1, 0.78, 1] }))
    const hull = bag.add(hullGeometry(geo))
    for (const c of ['#FF8A2E', '#FFFFFF']) {
      const mesh = bag.add(new InstancedMesh(geo, toon(c), MAX))
      const line = bag.add(new InstancedMesh(hull, instancedOutlineMaterial(2), MAX))
      for (const m of [mesh, line]) {
        m.instanceMatrix.setUsage(DynamicDrawUsage)
        m.frustumCulled = false
        m.count = 0
        this.root.add(m)
      }
      this.sets.push([mesh, line])
    }
    this.root.visible = false
    parent.add(this.root)
  }

  /** She bumped into it here: the floats round there dip and bob. */
  bump(x: number, z: number) {
    this.bumpAt = { x, z, k: 1 }
  }

  /**
   * `show`: she's swimming near the edge. `edge`: meters from the shore it runs at. `shoreAt`, `waterAt`: the island's
   * (meters to the shore, the sea's surface height there).
   */
  update(dt: number, t: number, x: number, z: number, show: boolean, edge: number, shoreAt: (x: number, z: number) => number, waterAt: (x: number, z: number) => number) {
    this.up += ((show ? 1 : 0) - this.up) * Math.min(1, dt * 3)
    this.bumpAt.k = Math.max(0, this.bumpAt.k - dt * 0.9)
    this.root.visible = this.up > 0.02
    const n = [0, 0]
    if (this.root.visible) {
      const f = (px: number, pz: number) => shoreAt(px, pz) - edge
      const put = (px: number, pz: number, odd: number) => {
        const d = Math.hypot(px - x, pz - z)
        if (d > REACH) return
        const s = this.up * Math.min(1, (REACH - d) / 4)
        const k = odd & 1
        if (s < 0.05 || n[k] >= MAX) return
        // (Bobbing on the waves; where she bumped it they dip and spring back, the nearest most.)
        const b = this.bumpAt.k * Math.exp(-((px - this.bumpAt.x) ** 2 + (pz - this.bumpAt.z) ** 2) / 10)
        const y = waterAt(px, pz) - 0.06 - (1 - this.up) * 0.5 + Math.sin(t * 2 + px * 0.7 + pz * 0.3) * 0.04 - Math.sin(t * 14) * 0.18 * b
        m4.makeScale(s, s, s).setPosition(px, y, pz)
        for (const m of this.sets[k]) m.setMatrixAt(n[k], m4)
        n[k]++
      }
      const i0 = Math.floor((x - REACH) / SPACE)
      const i1 = Math.ceil((x + REACH) / SPACE)
      const j0 = Math.floor((z - REACH) / SPACE)
      const j1 = Math.ceil((z + REACH) / SPACE)
      // Where the edge crosses the grid's x = i·SPACE lines (and the z lines), between two grid points.
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j < j1; j++) {
          const gx = i * SPACE
          const gz = j * SPACE
          const a = f(gx, gz)
          const bx = f(gx + SPACE, gz)
          const bz = f(gx, gz + SPACE)
          if (a > 0 !== bz > 0) {
            // On an x line: only where the edge runs more along x than z, so the floats come about SPACE apart.
            const cz = gz + (SPACE * a) / (a - bz)
            if (Math.abs(f(gx + 1, cz) - f(gx - 1, cz)) <= Math.abs(f(gx, cz + 1) - f(gx, cz - 1))) put(gx, cz, i)
          }
          if (a > 0 !== bx > 0) {
            const cx = gx + (SPACE * a) / (a - bx)
            if (Math.abs(f(cx + 1, gz) - f(cx - 1, gz)) > Math.abs(f(cx, gz + 1) - f(cx, gz - 1))) put(cx, gz, j)
          }
        }
    }
    this.sets.forEach(([mesh, line], k) => {
      mesh.count = line.count = n[k]
      mesh.instanceMatrix.needsUpdate = line.instanceMatrix.needsUpdate = true
    })
    this.shown = n[0] + n[1]
  }
}
