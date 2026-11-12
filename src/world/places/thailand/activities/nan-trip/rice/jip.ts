// Jip, the cheeky little bird of Lung Kham's story (story.ts), and his three chicks in their nest: Lung's old ngob,
// upside down in the bamboo. Jip is a munia like the farm's other birds (round and chestnut, a white tummy, a dark
// face, a stubby grey-blue beak) but bigger, with a tuft that bounces, a white brow that makes him look like he's up
// to something, and a beak that opens when he chirps (jip jip!). He flies along arcs (flapping harder, and wobbling,
// when he carries something heavy, like a hat), hops, pecks, cocks his head and looks at things. The chicks are fluff
// balls with huge beaks that open wide and bob when they're hungry, and they can flutter-hop clumsily after him.
//
// The world drives where they go (flyTo, hopTo, place); they animate themselves in update(). `chirp` and `peep` are
// the sounds the world plays (story.ts wires them to the recorded clips).
import { Group, Object3D, Vector3 } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { lungNgob } from './farm'

const BROWN = '#9A6340'
const WING = '#7E4E32'
const DARK = '#4A3228'
const BEAK = '#A9B9D6'
const TUM = '#FFF6EC'
const tmp = new Vector3()
const tmp2 = new Vector3()

export interface FlyOpts {
  /** Seconds (default: by the distance). */
  dur?: number
  /** Meters the arc rises above the straight line (default 0.8). */
  arc?: number
  /** Carrying something heavy: slower, harder flaps, a wobble. */
  heavy?: boolean
  /** Which way to face on landing (radians, world yaw; default: the way it flew). */
  face?: number
  done?: () => void
}

type Goal = Vector3 | (() => Vector3)

interface Move {
  from: Vector3
  to: Goal
  t: number
  dur: number
  arc: number
  heavy: boolean
  hop: boolean
  face?: number
  done?: () => void
}

const goal = (g: Goal, out: Vector3) => (typeof g === 'function' ? out.copy(g()) : out.copy(g))

/** Jip. */
export class Jip {
  readonly root = new Group()
  private body = new Group()
  private head = new Group()
  private beak = new Group()
  private jaw = new Group()
  private tuft = new Group()
  private wings: [Group, Group]
  private tail = new Group()
  private eyes = new Group()
  /** Under his feet: what he carries (a hat) goes here. */
  readonly claws = new Group()
  private move: Move | null = null
  private chirpT = 1
  private chirps = 0
  private peckT = 1
  private blinkIn = 2
  private blinkT = 1
  private looking: Vector3 | null = null
  private headYaw = 0
  private tilt = 0
  private tiltGoal = 0
  private tiltIn = 2
  private phase = Math.random() * 6
  /** 0..1 how hard he's flapping while sitting (a happy flutter), on top of flying. */
  private flutterT = 1
  /** Sounds (the world sets them). */
  chirp: () => void = () => {}
  /** Seconds he's been flying (QA). */
  flying = false

  constructor(bag: Bag) {
    const { root, body, head } = this
    body.add(
      solid(
        merge([
          P.sphere(0.13, BROWN, { at: [0, 0.13, 0], scale: [0.95, 0.9, 1.15] }, 16),
          P.sphere(0.1, TUM, { at: [0, 0.1, 0.055], scale: [0.86, 0.86, 0.9] }, 14),
          // A few scallops on his tummy, like a real scaly-breasted munia.
          ...[[-0.04, 0.12], [0.04, 0.12], [0, 0.08], [-0.05, 0.06], [0.05, 0.06]].map(([x, y]) => P.torus(0.016, 0.004, '#B08A6A', { at: [x, y, 0.14], rot: [0, 0, Math.PI] }, Math.PI)),
        ]),
        bag,
        1.5,
      ),
    )
    head.position.set(0, 0.24, 0.08)
    head.add(
      solid(
        merge([
          P.sphere(0.09, DARK, {}, 14),
          // The white brow: one eyebrow higher than the other (cheeky).
          P.capsule(0.009, 0.04, '#FFFFFF', { at: [-0.045, 0.045, 0.067], rot: [0, 0, 1.2] }),
          P.capsule(0.009, 0.04, '#FFFFFF', { at: [0.048, 0.055, 0.066], rot: [0, 0, -1.5] }),
          ...[-1, 1].map((s) => P.sphere(0.022, '#FFC1D6', { at: [s * 0.062, -0.025, 0.055], scale: [1, 0.6, 0.4] }, 6)),
        ]),
        bag,
        1.5,
      ),
    )
    // Eyes (they blink: squash y).
    this.eyes.position.set(0, 0.018, 0.064)
    this.eyes.add(solid(merge([...[-1, 1].flatMap((s) => [P.sphere(0.02, PAL.ink, { at: [s * 0.042, 0, 0] }, 8), P.sphere(0.007, '#FFFFFF', { at: [s * 0.046, 0.008, 0.016] }, 5)])]), bag, 0))
    head.add(this.eyes)
    // The beak: a top half and a jaw that opens.
    this.beak.position.set(0, -0.012, 0.085)
    this.beak.add(solid(P.cone(0.034, 0.06, BEAK, { at: [0, 0.008, 0.025], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.55] }, 8), bag, 1.2))
    this.jaw.add(solid(P.cone(0.028, 0.05, '#93A3C2', { at: [0, -0.006, 0.02], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.45] }, 8), bag, 1.2))
    this.beak.add(this.jaw)
    head.add(this.beak)
    // The tuft: three feathers that bounce.
    this.tuft.position.set(0, 0.075, 0.0)
    this.tuft.add(solid(merge([-1, 0, 1].map((k) => P.cone(0.016, 0.085, DARK, { at: [k * 0.022, 0.035, -k * k * 0.01], rot: [-0.35, 0, -k * 0.45] }, 5))), bag, 1.2))
    head.add(this.tuft)
    body.add(head)
    this.wings = [-1, 1].map((s) => {
      const w = new Group()
      w.position.set(s * 0.1, 0.16, 0)
      w.add(solid(P.sphere(0.11, WING, { at: [s * 0.085, 0, -0.02], scale: [1, 0.18, 0.75] }, 10), bag, 1.5))
      body.add(w)
      return w
    }) as [Group, Group]
    this.tail.position.set(0, 0.14, -0.13)
    this.tail.add(solid(P.box(0.08, 0.018, 0.13, DARK, { at: [0, 0, -0.06] }), bag, 1.2))
    body.add(this.tail)
    // Little legs.
    body.add(solid(merge([-1, 1].map((s) => P.cyl(0.008, 0.008, 0.05, '#C99A86', { at: [s * 0.035, 0.015, 0.01] }, 5))), bag, 0))
    this.claws.position.set(0, -0.02, 0.02)
    root.add(body, this.claws)
    root.scale.setScalar(1.3)
  }

  get pos() {
    return this.root.position
  }
  get busy() {
    return !!this.move
  }
  /** Where his head is (for a camera to look at). */
  headAt(out = new Vector3()) {
    return this.head.getWorldPosition(out)
  }

  /** Puts him somewhere at once, sitting (yaw: which way he faces). */
  place(at: Vector3, yaw?: number) {
    this.move = null
    this.flying = false
    this.root.position.copy(at)
    if (yaw !== undefined) this.root.rotation.y = yaw
  }

  /** Flies there along an arc (the goal can move: a hat on a head). */
  flyTo(to: Goal, o: FlyOpts = {}) {
    const from = this.root.position.clone()
    const d = from.distanceTo(goal(to, tmp))
    this.move = { from, to, t: 0, dur: o.dur ?? clamp(d / (o.heavy ? 1.6 : 3.2), 0.5, 3), arc: o.arc ?? 0.8, heavy: !!o.heavy, hop: false, face: o.face, done: o.done }
    this.flying = true
  }
  /** A little hop (a few centimeters up, wings out). */
  hopTo(to: Goal, o: FlyOpts = {}) {
    this.move = { from: this.root.position.clone(), to, t: 0, dur: o.dur ?? 0.28, arc: o.arc ?? 0.12, heavy: false, hop: true, face: o.face, done: o.done }
  }

  /** Jip jip! (the beak opens twice). */
  sing(n = 2) {
    this.chirpT = 0
    this.chirps = n
    this.chirp()
  }
  /** A peck at whatever is in front of him. */
  peck() {
    this.peckT = 0
  }
  /** A happy flutter where he sits. */
  flutter() {
    this.flutterT = 0
  }
  lookAt(p: Vector3 | null) {
    this.looking = p ? (this.looking ?? new Vector3()).copy(p) : null
  }
  /** Something to carry in his claws (null: lets go of it, and gives it back to the caller to place). */
  carry(o: Object3D | null) {
    if (o) this.claws.attach(o)
  }

  update(dt: number, t: number) {
    const m = this.move
    let flap = 0
    let wobble = 0
    if (m) {
      m.t = Math.min(1, m.t + dt / m.dur)
      const k = m.hop ? m.t : m.t * m.t * (3 - 2 * m.t) * 0.35 + m.t * 0.65
      const to = goal(m.to, tmp2)
      tmp.lerpVectors(m.from, to, k)
      tmp.y += bell(m.t) * m.arc
      if (m.heavy) {
        wobble = Math.sin(t * 9) * 0.06
        tmp.y += Math.sin(t * 11) * 0.03
      }
      const dx = tmp.x - this.root.position.x
      const dz = tmp.z - this.root.position.z
      if (Math.hypot(dx, dz) > 1e-4) this.root.rotation.y = Math.atan2(dx, dz)
      this.root.position.copy(tmp)
      flap = m.hop ? 0.6 * bell(m.t) : m.heavy ? 1.4 : 1
      if (m.t >= 1) {
        this.move = null
        this.flying = false
        if (m.face !== undefined) this.root.rotation.y = m.face
        m.done?.()
      }
    }
    // Wings: folded, a flap in the air (harder carrying), a happy flutter.
    this.flutterT = Math.min(1, this.flutterT + dt / 0.6)
    const fl = Math.max(flap, bell(this.flutterT) * 0.8)
    const speed = flap > 1 ? 46 : 36
    const w = fl > 0.05 ? Math.sin(t * speed + this.phase) * 1.15 * Math.min(1, fl) + 0.25 : -1.25
    this.wings[0].rotation.z = -w
    this.wings[1].rotation.z = w
    this.body.rotation.z = wobble
    this.body.rotation.x = fl > 0.05 ? -0.18 : 0
    this.tail.rotation.x = Math.sin(t * 2.2 + this.phase) * 0.12 + (fl > 0.05 ? -0.3 : 0)
    // Breathing, a bounce of the tuft.
    const breath = 1 + Math.sin(t * 5 + this.phase) * 0.03
    this.body.scale.set(1, breath, 1)
    this.tuft.rotation.x = Math.sin(t * 7 + this.phase) * 0.12 - bell(this.chirpT) * 0.35
    // Chirps: the beak opens and the head bobs, `chirps` times.
    if (this.chirpT < 1) {
      this.chirpT = Math.min(1, this.chirpT + dt / (0.22 * Math.max(1, this.chirps)))
      const open = Math.max(0, Math.sin(this.chirpT * Math.PI * Math.max(1, this.chirps)))
      this.jaw.rotation.x = open * 0.6
      this.head.position.y = 0.24 + open * 0.015
    } else this.jaw.rotation.x = 0
    // A peck: head down and back.
    this.peckT = Math.min(1, this.peckT + dt / 0.25)
    // Head: looks at what it's told to (or round, with a cock of the head now and then).
    let want = Math.sin(t * 0.7 + this.phase) * 0.4
    if (this.looking) {
      this.root.worldToLocal(tmp.copy(this.looking))
      want = clamp(Math.atan2(tmp.x, tmp.z), -1.3, 1.3)
    }
    this.headYaw += (want - this.headYaw) * Math.min(1, dt * 8)
    this.tiltIn -= dt
    if (this.tiltIn <= 0) {
      this.tiltIn = 1.2 + Math.random() * 2.2
      this.tiltGoal = (Math.random() - 0.5) * 0.9
    }
    this.tilt += (this.tiltGoal - this.tilt) * Math.min(1, dt * 6)
    this.head.rotation.set(bell(this.peckT) * 0.9, this.headYaw, this.tilt)
    // Blinks.
    this.blinkIn -= dt
    if (this.blinkIn <= 0) {
      this.blinkIn = 1.8 + Math.random() * 3
      this.blinkT = 0
    }
    this.blinkT = Math.min(1, this.blinkT + dt / 0.14)
    this.eyes.scale.y = 1 - 0.9 * bell(this.blinkT)
  }
}

interface Chick {
  root: Group
  body: Group
  head: Group
  jaw: Group
  wings: [Group, Group]
  home: Vector3
  move: Move | null
  /** Rounder each time it's fed (the fat-bird joke, baby size). */
  fat: number
  gulp: number
  phase: number
}

/** The three chicks: fluffy, round, with beaks too big for them. Each sits in the nest until it's told to go. */
export class Chicks {
  readonly root = new Group()
  readonly list: Chick[] = []
  /** 0 quiet (beaks shut, little bobs) .. 1 starving (beaks wide, stretching up). */
  hungry = 0.3
  peep: () => void = () => {}
  private peepIn = 1

  constructor(bag: Bag) {
    const tints = ['#E9D2B4', '#F2DEC4', '#E2C7A4']
    for (let i = 0; i < 3; i++) {
      const root = new Group()
      const body = new Group()
      body.add(solid(merge([P.sphere(0.075, tints[i], { at: [0, 0.07, 0] }, 14), P.sphere(0.05, '#FFF8EE', { at: [0, 0.06, 0.035] }, 10), ...[0, 1, 2].map((k) => P.cone(0.012, 0.04, tints[i], { at: [(k - 1) * 0.02, 0.14, -0.01], rot: [-0.3, 0, (k - 1) * 0.6] }, 4))]), bag, 1.4))
      const head = new Group()
      head.position.set(0, 0.1, 0.05)
      head.add(solid(merge([...[-1, 1].flatMap((s) => [P.sphere(0.014, PAL.ink, { at: [s * 0.03, 0.02, 0.025] }, 6), P.sphere(0.005, '#FFFFFF', { at: [s * 0.032, 0.026, 0.036] }, 4)])]), bag, 0))
      // A big yellow-rimmed beak (baby birds' gape), top half fixed, the jaw opens wide.
      head.add(solid(P.cone(0.03, 0.045, '#FFD66B', { at: [0, -0.005, 0.05], rot: [Math.PI / 2, 0, 0], scale: [1.2, 1, 0.5] }, 8), bag, 1.2))
      const jaw = new Group()
      jaw.position.set(0, -0.012, 0.035)
      jaw.add(solid(P.cone(0.028, 0.04, '#FFB347', { at: [0, -0.004, 0.018], rot: [Math.PI / 2, 0, 0], scale: [1.2, 1, 0.45] }, 8), bag, 1.2))
      head.add(jaw)
      body.add(head)
      const wings = [-1, 1].map((s) => {
        const w = new Group()
        w.position.set(s * 0.065, 0.08, 0)
        w.add(solid(P.sphere(0.04, tints[i], { at: [s * 0.025, 0, 0], scale: [0.6, 0.3, 0.9] }, 8), bag, 1.2))
        body.add(w)
        return w
      }) as [Group, Group]
      root.add(body)
      root.scale.setScalar(1.25)
      const home = new Vector3((i - 1) * 0.12, 0.0, (i % 2) * 0.04)
      root.position.copy(home)
      root.rotation.y = (i - 1) * 0.35
      this.root.add(root)
      this.list.push({ root, body, head, jaw, wings, home, move: null, fat: 0, gulp: 1, phase: i * 2.1 })
    }
  }

  /** A chick gulps down a grain (and gets a little rounder). */
  feed(i: number) {
    const c = this.list[i % this.list.length]
    c.gulp = 0
    c.fat = Math.min(1, c.fat + 0.34)
  }

  /** A chick flutter-hops to a place in the world (wobbly little arcs), then sits there. */
  hopTo(i: number, to: Goal, o: FlyOpts = {}) {
    const c = this.list[i]
    const from = c.root.getWorldPosition(new Vector3())
    // Out of the nest and into the world (its scale stays the same: the nest isn't scaled).
    const scene = this.root.parent ? topOf(this.root) : null
    if (scene && c.root.parent !== scene) scene.attach(c.root)
    c.root.position.copy(from)
    c.move = { from, to, t: 0, dur: o.dur ?? clamp(from.distanceTo(goal(to, tmp)) / 1.7, 0.6, 4.5), arc: o.arc ?? 0.6, heavy: false, hop: false, face: o.face, done: o.done }
  }

  /** All back in the nest, at once. */
  home() {
    for (const c of this.list) {
      if (c.root.parent !== this.root) this.root.attach(c.root)
      c.move = null
      c.root.position.copy(c.home)
      c.root.rotation.set(0, (this.list.indexOf(c) - 1) * 0.35, 0)
    }
  }

  /** Where a chick is. */
  at(i: number, out = new Vector3()) {
    return this.list[i].root.getWorldPosition(out)
  }

  update(dt: number, t: number) {
    this.peepIn -= dt
    if (this.hungry > 0.5 && this.peepIn <= 0 && this.root.visible) {
      this.peepIn = 1.2 + Math.random() * 1.4
      this.peep()
    }
    for (const c of this.list) {
      let flap = 0
      const m = c.move
      if (m) {
        m.t = Math.min(1, m.t + dt / m.dur)
        const to = goal(m.to, tmp2)
        tmp.lerpVectors(m.from, to, m.t)
        // Clumsy: little bounces all the way, not one smooth arc.
        tmp.y += bell(m.t) * m.arc + Math.abs(Math.sin(m.t * Math.PI * 5)) * 0.08
        const dx = tmp.x - c.root.position.x
        const dz = tmp.z - c.root.position.z
        if (Math.hypot(dx, dz) > 1e-4) c.root.rotation.y = Math.atan2(dx, dz)
        c.root.position.copy(tmp)
        c.root.rotation.z = Math.sin(m.t * 30) * 0.15
        flap = 1
        if (m.t >= 1) {
          c.move = null
          c.root.rotation.z = 0
          if (m.face !== undefined) c.root.rotation.y = m.face
          m.done?.()
        }
      }
      const beg = this.hungry
      const open = beg > 0.5 ? (Math.sin(t * 5 + c.phase) * 0.5 + 0.5) * beg : 0.1 * Math.max(0, Math.sin(t * 2 + c.phase))
      c.jaw.rotation.x = open * 0.9
      c.head.rotation.x = -open * 0.6
      c.gulp = Math.min(1, c.gulp + dt / 0.5)
      const f = 1 + 0.3 * c.fat + bell(c.gulp) * 0.15
      c.body.scale.set(f, (1 + 0.15 * c.fat) * (1 + Math.sin(t * 4 + c.phase) * 0.03 + open * 0.08), f)
      c.root.position.y += 0
      const w = flap ? Math.sin(t * 40 + c.phase) * 1.0 : beg > 0.5 ? Math.sin(t * 14 + c.phase) * 0.3 * beg - 0.3 : -0.8
      c.wings[0].rotation.z = -w
      c.wings[1].rotation.z = w
    }
  }
}

function topOf(o: Object3D) {
  let x = o
  while (x.parent) x = x.parent
  return x
}

/** The nest: Lung's old ngob (the mint band), upside down and wedged in the bamboo, lined with straw. */
export function buildNest(bag: Bag) {
  const root = new Group()
  const hat = lungNgob(bag, '#7FD6B4')
  hat.rotation.x = Math.PI
  hat.position.y = 0.15
  root.add(hat)
  root.add(solid(merge([...Array.from({ length: 10 }, (_, k) => P.cone(0.012, 0.16, k % 2 ? '#D9AE52' : '#E8C66A', { at: [Math.cos(k * 0.63) * 0.24, 0.17, Math.sin(k * 0.63) * 0.24], rot: [Math.sin(k) * 0.9, 0, Math.cos(k) * 0.9 + 1.2] }, 4))]), bag, 1))
  // The chicks sit on the straw inside.
  const seat = new Group()
  seat.position.y = 0.1
  root.add(seat)
  return { root, seat }
}
