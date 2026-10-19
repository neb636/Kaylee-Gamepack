// The bay's screen overlay, written every frame (style writes only): the DOM tap targets over the boat, the family and
// everything to poke (sized and stacked by depth and priority: small toys over things over people), the "do this"
// finger after a while with nothing touched, and the arrows at the screen's edge toward glows that are off screen.
import { Vector3 } from 'three'
import { clamp } from '../../../../../../sdk'
import type { Bay } from './bay'
import type { RiderId, Spot } from './part'
import type { GlowId } from './scenery'

/** Stopped and not touched for this long: a finger shows her what to do. */
export const HINT_S = 8
const tmp = new Vector3()
const tmp2 = new Vector3()

export class BayOverlay {
  anchorEls = new Map<string, HTMLElement>()
  hintEl: HTMLElement | null = null
  arrowEls = new Map<string, HTMLElement>()

  constructor(private bay: Bay) {}

  /** Every frame: the tap targets, the "do this" finger, the arrows. */
  place() {
    const cam = this.bay.rig.camera
    const right = tmp2.set(1, 0, 0).applyQuaternion(cam.quaternion)
    for (const [id, el] of this.anchorEls) {
      let a = this.coreAnchor(id)
      if (a === undefined) {
        a = null
        for (const p of this.bay.parts) if ((a = p.anchorAt(id))) break
      }
      const s = a ? this.toScreen(a.at, a.r, right, a.max ?? (id.startsWith('family:') ? 110 : 170)) : null
      if (s && a) {
        el.style.transform = `translate3d(${(s.x - s.size / 2).toFixed(1)}px, ${(s.y - s.size / 2).toFixed(1)}px, 0)`
        el.style.width = el.style.height = `${s.size.toFixed(0)}px`
        el.style.zIndex = String(s.z + (a.prio ?? (id.startsWith('family:') ? 0 : 2)) * 3000)
        const shadow = a.glow ? '0 0 0 6px rgba(255,79,154,.6), 0 0 24px 8px rgba(255,200,61,.7)' : ''
        if (el.style.boxShadow !== shadow) el.style.boxShadow = shadow
      }
      const want = s ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
    this.placeHint(right)
    this.placeArrows()
  }

  /** The core's own tap targets (undefined: not one of the core's). */
  private coreAnchor(id: string): Spot | null | undefined {
    const drive = this.bay.phase === 'drive'
    const longtail = this.bay.using === 'longtail'
    if (id === 'boat' || id === 'engine') {
      if (!(drive || this.bay.phase === 'beach' || this.bay.phase === 'docked' || this.bay.phase === 'board')) return null
      if (id === 'engine' && !(drive && longtail)) return null
      const at = this.bay.ride.v.root.getWorldPosition(new Vector3()).setY(0.5)
      // The longtail's bow (the family sits in the middle) and its engine; the canoe whole. On the beach the family
      // stands in front of the bow: the boat's tap target is its back end, above them.
      const along = this.bay.phase === 'beach' ? -2.6 : !longtail ? 0 : id === 'engine' ? -3.4 : 2.3
      at.addScaledVector(tmp.set(Math.sin(this.bay.ride.d.heading), 0, Math.cos(this.bay.ride.d.heading)), along)
      if (id === 'engine') at.y = 1.1
      // On the beach with a photo taken, it glows: the way back.
      return { at, r: longtail ? (id === 'engine' ? 0.9 : 1.5) : 1.2, prio: 1, glow: this.bay.isNailWaiting() }
    }
    if (id.startsWith('family:')) {
      const rd = this.bay.rider(id.slice(7) as RiderId)
      if (!(drive || this.bay.phase === 'beach' || this.bay.phase === 'docked' || this.bay.phase === 'board') || this.bay.hopping) return null
      const at = rd.char.root.getWorldPosition(new Vector3())
      at.y += rd.lying ? 0.35 : rd.height * 0.75
      // In the longtail they're small and under the boat's own targets (where they overlap, the bow and the engine
      // VROOM); in the canoe they come first (lying them down is what the cave is about: over the bats and the drips).
      return { at, r: rd.height * 0.4, glow: rd.warn, max: longtail && drive ? 76 : 110, prio: !longtail && drive ? 4 : 0 }
    }
    if (id.startsWith('glow:')) {
      const g = this.bay.scenery.glows[id.slice(5) as GlowId]
      return g?.visible ? { at: g.position.clone().setY(3), r: 4 } : null
    }
    if (id === 'tour') return drive && longtail ? { at: new Vector3(this.bay.tour.x, 2, this.bay.tour.z), r: 4 } : null
    return undefined
  }

  toScreen(at: Vector3, r: number, right: Vector3, max = 170) {
    const cam = this.bay.rig.camera
    const center = at.clone().project(cam)
    if (center.z > 1 || Math.abs(center.x) > 1.05 || Math.abs(center.y) > 1.05) return null
    const edge = at.clone().addScaledVector(right, r).project(cam)
    return {
      x: ((center.x + 1) / 2) * this.bay.width,
      y: ((1 - center.y) / 2) * this.bay.height,
      size: clamp(Math.abs(edge.x - center.x) * this.bay.width, 64, max),
      z: Math.round((1 - center.z) * 10000),
    }
  }

  /** Stopped and untouched for a while: a finger shows her what to do (a part's thing, the water ahead, the boat). */
  private placeHint(right: Vector3) {
    const el = this.hintEl
    if (!el) return
    const d = this.bay.ride.d
    const idle = this.bay.time - this.bay.lastTouch > HINT_S && Math.abs(d.speed) < 0.6 && !this.bay.touching && !this.bay.hopping
    let at: Vector3 | null = null
    if (idle) {
      for (const p of this.bay.parts) if ((at = p.hint?.() ?? null)) break
      if (!at && this.bay.phase === 'beach') at = null
      else if (!at && this.bay.phase === 'docked') at = this.bay.ride.v.root.getWorldPosition(new Vector3()).setY(0.6)
      else if (!at && this.bay.phase === 'drive') {
        const ahead = this.bay.using === 'canoe' ? 8 : 10
        at = new Vector3(d.x + Math.sin(d.heading) * ahead, 0.3, d.z + Math.cos(d.heading) * ahead)
      }
    }
    const s = at ? this.toScreen(at, 1, right) : null
    el.style.display = s ? '' : 'none'
    if (s) el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0)`
  }

  /** A glow that's off screen gets a little arrow at the screen's edge pointing to it (with what it is). */
  private placeArrows() {
    const cam = this.bay.rig.camera
    for (const [id, el] of this.arrowEls) {
      const target = this.bay.arrowTarget(id)
      let show = false
      if (target) {
        const p = tmp.copy(target).applyMatrix4(cam.matrixWorldInverse)
        // In camera space: x right, y up, -z ahead. Off screen = behind, or outside the view.
        const ndc = target.clone().project(cam)
        const off = p.z > 0 || Math.abs(ndc.x) > 0.95 || Math.abs(ndc.y) > 0.95
        if (off) {
          show = true
          // Behind the camera: on the side it's on (at the bottom it would sit right on the boat).
          const a = p.z > 0 ? (p.x < 0 ? -1 : 1) * Math.PI * 0.5 : Math.atan2(p.x, -p.z)
          const mx = 52
          const top = 120
          const x = clamp(this.bay.width / 2 + Math.sin(a) * this.bay.width, mx, this.bay.width - mx)
          const y = clamp(this.bay.height * 0.5 - Math.cos(a) * this.bay.height * 0.3, top, this.bay.height - 160)
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
          const arrow = el.firstElementChild as HTMLElement | null
          if (arrow) arrow.style.transform = `rotate(${a.toFixed(3)}rad)`
        }
      }
      const want = show ? '' : 'none'
      if (el.style.display !== want) el.style.display = want
    }
  }
}
