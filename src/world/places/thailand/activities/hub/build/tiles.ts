// The terrazzo floors at Agong's, from Dad's photos (~/refs, 2026-10-18). Downstairs: warm golden terrazzo crossed by
// sage-green terrazzo bands with a thin dark edge, in a grid like the old shophouse floor. Upstairs: pale grey terrazzo
// in big square tiles with dark seams. Each is one tile drawn on a canvas (chips and all) and repeated; the toon
// material still gives it the house's light bands. Seeded, so screenshots are the same every time.
import { CanvasTexture, Mesh, MeshToonMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace } from 'three'
import { toonGradient } from '../../../engine/toon'
import type { Kit } from './kit'

interface Chips {
  /** Chip colors, the first ones most common. */
  colors: string[]
  /** Chips per square meter, and their size range in meters. */
  perM2: number
  size: [number, number]
}

interface Floor {
  /** One repeat of the pattern as drawn, meters. */
  w: number
  d: number
  /** How much bigger it's laid on the floor than drawn (chips and all). */
  scale: number
  /** Canvas pixels per meter. */
  ppm: number
  base: string
  chips: Chips
  /** Extra drawing on top of the chips (bands, seams), in canvas pixels. */
  over?: (g: CanvasRenderingContext2D, W: number, H: number, ppm: number, rand: () => number) => void
}

function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Broken-stone chips: small irregular polygons, wrapped at the edges so the tile repeats without a seam. */
function scatter(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, ppm: number, chips: Chips, rand: () => number, wrap?: [number, number]) {
  const n = Math.round((w * h * chips.perM2) / (ppm * ppm))
  for (let i = 0; i < n; i++) {
    // Most chips small, a few big ones.
    const r = ((chips.size[0] + (chips.size[1] - chips.size[0]) * rand() ** 2.2) * ppm) / 2
    const x = x0 + rand() * w
    const y = y0 + rand() * h
    const pick = rand() ** 1.6
    g.fillStyle = chips.colors[Math.floor(pick * chips.colors.length)]
    const sides = 3 + Math.floor(rand() * 4)
    const turn = rand() * Math.PI * 2
    const pts = Array.from({ length: sides }, (_, k) => {
      const a = turn + (k / sides) * Math.PI * 2 + (rand() - 0.5) * 0.9
      const rr = r * (0.55 + rand() * 0.6)
      return [Math.cos(a) * rr, Math.sin(a) * rr * (0.6 + rand() * 0.5)]
    })
    const offsets = wrap ? [-1, 0, 1].flatMap((ox) => [-1, 0, 1].map((oy) => [ox * wrap[0], oy * wrap[1]])) : [[0, 0]]
    for (const [ox, oy] of offsets) {
      const cx = x + ox
      const cy = y + oy
      if (wrap && (cx < -r * 2 || cy < -r * 2 || cx > wrap[0] + r * 2 || cy > wrap[1] + r * 2)) continue
      g.beginPath()
      pts.forEach(([px, py], k) => (k ? g.lineTo(cx + px, cy + py) : g.moveTo(cx + px, cy + py)))
      g.closePath()
      g.fill()
    }
  }
}

function draw(f: Floor) {
  const W = Math.round(f.w * f.ppm)
  const H = Math.round(f.d * f.ppm)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const rand = seeded(W * 31 + H)
  g.fillStyle = f.base
  g.fillRect(0, 0, W, H)
  scatter(g, 0, 0, W, H, f.ppm, f.chips, rand, [W, H])
  f.over?.(g, W, H, f.ppm, rand)
  return c
}

/** Downstairs: one panel of golden terrazzo with a green band through its middle each way (the bands meet the walls).
 *  Laid a third bigger than drawn (Dad, 2026-10-19), so three panels span the house and the bands still meet the walls. */
const SHOP: Floor = {
  w: 1.5625,
  d: 1.5625,
  scale: 4 / 3,
  ppm: 512,
  base: '#E9D19C',
  chips: { colors: ['#F6E8C6', '#D6B677', '#C19A5E', '#FBF3DF', '#A07A4E', '#7E6347', '#B7AE9E', '#5B4A3C', '#B8794E'], perM2: 9000, size: [0.005, 0.03] },
  over(g, W, H, ppm, rand) {
    const band = 0.1 * ppm
    const edge = Math.max(2, 0.009 * ppm)
    const green: Chips = { colors: ['#B9CDB0', '#7E9C82', '#D6E2CC', '#668570', '#9DB596', '#E8EEDF'], perM2: 9000, size: [0.004, 0.022] }
    // Lengthwise, then across: dark edge, green terrazzo inside.
    for (const [x, y, w, h] of [
      [W / 2 - band / 2, 0, band, H],
      [0, H / 2 - band / 2, W, band],
    ]) {
      g.fillStyle = '#5E6A55'
      g.fillRect(x, y, w, h)
      g.fillStyle = '#A3BC9A'
      const inX = w === band ? edge : 0
      const inY = h === band ? edge : 0
      g.fillRect(x + inX, y + inY, w - 2 * inX, h - 2 * inY)
      g.save()
      g.beginPath()
      g.rect(x + inX, y + inY, w - 2 * inX, h - 2 * inY)
      g.clip()
      scatter(g, x, y, w, h, ppm, green, rand)
      g.restore()
    }
    // Where they cross, the green runs through (no dark line across the crossing).
    g.fillStyle = '#A3BC9A'
    g.fillRect(W / 2 - band / 2 + edge, H / 2 - band / 2 + edge, band - 2 * edge, band - 2 * edge)
    g.save()
    g.beginPath()
    g.rect(W / 2 - band / 2 + edge, H / 2 - band / 2 + edge, band - 2 * edge, band - 2 * edge)
    g.clip()
    scatter(g, W / 2 - band / 2, H / 2 - band / 2, band, band, ppm, green, rand)
    g.restore()
  },
}

/** Upstairs: two by two big tiles of pale grey terrazzo, with thin dark seams between them (laid 50% bigger than
 *  drawn, Dad 2026-10-19: 0.9 m tiles). */
const UPSTAIRS: Floor = {
  w: 1.2,
  d: 1.2,
  scale: 1.5,
  ppm: 512,
  base: '#E7E5E1',
  chips: { colors: ['#B9BCC2', '#8F949C', '#F7F6F3', '#D3D4D6', '#5D626B', '#3F434B', '#A39684', '#C9C2B5'], perM2: 9500, size: [0.005, 0.026] },
  over(g, W, H, ppm) {
    const seam = Math.max(2, 0.006 * ppm)
    g.fillStyle = '#4E4A48'
    for (const x of [0, W / 2]) g.fillRect(x - seam / 2, 0, seam, H)
    for (const y of [0, H / 2]) g.fillRect(0, y - seam / 2, W, seam)
    // The half-seams at x = 0 and y = 0 wrap round to the far edges.
    g.fillRect(W - seam / 2, 0, seam / 2, H)
    g.fillRect(0, H - seam / 2, W, seam / 2)
  },
}

function floorMesh(kit: Kit, f: Floor, w: number, d: number, x: number, z: number, y: number, offset: [number, number] = [0, 0]) {
  const tex = kit.bag.add(new CanvasTexture(draw(f)))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(w / (f.w * f.scale), d / (f.d * f.scale))
  tex.offset.set(...offset)
  tex.anisotropy = 8
  const mat = kit.bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  const mesh = new Mesh(kit.bag.add(new PlaneGeometry(w, d)), mat)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(x, y, z)
  return mesh
}

/** The shop floor, w by d meters, centered at (x, z). The bands line up with the side walls and the house front. */
export function shopFloor(kit: Kit, w: number, d: number, x: number, z: number, y = 0.002) {
  return floorMesh(kit, SHOP, w, d, x, z, y, [0.5, 0.5])
}

/** Upstairs terrazzo tiles, one mesh per rectangle [x0, x1, z0, z1] of floor, all lined up on the same grid. */
export function upstairsFloor(kit: Kit, rects: [number, number, number, number][], y: number) {
  return rects.map(([x0, x1, z0, z1]) => {
    const w = x1 - x0
    const d = z1 - z0
    // Offsets so every piece's tiles sit on one grid from (0, 0).
    return floorMesh(kit, UPSTAIRS, w, d, (x0 + x1) / 2, (z0 + z1) / 2, y, [frac(x0 / (UPSTAIRS.w * UPSTAIRS.scale)), frac(-z1 / (UPSTAIRS.d * UPSTAIRS.scale))])
  })
}

const frac = (v: number) => v - Math.floor(v)
