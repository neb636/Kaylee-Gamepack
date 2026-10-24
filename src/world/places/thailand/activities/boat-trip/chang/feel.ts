// Every number that decides how feeding the elephants feels (from PR #86's 2D greybox, now in meters), in one place so
// the ?debug=1 sliders (ChangDebug.tsx) can tune it on the iPad and copy it back here.
export const CHANG_FEEL = {
  /** Trunk length, times each elephant's own (Mali 2.6 m, Khanom 1.9 m). */
  reach: 1,
  /** A trunk goes after food held within this many trunk lengths of its root (beyond its reach, it strains). */
  notice: 1.3,
  /** How fast a trunk tip chases its target (per second; lower is lazier and more snake-like). Khanom is quicker. */
  chase: 4.2,
  chaseBaby: 5.5,
  /** How much the middle of a trunk sags each frame (m): it hangs and curls instead of poking like a rod. */
  droop: 0.035,
  /** The tip grabs food this close (m, scaled a little with the elephant). */
  grab: 0.3,
  /** Seconds to curl food up to the mouth, and to munch it. */
  curl: 0.7,
  munch: 1.1,
  /** Held food rides this far above her finger (px), so her finger doesn't hide it. */
  lift: 40,
  /** A tapped food glides to its trunk at this rate (per second). */
  glide: 5,
  /** Seconds food lies on the gravel out of reach before Daddy pops it back in the basket. */
  ground: 1.6,
  /** Foods in `feed` before the elephants start asking for favorites, and in `lamyai` before they're full (the splash). */
  toFavorites: 8,
  toSplash: 12,
  /** Seconds of still hands before Khanom sneaks a sip of her chocolate milk, and the rest between sneaks. */
  sneakAfter: 3,
  sneakRest: 6,
  /** Foods in a row (within `burpWindow` seconds) before Mali burps. */
  burp: 3,
  burpWindow: 9,
}
export type ChangFeel = typeof CHANG_FEEL
