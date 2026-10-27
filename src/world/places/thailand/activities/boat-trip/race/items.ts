// What lies on the race course (race.ts), Mario Kart style, in the toon look:
// - Lines of gold coins along the course (each one makes her boat a little faster, up to ten), back again next lap,
//   and golden arrow pads that give a burst of speed (the races' shared ones: trip/race/items.ts).
// - Two striped ramps to jump off: a small one, and the BIG JUMP right across the course, through a giant flower hoop,
//   with a line of coins in the air.
// - Banana peels on the water (the macaque drops them): drive over one and spin round.
// Each check takes a racer's place on the course (track.ts: `s` along it, `lat` across it).
import { AdditiveBlending, Color, Group, Mesh, MeshBasicMaterial, TorusGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { swell } from '../../../../../engine3d/water'
import { Coins, Pads, type Place } from '../../../trip/race/items'
import { ahead, BOOST_HALF, BOOSTS, COIN_LINES, HOOP, RAMPS, spotAt, type Ramp } from './track'

/** On the flat water: the ground is the surface. */
const place: Place = (s, lat) => ({ ...spotAt(s, lat), y: 0 })

interface Peel {
  g: Group
  x: number
  z: number
  age: number
  on: boolean
}

export class Course {
  readonly root = new Group()
  private coins: Coins
  private pads: Pads
  private peels: Peel[] = []
  private time = 0

  constructor(private bag: Bag) {
    // ---- Coins and boost pads ----
    this.coins = new Coins(bag, COIN_LINES, place)
    this.pads = new Pads(bag, BOOSTS, BOOST_HALF, place, ahead)
    this.root.add(this.coins.mesh, this.pads.root)

    // ---- The ramps: striped wedges on floats, their lips at the far end; the flower hoop past the big jump ----
    for (const r of RAMPS) this.root.add(this.ramp(r))
    this.root.add(this.hoop())

    // ---- Banana peels (a few, reused) ----
    for (let i = 0; i < 8; i++) {
      const g = this.peel()
      g.visible = false
      this.root.add(g)
      this.peels.push({ g, x: 0, z: 0, age: 0, on: false })
    }
  }

  /** A striped wedge on floats (pink and white, gold rails and lip), across the course at `r.s`. */
  private ramp(r: Ramp): Group {
    const rp = spotAt(r.s, r.lat)
    const ramp = new Group()
    ramp.position.set(rp.x, 0, rp.z)
    ramp.rotation.y = rp.heading
    const parts: BufferGeometry[] = []
    const slices = r.big ? 10 : 6
    const w = (r.half * 2) / slices
    const side: [number, number][] = [[-r.len / 2, 0.05], [r.len / 2, r.lip], [r.len / 2, 0.05]]
    for (let i = 0; i < slices; i++) {
      // The wedge's side profile (x along the course, y up), pushed across the course; rotated so x runs forward.
      parts.push(P.prism(side, w, i % 2 ? '#FFFFFF' : r.big ? PAL.lavenderDark : PAL.hotpink, { at: [-r.half + (i + 0.5) * w, 0, 0], rot: [0, -Math.PI / 2, 0] }))
    }
    // Gold rails up its sides, darker side walls (so it reads as a slope from behind), a gold lip.
    for (const s of [-1, 1]) {
      parts.push(P.box(0.2, 0.2, Math.hypot(r.len, r.lip - 0.05) + 0.2, PAL.gold, { at: [s * (r.half + 0.1), r.lip / 2 + 0.1, 0], rot: [-Math.atan2(r.lip - 0.05, r.len), 0, 0] }))
      parts.push(P.prism(side, 0.1, '#C93E7A', { at: [s * (r.half + 0.02), 0, 0], rot: [0, -Math.PI / 2, 0] }))
    }
    parts.push(P.box(r.half * 2 + 0.4, 0.22, 0.3, PAL.gold, { at: [0, r.lip + 0.02, r.len / 2] }))
    const floats = r.big ? [-0.75, -0.25, 0.25, 0.75] : [-0.88, 0.88]
    for (const f of floats) for (const z of [-r.len * 0.25, r.len * 0.25]) parts.push(P.cyl(0.45, 0.45, 1.1, '#5FA7E8', { at: [f * (r.half - 0.6), 0, z], rot: [Math.PI / 2, 0, 0] }, 10))
    // The big one has gold stars on its sides.
    if (r.big) for (const s of [-1, 1]) parts.push(P.prism(star(0.7), 0.12, PAL.gold, { at: [s * (r.half + 0.12), r.lip * 0.4, r.len * 0.2], rot: [0, Math.PI / 2, 0] }))
    ramp.add(solid(merge(parts), this.bag, 2))
    return ramp
  }

  /** The giant flower hoop over the course past the big jump: a pink ring half in the water, flowers all round it. */
  private hoop(): Group {
    const p = spotAt(HOOP.s)
    const g = new Group()
    g.position.set(p.x, HOOP.y, p.z)
    g.rotation.y = p.heading
    const parts: BufferGeometry[] = [P.torus(HOOP.r, 0.55, PAL.hotpink, {}), P.torus(HOOP.r, 0.25, '#FFFFFF', { at: [0, 0, -0.45] })]
    const petals = [PAL.butter, '#FFFFFF', PAL.mint, PAL.sky, '#FFB07A']
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2
      const x = Math.cos(a) * HOOP.r
      const y = Math.sin(a) * HOOP.r
      // (Only the ones above the water.)
      if (y + HOOP.y < 0.4) continue
      for (let k = 0; k < 5; k++) {
        const b = (k / 5) * Math.PI * 2
        parts.push(P.sphere(0.36, petals[i % petals.length], { at: [x + Math.cos(b) * 0.42, y + Math.sin(b) * 0.42, -0.55], scale: [1, 1, 0.5] }, 8))
      }
      parts.push(P.sphere(0.26, PAL.gold, { at: [x, y, -0.75] }, 8))
    }
    g.add(solid(merge(parts), this.bag, 2))
    return g
  }

  /** A big comic banana peel: three yellow flaps splayed out round a brown stalk. */
  peel(): Group {
    const g = new Group()
    const parts: BufferGeometry[] = [P.sphere(0.26, '#FFE15A', { at: [0, 0.18, 0], scale: [1, 0.8, 1] }, 10), P.cyl(0.06, 0.08, 0.3, '#8B6A4E', { at: [0, 0.42, 0] }, 6)]
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2
      parts.push(P.capsule(0.13, 0.5, k % 2 ? '#FFE15A' : '#F2C24C', { at: [Math.sin(a) * 0.38, 0.1, Math.cos(a) * 0.38], rot: [Math.cos(a) * 1.25, 0, -Math.sin(a) * 1.25] }))
    }
    g.add(solid(merge(parts), this.bag, 2))
    g.scale.setScalar(1.4)
    return g
  }

  /** Coins she drove (or flew) through, `y` her height above the water (each comes back after a while). */
  takeCoins(x: number, y: number, z: number): Vector3[] {
    return this.coins.take(x, y, z)
  }

  /** On a boost pad at (s, lat)? */
  onPad(s: number, lat: number) {
    return this.pads.on(s, lat)
  }

  /** Going up a ramp at (s, lat): which one, and how far up it (0 bottom .. 1 the lip), or null when not on one. */
  onRamp(s: number, lat: number): { ramp: Ramp; up: number } | null {
    for (const ramp of RAMPS) {
      const d = ahead(ramp.s - ramp.len / 2, s)
      if (d < 0 || d > ramp.len || Math.abs(lat - ramp.lat) > ramp.half) continue
      return { ramp, up: d / ramp.len }
    }
    return null
  }

  /** A banana peel dropped on the water at (x, z). */
  drop(x: number, z: number) {
    const p = this.peels.find((x) => !x.on) ?? this.peels.reduce((a, b) => (a.age > b.age ? a : b))
    p.on = true
    p.age = 0
    p.x = x
    p.z = z
    p.g.visible = true
    p.g.position.set(x, 0, z)
  }

  /** A racer at (x, z) runs over a peel: true (it's gone, squashed). */
  slip(x: number, z: number): Vector3 | null {
    for (const p of this.peels) {
      if (!p.on || p.age < 0.6 || (p.x - x) ** 2 + (p.z - z) ** 2 > 1.7 ** 2) continue
      p.on = false
      p.g.visible = false
      return new Vector3(p.x, 0.3, p.z)
    }
    return null
  }

  /** The peels on the water (for the rivals to steer round, and the minimap). */
  get peelsOut() {
    return this.peels.filter((p) => p.on)
  }

  update(dt: number) {
    this.time += dt
    const t = this.time
    this.coins.update(dt)
    this.pads.update(t)
    for (const p of this.peels) {
      if (!p.on) continue
      p.age += dt
      if (p.age > 30) {
        p.on = false
        p.g.visible = false
        continue
      }
      p.g.position.y = swell(p.x, p.z, t) + 0.02
      p.g.rotation.y = t * 0.6 + p.x
      p.g.scale.setScalar(1.4 * Math.min(1, p.age / 0.25))
    }
  }
}

/** A five-pointed star outline, `r` across. */
function star(r: number): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2
    const k = i % 2 ? r * 0.45 : r
    pts.push([Math.cos(a) * k, Math.sin(a) * k])
  }
  return pts
}

/** The rainbow round a racer while it lasts: a glowing ring on the water that cycles through the colors. */
export function buildAura(bag: Bag) {
  const mat = bag.add(new MeshBasicMaterial({ color: PAL.hotpink, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false }))
  const ring = new Mesh(bag.add(new TorusGeometry(3.6, 0.35, 8, 40)), mat)
  ring.rotation.x = Math.PI / 2
  ring.position.y = 0.3
  ring.visible = false
  const c = new Color()
  return {
    mesh: ring,
    update(t: number, on: boolean) {
      ring.visible = on
      if (!on) return
      c.setHSL((t * 0.9) % 1, 0.9, 0.62)
      mat.color.copy(c)
      ring.scale.setScalar(1 + Math.sin(t * 10) * 0.06)
    },
  }
}
