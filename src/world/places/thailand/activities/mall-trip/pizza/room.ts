// The Pizza Company's corner, modeled in code in the house's toon look (engine/geo.ts parts): a green booth against a
// cream wall, the table, the green sign (a pizza slice on it, no words) and the window onto Alangkarn's waterfall. And
// the things to poke: the soda with its straw, the onion rings, the chili shaker, the napkin box, the server. Greybox:
// shapes only.
import { CanvasTexture, Group, Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, SRGBColorSpace } from 'three'
import { buildAnimal, type Rig } from '../../../characters/animal'
import type { Look } from '../../../characters/looks'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { BACK_Z, CHILI, NAPKINS, RINGS, SEAT_Z, SERVER_AT, SIGN, SODA, TABLE, WINDOW } from './layout'

const GREEN = '#4DB57A'
const GREEN_DARK = '#2F8F5B'
const WALL = '#FFF1E4'
/** The server (a background figure: a bow, and her lines in table.ts): a fox in The Pizza Company's green shirt and cap. */
export const SERVER: Look = { species: 'fox', height: 1.5, fur: '#FF9A4D', light: '#FFF1E2', dark: '#2B2330', ear: '#FFE6CC', outfit: { kind: 'shirt', color: GREEN }, extras: ['cap'], lashes: true }

export interface Room {
  root: Group
  soda: { root: Group; level: Group }
  rings: { root: Group; rings: Group[] }
  chili: Group
  napkins: Group
  sign: { root: Group; halo: Mesh; logo: Group }
  falls: { tex: CanvasTexture; mat: MeshBasicMaterial; mesh: Mesh }
  server: Rig
}

export function buildRoom(bag: Bag): Room {
  const root = new Group()
  const add = <T extends Group | Mesh>(o: T) => (root.add(o), o)
  const z = BACK_Z
  // ---- Floor and the back wall round the window ----
  add(solid(merge([
    P.box(7, 0.1, 4.2, '#F3E6FF', { at: [0, -0.05, z + 2.1] }),
    ...Array.from({ length: 9 }, (_, i) => P.box(0.03, 0.004, 4.2, '#E4D6F5', { at: [-3.2 + i * 0.8, 0.002, z + 2.1] })),
  ]), bag, 0))
  const wall = (x0: number, x1: number, y0: number, y1: number) => P.box(x1 - x0, y1 - y0, 0.2, WALL, { at: [(x0 + x1) / 2, (y0 + y1) / 2, z - 0.1] })
  add(solid(merge([
    wall(-3.5, WINDOW.x0, 0, 5),
    wall(WINDOW.x1, 3.5, 0, 5),
    wall(WINDOW.x0, WINDOW.x1, 0, WINDOW.y0),
    wall(WINDOW.x0, WINDOW.x1, WINDOW.y1, 5),
    // A green stripe along the wall at the booth's top.
    P.box(7, 0.08, 0.02, GREEN, { at: [0, 1.3, z + 0.01] }),
    // The window's frame and its crossbar.
    P.box(WINDOW.x1 - WINDOW.x0 + 0.12, 0.08, 0.22, '#FFFFFF', { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y0, z - 0.06] }),
    P.box(WINDOW.x1 - WINDOW.x0 + 0.12, 0.08, 0.22, '#FFFFFF', { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y1, z - 0.06] }),
    ...[WINDOW.x0, (WINDOW.x0 + WINDOW.x1) / 2, WINDOW.x1].map((x) => P.box(0.07, WINDOW.y1 - WINDOW.y0, 0.2, '#FFFFFF', { at: [x, (WINDOW.y0 + WINDOW.y1) / 2, z - 0.06] })),
  ]), bag, 2))
  // ---- The waterfall through the window: stripes of falling water over rocks (they scroll), tinted by a tap ----
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const g = canvas.getContext('2d')!
  g.fillStyle = '#BFE6FF'
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 16; i++) {
    g.fillStyle = i % 3 ? '#FFFFFF' : '#8EC9F5'
    g.fillRect(i * 8 + 1, ((i * 37) % 128) - 64, 4, 70)
    g.fillRect(i * 8 + 1, ((i * 37) % 128) + 64, 4, 70)
  }
  const tex = bag.add(new CanvasTexture(canvas))
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.repeat.set(3, 2)
  const mat = bag.add(new MeshBasicMaterial({ map: tex, color: '#FFFFFF' }))
  const falls = new Mesh(bag.add(new PlaneGeometry(WINDOW.x1 - WINDOW.x0, WINDOW.y1 - WINDOW.y0)), mat)
  falls.position.set((WINDOW.x0 + WINDOW.x1) / 2, (WINDOW.y0 + WINDOW.y1) / 2, z - 0.12)
  falls.userData.pick = 'window'
  root.add(falls)
  // Rocks and a pool at the waterfall's foot, in front of the water.
  add(solid(merge([
    ...[[-2.1, 0.22], [-1.6, 0.3], [-1.05, 0.2], [-0.6, 0.26]].map(([x, r]) => P.sphere(r, '#9C95C4', { at: [x, WINDOW.y0 + 0.02, z - 0.16], scale: [1.2, 0.7, 0.3] })),
    P.box(WINDOW.x1 - WINDOW.x0, 0.12, 0.04, '#7FC8F5', { at: [(WINDOW.x0 + WINDOW.x1) / 2, WINDOW.y0 + 0.08, z - 0.13] }),
  ]), bag, 1.5))

  // ---- The green sign with a pizza slice on it (and a glow behind it when tapped) ----
  const sign = new Group()
  sign.position.set(SIGN.x, SIGN.y, z + 0.03)
  sign.userData.pick = 'sign'
  const halo = new Mesh(bag.add(new PlaneGeometry(SIGN.w + 0.5, SIGN.h + 0.5)), bag.add(new MeshBasicMaterial({ color: PAL.gold, transparent: true, opacity: 0, depthWrite: false })))
  halo.position.z = -0.02
  sign.add(halo)
  sign.add(solid(merge([
    P.rbox(SIGN.w, SIGN.h, 0.06, 0.1, GREEN, {}),
    P.rbox(SIGN.w - 0.1, SIGN.h - 0.1, 0.02, 0.07, GREEN_DARK, { at: [0, 0, 0.03] }),
    // Three little stripes where the name would be (no words in the scene).
    ...[0, 1, 2].map((k) => P.rbox(0.42 - k * 0.08, 0.05, 0.02, 0.02, '#FFFFFF', { at: [0.12, 0.1 - k * 0.11, 0.045] })),
  ]), bag, 2))
  const logo = new Group()
  logo.position.set(-0.37, 0, 0.06)
  logo.add(solid(merge([
    P.cyl(0.2, 0.2, 0.03, '#E5484D', { rot: [Math.PI / 2, 0, 0] }, 24),
    P.prism([[0, -0.13], [0.11, 0.1], [-0.11, 0.1]], 0.03, '#FFD24A', { at: [0, 0, 0.02] }),
    P.prism([[-0.12, 0.09], [0.12, 0.09], [0.12, 0.13], [-0.12, 0.13]], 0.03, '#F2C27B', { at: [0, 0, 0.025] }),
    ...[[-0.03, 0.04], [0.035, 0.02], [0, -0.05]].map(([x, y]) => P.sphere(0.022, '#E5484D', { at: [x, y, 0.04], scale: [1, 1, 0.4] }, 10)),
  ]), bag, 2))
  sign.add(logo)
  root.add(sign)

  // ---- The booth on the far side (Kaylee's booster cushion in the middle) ----
  add(solid(merge([
    P.rbox(3.4, 0.14, 0.52, 0.05, GREEN, { at: [0, 0.39, SEAT_Z] }),
    P.rbox(3.4, 0.36, 0.5, 0.04, GREEN_DARK, { at: [0, 0.16, SEAT_Z] }),
    P.rbox(3.4, 0.92, 0.18, 0.08, GREEN, { at: [0, 0.82, SEAT_Z - 0.32] }),
    ...[-1.15, -0.4, 0.4, 1.15].map((x) => P.box(0.02, 0.7, 0.02, GREEN_DARK, { at: [x, 0.9, SEAT_Z - 0.22] })),
    P.rbox(0.42, 0.16, 0.36, 0.06, PAL.pink, { at: [0, 0.54, SEAT_Z + 0.02] }),
  ]), bag, 2))

  // ---- The table ----
  add(solid(merge([
    P.rbox(TABLE.w, 0.06, TABLE.d, 0.025, '#FFFDF8', { at: [0, TABLE.top - 0.03, TABLE.z] }),
    P.box(TABLE.w - 0.04, 0.03, 0.02, GREEN, { at: [0, TABLE.top - 0.035, TABLE.z + TABLE.d / 2 + 0.002] }),
    ...[-1, 1].map((s) => P.cyl(0.07, 0.07, TABLE.top - 0.06, '#C9C3DA', { at: [s * 1.0, (TABLE.top - 0.06) / 2, TABLE.z] })),
    ...[-1, 1].map((s) => P.cyl(0.26, 0.28, 0.04, '#C9C3DA', { at: [s * 1.0, 0.02, TABLE.z] }, 24)),
  ]), bag, 2))

  // ---- The soda: a glass of pink soda (its level dips when she slurps), ice and a striped straw ----
  const soda = new Group()
  soda.position.set(...SODA)
  soda.userData.pick = 'soda'
  soda.add(new Mesh(bag.add(P.cyl(0.07, 0.06, 0.22, '#fff', { at: [0, 0.11, 0] }, 20)), bag.add(new MeshBasicMaterial({ color: '#E8F6FF', transparent: true, opacity: 0.4, depthWrite: false }))))
  const level = new Group()
  level.add(solid(merge([P.cyl(0.062, 0.055, 0.17, '#FF8FB8', { at: [0, 0.085, 0] }, 20), P.box(0.04, 0.04, 0.04, '#FFFFFF', { at: [0.02, 0.165, 0.01], rot: [0.3, 0.5, 0] }), P.box(0.035, 0.035, 0.035, '#FFFFFF', { at: [-0.025, 0.16, -0.01], rot: [0.5, 0.2, 0.3] })]), bag, 1))
  soda.add(level)
  soda.add(solid(merge([
    ...Array.from({ length: 5 }, (_, k) => P.cyl(0.011, 0.011, 0.06, k % 2 ? '#FFFFFF' : PAL.hotpink, { at: [0.02 + k * 0.006, 0.17 + k * 0.058, 0], rot: [0, 0, -0.1] }, 8)),
  ]), bag, 1.5))
  root.add(soda)

  // ---- The onion rings in a basket (Mommy wears one as a bracelet) ----
  const ringsRoot = new Group()
  ringsRoot.position.set(...RINGS)
  ringsRoot.userData.pick = 'rings'
  ringsRoot.add(solid(merge([
    P.rbox(0.26, 0.06, 0.18, 0.02, '#E5484D', { at: [0, 0.03, 0] }),
    P.box(0.22, 0.004, 0.14, '#FFFFFF', { at: [0, 0.062, 0] }),
  ]), bag, 1.5))
  const rings = [-0.06, 0, 0.06].map((x, k) => {
    const r = solid(merge([P.torus(0.042, 0.016, '#E7A94B', { rot: [Math.PI / 2 - 0.5, 0, 0] })]), bag, 1.5)
    r.position.set(x, 0.085 + (k === 1 ? 0.02 : 0), 0)
    ringsRoot.add(r)
    return r
  })
  root.add(ringsRoot)

  // ---- The chili shaker ----
  const chili = new Group()
  chili.position.set(...CHILI)
  chili.userData.pick = 'chili'
  chili.add(solid(merge([
    P.cyl(0.04, 0.045, 0.12, '#FFFFFF', { at: [0, 0.06, 0] }, 16),
    P.cyl(0.036, 0.04, 0.08, '#E5484D', { at: [0, 0.045, 0] }, 16),
    P.cyl(0.042, 0.04, 0.035, '#C9C3DA', { at: [0, 0.135, 0] }, 16),
    P.sphere(0.03, '#C9C3DA', { at: [0, 0.15, 0], scale: [1, 0.6, 1] }),
  ]), bag, 1.5))
  root.add(chili)

  // ---- The napkin box (a napkin poking out of the top) ----
  const napkins = new Group()
  napkins.position.set(...NAPKINS)
  napkins.userData.pick = 'napkins'
  napkins.add(solid(merge([
    P.rbox(0.2, 0.1, 0.12, 0.015, GREEN, { at: [0, 0.05, 0] }),
    P.box(0.12, 0.08, 0.008, '#FFFFFF', { at: [0, 0.13, 0], rot: [0, 0, 0.12] }),
  ]), bag, 1.5))
  root.add(napkins)

  // ---- The server, waiting at the end of the table ----
  const server = buildAnimal(SERVER, bag)
  server.root.position.set(...SERVER_AT)
  server.root.rotation.y = 0.5
  server.root.userData.pick = 'server'
  root.add(server.root)

  return { root, soda: { root: soda, level }, rings: { root: ringsRoot, rings }, chili, napkins, sign: { root: sign, halo, logo }, falls: { tex, mat, mesh: falls }, server }
}
