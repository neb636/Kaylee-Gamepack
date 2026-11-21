// Whale Peek-a-Boo's whales as characters (planning/around-the-world/canada-round-2.md, section 3): the grey whale, the
// humpback and the orca family (Grandma, Mama and the baby with Ollie's rock). Toy-cute but true to the real animals,
// built on body.ts so everything sits on the skin:
//
//   grey whale  mottled slate grey, a narrow arched head that slopes down to the snout, no dorsal fin but a hump and a
//               row of "knuckles" along the back, crusty barnacle patches (with orange whale lice) on the head and
//               back, short pointed paddle flippers, a double blowhole (its spout is a V).
//   humpback    blue-black on top, a white throat full of grooves, knobbly bumps on its head, a little fin on a hump,
//               the longest flippers of any whale (white, with knobs along the front edge), a scalloped tail that is
//               white underneath.
//   orca        black, a white chin and belly that sweeps up onto the flanks, the white patch above each eye, a grey
//               saddle behind the tall dorsal fin, round paddle flippers. The baby is small, round-headed and peachy
//               where the grown-ups are white (real calves are), with big eyes.
//
// Each has a face: eyes that blink and look at the boat (`look`), a smile, pink cheeks. The world (watch.ts) moves the
// root over the water and plays their moves; each move eases in and settles, and pivots where the whale really would
// (the body turns about its middle; the flukes on the tail stock; the flippers at the shoulder).
//
// Frames: `root` sits on the water (y 0) and turns to face its way (rotation.y, 0 = +z); `body` holds the pose (how
// high, nose up or down, rolled over); the body's middle is its origin. Body-local +z is the head.
import { DoubleSide, Group, Matrix4, Mesh, MeshBasicMaterial, Shape, ShapeGeometry, Vector3, type Object3D } from 'three'
import { bell, clamp, span } from '../../../../../sdk'
import { damp } from '../../../../../sdk/math'
import type { Bag } from '../../../../engine3d/dispose'
import { P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { fin, finEdge, Hull, skinPatch, skinSpot, tube, type FinSec, type Sec } from './body'

const INK = PAL.ink
const tA = new Vector3()
const tB = new Vector3()
const tC = new Vector3()
const ease = (k: number) => k * k * (3 - 2 * k)
const back = (k: number) => {
  // Ease out with a little overshoot (a pop up).
  const c = 1.9
  const u = k - 1
  return 1 + (c + 1) * u * u * u + c * u * u
}
/** A steady pseudo-random number for a seed (the same whale every time). */
const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 31.7) * 43758.5453
  return v - Math.floor(v)
}

// ---------------------------------------------------------------- the face

/** One eye on the skin: a white with a big dark iris that turns to look, two shines, and a happy arc for laughing. */
class Eye {
  readonly root = new Group()
  private iris = new Group()
  private open = new Group()
  private happy: Group
  constructor(
    bag: Bag,
    readonly r: number,
    lash: boolean,
    /** +1 on the whale's left (its tail is to +x in the eye's frame), -1 on its right. */
    side: number,
  ) {
    const R = r
    // (The eye's +z points out of the skin; +y is up the head. Lashes at the corner toward the tail.)
    this.open.add(
      solidMix(
        [P.sphere(R, '#FFFFFF', { scale: [1, 1.08, 0.5] }, 16)],
        lash ? [0, 1].map((i) => P.box(R * 0.5, R * 0.13, R * 0.13, INK, { at: [side * R * (0.7 + i * 0.12), R * (0.82 - i * 0.28), R * 0.14], rot: [0, 0, side * (-0.5 + i * 0.45)] })) : [],
        bag,
        1.5,
      ),
    )
    this.iris.add(solidMix([], [P.sphere(R * 0.68, INK, { scale: [1, 1.1, 0.5] }, 14), P.sphere(R * 0.24, '#FFFFFF', { at: [-R * 0.22, R * 0.28, R * 0.32] }, 8), P.sphere(R * 0.11, '#FFFFFF', { at: [R * 0.2, -R * 0.22, R * 0.33] }, 6)], bag, 0))
    this.iris.position.z = R * 0.2
    this.open.add(this.iris)
    this.root.add(this.open)
    // Laughing: the eye squeezed into a happy upside-down U.
    this.happy = solidMix([], [P.torus(R * 0.62, R * 0.16, INK, { at: [0, -R * 0.2, R * 0.32], scale: [1, 1.1, 0.6] }, Math.PI)], bag, 0)
    this.happy.visible = false
    this.root.add(this.happy)
  }
  /** Looks toward a point (world), or straight out (null); `lid` 1 open .. 0 shut; `laugh` squeezes it into a U. */
  update(look: Vector3 | null, lid: number, laugh: boolean, dt: number) {
    this.happy.visible = laugh
    this.open.visible = !laugh
    this.open.scale.y = Math.max(0.08, lid)
    let x = 0
    let y = 0
    if (look) {
      const l = this.root.worldToLocal(tA.copy(look))
      const d = Math.max(1e-3, l.length())
      x = clamp(l.x / d, -1, 1)
      y = clamp(l.y / d, -1, 1)
      // (Something behind the eye: look as far round as it can.)
      if (l.z < 0) x = x >= 0 ? 1 : -1
    }
    const m = this.r * 0.36
    const k = damp(dt, 8)
    this.iris.position.x += (x * m - this.iris.position.x) * k
    this.iris.position.y += (y * m * 0.8 - this.iris.position.y) * k
  }
}

/** Sits a thing on the skin at (s, a): its +z out of the skin, its +y as near the body's up as it can be (or toward
 *  the head, on top of the back). */
function onSkin(o: Object3D, hull: Hull, s: number, a: number, push = 0) {
  const p = hull.at(s, a, push, tA)
  const n = hull.normal(s, a, tB)
  const up = Math.abs(n.y) > 0.9 ? tC.set(0, 0, 1) : tC.set(0, 1, 0)
  up.addScaledVector(n, -up.dot(n)).normalize()
  const x = new Vector3().crossVectors(up, n).normalize()
  o.position.copy(p)
  o.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(x, up, n))
}

// ---------------------------------------------------------------- shared parts

/** A five-armed sea star (orange, with white dots), lying flat in xz, about `r` m across each arm. */
export function seaStar(bag: Bag, r = 0.28, color = '#FF8A5C') {
  const arms = Array.from({ length: 5 }, (_, i) => {
    const a = (i * Math.PI * 2) / 5
    return P.capsule(r * 0.24, r * 0.7, color, { at: [Math.sin(a) * r * 0.55, 0, Math.cos(a) * r * 0.55], rot: [Math.PI / 2, a, 0], scale: [1, 1, 0.7] })
  })
  const dots = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.floor(i / 2) * Math.PI * 2) / 5
    const d = r * (i % 2 ? 0.75 : 0.42)
    return P.sphere(r * 0.06, '#FFF4E6', { at: [Math.sin(a) * d, r * 0.13, Math.cos(a) * d] }, 6)
  })
  const face = [P.sphere(r * 0.07, INK, { at: [-r * 0.1, r * 0.17, r * 0.05] }, 6), P.sphere(r * 0.07, INK, { at: [r * 0.1, r * 0.17, r * 0.05] }, 6), P.torus(r * 0.07, r * 0.02, INK, { at: [0, r * 0.17, -r * 0.06], rot: [-Math.PI / 2, 0, Math.PI] }, Math.PI)]
  return solidMix([...arms, P.sphere(r * 0.34, color, { scale: [1, 0.55, 1] })], [...dots, ...face], bag, 1.5)
}

/** A little music note (for the humpback's song), flat, about 1 m tall; white with a plum shadow. */
export function noteMesh(bag: Bag) {
  const s = new Shape()
  // A round head at the bottom left, a stem up its right side and a flag.
  s.absarc(-0.18, -0.32, 0.2, 0, Math.PI * 2, false)
  const head = new ShapeGeometry(s, 16)
  const stem = new Shape()
  stem.moveTo(-0.02, -0.3)
  stem.lineTo(0.06, -0.3)
  stem.lineTo(0.06, 0.38)
  stem.quadraticCurveTo(0.3, 0.3, 0.32, 0.05)
  stem.quadraticCurveTo(0.2, 0.22, 0.06, 0.24)
  stem.lineTo(-0.02, 0.5)
  stem.lineTo(-0.02, -0.3)
  const flag = new ShapeGeometry(stem)
  const g = new Group()
  for (const [geo, c, z] of [
    [head, '#6B4C9A', -0.02],
    [flag, '#6B4C9A', -0.02],
    [head.clone(), '#FFFFFF', 0],
    [flag.clone(), '#FFFFFF', 0],
  ] as const) {
    const m = new Mesh(bag.add(geo), bag.add(new MeshBasicMaterial({ color: c, transparent: true, depthWrite: false, side: DoubleSide })))
    m.position.set(c === '#FFFFFF' ? 0 : 0.06, c === '#FFFFFF' ? 0 : -0.06, z)
    m.renderOrder = 5
    g.add(m)
  }
  return g
}

// ---------------------------------------------------------------- the base

export type WhaleKind = 'grey' | 'humpback' | 'orca' | 'baby'

/** A zone she can touch, on the skin (body frame). */
export interface Zone {
  s: number
  a: number
  /** Meters out from the skin (the middle of the zone). */
  push?: number
}

/** What the whale is doing: a move with its own clock (`t` seconds in, `len` long) and an argument. */
interface Move {
  kind: string
  t: number
  len: number
  k: number
}

export abstract class Whale {
  readonly root = new Group()
  readonly body = new Group()
  readonly flukes = new Group()
  readonly flipL = new Group()
  readonly flipR = new Group()
  readonly hull: Hull
  abstract readonly kind: WhaleKind
  /** Body length, snout to tail stock (the flukes go a little further). */
  readonly len: number
  protected eyes: Eye[] = []
  protected bag: Bag
  /** The flippers' resting angle, out from the body (a humpback holds its long ones out at the surface). */
  protected flipRest = 0
  /** The flukes' resting lift (radians, + raises their tips): a grey whale floats with its flukes just awash. */
  protected flukeRest = 0
  /** Where the eyes look (world), or null. */
  look: Vector3 | null = null
  /** 0 hidden under the water .. 1 up at the surface for play. */
  protected up = 0
  protected upGoal = 0
  protected move: Move | null = null
  protected phase = Math.random() * 6
  private blinkT = 1 + Math.random() * 2
  private blink = -1
  protected laughT = 0
  /** Events this frame (the world sprays, splashes, plays a sound). */
  blew = false
  splashed = false
  /** How big this frame's splash is (0..1). */
  splashSize = 0
  /** A move just ended (its kind). */
  ended: string | null = null
  /** Zones she can touch (body frame). */
  abstract readonly zones: Record<string, Zone>

  constructor(bag: Bag, opts: { len: number; z0: number; secs: Sec[]; nose?: number; tail?: number; belly?: number }) {
    this.bag = bag
    this.len = opts.len
    this.hull = new Hull({ len: opts.len, z0: opts.z0, secs: opts.secs, nose: opts.nose, tail: opts.tail, belly: opts.belly })
    this.root.add(this.body)
    this.body.add(this.flukes, this.flipL, this.flipR)
    this.body.rotation.order = 'XYZ'
    this.root.visible = false
  }

  /** The tail stock's end (the flukes' pivot), body frame. */
  protected stockAt(out: Vector3) {
    return this.hull.at(0, Math.PI / 2, 0, out).setX(0).setY(this.hull.sec(0).y)
  }

  /** Puts the eyes on the skin at (s, ±a). */
  protected addEyes(s: number, a: number, r: number, lash = false) {
    for (const side of [1, -1]) {
      const e = new Eye(this.bag, r, lash, side)
      onSkin(e.root, this.hull, s, side * a, -r * 0.18)
      this.body.add(e.root)
      this.eyes.push(e)
    }
  }

  /** The smile: a line along the mouth from near the snout (s0) back toward the eye (s1), curling up at its end, and
   *  a pink cheek at (cs, ca) on each side. */
  protected addSmile(s0: number, s1: number, a: number, curl: number, r: number, cheek: { s: number; a: number; r: number }) {
    const parts = []
    for (const side of [1, -1]) {
      const pts: Vector3[] = []
      for (let i = 0; i <= 24; i++) {
        const k = i / 24
        const s = s0 + (s1 - s0) * k
        const aa = side * (a - curl * Math.max(0, (k - 0.7) / 0.3) ** 1.6)
        pts.push(this.hull.at(s, aa, r * 0.3))
      }
      parts.push(tube(pts, r, INK))
      const c = new Group()
      onSkin(c, this.hull, cheek.s, side * cheek.a, 0)
      c.updateMatrix()
      parts.push(P.sphere(cheek.r, PAL.pink, { scale: [1.35, 0.8, 0.16] }, 12).applyMatrix4(c.matrix))
    }
    this.body.add(solidMix([], parts, this.bag, 0))
  }

  /** A zone's middle in the world (`side` -1: mirrored onto its right side). */
  zoneAt(id: string, out = new Vector3(), side = 1) {
    const z = this.zones[id]
    this.body.updateWorldMatrix(true, false)
    return this.body.localToWorld(this.hull.at(z.s, z.a * side, z.push ?? 0, out))
  }

  /** On screen at all (up, or doing something). */
  get visible() {
    return this.root.visible
  }
  get busy() {
    return !!this.move
  }
  /** Doing this move now. */
  doing(kind: string) {
    return this.move?.kind === kind
  }
  get isUp() {
    return this.up > 0.6 && this.root.visible
  }

  protected play(kind: string, len: number, k = 1) {
    this.move = { kind, t: 0, len, k }
  }

  /** Pops up out of the water here (peek-a-boo!). */
  rise() {
    this.root.visible = true
    this.upGoal = 1
    this.play('rise', 1.3)
  }
  /** Dives away (the flukes wave goodbye). */
  dive() {
    this.play('dive', 2.4)
  }
  /** Gone at once (a link that starts later; the finale's end). */
  hide() {
    this.root.visible = false
    this.up = this.upGoal = 0
    this.move = null
  }
  /** Up at once (a link that starts here). */
  surfaceNow() {
    this.root.visible = true
    this.up = this.upGoal = 1
    this.move = null
  }
  /** Breathes out of the top of its head (the world sprays the spout when `blew`). */
  blow() {
    this.play('blow', 1.3)
  }
  /** A leap out of the water in an arc (all the whales jump together). */
  leap() {
    this.root.visible = true
    this.upGoal = 1
    this.play('leap', 2.2)
  }
  /** Laughs (happy eyes, a giggle of the whole body) for `s` seconds. */
  laugh(s = 1.4) {
    this.laughT = s
  }

  /** The pose this frame: how high the middle is, nose up (-) or down (+), roll, flippers out, the flukes. */
  protected pose = { y: 0, pitch: 0, roll: 0, flipL: 0, flipR: 0, fluke: 0, fwd: 0, scale: 1 }

  /** Floating at the surface for play (body middle height, pitch), per kind. */
  protected abstract floatPose(): { y: number; pitch: number }

  update(dt: number, t: number) {
    this.blew = this.splashed = false
    this.splashSize = 0
    this.ended = null
    if (!this.root.visible) return
    const p = this.pose
    const f = this.floatPose()
    // Up or under (smoothly), a slow bob on the swell, breathing.
    this.up += (this.upGoal - this.up) * damp(dt, 2.2)
    const hidden = -this.len * 0.45
    p.y = hidden + (f.y - hidden) * this.up + Math.sin(t * 1.3 + this.phase) * 0.07
    p.pitch = f.pitch * this.up + Math.sin(t * 0.9 + this.phase) * 0.025
    p.roll = Math.sin(t * 0.7 + this.phase) * 0.03
    p.flipL = this.flipRest * this.up + Math.sin(t * 1.4 + this.phase) * 0.12
    p.flipR = -this.flipRest * this.up - Math.sin(t * 1.4 + this.phase + 0.4) * 0.12
    p.fluke = this.flukeRest * this.up + Math.sin(t * 1.6 + this.phase) * 0.18
    p.fwd = 0
    p.scale = 1 + Math.sin(t * 1.1 + this.phase) * 0.012
    const m = this.move
    if (m) {
      m.t += dt
      const q = Math.min(1, m.t / m.len)
      this.act(m, q, dt, t)
      if (m.t >= m.len && this.move === m) {
        this.move = null
        this.ended = m.kind
      }
    }
    // Laughing: a wiggle and happy eyes.
    if (this.laughT > 0) {
      this.laughT -= dt
      p.roll += Math.sin(t * 22) * 0.06 * Math.min(1, this.laughT * 3)
      p.y += Math.abs(Math.sin(t * 11)) * 0.06
    }
    this.body.position.set(0, p.y, p.fwd)
    this.body.rotation.set(p.pitch, 0, p.roll)
    this.body.scale.set(p.scale, 2 - p.scale, 1)
    this.flipL.rotation.z = p.flipL
    this.flipR.rotation.z = p.flipR
    this.flukes.rotation.x = p.fluke
    // The face: blink every few seconds, look at the boat.
    this.blinkT -= dt
    if (this.blinkT <= 0) {
      this.blink = 0
      this.blinkT = Math.random() < 0.2 ? 0.25 : 2.4 + Math.random() * 3
    }
    let lid = 1
    if (this.blink >= 0) {
      this.blink += dt / 0.18
      lid = 1 - bell(Math.min(1, this.blink))
      if (this.blink >= 1) this.blink = -1
    }
    this.body.updateWorldMatrix(true, true)
    for (const e of this.eyes) e.update(this.look, lid, this.laughT > 0, dt)
  }

  /** A move's own part of the pose (`q` 0..1 through it). */
  protected act(m: Move, q: number, _dt: number, t: number) {
    const p = this.pose
    if (m.kind === 'rise') {
      // From below with a little overshoot: nose first, a splash as the head breaks the surface.
      const k = clamp(q * 1.15)
      const hidden = -this.len * 0.45
      const f = this.floatPose()
      p.y = hidden + (f.y + 0.05 - hidden) * back(k)
      this.up = 1
      p.pitch = f.pitch - 0.35 * (1 - k)
      p.flipL = p.flipR = 0.5 * bell(k)
      if (m.t - _dt < 0.45 && m.t >= 0.45) {
        this.splashed = true
        this.splashSize = 0.45
      }
    } else if (m.kind === 'blow') {
      // A breath in (puffs up a little), then out of the blowhole with a dip.
      p.scale += 0.05 * bell(span(q, 0, 0.35)) - 0.03 * bell(span(q, 0.35, 0.7))
      p.y += 0.12 * bell(span(q, 0, 0.35)) - 0.1 * bell(span(q, 0.35, 0.8))
      p.pitch -= 0.06 * bell(span(q, 0, 0.35))
      if (m.t - _dt < 0.42 && m.t >= 0.42) this.blew = true
    } else if (m.kind === 'leap') {
      // Out in an arc: nose up from under, over the top, nose down back in (turning about its middle).
      const L = this.len
      const h = 0.4 * L + 0.6
      p.y = -0.3 * L + (h + 0.3 * L) * Math.sin(Math.PI * q)
      p.pitch = -1 + 2 * q
      p.fwd = (q - 0.5) * L * 0.9
      p.flipL = 0.6
      p.flipR = -0.6
      p.fluke = Math.sin(m.t * 8) * 0.3
      if (m.t - _dt < m.len * 0.88 && m.t >= m.len * 0.88) {
        this.splashed = true
        this.splashSize = 0.7
      }
    } else if (m.kind === 'dive') {
      // A nod, nose down under the water, the back rolling over, the flukes rising out and waving goodbye, and under.
      const f = this.floatPose()
      const down = ease(span(q, 0.1, 0.8))
      p.pitch = f.pitch + (0.95 * down - 0.25 * bell(span(q, 0, 0.2)))
      p.y = f.y - this.len * 0.12 * down - this.len * 0.25 * ease(span(q, 0.7, 1))
      p.fwd = this.len * 0.25 * down
      p.fluke = -0.55 * bell(span(q, 0.4, 1)) + Math.sin(t * 9) * 0.2 * bell(span(q, 0.5, 0.95))
      if (q >= 1) {
        this.upGoal = this.up = 0
        this.root.visible = false
      }
      if (m.t - _dt < m.len * 0.85 && m.t >= m.len * 0.85) {
        this.splashed = true
        this.splashSize = 0.3
      }
    }
  }
}

// ---------------------------------------------------------------- the grey whale

const GREY = '#8790A3'
const GREY_LIGHT = '#C3C9D5'
const GREY_DARK = '#6C7589'
const GREY_BELLY = '#A4ABBA'
const BARNACLE = '#F1EADB'
const LICE = '#F2A66A'
/** How far the grey whale tips nose-down to lift its tail (radians, on top of floating). */
const SHOW_PITCH = 0.95

export class GreyWhale extends Whale {
  readonly kind = 'grey' as const
  // (Spread out along the body so each is its own target even on a phone: the tail, the hump on its back, the
  // barnacle crust on its flank, the blowhole. The barnacles' `a` is for its left side; the world mirrors it to the
  // side the camera sees, `zoneAt(id, out, side)`.)
  readonly zones: Record<string, Zone> = {
    blowhole: { s: 0.79, a: 0, push: 0.3 },
    back: { s: 0.36, a: 0, push: 0.1 },
    barnacles: { s: 0.6, a: 0.75, push: 0.05 },
    tail: { s: 0.02, a: 0, push: 0 },
  }
  /** The sea star on its fluke (shown by `tailUp(true)`). */
  readonly star: Group
  private rollSide = 1
  constructor(bag: Bag) {
    const L = 7.2
    super(bag, {
      len: L,
      z0: -L * 0.5,
      nose: 0.06,
      tail: 0.02,
      belly: 2.3,
      secs: [
        { s: 0, w: 0.17, h: 0.3, y: 0.06 },
        { s: 0.12, w: 0.3, h: 0.5, y: 0.08 },
        { s: 0.3, w: 0.7, h: 0.84, y: 0.05 },
        { s: 0.5, w: 1.0, h: 1.0, y: 0 },
        { s: 0.66, w: 0.97, h: 0.94, y: -0.02 },
        { s: 0.78, w: 0.82, h: 0.8, y: -0.06 },
        { s: 0.88, w: 0.6, h: 0.6, y: -0.13 },
        { s: 0.96, w: 0.38, h: 0.4, y: -0.21 },
        { s: 1, w: 0.26, h: 0.28, y: -0.25 },
      ],
    })
    const hull = this.hull
    // The skin: slate grey, paler underneath, mottled with pale blotches and a few darker freckles (crisp patches on
    // the skin, skinSpot).
    this.body.add(solid(hull.geometry(() => GREY, 60, 36), bag, 2.5))
    const skin = [skinPatch(hull, 0.06, 0.97, (s) => 2.35 + 0.15 * span(s, 0.8, 1), (s) => Math.PI * 2 - 2.35 - 0.15 * span(s, 0.8, 1), GREY_BELLY, 0.01, 32, 12)]
    for (let i = 0; i < 38; i++) {
      const s = 0.12 + rnd(i * 5.3 + 2) * 0.8
      const a = (rnd(i * 9.7 + 1) - 0.5) * 2 * 2.2
      // (Not on its face: the eyes and the smile stay clear.)
      if (s > 0.76 && Math.abs(a) > 0.9 && Math.abs(a) < 2.1) continue
      const dark = i % 5 === 0
      const r = dark ? 0.05 + rnd(i) * 0.04 : 0.07 + rnd(i * 3.3) * 0.12
      skin.push(skinSpot(hull, s, a, r * 1.4, dark ? GREY_DARK : GREY_LIGHT, 0.012 + (i % 7) * 0.0012, r))
    }
    // The hump and the knuckles along the back (where other whales have a fin), the double blowhole on a little
    // mound, barnacle crusts with whale lice on the head and the back.
    const bumps = []
    bumps.push(P.sphere(0.28, GREY, { scale: [0.8, 0.55, 1.4] }, 12).translate(...hull.at(0.36, 0, -0.06).toArray()))
    for (let i = 0; i < 7; i++) {
      const s = 0.31 - i * 0.04
      const r = 0.16 - i * 0.013
      bumps.push(P.sphere(r, GREY, { scale: [0.9, 0.7, 1.1] }, 10).translate(...hull.at(s, 0, -r * 0.25).toArray()))
    }
    bumps.push(P.sphere(0.2, GREY, { scale: [1.3, 0.45, 1] }, 12).translate(...hull.at(0.79, 0, -0.06).toArray()))
    const plain = []
    for (const side of [1, -1]) {
      const p = hull.at(0.795, side * 0.12, 0.035)
      plain.push(P.sphere(0.07, '#3A3F52', { at: p.toArray(), scale: [0.55, 0.3, 1.3], rot: [0, side * 0.35, 0] }, 8))
    }
    // Barnacle crusts: little cream cones in clusters (each with a dark middle), orange lice dots among them.
    const crust = (s0: number, a0: number, n: number, spread: number, seed: number) => {
      for (let i = 0; i < n; i++) {
        const s = s0 + (rnd(seed + i) - 0.5) * spread * 0.12
        const a = a0 + (rnd(seed + i * 3.1) - 0.5) * spread
        const r = 0.05 + rnd(seed + i * 7.7) * 0.05
        const o = new Group()
        onSkin(o, hull, s, a, -r * 0.2)
        o.updateMatrix()
        bumps.push(P.cyl(r * 0.6, r, r * 0.9, BARNACLE, { rot: [Math.PI / 2, 0, 0], at: [0, 0, r * 0.3] }, 8).applyMatrix4(o.matrix))
        plain.push(P.sphere(r * 0.35, '#B5A98F', { at: [0, 0, r * 0.75], scale: [1, 1, 0.4] }, 6).applyMatrix4(o.matrix))
        if (i % 3 === 0) plain.push(P.sphere(0.03, LICE, { at: [r * 1.4, r * 0.6, 0.02], scale: [1, 0.8, 0.5] }, 6).applyMatrix4(o.matrix))
      }
    }
    // (On top of the head, clear of the eyes: a crust over an eye reads as a frown, or hides it.)
    crust(0.91, 0.62, 9, 0.42, 11)
    crust(0.91, -0.62, 9, 0.42, 41)
    crust(0.95, 0.28, 3, 0.24, 71)
    crust(0.95, -0.28, 3, 0.24, 91)
    crust(0.6, 0.7, 6, 0.5, 131)
    crust(0.6, -0.7, 6, 0.5, 151)
    crust(0.52, 1.3, 4, 0.4, 171)
    this.body.add(solidMix(bumps, [...plain, ...skin], bag, 2))
    this.addEyes(0.835, 1.36, 0.19, true)
    this.addSmile(0.99, 0.875, 1.86, 0.16, 0.026, { s: 0.855, a: 1.7, r: 0.12 })
    this.flukeRest = 0.12

    // Flippers: short pointed paddles, low behind the head.
    for (const [g, side] of [
      [this.flipL, 1],
      [this.flipR, -1],
    ] as const) {
      g.position.copy(hull.at(0.68, side * 2.05, -0.06))
      // (A round-ended paddle, not a point: rolled over and waving, a pointed one reads as a shark's fin.)
      const secs: FinSec[] = [
        { t: 0, chord: 0.52, back: 0, thick: 0.16 },
        { t: 0.45, chord: 0.6, back: 0.06, thick: 0.11 },
        { t: 0.82, chord: 0.42, back: 0.2, thick: 0.07 },
        { t: 1, chord: 0.12, back: 0.33, thick: 0.03 },
      ]
      g.add(solid(fin(secs, 1.15, new Vector3(side * 0.85, -0.38, -0.2), new Vector3(0, 0.15, 1), (t, top) => (top && t < 0.45 ? GREY : GREY_LIGHT)), bag, 2))
      g.rotation.order = 'XYZ'
    }
    // The flukes on the tail stock: wide, pointed tips, a notch in the middle.
    this.flukes.position.copy(this.stockAt(tA))
    const fl: FinSec[] = [
      { t: 0, chord: 0.62, back: -0.08, thick: 0.16 },
      { t: 0.35, chord: 0.7, back: 0.05, thick: 0.09 },
      { t: 0.75, chord: 0.45, back: 0.32, thick: 0.05 },
      { t: 1, chord: 0.06, back: 0.62, thick: 0.02 },
    ]
    for (const side of [1, -1]) this.flukes.add(solid(fin(fl, 1.45, new Vector3(side, 0, -0.05), new Vector3(0, 0, 1), (t, top, along) => (top ? (rnd(Math.floor(t * 7) * 13 + Math.floor(along * 4)) > 0.82 ? GREY_LIGHT : GREY) : GREY_BELLY)), bag, 2))
    // The sea star stuck on the top of the left fluke (only after Ollie asks about her rock).
    this.star = seaStar(bag, 0.42)
    this.star.position.set(0.72, 0.07, -0.32)
    this.star.rotation.y = 0.4
    this.star.visible = false
    this.flukes.add(this.star)
  }

  protected floatPose() {
    // Lying along the surface, the head a little up so its eyes and smile are well clear of the water, and the tail
    // stock just under it, the flukes awash (she can see the tail she's to touch, not a body trailing off into the sea).
    return { y: 0.3, pitch: -0.08 }
  }

  /** Rolls onto its side (`side` +1: its left side up, for a camera on its left) and waves the flipper on top. */
  roll(side = 1) {
    this.rollSide = side
    this.play('roll', 3.2)
  }
  /** Lifts its tail out of the water and holds it up for a look (with the sea star: `star`), or slaps the water with
   *  it (star false). It rolls onto its side just as far as turns the top of its flukes (and the sea star) square to
   *  `eye` (world: the camera), whichever way it lies to it; never edge-on. */
  tailUp(star: boolean, eye: Vector3) {
    this.star.visible = this.star.visible || star
    this.tailEye = eye
    this.play(star ? 'show' : 'slap', star ? 4.2 : 2)
  }
  /** Where the flukes turn to (the camera's position, followed live). */
  private tailEye: Vector3 | null = null
  /** The roll that turns the top of the flukes square to `tailEye`. */
  private tailRoll() {
    if (!this.tailEye) return -1.2
    // The way to the eye in the whale's own frame (before its pose): its left is +x, its head +z.
    this.root.updateWorldMatrix(true, false)
    const c = this.root.worldToLocal(tA.copy(this.tailEye)).normalize()
    // The flukes' top (body +y) after a roll r and then the show's pitch p is (-sin r, cos r cos p, cos r sin p):
    // the roll that points it most at the eye.
    const p = this.floatPose().pitch + SHOW_PITCH
    return clamp(Math.atan2(-c.x, Math.cos(p) * c.y + Math.sin(p) * c.z), -1.45, 1.45)
  }
  /** A sideways sweep of the flukes (a push for the boat). */
  push() {
    this.play('push', 1.4)
  }

  protected act(m: Move, q: number, dt: number, t: number) {
    super.act(m, q, dt, t)
    const p = this.pose
    if (m.kind === 'roll') {
      // Over onto its side toward the camera, its pale belly showing, the flipper on top out of the water waving
      // hello; then back. Its nose comes up and its tail goes down meanwhile (a tail on edge above the water and a
      // dark flipper up read as a shark's fins).
      const k = ease(span(q, 0, 0.25)) * (1 - ease(span(q, 0.78, 1)))
      p.roll = this.rollSide * 1.25 * k
      p.pitch -= 0.3 * k
      p.y = p.y + 0.3 * k
      const wave = Math.sin(m.t * 8) * 0.55 * bell(span(q, 0.25, 0.78))
      if (this.rollSide > 0) p.flipL = (0.9 + wave) * k
      else p.flipR = -(0.9 + wave) * k
      p.fluke = 0
      if (m.t - dt < 0.5 && m.t >= 0.5) {
        this.splashed = true
        this.splashSize = 0.3
      }
    } else if (m.kind === 'slap' || m.kind === 'show') {
      // Nose down and the tail up out of the water (the whole body turns about its middle); a slap brings it down
      // with a splash, a show holds it high for a look and gives it a little wave.
      const hold = m.kind === 'show'
      const up = ease(span(q, 0, hold ? 0.22 : 0.35)) * (1 - ease(span(q, hold ? 0.8 : 0.6, 1)))
      p.pitch = p.pitch + SHOW_PITCH * up
      p.y = p.y + 0.55 * up
      p.roll = this.tailRoll() * up
      p.fluke = -0.35 * up + (hold ? Math.sin(m.t * 5) * 0.12 * up : 0.7 * bell(span(q, 0.5, 0.75)))
      if (!hold && m.t - dt < m.len * 0.68 && m.t >= m.len * 0.68) {
        this.splashed = true
        this.splashSize = 0.6
      }
    } else if (m.kind === 'push') {
      // The flukes sweep sideways, round toward the boat.
      p.roll += 0.25 * bell(q)
      p.fluke = 0.4 * Math.sin(q * Math.PI * 2)
      if (m.t - dt < 0.5 && m.t >= 0.5) {
        this.splashed = true
        this.splashSize = 0.35
      }
    }
  }

  /** The blowhole, world. */
  holeAt(out = new Vector3()) {
    this.body.updateWorldMatrix(true, false)
    return this.body.localToWorld(this.hull.at(0.795, 0, 0.05, out))
  }
}

// ---------------------------------------------------------------- the humpback

const HUMP = '#3F4B66'
const HUMP_DARK = '#323C55'
const HUMP_WHITE = '#EEF1F8'
const HUMP_GROOVE = '#B8C1D6'
/** How high the top of its back is during the ride (m above the water). */
const RIDE_TOP = 1.0

export class Humpback extends Whale {
  readonly kind = 'humpback' as const
  readonly zones: Record<string, Zone> = {
    body: { s: 0.6, a: 0, push: 0 },
    blowhole: { s: 0.79, a: 0, push: 0.25 },
  }
  /** How far it has sunk while she holds it (0..1). */
  sink = 0
  private sinkGoal = 0
  /** The jump's size (0..1), and where its middle came down (world, for the world's splash). */
  private size = 0
  constructor(bag: Bag) {
    const L = 8.2
    super(bag, {
      len: L,
      z0: -L * 0.48,
      nose: 0.07,
      tail: 0.02,
      belly: 2.6,
      secs: [
        { s: 0, w: 0.2, h: 0.32, y: 0.08 },
        { s: 0.14, w: 0.42, h: 0.56, y: 0.1 },
        { s: 0.32, w: 0.98, h: 1.0, y: 0.07 },
        { s: 0.5, w: 1.38, h: 1.22, y: 0 },
        { s: 0.66, w: 1.42, h: 1.18, y: -0.06 },
        { s: 0.8, w: 1.26, h: 0.98, y: -0.12 },
        { s: 0.9, w: 1.02, h: 0.76, y: -0.17 },
        { s: 1, w: 0.72, h: 0.48, y: -0.2 },
      ],
    })
    // (Its long white flippers held out at the surface, where she can see them: lower, only their knobbly front edge
    // broke the water, like beads on a stick.)
    this.flipRest = 0.7
    const hull = this.hull
    // Blue-black on top; the white throat and belly with its grooves, from the chin to the middle (crisp patches).
    this.body.add(solid(hull.geometry(() => HUMP, 60, 40), bag, 2.5))
    const under = (s: number) => 2.2 - 0.3 * span(s, 0.5, 0.95)
    const skin = [skinPatch(hull, 0.4, 0.985, under, (s) => Math.PI * 2 - under(s), HUMP_WHITE, 0.012, 36, 16)]
    for (let k = -4; k <= 4; k++) skin.push(skinPatch(hull, 0.47, 0.95, () => Math.PI + k * 0.13 - 0.018, () => Math.PI + k * 0.13 + 0.018, HUMP_GROOVE, 0.02, 24, 1))
    for (let i = 0; i < 24; i++) {
      const s = 0.15 + rnd(i * 4.1 + 3) * 0.6
      const a = (rnd(i * 7.3 + 5) - 0.5) * 2 * 1.6
      skin.push(skinSpot(hull, s, a, 0.1 + rnd(i) * 0.08, HUMP_DARK, 0.012 + (i % 5) * 0.001))
    }
    this.body.add(solidMix([], skin, bag, 0))
    // Knobs on its head (tubercles) in rows, the little dorsal fin on its hump, the blowhole.
    const knobs = []
    for (let i = 0; i < 18; i++) {
      const row = i % 3
      const s = 0.84 + Math.floor(i / 3) * 0.028
      const a = (i % 2 ? 1 : -1) * (0.18 + row * 0.22)
      knobs.push(P.sphere(0.09, HUMP_DARK, { scale: [1, 0.7, 1] }, 8).translate(...hull.at(s, a, -0.03).toArray()))
    }
    knobs.push(P.sphere(0.36, HUMP, { scale: [0.7, 0.45, 1.5] }, 12).translate(...hull.at(0.3, 0, -0.1).toArray()))
    const plain = [0.12, -0.12].map((a) => P.sphere(0.07, '#20263A', { at: hull.at(0.785, a, 0.03).toArray(), scale: [0.55, 0.3, 1.3] }, 8))
    this.body.add(solidMix(knobs, plain, bag, 2))
    const dorsal = new Group()
    dorsal.position.copy(hull.at(0.3, 0, -0.12))
    dorsal.add(solid(fin([{ t: 0, chord: 0.7, back: -0.2, thick: 0.14 }, { t: 0.6, chord: 0.38, back: 0.15, thick: 0.08 }, { t: 1, chord: 0.05, back: 0.42, thick: 0.03 }], 0.55, new Vector3(0, 1, -0.35), new Vector3(0, 0.3, 1), () => HUMP), bag, 2))
    this.body.add(dorsal)
    this.addEyes(0.81, 1.3, 0.21, true)
    this.addSmile(0.995, 0.85, 1.9, 0.16, 0.03, { s: 0.83, a: 1.64, r: 0.14 })

    // The long flippers: white with a dark top near the body, knobs along the leading edge.
    for (const [g, side] of [
      [this.flipL, 1],
      [this.flipR, -1],
    ] as const) {
      g.position.copy(hull.at(0.66, side * 2.0, -0.1))
      const span3 = new Vector3(side * 0.88, -0.3, -0.38).normalize()
      const fore = new Vector3(0, 0.1, 1)
      const len = 3.0
      const secs: FinSec[] = [
        { t: 0, chord: 0.7, back: 0, thick: 0.2 },
        { t: 0.3, chord: 0.62, back: 0.05, thick: 0.14 },
        { t: 0.75, chord: 0.42, back: 0.12, thick: 0.08 },
        { t: 1, chord: 0.06, back: 0.3, thick: 0.03 },
      ]
      const bumps = []
      for (let i = 0; i < 6; i++) {
        const t = 0.18 + i * 0.14
        const c = finEdge(secs, len, span3, fore, t).addScaledVector(fore, 0.015)
        bumps.push(P.sphere(0.075 - i * 0.006, HUMP_WHITE, { at: c.toArray() }, 8))
      }
      g.add(solidMix([fin(secs, len, span3, fore, (t, top) => (top && t < 0.35 ? HUMP : HUMP_WHITE), 16, 18), ...bumps], [], bag, 2))
    }
    // The flukes: dark on top, white underneath; a scalloped trailing edge.
    this.flukes.position.copy(this.stockAt(tA))
    const fl: FinSec[] = [
      { t: 0, chord: 0.72, back: -0.1, thick: 0.18 },
      { t: 0.4, chord: 0.8, back: 0.06, thick: 0.1 },
      { t: 0.8, chord: 0.5, back: 0.36, thick: 0.05 },
      { t: 1, chord: 0.08, back: 0.68, thick: 0.02 },
    ]
    for (const side of [1, -1]) this.flukes.add(solid(fin(fl, 1.7, new Vector3(side, 0, -0.04), new Vector3(0, 0, 1), (t, top, along) => (top ? HUMP : along > 0.82 && Math.floor(t * 9) % 2 ? HUMP : HUMP_WHITE)), bag, 2))
  }

  protected floatPose() {
    return { y: 0.02 - 2.1 * this.sink, pitch: -0.18 + 0.12 * this.sink }
  }

  /** Her finger holds it down (true) or lets go. */
  hold(on: boolean) {
    this.sinkGoal = on ? 1 : 0
  }
  /** Jumps right out (size 0..1: a hop .. a huge breach that twists onto its back). */
  jump(size: number) {
    this.root.visible = true
    this.upGoal = 1
    this.size = clamp(size)
    this.sinkGoal = 0
    this.play('jump', 2.1 + this.size * 1.4, size)
  }
  get jumping() {
    return this.doing('jump')
  }
  /** Comes up under the boat and carries it on its back (the world puts the boat on `saddle()`), until `release()`. */
  carry() {
    this.root.visible = true
    this.upGoal = 1
    this.play('carry', 1e9)
  }
  /** Lets the boat float off and sinks away. */
  release() {
    if (this.doing('carry')) this.play('away', 2.4)
  }
  /** Sings (into the microphone): eyes shut, head up, a slow sway. */
  sing() {
    this.play('sing', 3.4)
  }

  update(dt: number, t: number) {
    this.sink += (this.sinkGoal - this.sink) * damp(dt, this.sinkGoal > this.sink ? 1.6 : 4)
    this.sweep = 0
    super.update(dt, t)
    // (Swept back along its flanks as it twists over in the fall, so neither long flipper sticks up like a pole.)
    this.flipL.rotation.y = this.sweep
    this.flipR.rotation.y = -this.sweep
  }
  /** How far both flippers sweep back toward the tail (radians). */
  private sweep = 0

  protected act(m: Move, q: number, dt: number, t: number) {
    super.act(m, q, dt, t)
    const p = this.pose
    if (m.kind === 'jump') {
      // A breach: a rush up nose first, out of the water (higher with a bigger jump), a twist at the top, and down on
      // its side and back with a big splash; then it rolls back up to float.
      const size = this.size
      const L = this.len
      const upT = 0.38 + 0.1 * size
      const k = m.t / m.len
      const air = span(k, 0, 0.62)
      const peak = 0.8 + size * 4.2
      // The middle's height: from deep under, up to the peak, down below the surface.
      const from = -L * 0.35
      const h = air < upT ? from + (peak - from) * Math.sin((air / upT) * Math.PI * 0.5) : peak - (peak + 1.4) * ((air - upT) / (1 - upT)) ** 2
      const back2 = ease(span(k, 0.62, 1))
      const f = this.floatPose()
      p.y = h * (1 - back2) + f.y * back2
      // Nose up, nearly straight (more for a big one), then over onto its back as it falls.
      const tip = -(0.95 + 0.4 * size)
      p.pitch = (air < upT ? tip : tip + (Math.abs(tip) + 0.25) * ((air - upT) / (1 - upT))) * (1 - back2) + f.pitch * back2
      const twist = ease(span(air, upT * 0.7, 1)) * (1 - back2)
      p.roll = (1.2 + 1.1 * size) * twist
      // (The long flippers spread out flat to the sides like wings on the way up; as it twists over they sweep back
      // along its flanks.)
      p.flipL = 0.25 + 0.2 * bell(span(air, 0, 1))
      p.flipR = -0.25 - 0.2 * bell(span(air, 0, 1))
      this.sweep = 1.15 * twist
      p.fluke = -0.4 * bell(span(air, 0.4, 1))
      if (m.t - dt < m.len * 0.62 * 0.98 && m.t >= m.len * 0.62 * 0.98) {
        this.splashed = true
        this.splashSize = 0.35 + 0.65 * size
      }
      // (A small hop shows the head first: the surface breaks with a little splash on the way up too.)
      if (m.t - dt < m.len * 0.62 * upT * 0.5 && m.t >= m.len * 0.62 * upT * 0.5) {
        this.splashed = true
        this.splashSize = 0.25
      }
    } else if (m.kind === 'carry' || m.kind === 'away') {
      // Under the boat, its back well out of the water (rising from below first) and its head up a little so its
      // face shows past the bow, swimming gently; then away down.
      const top = this.hull.at(0.55, 0).y
      const ride = RIDE_TOP - top
      const k = m.kind === 'carry' ? ease(clamp(m.t / 1.4)) : 1 - ease(q)
      p.y = -this.len * 0.4 + (ride + this.len * 0.4) * k + Math.sin(t * 1.6) * 0.05 * k
      p.pitch = -0.07 * k + 0.02 * Math.sin(t * 1.3)
      p.roll = 0.025 * Math.sin(t * 0.9)
      p.flipL = 0.25 * Math.sin(t * 1.5)
      p.flipR = -0.25 * Math.sin(t * 1.5)
      p.fluke = 0.35 * Math.sin(t * 2.2)
      if (m.kind === 'away' && q >= 1) this.hide()
    } else if (m.kind === 'sing') {
      p.pitch -= 0.2 * bell(q)
      p.y += 0.2 * bell(q)
      p.roll += Math.sin(m.t * 2.2) * 0.12 * bell(q)
      this.laughT = Math.max(this.laughT, 0.1)
    }
  }

  /** Where the boat sits on its back for the ride (body frame), and its height there. */
  saddle(out = new Vector3()) {
    return this.hull.at(0.55, 0, 0, out)
  }
  holeAt(out = new Vector3()) {
    this.body.updateWorldMatrix(true, false)
    return this.body.localToWorld(this.hull.at(0.785, 0, 0.05, out))
  }
}

// ---------------------------------------------------------------- orcas

const ORCA = '#262433'
const ORCA_SADDLE = '#B3ADC6'

export type OrcaWho = 'grandma' | 'mama' | 'baby'

export class Orca extends Whale {
  readonly kind: 'orca' | 'baby'
  readonly zones: Record<string, Zone> = {
    head: { s: 0.82, a: 0, push: 0.1 },
    nose: { s: 1, a: 0, push: 0.05 },
  }
  private size: number
  constructor(
    bag: Bag,
    readonly who: OrcaWho,
  ) {
    const baby = who === 'baby'
    const L = baby ? 3 : who === 'grandma' ? 5 : 4.6
    const fat = baby ? 1.12 : 1
    super(bag, {
      len: L,
      z0: -L * 0.5,
      nose: baby ? 0.16 : 0.12,
      tail: 0.03,
      belly: 2.2,
      secs: [
        { s: 0, w: 0.03 * L, h: 0.055 * L, y: 0.01 * L },
        { s: 0.15, w: 0.065 * L, h: 0.095 * L, y: 0.012 * L },
        { s: 0.35, w: 0.13 * L * fat, h: 0.15 * L * fat, y: 0.008 * L },
        { s: 0.52, w: 0.155 * L * fat, h: 0.165 * L * fat, y: 0 },
        { s: 0.7, w: 0.145 * L * fat, h: 0.145 * L * fat, y: -0.006 * L },
        { s: 0.86, w: 0.105 * L * fat, h: 0.105 * L * fat, y: -0.012 * L },
        { s: 1, w: 0.05 * L * fat, h: 0.045 * L * fat, y: -0.016 * L },
      ],
    })
    this.kind = baby ? 'baby' : 'orca'
    this.size = L
    const hull = this.hull
    const white = baby ? '#FFE2CF' : '#FFFFFF'
    // Black on top; the white chin and belly sweeping up onto the flanks behind; the eye patches; the grey saddle
    // (crisp patches on the skin).
    this.body.add(solid(hull.geometry(() => ORCA, baby ? 48 : 60, 36), bag, baby ? 2 : 2.5))
    const flank = (s: number) => 0.85 * bell(span(s, 0.16, 0.5)) ** 1.5
    const under = (s: number) => 2.3 - flank(s) - 0.35 * span(s, 0.8, 0.97)
    const push = 0.004 * L
    const skin = [
      skinPatch(hull, 0.1, 0.995, under, (s) => Math.PI * 2 - under(s), white, push, 40, 14),
      skinSpot(hull, 0.42, 0, 0.07 * L, ORCA_SADDLE, push, 0.12 * L),
    ]
    for (const side of [1, -1]) skin.push(skinSpot(hull, 0.775, side * 1.1, 0.07 * L, white, push, 0.042 * L))
    this.body.add(solidMix([], skin, bag, 0))
    // The dorsal fin: Grandma's is tall and curved; Mama's a little smaller; the baby's a stub.
    const dh = baby ? 0.32 : who === 'grandma' ? 0.95 : 0.8
    const dorsal = new Group()
    dorsal.position.copy(hull.at(0.5, 0, -0.04 * L))
    dorsal.add(solid(fin([{ t: 0, chord: 0.2 * L, back: -0.08 * L, thick: 0.03 * L }, { t: 0.5, chord: 0.11 * L, back: 0.01 * L, thick: 0.018 * L }, { t: 1, chord: 0.012 * L, back: 0.08 * L, thick: 0.006 * L }], dh, new Vector3(0, 1, -0.32), new Vector3(0, 0.32, 1), () => ORCA), bag, 2))
    this.body.add(dorsal)
    this.addEyes(baby ? 0.87 : 0.86, 1.48, baby ? 0.11 : 0.14, baby)
    this.addSmile(0.997, 0.9, 1.9, 0.14, 0.011 * L, { s: 0.865, a: 1.86, r: baby ? 0.07 : 0.09 })
    // Paddle flippers, round.
    for (const [g, side] of [
      [this.flipL, 1],
      [this.flipR, -1],
    ] as const) {
      g.position.copy(hull.at(0.72, side * 2.15, -0.02 * L))
      g.add(solid(fin([{ t: 0, chord: 0.12 * L, back: 0, thick: 0.03 * L }, { t: 0.55, chord: 0.13 * L, back: 0.02 * L, thick: 0.02 * L }, { t: 1, chord: 0.03 * L, back: 0.08 * L, thick: 0.008 * L }], 0.22 * L, new Vector3(side * 0.85, -0.45, -0.25), new Vector3(0, 0.2, 1), () => ORCA), bag, 2))
    }
    this.flukes.position.copy(this.stockAt(tA))
    const fl: FinSec[] = [
      { t: 0, chord: 0.12 * L, back: -0.02 * L, thick: 0.03 * L },
      { t: 0.45, chord: 0.13 * L, back: 0.02 * L, thick: 0.016 * L },
      { t: 1, chord: 0.02 * L, back: 0.12 * L, thick: 0.004 * L },
    ]
    for (const side of [1, -1]) this.flukes.add(solid(fin(fl, 0.27 * L, new Vector3(side, 0, -0.08), new Vector3(0, 0, 1), (_t, top) => (top ? ORCA : white)), bag, 2))
  }

  protected floatPose() {
    // Cruising: the back, the fin and the eye patches out of the water.
    return { y: -0.02 * this.size, pitch: -0.05 }
  }

  /** Pops straight up beside the boat (a spyhop: orcas do it to look around), and stays until `drop()`. */
  pop() {
    this.root.visible = true
    this.upGoal = 1
    this.play('pop', 1e9)
  }
  /** Back down from a pop. */
  drop() {
    if (this.doing('pop')) this.play('drop', 0.9)
  }
  get popped() {
    return this.doing('pop') && this.move!.t > 0.5
  }
  /** A jump in an arc (out of the water and back in, nose first), `fwd` meters along. */
  jump() {
    this.root.visible = true
    this.upGoal = 1
    this.play('jump', 1.5)
  }
  /** A happy nod (the rock tossed up off its nose and caught). */
  nod() {
    if (this.doing('pop')) this.nodT = 0
  }
  private nodT = -1

  /** The tip of its nose, world. */
  noseAt(out = new Vector3()) {
    this.body.updateWorldMatrix(true, false)
    return this.body.localToWorld(this.hull.at(1, 0, 0, out))
  }

  protected act(m: Move, q: number, dt: number, t: number) {
    super.act(m, q, dt, t)
    const p = this.pose
    const L = this.size
    if (m.kind === 'pop' || m.kind === 'drop') {
      // Straight up, the front half out of the water, bobbing; a drop sinks it back the way it came.
      const k = m.kind === 'pop' ? back(clamp(m.t / 0.55)) : 1 - ease(q)
      p.pitch = -1.45 * k + p.pitch * (1 - k)
      p.y = (-0.55 * L) * (1 - k) + (-0.08 * L + Math.sin(t * 3.1) * 0.04 * L) * k
      p.flipL = 0.5 + Math.sin(t * 5) * 0.3
      p.flipR = -0.5 - Math.sin(t * 5 + 1) * 0.3
      p.roll = Math.sin(t * 2.3) * 0.08
      if (m.kind === 'pop' && m.t - dt < 0.2 && m.t >= 0.2) {
        this.splashed = true
        this.splashSize = 0.3
      }
      if (this.nodT >= 0) {
        this.nodT += dt / 0.9
        p.pitch += 0.25 * bell(this.nodT)
        if (this.nodT >= 1) this.nodT = -1
      }
      if (m.kind === 'drop' && q >= 1) {
        this.upGoal = this.up = 0
        this.root.visible = false
      }
    } else if (m.kind === 'jump') {
      // Out in an arc: nose up, over the top, nose down back in.
      const h = 0.45 * L + 0.4
      p.y = -0.25 * L + (h + 0.25 * L) * Math.sin(Math.PI * q)
      p.pitch = -0.9 + 1.8 * q
      p.fwd = (q - 0.5) * L * 1.2
      p.flipL = 0.6
      p.flipR = -0.6
      p.fluke = Math.sin(m.t * 10) * 0.3
      if (m.t - dt < m.len * 0.9 && m.t >= m.len * 0.9) {
        this.splashed = true
        this.splashSize = 0.5
      }
    }
  }
}
