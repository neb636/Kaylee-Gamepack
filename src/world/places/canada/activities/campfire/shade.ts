// Who's out there in the dark (Flashlight Statues): every animal in the clearing is a dark shape with two eyes shining
// back, until the flashlight lands on it and it comes to full color in about 0.15 s. A night scene fails in two ways,
// too dark to read on an iPad in a bright room, or every animal a silhouette blob, so an unlit animal keeps a soft
// rim (its ink outline turns moonlit lavender, or firelight orange near the fire) and its eyes glow and blink.
//
// How: each animal gets its own copies of its materials (the toon materials are shared by everything), whose color is
// lerped from a deep blue-black to white (white = its own colors), and its outlines swap color; its eyes are two small
// glowing discs with a soft halo, on its own eyes, that fade as the light comes on.
import { AdditiveBlending, Box3, Color, Group, Mesh, MeshBasicMaterial, MeshToonMaterial, Sprite, SpriteMaterial, type Material, type Object3D } from 'three'
import type { Rig } from '../../../../engine3d/characters/animal'
import type { Bag } from '../../../../engine3d/dispose'
import { P, type V3 } from '../../../../engine3d/geo'
import { outlineMaterial } from '../../../../engine3d/outline'
import { PAL } from '../../../../engine3d/toon'
import type { Shine } from '../../characters/critters'
import { glowTexture } from '../../story/sets/campfire'

/** An unlit animal's color (times its own). Dark, but blue rather than black, so the shape still reads. */
const DARK = new Color('#26244A')
/** The outline round an unlit animal: moonlight, or the fire's glow when it's near the fire. */
export const RIM_MOON = '#8D86DA'
export const RIM_FIRE = '#F29A62'
/** Seconds to come to full color. */
const ON_S = 0.15

interface Owned {
  mat: MeshToonMaterial | MeshBasicMaterial
  base: Color
  dark: Color
}

/** Where a rig's eyes are, the way face.ts measures them: half an eye's height, the middle of each eye out from the
 *  nose, and the front of the eyes (eyes-local). */
function rigEyes(rig: Rig): { size: number; x: number; z: number } {
  const box = new Box3()
  rig.eyes.traverse((o) => {
    const geo = (o as Mesh).geometry
    if (!geo) return
    geo.computeBoundingBox()
    if (geo.boundingBox) box.union(geo.boundingBox)
  })
  const size = (box.max.y - box.min.y) / 2
  return { size, x: Math.max(size * 0.9, box.max.x - size * 0.78), z: box.max.z }
}

export interface ShadeOpts {
  /** The eyes' glow (raccoons yellow-green, the owl amber...). */
  glow: string
  /** How big the halo is, times the eye. */
  halo?: number
  /** 0 open .. 1 shut, every frame (a blink): the eyes go dark with it. */
  blink?: () => number
}

export class NightShade {
  /** 0 dark .. 1 in full color, and where it's going. */
  lit = 0
  goal = 0
  /** Its eyes don't shine (behind sunglasses). */
  eyesOff = false
  /** The halo's size boost when Sparkle is pointing her at it (0..1). */
  hint = 0
  private owned = new Map<Mesh, Owned>()
  private hulls: Mesh[] = []
  private eyes: Mesh[] = []
  private halos: Sprite[] = []
  private eyeMat: MeshBasicMaterial
  private coreMat: MeshBasicMaterial
  private haloMat: SpriteMaterial
  private applied = -1
  private rim = RIM_MOON
  private rimOn: string | null = null
  private haloBase = 1
  /** A rig's shine copies its eyes' blink. */
  private follow: { g: Group; eyes: Object3D } | null = null

  constructor(
    private root: Object3D,
    private bag: Bag,
    eyes: Shine | { rig: Rig } | null,
    private opts: ShadeOpts,
  ) {
    this.eyeMat = bag.add(new MeshBasicMaterial({ color: opts.glow, transparent: true, depthWrite: false, fog: false }))
    this.coreMat = bag.add(new MeshBasicMaterial({ color: '#FFFFF4', transparent: true, depthWrite: false, fog: false }))
    this.haloMat = bag.add(new SpriteMaterial({ map: glowTexture(bag), color: opts.glow, transparent: true, blending: AdditiveBlending, depthWrite: false, fog: false }))
    if (eyes && 'rig' in eyes) {
      const e = rigEyes(eyes.rig)
      // (Beside the rig's eyes, not inside them: the silly faces and props measure what's in there.)
      const g = new Group()
      g.position.copy(eyes.rig.eyes.position)
      eyes.rig.eyes.parent?.add(g)
      this.follow = { g, eyes: eyes.rig.eyes }
      this.addEyes(g, [
        [e.x, 0, e.z + e.size * 0.05],
        [-e.x, 0, e.z + e.size * 0.05],
      ], e.size * 1.05)
      // (A critter's eye is given by its middle: the shine goes on its front.)
    } else if (eyes) this.addEyes(eyes.parent, eyes.at.map(([x, y, z]) => [x, y, z + eyes.r * 0.75]) as [V3, V3], eyes.r)
    this.refresh()
  }

  private addEyes(parent: Object3D, at: [V3, V3], r: number) {
    for (const p of at) {
      // A glowing almond with a white-hot middle, a little in front of the eye itself.
      const m = new Mesh(this.bag.add(P.sphere(r * 1.15, '#ffffff', { at: [0, 0, 0], scale: [0.9, 1, 0.35] }, 14)), this.eyeMat)
      m.position.set(p[0], p[1], p[2] + r * 0.1)
      m.renderOrder = 6
      const core = new Mesh(this.bag.add(P.sphere(r * 0.5, '#ffffff', { scale: [1, 1, 0.3] }, 10)), this.coreMat)
      core.position.set(r * 0.15, r * 0.2, r * 0.25)
      core.renderOrder = 7
      m.add(core)
      const halo = new Sprite(this.haloMat)
      halo.position.copy(m.position)
      halo.renderOrder = 8
      parent.add(m, halo)
      this.eyes.push(m)
      this.halos.push(halo)
      this.haloBase = r * (this.opts.halo ?? 9)
    }
  }

  /** Takes over any parts built since (a silly face, a prop): call after adding things to the animal. */
  refresh() {
    this.root.traverse((o) => {
      const m = o as Mesh
      if (!m.isMesh || this.owned.has(m) || this.eyes.includes(m) || this.eyes.some((e) => e.children.includes(m))) return
      if (m.userData.hull !== undefined) {
        if (!this.hulls.includes(m)) this.hulls.push(m)
        return
      }
      const mat = m.material as Material
      if (Array.isArray(mat)) return
      if (!(mat instanceof MeshToonMaterial) && !(mat instanceof MeshBasicMaterial)) return
      // (A soft shadow on the floor stays as it is.)
      if (mat instanceof MeshBasicMaterial && mat.transparent) return
      const own = this.bag.add(mat.clone())
      m.material = own
      this.owned.set(m, { mat: own, base: mat.color.clone(), dark: mat.color.clone().multiply(DARK) })
    })
    this.applied = -1
  }

  /** The outline color while it's dark (by the fire, it's lit warm from one side). */
  setRim(color: string) {
    this.rim = color
  }

  /** Every frame: comes on (or goes dark) toward `goal`, the eyes shine while it's dark. */
  update(dt: number) {
    const step = dt / ON_S
    this.lit = this.goal > this.lit ? Math.min(this.goal, this.lit + step) : Math.max(this.goal, this.lit - step * 0.5)
    const k = this.lit
    if (Math.abs(k - this.applied) > 0.003) {
      this.applied = k
      for (const o of this.owned.values()) o.mat.color.lerpColors(o.dark, o.base, k)
    }
    const rim = k < 0.5 ? this.rim : null
    if (rim !== this.rimOn) {
      this.rimOn = rim
      for (const h of this.hulls) h.material = outlineMaterial(h.userData.hull as number, rim ?? (h.userData.hullColor as string | undefined) ?? PAL.ink, (h.userData.hullBias as number | undefined) ?? 0)
    }
    if (this.follow) this.follow.g.scale.copy(this.follow.eyes.scale)
    const open = 1 - (this.opts.blink?.() ?? 0)
    const shine = this.eyesOff ? 0 : Math.max(0, 1 - k * 1.6) * open
    this.eyeMat.opacity = shine
    this.coreMat.opacity = shine
    this.haloMat.opacity = shine * (0.55 + 0.35 * this.hint)
    const visible = shine > 0.01
    const hs = this.haloBase * (1 + this.hint * 0.8)
    for (const e of this.eyes) e.visible = visible
    for (const h of this.halos) {
      h.visible = visible
      h.scale.set(hs, hs, 1)
    }
  }
}
