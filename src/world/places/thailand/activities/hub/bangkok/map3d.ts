// The Bangkok map (hub section `bangkok`; notes: planning/around-the-world/thailand/bangkok-map.md): what opens when
// she taps Bangkok on the Thailand map. A toy diorama of the middle of Bangkok floating in the sky (diorama.ts; the
// sky, the tray and the entrance are trip/sky.ts), the real Chao Phraya winding through it. It opens like the other
// maps: the camera is already moving behind the loading cover, then settles lower and closer (BANGKOK_CAM, ?feel=1).
// North is up the screen, and like every map she can swing it round with a drag and pinch it closer (boardShot).
//
// The toy: pins. Over each place she can go to floats a pink pin with a toy of what she does there on its head: a
// little house with a heart over the Thailand house, a slide and a slice of pizza over ICONSIAM. Tap one (or the place
// under it): the pin hops and spins in a burst of sparkles, the camera dives in and that place opens (ICONSIAM: its
// fountain dances). Both stay open for good: she can go back as often as she likes. Once she has the mall day's stamp
// it floats beside ICONSIAM's pin (the first time she comes back with it, it lands with a ka-chunk). Sparkle's
// balloon floats over the corner of the board: tap it and it lifts off, back up to the Thailand map.
//
// Things to poke: Asiatique's wheel (it spins to a fairground tune), Chinatown's gate (the lanterns swing, a lion
// drum), Lumphini Park (the monitor lizard slides into the lake), the swan boat (it twirls), Mahanakhon (its blocks
// twinkle), Central Rama 3 (it bounces), the flower market (petals fly), the port (the crane lowers its box), Bang
// Krachao (the birds fly up), the skytrain (ding-dong, off it zooms), the river boats (toot toot), the tuk-tuk, the
// clouds (a little rain), every tower (its windows twinkle, a higher tune for a taller one), every bridge (beep
// beep) and the river itself (a splash).
//
// Talk (BangkokMap.tsx says the lines, lines.ts L.bangkok): Sparkle's hello the first time, something true the first
// time she pokes each thing, and after ~8 s with nothing done, where she can go (at most three times).
import { Group, IcosahedronGeometry, OctahedronGeometry, Vector3, type Mesh, type WebGLRenderer } from 'three'
import { bell, clamp } from '../../../../../../sdk'
import { DEG } from '../../../../../../sdk/math'
import type { AnchorInfo } from '../../../../../engine3d/Anchors'
import type { Shot } from '../../../../../engine3d/camera'
import { blobShadow } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { Stage, type AnchorSpot, type LegEvents } from '../../../trip/legs/stage'
import { boardShot, Entrance, mapCamKnobs, puffCloud, skyTexture, trayBox } from '../../../trip/sky'
import { Floaters } from '../../nan-trip/mushrooms/fx'
import { buildDiorama, CRANE_BOX_Y, PIN, type Diorama } from './diorama'
import { buildField, LAKES, type Field } from './ground'
import { BALLOON_Y, BOARD, BOATS, CLOUDS, DEG_M, LEVEL, ll, PIN_IDS, PINS, PLACE_IDS, PLACES, SPOTS, STAMP_OFF, TOWERS, TRACK_Y, type PinId, type PlaceId, type SpotId } from './layout'
import { mapBed, mapSfx as sfx } from './sounds'

export interface MapEvents extends LegEvents {
  /** She picked a place and the camera has dived in (the balloon: it has floated off): that place opens. */
  go(place: PlaceId): void
  /** The camera has been moving behind the loading cover long enough: it can fade (BANGKOK_CAM.cover). */
  revealed(): void
  /** She poked something (Sparkle says something true about it the first time: BangkokMap.tsx). */
  poked(id: string): void
  /** Nothing done for a while: Sparkle says where she can go. */
  stuck(): void
}

/** The box the map's camera frames: the board, its tray (as diorama.ts builds it) and the towers on it. */
const BOARD_BOX = trayBox(BOARD.x1 - BOARD.x0, BOARD.z1 - BOARD.z0, 0.07, 0.95, 0.2, 0.55)
export const BANGKOK_CAM = mapCamKnobs('bangkok-map-cam', 'Bangkok map camera', 'src/world/places/thailand/activities/hub/bangkok/map3d.ts', { yaw: -6, pitch: -8, zoom: 0.9 })

const SPOT_LABELS: Record<SpotId, string> = {
  asiatique: "Asiatique's big wheel",
  chinatown: "Chinatown's gate",
  lumphini: 'Lumphini Park',
  mahanakhon: 'The tower made of blocks',
  rama3: 'Central Rama 3, the mall by the house',
  flowers: 'The flower market',
  port: "The port's crane",
  krachao: 'Bang Krachao, the jungle in the city',
}
const SPOT_IDS = Object.keys(SPOTS) as SpotId[]

export const MAP_ANCHORS: AnchorInfo[] = [
  ...PLACE_IDS.map((id): AnchorInfo => ({ id: `place:${id}`, label: PLACES[id].label, kind: 'thing' })),
  ...SPOT_IDS.map((id): AnchorInfo => ({ id: `spot:${id}`, label: SPOT_LABELS[id], kind: 'thing' })),
  ...PIN_IDS.map((id): AnchorInfo => ({ id: `pin:${id}`, label: PINS[id].label, kind: 'thing' })),
  { id: 'train', label: 'The skytrain', kind: 'thing' },
  ...BOATS.map((b, i): AnchorInfo => ({ id: `boat:${i}`, label: b.kind === 'express' ? 'Express boat' : b.kind === 'barge' ? 'Rice barges' : 'Longtail boat', kind: 'thing' })),
  { id: 'tuktuk', label: 'Tuk-tuk', kind: 'thing' },
  { id: 'swan', label: 'Swan boat', kind: 'thing' },
  { id: 'lizard', label: 'Monitor lizard', kind: 'thing' },
  ...CLOUDS.map((_, i): AnchorInfo => ({ id: `cloud:${i}`, label: 'Cloud', kind: 'thing' })),
]

/** Nothing touched for this long: the pins glow. */
const STUCK_S = 5
/** A picked pin hops and spins this long before the camera dives; the dive lasts this long before the place opens
 *  (the balloon's climb a little longer). */
const HOP_S = 0.4
const DIVE_S = 1.5
const DEPART_S = 2.4
/** Nothing done for this long: Sparkle says what to do (again after SAY_EVERY, at most SAY_MAX times). */
const SAY_S = 8
const SAY_EVERY = 20
const SAY_MAX = 3
const G = LEVEL.land

const tmp = new Vector3()

export class BangkokMap extends Stage {
  private d: Diorama
  private f: Field
  private arrived: { id: PlaceId; t: number } | null = null
  /** When each thing was last poked (seconds). */
  private pokeT = new Map<string, number>()
  private rain = CLOUDS.map(() => -1)
  private stampT = -1
  private fresh: boolean
  private later: { t: number; f: () => void }[] = []
  private sparkles: Floaters
  private drops: Floaters
  private foam: Floaters
  private petals: Floaters
  // ---- What moves ----
  /** The skytrain: how far along its track (m), which way it's going. */
  private trainD = 1.2
  private trainDir = 1
  /** Each boat: how far along the part of the river that's on the board (m). */
  private boatD: number[]
  /** The part of the river on the board: from, to (m along the river's middle line). */
  private reach: [number, number]
  private tukD = 0.3
  private tukDir = 1
  private wheelA = 0
  private fountainT = 4
  // ---- The sky round the board ----
  private entrance: Entrance
  private drifters: { root: Group; shadow: Mesh; speed: number; y: number }[] = []
  private under: Group[] = []
  /** What waits for the cover to go (the stamp landing): [seconds after, what]. */
  private onShow: [number, () => void][] = []
  // ---- Talk ----
  private lastSay = -99
  private quietFrom = 3
  private sayN = 0

  constructor(renderer: WebGLRenderer, private ev: MapEvents, start: { mall: boolean; fresh: boolean }) {
    super(renderer, ev)
    this.bag.add({ dispose: mapBed() })
    const { scene, bag } = this
    this.scene.background = skyTexture(bag)
    this.rig.fov = 30
    this.rig.lag = 0.5
    this.entrance = new Entrance(BANGKOK_CAM, () => {
      ev.revealed()
      this.lastTouch = this.time
      for (const [t, f] of this.onShow.splice(0)) this.after(t, f)
    })
    this.f = buildField()
    this.d = buildDiorama(bag)
    scene.add(this.d.root)
    this.buildSky()
    this.sparkles = new Floaters(new OctahedronGeometry(0.5), [PAL.gold, PAL.hotpink, '#FFFFFF', PAL.mint], 160, bag, 0.6, 1.2)
    this.drops = new Floaters(new IcosahedronGeometry(0.5, 0), ['#A8DCFF', '#D6EEFF', '#FFFFFF'], 140, bag, 2.2, 0.2)
    this.foam = new Floaters(new IcosahedronGeometry(0.5, 1), ['#FFFFFF', '#E9FBFF'], 110, bag, 0.6, 1.4)
    this.petals = new Floaters(new OctahedronGeometry(0.5), [PAL.hotpink, PAL.butter, '#FFFFFF', PAL.lavenderDark, '#FF9A4D', PAL.pink], 90, bag, 0.5, 1.6)
    scene.add(this.sparkles.mesh, this.drops.mesh, this.foam.mesh, this.petals.mesh)
    // ---- The river's reach on the board: the boats sail it end to end, then start again ----
    this.reach = this.riverReach()
    this.boatD = BOATS.map((b) => b.at * (this.reach[1] - this.reach[0]))
    // ---- The mall day's stamp: there already, or (she's just come back with it) it lands once the cover has gone ----
    this.fresh = start.mall && start.fresh
    this.d.stamp.visible = start.mall && !this.fresh
    if (this.fresh) this.onShow.push([0.7, () => this.landStamp()])
    // (Counted again from the reveal: the cover takes about BANGKOK_CAM.cover + fade.)
    this.quietFrom = 4.5 + BANGKOK_CAM.cover + BANGKOK_CAM.fade
  }

  /** The longest stretch of the river's middle line that's on the board (the line runs on a little past the edges). */
  private riverReach(): [number, number] {
    const r = this.d.river
    const m = 0.12
    let best: [number, number] = [0, r.len]
    let from = -1
    let span = 0
    for (let d = 0; d <= r.len + 0.02; d += 0.02) {
      const p = r.at(d)
      const inside = d <= r.len && p.x > BOARD.x0 + m && p.x < BOARD.x1 - m && p.z > BOARD.z0 + m && p.z < BOARD.z1 - m
      if (inside && from < 0) from = d
      if (!inside && from >= 0) {
        if (d - from > span) {
          span = d - from
          best = [from, d - 0.02]
        }
        from = -1
      }
    }
    return best
  }

  // ---------------------------------------------------------------- talk

  private stuck() {
    if (this.arrived) return
    if (this.time - Math.max(this.lastTouch, this.quietFrom) < SAY_S || this.time - this.lastSay < SAY_EVERY || this.sayN >= SAY_MAX) return
    this.lastSay = this.time
    this.sayN++
    this.ev.stuck()
  }

  // ---------------------------------------------------------------- picking a place

  /** She picked a place: its pin hops and spins in sparkles, then the camera dives in (ICONSIAM: the fountain dances;
   *  the balloon: its burner roars and up it goes). */
  private choose(id: PlaceId) {
    if (this.arrived) return
    this.arrived = { id, t: this.time }
    sfx.zoom()
    sfx.chime()
    this.rig.lag = 0.75
    if (id === 'balloon') {
      sfx.burner()
      const p = this.d.places.balloon.position
      this.sparkles.burst(tmp.set(p.x, BALLOON_Y + 0.5, p.z), 24, 0.6, 0.6, 0.9, 0.03)
      this.after(DEPART_S, () => this.ev.go('balloon'))
      return
    }
    this.poke(`pin:${id}`)
    const p = this.d.pins[id].root.position
    this.sparkles.burst(tmp.set(p.x, p.y + PIN.top * PIN.size * 0.6, p.z), 26, 0.6, 0.8, 0.8, 0.03)
    this.after(HOP_S, () => sfx.dive())
    if (id === 'iconsiam') {
      this.fountainT = 0
      this.after(HOP_S - 0.1, () => sfx.fountain())
    } else this.after(HOP_S - 0.1, () => sfx.tuktuk())
    this.after(HOP_S + DIVE_S, () => this.ev.go(id))
  }

  // ---------------------------------------------------------------- the stamp, the pokes

  /** The mall day's stamp lands beside ICONSIAM's pin: down from above, ka-chunk, sparkles. */
  private landStamp() {
    this.d.stamp.visible = true
    this.stampT = 0
  }

  private poked(id: string, after: number) {
    const k = this.time - (this.pokeT.get(id) ?? -99)
    return k < after ? k : -1
  }
  private poke(id: string) {
    this.pokeT.set(id, this.time)
  }

  private pokeSpot(id: SpotId) {
    // (Something already busy finishes first: the wheel's tune, the crane's box.)
    const busy: Partial<Record<SpotId, number>> = { asiatique: 3, port: 2.4, krachao: 2.6, lumphini: 3.4 }
    if (this.poked(`spot:${id}`, busy[id] ?? 0.4) >= 0) return
    this.poke(`spot:${id}`)
    this.ev.poked(id)
    const [x, z] = SPOTS[id]
    switch (id) {
      case 'asiatique':
        this.sparkles.burst(tmp.set(x, G + 0.3, z), 16, 0.5, 0.5, 0.9, 0.025)
        return sfx.wheel()
      case 'chinatown':
        this.sparkles.burst(tmp.set(x, G + 0.25, z + 0.1), 14, 0.5, 0.6, 0.8, 0.025, 0)
        return sfx.drum()
      case 'lumphini':
        this.poke('lizard')
        return sfx.lizard()
      case 'mahanakhon':
        for (let i = 0; i < 6; i++) this.after(i * 0.07, () => this.sparkles.burst(tmp.set(x, G + 0.15 + i * 0.13, z + 0.05), 4, 0.35, 0.2, 0.6, 0.022))
        return sfx.twinkle(1)
      case 'rama3':
        this.sparkles.burst(tmp.set(x, G + 0.2, z), 10, 0.4, 0.5, 0.7, 0.022)
        return sfx.bloop()
      case 'flowers':
        this.petals.burst(tmp.set(x, G + 0.08, z), 34, 0.7, 0.9, 1.3, 0.026)
        return sfx.petals()
      case 'port':
        return sfx.crane()
      case 'krachao':
        return sfx.birds()
    }
  }

  // ---------------------------------------------------------------- the frame

  protected step(dt: number, t: number) {
    if (this.arrived) this.entrance.finish()
    this.entrance.step(dt)
    this.stepSky(dt, t)
    this.d.sea.update(t)
    for (const l of this.later.filter((x) => x.t <= this.time)) {
      this.later.splice(this.later.indexOf(l), 1)
      if (!this.disposed) l.f()
    }
    this.stepPlaces(dt, t)
    this.stepMovers(dt, t)
    this.stepToys(dt, t)
    this.stepGlints(dt)
    for (const f of [this.sparkles, this.drops, this.foam, this.petals]) f.update(dt)
    this.stuck()
  }

  private stepPlaces(dt: number, t: number) {
    const d = this.d
    // ---- The places and the spots bounce when poked ----
    const bounce = (g: Group, key: string, base: number) => {
      const k = Math.min(1, (this.time - (this.pokeT.get(key) ?? -9)) / 0.45)
      const b = bell(k)
      g.scale.set(1 + 0.08 * b, 1 - 0.12 * b + 0.12 * b * (k > 0.5 ? 1 : 0), 1 + 0.08 * b).multiplyScalar(base)
    }
    bounce(d.places.house, 'pin:house', PLACES.house.scale)
    bounce(d.places.iconsiam, 'pin:iconsiam', PLACES.iconsiam.scale)
    for (const id of SPOT_IDS) bounce(d.spots[id], `spot:${id}`, d.spots[id].userData.base ?? (d.spots[id].userData.base = d.spots[id].scale.x))
    // ---- The pins bob and face her; a poked one hops and its toy spins; when she's stuck they bounce ----
    const hint = !this.arrived && this.time - this.lastTouch > STUCK_S
    for (const id of PIN_IDS) {
      const pin = d.pins[id]
      const info = PINS[id]
      const g = pin.root
      const [x] = info.at
      const k = clamp((this.time - (this.pokeT.get(`pin:${id}`) ?? -9)) / 0.5, 0, 1)
      const picked = this.arrived?.id === id
      // (Once she has picked a place, the other pin steps out of the camera's way.)
      g.visible = !this.arrived || picked
      g.position.y = G + info.lift + Math.sin(t * 2.2 + x * 3) * 0.03 + bell(k) * 0.14 + (hint ? Math.abs(Math.sin(t * 4 + x)) * 0.08 : 0)
      g.rotation.y = this.rig.yaw * DEG + Math.sin(t * 0.9 + x) * 0.25
      const b = bell(k)
      const size = PIN.size * (picked ? 1 + 0.15 * clamp((this.time - this.arrived!.t) / HOP_S, 0, 1) : 1)
      g.scale.set(size * (1 + 0.1 * b), size * (1 - 0.12 * b + (k > 0.5 ? 0.12 * b : 0)), size * (1 + 0.1 * b))
      pin.mini.rotation.y = k < 1 ? k * k * (3 - 2 * k) * Math.PI * 2 : 0
    }
    // ---- The stamp bobs and turns beside ICONSIAM's pin; fresh, it lands ----
    const s = d.stamp
    if (s.visible) {
      const base = G + PINS.iconsiam.lift + STAMP_OFF[1]
      const spin = clamp((this.time - (this.pokeT.get('stamp') ?? -9)) / 0.8, 0, 1)
      s.rotation.y = this.rig.yaw * DEG + Math.sin(t * 1.3) * 0.25 + (spin < 1 ? spin * Math.PI * 2 : 0)
      if (this.stampT >= 0) {
        this.stampT += dt
        const k = Math.min(1, this.stampT / 0.45)
        s.position.y = base + (1 - k * k) * 1.4
        const sq = this.stampT > 0.45 ? bell(Math.min(1, (this.stampT - 0.45) / 0.3)) : 0
        s.scale.set(1 + sq * 0.35, 1 - sq * 0.3, 1 + sq * 0.35)
        if (k >= 1 && this.stampT - dt < 0.45) {
          sfx.stamp()
          this.sparkles.burst(tmp.copy(s.position), 30, 0.9, 0.9, 0.9, 0.035)
        }
        if (this.stampT > 0.8) this.stampT = -1
      } else s.position.y = base + Math.sin(t * 2) * 0.02
    }
    // ---- Sparkle's balloon bobs over its corner, the burner flickering; picked, it roars and climbs away ----
    {
      const b = d.places.balloon
      const up = this.arrived?.id === 'balloon' ? this.time - this.arrived.t : -1
      const roar = up >= 0 ? 1 : bell(clamp(this.poked('balloon', 1) / 1, 0, 1))
      b.position.y = BALLOON_Y + Math.sin(t * 0.9) * 0.04 + (up > 0 ? up * up * 0.5 : 0) + (hint ? Math.abs(Math.sin(t * 4)) * 0.04 : 0)
      b.rotation.y = Math.sin(t * 0.4) * 0.3 + (up > 0 ? up * 1.4 : 0)
      b.rotation.z = Math.sin(t * 0.7) * 0.04
      d.balloon.flame.scale.setScalar(0.45 + 0.1 * Math.sin(t * 20) + roar * (1.1 + 0.3 * Math.sin(t * 40)))
    }
  }

  /** The city glitters: the sun on the river now and then, a window catching the light on a tower. */
  private stepGlints(dt: number) {
    if (Math.random() < dt * 5) {
      const p = this.d.river.at(this.reach[0] + Math.random() * (this.reach[1] - this.reach[0]), (Math.random() - 0.5) * 0.08)
      this.sparkles.emit(tmp.set(p.x, 0.012, p.z), new Vector3(0, 0.02, 0), 0.5 + Math.random() * 0.4, 0.014, 2)
    }
    if (Math.random() < dt * 1.6 && this.d.towers.length) {
      const [x, z, h] = this.d.towers[Math.floor(Math.random() * this.d.towers.length)]
      this.sparkles.emit(tmp.set(x + (Math.random() - 0.5) * 0.06, G + h * (0.4 + Math.random() * 0.6), z + 0.05), new Vector3(0, 0.03, 0), 0.7, 0.022, Math.random() < 0.5 ? 0 : 2)
    }
  }

  /** What rides the board: the skytrain, the boats, the tuk-tuk. */
  private stepMovers(dt: number, t: number) {
    const d = this.d
    // ---- The skytrain runs back and forth along its track; poked, ding-dong and it zooms ----
    {
      const k = this.poked('train', 2.6)
      const fast = k >= 0.5 ? 1 + 3 * bell(clamp((k - 0.5) / 2.1, 0, 1)) : k >= 0 ? 0.15 : 1
      const [from, to] = [0.25, d.rail.len - 0.25]
      this.trainD += this.trainDir * dt * 0.2 * fast
      if (this.trainD > to) [this.trainD, this.trainDir] = [to, -1]
      if (this.trainD < from) [this.trainD, this.trainDir] = [from, 1]
      d.train.forEach((car, i) => {
        const p = d.rail.at(this.trainD - this.trainDir * i * 0.128)
        car.position.set(p.x, G + TRACK_Y + 0.004 + (k >= 0 && k < 0.5 ? bell(k / 0.5) * 0.02 : 0), p.z)
        car.rotation.y = p.yaw + (this.trainDir < 0 ? Math.PI : 0)
        car.scale.setScalar(1.5)
      })
    }
    // ---- The boats sail the river end to end (growing in at one edge of the board, shrinking out at the other) ----
    const [r0, r1] = this.reach
    const span = r1 - r0
    for (const [i, b] of d.boats.entries()) {
      const info = BOATS[i]
      const k = this.poked(`boat:${i}`, 2.4)
      const fast = k >= 0 ? 1 + 2.2 * bell(clamp(k / 2.4, 0, 1)) : 1
      this.boatD[i] = (((this.boatD[i] + info.speed * dt * fast) % span) + span) % span
      const dir = Math.sign(info.speed)
      const at = (off: number, g: Group, base: number) => {
        const along = this.boatD[i] - dir * off
        const p = d.river.at(r0 + clamp(along, 0, span), info.side)
        const edge = Math.min(clamp(along / 0.25, 0, 1), clamp((span - along) / 0.25, 0, 1))
        g.position.set(p.x, 0.004 + Math.sin(t * 5 + i + off * 9) * 0.003 + (off === 0 && k >= 0 ? bell(clamp(k / 0.5, 0, 1)) * 0.03 : 0), p.z)
        g.rotation.set(0, p.yaw + (dir < 0 ? Math.PI : 0), Math.sin(t * 1.4 + i + off * 5) * 0.04)
        // (Never drawn tiny: an outline is as thick on a speck as on a boat.)
        g.scale.setScalar(base * (0.4 + 0.6 * edge * edge * (3 - 2 * edge)))
        g.visible = edge > 0.02
      }
      at(0, b.root, info.kind === 'longtail' ? 1 : 1.15)
      b.tail.forEach((g, j) => at(0.13 + j * 0.15, g, 0.26))
      if (b.root.visible && Math.random() < dt * 9 * fast) {
        const yaw = b.root.rotation.y
        this.foam.emit(tmp.set(b.root.position.x - Math.sin(yaw) * 0.09, 0.01, b.root.position.z - Math.cos(yaw) * 0.09), new Vector3(0, 0.04, 0), 0.7, 0.011)
      }
    }
    // ---- The tuk-tuk putters up and down Rama IV Road; poked, it hops and zips ----
    {
      const k = this.poked('tuktuk', 2)
      const fast = k >= 0 ? 1 + 2.5 * bell(clamp(k / 2, 0, 1)) : 1
      this.tukD += this.tukDir * dt * 0.1 * fast
      if (this.tukD > d.road.len - 0.05) [this.tukD, this.tukDir] = [d.road.len - 0.05, -1]
      if (this.tukD < 0.05) [this.tukD, this.tukDir] = [0.05, 1]
      const p = d.road.at(this.tukD, 0.012)
      d.tuktuk.position.set(p.x, G + (k >= 0 ? bell(clamp(k / 0.4, 0, 1)) * 0.06 : Math.abs(Math.sin(t * 11)) * 0.003), p.z)
      d.tuktuk.rotation.y = p.yaw + (this.tukDir < 0 ? Math.PI : 0)
    }
  }

  private stepToys(dt: number, t: number) {
    const d = this.d
    // ---- Clouds drift a little; a poked one rains ----
    for (const [i, c] of d.clouds.entries()) {
      const [lon, lat, cy] = CLOUDS[i]
      const [x, z] = ll(lon, lat)
      c.position.set(x + Math.sin(t * 0.3 + i * 2) * 0.08, cy + Math.sin(t * 0.7 + i) * 0.02, z + Math.cos(t * 0.25 + i) * 0.05)
      c.rotation.y = this.rig.yaw * DEG
      if (this.rain[i] >= 0) {
        this.rain[i] += dt
        const k = this.rain[i]
        c.scale.set(1 + 0.08 * bell(Math.min(1, k / 0.4)), 1 - 0.1 * bell(Math.min(1, k / 0.4)), 1)
        if (k < 1.6 && Math.random() < dt * 40) this.drops.emit(tmp.set(c.position.x + (Math.random() - 0.5) * 0.4, c.position.y - 0.08, c.position.z + (Math.random() - 0.5) * 0.25), new Vector3(0, -0.6, 0), 0.5, 0.012)
        if (k > 1.6) this.rain[i] = -1
      }
    }
    // ---- Asiatique's wheel turns slowly; poked, it spins fast through its tune ----
    {
      const k = this.poked('spot:asiatique', 3)
      this.wheelA += dt * (0.3 + (k >= 0 ? 5 * bell(clamp(k / 3, 0, 1)) : 0))
      d.wheel.rotation.z = this.wheelA
    }
    // ---- Chinatown's lanterns sway; poked, they swing wide ----
    {
      const k = this.poked('spot:chinatown', 1.6)
      d.lanterns.rotation.z = Math.sin(t * 1.6) * 0.06 + (k >= 0 ? Math.sin(k * 14) * 0.5 * (1 - k / 1.6) : 0)
    }
    // ---- Lumphini: the swan boat goes round the lake (poked, it twirls); the lizard basks, and slides in when poked ----
    {
      const [lx, lz] = ll(LAKES[0][0], LAKES[0][1])
      const [rx, rz] = [LAKES[0][2] * DEG_M * 0.55, LAKES[0][3] * DEG_M * 0.5]
      const a = t * 0.35
      const k = this.poked('swan', 1.2)
      d.swan.position.set(lx + Math.cos(a) * rx, G + 0.004 + Math.sin(t * 3) * 0.002, lz + Math.sin(a) * rz)
      d.swan.rotation.y = Math.atan2(-Math.sin(a) * rx, Math.cos(a) * rz) + (k >= 0 ? (k / 1.2) * Math.PI * 4 : 0)
      // The lizard: off the bank, a dip under the water with a splash, then back out to bask.
      const z = this.poked('lizard', 3.4)
      const inK = z >= 0 ? bell(clamp(z / 3.4, 0, 1)) : 0
      const swim = clamp(inK * 2.2, 0, 1)
      d.lizard.position.set(lx - 0.02 + swim * 0.05, G + 0.004 - clamp(inK * 2.2 - 1, 0, 1) * 0.02, lz + 0.085 - swim * 0.075)
      d.lizard.rotation.y = Math.PI + Math.sin(t * 0.8) * 0.2 + swim * 0.5 + (z >= 0 ? Math.sin(z * 12) * 0.25 : 0)
      if (z >= 0.75 && z - dt < 0.75) this.foam.burst(tmp.set(lx + 0.02, G + 0.012, lz + 0.015), 10, 0.3, 0.45, 0.5, 0.016)
    }
    // ---- The port's crane lowers its box onto the quay and lifts it again ----
    {
      const k = this.poked('spot:port', 2.4)
      d.craneBox.position.y = CRANE_BOX_Y - (k >= 0 ? bell(clamp(k / 2.4, 0, 1)) * 0.09 : 0) + Math.sin(t * 1.1) * 0.002
      d.craneBox.rotation.z = Math.sin(t * 1.3) * 0.04
    }
    // ---- Bang Krachao's birds sit on the tower's roof; poked, they fly up round it and settle again ----
    {
      const k = this.poked('spot:krachao', 2.6)
      const up = k >= 0 ? bell(clamp(k / 2.6, 0, 1)) : 0
      d.birds.forEach((b, i) => {
        const a = i * 2.1 + (k >= 0 ? k * (3.2 + i * 0.4) : 0)
        const r = 0.035 + up * (0.09 + i * 0.02)
        b.position.set(Math.cos(a) * r, 0.2 + up * (0.12 + i * 0.03) + (k < 0 ? Math.abs(Math.sin(t * 3 + i * 2)) * 0.004 : Math.sin(k * 20 + i) * 0.006), Math.sin(a) * r)
        b.rotation.y = k >= 0 ? -a : i * 2.1 + Math.sin(t + i) * 0.5
        b.scale.setScalar(1.4)
      })
    }
    // ---- ICONSIAM's fountain: a little dance every so often (the big one when she picks the mall) ----
    {
      this.fountainT += dt
      const big = this.arrived?.id === 'iconsiam'
      if (!big && this.fountainT > 9) this.fountainT = 0
      const on = big ? this.fountainT < 2.6 : this.fountainT < 1.8
      if (on && Math.random() < dt * (big ? 70 : 34)) {
        const [fx, fy, fz] = d.fountain
        const a = Math.random() * Math.PI * 2
        const jet = (big ? 1.5 : 1.0) * (0.75 + 0.25 * Math.sin(this.fountainT * 7))
        this.drops.emit(tmp.set(fx + Math.cos(a) * 0.02, fy, fz + Math.sin(a) * 0.02), new Vector3(Math.cos(a) * 0.1, jet, Math.sin(a) * 0.1), 0.85, 0.013)
      }
    }
  }

  // ---------------------------------------------------------------- touch

  private after(s: number, f: () => void) {
    this.later.push({ t: this.time + s, f })
  }

  /** The ray under a screen point. */
  private ray(x: number, y: number) {
    const cam = this.rig.camera
    const n = this.ndc(x, y)
    const near = new Vector3(n.x, n.y, -1).unproject(cam)
    const dir = new Vector3(n.x, n.y, 1).unproject(cam).sub(near).normalize()
    return { near, dir }
  }

  /** Where a screen point meets the city's ground. */
  private groundAt(x: number, y: number) {
    const { near, dir } = this.ray(x, y)
    if (dir.y > -1e-4) return null
    return near.clone().addScaledVector(dir, (G - near.y) / dir.y)
  }

  /** The tower under a screen point (the nearest one the ray passes through), or -1. */
  private towerAt(x: number, y: number) {
    const { near, dir } = this.ray(x, y)
    let best = -1
    let bestD = Infinity
    for (const [i, [tx, tz, h]] of this.d.towers.entries()) {
      for (let k = 0; k <= 5; k++) {
        tmp.set(tx, G + (h * k) / 5, tz).sub(near)
        const along = tmp.dot(dir)
        const off = Math.sqrt(Math.max(0, tmp.lengthSq() - along * along))
        if (off < 0.06 + h * 0.04 && along < bestD) {
          bestD = along
          best = i
        }
      }
    }
    return best
  }

  private screenOf(v: Vector3) {
    const c = v.clone().project(this.rig.camera)
    return c.z > 1 ? null : { x: ((c.x + 1) / 2) * this.w, y: ((1 - c.y) / 2) * this.h }
  }

  protected onTap(id: string | null, x: number, y: number): void {
    if (this.arrived) return
    if (id === null) {
      // A tower: its windows twinkle up it, a higher tune for a taller one.
      const ti = this.towerAt(x, y)
      if (ti >= 0) {
        const [tx, tz, h] = this.d.towers[ti]
        for (let i = 0; i < 4; i++) this.after(i * 0.07, () => this.sparkles.burst(tmp.set(tx, G + h * (0.3 + i * 0.25), tz + 0.04), 4, 0.3, 0.2, 0.6, 0.02))
        sfx.twinkle(clamp((h - 0.25) / 0.55, 0, 1))
        this.ev.poked('tower')
        return
      }
      const g = this.groundAt(x, y)
      if (!g || g.x < BOARD.x0 || g.x > BOARD.x1 || g.z < BOARD.z0 || g.z > BOARD.z1) return
      // On the board near a place or a spot: as if she'd tapped it.
      for (const p of PLACE_IDS) if (Math.hypot(PLACES[p].at[0] - g.x, PLACES[p].at[1] - g.z) < 0.24) return this.onTap(`place:${p}`, x, y)
      for (const s of SPOT_IDS) if (Math.hypot(SPOTS[s][0] - g.x, SPOTS[s][1] - g.z) < 0.2) return this.onTap(`spot:${s}`, x, y)
      // A bridge: its cars beep hello.
      for (const [bx, bz] of this.d.bridges)
        if (Math.hypot(bx - g.x, bz - g.z) < 0.16) {
          this.sparkles.burst(tmp.set(bx, 0.2, bz), 8, 0.4, 0.4, 0.6, 0.02)
          sfx.honk()
          this.ev.poked('bridge')
          return
        }
      // The river: a splash where she touched it.
      if (this.f.land(g.x, g.z) < -0.01) {
        this.foam.burst(tmp.set(g.x, 0.02, g.z), 10, 0.35, 0.5, 0.5, 0.018)
        sfx.plip()
        this.ev.poked('river')
      }
      return
    }
    if (id.startsWith('place:')) return this.choose(id.slice(6) as PlaceId)
    if (id.startsWith('pin:')) return this.choose(PINS[id.slice(4) as PinId].place)
    if (id.startsWith('spot:')) return this.pokeSpot(id.slice(5) as SpotId)
    if (id.startsWith('cloud:')) {
      const i = Number(id.slice(6))
      if (this.rain[i] < 0) this.rain[i] = 0
      sfx.rain()
      return
    }
    if (id.startsWith('boat:')) {
      if (this.poked(id, 1.2) >= 0) return
      this.poke(id)
      sfx.horn()
      this.ev.poked('boat')
      return
    }
    switch (id) {
      case 'train':
        if (this.poked('train', 2.6) >= 0) return
        this.poke('train')
        sfx.doors()
        this.after(0.5, () => sfx.train())
        this.ev.poked('train')
        return
      case 'tuktuk':
        this.poke('tuktuk')
        sfx.tuktuk()
        this.ev.poked('tuktuk')
        return
      case 'swan':
        this.poke('swan')
        return sfx.plip()
      case 'lizard':
        return this.pokeSpot('lumphini')
    }
  }

  // ---------------------------------------------------------------- camera, tap targets, hints

  protected shot(): Shot {
    if (this.arrived && this.time - this.arrived.t > HOP_S) {
      const id = this.arrived.id
      // Up and away: the camera rises after the balloon.
      if (id === 'balloon') {
        const p = this.d.places.balloon.position
        return { center: new Vector3(p.x, p.y + 0.4, p.z), half: new Vector3(0.6, 0.5, 0.6), yaw: BANGKOK_CAM.yaw, pitch: 24, minDist: 2 }
      }
      // Diving in: the house's front door, or ICONSIAM's front on the river.
      const p = this.d.places[id].position
      return { center: new Vector3(p.x + (id === 'iconsiam' ? 0.1 : 0), p.y + 0.12, p.z), half: new Vector3(0.3, 0.14, 0.3), yaw: id === 'iconsiam' ? 38 : 0, pitch: 26, minDist: 0.8 }
    }
    // The entrance (as on the other maps): from the plain view, turned by BANGKOK_CAM.yaw, down and in to where it
    // settles. The board and its tray, object-fit: contain, so it floats in the middle of the sky on any screen shape,
    // and hers to turn (boardShot).
    const k = this.entrance.k
    const tall = this.w < this.h
    const zoom = 1 + (BANGKOK_CAM.zoom - 1) * k
    if (tall) return boardShot(BOARD_BOX, BANGKOK_CAM.yaw, 64 + BANGKOK_CAM.pitch * k * 0.6, zoom, { minDist: 3 })
    return boardShot(BOARD_BOX, BANGKOK_CAM.yaw, 56 + BANGKOK_CAM.pitch * k, zoom, { minDist: 3 })
  }

  /** The entrance rides the camera exactly (no lag). */
  protected snap() {
    return this.entrance.running && !this.arrived
  }

  // ---------------------------------------------------------------- the sky round the board

  private buildSky() {
    const { scene, bag } = this
    // Clouds drifting high over the board, each with its shadow on the city.
    for (const [x, y, z, s] of [[-1.6, 1.55, -0.4, 0.55], [0.7, 1.7, 1.2, 0.48], [1.9, 1.6, -1.7, 0.42]]) {
      const root = puffCloud(bag, s)
      root.position.set(x, y, z)
      const shadow = blobShadow(0.3 * s, bag)
      scene.add(root, shadow)
      this.drifters.push({ root, shadow, speed: 0.04 + s * 0.03, y })
    }
    // Clouds below, round the tray: the board floats in the sky Sparkle's balloon flies through.
    const low: [number, number, number, number][] = [
      [-4.4, -1.0, -1.6, 1.7], [4.5, -1.2, -0.6, 1.9], [-4.6, -1.4, 1.9, 1.8], [4.3, -0.9, 2.4, 1.5],
      [-1.4, -1.5, 3.9, 2.0], [2.2, -1.3, -3.8, 1.7], [-3.4, -1.7, -3.6, 1.5], [3.6, -1.8, 4.0, 1.7], [0.6, -1.9, -4.3, 1.4],
    ]
    for (const [x, y, z, s] of low) {
      const c = puffCloud(bag, s)
      c.position.set(x, y, z)
      scene.add(c)
      this.under.push(c)
    }
  }

  private stepSky(dt: number, t: number) {
    const x0 = BOARD.x0 - 0.9
    const x1 = BOARD.x1 + 0.9
    for (const c of this.drifters) {
      const p = c.root.position
      p.x += c.speed * dt
      if (p.x > x1) p.x = x0
      p.y = c.y + Math.sin(t * 0.7 + c.speed * 90) * 0.04
      const wet = this.f.land(clamp(p.x, BOARD.x0, BOARD.x1), clamp(p.z, BOARD.z0, BOARD.z1)) < 0
      c.shadow.position.set(p.x, (wet ? 0 : G) + 0.012, p.z)
      c.shadow.visible = p.x > BOARD.x0 && p.x < BOARD.x1
      c.root.rotation.y = this.rig.yaw * DEG
    }
    this.under.forEach((c, i) => {
      c.position.y += Math.cos(t * 0.4 + i * 1.9) * 0.04 * dt
      c.rotation.y = this.rig.yaw * DEG
    })
  }

  /** What the "do this" finger points at: ICONSIAM's pin until she has the mall day's stamp, then the house's. */
  private hintPin(): PinId {
    return this.d.stamp.visible ? 'house' : 'iconsiam'
  }

  protected hintAt() {
    if (this.arrived) return null
    const p = this.d.pins[this.hintPin()].root.position
    return p.clone().setY(p.y + PIN.top * PIN.size * 0.7)
  }

  protected anchorAt(id: string): AnchorSpot | null {
    if (this.arrived) return null
    const d = this.d
    const glow = this.time - this.lastTouch > STUCK_S
    if (id.startsWith('place:')) {
      const p = id.slice(6) as PlaceId
      const [x, z] = PLACES[p].at
      if (p === 'balloon') return { at: d.places.balloon.position.clone().setY(d.places.balloon.position.y + 0.5), r: 0.3, prio: 5, max: 150, glow }
      return { at: new Vector3(x, G + 0.14, z), r: 0.28, prio: 3, max: 150 }
    }
    if (id.startsWith('pin:')) {
      const g = d.pins[id.slice(4) as PinId].root
      // (Over the toys under it: the pin is what she taps.)
      return { at: g.position.clone().setY(g.position.y + PIN.top * PIN.size * 0.5), r: 0.22, prio: 6, max: 150, glow }
    }
    if (id.startsWith('spot:')) {
      const s = id.slice(5) as SpotId
      const [x, z] = SPOTS[s]
      const tall = s === 'mahanakhon' ? 0.4 : s === 'asiatique' ? 0.22 : 0.12
      return { at: new Vector3(x, G + tall, z), r: 0.2, prio: 2, max: 130 }
    }
    if (id.startsWith('cloud:')) return { at: d.clouds[Number(id.slice(6))].position.clone(), r: 0.26, prio: 1, max: 140 }
    if (id.startsWith('boat:')) {
      const b = d.boats[Number(id.slice(5))].root
      return b.visible ? { at: b.position.clone().setY(0.05), r: 0.11, prio: 4, max: 100 } : null
    }
    switch (id) {
      case 'train':
        return { at: d.train[1].position.clone().setY(G + TRACK_Y + 0.04), r: 0.14, prio: 4, max: 110 }
      case 'tuktuk':
        return { at: d.tuktuk.position.clone().setY(G + 0.05), r: 0.09, prio: 4, max: 100 }
      case 'swan':
        return { at: d.swan.position.clone().setY(G + 0.04), r: 0.06, prio: 4, max: 90 }
      case 'lizard':
        return { at: d.lizard.position.clone().setY(G + 0.03), r: 0.07, prio: 4, max: 90 }
    }
    return null
  }

  qa() {
    const pt = (v: Vector3) => {
      const s = this.screenOf(v)
      return s ? [Math.round(s.x), Math.round(s.y)] : null
    }
    const pins: Record<string, unknown> = {}
    for (const id of PIN_IDS) pins[id] = pt(this.d.pins[id].root.position.clone().setY(this.d.pins[id].root.position.y + PIN.top * PIN.size * 0.5))
    const spots: Record<string, unknown> = {}
    for (const id of SPOT_IDS) spots[id] = pt(new Vector3(SPOTS[id][0], G + 0.12, SPOTS[id][1]))
    // (Everything that should stand on dry land: none of it in the river.)
    const wet = [
      ...(['house', 'iconsiam'] as const).filter((id) => this.f.land(...PLACES[id].at) < 0.1).map((id) => `place ${id}`),
      ...SPOT_IDS.filter((id) => this.f.land(...SPOTS[id]) < 0.06).map((id) => `spot ${id}`),
      ...this.d.towers.filter(([x, z]) => this.f.land(x, z) < 0.03).map(([x, z]) => `tower ${x.toFixed(2)},${z.toFixed(2)}`),
    ]
    // (A pin's tap target is on top: no toy's middle may sit under one, or a tap on the toy would open the place.)
    const covered: string[] = []
    for (const id of PIN_IDS) {
      const pin = this.anchorAt(`pin:${id}`)
      const box = pin && this.toScreen(pin.at, pin.r, pin.max)
      if (!box) continue
      for (const s of SPOT_IDS) {
        const at = this.screenOf(new Vector3(SPOTS[s][0], G + 0.12, SPOTS[s][1]))
        if (at && Math.abs(at.x - box.x) < box.size / 2 && Math.abs(at.y - box.y) < box.size / 2) covered.push(`${s} under ${id}'s pin`)
      }
    }
    return {
      game: 'bangkok-map',
      arrived: this.arrived?.id ?? null,
      stamp: this.d.stamp.visible,
      touches: this.touches,
      points: { pins, spots, balloon: pt(this.d.places.balloon.position.clone().setY(this.d.places.balloon.position.y + 0.5)), train: pt(this.d.train[1].position), tuktuk: pt(this.d.tuktuk.position) },
      /** Which way the camera faces (degrees): her drag swings it round. */
      yaw: Math.round(this.rig.yaw * 10) / 10,
      /** How many towers stand (of layout.ts TOWERS), and anything standing in the river (should be none). */
      towers: [this.d.towers.length, TOWERS.length],
      wet,
      covered,
      poked: [...this.pokeT.keys()],
    }
  }
}
