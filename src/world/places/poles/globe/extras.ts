// The things to poke on the globe (globe.ts owns the globe itself; trail.ts the story's trail and the balloon).
//
// The North Pole's striped marker wobbles, a seal pops out of its breathing hole and barks, the science station's door
// opens and a scientist waves, a whale surfaces and spouts, a tap on the empty sky bursts snowflakes. Two belong to the
// story: the scientists' red ship out at sea (the one Pebble fell asleep on: it toots and puffs), and Terry the Arctic
// tern, flying his slow loop from pole to pole (a tap: a barrel roll, and he says so himself). (The lights in the night
// sky are globe.ts's: they flare when tapped.)
import { CanvasTexture, Group, Matrix4, Mesh, MeshBasicMaterial, Object3D, Quaternion, Sprite, SpriteMaterial, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three'
import { bell, smooth, span } from '../../../../sdk'
import { sfx, tone } from '../../../kit/sfx'
import { buildAnimal, type Rig } from '../../../engine3d/characters/animal'
import { FaceLife } from '../../../engine3d/characters/face'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P } from '../../../engine3d/geo'
import { PAL } from '../../../engine3d/toon'
import { POLES_LOOKS } from '../characters/looks'
import { ll } from './earth'
import { hubSfx } from './sounds'
import { DEG } from '../../../../sdk/math'

export type PokeId = 'marker' | 'seal' | 'station' | 'whale' | 'ship' | 'terry'

/** What the globe's extras (and its trail) need from the globe. */
export interface GlobeHost {
  bag: Bag
  /** The Earth's frame (latitude and longitude, turning with her finger). */
  spin: Group
  /** The scene's root (puffs and snowflakes fly free of the globe). */
  world: Object3D
  camera: PerspectiveCamera
  /** A shape in the globe's light with an ink outline. */
  prop(geometry: BufferGeometry, px?: number): Group
  /** How far from the center the ground is at this latitude (Antarctica's ice stands high). */
  ground(lat: number): number
}

const UP = new Vector3(0, 1, 0)
const tmp = new Vector3()
const tmp2 = new Vector3()
const tmp3 = new Vector3()
const M = new Matrix4()

/** Stands something on the globe at a latitude and longitude, `r` from the center, feet down. */
function standOn(o: { position: Vector3; quaternion: Quaternion }, lat: number, lon: number, r: number) {
  ll(lat, lon, r, o.position)
  o.quaternion.setFromUnitVectors(UP, tmp.copy(o.position).normalize())
}

/** Where the red ship waits: the North Atlantic, beside the trail. */
const SHIP_AT = { lat: 27, lon: -47 }
/** Terry's loop: a circle round the world that passes close to both poles (not right over them: the North Pole's
 *  marker stands there), this high over the sea, once round in this many seconds. */
const TERN = { size: 0.13, alt: 0.2, lap: 46 }
const TERN_E = ll(0, 25, 1)
const TERN_N = ll(80, 115, 1)
/** The rig (head up +y, face +z) laid on its tummy: head first toward -z, back up. */
const FLAT = new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(new Vector3(-1, 0, 0), new Vector3(0, 0, -1), new Vector3(0, -1, 0)))

export class GlobeExtras {
  // ---- The pokes.
  private marker = new Group()
  private markerTip = new Group()
  private markerAng = 0
  private markerVel = 0
  private seal = new Group()
  private sealHead = new Group()
  private sealT = -1
  private sealAuto = 9
  private sealBark = false
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
  private ship = new Group()
  private shipBody = new Group()
  private shipT = -1
  private tern = new Group()
  private ternRig!: Rig
  private ternLife!: FaceLife
  private ternA = 0.9
  private ternRoll = -1
  private puffs: { s: Sprite; v: Vector3; t: number; life: number }[] = []
  private flakes: { s: Sprite; v: Vector3; t: number }[] = []
  private puffMat: SpriteMaterial
  private flakeMat: SpriteMaterial

  constructor(private host: GlobeHost) {
    const { bag } = host
    this.puffMat = bag.add(new SpriteMaterial({ map: bag.add(puffTexture()), transparent: true, depthWrite: false }))
    this.flakeMat = bag.add(new SpriteMaterial({ map: bag.add(flakeTexture()), transparent: true, depthWrite: false }))
    this.buildMarker()
    this.buildSeal()
    this.buildStation()
    this.buildWhale()
    this.buildShip()
    this.buildTern()
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
    // (Away from the trail's meridian, so the hole isn't under its dots.)
    standOn(this.seal, 80, 14, 1.021)
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
    // (Bigger than life next to the friends: it's seen from above, far down the globe's face.)
    this.whale.scale.setScalar(1.8)
    standOn(this.whale, -22, -8, 1)
    this.host.spin.add(this.whale)
  }

  /** The scientists' red ship (the toy one that sails up the little globe in the first film), waiting out at sea, her
   *  bow to the north. */
  private buildShip() {
    this.shipBody.add(
      this.host.prop(
        merge([
          P.rbox(0.19, 0.07, 0.085, 0.02, '#F0564E', { at: [0, 0.035, 0] }),
          P.rbox(0.194, 0.014, 0.089, 0.006, '#FFFFFF', { at: [0, 0.062, 0] }),
          P.box(0.07, 0.06, 0.06, '#FFFDF7', { at: [-0.035, 0.095, 0] }),
          P.cyl(0.014, 0.014, 0.05, '#FFC83D', { at: [-0.05, 0.15, 0] }, 6),
        ]),
        1.5,
      ),
    )
    this.ship.add(this.shipBody)
    // (Bigger than life, like the whale: she is seen from far off, down the globe's face.)
    this.ship.scale.setScalar(1.25)
    const { lat, lon } = SHIP_AT
    ll(lat, lon, 1.002, this.ship.position)
    const up = tmp.copy(this.ship.position).normalize()
    const north = ll(lat + 2, lon, 1, tmp2).sub(this.ship.position).normalize()
    const east = tmp3.crossVectors(north, up).normalize()
    this.ship.quaternion.setFromRotationMatrix(M.makeBasis(north, up, east))
    this.host.spin.add(this.ship)
  }

  /** Terry the Arctic tern, the toy from the character lab, flying flat with his long wings out. */
  private buildTern() {
    const rig = buildAnimal({ ...POLES_LOOKS.terry, height: TERN.size }, this.host.bag)
    rig.root.children[0].visible = false
    const pose = new Group()
    pose.quaternion.copy(FLAT)
    pose.add(rig.root)
    this.tern.add(pose)
    this.ternRig = rig
    this.ternLife = new FaceLife(rig, 'terry')
    this.host.spin.add(this.tern)
  }

  get busy() {
    return this.sealT >= 0 || this.stationT >= 0 || this.whaleT >= 0 || this.shipT >= 0 || this.ternRoll >= 0 || this.puffs.length > 0 || this.flakes.length > 0 || Math.abs(this.markerVel) > 0.01
  }

  // ---------------------------------------------------------------- the pokes

  poke(id: PokeId) {
    if (id === 'marker') {
      this.markerVel += 7 * (Math.random() < 0.5 ? -1 : 1)
      hubSfx.bell()
    } else if (id === 'seal') this.popSeal(true)
    else if (id === 'station') {
      if (this.stationT < 0) {
        this.stationT = 0
        hubSfx.door()
      }
    } else if (id === 'whale') this.surface(true)
    else if (id === 'ship') {
      this.shipT = 0
      hubSfx.horn()
    } else if (id === 'terry') {
      if (this.ternRoll < 0) this.ternRoll = 0
      hubSfx.tern()
    }
  }

  private popSeal(bark: boolean) {
    if (this.sealT >= 0 && this.sealT < 2.2) return
    this.sealT = 0
    this.sealBark = bark
    sfx.splash()
  }

  private surface(tapped: boolean) {
    if (this.whaleT >= 0) {
      if (tapped) this.spout(2)
      return
    }
    this.whaleT = 0
    if (tapped) sfx.splash()
  }

  /** Puffs of white (the whale's spray, the ship's steam) going up from `from`, a point in `o`'s own frame. */
  private puff(o: Object3D, from: Vector3, n: number, speed = 0.28) {
    const at = o.localToWorld(tmp.copy(from))
    const up = o.localToWorld(tmp2.copy(from).add(UP)).sub(at).normalize()
    for (let i = 0; i < n; i++) {
      const s = new Sprite(this.puffMat)
      s.position.copy(at)
      this.host.world.add(s)
      const v = up.clone().multiplyScalar(speed + Math.random() * 0.12).add(new Vector3((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.08))
      this.puffs.push({ s, v, t: 0, life: 0.7 + Math.random() * 0.3 })
    }
  }

  /** White water above the whale's blowhole. */
  private spout(n = 6) {
    this.puff(this.whaleBody, tmp3.set(0.02, 0.03, 0), n)
    hubSfx.spout()
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
      this.flakes.push({ s, v, t: 0 })
    }
    hubSfx.snow()
    if (this.flakes.length > 60) for (const f of this.flakes.splice(0, this.flakes.length - 60)) f.s.removeFromParent()
  }

  // ---------------------------------------------------------------- every frame

  tick(dt: number, t: number, side: 'middle' | 'north' | 'south') {
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
      if (this.sealBark && s - dt < barkAt && s >= barkAt) hubSfx.seal()
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

    // The red ship rides the swell; a tap toots her horn: two puffs of steam from the funnel and a happy bounce each.
    this.shipBody.position.y = 0.004 * Math.sin(t * 1.3)
    this.shipBody.rotation.x = 0.07 * Math.sin(t * 0.9)
    this.shipBody.rotation.z = 0.05 * Math.sin(t * 1.2 + 1)
    let toot = 1
    if (this.shipT >= 0) {
      const s = (this.shipT += dt)
      for (const at of [0.05, 0.5]) if (s - dt < at && s >= at) this.puff(this.shipBody, tmp3.set(-0.05, 0.18, 0), 3, 0.2)
      toot = 1 + 0.16 * bell(span(s, 0, 0.35)) + 0.12 * bell(span(s, 0.45, 0.8))
      if (s > 1.1) this.shipT = -1
    }
    this.shipBody.scale.setScalar(toot)

    // Terry: round the world past both poles, wings beating; a tap is a barrel roll.
    this.ternLife.update(dt)
    this.ternA += (dt * Math.PI * 2) / TERN.lap
    const a = this.ternA
    const up = tmp.copy(TERN_E).multiplyScalar(Math.cos(a)).addScaledVector(TERN_N, Math.sin(a))
    const back = tmp2.copy(TERN_E).multiplyScalar(Math.sin(a)).addScaledVector(TERN_N, -Math.cos(a))
    this.tern.quaternion.setFromRotationMatrix(M.makeBasis(tmp3.crossVectors(up, back), up, back))
    this.tern.position.copy(up).multiplyScalar(1 + TERN.alt + 0.012 * Math.sin(t * 1.7))
    let roll = 0.12 * Math.sin(t * 0.8)
    if (this.ternRoll >= 0) {
      this.ternRoll += dt
      roll += smooth(Math.min(1, this.ternRoll / 0.9)) * Math.PI * 2
      if (this.ternRoll > 0.9) this.ternRoll = -1
    }
    this.tern.rotateZ(roll)
    const wing = Math.PI / 2 + 0.45 * Math.sin(t * (this.ternRoll >= 0 ? 16 : 7)) + 0.08
    this.ternRig.armR.rotation.z = wing
    this.ternRig.armL.rotation.z = -wing

    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i]
      p.t += dt
      p.v.multiplyScalar(Math.exp(-dt * 2.5))
      p.s.position.addScaledVector(p.v, dt)
      const k = p.t / p.life
      p.s.scale.setScalar(0.03 + 0.05 * k)
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
      const k = f.t / 1.6
      f.s.scale.setScalar(0.06 * Math.min(1, f.t / 0.15) * (1 - smooth(span(k, 0.6, 1))))
      if (k >= 1) {
        f.s.removeFromParent()
        this.flakes.splice(i, 1)
      }
    }
  }

  /** Where a poke's tap target goes: the point in the scene, whether it faces her, and its size (in globe radii). */
  spot(id: PokeId, out: Vector3): { facing: number; size: number } | null {
    const cam = this.host.camera.position
    const facing = (o: { getWorldPosition(v: Vector3): Vector3 }, lift: number) => {
      o.getWorldPosition(out)
      const n = tmp2.copy(out).normalize()
      out.addScaledVector(n, lift)
      return n.dot(tmp.subVectors(cam, out).normalize())
    }
    if (id === 'marker') return { facing: facing(this.marker, 0.08), size: 0.22 }
    if (id === 'seal') return { facing: facing(this.seal, 0.03), size: 0.2 }
    if (id === 'station') return { facing: facing(this.station, 0.04), size: 0.22 }
    if (id === 'whale') return { facing: facing(this.whale, 0.02), size: 0.26 }
    if (id === 'ship') return { facing: facing(this.ship, 0.07), size: 0.3 }
    if (id === 'terry') return { facing: facing(this.tern, 0), size: 0.26 }
    return null
  }

  qa() {
    return { ternLat: Math.round(Math.asin(Math.sin(this.ternA) * TERN_N.y) / DEG), tooting: this.shipT >= 0, rolling: this.ternRoll >= 0 }
  }
}

function canvas(size: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  draw(c.getContext('2d')!)
  return new CanvasTexture(c)
}
/** A soft white puff of water or steam. */
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
