// The three tracks' pictures on the race ground's board (ground3d.ts): painted in code on a canvas, flat colors with a
// plum ink line like the rest of the toy look, each one a little postcard of its track she can tell apart without
// reading (the old ones were a few 3D blobs, and nobody could tell what the middle one was, 2026-11-13):
// - 🍄 The Mushroom Forest: a lavender road winding into a pine forest, giant pink spotted mushrooms on it, and her
//   pink kart flying up off one, coins in the air.
// - 🌾 The Rice Steps Rally: green rice terraces stepping up a hill, water shining on each step, the road zig-zagging
//   up them, a waterfall down the side, the sun, and her kart splashing through a puddle.
// - ☁️ The Cloud Top Climb: a mountain going up into a band of cloud, glowing lanterns along the road through it, pink
//   blossom trees on the slopes, and the sunny top poking out over a sea of clouds.
import { CanvasTexture, SRGBColorSpace } from 'three'
import type { TrackId } from './track'

const INK = '#3B2A44'
const S = 512
const ROAD = '#C9B5F7'
const ROAD_EDGE = '#FFFFFF'

type Ctx = CanvasRenderingContext2D

function ink(x: Ctx, w = 6) {
  x.lineWidth = w
  x.strokeStyle = INK
  x.lineJoin = 'round'
  x.lineCap = 'round'
  x.stroke()
}
function fill(x: Ctx, c: string, line = 6) {
  x.fillStyle = c
  x.fill()
  if (line) ink(x, line)
}
function circle(x: Ctx, cx: number, cy: number, r: number, c: string, line = 5) {
  x.beginPath()
  x.arc(cx, cy, r, 0, Math.PI * 2)
  fill(x, c, line)
}
function ellipse(x: Ctx, cx: number, cy: number, rx: number, ry: number, c: string, line = 5) {
  x.beginPath()
  x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  fill(x, c, line)
}
function roundRect(x: Ctx, X: number, Y: number, w: number, h: number, r: number) {
  x.beginPath()
  x.moveTo(X + r, Y)
  x.arcTo(X + w, Y, X + w, Y + h, r)
  x.arcTo(X + w, Y + h, X, Y + h, r)
  x.arcTo(X, Y + h, X, Y, r)
  x.arcTo(X, Y, X + w, Y, r)
  x.closePath()
}

/** A road along a centerline (points bottom to top), `w` wide at the bottom narrowing to `w * far` at the top. */
function road(x: Ctx, pts: [number, number][], w: number, far = 0.25) {
  const n = pts.length
  const left: [number, number][] = []
  const right: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[Math.max(0, i - 1)]
    const [bx, by] = pts[Math.min(n - 1, i + 1)]
    const dx = bx - ax
    const dy = by - ay
    const l = Math.hypot(dx, dy) || 1
    const half = (w * (1 - (1 - far) * (i / (n - 1)))) / 2
    left.push([pts[i][0] - (dy / l) * half, pts[i][1] + (dx / l) * half])
    right.push([pts[i][0] + (dy / l) * half, pts[i][1] - (dx / l) * half])
  }
  const smooth = (p: [number, number][], first: boolean) => {
    if (first) x.moveTo(p[0][0], p[0][1])
    else x.lineTo(p[0][0], p[0][1])
    for (let i = 1; i < p.length - 1; i++) x.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2)
    x.lineTo(p[p.length - 1][0], p[p.length - 1][1])
  }
  x.beginPath()
  smooth(left, true)
  smooth([...right].reverse(), false)
  x.closePath()
  x.fillStyle = ROAD
  x.fill()
  x.lineWidth = 9
  x.strokeStyle = ROAD_EDGE
  x.stroke()
  ink(x, 4)
  // The dashed middle line.
  x.beginPath()
  smooth(pts, true)
  x.setLineDash([16, 18])
  x.lineWidth = 5
  x.strokeStyle = '#FFFFFF'
  x.stroke()
  x.setLineDash([])
}

/** Her pink kart from behind and a little above, with her lilac unicorn head and horn, `k` its size. */
function kart(x: Ctx, cx: number, cy: number, k: number, tilt = 0) {
  x.save()
  x.translate(cx, cy)
  x.rotate(tilt)
  x.scale(k, k)
  // Wheels.
  for (const s of [-1, 1]) {
    roundRect(x, s * 44 - 14, 4, 28, 34, 10)
    fill(x, '#2E2836', 4)
  }
  // The body.
  roundRect(x, -46, -6, 92, 34, 14)
  fill(x, '#FF4F9A', 5)
  roundRect(x, -30, 18, 60, 12, 6)
  fill(x, '#FFFFFF', 3)
  // The seat back and her.
  roundRect(x, -24, -40, 48, 38, 12)
  fill(x, '#B79CF0', 4)
  circle(x, 0, -48, 20, '#E9D7FF', 4)
  // Her mane and horn.
  x.beginPath()
  x.moveTo(-18, -56)
  x.quadraticCurveTo(-6, -74, 12, -64)
  x.quadraticCurveTo(22, -56, 18, -44)
  x.quadraticCurveTo(4, -62, -18, -56)
  fill(x, '#FF8FC8', 3)
  x.beginPath()
  x.moveTo(-4, -64)
  x.lineTo(2, -88)
  x.lineTo(8, -64)
  x.closePath()
  fill(x, '#FFC93C', 3)
  x.restore()
}

function coin(x: Ctx, cx: number, cy: number, r: number) {
  circle(x, cx, cy, r, '#FFC93C', 4)
  ellipse(x, cx - r * 0.25, cy - r * 0.25, r * 0.3, r * 0.4, '#FFF0B0', 0)
}

/** A cloud: a few round puffs on a flat bottom. */
function cloud(x: Ctx, cx: number, cy: number, k: number, c = '#FFFFFF', line = 5) {
  x.beginPath()
  x.moveTo(cx - 70 * k, cy)
  x.arc(cx - 40 * k, cy, 30 * k, Math.PI, Math.PI * 1.75)
  x.arc(cx, cy - 18 * k, 38 * k, Math.PI * 1.1, Math.PI * 1.9)
  x.arc(cx + 42 * k, cy, 30 * k, Math.PI * 1.25, 0)
  x.closePath()
  fill(x, c, line)
}

function forest(x: Ctx) {
  // Sky and the far forest.
  x.fillStyle = '#BFE8F6'
  x.fillRect(0, 0, S, S)
  cloud(x, 380, 70, 0.7)
  x.fillStyle = '#3F8E63'
  x.beginPath()
  x.moveTo(0, 200)
  for (let i = 0; i <= 10; i++) x.quadraticCurveTo(i * 52 - 26, 140 + (i % 2) * 20, i * 52, 190)
  x.lineTo(S, S)
  x.lineTo(0, S)
  x.closePath()
  fill(x, '#4FA373', 5)
  // The grass.
  x.beginPath()
  x.moveTo(0, 250)
  x.quadraticCurveTo(256, 220, S, 250)
  x.lineTo(S, S)
  x.lineTo(0, S)
  x.closePath()
  fill(x, '#7CCB86', 5)
  // Pine trees either side.
  const pine = (cx: number, by: number, h: number) => {
    x.beginPath()
    x.rect(cx - h * 0.06, by - h * 0.15, h * 0.12, h * 0.18)
    fill(x, '#9C653E', 4)
    for (let i = 0; i < 3; i++) {
      const y = by - h * 0.12 - i * h * 0.26
      const w = h * (0.34 - i * 0.07)
      x.beginPath()
      x.moveTo(cx - w, y)
      x.lineTo(cx, y - h * 0.4)
      x.lineTo(cx + w, y)
      x.closePath()
      fill(x, i % 2 ? '#3F8E63' : '#2F7A55', 4)
    }
  }
  pine(60, 330, 200)
  pine(150, 270, 120)
  pine(455, 330, 210)
  pine(370, 265, 115)
  // The road winding in.
  road(x, [[250, 560], [300, 460], [210, 370], [270, 290], [250, 235]], 230, 0.22)
  // A mushroom far up the road, a big one near.
  const mush = (cx: number, cy: number, k: number) => {
    roundRect(x, cx - 22 * k, cy - 10 * k, 44 * k, 44 * k, 12 * k)
    fill(x, '#FFF5E6', 4)
    x.beginPath()
    x.ellipse(cx, cy - 8 * k, 70 * k, 40 * k, 0, Math.PI, 0)
    x.closePath()
    fill(x, '#FF4F9A', 5)
    for (const [dx, dy, r] of [[-36, -16, 11], [0, -34, 12], [34, -16, 11], [-12, -12, 7], [16, -22, 6]] as const) ellipse(x, cx + dx * k, cy + dy * k, r * k * 1.15, r * k * 0.8, '#FFFFFF', 0)
  }
  mush(262, 300, 0.55)
  mush(250, 450, 1.05)
  // Her kart flying up off it, with coins along the arc.
  for (const [cx, cy] of [[300, 330], [330, 290], [352, 250]] as const) coin(x, cx, cy, 13)
  x.beginPath()
  x.moveTo(205, 420)
  x.quadraticCurveTo(220, 380, 238, 370)
  x.moveTo(300, 420)
  x.quadraticCurveTo(286, 382, 268, 370)
  x.lineWidth = 5
  x.strokeStyle = '#FFFFFF'
  x.stroke()
  kart(x, 250, 335, 0.95, -0.08)
}

function steps(x: Ctx) {
  // Sky and the sun.
  x.fillStyle = '#BFE8F6'
  x.fillRect(0, 0, S, S)
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2
    x.beginPath()
    x.moveTo(90 + Math.cos(a) * 52, 86 + Math.sin(a) * 52)
    x.lineTo(90 + Math.cos(a) * 70, 86 + Math.sin(a) * 70)
    x.lineWidth = 8
    x.strokeStyle = '#FFC93C'
    x.stroke()
  }
  circle(x, 90, 86, 40, '#FFD84F', 5)
  cloud(x, 400, 80, 0.6)
  // The terraces: curved steps, each a band of rice with water shining along its top edge.
  const bands = 6
  for (let i = 0; i < bands; i++) {
    const top = 150 + i * 62
    const bend = 26 + i * 6
    x.beginPath()
    x.moveTo(-10, top + bend)
    x.quadraticCurveTo(256, top - bend, S + 10, top + bend)
    x.lineTo(S + 10, S + 10)
    x.lineTo(-10, S + 10)
    x.closePath()
    fill(x, i % 2 ? '#8FD36E' : '#A6E07C', 5)
    // The water on the step: a shiny strip just under the edge.
    x.beginPath()
    x.moveTo(20, top + bend + 10)
    x.quadraticCurveTo(256, top - bend + 10, S - 20, top + bend + 10)
    x.lineWidth = 9
    x.strokeStyle = '#A8E2F5'
    x.stroke()
    // Little rice tufts.
    for (let j = 0; j < 7; j++) {
      const tx = 40 + j * 72 + (i % 2) * 30
      const u = (tx + 10) / (S + 20)
      const ty = top + bend * (1 - 4 * u * (1 - u)) + 44
      x.beginPath()
      x.moveTo(tx - 8, ty)
      x.lineTo(tx - 12, ty - 14)
      x.moveTo(tx, ty)
      x.lineTo(tx, ty - 17)
      x.moveTo(tx + 8, ty)
      x.lineTo(tx + 12, ty - 14)
      x.lineWidth = 4
      x.strokeStyle = '#4E9E4A'
      x.stroke()
    }
  }
  // The waterfall down the left side.
  x.beginPath()
  x.moveTo(26, 170)
  x.quadraticCurveTo(50, 330, 34, S + 10)
  x.lineTo(88, S + 10)
  x.quadraticCurveTo(100, 330, 70, 170)
  x.closePath()
  fill(x, '#9ED9F2', 5)
  for (const dx of [44, 60]) {
    x.beginPath()
    x.moveTo(dx, 200)
    x.quadraticCurveTo(dx + 14, 330, dx + 4, 480)
    x.lineWidth = 4
    x.strokeStyle = '#FFFFFF'
    x.stroke()
  }
  // The road zig-zagging up the steps.
  road(x, [[300, 560], [380, 470], [230, 400], [370, 320], [270, 250], [320, 190]], 190, 0.3)
  // A puddle and her kart splashing through it.
  ellipse(x, 300, 470, 80, 22, '#8FD3F0', 4)
  kart(x, 300, 430, 0.9)
  for (const [dx, dy, r] of [[-82, -26, 10], [-96, -52, 7], [-70, -64, 6], [82, -26, 10], [96, -52, 7], [70, -64, 6]] as const) circle(x, 300 + dx, 470 + dy, r, '#BDE9FA', 3)
}

function cloudTop(x: Ctx) {
  // Sunny sky over a sea of clouds.
  x.fillStyle = '#9FD8F5'
  x.fillRect(0, 0, S, S)
  circle(x, 410, 80, 38, '#FFD84F', 5)
  // The mountain.
  x.beginPath()
  x.moveTo(-10, S + 10)
  x.lineTo(150, 170)
  x.quadraticCurveTo(256, 60, 362, 170)
  x.lineTo(S + 10, S + 10)
  x.closePath()
  fill(x, '#B7A6D6', 6)
  // The lower slopes, green.
  x.beginPath()
  x.moveTo(-10, 360)
  x.quadraticCurveTo(256, 300, S + 10, 360)
  x.lineTo(S + 10, S + 10)
  x.lineTo(-10, S + 10)
  x.closePath()
  fill(x, '#7CCB86', 5)
  // Pink blossom trees on the slopes (Chomphu Phu Kha).
  const blossom = (cx: number, cy: number, k: number) => {
    x.beginPath()
    x.rect(cx - 6 * k, cy, 12 * k, 30 * k)
    fill(x, '#9C653E', 4)
    for (const [dx, dy, r] of [[-20, -4, 22], [20, -4, 22], [0, -22, 26]] as const) circle(x, cx + dx * k, cy + dy * k, r * k, '#FF9CC8', 4)
    for (const [dx, dy] of [[-14, -14], [12, -26], [22, 0]] as const) circle(x, cx + dx * k, cy + dy * k, 4 * k, '#FFFFFF', 0)
  }
  blossom(60, 420, 1.1)
  blossom(450, 410, 1.2)
  // The road up into the cloud.
  road(x, [[256, 560], [330, 450], [200, 360], [300, 270], [240, 200], [262, 140]], 200, 0.2)
  // The band of cloud across the middle, the lanterns glowing through it along the road.
  x.globalAlpha = 0.92
  cloud(x, 110, 270, 1.3, '#FFFFFF', 5)
  cloud(x, 400, 255, 1.4, '#FFFFFF', 5)
  cloud(x, 256, 300, 1.0, '#FFFFFF', 5)
  x.globalAlpha = 1
  const lantern = (cx: number, cy: number, k: number) => {
    circle(x, cx, cy, 26 * k, 'rgba(255,214,110,.45)', 0)
    ellipse(x, cx, cy, 13 * k, 16 * k, '#FF8A3D', 4)
    x.beginPath()
    x.rect(cx - 7 * k, cy - 20 * k, 14 * k, 5 * k)
    x.rect(cx - 7 * k, cy + 15 * k, 14 * k, 5 * k)
    fill(x, '#C2185B', 3)
  }
  lantern(345, 410, 1.1)
  lantern(185, 340, 1)
  lantern(325, 262, 0.85)
  lantern(230, 200, 0.7)
  // The sunny peak out over the clouds: a little sea of clouds at the very top.
  cloud(x, 120, 150, 0.6, '#FFFFFF', 4)
  cloud(x, 390, 160, 0.55, '#FFFFFF', 4)
  // Her kart starting up.
  kart(x, 256, 495, 0.85)
}

const PAINT: Record<TrackId, (x: Ctx) => void> = { forest, steps, cloud: cloudTop }

/** The track's picture as a texture, its corners rounded off (transparent). */
export function trackPicture(t: TrackId): CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = S
  const x = c.getContext('2d')
  if (x) {
    roundRect(x, 4, 4, S - 8, S - 8, 46)
    x.save()
    x.clip()
    PAINT[t](x)
    x.restore()
    roundRect(x, 4, 4, S - 8, S - 8, 46)
    ink(x, 8)
  }
  const tex = new CanvasTexture(c)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
