// Every number that decides how Baan Chang Cafe feels, in one place, so a greybox playtest can be tuned quickly.
// Distances are in stage units (the wide stage is 1600 x 1000, the tall one 1000 x 1400).
export const FEEL = {
  // ---- The cafe: grab and tilt to pour ----
  /** A pot starts tipping when it is this far above the glass's rim (and near it sideways). */
  tiltZone: 200,
  /** Full tilt, in degrees. */
  tiltMax: 105,
  /** How fast a pot follows its tilt (per second). */
  tiltEase: 9,
  /** Liquid comes out past this tilt (0..1). */
  pourFrom: 0.35,
  /** Glass filled per second at full tilt (a whole glass is 1). */
  pourRate: 0.42,
  /** The syrup bottle squeezes slower. */
  syrupRate: 0.18,
  /** Enough of each to move on. */
  coffee: 0.35,
  milk: 0.15,
  coffeeFull: 0.7,
  cocoaMilk: 0.5,
  syrup: 0.1,
  /** Spoon travel inside the glass (stage units) that mixes the chocolate in. */
  stir: 1500,
  ice: 3,

  // ---- The yard: hold food out to a trunk ----
  segments: 12,
  /** She's holding food within this many trunk lengths: the trunk reaches for it. */
  notice: 2.1,
  /** The trunk tip grabs food this close (scaled with the elephant). */
  grab: 70,
  /** How fast a trunk tip chases its target (per second). Lower is lazier and more snake-like. */
  tipChase: 6,
  /** Seconds for a trunk to curl food up to the mouth, and to munch it. */
  curl: 0.6,
  munch: 0.8,
  /** Bananas to feed before the elephants start asking for favorites. */
  bananas: 6,
  /** The baby wanders this far each way (stage units) at this speed (per second). */
  babyWander: 70,
  babySpeed: 0.35,
  /** Idle seconds before the baby sneaks a sip of her chocolate milk, and the pause between sips. */
  sneakAfter: 4,
  sneakRest: 7,
  /** Seconds without progress before Sparkle repeats the prompt. */
  stuck: 8,
  /** The payoff shower lasts this long before the stamp. */
  shower: 7,
} as const
