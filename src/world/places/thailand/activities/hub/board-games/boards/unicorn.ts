// Kaylee's Unicorn Dice Game's board (greybox): a rainbow path of 25 numbered stepping stones winding up the board in
// five rows, a start cloud at the near edge, and a sparkly unicorn castle at the far end. The stones, numbers and path
// are painted on the board's top (a canvas texture: crisp numbers, one draw call); the castle stands up in 3D at the
// back, so it never hides the path from the camera.
// Space positions are in the table top's space: x across the table (toward the cousin), z toward the front of the
// house (and the camera), y up from the top.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, Vector3 } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { bell } from '../../../../../../../sdk'
import { UNICORN_END } from '../rules/unicorn'

/** The board's size on the table (x across, z along the wall). */
export const BOARD = { w: 0.6, d: 0.72, thick: 0.014 }
const COLS = 5
const GAP_X = 0.1
const GAP_Z = 0.11
const STONE_R = 0.038
/** The rainbow, stone by stone. */
const RAINBOW = ['#FF8FB0', '#FFB27A', '#FFE37A', '#8FE3A8', '#8FCBFF', '#C7A6FF']
/** Where the castle's gate is (the winner hops in there). */
const GATE = new Vector3(0.17, 0, -0.31)
const START = new Vector3(-0.2, 0, 0.32)

/** Space `i` (0: the start cloud, 1..25 the stones) on the board, before any sharing offset. */
export function unicornSpace(i: number): Vector3 {
  if (i <= 0) return START.clone()
  const k = Math.min(UNICORN_END, i) - 1
  const row = Math.floor(k / COLS)
  const col = row % 2 === 0 ? k % COLS : COLS - 1 - (k % COLS)
  return new Vector3(-0.2 + col * GAP_X, 0, 0.22 - row * GAP_Z)
}

export class UnicornBoard {
  readonly root = new Group()
  private castle: Group
  private castleT = -1

  constructor(bag: Bag) {
    // The board itself: a lavender tray, the painted top just above it.
    this.root.add(solid(merge([P.rbox(BOARD.w, BOARD.thick, BOARD.d, 0.01, PAL.lavender, { at: [0, BOARD.thick / 2, 0] })]), bag, 1.5))
    const tex = bag.add(new CanvasTexture(paint()))
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    const top = new Mesh(bag.add(new PlaneGeometry(BOARD.w - 0.02, BOARD.d - 0.02)), bag.add(new MeshBasicMaterial({ map: tex })))
    top.rotation.x = -Math.PI / 2
    top.position.y = BOARD.thick + 0.001
    this.root.add(top)
    this.root.position.y = 0
    this.castle = buildCastle(bag)
    this.castle.position.set(GATE.x, BOARD.thick, GATE.z - 0.025)
    this.castle.userData.pick = 'trip:table:castle'
    this.root.add(this.castle)
  }

  /** Where a piece stands on space `i` (on the board's top), side by side with the other piece when they share it. */
  spot(i: number, who: 0 | 1, sharing: boolean): Vector3 {
    const p = unicornSpace(i)
    if (sharing) p.x += who === 0 ? -0.022 : 0.022
    p.y = BOARD.thick
    return p
  }
  /** Just inside the castle's gate. */
  gate(): Vector3 {
    return GATE.clone().setY(BOARD.thick)
  }
  /** Where the castle's sparkles burst from. */
  castleTop(): Vector3 {
    return this.castle.position.clone().setY(BOARD.thick + 0.12)
  }

  /** (Candy Land marks the space a card sends a piece to; the die games don't.) */
  markSpace(_i: number | null) {}
  /** The towers bounce and light up (a win, or a tap). */
  cheer() {
    this.castleT = 0
  }

  get busy() {
    return this.castleT >= 0
  }

  update(dt: number, _t = 0) {
    if (this.castleT < 0) return
    this.castleT += dt / 0.9
    const p = Math.min(1, this.castleT)
    const s = 1 + bell(p) * 0.18 * Math.abs(Math.sin(p * Math.PI * 3))
    this.castle.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
    if (this.castleT >= 1) {
      this.castle.scale.set(1, 1, 1)
      this.castleT = -1
    }
  }
}

/** A little castle: lavender walls, pink towers with cone roofs and gold balls, a gate facing the path. */
function buildCastle(bag: Bag) {
  const g = new Group()
  const towers = [-0.075, 0, 0.075].flatMap((x, i) => {
    const h = i === 1 ? 0.11 : 0.08
    return [P.cyl(0.02, 0.022, h, PAL.pink, { at: [x, h / 2, 0] }, 12), P.cone(0.026, 0.045, i === 1 ? PAL.hotpink : PAL.lavenderDark, { at: [x, h + 0.022, 0] }, 12), P.sphere(0.008, PAL.gold, { at: [x, h + 0.048, 0] }, 8)]
  })
  g.add(
    solid(
      merge([
        P.rbox(0.16, 0.055, 0.04, 0.008, PAL.lavender, { at: [0, 0.0275, 0] }),
        ...towers,
        // The gate (an arch of gold) and a rainbow flag on the middle tower.
        P.torus(0.016, 0.004, PAL.gold, { at: [0, 0.018, 0.021] }, Math.PI),
        P.box(0.024, 0.02, 0.004, PAL.ink, { at: [0, 0.01, 0.021] }),
        P.cyl(0.002, 0.002, 0.04, PAL.ink, { at: [0, 0.17, 0] }, 6),
        ...RAINBOW.slice(0, 3).map((c, i) => P.box(0.02, 0.006, 0.003, c, { at: [0.011, 0.185 - i * 0.006, 0] })),
      ]),
      bag,
      1.5,
    ),
  )
  return g
}

/** Paints the board's top: a soft meadow, the rainbow ribbon through the stones, numbered stones, the start cloud. */
function paint(): HTMLCanvasElement {
  const PX = 1400 // pixels per meter
  const W = Math.round((BOARD.w - 0.02) * PX)
  const D = Math.round((BOARD.d - 0.02) * PX)
  const c = document.createElement('canvas')
  c.width = W
  c.height = D
  const g = c.getContext('2d')!
  // Board space (x, z) to canvas pixels: x to the right, z down (toward the camera is the bottom).
  const at = (v: Vector3) => [W / 2 + v.x * PX, D / 2 + v.z * PX] as const
  const grad = g.createLinearGradient(0, 0, 0, D)
  grad.addColorStop(0, '#E9DEFF')
  grad.addColorStop(1, '#D8F5E8')
  g.fillStyle = grad
  g.fillRect(0, 0, W, D)
  // A few sparkles on the meadow.
  g.fillStyle = 'rgba(255,255,255,.85)'
  for (let i = 0; i < 40; i++) {
    const x = ((i * 137) % 97) / 97
    const y = ((i * 71) % 89) / 89
    star(g, x * W, y * D, 6 + (i % 3) * 3)
  }
  // The ribbon from the start cloud through every stone to the castle.
  const pts = [START, ...Array.from({ length: UNICORN_END }, (_, i) => unicornSpace(i + 1)), GATE]
  g.lineCap = 'round'
  g.lineJoin = 'round'
  for (const [w, col] of [
    [STONE_R * PX * 1.25, '#FFFFFF'],
    [STONE_R * PX * 0.5, '#FFE3EF'],
  ] as const) {
    g.strokeStyle = col
    g.lineWidth = w
    g.beginPath()
    pts.forEach((p, i) => {
      const [x, y] = at(p)
      if (i) g.lineTo(x, y)
      else g.moveTo(x, y)
    })
    g.stroke()
  }
  // The start cloud.
  const [sx, sy] = at(START)
  g.fillStyle = '#FFFFFF'
  for (const [dx, dy, r] of [
    [-26, 6, 26],
    [0, -6, 32],
    [28, 6, 26],
  ]) {
    circle(g, sx + dx, sy + dy, r)
    g.fill()
  }
  // The stones, in rainbow order, with their numbers (big friendly digits, for Dad: she counts the hops).
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `600 ${Math.round(STONE_R * PX * 0.95)}px Fredoka, "Arial Rounded MT Bold", sans-serif`
  for (let i = 1; i <= UNICORN_END; i++) {
    const [x, y] = at(unicornSpace(i))
    const r = STONE_R * PX
    g.fillStyle = RAINBOW[(i - 1) % RAINBOW.length]
    circle(g, x, y, r)
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = PAL.ink
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,.55)'
    circle(g, x - r * 0.35, y - r * 0.38, r * 0.2)
    g.fill()
    g.fillStyle = PAL.ink
    g.fillText(String(i), x, y + r * 0.06)
  }
  return c
}

function circle(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
}

function star(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    const rr = i % 2 ? r * 0.35 : r
    g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  g.closePath()
  g.fill()
}
