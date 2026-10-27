// The look's numbers worth tuning by eye, shared by every 3D world. The ?debug panel (and the character lab's light
// sliders) edit this object live, on the iPad too, and can copy it as JSON to paste back here. A country's own camera
// and walk numbers live in its folder (Thailand's: places/thailand/tune.ts).
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
  /** Outline width multiplier (characters 3 px, props 2 px, trinkets 1.5 px at 1). 0.75: Dad found the full width
   *  heavy (2026-10-25). */
  outline: 0.75,
  /** The default lens, degrees top to bottom (a world's rig.fov overrides it). */
  fov: 30,
}
export type Tune = typeof TUNE
