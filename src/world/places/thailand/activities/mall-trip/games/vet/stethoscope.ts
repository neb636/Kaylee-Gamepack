// The stethoscope the way a vet uses it. Only the chest piece goes to the patient. The two gold ear tips sit in KAYLEE's
// ears, a pink tube runs from each down to a Y on her chest, and one long tube goes on to the chest piece in her hand, so
// the patient never wears it (on the tray the whole thing is a toy to grab: tools.ts). It pops onto her while she
// holds the chest piece and pops off when it's back on the tray.
import { Group, Vector3, type Object3D } from 'three'
import type { Rig } from '../../../../characters/animal'
import type { Bag } from '../../../../engine/dispose'
import { P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { Cord } from './cord'

const STEEL = '#D8D2E6'
const HOSE = PAL.hotpink
const POP = 0.28
/** Meters of tube between her chest and the chest piece (the exam table is 1.3 m wide). */
const HOSE_LENGTH = 0.9

/** Overshoots a little on the way to 1 (a pop). */
const easeOutBack = (k: number) => 1 + 2.70158 * (k - 1) ** 3 + 1.70158 * (k - 1) ** 2

export class Stethoscope {
  /** One gold ear tip per ear (on her head), and the Y on her chest. */
  private tips: Group[] = []
  private joint: Group
  private ears: Cord[]
  private hose: Cord
  /** How far on she has it (0 off, 1 on). */
  private k = 0
  /** Where each ear's tube passes on its way down (head-local), and the Y (body-local). */
  private earAt: Vector3[] = []
  private waypoints: Vector3[][] = []
  private yAt: Vector3
  private pts = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
  private v = new Vector3()
  /** The Y on her chest in the world (updated while she has it on). */
  readonly y = new Vector3()

  constructor(parent: Object3D, private rig: Rig, bag: Bag) {
    const { R, headY } = rig.face
    const H = rig.height
    for (const s of [-1, 1]) {
      // On the sides of her head, a little forward of her mane's side locks so they show.
      const at = new Vector3(s * 0.98 * R, headY - 0.12 * R, 0.3 * R)
      this.earAt.push(at)
      this.waypoints.push([new Vector3(s * 1.12 * R, headY - 0.7 * R, 0.3 * R), new Vector3(s * 0.42 * R, headY - 1.05 * R, 0.58 * R)])
      const tip = solid(P.sphere(0.17 * R, PAL.gold), bag, 2.5)
      tip.position.copy(at)
      tip.visible = false
      rig.head.add(tip)
      this.tips.push(tip)
    }
    this.yAt = new Vector3(0, 0.465 * H, 0.168 * H)
    this.joint = solid(P.sphere(0.026 * H, STEEL), bag, 2.5)
    this.joint.position.copy(this.yAt)
    this.joint.visible = false
    rig.body.add(this.joint)
    this.ears = [new Cord(bag, 0.011 * H, HOSE), new Cord(bag, 0.011 * H, HOSE)]
    this.hose = new Cord(bag, 0.013 * H, HOSE)
    parent.add(...this.ears.map((c) => c.group), this.hose.group)
  }

  /**
   * `end` is where the long tube joins the chest piece (world), or null when she isn't using it. Returns 1 the frame it
   * goes on (a pop), -1 the frame it comes off. Call after her pose is up to date this frame.
   */
  update(dt: number, end: Vector3 | null): number {
    const was = this.k
    this.k = Math.min(1, Math.max(0, this.k + (end ? dt : -dt) / POP))
    const event = was === 0 && this.k > 0 ? 1 : was > 0 && this.k === 0 ? -1 : 0
    const on = !!end
    const s = this.k <= 0 ? 0.0001 : on ? easeOutBack(this.k) : this.k
    for (const g of [...this.tips, this.joint]) {
      g.visible = this.k > 0
      g.scale.setScalar(Math.max(0.0001, s))
    }
    // The tubes only make sense with the chest piece to reach, and wait for the tips to have popped on.
    const hoses = !!end && this.k > 0.45
    for (const c of [...this.ears, this.hose]) c.group.visible = hoses
    if (!end) return event
    const { head, body, root } = this.rig
    root.updateMatrixWorld(true)
    const y = body.localToWorld(this.y.copy(this.yAt))
    if (!hoses) return event
    // Each ear's tube: from the ear tip, down past the cheek and jaw, to the Y.
    this.ears.forEach((c, i) => {
      const [a, b] = this.waypoints[i]
      this.pts[0].copy(head.localToWorld(this.v.copy(this.earAt[i])))
      this.pts[1].copy(head.localToWorld(this.v.copy(a)))
      this.pts[2].copy(head.localToWorld(this.v.copy(b)))
      this.pts[3].copy(y)
      c.update(this.pts)
    })
    // The long tube has a fixed length: it hangs slack when the chest piece is near her and goes taut as she reaches
    // (a little toward the camera, so it hangs in front of her).
    const d = y.distanceTo(end)
    const slack = Math.max(0, HOSE_LENGTH - d)
    const sag = Math.min(0.4, Math.max(0.03, Math.sqrt((3 * d * slack) / 8)))
    const hang = [1 / 3, 2 / 3].map((u) => y.clone().lerp(end, u).add(new Vector3(0, -sag * 4 * u * (1 - u), 0.04)))
    this.hose.update([y, ...hang, end])
    return event
  }
}
