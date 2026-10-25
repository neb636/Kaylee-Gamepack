// Wat Phumin's murals (greybox): each of the hall's eight panels is a canvas painted in code in our flat style (ink
// outlines, flat fills, blush), on a plane on the wall. Not copies of the real paintings: everyday life in old Nan (boats
// racing on the river, elephants, a stilt house, a market, music, buffalo, kites) and the whispering lovers in Tai Lue
// dress. A panel paints its own darkness: dim lavender where nothing is lit, cut away under the lantern's pool of light
// and round every scene that's awake (and gone altogether when the hall turns gold), so the 3D lights don't touch it.
//
// Sleeping scenes hold still with their eyes shut; awake ones move (people wave, the elephant flaps its ears, the cat
// pops up in the window); dancing ones jig, with notes. Boats and birds are travellers: they live along the walls (the
// panels laid end to end), so a racing boat or a flying bird leaves one panel and turns up in the next.
import { CanvasTexture, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import type { Bag } from '../../../engine/dispose'
import { BAND_H, onPanel, PANEL_W, PANELS, type Panel, type Scene } from './layout'

/** Pixels a meter. */
export const PX = 160
const W = PANEL_W * PX
const H = BAND_H * PX
const INK = '#2B2330'
const LW = 3
const BLUSH = 'rgba(255,120,150,.55)'
const SKIN = ['#F2C9A0', '#E8B48A', '#F6D3B0']

export interface SceneLook {
  awake: boolean
  /** How lit it is now (0..1): a sleeping scene filling with light, 1 when awake. */
  light: number
  /** Seconds awake, seconds of dancing left, seconds since a poke (its big reaction). */
  t: number
  dance: number
  poke: number
}

export interface Traveller {
  kind: 'boat' | 'bird'
  scene: number
  /** Along the walls (meters, round the loop of panels), and up (meters above the band's bottom). */
  s: number
  v: number
  color: string
  rowers: number
  awake: boolean
  /** Flying (birds), racing (boats): 0..1 through it, -1 not. */
  go: number
  dance: number
  phase: number
}

export interface LoversLook {
  box: { u0: number; u1: number; v0: number; v1: number }
  /** asleep (eyes shut), giggle (just found: they bounce), whisper (home: he whispers, she blushes), awake. */
  state: 'asleep' | 'giggle' | 'whisper' | 'awake'
  t: number
  light: number
}

export interface PanelPaint {
  t: number
  /** The lantern's pool on this panel (meters along, up, strength 0..1), if it reaches. */
  pool: { u: number; v: number; k: number } | null
  gold: number
  /** Seconds since the painted Daddy appeared here (-1: not here). */
  daddy: number
  lovers: LoversLook | null
  scenes: { sc: Scene; look: SceneLook }[]
  travellers: Traveller[]
}

const X = (u: number) => u * PX
const Y = (v: number) => (BAND_H - v) * PX

/** One panel: its canvas, the plane on the wall that shows it, and its painting. */
export class MuralPanel {
  readonly mesh: Mesh
  private canvas: HTMLCanvasElement
  private g: CanvasRenderingContext2D
  private tex: CanvasTexture
  private bg: HTMLCanvasElement
  /** Painted at least once (a hidden panel is painted on its first frame, then only while seen). */
  painted = false

  constructor(readonly panel: Panel, bag: Bag) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = W
    this.canvas.height = H
    this.g = this.canvas.getContext('2d')!
    this.tex = bag.add(new CanvasTexture(this.canvas))
    this.tex.colorSpace = SRGBColorSpace
    this.tex.minFilter = LinearFilter
    this.tex.generateMipmaps = false
    this.mesh = new Mesh(bag.add(new PlaneGeometry(PANEL_W, BAND_H)), bag.add(new MeshBasicMaterial({ map: this.tex })))
    const [x, y, z] = onPanel(panel, PANEL_W / 2, BAND_H / 2, 0.025)
    this.mesh.position.set(x, y, z)
    this.mesh.rotation.y = Math.atan2(panel.nx, panel.nz)
    this.mesh.userData.panel = panel.i
    this.bg = paintBackground(panel.i)
  }

  paint(p: PanelPaint) {
    const g = this.g
    g.globalCompositeOperation = 'source-over'
    g.drawImage(this.bg, 0, 0)
    for (const { sc, look } of p.scenes) drawScene(g, sc, look, p.t)
    for (const tr of p.travellers) {
      for (const u of [tr.s - this.panel.i * PANEL_W, tr.s - this.panel.i * PANEL_W + PANEL_W * PANELS.length, tr.s - this.panel.i * PANEL_W - PANEL_W * PANELS.length]) {
        if (u < -0.8 || u > PANEL_W + 0.8) continue
        if (tr.kind === 'boat') boat(g, X(u), Y(tr.v), tr, p.t)
        else bird(g, X(u), Y(tr.v), 0.16 * PX, tr.go >= 0 || tr.dance > 0 ? Math.sin(p.t * 22 + tr.phase) : -0.3, tr.color, tr.go >= 0 ? (Math.cos(tr.go * Math.PI) > 0 ? 1 : -1) : 1, tr.awake)
      }
    }
    if (p.lovers) lovers(g, p.lovers, p.t)
    if (p.daddy >= 0) paintedDaddy(g, X(this.panel.cameo[0]), Y(this.panel.cameo[1] - 0.32), 0.62 * PX, p.daddy, p.t)
    // ---- The dark, cut away where there's light ----
    const dark = scratch()
    const d = dark.getContext('2d')!
    d.globalCompositeOperation = 'source-over'
    d.clearRect(0, 0, W, H)
    d.fillStyle = `rgba(34,24,56,${(0.8 * (1 - p.gold)).toFixed(3)})`
    d.fillRect(0, 0, W, H)
    d.globalCompositeOperation = 'destination-out'
    for (const { sc, look } of p.scenes) if (look.light > 0.01) softOval(d, X((sc.u0 + sc.u1) / 2), Y((sc.v0 + sc.v1) / 2), X((sc.u1 - sc.u0) / 2 + 0.22), ((sc.v1 - sc.v0) / 2 + 0.22) * PX, look.light)
    for (const tr of p.travellers) {
      if (!tr.awake) continue
      const u = ((tr.s - this.panel.i * PANEL_W) % (PANEL_W * PANELS.length) + PANEL_W * PANELS.length) % (PANEL_W * PANELS.length)
      for (const uu of [u, u - PANEL_W * PANELS.length]) if (uu > -0.8 && uu < PANEL_W + 0.8) softOval(d, X(uu), Y(tr.v + 0.12), 0.5 * PX, 0.42 * PX, 1)
    }
    if (p.lovers && p.lovers.light > 0.01) {
      const b = p.lovers.box
      softOval(d, X((b.u0 + b.u1) / 2), Y((b.v0 + b.v1) / 2), X((b.u1 - b.u0) / 2 + 0.2), ((b.v1 - b.v0) / 2 + 0.2) * PX, p.lovers.light)
    }
    if (p.daddy >= 0) softOval(d, X(this.panel.cameo[0]), Y(this.panel.cameo[1]), 0.45 * PX, 0.55 * PX, Math.min(1, p.daddy * 3))
    if (p.pool) softOval(d, X(p.pool.u), Y(p.pool.v), 0.95 * PX, 0.95 * PX, p.pool.k)
    g.drawImage(dark, 0, 0)
    // ---- The lantern's warm glow, and the hall's gold ----
    if (p.pool) {
      g.globalCompositeOperation = 'lighter'
      const r = g.createRadialGradient(X(p.pool.u), Y(p.pool.v), 0, X(p.pool.u), Y(p.pool.v), 0.8 * PX)
      r.addColorStop(0, `rgba(255,190,90,${(0.3 * p.pool.k).toFixed(3)})`)
      r.addColorStop(1, 'rgba(255,190,90,0)')
      g.fillStyle = r
      g.fillRect(0, 0, W, H)
    }
    if (p.gold > 0.01) {
      g.globalCompositeOperation = 'lighter'
      g.fillStyle = `rgba(255,196,90,${(0.14 * p.gold).toFixed(3)})`
      g.fillRect(0, 0, W, H)
    }
    g.globalCompositeOperation = 'source-over'
    this.tex.needsUpdate = true
    this.painted = true
  }
}

let dark: HTMLCanvasElement | null = null
const scratch = () => {
  if (!dark) {
    dark = document.createElement('canvas')
    dark.width = W
    dark.height = H
  }
  return dark
}

/** A soft oval cut out of the dark (its middle `k` clear). */
function softOval(d: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, k: number) {
  d.save()
  d.translate(x, y)
  d.scale(1, ry / rx)
  const r = d.createRadialGradient(0, 0, 0, 0, 0, rx)
  r.addColorStop(0, `rgba(0,0,0,${k.toFixed(3)})`)
  r.addColorStop(0.6, `rgba(0,0,0,${(k * 0.85).toFixed(3)})`)
  r.addColorStop(1, 'rgba(0,0,0,0)')
  d.fillStyle = r
  d.fillRect(-rx, -rx, rx * 2, rx * 2)
  d.restore()
}

// ---------------------------------------------------------------- the painted wall behind the scenes

function rand(seed: number) {
  let s = seed * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

/** The old plaster, a pale sky, far hills, a few clouds, the river along the foot and the red borders. */
function paintBackground(i: number) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const r = rand(i + 3)
  const sky = g.createLinearGradient(0, 0, 0, H)
  sky.addColorStop(0, '#E2E9E2')
  sky.addColorStop(0.55, '#F2E5C6')
  sky.addColorStop(1, '#EAD9B4')
  g.fillStyle = sky
  g.fillRect(0, 0, W, H)
  // Far hills.
  g.lineWidth = 2
  g.strokeStyle = INK
  for (let k = 0; k < 4; k++) {
    const x = (k / 3) * W + (r() - 0.5) * 80
    const w = 120 + r() * 90
    const h = 50 + r() * 50
    g.beginPath()
    g.moveTo(x - w, Y(0.62))
    g.quadraticCurveTo(x, Y(0.62) - h * 2, x + w, Y(0.62))
    g.closePath()
    g.fillStyle = k % 2 ? '#BFD5A8' : '#CCDDB2'
    g.fill()
    g.stroke()
  }
  // Clouds.
  for (let k = 0; k < 2; k++) cloud(g, 60 + r() * (W - 120), 40 + r() * 70, 26 + r() * 10)
  // The meadow and the riverbank.
  g.fillStyle = '#D8E2B0'
  g.fillRect(0, Y(0.62), W, Y(0.3) - Y(0.62))
  // The river along the foot of every panel.
  g.fillStyle = '#9CC9D8'
  g.fillRect(0, Y(0.32), W, Y(0) - Y(0.32))
  g.beginPath()
  g.moveTo(0, Y(0.32))
  g.lineTo(W, Y(0.32))
  g.stroke()
  g.strokeStyle = 'rgba(255,255,255,.75)'
  g.lineWidth = 2.5
  for (let k = 0; k < 14; k++) {
    const x = r() * W
    const y = Y(0.05 + r() * 0.22)
    g.beginPath()
    g.moveTo(x, y)
    g.quadraticCurveTo(x + 9, y - 5, x + 18, y)
    g.quadraticCurveTo(x + 27, y + 5, x + 36, y)
    g.stroke()
  }
  // Grass tufts on the bank.
  g.strokeStyle = '#7FAE6A'
  g.lineWidth = 2
  for (let k = 0; k < 16; k++) {
    const x = r() * W
    const y = Y(0.34 + r() * 0.24)
    g.beginPath()
    g.moveTo(x - 4, y)
    g.lineTo(x, y - 9)
    g.lineTo(x + 4, y)
    g.stroke()
  }
  // The borders: deep red bands with a gold line.
  for (const y of [0, H - 9]) {
    g.fillStyle = '#9E3F38'
    g.fillRect(0, y, W, 9)
  }
  g.fillStyle = '#E8B84A'
  g.fillRect(0, 9, W, 3)
  g.fillRect(0, H - 12, W, 3)
  return c
}

function cloud(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath()
  g.arc(x - r * 0.8, y + r * 0.2, r * 0.6, Math.PI * 0.5, Math.PI * 1.5)
  g.arc(x - r * 0.2, y - r * 0.2, r * 0.7, Math.PI, Math.PI * 1.9)
  g.arc(x + r * 0.6, y + r * 0.05, r * 0.6, Math.PI * 1.3, Math.PI * 0.5)
  g.closePath()
  g.fillStyle = '#FFFFFF'
  g.fill()
  g.lineWidth = 2
  g.strokeStyle = INK
  g.stroke()
}

// ---------------------------------------------------------------- painting kit

function shape(g: CanvasRenderingContext2D, fill: string, path: () => void, lw = LW) {
  g.beginPath()
  path()
  g.fillStyle = fill
  g.fill()
  g.lineWidth = lw
  g.strokeStyle = INK
  g.stroke()
}
function oval(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string, rot = 0, lw = LW) {
  shape(g, fill, () => g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2), lw)
}
/** A limb: a thick colored stroke with an ink edge. */
function limb(g: CanvasRenderingContext2D, pts: [number, number][], w: number, color: string) {
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const [lw, c] of [[w + LW * 1.6, INK], [w, color]] as const) {
    g.beginPath()
    g.moveTo(pts[0][0], pts[0][1])
    for (const [x, y] of pts.slice(1)) g.lineTo(x, y)
    g.lineWidth = lw
    g.strokeStyle = c
    g.stroke()
  }
}
function eyes(g: CanvasRenderingContext2D, x: number, y: number, gap: number, r: number, open: boolean, happy = false) {
  g.lineWidth = 2
  g.strokeStyle = INK
  g.fillStyle = INK
  for (const s of [-1, 1]) {
    g.beginPath()
    if (open && !happy) {
      g.arc(x + s * gap, y, r, 0, Math.PI * 2)
      g.fill()
    } else {
      // Shut: a sleepy line; happy: an upside-down smile.
      if (happy) g.arc(x + s * gap, y + r * 0.6, r * 1.2, Math.PI * 1.15, Math.PI * 1.85)
      else g.arc(x + s * gap, y - r * 0.4, r * 1.2, Math.PI * 0.15, Math.PI * 0.85)
      g.stroke()
    }
  }
}
function blush(g: CanvasRenderingContext2D, x: number, y: number, gap: number, r: number, k = 1) {
  g.fillStyle = k > 1 ? 'rgba(255,90,130,.7)' : BLUSH
  for (const s of [-1, 1]) {
    g.beginPath()
    g.ellipse(x + s * gap, y, r * k, r * 0.6 * k, 0, 0, Math.PI * 2)
    g.fill()
  }
}
function smile(g: CanvasRenderingContext2D, x: number, y: number, r: number, open = false) {
  g.lineWidth = 2
  g.strokeStyle = INK
  g.beginPath()
  if (open) {
    g.ellipse(x, y + r * 0.2, r * 0.55, r * 0.7, 0, 0, Math.PI * 2)
    g.fillStyle = '#C8506A'
    g.fill()
  } else g.arc(x, y - r * 0.3, r, Math.PI * 0.2, Math.PI * 0.8)
  g.stroke()
}
function heart(g: CanvasRenderingContext2D, x: number, y: number, s: number, fill = '#FF6FAE') {
  shape(g, fill, () => {
    g.moveTo(x, y + s * 0.45)
    g.bezierCurveTo(x - s * 1.1, y - s * 0.2, x - s * 0.5, y - s * 0.95, x, y - s * 0.4)
    g.bezierCurveTo(x + s * 0.5, y - s * 0.95, x + s * 1.1, y - s * 0.2, x, y + s * 0.45)
  }, 2)
}
function note(g: CanvasRenderingContext2D, x: number, y: number, s: number) {
  oval(g, x, y, s * 0.42, s * 0.3, INK, -0.4, 1)
  g.lineWidth = 2.5
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(x + s * 0.36, y - s * 0.1)
  g.lineTo(x + s * 0.36, y - s * 1.3)
  g.quadraticCurveTo(x + s * 0.8, y - s * 1.0, x + s * 0.75, y - s * 0.65)
  g.stroke()
}
/** Notes rising (dancing, music). */
function notes(g: CanvasRenderingContext2D, x: number, y: number, t: number, n = 3) {
  for (let k = 0; k < n; k++) {
    const p = (t * 0.6 + k / n) % 1
    g.globalAlpha = Math.sin(p * Math.PI)
    note(g, x + Math.sin(p * 7 + k) * 14 + (k - 1) * 22, y - p * 60, 11)
  }
  g.globalAlpha = 1
}

interface Who {
  skin: string
  top: string
  skirt: string
  stripe?: string
  hair?: string
  /** A woman's bun, a man's topknot. */
  bun?: boolean
  male?: boolean
  hat?: string
}
interface Pose {
  /** Arm angles: 0 hanging down, PI straight up (outward from the shoulder). */
  armL: number
  armR: number
  open: boolean
  happy?: boolean
  bob?: number
  lean?: number
  mouth?: boolean
  blush?: number
}

/** A villager in Tai Lue dress, standing at (x, y) (the feet), h pixels tall, facing us. */
function person(g: CanvasRenderingContext2D, x: number, y: number, h: number, who: Who, pose: Pose) {
  g.save()
  g.translate(x, y - (pose.bob ?? 0))
  g.rotate(pose.lean ?? 0)
  const r = h * 0.17
  const sh = -h * 0.64
  // Legs (a man's), then the skirt or pants.
  if (who.male) {
    limb(g, [[-h * 0.07, -h * 0.3], [-h * 0.08, -h * 0.02]], h * 0.07, who.skin)
    limb(g, [[h * 0.07, -h * 0.3], [h * 0.08, -h * 0.02]], h * 0.07, who.skin)
    shape(g, who.skirt, () => g.roundRect(-h * 0.15, -h * 0.48, h * 0.3, h * 0.22, 4))
  } else {
    shape(g, who.skirt, () => {
      g.moveTo(-h * 0.13, -h * 0.46)
      g.lineTo(h * 0.13, -h * 0.46)
      g.lineTo(h * 0.17, 0)
      g.lineTo(-h * 0.17, 0)
      g.closePath()
    })
    if (who.stripe) {
      g.strokeStyle = who.stripe
      g.lineWidth = 3
      for (const k of [0.32, 0.2, 0.08]) {
        g.beginPath()
        g.moveTo(-h * (0.14 + k * 0.05), -h * k)
        g.lineTo(h * (0.14 + k * 0.05), -h * k)
        g.stroke()
      }
    }
  }
  // Arms behind the body.
  const arm = (side: number, a: number) => {
    const sx = side * h * 0.13
    const len = h * 0.3
    const ex = sx + side * Math.sin(a) * len * 0.55
    const ey = sh + Math.cos(a) * len * 0.55
    const hx = ex + side * Math.sin(a + side * 0.2 * side) * len * 0.5
    const hy = ey + Math.cos(a) * len * 0.5
    limb(g, [[sx, sh + 3], [ex, ey], [hx, hy]], h * 0.065, who.skin)
  }
  arm(-1, pose.armL)
  arm(1, pose.armR)
  // The body (a fitted top).
  shape(g, who.top, () => g.roundRect(-h * 0.14, sh - 4, h * 0.28, h * 0.22, 6))
  // The head.
  const hy = sh - r * 1.05
  if (who.bun) oval(g, who.male ? 0 : r * 0.55, hy - r * 0.95, r * 0.42, r * 0.38, who.hair ?? INK)
  oval(g, 0, hy, r, r * 1.02, who.skin)
  if (who.hair) shape(g, who.hair, () => g.arc(0, hy - r * 0.05, r * 1.0, Math.PI * 1.05, Math.PI * 1.95), 2)
  if (who.hat) shape(g, who.hat, () => g.ellipse(0, hy - r * 0.75, r * 1.55, r * 0.42, 0, Math.PI, Math.PI * 2), 2)
  eyes(g, 0, hy + r * 0.05, r * 0.38, r * 0.13, pose.open, pose.happy)
  blush(g, 0, hy + r * 0.38, r * 0.62, r * 0.2, pose.blush ?? 1)
  if (pose.open || pose.happy) smile(g, 0, hy + r * 0.55, r * 0.3, pose.mouth)
  g.restore()
}

const FOLK: Who[] = [
  { skin: SKIN[0], top: '#FFF4E6', skirt: '#C8506A', stripe: '#F5C04A', hair: INK, bun: true },
  { skin: SKIN[1], top: '#7FB7D9', skirt: '#4F6FA8', male: true, hair: INK, bun: true },
  { skin: SKIN[2], top: '#F7B6C8', skirt: '#7E5AA8', stripe: '#FFD1E0', hair: INK, bun: true },
  { skin: SKIN[0], top: '#F5C04A', skirt: '#3E8E6E', male: true, hair: INK },
  { skin: SKIN[1], top: '#FFFFFF', skirt: '#B5544A', stripe: '#3E8E6E', hair: INK, bun: true },
]

/** What a person does: asleep still, awake waving now and then, dancing, or a big cheer when poked. */
function act(look: SceneLook, t: number, k: number): Pose {
  if (!look.awake) return { armL: 0.25, armR: 0.25, open: false }
  if (look.dance > 0) {
    const b = Math.abs(Math.sin(t * 7 + k))
    return { armL: 2.4 + Math.sin(t * 7 + k) * 0.5, armR: 2.4 - Math.sin(t * 7 + k) * 0.5, open: true, happy: true, bob: b * 12, mouth: true }
  }
  if (look.poke < 1.4) return { armL: 2.6, armR: 2.6 + Math.sin(t * 16) * 0.3, open: true, happy: true, bob: Math.abs(Math.sin(look.poke * 9)) * 8, mouth: true }
  const wave = Math.max(0, Math.sin(t * 0.9 + k * 2.1))
  return { armL: 0.3, armR: 0.3 + wave * (2.2 + Math.sin(t * 9) * 0.35), open: true, bob: Math.abs(Math.sin(t * 2 + k)) * 1.5 }
}

// ---------------------------------------------------------------- the scenes

function drawScene(g: CanvasRenderingContext2D, sc: Scene, look: SceneLook, t: number) {
  const x0 = X(sc.u0)
  const x1 = X(sc.u1)
  const base = Y(sc.v0)
  const w = x1 - x0
  const cx = (x0 + x1) / 2
  switch (sc.kind) {
    case 'boats': {
      // Folk on the bank cheering the race (the boats themselves are travellers on the river).
      for (const k of [0, 1, 2]) {
        const p = act(look, t, k)
        if (look.awake && look.dance <= 0 && look.poke >= 1.4) p.armR = p.armL = 2.3 + Math.sin(t * 6 + k) * 0.3
        person(g, x0 + w * (0.25 + k * 0.25), Y(0.4), 0.48 * PX, FOLK[(k + 1) % FOLK.length], p)
      }
      break
    }
    case 'elephant':
    case 'procession': {
      const proc = sc.kind === 'procession'
      if (proc) {
        tree(g, x0 + w * 0.08, Y(sc.v0 + 0.05), 0.45 * PX)
        const p = act(look, t, 3)
        person(g, x0 + w * 0.2, Y(sc.v0), 0.55 * PX, FOLK[4], p)
        parasol(g, x0 + w * 0.2 + 18, Y(sc.v0 + 0.75), 26, '#E8B84A', look.awake ? Math.sin(t * 2) * 0.15 : 0)
      }
      elephant(g, proc ? x0 + w * 0.62 : cx - w * 0.05, Y(sc.v0), (proc ? 0.95 : 1.05) * PX, look, t, proc)
      if (!proc) tree(g, x1 - 14, Y(sc.v0 + 0.05), 0.5 * PX)
      break
    }
    case 'house':
      house(g, cx, Y(sc.v0), w, look, t)
      break
    case 'birds':
      tree(g, cx, Y(sc.v0), 1.45 * PX, true)
      break
    case 'dancers': {
      for (const k of [0, 1]) {
        const p = act(look, t, k)
        if (look.awake && look.dance <= 0 && look.poke >= 1.4) {
          // The Lanna dance: slow arms curling up and down.
          const s = Math.sin(t * 1.6 + k * Math.PI)
          p.armL = 1.4 + s * 0.8
          p.armR = 1.4 - s * 0.8
          p.lean = s * 0.08
          p.bob = 0
        }
        person(g, x0 + w * (0.3 + k * 0.4), base, 0.75 * PX, FOLK[k * 2], p)
      }
      if (look.awake) {
        // A drummer at the side.
        person(g, x1 - 22, base, 0.55 * PX, FOLK[3], { ...act(look, t, 4), armL: 1.5 + (look.awake ? Math.abs(Math.sin(t * 6)) * 0.6 : 0), armR: 1.5 + (look.awake ? Math.abs(Math.cos(t * 6)) * 0.6 : 0) })
        drum(g, x1 - 22, base - 0.12 * PX)
      } else {
        person(g, x1 - 22, base, 0.55 * PX, FOLK[3], act(look, t, 4))
        drum(g, x1 - 22, base - 0.12 * PX)
      }
      break
    }
    case 'market': {
      const p = act(look, t, 0)
      const walk = look.awake && look.dance <= 0 ? Math.sin(t * 3) * 10 : 0
      const lx = cx + walk
      // The carrying pole over her shoulder, a basket of fruit at each end.
      person(g, lx, base, 0.72 * PX, FOLK[0], { ...p, armR: look.dance > 0 ? p.armR : 2.9, bob: (p.bob ?? 0) + (look.awake ? Math.abs(Math.sin(t * 6)) * 3 : 0) })
      const py = base - 0.72 * PX * 0.72 - (look.awake ? Math.abs(Math.sin(t * 6)) * 3 : 0)
      g.lineWidth = 5
      g.strokeStyle = '#9A6A3E'
      g.beginPath()
      g.moveTo(lx - 62, py + 6)
      g.quadraticCurveTo(lx, py - 6, lx + 62, py + 6)
      g.stroke()
      for (const s of [-1, 1]) basket(g, lx + s * 60, py + 34 + (look.awake ? Math.sin(t * 6 + s) * 3 : 0))
      person(g, lx + 70, base, 0.42 * PX, FOLK[2], act(look, t, 2))
      break
    }
    case 'fish': {
      person(g, x0 + w * 0.22, Y(0.38), 0.62 * PX, FOLK[3], act(look, t, 1))
      // The net, cast in a slow arc when awake.
      const k = look.awake ? (Math.sin(t * 1.2) + 1) / 2 : 0.2
      g.lineWidth = 2
      g.strokeStyle = INK
      g.beginPath()
      g.moveTo(x0 + w * 0.3, Y(0.38) - 0.45 * PX)
      g.quadraticCurveTo(x0 + w * (0.45 + k * 0.1), Y(0.9 + k * 0.2), x0 + w * (0.55 + k * 0.25), Y(0.2))
      g.stroke()
      g.globalAlpha = 0.5
      shape(g, '#FFFFFF', () => g.ellipse(x0 + w * (0.55 + k * 0.25), Y(0.2), 24, 8, 0, 0, Math.PI * 2), 2)
      g.globalAlpha = 1
      for (const n of [0, 1, 2]) {
        const p = look.awake ? (t * (0.5 + n * 0.13) + n * 0.37) % 1 : 0.5
        const jump = look.awake ? Math.sin(p * Math.PI) : 0
        fish(g, x0 + w * (0.55 + n * 0.17) + p * 30, Y(0.12 + jump * (0.42 + (look.dance > 0 ? 0.3 : 0))), 15, ['#F5A04A', '#FF8FB8', '#8FE3C8'][n], look.awake ? (p - 0.5) * 1.6 : 0)
      }
      break
    }
    case 'buffalo': {
      const p = act(look, t, 2)
      buffalo(g, cx + w * 0.08, base, 0.9 * PX, look, t)
      person(g, x0 + w * 0.12, base, 0.62 * PX, { ...FOLK[1], hat: '#E8C46A' }, { ...p, armR: look.awake ? 1.2 + Math.sin(t * 3) * 0.3 : 0.6 })
      break
    }
    case 'music': {
      const p0 = act(look, t, 0)
      const play = look.awake ? Math.sin(t * 5) * 0.1 : 0
      person(g, x0 + w * 0.3, base, 0.7 * PX, FOLK[1], { ...p0, armL: 1.6 + play, armR: 1.6 - play, bob: (p0.bob ?? 0) + (look.awake ? Math.abs(Math.sin(t * 5)) * 3 : 0) })
      khaen(g, x0 + w * 0.3, base - 0.7 * PX * 0.82)
      person(g, x0 + w * 0.72, base, 0.62 * PX, FOLK[4], act(look, t, 1))
      if (look.awake) notes(g, x0 + w * 0.3, base - 0.75 * PX, t, look.dance > 0 ? 5 : 3)
      break
    }
    case 'kite': {
      const ky = Y(sc.v1 - 0.25) + (look.awake ? Math.sin(t * 1.7) * 14 : 0)
      const kx = x1 - 34 + (look.awake ? Math.cos(t * 1.3) * 18 : 0)
      const hold = { x: x0 + w * 0.32 + 14, y: base - 0.56 * PX * 0.78 }
      g.lineWidth = 1.5
      g.strokeStyle = INK
      g.beginPath()
      g.moveTo(hold.x, hold.y)
      g.quadraticCurveTo((hold.x + kx) / 2, (hold.y + ky) / 2 + 30, kx, ky + 14)
      g.stroke()
      kite(g, kx, ky, 24, look.awake ? Math.sin(t * 2.3) * 0.25 : 0)
      const p = act(look, t, 0)
      person(g, x0 + w * 0.32, base, 0.56 * PX, FOLK[3], { ...p, armR: look.dance > 0 ? p.armR : 2.3 })
      person(g, x0 + w * 0.62, base, 0.48 * PX, FOLK[2], act(look, t, 1))
      if (look.awake) dog(g, x0 + w * 0.82, base, 26, t)
      break
    }
  }
  // Dancing: notes over the scene.
  if (look.dance > 0 && sc.kind !== 'music') notes(g, cx, Y(sc.v1 - 0.1), t, 4)
}

function tree(g: CanvasRenderingContext2D, x: number, y: number, h: number, big = false) {
  shape(g, '#A9784E', () => g.roundRect(x - h * 0.05, y - h * 0.55, h * 0.1, h * 0.55, 3))
  const c = big ? '#7FB77E' : '#8FC48A'
  for (const [dx, dy, r] of big
    ? ([[-0.18, -0.62, 0.2], [0.18, -0.64, 0.2], [0, -0.82, 0.24], [-0.08, -0.55, 0.16]] as const)
    : ([[-0.12, -0.62, 0.17], [0.12, -0.62, 0.17], [0, -0.78, 0.2]] as const))
    oval(g, x + dx * h, y + dy * h, r * h, r * h * 0.9, c)
}
function parasol(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, tilt: number) {
  g.save()
  g.translate(x, y)
  g.rotate(tilt)
  g.lineWidth = 3
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(0, 0)
  g.lineTo(0, r * 1.6)
  g.stroke()
  shape(g, c, () => {
    g.moveTo(-r, 0)
    g.quadraticCurveTo(0, -r * 1.0, r, 0)
    g.closePath()
  })
  shape(g, '#C8506A', () => g.arc(0, -r * 0.5, r * 0.15, 0, Math.PI * 2), 2)
  g.restore()
}
function drum(g: CanvasRenderingContext2D, x: number, y: number) {
  shape(g, '#C8506A', () => g.roundRect(x - 12, y - 16, 24, 30, 5))
  oval(g, x, y - 16, 12, 4, '#F2E5C6', 0, 2)
}
function khaen(g: CanvasRenderingContext2D, x: number, y: number) {
  g.lineWidth = 3
  g.strokeStyle = '#B98A4E'
  for (const k of [-6, -2, 2, 6]) {
    g.beginPath()
    g.moveTo(x + k, y + 4)
    g.lineTo(x + k * 1.2, y - 46)
    g.stroke()
  }
  oval(g, x, y + 2, 9, 7, '#9A6A3E', 0, 2)
}
function basket(g: CanvasRenderingContext2D, x: number, y: number) {
  g.lineWidth = 1.5
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(x - 12, y - 14)
  g.lineTo(x, y - 34)
  g.lineTo(x + 12, y - 14)
  g.stroke()
  for (const [dx, c] of [[-6, '#F5A04A'], [6, '#FF6F7A'], [0, '#9BD36A']] as const) oval(g, x + dx, y - 15 - (dx === 0 ? 5 : 0), 6, 6, c, 0, 1.5)
  shape(g, '#D9A86A', () => g.roundRect(x - 15, y - 14, 30, 16, 5))
}
function fish(g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string, rot: number) {
  g.save()
  g.translate(x, y)
  g.rotate(rot)
  shape(g, c, () => {
    g.moveTo(s * 0.8, 0)
    g.lineTo(s * 1.25, -s * 0.45)
    g.lineTo(s * 1.25, s * 0.45)
    g.closePath()
  }, 2)
  oval(g, 0, 0, s * 0.85, s * 0.5, c, 0, 2)
  g.fillStyle = INK
  g.beginPath()
  g.arc(-s * 0.45, -s * 0.1, 2, 0, Math.PI * 2)
  g.fill()
  g.restore()
}
function kite(g: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  g.save()
  g.translate(x, y)
  g.rotate(rot)
  shape(g, '#FF6FAE', () => {
    g.moveTo(0, -s)
    g.lineTo(s * 0.7, 0)
    g.lineTo(0, s * 0.8)
    g.lineTo(-s * 0.7, 0)
    g.closePath()
  })
  g.lineWidth = 2
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(0, s * 0.8)
  g.quadraticCurveTo(10, s * 1.4, -4, s * 2)
  g.stroke()
  g.restore()
}
function dog(g: CanvasRenderingContext2D, x: number, y: number, s: number, t: number) {
  const hop = Math.abs(Math.sin(t * 5)) * 6
  oval(g, x, y - s * 0.45 - hop, s * 0.55, s * 0.32, '#F2E5C6')
  oval(g, x + s * 0.5, y - s * 0.8 - hop, s * 0.3, s * 0.28, '#F2E5C6')
  oval(g, x + s * 0.42, y - s * 1.0 - hop, s * 0.1, s * 0.16, '#D9B48A', -0.4, 2)
  g.lineWidth = 3
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(x - s * 0.5, y - s * 0.55 - hop)
  g.lineTo(x - s * 0.75, y - s * 0.85 - hop + Math.sin(t * 14) * 4)
  g.stroke()
  g.fillStyle = INK
  g.beginPath()
  g.arc(x + s * 0.58, y - s * 0.85 - hop, 2, 0, Math.PI * 2)
  g.fill()
}

/** The elephant, side on, facing right: ears flap, the trunk swings, a rider waves (with a parasol in the procession). */
function elephant(g: CanvasRenderingContext2D, x: number, y: number, s: number, look: SceneLook, t: number, parade: boolean) {
  const awake = look.awake
  const poke = look.poke < 1.6 ? 1 - look.poke / 1.6 : 0
  const dance = look.dance > 0
  const stomp = dance ? Math.abs(Math.sin(t * 6)) * 8 : awake ? Math.abs(Math.sin(t * 2)) * 2 : 0
  const flap = awake ? 1 + Math.sin(t * (poke > 0 ? 18 : 4)) * (0.18 + poke * 0.25) : 1
  const grey = '#B8B0C8'
  g.save()
  g.translate(x, y - stomp)
  if (dance) g.rotate(Math.sin(t * 6) * 0.06)
  // Legs.
  for (const [dx, ph] of [[-0.32, 0], [-0.12, 1], [0.12, 0.5], [0.3, 1.5]] as const) {
    const lift = awake && !dance ? Math.max(0, Math.sin(t * 2 + ph * 3)) * 3 : 0
    shape(g, grey, () => g.roundRect(s * dx - s * 0.07, -s * 0.38 - lift, s * 0.14, s * 0.38, 6))
  }
  // Tail.
  g.lineWidth = 3
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(-s * 0.44, -s * 0.55)
  g.quadraticCurveTo(-s * 0.55, -s * 0.4 + (awake ? Math.sin(t * 5) * 8 : 0), -s * 0.52, -s * 0.28)
  g.stroke()
  // Body and its blanket.
  oval(g, 0, -s * 0.55, s * 0.47, s * 0.3, grey)
  shape(g, '#C8506A', () => g.roundRect(-s * 0.26, -s * 0.84, s * 0.46, s * 0.3, 6))
  g.strokeStyle = '#F5C04A'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(-s * 0.24, -s * 0.58)
  g.lineTo(s * 0.18, -s * 0.58)
  g.stroke()
  // The rider.
  const rp = act(look, t, 5)
  person(g, -s * 0.03, -s * 0.8, s * 0.42, parade ? FOLK[1] : FOLK[3], { ...rp, armR: parade ? 2.6 : rp.armR })
  if (parade) parasol(g, -s * 0.03 + 16, -s * 0.8 - s * 0.62, 24, '#F5C04A', awake ? Math.sin(t * 1.5) * 0.2 : 0)
  // Head, trunk, tusk, ear, eye.
  const sw = awake ? Math.sin(t * 2.2) * 0.12 + poke * -0.9 : 0
  const hx = s * 0.42
  const hy = -s * 0.66
  g.save()
  g.translate(hx + s * 0.12, hy + s * 0.08)
  g.rotate(sw)
  limb(g, [[0, 0], [s * 0.1, s * 0.18], [s * 0.08, s * 0.36], [s * 0.15 + poke * s * 0.15, s * 0.44 - poke * s * 0.5]], s * 0.08, grey)
  g.restore()
  oval(g, hx, hy, s * 0.22, s * 0.21, grey)
  shape(g, '#FFFFFF', () => {
    g.moveTo(hx + s * 0.12, hy + s * 0.12)
    g.quadraticCurveTo(hx + s * 0.2, hy + s * 0.22, hx + s * 0.28, hy + s * 0.16)
  }, 2)
  g.save()
  g.translate(hx - s * 0.08, hy + s * 0.02)
  g.scale(flap, 1)
  oval(g, 0, 0, s * 0.14, s * 0.18, '#C9C0D8')
  g.restore()
  eyes(g, hx + s * 0.08, hy - s * 0.04, 0, s * 0.022, awake, dance || poke > 0)
  blush(g, hx + s * 0.12, hy + s * 0.05, 0, s * 0.04)
  g.restore()
  // A trumpet's blast lines.
  if (poke > 0) {
    g.lineWidth = 3
    g.strokeStyle = INK
    for (const k of [-1, 0, 1]) {
      g.beginPath()
      g.moveTo(x + s * 0.75, y - stomp - s * 0.25 + k * 12)
      g.lineTo(x + s * 0.75 + 16 * poke + 8, y - stomp - s * 0.3 + k * 18)
      g.stroke()
    }
  }
}

function buffalo(g: CanvasRenderingContext2D, x: number, y: number, s: number, look: SceneLook, t: number) {
  const awake = look.awake
  const dance = look.dance > 0
  const hop = dance ? Math.abs(Math.sin(t * 6)) * 10 : look.poke < 1 ? Math.abs(Math.sin(look.poke * 10)) * 6 : 0
  const c = '#8E86A8'
  g.save()
  g.translate(x, y - hop)
  for (const [dx, ph] of [[-0.3, 0], [-0.14, 1], [0.12, 0.5], [0.28, 1.5]] as const) {
    const lift = awake ? Math.max(0, Math.sin(t * 2.4 + ph * 3)) * 4 : 0
    shape(g, c, () => g.roundRect(s * dx - s * 0.05, -s * 0.3 - lift, s * 0.1, s * 0.3, 4))
  }
  g.lineWidth = 3
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(-s * 0.4, -s * 0.48)
  g.quadraticCurveTo(-s * 0.5, -s * 0.35 + (awake ? Math.sin(t * 6) * 10 : 0), -s * 0.46, -s * 0.2)
  g.stroke()
  oval(g, 0, -s * 0.45, s * 0.42, s * 0.22, c)
  oval(g, s * 0.42, -s * 0.48, s * 0.15, s * 0.14, c)
  // Horns: two big curves.
  g.lineWidth = 6
  g.strokeStyle = INK
  g.beginPath()
  g.arc(s * 0.42, -s * 0.62, s * 0.18, Math.PI * 1.05, Math.PI * 1.95)
  g.stroke()
  g.lineWidth = 3
  g.strokeStyle = '#F2E5C6'
  g.stroke()
  oval(g, s * 0.5, -s * 0.42, s * 0.07, s * 0.05, '#C9B8D8', 0, 2)
  eyes(g, s * 0.44, -s * 0.52, 0, s * 0.02, awake, dance)
  g.restore()
}

/** A stilt house: a cat pops up in the window now and then, smoke curls from the cooking fire. */
function house(g: CanvasRenderingContext2D, x: number, y: number, w: number, look: SceneLook, t: number) {
  const awake = look.awake
  const hw = w * 0.32
  const floor = y - 0.55 * PX
  for (const dx of [-hw * 0.85, -hw * 0.3, hw * 0.3, hw * 0.85]) shape(g, '#9A6A3E', () => g.rect(x + dx - 4, floor, 8, y - floor))
  shape(g, '#C99566', () => g.rect(x - hw, floor - 0.55 * PX, hw * 2, 0.55 * PX))
  // The window, and the cat.
  shape(g, '#5A4660', () => g.rect(x - hw * 0.35, floor - 0.42 * PX, hw * 0.7, 0.26 * PX))
  const pop = awake ? Math.max(0, Math.sin(t * 1.3)) : 0
  const cat = look.poke < 1.5 || look.dance > 0 ? 1 : pop
  if (cat > 0.05) {
    g.save()
    g.beginPath()
    g.rect(x - hw * 0.35, floor - 0.42 * PX, hw * 0.7, 0.26 * PX)
    g.clip()
    const cy = floor - 0.16 * PX - cat * 0.13 * PX + (look.dance > 0 ? Math.sin(t * 9) * 4 : 0)
    oval(g, x, cy, 15, 13, '#F5A04A', 0, 2)
    for (const s of [-1, 1]) shape(g, '#F5A04A', () => {
      g.moveTo(x + s * 12, cy - 6)
      g.lineTo(x + s * 13, cy - 19)
      g.lineTo(x + s * 4, cy - 12)
      g.closePath()
    }, 2)
    eyes(g, x, cy - 1, 5, 2, true, look.dance > 0)
    g.restore()
  }
  // The roof: steep, with crossed gable ends (kalae).
  shape(g, '#B5544A', () => {
    g.moveTo(x - hw * 1.25, floor - 0.5 * PX)
    g.lineTo(x, floor - 1.15 * PX)
    g.lineTo(x + hw * 1.25, floor - 0.5 * PX)
    g.closePath()
  })
  g.lineWidth = 4
  g.strokeStyle = INK
  g.beginPath()
  g.moveTo(x - 16, floor - 1.25 * PX)
  g.lineTo(x + 6, floor - 1.08 * PX)
  g.moveTo(x + 16, floor - 1.25 * PX)
  g.lineTo(x - 6, floor - 1.08 * PX)
  g.stroke()
  // The ladder.
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(x + hw + 6, y)
  g.lineTo(x + hw - 6, floor)
  g.moveTo(x + hw + 22, y)
  g.lineTo(x + hw + 10, floor)
  for (let k = 1; k < 4; k++) {
    const f = k / 4
    g.moveTo(x + hw + 6 - 12 * f, y - (y - floor) * f)
    g.lineTo(x + hw + 22 - 12 * f, y - (y - floor) * f)
  }
  g.stroke()
  // The fire and its smoke, and the cook.
  const fx = x - hw - 20
  shape(g, '#F5A04A', () => {
    g.moveTo(fx - 9, y)
    g.quadraticCurveTo(fx, y - (awake ? 24 + Math.sin(t * 12) * 4 : 8), fx + 9, y)
  }, 2)
  if (awake)
    for (let k = 0; k < 3; k++) {
      const p = (t * 0.35 + k / 3) % 1
      g.globalAlpha = 1 - p
      oval(g, fx + Math.sin(p * 6 + k) * 8, y - 30 - p * 90, 8 + p * 10, 6 + p * 8, '#F4F0F8', 0, 2)
      g.globalAlpha = 1
    }
  person(g, fx - 26, y, 0.5 * PX, FOLK[0], act(look, t, 1))
}

/** A bird: perched (wing down) or flying (wing flapping); `dir` which way it faces. */
function bird(g: CanvasRenderingContext2D, x: number, y: number, s: number, flap: number, c: string, dir: number, awake: boolean) {
  g.save()
  g.translate(x, y)
  g.scale(dir, 1)
  shape(g, '#F5A04A', () => {
    g.moveTo(s * 0.55, -s * 0.28)
    g.lineTo(s * 0.8, -s * 0.2)
    g.lineTo(s * 0.55, -s * 0.12)
    g.closePath()
  }, 1.5)
  oval(g, 0, 0, s * 0.45, s * 0.28, c, 0, 2)
  oval(g, s * 0.38, -s * 0.22, s * 0.2, s * 0.2, c, 0, 2)
  shape(g, c, () => {
    g.moveTo(-s * 0.1, -s * 0.05)
    g.lineTo(s * 0.15, -s * 0.05)
    g.lineTo(-s * 0.15, -s * 0.05 - s * 0.55 * flap)
    g.closePath()
  }, 2)
  g.fillStyle = INK
  if (awake) {
    g.beginPath()
    g.arc(s * 0.44, -s * 0.25, 1.8, 0, Math.PI * 2)
    g.fill()
  } else {
    g.lineWidth = 1.5
    g.strokeStyle = INK
    g.beginPath()
    g.moveTo(s * 0.38, -s * 0.24)
    g.lineTo(s * 0.5, -s * 0.24)
    g.stroke()
  }
  g.restore()
}

/** A longboat on the river, its rowers paddling (racing: fast strokes, a splash at the prow). */
function boat(g: CanvasRenderingContext2D, x: number, y: number, tr: Traveller, t: number) {
  const len = 0.62 * PX
  const racing = tr.go >= 0
  const bob = tr.awake ? Math.sin(t * (racing ? 9 : 2.4) + tr.phase) * 2 : 0
  g.save()
  g.translate(x, y + bob)
  if (tr.dance > 0) g.rotate(Math.sin(t * 6 + tr.phase) * 0.12)
  // Rowers, then the hull in front of their legs.
  for (let k = 0; k < tr.rowers; k++) {
    const rx = -len * 0.32 + (k * len * 0.6) / Math.max(1, tr.rowers - 1)
    const ph = t * (racing ? 10 : 3) + k * 0.4
    const stroke = tr.awake ? Math.sin(ph) : 0
    g.lineWidth = 3
    g.strokeStyle = '#9A6A3E'
    g.beginPath()
    g.moveTo(rx + 6 + stroke * 6, -20)
    g.lineTo(rx - 4 - stroke * 10, 8)
    g.stroke()
    oval(g, rx, -20, 6, 8, FOLK[k % FOLK.length].top, 0, 2)
    oval(g, rx, -32, 6, 6, SKIN[k % 3], 0, 2)
    if (tr.awake) {
      g.fillStyle = INK
      g.beginPath()
      g.arc(rx + 2, -33, 1.3, 0, Math.PI * 2)
      g.fill()
    }
  }
  shape(g, tr.color, () => {
    g.moveTo(-len * 0.5, -12)
    g.quadraticCurveTo(-len * 0.1, 6, len * 0.42, -10)
    g.quadraticCurveTo(len * 0.56, -22, len * 0.5, -34)
    g.quadraticCurveTo(len * 0.45, -16, len * 0.3, -14)
    g.lineTo(-len * 0.5, -14)
    g.closePath()
  })
  g.strokeStyle = '#F5C04A'
  g.lineWidth = 2
  g.beginPath()
  g.moveTo(-len * 0.45, -8)
  g.quadraticCurveTo(-len * 0.1, 2, len * 0.38, -8)
  g.stroke()
  if (racing) {
    g.strokeStyle = '#FFFFFF'
    g.lineWidth = 2.5
    for (const k of [0, 1, 2]) {
      g.beginPath()
      g.moveTo(-len * 0.55 - k * 10, -2 + k * 2)
      g.lineTo(-len * 0.55 - k * 10 - 14, -2 + k * 2)
      g.stroke()
    }
  }
  g.restore()
}

/** The whispering lovers, in Tai Lue dress: he leans to her ear, she blushes; asleep they lean together, eyes shut. */
function lovers(g: CanvasRenderingContext2D, l: LoversLook, t: number) {
  const b = l.box
  const base = Y(b.v0 + 0.05)
  const cx = X((b.u0 + b.u1) / 2)
  const h = (b.v1 - b.v0 - 0.15) * PX
  const man: Who = { skin: SKIN[1], top: '#FFF4E6', skirt: '#3E5A8E', male: true, hair: INK, bun: true }
  const woman: Who = { skin: SKIN[0], top: '#FFFFFF', skirt: '#C8506A', stripe: '#F5C04A', hair: INK, bun: true }
  const giggle = l.state === 'giggle'
  const whisper = l.state === 'whisper'
  const awake = l.state !== 'asleep'
  const bob = giggle ? Math.abs(Math.sin(l.t * 14)) * 10 : 0
  // He leans to her ear and cups his hand; she leans in, eyes closed happy, cheeks pink.
  const lean = whisper ? 0.2 + Math.sin(t * 2) * 0.03 : awake ? 0.08 : 0.12
  person(g, cx - h * 0.2, base, h * 0.95, man, { armL: 0.3, armR: whisper ? 2.2 : giggle ? 2.6 : 0.3, open: awake && !whisper, happy: giggle, lean, bob, mouth: whisper })
  person(g, cx + h * 0.2, base, h * 0.88, woman, { armL: giggle ? 2.6 : 0.3, armR: 0.3, open: awake && !whisper && !giggle, happy: giggle || whisper, lean: whisper ? -0.08 : -0.1, bob: giggle ? Math.abs(Math.cos(l.t * 14)) * 10 : 0, blush: whisper ? 1.6 : 1 })
  if (whisper)
    for (let k = 0; k < 4; k++) {
      const p = (l.t * 0.5 + k / 4) % 1
      g.globalAlpha = Math.sin(p * Math.PI)
      heart(g, cx + Math.sin(p * 6 + k * 2) * 18, base - h * 1.05 - p * 60, 9 + k * 2)
    }
  else if (!awake) {
    // Asleep: a little z, drawn as a zigzag.
    g.globalAlpha = 0.6 + Math.sin(t * 2) * 0.3
    const zx = cx + h * 0.35
    const zy = base - h * 1.05 - Math.sin(t * 2) * 4
    g.lineWidth = 2.5
    g.strokeStyle = INK
    g.beginPath()
    g.moveTo(zx, zy - 12)
    g.lineTo(zx + 10, zy - 12)
    g.lineTo(zx, zy)
    g.lineTo(zx + 10, zy)
    g.stroke()
  }
  g.globalAlpha = 1
}

/** Daddy, painted into the mural: a mint unicorn in a Tai Lue shirt, waving. */
function paintedDaddy(g: CanvasRenderingContext2D, x: number, y: number, h: number, since: number, t: number) {
  const pop = Math.min(1, since / 0.4)
  const s = 0.2 + 0.8 * pop + Math.sin(pop * Math.PI) * 0.25
  g.save()
  g.translate(x, y)
  g.scale(s, s)
  const wave = 2.3 + Math.sin(t * 8) * 0.4
  person(g, 0, 0, h, { skin: '#A9EBD6', top: '#FBE78A', skirt: '#4F6FA8', male: true }, { armL: 0.3, armR: wave, open: true, mouth: true })
  // His unicorn bits over the painted head: ears, mane and the gold horn.
  const r = h * 0.17
  const hy = -h * 0.64 - r * 1.05
  for (const sd of [-1, 1]) shape(g, '#A9EBD6', () => {
    g.moveTo(sd * r * 0.55, hy - r * 0.7)
    g.lineTo(sd * r * 0.95, hy - r * 1.35)
    g.lineTo(sd * r * 0.95, hy - r * 0.5)
    g.closePath()
  }, 2)
  shape(g, '#8EC9F5', () => g.arc(0, hy - r * 0.15, r * 1.02, Math.PI * 1.1, Math.PI * 1.75), 2)
  shape(g, '#F5C04A', () => {
    g.moveTo(-r * 0.2, hy - r * 0.85)
    g.lineTo(0, hy - r * 1.75)
    g.lineTo(r * 0.2, hy - r * 0.85)
    g.closePath()
  }, 2)
  g.restore()
}
