// The exam room, modeled in code in the house's toon look (engine/geo.ts parts): mint walls, the exam table, a window
// into the waiting room (healed patients sit on its bench), and the things to poke: the x-ray box (the patient's bones
// wag), the parrot on its perch, the cat in its carrier, the treat jar and the scale. Greybox: shapes only.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { merge, P, solid } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import type { PatientId } from '../../sections'
import { BENCH, CABINET, CARRIER, JAR, PARROT, ROOM, SCALE, TABLE, WINDOW, XRAY } from './layout'

const MINT_WALL = '#C9F1E3'
const WHITE = '#FFFFFF'

export interface Room {
  root: Group
  xray: { canvas: HTMLCanvasElement; tex: CanvasTexture; mesh: Mesh }
  parrot: { root: Group; wingL: Group; wingR: Group }
  carrier: { root: Group; paw: Group }
  jar: { root: Group; lid: Group }
  scale: { root: Group; needle: Group }
}

export function buildRoom(bag: Bag): Room {
  const root = new Group()
  const add = <T extends Group | Mesh>(o: T) => (root.add(o), o)
  const z = ROOM.back
  // ---- Floor, walls and the waiting room behind the window ----
  add(solid(merge([
    P.box(ROOM.x1 - ROOM.x0, 0.1, ROOM.front - z, '#F6F0FF', { at: [0, -0.05, (ROOM.front + z) / 2] }),
    ...Array.from({ length: 7 }, (_, i) => P.box(0.03, 0.004, ROOM.front - z, '#E4DAF7', { at: [ROOM.x0 + 0.85 + i * 0.85, 0.002, (ROOM.front + z) / 2] })),
    P.cyl(0.9, 0.9, 0.012, '#FFD6E6', { at: [0, 0.006, 0.55], scale: [1.5, 1, 0.7] }, 32),
  ]), bag, 0))
  const wall = (x0: number, x1: number, y0: number, y1: number) => P.box(x1 - x0, y1 - y0, 0.2, MINT_WALL, { at: [(x0 + x1) / 2, (y0 + y1) / 2, z - 0.1] })
  add(solid(merge([
    wall(ROOM.x0, WINDOW.x0, 0, ROOM.height),
    wall(WINDOW.x1, ROOM.x1, 0, ROOM.height),
    wall(WINDOW.x0, WINDOW.x1, 0, WINDOW.y0),
    wall(WINDOW.x0, WINDOW.x1, WINDOW.y1, ROOM.height),
    // A darker stripe along the bottom and a row of paw prints along it.
    P.box(ROOM.x1 - ROOM.x0, 0.12, 0.02, PAL.mint, { at: [0, 0.86, z + 0.01] }),
    ...Array.from({ length: 9 }, (_, i) => P.sphere(0.045, '#A8E6CF', { at: [ROOM.x0 + 0.5 + i * 0.75, 0.55 + (i % 2) * 0.08, z + 0.01], scale: [1, 1, 0.2] })),
    // The window's white frame.
    P.box(WINDOW.x1 - WINDOW.x0 + 0.16, 0.08, 0.26, WHITE, { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y0 - 0.02, z - 0.08] }),
    P.box(WINDOW.x1 - WINDOW.x0 + 0.16, 0.08, 0.24, WHITE, { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1 + 0.02, z - 0.1] }),
    ...[WINDOW.x0, WINDOW.x1].map((x) => P.box(0.08, WINDOW.y1 - WINDOW.y0, 0.24, WHITE, { at: [x, (WINDOW.y0 + WINDOW.y1) / 2, z - 0.1] })),
    // A paw-print sign over the door to the waiting room (no words).
    P.rbox(0.36, 0.2, 0.04, 0.05, PAL.hotpink, { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1 + 0.24, z + 0.02] }),
    P.sphere(0.05, WHITE, { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1 + 0.21, z + 0.05], scale: [1.1, 0.9, 0.3] }),
    ...[-0.06, -0.02, 0.02, 0.06].map((dx, i) => P.sphere(0.02, WHITE, { at: [(WINDOW.x0 + WINDOW.x1) / 2 + dx, WINDOW.y1 + 0.28 + (i % 3 ? 0.02 : 0), z + 0.05], scale: [1, 1, 0.3] })),
  ]), bag, 2))
  // The waiting room: a peach wall with a heart, and the bench (seat at the window sill) where the healed ones sit.
  add(solid(merge([
    P.box(WINDOW.x1 - WINDOW.x0 + 0.6, 1.6, 0.1, '#FFE3D6', { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y0 + 0.5, BENCH.z - 0.45] }),
    P.box(WINDOW.x1 - WINDOW.x0 + 0.6, 0.1, 0.55, '#F2D2C4', { at: [(WINDOW.x0 + WINDOW.x1) / 2, BENCH.y - 0.5, BENCH.z - 0.15] }),
    P.rbox(WINDOW.x1 - WINDOW.x0 - 0.1, 0.08, 0.36, 0.03, PAL.lavenderDark, { at: [(WINDOW.x0 + WINDOW.x1) / 2, BENCH.y - 0.04, BENCH.z] }),
    P.rbox(WINDOW.x1 - WINDOW.x0 - 0.1, 0.36, 0.06, 0.03, PAL.lavenderDark, { at: [(WINDOW.x0 + WINDOW.x1) / 2, BENCH.y + 0.18, BENCH.z - 0.22] }),
    P.sphere(0.12, PAL.pink, { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1 - 0.1, BENCH.z - 0.39], scale: [1, 1, 0.3] }),
  ]), bag, 1.5))

  // ---- The exam table ----
  add(solid(merge([
    P.rbox(0.7, 0.06, 0.5, 0.03, '#D8D2E6', { at: [TABLE.x, 0.03, TABLE.z] }),
    P.cyl(0.11, 0.13, 0.5, '#D8D2E6', { at: [TABLE.x, 0.3, TABLE.z] }),
    P.rbox(TABLE.w, 0.08, TABLE.d, 0.03, WHITE, { at: [TABLE.x, TABLE.top - 0.08, TABLE.z] }),
    P.rbox(TABLE.w - 0.1, 0.05, TABLE.d - 0.1, 0.025, PAL.mint, { at: [TABLE.x, TABLE.top - 0.025, TABLE.z] }),
  ]), bag, 2))

  // ---- The x-ray box on the wall ----
  add(solid(merge([P.rbox(XRAY.w + 0.1, XRAY.h + 0.1, 0.08, 0.04, '#E8E4F6', { at: [XRAY.x, XRAY.y, z + 0.04] })]), bag, 2))
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 184
  const tex = bag.add(new CanvasTexture(canvas))
  tex.colorSpace = SRGBColorSpace
  const xmesh = new Mesh(bag.add(new PlaneGeometry(XRAY.w, XRAY.h)), bag.add(new MeshBasicMaterial({ map: tex })))
  xmesh.position.set(XRAY.x, XRAY.y, z + 0.085)
  xmesh.userData.pick = 'xray'
  root.add(xmesh)
  drawXray(canvas, 'puppy', 0, false)
  tex.needsUpdate = true

  // ---- The parrot on its perch ----
  add(solid(merge([
    P.cyl(0.012, 0.012, ROOM.height - PARROT.perch - 0.5, '#C99A6E', { at: [PARROT.x, (ROOM.height + PARROT.perch + 0.5) / 2, PARROT.z] }),
    P.torus(0.25, 0.018, '#C99A6E', { at: [PARROT.x, PARROT.perch + 0.25, PARROT.z] }),
  ]), bag, 2))
  const parrot = new Group()
  parrot.position.set(PARROT.x, PARROT.perch + 0.02, PARROT.z)
  parrot.userData.pick = 'parrot'
  parrot.add(solid(merge([
    P.sphere(0.1, '#FF6B6B', { at: [0, 0.13, 0], scale: [0.9, 1.25, 0.9] }),
    P.sphere(0.065, '#FFD45C', { at: [0, 0.1, 0.05], scale: [1, 1.2, 0.6] }),
    P.sphere(0.075, '#FF6B6B', { at: [0, 0.29, 0.02] }),
    P.cone(0.035, 0.07, PAL.gold, { at: [0, 0.27, 0.1], rot: [Math.PI / 2 + 0.5, 0, 0] }),
    P.capsule(0.03, 0.12, PAL.sky, { at: [0, 0.0, -0.08], rot: [-0.5, 0, 0] }),
    ...[-1, 1].map((s) => P.capsule(0.012, 0.03, PAL.gold, { at: [s * 0.03, 0.0, 0.02] })),
  ]), bag, 2))
  parrot.add(solid(merge([...[-1, 1].map((s) => P.sphere(0.018, PAL.ink, { at: [s * 0.045, 0.31, 0.06] }))]), bag, 0))
  const wing = (s: number) => {
    const g = new Group()
    g.position.set(s * 0.08, 0.2, 0)
    g.add(solid(merge([P.sphere(0.06, '#5FC98F', { at: [s * 0.01, -0.06, 0], scale: [0.45, 1.3, 0.9] })]), bag, 2))
    parrot.add(g)
    return g
  }
  const parrotOut = { root: parrot, wingL: wing(-1), wingR: wing(1) }
  root.add(parrot)

  // ---- The cabinet, the treat jar and the cat carrier on it ----
  add(solid(merge([
    P.rbox(CABINET.x1 - CABINET.x0, CABINET.top, CABINET.d, 0.03, WHITE, { at: [(CABINET.x0 + CABINET.x1) / 2, CABINET.top / 2, CABINET.z] }),
    ...[0, 1].map((i) => P.rbox((CABINET.x1 - CABINET.x0) / 2 - 0.08, CABINET.top - 0.14, 0.02, 0.02, PAL.mint, { at: [CABINET.x0 + 0.04 + (i + 0.5) * ((CABINET.x1 - CABINET.x0 - 0.08) / 2), CABINET.top / 2, CABINET.z + CABINET.d / 2 + 0.005] })),
    ...[0, 1].map((i) => P.sphere(0.025, PAL.gold, { at: [(CABINET.x0 + CABINET.x1) / 2 + (i ? 0.06 : -0.06), CABINET.top / 2, CABINET.z + CABINET.d / 2 + 0.03] })),
  ]), bag, 2))
  const jar = new Group()
  jar.position.set(...JAR)
  jar.userData.pick = 'jar'
  jar.add(new Mesh(bag.add(P.cyl(0.12, 0.12, 0.24, '#fff', { at: [0, 0.12, 0] }, 20)), bag.add(new MeshBasicMaterial({ color: '#DFF4FF', transparent: true, opacity: 0.45, depthWrite: false }))))
  jar.add(solid(merge([...[[-0.05, 0.05], [0.04, 0.06], [0, 0.12], [-0.04, 0.17], [0.05, 0.16]].map(([x, y], i) => P.capsule(0.022, 0.06, '#E8B98A', { at: [x, y, 0], rot: [0, 0, 1.2 + i] }))]), bag, 1.5))
  const lid = solid(merge([P.cyl(0.13, 0.13, 0.04, PAL.hotpink, {}, 20), P.sphere(0.035, PAL.hotpink, { at: [0, 0.035, 0] })]), bag, 2)
  lid.position.y = 0.26
  jar.add(lid)
  root.add(jar)
  const carrier = new Group()
  carrier.position.set(...CARRIER)
  carrier.userData.pick = 'cat'
  carrier.add(solid(merge([
    P.rbox(0.46, 0.32, 0.36, 0.06, '#FFC2A8', { at: [0, 0.16, 0] }),
    P.capsule(0.02, 0.18, '#FF9F7A', { at: [0, 0.36, 0], rot: [0, 0, Math.PI / 2] }),
    P.box(0.34, 0.24, 0.01, '#5A4A66', { at: [0, 0.16, 0.18] }),
  ]), bag, 2))
  // The cat peeking out between the bars (eyes and ears), and its paw that pokes out.
  carrier.add(solid(merge([
    P.sphere(0.1, '#B8B0C8', { at: [0, 0.15, 0.13], scale: [1.2, 1, 0.5] }),
    ...[-1, 1].map((s) => P.cone(0.04, 0.07, '#B8B0C8', { at: [s * 0.07, 0.25, 0.13], rot: [0, 0, -s * 0.3] })),
    ...[-1, 1].map((s) => P.sphere(0.022, '#7FCB8F', { at: [s * 0.045, 0.17, 0.18], scale: [0.8, 1, 0.4] })),
    P.sphere(0.012, PAL.hotpink, { at: [0, 0.13, 0.19] }),
  ]), bag, 0))
  carrier.add(solid(merge([...[-0.12, -0.06, 0, 0.06, 0.12].map((x) => P.box(0.014, 0.24, 0.014, '#E8E4F6', { at: [x, 0.16, 0.2] }))]), bag, 1))
  const paw = solid(merge([P.capsule(0.03, 0.06, '#B8B0C8', { rot: [Math.PI / 2, 0, 0] }), P.sphere(0.035, '#FFFFFF', { at: [0, 0, 0.05] })]), bag, 2)
  paw.position.set(0.03, 0.09, 0.15)
  paw.scale.setScalar(0.01)
  carrier.add(paw)
  root.add(carrier)

  // ---- The scale on the floor: a platform, a post and a round dial with a needle ----
  const scale = new Group()
  scale.position.set(...SCALE)
  scale.userData.pick = 'scale'
  scale.add(solid(merge([
    P.rbox(0.62, 0.08, 0.46, 0.03, PAL.lavender, { at: [0, 0.04, 0] }),
    P.box(0.6, 0.01, 0.44, '#EDE6FF', { at: [0, 0.085, 0] }),
    P.cyl(0.03, 0.03, 0.4, '#D8D2E6', { at: [0, 0.28, -0.2] }),
    P.cyl(0.15, 0.15, 0.05, WHITE, { at: [0, 0.56, -0.2], rot: [Math.PI / 2, 0, 0] }, 24),
    P.torus(0.15, 0.02, PAL.lavenderDark, { at: [0, 0.56, -0.17] }),
    ...[-1, -0.5, 0, 0.5, 1].map((a) => P.box(0.012, 0.035, 0.01, PAL.ink, { at: [Math.sin(a) * 0.11, 0.56 + Math.cos(a) * 0.11, -0.17], rot: [0, 0, -a] })),
  ]), bag, 2))
  const needle = new Group()
  needle.position.set(0, 0.56, -0.165)
  needle.add(solid(merge([P.box(0.014, 0.12, 0.01, '#FF4F5E', { at: [0, 0.05, 0] }), P.sphere(0.018, PAL.ink)]), bag, 0))
  needle.rotation.z = 0.9
  scale.add(needle)
  root.add(scale)

  return { root, xray: { canvas, tex, mesh: xmesh }, parrot: parrotOut, carrier: { root: carrier, paw }, jar: { root: jar, lid }, scale: { root: scale, needle } }
}

/** The x-ray: the patient's bones in white on blue (glowing when lit), the tail bones wagging. */
export function drawXray(canvas: HTMLCanvasElement, who: PatientId, t: number, lit: boolean) {
  const g = canvas.getContext('2d')!
  const w = canvas.width
  const h = canvas.height
  g.fillStyle = lit ? '#3A5BB8' : '#2E3566'
  g.fillRect(0, 0, w, h)
  g.strokeStyle = g.fillStyle = lit ? '#FFFFFF' : '#8E97C8'
  g.lineCap = 'round'
  g.lineWidth = 7
  const bone = (x0: number, y0: number, x1: number, y1: number) => {
    g.beginPath()
    g.moveTo(x0, y0)
    g.lineTo(x1, y1)
    g.stroke()
    for (const [x, y] of [[x0, y0], [x1, y1]]) {
      g.beginPath()
      g.arc(x, y, 6, 0, 7)
      g.fill()
    }
  }
  // A side view: skull on the left, the spine across, ribs, four legs, the tail on the right.
  const sy = 80
  g.beginPath()
  g.ellipse(52, sy - 12, who === 'pony' ? 30 : 24, 22, who === 'pony' ? 0.4 : 0, 0, 7)
  g.stroke()
  if (who === 'elephant') {
    g.beginPath()
    g.moveTo(40, sy + 4)
    g.quadraticCurveTo(28, sy + 60, 46, sy + 76)
    g.stroke()
  }
  for (let i = 0; i < 7; i++) {
    g.beginPath()
    g.arc(86 + i * 16, sy, 5, 0, 7)
    g.fill()
  }
  for (let i = 0; i < 4; i++) {
    g.beginPath()
    g.arc(110 + i * 16, sy + 4, 22, 0.2, Math.PI - 0.2)
    g.stroke()
  }
  for (const x of [100, 180]) {
    bone(x, sy + 12, x - 4, sy + 58)
    bone(x - 4, sy + 58, x, sy + 92)
    bone(x + 14, sy + 12, x + 10, sy + 58)
    bone(x + 10, sy + 58, x + 14, sy + 92)
  }
  // The tail bones wag.
  let x = 196
  let y = sy
  for (let i = 0; i < 5; i++) {
    const a = -0.5 + Math.sin(t * 9 - i * 0.6) * (lit ? 0.5 : 0.1) - i * 0.12
    const nx = x + Math.cos(a) * 13
    const ny = y + Math.sin(a) * 13
    g.beginPath()
    g.arc(nx, ny, 5 - i * 0.6, 0, 7)
    g.fill()
    x = nx
    y = ny
  }
}
