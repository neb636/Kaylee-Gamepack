// Carnival Snowballs' park in the toon look: the snowy ground (softer patches, footprints), the parade path with its red
// flags and bunting between the lamp posts (the snowy owl sits on one), Old Quebec up on the cliff (castle.ts: the wall,
// the terrace and the castle hotel), spruces with snow on them, the ice moose, the toboggan slide and its sled, the
// carnival's hat box and sash box, the parade drum, and what the snowmen wear. Maple is maple.ts, the other animals
// critters.ts; park.ts says where everything stands.
import { Color, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, Vector3, type BufferGeometry } from 'three'
import { bell, clamp, span, wobble } from '../../../../../sdk'
import type { Bag } from '../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../engine3d/geo'
import { PAL } from '../../../../engine3d/toon'
import { buildOldTown, mulberry } from './castle'
import { BOX_HALF, CLIFF_Y, DRUM, LAMP, LAMPS, MOOSE, PATH_Z, SLIDE, TREES_IN } from './park'

export const SKY = '#DCE6F6'
const SNOW = '#FBFBFF'
const SNOW_SHADE = '#EEF0FA'
const PATH = '#E4DEEE'
const SPRUCE = '#3F8F6C'
const SPRUCE_DARK = '#33795B'
const BARK = '#8A6248'
const ICE = '#BFE8F6'
const ICE_LIGHT = '#E2F7FD'
const RED = '#E8443F'
const FUR_LIGHT = '#E2B48A'

/** A spruce with snow on its tiers, standing at its foot (s = how big). */
export { mulberry }

export function spruce(s: number, at: [number, number, number] = [0, 0, 0], snowy = true): BufferGeometry[] {
  const [x, y, z] = at
  const parts: BufferGeometry[] = [P.cyl(0.16 * s, 0.2 * s, 0.7 * s, BARK, { at: [x, y + 0.35 * s, z] }, 8)]
  const tiers = [
    [1.25, 1.5, 0.55],
    [0.98, 1.3, 1.35],
    [0.68, 1.1, 2.1],
  ]
  tiers.forEach(([r, h, ty], i) => {
    parts.push(P.cone(r * s, h * s, i === 1 ? SPRUCE_DARK : SPRUCE, { at: [x, y + (ty + h / 2) * s, z] }, 9))
    if (snowy) parts.push(P.cone(r * s * 0.62, h * s * 0.42, SNOW, { at: [x, y + (ty + h * 0.8) * s, z] }, 9))
  })
  return parts
}

export interface Park {
  root: Group
  /** The park's trees, each on its own (a bump shakes it); `top` is where its snow falls from. */
  trees: { g: Group; x: number; z: number; top: Vector3; shake: number }[]
  castle: Group
  lamp: Group
  moose: Group
  slide: Group
  /** How lit the castle's windows are (0..1). */
  setWindows(k: number): void
}

export function buildPark(bag: Bag): Park {
  const root = new Group()

  // ---- The ground: snow everywhere, soft drifts round the edge, the parade path along the back.
  const ground = new Mesh(bag.add(new PlaneGeometry(400, 400)), bag.add(new MeshBasicMaterial({ color: SNOW })))
  ground.rotation.x = -Math.PI / 2
  root.add(ground)
  const drifts: BufferGeometry[] = []
  const rnd = mulberry(7)
  for (let i = 0; i < 34; i++) {
    const a = rnd()
    // Round the park's front and sides (not on the path or in front of the cliff).
    const x = a < 0.4 ? -17 - rnd() * 8 : a < 0.8 ? 17 + rnd() * 8 : -20 + rnd() * 40
    const z = a < 0.8 ? -8 + rnd() * 22 : 10.5 + rnd() * 8
    const r = 1.2 + rnd() * 2.2
    drifts.push(P.sphere(r, i % 3 ? SNOW : SNOW_SHADE, { at: [x, -r * 0.62, z], scale: [1.6, 1, 1.2] }, 14))
  }
  drifts.push(P.box(36, 0.04, 2.3, PATH, { at: [0, 0.02, PATH_Z] }))
  root.add(solid(merge(drifts), bag, 1.4))

  // ---- The red carnival flags along the path.
  const flags: BufferGeometry[] = []
  for (let x = -16; x <= 16; x += 4) {
    if (Math.abs(x - DRUM.x) < 1.5) continue
    flags.push(P.cyl(0.05, 0.06, 2.6, PAL.ink, { at: [x, 1.3, PATH_Z - 1.4] }, 6))
    flags.push(P.prism([[0, 0], [0.9, -0.22], [0, -0.44]], 0.04, (x / 4) % 2 ? RED : '#FFFFFF', { at: [x + 0.04, 2.55, PATH_Z - 1.4] }))
  }
  root.add(solid(merge(flags), bag, 1.4))

  // ---- Old Quebec up on the cliff: the wall, the terrace, the castle hotel and the old town (castle.ts); spruces behind.
  const town = buildOldTown(bag)
  root.add(town.root)
  const cliffTop: BufferGeometry[] = []
  const rc = mulberry(5)
  for (let i = 0; i < 22; i++) {
    const x = -46 + i * 4.4 + rc() * 2
    if (Math.abs(x) < 12) continue
    cliffTop.push(...spruce(1.2 + rc() * 0.6, [x, CLIFF_Y, -24 - rc() * 6]))
  }
  for (const [x, z, s] of [
    [-12.5, -29, 1.5],
    [12.8, -29.5, 1.6],
    [-6, -31, 1.3],
    [6.5, -31.5, 1.4],
  ] as const)
    cliffTop.push(...spruce(s, [x, CLIFF_Y, z]))
  root.add(solid(merge(cliffTop), bag, 1.6))

  // ---- Bunting between the lamp posts: little triangle flags, red, white, blue and gold.
  const bunt: BufferGeometry[] = []
  const posts = [...LAMPS, LAMP.x].sort((a, b) => a - b)
  const BUNT = [RED, '#FFFFFF', '#4F7FD0', PAL.butter]
  for (let i = 0; i < posts.length - 1; i++) {
    const a = posts[i]
    const b = posts[i + 1]
    const n = Math.round((b - a) / 0.7)
    for (let k = 1; k < n; k++) {
      const u = k / n
      const x = a + (b - a) * u
      const y = 3.55 - Math.sin(u * Math.PI) * 0.55
      bunt.push(
        P.prism(
          [
            [-0.2, 0],
            [0.2, 0],
            [0, -0.42],
          ],
          0.03,
          BUNT[(i * 7 + k) % BUNT.length],
          { at: [x, y, LAMP.z] },
        ),
      )
    }
  }
  root.add(solid(merge(bunt), bag, 1.2))

  // ---- The snow isn't all one white: softer patches, and a line of footprints across it.
  const patches: BufferGeometry[] = []
  const rp = mulberry(9)
  for (let i = 0; i < 44; i++) {
    const x = -15 + rp() * 30
    const z = -8.5 + rp() * 17
    const r = 0.6 + rp() * 1.4
    patches.push(P.cyl(r, r, 0.02, i % 4 ? SNOW_SHADE : '#E7EAF7', { at: [x, 0.006, z], scale: [1.6, 1, 1] }, 14))
  }
  for (let i = 0; i < 26; i++) patches.push(P.cyl(0.12, 0.12, 0.02, '#E2E5F4', { at: [-14 + i * 1.1, 0.012, 6.2 + Math.sin(i * 0.5) * 1.2 + (i % 2 ? 0.18 : -0.18)], scale: [1, 1, 1.5] }, 8))
  root.add(new Mesh(bag.add(merge(patches)), bag.add(new MeshBasicMaterial({ vertexColors: true, polygonOffset: true, polygonOffsetFactor: -1 }))))

  // ---- Spruces round the park's edges (one mesh), and the park's own trees (each on its own, to shake).
  const edge: BufferGeometry[] = []
  const rt = mulberry(21)
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1
    edge.push(...spruce(0.9 + rt() * 0.7, [side * (15.5 + rt() * 6), 0, -9 + (i >> 1) * 1.9 + rt()]))
  }
  for (let i = 0; i < 12; i++) edge.push(...spruce(0.9 + rt() * 0.6, [-22 + i * 4 + rt() * 2, 0, 11 + rt() * 5]))
  root.add(solid(merge(edge), bag, 1.6))
  const trees = TREES_IN.map((t) => {
    const g = solid(merge(spruce(t.s)), bag, 2)
    g.position.set(t.x, 0, t.z)
    root.add(g)
    return { g, x: t.x, z: t.z, top: new Vector3(t.x, 2.6 * t.s, t.z), shake: -1 }
  })

  // ---- Lamp posts by the path (the owl sits on the one at LAMP).
  const lampParts = (x: number, z: number) => [
    P.cyl(0.08, 0.11, 3.2, PAL.ink, { at: [x, 1.6, z] }, 8),
    P.rbox(0.5, 0.6, 0.5, 0.1, PAL.butter, { at: [x, 3.45, z] }),
    P.cone(0.42, 0.35, PAL.ink, { at: [x, 3.92, z] }, 8),
  ]
  root.add(solid(merge(LAMPS.flatMap((x) => lampParts(x, LAMP.z))), bag, 1.6))
  const lamp = solid(merge(lampParts(0, 0)), bag, 1.6)
  lamp.position.set(LAMP.x, 0, LAMP.z)
  root.add(lamp)

  // ---- The ice moose on its block of snow.
  const moose = new Group()
  moose.position.set(MOOSE.x, 0, MOOSE.z)
  moose.rotation.y = 0.5
  moose.add(
    solid(
      merge([
        P.rbox(1.9, 0.6, 1.1, 0.12, SNOW_SHADE, { at: [0, 0.3, 0] }),
        P.rbox(1.4, 0.75, 0.6, 0.25, ICE, { at: [0, 1.65, 0] }),
        ...[
          [-0.5, -0.18],
          [-0.5, 0.18],
          [0.5, -0.18],
          [0.5, 0.18],
        ].map(([x, z]) => P.cyl(0.09, 0.08, 0.75, ICE, { at: [x, 0.95, z] }, 8)),
        P.rbox(0.5, 0.42, 0.38, 0.14, ICE_LIGHT, { at: [0.85, 2.05, 0], rot: [0, 0, -0.4] }),
        P.rbox(0.36, 0.28, 0.3, 0.1, ICE, { at: [1.1, 1.85, 0], rot: [0, 0, -0.6] }),
        P.rbox(0.08, 0.36, 0.58, 0.04, ICE_LIGHT, { at: [0.75, 2.4, 0.3], rot: [0.5, 0, 0] }),
        P.rbox(0.08, 0.36, 0.58, 0.04, ICE_LIGHT, { at: [0.75, 2.4, -0.3], rot: [-0.5, 0, 0] }),
      ]),
      bag,
      1.8,
    ),
  )
  root.add(moose)

  // ---- The toboggan slide: an icy run on wooden legs, down the hill on the right.
  const slide = new Group()
  const { top, foot } = SLIDE
  const dx = foot.x - top.x
  const dz = foot.z - top.z
  const len = Math.hypot(dx, dz, foot.y - top.y)
  const yaw = Math.atan2(dx, dz)
  const tilt = Math.asin((top.y - foot.y) / len)
  const mid = new Vector3((top.x + foot.x) / 2, (top.y + foot.y) / 2, (top.z + foot.z) / 2)
  // Turned toward the foot, then tilted down (about its own x).
  const runQ = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), yaw).multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), tilt))
  const run: BufferGeometry[] = [P.box(1.6, 0.16, len, ICE, {}), P.box(0.16, 0.4, len, '#D2A67E', { at: [0.85, 0.15, 0] }), P.box(0.16, 0.4, len, '#D2A67E', { at: [-0.85, 0.15, 0] })]
  const runG = solid(merge(run), bag, 1.6)
  runG.position.copy(mid)
  runG.quaternion.copy(runQ)
  slide.add(runG)
  const legs: BufferGeometry[] = []
  for (let k = 0.15; k < 0.95; k += 0.2) {
    const y = top.y + (foot.y - top.y) * k
    legs.push(P.box(0.2, y, 0.2, '#B8895F', { at: [top.x + dx * k, y / 2, top.z + dz * k] }))
  }
  legs.push(P.box(2.6, 0.3, 2.6, '#D2A67E', { at: [top.x - Math.sin(yaw) * 1.1, top.y - 0.15, top.z - Math.cos(yaw) * 1.1] }))
  legs.push(P.box(0.2, top.y, 0.2, '#B8895F', { at: [top.x - Math.sin(yaw) * 1.9, top.y / 2, top.z - Math.cos(yaw) * 1.9] }))
  slide.add(solid(merge(legs), bag, 1.6))
  root.add(slide)

  return {
    root,
    trees,
    castle: town.castle,
    lamp,
    moose,
    slide,
    setWindows: town.setWindows,
  }
}

// ---------------------------------------------------------------- the green trail

/** The grass a ball uncovers as it picks up the snow: flat green dabs laid on the ground, oldest reused first. */
export class Trail {
  readonly mesh: InstancedMesh
  private next = 0
  private m = new Matrix4()
  private q = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2)
  private s = new Vector3()
  private p = new Vector3()
  constructor(bag: Bag, private count = 2400) {
    const geo = bag.add(new PlaneGeometry(1, 1))
    const mat = bag.add(new MeshBasicMaterial({ color: '#FFFFFF', polygonOffset: true, polygonOffsetFactor: -2 }))
    this.mesh = bag.add(new InstancedMesh(geo, mat, count))
    this.mesh.frustumCulled = false
    this.mesh.count = 0
    const greens = [new Color('#A5D99B'), new Color('#97D195'), new Color('#ABDDA0')]
    for (let i = 0; i < count; i++) this.mesh.setColorAt(i, greens[i % 3])
    this.mesh.renderOrder = 1
  }
  /** A dab at (x, z), `w` wide, turned to `yaw`, `len` long. */
  add(x: number, z: number, w: number, len: number, yaw: number) {
    const i = this.next
    this.next = (this.next + 1) % this.count
    this.mesh.count = Math.max(this.mesh.count, i + 1)
    const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), yaw).multiply(this.q)
    this.m.compose(this.p.set(x, 0.015, z), q, this.s.set(w, len, 1))
    this.mesh.setMatrixAt(i, this.m)
    this.mesh.instanceMatrix.needsUpdate = true
  }
  get dabs() {
    return this.mesh.count
  }
}

// ---------------------------------------------------------------- the animals and things that move

/** The snowy owl on her lamp post: white with dark speckles, yellow eyes. A tap turns her head right round. */
export class Owl {
  readonly root = new Group()
  private head = new Group()
  private spinT = -1
  private blinkT = 2
  private eyes: Group
  constructor(bag: Bag) {
    const body: BufferGeometry[] = [P.sphere(0.32, '#FFFFFF', { at: [0, 0.32, 0], scale: [1, 1.15, 0.95] }), P.cone(0.18, 0.2, '#FFFFFF', { at: [0, 0.02, -0.14], rot: [-2.2, 0, 0] }, 8)]
    for (let i = 0; i < 7; i++) body.push(P.sphere(0.035, '#4A4458', { at: [Math.sin(i * 2.4) * 0.24, 0.2 + (i % 3) * 0.12, 0.22 + Math.cos(i) * 0.04], scale: [1.4, 0.6, 0.5] }, 6))
    this.root.add(solid(merge(body), bag, 1.6))
    this.head.position.y = 0.62
    this.root.add(this.head)
    this.head.add(
      solid(
        merge([
          P.sphere(0.24, '#FFFFFF', { scale: [1.1, 0.95, 1] }),
          P.cone(0.04, 0.09, '#4A4458', { at: [0, -0.04, 0.24], rot: [Math.PI / 2, 0, 0] }, 6),
          P.sphere(0.025, '#4A4458', { at: [0.12, 0.12, 0.17] }, 6),
          P.sphere(0.025, '#4A4458', { at: [-0.1, 0.14, 0.18] }, 6),
        ]),
        bag,
        1.6,
      ),
    )
    this.eyes = solid(merge([P.sphere(0.07, '#FFD23D', { at: [0.1, 0.03, 0.18] }), P.sphere(0.07, '#FFD23D', { at: [-0.1, 0.03, 0.18] }), P.sphere(0.035, PAL.ink, { at: [0.1, 0.03, 0.24] }), P.sphere(0.035, PAL.ink, { at: [-0.1, 0.03, 0.24] })]), bag, 0)
    this.head.add(this.eyes)
  }
  poke() {
    this.spinT = 0
  }
  get busy() {
    return this.spinT >= 0
  }
  update(dt: number, t: number) {
    if (this.spinT >= 0) {
      this.spinT += dt
      // Right round one way, a pause, then back with a little overshoot.
      const p = this.spinT
      this.head.rotation.y = p < 0.7 ? Math.PI * smoothstep(p / 0.7) : p < 1.2 ? Math.PI : Math.PI * (1 - smoothstep((p - 1.2) / 0.6)) + wobble(span(p, 1.8, 2.6), 2) * 0.2
      this.root.scale.y = 1 + bell(span(p, 0, 0.3)) * 0.12
      if (p > 2.6) this.spinT = -1
    } else this.head.rotation.y = Math.sin(t * 0.4) * 0.5
    if ((this.blinkT -= dt) < 0) this.blinkT = 2 + Math.random() * 3
    this.eyes.scale.y = this.blinkT < 0.12 ? 0.15 : 1
  }
}
const smoothstep = (p: number) => {
  const k = clamp(p)
  return k * k * (3 - 2 * k)
}

/** A toboggan (and its rider, a little bundled-up kid) that whooshes down the slide and out across the snow. */
export class Sled {
  readonly root = new Group()
  private t = -1
  constructor(bag: Bag) {
    this.root.add(
      solid(
        merge([
          P.rbox(0.7, 0.12, 1.6, 0.05, RED, { at: [0, 0.1, 0] }),
          P.torus(0.2, 0.05, RED, { at: [0, 0.3, 0.75], rot: [0, Math.PI / 2, 0] }, Math.PI),
          P.capsule(0.22, 0.25, PAL.lavender, { at: [0, 0.55, -0.1] }),
          P.sphere(0.2, FUR_LIGHT, { at: [0, 1.0, -0.05] }),
          P.sphere(0.21, PAL.hotpink, { at: [0, 1.08, -0.07], scale: [1, 0.7, 1] }),
          P.sphere(0.08, '#FFFFFF', { at: [0, 1.28, -0.07] }),
        ]),
        bag,
        1.6,
      ),
    )
    this.root.visible = false
  }
  get going() {
    return this.t >= 0
  }
  go() {
    if (this.t < 0) this.t = 0
  }
  /** Returns true the moment it lands at the foot (a puff of snow there). */
  update(dt: number) {
    if (this.t < 0) return false
    const was = this.t
    this.t += dt
    const { top, foot } = SLIDE
    const yaw = Math.atan2(foot.x - top.x, foot.z - top.z)
    const DOWN = 1.6
    const OUT = 1.8
    this.root.visible = true
    if (this.t < DOWN) {
      const k = (this.t / DOWN) ** 2
      this.root.position.set(top.x + (foot.x - top.x) * k, top.y + (foot.y - top.y) * k + 0.1, top.z + (foot.z - top.z) * k)
      this.root.rotation.set(0, yaw, 0)
      this.root.rotateX(Math.asin((top.y - foot.y) / Math.hypot(foot.x - top.x, foot.y - top.y, foot.z - top.z)))
    } else {
      const k = 1 - (1 - span(this.t - DOWN, 0, OUT)) ** 2
      this.root.rotation.set(0, yaw + k * 0.6, 0)
      this.root.position.set(foot.x + Math.sin(yaw) * k * 6, 0, foot.z + Math.cos(yaw) * k * 6)
    }
    if (this.t > DOWN + OUT + 1.2) {
      this.t = -1
      this.root.visible = false
    }
    return was < DOWN && this.t >= DOWN
  }
}

/** The carnival's boxes: a red one with the hat and a striped one with the sash. A snowball rolled in pops the lid. */
export class Box {
  readonly root = new Group()
  private lid = new Group()
  private popT = -1
  private jiggleT = -1
  private showT = -1
  private hideT = -1
  constructor(bag: Bag, readonly kind: 'hat' | 'sash') {
    const h = BOX_HALF
    const body: BufferGeometry[] =
      kind === 'hat'
        ? [P.rbox(h * 2, h * 1.5, h * 2, 0.08, RED, { at: [0, h * 0.75, 0] }), P.box(h * 2.02, h * 0.3, 0.2, PAL.butter, { at: [0, h * 0.75, 0] })]
        : [P.rbox(h * 2, h * 1.5, h * 2, 0.08, '#4F7FD0', { at: [0, h * 0.75, 0] }), ...[0.25, 0.75, 1.25].map((y, i) => P.box(h * 2.02, h * 0.18, h * 2.02, i === 1 ? PAL.butter : RED, { at: [0, y * h, 0] }))]
    this.root.add(solid(merge(body), bag, 2))
    this.lid.position.set(0, h * 1.5, -h)
    this.root.add(this.lid)
    this.lid.add(solid(merge([P.rbox(h * 2.15, h * 0.3, h * 2.15, 0.06, kind === 'hat' ? RED : '#4F7FD0', { at: [0, h * 0.15, h] })]), bag, 2))
    // What's inside peeks out on top of the lid: its own hat or sash, small.
    const icon = kind === 'hat' ? makeHat(bag) : makeSash(bag)
    icon.scale.setScalar(0.55)
    icon.position.set(0, kind === 'hat' ? h * 0.3 - 0.3 : h * 0.3 + 0.18, h)
    this.lid.add(icon)
    this.root.scale.setScalar(0.001)
    this.root.visible = false
  }
  /** It hops into the park (dress). */
  appear(now = false) {
    this.root.visible = true
    this.showT = now ? 1 : 0
    if (now) this.root.scale.setScalar(1)
  }
  get shown() {
    return this.root.visible && this.showT >= 1 && this.hideT < 0
  }
  /** It hops away (the parade). */
  hide() {
    if (this.root.visible && this.hideT < 0) this.hideT = 0
  }
  pop() {
    this.popT = 0
  }
  jiggle() {
    if (this.jiggleT < 0) this.jiggleT = 0
  }
  update(dt: number) {
    if (this.showT >= 0 && this.showT < 1) {
      this.showT = Math.min(1, this.showT + dt / 0.6)
      const s = this.showT < 0.6 ? this.showT / 0.6 : 1 + wobble((this.showT - 0.6) / 0.4, 1.5) * 0.18
      this.root.scale.setScalar(Math.max(0.001, s))
    }
    let open = 0
    let sq = 0
    if (this.popT >= 0) {
      this.popT += dt
      open = bell(span(this.popT, 0, 1.1)) * 1.9
      sq = wobble(this.popT / 0.8, 2) * 0.16
      if (this.popT > 1.2) this.popT = -1
    }
    if (this.jiggleT >= 0) {
      this.jiggleT += dt
      open = Math.max(open, bell(span(this.jiggleT, 0, 0.45)) * 0.5)
      sq = Math.max(sq, wobble(this.jiggleT / 0.5, 2) * 0.08)
      if (this.jiggleT > 0.5) this.jiggleT = -1
    }
    this.lid.rotation.x = -open
    if (this.hideT >= 0) {
      this.hideT += dt / 0.4
      this.root.scale.setScalar(Math.max(0.001, 1 - this.hideT) * (1 + bell(Math.min(1, this.hideT * 2)) * 0.2))
      if (this.hideT >= 1) this.root.visible = false
    } else if (this.showT >= 1) this.root.scale.set(1 + sq, 1 - sq, 1 + sq)
  }
}

/** The parade drum on its stand by the path's end: tap it and the parade starts. */
export class Drum {
  readonly root = new Group()
  private skin = new Group()
  private hitT = -1
  private glowT = 0
  ready = false
  constructor(bag: Bag) {
    this.root.add(
      solid(
        merge([
          P.cyl(0.05, 0.05, 0.9, PAL.ink, { at: [0.4, 0.45, 0.3], rot: [0.2, 0, 0.3] }, 6),
          P.cyl(0.05, 0.05, 0.9, PAL.ink, { at: [-0.4, 0.45, 0.3], rot: [0.2, 0, -0.3] }, 6),
          P.cyl(0.05, 0.05, 0.9, PAL.ink, { at: [0, 0.45, -0.4], rot: [-0.35, 0, 0] }, 6),
        ]),
        bag,
        1.4,
      ),
    )
    this.skin.position.y = 1.25
    this.root.add(this.skin)
    this.skin.add(
      solid(
        merge([
          P.cyl(0.75, 0.75, 0.75, RED, { rot: [0.35, 0, 0] }, 20),
          P.cyl(0.78, 0.78, 0.1, PAL.gold, { at: [0, 0.37, 0.13], rot: [0.35, 0, 0] }, 20),
          P.cyl(0.78, 0.78, 0.1, PAL.gold, { at: [0, -0.37, -0.13], rot: [0.35, 0, 0] }, 20),
          P.cyl(0.7, 0.7, 0.04, '#FFF7F0', { at: [0, 0.4, 0.14], rot: [0.35, 0, 0] }, 20),
        ]),
        bag,
        2,
      ),
    )
    this.root.scale.setScalar(0.001)
    this.root.visible = false
  }
  appear() {
    if (this.root.visible) return
    this.root.visible = true
    this.glowT = 0.0001
  }
  hit() {
    this.hitT = 0
  }
  update(dt: number, t: number) {
    if (this.glowT > 0 && this.glowT < 1) {
      this.glowT = Math.min(1, this.glowT + dt / 0.6)
      this.root.scale.setScalar(Math.max(0.001, this.glowT < 0.6 ? this.glowT / 0.6 : 1 + wobble((this.glowT - 0.6) / 0.4, 1.5) * 0.2))
    }
    let sq = 0
    if (this.hitT >= 0) {
      this.hitT += dt
      sq = wobble(this.hitT / 0.4, 2) * 0.15
      if (this.hitT > 0.4) this.hitT = -1
    }
    // Ready to start the parade: it bounces gently, asking.
    const ask = this.ready ? Math.max(0, Math.sin(t * 5)) * 0.08 : 0
    this.skin.scale.set(1 + sq, 1 - sq + ask, 1 + sq)
  }
}

// ---------------------------------------------------------------- what the snowmen wear

/** A red knitted tuque with a white pompom, sized for a head of radius 1 (it sits on top). */
export function makeHat(bag: Bag) {
  return solid(
    merge([
      P.cyl(0.62, 0.72, 0.42, RED, { at: [0, 0.78, 0] }, 18),
      P.cyl(0.74, 0.74, 0.16, '#FFFFFF', { at: [0, 0.6, 0] }, 18),
      P.cone(0.6, 0.75, RED, { at: [0, 1.36, 0] }, 18),
      P.sphere(0.24, '#FFFFFF', { at: [0, 1.76, 0] }, 12),
    ]),
    bag,
    2,
  )
}

/** The carnival's woven sash (red, with blue, gold and green stripes), tied round a ball of radius 1 with its ends
 *  hanging down the side. */
export function makeSash(bag: Bag) {
  const parts: BufferGeometry[] = [
    P.torus(1, 0.11, RED, { at: [0, -0.22, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(1, 0.055, '#4F7FD0', { at: [0, -0.07, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(1, 0.055, PAL.butter, { at: [0, -0.37, 0], rot: [Math.PI / 2, 0, 0] }),
    // The knot and the two tasselled ends.
    P.sphere(0.16, RED, { at: [0.72, -0.25, 0.72] }),
    P.rbox(0.18, 0.62, 0.06, 0.04, RED, { at: [0.76, -0.62, 0.78], rot: [0, -0.78, 0.15] }),
    P.rbox(0.18, 0.5, 0.06, 0.04, '#4F7FD0', { at: [0.62, -0.58, 0.9], rot: [0, -0.78, -0.12] }),
    P.cone(0.12, 0.2, PAL.butter, { at: [0.8, -1.0, 0.8], rot: [Math.PI, 0, 0] }, 8),
    P.cone(0.12, 0.2, PAL.butter, { at: [0.58, -0.9, 0.94], rot: [Math.PI, 0, 0] }, 8),
  ]
  return solid(merge(parts), bag, 2)
}
