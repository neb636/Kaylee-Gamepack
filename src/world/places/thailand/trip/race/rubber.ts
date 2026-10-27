// The races' rubber banding (the boat race, the Nan Mountain Cup), pure math: each rival follows a script of where it
// wants to be against her through the race (meters ahead of her, negative behind), and goes as fast as she does plus
// a pull toward that gap. So the race tells the same story however she drives: they lead off the start, she catches
// them, someone is right beside her at the end.
//
// The end decides who wins:
// - She wins (the boat race, and two of the Cup's three races): near the line every rival eases off alongside her, and
//   none can cross it first.
// - A rival wins by a nose (one Cup race, on purpose): its script ends a little ahead of her, it may cross first, and
//   herLimit() holds her just behind it on the last stretch. Everyone else still eases off, so she's always second,
//   never last.

/** Where a rival wants to be through the race: [f, gap], `f` 0 (the start) .. 1 (the line), `gap` meters ahead of her
 *  (negative: behind), straight lines between them. */
export type Script = [f: number, gap: number][]

/** The gap a script wants at `f`. */
export function scripted(script: Script, f: number) {
  for (let i = 1; i < script.length; i++)
    if (f <= script[i][0]) {
      const [f0, g0] = script[i - 1]
      const [f1, g1] = script[i]
      return g0 + ((g1 - g0) * (f - f0)) / (f1 - f0)
    }
  return script[script.length - 1][1]
}

export interface PaceIn {
  /** The gap its script wants now, and the gap now (meters ahead of her). */
  want: number
  gap: number
  /** How fast she's getting on along the course (m/s, smoothed), and the least it ever counts as. */
  herRate: number
  floor: number
  /** How hard it closes on its script: m/s per meter off. */
  pull: number
  /** Meters left to the line for it. */
  rem: number
  /** How far from the line it starts easing off beside her (when it may not win). */
  easeAt: number
  /** It's the one meant to win this race. */
  winner: boolean
}

/** The speed a rival aims for (m/s). Not the winner: never past her near the line (it eases off alongside), and never
 *  over it first (it waits just short). */
export function rivalPace(o: PaceIn) {
  let vt = Math.max(o.herRate, o.floor) + o.pull * (o.want - o.gap)
  if (!o.winner) {
    if (o.rem < o.easeAt && o.gap > -1.2) vt = Math.min(vt, o.herRate * 0.85)
    if (o.rem < 3) vt = 0
  }
  return vt
}

/** A rival is meant to win: her speed limit on the last stretch, as a share of her top speed (1 = none). Within
 *  `within` meters of the line, if she's level with the winner or ahead of it (its `gap` is under `lead`), she can't
 *  go quite as fast as it does, so it edges past and crosses first by a nose. */
export function herLimit(o: { gap: number; rem: number; within: number; lead: number; itsSpeed: number; top: number }) {
  if (o.rem > o.within || o.gap >= o.lead) return 1
  // The further ahead she is, the more she eases (never below half speed: she keeps racing, just not quite as fast).
  const behind = o.lead - o.gap
  return Math.max(0.5, Math.min(1, (o.itsSpeed - 0.6 - 0.15 * behind) / Math.max(1, o.top)))
}
