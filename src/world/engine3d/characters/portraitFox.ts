// Sculpted in head radii, facing +Z. Pigment follows the surface so the cheek
// markings, ear linings and tail tip turn with the form without extra shells.
import { Color, SphereGeometry, type BufferGeometry } from 'three'
import { bake, P, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'
import { clamp, smooth } from '../../../sdk/math'

type Surface = (x: number, y: number, z: number, pigment: Color) => V3

function sculpt(base: string, place: { at?: V3; scale: V3 }, surface: Surface, slices = 48, rings = 32) {
  const mesh = bake(new SphereGeometry(1, slices, rings), base, {}, true)
  const { position, color } = mesh.attributes
  const ground = new Color(base)
  const pigment = new Color()
  for (let i = 0; i < position.count; i++) {
    const point = surface(position.getX(i), position.getY(i), position.getZ(i), pigment.copy(ground))
    position.setXYZ(i, ...point)
    color.setXYZ(i, pigment.r, pigment.g, pigment.b)
  }
  mesh.computeVertexNormals()
  mesh.scale(...place.scale)
  if (place.at) mesh.translate(...place.at)
  return mesh
}

export function portraitFox(look: Look, { H, R, headY }: Frame, hair: string) {
  const at = (x: number, y: number, z: number): V3 => [x * R, headY + y * R, z * R]
  const place = { at: at(0, 0, 0), scale: [R, R, R] as V3 }
  const cream = new Color(look.light)
  const ink = new Color('#54332F')
  const innerEar = new Color('#FFD3AA')
  const plain: BufferGeometry[] = []
  const eyes: BufferGeometry[] = []

  const head = [sculpt(look.fur, place, (x, y, z, pigment) => {
    const ruff = Math.exp(-((y + 0.23) ** 2) / 0.05)
    const bridge = Math.exp(-7 * x * x - 11 * (y + 0.23) ** 2) * Math.max(0, z)
    pigment.lerp(cream, clamp((-0.15 - y - 0.06 * Math.cos(x * 6)) * 22))
    return [x * (0.99 + 0.17 * ruff), y * 0.94, z * 0.91 + 0.24 * bridge]
  })]

  // One bob with an asymmetrical hairline. The crown rounds into straight
  // sides and the last few rings roll under to close the cut at the shoulder.
  const highlight = new Color('#A17057')
  head.push(sculpt(hair, place, (x, y, z, pigment) => {
    const t = Math.acos(clamp(y, -1, 1)) / Math.PI
    const angle = Math.atan2(x, z)
    const front = Math.cos(angle - 0.23)
    const fringe = clamp((front - 0.18) / 0.82)
    const hem = -1.07 + 1.81 * smooth(fringe) + 0.036 * Math.cos(5 * angle)
    const along = Math.min(t / 0.93, 1)
    const h = 1.075 + (hem - 1.075) * along ** 1.65
    const part = angle - 0.23
    const groove = Math.cos(22 * part - 3.5 * Math.sin(part) * along + 0.6 * Math.sin(3 * part))
    const under = t <= 0.93 ? 1 : (1 - t) / 0.07
    const radius = Math.sqrt(Math.max(0, 1 - (Math.max(0, h) / 1.075) ** 2)) * under
    const partLine = 0.32 * Math.exp(-110 * part * part) * (1 - along)
    pigment.lerp(highlight, 0.08 + 0.24 * clamp(groove) ** 3 + partLine)
    const tuck = 0.19 * clamp(-h) ** 1.4
    // Sweep the lower locks behind the cheek tufts as they reach the shoulders.
    const swept = angle + Math.sin(angle) * smooth((0.48 - h) / 0.85) * 0.57
    return [0.12 * (1 - along) + Math.sin(swept) * radius * (1.12 - tuck + 0.011 * groove),
      h - 0.04 * (1 - under), Math.cos(swept) * radius * (1.09 + 0.009 * groove) - 0.015]
  }, 100, 32))

  for (const s of [-1, 1]) {
    head.push(sculpt(look.fur, place, (x, y, z, pigment) => {
      const t = (y + 1) / 2
      const taper = 1.28 - 0.95 * t
      pigment.lerp(ink, clamp((t - 0.75) * 4))
      pigment.lerp(innerEar, clamp((z - 0.55 - 0.24 * t) * 10))
      return [s * (0.59 + 0.32 * t) + x * 0.4 * taper, 0.61 + t * 1.02,
        0.045 + z * 0.23 * taper + t * 0.04]
    }, 32, 24))

    // A swept cream cheek springs out in front of the hair, tapering to a
    // small point. Its root lies inside the pale band on the face.
    plain.push(sculpt(look.light, place, (x, y, z) => {
      const t = (s * x + 1) / 2
      return [s * (0.34 + t * 0.87), -0.34 + 0.17 * t * t + y * (0.24 - 0.19 * t),
        0.73 - 0.56 * t * t + z * (0.12 - 0.08 * t)]
    }, 32, 18))
    const ellipsoid = (x: number, y: number, z: number, scale: V3, color: string, tilt = 0) =>
      P.sphere(R, color, { at: at(s * x, y, z), rot: [0, s * 0.39, s * tilt], scale }, 24)
    // The dark upper lid follows the almond-shaped eye. All layers blink together.
    eyes.push(ellipsoid(0.4, 0.075, 0.865, [0.255, 0.175, 0.067], '#54342F', 0.12),
      ellipsoid(0.4, 0.055, 0.883, [0.241, 0.149, 0.071], '#FFF5E7', 0.12),
      ellipsoid(0.382, 0.06, 0.931, [0.137, 0.145, 0.053], '#895332'),
      ellipsoid(0.377, 0.068, 0.959, [0.099, 0.119, 0.041], '#34252A'),
      ellipsoid(0.345, 0.12, 0.994, [0.044, 0.043, 0.015], '#FFFDF5'))
    plain.push(ellipsoid(0.405, 0.335, 0.814, [0.22, 0.045, 0.04], hair, -0.09))
  }

  plain.push(P.sphere(R, '#493033', { at: at(0, -0.18, 1.132), scale: [0.137, 0.087, 0.085] }),
    P.sphere(R, '#B48370', { at: at(-0.033, -0.15, 1.206), scale: [0.044, 0.015, 0.009] }))

  const mouth = at(0, -0.365, 1.065)
  const smile = (width: number, height: number, offset: number, depth: number, color: string) =>
    sculpt(color, { scale: [R, R, R] }, (x, y, z) =>
      [width * x, offset + height * y + 0.095 * x * x, depth + z * 0.024 - 0.19 * x * x], 32, 16)
  const rest = [smile(0.34, 0.089, 0, 0, '#803B43'), smile(0.315, 0.045, 0.03, 0.019, '#FFF7E7')]

  const tailRoot: V3 = [0, 0.25 * H, -0.12 * H]
  const tail = sculpt(look.fur, { at: tailRoot, scale: [H, H, H] }, (x, y, z, pigment) => {
    const t = (y + 1) / 2
    pigment.lerp(cream, clamp((t - 0.71 + 0.04 * x) * 22))
    const width = 0.15 * (1 - 0.5 * t)
    return [0.44 * Math.sin(t * 1.42) + width * x, -0.045 + 0.44 * t ** 1.7 - 0.055 * x,
      -0.21 * t + width * z]
  })
  return { head, plain, eyes, rest, mouth, tail, tailRoot }
}
