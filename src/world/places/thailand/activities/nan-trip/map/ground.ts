// The Nan map's ground, in the Thailand map's look (hub/map/terrain.ts): Nan stands up out of cream paper like a slice
// of cake (the rest of Thailand round it, Laos past the border), its cut edge in two cake layers. Its top is painted:
// soft greens that darken up the hills, rice-field patchwork in the valleys, the Nan River with its pale banks (it
// spills over the edge onto the paper), cream roads with a dashed middle, a soft shadow under every tree and toy. On
// the paper: little hills doodled like an old picture map and the border with Laos dashed in lilac.
import { BufferAttribute, BufferGeometry, CanvasTexture, Mesh, MeshToonMaterial, ShaderMaterial, SRGBColorSpace } from 'three'
import type { Bag } from '../../../../../engine3d/dispose'
import { toonGradient } from '../../../../../engine3d/toon'
import { BOARD, CLIFF_W, heightAt, hillAt, inNan, LAOS_X, PADDIES, wobble, type XZ } from './layout'

/** Ground mesh cells per meter, and painted pixels per meter. */
const MESH = 52
const TEX = 300

const C = {
  paper: [255, 245, 226],
  paperDark: [252, 237, 212],
  cliff: [244, 200, 158],
  cliffLow: [229, 172, 130],
  rim: [222, 247, 178],
  plain: [182, 233, 160],
  valley: [192, 237, 164],
  forest: [150, 218, 152],
  deep: [124, 204, 142],
  peak: [104, 190, 134],
} satisfies Record<string, [number, number, number]>

export interface GroundInput {
  river: XZ[]
  roads: XZ[][]
  /** Soft shadows painted under things: [x, z, radius]. */
  shadows: [number, number, number][]
  /** Keep the rice fields off these: [x, z, radius]. */
  keep: [number, number, number][]
}

export function buildGround(bag: Bag, input: GroundInput) {
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const nx = Math.round(W * MESH)
  const nz = Math.round(D * MESH)
  const pos = new Float32Array((nx + 1) * (nz + 1) * 3)
  const uv = new Float32Array((nx + 1) * (nz + 1) * 2)
  let i = 0
  for (let r = 0; r <= nz; r++) {
    const z = BOARD.z0 + (r / nz) * D
    for (let c = 0; c <= nx; c++, i++) {
      const x = BOARD.x0 + (c / nx) * W
      pos.set([x, heightAt(x, z), z], i * 3)
      uv.set([c / nx, 1 - r / nz], i * 2)
    }
  }
  const index = new Uint32Array(nx * nz * 6)
  let k = 0
  for (let r = 0; r < nz; r++)
    for (let c = 0; c < nx; c++) {
      const a = r * (nx + 1) + c
      const b = a + nx + 1
      index.set([a, b, a + 1, a + 1, b, b + 1], k)
      k += 6
    }
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(pos, 3))
  geo.setAttribute('uv', new BufferAttribute(uv, 2))
  geo.setIndex(new BufferAttribute(index, 1))
  geo.computeVertexNormals()
  const tex = bag.add(new CanvasTexture(paint(input)))
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  const mat = bag.add(new MeshToonMaterial({ map: tex, gradientMap: toonGradient() }))
  return new Mesh(geo, mat)
}

function paint({ river, roads, shadows, keep }: GroundInput) {
  const W = BOARD.x1 - BOARD.x0
  const D = BOARD.z1 - BOARD.z0
  const w = Math.round(W * TEX)
  const h = Math.round(D * TEX)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  // The colors, worked out at half the texture's size (then drawn up smoothly: the lines go on at full size).
  const bw = Math.round(w / 2)
  const bh = Math.round(h / 2)
  const base = document.createElement('canvas')
  base.width = bw
  base.height = bh
  const bg = base.getContext('2d')!
  const img = bg.createImageData(bw, bh)
  const data = img.data
  let o = 0
  for (let py = 0; py < bh; py++) {
    const z = BOARD.z0 + ((py + 0.5) / bh) * D
    for (let px = 0; px < bw; px++, o += 4) {
      const x = BOARD.x0 + ((px + 0.5) / bw) * W
      const d = inNan(x, z)
      let col: [number, number, number]
      if (d < -CLIFF_W * 0.92) {
        // The paper round Nan.
        col = wobble(x * 1.3, z * 1.3) > 0.4 ? C.paperDark : C.paper
      } else if (d < 0) {
        // The cut edge, in two layers like cake (how far up it is, as heightAt shapes it).
        const k = 1 + d / CLIFF_W
        col = k * k * (3 - 2 * k) > 0.45 ? C.cliff : C.cliffLow
      } else {
        const n = wobble(x * 2.2, z * 2.2)
        const up = hillAt(x, z)
        if (d < 0.03 + n * 0.006) col = C.rim
        else if (up > 0.4 + n * 0.03) col = C.peak
        else if (up > 0.24 + n * 0.03) col = C.deep
        else if (up > 0.09 + n * 0.02) col = C.forest
        else if (up > 0.025 + n * 0.01) col = C.plain
        else col = C.valley
      }
      data[o] = col[0]
      data[o + 1] = col[1]
      data[o + 2] = col[2]
      data[o + 3] = 255
    }
  }
  bg.putImageData(img, 0, 0)
  g.imageSmoothingEnabled = true
  g.drawImage(base, 0, 0, w, h)

  const P = ([x, z]: XZ): [number, number] => [(x - BOARD.x0) * TEX, (z - BOARD.z0) * TEX]
  const path = (pts: XZ[]) => {
    g.beginPath()
    pts.forEach((p, i) => (i ? g.lineTo(...P(p)) : g.moveTo(...P(p))))
  }
  g.lineCap = g.lineJoin = 'round'
  let seed = 5
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)

  // ---- On the paper: doodled hills, the dashed border with Laos.
  g.strokeStyle = '#EBCFAE'
  g.lineWidth = TEX * 0.012
  for (let n = 0; n < 220; n++) {
    const x = BOARD.x0 + rnd() * W
    const z = BOARD.z0 + rnd() * D
    if (inNan(x, z) > -CLIFF_W - 0.06) continue
    const [cx, cy] = P([x, z])
    const r = TEX * (0.035 + rnd() * 0.02)
    g.beginPath()
    g.arc(cx, cy, r, Math.PI * 1.12, Math.PI * 1.88)
    g.stroke()
    g.beginPath()
    g.arc(cx + r * 1.25, cy + r * 0.15, r * 0.7, Math.PI * 1.15, Math.PI * 1.85)
    g.stroke()
  }
  g.strokeStyle = '#DCCBF2'
  g.lineWidth = TEX * 0.016
  g.setLineDash([TEX * 0.045, TEX * 0.04])
  const border: XZ[] = []
  for (let z = BOARD.z0; z <= BOARD.z1 + 0.01; z += 0.05) border.push([LAOS_X + 0.12 + Math.sin(z * 2.3) * 0.03, z])
  path(border)
  g.stroke()
  g.setLineDash([])

  // ---- On Nan's top: rice fields in the flat valleys.
  const greens = ['#D6F2A2', '#C4EA94', '#E9F4A6', '#BDE9B4', '#F6EFA8', '#C9EFE0']
  const nearLine = (x: number, z: number, line: XZ[], r: number) => line.some(([lx, lz], i) => i % 2 === 0 && Math.hypot(lx - x, lz - z) < r)
  const fieldAt = (x: number, z: number, fw: number, fh: number, turn: number) => {
    const [cx, cy] = P([x, z])
    g.save()
    g.translate(cx, cy)
    g.rotate(turn)
    g.fillStyle = greens[Math.floor(rnd() * greens.length)]
    g.beginPath()
    g.roundRect((-fw / 2) * TEX, (-fh / 2) * TEX, fw * TEX, fh * TEX, TEX * 0.012)
    g.fill()
    // Rows of rice.
    g.strokeStyle = 'rgba(255,255,255,0.55)'
    g.lineWidth = TEX * 0.005
    for (let k = -1; k <= 1; k++) {
      g.beginPath()
      g.moveTo(-fw * 0.36 * TEX, ((k * fh) / 4) * TEX)
      g.lineTo(fw * 0.36 * TEX, ((k * fh) / 4) * TEX)
      g.stroke()
    }
    g.restore()
  }
  const clearOf = (x: number, z: number, pad: number) =>
    inNan(x, z) > 0.08 && hillAt(x, z) < 0.035 && !nearLine(x, z, river, 0.1 + pad) && !roads.some((l) => nearLine(x, z, l, 0.075 + pad)) && keep.every(([kx, kz, r]) => Math.hypot(kx - x, kz - z) > r + pad)
  for (let z = BOARD.z0 + 0.2; z < BOARD.z1 - 0.1; z += 0.11)
    for (let x = BOARD.x0 + 0.25 + ((z * 7) % 0.05); x < LAOS_X - 0.1; x += 0.14) {
      const fx = x + (rnd() - 0.5) * 0.02
      const fz = z + (rnd() - 0.5) * 0.015
      // (In patches, along the valleys: not a carpet of them.)
      if (!clearOf(fx, fz, 0.02) || (!nearLine(fx, fz, river, 0.42) && wobble(x * 0.8 + 3.1, z * 0.9 - 1.7) < 0.45) || rnd() > 0.8) continue
      fieldAt(fx, fz, 0.115 + rnd() * 0.02, 0.085 + rnd() * 0.015, (rnd() - 0.5) * 0.25)
    }
  // The buffalo's own paddies, by the river.
  for (let n = 0; n < 6; n++) fieldAt(PADDIES[0] + (n % 3) * 0.13 - 0.13, PADDIES[1] + Math.floor(n / 3) * 0.1 - 0.05, 0.11, 0.085, 0.05)

  // ---- Soft shadows under the trees and the toys.
  for (const [x, z, r] of shadows) {
    const [cx, cy] = P([x, z + r * 0.25])
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, r * TEX)
    grad.addColorStop(0, 'rgba(60,120,80,0.32)')
    grad.addColorStop(0.6, 'rgba(60,120,80,0.16)')
    grad.addColorStop(1, 'rgba(60,120,80,0)')
    g.fillStyle = grad
    g.beginPath()
    g.ellipse(cx, cy, r * TEX, r * TEX * 0.8, 0, 0, Math.PI * 2)
    g.fill()
  }

  // ---- The Nan River: pale banks, the water, a brighter middle (and over the edge, a waterfall onto the paper).
  const smooth = (pts: XZ[]) => {
    const q = pts.map(P)
    g.beginPath()
    g.moveTo(...q[0])
    for (let i = 0; i < q.length - 1; i++) {
      const [p0, p1, p2, p3] = [q[Math.max(0, i - 1)], q[i], q[i + 1], q[Math.min(q.length - 1, i + 2)]]
      g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1])
    }
  }
  smooth(river)
  g.strokeStyle = '#F2FBFF'
  g.lineWidth = TEX * 0.17
  g.stroke()
  g.strokeStyle = '#8FD3F2'
  g.lineWidth = TEX * 0.12
  g.stroke()
  g.strokeStyle = '#B9E6FA'
  g.lineWidth = TEX * 0.05
  g.stroke()

  // ---- The roads: cream with a warm edge and a dashed white middle.
  for (const l of roads) {
    path(l)
    g.strokeStyle = '#EBCB9E'
    g.lineWidth = TEX * 0.088
    g.stroke()
  }
  for (const l of roads) {
    path(l)
    g.strokeStyle = '#FFF4DC'
    g.lineWidth = TEX * 0.068
    g.stroke()
  }
  g.strokeStyle = '#FFFFFF'
  g.lineWidth = TEX * 0.01
  g.setLineDash([TEX * 0.03, TEX * 0.035])
  for (const l of roads) {
    path(l)
    g.stroke()
  }
  g.setLineDash([])
  return c
}

/** Little white glints drifting down the Nan River (and over the edge), so the water moves like the Thailand map's sea. */
export function riverGlints(bag: Bag, river: XZ[]) {
  const w = 0.085
  const pos: number[] = []
  const uv: number[] = []
  let u = 0
  for (let i = 0; i < river.length; i++) {
    const [ax, az] = river[Math.max(0, i - 1)]
    const [bx, bz] = river[Math.min(river.length - 1, i + 1)]
    const l = Math.hypot(bx - ax, bz - az) || 1
    const nx = (-(bz - az) / l) * (w / 2)
    const nz = ((bx - ax) / l) * (w / 2)
    const [x, z] = river[i]
    if (i) u += Math.hypot(x - river[i - 1][0], z - river[i - 1][1])
    pos.push(x + nx, heightAt(x + nx, z + nz) + 0.006, z + nz, x - nx, heightAt(x - nx, z - nz) + 0.006, z - nz)
    uv.push(u, 0, u, 1)
  }
  const index: number[] = []
  for (let i = 0; i < river.length - 1; i++) index.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3)
  const geo = bag.add(new BufferGeometry())
  geo.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  geo.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2))
  geo.setIndex(index)
  const mat = bag.add(
    new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          // Two lanes of short dashes, each lane at its own pace, drifting downstream.
          float lane = vUv.y < 0.5 ? 0.0 : 1.0;
          float across = abs(fract(vUv.y * 2.0) - 0.5);
          float along = fract(vUv.x * (lane > 0.5 ? 9.0 : 7.0) - uTime * (lane > 0.5 ? 0.9 : 0.7) + lane * 0.37);
          float dash = smoothstep(0.0, 0.06, along) * (1.0 - smoothstep(0.22, 0.3, along));
          float a = dash * (1.0 - smoothstep(0.08, 0.16, across)) * 0.85;
          if (a < 0.02) discard;
          gl_FragColor = vec4(1.0, 1.0, 1.0, a);
        }`,
    }),
  )
  const mesh = new Mesh(geo, mat)
  mesh.renderOrder = 2
  return { mesh, update: (t: number) => (mat.uniforms.uTime.value = t) }
}
