// Shared body mechanics for the kangaroo puppets (Pip and Mama): hops, cheers, dances and the springs that make
// ears and tails follow through. Each puppet draws its own art and applies these numbers to its parts.
import { bell, smooth, span, spring, wobble, type PuppetFrame } from '../../../../sdk'

export interface RooPose {
  /** Squash and stretch around the feet. */
  sx: number
  sy: number
  /** Height off the ground (viewBox units) and forward lean (degrees). */
  lift: number
  lean: number
  /** 0..1 knees bent (anticipation / landing). */
  crouch: number
  /** 0..1 progress of the horizontal travel of a hop (for moving the puppet across the scene). */
  travel: number
  head: number
  headY: number
  /** Arm angles (degrees): upper arm and forearm. 0 = hanging down, negative swings toward the chest, positive swings
   *  out and up (150 = raised high). The right arm is mirrored by the puppet, so the same numbers work for both. */
  armL: [number, number]
  armR: [number, number]
  ears: number
  tail: number
  feet: number
  happy: boolean
  /** How open the mouth is from the expression alone (the voice adds to it). */
  open: number
  tongue: boolean
  /** Eyebrows: +1 raised (excited), -1 worried. */
  brow: number
}

export const ROO_ACTIONS = { hop: 0.7, cheer: 1.1, wave: 1.5, dance: 2, wiggle: 0.7, shake: 0.9, fan: 1.6, hug: 1.4 }

/** Hop: crouch (anticipation), stretch on take-off, float, squash on landing, settle. */
export function hopCurve(q: number, height: number) {
  if (q < 0.22) {
    const k = smooth(q / 0.22)
    return { sx: 1 + 0.12 * k, sy: 1 - 0.18 * k, lift: 0, lean: -4 * k, crouch: k, travel: 0 }
  }
  if (q < 0.78) {
    const a = (q - 0.22) / 0.56
    const stretch = Math.max(0, 1 - a * 2.2)
    return { sx: 1 - 0.1 * stretch, sy: 1 + 0.16 * stretch, lift: height * Math.sin(Math.PI * a), lean: 10 * Math.sin(Math.PI * a) - 4, crouch: -0.6 * Math.sin(Math.PI * a), travel: a }
  }
  const a = (q - 0.78) / 0.22
  const squash = Math.sin(Math.PI * Math.min(1, a * 1.4)) * (1 - a * 0.4)
  return { sx: 1 + 0.14 * squash, sy: 1 - 0.2 * squash, lift: 0, lean: 4 * (1 - a), crouch: squash, travel: 1 }
}

/** Creates the per-puppet motion state (springs remember velocity between frames). */
export function rooMotion(hopHeight: number) {
  const ear = spring(180, 9)
  const tail = spring(120, 8)
  let prevLift = 0
  let prevHead = 0

  return (f: PuppetFrame): RooPose => {
    const { t, p: q, action } = f
    const breathe = Math.sin(t * 2.4)
    const pose: RooPose = {
      sx: 1 - breathe * 0.006,
      sy: 1 + breathe * 0.012,
      lift: 0,
      lean: 0,
      crouch: 0,
      travel: 0,
      head: Math.sin(t * 1.3) * 2 + f.look.x * 5,
      headY: breathe * 1.5,
      armL: [0, -38],
      armR: [0, -38],
      ears: 0,
      tail: Math.sin(t * 2) * 5,
      feet: 0,
      happy: false,
      open: 0,
      tongue: false,
      brow: 0,
    }
    // Talking: little head bobs with the syllables.
    pose.head += Math.sin(t * 9) * f.mouth * 4
    pose.headY -= f.mouth * 3

    if (action === 'hop' || action === 'cheer') {
      const h = hopCurve(q, action === 'cheer' ? hopHeight * 0.8 : hopHeight)
      pose.sx *= h.sx
      pose.sy *= h.sy
      pose.lift = h.lift
      pose.lean = action === 'cheer' ? 0 : h.lean
      pose.crouch = h.crouch
      pose.travel = action === 'hop' ? h.travel : 0
      const air = Math.min(1, h.lift / 60)
      pose.happy = h.lift > 30 || action === 'cheer'
      pose.open = action === 'cheer' ? 0.8 : air * 0.5
      pose.feet = air * 18
      if (action === 'cheer') {
        const up = bell(span(q, 0.1, 0.95))
        pose.armL = [170 * up + Math.sin(t * 16) * 12 * up, -38 + 30 * up]
        pose.armR = [170 * up + Math.sin(t * 16 + 1) * 12 * up, -38 + 30 * up]
        pose.brow = up
      } else {
        pose.armL = [35 * air + pose.crouch * 10, -38 - 28 * air]
        pose.armR = [...pose.armL]
      }
    } else if (action === 'wave') {
      const up = bell(span(q, 0, 1)) ** 0.4
      pose.armR = [160 * up, -38 + 30 * up + Math.sin(t * 14) * 28 * up]
      pose.head += 6 * up
      pose.happy = up > 0.5
      pose.open = 0.3 * up
      pose.brow = up * 0.6
    } else if (action === 'dance') {
      const beat = q * Math.PI * 8
      const on = bell(q) ** 0.3
      pose.lean = Math.sin(beat / 2) * 10 * on
      pose.lift = Math.abs(Math.sin(beat)) * 22 * on
      pose.sy *= 1 - Math.abs(Math.cos(beat)) * 0.06 * on
      pose.armL = [(110 + Math.sin(beat) * 50) * on, -38 + 20 * on]
      pose.armR = [(110 - Math.sin(beat) * 50) * on, -38 + 20 * on]
      pose.head += Math.sin(beat / 2) * 8 * on
      pose.happy = true
      pose.open = 0.5 * on
    } else if (action === 'wiggle') {
      const w = wobble(q, 3)
      pose.sx *= 1 + w * 0.06
      pose.sy *= 1 - w * 0.06
      pose.lean = w * 8
      pose.happy = true
      pose.open = 0.6 * bell(q)
      pose.armL = [-35, -95]
      pose.armR = [-35, -95]
    } else if (action === 'shake') {
      const on = bell(q)
      pose.head += Math.sin(q * Math.PI * 7) * 16 * on
      pose.brow = -on
      pose.open = 0.25 * on
    } else if (action === 'fan') {
      const on = bell(span(q, 0, 1)) ** 0.5
      pose.armR = [-145 * on, -38 + 10 * on + Math.sin(t * 20) * 30 * on]
      pose.brow = -on
      pose.tongue = on > 0.3
      pose.open = 0.45 * on
      pose.ears = 18 * on // droopy in the heat
      pose.head -= 4 * on
    } else if (action === 'hug') {
      const on = bell(q) ** 0.5
      pose.armL = [-40 * on, -38 - 60 * on]
      pose.armR = [-40 * on, -38 - 60 * on]
      pose.happy = true
      pose.head += 8 * on
      pose.brow = 0.5 * on
    }

    // Follow-through: ears lag behind vertical motion and head turns, then flop and settle; the tail counterbalances.
    const dt = Math.max(f.dt, 1e-3)
    const vy = (pose.lift - prevLift) / dt
    const vh = (pose.head - prevHead) / dt
    prevLift = pose.lift
    prevHead = pose.head
    const twitch = t % 5.3 < 0.18 ? Math.sin(((t % 5.3) / 0.18) * Math.PI) * 12 : 0
    pose.ears = ear.step(-vy * 0.035 + pose.crouch * 10 + pose.ears - vh * 0.03, dt) + twitch
    pose.tail = tail.step(pose.tail - pose.lift * 0.12 + pose.crouch * 8, dt)
    return pose
  }
}
