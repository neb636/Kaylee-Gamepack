// Mountain Bike's bike and its rider: Maple the beaver on the chibi rig (CANADA_LOOKS.maple, engine3d/characters/animal.ts)
// in her pink helmet (built here, worn on her head pivot), riding a little pink kids' mountain bike: knobbly black
// tires on white rims, a suspension fork, a disc brake, a chain and a chainguard, high-rise bars with white grips and
// pink-and-white streamers that flutter with her speed, a gold bell, a number plate with a heart and a mint bottle.
//
// The rig's body, head, arms and tail are Maple's own: she sits on the saddle leaning forward, her paws on the grips,
// and her flat tail lies out over the back wheel and flaps on the bumps. The rig's legs are part of its torso (little
// stubs for standing), so they're tucked up under her, and she pedals with two-bone legs in her own fur, from her hips
// to the pedals (the knee bending out in front). Her face blinks and her mouth opens with her voice (engine3d/
// characters/face.ts). She waves, cheers, rings the bell, comes out of a leaf pile covered in leaves, shakes off the
// creek and wobbles after a bonk: every pose eases in and settles, never a jump. The world (ride.ts) moves, turns and
// leans the whole thing and hands her the pose each frame.
import { Euler, Group, Mesh, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { buildAnimal, type Rig } from '../../../../engine3d/characters/animal'
import { FaceLife } from '../../../../engine3d/characters/face'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { CANADA_COLORS, CANADA_LOOKS } from '../../characters/looks'

const C = CANADA_COLORS
/** Maple on the bike (m to the top of her head when standing): a little bigger than on the map, to fit a kid's bike. */
const MH = 1.0
const FRAME = '#FF5FA2'
const FRAME_DARK = '#E2408A'
const WHITE = '#FFFFFF'
const TIRE = '#3E3646'
const SILVER = '#D6D2E2'
const BLACK = '#3A3242'
const WHEEL_R = 0.31
const REAR_Z = -0.5
const BB: V3 = [0, 0.29, -0.03]
const CRANK = 0.12
const HEAD_TOP: V3 = [0, 0.74, 0.34]
const HEAD_LOW: V3 = [0, 0.56, 0.4]
const RAKE = 0.32
/** The top of the saddle. */
const SADDLE: V3 = [0, 0.74, -0.25]
/** Her body leans this far forward on the bike (rad). */
const LEAN = 0.42
const WAVE_S = 1.3
const CHEER_S = 1.8
const LEAVES_S = 3.4
const SHAKE_S = 1.2
const WOBBLE_S = 0.9

const Y = new Vector3(0, 1, 0)
const tv = new Vector3()
const tv2 = new Vector3()
const tv3 = new Vector3()

/** A round bar from a to b (radius r): a frame tube. */
function tube(a: V3, b: V3, r: number, c: string, seg = 10, r2 = r): BufferGeometry {
  const d = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2])
  const len = d.length()
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(Y, d.normalize()))
  return P.cyl(r2, r, len, c, { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], rot: [e.x, e.y, e.z] }, seg)
}
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]

/** A limb bone: a rounded bar along +y, one meter long, stretched to fit between two points each frame. */
class Bone {
  readonly g = new Group()
  constructor(bag: Bag, r: number, c: string, parent: Group) {
    this.g.add(solid(merge([P.cyl(r, r * 0.9, 1, c, { at: [0, 0.5, 0] }, 10)]), bag, 2.5))
    parent.add(this.g)
  }
  set(a: Vector3, b: Vector3) {
    this.g.position.copy(a)
    tv2.subVectors(b, a)
    const len = tv2.length()
    this.g.quaternion.setFromUnitVectors(Y, tv2.multiplyScalar(1 / Math.max(1e-4, len)))
    this.g.scale.set(1, len, 1)
  }
}

/** Tucks the rig's standing legs up under her (they're baked into the torso): every vertex below `cut` moves up to it,
 *  inside her body, where the saddle and her pedalling legs cover the flat bottom. */
function tuckLegs(rig: Rig, cut: number) {
  rig.body.children[0].traverse((o) => {
    const geo = (o as Mesh).geometry as BufferGeometry | undefined
    const pos = geo?.attributes.position
    if (!pos) return
    for (let i = 0; i < pos.count; i++) if (pos.getY(i) < cut) pos.setY(i, cut)
    pos.needsUpdate = true
    geo.computeBoundingSphere()
  })
}

/** Her pink helmet, made for the rig's head (head-local): a dome with white vents, a visor, the strap under her chin, and
 *  two little fur ears on top (her own ears are under it). */
function helmet(rig: Rig, bag: Bag) {
  const { R, headY } = rig.face
  const lined: BufferGeometry[] = [
    P.sphere(1.08 * R, PAL.pink, { at: [0, headY + 0.42 * R, -0.14 * R], scale: [1.04, 0.76, 1.06] }, 26),
    // The visor above her eyes.
    P.sphere(0.6 * R, PAL.hotpink, { at: [0, headY + 0.62 * R, 0.74 * R], rot: [0.45, 0, 0], scale: [1.25, 0.16, 0.7] }, 20),
    // Her ears poke out of the top, like a kid's helmet with ears.
    ...[-1, 1].map((s) => P.sphere(0.2 * R, C.beaverFur, { at: [s * 0.6 * R, headY + 1.08 * R, -0.16 * R], scale: [1, 1, 0.7] })),
  ]
  const plain: BufferGeometry[] = [
    // The vents: three white stripes front to back.
    ...[-0.3, 0, 0.3].map((x) => P.capsule(0.06 * R, 0.85 * R, WHITE, { at: [x * R, headY + 1.22 * R - Math.abs(x) * 0.2 * R, -0.16 * R], rot: [Math.PI / 2, 0, x * 0.5], scale: [1, 1, 0.5] })),
    ...[-1, 1].map((s) => P.sphere(0.11 * R, C.beaverEar, { at: [s * 0.6 * R, headY + 1.08 * R, -0.06 * R], scale: [1, 1, 0.4] })),
    // The chin strap down each side, and its buckle.
    ...[-1, 1].map((s) => P.capsule(0.025 * R, 0.62 * R, BLACK, { at: [s * 0.86 * R, headY - 0.32 * R, 0.18 * R], rot: [0.25, 0, s * 0.3] })),
    P.sphere(0.06 * R, BLACK, { at: [0, headY - 0.92 * R, 0.45 * R], scale: [1.2, 0.7, 0.8] }),
  ]
  const g = solidMix(lined, plain, bag, 2.5)
  rig.head.add(g)
  return g
}

export interface RiderPose {
  /** Ground speed (m/s): the wheels turn, the pedals go round, the streamers flutter. */
  speed: number
  /** Pedalling (0 coasting .. 1 pedalling hard). */
  pedal: number
  /** The suspension squashed (m, + = down). */
  squash: number
  /** In the air: she stands up a little and tucks. */
  air: number
  /** Steering (-1..1): the front wheel turns that way (+ = toward her left, +x in the model). */
  steer: number
}

export class Rider {
  /** Placed and turned by the world (faces +z). */
  readonly root = new Group()
  /** Pitches with the slope and leans into the bends, round the wheels' contact. */
  readonly lean = new Group()
  /** The bike's frame and everything on it (dips with the suspension). */
  private bike = new Group()
  private rear = new Group()
  private front = new Group()
  private fork = new Group()
  private crank = new Group()
  private pedals: Group[] = []
  private streamers: Group[] = []
  /** Maple on the chibi rig. */
  readonly rig: Rig
  private face: FaceLife
  private seat = new Group()
  private hips: Vector3[] = []
  private thigh = 0.2
  private shin = 0.2
  private thighs: Bone[] = []
  private shins: Bone[] = []
  private knees: Group[] = []
  private feet: Group[] = []
  private leaves: Group
  readonly height = 1.75
  private crankA = 0
  private waveT = -1
  private cheerT = -1
  private ringT = -1
  private leavesT = -1
  private shakeT = -1
  private wobbleT = -1
  private tailA = 0
  private tailV = 0
  private armK = { lx: 0, lz: 0, rx: 0, rz: 0 }
  private lookY = 0

  constructor(bag: Bag) {
    this.root.add(this.lean)
    this.lean.add(this.bike)
    this.bike.scale.setScalar(1.12)

    // ---- The bike ----
    const rearAxle: V3 = [0, WHEEL_R, REAR_Z]
    const seatTop: V3 = [0, 0.62, -0.19]
    const stay = (x: number): V3 => [x, WHEEL_R, REAR_Z]
    this.bike.add(
      solid(
        merge([
          // The frame: a fat down tube, a top tube sloping back, the seat tube, the chain stays and seat stays.
          tube(BB, HEAD_LOW, 0.042, FRAME, 12, 0.05),
          tube(HEAD_TOP, seatTop, 0.034, FRAME),
          tube(BB, seatTop, 0.036, FRAME),
          tube(HEAD_LOW, HEAD_TOP, 0.048, FRAME_DARK, 12),
          tube([0.05, BB[1], BB[2]], stay(0.06), 0.022, FRAME),
          tube([-0.05, BB[1], BB[2]], stay(-0.06), 0.022, FRAME),
          tube([0.03, seatTop[1] - 0.02, seatTop[2]], stay(0.06), 0.02, FRAME),
          tube([-0.03, seatTop[1] - 0.02, seatTop[2]], stay(-0.06), 0.02, FRAME),
          // A white stripe band round the down tube.
          tube(lerp3(BB, HEAD_LOW, 0.45), lerp3(BB, HEAD_LOW, 0.62), 0.054, WHITE, 12),
          // The seat post and its clamp, the saddle (pink with a white nose).
          tube(seatTop, [0, SADDLE[1] - 0.03, SADDLE[2] + 0.01], 0.022, SILVER),
          P.cyl(0.04, 0.04, 0.03, BLACK, { at: [seatTop[0], seatTop[1], seatTop[2]], rot: [-0.35, 0, 0] }, 10),
          P.rbox(0.17, 0.05, 0.26, 0.024, PAL.hotpink, { at: [0, SADDLE[1] - 0.01, SADDLE[2] - 0.02] }),
          P.rbox(0.07, 0.045, 0.14, 0.02, WHITE, { at: [0, SADDLE[1] - 0.008, SADDLE[2] + 0.12] }),
          // The mint bottle in its cage on the down tube.
          P.capsule(0.036, 0.1, PAL.mint, { at: [0, 0.47, 0.17], rot: [-0.85, 0, 0] }),
          P.cyl(0.02, 0.02, 0.03, WHITE, { at: [0, 0.53, 0.24], rot: [-0.85, 0, 0] }, 8),
          // The chainring under a pink chainguard disc, the chain round to the rear cog, the derailleur.
          P.cyl(0.1, 0.1, 0.012, SILVER, { at: [0.055, BB[1], BB[2]], rot: [0, 0, Math.PI / 2] }, 18),
          P.cyl(0.115, 0.115, 0.008, PAL.pink, { at: [0.068, BB[1], BB[2]], rot: [0, 0, Math.PI / 2] }, 20),
          P.cyl(0.05, 0.05, 0.02, SILVER, { at: [0.055, WHEEL_R, REAR_Z], rot: [0, 0, Math.PI / 2] }, 12),
          tube([0.055, BB[1] + 0.1, BB[2]], [0.055, WHEEL_R + 0.05, REAR_Z], 0.008, BLACK, 5),
          tube([0.055, BB[1] - 0.1, BB[2]], [0.055, WHEEL_R - 0.05, REAR_Z], 0.008, BLACK, 5),
          P.rbox(0.025, 0.09, 0.04, 0.01, BLACK, { at: [0.07, WHEEL_R - 0.09, REAR_Z + 0.02] }),
          // The rear disc brake and its caliper.
          P.cyl(0.08, 0.08, 0.008, SILVER, { at: [-0.07, WHEEL_R, REAR_Z], rot: [0, 0, Math.PI / 2] }, 16),
          P.rbox(0.03, 0.05, 0.06, 0.012, BLACK, { at: [-0.075, WHEEL_R + 0.06, REAR_Z + 0.05] }),
          // A little kickstand folded up along the chain stay.
          tube([-0.07, BB[1] - 0.02, BB[2] - 0.12], [-0.08, WHEEL_R - 0.03, REAR_Z + 0.16], 0.012, SILVER, 6),
        ]),
        bag,
        2,
      ),
    )
    // The fork turns with the bars (the front wheel inside it).
    this.fork.position.set(...HEAD_TOP)
    this.fork.rotation.x = -RAKE
    this.bike.add(this.fork)
    this.front.position.set(0, -(HEAD_TOP[1] - WHEEL_R) / Math.cos(RAKE), 0)
    this.fork.add(this.front)
    this.rear.position.set(...rearAxle)
    this.bike.add(this.rear)
    for (const [w, disc] of [[this.front, 1], [this.rear, 0]] as const) w.add(this.wheel(bag, !!disc))

    this.crank.position.set(...BB)
    this.bike.add(this.crank)
    this.crank.add(solid(merge([tube([0.085, 0, 0], [0.085, CRANK, 0], 0.016, BLACK, 6), tube([-0.085, 0, 0], [-0.085, -CRANK, 0], 0.016, BLACK, 6), P.cyl(0.025, 0.025, 0.2, SILVER, { rot: [0, 0, Math.PI / 2] }, 8)]), bag, 1.5))
    for (const side of [1, -1]) {
      // The pedals stay level as the crank turns; her feet rest on them.
      const p = new Group()
      p.position.set(side * 0.12, side * CRANK, 0)
      p.add(solid(merge([P.rbox(0.08, 0.018, 0.085, 0.008, BLACK), P.box(0.085, 0.006, 0.02, '#FFB347', { at: [0, 0, 0.044] })]), bag, 1.5))
      this.crank.add(p)
      this.pedals.push(p)
    }

    // ---- Maple ----
    this.rig = buildAnimal({ ...CANADA_LOOKS.maple, height: MH }, bag)
    const rig = this.rig
    this.face = new FaceLife(rig, 'maple')
    // (The bike has its own shadow.)
    rig.root.children[0].visible = false
    tuckLegs(rig, 0.15 * MH)
    // (A little longer arms, to reach the bars and to show when she waves.)
    rig.armL.scale.setScalar(1.2)
    rig.armR.scale.setScalar(1.2)
    helmet(rig, bag)
    // Her bottom (the flat of her tucked body) on the saddle.
    this.seat.position.set(SADDLE[0], SADDLE[1] - 0.15 * MH + 0.012, SADDLE[2] + 0.02)
    this.seat.add(rig.root)
    this.bike.add(this.seat)
    rig.body.rotation.x = LEAN
    rig.head.rotation.x = -LEAN * 0.8
    this.setArms(1, 0, 0, 0)
    // Where her hips are (body-local), and how long her legs must be to reach the bottom of the pedal stroke.
    const legX = 0.085 * MH * (1 + ((CANADA_LOOKS.maple.chub ?? 1) - 1) * 0.7)
    for (const s of [1, -1]) this.hips.push(new Vector3(s * legX, 0.16 * MH, 0.03 * MH))
    this.bike.updateMatrixWorld(true)
    const hip = this.hipAt(0, tv)
    const reach = hip.distanceTo(tv3.set(...BB)) + CRANK
    this.thigh = reach * 0.52
    this.shin = reach * 0.52

    // The bars where her paws are: the stem rises from the fork up and back to them (a kid's high-rise bar).
    const paws = [rig.armR, rig.armL].map((a) => this.fork.worldToLocal(a.localToWorld(new Vector3(0.05 * MH * (a === rig.armR ? 1 : -1), -0.14 * MH, 0.005 * MH))))
    const barY = (paws[0].y + paws[1].y) / 2 - 0.035
    const barZ = (paws[0].z + paws[1].z) / 2
    const gx = Math.max(Math.abs(paws[0].x), Math.abs(paws[1].x))
    const bar = (x: number): V3 => [x, barY, barZ]
    const forkLeg = (x: number) => [
      // The suspension fork: silver stanchions out of the white lowers.
      tube([x, -0.02, 0], [x, -0.2, 0], 0.024, SILVER, 8),
      tube([x, -0.18, 0], [x, this.front.position.y, 0], 0.034, WHITE, 10),
    ]
    this.fork.add(
      solid(
        merge([
          ...forkLeg(0.07),
          ...forkLeg(-0.07),
          P.rbox(0.19, 0.05, 0.08, 0.02, WHITE, { at: [0, -0.02, 0] }),
          // The fork's arch, the steerer up into the stem.
          P.torus(0.07, 0.014, WHITE, { at: [0, -0.2, 0.03], rot: [0, 0, 0] }, Math.PI),
          tube([0, -0.02, 0], [0, 0.06, 0], 0.03, BLACK, 10),
          tube([0, 0.06, 0], [0, barY, barZ + 0.02], 0.026, BLACK, 10),
          // The bars (rising at the ends), the white grips, the gold bell, the number plate with a pink heart.
          tube(bar(-gx - 0.05), bar(gx + 0.05), 0.017, BLACK, 8),
          ...[1, -1].map((s) => tube(bar(s * (gx - 0.035)), bar(s * (gx + 0.06)), 0.026, WHITE, 10)),
          P.sphere(0.04, PAL.gold, { at: [-(gx - 0.08), barY + 0.035, barZ], scale: [1, 0.65, 1] }, 14),
          P.cyl(0.012, 0.012, 0.03, SILVER, { at: [-(gx - 0.08), barY + 0.012, barZ] }, 6),
          P.rbox(0.2, 0.15, 0.015, 0.03, WHITE, { at: [0, barY - 0.08, barZ + 0.06], rot: [-0.25, 0, 0] }),
        ]),
        bag,
        2,
      ),
    )
    // The heart on the plate (no outline, like a sticker).
    const hz = barZ + 0.07
    this.fork.add(solidMix([], [P.sphere(0.028, PAL.hotpink, { at: [0.018, barY - 0.07, hz], rot: [-0.25, 0, 0], scale: [1, 1, 0.3] }), P.sphere(0.028, PAL.hotpink, { at: [-0.018, barY - 0.07, hz], rot: [-0.25, 0, 0], scale: [1, 1, 0.3] }), P.box(0.04, 0.04, 0.008, PAL.hotpink, { at: [0, barY - 0.09, hz - 0.004], rot: [-0.25, 0, Math.PI / 4] })], bag, 0))
    // Streamers off the grips: three ribbons each, pinned at the bar end, streaming back in the wind.
    for (const s of [1, -1]) {
      const g = new Group()
      g.position.set(s * (gx + 0.065), barY, barZ)
      g.add(solid(merge([PAL.hotpink, WHITE, PAL.lavender].map((c, i) => P.box(0.012, 0.028, 0.2, c, { at: [s * 0.01 * i, -0.01 * i, -0.1], rot: [0.1 * i, s * 0.12 * (i - 1), 0] }))), bag, 1))
      this.fork.add(g)
      this.streamers.push(g)
    }

    for (let i = 0; i < 2; i++) {
      this.thighs.push(new Bone(bag, 0.068 * MH, C.beaverFur, this.bike))
      this.shins.push(new Bone(bag, 0.058 * MH, C.beaverFur, this.bike))
      const k = solid(P.sphere(0.066 * MH, C.beaverFur, {}, 12), bag, 2)
      this.bike.add(k)
      this.knees.push(k)
      // Her foot on the pedal, the light color like the rig's feet.
      const f = solid(P.sphere(0.07 * MH, C.beaverLight, { at: [0, 0.01, 0.03], scale: [1, 0.6, 1.35] }, 12), bag, 2)
      this.bike.add(f)
      this.feet.push(f)
    }
    // Leaves stuck all over her after a leaf pile (they fall off).
    const leafColors = ['#E8553F', '#F2873A', '#F5B83D', '#D9443A']
    const leaf = (at: V3, rot: V3, c: string) =>
      P.prism(
        [
          [0, -0.07],
          [0.03, -0.03],
          [0.06, -0.02],
          [0.035, 0.01],
          [0.05, 0.05],
          [0, 0.075],
          [-0.05, 0.05],
          [-0.035, 0.01],
          [-0.06, -0.02],
          [-0.03, -0.03],
        ],
        0.012,
        c,
        { at, rot },
      )
    this.leaves = solid(
      merge(
        Array.from({ length: 14 }, (_, i) => {
          const a = i * 2.4
          const onHead = i % 3 === 0
          const r = onHead ? rig.face.R * 1.05 : 0.17 * MH
          const y = onHead ? 0.52 * MH + rig.face.headY + 0.5 * rig.face.R : (0.24 + (i % 4) * 0.07) * MH
          return leaf([Math.sin(a) * r, y, Math.cos(a) * r], [a, a * 0.7, 0.4], leafColors[i % 4])
        }),
      ),
      bag,
      1,
    )
    this.leaves.visible = false
    rig.body.add(this.leaves)
  }

  private wheel(bag: Bag, front: boolean) {
    const spokes = Array.from({ length: 8 }, (_, i) => P.box(0.008, (WHEEL_R - 0.06) * 2, 0.008, '#F2EEF8', { rot: [(i * Math.PI) / 8, 0, 0] }))
    // Knobbly tire: chunky bumps all the way round the tread.
    const knobs = Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2
      const x = i % 2 ? 0.022 : -0.022
      return P.rbox(0.035, 0.03, 0.04, 0.01, TIRE, { at: [x, Math.cos(a) * (WHEEL_R - 0.002), Math.sin(a) * (WHEEL_R - 0.002)], rot: [a, 0, 0] })
    })
    const parts = [
      P.torus(WHEEL_R - 0.04, 0.045, TIRE, { rot: [0, Math.PI / 2, 0] }),
      P.torus(WHEEL_R - 0.085, 0.016, WHITE, { rot: [0, Math.PI / 2, 0] }),
      P.cyl(0.03, 0.03, 0.13, PAL.hotpink, { rot: [0, 0, Math.PI / 2] }, 10),
      ...spokes,
      ...knobs,
    ]
    // The front wheel's disc rotor (the rear one is on the frame, so it doesn't spin with the spokes).
    if (front) parts.push(P.cyl(0.075, 0.075, 0.008, SILVER, { at: [-0.07, 0, 0], rot: [0, 0, Math.PI / 2] }, 16))
    return solid(merge(parts), bag, 2)
  }

  /** Where her hip is (bike-local), for the pedalling legs. */
  private hipAt(i: number, out: Vector3) {
    this.rig.body.localToWorld(out.copy(this.hips[i]))
    return this.bike.worldToLocal(out)
  }

  /** Her arms: `bars` 1 = both paws on the grips; `up` raises the right one (a wave) or both (a cheer). Eased. */
  private setArms(bars: number, waveR: number, cheer: number, dt: number) {
    const { armL, armR } = this.rig
    // On the grips: reaching forward and a little out.
    const gripX = -1.5
    const gripZ = 0.2
    // (Up, out and forward: straight up, her short arms would hide behind her big head and her scarf.)
    const up = Math.max(waveR, cheer)
    // (Raised, a + x turn brings the paw forward, out in front of her scarf.)
    const rx = gripX * bars * (1 - up) + 0.7 * up
    const rz = gripZ * (1 - up) + (2.3 + (waveR > 0 ? Math.sin(this.waveT * 14) * 0.4 : Math.sin(this.cheerT * 18) * 0.12)) * up
    const lx = gripX * bars * (1 - cheer) + 0.7 * cheer
    const lz = -gripZ * (1 - cheer) - (2.3 + Math.sin(this.cheerT * 18 + 1) * 0.12) * cheer
    const k = dt ? 1 - Math.exp(-dt * 14) : 1
    const a = this.armK
    a.rx += (rx - a.rx) * k
    a.rz += (rz - a.rz) * k
    a.lx += (lx - a.lx) * k
    a.lz += (lz - a.lz) * k
    armR.rotation.set(a.rx, 0, a.rz)
    armL.rotation.set(a.lx, 0, a.lz)
  }

  /** She lets go with one hand and waves. */
  wave() {
    if (this.cheerT < 0) this.waveT = 0
  }
  /** Both arms up, a bounce on the saddle. */
  cheer() {
    this.cheerT = 0
    this.waveT = -1
  }
  /** The bell's wiggle (the world plays the ding). */
  ring() {
    this.ringT = 0
  }
  /** Covered in leaves (they fall off after a while). */
  leafy() {
    this.leavesT = 0
    this.leaves.visible = true
  }
  /** Shakes the creek off her head. */
  shake() {
    this.shakeT = 0
  }
  /** A wobble after a bonk on the rails. */
  wobble() {
    this.wobbleT = 0
  }
  /** She looks this way (rad, + = her left) for a moment: at an animal she's passing. */
  look(yaw: number) {
    this.lookY = yaw
  }
  get busy() {
    return this.waveT >= 0 || this.cheerT >= 0 || this.leavesT >= 0
  }
  /** Where her head is, in the world (leaves fall from there). */
  headAt(out: Vector3) {
    return this.rig.head.localToWorld(out.set(0, this.rig.face.headY, 0))
  }

  update(dt: number, t: number, pose: RiderPose) {
    const rig = this.rig
    this.face.update(dt)
    // ---- The wheels and the pedals ----
    const roll = (pose.speed * dt) / WHEEL_R
    this.rear.rotation.x += roll
    this.front.rotation.x += roll
    this.fork.rotation.y = clamp(pose.steer, -1, 1) * 0.3
    // Pedalling: a turn per half second hard, a lazy turn coasting; still in the air.
    const cadence = pose.air > 0.5 ? 0 : (0.6 + 1.8 * pose.pedal) * Math.min(1, pose.speed / 3) * Math.PI * 2
    this.crankA += cadence * dt
    this.crank.rotation.x = this.crankA
    for (const p of this.pedals) p.rotation.x = -this.crankA
    // The streamers stream back and flutter faster the quicker she goes.
    const wind = clamp(pose.speed / 8)
    this.streamers.forEach((g, i) => {
      g.rotation.x = -0.9 + wind * 0.75 + Math.sin(t * (6 + 14 * wind) + i) * (0.1 + 0.12 * wind)
      g.rotation.y = Math.sin(t * (5 + 10 * wind) + i * 2) * 0.15
    })

    // ---- Her body: leaning forward over the bars, bobbing with the suspension, up off the saddle in the air ----
    const sq = pose.squash
    this.bike.position.y = -sq * 0.3
    let cheer = 0
    if (this.cheerT >= 0) {
      this.cheerT += dt
      cheer = bell(span(this.cheerT, 0, CHEER_S))
      if (this.cheerT > CHEER_S) this.cheerT = -1
    }
    let shake = 0
    if (this.shakeT >= 0) {
      this.shakeT += dt
      shake = bell(span(this.shakeT, 0, SHAKE_S))
      if (this.shakeT > SHAKE_S) this.shakeT = -1
    }
    let wob = 0
    if (this.wobbleT >= 0) {
      this.wobbleT += dt
      wob = 1 - span(this.wobbleT, 0, WOBBLE_S)
      if (this.wobbleT > WOBBLE_S) this.wobbleT = -1
    }
    // Squash and stretch: down on a landing (the squash), up and tall in a cheer.
    const st = 1 - sq * 0.5 + cheer * 0.06
    rig.body.scale.set(1 / Math.sqrt(st), st, 1 / Math.sqrt(st))
    this.seat.position.y = SADDLE[1] - 0.15 * MH + 0.012 + pose.air * 0.07 + cheer * 0.06 + Math.abs(Math.sin(this.crankA)) * 0.008 * pose.pedal
    rig.body.rotation.x = LEAN + sq * 0.7 + pose.air * 0.1 - cheer * 0.35
    rig.body.rotation.z = Math.sin(this.crankA) * 0.035 * pose.pedal + Math.sin(this.wobbleT * 22) * 0.12 * wob
    // The head: looking down the trail (and where she's steering), at a friend she's passing, shaking off the water.
    this.lookY *= 1 - Math.min(1, dt * 0.8)
    const lookY = clamp(pose.steer, -1, 1) * 0.25 + this.lookY + Math.sin(t * 0.7) * 0.08 * (1 - Math.min(1, pose.speed / 6))
    rig.head.rotation.x = -LEAN * 0.8 - sq * 0.4 + cheer * 0.25
    rig.head.rotation.y += (lookY - rig.head.rotation.y) * Math.min(1, dt * 6)
    rig.head.rotation.z = Math.sin(this.shakeT * 30) * 0.3 * shake
    // The tail: a spring that flaps with the bumps, lying out over the back wheel.
    if (rig.tail) {
      this.tailV += (-120 * this.tailA - 9 * this.tailV + sq * 400 * dt * 60) * dt
      this.tailA = clamp(this.tailA + this.tailV * dt, -0.5, 0.5)
      rig.tail.rotation.x = LEAN * 0.55 + this.tailA + Math.sin(t * 5) * 0.03 + pose.air * 0.25
      rig.tail.rotation.y = Math.sin(this.shakeT * 26) * 0.4 * shake
    }

    // ---- Arms: on the bars, or waving, or up in a cheer ----
    let wave = 0
    if (this.waveT >= 0) {
      this.waveT += dt
      wave = bell(span(this.waveT, 0, WAVE_S))
      if (this.waveT > WAVE_S) this.waveT = -1
    }
    this.setArms(1, wave, cheer, dt)
    // The bell's flick of a thumb: the right paw taps forward.
    if (this.ringT >= 0) {
      this.ringT += dt
      const k = bell(span(this.ringT, 0, 0.45))
      rig.armL.rotation.x -= 0.25 * k
      this.fork.rotation.z = Math.sin(this.ringT * 40) * 0.04 * (1 - span(this.ringT, 0, 0.5))
      if (this.ringT > 0.5) this.ringT = -1
    }

    // ---- Legs: hip to pedal, the knee bending out in front ----
    this.bike.updateMatrixWorld(true)
    this.pedals.forEach((p, i) => {
      const side = i === 0 ? 1 : -1
      const hip = this.hipAt(i, tv).clone()
      const foot = p.getWorldPosition(tv3)
      this.bike.worldToLocal(foot)
      foot.y += 0.03
      // In the air she stands a little on the pedals: the feet stay, the hips rise (the legs straighten).
      const d = tv2.subVectors(foot, hip)
      const len = Math.min(d.length(), this.thigh + this.shin - 0.005)
      // Two bones: the knee sits where both lengths meet, pushed forward and a little out.
      const a = (this.thigh * this.thigh - this.shin * this.shin + len * len) / (2 * len)
      const h = Math.sqrt(Math.max(0, this.thigh * this.thigh - a * a))
      const dir = d.clone().normalize()
      const fwd = new Vector3(0, 0, 1).sub(dir.clone().multiplyScalar(dir.z)).normalize()
      const knee = hip.clone().addScaledVector(dir, a).addScaledVector(fwd, h)
      knee.x += side * 0.035
      const end = hip.clone().addScaledVector(dir, len)
      this.thighs[i].set(hip, knee)
      this.shins[i].set(knee, end)
      this.knees[i].position.copy(knee)
      this.feet[i].position.copy(end)
      this.feet[i].position.y -= 0.02
    })

    // ---- The leaves ----
    if (this.leavesT >= 0) {
      this.leavesT += dt
      const k = span(this.leavesT, LEAVES_S - 0.6, LEAVES_S)
      this.leaves.scale.setScalar(1 - k)
      this.leaves.rotation.y = Math.sin(this.leavesT * 2) * 0.2
      if (this.leavesT > LEAVES_S) {
        this.leavesT = -1
        this.leaves.visible = false
      }
    }
  }
}
