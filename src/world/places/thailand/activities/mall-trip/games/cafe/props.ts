// The cafe's props as toys in the house's look: the blender (its base with the big pink button, the glass jar with
// the drink inside, the lid), the cups, the fruit and the toppings. Greybox: shapes only.
//   - The jar's group is at its middle, so she holds it there and it tilts round her finger; the spout is on its
//     right (the cups are to the right), the handle on its left.
//   - A liquid is a unit-tall cylinder standing on the bottom, scaled up as it fills (liquid.ts draws it).
import { BufferGeometry, Color, Float32BufferAttribute, Group, LatheGeometry, Mesh, MeshBasicMaterial, Vector2, type ShaderMaterial } from 'three'
import type { Bag } from '../../../../../../engine3d/dispose'
import { bake, merge, P, solid } from '../../../../../../engine3d/geo'
import { PAL } from '../../../../../../engine3d/toon'
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

const lerpC = (a: string, b: string, k: number, out = new Color()) => out.set(a).lerp(new Color(b), Math.min(1, Math.max(0, k)))
const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

/** Colors a baked part per vertex (a gradient or blush across a fruit's skin), from where each vertex is. */
function paint(g: BufferGeometry, fn: (x: number, y: number, z: number, out: Color) => void) {
  const pos = g.attributes.position
  const col = g.attributes.color
  const c = new Color()
  for (let i = 0; i < pos.count; i++) {
    fn(pos.getX(i), pos.getY(i), pos.getZ(i), c)
    col.setXYZ(i, c.r, c.g, c.b)
  }
  return g
}

/**
 * A smooth round fruit body spun round the vertical (y from 0 to `h`): `r(t)` is its radius at t = 0..1 up the body,
 * `squashZ` flattens it front to back, `bend` curves its middle sideways. The seam is at the back.
 */
function body(h: number, r: (t: number) => number, squashZ = 1, bend = 0, rows = 28): BufferGeometry {
  const pts = Array.from({ length: rows + 1 }, (_, i) => new Vector2(Math.max(0.0005, r(i / rows)), (i / rows) * h))
  const g = new LatheGeometry(pts, 36, Math.PI, Math.PI * 2)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i) / h
    pos.setXYZ(i, pos.getX(i) + bend * Math.sin(Math.PI * t), pos.getY(i), pos.getZ(i) * squashZ)
  }
  g.computeVertexNormals()
  return g
}

/** A smooth tube along a curve in the x-y plane with a rounded five-ridge cross section (a banana), closed at both ends. */
function tube(path: (t: number) => [number, number], radius: (t: number) => number, rings: number, sides: number, flatZ: number): BufferGeometry {
  const pos: number[] = []
  const idx: number[] = []
  for (let i = 0; i <= rings; i++) {
    const t = i / rings
    const [cx, cy] = path(t)
    const [ax, ay] = path(Math.min(1, t + 0.002))
    const [bx, by] = path(Math.max(0, t - 0.002))
    const l = Math.hypot(ax - bx, ay - by) || 1
    const nx = -(ay - by) / l
    const ny = (ax - bx) / l
    for (let j = 0; j < sides; j++) {
      const th = (j / sides) * Math.PI * 2
      const rr = radius(t) * (1 + 0.07 * Math.cos(5 * th))
      pos.push(cx + nx * Math.cos(th) * rr, cy + ny * Math.cos(th) * rr, Math.sin(th) * rr * flatZ)
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j
      const b = i * sides + ((j + 1) % sides)
      idx.push(a, b, a + sides, b, b + sides, a + sides)
    }
  }
  // Caps: a centre point on each end.
  for (const [i, flip] of [[0, true], [rings, false]] as const) {
    const [cx, cy] = path(i / rings)
    const c = pos.length / 3
    pos.push(cx, cy, 0)
    for (let j = 0; j < sides; j++) {
      const a = i * sides + j
      const b = i * sides + ((j + 1) % sides)
      idx.push(c, ...(flip ? [a, b] : [b, a]))
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/** A thing on the tray (or a chunk in the jar), standing on the origin, about `size` tall. */
export function buildItem(id: ItemId, bag: Bag): Group {
  const g = new Group()
  const one = (parts: Parameters<typeof merge>[0], px = 2) => g.add(solid(merge(parts), bag, px))
  switch (id) {
    case 'mango': {
      // A plump, slightly curved mango lying on its side: golden with a red blush on the cheek facing her, green
      // towards the stem, a little brown stem and a leaf. Built upright, then laid down.
      const H = 0.27
      const geo = bake(body(H, (t) => 0.175 * Math.pow(t, 0.55) * Math.pow(1 - Math.pow(t, 2.6), 0.5), 0.84, 0.03), '#FFC233')
      paint(geo, (x, y, z, c) => {
        const t = y / H
        lerpC('#FFD24A', '#FF9A2E', smooth(0.1, 0.7, t), c)
        lerpC('#' + c.getHexString(), '#FF5C3A', smooth(0.0, 0.085, z) * (0.3 + 0.7 * smooth(0.15, 0.75, t)) * (0.55 + 0.45 * smooth(-0.1, 0.05, x)), c)
        lerpC('#' + c.getHexString(), '#9ED14E', smooth(0.82, 0.99, t) * 0.9, c)
      })
      const sub = new Group()
      const inner = new Group()
      sub.add(inner)
      inner.position.y = -H / 2
      inner.add(solid(merge([geo, P.cyl(0.011, 0.015, 0.04, '#7A5A2A', { at: [0.005, H + 0.012, 0], rot: [0, 0, -0.15] }, 8), P.sphere(0.04, '#5FB95F', { at: [0.045, H + 0.03, 0], scale: [1.9, 0.4, 0.8], rot: [0, 0, -0.45] }, 10)]), bag, 2))
      inner.add(solid(merge([P.sphere(0.022, '#FFF3C0', { at: [0.07, 0.17, 0.085], scale: [0.8, 1.7, 0.3], rot: [0, 0, 0.3] }, 8)]), bag, 0))
      sub.position.set(0.0, 0.11, 0)
      sub.rotation.z = 1.3
      g.add(sub)
      break
    }
    case 'strawberry': {
      // A plump strawberry: wide shoulders and a rounded point, deep red with a paler tip, yellow seeds set in all
      // over the front, a star of green leaves on top.
      const H = 0.235
      const R = (t: number) => 0.165 * Math.pow(t, 0.6) * Math.sqrt(Math.max(0, 1 - Math.pow(t, 3.5)))
      const geo = bake(body(H, R, 0.94), '#FF3B5C')
      paint(geo, (_x, y, _z, c) => {
        const t = y / H
        lerpC('#FF6F86', '#EF2B4E', smooth(0.0, 0.45, t), c)
        lerpC('#' + c.getHexString(), '#FFB3B0', smooth(0.9, 1.0, t) * 0.8, c)
      })
      const seeds: ReturnType<typeof P.sphere>[] = []
      for (let row = 0; row < 7; row++) {
        const t = 0.12 + row * 0.12
        const r = R(t) * 0.94
        const n = Math.max(3, Math.round(r * 62))
        for (let k = 0; k < n; k++) {
          const a = ((k + (row % 2) * 0.5) / n - 0.5) * 2.5
          seeds.push(P.sphere(0.0105, '#FFE58A', { at: [Math.sin(a) * R(t), t * H, Math.cos(a) * r * 0.99], rot: [0, a, 0], scale: [0.8, 1.3, 0.5] }, 6))
        }
      }
      const leaves = [0, 1, 2, 3, 4, 5, 6].map((i) => {
        const a = (i / 7) * Math.PI * 2
        return P.sphere(0.05, '#4CBF7F', { at: [Math.cos(a) * 0.065, H - 0.005, Math.sin(a) * 0.065], scale: [1.7, 0.3, 0.7], rot: [0, -a, 0.3 + (i % 2) * 0.25] }, 8)
      })
      one([geo, ...leaves, P.cyl(0.012, 0.014, 0.05, '#3FA36B', { at: [0, H + 0.02, 0], rot: [0, 0, 0.15] }, 8)])
      g.add(solid(merge(seeds), bag, 0))
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
      // One smooth curved banana with five soft ridges: a green-brown stem on the left, golden yellow, a brown tip.
      const arcR = 0.2
      const span = 0.95
      const path = (t: number): [number, number] => {
        const a = -span + t * span * 2
        return [Math.sin(a) * arcR, 0.25 - Math.cos(a) * arcR]
      }
      const radius = (t: number) => 0.012 + 0.034 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 0.1) / 0.85))), 0.65)
      const geo = bake(tube(path, radius, 40, 15, 0.9), '#FFD83D')
      paint(geo, (x, y, z, c) => {
        const t = (Math.atan2(x, 0.25 - y) + span) / (span * 2)
        lerpC('#FFD83D', '#FFEE88', smooth(0.0, 0.03, z) * 0.55, c)
        lerpC('#' + c.getHexString(), '#9AA23A', 1 - smooth(0.08, 0.22, t), c)
        lerpC('#' + c.getHexString(), '#5A3B22', smooth(0.94, 0.985, t), c)
      })
      one([geo])
      break
    }
    case 'coconut': {
      // A hairy brown coconut with mottled husk and its three dark "eyes" looking at her.
      const geo = P.sphere(0.115, '#8A5A3A', { at: [0, 0.115, 0] }, 30)
      paint(geo, (x, y, z, c) => {
        const n = Math.sin(x * 70 + y * 20) * Math.sin(y * 65 - z * 30) + Math.sin(z * 80 + x * 40) * 0.5
        lerpC('#7A4A2C', '#A9764A', 0.5 + n * 0.35, c)
      })
      one([geo, ...[[-0.032, 0.15], [0.032, 0.15], [0, 0.108]].map(([x, y]) => P.sphere(0.022, '#2E1A10', { at: [x, y, Math.sqrt(0.115 * 0.115 - x * x - (y - 0.115) ** 2)], scale: [1, 1, 0.5] }, 10))])
      break
    }
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
