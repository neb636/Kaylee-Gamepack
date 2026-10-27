// Thailand's own numbers worth tuning by eye: the camera at Agong's house and Kaylee's walk. The house's ?debug panel
// edits this object live (with the shared look's, engine3d/tune.ts) and copies both as JSON to paste back here.
export const THAI_TUNE = {
  /** Camera inside the house: degrees, and the floor box (meters) that must fit on screen around Kaylee. */
  insideYawWide: 30,
  insideYawTall: 16,
  insidePitch: 50,
  insideFitW: 5.65,
  insideFitD: 4.6,
  /** Camera in the street (every outside shot of the house is 17° lower than it was, Dad 2026-10-26). */
  streetYaw: 8,
  streetPitch: 1,
  /** Kaylee's walk. */
  walkSpeed: 1.8,
  stepsPerSecond: 3.2,
  hop: 0.07,
}
export type ThaiTune = typeof THAI_TUNE
