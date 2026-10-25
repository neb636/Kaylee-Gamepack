// The rental desk at Nan airport (section `rental`, plan: thailand/nan-trip.md, "The rental desk", build step 6: the
// greybox): one short beat, not a full activity. Shapes and sounds, no voices yet.
//
// key: the clerk slides the key fob across the counter and it hops into Kaylee's hoof. The toy: press it (a tap on the
//   fob, or on the Pajero) and the big silver Pajero outside answers, chirp chirp, its lights winking. The first press
//   folds its mirrors out, the second makes Daddy jump, the third pops the tailgate up, and everyone heads out to it.
//   (She can keep pressing all the way: it always answers.)
// boot: her pink suitcase, Mommy's bag and Daddy's backpack wait behind the car. Grab one and put it in the boot (or tap
//   it): it thumps in and the car squats on its springs. Let go of one anywhere else and it hops back. All three in,
//   the tailgate comes down.
// belt: Kaylee's door swings open, she hops into her seat behind Mommy (Mommy at the wheel on the right: in Thailand
//   cars keep left), Daddy beside Mommy. Tap the seatbelt: click! The door shuts, the engine starts and off they go
//   (the car waits for the click: buckle up first).
// Things to poke: the clerk (she laughs), the bell on the counter (ding, and the clerk hops), the orchids, the rack of
// maps (one flaps out), the poster of a mountain (it rains a little), Mommy, Daddy, Kaylee, the Pajero.
import { Color, CylinderGeometry, IcosahedronGeometry, Mesh, OctahedronGeometry, Plane, Vector3, type Group, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import type { Avatar } from '../../../characters/avatar'
import { FaceLife } from '../../../characters/face'
import type { Member } from '../../../characters/member'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { PAL, toon } from '../../../engine/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { buildPajero, type Pajero } from '../../../trip/vehicles/pajero'
import { Floaters } from '../mushrooms/fx'
import { buildDesk, type Desk } from './desk'
import { AT, BAGS, BOOT_REACH, CAR_AT, CAR_YAW, CLERK_AT, COUNTER, EXIT_X, FOB_DESK, POSTER, PRESSES, type Round } from './layout'
import { rentalSfx as sfx } from './sounds'

export interface RentalEvents extends LegEvents {
  /** A new beat began (the address bar follows). */
  round(r: Round): void
  /** Buckled up and off down the road: the Nan map. */
  allDone(): void
}

export const RENTAL_ANCHORS: AnchorInfo[] = [
  { id: 'fob', label: 'Key fob', kind: 'thing' },
  { id: 'car', label: 'The Pajero', kind: 'thing' },
  ...BAGS.map((_, i): AnchorInfo => ({ id: `bag:${i}`, label: ["Kaylee's suitcase", "Mommy's bag", "Daddy's backpack"][i], kind: 'thing' })),
  { id: 'belt', label: 'Seatbelt', kind: 'thing' },
  { id: 'clerk', label: 'Rental clerk', kind: 'thing' },
  { id: 'bell', label: 'Bell', kind: 'thing' },
  { id: 'orchids', label: 'Orchids', kind: 'thing' },
  { id: 'maps', label: 'Maps', kind: 'thing' },
  { id: 'poster', label: 'Mountain poster', kind: 'thing' },
  ...(['kaylee', 'nick', 'ji'] as const).map((e): AnchorInfo => ({ id: `family:${e}`, label: { kaylee: 'Kaylee', nick: 'Daddy', ji: 'Mommy' }[e], kind: 'family' })),
]

/** Nothing touched for this long: what to do next glows. */
const STUCK_S = 4
const LIFT_PX = 26
const up = new Vector3(0, 1, 0)
const tmp = new Vector3()
const tmp2 = new Vector3()

interface Fly {
  o: Object3D
  from: Vector3
  to: () => Vector3
  t: number
  dur: number
  arc: number
  done: () => void
}

export class RentalDesk extends Stage {
  private desk: Desk
  private car: Pajero
  private kaylee: Avatar
  private nick: Member
  private ji: Member
  private clerkLife: FaceLife
  private round: Round
  private later: { t: number; f: () => void }[] = []
  private flights: Fly[] = []
  private cool = new Map<string, number>()
  private pokeT = new Map<string, number>()
  // ---- The key fob ----
  private fobState: 'desk' | 'hand' = 'desk'
  private presses = 0
  private flash = 0
  private mirrorK = 0
  private gateK = 0
  private gateGoal = 0
  private doorK = 0
  private doorGoal = 0
  private carHop = 1
  // ---- The bags ----
  private bagIn = [false, false, false]
  private bagHeld = -1
  private bagMoved = false
  private bagDown = { x: 0, y: 0 }
  private finger = { x: 0, y: 0 }
  private squash = { x: 0, v: 0 }
  private gateShut = false
  // ---- The seatbelt, and off ----
  private belt: Mesh
  private beltK = 0
  private buckled = false
  private seated = false
  private speed = 0
  private gone = false
  private counted = false
  private sparkles: Floaters
  private drops: Floaters

  constructor(renderer: WebGLRenderer, private ev: RentalEvents, start: { round: Round }) {
    super(renderer, ev)
    const { scene, bag } = this
    scene.background = new Color('#DCEBF8')
    this.rig.fov = 32
    this.rig.lag = 0.6
    this.desk = buildDesk(bag)
    scene.add(this.desk.root)
    this.clerkLife = new FaceLife(this.desk.clerk)
    this.car = buildPajero(bag)
    this.car.root.position.set(...CAR_AT)
    this.car.root.rotation.y = CAR_YAW
    scene.add(this.car.root)
    // Kaylee's seatbelt: a strap from over her shoulder (by the door) to the buckle by her hip, hanging by the door
    // until she clicks it.
    this.belt = new Mesh(bag.add(new CylinderGeometry(0.025, 0.025, 1, 6).translate(0, 0.5, 0)), toon('#4A4458'))
    this.car.body.add(this.belt)
    const { kaylee, members } = this.makeFamily(['ji', 'nick'])
    this.kaylee = kaylee
    this.nick = members.get('nick')!
    this.ji = members.get('ji')!
    for (const c of [kaylee, this.nick, this.ji]) scene.add(c.root)
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 120, bag, 1.0, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF'], 60, bag, 5, 0.2)
    scene.add(this.sparkles.mesh, this.drops.mesh)
    // ---- Where the link starts ----
    this.round = start.round
    for (const [i, b] of this.desk.bags.entries()) {
      b.position.set(...BAGS[i])
      b.rotation.y = -0.6 + i * 0.4
    }
    this.car.setMirrors(0)
    if (start.round === 'key') {
      this.put(kaylee, ...AT.key.kaylee, 'stand', -60)
      this.put(this.ji, ...AT.key.ji, 'stand', 20)
      this.put(this.nick, ...AT.key.nick, 'stand', -20)
      this.desk.fob.position.set(CLERK_AT[0], COUNTER.h + 0.03, COUNTER.z - 0.15)
      this.after(0.6, () => this.slideFob())
    } else {
      this.fobToHand()
      this.presses = PRESSES
      this.mirrorK = 1
      if (start.round === 'boot') {
        this.gateK = this.gateGoal = 1
        this.put(kaylee, ...AT.boot.kaylee, 'stand', -90)
        this.put(this.ji, ...AT.boot.ji, 'stand', -120)
        this.put(this.nick, ...AT.boot.nick, 'stand', -60)
      } else {
        for (const [i, b] of this.desk.bags.entries()) this.stow(b, i, true)
        this.gateShut = true
        this.put(kaylee, ...AT.belt.kaylee, 'stand', 160)
        this.seatGrownUps(true)
        this.after(0.4, () => this.openDoor())
      }
    }
    this.placeBelt()
  }

  // ---------------------------------------------------------------- the key fob

  /** The clerk slides the fob across the counter, then it hops into Kaylee's hoof. */
  private slideFob() {
    const f = this.desk.fob
    sfx.fwip()
    this.flights.push({
      o: f,
      from: f.position.clone(),
      to: () => new Vector3(...FOB_DESK),
      t: 0,
      dur: 0.6,
      arc: 0,
      done: () => {
        sfx.ding()
        this.after(0.35, () => {
          this.kaylee.react('hop')
          this.fobToHand()
        })
      },
    })
  }

  private fobToHand() {
    const f = this.desk.fob
    const r = this.kaylee.rig
    const hand = r.hands?.[1]
    if (hand) f.position.set(0, 0.02, 0.04)
    else f.position.set(0.06, -0.19, 0.06)
    f.rotation.set(-0.3, 0, 0)
    ;(hand ?? r.armR).add(f)
    this.fobState = 'hand'
    sfx.pop()
  }

  /** Press! The Pajero answers: chirp chirp, its lights wink. Then, press by press, the mirrors fold out, Daddy jumps,
   *  the tailgate pops up and everyone heads out to the car. */
  private press() {
    if (this.fobState !== 'hand') return
    sfx.press()
    sfx.carChirp()
    this.flash = 0.7
    this.carHop = 0
    this.pokeT.set('fob', this.time)
    const p = this.car.root.position
    this.sparkles.burst(tmp.set(p.x, 1.4, p.z), 8, 1.2, 1.2, 0.6, 0.04)
    if (this.round !== 'key') return
    this.presses++
    if (this.presses === 1) this.after(0.25, () => sfx.mirrors())
    if (this.presses === 2) this.after(0.3, () => {
      this.nick.react('hop')
      sfx.haha()
    })
    if (this.presses === PRESSES) {
      this.after(0.35, () => {
        this.gateGoal = 1
        sfx.tailgate()
      })
      this.after(1.3, () => this.startBoot())
    }
  }

  // ---------------------------------------------------------------- the bags

  private startBoot() {
    if (this.round !== 'key') return
    this.round = 'boot'
    this.ev.round('boot')
    this.kaylee.walk([[0.6, -0.4], [AT.boot.kaylee[0], AT.boot.kaylee[2]]])
    this.hop(this.ji, this.scene, new Vector3(...AT.boot.ji), { face: -120, dur: 0.9, arc: 0.5, delay: 0.2 })
    this.hop(this.nick, this.scene, new Vector3(...AT.boot.nick), { face: -60, dur: 0.9, arc: 0.5, delay: 0.5 })
  }

  /** Where the open boot is (world): bags let go near it go in. */
  private bootMouth() {
    return this.car.body.localToWorld(tmp2.set(0, 1.15, -2.6))
  }

  /** A bag into the boot, flying from wherever it is (or put there at once). */
  private stow(b: Group, i: number, now = false) {
    this.bagIn[i] = true
    const slot = new Vector3(...this.car.boot[i])
    if (now) {
      this.car.body.add(b)
      b.position.copy(slot)
      b.rotation.set(0, Math.PI / 2, 0)
      return
    }
    this.scene.attach(b)
    this.flights.push({
      o: b,
      from: b.position.clone(),
      to: () => this.car.body.localToWorld(slot.clone()),
      t: 0,
      dur: 0.5,
      arc: 0.5,
      done: () => {
        this.car.body.attach(b)
        b.position.copy(slot)
        b.rotation.set(0, Math.PI / 2, 0)
        this.squash.v -= 1.6
        sfx.bagIn(this.bagIn.filter(Boolean).length)
        this.sparkles.burst(this.car.body.localToWorld(slot.clone()).setY(1.3), 10, 0.8, 1, 0.6, 0.035)
        if (this.bagIn.every(Boolean)) this.after(0.5, () => this.closeGate())
      },
    })
  }

  /** A bag let go away from the boot hops back down where it was. */
  private bagBack(i: number) {
    const b = this.desk.bags[i]
    this.flights.push({
      o: b,
      from: b.position.clone(),
      to: () => new Vector3(...BAGS[i]),
      t: 0,
      dur: 0.45,
      arc: 0.3,
      done: () => sfx.thump(),
    })
  }

  private closeGate() {
    if (this.gateShut) return
    this.gateShut = true
    this.gateGoal = 0
    this.after(0.45, () => {
      sfx.tailgate(true)
      this.after(0.6, () => this.startBelt())
    })
  }

  // ---------------------------------------------------------------- into her seat, the belt, off

  private startBelt() {
    if (this.round !== 'boot') return
    this.round = 'belt'
    this.ev.round('belt')
    this.kaylee.walk([[2.6, -0.2], [AT.belt.kaylee[0], AT.belt.kaylee[2]]], () => this.openDoor())
    this.seatGrownUps(false)
  }

  /** Mommy into the driver's seat (on the right), Daddy beside her. */
  private seatGrownUps(now: boolean) {
    const c = this.car.seats
    for (const [m, seat, delay] of [[this.ji, c.driver, 0.3], [this.nick, c.nick, 0.7]] as const) {
      if (now) {
        seat.add(m.root)
        this.put(m, 0, 0, 0, 'sit', 0)
      } else this.hop(m, seat, new Vector3(0, 0, 0), { pose: 'sit', face: 0, dur: 0.8, arc: 0.9, delay })
    }
  }

  private openDoor() {
    this.doorGoal = 1
    sfx.latch()
    this.after(0.6, () => {
      this.hop(this.kaylee, this.car.seats.kaylee, new Vector3(0, 0, 0), {
        pose: 'sit',
        face: 0,
        dur: 0.55,
        arc: 0.5,
        done: () => {
          this.seated = true
          this.lastTouch = this.time - STUCK_S + 1.2
        },
      })
    })
  }

  private buckle() {
    if (!this.seated || this.buckled) return
    this.buckled = true
    this.after(0.32, () => {
      sfx.click()
      this.kaylee.react('wiggle')
      this.sparkles.burst(this.car.body.localToWorld(new Vector3(...this.car.belt.to)), 14, 0.8, 1, 0.6, 0.03)
    })
    this.after(0.9, () => {
      this.doorGoal = 0
    })
    this.after(1.35, () => sfx.door())
    this.after(1.9, () => {
      sfx.vroom()
      this.ji.react('wave')
    })
    this.after(2.6, () => (this.speed = 0.01))
  }

  private placeBelt() {
    const { from, to } = this.car.belt
    const a = new Vector3(...from)
    const hang = new Vector3(from[0], 1.02, from[2] + 0.02)
    const b = hang.lerp(new Vector3(...to), this.beltK)
    const d = b.sub(a)
    this.belt.position.copy(a)
    this.belt.scale.set(1, Math.max(0.001, d.length()), 1)
    this.belt.quaternion.setFromUnitVectors(up, d.normalize())
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    for (const f of [...this.flights]) {
      f.t += dt / f.dur
      const k = Math.min(1, f.t)
      const e = k * k * (3 - 2 * k)
      f.o.position.lerpVectors(f.from, f.to(), e).y += bell(k) * f.arc
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.done()
      }
    }
    // ---- A bag in her finger: it follows, a little above it ----
    if (this.bagHeld >= 0 && this.bagMoved) {
      const p = this.onPlane(this.finger.x, this.finger.y - LIFT_PX)
      if (p) this.desk.bags[this.bagHeld].position.lerp(p.setY(Math.max(0.05, p.y)), Math.min(1, dt * 18))
    }
    // ---- The car: its lights wink, mirrors, tailgate and door move, it squats under the bags, hops at a beep ----
    const c = this.car
    this.flash = Math.max(0, this.flash - dt)
    const on = this.flash > 0 && Math.sin(this.flash * 26) > 0
    c.lamps.color.set(on ? '#FFFFFF' : '#E6E2EE')
    c.tails.color.set(on ? '#FFC83D' : '#FF5C7A')
    if (this.presses > 0) this.mirrorK = Math.min(1, this.mirrorK + dt * 2)
    c.setMirrors(this.mirrorK)
    this.gateK += (this.gateGoal - this.gateK) * Math.min(1, dt * 5)
    c.setTailgate(this.gateK)
    this.doorK += (this.doorGoal - this.doorK) * Math.min(1, dt * 6)
    c.setDoor(this.doorK)
    this.squash.v += (-this.squash.x * 160 - this.squash.v * 9) * dt
    this.squash.x += this.squash.v * dt
    this.carHop = Math.min(1, this.carHop + dt / 0.35)
    const weight = this.bagIn.filter(Boolean).length * 0.012
    c.body.position.y = this.squash.x * 0.05 - weight + bell(this.carHop) * 0.06
    if (this.buckled) this.beltK = Math.min(1, this.beltK + dt / 0.3)
    this.placeBelt()
    // ---- Off they go: along the car park and out onto the road ----
    if (this.speed > 0) {
      this.speed = Math.min(7, this.speed + dt * 3.2)
      c.root.position.x += this.speed * dt
      for (const w of c.wheels) w.rotation.x += (this.speed * dt) / 0.45
      c.body.position.y += Math.abs(Math.sin(t * 12)) * 0.02
      if (c.root.position.x > EXIT_X && !this.gone) {
        this.gone = true
        this.ev.allDone()
      }
    }
    // ---- The clerk, the bell, the orchids, the maps, the poster ----
    const k = (id: string, dur: number) => clamp((this.time - (this.pokeT.get(id) ?? -9)) / dur, 0, 1)
    const d = this.desk
    const ck = bell(k('clerk', 0.5))
    d.clerk.root.position.y = CLERK_AT[1] + ck * 0.15
    d.clerk.root.scale.set(1 + 0.05 * ck, 1 - 0.04 * ck, 1 + 0.05 * ck)
    const kp = this.kaylee.root.getWorldPosition(tmp)
    d.clerk.root.rotation.y = Math.atan2(kp.x - CLERK_AT[0], kp.z - CLERK_AT[2]) * 0.6
    this.clerkLife.update(dt)
    const bk = bell(k('bell', 0.3))
    d.bell.scale.set(1 + 0.15 * bk, 1 - 0.25 * bk, 1 + 0.15 * bk)
    const ok = k('orchids', 0.9)
    d.orchids.rotation.z = Math.sin(ok * Math.PI * 4) * 0.15 * (1 - ok)
    const mk = k('maps', 1.2)
    d.map.rotation.x = bell(mk) * 1.3
    const pk = k('poster', 1.8)
    if (pk < 1 && Math.random() < dt * 30) this.drops.emit(tmp.set(POSTER.at[0] + (Math.random() - 0.5) * POSTER.w * 0.8, POSTER.at[1] + 0.3, POSTER.at[2] + 0.12), tmp2.set(0, -0.4, 0.15), 0.6, 0.025)
    const fk = bell(k('fob', 0.25))
    d.fob.scale.setScalar(1 + fk * 0.3)
    // ---- The family: everyone looks at what's happening; her arm up, the fob pointed at the car ----
    for (const ch of [this.kaylee, this.nick, this.ji]) ch.update(dt, t)
    const look = this.round === 'key' ? (this.fobState === 'hand' ? c.root.position.clone().setY(1.3) : d.fob.position.clone()) : this.round === 'boot' ? (this.bagHeld >= 0 ? d.bags[this.bagHeld].position.clone() : this.bootMouth().clone()) : c.body.localToWorld(new Vector3(...c.belt.to))
    this.kaylee.lookAt(look.x, look.y, look.z)
    this.nick.lookAt(look.x, look.y, look.z)
    this.ji.lookAt(look.x, look.y, look.z)
    if (this.round === 'key' && !this.kaylee.walking && !this.hopping) this.kaylee.faceToward(kp.x + 1, kp.z + 1.3)
    if (this.round === 'key' && this.fobState === 'hand') this.kaylee.rig.armR.rotation.set(-1.25 - fk * 0.3, 0, -0.15)
    for (const f of [this.sparkles, this.drops]) f.update(dt)
  }

  // ---------------------------------------------------------------- helpers

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }
  private talkTo(key: string, f: () => void, every = 1) {
    if (this.time - (this.cool.get(key) ?? -99) < every) return
    this.cool.set(key, this.time)
    f()
  }
  /** Where a screen point meets the upright plane through the boot that faces the camera. */
  private onPlane(x: number, y: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near).normalize()
    const fwd = cam.getWorldDirection(new Vector3()).setY(0).normalize()
    const mouth = this.bootMouth().clone()
    // Halfway between the bags and the boot.
    const through = mouth.addScaledVector(fwd, -0.9)
    const plane = new Plane().setFromNormalAndCoplanarPoint(fwd.negate(), through)
    const denom = plane.normal.dot(dir)
    if (Math.abs(denom) < 1e-6) return null
    const t = -(plane.normal.dot(near) + plane.constant) / denom
    return t > 0 ? near.addScaledVector(dir, t) : null
  }

  // ---------------------------------------------------------------- touch

  tap(x: number, y: number, id?: string) {
    if (this.counted) this.touches--
    this.counted = false
    super.tap(x, y, id)
  }

  pointerDown(x?: number, y?: number, id?: string) {
    super.pointerDown()
    this.counted = false
    if (x === undefined || y === undefined) return
    this.finger = { x, y }
    if (this.round === 'boot' && id?.startsWith('bag:')) {
      const i = Number(id.slice(4))
      if (this.bagIn[i] || this.flights.some((f) => f.o === this.desk.bags[i])) return
      this.bagHeld = i
      this.bagMoved = false
      this.bagDown = { x, y }
    }
  }

  pointerMove(x: number, y: number, _dx: number, _dy: number, isHeld: boolean) {
    if (!isHeld) return
    this.finger = { x, y }
    if (this.bagHeld >= 0) {
      this.lastTouch = this.time
      if (!this.bagMoved && Math.hypot(x - this.bagDown.x, y - this.bagDown.y) > 10) {
        this.bagMoved = true
        this.touches++
        this.counted = true
        sfx.fwip()
      }
    }
  }

  pointerUp() {
    const i = this.bagHeld
    this.bagHeld = -1
    if (i < 0 || !this.bagMoved) return
    const b = this.desk.bags[i]
    // Near the open boot: in it goes. Anywhere else: back down where it was.
    const m = this.bootMouth()
    if (Math.hypot(b.position.x - m.x, b.position.z - m.z) < BOOT_REACH + 0.6 && b.position.distanceTo(m) < BOOT_REACH + 0.4) this.stow(b, i)
    else this.bagBack(i)
  }

  protected onTap(id: string | null) {
    if (!id) return
    if (id.startsWith('bag:')) {
      const i = Number(id.slice(4))
      if (this.round === 'boot' && !this.bagIn[i] && !this.flights.some((f) => f.o === this.desk.bags[i])) this.stow(this.desk.bags[i], i)
      return
    }
    switch (id) {
      case 'fob':
      case 'car':
        return this.press()
      case 'belt':
        return this.buckle()
      case 'clerk':
        this.pokeT.set('clerk', this.time)
        this.talkTo('clerk', () => sfx.clerk())
        return
      case 'bell':
        this.pokeT.set('bell', this.time)
        sfx.ding()
        this.after(0.2, () => this.pokeT.set('clerk', this.time))
        return
      case 'orchids':
        this.pokeT.set('orchids', this.time)
        sfx.jiggle()
        this.sparkles.burst(this.desk.orchids.position.clone().setY(COUNTER.h + 0.4), 8, 0.4, 0.5, 0.7, 0.03, 1)
        return
      case 'maps':
        this.pokeT.set('maps', this.time)
        sfx.fwip()
        return
      case 'poster':
        this.pokeT.set('poster', this.time)
        sfx.rain()
        return
      case 'family:kaylee':
        this.kaylee.react('wiggle')
        sfx.giggle()
        return
      case 'family:nick':
        this.nick.react('hop')
        sfx.haha()
        return
      case 'family:ji':
        this.ji.react('wave')
        sfx.giggle()
        return
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    const tall = this.w < this.h
    const c = this.car.root.position
    if (this.speed > 0) return { center: c.clone().setY(1.1), half: new Vector3(3.2, 1.3, 1.6), yaw: 0, pitch: 12, minDist: 6 }
    if (this.round === 'belt')
      // At Kaylee's open door: her in her seat, the belt, Mommy at the wheel in front.
      return tall ? { center: new Vector3(3.9, 1.25, -0.9), half: new Vector3(1.0, 0.9, 0.9), yaw: 0, pitch: 12, minDist: 3 } : { center: new Vector3(4.05, 1.25, -0.95), half: new Vector3(1.35, 0.8, 0.9), yaw: 0, pitch: 10, minDist: 3 }
    if (this.round === 'boot')
      // From behind and beside the car: the open boot and the bags waiting.
      return tall ? { center: new Vector3(1.25, 0.85, -1.35), half: new Vector3(1.4, 1.0, 1.3), yaw: -62, pitch: 22, minDist: 3 } : { center: new Vector3(1.3, 0.85, -1.4), half: new Vector3(1.6, 0.85, 1.4), yaw: -62, pitch: 20, minDist: 3 }
    // The counter, Kaylee with the fob, and the Pajero waiting in the car park.
    // (Tall: Kaylee and the end of the counter, the Pajero's back with its winking tail lamps.)
    if (tall) return { center: new Vector3(1.2, 1.05, -1.3), half: new Vector3(2.75, 1.2, 1.3), yaw: 0, pitch: 14, minDist: 4 }
    return { center: new Vector3(1.65, 1.0, -1.35), half: new Vector3(4.55, 0.95, 1.25), yaw: 0, pitch: 12, minDist: 4 }
  }

  /** What the hint finger (and the glow) points at now. */
  private hintTarget(): string | null {
    if (this.speed > 0 || this.flights.length) return null
    if (this.round === 'key') return this.fobState === 'hand' && this.presses < PRESSES ? 'fob' : null
    if (this.round === 'boot') {
      const i = this.bagIn.findIndex((x) => !x)
      return i >= 0 && this.bagHeld < 0 ? `bag:${i}` : null
    }
    return this.seated && !this.buckled ? 'belt' : null
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const glow = this.time - this.lastTouch > STUCK_S && this.hintTarget() === id
    if (id.startsWith('family:')) {
      const ch = id === 'family:kaylee' ? this.kaylee : id === 'family:nick' ? this.nick : this.ji
      const r = ch.rig
      return { at: r.head.localToWorld(new Vector3(0, r.face.headY, 0)), r: r.face.R * 1.1, prio: 0, max: 120 }
    }
    const d = this.desk
    if (id.startsWith('bag:')) {
      const i = Number(id.slice(4))
      if (this.bagIn[i] || this.round === 'key') return null
      return { at: d.bags[i].position.clone().setY(d.bags[i].position.y + 0.22), r: 0.3, prio: 4, max: 140, glow }
    }
    switch (id) {
      case 'fob':
        return this.fobState === 'hand' && this.speed === 0 ? { at: d.fob.getWorldPosition(new Vector3()), r: 0.09, prio: 5, max: 110, glow: glow || (this.round === 'key' && this.presses === 0) } : null
      case 'car':
        return this.round === 'key' ? { at: this.car.root.position.clone().setY(1.4), r: 1.6, prio: 1, max: 220 } : null
      case 'belt':
        return this.seated && !this.buckled ? { at: this.car.body.localToWorld(new Vector3(this.car.belt.from[0] + 0.15, 1.35, this.car.belt.from[2] + 0.1)), r: 0.18, prio: 5, max: 130, glow: glow || this.time - this.lastTouch > 1.5 } : null
      case 'clerk':
        return this.round === 'key' ? { at: d.clerk.root.position.clone().setY(1.0), r: 0.3, prio: 1, max: 130 } : null
      case 'bell':
        return this.round === 'key' ? { at: d.bell.position.clone(), r: 0.1, prio: 3, max: 100 } : null
      case 'orchids':
        return this.round === 'key' ? { at: d.orchids.position.clone().setY(COUNTER.h + 0.28), r: 0.12, prio: 3, max: 100 } : null
      case 'maps':
        return this.round === 'key' ? { at: d.maps.position.clone().setY(0.95), r: 0.3, prio: 2, max: 120 } : null
      case 'poster':
        return this.round === 'key' ? { at: new Vector3(...POSTER.at), r: 0.5, prio: 1, max: 150 } : null
    }
    return null
  }

  protected hintAt() {
    const id = this.hintTarget()
    if (!id) return null
    return this.anchorAt(id)?.at ?? null
  }

  qa() {
    const pt = (v: Vector3) => {
      const c = v.clone().project(this.rig.camera)
      return c.z > 1 ? null : [Math.round(((c.x + 1) / 2) * this.w), Math.round(((1 - c.y) / 2) * this.h)]
    }
    return {
      game: 'rental',
      round: this.round,
      fob: this.fobState,
      presses: this.presses,
      bagsIn: this.bagIn.filter(Boolean).length,
      seated: this.seated,
      buckled: this.buckled,
      driving: this.speed > 0,
      touches: this.touches,
      points: {
        fob: pt(this.desk.fob.getWorldPosition(new Vector3())),
        bags: this.desk.bags.map((b, i) => (this.bagIn[i] ? null : pt(b.position.clone().setY(b.position.y + 0.22)))),
        boot: pt(this.bootMouth().clone()),
        belt: pt(this.car.body.localToWorld(new Vector3(this.car.belt.from[0] + 0.15, 1.35, this.car.belt.from[2] + 0.1))),
      },
    }
  }
}
