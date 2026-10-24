// Tilt to steer, for the boat race on a phone (the iPad keeps the finger on the water): she holds the iPhone sideways
// like a steering wheel and turns it, and a gas pedal on the screen is full speed (RaceLayer.tsx).
//
// The tilt comes from the phone's orientation events (beta, gamma) turned into which way "up" points across the screen,
// so it works however far back she leans the phone: held up like a wheel or flat like a tray, the right edge going down
// steers right. iOS only sends the events after a tap asks for them (askForTilt, from a button).
// No three.js here: BoatTrip.tsx reads the helpers.

export type SteerMode = 'finger' | 'tilt'

/** A phone, not the iPad: a touch screen whose short side is under 600 px. */
export function isPhone() {
  if (typeof matchMedia === 'undefined' || typeof screen === 'undefined') return false
  return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 600
}

/** How she steers: `steer=tilt` / `steer=finger` in the link override it (to try either on any device); phones tilt. */
export function steerFor(link: string | null): SteerMode {
  if (link === 'tilt' || link === 'finger') return link
  return isPhone() ? 'tilt' : 'finger'
}

type Asking = { requestPermission?: () => Promise<'granted' | 'denied' | 'default'> }
const Orientation = (typeof DeviceOrientationEvent === 'undefined' ? undefined : DeviceOrientationEvent) as unknown as Asking | undefined

let granted = false
/** iOS asks before a page can read the tilt (once per visit: after a yes, it's remembered here). */
export function needsAsking() {
  return !granted && typeof Orientation?.requestPermission === 'function'
}
/** Asks for the tilt. Call it straight from a tap (iOS refuses otherwise). */
export async function askForTilt(): Promise<boolean> {
  if (!needsAsking()) return true
  try {
    granted = (await Orientation!.requestPermission!()) === 'granted'
  } catch {
    granted = false
  }
  return granted
}

/** The screen's turn from the phone's upright: 0, 90 (turned to the left, its top pointing left), -90, 180. */
function screenAngle() {
  const legacy = (window as unknown as { orientation?: number }).orientation
  if (typeof legacy === 'number') return legacy
  const a = screen.orientation?.angle ?? 0
  return a > 180 ? a - 360 : a
}

/** How far "up" leans across the screen, -1..1: the sine of the turn of a wheel held upright (+ = turned clockwise,
 *  steering right). "Up" in the phone's own axes (x right, y to its top, z out of the screen) is
 *  (-sin γ cos β, sin β, cos β cos γ); its part along the screen's right, negated, is the lean. */
export function leanOf(beta: number, gamma: number, angle: number) {
  const b = (beta * Math.PI) / 180
  const g = (gamma * Math.PI) / 180
  const a = (angle * Math.PI) / 180
  return Math.sin(g) * Math.cos(b) * Math.cos(a) + Math.sin(b) * Math.sin(a)
}

/** A small wobble steers nothing; about 25° is full lock. */
const DEAD = 0.07
const FULL = 0.42
function shape(lean: number) {
  const m = Math.min(1, Math.max(0, (Math.abs(lean) - DEAD) / (FULL - DEAD)))
  return Math.sign(lean) * m
}

export class Tilt {
  /** -1 (full left) .. 1 (full right), smoothed. */
  value = 0
  /** Readings are coming from the phone (else the arrow keys steer, on a computer). */
  live = false
  /** The last lean read, before shaping (QA). */
  lean = 0
  private want = 0
  private keys = { left: false, right: false }
  private on = false

  private onOrient = (e: DeviceOrientationEvent) => {
    if (e.beta === null || e.gamma === null) return
    this.live = true
    this.lean = leanOf(e.beta, e.gamma, screenAngle())
    this.want = shape(this.lean)
  }
  private onKey = (e: KeyboardEvent) => {
    const down = e.type === 'keydown'
    if (e.key === 'ArrowLeft') this.keys.left = down
    else if (e.key === 'ArrowRight') this.keys.right = down
    else return
    e.preventDefault()
  }

  start() {
    if (this.on) return
    this.on = true
    addEventListener('deviceorientation', this.onOrient)
    addEventListener('keydown', this.onKey)
    addEventListener('keyup', this.onKey)
  }
  stop() {
    this.on = false
    removeEventListener('deviceorientation', this.onOrient)
    removeEventListener('keydown', this.onKey)
    removeEventListener('keyup', this.onKey)
    this.value = 0
  }
  update(dt: number) {
    const want = this.live ? this.want : (this.keys.right ? 1 : 0) - (this.keys.left ? 1 : 0)
    this.value += (want - this.value) * (1 - Math.exp(-dt / 0.07))
  }
}
