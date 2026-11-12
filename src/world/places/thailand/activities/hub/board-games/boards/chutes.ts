// A terraced toy playground. Every landing, ladder rung and slide surface shares the pawn's real 3D path.
import {
  BufferGeometry,
  Float32BufferAttribute,
  CanvasTexture,
  CatmullRomCurve3,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RingGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { bake, P } from '../../../../../../engine3d/geo'
import { shadows, toy } from '../look'
import { PAL } from '../../../../../../engine3d/toon'
import { bell } from '../../../../../../../sdk'
import { CHUTES, CHUTES_END, LADDERS, SIDE, square } from '../rules/chutes'
import type { Who } from '../rules/turns'

const CELL = 0.14
const ROW = 0.132
const RISE = 0.042
const BASE = 0.035
const FRONT = 0.27
const PAD = 0.049
const COLORS = ['#F6C6DA', '#C3E9DA', '#C8DFF7', '#E2CEF6', '#FBE1AF', '#C7E8E5']
const START = new Vector3(-0.35, BASE, 0.365)

export function chutesSpace(n: number): Vector3 {
  if (n <= 0) return START.clone()
  const { row, col } = square(n)
  return new Vector3((col - (SIDE - 1) / 2) * CELL, BASE + row * RISE, FRONT - row * ROW)
}

/** A real sloping chute, with a slow lip at its top and a gently flattening run-out. */
function slideCurve(from: number) {
  const a = chutesSpace(from),
    b = chutesSpace(CHUTES[from])
  const side = new Vector3(-(b.z - a.z), 0, b.x - a.x).normalize()
  const bend = from === 35 ? -0.025 : 0.026
  const at = (t: number, drop: number, bulge: number) => {
    const p = a.clone().lerp(b, t).addScaledVector(side, bulge)
    p.y = a.y + (b.y - a.y) * drop + Math.sin(t * Math.PI) * 0.04
    return p
  }
  return new CatmullRomCurve3([a, at(0.18, 0.08, bend * 0.6), at(0.55, 0.55, bend), at(0.84, 0.94, bend * 0.5), b], false, 'centripetal')
}

/** Lift the equipment clear of the balcony it crosses; the ends still meet their numbered pads. */
function ladderCurve(from: number, to: number) {
  const a = chutesSpace(from),
    b = chutesSpace(to)
  return new CatmullRomCurve3(
    [
      a,
      a
        .clone()
        .lerp(b, 0.16)
        .add(new Vector3(0, 0.024, 0)),
      a
        .clone()
        .lerp(b, 0.84)
        .add(new Vector3(0, 0.024, 0)),
      b,
    ],
    false,
    'centripetal',
  )
}

function tube(points: Vector3[], radius: number, color: string) {
  return bake(new TubeGeometry(new CatmullRomCurve3(points), Math.max(8, points.length * 2), radius, 8, false), color)
}

/** The slide is an open channel, not a pipe: floor beneath the pawn and two curved raised edges. */
function chuteParts(from: number): BufferGeometry[] {
  const curve = slideCurve(from),
    points = curve.getPoints(36)
  const vertices: number[] = [],
    sides: [Vector3[], Vector3[]] = [[], []]
  const width = 0.026
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      tangent = curve.getTangent(i / (points.length - 1))
    const side = new Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width)
    sides[0].push(p.clone().add(side))
    sides[1].push(p.clone().sub(side))
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = sides[0][i],
      b = sides[1][i],
      c = sides[0][i + 1],
      d = sides[1][i + 1]
    // Upward-facing floor, offset below the exact path the pawn follows.
    for (const v of [a, c, b, b, c, d]) vertices.push(v.x, v.y - 0.001, v.z)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  g.computeVertexNormals()
  const pink = from === 33 ? '#AA8BE8' : '#F477AF'
  const parts = [bake(g, from === 33 ? '#D9C7FF' : '#FFBBD9')]
  for (const edge of sides)
    parts.push(
      tube(
        edge.map((p) => p.clone().add(new Vector3(0, 0.011, 0))),
        0.007,
        pink,
      ),
    )
  // A lip across each end, and a pair of entry posts, clearly showing where the ride starts.
  const a = points[0]
  parts.push(P.cyl(0.004, 0.004, 0.035, pink, { at: [a.x - 0.035, a.y + 0.017, a.z] }, 8), P.cyl(0.004, 0.004, 0.035, pink, { at: [a.x + 0.035, a.y + 0.017, a.z] }, 8))
  return parts
}

export class ChutesBoard {
  readonly root = new Group()
  private star: Group
  private starT = -1
  private rings: Mesh[]
  private highlighted = false
  private pokeTime = -1

  constructor(bag: Bag) {
    const terrain: BufferGeometry[] = [P.rbox(0.91, 0.035, 0.9, 0.025, '#C9BBEE', { at: [0, -0.012, -0.055] })]
    for (let row = 0; row < SIDE; row++) {
      const z = FRONT - row * ROW,
        y = BASE + row * RISE
      // Each balcony has a deep colored fascia, cream trim, and a rubber play surface.
      terrain.push(P.rbox(0.88, y - 0.013, ROW + 0.005, 0.009, COLORS[row], { at: [0, (y - 0.013) / 2, z] }))
      terrain.push(P.rbox(0.89, 0.012, ROW + 0.007, 0.006, '#FFFAE8', { at: [0, y - 0.021, z] }))
      terrain.push(P.rbox(0.87, 0.012, ROW - 0.005, 0.005, COLORS[row], { at: [0, y - 0.016, z] }))
      // The six numbered pads form one continuous snake; the little end steps show the row changes.
      for (let col = 0; col < SIDE; col++) {
        const x = (col - 2.5) * CELL
        terrain.push(P.cyl(PAD, PAD, 0.009, '#FFF9E8', { at: [x, y - 0.0045, z] }, 24))
      }
      if (row < 5) {
        const x = row % 2 === 0 ? 0.35 : -0.35
        for (let step = 1; step <= 3; step++) terrain.push(P.rbox(0.056, 0.01, 0.025, 0.004, '#FFF9E8', { at: [x, y + (step * RISE) / 4 - 0.005, z - (ROW * step) / 4] }))
      }
      // Short safety rails at the balcony ends; they sit outside the playable pads.
      for (const x of [-0.425, 0.425]) {
        for (const dz of [-0.044, 0.044]) terrain.push(P.cyl(0.004, 0.004, 0.038, '#7BACC2', { at: [x, y + 0.019, z + dz] }, 8))
        terrain.push(P.box(0.008, 0.008, 0.105, '#FFF5D9', { at: [x, y + 0.038, z] }))
      }
      const texture = bag.add(new CanvasTexture(paintRow(row)))
      texture.colorSpace = SRGBColorSpace
      texture.anisotropy = 4
      const top = new Mesh(bag.add(new PlaneGeometry(0.84, ROW - 0.006)), bag.add(new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })))
      top.rotation.x = -Math.PI / 2
      top.position.set(0, y + 0.001, z)
      this.root.add(top)
    }
    terrain.push(P.cyl(0.044, 0.046, 0.02, '#FFF8DF', { at: [START.x, BASE - 0.01, START.z] }, 24))
    this.root.add(toy((terrain), bag, 0.7))
    // Golden ladder rails follow a genuine upward slope, with rungs above the terraces.
    for (const [from, to] of Object.entries(LADDERS)) {
      const curve = ladderCurve(+from, to),
        points = curve.getPoints(16),
        parts: BufferGeometry[] = []
      for (const side of [-1, 1])
        parts.push(
          tube(
            points.map((p) => p.clone().add(new Vector3(side * 0.025, -0.002, 0))),
            0.005,
            '#E8A936',
          ),
        )
      const count = Math.round(curve.getLength() / 0.025)
      for (let i = 1; i < count; i++) {
        const p = curve.getPointAt(i / count)
        parts.push(P.cyl(0.004, 0.004, 0.053, '#FFE398', { at: [p.x, p.y - 0.004, p.z], rot: [0, 0, Math.PI / 2] }, 8))
      }
      const ladder = toy((parts), bag, 0.9)
      ladder.userData.pick = `trip:table:chutes:ladder:${from}`
      this.root.add(ladder)
    }
    for (const from of Object.keys(CHUTES)) {
      const slide = toy((chuteParts(+from)), bag, 0.8)
      slide.userData.pick = `trip:table:chutes:slide:${from}`
      this.root.add(slide)
    }
    // The playground's shade on the grass.
    this.root.add(shadows(bag, [-0.2, 0.2].flatMap((x) => [-0.27, 0.15].map((z) => [x, z - 0.03, 0.37, 0.09] as [number, number, number, number]))))
    this.star = buildLookout(bag)
    const finish = chutesSpace(CHUTES_END)
    this.star.position.set(finish.x, finish.y, finish.z - 0.055)
    this.star.userData.pick = 'trip:table:castle'
    this.root.add(this.star)
    this.rings = [0, 1].map(() => {
      const ring = new Mesh(bag.add(new RingGeometry(0.049, 0.057, 32)), bag.add(new MeshBasicMaterial({ color: '#FFF48D', transparent: true, depthWrite: false })))
      ring.rotation.x = -Math.PI / 2
      ring.visible = false
      this.root.add(ring)
      return ring
    })
  }

  spot(i: number, who: Who, sharing: boolean) {
    const p = chutesSpace(i)
    if (sharing) p.x += who === 0 ? -0.021 : 0.021
    return p
  }
  gate() {
    return this.spot(CHUTES_END, 0, false)
  }
  castleTop() {
    return this.star.position.clone().add(new Vector3(0, 0.12, 0))
  }
  ladderPath(from: number, to: number) {
    return ladderCurve(from, to).getPoints(16)
  }
  slidePath(from: number) {
    return slideCurve(from).getPoints(36)
  }
  highlight(from: number, to: number) {
    this.highlighted = true
    this.pokeTime = -1
    this.rings.forEach((r, i) => {
      r.position.copy(chutesSpace(i ? to : from))
      r.position.y += 0.003
      r.visible = true
    })
  }
  poke(id: string) {
    const n = Number(id.split(':').at(-1)),
      target = LADDERS[n] ?? CHUTES[n]
    if (target === undefined || this.highlighted) return
    this.highlight(n, target)
    this.pokeTime = 0
  }
  markSpace(i: number | null) {
    if (i === null) {
      this.highlighted = false
      this.pokeTime = -1
      this.rings.forEach((r) => (r.visible = false))
    }
  }
  cheer() {
    this.starT = 0
  }
  get busy() {
    return this.starT >= 0 || this.highlighted
  }
  update(dt: number, t: number) {
    if (this.highlighted) this.rings.forEach((r, i) => r.scale.setScalar(1 + Math.sin(t * 8 + i) * 0.08))
    if (this.pokeTime >= 0) {
      this.pokeTime += dt
      if (this.pokeTime > 1) this.markSpace(null)
    }
    if (this.starT < 0) return
    this.starT += dt
    const p = Math.min(1, this.starT)
    this.star.rotation.y = Math.sin(p * Math.PI * 4) * bell(p) * 0.25
    this.star.scale.setScalar(1 + bell(p) * 0.25)
    if (this.starT >= 1) {
      this.star.rotation.y = 0
      this.star.scale.setScalar(1)
      this.starT = -1
    }
  }
}

function buildLookout(bag: Bag) {
  const parts: BufferGeometry[] = []
  for (const x of [-0.047, 0.047]) {
    parts.push(P.cyl(0.005, 0.005, 0.085, '#71A9C4', { at: [x, 0.0425, 0] }, 8), P.sphere(0.009, '#FFF1BE', { at: [x, 0.085, 0] }, 10))
  }
  parts.push(P.rbox(0.115, 0.035, 0.024, 0.009, '#C7A5EC', { at: [0, 0.087, 0] }))
  const star: [number, number][] = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5,
      r = i % 2 ? 0.015 : 0.033
    return [Math.sin(a) * r, 0.118 + Math.cos(a) * r]
  })
  parts.push(P.prism(star, 0.012, PAL.gold))
  return toy((parts), bag, 1)
}

function paintRow(row: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 180
  const g = canvas.getContext('2d')!,
    scale = canvas.width / 0.84
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  for (let col = 0; col < SIDE; col++) {
    const n = row * SIDE + (row % 2 ? SIDE - col : col + 1),
      x = (col + 0.5) * 200
    const ladder = LADDERS[n] !== undefined,
      slide = CHUTES[n] !== undefined
    g.strokeStyle = ladder ? '#269E7B' : slide ? '#D95691' : '#B6A8BD'
    g.lineWidth = ladder || slide ? 9 : 3
    g.beginPath()
    g.arc(x, 90, PAD * scale * 0.91, 0, Math.PI * 2)
    g.stroke()
    // Numerals stay at the front edge, clear of rails and the travelling pieces.
    g.fillStyle = '#544565'
    g.font = 'bold 34px "Arial Rounded MT Bold", Arial, sans-serif'
    // The purple chute crosses the right side of 27; put its number in the clear left corner.
    g.fillText(String(n), x + (n === 27 ? -60 : 76), 138)
    if (ladder || slide) {
      g.fillStyle = ladder ? '#269E7B' : '#D95691'
      g.beginPath()
      g.moveTo(x - 17, ladder ? 65 : 85)
      g.lineTo(x, ladder ? 44 : 106)
      g.lineTo(x + 17, ladder ? 65 : 85)
      g.closePath()
      g.fill()
    }
    // Small direction chevrons between pads make the serpentine route visible without reading.
    if (col < SIDE - 1) {
      const d = row % 2 ? -1 : 1,
        xx = x + 100
      g.strokeStyle = '#FFFFFF'
      g.lineWidth = 7
      g.lineCap = 'round'
      g.beginPath()
      g.moveTo(xx - d * 7, 77)
      g.lineTo(xx + d * 7, 90)
      g.lineTo(xx - d * 7, 103)
      g.stroke()
    }
  }
  return canvas
}
