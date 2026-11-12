// The map's board: Thailand standing up out of a turquoise sea like a slice of cake (its real coastline, land.ts), the
// neighbours as low cream paper land, the painted top (forest, rice fields, beaches, rivers, a dotted trail between the
// places), the sea that foams along every shore, and the toy tray it all sits in. Everything here is still; world.ts
// makes things move.
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, DataTexture, DataUtils, Group, HalfFloatType, LinearFilter, Mesh, MeshToonMaterial, PlaneGeometry, RedFormat, ShaderMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { merge, solid } from '../../../../../engine3d/geo'
import { toonGradient } from '../../../../../engine3d/toon'
import type { Field } from './field'
import { trayParts } from '../../../trip/sky'
import { BOARD, LEVEL, PINS, toX, toZ } from './geo'
import { OTHERS, THAI, type LonLat } from './land'

/** Ground mesh cells per degree, and painted pixels per degree. */
const MESH = 20
const TEX = 92

const C = {
  paper: [255, 245, 226],
  paperDark: [252, 237, 212],
  sand: [255, 236, 190],
  wet: [250, 222, 168],
  cliff: [244, 200, 158],
  cliffLow: [229, 172, 130],
  rim: [222, 247, 178],
  plain: [182, 233, 160],
  isan: [203, 238, 160],
  south: [164, 228, 172],
  forest: [136, 213, 150],
  deep: [108, 196, 138],
  peak: [92, 180, 132],
} satisfies Record<string, [number, number, number]>

// The painted top, once a visit per field (about a million lookups; the field is the same every visit, field.ts).
const painted = new WeakMap<Field, HTMLCanvasElement>()

/** The land: one mesh shaped by the field, with its painted top. */
export function buildLand(field: Field, bag: Bag) {
  const nx = Math.round((BOARD.lon1 - BOARD.lon0) * MESH)
  const nz = Math.round((BOARD.lat1 - BOARD.lat0) * MESH)
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3)
  const uv = new Float32Array((nx + 1) * (nz + 1) * 2)
  let i = 0
  for (let r = 0; r <= nz; r++) {
    const lat = BOARD.lat1 - (r / nz) * (BOARD.lat1 - BOARD.lat0)
    for (let c = 0; c <= nx; c++, i++) {
      const lon = BOARD.lon0 + (c / nx) * (BOARD.lon1 - BOARD.lon0)
      pos.set([toX(lon), field.height(lon, lat), toZ(lat)], i * 3)
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
  const mat = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  return new Mesh(geo, mat)
}

/** A cheap wobble (about -1..1) so painted edges aren't ruler-straight. */
const wobble = (lon: number, lat: number) => 0.5 * Math.sin(lon * 7.3 + lat * 3.1) + 0.3 * Math.sin(lon * 3.7 - lat * 5.9) + 0.2 * Math.sin(lon * 13.1 + lat * 11.3)

/** The trails between the places (lon, lat): stepping-stone dots she can follow with her eyes. */
const TRAILS: LonLat[][] = [
  [PINS[1].at, [100.45, 15.3], [100.2, 16.4], [100.3, 17.5], [100.6, 18.3], PINS[0].at],
  [PINS[1].at, [100.1, 13.5], [99.85, 12.4], [99.55, 11.3], [99.2, 10.2], [99.05, 9.2], PINS[2].at],
  [PINS[1].at, [101.2, 13.5], [101.6, 12.85]],
]

function paint(field: Field) {
  const w = Math.round((BOARD.lon1 - BOARD.lon0) * TEX)
  const h = Math.round((BOARD.lat1 - BOARD.lat0) * TEX)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  const data = img.data
  let o = 0
  for (let y = 0; y < h; y++) {
    const lat = BOARD.lat1 - ((y + 0.5) / h) * (BOARD.lat1 - BOARD.lat0)
    for (let x = 0; x < w; x++, o += 4) {
      const lon = BOARD.lon0 + ((x + 0.5) / w) * (BOARD.lon1 - BOARD.lon0)
      const st = field.thai(lon, lat)
      const sl = field.land(lon, lat)
      let col: [number, number, number]
      if (st < -0.085) {
        // The neighbours (and the sea bed): cream paper with a sandy shore.
        const n = wobble(lon * 0.6, lat * 0.6)
        col = sl < 0.02 ? C.wet : sl < 0.1 + n * 0.02 ? C.sand : n > 0.35 ? C.paperDark : C.paper
      } else if (st < 0) {
        // Thailand's cut edge, in two layers like cake.
        col = st < -0.04 ? C.cliffLow : C.cliff
      } else {
        const n = wobble(lon, lat)
        const up = field.swell(lon, lat) * Math.min(1, st / 0.4)
        if (sl < 0.1 + n * 0.015 && st < 0.085 + n * 0.015) col = C.sand
        else if (st < 0.035) col = C.rim
        else if (up > 0.2 + n * 0.02) col = C.peak
        else if (up > 0.12 + n * 0.02) col = C.deep
        else if (up > 0.05 + n * 0.015) col = C.forest
        else if (lat < 12.4 + n * 0.25) col = C.south
        else if (lon > 101.55 + n * 0.2 && lat > 14.3 + n * 0.15) col = C.isan
        else col = C.plain
      }
      data[o] = col[0]
      data[o + 1] = col[1]
      data[o + 2] = col[2]
      data[o + 3] = 255
    }
  }
  g.putImageData(img, 0, 0)

  const px = ([lon, lat]: LonLat): [number, number] => [(lon - BOARD.lon0) * TEX, (BOARD.lat1 - lat) * TEX]
  const trace = (pts: LonLat[], close = true) => {
    pts.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    if (close) g.closePath()
  }
  /** A smooth line through the points. */
  const curve = (pts: LonLat[]) => {
    const q = pts.map(px)
    g.beginPath()
    g.moveTo(...q[0])
    for (let i = 0; i < q.length - 1; i++) {
      const [p0, p1, p2, p3] = [q[Math.max(0, i - 1)], q[i], q[i + 1], q[Math.min(q.length - 1, i + 2)]]
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1])
    }
  }
  g.lineCap = g.lineJoin = 'round'

  // ---- On the neighbours' paper: dashed borders, and the Mekong running along Laos.
  g.save()
  g.beginPath()
  g.rect(0, 0, w, h)
  THAI.forEach((r) => trace(r))
  g.clip('evenodd')
  g.strokeStyle = '#DCCBF2'
  g.lineWidth = TEX * 0.035
  g.setLineDash([TEX * 0.1, TEX * 0.1])
  for (const r of OTHERS) {
    g.beginPath()
    trace(r)
    g.stroke()
  }
  g.setLineDash([])
  const mekong: LonLat[] = [[100.1, 20.42], [100.45, 20.32], [100.62, 19.9], [101.1, 19.75], [101.42, 19.1], [101.25, 18.4], [101.35, 17.75], [102.1, 18.35], [102.75, 18.0], [103.1, 18.55], [104.0, 18.5], [104.95, 17.4], [104.95, 16.4], [105.75, 15.75], [105.75, 14.85], [106.0, 13.9], [105.95, 12.6]]
  curve(mekong)
  g.strokeStyle = '#F2FBFF'
  g.lineWidth = TEX * 0.17
  g.stroke()
  g.strokeStyle = '#A4DFF4'
  g.lineWidth = TEX * 0.11
  g.stroke()
  // Little hills doodled on the paper, like an old picture map.
  let dseed = 3
  const drnd = () => ((dseed = (dseed * 9301 + 49297) % 233280) / 233280)
  g.strokeStyle = '#EBCFAE'
  g.lineWidth = TEX * 0.028
  for (let i = 0; i < 260; i++) {
    const lon = BOARD.lon0 + drnd() * (BOARD.lon1 - BOARD.lon0)
    const lat = BOARD.lat0 + drnd() * (BOARD.lat1 - BOARD.lat0)
    if (field.land(lon, lat) < 0.3 || field.thai(lon, lat) > -0.35) continue
    const [x, y] = px([lon, lat])
    const r = TEX * (0.1 + drnd() * 0.06)
    g.beginPath()
    g.arc(x, y, r, Math.PI * 1.12, Math.PI * 1.88)
    g.stroke()
    g.beginPath()
    g.arc(x + r * 1.25, y + r * 0.15, r * 0.7, Math.PI * 1.15, Math.PI * 1.85)
    g.stroke()
  }
  g.restore()

  // ---- On Thailand's top (never over its sandy rim).
  const inland = (lon: number, lat: number, far: number) => field.thai(lon, lat) > far
  // Rice fields: a patchwork on the central plain and across Isan.
  const greens = ['#D6F2A2', '#C4EA94', '#E9F4A6', '#BDE9B4', '#F6EFA8']
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const field1 = (lon: number, lat: number) => {
    if (!inland(lon, lat, 0.22) || field.swell(lon, lat) > 0.035) return
    const [x, y] = px([lon, lat])
    const fw = TEX * (0.2 + rnd() * 0.07)
    const fh = TEX * (0.14 + rnd() * 0.05)
    g.save()
    g.translate(x, y)
    g.rotate((rnd() - 0.5) * 0.25)
    g.fillStyle = greens[Math.floor(rnd() * greens.length)]
    g.beginPath()
    g.roundRect(-fw / 2, -fh / 2, fw, fh, TEX * 0.03)
    g.fill()
    // Rows of rice.
    g.strokeStyle = 'rgba(255,255,255,0.55)'
    g.lineWidth = TEX * 0.012
    for (let k = -1; k <= 1; k++) {
      g.beginPath()
      g.moveTo(-fw * 0.34, (k * fh) / 4)
      g.lineTo(fw * 0.34, (k * fh) / 4)
      g.stroke()
    }
    g.restore()
  }
  for (let lat = 14.55; lat < 17.75; lat += 0.235) for (let lon = 101.9 + ((lat * 7) % 0.2); lon < 105.3; lon += 0.31) if (rnd() < 0.78) field1(lon + (rnd() - 0.5) * 0.06, lat + (rnd() - 0.5) * 0.04)
  for (let lat = 13.95; lat < 17.1; lat += 0.235) for (let lon = 99.55 + ((lat * 5) % 0.2); lon < 101.2; lon += 0.31) if (rnd() < 0.7) field1(lon + (rnd() - 0.5) * 0.06, lat + (rnd() - 0.5) * 0.04)

  // Rivers: the Chao Phraya down to Bangkok and the sea, the Mun across Isan.
  const river = (pts: LonLat[], wide: number) => {
    curve(pts)
    g.strokeStyle = '#F2FBFF'
    g.lineWidth = TEX * (wide + 0.055)
    g.stroke()
    g.strokeStyle = '#A4DFF4'
    g.lineWidth = TEX * wide
    g.stroke()
  }
  river([[99.15, 18.6], [99.3, 17.6], [99.75, 16.6], [100.1, 15.75], [100.3, 14.95], [100.48, 14.2], [100.52, 13.45]], 0.085)
  river([[100.75, 18.3], [100.45, 17.3], [100.2, 16.4], [100.1, 15.75]], 0.06)
  river([[102.35, 15.05], [103.3, 15.3], [104.3, 15.2], [105.3, 15.25]], 0.06)

  // The dotted trails from Bangkok to the other places.
  g.fillStyle = '#FFFFFF'
  for (const t of TRAILS) {
    const q = t.map(px)
    let carry = 0
    const gap = TEX * 0.16
    for (let i = 0; i < q.length - 1; i++) {
      const len = Math.hypot(q[i + 1][0] - q[i][0], q[i + 1][1] - q[i][1])
      for (let d = carry; d < len; d += gap) {
        const x = q[i][0] + ((q[i + 1][0] - q[i][0]) * d) / len
        const y = q[i][1] + ((q[i + 1][1] - q[i][1]) * d) / len
        const lon = BOARD.lon0 + x / TEX
        const lat = BOARD.lat1 - y / TEX
        if (!inland(lon, lat, 0.06)) continue
        g.fillStyle = 'rgba(214,126,160,0.55)'
        g.beginPath()
        g.arc(x, y + TEX * 0.012, TEX * 0.05, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = '#FFFFFF'
        g.beginPath()
        g.arc(x, y, TEX * 0.045, 0, Math.PI * 2)
        g.fill()
      }
      carry = (carry + Math.ceil((len - carry) / gap) * gap - len) % gap
    }
  }
  return c
}

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
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vWorld.xz;
    float d = texture2D(uSea, (p - uMap.xy) * uMap.zw).r;
    float wob = 0.014 * sin(p.x * 8.0 + uTime * 0.9) + 0.014 * sin(p.y * 9.0 - uTime * 0.7);
    float dd = d + wob;
    // Three flat bands of water: pale by the beach, turquoise, then deeper blue.
    vec3 col = dd < 0.15 ? uShallow : (dd < 0.55 ? uMid : uDeep);
    // Slow lighter blots far out, so the open sea isn't one flat color.
    float blot = sin(p.x * 0.9 + uTime * 0.11) * sin(p.y * 0.75 - uTime * 0.09) + 0.4 * sin((p.x + p.y) * 2.1 + uTime * 0.05);
    if (dd >= 0.55 && blot > 0.5) col = uLight;
    // Foam: a white line that breathes along every shore, and rings that drift out from it and fade.
    float edge = 0.034 + 0.014 * sin(uTime * 1.3 + p.x * 2.6 + p.y * 2.1);
    float foam = step(dd, edge);
    float k = (d - uTime * 0.028) * 6.5;
    float ring = step(fract(k), 0.17) * (1.0 - smoothstep(0.1, 0.5, d));
    ring *= step(0.34, hash(floor(p * 2.2) + floor(k)));
    foam = max(foam, ring * 0.85);
    // Little wave dashes on the open sea, drifting.
    vec2 q = vec2(p.x * 2.2 + uTime * 0.12, p.y * 4.5);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float dash = step(0.9, hash(cell)) * step(0.2, f.x) * step(f.x, 0.75) * step(0.4, f.y) * step(f.y, 0.62) * step(0.3, d);
    foam = max(foam, dash * 0.75);
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
    tex.needsUpdate = true
    const x0 = toX(s.lon0)
    const z0 = toZ(s.lat1)
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          uSea: { value: tex },
          uMap: { value: [x0, z0, 1 / (toX(s.lon1) - x0), 1 / (toZ(s.lat0) - z0)] },
          uTime: { value: 0 },
          uShallow: { value: new Color('#B9F3EA') },
          uMid: { value: new Color('#7FE0E6') },
          uDeep: { value: new Color('#6CCDF0') },
          uLight: { value: new Color('#7FD8F4') },
        },
        vertexShader: seaVertex,
        fragmentShader: seaFragment,
      }),
    )
    const w = toX(BOARD.lon1) - toX(BOARD.lon0)
    const d = toZ(BOARD.lat0) - toZ(BOARD.lat1)
    this.mesh = new Mesh(bag.add(new PlaneGeometry(w, d)), this.mat)
    this.mesh.rotation.x = -Math.PI / 2
  }

  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}

/** The toy tray the map sits in: a cream rim with a pink edge on a lavender base. */
export function buildTray(bag: Bag): Group {
  const w = toX(BOARD.lon1) - toX(BOARD.lon0)
  const d = toZ(BOARD.lat0) - toZ(BOARD.lat1)
  return solid(merge(trayParts(w, d, LEVEL.paper + 0.1)), bag, 2)
}
