// Tuque the snowman as a toy (characters/toy.ts ToyActor): the snowman she builds at Quebec City's Winter Carnival,
// who wakes up and joins Maple's team. Three snowballs, a floppy red tuque with a white brim and pom-pom, the carnival's
// woven sash, big shiny coal eyes that blink, rosy cheeks, a carrot nose, a coal smile that opens when he talks, and two
// stick arms with red mittens. On the team he wears the pink scarf (`scarf(true)`), and nothing gets past his tummy
// (`boing()`: a snowball bounces off it and he jiggles all over).
//
// His hat, face, arms and sash are built here at the size of a ball of radius 1 too (`tuqueCap`, `tuqueFace`,
// `tuqueArm`, `sashGeo`), so the first snowman she stacks and dresses in Carnival Snowballs is this same fellow, on the
// balls she rolled herself.
import { Group, Vector3, type BufferGeometry } from 'three'
import { span, wobble } from '../../../../sdk'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'
import { TEAM_SCARF, type ToySpots } from './worn'

const SNOW = '#FFFFFF'
const SHADE = '#E9F0FB'
const RED = '#E8443F'
const COAL = '#2E2A3A'
const CARROT = '#FF9A3C'
const TWIG = '#8A6A58'
const CHEEK = '#FFB3C7'
const MOUTH = '#5A2A3A'

// ---------------------------------------------------------------- his parts, for a head (or middle ball) of radius 1

/** A point on the head's front, `x` across and `y` up from its middle. */
const on = (x: number, y: number, lift = 0): [number, number, number] => [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y)) + lift]

/** His tuque, for a head of radius 1 with its middle at the origin: a red cap with a rolled white brim, its long tip
 *  flopping over to his left with a white pom-pom on the end. */
export function tuqueCapGeo(): BufferGeometry[] {
  return [
    P.sphere(1.04, RED, { at: [0, 0.62, -0.02], scale: [1, 0.72, 1] }, 18),
    P.torus(0.92, 0.19, SNOW, { at: [0, 0.5, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cone(0.55, 1.05, RED, { at: [0.45, 1.3, -0.05], rot: [0, 0, -0.85] }, 12),
    P.sphere(0.3, SNOW, { at: [0.95, 1.66, -0.05] }, 12),
  ]
}
export const tuqueCap = (bag: Bag, px = 2) => solid(merge(tuqueCapGeo()), bag, px)

/** His eyes (big coal ovals with a shine each), with the middle of the eyes at the origin: they blink by squashing y. */
const EYE_Y = 0.06
function eyesGeo(): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  const lined: BufferGeometry[] = []
  const plain: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    const [x, , z] = on(s * 0.33, EYE_Y)
    lined.push(P.sphere(0.17, COAL, { at: [x, 0, z - 0.02], scale: [0.9, 1.2, 0.5] }, 12))
    plain.push(P.sphere(0.055, SNOW, { at: [x + 0.05, 0.08, z + 0.07] }, 6))
  }
  return { lined, plain }
}
/** His nose and his rosy cheeks. */
function noseGeo(): { lined: BufferGeometry[]; plain: BufferGeometry[] } {
  return {
    lined: [P.cone(0.15, 0.72, CARROT, { at: [0, -0.12, 1.27], rot: [Math.PI / 2 + 0.12, 0, 0] }, 10)],
    plain: [-1, 1].map((s) => P.sphere(0.16, CHEEK, { at: on(s * 0.56, -0.24, -0.06), scale: [1, 0.62, 0.3] }, 10)),
  }
}
const MOUTH_Y = -0.46
/** His coal smile (five little coals in a curve) around the origin, on the front of the head. */
const smileGeo = () => [-2, -1, 0, 1, 2].map((i) => P.sphere(0.075, COAL, { at: [i * 0.17, i * i * 0.045, -Math.abs(i) * 0.05], scale: [1, 1, 0.5] }, 6))
const mouthAt = () => on(0, MOUTH_Y)

/** His face for a ball of radius 1 (Carnival Snowballs puts it on the top ball she rolled): eyes, nose, cheeks, and
 *  the smile as the group's second child (`face.children[1]`), with a dark mouth behind it that opens when its y is
 *  stretched. */
export function tuqueFace(bag: Bag) {
  const face = new Group()
  const e = eyesGeo()
  const n = noseGeo()
  e.lined.forEach((g) => g.translate(0, EYE_Y, 0))
  e.plain.forEach((g) => g.translate(0, EYE_Y, 0))
  face.add(solidMix([...e.lined, ...n.lined], [...e.plain, ...n.plain], bag, 1.4))
  const mouth = new Group()
  mouth.position.set(...mouthAt())
  mouth.add(solidMix([], [...smileGeo(), P.sphere(0.2, MOUTH, { at: [0, 0.02, -0.06], scale: [1.3, 0.45, 0.3] }, 10)], bag, 0))
  face.add(mouth)
  return face
}

/** A stick arm `L` long along +y from its shoulder: a twig on the side and a red mitten on the end. */
export function tuqueArmGeo(L: number): BufferGeometry[] {
  return [
    P.cyl(0.045 * L, 0.06 * L, L, TWIG, { at: [0, L / 2, 0] }, 6),
    P.cyl(0.03 * L, 0.038 * L, 0.3 * L, TWIG, { at: [0.1 * L, 0.72 * L, 0], rot: [0, 0, -0.7] }, 5),
    P.sphere(0.19 * L, RED, { at: [0, 1.04 * L, 0], scale: [0.85, 1.1, 0.75] }, 10),
    P.sphere(0.08 * L, RED, { at: [-0.15 * L, 0.98 * L, 0.02 * L] }, 8),
  ]
}
export const tuqueArm = (bag: Bag, L: number, px = 1.6) => solid(merge(tuqueArmGeo(L)), bag, px)

/** The carnival's woven sash (red, with blue and gold stripes), round a ball of radius 1 a little below its middle,
 *  tied at the front with its two tasselled ends hanging down. */
export function sashGeo(): BufferGeometry[] {
  return [
    P.torus(1, 0.11, RED, { at: [0, -0.22, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(1, 0.055, '#4F7FD0', { at: [0, -0.07, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(1, 0.055, '#FFD86B', { at: [0, -0.37, 0], rot: [Math.PI / 2, 0, 0] }),
    // The knot and the two tasselled ends.
    P.sphere(0.16, RED, { at: [0.72, -0.25, 0.72] }),
    P.rbox(0.18, 0.62, 0.06, 0.04, RED, { at: [0.76, -0.62, 0.78], rot: [0, -0.78, 0.15] }),
    P.rbox(0.18, 0.5, 0.06, 0.04, '#4F7FD0', { at: [0.62, -0.58, 0.9], rot: [0, -0.78, -0.12] }),
    P.cone(0.12, 0.2, '#FFD86B', { at: [0.8, -1.0, 0.8], rot: [Math.PI, 0, 0] }, 8),
    P.cone(0.12, 0.2, '#FFD86B', { at: [0.58, -0.9, 0.94], rot: [Math.PI, 0, 0] }, 8),
  ]
}

const sized = (parts: BufferGeometry[], s: number, y: number, sy = s) => parts.map((g) => g.scale(s, sy, s).translate(0, y, 0))

export class Tuque extends ToyActor {
  private top = new Group()
  private eyes: Group
  private mouth: Group
  private talkHole: Group
  private armL = new Group()
  private armR = new Group()
  private team: Group
  private headAt: Vector3
  private boingT = -1
  /** Eyes shut, still as a snowman (until he wakes up). */
  asleep = false
  /** Where the Team Cabin's things sit on him (characters/worn.ts): his head, the ring under his chin where the scarf
   *  goes, his middle ball, and the floppy tip of his tuque (it droops to the side when another hat goes on top). */
  readonly spots: ToySpots

  constructor(bag: Bag, o: { height?: number; voice?: string | null } = {}) {
    super(o.height ?? 1.25, o.voice === null ? undefined : (o.voice ?? 'snowman'))
    const H = this.height
    const px = 2.4
    // The bottom and middle balls, the sash round the middle, three coal buttons.
    const MID = 0.225 * H
    this.body.add(
      solid(
        merge([
          P.sphere(0.3 * H, SNOW, { at: [0, 0.25 * H, 0], scale: [1.05, 0.86, 1.05] }, 20),
          P.sphere(MID, SNOW, { at: [0, 0.57 * H, 0], scale: [1.04, 0.9, 1.04] }, 18),
          P.sphere(0.12 * H, SHADE, { at: [0.12 * H, 0.12 * H, 0.2 * H], scale: [1, 0.5, 0.6] }, 8),
          ...sized(sashGeo(), MID * 1.04, 0.57 * H, MID * 0.9),
          ...[0.33, 0.24, 0.15].map((y) => P.sphere(0.028 * H, COAL, { at: [0, y * H, Math.sqrt(Math.max(0, 0.3 * 0.3 - (y - 0.25) * (y - 0.25))) * 1.02 * H] }, 8)),
        ]),
        bag,
        px,
      ),
    )
    // The team's pink scarf, under the chin (hidden until he joins).
    this.team = solid(
      merge([P.torus(0.15 * H, 0.04 * H, CANADA_COLORS.scarf, { at: [0, 0.74 * H, 0], rot: [Math.PI / 2, 0, 0] }), P.rbox(0.07 * H, 0.2 * H, 0.03 * H, 0.012 * H, CANADA_COLORS.scarf, { at: [0.1 * H, 0.64 * H, 0.2 * H], rot: [0.25, 0, -0.15] })]),
      bag,
      2,
    )
    this.team.visible = false
    this.team.name = TEAM_SCARF
    this.body.add(this.team)
    // The stick arms, pivoting at the shoulders, a red mitten on each.
    for (const [g, s] of [
      [this.armL, -1],
      [this.armR, 1],
    ] as const) {
      g.position.set(s * 0.2 * H, 0.62 * H, 0)
      const arm = tuqueArm(bag, 0.3 * H, 1.8)
      arm.rotation.z = -s * Math.PI * 0.5
      g.add(arm)
      this.body.add(g)
    }
    // The head: its own pivot (it nods and turns), the tuque, the carrot, the cheeks, the coal face.
    const R = 0.17 * H
    const hy = R * 0.9
    this.top.position.set(0, 0.76 * H, 0)
    this.headAt = new Vector3(0, hy, 0)
    const n = noseGeo()
    const [cap, brim, tip, pom] = tuqueCapGeo()
    this.top.add(solidMix([...sized([P.sphere(1, SNOW, {}, 18), cap, brim], R, hy), ...sized(n.lined, R, hy)], sized(n.plain, R, hy), bag, px))
    // (The floppy tip on its own pivot at its root, so it can droop out from under a second hat.)
    const flop = new Group()
    flop.position.set(0.06 * R, hy + 0.95 * R, -0.05 * R)
    flop.add(solid(merge(sized([tip, pom], R, hy).map((g) => g.translate(-flop.position.x, -flop.position.y, -flop.position.z))), bag, px))
    this.top.add(flop)
    const spot = (parent: Group, x: number, y: number, z: number, data: Record<string, number>) => {
      const g = new Group()
      g.position.set(x, y, z)
      g.userData = data
      parent.add(g)
      return g
    }
    this.spots = {
      hat: spot(this.top, 0, hy, 0, { R }),
      neck: spot(this.body, 0, 0.74 * H, 0, { r: 0.15 * H }),
      belly: spot(this.body, 0, 0.57 * H, 0, { r: MID, sx: 1.04, sy: 0.9 }),
      flop,
    }
    this.eyes = new Group()
    this.eyes.position.set(0, hy + EYE_Y * R, 0)
    const e = eyesGeo()
    this.eyes.add(solidMix(sized(e.lined, R, 0), sized(e.plain, R, 0), bag, 1.2))
    // The coal smile; it opens (a dark oval) when he talks.
    const [mx, my, mz] = mouthAt()
    this.mouth = new Group()
    this.mouth.position.set(mx * R, hy + my * R, mz * R)
    this.mouth.add(solidMix([], sized(smileGeo(), R, 0), bag, 0))
    this.talkHole = solidMix([], [P.sphere(R * 0.2, MOUTH, { scale: [1.15, 1, 0.3] }, 10)], bag, 0)
    this.talkHole.position.set(mx * R, hy + (my - 0.03) * R, (mz + 0.01) * R)
    this.talkHole.visible = false
    this.top.add(this.eyes, this.mouth, this.talkHole)
    this.body.add(this.top)
  }

  /** The team's pink scarf: on when he joins. */
  scarf(on: boolean) {
    this.team.visible = on
    return this
  }

  /** Something bounces off his round tummy: he jiggles all over like a jelly. */
  boing() {
    this.boingT = 0
  }

  head(out = new Vector3()) {
    return this.top.localToWorld(out.copy(this.headAt))
  }

  protected animate(p: ToyPose, dt: number, t: number) {
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    let jig = 0
    if (this.boingT >= 0) {
      this.boingT += dt / 0.9
      jig = wobble(span(this.boingT, 0, 1), 4)
      if (this.boingT >= 1) this.boingT = -1
      // (The tummy squashes in, then he wobbles back and forth like a jelly.)
      this.body.scale.x *= 1 + jig * 0.16
      this.body.scale.z *= 1 + jig * 0.16
      this.body.scale.y *= 1 - jig * 0.13
    }
    this.top.rotation.set(p.nod - wow * 0.12 - jig * 0.15, p.headTurn, 0.14 * p.wave - 0.25 * p.shake + happy * 0.1 * Math.sin(t * 9) + jig * 0.12)
    this.eyes.scale.y = this.asleep ? 0.1 : Math.min(p.lid, 1 - p.droop * 0.4 - happy * 0.65) * (1 + wow * 0.25)
    const talking = !this.asleep && (p.talk > 0.04 || wow > 0.3)
    this.talkHole.visible = talking
    this.mouth.visible = !talking
    if (talking) this.talkHole.scale.set(0.6 + 0.4 * Math.max(p.talk, wow * 0.6), 0.3 + Math.max(p.talk, wow * 0.8), 1)
    // The arms: out to the sides, a little up; both up for a cheer, the right one waving; flung up by a boing.
    const up = p.armsUp * 1.1 + Math.abs(jig) * 0.7
    this.armR.rotation.set(0, 0, 0.12 + up + p.wave * (0.9 + 0.3 * Math.sin(t * 15)) + 0.4 * Math.abs(p.shake) - p.droop * 0.5)
    this.armL.rotation.set(0, 0, -(0.12 + up + 0.4 * Math.abs(p.shake) - p.droop * 0.5))
  }
}
