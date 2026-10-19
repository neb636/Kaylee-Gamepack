// Flat pictures drawn in code onto canvases (the 3D scenes use them as textures): the paper elephant map in Kaylee's
// room, the plane's seat-back screen, and the airport's x-ray screen. All from the real outline (outline.ts), never
// generated. No three.js here: just the 2D canvas.
import { flat, FLAT_SIZE, PHUKET, PLACES, THAILAND, type LonLat } from './outline'

const INK = '#2B2330'

/** Where a place sits on a map drawn into a w × h box (`fit` = share of the box the country may fill). */
function projector(w: number, h: number, fit = 0.9) {
  const s = Math.min((w * fit) / FLAT_SIZE.w, (h * fit) / FLAT_SIZE.h)
  return (ll: LonLat): [number, number] => {
    const [x, y] = flat(ll)
    return [w / 2 + x * s, h / 2 - y * s]
  }
}

/** The elephant map's paper, as a share of its size: where a place is (u right, v down, 0..1). */
export function mapUV(ll: LonLat): [number, number] {
  const [x, y] = projector(1, MAP_ASPECT_H, MAP_FIT)(ll)
  return [x, y / MAP_ASPECT_H]
}
/** The paper map is this much taller than wide; the country fills this share of it. */
export const MAP_ASPECT_H = 1.42
const MAP_FIT = 0.86

function trace(ctx: CanvasRenderingContext2D, at: (ll: LonLat) => [number, number], ring: LonLat[], wobble = 0) {
  ctx.beginPath()
  ring.forEach((ll, i) => {
    const [x, y] = at(ll)
    const j = wobble ? Math.sin(i * 12.9898) * wobble : 0
    if (i === 0) ctx.moveTo(x + j, y - j)
    else ctx.lineTo(x + j, y - j)
  })
  ctx.closePath()
}

/** A crayon line: a few passes, each a little off, a little see-through. */
function crayon(ctx: CanvasRenderingContext2D, color: string, width: number, path: (k: number) => void) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.lineCap = ctx.lineJoin = 'round'
  for (let k = 0; k < 3; k++) {
    ctx.globalAlpha = 0.55
    ctx.lineWidth = width * (1 - k * 0.18)
    path(k)
    ctx.stroke()
  }
  ctx.restore()
}

/** The paper map of Thailand taped on her wall: the real outline, sea round it, and Kaylee's crayon doodles that make it
 *  an elephant (an eye in the north, a big ear round the northeast). The pins are 3D, on top of it. */
export function drawElephantMap(canvas: HTMLCanvasElement) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')!
  const at = projector(w, h, MAP_FIT)
  // Paper, and a pale sea.
  ctx.fillStyle = '#FFF6E4'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#CFEBFF'
  roundRect(ctx, w * 0.05, h * 0.035, w * 0.9, h * 0.93, w * 0.04)
  ctx.fill()
  // The land, with a thick ink edge.
  ctx.fillStyle = '#B9E6A8'
  trace(ctx, at, THAILAND)
  ctx.fill()
  trace(ctx, at, PHUKET)
  ctx.fill()
  ctx.strokeStyle = INK
  ctx.lineJoin = 'round'
  ctx.lineWidth = w * 0.012
  trace(ctx, at, THAILAND)
  ctx.stroke()
  trace(ctx, at, PHUKET)
  ctx.stroke()
  // Kaylee's crayon: the ear round the northeast bulge, the eye in the north, and the trunk's curl at the bottom.
  const ear: LonLat[] = [[101.9, 17.4], [103.4, 17.75], [104.45, 16.9], [104.85, 15.6], [104.2, 14.75], [102.9, 14.6], [102.05, 15.4], [101.8, 16.5]]
  crayon(ctx, '#FF5FA2', w * 0.016, (k) => {
    // Through the midpoints, so the loop is round like a crayon line.
    const j = (k - 1) * w * 0.004
    const pts = ear.map((ll) => at(ll)).map(([x, y]) => [x + j, y + j] as const)
    const mid = (a: readonly number[], b: readonly number[]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    ctx.beginPath()
    const start = mid(pts[pts.length - 1], pts[0])
    ctx.moveTo(start[0], start[1])
    pts.forEach((p, i) => {
      const m = mid(p, pts[(i + 1) % pts.length])
      ctx.quadraticCurveTo(p[0], p[1], m[0], m[1])
    })
    ctx.closePath()
  })
  const [ex, ey] = at([99.7, 17.55])
  ctx.fillStyle = INK
  ctx.beginPath()
  ctx.arc(ex, ey, w * 0.032, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.arc(ex + w * 0.01, ey - w * 0.012, w * 0.011, 0, Math.PI * 2)
  ctx.fill()
  crayon(ctx, INK, w * 0.01, (k) => {
    ctx.beginPath()
    ctx.arc(ex, ey, w * 0.05 + k, Math.PI * 1.1, Math.PI * 1.9)
  })
  // A dotted trip from Bangkok to the bay.
  ctx.save()
  ctx.setLineDash([w * 0.02, w * 0.02])
  ctx.strokeStyle = '#FF4F9A'
  ctx.lineWidth = w * 0.01
  ctx.lineCap = 'round'
  const [bx, by] = at(PLACES.bangkok)
  const [px, py] = at(PLACES.phangNga)
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.quadraticCurveTo(bx - w * 0.22, (by + py) / 2, px, py)
  ctx.stroke()
  ctx.restore()
  // Tape at the corners.
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  for (const [x, y, r] of [[0.02, 0.01, -0.5], [0.86, 0.01, 0.5], [0.02, 0.95, 0.5], [0.86, 0.95, -0.5]]) {
    ctx.save()
    ctx.translate(x * w + w * 0.06, y * h + h * 0.02)
    ctx.rotate(r)
    ctx.fillRect(-w * 0.07, -h * 0.012, w * 0.14, h * 0.024)
    ctx.restore()
  }
}

/** The plane's seat-back screen: the map with the little plane flying the route (`p` 0..1, Bangkok to Krabi on the
 *  boat trip: down the elephant's trunk), or cartoons (a bouncing pink ball and a winking sun). */
export function drawSeatback(canvas: HTMLCanvasElement, p: number, mode: 'map' | 'cartoon', t: number, from: LonLat = PLACES.bangkok, to: LonLat = PLACES.krabi) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1F2A55'
  ctx.fillRect(0, 0, w, h)
  if (mode === 'cartoon') {
    ctx.fillStyle = '#8FE3C8'
    ctx.fillRect(0, h * 0.72, w, h * 0.28)
    const bx = w * (0.15 + 0.7 * ((Math.sin(t * 1.3) + 1) / 2))
    const by = h * 0.62 - Math.abs(Math.sin(t * 4)) * h * 0.4
    ctx.fillStyle = '#FF8FB8'
    ctx.beginPath()
    ctx.arc(bx, by, h * 0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#FBEA9A'
    ctx.beginPath()
    ctx.arc(w * 0.82, h * 0.2, h * 0.12, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  const at = projector(w, h, 0.92)
  ctx.fillStyle = '#2E4A8C'
  ctx.fillRect(w * 0.04, h * 0.04, w * 0.92, h * 0.92)
  ctx.fillStyle = '#8FE3C8'
  trace(ctx, at, THAILAND)
  ctx.fill()
  trace(ctx, at, PHUKET)
  ctx.fill()
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = Math.max(2, w * 0.008)
  trace(ctx, at, THAILAND)
  ctx.stroke()
  const [bx, by] = at(from)
  const [kx, ky] = at(to)
  ctx.save()
  ctx.setLineDash([w * 0.02, w * 0.018])
  ctx.strokeStyle = '#FBEA9A'
  ctx.lineWidth = Math.max(2, w * 0.012)
  ctx.beginPath()
  ctx.moveTo(bx, by)
  ctx.lineTo(kx, ky)
  ctx.stroke()
  ctx.restore()
  for (const [x, y] of [[bx, by], [kx, ky]]) {
    ctx.fillStyle = '#FF4F9A'
    ctx.beginPath()
    ctx.arc(x, y, w * 0.022, 0, Math.PI * 2)
    ctx.fill()
  }
  // The little plane, pointing along the route.
  const x = bx + (kx - bx) * p
  const y = by + (ky - by) * p
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(Math.atan2(ky - by, kx - bx))
  ctx.fillStyle = '#FFFFFF'
  const s = w * 0.05
  ctx.beginPath()
  ctx.moveTo(s, 0)
  ctx.lineTo(-s * 0.7, -s * 0.25)
  ctx.lineTo(-s * 0.7, s * 0.25)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(-s * 0.2, -s * 0.8, s * 0.35, s * 1.6)
  ctx.restore()
}

/** The x-ray screen: everything in the suitcase as glowing blue toy outlines, `shown` of them so far (they appear
 *  one by one as it slides through). The fan spins and Gan snores. */
export function drawXray(canvas: HTMLCanvasElement, items: string[], shown: number, t: number) {
  const w = canvas.width
  const h = canvas.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#10183A'
  ctx.fillRect(0, 0, w, h)
  ctx.save()
  ctx.strokeStyle = '#7FE9FF'
  ctx.shadowColor = '#7FE9FF'
  ctx.shadowBlur = w * 0.02
  ctx.lineWidth = Math.max(2, w * 0.008)
  ctx.lineJoin = ctx.lineCap = 'round'
  // The suitcase's own outline, then its things in a grid inside it.
  ctx.globalAlpha = 0.5
  roundRect(ctx, w * 0.06, h * 0.1, w * 0.88, h * 0.8, w * 0.04)
  ctx.stroke()
  ctx.globalAlpha = 1
  const cols = items.length > 8 ? 5 : 4
  const rows = Math.max(1, Math.ceil(items.length / cols))
  const cw = (w * 0.8) / cols
  const ch = (h * 0.7) / Math.max(2, rows)
  items.slice(0, shown).forEach((id, i) => {
    const cx = w * 0.1 + cw * ((i % cols) + 0.5)
    const cy = h * 0.15 + ch * (Math.floor(i / cols) + 0.5)
    ctx.save()
    ctx.translate(cx, cy)
    const s = Math.min(cw, ch) * 0.36
    outline(ctx, id, s, t)
    ctx.restore()
  })
  ctx.restore()
}

/** One packed thing as a simple outline, `s` = its half size. */
function outline(ctx: CanvasRenderingContext2D, id: string, s: number, t: number) {
  const circle = (x: number, y: number, r: number) => {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }
  const poly = (pts: [number, number][]) => {
    ctx.beginPath()
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * s, y * s) : ctx.moveTo(x * s, y * s)))
    ctx.closePath()
    ctx.stroke()
  }
  switch (id) {
    case 'sunhat':
      ctx.beginPath()
      ctx.ellipse(0, s * 0.3, s, s * 0.3, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(0, s * 0.2, s * 0.5, Math.PI, 0)
      ctx.stroke()
      break
    case 'sunglasses':
      circle(-s * 0.45, 0, s * 0.38)
      circle(s * 0.45, 0, s * 0.38)
      ctx.beginPath()
      ctx.moveTo(-s * 0.1, -s * 0.05)
      ctx.lineTo(s * 0.1, -s * 0.05)
      ctx.stroke()
      break
    case 'sunscreen':
      roundRect(ctx, -s * 0.3, -s * 0.5, s * 0.6, s * 1.3, s * 0.15)
      ctx.stroke()
      ctx.strokeRect(-s * 0.15, -s * 0.8, s * 0.3, s * 0.3)
      break
    case 'floaties':
      circle(-s * 0.45, 0, s * 0.42)
      circle(-s * 0.45, 0, s * 0.18)
      circle(s * 0.45, 0, s * 0.42)
      circle(s * 0.45, 0, s * 0.18)
      break
    case 'swimsuit':
      poly([[-0.5, -0.9], [-0.25, -0.9], [0, -0.4], [0.25, -0.9], [0.5, -0.9], [0.45, 0.1], [0.6, 0.8], [0, 0.5], [-0.6, 0.8], [-0.45, 0.1]])
      break
    case 'duck':
      circle(0, s * 0.25, s * 0.55)
      circle(s * 0.4, -s * 0.4, s * 0.32)
      poly([[0.7, -0.45], [1.0, -0.35], [0.7, -0.25]])
      break
    case 'teddy':
      circle(0, -s * 0.35, s * 0.4)
      circle(-s * 0.35, -s * 0.72, s * 0.16)
      circle(s * 0.35, -s * 0.72, s * 0.16)
      circle(0, s * 0.45, s * 0.48)
      break
    case 'bucket':
      poly([[-0.6, -0.4], [0.6, -0.4], [0.45, 0.8], [-0.45, 0.8]])
      ctx.beginPath()
      ctx.arc(0, -s * 0.4, s * 0.6, Math.PI, 0)
      ctx.stroke()
      break
    case 'camera':
      roundRect(ctx, -s * 0.8, -s * 0.45, s * 1.6, s * 1.0, s * 0.15)
      ctx.stroke()
      circle(0, s * 0.05, s * 0.32)
      ctx.strokeRect(-s * 0.6, -s * 0.65, s * 0.4, s * 0.2)
      break
    case 'pillow':
      roundRect(ctx, -s * 0.9, -s * 0.45, s * 1.8, s * 0.9, s * 0.35)
      ctx.stroke()
      break
    case 'fan': {
      circle(0, -s * 0.15, s * 0.6)
      for (let i = 0; i < 3; i++) {
        const a = t * 9 + (i * Math.PI * 2) / 3
        ctx.beginPath()
        ctx.ellipse(Math.cos(a) * s * 0.3, -s * 0.15 + Math.sin(a) * s * 0.3, s * 0.26, s * 0.12, a, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.moveTo(0, s * 0.45)
      ctx.lineTo(0, s * 0.85)
      ctx.moveTo(-s * 0.4, s * 0.88)
      ctx.lineTo(s * 0.4, s * 0.88)
      ctx.stroke()
      break
    }
    case 'mango':
      ctx.beginPath()
      ctx.ellipse(0, s * 0.1, s * 0.75, s * 0.5, -0.4, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.ellipse(s * 0.3, -s * 0.55, s * 0.3, s * 0.12, -0.6, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'gan': {
      // A sleeping fox: ears, a round head, closed eyes, and Zs floating up.
      poly([[-0.75, -0.2], [-0.55, -0.95], [-0.15, -0.5], [0.15, -0.5], [0.55, -0.95], [0.75, -0.2], [0.5, 0.45], [0, 0.65], [-0.5, 0.45]])
      for (const x of [-0.3, 0.3]) {
        ctx.beginPath()
        ctx.arc(x * s, -s * 0.05, s * 0.14, 0.1 * Math.PI, 0.9 * Math.PI)
        ctx.stroke()
      }
      ctx.font = `bold ${Math.round(s * 0.6)}px Fredoka, sans-serif`
      ctx.fillStyle = '#7FE9FF'
      const z = (t * 0.8) % 1
      ctx.globalAlpha = 1 - z
      ctx.fillText('z', s * 0.7, -s * (0.6 + z * 0.8))
      ctx.globalAlpha = 1
      break
    }
    default:
      circle(0, 0, s * 0.6)
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
