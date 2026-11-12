// Ao Prao's things for hide and seek and for lunch on the deck, built from code in the toon look: the
// hiding places (a pink umbrella tipped over as a shield, a stack of red folding chairs, a beach towel that breathes,
// a pandanus tree on its stilt roots, thin palms, Mom's red chair), Dad's cap, and on the deck the bread basket and
// a roll, a fresh coconut with a straw (its milk goes down as she sips), a plate of mango sticky rice (a bite at a
// time) and the cream umbrellas that flap. The driftwood tree and the deck itself are the island's (island/props.ts).
// Each moving part is its own group, so a tap can spin, shake or squash it.
import { Group, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, P, solid } from '../../../../../engine3d/geo'
import { PAL } from '../../../../../engine3d/toon'
import { palmGeo, rng, stick } from '../island/scenery'

const RED = '#E8475C'
const RED2 = '#F0596B'
const POLE = '#F4EEE6'

/** A pink beach umbrella tipped over on its side like a shield (its canopy facing up the beach), Dad behind it. */
export function shieldUmbrella(bag: Bag) {
  const root = new Group()
  const can = new Group()
  can.add(solid(merge([P.cone(1.5, 0.6, PAL.pink, {}, 10), P.sphere(0.09, '#FFFFFF', { at: [0, 0.34, 0] }, 8), P.cone(1.51, 0.08, '#FFFFFF', { at: [0, -0.3, 0] }, 10), P.cyl(0.05, 0.05, 2.0, POLE, { at: [0, -1.0, 0] }, 6)]), bag, 2))
  // Tipped toward up the beach (local -z), its rim resting on the sand.
  can.rotation.x = -1.25
  can.position.set(0, 0.95, 0)
  root.add(can)
  return { root, can }
}

/** Red folding beach chairs folded flat and stacked against each other in a leaning pile. */
export function chairStack(bag: Bag) {
  const root = new Group()
  const pile = new Group()
  const parts: BufferGeometry[] = []
  for (let k = 0; k < 4; k++) {
    const lean = -0.32 + k * 0.05
    parts.push(P.rbox(0.66, 1.25, 0.08, 0.04, k % 2 ? RED : RED2, { at: [(k - 1.5) * 0.05, 0.62, k * 0.11], rot: [lean, 0, (k - 1.5) * 0.04] }))
    parts.push(P.box(0.05, 1.2, 0.05, '#C9C2B8', { at: [-0.3 + (k - 1.5) * 0.05, 0.6, k * 0.11 + 0.05], rot: [lean, 0, 0] }), P.box(0.05, 1.2, 0.05, '#C9C2B8', { at: [0.3 + (k - 1.5) * 0.05, 0.6, k * 0.11 + 0.05], rot: [lean, 0, 0] }))
  }
  pile.add(solid(merge(parts), bag, 2))
  root.add(pile)
  return { root, pile }
}

/** A striped beach towel spread on the sand, and the lump under it (Dad) that breathes; his toes stick out. */
export function towel(bag: Bag) {
  const root = new Group()
  const flat = new Group()
  const stripes: BufferGeometry[] = []
  for (let k = 0; k < 5; k++) stripes.push(P.box(0.32, 0.03, 1.9, k % 2 ? '#FFFFFF' : PAL.hotpink, { at: [(k - 2) * 0.32, 0.015, 0] }))
  flat.add(solid(merge(stripes), bag, 2))
  root.add(flat)
  // The lump: a towel draped over someone lying down (scaled in when he hides there).
  const lump = new Group()
  lump.add(solid(merge([P.sphere(1, PAL.hotpink, { at: [0, 0, 0], scale: [0.62, 0.36, 1.0] }, 14), ...[-1, 0, 1].map((k) => P.sphere(1, '#FFFFFF', { at: [k * 0.3, 0.04, 0], scale: [0.13, 0.35, 0.98] }, 10))]), bag, 2))
  lump.position.y = 0.05
  root.add(lump)
  const toes = new Group()
  toes.add(solid(merge([-0.12, 0.12].map((x) => P.sphere(0.1, '#F6E7D8', { at: [x, 0.08, 0], scale: [1, 0.9, 1.2] }, 8))), bag, 2))
  toes.position.set(0, 0, 1.05)
  root.add(toes)
  return { root, flat, lump, toes }
}

/** A pandanus tree: a lean trunk on a tent of stilt roots, a spiky crown of long leaves, a cluster of orange fruit. */
export function pandanus(bag: Bag, seed = 3) {
  const R = rng(seed)
  const root = new Group()
  const fixed: BufferGeometry[] = []
  const top = new Vector3(0.35, 2.7, 0.1)
  fixed.push(stick(new Vector3(0, 0.9, 0), top, 0.16, 0.12, '#9C8670'))
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + R() * 0.3
    fixed.push(stick(new Vector3(Math.sin(a) * 0.08, 1.0, Math.cos(a) * 0.08), new Vector3(Math.sin(a) * 0.75, 0, Math.cos(a) * 0.75), 0.05, 0.04, '#A8907A'))
  }
  root.add(solid(merge(fixed), bag, 2))
  const crown = new Group()
  crown.position.copy(top)
  const leaves: BufferGeometry[] = []
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2 + R() * 0.2
    const up = 0.5 + R() * 0.5
    leaves.push(P.box(0.14, 0.03, 1.35, k % 3 ? '#6FB25A' : '#89C766', { at: [Math.sin(a) * 0.62, Math.sin(up) * 0.45 - 0.1, Math.cos(a) * 0.62], rot: [-up + 0.2, a, 0] }))
  }
  leaves.push(P.sphere(0.24, '#F29A4A', { at: [0, -0.25, 0.1], scale: [1, 1.2, 1] }, 10))
  crown.add(solid(merge(leaves), bag, 2))
  root.add(crown)
  return { root, crown, top }
}

/** A thin young coconut palm (too thin to hide behind, which is the joke). */
export function thinPalm(bag: Bag, seed: number) {
  const root = new Group()
  const R = rng(seed)
  root.add(solid(merge(palmGeo(R, new Vector3(0, -0.1, 0), 3.4, new Vector3(0.25, 0, 0.2))), bag, 2))
  return { root }
}

/** Mom's red folding beach chair (Ao Prao's, from the sunset photo). */
export function beachChair(bag: Bag) {
  const root = new Group()
  root.add(solid(merge([P.rbox(0.62, 0.1, 0.9, 0.04, RED, { at: [0, 0.36, 0.1] }), P.rbox(0.62, 0.75, 0.08, 0.04, RED2, { at: [0, 0.68, -0.38], rot: [-0.35, 0, 0] }), ...[[-0.26, 0.45], [0.26, 0.45], [-0.26, -0.3], [0.26, -0.3]].map(([x, z]) => P.box(0.05, 0.36, 0.05, '#C9C2B8', { at: [x, 0.18, z] }))]), bag, 2))
  return { root }
}

/** Dad's cap (it floats when he hides in the sea, his head just under). */
export function cap(bag: Bag) {
  const root = new Group()
  root.add(solid(merge([P.sphere(0.2, '#3D6FB8', { scale: [1, 0.55, 1] }, 12), P.cyl(0.2, 0.2, 0.03, '#2E5A99', { at: [0, -0.01, 0.17], scale: [1, 1, 0.7] }, 12), P.sphere(0.03, '#FFFFFF', { at: [0, 0.11, 0] }, 6)]), bag, 2))
  return { root }
}

// ---------------------------------------------------------------- lunch on the deck

/** The wicker bread basket (rolls in it until the last is gone; it refills). */
export function breadBasket(bag: Bag) {
  const root = new Group()
  const body = new Group()
  const weave: BufferGeometry[] = [P.cyl(0.2, 0.15, 0.13, '#C8955A', { at: [0, 0.065, 0] }, 14), P.torus(0.2, 0.025, '#A97A44', { at: [0, 0.13, 0], rot: [Math.PI / 2, 0, 0] })]
  for (let k = 0; k < 3; k++) weave.push(P.torus(0.17 + k * 0.012, 0.012, '#B4834C', { at: [0, 0.03 + k * 0.035, 0], rot: [Math.PI / 2, 0, 0] }))
  weave.push(P.box(0.24, 0.01, 0.24, '#FFFFFF', { at: [0, 0.13, 0], rot: [0, 0.6, 0] }))
  body.add(solid(merge(weave), bag, 2))
  root.add(body)
  const rolls: Group[] = []
  for (let k = 0; k < 3; k++) {
    const r = roll(bag)
    r.position.set(Math.cos(k * 2.1) * 0.08, 0.15, Math.sin(k * 2.1) * 0.08)
    body.add(r)
    rolls.push(r)
  }
  return { root, body, rolls }
}

/** One bread roll (a little golden bun with a split on top). */
export function roll(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.sphere(0.075, '#E0A65A', { scale: [1.2, 0.75, 1] }, 10), P.box(0.1, 0.012, 0.02, '#F6DFB0', { at: [0, 0.055, 0] })]), bag, 2))
  return g
}

/** A fresh green coconut with its top cut off and a pink straw; `milk` is the white inside that goes down. */
export function coconut(bag: Bag) {
  const root = new Group()
  const body = new Group()
  body.add(solid(merge([P.sphere(0.16, '#8CC152', { at: [0, 0.15, 0], scale: [1, 1.08, 1] }, 14), P.cyl(0.11, 0.13, 0.05, '#F4F1E4', { at: [0, 0.31, 0] }, 12)]), bag, 2))
  const straw = new Group()
  straw.add(solid(merge([P.cyl(0.012, 0.012, 0.34, PAL.hotpink, { at: [0, 0.17, 0] }, 6), P.cyl(0.012, 0.012, 0.09, PAL.hotpink, { at: [0.035, 0.36, 0], rot: [0, 0, -1.0] }, 6)]), bag, 2))
  straw.position.set(0.03, 0.26, 0)
  straw.rotation.z = -0.2
  body.add(straw)
  root.add(body)
  return { root, body, straw }
}

/** Mango sticky rice: a plate, a mound of white rice and yellow mango slices, eaten one bite at a time. */
export function stickyRice(bag: Bag, bites: number) {
  const root = new Group()
  root.add(solid(merge([P.cyl(0.2, 0.17, 0.03, '#FFFFFF', { at: [0, 0.015, 0] }, 18), P.torus(0.18, 0.012, '#7FC3E8', { at: [0, 0.03, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
  const pieces: Group[] = []
  for (let k = 0; k < bites; k++) {
    const g = new Group()
    const a = (k / bites) * Math.PI * 1.6 - 0.8
    const mango = k % 2 === 0
    g.add(solid(mango ? P.sphere(0.06, '#FFC83D', { scale: [1.5, 0.45, 0.75] }, 10) : P.sphere(0.055, '#FFFDF6', { scale: [1.1, 0.75, 1] }, 10), bag, 2))
    g.position.set(Math.cos(a) * 0.085, 0.055, Math.sin(a) * 0.085)
    g.rotation.y = -a
    root.add(g)
    pieces.push(g)
  }
  return { root, pieces }
}

/** A cream umbrella on the deck (photo 2): its skirt flaps in the breeze, a lot when she taps it. */
export function deckUmbrella(bag: Bag) {
  const root = new Group()
  root.add(solid(P.cyl(0.05, 0.05, 2.5, '#E9E3D8', { at: [0, 1.25, 0] }, 6), bag, 2))
  const can = new Group()
  can.add(solid(merge([P.cone(1.6, 0.55, '#FFF3DC', {}, 8), P.sphere(0.08, '#E9E3D8', { at: [0, 0.3, 0] }, 8)]), bag, 2))
  can.position.y = 2.5
  root.add(can)
  const skirt = new Group()
  skirt.add(solid(P.cyl(1.58, 1.58, 0.16, '#F6E6C6', { at: [0, -0.33, 0] }, 8), bag, 2))
  can.add(skirt)
  return { root, can, skirt }
}
