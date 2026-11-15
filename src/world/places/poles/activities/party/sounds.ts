// The finale's sounds: recorded clips from the Poles' sfx folder (sfx/parts/party.json lists them) over synth
// fallbacks (kit/clips.ts), and the penguins' songs, which are always synthesized: a song is a few notes, and the game
// is telling them apart, so each papa's tune is played from its notes (a buzzy reed for a grown-up emperor, a peep an
// octave up for a chick), a little to the left or right, where he stands.
import { sounds } from '../../../../../sdk'
import { bed, clip } from '../../../../kit/clips'
import { audio, noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

export const partySfx = {
  /** Terry gulps a fish. */
  fish: clip(url('party-fish'), () => tone(520, 260, 0.12, 0.05, 'triangle')),
  /** Through a cloud. */
  cloud: clip(url('party-cloud'), () => tone(500, 900, 0.3, 0.06, 'triangle')),
  /** A whale blows. */
  whale: clip(url('party-whale'), () => (noise(0.7, 0.1, 'bandpass', 900, 2400, 0, 1.2), tone(240, 420, 0.5, 0.05, 'sine'))),
  /** The albatross's creaky call. */
  albatross: clip(url('party-albatross'), () => [0, 0.16].forEach((d) => tone(880, 620, 0.14, 0.05, 'sawtooth', d))),
  /** The balloon's burner. */
  burner: clip(url('party-burner'), () => noise(0.7, 0.12, 'lowpass', 500, 900)),
  /** A gust of the southern wind. */
  gust: clip(url('party-gust'), () => tone(300, 180, 0.6, 0.04, 'sawtooth')),
  /** A new part of the world comes up. */
  leg: clip(url('party-leg'), () => sounds.whoosh()),
  /** A penguin steps forward on the snow. */
  step: clip(url('party-step'), () => sfx.thump()),
  /** A puff of kicked snow. */
  snow: clip(url('party-snow'), () => noise(0.25, 0.07, 'highpass', 1800, 3200)),
  /** A deep, polite bow. */
  bow: clip(url('party-bow'), () => tone(520, 300, 0.3, 0.05, 'triangle')),
  /** A chick pops out from under a papa. */
  peek: clip(url('party-peek'), () => sfx.pop()),
  /** The colony shuffles away from the polar bear. */
  shuffle: clip(url('party-shuffle'), () => [0, 0.08, 0.16, 0.24].forEach((d) => noise(0.06, 0.05, 'highpass', 2400, 2400, d))),
  /** Found: a hug. */
  hug: clip(url('party-hug'), () => sounds.sparkle()),
  /** The whole colony cheers. */
  cheer: clip(url('party-cheer'), () => sounds.fanfare()),
  /** The colony in the background (until stopped). */
  colony: () => bed(url('party-colony'), 0.16),
  /** The blizzard (until stopped). */
  blizzard: () => bed(url('party-blizzard'), 0.34),
}

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
  if (out) setTimeout(() => out.disconnect(), (t - a.currentTime + 0.5) * 1000)
}
