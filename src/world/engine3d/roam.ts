// Roblox's iPad controls, for any 3D world where Kaylee walks around (she plays Roblox a lot, and her fingers already
// know them): a drag that starts on the left half of the screen is a thumbstick that walks her (a compact hint appears bottom left
// for two seconds when the drag starts), a jump button bottom right hops, a one-finger drag on the right half
// swings the camera around her and a two-finger pinch moves it in and out. Taps still poke things and walk her there.
//
// A world opts in with `roam()` (View3D.tsx shows the stick and the button, RoamPad.tsx) and a shot with `roam` limits
// (camera.ts). The numbers that decide how it feels are knobs for the feel lab (?feel=1).
// Plain TypeScript, no three.js: View3D and RoamPad import it.
import { knobs } from '../kit/knobs'

export const ROAM = knobs('roam', 'Roblox controls', 'src/world/engine3d/roam.ts', {
  turn: { value: 0.32, min: 0.05, max: 1, step: 0.01, label: 'Camera turn', unit: '°/px', note: 'degrees the camera swings per pixel of drag, side to side' },
  tilt: { value: 0.22, min: 0.05, max: 1, step: 0.01, label: 'Camera tilt', unit: '°/px', note: 'degrees it tilts per pixel of drag, up and down' },
  dragStart: { value: 10, min: 2, max: 30, step: 1, label: 'Drag starts', unit: 'px', note: 'how far a finger moves before it turns the camera instead of tapping' },
  stickSide: { value: 0.5, min: 0.25, max: 0.7, step: 0.01, label: 'Stick side', note: 'a drag that starts left of this share of the screen is the thumbstick' },
  stickReach: { value: 0.38, min: 0.2, max: 0.6, step: 0.01, label: 'Stick reach', note: 'how far the knob travels, as a share of the stick' },
  stickDead: { value: 0.14, min: 0, max: 0.4, step: 0.01, label: 'Stick dead zone', note: 'a push smaller than this does nothing' },
  speed: { value: 1.25, min: 0.5, max: 2.5, step: 0.05, label: 'Walk speed', unit: '×', note: 'a full push, times her walking speed' },
  jumpHeight: { value: 0.42, min: 0.15, max: 0.9, step: 0.01, label: 'Jump height', unit: 'm' },
  jumpTime: { value: 0.5, min: 0.25, max: 0.9, step: 0.01, label: 'Jump time', unit: 's' },
  jumpReach: { value: 0.55, min: 0, max: 1.2, step: 0.05, label: 'Jump reach', unit: 'm', note: 'how far a jump carries her while she pushes the stick' },
})

/** What a world lets her do with the pad right now (null: no pad, no camera turning). */
export interface RoamState {
  /** The thumbstick walks her. */
  walk: boolean
  /** The jump button hops. */
  jump: boolean
}

/** What a world needs to be roamed (View3D calls these). */
export interface Roamable {
  roam?(): RoamState | null
  /** The stick: x to the right, y away from her (up the screen), length 0..1 (0, 0: let go). */
  roamStick?(x: number, y: number): void
  roamJump?(): void
  /** The finger that just went down is holding something of the world's own (a suitcase): a drag mustn't turn. */
  roamGrabbed?(): boolean
}

const deg = Math.PI / 180

/** The stick's push turned into a direction on the ground, for a camera facing `yawDeg` (camera.ts: the camera sits
 *  at +sin(yaw), +cos(yaw) from what it looks at). Returns world x, z, and how hard (0..1, after the dead zone). */
export function stickToGround(yawDeg: number, sx: number, sy: number): { x: number; z: number; k: number } {
  const len = Math.min(1, Math.hypot(sx, sy))
  const dead = ROAM.stickDead
  if (len <= dead) return { x: 0, z: 0, k: 0 }
  const k = (len - dead) / (1 - dead)
  const y = yawDeg * deg
  // Forward is away from the camera, right is the screen's right.
  const fx = -Math.sin(y)
  const fz = -Math.cos(y)
  const rx = Math.cos(y)
  const rz = -Math.sin(y)
  const nx = sx / len
  const ny = sy / len
  const x = rx * nx + fx * ny
  const z = rz * nx + fz * ny
  return { x, z, k }
}
