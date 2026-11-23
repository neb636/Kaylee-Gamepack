// The Great Bear Rainforest round the river (story/sets/bath.ts): old, wet, green all the way up. Giant cedars with
// moss growing up their trunks in a thick green coat and beards of moss hanging off their branches, rows and rows of
// tall straight trunks going back into a soft green haze, sword ferns with real fronds, moss mounds over everything
// on the forest floor, and fallen trees turned into long green humps (nurse logs) with little ferns growing on them.
// Toy-shaped and bright (pastel greens, not the photo's dark ones), but lush: the picture is full of green.
// Every builder returns geometry parts; bath.ts merges them into a few meshes.
import type { BufferGeometry } from 'three'
import { P } from '../../../../engine3d/geo'
import { rng } from './bathWater'

export const GREEN = {
  moss: '#86C45E',
  mossLight: '#A6D872',
  mossDark: '#5FA44E',
  mossDeep: '#4C8F4A',
  beard: '#B5D88A',
  fern: '#5DB056',
  fernDark: '#47984A',
  bark: '#8E5A45',
  barkDark: '#6E4334',
  canopy: ['#3F8A5A', '#4E9C62', '#5DAE6A'],
  far: '#8E7A5E',
  farDark: '#7C8A5C',
}

/** A giant mossy cedar `h` tall at (x, y, z), trunk radius `r` at the foot: a flared foot buried in moss, a thick moss
 *  coat up the trunk (lumpy at its top edge), branch stubs hung with moss beards, drooping green tiers up top.
 *  `coat` is how far up the moss goes (of the height). */
export function mossyCedar(x: number, y: number, z: number, h: number, r: number, coat = 0.1, seed = 1): BufferGeometry[] {
  const R = rng(seed)
  const parts = [
    P.cyl(r * 0.5, r, h, GREEN.bark, { at: [x, y + h / 2, z] }, 10),
    P.cone(r * 1.75, r * 2.3, GREEN.barkDark, { at: [x, y + r * 1.1, z] }, 10),
  ]
  // The moss coat: a green sleeve hugging the trunk, the foot's flare covered too.
  const top = h * coat
  const rAt = (yy: number) => r - (r * 0.5 * yy) / h
  parts.push(P.cyl(rAt(top) * 1.07, r * 1.08, top, GREEN.mossDark, { at: [x, y + top / 2, z] }, 10))
  parts.push(P.cone(r * 1.85, r * 2.0, GREEN.moss, { at: [x, y + r * 0.95, z] }, 10))
  // Moss climbing the bark in long streaks (the bark shows between them), thinning out higher up.
  for (let i = 0; i < 9; i++) {
    const yy = top + h * 0.03 + (i / 8) * h * 0.22
    const a = i * 2.3 + seed
    const rr = rAt(yy)
    const len = h * (0.1 - i * 0.006)
    parts.push(P.sphere(rr * (0.34 + R() * 0.12), i % 3 ? GREEN.moss : GREEN.mossLight, { at: [x + Math.cos(a) * rr * 0.86, y + yy, z + Math.sin(a) * rr * 0.86], scale: [1, len / (rr * 0.4), 0.8] }, 8))
  }
  // Branch stubs with moss beards hanging off them.
  for (let i = 0; i < 4; i++) {
    const yy = h * (0.3 + i * 0.07) + R() * 0.6
    const a = i * 1.9 + seed * 0.7
    const rr = rAt(yy)
    const bx = x + Math.cos(a) * (rr + 0.35)
    const bz = z + Math.sin(a) * (rr + 0.35)
    parts.push(P.cyl(0.07, 0.1, 0.8, GREEN.barkDark, { at: [x + Math.cos(a) * (rr + 0.3), y + yy, z + Math.sin(a) * (rr + 0.3)], rot: [Math.sin(a) * 1.25, 0, -Math.cos(a) * 1.25] }, 6))
    parts.push(P.sphere(0.2, GREEN.moss, { at: [bx, y + yy + 0.04, bz], scale: [1.4, 0.55, 1.4] }, 8))
    for (let k = 0; k < 4; k++) {
      const len = 0.45 + R() * 0.55
      parts.push(P.cone(0.06 + R() * 0.03, len, k % 2 ? GREEN.beard : GREEN.mossLight, { at: [bx + (k - 1.5) * 0.09, y + yy - len / 2, bz + (R() - 0.5) * 0.12], rot: [Math.PI, 0, 0] }, 5))
    }
  }
  // The crown: drooping tiers.
  const tiers = 7
  for (let i = 0; i < tiers; i++) {
    const k = i / (tiers - 1)
    const rr = (2.5 - 1.9 * k) * (r / 0.9)
    parts.push(P.cone(rr, h * 0.16, GREEN.canopy[i % 3], { at: [x, y + h * (0.42 + 0.56 * k), z] }, 9))
  }
  return parts
}

/** A far trunk in the haze: tall and straight, mossy green over bark, a few tiers at the top (the fog softens it). */
function farTrunk(x: number, y: number, z: number, h: number, r: number, i: number): BufferGeometry[] {
  // The moss sleeve stands clearly proud of the bark (about 12%) all the way up. It used to sit within 1% of the
  // trunk and cross inside it at its top, and far off in the haze the depth buffer couldn't tell them apart: the bark
  // shimmered through the moss whenever the camera moved.
  const sleeve = h * 0.18
  const trunkAt = r * (1 - (0.4 * sleeve) / h)
  const parts = [
    P.cyl(r * 0.6, r, h, i % 3 ? GREEN.far : GREEN.farDark, { at: [x, y + h / 2, z] }, 7),
    P.cone(r * 1.6, r * 1.8, GREEN.mossDark, { at: [x, y + r * 0.85, z] }, 7),
    P.cyl(trunkAt * 1.12, r * 1.14, sleeve, GREEN.mossDark, { at: [x, y + sleeve / 2, z] }, 7),
  ]
  for (let k = 0; k < 3; k++) parts.push(P.cone((1.8 - k * 0.45) * r * 1.6, h * 0.14, GREEN.canopy[(i + k) % 3], { at: [x, y + h * (0.72 + k * 0.1), z] }, 7))
  return parts
}

/** Rows of trunks going back into the haze, behind and round the river: the forest is deep. `keep` says where a trunk
 *  may stand (not in the river, not in front of a shot). */
export function forestDepth(seed: number, keep: (x: number, z: number) => boolean): BufferGeometry[] {
  const R = rng(seed)
  const parts: BufferGeometry[] = []
  let i = 0
  // Behind the falls, on the upper floor: a wall of trunks from just past the tallest cedar to deep in the fog.
  for (let row = 0; row < 6; row++) {
    const z = -11.5 - row * 4.2
    const n = 9 + row * 2
    for (let k = 0; k < n; k++) {
      const x = -22 + ((k + R() * 0.8) / n) * 44
      const zz = z + (R() - 0.5) * 2.4
      if (!keep(x, zz)) continue
      parts.push(...farTrunk(x, 1.5, zz, 22 + R() * 10, 0.35 + R() * 0.45, i++))
    }
  }
  // Down both sides of the lower floor, framing the river.
  for (const side of [-1, 1]) {
    for (let k = 0; k < 10; k++) {
      const x = side * (9 + R() * 12)
      const z = -6 + k * 2.6 + (R() - 0.5) * 1.5
      if (!keep(x, z)) continue
      parts.push(...farTrunk(x, 0, z, 22 + R() * 8, 0.45 + R() * 0.45, i++))
    }
  }
  return parts
}

/** A sword fern: `n` long fronds arching up and out of a middle, each with leaflets down both sides (a saw-toothed
 *  flat outline in two pieces, the inner one steep, the outer one bending over). */
export function swordFern(x: number, z: number, s = 1, y = 0, n = 9, seed = 1): BufferGeometry[] {
  const R = rng(seed)
  const parts: BufferGeometry[] = []
  const frond = (len: number, w: number): [number, number][] => {
    // A flat frond along +x: leaflets as teeth on both sides, tapering to the tip.
    const pts: [number, number][] = []
    const teeth = 6
    for (let i = 0; i <= teeth; i++) {
      const u = i / teeth
      const ww = w * (1 - u * 0.75)
      pts.push([u * len, ww])
      if (i < teeth) pts.push([(u + 0.5 / teeth) * len, ww * 0.6])
    }
    pts.push([len * 1.06, 0])
    for (let i = teeth; i >= 0; i--) {
      const u = i / teeth
      const ww = w * (1 - u * 0.75)
      if (i < teeth) pts.push([(u + 0.5 / teeth) * len, -ww * 0.6])
      pts.push([u * len, -ww])
    }
    return pts
  }
  const a0 = frond(0.36 * s, 0.11 * s)
  const a1 = frond(0.42 * s, 0.09 * s)
  for (let i = 0; i < n; i++) {
    const yaw = (i / n) * Math.PI * 2 + R() * 0.4 + seed
    const up = 0.95 + R() * 0.35
    const col = i % 3 ? GREEN.fern : GREEN.fernDark
    // Inner piece: from the middle, steeply up and out. (The outline is flat in xy: the turn round x first lays its
    // leaflets out sideways, then it tips up round z and turns round y.)
    const c = Math.cos(up)
    const sn = Math.sin(up)
    const L0 = 0.36 * s
    parts.push(P.prism(a0, 0.012 * s, col, { at: [x, y + 0.02 * s, z], rot: [Math.PI / 2, yaw, up], order: 'YZX' }))
    // Outer piece: from the end of the inner one, bending over and down.
    const ex = x + Math.cos(yaw) * c * L0
    const ez = z - Math.sin(yaw) * c * L0
    parts.push(P.prism(a1, 0.012 * s, col, { at: [ex, y + 0.02 * s + sn * L0, ez], rot: [Math.PI / 2, yaw, -0.25 - R() * 0.3], order: 'YZX' }))
  }
  // A tuft in the middle.
  parts.push(P.sphere(0.09 * s, GREEN.fernDark, { at: [x, y + 0.05 * s, z], scale: [1, 0.6, 1] }, 8))
  return parts
}

/** A soft mound of moss on the forest floor (or a rock under moss): a few round lumps together. */
export function mossMound(x: number, z: number, s: number, y = 0, seed = 1): BufferGeometry[] {
  const R = rng(seed)
  const parts = [P.sphere(s, GREEN.moss, { at: [x, y, z], scale: [1.3, 0.45, 1] }, 12)]
  for (let i = 0; i < 3; i++) {
    const a = i * 2.1 + seed
    parts.push(P.sphere(s * (0.5 + R() * 0.25), i % 2 ? GREEN.mossLight : GREEN.mossDark, { at: [x + Math.cos(a) * s * 0.8, y, z + Math.sin(a) * s * 0.6], scale: [1.2, 0.55, 1] }, 10))
  }
  return parts
}

/** A fallen tree gone green: a long log `len` along `yaw`, covered in a thick moss hump, its broken end showing bark,
 *  little ferns and a sapling growing on top. */
export function nurseLog(x: number, z: number, len: number, r: number, yaw: number, y = 0, seed = 1): BufferGeometry[] {
  const dx = Math.cos(yaw)
  const dz = -Math.sin(yaw)
  const parts = [
    P.cyl(r, r * 1.1, len, GREEN.barkDark, { at: [x, y + r * 0.8, z], rot: [0, yaw, Math.PI / 2], order: 'YZX' }, 10),
    P.sphere(len * 0.5, GREEN.moss, { at: [x, y + r * 1.25, z], rot: [0, yaw, 0], scale: [1, (r * 0.9) / (len * 0.5), (r * 1.15) / (len * 0.5)] }, 14),
    // The broken end, a ring of paler wood.
    P.cyl(r * 0.85, r * 0.85, 0.04, '#C9926A', { at: [x + dx * len * 0.5, y + r * 0.8, z + dz * len * 0.5], rot: [0, yaw, Math.PI / 2], order: 'YZX' }, 10),
  ]
  for (let i = 0; i < 4; i++) {
    const u = -0.35 + i * 0.22
    parts.push(P.sphere(r * 0.55, i % 2 ? GREEN.mossLight : GREEN.mossDark, { at: [x + dx * len * u, y + r * 1.9, z + dz * len * u], scale: [1.3, 0.55, 1] }, 8))
  }
  parts.push(...swordFern(x - dx * len * 0.2, z - dz * len * 0.2, 0.6, y + r * 2.0, 6, seed))
  // A sapling: a little hemlock growing out of the log.
  const sx = x + dx * len * 0.15
  const sz = z + dz * len * 0.15
  parts.push(P.cyl(0.03, 0.04, 0.9, GREEN.bark, { at: [sx, y + r * 2 + 0.45, sz] }, 5))
  for (let k = 0; k < 3; k++) parts.push(P.cone(0.32 - k * 0.08, 0.35, GREEN.canopy[k], { at: [sx, y + r * 2 + 0.45 + k * 0.22, sz] }, 7))
  return parts
}

/** Little moss tufts and clover on the open ground (no ink: they're tiny). */
export function groundTufts(seed: number, n: number, area: [number, number, number, number], keep: (x: number, z: number) => boolean, y = 0): BufferGeometry[] {
  const R = rng(seed)
  const parts: BufferGeometry[] = []
  const [x0, x1, z0, z1] = area
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0)
    const z = z0 + R() * (z1 - z0)
    if (!keep(x, z)) continue
    const c = i % 3 === 0 ? GREEN.mossLight : i % 3 === 1 ? GREEN.mossDark : GREEN.moss
    parts.push(P.sphere(0.12 + R() * 0.16, c, { at: [x, y, z], scale: [1.4, 0.32, 1] }, 7))
  }
  return parts
}

