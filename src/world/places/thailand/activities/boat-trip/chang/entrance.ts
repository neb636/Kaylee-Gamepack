// Baan Chang's entrance (`chang`, `sign`; plan: "The photo spot at the entrance"), greybox in the final toon look: the
// road where the songthaew drops the family off, the plank deck with its tree-stump stools, a black-and-white totem
// post either side (zigzags and a spiral), a twisted driftwood tree, potted palms and a fern, and behind it the curved
// wall of upright bamboo poles under a thick thatched band. "Baan Chang Café" and the smaller line under it are canvas
// text on the wall (the way the shop sign is in hub/build/street.ts), never generated. Oil palms stand behind.
import { BackSide, CanvasTexture, CylinderGeometry, Group, Mesh, MeshToonMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL, toonGradient } from '../../../engine/toon'
import { buildSongthaew, type Songthaew } from '../../../trip/vehicles/songthaew'
import { DECK, ENTRY, ROAD, TOTEMS, WALL } from './layout'
import { FROND, FROND_DARK, GRAVEL, oilPalm, THATCH } from './yard'

const BAMBOO = ['#D9B86A', '#CDA95C', '#E3C57C']
const NODE = '#B08F4A'
const PLANK = '#C99A6E'
const STUMP = '#A97C54'
const DRIFT = '#B7A898'
const INK = '#2E2233'

export interface Entrance {
  root: Group
  songthaew: Songthaew
  /** The two totems (a tap: tock, and a wobble). */
  totems: Group[]
}

/** A point on the wall's arc at angle `t` (0 = its middle, straight in front of the camera). */
const onArc = (t: number, r = WALL.r): [number, number] => [WALL.cx + r * Math.sin(Math.PI + t), WALL.cz + r * Math.cos(Math.PI + t)]

/** The letters on the wall: white with an ink edge on a clear strip, mirrored (it's seen from inside its cylinder). */
function letters(bag: Bag, h: number, y: number) {
  const W = 2048
  const H = 400
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')!
  g.translate(W, 0)
  g.scale(-1, 1)
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.lineJoin = 'round'
  const font = '"Fredoka", "Arial Rounded MT Bold", "Avenir Next", sans-serif'
  const write = (text: string, y: number, size: number) => {
    g.font = `bold ${size}px ${font}`
    g.lineWidth = size * 0.16
    g.strokeStyle = '#5A4632'
    g.strokeText(text, W / 2, y)
    g.fillStyle = '#FFFFFF'
    g.fillText(text, W / 2, y)
  }
  write('Baan Chang Café', H * 0.38, 230)
  write('We hope to be the reason you smile today', H * 0.84, 84)
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  // The strip covers the middle of the arc, a little in front of the poles.
  const a = WALL.a * 0.82
  const geo = bag.add(new CylinderGeometry(WALL.r - 0.14, WALL.r - 0.14, h, 40, 1, true, Math.PI - a, a * 2))
  const mesh = new Mesh(geo, bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient(), transparent: true, alphaTest: 0.35, side: BackSide })))
  mesh.position.set(WALL.cx, y, WALL.cz)
  return mesh
}

/** A totem post: black and white bands, zigzag teeth and a spiral eye, a pointed cap. */
function totem(bag: Bag, x: number, z: number, k: number) {
  const parts = [P.cyl(0.2, 0.22, 0.2, INK, { at: [x, 0.1, z] }, 12)]
  for (let i = 0; i < 6; i++) {
    const y = 0.25 + i * 0.32
    parts.push(P.cyl(0.19, 0.19, 0.3, i % 2 ? '#FFFFFF' : INK, { at: [x, y + 0.15, z] }, 12))
    // Zigzag teeth round the white bands; a spiral (a ring and its dot) on the black ones.
    if (i % 2) for (let j = 0; j < 4; j++) parts.push(P.cone(0.05, 0.12, INK, { at: [x - 0.12 + j * 0.08, y + 0.08, z + 0.17], rot: [0, 0, Math.PI] }, 4))
    else parts.push(P.torus(0.07, 0.022, '#FFFFFF', { at: [x, y + 0.15, z + 0.18] }), P.sphere(0.025, '#FFFFFF', { at: [x, y + 0.15, z + 0.2] }, 6))
  }
  parts.push(P.cone(0.22, 0.34, INK, { at: [x, 2.34, z] }, 12), P.sphere(0.06, PAL.gold, { at: [x, 2.54, z] }, 8))
  const g = solid(merge(parts), bag, 2)
  g.userData.pick = `totem:${k}`
  return g
}

/** A potted palm: a terracotta pot and a fan of fronds. */
function pottedPalm(x: number, z: number, s = 1) {
  const parts = [P.cyl(0.26 * s, 0.2 * s, 0.4 * s, '#E58E6C', { at: [x, 0.2 * s, z] }, 12), P.cyl(0.27 * s, 0.27 * s, 0.05 * s, '#D27A5A', { at: [x, 0.4 * s, z] }, 12)]
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2
    parts.push(P.box(0.18 * s, 0.03, 0.8 * s, i % 2 ? FROND : FROND_DARK, { at: [x + Math.sin(a) * 0.32 * s, 0.75 * s, z + Math.cos(a) * 0.32 * s], rot: [0.7, a, 0] }))
  }
  parts.push(P.cyl(0.05 * s, 0.06 * s, 0.4 * s, '#A98A6E', { at: [x, 0.6 * s, z] }, 6))
  return parts
}

export function buildEntrance(bag: Bag): Entrance {
  const root = new Group()
  const z = ENTRY.z
  // ---- The ground: a gravel lot, the road along the front, sand under the deck ----
  root.add(
    solid(
      merge([
        P.box(60, 0.1, 40, GRAVEL, { at: [0, -0.05, z - 6] }),
        P.box(60, 0.012, ROAD.w, '#C9C4DE', { at: [0, 0.006, ROAD.z] }),
        ...Array.from({ length: 12 }, (_, i) => P.box(1.2, 0.01, 0.12, PAL.butter, { at: [-26 + i * 4.6, 0.014, ROAD.z] })),
        P.box(9, 0.01, 4.4, '#E6DCC6', { at: [0, 0.008, z + 0.4] }),
      ]),
      bag,
      0,
    ),
  )
  // ---- The plank deck, its stumps, the driftwood tree, the pots ----
  const deckW = DECK.x1 - DECK.x0
  const deckD = DECK.z1 - DECK.z0
  const deckZ = (DECK.z0 + DECK.z1) / 2
  root.add(
    solid(
      merge([
        P.box(deckW, DECK.y, deckD, PLANK, { at: [0, DECK.y / 2, deckZ] }),
        ...Array.from({ length: 6 }, (_, i) => P.box(deckW, 0.006, 0.025, '#B7865C', { at: [0, DECK.y + 0.002, DECK.z0 + 0.4 + i * 0.4] })),
        // Tree-stump stools along the front of the deck.
        ...([[-2.3, z + 1.55, 0.24], [2.25, z + 1.6, 0.27], [1.6, z + 1.85, 0.2]] as const).flatMap(([x, sz, r]) => [
          P.cyl(r, r * 1.08, 0.36, STUMP, { at: [x, DECK.y + 0.18, sz] }, 12),
          P.cyl(r * 0.92, r * 0.92, 0.012, '#E3C08E', { at: [x, DECK.y + 0.365, sz] }, 12),
          P.torus(r * 0.55, 0.012, '#C9A06C', { at: [x, DECK.y + 0.37, sz], rot: [Math.PI / 2, 0, 0] }),
        ]),
        // The twisted driftwood tree, silver-grey.
        P.capsule(0.12, 1.3, DRIFT, { at: [-4.7, 0.75, z + 0.1], rot: [0, 0, 0.15] }),
        P.capsule(0.08, 0.9, DRIFT, { at: [-4.35, 1.75, z + 0.1], rot: [0.3, 0, -0.7] }),
        P.capsule(0.07, 0.8, DRIFT, { at: [-5.05, 1.85, z + 0.05], rot: [-0.2, 0, 0.8] }),
        P.capsule(0.05, 0.5, DRIFT, { at: [-4.0, 2.25, z + 0.15], rot: [0, 0, -1.2] }),
        ...pottedPalm(4.75, z + 0.9),
        ...pottedPalm(-3.75, z + 1.9, 0.75),
        // A fern, and a green plastic basket.
        ...[0, 1, 2, 3, 4, 5].map((i) => P.sphere(0.22, i % 2 ? FROND : FROND_DARK, { at: [3.85 + Math.sin(i) * 0.18, 0.2 + (i % 2) * 0.06, z + 1.95 + Math.cos(i) * 0.12], scale: [1.4, 0.5, 0.8], rot: [0, i, 0.3] }, 8)),
        P.cyl(0.24, 0.2, 0.3, '#6FCB7F', { at: [3.1, 0.15, z + 2.35] }, 12),
      ]),
      bag,
      2,
    ),
  )
  // ---- The bamboo wall: upright poles along the arc (each with its nodes), the thatched band on top ----
  const poles = []
  const n = Math.round((WALL.a * 2 * WALL.r) / 0.165)
  for (let i = 0; i <= n; i++) {
    const t = -WALL.a + (i / n) * WALL.a * 2
    const [x, pz] = onArc(t)
    const h = WALL.h + Math.sin(i * 2.7) * 0.08
    poles.push(P.cyl(0.075, 0.08, h, BAMBOO[i % 3], { at: [x, h / 2, pz] }, 8))
    for (const y of [0.55, 1.3]) poles.push(P.cyl(0.085, 0.085, 0.04, NODE, { at: [x, y + (i % 2) * 0.12, pz] }, 8))
  }
  root.add(solid(merge(poles), bag, 1))
  const band = []
  const segs = 16
  for (let i = 0; i < segs; i++) {
    const t = -WALL.a - 0.02 + ((i + 0.5) / segs) * (WALL.a * 2 + 0.04)
    const [x, pz] = onArc(t)
    const w = ((WALL.a * 2 + 0.04) * WALL.r) / segs + 0.08
    band.push(P.box(w, WALL.band, 0.5, THATCH, { at: [x, WALL.h + WALL.band / 2 - 0.05, pz], rot: [0, t, 0] }))
    // The ragged fringe under it, and a darker tuft line along its top.
    band.push(P.box(w, 0.16, 0.42, '#D9B470', { at: [x, WALL.h - 0.1, pz + Math.cos(Math.PI + t) * -0.02], rot: [0.12, t, 0] }))
    band.push(P.box(w, 0.08, 0.46, '#C9A060', { at: [x, WALL.h + WALL.band - 0.02, pz], rot: [0, t, 0] }))
  }
  root.add(solid(merge(band), bag, 2))
  root.add(letters(bag, 0.95, WALL.h - 0.55))
  // ---- The totem posts either side of the deck (one at a time, so each can wobble on its own) ----
  const totems = TOTEMS.map(([x, , tz], i) => {
    const g = totem(bag, 0, 0, i)
    g.position.set(x, 0, tz)
    root.add(g)
    return g
  })
  // ---- Oil palms behind the wall ----
  const palms = []
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 2; j++) palms.push(...oilPalm(i * 4 + (j % 2) * 2, z - 4.5 - j * 4.5, 5.6 + ((i + j) % 3) * 0.7, i * 0.8 + j))
  palms.push(...oilPalm(-8.5, z + 1.2, 6.4, 0.5), ...oilPalm(8.8, z + 0.6, 6.0, 1.7))
  root.add(solid(merge(palms), bag, 2))
  // ---- The songthaew (it drives in along the road) ----
  const songthaew = buildSongthaew(bag)
  songthaew.root.position.set(ROAD.x0, 0, ROAD.z)
  songthaew.root.userData.pick = 'songthaew'
  root.add(songthaew.root)
  return { root, songthaew, totems }
}
