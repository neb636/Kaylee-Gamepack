// Aunty Sri drives them to the airport (plan: thailand/boat-trip.md, "Aunty Sri's car"). Kaylee rides in the back by
// the window and plays; she never drives. The camera looks in from the curb side with the roof off (the house's
// dollhouse look), and Bangkok streams past in real depth: the near sidewalk fast, the traffic and the shophouses across
// the road slower, the skyline slowest.
//
// The ride moves on by itself, whatever she does (about 40 s): past the shophouses near Agong's house, along the big
// road (tuk-tuks, a motorbike carrying a whole family and their dog, a pink taxi, a mango sticky rice cart, the
// skytrain overhead, a golden temple roof), then up to the airport's glowing drop-off.
// Her toys: the seatbelt (click), the window (down: wind; up again), waving at what goes by (tap it and it answers),
// Aunty Sri (beep beep!), the radio (everyone bobs; again: off), the snacks, Daddy (a funny face), Mommy (a cuddle),
// the garland on the mirror. Driving on the left, the wheel on the right: she sees it, nobody says it twice.
import { Color, Fog, Group, Mesh, MeshBasicMaterial, RingGeometry, Vector3, type Object3D, type WebGLRenderer } from 'three'
import { bell, clamp, sounds, wobble } from '../../../../../sdk'
import type { AnchorInfo } from '../../engine/Anchors'
import type { Shot } from '../../engine/camera'
import type { Bag } from '../../engine/dispose'
import { merge, P, solid, type V3 } from '../../engine/geo'
import { Particles } from '../../engine/particles'
import { PAL } from '../../engine/toon'
import { noise, tone } from '../../../../kit/sfx'
import { sfx } from '../../sfx'
import { TALK } from '../talk'
import { buildCar, type Car } from '../vehicles/car'
import { Stage, type AnchorSpot, type LegEvents, type Rider } from './stage'

export const CAR_ANCHORS: AnchorInfo[] = [
  { id: 'belt', label: 'Seatbelt', kind: 'thing' },
  { id: 'window', label: 'Window', kind: 'thing' },
  { id: 'radio', label: 'Radio', kind: 'thing' },
  { id: 'snacks', label: 'Snacks', kind: 'thing' },
  { id: 'garland', label: 'Garland', kind: 'thing' },
  { id: 'horn', label: 'Horn', kind: 'thing' },
  { id: 'family:sri', label: 'Aunty Sri', kind: 'family' },
  { id: 'family:nick', label: 'Daddy', kind: 'family' },
  { id: 'family:ji', label: 'Mommy', kind: 'family' },
  { id: 'family:kaylee', label: 'Kaylee', kind: 'family' },
  { id: 'out:bird', label: 'Uncle Bird', kind: 'thing' },
  { id: 'out:cat', label: 'Cat', kind: 'thing' },
  { id: 'out:tuk', label: 'Tuk-tuk', kind: 'thing' },
  { id: 'out:family', label: 'Motorbike family', kind: 'thing' },
  { id: 'out:taxi', label: 'Pink taxi', kind: 'thing' },
  { id: 'out:cart', label: 'Mango sticky rice cart', kind: 'thing' },
  { id: 'out:train', label: 'Skytrain', kind: 'thing' },
  { id: 'out:temple', label: 'Temple', kind: 'thing' },
]

// ---- The road (meters; the car drives toward -x in its own lane at z = 0, the curb is on its left at +z) ----
const CURB = 1.6
const LANE2 = -3.0
const ONCOMING = -5.4
/** The gap between our lane and the next, where motorbikes squeeze past (behind the car from the camera, so nothing
 *  passes between the camera and Kaylee). */
const GAP = -1.65
const FAR = -6.8
const HOUSES = -9.2
/** The skytrain's deck (low enough to show over the car). */
const SKY_Y = 3.5
/** Seconds after setting off: how far along the road she is (it speeds up on the big road and slows at the airport). */
export function along(t: number) {
  if (t <= 0) return 0
  if (t < 2) return t * t
  if (t < 12) return 4 + 4 * (t - 2)
  if (t < 14) return 44 + 4 * (t - 12) + 0.625 * (t - 12) ** 2
  if (t < 32) return 54.5 + 6.5 * (t - 14)
  const u = Math.min(8, t - 32)
  return 171.5 + 6.5 * u - 0.40625 * u * u
}
/** The road is laid out for a 40-second ride (a trip can ask for a shorter or longer one: it drives faster or slower). */
const RIDE_S = 40
const END = along(RIDE_S)
/** Waits this long for her seatbelt, then Mommy clicks it for her. */
const BELT_WAIT = 4.5
const BUMP_AT = 82
const TEMPLE_AT = 140
const CART_AT = 104

const ROAD = '#CFC8E3'
const WALK = '#EEE7F8'
const WALLS = ['#FFD9C4', '#CFF0E4', '#E3DAFF', '#CDE7FF', '#FFF0B8', '#FFD3E6', '#D6F0C9', '#FFE2B8', '#D9E4FF', '#F2D9FF']
const SIGNS = [PAL.sky, PAL.butter, PAL.pink, PAL.mint, PAL.lavenderDark, PAL.peach, '#F0646E']

type OutId = 'bird' | 'cat' | 'tuk' | 'family' | 'taxi' | 'cart' | 'train' | 'temple'

interface Mover {
  g: Group
  /** Where it is relative to the car (x along the road), from t0 to t1 seconds into the ride. */
  t0: number
  t1: number
  from: number
  to: number
  z: number
  /** `from` and `to` are places on the road, not next to the car. */
  world: boolean
  /** >1: it lingers at `from` first (Uncle Bird riding along by her window), then goes. */
  ease: number
  /** It answered a wave (seconds into its little reaction). */
  react: number
}

const tmp = new Vector3()

export class CarRide extends Stage {
  private car: Car
  private road = new Group()
  private riders: Record<'kaylee' | 'ji' | 'nick' | 'sri', Rider>
  private wind: Particles
  private ride = { t: -1, s: 0, v: 0, belt: false, beltT: 0 }
  private win = { down: false, k: 0, blown: false }
  private radio = { on: false, step: 0, timer: 0 as ReturnType<typeof setInterval> | 0, skip: 0 }
  private movers: Partial<Record<OutId, Mover>> = {}
  private statics: Partial<Record<OutId, Object3D>> = {}
  private glow: Mesh
  private bumpT = 1
  private wiggles = new Map<string, number>()
  private dadTurn = 0
  private cuddle = 0
  private munch = 0
  private garlandSwing = { a: 0, v: 0 }
  private told = new Set<string>()
  private ending = -1
  private counts = { waves: 0, horns: 0, radios: 0, windows: 0 }

  /** Ride seconds per real second (the trip's cap). */
  private pace: number

  constructor(renderer: WebGLRenderer, events: LegEvents, cap = RIDE_S) {
    super(renderer, events)
    this.pace = RIDE_S / cap
    const { scene, bag } = this
    scene.background = new Color('#BFE6FF')
    scene.fog = new Fog('#DCEFFB', 60, 170)
    this.rig.fov = 34
    this.rig.camera.far = 400
    // The car is on rails: the camera keeps right up with it (a lagging camera leaves it at the edge at speed).
    this.rig.lag = 0.1
    this.car = buildCar(bag)
    this.car.roof.visible = false
    this.car.root.rotation.y = -Math.PI / 2
    scene.add(this.road, this.car.root)
    this.buildRoad()
    // Everyone in their seats: Aunty Sri at the wheel on the right, Daddy beside her, Mommy and Kaylee in the back.
    const { kaylee, members } = this.makeFamily(['ji', 'nick', 'sri'])
    this.riders = { kaylee, ji: members.get('ji')!, nick: members.get('nick')!, sri: members.get('sri')! }
    for (const id of ['kaylee', 'ji', 'nick', 'sri'] as const) {
      const c = this.riders[id]
      this.car.seats[id].add(c.root)
      this.put(c, 0, 0, 0, 'sit', 0)
    }
    this.wind = new Particles({ kind: 'spray', count: 60, color: '#FFFFFF', opacity: 0.7 }, bag)
    scene.add(this.wind.mesh)
    this.glow = new Mesh(bag.add(new RingGeometry(0.9, 1.4, 32)), bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.7, depthWrite: false })))
    this.glow.rotation.x = -Math.PI / 2
    this.glow.position.set(-END - 0.7, 0.03, 0.4)
    scene.add(this.glow)
    setTimeout(() => this.events.say(TALK.car.start), 400)
  }

  // ---------------------------------------------------------------- the road

  private buildRoad() {
    const { bag } = this
    const x0 = 40
    const x1 = -END - 40
    const len = x0 - x1
    const mid = (x0 + x1) / 2
    // The road, its lanes, the curbs and the sidewalks.
    const dashes = []
    for (let x = x0; x > x1; x -= 4.5) dashes.push(P.box(1.8, 0.01, 0.14, PAL.cream, { at: [x, 0.006, (LANE2 + 0) / 2 - 0.1] }), P.box(1.8, 0.01, 0.14, PAL.butter, { at: [x - 2, 0.006, (LANE2 + ONCOMING) / 2] }))
    this.road.add(
      solid(merge([P.box(len, 0.1, CURB - FAR, ROAD, { at: [mid, -0.05, (CURB + FAR) / 2] }), ...dashes, P.box(0.6, 0.06, CURB - LANE2 + 1.4, '#B7AEDA', { at: [-BUMP_AT, 0.03, (CURB + LANE2) / 2] })]), bag, 0),
      solid(merge([P.box(len, 0.2, 3.2, WALK, { at: [mid, 0.0, CURB + 1.6] }), P.box(len, 0.22, 0.16, '#D2C4F4', { at: [mid, 0.01, CURB + 0.08] }), P.box(len, 0.2, 3, WALK, { at: [mid, 0.0, FAR - 1.5] }), P.box(len, 0.22, 0.16, '#D2C4F4', { at: [mid, 0.01, FAR - 0.08] })]), bag, 2),
    )
    // Across the road: a row of shophouses all the way to the big road, then shophouses mixed with towers; each its own
    // color and sign (no mirrored copies), then the airport.
    const parts = []
    let i = 0
    for (let x = x0 - 3; x > -170; x -= 5.4, i++) {
      if (Math.abs(x + TEMPLE_AT) < 9) continue
      const r = hash(i)
      const tower = x < -55 && r > 0.62
      const floors = tower ? 7 + Math.floor(r * 6) : 3 + (i % 2)
      const h = tower ? floors * 2.6 : 3.6 + (floors - 1) * 3
      const wall = WALLS[(i * 7 + Math.floor(r * 10)) % WALLS.length]
      const z = tower ? HOUSES - 3 : HOUSES
      parts.push(P.box(5.3, h, 6, wall, { at: [x, h / 2, z - 3] }))
      if (tower) {
        for (let f = 1; f < floors; f++) parts.push(P.box(4.4, 1.0, 0.08, '#B9C9F0', { at: [x, f * 2.6 + 0.6, z + 0.02] }))
      } else {
        parts.push(P.box(4.6, 2.6, 0.08, ['#BFE6DA', '#C9DDE8', '#D6E6C9', '#C9C3E8'][i % 4], { at: [x, 1.35, z + 0.02] }))
        parts.push(P.box(4.4, 0.5, 0.1, SIGNS[(i * 3) % SIGNS.length], { at: [x, 3.2, z + 0.06] }))
        for (let f = 1; f < floors; f++) for (const dx of [-1.2, 1.2]) parts.push(P.rbox(1.2, 1.3, 0.1, 0.04, '#A99BE0', { at: [x + dx, 3.6 + (f - 1) * 3 + 1.4, z + 0.03] }))
      }
    }
    this.road.add(solid(merge(parts), bag, 2))
    // The skyline far behind (fades into the haze).
    const sky = []
    for (let x = x0, j = 0; x > x1; x -= 14, j++) {
      const r = hash(j + 50)
      sky.push(P.box(10, 14 + r * 26, 10, ['#D9D2EE', '#CFC9E8', '#E2DCF2'][j % 3], { at: [x, (14 + r * 26) / 2, -48 - r * 14] }))
    }
    this.road.add(solid(merge(sky), bag, 0))
    // The skytrain on its pillars over the far lanes, along the big road.
    const track = [P.box(120, 0.6, 3.2, '#E8E2F4', { at: [-115, SKY_Y - 0.4, ONCOMING + 0.6] })]
    for (let x = -58; x > -172; x -= 12) track.push(P.cyl(0.4, 0.5, SKY_Y - 0.7, '#D8D2E6', { at: [x, (SKY_Y - 0.7) / 2, ONCOMING + 0.6] }))
    this.road.add(solid(merge(track), bag, 2))
    // Little flower pots along the back of our sidewalk (they whizz past low in front; nothing tall hides the car).
    const near = []
    for (let x = x0 - 6, j = 0; x > x1; x -= 11, j++) near.push(P.cyl(0.22, 0.17, 0.32, '#EBA27E', { at: [x, 0.16, CURB + 2.7] }), P.sphere(0.24, j % 2 ? '#7FCB8F' : PAL.pink, { at: [x, 0.42, CURB + 2.7] }))
    this.road.add(solid(merge(near), bag, 2))
    // The airport across the road at the end: a long lavender hall with a wavy roof and big windows.
    const air = [P.box(70, 7, 12, '#E3DAFF', { at: [-END - 5, 3.5, HOUSES - 6] }), P.box(66, 4, 0.1, '#BFE0F5', { at: [-END - 5, 3.2, HOUSES + 0.02] })]
    for (let k = 0; k < 7; k++) air.push(P.cyl(4.6, 4.6, 12.4, '#D9CCFF', { at: [-END - 5 + (k - 3) * 9.6, 7, HOUSES - 6], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.35] }))
    air.push(P.rbox(9, 0.3, 4.2, 0.1, PAL.lavenderDark, { at: [-END - 0.7, 3.4, CURB + 1.6] }), ...[-1, 1].map((s) => P.cyl(0.12, 0.12, 3.3, '#D8D2E6', { at: [-END - 0.7 + s * 4, 1.65, CURB + 2.9] })))
    this.road.add(solid(merge(air), bag, 2))

    // ---- Things to wave at ----
    // On the sidewalk across the road: the cat on a step, the mango sticky rice cart.
    this.statics.cat = this.thing('cat', [P.capsule(0.16, 0.34, '#FFB677', { at: [0, 0.3, 0], rot: [0, 0, Math.PI / 2] }), P.sphere(0.16, '#FFB677', { at: [0.32, 0.42, 0] }), P.cone(0.06, 0.12, '#FFB677', { at: [0.34, 0.6, 0.08] }), P.cone(0.06, 0.12, '#FFB677', { at: [0.34, 0.6, -0.08] }), P.box(0.5, 0.14, 0.6, PAL.cream, { at: [0, 0.07, 0] })], [-22, 0.1, FAR - 1.2])
    this.statics.cart = this.thing('cart', [
      P.rbox(1.4, 0.7, 0.8, 0.08, PAL.butter, { at: [0, 0.75, 0] }),
      P.rbox(1.6, 0.08, 1.0, 0.04, PAL.hotpink, { at: [0, 1.95, 0] }),
      ...[-0.7, 0.7].map((x) => P.cyl(0.03, 0.03, 0.85, PAL.cream, { at: [x, 1.5, 0.4] })),
      ...[-0.5, 0.5].map((x) => P.torus(0.22, 0.06, PAL.ink, { at: [x, 0.22, 0.42] })),
      ...[-0.35, 0, 0.35].map((x) => P.sphere(0.12, '#FFB83D', { at: [x, 1.2, 0.1], scale: [1.3, 0.8, 0.9] })),
      // The vendor beside it.
      P.capsule(0.2, 0.45, '#8FC9F5', { at: [0.95, 0.65, 0.1] }),
      P.sphere(0.22, '#FFE0C4', { at: [0.95, 1.3, 0.1] }),
      P.cone(0.32, 0.18, '#E9C77B', { at: [0.95, 1.55, 0.1] }),
    ], [-CART_AT, 0.1, FAR - 1.3])
    // Across the road: the golden temple roof (sacred: it never wobbles, it glows and a soft bell rings).
    this.statics.temple = this.thing('temple', [
      P.box(16, 1.6, 0.4, PAL.cream, { at: [0, 0.8, 0] }),
      P.box(9, 4, 6, PAL.cream, { at: [0, 2, -4] }),
      P.box(10, 0.6, 7, '#E2525C', { at: [0, 4.3, -4], rot: [0, 0, 0] }),
      P.cone(5.8, 3.0, '#E2525C', { at: [0, 6.0, -4], rot: [0, Math.PI / 4, 0], scale: [1.35, 1, 0.9] }, 4),
      P.cone(4.2, 2.6, PAL.gold, { at: [0, 7.8, -4], rot: [0, Math.PI / 4, 0], scale: [1.35, 1, 0.9] }, 4),
      P.cone(0.35, 2.2, PAL.gold, { at: [0, 10.1, -4] }),
      ...[-1, 1].map((s) => P.cone(0.18, 1.0, PAL.gold, { at: [s * 4.9, 5.2, -4], rot: [0, 0, -s * 0.5] })),
    ], [-TEMPLE_AT, 0, FAR - 3.4])
    // Low enough that its golden roof shows over the car.
    this.statics.temple.scale.setScalar(0.62)
    // Moving ones (where they are relative to the car, so each stays on screen long enough to wave at).
    // Uncle Bird rides alongside on his motorbike for the first bit, then turns off.
    this.movers.bird = this.mover('bird', motorbike(bag, '#FF7FA8', [['#94A0C8', '#FFB896']]), 0, 13, 0.6, 22, GAP, false, 3)
    this.movers.tuk = this.mover('tuk', tukTuk(bag), 12, 26, 15, -15, LANE2)
    this.movers.family = this.mover('family', motorbike(bag, PAL.mint, [['#FFE0C4', '#FF8FB8'], ['#FFE0C4', PAL.butter], ['#FFE0C4', PAL.sky]], true), 15, 30, 13, -10, GAP)
    this.movers.taxi = this.mover('taxi', taxi(bag), 22, 36, -16, 14, LANE2)
    // The skytrain runs the other way on its own track overhead (world meters, not next to the car).
    this.movers.train = this.mover('train', train(bag), 19, 27, -127, -89, ONCOMING + 0.6, true)
    this.movers.train.g.position.y = SKY_Y - 0.1
  }

  private thing(id: OutId, parts: ReturnType<typeof P.box>[], at: V3) {
    const g = new Group()
    g.position.set(...at)
    g.add(solid(merge(parts), this.bag, 2))
    g.userData.pick = `out:${id}`
    this.road.add(g)
    return g
  }
  private mover(id: OutId, g: Group, t0: number, t1: number, from: number, to: number, z: number, world = false, ease = 1): Mover {
    g.userData.pick = `out:${id}`
    g.visible = false
    this.road.add(g)
    return { g, t0, t1, from, to, z, world, ease, react: -1 }
  }

  // ---------------------------------------------------------------- touch

  protected pickRoots(): Object3D[] {
    return [this.car.root, this.road]
  }

  protected onTap(id: string | null) {
    const k = this.riders.kaylee
    switch (id) {
      case 'belt':
        if (!this.ride.belt) this.buckle()
        else {
          sfx.latch()
          k.react('wiggle')
        }
        return
      case 'window':
        this.win.down = !this.win.down
        this.counts.windows++
        sfx.fwip()
        if (this.win.down) sfx.whoosh(0.6)
        return
      case 'radio':
        this.toggleRadio()
        return
      case 'snacks':
        this.munch = 0
        sfx.crunch()
        k.react('hop')
        return
      case 'garland':
        this.garlandSwing.v += 5
        sfx.ding()
        return
      case 'horn':
      case 'family:sri':
        sfx.beep()
        this.riders.sri.react('hop')
        this.counts.horns++
        if (!this.told.has('horn')) {
          this.told.add('horn')
          this.events.say(TALK.car.horn)
        }
        return
      case 'family:nick':
        this.dadTurn = 0
        this.riders.nick.react('hop')
        sfx.boing()
        setTimeout(() => k.react('hop'), 500)
        return
      case 'family:ji':
        this.cuddle = 0
        sounds.sparkle()
        return
      case 'family:kaylee':
        k.react('hop')
        sfx.boing()
        return
    }
    if (id?.startsWith('out:')) this.wave(id.slice(4) as OutId)
  }

  private buckle() {
    this.ride.belt = true
    this.car.belt.visible = true
    sfx.latch()
    this.riders.kaylee.react('wiggle')
  }

  /** She waves at something outside, and it answers. */
  private wave(id: OutId) {
    const k = this.riders.kaylee
    const target = this.movers[id]?.g ?? this.statics[id]
    if (!target) return
    target.getWorldPosition(tmp)
    k.lookAt(tmp.x, tmp.y, tmp.z)
    k.react('wave')
    this.counts.waves++
    const m = this.movers[id]
    if (m) m.react = 0
    if (id !== 'temple') this.wiggles.set(id, 0)
    switch (id) {
      case 'bird':
        sfx.toot()
        break
      case 'tuk':
        sfx.toot()
        this.events.say(TALK.car.tuk)
        break
      case 'family':
        sfx.beep()
        setTimeout(() => sfx.woof(), 300)
        break
      case 'taxi':
        sfx.beep()
        break
      case 'cart':
        sfx.ding()
        break
      case 'cat':
        sfx.meow()
        break
      case 'train':
        sfx.whoosh(1.2)
        break
      case 'temple':
        sfx.ding()
        if (!this.told.has('temple')) {
          this.told.add('temple')
          this.events.say(TALK.car.temple)
        }
        break
    }
  }

  private toggleRadio() {
    const r = this.radio
    r.on = !r.on
    this.counts.radios++
    sfx.pop()
    if (r.timer) clearInterval(r.timer)
    r.timer = 0
    if (!r.on) return
    // A bouncy little Thai-pop loop (pentatonic), four beats a second.
    const melody = [0, 2, 4, 7, 4, 2, 9, 7, 4, 7, 9, 12, 9, 7, 4, 2]
    r.timer = setInterval(() => {
      if (this.radio.skip > 0) return
      const n = melody[r.step % melody.length]
      const f = 392 * 2 ** (n / 12)
      tone(f, f, 0.16, 0.05, 'triangle')
      if (r.step % 2 === 0) tone(98, 90, 0.12, 0.06, 'sine')
      if (r.step % 4 === 2) noise(0.05, 0.03, 'highpass', 6000, 5000)
      r.step++
    }, 250)
  }

  // ---------------------------------------------------------------- per frame

  protected step(dt: number, t: number) {
    const ride = this.ride
    const { car } = this
    // ---- The drive: it sets off once her seatbelt clicks (or Mommy clicks it), and never waits after that ----
    if (ride.t < 0) {
      ride.beltT += dt
      if (ride.belt && ride.beltT > 0.6) ride.t = 0
      else if (!ride.belt && ride.beltT > BELT_WAIT) {
        this.riders.ji.react('wiggle')
        this.buckle()
      }
    } else ride.t += dt * this.pace
    const s = along(ride.t)
    ride.v = dt > 0 ? (s - ride.s) / dt : 0
    ride.s = s
    car.root.position.set(-s, 0, 0)
    for (const w of car.wheels) w.rotation.x = s / 0.3
    // Bounce: a little road hum, and the speed bump halfway (everyone hops; the radio skips).
    if (this.bumpT >= 1 && s > BUMP_AT - 0.5 && s < BUMP_AT + 1) {
      this.bumpT = 0
      sfx.thump()
      if (this.radio.on) {
        this.radio.skip = 0.45
        noise(0.2, 0.08, 'bandpass', 3000, 600)
      }
    }
    this.radio.skip = Math.max(0, this.radio.skip - dt)
    this.bumpT = Math.min(1, this.bumpT + dt / 0.6)
    car.body.position.y = Math.abs(Math.sin(s * 1.7)) * 0.012 * clamp(ride.v / 4, 0, 1) + bell(this.bumpT) * 0.12
    car.body.rotation.z = bell(this.bumpT) * 0.03
    if (ride.t >= 0 && !this.told.has('left') && ride.t > 7) {
      this.told.add('left')
      this.events.say(TALK.car.left)
    }

    // ---- The window: it slides down, and the wind comes in; at full speed Kaylee's mane ends up in Mommy's face ----
    this.win.k = clamp(this.win.k + (this.win.down ? dt : -dt) / 0.45)
    car.window.position.y = -0.42 * this.win.k
    if (this.win.k > 0.6 && ride.v > 2) {
      car.window.getWorldPosition(tmp)
      if (Math.random() < dt * 25) this.wind.emit(tmp.x - 0.4 + Math.random() * 0.8, 1.25 + Math.random() * 0.2, 0.75, 0.6, 0.1, 0.3, 0.6, 0.06)
      if (ride.v > 5.5 && !this.win.blown) {
        this.win.blown = true
        this.riders.ji.react('wiggle')
        this.events.say(TALK.car.mane)
      }
    }
    this.wind.update(dt)

    // ---- Everyone in the car: bob to the radio, Daddy turns round, a cuddle ----
    const beat = this.radio.on && this.radio.skip <= 0 ? Math.abs(Math.sin(t * Math.PI * 2)) : 0
    for (const id of ['kaylee', 'ji', 'nick', 'sri'] as const) {
      const seat = car.seats[id]
      seat.position.y = 0.7 + beat * 0.05 + bell(this.bumpT) * 0.1
      seat.rotation.z = beat * 0.06 * (id === 'kaylee' || id === 'nick' ? 1 : -1)
    }
    this.dadTurn = Math.min(1, this.dadTurn + dt / 1.6)
    car.seats.nick.rotation.y = Math.PI * bell(this.dadTurn) * 0.85
    this.cuddle = Math.min(1, this.cuddle + dt / 1.4)
    car.seats.kaylee.rotation.z += -bell(this.cuddle) * 0.25
    car.seats.ji.rotation.z += bell(this.cuddle) * 0.2
    this.munch = Math.min(1, this.munch + dt / 0.8)
    car.snacks.scale.setScalar(0.85 * (1 + Math.sin(this.munch * Math.PI * 6) * 0.08 * (1 - this.munch)))
    // The garland swings with the road and when she taps it.
    const gs = this.garlandSwing
    gs.v += (-gs.a * 30 - gs.v * 2.5 + (ride.v > 0.5 ? Math.sin(t * 3) * 0.6 : 0) + bell(this.bumpT) * 8) * dt
    gs.a += gs.v * dt
    car.garland.rotation.z = gs.a
    for (const c of Object.values(this.riders)) c.update(dt, t)

    // ---- Outside ----
    // (Before they set off, Uncle Bird is already there beside her window.)
    const rt = Math.max(0, ride.t)
    for (const [id, m] of Object.entries(this.movers) as [OutId, Mover][]) {
      const on = rt >= m.t0 && rt <= m.t1
      m.g.visible = on
      if (!on) continue
      const k = ((rt - m.t0) / (m.t1 - m.t0)) ** m.ease
      m.g.position.x = (m.world ? 0 : -s) + m.from + (m.to - m.from) * k
      m.g.position.z = m.z
      if (!m.world) m.g.position.y = Math.abs(Math.sin(t * 9 + m.z)) * 0.02
      if (m.react >= 0) {
        m.react += dt / 0.8
        m.g.position.y += bell(Math.min(1, m.react)) * 0.25
        if (m.react >= 1) m.react = -1
      }
      if (id === 'train' && k > 0.35 && !this.told.has('train')) {
        this.told.add('train')
        sfx.whoosh(1.6)
      }
    }
    for (const [id, w] of this.wiggles) {
      const g = this.statics[id as OutId]
      const nw = Math.min(1, w + dt / 0.6)
      this.wiggles.set(id, nw)
      if (g) g.scale.y = 1 + wobble(nw, 2) * 0.12
    }
    this.glow.visible = s > END - 40
    this.glow.scale.setScalar(1 + Math.sin(t * 3) * 0.06)

    // ---- The drop-off: Aunty Sri hugs them goodbye, and they hop out ----
    if (ride.t >= RIDE_S && this.ending < 0) {
      this.ending = 0
      this.riders.sri.react('hop')
      this.events.say(TALK.car.end)
      if (this.radio.on) this.toggleRadio()
    }
    if (this.ending >= 0) {
      const before = this.ending
      this.ending += dt
      if (before < 1.4 && this.ending >= 1.4) {
        const hopOut: ['kaylee' | 'ji' | 'nick', number][] = [['kaylee', 0.8], ['nick', 2.2], ['ji', -0.6]]
        hopOut.forEach(([id, dx], i) => this.hop(this.riders[id], this.scene, new Vector3(-s + dx, 0.1, CURB + 0.9), { delay: i * 0.25, face: 0, arc: 0.9 }))
      }
      if (before < 3.2 && this.ending >= 3.2) this.events.done('airport')
    }
  }

  // ---------------------------------------------------------------- camera, anchors

  protected shot(): Shot {
    const s = this.ride.s
    const tall = this.w < this.h
    // From the curb side, a little ahead of the car: Daddy in front, Kaylee by her window at the back, side by side.
    return { center: new Vector3(-s - 0.3, tall ? 1.6 : 1.45, -0.6), half: tall ? new Vector3(2.15, 1.3, 1.2) : new Vector3(2.9, 1.4, 1.1), yaw: -8, pitch: tall ? 16 : 13, minDist: 6 }
  }

  protected anchorAt(id: string): AnchorSpot | null {
    const car = this.car
    const at = (o: Object3D, dy = 0) => o.getWorldPosition(new Vector3()).setY(o.getWorldPosition(tmp).y + dy)
    if (this.ending >= 1.4) return null
    switch (id) {
      case 'belt':
        return { at: at(car.buckle), r: 0.16, glow: !this.ride.belt, prio: 3 }
      case 'window':
        // The top edge of the glass (her face is below it, and the buckle by her hip).
        return { at: at(car.window, 1.32 - 0.42 * this.win.k), r: 0.24 }
      case 'radio':
        return { at: at(car.radio), r: 0.16, prio: 3 }
      case 'snacks':
        return { at: at(car.snacks, 0.12), r: 0.16, prio: 3 }
      // The garland hangs right over the wheel from here: its target at the mirror, the horn's down on the wheel.
      case 'garland':
        return { at: at(car.garland, 0.08), r: 0.12, prio: 3 }
      case 'horn':
        return { at: at(car.horn, -0.16), r: 0.12, prio: 3 }
    }
    if (id.startsWith('family:')) {
      const c = this.riders[id.slice(7) as keyof CarRide['riders']]
      if (!c) return null
      // Their heads (the radio, the buckle and the window are lower down).
      return { at: at(c.root, c.height * 0.78), r: c.height * 0.24, max: 110 }
    }
    if (id.startsWith('out:')) {
      const o = id.slice(4) as OutId
      const g = this.movers[o]?.g ?? this.statics[o]
      if (!g || !g.visible) return null
      const big = o === 'temple' ? 4 : o === 'train' ? 5 : 1.1
      // Over the window and the people where they overlap: they're only going by for a moment.
      return { at: at(g, o === 'temple' ? 6 * 0.62 : o === 'train' ? 0.8 : 0.9), r: big, max: 170, prio: 3 }
    }
    return null
  }

  /** Only the seatbelt, before they set off: the ride itself can't get stuck. */
  protected hintAt() {
    return this.ride.belt ? null : this.car.buckle.getWorldPosition(new Vector3())
  }

  qa() {
    return { leg: 'car', t: Math.round(this.ride.t * 10) / 10, along: Math.round(this.ride.s), speed: Math.round(this.ride.v * 10) / 10, belt: this.ride.belt, window: this.win.down, radio: this.radio.on, ending: this.ending >= 0, touches: this.touches, ...this.counts }
  }

  dispose() {
    if (this.radio.timer) clearInterval(this.radio.timer)
    super.dispose()
  }
}

// ---- The traffic, greybox toys facing -x (the way the car drives) ----

function motorbike(bag: Bag, color: string, riders: [string, string][], dog = false) {
  const g = new Group()
  const wheel = (x: number) => P.torus(0.24, 0.08, PAL.ink, { at: [x, 0.26, 0] })
  const parts = [wheel(-0.6), wheel(0.6), P.rbox(1.1, 0.3, 0.34, 0.12, color, { at: [0, 0.52, 0] }), P.rbox(0.18, 0.55, 0.24, 0.06, color, { at: [-0.55, 0.72, 0], rot: [0, 0, 0.35] })]
  riders.forEach(([skin, shirt], i) => {
    const x = -0.15 + i * 0.32
    const s = i === 0 ? 1 : 0.8
    parts.push(P.capsule(0.15 * s, 0.24 * s, shirt, { at: [x, 0.95 * s + 0.1, 0] }), P.sphere(0.17 * s, skin, { at: [x, 1.38 * s + 0.1, 0] }), P.sphere(0.18 * s, i === 0 ? PAL.hotpink : PAL.lavenderDark, { at: [x, 1.46 * s + 0.12, 0], scale: [1, 0.7, 1] }))
  })
  if (dog) parts.push(P.rbox(0.36, 0.22, 0.32, 0.05, '#C99A6E', { at: [-0.85, 0.85, 0] }), P.sphere(0.12, '#E9C79E', { at: [-0.88, 1.05, 0] }), P.sphere(0.05, PAL.ink, { at: [-0.99, 1.04, 0] }))
  g.add(solid(merge(parts), bag, 2))
  return g
}

function tukTuk(bag: Bag) {
  const g = new Group()
  const wheel = (x: number, z: number) => P.torus(0.2, 0.08, PAL.ink, { at: [x, 0.28, z] })
  g.add(solid(merge([wheel(-0.85, 0), wheel(0.6, -0.55), wheel(0.6, 0.55), P.rbox(2.1, 0.5, 1.2, 0.12, PAL.sky, { at: [0, 0.62, 0] }), P.rbox(0.7, 0.55, 0.9, 0.12, '#FF7FA8', { at: [-0.75, 1.1, 0] }), P.rbox(1.2, 0.5, 1.15, 0.1, PAL.lavender, { at: [0.4, 1.1, 0] }), P.rbox(2.3, 0.12, 1.4, 0.06, PAL.hotpink, { at: [0.1, 1.95, 0] }), ...[[-1.05, 0.62], [-1.05, -0.62], [1.1, 0.62], [1.1, -0.62]].map(([x, z]) => P.cyl(0.035, 0.035, 0.95, PAL.cream, { at: [x, 1.45, z] })), P.capsule(0.15, 0.2, '#FFB896', { at: [-0.7, 1.45, 0] }), P.sphere(0.17, '#FFE0C4', { at: [-0.7, 1.85, 0] })]), bag, 2))
  return g
}

function taxi(bag: Bag) {
  const g = new Group()
  const wheel = (x: number, z: number) => P.torus(0.26, 0.09, PAL.ink, { at: [x, 0.26, z], rot: [0, 0, 0] })
  g.add(solid(merge([...[-0.75, 0.75].flatMap((x) => [wheel(x, -0.66), wheel(x, 0.66)]), P.rbox(2.6, 0.6, 1.4, 0.2, '#FF8FB8', { at: [0, 0.62, 0] }), P.rbox(1.4, 0.5, 1.3, 0.2, '#FF8FB8', { at: [0.1, 1.12, 0] }), P.box(1.2, 0.34, 1.32, '#CDEBFF', { at: [0.1, 1.14, 0] }), P.rbox(0.6, 0.16, 0.3, 0.05, PAL.butter, { at: [0.1, 1.45, 0] })]), bag, 2))
  return g
}

function train(bag: Bag) {
  const g = new Group()
  const parts = []
  for (let i = 0; i < 3; i++) parts.push(P.rbox(9.6, 1.7, 2.6, 0.5, '#F4F1FA', { at: [i * 10, 0.85, 0] }), P.box(9.4, 0.25, 2.62, PAL.hotpink, { at: [i * 10, 0.4, 0] }), P.box(8.6, 0.6, 2.64, '#A8DCFF', { at: [i * 10, 1.15, 0] }))
  g.add(solid(merge(parts), bag, 2))
  return g
}

function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
