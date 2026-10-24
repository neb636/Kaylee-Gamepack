// Her chocolate milk and the cafe's things, as greybox toys in the house's look:
//   - The glass (hers, and Daddy's for his iced coffee): the drink inside is the mall cafe's liquid (mall-trip/games/
//     cafe/liquid.ts), stripes of milk and chocolate that melt into one as she stirs. Up to three ice cubes, and a
//     slot where a straw stands. The same glass stands on the rail post in the yard, where Khanom sneaks sips.
//   - On the tray: the milk jug (the mall cafe's), the chocolate squeeze bottle, a long spoon, three straws (pink,
//     purple, yellow), a bowl of ice and Daddy's coffee pot. The jug, the bottle and the pot are built round their
//     middles, so they tip round her finger; the spoon stands on its bowl, a straw on its bottom end.
import { Color, Group, Mesh, Vector3, type ShaderMaterial } from 'three'
import type { Bag } from '../../../engine/dispose'
import { merge, P, solid } from '../../../engine/geo'
import { PAL } from '../../../engine/toon'
import { liquidMaterial, mix, setFlat, setStripes } from '../../mall-trip/games/cafe/liquid'
import { buildItem, glass as glassMat } from '../../mall-trip/games/cafe/props'
import { GLASS, STRAW_COLORS, type StrawColor } from './layout'

const RIM = '#B9A6F5'
const SILVER = '#D8D2E6'
export const MILK_WHITE = new Color('#FFFFFF')
export const CHOC = new Color('#7A4326')
export const COFFEE = new Color('#5A3520')

export interface Glass {
  root: Group
  liquid: Mesh
  liquidMat: ShaderMaterial
  ice: Group[]
  /** Where a straw stands (a straw in it follows this). */
  slot: Group
}

export function buildGlass(bag: Bag): Glass {
  const root = new Group()
  const liquidMat = liquidMaterial(bag)
  // (Unit tall, standing on its bottom: scale.y fills it.)
  const liquid = new Mesh(bag.add(P.cyl(GLASS.r1 - 0.01, GLASS.r0 - 0.006, 1, '#fff', { at: [0, 0.5, 0] }, 20)), liquidMat)
  liquid.position.y = 0.016
  liquid.scale.y = 0.0001
  liquid.visible = false
  root.add(liquid)
  const ice = (
    [
      [-0.03, 0.05, 0.01, 0.3],
      [0.03, 0.1, -0.01, -0.4],
      [-0.005, 0.15, 0.02, 0.8],
    ] as const
  ).map(([x, y, z, r]) => {
    const g = new Group()
    g.add(solid(P.rbox(0.055, 0.055, 0.055, 0.014, '#DDF3FF', { rot: [r, r * 0.7, 0] }), bag, 1.2))
    g.position.set(x, y, z)
    g.visible = false
    root.add(g)
    return g
  })
  const slot = new Group()
  slot.position.set(0.02, 0.06, 0)
  slot.rotation.z = -0.22
  root.add(slot)
  root.add(solid(merge([P.torus(GLASS.r1, 0.009, RIM, { at: [0, GLASS.h, 0], rot: [Math.PI / 2, 0, 0] }), P.cyl(GLASS.r0 + 0.004, GLASS.r0 + 0.006, 0.02, RIM, { at: [0, 0.01, 0] }, 20)]), bag, 1.5))
  // A white shine down its front.
  root.add(solid(P.box(0.012, GLASS.h * 0.6, 0.004, '#FFFFFF', { at: [-0.045, GLASS.h * 0.55, GLASS.r1 - 0.004], rot: [0, 0, -0.05] }), bag, 0))
  const g = new Mesh(bag.add(P.cyl(GLASS.r1, GLASS.r0, GLASS.h, '#fff', { at: [0, GLASS.h / 2, 0] }, 20)), glassMat(bag, 0.42))
  g.renderOrder = 2
  root.add(g)
  return { root, liquid, liquidMat, ice, slot }
}

/** What's in a glass: milk, chocolate (stirred in or still in stripes), coffee and ice. */
export interface Drink {
  milk: number
  choc: number
  coffee: number
  /** 0: the chocolate is still in ribbons, 1: stirred in. */
  stir: number
  ice: number
}
export const fillOf = (d: Drink) => Math.min(1, d.milk + d.coffee + d.choc * 0.5)

const flat = new Color()
const base = new Color()
/** Shows a drink in its glass: how full, its color, the stripes until it's stirred, the ice. */
export function pourInto(g: Glass, d: Drink) {
  const fill = fillOf(d)
  g.liquid.visible = fill > 0.004
  g.liquid.scale.y = Math.max(0.0001, fill * GLASS.h * 0.92)
  mix([{ color: MILK_WHITE, w: d.milk }, { color: CHOC, w: d.choc * 2.5 }, { color: COFFEE, w: d.coffee }], flat)
  if (d.choc > 0.004 && d.milk + d.coffee > 0.02) {
    mix([{ color: MILK_WHITE, w: d.milk }, { color: COFFEE, w: d.coffee }], base)
    setStripes(g.liquidMat, [base, CHOC])
    g.liquidMat.uniforms.uFlat.value.copy(flat)
    g.liquidMat.uniforms.uMix.value = d.stir
  } else setFlat(g.liquidMat, flat)
  const top = fill * GLASS.h * 0.92
  g.ice.forEach((c, i) => {
    c.visible = i < d.ice
    // (Stacked on the bottom of an empty glass; floating near the top of a full one.)
    c.position.y = Math.max(0.035 + i * 0.05, top - 0.03 - i * 0.035)
  })
}

/** A straw in her color with white stripes, bent at the top, its bottom at the origin. */
export function buildStraw(bag: Bag, color: StrawColor) {
  const c = STRAW_COLORS[color]
  const g = new Group()
  g.add(solid(merge([...Array.from({ length: 7 }, (_, i) => P.cyl(0.012, 0.012, 0.06, i % 2 ? '#FFFFFF' : c, { at: [0, 0.03 + i * 0.06, 0] }, 10)), P.cyl(0.012, 0.012, 0.08, c, { at: [0.032, 0.445, 0], rot: [0, 0, -1.0] }, 10)]), bag, 1.5))
  return g
}
/** Where the top of a straw in a glass is, from the glass's foot (the trunk sneaks to it). */
export const STRAW_TOP = new Vector3(0.17, 0.49, 0)

export const milkJug = (bag: Bag) => buildItem('milk', bag)
/** The tip of the jug's (and the pot's) spout, from its middle. */
export const SPOUT = new Vector3(0.1, 0.085, 0)

/** The chocolate squeeze bottle: brown, a pink label, a white cap and nozzle on top (built round its middle). */
export function chocBottle(bag: Bag) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.cyl(0.055, 0.06, 0.2, '#6B3A22', {}, 18),
        P.cyl(0.057, 0.06, 0.07, PAL.pink, { at: [0, -0.01, 0] }, 18),
        P.sphere(0.022, '#6B3A22', { at: [0, -0.01, 0.055], scale: [1, 1, 0.4] }, 10),
        P.cyl(0.042, 0.05, 0.04, '#FFFFFF', { at: [0, 0.12, 0] }, 16),
        P.cone(0.022, 0.06, '#FFFFFF', { at: [0, 0.17, 0] }, 12),
      ]),
      bag,
      2,
    ),
  )
  return g
}
/** The tip of the bottle's nozzle, from its middle. */
export const NOZZLE = new Vector3(0, 0.2, 0)

/** A long silver spoon standing on its bowl, a pink knob on top. */
export function spoon(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.sphere(0.034, SILVER, { scale: [1.1, 0.45, 1.3] }, 12), P.cyl(0.009, 0.009, 0.42, SILVER, { at: [0, 0.22, 0] }, 8), P.sphere(0.022, PAL.hotpink, { at: [0, 0.44, 0] }, 10)]), bag, 1.5))
  return g
}
/** How high the spoon's knob is over its bowl (where she holds it). */
export const SPOON_KNOB = 0.44

/** A bowl of ice cubes. */
export function iceBowl(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.cyl(0.12, 0.085, 0.08, '#FFFFFF', { at: [0, 0.04, 0] }, 18), P.torus(0.12, 0.012, PAL.sky, { at: [0, 0.08, 0], rot: [Math.PI / 2, 0, 0] })]), bag, 2))
  g.add(solid(merge([[-0.04, 0.09, 0.01, 0.3], [0.04, 0.095, -0.02, -0.5], [0, 0.12, 0.03, 0.9]].map(([x, y, z, r]) => P.rbox(0.06, 0.06, 0.06, 0.015, '#DDF3FF', { at: [x, y, z], rot: [r, r, 0] }))), bag, 1.2))
  return g
}
/** One ice cube (carried to a glass). */
export const iceCube = (bag: Bag) => {
  const g = new Group()
  g.add(solid(P.rbox(0.06, 0.06, 0.06, 0.015, '#DDF3FF', { rot: [0.3, 0.4, 0] }), bag, 1.2))
  return g
}

/** Daddy's coffee pot: a glass carafe of dark coffee with a black lid, its spout on the right and handle on the left
 *  (built round its middle, like the milk jug). */
export function coffeePot(bag: Bag) {
  const g = new Group()
  g.add(
    solid(
      merge([
        P.cyl(0.07, 0.088, 0.17, '#5A3520', {}, 20),
        P.cyl(0.074, 0.076, 0.05, '#3B3148', { at: [0, 0.09, 0] }, 20),
        P.sphere(0.026, '#3B3148', { at: [0, 0.125, 0] }, 10),
        P.cone(0.03, 0.05, '#3B3148', { at: [0.08, 0.075, 0], rot: [0, 0, -Math.PI / 2 - 0.4], scale: [1, 1, 0.6] }, 10),
        P.torus(0.045, 0.014, '#3B3148', { at: [-0.095, 0, 0] }),
      ]),
      bag,
      2,
    ),
  )
  return g
}

/** The little bell on the counter (ding!). */
export function counterBell(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([P.cyl(0.07, 0.075, 0.02, '#8E7AC8', { at: [0, 0.01, 0] }, 16), P.sphere(0.055, PAL.gold, { at: [0, 0.02, 0], scale: [1, 0.85, 1] }, 16), P.sphere(0.014, PAL.gold, { at: [0, 0.075, 0] }, 8)]), bag, 1.5))
  return g
}
