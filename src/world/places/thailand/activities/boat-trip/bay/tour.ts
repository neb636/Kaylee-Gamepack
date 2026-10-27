// The big white tour boat, greybox: it cruises a slow loop round the middle of the bay and leaves a wake behind it.
// Cross the wake fast and the longtail hops off it like a ramp. It's a soft wall too (boing), and toots when tapped.
import { Group } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import type { Particles } from '../../../../../engine3d/particles'
import { TOUR } from './layout'

/** A ridge of its wake: where, which way the boat was going, and when. */
export interface Ridge {
  x: number
  z: number
  dx: number
  dz: number
  t: number
}

const LEN = 13
export const WAKE_LIFE = 9

export class TourBoat {
  readonly root = new Group()
  x = 0
  z = 0
  heading = 0
  /** Its wake (newest last), for the jumps. */
  ridges: Ridge[] = []
  private lastRidge = -1
  private lastFoam = -1
  private bob = 0

  constructor(bag: Bag) {
    const body = solid(
      merge([
        P.rbox(4, 1.4, LEN, 0.5, '#FFFFFF', { at: [0, 0.5, 0] }),
        P.box(4.08, 0.3, LEN - 1, PAL.lavenderDark, { at: [0, 0.75, 0] }),
        P.rbox(2.4, 1.5, 3, 0.4, '#FFFFFF', { at: [0, 1.8, LEN / 2 - 1.6], rot: [-0.25, 0, 0] }),
        P.rbox(3.2, 1.6, 6.5, 0.3, '#EAF6FF', { at: [0, 2.0, -1.2] }),
        P.box(3.5, 0.18, 7, PAL.sky, { at: [0, 2.9, -1.2] }),
        // Passengers' heads at the windows.
        ...[-2.6, -0.8, 1.0].flatMap((z) => [-1, 1].map((s) => P.sphere(0.3, ['#FFC2A8', '#FBEA9A', '#D9CCFF'][Math.abs(Math.round(z)) % 3], { at: [s * 1.25, 2.35, z - 1.2] }, 8))),
      ]),
      bag,
      2,
    )
    this.root.add(body)
    this.root.userData.pick = 'tour'
  }

  /** Bump circles along its length (world). */
  circles(): [number, number, number][] {
    const sx = Math.sin(this.heading)
    const sz = Math.cos(this.heading)
    return [-4.5, 0, 4.5].map((d) => [this.x + sx * d, this.z + sz * d, 2.3])
  }

  update(t: number, dt: number, foam: Particles) {
    const a = (t / TOUR.period) * Math.PI * 2
    const x = TOUR.x + Math.sin(a) * TOUR.rx
    const z = TOUR.z + Math.cos(a) * TOUR.rz
    this.heading = Math.atan2(Math.cos(a) * TOUR.rx, -Math.sin(a) * TOUR.rz)
    this.x = x
    this.z = z
    this.bob += dt
    this.root.position.set(x, Math.sin(this.bob * 1.4) * 0.06, z)
    this.root.rotation.set(0, this.heading, Math.sin(this.bob * 1.1) * 0.02)
    const sx = Math.sin(this.heading)
    const sz = Math.cos(this.heading)
    const sternX = x - sx * (LEN / 2)
    const sternZ = z - sz * (LEN / 2)
    // A V of foam spreading out behind it.
    if (t - this.lastFoam > 0.14) {
      this.lastFoam = t
      for (const s of [-1, 1]) foam.emit(sternX + sz * s * 1.6, 0.03, sternZ - sx * s * 1.6, sz * s * 1.3 - sx * 0.4, 0, -sx * s * 1.3 - sz * 0.4, WAKE_LIFE * 0.8, 2.6)
    }
    if (t - this.lastRidge > 0.4) {
      this.lastRidge = t
      this.ridges.push({ x: sternX, z: sternZ, dx: sx, dz: sz, t })
      while (this.ridges.length && t - this.ridges[0].t > WAKE_LIFE) this.ridges.shift()
    }
  }
}
