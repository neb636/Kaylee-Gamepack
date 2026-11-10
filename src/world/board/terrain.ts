// The board itself: the continents as low pastel land with sandy shores (each continent its own color), her countries
// standing up out of them like slices of cake in their real shapes (pieces.ts), the sea that foams along every shore,
// and the toy tray it all sits in. Everything here is still; world.ts makes things move.
import { BufferAttribute, BufferGeometry, CanvasTexture, Color, DataTexture, DataUtils, Group, HalfFloatType, LinearFilter, Mesh, MeshToonMaterial, PlaneGeometry, RedFormat, ShaderMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../engine3d/dispose'
import { merge, P, solid } from '../engine3d/geo'
import { toonGradient } from '../engine3d/toon'
import type { Field } from './field'
import { BOARD, COMPASS, continentAt, LEVEL, proj, toLat, toLon, type ContinentId, type XZ } from './geo'
import type { LonLat } from './places'

/** Ground mesh cells per unit, and painted pixels per unit. */
const MESH = 14
const TEX = 56

type RGB = [number, number, number]
const hex = (c: string): RGB => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]

/** Each continent's color: the flat land, a darker blot, its hills, its mountain tops. */
const TINT: Record<ContinentId, [RGB, RGB, RGB, RGB]> = {
  northAmerica: [hex('#C6EFCB'), hex('#B4E7BF'), hex('#A0DCB2'), hex('#8CCFA6')],
  southAmerica: [hex('#FFD9BC'), hex('#FFCDAA'), hex('#F8BD98'), hex('#EEAC88')],
  europe: [hex('#DDD2FA'), hex('#D0C3F5'), hex('#C2B3EE'), hex('#B3A2E4')],
  africa: [hex('#FCEBAC'), hex('#F9E199'), hex('#F2D287'), hex('#E8C177')],
  asia: [hex('#FFCBDD'), hex('#FFBCD2'), hex('#F9AAC5'), hex('#EE98B6')],
  australia: [hex('#FFD3A6'), hex('#FFC792'), hex('#F8B880'), hex('#EEA870')],
  antarctica: [hex('#F8FCFF'), hex('#ECF5FF'), hex('#DDEBFB'), hex('#CFE0F5')],
}
const SAND = hex('#FFF0C9')
const WET = hex('#FBE3B0')
const SNOW = hex('#F8FCFF')

/** A cheap wobble (about -1..1) so painted edges aren't ruler-straight. */
const wobble = (x: number, z: number) => 0.5 * Math.sin(x * 7.3 + z * 3.1) + 0.3 * Math.sin(x * 3.7 - z * 5.9) + 0.2 * Math.sin(x * 13.1 + z * 11.3)

/** The low land: one mesh shaped by the field (only where there is land or shore), with its painted top. */
export function buildLand(field: Field, bag: Bag) {
  const nx = Math.round(BOARD.w * MESH)
  const nz = Math.round(BOARD.d * MESH)
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3)
  const uv = new Float32Array((nx + 1) * (nz + 1) * 2)
  const dry = new Uint8Array((nx + 1) * (nz + 1))
  let i = 0
  for (let r = 0; r <= nz; r++) {
    const z = BOARD.z0 + (r / nz) * BOARD.d
    for (let c = 0; c <= nx; c++, i++) {
      const x = BOARD.x0 + (c / nx) * BOARD.w
      pos.set([x, field.height(x, z), z], i * 3)
      uv.set([c / nx, 1 - r / nz], i * 2)
      dry[i] = field.land(x, z) > -0.16 ? 1 : 0
    }
  }
  const index: number[] = []
  for (let r = 0; r < nz; r++) {
    for (let c = 0; c < nx; c++) {
      const a = r * (nx + 1) + c
      const b = a + nx + 1
      // (Open sea: nothing to draw, the water covers it.)
      if (!(dry[a] || dry[a + 1] || dry[b] || dry[b + 1])) continue
      index.push(a, b, a + 1, a + 1, b, b + 1)
    }
  }
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  geo.setIndex(index)
  geo.computeVertexNormals()
  const tex = bag.add(new CanvasTexture(paint(field)))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const mat = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  return new Mesh(geo, mat)
}

/** The great rivers, painted on the low land. */
const RIVERS: LonLat[][] = [
  // The Amazon, the Mississippi, the Nile above Egypt, the Congo, the Volga, the Ganges, the Ob, the Lena, the Danube.
  [[-73.5, -4.5], [-68, -3.2], [-62, -3.4], [-56, -2.3], [-50.5, -0.8]],
  [[-93.5, 46.5], [-91, 41], [-90, 36], [-91.2, 32], [-89.8, 29.4]],
  [[32.6, 0.5], [31.6, 6], [32.6, 12], [33, 16.5], [31.2, 19.6], [32.4, 21.9]],
  [[26, -8], [24.5, -1], [19, 1.6], [16, -2.8], [12.6, -5.9]],
  [[36, 56.6], [44.5, 56], [49, 53.4], [45.2, 49], [47.8, 46.2]],
  [[78.2, 29.8], [81.5, 25.6], [86, 25.4], [89.6, 23]],
  [[84, 52.5], [77, 57], [69, 61], [69, 66.4]],
  [[108, 54.5], [116, 59.8], [127, 62], [126.5, 71.5]],
  [[10, 48.2], [17, 47.8], [21, 44.6], [28.6, 45.2]],
]

function paint(field: Field) {
  const w = Math.round(BOARD.w * TEX)
  const h = Math.round(BOARD.d * TEX)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const img = g.createImageData(w, h)
  const data = img.data
  let o = 0
  for (let y = 0; y < h; y++) {
    const z = BOARD.z0 + (y + 0.5) / TEX
    const lat = toLat(z)
    for (let x = 0; x < w; x++, o += 4) {
      const px = BOARD.x0 + (x + 0.5) / TEX
      const sl = field.land(px, z)
      let col: RGB
      if (sl < -0.2) {
        // (Never seen: deep under the sea.)
        col = WET
      } else {
        const n = wobble(px * 3, z * 3)
        if (sl < 0.012) col = WET
        else {
          const lon = toLon(px + n * 0.035)
          const where = continentAt(lon, lat + n * 0.4)
          const tint = TINT[where]
          const up = field.swell(px, z)
          col = up > 0.085 + n * 0.008 ? tint[3] : up > 0.04 + n * 0.008 ? tint[2] : wobble(px * 1.1 + 4, z * 1.3) > 0.42 ? tint[1] : tint[0]
          // Snow in the far north (Greenland, the top of Canada and Siberia), in two wobbly bands.
          if (where !== 'antarctica') {
            const cold = lat + n * 1.6 + (lon > -60 && lon < -15 ? 9 : 0)
            if (cold > 74.5) col = SNOW
            else if (cold > 70) col = mix(col, SNOW, 0.55)
          }
          if (sl < 0.04 + n * 0.006) col = where === 'antarctica' ? tint[2] : SAND
        }
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
  // The big lakes, with a pale shore.
  for (const lake of field.lakes) {
    g.beginPath()
    lake.forEach((p, i) => (i ? g.lineTo(...px(p)) : g.moveTo(...px(p))))
    g.closePath()
    g.strokeStyle = '#F2FBFF'
    g.lineWidth = TEX * 0.05
    g.stroke()
    g.fillStyle = '#9EDDF2'
    g.fill()
  }
  for (const r of RIVERS) {
    curve(g, r.map((p) => px(proj(p))))
    g.strokeStyle = '#F2FBFF'
    g.lineWidth = TEX * 0.075
    g.stroke()
    g.strokeStyle = '#9EDDF2'
    g.lineWidth = TEX * 0.04
    g.stroke()
  }
  return c
}

/** A smooth line through the points (the path is left open for the caller to stroke). */
export function curve(g: CanvasRenderingContext2D, q: [number, number][]) {
  g.beginPath()
  g.moveTo(...q[0])
  for (let i = 0; i < q.length - 1; i++) {
    const [p0, p1, p2, p3] = [q[Math.max(0, i - 1)], q[i], q[i + 1], q[Math.min(q.length - 1, i + 2)]]
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1])
  }
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
    // (The patterns were drawn for a board a quarter this size: the same numbers, on a finer grain.)
    vec2 p = vWorld.xz * 3.2;
    float d = texture2D(uSea, (vWorld.xz - uMap.xy) * uMap.zw).r * 3.2;
    float wob = 0.014 * sin(p.x * 8.0 + uTime * 0.9) + 0.014 * sin(p.y * 9.0 - uTime * 0.7);
    float dd = d + wob;
    // Three flat bands of water: pale by the beach, turquoise, then deeper blue.
    vec3 col = dd < 0.17 ? uShallow : (dd < 0.62 ? uMid : uDeep);
    // Slow lighter blots far out, so the open sea isn't one flat color.
    float blot = sin(p.x * 0.5 + uTime * 0.11) * sin(p.y * 0.42 - uTime * 0.09) + 0.4 * sin((p.x + p.y) * 1.1 + uTime * 0.05);
    if (dd >= 0.62 && blot > 0.45) col = uLight;
    // Foam: a white line that breathes along every shore, and rings that drift out from it and fade.
    float edge = 0.04 + 0.016 * sin(uTime * 1.3 + p.x * 2.6 + p.y * 2.1);
    float foam = step(dd, edge);
    float k = (d - uTime * 0.028) * 6.5;
    float ring = step(fract(k), 0.17) * (1.0 - smoothstep(0.1, 0.5, d));
    ring *= step(0.34, hash(floor(p * 2.2) + floor(k)));
    foam = max(foam, ring * 0.85);
    // Little wave dashes on the open sea, drifting.
    vec2 q = vec2(p.x * 1.5 + uTime * 0.12, p.y * 3.1);
    vec2 cell = floor(q);
    vec2 f = fract(q);
    float dash = step(0.94, hash(cell)) * step(0.2, f.x) * step(f.x, 0.75) * step(0.4, f.y) * step(f.y, 0.6) * step(0.3, d);
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
    this.mat = bag.add(
      new ShaderMaterial({
        uniforms: {
          uSea: { value: tex },
          uMap: { value: [s.x0, s.z0, 1 / (s.x1 - s.x0), 1 / (s.z1 - s.z0)] },
          uTime: { value: 0 },
          uShallow: { value: new Color('#C2F5EC') },
          uMid: { value: new Color('#8BE3EA') },
          uDeep: { value: new Color('#74D0F2') },
          uLight: { value: new Color('#7DD6F4') },
        },
        vertexShader: seaVertex,
        fragmentShader: seaFragment,
      }),
    )
    this.mesh = new Mesh(bag.add(new PlaneGeometry(BOARD.w, BOARD.d)), this.mat)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.position.set((BOARD.x0 + BOARD.x1) / 2, 0, (BOARD.z0 + BOARD.z1) / 2)
  }

  update(t: number) {
    this.mat.uniforms.uTime.value = t
  }
}

/** The compass rose, painted flat on the sea in her colors (its long pink point to the north). */
export function buildCompass(bag: Bag) {
  const S = 256
  const c = document.createElement('canvas')
  c.width = c.height = S
  const g = c.getContext('2d')!
  const x = S / 2
  const y = S / 2
  const R = S * 0.36
  g.globalAlpha = 0.92
  g.fillStyle = '#FFFFFF'
  g.beginPath()
  g.arc(x, y, R * 0.8, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = '#D9CCFF'
  g.lineWidth = S * 0.025
  g.stroke()
  const point = (a: number, len: number, light: string, dark: string) => {
    const tip: [number, number] = [x + Math.sin(a) * len, y - Math.cos(a) * len]
    for (const [k, col] of [[-1, light], [1, dark]] as const) {
      g.fillStyle = col
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + Math.sin(a + k * 0.78) * R * 0.2, y - Math.cos(a + k * 0.78) * R * 0.2)
      g.lineTo(...tip)
      g.closePath()
      g.fill()
    }
  }
  for (let i = 0; i < 4; i++) point(Math.PI / 4 + (i * Math.PI) / 2, R * 0.62, '#E9E0FF', '#CDBBF7')
  for (let i = 1; i < 4; i++) point((i * Math.PI) / 2, R * 0.95, '#BFE3FF', '#8FC7F2')
  point(0, R * 1.25, '#FFB3CF', '#FF6FA8')
  g.fillStyle = '#FFC83D'
  g.beginPath()
  g.arc(x, y, R * 0.1, 0, Math.PI * 2)
  g.fill()
  const tex = bag.add(new CanvasTexture(c))
  tex.colorSpace = SRGBColorSpace
  const mat = bag.add(new MeshToonMaterial({ map: tex, transparent: true, depthWrite: false, gradientMap: toonGradient() }))
  const m = new Mesh(bag.add(new PlaneGeometry(3.4, 3.4)), mat)
  m.rotation.x = -Math.PI / 2
  const [cx, cz] = proj(COMPASS)
  m.position.set(cx, 0.006, cz)
  m.renderOrder = 1
  return m
}

/** The toy tray the map sits in: a cream rim with a pink edge on a lavender base. */
export function buildTray(bag: Bag): Group {
  const w = BOARD.w
  const d = BOARD.d
  const rim = 0.8
  const top = LEVEL.land + 0.22
  const parts = []
  for (const s of [-1, 1]) {
    parts.push(P.rbox(rim, 1.8, d + rim * 2, 0.26, '#FFF7F0', { at: [s * (w / 2 + rim / 2 - 0.04), top - 0.9, 0] }))
    parts.push(P.rbox(w + rim * 2, 1.8, rim, 0.26, '#FFF7F0', { at: [0, top - 0.9, s * (d / 2 + rim / 2 - 0.04)] }))
  }
  parts.push(P.rbox(w + rim * 2 + 0.7, 1.4, d + rim * 2 + 0.7, 0.45, '#FFA8C9', { at: [0, top - 1.85, 0] }))
  parts.push(P.rbox(w + rim * 2 + 0.15, 1.4, d + rim * 2 + 0.15, 0.45, '#CDBBF7', { at: [0, top - 3.0, 0] }))
  const tray = solid(merge(parts), bag, 2)
  tray.position.set((BOARD.x0 + BOARD.x1) / 2, 0, (BOARD.z0 + BOARD.z1) / 2)
  return tray
}
