// Tuque the snowman as a toy (characters/toy.ts ToyActor): the snowman she builds at Quebec City's Winter Carnival,
// who wakes up and joins Maple's team. Three snowballs, a red tuque with a white pom-pom, the carnival's striped sash,
// coal eyes that blink, a carrot nose, a coal smile that opens when he talks, and two stick arms with red mittens.
// On the team he wears the pink scarf (`scarf(true)`), and nothing gets past his tummy.
import { Group, Vector3 } from 'three'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid, solidMix } from '../../../engine3d/geo'
import { CANADA_COLORS } from './looks'
import { ToyActor, type ToyPose } from './toy'

const SNOW = '#FFFFFF'
const SHADE = '#E9F0FB'
const RED = '#E8443F'
const COAL = '#2E2A3A'
const CARROT = '#FF9A3C'
const TWIG = '#8A6A58'

export class Tuque extends ToyActor {
  private top = new Group()
  private eyes: Group
  private mouth: Group
  private armL = new Group()
  private armR = new Group()
  private team: Group
  private headAt: Vector3

  constructor(bag: Bag, o: { height?: number; voice?: string | null } = {}) {
    super(o.height ?? 1.25, o.voice === null ? undefined : (o.voice ?? 'snowman'))
    const H = this.height
    const px = 2.4
    // The bottom and middle balls, the sash round the middle with its tail, three coal buttons.
    const sash = ['#E8443F', '#FFC83D', '#4F8FE8', '#5DB27F']
    this.body.add(
      solid(
        merge([
          P.sphere(0.3 * H, SNOW, { at: [0, 0.25 * H, 0], scale: [1.05, 0.86, 1.05] }, 20),
          P.sphere(0.225 * H, SNOW, { at: [0, 0.57 * H, 0], scale: [1.04, 0.9, 1.04] }, 18),
          P.sphere(0.12 * H, SHADE, { at: [0.12 * H, 0.12 * H, 0.2 * H], scale: [1, 0.5, 0.6] }, 8),
          ...sash.map((c, i) => P.torus(0.232 * H, 0.016 * H, c, { at: [0, (0.5 + i * 0.022) * H, 0], rot: [Math.PI / 2, 0, 0] })),
          ...sash.map((c, i) => P.rbox(0.022 * H, 0.2 * H, 0.02 * H, 0.006 * H, c, { at: [(-0.2 + i * 0.022) * H, 0.42 * H, 0.13 * H], rot: [0.2, 0, 0.18] })),
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
    this.body.add(this.team)
    // The stick arms, pivoting at the shoulders, a red mitten on each.
    for (const [g, s] of [
      [this.armL, -1],
      [this.armR, 1],
    ] as const) {
      g.position.set(s * 0.2 * H, 0.62 * H, 0)
      g.add(
        solid(
          merge([
            P.cyl(0.014 * H, 0.018 * H, 0.3 * H, TWIG, { at: [s * 0.14 * H, 0, 0], rot: [0, 0, Math.PI / 2] }, 6),
            P.cyl(0.01 * H, 0.012 * H, 0.09 * H, TWIG, { at: [s * 0.2 * H, 0.04 * H, 0], rot: [0, 0, s * -0.7] }, 5),
            P.sphere(0.055 * H, RED, { at: [s * 0.31 * H, 0, 0], scale: [1.1, 0.9, 0.8] }, 10),
          ]),
          bag,
          1.8,
        ),
      )
      this.body.add(g)
    }
    // The head: its own pivot (it nods and turns), the tuque, the carrot, the coal face.
    const R = 0.17 * H
    this.top.position.set(0, 0.76 * H, 0)
    this.headAt = new Vector3(0, R * 0.9, 0)
    const on = (x: number, y: number): [number, number, number] => [x, R * 0.9 + y, Math.sqrt(Math.max(0, R * R - x * x - y * y))]
    this.top.add(
      solid(
        merge([
          P.sphere(R, SNOW, { at: [0, R * 0.9, 0] }, 18),
          // The tuque: a red cap with a rolled white brim, flopping to one side, a pom-pom on the end.
          P.sphere(R * 1.03, RED, { at: [0, R * 1.22, -0.01 * H], scale: [1, 0.72, 1] }, 16),
          P.torus(R * 0.94, R * 0.2, SNOW, { at: [0, R * 1.2, 0], rot: [Math.PI / 2 - 0.12, 0, 0] }),
          P.cone(R * 0.62, R * 1.1, RED, { at: [R * 0.5, R * 2.02, -0.02 * H], rot: [0, 0, -0.75] }, 12),
          P.sphere(R * 0.3, SNOW, { at: [R * 1.02, R * 2.32, -0.02 * H] }, 10),
          P.cone(R * 0.16, R * 0.75, CARROT, { at: [0, R * 0.86, R * 1.3], rot: [Math.PI / 2, 0, 0] }, 8),
        ]),
        bag,
        px,
      ),
    )
    this.eyes = new Group()
    this.eyes.position.set(0, R * 1.05, 0)
    const eye = [-1, 1].flatMap((s) => {
      const [x, , z] = on(s * R * 0.4, 0.15 * R)
      return [P.sphere(R * 0.16, COAL, { at: [x, 0, z], scale: [1, 1.2, 0.5] }, 10), P.sphere(R * 0.05, SNOW, { at: [x + R * 0.04, R * 0.07, z + R * 0.07] }, 6)]
    })
    this.eyes.add(solidMix([], eye, bag, 0))
    // The coal smile: five little coals in a curve; it opens (a dark oval) when he talks.
    this.mouth = new Group()
    const [, my, mz] = on(0, -0.42 * R)
    this.mouth.position.set(0, my, mz)
    const smile = [-2, -1, 0, 1, 2].map((i) => P.sphere(R * 0.055, COAL, { at: [i * R * 0.15, Math.abs(i) * Math.abs(i) * R * 0.035, -Math.abs(i) * R * 0.03], scale: [1, 1, 0.5] }, 6))
    this.mouth.add(solidMix([], smile, bag, 0))
    this.talkHole = solidMix([], [P.sphere(R * 0.2, '#5A2A3A', { scale: [1.15, 1, 0.3] }, 10)], bag, 0)
    this.talkHole.position.set(0, my - R * 0.03, mz + R * 0.01)
    this.talkHole.visible = false
    this.top.add(this.eyes, this.mouth, this.talkHole)
    this.body.add(this.top)
  }
  private talkHole: Group

  /** The team's pink scarf: on when he joins. */
  scarf(on: boolean) {
    this.team.visible = on
    return this
  }

  head(out = new Vector3()) {
    return this.top.localToWorld(out.copy(this.headAt))
  }

  protected animate(p: ToyPose, _dt: number, t: number) {
    const happy = p.face?.kind === 'happy' ? p.face.k : 0
    const wow = p.face?.kind === 'wow' ? p.face.k : 0
    this.top.rotation.set(p.nod - wow * 0.12, p.headTurn, 0.14 * p.wave - 0.25 * p.shake + happy * 0.1 * Math.sin(t * 9))
    this.eyes.scale.y = Math.min(p.lid, 1 - p.droop * 0.4 - happy * 0.65) * (1 + wow * 0.25)
    const talking = p.talk > 0.04 || wow > 0.3
    this.talkHole.visible = talking
    this.mouth.visible = !talking
    if (talking) this.talkHole.scale.set(0.6 + 0.4 * Math.max(p.talk, wow * 0.6), 0.3 + Math.max(p.talk, wow * 0.8), 1)
    // The arms: out to the sides, a little up; both up for a cheer, the right one waving.
    const up = p.armsUp * 1.1
    this.armR.rotation.set(0, 0, 0.12 + up + p.wave * (0.9 + 0.3 * Math.sin(t * 15)) + 0.4 * Math.abs(p.shake) - p.droop * 0.5)
    this.armL.rotation.set(0, 0, -(0.12 + up + 0.4 * Math.abs(p.shake) - p.droop * 0.5))
  }
}
