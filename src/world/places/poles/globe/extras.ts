// The hub's step 3 and the things to poke on the globe (hub greybox 2, globe.ts owns the globe itself).
//
// The lost one: once she has dragged the sun, a penguin (or a polar bear cub) turns up adrift on a little iceberg in the
// warm middle of the world, fanning itself. She grabs it and carries it to the top or the bottom of the globe. Its own
// pole: it lands by its friend, they both hop and wave. The wrong pole: it looks round ("where is everybody?"), shivers,
// its friend's pole glows, and it hops back onto its berg to be carried again. Never an "oops". Then the next one.
//
// The pokes: the North Pole's striped marker wobbles, a seal pops out of its breathing hole and barks, the science
// station's door opens and a scientist waves, a whale surfaces and spouts, a tap on the empty sky bursts snowflakes.
// (The lights in the night sky are globe.ts's: they flare when tapped.) Placeholder shapes until the art gate.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, Object3D, Quaternion, Sprite, SpriteMaterial, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three'
import { bell, clamp, smooth, sounds, span, wobble } from '../../../../sdk'
import { knobs, watch } from '../../../kit/knobs'
import { sfx, tone } from '../../../kit/sfx'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { ll } from './earth'
import type { Critter } from './globe'

/** How carrying the lost one feels (live in the feel lab: ?feel=1 on the hub's `lost` link). */
export const CARRY = knobs('carry', 'Carry it home', 'src/world/places/poles/globe/extras.ts', {
  follow: { value: 18, min: 2, max: 40, step: 1, label: 'Follow her finger', unit: '/s', note: 'how tightly it sticks to her finger while carried (lower = it trails behind)' },
  deadZone: { value: 14, min: 0, max: 60, step: 1, label: 'Dead zone', unit: 'px', note: 'how far her finger must move before it counts as carried (less is a tap: it hops and goes back on its berg)' },
  poleReach: { value: 0.45, min: 0.1, max: 0.9, step: 0.05, label: 'Pole reach', unit: '× radius', note: 'how far above (or below) the globe’s middle she must let go for it to land on that pole' },
  next: { value: 3, min: 0.5, max: 10, step: 0.5, label: 'Next one after', unit: 's', note: 'how long until the next lost one turns up after one is home' },
})

export type Lost = 'penguin' | 'bear'
export type PokeId = 'lost' | 'marker' | 'seal' | 'station' | 'whale'

/** What the extras need from the globe. */
export interface ExtrasHost {
  bag: Bag
  /** The Earth's frame (latitude and longitude, turning with her finger). */
  spin: Group
  /** The scene's root (things in flight between the globe and her finger). */
  world: Object3D
  camera: PerspectiveCamera
  /** A shape in the globe's light with an ink outline. */
  prop(geometry: BufferGeometry, px?: number): Group
  /** A new penguin or polar bear cub, like Pebble and Pola. */
  make(kind: Lost): Critter
  /** Pebble (for a penguin) or Pola (for a bear). */
  friend(kind: Lost): Critter
  /** How far from the center the ground is at this latitude (Antarctica's ice stands high). */
  ground(lat: number): number
  /** Turn the globe to show a pole (or back to the whole globe: null). */
  show(pole: 'north' | 'south' | null): void
  /** Something happened worth telling the screen around. */
  lost(kind: Lost | null): void
  saved(kind: Lost, home: boolean): void
}

const DEG = Math.PI / 180
const UP = new Vector3(0, 1, 0)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tq = new Quaternion()
const tq2 = new Quaternion()

/** Stands something on the globe at a latitude and longitude, `r` from the center, feet down. */
function standOn(o: { position: Vector3; quaternion: Quaternion }, lat: number, lon: number, r: number) {
  ll(lat, lon, r, o.position)
  o.quaternion.setFromUnitVectors(UP, tmp.copy(o.position).normalize())
}

/** Warm open ocean near the middle of the world, where a lost berg can drift: [lat, lon]. */
const SEAS: [number, number][] = [
  [4, -28],
  [-6, -15],
  [2, -150],
  [-8, -120],
  [6, 170],
  [-10, 75],
  [8, 62],
  [-4, -100],
]
/** Where the home pole's crowd stands (degrees from the pole), and how many stay before the oldest wanders off. */
const HOME_FROM_POLE = 7
const HOME_MAX = 3
/** The lost one's berg is drawn bigger than the critters at the poles (it's far down the globe's face), and its rider. */
const BERG = 1.6
const BERG_RIDER = 0.85
/** No touch on the lost one for this long: it waves its arms ("over here!"). */
const WAVE_S = 6

type LostState = 'drift' | 'held' | 'fly' | 'wrong' | 'back' | 'home'

interface LostOne {
  kind: Lost
  c: Critter
  berg: Group
  /** The berg's spot on the globe. */
  lat: number
  lon: number
  state: LostState
  t: number
  /** Flying: from (in the scene) to (on the globe, in the Earth's frame). */
  from: Vector3
  to: { lat: number; lon: number; r: number; pole: 'north' | 'south' }
  /** Moved enough while held to count as carried (a tap only lifts it). */
  moved: boolean
  waveAt: number
}

export class GlobeExtras {
  private lost: LostOne | null = null
  private nextIn = -1
  private order: Lost[]
  private crowd: Record<Lost, Critter[]> = { penguin: [], bear: [] }
  /** Ones that wandered off, kept to ride the next berg (so endless rescues don't keep building new shapes). */
  private spare: Record<Lost, Critter[]> = { penguin: [], bear: [] }
  private berg: Group | null = null
  private unwatch: () => void
  /** For the feel lab's graph: her finger and the carried one, in screen pixels. */
  finger = { x: 0, y: 0 }
  carried = { x: 0, y: 0 }
  private glow: { s: Sprite; t: number; pole: 'north' | 'south' }
  private question: Sprite
  private held = new Vector3()
  private time = 0
  saves = 0

  // ---- The pokes.
  private marker = new Group()
  private markerTip = new Group()
  private markerAng = 0
  private markerVel = 0
  private seal = new Group()
  private sealHead = new Group()
  private sealT = -1
  private sealAuto = 9
  private station = new Group()
  private door = new Group()
  private scientist = new Group()
  private sciArm = new Group()
  private stationT = -1
  private whale = new Group()
  private whaleBody = new Group()
  private tail = new Group()
  private whaleT = -1
  private whaleAuto = 4
  private puffs: { s: Sprite; v: Vector3; t: number; life: number; spin: number }[] = []
  private flakes: { s: Sprite; v: Vector3; t: number; spin: number }[] = []
  private puffMat: SpriteMaterial
  private flakeMat: SpriteMaterial

  constructor(
    private host: ExtrasHost,
    start: Lost | null,
  ) {
    const { bag } = host
    this.order = start === 'bear' ? ['bear', 'penguin'] : ['penguin', 'bear']
    if (start) this.nextIn = 0.4
    this.puffMat = bag.add(new SpriteMaterial({ map: bag.add(puffTexture()), transparent: true, depthWrite: false }))
    this.flakeMat = bag.add(new SpriteMaterial({ map: bag.add(flakeTexture()), transparent: true, depthWrite: false }))
    const glow = new Sprite(bag.add(new SpriteMaterial({ map: bag.add(glowTexture()), transparent: true, depthWrite: false, opacity: 0 })))
    glow.visible = false
    host.spin.add(glow)
    this.glow = { s: glow, t: -1, pole: 'north' }
    this.question = new Sprite(bag.add(new SpriteMaterial({ map: bag.add(questionTexture()), transparent: true, depthWrite: false })))
    this.question.visible = false
    host.world.add(this.question)
    this.buildMarker()
    this.buildSeal()
    this.buildStation()
    this.buildWhale()
    this.unwatch = watch('carry', () => ({
      'finger x (px)': [this.finger.x, 1400],
      'carried x (px)': [this.carried.x, 1400],
      'finger y (px)': [this.finger.y, 1000],
      'carried y (px)': [this.carried.y, 1000],
    }))
  }

  dispose() {
    this.unwatch()
  }

  // ---------------------------------------------------------------- building

  /** The North Pole: a red-and-white striped pole with a ball on top and a pink pennant, standing on the sea ice. */
  private buildMarker() {
    const parts: BufferGeometry[] = []
    const n = 6
    const h = 0.15
    for (let i = 0; i < n; i++) parts.push(P.cyl(0.009, 0.009, h / n, i % 2 ? '#FFFFFF' : '#FF6B8A', { at: [0, (h / n) * (i + 0.5), 0] }))
    parts.push(P.sphere(0.016, PAL.gold, { at: [0, h + 0.012, 0] }))
    parts.push(P.prism([[0, 0], [0.06, -0.014], [0, -0.03]], 0.004, '#FF9EC4', { at: [0.008, h - 0.006, 0] }))
    this.markerTip.add(this.host.prop(merge(parts), 1.5))
    this.marker.add(this.markerTip)
    standOn(this.marker, 90, 0, 1.02)
    this.host.spin.add(this.marker)
  }

  /** A ringed seal's breathing hole in the Arctic ice, with the seal hiding under it. */
  private buildSeal() {
    const hole = new Mesh(this.host.bag.add(P.cyl(0.03, 0.03, 0.004, '#3F6FB0', {}, 20)), this.host.bag.add(new MeshBasicMaterial({ color: '#3F6FB0' })))
    hole.scale.set(1, 1, 0.75)
    hole.position.y = 0.002
    const grey = '#9AA3B8'
    this.sealHead.add(
      this.host.prop(
        merge([
          P.capsule(0.022, 0.03, grey, { at: [0, 0.03, 0] }),
          P.sphere(0.013, '#B9C0D0', { at: [0, 0.045, 0.019], scale: [1.2, 0.8, 1] }),
          P.sphere(0.0045, PAL.ink, { at: [0, 0.05, 0.031] }),
          P.sphere(0.005, PAL.ink, { at: [0.01, 0.062, 0.017] }),
          P.sphere(0.005, PAL.ink, { at: [-0.01, 0.062, 0.017] }),
        ]),
        1.5,
      ),
    )
    this.sealHead.position.y = -0.07
    this.seal.add(hole, this.sealHead)
    standOn(this.seal, 80, -20, 1.021)
    this.host.spin.add(this.seal)
  }

  /** A little science station on Antarctica's ice: an orange hut with a door, an antenna, and a scientist inside. */
  private buildStation() {
    const hut = this.host.prop(
      merge([
        P.rbox(0.08, 0.045, 0.05, 0.008, '#FF9E6B', { at: [0, 0.0225, 0] }),
        P.rbox(0.088, 0.012, 0.058, 0.005, '#FFFFFF', { at: [0, 0.05, 0] }),
        P.cyl(0.002, 0.002, 0.05, PAL.ink, { at: [0.03, 0.08, -0.01] }),
        P.sphere(0.005, '#FF6B8A', { at: [0.03, 0.106, -0.01] }),
        P.box(0.016, 0.012, 0.002, '#BDE6FF', { at: [0.022, 0.028, 0.026] }),
      ]),
      1.5,
    )
    // The door hinges on its left edge.
    this.door.position.set(-0.024, 0, 0.026)
    this.door.add(this.host.prop(P.box(0.018, 0.032, 0.003, '#FFD84D', { at: [0.009, 0.016, 0] }), 1.2))
    const coat = '#FF4F7B'
    this.scientist.add(
      this.host.prop(
        merge([
          P.capsule(0.009, 0.012, coat, { at: [0, 0.017, 0] }),
          P.sphere(0.009, '#FFD9C2', { at: [0, 0.038, 0] }),
          P.sphere(0.01, coat, { at: [0, 0.042, -0.002], scale: [1.05, 0.8, 1.05] }),
          P.sphere(0.0025, PAL.ink, { at: [0.004, 0.039, 0.008] }),
          P.sphere(0.0025, PAL.ink, { at: [-0.004, 0.039, 0.008] }),
        ]),
        1.2,
      ),
    )
    this.sciArm.position.set(0.009, 0.026, 0)
    this.sciArm.add(this.host.prop(P.capsule(0.0035, 0.01, coat, { at: [0, -0.008, 0] }), 1))
    this.scientist.add(this.sciArm)
    this.scientist.position.set(-0.015, 0, 0.01)
    this.scientist.visible = false
    this.station.add(hut, this.door, this.scientist)
    // On the high ice dome (globe.ts's Antarctica stands about 1.08 here).
    standOn(this.station, -84, 35, 1.078)
    this.host.spin.add(this.station)
  }

  /** A humpback whale in the warm ocean between: its back comes up through the sea, it spouts, then its tail. */
  private buildWhale() {
    const blue = '#5B6FA8'
    this.whaleBody.add(
      this.host.prop(
        merge([
          P.sphere(0.06, blue, { scale: [1, 0.42, 0.5] }),
          P.sphere(0.012, '#C9D3F0', { at: [0.035, -0.006, 0.021], scale: [1.4, 0.6, 0.6] }),
          P.sphere(0.0045, PAL.ink, { at: [0.042, 0.004, 0.028] }),
          P.sphere(0.0045, PAL.ink, { at: [0.042, 0.004, -0.028] }),
        ]),
        1.5,
      ),
    )
    this.tail.add(this.host.prop(merge([P.cyl(0.006, 0.01, 0.04, blue, { at: [0, 0.02, 0] }), P.sphere(0.03, blue, { at: [0, 0.042, 0], scale: [0.35, 0.3, 1.1] })]), 1.5))
    this.tail.position.set(-0.07, -0.06, 0)
    this.whale.add(this.whaleBody, this.tail)
    this.whaleBody.position.y = -0.04
    // (Bigger than life next to the berg and the friends: it's seen from above, far down the globe's face.)
    this.whale.scale.setScalar(1.8)
    standOn(this.whale, -22, -18, 1)
    this.host.spin.add(this.whale)
  }

  // ---------------------------------------------------------------- the lost one

  /** Has a lost one (or is about to). */
  get active() {
    return !!this.lost || this.nextIn >= 0
  }
  get kind() {
    return this.lost?.kind ?? null
  }
  get holding() {
    return this.lost?.state === 'held'
  }
  get busy() {
    return !!this.lost || this.sealT >= 0 || this.stationT >= 0 || this.whaleT >= 0 || this.puffs.length > 0 || this.flakes.length > 0 || Math.abs(this.markerVel) > 0.01
  }

  /** Step 3 begins (the sun's been dragged): the first lost one turns up soon. */
  begin() {
    if (!this.active && this.saves === 0) this.nextIn = 2.5
  }

  /** The sea the camera looks at most squarely (so the berg turns up where she can see it). */
  private seaInFront() {
    this.host.spin.worldToLocal(tmp.copy(this.host.camera.position))
    tmp.normalize()
    let best = SEAS[0]
    let bestDot = -2
    for (const s of SEAS) {
      const d = ll(s[0], s[1], 1, tmp2).dot(tmp)
      if (d > bestDot) {
        bestDot = d
        best = s
      }
    }
    return best
  }

  /** A berg drifting on the globe's face, `lift` above the sea. It stands up toward the top of the screen rather than out
   *  of the globe (seen from the middle, the sea faces her, and a berg stood on it would show only its top). */
  private place(berg: Group, lat: number, lon: number, lift = 0) {
    const spin = this.host.spin
    ll(lat, lon, 1, berg.position)
    const n = tmp.copy(berg.position)
    // The screen's up, in the Earth's frame.
    spin.getWorldQuaternion(tq2).invert()
    const up = tmp2.set(0, 1, 0).applyQuaternion(tq2)
    berg.quaternion.setFromUnitVectors(UP, up)
    // Out in front of the sea, so its bottom half doesn't sink into the globe.
    berg.position.addScaledVector(n, 0.035 + lift)
  }

  /** The longitude facing her at the moment (to land something where she sees it). */
  private lonInFront() {
    this.host.spin.worldToLocal(tmp.copy(this.host.camera.position))
    // ll(): x = -cos(phi) cos(lat), z = sin(phi) cos(lat), phi = lon + 180.
    return Math.atan2(tmp.z, -tmp.x) / DEG - 180
  }

  private spawn() {
    const kind = this.order[this.saves % 2]
    const [lat, lon] = this.seaInFront()
    const berg = (this.berg ??= this.host.prop(
      merge([P.cyl(0.05, 0.058, 0.02, '#F4FBFF', { scale: [1, 1, 0.75] }, 8), P.cone(0.03, 0.035, '#F4FBFF', { at: [-0.018, 0.026, -0.01] }, 7)]),
      1.5,
    ))
    this.place(berg, lat, lon)
    berg.scale.setScalar(0.001)
    this.host.spin.add(berg)
    const c = this.spare[kind].pop() ?? this.host.make(kind)
    c.root.scale.setScalar(BERG_RIDER)
    berg.add(c.root)
    // (A recycled one still stands where it was at its pole.)
    c.root.position.set(0, 0.01, 0)
    c.root.quaternion.identity()
    c.body.position.x = 0
    this.lost = { kind, c, berg, lat, lon, state: 'drift', t: 0, from: new Vector3(), to: { lat: 0, lon: 0, r: 1, pole: 'north' }, moved: false, waveAt: WAVE_S }
    sounds.sparkle()
    this.host.lost(kind)
  }

  /** Her finger took hold of the lost one. */
  grab() {
    const l = this.lost
    if (!l || (l.state !== 'drift' && l.state !== 'back')) return false
    l.state = 'held'
    l.moved = false
    l.t = 0
    // Off the berg, into the scene where her finger is.
    l.c.root.getWorldPosition(this.held)
    l.berg.remove(l.c.root)
    this.host.world.add(l.c.root)
    l.c.root.position.copy(this.held)
    l.c.root.quaternion.identity()
    l.c.root.scale.setScalar(1.25)
    l.c.hop()
    sounds.pickup()
    return true
  }

  /** Where her finger holds it (a point in the scene, in front of the globe). */
  drag(at: Vector3, moved: boolean) {
    const l = this.lost
    if (!l || l.state !== 'held') return
    this.held.copy(at)
    if (moved) l.moved = true
  }

  /** She let go: `pole` is the end of the globe her finger was over (or null for the middle). */
  drop(pole: 'north' | 'south' | null) {
    const l = this.lost
    if (!l || l.state !== 'held') return
    l.t = 0
    l.from.copy(l.c.root.position)
    if (!pole || !l.moved) {
      // Back onto its berg (a tap just lifts it and puts it down).
      l.state = 'back'
      if (l.moved) sfx.splash()
      return
    }
    const home = (l.kind === 'bear') === (pole === 'north')
    const from = home ? HOME_FROM_POLE : 10
    const lon = this.lonInFront() + (home ? 12 * (this.crowd[l.kind].length % 2 ? -1 : 1) * (1 + this.crowd[l.kind].length) : 0)
    const lat = pole === 'north' ? 90 - from : -90 + from
    l.to = { lat, lon, r: this.host.ground(lat), pole }
    l.state = 'fly'
    // The globe turns to show where it lands (the bottom is out of sight from the middle).
    this.host.show(pole)
    sfx.fwip()
  }

  private update(l: LostOne, dt: number, t: number) {
    l.t += dt
    const cam = this.host.camera.position
    const { c, berg } = l
    if (l.state === 'drift') {
      // The berg pops up, bobs and turns slowly; the one on it fans itself (it's hot in the middle of the world).
      berg.scale.setScalar(BERG * Math.min(1, smooth(clamp(l.t / 0.5, 0, 1)) * 1.1 - 0.1 * span(l.t, 0.5, 0.8)))
      this.place(berg, l.lat + 0.8 * Math.sin(t * 0.7), l.lon + 1.2 * Math.sin(t * 0.5), 0.006 * Math.sin(t * 1.6))
      berg.quaternion.multiply(tq.setFromAxisAngle(UP, 0.4 * Math.sin(t * 0.3)))
      if (l.t > l.waveAt) {
        l.waveAt = l.t + WAVE_S
        c.hop(true)
      }
    } else if (l.state === 'held') {
      // It follows her finger closely, legs dangling (a little sway behind the finger).
      c.root.position.lerp(this.held, 1 - Math.exp(-dt * CARRY.follow))
      c.root.rotation.z = 0.25 * Math.sin(t * 9)
    } else if (l.state === 'fly' || l.state === 'back') {
      const dur = l.state === 'fly' ? 0.65 : 0.45
      const k = smooth(clamp(l.t / dur, 0, 1))
      const goal = l.state === 'fly' ? this.host.spin.localToWorld(ll(l.to.lat, l.to.lon, l.to.r, tmp2)) : berg.localToWorld(tmp2.set(0, 0.01, 0))
      c.root.position.lerpVectors(l.from, goal, k)
      c.root.position.addScaledVector(tmp.copy(goal).normalize(), 0.25 * bell(k))
      c.root.rotation.z = 0
      if (l.t >= dur) l.state === 'fly' ? this.land(l) : this.reboard(l)
    } else if (l.state === 'wrong') {
      // Looks one way, the other way, shivers... then its own pole glows and it hops back to its berg.
      c.body.rotation.y += Math.sin(l.t * 5) * dt * 3
      c.body.position.x = l.t > 0.6 && l.t < 2.2 ? 0.004 * Math.sin(l.t * 60) : 0
      const head = c.center(tmp)
      this.question.position.copy(head).addScaledVector(tmp2.copy(head).normalize(), 0.15)
      this.question.visible = l.t > 0.35 && l.t < 2.6
      this.question.scale.setScalar(0.11 * (1 + 0.15 * wobble(clamp((l.t - 0.35) / 0.5, 0, 1), 2)))
      if (l.t > 2.6) this.leaveWrong(l)
    } else if (l.state === 'home') {
      if (l.t > 3.2) this.settle(l)
    }
    if (l.state !== 'held' && l.state !== 'fly' && l.state !== 'back') c.update(dt, t, cam)
    else {
      c.update(dt, t, cam)
      // In the air it faces her straight on.
      c.body.rotation.y = 0
    }
  }

  private land(l: LostOne) {
    const { c } = l
    this.host.world.remove(c.root)
    this.host.spin.add(c.root)
    c.root.scale.setScalar(0.85)
    standOn(c.root, l.to.lat, l.to.lon, l.to.r - 0.002)
    l.t = 0
    sfx.thump()
    const home = (l.kind === 'bear') === (l.to.pole === 'north')
    if (home) {
      l.state = 'home'
      c.hop(true)
      this.host.friend(l.kind).hop(true)
      for (const o of this.crowd[l.kind]) o.hop()
      sounds.correct()
      this.host.saved(l.kind, true)
    } else {
      l.state = 'wrong'
      // Whoever lives here jumps back: what is that?
      this.host.friend(l.kind === 'bear' ? 'penguin' : 'bear').hop()
      tone(420, 300, 0.35, 0.07, 'triangle')
      this.host.saved(l.kind, false)
    }
  }

  private leaveWrong(l: LostOne) {
    this.question.visible = false
    l.c.body.position.x = 0
    // Its own pole glows, so she knows where to take it.
    this.glow.pole = l.kind === 'bear' ? 'north' : 'south'
    this.glow.t = 0
    l.c.root.getWorldPosition(l.from)
    this.host.spin.remove(l.c.root)
    this.host.world.add(l.c.root)
    l.c.root.position.copy(l.from)
    l.c.root.quaternion.identity()
    l.c.hop()
    l.state = 'back'
    l.t = 0
    this.host.show(null)
  }

  private reboard(l: LostOne) {
    this.host.world.remove(l.c.root)
    l.berg.add(l.c.root)
    l.c.root.position.set(0, 0.01, 0)
    l.c.root.quaternion.identity()
    l.c.root.scale.setScalar(BERG_RIDER)
    l.state = 'drift'
    l.t = 1
    l.waveAt = WAVE_S
  }

  /** It stays with its friends (the oldest wanders off when there are too many), the berg melts away, the next one comes. */
  private settle(l: LostOne) {
    const crowd = this.crowd[l.kind]
    crowd.push(l.c)
    if (crowd.length > HOME_MAX) {
      const old = crowd.shift()!
      old.root.removeFromParent()
      this.spare[l.kind].push(old)
    }
    l.berg.removeFromParent()
    this.lost = null
    this.saves++
    this.nextIn = CARRY.next
    this.host.lost(null)
    this.host.show(null)
  }

  // ---------------------------------------------------------------- the pokes

  poke(id: PokeId) {
    if (id === 'lost') {
      this.lost?.c.hop(true)
      return
    }
    if (id === 'marker') {
      this.markerVel += 7 * (Math.random() < 0.5 ? -1 : 1)
      tone(1320, 1320, 0.5, 0.06, 'sine')
      tone(1760, 1760, 0.6, 0.04, 'sine', 0.08)
    } else if (id === 'seal') this.popSeal(true)
    else if (id === 'station') {
      if (this.stationT < 0) {
        this.stationT = 0
        sfx.pop()
      }
    } else if (id === 'whale') this.surface(true)
  }

  private popSeal(bark: boolean) {
    if (this.sealT >= 0 && this.sealT < 2.2) return
    this.sealT = 0
    this.sealBark = bark
    sfx.splash()
  }
  private sealBark = false

  private surface(tapped: boolean) {
    if (this.whaleT >= 0) {
      if (tapped) this.spout(2)
      return
    }
    this.whaleT = 0
    if (tapped) sfx.splash()
  }

  /** A puff of white water above the whale's blowhole. */
  private spout(n = 6) {
    const at = this.whaleBody.localToWorld(tmp.set(0.02, 0.03, 0))
    const up = this.whale.localToWorld(tmp2.set(0, 1, 0)).sub(this.whale.getWorldPosition(new Vector3())).normalize()
    for (let i = 0; i < n; i++) {
      const s = new Sprite(this.puffMat)
      s.position.copy(at)
      this.host.world.add(s)
      const v = up.clone().multiplyScalar(0.28 + Math.random() * 0.12).add(new Vector3((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.08))
      this.puffs.push({ s, v, t: 0, life: 0.7 + Math.random() * 0.3, spin: 0 })
    }
    noiseSpout()
  }

  /** A tap on the empty sky: snowflakes burst out from her finger and drift down. */
  snow(at: Vector3) {
    for (let i = 0; i < 9; i++) {
      const s = new Sprite(this.flakeMat)
      s.position.copy(at)
      s.scale.setScalar(0.001)
      this.host.world.add(s)
      const a = (i / 9) * Math.PI * 2 + Math.random() * 0.4
      const v = new Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(0.35 + Math.random() * 0.25).applyQuaternion(this.host.camera.quaternion)
      this.flakes.push({ s, v, t: 0, spin: (Math.random() - 0.5) * 6 })
    }
    sounds.sparkle()
    if (this.flakes.length > 60) for (const f of this.flakes.splice(0, this.flakes.length - 60)) f.s.removeFromParent()
  }

  // ---------------------------------------------------------------- every frame

  tick(dt: number, t: number, side: 'middle' | 'north' | 'south') {
    this.time += dt
    if (this.nextIn >= 0 && side === 'middle' && !this.lost && (this.nextIn -= dt) < 0) {
      this.nextIn = -1
      this.spawn()
    }
    if (this.lost) this.update(this.lost, dt, t)
    for (const kind of ['penguin', 'bear'] as const) for (const c of this.crowd[kind]) c.update(dt, t, this.host.camera.position)

    // The right pole glows after a wrong landing.
    const g = this.glow
    if (g.t >= 0) {
      g.t += dt
      const k = g.t < 0.3 ? g.t / 0.3 : 1 - span(g.t, 2.6, 3.4)
      ll(g.pole === 'north' ? 88 : -88, 0, g.pole === 'north' ? 1.05 : 1.1, g.s.position)
      g.s.visible = k > 0
      g.s.material.opacity = 0.85 * k * (0.75 + 0.25 * Math.sin(g.t * 9))
      g.s.scale.setScalar(0.42 + 0.05 * Math.sin(g.t * 9))
      if (g.t > 3.4) g.t = -1
    }

    // The North Pole's marker: a springy wobble.
    this.markerVel += (-90 * this.markerAng - 5 * this.markerVel) * dt
    this.markerAng += this.markerVel * dt
    this.markerTip.rotation.z = this.markerAng * 0.25
    this.markerTip.rotation.x = this.markerAng * 0.12

    // The seal: up out of its hole, a look round (and a bark when tapped), then down again. By itself now and then.
    if (side === 'north' && this.sealT < 0 && (this.sealAuto -= dt) < 0) {
      this.sealAuto = 10 + Math.random() * 6
      this.popSeal(false)
    }
    if (this.sealT >= 0) {
      const s = (this.sealT += dt)
      const up = smooth(span(s, 0, 0.3)) * (1 - smooth(span(s, 2, 2.4)))
      this.sealHead.position.y = -0.07 + 0.07 * up
      this.sealHead.rotation.y = s > 0.4 && s < 2 ? 0.6 * Math.sin((s - 0.4) * 4) : 0
      const barkAt = 0.9
      if (this.sealBark && s - dt < barkAt && s >= barkAt) bark()
      this.sealHead.scale.setScalar(this.sealBark ? 1 + 0.12 * bell(span(s, barkAt, barkAt + 0.3)) : 1)
      if (s > 2.5) this.sealT = -1
    }

    // The station: the door swings open, the scientist steps out and waves, then back in.
    if (this.stationT >= 0) {
      const s = (this.stationT += dt)
      const open = smooth(span(s, 0, 0.35)) * (1 - smooth(span(s, 3.1, 3.5)))
      this.door.rotation.y = -1.9 * open
      const out = smooth(span(s, 0.3, 0.7)) * (1 - smooth(span(s, 2.6, 3)))
      this.scientist.visible = out > 0.02
      this.scientist.position.z = 0.01 + 0.035 * out
      this.sciArm.rotation.z = s > 0.7 && s < 2.6 ? 2.3 + 0.5 * Math.sin(s * 14) : 0.2
      if (s - dt < 0.8 && s >= 0.8) tone(700, 900, 0.18, 0.05, 'triangle')
      if (s > 3.5) this.stationT = -1
    }

    // The whale: up through the sea, a spout, then down with its tail last. By itself when nobody pokes it.
    if (side === 'middle' && this.whaleT < 0 && (this.whaleAuto -= dt) < 0) {
      this.whaleAuto = 9 + Math.random() * 5
      this.surface(false)
    }
    if (this.whaleT >= 0) {
      const s = (this.whaleT += dt)
      const up = smooth(span(s, 0, 0.6)) * (1 - smooth(span(s, 2.1, 2.7)))
      this.whaleBody.position.y = -0.04 + 0.032 * up
      if (s - dt < 0.75 && s >= 0.75) this.spout()
      // The tail comes up behind as the body goes down, and slaps.
      const tail = bell(span(s, 2.2, 3.4))
      this.tail.position.y = -0.06 + 0.06 * tail
      this.tail.rotation.z = 0.4 * tail
      if (s - dt < 3.2 && s >= 3.2) sfx.splash()
      if (s > 3.5) this.whaleT = -1
    }

    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]
      p.t += dt
      p.v.multiplyScalar(Math.exp(-dt * 2.5))
      p.s.position.addScaledVector(p.v, dt)
      const k = p.t / p.life
      p.s.scale.setScalar(0.03 + 0.05 * k)
      p.s.material.opacity = 1
      if (k >= 1) {
        p.s.removeFromParent()
        this.puffs.splice(i, 1)
      }
    }
    for (let i = this.flakes.length - 1; i >= 0; i--) {
      const f = this.flakes[i]
      f.t += dt
      f.v.multiplyScalar(Math.exp(-dt * 2.2))
      f.s.position.addScaledVector(f.v, dt)
      f.s.position.y -= 0.06 * dt
      f.s.material.rotation = 0
      const k = f.t / 1.6
      f.s.scale.setScalar(0.06 * Math.min(1, f.t / 0.15) * (1 - smooth(span(k, 0.6, 1))))
      if (k >= 1) {
        f.s.removeFromParent()
        this.flakes.splice(i, 1)
      }
    }
  }

  /** Where a poke's tap target goes: the point in the scene, and whether it faces her. */
  spot(id: PokeId, out: Vector3): { facing: number; size: number } | null {
    const cam = this.host.camera.position
    const facing = (o: { getWorldPosition(v: Vector3): Vector3 }, lift: number) => {
      o.getWorldPosition(out)
      const n = tmp2.copy(out).normalize()
      out.addScaledVector(n, lift)
      return n.dot(tmp.subVectors(cam, out).normalize())
    }
    if (id === 'lost') {
      const l = this.lost
      if (!l || l.state === 'fly' || l.state === 'wrong' || l.state === 'home') return null
      if (l.state === 'held') return { facing: 1, size: 0.3 }
      return { facing: facing(l.c.root, 0.07), size: 0.3 }
    }
    if (id === 'marker') return { facing: facing(this.marker, 0.08), size: 0.22 }
    if (id === 'seal') return { facing: facing(this.seal, 0.03), size: 0.2 }
    if (id === 'station') return { facing: facing(this.station, 0.04), size: 0.22 }
    if (id === 'whale') return { facing: facing(this.whale, 0.02), size: 0.26 }
    return null
  }

  qa() {
    return { lost: this.lost ? `${this.lost.kind}:${this.lost.state}` : null, saves: this.saves, home: { penguin: this.crowd.penguin.length, bear: this.crowd.bear.length } }
  }
}

function bark() {
  tone(340, 220, 0.12, 0.08, 'square')
  tone(360, 230, 0.12, 0.07, 'square', 0.18)
}
function noiseSpout() {
  tone(900, 300, 0.4, 0.03, 'sawtooth')
}

function canvas(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  return new CanvasTexture(c)
}
/** A soft white puff of water. */
function puffTexture() {
  return canvas(64, (g) => {
    g.beginPath()
    g.arc(32, 32, 24, 0, Math.PI * 2)
    g.fillStyle = '#FFFFFF'
    g.fill()
    g.lineWidth = 4
    g.strokeStyle = '#BDE6FF'
    g.stroke()
  })
}
/** A six-armed snowflake with an ink line. */
function flakeTexture() {
  return canvas(64, (g) => {
    g.translate(32, 32)
    g.lineCap = 'round'
    for (const [w, col] of [[9, PAL.ink], [5, '#FFFFFF']] as const) {
      g.lineWidth = w
      g.strokeStyle = col
      for (let i = 0; i < 6; i++) {
        g.save()
        g.rotate((i * Math.PI) / 3)
        g.beginPath()
        g.moveTo(0, 0)
        g.lineTo(0, -24)
        g.moveTo(0, -14)
        g.lineTo(-7, -20)
        g.moveTo(0, -14)
        g.lineTo(7, -20)
        g.stroke()
        g.restore()
      }
    }
  })
}
/** The soft pink-gold glow on the right pole. */
function glowTexture() {
  return canvas(128, (g) => {
    const grad = g.createRadialGradient(64, 64, 8, 64, 64, 64)
    grad.addColorStop(0, 'rgba(255,234,154,0.95)')
    grad.addColorStop(0.5, 'rgba(255,79,154,0.5)')
    grad.addColorStop(1, 'rgba(255,79,154,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 128)
  })
}
/** A "?" in a white bubble (a shape, not text: it reads as a puzzled face at any size). */
function questionTexture() {
  return canvas(96, (g) => {
    g.beginPath()
    g.arc(48, 48, 40, 0, Math.PI * 2)
    g.fillStyle = '#FFFFFF'
    g.fill()
    g.lineWidth = 6
    g.strokeStyle = PAL.ink
    g.stroke()
    g.lineCap = 'round'
    g.lineWidth = 10
    g.strokeStyle = '#FF4F9A'
    g.beginPath()
    g.arc(48, 38, 13, Math.PI * 1.05, Math.PI * 2.35)
    g.lineTo(48, 58)
    g.stroke()
    g.beginPath()
    g.arc(48, 73, 5, 0, Math.PI * 2)
    g.fillStyle = '#FF4F9A'
    g.fill()
  })
}
