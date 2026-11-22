// The story films' sounds (story/stage.ts): recorded clips from Canada's sfx folder over synth fallbacks
// (kit/clips.ts), the films' music cues and a bed for a set's air. `stop()` ends whatever is still playing when a film
// ends or is skipped. A chapter's own film sounds go here too, under its name (one line each, in its own block), with
// its prompts in sfx/parts/<chapter>.json.
import { sounds } from '../../../../sdk'
import { bed, clip, cue } from '../../../kit/clips'
import { noise, sfx, tone } from '../../../kit/sfx'
import { url } from '../sfx'

/** The music under a film: the story being told, a friend joining, the big game. */
export type Music = 'story' | 'happy' | 'game'

let stops: (() => void)[] = []

export const storySfx = {
  // ---- Shared by every film.
  /** Something small pops up or out. */
  pop: clip(url('story-pop'), () => sfx.pop()),
  /** A soft thump on snow. */
  thump: clip(url('story-thump'), () => sfx.thump()),
  /** A happy sparkle: a friend joins the team. */
  chime: clip(url('story-chime'), () => sounds.sparkle()),
  /** A splash of water. */
  splash: clip(url('story-splash'), () => sfx.splash()),
  /** Something whooshes past (a goose, a puck, a snowball). */
  whoosh: clip(url('story-whoosh'), () => sounds.whoosh()),
  /** Something bounces off something soft and round: boing. */
  boing: clip(url('story-boing'), () => sfx.boing()),
  /** A bonk on something hard (antlers, a goalpost). */
  bonk: clip(url('story-bonk'), () => tone(220, 140, 0.12, 0.14, 'triangle')),

  // ---- The canal (the way in, the big game).
  /** One goose honks; a whole team honks. */
  honk: clip(url('story-honk'), () => tone(480, 380, 0.16, 0.12, 'sawtooth')),
  honks: clip(url('story-honks'), () => [0, 0.14, 0.3, 0.42].forEach((d) => tone(440 + d * 300, 360, 0.14, 0.09, 'sawtooth', d))),
  /** Skates carving the ice; a skid to a stop in a spray of snow. */
  skate: clip(url('story-skate'), () => noise(0.35, 0.06, 'highpass', 3000, 5000)),
  skid: clip(url('story-skid'), () => noise(0.5, 0.1, 'bandpass', 1800, 4200)),
  /** A puck slapped; a puck thumping into a net. */
  slap: clip(url('story-slap'), () => tone(900, 300, 0.07, 0.14, 'square')),
  net: clip(url('story-net'), () => sfx.thump()),
  /** Maple sits down on her tail. */
  plop: clip(url('story-plop'), () => sfx.thump()),
  /** The golden cup glints. */
  glint: clip(url('story-glint'), () => sounds.sparkle()),
  /** Sparkle's balloon: a soft roar of the burner. */
  burner: clip(url('story-burner'), () => noise(0.9, 0.12, 'lowpass', 500, 900)),
  /** A crowd of animals cheering. */
  cheer: clip(url('story-cheer'), () => sounds.fanfare()),
  /** Lulu's call, long and lovely, over the ice. */
  loon: clip(url('story-loon'), () => [0, 0.5].forEach((d) => tone(620, 880, 0.5, 0.1, 'sine', d))),

  /** A set's air, until the film ends: `winter` (cold wind over the canal), `forest`, `night` (crickets, an owl far
   *  off), `lake`, `rain` (the rainforest), `sea`. */
  air(kind: 'winter' | 'forest' | 'night' | 'lake' | 'rain' | 'sea', vol = 0.24) {
    stops.push(bed(url(`story-air-${kind}`), vol))
  },
  /** The films' music. */
  music(kind: Music) {
    stops.push(cue(url(`story-music-${kind}`), 0.4))
  },
  stop() {
    for (const s of stops) s()
    stops = []
  },
}
