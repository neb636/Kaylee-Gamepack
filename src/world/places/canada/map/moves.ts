// The friends' moves at the rink (planning/around-the-world/canada-round-2.md, "The new friend shows their move"): when
// she lands back on the map with a new friend, the friend pops in at the rink, then shows what they're good at, about
// 2 s, with no words: Tuque bounces a puck off his tummy; Monty stands so still that two geese take him for a statue
// and perch on his antlers; Roxy whisks a puck from a goose onto her own head; Lulu sings notes that float up over the
// rink; Misty winds up and slaps a pinecone over the boards; Ollie juggles her lucky rock and spin-passes it to Maple.
// A tap on a friend already on the team plays it again (world.ts).
//
// Every move starts with that friend's WIND-UP, the same one the big game (activities/party/) plays before their play,
// so she knows who is about to do what: Tuque puffs out his tummy, Monty plants his feet and spreads his arms, Roxy
// crouches and rubs her paws, Lulu takes a big breath, Misty twists and lifts her stick, Ollie tosses her rock from paw
// to paw. `windUp(id, p, k, t)` is that pose on any Performer (k 0..1 through it); `WindUp` plays it on its own.
//
// The props (a puck, the pinecone, Ollie's rock, Lulu's notes, Misty's stick, Monty's two geese) are built here, in the
// friend's own space (their spot at the rink: +z is toward the camera), so they turn with them.
import { Group, Quaternion, Vector3, type Camera, type Object3D } from 'three'
import { bell, clamp, smooth, span } from '../../../../sdk'
import { FilmActor } from '../../../engine3d/characters/actor'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import type { Particles } from '../../../engine3d/particles'
import { Goose } from '../characters/goose'
import { CANADA_COLORS } from '../characters/looks'
import { Lulu } from '../characters/lulu'
import { ToyActor, type Performer } from '../characters/toy'
import { Tuque } from '../characters/tuque'
import type { ChapterId } from '../story/chapters'
import { makePuck, stickFit, stickParts } from '../story/props'
import { moveSfx } from './sounds'

const TAU = Math.PI * 2

/** How long each friend's wind-up lasts (s): the first part of their move, and what the big game plays first. */
export const WINDUP_S: Record<ChapterId, number> = { snowman: 0.5, bike: 0.6, campfire: 0.6, canoe: 0.6, bath: 0.8, whales: 0.8 }
/** How long each whole move lasts on the map (s), wind-up included. */
export const MOVE_S: Record<ChapterId, number> = { snowman: 2.5, bike: 2.6, campfire: 2.5, canoe: 2.3, bath: 2.5, whales: 2.7 }

/** Where the camera looks while a friend shows their move (in their own space: +z toward the camera), and how wide
 *  the shot is (half across, in the rink's units): enough to hold the friend and whatever flies. */
const FOCUS: Record<ChapterId, { at: [number, number, number]; across: number }> = {
  snowman: { at: [0, 0.45, 0.3], across: 1.05 },
  bike: { at: [0, 0.8, 0.15], across: 1.3 },
  campfire: { at: [0.2, 0.2, 0.55], across: 1.3 },
  canoe: { at: [0, 0.6, 0.3], across: 1.05 },
  bath: { at: [-0.15, 0.6, 0.42], across: 1.22 },
  whales: { at: [0, 0.4, 0.15], across: 1.35 },
}

/** The camera's look point for a friend's move (world, into `out`) and how wide its shot is (world units). Ollie's
 *  takes in Maple too (she passes to her). */
export function moveFocus(id: ChapterId, spot: Object3D, maple: Performer, out: Vector3) {
  const f = FOCUS[id]
  spot.localToWorld(out.set(...f.at))
  const k = spot.getWorldScale(tmp).x / Math.max(0.001, spot.scale.x)
  if (id === 'whales') {
    maple.root.getWorldPosition(tmp2)
    out.lerp(tmp2.setY(out.y), 0.4)
  }
  return f.across * k
}

// ---------------------------------------------------------------- the wind-ups (shared with the big game)

/** What a pose moves: the body (it squashes and leans from the feet) and, on a rig friend, the arms and the head. */
function parts(p: Performer) {
  if (p instanceof FilmActor) return { body: p.rig.body, armL: p.rig.armL, armR: p.rig.armR, head: p.rig.head, eyes: p.rig.eyes }
  return { body: (p as unknown as ToyActor).body, armL: null, armR: null, head: null, eyes: null }
}

/**
 * A friend's wind-up, `k` of the way through it (0 at rest .. 1 wound up; hold 1 to stay wound up). Call it every frame
 * AFTER `p.update(dt, t)`: it adds to the pose the character has just given itself (a hand-built toy's own arms follow
 * a frame later through `armsUp`). Anyone in the cast can wind up: a big-game Player's performer, a film's actor.
 */
export function windUp(id: ChapterId, p: Performer, k: number, t: number) {
  const { body, armL, armR, head, eyes } = parts(p)
  const e = smooth(k)
  switch (id) {
    case 'snowman':
      // Tuque puffs out his round tummy and leans back on his heels, mittens out: go on, try to get one past.
      body.rotation.x -= 0.2 * e
      body.scale.x *= 1 + 0.15 * e
      body.scale.z *= 1 + 0.15 * e
      body.scale.y *= 1 - 0.04 * e
      if (p instanceof Tuque) p.armsUp = 0.35 * e
      break
    case 'bike':
      // Monty plants his hooves, sinks a little and spreads his arms wide, chin up: he fills the whole net.
      body.scale.y *= 1 - 0.07 * e
      body.scale.x *= 1 + 0.05 * e
      if (armR && armL) {
        armR.rotation.z += 1.15 * e
        armL.rotation.z -= 1.15 * e
      }
      if (head) head.rotation.x -= 0.22 * e
      break
    case 'campfire':
      // Roxy crouches low, paws out in front, rubbing them, and her eyes slide from side to side: sneaky.
      body.rotation.x += 0.32 * e
      body.scale.y *= 1 - 0.1 * e
      if (armR && armL) {
        const rub = Math.sin(t * 22) * 0.18 * e
        armR.rotation.x -= 1.0 * e
        armL.rotation.x -= 1.0 * e
        armR.rotation.z -= 0.35 * e + rub
        armL.rotation.z += 0.35 * e + rub
      }
      if (head) head.rotation.y += Math.sin(t * 7) * 0.4 * e
      if (eyes) eyes.scale.y *= 1 - 0.4 * e
      break
    case 'canoe':
      // Lulu takes a big breath: she swells up, tips her head back and lifts her wings a little.
      body.scale.multiplyScalar(1 + 0.1 * e)
      body.rotation.x -= 0.12 * e
      if (p instanceof Lulu) {
        p.calling = Math.max(p.calling, 0.35 * e)
        p.armsUp = 0.2 * e
      }
      break
    case 'bath':
      // Misty twists away and lifts her stick right back behind her, eyes narrowed: the biggest wind-up in Canada.
      body.rotation.y -= 0.6 * e
      body.rotation.x += 0.08 * e
      if (armR && armL) {
        armR.rotation.x += 1.5 * e
        armR.rotation.z += 0.35 * e
        armL.rotation.x += 0.7 * e
      }
      if (eyes) eyes.scale.y *= 1 - 0.45 * e
      break
    case 'whales':
      // Ollie lifts both paws in front of her and bobs, tossing her rock from paw to paw (the rock is the caller's).
      body.position.y += Math.abs(Math.sin(t * 9)) * 0.03 * p.height * e
      if (armR && armL) {
        const bob = Math.sin(t * 9) * 0.25 * e
        armR.rotation.x -= 1.25 * e + bob
        armL.rotation.x -= 1.25 * e - bob
        armR.rotation.z -= 0.25 * e
        armL.rotation.z += 0.25 * e
      }
      if (head) head.rotation.x -= 0.15 * e
      break
  }
}

/** A wind-up played on its own (the big game, before a friend's play): `start()`, then `update(dt, t)` every frame
 *  after the performer's own update; it eases in, holds, and lets go when `release()` is called (or after `hold` s). */
export class WindUp {
  private t = -1
  private out = -1
  constructor(
    readonly id: ChapterId,
    private p: Performer,
    private hold = 0.4,
  ) {}
  start() {
    this.t = 0
    this.out = -1
  }
  release() {
    if (this.t >= 0 && this.out < 0) this.out = 0
  }
  /** Winding up or wound up. */
  get on() {
    return this.t >= 0
  }
  /** Wound all the way up (the play can go now). */
  get ready() {
    return this.t >= WINDUP_S[this.id]
  }
  update(dt: number, t: number) {
    if (this.t < 0) return
    this.t += dt
    const s = WINDUP_S[this.id]
    if (this.out < 0 && this.t >= s + this.hold) this.out = 0
    let k = clamp(this.t / s)
    if (this.out >= 0) {
      this.out += dt
      k *= 1 - clamp(this.out / 0.25)
      if (this.out >= 0.25) this.t = -1
    }
    windUp(this.id, this.p, k, t)
  }
}

// ---------------------------------------------------------------- the props

const ROCK = '#A9A5BA'
const PINE = '#A0623C'
const PINE_DARK = '#7C4630'

function rock(bag: Bag) {
  return solid(merge([P.sphere(0.055, ROCK, { scale: [1, 0.78, 0.92] }, 12), P.sphere(0.02, '#CBC8D8', { at: [0.022, 0.022, 0.032] }, 6), P.sphere(0.012, '#8E8AA0', { at: [-0.025, -0.005, 0.038] }, 6)]), bag, 1.4)
}

/** Misty's stick on the map: the game's hockey stick (story/props.ts), but twice as thick, in a darker wood and with
 *  a bigger blade, so it reads from the board's high camera against the snow. */
function mapStick(H: number, bag: Bag) {
  return solid(merge(stickParts({ ...stickFit(H, CANADA_COLORS.scarf, 2, '#C99A6E'), blade: 0.25 * H })), bag, 2.2)
}

/** A pinecone about 0.15 long, lying along z: a brown egg with three rings of scales and a stalk. */
function pinecone(bag: Bag) {
  const parts = [P.sphere(0.05, PINE, { scale: [0.82, 0.82, 1.45] }, 12), P.cyl(0.008, 0.01, 0.035, PINE_DARK, { at: [0, 0, -0.085], rot: [Math.PI / 2, 0, 0] }, 5)]
  for (const [z, r] of [[-0.035, 0.038], [0.0, 0.043], [0.035, 0.034]] as const) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * TAU + z * 40
      parts.push(P.sphere(0.017, i % 2 ? PINE_DARK : PINE, { at: [Math.cos(a) * r, Math.sin(a) * r, z], scale: [1, 1, 0.6] }, 6))
    }
  }
  return solid(merge(parts), bag, 1.3)
}

/** A music note (a round head, a stem and a flag), about 0.16 tall, flat in xy and facing +z (it's turned to the camera). */
function note(bag: Bag, color: string, two: boolean) {
  const parts = [
    P.sphere(0.034, color, { at: [0, 0, 0], rot: [0, 0, 0.4], scale: [1.3, 0.92, 0.55] }, 12),
    P.box(0.013, 0.12, 0.013, color, { at: [0.036, 0.06, 0] }),
    P.prism([[0, 0], [0.05, -0.03], [0.045, -0.06], [0, -0.035]], 0.012, color, { at: [0.042, 0.12, 0] }),
  ]
  if (two) parts.push(P.sphere(0.034, color, { at: [0.09, 0.03, 0], rot: [0, 0, 0.4], scale: [1.3, 0.92, 0.55] }, 12), P.box(0.013, 0.12, 0.013, color, { at: [0.126, 0.09, 0] }), P.box(0.1, 0.018, 0.013, color, { at: [0.081, 0.142, 0], rot: [0, 0, 0.3] }))
  const g = new Group()
  const n = solid(merge(parts), bag, 1.3)
  n.position.set(two ? -0.06 : -0.02, -0.06, 0)
  g.add(n)
  return g
}

// ---------------------------------------------------------------- the moves on the map

/** Someone at the rink who can show their move (a Mate in world.ts). */
export interface Mover {
  id: ChapterId
  actor: Performer
  /** Their spot at the rink: their own space (it faces the camera), where the props go. */
  spot: Group
}

/** What the moves borrow from the map. */
export interface MoveHost {
  bag: Bag
  /** The rink's own space (the ice is at y 0.09, the friends stand at 0.06). */
  rink: Object3D
  spray: Particles
  /** Maple by the Cup (she catches Ollie's pass). */
  maple: Performer
}

/** One of the rink's geese, lent to a move (Roxy's): where it goes in the rink's space, blended over its skating ring
 *  by `w` (0: its ring .. 1: here), which way it faces and where it looks. */
export interface Lent {
  at: Vector3
  yaw: number
  w: number
  headTurn: number
}

interface Run {
  m: Mover
  t: number
  /** Things done once in this run (a sound, a pop). */
  did: Set<string>
}

const PINKC = 2
const BUTTER = 3
const WHITEC = 1
const tmp = new Vector3()
const tmp2 = new Vector3()
const q = new Quaternion()

/** A point on the way from `a` to `b`, `k` (0..1) along, lifted `arc` in the middle. */
const arcAt = (a: Vector3, b: Vector3, k: number, arc: number, out: Vector3) => out.lerpVectors(a, b, k).setY(a.y + (b.y - a.y) * k + arc * 4 * k * (1 - k))

export class MapMoves {
  private runs = new Map<ChapterId, Run>()
  /** When each friend's last move ended (map clock), for the cooldown. */
  private ended = new Map<ChapterId, number>()
  private clock = 0
  /** Every move played this visit, in order (QA). */
  readonly played: ChapterId[] = []
  /** The goose Roxy robs (world.ts moves geese[2] here while it's set). */
  lent: Lent | null = null

  // The props, built the first time a move needs them.
  private puckT: Group | null = null
  private puckR: Group | null = null
  private rockO: Group | null = null
  private cone: Group | null = null
  private stick: Group | null = null
  private notes: Group[] = []
  private montyGeese: Goose[] = []

  constructor(private host: MoveHost) {}

  /** Plays a friend's move, unless it's already playing or only just ended (a fast double tap): true if it starts. */
  play(m: Mover): boolean {
    if (this.runs.has(m.id)) return false
    if (this.clock - (this.ended.get(m.id) ?? -9) < 0.35) return false
    this.runs.set(m.id, { m, t: 0, did: new Set() })
    this.played.push(m.id)
    return true
  }
  playing(id: ChapterId) {
    return this.runs.has(id)
  }
  get any() {
    return this.runs.size > 0
  }
  /** Seconds left of a friend's move (0: not playing). */
  left(id: ChapterId) {
    const r = this.runs.get(id)
    return r ? Math.max(0, MOVE_S[id] - r.t) : 0
  }

  /** Every frame, after the friends' own update (each move adds its pose to theirs). */
  private dt = 1 / 60
  update(dt: number, t: number, camera: Camera) {
    this.dt = dt
    this.clock += dt
    this.lent = null
    for (const [id, r] of this.runs) {
      r.t += dt
      const once = (key: string, at: number, f: () => void) => {
        if (r.t >= at && !r.did.has(key)) {
          r.did.add(key)
          f()
        }
      }
      const done = r.t >= MOVE_S[id]
      this.step(id, r, Math.min(r.t, MOVE_S[id]), t, once, camera, done)
      if (done) {
        this.runs.delete(id)
        this.ended.set(id, this.clock)
      }
    }
  }

  private step(id: ChapterId, r: Run, s: number, t: number, once: (key: string, at: number, f: () => void) => void, camera: Camera, done: boolean) {
    switch (id) {
      case 'snowman':
        return this.tuque(r, s, t, once, done)
      case 'bike':
        return this.monty(r, s, t, once, done)
      case 'campfire':
        return this.roxy(r, s, t, once, done)
      case 'canoe':
        return this.lulu(r, s, t, once, camera, done)
      case 'bath':
        return this.misty(r, s, t, once, done)
      case 'whales':
        return this.ollie(r, s, t, once, done)
    }
  }

  /** A burst of sparkles at a point in a friend's space. */
  private sparkle(spot: Object3D, at: Vector3, n = 8, color = PINKC, size = 0.06) {
    const p = spot.localToWorld(tmp2.copy(at))
    this.host.spray.burst(p.x, p.y, p.z, n, 0.7, 0.9, size, color)
  }

  // ---- Tuque: keepy-uppy off his tummy. He tosses the puck up from his mitten, it boings off his round tummy, up
  // again, boings again and flies off onto the ice, where it pops.
  private tuque(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, done: boolean) {
    const a = r.m.actor
    const H = a.height
    const puck = (this.puckT ??= this.prop(makePuck(this.host.bag, 0.055)))
    if (puck.parent !== r.m.spot) r.m.spot.add(puck)
    const k = Math.min(span(s, 0, 0.5), 1 - span(s, 2.2, 2.5))
    windUp('snowman', a, k, t)
    const { body } = parts(a)
    // The puck: in his right mitten (out to his left on screen), tossed up, down onto the tummy, up, down, then away.
    // (His arm is up by `armsUp`, and his tummy puffed out by the wind-up: the mitten and the tummy move with them.)
    const th = 0.12 + a.armsUp * 1.1
    const mitten = new Vector3((0.2 * H + 0.31 * H * Math.cos(th)) * body.scale.x, (0.62 * H + 0.31 * H * Math.sin(th)) * body.scale.y + body.position.y, 0.03 * H)
    const tummy = new Vector3(0, 0.3 * H, 0.3 * H * body.scale.z + 0.04)
    const top1 = new Vector3(0.1 * H, 1.35 * H, 0.42 * H)
    const away = new Vector3(-0.12, 0.03, 0.95)
    const p = puck.position
    puck.visible = !done && s < 2.42
    if (s < 0.5) p.copy(mitten)
    else if (s < 0.9) {
      const u = span(s, 0.5, 0.9)
      p.lerpVectors(mitten, top1, u).setY(mitten.y + (top1.y - mitten.y) * Math.sin(u * Math.PI * 0.5))
    } else if (s < 1.2) {
      const u = span(s, 0.9, 1.2)
      p.lerpVectors(top1, tummy, u).setY(top1.y - (top1.y - tummy.y) * u * u)
    } else if (s < 1.75) arcAt(tummy, tummy, span(s, 1.2, 1.75), 0.7 * H, p)
    else if (s < 2.2) arcAt(tummy, away, span(s, 1.75, 2.2), 0.45, p)
    else p.copy(away)
    puck.rotation.set(s < 0.5 ? Math.PI / 2 : s * 9, 0, 0)
    puck.scale.setScalar(s > 2.2 ? Math.max(0.001, 1 - span(s, 2.28, 2.42)) : 1)
    once('toss', 0.5, () => moveSfx.toss())
    once('boing1', 1.2, () => {
      ;(a as Tuque).boing?.()
      moveSfx.boing()
      this.sparkle(r.m.spot, tummy, 5, WHITEC, 0.05)
    })
    once('boing2', 1.75, () => {
      ;(a as Tuque).boing?.()
      moveSfx.boing()
      this.sparkle(r.m.spot, tummy, 5, WHITEC, 0.05)
      a.pull('happy')
    })
    once('land', 2.2, () => {
      moveSfx.clack()
      this.sparkle(r.m.spot, away, 6, WHITEC, 0.05)
    })
    once('pop', 2.3, () => this.sparkle(r.m.spot, away, 8, PINKC))
    if (done && a instanceof Tuque) a.armsUp = 0
  }

  // ---- Monty: a statue. He plants his feet, spreads his arms and shuts his eyes, chin up, so still that two geese take
  // him for one: they fly in and perch on his antlers like pigeons on a statue, hop onto his head, bump bills, honk and
  // fly off. He doesn't budge; then he opens his eyes.
  private monty(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, done: boolean) {
    const a = r.m.actor
    const head = parts(a).head
    if (!(a instanceof FilmActor) || !head) return
    const R = a.rig.face.R
    const hy = a.rig.face.headY
    if (!this.montyGeese.length) {
      this.montyGeese = [new Goose(this.host.bag, { height: 0.76 * R }), new Goose(this.host.bag, { height: 0.7 * R })]
      for (const g of this.montyGeese) g.place(0, 0, 0, 0)
    }
    const k = Math.min(span(s, 0, 0.6), 1 - span(s, 2.3, 2.6))
    windUp('bike', a, k, t)
    const { body, eyes } = parts(a)
    // Still as a statue: no breathing, eyes shut, a tiny proud nod at the end.
    const still = Math.min(span(s, 0.45, 0.6), 1 - span(s, 2.3, 2.45))
    if (still > 0) {
      body.scale.y += (1 - 0.07 * k - body.scale.y) * still
      if (eyes) eyes.scale.y = eyes.scale.y * (1 - still) + 0.1 * still
    }
    if (s > 2.35) head.rotation.x += 0.18 * bell(span(s, 2.35, 2.6))
    once('freeze', 0.55, () => moveSfx.statue())
    // The geese live on his head while they're there (head space: his antlers' rims, the top of his head).
    this.montyGeese.forEach((g, i) => {
      if (g.root.parent !== head) head.add(g.root)
      const side = i ? 1 : -1
      const t0 = 0.6 + i * 0.2
      const from = new Vector3(side * 3.6 * R, hy + 2.8 * R, 0.4 * R)
      // (On the inner half of the antler's palm, which tips up toward his head, clear of the tines along its rim.)
      const perch = new Vector3(side * 0.84 * R, hy + 1.47 * R, -0.08 * R)
      const top = new Vector3(side * 0.3 * R, hy + 0.97 * R, 0.05 * R)
      const away = new Vector3(side * 3.4 * R, hy + 3.8 * R, -1.2 * R)
      const p = g.root.position
      let scale = 1
      let yaw = side < 0 ? Math.PI / 2 : -Math.PI / 2
      g.flying = false
      if (s < t0 + 0.5) {
        const u = span(s, t0, t0 + 0.5)
        p.lerpVectors(from, perch, smooth(u)).setY(from.y + (perch.y - from.y) * Math.sin(u * Math.PI * 0.5))
        g.flying = u < 0.95
        scale = Math.min(1, u / 0.12)
      } else if (s < 1.3) p.copy(perch)
      else if (s < 1.62) arcAt(perch, top, span(s, 1.3, 1.62), 0.25 * R, p)
      else if (s < 2.0) {
        // Bill to bill: a bonk, a jolt back, then they turn to look at the camera.
        p.copy(top).x += side * 0.08 * R * bell(span(s, 1.66, 1.85))
        if (s > 1.85) yaw *= 1 - smooth(span(s, 1.85, 2.0))
      } else {
        const u = span(s, 2.0, 2.5)
        p.lerpVectors(top, away, smooth(u)).setY(top.y + (away.y - top.y) * u)
        yaw = side < 0 ? -0.5 : 0.5
        g.flying = true
        scale = 1 - span(u, 0.8, 1)
      }
      g.root.rotation.y = yaw
      g.root.visible = !done && s >= t0
      g.root.scale.setScalar(Math.max(0.001, scale))
      g.armsUp = s > 1.62 && s < 1.9 ? 0.6 * bell(span(s, 1.62, 1.9)) : 0
      g.headTurn = s > 1.3 && s < 1.6 ? -side * 0.4 : 0
      g.update(this.dt, t)
    })
    once('flap', 0.6, () => moveSfx.flap())
    once('bonk', 1.66, () => {
      moveSfx.bonk()
      moveSfx.honk()
      head.localToWorld(tmp.set(0, hy + 1.15 * R, 0.05 * R))
      this.host.spray.burst(tmp.x, tmp.y, tmp.z, 5, 0.5, 0.8, 0.05, BUTTER)
    })
    once('off', 2.0, () => moveSfx.flap())
    if (done) for (const g of this.montyGeese) g.root.visible = false
  }

  // ---- Roxy: one of the geese skating on the rink comes by pushing a puck; she leaps over the boards, whisks it,
  // leaps back and holds it up. The goose skates on, looks down: no puck. Where did it go?
  private roxy(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, done: boolean) {
    const a = r.m.actor
    const spot = r.m.spot
    const rink = this.host.rink
    // (A big puck: it ends up on her head, and from the board's camera a small one is lost in her ears.)
    const puck = (this.puckR ??= this.prop(makePuck(this.host.bag, 0.085)))
    const k = Math.min(span(s, 0, 0.55), 1 - span(s, 0.6, 0.7), 1)
    if (s < 0.7) windUp('campfire', a, k, t)
    // The goose's way along the ice in front of her (rink space): in from the right, past her, slowing to a stop.
    const home = spot.position
    const z = 0.15
    const A = new Vector3(home.x + 0.55, 0.1, z)
    const B = new Vector3(home.x + 0.2, 0.1, z)
    const C = new Vector3(home.x + 0.12, 0.1, z)
    const lead = 0.2
    const gAt = new Vector3()
    let gw = 1
    if (s < 0.45) {
      gAt.copy(A)
      gw = smooth(s / 0.45)
    } else if (s < 0.95) gAt.lerpVectors(A, B, span(s, 0.45, 0.95))
    else if (s < 1.3) gAt.lerpVectors(B, C, Math.sin(span(s, 0.95, 1.3) * Math.PI * 0.5))
    else gAt.copy(C)
    if (s > 1.9) gw = 1 - smooth(span(s, 1.9, 2.5))
    const look = s > 1.25 && s < 1.95 ? Math.sin(span(s, 1.25, 1.95) * TAU) * 0.8 : s > 1.0 && s <= 1.25 ? 0.3 * span(s, 1.0, 1.25) : 0
    this.lent = done ? null : { at: gAt, yaw: -Math.PI / 2, w: gw, headTurn: look }
    // The puck rides in front of the goose's bill, until she has it.
    const grab = 0.95
    if (puck.parent !== rink && s < grab) rink.add(puck)
    if (s < grab) {
      puck.position.set(gAt.x - lead, 0.09, z)
      puck.rotation.set(0, 0, 0)
      puck.visible = s > 0.3 && !done
      puck.scale.setScalar(Math.min(1, span(s, 0.3, 0.45)) + 0.001)
    }
    // Roxy: over the boards to the puck, and back.
    const land = new Vector3(home.x, 0.09, z)
    spot.updateWorldMatrix(true, false)
    const there = spot.worldToLocal(rink.localToWorld(land.clone()))
    once('leap', 0.65, () => {
      a.hopTo(there.x, there.y, there.z - 0.1, 0.3, 0, 0.3)
      a.root.rotation.y = 0
      moveSfx.swish()
    })
    // She whisks it: it flips up off the ice and lands flat on top of her head (head space from here on).
    const head = parts(a).head
    const R = a instanceof FilmActor ? a.rig.face.R : 0.15
    const hy = a instanceof FilmActor ? a.rig.face.headY : 0.6
    const onTop = new Vector3(0, hy + R * 0.98, 0)
    once('grab', grab, () => {
      if (head) {
        puck.getWorldPosition(tmp2)
        head.add(puck)
        head.updateWorldMatrix(true, false)
        puck.position.copy(head.worldToLocal(tmp2))
        puck.userData.from = puck.position.clone()
        puck.scale.setScalar(1 / Math.max(0.001, spot.scale.x))
      }
      moveSfx.snatch()
      this.sparkle(spot, there, 6, BUTTER, 0.05)
    })
    if (s >= grab && s < 2.15 && puck.parent === head && puck.userData.from) {
      const u = span(s, grab, grab + 0.45)
      arcAt(puck.userData.from as Vector3, onTop, u, 0.35 * R * 4, puck.position)
      puck.rotation.set(u < 1 ? u * TAU * 1.5 : 0, 0, 0)
    }
    once('back', 1.02, () => {
      a.hopTo(0, 0, 0, 0.34, 0, 0.3)
      a.root.rotation.y = 0
    })
    once('honk', 1.45, () => moveSfx.honk())
    once('ta-da', 1.4, () => a.pull('happy'))
    // Both paws up: ta-da.
    const { armR, armL } = parts(a)
    const up = smooth(Math.min(span(s, 1.35, 1.6), 1 - span(s, 2.15, 2.45)))
    if (armR && armL) {
      armR.rotation.z += 2.0 * up
      armL.rotation.z -= 2.0 * up
    }
    once('pop', 2.15, () => {
      puck.getWorldPosition(tmp2)
      this.host.spray.burst(tmp2.x, tmp2.y, tmp2.z, 9, 0.7, 0.9, 0.06, PINKC)
      puck.visible = false
      moveSfx.pop()
    })
    if (done) puck.visible = false
  }

  // ---- Lulu: a big breath, then her song: notes pop from her bill and drift up and away over the rink.
  private lulu(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, camera: Camera, done: boolean) {
    const a = r.m.actor
    const H = a.height
    if (!this.notes.length) {
      const cols = ['#FF7FB0', '#B79CF5', '#FFC94D', '#FF9FC6', '#8FC8FF']
      this.notes = cols.map((c, i) => this.prop(note(this.host.bag, c, i % 2 === 1)))
    }
    const k = Math.min(span(s, 0, 0.6), 1 - span(s, 2.0, 2.3))
    windUp('canoe', a, k, t)
    const singing = Math.min(span(s, 0.6, 0.75), 1 - span(s, 1.95, 2.15))
    if (a instanceof Lulu) a.calling = Math.max(0.35 * k, singing * (0.78 + 0.22 * Math.sin(t * 8)))
    const { body } = parts(a)
    body.rotation.z += Math.sin(t * 5) * 0.07 * singing
    once('song', 0.6, () => moveSfx.song())
    // The notes: each rises from her bill, sways, grows and fades (shrinks) as it drifts over the ice.
    const bill = new Vector3(0, 0.78 * H, 0.42 * H)
    this.notes.forEach((n, i) => {
      if (n.parent !== r.m.spot) r.m.spot.add(n)
      const t0 = 0.65 + i * 0.24
      const u = (s - t0) / 1.25
      const on = u >= 0 && u <= 1 && !done
      n.visible = on
      if (!on) return
      // (Out to her side and up, a little back: from the board's high camera they float clear of her face.)
      n.position.set(bill.x + 0.12 + u * (0.55 + (i % 2) * 0.15) + Math.sin(u * 5 + i * 1.7) * 0.06, bill.y + 0.05 + u * 0.8, bill.z - u * 0.3)
      n.scale.setScalar(Math.max(0.001, 1.35 * Math.min(1, u / 0.12) * (1 - smooth(span(u, 0.7, 1))) * (1.0 + 0.1 * Math.sin(t * 9 + i))))
      // Turned to face the camera, with a little sway.
      n.parent!.getWorldQuaternion(q).invert()
      n.quaternion.copy(q.multiply(camera.quaternion))
      n.rotateZ(Math.sin(t * 4 + i) * 0.25)
      if (i === 0 && u < 0.05) once('n0', t0, () => this.sparkle(r.m.spot, bill, 4, PINKC, 0.04))
    })
    if (done) {
      for (const n of this.notes) n.visible = false
      if (a instanceof Lulu) {
        a.calling = 0
        a.armsUp = 0
      }
    }
  }

  // ---- Misty: the stick in her paw, the wind-up, WHACK: a pinecone flies over the boards and lands on the ice.
  private misty(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, done: boolean) {
    const a = r.m.actor
    const H = a.height
    const { armR, armL, body, head } = parts(a)
    if (!this.stick && armR) {
      this.stick = mapStick(H, this.host.bag)
      this.stick.visible = false
      armR.add(this.stick)
    }
    const cone = (this.cone ??= this.prop(pinecone(this.host.bag)))
    if (cone.parent !== r.m.spot) r.m.spot.add(cone)
    // Wind up, swing through fast, hold the follow-through, put the stick down.
    const k = s < 0.8 ? span(s, 0, 0.8) : 1 - smooth(span(s, 0.8, 0.95))
    windUp('bath', a, k, t)
    const through = s < 0.8 ? 0 : Math.min(smooth(span(s, 0.8, 0.95)), 1 - smooth(span(s, 1.9, 2.4)))
    if (armR && armL) {
      armR.rotation.x -= 1.0 * through
      armR.rotation.z += 0.3 * through
      armL.rotation.x -= 0.5 * through
    }
    body.rotation.y += 0.4 * through
    if (this.stick) this.stick.visible = !done && s < 2.3
    once('stick', 0.02, () => {
      if (this.stick) this.sparkle(this.stick, tmp.set(0.09 * H, -0.3 * H, 0.15 * H), 5, PINKC, 0.05)
    })
    // The pinecone: on the snow by her stick's blade, then away in a big arc over the boards, a skitter, a pop.
    const rest = new Vector3(0.3 * H, 0.04, 0.42 * H)
    // (Close enough in front of her that the shot keeps her big while it flies.)
    const land = new Vector3(-0.42, 0.035, 0.94)
    const slide = new Vector3(-0.53, 0.035, 1.04)
    const p = cone.position
    cone.visible = !done && s < 2.3
    if (s < 0.9) {
      p.copy(rest)
      cone.rotation.set(0, 0.6, 0)
      cone.scale.setScalar(Math.max(0.001, Math.min(1, s / 0.15)))
    } else if (s < 1.85) {
      arcAt(rest, land, span(s, 0.9, 1.85), 1.0, p)
      cone.rotation.set(s * 14, 0.6, s * 5)
      if (Math.random() < 0.6) {
        cone.getWorldPosition(tmp2)
        this.host.spray.emit(tmp2.x, tmp2.y, tmp2.z, 0, 0.05, 0, 0.5, 0.045, Math.random() < 0.5 ? PINKC : BUTTER)
      }
    } else {
      p.lerpVectors(land, slide, Math.sin(span(s, 1.85, 2.1) * Math.PI * 0.5))
      cone.rotation.set(0, 0.6 + span(s, 1.85, 2.1) * 3, 0)
      cone.scale.setScalar(Math.max(0.001, 1 - span(s, 2.15, 2.3)))
    }
    if (head) head.rotation.y += -0.5 * Math.min(span(s, 0.95, 1.2), 1 - span(s, 1.9, 2.2))
    once('slap', 0.9, () => {
      moveSfx.slap()
      this.sparkle(r.m.spot, rest, 6, BUTTER, 0.05)
    })
    once('land', 1.85, () => {
      moveSfx.cone()
      this.sparkle(r.m.spot, land, 7, WHITEC, 0.05)
    })
    once('cheer', 1.9, () => {
      a.pull('happy')
      a.hop()
    })
    once('pop', 2.18, () => this.sparkle(r.m.spot, slide, 8, PINKC))
    once('down', 2.3, () => {
      if (this.stick) this.sparkle(this.stick, tmp.set(0.09 * H, -0.3 * H, 0.15 * H), 5, PINKC, 0.05)
    })
    if (done && this.stick) this.stick.visible = false
  }

  // ---- Ollie: she juggles her lucky rock from paw to paw, spins like a top and passes it to Maple; Maple pops it
  // straight back, and Ollie tucks it under her arm.
  private ollie(r: Run, s: number, t: number, once: (k: string, at: number, f: () => void) => void, done: boolean) {
    const a = r.m.actor
    const H = a.height
    const spot = r.m.spot
    const stone = (this.rockO ??= this.prop(rock(this.host.bag)))
    if (stone.parent !== spot) spot.add(stone)
    const k = Math.min(span(s, 0, 0.35), 1 - span(s, 0.8, 1.05), 1) * (s < 1.25 ? 1 : 0) + (s > 2.35 ? 0.6 * Math.min(span(s, 2.35, 2.45), 1 - span(s, 2.5, 2.7)) : 0)
    windUp('whales', a, k, t)
    const { body } = parts(a)
    // The spin.
    const spin = smooth(span(s, 0.8, 1.25)) * TAU
    body.rotation.y += spin
    // Where the rock is: juggled over her paws, held through the spin, away to Maple, back, tucked.
    const paws = new Vector3(0, 0.5 * H, 0.22 * H)
    const maple = this.host.maple
    spot.updateWorldMatrix(true, false)
    const mp = spot.worldToLocal(maple.root.localToWorld(tmp.set(0, 1.08 * maple.height, 0.06 * maple.height)))
    const p = stone.position
    stone.visible = !done && s < 2.62
    if (s < 0.8) {
      // Two tosses, each a little higher.
      const u = (s % 0.4) / 0.4
      const hgt = s < 0.4 ? 0.28 * H : 0.4 * H
      p.set(paws.x + Math.sin((s / 0.4) * Math.PI) * 0.05 * H, paws.y + hgt * 4 * u * (1 - u), paws.z)
    } else if (s < 1.25) p.set(Math.sin(spin) * paws.z, paws.y, Math.cos(spin) * paws.z)
    else if (s < 1.65) arcAt(tmp2.set(Math.sin(spin) * paws.z, paws.y, Math.cos(spin) * paws.z), mp, span(s, 1.25, 1.65), 0.22, p)
    else if (s < 1.9) p.copy(mp)
    else if (s < 2.4) arcAt(mp, paws, span(s, 1.9, 2.4), 0.45, p)
    else p.lerpVectors(paws, tmp2.set(0.22 * H, 0.38 * H, 0.05 * H), span(s, 2.4, 2.6))
    stone.rotation.set(s * 8, s * 5, 0)
    // (Half as big again as life: from the board's camera a real-sized pebble is a speck.)
    stone.scale.setScalar(1.5 * Math.max(0.001, s > 2.4 ? 1 - span(s, 2.45, 2.62) : Math.min(1, s / 0.1)))
    once('j1', 0.0, () => moveSfx.pat())
    once('j2', 0.4, () => moveSfx.pat())
    once('j3', 0.8, () => moveSfx.pat())
    once('spin', 0.8, () => moveSfx.spin())
    once('pass', 1.25, () => moveSfx.pass())
    once('catch', 1.65, () => {
      moveSfx.pat()
      maple.hop()
      maple.pull('happy')
      this.sparkle(spot, mp, 6, BUTTER, 0.05)
    })
    once('back', 1.9, () => moveSfx.pass())
    once('caught', 2.4, () => {
      moveSfx.pat()
      a.pull('happy')
      this.sparkle(spot, paws, 5, PINKC, 0.05)
    })
    // Maple's paws up over her head for the catch (from the board's high camera, a catch at her chest hides under her
    // head).
    if (maple instanceof FilmActor) {
      const c = smooth(Math.min(span(s, 1.4, 1.62), 1 - span(s, 1.9, 2.15)))
      maple.rig.armR.rotation.z += 2.5 * c
      maple.rig.armL.rotation.z -= 2.5 * c
    }
    if (done) stone.visible = false
  }

  private prop<T extends Object3D>(o: T): T {
    o.visible = false
    return o
  }

  qa() {
    return { playing: [...this.runs.keys()], played: [...this.played] }
  }
}
