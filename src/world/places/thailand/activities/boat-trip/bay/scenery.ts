// The bay's scenery, greybox: everything from simple shapes in the house's toon look (geo.ts parts merged into one mesh
// and one ink outline per group). Rock towers are lumpy grey-lavender columns with a dark notch at the waterline (the
// sea nibbles it) and a green jungle cap; the far ones are flat silhouettes in the haze.
import { BufferGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RingGeometry, Vector3 } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL, toon } from '../../../engine/toon'
import { BEACH, BEACH_GLOW, BEACH_OUT, CAVE_GLOW, CLIFFS, FAR, HONG, NAIL, PIER, RAFT, RING, ROCKS, SHORE_Z, TUNNEL, tunnelRoof, type Rock } from './layout'

const ROCK = '#C3B8D2'
const ROCK_DARK = '#8E829F'
const NOTCH = '#6F6484'
const JUNGLE = '#7CCB8C'
const JUNGLE_DARK = '#5BB27A'
const CAVE = '#6A5F7C'
const SAND = '#FBE7B8'
const WOOD = '#D59A6E'

/** One rock tower's parts (vertex colors), varied by where it stands so each looks a little different. */
function tower(r: Rock, opts: { cap?: boolean; seg?: number } = {}): BufferGeometry[] {
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
  ]
  if (opts.cap !== false) {
    const top = notch + h * 0.92
    parts.push(
      P.sphere(r.r * (0.85 + k * 0.2), JUNGLE, { at: [r.x, top, r.z], scale: [1, 0.42, 1] }, 10),
      P.sphere(r.r * 0.45, JUNGLE_DARK, { at: [r.x + r.r * 0.35, top + r.r * 0.25, r.z - r.r * 0.2], scale: [1, 0.7, 1] }, 8),
    )
  }
  return parts
}

export interface Scenery {
  root: Group
  buoys: Group
  glows: { cave: Group; beach: Group }
}

export function buildScenery(bag: Bag): Scenery {
  const root = new Group()

  // ---- Rock towers out in the bay, the hong's ring of cliffs and the two cliffs of Khao Phing Kan ----
  root.add(solid(merge(ROCKS.flatMap((r) => tower(r))), bag, 2.5))
  root.add(solid(merge(RING.flatMap((r) => tower(r))), bag, 2.5))
  // Leaning toward each other, with the split between them.
  // (Turning about the beach's outward axis tips the tops sideways: the first cliff's top toward the second.)
  const out = new Vector3(BEACH_OUT[0], 0, BEACH_OUT[1])
  const cliffs = CLIFFS.map((c, i) => {
    const g = solid(merge(tower({ ...c, x: 0, z: 0 })), bag, 2.5)
    g.position.set(c.x, 0, c.z)
    g.setRotationFromAxisAngle(out, (i === 0 ? -1 : 1) * 0.12)
    return g
  })
  root.add(...cliffs)
  // Far towers: silhouettes in the haze, no outline.
  const far = new Mesh(bag.add(merge(FAR.flatMap((r) => [P.cyl(r.r * 0.8, r.r, r.h, '#CFC8E2', { at: [r.x, r.h / 2, r.z] }, 8), P.sphere(r.r * 0.85, '#B9DCC6', { at: [r.x, r.h, r.z], scale: [1, 0.35, 1] }, 8)]))), toon('#ffffff', true))
  root.add(far)

  // ---- The tunnel: a ceiling that comes down low (with drips hanging from it), and dark water inside ----
  const ceiling: BufferGeometry[] = []
  const w = TUNNEL.half * 2 + 0.8
  const top = HONG.h - 2
  for (let z = TUNNEL.z1; z < TUNNEL.z0; z += 0.8) {
    const low = tunnelRoof(z + 0.4)
    // Dark underneath (what she sees from inside), rock above, jungle on top.
    ceiling.push(P.box(w, 0.6, 0.82, CAVE, { at: [TUNNEL.x, low + 0.3, z + 0.4] }))
    ceiling.push(P.box(w, top - low - 0.6, 0.82, ROCK, { at: [TUNNEL.x, low + 0.6 + (top - low - 0.6) / 2, z + 0.4] }))
    if (Math.round(z / 0.8) % 2 === 0) ceiling.push(P.cone(0.12, 0.45, NOTCH, { at: [TUNNEL.x + ((z * 7) % 1.6) - 0.8, low - 0.2, z + 0.4], rot: [Math.PI, 0, 0] }, 6))
  }
  ceiling.push(P.box(w + 1, 1.2, TUNNEL.z0 - TUNNEL.z1, JUNGLE, { at: [TUNNEL.x, top + 0.5, (TUNNEL.z0 + TUNNEL.z1) / 2] }))
  // Smooth dark walls (the columns behind them are lumpy).
  for (const s of [-1, 1]) ceiling.push(P.box(0.4, HONG.h - 2, TUNNEL.z0 - TUNNEL.z1, CAVE, { at: [TUNNEL.x + s * (TUNNEL.half + 0.2), (HONG.h - 2) / 2, (TUNNEL.z0 + TUNNEL.z1) / 2] }))
  root.add(solid(merge(ceiling), bag, 2))
  const dark = new Mesh(bag.add(new PlaneGeometry(TUNNEL.half * 2, TUNNEL.z0 - TUNNEL.z1)), bag.add(new MeshBasicMaterial({ color: '#3F5E66', polygonOffset: true, polygonOffsetFactor: -2 })))
  dark.rotation.x = -Math.PI / 2
  dark.position.set(TUNNEL.x, 0.01, (TUNNEL.z0 + TUNNEL.z1) / 2)
  root.add(dark)

  // ---- Inside the hong: mangroves standing on their roots round the edge, and a mud bank ----
  const mangroves: BufferGeometry[] = []
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2 + 0.3
    if (Math.abs(Math.sin(a)) < 0.3 && Math.cos(a) > 0) continue // keep the tunnel's opening clear
    const x = HONG.x + Math.sin(a) * (HONG.inner - 1.5)
    const z = HONG.z + Math.cos(a) * (HONG.inner - 1.5)
    for (const s of [-1, 0, 1]) mangroves.push(P.cyl(0.06, 0.08, 1.4, '#8C6A55', { at: [x + s * 0.35, 0.6, z], rot: [0, 0, s * 0.35] }, 5))
    mangroves.push(P.sphere(1.5, i % 2 ? JUNGLE : JUNGLE_DARK, { at: [x, 2.2, z], scale: [1, 0.7, 1] }, 9))
  }
  mangroves.push(P.cyl(5, 5.5, 0.4, '#B98E6E', { at: [HONG.x - 7, 0.05, HONG.z - 6], scale: [1, 1, 0.6] }, 14))
  root.add(solid(merge(mangroves), bag, 2))

  // ---- Ko Tapu, the Nail Island: thin at the bottom, wide at the top, a tuft of green ----
  const n = NAIL
  root.add(
    solid(
      merge([
        P.cyl(n.r * 0.85, n.r * 0.8, 1.4, NOTCH, { at: [n.x, 0.5, n.z] }, 12),
        P.cyl(n.r * 1.25, n.r, n.h * 0.45, ROCK, { at: [n.x, 1.2 + n.h * 0.225, n.z] }, 12),
        P.cyl(n.top, n.r * 1.25, n.h * 0.45, ROCK, { at: [n.x + 0.6, 1.2 + n.h * 0.675, n.z] }, 12),
        P.cyl(n.top * 0.5, n.top * 0.6, n.h * 0.4, ROCK_DARK, { at: [n.x - 1.6, 1.2 + n.h * 0.7, n.z + 1], rot: [0, 0, 0.08] }, 8),
        P.sphere(n.top * 0.95, JUNGLE, { at: [n.x + 0.6, n.h + 1.4, n.z], scale: [1, 0.4, 1] }, 10),
        P.sphere(n.top * 0.5, JUNGLE_DARK, { at: [n.x - 0.8, n.h + 2.4, n.z + 0.6], scale: [1, 0.8, 1] }, 8),
      ]),
      bag,
      2.5,
    ),
  )
  // The red and white buoys that keep boats back.
  const buoys = new Group()
  const bp: BufferGeometry[] = []
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    const bx = n.x + Math.sin(a) * n.buoys
    const bz = n.z + Math.cos(a) * n.buoys
    bp.push(P.sphere(0.42, i % 2 ? '#FFFFFF' : '#F0646E', { at: [bx, 0.18, bz] }, 10))
    bp.push(P.cyl(0.04, 0.04, 0.5, PAL.ink, { at: [bx, 0.75, bz] }, 5))
  }
  buoys.add(solid(merge(bp), bag, 1.5))
  root.add(buoys)

  // ---- The beach of Khao Phing Kan, facing Ko Tapu ----
  const beach = solid(merge([P.rbox(BEACH.w, 0.5, BEACH.d, 0.2, SAND, { at: [0, 0.05, 0] }), P.rbox(BEACH.w * 0.7, 0.6, BEACH.d * 0.6, 0.2, SAND, { at: [0, 0.2, -BEACH.d * 0.25] })]), bag, 2)
  beach.position.set(BEACH.x, 0, BEACH.z)
  beach.rotation.y = Math.atan2(BEACH_OUT[0], BEACH_OUT[1])
  root.add(beach)

  // ---- The pier, the south shore behind it, and the raft where the canoe waits ----
  const shore: BufferGeometry[] = [
    P.box(700, 1.2, 160, SAND, { at: [0, 0.2, SHORE_Z + 80] }),
    P.box(PIER.w, 0.16, PIER.z1 - PIER.z0, WOOD, { at: [PIER.x, 0.95, (PIER.z0 + PIER.z1) / 2] }),
  ]
  for (let z = PIER.z0 + 0.5; z < PIER.z1; z += 3) for (const s of [-1, 1]) shore.push(P.cyl(0.13, 0.13, 1.4, '#8C6A55', { at: [PIER.x + s * (PIER.w / 2 - 0.2), 0.3, z] }, 6))
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
  shore.push(P.rbox(2.6, 0.3, 3.4, 0.1, WOOD, { at: [RAFT.x + 2.0, 0.12, RAFT.z + 0.6] }))
  root.add(solid(merge(shore), bag, 2))

  // ---- Glowing stops: a soft golden column she can see from far away, and a ring on the water ----
  const glow = (x: number, z: number, r: number) => {
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
  const glows = { cave: glow(CAVE_GLOW.x, CAVE_GLOW.z, CAVE_GLOW.r * 0.7), beach: glow(BEACH_GLOW.x, BEACH_GLOW.z, BEACH_GLOW.r * 0.7) }
  root.add(glows.cave, glows.beach)

  return { root, buoys, glows }
}
