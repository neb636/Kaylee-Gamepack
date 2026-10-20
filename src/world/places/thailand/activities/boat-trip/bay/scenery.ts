// The bay's open-water scenery, from simple shapes in the house's toon look (geo.ts parts merged into one mesh and one
// ink outline per group). Rock towers are lumpy grey-lavender columns with a dark notch at the waterline (the sea
// nibbles it), streaks down their sides, a ring of foam where the water meets them and a bushy green jungle cap. Far
// away, islands stand in three layers of flat silhouettes fading into the haze, so the bay feels endless. The stops
// build their own (village.ts, cave.ts, nail.ts).
import { CylinderGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial, RingGeometry, Shape, ShapeGeometry, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { BOUNDS, CAVE_GLOW, BEACH_GLOW, EXIT_GLOW, PIER, PIER_GLOW, RACE_GLOW, RAFT, ROCKS, SHORE_Z, VILLAGE_GLOW, type Rock } from './layout'

export const ROCK = '#C3B8D2'
export const ROCK_DARK = '#8E829F'
export const NOTCH = '#6F6484'
export const JUNGLE = '#7CCB8C'
export const JUNGLE_DARK = '#5BB27A'
export const SAND = '#FBE7B8'
export const WOOD = '#D59A6E'
export const POST = '#8C6A55'

/** One rock tower's parts (vertex colors), varied by where it stands so each looks a little different. */
export function tower(r: Rock, opts: { cap?: boolean; seg?: number } = {}): BufferGeometry[] {
  const seg = opts.seg ?? 12
  const h = r.h
  const k = Math.abs(Math.sin(r.x * 12.9898 + r.z * 78.233)) // 0..1, the same every time
  const notch = 1.4
  const parts = [
    // The notch the waves carved at the waterline, then the tower, a little wider near the top.
    P.cyl(r.r * 0.86, r.r * 0.82, notch, NOTCH, { at: [r.x, notch / 2 - 0.2, r.z] }, seg),
    P.cyl(r.r * (0.9 + k * 0.2), r.r, h * 0.62, ROCK, { at: [r.x, notch + h * 0.31, r.z] }, seg),
    P.cyl(r.r * (0.75 + k * 0.15), r.r * (0.9 + k * 0.2), h * 0.3, ROCK, { at: [r.x, notch + h * 0.62 + h * 0.15, r.z] }, seg),
    // A lump on one side and a darker streak, so the towers aren't plain tubes.
    P.cyl(r.r * 0.45, r.r * 0.55, h * (0.35 + k * 0.3), ROCK_DARK, { at: [r.x + Math.cos(k * 9) * r.r * 0.62, notch + h * 0.25, r.z + Math.sin(k * 9) * r.r * 0.62] }, 8),
    // Rain streaks down the face: thin darker stripes.
    ...[0, 1, 2].map((i) => {
      const a = k * 7 + i * 2.1
      return P.box(r.r * 0.09, h * (0.35 + 0.1 * i), r.r * 0.09, '#AFA3C2', { at: [r.x + Math.cos(a) * r.r * 0.93, notch + h * (0.55 - 0.05 * i), r.z + Math.sin(a) * r.r * 0.93], rot: [0, -a, 0] })
    }),
  ]
  if (opts.cap !== false) {
    const top = notch + h * 0.92
    parts.push(
      P.sphere(r.r * (0.85 + k * 0.2), JUNGLE, { at: [r.x, top, r.z], scale: [1, 0.42, 1] }, 10),
      P.sphere(r.r * 0.45, JUNGLE_DARK, { at: [r.x + r.r * 0.35, top + r.r * 0.25, r.z - r.r * 0.2], scale: [1, 0.7, 1] }, 8),
      // Bushes clinging to the sides.
      P.sphere(r.r * 0.3, JUNGLE_DARK, { at: [r.x - Math.sin(k * 5) * r.r * 0.8, notch + h * 0.6, r.z + Math.cos(k * 5) * r.r * 0.8], scale: [1, 0.7, 1] }, 8),
    )
  }
  return parts
}

/** A flat ring of foam round a rock at the waterline. */
export function foamRing(r: Rock): BufferGeometry {
  const g = new RingGeometry(r.r * 0.86, r.r * 0.86 + 0.7 + r.r * 0.05, 24)
  g.rotateX(-Math.PI / 2)
  g.translate(r.x, 0.03, r.z)
  return g
}

/** A golden glow she can see from far away: a soft column of light and a ring on the water. */
export function buildGlow(bag: Bag, x: number, z: number, r: number) {
  const g = new Group()
  const beam = new Mesh(bag.add(new CylinderGeometry(r * 0.55, r * 0.7, 26, 20, 1, true)), bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.22, depthWrite: false })))
  beam.position.y = 13
  const ring = new Mesh(bag.add(new RingGeometry(r * 0.75, r, 32)), bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0.7, depthWrite: false })))
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.04
  g.add(beam, ring)
  g.position.set(x, 0, z)
  return g
}

export type GlowId = 'village' | 'cave' | 'beach' | 'pier' | 'out' | 'race'
export interface Scenery {
  root: Group
  glows: Record<GlowId, Group>
}

export function buildScenery(bag: Bag): Scenery {
  const root = new Group()

  // ---- Rock towers out in the bay, each with its foam ring ----
  root.add(solid(merge(ROCKS.flatMap((r) => tower(r))), bag, 2.5))
  const foam = new Mesh(bag.add(merge(ROCKS.map(foamRing))), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })))
  root.add(foam)

  // ---- Far islands: three layers of flat silhouettes round the bay, each paler (further into the haze) ----
  const layers: [number, string, number][] = [
    [290, '#B4AACB', 60],
    [380, '#C6BEDB', 85],
    [500, '#D6D1E8', 110],
  ]
  layers.forEach(([dist, color, tall], li) => {
    const shapes: BufferGeometry[] = []
    const n = 22 + li * 6
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + li * 0.37
      const x = BOUNDS.x + Math.sin(a) * dist
      const z = BOUNDS.z + Math.cos(a) * dist
      // Not over the shore behind the pier (the hills are there).
      if (z > SHORE_Z - 20 && Math.abs(x) < 260) continue
      const w = 26 + ((i * 37 + li * 11) % 30)
      const h = tall * (0.55 + ((i * 53 + li * 7) % 45) / 100)
      // A lumpy tower outline: straight-ish sides, a rounded bumpy top.
      const s = new Shape()
      s.moveTo(-w / 2, -2)
      s.lineTo(-w / 2 + w * 0.06, h * 0.75)
      for (let b = 0; b <= 6; b++) {
        const bx = -w / 2 + w * 0.06 + (b / 6) * w * 0.88
        s.lineTo(bx, h * (0.82 + 0.18 * Math.sin(b * 1.9 + i)))
      }
      s.lineTo(w / 2, -2)
      s.closePath()
      const g = new ShapeGeometry(s, 4)
      // Facing the middle of the bay.
      g.rotateY(Math.atan2(BOUNDS.x - x, BOUNDS.z - z))
      g.translate(x, 0, z)
      shapes.push(g)
    }
    root.add(new Mesh(bag.add(merge(shapes)), bag.add(new MeshBasicMaterial({ color, side: DoubleSide, fog: true }))))
  })

  // ---- The pier, the south shore behind it, and the raft where the canoe waits ----
  const shore: BufferGeometry[] = [
    P.box(700, 1.2, 160, SAND, { at: [0, 0.2, SHORE_Z + 80] }),
    P.box(PIER.w, 0.16, PIER.z1 - PIER.z0, WOOD, { at: [PIER.x, 0.95, (PIER.z0 + PIER.z1) / 2] }),
    // Planks across the pier, and its rail posts.
    ...Array.from({ length: Math.floor((PIER.z1 - PIER.z0) / 0.6) }, (_, i) => P.box(PIER.w + 0.02, 0.02, 0.05, '#B97E55', { at: [PIER.x, 1.035, PIER.z0 + 0.3 + i * 0.6] })),
  ]
  for (let z = PIER.z0 + 0.5; z < PIER.z1; z += 3) for (const s of [-1, 1]) shore.push(P.cyl(0.13, 0.13, 1.4, POST, { at: [PIER.x + s * (PIER.w / 2 - 0.2), 0.3, z] }, 6))
  // A little roofed shelter at the land end of the pier, with a sign board (no letters).
  shore.push(
    ...[-1, 1].flatMap((s) => [0, 1].map((k) => P.cyl(0.1, 0.1, 2.4, POST, { at: [PIER.x + s * 1.2, 2.2, PIER.z1 - 3 - k * 2.6] }, 6))),
    P.box(3.2, 0.12, 3.6, PAL.hotpink, { at: [PIER.x, 3.5, PIER.z1 - 4.3], rot: [0, 0, 0.08] }),
    P.box(3.2, 0.12, 3.6, '#E2407F', { at: [PIER.x, 3.5, PIER.z1 - 4.3], rot: [0, 0, -0.08] }),
  )
  // Palm trees and green hills along the shore.
  for (let i = 0; i < 18; i++) {
    const x = -170 + i * 20 + ((i * 37) % 9)
    const z = SHORE_Z + 10 + ((i * 53) % 14)
    shore.push(P.sphere(14 + (i % 3) * 4, i % 2 ? JUNGLE : JUNGLE_DARK, { at: [x, 0, z + 18], scale: [1, 0.5, 0.8] }, 10))
    if (i % 2 === 0) {
      shore.push(P.cyl(0.25, 0.32, 6, '#B08463', { at: [x + 6, 3.4, z - 4], rot: [0, 0, 0.12] }, 6))
      for (let l = 0; l < 4; l++) shore.push(P.cone(0.9, 3.4, JUNGLE_DARK, { at: [x + 6.7 + Math.sin(l * 1.57) * 1.2, 6.4, z - 4 + Math.cos(l * 1.57) * 1.2], rot: [Math.cos(l * 1.57) * 1.3, 0, -Math.sin(l * 1.57) * 1.3] }, 5))
    }
  }
  // Other longtails moored along the shore (pastel hulls, no family in them).
  for (const [i, x] of [-30, -22, 16, 26].entries()) {
    const c = [PAL.sky, PAL.mint, PAL.butter, PAL.lavender][i]
    shore.push(P.rbox(1.2, 0.5, 5.6, 0.22, c, { at: [x, 0.15, SHORE_Z - 0.6], rot: [0, 0.3 - i * 0.2, 0] }), P.box(1.24, 0.08, 5, PAL.hotpink, { at: [x, 0.36, SHORE_Z - 0.6], rot: [0, 0.3 - i * 0.2, 0] }))
  }
  shore.push(P.rbox(2.6, 0.3, 3.4, 0.1, WOOD, { at: [RAFT.x + 2.0, 0.12, RAFT.z + 0.6] }))
  root.add(solid(merge(shore), bag, 2))

  // ---- Glowing stops ----
  const glows: Record<GlowId, Group> = {
    village: buildGlow(bag, VILLAGE_GLOW.x, VILLAGE_GLOW.z, VILLAGE_GLOW.r * 0.7),
    cave: buildGlow(bag, CAVE_GLOW.x, CAVE_GLOW.z, CAVE_GLOW.r * 0.7),
    beach: buildGlow(bag, BEACH_GLOW.x, BEACH_GLOW.z, BEACH_GLOW.r * 0.7),
    pier: buildGlow(bag, PIER_GLOW.x, PIER_GLOW.z, PIER_GLOW.r * 0.7),
    out: buildGlow(bag, EXIT_GLOW.x, EXIT_GLOW.z, EXIT_GLOW.r * 0.7),
    race: buildGlow(bag, RACE_GLOW.x, RACE_GLOW.z, RACE_GLOW.r * 0.7),
  }
  root.add(...Object.values(glows))

  return { root, glows }
}
