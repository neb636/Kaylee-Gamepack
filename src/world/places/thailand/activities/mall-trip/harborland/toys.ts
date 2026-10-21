// Everything in HarborLand that reacts to her besides the rides:
//   the cannon     tap it and a ball flies in an arc at Daddy (in the pool): bonk, he topples into the balls and pops
//                  up with the ball stuck on his horn; the third hit, he cannonballs in himself
//   the monkeys    three Lopburi monkeys on the Golden Mountain: tap one and it hops down to the pool, steals one of
//                  Daddy's socks and runs back up with it; tap it again and it wears the sock on its head
//   Phi Ta Khon    three masked figures along the roller slide: tap one and its bells jangle; when she rattles past on
//                  the slide, its mask turns to her and pulls a face (tongue out)
//   the Sky Pod    a wall of buttons: each tap lights one with a note up the scale; all nine and they flash
//   the bike       the wheels spin and the light column fills, ding! (she always wins)
//   the chedi      a soft bell and a little glow
//   the bridge     the rope bridge sags under her and bounces when tapped
import { Group, Mesh, Vector3, type Object3D } from 'three'
import { bell, clamp, sounds, span, wobble } from '../../../../../../sdk'
import type { Member } from '../../../characters/member'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { sfx } from '../../../sfx'
import type { Built } from './build'
import { BRIDGE, CANNON, DADDY, LV, MOUNTAIN, POOL } from './layout'
import type { BallPool } from './pool'

interface Monkey {
  root: Group
  body: Group
  hand: Group
  hat: Group
  home: Vector3
  /** Hops still to do, and the one under way. */
  queue: Vector3[]
  hop: { from: Vector3; to: Vector3; t: number } | null
  sock: 'none' | 'hand' | 'head'
  sockMesh: Group | null
  jiggle: number
  away: boolean
}

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const tmp = new Vector3()

/** One of Daddy's grip socks (white with a pink band and grip dots). */
function sock(bag: Bag) {
  return solid(merge([P.capsule(0.06, 0.12, '#FFFFFF', { rot: [0, 0, 0] }), P.sphere(0.075, '#FFFFFF', { at: [0, -0.1, 0.06], scale: [1, 0.8, 1.4] }), P.cyl(0.065, 0.065, 0.05, PAL.hotpink, { at: [0, 0.1, 0] })]), bag, 1.5)
}

function buildMonkey(bag: Bag) {
  const root = new Group()
  const body = new Group()
  root.add(body)
  const fur = '#B98A62'
  const face = '#F6CDB0'
  body.add(
    solid(
      merge([
        P.sphere(0.2, fur, { at: [0, 0.22, 0], scale: [1, 1.05, 0.95] }),
        P.sphere(0.13, face, { at: [0, 0.2, 0.1], scale: [1, 1.1, 0.6] }),
        P.sphere(0.17, fur, { at: [0, 0.52, 0.02] }),
        P.sphere(0.12, face, { at: [0, 0.5, 0.11], scale: [1, 0.85, 0.7] }),
        ...[-1, 1].map((s) => P.sphere(0.07, face, { at: [s * 0.17, 0.56, 0], scale: [0.6, 1, 1] })),
        ...[-1, 1].map((s) => P.sphere(0.025, PAL.ink, { at: [s * 0.05, 0.54, 0.2] })),
        P.sphere(0.03, '#E58A8A', { at: [0, 0.48, 0.21] }),
        ...[-1, 1].map((s) => P.capsule(0.045, 0.14, fur, { at: [s * 0.18, 0.22, 0.06], rot: [0.5, 0, s * 0.5] })),
        ...[-1, 1].map((s) => P.sphere(0.06, fur, { at: [s * 0.09, 0.04, 0.08], scale: [1, 0.6, 1.3] })),
        P.capsule(0.03, 0.34, fur, { at: [0, 0.22, -0.24], rot: [-1.0, 0, 0] }),
      ]),
      bag,
      1.5,
    ),
  )
  const hand = new Group()
  hand.position.set(0.2, 0.18, 0.16)
  const hat = new Group()
  hat.position.set(0, 0.7, 0.02)
  body.add(hand, hat)
  return { root, body, hand, hat }
}

export class Toys {
  /** Daddy in the pool (his toy animal inside, so he can topple and cannonball). */
  readonly daddy = new Group()
  /** Times the cannon has hit him (the third: he cannonballs in himself). */
  hits = 0
  private fall: { t: number; big: boolean } | null = null
  private hornBall: Group
  /** Balls in the air (a few at once: she can tap as fast as she likes). */
  private balls: Group[] = []
  private flights: { ball: Group; from: Vector3; t: number }[] = []
  /** When the cannon last fired (the camera keeps Daddy in view for a while). */
  firedAt = -99
  private recoil = 1
  private socks = 2
  readonly monkeys: Monkey[] = []
  private masks: { jiggle: number; face: number; passed: boolean }[]
  private lit: number[] = []
  private litAt: number[] = Array(9).fill(-99)
  private flashAll = -1
  private bikeT = -1
  private chediT = 1
  private bounce = 0
  private time = 0
  /** Kaylee is on the rope bridge: it sags more round her. */
  private onBridge: number | null = null

  constructor(
    private built: Built,
    private pool: BallPool,
    private nick: Member,
    private scene: Object3D,
    private bag: Bag,
    private fx: { giggle(): void },
  ) {
    // Daddy, waist deep in the balls, facing the cannon a little.
    this.daddy.position.set(DADDY.at[0], 0, DADDY.at[1])
    this.daddy.rotation.order = 'YXZ'
    this.daddy.rotation.y = (DADDY.face * Math.PI) / 180
    nick.place(0, 0, 0, 0)
    this.daddy.add(nick.root)
    scene.add(this.daddy)
    // The ball that sticks on his horn.
    this.hornBall = solid(merge([P.sphere(0.13, PAL.hotpink)]), bag, 1.5)
    this.hornBall.position.set(0, 0.98, 0.08)
    this.hornBall.visible = false
    nick.rig.head.add(this.hornBall)
    for (let i = 0; i < 4; i++) {
      const b = solid(merge([P.sphere(0.14, [PAL.hotpink, PAL.sky, PAL.butter, PAL.mint][i])]), bag, 1.5)
      b.visible = false
      scene.add(b)
      this.balls.push(b)
    }
    // Aim the cannon at Daddy.
    const c = built.cannon
    c.root.rotation.y = Math.atan2(DADDY.at[1] - CANNON.at[1], -(DADDY.at[0] - CANNON.at[0]))
    c.barrel.rotation.z = 0.85
    for (const at of MOUNTAIN.monkeys) {
      const m = buildMonkey(bag)
      const home = v(...at)
      m.root.position.copy(home)
      m.root.rotation.y = 0.3
      m.root.userData.pick = `monkey:${this.monkeys.length}`
      scene.add(m.root)
      this.monkeys.push({ ...m, home, queue: [], hop: null, sock: 'none', sockMesh: null, jiggle: 1, away: false })
    }
    this.masks = built.masks.map(() => ({ jiggle: 1, face: 1, passed: false }))
  }

  get pickRoots(): Object3D[] {
    return [this.daddy, ...this.monkeys.map((m) => m.root)]
  }
  get daddyHead() {
    return this.nick.rig.head.getWorldPosition(new Vector3())
  }
  /** Daddy is part of the show (a ball on its way, a monkey after his sock): the camera keeps him in view. */
  get daddyShow() {
    return this.time - this.firedAt < 4 || this.monkeys.some((m) => m.away)
  }
  get busy() {
    return this.flights.length > 0 || !!this.fall || this.monkeys.some((m) => m.away)
  }

  // ---------------------------------------------------------------- pokes

  /** The cannon: a ball at Daddy (up to four in the air at once). */
  fire() {
    const ball = this.balls.find((b) => !b.visible)
    if (!ball) return false
    this.firedAt = this.time
    this.recoil = 0
    sfx.thoomp()
    const c = this.built.cannon
    this.scene.updateMatrixWorld()
    const from = c.barrel.localToWorld(v(0, 0.85, 0))
    this.flights.push({ ball, from, t: 0 })
    ball.visible = true
    ball.position.copy(from)
    return true
  }

  monkey(i: number) {
    const m = this.monkeys[i]
    if (!m) return
    m.jiggle = 0
    sfx.chatter()
    if (m.away || m.hop) return
    if (m.sock === 'hand') {
      // The sock goes on its head, like a hat.
      m.sock = 'head'
      m.hat.add(m.sockMesh!)
      m.sockMesh!.position.set(0, 0.05, 0)
      m.sockMesh!.rotation.set(0, 0, Math.PI / 2)
      this.fx.giggle()
      return
    }
    if (m.sock !== 'none' || this.socks <= 0 || this.monkeys.some((o) => o.away)) {
      this.hopOnce(m)
      return
    }
    // Down the mountain, over the balls to Daddy, and back up with his sock.
    m.away = true
    const [dx, dz] = DADDY.at
    m.queue = [v(-9.55, MOUNTAIN.tiers[0].y, 0.15), v(-10.1, POOL.rim, 1.1), v(-11.6, POOL.balls, 1.25), v(dx + 0.65, POOL.balls, dz + 0.35)]
  }

  mask(i: number) {
    const k = this.masks[i]
    if (!k) return
    k.jiggle = 0
    sfx.jangle()
  }

  skypod() {
    const free = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((b) => !this.lit.includes(b))
    if (!free.length || this.flashAll >= 0) return
    const b = free[Math.floor(Math.random() * free.length)]
    this.lit.push(b)
    this.litAt[b] = this.time
    sounds.note(this.lit.length)
    if (this.lit.length === 9) {
      this.flashAll = 0
      setTimeout(() => sounds.sparkle(), 250)
    }
  }

  bike() {
    if (this.bikeT >= 0) return
    this.bikeT = 0
    sfx.putt()
  }

  chedi() {
    this.chediT = 0
    sfx.ding()
  }

  bridge() {
    this.bounce = 1
    sfx.boing()
  }

  daddyTap() {
    this.nick.react('hop')
    sfx.babble(120)
    const p = this.daddy.position
    this.pool.splash(p.x, p.z, 8, 0.7)
  }

  /** The rope bridge's height at x: it sags in the middle, more where she stands, and bounces. */
  bridgeLift(x: number) {
    const [x0, x1] = BRIDGE.rect
    const k = clamp((x - x0) / (x1 - x0))
    const sag = Math.sin(Math.PI * k) * BRIDGE.sag
    const near = this.onBridge === null ? 0 : Math.max(0, 1 - Math.abs(x - this.onBridge) / 1.2) * 0.08
    return -(sag * (this.onBridge === null ? 0.5 : 1) + near) + Math.sin(Math.PI * k) * Math.sin(this.time * 16) * 0.12 * this.bounce
  }

  /** She's riding past (the roller slide): a mask she passes turns and pulls a face. */
  passing(p: Vector3) {
    this.built.masks.forEach((mk, i) => {
      const s = this.masks[i]
      const d = Math.abs(mk.root.position.x - p.x)
      if (d < 1.6 && !s.passed) {
        s.passed = true
        s.face = 0
        sfx.jangle()
      }
      if (d > 3) s.passed = false
    })
  }

  // ---------------------------------------------------------------- per frame

  update(dt: number, t: number, kaylee: Vector3, onBridge: boolean) {
    this.time = t
    this.onBridge = onBridge ? kaylee.x : null
    this.updateDaddy(dt, kaylee)
    this.updateMonkeys(dt, t)
    // The bridge's planks follow its sag; a bounce dies away.
    this.bounce = Math.max(0, this.bounce - dt / 1.4)
    for (const p of this.built.planks) p.position.y = LV.l1 - 0.04 + this.bridgeLift(p.position.x)
    // The masks: a jiggle and a jangle, or a face pulled at her as she rattles by.
    this.built.masks.forEach((mk, i) => {
      const s = this.masks[i]
      s.jiggle = Math.min(1, s.jiggle + dt / 0.9)
      s.face = Math.min(1, s.face + dt / 1.4)
      mk.root.rotation.z = wobble(s.jiggle, 4) * 0.12
      mk.head.rotation.z = Math.sin(t * 1.3 + i) * 0.05 + wobble(s.jiggle, 3) * 0.2
      const pull = bell(span(s.face, 0, 1))
      tmp.copy(kaylee).sub(mk.root.position)
      mk.head.rotation.y = pull * clamp(Math.atan2(tmp.x, tmp.z), -1.2, 1.2)
      mk.head.scale.setScalar(1 + pull * 0.18)
      mk.tongue.scale.setScalar(Math.max(0.001, pull))
    })
    // The Sky Pod: lit buttons go out after a while; all nine flash.
    const sp = this.built.skypod
    if (this.flashAll >= 0) {
      this.flashAll += dt
      if (this.flashAll > 1.6) {
        this.flashAll = -1
        this.lit = []
      }
    }
    this.lit = this.lit.filter((b) => this.flashAll >= 0 || t - this.litAt[b] < 7)
    sp.buttons.forEach((b, i) => {
      const on = this.flashAll >= 0 ? Math.floor(this.flashAll * 8) % 2 === 0 : this.lit.includes(i)
      const mat = on ? toon(i % 2 ? PAL.gold : PAL.hotpink) : toon(PAL.lavenderDark)
      if (b.material !== mat) b.material = mat
      b.scale.z = on ? 1.6 : 1
    })
    // The bike: the wheels spin, the lights climb, ding.
    const bk = this.built.bike
    if (this.bikeT >= 0) {
      this.bikeT += dt
      const k = this.bikeT / 2.4
      for (const w of bk.wheels) w.rotation.x -= dt * 14 * bell(clamp(k))
      bk.lights.forEach((m: Mesh, i) => {
        const mat = k * 6 > i + 1 ? toon(i === 4 ? PAL.gold : PAL.mint) : toon(PAL.lavenderDark)
        if (m.material !== mat) m.material = mat
      })
      if (k >= 1 && this.bikeT - dt < 2.4) {
        sfx.lap()
        sfx.cheer()
      }
      if (k > 1.8) {
        this.bikeT = -1
        bk.lights.forEach((m: Mesh) => (m.material = toon(PAL.lavenderDark)))
      }
    }
    // The chedi glows.
    this.chediT = Math.min(1, this.chediT + dt / 1.2)
    this.built.chedi.scale.setScalar(1 + bell(this.chediT) * 0.08)
    // The cannon's recoil.
    this.recoil = Math.min(1, this.recoil + dt / 0.45)
    this.built.cannon.barrel.position.y = 0.55 - bell(span(this.recoil, 0, 0.5)) * 0.12
    this.built.cannon.barrel.scale.y = 1 - bell(span(this.recoil, 0, 0.4)) * 0.15
  }

  private updateDaddy(dt: number, kaylee: Vector3) {
    // The ball in flight: an arc to his head.
    for (const f of [...this.flights]) {
      f.t += dt / 0.85
      const to = this.daddy.position.clone().setY(1.55)
      const k = Math.min(1, f.t)
      f.ball.position.lerpVectors(f.from, to, k)
      f.ball.position.y += bell(k) * 1.7
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        f.ball.visible = false
        this.hit()
      }
    }
    const d = this.daddy
    if (this.fall) {
      const fl = this.fall
      fl.t += dt
      if (fl.big) {
        // The cannonball: a crouch, a big jump with a tuck and a flip, a huge splash, then up again.
        const T = fl.t
        const crouch = bell(span(T, 0, 0.3))
        const air = span(T, 0.25, 1.15)
        d.position.y = Math.sin(Math.PI * air) * 2.0 - span(T, 1.1, 1.3) * 0.75 + span(T, 1.7, 2.1) * 0.75
        d.scale.set(1 + 0.08 * crouch, 1 - 0.18 * crouch - 0.2 * bell(air), 1 + 0.08 * crouch)
        d.rotation.x = air * Math.PI * 2
        if (T >= 1.12 && T - dt < 1.12) {
          this.pool.splash(d.position.x, d.position.z, 40, 2.2)
          sfx.splash(1.6)
          this.fx.giggle()
        }
        if (T > 2.2) {
          this.fall = null
          d.position.y = 0
          d.scale.set(1, 1, 1)
          d.rotation.x = 0
          this.nick.react('hop')
        }
      } else {
        // Bonk: knocked back into the balls, then up he pops, with the ball on his horn.
        const T = fl.t
        const back = span(T, 0, 0.3) * (1 - span(T, 0.9, 1.25))
        d.rotation.x = -1.25 * back
        d.position.y = -0.55 * back
        if (T >= 0.3 && T - dt < 0.3) {
          this.pool.splash(d.position.x, d.position.z, 18, 1.2)
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
          d.position.y = 0
        }
      }
    }
    // He watches her.
    this.nick.lookAt(kaylee.x, kaylee.y + 0.6, kaylee.z)
  }

  private hit() {
    sfx.boink()
    this.fx.giggle()
    // (Mid-cannonball, a ball just bonks off him.)
    if (this.fall?.big) return
    this.hits++
    if (this.hits >= 3) {
      this.hits = 0
      this.hornBall.visible = false
      this.fall = { t: 0, big: true }
    } else this.fall = { t: 0, big: false }
  }

  private hopOnce(m: Monkey) {
    if (!m.hop) m.queue = [m.root.position.clone()]
  }

  private updateMonkeys(dt: number, t: number) {
    for (const [i, m] of this.monkeys.entries()) {
      m.jiggle = Math.min(1, m.jiggle + dt / 0.6)
      if (!m.hop && m.queue.length) {
        const to = m.queue.shift()!
        m.hop = { from: m.root.position.clone(), to, t: 0 }
        if (to.distanceTo(m.root.position) > 0.05) m.root.rotation.y = Math.atan2(to.x - m.root.position.x, to.z - m.root.position.z)
      }
      if (m.hop) {
        const h = m.hop
        h.t += dt / 0.34
        const k = Math.min(1, h.t)
        m.root.position.lerpVectors(h.from, h.to, k)
        m.root.position.y += bell(k) * 0.45
        m.body.scale.set(1, 1 + 0.15 * bell(k), 1)
        if (k >= 1) {
          m.hop = null
          m.body.scale.set(1, 1, 1)
          if (!m.queue.length && m.away) this.monkeyArrived(m)
        }
      } else {
        // Sitting: a scratch, a look round; it chatters along when tapped.
        m.body.rotation.z = Math.sin(t * 2 + i * 2) * 0.05 + wobble(m.jiggle, 3) * 0.2
        m.body.position.y = Math.abs(Math.sin(t * 3 + i)) * 0.02
      }
    }
  }

  /** At Daddy: grab a sock and head home; at home: sit down with it. */
  private monkeyArrived(m: Monkey) {
    if (m.sock === 'none') {
      this.socks--
      m.sock = 'hand'
      m.sockMesh = sock(this.bag)
      m.hand.add(m.sockMesh)
      this.nick.react('wiggle')
      sfx.babble(120)
      sfx.chatter()
      this.fx.giggle()
      m.queue = [v(-11.6, POOL.balls, 1.25), v(-10.1, POOL.rim, 1.1), v(-9.55, MOUNTAIN.tiers[0].y, 0.15), m.home.clone()]
      return
    }
    m.away = false
    m.root.rotation.y = 0.3
  }
}
