// Soft see-through textures (mist, glows, blob shadows) whose pixels we write ourselves, instead of a canvas gradient.
//
// Why not a canvas: Safari on iPhone and iPad dithers canvas gradients and keeps the canvas premultiplied by alpha. When
// WebGL uploads it, each pixel is divided by its alpha again, so the dither's tiny per-channel noise in a nearly clear
// pixel blows up into bright pink, green and cyan specks (Nan's mist banks looked like TV static over the clouds).
// Chrome on the Mac doesn't dither, which is why it only showed on iOS. Here the color is exact in every pixel and only
// the alpha fades, so there is nothing to blow up.
import { DataTexture, LinearFilter, LinearMipmapLinearFilter, RGBAFormat, UnsignedByteType } from 'three'

/** A `w`×`h` texture of one flat color (`rgb`, 0..255 each) whose alpha at each pixel center is `alpha(x, y)` (0..1, in
 *  pixels from the top-left, like a canvas). */
export function softTexture(w: number, h: number, rgb: [number, number, number], alpha: (x: number, y: number) => number) {
  const data = new Uint8Array(w * h * 4)
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((h - 1 - y) * w + x) * 4 // (rows bottom-up, so it reads the same way up as a canvas texture)
      data[i] = rgb[0]
      data[i + 1] = rgb[1]
      data[i + 2] = rgb[2]
      data[i + 3] = Math.round(Math.min(1, Math.max(0, alpha(x + 0.5, y + 0.5))) * 255)
    }
  const tex = new DataTexture(data, w, h, RGBAFormat, UnsignedByteType)
  tex.magFilter = LinearFilter
  tex.minFilter = LinearMipmapLinearFilter
  tex.generateMipmaps = true
  tex.needsUpdate = true
  return tex
}

/** A canvas-style radial gradient's alpha at distance `d` from its center: `stops` are [offset 0..1 of `r`, alpha],
 *  in order, linear between them. */
export function radialAlpha(d: number, r: number, stops: [number, number][]) {
  const t = d / r
  if (t <= stops[0][0]) return stops[0][1]
  for (let k = 1; k < stops.length; k++) {
    const [t1, a1] = stops[k]
    if (t <= t1) {
      const [t0, a0] = stops[k - 1]
      return a0 + ((a1 - a0) * (t - t0)) / (t1 - t0 || 1)
    }
  }
  return stops[stops.length - 1][1]
}

/** Layers drawn over each other ("source-over", as a canvas does): the alpha of them all together. */
export const over = (alphas: number[]) => 1 - alphas.reduce((clear, a) => clear * (1 - a), 1)
