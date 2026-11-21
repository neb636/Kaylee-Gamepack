// Peekaboo, the green firefly of hide and seek (planning/around-the-world/thailand/samet-story.md): the story's
// firefly (story/firefly.ts) with what this stop needs on top. She heads for a point each frame and turns her face to
// the camera when she hovers; she can be big and bright (out in the open) or dimmed to a tiny glow (hiding); she
// carries a soft green cloud behind her and throws little sparkles when she twinkles, so she reads against Ao Prao's
// pale sand in daylight (the firefly's own halo is made of light, which bright sand swallows). Her halo is drawn
// behind her here, never over her face: in this stop's close shots it would wash out her eyes and cheeks, and Dad's
// face when she sits on his nose. (Dad's cross-eyed face for that moment is the shared silly-face kit's: engine3d/characters/face.ts crossEyes.)
import { AdditiveBlending, BackSide, Color, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, type Camera, type Material, type Object3D } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { Particles } from '../../../../../engine3d/particles'
import { FIREFLIES, Firefly } from '../story/firefly'

export class Peekaboo {
  readonly fly: Firefly
  /** The soft cloud behind her (not made of light: it shows on sand). */
  private cloud: Mesh
  private sparks: Particles
  private goal = new Vector3()
  private rate = 4
  private sizeGoal = 1
  /** How strong the cloud behind her is (1: play, seen from across the beach; less in a film's close shots). */
  private cloudK = 1
  /** A wiggle on the spot (a giggle): seconds left. */
  private wiggleT = 0

  constructor(bag: Bag, parent: Object3D) {
    this.fly = new Firefly('hideseek', bag)
    // Her halo behind her, not over her face (only the far side of each glowing ball is drawn).
    this.fly.root.traverse((o) => {
      const mat = (o as Mesh).material as Material | undefined
      if (mat && mat.blending === AdditiveBlending) mat.side = BackSide
    })
    const mat = bag.add(new MeshBasicMaterial({ color: new Color(FIREFLIES.hideseek.color).lerp(new Color('#12A24A'), 0.6), transparent: true, opacity: 0.5, depthWrite: false, fog: false, side: BackSide }))
    this.cloud = new Mesh(bag.add(new SphereGeometry(0.24, 18, 12)), mat)
    this.cloud.position.set(0, -0.01, -0.04)
    this.cloud.renderOrder = 5
    this.fly.root.add(this.cloud)
    this.sparks = new Particles({ kind: 'spray', count: 140, colors: ['#FFFFFF', '#D8FFC8', '#8CF08C', '#FFF6B8'], gravity: -0.5 }, bag)
    parent.add(this.fly.root, this.sparks.mesh)
  }

  get pos() {
    return this.fly.pos
  }
  /** Puts her somewhere at once (and she stays there until told otherwise). */
  place(p: Vector3) {
    this.fly.place(p.x, p.y, p.z)
    this.goal.copy(p)
  }
  /** Where she heads from now on (quick at `rate` 8, lazy at 2). Call it every frame to have her follow someone. */
  go(p: Vector3, rate = 4) {
    this.goal.copy(p)
    this.rate = rate
  }
  /** Out in the open (`size`: 1 is the story's 30 cm firefly) or dimmed to a tiny glow (`bright` near 0); `cloud`:
   *  how strong the green cloud behind her is. */
  show(size: number, bright = 1, cloud = 1) {
    this.sizeGoal = size
    this.fly.glowGoal = bright
    this.cloudK = cloud
  }
  /** At once, no easing (a deep link, a film's cut). */
  snap(size: number, bright = 1, cloud = 1) {
    this.show(size, bright, cloud)
    this.fly.size = size
    this.fly.glow = bright
  }
  /** A bright pulse of her halo: for the beach camera, far away. (Up close it whites out the picture: sparkle().) */
  flash() {
    this.fly.flash()
  }
  /** A puff of little sparkles round her. */
  sparkle(n = 14) {
    const p = this.fly.pos
    const s = this.fly.size
    this.sparks.burst(p.x, p.y, p.z, n, 0.9 * s, 0.7 * s, 0.07 * s)
  }
  /** A happy wiggle on the spot. */
  wiggle(s = 0.6) {
    this.wiggleT = s
  }
  /** How bright she is now (QA). */
  get glow() {
    return this.fly.glow
  }

  update(dt: number, t: number, camera: Camera) {
    const f = this.fly
    f.size += (this.sizeGoal - f.size) * Math.min(1, dt * 6)
    this.wiggleT = Math.max(0, this.wiggleT - dt)
    const w = this.wiggleT > 0 ? Math.sin(t * 34) * 0.07 * f.size * Math.min(1, this.wiggleT * 4) : 0
    tmp.copy(this.goal)
    tmp.y += Math.abs(w)
    f.fly(tmp, dt, this.rate)
    // Hovering: her face to the camera, so her eyes and cheeks show.
    if (f.speed < 1.2) f.faceToward(camera.position.x, camera.position.z, dt)
    f.root.rotation.z = w * 2.5
    f.update(dt, t)
    ;(this.cloud.material as MeshBasicMaterial).opacity = 0.55 * this.cloudK * Math.min(1, f.glow * 1.2)
    this.sparks.update(dt)
  }
}
const tmp = new Vector3()
