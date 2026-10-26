// The hats drawer, fitted round her hair, her horn and her ears (every one tops out under the tip of her horn, closet
// index.ts's horn rule). Head-local: her hair is a dome of 0.30 around (0, 0.18, -0.04), out to 0.356 at the sides;
// her horn comes out of it at about (0, 0.43, 0.14) and tops out at y 0.56; her ears stand up at x ±0.11..0.26, y
// 0.36..0.54, z -0.07..0.04 (measured on kaylee.glb).
//
// A crown round the base of her horn, a tiara on her bangs with a heart in front of the horn, a ring of orchids
// (Thailand's flower) round her hair, a big bow on the side, floppy bunny ears and cat ears on headbands behind her own
// ears, a cap worn backwards, a pink cowboy hat and a bucket hat (her horn pokes out of both), and the sun hat she packs.
import { Group, LatheGeometry, SphereGeometry, Vector2, Vector3, type BufferGeometry } from 'three'
import type { Bag } from '../../engine/dispose'
import { bake, P, type V3 } from '../../engine/geo'
import { buildWorn } from '../animal'
import { LOOKS } from '../looks'
import { group, HAIR, HAIR_Z, PX } from '../model-wear'
import { aim, brim, facing, heart, onHair, outFrom, placed, star } from './fit'

const GOLD = '#FFC83D'
const GEM = '#FF4F9A'
const SILVER = '#E9E4FF'
type Parts = BufferGeometry[]

const shelfTilt = (g: Group, rx: number) => {
  g.userData.shelfTilt = rx
  return g
}

/** A heart standing at `at`, facing `normal`. */
const heartAt = (r: number, depth: number, c: string, at: Vector3, normal: Vector3) => facing(P.prism(heart(r), depth, c), at, normal)

/** A dome over the top of her hair whose rim runs round her bangs (model-wear.ts's scrub cap): her horn and ears poke
 *  out of it. */
function dome(color: string, rim: string, lined: Parts, h = 0.19, at: V3 = [0, 0.32, -0.03], tilt = 0.14) {
  const [rx, rz] = [0.29, 0.32]
  lined.push(bake(new SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI / 2), color, { at, rot: [tilt, 0, 0], scale: [rx, h, rz] }))
  lined.push(P.torus(1, 0.02, rim, { at, rot: [Math.PI / 2 + tilt, 0, 0], scale: [rx, rz, 1] }))
  return { at, rx, rz, h, tilt }
}

/** A headband over the top of her head behind her ears, ear to ear (`z` head-local), and where along it a thing sits
 *  (`a` 0 at her left side .. π at her right). */
function headband(color: string, z: number, lined: Parts) {
  const r = 0.305
  const c = new Vector3(0, 0.17, z)
  lined.push(P.torus(r, 0.015, color, { at: [c.x, c.y, c.z], rot: [0, 0, 0.32] }, Math.PI - 0.64))
  return (a: number, out = 0) => new Vector3(Math.cos(a) * (r + out), Math.sin(a) * (r + out), 0).add(c)
}

/** A rabbit's (or a cat's) ear: built standing up from its base, flat front to back, pink inside. */
function ear(kind: 'bunny' | 'kitty', at: Vector3, lean: number, back: number, flop: number, lined: Parts, plain: Parts) {
  const outer = kind === 'bunny' ? '#FFFFFF' : '#5A4A66'
  const inner = kind === 'bunny' ? '#FFB3D1' : '#FF9CC0'
  const g: Parts = []
  const p: Parts = []
  if (kind === 'bunny') {
    // Two segments: the top one flops over (one ear upright-ish, one bent: silly).
    g.push(P.capsule(0.042, 0.1, outer, { at: [0, 0.09, 0], scale: [1, 1, 0.42] }))
    p.push(P.capsule(0.024, 0.08, inner, { at: [0, 0.09, 0.012], scale: [1, 1, 0.3] }))
    const tipParts = [P.capsule(0.04, 0.06, outer, { at: [0, 0.05, 0], scale: [1, 1, 0.42] }), P.capsule(0.022, 0.05, inner, { at: [0, 0.05, 0.012], scale: [1, 1, 0.3] })]
    for (const t of tipParts) {
      t.rotateZ(flop)
      t.translate(0, 0.17, 0)
    }
    g.push(tipParts[0])
    p.push(tipParts[1])
  } else {
    g.push(P.cone(0.088, 0.14, outer, { at: [0, 0.06, 0], rot: [0, Math.PI / 4, 0], scale: [1.15, 1, 0.45] }, 4))
    p.push(P.cone(0.052, 0.09, inner, { at: [0, 0.045, 0.026], rot: [0, Math.PI / 4, 0], scale: [1.15, 1, 0.3] }, 4))
  }
  for (const part of [...g, ...p]) {
    part.rotateX(-back)
    part.rotateZ(lean)
    part.translate(at.x, at.y, at.z)
  }
  lined.push(...g)
  plain.push(...p)
}

/** An orchid, facing +z: three sepals and two wide petals, the frilly lip and a yellow throat. */
function orchid(c: string, light: string, s: number): { lined: Parts; plain: Parts } {
  const lined: Parts = []
  const plain: Parts = []
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (i / 5) * Math.PI * 2
    const wide = i === 1 || i === 4
    const r = (wide ? 0.026 : 0.021) * s
    lined.push(P.sphere(r, wide ? light : c, { at: [Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2, 0], rot: [0, 0, a], scale: [1.45, 0.75, 0.3] }, 12))
  }
  plain.push(P.sphere(0.016 * s, '#9B3FC0', { at: [0, -0.012 * s, 0.008 * s], scale: [1.1, 0.9, 0.5] }, 10))
  plain.push(P.sphere(0.008 * s, '#FFE36E', { at: [0, 0.004 * s, 0.012 * s] }, 8))
  return { lined, plain }
}

export function buildHat(id: string, bag: Bag): Group {
  const lined: Parts = []
  const plain: Parts = []
  if (id === 'crown') {
    // A gold band round the base of her horn, tipped forward with her hair there, five points (tall ones with a gem,
    // short ones between) and a big gem on the front.
    const r = 0.085
    lined.push(P.cyl(r + 0.004, r, 0.05, GOLD, {}, 24))
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      const tall = i % 2 === 0
      const h = tall ? 0.062 : 0.034
      lined.push(P.cone(tall ? 0.024 : 0.018, h, GOLD, { at: [Math.sin(a) * r, 0.025 + h / 2, Math.cos(a) * r] }, 10))
      if (tall) plain.push(P.sphere(0.011, GEM, { at: [Math.sin(a) * (r + 0.004), 0.025 + h + 0.004, Math.cos(a) * (r + 0.004)] }, 10))
      else plain.push(P.sphere(0.008, '#8FE3C8', { at: [Math.sin(a) * (r + 0.005), 0.005, Math.cos(a) * (r + 0.005)] }, 8))
    }
    plain.push(P.sphere(0.019, GEM, { at: [0, 0, r + 0.006], scale: [1, 1, 0.6] }, 12))
    const crown = placed(group(lined, plain, bag), [0, 0.432, 0.13], [0.6, 0, 0])
    // On the shelf it stands up straight (on her it tips forward with her hair).
    crown.userData.upright = true
    return crown
  }
  if (id === 'tiara') {
    // A silver band across the top of her bangs, ear to ear, little peaks with pink gems, and a big pink heart in the
    // middle, right in front of her horn (the horn is the tiara's tallest point).
    const pts: Vector3[] = []
    for (let i = 0; i <= 16; i++) pts.push(onHair(-1.15 + (i / 16) * 2.3, -0.002))
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, b] = [pts[i], pts[i + 1]]
      const mid = a.clone().add(b).multiplyScalar(0.5)
      lined.push(P.capsule(0.017, a.distanceTo(b), SILVER, { at: [mid.x, mid.y, mid.z], rot: aim(b.clone().sub(a)) }))
    }
    for (const [th, h] of [[-0.95, 0.045], [-0.5, 0.065], [0.5, 0.065], [0.95, 0.045]] as const) {
      const at = onHair(th, 0.004)
      const up = outFrom(th).multiplyScalar(0.25).add(new Vector3(0, 1, 0)).normalize()
      const tip = at.clone().addScaledVector(up, h / 2 + 0.008)
      lined.push(P.cone(0.024, h, SILVER, { at: [tip.x, tip.y, tip.z], rot: aim(up) }, 8))
      const gem = at.clone().addScaledVector(outFrom(th), 0.016)
      plain.push(P.sphere(0.014, h > 0.05 ? GEM : '#B9A6F5', { at: [gem.x, gem.y + 0.01, gem.z] }, 10))
    }
    const front = onHair(0, 0.016)
    lined.push(heartAt(0.058, 0.024, GEM, front.clone().add(new Vector3(0, 0.045, 0)), outFrom(0).add(new Vector3(0, 0.25, 0))))
    plain.push(P.sphere(0.011, '#FFFFFF', { at: [front.x - 0.018, front.y + 0.062, front.z + 0.018] }, 8))
    // On the shelf it stands tipped up toward her, so she sees the whole ring.
    return shelfTilt(placed(group(lined, plain, bag), [0, 0, 0]), 0.95)
  }
  if (id === 'orchid') {
    // A ring of purple and pink orchids with green leaves, all the way round her hair except at the back.
    const colors: [string, string][] = [['#C86BE0', '#F3B6F7'], ['#FF6FAE', '#FFC2DD'], ['#9C7BF0', '#E2D6FF']]
    const vine: Vector3[] = []
    for (let i = 0; i <= 28; i++) vine.push(onHair(-2.25 + (i / 28) * 4.5, 0.006))
    for (let i = 0; i < vine.length - 1; i++) {
      const [a, b] = [vine[i], vine[i + 1]]
      const mid = a.clone().add(b).multiplyScalar(0.5)
      lined.push(P.capsule(0.009, a.distanceTo(b), '#5FBF8F', { at: [mid.x, mid.y, mid.z], rot: aim(b.clone().sub(a)) }))
    }
    const n = 9
    for (let i = 0; i < n; i++) {
      const th = -2.05 + (i / (n - 1)) * 4.1
      const [c, light] = colors[i % 3]
      const at = onHair(th, 0.022)
      const normal = outFrom(th).add(new Vector3(0, 0.45, 0))
      const f = orchid(c, light, i === 4 ? 1.35 : 1.05)
      for (const g of f.lined) lined.push(facing(g, at, normal, th * 0.3))
      for (const g of f.plain) plain.push(facing(g, at, normal, th * 0.3))
      // A leaf between this flower and the next.
      if (i < n - 1) {
        const lt = th + 4.1 / (n - 1) / 2
        const la = onHair(lt, 0.012)
        lined.push(facing(P.sphere(0.026, '#7ED9A6', { scale: [1.6, 0.6, 0.3] }, 10), la, outFrom(lt).add(new Vector3(0, 0.3, 0)), 0.5))
      }
    }
    // On the shelf it stands tipped up toward her, so she sees the whole ring.
    return shelfTilt(placed(group(lined, plain, bag), [0, 0, 0]), 0.95)
  }
  if (id === 'bow') {
    // A big pink bow on the side of her hair below her ear (where a hair clip goes): two puffy loops, two tails and a
    // knot, facing out and forward so she sees it in front.
    const c = '#FF4F9A'
    const light = '#FF8FC4'
    const bow: Parts = []
    const dots: Parts = []
    for (const s of [-1, 1]) {
      bow.push(P.sphere(0.07, c, { at: [s * 0.072, 0.012, 0], rot: [0, 0, s * 0.28], scale: [1.15, 0.78, 0.48] }, 16))
      dots.push(P.sphere(0.03, light, { at: [s * 0.085, 0.022, 0.03], rot: [0, 0, s * 0.28], scale: [1.1, 0.7, 0.3] }, 10))
      bow.push(P.capsule(0.022, 0.07, c, { at: [s * 0.04, -0.07, -0.005], rot: [0, 0, s * 0.42], scale: [1.3, 1, 0.45] }))
    }
    bow.push(P.sphere(0.034, light, { at: [0, 0.004, 0.012], scale: [0.85, 1, 0.75] }, 12))
    const g = new Group()
    const holder = placed(group(bow, dots, bag), [0.255, 0.31, 0.085], [0.05, 0.75, -0.42])
    g.add(holder)
    return g
  }
  if (id === 'bunny' || id === 'kitty') {
    // A headband behind her own ears, and the ears on it: a bunny's long floppy ones out to the sides (one bent over),
    // or a cat's pointy ones between her ears and her horn.
    const bunny = id === 'bunny'
    const at = headband(bunny ? '#FFB3D1' : '#5A4A66', bunny ? -0.105 : 0, lined)
    for (const s of [-1, 1]) {
      if (bunny) ear('bunny', at(s > 0 ? 0.62 : Math.PI - 0.62, -0.004), -s * 0.72, 0.1, s > 0 ? -1.1 : 0.2, lined, plain)
      // (A cat's ears go right over her own, so she has a cat's ears instead: silly.)
      else ear('kitty', new Vector3(s * 0.182, 0.39, 0.028), -s * 0.36, 0.05, 0, lined, plain)
    }
    if (bunny) plain.push(P.sphere(0.018, '#FFF7FB', { at: [0, 0.48, -0.12] }, 8))
    return placed(group(lined, plain, bag), [0, 0, 0])
  }
  if (id === 'cap') {
    // The cap, backwards (sky blue): her horn pokes out the front and the brim keeps the sun off her neck.
    const d = dome('#8EC9F5', '#5FA8E8', lined)
    lined.push(P.cyl(0.17, 0.17, 0.016, '#5FA8E8', { at: [0, d.at[1] - 0.045, d.at[2] - d.rz - 0.06], rot: [-0.32, 0, 0], scale: [1, 1, 0.7] }, 24))
    plain.push(P.sphere(0.022, '#FFFFFF', { at: [0, d.at[1] + d.h - 0.018, d.at[2] - 0.02] }))
    return placed(group(lined, plain, bag), [0, 0, 0])
  }
  if (id === 'bucket') {
    // A soft butter-yellow bucket hat with mint dots: a dome over her hair and a brim sloping down all round (shady).
    const d = dome('#FBE27A', '#F2C94C', lined, 0.17, [0, 0.35, -0.04], 0.02)
    const ring = new LatheGeometry(
      [[0.282, 0.012], [0.284, -0.004], [0.35, -0.04], [0.352, -0.026], [0.282, 0.012]].map(([r, y]) => new Vector2(r, y)),
      36,
    )
    lined.push(bake(ring, '#FBE27A', { at: [0, d.at[1], d.at[2]], rot: [d.tilt, 0, 0], scale: [1, 1, d.rz / d.rx] }))
    for (const [u, v] of [[-0.55, 0.35], [0.5, 0.45], [0.05, -0.1], [-0.35, -0.5], [0.6, -0.35], [-0.1, 0.75]]) {
      const up = d.h * Math.sqrt(Math.max(0, 1 - u * u - v * v)) + 0.004
      const [y, z] = [up, v * d.rz]
      plain.push(P.sphere(0.02, '#8FE3C8', { at: [u * d.rx, d.at[1] + y * Math.cos(d.tilt) - z * Math.sin(d.tilt), d.at[2] + y * Math.sin(d.tilt) + z * Math.cos(d.tilt)], scale: [1, 0.45, 1] }))
    }
    return placed(group(lined, plain, bag), [0, 0, 0])
  }
  if (id === 'cowboy') {
    // A pink cowgirl hat: a tall dome over her hair (her horn and ears poke out of it like the cap's) with a crease down
    // the top, a white band with a gold star, and a wide brim round the rim that curls up at the sides.
    const d = dome('#FF8FB8', '#FFFFFF', lined, 0.215, [0, 0.33, -0.04], 0.04)
    const crease = lined[lined.length - 2]
    const pos = crease.attributes.position
    for (let i = 0; i < pos.count; i++) {
      // Push the top in along the middle, front to back.
      const [x, y] = [pos.getX(i), pos.getY(i) - d.at[1]]
      if (y > d.h * 0.6) pos.setY(i, pos.getY(i) - 0.035 * Math.exp(-((x / 0.06) ** 2)) * ((y - d.h * 0.6) / (d.h * 0.4)))
    }
    crease.computeVertexNormals()
    lined.push(brim(d.rx - 0.01, d.rx + 0.13, '#FF8FB8', { curl: 0.1, depth: d.rz / d.rx }))
    lined[lined.length - 1].rotateX(d.tilt)
    lined[lined.length - 1].translate(d.at[0], d.at[1] - 0.004, d.at[2])
    const band = (y: number) => d.at[1] + y * Math.cos(d.tilt)
    lined.push(facing(P.prism(star(0.03), 0.008, GOLD), new Vector3(0, band(0.045), d.at[2] + d.rz * 0.97 + 0.012), new Vector3(0, 0.15, 1)))
    lined.push(P.torus(1, 0.016, '#FFFFFF', { at: [0, band(0.03), d.at[2]], rot: [Math.PI / 2 + d.tilt, 0, 0], scale: [d.rx * 0.985, d.rz * 0.985, 1] }))
    return placed(group(lined, plain, bag), [0, 0, 0])
  }
  // The sun hat she packs for a sunny trip (animal.ts's recipe on her hair, like the trip's), tipped back so her face
  // shows under the brim.
  const hat = buildWorn(LOOKS.kaylee, 'sunhat', bag, HAIR, PX).head!
  return placed(hat, [0, 0, HAIR_Z], [-0.16, 0, 0])
}

