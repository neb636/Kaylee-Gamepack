// The Nan forest's painted trees, in the look of Kingdom Come: Deliverance 2 (Dad's ask, 2026-10-29: direction 1 of 3).
// The way those forests are built, at a phone's budget: a tree is a real trunk with real branches, and its crown is a
// dozen clusters of leaves, each a card facing the camera, set out round the branch tips in 3D, so the crown has depth,
// an uneven outline, gaps where the sky and the branches show, and light that falls on it (forest.ts shades each card
// by where it sits: sunlit on top and outside, dark deep inside). The far forest is whole painted crowns on single cards.
//
// The leaves are painted here, on a canvas when the drive opens (seeded, the same every time), into one atlas: each
// cluster is hundreds of single pointed leaves with a midrib on little twigs, painted back to front in three passes
// (the shaded ones deep inside, the middle ones, then the sunlit ones on the front and the rim), in natural, muted
// greens with olive and yellow in them and warm sunlit tips. Ferns, bushes, banana plants and bamboo are painted the
// same careful way; bananas, bamboo and ferns stand upright on cards that only turn round their stem.
import { CanvasTexture, LinearMipmapLinearFilter, ShaderMaterial, SRGBColorSpace, UniformsLib, UniformsUtils } from 'three'
import { rng } from './build'

/** Which picture in the atlas: leaf clusters (`cl*`), whole crowns for the far forest, and the plants. */
export const CROWN = {
  clFresh: 0,
  clMid: 1,
  clOlive: 2,
  clDark: 3,
  clYoung: 4,
  clPink: 5,
  clGold: 6,
  crownA: 7,
  crownB: 8,
  crownWide: 9,
  banana: 10,
  banana2: 11,
  bamboo: 12,
  bamboo2: 13,
  fern: 14,
  bush: 15,
} as const
export type CrownId = keyof typeof CROWN
/** Cards with these pictures stand upright (their tile number plus this, in `aTile`). */
export const UPRIGHT = 50
const COLS = 4
const ROWS = 4
const TILE = 384

/** Leaf colors, deep shade to the sunlit tip (the last one warm). */
const PAINT: Record<string, string[]> = {
  fresh: ['#26391A', '#3A5822', '#55782D', '#73983A', '#9BB84E', '#CBD27A'],
  mid: ['#1F3218', '#304C1F', '#476A29', '#638A35', '#87A947', '#B7C56A'],
  olive: ['#2A3218', '#434F1F', '#5E6E2A', '#7E8E38', '#A2AD4D', '#CDCB78'],
  dark: ['#18291A', '#25401F', '#365A27', '#4C7531', '#699540', '#94AE5E'],
  young: ['#2F4318', '#4A6A22', '#6A8F2E', '#8EB23C', '#B5CC57', '#DDE28A'],
  pink: ['#4E1F31', '#7A3550', '#A85476', '#CE7C9C', '#E8A9C0', '#F7D3DF'],
  gold: ['#4F3A0F', '#7A5916', '#A67D1F', '#CDA02D', '#E6C153', '#F7DE8E'],
}
const BARK = ['#2E241C', '#4A3B2E', '#66533F']

/** Light from the top left and a little in front. */
const L = (() => {
  const v = [-0.45, 0.7, 0.55]
  const l = Math.hypot(...v)
  return v.map((x) => x / l)
})()

let atlas: CanvasTexture | null = null
/** The atlas of painted leaves and plants (painted once a visit). */
function crownAtlas() {
  if (atlas) return atlas
  const c = document.createElement('canvas')
  c.width = COLS * TILE
  c.height = ROWS * TILE
  const g = c.getContext('2d')!
  for (const id of Object.keys(CROWN) as CrownId[]) {
    const k = CROWN[id]
    const ox = (k % COLS) * TILE
    const oy = Math.floor(k / COLS) * TILE
    const rand = rng(211 + k * 13)
    // (Each picture kept inside its own tile, with a clear margin so the small mip levels don't blend in the next one.)
    g.save()
    g.beginPath()
    g.rect(ox + 4, oy + 4, TILE - 8, TILE - 8)
    g.clip()
    const cx = ox + TILE / 2
    const cy = oy + TILE / 2
    if (id.startsWith('cl')) {
      const pal = PAINT[id.slice(2).toLowerCase()]
      twigs(g, cx, cy + TILE * 0.42, cx, cy, TILE * 0.36, 5, rand)
      cluster(g, cx, cy, TILE * 0.4, pal, rand, { leaf: 17, count: 2300 })
    } else if (id.startsWith('crown')) paintCrown(g, ox, oy, id === 'crownWide', id === 'crownB' ? PAINT.olive : PAINT.fresh, rand)
    else if (id === 'bush') {
      twigs(g, cx, cy + TILE * 0.4, cx, cy + TILE * 0.05, TILE * 0.3, 6, rand)
      for (const [dx, dy, r] of [[-0.2, 0.12, 0.25], [0.22, 0.14, 0.26], [0, -0.06, 0.3]] as const) cluster(g, cx + dx * TILE, cy + dy * TILE, TILE * r, PAINT.fresh, rand, { leaf: 11, count: 650 })
    } else if (id === 'fern') paintFern(g, ox, oy, rand)
    else if (id.startsWith('banana')) paintBanana(g, ox, oy, rand)
    else paintBamboo(g, ox, oy, rand)
    g.restore()
  }
  atlas = new CanvasTexture(c)
  atlas.colorSpace = SRGBColorSpace
  atlas.minFilter = LinearMipmapLinearFilter
  atlas.anisotropy = 4
  return atlas
}

/** One leaf: a pointed blade from its stalk at (x, y) out along `ang` (canvas radians), `len` long, with a midrib. */
function leaf(g: CanvasRenderingContext2D, x: number, y: number, ang: number, len: number, fill: string, rib: string | null) {
  const w = len * 0.42
  g.save()
  g.translate(x, y)
  g.rotate(ang)
  g.beginPath()
  g.moveTo(0, 0)
  g.quadraticCurveTo(len * 0.42, -w, len, 0)
  g.quadraticCurveTo(len * 0.42, w * 0.9, 0, 0)
  g.fillStyle = fill
  g.fill()
  if (rib) {
    g.strokeStyle = rib
    g.lineWidth = Math.max(0.6, len * 0.05)
    g.beginPath()
    g.moveTo(len * 0.08, 0)
    g.lineTo(len * 0.8, 0)
    g.stroke()
  }
  g.restore()
}

/** Thin twigs from (x0, y0) branching up into the cluster round (cx, cy) (they show in the gaps between the leaves). */
function twigs(g: CanvasRenderingContext2D, x0: number, y0: number, cx: number, cy: number, R: number, n: number, rand: () => number) {
  g.lineCap = 'round'
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (rand() - 0.5) * 2.2
    const len = R * (0.6 + rand() * 0.5)
    const mx = cx + Math.cos(a) * len * 0.45
    const my = cy + Math.sin(a) * len * 0.45
    g.strokeStyle = BARK[Math.floor(rand() * 2)]
    g.lineWidth = 2.6 + rand() * 1.6
    g.beginPath()
    g.moveTo(x0 + (rand() - 0.5) * 6, y0)
    g.quadraticCurveTo(mx, my + R * 0.2, cx + Math.cos(a) * len, cy + Math.sin(a) * len)
    g.stroke()
  }
}

/** A cluster of leaves round (cx, cy), `R` px across its middle: lumps of leaves (an uneven outline), painted in three
 *  passes, back to front. Each leaf's light: where it sits on the cluster as a ball (lit top left), plus where it sits
 *  on its lump, darker deep inside and underneath (`shade` shifts it all: a cluster in a crown's shadow). */
function cluster(g: CanvasRenderingContext2D, cx: number, cy: number, R: number, P: string[], rand: () => number, o: { leaf: number; count: number; shade?: number }) {
  const lumps: [number, number, number][] = [[0, 0, 0.6]]
  for (let i = 0, n = 4 + Math.floor(rand() * 3); i < n; i++) {
    const a = rand() * Math.PI * 2
    const d = 0.3 + rand() * 0.25
    lumps.push([Math.cos(a) * d, Math.sin(a) * d * 0.85, 0.32 + rand() * 0.2])
  }
  const inside = (u: number, v: number) => lumps.find(([x, y, r]) => (u - x) ** 2 + (v - y) ** 2 < r * r)
  const passes = [
    { share: 0.36, depth: 0.55, lift: -0.42 },
    { share: 0.4, depth: 0.85, lift: -0.1 },
    { share: 0.24, depth: 1, lift: 0.18 },
  ]
  for (const pass of passes) {
    const n = Math.round(o.count * pass.share)
    for (let i = 0, tries = 0; i < n && tries < n * 6; tries++) {
      const u = (rand() * 2 - 1) * pass.depth
      const v = (rand() * 2 - 1) * pass.depth
      const lump = inside(u, v)
      if (!lump) continue
      i++
      const r2 = Math.min(1, u * u + v * v)
      const z = Math.sqrt(1 - r2)
      const lu = (u - lump[0]) / lump[2]
      const lv = (v - lump[1]) / lump[2]
      const lz = Math.sqrt(Math.max(0, 1 - lu * lu - lv * lv))
      const big = u * L[0] + v * L[1] + z * L[2]
      const own = lu * L[0] + lv * L[1] + lz * L[2]
      // Deep inside and low down is in the shade of the rest of the cluster.
      const ao = 0.55 + 0.45 * Math.sqrt(r2) - Math.max(0, -v) * 0.25
      let shade = (0.45 + big * 0.35 + own * 0.3) * ao + pass.lift + (o.shade ?? 0) + (rand() - 0.5) * 0.28
      shade = Math.max(0, Math.min(0.999, shade))
      const t = Math.min(P.length - 1, Math.floor(shade * P.length))
      // Leaves point out from the twig below the middle, give or take.
      const ang = Math.atan2(-(v + 0.5), u) + (rand() - 0.5) * 1.3
      const len = o.leaf * (0.7 + rand() * 0.6) * (0.8 + 0.2 * pass.depth)
      leaf(g, cx + u * R, cy - v * R, ang, len, P[t], t >= 2 ? P[Math.max(0, t - 2)] : null)
    }
  }
}

/** A whole crown for the far forest: a trunk and its limbs, and clusters of leaves set round them with gaps between, the
 *  back and the low ones darker. `wide`: the tall trees' flat spreading crown. */
function paintCrown(g: CanvasRenderingContext2D, ox: number, oy: number, wide: boolean, P: string[], rand: () => number) {
  const cx = ox + TILE / 2
  const base = oy + TILE - 6
  const top = oy + TILE * (wide ? 0.22 : 0.08)
  const cy = oy + TILE * 0.42
  const rx = TILE * (wide ? 0.46 : 0.4)
  const ry = TILE * (wide ? 0.22 : 0.34)
  // The trunk and its limbs.
  g.lineCap = 'round'
  g.strokeStyle = BARK[1]
  g.lineWidth = 9
  g.beginPath()
  g.moveTo(cx, base)
  g.lineTo(cx + 3, cy + ry * 0.4)
  g.stroke()
  const tips: [number, number][] = []
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i / 6 - 0.5) * (wide ? 2.6 : 2.1)
    const ex = cx + Math.cos(a) * rx * (0.65 + rand() * 0.3)
    const ey = cy + Math.sin(a) * ry * (0.7 + rand() * 0.3)
    g.strokeStyle = BARK[i % 2]
    g.lineWidth = 3 + rand() * 3
    g.beginPath()
    g.moveTo(cx + 2, cy + ry * 0.45)
    g.quadraticCurveTo((cx + ex) / 2, (cy + ry * 0.4 + ey) / 2 + 10, ex, ey)
    g.stroke()
    tips.push([ex, ey])
  }
  // Clusters: on the limbs' tips and between, the back ones first.
  const spots: [number, number, number, number][] = []
  for (const [x, y] of tips) spots.push([x, y, TILE * (0.13 + rand() * 0.05), rand() * 0.4])
  for (let i = 0; i < 12; i++) {
    const a = rand() * Math.PI * 2
    const d = Math.sqrt(rand()) * 0.85
    spots.push([cx + Math.cos(a) * rx * d, Math.max(top + 20, cy + Math.sin(a) * ry * d), TILE * (0.1 + rand() * 0.06), rand()])
  }
  spots.sort((a, b) => a[3] - b[3])
  for (const [x, y, r, depth] of spots) {
    const v = (cy - y) / ry
    const u = (x - cx) / rx
    cluster(g, x, y, r, P, rand, { leaf: 8, count: 520, shade: -0.2 + depth * 0.22 + v * 0.1 - u * 0.06 })
  }
}

/** Paints in meters on a card `w` wide and `h` tall (its bottom middle at 0, 0; y up), so it looks right stretched. */
function meters(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number) {
  g.setTransform(TILE / w, 0, 0, -TILE / h, ox + TILE / 2, oy + TILE)
}

/** A fern on a card FERN_W wide and FERN_H tall: fronds arching out of the ground, each a stem lined with pairs of small
 *  leaflets that shrink toward the tip, lighter on top. */
export const FERN_W = 2.4
export const FERN_H = 1.4
function paintFern(g: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  g.save()
  meters(g, ox, oy, FERN_W, FERN_H)
  const P = PAINT.fresh
  for (let i = 0; i < 11; i++) {
    const a = (i / 10 - 0.5) * 2.3 + (rand() - 0.5) * 0.2
    const len = 0.85 + rand() * 0.3 - Math.abs(a) * 0.12
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 0.08) pts.push([Math.sin(a) * len * t * 0.95, Math.cos(a) * len * t * 1.05 - Math.abs(Math.sin(a)) * t * t * 0.45])
    const back = Math.abs(a) < 0.5 ? 0 : 1
    g.strokeStyle = P[1]
    g.lineWidth = 0.018
    g.beginPath()
    pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
    for (let k = 1; k < pts.length; k++) {
      const [x, y] = pts[k]
      const [px, py] = pts[k - 1]
      const dir = Math.atan2(y - py, x - px)
      const size = 0.13 * (1 - k / pts.length) + 0.03
      for (const side of [-1, 1]) {
        const ang = dir + side * 1.15
        const tone = Math.min(5, Math.max(0, 1 + back + Math.round(y * 2.5 + (side > 0 ? 0.5 : 0) + (rand() - 0.5))))
        g.fillStyle = P[tone]
        g.save()
        g.translate(x, y)
        g.rotate(ang)
        g.beginPath()
        g.ellipse(size * 0.5, 0, size * 0.5, size * 0.16, 0, 0, Math.PI * 2)
        g.fill()
        g.restore()
      }
    }
  }
  g.restore()
}

const BANANA = ['#24391A', '#36521F', '#4C6E29', '#668C34', '#86A848', '#B2C46E']

/** A banana plant on a card 4.2 m wide and 4.6 m tall: a stem with old leaf sheaths, big paddle leaves fanning out of its
 *  top (the young ones up, the old ones arching over, brown at the tips), each with its midrib, fine side veins and a
 *  few tears right through. */
function paintBanana(g: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  g.save()
  meters(g, ox, oy, 4.2, 4.6)
  g.fillStyle = '#5E6E34'
  g.beginPath()
  g.moveTo(-0.17, 0)
  g.lineTo(-0.1, 2.3)
  g.lineTo(0.1, 2.3)
  g.lineTo(0.19, 0)
  g.fill()
  g.strokeStyle = '#7C6A3E'
  g.lineWidth = 0.03
  for (let y = 0.3; y < 2.2; y += 0.35) {
    g.beginPath()
    g.moveTo(-0.14, y)
    g.quadraticCurveTo(0, y + 0.12, 0.15, y)
    g.stroke()
  }
  const leaves = [-1.95, 1.9, -1.35, 1.3, -0.65, 0.6, -0.15, 0.22, -2.3, 2.25].map((a, i) => ({ a: a + (rand() - 0.5) * 0.2, back: i < 4, old: Math.abs(a) > 2, len: 1.5 + rand() * 0.45 }))
  for (const lf of leaves) {
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 0.08) {
      const droop = Math.abs(lf.a) > 1 ? t * t * 1.3 * (Math.abs(lf.a) - 0.8) : t * t * 0.25
      pts.push([Math.sin(lf.a) * lf.len * t, 2.3 + Math.cos(lf.a) * lf.len * t - droop])
    }
    const side = (k: number) =>
      pts.map(([x, y], i) => {
        const [nx, ny] = i < pts.length - 1 ? [pts[i + 1][0] - x, pts[i + 1][1] - y] : [x - pts[i - 1][0], y - pts[i - 1][1]]
        const l = Math.hypot(nx, ny) || 1
        const w = Math.sin((i / (pts.length - 1)) * Math.PI) ** 0.6 * 0.3 * k
        return [x - (ny / l) * w, y + (nx / l) * w] as [number, number]
      })
    const top = side(1)
    const bottom = side(-1)
    const shade = lf.back ? 0 : 2
    for (const [half, tone] of [[top, shade + 2], [bottom, shade + 1]] as const) {
      g.fillStyle = BANANA[tone]
      g.beginPath()
      g.moveTo(pts[0][0], pts[0][1])
      for (const [x, y] of half) g.lineTo(x, y)
      for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1])
      g.fill()
      // Fine side veins, slanting out to the edge.
      g.strokeStyle = BANANA[Math.max(0, tone - 1)]
      g.lineWidth = 0.008
      for (let i = 1; i < pts.length - 1; i++)
        for (const f of [0, 0.5]) {
          const a = pts[i]
          const b = half[Math.min(pts.length - 1, i + 1)]
          g.beginPath()
          g.moveTo(a[0] + (pts[i + 1][0] - a[0]) * f, a[1] + (pts[i + 1][1] - a[1]) * f)
          g.lineTo(b[0], b[1])
          g.stroke()
        }
    }
    // An old leaf goes brown and dry at the tip.
    if (lf.old) {
      g.fillStyle = '#8A7442'
      g.beginPath()
      const k0 = Math.floor(pts.length * 0.6)
      g.moveTo(pts[k0][0], pts[k0][1])
      for (let i = k0; i < pts.length; i++) g.lineTo(top[i][0], top[i][1])
      for (let i = pts.length - 1; i >= k0; i--) g.lineTo(bottom[i][0], bottom[i][1])
      g.fill()
    }
    g.strokeStyle = lf.back ? '#7E9850' : '#B9C98A'
    g.lineWidth = 0.035
    g.beginPath()
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
    g.globalCompositeOperation = 'destination-out'
    g.lineWidth = 0.03
    for (let k = 0; k < 4; k++) {
      const i = 3 + Math.floor(rand() * 8)
      const [x, y] = pts[i]
      const [ex, ey] = (rand() < 0.5 ? top : bottom)[i]
      g.beginPath()
      g.moveTo(x + (ex - x) * 0.25, y + (ey - y) * 0.25)
      g.lineTo(ex + (ex - x) * 0.2, ey + (ey - y) * 0.2)
      g.stroke()
    }
    g.globalCompositeOperation = 'source-over'
  }
  g.restore()
}

/** A clump of bamboo on a card BAMBOO_W wide and 9.5 m tall: canes fanning up from one root and arching out, darker
 *  rings at their joints, and sprays of narrow pointed leaves from their upper halves, the outer ones in the sun (all of
 *  it inside the card). */
export const BAMBOO_W = 8
function paintBamboo(g: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  g.save()
  meters(g, ox, oy, BAMBOO_W, 9.5)
  const P = PAINT.young
  const canes: [number, number][][] = []
  for (let i = 0; i < 12; i++) {
    const lean = (i / 11 - 0.5) * 0.56 + (rand() - 0.5) * 0.1
    const len = 7.4 + rand() * 1.4
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 0.1) pts.push([(i / 11 - 0.5) * 0.4 + Math.sin(lean) * len * t + lean * t * t * 0.5, Math.cos(lean * 0.6) * len * t - Math.abs(lean) * t * t * 1.6])
    canes.push(pts)
  }
  // Back canes, then the leaves, then the front canes.
  const drawCane = (pts: [number, number][], i: number) => {
    g.strokeStyle = ['#5D6A31', '#76843E', '#8C984A'][i % 3]
    g.lineWidth = 0.085
    g.beginPath()
    pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
    g.fillStyle = '#3E4722'
    for (let k = 1; k < pts.length - 2; k++) g.fillRect(pts[k][0] - 0.055, pts[k][1], 0.11, 0.04)
  }
  canes.forEach((p, i) => i % 2 === 0 && drawCane(p, i))
  for (const pts of canes)
    for (let k = 4; k < pts.length; k++) {
      const [x, y] = pts[k]
      for (let i = 0; i < 22; i++) {
        const lx = x + (rand() - 0.5) * 0.9
        const ly = y + (rand() - 0.75) * 0.9
        const out = Math.abs(lx) / (BAMBOO_W / 2)
        const tone = Math.max(0, Math.min(5, Math.round(1 + out * 2 + (ly / 9.5) * 1.5 + (rand() - 0.5) * 1.6)))
        g.fillStyle = P[tone]
        g.save()
        g.translate(lx, ly)
        g.rotate(-Math.PI / 2 + Math.sign(lx || 1) * (0.5 + rand() * 0.9))
        g.beginPath()
        g.moveTo(0, 0)
        g.quadraticCurveTo(0.11, 0.035, 0.26, 0)
        g.quadraticCurveTo(0.11, -0.035, 0, 0)
        g.fill()
        g.restore()
      }
    }
  canes.forEach((p, i) => i % 2 === 1 && drawCane(p, i))
  g.restore()
}

let mat: ShaderMaterial | null = null
/** The trees' material: an InstancedMesh of 1x1 cards (centered), each turned to the screen (an upright one only
 *  round its stem) and sized by its instance matrix's scale (x across, y up), showing atlas tile `aTile` (plus UPRIGHT
 *  for an upright card), tinted by the instance color, in the fog. The edge is cut sharp at every distance (the atlas's
 *  small mip levels would otherwise thin the crowns out far away). */
export function crownMaterial() {
  if (mat) return mat
  mat = new ShaderMaterial({
    uniforms: UniformsUtils.merge([UniformsLib.fog, { uMap: { value: null }, uGrid: { value: [COLS, ROWS] }, uSize: { value: [COLS * TILE, ROWS * TILE] } }]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      attribute float aTile;
      uniform vec2 uGrid;
      varying vec2 vUv;
      varying vec3 vTint;
      void main() {
        mat4 m = modelMatrix * instanceMatrix;
        vec3 c = m[3].xyz;
        float sx = length(m[0].xyz);
        float sy = length(m[1].xyz);
        float upright = step(${UPRIGHT}.0 - 0.5, aTile);
        float tileN = aTile - ${UPRIGHT}.0 * upright;
        // The camera's right and up: flat to the screen, or (upright) turned round the stem only.
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        vec3 level = vec3(right.x, 0.0, right.z);
        right = mix(right, level / max(length(level), 1e-4), upright);
        up = mix(up, vec3(0.0, 1.0, 0.0), upright);
        vec4 mvPosition = viewMatrix * vec4(c + right * position.x * sx + up * position.y * sy, 1.0);
        // (A leaf cluster stands a little toward the camera from its middle, as a round clump's front would.)
        mvPosition.xyz -= normalize(mvPosition.xyz) * min(sx, sy) * 0.2 * (1.0 - upright);
        gl_Position = projectionMatrix * mvPosition;
        vec2 tile = vec2(mod(tileN, uGrid.x), floor(tileN / uGrid.x));
        // (Rows count down from the top of the canvas.)
        vUv = vec2((tile.x + uv.x) / uGrid.x, 1.0 - (tile.y + 1.0 - uv.y) / uGrid.y);
        vTint = instanceColor;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform sampler2D uMap;
      uniform vec2 uSize;
      varying vec2 vUv;
      varying vec3 vTint;
      void main() {
        vec4 t = texture2D(uMap, vUv);
        // How far down the mip levels this is: lift the alpha there so far crowns keep their full shape.
        vec2 dx = dFdx(vUv * uSize);
        vec2 dy = dFdy(vUv * uSize);
        float lod = max(0.5 * log2(max(dot(dx, dx), dot(dy, dy))), 0.0);
        float a = t.a * (1.0 + lod * 0.28);
        if (a < 0.5) discard;
        gl_FragColor = vec4(t.rgb * vTint, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
    fog: true,
  })
  mat.uniforms.uMap.value = crownAtlas()
  return mat
}
