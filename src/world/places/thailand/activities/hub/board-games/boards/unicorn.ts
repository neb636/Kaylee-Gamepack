// Kaylee's Unicorn Dice Game's board: a rainbow path of 25 numbered stepping stones winding up a pastel meadow in five
// rows, a start cloud at the near edge, and a sparkly unicorn castle on a bank of cloud at the far end. The stones are
// real chunky discs standing on the meadow (so the pieces hop from stone to stone, and each throws a little shade);
// the meadow is painted (the ribbon between the stones, hearts, stars, the stones' shadows), the numbers are painted
// on the stones' tops, and round the edges the meadow has tiny cotton-candy bushes, crystals and toadstools, all kept
// low so nothing hides a stone. The castle stands at the back, so it never hides the path from the camera.
// Space positions are in the table top's space: x across the table (toward the cousin), z toward the front of the
// house (and the camera), y up from the top.
import { Color, Group, Mesh, PlaneGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { P } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { bell } from '../../../../../../../sdk'
import { glint, paintedMaterial, rng, shadows, toy } from '../look'
import { UNICORN_END } from '../rules/unicorn'

/** The board's size on the island (x across, z front to back, centered on `z`). */
export const BOARD = { w: 0.8, d: 0.86, thick: 0.02, z: -0.07 }
const COLS = 5
const GAP_X = 0.14
const GAP_Z = 0.135
const STONE_R = 0.046
/** How far a stone stands up from the meadow. */
const STONE_H = 0.018
const TOP = BOARD.thick + STONE_H
/** The rainbow, stone by stone. */
const RAINBOW = ['#FF8FB0', '#FFB27A', '#FFE37A', '#8FE3A8', '#8FCBFF', '#C7A6FF']
/** Where the castle's gate is (the winner hops in there). */
const GATE = new Vector3(0.2, 0, -0.39)
const START = new Vector3(-0.335, 0, 0.3)

/** Space `i` (0: the start cloud, 1..25 the stones) on the board, before any sharing offset. */
export function unicornSpace(i: number): Vector3 {
  if (i <= 0) return START.clone()
  const k = Math.min(UNICORN_END, i) - 1
  const row = Math.floor(k / COLS)
  const col = row % 2 === 0 ? k % COLS : COLS - 1 - (k % COLS)
  return new Vector3(-0.28 + col * GAP_X, 0, 0.225 - row * GAP_Z)
}

export class UnicornBoard {
  readonly root = new Group()
  private castle: Group
  private castleT = -1

  constructor(bag: Bag) {
    const { w, d, thick, z } = BOARD
    // The board itself: a cream foot, a lavender tray with gold studs at its corners, the painted meadow inside.
    const base: BufferGeometry[] = [
      P.rbox(w + 0.024, 0.01, d + 0.024, 0.024, '#FFF6EA', { at: [0, 0.005, z] }),
      P.rbox(w, thick, d, 0.02, PAL.lavender, { at: [0, thick / 2, z] }),
      ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.011, PAL.gold, { at: [sx * (w / 2 - 0.014), thick, z + sz * (d / 2 - 0.014)], scale: [1, 0.7, 1] }, 10))),
    ]
    // The stones: a cream foot and a rounded disc in its rainbow color.
    const shade = new Color()
    for (let i = 1; i <= UNICORN_END; i++) {
      const p = unicornSpace(i)
      const c = RAINBOW[(i - 1) % RAINBOW.length]
      shade.set(c).multiplyScalar(0.86)
      base.push(
        P.cyl(STONE_R + 0.005, STONE_R + 0.007, 0.007, '#FFFDF6', { at: [p.x, thick + 0.0035, p.z] }, 24),
        P.cyl(STONE_R, STONE_R + 0.002, STONE_H - 0.008, `#${shade.getHexString()}`, { at: [p.x, thick + 0.005 + (STONE_H - 0.008) / 2, p.z] }, 24),
        P.cyl(STONE_R - 0.004, STONE_R, 0.004, c, { at: [p.x, TOP - 0.002, p.z] }, 24),
      )
    }
    // The start: a puff of cloud to stand on.
    base.push(
      ...[
        [-0.03, 0.012, 0.03],
        [0.03, 0.01, 0.032],
        [0, -0.012, 0.036],
        [0, 0.012, 0.03],
      ].map(([dx, dz, r]) => P.sphere(r, '#FFFFFF', { at: [START.x + dx, thick + 0.006, START.z + dz], scale: [1, 0.5, 1] }, 12)),
    )
    // Along the two edges, between the rows' ends: tiny things, all lower than a piece's knees.
    const r = rng(9)
    const candy = ['#FFB8D8', '#D9CCFF', '#BFF0E0', '#FBEA9A']
    for (const sx of [-1, 1])
      for (let i = 0; i < 9; i++) {
        const zz = z + d / 2 - 0.06 - i * 0.092
        const x = sx * (w / 2 - 0.034 - r() * 0.012)
        // (Not on the start cloud, nor in front of the castle's gate.)
        if (sx < 0 && zz > 0.2) continue
        const k = (i + (sx > 0 ? 1 : 0)) % 4
        const c = candy[Math.floor(r() * candy.length)]
        if (k === 0) base.push(P.sphere(0.02, c, { at: [x, thick + 0.012, zz], scale: [1, 0.8, 1] }, 9), P.sphere(0.014, c, { at: [x + 0.014, thick + 0.01, zz + 0.012] }, 8), P.sphere(0.012, '#FFFFFF', { at: [x - 0.012, thick + 0.008, zz + 0.012] }, 8))
        else if (k === 1) base.push(P.cone(0.012, 0.036, c, { at: [x, thick + 0.018, zz], rot: [0, 0, 0.15] }, 5), P.cone(0.008, 0.024, '#FFFFFF', { at: [x + 0.014, thick + 0.012, zz + 0.006], rot: [0, 0, -0.25] }, 5))
        else if (k === 2) base.push(P.cyl(0.006, 0.008, 0.016, PAL.cream, { at: [x, thick + 0.008, zz] }, 8), P.sphere(0.016, c, { at: [x, thick + 0.018, zz], scale: [1, 0.62, 1] }, 10), ...[0, 2.1, 4.2].map((a) => P.sphere(0.0035, '#FFFFFF', { at: [x + Math.cos(a) * 0.009, thick + 0.026, zz + Math.sin(a) * 0.009] }, 5)))
        else base.push(...[0, 1, 2, 3, 4].map((j) => P.sphere(0.007, c, { at: [x + Math.cos(j * 1.257) * 0.008, thick + 0.004, zz + Math.sin(j * 1.257) * 0.008], scale: [1, 0.5, 1] }, 6)), P.sphere(0.005, PAL.gold, { at: [x, thick + 0.006, zz] }, 6))
      }
    this.root.add(toy(base, bag, 1.2))
    // The painted meadow, and over the stones' tops their numbers.
    const pw = w - 0.03
    const pd = d - 0.03
    const meadow = new Mesh(bag.add(new PlaneGeometry(pw, pd)), paintedMaterial(bag, paintMeadow(pw, pd)))
    meadow.rotation.x = -Math.PI / 2
    meadow.position.set(0, thick + 0.0008, z)
    this.root.add(meadow)
    const numbers = new Mesh(bag.add(new PlaneGeometry(pw, pd)), paintedMaterial(bag, paintNumbers(pw, pd), true))
    numbers.rotation.x = -Math.PI / 2
    numbers.position.set(0, TOP + 0.0008, z)
    numbers.raycast = () => {}
    this.root.add(numbers)
    // The board's own shade on the grass.
    this.root.add(shadows(bag, [[-0.16, z - 0.14, 0.34, 0.03], [0.16, z - 0.14, 0.34, 0.03], [-0.16, z + 0.14, 0.34, 0.03], [0.16, z + 0.14, 0.34, 0.03]]))
    this.castle = buildCastle(bag)
    this.castle.position.set(GATE.x, thick, GATE.z - 0.055)
    this.castle.userData.pick = 'trip:table:castle'
    this.root.add(this.castle)
  }

  /** Where a piece stands on space `i` (on its stone's top), side by side with the other piece when they share it. */
  spot(i: number, who: 0 | 1, sharing: boolean): Vector3 {
    const p = unicornSpace(i)
    if (sharing) p.x += who === 0 ? -0.024 : 0.024
    p.y = i <= 0 ? BOARD.thick + 0.02 : TOP
    return p
  }
  /** Just inside the castle's gate. */
  gate(): Vector3 {
    return GATE.clone().setY(BOARD.thick + 0.012)
  }
  /** Where the castle's sparkles burst from. */
  castleTop(): Vector3 {
    return this.castle.position.clone().setY(BOARD.thick + 0.2)
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

/** The unicorn castle, on a bank of cloud: a tall keep with a pink roof and a rainbow flag, two pink towers beside it,
 *  two little mint turrets in front, a wall with battlements between them, lit windows, and a gold gate facing the
 *  path with a star over it. */
function buildCastle(bag: Bag) {
  const g = new Group()
  const tower = (x: number, z: number, r: number, h: number, wall: string, roof: string): BufferGeometry[] => [
    P.cyl(r, r * 1.12, h, wall, { at: [x, h / 2, z] }, 14),
    P.cyl(r * 1.18, r * 1.1, 0.012, '#FFFFFF', { at: [x, h, z] }, 14),
    P.cone(r * 1.3, r * 2.5, roof, { at: [x, h + 0.006 + r * 1.25, z] }, 14),
    P.sphere(r * 0.32, PAL.gold, { at: [x, h + 0.006 + r * 2.55, z] }, 8),
    P.rbox(r * 0.55, r * 0.9, 0.006, r * 0.25, PAL.butter, { at: [x, h * 0.66, z + r * 1.02] }),
  ]
  const parts: BufferGeometry[] = [
    // The cloud it stands on.
    ...[
      [-0.13, 0.02, 0.05],
      [-0.06, 0.045, 0.045],
      [0.03, 0.05, 0.04],
      [0.11, 0.035, 0.05],
      [0.15, -0.01, 0.045],
      [-0.15, -0.02, 0.04],
      [0, -0.03, 0.06],
    ].map(([x, z, r]) => P.sphere(r, '#FFFFFF', { at: [x, 0.006, z], scale: [1.2, 0.42, 1] }, 12)),
    // The wall and its battlements.
    P.rbox(0.2, 0.066, 0.05, 0.008, '#EFE6FF', { at: [0, 0.045, 0] }),
    ...[-0.075, -0.045, -0.015, 0.015, 0.045, 0.075].map((x) => P.rbox(0.018, 0.016, 0.052, 0.004, '#FFFFFF', { at: [x, 0.084, 0] })),
    ...tower(0, -0.02, 0.04, 0.16, '#FFF4FA', PAL.hotpink),
    ...tower(-0.1, -0.005, 0.03, 0.115, '#FFC4DE', PAL.lavenderDark),
    ...tower(0.1, -0.005, 0.03, 0.115, '#FFC4DE', PAL.lavenderDark),
    ...tower(-0.055, 0.03, 0.019, 0.078, '#FFFFFF', '#7FDDBC'),
    ...tower(0.055, 0.03, 0.019, 0.078, '#FFFFFF', '#7FDDBC'),
    // The gate (a gold arch round a plum door), a star over it.
    P.rbox(0.036, 0.046, 0.008, 0.017, '#8E6FB8', { at: [0, 0.034, 0.026] }),
    P.torus(0.02, 0.0045, PAL.gold, { at: [0, 0.04, 0.029] }, Math.PI),
    ...[-1, 1].map((s) => P.cyl(0.0045, 0.0045, 0.03, PAL.gold, { at: [s * 0.02, 0.026, 0.029] }, 6)),
    P.prism(
      Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + Math.PI / 2
        const rr = i % 2 ? 0.006 : 0.014
        return [Math.cos(a) * rr, Math.sin(a) * rr] as [number, number]
      }),
      0.006,
      PAL.gold,
      { at: [0, 0.074, 0.03] },
    ),
    // A rainbow flag on the keep.
    P.cyl(0.002, 0.002, 0.05, '#B58A6A', { at: [0, 0.295, -0.02] }, 6),
    ...RAINBOW.slice(0, 4).map((c, i) => P.box(0.028, 0.006, 0.003, c, { at: [0.015, 0.315 - i * 0.006, -0.02] })),
  ]
  g.add(toy(parts, bag, 1.2))
  g.add(shadows(bag, [[0, 0, 0.13, 0.05, 0.001]]))
  return g
}

/** Board space (x, z) to a painted top's pixels: x to the right, z down (toward the camera is the bottom). */
const PX = 1300
const px = (pw: number, pd: number) => (v: { x: number; z: number }) => [(pw / 2 + v.x) * PX, (pd / 2 + v.z - BOARD.z) * PX] as const
const canvas = (pw: number, pd: number) => {
  const c = document.createElement('canvas')
  c.width = Math.round(pw * PX)
  c.height = Math.round(pd * PX)
  return c
}

/** Paints the meadow: pastel grass going lilac toward the castle, soft cloud swirls, hearts and stars, the white
 *  ribbon from the start cloud through every stone to the gate, and each stone's shadow. */
function paintMeadow(pw: number, pd: number): HTMLCanvasElement {
  const c = canvas(pw, pd)
  const W = c.width
  const D = c.height
  const g = c.getContext('2d')!
  const at = px(pw, pd)
  const grad = g.createLinearGradient(0, 0, 0, D)
  grad.addColorStop(0, '#E4D6FF')
  grad.addColorStop(0.45, '#D6F0E4')
  grad.addColorStop(1, '#C4F2CE')
  g.fillStyle = grad
  g.fillRect(0, 0, W, D)
  const r = rng(17)
  // Soft patches of light, like sun through cloud.
  for (let i = 0; i < 26; i++) {
    const x = r() * W
    const y = r() * D
    const rad = 60 + r() * 120
    const sg = g.createRadialGradient(x, y, 0, x, y, rad)
    const col = i % 3 === 0 ? '255,214,236' : i % 3 === 1 ? '255,255,255' : '206,236,255'
    sg.addColorStop(0, `rgba(${col},.5)`)
    sg.addColorStop(1, `rgba(${col},0)`)
    g.fillStyle = sg
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2)
  }
  // Hearts, stars and sparkles scattered over it.
  for (let i = 0; i < 70; i++) {
    const x = r() * W
    const y = r() * D
    const s = 7 + r() * 9
    g.fillStyle = ['rgba(255,255,255,.9)', 'rgba(255,170,205,.75)', 'rgba(255,226,130,.85)', 'rgba(184,160,255,.7)'][i % 4]
    if (i % 3 === 0) heart(g, x, y, s)
    else glint(g, x, y, s * 1.2)
  }
  // Each stone's shade (down and to the back left, like every shadow on the island).
  for (let i = 1; i <= UNICORN_END; i++) {
    const [x, y] = at(unicornSpace(i))
    const rad = STONE_R * PX * 1.5
    const sg = g.createRadialGradient(x - 9, y - 10, rad * 0.5, x - 9, y - 10, rad)
    sg.addColorStop(0, 'rgba(110,84,160,.4)')
    sg.addColorStop(1, 'rgba(110,84,160,0)')
    g.fillStyle = sg
    g.fillRect(x - rad * 1.2, y - rad * 1.2, rad * 2.4, rad * 2.4)
  }
  // The ribbon from the start cloud through every stone to the castle: white, a pink stitch down its middle.
  const pts = [START, ...Array.from({ length: UNICORN_END }, (_, i) => unicornSpace(i + 1)), GATE]
  g.lineCap = 'round'
  g.lineJoin = 'round'
  const stroke = (w: number, col: string, dash: number[] = []) => {
    g.strokeStyle = col
    g.lineWidth = w
    g.setLineDash(dash)
    g.beginPath()
    pts.forEach((p, i) => {
      const [x, y] = at(p)
      if (i) g.lineTo(x, y)
      else g.moveTo(x, y)
    })
    g.stroke()
    g.setLineDash([])
  }
  stroke(STONE_R * PX * 1.02, 'rgba(160,130,210,.28)')
  stroke(STONE_R * PX * 0.86, '#FFFFFF')
  stroke(STONE_R * PX * 0.16, '#FFC2DC', [2, 26])
  return c
}

/** Paints what's on the stones' tops (the rest is clear): a shine, and the number in big friendly digits (for the
 *  grown-up: she counts the hops). */
function paintNumbers(pw: number, pd: number): HTMLCanvasElement {
  const c = canvas(pw, pd)
  const g = c.getContext('2d')!
  const at = px(pw, pd)
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.lineJoin = 'round'
  g.font = `600 ${Math.round(STONE_R * PX * 1.02)}px Fredoka, "Arial Rounded MT Bold", sans-serif`
  const dark = new Color()
  for (let i = 1; i <= UNICORN_END; i++) {
    const [x, y] = at(unicornSpace(i))
    const rad = (STONE_R - 0.004) * PX
    // A lighter ring just inside the rim, and a shine at the top left.
    g.strokeStyle = 'rgba(255,255,255,.5)'
    g.lineWidth = 5
    g.beginPath()
    g.arc(x, y, rad * 0.84, 0, Math.PI * 2)
    g.stroke()
    g.fillStyle = 'rgba(255,255,255,.7)'
    g.beginPath()
    g.ellipse(x - rad * 0.42, y - rad * 0.46, rad * 0.2, rad * 0.12, -0.7, 0, Math.PI * 2)
    g.fill()
    dark.set(RAINBOW[(i - 1) % RAINBOW.length]).multiplyScalar(0.5)
    g.strokeStyle = `#${dark.getHexString()}`
    g.lineWidth = 11
    g.strokeText(String(i), x, y + rad * 0.06)
    g.fillStyle = '#FFFFFF'
    g.fillText(String(i), x, y + rad * 0.06)
  }
  return c
}

function heart(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  g.beginPath()
  g.moveTo(x, y + r * 0.8)
  g.bezierCurveTo(x - r * 1.3, y - r * 0.1, x - r * 0.6, y - r * 1.1, x, y - r * 0.35)
  g.bezierCurveTo(x + r * 0.6, y - r * 1.1, x + r * 1.3, y - r * 0.1, x, y + r * 0.8)
  g.fill()
}
