// Every number worth tuning by eye, in one place. The ?debug panel edits this object live (on the iPad too) and can
// copy it as JSON to paste back here.
export const TUNE = {
  /** Share of light every face gets, and share from the sun (together 1 = a lit face shows its exact palette color). */
  ambient: 0.6,
  sun: 0.4,
  /** The toon bands, darkest to lightest, as RGB multipliers on the sun's light. The dark band leans lavender. */
  bands: [
    [0.42, 0.36, 0.78],
    [0.42, 0.36, 0.78],
    [0.8, 0.77, 0.93],
    [1, 1, 1],
  ] as [number, number, number][],
  /** Outline width multiplier (characters 3 px, props 2 px, trinkets 1.5 px at 1). */
  outline: 1,
  /** Camera inside the house: degrees, and the floor box (meters) that must fit on screen around Kaylee. */
  insideYawWide: 30,
  insideYawTall: 16,
  insidePitch: 50,
  insideFitW: 4.4,
  insideFitD: 4.6,
  /** Camera in the street. */
  streetYaw: 8,
  streetPitch: 18,
  fov: 30,
  /** Kaylee's walk. */
  walkSpeed: 1.8,
  stepsPerSecond: 3.2,
  hop: 0.07,
}
export type Tune = typeof TUNE
