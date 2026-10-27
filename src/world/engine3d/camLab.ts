// The camera lab's line to whatever 3D world is on screen (?cam=1, lab/camera/). View3D attaches each world it mounts
// (a trip swaps worlds as she goes: the car, the airport, the bay), so the lab's change follows her from one to the
// next. Nothing here runs in normal play: with no lab open the override stays null and nothing is frozen.
import type { WebGLRenderer } from 'three'
import type { CameraRig, CamOverride } from './camera'

/** What the lab needs from the world on screen. */
export interface LabWorld {
  rig: CameraRig
  qa(): Record<string, unknown>
  /** The element the canvas and its tap targets live in. */
  host: HTMLElement
  renderer: WebGLRenderer
  /** Draws a frame and returns it as a PNG data URL. */
  snapshot(): string
}

let world: LabWorld | null = null
let override: CamOverride | null = null
let frozen = false
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())

export const camLab = {
  get world() {
    return world
  },
  get override() {
    return override
  },
  /** The world holds still (no game updates); the camera, drawing and tap targets keep going. */
  get frozen() {
    return frozen
  },

  attach(w: LabWorld) {
    world = w
    w.rig.setOverride(override, true)
    emit()
  },
  detach(w: LabWorld) {
    if (world !== w) return
    world = null
    emit()
  },
  setOverride(o: CamOverride | null, snap = false) {
    override = o
    world?.rig.setOverride(o, snap)
  },
  setFrozen(on: boolean) {
    frozen = on
    emit()
  },
  /** Called when a world comes or goes, or the freeze changes. */
  subscribe(f: () => void) {
    subs.add(f)
    return () => void subs.delete(f)
  },
}
