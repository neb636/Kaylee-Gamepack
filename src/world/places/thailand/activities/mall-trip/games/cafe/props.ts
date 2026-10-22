// The cafe's props as toys in the house's look: the blender (its base with the big pink button, the glass jar with
// the drink inside, the lid), the cups, the fruit and the toppings. Greybox: shapes only.
//   - The jar's group is at its middle, so she holds it there and it tilts round her finger; the spout is on its
//     right (the cups are to the right), the handle on its left.
//   - A liquid is a unit-tall cylinder standing on the bottom, scaled up as it fills (liquid.ts draws it).
import { Group, LatheGeometry, Mesh, MeshBasicMaterial, Vector2, type ShaderMaterial } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { bake, merge, P, solid, type PartOpts } from '../../../../engine/geo'
import { PAL } from '../../../../engine/toon'
import { BASE_H, CUP, JAR, type ItemId } from './layout'
import { liquidMaterial } from './liquid'

const GLASS = '#E4F6FF'
const RIM = '#B9A6F5'

/** See-through glass (drawn after what's inside it). */
export function glass(bag: Bag, opacity = 0.32) {
  return bag.add(new MeshBasicMaterial({ color: GLASS, transparent: true, opacity, depthWrite: false }))
}

export interface Blender {
  /** On the counter. */
  base: Group
  /** The big pink button (pushed in when pressed: position.z). */
  button: Group
  /** The jar: at its middle (it rests on the base, and tilts round this point when she pours). */
  jar: Group
  /** Inside the jar: the drink (scale.y = how full) and its material. */
  liquid: Mesh
  liquidMat: ShaderMaterial
  /** The blades at the bottom (they spin). */
  blades: Group
  /** The fruit chunks waiting to be blended. */
  chunks: Group
  lid: Group
}

/** The inner height a jar's liquid fills. */
export const JAR_FILL_H = JAR.h * 0.86

export function buildBlender(bag: Bag): Blender {
  const base = new Group()
  base.add(solid(merge([
    P.rbox(0.32, BASE_H, 0.3, 0.06, PAL.lavenderDark, { at: [0, BASE_H / 2, 0] }),
    P.cyl(0.12, 0.13, 0.03, '#FFFFFF', { at: [0, BASE_H + 0.012, 0] }, 24),
    // Little rubber feet and a white stripe round it.
    ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => P.sphere(0.025, PAL.ink, { at: [sx * 0.12, 0.01, sz * 0.11] }))),
    P.box(0.322, 0.025, 0.302, '#FFFFFF', { at: [0, BASE_H * 0.78, 0] }),
  ]), bag, 2))
  // The big pink button on the front, with a ring round it.
  base.add(solid(merge([P.torus(0.062, 0.012, '#FFFFFF', { at: [0, BASE_H * 0.42, 0.151] })]), bag, 1.5))
  const button = new Group()
  button.position.set(0, BASE_H * 0.42, 0.15)
  button.add(solid(merge([P.cyl(0.055, 0.058, 0.04, PAL.hotpink, { rot: [Math.PI / 2, 0, 0], at: [0, 0, 0.012] }, 24), P.sphere(0.02, '#FFC9E3', { at: [-0.018, 0.018, 0.034], scale: [1, 1, 0.4] })]), bag, 2))
  base.add(button)

  // ---- The jar ----
  const jar = new Group()
  const y0 = -JAR.h / 2
  const liquidMat = liquidMaterial(bag)
  // (Unit tall, standing on its bottom: scale.y fills it. Slightly narrower than the glass.)
  const liquid = new Mesh(bag.add(P.cyl(JAR.r1 - 0.012, JAR.r0 - 0.008, 1, '#fff', { at: [0, 0.5, 0] }, 24)), liquidMat)
  liquid.position.y = y0 + 0.035
  liquid.scale.y = 0.0001
  liquid.visible = false
  jar.add(liquid)
  const blades = new Group()
  blades.position.y = y0 + 0.045
  blades.add(solid(merge([P.box(0.13, 0.008, 0.03, '#D8D2E6', { rot: [0.4, 0, 0] }), P.box(0.03, 0.008, 0.13, '#D8D2E6', { rot: [0, 0, 0.4] }), P.cyl(0.015, 0.015, 0.03, '#A9A2C2', {})]), bag, 1))
  jar.add(blades)
  const chunks = new Group()
  chunks.position.y = y0 + 0.04
  jar.add(chunks)
  // The collar it stands on, the rim and the handle (outlined), then the see-through glass over everything inside.
  jar.add(solid(merge([
    P.cyl(JAR.r0 + 0.012, JAR.r0 + 0.02, 0.05, RIM, { at: [0, y0 + 0.02, 0] }, 24),
    P.torus(JAR.r1, 0.011, RIM, { at: [0, -y0, 0], rot: [Math.PI / 2, 0, 0] }),
    // The spout: a little lip on the right of the rim.
    P.cone(0.04, 0.06, RIM, { at: [JAR.r1 + 0.012, -y0 - 0.008, 0], rot: [0, 0, -Math.PI / 2 - 0.35], scale: [1, 1, 0.55] }, 12),
    // The handle on the left.
    P.capsule(0.022, 0.2, RIM, { at: [-JAR.r1 - 0.06, 0.01, 0] }),
    P.box(0.07, 0.035, 0.035, RIM, { at: [-JAR.r1 - 0.025, 0.12, 0] }),
    P.box(0.07, 0.035, 0.035, RIM, { at: [-JAR.r0 - 0.04, -0.1, 0] }),
    // Measuring marks up its side.
    ...[0.25, 0.5, 0.75].map((k) => P.box(0.035, 0.008, 0.006, RIM, { at: [JAR.r0 + (JAR.r1 - JAR.r0) * k - 0.02, y0 + JAR.h * k, 0.115 + k * 0.03] })),
  ]), bag, 2))
  const glassMesh = new Mesh(bag.add(P.cyl(JAR.r1, JAR.r0, JAR.h, '#fff', {}, 28)), glass(bag))
  glassMesh.renderOrder = 2
  jar.add(glassMesh)

  // ---- The lid: a pink cap with a knob ----
  const lid = new Group()
  lid.add(solid(merge([P.cyl(JAR.r1 + 0.012, JAR.r1 + 0.012, 0.035, PAL.pink, { at: [0, 0.018, 0] }, 24), P.cyl(0.04, 0.05, 0.035, PAL.hotpink, { at: [0, 0.05, 0] }, 16), P.sphere(0.035, PAL.hotpink, { at: [0, 0.07, 0] })]), bag, 2))
  return { base, button, jar, liquid, liquidMat, blades, chunks, lid }
}

export interface Cup {
  root: Group
  liquid: Mesh
  liquidMat: ShaderMaterial
  ice: Group
  cream: Group
  straw: Group
}

/** A tall cup on the counter: the drink inside, ice cubes (cha yen), the whipped cream and the straw (hidden). */
export function buildCup(bag: Bag): Cup {
  const root = new Group()
  const liquidMat = liquidMaterial(bag)
  const liquid = new Mesh(bag.add(P.cyl(CUP.r1 - 0.01, CUP.r0 - 0.006, 1, '#fff', { at: [0, 0.5, 0] }, 20)), liquidMat)
  liquid.position.y = 0.018
  liquid.scale.y = 0.0001
  liquid.visible = false
  root.add(liquid)
  const ice = new Group()
  ice.add(solid(merge([[-0.025, 0.05, 0.01, 0.3], [0.028, 0.08, -0.01, -0.4], [-0.01, 0.12, 0.02, 0.8]].map(([x, y, z, r]) => P.rbox(0.05, 0.05, 0.05, 0.012, '#DDF3FF', { at: [x, y, z], rot: [r, r * 0.7, 0] }))), bag, 1.2))
  ice.visible = false
  root.add(ice)
  // Whipped cream: a swirl of three puffs and a pink sprinkle on top.
  const cream = new Group()
  cream.position.y = CUP.h
  cream.add(solid(merge([P.sphere(0.085, '#FFFDF8', { at: [0, 0.02, 0], scale: [1, 0.6, 1] }), P.sphere(0.06, '#FFFDF8', { at: [0, 0.07, 0], scale: [1, 0.75, 1] }), P.cone(0.04, 0.07, '#FFFDF8', { at: [0, 0.13, 0] }), P.sphere(0.02, PAL.hotpink, { at: [0.02, 0.17, 0.01] })]), bag, 1.5))
  cream.visible = false
  root.add(cream)
  const straw = buildStraw(bag)
  straw.position.set(0.02, CUP.h * 0.35, 0)
  straw.rotation.z = -0.22
  straw.visible = false
  root.add(straw)
  root.add(solid(merge([P.torus(CUP.r1, 0.008, RIM, { at: [0, CUP.h, 0], rot: [Math.PI / 2, 0, 0] }), P.cyl(CUP.r0 + 0.004, CUP.r0 + 0.006, 0.018, RIM, { at: [0, 0.009, 0] }, 20)]), bag, 1.5))
  // A white shine down its front.
  root.add(solid(merge([P.box(0.012, CUP.h * 0.6, 0.004, '#FFFFFF', { at: [-0.04, CUP.h * 0.55, CUP.r1 - 0.004], rot: [0, 0, -0.05] })]), bag, 0))
  const g = new Mesh(bag.add(P.cyl(CUP.r1, CUP.r0, CUP.h, '#fff', { at: [0, CUP.h / 2, 0] }, 20)), glass(bag, 0.42))
  g.renderOrder = 2
  root.add(g)
  return { root, liquid, liquidMat, ice, cream, straw }
}

/** A pink-and-white striped straw, its bottom at the origin. */
export function buildStraw(bag: Bag) {
  const g = new Group()
  g.add(solid(merge([...Array.from({ length: 6 }, (_, i) => P.cyl(0.011, 0.011, 0.06, i % 2 ? '#FFFFFF' : PAL.hotpink, { at: [0, 0.03 + i * 0.06, 0] }, 10)), P.cyl(0.011, 0.011, 0.07, PAL.hotpink, { at: [0.03, 0.38, 0], rot: [0, 0, -1.0] }, 10)]), bag, 1.5))
  return g
}

/** A round-bodied part: `profile` is [radius, height] from the bottom up, spun round the vertical. */
function lathe(profile: [number, number][], c: string, o?: PartOpts) {
  return bake(new LatheGeometry(profile.map(([r, y]) => new Vector2(r, y)), 20), c, o)
}

/** A thing on the tray (or a chunk in the jar), standing on the origin, about `size` tall. */
export function buildItem(id: ItemId, bag: Bag): Group {
  const g = new Group()
  const one = (parts: Parameters<typeof merge>[0], px = 2) => g.add(solid(merge(parts), bag, px))
  switch (id) {
    case 'mango':
      // A plump kidney-shaped mango: orange-yellow with a red blush on one cheek, a stem and a leaf.
      one([
        P.sphere(0.11, '#FFB52E', { at: [0, 0.105, 0], scale: [1.25, 1, 0.9], rot: [0, 0, 0.3] }, 20),
        P.sphere(0.055, '#FF7A45', { at: [0.05, 0.1, 0.085], scale: [1, 1.1, 0.38], rot: [0, 0, 0.3] }, 12),
        P.cyl(0.012, 0.015, 0.035, '#7A5A2A', { at: [-0.1, 0.19, 0], rot: [0, 0, 0.6] }, 8),
        P.sphere(0.04, '#6CC36A', { at: [-0.13, 0.22, 0], scale: [1.8, 0.45, 0.8], rot: [0, 0, 0.5] }),
      ])
      g.add(solid(merge([P.sphere(0.02, '#FFE9A8', { at: [0.1, 0.15, 0.07], scale: [1.6, 0.8, 0.3], rot: [0, 0, 0.5] })]), bag, 0))
      break
    case 'strawberry': {
      // A plump heart-shaped strawberry: wide shoulders, a rounded point, little seeds all over, a leafy green cap.
      one([
        lathe([[0, 0], [0.025, 0.012], [0.06, 0.05], [0.095, 0.1], [0.11, 0.155], [0.1, 0.2], [0.06, 0.225], [0, 0.23]], '#FF3F5F', { at: [0, 0, 0] }),
        ...[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const a = (i / 7) * Math.PI * 2
          return P.sphere(0.045, '#4CBF7F', { at: [Math.cos(a) * 0.065, 0.225, Math.sin(a) * 0.065], scale: [1.6, 0.35, 0.8], rot: [0, -a, 0.35 + (i % 2) * 0.2] }, 8)
        }),
        P.cyl(0.012, 0.014, 0.05, '#4CBF7F', { at: [0, 0.255, 0], rot: [0, 0, 0.15] }, 8),
      ])
      const seeds: [number, number][] = [[-0.05, 0.19], [0.0, 0.2], [0.05, 0.19], [-0.07, 0.14], [-0.02, 0.15], [0.03, 0.14], [0.07, 0.13], [-0.04, 0.09], [0.01, 0.09], [0.05, 0.07], [-0.01, 0.045]]
      g.add(solid(merge(seeds.map(([x, y]) => P.sphere(0.011, '#FFE58A', { at: [x, y, Math.sqrt(Math.max(0.0004, 0.115 * 0.115 - x * x)) * (y > 0.05 ? 0.95 : 0.6)], scale: [0.8, 1.2, 0.5] }, 6))), bag, 0))
      break
    }
    case 'watermelon': {
      // A half-moon slice: green rind, a white band, a juicy red middle and black seeds.
      const arc = (r: number, flatY: number): [number, number][] => Array.from({ length: 17 }, (_, i) => [Math.cos(Math.PI + (i / 16) * Math.PI) * r, Math.sin(Math.PI + (i / 16) * Math.PI) * r * 0.95 + flatY])
      one([
        P.prism(arc(0.17, 0.2), 0.07, '#4CB868', { at: [0, 0, 0] }),
        P.prism(arc(0.15, 0.2), 0.074, '#F4FBE8', { at: [0, 0, 0] }),
        P.prism(arc(0.133, 0.2), 0.078, '#FF4B5C', { at: [0, 0, 0] }),
      ])
      for (const [x, y, r] of [[-0.06, 0.1, 0.3], [0.06, 0.1, -0.3], [0, 0.06, 0], [-0.08, 0.15, 0.5], [0.08, 0.15, -0.5], [0, 0.14, 0]]) g.add(solid(merge([P.sphere(0.013, PAL.ink, { at: [x, y, 0.04], scale: [0.6, 1.1, 0.4], rot: [0, 0, r] }, 8)]), bag, 0))
      break
    }
    case 'banana': {
      // A real curve: fat in the middle, narrowing to a brown tip at one end and a green-brown stem at the other.
      const parts = []
      const N = 11
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1)
        const a = -0.95 + t * 1.9
        const r = 0.19
        const w = 0.04 * Math.sin(Math.PI * (0.1 + t * 0.8)) + 0.012
        parts.push(P.sphere(w, '#FFE15C', { at: [Math.sin(a) * r, 0.19 - Math.cos(a) * r + 0.06, 0], scale: [1.25, 1.25, 1] }, 10))
      }
      parts.push(P.sphere(0.018, '#6B4A2A', { at: [Math.sin(0.95) * 0.19 + 0.01, 0.19 - Math.cos(0.95) * 0.19 + 0.075, 0] }, 8))
      parts.push(P.cyl(0.014, 0.02, 0.05, '#8A8A3A', { at: [-Math.sin(0.95) * 0.19 - 0.015, 0.19 - Math.cos(0.95) * 0.19 + 0.08, 0], rot: [0, 0, 0.9] }, 8))
      one(parts)
      g.add(solid(merge([P.box(0.1, 0.008, 0.006, '#E5C23E', { at: [0, 0.055, 0.038] })]), bag, 0))
      break
    }
    case 'coconut':
      // A hairy brown coconut with its three dark "eyes" and a few lighter fibres.
      one([
        P.sphere(0.115, '#8A5A3A', { at: [0, 0.115, 0] }, 20),
        P.sphere(0.06, '#A97A54', { at: [-0.04, 0.16, 0.07], scale: [1.2, 0.8, 0.6] }, 8),
        ...[[-0.04, 0.17], [0.04, 0.17], [0, 0.125]].map(([x, y]) => P.sphere(0.017, '#3B2418', { at: [x, y, 0.105 - Math.abs(x) * 0.2], scale: [1, 1, 0.5] }, 8)),
      ])
      break
    case 'tea':
      // A bag of Thai tea: orange, folded over at the top, with a leaf on it.
      one([P.rbox(0.15, 0.2, 0.08, 0.02, '#F07F22', { at: [0, 0.1, 0] }), P.rbox(0.16, 0.035, 0.085, 0.012, '#C85A12', { at: [0, 0.2, 0] }), P.sphere(0.035, '#5FC98F', { at: [0, 0.1, 0.042], scale: [0.6, 1.2, 0.2], rot: [0, 0, 0.5] })])
      break
    case 'ice':
      one([[-0.05, 0.035, 0, 0.2], [0.05, 0.035, 0.01, -0.3], [0, 0.1, 0, 0.6]].map(([x, y, z, r]) => P.rbox(0.075, 0.075, 0.075, 0.018, '#D8F1FF', { at: [x, y, z], rot: [r, r, 0] })), 1.5)
      break
    case 'milk':
      // A little milk jug: white, a pink band, a spout on the right and a handle on the left (built round its middle).
      one([P.cyl(0.07, 0.085, 0.17, '#FFFFFF', {}, 20), P.cyl(0.072, 0.077, 0.04, PAL.pink, { at: [0, 0.01, 0] }, 20), P.cone(0.03, 0.05, '#FFFFFF', { at: [0.08, 0.075, 0], rot: [0, 0, -Math.PI / 2 - 0.4], scale: [1, 1, 0.6] }, 10), P.torus(0.045, 0.014, '#FFFFFF', { at: [-0.095, 0.0, 0] })])
      break
    case 'cream':
      // A can of whipped cream: its nozzle at the bottom when she squirts it, so it's built nozzle-down at the origin.
      one([P.cyl(0.055, 0.055, 0.2, '#FFFFFF', { at: [0, 0.16, 0] }, 18), P.cyl(0.056, 0.056, 0.05, PAL.hotpink, { at: [0, 0.2, 0] }, 18), P.cone(0.04, 0.06, '#D8D2E6', { at: [0, 0.03, 0], rot: [Math.PI, 0, 0] }, 12), P.sphere(0.05, '#D8D2E6', { at: [0, 0.27, 0], scale: [1, 0.5, 1] })])
      break
    case 'straw':
      g.add(buildStraw(bag))
      break
  }
  return g
}

/** The straw cup on the tray: a pot with a bunch of straws in it. */
export function buildStrawPot(bag: Bag): Group {
  const g = new Group()
  g.add(solid(merge([P.cyl(0.07, 0.06, 0.13, PAL.mint, { at: [0, 0.065, 0] }, 18)]), bag, 2))
  for (const [x, r] of [[-0.03, 0.18], [0, -0.05], [0.03, -0.22]]) {
    const s = buildStraw(bag)
    s.position.set(x, 0.05, 0)
    s.rotation.z = r
    s.scale.setScalar(0.8)
    g.add(s)
  }
  return g
}
