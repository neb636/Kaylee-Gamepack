// Her flashlight (Flashlight Statues): where her finger goes, the light goes. A pink toy flashlight in the bottom
// corner of the screen points at a soft disc of warm light on the ground, with a faint beam between them, and a spot
// light from its lens lights everything inside the beam (the ground, the trees, whoever is standing there). Whatever is
// inside the beam is lit: `covers()` says so, by the angle from the camera, so what she sees lit is what counts.
// The light follows her finger (a little behind it, like a real flashlight, and a little above it so her fingertip
// doesn't cover what she finds) and stays where she left it. The disc's size and how it follows are feel knobs.
import { AdditiveBlending, BufferAttribute, CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, Object3D, PlaneGeometry, Quaternion, SpotLight, Vector3, type PerspectiveCamera } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P } from '../../../../engine3d/geo'
import { makeHull } from '../../../../engine3d/outline'
import { glowTexture } from '../../story/sets/campfire'

/** How far the camera is from the middle of the clearing: the knob's radius is the disc's size there. */
const MID = 6.6
/** Further than this, the light is up in the trees (no disc on the ground). */
const FAR = 13

const tmp = new Vector3()
const tmp2 = new Vector3()
const up = new Vector3(0, 1, 0)
const q = new Quaternion()

export interface FlashlightKnobs {
  radius: number
  follow: number
  lift: number
}

/** The toy flashlight itself: a pink body, a lavender head with a glowing lens, a button and a heart. Its lens points
 *  along +z; its origin is the middle of the lens. */
function flashlightToy(bag: Bag) {
  const g = new Group()
  const body = merge([
    P.cyl(0.034, 0.03, 0.17, '#FF8FB8', { at: [0, 0, -0.14], rot: [Math.PI / 2, 0, 0] }, 16),
    P.cyl(0.05, 0.036, 0.06, '#D9CCFF', { at: [0, 0, -0.035], rot: [-Math.PI / 2, 0, 0] }, 18),
    P.torus(0.05, 0.008, '#B9A6F5', { at: [0, 0, -0.005] }),
    // Grip rings, the switch on top, a little white heart on the side, the strap loop at the end.
    ...[-0.12, -0.16, -0.2].map((z) => P.torus(0.032, 0.005, '#FF6FA6', { at: [0, 0, z] })),
    P.rbox(0.03, 0.016, 0.045, 0.006, '#FFFFFF', { at: [0, 0.034, -0.1] }),
    P.sphere(0.012, '#FFFFFF', { at: [0.032, 0.006, -0.15], scale: [0.4, 1, 1] }, 8),
    P.sphere(0.012, '#FFFFFF', { at: [0.032, 0.006, -0.135], scale: [0.4, 1, 1] }, 8),
    P.torus(0.018, 0.005, '#B9A6F5', { at: [0, 0, -0.235], rot: [0, Math.PI / 2, 0] }),
  ])
  const mesh = new Mesh(bag.add(body), bag.add(new MeshBasicMaterial({ vertexColors: true, fog: false })))
  g.add(mesh)
  const hull = makeHull(body, 2.5)
  bag.add(hull.geometry)
  g.add(hull)
  // The lens: glows warm when it's on, grey glass when it's off.
  const lensMat = bag.add(new MeshBasicMaterial({ color: '#FFF4C8', fog: false }))
  const lens = new Mesh(bag.add(P.cyl(0.042, 0.042, 0.006, '#ffffff', { rot: [Math.PI / 2, 0, 0] }, 18)), lensMat)
  lens.position.z = -0.002
  g.add(lens)
  return { group: g, lensMat }
}

export class Flashlight {
  /** On (1) or off (0), easing. */
  power = 1
  private powerGoal = 1
  /** Where her finger asks the light to be (screen px), and where it is now. */
  readonly aim = { x: 0, y: 0 }
  readonly at = { x: 0, y: 0 }
  /** The middle of the light in the world, and whether that's on the ground (else up in the trees or the sky). */
  readonly target = new Vector3()
  onGround = true
  /** Half the beam's angle (radians). */
  half = 0.12
  readonly spot: SpotLight
  readonly toy: Group
  private lensMat: MeshBasicMaterial
  private disc: Mesh
  private core: Mesh
  private cone: Mesh
  private coneMat: MeshBasicMaterial
  private placed = false
  /** Where the toy sits on screen (-1..1 across and up) and how far in front of the camera (m). */
  corner = { x: 0.66, y: -0.66, d: 1.15 }

  constructor(
    scene: Object3D,
    bag: Bag,
    private knobs: FlashlightKnobs,
  ) {
    const glow = glowTexture(bag)
    this.disc = new Mesh(bag.add(new PlaneGeometry(1, 1)), bag.add(new MeshBasicMaterial({ map: glow, color: '#FFE9B8', transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false, fog: false })))
    this.disc.rotation.x = -Math.PI / 2
    this.disc.renderOrder = 4
    this.core = new Mesh(bag.add(new PlaneGeometry(1, 1)), bag.add(new MeshBasicMaterial({ map: glow, color: '#FFF8E6', transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false, fog: false })))
    this.core.rotation.x = -Math.PI / 2
    this.core.renderOrder = 5
    // The beam: an open cone from the lens (y 0) to the light (y 1), faint, brightest a little way out of the lens.
    const geo = new CylinderGeometry(1, 0.05, 1, 28, 6, true)
    geo.translate(0, 0.5, 0)
    const pos = geo.attributes.position
    const col = new Float32Array(pos.count * 4)
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const a = y < 0.15 ? (y / 0.15) * 0.9 : 0.9 - (y - 0.15) * 0.8
      col.set([1, 0.95, 0.82, Math.max(0, a)], i * 4)
    }
    geo.setAttribute('color', new BufferAttribute(col, 4))
    this.coneMat = bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.16, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, fog: false }))
    this.cone = new Mesh(bag.add(geo), this.coneMat)
    this.cone.renderOrder = 6
    this.cone.frustumCulled = false
    this.spot = new SpotLight('#FFF1D6', 0, 0, 0.3, 0.45, 0)
    const toy = flashlightToy(bag)
    this.toy = toy.group
    this.lensMat = toy.lensMat
    this.toy.renderOrder = 10
    scene.add(this.disc, this.core, this.cone, this.spot, this.spot.target, this.toy)
  }

  /** Her finger is here (screen px): the light goes there (`lift`: a little above her fingertip on a touch screen). */
  point(x: number, y: number, lift = true) {
    this.aim.x = x
    this.aim.y = y - (lift ? this.knobs.lift : 0)
    if (!this.placed) this.snap()
  }
  /** Straight there, no swing (a section link's start). */
  snap() {
    this.placed = true
    this.at.x = this.aim.x
    this.at.y = this.aim.y
  }
  /** Click: on (true) or off. */
  set(on: boolean) {
    this.powerGoal = on ? 1 : 0
  }
  get on() {
    return this.powerGoal > 0
  }

  /** Every frame (after the camera has moved): the light swings after her finger, the beam and the toy follow. */
  update(dt: number, camera: PerspectiveCamera, w: number, h: number) {
    this.power += (this.powerGoal - this.power) * Math.min(1, dt * 14)
    const f = 1 - Math.exp(-dt * this.knobs.follow)
    this.at.x += (this.aim.x - this.at.x) * f
    this.at.y += (this.aim.y - this.at.y) * f
    const cam = camera.position
    this.half = Math.atan(this.knobs.radius / MID)
    // Her finger's ray: onto the ground, or (up in the trees, the sky) a way out along it.
    const dir = tmp.set((this.at.x / w) * 2 - 1, -(this.at.y / h) * 2 + 1, 0.5).unproject(camera).sub(cam).normalize()
    const t = dir.y < -0.02 ? -cam.y / dir.y : Infinity
    this.onGround = t < FAR
    this.target.copy(cam).addScaledVector(dir, Math.min(t, FAR * 0.85))
    // The toy, in the bottom corner, pointing at the light.
    const lens = tmp2.set(this.corner.x, this.corner.y, 0.5).unproject(camera).sub(cam).normalize().multiplyScalar(this.corner.d).add(cam)
    this.toy.position.copy(lens)
    this.toy.lookAt(this.target)
    this.lensMat.color.set(this.power > 0.5 ? '#FFF4C8' : '#8E8AA8')
    const p = this.power
    const on = p > 0.02
    // The disc where it lands (and a hot middle), sized to the beam there.
    const dist = cam.distanceTo(this.target)
    const r = dist * Math.tan(this.half)
    this.disc.visible = this.core.visible = on && this.onGround
    this.disc.position.set(this.target.x, 0.06, this.target.z)
    this.disc.scale.setScalar(r * 2.7)
    this.core.position.copy(this.disc.position)
    this.core.scale.setScalar(r * 1.5)
    ;(this.disc.material as MeshBasicMaterial).opacity = 0.42 * p
    ;(this.core.material as MeshBasicMaterial).opacity = 0.26 * p
    // The beam, from the lens to the light.
    this.cone.visible = on
    const len = lens.distanceTo(this.target)
    this.cone.position.copy(lens)
    this.cone.quaternion.copy(q.setFromUnitVectors(up, tmp.copy(this.target).sub(lens).normalize()))
    this.cone.scale.set(r, len, r)
    this.coneMat.opacity = 0.14 * p
    // The spot light from the lens (no fall-off with distance: what's in the beam is lit, near or far).
    this.spot.position.copy(lens)
    this.spot.target.position.copy(this.target)
    this.spot.angle = Math.min(1.2, Math.atan(r / Math.max(0.5, len)) * 1.18)
    this.spot.intensity = 3.1 * p
  }

  /** Is this point (with a body `r` meters round) inside the beam, as the camera sees it? */
  covers(camera: PerspectiveCamera, p: Vector3, r = 0.2) {
    if (this.power < 0.5) return false
    const cam = camera.position
    const a = tmp.copy(p).sub(cam)
    const d = a.length()
    const b = tmp2.copy(this.target).sub(cam).normalize()
    const ang = Math.acos(Math.min(1, a.dot(b) / Math.max(1e-6, d)))
    return ang < this.half + Math.atan(r / Math.max(0.3, d)) * 0.45
  }
  /** How near the beam is to a point (0 on it .. 1 at `rings` beam-widths off). */
  near(camera: PerspectiveCamera, p: Vector3, rings = 2.2) {
    const cam = camera.position
    const a = tmp.copy(p).sub(cam).normalize()
    const b = tmp2.copy(this.target).sub(cam).normalize()
    const ang = Math.acos(Math.min(1, a.dot(b)))
    return Math.min(1, ang / (this.half * rings))
  }
}
