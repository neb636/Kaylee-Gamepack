// A bendy hose in the house's look (flat color, ink outline), for the stethoscope: a smooth tube through a few points
// that is rebuilt every frame in place, so it stretches from Kaylee's ears and chest to wherever she holds the chest
// piece. One geometry feeds both the toon mesh and its outline (no welding needed: a tube's normals are already smooth).
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Group, Mesh, Vector3 } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { outlineMaterial } from '../../../../engine/outline'
import { toon } from '../../../../engine/toon'

const SEG = 18
const SIDES = 6
const up = new Vector3(0, 0, 1)
const alt = new Vector3(0, 1, 0)

export class Cord {
  readonly group = new Group()
  private geo = new BufferGeometry()
  private pos: Float32Array
  private nor: Float32Array
  private curve = new CatmullRomCurve3([], false, 'catmullrom', 0.5)
  private p = new Vector3()
  private t = new Vector3()
  private n = new Vector3()
  private b = new Vector3()

  constructor(bag: Bag, private radius: number, color: string, px = 2.5) {
    const verts = (SEG + 1) * SIDES
    this.pos = new Float32Array(verts * 3)
    this.nor = new Float32Array(verts * 3)
    const rgb = new Float32Array(verts * 3)
    const c = new Color(color)
    for (let i = 0; i < verts; i++) rgb.set([c.r, c.g, c.b], i * 3)
    const index: number[] = []
    for (let i = 0; i < SEG; i++)
      for (let j = 0; j < SIDES; j++) {
        const a = i * SIDES + j
        const b = i * SIDES + ((j + 1) % SIDES)
        const c2 = (i + 1) * SIDES + j
        const d = (i + 1) * SIDES + ((j + 1) % SIDES)
        index.push(a, b, c2, b, d, c2)
      }
    this.geo.setAttribute('position', new BufferAttribute(this.pos, 3))
    this.geo.setAttribute('normal', new BufferAttribute(this.nor, 3))
    this.geo.setAttribute('color', new BufferAttribute(rgb, 3))
    this.geo.setIndex(index)
    bag.add(this.geo)
    const mesh = new Mesh(this.geo, toon('#ffffff', true))
    const hull = new Mesh(this.geo, outlineMaterial(px))
    // Its bounds change every frame, so never cull it.
    mesh.frustumCulled = hull.frustumCulled = false
    this.group.add(mesh, hull)
    this.group.visible = false
  }

  /** Lays the hose through these world points (at least two). */
  update(points: Vector3[]) {
    this.curve.points = points
    for (let i = 0; i <= SEG; i++) {
      const u = i / SEG
      this.curve.getPoint(u, this.p)
      this.curve.getTangent(u, this.t)
      // A ring's frame: a fixed "toward the camera" reference, so the rings never twist along the way.
      const ref = Math.abs(this.t.dot(up)) > 0.95 ? alt : up
      this.n.copy(ref).addScaledVector(this.t, -ref.dot(this.t)).normalize()
      this.b.crossVectors(this.t, this.n)
      for (let j = 0; j < SIDES; j++) {
        const a = (j / SIDES) * Math.PI * 2
        const nx = this.n.x * Math.cos(a) + this.b.x * Math.sin(a)
        const ny = this.n.y * Math.cos(a) + this.b.y * Math.sin(a)
        const nz = this.n.z * Math.cos(a) + this.b.z * Math.sin(a)
        const k = (i * SIDES + j) * 3
        this.nor[k] = nx
        this.nor[k + 1] = ny
        this.nor[k + 2] = nz
        this.pos[k] = this.p.x + nx * this.radius
        this.pos[k + 1] = this.p.y + ny * this.radius
        this.pos[k + 2] = this.p.z + nz * this.radius
      }
    }
    this.geo.attributes.position.needsUpdate = true
    this.geo.attributes.normal.needsUpdate = true
  }
}
