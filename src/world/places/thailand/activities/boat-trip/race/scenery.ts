// The race lagoon (race.ts), from simple shapes in the bay's toon look (geo.ts parts merged into one mesh and one ink
// outline per group, the bay's rock towers and palms): a secret lagoon walled in by tall rock towers that follow the
// heart-shaped course round, a heart-shaped island of sand and jungle in the middle with the waterfall rock at its
// point, and the course roped off with pink and white buoys.
// - The start: a checkered line on the water under an inflatable rainbow arch, a checkered banner, and three lights
//   hanging from it for the countdown (setLights).
// - The grandstand floats beside the start straight: three rows of animal fans that bounce, more when she passes
//   (cheer), under a striped awning, with flags and bunting along the ropes.
// - The Twin Rocks: two towers on a sandy islet in the middle of the course (it splits round them), bunting strung
//   between their tops.
// - The Glow Grotto: five rock arches one after another over the left lobe, hung with vines, glowing crystals on
//   their feet and under their tops, fireflies drifting through.
// - The Heart Gate at the dip: a pink and white inflatable arch with a big puffy pink heart floating over it.
// - The waterfall pours off the big rock inside the hairpin at the heart's point.
// - Hot-air balloons drift overhead; the far towers stand in the haze beyond the ring.
import { CanvasTexture, DoubleSide, ExtrudeGeometry, Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, RingGeometry, Shape, ShapeGeometry, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../engine/dispose'
import { bake, merge, P, solid, solidMix } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import type { Rock } from '../bay/layout'
import { foamRing, JUNGLE, JUNGLE_DARK, ROCK, ROCK_DARK, SAND, tower } from '../bay/scenery'
import { DOLPHIN_RUN, ELEPHANTS, FALLS, FORK, GROTTO, halfAt, HALF, HEART_S, locate, PODIUM, SAMPLES, spotAt, STAND } from './track'

/** The rainbow's bands, outside in. */
export const RAINBOW = [PAL.hotpink, '#FFB07A', PAL.butter, PAL.mint, PAL.sky, PAL.lavenderDark]
const POLE = '#8C6A55'
const BARREL = '#5FA7E8'

export interface RaceScenery {
  root: Group
  /** Rock towers the chase camera must never end up inside. */
  towers: Rock[]
  /** The countdown's lights: 0 = all off, 1-3 = that many red, 4 = all green (go!), -1 = gone (after the start). */
  setLights(n: number): void
  /** The fans jump for a moment (she passed someone, a trick, the finish). */
  cheer(k?: number): void
  /** `cam`: the camera, so the start arch can step aside while the chase camera flies through it. */
  update(dt: number, t: number, cam: Vector3): void
}

function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646
}

/** The lagoon's middle: things round it are merged in sectors, so the ones behind the camera aren't drawn. */
const CX = 0
const CZ = 0
const SECTORS = 4
const tmpV = new Vector3()
function sectorOf(g: BufferGeometry) {
  g.computeBoundingBox()
  const c = g.boundingBox!.getCenter(new Vector3())
  const a = Math.atan2(c.x - CX, c.z - CZ) + Math.PI
  return Math.min(SECTORS - 1, Math.floor((a / (Math.PI * 2)) * SECTORS))
}
/** Parts merged per sector (one mesh and one outline each); `plain` parts get no outline. */
function sectored(root: Group, outlined: BufferGeometry[], bag: Bag, px: number, plain: BufferGeometry[] = []) {
  for (let k = 0; k < SECTORS; k++) {
    const a = outlined.filter((g) => sectorOf(g) === k)
    const b = plain.filter((g) => sectorOf(g) === k)
    if (!a.length && !b.length) continue
    root.add(b.length ? solidMix(a, b, bag, px) : solid(merge(a), bag, px))
  }
}

const HALVES = SAMPLES.map((p) => halfAt(p.s))
/** Meters from (x, z) to the nearest bit of the course's edge (its ropes; negative: on the course). */
function fromRope(x: number, z: number) {
  let best = Infinity
  for (let i = 0; i < SAMPLES.length; i += 2) best = Math.min(best, Math.hypot(SAMPLES[i].x - x, SAMPLES[i].z - z) - HALVES[i])
  return best
}
/** Inside the loop (the island's side)? */
function insideLoop(x: number, z: number) {
  let inside = false
  for (let i = 0, j = SAMPLES.length - 1; i < SAMPLES.length; j = i++) {
    const a = SAMPLES[i]
    const b = SAMPLES[j]
    if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) inside = !inside
  }
  return inside
}

/** A palm tree: a leaning trunk and a crown of fronds (and a coconut or two). */
export function palm(x: number, z: number, h: number, lean: number, y = 0): BufferGeometry[] {
  const top: [number, number, number] = [x + Math.sin(lean) * h * 0.18, y + h, z + Math.cos(lean) * h * 0.18]
  const parts = [P.cyl(0.22, 0.32, h, '#B08463', { at: [(x + top[0]) / 2, y + h / 2, (z + top[2]) / 2], rot: [Math.cos(lean) * 0.18, 0, -Math.sin(lean) * 0.18] }, 6)]
  for (let l = 0; l < 6; l++) {
    const a = (l / 6) * Math.PI * 2
    parts.push(P.cone(0.8, 3.6, l % 2 ? JUNGLE : JUNGLE_DARK, { at: [top[0] + Math.sin(a) * 1.4, top[1] - 0.2, top[2] + Math.cos(a) * 1.4], rot: [Math.cos(a) * 1.45, 0, -Math.sin(a) * 1.45] }, 5))
  }
  parts.push(...[-1, 1].map((s) => P.sphere(0.28, '#8B6A4E', { at: [top[0] + s * 0.3, top[1] - 0.45, top[2] + 0.2] }, 8)))
  return parts
}

/** A canvas texture: black and white squares (the start line's banner). */
export function checker(bag: Bag, cols: number, rows: number) {
  const c = document.createElement('canvas')
  c.width = cols * 16
  c.height = rows * 16
  const g = c.getContext('2d')!
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    g.fillStyle = (i + j) % 2 ? '#2B2330' : '#FFFFFF'
    g.fillRect(i * 16, j * 16, 16, 16)
  }
  return bag.add(new CanvasTexture(c))
}

/** One fan in the grandstand: a round body, a big head with ears (round, pointy or long), eyes, blush, arms up. */
function fan(x: number, y: number, z: number, k: number): BufferGeometry[] {
  const furs = ['#FFB3CF', '#A9EBD6', '#FBE78A', '#C9B5F7', '#FFC2A8', '#BFE0FF', '#FFFFFF', '#F2B36B']
  const shirts = [PAL.hotpink, PAL.sky, PAL.mint, PAL.butter, PAL.lavenderDark, '#FFB07A']
  const fur = furs[k % furs.length]
  const shirt = shirts[(k * 5) % shirts.length]
  const ears = k % 3
  // (Few sides each: there are a lot of them, far from the camera.)
  const parts = [
    P.sphere(0.32, shirt, { at: [x, y + 0.32, z], scale: [1, 1.05, 0.9] }, 8),
    P.sphere(0.34, fur, { at: [x, y + 0.86, z] }, 10),
    // Eyes and blush on the side facing the course (+x).
    ...[-1, 1].map((s) => P.sphere(0.06, PAL.ink, { at: [x + 0.29, y + 0.92, z + s * 0.12] }, 5)),
    ...[-1, 1].map((s) => P.sphere(0.05, '#FF9DB8', { at: [x + 0.27, y + 0.8, z + s * 0.2] }, 5)),
    // Arms up, cheering.
    ...[-1, 1].map((s) => P.cyl(0.07, 0.06, 0.42, fur, { at: [x, y + 0.72, z + s * 0.36], rot: [s * 0.6, 0, 0] }, 6)),
  ]
  if (ears === 0) parts.push(...[-1, 1].map((s) => P.sphere(0.12, fur, { at: [x, y + 1.15, z + s * 0.24] }, 6)))
  else if (ears === 1) parts.push(...[-1, 1].map((s) => P.cone(0.12, 0.3, fur, { at: [x, y + 1.22, z + s * 0.2], rot: [s * 0.3, 0, 0] }, 5)))
  else parts.push(...[-1, 1].map((s) => P.cyl(0.07, 0.06, 0.48, fur, { at: [x, y + 1.32, z + s * 0.12], rot: [s * 0.15, 0, 0] }, 6)))
  return parts
}

export function buildRaceScenery(bag: Bag): RaceScenery {
  const root = new Group()
  const r = rng(20261020)
  const towers: Rock[] = []

  // ---- The rock towers walling the lagoon in, two rows deep, and a few nearer ones outside the ropes ----
  const ring: Rock[] = []
  const cx = CX
  const cz = CZ
  // Each one out from the middle until it's clear of the course and outside it, so the walls follow the heart round.
  // (The inner row low enough for its jungle caps and the sky to show over it; the row behind taller, a wall.)
  const back: Rock[] = []
  for (const [gap, n, h, row, big] of [[16, 48, 30, ring, 0], [40, 42, 52, back, 1]] as const)
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (big ? 0.06 : 0)
      const rad = (big ? 13 : 10) + r() * 6
      let d = 20
      while (d < 300) {
        const x = cx + Math.sin(a) * d
        const z = cz + Math.cos(a) * d
        if (!insideLoop(x, z) && fromRope(x, z) > gap + rad) break
        d += 2
      }
      d += r() * 8
      row.push({ x: cx + Math.sin(a) * d, z: cz + Math.cos(a) * d, r: rad, h: h * (0.7 + r() * 0.6) })
    }
  const near: Rock[] = []
  for (let i = 0; i < SAMPLES.length; i += 13) {
    const p = SAMPLES[i]
    for (const side of [-1, 1]) {
      const lat = side * (halfAt(p.s) + 15 + r() * 18)
      const x = p.x + p.lx * lat
      const z = p.z + p.lz * lat
      const rad = 4 + r() * 5
      // (Clear of the dolphins' water outside the rope on Dolphin Run, and the elephants' beaches.)
      const run = side < 0 && p.s > DOLPHIN_RUN.from - 10 && p.s < DOLPHIN_RUN.to + 10
      if (fromRope(x, z) < 6 + rad + (run ? 6 : 0)) continue
      if (Math.hypot(x - STAND.x, z - STAND.z) < 24 || Math.hypot(x - PODIUM.x, z - PODIUM.z) < 22 || Math.hypot(x - FALLS.x, z - FALLS.z) < FALLS.r + rad + 6) continue
      if (ELEPHANTS.some((e) => {
        const b = spotAt(e.s, e.lat)
        return Math.hypot(x - b.x, z - b.z) < 12 + rad
      })) continue
      if ([...near, ...ring].some((o) => Math.hypot(o.x - x, o.z - z) < o.r + rad + 3)) continue
      if (r() < 0.45) continue
      near.push({ x, z, r: rad, h: 18 + r() * 26 + rad })
    }
  }
  const falls: Rock = FALLS
  // The Twin Rocks, in the middle of the course where it splits.
  const fork = spotAt(FORK.s)
  const twins: Rock[] = [-1, 1].map((k) => {
    const p = spotAt(FORK.s + k * 7)
    return { x: p.x, z: p.z, r: 4.8, h: k > 0 ? 24 : 30 }
  })
  towers.push(...ring, ...back, ...near, falls, ...twins)
  // (Each tower's parts are kept together, so a tower is in one sector.)
  const towerGeo = (t: Rock, seg: number) => merge(tower(t, { seg }))
  sectored(root, [...ring.map((t) => towerGeo(t, 8)), ...near.map((t) => towerGeo(t, 10)), towerGeo(falls, 12), ...twins.map((t) => towerGeo(t, 12))], bag, 2.5)
  // The row behind is mostly hidden, far into the haze: no outline, fewer sides.
  sectored(root, back.map((t) => towerGeo(t, 7)), bag, 0)
  root.add(new Mesh(bag.add(merge([...near, falls, ...twins].map(foamRing))), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }))))

  // ---- The island in the middle: sand, jungle, palms (blobs on a grid, wherever the course is far enough away) ----
  const island: BufferGeometry[] = []
  for (let x = -96; x <= 96; x += 8)
    for (let z = -100; z <= 100; z += 8) {
      const jx = x + (r() - 0.5) * 4
      const jz = z + (r() - 0.5) * 4
      if (!insideLoop(jx, jz)) continue
      // (`d` as the first course measured it, from the middle of a course HALF wide.)
      const d = fromRope(jx, jz) + HALF
      if (d < HALF + 9) continue
      // (The podium's stage floats clear of the sand and jungle.)
      if (Math.hypot(jx - PODIUM.x, jz - PODIUM.z) < 11) continue
      island.push(P.cyl(7, 7.6, 0.8, SAND, { at: [jx, 0.1, jz] }, 10))
      if (d > HALF + 13) island.push(P.cyl(5.4, 6, 1.1, JUNGLE, { at: [jx, 0.5, jz] }, 9))
      if (d > HALF + 15 && r() < 0.3) island.push(P.sphere(3.2 + r() * 2, JUNGLE_DARK, { at: [jx, 1.2, jz], scale: [1, 0.7, 1] }, 8))
      else if (d > HALF + 12 && r() < 0.45) island.push(...palm(jx + 2, jz - 1, 5.5 + r() * 2.5, r() * 6.3, 0.9))
    }
  sectored(root, island, bag, 2)

  // ---- The ropes: pink and white floats along both sides of the course, a yellow one every few, the rope between ----
  const floats: BufferGeometry[] = []
  const ropes: BufferGeometry[] = []
  const ropeAt = (i: number) => HALVES[i % SAMPLES.length] + 0.6
  for (let i = 0; i < SAMPLES.length; i += 3) {
    const p = SAMPLES[i]
    const rope = ropeAt(i)
    for (const side of [-1, 1]) {
      const x = p.x + p.lx * rope * side
      const z = p.z + p.lz * rope * side
      const k = i / 3
      floats.push(P.sphere(k % 6 === 0 ? 0.44 : 0.34, k % 6 === 0 ? PAL.gold : k % 2 ? '#FFFFFF' : PAL.hotpink, { at: [x, 0.12, z], scale: [1, 0.8, 1] }, 6))
    }
    // The rope itself: a thin line from this float to the next (rotated along the course).
    const q = SAMPLES[(i + 3) % SAMPLES.length]
    const qr = ropeAt(i + 3)
    for (const side of [-1, 1]) {
      const ax = p.x + p.lx * rope * side
      const az = p.z + p.lz * rope * side
      const bx = q.x + q.lx * qr * side
      const bz = q.z + q.lz * qr * side
      const len = Math.hypot(bx - ax, bz - az)
      ropes.push(P.box(0.06, 0.06, len, '#FFF7F0', { at: [(ax + bx) / 2, 0.2, (az + bz) / 2], rot: [0, Math.atan2(bx - ax, bz - az), 0] }))
    }
  }
  sectored(root, floats, bag, 1.5, ropes)

  // ---- The start: a checkered line on the water under an inflatable rainbow arch, a banner, the countdown lights ----
  const start = spotAt(0)
  const arch = new Group()
  arch.position.set(start.x, 0, start.z)
  arch.rotation.y = start.heading
  const span = HALF + 1.8
  const archParts: BufferGeometry[] = RAINBOW.map((c, i) => P.torus(span - i * 0.55, 0.32, c, { at: [0, 0.4, 0] }, Math.PI))
  // Fat white floats at its feet, tied with gold bows.
  for (const s of [-1, 1]) archParts.push(P.cyl(1.5, 1.7, 1.1, '#FFFFFF', { at: [s * (span - 1.4), 0.2, 0] }, 16), P.sphere(0.35, PAL.gold, { at: [s * (span - 1.4), 1.1, 0.9] }, 8))
  // The line on the water: two rows of squares across the course.
  for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) archParts.push(P.box(HALF / 8, 0.04, 0.9, (i + j) % 2 ? PAL.ink : '#FFFFFF', { at: [-HALF + (i + 0.5) * (HALF / 8), 0.03, (j - 0.5) * 0.9] }))
  // The light gantry hanging from the top.
  // (Hung under the rainbow on two wires, clear of its bands.)
  const gantry = span - 3.9
  const lightBox = new Group()
  lightBox.add(solid(merge([P.rbox(3.2, 1.1, 0.6, 0.15, PAL.ink, { at: [0, gantry, -0.1] }), ...[-1, 1].map((s) => P.cyl(0.03, 0.03, 3.2, PAL.ink, { at: [s * 1.2, gantry + 2.1, 0] }, 4))]), bag, 2))
  arch.add(lightBox)
  arch.add(solid(merge(archParts), bag, 2))
  // Checkered flags waving on poles at its feet.
  const flagMat = bag.add(new MeshBasicMaterial({ map: checker(bag, 5, 4), side: DoubleSide }))
  const flagGeo = bag.add(new PlaneGeometry(2, 1.5)).translate(-1, 0, 0)
  const startFlags = [-1, 1].map((s) => {
    const g = new Group()
    g.position.set(s * (span - 0.2), 5.6, -0.6)
    g.add(new Mesh(flagGeo, flagMat))
    arch.add(g)
    return g
  })
  arch.add(solid(merge([-1, 1].map((s) => P.cyl(0.08, 0.08, 6, POLE, { at: [s * (span - 0.2), 3.4, -0.6] }, 5))), bag, 1.5))
  const bulbGeo = bag.add(new SphereGeometry(0.36, 14, 10))
  const lights = [-1, 0, 1].map((k) => {
    const m = new Mesh(bulbGeo, bag.add(new MeshBasicMaterial({ color: '#4A3F4F' })))
    m.position.set(k * 1, gantry, -0.45)
    lightBox.add(m)
    return m
  })
  root.add(arch)

  // ---- The Glow Grotto: rock arches one after another over the left lobe, vines, glowing crystals, fireflies ----
  const glow: BufferGeometry[] = []
  const crystal = [PAL.pink, '#E2D2FF', '#B8F5E4', '#FFF1B0']
  GROTTO.forEach((as, n) => {
    const rockArch = new Group()
    const ap = spotAt(as)
    rockArch.position.set(ap.x, 0, ap.z)
    rockArch.rotation.y = ap.heading
    const pillar = halfAt(as) + 4.5
    const top = 14.4 + (n % 2) * 1.2
    const ra: BufferGeometry[] = []
    for (const s of [-1, 1]) {
      ra.push(P.cyl(1.9, 2.2, 1.4, '#6F6484', { at: [s * pillar, 0.5, 0] }, 12), P.cyl(2.6, 2.2, top - 1.4, ROCK, { at: [s * pillar, top / 2, 0] }, 12), P.cyl(1.2, 1.4, 9, ROCK_DARK, { at: [s * (pillar + 1.6), 6, n % 2 ? -1.2 : 1.2] }, 8))
      // Crystals at its feet, glowing (no shading: they shine).
      for (let k = 0; k < 4; k++) {
        const h = 1.6 + ((k * 7 + n * 3) % 5) * 0.45
        glow.push(bake(new SphereGeometry(1, 5, 3), crystal[(k + n) % crystal.length], { at: [ap.x + Math.cos(ap.heading) * s * (pillar - 2.2) + Math.sin(ap.heading) * (k - 1.5) * 1.1, h / 2, ap.z - Math.sin(ap.heading) * s * (pillar - 2.2) + Math.cos(ap.heading) * (k - 1.5) * 1.1], scale: [0.45, h / 2, 0.45], rot: [0, k, s * (0.25 + k * 0.08)] }))
      }
    }
    for (let i = -6; i <= 6; i++) {
      const x = (i / 6) * (pillar + 1)
      ra.push(P.sphere(3 - Math.abs(i) * 0.08, i % 2 ? ROCK : '#B5AAC6', { at: [x, top + 1 + Math.cos(i * 0.9) * 0.6, (i % 3) * 0.4] }, 10))
    }
    ra.push(P.sphere(pillar + 2, JUNGLE, { at: [0, top + 3.8, 0], scale: [1, 0.22, 0.4] }, 14), P.sphere(3, JUNGLE_DARK, { at: [pillar * (n % 2 ? -0.4 : 0.4), top + 4.6, 0.5], scale: [1, 0.6, 1] }, 10))
    // Vines hanging under it, and crystals pointing down from its top (high above the boats).
    for (let i = -5; i <= 5; i++) {
      const x = (i / 5) * pillar * 0.85
      if (i % 2) ra.push(P.cyl(0.07, 0.05, 2.4 + (i % 3) * 0.8, JUNGLE_DARK, { at: [x, top - 1.8 - (i % 3) * 0.4, 1.4] }, 4))
      else glow.push(bake(new SphereGeometry(1, 5, 3), crystal[(i / 2 + n + 8) % crystal.length], { at: [ap.x + Math.cos(ap.heading) * x, top - 2.4, ap.z - Math.sin(ap.heading) * x], scale: [0.4, 1.4, 0.4] }))
    }
    rockArch.add(solid(merge(ra), bag, 2.5))
    root.add(rockArch)
    for (const s of [-1, 1]) towers.push({ x: ap.x + Math.cos(ap.heading) * s * pillar, z: ap.z - Math.sin(ap.heading) * s * pillar, r: 2.8, h: top })
  })
  root.add(new Mesh(bag.add(merge(glow)), bag.add(new MeshBasicMaterial({ vertexColors: true }))))
  // Fireflies drifting through the grotto: little glowing dots.
  const FLIES = 36
  const flyMesh = bag.add(new InstancedMesh(bag.add(new SphereGeometry(0.13, 6, 4)), bag.add(new MeshBasicMaterial({ color: '#FFF6B8' })), FLIES))
  flyMesh.frustumCulled = false
  root.add(flyMesh)
  const flies = Array.from({ length: FLIES }, (_, i) => ({ s: GROTTO[0] - 4 + r() * (GROTTO[GROTTO.length - 1] - GROTTO[0] + 8), lat: (r() - 0.5) * 2 * (HALF + 3), y: 2 + r() * 9, ph: i * 1.7 }))
  const m4 = new Matrix4()

  // ---- The Twin Rocks' islet: sand round their feet, palms between them, bunting strung from top to top ----
  const islet = new Group()
  islet.position.set(fork.x, 0, fork.z)
  islet.rotation.y = fork.heading
  const tw: BufferGeometry[] = [P.cyl(1, 1, 0.9, SAND, { at: [0, 0.1, 0], scale: [FORK.rock + 0.2, 1, FORK.half + 0.4] }, 24)]
  tw.push(...palm(0.8, -0.6, 6, 0.7, 0.5), ...palm(-0.9, 1, 5.2, 3.6, 0.5))
  for (let k = 0; k < 9; k++) {
    const u = (k + 0.5) / 9
    const z = -6 + u * 12
    const y = 21 - Math.sin(u * Math.PI) * 2 - u * 2
    tw.push(P.prism([[-0.45, 0], [0.45, 0], [0, -0.9]], 0.04, RAINBOW[k % RAINBOW.length], { at: [0, y, z] }))
  }
  tw.push(P.box(0.06, 0.06, 13, '#FFF7F0', { at: [0, 20, 0], rot: [0.13, 0, 0] }))
  islet.add(solid(merge(tw), bag, 2))
  root.add(islet)

  // ---- The Heart Gate at the dip: a pink and white inflatable arch, a big puffy heart floating over it ----
  const hp = spotAt(HEART_S)
  const gate = new Group()
  gate.position.set(hp.x, 0, hp.z)
  gate.rotation.y = hp.heading
  const gspan = halfAt(HEART_S) + 1.8
  const gateParts: BufferGeometry[] = [PAL.hotpink, '#FFFFFF', PAL.pink, '#FFFFFF'].map((c, i) => P.torus(gspan - i * 0.6, 0.36, c, { at: [0, 0.4, 0] }, Math.PI))
  for (const s of [-1, 1]) gateParts.push(P.cyl(1.5, 1.7, 1.1, '#FFFFFF', { at: [s * (gspan - 1.2), 0.2, 0] }, 16), P.sphere(0.4, PAL.gold, { at: [s * (gspan - 1.2), 1.1, 0.9] }, 8))
  // Its strings up to the heart.
  for (const s of [-1, 1]) gateParts.push(P.cyl(0.03, 0.03, 3.2, PAL.ink, { at: [s * 0.8, gspan + 2.2, 0], rot: [0, 0, s * 0.2] }, 4))
  gate.add(solid(merge(gateParts), bag, 2))
  const heart = new Group()
  heart.position.set(0, gspan + 7.6, 0)
  const hs = new Shape()
  hs.moveTo(5, 5)
  hs.bezierCurveTo(5, 5, 4, 0, 0, 0)
  hs.bezierCurveTo(-6, 0, -6, 7, -6, 7)
  hs.bezierCurveTo(-6, 11, -3, 15.4, 5, 19)
  hs.bezierCurveTo(12, 15.4, 16, 11, 16, 7)
  hs.bezierCurveTo(16, 7, 16, 0, 10, 0)
  hs.bezierCurveTo(7, 0, 5, 5, 5, 5)
  // (The shape is drawn point up: turned over, and puffed out with a round bevel.)
  const hg = new ExtrudeGeometry(hs, { depth: 1.5, bevelEnabled: true, bevelSegments: 4, bevelSize: 1.6, bevelThickness: 1.8, curveSegments: 18 })
  hg.translate(-5, -10, -0.75)
  hg.rotateZ(Math.PI)
  heart.add(solid(merge([bake(hg, PAL.hotpink, { scale: [0.36, 0.36, 0.36] }), P.sphere(0.9, '#FFFFFF', { at: [-1.6, 1.4, -1.25], scale: [1, 0.6, 0.3] }, 10)]), bag, 2.5))
  gate.add(heart)
  root.add(gate)

  // ---- The waterfall, pouring off the big rock in turn 1 toward the course ----
  const nearest = SAMPLES[locate(FALLS.x, FALLS.z).i]
  const fdx = nearest.x - FALLS.x
  const fdz = nearest.z - FALLS.z
  const fl = Math.hypot(fdx, fdz) || 1
  const fallTex = (() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 128
    const g = c.getContext('2d')!
    g.fillStyle = 'rgba(214,240,255,0.92)'
    g.fillRect(0, 0, 64, 128)
    g.fillStyle = 'rgba(255,255,255,1)'
    for (let i = 0; i < 18; i++) g.fillRect((i * 23) % 60, (i * 37) % 128, 3 + (i % 3), 18 + (i % 4) * 8)
    const t = bag.add(new CanvasTexture(c))
    t.wrapS = t.wrapT = RepeatWrapping
    t.repeat.set(2, 3)
    return t
  })()
  const fallH = FALLS.h * 0.9
  const fall = new Mesh(bag.add(new PlaneGeometry(4.2, fallH)), bag.add(new MeshBasicMaterial({ map: fallTex, transparent: true, side: DoubleSide })))
  fall.position.set(FALLS.x + (fdx / fl) * (FALLS.r * 0.98), fallH / 2, FALLS.z + (fdz / fl) * (FALLS.r * 0.98))
  fall.rotation.y = Math.atan2(fdx, fdz)
  root.add(fall)
  const pool = new Mesh(bag.add(new RingGeometry(0.6, 4, 24)), bag.add(new MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.85, depthWrite: false })))
  pool.rotation.x = -Math.PI / 2
  pool.position.set(fall.position.x + (fdx / fl) * 1.2, 0.05, fall.position.z + (fdz / fl) * 1.2)
  root.add(pool)

  // ---- The grandstand, floating beside the start straight: three rows of fans, an awning, flags ----
  const stand = new Group()
  stand.position.set(STAND.x, 0, STAND.z)
  stand.rotation.y = STAND.heading
  const W = 26
  const st: BufferGeometry[] = [P.box(10, 0.5, W, '#C9875C', { at: [-2, 0.35, 0] })]
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) st.push(P.cyl(0.5, 0.5, 1, BARREL, { at: [-2 + s * 4.4, 0.05, -W / 2 + 1.5 + i * ((W - 3) / 7)], rot: [Math.PI / 2, 0, 0] }, 10))
  for (let row = 0; row < 3; row++) st.push(P.box(2, 0.7 + row * 0.9, W - 1, row % 2 ? '#FFF7F0' : '#FFE3EE', { at: [-row * 2.2, 0.6 + (0.7 + row * 0.9) / 2, 0] }))
  // The awning: pink and white stripes on poles.
  for (const z of [-W / 2 + 0.6, 0, W / 2 - 0.6]) st.push(P.cyl(0.14, 0.14, 7, POLE, { at: [1, 3.5, z] }, 6), P.cyl(0.14, 0.14, 8.4, POLE, { at: [-6, 4.2, z] }, 6))
  for (let i = 0; i < 9; i++) st.push(P.box(8.6, 0.3, W / 9, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [-2.5, 7.2, -W / 2 + (i + 0.5) * (W / 9)], rot: [0, 0, -0.32] }))
  // Flags on top.
  for (const z of [-W / 2 + 0.6, 0, W / 2 - 0.6]) st.push(P.cyl(0.06, 0.06, 2, POLE, { at: [-6, 9.4, z] }, 4), P.prism([[0, 0], [1.4, -0.4], [0, -0.8]], 0.05, z === 0 ? PAL.gold : PAL.sky, { at: [-6, 10.3, z], rot: [0, Math.PI / 2, 0] }))
  stand.add(solid(merge(st), bag, 2))
  const rows = [0, 1, 2].map((row) => {
    const g = new Group()
    const parts: BufferGeometry[] = []
    for (let i = 0; i < 9; i++) parts.push(...fan(-row * 2.2, 0.6 + 0.7 + row * 0.9, -W / 2 + 2 + i * ((W - 4) / 8) + (row % 2) * 0.9, i + row * 9))
    g.add(solid(merge(parts), bag, 1.5))
    stand.add(g)
    return g
  })
  root.add(stand)

  // ---- Bunting along the ropes by the start, flags at the podium's corners ----
  const bunt: BufferGeometry[] = []
  for (let s = -40; s < 60; s += 10) {
    for (const side of [-1, 1]) {
      // (Not between the podium and its camera.)
      if (side > 0 && s > -20 && s < 40) continue
      const a = spotAt(s, side * (HALF + 1.2))
      const b = spotAt(s + 10, side * (HALF + 1.2))
      bunt.push(P.cyl(0.08, 0.08, 3, POLE, { at: [a.x, 1.5, a.z] }, 5))
      for (let k = 0; k < 6; k++) {
        const t = (k + 0.5) / 6
        const x = a.x + (b.x - a.x) * t
        const z = a.z + (b.z - a.z) * t
        const sag = Math.sin(t * Math.PI) * 0.5
        bunt.push(P.prism([[-0.3, 0], [0.3, 0], [0, -0.6]], 0.03, RAINBOW[(k + (s / 10) * 2) % RAINBOW.length], { at: [x, 2.9 - sag, z], rot: [0, a.heading + Math.PI / 2, 0] }))
      }
    }
  }
  root.add(solid(merge(bunt), bag, 1))

  // ---- Far towers in the haze beyond the ring (flat silhouettes, three layers) ----
  ;[
    [230, '#B4AACB', 75],
    [295, '#C6BEDB', 100],
    [375, '#D6D1E8', 125],
  ].forEach(([dist, color, tall], li) => {
    const shapes: BufferGeometry[] = []
    const n = 20 + li * 6
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + li * 0.41
      const x = cx + Math.sin(a) * (dist as number)
      const z = cz + Math.cos(a) * (dist as number)
      const w = 30 + ((i * 37 + li * 11) % 34)
      const h = (tall as number) * (0.55 + ((i * 53 + li * 7) % 45) / 100)
      const s = new Shape()
      s.moveTo(-w / 2, -2)
      s.lineTo(-w / 2 + w * 0.06, h * 0.75)
      for (let b = 0; b <= 6; b++) s.lineTo(-w / 2 + w * 0.06 + (b / 6) * w * 0.88, h * (0.82 + 0.18 * Math.sin(b * 1.9 + i)))
      s.lineTo(w / 2, -2)
      s.closePath()
      const g = new ShapeGeometry(s, 4)
      g.rotateY(Math.atan2(cx - x, cz - z))
      g.translate(x, 0, z)
      shapes.push(g)
    }
    root.add(new Mesh(bag.add(merge(shapes)), bag.add(new MeshBasicMaterial({ color: color as string, side: DoubleSide, fog: true }))))
  })

  // ---- Hot-air balloons drifting over the lagoon ----
  const balloons = [
    { c: [PAL.pink, '#FFFFFF'], rad: 52, y: 50, speed: 0.03, phase: 0 },
    { c: [PAL.mint, PAL.butter], rad: 80, y: 62, speed: -0.022, phase: 2.4 },
  ].map((b) => {
    const g = new Group()
    const parts: BufferGeometry[] = [P.sphere(4.2, b.c[0], { scale: [1, 1.15, 1] }, 18)]
    for (let k = 0; k < 6; k++) parts.push(P.box(0.9, 8.2, 0.9, b.c[1], { at: [Math.sin((k / 6) * Math.PI * 2) * 3.9, 0, Math.cos((k / 6) * Math.PI * 2) * 3.9], rot: [0, (k / 6) * Math.PI * 2, 0], scale: [1, 1, 0.5] }))
    parts.push(P.cone(2.2, 2.4, b.c[0], { at: [0, -4.8, 0], rot: [Math.PI, 0, 0] }, 14), P.rbox(1.4, 1, 1.4, 0.2, '#C9875C', { at: [0, -7, 0] }))
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) parts.push(P.cyl(0.03, 0.03, 1.8, PAL.ink, { at: [sx * 0.6, -5.9, sz * 0.6] }, 4))
    g.add(solid(merge(parts), bag, 2))
    root.add(g)
    return { g, ...b }
  })

  let jump = 0
  let flow = 0
  return {
    root,
    towers,
    setLights(n) {
      lightBox.visible = n >= 0
      lights.forEach((m, i) => {
        const mat = m.material as MeshBasicMaterial
        mat.color.set(n >= 4 ? '#5BE37A' : i < n ? '#FF4F5E' : '#4A3F4F')
      })
    },
    cheer(k = 1) {
      jump = Math.max(jump, k)
    },
    update(dt, t, cam) {
      // The chase camera passing under the rainbow: hide it for that moment (from inside, it would fill the screen).
      const local = arch.worldToLocal(tmpV.copy(cam))
      arch.visible = !(Math.abs(local.z) < 3.5 && Math.abs(local.x) < span + 4 && local.y < span + 1)
      const inGate = gate.worldToLocal(tmpV.copy(cam))
      gate.visible = !(Math.abs(inGate.z) < 3.5 && Math.abs(inGate.x) < gspan + 4 && inGate.y < gspan + 1)
      heart.rotation.y = Math.sin(t * 0.7) * 0.35
      heart.position.y = gspan + 7.6 + Math.sin(t * 1.3) * 0.4
      heart.scale.setScalar(1 + Math.max(0, Math.sin(t * 5.5)) ** 8 * 0.07)
      flies.forEach((f, i) => {
        const p = spotAt(f.s + Math.sin(t * 0.3 + f.ph) * 3, f.lat + Math.cos(t * 0.4 + f.ph) * 2)
        const blink = 0.6 + 0.4 * Math.sin(t * 3 + f.ph * 2)
        m4.makeScale(blink, blink, blink).setPosition(p.x, f.y + Math.sin(t * 0.8 + f.ph) * 0.8, p.z)
        flyMesh.setMatrixAt(i, m4)
      })
      flyMesh.instanceMatrix.needsUpdate = true
      startFlags.forEach((g, i) => (g.rotation.y = (i ? Math.PI : 0) + Math.sin(t * 4 + i * 1.7) * 0.4))
      flow += dt
      fallTex.offset.y = flow * 1.4
      pool.scale.setScalar(1 + Math.sin(t * 5) * 0.06)
      jump = Math.max(0, jump - dt * 0.6)
      rows.forEach((g, i) => {
        const hop = Math.abs(Math.sin(t * (6 + i) + i * 1.3))
        g.position.y = hop * (0.05 + 0.35 * jump)
      })
      for (const b of balloons) {
        const a = t * b.speed + b.phase
        b.g.position.set(cx + Math.sin(a) * b.rad, b.y + Math.sin(t * 0.4 + b.phase) * 1.5, cz + Math.cos(a) * b.rad)
      }
    },
  }
}
