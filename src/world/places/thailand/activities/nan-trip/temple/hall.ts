// Wat Phumin in shapes (greybox), in the house's toon look: the cross-shaped hall on its white plinth (white walls, a
// red dado, a red ceiling, golden roofs), its four doors, the four golden Buddhas back to back on their dais with an
// altar table (candle, lotus, bell) and a mat in front of each, the eight mural panels (murals.ts), and outside the east
// door the naga stairs, the shoe rack, the bell post, the lovers' statues and the courtyard. Also the lantern Kaylee
// holds and the pigeons. Built once; temple3d.ts moves the bits that move.
import { AdditiveBlending, CanvasTexture, DoubleSide, Group, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, Sprite, SpriteMaterial, Vector3, type BufferGeometry, type Object3D } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid, solidMix, type V3 } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import {
  A,
  ALTAR_OUT,
  BAND0,
  BAND_H,
  BELL_POST,
  BUDDHA_OUT,
  BUDDHAS,
  C,
  DADO,
  DAIS,
  DOOR_AT,
  DOOR_H,
  DOOR_W,
  GROUND,
  LEDGE,
  MAT_OUT,
  MOMMY_AT,
  NAGA_HEAD_X,
  NAGA_Z,
  PANEL_W,
  PANELS,
  RACK,
  STAIRS,
  STATUES,
  WALL_H,
  WALL_T,
} from './layout'
import { MuralPanel } from './murals'

const WHITE = '#F7F1E6'
const RED = '#B5544A'
const GOLD = '#F2C14E'
const GOLD_DARK = '#D99A34'
const WOOD = '#9A6A3E'
const NAGA = '#62B884'
const BRONZE = '#C98A3A'
const STONE = '#E6E0EC'

export interface Door {
  /** The two leaves, on their hinges. */
  leaves: [Group, Group]
  /** The bright day in the doorway (seen from inside), the light on the floor, the crack of light when it's shut. */
  day: Mesh
  beam: Mesh
  crack: Mesh
}
export interface BuddhaParts {
  root: Group
  halo: Sprite
  /** The face, in the world. */
  face: Vector3
}
export interface Altar {
  flame: Group
  bell: Group
  bellAt: Vector3
}
export interface Naga {
  head: Group
  lids: Group
}
export interface Lantern {
  root: Group
  body: Group
  light: PointLight
  glow: Sprite
  /** Where the string ties on (local). */
  knot: Vector3
}
export interface Pigeon {
  root: Group
  head: Group
  wings: [Group, Group]
}

export interface Hall {
  root: Group
  /** What the lantern's ray can land on. */
  catchers: Object3D[]
  murals: MuralPanel[]
  doors: Door[]
  buddhas: BuddhaParts[]
  altars: Altar[]
  nagas: Naga[]
  rack: Group
  rackSlots: Vector3[]
  shoes: Group[]
  bell: Group
  statues: { man: Group; woman: Group }
  glowMap: CanvasTexture
}

/** A soft round glow (white in the middle, clear at the edge) for sprites. */
export function glowTexture(bag: Bag) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  r.addColorStop(0, 'rgba(255,255,255,1)')
  r.addColorStop(0.35, 'rgba(255,255,255,.45)')
  r.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = r
  g.fillRect(0, 0, 64, 64)
  return bag.add(new CanvasTexture(c))
}
export function glowSprite(map: CanvasTexture, color: string, bag: Bag, opacity = 1) {
  const s = new Sprite(bag.add(new SpriteMaterial({ map, color, transparent: true, opacity, depthWrite: false, blending: AdditiveBlending })))
  s.renderOrder = 3
  return s
}

/** A wall along (x0, z0) -> (x1, z1) on the inside of the hall, `n` into it: a white slab (its thickness outside the
 *  line), the red dado and the gold trims on its inner face. Returns the slab's parts and the veneer's. */
function wallParts(x0: number, z0: number, x1: number, z1: number, nx: number, nz: number, y0 = 0, y1 = WALL_H, dado = true) {
  const len = Math.hypot(x1 - x0, z1 - z0)
  const ux = (x1 - x0) / len
  const uz = (z1 - z0) / len
  const rot: V3 = [0, Math.atan2(-uz, ux), 0]
  const mx = (x0 + x1) / 2
  const mz = (z0 + z1) / 2
  const slab = P.box(len + WALL_T * 2, y1 - y0, WALL_T, WHITE, { at: [mx - nx * WALL_T / 2, (y0 + y1) / 2, mz - nz * WALL_T / 2], rot })
  const inner: BufferGeometry[] = []
  if (dado && y0 < DADO) inner.push(P.box(len, DADO - y0, 0.04, RED, { at: [mx + nx * 0.02, (y0 + DADO) / 2, mz + nz * 0.02], rot }))
  for (const y of [DADO, BAND0 + BAND_H + 0.04]) if (y > y0 && y < y1) inner.push(P.box(len, 0.06, 0.05, GOLD, { at: [mx + nx * 0.03, y, mz + nz * 0.03], rot }))
  return { slab, inner }
}

export function buildHall(bag: Bag): Hall {
  const root = new Group()
  const catchers: Object3D[] = []
  const glowMap = glowTexture(bag)
  const caught = (g: Group) => {
    catchers.push(g.children[0])
    return g
  }

  // ---------------------------------------------------------------- the plinth, the floor and the ceiling
  const cross = (half: number, armHalf: number, reach: number, y0: number, y1: number, c: string) => [
    P.box(half * 2, y1 - y0, half * 2, c, { at: [0, (y0 + y1) / 2, 0] }),
    P.box(reach * 2, y1 - y0, armHalf * 2, c, { at: [0, (y0 + y1) / 2, 0] }),
    P.box(armHalf * 2, y1 - y0, reach * 2, c, { at: [0, (y0 + y1) / 2, 0] }),
  ]
  const out = WALL_T + LEDGE
  root.add(solid(merge([...cross(C + out, A + out, DOOR_AT + out, GROUND, -0.02, WHITE), ...cross(C + out + 0.04, A + out + 0.04, DOOR_AT + out + 0.04, GROUND, GROUND + 0.22, '#C9C0D8')]), bag, 2))
  root.add(caught(solid(merge(cross(C, A, DOOR_AT, -0.06, 0, '#C79A78')), bag, 0)))
  // A runner down each arm, to the Buddhas.
  root.add(solid(merge(BUDDHAS.map((b) => P.box(b.dx ? DOOR_AT - DAIS.half : 1.1, 0.012, b.dx ? 1.1 : DOOR_AT - DAIS.half, '#D98A8A', { at: [b.dx * (DOOR_AT + DAIS.half) / 2, 0.006, b.dz * (DOOR_AT + DAIS.half) / 2] }))), bag, 0))
  root.add(caught(solid(merge([...cross(C, A, DOOR_AT, WALL_H, WALL_H + 0.15, '#8E4A45'), ...[-2.5, 0, 2.5].flatMap((k) => [P.box(C * 2, 0.12, 0.18, GOLD_DARK, { at: [0, WALL_H - 0.06, k] }), P.box(0.18, 0.12, C * 2, GOLD_DARK, { at: [k, WALL_H - 0.06, 0] })])]), bag, 0)))

  // ---------------------------------------------------------------- the walls
  const slabs: BufferGeometry[] = []
  const inner: BufferGeometry[] = []
  const add = (w: { slab: BufferGeometry; inner: BufferGeometry[] }) => {
    slabs.push(w.slab)
    inner.push(...w.inner)
  }
  for (const p of PANELS) add(wallParts(p.ox, p.oz, p.ox + p.rx * PANEL_W, p.oz + p.rz * PANEL_W, p.nx, p.nz))
  for (const b of BUDDHAS) {
    const px = -b.dz
    const pz = b.dx
    for (const s of [-1, 1]) add(wallParts(b.dx * C + px * s * A, b.dz * C + pz * s * A, b.dx * DOOR_AT + px * s * A, b.dz * DOOR_AT + pz * s * A, -px * s, -pz * s))
    // The door wall: either side of the doorway, and over it.
    const dx = b.dx * DOOR_AT
    const dz = b.dz * DOOR_AT
    for (const s of [-1, 1]) add(wallParts(dx + px * s * A, dz + pz * s * A, dx + px * s * (DOOR_W / 2), dz + pz * s * (DOOR_W / 2), -b.dx, -b.dz))
    add(wallParts(dx - px * (DOOR_W / 2), dz - pz * (DOOR_W / 2), dx + px * (DOOR_W / 2), dz + pz * (DOOR_W / 2), -b.dx, -b.dz, DOOR_H, WALL_H, false))
  }
  root.add(caught(solid(merge(slabs), bag, 1.5)))
  root.add(caught(solid(merge(inner), bag, 0)))

  // ---------------------------------------------------------------- the murals
  const murals = PANELS.map((p) => new MuralPanel(p, bag))
  for (const m of murals) {
    root.add(m.mesh)
    catchers.push(m.mesh)
  }

  // ---------------------------------------------------------------- the roofs (outside)
  const roofs: BufferGeometry[] = []
  const rise = 1.7
  const eave = A + 0.65
  const slope = Math.hypot(rise, eave)
  for (const b of BUDDHAS) {
    const yaw = Math.atan2(-b.dz, b.dx)
    const arm = (parts: BufferGeometry[]) => parts.forEach((g) => roofs.push(g.rotateY(yaw)))
    const len = DOOR_AT + 0.8 - (C - 1.5)
    const mid = (DOOR_AT + 0.8 + C - 1.5) / 2
    arm(
      [-1, 1].flatMap((s) => [
        P.box(len, 0.14, slope, '#E9B44C', { at: [mid, WALL_H + rise / 2 + 0.05, (s * eave) / 2], rot: [s * Math.atan2(rise, eave), 0, 0] }),
        P.box(len, 0.1, 0.14, RED, { at: [mid, WALL_H + 0.02, s * (eave + 0.02)] }),
      ]),
    )
    arm([
      P.prism([[-eave + 0.15, 0], [eave - 0.15, 0], [0, rise - 0.12]], 0.16, RED, { at: [DOOR_AT + 0.7, WALL_H + 0.06, 0], rot: [0, Math.PI / 2, 0] }),
      P.prism([[-0.5, 0], [0.5, 0], [0, 0.55]], 0.06, GOLD, { at: [DOOR_AT + 0.8, WALL_H + 0.35, 0], rot: [0, Math.PI / 2, 0] }),
      P.cone(0.09, 0.7, GOLD, { at: [DOOR_AT + 0.95, WALL_H + rise + 0.25, 0], rot: [0, 0, -0.6] }, 8),
      ...[-1, 1].map((s) => P.cone(0.07, 0.45, GOLD, { at: [DOOR_AT + 0.85, WALL_H + 0.2, s * (eave - 0.05)], rot: [s * 0.4, 0, -0.5] }, 8)),
    ])
  }
  roofs.push(P.cone((C + 0.7) * Math.SQRT2, 3.3, '#E9B44C', { at: [0, WALL_H + 0.15 + 1.65, 0], rot: [0, Math.PI / 4, 0] }, 4))
  roofs.push(P.cone(0.35, 1.6, GOLD, { at: [0, WALL_H + 3.9, 0] }, 10), P.sphere(0.25, GOLD, { at: [0, WALL_H + 3.4, 0] }))
  root.add(solid(merge(roofs), bag, 2))

  // ---------------------------------------------------------------- the dais and the four Buddhas
  root.add(caught(solid(merge([
    P.box(DAIS.half * 2, DAIS.step, DAIS.half * 2, WHITE, { at: [0, DAIS.step / 2, 0] }),
    P.box(DAIS.half * 2 + 0.04, 0.06, DAIS.half * 2 + 0.04, GOLD, { at: [0, DAIS.step - 0.03, 0] }),
    P.box(DAIS.half * 1.6, DAIS.step, DAIS.half * 1.6, WHITE, { at: [0, DAIS.step * 1.5, 0] }),
    P.box(DAIS.half * 1.6 + 0.04, 0.06, DAIS.half * 1.6 + 0.04, GOLD, { at: [0, DAIS.step * 2 - 0.03, 0] }),
  ]), bag, 2)))
  // A tiered white-and-gold umbrella over them.
  root.add(solid(merge([...[0, 1, 2].map((k) => P.cone(0.75 - k * 0.17, 0.24, k % 2 ? GOLD : WHITE, { at: [0, 3.72 + k * 0.2, 0] }, 16)), P.cyl(0.04, 0.04, 0.6, GOLD, { at: [0, WALL_H - 0.25, 0] }, 8)]), bag, 2))
  const buddhas: BuddhaParts[] = []
  const altars: Altar[] = []
  const doors: Door[] = []
  for (const b of BUDDHAS) {
    const frame = new Group()
    frame.rotation.y = Math.atan2(-b.dz, b.dx)
    root.add(frame)
    // ---- The Buddha, facing out along local +x ----
    const by = DAIS.step * 2
    const bx = BUDDHA_OUT
    const body = [
      P.cyl(0.6, 0.66, 0.2, GOLD_DARK, { at: [bx, by + 0.1, 0] }, 20),
      ...Array.from({ length: 12 }, (_, k) => P.sphere(0.13, '#F6D27A', { at: [bx + Math.cos((k / 12) * Math.PI * 2) * 0.6, by + 0.18, Math.sin((k / 12) * Math.PI * 2) * 0.6], scale: [1, 0.6, 1] }, 8)),
      P.sphere(0.5, GOLD, { at: [bx + 0.12, by + 0.38, 0], scale: [0.78, 0.34, 1.15] }),
      P.sphere(0.34, GOLD, { at: [bx, by + 0.82, 0], scale: [0.8, 1.32, 1.0] }),
      P.box(0.06, 0.78, 0.17, GOLD_DARK, { at: [bx + 0.24, by + 0.86, 0.08], rot: [0.62, 0, 0] }),
      ...[-1, 1].flatMap((s) => [P.sphere(0.1, GOLD, { at: [bx, by + 1.0, s * 0.32] }), P.sphere(0.09, GOLD, { at: [bx + 0.06, by + 0.78, s * 0.38] }), P.sphere(0.085, GOLD, { at: [bx + 0.14, by + 0.6, s * 0.36] })]),
      P.sphere(0.08, GOLD, { at: [bx + 0.42, by + 0.44, 0.3] }),
      P.sphere(0.08, GOLD, { at: [bx + 0.26, by + 0.52, -0.06] }),
      P.sphere(0.24, GOLD, { at: [bx, by + 1.39, 0] }),
      ...[-1, 1].map((s) => P.sphere(0.12, GOLD, { at: [bx - 0.02, by + 1.32, s * 0.24], scale: [0.35, 1.05, 0.45] }, 10)),
      P.sphere(0.12, GOLD, { at: [bx - 0.02, by + 1.6, 0] }, 12),
      P.cone(0.06, 0.3, GOLD, { at: [bx - 0.02, by + 1.82, 0] }, 8),
    ]
    const face = [
      ...[-1, 1].map((s) => P.torus(0.042, 0.009, PAL.ink, { at: [bx + 0.218, by + 1.41, s * 0.085], rot: [0, Math.PI / 2, Math.PI] }, Math.PI)),
      ...[-1, 1].map((s) => P.torus(0.06, 0.008, PAL.ink, { at: [bx + 0.205, by + 1.44, s * 0.09], rot: [0, Math.PI / 2, 0.25] }, Math.PI - 0.5)),
      P.torus(0.045, 0.009, PAL.ink, { at: [bx + 0.225, by + 1.3, 0], rot: [0, Math.PI / 2, Math.PI + 0.3] }, Math.PI - 0.6),
      P.sphere(0.014, PAL.ink, { at: [bx + 0.235, by + 1.47, 0] }, 6),
    ]
    const buddha = solidMix(body, face, bag, 2)
    frame.add(buddha)
    catchers.push(buddha.children[0])
    const halo = glowSprite(glowMap, '#FFD36A', bag, 0)
    halo.position.set(bx - 0.12, by + 1.45, 0)
    halo.scale.setScalar(1.4)
    frame.add(halo)
    buddhas.push({ root: buddha, halo, face: new Vector3(b.dx * (bx + 0.25), by + 1.39, b.dz * (bx + 0.25)) })
    // ---- The altar table: a candle, a lotus vase and a little bell ----
    const ax = ALTAR_OUT
    frame.add(solid(merge([
      P.rbox(0.5, 0.42, 1.0, 0.03, RED, { at: [ax, 0.21, 0] }),
      P.box(0.54, 0.04, 1.04, GOLD, { at: [ax, 0.44, 0] }),
      P.cyl(0.05, 0.06, 0.04, GOLD, { at: [ax, 0.48, -0.3] }, 10),
      P.cyl(0.03, 0.03, 0.22, '#FFF7EA', { at: [ax, 0.6, -0.3] }, 10),
      P.cyl(0.06, 0.08, 0.16, GOLD, { at: [ax, 0.54, 0.08] }, 10),
      ...[[-0.06, 0], [0.04, 0.06], [0.03, -0.06]].map(([dx, dz], k) => P.sphere(0.05, k ? '#FF9CC8' : '#FF6FAE', { at: [ax + dx, 0.7 + k * 0.04, 0.08 + dz], scale: [0.8, 1.3, 0.8] }, 10)),
      // The bell's little frame.
      ...[-1, 1].map((s) => P.cyl(0.02, 0.02, 0.62, WOOD, { at: [ax, 0.31, 0.72 + s * 0.14] }, 6)),
      P.box(0.04, 0.04, 0.34, WOOD, { at: [ax, 0.62, 0.72] }),
      // The mat.
      P.box(0.8, 0.02, 1.0, '#E9A0B8', { at: [MAT_OUT, 0.012, 0] }),
      P.box(0.84, 0.018, 1.04, GOLD, { at: [MAT_OUT, 0.006, 0] }),
    ]), bag, 1.5))
    const bell = solid(merge([P.cyl(0.045, 0.09, 0.14, BRONZE, { at: [0, -0.1, 0] }, 14), P.sphere(0.045, BRONZE, { at: [0, -0.03, 0] }, 10), P.torus(0.088, 0.012, GOLD_DARK, { at: [0, -0.17, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 1.5)
    bell.position.set(ax, 0.6, 0.72)
    frame.add(bell)
    const flame = new Group()
    flame.add(solid(merge([P.cone(0.028, 0.08, '#FFD25A', { at: [0, 0.04, 0] }, 10), P.sphere(0.018, '#FF9A3A', { at: [0, 0.015, 0] }, 8)]), bag, 1))
    const fg = glowSprite(glowMap, '#FFB04A', bag, 0.9)
    fg.scale.setScalar(0.42)
    fg.position.y = 0.04
    flame.add(fg)
    flame.position.set(ax, 0.71, -0.3)
    flame.visible = false
    frame.add(flame)
    altars.push({ flame, bell, bellAt: new Vector3(b.dx * ax - b.dz * 0.72, 0.5, b.dz * ax + b.dx * 0.72) })
    // ---- The door: two leaves on their hinges (they open inward), the day outside, the light on the floor ----
    const leaves = [-1, 1].map((s) => {
      const hinge = new Group()
      hinge.position.set(DOOR_AT - WALL_T / 2, 0, s * (DOOR_W / 2))
      hinge.add(solid(merge([
        P.box(0.08, DOOR_H - 0.04, DOOR_W / 2 - 0.02, '#7E3A36', { at: [0, (DOOR_H - 0.04) / 2, -s * (DOOR_W / 4)] }),
        ...[0.7, 1.75].flatMap((y) => [-1, 1].map((f) => P.box(0.02, 0.62, DOOR_W / 2 - 0.22, GOLD, { at: [f * 0.045, y, -s * (DOOR_W / 4)] }))),
      ]), bag, 1.5))
      frame.add(hinge)
      return hinge
    }) as [Group, Group]
    const day = new Mesh(bag.add(new PlaneGeometry(DOOR_W, DOOR_H)), bag.add(new MeshBasicMaterial({ color: '#FFF3D6' })))
    day.position.set(DOOR_AT + WALL_T + 0.05, DOOR_H / 2, 0)
    day.rotation.y = -Math.PI / 2
    day.visible = false
    frame.add(day)
    const beamGeo = bag.add(new PlaneGeometry(1, 1))
    const beam = new Mesh(beamGeo, bag.add(new MeshBasicMaterial({ color: '#FFE6B0', transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending })))
    beam.rotation.x = -Math.PI / 2
    beam.scale.set(DOOR_AT - DAIS.half - 0.2, DOOR_W * 1.2, 1)
    beam.position.set((DOOR_AT + DAIS.half) / 2, 0.02, 0)
    beam.renderOrder = 2
    frame.add(beam)
    const crack = new Mesh(bag.add(new PlaneGeometry(0.035, DOOR_H - 0.2)), bag.add(new MeshBasicMaterial({ color: '#FFF0C8', side: DoubleSide })))
    crack.position.set(DOOR_AT - WALL_T / 2 - 0.05, DOOR_H / 2, 0)
    crack.rotation.y = Math.PI / 2
    frame.add(crack)
    doors.push({ leaves, day, beam, crack })
  }
  // Mommy's mat beside the east Buddha.
  root.add(solid(merge([P.box(0.75, 0.02, 0.95, '#E9A0B8', { at: [MOMMY_AT[0], 0.012, MOMMY_AT[2]] }), P.box(0.79, 0.018, 0.99, GOLD, { at: [MOMMY_AT[0], 0.006, MOMMY_AT[2]] })]), bag, 1.5))

  // ---------------------------------------------------------------- outside the east door
  // The courtyard: paving, a lawn by the statues, trees, the far wall.
  root.add(solid(merge([
    P.box(40, 0.1, 40, '#E9DEC8', { at: [6, GROUND - 0.05, 0] }),
    P.box(6, 0.02, 4.5, '#A8D58E', { at: [14.5, GROUND + 0.01, 5.2] }),
    P.box(6, 0.02, 4, '#A8D58E', { at: [14.2, GROUND + 0.01, -4.4] }),
    P.box(0.5, 1.4, 30, WHITE, { at: [19.5, GROUND + 0.7, 0] }),
    ...[[18.5, -5.5], [19.5, -1.5], [18, 6.5], [20, 2.5], [13, -7.5], [12.5, 8.5]].flatMap(([x, z], k) => [P.cyl(0.12, 0.16, 1.4, WOOD, { at: [x, GROUND + 0.7, z] }, 8), P.sphere(0.9 + (k % 3) * 0.2, k % 2 ? '#7FB77E' : '#8FC48A', { at: [x, GROUND + 1.9 + (k % 2) * 0.3, z], scale: [1, 0.9, 1] }, 12)]),
  ]), bag, 2))
  // The stairs.
  const steps: BufferGeometry[] = []
  const run = (STAIRS.x1 - STAIRS.x0) / STAIRS.steps
  for (let k = 0; k < STAIRS.steps; k++) {
    const top = (GROUND * (k + 1)) / (STAIRS.steps + 1)
    steps.push(P.box(run, top - GROUND, STAIRS.half * 2, k % 2 ? WHITE : '#F1EADF', { at: [STAIRS.x0 + run * (k + 0.5), (top + GROUND) / 2, 0] }))
  }
  root.add(solid(merge(steps), bag, 1.5))
  // The two nagas: green-gold bodies down the sides of the stairs, heads rearing up at the foot.
  const nagas: Naga[] = []
  for (const s of [-1, 1]) {
    const parts: BufferGeometry[] = []
    const z = s * NAGA_Z
    const n = 22
    for (let k = 0; k <= n; k++) {
      const f = k / n
      const x = STAIRS.x0 - 0.2 + (STAIRS.x1 - STAIRS.x0 + 0.2) * f
      const y = 0.3 + GROUND * f
      parts.push(P.sphere(0.19, k % 3 ? NAGA : '#7CCB95', { at: [x, y, z] }, 12))
    }
    parts.push(P.sphere(0.18, NAGA, { at: [STAIRS.x0 - 0.35, 0.5, z] }, 12), P.cone(0.15, 0.6, NAGA, { at: [STAIRS.x0 - 0.42, 0.85, z], rot: [0, 0, 0.4] }, 10))
    // The neck rising to the head.
    for (let k = 1; k <= 7; k++) parts.push(P.sphere(0.19, k % 3 ? NAGA : '#7CCB95', { at: [STAIRS.x1 + 0.045 * k, GROUND + 0.3 + k * 0.1, z] }, 12))
    root.add(solid(merge(parts), bag, 2))
    const head = new Group()
    head.position.set(NAGA_HEAD_X, GROUND + 1.18, z)
    head.add(solid(merge([
      P.sphere(0.26, NAGA, {}, 16),
      P.sphere(0.17, '#7CCB95', { at: [0.22, -0.05, 0], scale: [1.2, 0.8, 1] }, 12),
      P.sphere(0.1, GOLD, { at: [0.08, -0.16, 0], scale: [1.6, 0.6, 1.4] }, 10),
      // The crest: a fan of gold flames.
      ...[-2, -1, 0, 1, 2].map((k) => P.cone(0.07, 0.42, GOLD, { at: [-0.12, 0.22, k * 0.1], rot: [k * 0.25, 0, 0.5] }, 8)),
      ...[-1, 1].map((e) => P.sphere(0.07, '#FFFFFF', { at: [0.17, 0.08, e * 0.12] }, 10)),
      ...[-1, 1].map((e) => P.sphere(0.035, PAL.ink, { at: [0.225, 0.09, e * 0.13] }, 8)),
    ]), bag, 2))
    const lids = solid(merge([-1, 1].map((e) => P.sphere(0.078, NAGA, { at: [0.17, 0.08, e * 0.12] }, 10))), bag, 0)
    lids.scale.set(1, 0.05, 1)
    head.add(lids)
    root.add(head)
    nagas.push({ head, lids })
  }
  // The shoe rack (three slots on top) and the three pairs of shoes.
  const rack = solid(merge([
    P.box(1.3, 0.05, 0.4, WOOD, { at: [0, 0.55, 0] }),
    P.box(1.3, 0.05, 0.4, WOOD, { at: [0, 0.25, 0] }),
    ...[-0.62, 0.62].map((x) => P.box(0.06, 0.6, 0.4, WOOD, { at: [x, 0.3, 0] })),
  ]), bag, 2)
  rack.position.set(...RACK)
  root.add(rack)
  const rackSlots = [-0.4, 0, 0.4].map((dx) => new Vector3(RACK[0] + dx, RACK[1] + 0.58, RACK[2]))
  const shoes = [
    { c: '#FF6FAE', w: 0.1, l: 0.2 },
    { c: '#7E6A8E', w: 0.13, l: 0.3 },
    { c: '#FFB79E', w: 0.11, l: 0.25 },
  ].map(({ c, w, l }) => solid(merge([-1, 1].flatMap((s) => [P.rbox(w, 0.07, l, 0.03, c, { at: [s * (w * 0.62), 0.035, 0] }), P.box(w * 0.7, 0.02, 0.03, '#FFFFFF', { at: [s * (w * 0.62), 0.075, -l * 0.15] })])), bag, 1.5))
  for (const s of shoes) root.add(s)
  // The bell post.
  const bellRoot = new Group()
  bellRoot.position.set(...BELL_POST)
  bellRoot.add(solid(merge([...[-1, 1].map((s) => P.cyl(0.06, 0.07, 1.9, RED, { at: [0, 0.95, s * 0.45] }, 8)), P.box(0.14, 0.12, 1.15, RED, { at: [0, 1.92, 0] }), P.prism([[-0.75, 0], [0.75, 0], [0, 0.32]], 0.2, GOLD, { at: [0, 1.98, 0], rot: [0, Math.PI / 2, 0] })]), bag, 2))
  const bell = solid(merge([P.cyl(0.12, 0.26, 0.42, BRONZE, { at: [0, -0.3, 0] }, 16), P.sphere(0.12, BRONZE, { at: [0, -0.1, 0] }, 12), P.torus(0.25, 0.025, GOLD_DARK, { at: [0, -0.5, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2)
  bell.position.set(0, 1.86, 0)
  bellRoot.add(bell)
  root.add(bellRoot)
  // The whispering lovers' statues on the lawn: him leaning to her ear.
  const statues = new Group()
  statues.position.set(...STATUES)
  statues.rotation.y = 0.75
  statues.add(solid(merge([P.box(1.1, 0.4, 0.6, '#D9D2E2', { at: [0, 0.2, 0] })]), bag, 2))
  const figure = (woman: boolean) => {
    const g = new Group()
    g.add(solid(merge([
      P.cyl(woman ? 0.14 : 0.11, woman ? 0.19 : 0.13, 0.55, STONE, { at: [0, 0.28, 0] }, 12),
      P.capsule(0.11, 0.18, STONE, { at: [0, 0.68, 0] }),
      P.sphere(0.12, STONE, { at: [0, 0.98, 0] }, 14),
      P.sphere(0.06, STONE, { at: [woman ? 0.06 : 0, woman ? 1.07 : 1.1, 0] }, 10),
    ]), bag, 2))
    g.position.set(woman ? 0.2 : -0.2, 0.4, 0)
    statues.add(g)
    return g
  }
  const man = figure(false)
  const woman = figure(true)
  man.rotation.z = -0.15
  root.add(statues)

  return { root, catchers, murals, doors, buddhas, altars, nagas, rack, rackSlots, shoes, bell, statues: { man, woman }, glowMap }
}

/** Kaylee's paper lantern: warm paper that glows (unlit), gold caps and ribs, a red tassel, its light and its glow. */
export function buildLantern(bag: Bag, glowMap: CanvasTexture): Lantern {
  const root = new Group()
  const body = new Group()
  const paper = new Mesh(bag.add(P.sphere(0.15, '#FFFFFF', { scale: [1, 1.2, 1] }, 18)), bag.add(new MeshBasicMaterial({ color: '#FFE2A8' })))
  body.add(paper)
  body.add(solid(merge([
    P.cyl(0.07, 0.09, 0.05, GOLD, { at: [0, 0.18, 0] }, 12),
    P.cyl(0.09, 0.07, 0.05, GOLD, { at: [0, -0.18, 0] }, 12),
    P.torus(0.15, 0.008, '#E89A4A', { rot: [Math.PI / 2, 0, 0] }),
    P.torus(0.12, 0.007, '#E89A4A', { at: [0, 0.1, 0], rot: [Math.PI / 2, 0, 0] }),
    P.torus(0.12, 0.007, '#E89A4A', { at: [0, -0.1, 0], rot: [Math.PI / 2, 0, 0] }),
    P.cone(0.04, 0.16, '#E0405A', { at: [0, -0.28, 0], rot: [Math.PI, 0, 0] }, 8),
  ]), bag, 1.5))
  root.add(body)
  const glow = glowSprite(glowMap, '#FFC46A', bag, 0.75)
  glow.scale.setScalar(1.3)
  root.add(glow)
  const light = new PointLight('#FFC27A', 0, 3.8, 1.6)
  root.add(light)
  return { root, body, light, glow, knot: new Vector3(0, -0.2, 0) }
}

/** A pigeon: grey-lavender, a pink-green neck, wings that flap. */
export function buildPigeon(bag: Bag): Pigeon {
  const root = new Group()
  root.add(solid(merge([
    P.sphere(0.11, '#A7A9C2', { at: [0, 0.12, 0], scale: [1, 0.85, 1.35] }, 12),
    P.cone(0.06, 0.14, '#8C8EAA', { at: [0, 0.13, -0.17], rot: [-Math.PI / 2 - 0.2, 0, 0] }, 8),
    ...[-1, 1].map((s) => P.cyl(0.008, 0.008, 0.07, '#FF8FA3', { at: [s * 0.04, 0.035, 0.02] }, 5)),
  ]), bag, 1.5))
  const head = new Group()
  head.position.set(0, 0.22, 0.1)
  head.add(solid(merge([P.sphere(0.065, '#9FB7B0', { at: [0, -0.04, -0.01] }, 10), P.sphere(0.06, '#B3B5CC', { at: [0, 0.02, 0.02] }, 12), P.cone(0.016, 0.05, '#E8B84A', { at: [0, 0.01, 0.09], rot: [Math.PI / 2, 0, 0] }, 6)]), bag, 1.5))
  head.add(solid(merge([-1, 1].map((s) => P.sphere(0.012, PAL.ink, { at: [s * 0.04, 0.035, 0.05] }, 6))), bag, 0))
  root.add(head)
  const wings = [-1, 1].map((s) => {
    const w = new Group()
    w.position.set(s * 0.09, 0.16, 0)
    w.add(solid(merge([P.sphere(0.09, '#9497B5', { at: [s * 0.03, 0, -0.03], scale: [0.35, 0.7, 1.4] }, 10)]), bag, 1.5))
    root.add(w)
    return w
  }) as [Group, Group]
  return { root, head, wings }
}

