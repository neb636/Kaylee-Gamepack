// What lies on the race course (race.ts), Mario Kart style, in the toon look:
// - Rainbow item boxes in rows across the course: drive through one and an item spins up in her slot (🚀 a turbo,
//   🍌 a banana to throw at whoever is ahead, or drop behind, 🌈 the rainbow: fast, sparkly and nothing can stop her).
//   They pop back a moment later.
// - Lines of gold coins along the course (each one makes her boat a little faster, up to ten), back again next lap.
// - Golden arrow pads that give a burst of speed, and a striped ramp to jump off (a tap in the air is a trick).
// - Banana peels on the water (the macaque drops them; she can drop one too): drive over one and spin round.
// Each check takes a racer's place on the course (track.ts: `s` along it, `lat` across it).
import { AdditiveBlending, BackSide, BoxGeometry, CanvasTexture, Color, DoubleSide, Euler, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, RepeatWrapping, TorusGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { swell } from '../../../engine/water'
import { RAINBOW } from './scenery'
import { ahead, BOOST_HALF, BOOSTS, COIN_LINES, ITEM_LATS, ITEM_ROWS, RAMP, spotAt } from './track'

export type ItemKind = 'turbo' | 'banana' | 'rainbow'
export const ITEM_ICONS: Record<ItemKind, string> = { turbo: '🚀', banana: '🍌', rainbow: '🌈' }

const tmp = new Vector3()
const m4 = new Matrix4()
const q = new Quaternion()
const scl = new Vector3()
const euler = new Euler()

/** A rainbow cube with a big white "?" on every face. */
function boxTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 128, 128)
  RAINBOW.forEach((col, i) => grad.addColorStop(i / (RAINBOW.length - 1), col))
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  g.strokeStyle = 'rgba(255,255,255,0.9)'
  g.lineWidth = 10
  g.strokeRect(5, 5, 118, 118)
  g.fillStyle = '#FFFFFF'
  g.font = 'bold 92px Fredoka, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.lineWidth = 8
  g.strokeStyle = '#2B2330'
  g.strokeText('?', 64, 70)
  g.fillText('?', 64, 70)
  return bag.add(new CanvasTexture(c))
}

/** Gold and pink arrows pointing along the course (they scroll forward). */
function arrowTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const g = c.getContext('2d')!
  g.clearRect(0, 0, 64, 64)
  g.fillStyle = 'rgba(255,200,61,0.95)'
  g.beginPath()
  g.moveTo(6, 54)
  g.lineTo(32, 18)
  g.lineTo(58, 54)
  g.lineTo(44, 54)
  g.lineTo(32, 37)
  g.lineTo(20, 54)
  g.closePath()
  g.fill()
  g.strokeStyle = 'rgba(255,79,154,0.95)'
  g.lineWidth = 4
  g.stroke()
  const t = bag.add(new CanvasTexture(c))
  t.wrapS = t.wrapT = RepeatWrapping
  return t
}

interface Box {
  /** Where it floats (the instanced boxes are drawn here), how big it is now. */
  at: Vector3
  scale: number
  s: number
  lat: number
  x: number
  z: number
  /** Seconds until it's back (0 = here). */
  gone: number
  /** Growing back in, 0..1. */
  grow: number
}

interface Coin {
  s: number
  lat: number
  x: number
  z: number
  gone: number
}

interface Peel {
  g: Group
  x: number
  z: number
  age: number
  on: boolean
}

interface Throw {
  g: Group
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  hit: () => void
}

export class Course {
  readonly root = new Group()
  private boxes: Box[] = []
  private boxMesh: InstancedMesh
  private boxInk: InstancedMesh
  private coins: Coin[] = []
  private coinMesh: InstancedMesh
  private pads: { mesh: Mesh; s: number; lat: number }[] = []
  private arrows: CanvasTexture
  private peels: Peel[] = []
  private throws: Throw[] = []
  private time = 0

  constructor(private bag: Bag) {
    // ---- Item boxes (one instanced mesh, and a slightly bigger ink one drawn inside out round it: the outline) ----
    const tex = boxTexture(bag)
    const boxGeo = bag.add(new BoxGeometry(1.5, 1.5, 1.5))
    for (const s of ITEM_ROWS)
      for (const lat of ITEM_LATS) {
        const p = spotAt(s, lat)
        this.boxes.push({ at: new Vector3(p.x, 1.2, p.z), scale: 1, s, lat, x: p.x, z: p.z, gone: 0, grow: 1 })
      }
    this.boxMesh = bag.add(new InstancedMesh(boxGeo, bag.add(new MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.92 })), this.boxes.length))
    this.boxInk = bag.add(new InstancedMesh(boxGeo, bag.add(new MeshBasicMaterial({ color: PAL.ink, side: BackSide })), this.boxes.length))
    for (const m of [this.boxMesh, this.boxInk]) {
      m.frustumCulled = false
      this.root.add(m)
    }

    // ---- Coins (one instanced mesh) ----
    // A gold coin: a darker rim, the face, a lighter middle.
    const coinGeo = merge([
      P.cyl(0.5, 0.5, 0.1, '#C98F1E', { rot: [Math.PI / 2, 0, 0] }, 16),
      P.cyl(0.44, 0.44, 0.13, PAL.gold, { rot: [Math.PI / 2, 0, 0] }, 16),
      P.cyl(0.28, 0.28, 0.15, '#FFE07A', { rot: [Math.PI / 2, 0, 0] }, 12),
    ])
    for (const line of COIN_LINES)
      for (let i = 0; i < line.n; i++) {
        const s = line.s + i * 2.4
        const p = spotAt(s, line.lat)
        this.coins.push({ s, lat: line.lat, x: p.x, z: p.z, gone: 0 })
      }
    this.coinMesh = bag.add(new InstancedMesh(bag.add(coinGeo), toon('#ffffff', true), this.coins.length))
    this.coinMesh.frustumCulled = false
    this.root.add(this.coinMesh)

    // ---- Boost pads ----
    this.arrows = arrowTexture(bag)
    const padMat = bag.add(new MeshBasicMaterial({ map: this.arrows, transparent: true, depthWrite: false, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 }))
    this.arrows.repeat.set(1, 2)
    for (const b of BOOSTS) {
      const p = spotAt(b.s, b.lat)
      const plate = new Mesh(bag.add(new PlaneGeometry(BOOST_HALF.across * 2, BOOST_HALF.along * 2)), padMat)
      // Flat on the water, its arrows (the texture's up) pointing along the course.
      plate.rotation.set(-Math.PI / 2, p.heading + Math.PI, 0, 'YXZ')
      plate.position.set(p.x, 0.06, p.z)
      plate.renderOrder = 2
      // A glowing rim round it.
      const rim = new Mesh(bag.add(new PlaneGeometry(BOOST_HALF.across * 2 + 0.6, BOOST_HALF.along * 2 + 0.6)), bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.35, depthWrite: false, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })))
      rim.rotation.copy(plate.rotation)
      rim.position.set(p.x, 0.05, p.z)
      rim.renderOrder = 1
      this.root.add(rim, plate)
      this.pads.push({ mesh: plate, s: b.s, lat: b.lat })
    }

    // ---- The ramp: a striped wedge on floats, its lip at the far end ----
    const rp = spotAt(RAMP.s, RAMP.lat)
    const ramp = new Group()
    ramp.position.set(rp.x, 0, rp.z)
    ramp.rotation.y = rp.heading
    const parts: BufferGeometry[] = []
    const slices = 6
    const w = (RAMP.half * 2) / slices
    for (let i = 0; i < slices; i++) {
      // The wedge's side profile (x along the course, y up), pushed across the course; rotated so x runs forward.
      parts.push(P.prism([[-RAMP.len / 2, 0.05], [RAMP.len / 2, 2.1], [RAMP.len / 2, 0.05]], w, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [-RAMP.half + (i + 0.5) * w, 0, 0], rot: [0, -Math.PI / 2, 0] }))
    }
    // Gold rails up its sides, darker side walls (so it reads as a slope from behind), a gold lip.
    for (const s of [-1, 1]) {
      parts.push(P.box(0.2, 0.2, Math.hypot(RAMP.len, 2.05) + 0.2, PAL.gold, { at: [s * (RAMP.half + 0.1), 1.15, 0], rot: [-Math.atan2(2.05, RAMP.len), 0, 0] }))
      parts.push(P.prism([[-RAMP.len / 2, 0.05], [RAMP.len / 2, 2.1], [RAMP.len / 2, 0.05]], 0.1, '#C93E7A', { at: [s * (RAMP.half + 0.02), 0, 0], rot: [0, -Math.PI / 2, 0] }))
    }
    parts.push(P.box(RAMP.half * 2 + 0.4, 0.22, 0.3, PAL.gold, { at: [0, 2.12, RAMP.len / 2] }))
    for (const s of [-1, 1]) for (const z of [-1.4, 1.4]) parts.push(P.cyl(0.45, 0.45, 1.1, '#5FA7E8', { at: [s * (RAMP.half - 0.6), 0, z], rot: [Math.PI / 2, 0, 0] }, 10))
    ramp.add(solid(merge(parts), bag, 2))
    this.root.add(ramp)

    // ---- Banana peels (a few, reused) ----
    for (let i = 0; i < 8; i++) {
      const g = this.peel()
      g.visible = false
      this.root.add(g)
      this.peels.push({ g, x: 0, z: 0, age: 0, on: false })
    }
  }

  /** A big comic banana peel: three yellow flaps splayed out round a brown stalk. */
  peel(): Group {
    const g = new Group()
    const parts: BufferGeometry[] = [P.sphere(0.26, '#FFE15A', { at: [0, 0.18, 0], scale: [1, 0.8, 1] }, 10), P.cyl(0.06, 0.08, 0.3, '#8B6A4E', { at: [0, 0.42, 0] }, 6)]
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2
      parts.push(P.capsule(0.13, 0.5, k % 2 ? '#FFE15A' : '#F2C24C', { at: [Math.sin(a) * 0.38, 0.1, Math.cos(a) * 0.38], rot: [Math.cos(a) * 1.25, 0, -Math.sin(a) * 1.25] }))
    }
    g.add(solid(merge(parts), this.bag, 2))
    g.scale.setScalar(1.4)
    return g
  }

  /** A racer's middle at (x, z): the item box it drove through (it pops), if any. */
  takeBox(x: number, z: number): Vector3 | null {
    for (const b of this.boxes) {
      if (b.gone > 0 || b.grow < 0.6) continue
      if ((b.x - x) ** 2 + (b.z - z) ** 2 > 2.3 ** 2) continue
      b.gone = 2.4
      return b.at.clone()
    }
    return null
  }

  /** Coins she drove through (each comes back after a while). */
  takeCoins(x: number, z: number): Vector3[] {
    const out: Vector3[] = []
    for (const c of this.coins) {
      if (c.gone > 0 || (c.x - x) ** 2 + (c.z - z) ** 2 > 1.9 ** 2) continue
      c.gone = 9
      out.push(new Vector3(c.x, 1, c.z))
    }
    return out
  }

  /** On a boost pad at (s, lat)? */
  onPad(s: number, lat: number) {
    return this.pads.some((p) => Math.abs(ahead(p.s, s)) < BOOST_HALF.along && Math.abs(lat - p.lat) < BOOST_HALF.across + 0.6)
  }

  /** Going up the ramp at (s, lat): how far up it (0 bottom .. 1 the lip), or null when not on it. */
  onRamp(s: number, lat: number) {
    const d = ahead(RAMP.s - RAMP.len / 2, s)
    if (d < 0 || d > RAMP.len || Math.abs(lat - RAMP.lat) > RAMP.half) return null
    return d / RAMP.len
  }

  /** A banana peel dropped on the water at (x, z). */
  drop(x: number, z: number) {
    const p = this.peels.find((x) => !x.on) ?? this.peels.reduce((a, b) => (a.age > b.age ? a : b))
    p.on = true
    p.age = 0
    p.x = x
    p.z = z
    p.g.visible = true
    p.g.position.set(x, 0, z)
  }

  /** A racer at (x, z) runs over a peel: true (it's gone, squashed). */
  slip(x: number, z: number): Vector3 | null {
    for (const p of this.peels) {
      if (!p.on || p.age < 0.6 || (p.x - x) ** 2 + (p.z - z) ** 2 > 1.7 ** 2) continue
      p.on = false
      p.g.visible = false
      return new Vector3(p.x, 0.3, p.z)
    }
    return null
  }

  /** The peels on the water (for the rivals to steer round, and the minimap). */
  get peelsOut() {
    return this.peels.filter((p) => p.on)
  }

  /** A banana thrown in an arc from `from` to wherever `to()` is by then; `hit` when it lands on them. */
  toss(from: Vector3, to: () => Vector3, hit: () => void) {
    const g = this.peel()
    g.position.copy(from)
    this.root.add(g)
    this.throws.push({ g, from: from.clone(), to, t: 0, dur: 0.75, hit })
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    this.boxes.forEach((b, i) => {
      let size = 0.0001
      if (b.gone > 0) {
        b.gone -= dt
        if (b.gone <= 0) b.grow = 0
      } else {
        b.grow = Math.min(1, b.grow + dt / 0.35)
        size = Math.max(0.01, b.grow < 1 ? Math.sin(b.grow * Math.PI * 0.5) * (1 + 0.25 * Math.sin(b.grow * Math.PI)) : 1)
      }
      b.at.y = 1.25 + Math.sin(t * 2.4 + b.lat) * 0.18
      q.setFromEuler(euler.set(0.35, t * 1.3 + b.s, 0.2))
      m4.compose(b.at, q, scl.setScalar(size))
      this.boxMesh.setMatrixAt(i, m4)
      m4.compose(b.at, q, scl.setScalar(size * 1.12))
      this.boxInk.setMatrixAt(i, m4)
    })
    this.boxMesh.instanceMatrix.needsUpdate = true
    this.boxInk.instanceMatrix.needsUpdate = true
    this.coins.forEach((c, i) => {
      if (c.gone > 0) c.gone -= dt
      const s = c.gone > 0 ? 0.0001 : 1
      q.setFromAxisAngle(tmp.set(0, 1, 0), t * 3 + i * 0.4)
      m4.compose(tmp.set(c.x, 1 + Math.sin(t * 3 + i) * 0.12, c.z), q, scl.setScalar(s))
      this.coinMesh.setMatrixAt(i, m4)
    })
    this.coinMesh.instanceMatrix.needsUpdate = true
    this.arrows.offset.y = -t * 1.6
    for (const p of this.peels) {
      if (!p.on) continue
      p.age += dt
      if (p.age > 30) {
        p.on = false
        p.g.visible = false
        continue
      }
      p.g.position.y = swell(p.x, p.z, t) + 0.02
      p.g.rotation.y = t * 0.6 + p.x
      p.g.scale.setScalar(1.4 * Math.min(1, p.age / 0.25))
    }
    for (const th of [...this.throws]) {
      th.t += dt / th.dur
      const k = Math.min(1, th.t)
      const to = th.to()
      th.g.position.lerpVectors(th.from, to, k)
      th.g.position.y += Math.sin(k * Math.PI) * 4
      th.g.rotation.set(t * 9, t * 7, 0)
      if (k >= 1) {
        this.throws.splice(this.throws.indexOf(th), 1)
        th.g.removeFromParent()
        th.hit()
      }
    }
  }
}

/** The rainbow round a racer while it lasts: a glowing ring on the water that cycles through the colors. */
export function buildAura(bag: Bag) {
  const mat = bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false }))
  const ring = new Mesh(bag.add(new TorusGeometry(3.6, 0.35, 8, 40)), mat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.3
  ring.visible = false
  const c = new Color()
  return {
    mesh: ring,
    update(t: number, on: boolean) {
      ring.visible = on
      if (!on) return
      c.setHSL((t * 0.9) % 1, 0.9, 0.62)
      mat.color.copy(c)
      ring.scale.setScalar(1 + Math.sin(t * 10) * 0.06)
    },
  }
}
