// The rice birds (little munias: round and chestnut brown, a white tummy, a dark head and a stubby grey-blue beak),
// for the growing round. They flap in from the edge of the farm in a little arc, land on a rice hill and peck at it (it
// twitches). Kaylee walking near makes one flap up and fly to a perch (the scarecrow's arms: they aren't scared of it,
// the hut's roof, the drying rack's pole), and after a rest it comes back for more. A bird left pecking gets rounder
// and rounder; a round one has to waddle-hop before it can take off. Toy-sized, so she can see them from up high.
import { Group, Vector3 } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import { blobShadow, merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { FAT_S, levelAt, SHOO_R, WATER_DOWN } from './layout'

type State = 'off' | 'in' | 'peck' | 'up' | 'perch' | 'away'

interface Bird {
  i: number
  root: Group
  body: Group
  head: Group
  wings: [Group, Group]
  shadow: Group
  state: State
  t: number
  dur: number
  from: Vector3
  to: Vector3
  hill: number
  perch: number
  /** Seconds pecking (it gets round after FAT_S), and how round it is (0..1). */
  sat: number
  fat: number
  /** Until the next peck, and the peck's bob (0..1). */
  peckIn: number
  bob: number
  rest: number
  /** A shooed fat bird waddle-hops this long before it flies. */
  waddle: number
}

/** What the birds need from the farm. */
export interface BirdHost {
  /** A planted hill to land on (away from Kaylee if it can), or -1. */
  pickHill(avoid: Vector3): number
  /** Where a bird sits on a hill now (the top of the rice). */
  hillTop(i: number, out: Vector3): Vector3
  /** A bird pecked this hill (it twitches). */
  peck(i: number): void
  /** The perches (world), and whether a perch is taken is the birds' business. */
  perches: Vector3[]
  /** A bird flew up from her (feathers, a cheep). */
  shooed(at: Vector3, fat: boolean): void
}

const tmp = new Vector3()
const BROWN = '#9A6340'
const DARK = '#4A3228'

export class Birds {
  readonly root = new Group()
  private list: Bird[] = []
  private taken = new Set<number>()

  constructor(bag: Bag, n: number) {
    for (let i = 0; i < n; i++) this.list.push(this.build(bag, i))
  }

  private build(bag: Bag, i: number): Bird {
    const root = new Group()
    const body = new Group()
    body.add(
      solid(
        merge([
          P.sphere(0.13, BROWN, { at: [0, 0.12, 0], scale: [0.92, 0.88, 1.15] }, 14),
          P.sphere(0.1, '#FFF6EC', { at: [0, 0.09, 0.05], scale: [0.85, 0.85, 0.9] }, 12),
          P.box(0.09, 0.02, 0.12, DARK, { at: [0, 0.16, -0.15], rot: [-0.5, 0, 0] }),
        ]),
        bag,
        1.5,
      ),
    )
    const head = new Group()
    head.position.set(0, 0.22, 0.09)
    head.add(
      solid(
        merge([
          P.sphere(0.085, DARK, { at: [0, 0, 0] }, 12),
          P.cone(0.04, 0.07, '#A9B9D6', { at: [0, -0.01, 0.1], rot: [Math.PI / 2, 0, 0] }, 8),
          ...[-1, 1].map((s) => P.sphere(0.017, PAL.ink, { at: [s * 0.05, 0.02, 0.06] }, 6)),
          ...[-1, 1].map((s) => P.sphere(0.006, '#FFFFFF', { at: [s * 0.053, 0.028, 0.073] }, 4)),
        ]),
        bag,
        1.5,
      ),
    )
    body.add(head)
    const wings = [-1, 1].map((s) => {
      const w = new Group()
      w.position.set(s * 0.09, 0.15, 0.0)
      w.add(solid(P.sphere(0.1, '#7E4E32', { at: [s * 0.08, 0, -0.02], scale: [1.0, 0.18, 0.75] }, 10), bag, 1.5))
      body.add(w)
      return w
    }) as [Group, Group]
    root.add(body)
    const shadow = new Group()
    shadow.add(blobShadow(0.14, bag))
    root.visible = false
    shadow.visible = false
    this.root.add(root, shadow)
    return { i, root, body, head, wings, shadow, state: 'off', t: 0, dur: 1, from: new Vector3(), to: new Vector3(), hill: -1, perch: -1, sat: 0, fat: 0, peckIn: 1, bob: 1, rest: 0, waddle: 0 }
  }

  /** Birds flying about or pecking (not perched, not gone). */
  get active() {
    return this.list.filter((b) => b.state === 'in' || b.state === 'peck').length
  }
  get pecking() {
    return this.list.filter((b) => b.state === 'peck').length
  }
  get count() {
    return this.list.filter((b) => b.state !== 'off').length
  }
  /** The bird that has sat pecking longest (for the hint). */
  longest(): Vector3 | null {
    const b = this.list.filter((x) => x.state === 'peck').sort((a, c) => c.sat - a.sat)[0]
    return b ? b.root.position.clone() : null
  }
  /** Where the pecking birds are (QA). */
  peckingAt() {
    return this.list.filter((b) => b.state === 'peck').map((b) => b.root.position.clone())
  }
  /** How round each bird is (QA). */
  get fats() {
    return this.list.filter((b) => b.state !== 'off').map((b) => Math.round(b.fat * 100) / 100)
  }

  /** `n` more birds fly in, from `sides` edges of the farm (left, right, then the back). */
  call(n: number, sides: number, host: BirdHost, kaylee: Vector3) {
    let k = 0
    for (const b of this.list) {
      if (k >= n) break
      if (b.state !== 'off') continue
      const side = (k + Math.floor(Math.random() * 2)) % Math.max(1, sides)
      const left = sides === 1 ? Math.random() < 0.5 : side === 0
      b.from.set(left ? -8 : 8, 3.2 + Math.random(), -1 - Math.random() * 3)
      b.root.position.copy(b.from)
      b.root.visible = b.shadow.visible = true
      b.fat = 0
      b.sat = 0
      b.t = -k * 0.35
      this.flyTo(b, host, kaylee)
      k++
    }
  }

  /** Birds hidden in the rice that burst out when Kaylee wades in (the extra-tall paddy). */
  burst(at: Vector3, n: number, host: BirdHost) {
    let k = 0
    for (const b of this.list) {
      if (k >= n) break
      if (b.state !== 'off') continue
      b.root.visible = b.shadow.visible = true
      b.root.position.set(at.x + (k - 0.5) * 0.4, at.y + 0.3, at.z)
      b.fat = 0
      this.shoo(b, host, true)
      k++
    }
  }

  /** Everyone flies away (the rice is ripe). */
  away() {
    for (const b of this.list) {
      if (b.state === 'off' || b.state === 'away') continue
      this.release(b)
      b.state = 'away'
      b.from.copy(b.root.position)
      b.to.set(b.root.position.x < 0 ? -10 : 10, 5, -6)
      b.t = 0
      b.dur = 2
    }
  }

  private flyTo(b: Bird, host: BirdHost, kaylee: Vector3) {
    const hill = host.pickHill(kaylee)
    if (hill < 0) return this.goAway(b)
    this.release(b)
    b.state = 'in'
    b.hill = hill
    b.from.copy(b.root.position)
    host.hillTop(hill, b.to)
    b.t = Math.min(b.t, 0)
    b.dur = clamp(b.from.distanceTo(b.to) / 4.5, 0.8, 2.2)
  }

  private goAway(b: Bird) {
    this.release(b)
    b.state = 'away'
    b.from.copy(b.root.position)
    b.to.set(b.root.position.x < 0 ? -10 : 10, 5, -6)
    b.t = 0
    b.dur = 2
  }

  private release(b: Bird) {
    if (b.perch >= 0) this.taken.delete(b.perch)
    b.perch = -1
  }

  private shoo(b: Bird, host: BirdHost, quick = false) {
    host.shooed(b.root.position.clone(), b.fat > 0.4)
    b.waddle = !quick && b.fat > 0.4 ? 0.55 : 0
    b.state = 'up'
    b.from.copy(b.root.position)
    // A free perch (or round the edge of the farm if they're all taken).
    const free = host.perches.map((_, i) => i).filter((i) => !this.taken.has(i))
    const p = free[Math.floor(Math.random() * free.length)]
    if (p === undefined) b.to.set(b.from.x < 0 ? -7 : 7, 3, -2)
    else {
      this.taken.add(p)
      b.perch = p
      b.to.copy(host.perches[p])
    }
    b.t = 0
    b.dur = clamp(b.from.distanceTo(b.to) / 4, 0.7, 1.6)
  }

  update(dt: number, t: number, host: BirdHost, kaylee: Vector3, growing: boolean) {
    for (const b of this.list) {
      if (b.state === 'off') continue
      let flap = 0
      const near = Math.hypot(b.root.position.x - kaylee.x, b.root.position.z - kaylee.z) < SHOO_R
      if (b.state === 'in' || b.state === 'up' || b.state === 'away') {
        if (b.waddle > 0) {
          // A round bird can't just take off: two little hops first.
          b.waddle -= dt
          const k = 1 - b.waddle / 0.55
          b.root.position.y = b.from.y + Math.abs(Math.sin(k * Math.PI * 2)) * 0.12
          b.body.rotation.z = Math.sin(k * Math.PI * 4) * 0.25
          if (b.waddle <= 0) b.body.rotation.z = 0
          this.place(b)
          continue
        }
        b.t += dt / b.dur
        const k = clamp(b.t, 0, 1)
        if (b.state === 'in') host.hillTop(b.hill, b.to)
        tmp.lerpVectors(b.from, b.to, k)
        tmp.y += bell(k) * (b.state === 'away' ? 0.5 : 1.1)
        if (b.t > 0) {
          const dx = tmp.x - b.root.position.x
          const dz = tmp.z - b.root.position.z
          if (Math.hypot(dx, dz) > 1e-3) b.root.rotation.y = Math.atan2(dx, dz)
          b.root.position.copy(tmp)
          b.root.visible = true
        }
        flap = 1
        if (k >= 1) {
          if (b.state === 'in') {
            b.state = 'peck'
            b.peckIn = 0.3
          } else if (b.state === 'up') {
            b.state = 'perch'
            b.rest = 4 + Math.random() * 3
            b.root.rotation.y = Math.random() * 0.6 - 0.3
          } else {
            b.state = 'off'
            b.root.visible = b.shadow.visible = false
          }
        }
        // Coming down to land right where she is: changes its mind.
        if (b.state === 'in' && k > 0.6 && near) this.shoo(b, host, true)
      } else if (b.state === 'peck') {
        host.hillTop(b.hill, b.root.position)
        b.sat += dt
        b.fat = Math.max(b.fat, clamp((b.sat - FAT_S) / 3, 0, 1))
        b.peckIn -= dt
        if (b.peckIn <= 0) {
          b.peckIn = 0.45 + Math.random() * 0.5
          b.bob = 0
          host.peck(b.hill)
          if (Math.random() < 0.3) b.root.rotation.y += (Math.random() - 0.5) * 1.6
        }
        if (near) this.shoo(b, host)
        if (!growing) this.goAway(b)
      } else if (b.state === 'perch') {
        b.root.position.copy(b.to)
        b.rest -= dt
        // A look round now and then.
        b.head.rotation.y = Math.sin(t * 1.3 + b.i) * 0.6
        if (b.rest <= 0) {
          b.t = 0
          if (growing) this.flyTo(b, host, kaylee)
          else this.goAway(b)
        }
      }
      // ---- The body: flapping wings in the air, a peck's bob, round when fat ----
      b.bob = Math.min(1, b.bob + dt / 0.22)
      const w = flap ? Math.sin(t * 38 + b.i) * 1.1 + 0.2 : -1.25
      b.wings[0].rotation.z = -w
      b.wings[1].rotation.z = w
      b.head.rotation.x = b.state === 'peck' ? bell(b.bob) * 1.0 : 0
      b.body.rotation.x = b.state === 'peck' ? bell(b.bob) * 0.35 : flap ? -0.15 : 0
      const f = 1 + 0.45 * b.fat
      b.body.scale.set(f, 1 + 0.25 * b.fat, f)
      b.root.scale.setScalar(1.5)
      this.place(b)
    }
  }

  private place(b: Bird) {
    b.shadow.position.set(b.root.position.x, levelAt(b.root.position.z) - WATER_DOWN + 0.01, b.root.position.z)
    b.shadow.visible = b.root.visible && b.state !== 'perch'
  }
}
