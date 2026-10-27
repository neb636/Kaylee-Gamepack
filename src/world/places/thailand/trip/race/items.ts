// What every race lays on its course, Mario Kart style, in the toon look (the boat race's lagoon, the Nan Mountain
// Cup's roads):
// - Coins: lines of gold coins along the course (each one makes her a little faster, up to ten; the race decides how
//   much). A line can hang up in the air along the way she flies off a jump. Each comes back after a while.
// - Arrow pads: gold arrows that scroll forward, flat on the course: drive over one for a burst of speed.
// Each is placed by the race's own `Place` (where `s` along and `lat` across is, how high the ground is there and how
// steeply it climbs), so they sit on water or follow a road up and down a hill.
import { CanvasTexture, DoubleSide, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, RepeatWrapping, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P } from '../../../../engine3d/geo'
import { PAL, toon } from '../../../../engine3d/toon'

/** Where `s` along and `lat` across the course is: the ground's height there (`y`), the heading along it, and how much
 *  it climbs per meter (`grade`, 0 on water). */
export type Place = (s: number, lat: number) => { x: number; y: number; z: number; heading: number; grade?: number }

const tmp = new Vector3()
const m4 = new Matrix4()
const q = new Quaternion()
const scl = new Vector3()

/** A line of coins: `n` of them from `s` on, `lat` across (`air`: up in an arc along a jump's flight, `arc` meters
 *  high if this jump's isn't the usual one). */
export interface CoinLine {
  s: number
  lat: number
  n: number
  air?: boolean
  arc?: number
}

interface Coin {
  s: number
  lat: number
  x: number
  /** How high it floats (the air line's coins hang up along the way she flies). */
  y: number
  z: number
  /** Its usual height (it bobs round it). */
  rest: number
  gone: number
}

export class Coins {
  readonly mesh: InstancedMesh
  private coins: Coin[] = []
  private time = 0

  /** `gap`: meters between coins on the ground (and in the air); `arc`: how high the air line rises (meters). */
  constructor(bag: Bag, lines: CoinLine[], place: Place, o: { gap?: number; airGap?: number; arc?: number } = {}) {
    const gap = o.gap ?? 2.4
    const airGap = o.airGap ?? 3
    const arc = o.arc ?? 3.6
    // A gold coin: a darker rim, the face, a lighter middle.
    const geo = merge([
      P.cyl(0.5, 0.5, 0.1, '#C98F1E', { rot: [Math.PI / 2, 0, 0] }, 16),
      P.cyl(0.44, 0.44, 0.13, PAL.gold, { rot: [Math.PI / 2, 0, 0] }, 16),
      P.cyl(0.28, 0.28, 0.15, '#FFE07A', { rot: [Math.PI / 2, 0, 0] }, 12),
    ])
    for (const line of lines)
      for (let i = 0; i < line.n; i++) {
        const s = line.s + i * (line.air ? airGap : gap)
        const p = place(s, line.lat)
        // Up in the air: an arc like the one she flies off a jump (1 m up, then higher, and down again).
        const up = line.air ? 1 + Math.sin(((i + 0.5) / line.n) * Math.PI) * (line.arc ?? arc) : 1
        this.coins.push({ s, lat: line.lat, x: p.x, y: p.y + up, z: p.z, rest: up, gone: 0 })
      }
    this.mesh = bag.add(new InstancedMesh(bag.add(geo), toon('#ffffff', true), this.coins.length))
    this.mesh.frustumCulled = false
  }

  /** Coins a racer drove (or flew) through, `y` its height (each comes back after a while). */
  take(x: number, y: number, z: number): Vector3[] {
    const out: Vector3[] = []
    for (const c of this.coins) {
      if (c.gone > 0 || (c.x - x) ** 2 + (c.z - z) ** 2 > 2.1 ** 2 || Math.abs(c.y - (y + 1)) > 2.2) continue
      c.gone = 12
      out.push(new Vector3(c.x, c.y, c.z))
    }
    return out
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    this.coins.forEach((c, i) => {
      if (c.gone > 0) c.gone -= dt
      const s = c.gone > 0 ? 0.0001 : 1
      q.setFromAxisAngle(tmp.set(0, 1, 0), t * 3 + i * 0.4)
      m4.compose(tmp.set(c.x, c.y + Math.sin(t * 3 + i) * 0.12, c.z), q, scl.setScalar(c.rest > 1 ? s * 1.3 : s))
      this.mesh.setMatrixAt(i, m4)
    })
    this.mesh.instanceMatrix.needsUpdate = true
  }
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

export class Pads {
  readonly root = new Group()
  private arrows: CanvasTexture
  private pads: { s: number; lat: number }[]

  /** `half`: half a pad's size, across the course and along it; `ahead(a, b)`: meters from `a` forward to `b` on the
   *  course. */
  constructor(
    bag: Bag,
    pads: { s: number; lat: number }[],
    private half: { across: number; along: number },
    place: Place,
    private ahead: (a: number, b: number) => number,
  ) {
    this.pads = pads
    this.arrows = arrowTexture(bag)
    const padMat = bag.add(new MeshBasicMaterial({ map: this.arrows, transparent: true, depthWrite: false, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 }))
    const rimMat = bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.35, depthWrite: false, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }))
    this.arrows.repeat.set(1, 2)
    for (const b of pads) {
      const p = place(b.s, b.lat)
      // Turned along the course and tipped up its slope; inside, flat on the ground with the arrows (the texture's
      // up) pointing forward.
      const g = new Group()
      g.position.set(p.x, p.y, p.z)
      g.rotation.set(-Math.atan(p.grade ?? 0), p.heading, 0, 'YXZ')
      const plate = new Mesh(bag.add(new PlaneGeometry(half.across * 2, half.along * 2)), padMat)
      plate.rotation.set(-Math.PI / 2, Math.PI, 0, 'YXZ')
      plate.position.y = 0.06
      plate.renderOrder = 2
      // A glowing rim round it.
      const rim = new Mesh(bag.add(new PlaneGeometry(half.across * 2 + 0.6, half.along * 2 + 0.6)), rimMat)
      rim.rotation.copy(plate.rotation)
      rim.position.y = 0.05
      rim.renderOrder = 1
      g.add(rim, plate)
      this.root.add(g)
    }
  }

  /** On a pad at (s, lat)? */
  on(s: number, lat: number) {
    return this.pads.some((p) => Math.abs(this.ahead(p.s, s)) < this.half.along && Math.abs(lat - p.lat) < this.half.across + 0.6)
  }

  update(t: number) {
    this.arrows.offset.y = -t * 1.6
  }
}
