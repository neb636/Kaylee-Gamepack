// The flat toon look: one shared gradient map (2-4 light bands, the shadow band tinted lavender instead of grey),
// a uniform ambient light plus one sun, and the art/STYLE.md palette. A lit face shows its exact palette color.
import { AmbientLight, Color, DataTexture, DirectionalLight, MeshToonMaterial, NearestFilter, RGBAFormat, type ColorRepresentation, type Object3D } from 'three'
import { TUNE } from './tune'

export const PAL = {
  pink: '#FF8FB8',
  hotpink: '#FF4F9A',
  lavender: '#D9CCFF',
  lavenderDark: '#B9A6F5',
  butter: '#FBEA9A',
  mint: '#8FE3C8',
  sky: '#A8DCFF',
  peach: '#FFC2A8',
  cream: '#FFF7F0',
  gold: '#FFC83D',
  ink: '#2B2330',
} as const

let gradient: DataTexture | null = null
/** The banded light ramp every toon material shares (rebuilt by applyBands when ?debug changes it). */
export function toonGradient() {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array(TUNE.bands.length * 4), TUNE.bands.length, 1, RGBAFormat)
    gradient.minFilter = gradient.magFilter = NearestFilter
    gradient.generateMipmaps = false
    applyBands()
  }
  return gradient
}
export function applyBands() {
  if (!gradient) return
  const data = gradient.image.data as Uint8Array
  TUNE.bands.forEach((b, i) => b.forEach((v, c) => (data[i * 4 + c] = Math.round(v * 255))))
  TUNE.bands.forEach((_, i) => (data[i * 4 + 3] = 255))
  gradient.needsUpdate = true
}

const cache = new Map<string, MeshToonMaterial>()
/** A shared toon material. `vertexColors` materials take their color from the geometry (see geo.ts). */
export function toon(color: ColorRepresentation = '#ffffff', vertexColors = false) {
  const key = `${new Color(color).getHexString()}|${vertexColors}`
  let m = cache.get(key)
  if (!m) {
    m = new MeshToonMaterial({ color, vertexColors, gradientMap: toonGradient() })
    cache.set(key, m)
  }
  return m
}

/** Ambient + sun. The sun sits on the camera's side, so what Kaylee sees is mostly lit and shadows fall on far sides. */
export function makeLights(parent: Object3D) {
  const ambient = new AmbientLight('#FFF7F0', TUNE.ambient * Math.PI)
  const sun = new DirectionalLight('#FFF7F0', TUNE.sun * Math.PI)
  sun.position.set(5, 10, 7)
  parent.add(ambient, sun, sun.target)
  return {
    ambient,
    sun,
    /** Keeps the sun's direction fixed relative to what the camera looks at. */
    follow(x: number, y: number, z: number) {
      sun.target.position.set(x, y, z)
      sun.position.set(x + 5, y + 10, z + 7)
      ambient.intensity = TUNE.ambient * Math.PI
      sun.intensity = TUNE.sun * Math.PI
    },
  }
}
