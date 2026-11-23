// Lulu the loon as a toy (characters/toy.ts ToyActor): the best singer in Canada, who sings before the big game, and a
// proud mama. Built by hand, in the look of the team's rig animals (smooth sculpted shapes, their big shiny eyes, soft
// blush): a long low charcoal body that lifts to a fan of tail feathers, a loon's white checks painted down her back, a
// white tummy and bib, folded wings with feather tips and white flecks, a short neck with the striped white necklace,
// a round deep-green head with a flick of feathers at the back, a thin ruby rim round each eye (a real loon's red eye,
// made sweet) and a long dark bill in two halves that opens when she talks or calls. `chick: true` builds her chick
// instead: a ball of light grey down, most of it head, with fluffy cheeks, a pale chin, a curl of down on top, stubby
// wings and a tiny bill that pops wide open when it squeaks; it rides on her back (`chick.ride(lulu.body, ...)`).
// She sits low: on water, put her feet at the surface; her body is made to look afloat.
// (Her body, head and neck keep the sizes the Team Cabin's clothes are fitted to: `spots`, characters/worn.ts.)
import { Group, Matrix4, RingGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { bake, merge, P, placeMatrix, solid, solidMix, type PartOpts, type V3 } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'
import { TEAM_SCARF, UNDER_HAT, type ToySpots } from './worn'

const BLACK = '#2F3443'
/** Her wing and tail feathers' tips: a shade lighter, so the folded wing reads as feathers. */
const FEATHER = '#353B4C'
const HEAD = '#294A50'
const WHITE = '#FFFFFF'
const RED = '#E2384B'
const INK = '#1C1820'
const BLUSH = '#FF9DBB'
const BILL = '#454058'
const BILL_SHINE = '#8580A0'
/** The lighter feather in the flick at the back of her head. */
const CREST = '#34605F'
const TONGUE = '#E8788F'
/** The chick: light grey down, a paler face and tummy, a soft dark bill. */
const FLUFF = '#BDB7B0'
const FLUFF_DARK = '#A39C94'
const FLUFF_PALE = '#F4F0EA'
const CHICK_BILL = '#4A4048'

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** A ball pushed into a shape: `f` moves each point of a unit ball, then the part is placed. Its shading follows the
 *  new surface, with no seam where the ball's own edges meet. */
function sculpt(color: string, seg: number, f: (p: Vector3) => void, o?: PartOpts): BufferGeometry {
  const g = P.sphere(1, color, {}, seg)
  const pos = g.attributes.position
  const p = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    f(p.fromBufferAttribute(pos, i))
    pos.setXYZ(i, p.x, p.y, p.z)
  }
  g.computeVertexNormals()
  const nrm = g.attributes.normal
  const sum = new Map<string, Vector3>()
  const key = (i: number) => `${Math.round(pos.getX(i) * 1e4)},${Math.round(pos.getY(i) * 1e4)},${Math.round(pos.getZ(i) * 1e4)}`
  for (let i = 0; i < pos.count; i++) {
    const k = key(i)
    const n = sum.get(k)
    if (n) n.add(p.fromBufferAttribute(nrm, i))
    else sum.set(k, new Vector3().fromBufferAttribute(nrm, i))
  }
  for (let i = 0; i < pos.count; i++) {
    const n = p.copy(sum.get(key(i))!).normalize()
    nrm.setXYZ(i, n.x, n.y, n.z)
  }
  return g.applyMatrix4(placeMatrix(o))
}

/** A flat little mark lying on a surface at `at`: `n` is the way the surface faces, `along` the way the mark's length
 *  runs. A rounded square (`round` 0) through to a circle (1), thin as paint (a jersey goes over it). */
function mark(at: Vector3, n: Vector3, along: Vector3, w: number, l: number, color: string, round = 0.35): BufferGeometry {
  const g = P.cyl(1, 1, 1, color, {}, 12)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 1e-6) continue
    // (A squircle: the circle's rim pushed out toward a square's corners.)
    const k = 1 / (Math.abs(x / r) ** 4 + Math.abs(z / r) ** 4) ** 0.25
    const grow = 1 + (k - 1) * (1 - round)
    pos.setXYZ(i, x * grow, pos.getY(i), z * grow)
  }
  const y = n.clone().normalize()
  const zAxis = along.clone().addScaledVector(y, -along.dot(y)).normalize()
  const xAxis = new Vector3().crossVectors(y, zAxis)
  const thick = Math.min(w, l) * 0.07
  return g.applyMatrix4(new Matrix4().makeBasis(xAxis.multiplyScalar(w / 2), y.multiplyScalar(thick), zAxis.multiplyScalar(l / 2)).setPosition(at))
}

/** A head: a ball of radius R round `c`, a touch wider (`wide`) and deeper (`deep`) low down where the cheeks are, and
 *  `flat` times as tall. `shape` sculpts it; `on` is the point of its front at (x, y) from its middle, `lift` proud of
 *  it, which is where the face goes. */
function skull(c: V3, R: number, wide: number, deep: number, flat = 1) {
  const cheek = (uy: number) => Math.exp(-((uy + 0.3) ** 2) / 0.2)
  return {
    shape: (p: Vector3) => {
      const k = cheek(p.y)
      p.set(p.x * (1 + wide * k), p.y * flat, p.z * (1 + deep * k))
    },
    on: (x: number, y: number, lift = 0): V3 => {
      const uy = y / (flat * R)
      const k = cheek(uy)
      const ux = x / (R * (1 + wide * k))
      return [c[0] + x, c[1] + y, c[2] + Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy)) * R * (1 + deep * k) + lift]
    },
  }
}
type On = ReturnType<typeof skull>['on']

/** A patch of color lying flush on the front of a head: an oval `rx` by `ry` round (0, cy), its ends bent up by `bend`
 *  (a smile-shaped top edge), like paint on the toy. */
function facePatch(on: On, c: V3, lift: number, cy: number, rx: number, ry: number, bend: number, color: string): BufferGeometry {
  const g = new RingGeometry(0, 1, 40, 8)
  const pos = g.attributes.position
  const nrm = g.attributes.normal
  const n = new Vector3()
  for (let i = 0; i < pos.count; i++) {
    const a = pos.getX(i), b = pos.getY(i)
    const at = on(a * rx, cy + b * ry + bend * a * a, lift)
    pos.setXYZ(i, ...at)
    n.set(at[0] - c[0], at[1] - c[1], at[2] - c[2]).normalize()
    nrm.setXYZ(i, n.x, n.y, n.z)
  }
  return bake(g, color, {}, true)
}

/** Half a bill, growing along +z from its hinge: wide and round at the face, tapering to a soft tip. The flat side
 *  is where the two halves meet. */
function mandible(len: number, wide: number, tall: number, color: string, upper: boolean, taper: number): BufferGeometry {
  return sculpt(color, 20, (p) => {
    const t = (p.z + 1) / 2
    const ring = Math.hypot(p.x, p.y)
    const k = ring > 1e-6 ? Math.pow(1 - t, taper) / ring : 0
    const y = p.y * k
    p.set(p.x * k * wide, (upper === y > 0 ? y : y * 0.16) * tall, (t - 0.12) * len)
  })
}

/** The cast's eyes (engine3d/characters/animal.ts) on a head (`on`, radius R), `drop` below where their own group
 *  pivots: tall shiny dark ovals with two sparkles, turned to lie on the head; `rim` adds a thin ring of color round
 *  each. Split into the parts that take an ink line and the parts that don't. */
function eyeParts(on: On, drop: V3, R: number, eyeX: number, eyeY: number, size: number, rim?: string) {
  const dark: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    const x = s * eyeX
    const rot: V3 = [0, Math.asin(x / R), 0]
    if (rim) plain.push(P.sphere(size * 1.13, rim, { at: on(x, eyeY, -0.05 * R), rot, scale: [0.8, 1, 0.34] }, 18))
    dark.push(P.sphere(size, INK, { at: on(x, eyeY, -0.03 * R), rot, scale: [0.78, 1, 0.42] }, 18))
    plain.push(P.sphere(size * 0.3, WHITE, { at: on(x + s * 0.05 * R, eyeY + 0.085 * R, 0.04 * R) }, 10))
    plain.push(P.sphere(size * 0.14, WHITE, { at: on(x - s * 0.05 * R, eyeY - 0.075 * R, 0.04 * R) }, 8))
  }
  for (const g of [...dark, ...plain]) g.translate(-drop[0], -drop[1], -drop[2])
  return { dark, plain }
}

/** Her body's shape, on a unit ball: the back end narrows and lifts toward the tail, the chest swells up to the neck. */
function loonBody(p: Vector3) {
  const t = clamp01((-p.z - 0.45) / 0.55)
  const f = clamp01((p.z - 0.3) / 0.7)
  p.x *= 1 - 0.3 * t * t
  p.y = p.y * (1 - 0.25 * t * t) + 0.35 * t * t + 0.12 * f * f
  return p
}

export class Lulu extends ToyActor {
  private neck = new Group()
  private eyes = new Group()
  private bill = new Group()
  /** The lower bill: it drops open when she talks or calls, and wide when the chick squeaks. */
  private jaw = new Group()
  private baby = false
  private wingL = new Group()
  private wingR = new Group()
  private team: Group | null = null
  private headAt = new Vector3()
  /** Where the Team Cabin's things sit on her (characters/worn.ts): her head, the bottom of her neck where the scarf
   *  goes, her body and her wings (a jersey's sleeves). The chick has none. */
  spots: ToySpots | null = null

  constructor(bag: Bag, o: { height?: number; voice?: string | null; chick?: boolean } = {}) {
    super(o.height ?? (o.chick ? 0.26 : 0.62), o.chick || o.voice === null ? undefined : (o.voice ?? 'loon'))
    this.baby = !!o.chick
    if (o.chick) this.buildChick(bag)
    else this.buildLoon(bag)
    this.body.add(this.neck)
  }

  private buildLoon(bag: Bag) {
    const H = this.height
    const px = 2.2
    // The body: long and low, the back end lifting to a little fan of tail feathers, the white tummy under it. (A
    // loon's legs sit so far back it can hardly walk: she has none to see.)
    const C: V3 = [0, 0.27 * H, -0.08 * H]
    const RX = 0.285 * H, RY = 0.216 * H, RZ = 0.45 * H
    const onBody = (x: number, z: number, out = new Vector3()) => loonBody(out.set(x, Math.sqrt(Math.max(0, 1 - x * x - z * z)), z)).multiply(new Vector3(RX, RY, RZ)).add(new Vector3(...C))
    const lined = [
      sculpt(BLACK, 44, loonBody, { at: C, scale: [RX, RY, RZ] }),
      P.sphere(0.26 * H, WHITE, { at: [0, 0.17 * H, 0.02 * H], scale: [0.9, 0.55, 1.35] }, 32),
      ...[-1, 0, 1].map((i) => P.sphere(0.1 * H, i ? BLACK : FEATHER, { at: [i * 0.06 * H, (0.36 - Math.abs(i) * 0.014) * H, (-0.55 + Math.abs(i) * 0.03) * H], rot: [-0.6, i * 0.45, 0], scale: [0.5, 0.1, 1.05] }, 16)),
    ]
    // The white checks on her back: rounded squares in rows, big down the middle and small toward her sides and tail.
    const marks: BufferGeometry[] = []
    const a = new Vector3(), b = new Vector3(), d = new Vector3()
    const FRONT = new Vector3(0, 0, 1)
    for (let row = 0; row < 7; row++) for (let i = -3; i <= 3; i++) {
      const z = -0.74 + row * 0.19
      const x = i * 0.2 + (row % 2 ? 0.1 : 0)
      if (Math.abs(x) > 0.62 || x * x + z * z > 0.62) continue
      const at = onBody(x, z)
      const n = d.crossVectors(onBody(x, z + 0.02, a).sub(at), onBody(x + 0.02, z, b).sub(at)).normalize().clone()
      const size = (0.028 + 0.03 * (1 - (x * x + z * z) / 0.62)) * H
      marks.push(mark(at, n, FRONT, size, size, WHITE))
    }
    this.body.add(solidMix(lined, marks, bag, px))
    this.loonWings(bag, px)
    // The neck and the head.
    this.neck.position.set(0, 0.36 * H, 0.24 * H)
    const R = 0.25 * H
    // (Her head sits a little above her body, so a short neck and its necklace show.)
    const headY = 0.35 * H
    const hc: V3 = [0, headY, 0.02 * H]
    this.headAt.set(...hc)
    const face = skull(hc, R, 0.08, 0.03)
    const lean = placeMatrix({ at: [0, 0.1 * H, 0], rot: [0.15, 0, 0] })
    const neck = [
      sculpt(BLACK, 28, () => {}, { at: [0, 0.02 * H, 0], scale: [0.118 * H, 0.22 * H, 0.118 * H] }).applyMatrix4(lean),
      sculpt(HEAD, 44, face.shape, { at: hc, scale: [R, R, R] }),
      // The soft slope from her face down to her bill, so the bill grows out of her face.
      P.sphere(R, HEAD, { at: [0, headY - 0.17 * R, 0.02 * H + 0.66 * R], rot: [0.3, 0, 0], scale: [0.4, 0.3, 0.44] }, 24),
      // Her white bib, under the necklace.
      P.sphere(0.125 * H, WHITE, { at: [0, -0.075 * H, 0.055 * H], scale: [1, 0.9, 0.8] }, 28),
    ]
    // The necklace: short white stripes round the front of her neck, tall in the middle and shorter toward the back.
    const neckPlain: BufferGeometry[] = []
    const UP = new Vector3(0, 1, 0)
    for (let i = -4; i <= 4; i++) {
      const turn = i * 0.3
      const n = new Vector3(Math.sin(turn), 0, Math.cos(turn))
      neckPlain.push(mark(n.clone().multiplyScalar(0.1165 * H).setY(-0.012 * H), n, UP, 0.02 * H, (0.07 - Math.abs(i) * 0.006) * H, WHITE, 0.6).applyMatrix4(lean))
    }
    // Rosy cheeks under the eyes.
    for (const s of [-1, 1]) {
      const x = s * 0.62 * R
      neckPlain.push(P.sphere(0.12 * R, BLUSH, { at: face.on(x, -0.2 * R, -0.012 * R), rot: [0, Math.asin(x / (1.08 * R)), 0], scale: [1.25, 0.65, 0.3] }, 14))
    }
    this.neck.add(solidMix(neck, neckPlain, bag, px))
    // A flick of feathers at the back of her head, one over the next. (A hat from the Team Cabin goes on instead.)
    const crest = solid(merge([[0.42, 1, HEAD], [0.74, 0.86, CREST], [1.04, 0.7, HEAD]].map(([turn, k, color]) => {
      const t = turn as number, size = k as number
      return P.sphere(0.3 * R * size, color as string, { at: [0, headY + Math.cos(t) * 1.02 * R, 0.02 * H - Math.sin(t) * 1.02 * R], rot: [-(t + 0.75), 0, 0], scale: [0.5, 1.25, 0.42] }, 16)
    })), bag, px)
    crest.name = UNDER_HAT
    this.neck.add(crest)
    // Her bill: a loon's long dark dagger, in two halves so it opens when she talks or calls.
    this.bill.position.set(0, headY - 0.2 * R, 0.02 * H + 0.86 * R)
    this.bill.add(solidMix([mandible(0.95 * R, 0.22 * R, 0.19 * R, BILL, true, 0.72)], [P.sphere(0.05 * R, BILL_SHINE, { at: [-0.055 * R, 0.132 * R, 0.22 * R], rot: [-0.12, 0, 0], scale: [0.8, 0.3, 2.4] }, 8)], bag, 1.4))
    this.jaw.add(solidMix([mandible(0.82 * R, 0.19 * R, 0.11 * R, BILL, false, 0.72)], [P.sphere(0.1 * R, TONGUE, { at: [0, 0.004 * R, 0.2 * R], scale: [1.05, 0.14, 2.5] }, 10)], bag, 1.4))
    this.bill.add(this.jaw)
    this.neck.add(this.bill)
    // Big shiny eyes like the rest of the team's, each with a thin ruby rim (a real loon's red eye, made sweet).
    const eyeY = 0.12 * R
    const eye = eyeParts(face.on, [0, headY + eyeY, 0.02 * H], R, 0.41 * R, eyeY, 0.235 * R, RED)
    this.eyes.position.set(0, headY + eyeY, 0.02 * H)
    this.eyes.add(solidMix(eye.dark, eye.plain, bag, 0))
    this.neck.add(this.eyes)
    // The team's pink scarf (hidden until she joins): a ring at the bottom of her neck with a short tail.
    this.team = solid(merge([P.torus(0.14 * H, 0.04 * H, CANADA_COLORS.scarf, { at: [0, 0.03 * H, 0.0], rot: [Math.PI / 2 - 0.15, 0, 0] }), P.rbox(0.07 * H, 0.16 * H, 0.03 * H, 0.012 * H, CANADA_COLORS.scarf, { at: [0.09 * H, -0.03 * H, 0.15 * H], rot: [0.5, 0, -0.2] })]), bag, 1.8)
    this.team.visible = false
    this.team.name = TEAM_SCARF
    this.neck.add(this.team)
    const spot = (parent: Group, x: number, y: number, z: number, data: Record<string, number>, tilt = 0) => {
      const g = new Group()
      g.position.set(x, y, z)
      g.rotation.x = tilt
      g.userData = data
      parent.add(g)
      return g
    }
    this.spots = {
      hat: spot(this.neck, 0, headY, 0.02 * H, { R }),
      neck: spot(this.neck, 0, 0.03 * H, 0, { r: 0.14 * H }, -0.15),
      belly: spot(this.body, ...C, { rx: RX, ry: RY, rz: RZ }),
      wings: [this.wingL, this.wingR],
    }
  }

  /** Her folded wings: a smooth shoulder that narrows back to three long feather tips, one over the next, with a few
   *  white flecks. (The front stays inside a jersey's sleeve: characters/worn.ts.) */
  private loonWings(bag: Bag, px: number) {
    const H = this.height
    for (const [g, s] of [
      [this.wingL, -1],
      [this.wingR, 1],
    ] as const) {
      g.position.set(s * 0.24 * H, 0.33 * H, -0.02 * H)
      const c: V3 = [s * 0.02 * H, -0.06 * H, -0.1 * H]
      const r: V3 = [0.056 * H, 0.14 * H, 0.28 * H]
      const lined = [
        // (The shoulder is full and round; behind it the wing thins and its lower edge sweeps up toward the tips.)
        sculpt(BLACK, 28, (p) => {
          const t = clamp01(-p.z)
          p.y = p.y * (1 - 0.35 * t * t) + 0.1 * t * t
        }, { at: c, scale: r }),
        ...[0, 1, 2].map((i) => P.sphere(0.1 * H, i === 1 ? FEATHER : BLACK, { at: [c[0] + s * (0.012 - i * 0.008) * H, c[1] + (0.07 - i * 0.062) * H, c[2] - (0.215 - i * 0.022) * H], rot: [0.16 - i * 0.2, 0, 0], scale: [0.2, 0.46, 1.42 - i * 0.14] }, 14)),
      ]
      const flecks: BufferGeometry[] = []
      const BACK = new Vector3(0, 0, -1)
      for (const [y, z, size] of [[0.35, 0.3, 0.02], [-0.1, 0.42, 0.017], [0.15, -0.02, 0.022], [-0.35, 0.08, 0.017], [0.42, -0.3, 0.018], [-0.08, -0.36, 0.02]]) {
        const n = new Vector3(s * Math.sqrt(1 - y * y - z * z), y, z)
        const at = new Vector3(c[0] + n.x * r[0], c[1] + n.y * r[1], c[2] + n.z * r[2])
        flecks.push(mark(at, new Vector3(n.x / r[0], n.y / r[1], n.z / r[2]), BACK, size * H, size * H, WHITE, 1))
      }
      g.add(solidMix(lined, flecks, bag, px))
      this.body.add(g)
    }
  }

  /** The chick: a round ball of light grey fluff, most of it head (that's what makes a baby read as a baby): fluffy
   *  cheeks, a pale chin, the team's big shiny eyes, a curl of down on top, stubby wings and a tiny bill in two halves
   *  so it can open wide. */
  private buildChick(bag: Bag) {
    const H = this.height
    const px = 1.6
    this.body.add(
      solid(
        merge([
          P.sphere(0.3 * H, FLUFF, { at: [0, 0.26 * H, -0.04 * H], scale: [1, 0.86, 1.1] }, 32),
          P.sphere(0.24 * H, FLUFF_PALE, { at: [0, 0.19 * H, 0.1 * H], scale: [0.92, 0.72, 0.85] }, 28),
          // A fluffy tail: three tufts of down.
          ...[-1, 0, 1].map((i) => P.sphere((i ? 0.075 : 0.095) * H, FLUFF_DARK, { at: [i * 0.085 * H, (0.3 - Math.abs(i) * 0.02) * H, (-0.36 + Math.abs(i) * 0.03) * H], rot: [-0.5, i * 0.5, 0], scale: [0.9, 0.75, 1.3] }, 14)),
        ]),
        bag,
        px,
      ),
    )
    for (const [g, s] of [
      [this.wingL, -1],
      [this.wingR, 1],
    ] as const) {
      g.position.set(s * 0.24 * H, 0.33 * H, -0.02 * H)
      g.add(
        solid(
          merge([
            P.sphere(0.2 * H, FLUFF_DARK, { at: [s * 0.02 * H, -0.06 * H, -0.1 * H], scale: [0.28, 0.66, 0.8] }, 20),
            ...[0, 1].map((i) => P.sphere(0.08 * H, FLUFF_DARK, { at: [s * 0.02 * H, (-0.05 - i * 0.075) * H, (-0.24 + i * 0.03) * H], rot: [0.1 - i * 0.35, 0, 0], scale: [0.5, 0.55, 1.2] }, 12)),
          ]),
          bag,
          px,
        ),
      )
      this.body.add(g)
    }
    this.neck.position.set(0, 0.34 * H, 0.1 * H)
    const R = 0.4 * H
    const headY = 0.26 * H
    const hc: V3 = [0, headY, 0.02 * H]
    this.headAt.set(...hc)
    const face = skull(hc, R, 0.07, 0.02, 0.97)
    const head = [
      // (A baby's head: a touch wider low down, where its cheeks are.)
      sculpt(FLUFF, 44, face.shape, { at: hc, scale: [R, R, R] }),
      // A curl of down on top: three soft locks, the middle one tallest.
      ...[[-0.2, 0.86, 0.75, 0.82], [0, 0.99, 0.2, 1], [0.17, 0.9, -0.5, 0.86]].map(([x, y, tilt, k]) => P.sphere(0.19 * R * k, FLUFF_DARK, { at: [x * R, headY + y * R, 0.02 * H + 0.1 * R], rot: [0.55, 0, tilt], scale: [0.5, 1.4, 0.62] }, 14)),
    ]
    // Fluffy cheeks: three tufts of down a side, so its outline is soft and scalloped, not a ball.
    for (const s of [-1, 1]) {
      for (const [turn, y, size] of [[1.14, -0.16, 0.17], [1.04, -0.4, 0.165], [0.86, -0.62, 0.14]]) {
        const ring = Math.sqrt(1 - y * y) * 0.97
        head.push(P.sphere(size * R, FLUFF, { at: [s * Math.sin(turn) * ring * R, headY + y * R, 0.02 * H + Math.cos(turn) * ring * R], rot: [0, 0, s * (0.5 + y)], scale: [0.85, 1.05, 0.85] }, 14))
      }
    }
    const headPlain = [
      // The pale chin: paint on the fluff under its eyes and round its bill, the ends curling up onto the cheeks.
      facePatch(face.on, hc, 0.006 * R, -0.5 * R, 0.6 * R, 0.36 * R, 0.16 * R, FLUFF_PALE),
    ]
    for (const s of [-1, 1]) {
      const x = s * 0.58 * R
      headPlain.push(P.sphere(0.12 * R, BLUSH, { at: face.on(x, -0.2 * R, -0.004 * R), rot: [0, Math.asin(x / (1.07 * R)), 0], scale: [1.2, 0.65, 0.3] }, 14))
    }
    this.neck.add(solidMix(head, headPlain, bag, px))
    // The bill: a tiny round upper half and a lower half (the jaw) that drops open on a squeak.
    this.bill.position.set(0, headY - 0.22 * R, 0.02 * H + 0.95 * R)
    this.bill.add(solidMix([mandible(0.36 * R, 0.14 * R, 0.11 * R, CHICK_BILL, true, 0.5)], [P.sphere(0.03 * R, BILL_SHINE, { at: [-0.035 * R, 0.085 * R, 0.07 * R], scale: [1, 0.35, 1.6] }, 8)], bag, 1))
    this.jaw.add(solidMix([mandible(0.29 * R, 0.12 * R, 0.07 * R, CHICK_BILL, false, 0.5)], [P.sphere(0.07 * R, TONGUE, { at: [0, 0.004 * R, 0.07 * R], scale: [1.05, 0.14, 1.5] }, 10)], bag, 1))
    this.bill.add(this.jaw)
    this.neck.add(this.bill)
    const eyeY = 0.08 * R
    const eye = eyeParts(face.on, [0, headY + eyeY, 0.02 * H], R, 0.4 * R, eyeY, 0.25 * R)
    this.eyes.position.set(0, headY + eyeY, 0.02 * H)
    this.eyes.add(solidMix(eye.dark, eye.plain, bag, 0))
    this.neck.add(this.eyes)
  }

  /** The team's pink scarf: on when she joins. */
  scarf(on: boolean) {
    if (this.team) this.team.visible = on
    return this
  }

  head(out = new Vector3()) {
    return this.neck.localToWorld(out.copy(this.headAt))
  }

  /** How far her head is thrown back to call (0..1): set it while her song plays. (The chick's squeak: its head tips
   *  back a little and its bill pops wide open.) */
  calling = 0

  protected animate(p: ToyPose, _dt: number, t: number) {
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    const call = this.calling
    const back = this.baby ? 0.3 : 0.8
    this.neck.rotation.set(p.nod + p.droop * 0.4 - call * back - wow * 0.12, p.headTurn + 0.25 * p.shake, 0.12 * p.wave - 0.2 * p.shake + happy * 0.12 * Math.sin(t * 9))
    this.eyes.scale.y = Math.min(p.lid, 1 - p.droop * 0.4 - happy * 0.6) * (1 + wow * 0.2)
    const open = Math.max(p.talk, call * (0.7 + 0.3 * Math.sin(t * 9)), wow * 0.5)
    // The bill opens like a real one: the top half lifts a little, the lower half drops (wide, for the chick).
    this.bill.rotation.x = -open * (this.baby ? 0.3 : 0.2)
    this.jaw.rotation.x = open * (this.baby ? 1.1 : 0.62)
    const beat = p.flap * 0.9
    const up = p.armsUp * 1.9
    const flying = this.flying ? 1.25 : 0
    this.wingR.rotation.set(0, 0, 0.04 + up + flying + beat + p.wave * (1.7 + 0.4 * Math.sin(t * 15)) + Math.abs(p.shake) * 0.5)
    this.wingL.rotation.set(0, 0, -(0.04 + up + flying + beat + Math.abs(p.shake) * 0.5))
  }
}
