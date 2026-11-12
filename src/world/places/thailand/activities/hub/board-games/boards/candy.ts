// A miniature candy landscape: raised sweets follow a winding trail through four picture-card destinations.
// Coordinates, heights, pawn landings and destination halos all share the same spline.
import { CanvasTexture, CatmullRomCurve3, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, SRGBColorSpace, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { P } from '../../../../../../engine3d/geo'
import { paintedMaterial, rng, shadows, toy } from '../look'
import { bell } from '../../../../../../../sdk'
import { CANDY_FINISH, LANDMARKS, colorOf, type CandyColor, type Landmark } from '../rules/candy'
import type { Who } from '../rules/turns'

export const CANDY_HEX: Record<CandyColor, string> = { pink: '#FF6FA8', orange: '#FF9A3D', yellow: '#FFD93D', green: '#4FCB7F', blue: '#4FA8FF', purple: '#A77BFF' }
export const CANDY_SHAPE: Record<CandyColor, 'heart' | 'star' | 'drop' | 'leaf' | 'moon' | 'flower'> = {
  pink: 'heart',
  orange: 'star',
  yellow: 'drop',
  green: 'leaf',
  blue: 'moon',
  purple: 'flower',
}
const FLOOR = 0.027
const TILE = 0.066
const HOUSE = new Vector3(-0.18, FLOOR, -0.46)
const route = new CatmullRomCurve3(
  [
    [-0.34, 0.045, 0.3],
    [-0.15, 0.045, 0.32],
    [0.15, 0.045, 0.3],
    [0.33, 0.05, 0.22],
    [0.29, 0.055, 0.1],
    [0.04, 0.09, 0.08],
    [-0.23, 0.05, 0.1],
    [-0.34, 0.045, -0.01],
    [-0.23, 0.045, -0.13],
    [0.03, 0.06, -0.13],
    [0.3, 0.095, -0.17],
    [0.32, 0.115, -0.29],
    [0.12, 0.095, -0.37],
    [-0.12, 0.055, -0.36],
    [-0.18, 0.045, -0.4],
  ].map(([x, y, z]) => new Vector3(x, y, z)),
  false,
  'centripetal',
)
export function candySpace(i: number): Vector3 {
  return route.getPointAt(Math.max(0, Math.min(CANDY_FINISH, i)) / CANDY_FINISH)
}

export class CandyBoard {
  readonly root = new Group()
  private house: Group
  private houseT = -1
  private ring: Mesh
  private mark: number | null = null
  private props: { root: Group; time: number }[] = []

  constructor(bag: Bag) {
    // A thick strawberry-and-vanilla cake, with a scalloped icing rim.
    const ground: BufferGeometry[] = [
      P.rbox(0.88, 0.045, 0.94, 0.035, '#E88AAF', { at: [0, -0.025, -0.06] }),
      P.rbox(0.89, 0.018, 0.95, 0.035, '#FFF0C9', { at: [0, -0.004, -0.06] }),
      P.rbox(0.88, 0.025, 0.94, 0.035, '#BCE9CD', { at: [0, 0.015, -0.06] }),
    ]
    for (let i = 0; i < 25; i++) {
      const x = -0.42 + i * 0.035
      ground.push(P.sphere(0.022, '#FFF6DF', { at: [x, 0.017, 0.395], scale: [1, 0.55, 0.7] }, 8))
      ground.push(P.sphere(0.022, '#FFF6DF', { at: [x, 0.017, -0.515], scale: [1, 0.55, 0.7] }, 8))
    }
    this.root.add(toy((ground), bag, 1))
    // The cake's top is iced: swirls of lighter icing, sprinkles, sugar, and the trail's shade.
    const icing = new Mesh(bag.add(new PlaneGeometry(ICING.w, ICING.d)), paintedMaterial(bag, paintIcing()))
    icing.rotation.x = -Math.PI / 2
    icing.position.set(0, FLOOR + 0.0012, -0.06)
    icing.raycast = () => {}
    this.root.add(icing)
    // Pools occupy the spaces between bends, never a tile. A chocolate river passes under the raised bridge.
    this.root.add(
      toy(
        ([
          // (Each pool has a paler shore round it and a shine on it.)
          P.sphere(0.158, '#FFE3F0', { at: [-0.13, FLOOR - 0.0006, 0.21], scale: [1.5, 0.025, 0.42] }, 24),
          P.sphere(0.15, '#F7BDD9', { at: [-0.13, FLOOR, 0.21], scale: [1.5, 0.025, 0.42] }, 24),
          P.sphere(0.05, '#FFD6E8', { at: [-0.2, FLOOR + 0.0034, 0.2], scale: [1.5, 0.02, 0.3] }, 14),
          P.sphere(0.148, '#FFFFFF', { at: [-0.19, FLOOR - 0.0006, -0.25], scale: [1.4, 0.045, 0.6] }, 24),
          P.sphere(0.14, '#FFF0E9', { at: [-0.19, FLOOR, -0.25], scale: [1.4, 0.045, 0.6] }, 24),
          P.sphere(0.138, '#FFFFFF', { at: [0.22, FLOOR - 0.0006, -0.32], scale: [1.1, 0.06, 0.8] }, 24),
          P.sphere(0.13, '#DDEBFF', { at: [0.22, FLOOR, -0.32], scale: [1.1, 0.06, 0.8] }, 24),
          P.sphere(0.138, '#C18A6E', { at: [0.08, FLOOR - 0.0006, 0], scale: [1.1, 0.025, 0.62] }, 24),
          P.sphere(0.13, '#A56B53', { at: [0.08, FLOOR, 0], scale: [1.1, 0.025, 0.62] }, 24),
          P.sphere(0.04, '#C18A6E', { at: [0.12, FLOOR + 0.003, -0.02], scale: [1.4, 0.02, 0.3] }, 12),
          ...Array.from({ length: 9 }, (_, i) => P.sphere(0.024, '#A56B53', { at: [0.055 + Math.sin(i * 0.7) * 0.014, FLOOR + 0.001, 0.03 + i * 0.019], scale: [1, 0.07, 1] }, 12)),
        ]),
        bag,
        0,
      ),
    )
    // One merged mesh for all the thick, rounded stepping sweets and their cream undersides.
    const tiles: BufferGeometry[] = []
    for (let i = 0; i <= CANDY_FINISH; i++) {
      const p = candySpace(i)
      const tangent = route.getTangentAt(i / CANDY_FINISH)
      const angle = Math.atan2(tangent.x, tangent.z)
      tiles.push(P.rbox(TILE + 0.009, 0.018, TILE + 0.009, 0.008, '#FFF7E6', { at: [p.x, p.y - 0.019, p.z], rot: [0, angle, 0] }))
      tiles.push(
        P.rbox(TILE, 0.016, TILE, 0.009, i === 0 ? '#FFE8F0' : i === CANDY_FINISH ? '#FFE58B' : CANDY_HEX[colorOf(i)], {
          at: [p.x, p.y - 0.008, p.z],
          rot: [0, angle, 0],
        }),
      )
      // Little bridge piers make the changing elevation tangible.
      if (p.y > 0.065) tiles.push(P.cyl(0.017, 0.021, p.y - FLOOR - 0.015, '#FFF1DC', { at: [p.x, (p.y + FLOOR - 0.015) / 2, p.z] }, 10))
      const key = (Object.keys(LANDMARKS) as Landmark[]).find((k) => LANDMARKS[k].space === i)
      const face = document.createElement('canvas')
      face.width = 128
      face.height = 128
      const ctx = face.getContext('2d')!
      if (key) {
        ctx.fillStyle = '#FFF7DD'
        ctx.beginPath()
        ctx.arc(64, 64, 54, 0, Math.PI * 2)
        ctx.fill()
        ctx.save()
        ctx.translate(64, 64)
        ctx.scale(0.55, 0.55)
        landmarkPicture(ctx, key)
        ctx.restore()
      } else if (i > 0 && i < CANDY_FINISH) {
        ctx.fillStyle = '#FFFFFF'
        candyShape(ctx, CANDY_SHAPE[colorOf(i)], 64, 64, 24)
        ctx.fill()
      } else {
        ctx.fillStyle = '#D85C98'
        candyShape(ctx, 'heart', 64, 64, 30)
        ctx.fill()
      }
      const tex = bag.add(new CanvasTexture(face))
      tex.colorSpace = SRGBColorSpace
      const icon = new Mesh(bag.add(new PlaneGeometry(TILE * 0.85, TILE * 0.85)), bag.add(new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })))
      icon.rotation.x = -Math.PI / 2
      icon.position.set(p.x, p.y + 0.001, p.z)
      this.root.add(icon)
    }
    this.root.add(toy((tiles), bag, 0.65))
    // Landmarks inside the bends, tall enough to read, placed behind their nearby trail.
    const places: [Landmark, number, number][] = [
      ['gumdrop', 0.18, 0.21],
      ['lollipop', -0.22, -0.235],
      ['icecream', 0.23, -0.32],
      ['chocolate', 0.04, -0.035],
    ]
    for (const [key, x, z] of places) {
      const prop = buildLandmark(key, bag)
      prop.position.set(x, FLOOR, z)
      prop.userData.pick = `trip:table:candy:${key}`
      this.root.add(prop)
      this.props.push({ root: prop, time: -1 })
    }
    // Tiny candy vegetation around the journey, with room for the players.
    const sweets: BufferGeometry[] = []
    for (let i = 0; i < 24; i++) {
      const x = -0.38 + (i % 8) * 0.108,
        z = -0.48 + Math.floor(i / 8) * 0.36
      if (Array.from({ length: 38 }, (_, j) => candySpace(j)).some((p) => Math.hypot(p.x - x, p.z - z) < 0.065)) continue
      sweets.push(P.sphere(0.013, CANDY_HEX[colorOf(i + 1)], { at: [x, FLOOR + 0.009, z], scale: [1, 1.1, 1] }, 8))
    }
    if (sweets.length) this.root.add(toy((sweets), bag, 0.6))
    // Shade: the cake's on the grass, and on the cake the landmarks' and the house's.
    this.root.add(
      shadows(bag, [
        ...[-0.2, 0.2].flatMap((x) => [-0.28, 0.14].map((z) => [x, z - 0.02, 0.36, 0.04] as [number, number, number, number])),
        ...places.map(([, x, z]) => [x, z, 0.06, 0.09, FLOOR] as [number, number, number, number, number]),
        [HOUSE.x, HOUSE.z, 0.1, 0.1, FLOOR],
      ]),
    )
    this.house = buildHouse(bag)
    this.house.position.copy(HOUSE)
    this.house.userData.pick = 'trip:table:castle'
    this.root.add(this.house)
    this.ring = new Mesh(bag.add(new RingGeometry(0.035, 0.043, 32)), bag.add(new MeshBasicMaterial({ color: '#FFF9B1', transparent: true, opacity: 0.95, depthWrite: false })))
    this.ring.rotation.x = -Math.PI / 2
    this.ring.visible = false
    this.root.add(this.ring)
  }
  spot(i: number, who: Who, sharing: boolean) {
    const p = candySpace(i)
    if (sharing) p.x += who === 0 ? -0.02 : 0.02
    return p
  }
  gate() {
    return candySpace(CANDY_FINISH)
  }
  castleTop() {
    return this.house.position.clone().add(new Vector3(0, 0.23, 0))
  }
  cheer() {
    this.houseT = 0
  }
  poke(id: string) {
    const p = this.props.find((p) => p.root.userData.pick === id)
    if (p) p.time = 0
  }
  markSpace(i: number | null) {
    this.mark = i
    this.ring.visible = i !== null
    if (i !== null) {
      this.ring.position.copy(candySpace(i))
      this.ring.position.y += 0.003
      const key = (Object.keys(LANDMARKS) as Landmark[]).find((k) => LANDMARKS[k].space === i)
      if (key) this.poke(`trip:table:candy:${key}`)
    }
  }
  get busy() {
    return this.houseT >= 0 || this.mark !== null || this.props.some((p) => p.time >= 0)
  }
  update(dt: number, t: number) {
    if (this.mark !== null) this.ring.scale.setScalar(1 + Math.sin(t * 9) * 0.12)
    for (const p of this.props) {
      if (p.time < 0) continue
      p.time += dt / 0.9
      const w = Math.sin(p.time * Math.PI * 4) * bell(Math.min(1, p.time)) * 0.18
      p.root.rotation.z = w
      p.root.scale.set(1 - w * 0.3, 1 + w, 1 - w * 0.3)
      if (p.time >= 1) {
        p.time = -1
        p.root.rotation.z = 0
        p.root.scale.setScalar(1)
      }
    }
    if (this.houseT < 0) return
    this.houseT += dt / 0.9
    const p = Math.min(1, this.houseT),
      s = 1 + bell(p) * 0.18 * Math.abs(Math.sin(p * Math.PI * 3))
    this.house.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
    if (this.houseT >= 1) {
      this.house.scale.setScalar(1)
      this.houseT = -1
    }
  }
}

/** The cake's iced top (inside its rounded corners). */
const ICING = { w: 0.82, d: 0.88 }
function paintIcing(): HTMLCanvasElement {
  const PX = 1050
  const c = document.createElement('canvas')
  const W = (c.width = Math.round(ICING.w * PX))
  const D = (c.height = Math.round(ICING.d * PX))
  const g = c.getContext('2d')!
  const at = (v: { x: number; z: number }) => [(ICING.w / 2 + v.x) * PX, (ICING.d / 2 + v.z + 0.06) * PX] as const
  g.fillStyle = '#BCE9CD'
  g.fillRect(0, 0, W, D)
  const r = rng(77)
  // Soft patches and long swirls of lighter icing.
  for (let i = 0; i < 22; i++) {
    const x = r() * W
    const y = r() * D
    const rad = 70 + r() * 130
    const sg = g.createRadialGradient(x, y, 0, x, y, rad)
    const col = i % 2 ? '226,250,232' : '168,224,196'
    sg.addColorStop(0, `rgba(${col},.55)`)
    sg.addColorStop(1, `rgba(${col},0)`)
    g.fillStyle = sg
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  g.lineCap = 'round'
  for (let i = 0; i < 9; i++) {
    g.strokeStyle = 'rgba(240,255,244,.5)'
    g.lineWidth = 10 + r() * 10
    g.beginPath()
    const y0 = (i + 0.5) * (D / 9)
    for (let x = -20; x <= W + 20; x += 20) g.lineTo(x, y0 + Math.sin(x * 0.012 + i * 1.7) * 26)
    g.stroke()
  }
  // The trail's shade (down and to the back left, like every shadow on the island).
  for (let i = 0; i <= CANDY_FINISH; i++) {
    const [x, y] = at(candySpace(i))
    const rad = TILE * PX * 0.95
    const sg = g.createRadialGradient(x - 12, y - 14, rad * 0.35, x - 12, y - 14, rad)
    sg.addColorStop(0, 'rgba(70,120,110,.34)')
    sg.addColorStop(1, 'rgba(70,120,110,0)')
    g.fillStyle = sg
    g.fillRect(x - rad * 1.3, y - rad * 1.3, rad * 2.6, rad * 2.6)
  }
  // Sprinkles and grains of sugar.
  const colors = Object.values(CANDY_HEX)
  for (let i = 0; i < 300; i++) {
    const x = r() * W
    const y = r() * D
    const a = r() * Math.PI
    g.strokeStyle = colors[i % colors.length]
    g.lineWidth = 5
    g.beginPath()
    g.moveTo(x - Math.cos(a) * 6, y - Math.sin(a) * 6)
    g.lineTo(x + Math.cos(a) * 6, y + Math.sin(a) * 6)
    g.stroke()
  }
  g.fillStyle = 'rgba(255,255,255,.9)'
  for (let i = 0; i < 220; i++) {
    g.beginPath()
    g.arc(r() * W, r() * D, 1.6 + r() * 1.8, 0, Math.PI * 2)
    g.fill()
  }
  return c
}

function buildHouse(bag: Bag) {
  const parts: BufferGeometry[] = [P.rbox(0.15, 0.095, 0.085, 0.012, '#FFADC9', { at: [0, 0.05, 0] }), P.rbox(0.039, 0.055, 0.012, 0.017, '#9866B5', { at: [0, 0.03, 0.047] })]
  for (const x of [-0.085, 0, 0.085]) {
    const h = x === 0 ? 0.19 : 0.13
    parts.push(
      P.cyl(0.029, 0.036, h, '#FFF2DB', { at: [x, h / 2, -0.015] }, 14),
      P.cone(0.045, 0.072, '#F56BA7', { at: [x, h + 0.035, -0.015] }, 14),
      P.sphere(0.012, '#FFD759', { at: [x, h + 0.076, -0.015] }, 10),
    )
    for (let j = 0; j < 3; j++) parts.push(P.torus(0.03, 0.005, '#F6B7D0', { at: [x, 0.026 + j * 0.034, -0.015], rot: [Math.PI / 2, 0, 0] }))
  }
  for (const x of [-0.055, 0.055]) parts.push(P.sphere(0.012, '#A7DCF8', { at: [x, 0.07, 0.044], scale: [0.8, 1, 0.25] }, 10))
  return toy((parts), bag, 1)
}

function buildLandmark(key: Landmark, bag: Bag) {
  const parts: BufferGeometry[] = []
  if (key === 'gumdrop') {
    for (const [x, z, r, c] of [
      [-0.04, 0, 0.034, '#A679E8'],
      [0.02, -0.014, 0.045, '#76DDA0'],
      [0.047, 0.024, 0.027, '#FF86AE'],
    ] as const) {
      parts.push(P.sphere(r, c, { at: [x, r * 0.6, z], scale: [1, 1.25, 1] }, 14))
      for (let j = 0; j < 5; j++) parts.push(P.sphere(0.003, '#FFF8DD', { at: [x + Math.cos(j * 2) * r * 0.7, r * (0.6 + Math.sin(j) * 0.3), z + r * 0.75] }, 6))
    }
  } else if (key === 'lollipop') {
    for (const [x, z, h, c] of [
      [-0.028, 0, 0.12, '#F36EA4'],
      [0.032, -0.025, 0.16, '#AB8AE5'],
    ] as const) {
      parts.push(P.cyl(0.005, 0.005, h, '#FFF4E3', { at: [x, h / 2, z] }, 8), P.cyl(0.039, 0.039, 0.012, c, { at: [x, h, z], rot: [Math.PI / 2, 0, 0] }, 24))
      for (const r of [0.014, 0.028]) parts.push(P.torus(r, 0.004, '#FFF4E3', { at: [x, h, z + 0.008] }))
    }
  } else if (key === 'icecream') {
    for (const [x, z, h, c] of [
      [-0.03, 0, 0.1, '#FFB7D7'],
      [0.033, -0.025, 0.14, '#C5BAF0'],
    ] as const) {
      parts.push(
        P.cone(0.032, h, '#EDC18B', { at: [x, h / 2, z] }, 12),
        P.sphere(0.041, c, { at: [x, h, z], scale: [1, 0.85, 1] }, 14),
        P.sphere(0.026, '#FFF5E8', { at: [x, h + 0.033, z] }, 12),
        P.sphere(0.008, '#ED5B7C', { at: [x, h + 0.06, z] }, 8),
      )
    }
  } else {
    parts.push(
      P.rbox(0.1, 0.11, 0.065, 0.014, '#93634D', { at: [0, 0.055, 0] }),
      P.sphere(0.063, '#FFF0CD', { at: [0, 0.11, 0], scale: [1, 0.23, 0.65] }, 14),
      P.rbox(0.037, 0.1, 0.012, 0.008, '#BA8060', { at: [0, 0.06, 0.04] }),
    )
    for (const x of [-0.033, 0.033]) for (const y of [0.025, 0.063, 0.1]) parts.push(P.rbox(0.023, 0.026, 0.009, 0.003, '#784C40', { at: [x, y, 0.035] }))
  }
  // Keep the chocolate cliff below the sightline to the trail behind it. Bake the height
  // into its geometry so its tap animation can still use an unscaled root.
  if (key === 'chocolate') for (const part of parts) part.scale(1, 0.62, 1)
  return toy((parts), bag, 0.85)
}

/** The same picture on a special card and its destination tile: no reading needed. */
export function landmarkPicture(g: CanvasRenderingContext2D, key: Landmark) {
  g.lineWidth = 5
  g.strokeStyle = '#79536B'
  const ellipse = (x: number, y: number, rx: number, ry: number, c: string) => {
    g.fillStyle = c
    g.beginPath()
    g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
    g.fill()
    g.stroke()
  }
  if (key === 'gumdrop') {
    ellipse(-31, 10, 27, 34, '#AB86E9')
    ellipse(12, -10, 34, 45, '#72D598')
    ellipse(39, 22, 23, 29, '#FF87B4')
  } else if (key === 'lollipop') {
    g.fillStyle = '#FFF4DE'
    g.fillRect(-6, 0, 12, 66)
    ellipse(0, -18, 46, 46, '#F779B3')
    g.strokeStyle = '#FFF5DC'
    g.lineWidth = 8
    g.beginPath()
    for (let i = 0; i < 100; i++) {
      const a = i * 0.14,
        r = i * 0.38
      const x = Math.cos(a) * r,
        y = -18 + Math.sin(a) * r
      if (i === 0) g.moveTo(x, y)
      else g.lineTo(x, y)
    }
    g.stroke()
  } else if (key === 'icecream') {
    g.fillStyle = '#E8B773'
    g.beginPath()
    g.moveTo(-34, 0)
    g.lineTo(0, 66)
    g.lineTo(34, 0)
    g.closePath()
    g.fill()
    g.stroke()
    ellipse(0, -12, 43, 32, '#FFB8D6')
    ellipse(0, -43, 29, 24, '#FFF4DC')
    ellipse(0, -66, 9, 9, '#ED5B7C')
  } else {
    g.fillStyle = '#98634C'
    g.beginPath()
    g.roundRect(-49, -52, 98, 106, 14)
    g.fill()
    g.stroke()
    for (const x of [-33, 8])
      for (const y of [-37, -1, 35]) {
        g.fillStyle = '#C18C6B'
        g.fillRect(x, y, 26, 23)
      }
    ellipse(0, -50, 49, 13, '#FFF0D0')
  }
}

/** Draws a candy shape centered at (x, y), about `r` across. */
export function candyShape(g: CanvasRenderingContext2D, shape: (typeof CANDY_SHAPE)[CandyColor], x: number, y: number, r: number) {
  g.beginPath()
  if (shape === 'heart') {
    g.moveTo(x, y + r * 0.8)
    g.bezierCurveTo(x - r * 1.3, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35)
    g.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.3, y - r * 0.1, x, y + r * 0.8)
  } else if (shape === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i / 10) * Math.PI * 2
      const rr = i % 2 ? r * 0.45 : r
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
    }
  } else if (shape === 'drop') {
    g.moveTo(x, y - r)
    g.bezierCurveTo(x + r * 0.9, y - r * 0.1, x + r * 0.8, y + r, x, y + r)
    g.bezierCurveTo(x - r * 0.8, y + r, x - r * 0.9, y - r * 0.1, x, y - r)
  } else if (shape === 'leaf') {
    g.ellipse(x, y, r * 0.55, r, Math.PI / 4, 0, Math.PI * 2)
  } else if (shape === 'moon') {
    g.arc(x, y, r, Math.PI * 0.35, Math.PI * 1.65, false)
    g.arc(x + r * 0.45, y, r * 0.75, Math.PI * 1.55, Math.PI * 0.45, true)
  } else {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      g.moveTo(x + Math.cos(a) * r * 0.55 + r * 0.42, y + Math.sin(a) * r * 0.55)
      g.arc(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, 0, Math.PI * 2)
    }
  }
  g.closePath()
}
