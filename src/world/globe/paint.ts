// The home globe's painted pictures, all drawn in code: the land's colors (green grass with hand-painted dabs, sandy
// deserts and beaches, frosty tops and rivers), the sea (shallow bands round every coast and the flat map's little white waves),
// the real flags (drawn from the SVG <Flag>, never generated art), and the soft sprites (glow, sparkle).
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { Flag, type FlagId } from '../kit/Flag'
import { DESERTS, GROUND, LANDMASSES, OCEAN, RIVERS, smoothOutline, type Pt } from './continents'
import { rng } from './land'

const W = 2048
const H = 1024
const px = ([lon, lat]: Pt): [number, number] => [((lon + 180) / 360) * W, ((90 - lat) / 180) * H]

function canvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return { c, g: c.getContext('2d')! }
}

function texture(c: HTMLCanvasElement) {
  const t = new CanvasTexture(c)
  t.colorSpace = SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** An outline as a canvas path. One that goes round a pole crosses the map's edge: it's broken there instead of
 *  drawn back across the whole picture (those rows are painted whole anyway). */
function path(g: CanvasRenderingContext2D, pts: Pt[], close = true) {
  g.beginPath()
  let broken = false
  pts.forEach((p, i) => {
    const jump = i > 0 && Math.abs(p[0] - pts[i - 1][0]) > 180
    if (jump) broken = true
    if (i && !jump) g.lineTo(...px(p))
    else g.moveTo(...px(p))
  })
  if (close && !broken && Math.abs(pts[0][0] - pts[pts.length - 1][0]) < 180) g.closePath()
}

/** Mixes a hex color toward white (k > 0) or toward a soft plum (k < 0). */
function tint(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16)
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  const to = k > 0 ? [255, 255, 255] : [120, 80, 140]
  const a = Math.abs(k)
  return `rgb(${c.map((v, i) => Math.round(v + (to[i] - v) * a)).join(',')})`
}

/** An ellipse in lon/lat degrees as a canvas path (stretched across the map the way the map stretches near the poles). */
function blob(g: CanvasRenderingContext2D, lon: number, lat: number, rx: number, ry: number, turn = 0) {
  const [x, y] = px([lon, lat])
  g.beginPath()
  g.ellipse(x, y, (rx / 360) * W, (ry / 180) * H, (-turn * Math.PI) / 180, 0, Math.PI * 2)
}

/** The land's colors, read by every landmass's top (and its shore) through its lon/lat: green grass with lighter and
 *  darker dabs, sandy deserts, a sandy beach round every coast, frosty tops in the far north, rivers. */
export function landTexture() {
  const { c, g } = canvas(W, H)
  const random = rng(7)
  g.lineJoin = 'round'
  for (const m of LANDMASSES) {
    const pts = smoothOutline(m.outline, 2)
    // The fill, and a stroke a little past the coast so the slab's edge (and its shore) never samples the empty canvas:
    // sand for the beach, white for ice.
    path(g, pts)
    g.fillStyle = m.ice ? GROUND.ice : GROUND.grass
    g.strokeStyle = m.ice ? GROUND.ice : GROUND.sand
    g.lineWidth = 12
    g.stroke()
    g.fill()
  }
  for (const m of LANDMASSES) {
    if (m.ice) continue
    const pts = smoothOutline(m.outline, 2)
    g.save()
    path(g, pts)
    g.clip()
    // Hand-painted dabs, so a continent isn't one flat sheet: light ones like sunny hilltops, a few darker ones.
    const xs = pts.map((p) => px(p)[0])
    const ys = pts.map((p) => px(p)[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const n = Math.round(((x1 - x0) * (y1 - y0)) / 2200)
    for (let i = 0; i < n; i++) {
      const x = x0 + random() * (x1 - x0)
      const y = y0 + random() * (y1 - y0)
      const light = random() < 0.62
      g.globalAlpha = light ? 0.55 : 0.32
      g.fillStyle = light ? GROUND.grassLight : GROUND.grassDark
      g.beginPath()
      g.ellipse(x, y, 8 + random() * 20, 5 + random() * 11, random() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 1
    // Deserts: overlapping patches of sand that read as one, with a few lighter dunes in them.
    g.fillStyle = GROUND.sand
    for (const [lon, lat, rx, ry, turn] of DESERTS) {
      blob(g, lon, lat, rx, ry, turn)
      g.fill()
    }
    g.fillStyle = GROUND.sandLight
    g.globalAlpha = 0.7
    for (const [lon, lat, rx, ry] of DESERTS) {
      for (let i = 0; i < 3; i++) {
        blob(g, lon + (random() - 0.5) * rx, lat + (random() - 0.5) * ry, 1.6 + random() * 1.6, 0.8 + random() * 0.7, random() * 40 - 20)
        g.fill()
      }
    }
    g.globalAlpha = 1
    // The beach: a sandy band just inside the coast, with a lighter wet-sand line at the water.
    path(g, pts)
    g.lineWidth = 9
    g.strokeStyle = GROUND.sand
    g.stroke()
    path(g, pts)
    g.lineWidth = 3
    g.strokeStyle = GROUND.sandLight
    g.stroke()
    g.restore()
  }
  // Frosty tops in the far north.
  const frost = g.createLinearGradient(0, px([0, 74])[1], 0, px([0, 66])[1])
  frost.addColorStop(0, 'rgba(255,255,255,0.95)')
  frost.addColorStop(1, 'rgba(255,255,255,0)')
  g.globalCompositeOperation = 'source-atop'
  g.fillStyle = frost
  g.fillRect(0, 0, W, px([0, 66])[1])
  g.globalCompositeOperation = 'source-over'
  // Rivers.
  for (const r of RIVERS) {
    path(g, r, false)
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = GROUND.sandLight
    g.lineWidth = 10
    g.stroke()
    g.strokeStyle = OCEAN
    g.lineWidth = 5.5
    g.stroke()
  }
  // The ice rows are white all the way across (a triangle across the date line samples both edges).
  g.fillStyle = GROUND.ice
  g.fillRect(0, px([0, -62])[1], W, H)
  g.fillRect(0, 0, W, px([0, 79])[1])
  return texture(c)
}

/** The sea: turquoise, lighter bands round every coast (the shallows), and a few little white waves. */
export function oceanTexture() {
  const { c, g } = canvas(W, H)
  g.fillStyle = OCEAN
  g.fillRect(0, 0, W, H)
  const random = rng(11)
  // Waves first, so the shallow bands cover the ones near land.
  g.strokeStyle = 'rgba(255,255,255,0.55)'
  g.lineCap = 'round'
  g.lineWidth = 3
  for (let i = 0; i < 110; i++) {
    const lat = (random() * 2 - 1) * 64
    const lon = random() * 360 - 180
    const [x, y] = px([lon, lat])
    const stretch = 1 / Math.cos((lat * Math.PI) / 180)
    const w = (8 + random() * 5) * stretch
    g.beginPath()
    g.moveTo(x - w, y)
    g.quadraticCurveTo(x - w / 2, y + 5, x, y)
    g.quadraticCurveTo(x + w / 2, y + 5, x + w, y)
    g.stroke()
  }
  const bands: [number, string][] = [
    [52, tint(OCEAN, 0.16)],
    [30, tint(OCEAN, 0.32)],
    [12, tint(OCEAN, 0.55)],
  ]
  g.lineJoin = 'round'
  for (const [width, color] of bands) {
    g.strokeStyle = color
    g.fillStyle = color
    g.lineWidth = width
    for (const m of LANDMASSES) {
      path(g, smoothOutline(m.outline, 2))
      g.stroke()
      g.fill()
    }
  }
  return texture(c)
}

/** A real flag (kit/Flag's SVG) drawn into a texture; it fills in once the picture has loaded. */
export function flagTexture(id: FlagId) {
  const { c, g } = canvas(256, 128)
  g.fillStyle = '#FFFFFF'
  g.fillRect(0, 0, 256, 128)
  const tex = texture(c)
  // Rendered off screen by React (it lands on a later tick: the globe is built inside an effect), then drawn as a picture.
  const host = document.createElement('div')
  const root = createRoot(host)
  root.render(createElement(Flag, { id, width: 256 }))
  let tries = 0
  const grab = () => {
    const svg = host.querySelector('svg')
    if (!svg) {
      if (++tries < 30) requestAnimationFrame(grab)
      else root.unmount()
      return
    }
    svg.removeAttribute('style')
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    svg.setAttribute('width', '256')
    svg.setAttribute('height', '128')
    const img = new Image()
    img.onload = () => {
      g.drawImage(img, 0, 0, 256, 128)
      tex.needsUpdate = true
    }
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`
    root.unmount()
  }
  requestAnimationFrame(grab)
  return tex
}

/** A soft round glow, white in the middle: the globe's halo and the sun-kissed haze behind it. */
export function glowTexture(inner: string, outer: string) {
  const { c, g } = canvas(256, 256)
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grad.addColorStop(0, inner)
  grad.addColorStop(0.5, inner)
  grad.addColorStop(0.72, outer)
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 256, 256)
  return new CanvasTexture(c)
}

/** A four-point twinkle. */
export function sparkleTexture() {
  const { c, g } = canvas(64, 64)
  const glow = g.createRadialGradient(32, 32, 0, 32, 32, 30)
  glow.addColorStop(0, 'rgba(255,255,255,0.9)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, 64, 64)
  g.beginPath()
  for (let i = 0; i < 8; i++) {
    const r = i % 2 ? 5 : 30
    const a = (Math.PI * i) / 4 - Math.PI / 2
    g.lineTo(32 + r * Math.cos(a), 32 + r * Math.sin(a))
  }
  g.closePath()
  g.fillStyle = '#FFFFFF'
  g.fill()
  return new CanvasTexture(c)
}
