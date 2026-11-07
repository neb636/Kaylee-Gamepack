// The pieces on the game table's boards. A piece hops from space to space (one hop per space, so she can count them),
// lies down for a rest, dances at the finish, and bobs gently while it's its player's turn.
// Positions are in the table top's space (x across, z toward the front of the house, y up from the top).
import { Group, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { bell } from '../../../../../../sdk'
import type { UnicornColor } from './list'

export const UNICORN_HEX: Record<UnicornColor, { body: string; mane: string }> = {
  pink: { body: '#FF9CC4', mane: PAL.hotpink },
  lavender: { body: '#CDB9FF', mane: '#8E6FE8' },
  mint: { body: '#9BEBCF', mane: '#3FB98F' },
  sunny: { body: '#FFE68A', mane: '#F2A23A' },
}

/** A little unicorn figure on a round base, about 9 cm tall, facing +x (its head to the side, so it reads from above). */
function unicornParts(c: UnicornColor): BufferGeometry[] {
  const { body, mane } = UNICORN_HEX[c]
  return [
    P.cyl(0.026, 0.028, 0.01, '#FFFFFF', { at: [0, 0.005, 0] }, 14),
    P.sphere(0.024, body, { at: [0, 0.035, 0], scale: [1.25, 0.9, 0.9] }, 12),
    ...[-0.012, 0.012].flatMap((x) => [-0.009, 0.009].map((z) => P.cyl(0.0055, 0.0055, 0.022, body, { at: [x, 0.016, z] }, 6))),
    P.sphere(0.019, body, { at: [0.022, 0.065, 0] }, 12),
    P.sphere(0.009, PAL.cream, { at: [0.038, 0.06, 0] }, 8),
    P.cone(0.006, 0.03, PAL.gold, { at: [0.026, 0.093, 0], rot: [0, 0, -0.35] }, 8),
    P.sphere(0.012, mane, { at: [0.008, 0.075, 0] }, 8),
    P.sphere(0.01, mane, { at: [-0.002, 0.058, 0] }, 8),
    P.sphere(0.011, mane, { at: [-0.032, 0.045, 0], scale: [1, 1.3, 1] }, 8),
    ...[-1, 1].map((s) => P.sphere(0.0035, PAL.ink, { at: [0.033, 0.07, s * 0.012] }, 6)),
  ]
}

interface Hop {
  to: Vector3
  dur: number
  arc: number
  from?: Vector3
  t: number
  done?: () => void
}

export class Piece {
  readonly root = new Group()
  private body = new Group()
  private hops: Hop[] = []
  private restT = -1
  private restDur = 1
  private danceT = -1
  private pokeT = -1
  /** Its player's turn: it bobs. */
  active = false
  /** The space it's on (what the table shows; the rules' state may already be ahead while it hops). */
  at = 0

  constructor(
    bag: Bag,
    readonly color: UnicornColor,
    id: string,
  ) {
    this.body.add(solid(merge(unicornParts(color)), bag, 1.5))
    this.root.add(this.body)
    this.root.userData.pick = id
  }

  get busy() {
    return this.hops.length > 0 || this.restT >= 0 || this.danceT >= 0 || this.pokeT >= 0
  }
  get moving() {
    return this.hops.length > 0
  }

  place(at: Vector3) {
    this.hops = []
    this.root.position.copy(at)
  }

  /** Hops to `to` (after any hops already queued). */
  hop(to: Vector3, dur: number, arc: number, done?: () => void) {
    this.hops.push({ to: to.clone(), dur, arc, t: 0, done })
  }

  /** Lies down for a little nap (a 4 in the Unicorn game). */
  rest(dur: number) {
    this.restT = 0
    this.restDur = dur
  }
  /** Spins and bounces at the finish. */
  dance() {
    this.danceT = 0
  }
  /** Tapped: a happy hop in place. */
  poke() {
    if (!this.moving) this.pokeT = 0
  }

  stop() {
    const last = this.hops[this.hops.length - 1]
    if (last) this.root.position.copy(last.to)
    this.hops = []
    this.restT = -1
    this.danceT = -1
    this.pokeT = -1
  }

  update(dt: number, t: number) {
    const b = this.body
    b.position.set(0, 0, 0)
    b.rotation.set(0, 0, 0)
    b.scale.set(1, 1, 1)
    const h = this.hops[0]
    if (h) {
      if (!h.from) h.from = this.root.position.clone()
      h.t = Math.min(1, h.t + dt / h.dur)
      const e = h.t * h.t * (3 - 2 * h.t)
      this.root.position.lerpVectors(h.from, h.to, e)
      b.position.y = bell(h.t) * h.arc
      // A little squash as it takes off and lands.
      const sq = 1 - 0.18 * bell(Math.min(1, h.t * 4)) * (h.t < 0.25 ? 1 : 0) - 0.18 * bell(Math.max(0, h.t - 0.8) * 5)
      b.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq))
      if (h.t >= 1) {
        this.hops.shift()
        h.done?.()
      }
      return
    }
    if (this.restT >= 0) {
      this.restT += dt / this.restDur
      const p = Math.min(1, this.restT)
      // Down onto its side, a slow breath, and back up.
      const down = Math.min(1, p / 0.2) * (1 - Math.max(0, (p - 0.8) / 0.2))
      b.rotation.x = -1.25 * down
      b.position.y = 0.012 * down
      b.scale.y = 1 + Math.sin(p * Math.PI * 4) * 0.03 * down
      if (this.restT >= 1) this.restT = -1
      return
    }
    if (this.danceT >= 0) {
      this.danceT += dt / 1.4
      const p = Math.min(1, this.danceT)
      b.rotation.y = p * Math.PI * 4
      b.position.y = Math.abs(Math.sin(p * Math.PI * 4)) * 0.04
      if (this.danceT >= 1) this.danceT = -1
      return
    }
    if (this.pokeT >= 0) {
      this.pokeT += dt / 0.45
      b.position.y = bell(Math.min(1, this.pokeT)) * 0.04
      if (this.pokeT >= 1) this.pokeT = -1
      return
    }
    if (this.active) b.position.y = Math.max(0, Math.sin(t * 6)) * 0.012
  }
}
