// Everything in the Big Frame that reacts to her besides the rides:
//   the cannon     tap it and a ball flies at Daddy (sitting in the ball pit): bonk, he tips back into the balls and pops
//                  up with the ball stuck on his horn; the third hit, he stands up and flops back in, a huge splash
//   the bridge     the net bridge sags under her and bounces when tapped
//   the rope       the rope course's logs swing and knock as she crosses (or when tapped)
//   the mask       the giant mask's eyes follow her; tap it and they roll and it wobbles
//   the nagas      the spiral's two dragon heads watch her, and roar (a friendly one) when tapped
//   the boxer      the Muay Thai boy on his ring watches her; tap him and he punches the air, ding ding
//   the spires     a temple bell and a little bounce
//   Phi Ta Khon    the masks on the roller's posts jangle; when she rattles past, each one turns and sticks its tongue out
import { Group, Vector3, type Object3D } from 'three'
import { bell, clamp, span, wobble } from '../../../../../../sdk'
import type { Member } from '../../../characters/member'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { put } from '../../../trip/legs/stage'
import type { FrameBuilt } from './build'
import { BOXER, BRIDGE, CANNON, DADDY, LV, ROPE } from './layout'
import type { BallPool } from './pool'
import { frameSfx as sfx } from './sounds'

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const tmp = new Vector3()
/** Daddy sits on a padded bump in the pit, the balls up to his tummy. */
const SEAT = 0.26
const w = new Vector3()

export class FrameToys {
  /** Daddy in the ball pit (his toy animal inside, so he can tip back and flop). */
  readonly daddy = new Group()
  /** Times the cannon has hit him (the third: he flops back in himself). */
  hits = 0
  private fall: { t: number; big: boolean } | null = null
  private hornBall: Group
  /** Balls in the air (a few at once: she can tap as fast as she likes). */
  private balls: Group[] = []
  private flights: { ball: Group; from: Vector3; t: number }[] = []
  /** When the cannon last fired (the camera keeps Daddy in view for a while). */
  firedAt = -99
  private recoil = 1
  private time = 0
  private bounce = 0
  /** Where she is on the bridge or the rope course (null: not on it). */
  private onBridge: number | null = null
  private onRope: number | null = null
  private logs: { a: number; v: number; dip: number }[]
  private maskT = 1
  private nagaT = [1, 1]
  private boxerT = 1
  private spireT: number[]
  private takhon: { jiggle: number; face: number; passed: boolean }[]

  constructor(
    private f: FrameBuilt,
    private pool: BallPool,
    private nick: Member,
    scene: Object3D,
    bag: Bag,
    private fx: { giggle(): void; /** A ball bonked Daddy (`big`: the third, his big flop). */ bonk(big: boolean): void },
  ) {
    // Daddy, sitting in the balls, turned toward the cannon a little.
    this.daddy.position.set(DADDY.at[0], SEAT, DADDY.at[1])
    this.daddy.rotation.order = 'YXZ'
    this.daddy.rotation.y = (DADDY.face * Math.PI) / 180
    put(nick, 0, 0, 0, 'sit')
    this.daddy.add(nick.root)
    scene.add(this.daddy)
    this.hornBall = solid(merge([P.sphere(0.13, PAL.hotpink)]), bag, 1.5)
    this.hornBall.position.set(0, 0.98, 0.08)
    this.hornBall.visible = false
    nick.rig.head.add(this.hornBall)
    for (let i = 0; i < 4; i++) {
      const b = solid(merge([P.sphere(0.13, [PAL.hotpink, PAL.sky, PAL.butter, PAL.mint][i])]), bag, 1.5)
      b.visible = false
      scene.add(b)
      this.balls.push(b)
    }
    // Aim the cannon at him: low, under the deck.
    const c = f.cannon
    c.root.rotation.y = Math.atan2(DADDY.at[1] - CANNON.at[1], -(DADDY.at[0] - CANNON.at[0]))
    c.barrel.rotation.z = 1.12
    this.logs = f.logs.map(() => ({ a: 0, v: 0, dip: 0 }))
    this.spireT = f.spires.map(() => 1)
    this.takhon = f.takhon.map(() => ({ jiggle: 1, face: 1, passed: false }))
  }

  get pickRoots(): Object3D[] {
    return [this.daddy]
  }
  get daddyHead() {
    return this.nick.rig.head.getWorldPosition(new Vector3())
  }
  /** Daddy is part of the show (a ball on its way): the camera keeps him in view. */
  get daddyShow() {
    return this.time - this.firedAt < 3.5
  }

  // ---------------------------------------------------------------- pokes

  /** The cannon: a ball at Daddy (up to four in the air at once). */
  fire() {
    const ball = this.balls.find((b) => !b.visible)
    if (!ball) return false
    this.firedAt = this.time
    this.recoil = 0
    sfx.thoomp()
    const c = this.f.cannon
    c.barrel.updateWorldMatrix(true, false)
    const from = c.barrel.localToWorld(v(0, 0.7, 0))
    this.flights.push({ ball, from, t: 0 })
    ball.visible = true
    ball.position.copy(from)
    return true
  }

  daddyTap() {
    this.nick.react('hop')
    sfx.babble(120)
    const p = this.daddy.position
    this.pool.splash(p.x, p.z, 8, 0.7)
  }

  bridge() {
    this.bounce = 1
    sfx.boing()
  }

  rope() {
    this.logs.forEach((l, i) => (l.v += (i % 2 ? -1 : 1) * 2.2))
    sfx.knock()
  }

  mask() {
    this.maskT = 0
    sfx.goggle()
    sfx.jangle()
  }

  naga(i: number) {
    if (this.nagaT[i] === undefined) return
    this.nagaT[i] = 0
    sfx.rawr()
  }

  boxer() {
    this.boxerT = 0
    sfx.ringBell()
    ;[0.15, 0.45, 0.75].forEach((d) => setTimeout(() => sfx.jab(), d * 1000))
  }

  spire(i: number) {
    if (this.spireT[i] === undefined) return
    this.spireT[i] = 0
    sfx.templeBell()
  }

  takhonTap(i: number) {
    const k = this.takhon[i]
    if (!k) return
    k.jiggle = 0
    k.face = 0
    sfx.jangle()
  }

  /** The net bridge's height at x: it sags in the middle, more where she stands, and bounces. */
  bridgeLift(x: number) {
    const [x0, x1] = BRIDGE.rect
    const k = clamp((x - x0) / (x1 - x0))
    const sag = Math.sin(Math.PI * k) * BRIDGE.sag
    const near = this.onBridge === null ? 0 : Math.max(0, 1 - Math.abs(x - this.onBridge) / 1.0) * 0.08
    return -(sag * (this.onBridge === null ? 0.45 : 1) + near) + Math.sin(Math.PI * k) * Math.sin(this.time * 16) * 0.12 * this.bounce
  }

  /** The rope course: she stands on the log under her, which dips and swings. */
  ropeLift(x: number) {
    const [x0, x1] = ROPE.rect
    const i = clamp(Math.floor(((x - x0) / (x1 - x0)) * ROPE.logs), 0, ROPE.logs - 1)
    return 0.1 - this.logs[i].dip
  }

  /** She's riding past (the roller slide): a mask she passes turns and pulls a face. */
  passing(p: Vector3) {
    this.f.takhon.forEach((mk, i) => {
      const s = this.takhon[i]
      const d = Math.abs(mk.root.position.x - p.x)
      if (d < 1.4 && !s.passed) {
        s.passed = true
        s.face = 0
        sfx.jangle()
      }
      if (d > 3) s.passed = false
    })
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number, kaylee: Vector3, where: { bridge: boolean; rope: boolean }) {
    this.time = t
    this.onBridge = where.bridge ? kaylee.x : null
    const ropeWas = this.onRope
    this.onRope = where.rope ? kaylee.x : null
    this.updateDaddy(dt, kaylee)
    const f = this.f

    // The net bridge's planks follow its sag; a bounce dies away.
    this.bounce = Math.max(0, this.bounce - dt / 1.4)
    f.sag(f.plankX.map((x) => this.bridgeLift(x)))

    // The rope course: each log swings on its ropes; the one under her dips (and knocks when she steps on).
    const [x0, x1] = ROPE.rect
    const under = this.onRope === null ? -1 : clamp(Math.floor(((this.onRope - x0) / (x1 - x0)) * ROPE.logs), 0, ROPE.logs - 1)
    const wasUnder = ropeWas === null ? -1 : clamp(Math.floor(((ropeWas - x0) / (x1 - x0)) * ROPE.logs), 0, ROPE.logs - 1)
    if (under >= 0 && under !== wasUnder) {
      this.logs[under].v += 1.6 * (under % 2 ? -1 : 1)
      sfx.knock()
    }
    this.logs.forEach((l, i) => {
      l.v += (-l.a * 9 - l.v * 1.4) * dt
      l.a += l.v * dt
      l.dip += ((i === under ? 0.1 : 0) - l.dip) * (1 - Math.exp(-dt * 10))
      const g = f.logs[i]
      g.rotation.z = l.a * 0.12
      g.position.y = LV.l3 - 0.12 - l.dip
    })

    // The giant mask: its eyes follow her; a tap rolls them and wobbles it.
    this.maskT = Math.min(1, this.maskT + dt / 1.2)
    const mk = f.mask
    mk.root.rotation.z = wobble(this.maskT, 3) * 0.08
    mk.root.updateWorldMatrix(true, false)
    tmp.copy(kaylee).setY(kaylee.y + 0.6)
    mk.root.worldToLocal(tmp)
    const roll = this.maskT < 1 ? this.maskT * Math.PI * 4 : 0
    mk.pupils.forEach((p, i) => {
      const k = i ? 1 : -1
      const lx = clamp((tmp.x - k * 0.38) / 6, -0.07, 0.07)
      const ly = clamp((tmp.y - 0.22) / 6, -0.07, 0.07)
      p.position.x = k * 0.38 + (this.maskT < 1 ? Math.cos(roll) * 0.08 : lx)
      p.position.y = 0.22 + (this.maskT < 1 ? Math.sin(roll) * 0.08 : ly)
    })

    // The nagas sway and watch her; a tap makes one rear up and shake.
    f.nagas.forEach((g, i) => {
      this.nagaT[i] = Math.min(1, this.nagaT[i] + dt / 1.1)
      const n = this.nagaT[i]
      g.getWorldPosition(w)
      const look = clamp(Math.atan2(kaylee.x - w.x, kaylee.z - w.z), -0.9, 0.9)
      g.rotation.y += (look * 0.6 - g.rotation.y) * (1 - Math.exp(-dt * 3))
      g.rotation.z = Math.sin(t * 1.4 + i * 2) * 0.05 + wobble(n, 4) * 0.25
      g.scale.setScalar(1.55 * (1 + bell(span(n, 0, 0.4)) * 0.18))
    })

    // The boxer: a little bob and a look her way; a tap: three punches in the air.
    this.boxerT = Math.min(1, this.boxerT + dt / 1.1)
    const b = f.boxer
    const bt = this.boxerT
    b.body.position.y = BOXER.h + 0.1 + Math.abs(Math.sin(t * 2.2)) * 0.015 + bell(span(bt, 0, 0.3)) * 0.08
    b.root.getWorldPosition(w)
    b.head.rotation.y += (clamp(Math.atan2(kaylee.x - w.x, kaylee.z - w.z), -0.8, 0.8) - b.head.rotation.y) * (1 - Math.exp(-dt * 4))
    const jabR = bell(span(bt, 0.1, 0.3)) + bell(span(bt, 0.66, 0.86))
    const jabL = bell(span(bt, 0.38, 0.58))
    b.armR.rotation.set(-0.2 - jabR * 1.2, 0, 2.6 - jabR * 1.4)
    b.armL.rotation.set(-0.5 - jabL * 1.3, 0, -0.35 - jabL * 0.9)

    // The spires ring and bounce.
    f.spires.forEach((g, i) => {
      this.spireT[i] = Math.min(1, this.spireT[i] + dt / 1.2)
      const k = this.spireT[i]
      g.scale.setScalar((i === 0 ? 1.15 : 1) * (1 + bell(span(k, 0, 0.35)) * 0.15))
      g.rotation.z = wobble(k, 3) * 0.06
    })

    // The roller's Phi Ta Khon: a jiggle and a jangle, or a face pulled at her as she rattles by.
    f.takhon.forEach((m, i) => {
      const s = this.takhon[i]
      s.jiggle = Math.min(1, s.jiggle + dt / 0.9)
      s.face = Math.min(1, s.face + dt / 1.4)
      m.root.rotation.z = wobble(s.jiggle, 4) * 0.14
      m.head.rotation.z = Math.sin(t * 1.3 + i) * 0.05
      const pull = bell(span(s.face, 0, 1))
      tmp.copy(kaylee).sub(m.root.position)
      m.head.rotation.y = pull * clamp(Math.atan2(tmp.x, tmp.z), -1.2, 1.2)
      m.head.scale.setScalar(1 + pull * 0.2)
      m.tongue.scale.setScalar(Math.max(0.001, pull))
    })

    // The cannon's recoil.
    this.recoil = Math.min(1, this.recoil + dt / 0.45)
    f.cannon.barrel.position.y = 0.5 - bell(span(this.recoil, 0, 0.5)) * 0.1
    f.cannon.barrel.scale.y = 1 - bell(span(this.recoil, 0, 0.4)) * 0.15
  }

  private updateDaddy(dt: number, kaylee: Vector3) {
    // The ball in flight: a low arc (under the deck) to his head.
    for (const fl of [...this.flights]) {
      fl.t += dt / 0.6
      const to = this.daddyHead.add(v(0, -0.05, 0))
      const k = Math.min(1, fl.t)
      fl.ball.position.lerpVectors(fl.from, to, k)
      fl.ball.position.y += bell(k) * 0.18
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(fl), 1)
        fl.ball.visible = false
        this.hit()
      }
    }
    const d = this.daddy
    if (this.fall) {
      const fl = this.fall
      fl.t += dt
      const T = fl.t
      if (fl.big) {
        // He stands up out of the balls, wobbles (a wiggle), then flops back in: a huge splash, then up again.
        const up = span(T, 0, 0.35) * (1 - span(T, 0.9, 1.15))
        const flop = span(T, 0.9, 1.2) * (1 - span(T, 1.9, 2.3))
        d.position.y = SEAT + up * 0.3 - flop * 0.45
        d.rotation.x = -1.35 * flop
        d.rotation.z = Math.sin(T * 18) * 0.12 * up
        if (T >= 1.18 && T - dt < 1.18) {
          this.pool.splash(d.position.x, d.position.z, 36, 1.4)
          sfx.splash(1.6)
          this.fx.giggle()
        }
        if (T > 2.4) {
          this.fall = null
          d.position.y = SEAT
          d.rotation.x = d.rotation.z = 0
          this.nick.react('hop')
        }
      } else {
        // Bonk: knocked back into the balls, then up he pops, with the ball on his horn.
        const back = span(T, 0, 0.3) * (1 - span(T, 0.9, 1.25))
        d.rotation.x = -1.2 * back
        d.position.y = SEAT - 0.45 * back
        if (T >= 0.3 && T - dt < 0.3) {
          this.pool.splash(d.position.x, d.position.z, 18, 1)
          sfx.splash(1)
        }
        if (T >= 1.0 && T - dt < 1.0) {
          this.hornBall.visible = true
          this.nick.react('hop')
          sfx.boing()
        }
        if (T > 1.3) {
          this.fall = null
          d.rotation.x = 0
          d.position.y = SEAT
        }
      }
    }
    // He watches her.
    this.nick.lookAt(kaylee.x, kaylee.y + 0.6, kaylee.z)
  }

  private hit() {
    sfx.boink()
    this.fx.giggle()
    // (Mid-flop, a ball just bonks off him.)
    if (this.fall?.big) return
    this.hits++
    if (this.hits >= 3) {
      this.hits = 0
      this.hornBall.visible = false
      this.fall = { t: 0, big: true }
    } else this.fall = { t: 0, big: false }
    this.fx.bonk(this.fall.big)
  }
}
