// Chutes and Ladders' board (greybox, our own small board): a 6 by 6 grid numbered like a snake, three golden ladders
// lying on it straight up their columns, and three candy-striped slides curving down. The squares and numbers are
// painted on the board's top (a canvas texture); the ladders and slides lie on top in 3D, and each one's ends are painted
// as rings (mint where a ladder starts, pink where a slide starts) so she can see where they go. A gold star on 36.
// Positions are in the table top's space: x across the table (toward the cousin), z toward the front of the house (and
// the camera), y up from the top.
import { CanvasTexture, CatmullRomCurve3, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace, TubeGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
import { bell } from '../../../../../../../sdk'
import { CHUTES, CHUTES_END, LADDERS, SIDE, square } from '../rules/chutes'
import type { Who } from '../rules/turns'
import { BOARD } from './unicorn'

const CELL = 0.09
const NEAR_ROW = 0.205
const START = new Vector3(-0.225, 0, 0.31)
const LIFT = 0.006

/** Square `n`'s middle (0: the start, before square 1). */
export function chutesSpace(n: number): Vector3 {
  if (n <= 0) return START.clone()
  const { row, col } = square(n)
  return new Vector3(-((SIDE - 1) / 2) * CELL + col * CELL, 0, NEAR_ROW - row * CELL)
}

/** How each slide curves (sideways bulge, meters), so they read as slides and never cross a ladder. */
const BULGE: Record<number, number> = { 15: 0.02, 33: -0.03, 35: -0.035 }

/** The points a slide's piece follows, top to bottom. */
function slideCurve(from: number) {
  const a = chutesSpace(from)
  const b = chutesSpace(CHUTES[from])
  const mid = a.clone().lerp(b, 0.5)
  const side = new Vector3(-(b.z - a.z), 0, b.x - a.x).normalize()
  mid.addScaledVector(side, BULGE[from] ?? 0.03)
  return new CatmullRomCurve3([a, a.clone().lerp(mid, 0.5).addScaledVector(side, 0.01), mid, mid.clone().lerp(b, 0.5), b])
}

export class ChutesBoard {
  readonly root = new Group()
  private star: Group
  private starT = -1

  constructor(bag: Bag) {
    this.root.add(solid(merge([P.rbox(BOARD.w, BOARD.thick, BOARD.d, 0.01, '#CFF3E3', { at: [0, BOARD.thick / 2, 0] })]), bag, 1.5))
    const tex = bag.add(new CanvasTexture(paint()))
    tex.colorSpace = SRGBColorSpace
    tex.anisotropy = 4
    const top = new Mesh(bag.add(new PlaneGeometry(BOARD.w - 0.02, BOARD.d - 0.02)), bag.add(new MeshBasicMaterial({ map: tex })))
    top.rotation.x = -Math.PI / 2
    top.position.y = BOARD.thick + 0.001
    this.root.add(top)
    // The ladders: two golden rails and rungs, lying flat on the board up their column.
    const parts: BufferGeometry[] = []
    for (const [f, t] of Object.entries(LADDERS)) {
      const a = chutesSpace(+f)
      const b = chutesSpace(t)
      const len = a.distanceTo(b)
      const ang = Math.atan2(b.x - a.x, b.z - a.z)
      const mid = a.clone().lerp(b, 0.5)
      const rot: [number, number, number] = [0, ang, 0]
      const off = new Vector3(Math.cos(ang), 0, -Math.sin(ang)).multiplyScalar(0.02)
      for (const s of [-1, 1]) parts.push(P.box(0.007, 0.006, len - 0.02, PAL.gold, { at: [mid.x + off.x * s, BOARD.thick + LIFT, mid.z + off.z * s], rot }))
      const rungs = Math.round(len / 0.03)
      for (let i = 1; i < rungs; i++) {
        const p = a.clone().lerp(b, i / rungs)
        parts.push(P.box(0.044, 0.004, 0.006, '#F6D27A', { at: [p.x, BOARD.thick + LIFT, p.z], rot }))
      }
    }
    // The slides: candy-striped tubes curving down, flattened onto the board.
    const stripes = [PAL.pink, PAL.lavenderDark]
    for (const f of Object.keys(CHUTES)) {
      const curve = slideCurve(+f)
      const n = 10
      for (let i = 0; i < n; i++) {
        const seg = new CatmullRomCurve3(curve.getPoints(n).slice(i, i + 2))
        const tube = bake(new TubeGeometry(seg, 2, 0.014, 8, false), stripes[i % 2], { at: [0, BOARD.thick + LIFT, 0], scale: [1, 0.4, 1] })
        parts.push(tube)
      }
    }
    this.root.add(solid(merge(parts), bag, 1.5))
    // A gold star on 36, the finish.
    this.star = new Group()
    const s36 = chutesSpace(CHUTES_END)
    this.star.add(
      solid(
        merge([
          P.cyl(0.003, 0.003, 0.07, PAL.ink, { at: [0, 0.035, 0] }, 6),
          ...Array.from({ length: 5 }, (_, i) => P.cone(0.012, 0.03, PAL.gold, { at: [Math.sin((i / 5) * Math.PI * 2) * 0.014, 0.08 + Math.cos((i / 5) * Math.PI * 2) * 0.014, 0], rot: [0, 0, -(i / 5) * Math.PI * 2] }, 6)),
          P.sphere(0.012, PAL.gold, { at: [0, 0.08, 0] }, 8),
        ]),
        bag,
        1.5,
      ),
    )
    this.star.position.set(s36.x - 0.03, BOARD.thick, s36.z - 0.03)
    this.star.userData.pick = 'trip:table:castle'
    this.root.add(this.star)
  }

  spot(i: number, who: Who, sharing: boolean): Vector3 {
    const p = chutesSpace(i)
    if (sharing) p.x += who === 0 ? -0.02 : 0.02
    p.y = BOARD.thick
    return p
  }
  gate(): Vector3 {
    return this.spot(CHUTES_END, 0, false)
  }
  castleTop(): Vector3 {
    return this.star.position.clone().setY(BOARD.thick + 0.1)
  }
  /** Up a ladder: its rungs, bottom to top. */
  ladderPath(from: number, to: number): Vector3[] {
    const a = chutesSpace(from)
    const b = chutesSpace(to)
    const n = Math.max(2, Math.round(a.distanceTo(b) / 0.03))
    return Array.from({ length: n + 1 }, (_, i) => a.clone().lerp(b, i / n).setY(BOARD.thick))
  }
  /** Down a slide, along its curve. */
  slidePath(from: number): Vector3[] {
    return slideCurve(from)
      .getPoints(24)
      .map((p) => p.setY(BOARD.thick + 0.004))
  }
  markSpace(_i: number | null) {}
  cheer() {
    this.starT = 0
  }
  get busy() {
    return this.starT >= 0
  }
  update(dt: number, _t = 0) {
    if (this.starT < 0) return
    this.starT += dt / 1
    const p = Math.min(1, this.starT)
    this.star.rotation.y = p * Math.PI * 4
    this.star.scale.setScalar(1 + bell(p) * 0.5)
    if (this.starT >= 1) {
      this.star.rotation.y = 0
      this.star.scale.setScalar(1)
      this.starT = -1
    }
  }
}

const CHECK = ['#FFF4D6', '#FFE3EF', '#E3F4FF', '#E9DEFF']

function paint(): HTMLCanvasElement {
  const PX = 1400
  const W = Math.round((BOARD.w - 0.02) * PX)
  const D = Math.round((BOARD.d - 0.02) * PX)
  const c = document.createElement('canvas')
  c.width = W
  c.height = D
  const g = c.getContext('2d')!
  const at = (v: Vector3) => [W / 2 + v.x * PX, D / 2 + v.z * PX] as const
  g.fillStyle = '#E8FBF2'
  g.fillRect(0, 0, W, D)
  const s = CELL * PX
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = `600 ${Math.round(s * 0.34)}px Fredoka, "Arial Rounded MT Bold", sans-serif`
  for (let n = 1; n <= CHUTES_END; n++) {
    const [x, y] = at(chutesSpace(n))
    const { row, col } = square(n)
    g.fillStyle = CHECK[((row + col) % 2) * 2 + (row % 2)]
    g.fillRect(x - s / 2, y - s / 2, s, s)
    g.strokeStyle = 'rgba(43,35,48,.25)'
    g.lineWidth = 2
    g.strokeRect(x - s / 2, y - s / 2, s, s)
    g.fillStyle = PAL.ink
    g.fillText(String(n), x - s * 0.26, y - s * 0.27)
  }
  // Where each ladder starts (mint) and each slide starts (pink): a ring she can see from across the table.
  const ring = (n: number, col: string) => {
    const [x, y] = at(chutesSpace(n))
    g.strokeStyle = col
    g.lineWidth = 9
    g.beginPath()
    g.arc(x, y, s * 0.36, 0, Math.PI * 2)
    g.stroke()
  }
  for (const f of Object.keys(LADDERS)) ring(+f, '#3FC48F')
  for (const f of Object.keys(CHUTES)) ring(+f, '#FF4F9A')
  // The start, before square 1.
  const [sx, sy] = at(START)
  g.fillStyle = '#FFFFFF'
  g.beginPath()
  g.arc(sx, sy, s * 0.42, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = PAL.ink
  g.lineWidth = 4
  g.stroke()
  // The thick frame round the grid.
  const [x0, y0] = at(chutesSpace(36).add(new Vector3(-CELL / 2, 0, -CELL / 2)))
  g.strokeStyle = PAL.ink
  g.lineWidth = 6
  g.strokeRect(x0, y0, s * SIDE, s * SIDE)
  return c
}
