// The Nan forest's painted trees (forest.ts; Dad's references, 2026-10-28: the trick games use for forests, a flat
// picture that looks like a full tree whichever way you see it). Each crown is a card that always faces the camera,
// painted with a crown of leaves: dozens of clusters of little leaves, the whole crown lit from the top left like one
// big ball and each cluster rounded on its own, darker underneath and in the hollows, a ragged edge where clusters
// stick out. All the cards lie parallel to the screen, so they never cut into each other: nearer crowns simply cover
// the ones behind, like a painting. A card is two triangles, so the hills can be thick with them.
//
// Banana plants and bamboo clumps are painted too, on cards that stand upright and only turn round their stem (from
// above they'd otherwise tip over).
//
// The pictures are painted on a canvas when the drive opens (seeded, the same every time), into one atlas.
import { CanvasTexture, LinearMipmapLinearFilter, ShaderMaterial, SRGBColorSpace, UniformsLib, UniformsUtils } from 'three'
import { rng } from './build'

/** Which picture in the atlas. */
export const CROWN = { lime: 0, green: 1, deep: 2, olive: 3, wide: 4, bush: 5, pink: 6, gold: 7, banana: 8, bamboo: 9, banana2: 10, bamboo2: 11 } as const
export type CrownId = keyof typeof CROWN
/** Cards with these pictures stand upright (their tile number plus this, in `aTile`). */
export const UPRIGHT = 50
const COLS = 4
const ROWS = 3
const TILE = 512

/** Each crown's leaves, darkest (deep shade) to lightest (sunlit tips). */
const PAINT: Record<string, string[]> = {
  lime: ['#24461C', '#3F7428', '#62A034', '#8FC74B', '#C3E77A'],
  green: ['#1C4425', '#336E35', '#519645', '#7DBD5C', '#B3DE87'],
  deep: ['#163720', '#28582F', '#3F7F3E', '#64A552', '#97CA79'],
  olive: ['#33441D', '#53682C', '#7B913F', '#A6BA5C', '#D4DE92'],
  wide: ['#1F4524', '#376E34', '#579346', '#84BB5E', '#BBDE8E'],
  bush: ['#22502A', '#3A7A38', '#5DA24A', '#8BC864', '#C0E68F'],
  pink: ['#7E2F58', '#B44E82', '#E27BAD', '#FBA9CC', '#FFDDEC'],
  gold: ['#7F5A12', '#B6851B', '#E5B12C', '#FBD45A', '#FFEFA6'],
}

/** The crown's outline as lumps (-1..1 across, -1 bottom .. 1 top): x, y, radius. */
function lumps(id: string, rand: () => number): [number, number, number][] {
  if (id === 'wide') return [[-0.55, -0.1, 0.38], [0.55, -0.08, 0.38], [0, 0.08, 0.48], [-0.28, -0.22, 0.34], [0.3, -0.24, 0.34], [0, -0.3, 0.3], [-0.8, -0.2, 0.2], [0.82, -0.18, 0.2]]
  if (id === 'bush') return [[0, -0.2, 0.6], [-0.45, -0.38, 0.42], [0.45, -0.36, 0.44], [0.1, 0.18, 0.42]]
  const out: [number, number, number][] = [[0, 0, 0.55]]
  const n = 6 + Math.floor(rand() * 3)
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.6
    const d = 0.4 + rand() * 0.14
    out.push([Math.cos(a) * d, Math.sin(a) * d * 0.88 - 0.04, 0.3 + rand() * 0.14])
  }
  out.push([(rand() - 0.5) * 0.4, 0.52 + rand() * 0.1, 0.3])
  return out
}

let atlas: CanvasTexture | null = null
/** The atlas of painted trees (painted once a visit). */
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
    const rand = rng(101 + k * 7)
    if (id.startsWith('banana')) paintBanana(g, ox, oy, rand)
    else if (id.startsWith('bamboo')) paintBamboo(g, ox, oy, rand)
    else paintCrown(g, ox, oy, id, rand)
  }
  atlas = new CanvasTexture(c)
  atlas.colorSpace = SRGBColorSpace
  atlas.minFilter = LinearMipmapLinearFilter
  atlas.anisotropy = 4
  return atlas
}

/** Light from the top left and a little in front. */
const LX = -0.5
const LY = 0.65
const LZ = 0.57

/** Paints one crown into the tile at (ox, oy): a dark mass, then clusters of leaves from the back and bottom to the
 *  front and top. Each leaf's light: mostly where it sits on the crown as a whole (one big ball), partly where it sits
 *  on its own cluster, darker low in the crown, a little noise. */
function paintCrown(g: CanvasRenderingContext2D, ox: number, oy: number, id: string, rand: () => number) {
  const P = PAINT[id]
  const L = lumps(id, rand)
  const R = TILE * 0.45
  const cx = ox + TILE / 2
  const cy = oy + TILE / 2
  const px = (x: number) => cx + x * R
  const py = (y: number) => cy - y * R
  const inside = (x: number, y: number, m = 1) => L.some(([lx, ly, lr]) => (x - lx) ** 2 + (y - ly) ** 2 < (lr * m) ** 2)
  // The crown as one ball: its middle and size (for the big light).
  const wide = id === 'wide' ? 1.05 : id === 'bush' ? 0.75 : 0.78
  const tall = id === 'wide' ? 0.45 : id === 'bush' ? 0.6 : 0.78
  const mid = id === 'bush' ? -0.2 : 0
  // The dark mass under the leaves.
  g.fillStyle = P[0]
  for (const [x, y, r] of L) {
    g.beginPath()
    g.arc(px(x), py(y), r * R * 0.86, 0, Math.PI * 2)
    g.fill()
  }
  // The clusters: spots inside the outline, the edge ones poking out a little.
  const clusters: [number, number, number, number][] = []
  for (let tries = 0; clusters.length < (id === 'bush' ? 26 : 70) && tries < 3000; tries++) {
    const x = (rand() * 2 - 1) * 1.05
    const y = (rand() * 2 - 1) * 1.05
    if (!inside(x, y, 0.98)) continue
    const r = (id === 'bush' ? 0.13 : 0.1) + rand() * 0.07
    // How far toward the viewer it sits on the big ball: the back ones are painted first.
    const u = x / wide
    const v = (y - mid) / tall
    const front = Math.sqrt(Math.max(0, 1 - u * u - v * v))
    clusters.push([x, y, r, front + (rand() - 0.5) * 0.3])
  }
  clusters.sort((a, b) => a[3] - b[3])
  const small = id === 'bush' ? 0.7 : 1
  for (const [x, y, r] of clusters) {
    const n = Math.round(r * r * 26000)
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2
      const d = Math.sqrt(rand()) * 1.08
      const lu = Math.cos(a) * d
      const lv = Math.sin(a) * d
      const lz = Math.sqrt(Math.max(0, 1 - Math.min(1, lu * lu + lv * lv)))
      const X = x + lu * r
      const Y = y + lv * r
      const u = Math.max(-1, Math.min(1, X / wide))
      const v = Math.max(-1, Math.min(1, (Y - mid) / tall))
      const gz = Math.sqrt(Math.max(0, 1 - u * u - v * v))
      const big = u * LX + v * LY + gz * LZ
      const own = lu * LX + lv * LY + lz * LZ
      let shade = big * 0.6 + own * 0.38 + 0.28
      shade -= Math.max(0, -(Y - mid)) * 0.18
      shade += (rand() - 0.5) * 0.3
      const t = Math.max(0, Math.min(0.999, shade)) * (P.length - 1)
      g.fillStyle = P[Math.min(P.length - 1, Math.floor(t + rand() * 0.5))]
      const s = (2.6 + rand() * 3.6) * small
      g.save()
      g.translate(px(X), py(Y))
      g.rotate(rand() * Math.PI)
      g.beginPath()
      g.ellipse(0, 0, s, s * 0.42, 0, 0, Math.PI * 2)
      g.fill()
      g.restore()
    }
  }
}

/** Paints in meters on a card `w` wide and `h` tall (its bottom middle at 0, 0; y up), so it looks right stretched. */
function meters(g: CanvasRenderingContext2D, ox: number, oy: number, w: number, h: number) {
  g.setTransform(TILE / w, 0, 0, -TILE / h, ox + TILE / 2, oy + TILE)
}
const leafColors = ['#3C7A2E', '#5A9B3A', '#7DBB4A', '#A3D564', '#C9EA8C']

/** A banana plant on a card 4.2 m wide and 4.6 m tall: a pale green stem and big paddle leaves fanning out of its top,
 *  the young ones standing up, the old ones arching over and hanging, each with its pale midrib and a few tears. */
function paintBanana(g: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  g.save()
  meters(g, ox, oy, 4.2, 4.6)
  g.fillStyle = '#7FA04A'
  g.beginPath()
  g.moveTo(-0.16, 0)
  g.lineTo(-0.1, 2.3)
  g.lineTo(0.1, 2.3)
  g.lineTo(0.18, 0)
  g.fill()
  g.fillStyle = '#A2BE68'
  g.fillRect(-0.04, 0, 0.07, 2.25)
  // Back leaves first (darker), the front ones last; angles from straight up.
  const leaves = [-1.9, 1.85, -1.3, 1.25, -0.6, 0.55, -0.15, 0.2, -2.25, 2.2].map((a, i) => ({ a: a + (rand() - 0.5) * 0.2, back: i < 4, len: 1.5 + rand() * 0.45 }))
  for (const leaf of leaves) {
    // Along a curve: out from the top of the stem, bending down more the further out it leans.
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 0.1) {
      const droop = Math.abs(leaf.a) > 1 ? t * t * 1.3 * (Math.abs(leaf.a) - 0.8) : t * t * 0.25
      pts.push([Math.sin(leaf.a) * leaf.len * t, 2.3 + Math.cos(leaf.a) * leaf.len * t - droop])
    }
    const wid = 0.28
    const side = (k: number) =>
      pts.map(([x, y], i) => {
        const [nx, ny] = i < pts.length - 1 ? [pts[i + 1][0] - x, pts[i + 1][1] - y] : [x - pts[i - 1][0], y - pts[i - 1][1]]
        const l = Math.hypot(nx, ny) || 1
        const w = Math.sin((i / (pts.length - 1)) * Math.PI) ** 0.6 * wid * k
        return [x - (ny / l) * w, y + (nx / l) * w] as [number, number]
      })
    const top = side(1)
    const bottom = side(-1)
    for (const [half, shade] of [[top, leaf.back ? 1 : 3], [bottom, leaf.back ? 0 : 2]] as const) {
      g.fillStyle = leafColors[shade]
      g.beginPath()
      g.moveTo(pts[0][0], pts[0][1])
      for (const [x, y] of half) g.lineTo(x, y)
      for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0], pts[i][1])
      g.fill()
    }
    g.strokeStyle = leaf.back ? '#8DBB5A' : '#D6EE9E'
    g.lineWidth = 0.04
    g.beginPath()
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
    // Tears in the leaf, cut right through (the card shows what's behind).
    g.globalCompositeOperation = 'destination-out'
    g.lineWidth = 0.035
    for (let k = 0; k < 3; k++) {
      const i = 3 + Math.floor(rand() * 6)
      const [x, y] = pts[i]
      const [ex, ey] = (rand() < 0.5 ? top : bottom)[i]
      g.beginPath()
      g.moveTo(x + (ex - x) * 0.3, y + (ey - y) * 0.3)
      g.lineTo(ex + (ex - x) * 0.2, ey + (ey - y) * 0.2)
      g.stroke()
    }
    g.globalCompositeOperation = 'source-over'
  }
  g.restore()
}

/** A clump of bamboo on a card 5 m wide and 9.5 m tall: canes fanning up from one root and arching out, dark rings at
 *  their joints, and sprays of narrow leaves hanging from their upper halves. */
function paintBamboo(g: CanvasRenderingContext2D, ox: number, oy: number, rand: () => number) {
  g.save()
  meters(g, ox, oy, 5, 9.5)
  const canes: [number, number][][] = []
  for (let i = 0; i < 11; i++) {
    const lean = (i / 10 - 0.5) * 1.1 + (rand() - 0.5) * 0.15
    const len = 7.6 + rand() * 1.6
    const pts: [number, number][] = []
    for (let t = 0; t <= 1.0001; t += 0.1) pts.push([(i / 10 - 0.5) * 0.5 + Math.sin(lean) * len * t + lean * t * t * 1.4, Math.cos(lean * 0.6) * len * t - Math.abs(lean) * t * t * 1.6])
    canes.push(pts)
    g.strokeStyle = ['#8DA548', '#A2B95A', '#7E9640'][i % 3]
    g.lineWidth = 0.09
    g.beginPath()
    pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.stroke()
    g.fillStyle = '#5E7230'
    for (let k = 1; k < pts.length - 2; k++) g.fillRect(pts[k][0] - 0.06, pts[k][1], 0.12, 0.05)
  }
  // The leaves: narrow, hanging down and out from the upper halves of the canes, light on the outside of the clump.
  for (const pts of canes)
    for (let k = 4; k < pts.length; k++) {
      const [x, y] = pts[k]
      for (let i = 0; i < 26; i++) {
        const lx = x + (rand() - 0.5) * 1.1
        const ly = y + (rand() - 0.7) * 0.9
        const shade = 1 + (ly / 9.5) * 2.2 + (rand() - 0.5) * 1.6
        g.fillStyle = leafColors[Math.max(0, Math.min(4, Math.round(shade)))]
        g.save()
        g.translate(lx, ly)
        g.rotate(-Math.PI / 2 + Math.sign(lx || 1) * (0.5 + rand() * 0.9))
        g.beginPath()
        g.ellipse(0, 0, 0.22, 0.045, 0, 0, Math.PI * 2)
        g.fill()
        g.restore()
      }
    }
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
        // (A crown stands a little toward the camera from its middle, as a round crown's front would: it covers its own
        // trunk.)
        mvPosition.xyz -= normalize(mvPosition.xyz) * min(sx, sy) * 0.25 * (1.0 - upright);
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
