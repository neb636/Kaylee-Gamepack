// The river's big splash (story/sets/bath.ts `bigSplash`): what a bear landing in the pool throws up, drawn the toon
// way. A crown of water petals bursts up round the spot and opens out like a flower, a jet shoots up the middle and
// breaks into drops, fat drops fly out on arcs and fall back (stretched along the way they fly), foam churns on the
// water and two rings spread out and fade. Everything is set each frame from the splash's clock, so a second splash
// simply starts it again.
import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, RingGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { rng } from './bathWater'

const WHITE = '#FFFFFF'
const PALE = '#E4F6FD'
const BLUE = '#AEDFF3'
/** Seconds the whole splash lasts. */
const LIFE = 1.9
const G = 9.5

/** A petal of the crown: a soft rounded tongue of water (blue at the foot, paler up it) with a round drop on its tip,
 *  never a sharp point (that reads as ice). `h` tall, `w` wide, thin across. */
function petal(h: number, w: number) {
  return merge([
    P.sphere(w, BLUE, { at: [0, h * 0.3, 0], scale: [0.45, (h * 0.34) / w, 1] }, 12),
    P.sphere(w * 0.8, PALE, { at: [0, h * 0.62, 0], scale: [0.45, (h * 0.26) / (w * 0.8), 1] }, 12),
    P.sphere(w * 0.58, WHITE, { at: [0, h * 0.97, 0] }, 10),
  ])
}

interface Drop {
  g: Group
  p: Vector3
  v: Vector3
  t0: number
  r: number
}

export class BigSplash {
  readonly root = new Group()
  private t = 99
  private petals: Group[] = []
  private ring: { g: Group; a: number; tilt: number; h: number }[] = []
  private jet: Group
  private jetTop: Group
  private foam: Group
  private drops: Drop[] = []
  private waves: Mesh[] = []
  private random = rng(5)

  constructor(bag: Bag, private waterY = 0.04) {
    this.root.visible = false
    // The crown: two rings of petals, a tall inner one and a short outer one.
    const r = this.random
    for (let i = 0; i < 22; i++) {
      const inner = i < 14
      const n = inner ? 14 : 8
      const k = inner ? i : i - 14
      const a = (k / n) * Math.PI * 2 + (inner ? 0 : 0.4) + (r() - 0.5) * 0.2
      const h = inner ? 0.75 + r() * 0.35 : 0.45 + r() * 0.2
      const pivot = new Group()
      const mesh = solid(petal(1, inner ? 0.12 : 0.1), bag, 1.4)
      pivot.add(mesh)
      this.root.add(pivot)
      this.petals.push(pivot)
      this.ring.push({ g: pivot, a, tilt: inner ? 0.28 + r() * 0.12 : 0.7 + r() * 0.15, h })
    }
    // The jet up the middle, a fat drop riding on top.
    this.jet = solid(merge([P.cyl(0.07, 0.17, 1, PALE, { at: [0, 0.5, 0] }, 10), P.cyl(0.17, 0.26, 0.2, BLUE, { at: [0, 0.1, 0] }, 12)]), bag, 1.4)
    this.jetTop = solid(P.sphere(0.13, WHITE, { scale: [1, 1.25, 1] }, 12), bag, 1.4)
    // Foam churning where it went in: white lumps on the water.
    this.foam = solid(
      merge(
        Array.from({ length: 11 }, (_, i) => {
          const a = i * 2.4
          const d = i === 0 ? 0 : 0.18 + (i % 3) * 0.12
          return P.sphere(0.16 + (i % 2) * 0.06, i % 3 ? WHITE : PALE, { at: [Math.cos(a) * d, 0, Math.sin(a) * d], scale: [1, 0.42, 1] }, 10)
        }),
      ),
      bag,
      1.2,
    )
    this.root.add(this.jet, this.jetTop, this.foam)
    // Drops: round, inked, stretched along the way they fly.
    for (let i = 0; i < 26; i++) {
      const rr = 0.04 + r() * 0.045
      const g = solid(P.sphere(1, i % 4 ? WHITE : PALE, {}, 8), bag, 1)
      g.visible = false
      this.root.add(g)
      this.drops.push({ g, p: new Vector3(), v: new Vector3(), t0: 0, r: rr })
    }
    // Rings spreading on the water.
    for (let i = 0; i < 2; i++) {
      const m = new Mesh(bag.add(new RingGeometry(0.82, 1, 48)), bag.add(new MeshBasicMaterial({ color: new Color(WHITE), transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })))
      m.rotation.x = -Math.PI / 2
      m.position.y = 0.012
      this.root.add(m)
      this.waves.push(m)
    }
  }

  /** Starts a splash at x, z on the water; `size` 1 is a bear landing. */
  start(x: number, z: number, size = 1) {
    this.t = 0
    this.root.position.set(x, this.waterY, z)
    this.root.scale.setScalar(size)
    this.root.visible = true
    const r = this.random
    for (const [i, d] of this.drops.entries()) {
      const a = (i / this.drops.length) * Math.PI * 2 + r() * 0.4
      const out = 1.1 + r() * 1.6
      d.p.set(Math.cos(a) * 0.3, 0.3 + r() * 0.3, Math.sin(a) * 0.3)
      d.v.set(Math.cos(a) * out, 3.2 + r() * 2.6, Math.sin(a) * out)
      d.t0 = 0.04 + r() * 0.22
      d.g.visible = false
    }
  }

  get on() {
    return this.root.visible
  }

  update(dt: number) {
    if (!this.root.visible) return
    this.t += dt
    const t = this.t
    if (t >= LIFE) {
      this.root.visible = false
      return
    }
    // The crown: bursts up fast (an overshoot), opens out, then slumps back into the pool.
    const up = t < 0.16 ? easeOut(t / 0.16) * 1.12 : t < 0.32 ? 1.12 - 0.12 * ((t - 0.16) / 0.16) : t < 0.7 ? 1 : Math.max(0, 1 - (t - 0.7) / 0.55)
    const open = Math.min(1, t / 0.6)
    for (const c of this.ring) {
      const tilt = c.tilt + open * 0.45 + (t > 0.7 ? (t - 0.7) * 0.6 : 0)
      const rad = 0.28 + open * 0.32
      c.g.position.set(Math.cos(c.a) * rad, 0, Math.sin(c.a) * rad)
      // (The pivot turns its +x outward; the petal tips round its z, toward +x.)
      c.g.rotation.set(0, -c.a, 0)
      c.g.children[0].rotation.set(0, 0, -tilt)
      const hh = Math.max(0.001, c.h * up)
      c.g.children[0].scale.set(Math.max(0.2, up) * (1 + open * 0.25), hh, Math.max(0.2, up))
    }
    // The jet: shoots up behind the crown, its top drop flies on and falls; the column falls back.
    const jt = t - 0.08
    const jh = jt < 0 ? 0 : jt < 0.28 ? easeOut(jt / 0.28) * 1.9 : Math.max(0, 1.9 - (jt - 0.28) * 3.2)
    this.jet.visible = jh > 0.02
    this.jet.scale.set(1 + (jt > 0.28 ? (jt - 0.28) * 0.8 : 0), Math.max(0.001, jh), 1 + (jt > 0.28 ? (jt - 0.28) * 0.8 : 0))
    const topY = jt < 0.28 ? jh + 0.08 : 1.98 + 2.6 * (jt - 0.28) - 0.5 * G * (jt - 0.28) ** 2
    this.jetTop.visible = jt > 0 && topY > 0
    this.jetTop.position.set(0, Math.max(0, topY), 0)
    const ts = Math.min(1, jt * 6) * (topY < 0.3 && jt > 0.5 ? topY / 0.3 : 1)
    this.jetTop.scale.set(ts, ts * (jt < 0.28 ? 1.4 : 1), ts)
    // The foam: grows in, churns, melts away.
    const fk = t < 0.2 ? easeOut(t / 0.2) : t > 1.2 ? Math.max(0, 1 - (t - 1.2) / 0.6) : 1
    const churn = 1 + 0.06 * Math.sin(t * 18)
    this.foam.scale.set(Math.max(0.001, fk * (1 + t * 0.5) * churn), Math.max(0.001, fk * (1.2 - t * 0.3)), Math.max(0.001, fk * (1 + t * 0.5) / churn))
    this.foam.rotation.y = t * 0.8
    // Drops on their arcs, stretched along the way they fly; gone when they fall back in.
    for (const d of this.drops) {
      const dtt = t - d.t0
      if (dtt < 0) continue
      if (!d.g.visible && d.p.y > 0) d.g.visible = true
      d.v.y -= G * dt
      d.p.addScaledVector(d.v, dt)
      if (d.p.y < 0) {
        d.g.visible = false
        continue
      }
      d.g.position.copy(d.p)
      const sp = d.v.length()
      const stretch = 1 + Math.min(1.4, sp * 0.18)
      d.g.scale.set(d.r / Math.sqrt(stretch), d.r * stretch, d.r / Math.sqrt(stretch))
      // (Long axis along the velocity: turn y toward it.)
      d.g.quaternion.setFromUnitVectors(Y, tmp.copy(d.v).normalize())
    }
    // Two rings spread out on the water and fade.
    for (const [i, w] of this.waves.entries()) {
      const k = (t - 0.1 - i * 0.28) / 1.4
      const m = w.material as MeshBasicMaterial
      if (k < 0 || k > 1) {
        m.opacity = 0
        continue
      }
      const s = 0.45 + easeOut(k) * (1.9 - i * 0.4)
      w.scale.set(s, s, 1)
      m.opacity = 0.75 * (1 - k)
    }
  }
}

const Y = new Vector3(0, 1, 0)
const tmp = new Vector3()
const easeOut = (k: number) => 1 - (1 - Math.min(1, Math.max(0, k))) ** 3
