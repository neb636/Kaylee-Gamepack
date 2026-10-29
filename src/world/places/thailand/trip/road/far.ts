// The Nan look's far away (build.ts, `look.jungle`; Dad's photos): range behind range of mountains round the land, each
// one paler and bluer than the one before it until the last is nearly the sky; a sky that's deeper overhead and pale at
// the horizon (it takes the weather's haze, and goes white inside the cloud); and mist lying in the valleys between the
// ridges and hanging on the hillsides, thicker when it's grey or raining.
import { BackSide, BufferAttribute, BufferGeometry, CanvasTexture, CircleGeometry, Color, DoubleSide, Group, Mesh, MeshToonMaterial, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial } from 'three'
import type { Bag } from '../../../../engine3d/dispose'
import { toonGradient } from '../../../../engine3d/toon'
import { fbm, rng, type HeightField } from './build'
import type { Road } from './road'

type Box = { x0: number; x1: number; z0: number; z1: number }

/** The ridges: their greens, and how much of the haze is mixed into each (the furthest nearly sky). */
const RIDGES = [
  { color: '#4F8C5E', haze: 0.12, h: [70, 150], out: 70 },
  { color: '#5E9A78', haze: 0.34, h: [100, 200], out: 260 },
  { color: '#6E9FA0', haze: 0.55, h: [130, 250], out: 470 },
  { color: '#86A9BC', haze: 0.72, h: [150, 290], out: 700 },
]

/** The toon look for a ridge: lit and shaded in bands like everything else, then `haze` of the fog's color mixed in,
 *  and the fog itself thinner on it (it's far off: the normal fog would hide it), but still white inside the cloud. */
function hazy(haze: number, bag: Bag) {
  const m = bag.add(new MeshToonMaterial({ vertexColors: true, gradientMap: toonGradient() }))
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uHaze = { value: haze }
    sh.vertexShader = sh.vertexShader.replace('#include <fog_vertex>', '#include <fog_vertex>\n#ifdef USE_FOG\nvFogDepth *= 0.32;\n#endif')
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uHaze;')
      .replace('#include <fog_fragment>', '#ifdef USE_FOG\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, uHaze);\n#endif\n#include <fog_fragment>')
  }
  m.customProgramCacheKey = () => `hazy-${haze}`
  return m
}

/** Range behind range of mountains in rings round the land (`box`, the ground's footprint), from `y0` (the lowest the
 *  road goes). Each ring: a crest that rises and dips into peaks and saddles, slopes down in front and behind, gullies. */
export function buildRidges(box: Box, y0: number, seed: number, bag: Bag) {
  const g = new Group()
  const cx = (box.x0 + box.x1) / 2
  const cz = (box.z0 + box.z1) / 2
  const hx = (box.x1 - box.x0) / 2
  const hz = (box.z1 - box.z0) / 2
  const N = 180
  const foot = y0 - 40
  RIDGES.forEach((L, k) => {
    const rand = rng(seed * 17 + k * 101)
    const ph = rand() * 100
    // Across the ring from the front foot to the crest and down the back: [how far in or out (m), how high (0..1)].
    const rows: [number, number][] = [[-210, 0], [-150, 0.3], [-90, 0.62], [-40, 0.88], [0, 1], [60, 0.7], [160, 0]]
    const pos: number[] = []
    const col: number[] = []
    const c = new Color(L.color)
    const lit = new Color(L.color).offsetHSL(0, -0.04, 0.06)
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI * 2
      const ca = Math.cos(a)
      const sa = Math.sin(a)
      // The crest: peaks and saddles (ridged noise round the ring, the same at both ends so it closes).
      const n = fbm(ca * 3.2 + ph, sa * 3.2 + ph, seed + k)
      const peak = 1 - Math.abs(fbm(ca * 7 + ph * 2, sa * 7, seed + k + 9))
      const crest = L.h[0] + (L.h[1] - L.h[0]) * (0.5 + 0.35 * n + 0.3 * (peak - 0.5))
      for (const [off, up] of rows) {
        // An ellipse just outside the land, rounder the further out.
        const R = L.out + off
        const x = cx + ca * (hx * 1.08 + R)
        const z = cz + sa * (hz * 1.08 + R)
        const gully = up > 0 && up < 1 ? fbm(ca * 18 + off / 40, sa * 18, seed + k + 3) * 18 * up * (1 - up) * 4 : 0
        pos.push(x, foot + (crest + 40) * up + gully, z)
        const cc = tmp.copy(c).lerp(lit, up)
        col.push(cc.r, cc.g, cc.b)
      }
    }
    const idx: number[] = []
    const R = rows.length
    for (let i = 0; i < N; i++)
      for (let j = 0; j < R - 1; j++) {
        const a = i * R + j
        const b = (i + 1) * R + j
        idx.push(a, a + 1, b, b, a + 1, b + 1)
      }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
    geo.setAttribute('color', new BufferAttribute(new Float32Array(col), 3))
    geo.setIndex(idx)
    geo.computeVertexNormals()
    const mesh = new Mesh(bag.add(geo), hazy(L.haze, bag))
    // (Seen from both sides: from above the 3, the back slopes show.)
    mesh.material.side = DoubleSide
    g.add(mesh)
  })
  // The valley floor under everything, out to the furthest ridge (nothing shows through to the sky below the land).
  const fg = new CircleGeometry(Math.max(hx, hz) * 1.1 + 900, 48).rotateX(-Math.PI / 2)
  const fc = new Color('#4A8752')
  fg.setAttribute('color', new BufferAttribute(new Float32Array(fg.attributes.position.count * 3).map((_, i) => [fc.r, fc.g, fc.b][i % 3]), 3))
  const floor = new Mesh(bag.add(fg), hazy(0.2, bag))
  floor.position.set(cx, foot + 2, cz)
  g.add(floor)
  return g
}
const tmp = new Color()

/** The sky: a dome round the camera, deeper overhead and pale at the horizon. `set` it to the weather's colors (the
 *  horizon is the fog's color, so the far ridges melt into it), and keep it on the camera. */
export function buildSky(bag: Bag) {
  const top = new Color()
  const horizon = new Color()
  const mat = bag.add(
    new ShaderMaterial({
      uniforms: { uTop: { value: top }, uHorizon: { value: horizon } },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        varying vec3 vDir;
        void main() {
          float k = smoothstep(-0.02, 0.5, vDir.y);
          gl_FragColor = vec4(mix(uHorizon, uTop, k * k * (3.0 - 2.0 * k)), 1.0);
          #include <colorspace_fragment>
        }
      `,
      side: BackSide,
      depthWrite: false,
    }),
  )
  const mesh = new Mesh(bag.add(new SphereGeometry(1300, 24, 16)), mat)
  mesh.renderOrder = -10
  mesh.frustumCulled = false
  return {
    mesh,
    set(t: Color, h: Color) {
      top.copy(t)
      horizon.copy(h)
    },
  }
}

let mistTex: CanvasTexture | null = null
/** A soft cloud of mist: a few overlapping round glows, fading out at every edge. */
function mistTexture() {
  if (mistTex) return mistTex
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const x = c.getContext('2d')!
  const rand = rng(7)
  for (let i = 0; i < 14; i++) {
    const px = 50 + rand() * 156
    const py = 58 + (rand() - 0.5) * 30
    const r = 26 + rand() * 30
    const g = x.createRadialGradient(px, py, 0, px, py, r)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 256, 128)
  }
  return (mistTex = new CanvasTexture(c))
}

/** Mist: lying in the valleys between the ridges (long low banks) and hanging on the hillsides away from the road.
 *  `thick` 0..1: a thin haze in the sun, heavy when it rains. */
export function buildMist(road: Road, field: HeightField, box: Box, thick: number, seed: number, bag: Bag) {
  const g = new Group()
  const rand = rng(seed * 3 + 77)
  const mat = (o: number) => bag.add(new SpriteMaterial({ map: mistTexture(), transparent: true, opacity: o, depthWrite: false, fog: true }))
  const banks = mat(0.5 + 0.45 * thick)
  const hangs = mat(0.35 + 0.5 * thick)
  const cx = (box.x0 + box.x1) / 2
  const cz = (box.z0 + box.z1) / 2
  const hx = (box.x1 - box.x0) / 2
  const hz = (box.z1 - box.z0) / 2
  const { y0 } = road.bounds()
  // Banks in the valleys between the ridges.
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2
    const out = [10, 170, 360][i % 3] + rand() * 60
    const s = new Sprite(banks)
    s.position.set(cx + Math.cos(a) * (hx * 1.08 + out), y0 + 5 + rand() * 45, cz + Math.sin(a) * (hz * 1.08 + out))
    const w = 260 + rand() * 260
    s.scale.set(w, w * 0.22, 1)
    g.add(s)
  }
  // Hanging on the hillsides: well away from the road, never in front of it.
  const n = Math.round(8 + 14 * thick)
  for (let i = 0, tries = 0; i < n && tries < 400; tries++) {
    const x = box.x0 + rand() * (box.x1 - box.x0)
    const z = box.z0 + rand() * (box.z1 - box.z0)
    const d = field.dist(x, z)
    if (d < 70 || d > 230) continue
    const s = new Sprite(hangs)
    const w = 70 + rand() * 90
    s.position.set(x, field.at(x, z) + 6 + rand() * 14, z)
    s.scale.set(w, w * 0.3, 1)
    g.add(s)
    i++
  }
  return g
}
