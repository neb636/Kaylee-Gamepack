// The story films' sounds (story/stage.ts): recorded clips from the Poles' sfx folder over synth fallbacks
// (kit/clips.ts), a wind bed for each set, and the films' music cue. `stop()` ends whatever is still playing when a
// film ends or is skipped.
import { sounds } from '../../../../sdk'
import { bed, clip, cue } from '../../../kit/clips'
import { noise, sfx, tone } from '../../../kit/sfx'
import { url } from '../sfx'

let stops: (() => void)[] = []

export const storySfx = {
  splash: clip(url('story-splash'), () => sfx.splash()),
  /** Something small pops out (Pebble from the crate, a seal from a hole). */
  pop: clip(url('story-pop'), () => sfx.pop()),
  /** A soft thump on snow or ice. */
  thump: clip(url('story-thump'), () => sfx.thump()),
  /** Wings swooping in. */
  swoop: clip(url('story-swoop'), () => noise(0.5, 0.1, 'bandpass', 700, 2600, 0, 1.4)),
  /** The red ship's horn: two friendly toots. */
  horn: clip(url('story-horn'), () => [0, 0.5].forEach((d) => tone(196, 190, 0.38, 0.14, 'sawtooth', d))),
  /** A wooden crate creaks and knocks. */
  crate: clip(url('story-crate'), () => sfx.chomp()),
  /** A happy sparkle (a hug, the reunion). */
  chime: clip(url('story-chime'), () => sounds.sparkle()),
  /** A whale's whistle and a blow of spray. */
  whale: clip(url('story-whale'), () => tone(520, 880, 0.5, 0.1, 'sine')),
  /** A little snore (Pebble asleep in the crate). */
  snore: clip(url('story-snore'), () => tone(140, 90, 0.6, 0.08, 'triangle')),
  /** A crowd of penguins gasping and honking. */
  gasp: clip(url('story-gasp'), () => [0, 0.08, 0.16].forEach((d) => tone(420 + d * 900, 300, 0.2, 0.08, 'square', d))),
  /** An emperor penguin's trumpeting call. */
  call: clip(url('story-call'), () => [0, 0.14, 0.28].forEach((d) => tone(700, 520, 0.12, 0.1, 'square', d))),
  /** The balloon's burner: a soft roar. */
  burner: clip(url('story-burner'), () => noise(0.9, 0.12, 'lowpass', 500, 900)),
  /** The ending's films (planning/around-the-world/poles-ending.md). An egg cracks (the memory). */
  crack: clip(url('huddle-crack'), () => tone(2400, 1800, 0.05, 0.06, 'square')),
  /** A whole colony cheering, and a gust. */
  cheer: clip(url('party-cheer'), () => sounds.fanfare()),
  gust: clip(url('party-gust'), () => noise(0.9, 0.1, 'bandpass', 400, 1600)),
  /** A whoosh of light (the sun coming up, the screen splitting). */
  hug: clip(url('party-hug'), () => sounds.sparkle()),
  /** The blizzard, until the film ends. */
  blizzard() {
    stops.push(bed(url('party-blizzard'), 0.4))
  },
  /** The colony far off, until the film ends. */
  colony() {
    stops.push(bed(url('party-colony'), 0.3))
  },
  /** The wind over the ice, until the film ends. */
  wind(night = false) {
    stops.push(bed(url(night ? 'story-wind-night' : 'story-wind'), night ? 0.3 : 0.22))
  },
  /** The films' music: `gentle` for the story being told, `happy` for a meeting or a goodbye. */
  music(kind: 'gentle' | 'happy' = 'gentle') {
    stops.push(cue(url(kind === 'happy' ? 'story-music-happy' : 'story-music'), 0.42))
  },
  stop() {
    for (const s of stops) s()
    stops = []
  },
}
