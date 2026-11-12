// An islander in a story (samet-story.md): the family's Member rig (breathing, blinking, a mouth that moves with their
// own voice, hops and waves) plus a waddling walk and the faces a story needs: a droop when the fireflies are gone, a
// gasp, a big happy squint. The gecko fire dancers Tuk and Kae are made here; a stop can make its own islander the
// same way (`new Islander('otter', 'The jet ski man', JETSKI_MAN, bag, 'otter')`).
import { Vector3 } from 'three'
import { bell } from '../../../../../../sdk'
import type { Look } from '../../../../../engine3d/characters/look'
import type { Bag } from '../../../../../engine3d/dispose'
import { Member } from '../../../characters/member'
import { FIRE_DANCERS } from '../cast'

const deg = Math.PI / 180

/** A face pulled for a moment (or held: `sad` stays until `cheer()`). */
export type Face = 'sad' | 'wow' | 'happy'

export class Islander {
  readonly m: Member
  private walk: { from: Vector3; to: Vector3; t: number; dur: number; face: number; ground: (x: number, z: number) => number } | null = null
  private face: { kind: Face; t: number; hold: boolean } | null = null
  /** Drooping (0..1): head down, arms hanging, a slow sway. */
  private droop = 0
  private droopGoal = 0
  private drooped = false

  /** `voice`: their speaker in cast.json (their mouth moves when that voice plays). */
  constructor(id: string, name: string, look: Look, bag: Bag, voice?: string) {
    this.m = new Member({ id, name, who: name, height: look.height, spot: null, pitch: 220 }, bag, look, voice)
    this.m.root.userData.pick = id
  }
  get root() {
    return this.m.root
  }
  get pos() {
    return this.m.root.position
  }
  /** Stands them somewhere (`face` in degrees, like every character). */
  place(x: number, y: number, z: number, face: number) {
    this.walk = null
    this.m.place(x, y, z, face)
  }
  /** Waddles to a point in `dur` seconds, then turns to `face` (degrees). `ground`: the height under them as they go. */
  walkTo(x: number, z: number, dur: number, face: number, ground: (x: number, z: number) => number = () => this.pos.y) {
    const from = this.pos.clone()
    this.walk = { from, to: new Vector3(x, 0, z), t: 0, dur, face, ground }
    this.m.root.rotation.y = Math.atan2(x - from.x, z - from.z)
  }
  get walking() {
    return !!this.walk
  }
  /** Pulls a face for a moment; `hold` keeps it (a sad droop lasts until `cheer`). */
  pull(kind: Face, hold = false) {
    this.face = { kind, t: 0, hold }
    if (kind === 'sad') this.droopGoal = 1
    else this.droopGoal = 0
  }
  /** Back to their usual happy self. */
  cheer() {
    this.face = null
    this.droopGoal = 0
    const r = this.m.rig
    r.mouth.scale.set(1, 1, 1)
    r.head.rotation.z = 0
  }
  /** Head height (world), for shots and tap targets. */
  head(out = new Vector3()) {
    const r = this.m.rig
    return r.head.localToWorld(out.set(0, r.face.headY, 0))
  }
  update(dt: number, t: number) {
    this.m.update(dt, t)
    const r = this.m.rig
    const w = this.walk
    if (w) {
      w.t = Math.min(1, w.t + dt / w.dur)
      this.pos.x = w.from.x + (w.to.x - w.from.x) * w.t
      this.pos.z = w.from.z + (w.to.z - w.from.z) * w.t
      this.pos.y = w.ground(this.pos.x, this.pos.z)
      // A waddle: a bounce each step and a rock from side to side.
      r.body.position.y = Math.abs(Math.sin(t * 11)) * 0.05
      r.body.rotation.z = Math.sin(t * 11) * 0.09
      if (w.t >= 1) {
        this.walk = null
        r.body.position.y = 0
        r.body.rotation.z = 0
        this.m.root.rotation.y = w.face * deg
      }
    }
    // (The Member's own update leaves the head's nod, the body's lean and the arms alone, so these are set, never
    // added to: a `+=` here would spin the head a little more every frame.)
    this.droop += (this.droopGoal - this.droop) * Math.min(1, dt * 4)
    const d = this.droop
    let nod = d * 0.38
    r.body.rotation.x = d * 0.12
    if (d > 0.01) {
      r.armL.rotation.set(0.15 * d, 0, 0.12 * d)
      r.armR.rotation.set(0.15 * d, 0, -0.12 * d)
      if (!w) r.body.rotation.z = Math.sin(t * 1.3) * 0.03 * d
      this.drooped = true
    } else if (this.drooped) {
      // Back up: the arms are the film's (or nobody's) again.
      this.drooped = false
      r.armL.rotation.set(0, 0, 0)
      r.armR.rotation.set(0, 0, 0)
      if (!w) r.body.rotation.z = 0
    }
    const f = this.face
    if (f) {
      f.t += dt / 1.5
      const k = f.hold ? Math.min(1, f.t * 3) : bell(Math.min(1, f.t * 1.25))
      if (f.kind === 'sad') {
        // Eyes half shut, the mouth small and flat.
        r.eyes.scale.y = Math.min(r.eyes.scale.y, 1 - k * 0.5)
        r.mouth.scale.set(1 - k * 0.35, 1 - k * 0.55, 1)
      } else if (f.kind === 'wow') {
        // Eyes wide, the mouth a round O, the head back.
        r.eyes.scale.y = 1 + k * 0.28
        r.mouth.scale.set(1 - k * 0.3, 1 + k * 0.7, 1)
        nod -= k * 0.16
      } else {
        // Happy: eyes squeezed into smiles, the mouth big, a little sway.
        r.eyes.scale.y = Math.max(0.2, 1 - k * 0.75)
        r.mouth.scale.setScalar(1 + k * 0.45)
        r.head.rotation.z = Math.sin(f.t * 9) * 0.12 * k
      }
      if (f.t >= 1 && !f.hold) {
        this.face = null
        r.mouth.scale.set(1, 1, 1)
        r.head.rotation.z = 0
      }
    }
    r.head.rotation.x = nod
  }
}

/** The fire dancers, as the story's two friends: Tuk (the blue big brother, a worrier) and Kae (his mint little sister,
 *  all giggles). Together their names are the tokay gecko's call: "tuk-kae!". */
export function makeGeckos(bag: Bag): { tuk: Islander; kae: Islander } {
  return { tuk: new Islander('tuk', 'Tuk', FIRE_DANCERS[0], bag, 'tuk'), kae: new Islander('kae', 'Kae', FIRE_DANCERS[1], bag, 'kae') }
}
