// The diggable sand at Ao Hin Khok (plan: planning/around-the-world/thailand/samet-trip.md, "Sandcastle"): a fine
// height field laid over the island's beach, where her finger moves the real sand.
//
// - Digging lowers the sand under her finger and piles what it took up beside the stroke (wet and dark), so a moat
//   dug round leaves a wall on each side; dragging along a pile pats it up into a wall.
// - Dry sand runs, wet sand sticks: every frame the slopes that are too steep slide down a little (the angle of repose),
//   gentle for dry sand and steep for wet. Dug sand is wet; it dries back slowly.
// - The sea is a little water simulation on the same grid (depth per point, flowing to the lower neighbor): the last
//   rows are the sea at its level (the tide plus each wave's surge), and water runs up the slope and down any channel
//   she digs, into the moat. Sand soaks a little up, so a pool cut off from the sea slowly drains.
//
// All in the patch's own frame: `a` across the screen (to the right when looking out to sea), `v` out to sea (0 = the
// waterline). The island's terrain under the patch is sunk out of sight (sinkGround) and the lagoon leaves the
// inland part to this patch's water (Lagoon.setCut).
import { BufferAttribute, BufferGeometry, Color, Mesh, MeshBasicMaterial, MeshToonMaterial } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'
import type { Terrain } from '../../../../../engine3d/terrain'
import type { Frame } from '../island/layout'
import { clamp, smoothstep } from '../../../../../../sdk/math'

/** The patch's size in its frame (meters), and the part she can dig (the rest blends into the beach). It reaches far
 *  up the beach (v0) because a tall phone looks down over a long strip of sand below the castle: every bit of sand on
 *  any screen digs (#357: the bottom third of an iPhone in portrait didn't). */
export const PATCH = { a0: -6, a1: 6, v0: -15, v1: 3.5, cell: 0.125 }
export const DIGGABLE = { a0: -4.2, a1: 4.2, v0: -13.9, v1: 0.6 }
/** Inland of this the lagoon is cut out and the patch's own water shows. */
export const CUT_V = -2.1

export interface SandFeel {
  /** Brush radius (m). */
  radius: number
  /** How fast the sand goes down under a still finger (m/s at the middle). */
  rate: number
  /** How deep a hole can go (m below the beach). */
  deep: number
  /** A quick swipe still digs each spot for at least this long (s), so it leaves a trench. */
  swipe: number
  /** How far beside the stroke the dug sand lands (× the radius). */
  spread: number
  /** How much of what she digs piles up (the rest flies off as spray). */
  keep: number
  /** Patting a pile up (m/s) and how tall it may get (m above the beach). */
  pat: number
  tall: number
  /** Steepest slope (rise per run) dry and wet. */
  dry: number
  wet: number
  /** Water: flow steps per frame, how fast sand soaks it up (m/s). */
  flow: number
  seep: number
}

export class Sand {
  readonly nx: number
  readonly nz: number
  /** The beach as it was, now, how wet (0..1), and the water's depth on top. */
  readonly rest: Float32Array
  readonly h: Float32Array
  readonly wet: Float32Array
  readonly W: Float32Array
  readonly mesh: Mesh
  readonly water: Mesh
  private dryBase: Float32Array
  private base: Float32Array
  private geo: BufferGeometry
  private wgeo: BufferGeometry
  /** A box (grid indices) where the sand changed and may still be sliding. */
  private active: [number, number, number, number] | null = null
  private dirty: [number, number, number, number] | null = null
  private ax: number
  private az: number
  /** Where water was last frame (so the mesh only changes there). */
  private wetRows = [0, 0]
  /** Seconds until the next pass that wets the sand under water and dries the rest, over the whole patch. */
  private wetT = 0
  sea = 0

  constructor(
    readonly f: Frame,
    ground: (x: number, z: number) => number,
    /** The beach's own color here (the patch starts out matching it exactly). */
    color: (x: number, z: number) => string,
    bag: Bag,
  ) {
    const { a0, a1, v0, v1, cell } = PATCH
    const nx = (this.nx = Math.round((a1 - a0) / cell) + 1)
    const nz = (this.nz = Math.round((v1 - v0) / cell) + 1)
    // `a` runs to the right looking out to sea: minus the frame's along-the-sand axis.
    this.ax = -f.t.x
    this.az = -f.t.z
    const n = nx * nz
    this.rest = new Float32Array(n)
    this.h = new Float32Array(n)
    this.wet = new Float32Array(n)
    this.W = new Float32Array(n)
    this.dryBase = new Float32Array(n)
    this.base = new Float32Array(n * 3)
    const pos = new Float32Array(n * 3)
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i
        const { x, z } = this.world(a0 + i * cell, v0 + j * cell)
        // (A hair above the island's ground where it's dry, so its edge never shows through; none by the water,
        // where a lip would stand out of the sea.)
        const g0 = ground(x, z)
        const y = g0 + 0.012 * smoothstep(-0.02, 0.12, g0)
        this.rest[k] = this.h[k] = y
        // Wet near the water, dry up the beach.
        this.dryBase[k] = this.wet[k] = 1 - smoothstep(0.06, 0.22, y)
        tint.set(color(x, z))
        this.base.set([tint.r, tint.g, tint.b], k * 3)
        pos.set([x, y, z], k * 3)
      }
    const idx: number[] = []
    for (let j = 0; j < nz - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        const k = j * nx + i
        idx.push(k, k + 1, k + nx, k + 1, k + nx + 1, k + nx)
      }
    this.geo = new BufferGeometry()
    this.geo.setAttribute('position', new BufferAttribute(pos, 3))
    this.geo.setAttribute('normal', new BufferAttribute(new Float32Array(n * 3), 3))
    this.geo.setAttribute('color', new BufferAttribute(new Float32Array(n * 3), 3))
    this.geo.setIndex(idx)
    this.refresh(0, 0, nx - 1, nz - 1)
    this.geo.computeBoundingSphere()
    const mat = bag.add(new MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: toonGradient() }))
    this.mesh = new Mesh(bag.add(this.geo), mat)

    // The water on top: the same grid, its points sunk under the sand where it's dry.
    this.wgeo = new BufferGeometry()
    this.wgeo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    this.wgeo.setAttribute('color', new BufferAttribute(new Float32Array(n * 3).map((_, i) => [SHALLOW.r, SHALLOW.g, SHALLOW.b][i % 3]), 3))
    this.wgeo.setIndex(idx)
    this.wgeo.computeBoundingSphere()
    const wp = this.wgeo.attributes.position as BufferAttribute
    for (let k = 0; k < n; k++) wp.setY(k, this.h[k] - 0.08)
    this.water = new Mesh(bag.add(this.wgeo), bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.82, depthWrite: false })))
    this.water.renderOrder = 2
  }

  // ---------------------------------------------------------------- the frame

  /** A point in the patch's frame, in game meters. */
  world(a: number, v: number) {
    const f = this.f
    return { x: f.x + this.ax * a + f.n.x * v, z: f.z + this.az * a + f.n.z * v }
  }
  /** And back. */
  local(x: number, z: number) {
    const dx = x - this.f.x
    const dz = z - this.f.z
    return { a: dx * this.ax + dz * this.az, v: dx * this.f.n.x + dz * this.f.n.z }
  }
  /** Unit vectors of the frame's axes in game space. */
  get axes() {
    return { a: { x: this.ax, z: this.az }, v: this.f.n }
  }
  inside(a: number, v: number) {
    return a > PATCH.a0 && a < PATCH.a1 && v > PATCH.v0 && v < PATCH.v1
  }
  diggable(a: number, v: number) {
    return a > DIGGABLE.a0 && a < DIGGABLE.a1 && v > DIGGABLE.v0 && v < DIGGABLE.v1
  }

  private sampleOf(arr: Float32Array, a: number, v: number) {
    const fx = clamp((a - PATCH.a0) / PATCH.cell, 0, this.nx - 1.001)
    const fz = clamp((v - PATCH.v0) / PATCH.cell, 0, this.nz - 1.001)
    const i = Math.floor(fx)
    const j = Math.floor(fz)
    const u = fx - i
    const w = fz - j
    const n = this.nx
    const k = j * n + i
    return (arr[k] * (1 - u) + arr[k + 1] * u) * (1 - w) + (arr[k + n] * (1 - u) + arr[k + n + 1] * u) * w
  }
  /** The sand's height here (frame coordinates). */
  heightAt(a: number, v: number) {
    return this.sampleOf(this.h, a, v)
  }
  restAt(a: number, v: number) {
    return this.sampleOf(this.rest, a, v)
  }
  /** The water's depth here. */
  depthAt(a: number, v: number) {
    return this.sampleOf(this.W, a, v)
  }
  /** The water's surface here (or the sand's, where it's dry). */
  surfaceAt(a: number, v: number) {
    return this.heightAt(a, v) + this.depthAt(a, v)
  }

  // ---------------------------------------------------------------- her finger

  private each(a: number, v: number, r: number, fn: (k: number, w: number) => void) {
    const c = PATCH.cell
    const i0 = Math.max(1, Math.floor((a - r - PATCH.a0) / c))
    const i1 = Math.min(this.nx - 2, Math.ceil((a + r - PATCH.a0) / c))
    const j0 = Math.max(1, Math.floor((v - r - PATCH.v0) / c))
    const j1 = Math.min(this.nz - 2, Math.ceil((v + r - PATCH.v0) / c))
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const da = PATCH.a0 + i * c - a
        const dv = PATCH.v0 + j * c - v
        const d2 = (da * da + dv * dv) / (r * r)
        if (d2 >= 1) continue
        const ia = PATCH.a0 + i * c
        const iv = PATCH.v0 + j * c
        // (Fades out toward the edge of the diggable part, so the beach round it never moves.)
        const edge = smoothstep(0, 0.5, Math.min(ia - DIGGABLE.a0, DIGGABLE.a1 - ia, iv - DIGGABLE.v0, DIGGABLE.v1 - iv))
        if (edge <= 0) continue
        fn(j * this.nx + i, (1 - d2) * (1 - d2) * edge)
      }
    this.touch(i0, j0, i1, j1)
  }
  private touch(i0: number, j0: number, i1: number, j1: number) {
    const grow = (b: [number, number, number, number] | null): [number, number, number, number] => (b ? [Math.min(b[0], i0), Math.min(b[1], j0), Math.max(b[2], i1), Math.max(b[3], j1)] : [i0, j0, i1, j1])
    this.active = grow(this.active)
    this.dirty = grow(this.dirty)
  }

  /** Digs along the stroke from (a - da, v - dv) to (a, v) over `dt` seconds (0, 0: a still finger), in steps a
   *  fraction of the brush apart so a quick swipe digs a trench, not a row of dots. Returns the sand it moved (m³). */
  dig(a: number, v: number, da: number, dv: number, dt: number, feel: SandFeel) {
    const l = Math.hypot(da, dv)
    const n = Math.max(1, Math.min(24, Math.ceil(l / (feel.radius * 0.35))))
    // (A swipe digs each spot about as long as a slow drag would: the trench is the same depth, however fast.)
    const each = Math.max(dt / n, feel.swipe)
    let took = 0
    for (let i = n - 1; i >= 0; i--) took += this.digAt(a - (da * i) / n, v - (dv * i) / n, da, dv, n > 1 ? each : dt, feel)
    return took
  }
  private digAt(a: number, v: number, da: number, dv: number, dt: number, feel: SandFeel) {
    const r = feel.radius
    let took = 0
    this.each(a, v, r, (k, w) => {
      const floor = this.rest[k] - feel.deep
      const d = Math.min(this.h[k] - floor, feel.rate * dt * w)
      if (d <= 0) return
      this.h[k] -= d
      this.wet[k] = Math.max(this.wet[k], Math.min(1, w * 3))
      took += d
    })
    const c2 = PATCH.cell * PATCH.cell
    const vol = took * c2 * feel.keep
    if (vol <= 0) return 0
    // Where it lands: beside the stroke on both sides (a ring round a still finger).
    const l = Math.hypot(da, dv)
    const off = r * feel.spread
    const drops: [number, number][] = l > 0.01 ? [[-dv / l, da / l], [dv / l, -da / l]] : [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([x, y]) => [x * 0.75, y * 0.75] as [number, number])
    for (const [px, pz] of drops) this.add(a + px * off, v + pz * off, r * 1.1, vol / drops.length, feel.tall, false)
    return took * c2
  }
  /** Piles `vol` m³ of wet sand in a soft bump (no taller than `tall` above the beach). Dug sand (`intoHoles` false)
   *  never lands back in a trench or a hole: what would fall in flies off instead, so a channel dug across the moat
   *  doesn't dam it. */
  add(a: number, v: number, r: number, vol: number, tall = 0.6, intoHoles = true) {
    // A (1 - d²)² bump of radius r holds π r² / 3 × its peak.
    const peak = vol / ((r * r * Math.PI) / 3)
    this.each(a, v, r, (k, w) => {
      if (!intoHoles && this.h[k] < this.rest[k] - 0.05) return
      const room = this.rest[k] + tall - this.h[k]
      if (room <= 0) return
      this.h[k] += Math.min(room, peak * w)
      this.wet[k] = Math.max(this.wet[k], Math.min(1, w * 3))
    })
  }
  /** Pats the sand up under her finger (dragging along a pile). */
  pat(a: number, v: number, dt: number, feel: SandFeel) {
    this.each(a, v, feel.radius, (k, w) => {
      const room = this.rest[k] + feel.tall - this.h[k]
      if (room <= 0) return
      this.h[k] += Math.min(room, feel.pat * dt * w)
      this.wet[k] = Math.max(this.wet[k], Math.min(1, w * 3))
    })
  }

  // ---------------------------------------------------------------- every frame

  /** Dry sand runs, wet sand sticks; the dug sand slowly dries. */
  settle(_dt: number, feel: SandFeel) {
    const b = this.active
    if (!b) return
    const n = this.nx
    const c = PATCH.cell
    const i0 = Math.max(1, b[0] - 2)
    const j0 = Math.max(1, b[1] - 2)
    const i1 = Math.min(n - 2, b[2] + 2)
    const j1 = Math.min(this.nz - 2, b[3] + 2)
    let moved = 0
    for (let pass = 0; pass < 2; pass++)
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const k = j * n + i
          for (const k2 of [k + 1, k + n]) {
            const d = this.h[k] - this.h[k2]
            const wet = Math.min(this.wet[k], this.wet[k2])
            const max = c * (feel.dry + (feel.wet - feel.dry) * wet)
            const over = Math.abs(d) - max
            if (over <= 0.0005) continue
            const m = Math.sign(d) * over * 0.3
            this.h[k] -= m
            this.h[k2] += m
            moved += Math.abs(m)
          }
        }
    this.dirty = this.dirty ? [Math.min(this.dirty[0], i0), Math.min(this.dirty[1], j0), Math.max(this.dirty[2], i1), Math.max(this.dirty[3], j1)] : [i0, j0, i1, j1]
    if (moved < 1e-4) this.active = null
  }

  /** Sand under water turns wet (and a little round it), the rest dries back slowly: over the whole patch, a few
   *  times a second. (It used to happen only where she had dug, so the tide left a hard-edged dark box, #357.) */
  soak(dt: number) {
    if ((this.wetT -= dt) > 0) return
    const step = 0.2 - this.wetT
    this.wetT = 0.2
    const n = this.nx
    const { W, wet, dryBase } = this
    let box: [number, number, number, number] | null = null
    for (let j = 1; j < this.nz - 1; j++)
      for (let i = 1; i < n - 1; i++) {
        const k = j * n + i
        let to = wet[k]
        if (W[k] > 0.004) to = 1
        else {
          // Drying, but never much drier than its neighbors: the wet sand fades out over a few cells, not at a line.
          if (to > dryBase[k]) to = Math.max(dryBase[k], to - step / 70)
          to = Math.max(to, Math.max(wet[k - 1], wet[k + 1], wet[k - n], wet[k + n]) - 0.22)
          to = Math.min(1, to)
        }
        if (Math.abs(to - wet[k]) < 1e-4) continue
        wet[k] = to
        box = box ? [Math.min(box[0], i), Math.min(box[1], j), Math.max(box[2], i), Math.max(box[3], j)] : [i, j, i, j]
      }
    if (box) this.dirty = this.dirty ? [Math.min(this.dirty[0], box[0]), Math.min(this.dirty[1], box[1]), Math.max(this.dirty[2], box[2]), Math.max(this.dirty[3], box[3])] : box
  }

  /** The water: the sea's rows held at `sea`, everything else flowing downhill and soaking away. */
  flow(dt: number, feel: SandFeel) {
    const n = this.nx
    const nz = this.nz
    const { h, W } = this
    const seaRows = 3
    // The open sea: the rows at the far end, and every point the beach itself has under the tide now (its sand as it
    // was below the sea's level), all held at the sea's level. A channel or the moat fills from there by flowing.
    const fill = () => {
      for (let j = nz - 1; j >= 0; j--) {
        let any = false
        for (let i = 1; i < n - 1; i++) {
          const k = j * n + i
          if (j < nz - seaRows && this.rest[k] >= this.sea) continue
          any = true
          W[k] = Math.max(0, this.sea - h[k])
        }
        // (The beach climbs inland: once a row is all above the sea, so is every row behind it.)
        if (!any) break
      }
      for (let j = 0; j < nz; j++) W[j * n] = W[j * n + n - 1] = 0
    }
    // Only rows that can have water (up to the highest water, plus room to spread) are worth flowing.
    let top = nz - seaRows
    for (let k = 0; k < n * (nz - seaRows); k++)
      if (W[k] > 0) {
        top = Math.floor(k / n)
        break
      }
    // Water also starts wherever the sand drops below the sea next to wet cells; one row more each step.
    const steps = Math.max(1, Math.round(feel.flow))
    for (let s = 0; s < steps; s++) {
      fill()
      const j0 = Math.max(0, top - 1)
      for (let j = j0; j < nz - 1; j++)
        for (let i = 0; i < n - 1; i++) {
          const k = j * n + i
          const S = h[k] + W[k]
          for (const k2 of [k + 1, k + n]) {
            const S2 = h[k2] + W[k2]
            const d = S - S2
            if (d > 0) {
              if (W[k] <= 0) continue
              const q = Math.min(d * 0.24, W[k] * 0.24)
              W[k] -= q
              W[k2] += q
            } else if (d < 0) {
              if (W[k2] <= 0) continue
              const q = Math.min(-d * 0.24, W[k2] * 0.24)
              W[k2] -= q
              W[k] += q
            }
          }
        }
      top = Math.max(0, top - 1)
    }
    fill()
    // Soaking into the sand (the sea's rows stay full).
    const soak = feel.seep * dt
    for (let k = 0; k < n * (nz - seaRows); k++) if (W[k] > 0 && this.rest[k] >= this.sea) W[k] = W[k] > soak + 0.0008 ? W[k] - soak : 0
  }

  // ---------------------------------------------------------------- drawing

  /** Writes the sand that changed and the water into the meshes. */
  draw(t: number) {
    if (this.dirty) {
      const [i0, j0, i1, j1] = this.dirty
      this.dirty = null
      this.refresh(i0, j0, i1, j1)
    }
    this.drawWater(t)
  }

  private refresh(i0: number, j0: number, i1: number, j1: number) {
    const n = this.nx
    const c = PATCH.cell
    const pos = this.geo.attributes.position as BufferAttribute
    const nor = this.geo.attributes.normal as BufferAttribute
    const col = this.geo.attributes.color as BufferAttribute
    const wp = this.wgeo?.attributes.position as BufferAttribute | undefined
    const { ax, az } = this
    const N = this.f.n
    for (let j = Math.max(0, j0 - 1); j <= Math.min(this.nz - 1, j1 + 1); j++)
      for (let i = Math.max(0, i0 - 1); i <= Math.min(n - 1, i1 + 1); i++) {
        const k = j * n + i
        pos.setY(k, this.h[k])
        // (Dry here: the water's point stays out of sight under the sand, wherever the sand went.)
        if (wp && this.W[k] <= 0.003) wp.setY(k, this.h[k] - 0.08)
        const ha = (this.h[j * n + Math.min(n - 1, i + 1)] - this.h[j * n + Math.max(0, i - 1)]) / (2 * c)
        const hv = (this.h[Math.min(this.nz - 1, j + 1) * n + i] - this.h[Math.max(0, j - 1) * n + i]) / (2 * c)
        // Normal: up, tipped against the slope along both frame axes.
        let nx = -ha * ax - hv * N.x
        let nz = -ha * az - hv * N.z
        let ny = 1
        const l = Math.hypot(nx, ny, nz)
        nx /= l
        ny /= l
        nz /= l
        nor.setXYZ(k, nx, ny, nz)
        // Color: crystal sand dry, tan wet, a shade darker down a hole and on the steep sides (they read as dug).
        const down = clamp((this.rest[k] - this.h[k]) / 0.4, 0, 1)
        const slope = Math.hypot(ha, hv)
        tint.setRGB(this.base[k * 3], this.base[k * 3 + 1], this.base[k * 3 + 2]).lerp(WET, Math.max(0, this.wet[k] - this.dryBase[k])).lerp(DEEP, down * 0.55).lerp(EDGE, smoothstep(0.5, 1.6, slope) * 0.4)
        col.setXYZ(k, tint.r, tint.g, tint.b)
      }
    pos.needsUpdate = nor.needsUpdate = col.needsUpdate = true
    if (wp) wp.needsUpdate = true
  }

  private drawWater(t: number) {
    const n = this.nx
    const nz = this.nz
    const { h, W } = this
    const pos = this.wgeo.attributes.position as BufferAttribute
    const col = this.wgeo.attributes.color as BufferAttribute
    // Rows that have (or had) water.
    let top = nz
    for (let k = 0; k < n * nz; k++)
      if (W[k] > 0.003) {
        top = Math.floor(k / n)
        break
      }
    const from = Math.max(0, Math.min(top, this.wetRows[0]) - 1)
    this.wetRows[0] = top
    const cutJ = Math.ceil((CUT_V + 0.3 - PATCH.v0) / PATCH.cell)
    for (let j = from; j < nz; j++)
      for (let i = 0; i < n; i++) {
        const k = j * n + i
        let y = h[k] - 0.08
        let d = 0
        if (j <= cutJ) {
          if (W[k] > 0.003) {
            y = h[k] + W[k]
            d = W[k]
          } else {
            // Next to water: up to its surface, so the edge meets the sand.
            let best = -Infinity
            if (i > 0 && W[k - 1] > 0.003) best = Math.max(best, h[k - 1] + W[k - 1])
            if (i < n - 1 && W[k + 1] > 0.003) best = Math.max(best, h[k + 1] + W[k + 1])
            if (j > 0 && W[k - n] > 0.003) best = Math.max(best, h[k - n] + W[k - n])
            if (j < nz - 1 && W[k + n] > 0.003) best = Math.max(best, h[k + n] + W[k + n])
            if (best > -Infinity) y = Math.min(best, h[k] + 0.004)
          }
        }
        pos.setY(k, y)
        if (d > 0 || y > h[k] - 0.05) {
          // Shallow: foamy white at the very edge, mint, then turquoise deeper; a gentle shimmer.
          const sh = 0.04 * Math.sin(t * 2.2 + i * 0.7 + j * 0.45)
          const foam = 1 - smoothstep(0.005, 0.035, d)
          tint.copy(SHALLOW).lerp(DEEPW, smoothstep(0.03, 0.3, d) + sh).lerp(FOAM, foam * 0.75)
          col.setXYZ(k, tint.r, tint.g, tint.b)
        }
      }
    pos.needsUpdate = col.needsUpdate = true
  }

  // ---------------------------------------------------------------- for the game

  /** How much water stands inland of the sea (m², in the moat or a hole) deeper than `min`. */
  pooled(min = 0.03, inlandOf = -2.4) {
    const n = this.nx
    const jMax = Math.floor((inlandOf - PATCH.v0) / PATCH.cell)
    let cells = 0
    for (let j = 0; j <= jMax; j++) for (let i = 0; i < n; i++) if (this.W[j * n + i] > min) cells++
    return cells * PATCH.cell * PATCH.cell
  }
  /** The deepest dug point inland of `inlandOf` (frame coordinates), and how deep. */
  deepest(inlandOf = -2.4) {
    const n = this.nx
    const jMax = Math.floor((inlandOf - PATCH.v0) / PATCH.cell)
    let best = { a: 0, v: -4.8, d: 0 }
    for (let j = 0; j <= jMax; j++)
      for (let i = 0; i < n; i++) {
        const k = j * n + i
        const d = this.rest[k] - this.h[k]
        if (d > best.d) best = { a: PATCH.a0 + i * PATCH.cell, v: PATCH.v0 + j * PATCH.cell, d }
      }
    return best
  }
  /** The biggest hollow she has dug inland of `inlandOf` (the moat, or her biggest hole): its cells, the deepest of
   *  them (`core`, at least half as deep as its deepest point) and the cell of it nearest the sea. */
  hollow(inlandOf = -2.4, dug = 0.1) {
    const n = this.nx
    const jMax = Math.floor((inlandOf - PATCH.v0) / PATCH.cell)
    const seen = new Uint8Array(n * this.nz)
    let best: number[] = []
    const stack: number[] = []
    for (let j = 1; j <= jMax; j++)
      for (let i = 1; i < n - 1; i++) {
        const k0 = j * n + i
        if (seen[k0] || this.rest[k0] - this.h[k0] < dug) continue
        const cells: number[] = []
        seen[k0] = 1
        stack.push(k0)
        while (stack.length) {
          const k = stack.pop()!
          cells.push(k)
          const kj = Math.floor(k / n)
          const ki = k - kj * n
          for (const [di, dj] of NEIGHBORS) {
            const ii = ki + di
            const jj = kj + dj
            if (ii < 1 || ii >= n - 1 || jj < 1 || jj > jMax) continue
            const k2 = jj * n + ii
            if (seen[k2] || this.rest[k2] - this.h[k2] < dug) continue
            seen[k2] = 1
            stack.push(k2)
          }
        }
        if (cells.length > best.length) best = cells
      }
    let deep = 0
    for (const k of best) deep = Math.max(deep, this.rest[k] - this.h[k])
    const core = best.filter((k) => this.rest[k] - this.h[k] >= Math.max(dug, deep * 0.5))
    return { cells: best, core, deep }
  }
  /** How much of these cells has water standing deeper than `min` (m²). */
  wetArea(cells: number[], min = 0.03) {
    let c = 0
    for (const k of cells) if (this.W[k] > min) c++
    return c * PATCH.cell * PATCH.cell
  }
  /** The shortest way from the open sea's water (water joined to the sea) to any of `cells`, up to `max` meters:
   *  where it starts in the water (`from`), where it reaches the cells (`to`) and how long it is. Null if further. */
  gap(cells: number[], max: number, min = 0.01, ok: (dug: number) => boolean = () => true) {
    if (!cells.length) return null
    const n = this.nx
    const nz = this.nz
    const N = n * nz
    // The sea's water: from the sea's rows through every cell with water, joined side to side.
    const sea = new Uint8Array(N)
    const q: number[] = []
    for (let j = nz - 3; j < nz; j++) for (let i = 1; i < n - 1; i++) if (this.W[j * n + i] > min) (sea[j * n + i] = 1), q.push(j * n + i)
    for (let h = 0; h < q.length; h++) {
      const k = q[h]
      for (const k2 of [k - 1, k + 1, k - n, k + n]) if (k2 >= 0 && k2 < N && !sea[k2] && this.W[k2] > min) (sea[k2] = 1), q.push(k2)
    }
    // Out from the target cells over the sand until a sea cell is met (8 neighbors, so diagonals count about right).
    const dist = new Float32Array(N).fill(Infinity)
    const src = new Int32Array(N).fill(-1)
    let front: number[] = []
    for (const k of cells) {
      if (sea[k]) return { from: this.cellAt(k), to: this.cellAt(k), d: 0 }
      dist[k] = 0
      src[k] = k
      front.push(k)
    }
    const c = PATCH.cell
    let found: { k: number; d: number } | null = null
    while (front.length) {
      const next: number[] = []
      for (const k of front) {
        const kj = Math.floor(k / n)
        const ki = k - kj * n
        for (const [di, dj] of NEIGHBORS8) {
          const ii = ki + di
          const jj = kj + dj
          if (ii < 1 || ii >= n - 1 || jj < 1 || jj >= nz - 1) continue
          const k2 = jj * n + ii
          const d = dist[k] + c * (di && dj ? Math.SQRT2 : 1)
          if (d > max || d >= dist[k2]) continue
          dist[k2] = d
          src[k2] = src[k]
          if (sea[k2]) {
            if (ok(this.rest[k2] - this.h[k2]) && (!found || d < found.d)) found = { k: k2, d }
            continue
          }
          next.push(k2)
        }
      }
      front = next
    }
    if (!found) return null
    return { from: this.cellAt(found.k), to: this.cellAt(src[found.k]), d: found.d }
  }
  private cellAt(k: number) {
    const j = Math.floor(k / this.nx)
    const i = k - j * this.nx
    return { a: PATCH.a0 + i * PATCH.cell, v: PATCH.v0 + j * PATCH.cell }
  }
  /** Scoops the sand out down to `floor` (m, world height) in a soft round of radius `r` (the sand washes away). */
  carve(a: number, v: number, r: number, floor: number) {
    this.each(a, v, r, (k, w) => {
      const to = Math.max(this.rest[k] - 0.6, floor)
      if (this.h[k] <= to) return
      this.h[k] -= (this.h[k] - to) * Math.min(1, w * 1.6)
      this.wet[k] = 1
    })
  }
  /** Stands water in these cells up to `level` (a link that opens with her moat already full). */
  flood(cells: number[], level: number) {
    for (const k of cells) this.W[k] = Math.max(this.W[k], level - this.h[k], 0)
  }
  /** How much sand she has moved in all (m³), for QA. */
  moved() {
    let s = 0
    for (let k = 0; k < this.h.length; k++) s += Math.abs(this.h[k] - this.rest[k])
    return s * PATCH.cell * PATCH.cell
  }
  /** A short code of the sand (QA: does a link reproduce it?): the dug and piled area. */
  summary() {
    let dug = 0
    let piled = 0
    for (let k = 0; k < this.h.length; k++) {
      const d = this.h[k] - this.rest[k]
      if (d < -0.08) dug++
      else if (d > 0.08) piled++
    }
    const c2 = PATCH.cell * PATCH.cell
    return { dug: +(dug * c2).toFixed(2), piled: +(piled * c2).toFixed(2) }
  }
}

const NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1]]
const NEIGHBORS8 = [...NEIGHBORS, [1, 1], [1, -1], [-1, 1], [-1, -1]]
const tint = new Color()
const WET = new Color('#E2C597')
const DEEP = new Color('#C9A472')
const EDGE = new Color('#B99363')
const SHALLOW = new Color('#C9F6EC')
const DEEPW = new Color('#4FCFD2')
const FOAM = new Color('#FFFFFF')

/** Sinks the island's own ground out of sight under the patch (only well inside it, so its edge never dips). */
export function sinkGround(t: Terrain, sand: Sand, margin = 1.9) {
  const done = new Set<BufferAttribute>()
  for (const m of t.meshes) {
    const pos = m.geometry.attributes.position as BufferAttribute
    if (done.has(pos)) continue
    done.add(pos)
    for (let k = 0; k < pos.count; k++) {
      const { a, v } = sand.local(pos.getX(k), pos.getZ(k))
      if (a > PATCH.a0 + margin && a < PATCH.a1 - margin && v > PATCH.v0 + margin && v < PATCH.v1 - 1.5) pos.setY(k, pos.getY(k) - 1.4)
    }
    pos.needsUpdate = true
  }
}
