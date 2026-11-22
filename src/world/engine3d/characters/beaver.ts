// The beaver's markings follow the toy's surfaces, including the bent paddle.
import { BufferGeometry, Float32BufferAttribute, RingGeometry, Vector3 } from 'three'
import { bake, P, type V3 } from '../geo'

export function bellyPatch(height: number, width: number, depth: number, color: string) {
  const patch = new RingGeometry(0, 1, 48, 12)
  const pos = patch.attributes.position
  const normals = patch.attributes.normal
  const n = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i) * 0.10
    const y = 0.314 + pos.getY(i) * 0.111
    // Front of the torso capsule, including the round ends above and below its cylinder.
    const dy = y - Math.max(0.29, Math.min(0.39, y))
    const z = Math.sqrt(0.155 ** 2 - x * x - dy * dy)
    pos.setXYZ(i, height * width * x, height * y, height * depth * (z + 0.0015))
    n.set(x / width, dy, z / depth).normalize()
    normals.setXYZ(i, n.x, n.y, n.z)
  }
  return bake(patch, color, {}, true)
}

export function beaverTail(height: number, root: V3, color: string) {
  // A flattened ovoid swept from the rump to a raised, rounded tip. Rolling its
  // broad face toward the side keeps the paddle visible when she turns in profile.
  const point = (x: number, y: number, z: number): V3 => {
    const t = (y + 1) / 2
    const across = x * (0.074 + 0.105 * t)
    const thick = z * 0.042
    return [
      root[0] + height * (0.80 * across - 0.60 * thick - 0.25 * t * t),
      root[1] + height * (0.60 * across + 0.80 * thick - 0.072 * Math.sin(Math.PI * t) + 0.155 * t * t),
      root[2] - height * t * 0.38,
    ]
  }
  const blade = P.sphere(1, color, {}, 48)
  const pos = blade.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, ...point(pos.getX(i), pos.getY(i), pos.getZ(i)))
  blade.computeVertexNormals()

  // Narrow diamond markings lie flush on each face, ending before the rounded rim.
  const vertices: number[] = []
  const index: number[] = []
  for (const face of [-1, 1]) for (const slope of [-1, 1]) {
    for (let row = -3; row <= 3; row++) {
      const offset = row * 0.235
      const edge = Math.sqrt(0.90 ** 2 - (Math.abs(offset) + 0.020) ** 2)
      for (let i = 0; i <= 20; i++) {
        const along = edge * (2 * i / 20 - 1)
        const pair = vertices.length / 3
        for (const side of [-1, 1]) {
          const cross = offset + side * 0.020
          const x = (along - slope * cross) * Math.SQRT1_2
          const y = (slope * along + cross) * Math.SQRT1_2
          const z = face * (Math.sqrt(1 - x * x - y * y) + 0.024)
          vertices.push(...point(x, y, z))
        }
        if (i > 0) {
          if (face > 0) index.push(pair - 2, pair, pair - 1, pair - 1, pair, pair + 1)
          else index.push(pair - 2, pair - 1, pair, pair - 1, pair + 1, pair)
        }
      }
    }
  }
  const marks = new BufferGeometry()
  marks.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  marks.setIndex(index)
  marks.computeVertexNormals()
  return [blade, bake(marks, '#4A3028', {}, true)]
}
