// One budget for every "stuck" hint in the app, so Sparkle doesn't nag. Every idle-hint timer asks `spendHint(line)`
// before it speaks; the answer is counted per visit to the app (not per screen), so coming back to a map or starting a
// round again doesn't refill it:
// - the first time a hint comes up it is only shown (the glow, the finger, Sparkle's bubble): no voice, because she
//   almost always just heard that instruction;
// - the next HINT_SPOKEN times it is said out loud, at least HINT_GAP_S apart from any other spoken hint;
// - after that it's shown only, for the rest of the visit.
// Hubs and free-play toys (maps, the house, the globe, the train) don't speak hints at all: they only glow.
import { lineText, type Line } from './speech'

/** Spoken times per hint line per visit, after the first silent one. */
export const HINT_SPOKEN = 2
/** Seconds between any two spoken hints. */
export const HINT_GAP_S = 25

const seen = new Map<string, number>()
let lastSpoken = -Infinity

/** True when this hint may be said out loud now (and counts it); false: show it without a voice. */
export function spendHint(line: Line): boolean {
  const key = lineText(line)
  const n = seen.get(key) ?? 0
  seen.set(key, n + 1)
  if (n === 0 || n > HINT_SPOKEN) return false
  const now = performance.now()
  if (now - lastSpoken < HINT_GAP_S * 1000) {
    // Too soon after another hint: this one doesn't count as spoken.
    seen.set(key, n)
    return false
  }
  lastSpoken = now
  return true
}

const greeted = new Set<string>()

/** True the first time `key` comes up in this visit to the app (a welcome or menu line that shouldn't replay). */
export function firstTime(key: string): boolean {
  if (greeted.has(key)) return false
  greeted.add(key)
  return true
}
