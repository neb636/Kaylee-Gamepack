// The Sky Pod's nine light-up pods, drawn as a handful of instanced meshes however many there are (five draw calls):
// the glowing domes (flat, unlit colors, so a lit pod really glows), a shine on each, the white ring round each dome,
// the ring's ink outline (the house's outline, instanced, like the barber's mane), and a soft halo behind the lit ones.
// The wall (wall.ts) says each pod's color, halo and squash every frame; this only draws them.
import { AdditiveBlending, BackSide, CanvasTexture, Color, DynamicDrawUsage, Group, InstancedMesh, Matrix4, MeshBasicMaterial, PlaneGeometry, Quaternion, ShaderMaterial, SphereGeometry, TorusGeometry, Vector2, Vector3, type WebGLRenderer } from 'three'
import type { Bag } from '../../../../engine/dispose'
import { PAL, toon } from '../../../../engine/toon'
import { BEZEL_R, DOME_R, PODS, type V3 } from './layout'

const outlineVert = /* glsl */ `
  uniform vec2 uRes;
  uniform float uPx;
  void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;
    vec3 n = normalMatrix * (mat3(instanceMatrix) * normal);
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    clip.xy += dir * uPx * 2.0 / uRes * clip.w;
    gl_Position = clip;
  }
`
const outlineFrag = /* glsl */ `
  uniform vec3 uColor;
  void main() { gl_FragColor = vec4(uColor, 1.0); }
`

/** What one pod looks like this frame. */
export interface PodLook {
  dome: Color
  ring: Color
  /** The halo behind it: 0 none, 1 a full glow. */
  halo: number
  /** Pressed in (0 no .. 1 squashed flat against the wall), and how far it pops out on its spring (m). */
  press: number
  out: number
  /** A little turn (a pod popping out spins). */
  spin: number
}

const m = new Matrix4()
const q = new Quaternion()
const pos = new Vector3()
const scl = new Vector3()
const Z = new Vector3(0, 0, 1)
const size = new Vector2()

export class Pods {
  readonly root = new Group()
  readonly looks: PodLook[]
  private spots: Vector3[] = []
  private domes: InstancedMesh
  private shines: InstancedMesh
  private rings: InstancedMesh
  private inks: InstancedMesh
  private halos: InstancedMesh

  constructor(bag: Bag) {
    const n = PODS
    const dome = bag.add(new SphereGeometry(DOME_R, 22, 14))
    this.domes = bag.add(new InstancedMesh(dome, bag.add(new MeshBasicMaterial({ color: '#ffffff' })), n))
    this.shines = bag.add(new InstancedMesh(bag.add(new SphereGeometry(DOME_R * 0.24, 10, 6)), bag.add(new MeshBasicMaterial({ color: '#ffffff' })), n))
    const ringGeo = bag.add(new TorusGeometry(BEZEL_R - 0.045, 0.05, 10, 32))
    this.rings = bag.add(new InstancedMesh(ringGeo, toon('#ffffff'), n))
    const ink = bag.add(new ShaderMaterial({ uniforms: { uRes: { value: [1, 1] }, uPx: { value: 2.2 }, uColor: { value: new Color(PAL.ink) } }, vertexShader: outlineVert, fragmentShader: outlineFrag, side: BackSide }))
    this.inks = bag.add(new InstancedMesh(ringGeo, ink, n))
    // The outline is as wide in pixels as the house's (its canvas size, read as it draws).
    this.inks.onBeforeRender = (renderer: WebGLRenderer) => {
      renderer.getSize(size)
      ink.uniforms.uRes.value = [Math.max(1, size.x), Math.max(1, size.y)]
    }
    const halo = bag.add(new MeshBasicMaterial({ map: bag.add(haloTexture()), transparent: true, depthWrite: false, blending: AdditiveBlending }))
    this.halos = bag.add(new InstancedMesh(bag.add(new PlaneGeometry(1, 1)), halo, n))
    for (const im of [this.halos, this.inks, this.rings, this.domes, this.shines]) {
      im.instanceMatrix.setUsage(DynamicDrawUsage)
      im.frustumCulled = false
      this.root.add(im)
    }
    this.looks = Array.from({ length: n }, () => ({ dome: new Color('#555'), ring: new Color('#fff'), halo: 0, press: 0, out: 0, spin: 0 }))
    const black = new Color('#000000')
    for (let i = 0; i < n; i++) {
      this.domes.setColorAt(i, black)
      this.rings.setColorAt(i, black)
      this.halos.setColorAt(i, black)
    }
  }

  setSpots(spots: V3[]) {
    this.spots = spots.map((s) => new Vector3(...s))
  }
  spot(i: number) {
    return this.spots[i]
  }

  update() {
    for (let i = 0; i < this.spots.length; i++) {
      const L = this.looks[i]
      const p = this.spots[i]
      const sq = L.press
      q.setFromAxisAngle(Z, L.spin)
      // The dome: half sunk in the wall, flattened; pressed, it squashes in and bulges out sideways.
      m.compose(pos.set(p.x, p.y, p.z + L.out - 0.02 - sq * 0.03), q, scl.set(1 + sq * 0.14, 1 + sq * 0.14, 0.55 * (1 - sq * 0.55)))
      this.domes.setMatrixAt(i, m)
      this.domes.setColorAt(i, L.dome)
      m.compose(pos.set(p.x - DOME_R * 0.36 * (1 + sq * 0.14), p.y + DOME_R * 0.4 * (1 + sq * 0.14), p.z + L.out + DOME_R * 0.36 * (1 - sq * 0.6)), q, scl.set(1, 0.75, 0.5))
      this.shines.setMatrixAt(i, m)
      m.compose(pos.set(p.x, p.y, p.z + L.out * 0.85), q, scl.set(1 + sq * 0.05, 1 + sq * 0.05, 1))
      this.rings.setMatrixAt(i, m)
      this.rings.setColorAt(i, L.ring)
      this.inks.setMatrixAt(i, m)
      const h = L.halo
      m.compose(pos.set(p.x, p.y, p.z - 0.05), q, scl.setScalar(h > 0.01 ? BEZEL_R * (2.6 + h * 1.6) : 0.0001))
      this.halos.setMatrixAt(i, m)
      this.halos.setColorAt(i, tmpColor.copy(L.dome).multiplyScalar(Math.min(1, h)))
    }
    for (const im of [this.domes, this.shines, this.rings, this.inks, this.halos]) {
      im.count = this.spots.length
      im.instanceMatrix.needsUpdate = true
      if (im.instanceColor) im.instanceColor.needsUpdate = true
    }
  }
}
const tmpColor = new Color()

/** A soft round glow (white, fading out), tinted per pod. */
function haloTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,.55)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 64, 64)
  return new CanvasTexture(c)
}
