// The Nail Island (section `nail`): Agong asked for a photo of it. Khao Phing Kan's two cliffs lean against each other
// with a split between them, a little beach below, and out in the water Ko Tapu, the nail-shaped rock, stands alone. A
// ring of red-and-white buoys keeps boats back: they bump her softly away ("Boats stay back so the Nail Island keeps
// standing!", the real reason: it's protected). She drives onto the glowing beach and the family hops off.
//
// The photo: Daddy holds up the camera with Ko Tapu behind them: "Everybody, pose!" Four big pose buttons (BoatTrip
// shows them); Kaylee strikes the one she taps and Mommy and Daddy copy her. "One, two, three, cheese!", the flash,
// and a real render of the scene drops into her trip album. As many as she likes. If she packed her bucket, Kaylee's
// sandcastle goes up beside her on the sand.
import { Group, Vector3, type BufferGeometry, type PerspectiveCamera } from 'three'
import { clamp } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { photoCamera } from '../../../engine/photo'
import { PAL } from '../../../engine/toon'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import type { BoatSection } from '../sections'
import type { Bay } from './bay'
import { BEACH, BEACH_GLOW, BEACH_OUT, CLIFFS, NAIL, NAIL_LEAVE, NAIL_NEAR, NAIL_START } from './layout'
import type { BayPart, Box, Circle, PhotoKind, PoseKind, Ride, RiderId, Spot } from './part'
import { NOTCH, ROCK, ROCK_DARK, SAND, JUNGLE, JUNGLE_DARK, tower } from './scenery'

export const NAIL_ANCHORS: AnchorInfo[] = [
  { id: 'kotapu', label: 'Ko Tapu, the Nail Island', kind: 'thing' },
  { id: 'castle', label: 'Sandcastle', kind: 'thing' },
]

const deg = Math.PI / 180

export class NailStop implements BayPart {
  readonly start = NAIL_START
  /** The beach only takes her once she has driven away from it again. */
  armed = true
  /** She took at least one photo here and got back in the boat: the sunset can begin. */
  done = false
  private beachPose: { x: number; z: number; h: number; along: number } | null = null
  private ashore = false
  private buoyRing: Group
  private busy = false
  private photos = 0
  private factAt = -99
  private hearts: Group[] = []
  private castle: Group
  private castleK = -1
  private bucketHome: Vector3 | null = null
  private wobble = -1
  private toldPose = false

  constructor(private bay: Bay) {
    const { bag, scene } = bay
    const n = NAIL
    // ---- Ko Tapu: thin at the waterline (the sea nibbled it), wider at the top, a tuft of green ----
    scene.add(
      solid(
        merge([
          P.cyl(n.r * 0.85, n.r * 0.8, 1.4, NOTCH, { at: [n.x, 0.5, n.z] }, 12),
          P.cyl(n.r * 1.25, n.r, n.h * 0.45, ROCK, { at: [n.x, 1.2 + n.h * 0.225, n.z] }, 12),
          P.cyl(n.top, n.r * 1.25, n.h * 0.45, ROCK, { at: [n.x + 0.6, 1.2 + n.h * 0.675, n.z] }, 12),
          P.cyl(n.top * 0.5, n.top * 0.6, n.h * 0.4, ROCK_DARK, { at: [n.x - 1.6, 1.2 + n.h * 0.7, n.z + 1] }, 8),
          ...[0, 1, 2].map((i) => P.box(0.3, n.h * 0.4, 0.3, '#AFA3C2', { at: [n.x + Math.cos(i * 2.2) * n.top * 0.9, n.h * 0.7, n.z + Math.sin(i * 2.2) * n.top * 0.9] })),
          P.sphere(n.top * 0.95, JUNGLE, { at: [n.x + 0.6, n.h + 1.4, n.z], scale: [1, 0.4, 1] }, 10),
          P.sphere(n.top * 0.5, JUNGLE_DARK, { at: [n.x - 0.8, n.h + 2.4, n.z + 0.6], scale: [1, 0.8, 1] }, 8),
          P.sphere(n.top * 0.35, JUNGLE_DARK, { at: [n.x + 2.4, n.h * 0.8, n.z - 1.5], scale: [1, 0.7, 1] }, 8),
        ]),
        bag,
        2.5,
      ),
    )
    // ---- The red and white buoys that keep boats back ----
    this.buoyRing = new Group()
    const bp: BufferGeometry[] = []
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2
      const bx = n.x + Math.sin(a) * n.buoys
      const bz = n.z + Math.cos(a) * n.buoys
      bp.push(P.sphere(0.45, i % 2 ? '#FFFFFF' : '#F0646E', { at: [bx, 0.18, bz] }, 10))
      bp.push(P.cyl(0.04, 0.04, 0.5, PAL.ink, { at: [bx, 0.75, bz] }, 5))
    }
    this.buoyRing.add(solid(merge(bp), bag, 1.5))
    scene.add(this.buoyRing)
    // ---- Khao Phing Kan: two cliffs leaning against each other, the dark split between them ----
    const out = new Vector3(BEACH_OUT[0], 0, BEACH_OUT[1])
    CLIFFS.forEach((c, i) => {
      const g = solid(merge(tower({ ...c, x: 0, z: 0 })), bag, 2.5)
      g.position.set(c.x, 0, c.z)
      // Turning about the beach's outward axis tips the tops sideways: each top toward the other.
      g.setRotationFromAxisAngle(out, (i === 0 ? -1 : 1) * 0.13)
      scene.add(g)
    })
    const mid = new Vector3((CLIFFS[0].x + CLIFFS[1].x) / 2, 0, (CLIFFS[0].z + CLIFFS[1].z) / 2)
    const split = solid(merge([P.box(1.6, 30, 3, NOTCH, { at: [0, 15, 0] }), P.box(5, 9, 2.5, ROCK_DARK, { at: [0, 4.5, 2], rot: [0, 0, 0.12] })]), bag, 2)
    split.position.copy(mid).addScaledVector(out, 7)
    split.rotation.y = Math.atan2(BEACH_OUT[0], BEACH_OUT[1])
    scene.add(split)
    // ---- The beach, facing Ko Tapu, with a few palms and rocks ----
    const beach = solid(
      merge([
        P.rbox(BEACH.w, 0.5, BEACH.d, 0.2, SAND, { at: [0, 0.05, 0] }),
        P.rbox(BEACH.w * 0.7, 0.6, BEACH.d * 0.6, 0.2, SAND, { at: [0, 0.2, -BEACH.d * 0.25] }),
        ...[-1, 1].flatMap((s) => [P.cyl(0.18, 0.24, 4.5, '#B08463', { at: [s * BEACH.w * 0.38, 2.4, -BEACH.d * 0.32], rot: [0, 0, s * 0.18] }, 6), ...[0, 1, 2, 3].map((l) => P.cone(0.7, 2.6, JUNGLE_DARK, { at: [s * BEACH.w * 0.38 + s * 0.4 + Math.sin(l * 1.57) * 0.9, 4.7, -BEACH.d * 0.32 + Math.cos(l * 1.57) * 0.9], rot: [Math.cos(l * 1.57) * 1.3, 0, -Math.sin(l * 1.57) * 1.3] }, 5))]),
        P.sphere(0.8, ROCK_DARK, { at: [BEACH.w * 0.3, 0.2, BEACH.d * 0.2], scale: [1.3, 0.6, 1] }, 8),
      ]),
      bag,
      2,
    )
    beach.position.set(BEACH.x, 0, BEACH.z)
    beach.rotation.y = Math.atan2(BEACH_OUT[0], BEACH_OUT[1])
    scene.add(beach)
    // ---- Hearts for the heart pose, and the sandcastle ----
    for (let i = 0; i < 3; i++) {
      const h = new Group()
      h.add(solid(merge([...[-1, 1].map((s) => P.sphere(0.13, PAL.hotpink, { at: [s * 0.09, 0.04, 0] }, 10)), P.cone(0.18, 0.26, PAL.hotpink, { at: [0, -0.13, 0], rot: [Math.PI, 0, 0] }, 12)]), bag, 1.5))
      h.visible = false
      scene.add(h)
      this.hearts.push(h)
    }
    this.castle = new Group()
    this.castle.add(
      solid(
        merge([
          P.cyl(0.32, 0.4, 0.4, '#F2D38B', { at: [0, 0.2, 0] }, 12),
          ...[0, 1, 2, 3].map((i) => P.cyl(0.11, 0.13, 0.5, '#F2D38B', { at: [Math.sin(i * 1.57) * 0.33, 0.25, Math.cos(i * 1.57) * 0.33] }, 8)),
          P.cyl(0.18, 0.24, 0.35, '#F2D38B', { at: [0, 0.55, 0] }, 10),
          P.cyl(0.01, 0.01, 0.35, PAL.ink, { at: [0, 0.88, 0] }, 4),
          P.box(0.16, 0.1, 0.01, PAL.hotpink, { at: [0.08, 0.98, 0] }),
        ]),
        bag,
        1.5,
      ),
    )
    this.castle.visible = false
    scene.add(this.castle)
  }

  private get lt() {
    return this.bay.rides.longtail
  }

  // ---------------------------------------------------------------- arriving, landing, leaving

  /** The longtail's bow at (bx, bz): onto the beach (the glow, or anywhere along the sand). */
  arrive(bx: number, bz: number) {
    const d = this.lt.d
    if (!this.armed && Math.hypot(d.x - BEACH_GLOW.x, d.z - BEACH_GLOW.z) > BEACH_GLOW.r + 9) this.armed = true
    if (!this.armed) return false
    const [ox, oz] = BEACH_OUT
    const out = (bx - BEACH.x) * ox + (bz - BEACH.z) * oz
    const side = (bx - BEACH.x) * oz - (bz - BEACH.z) * ox
    const onSand = out < BEACH.d / 2 + 1 && out > -BEACH.d && Math.abs(side) < BEACH.w / 2
    if (!onSand && Math.hypot(bx - BEACH_GLOW.x, bz - BEACH_GLOW.z) >= BEACH_GLOW.r) return false
    this.land()
    return true
  }

  /** The longtail noses onto the beach; everyone hops off and lines up for the photo. */
  private land() {
    const bay = this.bay
    bay.setPhase('swap')
    const r = this.lt
    const [ox, oz] = BEACH_OUT
    const px = oz
    const pz = -ox
    const along = clamp((r.d.x - BEACH.x) * px + (r.d.z - BEACH.z) * pz, -6, 6)
    const h = Math.atan2(-ox, -oz)
    const shore = 4.3
    const x = BEACH.x + px * along + ox * (shore + r.v.bow - 1.2)
    const z = BEACH.z + pz * along + oz * (shore + r.v.bow - 1.2)
    this.beachPose = { x, z, h, along }
    this.ashore = true
    sfx.splash(0.6)
    bay.glide(r, { x, z, h }, 0.9, () => {
      // Kaylee in front, Mommy and Daddy behind her, the boat behind them (the camera stands nearer the cliffs).
      const spots: [RiderId, Vector3][] = [
        ['kaylee', this.spot(0, 0.3)],
        ['ji', this.spot(-1.25, 1.3)],
        ['nick', this.spot(1.3, 1.25)],
      ]
      spots.forEach(([id, at], i) => {
        const rd = bay.rider(id)
        rd.lying = rd.under = false
        bay.strike(rd, null)
        bay.hop(rd, bay.scene, at, 'stand', h / deg, i * 0.25, i === 2 ? () => this.landed() : undefined)
      })
    })
  }
  /** A spot on the sand: `s` along the beach from where the boat landed, `f` out toward the sea. */
  private spot(s: number, f: number) {
    const bp = this.beachPose!
    const [ox, oz] = BEACH_OUT
    return new Vector3(BEACH.x + oz * (bp.along + s) + ox * f, 0.32, BEACH.z - ox * (bp.along + s) + oz * f)
  }

  private landed() {
    const bay = this.bay
    bay.setPhase('beach')
    for (const r of bay.riders) bay.cheer(r)
    bay.landed(true)
    if (!this.toldPose) {
      this.toldPose = true
      bay.say(L.bay.pose)
    }
    // Her bucket comes off the boat: Kaylee's sandcastle goes up beside her.
    const bucket = this.lt.v.cargo.getObjectByName('bucket')
    if (bucket) {
      this.bucketHome = bucket.position.clone()
      bay.scene.attach(bucket)
      bucket.position.copy(this.spot(0.9, -0.2)).setY(0.32)
      this.castle.position.copy(this.spot(-0.9, -0.3)).setY(0.32)
      this.castle.visible = true
      this.castleK = 0
    }
  }

  /** Back in the boat: it backs off the beach and spins round to face the bay. */
  reboard() {
    const bay = this.bay
    const lt = this.lt
    const bp = this.beachPose
    if (!bp) return
    bay.setPhase('swap')
    bay.landed(false)
    const bucket = bay.scene.getObjectByName('bucket')
    if (bucket && this.bucketHome) {
      lt.v.cargo.attach(bucket)
      bucket.position.copy(this.bucketHome)
      bucket.rotation.set(0, 0, 0)
    }
    this.busy = false
    bay.riders.forEach((r, i) => {
      bay.strike(r, null)
      const pose = bay.poseIn(lt.v, r)
      bay.hop(r, lt.v.body, bay.seatPos(lt.v, r, pose), pose, 0, i * 0.2, i !== 2 ? undefined : () => {
        this.ashore = false
        bay.glide(lt, { x: bp.x + BEACH_OUT[0] * 8, z: bp.z + BEACH_OUT[1] * 8, h: bp.h + Math.PI }, 1.4, () => {
          bay.setPhase('drive')
          this.armed = false
          if (this.photos > 0) this.done = true
          // Somewhere still to go: Daddy asks again.
          if (!bay.stops.has('village') || !bay.stops.has('cave')) bay.whereTo()
        })
      })
    })
  }

  // ---------------------------------------------------------------- the photo

  /** She tapped a pose button: Kaylee strikes it, Mommy and Daddy copy her, then the countdown and the flash. */
  pose(kind: PoseKind) {
    const bay = this.bay
    if (bay.phase !== 'beach' || this.busy) return
    this.busy = true
    bay.lastTouch = bay.time
    const order: RiderId[] = ['kaylee', 'ji', 'nick']
    order.forEach((id, i) => setTimeout(() => {
      bay.strike(bay.rider(id), kind)
      bay.rider(id).char.react('hop')
    }, i * 320))
    sfx.pop()
    const first = this.photos === 0
    setTimeout(() => (first ? bay.say(L.bay.cheese) : sfx.countdown()), 700)
    setTimeout(() => {
      // (She may have tapped the boat to go before the flash.)
      if (bay.phase !== 'beach') return
      sfx.shutter()
      bay.flash()
      bay.photo('nail')
      this.photos++
    }, first ? 2900 : 1800)
    setTimeout(() => {
      for (const r of bay.riders) bay.strike(r, null)
      this.busy = false
    }, first ? 4300 : 3200)
  }

  photoCamera(kind: PhotoKind, staged: boolean): PerspectiveCamera | null {
    if (kind !== 'nail') return null
    const bay = this.bay
    if (staged || !this.beachPose) {
      // The family on the beach in a cheer, the boat behind them (a deep link's album).
      const keep = this.beachPose
      const [ox, oz] = BEACH_OUT
      this.beachPose = { x: BEACH.x + ox * (4.3 + this.lt.v.bow - 1.2), z: BEACH.z + oz * (4.3 + this.lt.v.bow - 1.2), h: Math.atan2(-ox, -oz), along: 0 }
      this.lt.d.place(this.beachPose.x, this.beachPose.z, this.beachPose.h)
      const spots: [RiderId, Vector3][] = [
        ['kaylee', this.spot(0, 0.3)],
        ['ji', this.spot(-1.25, 1.3)],
        ['nick', this.spot(1.3, 1.25)],
      ]
      for (const [id, at] of spots) {
        const r = bay.rider(id)
        bay.scene.attach(r.char.root)
        bay.put(r, at.x, at.y, at.z, 'stand', this.beachPose.h / deg)
        r.char.root.rotation.set(0, this.beachPose.h, 0)
        r.char.rig.armL.rotation.z = -2.15
        r.char.rig.armR.rotation.z = 2.15
      }
      const cam = this.camera()
      this.beachPose = keep
      return cam
    }
    return this.camera()
  }
  /** From the cliffs' side, low, over the family straight at Ko Tapu (it stands right behind them). */
  private camera() {
    const bp = this.beachPose!
    const [ox, oz] = BEACH_OUT
    const cx = BEACH.x + oz * bp.along + ox * 0.8
    const cz = BEACH.z - ox * bp.along + oz * 0.8
    const yaw = Math.atan2(cx - NAIL.x, cz - NAIL.z)
    const dist = 7.5
    const pitch = 7 * deg
    const x = cx + Math.sin(yaw) * Math.cos(pitch) * dist
    const z = cz + Math.cos(yaw) * Math.cos(pitch) * dist
    return photoCamera(40, x, 1.9 + Math.sin(pitch) * dist, z, cx, 1.9, cz)
  }

  // ---------------------------------------------------------------- the buoys

  /** Ko Tapu's buoys: a soft, springy ring that pushes the boat back out. */
  buoys(ride: Ride, at: number, px: number, pz: number) {
    const d = ride.d
    const dx = px - NAIL.x
    const dz = pz - NAIL.z
    const dist = Math.hypot(dx, dz)
    const min = NAIL.buoys + ride.v.hull.r
    if (dist >= min) return
    d.x += (dx / dist) * (min - dist)
    d.z += (dz / dist) * (min - dist)
    const hit = d.bounce(dx / dist, dz / dist, 0.8)
    if (hit > 0.6) {
      this.bay.buoyBump(ride, at)
      this.wobble = 0
      this.bay.once('buoys', L.bay.facts.buoys)
    }
  }

  bumps(x: number, z: number, circles: Circle[], _boxes: Box[]) {
    const near = (cx: number, cz: number, r: number) => Math.abs(cx - x) < r + 12 && Math.abs(cz - z) < r + 12
    for (const r of CLIFFS) if (near(r.x, r.z, r.r)) circles.push([r.x, r.z, r.r])
    if (near(NAIL.x, NAIL.z, NAIL.r)) circles.push([NAIL.x, NAIL.z, NAIL.r])
  }

  // ---------------------------------------------------------------- taps and frames

  anchorAt(id: string): Spot | null {
    const bay = this.bay
    if (id === 'kotapu') return bay.using === 'longtail' && (bay.phase === 'drive' || bay.phase === 'beach') && Math.hypot(this.lt.d.x - NAIL.x, this.lt.d.z - NAIL.z) < 90 ? { at: new Vector3(NAIL.x, NAIL.h * 0.7, NAIL.z), r: 3, prio: 1 } : null
    if (id === 'castle') return this.castle.visible && bay.phase === 'beach' ? { at: this.castle.position.clone().setY(0.6), r: 0.5, prio: 3 } : null
    return null
  }

  tap(id: string): boolean {
    if (id === 'kotapu') {
      // Its fact (not again and again: a soft boop in between).
      if (this.bay.time - this.factAt > 15) {
        this.factAt = this.bay.time
        this.bay.say(L.bay.facts.nail)
      } else sfx.boop()
      this.wobble = 0
      return true
    }
    if (id === 'castle') {
      this.castleK = 0
      sfx.puff()
      this.bay.rider('kaylee').char.react('hop')
      return true
    }
    return false
  }

  update(dt: number, t: number) {
    const bay = this.bay
    this.buoyRing.position.y = Math.sin(t * 1.6) * 0.05
    if (this.wobble >= 0) {
      this.wobble += dt / 0.8
      this.buoyRing.position.y += Math.sin(this.wobble * 20) * 0.12 * (1 - Math.min(1, this.wobble))
      if (this.wobble >= 1) this.wobble = -1
    }
    // The first time Ko Tapu comes into view: what its name means.
    const d = this.lt.d
    if (bay.using === 'longtail' && !bay.isSunset() && Math.hypot(d.x - NAIL.x, d.z - NAIL.z) < NAIL_NEAR + 20) bay.once('nail', L.bay.facts.nail)
    // Hearts float over everyone holding the heart pose.
    bay.riders.forEach((r, i) => {
      const h = this.hearts[i]
      const on = r.pose?.kind === 'heart' && r.pose.t > 0.3
      h.visible = on
      if (on) {
        r.char.root.getWorldPosition(h.position)
        h.position.y += r.height * 1.45 + Math.sin(t * 4 + i) * 0.06
        h.lookAt(bay.rig.camera.position)
        h.scale.setScalar(Math.min(1, (r.pose!.t - 0.3) * 4) * (1 + Math.sin(t * 8) * 0.08))
      }
    })
    // The sandcastle goes up in three pats (puff, puff, puff), or wobbles when she taps it.
    if (this.castleK >= 0) {
      const before = this.castleK
      this.castleK += dt / 1.8
      const k = Math.min(1, this.castleK)
      this.castle.scale.set(1, Math.max(0.05, Math.ceil(k * 3) / 3 - (1 - (k * 3) % 1) * 0.05), 1)
      if (Math.floor(before * 3) !== Math.floor(k * 3) && k < 1) {
        sfx.puff()
        bay.dust.burst(this.castle.position.x, 0.4, this.castle.position.z, 6, 1, 1.5, 0.1)
        bay.rider('kaylee').char.react('wiggle')
      }
      if (k >= 1) this.castleK = -1
    }
  }

  sectionNow(): BoatSection | null {
    const bay = this.bay
    if (bay.using !== 'longtail') return null
    const d = this.lt.d
    const n = Math.hypot(d.x - NAIL.x, d.z - NAIL.z)
    return bay.phase === 'beach' || n < NAIL_NEAR || (bay.section === 'nail' && n < NAIL_LEAVE) ? 'nail' : null
  }

  /** Low and straight-on for the photo on the beach. */
  shot(): Shot | null {
    const bay = this.bay
    const bp = this.beachPose
    if (!this.ashore || !bp) return null
    const [ox, oz] = BEACH_OUT
    const cx = BEACH.x + oz * bp.along + ox * 0.8
    const cz = BEACH.z - ox * bp.along + oz * 0.8
    // Looking from the cliffs over the family straight at Ko Tapu, so it stands right behind them. Never further back
    // than the cliffs (a narrow phone screen would need more room to fit them all: they fill its width instead).
    const tall = bay.tall
    return { center: new Vector3(cx, tall ? 2.1 : 1.6, cz), half: new Vector3(tall ? 1.9 : 2.8, 2.2, 1), yaw: bay.unwrap(Math.atan2(cx - NAIL.x, cz - NAIL.z) / deg), pitch: 6, minDist: 6, maxDist: 10, follow: true }
  }

  /** She has a photo and nothing's happening: the way off the beach is the boat (it glows, the finger points at it). */
  get wantsBoat() {
    return this.bay.phase === 'beach' && this.photos > 0 && !this.busy
  }
  hint(): Vector3 | null {
    if (!this.wantsBoat) return null
    const lt = this.lt
    return lt.v.root.getWorldPosition(new Vector3()).addScaledVector(new Vector3(Math.sin(lt.d.heading), 0, Math.cos(lt.d.heading)), -2.6).setY(0.8)
  }
  stuckLine() {
    if (this.bay.phase !== 'beach' || this.busy) return null
    return this.photos > 0 ? L.bay.backIn : L.bay.hint.pose
  }

  qa() {
    return { posed: this.photos }
  }
}

