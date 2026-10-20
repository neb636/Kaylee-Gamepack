// The way into the boat race (race/race.ts), east of the pier: an inflatable rainbow arch with a checkered banner, a
// lane of pink and white buoys leading up to it, between two rock towers, the lagoon's wall of rock behind. It glows
// like the other stops (🏁 at the screen's edge when it's off screen) until she has won; drive through it and the
// longtail glides in, and the race begins (BoatTrip.tsx swaps worlds behind a checkered flag). The gate stays open
// after: through it again is a rematch. Once she has won, her trophy rides in the boat's bow.
import { DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3, type BufferGeometry } from 'three'
import type { AnchorInfo } from '../../../engine/Anchors'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { L } from '../../../lines'
import { sfx } from '../../../sfx'
import { CARGO } from '../../../trip/vehicles/longtail'
import { checker, RAINBOW } from '../race/scenery'
import { buildTrophy } from '../race/trophy'
import type { Bay } from './bay'
import { RACE_GATE, RACE_GLOW, RACE_ROCKS, type Rock } from './layout'
import type { BayPart, Box, Circle, Spot } from './part'
import { foamRing, tower } from './scenery'

export const RACE_GATE_ANCHORS: AnchorInfo[] = [{ id: 'race-gate', label: 'The boat race', kind: 'thing' }]

/** Across the gate (the arch's feet are this far either side of the middle). */
const SPAN = RACE_GATE.half + 1.2

export class RaceGate implements BayPart {
  /** Away from the gate since the last time through it (a boat that just came out doesn't go straight back in). */
  armed: boolean
  private flags: Group[] = []
  private balloons: Group[] = []

  constructor(
    private bay: Bay,
    fromRace: boolean,
  ) {
    const { bag, scene } = bay
    this.armed = !fromRace
    // ---- The towers, the buoy lane, the arch ----
    const parts: BufferGeometry[] = RACE_ROCKS.flatMap((r) => tower(r))
    for (let x = RACE_GATE.x - 22; x <= RACE_GATE.x - 1; x += 2)
      for (const s of [-1, 1]) parts.push(P.sphere(0.32, ((x - RACE_GATE.x) / 2) % 2 ? '#FFFFFF' : PAL.hotpink, { at: [x, 0.12, RACE_GATE.z + s * (RACE_GATE.half + 0.6)], scale: [1, 0.8, 1] }, 8))
    for (const s of [-1, 1]) parts.push(P.box(21, 0.06, 0.06, '#FFF7F0', { at: [RACE_GATE.x - 11.5, 0.2, RACE_GATE.z + s * (RACE_GATE.half + 0.6)] }))
    scene.add(solid(merge(parts), bag, 2.5))
    scene.add(new Mesh(bag.add(merge(RACE_ROCKS.map(foamRing))), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))))
    const arch = new Group()
    arch.position.set(RACE_GATE.x, 0, RACE_GATE.z)
    arch.rotation.y = RACE_GATE.heading
    const ap: BufferGeometry[] = RAINBOW.map((c, i) => P.torus(SPAN - i * 0.5, 0.3, c, { at: [0, 0.4, 0] }, Math.PI))
    for (const s of [-1, 1]) ap.push(P.cyl(1.3, 1.5, 1, '#FFFFFF', { at: [s * (SPAN - 1.2), 0.2, 0] }, 14), P.sphere(0.3, PAL.gold, { at: [s * (SPAN - 1.2), 1, 0.8] }, 8), P.cyl(0.06, 0.06, 3.4, '#8C6A55', { at: [s * (SPAN - 0.4), 2.3, -0.4] }, 5))
    arch.add(solid(merge(ap), bag, 2))
    const banner = new Mesh(bag.add(new PlaneGeometry(SPAN * 1.2, 1.1)), bag.add(new MeshBasicMaterial({ map: checker(bag, 14, 2), side: DoubleSide })))
    banner.position.set(0, SPAN - 0.9, 0.1)
    arch.add(banner)
    // Checkered flags on their poles, and a balloon tied at each foot.
    const flagMat = bag.add(new MeshBasicMaterial({ map: checker(bag, 4, 3), side: DoubleSide }))
    const flagGeo = bag.add(new PlaneGeometry(1.4, 1)).translate(-0.7, 0, 0)
    for (const s of [-1, 1]) {
      const f = new Mesh(flagGeo, flagMat)
      const g = new Group()
      g.position.set(s * (SPAN - 0.4), 3.5, -0.4)
      g.add(f)
      arch.add(g)
      this.flags.push(g)
      const b = new Group()
      b.position.set(s * (SPAN - 1.6), 0.7, 0.6)
      b.add(solid(merge([P.cyl(0.02, 0.02, 2.6, '#FFFFFF', { at: [0, 1.3, 0] }, 4), P.sphere(0.6, s < 0 ? PAL.pink : PAL.sky, { at: [0, 3, 0], scale: [1, 1.18, 1] }, 12)]), bag, 2))
      arch.add(b)
      this.balloons.push(b)
    }
    scene.add(arch)
    // She has won before (a link with stops=race): her trophy rides in the bow.
    if (bay.stops.has('race')) this.trophyInBoat()
  }

  /** The race's trophy, in the longtail's bow (it faces back at the family). */
  trophyInBoat() {
    const lt = this.bay.rides.longtail.v
    if (lt.cargo.getObjectByName('trophy')) return
    const t = buildTrophy(this.bay.bag, 0.75)
    t.name = 'trophy'
    t.position.set(...CARGO.trophy)
    t.rotation.y = Math.PI
    lt.cargo.add(t)
  }

  towers(): Rock[] {
    return RACE_ROCKS
  }

  bumps(x: number, z: number, circles: Circle[], boxes: Box[]) {
    if (Math.abs(x - RACE_GATE.x) > 50 || Math.abs(z - RACE_GATE.z) > 50) return
    for (const r of RACE_ROCKS) circles.push([r.x, r.z, r.r])
    // The arch's two fat floats.
    for (const s of [-1, 1]) circles.push([RACE_GATE.x, RACE_GATE.z + s * (SPAN - 1.2), 1.5])
    void boxes
  }

  /** The longtail's bow at (bx, bz): through the gate, into the race. */
  arrive(bx: number, bz: number) {
    const bay = this.bay
    const d = bay.rides.longtail.d
    const away = Math.hypot(d.x - RACE_GLOW.x, d.z - RACE_GLOW.z)
    if (!this.armed && away > RACE_GLOW.r + 8) this.armed = true
    if (!this.armed || Math.hypot(bx - RACE_GLOW.x, bz - RACE_GLOW.z) >= RACE_GLOW.r) return false
    this.armed = false
    bay.setPhase('swap')
    sfx.vroom()
    bay.glide(bay.rides.longtail, { x: RACE_GATE.x + 8, z: RACE_GATE.z, h: RACE_GATE.heading }, 1.3, () => bay.raceNow())
    return true
  }

  anchorAt(id: string): Spot | null {
    if (id !== 'race-gate' || this.bay.using !== 'longtail' || this.bay.phase !== 'drive') return null
    const d = this.bay.rides.longtail.d
    if (Math.hypot(d.x - RACE_GATE.x, d.z - RACE_GATE.z) > 110) return null
    return { at: new Vector3(RACE_GATE.x, SPAN - 0.9, RACE_GATE.z), r: 3, prio: 2 }
  }

  tap(id: string): boolean {
    if (id !== 'race-gate') return false
    sfx.pop()
    this.bay.driveTo(RACE_GLOW.x, RACE_GLOW.z)
    return true
  }

  update(dt: number, t: number) {
    this.flags.forEach((g, i) => (g.rotation.y = Math.sin(t * 4 + i * 1.7) * 0.35))
    this.balloons.forEach((b, i) => {
      b.rotation.x = Math.sin(t * 1.4 + i) * 0.08
      b.rotation.z = Math.cos(t * 1.2 + i * 2) * 0.06
    })
    // The first time she sees it: "A boat race! Drive through the rainbow gate!"
    const bay = this.bay
    if (bay.using === 'longtail' && bay.phase === 'drive' && !bay.stops.has('race') && !bay.isSunset()) {
      const d = bay.rides.longtail.d
      if (Math.hypot(d.x - RACE_GATE.x, d.z - RACE_GATE.z) < 70) bay.once('raceGate', L.race.gate)
    }
    void dt
  }

  /** Where the "do this" finger points after a while with nothing touched: nothing here (the glow is enough). */
  hint() {
    return null
  }
}
