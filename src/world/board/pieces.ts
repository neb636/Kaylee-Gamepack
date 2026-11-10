// Her countries: each one cut out in its real shape (land.ts) and standing up out of the board like a slice of cake,
// with an ink line round it, a two-layer cliff and a painted top (Canada's forests going to snow, Egypt's sand with the
// green Nile, Australia's red middle). A piece is still; world.ts bounces it when she picks it.
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, Group, Mesh, MeshToonMaterial, Shape, ShapeGeometry, SRGBColorSpace, Vector2 } from 'three'
import type { Bag } from '../engine3d/dispose'
import { makeHull } from '../engine3d/outline'
import { toon, toonGradient } from '../engine3d/toon'
import type { Field } from './field'
import { LEVEL, type Piece, type XZ } from './geo'
import type { LonLat, LookId } from './places'
import { curve } from './terrain'

/** Painted pixels per unit on a piece's top (the biggest pieces get fewer, so no picture is huge). */
const PX = 150
const MAX = 1800

interface Look {
  /** The cliff: its top layer and its bottom layer. */
  cliff: [string, string]
  /** The pale band just inside the edge. */
  rim: string
  base: string
  paint?: (k: Painter) => void
}

/** What a look paints with: the canvas, and where a real spot (lon, lat) is on it. */
interface Painter {
  g: CanvasRenderingContext2D
  at: (p: LonLat) => [number, number]
  /** Pixels in one unit of the board. */
  u: number
  w: number
  h: number
  rnd: () => number
}

const blots = ({ g, w, h, u, rnd }: Painter, color: string, n: number, size = 0.5) => {
  g.fillStyle = color
  for (let i = 0; i < n; i++) {
    g.beginPath()
    g.ellipse(rnd() * w, rnd() * h, u * size * (0.5 + rnd()), u * size * (0.3 + rnd() * 0.5), rnd() * 3, 0, Math.PI * 2)
    g.fill()
  }
}
/** A soft-edged area through real spots. */
const area = ({ g, at }: Painter, color: string, pts: LonLat[]) => {
  curve(g, [...pts, pts[0], pts[1]].map(at))
  g.fillStyle = color
  g.fill()
}
const river = ({ g, at, u }: Painter, pts: LonLat[], wide = 0.07) => {
  curve(g, pts.map(at))
  g.strokeStyle = '#F2FBFF'
  g.lineWidth = u * (wide + 0.04)
  g.stroke()
  g.strokeStyle = '#8FD6F2'
  g.lineWidth = u * wide
  g.stroke()
}

const EARTH: [string, string] = ['#F6CFA4', '#E8B088']

const LOOKS: Record<LookId, Look> = {
  // Canada: pine forest, paler tundra further north, snow at the top; the Rockies down the west.
  north: {
    cliff: EARTH,
    rim: '#E9F7C8',
    base: '#9EDDA6',
    paint: (k) => {
      blots(k, '#8CD39B', 60, 0.7)
      area(k, '#83C99A', [[-135, 61], [-126, 56], [-119, 51.5], [-114, 49], [-117, 48.8], [-124, 52], [-131, 56.5], [-139, 60]])
      area(k, '#C9EDCB', [[-142, 68], [-120, 65.5], [-100, 61.5], [-92, 58], [-80, 58.5], [-74, 57], [-62, 57.5], [-58, 62], [-60, 72], [-100, 74], [-142, 72]])
      area(k, '#F6FBFF', [[-142, 71], [-125, 69.5], [-108, 67.6], [-96, 66.5], [-84, 65], [-72, 61.5], [-62, 60.5], [-55, 66], [-58, 86], [-142, 86]])
      blots(k, 'rgba(255,255,255,0.5)', 14, 0.35)
    },
  },
  // Italy: green hills, the snowy Alps across the top.
  meadow: {
    cliff: EARTH,
    rim: '#F1F6C4',
    base: '#A9E2A0',
    paint: (k) => {
      blots(k, '#98D892', 18, 0.22)
      area(k, '#DDF3D8', [[6.6, 45.6], [8.5, 46.2], [11, 46.6], [13.6, 46.4], [13.4, 47.3], [9, 47.6], [6.4, 46.6]])
      area(k, '#C6E89A', [[11.5, 43.6], [13, 42.6], [15, 41.2], [16.2, 40.2], [15.4, 40.6], [13.6, 42], [12, 43.2]])
    },
  },
  // Egypt: golden sand, with the Nile a ribbon of green down to its fan at the sea.
  desert: {
    cliff: ['#F3C98F', '#E2A870'],
    rim: '#FFF3CC',
    base: '#FBE2A0',
    paint: (k) => {
      blots(k, '#F6D68C', 16, 0.3)
      const nile: LonLat[] = [[32.9, 22], [32.7, 24.2], [32.6, 25.8], [31.6, 26.6], [30.9, 28], [31.2, 29.9]]
      curve(k.g, nile.map(k.at))
      k.g.strokeStyle = '#A6DE98'
      k.g.lineWidth = k.u * 0.2
      k.g.stroke()
      area(k, '#A6DE98', [[31.2, 29.8], [30.2, 31.2], [31, 31.7], [32, 31.4], [31.4, 30.2]])
      river(k, nile, 0.05)
      river(k, [[31.2, 29.9], [30.6, 31.3]], 0.035)
      river(k, [[31.2, 29.9], [31.7, 31.4]], 0.035)
    },
  },
  // China: green in the east, the high dry plateau and the deserts in the west, the two great rivers.
  china: {
    cliff: EARTH,
    rim: '#EAF7C6',
    base: '#A7E0A2',
    paint: (k) => {
      blots(k, '#97D795', 40, 0.5)
      area(k, '#F3E3B4', [[74, 40], [80, 44.5], [88, 48], [96, 43.5], [104, 42.5], [112, 44], [108, 39.5], [100, 38.5], [92, 39.5], [82, 37.5], [75, 38]])
      area(k, '#E9D6B0', [[78, 35.5], [85, 37], [94, 37.6], [101, 36.4], [102, 31], [98, 27.6], [91, 27.4], [84, 29.4], [79, 31.6]])
      blots(k, 'rgba(255,255,255,0.35)', 10, 0.3)
      river(k, [[96, 35], [101, 36.2], [104.5, 37.2], [108.5, 40.6], [111, 39.6], [110.4, 35], [114.5, 34.9], [118.6, 37.6]], 0.055)
      river(k, [[95, 33.6], [99, 28.6], [103.5, 28.4], [106.6, 29.6], [111, 30.4], [115, 29.8], [118.5, 31.6], [121.6, 31.4]], 0.06)
    },
  },
  // Thailand: lush green, darker hills in the north and west.
  jungle: {
    cliff: EARTH,
    rim: '#EAF7B8',
    base: '#92DDA4',
    paint: (k) => {
      blots(k, '#84D29A', 14, 0.2)
      area(k, '#77C690', [[98, 19.6], [100.4, 20], [101.2, 18.6], [99.8, 17.2], [98.8, 15.4], [98.6, 13.6], [98, 15.4], [97.8, 17.8]])
      area(k, '#C4EC9C', [[102, 17.2], [104.4, 17], [105, 15.2], [103.4, 14.6], [102, 15.4]])
      river(k, [[99.6, 17.8], [100.1, 15.8], [100.5, 14.2], [100.6, 13.5]], 0.04)
    },
  },
  // Peru: sand along the sea, the brown Andes behind it, the green Amazon in the east.
  andes: {
    cliff: EARTH,
    rim: '#FFF0C4',
    base: '#8FD9A0',
    paint: (k) => {
      blots(k, '#80CE95', 14, 0.25)
      area(k, '#E6CBA2', [[-79.6, -4.4], [-77.6, -5.6], [-75.6, -9.6], [-73.2, -12.6], [-70.2, -14.4], [-68.9, -16.4], [-70.4, -18.6], [-73, -16.8], [-76.6, -14], [-79, -8.6], [-81.4, -5]])
      area(k, '#F8E6B6', [[-81.4, -4.4], [-79.9, -7], [-77.6, -11.4], [-75.9, -14.6], [-71.2, -17.9], [-70.2, -18.6], [-76.4, -15.2], [-79.6, -9], [-81.6, -5.8]])
      blots(k, 'rgba(255,255,255,0.4)', 6, 0.16)
      river(k, [[-76.4, -10], [-75.4, -7.6], [-73.6, -4.6], [-70.2, -3.9]], 0.04)
    },
  },
  // Australia: the red middle, green along the east and the north, a little in the south-west corner.
  outback: {
    cliff: ['#F3B587', '#DE9466'],
    rim: '#FFE9BE',
    base: '#F9B783',
    paint: (k) => {
      blots(k, '#F4A470', 34, 0.6)
      blots(k, '#FCC795', 14, 0.4)
      area(k, '#F29A68', [[122, -22], [130, -20.5], [137, -22.5], [139, -27], [133, -30], [125, -28.6]])
      area(k, '#A9E09C', [[142.4, -10.6], [146.4, -18.4], [150.6, -22.6], [153.8, -27.6], [151.6, -33.6], [149.6, -37.8], [144.6, -39], [140.6, -38.4], [143.6, -35.4], [148, -32], [149.4, -27.6], [146.4, -23.4], [143.4, -18.8], [141.6, -13.6]])
      area(k, '#B9E6A0', [[129.4, -14.8], [132.6, -11], [136.6, -11.8], [136.4, -14.6], [132.6, -15.6]])
      area(k, '#B9E6A0', [[114.8, -33.9], [116.4, -31], [119.4, -33.6], [118, -35.2], [115.4, -34.8]])
      area(k, '#A9E09C', [[144.6, -40.4], [148.6, -40.6], [148.2, -43.8], [145.6, -43.6]])
    },
  },
  // Antarctica: white ice with soft blue shadows.
  ice: {
    cliff: ['#D7ECFF', '#AED3F5'],
    rim: '#E4F2FF',
    base: '#FBFDFF',
    paint: (k) => {
      blots(k, '#EEF6FF', 40, 0.9)
      blots(k, '#E2EFFD', 12, 0.4)
    },
  },
}

/** A little seeded random, so a piece is painted the same every time. */
function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

const signedArea = (r: XZ[]) => r.reduce((sum, [x, z], i) => sum + x * r[(i + 1) % r.length][1] - r[(i + 1) % r.length][0] * z, 0) / 2

/** One of her countries, standing on the board. The group's origin is the piece's middle, on the low land. */
export function buildPiece(p: Piece, index: number, field: Field, bag: Bag): Group {
  const look = LOOKS[p.look]
  const [cx, cz] = p.center
  const top = LEVEL.piece - LEVEL.land
  const x0 = -p.half[0]
  const z0 = -p.half[1]
  const bw = p.half[0] * 2
  const bd = p.half[1] * 2
  const local = p.rings.map((r) => r.map(([x, z]): XZ => [x - cx, z - cz]))

  // ---- The top: each ring filled flat, mapped to the piece's own picture.
  const tops: BufferGeometry[] = []
  for (const r of local) {
    const shape = new Shape(r.map(([x, z]) => new Vector2(x, -z)))
    const geo = new ShapeGeometry(shape)
    const pos = geo.attributes.position
    const uv = new Float32Array(pos.count * 2)
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const z = -pos.getY(i)
      pos.setXYZ(i, x, top, z)
      uv.set([(x - x0) / bw, 1 - (z - z0) / bd], i * 2)
    }
    geo.setAttribute('uv', new BufferAttribute(uv, 2))
    geo.computeVertexNormals()
    tops.push(geo)
  }
  const topGeo = bag.add(mergeSimple(tops))
  const u = Math.min(PX, MAX / Math.max(bw, bd))
  const tex = bag.add(new CanvasTexture(paintTop(p, look, local, field, u, index)))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const topMesh = new Mesh(topGeo, bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() })))

  // ---- The cliff: a wall round every ring, in two layers like cake. It goes down into the land (and the sea).
  const band = top * 0.42
  const foot = LEVEL.floor - LEVEL.land + 0.05
  const wallPos: number[] = []
  const wallCol: number[] = []
  const [hi, lo] = look.cliff.map((c) => new Color(c).toArray())
  for (const r of local) {
    // (So every wall faces out, whichever way the ring was drawn.)
    const ring = signedArea(r) > 0 ? r : [...r].reverse()
    for (let i = 0; i < ring.length; i++) {
      const [ax, az] = ring[i]
      const [bx, bz] = ring[(i + 1) % ring.length]
      for (const [y1, y0, col] of [[top, top - band, hi], [top - band, foot, lo]] as const) {
        wallPos.push(ax, y1, az, bx, y1, bz, ax, y0, az, bx, y1, bz, bx, y0, bz, ax, y0, az)
        for (let k = 0; k < 6; k++) wallCol.push(...col)
      }
    }
  }
  const wallGeo = bag.add(new BufferGeometry())
  wallGeo.setAttribute('position', new BufferAttribute(new Float32Array(wallPos), 3))
  wallGeo.setAttribute('color', new BufferAttribute(new Float32Array(wallCol), 3))
  wallGeo.computeVertexNormals()
  const walls = new Mesh(wallGeo, toon('#ffffff', true))

  // ---- The ink line round it.
  const all = new BufferGeometry()
  const tp = topGeo.attributes.position.array as Float32Array
  const both = new Float32Array(tp.length + wallPos.length)
  both.set(tp)
  both.set(wallPos, tp.length)
  all.setAttribute('position', new BufferAttribute(both, 3))
  const hull = makeHull(all, 2)
  all.dispose()
  bag.add(hull.geometry)

  const g = new Group()
  g.add(topMesh, walls, hull)
  g.position.set(cx, LEVEL.land, cz)
  g.userData.piece = index
  return g
}

/** Geometries with position, normal and uv joined into one (no index). */
function mergeSimple(list: BufferGeometry[]) {
  const flat = list.map((g) => {
    const n = g.index ? g.toNonIndexed() : g
    if (n !== g) g.dispose()
    return n
  })
  const count = flat.reduce((n, g) => n + g.attributes.position.count, 0)
  const pos = new Float32Array(count * 3)
  const nor = new Float32Array(count * 3)
  const uv = new Float32Array(count * 2)
  let o = 0
  for (const g of flat) {
    pos.set(g.attributes.position.array as Float32Array, o * 3)
    nor.set(g.attributes.normal.array as Float32Array, o * 3)
    uv.set(g.attributes.uv.array as Float32Array, o * 2)
    o += g.attributes.position.count
    g.dispose()
  }
  const out = new BufferGeometry()
  out.setAttribute('position', new BufferAttribute(pos, 3))
  out.setAttribute('normal', new BufferAttribute(nor, 3))
  out.setAttribute('uv', new BufferAttribute(uv, 2))
  return out
}

function paintTop(p: Piece, look: Look, local: XZ[][], field: Field, u: number, index: number) {
  const w = Math.max(8, Math.round(p.half[0] * 2 * u))
  const h = Math.max(8, Math.round(p.half[1] * 2 * u))
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const px = ([x, z]: XZ): [number, number] => [(x + p.half[0]) * u, (z + p.half[1]) * u]
  const outline = () => {
    g.beginPath()
    for (const r of local) {
      r.forEach((q, i) => (i ? g.lineTo(...px(q)) : g.moveTo(...px(q))))
      g.closePath()
    }
  }
  g.lineCap = g.lineJoin = 'round'
  // (Painted a little past the edge too, so the top's very rim never shows a bare pixel.)
  g.fillStyle = look.base
  g.fillRect(0, 0, w, h)
  g.save()
  outline()
  g.lineWidth = 6
  g.strokeStyle = look.base
  g.stroke()
  g.clip()
  const [cx, cz] = p.center
  look.paint?.({ g, u, w, h, rnd: rng(7 + index * 13), at: (q) => px(sub(p.spot(q), cx, cz)) })
  // The big lakes (a country drawn at life size: they sit where they should).
  if ((p.grow ?? 1) === 1) {
    for (const lake of field.lakes) {
      if (!lake.some(([x, z]) => Math.abs(x - cx) < p.half[0] && Math.abs(z - cz) < p.half[1])) continue
      g.beginPath()
      lake.forEach((q, i) => (i ? g.lineTo(...px(sub(q, cx, cz))) : g.moveTo(...px(sub(q, cx, cz)))))
      g.closePath()
      g.strokeStyle = '#F2FBFF'
      g.lineWidth = u * 0.05
      g.stroke()
      g.fillStyle = '#9EDDF2'
      g.fill()
    }
  }
  // The pale band just inside the edge, like a beach all the way round.
  outline()
  g.strokeStyle = look.rim
  g.lineWidth = u * 0.11
  g.stroke()
  g.restore()
  return c
}

const sub = ([x, z]: XZ, cx: number, cz: number): XZ => [x - cx, z - cz]
