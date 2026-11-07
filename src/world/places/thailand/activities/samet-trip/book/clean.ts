// The beach clean (the island's side verb, greybox 3 of samet-trip.md): bits of rubbish wash up on the wet sand (a
// bottle, a plastic bag, a flip-flop). Tap one and Kaylee walks over and lifts it up over her head, and an animal pops
// out where it was: a hermit crab climbs out of the bottle, a crab scuttles from under the flip-flop, a fish jumps where
// the bag was. Carry it to the green bin at the back of the beach: walk up to it and plonk, in it goes, the lid flaps
// and the bin sparkles. A while later the sea washes up another bit somewhere else. Never required: it teaches that
// Koh Samet is a national park and we keep it clean.
import { Group, Mesh, MeshBasicMaterial, RingGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { tone } from '../../../../../kit/sfx'
import { at, FRAMES, type XZ } from '../island/layout'
import type { Ground } from '../island/scenery'

export type JunkKind = 'bottle' | 'bag' | 'flipflop'

/** Where rubbish can wash up (the wet sand, the tide line), and the beaches' bins (at the back of the sand). */
const SPOTS: XZ[] = [
  at(FRAMES.saikaew, -8, -0.9),
  at(FRAMES.saikaew, 30, -1),
  at(FRAMES.hinkhok, -4, -1),
  at(FRAMES.phai, -2, -1),
  at(FRAMES.wongduan, -6, -1),
  at(FRAMES.wongduan, 8, -1),
  at(FRAMES.prao, -6, -1),
  at(FRAMES.nadan, 10, -1),
  at(FRAMES.aonoina, 2, -1),
]
const BIN_AT: [keyof typeof FRAMES, number, number][] = [['saikaew', 5, -10.5], ['hinkhok', -11, -9], ['phai', 3, -8.5], ['wongduan', 11, -9], ['prao', 9, -8.5], ['nadan', 13, -6], ['aonoina', -5, -7]]
export const BINS: (XZ & { face: number })[] = BIN_AT.map(([f, u, v]) => ({ ...at(FRAMES[f], u, v), face: Math.atan2(FRAMES[f].n.x, FRAMES[f].n.z) }))
/** How many bits are out at once, and how long before the sea washes up another. */
const OUT = 4
const RESPAWN = 25
const KINDS: JunkKind[] = ['bottle', 'bag', 'flipflop']

export const JUNK_IDS = SPOTS.map((_, i) => `junk:${i}`)
export const BIN_IDS = BINS.map((_, i) => `bin:${i}`)

const plonk = () => {
  tone(180, 90, 0.18, 0.12, 'sine')
  tone(900, 1800, 0.25, 0.04, 'triangle', 0.08)
}
const lift = () => tone(500, 900, 0.15, 0.05, 'triangle')

interface Junk {
  id: string
  spot: XZ
  kind: JunkKind
  g: Group
  out: boolean
  /** Washing in (0..1). */
  t: number
}

export class BeachClean {
  readonly root = new Group()
  readonly junk: Junk[] = []
  readonly bins: { id: string; at: XZ; g: Group; lid: Group; ring: Mesh; flap: number }[] = []
  /** What she's carrying (over her head), or null. */
  carrying: Junk | null = null
  cleaned = 0
  private respawnT = RESPAWN
  private flying: { g: Group; from: Vector3; to: Vector3; t: number; bin: number } | null = null

  constructor(
    bag: Bag,
    private ground: Ground,
    block: (x: number, z: number, r: number) => void,
  ) {
    SPOTS.forEach((spot, i) => {
      const kind = KINDS[i % KINDS.length]
      const g = this.model(bag, kind)
      g.position.set(spot.x, this.h(spot), spot.z)
      g.rotation.y = i * 2.1
      this.root.add(g)
      const out = i % 2 === 0 && i < OUT * 2
      g.visible = out
      this.junk.push({ id: JUNK_IDS[i], spot, kind, g, out, t: 1 })
    })
    const ringGeo = bag.add(new RingGeometry(1.0, 1.25, 32))
    BINS.forEach((b, i) => {
      const g = new Group()
      // A green park bin with a round lid and a white leaf on the front (no words).
      g.add(solid(merge([P.cyl(0.36, 0.3, 0.85, '#3FA36B', { at: [0, 0.43, 0] }, 14), P.cyl(0.38, 0.38, 0.06, '#2F8A57', { at: [0, 0.86, 0] }, 14), P.cyl(0.33, 0.33, 0.04, '#2F8A57', { at: [0, 0.02, 0] }, 14)]), bag, 2))
      g.add(solid(merge([P.sphere(0.12, '#FFFFFF', { at: [0, 0.5, 0.33], scale: [0.7, 1.15, 0.25], rot: [0, 0, 0.6] }, 10), P.box(0.015, 0.16, 0.02, '#3FA36B', { at: [0.0, 0.5, 0.36], rot: [0, 0, 0.6] })]), bag, 0))
      const lid = new Group()
      lid.add(solid(merge([P.sphere(0.38, '#4DB87A', { at: [0, 0, 0.36], scale: [1, 0.35, 1] }, 14), P.sphere(0.06, '#2F8A57', { at: [0, 0.13, 0.36] }, 8)]), bag, 2))
      lid.position.set(0, 0.89, -0.36)
      g.add(lid)
      g.position.set(b.x, this.h(b), b.z)
      g.rotation.y = b.face
      this.root.add(g)
      block(b.x, b.z, 0.42)
      const ring = new Mesh(ringGeo, bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0, depthWrite: false })))
      ring.rotation.x = -Math.PI / 2
      ring.position.set(b.x, this.h(b) + 0.06, b.z)
      ring.renderOrder = 3
      this.root.add(ring)
      this.bins.push({ id: BIN_IDS[i], at: b, g, lid, ring, flap: 0 })
    })
  }

  private h(p: XZ) {
    return Math.max(0.02, this.ground.heightAt(p.x, p.z))
  }

  private model(bag: Bag, kind: JunkKind) {
    const g = new Group()
    if (kind === 'bottle') g.add(solid(merge([P.capsule(0.09, 0.26, '#9FD8F0', { at: [0, 0.09, 0], rot: [0, 0, Math.PI / 2] }), P.cyl(0.04, 0.05, 0.08, '#9FD8F0', { at: [0.26, 0.09, 0], rot: [0, 0, Math.PI / 2] }, 8), P.cyl(0.045, 0.045, 0.05, '#3F7FE0', { at: [0.32, 0.09, 0], rot: [0, 0, Math.PI / 2] }, 8), P.cyl(0.092, 0.092, 0.1, '#FFFFFF', { at: [0, 0.09, 0], rot: [0, 0, Math.PI / 2] }, 12)]), bag, 2))
    else if (kind === 'bag') g.add(solid(merge([P.sphere(0.2, '#F3F1F6', { at: [0, 0.08, 0], scale: [1.2, 0.4, 1] }, 9), P.sphere(0.12, '#E6E2EE', { at: [0.18, 0.1, 0.06], scale: [1, 0.6, 1] }, 8), P.torus(0.06, 0.02, '#F3F1F6', { at: [-0.22, 0.14, 0], rot: [0, 0, 0.8] })]), bag, 2))
    else g.add(solid(merge([P.rbox(0.16, 0.04, 0.4, 0.03, PAL.hotpink, { at: [0, 0.03, 0] }), P.torus(0.07, 0.018, '#FFFFFF', { at: [0, 0.07, 0.07], rot: [0, 0, 0] }, Math.PI)]), bag, 2))
    return g
  }

  /** The bit she tapped, if it's out on the sand. */
  get(id: string) {
    return this.junk.find((j) => j.id === id && j.out && j !== this.carrying) ?? null
  }

  /** She lifts it up (she's next to it). Returns what kind it was and where. */
  pickUp(j: Junk) {
    this.carrying = j
    lift()
    return { kind: j.kind, x: j.spot.x, z: j.spot.z }
  }

  /** The bin she's close enough to drop it into, if she's carrying something. */
  binNear(x: number, z: number, r = 2) {
    if (!this.carrying) return -1
    let best = -1
    let bd = r
    this.bins.forEach((b, i) => {
      const d = Math.hypot(b.at.x - x, b.at.z - z)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    return best
  }

  /** In it goes: it flies from over her head into the bin. */
  drop(bin: number) {
    const j = this.carrying
    if (!j) return
    this.carrying = null
    const b = this.bins[bin]
    this.flying = { g: j.g, from: j.g.position.clone(), to: new Vector3(b.at.x, this.h(b.at) + 0.95, b.at.z), t: 0, bin }
    j.out = false
    b.flap = 1
  }

  /** Each frame: what she carries rides over her head; the bins glow while she carries; the sea washes up more. Returns
   *  true the frame something lands in a bin. */
  update(dt: number, t: number, head: Vector3 | null): boolean {
    let landed = false
    if (this.carrying && head) {
      const g = this.carrying.g
      g.visible = true
      g.position.set(head.x, head.y + 0.6 + Math.sin(t * 6) * 0.05, head.z)
      g.rotation.z = Math.sin(t * 3) * 0.2
    }
    if (this.flying) {
      const f = this.flying
      f.t = Math.min(1, f.t + dt / 0.55)
      f.g.position.lerpVectors(f.from, f.to, f.t)
      f.g.position.y += Math.sin(Math.PI * f.t) * 1.2
      f.g.rotation.x += dt * 10
      if (f.t >= 1) {
        f.g.visible = false
        f.g.rotation.set(0, 0, 0)
        this.flying = null
        this.cleaned++
        landed = true
        plonk()
      }
    }
    for (const b of this.bins) {
      b.flap = Math.max(0, b.flap - dt * 1.4)
      b.lid.rotation.x = -Math.sin(Math.min(1, b.flap) * Math.PI) * 1.1 - Math.sin(b.flap * 30) * 0.08 * b.flap
      const m = b.ring.material as MeshBasicMaterial
      const want = this.carrying ? 0.5 + 0.3 * Math.sin(t * 5) : 0
      m.opacity += (want - m.opacity) * Math.min(1, dt * 6)
      b.ring.visible = m.opacity > 0.02
    }
    // Washing in: slides up the sand from the water.
    for (const j of this.junk) {
      if (!j.out || j === this.carrying || j.t >= 1) continue
      j.t = Math.min(1, j.t + dt / 2)
      j.g.position.set(j.spot.x, this.h(j.spot) + (1 - j.t) * -0.2, j.spot.z)
      j.g.rotation.y += dt * (1 - j.t) * 2
    }
    // The sea washes up another (somewhere it isn't).
    const out = this.junk.filter((j) => j.out).length
    if (out < OUT) {
      this.respawnT -= dt
      if (this.respawnT <= 0) {
        this.respawnT = RESPAWN
        const free = this.junk.filter((j) => !j.out && j !== this.carrying && (!this.flying || this.flying.g !== j.g))
        const j = free[Math.floor(Math.random() * free.length)]
        if (j) {
          j.out = true
          j.t = 0
          j.g.visible = true
        }
      }
    }
    return landed
  }
}
