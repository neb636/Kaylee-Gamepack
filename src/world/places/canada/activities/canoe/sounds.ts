// Red Canoe's recorded sounds (prompts: sfx/parts/canoe.json; the `sfx` skill), each over its old synth sound, which
// plays until the clip is made (kit/clips.ts). The game (paddle.ts) and the chapter's films (story/films/canoe.ts) use
// them. No three.js here.
import { sounds } from '../../../../../sdk'
import { bed, clip, held, playClip } from '../../../../kit/clips'
import { noise, sfx, tone } from '../../../../kit/sfx'
import { url } from '../../sfx'

/** The loon's laugh, as a synth: a quick wobbling tremolo (with the long wail first, `wail`). */
function synthLaugh(wail = false) {
  const d = wail ? 0.95 : 0
  if (wail) {
    tone(520, 880, 0.45, 0.05, 'sine')
    tone(880, 760, 0.5, 0.05, 'sine', 0.45)
  }
  for (let i = 0; i < 9; i++) tone(i % 2 ? 1080 : 940, i % 2 ? 1000 : 1020, 0.075, 0.045, 'sine', d + i * 0.09)
}

/** The chick's squeak, as a synth (`vol` 0..1). */
const synthChick = (vol: number) => [0, 0.13].forEach((d, i) => tone(2600 + i * 400, 3300 + i * 300, 0.08, 0.05 * vol, 'sine', d))

const laugh = clip(url('canoe-loon'), () => synthLaugh(false))

export const snd = {
  /** A paddle stroke: the blade dips in and pulls (two takes, one stroke each). */
  stroke: clip(url('canoe-stroke-1'), () => noise(0.32, 0.07, 'bandpass', 900, 320, 0, 1.4), { vol: 0.7, jitter: 0.06 }),
  stroke2: clip(url('canoe-stroke-2'), () => noise(0.32, 0.07, 'bandpass', 800, 300, 0, 1.4), { vol: 0.7, jitter: 0.06 }),
  /** Drips off the blade as it comes out (synth only: tiny). */
  drip: () => tone(1900, 1300, 0.05, 0.025, 'sine', 0.05 + Math.random() * 0.1),
  /** The hull hissing through the water, louder the faster (call it every frame while it glides). */
  glide: held(url('canoe-glide'), (_speed: number) => {}, (speed: number) => ({ vol: Math.min(0.5, 0.12 + speed * 0.07), rate: 0.9 + speed * 0.04 })),
  /** A soft bump on the pebbles. */
  bump: clip(url('canoe-bump'), () => noise(0.12, 0.12, 'bandpass', 600, 300, 0, 1.5)),
  /** A little plop: her tap on the water. */
  plop: clip(url('canoe-plop'), () => noise(0.1, 0.08, 'bandpass', 1600, 800), { vol: 0.6 }),
  /** The duck family quacks (and the ducklings peep). */
  ducks: clip(url('canoe-ducks'), () => [0, 0.16].forEach((d) => tone(560, 430, 0.11, 0.05, 'square', d))),
  /** A trout leaps out and plops back in. */
  trout: clip(url('canoe-trout'), () => sfx.splash()),
  /** Lulu's laugh: the loon's quick tremolo. `wail` adds her long call first (the recorded one: story/sounds.ts loon). */
  laugh: (wail = false) => (wail ? synthLaugh(true) : laugh()),
  /** Her chick tries to sing too: a tiny squeak. */
  chick: clip(url('canoe-chick'), () => synthChick(1)),
  /** The lost chick peeping from the milky water: quiet far away, louder as the canoe comes near (0 far .. 1 close). */
  peep: (near: number) => {
    const vol = 0.12 + 0.88 * near * near
    if (!playClip(url('canoe-chick'), { vol, rate: 1.05 + Math.random() * 0.1 })) synthChick(vol)
  },
  /** Lulu's song, long and lovely (the films' recorded call). */
  song: clip(url('story-loon'), () => synthLaugh(true), { jitter: 0.02 }),
  /** The glacier sings it back: the same call, fainter and a little lower, after `delay` seconds. */
  echo: (delay: number, vol: number) => {
    if (!playClip(url('story-loon'), { vol, rate: 0.96, delay })) tone(620, 860, 0.5, 0.06 * vol, 'sine', delay)
  },
  /** The glacier stream tumbling into the lake (when she finds the milky water). */
  stream: clip(url('canoe-stream'), () => noise(1.2, 0.06, 'bandpass', 1400, 900, 0, 0.8)),
  /** The creek and its waterfall, louder the nearer the canoe is (call it every frame while it can be heard: 0 far,
   *  1 right by the mouth). No synth: it's only ambience. */
  creek: held(url('canoe-creek'), (_near: number) => {}, (near: number) => ({ vol: 0.05 + near * near * 0.45 }), { linger: 0.4, fade: 1 }),
  /** An ice chunk cracks off the glacier and splashes down. */
  ice: clip(url('canoe-ice'), () => {
    noise(0.14, 0.25, 'highpass', 2400, 900)
    tone(80, 45, 0.9, 0.16, 'sine', 0.05)
  }),
  /** Sparkles on the milky water. */
  sparkle: () => sounds.sparkle(),
  /** The still mountain lake (the game's bed; returns its stop()). */
  lake: (vol = 0.3) => bed(url('canoe-lake'), vol),
}
