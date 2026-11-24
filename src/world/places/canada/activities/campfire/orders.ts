// The roast's orders (Flashlight Statues' side verb): everyone round the fire wants a marshmallow, and each one shows
// which kind in a wish bubble over their head, a picture, no words: a white squishy one, a golden one, a burnt black
// one with a little flame, or Monty's giant one. While the marshmallow she holds is the kind they want, their bubble
// glows and bounces ("now!"). Given the right one, the bubble turns into a gold star and floats up.
import { Group, Mesh, MeshBasicMaterial, type PerspectiveCamera, Vector3 } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P } from '../../../../engine3d/geo'
import { makeHull } from '../../../../engine3d/outline'
import { clamp, damp } from '../../../../../sdk/math'
import type { Want } from './roast'

const MALLOW: Record<Want, string> = { squishy: '#FFF3DC', golden: '#E8B15A', burnt: '#3A2E36', giant: '#F2CF8A' }
const LINE = '#8E5FB8'

/** A wish bubble over somebody's head. */
export class OrderBubble {
  readonly root = new Group()
  private card = new Group()
  private glowMat: MeshBasicMaterial
  private starMat: MeshBasicMaterial
  private star: Mesh
  private glow: Mesh
  /** 0 hidden .. 1 out; since it came; the star's flight (seconds, -1 none). */
  private out = 0
  private goal = 0
  private t = 0
  private starT = -1
  private ready = 0

  constructor(
    bag: Bag,
    readonly want: Want,
  ) {
    const basic = (o: { vertexColors?: boolean; color?: string; transparent?: boolean }) => bag.add(new MeshBasicMaterial({ fog: false, ...o }))
    // The cloud: round puffs, flat-ish, white with a lavender line; two little puffs trailing down toward the head.
    const cloudGeo = bag.add(
      merge([
        P.sphere(0.2, '#FFFFFF', { scale: [1.25, 1, 0.42] }, 20),
        P.sphere(0.13, '#FFFFFF', { at: [-0.19, 0.06, 0], scale: [1, 1, 0.42] }, 16),
        P.sphere(0.13, '#FFFFFF', { at: [0.2, 0.05, 0], scale: [1, 1, 0.42] }, 16),
        P.sphere(0.12, '#FFFFFF', { at: [0.02, 0.15, 0], scale: [1.2, 1, 0.42] }, 16),
        P.sphere(0.05, '#FFFFFF', { at: [-0.1, -0.25, 0], scale: [1, 1, 0.5] }, 10),
        P.sphere(0.03, '#FFFFFF', { at: [-0.16, -0.33, 0], scale: [1, 1, 0.5] }, 8),
      ]),
    )
    const cloud = new Mesh(cloudGeo, basic({ vertexColors: true }))
    const hull = makeHull(cloudGeo, 2.4, LINE)
    bag.add(hull.geometry)
    this.card.add(cloud, hull)
    // What they want: a marshmallow, tipped toward us so its top shows (a flame on the burnt one).
    const big = want === 'giant' ? 1.45 : 1
    const parts = [P.cyl(0.075 * big, 0.075 * big, 0.12 * big, MALLOW[want], { at: [0, 0.02, 0.1], rot: [0.45, 0, 0] }, 18)]
    if (want === 'burnt') parts.push(P.cone(0.04, 0.11, '#FF7A3A', { at: [0.0, 0.14, 0.12] }, 10), P.cone(0.022, 0.07, '#FFE08A', { at: [0.0, 0.12, 0.14] }, 8))
    if (want === 'giant') parts.push(P.cyl(0.02, 0.02, 0.18, '#9A6A44', { at: [0.12, -0.08, 0.1], rot: [0, 0, 0.9] }, 6))
    const mallowGeo = bag.add(merge(parts))
    const mallow = new Mesh(mallowGeo, basic({ vertexColors: true }))
    const mHull = makeHull(mallowGeo, 2, '#3A2E36')
    bag.add(mHull.geometry)
    this.card.add(mallow, mHull)
    // The glow behind it while her marshmallow is the right kind.
    this.glowMat = basic({ color: '#FFE27A', transparent: true })
    this.glowMat.opacity = 0
    this.glowMat.depthWrite = false
    this.glow = new Mesh(bag.add(P.sphere(0.32, '#ffffff', { scale: [1.2, 1, 0.1] }, 20)), this.glowMat)
    this.glow.position.z = -0.06
    this.glow.renderOrder = -1
    this.card.add(this.glow)
    this.root.add(this.card)
    // The star it turns into.
    const pts: [number, number][] = []
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5
      const r = i % 2 ? 0.075 : 0.18
      pts.push([Math.cos(a) * r, Math.sin(a) * r])
    }
    this.starMat = basic({ color: '#FFD447', transparent: true })
    const starGeo = bag.add(P.prism(pts, 0.05, '#ffffff'))
    this.star = new Mesh(starGeo, this.starMat)
    const sHull = makeHull(starGeo, 2, '#C98A1A')
    bag.add(sHull.geometry)
    this.star.add(sHull)
    this.star.visible = false
    this.root.add(this.star)
    this.root.visible = false
    this.root.renderOrder = 6
  }

  /** It pops up over their head. */
  show() {
    this.goal = 1
    this.t = 0
    this.starT = -1
    this.card.visible = true
    this.star.visible = false
    this.root.visible = true
  }
  /** They got what they wanted: it turns into a gold star and floats up. */
  starred() {
    this.goal = 0
    this.starT = 0
    this.star.visible = true
    this.card.visible = false
  }
  get showing() {
    return this.goal > 0
  }

  /** Every frame: over `head` (its middle in the world), facing the camera; `ready` while her marshmallow is the one. */
  update(dt: number, t: number, camera: PerspectiveCamera, head: Vector3, ready: boolean) {
    this.t += dt
    this.out += (this.goal - this.out) * damp(dt, 10)
    this.ready += ((ready ? 1 : 0) - this.ready) * damp(dt, 8)
    this.root.position.copy(head)
    // (Big: the picture is the instruction.)
    this.root.scale.setScalar(1.25)
    this.root.quaternion.copy(camera.quaternion)
    if (this.starT >= 0) {
      this.starT += dt
      const k = this.starT
      this.star.position.set(0, k * 0.9, 0)
      this.star.rotation.y = k * 7
      this.star.scale.setScalar(0.6 + 0.8 * clamp(k / 0.25))
      this.starMat.opacity = clamp(1.6 - k)
      if (k > 1.6) {
        this.starT = -1
        this.root.visible = false
      }
      return
    }
    if (this.out < 0.01 && this.goal === 0) {
      this.root.visible = false
      return
    }
    // Pops in with a little overshoot; a gentle bob; bigger and bouncing while she holds the right one.
    const pop = this.t < 0.4 ? Math.sin(clamp(this.t / 0.4) * Math.PI) * 0.25 : 0
    const bounce = this.ready * (0.14 + 0.08 * Math.abs(Math.sin(t * 9)))
    this.card.scale.setScalar(Math.max(0.001, this.out * (1 + pop + bounce)))
    this.card.position.y = Math.sin(t * 2 + head.x) * 0.025 + this.ready * Math.abs(Math.sin(t * 9)) * 0.04
    this.card.rotation.z = this.ready * Math.sin(t * 14) * 0.08
    this.glowMat.opacity = this.ready * (0.72 + 0.25 * Math.sin(t * 9))
  }
}
