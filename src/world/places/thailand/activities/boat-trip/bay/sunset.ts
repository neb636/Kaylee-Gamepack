// The sunset ride (section `sunset`), the payoff on the way home: once she has been to both stops, has her Nail Island
// photo and drives away from the beach, the sky turns pink and gold and the rock towers glow (Mommy: "Look! The sky is
// turning pink!").
// Out here, only at sunset, a finless porpoise surfaces beside the boat (a real, rare visitor to the bay: the secret
// sighting, the ninth sticker). A glow waits at the pier; she drives in, the family hops out onto the boards, and the
// boarding pass gets its last punch (BoatTrip.tsx). Tap the boat and they hop back in for more.
import { Vector3 } from 'three'
import { bell } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import type { BoatSection } from '../sections'
import type { Bay } from './bay'
import { buildPorpoise, type Fish } from './critters'
import { BEACH, MOORED, PIER, PIER_GLOW, SUNSET_START } from './layout'
import type { BayPart, RiderId, Spot } from './part'
import type { Sky } from './sky'

export const SUNSET_ANCHORS: AnchorInfo[] = [{ id: 'porpoise', label: 'Finless porpoise', kind: 'thing' }]

export class SunsetRide implements BayPart {
  readonly start = SUNSET_START
  active = false
  private k = 0
  private porpoise: Fish
  private surface: { t: number; x: number; z: number; h: number } | null = null
  private nextSurface = 3
  private docked = false

  constructor(
    private bay: Bay,
    private sky: Sky,
  ) {
    this.porpoise = buildPorpoise(bay.bag)
    this.porpoise.root.visible = false
    this.porpoise.root.scale.setScalar(1.3)
    bay.scene.add(this.porpoise.root)
  }

  /** The sky starts turning (at once for a link). */
  begin(snap: boolean) {
    if (this.active) return
    this.active = true
    if (snap) {
      this.k = 1
      this.sky.set(1)
    }
    this.bay.say(L.bay.sunset)
    this.bay.refreshSection()
  }

  private get lt() {
    return this.bay.rides.longtail
  }

  /** The longtail's bow at (bx, bz): into the pier's glow at sunset, the end of the ride. */
  arrive(bx: number, bz: number) {
    if (!this.active || this.docked || Math.hypot(bx - PIER_GLOW.x, bz - PIER_GLOW.z) > PIER_GLOW.r) return
    const bay = this.bay
    this.docked = true
    bay.setPhase('swap')
    bay.glide(this.lt, { x: MOORED.x, z: MOORED.z, h: MOORED.heading }, 1.1, () => {
      const spots: [RiderId, number][] = [
        ['ji', -0.75],
        ['kaylee', 0],
        ['nick', 0.75],
      ]
      spots.forEach(([id, s], i) => {
        const r = bay.rider(id)
        bay.strike(r, null)
        bay.hop(r, bay.scene, new Vector3(PIER.x + s, 1.03, MOORED.z - 2.6 - Math.abs(s) * 0.4), 'stand', 180, i * 0.25, i === 2 ? () => this.onPier() : undefined)
      })
    })
  }

  private onPier() {
    const bay = this.bay
    bay.setPhase('docked')
    for (const r of bay.riders) {
      bay.cheer(r)
      bay.strike(r, 'wave', 2)
    }
    bay.docked()
  }

  /** Tap the boat on the pier: back in for more sunset. */
  reboard() {
    const bay = this.bay
    const lt = this.lt
    if (bay.phase !== 'docked') return
    bay.setPhase('swap')
    bay.riders.forEach((r, i) => {
      const pose = bay.poseIn(lt.v, r)
      bay.hop(r, lt.v.body, bay.seatPos(lt.v, r, pose), pose, 0, i * 0.25, i !== 2 ? undefined : () => {
        bay.glide(lt, { x: MOORED.x, z: MOORED.z - 10, h: MOORED.heading }, 1.2, () => {
          bay.setPhase('drive')
          this.docked = false
        })
      })
    })
  }

  anchorAt(id: string): Spot | null {
    if (id !== 'porpoise' || !this.porpoise.root.visible) return null
    return { at: this.porpoise.root.position.clone().setY(0.6), r: 1.2, prio: 3 }
  }

  tap(id: string): boolean {
    if (id !== 'porpoise') return false
    sfx.blow()
    this.bay.found('porpoise', this.porpoise.root.position)
    if (this.surface) this.surface.t = Math.min(this.surface.t, 0.3)
    return true
  }

  update(dt: number, t: number) {
    const bay = this.bay
    const d = this.lt.d
    // Begins once she has her photo and drives away from the beach.
    if (!this.active && bay.isNailDone() && bay.stops.has('village') && bay.stops.has('cave') && bay.using === 'longtail' && bay.phase === 'drive' && Math.hypot(d.x - BEACH.x, d.z - BEACH.z) > 40) this.begin(false)
    if (!this.active) return
    if (this.k < 1) {
      this.k = Math.min(1, this.k + dt / 6)
      this.sky.set(this.k * this.k * (3 - 2 * this.k))
    }
    // The porpoise surfaces beside the boat now and then while she drives: up in an arc, pfff, and down.
    const p = this.porpoise
    p.blink.update(dt)
    this.nextSurface -= dt
    if (!this.surface && this.nextSurface <= 0 && bay.using === 'longtail' && bay.phase === 'drive') {
      this.nextSurface = 6 + Math.random() * 4
      const side = Math.random() < 0.5 ? -1 : 1
      const ahead = 6 + Math.abs(d.speed) * 0.6
      this.surface = { t: 0, x: d.x + Math.sin(d.heading) * ahead + Math.cos(d.heading) * side * 5, z: d.z + Math.cos(d.heading) * ahead - Math.sin(d.heading) * side * 5, h: d.heading }
    }
    const s = this.surface
    if (!s) return
    s.t += dt / 2.4
    const k = Math.min(1, s.t)
    p.root.visible = true
    // Swimming along with the boat (a little faster), arcing up out of the water and back.
    const along = k * 5
    p.root.position.set(s.x + Math.sin(s.h) * along, -0.9 + bell(k) * 1.25, s.z + Math.cos(s.h) * along)
    p.root.rotation.set(-(k - 0.5) * 1.1, s.h, 0)
    if (k > 0.35 && k - dt / 2.4 <= 0.35) {
      sfx.blow()
      bay.spray.burst(p.root.position.x, p.root.position.y + 0.6, p.root.position.z, 8, 0.6, 3, 0.12)
      if (Math.hypot(p.root.position.x - d.x, p.root.position.z - d.z) < 16) bay.found('porpoise', p.root.position)
    }
    if (k >= 1) {
      this.surface = null
      p.root.visible = false
    }
    void t
  }

  sectionNow(): BoatSection | null {
    return this.active && this.bay.using === 'longtail' ? 'sunset' : null
  }

  /** On the pier: the family on the boards, the pink sky over the shore behind them. */
  shot(): Shot | null {
    if (!this.active || (this.bay.phase !== 'docked' && !this.docked)) return null
    return { center: new Vector3(PIER.x + 0.6, 1.8, MOORED.z - 2.4), half: new Vector3(3.2, 1.8, 2), yaw: this.bay.unwrap(180), pitch: 10, minDist: 6, maxDist: 30 }
  }

  hint(): Vector3 | null {
    return this.active && this.bay.phase === 'drive' && this.bay.using === 'longtail' ? new Vector3(PIER_GLOW.x, 1, PIER_GLOW.z) : null
  }
  stuckLine() {
    return this.active && this.bay.phase === 'drive' ? L.bay.hint.pier : null
  }
}
