// Fur markings are vertex colors on the sculpt, so they wrap around the cheeks and tail.
import { Color } from 'three'
import { smoothstep } from '../../../sdk/math'
import { P, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

export function raccoonHead(look: Look, { R, headY }: Frame) {
  const at = (x: number, y: number, z: number): V3 => [x * R, headY + y * R, z * R]
  const skull = P.sphere(1, look.fur, {}, 72)
  const { position, color } = skull.attributes
  const fur = new Color(look.fur), cream = new Color(look.light), mask = new Color(look.dark)
  const shade = new Color()
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    const angle = Math.abs(Math.atan2(x, z))
    // An arched mask above each eye sweeps down toward the cheek tip.
    const brow = 0.37 * Math.exp(-((angle - 0.45) ** 2) / 0.25) - 0.14 * angle
    const lower = -0.15 - 0.20 * Math.sin(angle)
    const outer = 1 - smoothstep(1.33, 1.70, angle)
    const bridge = smoothstep(0.05, 0.15, angle)
    const band = smoothstep(lower - 0.04, lower + 0.04, y) * (1 - smoothstep(brow - 0.03, brow + 0.03, y))
    const bib = (1 - smoothstep(brow + 0.16, brow + 0.27, y)) * (1 - smoothstep(1.55, 1.94, angle))
    shade.copy(fur).lerp(cream, bib).lerp(mask, band * bridge * outer)
    color.setXYZ(i, shade.r, shade.g, shade.b)
    const cheek = Math.exp(-((y + 0.25) ** 2) / 0.14)
    position.setXYZ(i, x * (1.01 + 0.24 * cheek), y * 0.93, z * 0.97)
  }
  skull.computeVertexNormals()
  const outlined = [skull.scale(R, R, R).translate(0, headY, 0)]
  const plain = []
  for (const side of [-1, 1]) {
    // Taper the upper half of a rounded ear, with a pale rim around the dark velvet center.
    const ear = P.sphere(1, look.light, {}, 32)
    const { position: p, color: c } = ear.attributes
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i)
      shade.copy(cream).lerp(mask, smoothstep(0.48, 0.68, z))
      c.setXYZ(i, shade.r, shade.g, shade.b)
      p.setXYZ(i, x * (1 - 0.38 * y), y, z)
    }
    ear.computeVertexNormals()
    outlined.push(ear.scale(0.245 * R, 0.37 * R, 0.16 * R).rotateZ(-side * 0.48).translate(...at(side * 0.70, 0.77, 0)))
    plain.push(P.sphere(0.27 * R, look.light, { at: at(side * 0.15, -0.22, 0.91), scale: [1.12, 0.77, 0.90] }, 24))
    for (const [x, y] of [[0.22, -0.20], [0.30, -0.25], [0.19, -0.28]]) {
      plain.push(P.sphere(0.017 * R, '#83766D', { at: at(side * x, y, x > 0.25 ? 1.115 : 1.14) }, 8))
    }
  }
  plain.push(P.sphere(0.145 * R, '#332B2B', { at: at(0, -0.115, 1.115), scale: [1.13, 0.78, 0.85] }, 24))
  plain.push(P.sphere(0.032 * R, '#BDADA0', { at: at(-0.045, -0.066, 1.214), scale: [1.25, 0.52, 0.50] }))
  return { outlined, plain }
}

export function raccoonTail(look: Look, root: V3) {
  const brush = P.sphere(1, look.fur, {}, 48)
  const { position, color } = brush.attributes
  const silver = new Color(look.fur).lerp(new Color(look.light), 0.54)
  const charcoal = new Color(look.dark), shade = new Color()
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), z = position.getZ(i)
    const t = (position.getY(i) + 1) / 2
    // Sweep the brush outward from the rump and curl the tip up beside the hip.
    const angle = -0.22 + 1.62 * t
    const width = x * (0.084 + 0.022 * t)
    const dx = 0.68 * (Math.sin(angle) - Math.sin(-0.22)) / 1.62
    const dy = 0.68 * (Math.cos(-0.22) - Math.cos(angle)) / 1.62
    position.setXYZ(i, root[0] + look.height * (dx + width * Math.sin(angle)),
      root[1] + look.height * (dy - width * Math.cos(angle)),
      root[2] + look.height * (z * 0.09 - 0.13 * t))
    shade.copy(silver).lerp(charcoal, smoothstep(-0.25, 0.25, Math.cos(t * Math.PI * 6)))
    color.setXYZ(i, shade.r, shade.g, shade.b)
  }
  brush.computeVertexNormals()
  return brush
}
