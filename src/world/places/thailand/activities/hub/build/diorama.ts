// The house as a diorama. Inside, the neighbors and the roof go away so the camera can see in, and the house used to
// float in flat blue sky (Dad, 2026-10-28: "this weird blue sky background"). Now it reads like a toy dollhouse:
//
// - the plinth: a chunky slab of earth under Agong's house, cream footing on top and soft clay layers with pebbles
//   below, so the cut edge beside the right wall is the side of a toy base, not the end of the world;
// - the backdrop: a warm glow (cream in the middle, peach, then the app's pink at the edges) behind the house while
//   she's inside. Out on the street the sky stays the sky, and it fades between the two as she walks in and out.
import { CanvasTexture, Color, SRGBColorSpace, type BufferGeometry, type Object3D } from 'three'
import { P } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { DIM } from '../layout'
import { scenery, type Kit } from './kit'

/** The layers of the plinth, top down: [height, color, how far it tucks in from the one above]. */
const LAYERS: [number, string, number][] = [
  [0.26, '#F2DDBE', 0], // the concrete footing, the house wall's cream
  [0.46, '#EDBE9F', 0.03], // clay
  [0.3, '#E3AA8E', 0.03], // a darker band
  [0.42, '#D6977F', 0.05], // the bottom, rounded off like a toy
]
/** How far the plinth sticks out past the outside of the walls (a little ledge you can see beside them). */
const LIP = 0.14
const PEBBLES = ['#FFF1DF', PAL.lavender, '#F7CDB0', '#FFFFFF']

export function buildPlinth(kit: Kit): Object3D {
  const halfW = DIM.houseW / 2 + LIP
  // From just behind the back wall to the house front (the sidewalk takes over from there).
  const z0 = DIM.back - 0.15 - LIP
  const z1 = 0
  const parts: BufferGeometry[] = []
  // Its top sits just under the floor's top, so the floor never flickers against it.
  let top = -0.02
  let inset = 0
  LAYERS.forEach(([h, c, tuck], i) => {
    inset += tuck
    const w = 2 * (halfW - inset)
    const d = z1 - z0 - inset
    const at: [number, number, number] = [0, top - h / 2, z0 + inset + d / 2]
    parts.push(i === LAYERS.length - 1 ? P.rbox(w, h, d, 0.16, c, { at }) : P.box(w, h, d, c, { at }))
    top -= h
  })
  // Pebbles pressed into the side she sees (the right one, +x) and a few in the back: the same every visit.
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  const soilTop = -0.02 - LAYERS[0][0]
  const soilBottom = top + 0.12
  for (let i = 0; i < 46; i++) {
    const r = 0.05 + rand() * 0.07
    const y = soilBottom + rand() * (soilTop - soilBottom - 0.08)
    const z = z0 + 0.4 + rand() * (z1 - z0 - 0.8)
    // The side tucks in as it goes down: follow it.
    const depth = (-0.02 - y) / (-0.02 - top)
    const x = halfW - 0.03 - depth * 0.1
    parts.push(P.sphere(r, PEBBLES[i % PEBBLES.length], { at: [x, y, z], scale: [0.45, 1, 1.2] }, 10))
  }
  for (let i = 0; i < 10; i++) {
    const r = 0.05 + rand() * 0.06
    parts.push(P.sphere(r, PEBBLES[i % PEBBLES.length], { at: [-halfW + 0.4 + rand() * (2 * halfW - 0.8), soilBottom + rand() * (soilTop - soilBottom), z0 + 0.04], scale: [1.2, 1, 0.45] }, 10))
  }
  return scenery(kit, parts, 2)
}

const SKY = new Color(PAL.sky)
/** The glow behind the house inside, from the middle out. */
const GLOW: [number, string][] = [
  [0, '#FFF5EC'],
  [0.45, '#FFE2D6'],
  [0.8, '#FBC3D4'],
  [1, '#F2A9C8'],
]

/** The scene's background: the sky on the street, the warm glow inside, fading between them in about half a second. */
export class Backdrop {
  readonly texture: CanvasTexture
  private canvas = document.createElement('canvas')
  private ctx: CanvasRenderingContext2D
  /** 0 = sky, 1 = the glow. */
  private mix = -1
  private goal = 0

  constructor(kit: Kit) {
    this.canvas.width = this.canvas.height = 256
    this.ctx = this.canvas.getContext('2d')!
    this.texture = kit.bag.add(new CanvasTexture(this.canvas))
    this.texture.colorSpace = SRGBColorSpace
  }

  /** Inside or out; `snap` jumps there at once (a deep link, the start). */
  set(inside: boolean, snap = false) {
    this.goal = inside ? 1 : 0
    if (snap) this.draw(this.goal)
  }

  update(dt: number) {
    if (this.mix === this.goal) return
    const step = dt / 0.5
    const next = this.mix < this.goal ? Math.min(this.goal, this.mix + step) : Math.max(this.goal, this.mix - step)
    this.draw(next)
  }

  private draw(mix: number) {
    this.mix = mix
    const { ctx } = this
    const s = this.canvas.width
    ctx.globalAlpha = 1
    ctx.fillStyle = `#${SKY.getHexString()}`
    ctx.fillRect(0, 0, s, s)
    if (mix > 0) {
      // Centered a little below the middle, where the room sits on screen; it stretches with the screen's shape.
      const g = ctx.createRadialGradient(s * 0.5, s * 0.56, 0, s * 0.5, s * 0.56, s * 0.78)
      for (const [at, c] of GLOW) g.addColorStop(at, c)
      ctx.globalAlpha = mix
      ctx.fillStyle = g
      ctx.fillRect(0, 0, s, s)
    }
    this.texture.needsUpdate = true
  }
}
