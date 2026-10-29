// Ice Floe Hop's look and its life (floe.ts is the toy): sea ice that reads as sea ice (snowy tops with soft lumps and
// little cracks over lavender-blue sides), far pointy icebergs on the horizon, Mama Bear's pink flag so the goal shows
// from a long way off, and the Arctic critters to poke: a ringed seal popping out of its breathing hole, a narwhal (the
// unicorn of the sea) surfacing near Pola, walruses snorting on the side floes and belugas arcing past. Everything is
// code-built in the flat toon look (geo.ts: one merged mesh and one outline per thing) and nothing here touches the
// fling, the floes' physics or the course (layout.ts).
import { BufferGeometry, CircleGeometry, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial, Shape, Vector2, Vector3 } from 'three'
import { clamp, smooth, sounds } from '../../../../../sdk'
import { noise, sfx, tone } from '../../../../kit/sfx'
import type { Bag } from '../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../engine3d/geo'
import type { Particles } from '../../../../engine3d/particles'
import { swell } from '../../../../engine3d/water'

/** The sea ice: a snowy top, a pale rim where the snow rounds over, lavender-blue sides and a deep blue underside. */
const SNOW = '#E0ECFF'
const LUMP = '#FFFFFF'
const RIM = '#C8DBFA'
const SIDE = '#9DBBEF'
const UNDER = '#7FA6DA'
const CRACK = '#8FAADB'
const BERG = '#F4F8FF'
const BERG_BLUE = '#C9DBF6'
const INK = '#2B2330'
const WHITE = '#FFFFFF'

/** Seeded random, so a floe always gets the same lumps. */
function rng(seed: number) {
  let s = (Math.abs(Math.floor(seed * 9973)) + 17) % 233280
  return () => (s = (s * 9301 + 49297) % 233280) / 233280
}

/** A point inside a floe's outline, `k` of the way out from the middle toward its edge at angle `a`. */
function inner(pts: [number, number][], a: number, k: number): [number, number] {
  let best = pts[0]
  let bestD = Infinity
  for (const p of pts) {
    const d = Math.abs(Math.atan2(Math.sin(Math.atan2(p[0], p[1]) - a), Math.cos(Math.atan2(p[0], p[1]) - a)))
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  const r = Math.hypot(best[0], best[1]) * k
  return [Math.sin(a) * r, Math.cos(a) * r]
}

/**
 * One floe's ice, its top at `top` and `thick` deep, in its footprint's coordinates (x, z). Colored by which way each
 * face points (snow up top, the rim, the sides, the underside), with soft snow lumps and a crack or two on top that stay
 * clear of the middle (where Pola lands most).
 */
export function iceGeometry(pts: [number, number][], top: number, thick: number, seed: number, lumps = true): BufferGeometry {
  const depth = thick - 0.12
  const shape = new Shape(pts.map(([x, z]) => new Vector2(x, -z)))
  const geo = new ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.08, bevelSegments: 2, curveSegments: 1 })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, top - depth - 0.06, 0)
  const body = bake(geo, SNOW)
  const pos = body.attributes.position
  const nrm = body.attributes.normal
  const col = body.attributes.color
  const c = { snow: hex(SNOW), rim: hex(RIM), side: hex(SIDE), under: hex(UNDER) }
  for (let i = 0; i < pos.count; i++) {
    const ny = nrm.getY(i)
    const y = pos.getY(i)
    const k = ny > 0.85 ? c.snow : ny < -0.6 ? c.under : y > top - 0.1 ? c.rim : c.side
    col.setXYZ(i, k[0], k[1], k[2])
  }
  const parts: BufferGeometry[] = [body]
  if (lumps) {
    const rand = rng(seed + 1)
    const r = pts.reduce((a, [x, z]) => a + Math.hypot(x, z), 0) / pts.length
    // Soft snow lumps near the edge.
    const n = r > 3 ? 7 : r > 1.5 ? 3 : 2
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const [x, z] = inner(pts, a, 0.62 + rand() * 0.18)
      const s = clamp(r * 0.16, 0.14, 0.42) * (0.7 + rand() * 0.6)
      parts.push(P.sphere(s, LUMP, { at: [x, top - s * 0.2, z], scale: [1.3, 0.45, 1] }, 12))
    }
    // A crack: two short zigzag strokes from the edge inward.
    if (r > 1.1) {
      const a = rand() * Math.PI * 2
      const [x0, z0] = inner(pts, a, 0.85)
      const [x1, z1] = inner(pts, a + 0.25, 0.55)
      const [x2, z2] = inner(pts, a - 0.05, 0.38)
      for (const [ax, az, bx, bz] of [
        [x0, z0, x1, z1],
        [x1, z1, x2, z2],
      ]) {
        const len = Math.hypot(bx - ax, bz - az)
        parts.push(P.box(len, 0.012, 0.045, CRACK, { at: [(ax + bx) / 2, top + 0.006, (az + bz) / 2], rot: [0, -Math.atan2(bz - az, bx - ax), 0] }))
      }
    }
  }
  return merge(parts)
}

const tmpC = { r: 0, g: 0, b: 0 }
function hex(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16)
  // (Vertex colors are linear, like bake's.)
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  tmpC.r = lin((n >> 16) & 255)
  tmpC.g = lin((n >> 8) & 255)
  tmpC.b = lin(n & 255)
  return [tmpC.r, tmpC.g, tmpC.b]
}

// ---------------------------------------------------------------- the critters

function eyes(x: number, y: number, z: number, r: number, gap: number): BufferGeometry[] {
  return [-1, 1].flatMap((s) => [P.sphere(r, INK, { at: [x + s * gap, y, z] }, 10), P.sphere(r * 0.38, WHITE, { at: [x + s * gap + r * 0.3, y + r * 0.35, z + r * 0.7] }, 8)])
}

/** A ringed seal, upright in its hole, facing her: grey with darker rings, a cream muzzle and big eyes. */
function sealGeometry() {
  const g = '#A7AFC3'
  return merge([
    P.capsule(0.24, 0.34, g, { at: [0, 0.3, 0] }),
    P.sphere(0.25, g, { at: [0, 0.66, 0.02] }),
    ...[
      [0.14, 0.38, 0.2],
      [-0.16, 0.26, 0.18],
      [0.05, 0.16, 0.23],
      [-0.08, 0.5, 0.21],
    ].map(([x, y, z]) => P.torus(0.045, 0.014, '#8691AA', { at: [x, y, z], rot: [0.2, 0, 0] })),
    P.sphere(0.12, '#E7E9F1', { at: [0, 0.6, 0.2], scale: [1.2, 0.85, 1] }),
    P.sphere(0.045, INK, { at: [0, 0.65, 0.31] }, 10),
    ...eyes(0, 0.74, 0.19, 0.055, 0.1),
  ])
}

/** A narwhal lying along x (head at +x), its long cream tusk with pink stripes: the unicorn of the sea. */
function narwhalGeometry() {
  const g = '#A8B6D2'
  return merge([
    P.capsule(0.3, 1.0, g, { rot: [0, 0, Math.PI / 2] }),
    P.sphere(0.27, '#E8EEF8', { at: [0.1, -0.1, 0.04], scale: [2.2, 0.6, 1] }),
    ...[
      [-0.4, 0.22, 0.12],
      [0.0, 0.26, -0.06],
      [-0.15, 0.24, 0.18],
      [0.35, 0.22, 0.1],
    ].map(([x, y, z]) => P.sphere(0.06, '#7F8FB0', { at: [x, y, z], scale: [1.4, 0.5, 1] }, 10)),
    // The tail's flukes.
    P.prism(
      [
        [0, 0],
        [-0.42, 0.3],
        [-0.3, 0],
        [-0.42, -0.3],
      ],
      0.06,
      g,
      { at: [-0.75, 0, 0], rot: [Math.PI / 2, 0, 0] },
    ),
    // The tusk (a cone pointing +x) and its pink stripes.
    P.cone(0.06, 1.5, '#FFF4DE', { at: [1.3, 0.08, 0], rot: [0, 0, -Math.PI / 2] }, 10),
    ...[0.68, 0.98, 1.28, 1.58].map((x, i) => P.torus(0.052 - i * 0.011, 0.012, '#FF8FB8', { at: [x, 0.08, 0], rot: [0, Math.PI / 2, 0] })),
    P.sphere(0.04, INK, { at: [0.5, 0.1, 0.27] }, 10),
    P.sphere(0.014, WHITE, { at: [0.51, 0.12, 0.3] }, 8),
  ])
}

/** A walrus lying on the ice, facing her: a big pink-brown body, a whiskery muzzle and two long white tusks. */
function walrusBody() {
  const g = '#C99C8A'
  return merge([P.sphere(0.7, g, { at: [0, 0.45, 0], scale: [1.35, 0.75, 1.05] }), ...[-1, 1].map((s) => P.sphere(0.2, '#B98A78', { at: [s * 0.75, 0.15, 0.45], scale: [1.3, 0.4, 1] }))])
}
function walrusHead() {
  const g = '#C99C8A'
  return merge([
    P.sphere(0.42, g, { at: [0, 0.2, 0] }),
    ...[-1, 1].map((s) => P.sphere(0.17, '#EBCDBA', { at: [s * 0.13, 0.08, 0.33] })),
    ...[-1, 1].map((s) => P.cone(0.05, 0.5, '#FFFBF2', { at: [s * 0.11, -0.2, 0.42], rot: [Math.PI, 0, 0] }, 10)),
    ...[-1, 1].map((s) => P.sphere(0.035, INK, { at: [s * 0.08, 0.2, 0.42] }, 8)),
    ...eyes(0, 0.38, 0.32, 0.045, 0.17),
  ])
}

/** A beluga, white with a round melon forehead, swimming along -z. */
function belugaGeometry() {
  return merge([P.capsule(0.28, 0.8, BERG, { rot: [Math.PI / 2, 0, 0] }), P.sphere(0.27, WHITE, { at: [0, 0.08, -0.62] }), P.prism([[0, 0], [-0.3, 0.25], [-0.2, 0], [-0.3, -0.25]], 0.05, BERG, { at: [0, 0, 0.75], rot: [Math.PI / 2, Math.PI / 2, 0] })])
}

// ---------------------------------------------------------------- the scenery

export type CritterId = 'seal' | 'narwhal' | 'walrus' | 'beluga'
export const CRITTER_IDS: CritterId[] = ['seal', 'narwhal', 'walrus', 'beluga']

/** A floe of the course the scenery decorates (floe.ts's own). */
export interface FloeRef {
  spinner: Group
  x: number
  z: number
  r: number
  pts: [number, number][]
  rest?: boolean
  mama: boolean
}

interface Hole {
  floe: FloeRef
  at: [number, number]
  seal: Group
  /** 0 hidden ... 1 up, and where it's going. */
  up: number
  goal: number
  next: number
  look: number
}

interface Lounger {
  root: Group
  head: Group
  x: number
  z: number
  snortT: number
  next: number
}

export class Scenery {
  readonly root = new Group()
  private holes: Hole[] = []
  private walruses: Lounger[] = []
  private flag: Group
  private narwhal: Group
  private nar = { on: false, t: 0, x: 0, z: 0, dir: 1, next: 7, spin: -1, stay: 4.5 }
  private belugas: Group[] = []
  private bel = { on: false, t: 0, x: 0, z: 0, next: 16, extra: 0 }

  constructor(
    bag: Bag,
    floes: FloeRef[],
    private top: number,
    thick: number,
    private spray: Particles,
    /** Open water there (no floe within a little way)? */
    private open: (x: number, z: number, margin: number) => boolean,
  ) {
    const rand = rng(floes.length * 3.7 + floes[0].x)
    const zEnd = Math.min(...floes.map((f) => f.z))

    // Far pointy icebergs (north bergs are tall and pointy) along both sides and past Mama, hazing into the sky.
    const bergs: BufferGeometry[] = []
    const berg = (x: number, z: number, s: number) => {
      bergs.push(P.cone(1.6 * s, 5 * s, BERG, { at: [x, 2.1 * s, z] }, 7))
      bergs.push(P.cone(1.1 * s, 3.4 * s, BERG_BLUE, { at: [x + 1.3 * s, 1.3 * s, z + 0.6 * s], rot: [0, 0.6, 0.1] }, 6))
      bergs.push(P.cyl(2.2 * s, 2.4 * s, 0.6 * s, BERG, { at: [x + 0.4 * s, 0.05, z] }, 9))
    }
    for (let z = 8; z > zEnd - 30; z -= 11 + rand() * 6) {
      berg(-(17 + rand() * 9), z, 0.8 + rand() * 0.7)
      berg(17 + rand() * 9, z - 5, 0.8 + rand() * 0.7)
    }
    for (let x = -24; x <= 24; x += 9 + rand() * 4) berg(x, zEnd - 24 - rand() * 12, 1 + rand() * 0.8)
    const far = solid(merge(bergs), bag, 2)
    this.root.add(far)

    // Decorative floes off to the sides (out of a fling's way), some with a walrus lounging on them.
    for (let z = -10, i = 0; z > zEnd + 4; z -= 17 + rand() * 6, i++) {
      const side = i % 2 ? 1 : -1
      const x = side * (8.6 + rand() * 1.5)
      const pts: [number, number][] = Array.from({ length: 9 }, (_, k) => {
        const a = (k / 9) * Math.PI * 2 + (rand() - 0.5) * 0.4
        const r = 2.1 * (0.84 + rand() * 0.3)
        return [Math.sin(a) * r, Math.cos(a) * r]
      })
      const ice = solid(iceGeometry(pts, top, thick, z), bag, 2.5)
      ice.position.set(x, 0, z)
      ice.rotation.y = rand() * Math.PI
      this.root.add(ice)
      if (i % 2 === 0 || i < 2) {
        const root = new Group()
        const body = solid(walrusBody(), bag, 2)
        const head = new Group()
        const headMesh = solid(walrusHead(), bag, 2)
        headMesh.position.set(0, 0, 0)
        head.add(headMesh)
        head.position.set(0, 0.62, 0.68)
        root.add(body, head)
        root.position.set(x - side * 0.4, top, z + 0.3)
        // Turned a little toward the course.
        root.rotation.y = -side * 0.5
        root.scale.setScalar(0.9)
        this.root.add(root)
        this.walruses.push({ root, head, x: root.position.x, z, snortT: -1, next: 3 + rand() * 6 })
      }
    }

    // Breathing holes, a ringed seal in each: on the big rest floes (and Mama's ice), off to one side of the middle.
    const holeGeo = bag.add(new CircleGeometry(0.34, 20))
    const holeMat = bag.add(new MeshBasicMaterial({ color: '#3D6FA9', polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false }))
    const rimGeo = bag.add(new CircleGeometry(0.44, 20))
    const rimMat = bag.add(new MeshBasicMaterial({ color: RIM, polygonOffset: true, polygonOffsetFactor: -3, depthWrite: false }))
    const sealGeo = sealGeometry()
    for (const f of floes) {
      if (!f.rest) continue
      const a = f.mama ? 2.2 : 1.1 + rand() * 0.6
      const at = inner(f.pts, a, f.mama ? 0.55 : 0.6)
      const hole = new Mesh(holeGeo, holeMat)
      const rim = new Mesh(rimGeo, rimMat)
      for (const [m, y] of [
        [rim, 0.003],
        [hole, 0.006],
      ] as const) {
        m.rotation.x = -Math.PI / 2
        m.position.set(at[0], top + y, at[1])
        // (The dark hole draws over its pale rim.)
        m.renderOrder = m === hole ? 2 : 1
        f.spinner.add(m)
      }
      const seal = new Group()
      seal.add(solid(sealGeo.clone(), bag, 2))
      seal.position.set(at[0], top - 0.9, at[1])
      seal.visible = false
      f.spinner.add(seal)
      this.holes.push({ floe: f, at, seal, up: 0, goal: 0, next: 3 + rand() * 5, look: 0 })
    }
    sealGeo.dispose()

    // Mama's pink flag, tall enough to see from far out, on her ice beside her.
    const mama = floes.find((f) => f.mama)!
    this.flag = new Group()
    const pole = solid(merge([P.cyl(0.06, 0.07, 4.6, WHITE, { at: [0, 2.3, 0] }), ...[0.6, 1.4, 2.2, 3.0, 3.8].map((y) => P.cyl(0.075, 0.075, 0.3, '#FF8FB8', { at: [0, y, 0] })), P.sphere(0.16, '#FFC83D', { at: [0, 4.7, 0] })]), bag, 2)
    const cloth = new Group()
    cloth.add(solid(merge([P.box(1.4, 0.85, 0.05, '#FF8FB8', { at: [0.7, 0, 0] }), P.sphere(0.2, WHITE, { at: [0.55, 0.06, 0.04], scale: [1, 0.85, 0.3] }), P.sphere(0.2, WHITE, { at: [0.85, 0.06, 0.04], scale: [1, 0.85, 0.3] }), P.cone(0.27, 0.32, WHITE, { at: [0.7, -0.15, 0.04], rot: [Math.PI, 0, 0], scale: [1, 1, 0.3] })]), bag, 2))
    cloth.position.set(0.04, 4.1, 0)
    this.flag.add(pole, cloth)
    const fa = inner(mama.pts, -0.9, 0.5)
    this.flag.position.set(fa[0], top, fa[1])
    mama.spinner.add(this.flag)

    // The narwhal and the belugas, waiting under the sea.
    this.narwhal = new Group()
    this.narwhal.add(solid(narwhalGeometry(), bag, 2))
    this.narwhal.visible = false
    this.root.add(this.narwhal)
    const bel = belugaGeometry()
    for (let i = 0; i < 2; i++) {
      const b = new Group()
      b.add(solid(i ? bel.clone() : bel, bag, 2))
      b.visible = false
      if (i) b.scale.setScalar(0.75)
      this.belugas.push(b)
      this.root.add(b)
    }
  }

  /**
   * One frame. `near`: where Pola is; `busy`: the story or home (the critters keep to themselves); `tall`: a portrait
   * screen (the view is narrower, so the belugas swim closer in).
   */
  update(dt: number, t: number, near: Vector3, busy: boolean, tall: boolean) {
    // The flag waves.
    const cloth = this.flag.children[1]
    cloth.rotation.y = 0.25 * Math.sin(t * 2.3) + 0.1 * Math.sin(t * 5.1)

    // Seals: one pops up now and then in the hole nearest Pola (and whenever she taps it), looks round and ducks back.
    for (const h of this.holes) {
      const d = Math.hypot(h.floe.x - near.x, h.floe.z - near.z)
      h.next -= dt
      if (!busy && h.next <= 0 && h.goal === 0 && d < 9) {
        h.goal = 1
        h.next = 3.2
      } else if (h.goal === 1 && h.next <= 0) {
        h.goal = 0
        h.next = 7 + Math.random() * 6
      }
      h.up += (h.goal - h.up) * (1 - Math.exp(-dt * (h.goal ? 7 : 5)))
      h.seal.visible = h.up > 0.02
      h.seal.position.y = this.top - 0.9 + h.up * 0.78 + (h.up > 0.9 ? 0.03 * Math.sin(t * 3) : 0)
      h.look += dt
      h.seal.rotation.y = h.up > 0.9 ? 0.5 * Math.sin(h.look * 1.6) : 0
    }

    // Walruses: a snort now and then (head up, a puff from the whiskers), bobbing with the swell.
    for (const w of this.walruses) {
      w.root.position.y = this.top + swell(w.x, w.z, t) * 0.8
      w.next -= dt
      if (w.next <= 0) {
        w.next = 6 + Math.random() * 6
        w.snortT = 0
      }
      if (w.snortT >= 0) {
        w.snortT += dt
        const k = w.snortT / 1.1
        w.head.rotation.x = -0.45 * Math.sin(Math.min(1, k) * Math.PI)
        w.head.rotation.z = 0.15 * Math.sin(k * Math.PI * 4) * (1 - k)
        if (w.snortT > 0.35 && w.snortT - dt <= 0.35) {
          const p = w.head.localToWorld(new Vector3(0, 0.1, 0.5))
          this.spray.burst(p.x, p.y, p.z, 6, 0.6, 1.2, 0.12)
        }
        if (k >= 1) w.snortT = -1
      } else w.head.rotation.x = 0.05 * Math.sin(t * 1.3 + w.z)
    }

    // The narwhal surfaces in open water near Pola: tusk first, then a slow swim, then it dives.
    const n = this.nar
    if (!n.on) {
      n.next -= dt
      if (n.next <= 0 && !busy) {
        const spots = [
          [3.2, -2.6],
          [-3.2, -2.6],
          [3.6, -4.6],
          [-3.6, -4.6],
          [2.6, -6],
          [-2.6, -6],
        ]
        const s = spots.map(([dx, dz]) => [near.x + dx * (tall ? 0.8 : 1), near.z + dz]).find(([x, z]) => this.open(x, z, 1.3) && this.open(x + 0.9, z, 1) && this.open(x - 0.9, z, 1))
        if (s) {
          n.on = true
          n.t = 0
          n.x = s[0]
          n.z = s[1]
          n.dir = s[0] > near.x ? -1 : 1
          n.stay = 4.5
          n.spin = -1
          sounds.sparkle()
        } else n.next = 1.5
      }
    }
    if (n.on) {
      n.t += dt
      const rise = smooth(n.t / 0.9)
      const sink = smooth((n.t - 0.9 - n.stay) / 0.9)
      const out = rise - sink
      n.x += n.dir * 0.25 * dt
      this.narwhal.visible = out > 0.01
      this.narwhal.position.set(n.x, -0.6 + out * 0.62 + 0.04 * Math.sin(t * 2), n.z)
      // Facing along its swim, tusk up as it comes out and down as it dives.
      this.narwhal.rotation.set(0, n.dir > 0 ? 0 : Math.PI, (rise < 1 ? 0.5 * (1 - rise) : -0.5 * sink) + 0.12)
      if (n.spin >= 0) {
        n.spin += dt
        this.narwhal.rotation.x = Math.sin(Math.min(1, n.spin / 0.8) * Math.PI * 2) * 0.9
        if (n.spin > 0.8) n.spin = -1
      }
      if (n.t > 0.9 && n.t - dt <= 0.9) this.spray.burst(n.x + n.dir * 0.8, 0.1, n.z, 8, 0.8, 1.5, 0.14)
      if (sink >= 1) {
        n.on = false
        this.narwhal.visible = false
        n.next = 14 + Math.random() * 6
      }
    }

    // The belugas: a pair arcing along beside the course, white backs rolling out of the water and back in.
    const b = this.bel
    if (!b.on) {
      b.next -= dt
      if (b.next <= 0 && !busy) {
        const side = Math.random() < 0.5 ? -1 : 1
        b.x = near.x + side * (tall ? 3.4 : 5.2)
        b.z = near.z + 1.5
        b.on = true
        b.t = 0
        b.extra = 0
      }
    }
    if (b.on) {
      b.t += dt
      b.z -= 1.4 * dt
      let any = false
      this.belugas.forEach((m, i) => {
        const x = b.x + (i ? 0.7 : 0)
        const z = b.z + (i ? 1.1 : 0)
        const ph = (b.t * 0.9 - i * 0.25) % 1.5
        const arc = ph < 1 ? Math.sin(ph * Math.PI) : 0
        const clear = this.open(x, z, 0.8)
        const y = -0.55 + (clear ? arc * 0.75 : 0)
        m.visible = y > -0.45
        any ||= m.visible
        m.position.set(x, y, z)
        m.rotation.x = clear && ph < 1 ? -0.6 * Math.cos(ph * Math.PI) : 0
      })
      if (b.t > 5 + b.extra && !any) {
        b.on = false
        b.next = 18 + Math.random() * 8
        this.belugas.forEach((m) => (m.visible = false))
      }
    }
  }

  /** Where a critter is (its middle, in the world), how big, and whether it's out to be poked. */
  spot(id: CritterId, out: Vector3): { r: number } | null {
    if (id === 'seal') {
      const h = this.nearestHole(out)
      if (!h) return null
      h.floe.spinner.localToWorld(out.set(h.at[0], this.top + 0.25, h.at[1]))
      return { r: 0.6 }
    }
    if (id === 'narwhal') return this.nar.on && this.narwhal.visible ? (this.narwhal.localToWorld(out.set(0.4, 0.1, 0)), { r: 1.1 }) : null
    if (id === 'beluga') {
      const m = this.belugas.find((x) => x.visible)
      return m ? (m.getWorldPosition(out), { r: 0.8 }) : null
    }
    const w = this.nearestWalrus(out)
    return w ? (w.root.localToWorld(out.set(0, 0.6, 0.3)), { r: 1.2 }) : null
  }

  /** The hole nearest a point (the seal anchor follows the one by Pola). `out` holds the point on the way in. */
  private nearestHole(p: Vector3) {
    let best: Hole | null = null
    let d = Infinity
    for (const h of this.holes) {
      const dd = Math.hypot(h.floe.x - p.x, h.floe.z - p.z)
      if (dd < d) {
        d = dd
        best = h
      }
    }
    return best
  }
  private nearestWalrus(p: Vector3) {
    let best: Lounger | null = null
    let d = Infinity
    for (const w of this.walruses) {
      const dd = Math.hypot(w.x - p.x, w.z - p.z)
      if (dd < d) {
        d = dd
        best = w
      }
    }
    return best
  }

  /** She poked a critter: a sound and a move. `near`: where Pola is (which hole, which walrus). */
  poke(id: CritterId, near: Vector3) {
    if (id === 'seal') {
      const h = this.nearestHole(near.clone())
      if (!h) return
      // Up it pops (or, if it's up, a bark and back down).
      if (h.goal === 0) {
        h.goal = 1
        h.next = 3.2
        h.look = 0
        sfx.pop()
      } else {
        h.goal = 0
        h.next = 4
        const p = h.floe.spinner.localToWorld(new Vector3(h.at[0], this.top, h.at[1]))
        this.spray.burst(p.x, p.y, p.z, 8, 0.9, 1.6, 0.14)
        sfx.splash()
      }
      ;[0, 0.18].forEach((d) => tone(620, 380, 0.12, 0.09, 'square', d))
    } else if (id === 'narwhal') {
      if (!this.nar.on) return
      this.nar.spin = 0
      this.nar.stay += 2
      sounds.sparkle()
      this.spray.burst(this.nar.x, 0.4, this.nar.z, 10, 1, 2, 0.12)
    } else if (id === 'walrus') {
      const w = this.nearestWalrus(near)
      if (!w) return
      w.snortT = 0
      w.next = 6 + Math.random() * 4
      noise(0.35, 0.3, 'lowpass', 500, 180, 0, 1)
      tone(140, 90, 0.3, 0.12, 'sawtooth', 0.05)
    } else {
      // A squeaky song, and another round of arcs.
      this.bel.extra += 3
      ;[0, 0.16, 0.34, 0.5].forEach((d, i) => tone(1300 + i * 260, 2100 - i * 120, 0.12, 0.06, 'sine', d))
    }
  }

}
