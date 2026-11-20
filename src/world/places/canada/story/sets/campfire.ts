// The campsite at night, as a film set (story/films/campfire.ts): the same campsite as the game (activities/campfire/,
// painted layers in 2D), built small in the toon look. A clearing of dirt with the campfire in the middle (a ring of
// stones, crossed logs, flickering flames that need no light to show, a warm glow on the ground and a warm light that
// reaches the faces round it), Maple's log on its left with her pink bag of marshmallows, the bush behind it where a
// little grey paw lives, the pink tent glowing inside, and a ring of tall dark spruces and red maples under the moon
// and the stars.
//
// The usual camera stands on +z looking toward -z (the fire at the middle, the tent back right, the bush back left).
// `CAMP` has the marks: the fire, Maple's spot on the log, the bag, the bush, the tent.
import { AdditiveBlending, Euler, Group, Quaternion, Vector3, Mesh, MeshBasicMaterial, PlaneGeometry, PointLight, Sprite, SpriteMaterial, type Object3D, type Texture } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { blobShadow, merge, P, solid, type V3 } from '../../../../engine3d/geo'
import { radialAlpha, softTexture } from '../../../../engine3d/softTexture'
import { CANADA_COLORS as C } from '../../characters/looks'
import type { FilmSet } from '../stage'

/** Where things are on the set (meters). */
export const CAMP = {
  fire: [0, 0, 0] as V3,
  /** Maple stands on her log, left of the fire (the top of the log is 0.32 up). */
  maple: [-1.42, 0.3, 0.05] as V3,
  /** The bag of marshmallows on the log, between Maple and the fire. */
  bag: [-0.86, 0.32, 0.02] as V3,
  /** The dark bush behind the log, where the little grey paw comes from (and the eyes shine). */
  bush: [-0.95, 0, -0.95] as V3,
  /** Where the eyes shine in the bush (its right side, clear of Maple). */
  eyes: [-0.6, 0.7, -0.5] as V3,
  tent: [2.15, 0, -1.9] as V3,
  /** Round the fire for the film out (Maple on her log): Roxy right of the fire, a little back, and her three kits in
   *  a row in front of her ([x, z, facing degrees]), clear of the flames, so the fire lights their faces. */
  ring: { roxy: [0.85, 0, -0.55] as V3, kits: [[0.72, 0.72, -12], [1.3, 0.92, -18], [1.88, 0.6, -24]] as V3[] },
}

const WOOD = '#8A5A3A'
const WOOD_DARK = '#6E4428'
const WOOD_END = '#D9A46E'
const STONE = ['#8C8798', '#A7A2B3', '#77728A']
const SPRUCE = ['#2C4F5C', '#355C66', '#2A4652']
const MAPLE_LEAVES = ['#C8423A', '#E2603F', '#EE8A3E']
const MALLOW = '#FFF7F0'

export interface CampSet {
  /** The marshmallows in the bag, in the order the paw takes them. */
  mallows: Mesh[]
  /** The bag itself (on the log). */
  bag: Group
  /** The little grey paw: `reach` 0 (hidden in the bush) .. 1 (at the bag). Its `hand` carries what it takes. */
  paw: { root: Group; slide: Group; hand: Group; reach: number }
  /** Two shining eyes in the bush (hidden until a film shows them), and how open they are (0 shut .. 1). */
  eyes: { root: Group; open: number }
  /** How much a tap of wind fans the fire up, 0..1 (it settles by itself). */
  flare: number
  fire: { flames: Group; light: PointLight; glow: Sprite; pool: Mesh }
  tent: Group
}

// ---------------------------------------------------------------- pieces

let glowTex: Texture | null = null
/** A soft warm round glow (white in the middle, fading out): tint it with the material's color. */
function glowTexture(bag: Bag) {
  glowTex ??= softTexture(64, 64, [255, 255, 255], (x, y) => radialAlpha(Math.hypot(x - 32, y - 32), 32, [[0, 1], [0.35, 0.5], [1, 0]]))
  bag.add({ dispose: () => ((glowTex as Texture | null)?.dispose(), (glowTex = null)) })
  return glowTex
}

/** Unlit parts (flames, the glow in the tent, the moon): they show at night without any light. */
function unlit(parts: ReturnType<typeof P.box>[], bag: Bag, opts: { opacity?: number; fog?: boolean } = {}) {
  const mat = bag.add(new MeshBasicMaterial({ vertexColors: true, transparent: opts.opacity !== undefined, opacity: opts.opacity ?? 1, fog: opts.fog ?? true }))
  return new Mesh(bag.add(merge(parts)), mat)
}

/** A spruce: four stacked cones on a short trunk, `h` tall. */
function spruce(h: number, i: number) {
  const col = SPRUCE[i % SPRUCE.length]
  const parts = [P.cyl(0.09 * h * 0.4, 0.12 * h * 0.4, h * 0.2, '#4A3328', { at: [0, h * 0.1, 0] }, 8)]
  for (let k = 0; k < 4; k++) {
    const r = h * (0.3 - k * 0.055)
    const ch = h * 0.36
    parts.push(P.cone(r, ch, col, { at: [0, h * 0.2 + k * h * 0.19 + ch / 2, 0] }, 10))
  }
  return parts
}

/** A red maple in the fall: a trunk and a round crown of leaf balls in reds and oranges, `h` tall. */
function mapleTree(h: number, i: number) {
  const parts = [P.cyl(0.07 * h * 0.5, 0.1 * h * 0.5, h * 0.55, '#5A3A2A', { at: [0, h * 0.27, 0] }, 8)]
  const balls: [number, number, number, number][] = [
    [0, 0.68, 0, 0.3],
    [-0.2, 0.6, 0.06, 0.22],
    [0.21, 0.62, -0.04, 0.23],
    [0.04, 0.86, 0.02, 0.22],
    [-0.1, 0.78, -0.16, 0.2],
  ]
  balls.forEach(([x, y, z, r], k) => parts.push(P.sphere(r * h, MAPLE_LEAVES[(i + k) % 3], { at: [x * h, y * h, z * h] }, 12)))
  return parts
}

/** The fire's stones and logs (lit), round its middle at (0, 0, 0). */
function firePit() {
  const parts = []
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2
    parts.push(P.sphere(0.11 + (i % 3) * 0.015, STONE[i % 3], { at: [Math.cos(a) * 0.46, 0.07, Math.sin(a) * 0.46], scale: [1.2, 0.75, 1] }, 10))
  }
  // Crossed logs, their ends pale.
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI + 0.3
    parts.push(P.cyl(0.06, 0.06, 0.7, WOOD, { at: [0, 0.1 + i * 0.02, 0], rot: [Math.PI / 2, a, 0], order: 'YXZ' }, 8))
  }
  // Embers in the middle.
  parts.push(P.cyl(0.3, 0.34, 0.04, '#5A3030', { at: [0, 0.02, 0] }, 16))
  return parts
}

/** Cartoon flames: three teardrops in flat bands (red-orange outside, orange, a pale gold core) and two little side
 *  tongues, unlit so they glow in the dark. Its base is at (0, 0, 0). */
function flames(bag: Bag) {
  const g = new Group()
  const drop = (r: number, h: number, col: string, at: V3) => [P.sphere(r, col, { at, scale: [1, 0.8, 1] }, 12), P.cone(r * 0.98, h, col, { at: [at[0], at[1] + h / 2, at[2]] }, 12)]
  const layers: [number, number, string, V3][] = [
    [0.27, 0.62, '#FF6A3A', [0, 0.2, 0]],
    [0.12, 0.34, '#FF6A3A', [-0.2, 0.14, 0.04]],
    [0.11, 0.3, '#FF6A3A', [0.21, 0.13, -0.02]],
    [0.19, 0.44, '#FFA640', [0, 0.2, 0.06]],
    [0.11, 0.24, '#FFE7A0', [0, 0.18, 0.12]],
  ]
  layers.forEach(([r, h, col, at], i) => {
    const m = unlit(drop(r, h, col, at), bag)
    m.renderOrder = 3 + i
    // (Each layer flickers on its own beat: set by the set's update.)
    m.userData.phase = i * 1.7
    m.userData.base = at
    g.add(m)
  })
  return g
}

/** The pink tent, its door open on a warm glow (someone is reading in there with a lamp). It faces +z. */
function tent(bag: Bag) {
  const g = new Group()
  const W = 1.5
  const H = 1.25
  const D = 1.7
  const tri: [number, number][] = [
    [-W / 2, 0],
    [W / 2, 0],
    [0, H],
  ]
  g.add(
    solid(
      merge([
        P.prism(tri, D, C.scarf, {}),
        // A lavender stripe down the ridge, and the pegs.
        P.cyl(0.035, 0.035, D + 0.12, '#B9A6F5', { at: [0, H, 0], rot: [Math.PI / 2, 0, 0] }, 8),
        ...[-1, 1].map((s) => P.cyl(0.03, 0.03, 0.18, '#E9D3A6', { at: [s * (W / 2 + 0.12), 0.05, D / 2], rot: [0, 0, s * 0.5] }, 6)),
      ]),
      bag,
      2.2,
    ),
  )
  // The door: a warm, glowing triangle, and its two flaps tied back.
  const door: [number, number][] = [
    [-0.36, 0],
    [0.36, 0],
    [0, 0.88],
  ]
  const glow = unlit([P.prism(door, 0.02, '#FFD98A', { at: [0, 0.005, D / 2 + 0.012] })], bag)
  g.add(glow)
  g.add(
    solid(
      merge([-1, 1].map((s) => P.prism([[0, 0], [s * 0.2, 0], [0, 0.88]], 0.03, '#FF6FA6', { at: [s * 0.36, 0.005, D / 2 + 0.03] }))),
      bag,
      1.8,
    ),
  )
  return g
}

/** The bag of marshmallows: a pink paper bag, rolled at the top, with a few white marshmallows peeking out. */
function mallowBag(bag: Bag, root: Group) {
  const g = new Group()
  g.add(solid(merge([P.rbox(0.26, 0.24, 0.18, 0.04, '#FFC2D6', { at: [0, 0.12, 0] }), P.rbox(0.27, 0.05, 0.19, 0.02, '#FF8FB8', { at: [0, 0.24, 0] }), P.box(0.12, 0.08, 0.005, '#FFF7F0', { at: [0, 0.13, 0.092] })]), bag, 1.8))
  const mallows: Mesh[] = []
  const spots: V3[] = [
    [0.06, 0.28, 0.04],
    [-0.06, 0.29, -0.02],
    [0.01, 0.31, -0.05],
    [-0.08, 0.27, 0.05],
    [0.08, 0.27, -0.05],
  ]
  for (const at of spots) {
    const m = new Mesh(bag.add(P.cyl(0.045, 0.045, 0.07, MALLOW, {}, 12)), solidMat(bag))
    m.position.set(...at)
    m.rotation.set(0.3 * (at[0] > 0 ? 1 : -1), 0, 0.2)
    g.add(m)
    mallows.push(m)
  }
  root.add(g)
  return { group: g, mallows }
}
let mallowMat: MeshBasicMaterial | null = null
/** The marshmallows are a little bright (white in the firelight): unlit cream. */
function solidMat(bag: Bag) {
  if (!mallowMat) {
    mallowMat = new MeshBasicMaterial({ vertexColors: true })
    bag.add({ dispose: () => (mallowMat?.dispose(), (mallowMat = null)) })
  }
  return mallowMat
}

/** A marshmallow toasted golden, for a stick or a paw. */
export function makeMallow(bag: Bag, r = 0.045, color = '#F7D8A0') {
  return solid(P.cyl(r, r, r * 1.5, color, {}, 12), bag, 1.4)
}

/** A roasting stick with a toasted marshmallow on its end, for a rig friend `H` meters tall: add it to `rig.armR`. It
 *  points up out of her paw, `tilt` radians forward and `out` radians away from her side (so it doesn't cross her face),
 *  the marshmallow about `len` meters away and sized to her paw. */
export function makeRoastStick(H: number, bag: Bag, len = 0.75, tilt = 0.75, out = 0) {
  const hand = new Vector3(0.09 * H, -0.24 * H, 0.08 * H)
  const dir = new Vector3(Math.sin(out), Math.cos(tilt) * Math.cos(out), Math.sin(tilt) * Math.cos(out)).normalize()
  const e = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir))
  const rot: V3 = [e.x, e.y, e.z]
  const mid = hand.clone().addScaledVector(dir, len / 2)
  const r = Math.min(0.045, 0.085 * H)
  const tip = hand.clone().addScaledVector(dir, len + r * 0.6)
  const g = new Group()
  g.add(solid(merge([P.cyl(0.012, 0.014, len, '#B88A5A', { at: [mid.x, mid.y, mid.z], rot }, 6), P.cyl(r, r, r * 1.55, '#F7D8A0', { at: [tip.x, tip.y, tip.z], rot }, 12)]), bag, 1.4))
  return g
}

/** The little grey paw: a raccoon's arm (grey, a dark band at the wrist) and her dark little hand with four fingers.
 *  `slide` moves along its own +z (the reach); the arm trails back behind the hand into the bush. */
function makePaw(bag: Bag) {
  const root = new Group()
  const slide = new Group()
  const hand = new Group()
  slide.add(
    solid(
      merge([
        P.capsule(0.045, 1.0, C.raccoonFur, { at: [0, 0, -0.56], rot: [Math.PI / 2, 0, 0] }),
        P.cyl(0.05, 0.05, 0.05, C.raccoonDark, { at: [0, 0, -0.1], rot: [Math.PI / 2, 0, 0] }, 10),
      ]),
      bag,
      1.6,
    ),
  )
  hand.add(
    solid(
      merge([
        P.sphere(0.06, C.raccoonDark, { at: [0, 0, 0], scale: [1.1, 0.7, 1] }, 12),
        ...[-0.045, -0.015, 0.015, 0.045].map((x) => P.capsule(0.013, 0.03, C.raccoonDark, { at: [x, -0.01, 0.06], rot: [Math.PI / 2 + 0.4, 0, 0] })),
      ]),
      bag,
      1.6,
    ),
  )
  slide.add(hand)
  root.add(slide)
  return { root, slide, hand }
}

/** Two shining eyes in the dark (raccoon eyes: yellow-green, like in the game), a little white shine in each. */
function makeEyes(bag: Bag) {
  const g = new Group()
  for (const s of [-1, 1]) {
    const e = unlit([P.sphere(0.042, '#E8F06A', { at: [s * 0.075, 0, 0], scale: [1, 1.15, 0.5] }, 12), P.sphere(0.014, '#FFFFFF', { at: [s * 0.075 + 0.014, 0.016, 0.022] }, 8)], bag, { fog: false })
    g.add(e)
  }
  g.visible = false
  return g
}

// ---------------------------------------------------------------- the set

export const CAMP_SET: FilmSet<CampSet> = {
  id: 'campfire',
  // A deep blue-violet night, a little lighter than black so the trees read against it; the light is moonlight
  // (lavender) and the fire adds its own warm light to whoever is near it.
  look: { sky: ['#141238', '#2E2866', '#4A3F80'], fog: ['#231E4E', 12, 46], light: [0.8, 0.62], tint: '#CCD2FF', stars: true },
  build(s, root) {
    const { bag } = s
    // The ground: the forest floor, the dirt of the clearing round the fire.
    root.add(solid(merge([P.cyl(60, 60, 0.4, '#2E4A3E', { at: [0, -0.2, 0] }, 40), P.cyl(3.1, 3.2, 0.04, '#6E5A48', { at: [0, 0.02, -0.3] }, 32)]), bag, 0))

    // The ring of tall trees: spruces and red maples all round, nearer at the sides, none where the camera stands.
    const trees: ReturnType<typeof P.box>[] = []
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (0.72 + (i / 25) * 1.56) + Math.sin(i * 7.3) * 0.05
      const r = 6.2 + (i % 4) * 1.4 + Math.sin(i * 3.1) * 0.6
      const x = Math.cos(a) * r
      const z = Math.sin(a) * r - 0.8
      const maple = i % 3 === 1
      const h = maple ? 2.8 + (i % 2) * 0.6 : 3.8 + ((i * 7) % 5) * 0.45
      for (const p of maple ? mapleTree(h, i) : spruce(h, i)) trees.push(p.translate(x, 0, z))
    }
    // A few nearer, at the clearing's back edge (a maple each side of the tent, a spruce by the bush).
    for (const [x, z, h, maple] of [
      [3.6, -3.2, 3.2, true],
      [-3.3, -2.6, 4.6, false],
      [-1.9, -3.6, 3.0, true],
      [0.9, -4.2, 5.2, false],
    ] as [number, number, number, boolean][])
      for (const p of maple ? mapleTree(h, Math.round(x)) : spruce(h, Math.round(z))) trees.push(p.translate(x, 0, z))
    root.add(solid(merge(trees), bag, 2))

    // The fire.
    const [fx, , fz] = CAMP.fire
    const pit = solid(merge(firePit()), bag, 1.6)
    pit.position.set(fx, 0, fz)
    root.add(pit)
    const fl = flames(bag)
    fl.position.set(fx, 0.06, fz)
    fl.scale.setScalar(0.72)
    root.add(fl)
    // Its warm light (it reaches the faces round the fire; the moon does the rest).
    const light = new PointLight('#FFB070', 2.6, 5.5, 1.1)
    light.position.set(fx, 0.75, fz + 0.15)
    root.add(light)
    // A soft glow round the flames, and a warm pool of light on the ground.
    const glow = new Sprite(bag.add(new SpriteMaterial({ map: glowTexture(bag), color: '#FF9A50', transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false, fog: false })))
    glow.scale.set(2, 2, 1)
    glow.position.set(fx, 0.5, fz)
    glow.renderOrder = 9
    root.add(glow)
    const pool = new Mesh(bag.add(new PlaneGeometry(4.2, 4.2)), bag.add(new MeshBasicMaterial({ map: glowTexture(bag), color: '#FF9440', transparent: true, opacity: 0.38, blending: AdditiveBlending, depthWrite: false })))
    pool.rotation.x = -Math.PI / 2
    pool.position.set(fx, 0.05, fz)
    pool.renderOrder = 2
    root.add(pool)

    // Maple's log, with the bag of marshmallows on it.
    const log = solid(
      merge([
        P.cyl(0.17, 0.17, 1.35, WOOD, { at: [0, 0.16, 0], rot: [0, 0, Math.PI / 2] }, 14),
        ...[-1, 1].map((s) => P.cyl(0.15, 0.15, 0.02, WOOD_END, { at: [s * 0.676, 0.16, 0], rot: [0, 0, Math.PI / 2] }, 14)),
        P.box(0.9, 0.012, 0.02, WOOD_DARK, { at: [-0.1, 0.3, 0.1] }),
        P.box(0.7, 0.012, 0.02, WOOD_DARK, { at: [0.15, 0.24, 0.15] }),
      ]),
      bag,
      2,
    )
    log.position.set(-1.2, 0, 0.02)
    root.add(log, blobShadow(0.8, bag).translateX(-1.2))
    const mb = mallowBag(bag, root)
    // (A film can hide it: the marshmallows are all eaten by the film out.)
    mb.group.position.set(...CAMP.bag)
    mb.group.rotation.y = 0.3

    // The bush behind it: big, round, dark green (with a few red leaves from the maple above).
    const [bx, , bz] = CAMP.bush
    const bush = solid(
      merge([
        P.sphere(0.55, '#2F5A45', { at: [0, 0.42, 0], scale: [1.25, 0.85, 1] }, 14),
        P.sphere(0.4, '#386A50', { at: [-0.55, 0.32, 0.12] }, 12),
        P.sphere(0.42, '#2B5240', { at: [0.58, 0.3, 0.05] }, 12),
        P.sphere(0.34, '#386A50', { at: [0.1, 0.72, 0.1] }, 12),
        ...[
          [-0.3, 0.6, 0.45],
          [0.42, 0.52, 0.38],
          [0.05, 0.86, 0.35],
        ].map(([x, y, z]) => P.sphere(0.06, '#E2603F', { at: [x, y, z], scale: [1, 0.5, 1] }, 8)),
      ]),
      bag,
      2,
    )
    bush.position.set(bx, 0, bz)
    root.add(bush)
    // The paw comes out of the bush's front, toward the bag; the eyes peep from its right side.
    const pw = makePaw(bag)
    pw.root.position.set(CAMP.bag[0] + 0.02, CAMP.bag[1] + 0.56, bz + 0.25)
    pw.root.rotation.x = 0.36
    root.add(pw.root)
    const eyes = makeEyes(bag)
    eyes.position.set(...CAMP.eyes)
    root.add(eyes)

    // The tent.
    const t = tent(bag)
    t.position.set(...CAMP.tent)
    t.rotation.y = -0.38
    root.add(t, blobShadow(1.3, bag).translateX(CAMP.tent[0]).translateZ(CAMP.tent[2]))

    // A stump and a lantern-ish rock or two, so the clearing isn't bare.
    root.add(
      solid(
        merge([
          P.cyl(0.24, 0.28, 0.32, WOOD, { at: [2.75, 0.16, -0.45] }, 12),
          P.cyl(0.21, 0.21, 0.02, WOOD_END, { at: [2.75, 0.33, -0.45] }, 12),
          P.sphere(0.22, STONE[0], { at: [-2.3, 0.1, 0.9], scale: [1.3, 0.7, 1] }, 10),
          P.sphere(0.16, STONE[2], { at: [2.6, 0.08, 1.3], scale: [1.3, 0.7, 1] }, 10),
        ]),
        bag,
        1.8,
      ),
    )

    // The moon, big and round, over the trees (no fog: it's far beyond them).
    const moon = unlit([P.sphere(2.2, '#FFF6DA', {}, 24)], bag, { fog: false })
    moon.position.set(-11, 19, -42)
    root.add(moon)
    const halo = new Sprite(bag.add(new SpriteMaterial({ map: glowTexture(bag), color: '#FFF2C8', transparent: true, opacity: 0.32, blending: AdditiveBlending, depthWrite: false, fog: false })))
    halo.scale.set(11, 11, 1)
    halo.position.copy(moon.position)
    root.add(halo)

    return {
      mallows: mb.mallows,
      bag: mb.group,
      paw: { ...pw, reach: 0 },
      eyes: { root: eyes, open: 1 },
      flare: 0,
      fire: { flames: fl, light, glow, pool },
      tent: t,
    }
  },
  update(set, dt, t, s) {
    // The fire flickers: each layer on its own beat, the light and the glow with it; a spark now and then.
    set.flare = Math.max(0, set.flare - dt * 1.2)
    const f = set.flare
    set.fire.flames.children.forEach((m: Object3D) => {
      const ph = m.userData.phase as number
      const k = 1 + 0.12 * Math.sin(t * 11 + ph) + 0.07 * Math.sin(t * 23 + ph * 2) + 0.5 * f
      m.scale.set(1 + 0.05 * Math.sin(t * 9 + ph) + 0.15 * f, k, 1)
      // (Turned to the camera, so the gold core is always in front.)
      m.position.x = 0.015 * Math.sin(t * 7 + ph)
    })
    const cp = s.rig.camera.position
    set.fire.flames.rotation.y = Math.atan2(cp.x - CAMP.fire[0], cp.z - CAMP.fire[2])
    const flick = 0.85 + 0.1 * Math.sin(t * 13) + 0.06 * Math.sin(t * 29) + 0.6 * f
    set.fire.light.intensity = 2.6 * flick
    set.fire.glow.scale.setScalar(1.9 * (0.95 + 0.08 * Math.sin(t * 11)) * (1 + 0.4 * f))
    ;(set.fire.pool.material as MeshBasicMaterial).opacity = 0.34 * flick
    if (Math.random() < dt * (2.2 + 14 * f)) s.sparkle(CAMP.fire[0] + (Math.random() - 0.5) * 0.25, 0.6, CAMP.fire[2], 1 + Math.round(3 * f))
    // The paw slides out of the bush (reach 0..1).
    set.paw.slide.position.z = -0.3 + set.paw.reach * 0.98
    set.paw.root.visible = set.paw.reach > 0.01
    // The eyes blink now and then.
    const blink = (t * 0.7) % 1 > 0.94 ? 0.1 : 1
    set.eyes.root.scale.set(1, Math.max(0.05, blink * set.eyes.open), 1)
  },
}
