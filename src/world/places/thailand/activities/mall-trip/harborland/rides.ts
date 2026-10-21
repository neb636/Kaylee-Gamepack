// How Kaylee climbs and rides in HarborLand (the links of trip/walk.ts, played out):
//   hops    a run of little jumps (the Golden Mountain's tiers, the perch's steps, over the pool's rim)
//   net     hand over hand up (or down) a climbing net, facing it, then a hop over the edge
//   slide   hop onto the mouth, sit, a squash of anticipation, then whoosh down the trough (speed from the slope),
//           her mane in the wind, and shoot out into the balls (or onto a mat). The roller slide rattles her,
//           the dragon's spiral turns the camera with her.
//   donut   into the ring at the half-pipe's lip; it swings down, up the far wall, back, smaller each time, then
//           she hops out at the bottom (and the ring glides back up to the lip)
//   zip     she grabs the handle and whooshes down the sagging cable, swinging, then lets go onto the mat
import { Vector3, type Curve } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { sfx } from '../../../sfx'
import type { Built } from './build'
import { DONUT, ZIP } from './layout'

export type RideKind = 'hops' | 'net' | 'slide' | 'donut' | 'zip'

export interface SlideOpts {
  /** Top speed (m/s) and how fast she gets there. */
  max: number
  accel: number
  /** The roller slide: bumpy all the way down. */
  rattle?: boolean
  /** Where she lands after shooting out, and whether it's into the balls. */
  land: Vector3
  balls?: boolean
}

interface Active {
  kind: RideKind
  /** 0..1 along it (slides, the zip). */
  u: number
  /** The slide or zip's speed (m/s). */
  v: number
  /** Seconds into it. */
  t: number
  phase: 'mount' | 'ready' | 'go' | 'out'
  curve?: Curve<Vector3>
  opts?: SlideOpts
  done: () => void
  /** The donut: angle and its speed. */
  th?: number
  om?: number
  /** Climbing a net: which hand reaches next. */
  hand?: number
}

const deg = 180 / Math.PI
const tmp = new Vector3()

export class Rides {
  active: Active | null = null
  /** The donut's ring: 1 = parked at the lip, gliding back up after a ride. */
  private ringBack = 1
  private ringTh: number = DONUT.from
  /** The zip's handle: where it is on the cable (gliding home after a ride). */
  private zipU = 0
  private lastRattle = 0

  constructor(
    private k: Avatar,
    private built: Built,
    private fx: {
      /** She's in the balls with a splash (`power` 1 a landing, 1.6 a big one). */
      splash(x: number, z: number, power: number): void
      /** Where she is mid-ride (the Phi Ta Khon masks watch her go by). */
      passing?(p: Vector3): void
    },
  ) {
    this.placeRing(DONUT.from)
    this.placeHandle(0)
  }

  get kind() {
    return this.active?.kind ?? null
  }
  /** The slide's speed now (m/s), for the camera and the wind. */
  get speed() {
    return this.active?.v ?? 0
  }

  // ---------------------------------------------------------------- starting one

  /** Little jumps from point to point (local hops: dur and arc per jump). */
  hops(points: Vector3[], done: () => void, dur = 0.36, arc = 0.32) {
    this.active = { kind: 'hops', u: 0, v: 0, t: 0, phase: 'go', done }
    const go = (i: number) => {
      if (i >= points.length) return this.finish()
      sfx.boing()
      this.k.hopTo(points[i], dur, arc, () => {
        sfx.thump()
        go(i + 1)
      })
    }
    go(0)
  }

  /** Up (or down) a net on a face at depth `face`, from `low` (standing on the floor below) to `high` (on the deck). */
  net(low: Vector3, high: Vector3, face: number, up: boolean, done: () => void) {
    this.active = { kind: 'net', u: 0, v: 0, t: 0, phase: 'go', done, hand: 0 }
    const x = low.x
    const hang = face + 0.24
    const steps: Vector3[] = []
    const bottom = low.y + 0.08
    const top = high.y - 0.82
    const n = Math.max(3, Math.round((top - bottom) / 0.5))
    // (Each a hair closer to the net, so she faces it the whole way.)
    for (let i = 0; i <= n; i++) steps.push(new Vector3(x, bottom + ((top - bottom) * i) / n, hang + 0.012 * (n - i)))
    const path = up ? [...steps, high] : [new Vector3(x, top + 0.1, hang - 0.02), ...steps.reverse().slice(1), low]
    const go = (i: number) => {
      if (i >= path.length) return this.finish()
      const last = i === path.length - 1
      const a = this.active
      if (a) a.hand = (a.hand ?? 0) + 1
      if (last) sfx.boing()
      else sfx.fwip()
      this.k.hopTo(path[i], last ? 0.4 : 0.3, last ? 0.35 : 0.06, () => {
        if (last) sfx.thump()
        go(i + 1)
      })
    }
    go(0)
  }

  /** Down a slide: hop onto its mouth, sit, whoosh down, shoot out. */
  slide(curve: Curve<Vector3>, opts: SlideOpts, done: () => void) {
    this.active = { kind: 'slide', u: 0, v: 0, t: 0, phase: 'mount', curve, opts, done }
    const start = curve.getPointAt(0)
    sfx.boing()
    this.k.hopTo(start.clone().setY(start.y + 0.1), 0.35, 0.3, () => {
      const a = this.active
      if (!a || a.curve !== curve) return
      a.phase = 'ready'
      a.t = 0
      this.k.setPose('sit')
    })
  }

  /** Into the donut's ring at the lip, and swing. */
  donut(done: () => void) {
    this.active = { kind: 'donut', u: 0, v: 0, t: 0, phase: 'mount', done, th: DONUT.from, om: 0 }
    this.ringBack = 1
    this.placeRing(DONUT.from)
    sfx.boing()
    this.k.hopTo(this.built.ring.position.clone().setY(this.built.ring.position.y + 0.12), 0.4, 0.4, () => {
      const a = this.active
      if (!a || a.kind !== 'donut') return
      a.phase = 'ready'
      a.t = 0
      this.k.setPose('sit')
    })
  }

  /** Grab the zip line's handle and go. */
  zip(done: () => void) {
    this.active = { kind: 'zip', u: 0, v: 0, t: 0, phase: 'mount', done }
    this.zipU = 0
    this.placeHandle(0)
    const [ax, ay, az] = ZIP.a
    sfx.boing()
    this.k.hopTo(new Vector3(ax, ay - ZIP.hang, az), 0.35, 0.35, () => {
      const a = this.active
      if (!a || a.kind !== 'zip') return
      a.phase = 'ready'
      a.t = 0
    })
  }

  private finish() {
    const a = this.active
    this.active = null
    const k = this.k
    k.root.rotation.z = 0
    k.rig.armL.rotation.z = 0
    k.rig.armR.rotation.z = 0
    k.setWind(0)
    a?.done()
  }

  // ---------------------------------------------------------------- per frame (after Kaylee's own update)

  update(dt: number, t: number) {
    this.updateIdle(dt)
    const a = this.active
    if (!a) return
    a.t += dt
    const k = this.k
    if (a.kind === 'net') {
      // Hand over hand: one arm reaches up, then the other.
      const up = (a.hand ?? 0) % 2
      k.rig.armL.rotation.z = -(up ? 2.7 : 2.0)
      k.rig.armR.rotation.z = up ? 2.0 : 2.7
    } else if (a.kind === 'slide') this.stepSlide(a, dt, t)
    else if (a.kind === 'donut') this.stepDonut(a, dt)
    else if (a.kind === 'zip') this.stepZip(a, dt, t)
  }

  private stepSlide(a: Active, dt: number, t: number) {
    const k = this.k
    const curve = a.curve!
    const o = a.opts!
    if (a.phase === 'ready') {
      // A squash before she goes (anticipation), arms up.
      k.rig.body.scale.y *= 1 - 0.12 * Math.sin(Math.min(1, a.t / 0.3) * Math.PI)
      k.rig.armL.rotation.z = -2.2
      k.rig.armR.rotation.z = 2.2
      if (a.t > 0.3) {
        a.phase = 'go'
        a.v = 1.2
        sfx.whoosh(o.rattle ? 2 : 1)
      }
      return
    }
    if (a.phase !== 'go') return
    const len = curve.getLength()
    const tan = curve.getTangentAt(clamp(a.u))
    a.v = Math.min(o.max, a.v + (o.accel + 9 * Math.max(0, -tan.y)) * dt)
    a.u = Math.min(1, a.u + (a.v * dt) / len)
    const p = curve.getPointAt(a.u)
    const tn = curve.getTangentAt(a.u)
    let jitter = 0
    if (o.rattle) {
      jitter = Math.abs(Math.sin(t * 46)) * 0.035
      if (t - this.lastRattle > 0.09) {
        this.lastRattle = t
        sfx.roll()
      }
    }
    k.place(p.x, p.y + 0.1 + jitter, p.z, Math.atan2(tn.x, tn.z) * deg)
    k.setPose('sit')
    k.setWind(clamp(a.v / o.max))
    // Leaning back, arms up: wheee.
    k.rig.body.rotation.x = -0.28
    k.rig.armL.rotation.z = -2.5
    k.rig.armR.rotation.z = 2.5
    if (o.rattle) k.rig.body.rotation.z = Math.sin(t * 40) * 0.05
    this.fx.passing?.(p)
    if (a.u >= 1) {
      a.phase = 'out'
      k.setPose('stand')
      k.rig.armL.rotation.z = 0
      k.rig.armR.rotation.z = 0
      k.hopTo(o.land, 0.42, o.balls ? 0.45 : 0.3, () => {
        if (o.balls) this.fx.splash(o.land.x, o.land.z, 1.3)
        else sfx.thump()
        this.finish()
      })
    }
  }

  private stepDonut(a: Active, dt: number) {
    const k = this.k
    if (a.phase === 'ready') {
      if (a.t > 0.35) {
        a.phase = 'go'
        sfx.whoosh(1.2)
      }
    } else if (a.phase === 'go') {
      // A pendulum on the half-pipe's arc, losing a little each swing.
      const g = 9.8 / DONUT.r
      for (let i = 0; i < 4; i++) {
        const h = dt / 4
        a.om! += (-g * Math.sin(a.th!) - 0.85 * a.om!) * h
        a.th! += a.om! * h
      }
      // A whoosh at the bottom of each swing.
      if (Math.abs(a.th!) < 0.08 && Math.abs(a.om!) > 0.8 && a.t - (a.u || 0) > 0.4) {
        a.u = a.t
        sfx.whoosh(0.5)
      }
      if ((a.t > 2.5 && Math.abs(a.th!) < 0.12 && Math.abs(a.om!) < 0.35) || (a.t > 6 && Math.abs(a.th!) < 0.3)) {
        a.phase = 'out'
        k.root.rotation.z = 0
        k.setPose('stand')
        this.ringBack = 0
        const [x, z] = [DONUT.x, DONUT.z + 1.2]
        k.hopTo(new Vector3(x, 0, z), 0.45, 0.35, () => {
          sfx.thump()
          this.finish()
        })
        return
      }
    } else return
    this.placeRing(a.th!)
    const r = this.built.ring.position
    k.place(r.x, r.y + 0.12, r.z, 0)
    k.setPose('sit')
    k.root.rotation.z = a.th!
    k.setWind(clamp(Math.abs(a.om!) / 3))
    const arms = clamp(Math.abs(a.om!) / 2.5)
    k.rig.armL.rotation.z = -2.4 * arms
    k.rig.armR.rotation.z = 2.4 * arms
  }

  private stepZip(a: Active, dt: number, t: number) {
    const k = this.k
    k.rig.armL.rotation.z = -2.9
    k.rig.armR.rotation.z = 2.9
    if (a.phase === 'ready') {
      if (a.t > 0.25) {
        a.phase = 'go'
        a.v = 0.8
        sfx.whoosh(1.4)
      }
    } else if (a.phase === 'go') {
      const [ax, ay] = ZIP.a
      const [bx, by] = ZIP.b
      const slope = (ay - by) / (bx - ax)
      a.v = Math.min(5.5, a.v + (1.6 + 7 * slope) * dt)
      a.u = Math.min(1, a.u + (a.v * dt) / (bx - ax))
      this.zipU = a.u
      this.placeHandle(a.u)
      if (a.u >= 1) {
        a.phase = 'out'
        k.root.rotation.z = 0
        k.rig.armL.rotation.z = 0
        k.rig.armR.rotation.z = 0
        k.hopTo(new Vector3(ZIP.mat[0], 0, ZIP.mat[1]), 0.45, 0.25, () => {
          sfx.thump()
          this.finish()
        })
        return
      }
    } else return
    const h = this.built.handle.position
    k.place(h.x, h.y - ZIP.hang, h.z, 90)
    // She swings back as she speeds up, and her legs kick.
    k.root.rotation.z = a.phase === 'go' ? 0.12 + Math.sin(t * 5) * 0.06 : 0
    k.setWind(clamp(a.v / 5.5))
  }

  /** The ring glides back up to the lip, and the zip's handle back home, after a ride. */
  private updateIdle(dt: number) {
    if (this.active?.kind !== 'donut' && this.ringBack < 1) {
      this.ringBack = Math.min(1, this.ringBack + dt / 1.6)
      const e = 1 - (1 - this.ringBack) ** 2
      this.placeRing(this.ringTh + (DONUT.from - this.ringTh) * e)
      if (this.ringBack >= 1) this.ringTh = DONUT.from
    }
    if (this.active?.kind !== 'zip' && this.zipU > 0) {
      this.zipU = Math.max(0, this.zipU - dt / 2.2)
      this.placeHandle(this.zipU)
    }
  }

  private placeRing(th: number) {
    const D = DONUT
    const r = D.r - 0.2
    const ring = this.built.ring
    ring.position.set(D.x + Math.sin(th) * r, D.bottom + D.r - Math.cos(th) * r, D.z)
    ring.rotation.z = th
    if (this.active?.kind === 'donut') this.ringTh = th
  }

  private placeHandle(u: number) {
    const [ax, ay, az] = ZIP.a
    const [bx, by, bz] = ZIP.b
    this.built.handle.position.copy(tmp.set(ax + (bx - ax) * u, ay + (by - ay) * u - ZIP.sag * Math.sin(Math.PI * u), az + (bz - az) * u))
  }
}
