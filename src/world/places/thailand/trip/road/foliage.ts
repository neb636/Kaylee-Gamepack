// The Nan forest's leafy crowns (forest.ts; Dad's reference, 2026-10-29: a sunny stylized forest, big round crowns made
// of many small leaves, soft warm light, every crown a soft ball, smooth brown trunks forking under it). A crown is a
// cloud of small cards spread over a rough ball, each card a painted cluster of leaves. Every card turns to face the
// camera on its own (so none is ever seen edge on), but it's lit as if it sat on the ball's surface: the light comes
// from the top left, so the top of the crown glows yellow-green in the sun and the underside and the deep middle fall
// into a cool shade. The cards sway a little in the wind. No outlines (Dad likes the trees without the black border).
//
// The trunks are smooth tapered 3D trunks that fork into branches reaching up into the crown, softly lit (no toon
// bands). Both are drawn many at once (InstancedMesh).
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Euler,
  IcosahedronGeometry,
  LinearMipmapLinearFilter,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  SRGBColorSpace,
  UniformsLib,
  UniformsUtils,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { rng } from './build'

/** The leaf pictures: broad leaves for the big trees, small ones for the simpler crowns further off, the bushes', and
 *  round petals for the flowering trees. */
const LEAF = { broad: 0, small: 1, bush: 2, blossom: 3 } as const
export type LeafId = keyof typeof LEAF
const LT = 256

let leafTex: CanvasTexture | null = null
/** Clusters of leaves in shades of white (the crown's own green is laid over them): each leaf a pointed oval, lighter
 *  at the tip and along its midrib, darker where it starts, overlapping in a loose fan. */
function leafAtlas() {
  if (leafTex) return leafTex
  const c = document.createElement('canvas')
  c.width = LT * 4
  c.height = LT
  const g = c.getContext('2d')!
  const paint = (tile: number, n: number, len: number, wid: number, seed: number, round = false) => {
    const rand = rng(seed)
    const ox = tile * LT
    g.save()
    g.beginPath()
    g.rect(ox + 2, 2, LT - 4, LT - 4)
    g.clip()
    for (let i = 0; i < n; i++) {
      // From near the middle outward, at any angle; the later (front) ones a little brighter.
      const a = rand() * Math.PI * 2
      const r = Math.sqrt(rand()) * LT * 0.26
      const x = ox + LT / 2 + Math.cos(a) * r
      const y = LT / 2 + Math.sin(a) * r
      const L = len * (0.75 + rand() * 0.5)
      const W = wid * (0.8 + rand() * 0.4)
      const turn = a + (rand() - 0.5) * 1.2
      const lift = 0.62 + (i / n) * 0.3 + (rand() - 0.5) * 0.12
      g.save()
      g.translate(x, y)
      g.rotate(turn)
      const grad = g.createLinearGradient(0, 0, L, 0)
      const v = (k: number) => `rgb(${Math.round(255 * Math.min(1, k))},${Math.round(255 * Math.min(1, k))},${Math.round(255 * Math.min(1, k))})`
      grad.addColorStop(0, v(lift * 0.72))
      grad.addColorStop(1, v(lift * 1.08))
      g.fillStyle = grad
      g.beginPath()
      if (round) g.ellipse(L * 0.5, 0, L * 0.5, W, 0, 0, Math.PI * 2)
      else {
        // A leaf: round near its base, coming to a point.
        g.moveTo(0, 0)
        g.bezierCurveTo(L * 0.3, -W * 1.3, L * 0.75, -W * 0.9, L, 0)
        g.bezierCurveTo(L * 0.75, W * 0.9, L * 0.3, W * 1.3, 0, 0)
      }
      g.fill()
      if (!round) {
        g.strokeStyle = v(lift * 1.15)
        g.lineWidth = Math.max(1, W * 0.12)
        g.beginPath()
        g.moveTo(L * 0.08, 0)
        g.lineTo(L * 0.85, 0)
        g.stroke()
      }
      g.restore()
    }
    g.restore()
  }
  paint(LEAF.broad, 30, 70, 17, 11)
  paint(LEAF.small, 70, 38, 10, 23)
  paint(LEAF.bush, 44, 48, 13, 37)
  paint(LEAF.blossom, 120, 15, 12, 41, true)
  leafTex = new CanvasTexture(c)
  leafTex.colorSpace = SRGBColorSpace
  leafTex.minFilter = LinearMipmapLinearFilter
  leafTex.anisotropy = 4
  return leafTex
}

/** A crown's shape: a smooth ball of radii (rx, ry, rz) whose middle is `y` up (`ball`: 0 a coarse one for far crowns,
 *  1 a rounder one), wrapped in `n` cards `size` meters across showing leaf picture `leaf`, which make its outline
 *  leafy and fluffy. */
export interface CrownShape {
  n: number
  size: number
  y: number
  r: [number, number, number]
  leaf: LeafId
  seed: number
  ball: 0 | 1
}

/** The crown as one geometry: the ball, then four corners per card, each corner knowing its card's middle
 *  (`position`), which corner it is and how the card is turned on screen (`corner`), the way out from the crown's middle
 *  at that card (`normal`), and its size, wind phase, how deep in the crown it sits and its leaf picture (`leaf`; the
 *  ball's are size 0 and picture -1). */
export function crownGeometry(s: CrownShape) {
  const rand = rng(s.seed)
  const pos: number[] = []
  const nor: number[] = []
  const cor: number[] = []
  const leaf: number[] = []
  const idx: number[] = []
  const [rx, ry, rz] = s.r
  // The ball: a little inside the cards, so they make its edge.
  const ball = new IcosahedronGeometry(1, s.ball)
  const bp = ball.attributes.position
  for (let i = 0; i < bp.count; i++) {
    const x = bp.getX(i)
    const y = bp.getY(i)
    const z = bp.getZ(i)
    pos.push(x * rx * 0.9, s.y + y * ry * 0.9, z * rz * 0.9)
    const nl = Math.hypot(x / rx, y / ry, z / rz)
    nor.push(x / rx / nl, y / ry / nl, z / rz / nl)
    cor.push(0, 0, 0)
    leaf.push(0, rand() * 6.28, 0.85, -1)
    idx.push(i)
  }
  ball.dispose()
  for (let i = 0; i < s.n; i++) {
    // A direction (a little more of them up top, where the light is), and how far out along it.
    let dx = 0
    let dy = 0
    let dz = 0
    for (;;) {
      dx = rand() * 2 - 1
      dy = rand() * 2 - 1 + 0.12
      dz = rand() * 2 - 1
      const l = Math.hypot(dx, dy, dz)
      if (l > 0.2 && l <= 1.1) {
        dx /= l
        dy /= l
        dz /= l
        break
      }
    }
    const deep = 0.86 + rand() * 0.2
    const x = dx * rx * deep
    const y = s.y + dy * ry * deep
    const z = dz * rz * deep
    // The way out of the ball here (squashed balls: divide by the radii), nudged a little so it isn't too smooth.
    let nx = dx / rx + (rand() - 0.5) * 0.15
    let ny = dy / ry + (rand() - 0.5) * 0.15
    let nz = dz / rz + (rand() - 0.5) * 0.15
    const nl = Math.hypot(nx, ny, nz)
    nx /= nl
    ny /= nl
    nz /= nl
    const size = s.size * (0.8 + rand() * 0.45)
    const spin = rand() * Math.PI * 2
    const phase = rand() * 6.28
    const base = pos.length / 3
    for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      pos.push(x, y, z)
      nor.push(nx, ny, nz)
      cor.push(cx, cy, spin)
      leaf.push(size, phase, deep, LEAF[s.leaf])
    }
    idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3))
  g.setAttribute('corner', new BufferAttribute(new Float32Array(cor), 3))
  g.setAttribute('leaf', new BufferAttribute(new Float32Array(leaf), 4))
  g.setIndex(idx)
  // (Its cards reach a card's size past the ball.)
  g.computeBoundingSphere()
  g.boundingSphere!.radius += s.size
  return g
}

/** The crowns' look: the instance color is the crown's green; lit, it goes warmer and yellower, in shade cooler and
 *  bluer; deep inside the crown it's darker still. */
const SUN = new Color('#FFF0B8')
const SHADE = new Color('#3F6470')
let mat: ShaderMaterial | null = null
let clock = 0
export function foliageMaterial() {
  if (mat) return mat
  mat = new ShaderMaterial({
    uniforms: UniformsUtils.merge([
      UniformsLib.fog,
      { uMap: { value: null }, uTime: { value: 0 }, uSun: { value: SUN }, uShade: { value: SHADE }, uTiles: { value: 4 }, uSize: { value: [LT * 4, LT] } },
    ]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      attribute vec3 corner;
      attribute vec4 leaf;
      uniform float uTime;
      uniform float uTiles;
      varying vec2 vUv;
      varying vec3 vTint;
      varying float vLight;
      varying float vDeep;
      varying float vBall;
      void main() {
        mat4 m = modelMatrix * instanceMatrix;
        vec4 world = m * vec4(position, 1.0);
        float k = length(m[0].xyz);
        // The card turned on screen by its own spin, a card's size across, swaying a little in the wind.
        vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
        vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
        float c = cos(corner.z);
        float s = sin(corner.z);
        vec2 q = vec2(corner.x * c - corner.y * s, corner.x * s + corner.y * c) * 0.5 * leaf.x * k;
        float sway = sin(uTime * 1.4 + leaf.y + world.x * 0.05) * 0.06 * leaf.x * k * leaf.z;
        world.xyz += right * (q.x + sway) + up * q.y;
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        // Lit as the crown's surface: from the top left of the screen and a little in front.
        vec3 n = normalize(mat3(viewMatrix) * normalize(mat3(m) * normal));
        vLight = dot(n, normalize(vec3(-0.45, 0.8, 0.4)));
        vDeep = leaf.z;
        vBall = step(leaf.w, -0.5);
        vUv = vec2((leaf.w + corner.x * 0.5 + 0.5) / uTiles, corner.y * 0.5 + 0.5);
        vTint = instanceColor;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform sampler2D uMap;
      uniform vec3 uSun;
      uniform vec3 uShade;
      uniform vec2 uSize;
      varying vec2 vUv;
      varying vec3 vTint;
      varying float vLight;
      varying float vDeep;
      varying float vBall;
      void main() {
        vec4 t = texture2D(uMap, vUv);
        vec2 dx = dFdx(vUv * uSize);
        vec2 dy = dFdy(vUv * uSize);
        float lod = max(0.5 * log2(max(dot(dx, dx), dot(dy, dy))), 0.0);
        if (vBall < 0.5 && t.a * (1.0 + lod * 0.3) < 0.5) discard;
        // (The ball is solid and plain: seen between the leaf clusters, it's the shadow among them.)
        t.r = mix(t.r, 0.42, vBall);
        // Soft light: wrapped round the ball, deep leaves in the crown's own shade.
        float light = smoothstep(-0.3, 0.85, vLight) * mix(0.3, 1.0, smoothstep(0.35, 0.95, vDeep));
        // (A cool shade under a green crown; under a pink or gold one a deeper pink or gold, not grey.)
        float green = clamp((vTint.g - max(vTint.r, vTint.b)) * 4.0, 0.0, 1.0);
        vec3 shade = vTint * mix(vec3(0.62, 0.5, 0.55), uShade, green) * 0.85;
        vec3 sun = vTint * uSun * 1.38 + vec3(0.09, 0.1, 0.0);
        vec3 col = mix(shade, sun, light) * (0.7 + 0.42 * t.r);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
    fog: true,
  })
  mat.uniforms.uMap.value = leafAtlas()
  return mat
}
/** Moves the wind on (once a frame: any crown mesh's onBeforeRender). */
export function windTick() {
  const now = performance.now() / 1000
  if (now === clock || !mat) return
  clock = now
  mat.uniforms.uTime.value = now % 1000
}

/** A smooth trunk: tapered, leaning a touch, forking into `forks` branches that reach up and out into the crown at
 *  `top` meters. */
export function trunkGeometry(h: number, r: number, top: number, forks: number, seed: number) {
  const rand = rng(seed)
  const parts: BufferGeometry[] = []
  const part = (g: BufferGeometry, at: Vector3, rot: Euler) => {
    g.applyMatrix4(new Matrix4().compose(at, new Quaternion().setFromEuler(rot), new Vector3(1, 1, 1)))
    g.deleteAttribute('uv')
    parts.push(g)
  }
  part(new CylinderGeometry(r * 0.72, r, h, 7, 1, true), new Vector3(0, h / 2, 0), new Euler())
  // A flared foot where it meets the ground.
  part(new CylinderGeometry(r, r * 1.45, h * 0.12, 7, 1, true), new Vector3(0, h * 0.06, 0), new Euler())
  for (let i = 0; i < forks; i++) {
    const a = (i / forks) * Math.PI * 2 + rand() * 0.8
    const lean = 0.45 + rand() * 0.3
    const L = (top - h) / Math.cos(lean) + 0.6
    const dir = new Vector3(Math.sin(a) * Math.sin(lean), Math.cos(lean), Math.cos(a) * Math.sin(lean))
    const mid = new Vector3(0, h - 0.2, 0).addScaledVector(dir, L / 2)
    part(new CylinderGeometry(r * 0.3, r * 0.55, L, 5, 1, true), mid, new Euler(lean, a, 0, 'YXZ'))
  }
  const g = mergeGeometries(parts, false)!
  for (const p of parts) p.dispose()
  return g
}

