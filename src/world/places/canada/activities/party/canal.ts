// The frozen Rideau Canal in Ottawa in winter, built from toon parts: the ice (painted with a little pond-hockey rink:
// the red line, the blue lines, the faceoff dot and skate scratches), the snowbanks round the rink, the stone canal
// walls with snow on top, old lamps, snowy spruces and bare trees on the banks, the BeaverTails pastry stand, skaters
// gliding on the far canal, and up on the hill at its end a stone Parliament with a green copper roof and its clock
// tower (no flags, no words). Everything here is still, except what rink.ts moves (the lamps glow, the skaters skate).
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace, type BufferGeometry } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, solidMix } from '../../../../engine3d/geo'
import { PAL, toonGradient } from '../../../../engine3d/toon'

/** The rink, in meters: half its width, the geese's goal line (far, -z) and hers (near, +z). */
export const RINK = { x: 5, zG: -9, zH: 7.2, netHalf: 1.35 }
export const SKY = '#D6E8F8'
const STONE = '#E6DCC8'
const STONE_DARK = '#C9BCA4'
const COPPER = '#6FC2A6'
const SNOW = '#FFFFFF'
const SNOW_SHADE = '#EEF3FB'

/** A seeded random, so the banks look the same every time. */
function rng(seed: number) {
  let s = seed
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

function iceTexture() {
  const W = 512
  const H = 1024
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.fillStyle = '#E4F2FC'
  g.fillRect(0, 0, W, H)
  // Pale patches and skate scratches.
  const r = rng(7)
  for (let i = 0; i < 40; i++) {
    g.fillStyle = `rgba(255,255,255,${0.25 + r() * 0.35})`
    g.beginPath()
    g.ellipse(r() * W, r() * H, 20 + r() * 60, 8 + r() * 24, r() * 3, 0, Math.PI * 2)
    g.fill()
  }
  g.strokeStyle = 'rgba(160,190,220,0.35)'
  g.lineWidth = 2
  for (let i = 0; i < 70; i++) {
    const x = r() * W
    const y = r() * H
    g.beginPath()
    g.moveTo(x, y)
    g.quadraticCurveTo(x + (r() - 0.5) * 80, y + (r() - 0.5) * 60, x + (r() - 0.5) * 140, y + (r() - 0.5) * 120)
    g.stroke()
  }
  return c
}

/** The rink's lines, painted on their own see-through plane over the ice. */
function linesTexture() {
  const W = 256
  const H = 512
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  const z = (m: number) => ((m - RINK.zG + 1.2) / (RINK.zH + 1.2 - (RINK.zG - 1.2))) * H
  const mid = (RINK.zG + RINK.zH) / 2
  g.fillStyle = 'rgba(232,80,91,0.85)'
  g.fillRect(0, z(mid) - 5, W, 10)
  g.fillStyle = 'rgba(80,140,230,0.75)'
  for (const m of [mid - 3.2, mid + 3.2]) g.fillRect(0, z(m) - 5, W, 10)
  g.strokeStyle = 'rgba(232,80,91,0.85)'
  g.lineWidth = 4
  g.beginPath()
  g.arc(W / 2, z(mid), 44, 0, Math.PI * 2)
  g.stroke()
  g.fillStyle = 'rgba(232,80,91,0.9)'
  g.beginPath()
  g.arc(W / 2, z(mid), 9, 0, Math.PI * 2)
  g.fill()
  // The goal creases: pale blue half circles in front of each net.
  g.fillStyle = 'rgba(120,180,240,0.35)'
  for (const [m, dir] of [
    [RINK.zG, 1],
    [RINK.zH, -1],
  ] as const) {
    g.beginPath()
    g.arc(W / 2, z(m), 40, dir > 0 ? 0 : Math.PI, dir > 0 ? Math.PI : Math.PI * 2)
    g.fill()
  }
  return c
}

export interface Canal {
  root: Group
  /** Lamps on the banks (their globes glow when tapped, and at the win). */
  lamps: { at: [number, number, number]; glow: Mesh; mat: MeshBasicMaterial; t: number }[]
  /** The pastry stand, its BeaverTail that pops up, and the clock tower's top (for taps). */
  stand: { root: Group; pastry: Group; at: [number, number, number] }
  tower: [number, number, number]
  skaters: { root: Group; body: Group; lane: number; speed: number; phase: number; spinT: number }[]
  /** The two nets: the frame groups (they shake when the puck hits). */
  netG: Group
  netH: Group
}

function net(bag: Bag) {
  const w = RINK.netHalf * 2
  const h = 1.2
  const d = 0.9
  const g = new Group()
  const red = '#E8443F'
  g.add(
    solid(
      merge([
        P.cyl(0.07, 0.07, h, red, { at: [-w / 2, h / 2, 0] }, 8),
        P.cyl(0.07, 0.07, h, red, { at: [w / 2, h / 2, 0] }, 8),
        P.cyl(0.07, 0.07, w, red, { at: [0, h, 0], rot: [0, 0, Math.PI / 2] }, 8),
        P.cyl(0.05, 0.05, w, red, { at: [0, 0.04, -d], rot: [0, 0, Math.PI / 2] }, 6),
        ...[-1, 1].map((s) => P.cyl(0.05, 0.05, Math.hypot(h, d), red, { at: [s * (w / 2), h / 2, -d / 2], rot: [Math.atan2(d, h), 0, 0] }, 6)),
      ]),
      bag,
      2,
    ),
  )
  // The netting: a white mesh of thin bars (back and sides), no outline.
  const mesh: BufferGeometry[] = []
  for (let i = 1; i < 8; i++) mesh.push(P.box(0.025, Math.hypot(h, d), 0.025, '#FFFFFF', { at: [-w / 2 + (i * w) / 8, h / 2, -d / 2], rot: [Math.atan2(d, h), 0, 0] }))
  for (let i = 1; i < 5; i++) {
    const k = i / 5
    mesh.push(P.box(w, 0.025, 0.025, '#FFFFFF', { at: [0, h * (1 - k), -d * k] }))
  }
  g.add(solid(merge(mesh), bag, 0))
  return g
}

/** How high the hill under Parliament is at (x, z) (an ellipsoid round (0, -22, -66)). */
function hillY(x: number, z: number) {
  const k = 1 - (x / 48) ** 2 - ((z + 66) / 15) ** 2
  return k > 0 ? 30 * Math.sqrt(k) - 22 : -22
}

export function buildCanal(bag: Bag): Canal {
  const root = new Group()
  const r = rng(11)

  // ---- The ice, the length of the canal, with the rink painted on it.
  const tex = bag.add(new CanvasTexture(iceTexture()))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(1, 5)
  const ice = new Mesh(bag.add(new PlaneGeometry(16, 90)), bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() })))
  ice.rotation.x = -Math.PI / 2
  ice.position.set(0, 0, -25)
  root.add(ice)
  const lt = bag.add(new CanvasTexture(linesTexture()))
  lt.colorSpace = SRGBColorSpace
  const lines = new Mesh(bag.add(new PlaneGeometry(RINK.x * 2 + 0.6, RINK.zH - RINK.zG + 2.4)), bag.add(new MeshBasicMaterial({ map: lt, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })))
  lines.rotation.x = -Math.PI / 2
  lines.position.set(0, 0.005, (RINK.zG + RINK.zH) / 2)
  lines.renderOrder = 1
  root.add(lines)

  // ---- Snowbanks round the rink (lumpy, with a gap behind each net... no: behind each net a low bank too).
  const snow: BufferGeometry[] = []
  const lump = (x: number, z: number, s: number) => {
    snow.push(P.sphere(0.55 * s, SNOW, { at: [x, 0.05, z], scale: [1.1, 0.62, 1] }, 12))
    if (r() < 0.5) snow.push(P.sphere(0.32 * s, SNOW_SHADE, { at: [x + (r() - 0.5) * 0.5, 0.28 * s, z + (r() - 0.5) * 0.5], scale: [1, 0.7, 1] }, 10))
  }
  for (let z = RINK.zG - 1.6; z <= RINK.zH + 1.6; z += 0.75) for (const s of [-1, 1]) lump(s * (RINK.x + 0.75 + r() * 0.15), z, 0.95 + r() * 0.3)
  for (let x = -RINK.x - 0.6; x <= RINK.x + 0.6; x += 0.8) {
    lump(x, RINK.zG - 2.0 - r() * 0.15, 0.85 + r() * 0.3)
    lump(x, RINK.zH + 2.2 + r() * 0.15, 0.85 + r() * 0.3)
  }
  root.add(solid(merge(snow), bag, 2))

  // ---- The canal's stone walls with snow on top, the banks beyond (snow), and the hill at the end.
  const walls: BufferGeometry[] = []
  for (const s of [-1, 1]) {
    walls.push(P.box(1.2, 1.4, 90, STONE, { at: [s * 8.6, 0.7, -25] }))
    walls.push(P.rbox(1.5, 0.3, 90, 0.12, SNOW, { at: [s * 8.65, 1.5, -25] }))
    walls.push(P.box(20, 1.3, 90, SNOW, { at: [s * 19.2, 0.75, -25] }))
    for (let z = 15; z > -68; z -= 2.6) walls.push(P.box(1.22, 0.04, 0.05, STONE_DARK, { at: [s * 8.6, 0.6 + ((z * 7) % 3) * 0.12, z] }))
  }
  // The hill under Parliament, at the canal's end, and the locks' stone face.
  walls.push(P.sphere(30, '#F4F7FC', { at: [0, -22, -66], scale: [1.6, 1, 0.5] }, 28))
  walls.push(P.box(17, 3, 2, STONE, { at: [0, 1.5, -52] }))
  walls.push(P.rbox(17.4, 0.4, 2.4, 0.15, SNOW, { at: [0, 3.1, -52] }))
  root.add(solid(merge(walls), bag, 2))

  // ---- Parliament on its hill: the long stone block, the green copper roofs, the clock tower in the middle.
  const parl: BufferGeometry[] = []
  const PZ = -62
  const PY = 6.5
  parl.push(P.box(30, 5, 6, STONE, { at: [0, PY + 2.5, PZ] }))
  for (const s of [-1, 1]) {
    parl.push(P.box(6, 6.5, 7, STONE, { at: [s * 15, PY + 3.25, PZ] }))
    parl.push(P.cone(4.6, 4, COPPER, { at: [s * 15, PY + 8.5, PZ] }, 4))
    for (let i = 0; i < 4; i++) parl.push(P.cone(0.45, 2.4, COPPER, { at: [s * (6 + i * 2.2), PY + 6.4, PZ + 3.1] }, 4))
  }
  parl.push(P.prism([[-15, 0], [15, 0], [13, 2.2], [-13, 2.2]], 6, COPPER, { at: [0, PY + 5, PZ] }))
  // The windows, two rows.
  for (let i = -6; i <= 6; i++) for (const y of [1.4, 3.3]) if (Math.abs(i) > 1) parl.push(P.box(0.9, 1.1, 0.1, '#9CCBEF', { at: [i * 2.1, PY + y, PZ + 3.02] }))
  // The clock tower, the clock (a plain face, no numbers) and its copper spire.
  parl.push(P.box(4, 16, 4, STONE, { at: [0, PY + 8, PZ + 3.5] }))
  parl.push(P.box(4.4, 1, 4.4, STONE_DARK, { at: [0, PY + 13.5, PZ + 3.5] }))
  parl.push(P.cone(3.1, 7, COPPER, { at: [0, PY + 19.5, PZ + 3.5] }, 4))
  parl.push(P.box(1, 3, 0.1, '#9CCBEF', { at: [0, PY + 6, PZ + 5.55] }))
  parl.push(P.sphere(0.4, PAL.gold, { at: [0, PY + 23.2, PZ + 3.5] }, 8))
  const clock = [P.cyl(1.25, 1.25, 0.12, '#FFF7E6', { at: [0, PY + 11.4, PZ + 5.56], rot: [Math.PI / 2, 0, 0] }, 24), P.box(0.12, 0.85, 0.06, PAL.ink, { at: [0, PY + 11.7, PZ + 5.66] }), P.box(0.6, 0.12, 0.06, PAL.ink, { at: [0.25, PY + 11.4, PZ + 5.66] })]
  root.add(solidMix([...parl, ...clock.slice(0, 1)], clock.slice(1), bag, 2))
  // Snow on the roofs' edges and the spruces on the hill.
  const hill: BufferGeometry[] = []
  for (let i = 0; i < 18; i++) {
    const x = (r() - 0.5) * 60
    const z = -54 - r() * 14
    if (Math.abs(x) < 17 && z > -66) continue
    const h = 2.4 + r() * 2
    const y = hillY(x, z) - 0.3
    hill.push(P.cone(1, h, r() < 0.5 ? '#4FA474' : '#5DB27F', { at: [x, y + h / 2, z] }, 8))
    hill.push(P.cone(0.6, h * 0.45, SNOW, { at: [x, y + h * 0.78, z] }, 8))
  }

  // ---- The banks: snowy spruces and bare trees, and old black lamps along the walls.
  for (let z = 12; z > -46; z -= 3.2 + r() * 2) {
    for (const s of [-1, 1]) {
      const x = s * (10.6 + r() * 6)
      if (r() < 0.55) {
        const h = 2.2 + r() * 1.6
        hill.push(P.cone(0.9, h, r() < 0.5 ? '#4FA474' : '#469A6C', { at: [x, 1.4 + h / 2, z] }, 8))
        hill.push(P.cone(0.55, h * 0.42, SNOW, { at: [x, 1.4 + h * 0.8, z] }, 8))
      } else {
        const h = 2.6 + r()
        hill.push(P.cyl(0.1, 0.16, h, '#8A6A58', { at: [x, 1.4 + h / 2, z] }, 6))
        for (let i = 0; i < 4; i++) hill.push(P.cyl(0.04, 0.06, 1.2, '#8A6A58', { at: [x + Math.cos(i * 1.6) * 0.4, 1.4 + h * 0.7 + i * 0.15, z + Math.sin(i * 1.6) * 0.4], rot: [Math.sin(i * 1.6) * 0.8, 0, -Math.cos(i * 1.6) * 0.8] }, 5))
      }
    }
  }
  root.add(solid(merge(hill), bag, 2))

  const lamps: Canal['lamps'] = []
  const lampParts: BufferGeometry[] = []
  for (let z = 9; z > -40; z -= 7) {
    for (const s of [-1, 1]) {
      const x = s * 8.4
      lampParts.push(P.cyl(0.09, 0.13, 3.4, '#2E2A3A', { at: [x, 1.5 + 1.7, z] }, 8))
      lampParts.push(P.cyl(0.26, 0.2, 0.12, '#2E2A3A', { at: [x, 1.5 + 3.4, z] }, 8))
      lampParts.push(P.cone(0.32, 0.3, '#2E2A3A', { at: [x, 1.5 + 4.15, z] }, 8))
      const mat = bag.add(new MeshBasicMaterial({ color: '#FFF2B8' }))
      const glow = new Mesh(bag.add(P.sphere(0.3, '#ffffff', {}, 12)), mat)
      glow.position.set(x, 1.5 + 3.75, z)
      root.add(glow)
      lamps.push({ at: [x, 1.5, z], glow, mat, t: -1 })
    }
  }
  root.add(solid(merge(lampParts), bag, 2))

  // ---- The BeaverTails stand on the ice by the right wall: a little wooden hut with a striped awning and a giant
  // pastry on its roof (no words).
  const stand = new Group()
  const SX = 6.9
  const SZ = -4.2
  stand.position.set(SX, 0, SZ)
  stand.rotation.y = -Math.PI / 2 + 0.35
  stand.add(
    solid(
      merge([
        P.rbox(2.2, 1.6, 1.4, 0.08, '#C98B5A', { at: [0, 0.8, 0] }),
        P.box(2.24, 0.12, 1.44, '#8A5A3C', { at: [0, 0.06, 0] }),
        P.box(1.6, 0.6, 0.06, '#5A3B2E', { at: [0, 1.15, 0.71] }),
        P.rbox(2.0, 0.12, 0.5, 0.04, '#EDD3B0', { at: [0, 0.86, 0.85] }),
        ...[0, 1, 2, 3, 4, 5].map((i) => P.box(0.4, 0.1, 0.8, i % 2 ? '#FFFFFF' : '#E8443F', { at: [-1 + i * 0.4, 1.75, 0.9], rot: [0.45, 0, 0] })),
        P.rbox(2.4, 0.16, 1.7, 0.06, SNOW, { at: [0, 1.66, 0] }),
        // The giant BeaverTail on the roof: a flat oval pastry, cinnamon-sugar brown.
        P.sphere(0.75, '#C9883E', { at: [0, 2.05, 0], rot: [0.5, 0, 0], scale: [1, 0.2, 1.5] }, 18),
        P.sphere(0.6, '#E0A75A', { at: [0, 2.12, 0.03], rot: [0.5, 0, 0], scale: [1, 0.12, 1.4] }, 16),
      ]),
      bag,
      2,
    ),
    blobShadow(1.6, bag),
  )
  const pastry = new Group()
  pastry.add(solid(merge([P.sphere(0.3, '#C9883E', { scale: [1, 0.22, 1.5] }, 14), P.sphere(0.24, '#E0A75A', { at: [0, 0.03, 0], scale: [1, 0.14, 1.4] }, 12), ...[0, 1, 2].map((i) => P.sphere(0.04, '#FFFFFF', { at: [(i - 1) * 0.1, 0.07, (i % 2) * 0.1 - 0.05] }, 6))]), bag, 2))
  pastry.position.set(0, 1.0, 0.9)
  pastry.visible = false
  stand.add(pastry)
  root.add(stand)

  // ---- Skaters gliding on the far canal, beyond the rink (little round toy people in tuques and scarves).
  const skaters: Canal['skaters'] = []
  const coats = ['#FF8FB8', '#8FE3C8', '#A8DCFF', '#FBEA9A', '#D9CCFF', '#FFC2A8']
  for (let i = 0; i < 6; i++) {
    const s = new Group()
    const body = new Group()
    const coat = coats[i % coats.length]
    const hat = coats[(i + 3) % coats.length]
    body.add(
      solid(
        merge([
          P.capsule(0.32, 0.5, coat, { at: [0, 0.75, 0] }),
          P.sphere(0.3, '#FFDCC2', { at: [0, 1.5, 0] }, 14),
          P.sphere(0.31, hat, { at: [0, 1.6, -0.02], scale: [1, 0.7, 1] }, 14),
          P.sphere(0.1, '#FFFFFF', { at: [0, 1.88, -0.02] }, 8),
          P.torus(0.24, 0.07, i % 2 ? '#E8443F' : '#FFFFFF', { at: [0, 1.22, 0], rot: [Math.PI / 2, 0, 0] }),
          P.capsule(0.1, 0.32, '#5A5470', { at: [0.13, 0.22, 0] }),
          P.capsule(0.1, 0.32, '#5A5470', { at: [-0.13, 0.22, 0] }),
          P.box(0.06, 0.04, 0.42, '#C9D2E0', { at: [0.13, 0.02, 0] }),
          P.box(0.06, 0.04, 0.42, '#C9D2E0', { at: [-0.13, 0.02, 0] }),
        ]),
        bag,
        2,
      ),
    )
    s.add(body, blobShadow(0.5, bag))
    root.add(s)
    skaters.push({ root: s, body, lane: (i % 3) * 3.6 - 3.6 + (r() - 0.5), speed: 1.6 + r() * 1.4, phase: r() * 30, spinT: -1 })
  }

  // ---- The nets.
  const netG = net(bag)
  netG.position.set(0, 0, RINK.zG)
  const netH = net(bag)
  netH.position.set(0, 0, RINK.zH)
  netH.rotation.y = Math.PI
  root.add(netG, netH)

  return { root, lamps, stand: { root: stand, pastry, at: [SX, 0, SZ] }, tower: [0, 6.5 + 11.4, -62 + 5.5], skaters, netG, netH }
}
