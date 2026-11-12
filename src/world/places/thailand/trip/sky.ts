// What Thailand's toy maps share (the Thailand map, hub/map/, and the Nan map, nan-trip/map/): the board floats in the
// sky Sparkle's balloon flies through. A soft blue-to-pink sky behind it, puffy clouds round and under it, the toy tray
// it sits in (a cream rim with a pink edge on a lavender base), and the camera's entrance: when the board opens the
// camera is already moving behind the loading cover, then settles a little lower and closer (MapCover.tsx is the
// cover).
import { CanvasTexture, Group, SRGBColorSpace, type BufferGeometry } from 'three'
import { clamp } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import { knobs } from '../../../kit/knobs'

/** The sky behind the board: soft blue up top, pink down low. */
export function skyTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 256
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, '#BFE6FF')
  grad.addColorStop(0.55, '#E4DCFF')
  grad.addColorStop(1, '#FFD9EC')
  g.fillStyle = grad
  g.fillRect(0, 0, 4, 256)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  return tex
}
/** The page color behind the canvas, before the first frame (the sky's top). */
export const SKY_TOP = '#CFE9FF'

/** A puffy cloud (`rain`: a little greyer). */
export function puffCloud(bag: Bag, s = 1, rain = false): Group {
  const c = rain ? '#EEF0FF' : '#FFFFFF'
  return solid(
    merge([
      P.sphere(0.26 * s, c, { at: [0, 0, 0], scale: [1, 0.72, 0.9] }, 12),
      P.sphere(0.2 * s, c, { at: [-0.27 * s, -0.04 * s, 0.02 * s], scale: [1, 0.72, 0.9] }, 11),
      P.sphere(0.22 * s, c, { at: [0.28 * s, -0.03 * s, 0], scale: [1, 0.72, 0.9] }, 11),
      P.sphere(0.16 * s, c, { at: [0.1 * s, 0.12 * s, -0.02 * s] }, 10),
      P.sphere(0.13 * s, c, { at: [-0.48 * s, -0.07 * s, 0], scale: [1, 0.7, 0.9] }, 9),
    ]),
    bag,
    1.5,
  )
}

/** The toy tray round a w × d board centered on (cx, cz): a cream rim `rim` wide whose top is at `top`, a pink edge
 *  and a lavender base below it. `k` scales the rim's height and the layers (the Thailand map is 1). */
export function trayParts(w: number, d: number, top: number, rim = 0.34, k = 1, cx = 0, cz = 0): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const h = 0.8 * k
  for (const s of [-1, 1]) {
    parts.push(P.rbox(rim, h, d + rim * 2, 0.12 * k, '#FFF7F0', { at: [cx + s * (w / 2 + rim / 2 - 0.02), top - h / 2, cz] }))
    parts.push(P.rbox(w + rim * 2, h, rim, 0.12 * k, '#FFF7F0', { at: [cx, top - h / 2, cz + s * (d / 2 + rim / 2 - 0.02)] }))
  }
  parts.push(P.rbox(w + rim * 2 + 0.3 * k, 0.6 * k, d + rim * 2 + 0.3 * k, 0.2 * k, '#FFA8C9', { at: [cx, top - 0.8 * k, cz] }))
  parts.push(P.rbox(w + rim * 2 + 0.05 * k, 0.6 * k, d + rim * 2 + 0.05 * k, 0.2 * k, '#CDBBF7', { at: [cx, top - 1.3 * k, cz] }))
  return parts
}

/** A map camera's entrance knobs (the feel lab, ?feel=1): each map tunes its own. */
export function mapCamKnobs(id: string, label: string, file: string, at: { yaw?: number; pitch?: number; zoom?: number } = {}) {
  return knobs(id, label, file, {
    yaw: { value: at.yaw ?? 8, min: -40, max: 40, step: 1, label: 'Turn', unit: '°', note: 'added to the board view, side to side (it does not animate)' },
    pitch: { value: at.pitch ?? -12, min: -30, max: 20, step: 1, label: 'Settle tilt', unit: '°', note: 'where the entrance ends: below 0 looks from lower down' },
    zoom: { value: at.zoom ?? 0.87, min: 0.6, max: 1.2, step: 0.01, label: 'Settle zoom', unit: '×', note: 'where the entrance ends: below 1 is closer' },
    intro: { value: 3.4, min: 0, max: 6, step: 0.1, label: 'Entrance', unit: 's', note: 'how long the camera takes to settle, counted from the first frame (behind the cover)' },
    hold: { value: 0, min: 0, max: 1.5, step: 0.05, label: 'Entrance wait', unit: 's', note: 'a still beat before the camera starts moving' },
    cover: { value: 1, min: 0, max: 2.5, step: 0.05, label: 'Cover', unit: 's', note: 'how long the camera moves behind the loading screen (first frames hitch) before it fades' },
    fade: { value: 0.3, min: 0.05, max: 1.2, step: 0.05, label: 'Cover fade', unit: 's', note: 'how fast the loading screen fades into the moving map' },
  })
}
export type MapCam = ReturnType<typeof mapCamKnobs>

/** Starts from rest and lands at rest: no jolt on the cut from the loading screen. */
const easeInOut = (p: number) => 0.5 - 0.5 * Math.cos(Math.PI * p)

/** The entrance's clock: how far it has got (0..1, eased), and when the cover may go. */
export class Entrance {
  /** Seconds into the entrance (it runs once, when the board opens). */
  private t = 0
  private shown = false
  constructor(
    private cam: MapCam,
    private onReveal: () => void,
  ) {}
  /** 0 at the start, 1 once it has settled. */
  get k() {
    const c = this.cam
    return c.intro > 0 ? easeInOut(clamp((this.t - c.hold) / c.intro, 0, 1)) : 1
  }
  get running() {
    return this.t < this.cam.hold + this.cam.intro
  }
  /** Straight to the end (she did something that moves the camera). */
  finish() {
    this.t = this.cam.hold + this.cam.intro
  }
  /** A frame. (A slow frame, like the first ones uploading the board's textures, slows it a moment instead of
   *  skipping ahead.) */
  step(dt: number) {
    const running = this.running
    if (running) this.t += Math.min(dt, 1 / 30)
    if (!this.shown && (this.t >= this.cam.cover || !running)) {
      this.shown = true
      this.onReveal()
    }
  }
}
