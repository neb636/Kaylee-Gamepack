// Penguin songs for the Poles' story, ending, and Emperor Huddle.
import { audio } from '../../../../kit/sfx'

/** A song: its notes as [semitones above the singer's low note, beats]. */
export type Tune = readonly (readonly [number, number])[]

/** Six songs that sound nothing alike (a climb, a slide down, a woodpecker, a seesaw, long-short-short-long, a hiccup):
 *  different shapes and different rhythms, so a five-year-old can tell them apart. The first is Papa's. */
export const TUNES: readonly Tune[] = [
  [[0, 1], [4, 1], [7, 1], [12, 2]],
  [[12, 1], [7, 1], [4, 1], [0, 2]],
  [[7, 0.5], [7, 0.5], [7, 0.5], [7, 0.5], [7, 1.5]],
  [[0, 1], [9, 1], [0, 1], [9, 1.5]],
  [[5, 2], [9, 0.5], [9, 0.5], [2, 2]],
  [[10, 0.5], [0, 1.5], [10, 0.5], [0, 1.5]],
]
/** Seconds a beat lasts. */
export const BEAT = 0.26
export const tuneSeconds = (tune: Tune) => tune.reduce((s, [, b]) => s + b, 0) * BEAT
/** Which note of a tune is sounding `at` seconds in (-1: none), and how far through it (0..1). */
export function noteAt(tune: Tune, at: number): [index: number, k: number] {
  let t = 0
  for (let i = 0; i < tune.length; i++) {
    const d = tune[i][1] * BEAT
    if (at >= t && at < t + d) return [i, (at - t) / d]
    t += d
  }
  return [-1, 0]
}

const hz = (semi: number, base: number) => base * 2 ** (semi / 12)

/** Plays a tune. `who`: a grown-up emperor (a buzzy two-reed trumpet around middle C) or a chick (the same tune as a
 *  peep, an octave up). `pan` -1..1: where the singer stands; `vol` scales it (a call through the blizzard is softer). */
export function sing(tune: Tune, who: 'papa' | 'chick', pan = 0, vol = 1) {
  const a = audio()
  if (!a) return
  const out = a.createStereoPanner ? a.createStereoPanner() : null
  if (out) {
    out.pan.value = Math.max(-1, Math.min(1, pan))
    out.connect(a.destination)
  }
  const dest = out ?? a.destination
  let t = a.currentTime + 0.03
  for (const [semi, beats] of tune) {
    const dur = beats * BEAT
    const f = hz(semi, who === 'papa' ? 262 : 524)
    const voices: [OscillatorType, number, number][] = who === 'papa' ? [['sawtooth', 1, 0.05], ['square', 1.012, 0.035], ['square', 2, 0.012]] : [['triangle', 1, 0.09], ['sine', 2, 0.02]]
    for (const [type, mult, level] of voices) {
      const o = a.createOscillator()
      const g = a.createGain()
      o.type = type
      // Each note scoops up into its pitch, like a honk (a chick's peep chirps up further).
      o.frequency.setValueAtTime(f * mult * (who === 'papa' ? 0.94 : 0.86), t)
      o.frequency.exponentialRampToValueAtTime(f * mult, t + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(level * vol, t + 0.02)
      g.gain.setValueAtTime(level * vol, t + dur * 0.7)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95)
      // A grown-up's call warbles.
      if (who === 'papa') {
        const lfo = a.createOscillator()
        const depth = a.createGain()
        lfo.frequency.value = 26
        depth.gain.value = f * 0.02
        lfo.connect(depth).connect(o.frequency)
        lfo.start(t)
        lfo.stop(t + dur)
      }
      o.connect(g).connect(dest)
      o.start(t)
      o.stop(t + dur)
    }
    t += dur
  }
  // timers-ok: disconnects an audio node after its sound has played out; nothing in the game is touched.
  if (out) setTimeout(() => out.disconnect(), (t - a.currentTime + 0.5) * 1000)
}
