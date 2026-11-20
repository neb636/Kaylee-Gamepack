// The still board of the Canada map: Canada standing up out of a cold blue sea like a slice of cake, painted in a few
// big calm bands (the snowy north, the green forest, the golden prairie, the lavender rock of the Rockies and the deep
// green rainforest coast beyond them), with little lakes and rivers, spruce woods, a ridge of chunky snow-capped toy
// peaks, the neighbours as low cream paper, the sea that foams softly along every shore, and the toy tray it sits in.
// world.ts makes things move. (The sea's shader is the Thailand map's idea, kept here so Canada stands on its own.)
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, DataTexture, DataUtils, Group, HalfFloatType, LinearFilter, Mesh, MeshToonMaterial, PlaneGeometry, RedFormat, ShaderMaterial, SRGBColorSpace } from 'three'
import { trayParts } from '../../../engine3d/board'
import type { Bag } from '../../../engine3d/dispose'
import { merge, P, solid } from '../../../engine3d/geo'
import { toonGradient } from '../../../engine3d/toon'
import { BOARD, fromRockies, LEVEL, PLACES, PRAIRIE, wobble, type Field, type XZ } from './shape'

/** Ground mesh cells per unit, and painted pixels per unit. */
const MESH = 14
const TEX = 64

const C = {
  paper: [255, 246, 228],
  paperDark: [251, 236, 213],
  wet: [246, 226, 190],
  cliff: [246, 214, 186],
  cliffLow: [232, 188, 156],
  shore: [255, 243, 214],
  snow: [255, 255, 255],
  snowShade: [238, 241, 255],
  tundra: [226, 241, 222],
  forest: [146, 214, 156],
  forestDark: [126, 202, 142],
  rain: [104, 190, 136],
  rock: [214, 206, 236],
  prairie: [248, 222, 128],
  prairieLight: [252, 234, 166],
} satisfies Record<string, [number, number, number]>

/** The snow line: north of it (smaller z) it's white. */
export const snowLine = (x: number, z: number) => -1.55 + wobble(x, z) * 0.12 + Math.sin(x * 0.7) * 0.12
/** Inside the prairie's rounded box (0 at its edge, more inside). */
export function inPrairie(x: number, z: number) {
  const [x0, z0, x1, z1] = PRAIRIE
  const n = wobble(x * 1.3, z * 1.3) * 0.08
  return Math.min(x - x0, x1 - x, z - z0, z1 - z) + n
}

const painted = new WeakMap<Field, HTMLCanvasElement>()

/** The land: one mesh shaped by the field, with its painted top. */
export function buildLand(field: Field, bag: Bag) {
  const nx = Math.round((BOARD.x1 - BOARD.x0) * MESH)
  const nz = Math.round((BOARD.z1 - BOARD.z0) * MESH)
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3)
  const uv = new Float32Array((nx + 1) * (nz + 1) * 2)
  let i = 0
  for (let r = 0; r <= nz; r++) {
    const z = BOARD.z0 + (r / nz) * (BOARD.z1 - BOARD.z0)
    for (let c = 0; c <= nx; c++, i++) {
      const x = BOARD.x0 + (c / nx) * (BOARD.x1 - BOARD.x0)
      pos.set([x, field.height(x, z), z], i * 3)
      uv.set([c / nx, 1 - r / nz], i * 2)
    }
  }
  const index = new Uint32Array(nx * nz * 6)
  let k = 0
  for (let r = 0; r < nz; r++) {
    for (let c = 0; c < nx; c++) {
      const a = r * (nx + 1) + c
      const b = a + nx + 1
      index.set([a, b, a + 1, a + 1, b, b + 1], k)
      k += 6
    }
  }
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  geo.setIndex(new BufferAttribute(index, 1))
  geo.computeVertexNormals()
  let top = painted.get(field)
  if (!top) painted.set(field, (top = paint(field)))
  const tex = bag.add(new CanvasTexture(top))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return new Mesh(geo, bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() })))
}

function paint(field: Field) {
  const w = Math.round((BOARD.x1 - BOARD.x0) * TEX)
  const h = Math.round((BOARD.z1 - BOARD.z0) * TEX)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  const data = img.data
  let o = 0
  for (let y = 0; y < h; y++) {
    const z = BOARD.z0 + ((y + 0.5) / h) * (BOARD.z1 - BOARD.z0)
    for (let xx = 0; xx < w; xx++, o += 4) {
      const x = BOARD.x0 + ((xx + 0.5) / w) * (BOARD.x1 - BOARD.x0)
      const sc = field.canada(x, z)
      const sl = field.land(x, z)
      const n = wobble(x, z)
      let col: [number, number, number]
      if (sc < -0.075) {
        // The neighbours (and the sea bed): cream paper with a sandy shore.
        col = sl < 0.02 ? C.wet : wobble(x * 0.8, z * 0.8) > 0.45 ? C.paperDark : C.paper
      } else if (sc < 0) {
        // Canada's cut edge, in two layers like cake.
        col = sc < -0.04 ? C.cliffLow : C.cliff
      } else if (sl < 0.06 + n * 0.012 && sc < 0.07) {
        col = z < snowLine(x, z) + 0.3 ? C.snowShade : C.shore
      } else if (z < snowLine(x, z)) {
        col = n > 0.55 ? C.snowShade : C.snow
      } else if (z < snowLine(x, z) + 0.5) {
        col = C.tundra
      } else {
        const rk = fromRockies(x, z)
        const p = inPrairie(x, z)
        if (rk.d < 0.32 + n * 0.05) col = C.rock
        else if (rk.side < 0) col = C.rain
        else if (p > 0) col = p > 0.12 && wobble(x * 2.1, z * 2.1) > 0.2 ? C.prairieLight : C.prairie
        else col = n > 0.25 ? C.forestDark : C.forest
      }
      data[o] = col[0]
      data[o + 1] = col[1]
      data[o + 2] = col[2]
      data[o + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)
  const px = ([x, z]: XZ): [number, number] => [(x - BOARD.x0) * TEX, (z - BOARD.z0) * TEX]
  g.lineCap = g.lineJoin = 'round'

  // The prairie's fields: stripes of wheat, across.
  g.save()
  g.beginPath()
  g.rect(...px([PRAIRIE[0] + 0.15, PRAIRIE[1] + 0.15]), (PRAIRIE[2] - PRAIRIE[0] - 0.3) * TEX, (PRAIRIE[3] - PRAIRIE[1] - 0.3) * TEX)
  g.clip()
  g.strokeStyle = 'rgba(233,190,92,0.5)'
  g.lineWidth = TEX * 0.035
  for (let z = PRAIRIE[1] + 0.3; z < PRAIRIE[3]; z += 0.32) {
    for (let x = PRAIRIE[0] + 0.25; x < PRAIRIE[2] - 0.2; x += 0.62) {
      const at = px([x + Math.sin(z * 9) * 0.1, z])
      g.beginPath()
      g.moveTo(at[0], at[1])
      g.lineTo(at[0] + TEX * 0.42, at[1])
      g.stroke()
    }
  }
  g.restore()

  // Rivers: the St Lawrence from Lake Ontario to its estuary, the Mackenzie to the Arctic, the Fraser to the Pacific.
  const river = (pts: XZ[], wide: number) => {
    const q = pts.map(px)
    g.beginPath()
    g.moveTo(...q[0])
    for (let i = 1; i < q.length; i++) {
      const [ax, ay] = q[i - 1]
      const [bx, by] = q[i]
      g.quadraticCurveTo(ax, ay, (ax + bx) / 2, (ay + by) / 2)
    }
    g.lineTo(...q[q.length - 1])
    g.strokeStyle = '#F2FBFF'
    g.lineWidth = TEX * (wide + 0.05)
    g.stroke()
    g.strokeStyle = '#9FD6F0'
    g.lineWidth = TEX * wide
    g.stroke()
  }
  river([[2.45, 3.18], [2.75, 2.85], [3.05, 2.55], [3.2, 2.45]], 0.09)
  river([[-4.2, -0.4], [-4.1, -1.2], [-3.75, -1.8], [-3.45, -2.15]], 0.06)
  river([[-4.9, 0.6], [-5.2, 1.6], [-5.5, 2.4], [-5.8, 2.8]], 0.055)
  // Ottawa's canal leaves the river (the Rideau, toward the rink).
  river([[2.75, 2.85], [2.3, 2.7]], 0.05)

  // Little lakes scattered over the forest and the tundra: Canada has more lakes than anywhere.
  let seed = 5
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (let i = 0; i < 70; i++) {
    const x = BOARD.x0 + rnd() * (BOARD.x1 - BOARD.x0)
    const z = BOARD.z0 + rnd() * (BOARD.z1 - BOARD.z0)
    if (field.canada(x, z) < 0.35 || z < snowLine(x, z) - 0.1 || inPrairie(x, z) > -0.15 || fromRockies(x, z).d < 0.6) continue
    if (Object.values(PLACES).some(([px0, pz0]) => Math.hypot(x - px0, z - pz0) < 1.2)) continue
    const [cx, cy] = px([x, z])
    const rx = TEX * (0.08 + rnd() * 0.08)
    const ry = rx * (0.55 + rnd() * 0.4)
    const turn = rnd() * Math.PI
    g.fillStyle = '#F2FBFF'
    g.beginPath()
    g.ellipse(cx, cy, rx + TEX * 0.025, ry + TEX * 0.025, turn, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#A9DCF2'
    g.beginPath()
    g.ellipse(cx, cy, rx, ry, turn, 0, Math.PI * 2)
    g.fill()
  }

  // The border on the paper: a soft dashed lavender line along Canada's foot (the cut edge already shows it).
  g.save()
  g.strokeStyle = '#E3D3F4'
  g.lineWidth = TEX * 0.03
  g.setLineDash([TEX * 0.09, TEX * 0.09])
  g.beginPath()
  g.moveTo(...px([-5.45, -2.45]))
  g.lineTo(...px([-5.45, -1.05]))
  g.stroke()
  g.restore()
  return c
}

// ---------------------------------------------------------------- the sea

const seaVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
// (No variable is called "patch" or "sample": reserved in WebGL2, and the shader would silently fail.)
const seaFragment = /* glsl */ `
  uniform sampler2D uSea;
  uniform vec4 uMap;
  uniform float uTime;
  uniform vec3 uShallow;
  uniform vec3 uMid;
  uniform vec3 uDeep;
  uniform vec3 uLight;
  uniform vec3 uIce;
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vWorld.xz;
    float d = texture2D(uSea, (p - uMap.xy) * uMap.zw).r;
    float wob = 0.012 * sin(p.x * 6.0 + uTime * 0.8) + 0.012 * sin(p.y * 7.0 - uTime * 0.6);
    float dd = d + wob;
    // Three flat bands: pale by the shore, cold blue, deeper blue; the far north's water is icier.
    vec3 col = dd < 0.12 ? uShallow : (dd < 0.42 ? uMid : uDeep);
    float north = smoothstep(-1.6, -2.6, p.y + 0.25 * sin(p.x * 1.3));
    col = mix(col, uIce, north * 0.55);
    float blot = sin(p.x * 0.8 + uTime * 0.1) * sin(p.y * 0.9 - uTime * 0.08) + 0.4 * sin((p.x + p.y) * 1.9 + uTime * 0.05);
    if (dd >= 0.42 && blot > 0.55) col = uLight;
    // Soft foam: a white line that breathes along every shore, and a few rings that drift out and fade.
    float edge = 0.03 + 0.012 * sin(uTime * 1.1 + p.x * 2.2 + p.y * 1.9);
    float foam = step(dd, edge);
    float k = (d - uTime * 0.022) * 6.0;
    float ring = step(fract(k), 0.15) * (1.0 - smoothstep(0.08, 0.38, d));
    ring *= step(0.4, hash(floor(p * 2.0) + floor(k)));
    foam = max(foam, ring * 0.7);
    // A few little wave dashes far out, drifting.
    vec2 q = vec2(p.x * 1.8 + uTime * 0.1, p.y * 4.0);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float dash = step(0.93, hash(cell)) * step(0.2, f.x) * step(f.x, 0.75) * step(0.42, f.y) * step(f.y, 0.6) * step(0.35, d);
    foam = max(foam, dash * 0.6);
    gl_FragColor = vec4(mix(col, vec3(1.0), foam), 1.0);
    #include <colorspace_fragment>
  }
`

/** The sea: one flat plane over the whole board, drawn by a small shader that knows how far each spot is from land. */
export class Sea {
  readonly mesh: Mesh
  private mat: ShaderMaterial
  constructor(field: Field, bag: Bag) {
    const s = field.sea
    const half = new Uint16Array(s.w * s.h)
    for (let i = 0; i < half.length; i++) half[i] = DataUtils.toHalfFloat(s.data[i])
    const tex = bag.add(new DataTexture(half, s.w, s.h, RedFormat, HalfFloatType))
    tex.minFilter = tex.magFilter = LinearFilter
    tex.flipY = false
    tex.needsUpdate = true
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          uSea: { value: tex },
          uMap: { value: [s.x0, s.z0, 1 / (s.x1 - s.x0), 1 / (s.z1 - s.z0)] },
          uTime: { value: 0 },
          uShallow: { value: new Color('#C8F0F2') },
          uMid: { value: new Color('#8ED6EE') },
          uDeep: { value: new Color('#73BFEB') },
          uLight: { value: new Color('#86CDF0') },
          uIce: { value: new Color('#DCEEFB') },
        },
        vertexShader: seaVertex,
        fragmentShader: seaFragment,
      }),
    )
    this.mesh = new Mesh(bag.add(new PlaneGeometry(BOARD.x1 - BOARD.x0, BOARD.z1 - BOARD.z0)), this.mat)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.position.set((BOARD.x0 + BOARD.x1) / 2, 0, (BOARD.z0 + BOARD.z1) / 2)
  }
  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}

// ---------------------------------------------------------------- the tray, the woods and the peaks

export const TRAY = { w: BOARD.x1 - BOARD.x0, d: BOARD.z1 - BOARD.z0, top: LEVEL.paper + 0.12, rim: 0.4, k: 1.15 }

/** The toy tray the map sits in: a cream rim with a pink edge on a lavender base. */
export function buildTray(bag: Bag): Group {
  return solid(merge(trayParts(TRAY.w, TRAY.d, TRAY.top, TRAY.rim, TRAY.k)), bag, 2)
}

/** A chunky spruce, `s` tall, standing on (x, y, z). */
export function spruceParts(x: number, y: number, z: number, s: number, dark = false) {
  const a = dark ? '#3F8F66' : '#4FA673'
  const b = dark ? '#357E5A' : '#418F64'
  return [
    P.cyl(s * 0.05, s * 0.06, s * 0.2, '#8A6248', { at: [x, y + s * 0.1, z] }, 5),
    P.cone(s * 0.3, s * 0.5, b, { at: [x, y + s * 0.42, z] }, 7),
    P.cone(s * 0.22, s * 0.42, a, { at: [x, y + s * 0.72, z] }, 7),
  ]
}

/** The rocky peak: a chunky lavender-grey cone with a white snowcap. */
export function peakParts(x: number, y: number, z: number, r: number, h: number, turn = 0) {
  return [
    P.cone(r, h, '#BBAFDB', { at: [x, y + h / 2, z], rot: [0, turn, 0] }, 6),
    P.cone(r * 0.48, h * 0.48, '#FFFFFF', { at: [x, y + h * 0.765, z], rot: [0, turn, 0] }, 6),
    P.cone(r * 0.6, h * 0.12, '#F3F1FF', { at: [x, y + h * 0.53, z], rot: [0, turn, 0] }, 6),
  ]
}

/** The still scenery: woods across the forest and the rainforest coast, the Rockies' peaks. Places keep clear. */
export function buildScenery(field: Field, bag: Bag) {
  const group = new Group()
  const parts = []
  let seed = 11
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const clear = (x: number, z: number, r: number) => Object.values(PLACES).every(([px, pz]) => Math.hypot(x - px, z - pz) > r)
  // The Rockies: a ridge of big peaks, a few smaller ones beside them.
  const peaks: { x: number; z: number; r: number; h: number }[] = []
  for (let i = 0; i <= 9; i++) {
    const k = i / 9
    const [[ax, az], [bx, bz]] = [
      [-5.25, -1.3],
      [-3.55, 2.75],
    ]
    const x = ax + (bx - ax) * k + (i % 2 ? 0.16 : -0.12)
    const z = az + (bz - az) * k
    const big = i % 3 !== 1
    const r = big ? 0.36 : 0.27
    const h = big ? 0.85 + rnd() * 0.15 : 0.6
    if (!clear(x, z, 1.1)) continue
    peaks.push({ x, z, r, h })
    parts.push(...peakParts(x, field.height(x, z) - 0.02, z, r, h, rnd()))
  }
  // The trees: a dark spruce wood over the forest band, a deeper green one on the coast.
  for (let i = 0; i < 520 && parts.length < 1100; i++) {
    const x = BOARD.x0 + rnd() * (BOARD.x1 - BOARD.x0)
    const z = BOARD.z0 + rnd() * (BOARD.z1 - BOARD.z0)
    const sc = field.canada(x, z)
    if (sc < 0.12 || z < snowLine(x, z) + 0.45 || inPrairie(x, z) > -0.1) continue
    const rk = fromRockies(x, z)
    if (rk.d < 0.45) continue
    if (!clear(x, z, 1.3)) continue
    // Clumps, not an even sprinkle: more where a slow wave says so.
    if (Math.sin(x * 1.7) * Math.sin(z * 2.3 + 1) + wobble(x, z) * 0.4 < -0.1) continue
    const s = 0.24 + rnd() * 0.12
    parts.push(...spruceParts(x, field.height(x, z) - 0.01, z, s, rk.side < 0))
  }
  group.add(solid(merge(parts), bag, 1.2))
  return { group, peaks }
}
