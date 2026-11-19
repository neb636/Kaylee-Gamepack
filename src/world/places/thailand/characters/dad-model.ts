// Shared measurements, face details and proportions for the modelled Dad rig.
import { Group, Mesh, Raycaster, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { P, solid, solidMix, type V3 } from '../../../engine3d/geo'

/** How tall he stands (meters; the 1 m model's top is his ear tips and horn tip): a little taller than Mom (1.85). */
export const DAD_SIZE = 1.95
/** How far each arm's swing plane turns forward for a wave (mom-model.ts reachForward): his head is wider than his
 *  shoulders, so an arm raised straight out to the side would come up into his ear. */
export const ARM_TILT = 1.2
/** His ink before TUNE.outline: the Outline slider at 1, like Mom's (the user's pick, 2026-11-18). The lids' ink
 *  follows it. */
const INK = 1 / 0.75
export const BODY_INK = 1.8 * INK
const FACE_INK = 1.2 * INK
/** His mint, as split-nick.py's mint() painted it into the texture (the lids). */
const SKIN = '#A8EAD5'
const SMILE = '#4A2A2A'
const MOUTH = '#7A2745'
const TONGUE = '#FF8FA8'

/** Dad’s measurements in Blender axes (z up, face toward -y). */
export interface DadShape {
  /** The level his head was cut off at (the neck pivot's height). */
  neck: number
  /** The right eye dome's box (x across, y depth, z up): centre and half-sizes (the left is mirrored). */
  eye: { c: V3; r: V3 }
  /** The bottom of his nose (the mouth goes under it). */
  nose: number
  /** The left brow's middle and the horn's tip. */
  brow: V3
  horn: V3
  /** The middle of his hair's height (the vet's suds puff it from there). */
  hairMid: number
  /** His left leg in its hip pivot's space (three.js axes): middle x and z, radius, sole and hem heights. */
  shin: { x: number; z: number; r: number; sole: number; hem: number }
  /** His hair's browns, dark to light (the barber's strands and its falling snips). */
  hair: string[]
}

/** What split-dad.py measured on a new Tripo Dad (its JSON). */
export interface SplitMeta {
  neck: number
  eye: { c: number[]; r: number[] }
  muzzle: number
  hoof: number[]
  brow: number[]
  horn: number[]
  hairMid: number
  /** The right shoulder pivot (three.js axes). */
  shoulder: number[]
  /** Where the right sleeve's underside meets the shirt (three.js x, y). */
  armpit: number[]
  shin: DadShape['shin']
  hair: string[]
}

export function dadShape(m: SplitMeta): DadShape {
  const v3 = (a: number[]): V3 => [a[0], a[1], a[2]]
  return {
    neck: m.neck,
    eye: { c: v3(m.eye.c), r: v3(m.eye.r) },
    // The muzzle's tip is the nose's middle: its bottom is just under it.
    nose: m.muzzle - 0.012,
    brow: v3(m.brow),
    horn: v3(m.horn),
    hairMid: m.hairMid,
    shin: m.shin,
    hair: m.hair,
  }
}

/** What the code draws on a modelled Dad's face (the smile, the talking mouth, the blink lids) and where things sit on
 *  his head, from his shape. `head` is his head pivot (meters), `neck` where it is in model meters (three.js axes), and
 *  `probe` a shape of his face in model meters, three.js axes (rays find his face on it).  */
export function dadFace(head: Group, neck: Vector3, probeGeometry: BufferGeometry, shape: DadShape, bag: Bag) {
  const S = DAD_SIZE
  const { neck: NECK, eye: EYE, nose: NOSE, brow: BROW, horn: HORN } = shape
  // What the code draws on his face, in model meters (head-local) inside a group scaled to his size.
  const face = new Group()
  face.scale.setScalar(S)
  head.add(face)
  /** A Blender point (x, z up, y toward the back) in the head pivot's space. */
  const onHead = (x: number, z: number, y: number): V3 => [x - neck.x, z - neck.y, -y - neck.z]
  const sc = (p: V3): V3 => [p[0] * S, p[1] * S, p[2] * S]
  // Points on his face: rays cast at the head mesh from in front (it's in model meters, three.js axes).
  const probe = new Mesh(probeGeometry)
  const ray = new Raycaster()
  const back = new Vector3(0, 0, -1)
  const hitAt = (x: number, z: number) => {
    ray.set(new Vector3(x, z, 1), back)
    return ray.intersectObject(probe, false)[0]
  }
  const onFace = (x: number, z: number, lift: number): V3 => {
    const hit = hitAt(x, z)
    const p = hit?.face ? hit.point.clone().addScaledVector(hit.face.normal, lift) : new Vector3(x, z, 0.22)
    return [p.x - neck.x, p.y - neck.y, p.z - neck.z]
  }

  // The smile: little ink beads along a gentle curve under his nose (like Mom's).
  const mouthZ = NOSE - 0.024
  const mouthAt = onFace(0, mouthZ, 0)
  const rel = (p: V3): V3 => [p[0] - mouthAt[0], p[1] - mouthAt[1], p[2] - mouthAt[2]]
  const beads = []
  const R = 0.03
  for (let i = 0; i <= 14; i++) {
    const a = -0.85 + (1.7 * i) / 14
    beads.push(P.sphere(0.0036, SMILE, { at: rel(onFace(R * Math.sin(a), mouthZ + 0.026 - R * Math.cos(a), 0.001)), scale: [1, 1, 0.6] }, 8))
  }
  const mouth = new Group()
  const talk = new Group()
  for (const m of [mouth, talk]) m.position.set(...mouthAt)
  mouth.add(solidMix([], beads, bag, 0))
  talk.add(solidMix([], [P.sphere(0.02, MOUTH, { at: [0, -0.002, -0.002], scale: [1.15, 0.9, 0.35] }), P.sphere(0.011, TONGUE, { at: [0, -0.009, 0.003], scale: [1.3, 0.6, 0.5] })], bag, 0))
  talk.scale.setScalar(0.001)
  talk.visible = false
  face.add(mouth, talk)

  // The lids: his skin colour over each eye dome, growing down from above it.
  const [ex, ey, ez] = EYE.c
  // Blender's half-sizes: across, depth, up (the lid's sphere is in three.js axes: across, up, depth).
  const [rx, depth, up] = EYE.r
  const lids: Group[] = []
  for (const s of [-1, 1] as const) {
    const lid = new Group()
    lid.position.set(...onHead(s * ex, ez + up + 0.005, ey))
    lid.add(solid(P.sphere(1, SKIN, { at: [0, -(up + 0.005), 0], scale: [rx + 0.005, up + 0.005, depth + 0.005] }), bag, FACE_INK))
    lid.scale.y = 0.001
    lid.visible = false
    face.add(lid)
    lids.push(lid)
  }

  return {
    mouth,
    talk,
    face: { R: 0.23 * S, headY: (EYE.c[2] + 0.012 - NECK) * S, mouth: sc(mouthAt) },
    // A hat goes round his head under the horn, about 0.2 round (model meters).
    spots: {
      crown: sc(onHead(0, 0.84, -0.02)),
      hat: 0.21 * S,
      nose: sc(onFace(0, NOSE + 0.012, 0)),
      eyes: sc(onFace(0, ez, 0)),
      brow: sc(onHead(BROW[0], BROW[2], BROW[1])),
      horn: sc(onHead(HORN[0], HORN[2], HORN[1])),
    },
    blink(open: number) {
      const shut = (1 - open) / 0.9
      for (const lid of lids) {
        lid.visible = shut > 0.02
        lid.scale.y = Math.max(0.001, shut)
      }
    },
  }
}
