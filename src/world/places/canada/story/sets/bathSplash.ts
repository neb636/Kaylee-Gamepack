// Misty's impact pushes up a thin sheet of river water. The uneven lip throws off spray,
// then the sheet collapses and its wake spreads across the pool.
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshPhongMaterial, RingGeometry, SphereGeometry, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { rng } from './bathWater'

const LIFE = 1.9
const GRAVITY = 9.5
const UP = new Vector3(0, 1, 0)
const velocity = new Vector3()

function crest(angle: number) {
  return 0.68 + 0.22 * Math.sin(7 * angle) + 0.13 * Math.sin(11 * angle + 1) + 0.09 * Math.cos(3 * angle)
}

function waterSheet() {
  const segments = 96
  const positions: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  // Cross-section from the submerged foot through the flared wall and over its pale lip.
  const profile = [[0.28, -0.06, '#52b5cd'], [0.46, 0.16, '#70cbdc'], [0.64, 0.62, '#a3e3ec'], [0.82, 1, '#edfaff'], [0.86, 0.96, '#c9eff5']] as const
  for (const [row, [radius, height, tint]] of profile.entries()) {
    const color = new Color(tint)
    for (let i = 0; i < segments; i++) {
      const a = i * Math.PI * 2 / segments
      const r = radius * (1 + 0.07 * Math.sin(5 * a + height) + 0.05 * Math.cos(3 * a))
      positions.push(r * Math.cos(a), height * crest(a), r * Math.sin(a))
      colors.push(color.r, color.g, color.b)
      if (!row) continue
      const lower = (row - 1) * segments
      const j = (i + 1) % segments
      indices.push(lower + i, lower + segments + i, lower + j, lower + j, lower + segments + i, lower + segments + j)
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

interface Drop {
  mesh: Mesh
  origin: Vector3
  launch: Vector3
  delay: number
  radius: number
}

export class BigSplash {
  readonly root = new Group()
  private t = LIFE
  private sheet: Mesh<BufferGeometry, MeshPhongMaterial>
  private drops: Drop[] = []
  private waves: Mesh<RingGeometry, MeshBasicMaterial>[] = []
  private random = rng(5)

  constructor(bag: Bag, private waterY = 0.04) {
    this.root.visible = false
    this.sheet = new Mesh(bag.add(waterSheet()), bag.add(new MeshPhongMaterial({
      vertexColors: true, specular: '#ceeef5', shininess: 75, side: DoubleSide, transparent: true, depthWrite: false,
    })))
    this.root.add(this.sheet)
    const bead = bag.add(new SphereGeometry(1, 10, 8))
    const water = bag.add(new MeshPhongMaterial({ color: '#a7e1ec', specular: '#ffffff', shininess: 90, transparent: true, opacity: 0.85, depthWrite: false }))
    for (let i = 0; i < 36; i++) {
      const mesh = new Mesh(bead, water)
      this.root.add(mesh)
      this.drops.push({ mesh, origin: new Vector3(), launch: new Vector3(), delay: 0, radius: 0 })
    }
    const ring = bag.add(new RingGeometry(0.974, 1, 80))
    for (let i = 0; i < 2; i++) {
      const wave = new Mesh(ring, bag.add(new MeshBasicMaterial({ color: '#d9f5fa', transparent: true, depthWrite: false })))
      wave.rotation.x = -Math.PI / 2
      wave.position.y = 0.012
      this.root.add(wave)
      this.waves.push(wave)
    }
  }

  start(x: number, z: number, size = 1) {
    this.t = 0
    this.root.position.set(x, this.waterY, z)
    this.root.scale.setScalar(size)
    this.root.rotation.y = this.random() * Math.PI * 2
    this.root.visible = true
    for (const [i, d] of this.drops.entries()) {
      const angle = (i + this.random()) * Math.PI * 2 / this.drops.length
      const dx = Math.cos(angle)
      const dz = Math.sin(angle)
      const outward = 0.7 + this.random() * 1.7
      d.delay = 0.07 + this.random() * 0.12
      d.origin.set(dx * 0.46, crest(angle) * 0.5, dz * 0.46)
      d.launch.set(dx * outward, 2.1 + crest(angle) + this.random() * 2, dz * outward)
      d.radius = 0.016 + this.random() ** 2 * 0.051
    }
    this.update(0)
  }

  get on() {
    return this.root.visible
  }

  update(dt: number) {
    if (!this.root.visible) return
    this.t += dt
    const t = this.t
    if (t >= LIFE) {
      this.root.visible = false
      return
    }
    const lift = Math.max(0, 5.6 * t - 6.5 * t * t)
    this.sheet.visible = lift > 0.01
    const spread = 0.55 + 1.15 * t
    this.sheet.scale.set(spread, lift, spread)
    this.sheet.material.opacity = 0.76 * Math.min(1, lift * 2.5)
    for (const d of this.drops) {
      const age = t - d.delay
      const y = d.origin.y + d.launch.y * age - 0.5 * GRAVITY * age * age
      d.mesh.visible = age >= 0 && y > 0
      if (!d.mesh.visible) continue
      d.mesh.position.copy(d.origin).addScaledVector(d.launch, age)
      d.mesh.position.y = y
      velocity.copy(d.launch)
      velocity.y -= GRAVITY * age
      const stretch = 1 + velocity.length() * 0.15
      const width = d.radius / Math.sqrt(stretch)
      d.mesh.scale.set(width, d.radius * stretch, width)
      d.mesh.quaternion.setFromUnitVectors(UP, velocity.normalize())
    }
    for (const [i, wave] of this.waves.entries()) {
      const age = (t - 0.09 - i * 0.34) / 1.45
      wave.visible = age > 0 && age < 1
      if (!wave.visible) continue
      const radius = 0.42 + 2.05 * age * (1.6 - 0.6 * age)
      wave.scale.set(radius, radius * 0.96, 1)
      wave.material.opacity = Math.min(1, age * 10) * (1 - age) ** 2 * 0.7
    }
  }
}
