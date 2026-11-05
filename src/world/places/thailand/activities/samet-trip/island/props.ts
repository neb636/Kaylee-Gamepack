// The things on Koh Samet's beaches, built from code in the toon look: Sai Kaew's jet ski hut with its bell, the pink
// umbrellas and red loungers and the mermaid on her rocks (shared with the jet ski bay), and for the island to roam
// every beach's pokeable things (island/layout.ts POKES), Na Dan pier with its little shops, the beach bars with fairy
// lights for the night, the resort deck above Ao Prao, the big driftwood tree (Dad's sunset photo), the snorkel boat's
// jetty at Ao Wong Duan, the sandcastle spot at Ao Hin Khok and the pink flags. Each pokeable thing is its own group
// on a pivot, so a tap can spin, shake or squash it.
import { Group, Mesh, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid, type V3 } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { groundAt } from './ground'
import { at, bay, DECK, FRAMES, HUT, PIER, PLACES, POKES, STOPS, UMBRELLAS, type Frame, type PokeKind, type StopId, type XZ } from './layout'
import { bushGeo, glowMaterial, palmGeo, palmTop, rng, sametGeo, stick, type Blockers, type Ground } from './scenery'

const ang = (f: { n: XZ }) => Math.atan2(f.n.x, f.n.z)

// ---------------------------------------------------------------- Sai Kaew (the jet ski bay's pieces)

export interface SaiKaew {
  bell: Group
  umbrellas: Group[]
  mermaid: Group
  /** The tail of the mermaid (it splashes). */
  tail: Group
}

export function buildSaiKaew(bag: Bag, root: Group, block?: Blockers['add']): SaiKaew {
  // ---- Pink umbrellas and red chairs along the sand.
  const umbrellas: Group[] = []
  const beach: BufferGeometry[] = []
  UMBRELLAS.forEach((p, i) => {
    const a = bay(p.u, p.v)
    const y = groundAt(a.x, a.z).h
    const c = [PAL.pink, '#FFFFFF', PAL.hotpink, '#FFD0E2'][i % 4]
    beach.push(P.cyl(0.05, 0.05, 2.3, '#F4EEE6', { at: [a.x, y + 1.15, a.z] }, 6))
    block?.(a.x, a.z, 0.2)
    const u = new Group()
    u.add(solid(merge([P.cone(1.55, 0.6, c, { at: [0, 0, 0] }, 10), P.sphere(0.09, '#FFFFFF', { at: [0, 0.34, 0] }, 8), P.cone(1.56, 0.08, i % 2 ? PAL.pink : '#FFFFFF', { at: [0, -0.3, 0] }, 10)]), bag, 2))
    u.position.set(a.x, y + 2.45, a.z)
    root.add(u)
    umbrellas.push(u)
    const n = { x: Math.sin(0.31), z: Math.cos(0.31) }
    for (const side of [-0.7, 0.7]) {
      const lx = a.x + n.x * 1.4 + Math.cos(0.31) * side
      const lz = a.z + n.z * 1.4 - Math.sin(0.31) * side
      const ly = groundAt(lx, lz).h
      beach.push(...lounger(lx, ly, lz, 0.31, i % 2 ? '#F0596B' : '#FFFFFF'))
      block?.(lx, lz, 0.45)
    }
  })
  root.add(solid(merge(beach), bag, 2))

  // ---- The jet ski hut: posts, a thatch roof, a striped counter, life jackets hanging, and the bell.
  const hy = groundAt(HUT.x, HUT.z).h
  const face = 0.31
  const local = (lx: number, ly: number, lz: number): V3 => [HUT.x + Math.cos(face) * lx + Math.sin(face) * lz, hy + ly, HUT.z - Math.sin(face) * lx + Math.cos(face) * lz]
  const hut: BufferGeometry[] = []
  for (const [lx, lz] of [[-1.8, -1.4], [1.8, -1.4], [-1.8, 1.4], [1.8, 1.4]]) hut.push(P.cyl(0.09, 0.11, 2.6, '#B98A5E', { at: local(lx, 1.3, lz) }, 7))
  hut.push(P.rbox(3.9, 0.16, 3.2, 0.04, '#D8B48A', { at: local(0, 0.1, 0), rot: [0, face, 0] }))
  hut.push(P.cone(3.3, 1.5, '#E3C27F', { at: local(0, 3.25, 0), rot: [0, face + Math.PI / 4, 0] }, 4))
  hut.push(P.cone(3.0, 0.2, '#CDA96A', { at: local(0, 2.55, 0), rot: [0, face + Math.PI / 4, 0] }, 4))
  hut.push(P.rbox(3.2, 0.95, 0.5, 0.06, '#FFFFFF', { at: local(0, 0.65, 1.2), rot: [0, face, 0] }))
  hut.push(P.box(3.22, 0.14, 0.52, '#F0596B', { at: local(0, 0.78, 1.2), rot: [0, face, 0] }))
  hut.push(P.box(3.22, 0.08, 0.52, PAL.gold, { at: local(0, 0.6, 1.2), rot: [0, face, 0] }))
  for (let k = 0; k < 4; k++) hut.push(P.rbox(0.42, 0.55, 0.16, 0.06, k % 2 ? '#FF9A3D' : PAL.pink, { at: local(-1.3 + k * 0.42, 1.9, -1.35), rot: [0, face, 0] }))
  root.add(solid(merge(hut), bag, 2))
  block?.(HUT.x, HUT.z, 2.3)
  const bell = new Group()
  bell.add(solid(merge([P.cone(0.26, 0.42, PAL.gold, { at: [0, -0.28, 0] }, 14), P.sphere(0.07, '#B08A2E', { at: [0, -0.5, 0] }, 8), P.torus(0.06, 0.02, '#B08A2E', { at: [0, -0.04, 0] })]), bag, 2))
  bell.position.set(...local(1.8, 2.45, 1.75))
  root.add(bell)

  // ---- The mermaid on her rocks (the poem's mermaid, Sunthorn Phu's: a stone statue, verdigris green).
  const mermaid = new Group()
  const mp = PLACES.mermaid
  const my = Math.max(0, groundAt(mp.x, mp.z).h)
  const stone = '#9DBDB3'
  mermaid.add(
    solid(
      merge([
        P.sphere(2.2, '#C9BFB4', { at: [0, 0.4, 0], scale: [1.3, 0.7, 1] }, 12),
        P.sphere(1.5, '#B8AEA5', { at: [1.6, 0.2, 0.9], scale: [1, 0.7, 1] }, 10),
        P.capsule(0.42, 0.7, stone, { at: [0, 2.3, 0], rot: [0.1, 0, 0] }),
        P.sphere(0.42, stone, { at: [0, 3.35, 0.05] }, 14),
        P.sphere(0.46, '#87A99F', { at: [0, 3.45, -0.12], scale: [1, 1, 1.05] }, 12),
        P.capsule(0.32, 0.9, stone, { at: [0.55, 1.6, 0.35], rot: [1.25, 0, -0.35] }),
        P.capsule(0.24, 0.5, stone, { at: [1.05, 1.35, 1.05], rot: [1.6, 0, -0.9] }),
        P.capsule(0.1, 0.55, stone, { at: [-0.42, 2.45, 0.2], rot: [0.3, 0, 0.6] }),
        P.capsule(0.1, 0.55, stone, { at: [0.42, 2.45, 0.2], rot: [0.3, 0, -0.6] }),
      ]),
      bag,
      2,
    ),
  )
  const tail = new Group()
  tail.add(solid(P.prism([[0, 0], [0.55, 0.45], [0.25, 0.05], [0.55, -0.4]], 0.12, stone, { rot: [0, 0.6, 0] }), bag, 2))
  tail.position.set(1.35, 1.25, 1.5)
  mermaid.add(tail)
  mermaid.position.set(mp.x, my - 0.4, mp.z)
  mermaid.rotation.y = 0.3
  root.add(mermaid)
  block?.(mp.x, mp.z, 2.6)
  return { bell, umbrellas, mermaid, tail }
}

/** A beach lounger (a sun bed with a raised back), facing `face` (toward the sea). */
function lounger(x: number, y: number, z: number, face: number, col: string): BufferGeometry[] {
  const n = { x: Math.sin(face), z: Math.cos(face) }
  return [
    P.rbox(0.6, 0.12, 1.7, 0.05, col, { at: [x, y + 0.36, z], rot: [0, face, 0] }),
    P.rbox(0.6, 0.12, 0.7, 0.05, col, { at: [x - n.x * 0.95, y + 0.62, z - n.z * 0.95], rot: [-0.9, face, 0] }),
    P.box(0.06, 0.3, 0.06, '#D7CFC6', { at: [x + n.x * 0.6, y + 0.15, z + n.z * 0.6] }),
    P.box(0.06, 0.3, 0.06, '#D7CFC6', { at: [x - n.x * 0.6, y + 0.15, z - n.z * 0.6] }),
  ]
}

// ---------------------------------------------------------------- the island's pokeable things and places

export interface PokeThing {
  id: string
  kind: PokeKind
  /** The group a tap moves (on its pivot). */
  g: Group
  /** Ground point and the height of the thing (for its tap target). */
  at: XZ
  y: number
  h: number
  /** Extra parts some things have: a palm's coconut spot, a crab, an umbrella's canopy, a chair's back. */
  part?: Group
  top?: Vector3
}

export interface Props {
  pokes: Map<string, PokeThing>
  /** The stops' things (the jet ski hut's jet ski, the sandcastle's bucket, the snorkel boat, the driftwood tree). */
  stops: Record<StopId, Group>
  /** A pink flag on its pole at each stop (hidden until earned). */
  flags: Record<StopId, Group>
  saikaew: SaiKaew
  /** The night lights (fairy lights, lanterns): their glow follows the day. */
  setLamps(k: number, t: number): void
  /** Na Dan pier's deck and the resort deck: walkable tops (height and the box). */
  decks: { x: number; z: number; t: XZ; n: XZ; hw: number; hd: number; y: number; ramp: number }[]
}

export function buildProps(bag: Bag, root: Group, ground: Ground, blockers: Blockers, cullable: { g: Group; x: number; z: number }[] = []): Props {
  const R = rng(4242)
  const h = (p: XZ) => Math.max(0, ground.heightAt(p.x, p.z))
  const pokes = new Map<string, PokeThing>()
  const saikaew = buildSaiKaew(bag, root, blockers.add)
  const lamps: { m: Mesh; base: number }[] = []
  const glowMat = glowMaterial(bag, '#FFE7A8')
  const pinkGlow = glowMaterial(bag, '#FF9AD0')
  const glowGeo = bag.add(new SphereGeometry(0.22, 8, 6))
  const lamp = (g: Group | null, x: number, y: number, z: number, pink = false, r = 1) => {
    const m = new Mesh(glowGeo, pink ? pinkGlow : glowMat)
    m.position.set(x, y, z)
    r *= 0.45
    m.scale.setScalar(r)
    ;(g ?? root).add(m)
    lamps.push({ m, base: r })
  }
  const add = (id: string, kind: PokeKind, g: Group, a: XZ, y: number, hh: number, extra?: Partial<PokeThing>) => {
    root.add(g)
    pokes.set(id, { id, kind, g, at: a, y, h: hh, ...extra })
  }
  const facing = (p: XZ) => {
    // Out to sea from here: the shore's slope.
    const gx = ground.shoreAt(p.x + 1.5, p.z) - ground.shoreAt(p.x - 1.5, p.z)
    const gz = ground.shoreAt(p.x, p.z + 1.5) - ground.shoreAt(p.x, p.z - 1.5)
    return Math.atan2(gx, gz)
  }

  // Everything that never moves goes in `place` (merged by tile at the end): only the moving parts are their own meshes.
  const place: BufferGeometry[] = []
  const fixed = (g: BufferGeometry, at: XZ, y: number, yaw = 0) => {
    g.rotateY(yaw)
    g.translate(at.x, y, at.z)
    place.push(g)
  }
  for (const p of POKES) {
    const y = h(p.at)
    const g = new Group()
    g.position.set(p.at.x, y, p.at.z)
    if (p.kind === 'palm') {
      const f = facing(p.at)
      const lean = new Vector3(Math.sin(f), 0, Math.cos(f)).multiplyScalar(0.9)
      const H = 7 + R() * 1.5
      g.add(solid(merge(palmGeo(R, new Vector3(0, -0.2, 0), H, lean)), bag, 2))
      blockers.add(p.at.x, p.at.z, 0.38)
      add(p.id, 'palm', g, p.at, y, H, { top: palmTop(new Vector3(p.at.x, y - 0.2, p.at.z), H, lean) })
    } else if (p.kind === 'samet') {
      g.add(solid(merge(sametGeo(R, 0, 0, 0, 1.3)), bag, 2))
      blockers.add(p.at.x, p.at.z, 0.35)
      add(p.id, 'samet', g, p.at, y, 4)
    } else if (p.kind === 'umbrella') {
      const c = [PAL.pink, PAL.hotpink, '#FFD0E2', '#FFFFFF'][R() * 4 | 0]
      fixed(P.cyl(0.05, 0.05, 2.3, '#F4EEE6', { at: [0, 1.15, 0] }, 6), p.at, y)
      const can = new Group()
      can.add(solid(merge([P.cone(1.55, 0.6, c, {}, 10), P.sphere(0.09, '#FFFFFF', { at: [0, 0.34, 0] }, 8), P.cone(1.56, 0.08, c === '#FFFFFF' ? PAL.pink : '#FFFFFF', { at: [0, -0.3, 0] }, 10)]), bag, 2))
      can.position.y = 2.45
      g.add(can)
      const f = facing(p.at)
      for (const g2 of [...lounger(Math.sin(f) * 1.4 + Math.cos(f) * 0.7, 0, Math.cos(f) * 1.4 - Math.sin(f) * 0.7, f, '#F0596B'), ...lounger(Math.sin(f) * 1.4 - Math.cos(f) * 0.7, 0, Math.cos(f) * 1.4 + Math.sin(f) * 0.7, f, '#FFFFFF')]) fixed(g2, p.at, y)
      blockers.add(p.at.x, p.at.z, 0.2)
      for (const sd of [-0.7, 0.7]) blockers.add(p.at.x + Math.sin(f) * 1.4 + Math.cos(f) * sd, p.at.z + Math.cos(f) * 1.4 - Math.sin(f) * sd, 0.45)
      add(p.id, 'umbrella', g, p.at, y, 2.6, { part: can })
    } else if (p.kind === 'chair') {
      // A red folding beach chair (Ao Prao's, from the sunset photo): the back folds down flat on a tap.
      const f = facing(p.at)
      g.rotation.y = f
      fixed(merge([P.rbox(0.62, 0.1, 0.9, 0.04, '#E8475C', { at: [0, 0.36, 0.1] }), P.box(0.05, 0.36, 0.05, '#C9C2B8', { at: [-0.26, 0.18, 0.45] }), P.box(0.05, 0.36, 0.05, '#C9C2B8', { at: [0.26, 0.18, 0.45] }), P.box(0.05, 0.36, 0.05, '#C9C2B8', { at: [-0.26, 0.18, -0.3] }), P.box(0.05, 0.36, 0.05, '#C9C2B8', { at: [0.26, 0.18, -0.3] })]), p.at, y, f)
      const back = new Group()
      back.add(solid(P.rbox(0.62, 0.75, 0.08, 0.04, '#F0596B', { at: [0, 0.37, 0] }), bag, 2))
      back.position.set(0, 0.4, -0.32)
      back.rotation.x = -0.35
      g.add(back)
      blockers.add(p.at.x, p.at.z, 0.5)
      add(p.id, 'chair', g, p.at, y, 1.1, { part: back })
    } else if (p.kind === 'ball') {
      const ball = new Group()
      ball.add(solid(merge([P.sphere(0.36, '#FFFFFF', {}, 14), P.torus(0.355, 0.07, PAL.hotpink, { rot: [0, 0, 0] }), P.torus(0.355, 0.07, PAL.butter, { rot: [0, Math.PI / 3, 0] }), P.torus(0.355, 0.07, PAL.mint, { rot: [0, (Math.PI * 2) / 3, 0] }), P.sphere(0.08, PAL.hotpink, { at: [0, 0.34, 0] }, 8)]), bag, 2))
      ball.position.y = 0.36
      g.add(ball)
      add(p.id, 'ball', g, p.at, y, 0.8, { part: ball })
    } else if (p.kind === 'icecream') {
      // The coconut ice cream cart: a little pink cart with a striped canopy and a bell.
      g.rotation.y = 0.31
      g.add(solid(merge([P.rbox(1.5, 0.8, 0.8, 0.12, '#FFFFFF', { at: [0, 0.75, 0] }), P.box(1.52, 0.18, 0.82, PAL.pink, { at: [0, 0.95, 0] }), P.torus(0.28, 0.05, '#8A8296', { at: [-0.55, 0.3, 0.42] }), P.torus(0.28, 0.05, '#8A8296', { at: [0.55, 0.3, 0.42] }), P.cyl(0.03, 0.03, 1.3, '#F4EEE6', { at: [0, 1.8, 0] }, 6), P.cone(1.0, 0.45, '#FFD0E2', { at: [0, 2.55, 0] }, 8), P.sphere(0.2, '#F6EBD9', { at: [-0.3, 1.25, 0] }, 10), P.sphere(0.2, '#FFB3CF', { at: [0.2, 1.25, 0.1] }, 10), P.sphere(0.12, PAL.gold, { at: [0.62, 1.2, 0.3] }, 8)]), bag, 2))
      blockers.add(p.at.x, p.at.z, 0.9)
      add(p.id, 'icecream', g, p.at, y, 2.6)
    } else if (p.kind === 'beads') {
      // The bead seller's tray on a little stand: strings of colored beads that jingle.
      g.rotation.y = 0.31
      const tray: BufferGeometry[] = [P.rbox(1.2, 0.08, 0.7, 0.03, '#C99A66', { at: [0, 0.9, 0] }), P.box(0.05, 0.9, 0.05, '#A97C50', { at: [-0.5, 0.45, 0] }), P.box(0.05, 0.9, 0.05, '#A97C50', { at: [0.5, 0.45, 0] })]
      for (let k = 0; k < 7; k++) tray.push(P.torus(0.12, 0.035, [PAL.hotpink, PAL.gold, PAL.mint, '#7FB7FF', PAL.pink, '#FFFFFF', '#C9A6FF'][k], { at: [-0.45 + k * 0.15, 0.97, (k % 2) * 0.15 - 0.07], rot: [Math.PI / 2, 0, 0] }))
      g.add(solid(merge(tray), bag, 2))
      blockers.add(p.at.x, p.at.z, 0.7)
      add(p.id, 'beads', g, p.at, y, 1.1)
    } else if (p.kind === 'crab') {
      // A crab hole in the sand (a dark dot with a rim of balls of sand) and its little ghost crab.
      const hole = solid(merge([P.cyl(0.16, 0.16, 0.02, '#8F7A5E', { at: [0, 0.01, 0] }, 12), ...[0, 1, 2, 3, 4].map((k) => P.sphere(0.04, '#E9D7B2', { at: [Math.sin(k * 1.3) * 0.28, 0.03, Math.cos(k * 1.3) * 0.28] }, 6))]), bag, 0)
      g.add(hole)
      const crab = new Group()
      crab.add(solid(merge([P.sphere(0.13, '#F3D9B5', { scale: [1.3, 0.6, 1] }, 10), P.sphere(0.035, PAL.ink, { at: [-0.05, 0.1, 0.1] }, 6), P.sphere(0.035, PAL.ink, { at: [0.05, 0.1, 0.1] }, 6), P.capsule(0.03, 0.1, '#F3D9B5', { at: [-0.17, 0.02, 0.07], rot: [0, 0, 1.1] }), P.capsule(0.03, 0.1, '#F3D9B5', { at: [0.17, 0.02, 0.07], rot: [0, 0, -1.1] }), P.sphere(0.06, '#F7E4C6', { at: [-0.2, 0.04, 0.16] }, 6), P.sphere(0.06, '#F7E4C6', { at: [0.2, 0.04, 0.16] }, 6)]), bag, 2))
      crab.position.y = -0.2
      g.add(crab)
      add(p.id, 'crab', g, p.at, y, 0.4, { part: crab })
    } else if (p.kind === 'bush') {
      g.add(solid(merge(bushGeo(R, 0, 0, 0, 1.1)), bag, 2))
      blockers.add(p.at.x, p.at.z, 1)
      add(p.id, 'bush', g, p.at, y, 1.4)
    } else if (p.kind === 'longtail' || p.kind === 'speedboat') {
      // On the water: a longtail (a long wooden boat, a tall prow with ribbons, a canopy) or the speedboat.
      g.position.y = 0
      const f = facing(p.at)
      g.rotation.y = f + Math.PI / 2
      if (p.kind === 'longtail') {
        g.add(solid(merge([P.rbox(1.1, 0.5, 5.6, 0.2, '#9A6B44', { at: [0, 0.15, 0] }), P.box(1.12, 0.1, 5.62, '#4FA3C9', { at: [0, 0.36, 0] }), P.cone(0.2, 1.6, '#9A6B44', { at: [0, 0.95, 2.9], rot: [0.5, 0, 0] }, 6), P.sphere(0.22, PAL.hotpink, { at: [0, 1.5, 3.25] }, 8), P.sphere(0.18, PAL.butter, { at: [0.1, 1.35, 3.2] }, 8), P.rbox(0.9, 0.06, 2.2, 0.03, '#F6EEDD', { at: [0, 1.7, -0.6] }), ...[-1, 1].flatMap((s) => [P.cyl(0.03, 0.03, 1.3, '#C9B9A2', { at: [s * 0.4, 1.05, -1.6] }, 5), P.cyl(0.03, 0.03, 1.3, '#C9B9A2', { at: [s * 0.4, 1.05, 0.4] }, 5)]), P.box(0.18, 0.18, 1.5, '#5C5468', { at: [0, 0.5, -3.3], rot: [0.25, 0, 0] })]), bag, 2))
        add(p.id, p.kind, g, p.at, 0, 1.8)
      } else {
        g.add(solid(merge([P.rbox(2.0, 0.7, 6.4, 0.3, '#FFFFFF', { at: [0, 0.2, 0] }), P.box(2.02, 0.14, 6.42, '#3F8FE8', { at: [0, 0.38, 0] }), P.cone(1.0, 1.4, '#FFFFFF', { at: [0, 0.2, 3.6], rot: [Math.PI / 2, 0, 0], scale: [1, 1, 0.35] }, 10), P.rbox(1.6, 0.9, 2.0, 0.2, '#F6F3FA', { at: [0, 1.0, -0.3] }), P.rbox(1.62, 0.3, 1.0, 0.1, '#9FD5F2', { at: [0, 1.25, 0.65], rot: [-0.5, 0, 0] }), P.rbox(1.8, 0.08, 2.6, 0.04, '#3F8FE8', { at: [0, 1.55, -0.6] })]), bag, 2))
        add(p.id, p.kind, g, p.at, 0, 2)
      }
    } else if (p.kind === 'hammock') {
      // Between two palms at Ao Noi Na: a pink striped hammock that swings.
      const f = facing(p.at)
      const side = { x: Math.cos(f), z: -Math.sin(f) }
      for (const s of [-1, 1]) {
        const base = new Vector3(p.at.x + side.x * s * 2.2, h({ x: p.at.x + side.x * s * 2.2, z: p.at.z + side.z * s * 2.2 }) - 0.2, p.at.z + side.z * s * 2.2)
        const tree = new Group()
        tree.add(solid(merge(palmGeo(R, base, 6.5, new Vector3(Math.sin(f), 0, Math.cos(f)).multiplyScalar(0.5))), bag, 2))
        root.add(tree)
        blockers.add(base.x, base.z, 0.4)
      }
      g.rotation.y = f + Math.PI / 2
      const net = new Group()
      net.add(solid(merge([P.torus(1.9, 0.05, '#F4EEE6', { at: [0, 0, 0], rot: [0, Math.PI / 2, 0], scale: [1, 0.45, 1] }, Math.PI), P.capsule(0.32, 2.6, PAL.pink, { at: [0, -0.62, 0], rot: [Math.PI / 2, 0, 0], scale: [1.5, 1, 0.45] }), P.capsule(0.33, 2.62, '#FFFFFF', { at: [0, -0.6, 0], rot: [Math.PI / 2, 0, 0], scale: [1.3, 0.4, 0.47] })]), bag, 2))
      net.position.y = 1.5
      net.rotation.y = Math.PI / 2
      g.add(net)
      add(p.id, 'hammock', g, p.at, y, 1.5, { part: net })
    } else if (p.kind === 'telescope') {
      // The sunset viewpoint's lookout: a little deck with a rail and a coin telescope facing the sea.
      const f = facing(p.at)
      g.rotation.y = f
      const scope = new Group()
      scope.add(solid(merge([P.cyl(0.1, 0.12, 0.7, '#5FA2E0', { rot: [Math.PI / 2, 0, 0] }, 10), P.cyl(0.13, 0.13, 0.12, '#3A6FB0', { at: [0, 0, 0.38], rot: [Math.PI / 2, 0, 0] }, 10)]), bag, 2))
      scope.position.set(0, 1.2, 0.2)
      g.add(solid(merge([P.rbox(3.2, 0.15, 2.4, 0.04, '#C99A66', { at: [0, 0.08, 0.4] }), P.cyl(0.04, 0.05, 1.1, '#8A8296', { at: [0, 0.6, 0.2] }, 6), ...[-1.5, -0.5, 0.5, 1.5].map((x) => P.box(0.07, 0.9, 0.07, '#A97C50', { at: [x, 0.5, 1.55] })), P.box(3.2, 0.08, 0.08, '#A97C50', { at: [0, 0.95, 1.55] })]), bag, 2), scope)
      add(p.id, 'telescope', g, p.at, y, 1.5, { part: scope })
    } else if (p.kind === 'tamarind') {
      // The tamarind tree at Ao Wong Duan (where the hornbill sits): a wide, feathery dark crown.
      g.add(solid(merge([P.cyl(0.3, 0.42, 3, '#8C6A4D', { at: [0, 1.5, 0] }, 8), P.sphere(2.6, '#4E9A57', { at: [0, 4.4, 0], scale: [1.3, 0.7, 1.2] }, 12), P.sphere(1.8, '#5AA85E', { at: [1.6, 4.9, 0.6], scale: [1.1, 0.7, 1] }, 10), P.sphere(1.7, '#62AF62', { at: [-1.5, 4.7, -0.5], scale: [1.1, 0.7, 1] }, 10)]), bag, 2))
      blockers.add(p.at.x, p.at.z, 0.6)
      add(p.id, 'tamarind', g, p.at, y, 5.5)
    } else if (p.kind === 'deckbrella') {
      // The cream umbrellas on the resort deck (photo 2): their skirts flap.
      const can = new Group()
      can.add(solid(merge([P.cone(1.7, 0.55, '#FBF4E6', {}, 8), P.cone(1.72, 0.12, '#EDE1C8', { at: [0, -0.3, 0] }, 8)]), bag, 2))
      can.position.y = 2.5
      g.add(solid(P.cyl(0.05, 0.05, 2.4, '#8A6A4D', { at: [0, 1.2, 0] }, 6), bag, 2), can)
      add(p.id, 'deckbrella', g, p.at, y, 2.6, { part: can })
    } else if (p.kind === 'lantern') {
      g.add(solid(P.sphere(0.25, '#FF8FB8', {}, 10), bag, 2))
      add(p.id, 'lantern', g, p.at, y, 0.6)
    }
  }

  // ---- Places: Na Dan pier, the shops by the pier, beach bars, the resort deck, the snorkel jetty, the driftwood
  // tree, the sandcastle spot.
  const decks: Props['decks'] = []
  const yOf = (p: XZ) => h(p)
  // Na Dan pier: a long concrete pier on posts with a blue rail, a little shelter at its end.
  {
    const a = PIER.from
    const b = PIER.to
    const len = Math.hypot(b.x - a.x, b.z - a.z)
    const yaw = Math.atan2(b.x - a.x, b.z - a.z)
    const mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }
    const t = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    const n = { x: Math.sin(yaw), z: Math.cos(yaw) }
    place.push(P.rbox(PIER.w, 0.3, len, 0.06, '#E9E3D8', { at: [mid.x, PIER.y - 0.15, mid.z], rot: [0, yaw, 0] }))
    for (let k = 0; k <= len; k += 3) for (const s of [-1, 1]) {
      const px = a.x + n.x * k + t.x * s * (PIER.w / 2 - 0.15)
      const pz = a.z + n.z * k + t.z * s * (PIER.w / 2 - 0.15)
      place.push(P.cyl(0.14, 0.14, PIER.y + 3, '#CFC7B8', { at: [px, PIER.y - 1.6, pz] }, 7))
      place.push(P.cyl(0.05, 0.05, 0.9, '#5FA2E0', { at: [px, PIER.y + 0.45, pz] }, 5))
      blockers.add(px, pz, 0.12)
    }
    for (const s of [-1, 1]) place.push(P.box(0.08, 0.08, len, '#5FA2E0', { at: [mid.x + t.x * s * (PIER.w / 2 - 0.15), PIER.y + 0.9, mid.z + t.z * s * (PIER.w / 2 - 0.15)], rot: [0, yaw, 0] }))
    // The shelter at the end.
    const e = { x: b.x - n.x * 3, z: b.z - n.z * 3 }
    for (const [u, v] of [[-1, -1.2], [1, -1.2], [-1, 1.2], [1, 1.2]]) place.push(P.cyl(0.07, 0.07, 2.4, '#F4EEE6', { at: [e.x + t.x * u + n.x * v, PIER.y + 1.2, e.z + t.z * u + n.z * v] }, 6))
    place.push(P.rbox(2.8, 0.18, 3.2, 0.06, '#3F8FE8', { at: [e.x, PIER.y + 2.45, e.z], rot: [0, yaw, 0] }))
    place.push(P.rbox(2.6, 0.12, 3.0, 0.05, '#FFFFFF', { at: [e.x, PIER.y + 2.58, e.z], rot: [0, yaw, 0] }))
    decks.push({ x: mid.x, z: mid.z, t, n, hw: PIER.w / 2 - 0.25, hd: len / 2 + 1.2, y: PIER.y, ramp: 3 })
  }
  // The shops by Na Dan pier and a beach bar on every beach: little houses with pastel walls and tin or thatch roofs,
  // fairy lights along the front (they glow at night).
  const shop = (p: XZ, face: number, wall: string, roof: string, w = 4, d = 3.2, lights = true) => {
    const y = yOf(p)
    const c = Math.cos(face)
    const s = Math.sin(face)
    const L = (lx: number, ly: number, lz: number): V3 => [p.x + c * lx + s * lz, y + ly, p.z - s * lx + c * lz]
    place.push(P.rbox(w, 2.4, d, 0.08, wall, { at: L(0, 1.0, 0), rot: [0, face, 0] }))
    place.push(P.box(w + 0.02, 0.35, d + 0.02, '#FFFFFF', { at: L(0, -0.05, 0), rot: [0, face, 0] }))
    place.push(P.prism([[-w / 2 - 0.4, 0], [w / 2 + 0.4, 0], [0, 1.2]], d + 0.8, roof, { at: L(0, 2.2, 0), rot: [0, face, 0] }))
    place.push(P.rbox(w * 0.5, 1.3, 0.06, 0.03, '#7A5A44', { at: L(-w * 0.15, 0.85, d / 2 + 0.01), rot: [0, face, 0] }))
    place.push(P.rbox(w * 0.3, 0.8, 0.06, 0.03, '#BFE6F7', { at: L(w * 0.3, 1.2, d / 2 + 0.01), rot: [0, face, 0] }))
    // An awning over the front.
    place.push(P.box(w + 0.6, 0.06, 1.4, roof === '#E3C27F' ? '#F6E6B4' : '#FFD0E2', { at: L(0, 2.0, d / 2 + 0.6), rot: [0.18, face, 0] }))
    blockers.add(p.x, p.z, Math.max(w, d) * 0.55)
    if (lights) for (let k = 0; k < 7; k++) {
      const lx = -w / 2 - 0.2 + ((w + 0.4) * k) / 6
      const at = L(lx, 1.95 - Math.sin((k / 6) * Math.PI) * 0.25, d / 2 + 1.25)
      place.push(P.sphere(0.07, [PAL.hotpink, PAL.gold, PAL.mint, '#9FD5FF'][k % 4], { at }, 6))
      lamp(null, at[0], at[1], at[2], k % 2 === 1, 0.9)
    }
  }
  {
    const f = FRAMES.nadan
    const out = ang(f)
    const a1 = at(f, -12, -16)
    const a2 = at(f, 4, -17)
    const a3 = at(f, 11, -14)
    shop(a1, out, '#FFE2EC', '#F0596B')
    shop(a2, out, '#E7F3FF', '#5FA2E0', 5)
    shop(a3, out, '#FFF4D6', '#8FD18A', 3.6)
  }
  shop(bay(-24, -13), 0.31, '#FFF1E0', '#E3C27F', 5, 3.4)
  shop(at(FRAMES.phai, 6, -14), ang(FRAMES.phai), '#F2E9FF', '#E3C27F', 4.4)
  shop(at(FRAMES.wongduan, 9, -14), ang(FRAMES.wongduan), '#E6FFF6', '#F0596B', 4.4)
  shop(at(FRAMES.prao, -10, -13.5), ang(FRAMES.prao), '#FFF6EA', '#E3C27F', 4.6)
  // Lanterns on strings between the palms at Sai Kaew (where the fire show will be): pink paper globes.
  for (let k = 0; k < 9; k++) {
    const p = bay(-30 + k * 7, -10.5)
    const y = yOf(p) + 3.1 + Math.sin(k * 1.7) * 0.2
    place.push(P.sphere(0.22, k % 2 ? PAL.pink : '#FFFFFF', { at: [p.x, y, p.z] }, 8))
    lamp(null, p.x, y, p.z, k % 2 === 1, 1.6)
  }

  // ---- The resort deck above Ao Prao: wood on stilts, a dark rail, tables and rattan chairs with green cushions.
  {
    const D = DECK
    const ground0 = Math.max(...[[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]].map(([u, v]) => yOf(at(D, (u * D.w) / 2, (v * D.d) / 2))))
    const y = ground0 + 0.9
    const L = (u: number, v: number, dy: number): V3 => {
      const p = at(D, u, v)
      return [p.x, y + dy, p.z]
    }
    place.push(P.rbox(D.d, 0.22, D.w, 0.05, '#B07D52', { at: L(0, 0, -0.11), rot: [0, D.face + Math.PI / 2, 0] }))
    for (let u = -D.w / 2 + 0.3; u <= D.w / 2; u += 2.1) for (const v of [-D.d / 2 + 0.3, D.d / 2 - 0.3]) {
      const p = at(D, u, v)
      place.push(P.cyl(0.12, 0.12, y - yOf(p) + 0.5, '#8A5E3C', { at: [p.x, (y + yOf(p)) / 2 - 0.25, p.z] }, 7))
    }
    // The rail on the sea side and the two ends (the land side is open, with steps down to the sand).
    place.push(P.box(0.1, 0.1, D.w, '#5A3D2A', { at: L(0, D.d / 2 - 0.1, 0.95), rot: [0, D.face + Math.PI / 2, 0] }))
    for (let u = -D.w / 2; u <= D.w / 2 + 0.01; u += 1) place.push(P.box(0.07, 0.95, 0.07, '#5A3D2A', { at: L(u, D.d / 2 - 0.1, 0.47) }))
    for (const s of [-1, 1]) place.push(P.box(0.1, 0.1, D.d, '#5A3D2A', { at: L((s * D.w) / 2, 0, 0.95), rot: [0, D.face, 0] }))
    for (const [u, v] of [[-2.5, 0.8], [2.5, 0.8]]) {
      place.push(P.cyl(0.6, 0.6, 0.06, '#F6EEDD', { at: L(u, v, 0.75) }, 14), P.cyl(0.06, 0.06, 0.72, '#5A3D2A', { at: L(u, v, 0.37) }, 6))
      for (const du of [-0.85, 0.85]) place.push(P.rbox(0.55, 0.5, 0.55, 0.12, '#C79A62', { at: L(u + du, v, 0.25) }), P.rbox(0.5, 0.12, 0.5, 0.06, du < 0 ? '#7CC46A' : '#C6E36A', { at: L(u + du, v, 0.55) }))
      place.push(P.sphere(0.18, '#D9A55C', { at: L(u + 0.15, v, 0.85), scale: [1.2, 0.6, 1] }, 10))
    }
    decks.push({ x: D.x, z: D.z, t: D.t, n: D.n, hw: D.w / 2 - 0.2, hd: D.d / 2 - 0.25, y, ramp: 2.5 })
    for (const id of ['deckbrella:0', 'deckbrella:1']) {
      const p = pokes.get(id)
      if (p) p.g.position.y = y
    }
  }

  // ---- The stops' things.
  const stops = {} as Record<StopId, Group>
  // The jet ski at Sai Kaew is the jet ski world's (island.ts parks it); here just its glow spot.
  stops.jetski = new Group()
  // Ao Hin Khok: the sandcastle spot, a mound of wet sand with a pink bucket and spade stuck in it.
  {
    const s = STOPS.sandcastle.at
    const g = new Group()
    g.position.set(s.x, yOf(s), s.z)
    g.add(solid(merge([P.sphere(1.3, '#EBD5AA', { scale: [1.2, 0.35, 1] }, 14), P.cyl(0.32, 0.24, 0.42, PAL.hotpink, { at: [0.6, 0.55, 0.2], rot: [0.3, 0, -0.3] }, 12), P.torus(0.3, 0.03, PAL.pink, { at: [0.66, 0.78, 0.26], rot: [Math.PI / 2 + 0.3, 0, -0.3] }), P.box(0.05, 0.6, 0.05, PAL.butter, { at: [-0.5, 0.55, 0.1], rot: [0.2, 0, 0.3] }), P.box(0.22, 0.26, 0.04, PAL.butter, { at: [-0.62, 0.28, 0.12], rot: [0.2, 0, 0.3] }), P.cyl(0.25, 0.32, 0.45, '#E2C996', { at: [-0.2, 0.5, -0.6] }, 10), P.cone(0.28, 0.3, '#E2C996', { at: [-0.2, 0.88, -0.6] }, 10)]), bag, 2))
    root.add(g)
    blockers.add(s.x, s.z, 1.1)
    stops.sandcastle = g
  }
  // Ao Wong Duan: a little wooden jetty and the snorkel boat (a blue-and-white longtail with a canopy and a ladder).
  {
    const f = FRAMES.wongduan
    const a0 = at(f, -3, -1)
    const a1 = at(f, -3, 11)
    const yaw = Math.atan2(a1.x - a0.x, a1.z - a0.z)
    const mid = { x: (a0.x + a1.x) / 2, z: (a0.z + a1.z) / 2 }
    const t = { x: Math.cos(yaw), z: -Math.sin(yaw) }
    const n = { x: Math.sin(yaw), z: Math.cos(yaw) }
    place.push(P.rbox(2, 0.18, 13, 0.04, '#C99A66', { at: [mid.x, 0.85, mid.z], rot: [0, yaw, 0] }))
    for (let k = 0; k <= 12; k += 2.4) for (const s of [-1, 1]) {
      const px = a0.x + n.x * k + t.x * s * 0.85
      const pz = a0.z + n.z * k + t.z * s * 0.85
      place.push(P.cyl(0.1, 0.1, 2.6, '#8A5E3C', { at: [px, -0.4, pz] }, 6))
      blockers.add(px, pz, 0.1)
    }
    decks.push({ x: mid.x, z: mid.z, t, n, hw: 0.8, hd: 7.2, y: 0.94, ramp: 2 })
    const boat = new Group()
    const b = at(f, -5.6, 9.5)
    boat.position.set(b.x, 0, b.z)
    boat.rotation.y = yaw
    boat.add(solid(merge([P.rbox(1.8, 0.7, 7.2, 0.3, '#FFFFFF', { at: [0, 0.2, 0] }), P.box(1.82, 0.16, 7.22, '#3F8FE8', { at: [0, 0.42, 0] }), P.cone(0.24, 1.8, '#FFFFFF', { at: [0, 1.0, 3.7], rot: [0.5, 0, 0] }, 6), P.sphere(0.24, PAL.hotpink, { at: [0, 1.7, 4.1] }, 8), P.rbox(1.7, 0.08, 4.4, 0.04, '#5FC4E0', { at: [0, 2.2, -0.6] }), ...[-1, 1].flatMap((s) => [P.cyl(0.04, 0.04, 1.8, '#E9E3D8', { at: [s * 0.75, 1.3, -2.6] }, 5), P.cyl(0.04, 0.04, 1.8, '#E9E3D8', { at: [s * 0.75, 1.3, 1.4] }, 5)]), P.box(0.6, 0.05, 1.2, '#E9E3D8', { at: [1.05, 0.1, -1], rot: [0, 0, 1.2] }), ...[0, 1, 2].map((k) => P.rbox(0.3, 0.14, 0.3, 0.05, [PAL.gold, PAL.mint, PAL.hotpink][k], { at: [-0.5 + k * 0.5, 0.7, -2.8] }))]), bag, 2))
    root.add(boat)
    stops.snorkel = boat
  }
  // Ao Prao: the big driftwood tree from Dad's sunset photo, silver-grey with a tangle of roots and reaching branches.
  {
    const s = STOPS.hideseek.at
    const y = yOf(s)
    const g = new Group()
    g.position.set(s.x, y, s.z)
    const wood = ['#CFC8C0', '#BDB5AD', '#DAD4CC']
    const parts: BufferGeometry[] = []
    const R2 = rng(77)
    const trunk0 = new Vector3(0, 0.2, 0)
    const trunk1 = new Vector3(0.6, 2.6, 0.3)
    parts.push(stick(trunk0, trunk1, 0.75, 0.45, wood[0]))
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2 + R2() * 0.4
      const l = 1.6 + R2() * 1.4
      const end = new Vector3(Math.sin(a) * l, 0.05 + R2() * 0.5, Math.cos(a) * l)
      const knee = new Vector3(Math.sin(a) * l * 0.45, 0.7 + R2() * 0.5, Math.cos(a) * l * 0.45)
      parts.push(stick(new Vector3(0, 0.6, 0), knee, 0.32, 0.22, wood[k % 3]), stick(knee, end, 0.22, 0.1, wood[(k + 1) % 3]))
    }
    for (let k = 0; k < 5; k++) {
      const a = k * 1.3 + 0.4
      const end = trunk1.clone().add(new Vector3(Math.sin(a) * (1.8 + R2()), 0.8 + R2() * 1.4, Math.cos(a) * (1.8 + R2())))
      parts.push(stick(trunk1, end, 0.28, 0.1, wood[k % 3]))
      const tw = end.clone().add(new Vector3(Math.sin(a + 0.8) * 0.9, 0.5, Math.cos(a + 0.8) * 0.9))
      parts.push(stick(end, tw, 0.1, 0.05, wood[(k + 2) % 3]))
    }
    g.add(solid(merge(parts), bag, 2))
    root.add(g)
    blockers.add(s.x, s.z, 1.4)
    stops.hideseek = g
  }

  // ---- The pink flags (one per stop, hidden until that stop is done): a tall pole and a pink pennant on its beach.
  const flags = {} as Record<StopId, Group>
  for (const id of Object.keys(STOPS) as StopId[]) {
    const s = STOPS[id]
    const f = FRAMES[s.place as keyof typeof FRAMES] as Frame
    const p = id === 'jetski' ? bay(-8, -6) : id === 'snorkel' ? at(f, 2, -5) : id === 'hideseek' ? at(f, 3, -8) : at(f, 4, -7)
    const g = new Group()
    g.position.set(p.x, yOf(p), p.z)
    g.add(solid(merge([P.cyl(0.06, 0.07, 4.2, '#FFFFFF', { at: [0, 2.1, 0] }, 8), P.sphere(0.13, PAL.gold, { at: [0, 4.27, 0] }, 10), P.cyl(0.35, 0.45, 0.2, '#F4E6CC', { at: [0, 0.1, 0] }, 10)]), bag, 2))
    const pennant = new Group()
    pennant.add(solid(merge([P.prism([[0, 0], [1.6, -0.45], [0, -0.9]], 0.04, PAL.hotpink), P.prism([[0.25, -0.28], [0.85, -0.45], [0.25, -0.62]], 0.05, '#FFFFFF')]), bag, 2))
    pennant.position.set(0.05, 4.1, 0)
    g.add(pennant)
    g.userData.pennant = pennant
    g.visible = false
    root.add(g)
    flags[id] = g
  }

  // The places, merged by 40 m tile (so the camera only draws the ones it sees).
  const byTile = new Map<string, BufferGeometry[]>()
  for (const g of place) {
    g.computeBoundingSphere()
    const c = g.boundingSphere!.center
    const k = `${Math.floor(c.x / 40)},${Math.floor(c.z / 40)}`
    let a = byTile.get(k)
    if (!a) byTile.set(k, (a = []))
    a.push(g)
  }
  for (const [k, gs] of byTile) {
    const g = solid(merge(gs), bag, 2)
    root.add(g)
    const [i, j] = k.split(',').map(Number)
    cullable.push({ g, x: (i + 0.5) * 40, z: (j + 0.5) * 40 })
  }

  return {
    pokes,
    stops,
    flags,
    saikaew,
    decks,
    setLamps(k, t) {
      const mats = [glowMat, pinkGlow]
      for (const m of mats) m.opacity = 0.7 * k
      for (let i = 0; i < lamps.length; i++) {
        const l = lamps[i]
        l.m.visible = k > 0.02
        l.m.scale.setScalar(l.base * (1 + k * 0.8) * (1 + 0.12 * Math.sin(t * 3 + i * 1.7)))
      }
    },
  }
}

