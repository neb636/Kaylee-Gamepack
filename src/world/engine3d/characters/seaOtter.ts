// Sea otter proportions and markings for the shared chibi rig. Coordinates are in units of body height H or head radius R.
import { Color, QuadraticBezierCurve3, TubeGeometry, Vector3, type BufferGeometry } from 'three'
import { smoothstep } from '../../../sdk/math'
import { bake, P, placeMatrix, type PartOpts, type V3 } from '../geo'
import type { Frame } from './animal'
import type { Look } from './look'

function furShape(look: Look, transform: PartOpts, cream: (x: number, y: number, z: number) => number) {
  const fur = new Color(look.fur)
  const light = new Color(look.light)
  const shade = new Color()
  const shape = P.sphere(1, look.fur, {}, 40)
  const pos = shape.attributes.position
  const color = shape.attributes.color
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    shade.copy(fur).lerp(light, cream(x, y, z))
    color.setXYZ(i, shade.r, shade.g, shade.b)
  }
  return shape.applyMatrix4(placeMatrix(transform))
}

export function seaOtterBody(look: Look, round: V3) {
  const H = look.height
  const body = furShape(look, { at: [0, 0.293 * H, 0], scale: [0.175 * H * round[0], 0.267 * H, 0.177 * H * round[2]] },
    (_x, y, z) => smoothstep(0.5, 0.94, z + y * 0.23) * 0.86)
  const feet = [-1, 1].map((s) => P.sphere(0.09 * H, look.dark, {
    at: [s * 0.103 * H, 0.052 * H, 0.062 * H],
    rot: [0, s * 0.42, 0],
    scale: [0.87, 0.54, 1.44],
  }, 20))
  return [body, ...feet]
}

function curve(from: V3, through: V3, to: V3, width: number, color: string) {
  const path = new QuadraticBezierCurve3(new Vector3(...from), new Vector3(...through), new Vector3(...to))
  return bake(new TubeGeometry(path, 8, width, 5, false), color, {}, true)
}

export function seaOtterHead(look: Look, { R, headY }: Frame) {
  const at = (x: number, y: number, z: number): V3 => [R * x, headY + R * y, R * z]
  const outlined = [furShape(look, { at: at(0, 0, 0), scale: [1.12 * R, 0.96 * R, R] },
    (x, y, z) => smoothstep(0.02, 0.38, 0.31 * z - y + 0.11 * x * x))]
  const plain: BufferGeometry[] = [
    P.sphere(0.44 * R, look.light, { at: at(0, -0.52, 0.64), scale: [1.43, 0.73, 0.71] }, 24),
    P.sphere(0.155 * R, look.dark, { at: at(0, -0.12, 1.022), scale: [1.57, 0.9, 0.77] }, 20),
    P.sphere(0.055 * R, '#9D8077', { at: at(-0.045, -0.071, 1.128), scale: [1.7, 0.54, 0.3] }, 12),
  ]
  const smile: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    outlined.push(P.sphere(0.162 * R, look.fur, { at: at(s * 1.08, 0.37, -0.025), scale: [0.88, 1, 0.68] }, 18))
    plain.push(
      P.sphere(0.101 * R, look.ear ?? look.dark, { at: at(s * 1.12, 0.37, 0.053), scale: [0.72, 0.93, 0.51] }, 14),
      P.sphere(0.37 * R, look.light, { at: at(s * 0.255, -0.285, 0.744), scale: [1.13, 0.7, 0.79] }, 24),
    )
    for (const [x, y, z] of [[0.25, -0.23, 1.03], [0.37, -0.30, 1.028], [0.27, -0.34, 1.032]]) {
      plain.push(P.sphere(0.021 * R, '#967967', { at: at(s * x, y, z) }, 8))
    }
    for (let i = 0; i < 3; i++) {
      const y = -0.27 - 0.06 * i
      plain.push(curve(at(s * (0.38 + 0.016 * i), y, 1.014),
        at(s * 0.83, y + 0.11 - i * 0.08, 1.025),
        at(s * (1.30 - 0.10 * i), y + 0.15 - i * 0.15, 0.87 - i * 0.04), 0.010 * R, '#FFF4E0'))
    }
    smile.push(curve([0, 0.05 * R, 0], [s * 0.105 * R, -0.045 * R, 0.02 * R], [s * 0.19 * R, -0.012 * R, 0.026 * R], 0.014 * R, '#684147'))
  }
  return { outlined, plain, mouth: at(0, -0.52, 0.974), smile }
}

export function seaOtterTail({ height: H, fur }: Look, root: V3) {
  const tail = P.sphere(1, fur, {}, 24)
  const pos = tail.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = (1 + pos.getY(i)) / 2
    pos.setXYZ(i,
      root[0] + H * (pos.getX(i) * (0.13 - 0.09 * t) + 0.10 * t * t),
      root[1] + H * (pos.getZ(i) * (0.054 - 0.03 * t) - 0.125 * t),
      root[2] + H * (0.045 - 0.45 * t))
  }
  tail.computeVertexNormals()
  return tail
}
