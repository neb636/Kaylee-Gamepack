// Statues (planning/around-the-world/canada-round-2.md, Flashlight Statues): Roxy the raccoon, caught in the
// flashlight's beam, freezes in a ridiculous pose with a silly face ("I'm a tree." "I'm a rock." "Nobody here!"). A
// small library of poses for any rig actor (engine3d/characters/actor.ts FilmActor): the campfire game uses it, her
// kits strike one when they're caught, and the big game reuses it (a goose Roxy robs freezes like a statue).
//
//   strikeStatue(roxy, 'tree')        freezes into the pose (a snap, about 0.12 s) with its silly face, until...
//   statueWobble(roxy, k)             ...the light holds her: a slow sway that grows with k (0..1)
//   releaseStatue(roxy)               back to herself (her own face, her own breathing)
//   nextStatue(last)                  a pose to strike next, never the one just struck
//
// How: the actor still runs its own update (blinks, breathing, a walk), and the pose is laid over its bones straight
// after (strikeStatue wraps that actor's update once), so it works wherever the actor is updated: a film's cast, a
// game's own loop. A hand-built toy (characters/toy.ts ToyActor: the geese) has no bones: it leans and stretches its
// whole body into the pose instead, and pulls the face.
import type { Group } from 'three'
import { lerp } from '../../../../sdk/math'
import type { FilmActor } from '../../../engine3d/characters/actor'
import type { Silly } from '../../../engine3d/characters/face'
import type { ToyActor } from './toy'

export type StatueId = 'tree' | 'rock' | 'flamingo' | 'whistling' | 'ballerina'
export const STATUES: readonly StatueId[] = ['tree', 'rock', 'flamingo', 'whistling', 'ballerina']

type Rot = [x: number, y: number, z: number]
/** A pose: rotations (radians) for each bone, the body's stretch and lift (of their height), and the silly face. */
interface Pose {
  /** Body: lean forward (x), twist (y), lean to their left (z, + toward their right side as seen from the front). */
  body: Rot
  /** Taller (> 1) or squashed (< 1), and wider when squashed. */
  stretch: number
  /** Up (+) or down (-), in their heights. */
  lift: number
  /** Arms: armL z is negative to raise it, armR z positive; x negative swings an arm forward. */
  armL: Rot
  armR: Rot
  head: Rot
  face: Silly
  /** The mouth's shape (x, y scale): a whistle's little "o". */
  mouth?: [number, number]
}

const POSES: Record<StatueId, Pose> = {
  // "I'm a tree.": both arms up and out like branches (a Y: straight up, a chibi's little arms hide behind its big
  // head), tall on tiptoe, swaying a little, eyes huge.
  tree: { body: [0, 0, 0.06], stretch: 1.1, lift: 0.02, armL: [-0.15, 0, -2.2], armR: [-0.15, 0, 2.3], head: [-0.12, 0, 0.12], face: 'dazzled' },
  // "I'm a rock.": curled up small, arms hugging her knees, head tucked, peeking cross-eyed.
  rock: { body: [0.32, 0, 0], stretch: 0.72, lift: -0.02, armL: [-1.25, 0, 0.42], armR: [-1.25, 0, -0.42], head: [0.38, 0, 0.1], face: 'crossed' },
  // Standing on one leg like a flamingo: tipped to one side, arms out like wings to keep her balance.
  flamingo: { body: [0, 0.15, 0.24], stretch: 1.04, lift: 0.04, armL: [-0.15, 0, -1.55], armR: [-0.1, 0, 1.25], head: [-0.05, 0, -0.32], face: 'dizzy' },
  // "Nobody here!": paws behind her back, looking away up at the sky, whistling.
  whistling: { body: [-0.06, -0.12, 0], stretch: 1.02, lift: 0, armL: [0.75, 0, -0.18], armR: [0.75, 0, 0.18], head: [-0.22, 0.5, 0.12], face: 'crossed', mouth: [0.55, 1.6] },
  // "Just stretching!": up on tiptoe, one arm arched over her head, the other curved in front, a twirl.
  ballerina: { body: [0, 0.45, -0.12], stretch: 1.08, lift: 0.05, armL: [-1.15, 0, -0.55], armR: [-0.35, 0, 2.15], head: [-0.08, -0.2, 0.22], face: 'dazzled' },
}

/** Anyone who can be a statue: a rig actor, or a hand-built toy. */
export type Statuesque = FilmActor | ToyActor

interface Hold {
  id: StatueId
  /** 0 (themselves) .. 1 (the pose), and where it's going. */
  k: number
  goal: number
  wobble: number
  t: number
}

const held = new WeakMap<Statuesque, Hold>()
const wrapped = new WeakSet<Statuesque>()

/** Freezes them into a statue pose (with its silly face) until `releaseStatue`. Striking another pose while frozen
 *  snaps straight into it. */
export function strikeStatue(who: Statuesque, id: StatueId) {
  wrap(who)
  const h = held.get(who)
  if (h) {
    h.id = id
    h.goal = 1
  } else held.set(who, { id, k: 0, goal: 1, wobble: 0, t: 0 })
  // (A long face: it comes off when they're released.)
  who.silly(POSES[id].face, 600)
}

/** How much the statue sways (0 still .. 1 about to fall over). */
export function statueWobble(who: Statuesque, k: number) {
  const h = held.get(who)
  if (h) h.wobble = Math.max(0, Math.min(1, k))
}

/** Back to their own pose and face (it eases out over a quarter of a second). */
export function releaseStatue(who: Statuesque) {
  const h = held.get(who)
  if (!h || h.goal === 0) return
  h.goal = 0
  h.wobble = 0
  who.silly(POSES[h.id].face, 0)
}

/** The pose they're in now (null: themselves). */
export const statueOf = (who: Statuesque): StatueId | null => {
  const h = held.get(who)
  return h && h.goal > 0 ? h.id : null
}

/** A pose to strike next: any but `last`. */
export function nextStatue(last: StatueId | null, pool: readonly StatueId[] = STATUES) {
  const from = pool.filter((p) => p !== last)
  return from[Math.floor(Math.random() * from.length)] ?? pool[0]
}

// ---------------------------------------------------------------- holding the pose

/** Lays the pose over their bones after their own update, every frame they're updated. */
function wrap(who: Statuesque) {
  if (wrapped.has(who)) return
  wrapped.add(who)
  const own = who.update.bind(who)
  who.update = (dt: number, t: number) => {
    own(dt, t)
    const h = held.get(who)
    if (!h) return
    // A snap into the pose (a freeze), a softer ease out.
    h.k += (h.goal - h.k) * Math.min(1, dt * (h.goal > h.k ? 26 : 9))
    h.t += dt
    if (h.goal === 0 && h.k < 0.01) {
      held.delete(who)
      return
    }
    lay(who, POSES[h.id], h, t)
  }
}

const ease = (o: Group, r: Rot, k: number) => o.rotation.set(lerp(o.rotation.x, r[0], k), lerp(o.rotation.y, r[1], k), lerp(o.rotation.z, r[2], k))

function lay(who: Statuesque, p: Pose, h: Hold, t: number) {
  const k = h.k
  // The wobble: a slow sway that grows, and a little shiver of trying very hard to hold still.
  const w = h.wobble
  const sway = w * (0.2 * Math.sin(t * 3.1) + 0.035 * Math.sin(t * 27)) * k
  const nod = w * 0.08 * Math.sin(t * 3.1 + 1.2) * k
  const H = who.height
  if ('rig' in who) {
    const r = who.rig
    const s = lerp(1, p.stretch, k)
    // (Breathing stops: a statue doesn't breathe. Squashed, they get wider.)
    r.body.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
    r.body.position.y = lerp(r.body.position.y, p.lift * H, k)
    ease(r.body, p.body, k)
    r.body.rotation.z += sway
    r.body.rotation.x += nod
    ease(r.armL, p.armL, k)
    ease(r.armR, p.armR, k)
    ease(r.head, p.head, k)
    r.head.rotation.z -= sway * 0.6
    if (p.mouth) r.mouth.scale.set(lerp(1, p.mouth[0], k), lerp(1, p.mouth[1], k), 1)
  } else {
    // A toy: the whole body leans and stretches into it.
    const b = who.body
    const s = lerp(1, p.stretch, k)
    b.scale.set(1 / Math.sqrt(s), s, 1 / Math.sqrt(s))
    b.position.y = lerp(b.position.y, p.lift * H, k)
    ease(b, p.body, k)
    b.rotation.z += sway
    b.rotation.x += nod
  }
}
