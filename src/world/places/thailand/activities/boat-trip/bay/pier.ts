// The pier (section `pier`), the side verb: tie the ribbons. The longtail waits at the pier, bobbing; a basket of ribbon
// rolls in six colors and a jasmine garland sit on the boards by its bow. Tap a color and the ribbon flutters through
// the air onto the prow (three of them; a fourth takes the place of the oldest); tap the garland and it hangs on the
// prow too. Real Thai boats wear them for the boat's spirit (Mae Ya Nang) and good luck. Then Daddy steps in (the boat
// tips: whoa-oa-oa), Mommy, and Kaylee hops to the tiller. The first time she drives off, Daddy says "Pai!" (bay.ts).
import { Group, Vector3 } from 'three'
import { bell } from '../../../../../../sdk'
import type { AnchorInfo } from '../../../engine/Anchors'
import type { Shot } from '../../../engine/camera'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { PROW, RIBBON_COLORS } from '../../../trip/vehicles/longtail'
import type { Bay } from './bay'
import { MOORED, PIER } from './layout'
import type { BayPart, RiderId, Spot } from './part'
import type { BoatSection } from '../sections'

const COLORS = Object.keys(RIBBON_COLORS)
export const PIER_ANCHORS: AnchorInfo[] = [...COLORS.map((c): AnchorInfo => ({ id: `ribbon:${c}`, label: `${c} ribbon`, kind: 'thing' })), { id: 'garland', label: 'Jasmine garland', kind: 'thing' }]

/** The basket on the boards by the bow, and where each roll sits in it (world). */
const BASKET = new Vector3(PIER.x + 0.75, 1.03, MOORED.z - 1.6)
const rollAt = (i: number) => new Vector3(BASKET.x + ((i % 3) - 1) * 0.34, BASKET.y + 0.32 + Math.floor(i / 3) * 0.05, BASKET.z + (Math.floor(i / 3) - 0.5) * 0.34)
/** The garland waits on its banana leaf at the end of the pier, right by the prow. */
const GARLAND_AT = new Vector3(PIER.x + 0.95, 1.1, MOORED.z - 3.4)

interface Flight {
  g: Group
  from: Vector3
  t: number
  done: () => void
}

export class PierStop implements BayPart {
  /** The ribbons on the bow, oldest first. */
  ribbons: string[]
  garland = false
  private rolls: Group[] = []
  private garlandProp: Group
  private flights: Flight[] = []
  private boarding = -1
  private wiggle = new Map<string, number>()
  private tying = false

  constructor(
    private bay: Bay,
    ribbons: string[] | null,
  ) {
    const { bag, scene } = bay
    this.ribbons = ribbons?.slice(0, 3) ?? []
    // ---- The basket, its six ribbon rolls, and the garland on a banana leaf ----
    scene.add(solid(merge([P.cyl(0.62, 0.5, 0.3, '#D9A86C', { at: [BASKET.x, BASKET.y + 0.15, BASKET.z], scale: [1, 1, 0.9] }, 16), P.torus(0.6, 0.05, '#C48F55', { at: [BASKET.x, BASKET.y + 0.3, BASKET.z], rot: [Math.PI / 2, 0, 0], scale: [1, 0.9, 1] })]), bag, 2))
    COLORS.forEach((c, i) => {
      const g = new Group()
      g.add(solid(merge([P.cyl(0.13, 0.13, 0.2, RIBBON_COLORS[c], { rot: [0, 0, Math.PI / 2] }, 14), P.cyl(0.05, 0.05, 0.22, '#FFFFFF', { rot: [0, 0, Math.PI / 2] }, 8), P.box(0.12, 0.012, 0.3, RIBBON_COLORS[c], { at: [0.03, -0.1, 0.16], rot: [0.5, 0, 0] })]), bag, 1.5))
      g.position.copy(rollAt(i))
      g.rotation.y = 0.3 * ((i % 3) - 1)
      scene.add(g)
      this.rolls.push(g)
    })
    this.garlandProp = new Group()
    const buds = []
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2
      buds.push(P.sphere(0.06, i % 4 === 0 ? '#FFE9A8' : '#FFFFFF', { at: [Math.sin(a) * 0.22, 0.06, Math.cos(a) * 0.22] }, 8))
    }
    buds.push(P.sphere(0.09, '#FFB43C', { at: [0.3, 0.06, 0] }, 10), P.sphere(0.075, PAL.hotpink, { at: [0.42, 0.06, 0.04] }, 10))
    buds.push(P.sphere(0.4, '#7CCB8C', { at: [0, 0, 0], scale: [1, 0.08, 0.7] }, 12))
    this.garlandProp.add(solid(merge(buds), bag, 1.5))
    this.garlandProp.position.copy(GARLAND_AT)
    scene.add(this.garlandProp)
    // Starting out on the water (a link past the pier): her ribbons and the garland are on the bow already.
    if (bay.section !== 'pier') {
      this.garland = true
      this.garlandProp.visible = false
      this.lt.v.setRibbons(this.ribbons)
      this.lt.v.setGarland(true)
    }
  }

  private get lt() {
    return this.bay.rides.longtail
  }

  /** The pier from the start: the ribbons she has (none, or a link's), everyone waiting on the boards. */
  begin(intro = true) {
    const bay = this.bay
    bay.setPhase('board')
    this.tying = true
    this.lt.v.setRibbons(this.ribbons)
    this.lt.v.setGarland(this.garland)
    this.lt.d.place(MOORED.x, MOORED.z, MOORED.heading)
    const spots: [RiderId, number, number][] = [
      // Side by side across the boards (from the camera off the bow nobody hides anybody).
      ['nick', PIER.x - 0.25, MOORED.z + 1.2],
      ['ji', PIER.x - 1.05, MOORED.z + 1.7],
      ['kaylee', PIER.x + 0.55, MOORED.z + 0.1],
    ]
    for (const [id, x, z] of spots) {
      const r = bay.rider(id)
      bay.scene.add(r.char.root)
      bay.put(r, x, 1.03, z, 'stand', id === 'kaylee' ? 150 : 90)
    }
    if (!intro) return
    bay.say(L.bay.ribbons)
    bay.strike(bay.rider('nick'), 'point', 1.8)
  }

  anchorAt(id: string): Spot | null {
    if (!this.tying || this.boarding >= 0) return null
    if (id === 'garland') return this.garland ? null : { at: GARLAND_AT.clone().setY(1.25), r: 0.45, prio: 3, glow: this.ribbons.length >= 3 }
    if (!id.startsWith('ribbon:')) return null
    const i = COLORS.indexOf(id.slice(7))
    if (i < 0) return null
    return { at: rollAt(i), r: 0.2, prio: 3, max: 120 }
  }

  tap(id: string): boolean {
    if (!this.tying || this.boarding >= 0) return false
    if (id === 'garland') {
      if (this.garland) return true
      this.garland = true
      // A copy flies; the one on the leaf goes.
      const copy = this.garlandProp.clone()
      this.bay.scene.add(copy)
      this.garlandProp.visible = false
      this.fly(copy, GARLAND_AT, () => {
        this.lt.v.setGarland(true)
        sfx.chime()
        this.bay.cheer(this.bay.rider('kaylee'))
        this.ready()
      })
      return true
    }
    if (!id.startsWith('ribbon:')) return false
    const c = id.slice(7)
    const i = COLORS.indexOf(c)
    this.wiggle.set(c, 0)
    sfx.fwip()
    const g = new Group()
    g.add(solid(P.box(0.12, 0.012, 0.6, RIBBON_COLORS[c], { at: [0, 0, -0.3] }), this.bay.bag, 1.5))
    this.bay.scene.add(g)
    this.fly(g, rollAt(i), () => {
      this.ribbons = [...this.ribbons, c].slice(-3)
      this.lt.v.setRibbons(this.ribbons)
      this.bay.ribbonsTied(this.ribbons)
      if (this.ribbons.length === 3) this.bay.once('ribbons', L.bay.facts.ribbons)
      sfx.flap()
      this.bay.rider('kaylee').char.react('hop')
      this.ready()
    })
    return true
  }

  /** Something flies in an arc from the pier onto the prow (and is gone when it gets there). */
  private fly(g: Group, from: Vector3, done: () => void) {
    this.flights.push({ g, from: from.clone(), t: 0, done })
  }

  /** Three ribbons and the garland: everyone gets in. */
  private ready() {
    if (this.ribbons.length < 3 || !this.garland || this.boarding >= 0) return
    this.boarding = 0
  }

  update(dt: number, t: number) {
    for (const f of [...this.flights]) {
      f.t += dt / 0.6
      const k = Math.min(1, f.t)
      const to = this.lt.v.body.localToWorld(PROW.clone())
      f.g.position.lerpVectors(f.from, to, k)
      f.g.position.y += bell(k) * 1.4
      f.g.rotation.set(Math.sin(k * 9) * 0.6, k * 5, 0)
      if (k >= 1) {
        this.flights.splice(this.flights.indexOf(f), 1)
        this.bay.scene.remove(f.g)
        f.done()
      }
    }
    // Rolls she just tapped wobble.
    COLORS.forEach((c, i) => {
      const w = this.wiggle.get(c)
      if (w === undefined) return
      const nw = w + dt / 0.5
      this.rolls[i].rotation.z = Math.sin(nw * 20) * 0.25 * (1 - Math.min(1, nw))
      if (nw >= 1) this.wiggle.delete(c)
      else this.wiggle.set(c, nw)
    })
    // The garland glows a little while it waits (after the three ribbons).
    if (!this.garland && this.ribbons.length >= 3) this.garlandProp.scale.setScalar(1 + Math.abs(Math.sin(t * 4)) * 0.1)
    if (this.boarding >= 0) this.board(dt)
  }

  /** Daddy first (the boat tips: whoa!), then Mommy, then Kaylee hops to the tiller, then off she goes. */
  private board(dt: number) {
    const bay = this.bay
    const lt = this.lt
    const before = this.boarding
    this.boarding += dt
    if (before === 0) {
      ;(['nick', 'ji', 'kaylee'] as const).forEach((id, i) => {
        const r = bay.rider(id)
        const pose = bay.poseIn(lt.v, r)
        bay.hop(r, lt.v.body, bay.seatPos(lt.v, r, pose), pose, 0, 0.5 + i * 0.6, () => {
          bay.tip(lt, i % 2 ? -2.2 : 2.8)
          if (i === 0) sfx.creak()
          if (i === 2) {
            this.tying = false
            this.boarding = -1
            bay.setPhase('drive')
            // (Tilting the phone, the gas pedal shows how instead of the finger line.)
            if (!bay.tilting) bay.say(L.bay.hint.drive)
          }
        })
      })
    }
  }

  hint(): Vector3 | null {
    if (!this.tying || this.boarding >= 0) return null
    if (this.ribbons.length < 3) return rollAt(COLORS.findIndex((c) => !this.ribbons.includes(c))).setY(BASKET.y + 0.45)
    return this.garland ? null : GARLAND_AT.clone().setY(1.3)
  }

  stuckLine() {
    if (!this.tying || this.boarding >= 0) return null
    return this.ribbons.length < 3 ? L.bay.hint.ribbon : this.garland ? null : L.bay.hint.garland
  }

  /** While she ties ribbons and they get in: from the water off the bow, the prow, the basket and the family. */
  shot(): Shot | null {
    if (!this.tying) return null
    const prow = this.lt.v.body.localToWorld(PROW.clone())
    const tall = this.bay.tall
    return { center: new Vector3((prow.x + BASKET.x) / 2, 1.3, (prow.z + BASKET.z) / 2 + 0.8), half: new Vector3(tall ? 2.2 : 3, 1.4, 2.2), yaw: this.bay.unwrap(160), pitch: 20, minDist: 5, maxDist: 30 }
  }

  sectionNow(): BoatSection | null {
    const d = this.lt.d
    return this.bay.section === 'pier' && this.bay.using === 'longtail' && Math.hypot(d.x - MOORED.x, d.z - MOORED.z) < 25 ? 'pier' : null
  }

  qa() {
    return { ribbons: [...this.ribbons], garland: this.garland, tying: this.tying }
  }
}
