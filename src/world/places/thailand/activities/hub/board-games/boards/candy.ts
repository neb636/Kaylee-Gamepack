// Candy Land's board (greybox, our own candy world): a winding path of 36 rounded tiles in six colors that repeat in
// order, each color with its own candy shape (a pink heart, an orange star, a yellow lemon drop, a green leaf, a blue
// moon, a purple flower) so no two look alike; a gumdrop gate at the start and a cupcake house at the finish. The path
// and tiles are painted on the board's top (a canvas texture); the gate and the house stand up in 3D, and a glowing ring
// shows the space a card sends a piece to.
// Positions are in the table top's space: x across the table (toward the cousin), z toward the front of the house (and
// the camera), y up from the top.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, SRGBColorSpace, Vector3 } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { bell } from '../../../../../../../sdk'
import { CANDY_FINISH, CANDY_SPACES, colorOf, type CandyColor } from '../rules/candy'
import type { Who } from '../rules/turns'
import { BOARD } from './unicorn'

export const CANDY_HEX: Record<CandyColor, string> = { pink: '#FF6FA8', orange: '#FF9A3D', yellow: '#FFD93D', green: '#4FCB7F', blue: '#4FA8FF', purple: '#A77BFF' }
export const CANDY_SHAPE: Record<CandyColor, 'heart' | 'star' | 'drop' | 'leaf' | 'moon' | 'flower'> = { pink: 'heart', orange: 'star', yellow: 'drop', green: 'leaf', blue: 'moon', purple: 'flower' }

const COLS = 6
const GAP_X = 0.084
const GAP_Z = 0.098
const TILE = 0.068
const START = new Vector3(-0.21, 0, 0.33)
const HOUSE = new Vector3(-0.2, 0, -0.32)

/** Space `i` (0: the gate, 1..36 the tiles, 37: the cupcake house's door). */
export function candySpace(i: number): Vector3 {
  if (i <= 0) return START.clone()
  if (i >= CANDY_FINISH) return HOUSE.clone().setZ(HOUSE.z + 0.035)
  const k = i - 1
  const row = Math.floor(k / COLS)
  const col = row % 2 === 0 ? k % COLS : COLS - 1 - (k % COLS)
  // A little wiggle so the path winds instead of running in ruler-straight rows.
  return new Vector3(-0.21 + col * GAP_X, 0, 0.245 - row * GAP_Z + Math.sin(k * 1.3) * 0.008)
}

export class CandyBoard {
  readonly root = new Group()
  private house: Group
  private houseT = -1
  private ring: Mesh
  private mark: number | null = null

  constructor(bag: Bag) {
    this.root.add(solid(merge([P.rbox(BOARD.w, BOARD.thick, BOARD.d, 0.01, '#FFD6E8', { at: [0, BOARD.thick / 2, 0] })]), bag, 1.5))
    const tex = bag.add(new CanvasTexture(paint()))
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    const top = new Mesh(bag.add(new PlaneGeometry(BOARD.w - 0.02, BOARD.d - 0.02)), bag.add(new MeshBasicMaterial({ map: tex })))
    top.rotation.x = -Math.PI / 2
    top.position.y = BOARD.thick + 0.001
    this.root.add(top)
    // The gumdrop gate at the start.
    const gate = solid(
      merge([
        ...[-1, 1].map((s) => P.sphere(0.018, s < 0 ? CANDY_HEX.green : CANDY_HEX.pink, { at: [s * 0.04, 0.015, 0], scale: [1, 0.9, 1] }, 10)),
        P.torus(0.04, 0.006, PAL.butter, { at: [0, 0.012, 0] }, Math.PI),
      ]),
      bag,
      1.5,
    )
    gate.position.set(START.x, BOARD.thick, START.z - 0.01)
    this.root.add(gate)
    this.house = buildHouse(bag)
    this.house.position.set(HOUSE.x, BOARD.thick, HOUSE.z - 0.01)
    this.house.userData.pick = 'trip:table:castle'
    this.root.add(this.house)
    // The ring that shows where a card sends a piece.
    this.ring = new Mesh(bag.add(new RingGeometry(0.03, 0.042, 32)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.9, depthWrite: false })))
    this.ring.rotation.x = -Math.PI / 2
    this.ring.visible = false
    this.root.add(this.ring)
  }

  spot(i: number, who: Who, sharing: boolean): Vector3 {
    const p = candySpace(i)
    if (sharing) p.x += who === 0 ? -0.02 : 0.02
    p.y = BOARD.thick
    return p
  }
  gate(): Vector3 {
    return candySpace(CANDY_FINISH).setY(BOARD.thick)
  }
  castleTop(): Vector3 {
    return this.house.position.clone().setY(BOARD.thick + 0.12)
  }
  cheer() {
    this.houseT = 0
  }
  /** The glowing ring on the space a card points to (null: away). */
  markSpace(i: number | null) {
    this.mark = i
    this.ring.visible = i !== null
    if (i !== null) this.ring.position.copy(candySpace(i)).setY(BOARD.thick + 0.003)
  }

  get busy() {
    return this.houseT >= 0 || this.mark !== null
  }

  update(dt: number, t: number) {
    if (this.mark !== null) {
      const s = 1 + Math.sin(t * 9) * 0.15
      this.ring.scale.set(s, s, s)
    }
    if (this.houseT < 0) return
    this.houseT += dt / 0.9
    const p = Math.min(1, this.houseT)
    const s = 1 + bell(p) * 0.18 * Math.abs(Math.sin(p * Math.PI * 3))
    this.house.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
    if (this.houseT >= 1) {
      this.house.scale.set(1, 1, 1)
      this.houseT = -1
    }
  }
}

/** A cupcake house: a pink wrapper, a fluffy frosting roof with sprinkles and a cherry, a little door. */
function buildHouse(bag: Bag) {
  const g = new Group()
  const sprinkles = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2
    return P.box(0.012, 0.004, 0.004, Object.values(CANDY_HEX)[i % 6], { at: [Math.cos(a) * 0.045, 0.1 + (i % 3) * 0.008, Math.sin(a) * 0.045], rot: [0, a, 0.4] })
  })
  g.add(
    solid(
      merge([
        P.cyl(0.055, 0.045, 0.065, '#FF9FC4', { at: [0, 0.0325, 0] }, 14),
        P.sphere(0.06, PAL.cream, { at: [0, 0.085, 0], scale: [1, 0.6, 1] }, 14),
        P.sphere(0.04, '#FFE3EF', { at: [0, 0.115, 0], scale: [1, 0.7, 1] }, 12),
        P.sphere(0.014, '#E8344F', { at: [0, 0.14, 0] }, 10),
        P.rbox(0.03, 0.04, 0.008, 0.006, PAL.lavenderDark, { at: [0, 0.02, 0.05] }),
        ...sprinkles,
      ]),
      bag,
      1.5,
    ),
  )
  return g
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

function paint(): HTMLCanvasElement {
  const PX = 1400
  const W = Math.round((BOARD.w - 0.02) * PX)
  const D = Math.round((BOARD.d - 0.02) * PX)
  const c = document.createElement('canvas')
  c.width = W
  c.height = D
  const g = c.getContext('2d')!
  const at = (v: Vector3) => [W / 2 + v.x * PX, D / 2 + v.z * PX] as const
  const grad = g.createLinearGradient(0, 0, W, D)
  grad.addColorStop(0, '#FFF0F6')
  grad.addColorStop(1, '#E7F7FF')
  g.fillStyle = grad
  g.fillRect(0, 0, W, D)
  // Lollipops and gumdrops dotted about the meadow.
  for (let i = 0; i < 26; i++) {
    const x = (((i * 137) % 97) / 97) * W
    const y = (((i * 71) % 89) / 89) * D
    g.fillStyle = Object.values(CANDY_HEX)[i % 6] + '55'
    g.beginPath()
    g.arc(x, y, 10 + (i % 3) * 6, 0, Math.PI * 2)
    g.fill()
  }
  // The path: a fat white ribbon from the gate through every tile to the house.
  const pts = Array.from({ length: CANDY_SPACES + 2 }, (_, i) => candySpace(i))
  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.strokeStyle = '#FFFFFF'
  g.lineWidth = TILE * PX * 1.15
  g.beginPath()
  pts.forEach((p, i) => {
    const [x, y] = at(p)
    if (i) g.lineTo(x, y)
    else g.moveTo(x, y)
  })
  g.stroke()
  // The tiles: rounded squares in their color, each with its candy shape in white.
  const s = TILE * PX
  for (let i = 1; i <= CANDY_SPACES; i++) {
    const [x, y] = at(candySpace(i))
    const col = colorOf(i)
    g.fillStyle = CANDY_HEX[col]
    g.beginPath()
    g.roundRect(x - s / 2, y - s / 2, s, s, s * 0.25)
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = PAL.ink
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,.95)'
    candyShape(g, CANDY_SHAPE[col], x, y, s * 0.28)
    g.fill()
  }
  return c
}
