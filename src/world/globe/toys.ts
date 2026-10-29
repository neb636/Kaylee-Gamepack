// The countries' friends standing on the home globe, on the shared chibi rig (engine3d/characters/animal.ts): they
// breathe, blink, turn to look at her, hop when she taps their country and wave now and then.
import { Group, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, span } from '../../sdk'
import { buildAnimal, type Rig } from '../engine3d/characters/animal'
import { FaceLife } from '../engine3d/characters/face'
import type { Look } from '../engine3d/characters/look'
import type { Bag } from '../engine3d/dispose'
import { P, type V3 } from '../engine3d/geo'

const HOP_S = 0.7
const WAVE_S = 1.6
const tmp = new Vector3()

export class Toy {
  /** Stands where its landmark puts it (feet at 0, facing +z). */
  readonly root = new Group()
  private body = new Group()
  private rig: Rig
  private life: FaceLife
  private hopT = -1
  private waveT = -1
  private face = 0
  private phase = Math.random() * 6

  constructor(look: Look, bag: Bag) {
    this.rig = buildAnimal(look, bag)
    // Its own blob shadow is for flat floors; the globe's land is round.
    this.rig.root.children[0].visible = false
    this.body.add(this.rig.root)
    this.root.add(this.body)
    this.life = new FaceLife(this.rig)
  }

  hop(wave = true) {
    if (this.hopT < 0 || this.hopT > HOP_S * 0.7) this.hopT = 0
    if (wave) this.waveT = 0
  }

  wave() {
    if (this.waveT < 0) this.waveT = 0
  }

  get busy() {
    return this.hopT >= 0 || this.waveT >= 0
  }

  update(dt: number, t: number, cam: Vector3) {
    this.life.update(dt)
    // Turn (a little) toward her.
    this.root.worldToLocal(tmp.copy(cam))
    let d = Math.max(-1.1, Math.min(1.1, Math.atan2(tmp.x, tmp.z))) - this.face
    d = Math.atan2(Math.sin(d), Math.cos(d))
    this.face += d * (1 - Math.exp(-dt * 4))
    this.body.rotation.y = this.face
    let y = 0
    let sq = 0
    if (this.hopT >= 0) {
      this.hopT += dt
      const p = this.hopT / HOP_S
      if (p >= 1) this.hopT = -1
      else {
        const air = span(p, 0.18, 0.78)
        y = bell(air) * this.rig.height * 0.5
        sq = p < 0.18 ? bell(p / 0.36) * 0.22 : p > 0.78 ? bell((p - 0.78) / 0.44) * 0.18 : -0.1 * bell(air)
      }
    }
    const breathe = 0.025 * Math.sin(t * 2.6 + this.phase)
    this.body.position.y = y
    this.body.scale.set(1 + sq * 0.6 - breathe * 0.4, 1 - sq + breathe, 1 + sq * 0.6 - breathe * 0.4)
    if (this.waveT >= 0) {
      this.waveT += dt
      if (this.waveT > WAVE_S) this.waveT = -1
    }
    const w = this.waveT >= 0 ? bell(this.waveT / WAVE_S) : 0
    this.rig.armR.rotation.z = 0.25 + w * (1.9 + 0.45 * Math.sin(this.waveT * 16))
    this.rig.armL.rotation.z = -0.25
  }
}

const UP = new Vector3(0, 1, 0)
/** A rod from `a` to `b` (a rope, a stalk, a leg). */
export function rod(a: V3, b: V3, r: number, color: string, seg = 6): BufferGeometry {
  const va = new Vector3(...a)
  const vb = new Vector3(...b)
  const len = va.distanceTo(vb)
  const g = P.cyl(r, r, len, color, {}, seg)
  const q = new Quaternion().setFromUnitVectors(UP, vb.clone().sub(va).normalize())
  g.applyQuaternion(q)
  const m = va.add(vb).multiplyScalar(0.5)
  g.translate(m.x, m.y, m.z)
  return g
}

/** Faceted shading (each face its own normal): pyramids, mountains, rocks. With `shade`, the faces turned west and
 *  north are painted that much darker too, like an illustration's shadow side, so the facets read even from above. */
export function faceted(g: BufferGeometry, shade = 0) {
  g.computeVertexNormals()
  if (shade) {
    const n = g.attributes.normal
    const c = g.attributes.color
    for (let i = 0; i < n.count; i += 3) {
      const dark = n.getX(i) + n.getX(i + 1) + n.getX(i + 2) < -0.3 || n.getZ(i) + n.getZ(i + 1) + n.getZ(i + 2) < -0.3
      if (!dark) continue
      for (let k = i; k < i + 3; k++) c.setXYZ(k, c.getX(k) * (1 - shade), c.getY(k) * (1 - shade * 1.1), c.getZ(k) * (1 - shade * 0.6))
    }
  }
  return g
}

/** A palm tree, `h` tall, its top leaning a little toward `lean` radians round the trunk. */
export function palm(at: V3, h: number, lean = 0, seg = 8): BufferGeometry[] {
  const parts: BufferGeometry[] = []
  const top: V3 = [at[0] + Math.cos(lean) * h * 0.18, at[1] + h, at[2] + Math.sin(lean) * h * 0.18]
  const midP: V3 = [at[0] + Math.cos(lean) * h * 0.04, at[1] + h * 0.5, at[2] + Math.sin(lean) * h * 0.04]
  parts.push(rod(at, midP, h * 0.07, '#D9A37A'), rod(midP, top, h * 0.06, '#E2B088'))
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3
    parts.push(P.sphere(h * 0.12, i % 2 ? '#5FCB8E' : '#4DB97E', { at: [top[0] + Math.cos(a) * h * 0.24, top[1] - h * 0.06, top[2] + Math.sin(a) * h * 0.24], scale: [2.3, 0.45, 0.9], rot: [0, -a, -0.35] }, seg))
  }
  parts.push(P.sphere(h * 0.07, '#B07A54', { at: [top[0], top[1] - h * 0.04, top[2]] }, 8))
  return parts
}

/** A round little tree. */
export function roundTree(at: V3, h: number, leaf: string, seg = 12): BufferGeometry[] {
  return [P.cyl(h * 0.08, h * 0.1, h * 0.45, '#C98B62', { at: [at[0], at[1] + h * 0.22, at[2]] }, 7), P.sphere(h * 0.34, leaf, { at: [at[0], at[1] + h * 0.66, at[2]] }, seg)]
}

